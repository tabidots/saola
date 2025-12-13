export class PopupManager {
    constructor(popupElement) {
        this.popup = popupElement;
        this.margin = parseInt(window.getComputedStyle(popupElement).marginLeft);
    }

    show(results) {
        this.popup.innerHTML = '';
        results.forEach((result) => {
            result.entries.forEach((entry) => {
                this.popup.innerHTML += Handlebars.templates.popup(entry);
            });
        });
        this.popup.style.display = 'flex';
    }

    hide() {
        this.popup.style.display = 'none';
    }

    position(x, y) {
        if (x + this.margin + this.popup.offsetWidth > window.innerWidth) {
            this.popup.style.right = '0px';
            this.popup.style.left = 'unset';
        } else {
            this.popup.style.left = `${x}px`;
            this.popup.style.right = 'unset';
        }

        if (y + this.margin + this.popup.offsetHeight > window.innerHeight) {
            this.popup.style.bottom = `${window.innerHeight - y + this.margin}px`;
            this.popup.style.top = 'unset';
        } else {
            this.popup.style.top = `${y}px`;
            this.popup.style.bottom = 'unset';
        }
    }
}