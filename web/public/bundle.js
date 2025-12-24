var ae={\u00F3a:"o\xE1",\u00F2a:"o\xE0",\u1ECFa:"o\u1EA3",\u00F5a:"o\xE3",\u1ECDa:"o\u1EA1",\u00F3e:"o\xE9",\u00F2e:"o\xE8",\u1ECFe:"o\u1EBB",\u00F5e:"o\u1EBD",\u1ECDe:"o\u1EB9",\u00FAy:"u\xFD",\u00F9y:"u\u1EF3",\u1EE7y:"u\u1EF7",\u0169y:"u\u1EF9",\u1EE5y:"u\u1EF5",\u00D3a:"O\xE1",\u00D2a:"O\xE0",\u1ECEa:"O\u1EA3",\u00D5a:"O\xE3",\u1ECCa:"O\u1EA1",\u00D3e:"O\xE9",\u00D2e:"O\xE8",\u1ECEe:"O\u1EBB",\u00D5e:"O\u1EBD",\u1ECCe:"O\u1EB9",\u00DAy:"U\xFD",\u00D9y:"U\u1EF3",\u1EE6y:"U\u1EF7",\u0168y:"U\u1EF9",\u1EE4y:"U\u1EF5"};function P(e){let t=/([óòỏõọÓÒỎÕỌ][ae]|[úùủũụÚÙỦŨỤ]y)\b/g;return e.replace(t,s=>ae[s]||s)}function O(e){let t={"\u0300":"","\u0301":"","\u0309":"","\u0303":"","\u0323":""},s=e.normalize("NFD"),n="";for(let r of s)n+=t[r]??r;return n.normalize("NFC")}function G(e){let t=e.replace(/\u0110/g,"D").replace(/\u0111/g,"d");return t=t.normalize("NFKD"),t=t.replace(/[\u0300-\u036f]/g,""),t}function y(e){return String(e).replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/"/g,"&quot;").replace(/'/g,"&#39;")}async function $(e){let s=await(await fetch(e)).blob(),n=new DecompressionStream("gzip"),r=s.stream().pipeThrough(n),a=await new Response(r).text();return JSON.parse(a)}RegExp.escape||(RegExp.escape=function(e){return String(e).replace(/[\\^$*+?.()|[\]{}]/g,"\\$&")});function j(e,t=[]){if(!t||t.length===0)return y(e);let s=y(e),n=[...t].sort((a,l)=>l.length-a.length),r=[];for(let a of n){let l=RegExp.escape(a),f=new RegExp(`(?<![\\p{L}\\p{M}])(${l})(?![\\p{L}\\p{M}])`,"gui"),u="",d=0,o,i=new RegExp(f.source,f.flags);for(;(o=i.exec(s))!==null;){let c=o.index,g=o.index+o[0].length;if(!r.some(p=>c>=p.start&&c<p.end||g>p.start&&g<=p.end||c<=p.start&&g>=p.end)){u+=s.substring(d,c);let p=`<a href="#" class="vn-link" data-word="${y(a.toLowerCase())}">${o[0]}</a>`;u+=p;let h=u.length-p.length,w=u.length;r.push({start:h,end:w}),d=g}}u+=s.substring(d),s=u}return s}function N(e,t=[]){if(t.length===0)return y(e);let s=e.split(/(\s+)/),n="",r=0;return s.forEach(a=>{let l=r,f=r+a.length;t.some(([d,o])=>l<o&&f>d)?n+=`<strong>${y(a)}</strong>`:n+=y(a),r=f}),n}var x=[],H=[],b=null,E=null,A=null,T=null,U="v11";async function R(){[x,H]=await Promise.all([$(`./data/vnen.json.gz?v=${U}`),$(`./data/envn.json.gz?v=${U}`)]),b=new Map,x.forEach((e,t)=>{e._idx=t;let s=[e.searchable.lowercase,e.searchable.toneless,e.searchable.plain];for(let n of s)for(let r of n)b.has(r)||b.set(r,new Set),b.get(r).add(t)}),console.log(`Vietnamese index is ready: ${b.size} searchable terms for ${x.length} entries`),E=new Map,H.forEach((e,t)=>{e._idx=t;let s=e.lowercase;E.has(s)||E.set(s,[]),E.get(s).push(t)}),console.log(`English index is ready: ${E.size} searchable terms for ${H.length} lexemes`),A=new FlexSearch.Document({id:"_idx",document:{id:"_idx",store:!0,index:["gloss"]},tokenize:"forward",optimize:!0,resolution:9,depth:2,bidirectional:!1}),x.forEach((e,t)=>{e._idx=t;let s=[];e.lexemes&&Array.isArray(e.lexemes)&&e.lexemes.forEach(n=>{n.senses&&Array.isArray(n.senses)&&n.senses.forEach(r=>{r.gloss&&typeof r.gloss=="string"&&s.push(r.gloss.toLowerCase())})}),s.length>0&&A.add({_idx:t,gloss:s.join(" ")})}),T=new Set,x.forEach(e=>{e.searchable.lowercase.forEach(t=>T.add(t))})}function L(){return{vnEn:x,enVn:H,vnIndex:b,enIndex:E,glossDocIndex:A,vnHeadwordSet:T}}function V(e=null){Handlebars.registerHelper("join",function(t,s){return t?t.join(s):""}),Handlebars.registerHelper("eq",function(t,s){return t===s}),Handlebars.registerHelper("linkifyFromList",function(t,s){return new Handlebars.SafeString(j(t,s))}),Handlebars.registerHelper("linkify",function(t,s){if(!e)return new Handlebars.SafeString(t);let n=Array.isArray(s)?s:[],r=e.segmentize(t,n);return new Handlebars.SafeString(e.linkify(r))}),Handlebars.registerHelper("boldify",function(t,s){return new Handlebars.SafeString(N(t,s))}),Handlebars.registerHelper("rankBadge",function(t){return t?t<=1e3?'<span class="rank-badge core">Top 1000</span>':t<=3e3?'<span class="rank-badge common">Top 3000</span>':t<=5e3?'<span class="rank-badge general">Top 5000</span>':"":""}),Handlebars.registerHelper("audioButton",function(t,s){return`
            <button class="audio-button" data-filename="${`${t.toLowerCase().replace(/\s+/g,"-")}-${s}.mp3`}" 
            data-dialect="${s}">
                <span class="audio-icon"><i class="twa twa-speaker-low-volume"></i></span> 
                ${s.toUpperCase()}
            </button>
        `}),Handlebars.registerHelper("gt",(t,s)=>t>s),Handlebars.registerHelper("lte",(t,s)=>t<=s),Handlebars.registerHelper("and",(t,s)=>t&&s)}function F(){let e=Handlebars.compile(`
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
    `),t=Handlebars.compile(`
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
    `);return{vnHeadwordTemplate:e,enHeadwordTemplate:t}}function S(e,t,s=!0){let n=e.toLowerCase().replace(/\s+/g,"-");return`
            <div class="search-section ${s?"open":""}" data-section="${n}">
                <h3 class="section-title collapsible">
                    <span class="toggle-icon">${s?"\u25BC":"\u25B6"}</span>
                    ${e}
                </h3>
                <div class="section-content">
                    ${t}
                </div>
            </div>
        `}function q(e,t=[]){let{vnHeadwordSet:s}=L(),n=Array.isArray(t)?t.slice().sort((i,c)=>i[0]-c[0]).filter(([i,c])=>i>=0&&c>i&&c<=e.length):[],r=e.match(/[\p{L}\p{N}-]+|\s+|[^\p{L}\p{N}\s-]+/gu)||[],a=0,l=r.map(i=>{let c=a,g=c+i.length;a=g;let m=/\p{L}/u.test(i),p=n.some(([h,w])=>c<w&&g>h);return{text:i,isWord:m,isSpace:/^\s+$/.test(i),isPunct:!m&&!/^\s+$/.test(i),isBold:p}}),f=l.filter(i=>i.isWord).map(i=>i.text),u=f.map(i=>i.toLowerCase()),d=0,o=[];for(let i=0;i<l.length;i++){let c=l[i];if(c.isSpace){o.push({display:c.text,key:null,isPunct:!1,isSpace:!0,inDictionary:!1,isBold:c.isBold});continue}if(c.isPunct){o.push({display:c.text,key:null,isPunct:!0,isSpace:!1,inDictionary:!1,isBold:c.isBold});continue}let g=null,m=null,p=0;for(let h=f.length;h>d;h--){let w=u.slice(d,h).join(" ");if(s.has(w)){m=w,g=f.slice(d,h).join(" "),p=h-d;break}}if(g){o.push({display:g,key:m,isPunct:!1,isSpace:!1,inDictionary:!0,isBold:l[i].isBold});let h=0;for(let w=i;w<l.length&&h<p;w++)l[w].isWord&&h++,i=w;d+=p}else{let h=f[d];o.push({display:h,key:u[d],isPunct:!1,isSpace:!1,inDictionary:!1,isBold:c.isBold}),d++}}return o}function Z(e){let t="",s=!1,n=0;for(let r=0;r<e.length;r++){let a=e[r],l=e[r-1],f=a.isPunct,u=/[([{“"']$/.test(a.display),d=/^[)\]}”"',:;\.\?!]/.test(a.display),o=l?.isPunct,i=l&&/[([{“"']$/.test(l.display),c=l&&/^[)\]}”"',:;\.\?!]$/.test(l.display);if(a.isBold&&!s?(t+="<strong>",s=!0):!a.isBold&&s&&(t+="</strong>",s=!1),r>0){let g=!0;d||u||i?g=!1:(o&&!c||!o&&!f||c&&!f)&&(g=!0),g&&(t+=" ")}n===0&&/^\)/.test(a.display)||(f?(t+=a.display,/^\)/.test(a.display)?n--:/\($/.test(a.display)&&n++):a.inDictionary?t+=`<a href="#" class="vn-link" data-word="${y(a.key)}">${y(a.display)}</a>`:t+=y(a.display))}return s&&(t+="</strong>"),t}function C(e,t,s){return s[e].word.toLowerCase()===t}function ie(e){let{vnEn:t,vnIndex:s}=L();if(!s)return[];let n=P(e.trim().toLowerCase()),r=O(n),a=G(n),l=new Set,f=(o,i)=>{if(o.has(i))for(let c of o.get(i))l.add(c)},u=new Map;f(s,n),s.has(n)&&s.get(n).forEach(o=>{u.set(o,{exact:!0,startsWith:!0,length:t[o].word.length,canonical:C(o,n,t)})});let d=l.size>0;if(d||(f(s,r),s.has(r)&&s.get(r).forEach(o=>{u.has(o)||u.set(o,{exact:!1,startsWith:!0,length:t[o].word.length,canonical:C(o,n,t)})})),/^[a-zA-Z\s]+$/.test(e)&&(f(s,a),s.has(a)&&s.get(a).forEach(o=>{u.has(o)||u.set(o,{exact:!1,startsWith:!0,length:t[o].word.length,canonical:C(o,n,t)})})),l.size<10){let o=[n,r];/^[a-zA-Z\s]+$/.test(e)&&o.push(a);for(let[i,c]of s){let g;if(d?g=[n]:(g=[n,r],/^[a-zA-Z\s]+$/.test(e)&&g.push(a)),g.some(m=>new RegExp(`(^|\\s)${RegExp.escape(m)}`).test(i))){for(let m of c)if(l.add(m),!u.has(m)){let p=t[m].word.toLowerCase(),h=p.startsWith(n)||p.startsWith(r)||/^[a-zA-Z\s]+$/.test(e)&&p.startsWith(a);u.set(m,{exact:!1,startsWith:h,length:p.length})}}}}return Array.from(l).map(o=>({idx:o,...u.get(o)})).sort((o,i)=>{if(o.exact&&!i.exact)return-1;if(!o.exact&&i.exact)return 1;if(o.exact&&i.exact){if(o.canonical&&!i.canonical)return-1;if(!o.canonical&&i.canonical)return 1}if(o.startsWith&&!i.startsWith)return-1;if(!o.startsWith&&i.startsWith)return 1;if(o.length!==i.length)return o.length-i.length;let c=t[o.idx].rank||1/0,g=t[i.idx].rank||1/0;if(c!==g)return c-g;let m=t[o.idx].word,p=t[i.idx].word,h=t[o.idx].searchable.lowercase[0]||m.toLowerCase(),w=t[i.idx].searchable.lowercase[0]||p.toLowerCase();return h<w?-1:h>w?1:m===h&&p!==w?-1:p===w&&m!==h?1:0}).slice(0,20).map(o=>t[o.idx])}function le(e){let{enVn:t,enIndex:s}=L();if(!s)return[];let n=e.toLowerCase().trim();if(!n)return[];let r=new Set;s.has(n)&&s.get(n).forEach(l=>r.add(l));for(let[l,f]of s)l.startsWith(n)&&f.forEach(u=>r.add(u));return Array.from(r).map(l=>t[l]).sort((l,f)=>{let u=l.lowercase,d=f.lowercase;return u===n&&d!==n?-1:d===n&&u!==n?1:u.length-d.length}).slice(0,20)}function ce(e){let{vnEn:t,glossDocIndex:s}=L();if(!s)return[];let n=e.toLowerCase().trim();if(!n)return[];let r=s.search(n,{limit:100,enrich:!0,suggest:!0}),a=new Map;r.forEach(f=>{f.result&&Array.isArray(f.result)&&f.result.forEach(u=>{let d=t[u.id];if(!a.has(u.id)){let o=fe(d,n);o&&a.set(u.id,{word:d,score:o.score,matchedGloss:o.gloss})}})});let l=Array.from(a.values());return l.sort((f,u)=>u.score-f.score),l.slice(0,10).map(f=>f.word)}function de(e,t){let s=e.toLowerCase(),n=t.toLowerCase(),r=s.split(/;/).map(l=>l.trim()),a=0;for(let l of r){let f=l.split(/[,\s]+/).filter(p=>p.length>0),u=f.length,d=f.indexOf(n),o=f.findIndex(p=>p.startsWith(n)),i=l.includes(n),c=0;if(d!==-1){let p=d+1;c+=1e3/p}else if(o!==-1){let p=o+1;c+=500/p}else i&&(c+=50);let m=n.split(/\s+/).length/u;c*=1+m,u>8&&(c*=.5),a=Math.max(a,c)}return a}function fe(e,t){let s=null,n=0;if(!e.lexemes||(e.lexemes.forEach(a=>{a.senses&&a.senses.forEach(l=>{let f=l.gloss,u=de(f,t);u>n&&(n=u,s=f)})}),!s))return null;let r=n;return e.rank&&(e.rank<=1e3?r*=1.1:e.rank<=3e3&&(r*=1.05)),{gloss:s,score:r}}function J(e){if(!e.trim())return{type:"empty"};let t={type:"combined",vnHeadwords:[],enHeadwords:[],enGlosses:[]};t.vnHeadwords=ie(e),t.enHeadwords=le(e);let s=t.vnHeadwords.length>0||t.enHeadwords.length>0,n=t.enHeadwords.some(a=>a.lowercase===e.toLowerCase().trim());return/^[a-zA-Z ]+$/.test(e)&&!n&&(t.enGlosses=ce(e),t.enGlosses.length>0&&(t.type="includes-reverse")),!s&&!t.enGlosses.length?{type:"none"}:t}var Q=!1;function I(e){Q=e,document.querySelectorAll(".phonetic").forEach(t=>{t.style.display=e?"none":""}),document.querySelectorAll(".ipa").forEach(t=>{t.style.display=e?"":"none"})}function X(){return Q}function K(e){if(e.length===0)return'<div class="no-results">No Vietnamese results</div>';let{vnHeadwordTemplate:t}=window.saolaTemplates;return e.map(s=>t(s)).join("")}function ue(e){if(e.length===0)return'<div class="no-results">No English results</div>';let{enHeadwordTemplate:t}=window.saolaTemplates;return e.map(s=>t(s)).join("")}function Y(e){let t=document.getElementById("results");if(e.type==="empty"){t.innerHTML="";return}if(e.type==="none"){t.innerHTML='<div class="no-results">No results found</div>';return}let s=[];e.vnHeadwords&&e.vnHeadwords.length>0&&s.push(S("Vietnamese",K(e.vnHeadwords))),e.enHeadwords&&e.enHeadwords.length>0&&s.push(S("English",ue(e.enHeadwords))),e.type==="includes-reverse"&&s.push('<div class="no-results">No exact English matches found. Here are some Vietnamese words whose definitions contain your search term.</div>'),e.enGlosses&&e.enGlosses.length>0&&s.push(S("Reverse lookup",K(e.enGlosses))),t.innerHTML=s.join("")}var ee;function te(){let e=/Mobi|Android/i.test(navigator.userAgent),t=window.innerWidth<=768;return e||t}function se(e){document.documentElement.setAttribute("data-theme",e?"dark":"light")}function re(){let t=localStorage.getItem("saola_ipaMode")==="true";I(t);let s=document.getElementById("ipa-toggle");s&&(t?s.classList.add("active"):s.classList.remove("active"));let n=localStorage.getItem("saola_darkMode"),r=window.matchMedia("(prefers-color-scheme: dark)").matches,a=n!==null?n==="true":r;se(a);let l=document.getElementById("dark-mode-toggle");l&&(a?l.classList.add("active"):l.classList.remove("active"));let f=document.getElementById("search"),u=document.getElementById("clear-search");f.addEventListener("input",d=>{clearTimeout(ee),ee=setTimeout(()=>{D()},150)}),f.addEventListener("input",()=>{u.style.display=f.value?"block":"none"}),u.addEventListener("click",()=>{f.value="",u.style.display="none",f.focus(),D()}),document.getElementById("ipa-toggle").addEventListener("click",function(){let d=!this.classList.contains("active");I(d),this.classList.toggle("active"),localStorage.setItem("saola_ipaMode",d.toString()),this.blur()}),document.getElementById("dark-mode-toggle").addEventListener("click",function(){let d=!this.classList.contains("active");se(d),this.classList.toggle("active"),localStorage.setItem("saola_darkMode",d.toString()),this.blur()}),document.addEventListener("click",d=>{let o=d.target.closest(".vn-link");if(o){d.preventDefault();let c=o.dataset.word;document.getElementById("search").value=c,D();return}if(!te()){let c=d.target.closest(".audio-button");if(c){console.log("Audio button clicked"),d.preventDefault(),oe(c);return}}let i=d.target.closest(".section-title.collapsible");if(i){let c=i.closest(".search-section"),g=c.querySelector(".section-content"),m=i.querySelector(".toggle-icon");c.classList.toggle("open"),m.textContent=c.classList.contains("open")?"\u25BC":"\u25B6";return}}),te()&&document.addEventListener("touchstart",d=>{let o=d.target.closest(".audio-button");o&&oe(o)}),pe()}function D(){let e=document.getElementById("search").value,t=J(e);Y(t),I(X())}function pe(){document.getElementById("help-button")?.addEventListener("click",()=>{ne("help")}),document.getElementById("about-button")?.addEventListener("click",()=>{ne("about")}),document.getElementById("modal-close")?.addEventListener("click",_),document.getElementById("modal")?.addEventListener("click",e=>{e.target.id==="modal"&&_()}),document.addEventListener("keydown",e=>{e.key==="Escape"&&_()})}async function ne(e){let t=document.getElementById("modal"),s=document.getElementById("modal-body");s.innerHTML="<p>Loading...</p>",t.classList.add("active"),document.body.style.overflow="hidden";try{let r=await(await fetch(`./md/${e}.md`)).text();s.innerHTML=marked.parse(r).replace(/@\/(.+?)\/@/g,'<span class="ipa">/$1/</span>')}catch{s.innerHTML="<p>Error loading content.</p>"}}function _(){document.getElementById("modal").classList.remove("active"),document.body.style.overflow=""}var k=new(window.AudioContext||window.webkitAudioContext),z=new Map,W=new Map,ge=/iPad|iPhone|iPod/.test(navigator.userAgent)&&!window.MSStream,v=null,M=null,B=new Audio;async function me(e){if(z.has(e))return z.get(e);let s=await(await fetch(`https://pub-9ec168b9602247ec9a07b5964680de73.r2.dev/${e}?v=v1`)).arrayBuffer(),n=await k.decodeAudioData(s);return z.set(e,n),n}async function he(e){if(W.has(e))return W.get(e);let s=await(await fetch(`https://pub-9ec168b9602247ec9a07b5964680de73.r2.dev/${e}?v=v1`)).blob(),n=URL.createObjectURL(s);return W.set(e,n),n}async function oe(e){let t=e.dataset.filename;v&&(v.classList.remove("playing"),v.disabled=!1),e.classList.add("playing"),e.disabled=!0,v=e;try{if(ge){let s=await he(t);B.src=s,B.onended=()=>{e.classList.remove("playing"),e.disabled=!1,v=null},B.onerror=()=>{console.error("Audio error:",t),e.innerHTML="\u274C",e.disabled=!1,v=null},await B.play()}else{if(M)try{M.stop()}catch{}k.state==="suspended"&&await k.resume();let s=await me(t),n=k.createBufferSource();n.buffer=s,n.connect(k.destination),M=n,n.onended=()=>{e.classList.remove("playing"),e.disabled=!1,v=null,M=null},n.start(0)}}catch(s){console.error("Audio error:",s),e.innerHTML="\u274C",e.disabled=!1,v=null}}async function we(){let e=document.querySelector(".search-container"),t=document.getElementById("loading");t.textContent="Loading dictionary...";try{await R(),t.style.display="none",e.classList.add("ready"),document.getElementById("search").focus(),V({segmentize:q,linkify:Z});let s=F();window.saolaTemplates=s,re()}catch(s){console.error("Error during initialization:",s),t.textContent="Error loading dictionary: "+s.message}}we();
