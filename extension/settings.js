// settings.js
export class SettingsManager {
    constructor() {
        this.settings = {
            theme: 'system',
            pronunciation: 'phonetic',
            dialect: 'both'
        };
        this.listeners = new Set(); // Store multiple listeners
    }

    async load() {
        return new Promise((resolve) => {
            chrome.storage.sync.get({
                theme: 'system',
                pronunciation: 'phonetic',
                dialect: 'both'
            }, (items) => {
                this.settings = items;
                this.notifyListeners(); // Notify all listeners
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

        // Also listen for messages from options page
        chrome.runtime.onMessage.addListener((message) => {
            if (message.action === 'settingsChanged') {
                this.settings = message.settings;
                this.notifyListeners();
            }
        });

        // Listen for system theme changes
        const handleSystemThemeChange = () => {
            if (this.settings.theme === 'system') {
                this.notifyListeners(); // Just notify, PopupManager will re-apply
            }
        };

        window.matchMedia('(prefers-color-scheme: dark)')
            .addEventListener('change', handleSystemThemeChange);

        // Return unsubscribe function
        return () => {
            this.listeners.delete(callback);
            window.matchMedia('(prefers-color-scheme: dark)')
                .removeEventListener('change', handleSystemThemeChange);
        };
    }

    // New: Notify all listeners
    notifyListeners() {
        this.listeners.forEach(callback => {
            try {
                callback(this.settings);
            } catch (error) {
                console.error('Settings listener error:', error);
            }
        });
    }
}