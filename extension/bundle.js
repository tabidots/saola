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

  // data-loader.js
  var data = {
    vnEn: [],
    lowercaseIndex: null
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
  function registerHandlebarsHelpers(webAppFunctions = null) {
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
      if (!webAppFunctions) {
        return new Handlebars.SafeString(text);
      }
      const realOffsets = Array.isArray(offsets) ? offsets : [];
      const segs = webAppFunctions.segmentize(text, realOffsets);
      return new Handlebars.SafeString(webAppFunctions.linkify(segs));
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
            data-dialect="${dialect}">
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
  var NAME_COLLISIONS = /* @__PURE__ */ new Set([
    "An Phong",
    "An Nam",
    "An Huy",
    "B\xECnh Ph\u01B0\u1EDBc",
    "B\xECnh \u0110\u1ECBnh",
    "B\xECnh \u0110\xF4ng",
    "Ch\xE2u H\u1EA3i",
    "C\u1EA7n Th\u01A1",
    "C\u1EA9m L\u1EC7",
    "C\u1EA9m Xuy\xEAn",
    "Gia Ngh\u0129a",
    "Gia \u0110\u1ECBnh",
    "Hoa K\u1EF3",
    "Hoa \u0110\xF4ng",
    "Ho\xE0 H\u1EA3o",
    "Ho\xE0 B\xECnh",
    "Hu\u1EC7 Ch\xE2u",
    "H\xE0 Nam",
    "H\xE0 T\u0129nh",
    "H\xE0 Ti\xEAn",
    "H\u01B0\u01A1ng S\u01A1n",
    "H\u1EA3i An",
    "H\u1EA3i Nam",
    "H\u1EA3i V\xE2n",
    "H\u1EA3i Ch\xE2u",
    "H\u1EB1ng Nga",
    "Kh\u1EA3i Huy\u1EC1n",
    "Ki\xEAn H\u1EA3i",
    "Long An",
    "L\xFD S\u01A1n",
    "L\u0129nh Nam",
    "Nam K\u1EF3",
    "Nam H\xE0",
    "Nam \u0110\u1ECBnh",
    "Nam Phi",
    "Ng\xE2n H\xE0",
    "Ng\u1ECDc L\xE2n",
    "Ng\u1ECDc Linh",
    "Ph\u01B0\u1EDBc S\u01A1n",
    "Qu\xFD Ch\xE2u",
    "Qu\u1EA3ng Ch\xE2u",
    "Qu\u1EA3ng Nam",
    "Qu\u1EA3ng T\xE2y",
    "Qu\u1EA3ng \u0110\xF4ng",
    "Qu\u1EA3ng B\xECnh",
    "S\u01A1n \u0110\xF4ng",
    "S\u01A1n Tr\xE0",
    "S\u01A1n T\xE2y",
    "Thanh H\u1EA3i",
    "Thanh Long",
    "Thi\xEAn Nga",
    "Thi\xEAn S\u01A1n",
    "Thi\xEAn Long",
    "Thi\xEAn B\xECnh",
    "Thi\xEAn H\u1EADu",
    "Thi\xEAn C\u1EA7m",
    "Thu\u1EF5 S\u0129",
    "Th\xE1i B\xECnh",
    "Th\xE1i S\u01A1n",
    "Th\u01B0\u1EDDng Nga",
    "Tr\xE0 Vinh",
    "Tr\u01B0\u1EDDng S\u01A1n",
    "Tr\u01B0\u1EDDng Th\xE0nh",
    "T\xE2y \u0110\u1EE9c",
    "T\xE2y An",
    "T\xE2y Phi",
    "T\xE2y S\u01A1n",
    "Vinh S\u01A1n",
    "V\xE2n Nam",
    "Xu\xE2n Thu",
    "\u0110\xE0i \u0110\xF4ng",
    "\u0110\xE0i S\u01A1n",
    "\u0110\xE0i Loan",
    "\u0110\xE0i Nam",
    "\u0110\xF4ng Du",
    "\u0110\xF4ng \u0110\u1EE9c",
    "\u0110\xF4ng Phi",
    "\u0110\xF4ng S\u01A1n",
    "\u0110\u1ED3ng Xu\xE2n"
  ]);
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
      this.maxSegmentLength = 7;
      this.audioCache = /* @__PURE__ */ new Map();
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
        for (let len = 1; len <= Math.min(this.maxSegmentLength, n - i); len++) {
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
        const primaryEntry = bt.primaryMatch ? vnEn[bt.primaryMatch] : null;
        const isNameComponent = bt.phraseLength === 1 && hasCapital(rawText) && primaryEntry?.lexemes.some((lexeme) => {
          return lexeme.pos === "proper noun" && (lexeme.senses.find((s) => s.gloss.includes("given name")) || lexeme.senses.find((s) => s.gloss.includes("surname")) || lexeme.senses.find((s) => s.gloss.includes("name")));
        });
        const secondaryEntry = bt.secondaryMatch ? vnEn[bt.secondaryMatch] : null;
        segments.unshift({
          text: rawText,
          canonical: bt.canonical,
          start: bt.startPos,
          end: bt.endPos,
          wordCount: bt.phraseLength,
          hasAudio: primaryEntry?.has_audio,
          frequency: bt.frequency,
          isUnknown: !bt.found,
          isNameComponent,
          entries: [primaryEntry, secondaryEntry].filter(Boolean)
        });
        idx = bt.prevIndex;
      }
      console.log("Segmented:", segments.map((s) => s.text).join(" | "));
      return this.mergeNameSegments(segments);
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
    mergeNameSegments(segments) {
      const isNameComponent = (curSegment, prevSegment = null) => {
        if (curSegment.isNameComponent) return true;
        if (!prevSegment) return false;
        if (prevSegment.entries?.[0]?.lexemes.some(
          (lexeme) => lexeme.senses.some(
            (s) => s.gloss.includes("surname")
          ) && NAME_COLLISIONS.has(curSegment.canonical)
        )) {
          return true;
        }
        return false;
      };
      const result = [];
      let i = 0;
      while (i < segments.length) {
        const nameComponents = [];
        while (i < segments.length && nameComponents.length < 4) {
          const prevSegment = i > 0 ? segments[i - 1] : null;
          if (isNameComponent(segments[i], prevSegment)) {
            nameComponents.push(segments[i]);
            i++;
          } else {
            break;
          }
        }
        if (nameComponents.length >= 2) {
          result.push(this.createNameSegment(nameComponents));
        } else if (nameComponents.length === 1) {
          result.push(nameComponents[0]);
        } else if (i < segments.length) {
          result.push(segments[i]);
          i++;
        }
      }
      return result;
    }
    nameHasAudio(segments) {
      const { vnEn } = getData();
      for (const seg of segments) {
        const components = seg.canonical.split(" ");
        for (const comp of components) {
          if (this.audioCache.has(comp)) {
            if (!this.audioCache.get(comp)) return false;
            continue;
          }
          const { primaryMatch } = this.getBestMatchingHeadword(comp);
          const entry = primaryMatch ? vnEn[primaryMatch] : null;
          const hasAudio = entry?.has_audio ?? false;
          this.audioCache.set(comp, hasAudio);
          if (!hasAudio) return false;
        }
      }
      return true;
    }
    createNameSegment(segments) {
      const first = segments[0];
      const last = segments[segments.length - 1];
      const canonical = segments.map((s) => s.canonical).join(" ");
      const trimIPAAlts = (str) => {
        const parts = str.split(" ~ ");
        return parts[0];
      };
      return {
        text: segments.map((s) => s.text).join(" "),
        canonical,
        start: first.start,
        end: last.end,
        wordCount: segments.length,
        frequency: 0,
        // doesn't matter
        hasAudio: segments.every((s) => s.hasAudio) || this.nameHasAudio(segments),
        isMergedName: true,
        // necessary for handling audio playback
        entries: [
          {
            word: canonical,
            ipa_hn: segments.map((s) => trimIPAAlts(s.entries[0]?.ipa_hn || "")).join(" "),
            ipa_sg: segments.map((s) => trimIPAAlts(s.entries[0]?.ipa_sg || "")).join(" "),
            phonetic_hn: segments.map((s) => trimIPAAlts(s.entries[0]?.phonetic_hn || "")).join(" "),
            phonetic_sg: segments.map((s) => trimIPAAlts(s.entries[0]?.phonetic_sg || "")).join(" "),
            lexemes: [
              {
                pos: "name",
                senses: [
                  {
                    gloss: "personal name"
                  }
                ]
              }
            ]
          }
        ]
      };
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
    async handleMouseMove(e) {
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
      if (!segment.entries.length) return;
      if (this.popupManager?.audioPlayer) {
        await this.popupManager.audioPlayer.initializeWithGesture();
      }
      try {
        chrome.runtime.sendMessage({
          type: "update-current-word",
          word: segment.hasAudio ? segment.text : "",
          isMergedName: segment.isMergedName
        });
      } catch (error) {
        if (!error.message.includes("Extension context invalidated")) {
          console.warn("Failed to send message:", error);
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
    constructor(settingsManager) {
      this.settingsManager = settingsManager;
      this.margin = 10;
      this.popup = null;
    }
    async createShadowPopup() {
      const container = document.createElement("div");
      container.id = "saola-popup-container";
      document.body.appendChild(container);
      const shadow = container.attachShadow({ mode: "open" });
      const cssUrl = chrome.runtime.getURL("popup.css");
      const response = await fetch(cssUrl);
      const cssText = await response.text();
      const style = document.createElement("style");
      style.textContent = cssText.replace(
        /url\(['"]?img\//g,
        `url('${chrome.runtime.getURL("img/")}`
      );
      ;
      shadow.appendChild(style);
      this.popup = document.createElement("div");
      this.popup.id = "saola-popup";
      shadow.appendChild(this.popup);
      this.container = container;
      this.shadow = shadow;
      this.applyTheme();
      this.setupThemeListener();
    }
    applyTheme() {
      if (!this.popup) return;
      const settings = this.settingsManager.getSettings();
      let theme = settings.theme;
      if (theme === "system") {
        theme = window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
      }
      this.popup.setAttribute("data-theme", theme);
      this.popup.setAttribute("data-pronunciation", settings.pronunciation);
      this.popup.setAttribute("data-dialect", settings.dialect);
    }
    setupThemeListener() {
      this.settingsManager.onChanged(() => {
        this.applyTheme();
      });
    }
    show(results) {
      if (!this.popup) {
        console.error("Popup not created yet. Call createShadowPopup() first.");
        return;
      }
      this.popup.innerHTML = Handlebars.templates.popup(results);
      this.popup.style.display = "flex";
    }
    hide() {
      this.popup.style.display = "none";
    }
    position(x, y) {
      if (x + this.margin + this.popup.offsetWidth > window.innerWidth) {
        this.container.style.right = "0px";
        this.container.style.left = "unset";
      } else {
        this.container.style.left = `${x}px`;
        this.container.style.right = "unset";
      }
      if (y + this.margin + this.popup.offsetHeight > window.innerHeight) {
        this.container.style.bottom = `${window.innerHeight - y + this.margin}px`;
        this.container.style.top = "unset";
      } else {
        this.container.style.top = `${y}px`;
        this.container.style.bottom = "unset";
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
      this.listeners = /* @__PURE__ */ new Set();
    }
    async load() {
      return new Promise((resolve) => {
        chrome.storage.sync.get({
          theme: "system",
          pronunciation: "phonetic",
          dialect: "both"
        }, (items) => {
          this.settings = items;
          this.notifyListeners();
          resolve(this.settings);
        });
      });
    }
    getSettings() {
      return { ...this.settings };
    }
    get(key) {
      return this.settings[key];
    }
    // New: Add event listener
    onChanged(callback) {
      this.listeners.add(callback);
      chrome.runtime.onMessage.addListener((message) => {
        if (message.action === "settingsChanged") {
          this.settings = message.settings;
          this.notifyListeners();
        }
      });
      const handleSystemThemeChange = () => {
        if (this.settings.theme === "system") {
          this.notifyListeners();
        }
      };
      window.matchMedia("(prefers-color-scheme: dark)").addEventListener("change", handleSystemThemeChange);
      return () => {
        this.listeners.delete(callback);
        window.matchMedia("(prefers-color-scheme: dark)").removeEventListener("change", handleSystemThemeChange);
      };
    }
    // New: Notify all listeners
    notifyListeners() {
      this.listeners.forEach((callback) => {
        try {
          callback(this.settings);
        } catch (error) {
          console.error("Settings listener error:", error);
        }
      });
    }
  };

  // audio-player.js
  var AudioPlayer = class {
    constructor() {
      this.audioContext = null;
      this.currentSource = null;
      this.isContextInitialized = false;
      this.gainNode = null;
      this.sequenceQueue = [];
      this.isPlayingSequence = false;
      this.currentSources = [];
    }
    initializeWithGesture() {
      if (!this.audioContext) {
        this.audioContext = new AudioContext({ latencyHint: "interactive" });
      }
      if (this.audioContext.state === "suspended") {
        return this.audioContext.resume();
      }
      return Promise.resolve();
    }
    async ensureAudioContext() {
      if (!this.audioContext) {
        this.audioContext = new AudioContext({ latencyHint: "interactive" });
      }
      if (this.audioContext.state === "suspended") {
        return false;
      }
      return true;
    }
    async resumeIfSuspended() {
      if (this.audioContext && this.audioContext.state === "suspended") {
        await this.audioContext.resume();
        return true;
      }
      return false;
    }
    async playAudio(word, dialect, audioElement = null) {
      await this.ensureAudioContext();
      const wasResumed = await this.resumeIfSuspended();
      if (!wasResumed && this.audioContext?.state === "suspended") {
        console.log("\u274C AudioContext still suspended - needs user gesture");
        return;
      }
      const filename = `${word.replace(/\s+/g, "-")}-${dialect}.mp3`;
      try {
        audioElement?.classList.add("loading");
        const response = await chrome.runtime.sendMessage({
          type: "fetch-audio",
          filename,
          word,
          dialect
        });
        if (!response.success) {
          console.log("\u274C Background failed:", response.error);
          return;
        }
        const audioBuffer = this.base64ToArrayBuffer(response.data);
        audioElement?.classList.remove("loading");
        audioElement?.classList.add("playing");
        await this.playAudioBuffer(audioBuffer, audioElement);
      } catch (error) {
        console.log("\u274C Audio playback failed:", error);
      }
    }
    // Helper: Convert base64 to ArrayBuffer
    base64ToArrayBuffer(base64) {
      const binaryString = atob(base64);
      const bytes = new Uint8Array(binaryString.length);
      for (let i = 0; i < binaryString.length; i++) {
        bytes[i] = binaryString.charCodeAt(i);
      }
      return bytes.buffer;
    }
    async playAudioBuffer(arrayBuffer, audioElement = null) {
      if (this.audioContext.state === "suspended") {
        console.log("\u274C Cannot play - AudioContext still suspended");
        return;
      }
      const audioBuffer = await this.audioContext.decodeAudioData(arrayBuffer);
      const source = this.audioContext.createBufferSource();
      source.buffer = audioBuffer;
      source.connect(this.audioContext.destination);
      this.currentSources.push(source);
      source.onended = () => {
        this.currentSources = [];
        audioElement?.classList.remove("playing");
      };
      source.start(0);
    }
    async playAudioSequence(words, dialect, audioElement = null, overlapMs = -400) {
      await this.ensureAudioContext();
      const wasResumed = await this.resumeIfSuspended();
      if (!wasResumed && this.audioContext?.state === "suspended") {
        console.log("\u274C AudioContext still suspended - needs user gesture");
        return;
      }
      this.stopCurrent();
      if (!this.gainNode) {
        this.gainNode = this.audioContext.createGain();
        this.gainNode.connect(this.audioContext.destination);
      }
      this.isPlayingSequence = true;
      this.sequenceQueue = [];
      this.currentSources = [];
      const buffers = [];
      audioElement?.classList.add("loading");
      for (const word of words) {
        try {
          const response = await chrome.runtime.sendMessage({
            type: "fetch-audio",
            filename: `${word.toLowerCase().replace(/\s+/g, "-")}-${dialect}.mp3`,
            word,
            dialect
          });
          if (!response.success) throw new Error(response.error);
          const audioBuffer = this.base64ToArrayBuffer(response.data);
          const decodedBuffer = await this.audioContext.decodeAudioData(audioBuffer);
          buffers.push({
            word,
            buffer: decodedBuffer
          });
        } catch (error) {
          audioElement?.classList.remove("loading");
          console.log(`\u274C Error loading "${word}":`, error);
          buffers.push({
            word,
            buffer: null,
            error: true
          });
        }
      }
      audioElement?.classList.remove("loading");
      if (buffers.length === 0) return;
      let currentTime = this.audioContext.currentTime + 0.1;
      for (let i = 0; i < buffers.length; i++) {
        if (buffers[i].error || !buffers[i].buffer) continue;
        const source = this.audioContext.createBufferSource();
        const gain = this.audioContext.createGain();
        source.buffer = buffers[i].buffer;
        source.connect(gain);
        gain.connect(this.gainNode);
        const fadeDuration = 0.02;
        gain.gain.setValueAtTime(0, currentTime);
        gain.gain.linearRampToValueAtTime(1, currentTime + fadeDuration);
        const duration = buffers[i].buffer.duration;
        const endTime = currentTime + duration;
        gain.gain.setValueAtTime(1, endTime - fadeDuration);
        gain.gain.linearRampToValueAtTime(0, endTime);
        audioElement?.classList.add("playing");
        source.start(currentTime);
        if (i < buffers.length - 1 && overlapMs < 0) {
          currentTime = currentTime + duration + overlapMs / 1e3;
        } else {
          currentTime = endTime;
        }
        this.currentSources.push(source);
        source.onended = () => {
          const index = this.currentSources.indexOf(source);
          if (index > -1) this.currentSources.splice(index, 1);
        };
      }
      const totalDuration = currentTime - this.audioContext.currentTime;
      setTimeout(() => {
        audioElement?.classList.remove("playing");
        this.isPlayingSequence = false;
      }, totalDuration * 1e3);
    }
    stopCurrent() {
      this.currentSources.forEach((source) => {
        try {
          source.stop();
        } catch (e) {
        }
      });
      this.currentSources = [];
      this.isPlayingSequence = false;
    }
  };

  // content.js
  async function init() {
    try {
      const settingsManager = new SettingsManager();
      await settingsManager.load();
      await initializeData();
      registerHandlebarsHelpers();
      const popupManager = new PopupManager(settingsManager);
      await popupManager.createShadowPopup();
      const wordTracker = new WordTracker(popupManager);
      wordTracker.start();
      const audioPlayer = new AudioPlayer();
      chrome.runtime.onMessage.addListener((message) => {
        if (message.action === "setEnabled") {
          if (message.enabled) {
            wordTracker.enable();
          } else {
            wordTracker.disable();
          }
          console.log("Extension", message.enabled ? "enabled" : "disabled");
        } else if (message.type === "play-audio") {
          const audioElement = popupManager.popup.querySelector(`.audio-cell-${message.dialect}`);
          audioPlayer.playAudio(message.word, message.dialect, audioElement);
        } else if (message.type === "play-audio-sequence") {
          const audioElement = popupManager.popup.querySelector(`.audio-cell-${message.dialect}`);
          audioPlayer.playAudioSequence(message.word.split(" "), message.dialect, audioElement);
        }
      });
    } catch (error) {
      console.error("Extension initialization error:", error);
    }
  }
  init();
})();
