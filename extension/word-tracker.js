import { getData } from './data-loader.js';
import { HighlightOverlay } from './highlighter.js';
import { TextSegmenter, generateUniqueVariations } from './segmenter.js';

export class WordTracker {
    constructor(popupManager) {
        this.popupManager = popupManager;
        this.highlightOverlay = new HighlightOverlay();
        this.enabled = true;

        this.textSegmenter = new TextSegmenter();
        this.segmentCache = new WeakMap();

        this.currentWordRange = null;
        this.currentWordText = '';
        this.lastMouseEvent = null;
        this.lastMouseMoveTime = 0;

        this.handleMouseMove = this.handleMouseMove.bind(this);
        this.handleMouseLeave = this.handleMouseLeave.bind(this);
    }

    start() {
        document.addEventListener('mousemove', this.handleMouseMove);
        document.addEventListener('mouseleave', this.handleMouseLeave);
    }

    stop() {
        document.removeEventListener('mousemove', this.handleMouseMove);
        document.removeEventListener('mouseleave', this.handleMouseLeave);
        this.cleanup();
    }

    enable() {
        this.enabled = true;
    }

    disable() {
        this.enabled = false;
        this.cleanup();
    }

    isThrottled() {
        const now = Date.now();
        if (now - this.lastMouseMoveTime < 50) return true;
        this.lastMouseMoveTime = now;
        return false;
    }

    handleMouseMove(e) {
        if (!this.enabled || this.isThrottled()) return;

        this.lastMouseEvent = e;
        this.popupManager.position(e.clientX, e.clientY);

        const ele = document.elementFromPoint(e.clientX, e.clientY);
        const range = document.caretRangeFromPoint(e.clientX, e.clientY);

        if (["TEXTAREA", "INPUT", "SELECT", "HTML", "BODY"].includes(ele.tagName) ||
            !range || range.startContainer.nodeType !== Node.TEXT_NODE) {
            this.cleanup();
            return;
        }

        const container = range.startContainer;
        const offset = range.startOffset;
        const text = container.data;

        // Get or create segmentation for this text node
        let segments = this.segmentCache.get(container);
        if (!segments) {
            segments = this.textSegmenter.segment(text);
            this.segmentCache.set(container, segments);
        }

        // Find which segment contains the cursor
        const result = this.textSegmenter.findSegmentAtPosition(segments, offset);

        if (!result) {
            this.cleanup();
            return;
        }

        const { segment, index } = result;

        // Check if still on same segment
        if (this.currentWordText === segment.normalized &&
            this.currentWordRange &&
            this.currentWordRange.container === container &&
            this.currentWordRange.start === segment.start) {
            return;
        }
        this.updateCurrentWord(container, segment, e);
        this.findAndShowMatches(container, segment, e);
    }

    handleMouseLeave() {
        this.cleanup();
    }

    cleanup() {
        this.clearCurrentWord();
        this.highlightOverlay.clearAll();
        this.popupManager.hide();
    }

    updateCurrentWord(container, segment, event) {
        this.currentWordRange = {
            container: container,
            start: segment.start,
            end: segment.end,
            timestamp: Date.now()
        };
        
        this.currentWordText = segment.normalized;
        
        try {
            const range = document.createRange();
            range.setStart(container, segment.start);
            range.setEnd(container, segment.end);
            this.currentWordRange.rect = range.getBoundingClientRect();
        } catch (e) {
            this.currentWordRange.rect = null;
        }
    }

    clearCurrentWord() {
        this.currentWordRange = null;
        this.currentWordText = '';
    }

    findAndShowMatches(container, segment, event) {
        const { vnEn, vnIndex } = getData();
        const matches = [];

        // Look for the target segment
        const normalized = segment.normalized;
        const variations = generateUniqueVariations(normalized);

        for (const variation of variations) {
            if (vnIndex.has(variation)) {
                const indices = vnIndex.get(variation);
                const entries = Array.from(indices).map(idx => vnEn[idx]);

                matches.push({
                    raw: segment.text,
                    normalized: variation,
                    wordCount: segment.wordCount,
                    maxFrequency: Math.max(...entries.map(e => e.freq || 0)),
                    entries: entries
                });
            }
        }

        if (matches.length > 0) {
            matches.sort((a, b) => this.compareMatches(a, b));

            // Highlight the matched segment
            this.highlightOverlay.clearAll();
            this.highlightOverlay.highlightWord(container, segment.start, segment.end);

            this.popupManager.show(matches, event.clientX, event.clientY);
        } else {
            this.cleanup();
        }
    }

    compareMatches(a, b) {
        // Prioritize longer matches
        if (a.wordCount !== b.wordCount) return b.wordCount - a.wordCount;
        // Then by exact case match
        if (a.raw !== a.normalized || b.raw !== b.normalized) return a.raw.localeCompare(b.raw);
        // Then by frequency
        return b.maxFrequency - a.maxFrequency;
    }

}