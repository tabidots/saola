import { initializeData } from './data-loader.js';
import { registerHandlebarsHelpers, compileTemplates } from '../../../shared/templates.js';
import { segmentVietnamese } from './segmenter.js';
import { initUI } from './ui.js';

async function init() {
    const searchContainer = document.querySelector('.search-container');
    const loadingDiv = document.getElementById('loading');

    loadingDiv.textContent = 'Loading dictionary...';

    try {
        await initializeData();
        
        loadingDiv.style.display = 'none';
        searchContainer.classList.add('ready');
        document.getElementById('search').focus();
        registerHandlebarsHelpers(segmentVietnamese);
        const templates = compileTemplates();
        window.saolaTemplates = templates;
        initUI();

    } catch (error) {
        console.error('Error during initialization:', error);
        loadingDiv.textContent = 'Error loading dictionary: ' + error.message;
    }
}

init();