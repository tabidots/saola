import { initializeData } from './data-loader.js';
import { registerHandlebarsHelpers } from '../shared/templates.js';
import { WordTracker } from './word-tracker.js';
import { PopupManager } from './popup-manager.js';
import { DictionaryLookup } from './dictionary-lookup.js';

async function init() {
    try {

        document.documentElement.style.setProperty(
            '--icon-speaker',
            `url("${chrome.runtime.getURL('img/1f508.svg')}")`
        );
        document.documentElement.style.setProperty(
            '--icon-speaker-playing',
            `url("${chrome.runtime.getURL('img/1f50a.svg')}")`
        );
        
        // Create popup element
        const popup = document.createElement('div');
        popup.id = 'saola-popup';
        document.body.appendChild(popup);

        await initializeData();
        registerHandlebarsHelpers();

        const popupManager = new PopupManager(popup);
        const dictionaryLookup = new DictionaryLookup();
        const wordTracker = new WordTracker(popupManager, dictionaryLookup);

        wordTracker.start();
        
        // Listen for toggle command from background
        chrome.runtime.onMessage.addListener((message) => {
            if (message.action === 'toggle') {
                wordTracker.toggle();
                console.log("on!")
            }
        });

    } catch (error) {
        console.error('Extension initialization error:', error);
    }
}

init();