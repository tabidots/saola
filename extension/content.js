import { initializeData } from './data-loader.js';
import { registerHandlebarsHelpers } from '../shared/templates.js';
import { WordTracker } from './word-tracker.js';
import { PopupManager } from './popup-manager.js';
import { SettingsManager } from './settings.js';

async function init() {
    try {
        const settingsManager = new SettingsManager();
        await settingsManager.load();

        // Create popup element
        const popup = document.createElement('div');
        popup.id = 'saola-popup';
        document.body.appendChild(popup);

        await initializeData();
        registerHandlebarsHelpers();

        const popupManager = new PopupManager(popup);
        const wordTracker = new WordTracker(popupManager);

        wordTracker.start();
        
        // Listen for toggle command from background
        chrome.runtime.onMessage.addListener((message) => {
            if (message.action === 'setEnabled') {
                if (message.enabled) {
                    wordTracker.enable();
                } else {
                    wordTracker.disable();
                }
                console.log('Extension', message.enabled ? 'enabled' : 'disabled');
            }
        });

        // Listen for settings changes
        settingsManager.onChanged((newSettings) => {
            console.log('Settings updated:', newSettings);
            // Refresh popup if it's currently showing
            popupManager.refresh();
        });

    } catch (error) {
        console.error('Extension initialization error:', error);
    }
}

init();