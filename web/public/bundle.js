function T(e){let t={"\u0300":"","\u0301":"","\u0309":"","\u0303":"","\u0323":""},s=e.normalize("NFD"),n="";for(let r of s)n+=t[r]??r;return n.normalize("NFC")}function C(e){let t=e.replace(/\u0110/g,"D").replace(/\u0111/g,"d");return t=t.normalize("NFKD"),t=t.replace(/[\u0300-\u036f]/g,""),t}function y(e){return String(e).replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/"/g,"&quot;").replace(/'/g,"&#39;")}async function H(e){let s=await(await fetch(e)).blob(),n=new DecompressionStream("gzip"),r=s.stream().pipeThrough(n),a=await new Response(r).text();return JSON.parse(a)}RegExp.escape||(RegExp.escape=function(e){return String(e).replace(/[\\^$*+?.()|[\]{}]/g,"\\$&")});function _(e,t=[]){if(!t||t.length===0)return y(e);let s=y(e),n=[...t].sort((a,l)=>l.length-a.length),r=[];for(let a of n){let l=RegExp.escape(a),c=new RegExp(`(?<![\\p{L}\\p{M}])(${l})(?![\\p{L}\\p{M}])`,"gui"),d="",f=0,o,i=new RegExp(c.source,c.flags);for(;(o=i.exec(s))!==null;){let u=o.index,g=o.index+o[0].length;if(!r.some(p=>u>=p.start&&u<p.end||g>p.start&&g<=p.end||u<=p.start&&g>=p.end)){d+=s.substring(f,u);let p=`<a href="#" class="vn-link" data-word="${y(a.toLowerCase())}">${o[0]}</a>`;d+=p;let m=d.length-p.length,w=d.length;r.push({start:m,end:w}),f=g}}d+=s.substring(f),s=d}return s}function D(e,t=[]){if(t.length===0)return y(e);let s=e.split(/(\s+)/),n="",r=0;return s.forEach(a=>{let l=r,c=r+a.length;t.some(([f,o])=>l<o&&c>f)?n+=`<strong>${y(a)}</strong>`:n+=y(a),r=c}),n}function W(e){let t="",s=!1,n=0;for(let r=0;r<e.length;r++){let a=e[r],l=e[r-1],c=a.isPunct,d=/[([{“"']$/.test(a.display),f=/^[)\]}”"',:;\.\?!]/.test(a.display),o=l?.isPunct,i=l&&/[([{“"']$/.test(l.display),u=l&&/^[)\]}”"',:;\.\?!]$/.test(l.display);if(a.isBold&&!s?(t+="<strong>",s=!0):!a.isBold&&s&&(t+="</strong>",s=!1),r>0){let g=!0;f||d||i?g=!1:(o&&!u||!o&&!c||u&&!c)&&(g=!0),g&&(t+=" ")}n===0&&/^\)/.test(a.display)||(c?(t+=a.display,/^\)/.test(a.display)?n--:/\($/.test(a.display)&&n++):a.inDictionary?t+=`<a href="#" class="vn-link" data-word="${y(a.key)}">${y(a.display)}</a>`:t+=y(a.display))}return s&&(t+="</strong>"),t}var k=[],I=[],v=null,x=null,S=null,M=null,z="v2";async function P(){[k,I]=await Promise.all([H(`./data/vnen.json.gz?v=${z}`),H(`./data/envn.json.gz?v=${z}`)]),v=new Map,k.forEach((e,t)=>{e._idx=t;let s=[e.searchable.lowercase,e.searchable.toneless,e.searchable.plain];for(let n of s)for(let r of n)v.has(r)||v.set(r,new Set),v.get(r).add(t)}),console.log(`Vietnamese index: ${v.size} unique terms`),x=new Map,I.forEach((e,t)=>{e._idx=t;let s=e.lowercase;x.has(s)||x.set(s,[]),x.get(s).push(t)}),console.log(`English index: ${x.size} unique terms`),S=new FlexSearch.Document({id:"_idx",document:{id:"_idx",store:!0,index:["gloss"]},tokenize:"forward",optimize:!0,resolution:9,depth:2,bidirectional:!1}),k.forEach((e,t)=>{e._idx=t;let s=[];e.lexemes&&Array.isArray(e.lexemes)&&e.lexemes.forEach(n=>{n.senses&&Array.isArray(n.senses)&&n.senses.forEach(r=>{r.gloss&&typeof r.gloss=="string"&&s.push(r.gloss.toLowerCase())})}),s.length>0&&S.add({_idx:t,gloss:s.join(" ")})}),M=new Set,k.forEach(e=>{e.searchable.lowercase.forEach(t=>M.add(t))})}function E(){return{vnEn:k,enVn:I,vnIndex:v,enIndex:x,glossDocIndex:S,vnHeadwordSet:M}}function B(e,t,s){return s[e].word.toLowerCase()===t}function Q(e){let{vnEn:t,vnIndex:s}=E();if(!s)return[];let n=e.trim().toLowerCase(),r=T(n),a=C(n),l=new Set,c=(o,i)=>{if(o.has(i))for(let u of o.get(i))l.add(u)},d=new Map;c(s,n),s.has(n)&&s.get(n).forEach(o=>{d.set(o,{exact:!0,startsWith:!0,length:t[o].word.length,canonical:B(o,n,t)})});let f=l.size>0;if(f||(c(s,r),s.has(r)&&s.get(r).forEach(o=>{d.has(o)||d.set(o,{exact:!1,startsWith:!0,length:t[o].word.length,canonical:B(o,n,t)})})),/^[a-zA-Z\s]+$/.test(e)&&(c(s,a),s.has(a)&&s.get(a).forEach(o=>{d.has(o)||d.set(o,{exact:!1,startsWith:!0,length:t[o].word.length,canonical:B(o,n,t)})})),l.size<10){let o=[n,r];/^[a-zA-Z\s]+$/.test(e)&&o.push(a);for(let[i,u]of s){let g;if(f?g=[n]:(g=[n,r],/^[a-zA-Z\s]+$/.test(e)&&g.push(a)),g.some(h=>new RegExp(`(^|\\s)${RegExp.escape(h)}`).test(i))){for(let h of u)if(l.add(h),!d.has(h)){let p=t[h].word.toLowerCase(),m=p.startsWith(n)||p.startsWith(r)||/^[a-zA-Z\s]+$/.test(e)&&p.startsWith(a);d.set(h,{exact:!1,startsWith:m,length:p.length})}}}}return Array.from(l).map(o=>({idx:o,...d.get(o)})).sort((o,i)=>{if(o.exact&&!i.exact)return-1;if(!o.exact&&i.exact)return 1;if(o.exact&&i.exact){if(o.canonical&&!i.canonical)return-1;if(!o.canonical&&i.canonical)return 1}if(o.startsWith&&!i.startsWith)return-1;if(!o.startsWith&&i.startsWith)return 1;if(o.length!==i.length)return o.length-i.length;let u=t[o.idx].rank||1/0,g=t[i.idx].rank||1/0;if(u!==g)return u-g;let h=t[o.idx].word,p=t[i.idx].word,m=t[o.idx].searchable.lowercase[0]||h.toLowerCase(),w=t[i.idx].searchable.lowercase[0]||p.toLowerCase();return m<w?-1:m>w?1:h===m&&p!==w?-1:p===w&&h!==m?1:0}).slice(0,20).map(o=>t[o.idx])}function X(e){let{enVn:t,enIndex:s}=E();if(!s)return[];let n=e.toLowerCase().trim();if(!n)return[];let r=new Set;s.has(n)&&s.get(n).forEach(l=>r.add(l));for(let[l,c]of s)l.startsWith(n)&&c.forEach(d=>r.add(d));return Array.from(r).map(l=>t[l]).sort((l,c)=>{let d=l.lowercase,f=c.lowercase;return d===n&&f!==n?-1:f===n&&d!==n?1:d.length-f.length}).slice(0,20)}function Y(e){let{vnEn:t,glossDocIndex:s}=E();if(!s)return[];let n=e.toLowerCase().trim();if(!n)return[];let r=s.search(n,{limit:100,field:"gloss",enrich:!0,suggest:!0}),a=new Map;r.forEach(c=>{c.result&&Array.isArray(c.result)&&c.result.forEach(d=>{let f=t[d.id];if(!a.has(d.id)){let o=te(f,n);o&&a.set(d.id,{word:f,score:o.score,matchedGloss:o.gloss})}})});let l=Array.from(a.values());return l.sort((c,d)=>d.score-c.score),l.slice(0,10).map(c=>c.word)}function ee(e,t){let s=e.toLowerCase(),n=t.toLowerCase(),r=s.split(/;/).map(l=>l.trim()),a=0;for(let l of r){let c=l.split(/[,\s]+/).filter(p=>p.length>0),d=c.length,f=c.indexOf(n),o=c.findIndex(p=>p.startsWith(n)),i=l.includes(n),u=0;if(f!==-1){let p=f+1;u+=1e3/p}else if(o!==-1){let p=o+1;u+=500/p}else i&&(u+=50);let h=n.split(/\s+/).length/d;u*=1+h,d>8&&(u*=.5),a=Math.max(a,u)}return a}function te(e,t){let s=null,n=0;if(!e.lexemes||(e.lexemes.forEach(a=>{a.senses&&a.senses.forEach(l=>{l.glosses&&l.glosses.forEach(c=>{let d=ee(c,t);d>n&&(n=d,s=c)})})}),!s))return null;let r=n;return e.rank&&(e.rank<=1e3?r*=1.1:e.rank<=3e3&&(r*=1.05)),{gloss:s,score:r}}function G(e){if(!e.trim())return{type:"empty"};let t={type:"combined",vnHeadwords:[],enHeadwords:[],enGlosses:[]};t.vnHeadwords=Q(e),t.enHeadwords=X(e);let s=t.vnHeadwords.length>0||t.enHeadwords.length>0,n=t.enHeadwords.some(a=>a.lowercase===e);return/^[a-zA-Z ]+$/.test(e)&&!n&&(t.enGlosses=Y(e),t.enGlosses.length>0&&(t.type="includes-reverse")),!s&&!t.enGlosses.length?{type:"none"}:t}function N(e,t=[]){let{vnHeadwordSet:s}=E(),n=Array.isArray(t)?t.slice().sort((i,u)=>i[0]-u[0]).filter(([i,u])=>i>=0&&u>i&&u<=e.length):[],r=e.match(/[\p{L}\p{N}-]+|\s+|[^\p{L}\p{N}\s-]+/gu)||[],a=0,l=r.map(i=>{let u=a,g=u+i.length;a=g;let h=/\p{L}/u.test(i),p=n.some(([m,w])=>u<w&&g>m);return{text:i,isWord:h,isSpace:/^\s+$/.test(i),isPunct:!h&&!/^\s+$/.test(i),isBold:p}}),c=l.filter(i=>i.isWord).map(i=>i.text),d=c.map(i=>i.toLowerCase()),f=0,o=[];for(let i=0;i<l.length;i++){let u=l[i];if(u.isSpace){o.push({display:u.text,key:null,isPunct:!1,isSpace:!0,inDictionary:!1,isBold:u.isBold});continue}if(u.isPunct){o.push({display:u.text,key:null,isPunct:!0,isSpace:!1,inDictionary:!1,isBold:u.isBold});continue}let g=null,h=null,p=0;for(let m=c.length;m>f;m--){let w=d.slice(f,m).join(" ");if(s.has(w)){h=w,g=c.slice(f,m).join(" "),p=m-f;break}}if(g){o.push({display:g,key:h,isPunct:!1,isSpace:!1,inDictionary:!0,isBold:l[i].isBold});let m=0;for(let w=i;w<l.length&&m<p;w++)l[w].isWord&&m++,i=w;f+=p}else{let m=c[f];o.push({display:m,key:d[f],isPunct:!1,isSpace:!1,inDictionary:!1,isBold:u.isBold}),f++}}return o}Handlebars.registerHelper("join",function(e,t){return e?e.join(t):""});Handlebars.registerHelper("eq",function(e,t){return e===t});Handlebars.registerHelper("linkifyFromList",function(e,t){return new Handlebars.SafeString(_(e,t))});Handlebars.registerHelper("linkify",function(e,t){let s=Array.isArray(t)?t:[],n=N(e,s);return new Handlebars.SafeString(W(n))});Handlebars.registerHelper("boldify",function(e,t){return new Handlebars.SafeString(D(e,t))});Handlebars.registerHelper("rankBadge",function(e){return e?e<=1e3?'<span class="rank-badge core">Top 1000</span>':e<=3e3?'<span class="rank-badge common">Top 3000</span>':e<=5e3?'<span class="rank-badge general">Top 5000</span>':"":""});Handlebars.registerHelper("audioButton",function(e,t){return`
        <button class="audio-button" data-filename="${`${e.toLowerCase().replace(/\s+/g,"-")}-${t}.mp3`}" 
        data-dialect="${t.toUpperCase()}">
            <span class="audio-icon"><i class="twa twa-speaker-low-volume"></i></span> 
            ${t.toUpperCase()}
        </button>
    `});Handlebars.registerHelper("gt",(e,t)=>e>t);Handlebars.registerHelper("lte",(e,t)=>e<=t);Handlebars.registerHelper("and",(e,t)=>e&&t);var j=Handlebars.compile(`
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
                                        \u2014
                                        {{#if bold_en_offsets}}
                                            {{{boldify en bold_en_offsets}}}
                                        {{else}}
                                            {{{en}}}
                                        {{/if}}
                                        {{#if literal}}<span class="literal"> (lit: {{literal}})</span>{{/if}}
                                        {{#if note}}<span class="note"> ({{note}})</span>{{/if}}
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
`),F=Handlebars.compile(`
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
`);function L(e,t,s=!0){let n=e.toLowerCase().replace(/\s+/g,"-");return`
        <div class="search-section ${s?"open":""}" data-section="${n}">
            <h3 class="section-title collapsible">
                <span class="toggle-icon">${s?"\u25BC":"\u25B6"}</span>
                ${e}
            </h3>
            <div class="section-content">
                ${t}
            </div>
        </div>
    `}var R=!1;function b(e){R=e,document.querySelectorAll(".phonetic").forEach(t=>{t.style.display=e?"none":""}),document.querySelectorAll(".ipa").forEach(t=>{t.style.display=e?"":"none"})}function q(){return R}function V(e){return e.length===0?'<div class="no-results">No Vietnamese results</div>':e.map(t=>j(t)).join("")}function se(e){return e.length===0?'<div class="no-results">No English results</div>':e.map(t=>F(t)).join("")}function O(e){let t=document.getElementById("results");if(e.type==="empty"){t.innerHTML="";return}if(e.type==="none"){t.innerHTML='<div class="no-results">No results found</div>';return}let s=[];e.vnHeadwords&&e.vnHeadwords.length>0&&s.push(L("Vietnamese",V(e.vnHeadwords))),e.enHeadwords&&e.enHeadwords.length>0&&s.push(L("English",se(e.enHeadwords))),e.type==="includes-reverse"&&s.push('<div class="no-results">No exact English matches found. Here are some Vietnamese words whose definitions contain your search term.</div>'),e.enGlosses&&e.enGlosses.length>0&&s.push(L("Reverse lookup",V(e.enGlosses))),t.innerHTML=s.join("")}var Z;function U(e){document.documentElement.setAttribute("data-theme",e?"dark":"light")}function K(){let t=localStorage.getItem("saola_ipaMode")==="true";b(t);let s=document.getElementById("ipa-toggle");s&&(t?s.classList.add("active"):s.classList.remove("active"));let n=localStorage.getItem("saola_darkMode"),r=window.matchMedia("(prefers-color-scheme: dark)").matches,a=n!==null?n==="true":r;U(a);let l=document.getElementById("dark-mode-toggle");l&&(a?l.classList.add("active"):l.classList.remove("active"));let c=document.getElementById("search"),d=document.getElementById("clear-search");c.addEventListener("input",f=>{clearTimeout(Z),Z=setTimeout(()=>{$()},150)}),c.addEventListener("input",()=>{d.style.display=c.value?"block":"none"}),d.addEventListener("click",()=>{c.value="",d.style.display="none",c.focus(),$()}),document.getElementById("ipa-toggle").addEventListener("click",function(){let f=!this.classList.contains("active");b(f),this.classList.toggle("active"),localStorage.setItem("saola_ipaMode",f.toString()),this.blur()}),document.getElementById("dark-mode-toggle").addEventListener("click",function(){let f=!this.classList.contains("active");U(f),this.classList.toggle("active"),localStorage.setItem("saola_darkMode",f.toString()),this.blur()}),document.addEventListener("click",f=>{let o=f.target.closest(".vn-link");if(o){f.preventDefault();let g=o.dataset.word;document.getElementById("search").value=g,$();return}let i=f.target.closest(".audio-button");if(i){console.log("Audio button clicked"),f.preventDefault(),oe(i);return}let u=f.target.closest(".section-title.collapsible");if(u){let g=u.closest(".search-section"),h=g.querySelector(".section-content"),p=u.querySelector(".toggle-icon");g.classList.toggle("open"),p.textContent=g.classList.contains("open")?"\u25BC":"\u25B6";return}}),ne()}function $(){let e=document.getElementById("search").value,t=G(e);O(t),b(q())}function ne(){document.getElementById("help-button")?.addEventListener("click",()=>{J("help")}),document.getElementById("about-button")?.addEventListener("click",()=>{J("about")}),document.getElementById("modal-close")?.addEventListener("click",A),document.getElementById("modal")?.addEventListener("click",e=>{e.target.id==="modal"&&A()}),document.addEventListener("keydown",e=>{e.key==="Escape"&&A()})}async function J(e){let t=document.getElementById("modal"),s=document.getElementById("modal-body");s.innerHTML="<p>Loading...</p>",t.classList.add("active"),document.body.style.overflow="hidden";try{let r=await(await fetch(`./md/${e}.md`)).text();s.innerHTML=marked.parse(r).replace(/@\/(.+?)\/@/g,'<span class="ipa">/$1/</span>')}catch{s.innerHTML="<p>Error loading content.</p>"}}function A(){document.getElementById("modal").classList.remove("active"),document.body.style.overflow=""}function oe(e){let t=e.dataset.filename,s=new Audio(`https://pub-9ec168b9602247ec9a07b5964680de73.r2.dev/${t}?v=v1`);e.classList.add("playing"),e.disabled=!0,s.onended=()=>{e.classList.remove("playing"),e.disabled=!1},s.onerror=()=>{console.error("Audio error:",t),e.innerHTML="\u274C"},s.play().catch(n=>{console.error("Play failed:",n),e.innerHTML="\u274C"})}async function re(){let e=document.querySelector(".search-container"),t=document.getElementById("loading");t.textContent="Loading dictionary...";try{await P(),t.style.display="none",e.classList.add("ready"),document.getElementById("search").focus(),K()}catch(s){console.error("Error during initialization:",s),t.textContent="Error loading dictionary: "+s.message}}re();
