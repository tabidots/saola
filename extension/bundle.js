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
    data.lowercaseIndex = /* @__PURE__ */ new Map();
    data.vnEn.forEach((entry, idx) => {
      entry._idx = idx;
      const terms = [entry.word, entry.alt_spelling].filter(Boolean);
      for (const term of terms) {
        const lower = term.toLowerCase();
        if (!data.lowercaseIndex.has(lower)) {
          data.lowercaseIndex.set(lower, []);
        }
        const canonicalForms = data.lowercaseIndex.get(lower);
        if (canonicalForms.length > 2) {
          console.log("Too many canonical forms:", canonicalForms);
          continue;
        }
        let existing = canonicalForms.find((cf) => cf.canonical === term);
        if (existing) {
          console.log("Canonical form already exists:", existing);
          continue;
        }
        canonicalForms.push({
          canonical: term,
          freq: entry.freq || 0,
          index: idx
        });
      }
      ;
    });
  }
  function getData() {
    return {
      vnEn: data.vnEn,
      lowercaseIndex: data.lowercaseIndex
    };
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
      this.currentHighlights = [];
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
            z-index: 10000;
        `;
      document.body.appendChild(this.overlay);
    }
    highlightWord(container, start, end, color = "rgba(255, 255, 0, 0.3)") {
      this.clearAll();
      try {
        const range = document.createRange();
        range.setStart(container, start);
        range.setEnd(container, end);
        const rects = range.getClientRects();
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
                    border-radius: 2px;
                    pointer-events: none;
                `;
          this.overlay.appendChild(highlight);
          this.currentHighlights.push(highlight);
        }
      } catch (e) {
        console.error("Error creating highlight:", e);
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
  };

  // segmenter.js
  function normalizeVietnamese(text) {
    let normalized = text;
    if (normalized.length > 1 && normalized === normalized.toUpperCase()) {
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
  function hasCapital(text) {
    return text !== text.toLowerCase();
  }
  var TextSegmenter = class {
    /**
     * Segment text to minimize number of segments (prefer longer phrases)
     * Use aggregate frequency as tiebreaker
     */
    constructor() {
      this.freqCache = /* @__PURE__ */ new Map();
    }
    getBestMatchingHeadword(rawText) {
      if (this.freqCache.has(rawText)) {
        return this.freqCache.get(rawText);
      }
      const { lowercaseIndex } = getData();
      const lowercaseRaw = rawText.toLowerCase();
      const canonicalForms = lowercaseIndex.get(lowercaseRaw);
      let result = {
        found: false,
        canonical: null,
        frequency: 0,
        primaryMatch: null,
        secondaryMatch: null
      };
      if (!canonicalForms || canonicalForms.length === 0) {
        this.freqCache.set(rawText, result);
        return result;
      }
      const lowercaseForm = canonicalForms.find((cf) => !hasCapital(cf.canonical));
      const capitalForm = canonicalForms.find((cf) => hasCapital(cf.canonical));
      if (hasCapital(rawText) && capitalForm) {
        result = {
          found: true,
          canonical: capitalForm.canonical,
          frequency: capitalForm.freq,
          primaryMatch: capitalForm.index,
          secondaryMatch: lowercaseForm?.index
        };
      } else {
        const bestForm = lowercaseForm || capitalForm || canonicalForms[0];
        const otherForm = canonicalForms.length > 1 ? canonicalForms.find(
          (cf) => cf.index !== bestForm.index
        ) : null;
        result = {
          found: true,
          canonical: bestForm.canonical,
          frequency: bestForm.freq,
          primaryMatch: bestForm.index,
          secondaryMatch: otherForm?.index
        };
      }
      this.freqCache.set(rawText, result);
      return result;
    }
    segment(text) {
      const { vnEn } = getData();
      const allTokens = tokenizeWithPositions(text);
      const wordTokens = allTokens.filter((t) => t.isWord);
      const n = wordTokens.length;
      if (n === 0) return [];
      const best = new Array(n + 1).fill(null);
      const backtrack = new Array(n + 1).fill(null);
      best[0] = { segmentCount: 0, totalFreq: 0 };
      for (let i = 0; i < n; i++) {
        if (!best[i]) continue;
        for (let len = 1; len <= Math.min(5, n - i); len++) {
          const phraseTokens = wordTokens.slice(i, i + len);
          const startPos = phraseTokens[0].start;
          const endPos = phraseTokens[phraseTokens.length - 1].end;
          const rawText = normalizeVietnamese(text.substring(startPos, endPos));
          const { found, frequency, canonical, primaryMatch, secondaryMatch } = this.getBestMatchingHeadword(rawText);
          if (!found && len > 1) continue;
          const newSegmentCount = best[i].segmentCount + 1;
          const newTotalFreq = best[i].totalFreq + frequency;
          const shouldUpdate = !best[i + len] || newSegmentCount < best[i + len].segmentCount || newSegmentCount === best[i + len].segmentCount && newTotalFreq > best[i + len].totalFreq;
          if (shouldUpdate) {
            best[i + len] = {
              segmentCount: newSegmentCount,
              totalFreq: newTotalFreq
            };
            backtrack[i + len] = {
              prevIndex: i,
              phraseLength: len,
              frequency,
              found,
              startPos,
              endPos,
              canonical,
              primaryMatch,
              secondaryMatch
            };
          }
        }
      }
      if (!best[n]) {
        console.warn("No valid segmentation found for:", text.substring(0, 50));
        return wordTokens.map((token) => ({
          text: token.text,
          normalized: normalizeVietnamese(token.text),
          start: token.start,
          end: token.end,
          wordCount: 1,
          frequency: 0,
          isUnknown: true
        }));
      }
      const segments = [];
      let idx = n;
      while (idx > 0) {
        const bt = backtrack[idx];
        if (!bt) {
          console.error("Backtrack failed at position", idx);
          break;
        }
        const rawText = normalizeVietnamese(text.substring(bt.startPos, bt.endPos));
        segments.unshift({
          text: rawText,
          canonical: bt.canonical,
          start: bt.startPos,
          end: bt.endPos,
          wordCount: bt.phraseLength,
          frequency: bt.frequency,
          isUnknown: !bt.found,
          primaryEntry: bt.primaryMatch ? vnEn[bt.primaryMatch] : null,
          secondaryEntry: bt.secondaryMatch ? vnEn[bt.secondaryMatch] : null
        });
        idx = bt.prevIndex;
      }
      console.log("Segmented:", segments.map((s) => s.text).join(" | "));
      return segments;
    }
    findSegmentAtPosition(segments, cursorPos) {
      for (let i = 0; i < segments.length; i++) {
        const seg = segments[i];
        if (cursorPos >= seg.start && cursorPos < seg.end) {
          return { segment: seg, index: i };
        }
      }
      return null;
    }
  };

  // word-tracker.js
  var WordTracker = class {
    constructor(popupManager) {
      this.popupManager = popupManager;
      this.highlightOverlay = new HighlightOverlay();
      this.enabled = true;
      this.textSegmenter = new TextSegmenter();
      this.segmentCache = /* @__PURE__ */ new WeakMap();
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
      if (!this.enabled) return;
      this.lastMouseEvent = e;
      this.popupManager.position(e.clientX, e.clientY);
      const ele = document.elementFromPoint(e.clientX, e.clientY);
      const range = document.caretRangeFromPoint(e.clientX, e.clientY);
      if (["TEXTAREA", "INPUT", "SELECT", "HTML", "BODY"].includes(ele.tagName) || !range || range.startContainer.nodeType !== Node.TEXT_NODE) {
        this.cleanup();
        return;
      }
      const container = range.startContainer;
      const offset = range.startOffset;
      const text = container.data;
      let cached = this.segmentCache.get(container);
      let segments;
      if (!cached || cached.text !== text) {
        segments = this.textSegmenter.segment(text);
        this.segmentCache.set(container, {
          segments,
          text,
          // Store the text too!
          timestamp: Date.now()
        });
      } else {
        segments = cached.segments;
      }
      const result = this.textSegmenter.findSegmentAtPosition(segments, offset);
      if (!result) {
        this.cleanup();
        return;
      }
      const { segment, index } = result;
      if (this.currentWordText === segment.normalized && this.currentWordRange && this.currentWordRange.container === container && this.currentWordRange.start === segment.start) {
        return;
      }
      this.updateCurrentWord(container, segment, e);
      const matches = [segment.primaryEntry, segment.secondaryEntry].filter(Boolean);
      if (!matches.length) return;
      this.highlightOverlay.clearAll();
      this.highlightOverlay.highlightWord(container, segment.start, segment.end);
      this.popupManager.show(matches, event.clientX, event.clientY);
    }
    handleMouseLeave() {
      this.cleanup();
    }
    cleanup() {
      this.clearCurrentWord();
      this.highlightOverlay.clearAll();
      this.popupManager.hide();
    }
    updateCurrentWord(container, segment, event2) {
      this.currentWordRange = {
        container,
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
      for (const entry of results) {
        this.popup.innerHTML += Handlebars.templates.popup(entry);
      }
      this.popup.style.display = "flex";
    }
    hide() {
      this.popup.style.display = "none";
    }
    position(x, y) {
      if (x + this.margin + this.popup.offsetWidth > window.innerWidth) {
        this.popup.style.left = "unset";
        this.popup.style.right = "0px";
      } else {
        this.popup.style.right = "unset";
        this.popup.style.left = `${x}px`;
      }
      if (y + this.margin + this.popup.offsetHeight > window.innerHeight) {
        this.popup.style.top = "unset";
        this.popup.style.bottom = `${window.innerHeight - y + this.margin}px`;
      } else {
        this.popup.style.bottom = "unset";
        this.popup.style.top = `${y}px`;
      }
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
      const wordTracker = new WordTracker(popupManager);
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
