export class HighlightOverlay {
    constructor() {
        this.overlay = null;
        this.highlights = new Map(); // wordHash -> highlight element
        this.currentWordHash = null;
        this.zIndex = 10000; // High z-index to ensure it's on top

        this.initOverlay();
    }

    initOverlay() {
        // Create overlay container
        this.overlay = document.createElement('div');
        this.overlay.id = "saola-overlay";
        this.overlay.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            pointer-events: none;
            z-index: ${this.zIndex};
        `;

        document.body.appendChild(this.overlay);
    }

    // Create highlight for a specific range
    createHighlight(range, color = 'rgba(255, 255, 0, 0.3)', borderRadius = '2px') {
        // Get all rectangles for the range (handles multi-line text)
        const rects = range.getClientRects();
        const highlightId = this.generateId();

        // Create a container for this highlight (in case of multiple rects)
        const highlightContainer = document.createElement('div');
        highlightContainer.id = `highlight-${highlightId}`;
        highlightContainer.style.cssText = `
            position: absolute;
            pointer-events: none;
        `;

        // Create a highlight element for each rectangle
        const highlightElements = [];

        for (const rect of rects) {
            if (rect.width === 0 || rect.height === 0) continue;

            const highlight = document.createElement('div');
            highlight.style.cssText = `
                position: absolute;
                left: ${rect.left}px;
                top: ${rect.top}px;
                width: ${rect.width}px;
                height: ${rect.height}px;
                background-color: ${color};
                border-radius: ${borderRadius};
                pointer-events: none;
            `;

            highlightContainer.appendChild(highlight);
            highlightElements.push({
                element: highlight,
                rect: rect
            });
        }

        if (highlightElements.length === 0) {
            return null;
        }

        this.overlay.appendChild(highlightContainer);

        return {
            id: highlightId,
            container: highlightContainer,
            elements: highlightElements
        };
    }

    // Highlight a specific word/phrase
    highlightWord(container, start, end, color = 'rgba(255, 255, 0, 0.3)') {
        // Clear previous highlight
        this.clearHighlight();

        try {
            const range = document.createRange();
            range.setStart(container, start);
            range.setEnd(container, end);

            const highlight = this.createHighlight(range, color);
            if (!highlight) return null;

            // Store with hash based on position and text
            const wordHash = this.getWordHash(container, start, end);
            this.highlights.set(wordHash, highlight);
            this.currentWordHash = wordHash;

            return highlight;
        } catch (e) {
            console.error('Error creating highlight:', e);
            return null;
        }
    }

    // Highlight multiple ranges (for multi-word phrases)
    highlightRanges(ranges, color = 'rgba(255, 255, 0, 0.3)') {
        this.clearHighlight();

        const highlightId = this.generateId();
        const highlightContainer = document.createElement('div');
        highlightContainer.id = `highlight-${highlightId}`;
        highlightContainer.style.cssText = `
            position: absolute;
            pointer-events: none;
        `;

        let allElements = [];

        for (const range of ranges) {
            const rects = range.getClientRects();
            for (const rect of rects) {
                if (rect.width === 0 || rect.height === 0) continue;

                const highlight = document.createElement('div');
                highlight.style.cssText = `
                    position: absolute;
                    left: ${rect.left}px;
                    top: ${rect.top}px;
                    width: ${rect.width}px;
                    height: ${rect.height}px;
                    background-color: ${color};
                    border-radius: 2px;
                    pointer-events: none;
                `;

                highlightContainer.appendChild(highlight);
                allElements.push(highlight);
            }
        }

        if (allElements.length === 0) {
            return null;
        }

        this.overlay.appendChild(highlightContainer);

        const highlight = {
            id: highlightId,
            container: highlightContainer,
            elements: allElements
        };

        this.currentWordHash = highlightId;
        this.highlights.set(highlightId, highlight);

        return highlight;
    }

    // Clear specific highlight
    clearHighlight(hash = null) {
        const hashToClear = hash || this.currentWordHash;
        if (!hashToClear || !this.highlights.has(hashToClear)) return;

        const highlight = this.highlights.get(hashToClear);
        if (highlight.container.parentNode) {
            highlight.container.remove();
        }
        this.highlights.delete(hashToClear);

        if (this.currentWordHash === hashToClear) {
            this.currentWordHash = null;
        }
    }

    // Clear all highlights
    clearAll() {
        for (const [hash, highlight] of this.highlights) {
            if (highlight.container.parentNode) {
                highlight.container.remove();
            }
        }
        this.highlights.clear();
        this.currentWordHash = null;
    }

    // Generate unique ID
    generateId() {
        return Date.now().toString(36) + Math.random().toString(36).substr(2);
    }

    // Create hash for word identification
    getWordHash(container, start, end) {
        const text = container.data?.substring(start, end) || '';
        return `${container.nodeName}-${start}-${end}-${text}`;
    }

    // Destroy overlay
    destroy() {
        this.clearAll();
        if (this.overlay && this.overlay.parentNode) {
            this.overlay.remove();
        }
    }

    highlightMatchedPhrase(container, chunkInfo, match) {
        // Calculate actual positions in the original text
        const phraseStart = chunkInfo.start + match.startChar;
        const phraseEnd = chunkInfo.start + match.endChar;

        try {
            // Create range for the entire phrase
            const range = document.createRange();
            range.setStart(container, phraseStart);
            range.setEnd(container, phraseEnd);

            // Create highlight
            this.highlightWord(container, phraseStart, phraseEnd, 'rgba(255, 200, 50, 0.3)');

        } catch (e) {
            console.error('Error highlighting phrase:', e);
        }
    }
}