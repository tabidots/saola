import { HighlightOverlay } from './highlighter.js';
import { findWordAtPosition, isMouseInWordRegion } from './text-utils.js';

export class WordTracker {
    constructor(popupManager, dictionaryLookup) {
        this.popupManager = popupManager;
        this.dictionaryLookup = dictionaryLookup;
        this.highlightOverlay = new HighlightOverlay();
        this.enabled = true;

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
            this.clearCurrentWord();
            this.highlightOverlay.clearAll();
            this.popupManager.hide();
            return;
        }

        let container = range.startContainer;
        let offset = range.startOffset;
        const text = container.data;

        // Handle edge case at end of text node
        if (offset === text.length) {
            const nextSibling = container.nextSibling;
            if (nextSibling?.nodeType === Node.TEXT_NODE) {
                container = nextSibling;
                offset = 0;
            }
        }

        // Check if mouse is still within the current word region
        if (this.currentWordRange && isMouseInWordRegion(e.clientX, e.clientY, this.currentWordRange)) {
            // Mouse is still over the same word, no need to update
            return;
        }

        // Find the word at cursor position with its boundaries
        const wordInfo = findWordAtPosition(text, offset);

        if (!wordInfo) {
            this.clearCurrentWord();
            this.highlightOverlay.clearAll();
            this.popupManager.hide();
            return;
        }

        // Check if we're still on the same word (same text and position)
        if (this.currentWordText === wordInfo.word &&
            this.currentWordRange &&
            this.currentWordRange.container === container &&
            this.currentWordRange.start === wordInfo.start) {
            return;
        }

        // Update current word tracking
        this.updateCurrentWord(container, wordInfo, e);

        // Now look for dictionary matches centered on this word
        const r = this.dictionaryLookup.findMatches(container, text, wordInfo)
        if (!r) return;
        const { matches, chunkInfo } = r;
        this.highlightOverlay.highlightMatchedPhrase(container, chunkInfo, matches[0]);
        this.popupManager.show(matches);
    }

    handleMouseLeave() {
        this.cleanup();
    }

    cleanup() {
        this.clearCurrentWord();
        this.highlightOverlay.clearAll();
        this.popupManager.hide();
    }

    updateCurrentWord(container, wordInfo, event) {
        this.currentWordRange = {
            container: container,
            start: wordInfo.start,
            end: wordInfo.end,
            timestamp: Date.now()
        };

        this.currentWordText = wordInfo.word;

        // Store the bounding rect for faster region checking
        try {
            const range = document.createRange();
            range.setStart(container, wordInfo.start);
            range.setEnd(container, wordInfo.end);
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