export class HighlightOverlay {
    constructor() {
        this.overlay = null;
        this.currentHighlights = [];

        this.initOverlay();
    }

    initOverlay() {
        this.overlay = document.createElement('div');
        this.overlay.id = "saola-overlay";
        this.overlay.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            pointer-events: none;
            z-index: 10000;
        `;
        document.body.appendChild(this.overlay);
    }

    highlightWord(container, start, end, color = 'rgba(255, 255, 0, 0.3)') {
        this.clearAll();

        try {
            const range = document.createRange();
            range.setStart(container, start);
            range.setEnd(container, end);

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

                this.overlay.appendChild(highlight);
                this.currentHighlights.push(highlight);
            }
        } catch (e) {
            console.error('Error creating highlight:', e);
        }
    }

    clearAll() {
        for (const highlight of this.currentHighlights) {
            if (highlight.parentNode) {
                highlight.remove();
            }
        }
        this.currentHighlights = [];
    }

    destroy() {
        this.clearAll();
        if (this.overlay && this.overlay.parentNode) {
            this.overlay.remove();
        }
    }
}