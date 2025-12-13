import { renderSection } from '../../../shared/templates.js';

let ipaMode = false;

export function setIpaMode(mode) {
    ipaMode = mode;
    document.querySelectorAll('.phonetic').forEach(el => {
        el.style.display = mode ? 'none' : '';
    });
    document.querySelectorAll('.ipa').forEach(el => {
        el.style.display = mode ? '' : 'none';
    });
}

export function getIpaMode() {
    return ipaMode;
}

export function renderVietnameseHeadwords(results) {
    if (results.length === 0) {
        return '<div class="no-results">No Vietnamese results</div>';
    }
    const { vnHeadwordTemplate } = window.saolaTemplates;
    return results.map(word => vnHeadwordTemplate(word)).join('');
}

export function renderEnglishHeadwords(results) {
    if (results.length === 0) {
        return '<div class="no-results">No English results</div>';
    }
    const { enHeadwordTemplate } = window.saolaTemplates;
    return results.map(entry => enHeadwordTemplate(entry)).join('');
}

export function displayResults(searchResults) {
    const container = document.getElementById('results');

    if (searchResults.type === 'empty') {
        container.innerHTML = '';
        return;
    }

    if (searchResults.type === 'none') {
        container.innerHTML = '<div class="no-results">No results found</div>';
        return;
    }

    const sections = [];

    if (searchResults.vnHeadwords && searchResults.vnHeadwords.length > 0) {
        sections.push(renderSection(
            'Vietnamese',
            renderVietnameseHeadwords(searchResults.vnHeadwords)
        ));
    }

    if (searchResults.enHeadwords && searchResults.enHeadwords.length > 0) {
        sections.push(renderSection(
            'English',
            renderEnglishHeadwords(searchResults.enHeadwords)
        ));
    }

    if (searchResults.type === 'includes-reverse') {
        sections.push('<div class="no-results">No exact English matches found. '
            + 'Here are some Vietnamese words whose definitions contain your search term.</div>');
    }

    if (searchResults.enGlosses && searchResults.enGlosses.length > 0) {
        sections.push(renderSection(
            'Reverse lookup',
            renderVietnameseHeadwords(searchResults.enGlosses)
        ));
    }

    container.innerHTML = sections.join('');
}