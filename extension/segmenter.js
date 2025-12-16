import { getData } from './data-loader.js';
import { fixTonePlacement } from '../shared/utils.js';

function normalizeVietnamese(text) {
    let normalized = text;
    if (normalized.length > 1 && normalized === normalized.toUpperCase()) {
        normalized = normalized.toLowerCase();
    }
    return fixTonePlacement(normalized);
}

function tokenizeWithPositions(text) {
    const tokens = [];
    // Match words or single non-word characters
    const regex = /([\p{L}\p{M}\p{Nd}]+)|(\S)/gu;
    let match;

    while ((match = regex.exec(text)) !== null) {
        const isWord = match[1] !== undefined; // First capture group is words
        tokens.push({
            text: match[0],
            start: match.index,
            end: match.index + match[0].length,
            isWord: isWord
        });
    }

    return tokens;
}

function hasCapital(text) {
    return text !== text.toLowerCase();
}

export class TextSegmenter {
    /**
     * Segment text to minimize number of segments (prefer longer phrases)
     * Use aggregate frequency as tiebreaker
     */
    constructor() {
        this.freqCache = new Map(); // normalizedPhrase -> {found, frequency, variation}
    }

    getBestMatchingHeadword(rawText) {
        if (this.freqCache.has(rawText)) {
            return this.freqCache.get(rawText);
        }

        const { lowercaseIndex } = getData();
        const lowercaseRaw = rawText.toLowerCase();
        const canonicalForms = lowercaseIndex.get(lowercaseRaw);

        let result = {
            found: false,
            canonical: null,
            frequency: 0,
            primaryMatch: null,
            secondaryMatch: null
        };

        if (!canonicalForms || canonicalForms.length === 0) {
            this.freqCache.set(rawText, result);
            return result;
        }

        // Since max 2 canonical forms: one lowercase, one with capitals
        const lowercaseForm = canonicalForms.find(cf => !hasCapital(cf.canonical));
        const capitalForm = canonicalForms.find(cf => hasCapital(cf.canonical));

        // Decision logic:
        // 1. If text has capitals AND we have a capital canonical form → use it
        // 2. Otherwise → use lowercase canonical form (or capital if that's all we have)

        if (hasCapital(rawText) && capitalForm) {
            result = {
                found: true,
                canonical: capitalForm.canonical,
                frequency: capitalForm.freq,
                primaryMatch: capitalForm.index,
                secondaryMatch: lowercaseForm?.index
            };
        } else {
            // Use lowercase form if available, otherwise use whatever we have
            const bestForm = lowercaseForm || capitalForm || canonicalForms[0];
            const otherForm = canonicalForms.length > 1 ? canonicalForms.find(
                cf => cf.index !== bestForm.index) : null;
            result = {
                found: true,
                canonical: bestForm.canonical,
                frequency: bestForm.freq,
                primaryMatch: bestForm.index,
                secondaryMatch: otherForm?.index
            };
        }

        this.freqCache.set(rawText, result);
        return result;
    }

    segment(text) {
        const { vnEn } = getData();
        const allTokens = tokenizeWithPositions(text);
        const wordTokens = allTokens.filter(t => t.isWord);

        const n = wordTokens.length;
        if (n === 0) return [];

        // DP arrays
        const best = new Array(n + 1).fill(null);
        const backtrack = new Array(n + 1).fill(null);
        best[0] = { segmentCount: 0, totalFreq: 0 };

        // Try all possible segmentations
        for (let i = 0; i < n; i++) {
            if (!best[i]) continue;

            // Try phrases of length 1 to 5 starting at position i
            for (let len = 1; len <= Math.min(5, n - i); len++) {
                const phraseTokens = wordTokens.slice(i, i + len);

                // Reconstruct phrase from tokens (handles spaces between them)
                const startPos = phraseTokens[0].start;
                const endPos = phraseTokens[phraseTokens.length - 1].end;
                const rawText = normalizeVietnamese(text.substring(startPos, endPos));

                // Check if phrase exists in dictionary (case-aware)
                const { found, frequency, canonical, primaryMatch, secondaryMatch } = this.getBestMatchingHeadword(rawText);

                // Allow single unknown words, but block multi-word unknowns
                if (!found && len > 1) continue;

                const newSegmentCount = best[i].segmentCount + 1;
                const newTotalFreq = best[i].totalFreq + frequency;

                // Compare: prefer fewer segments, then higher frequency
                const shouldUpdate = !best[i + len] ||
                    newSegmentCount < best[i + len].segmentCount ||
                    (newSegmentCount === best[i + len].segmentCount &&
                        newTotalFreq > best[i + len].totalFreq);

                if (shouldUpdate) {
                    best[i + len] = {
                        segmentCount: newSegmentCount,
                        totalFreq: newTotalFreq
                    };
                    backtrack[i + len] = {
                        prevIndex: i,
                        phraseLength: len,
                        frequency: frequency,
                        found: found,
                        startPos: startPos,
                        endPos: endPos,
                        canonical: canonical,
                        primaryMatch: primaryMatch,
                        secondaryMatch: secondaryMatch
                    };
                }
            }
        }

        // Ensure we reached the end
        if (!best[n]) {
            console.warn('No valid segmentation found for:', text.substring(0, 50));
            return wordTokens.map(token => ({
                text: token.text,
                normalized: normalizeVietnamese(token.text),
                start: token.start,
                end: token.end,
                wordCount: 1,
                frequency: 0,
                isUnknown: true
            }));
        }

        // Reconstruct the best segmentation
        const segments = [];
        let idx = n;

        while (idx > 0) {
            const bt = backtrack[idx];
            if (!bt) {
                console.error('Backtrack failed at position', idx);
                break;
            }

            const rawText = normalizeVietnamese(text.substring(bt.startPos, bt.endPos));

            segments.unshift({
                text: rawText,
                canonical: bt.canonical,
                start: bt.startPos,
                end: bt.endPos,
                wordCount: bt.phraseLength,
                frequency: bt.frequency,
                isUnknown: !bt.found,
                primaryEntry: bt.primaryMatch ? vnEn[bt.primaryMatch] : null,
                secondaryEntry: bt.secondaryMatch ? vnEn[bt.secondaryMatch] : null
            });

            idx = bt.prevIndex;
        }

        console.log('Segmented:', segments.map(s => s.text).join(' | '));
        return segments;
    }

    findSegmentAtPosition(segments, cursorPos) {
        for (let i = 0; i < segments.length; i++) {
            const seg = segments[i];
            if (cursorPos >= seg.start && cursorPos < seg.end) {
                return { segment: seg, index: i };
            }
        }
        return null;
    }
}