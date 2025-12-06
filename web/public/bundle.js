function W(e){let t={"\u0300":"","\u0301":"","\u0309":"","\u0303":"","\u0323":""},s=e.normalize("NFD"),n="";for(let a of s)n+=t[a]??a;return n.normalize("NFC")}function z(e){let t=e.replace(/\u0110/g,"D").replace(/\u0111/g,"d");return t=t.normalize("NFKD"),t=t.replace(/[\u0300-\u036f]/g,""),t}function y(e){return String(e).replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/"/g,"&quot;").replace(/'/g,"&#39;")}async function H(e){let s=await(await fetch(e)).blob(),n=new DecompressionStream("gzip"),a=s.stream().pipeThrough(n),c=await new Response(a).text();return JSON.parse(c)}RegExp.escape||(RegExp.escape=function(e){return String(e).replace(/[\\^$*+?.()|[\]{}]/g,"\\$&")});function P(e,t=[]){if(!t||t.length===0)return y(e);let s=y(e),n=[...t].sort((c,l)=>l.length-c.length),a=[];for(let c of n){let l=RegExp.escape(c),i=new RegExp(`(?<![\\p{L}\\p{M}])(${l})(?![\\p{L}\\p{M}])`,"gui"),u="",f=0,o,r=new RegExp(i.source,i.flags);for(;(o=r.exec(s))!==null;){let d=o.index,m=o.index+o[0].length;if(!a.some(p=>d>=p.start&&d<p.end||m>p.start&&m<=p.end||d<=p.start&&m>=p.end)){u+=s.substring(f,d);let p=`<a href="#" class="vn-link" data-word="${y(c.toLowerCase())}">${o[0]}</a>`;u+=p;let g=u.length-p.length,v=u.length;a.push({start:g,end:v}),f=m}}u+=s.substring(f),s=u}return s}function G(e,t=[]){if(t.length===0)return y(e);let s=e.split(/(\s+)/),n="",a=0;return s.forEach(c=>{let l=a,i=a+c.length;t.some(([f,o])=>l<o&&i>f)?n+=`<strong>${y(c)}</strong>`:n+=y(c),a=i}),n}function j(e){let t="",s=!1;for(let n=0;n<e.length;n++){let a=e[n],c=e[n-1],l=a.isPunct,i=/[([{“"']$/.test(a.display),u=/^[)\]}”"',:;\.\?!]/.test(a.display),f=c?.isPunct,o=c&&/[([{“"']$/.test(c.display),r=c&&/^[)\]}”"',:;\.\?!]$/.test(c.display);if(a.isBold&&!s?(t+="<strong>",s=!0):!a.isBold&&s&&(t+="</strong>",s=!1),n>0){let d=!0;u||i||o?d=!1:(f&&!r||!f&&!l||r&&!l)&&(d=!0),d&&(t+=" ")}l?t+=a.display:a.inDictionary?t+=`<a href="#" class="vn-link" data-word="${y(a.key)}">${y(a.display)}</a>`:t+=y(a.display)}return s&&(t+="</strong>"),t}var b=[],S=[],x=null,E=null,B=null,T=null;async function N(){[b,S]=await Promise.all([H("../data/vnen.json.gz"),H("../data/envn.json.gz")]),x=new Map,b.forEach((e,t)=>{e._idx=t;let s=[e.searchable.lowercase,e.searchable.toneless,e.searchable.plain];for(let n of s)for(let a of n)x.has(a)||x.set(a,new Set),x.get(a).add(t)}),console.log(`Vietnamese index: ${x.size} unique terms`),E=new Map,S.forEach((e,t)=>{e._idx=t;let s=e.lowercase;E.has(s)||E.set(s,[]),E.get(s).push(t)}),console.log(`English index: ${E.size} unique terms`),B=new FlexSearch.Document({id:"_idx",document:{id:"_idx",store:!0,index:["gloss"]},tokenize:"forward",optimize:!0,resolution:9,depth:2,bidirectional:!1}),b.forEach((e,t)=>{e._idx=t;let s=[];e.lexemes&&Array.isArray(e.lexemes)&&e.lexemes.forEach(n=>{n.senses&&Array.isArray(n.senses)&&n.senses.forEach(a=>{a.gloss&&typeof a.gloss=="string"&&s.push(a.gloss.toLowerCase())})}),s.length>0&&B.add({_idx:t,gloss:s.join(" ")})}),T=new Set,b.forEach(e=>{e.searchable.lowercase.forEach(t=>T.add(t))})}function L(){return{vnEn:b,enVn:S,vnIndex:x,enIndex:E,glossDocIndex:B,vnHeadwordSet:T}}function $(e,t,s){return s[e].word.toLowerCase()===t}function X(e){let{vnEn:t,vnIndex:s}=L();if(!s)return[];let n=e.trim().toLowerCase(),a=W(n),c=z(n),l=new Set,i=(o,r)=>{if(o.has(r))for(let d of o.get(r))l.add(d)},u=new Map;i(s,n),s.has(n)&&s.get(n).forEach(o=>{u.set(o,{exact:!0,startsWith:!0,length:t[o].word.length,canonical:$(o,n,t)})});let f=l.size>0;if(f||(i(s,a),s.has(a)&&s.get(a).forEach(o=>{u.has(o)||u.set(o,{exact:!1,startsWith:!0,length:t[o].word.length,canonical:$(o,n,t)})})),/^[a-zA-Z\s]+$/.test(e)&&(i(s,c),s.has(c)&&s.get(c).forEach(o=>{u.has(o)||u.set(o,{exact:!1,startsWith:!0,length:t[o].word.length,canonical:$(o,n,t)})})),l.size<10){let o=[n,a];/^[a-zA-Z\s]+$/.test(e)&&o.push(c);for(let[r,d]of s){let m;if(f?m=[n]:(m=[n,a],/^[a-zA-Z\s]+$/.test(e)&&m.push(c)),m.some(h=>new RegExp(`(^|\\s)${RegExp.escape(h)}`).test(r))){for(let h of d)if(l.add(h),!u.has(h)){let p=t[h].word.toLowerCase(),g=p.startsWith(n)||p.startsWith(a)||/^[a-zA-Z\s]+$/.test(e)&&p.startsWith(c);u.set(h,{exact:!1,startsWith:g,length:p.length})}}}}return Array.from(l).map(o=>({idx:o,...u.get(o)})).sort((o,r)=>{if(o.exact&&!r.exact)return-1;if(!o.exact&&r.exact)return 1;if(o.exact&&r.exact){if(o.canonical&&!r.canonical)return-1;if(!o.canonical&&r.canonical)return 1}if(o.startsWith&&!r.startsWith)return-1;if(!o.startsWith&&r.startsWith)return 1;if(o.length!==r.length)return o.length-r.length;let d=t[o.idx].rank||1/0,m=t[r.idx].rank||1/0;if(d!==m)return d-m;let h=t[o.idx].word,p=t[r.idx].word,g=t[o.idx].searchable.lowercase[0]||h.toLowerCase(),v=t[r.idx].searchable.lowercase[0]||p.toLowerCase();return g<v?-1:g>v?1:h===g&&p!==v?-1:p===v&&h!==g?1:0}).slice(0,20).map(o=>t[o.idx])}function Y(e){let{enVn:t,enIndex:s}=L();if(!s)return[];let n=e.toLowerCase().trim();if(!n)return[];let a=new Set;s.has(n)&&s.get(n).forEach(l=>a.add(l));for(let[l,i]of s)l.startsWith(n)&&i.forEach(u=>a.add(u));return Array.from(a).map(l=>t[l]).sort((l,i)=>{let u=l.lowercase,f=i.lowercase;return u===n&&f!==n?-1:f===n&&u!==n?1:u.length-f.length}).slice(0,20)}function ee(e){let{vnEn:t,glossDocIndex:s}=L();if(!s)return[];let n=e.toLowerCase().trim();if(!n)return[];let a=s.search(n,{limit:100,field:"gloss",enrich:!0,suggest:!0}),c=new Map;a.forEach(i=>{i.result&&Array.isArray(i.result)&&i.result.forEach(u=>{let f=t[u.id];if(!c.has(u.id)){let o=se(f,n);o&&c.set(u.id,{word:f,score:o.score,matchedGloss:o.gloss})}})});let l=Array.from(c.values());return l.sort((i,u)=>u.score-i.score),l.slice(0,10).map(i=>i.word)}function te(e,t){let s=e.toLowerCase(),n=t.toLowerCase(),a=s.split(/;/).map(l=>l.trim()),c=0;for(let l of a){let i=l.split(/[,\s]+/).filter(p=>p.length>0),u=i.length,f=i.indexOf(n),o=i.findIndex(p=>p.startsWith(n)),r=l.includes(n),d=0;if(f!==-1){let p=f+1;d+=1e3/p}else if(o!==-1){let p=o+1;d+=500/p}else r&&(d+=50);let h=n.split(/\s+/).length/u;d*=1+h,u>8&&(d*=.5),c=Math.max(c,d)}return c}function se(e,t){let s=null,n=0;if(!e.lexemes||(e.lexemes.forEach(c=>{c.senses&&c.senses.forEach(l=>{l.glosses&&l.glosses.forEach(i=>{let u=te(i,t);u>n&&(n=u,s=i)})})}),!s))return null;let a=n;return e.rank&&(e.rank<=1e3?a*=1.1:e.rank<=3e3&&(a*=1.05)),{gloss:s,score:a}}function A(e){if(!e.trim())return{type:"empty"};let t={type:"combined",vnHeadwords:[],enHeadwords:[],enGlosses:[]};t.vnHeadwords=X(e),t.enHeadwords=Y(e);let s=t.vnHeadwords.length>0||t.enHeadwords.length>0,n=t.enHeadwords.some(c=>c.lowercase===e);return/^[a-zA-Z ]+$/.test(e)&&!n&&(t.enGlosses=ee(e),t.enGlosses.length>0&&(t.type="includes-reverse")),!s&&!t.enGlosses.length?{type:"none"}:t}function q(e,t=[]){let{vnHeadwordSet:s}=L(),n=Array.isArray(t)?t.slice().sort((r,d)=>r[0]-d[0]).filter(([r,d])=>r>=0&&d>r&&d<=e.length):[],a=e.match(/[\p{L}\p{N}-]+|\s+|[^\p{L}\p{N}\s-]+/gu)||[],c=0,l=a.map(r=>{let d=c,m=d+r.length;c=m;let h=/\p{L}/u.test(r),p=n.some(([g,v])=>d<v&&m>g);return{text:r,isWord:h,isSpace:/^\s+$/.test(r),isPunct:!h&&!/^\s+$/.test(r),isBold:p}}),i=l.filter(r=>r.isWord).map(r=>r.text),u=i.map(r=>r.toLowerCase()),f=0,o=[];for(let r=0;r<l.length;r++){let d=l[r];if(d.isSpace){o.push({display:d.text,key:null,isPunct:!1,isSpace:!0,inDictionary:!1,isBold:d.isBold});continue}if(d.isPunct){o.push({display:d.text,key:null,isPunct:!0,isSpace:!1,inDictionary:!1,isBold:d.isBold});continue}let m=null,h=null,p=0;for(let g=i.length;g>f;g--){let v=u.slice(f,g).join(" ");if(s.has(v)){h=v,m=i.slice(f,g).join(" "),p=g-f;break}}if(m){o.push({display:m,key:h,isPunct:!1,isSpace:!1,inDictionary:!0,isBold:l[r].isBold});let g=0;for(let v=r;v<l.length&&g<p;v++)l[v].isWord&&g++,r=v;f+=p}else{let g=i[f];o.push({display:g,key:u[f],isPunct:!1,isSpace:!1,inDictionary:!1,isBold:d.isBold}),f++}}return o}Handlebars.registerHelper("join",function(e,t){return e?e.join(t):""});Handlebars.registerHelper("eq",function(e,t){return e===t});Handlebars.registerHelper("linkifyFromList",function(e,t){return new Handlebars.SafeString(P(e,t))});Handlebars.registerHelper("linkify",function(e,t){let s=Array.isArray(t)?t:[],n=q(e,s);return new Handlebars.SafeString(j(n))});Handlebars.registerHelper("boldify",function(e,t){return new Handlebars.SafeString(G(e,t))});Handlebars.registerHelper("rankBadge",function(e){return e?e<=1e3?'<span class="rank-badge core">Top 1000</span>':e<=3e3?'<span class="rank-badge common">Top 3000</span>':e<=5e3?'<span class="rank-badge general">Top 5000</span>':"":""});Handlebars.registerHelper("audioButton",function(e,t){return`
        <button class="audio-button" data-filename="${`${e.toLowerCase().replace(/\s+/g,"-")}-${t}.mp3`}" 
        data-dialect="${t.toUpperCase()}">
            <span class="audio-icon"><i class="twa twa-speaker-low-volume"></i></span> 
            ${t.toUpperCase()}
        </button>
    `});Handlebars.registerHelper("gt",(e,t)=>e>t);Handlebars.registerHelper("lte",(e,t)=>e<=t);Handlebars.registerHelper("and",(e,t)=>e&&t);var F=Handlebars.compile(`
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
                                            {{{vi}}}
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
`),V=Handlebars.compile(`
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
`);function M(e,t,s=!0){let n=e.toLowerCase().replace(/\s+/g,"-");return`
        <div class="search-section ${s?"open":""}" data-section="${n}">
            <h3 class="section-title collapsible">
                <span class="toggle-icon">${s?"\u25BC":"\u25B6"}</span>
                ${e}
            </h3>
            <div class="section-content">
                ${t}
            </div>
        </div>
    `}var U=!1;function I(e){U=e,document.querySelectorAll(".phonetic").forEach(t=>{t.style.display=e?"none":""}),document.querySelectorAll(".ipa").forEach(t=>{t.style.display=e?"":"none"})}function _(){return U}function R(e){return e.length===0?'<div class="no-results">No Vietnamese results</div>':e.map(t=>F(t)).join("")}function ne(e){return e.length===0?'<div class="no-results">No English results</div>':e.map(t=>V(t)).join("")}function C(e){let t=document.getElementById("results");if(e.type==="empty"){t.innerHTML="";return}if(e.type==="none"){t.innerHTML='<div class="no-results">No results found</div>';return}let s=[];e.vnHeadwords&&e.vnHeadwords.length>0&&s.push(M("Vietnamese",R(e.vnHeadwords))),e.enHeadwords&&e.enHeadwords.length>0&&s.push(M("English",ne(e.enHeadwords))),e.type==="includes-reverse"&&s.push('<div class="no-results">No exact English matches found. Here are some Vietnamese words whose definitions contain your search term.</div>'),e.enGlosses&&e.enGlosses.length>0&&s.push(M("Reverse lookup",R(e.enGlosses))),t.innerHTML=s.join("")}var Z;function O(e){document.documentElement.setAttribute("data-theme",e?"dark":"light")}function Q(){let t=localStorage.getItem("saola_ipaMode")==="true";I(t);let s=document.getElementById("ipa-toggle");s&&(t?s.classList.add("active"):s.classList.remove("active"));let n=localStorage.getItem("saola_darkMode"),a=window.matchMedia("(prefers-color-scheme: dark)").matches,c=n!==null?n==="true":a;O(c);let l=document.getElementById("dark-mode-toggle");l&&(c?l.classList.add("active"):l.classList.remove("active")),document.getElementById("search").addEventListener("input",i=>{clearTimeout(Z),Z=setTimeout(()=>{J()},150)}),document.getElementById("ipa-toggle").addEventListener("click",function(){let i=!this.classList.contains("active");I(i),this.classList.toggle("active"),localStorage.setItem("saola_ipaMode",i.toString()),this.blur()}),document.getElementById("dark-mode-toggle").addEventListener("click",function(){let i=!this.classList.contains("active");O(i),this.classList.toggle("active"),localStorage.setItem("saola_darkMode",i.toString()),this.blur()}),document.addEventListener("click",i=>{let u=i.target.closest(".vn-link");if(u){i.preventDefault();let r=u.dataset.word;document.getElementById("search").value=r,J();return}let f=i.target.closest(".audio-button");if(f){console.log("Audio button clicked"),i.preventDefault(),ae(f);return}let o=i.target.closest(".section-title.collapsible");if(o){let r=o.closest(".search-section"),d=r.querySelector(".section-content"),m=o.querySelector(".toggle-icon");r.classList.toggle("open"),m.textContent=r.classList.contains("open")?"\u25BC":"\u25B6";return}}),oe()}function J(){let e=document.getElementById("search").value,t=A(e);C(t),I(_())}function oe(){document.getElementById("help-button")?.addEventListener("click",()=>{K("help")}),document.getElementById("about-button")?.addEventListener("click",()=>{K("about")}),document.getElementById("modal-close")?.addEventListener("click",D),document.getElementById("modal")?.addEventListener("click",e=>{e.target.id==="modal"&&D()}),document.addEventListener("keydown",e=>{e.key==="Escape"&&D()})}async function K(e){let t=document.getElementById("modal"),s=document.getElementById("modal-body");s.innerHTML="<p>Loading...</p>",t.classList.add("active"),document.body.style.overflow="hidden";try{let a=await(await fetch(`../md/${e}.md`)).text();s.innerHTML=marked.parse(a).replace(/@\/(.+?)\/@/g,'<span class="ipa">/$1/</span>')}catch{s.innerHTML="<p>Error loading content.</p>"}}function D(){document.getElementById("modal").classList.remove("active"),document.body.style.overflow=""}function ae(e){let t=e.dataset.filename,s=new Audio(`https://pub-9ec168b9602247ec9a07b5964680de73.r2.dev/${t}?v=v1`);e.classList.add("playing"),e.disabled=!0,s.onended=()=>{e.classList.remove("playing"),e.disabled=!1},s.onerror=()=>{console.error("Audio error:",t),e.innerHTML="\u274C"},s.play().catch(n=>{console.error("Play failed:",n),e.innerHTML="\u274C"})}async function re(){let e=document.querySelector(".search-container"),t=document.getElementById("loading");t.textContent="Loading dictionary...";try{await N(),t.style.display="none",e.classList.add("ready"),document.getElementById("search").focus(),Q()}catch(s){console.error("Error during initialization:",s),t.textContent="Error loading dictionary: "+s.message}}re();
