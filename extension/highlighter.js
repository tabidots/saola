export class HighlightOverlay {
    constructor() {
        this.overlay = null;
        this.currentHighlights = [];
        this.range = document.createRange();

        this.initOverlay();
        this.watchForRemoval();
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

    watchForRemoval() {
        // Re-inject popup if DOM is rehydrated (Next.js, etc)
        // (Usually the highlighter is fine, compared to the popup, but JIC...)
        const observer = new MutationObserver((mutations) => {
            const overlay = document.getElementById('saola-overlay');

            if (!overlay) {
                this.initOverlay();
                observer.disconnect();
            }
        });

        observer.observe(document.body, {
            childList: true,
            subtree: false
        });
    }

    highlightWord(container, start, end, color = 'rgba(255, 255, 0, 0.3)') {
        this.clearAll();

        try {
            this.range.setStart(container, start);
            this.range.setEnd(container, end);

            const rects = this.range.getClientRects();

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