// settings.js
export class SettingsManager {
    constructor() {
        this.settings = {
            theme: 'system',
            pronunciation: 'phonetic',
            dialect: 'both'
        };
    }

    async load() {
        return new Promise((resolve) => {
            chrome.storage.sync.get({
                theme: 'system',
                pronunciation: 'phonetic',
                dialect: 'both'
            }, (items) => {
                this.settings = items;
                this.applyTheme();
                resolve(this.settings);
            });
        });
    }

    applyTheme() {
        const theme = this.settings.theme;

        if (theme === 'system') {
            // Detect system preference
            const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
            document.documentElement.setAttribute('data-theme', prefersDark ? 'dark' : 'light');
        } else {
            document.documentElement.setAttribute('data-theme', theme);
        }
    }

    onChanged(callback) {
        chrome.runtime.onMessage.addListener((message) => {
            if (message.action === 'settingsChanged') {
                this.settings = message.settings;
                this.applyTheme();
                callback(this.settings);
            }
        });

        // Also listen for system theme changes if theme is 'system'
        if (this.settings.theme === 'system') {
            window.matchMedia('(prefers-color-scheme: dark)')
                .addEventListener('change', () => this.applyTheme());
        }
    }

    get(key) {
        return this.settings[key];
    }
}