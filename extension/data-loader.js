import { loadGzipJson } from '../shared/utils.js';

// data-loader.js
const data = {
    vnEn: [],
    vnIndex: null
};

export async function initializeData() {
    const dataUrl = chrome.runtime.getURL('data/vnen.json.gz');
    data.vnEn = await loadGzipJson(dataUrl);

    // Build Vietnamese index
    data.vnIndex = new Map();
    data.vnEn.forEach((entry, idx) => {
        entry._idx = idx;

        const term = entry.word;
        if (!term) return;

        if (!data.vnIndex.has(term)) data.vnIndex.set(term, new Set());

        data.vnIndex.get(term).add(idx);
    });
}

export function getData() {
    return { vnEn: data.vnEn, vnIndex: data.vnIndex };
}