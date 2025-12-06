import { search } from './search.js';
import { displayResults, setIpaMode, getIpaMode } from './display.js';

let searchTimeout;

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

        const audiobutton = e.target.closest('.audio-button');
        if (audiobutton) {
            console.log('Audio button clicked');
            e.preventDefault(); // Optional for buttons
            handleAudioClick(audiobutton); // Async function, not awaited
            return;
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

export function handleAudioClick(button) {
    const filename = button.dataset.filename;

    const audio = new Audio(`https://pub-9ec168b9602247ec9a07b5964680de73.r2.dev/${filename}?v=v1`);
    button.classList.add('playing');
    button.disabled = true;

    audio.onended = () => {
        button.classList.remove('playing');
        button.disabled = false;
    };

    audio.onerror = () => {
        console.error('Audio error:', filename);
        button.innerHTML = '❌';
    };

    // Play
    audio.play().catch(error => {
        console.error('Play failed:', error);
        button.innerHTML = '❌';
    });
}