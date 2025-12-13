import { removeTones, makePlain, fixTonePlacement } from './utils.js';
import { getData } from './data-loader.js';

function isCanonicalMatch(idx, matched, vnEn) {
    return vnEn[idx].word.toLowerCase() === matched;
}

export function searchVietnameseHeadwords(query) {
    const { vnEn, vnIndex } = getData();
    if (!vnIndex) return [];

    const lowercase = fixTonePlacement(query.trim().toLowerCase());
    const toneless = removeTones(lowercase);
    const plain = makePlain(lowercase);

    const resultSet = new Set();

    const addFromIndex = (map, key) => {
        if (map.has(key)) {
            for (const idx of map.get(key)) {
                resultSet.add(idx);
            }
        }
    };

    // Track which terms matched and how
    const matchInfo = new Map(); // idx -> {exact: boolean, startsWith: boolean, length: number}

    addFromIndex(vnIndex, lowercase);
    if (vnIndex.has(lowercase)) {
        vnIndex.get(lowercase).forEach(idx => {
            matchInfo.set(idx, { 
                exact: true, 
                startsWith: true, 
                length: vnEn[idx].word.length,
                canonical: isCanonicalMatch(idx, lowercase, vnEn)
             });
        });
    }
    const hasExactMatch = resultSet.size > 0;

    if (!hasExactMatch) {
        addFromIndex(vnIndex, toneless);
        if (vnIndex.has(toneless)) {
            vnIndex.get(toneless).forEach(idx => {
                if (!matchInfo.has(idx)) {
                    matchInfo.set(idx, { 
                        exact: false, 
                        startsWith: true, 
                        length: vnEn[idx].word.length,
                        canonical: isCanonicalMatch(idx, lowercase, vnEn)
                    });
                }
            });
        }
    }

    if (/^[a-zA-Z\s]+$/.test(query)) {
        addFromIndex(vnIndex, plain);
        if (vnIndex.has(plain)) {
            vnIndex.get(plain).forEach(idx => {
                if (!matchInfo.has(idx)) {
                    matchInfo.set(idx, { 
                        exact: false, 
                        startsWith: true, 
                        length: vnEn[idx].word.length,
                        canonical: isCanonicalMatch(idx, lowercase, vnEn)
                 });
                }
            });
        }
    }

    // Partial match fallback
    if (resultSet.size < 10) {
        const searchTerms = [lowercase, toneless];
        if (/^[a-zA-Z\s]+$/.test(query)) searchTerms.push(plain);

        for (const [term, set] of vnIndex) {

            // Determine which prefix patterns to allow
            let allowedTerms;
            if (hasExactMatch) {  // Only exact-prefix allowed
                allowedTerms = [lowercase];
            } else { // Allow all fuzzy prefixes (current behavior)
                allowedTerms = [lowercase, toneless];
                if (/^[a-zA-Z\s]+$/.test(query)) allowedTerms.push(plain);
            }

            if (allowedTerms.some(st => {
                const regex = new RegExp(`(^|\\s)${RegExp.escape(st)}`);
                return regex.test(term);
            })) {
                for (const idx of set) {
                    resultSet.add(idx);
                    if (!matchInfo.has(idx)) {
                        const word = vnEn[idx].word.toLowerCase();
                        const startsWith = word.startsWith(lowercase) ||
                            word.startsWith(toneless) ||
                            (/^[a-zA-Z\s]+$/.test(query) && word.startsWith(plain));
                        matchInfo.set(idx, {
                            exact: false,
                            startsWith: startsWith,
                            length: word.length
                        });
                    }
                }
            }
        }
    }

    // Convert to array and sort by priority
    return Array.from(resultSet)
        .map(idx => ({ idx, ...matchInfo.get(idx) }))
        .sort((a, b) => {
            // Priority 1: Exact matches first
            if (a.exact && !b.exact) return -1;
            if (!a.exact && b.exact) return 1;

            // Priority 1.5: Canonical headword exact matches outrank alternate-form exact matches
            if (a.exact && b.exact) {
                if (a.canonical && !b.canonical) return -1;
                if (!a.canonical && b.canonical) return 1;
            }

            // Priority 2: Starts with query
            if (a.startsWith && !b.startsWith) return -1;
            if (!a.startsWith && b.startsWith) return 1;

            // Priority 3: Shorter words first (more specific)
            if (a.length !== b.length) {
                return a.length - b.length;
            }

            // Priority 4: Higher frequency (lower rank number)
            const aRank = vnEn[a.idx].rank || Infinity;
            const bRank = vnEn[b.idx].rank || Infinity;
            if (aRank !== bRank) return aRank - bRank;

            // Priority 5: Case-sensitive using word.word
            const aWord = vnEn[a.idx].word;
            const bWord = vnEn[b.idx].word;

            // Compare lowercase versions
            const aLower = vnEn[a.idx].searchable.lowercase[0] || aWord.toLowerCase();
            const bLower = vnEn[b.idx].searchable.lowercase[0] || bWord.toLowerCase();

            if (aLower < bLower) return -1;
            if (aLower > bLower) return 1;

            // Same word, different case: lowercase first
            if (aWord === aLower && bWord !== bLower) return -1;
            if (bWord === bLower && aWord !== aLower) return 1;

            return 0;
        })
        .slice(0, 20)
        .map(item => vnEn[item.idx]);
}

export function searchEnglishHeadwords(query) {
    const { enVn, enIndex } = getData();
    if (!enIndex) return [];

    const lowercase = query.toLowerCase().trim();
    if (!lowercase) return [];

    const results = new Set();

    // Exact matches
    if (enIndex.has(lowercase)) {
        enIndex.get(lowercase).forEach(idx => results.add(idx));
    }

    // Prefix matches
    for (const [term, indices] of enIndex) {
        if (term.startsWith(lowercase)) {
            indices.forEach(idx => results.add(idx));
        }
    }

    const entries = Array.from(results).map(idx => enVn[idx]);

    return entries.sort((a, b) => {
        const aTerm = a.lowercase;
        const bTerm = b.lowercase;

        if (aTerm === lowercase && bTerm !== lowercase) return -1;
        if (bTerm === lowercase && aTerm !== lowercase) return 1;

        return aTerm.length - bTerm.length;
    }).slice(0, 20);
}

export function searchEnglishGlosses(query) {
    const { vnEn, glossDocIndex } = getData();
    if (!glossDocIndex) return [];

    const lowercase = query.toLowerCase().trim();
    if (!lowercase) return [];

    const results = glossDocIndex.search(lowercase, {
        limit: 100,
        enrich: true,
        suggest: true
    });

    const wordMap = new Map(); // Dedupe by word ID

    results.forEach(resultGroup => {
        if (resultGroup.result && Array.isArray(resultGroup.result)) {
            resultGroup.result.forEach(item => {
                const word = vnEn[item.id];

                if (!wordMap.has(item.id)) {
                    // Find best matching gloss
                    const matchInfo = findBestMatchingGloss(word, lowercase);

                    if (matchInfo) {
                        wordMap.set(item.id, {
                            word: word,
                            score: matchInfo.score,
                            matchedGloss: matchInfo.gloss
                        });
                    }
                }
            });
        }
    });

    // Sort by score
    const allResults = Array.from(wordMap.values());
    allResults.sort((a, b) => b.score - a.score);

    return allResults.slice(0, 10).map(item => item.word);
}

function scoreGlossMatch(gloss, query) {
    const glossLower = gloss.toLowerCase();
    const queryLower = query.toLowerCase();

    // Split on semicolons first (separate definitions), then words
    const definitions = glossLower.split(/;/).map(d => d.trim());

    let bestDefScore = 0;

    // Score each definition separately (semicolon-separated)
    for (const def of definitions) {
        const words = def.split(/[,\s]+/).filter(w => w.length > 0);
        const wordCount = words.length;

        // Find if query matches
        const exactWordIndex = words.indexOf(queryLower);
        const prefixMatchIndex = words.findIndex(w => w.startsWith(queryLower));
        const substringMatch = def.includes(queryLower);

        let score = 0;

        // 1. Position-based scoring (earlier = better)
        if (exactWordIndex !== -1) {
            // Exact match found
            const position = exactWordIndex + 1; // 1-indexed
            score += 1000 / position; // First word = 1000, second = 500, third = 333...
        } else if (prefixMatchIndex !== -1) {
            const position = prefixMatchIndex + 1;
            score += 500 / position;
        } else if (substringMatch) {
            score += 50;
        }

        // 2. Coverage ratio (query words / definition words)
        const queryWords = queryLower.split(/\s+/).length;
        const coverage = queryWords / wordCount;
        score *= (1 + coverage); // 50% coverage = 1.5x multiplier, 100% = 2x

        // 3. Penalize very long definitions
        if (wordCount > 8) {
            score *= 0.5;
        }

        bestDefScore = Math.max(bestDefScore, score);
    }

    return bestDefScore;
}

function findBestMatchingGloss(word, query) {
    let bestMatch = null;
    let bestScore = 0;

    if (!word.lexemes) return null;

    word.lexemes.forEach(lexeme => {
        if (!lexeme.senses) return;

        lexeme.senses.forEach(sense => {
            const gloss = sense.gloss;
            const score = scoreGlossMatch(gloss, query);

            if (score > bestScore) {
                bestScore = score;
                bestMatch = gloss;
            }
        });
    });

    if (!bestMatch) return null;

    // Small frequency bonus (not dominant)
    let finalScore = bestScore;
    if (word.rank) {
        if (word.rank <= 1000) finalScore *= 1.1;
        else if (word.rank <= 3000) finalScore *= 1.05;
    }

    return {
        gloss: bestMatch,
        score: finalScore
    };
}

export function search(query) {
    if (!query.trim()) return { type: "empty" };

    const results = {
        type: "combined",
        vnHeadwords: [],
        enHeadwords: [],
        enGlosses: []
    };

    results.vnHeadwords = searchVietnameseHeadwords(query);
    results.enHeadwords = searchEnglishHeadwords(query);

    // Check if we have any results
    const hasResults = results.vnHeadwords.length > 0 ||
        results.enHeadwords.length > 0
    
    // Supplement English results with reverse search, but only if there are no exact matches
    const hasExactEnglishResult = results.enHeadwords.some(entry => 
        entry.lowercase === query.toLowerCase().trim()
    );
    const onlyAscii = /^[a-zA-Z ]+$/.test(query);
    if (onlyAscii && !hasExactEnglishResult) {
        results.enGlosses = searchEnglishGlosses(query);
        if (results.enGlosses.length > 0) {
            results.type = "includes-reverse";
        }
    }
    
    if (!hasResults && !results.enGlosses.length) return { type: "none" };

    return results;
}