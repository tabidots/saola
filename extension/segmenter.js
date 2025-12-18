import { getData } from './data-loader.js';
import { fixTonePlacement } from '../shared/utils.js';

const NAME_COLLISIONS = new Set([
    'An Phong', 'An Nam', 'An Huy', 'Bình Phước', 'Bình Định', 'Bình Đông',
    'Châu Hải', 'Cần Thơ', 'Cẩm Lệ', 'Cẩm Xuyên', 'Gia Nghĩa', 'Gia Định',
    'Hoa Kỳ', 'Hoa Đông', 'Hoà Hảo', 'Hoà Bình', 'Huệ Châu', 'Hà Nam',
    'Hà Tĩnh', 'Hà Tiên', 'Hương Sơn', 'Hải An', 'Hải Nam', 'Hải Vân',
    'Hải Châu', 'Hằng Nga', 'Khải Huyền', 'Kiên Hải', 'Long An', 'Lý Sơn',
    'Lĩnh Nam', 'Nam Kỳ', 'Nam Hà', 'Nam Định', 'Nam Phi', 'Ngân Hà',
    'Ngọc Lân', 'Ngọc Linh', 'Phước Sơn', 'Quý Châu', 'Quảng Châu',
    'Quảng Nam', 'Quảng Tây', 'Quảng Đông', 'Quảng Bình', 'Sơn Đông',
    'Sơn Trà', 'Sơn Tây', 'Thanh Hải', 'Thanh Long', 'Thiên Nga',
    'Thiên Sơn', 'Thiên Long', 'Thiên Bình', 'Thiên Hậu', 'Thiên Cầm',
    'Thuỵ Sĩ', 'Thái Bình', 'Thái Sơn', 'Thường Nga',
    'Trà Vinh', 'Trường Sơn', 'Trường Thành', 'Tây Đức', 'Tây An', 'Tây Phi',
    'Tây Sơn', 'Vinh Sơn', 'Vân Nam', 'Xuân Thu', 'Đài Đông', 'Đài Sơn',
    'Đài Loan', 'Đài Nam', 'Đông Du', 'Đông Đức', 'Đông Phi', 'Đông Sơn',
    'Đồng Xuân'
]);

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
    const regex = /([\p{L}\p{M}\p{Nd}-]+)|(\S)/gu;
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
        this.freqCache = new Map();  // normalizedPhrase -> {found, frequency, variation}
        this.maxSegmentLength = 7;   // originally 5
        this.audioCache = new Map(); // comp -> boolean, for names
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

            for (let len = 1; len <= Math.min(this.maxSegmentLength, n - i); len++) {
                const phraseTokens = wordTokens.slice(i, i + len);

                // Reconstruct phrase from tokens (handles spaces between them)
                const startPos = phraseTokens[0].start;
                const endPos = phraseTokens[phraseTokens.length - 1].end;
                const rawText = normalizeVietnamese(text.substring(startPos, endPos));

                // Check if phrase exists in dictionary (case-aware)
                let { found, frequency, canonical, primaryMatch, secondaryMatch } =
                    this.getBestMatchingHeadword(rawText);

                if (!found && rawText.includes('-')) {
                    ({ found, frequency, canonical, primaryMatch, secondaryMatch } =
                        this.getBestMatchingHeadword(rawText.replace(/-/g, ' ')));
                }

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
            const primaryEntry = bt.primaryMatch ? vnEn[bt.primaryMatch] : null;
            const isNameComponent = bt.phraseLength === 1 && hasCapital(rawText) && primaryEntry?.lexemes.some(lexeme => {
                return lexeme.pos === 'proper noun' &&
                    (lexeme.senses.find(s => s.gloss.includes('given name')) ||
                        lexeme.senses.find(s => s.gloss.includes('surname')) ||
                        lexeme.senses.find(s => s.gloss.includes('name')));
            });
            const secondaryEntry = bt.secondaryMatch ? vnEn[bt.secondaryMatch] : null;

            segments.unshift({
                text: rawText,
                canonical: bt.canonical,
                start: bt.startPos,
                end: bt.endPos,
                wordCount: bt.phraseLength,
                hasAudio: primaryEntry?.has_audio,
                frequency: bt.frequency,
                isUnknown: !bt.found,
                isNameComponent: isNameComponent,
                entries: [primaryEntry, secondaryEntry].filter(Boolean)
            });

            idx = bt.prevIndex;
        }

        console.log('Segmented:', segments.map(s => s.text).join(' | '));
        return this.mergeNameSegments(segments);
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

    mergeNameSegments(segments) {

        const isNameComponent = (curSegment, prevSegment = null) => {
            if (curSegment.isNameComponent) return true;
            if (!prevSegment) return false;
            if (prevSegment.entries?.[0]?.lexemes.some(
                    lexeme => lexeme.senses.some(
                        s => s.gloss.includes('surname')) &&
                NAME_COLLISIONS.has(curSegment.canonical))) {
                    
                return true;
            }
            return false;
        }

        const result = [];
        let i = 0;

        while (i < segments.length) {
            // Collect consecutive name components
            const nameComponents = [];
            while (i < segments.length && nameComponents.length < 4) {

                const prevSegment = i > 0 ? segments[i - 1] : null;

                if (isNameComponent(segments[i], prevSegment)) {
                    nameComponents.push(segments[i]);
                    i++;
                } else {
                    break;
                }
            }

            // If we found 2+ name components, merge them
            if (nameComponents.length >= 2) {
                result.push(this.createNameSegment(nameComponents));
            }
            // If we found just 1 name component, keep it as-is
            else if (nameComponents.length === 1) {
                result.push(nameComponents[0]);
            }
            // Non-name segment
            else if (i < segments.length) {
                result.push(segments[i]);
                i++;
            }
        }

        return result;
    }

    nameHasAudio(segments) {
        const { vnEn } = getData();

        for (const seg of segments) {
            const components = seg.canonical.split(' ');

            for (const comp of components) {
                if (this.audioCache.has(comp)) {
                    if (!this.audioCache.get(comp)) return false;
                    continue;
                }
                const { primaryMatch } = this.getBestMatchingHeadword(comp);
                const entry = primaryMatch ? vnEn[primaryMatch] : null;
                const hasAudio = entry?.has_audio ?? false;
                this.audioCache.set(comp, hasAudio);
                if (!hasAudio) return false;
            }
        }
        return true;
    }

    createNameSegment(segments) {
        const first = segments[0];
        const last = segments[segments.length - 1];
        const canonical = segments.map(s => s.canonical).join(' ');

        // Prevent cases like "/waːŋ˨˩ vaŋ˧˧ ~ jaŋ˧˧ jʊwŋ͡m˧˧/"
        const trimIPAAlts = (str) => {
            const parts = str.split(' ~ ');
            return parts[0];
        };
        
        return {
            text: segments.map(s => s.text).join(' '),
            canonical: canonical,
            start: first.start,
            end: last.end,
            wordCount: segments.length,
            frequency: 0, // doesn't matter
            hasAudio: segments.every(s => s.hasAudio) || this.nameHasAudio(segments),
            isMergedName: true, // necessary for handling audio playback
            entries: [
                {
                    word: canonical,
                    ipa_hn: segments.map(s => trimIPAAlts(s.entries[0]?.ipa_hn || '')).join(' '),
                    ipa_sg: segments.map(s => trimIPAAlts(s.entries[0]?.ipa_sg || '')).join(' '),
                    phonetic_hn: segments.map(s => trimIPAAlts(s.entries[0]?.phonetic_hn || '')).join(' '),
                    phonetic_sg: segments.map(s => trimIPAAlts(s.entries[0]?.phonetic_sg || '')).join(' '),
                    lexemes: [
                        {
                            pos: 'name', 
                            senses: [
                                {
                                    gloss: 'personal name'
                                }
                            ]
                        }
                    ]
                }
            ],
        };
    }
}