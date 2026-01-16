import { initializeData } from './data-loader.js';
import { registerHandlebarsHelpers } from '../shared/templates.js';
import { WordTracker } from './word-tracker.js';
import { PopupManager } from './popup-manager.js';
import { SettingsManager } from './settings.js';
import { AudioPlayer } from './audio-player.js';

async function init() {
    try {
        const settingsManager = new SettingsManager();
        await settingsManager.load();

        await initializeData();
        registerHandlebarsHelpers();

        const popupManager = new PopupManager(settingsManager);
        await popupManager.init();
        
        const wordTracker = new WordTracker(popupManager);
        
        const audioPlayer = new AudioPlayer();
        
        // Ask background for this tab's state
        chrome.runtime.sendMessage({ action: 'getState' }, (response) => {
            if (response && response.enabled === true) {
                wordTracker.start();
            }
        });

        chrome.runtime.onMessage.addListener((message) => {
            if (message.action === 'setEnabled') {
                if (message.enabled) {
                    wordTracker.start();
                } else {
                    wordTracker.stop();
                }
                console.log('Extension', message.enabled ? 'enabled' : 'disabled');
            } else if (message.type === 'play-audio') {
                const audioElement = popupManager.popup.querySelector(`.audio-cell-${message.dialect}`);
                audioPlayer.playAudio(message.word, message.dialect, audioElement);
            } else if (message.type === 'play-audio-sequence') {
                const audioElement = popupManager.popup.querySelector(`.audio-cell-${message.dialect}`);
                audioPlayer.playAudioSequence(message.word.split(' '), message.dialect, audioElement);
            }

        });

    } catch (error) {
        console.error('Extension initialization error:', error);
    }
}

init();