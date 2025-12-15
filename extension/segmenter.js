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

export function generateUniqueVariations(phrase) {
    const variations = [
        phrase,
        phrase.charAt(0).toLowerCase() + phrase.slice(1),
        phrase.toLowerCase()
    ];
    return [...new Set(variations)];
}

export class TextSegmenter {
    /**
     * Segment text to minimize number of segments (prefer longer phrases)
     * Use aggregate frequency as tiebreaker
     */
    constructor() {
        this.freqCache = new Map(); // normalizedPhrase -> {found, maxFreq, variation}
    }

    getHeadwordFrequency(headword) {
        if (this.freqCache.has(headword)) {
            return this.freqCache.get(headword);
        }

        const { vnIndex, vnEn } = getData();
        let bestResult = { found: false, maxFreq: 0, variation: null };

        const uniqueVariations = generateUniqueVariations(headword);

        for (const variation of uniqueVariations) {
            const indices = vnIndex.get(variation);
            if (indices && indices.size > 0) {
                let maxFreq = 0;
                for (const idx of indices) {
                    const entry = vnEn[idx];
                    if (entry.freq > maxFreq) {
                        maxFreq = entry.freq;
                    }
                }

                // Prefer exact match if available
                if (!bestResult.found || variation === headword) {
                    bestResult = { found: true, maxFreq, variation };
                }
            }
        }

        this.freqCache.set(headword, bestResult);
        return bestResult;
    }

    segment(text) {
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
                const phrase = text.substring(startPos, endPos);
                const normalized = normalizeVietnamese(phrase);

                // Check if phrase exists in dictionary (checking all variations)
                const { found, maxFreq, variation } = this.getHeadwordFrequency(normalized);

                // Allow single unknown words, but block multi-word unknowns
                if (!found && len > 1) continue;

                const newSegmentCount = best[i].segmentCount + 1;
                const newTotalFreq = best[i].totalFreq + maxFreq;

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
                        maxFreq: maxFreq,
                        found: found,
                        startPos: startPos,
                        endPos: endPos,
                        bestVariation: variation || normalized // Store which variation matched
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
                maxFreq: 0,
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

            const phrase = text.substring(bt.startPos, bt.endPos);
            const normalized = normalizeVietnamese(phrase);

            segments.unshift({
                text: phrase,
                normalized: normalized,
                start: bt.startPos,
                end: bt.endPos,
                wordCount: bt.phraseLength,
                maxFreq: bt.maxFreq,
                isUnknown: !bt.found
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

    // getContext(segments, segmentIndex, contextSize = 2) {
    //     const start = Math.max(0, segmentIndex - contextSize);
    //     const end = Math.min(segments.length, segmentIndex + contextSize + 1);
    //     return segments.slice(start, end);
    // }
}