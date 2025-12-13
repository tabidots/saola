import { linkifyFromList, linkifySegments, boldify } from './utils.js';

export function registerHandlebarsHelpers(segmenter = null) {
    Handlebars.registerHelper('join', function (array, separator) {
        return array ? array.join(separator) : '';
    });

    Handlebars.registerHelper('eq', function (a, b) {
        return a === b;
    });

    Handlebars.registerHelper('linkifyFromList', function (gloss, links) {
        return new Handlebars.SafeString(linkifyFromList(gloss, links));
    });


    Handlebars.registerHelper('linkify', function (text, offsets) {
        if (!segmenter) {
            // Extension path: just return text wrapped in SafeString
            return new Handlebars.SafeString(text);
        }
        // Web app path: full linkification
        const realOffsets = Array.isArray(offsets) ? offsets : [];
        const segs = segmenter(text, realOffsets);
        return new Handlebars.SafeString(linkifySegments(segs));
    });

    Handlebars.registerHelper('boldify', function (text, offsets) {
        return new Handlebars.SafeString(boldify(text, offsets));
    });

    Handlebars.registerHelper('rankBadge', function (rank) {
        if (!rank) return '';
        if (rank <= 1000) return '<span class="rank-badge core">Top 1000</span>';
        if (rank <= 3000) return '<span class="rank-badge common">Top 3000</span>';
        if (rank <= 5000) return '<span class="rank-badge general">Top 5000</span>';
        return '';
    });

    Handlebars.registerHelper('audioButton', function (word, dialect) {
        const filename = `${word.toLowerCase().replace(/\s+/g, '-')}-${dialect}.mp3`;
        return `
            <button class="audio-button" data-filename="${filename}" 
            data-dialect="${dialect.toUpperCase()}">
                <span class="audio-icon"><i class="twa twa-speaker-low-volume"></i></span> 
                ${dialect.toUpperCase()}
            </button>
        `;
    });

    Handlebars.registerHelper('gt', (a, b) => a > b);
    Handlebars.registerHelper('lte', (a, b) => a <= b);
    Handlebars.registerHelper('and', (a, b) => a && b);
}

// Only compile templates if we're in the web app (not extension)
// The extension will use pre-compiled templates
export function compileTemplates() {

    const vnHeadwordTemplate = Handlebars.compile(`
    <div class="result">
        <div class="headword-row">
            {{word}}
            {{#if alt_spelling}}
                <span class="alt-spelling">(<em>also:</em> <strong>{{alt_spelling}}</strong>)</span>
            {{/if}}
            {{#if has_audio}}{{{audioButton word "hn"}}}{{/if}}
            {{#if has_audio}}{{{audioButton word "sg"}}}{{/if}}
            {{{rankBadge rank}}}
        </div>
        
        {{#if phonetic_hn}}
            <div class="phonetic">
                <strong>HN</strong> <em>{{phonetic_hn}}</em> <strong>SG</strong> <em>{{phonetic_sg}}</em>
            </div>
        {{/if}}
        <div class="ipa">
            <strong>HN</strong> /{{ipa_hn}}/ <strong>SG</strong> /{{ipa_sg}}/
        </div>
        
        {{#each lexemes}}
            <div class="lexeme">
                <div class="header">
                    <h3 class="pos">{{pos}}</h3>
                    {{#if classifier}}<span class="classifier">(<em>classifier:</em> <strong>{{classifier}}</strong>)</span>{{/if}}
                </div>
                <ul class="senses">
                    {{#each senses}}
                        <li class="sense">
                            {{#if tags}}
                                <ul class="tags">
                                    {{#each tags}}<li class="tag">{{this}}</li>{{/each}}
                                </ul>
                            {{/if}}
                            {{#if qualifiers}}
                                <span class="qualifiers">{{join qualifiers ", "}}</span>
                            {{/if}}
                            {{{linkifyFromList gloss links}}}
                            {{#if examples}}
                                <ul class="examples">
                                    {{#each examples}}
                                        <li class="example">
                                            {{#if bold_vi_offsets}}
                                                {{{linkify vi bold_vi_offsets}}}
                                            {{else}}
                                                {{{linkify vi}}}
                                            {{/if}}
                                            —
                                            {{#if bold_en_offsets}}
                                                {{{boldify en bold_en_offsets}}}
                                            {{else}}
                                                {{{en}}}
                                            {{/if}}
                                        </li>
                                    {{/each}}
                                </ul>
                            {{/if}}
                        </li>
                    {{/each}}
                </ul>
            </div>
        {{/each}}
    </div>
    `);

    const enHeadwordTemplate = Handlebars.compile(`
    <div class="result">
        <div class="headword-row">
            {{en}}
        </div>
        
        {{#each lexemes}}
            <div class="lexeme">
                <div class="header">
                    <h3 class="pos">{{pos}}</h3>
                </div>
                <ul class="senses">
                    {{#each senses}}
                        <li class="sense">
                            {{#if sense}}<em>{{sense}}:</em>{{/if}}
                            {{#each translations}}
                                {{{linkify vn}}}{{#if note}}<span class="note"> ({{note}})</span>{{/if}}{{#unless @last}}, {{/unless}}
                            {{/each}}
                        </li>
                    {{/each}}
                </ul>
            </div>
        {{/each}}
    </div>
    `);

    return { vnHeadwordTemplate, enHeadwordTemplate };
}

export function renderSection(title, content, defaultOpen = true) {
    const sectionId = title.toLowerCase().replace(/\s+/g, '-');
    return `
            <div class="search-section ${defaultOpen ? 'open' : ''}" data-section="${sectionId}">
                <h3 class="section-title collapsible">
                    <span class="toggle-icon">${defaultOpen ? '▼' : '▶'}</span>
                    ${title}
                </h3>
                <div class="section-content">
                    ${content}
                </div>
            </div>
        `;
}