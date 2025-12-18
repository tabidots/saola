import { getData } from './data-loader.js';

export function segmentizeDictionaryWords(phrase, boldOffsets = []) {
    const { vnHeadwordSet } = getData();

    // --- Normalize and sort offsets ---
    const sortedOffsets = Array.isArray(boldOffsets)
        ? boldOffsets
            .slice()
            .sort((a, b) => a[0] - b[0])
            .filter(([s, e]) => s >= 0 && e > s && e <= phrase.length)
        : [];

    // --- Tokenize preserving ALL spacing ---
    //
    // This regex splits into three types of tokens:
    //   1. Words (letters + digits + hyphens)
    //   2. Punctuation tokens
    //   3. Whitespace tokens
    //
    // EVERYTHING is preserved.
    //
    const rawTokens = phrase.match(/[\p{L}\p{N}-]+|\s+|[^\p{L}\p{N}\s-]+/gu) || [];

    // Convert to internal token objects
    let currentPos = 0;
    const tokens = rawTokens.map(tok => {
        const start = currentPos;
        const end = start + tok.length;
        currentPos = end;

        const isWord = /\p{L}/u.test(tok);  // contains at least one letter

        // Determine boldness based on overlap with ANY bold range
        const isBold = sortedOffsets.some(([s, e]) => start < e && end > s);

        return {
            text: tok,
            isWord,
            isSpace: /^\s+$/.test(tok),
            isPunct: !isWord && !/^\s+$/.test(tok),
            isBold
        };
    });

    // Build a parallel list of *word-only* tokens.
    const words = tokens.filter(t => t.isWord).map(t => t.text);
    const lowerWords = words.map(w => w.toLowerCase());

    // We'll walk the token list and simultaneously consume from words[].
    let wordIndex = 0;
    const segments = [];

    // Loop over tokens and build the final segments
    for (let i = 0; i < tokens.length; i++) {
        const tok = tokens[i];

        // Preserve whitespace exactly
        if (tok.isSpace) {
            segments.push({
                display: tok.text,
                key: null,
                isPunct: false,
                isSpace: true,
                inDictionary: false,
                isBold: tok.isBold
            });
            continue;
        }

        // Push punctuation literally
        if (tok.isPunct) {
            segments.push({
                display: tok.text,
                key: null,
                isPunct: true,
                isSpace: false,
                inDictionary: false,
                isBold: tok.isBold
            });
            continue;
        }

        // --- Attempt greedy dictionary match (word tokens only) ---
        let matched = null;
        let matchedLower = null;
        let matchedLen = 0;

        for (let w = words.length; w > wordIndex; w--) {
            const spanLower = lowerWords.slice(wordIndex, w).join(" ");
            if (vnHeadwordSet.has(spanLower)) {
                matchedLower = spanLower;
                matched = words.slice(wordIndex, w).join(" ");
                matchedLen = w - wordIndex;
                break;
            }
        }

        if (matched) {
            segments.push({
                display: matched,
                key: matchedLower,
                isPunct: false,
                isSpace: false,
                inDictionary: true,
                // the FIRST token determines boldness
                isBold: tokens[i].isBold
            });

            // Skip the consumed word tokens
            let consumed = 0;
            for (let j = i; j < tokens.length && consumed < matchedLen; j++) {
                if (tokens[j].isWord) consumed++;
                i = j;
            }

            wordIndex += matchedLen;
        } else {
            // Single fallback word
            const wtxt = words[wordIndex];
            segments.push({
                display: wtxt,
                key: lowerWords[wordIndex],
                isPunct: false,
                isSpace: false,
                inDictionary: false,
                isBold: tok.isBold
            });
            wordIndex++;
        }
    }

    return segments;
}

export function linkifySegments(segments) {
    let out = "";
    let inBoldSpan = false;
    let parensToBalance = 0;

    for (let i = 0; i < segments.length; i++) {
        const seg = segments[i];
        const prev = segments[i - 1];

        const isPunct = seg.isPunct;
        const isOpenPunct = /[([{“"']$/.test(seg.display);
        const isClosePunct = /^[)\]}”"',:;\.\?!]/.test(seg.display);

        const prevIsPunct = prev?.isPunct;
        const prevIsOpen = prev && /[([{“"']$/.test(prev.display);
        const prevIsClose = prev && /^[)\]}”"',:;\.\?!]$/.test(prev.display);

        // Handle bold span transitions
        if (seg.isBold && !inBoldSpan) {
            out += '<strong>';
            inBoldSpan = true;
        } else if (!seg.isBold && inBoldSpan) {
            out += '</strong>';
            inBoldSpan = false;
        }

        // --- SPACING RULES ---
        if (i > 0) {
            let needSpace = true;

            if (isClosePunct) { // never space before closing punctuation
                needSpace = false;
            } else if (isOpenPunct) { // never space before opening punctuation
                needSpace = false;
            } else if (prevIsOpen) { // no space right after opening punctuation
                needSpace = false;
            } else if (prevIsPunct && !prevIsClose) { // other punctuation (like comma) -> allow space
                needSpace = true;
            } else if (!prevIsPunct && !isPunct) { // word + word → space
                needSpace = true;
            } else if (prevIsClose && !isPunct) { // closing punct + word → space
                needSpace = true;
            }

            if (needSpace) out += " ";
        }

        // --- ADD TOKEN ---
        if (parensToBalance === 0 && /^\)/.test(seg.display)) {
            // Don't add a closing paren if a previous headword crossed over an opening paren
            // This happened with at least one example (thế giới, second example)
        } else if (isPunct) {
            out += seg.display;
            if (/^\)/.test(seg.display)) parensToBalance--;
            else if (/\($/.test(seg.display)) parensToBalance++;
        } else if (!seg.inDictionary) {
            out += escapeHtml(seg.display);
        } else {
            out += `<a href="#" class="vn-link" data-word="${escapeHtml(seg.key)}">${escapeHtml(seg.display)}</a>`;
        }
    }

    // Close any open bold span
    if (inBoldSpan) {
        out += '</strong>';
    }

    return out;
}