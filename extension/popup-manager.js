export class PopupManager {
    constructor(settingsManager) {
        this.settingsManager = settingsManager;
        this.margin = 10;
        this.popup = null; // Initialize as null
    }

    async createShadowPopup() {
        // Create container in light DOM
        const container = document.createElement('div');
        container.id = 'saola-popup-container';
        document.body.appendChild(container);

        // Attach shadow root
        const shadow = container.attachShadow({ mode: 'open' });

        // Load CSS
        const cssUrl = chrome.runtime.getURL('popup.css');
        const response = await fetch(cssUrl);
        const cssText = await response.text();

        // Create style element
        const style = document.createElement('style');
        style.textContent = cssText.replace(
            /url\(['"]?img\//g,
            `url('${chrome.runtime.getURL('img/')}`
        );;
        shadow.appendChild(style);

        // Create popup element inside shadow DOM
        this.popup = document.createElement('div');
        this.popup.id = 'saola-popup';
        shadow.appendChild(this.popup);

        // Store references
        this.container = container;
        this.shadow = shadow;

        this.applyTheme();
        this.setupThemeListener();
    }

    applyTheme() {
        if (!this.popup) return;

        const settings = this.settingsManager.getSettings();

        let theme = settings.theme;
        if (theme === 'system') {
            theme = window.matchMedia('(prefers-color-scheme: dark)').matches
                ? 'dark' : 'light';
        }

        this.popup.setAttribute('data-theme', theme);
        this.popup.setAttribute('data-pronunciation', settings.pronunciation);
        this.popup.setAttribute('data-dialect', settings.dialect);
    }

    setupThemeListener() {
        // Listen for settings changes
        this.settingsManager.onChanged(() => {
            this.applyTheme();
        });
    }

    show(results) {
        if (!this.popup) {
            console.error('Popup not created yet. Call createShadowPopup() first.');
            return;
        }

        this.popup.innerHTML = Handlebars.templates.popup(results);
        this.popup.style.display = 'flex';
    }

    hide() {
        this.popup.style.display = 'none';
    }

    position(x, y) {
        if (x + this.margin + this.popup.offsetWidth > window.innerWidth) {
            this.container.style.right = '0px';
            this.container.style.left = 'unset';
        } else {
            this.container.style.left = `${x}px`;
            this.container.style.right = 'unset';
        }

        if (y + this.margin + this.popup.offsetHeight > window.innerHeight) {
            this.container.style.bottom = `${window.innerHeight - y + this.margin}px`;
            this.container.style.top = 'unset';
        } else {
            this.container.style.top = `${y}px`;
            this.container.style.bottom = 'unset';
        }
    }
}