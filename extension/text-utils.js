import { fixTonePlacement } from '../shared/utils.js';

export function normalizeVietnamese(text) {
    let normalized = text;
    if (normalized === normalized.toUpperCase()) {
        normalized = normalized.toLowerCase();
    }
    return fixTonePlacement(normalized);
}

export function tokenizeWithPositions(text) {
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

export function extractChunkAroundWord(text, wordStart, wordEnd, maxWords = 5) {
    const wordCharRegex = /[\p{L}\p{M}\p{Nd}]/u;
    const punctuationRegex = /[.!?,;:()\[\]{}"'_\-]/u;
    const whitespaceRegex = /\s/u;

    let start = wordStart;
    let end = wordEnd;
    let wordCount = 1;

    // Expand backward
    let backWords = 0;
    while (backWords < maxWords && start > 0) {
        // Skip whitespace
        let prevEnd = start;
        while (prevEnd > 0 && whitespaceRegex.test(text[prevEnd - 1])) {
            prevEnd--;
        }

        // Check for punctuation
        if (prevEnd > 0 && punctuationRegex.test(text[prevEnd - 1])) {
            break;
        }

        // Find previous word
        let prevStart = prevEnd;
        while (prevStart > 0 && wordCharRegex.test(text[prevStart - 1])) {
            prevStart--;
        }

        if (prevStart < prevEnd) {
            start = prevStart;
            backWords++;
            wordCount++;
        } else {
            break;
        }
    }

    // Expand forward
    let forwardWords = 0;
    while (forwardWords < maxWords && end < text.length) {
        // Skip whitespace
        while (end < text.length && whitespaceRegex.test(text[end])) {
            end++;
        }

        // Check for punctuation
        if (end < text.length && punctuationRegex.test(text[end])) {
            break;
        }

        // Find next word
        let nextEnd = end;
        while (nextEnd < text.length && wordCharRegex.test(text[nextEnd])) {
            nextEnd++;
        }

        if (nextEnd > end) {
            end = nextEnd;
            forwardWords++;
            wordCount++;
        } else {
            break;
        }
    }

    const chunk = text.substring(start, end);
    const cursorPosInChunk = wordStart - start + Math.floor((wordEnd - wordStart) / 2);

    return { chunk, cursorPosInChunk, start, end, wordCount };
}

export function findWordAtPosition(text, position) {
    const wordCharRegex = /[\p{L}\p{M}\p{Nd}]/u;

    if (position < 0 || position >= text.length || !wordCharRegex.test(text[position])) {
        // If cursor is not on a word character, try to find nearest word
        position = findNearestWordPosition(text, position);
        if (position === -1) return null;
    }

    // Expand backward to find word start
    let start = position;
    while (start > 0 && wordCharRegex.test(text[start - 1])) {
        start--;
    }

    // Expand forward to find word end
    let end = position;
    while (end < text.length && wordCharRegex.test(text[end])) {
        end++;
    }

    if (start === end) return null; // No word found

    const word = text.substring(start, end);

    return {
        word: word,
        start: start,
        end: end,
        length: end - start
    };
}

function findNearestWordPosition(text, position) {
    const wordCharRegex = /[\p{L}\p{M}\p{Nd}]/u;

    // Check character at position
    if (position < text.length && wordCharRegex.test(text[position])) {
        return position;
    }

    // Look backward
    let backwardPos = position - 1;
    while (backwardPos >= 0) {
        if (wordCharRegex.test(text[backwardPos])) {
            return backwardPos;
        }
        backwardPos--;
    }

    // Look forward
    let forwardPos = position;
    while (forwardPos < text.length) {
        if (wordCharRegex.test(text[forwardPos])) {
            return forwardPos;
        }
        forwardPos++;
    }

    return -1;
}


export function isMouseInWordRegion(mouseX, mouseY, wordRange) {
    try {
        // Create a range for the word
        const range = document.createRange();
        range.setStart(wordRange.container, wordRange.start);
        range.setEnd(wordRange.container, wordRange.end);

        // Get bounding rectangle
        const rect = range.getBoundingClientRect();

        if (!rect || rect.width === 0 || rect.height === 0) {
            return false;
        }

        // Add some padding around the word for easier targeting
        const padding = 5;
        return mouseX >= rect.left - padding &&
            mouseX <= rect.right + padding &&
            mouseY >= rect.top - padding &&
            mouseY <= rect.bottom + padding;
    } catch (e) {
        return false;
    }
}