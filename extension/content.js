import { initializeData } from './data-loader.js';
import { registerHandlebarsHelpers } from '../shared/templates.js';
import { WordTracker } from './word-tracker.js';
import { PopupManager } from './popup-manager.js';
import { SettingsManager } from './settings.js';
import { AudioPlayer } from './audio-player.js';

let settingsManager;
let popupManager;
let wordTracker;
let dataLoaded = false;

async function ensureInitialized() {
    if (dataLoaded) return;

    console.log('Loading dictionary data...');
    await initializeData();
    dataLoaded = true;
    console.log('Dictionary data loaded');
}

async function init() {
    try {
        const settingsManager = new SettingsManager();
        await settingsManager.load();

        registerHandlebarsHelpers();

        popupManager = new PopupManager(settingsManager);
        await popupManager.init();
        
        wordTracker = new WordTracker(popupManager);
        
        audioPlayer = new AudioPlayer();
        
        // Ask background for this tab's state
        chrome.runtime.sendMessage({ action: 'getSaolaState' }, async (response) => {
            if (response && response.enabled === true) {
                if (response && response.enabled === true) {
                    await ensureInitialized();
                    wordTracker.start();
                }
            }
        });

    } catch (error) {
        console.error('Extension initialization error:', error);
    }
}

chrome.runtime.onMessage.addListener(async (message) => {
    if (message.action === 'enableSaola') {
        if (message.enabled) {
            await ensureInitialized();
            wordTracker.start();
        } else {
            wordTracker.stop();
        }
        // console.log('Saola extension', message.enabled ? 'enabled' : 'disabled');
    } else if (message.type === 'play-saola-audio') {
        const audioElement = popupManager.popup.querySelector(`.audio-cell-${message.dialect}`);
        audioPlayer.playAudio(message.word, message.dialect, audioElement);
    } else if (message.type === 'play-saola-audio-sequence') {
        const audioElement = popupManager.popup.querySelector(`.audio-cell-${message.dialect}`);
        audioPlayer.playAudioSequence(message.word.split(' '), message.dialect, audioElement);
    }

});

init();