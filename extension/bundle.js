(() => {
  // ../shared/utils.js
  function escapeHtml(str) {
    return String(str).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&#39;");
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
      this.range = document.createRange();
      this.initOverlay();
      this.watchForRemoval();
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
    watchForRemoval() {
      const observer = new MutationObserver((mutations) => {
        const overlay = document.getElementById("saola-overlay");
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
    highlightWord(container, start, end, color = "rgba(255, 255, 0, 0.3)") {
      this.clearAll();
      try {
        this.range.setStart(container, start);
        this.range.setEnd(container, end);
        const rects = this.range.getClientRects();
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

  // word-tracker.js
  var WordTracker = class {
    constructor(popupManager2) {
      this.popupManager = popupManager2;
      this.highlightOverlay = new HighlightOverlay();
      this.enabled = true;
      this.segmentCache = /* @__PURE__ */ new Map();
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
      this.enabled = true;
    }
    stop() {
      document.removeEventListener("mousemove", this.handleMouseMove);
      document.removeEventListener("mouseleave", this.handleMouseLeave);
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
        ele?.tagName ?? "UNDEFINED_TAG"
      ) || !range || range.startContainer.nodeType !== Node.TEXT_NODE) {
        this.cleanup();
        return;
      }
      const container = range.startContainer;
      const offset = range.startOffset;
      const text = container.data;
      const cached = this.segmentCache.get(text);
      let result;
      if (cached) {
        result = cached.segments ? this._findSegmentAtPosition(cached.segments, offset) : null;
      } else {
        const response = await chrome.runtime.sendMessage({
          action: "saolaSegment",
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
      if (this.currentWordText === segment.normalized && this.currentWordRange && this.currentWordRange.container === container && this.currentWordRange.start === segment.start) {
        return;
      }
      this.updateCurrentWord(container, segment, e);
      if (!segment.entries.length) {
        this.cleanup();
        return;
      }
      ;
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
    constructor(settingsManager2) {
      this.settingsManager = settingsManager2;
      this.margin = 10;
      this.popup = null;
      this.shortcuts = {
        hn: "Alt+1",
        // Default fallbacks
        sg: "Alt+2"
      };
    }
    async init() {
      await this.createShadowPopup();
      await this.loadShortcuts();
      this.setupSettingsListener();
      this.watchForRemoval();
      return this;
    }
    watchForRemoval() {
      const observer = new MutationObserver((mutations) => {
        const container = document.getElementById("saola-popup-container");
        if (!container) {
          this.init();
          observer.disconnect();
        }
      });
      observer.observe(document.body, {
        childList: true,
        subtree: false
      });
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
    }
    async loadShortcuts() {
      try {
        const response = await chrome.runtime.sendMessage({
          type: "get-saola-shortcuts"
        });
        if (response.success) {
          this.shortcuts = response.shortcuts;
        } else {
          console.log("Failed to load shortcuts:", response.error);
        }
      } catch (error) {
        console.log("Error loading shortcuts:", error);
      }
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
    setupSettingsListener() {
      this.settingsManager.onChanged(() => {
        this.applyTheme();
        this.loadShortcuts();
      });
    }
    show(results) {
      if (!this.popup) {
        console.error("Popup not created yet. Call createShadowPopup() first.");
        return;
      }
      this.popup.innerHTML = "";
      if (results.hasAudio) {
        this.popup.innerHTML = Handlebars.templates.audiorow(this.shortcuts);
      }
      this.popup.innerHTML += Handlebars.templates.popup(results);
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
        if (message.action === "saolaSettingsChanged") {
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
  var settingsManager;
  var popupManager;
  var wordTracker;
  var audioPlayer;
  async function init() {
    try {
      settingsManager = new SettingsManager();
      await settingsManager.load();
      registerHandlebarsHelpers();
      popupManager = new PopupManager(settingsManager);
      await popupManager.init();
      wordTracker = new WordTracker(popupManager);
      audioPlayer = new AudioPlayer();
      chrome.runtime.sendMessage({ action: "getSaolaState" }, async (response) => {
        if (response?.enabled === true) {
          wordTracker.start();
        }
      });
    } catch (error) {
      console.error("Extension initialization error:", error);
    }
  }
  chrome.runtime.onMessage.addListener((message) => {
    if (message.action === "enableSaola") {
      if (message.enabled) {
        wordTracker.start();
      } else {
        wordTracker.stop();
      }
    } else if (message.type === "play-saola-audio") {
      const audioElement = popupManager.popup.querySelector(`.audio-cell-${message.dialect}`);
      audioPlayer.playAudio(message.word, message.dialect, audioElement);
    } else if (message.type === "play-saola-audio-sequence") {
      const audioElement = popupManager.popup.querySelector(`.audio-cell-${message.dialect}`);
      audioPlayer.playAudioSequence(message.word.split(" "), message.dialect, audioElement);
    }
  });
  init();
})();
