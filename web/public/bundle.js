function _(e){let t={"\u0300":"","\u0301":"","\u0309":"","\u0303":"","\u0323":""},s=e.normalize("NFD"),n="";for(let r of s)n+=t[r]??r;return n.normalize("NFC")}function D(e){let t=e.replace(/\u0110/g,"D").replace(/\u0111/g,"d");return t=t.normalize("NFKD"),t=t.replace(/[\u0300-\u036f]/g,""),t}function y(e){return String(e).replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/"/g,"&quot;").replace(/'/g,"&#39;")}async function S(e){let s=await(await fetch(e)).blob(),n=new DecompressionStream("gzip"),r=s.stream().pipeThrough(n),i=await new Response(r).text();return JSON.parse(i)}RegExp.escape||(RegExp.escape=function(e){return String(e).replace(/[\\^$*+?.()|[\]{}]/g,"\\$&")});function W(e,t=[]){if(!t||t.length===0)return y(e);let s=y(e),n=[...t].sort((i,l)=>l.length-i.length),r=[];for(let i of n){let l=RegExp.escape(i),f=new RegExp(`(?<![\\p{L}\\p{M}])(${l})(?![\\p{L}\\p{M}])`,"gui"),u="",d=0,o,a=new RegExp(f.source,f.flags);for(;(o=a.exec(s))!==null;){let c=o.index,g=o.index+o[0].length;if(!r.some(p=>c>=p.start&&c<p.end||g>p.start&&g<=p.end||c<=p.start&&g>=p.end)){u+=s.substring(d,c);let p=`<a href="#" class="vn-link" data-word="${y(i.toLowerCase())}">${o[0]}</a>`;u+=p;let h=u.length-p.length,w=u.length;r.push({start:h,end:w}),d=g}}u+=s.substring(d),s=u}return s}function z(e,t=[]){if(t.length===0)return y(e);let s=e.split(/(\s+)/),n="",r=0;return s.forEach(i=>{let l=r,f=r+i.length;t.some(([d,o])=>l<o&&f>d)?n+=`<strong>${y(i)}</strong>`:n+=y(i),r=f}),n}function P(e){let t="",s=!1,n=0;for(let r=0;r<e.length;r++){let i=e[r],l=e[r-1],f=i.isPunct,u=/[([{“"']$/.test(i.display),d=/^[)\]}”"',:;\.\?!]/.test(i.display),o=l?.isPunct,a=l&&/[([{“"']$/.test(l.display),c=l&&/^[)\]}”"',:;\.\?!]$/.test(l.display);if(i.isBold&&!s?(t+="<strong>",s=!0):!i.isBold&&s&&(t+="</strong>",s=!1),r>0){let g=!0;d||u||a?g=!1:(o&&!c||!o&&!f||c&&!f)&&(g=!0),g&&(t+=" ")}n===0&&/^\)/.test(i.display)||(f?(t+=i.display,/^\)/.test(i.display)?n--:/\($/.test(i.display)&&n++):i.inDictionary?t+=`<a href="#" class="vn-link" data-word="${y(i.key)}">${y(i.display)}</a>`:t+=y(i.display))}return s&&(t+="</strong>"),t}var L=[],M=[],x=null,E=null,B=null,$=null,G="v2";async function N(){[L,M]=await Promise.all([S(`./data/vnen.json.gz?v=${G}`),S(`./data/envn.json.gz?v=${G}`)]),x=new Map,L.forEach((e,t)=>{e._idx=t;let s=[e.searchable.lowercase,e.searchable.toneless,e.searchable.plain];for(let n of s)for(let r of n)x.has(r)||x.set(r,new Set),x.get(r).add(t)}),console.log(`Vietnamese index: ${x.size} unique terms`),E=new Map,M.forEach((e,t)=>{e._idx=t;let s=e.lowercase;E.has(s)||E.set(s,[]),E.get(s).push(t)}),console.log(`English index: ${E.size} unique terms`),B=new FlexSearch.Document({id:"_idx",document:{id:"_idx",store:!0,index:["gloss"]},tokenize:"forward",optimize:!0,resolution:9,depth:2,bidirectional:!1}),L.forEach((e,t)=>{e._idx=t;let s=[];e.lexemes&&Array.isArray(e.lexemes)&&e.lexemes.forEach(n=>{n.senses&&Array.isArray(n.senses)&&n.senses.forEach(r=>{r.gloss&&typeof r.gloss=="string"&&s.push(r.gloss.toLowerCase())})}),s.length>0&&B.add({_idx:t,gloss:s.join(" ")})}),$=new Set,L.forEach(e=>{e.searchable.lowercase.forEach(t=>$.add(t))})}function k(){return{vnEn:L,enVn:M,vnIndex:x,enIndex:E,glossDocIndex:B,vnHeadwordSet:$}}function A(e,t,s){return s[e].word.toLowerCase()===t}function te(e){let{vnEn:t,vnIndex:s}=k();if(!s)return[];let n=e.trim().toLowerCase(),r=_(n),i=D(n),l=new Set,f=(o,a)=>{if(o.has(a))for(let c of o.get(a))l.add(c)},u=new Map;f(s,n),s.has(n)&&s.get(n).forEach(o=>{u.set(o,{exact:!0,startsWith:!0,length:t[o].word.length,canonical:A(o,n,t)})});let d=l.size>0;if(d||(f(s,r),s.has(r)&&s.get(r).forEach(o=>{u.has(o)||u.set(o,{exact:!1,startsWith:!0,length:t[o].word.length,canonical:A(o,n,t)})})),/^[a-zA-Z\s]+$/.test(e)&&(f(s,i),s.has(i)&&s.get(i).forEach(o=>{u.has(o)||u.set(o,{exact:!1,startsWith:!0,length:t[o].word.length,canonical:A(o,n,t)})})),l.size<10){let o=[n,r];/^[a-zA-Z\s]+$/.test(e)&&o.push(i);for(let[a,c]of s){let g;if(d?g=[n]:(g=[n,r],/^[a-zA-Z\s]+$/.test(e)&&g.push(i)),g.some(m=>new RegExp(`(^|\\s)${RegExp.escape(m)}`).test(a))){for(let m of c)if(l.add(m),!u.has(m)){let p=t[m].word.toLowerCase(),h=p.startsWith(n)||p.startsWith(r)||/^[a-zA-Z\s]+$/.test(e)&&p.startsWith(i);u.set(m,{exact:!1,startsWith:h,length:p.length})}}}}return Array.from(l).map(o=>({idx:o,...u.get(o)})).sort((o,a)=>{if(o.exact&&!a.exact)return-1;if(!o.exact&&a.exact)return 1;if(o.exact&&a.exact){if(o.canonical&&!a.canonical)return-1;if(!o.canonical&&a.canonical)return 1}if(o.startsWith&&!a.startsWith)return-1;if(!o.startsWith&&a.startsWith)return 1;if(o.length!==a.length)return o.length-a.length;let c=t[o.idx].rank||1/0,g=t[a.idx].rank||1/0;if(c!==g)return c-g;let m=t[o.idx].word,p=t[a.idx].word,h=t[o.idx].searchable.lowercase[0]||m.toLowerCase(),w=t[a.idx].searchable.lowercase[0]||p.toLowerCase();return h<w?-1:h>w?1:m===h&&p!==w?-1:p===w&&m!==h?1:0}).slice(0,20).map(o=>t[o.idx])}function se(e){let{enVn:t,enIndex:s}=k();if(!s)return[];let n=e.toLowerCase().trim();if(!n)return[];let r=new Set;s.has(n)&&s.get(n).forEach(l=>r.add(l));for(let[l,f]of s)l.startsWith(n)&&f.forEach(u=>r.add(u));return Array.from(r).map(l=>t[l]).sort((l,f)=>{let u=l.lowercase,d=f.lowercase;return u===n&&d!==n?-1:d===n&&u!==n?1:u.length-d.length}).slice(0,20)}function ne(e){let{vnEn:t,glossDocIndex:s}=k();if(!s)return[];let n=e.toLowerCase().trim();if(!n)return[];let r=s.search(n,{limit:100,field:"gloss",enrich:!0,suggest:!0}),i=new Map;r.forEach(f=>{f.result&&Array.isArray(f.result)&&f.result.forEach(u=>{let d=t[u.id];if(!i.has(u.id)){let o=re(d,n);o&&i.set(u.id,{word:d,score:o.score,matchedGloss:o.gloss})}})});let l=Array.from(i.values());return l.sort((f,u)=>u.score-f.score),l.slice(0,10).map(f=>f.word)}function oe(e,t){let s=e.toLowerCase(),n=t.toLowerCase(),r=s.split(/;/).map(l=>l.trim()),i=0;for(let l of r){let f=l.split(/[,\s]+/).filter(p=>p.length>0),u=f.length,d=f.indexOf(n),o=f.findIndex(p=>p.startsWith(n)),a=l.includes(n),c=0;if(d!==-1){let p=d+1;c+=1e3/p}else if(o!==-1){let p=o+1;c+=500/p}else a&&(c+=50);let m=n.split(/\s+/).length/u;c*=1+m,u>8&&(c*=.5),i=Math.max(i,c)}return i}function re(e,t){let s=null,n=0;if(!e.lexemes||(e.lexemes.forEach(i=>{i.senses&&i.senses.forEach(l=>{l.glosses&&l.glosses.forEach(f=>{let u=oe(f,t);u>n&&(n=u,s=f)})})}),!s))return null;let r=n;return e.rank&&(e.rank<=1e3?r*=1.1:e.rank<=3e3&&(r*=1.05)),{gloss:s,score:r}}function j(e){if(!e.trim())return{type:"empty"};let t={type:"combined",vnHeadwords:[],enHeadwords:[],enGlosses:[]};t.vnHeadwords=te(e),t.enHeadwords=se(e);let s=t.vnHeadwords.length>0||t.enHeadwords.length>0,n=t.enHeadwords.some(i=>i.lowercase===e);return/^[a-zA-Z ]+$/.test(e)&&!n&&(t.enGlosses=ne(e),t.enGlosses.length>0&&(t.type="includes-reverse")),!s&&!t.enGlosses.length?{type:"none"}:t}function F(e,t=[]){let{vnHeadwordSet:s}=k(),n=Array.isArray(t)?t.slice().sort((a,c)=>a[0]-c[0]).filter(([a,c])=>a>=0&&c>a&&c<=e.length):[],r=e.match(/[\p{L}\p{N}-]+|\s+|[^\p{L}\p{N}\s-]+/gu)||[],i=0,l=r.map(a=>{let c=i,g=c+a.length;i=g;let m=/\p{L}/u.test(a),p=n.some(([h,w])=>c<w&&g>h);return{text:a,isWord:m,isSpace:/^\s+$/.test(a),isPunct:!m&&!/^\s+$/.test(a),isBold:p}}),f=l.filter(a=>a.isWord).map(a=>a.text),u=f.map(a=>a.toLowerCase()),d=0,o=[];for(let a=0;a<l.length;a++){let c=l[a];if(c.isSpace){o.push({display:c.text,key:null,isPunct:!1,isSpace:!0,inDictionary:!1,isBold:c.isBold});continue}if(c.isPunct){o.push({display:c.text,key:null,isPunct:!0,isSpace:!1,inDictionary:!1,isBold:c.isBold});continue}let g=null,m=null,p=0;for(let h=f.length;h>d;h--){let w=u.slice(d,h).join(" ");if(s.has(w)){m=w,g=f.slice(d,h).join(" "),p=h-d;break}}if(g){o.push({display:g,key:m,isPunct:!1,isSpace:!1,inDictionary:!0,isBold:l[a].isBold});let h=0;for(let w=a;w<l.length&&h<p;w++)l[w].isWord&&h++,a=w;d+=p}else{let h=f[d];o.push({display:h,key:u[d],isPunct:!1,isSpace:!1,inDictionary:!1,isBold:c.isBold}),d++}}return o}Handlebars.registerHelper("join",function(e,t){return e?e.join(t):""});Handlebars.registerHelper("eq",function(e,t){return e===t});Handlebars.registerHelper("linkifyFromList",function(e,t){return new Handlebars.SafeString(W(e,t))});Handlebars.registerHelper("linkify",function(e,t){let s=Array.isArray(t)?t:[],n=F(e,s);return new Handlebars.SafeString(P(n))});Handlebars.registerHelper("boldify",function(e,t){return new Handlebars.SafeString(z(e,t))});Handlebars.registerHelper("rankBadge",function(e){return e?e<=1e3?'<span class="rank-badge core">Top 1000</span>':e<=3e3?'<span class="rank-badge common">Top 3000</span>':e<=5e3?'<span class="rank-badge general">Top 5000</span>':"":""});Handlebars.registerHelper("audioButton",function(e,t){return`
        <button class="audio-button" data-filename="${`${e.toLowerCase().replace(/\s+/g,"-")}-${t}.mp3`}" 
        data-dialect="${t.toUpperCase()}">
            <span class="audio-icon"><i class="twa twa-speaker-low-volume"></i></span> 
            ${t.toUpperCase()}
        </button>
    `});Handlebars.registerHelper("gt",(e,t)=>e>t);Handlebars.registerHelper("lte",(e,t)=>e<=t);Handlebars.registerHelper("and",(e,t)=>e&&t);var V=Handlebars.compile(`
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
`),R=Handlebars.compile(`
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
`);function b(e,t,s=!0){let n=e.toLowerCase().replace(/\s+/g,"-");return`
        <div class="search-section ${s?"open":""}" data-section="${n}">
            <h3 class="section-title collapsible">
                <span class="toggle-icon">${s?"\u25BC":"\u25B6"}</span>
                ${e}
            </h3>
            <div class="section-content">
                ${t}
            </div>
        </div>
    `}var O=!1;function H(e){O=e,document.querySelectorAll(".phonetic").forEach(t=>{t.style.display=e?"none":""}),document.querySelectorAll(".ipa").forEach(t=>{t.style.display=e?"":"none"})}function Z(){return O}function q(e){return e.length===0?'<div class="no-results">No Vietnamese results</div>':e.map(t=>V(t)).join("")}function ie(e){return e.length===0?'<div class="no-results">No English results</div>':e.map(t=>R(t)).join("")}function U(e){let t=document.getElementById("results");if(e.type==="empty"){t.innerHTML="";return}if(e.type==="none"){t.innerHTML='<div class="no-results">No results found</div>';return}let s=[];e.vnHeadwords&&e.vnHeadwords.length>0&&s.push(b("Vietnamese",q(e.vnHeadwords))),e.enHeadwords&&e.enHeadwords.length>0&&s.push(b("English",ie(e.enHeadwords))),e.type==="includes-reverse"&&s.push('<div class="no-results">No exact English matches found. Here are some Vietnamese words whose definitions contain your search term.</div>'),e.enGlosses&&e.enGlosses.length>0&&s.push(b("Reverse lookup",q(e.enGlosses))),t.innerHTML=s.join("")}var J;function K(){let e=/Mobi|Android/i.test(navigator.userAgent),t=window.innerWidth<=768;return e||t}function Q(e){document.documentElement.setAttribute("data-theme",e?"dark":"light")}function ee(){let t=localStorage.getItem("saola_ipaMode")==="true";H(t);let s=document.getElementById("ipa-toggle");s&&(t?s.classList.add("active"):s.classList.remove("active"));let n=localStorage.getItem("saola_darkMode"),r=window.matchMedia("(prefers-color-scheme: dark)").matches,i=n!==null?n==="true":r;Q(i);let l=document.getElementById("dark-mode-toggle");l&&(i?l.classList.add("active"):l.classList.remove("active"));let f=document.getElementById("search"),u=document.getElementById("clear-search");f.addEventListener("input",d=>{clearTimeout(J),J=setTimeout(()=>{C()},150)}),f.addEventListener("input",()=>{u.style.display=f.value?"block":"none"}),u.addEventListener("click",()=>{f.value="",u.style.display="none",f.focus(),C()}),document.getElementById("ipa-toggle").addEventListener("click",function(){let d=!this.classList.contains("active");H(d),this.classList.toggle("active"),localStorage.setItem("saola_ipaMode",d.toString()),this.blur()}),document.getElementById("dark-mode-toggle").addEventListener("click",function(){let d=!this.classList.contains("active");Q(d),this.classList.toggle("active"),localStorage.setItem("saola_darkMode",d.toString()),this.blur()}),document.addEventListener("click",d=>{let o=d.target.closest(".vn-link");if(o){d.preventDefault();let c=o.dataset.word;document.getElementById("search").value=c,C();return}if(!K()){let c=d.target.closest(".audio-button");if(c){console.log("Audio button clicked"),d.preventDefault(),Y(c);return}}let a=d.target.closest(".section-title.collapsible");if(a){let c=a.closest(".search-section"),g=c.querySelector(".section-content"),m=a.querySelector(".toggle-icon");c.classList.toggle("open"),m.textContent=c.classList.contains("open")?"\u25BC":"\u25B6";return}}),K()&&document.addEventListener("touchstart",d=>{let o=d.target.closest(".audio-button");o&&Y(o)}),ae()}function C(){let e=document.getElementById("search").value,t=j(e);U(t),H(Z())}function ae(){document.getElementById("help-button")?.addEventListener("click",()=>{X("help")}),document.getElementById("about-button")?.addEventListener("click",()=>{X("about")}),document.getElementById("modal-close")?.addEventListener("click",T),document.getElementById("modal")?.addEventListener("click",e=>{e.target.id==="modal"&&T()}),document.addEventListener("keydown",e=>{e.key==="Escape"&&T()})}async function X(e){let t=document.getElementById("modal"),s=document.getElementById("modal-body");s.innerHTML="<p>Loading...</p>",t.classList.add("active"),document.body.style.overflow="hidden";try{let r=await(await fetch(`./md/${e}.md`)).text();s.innerHTML=marked.parse(r).replace(/@\/(.+?)\/@/g,'<span class="ipa">/$1/</span>')}catch{s.innerHTML="<p>Error loading content.</p>"}}function T(){document.getElementById("modal").classList.remove("active"),document.body.style.overflow=""}var I=new Audio,v=null;function Y(e){let t=e.dataset.filename;v&&(v.classList.remove("playing"),v.disabled=!1),I.src=`../audio/${t}`,v=e,e.classList.add("playing"),e.disabled=!0,I.onended=()=>{e.classList.remove("playing"),e.disabled=!1,v=null},I.onerror=()=>{console.error("Audio error:",t),e.innerHTML="\u274C",v=null},I.play().catch(s=>{console.error("Play failed:",s),e.innerHTML="\u274C",v=null})}async function le(){let e=document.querySelector(".search-container"),t=document.getElementById("loading");t.textContent="Loading dictionary...";try{await N(),t.style.display="none",e.classList.add("ready"),document.getElementById("search").focus(),ee()}catch(s){console.error("Error during initialization:",s),t.textContent="Error loading dictionary: "+s.message}}le();
