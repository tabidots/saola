import { HighlightOverlay } from './highlighter.js';
import { TextSegmenter } from './segmenter.js';

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

    async handleMouseMove(e) {
        if (!this.enabled) return;

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
        let cached = this.segmentCache.get(container);
        let segments;

        // Check if cached text matches current text
        // In cases like Google Maps review translations, the text can change
        if (!cached || cached.text !== text) {
            segments = this.textSegmenter.segment(text);
            this.segmentCache.set(container, {
                segments,
                text: text, // Store the text too!
                timestamp: Date.now()
            });
        } else {
            segments = cached.segments;
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
        
        if (!segment.entries.length) return;

        // Initialize AudioContext on first mouse move
        if (this.popupManager?.audioPlayer) {
            await this.popupManager.audioPlayer.initializeWithGesture();
        }

        try {
            chrome.runtime.sendMessage({
                type: 'update-current-word',
                word: segment.hasAudio ? segment.text : "",
                isMergedName: segment.isMergedName
            });
        } catch (error) {
            // Silently ignore "extension context invalidated" errors
            if (!error.message.includes('Extension context invalidated')) {
                console.warn('Failed to send message:', error);
            }
        }

        this.highlightOverlay.clearAll();
        this.highlightOverlay.highlightWord(container, segment.start, segment.end);
        this.popupManager.show(segment, event.clientX, event.clientY);
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

}