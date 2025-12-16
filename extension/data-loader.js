import { loadGzipJson } from '../shared/utils.js';

// data-loader.js
const data = {
    vnEn: [],
    vnIndex: null
};

export async function initializeData() {
    const dataUrl = chrome.runtime.getURL('data/vnen.json.gz');
    data.vnEn = await loadGzipJson(dataUrl);

    // For segmentation: lowercase -> Set of {canonical, frequency, indices} objects
    data.lowercaseIndex = new Map();
    
    data.vnEn.forEach((entry, idx) => {
        entry._idx = idx;

        const terms = [entry.word, entry.alt_spelling].filter(Boolean);
        for (const term of terms) {
            // Lowercase index with canonical forms and frequencies
            const lower = term.toLowerCase();
            if (!data.lowercaseIndex.has(lower)) {
                data.lowercaseIndex.set(lower, []);
            }

            const canonicalForms = data.lowercaseIndex.get(lower);
            
            // The following two situations shouldn't happen, but just in case
            if (canonicalForms.length > 2) {
                console.log('Too many canonical forms:', canonicalForms);
                continue;
            }
            let existing = canonicalForms.find(cf => cf.canonical === term);
            if (existing) {
                console.log('Canonical form already exists:', existing);
                continue;
            } 
            
            canonicalForms.push({
                canonical: term,
                freq: entry.freq || 0,
                index: idx
            });
        };

    });
}

export function getData() {
    return { 
        vnEn: data.vnEn, 
        lowercaseIndex: data.lowercaseIndex
    };
}