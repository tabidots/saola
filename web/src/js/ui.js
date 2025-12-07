import { search } from './search.js';
import { displayResults, setIpaMode, getIpaMode } from './display.js';

let searchTimeout;

function isMobile() {
    const userAgentCheck = /Mobi|Android/i.test(navigator.userAgent);
    const widthCheck = window.innerWidth <= 768;
    return userAgentCheck || widthCheck;
}

function setDarkMode(isDark) {
    document.documentElement.setAttribute('data-theme', isDark ? 'dark' : 'light');
}

export function initUI() {
    // Initialize IPA mode from localStorage
    const savedIpaMode = localStorage.getItem('saola_ipaMode');
    const ipaMode = savedIpaMode === 'true';
    setIpaMode(ipaMode);

    const ipaToggle = document.getElementById('ipa-toggle');
    if (ipaToggle) {
        if (ipaMode) {
            ipaToggle.classList.add('active');
        } else {
            ipaToggle.classList.remove('active');
        }
    }

    // Initialize dark mode from localStorage or system preference
    const savedDarkMode = localStorage.getItem('saola_darkMode');
    const prefersDarkMode = window.matchMedia('(prefers-color-scheme: dark)').matches;
    const darkMode = savedDarkMode !== null ? savedDarkMode === 'true' : prefersDarkMode;
    setDarkMode(darkMode);

    const darkModeToggle = document.getElementById('dark-mode-toggle');
    if (darkModeToggle) {
        // Visual state matches the actual dark mode state
        if (darkMode) {
            darkModeToggle.classList.add('active');
        } else {
            darkModeToggle.classList.remove('active');
        }
    }

    // Search input
    const searchInput = document.getElementById('search');
    const clearBtn = document.getElementById('clear-search');

    searchInput.addEventListener('input', (e) => {
        clearTimeout(searchTimeout);
        searchTimeout = setTimeout(() => {
            performSearch();
        }, 150);
    });

    searchInput.addEventListener('input', () => {
        clearBtn.style.display = searchInput.value ? 'block' : 'none';
    });

    clearBtn.addEventListener('click', () => {
        searchInput.value = '';
        clearBtn.style.display = 'none';
        searchInput.focus();
        performSearch(); 
    });

    document.getElementById('ipa-toggle').addEventListener('click', function () {
        const newMode = !this.classList.contains('active');
        setIpaMode(newMode);
        this.classList.toggle('active');
        localStorage.setItem('saola_ipaMode', newMode.toString());
        this.blur();
    });

    document.getElementById('dark-mode-toggle').addEventListener('click', function () {
        const newMode = !this.classList.contains('active');
        setDarkMode(newMode);
        this.classList.toggle('active');
        localStorage.setItem('saola_darkMode', newMode.toString());
        this.blur();
    });

    document.addEventListener('click', (e) => {
        const vnLink = e.target.closest('.vn-link');
        if (vnLink) {
            e.preventDefault();
            const word = vnLink.dataset.word;
            document.getElementById('search').value = word;
            performSearch(); // No await - fire and forget

            return; // Exit early
        }

        if (!isMobile()) {
            const audiobutton = e.target.closest('.audio-button');
            if (audiobutton) {
                console.log('Audio button clicked');
                e.preventDefault();
                handleAudioClick(audiobutton);
                return;
            }
        }

        const header = e.target.closest('.section-title.collapsible');
        if (header) {
            const section = header.closest('.search-section');
            const content = section.querySelector('.section-content');
            const icon = header.querySelector('.toggle-icon');
    
            section.classList.toggle('open');
            icon.textContent = section.classList.contains('open') ? '▼' : '▶';
            return;
        }

    });

    if (isMobile()) {
        document.addEventListener('touchstart', (e) => {
            const audiobutton = e.target.closest('.audio-button');
            if (audiobutton) handleAudioClick(audiobutton);
        });
    }

    // Modal handlers
    setupModalHandlers();
}

function performSearch() {
    const query = document.getElementById('search').value;
    const results = search(query);
    displayResults(results);
    setIpaMode(getIpaMode());
}

function setupModalHandlers() {
    document.getElementById('help-button')?.addEventListener('click', () => {
        openModal('help');
    });

    document.getElementById('about-button')?.addEventListener('click', () => {
        openModal('about');
    });

    document.getElementById('modal-close')?.addEventListener('click', closeModal);

    document.getElementById('modal')?.addEventListener('click', (e) => {
        if (e.target.id === 'modal') {
            closeModal();
        }
    });

    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
            closeModal();
        }
    });
}

async function openModal(contentType) {
    const modal = document.getElementById('modal');
    const modalBody = document.getElementById('modal-body');

    modalBody.innerHTML = '<p>Loading...</p>';
    modal.classList.add('active');
    document.body.style.overflow = 'hidden';
    
    try {
        const response = await fetch(`../md/${contentType}.md`);
        const markdown = await response.text();
        modalBody.innerHTML = marked.parse(markdown).replace(/@\/(.+?)\/@/g, '<span class="ipa">/$1/</span>');
    } catch (error) {
        modalBody.innerHTML = '<p>Error loading content.</p>';
    }
}

function closeModal() {
    const modal = document.getElementById('modal');
    modal.classList.remove('active');
    document.body.style.overflow = '';
}

let audio = new Audio();
let currentAudioButton = null;  // Track button to avoid "sticky" button issue when playing overlapping audio

export function handleAudioClick(button) {
    const filename = button.dataset.filename;

    // Clean up previous button if exists
    if (currentAudioButton) {
        currentAudioButton.classList.remove('playing');
        currentAudioButton.disabled = false;
    }

    // Eliminate iOS audio lag by reusing the same Audio object
    // https://stackoverflow.com/a/54432573
    audio.src = `../audio/${filename}`;
    currentAudioButton = button;

    button.classList.add('playing');
    button.disabled = true;

    audio.onended = () => {
        button.classList.remove('playing');
        button.disabled = false;
        currentAudioButton = null; 
    };

    audio.onerror = () => {
        console.error('Audio error:', filename);
        button.innerHTML = '❌';
        currentAudioButton = null; 
    };

    // Play
    audio.play().catch(error => {
        console.error('Play failed:', error);
        button.innerHTML = '❌';
        currentAudioButton = null; 
    });
}