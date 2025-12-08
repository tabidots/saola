function P(e){let t={"\u0300":"","\u0301":"","\u0309":"","\u0303":"","\u0323":""},s=e.normalize("NFD"),n="";for(let r of s)n+=t[r]??r;return n.normalize("NFC")}function G(e){let t=e.replace(/\u0110/g,"D").replace(/\u0111/g,"d");return t=t.normalize("NFKD"),t=t.replace(/[\u0300-\u036f]/g,""),t}function y(e){return String(e).replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/"/g,"&quot;").replace(/'/g,"&#39;")}async function B(e){let s=await(await fetch(e)).blob(),n=new DecompressionStream("gzip"),r=s.stream().pipeThrough(n),a=await new Response(r).text();return JSON.parse(a)}RegExp.escape||(RegExp.escape=function(e){return String(e).replace(/[\\^$*+?.()|[\]{}]/g,"\\$&")});function j(e,t=[]){if(!t||t.length===0)return y(e);let s=y(e),n=[...t].sort((a,l)=>l.length-a.length),r=[];for(let a of n){let l=RegExp.escape(a),u=new RegExp(`(?<![\\p{L}\\p{M}])(${l})(?![\\p{L}\\p{M}])`,"gui"),f="",d=0,o,i=new RegExp(u.source,u.flags);for(;(o=i.exec(s))!==null;){let c=o.index,g=o.index+o[0].length;if(!r.some(p=>c>=p.start&&c<p.end||g>p.start&&g<=p.end||c<=p.start&&g>=p.end)){f+=s.substring(d,c);let p=`<a href="#" class="vn-link" data-word="${y(a.toLowerCase())}">${o[0]}</a>`;f+=p;let m=f.length-p.length,w=f.length;r.push({start:m,end:w}),d=g}}f+=s.substring(d),s=f}return s}function N(e,t=[]){if(t.length===0)return y(e);let s=e.split(/(\s+)/),n="",r=0;return s.forEach(a=>{let l=r,u=r+a.length;t.some(([d,o])=>l<o&&u>d)?n+=`<strong>${y(a)}</strong>`:n+=y(a),r=u}),n}function F(e){let t="",s=!1,n=0;for(let r=0;r<e.length;r++){let a=e[r],l=e[r-1],u=a.isPunct,f=/[([{“"']$/.test(a.display),d=/^[)\]}”"',:;\.\?!]/.test(a.display),o=l?.isPunct,i=l&&/[([{“"']$/.test(l.display),c=l&&/^[)\]}”"',:;\.\?!]$/.test(l.display);if(a.isBold&&!s?(t+="<strong>",s=!0):!a.isBold&&s&&(t+="</strong>",s=!1),r>0){let g=!0;d||f||i?g=!1:(o&&!c||!o&&!u||c&&!u)&&(g=!0),g&&(t+=" ")}n===0&&/^\)/.test(a.display)||(u?(t+=a.display,/^\)/.test(a.display)?n--:/\($/.test(a.display)&&n++):a.inDictionary?t+=`<a href="#" class="vn-link" data-word="${y(a.key)}">${y(a.display)}</a>`:t+=y(a.display))}return s&&(t+="</strong>"),t}var L=[],A=[],x=null,b=null,$=null,C=null,R="v5";async function V(){[L,A]=await Promise.all([B(`./data/vnen.json.gz?v=${R}`),B(`./data/envn.json.gz?v=${R}`)]),x=new Map,L.forEach((e,t)=>{e._idx=t;let s=[e.searchable.lowercase,e.searchable.toneless,e.searchable.plain];for(let n of s)for(let r of n)x.has(r)||x.set(r,new Set),x.get(r).add(t)}),console.log(`Vietnamese index: ${x.size} unique terms`),b=new Map,A.forEach((e,t)=>{e._idx=t;let s=e.lowercase;b.has(s)||b.set(s,[]),b.get(s).push(t)}),console.log(`English index: ${b.size} unique terms`),$=new FlexSearch.Document({id:"_idx",document:{id:"_idx",store:!0,index:["gloss"]},tokenize:"forward",optimize:!0,resolution:9,depth:2,bidirectional:!1}),L.forEach((e,t)=>{e._idx=t;let s=[];e.lexemes&&Array.isArray(e.lexemes)&&e.lexemes.forEach(n=>{n.senses&&Array.isArray(n.senses)&&n.senses.forEach(r=>{r.gloss&&typeof r.gloss=="string"&&s.push(r.gloss.toLowerCase())})}),s.length>0&&$.add({_idx:t,gloss:s.join(" ")})}),C=new Set,L.forEach(e=>{e.searchable.lowercase.forEach(t=>C.add(t))})}function E(){return{vnEn:L,enVn:A,vnIndex:x,enIndex:b,glossDocIndex:$,vnHeadwordSet:C}}function T(e,t,s){return s[e].word.toLowerCase()===t}function re(e){let{vnEn:t,vnIndex:s}=E();if(!s)return[];let n=e.trim().toLowerCase(),r=P(n),a=G(n),l=new Set,u=(o,i)=>{if(o.has(i))for(let c of o.get(i))l.add(c)},f=new Map;u(s,n),s.has(n)&&s.get(n).forEach(o=>{f.set(o,{exact:!0,startsWith:!0,length:t[o].word.length,canonical:T(o,n,t)})});let d=l.size>0;if(d||(u(s,r),s.has(r)&&s.get(r).forEach(o=>{f.has(o)||f.set(o,{exact:!1,startsWith:!0,length:t[o].word.length,canonical:T(o,n,t)})})),/^[a-zA-Z\s]+$/.test(e)&&(u(s,a),s.has(a)&&s.get(a).forEach(o=>{f.has(o)||f.set(o,{exact:!1,startsWith:!0,length:t[o].word.length,canonical:T(o,n,t)})})),l.size<10){let o=[n,r];/^[a-zA-Z\s]+$/.test(e)&&o.push(a);for(let[i,c]of s){let g;if(d?g=[n]:(g=[n,r],/^[a-zA-Z\s]+$/.test(e)&&g.push(a)),g.some(h=>new RegExp(`(^|\\s)${RegExp.escape(h)}`).test(i))){for(let h of c)if(l.add(h),!f.has(h)){let p=t[h].word.toLowerCase(),m=p.startsWith(n)||p.startsWith(r)||/^[a-zA-Z\s]+$/.test(e)&&p.startsWith(a);f.set(h,{exact:!1,startsWith:m,length:p.length})}}}}return Array.from(l).map(o=>({idx:o,...f.get(o)})).sort((o,i)=>{if(o.exact&&!i.exact)return-1;if(!o.exact&&i.exact)return 1;if(o.exact&&i.exact){if(o.canonical&&!i.canonical)return-1;if(!o.canonical&&i.canonical)return 1}if(o.startsWith&&!i.startsWith)return-1;if(!o.startsWith&&i.startsWith)return 1;if(o.length!==i.length)return o.length-i.length;let c=t[o.idx].rank||1/0,g=t[i.idx].rank||1/0;if(c!==g)return c-g;let h=t[o.idx].word,p=t[i.idx].word,m=t[o.idx].searchable.lowercase[0]||h.toLowerCase(),w=t[i.idx].searchable.lowercase[0]||p.toLowerCase();return m<w?-1:m>w?1:h===m&&p!==w?-1:p===w&&h!==m?1:0}).slice(0,20).map(o=>t[o.idx])}function ae(e){let{enVn:t,enIndex:s}=E();if(!s)return[];let n=e.toLowerCase().trim();if(!n)return[];let r=new Set;s.has(n)&&s.get(n).forEach(l=>r.add(l));for(let[l,u]of s)l.startsWith(n)&&u.forEach(f=>r.add(f));return Array.from(r).map(l=>t[l]).sort((l,u)=>{let f=l.lowercase,d=u.lowercase;return f===n&&d!==n?-1:d===n&&f!==n?1:f.length-d.length}).slice(0,20)}function ie(e){let{vnEn:t,glossDocIndex:s}=E();if(!s)return[];let n=e.toLowerCase().trim();if(!n)return[];let r=s.search(n,{limit:100,field:"gloss",enrich:!0,suggest:!0}),a=new Map;r.forEach(u=>{u.result&&Array.isArray(u.result)&&u.result.forEach(f=>{let d=t[f.id];if(!a.has(f.id)){let o=ce(d,n);o&&a.set(f.id,{word:d,score:o.score,matchedGloss:o.gloss})}})});let l=Array.from(a.values());return l.sort((u,f)=>f.score-u.score),l.slice(0,10).map(u=>u.word)}function le(e,t){let s=e.toLowerCase(),n=t.toLowerCase(),r=s.split(/;/).map(l=>l.trim()),a=0;for(let l of r){let u=l.split(/[,\s]+/).filter(p=>p.length>0),f=u.length,d=u.indexOf(n),o=u.findIndex(p=>p.startsWith(n)),i=l.includes(n),c=0;if(d!==-1){let p=d+1;c+=1e3/p}else if(o!==-1){let p=o+1;c+=500/p}else i&&(c+=50);let h=n.split(/\s+/).length/f;c*=1+h,f>8&&(c*=.5),a=Math.max(a,c)}return a}function ce(e,t){let s=null,n=0;if(!e.lexemes||(e.lexemes.forEach(a=>{a.senses&&a.senses.forEach(l=>{l.glosses&&l.glosses.forEach(u=>{let f=le(u,t);f>n&&(n=f,s=u)})})}),!s))return null;let r=n;return e.rank&&(e.rank<=1e3?r*=1.1:e.rank<=3e3&&(r*=1.05)),{gloss:s,score:r}}function U(e){if(!e.trim())return{type:"empty"};let t={type:"combined",vnHeadwords:[],enHeadwords:[],enGlosses:[]};t.vnHeadwords=re(e),t.enHeadwords=ae(e);let s=t.vnHeadwords.length>0||t.enHeadwords.length>0,n=t.enHeadwords.some(a=>a.lowercase===e);return/^[a-zA-Z ]+$/.test(e)&&!n&&(t.enGlosses=ie(e),t.enGlosses.length>0&&(t.type="includes-reverse")),!s&&!t.enGlosses.length?{type:"none"}:t}function q(e,t=[]){let{vnHeadwordSet:s}=E(),n=Array.isArray(t)?t.slice().sort((i,c)=>i[0]-c[0]).filter(([i,c])=>i>=0&&c>i&&c<=e.length):[],r=e.match(/[\p{L}\p{N}-]+|\s+|[^\p{L}\p{N}\s-]+/gu)||[],a=0,l=r.map(i=>{let c=a,g=c+i.length;a=g;let h=/\p{L}/u.test(i),p=n.some(([m,w])=>c<w&&g>m);return{text:i,isWord:h,isSpace:/^\s+$/.test(i),isPunct:!h&&!/^\s+$/.test(i),isBold:p}}),u=l.filter(i=>i.isWord).map(i=>i.text),f=u.map(i=>i.toLowerCase()),d=0,o=[];for(let i=0;i<l.length;i++){let c=l[i];if(c.isSpace){o.push({display:c.text,key:null,isPunct:!1,isSpace:!0,inDictionary:!1,isBold:c.isBold});continue}if(c.isPunct){o.push({display:c.text,key:null,isPunct:!0,isSpace:!1,inDictionary:!1,isBold:c.isBold});continue}let g=null,h=null,p=0;for(let m=u.length;m>d;m--){let w=f.slice(d,m).join(" ");if(s.has(w)){h=w,g=u.slice(d,m).join(" "),p=m-d;break}}if(g){o.push({display:g,key:h,isPunct:!1,isSpace:!1,inDictionary:!0,isBold:l[i].isBold});let m=0;for(let w=i;w<l.length&&m<p;w++)l[w].isWord&&m++,i=w;d+=p}else{let m=u[d];o.push({display:m,key:f[d],isPunct:!1,isSpace:!1,inDictionary:!1,isBold:c.isBold}),d++}}return o}Handlebars.registerHelper("join",function(e,t){return e?e.join(t):""});Handlebars.registerHelper("eq",function(e,t){return e===t});Handlebars.registerHelper("linkifyFromList",function(e,t){return new Handlebars.SafeString(j(e,t))});Handlebars.registerHelper("linkify",function(e,t){let s=Array.isArray(t)?t:[],n=q(e,s);return new Handlebars.SafeString(F(n))});Handlebars.registerHelper("boldify",function(e,t){return new Handlebars.SafeString(N(e,t))});Handlebars.registerHelper("rankBadge",function(e){return e?e<=1e3?'<span class="rank-badge core">Top 1000</span>':e<=3e3?'<span class="rank-badge common">Top 3000</span>':e<=5e3?'<span class="rank-badge general">Top 5000</span>':"":""});Handlebars.registerHelper("audioButton",function(e,t){return`
        <button class="audio-button" data-filename="${`${e.toLowerCase().replace(/\s+/g,"-")}-${t}.mp3`}" 
        data-dialect="${t.toUpperCase()}">
            <span class="audio-icon"><i class="twa twa-speaker-low-volume"></i></span> 
            ${t.toUpperCase()}
        </button>
    `});Handlebars.registerHelper("gt",(e,t)=>e>t);Handlebars.registerHelper("lte",(e,t)=>e<=t);Handlebars.registerHelper("and",(e,t)=>e&&t);var O=Handlebars.compile(`
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
`),Z=Handlebars.compile(`
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
`);function H(e,t,s=!0){let n=e.toLowerCase().replace(/\s+/g,"-");return`
        <div class="search-section ${s?"open":""}" data-section="${n}">
            <h3 class="section-title collapsible">
                <span class="toggle-icon">${s?"\u25BC":"\u25B6"}</span>
                ${e}
            </h3>
            <div class="section-content">
                ${t}
            </div>
        </div>
    `}var K=!1;function S(e){K=e,document.querySelectorAll(".phonetic").forEach(t=>{t.style.display=e?"none":""}),document.querySelectorAll(".ipa").forEach(t=>{t.style.display=e?"":"none"})}function Q(){return K}function J(e){return e.length===0?'<div class="no-results">No Vietnamese results</div>':e.map(t=>O(t)).join("")}function de(e){return e.length===0?'<div class="no-results">No English results</div>':e.map(t=>Z(t)).join("")}function X(e){let t=document.getElementById("results");if(e.type==="empty"){t.innerHTML="";return}if(e.type==="none"){t.innerHTML='<div class="no-results">No results found</div>';return}let s=[];e.vnHeadwords&&e.vnHeadwords.length>0&&s.push(H("Vietnamese",J(e.vnHeadwords))),e.enHeadwords&&e.enHeadwords.length>0&&s.push(H("English",de(e.enHeadwords))),e.type==="includes-reverse"&&s.push('<div class="no-results">No exact English matches found. Here are some Vietnamese words whose definitions contain your search term.</div>'),e.enGlosses&&e.enGlosses.length>0&&s.push(H("Reverse lookup",J(e.enGlosses))),t.innerHTML=s.join("")}var Y;function ee(){let e=/Mobi|Android/i.test(navigator.userAgent),t=window.innerWidth<=768;return e||t}function te(e){document.documentElement.setAttribute("data-theme",e?"dark":"light")}function oe(){let t=localStorage.getItem("saola_ipaMode")==="true";S(t);let s=document.getElementById("ipa-toggle");s&&(t?s.classList.add("active"):s.classList.remove("active"));let n=localStorage.getItem("saola_darkMode"),r=window.matchMedia("(prefers-color-scheme: dark)").matches,a=n!==null?n==="true":r;te(a);let l=document.getElementById("dark-mode-toggle");l&&(a?l.classList.add("active"):l.classList.remove("active"));let u=document.getElementById("search"),f=document.getElementById("clear-search");u.addEventListener("input",d=>{clearTimeout(Y),Y=setTimeout(()=>{_()},150)}),u.addEventListener("input",()=>{f.style.display=u.value?"block":"none"}),f.addEventListener("click",()=>{u.value="",f.style.display="none",u.focus(),_()}),document.getElementById("ipa-toggle").addEventListener("click",function(){let d=!this.classList.contains("active");S(d),this.classList.toggle("active"),localStorage.setItem("saola_ipaMode",d.toString()),this.blur()}),document.getElementById("dark-mode-toggle").addEventListener("click",function(){let d=!this.classList.contains("active");te(d),this.classList.toggle("active"),localStorage.setItem("saola_darkMode",d.toString()),this.blur()}),document.addEventListener("click",d=>{let o=d.target.closest(".vn-link");if(o){d.preventDefault();let c=o.dataset.word;document.getElementById("search").value=c,_();return}if(!ee()){let c=d.target.closest(".audio-button");if(c){console.log("Audio button clicked"),d.preventDefault(),ne(c);return}}let i=d.target.closest(".section-title.collapsible");if(i){let c=i.closest(".search-section"),g=c.querySelector(".section-content"),h=i.querySelector(".toggle-icon");c.classList.toggle("open"),h.textContent=c.classList.contains("open")?"\u25BC":"\u25B6";return}}),ee()&&document.addEventListener("touchstart",d=>{let o=d.target.closest(".audio-button");o&&ne(o)}),ue()}function _(){let e=document.getElementById("search").value,t=U(e);X(t),S(Q())}function ue(){document.getElementById("help-button")?.addEventListener("click",()=>{se("help")}),document.getElementById("about-button")?.addEventListener("click",()=>{se("about")}),document.getElementById("modal-close")?.addEventListener("click",D),document.getElementById("modal")?.addEventListener("click",e=>{e.target.id==="modal"&&D()}),document.addEventListener("keydown",e=>{e.key==="Escape"&&D()})}async function se(e){let t=document.getElementById("modal"),s=document.getElementById("modal-body");s.innerHTML="<p>Loading...</p>",t.classList.add("active"),document.body.style.overflow="hidden";try{let r=await(await fetch(`./md/${e}.md`)).text();s.innerHTML=marked.parse(r).replace(/@\/(.+?)\/@/g,'<span class="ipa">/$1/</span>')}catch{s.innerHTML="<p>Error loading content.</p>"}}function D(){document.getElementById("modal").classList.remove("active"),document.body.style.overflow=""}var k=new(window.AudioContext||window.webkitAudioContext),W=new Map,z=new Map,fe=/iPad|iPhone|iPod/.test(navigator.userAgent)&&!window.MSStream,v=null,I=null,M=new Audio;async function pe(e){if(W.has(e))return W.get(e);let s=await(await fetch(`https://pub-9ec168b9602247ec9a07b5964680de73.r2.dev/${e}?v=v1`)).arrayBuffer(),n=await k.decodeAudioData(s);return W.set(e,n),n}async function ge(e){if(z.has(e))return z.get(e);let s=await(await fetch(`https://pub-9ec168b9602247ec9a07b5964680de73.r2.dev/${e}?v=v1`)).blob(),n=URL.createObjectURL(s);return z.set(e,n),n}async function ne(e){let t=e.dataset.filename;v&&(v.classList.remove("playing"),v.disabled=!1),e.classList.add("playing"),e.disabled=!0,v=e;try{if(fe){let s=await ge(t);M.src=s,M.onended=()=>{e.classList.remove("playing"),e.disabled=!1,v=null},M.onerror=()=>{console.error("Audio error:",t),e.innerHTML="\u274C",e.disabled=!1,v=null},await M.play()}else{if(I)try{I.stop()}catch{}k.state==="suspended"&&await k.resume();let s=await pe(t),n=k.createBufferSource();n.buffer=s,n.connect(k.destination),I=n,n.onended=()=>{e.classList.remove("playing"),e.disabled=!1,v=null,I=null},n.start(0)}}catch(s){console.error("Audio error:",s),e.innerHTML="\u274C",e.disabled=!1,v=null}}async function he(){let e=document.querySelector(".search-container"),t=document.getElementById("loading");t.textContent="Loading dictionary...";try{await V(),t.style.display="none",e.classList.add("ready"),document.getElementById("search").focus(),oe()}catch(s){console.error("Error during initialization:",s),t.textContent="Error loading dictionary: "+s.message}}he();
