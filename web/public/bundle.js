function A(e){let t={"\u0300":"","\u0301":"","\u0309":"","\u0303":"","\u0323":""},s=e.normalize("NFD"),n="";for(let r of s)n+=t[r]??r;return n.normalize("NFC")}function C(e){let t=e.replace(/\u0110/g,"D").replace(/\u0111/g,"d");return t=t.normalize("NFKD"),t=t.replace(/[\u0300-\u036f]/g,""),t}function y(e){return String(e).replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/"/g,"&quot;").replace(/'/g,"&#39;")}async function H(e){let s=await(await fetch(e)).blob(),n=new DecompressionStream("gzip"),r=s.stream().pipeThrough(n),c=await new Response(r).text();return JSON.parse(c)}RegExp.escape||(RegExp.escape=function(e){return String(e).replace(/[\\^$*+?.()|[\]{}]/g,"\\$&")});function T(e,t=[]){if(!t||t.length===0)return y(e);let s=y(e),n=[...t].sort((c,l)=>l.length-c.length),r=[];for(let c of n){let l=RegExp.escape(c),a=new RegExp(`(?<![\\p{L}\\p{M}])(${l})(?![\\p{L}\\p{M}])`,"gui"),f="",u=0,o,i=new RegExp(a.source,a.flags);for(;(o=i.exec(s))!==null;){let d=o.index,g=o.index+o[0].length;if(!r.some(p=>d>=p.start&&d<p.end||g>p.start&&g<=p.end||d<=p.start&&g>=p.end)){f+=s.substring(u,d);let p=`<a href="#" class="vn-link" data-word="${y(c.toLowerCase())}">${o[0]}</a>`;f+=p;let m=f.length-p.length,w=f.length;r.push({start:m,end:w}),u=g}}f+=s.substring(u),s=f}return s}function _(e,t=[]){if(t.length===0)return y(e);let s=e.split(/(\s+)/),n="",r=0;return s.forEach(c=>{let l=r,a=r+c.length;t.some(([u,o])=>l<o&&a>u)?n+=`<strong>${y(c)}</strong>`:n+=y(c),r=a}),n}function D(e){let t="",s=!1;for(let n=0;n<e.length;n++){let r=e[n],c=e[n-1],l=r.isPunct,a=/[([{“"']$/.test(r.display),f=/^[)\]}”"',:;\.\?!]/.test(r.display),u=c?.isPunct,o=c&&/[([{“"']$/.test(c.display),i=c&&/^[)\]}”"',:;\.\?!]$/.test(c.display);if(r.isBold&&!s?(t+="<strong>",s=!0):!r.isBold&&s&&(t+="</strong>",s=!1),n>0){let d=!0;f||a||o?d=!1:(u&&!i||!u&&!l||i&&!l)&&(d=!0),d&&(t+=" ")}l?t+=r.display:r.inDictionary?t+=`<a href="#" class="vn-link" data-word="${y(r.key)}">${y(r.display)}</a>`:t+=y(r.display)}return s&&(t+="</strong>"),t}var L=[],S=[],v=null,x=null,I=null,M=null;async function W(){[L,S]=await Promise.all([H("./data/vnen.json.gz"),H("./data/envn.json.gz")]),v=new Map,L.forEach((e,t)=>{e._idx=t;let s=[e.searchable.lowercase,e.searchable.toneless,e.searchable.plain];for(let n of s)for(let r of n)v.has(r)||v.set(r,new Set),v.get(r).add(t)}),console.log(`Vietnamese index: ${v.size} unique terms`),x=new Map,S.forEach((e,t)=>{e._idx=t;let s=e.lowercase;x.has(s)||x.set(s,[]),x.get(s).push(t)}),console.log(`English index: ${x.size} unique terms`),I=new FlexSearch.Document({id:"_idx",document:{id:"_idx",store:!0,index:["gloss"]},tokenize:"forward",optimize:!0,resolution:9,depth:2,bidirectional:!1}),L.forEach((e,t)=>{e._idx=t;let s=[];e.lexemes&&Array.isArray(e.lexemes)&&e.lexemes.forEach(n=>{n.senses&&Array.isArray(n.senses)&&n.senses.forEach(r=>{r.gloss&&typeof r.gloss=="string"&&s.push(r.gloss.toLowerCase())})}),s.length>0&&I.add({_idx:t,gloss:s.join(" ")})}),M=new Set,L.forEach(e=>{e.searchable.lowercase.forEach(t=>M.add(t))})}function E(){return{vnEn:L,enVn:S,vnIndex:v,enIndex:x,glossDocIndex:I,vnHeadwordSet:M}}function B(e,t,s){return s[e].word.toLowerCase()===t}function K(e){let{vnEn:t,vnIndex:s}=E();if(!s)return[];let n=e.trim().toLowerCase(),r=A(n),c=C(n),l=new Set,a=(o,i)=>{if(o.has(i))for(let d of o.get(i))l.add(d)},f=new Map;a(s,n),s.has(n)&&s.get(n).forEach(o=>{f.set(o,{exact:!0,startsWith:!0,length:t[o].word.length,canonical:B(o,n,t)})});let u=l.size>0;if(u||(a(s,r),s.has(r)&&s.get(r).forEach(o=>{f.has(o)||f.set(o,{exact:!1,startsWith:!0,length:t[o].word.length,canonical:B(o,n,t)})})),/^[a-zA-Z\s]+$/.test(e)&&(a(s,c),s.has(c)&&s.get(c).forEach(o=>{f.has(o)||f.set(o,{exact:!1,startsWith:!0,length:t[o].word.length,canonical:B(o,n,t)})})),l.size<10){let o=[n,r];/^[a-zA-Z\s]+$/.test(e)&&o.push(c);for(let[i,d]of s){let g;if(u?g=[n]:(g=[n,r],/^[a-zA-Z\s]+$/.test(e)&&g.push(c)),g.some(h=>new RegExp(`(^|\\s)${RegExp.escape(h)}`).test(i))){for(let h of d)if(l.add(h),!f.has(h)){let p=t[h].word.toLowerCase(),m=p.startsWith(n)||p.startsWith(r)||/^[a-zA-Z\s]+$/.test(e)&&p.startsWith(c);f.set(h,{exact:!1,startsWith:m,length:p.length})}}}}return Array.from(l).map(o=>({idx:o,...f.get(o)})).sort((o,i)=>{if(o.exact&&!i.exact)return-1;if(!o.exact&&i.exact)return 1;if(o.exact&&i.exact){if(o.canonical&&!i.canonical)return-1;if(!o.canonical&&i.canonical)return 1}if(o.startsWith&&!i.startsWith)return-1;if(!o.startsWith&&i.startsWith)return 1;if(o.length!==i.length)return o.length-i.length;let d=t[o.idx].rank||1/0,g=t[i.idx].rank||1/0;if(d!==g)return d-g;let h=t[o.idx].word,p=t[i.idx].word,m=t[o.idx].searchable.lowercase[0]||h.toLowerCase(),w=t[i.idx].searchable.lowercase[0]||p.toLowerCase();return m<w?-1:m>w?1:h===m&&p!==w?-1:p===w&&h!==m?1:0}).slice(0,20).map(o=>t[o.idx])}function Q(e){let{enVn:t,enIndex:s}=E();if(!s)return[];let n=e.toLowerCase().trim();if(!n)return[];let r=new Set;s.has(n)&&s.get(n).forEach(l=>r.add(l));for(let[l,a]of s)l.startsWith(n)&&a.forEach(f=>r.add(f));return Array.from(r).map(l=>t[l]).sort((l,a)=>{let f=l.lowercase,u=a.lowercase;return f===n&&u!==n?-1:u===n&&f!==n?1:f.length-u.length}).slice(0,20)}function X(e){let{vnEn:t,glossDocIndex:s}=E();if(!s)return[];let n=e.toLowerCase().trim();if(!n)return[];let r=s.search(n,{limit:100,field:"gloss",enrich:!0,suggest:!0}),c=new Map;r.forEach(a=>{a.result&&Array.isArray(a.result)&&a.result.forEach(f=>{let u=t[f.id];if(!c.has(f.id)){let o=ee(u,n);o&&c.set(f.id,{word:u,score:o.score,matchedGloss:o.gloss})}})});let l=Array.from(c.values());return l.sort((a,f)=>f.score-a.score),l.slice(0,10).map(a=>a.word)}function Y(e,t){let s=e.toLowerCase(),n=t.toLowerCase(),r=s.split(/;/).map(l=>l.trim()),c=0;for(let l of r){let a=l.split(/[,\s]+/).filter(p=>p.length>0),f=a.length,u=a.indexOf(n),o=a.findIndex(p=>p.startsWith(n)),i=l.includes(n),d=0;if(u!==-1){let p=u+1;d+=1e3/p}else if(o!==-1){let p=o+1;d+=500/p}else i&&(d+=50);let h=n.split(/\s+/).length/f;d*=1+h,f>8&&(d*=.5),c=Math.max(c,d)}return c}function ee(e,t){let s=null,n=0;if(!e.lexemes||(e.lexemes.forEach(c=>{c.senses&&c.senses.forEach(l=>{l.glosses&&l.glosses.forEach(a=>{let f=Y(a,t);f>n&&(n=f,s=a)})})}),!s))return null;let r=n;return e.rank&&(e.rank<=1e3?r*=1.1:e.rank<=3e3&&(r*=1.05)),{gloss:s,score:r}}function z(e){if(!e.trim())return{type:"empty"};let t={type:"combined",vnHeadwords:[],enHeadwords:[],enGlosses:[]};t.vnHeadwords=K(e),t.enHeadwords=Q(e);let s=t.vnHeadwords.length>0||t.enHeadwords.length>0,n=t.enHeadwords.some(c=>c.lowercase===e);return/^[a-zA-Z ]+$/.test(e)&&!n&&(t.enGlosses=X(e),t.enGlosses.length>0&&(t.type="includes-reverse")),!s&&!t.enGlosses.length?{type:"none"}:t}function P(e,t=[]){let{vnHeadwordSet:s}=E(),n=Array.isArray(t)?t.slice().sort((i,d)=>i[0]-d[0]).filter(([i,d])=>i>=0&&d>i&&d<=e.length):[],r=e.match(/[\p{L}\p{N}-]+|\s+|[^\p{L}\p{N}\s-]+/gu)||[],c=0,l=r.map(i=>{let d=c,g=d+i.length;c=g;let h=/\p{L}/u.test(i),p=n.some(([m,w])=>d<w&&g>m);return{text:i,isWord:h,isSpace:/^\s+$/.test(i),isPunct:!h&&!/^\s+$/.test(i),isBold:p}}),a=l.filter(i=>i.isWord).map(i=>i.text),f=a.map(i=>i.toLowerCase()),u=0,o=[];for(let i=0;i<l.length;i++){let d=l[i];if(d.isSpace){o.push({display:d.text,key:null,isPunct:!1,isSpace:!0,inDictionary:!1,isBold:d.isBold});continue}if(d.isPunct){o.push({display:d.text,key:null,isPunct:!0,isSpace:!1,inDictionary:!1,isBold:d.isBold});continue}let g=null,h=null,p=0;for(let m=a.length;m>u;m--){let w=f.slice(u,m).join(" ");if(s.has(w)){h=w,g=a.slice(u,m).join(" "),p=m-u;break}}if(g){o.push({display:g,key:h,isPunct:!1,isSpace:!1,inDictionary:!0,isBold:l[i].isBold});let m=0;for(let w=i;w<l.length&&m<p;w++)l[w].isWord&&m++,i=w;u+=p}else{let m=a[u];o.push({display:m,key:f[u],isPunct:!1,isSpace:!1,inDictionary:!1,isBold:d.isBold}),u++}}return o}Handlebars.registerHelper("join",function(e,t){return e?e.join(t):""});Handlebars.registerHelper("eq",function(e,t){return e===t});Handlebars.registerHelper("linkifyFromList",function(e,t){return new Handlebars.SafeString(T(e,t))});Handlebars.registerHelper("linkify",function(e,t){let s=Array.isArray(t)?t:[],n=P(e,s);return new Handlebars.SafeString(D(n))});Handlebars.registerHelper("boldify",function(e,t){return new Handlebars.SafeString(_(e,t))});Handlebars.registerHelper("rankBadge",function(e){return e?e<=1e3?'<span class="rank-badge core">Top 1000</span>':e<=3e3?'<span class="rank-badge common">Top 3000</span>':e<=5e3?'<span class="rank-badge general">Top 5000</span>':"":""});Handlebars.registerHelper("audioButton",function(e,t){return`
        <button class="audio-button" data-filename="${`${e.toLowerCase().replace(/\s+/g,"-")}-${t}.mp3`}" 
        data-dialect="${t.toUpperCase()}">
            <span class="audio-icon"><i class="twa twa-speaker-low-volume"></i></span> 
            ${t.toUpperCase()}
        </button>
    `});Handlebars.registerHelper("gt",(e,t)=>e>t);Handlebars.registerHelper("lte",(e,t)=>e<=t);Handlebars.registerHelper("and",(e,t)=>e&&t);var G=Handlebars.compile(`
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
`),j=Handlebars.compile(`
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
`);function k(e,t,s=!0){let n=e.toLowerCase().replace(/\s+/g,"-");return`
        <div class="search-section ${s?"open":""}" data-section="${n}">
            <h3 class="section-title collapsible">
                <span class="toggle-icon">${s?"\u25BC":"\u25B6"}</span>
                ${e}
            </h3>
            <div class="section-content">
                ${t}
            </div>
        </div>
    `}var F=!1;function b(e){F=e,document.querySelectorAll(".phonetic").forEach(t=>{t.style.display=e?"none":""}),document.querySelectorAll(".ipa").forEach(t=>{t.style.display=e?"":"none"})}function V(){return F}function N(e){return e.length===0?'<div class="no-results">No Vietnamese results</div>':e.map(t=>G(t)).join("")}function te(e){return e.length===0?'<div class="no-results">No English results</div>':e.map(t=>j(t)).join("")}function q(e){let t=document.getElementById("results");if(e.type==="empty"){t.innerHTML="";return}if(e.type==="none"){t.innerHTML='<div class="no-results">No results found</div>';return}let s=[];e.vnHeadwords&&e.vnHeadwords.length>0&&s.push(k("Vietnamese",N(e.vnHeadwords))),e.enHeadwords&&e.enHeadwords.length>0&&s.push(k("English",te(e.enHeadwords))),e.type==="includes-reverse"&&s.push('<div class="no-results">No exact English matches found. Here are some Vietnamese words whose definitions contain your search term.</div>'),e.enGlosses&&e.enGlosses.length>0&&s.push(k("Reverse lookup",N(e.enGlosses))),t.innerHTML=s.join("")}var R;function Z(e){document.documentElement.setAttribute("data-theme",e?"dark":"light")}function J(){let t=localStorage.getItem("saola_ipaMode")==="true";b(t);let s=document.getElementById("ipa-toggle");s&&(t?s.classList.add("active"):s.classList.remove("active"));let n=localStorage.getItem("saola_darkMode"),r=window.matchMedia("(prefers-color-scheme: dark)").matches,c=n!==null?n==="true":r;Z(c);let l=document.getElementById("dark-mode-toggle");l&&(c?l.classList.add("active"):l.classList.remove("active")),document.getElementById("search").addEventListener("input",a=>{clearTimeout(R),R=setTimeout(()=>{O()},150)}),document.getElementById("ipa-toggle").addEventListener("click",function(){let a=!this.classList.contains("active");b(a),this.classList.toggle("active"),localStorage.setItem("saola_ipaMode",a.toString()),this.blur()}),document.getElementById("dark-mode-toggle").addEventListener("click",function(){let a=!this.classList.contains("active");Z(a),this.classList.toggle("active"),localStorage.setItem("saola_darkMode",a.toString()),this.blur()}),document.addEventListener("click",a=>{let f=a.target.closest(".vn-link");if(f){a.preventDefault();let i=f.dataset.word;document.getElementById("search").value=i,O();return}let u=a.target.closest(".audio-button");if(u){console.log("Audio button clicked"),a.preventDefault(),ne(u);return}let o=a.target.closest(".section-title.collapsible");if(o){let i=o.closest(".search-section"),d=i.querySelector(".section-content"),g=o.querySelector(".toggle-icon");i.classList.toggle("open"),g.textContent=i.classList.contains("open")?"\u25BC":"\u25B6";return}}),se()}function O(){let e=document.getElementById("search").value,t=z(e);q(t),b(V())}function se(){document.getElementById("help-button")?.addEventListener("click",()=>{U("help")}),document.getElementById("about-button")?.addEventListener("click",()=>{U("about")}),document.getElementById("modal-close")?.addEventListener("click",$),document.getElementById("modal")?.addEventListener("click",e=>{e.target.id==="modal"&&$()}),document.addEventListener("keydown",e=>{e.key==="Escape"&&$()})}async function U(e){let t=document.getElementById("modal"),s=document.getElementById("modal-body");s.innerHTML="<p>Loading...</p>",t.classList.add("active"),document.body.style.overflow="hidden";try{let r=await(await fetch(`./md/${e}.md`)).text();s.innerHTML=marked.parse(r).replace(/@\/(.+?)\/@/g,'<span class="ipa">/$1/</span>')}catch{s.innerHTML="<p>Error loading content.</p>"}}function $(){document.getElementById("modal").classList.remove("active"),document.body.style.overflow=""}function ne(e){let t=e.dataset.filename,s=new Audio(`https://pub-9ec168b9602247ec9a07b5964680de73.r2.dev/${t}?v=v1`);e.classList.add("playing"),e.disabled=!0,s.onended=()=>{e.classList.remove("playing"),e.disabled=!1},s.onerror=()=>{console.error("Audio error:",t),e.innerHTML="\u274C"},s.play().catch(n=>{console.error("Play failed:",n),e.innerHTML="\u274C"})}async function oe(){let e=document.querySelector(".search-container"),t=document.getElementById("loading");t.textContent="Loading dictionary...";try{await W(),t.style.display="none",e.classList.add("ready"),document.getElementById("search").focus(),J()}catch(s){console.error("Error during initialization:",s),t.textContent="Error loading dictionary: "+s.message}}oe();
