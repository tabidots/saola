// word-tracker.js
import { HighlightOverlay } from './highlighter.js';

export class WordTracker {
    constructor(popupManager) {
        this.popupManager = popupManager;
        this.highlightOverlay = new HighlightOverlay();
        this.enabled = true;

        this.segmentCache = new Map();

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
        this.enabled = true;
    }

    stop() {
        document.removeEventListener('mousemove', this.handleMouseMove);
        document.removeEventListener('mouseleave', this.handleMouseLeave);
        this.enabled = false;
        this.cleanup();
    }

    _findSegmentAtPosition(segments, offset) {
        for (let i = 0; i < segments.length; i++) {
            if (offset >= segments[i].start && offset < segments[i].end) {
                return { segment: segments[i], index: i };
            }
        }
        return null;
    }

    _cacheSegments(text, segments) {
        if (this.segmentCache.size > 200) {
            this.segmentCache.clear();
        }
        this.segmentCache.set(text, { segments, timestamp: Date.now() });
    }

    async handleMouseMove(e) {
        if (!this.enabled) return;

        this.lastMouseEvent = e;
        this.popupManager.position(e.clientX, e.clientY);

        const ele = document.elementFromPoint(e.clientX, e.clientY);
        const range = document.caretRangeFromPoint(e.clientX, e.clientY);

        if (["TEXTAREA", "INPUT", "SELECT", "HTML", "BODY"].includes(
            ele?.tagName ?? "UNDEFINED_TAG") ||
            !range || range.startContainer.nodeType !== Node.TEXT_NODE) {
            this.cleanup();
            return;
        }

        const container = range.startContainer;
        const offset = range.startOffset;
        const text = container.data;
        const cached = this.segmentCache.get(text);

        let result;

        if (cached) {
            // Do position lookup locally without a round-trip
            result = cached.segments ?
                this._findSegmentAtPosition(cached.segments, offset) : null;
        } else {
            const response = await chrome.runtime.sendMessage({
                action: 'saolaSegment',
                text,
                offset
            });
            result = response?.result;
            if (response?.segments) {
                this._cacheSegments(text, response.segments);
            }
        }

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
        
        if (!segment.entries.length) {
            this.cleanup();
            return;
        };

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
        this.popupManager.show(segment, e.clientX, e.clientY);
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