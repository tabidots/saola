export class PopupManager {
    constructor(popupElement) {
        this.popup = popupElement;
        this.margin = parseInt(window.getComputedStyle(popupElement).marginLeft);
    }

    show(results) {
        this.popup.innerHTML = '';
        for (const entry of results) {
            this.popup.innerHTML += Handlebars.templates.popup(entry);
        }
        this.popup.style.display = 'flex';
    }

    hide() {
        this.popup.style.display = 'none';
    }

    position(x, y) {
        if (x + this.margin + this.popup.offsetWidth > window.innerWidth) {
            this.popup.style.left = 'unset';
            this.popup.style.right = '0px';
        } else {
            this.popup.style.right = 'unset';
            this.popup.style.left = `${x}px`;
        }

        if (y + this.margin + this.popup.offsetHeight > window.innerHeight) {
            this.popup.style.top = 'unset';
            this.popup.style.bottom = `${window.innerHeight - y + this.margin}px`;
        } else {
            this.popup.style.bottom = 'unset';
            this.popup.style.top = `${y}px`;
        }
    }
}