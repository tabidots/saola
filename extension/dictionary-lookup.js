import { getData } from './data-loader.js';
import { normalizeVietnamese, tokenizeWithPositions, extractChunkAroundWord } from './text-utils.js';

export class DictionaryLookup {
    findMatches(container, text, wordInfo) {
        const chunkInfo = extractChunkAroundWord(text, wordInfo.start, wordInfo.end, 5);
        const matches = this.findMatchesInChunk(chunkInfo.chunk, chunkInfo.cursorPosInChunk);

        if (matches.length > 0) {
            matches.sort(this.compareMatches);
            return { matches, chunkInfo };
        }
        return null;
    }

    findMatchesInChunk(chunk, cursorPosInChunk) {
    // Tokenize the chunk
        const tokens = tokenizeWithPositions(chunk);

        if (tokens.length === 0) return matches;

        // Find which token contains the cursor
        let cursorTokenIndex = -1;
        for (let i = 0; i < tokens.length; i++) {
            const token = tokens[i];
            if (cursorPosInChunk >= token.start && cursorPosInChunk < token.end) {
                cursorTokenIndex = i;
                break;
            }
        }

        // If cursor is between tokens, use the previous token
        if (cursorTokenIndex === -1) {
            for (let i = 0; i < tokens.length; i++) {
                if (cursorPosInChunk < tokens[i].start) {
                    cursorTokenIndex = i - 1;
                    break;
                }
            }
            if (cursorTokenIndex === -1) {
                cursorTokenIndex = tokens.length - 1;
            }
        }

        // console.log(`Cursor is on token ${cursorTokenIndex}: "${tokens[cursorTokenIndex]?.text}"`);

        const matches = this.findMatchesCenteredOnToken(tokens, cursorTokenIndex);
        const lookaheadMatches = this.findMatchesCenteredOnToken(tokens, cursorTokenIndex + 1)?.filter(
            (m) => m.startIndex > cursorTokenIndex && m.length > 1
        )
        // if (lookaheadMatches.length > 0) {
        //     console.log(`Lookahead matches: ${lookaheadMatches.map(m => `"${m.phrase}" (${m.length} words)`).join(', ')}`);
        // }

        const frequencyThreshold = lookaheadMatches.length > 0 ? Math.max(...lookaheadMatches.map(m => m.maxFrequency)) : 0;
        // console.log(`Frequency threshold: ${frequencyThreshold}`);

        if (matches.filter(m => m.maxFrequency >= frequencyThreshold).length > 0) {
            return matches.filter(m => m.maxFrequency >= frequencyThreshold);
        } else {
            return matches;
        }
    }

    findMatchesCenteredOnToken(tokens, cursorTokenIndex) {
        const { vnEn, vnIndex } = getData();
    
        const matches = [];
        // Try phrases centered around the cursor token
        // Start with longest phrases that include the cursor token
        for (let phraseLength = 5; phraseLength >= 1; phraseLength--) {
            // Try different starting positions that would include the cursor token
            for (let startIdx = Math.max(0, cursorTokenIndex - phraseLength + 1);
                startIdx <= cursorTokenIndex && startIdx + phraseLength <= tokens.length;
                startIdx++) {
    
                const phraseTokens = tokens.slice(startIdx, startIdx + phraseLength);
    
                // Check if all tokens are word tokens (not punctuation)
                const allWords = phraseTokens.every(t => t.isWord);
                if (!allWords) continue;
    
                const phrase = normalizeVietnamese(phraseTokens.map(t => t.text).join(' '));
    
                if (vnIndex.has(phrase)) {
                    const indices = vnIndex.get(phrase);
                    const startChar = phraseTokens[0].start;
                    const endChar = phraseTokens[phraseTokens.length - 1].end;
                    const entries = Array.from(indices).map(idx => vnEn[idx]);
    
                    matches.push({
                        phrase: phrase,
                        length: phraseLength,
                        startIndex: startIdx,
                        startChar: startChar,
                        endChar: endChar,
                        maxFrequency: Math.max(...entries.map(e => e.freq || 0)),
                        distanceFromCursor: Math.abs(startIdx + phraseLength / 2 - cursorTokenIndex),
                        entries: entries
                    });
    
                }
    
                const lowercase = phrase.toLowerCase();
                if (phrase !== lowercase && vnIndex.has(lowercase)) {
    
                    // Backup search for non-proper nouns at the beginning of sentences that are capitalized
                    const indices = vnIndex.get(lowercase);
                    const startChar = phraseTokens[0].start;
                    const endChar = phraseTokens[phraseTokens.length - 1].end;
                    const entries = Array.from(indices).map(idx => vnEn[idx]);
    
                    matches.push({
                        phrase: phrase,
                        length: phraseLength,
                        startIndex: startIdx,
                        startChar: startChar,
                        endChar: endChar,
                        maxFrequency: Math.max(...entries.map(e => e.freq || 0)),
                        distanceFromCursor: Math.abs(startIdx + phraseLength / 2 - cursorTokenIndex),
                        entries: entries
                    });
                }
            }
    
            // If we found matches at this length, we might want to stop
            // or continue to find shorter alternatives
            if (matches.length > 0) break;
        }
    
        return matches;
    }

    compareMatches(a, b) {
        if (a.length !== b.length) return b.length - a.length;
        return b.maxFrequency - a.maxFrequency;
    }
}