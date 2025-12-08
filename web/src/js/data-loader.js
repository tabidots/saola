import { loadGzipJson } from './utils.js';

export let vnEn = [];
export let enVn = [];
export let vnIndex = null;
export let enIndex = null;
export let glossDocIndex = null;
export let vnHeadwordSet = null;

const DATA_VERSION = 'v5';

export async function initializeData() {
    // Load data
    [vnEn, enVn] = await Promise.all([
        loadGzipJson(`../data/vnen.json.gz?v=${DATA_VERSION}`),
        loadGzipJson(`../data/envn.json.gz?v=${DATA_VERSION}`)
    ]);

    // Build Vietnamese index
    vnIndex = new Map();
    vnEn.forEach((entry, idx) => {
        entry._idx = idx;

        const buckets = [
            entry.searchable.lowercase,
            entry.searchable.toneless,
            entry.searchable.plain
        ];

        for (const forms of buckets) {
            for (const term of forms) {
                if (!vnIndex.has(term)) vnIndex.set(term, new Set());
                vnIndex.get(term).add(idx);
            }
        }
    });

    console.log(`Vietnamese index: ${vnIndex.size} unique terms`);

    // Build English index
    enIndex = new Map();
    enVn.forEach((entry, idx) => {
        entry._idx = idx;
        const term = entry.lowercase;

        if (!enIndex.has(term)) enIndex.set(term, []);
        enIndex.get(term).push(idx);
    });

    console.log(`English index: ${enIndex.size} unique terms`);

    // Build glosses index (FlexSearch)
    glossDocIndex = new FlexSearch.Document({
        id: "_idx",
        document: {
            id: "_idx",
            store: true,
            index: ["gloss"]
        },
        tokenize: "forward",
        optimize: true,
        resolution: 9,
        depth: 2,
        bidirectional: false
    });

    vnEn.forEach((word, idx) => {
        word._idx = idx;

        const allGlosses = [];
        if (word.lexemes && Array.isArray(word.lexemes)) {
            word.lexemes.forEach(lexeme => {
                if (lexeme.senses && Array.isArray(lexeme.senses)) {
                    lexeme.senses.forEach(sense => {
                        if (sense.gloss && typeof sense.gloss === 'string') {
                            allGlosses.push(sense.gloss.toLowerCase());
                        }
                    });
                }
            });
        }

        if (allGlosses.length > 0) {
            glossDocIndex.add({
                _idx: idx,
                gloss: allGlosses.join(' ')
            });
        }
    });
    console.log(vnEn[2000])

    // Build Vietnamese headword set for segmentation
    vnHeadwordSet = new Set();
    vnEn.forEach(word => {
        word.searchable.lowercase.forEach(term => vnHeadwordSet.add(term));
    });
}

export function getData() {
    return { vnEn, enVn, vnIndex, enIndex, glossDocIndex, vnHeadwordSet };
}