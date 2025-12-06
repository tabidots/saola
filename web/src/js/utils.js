export function removeTones(text) {
    const toneMarks = {
        '\u0300': '', '\u0301': '', '\u0309': '', '\u0303': '', '\u0323': ''
    };
    const decomposed = text.normalize('NFD');
    let result = '';
    for (const char of decomposed) {
        result += toneMarks[char] ?? char;
    }
    return result.normalize('NFC');
}

export function makePlain(text) {
    let result = text.replace(/\u0110/g, 'D').replace(/\u0111/g, 'd');
    result = result.normalize('NFKD');
    result = result.replace(/[\u0300-\u036f]/g, '');
    return result;
}

export function escapeHtml(str) {
    return String(str)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#39;');
}

export async function loadGzipJson(url) {
    const response = await fetch(url);
    const blob = await response.blob();
    const ds = new DecompressionStream('gzip');
    const decompressedStream = blob.stream().pipeThrough(ds);
    const text = await new Response(decompressedStream).text();
    return JSON.parse(text);
}

// Add RegExp.escape if not available
if (!RegExp.escape) {
    RegExp.escape = function (s) {
        return String(s).replace(/[\\^$*+?.()|[\]{}]/g, '\\$&');
    };
}

export function linkifyFromList(glossText, links = []) {
    if (!links || links.length === 0) {
        return escapeHtml(glossText);
    }

    // Escape HTML first
    let result = escapeHtml(glossText);

    // Sort links by length (longest first) to avoid partial matches
    const sortedLinks = [...links].sort((a, b) => b.length - a.length);

    // Track already-linkified positions to avoid double-linking
    const linkifiedRanges = [];

    // Replace each link with clickable version
    for (const word of sortedLinks) {
        const escaped = RegExp.escape(word);
        const regex = new RegExp(
            `(?<![\\p{L}\\p{M}])(${escaped})(?![\\p{L}\\p{M}])`,
            'gui'
        );

        let newResult = '';
        let lastIndex = 0;
        let match;

        // Reset regex for fresh matching
        const globalRegex = new RegExp(regex.source, regex.flags);

        while ((match = globalRegex.exec(result)) !== null) {
            const matchStart = match.index;
            const matchEnd = match.index + match[0].length;

            // Check if this match overlaps with already-linkified range
            const isAlreadyLinked = linkifiedRanges.some(range =>
                (matchStart >= range.start && matchStart < range.end) ||
                (matchEnd > range.start && matchEnd <= range.end) ||
                (matchStart <= range.start && matchEnd >= range.end)
            );

            if (!isAlreadyLinked) {
                // Add text before match
                newResult += result.substring(lastIndex, matchStart);

                // Add linkified match
                const link = `<a href="#" class="vn-link" data-word="${escapeHtml(word.toLowerCase())}">${match[0]}</a>`;
                newResult += link;

                // Track this range as linkified
                const linkStart = newResult.length - link.length;
                const linkEnd = newResult.length;
                linkifiedRanges.push({ start: linkStart, end: linkEnd });

                lastIndex = matchEnd;
            }
        }

        // Add remaining text
        newResult += result.substring(lastIndex);
        result = newResult;
    }

    return result;
}

export function boldify(text, offsets = []) {
    if (offsets.length === 0) return escapeHtml(text);

    // Simple tokenization for bold detection
    const tokens = text.split(/(\s+)/);
    let result = '';
    let currentPos = 0;

    tokens.forEach(token => {
        const tokenStart = currentPos;
        const tokenEnd = currentPos + token.length;
        const isBold = offsets.some(([start, end]) =>
            tokenStart < end && tokenEnd > start
        );

        if (isBold) {
            result += `<strong>${escapeHtml(token)}</strong>`;
        } else {
            result += escapeHtml(token);
        }

        currentPos = tokenEnd;
    });

    return result;
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