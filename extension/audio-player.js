export class AudioPlayer {
    constructor() {
        this.audioContext = null; // Don't create immediately
        this.currentSource = null;
        this.isContextInitialized = false;
        this.gainNode = null;
        this.sequenceQueue = [];
        this.isPlayingSequence = false;
        this.currentSources = []; // Track multiple sources for overlap
    }

    initializeWithGesture() {
        if (!this.audioContext) {
            this.audioContext = new AudioContext({ latencyHint: 'interactive' });
        }
        if (this.audioContext.state === 'suspended') {
            return this.audioContext.resume();
        }
        return Promise.resolve();
    }

    async ensureAudioContext() {
        if (!this.audioContext) {
            // Create AudioContext but start in suspended state
            this.audioContext = new AudioContext({ latencyHint: 'interactive' });
        }

        // If context is suspended, we need user gesture to resume it
        if (this.audioContext.state === 'suspended') {
            // Don't resume here - let the caller handle it with a user gesture
            return false;
        }

        return true;
    }

    async resumeIfSuspended() {
        if (this.audioContext && this.audioContext.state === 'suspended') {
            await this.audioContext.resume();
            return true;
        }
        return false;
    }

    async playAudio(word, dialect, audioElement = null) {
        // Ensure we have an AudioContext
        await this.ensureAudioContext();

        // Check if context needs to be resumed
        const wasResumed = await this.resumeIfSuspended();
        if (!wasResumed && this.audioContext?.state === 'suspended') {
            console.log('❌ AudioContext still suspended - needs user gesture');
            return;
        }

        // 1. Create filename
        const filename = `${word.replace(/\s+/g, '-')}-${dialect}.mp3`;

        // 2. Send to background script
        try {
            audioElement?.classList.add('loading');
            const response = await chrome.runtime.sendMessage({
                type: 'fetch-audio',
                filename: filename,
                word: word,
                dialect: dialect
            });

            if (!response.success) {
                console.log('❌ Background failed:', response.error);
                return;
            }

            // 3. Convert base64 back to ArrayBuffer
            const audioBuffer = this.base64ToArrayBuffer(response.data);

            // 4. Play the audio
            audioElement?.classList.remove('loading');
            audioElement?.classList.add('playing');
            await this.playAudioBuffer(audioBuffer, audioElement);
            
        } catch (error) {
            console.log('❌ Audio playback failed:', error);
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
        // Double-check context state
        if (this.audioContext.state === 'suspended') {
            console.log('❌ Cannot play - AudioContext still suspended');
            return;
        }

        const audioBuffer = await this.audioContext.decodeAudioData(arrayBuffer);
        const source = this.audioContext.createBufferSource();
        source.buffer = audioBuffer;
        source.connect(this.audioContext.destination);

        this.currentSources.push(source);

        source.onended = () => {
            this.currentSources = []
            audioElement?.classList.remove('playing');
        };

        source.start(0);
    }

    async playAudioSequence(words, dialect, audioElement = null, overlapMs = -400) {
        // console.log('🎵 AudioPlayer: Requesting audio sequence for', words, dialect);

        // Ensure AudioContext is ready
        await this.ensureAudioContext();
        const wasResumed = await this.resumeIfSuspended();
        if (!wasResumed && this.audioContext?.state === 'suspended') {
            console.log('❌ AudioContext still suspended - needs user gesture');
            return;
        }

        // Stop any current playback
        this.stopCurrent();

        // Create gain node for smooth transitions
        if (!this.gainNode) {
            this.gainNode = this.audioContext.createGain();
            this.gainNode.connect(this.audioContext.destination);
        }

        // Prepare the sequence
        this.isPlayingSequence = true;
        this.sequenceQueue = [];
        this.currentSources = [];

        // Load all audio buffers
        const buffers = [];
        audioElement?.classList.add('loading');
        for (const word of words) {
            try {
                const response = await chrome.runtime.sendMessage({
                    type: 'fetch-audio',
                    filename: `${word.toLowerCase().replace(/\s+/g, '-')}-${dialect}.mp3`,
                    word: word,
                    dialect: dialect
                });

                if (!response.success) throw new Error(response.error);

                const audioBuffer = this.base64ToArrayBuffer(response.data);
                const decodedBuffer = await this.audioContext.decodeAudioData(audioBuffer);

                buffers.push({
                    word: word,
                    buffer: decodedBuffer
                });

            } catch (error) {
                audioElement?.classList.remove('loading');
                console.log(`❌ Error loading "${word}":`, error);
                // Use a placeholder or skip
                buffers.push({
                    word: word,
                    buffer: null,
                    error: true
                });
            }
        }
        audioElement?.classList.remove('loading');

        if (buffers.length === 0) return;

        // Calculate start times with overlap
        let currentTime = this.audioContext.currentTime + 0.1; // Small delay

        for (let i = 0; i < buffers.length; i++) {
            if (buffers[i].error || !buffers[i].buffer) continue;

            const source = this.audioContext.createBufferSource();
            const gain = this.audioContext.createGain();

            source.buffer = buffers[i].buffer;
            source.connect(gain);
            gain.connect(this.gainNode);

            // Fade in/out for smoother transitions
            const fadeDuration = 0.02; // 20ms fade

            // Start with slight fade in
            gain.gain.setValueAtTime(0, currentTime);
            gain.gain.linearRampToValueAtTime(1, currentTime + fadeDuration);

            // Calculate end time
            const duration = buffers[i].buffer.duration;
            const endTime = currentTime + duration;

            // Fade out at the end
            gain.gain.setValueAtTime(1, endTime - fadeDuration);
            gain.gain.linearRampToValueAtTime(0, endTime);

            // Schedule playback
            audioElement?.classList.add('playing');
            source.start(currentTime);

            // Schedule next word to start before this one ends
            if (i < buffers.length - 1 && overlapMs < 0) {
                // Start next word before current ends
                currentTime = currentTime + duration + (overlapMs / 1000);
            } else {
                currentTime = endTime;
            }

            this.currentSources.push(source);

            source.onended = () => {
                // console.log(`⏹️ Finished: "${buffers[i].word}"`);
                // Remove from currentSources
                const index = this.currentSources.indexOf(source);
                if (index > -1) this.currentSources.splice(index, 1);
            };
        }

        // Set a timeout to mark sequence as complete
        const totalDuration = currentTime - this.audioContext.currentTime;
        setTimeout(() => {
            audioElement?.classList.remove('playing');
            this.isPlayingSequence = false;
            // console.log('✅ Sequence complete');
        }, totalDuration * 1000);
    }

    stopCurrent() {
        // Stop all current sources
        this.currentSources.forEach(source => {
            try {
                source.stop();
            } catch (e) {
                // Source might already be stopped
            }
        });
        this.currentSources = [];
        this.isPlayingSequence = false;
    }
}