(() => {
  // ../shared/utils.js
  var toneCorrections = {
    "\xF3a": "o\xE1",
    "\xF2a": "o\xE0",
    "\u1ECFa": "o\u1EA3",
    "\xF5a": "o\xE3",
    "\u1ECDa": "o\u1EA1",
    "\xF3e": "o\xE9",
    "\xF2e": "o\xE8",
    "\u1ECFe": "o\u1EBB",
    "\xF5e": "o\u1EBD",
    "\u1ECDe": "o\u1EB9",
    "\xFAy": "u\xFD",
    "\xF9y": "u\u1EF3",
    "\u1EE7y": "u\u1EF7",
    "\u0169y": "u\u1EF9",
    "\u1EE5y": "u\u1EF5",
    "\xD3a": "O\xE1",
    "\xD2a": "O\xE0",
    "\u1ECEa": "O\u1EA3",
    "\xD5a": "O\xE3",
    "\u1ECCa": "O\u1EA1",
    "\xD3e": "O\xE9",
    "\xD2e": "O\xE8",
    "\u1ECEe": "O\u1EBB",
    "\xD5e": "O\u1EBD",
    "\u1ECCe": "O\u1EB9",
    "\xDAy": "U\xFD",
    "\xD9y": "U\u1EF3",
    "\u1EE6y": "U\u1EF7",
    "\u0168y": "U\u1EF9",
    "\u1EE4y": "U\u1EF5"
  };
  function fixTonePlacement(text) {
    const pattern = /([óòỏõọÓÒỎÕỌ][ae]|[úùủũụÚÙỦŨỤ]y)\b/g;
    return text.replace(pattern, (match) => toneCorrections[match] || match);
  }
  function escapeHtml(str) {
    return String(str).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&#39;");
  }
  async function loadGzipJson(url) {
    const response = await fetch(url);
    const blob = await response.blob();
    const ds = new DecompressionStream("gzip");
    const decompressedStream = blob.stream().pipeThrough(ds);
    const text = await new Response(decompressedStream).text();
    return JSON.parse(text);
  }
  if (!RegExp.escape) {
    RegExp.escape = function(s) {
      return String(s).replace(/[\\^$*+?.()|[\]{}]/g, "\\$&");
    };
  }
  function linkifyFromList(glossText, links = []) {
    if (!links || links.length === 0) {
      return escapeHtml(glossText);
    }
    let result = escapeHtml(glossText);
    const sortedLinks = [...links].sort((a, b) => b.length - a.length);
    const linkifiedRanges = [];
    for (const word of sortedLinks) {
      const escaped = RegExp.escape(word);
      const regex = new RegExp(
        `(?<![\\p{L}\\p{M}])(${escaped})(?![\\p{L}\\p{M}])`,
        "gui"
      );
      let newResult = "";
      let lastIndex = 0;
      let match;
      const globalRegex = new RegExp(regex.source, regex.flags);
      while ((match = globalRegex.exec(result)) !== null) {
        const matchStart = match.index;
        const matchEnd = match.index + match[0].length;
        const isAlreadyLinked = linkifiedRanges.some(
          (range) => matchStart >= range.start && matchStart < range.end || matchEnd > range.start && matchEnd <= range.end || matchStart <= range.start && matchEnd >= range.end
        );
        if (!isAlreadyLinked) {
          newResult += result.substring(lastIndex, matchStart);
          const link = `<a href="#" class="vn-link" data-word="${escapeHtml(word.toLowerCase())}">${match[0]}</a>`;
          newResult += link;
          const linkStart = newResult.length - link.length;
          const linkEnd = newResult.length;
          linkifiedRanges.push({ start: linkStart, end: linkEnd });
          lastIndex = matchEnd;
        }
      }
      newResult += result.substring(lastIndex);
      result = newResult;
    }
    return result;
  }
  function boldify(text, offsets = []) {
    if (offsets.length === 0) return escapeHtml(text);
    const tokens = text.split(/(\s+)/);
    let result = "";
    let currentPos = 0;
    tokens.forEach((token) => {
      const tokenStart = currentPos;
      const tokenEnd = currentPos + token.length;
      const isBold = offsets.some(
        ([start, end]) => tokenStart < end && tokenEnd > start
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
  function linkifySegments(segments) {
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
      if (seg.isBold && !inBoldSpan) {
        out += "<strong>";
        inBoldSpan = true;
      } else if (!seg.isBold && inBoldSpan) {
        out += "</strong>";
        inBoldSpan = false;
      }
      if (i > 0) {
        let needSpace = true;
        if (isClosePunct) {
          needSpace = false;
        } else if (isOpenPunct) {
          needSpace = false;
        } else if (prevIsOpen) {
          needSpace = false;
        } else if (prevIsPunct && !prevIsClose) {
          needSpace = true;
        } else if (!prevIsPunct && !isPunct) {
          needSpace = true;
        } else if (prevIsClose && !isPunct) {
          needSpace = true;
        }
        if (needSpace) out += " ";
      }
      if (parensToBalance === 0 && /^\)/.test(seg.display)) {
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
    if (inBoldSpan) {
      out += "</strong>";
    }
    return out;
  }

  // data-loader.js
  var data = {
    vnEn: [],
    vnIndex: null
  };
  async function initializeData() {
    const dataUrl = chrome.runtime.getURL("data/vnen.json.gz");
    data.vnEn = await loadGzipJson(dataUrl);
    data.vnIndex = /* @__PURE__ */ new Map();
    data.vnEn.forEach((entry, idx) => {
      entry._idx = idx;
      const term = entry.word;
      if (!term) return;
      if (!data.vnIndex.has(term)) data.vnIndex.set(term, /* @__PURE__ */ new Set());
      data.vnIndex.get(term).add(idx);
    });
  }
  function getData() {
    return { vnEn: data.vnEn, vnIndex: data.vnIndex };
  }

  // ../shared/templates.js
  function registerHandlebarsHelpers(segmenter = null) {
    Handlebars.registerHelper("join", function(array, separator) {
      return array ? array.join(separator) : "";
    });
    Handlebars.registerHelper("eq", function(a, b) {
      return a === b;
    });
    Handlebars.registerHelper("linkifyFromList", function(gloss, links) {
      return new Handlebars.SafeString(linkifyFromList(gloss, links));
    });
    Handlebars.registerHelper("linkify", function(text, offsets) {
      if (!segmenter) {
        return new Handlebars.SafeString(text);
      }
      const realOffsets = Array.isArray(offsets) ? offsets : [];
      const segs = segmenter(text, realOffsets);
      return new Handlebars.SafeString(linkifySegments(segs));
    });
    Handlebars.registerHelper("boldify", function(text, offsets) {
      return new Handlebars.SafeString(boldify(text, offsets));
    });
    Handlebars.registerHelper("rankBadge", function(rank) {
      if (!rank) return "";
      if (rank <= 1e3) return '<span class="rank-badge core">Top 1000</span>';
      if (rank <= 3e3) return '<span class="rank-badge common">Top 3000</span>';
      if (rank <= 5e3) return '<span class="rank-badge general">Top 5000</span>';
      return "";
    });
    Handlebars.registerHelper("audioButton", function(word, dialect) {
      const filename = `${word.toLowerCase().replace(/\s+/g, "-")}-${dialect}.mp3`;
      return `
            <button class="audio-button" data-filename="${filename}" 
            data-dialect="${dialect.toUpperCase()}">
                <span class="audio-icon"><i class="twa twa-speaker-low-volume"></i></span> 
                ${dialect.toUpperCase()}
            </button>
        `;
    });
    Handlebars.registerHelper("gt", (a, b) => a > b);
    Handlebars.registerHelper("lte", (a, b) => a <= b);
    Handlebars.registerHelper("and", (a, b) => a && b);
  }

  // highlighter.js
  var HighlightOverlay = class {
    constructor() {
      this.overlay = null;
      this.highlights = /* @__PURE__ */ new Map();
      this.currentWordHash = null;
      this.zIndex = 1e4;
      this.initOverlay();
    }
    initOverlay() {
      this.overlay = document.createElement("div");
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
    createHighlight(range, color = "rgba(255, 255, 0, 0.3)", borderRadius = "2px") {
      const rects = range.getClientRects();
      const highlightId = this.generateId();
      const highlightContainer = document.createElement("div");
      highlightContainer.id = `highlight-${highlightId}`;
      highlightContainer.style.cssText = `
            position: absolute;
            pointer-events: none;
        `;
      const highlightElements = [];
      for (const rect of rects) {
        if (rect.width === 0 || rect.height === 0) continue;
        const highlight = document.createElement("div");
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
          rect
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
    highlightWord(container, start, end, color = "rgba(255, 255, 0, 0.3)") {
      this.clearHighlight();
      try {
        const range = document.createRange();
        range.setStart(container, start);
        range.setEnd(container, end);
        const highlight = this.createHighlight(range, color);
        if (!highlight) return null;
        const wordHash = this.getWordHash(container, start, end);
        this.highlights.set(wordHash, highlight);
        this.currentWordHash = wordHash;
        return highlight;
      } catch (e) {
        console.error("Error creating highlight:", e);
        return null;
      }
    }
    // Highlight multiple ranges (for multi-word phrases)
    highlightRanges(ranges, color = "rgba(255, 255, 0, 0.3)") {
      this.clearHighlight();
      const highlightId = this.generateId();
      const highlightContainer = document.createElement("div");
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
          const highlight2 = document.createElement("div");
          highlight2.style.cssText = `
                    position: absolute;
                    left: ${rect.left}px;
                    top: ${rect.top}px;
                    width: ${rect.width}px;
                    height: ${rect.height}px;
                    background-color: ${color};
                    border-radius: 2px;
                    pointer-events: none;
                `;
          highlightContainer.appendChild(highlight2);
          allElements.push(highlight2);
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
      const text = container.data?.substring(start, end) || "";
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
      const phraseStart = chunkInfo.start + match.startChar;
      const phraseEnd = chunkInfo.start + match.endChar;
      try {
        const range = document.createRange();
        range.setStart(container, phraseStart);
        range.setEnd(container, phraseEnd);
        this.highlightWord(container, phraseStart, phraseEnd, "rgba(255, 200, 50, 0.3)");
      } catch (e) {
        console.error("Error highlighting phrase:", e);
      }
    }
  };

  // text-utils.js
  function normalizeVietnamese(text) {
    let normalized = text;
    if (normalized === normalized.toUpperCase()) {
      normalized = normalized.toLowerCase();
    }
    return fixTonePlacement(normalized);
  }
  function tokenizeWithPositions(text) {
    const tokens = [];
    const regex = /([\p{L}\p{M}\p{Nd}]+)|(\S)/gu;
    let match;
    while ((match = regex.exec(text)) !== null) {
      const isWord = match[1] !== void 0;
      tokens.push({
        text: match[0],
        start: match.index,
        end: match.index + match[0].length,
        isWord
      });
    }
    return tokens;
  }
  function extractChunkAroundWord(text, wordStart, wordEnd, maxWords = 5) {
    const wordCharRegex = /[\p{L}\p{M}\p{Nd}]/u;
    const punctuationRegex = /[.!?,;:()\[\]{}"'_\-]/u;
    const whitespaceRegex = /\s/u;
    let start = wordStart;
    let end = wordEnd;
    let wordCount = 1;
    let backWords = 0;
    while (backWords < maxWords && start > 0) {
      let prevEnd = start;
      while (prevEnd > 0 && whitespaceRegex.test(text[prevEnd - 1])) {
        prevEnd--;
      }
      if (prevEnd > 0 && punctuationRegex.test(text[prevEnd - 1])) {
        break;
      }
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
    let forwardWords = 0;
    while (forwardWords < maxWords && end < text.length) {
      while (end < text.length && whitespaceRegex.test(text[end])) {
        end++;
      }
      if (end < text.length && punctuationRegex.test(text[end])) {
        break;
      }
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
  function findWordAtPosition(text, position) {
    const wordCharRegex = /[\p{L}\p{M}\p{Nd}]/u;
    if (position < 0 || position >= text.length || !wordCharRegex.test(text[position])) {
      position = findNearestWordPosition(text, position);
      if (position === -1) return null;
    }
    let start = position;
    while (start > 0 && wordCharRegex.test(text[start - 1])) {
      start--;
    }
    let end = position;
    while (end < text.length && wordCharRegex.test(text[end])) {
      end++;
    }
    if (start === end) return null;
    const word = text.substring(start, end);
    return {
      word,
      start,
      end,
      length: end - start
    };
  }
  function findNearestWordPosition(text, position) {
    const wordCharRegex = /[\p{L}\p{M}\p{Nd}]/u;
    if (position < text.length && wordCharRegex.test(text[position])) {
      return position;
    }
    let backwardPos = position - 1;
    while (backwardPos >= 0) {
      if (wordCharRegex.test(text[backwardPos])) {
        return backwardPos;
      }
      backwardPos--;
    }
    let forwardPos = position;
    while (forwardPos < text.length) {
      if (wordCharRegex.test(text[forwardPos])) {
        return forwardPos;
      }
      forwardPos++;
    }
    return -1;
  }
  function isMouseInWordRegion(mouseX, mouseY, wordRange) {
    try {
      const range = document.createRange();
      range.setStart(wordRange.container, wordRange.start);
      range.setEnd(wordRange.container, wordRange.end);
      const rect = range.getBoundingClientRect();
      if (!rect || rect.width === 0 || rect.height === 0) {
        return false;
      }
      const padding = 5;
      return mouseX >= rect.left - padding && mouseX <= rect.right + padding && mouseY >= rect.top - padding && mouseY <= rect.bottom + padding;
    } catch (e) {
      return false;
    }
  }

  // word-tracker.js
  var WordTracker = class {
    constructor(popupManager, dictionaryLookup) {
      this.popupManager = popupManager;
      this.dictionaryLookup = dictionaryLookup;
      this.highlightOverlay = new HighlightOverlay();
      this.enabled = true;
      this.currentWordRange = null;
      this.currentWordText = "";
      this.lastMouseEvent = null;
      this.lastMouseMoveTime = 0;
      this.handleMouseMove = this.handleMouseMove.bind(this);
      this.handleMouseLeave = this.handleMouseLeave.bind(this);
    }
    start() {
      document.addEventListener("mousemove", this.handleMouseMove);
      document.addEventListener("mouseleave", this.handleMouseLeave);
    }
    stop() {
      document.removeEventListener("mousemove", this.handleMouseMove);
      document.removeEventListener("mouseleave", this.handleMouseLeave);
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
      if (["TEXTAREA", "INPUT", "SELECT", "HTML", "BODY"].includes(ele.tagName) || !range || range.startContainer.nodeType !== Node.TEXT_NODE) {
        this.clearCurrentWord();
        this.highlightOverlay.clearAll();
        this.popupManager.hide();
        return;
      }
      let container = range.startContainer;
      let offset = range.startOffset;
      const text = container.data;
      if (offset === text.length) {
        const nextSibling = container.nextSibling;
        if (nextSibling?.nodeType === Node.TEXT_NODE) {
          container = nextSibling;
          offset = 0;
        }
      }
      if (this.currentWordRange && isMouseInWordRegion(e.clientX, e.clientY, this.currentWordRange)) {
        return;
      }
      const wordInfo = findWordAtPosition(text, offset);
      if (!wordInfo) {
        this.clearCurrentWord();
        this.highlightOverlay.clearAll();
        this.popupManager.hide();
        return;
      }
      if (this.currentWordText === wordInfo.word && this.currentWordRange && this.currentWordRange.container === container && this.currentWordRange.start === wordInfo.start) {
        return;
      }
      this.updateCurrentWord(container, wordInfo, e);
      const r = this.dictionaryLookup.findMatches(container, text, wordInfo);
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
        container,
        start: wordInfo.start,
        end: wordInfo.end,
        timestamp: Date.now()
      };
      this.currentWordText = wordInfo.word;
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
      this.currentWordText = "";
    }
  };

  // popup-manager.js
  var PopupManager = class {
    constructor(popupElement) {
      this.popup = popupElement;
      this.margin = parseInt(window.getComputedStyle(popupElement).marginLeft);
    }
    show(results) {
      this.popup.innerHTML = "";
      results.forEach((result) => {
        result.entries.forEach((entry) => {
          this.popup.innerHTML += Handlebars.templates.popup(entry);
        });
      });
      this.popup.style.display = "flex";
    }
    hide() {
      this.popup.style.display = "none";
    }
    position(x, y) {
      if (x + this.margin + this.popup.offsetWidth > window.innerWidth) {
        this.popup.style.right = "0px";
        this.popup.style.left = "unset";
      } else {
        this.popup.style.left = `${x}px`;
        this.popup.style.right = "unset";
      }
      if (y + this.margin + this.popup.offsetHeight > window.innerHeight) {
        this.popup.style.bottom = `${window.innerHeight - y + this.margin}px`;
        this.popup.style.top = "unset";
      } else {
        this.popup.style.top = `${y}px`;
        this.popup.style.bottom = "unset";
      }
    }
  };

  // dictionary-lookup.js
  var DictionaryLookup = class {
    findMatches(container, text, wordInfo) {
      const chunkInfo = extractChunkAroundWord(text, wordInfo.start, wordInfo.end, 5);
      const matches = this.findMatchesInChunk(chunkInfo.chunk, chunkInfo.cursorPosInChunk);
      if (matches.length > 0) {
        matches.sort(this.compareMatches);
        return { matches, chunkInfo };
      }
      return null;
    }
    findMatchesInChunk(chunk, cursorPosInChunk) {
      const tokens = tokenizeWithPositions(chunk);
      if (tokens.length === 0) return matches;
      let cursorTokenIndex = -1;
      for (let i = 0; i < tokens.length; i++) {
        const token = tokens[i];
        if (cursorPosInChunk >= token.start && cursorPosInChunk < token.end) {
          cursorTokenIndex = i;
          break;
        }
      }
      if (cursorTokenIndex === -1) {
        for (let i = 0; i < tokens.length; i++) {
          if (cursorPosInChunk < tokens[i].start) {
            cursorTokenIndex = i - 1;
            break;
          }
        }
        if (cursorTokenIndex === -1) {
          cursorTokenIndex = tokens.length - 1;
        }
      }
      const matches = this.findMatchesCenteredOnToken(tokens, cursorTokenIndex);
      const lookaheadMatches = this.findMatchesCenteredOnToken(tokens, cursorTokenIndex + 1)?.filter(
        (m) => m.startIndex > cursorTokenIndex && m.length > 1
      );
      const frequencyThreshold = lookaheadMatches.length > 0 ? Math.max(...lookaheadMatches.map((m) => m.maxFrequency)) : 0;
      if (matches.filter((m) => m.maxFrequency >= frequencyThreshold).length > 0) {
        return matches.filter((m) => m.maxFrequency >= frequencyThreshold);
      } else {
        return matches;
      }
    }
    findMatchesCenteredOnToken(tokens, cursorTokenIndex) {
      const { vnEn, vnIndex } = getData();
      const matches = [];
      for (let phraseLength = 5; phraseLength >= 1; phraseLength--) {
        for (let startIdx = Math.max(0, cursorTokenIndex - phraseLength + 1); startIdx <= cursorTokenIndex && startIdx + phraseLength <= tokens.length; startIdx++) {
          const phraseTokens = tokens.slice(startIdx, startIdx + phraseLength);
          const allWords = phraseTokens.every((t) => t.isWord);
          if (!allWords) continue;
          const phrase = normalizeVietnamese(phraseTokens.map((t) => t.text).join(" "));
          if (vnIndex.has(phrase)) {
            const indices = vnIndex.get(phrase);
            const startChar = phraseTokens[0].start;
            const endChar = phraseTokens[phraseTokens.length - 1].end;
            const entries = Array.from(indices).map((idx) => vnEn[idx]);
            matches.push({
              phrase,
              length: phraseLength,
              startIndex: startIdx,
              startChar,
              endChar,
              maxFrequency: Math.max(...entries.map((e) => e.freq || 0)),
              distanceFromCursor: Math.abs(startIdx + phraseLength / 2 - cursorTokenIndex),
              entries
            });
          }
          const lowercase = phrase.toLowerCase();
          if (phrase !== lowercase && vnIndex.has(lowercase)) {
            const indices = vnIndex.get(lowercase);
            const startChar = phraseTokens[0].start;
            const endChar = phraseTokens[phraseTokens.length - 1].end;
            const entries = Array.from(indices).map((idx) => vnEn[idx]);
            matches.push({
              phrase,
              length: phraseLength,
              startIndex: startIdx,
              startChar,
              endChar,
              maxFrequency: Math.max(...entries.map((e) => e.freq || 0)),
              distanceFromCursor: Math.abs(startIdx + phraseLength / 2 - cursorTokenIndex),
              entries
            });
          }
        }
        if (matches.length > 0) break;
      }
      return matches;
    }
    compareMatches(a, b) {
      if (a.length !== b.length) return b.length - a.length;
      return b.maxFrequency - a.maxFrequency;
    }
  };

  // settings.js
  var SettingsManager = class {
    constructor() {
      this.settings = {
        theme: "system",
        pronunciation: "phonetic",
        dialect: "both"
      };
    }
    async load() {
      return new Promise((resolve) => {
        chrome.storage.sync.get({
          theme: "system",
          pronunciation: "phonetic",
          dialect: "both"
        }, (items) => {
          this.settings = items;
          this.applyTheme();
          resolve(this.settings);
        });
      });
    }
    applyTheme() {
      const theme = this.settings.theme;
      if (theme === "system") {
        const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
        document.documentElement.setAttribute("data-theme", prefersDark ? "dark" : "light");
      } else {
        document.documentElement.setAttribute("data-theme", theme);
      }
    }
    onChanged(callback) {
      chrome.runtime.onMessage.addListener((message) => {
        if (message.action === "settingsChanged") {
          this.settings = message.settings;
          this.applyTheme();
          callback(this.settings);
        }
      });
      if (this.settings.theme === "system") {
        window.matchMedia("(prefers-color-scheme: dark)").addEventListener("change", () => this.applyTheme());
      }
    }
    get(key) {
      return this.settings[key];
    }
  };

  // content.js
  async function init() {
    try {
      const settingsManager = new SettingsManager();
      await settingsManager.load();
      const popup = document.createElement("div");
      popup.id = "saola-popup";
      document.body.appendChild(popup);
      await initializeData();
      registerHandlebarsHelpers();
      const popupManager = new PopupManager(popup);
      const dictionaryLookup = new DictionaryLookup();
      const wordTracker = new WordTracker(popupManager, dictionaryLookup);
      wordTracker.start();
      chrome.runtime.onMessage.addListener((message) => {
        if (message.action === "setEnabled") {
          if (message.enabled) {
            wordTracker.enable();
          } else {
            wordTracker.disable();
          }
          console.log("Extension", message.enabled ? "enabled" : "disabled");
        }
      });
      settingsManager.onChanged((newSettings) => {
        console.log("Settings updated:", newSettings);
        popupManager.refresh();
      });
    } catch (error) {
      console.error("Extension initialization error:", error);
    }
  }
  init();
})();
