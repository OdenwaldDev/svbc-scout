(function(){ try{ const s=document.createElement('style'); s.id='svm58css'; s.textContent="/* Heute: Liste der häufigsten Bereiche je Rolle, im Stil einer iPhone-Einstellungsliste */\n.ht{margin:4px 0 18px}\n.ht-h{font-size:20px;font-weight:750;letter-spacing:-.02em;margin:0 4px 10px;color:var(--ink);text-wrap:balance}\n.ht-liste{background:var(--card);border:1px solid var(--line);border-radius:var(--r-lg);overflow:hidden}\n.ht-z,.ht-mehr{display:flex;align-items:center;gap:14px;width:100%;min-height:60px;padding:10px 14px;border:0;background:none;color:inherit;font:inherit;text-align:left;cursor:pointer;position:relative;-webkit-tap-highlight-color:transparent}\n.ht-z+.ht-z::before{content:\"\";position:absolute;top:0;left:58px;right:0;height:1px;background:var(--line)}\n.ht-z:active,.ht-mehr:active{background:var(--card2)}\n@media (hover:hover){.ht-z:hover,.ht-mehr:hover{background:var(--card2)}}\n.ht-z:focus-visible,.ht-mehr:focus-visible{outline:2px solid var(--accent);outline-offset:-2px}\n.ht-ic{flex:none;width:30px;height:30px;border-radius:8px;display:grid;place-items:center;background:var(--c);color:#fff}\n.ht-ic svg{width:18px;height:18px;stroke-width:2.1}\n.ht-tx{flex:1;min-width:0;display:grid;gap:2px}\n.ht-tx b{font-size:16px;font-weight:620;letter-spacing:-.01em;line-height:1.25}\n.ht-tx small{font-size:13.5px;color:var(--ink2);line-height:1.3;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}\n.ht-tx small.ht-heute{color:var(--accent);font-weight:600}\n.ht-n{flex:none;min-width:24px;height:24px;padding:0 7px;border-radius:12px;display:grid;place-items:center;font-size:13px;font-weight:700;font-variant-numeric:tabular-nums;background:var(--card2);color:var(--ink2)}\n.ht-n.rot{background:var(--red);color:#fff}\n.ht-pf{flex:none;color:var(--ink3);display:grid;place-items:center;transition:transform .2s var(--ease,ease)}\n.ht-pf svg{width:16px;height:16px;stroke-width:2.4}\n.ht-pf.auf{transform:rotate(90deg)}\n/* Zugeklappte Scouting-Listen */\n.ht-mehr{background:var(--card);border:1px solid var(--line);border-radius:var(--r-lg);margin:4px 0 16px;justify-content:space-between}\n.ht-mehr span:first-child{display:grid;gap:2px}\n.ht-mehr b{font-size:16px;font-weight:620}\n.ht-mehr small{font-size:13.5px;color:var(--ink2)}\n#panel-home.ht-kompakt:not(.ht-offen)>:is(#vrHome,#homeTiles,#homeKand,#svAct,#homeCrm,.sechead,#homeFocus,#homeWechsel,#homeGems,.frow,#homePress){display:none!important}\n/* Die neue Liste ersetzt die Schnellknöpfe im Cockpit, Hinweise und Lagebild bleiben */\n#panel-home.ht-kompakt #svCockpit .svc-acts,#panel-home.ht-kompakt #svCockpit .svc-top{display:none!important}\n@media (prefers-reduced-motion:reduce){.ht-pf{transition:none}}\n/* 0.74: Leerzustand für Jugendtrainer ohne Mannschaft */\n.ht-leer{border:1px solid var(--line);border-radius:14px;padding:16px 18px;background:var(--card);color:var(--ink)}\n.ht-leer b{display:block;font-size:16px;margin-bottom:6px}\n.ht-leer p{margin:0;color:var(--ink2);line-height:1.5;font-size:14.5px}\n.ht-leer+.ht-liste{margin-top:10px}\n"; document.head.appendChild(s); }catch(e){} })();
/* =====================================================================
   Sportzentrale Beta 0.62 · Feinschliff nach Apples Human Interface Guidelines, für die ganze App
   - Tippflächen: alles, was man antippen kann, ist mindestens 44 x 44 Punkt groß. Kleine Knöpfe behalten
     ihr Aussehen, bekommen aber eine unsichtbar vergrößerte Tippfläche (wie bei iOS).
   - Eingabefelder: am Handy mindestens 44 hoch und 16px Schrift (sonst zoomt das iPhone beim Antippen).
   - VoiceOver: Eingabefelder ohne Beschriftung bekommen einen Namen aus Platzhalter, Spaltenkopf oder Text davor.
   - Dialoge: „Abbrechen“ links, die Hauptaktion rechts (wie bei iOS), wenn die Knöpfe nebeneinander stehen.
   - Textgröße: Wer am iPhone größeren Text eingestellt hat, bekommt die App entsprechend größer (abschaltbar).
   - Kontrast der schwächsten Textfarbe angehoben, weniger Bewegung respektiert (Datei svm59.css).
   - Text unter 11 Punkt hebt der Build an (build_v3.py, mind11).
   ===================================================================== */
const AP={t:null,mo:null,faktor:1,gross:new WeakSet(),text:new WeakSet()};
const apGrob=()=>{ try{ return matchMedia('(pointer:coarse)').matches; }catch(e){ return false; } };
const apSicht=e=>{ if(!e.isConnected)return false; const r=e.getBoundingClientRect(); return r.width>1&&r.height>1; };

// ---------- Tippflächen ----------
function apTippflaechen(root){
  if(!apGrob())return;
  (root||document).querySelectorAll('button, a[href], [role=button], summary, [role=tab], [role=radio], [role=checkbox]').forEach(e=>{
    if(e.tagName==='A'&&!e.classList.contains('btn')&&getComputedStyle(e).display==='inline'&&e.parentElement&&/^(P|LI|SPAN|SMALL|TD)$/.test(e.parentElement.tagName)&&e.parentElement.textContent.trim().length>e.textContent.trim().length+3)return;   // Link mitten im Text
    if(e.classList.contains('ap-hit')||e.dataset.apHit==='0'||!apSicht(e))return;
    if(AP.gross.has(e))return; const r=e.getBoundingClientRect(); if(r.width>=44&&r.height>=44){ AP.gross.add(e); return; }
    let after='none'; try{ after=getComputedStyle(e,'::after').content; }catch(x){}
    if(after&&after!=='none'&&after!=='normal'){   // ::after ist schon belegt: dann ::before nehmen, sonst Gestaltung nicht anfassen
      let vor='none'; try{ vor=getComputedStyle(e,'::before').content; }catch(x){}
      if(vor&&vor!=='none'&&vor!=='normal'){ e.dataset.apHit='0'; return; }
      if(getComputedStyle(e).position==='static')e.classList.add('ap-rel'); e.classList.add('ap-hit2'); e.dataset.apHit='0'; return; }
    if(getComputedStyle(e).position==='static')e.classList.add('ap-rel');
    e.classList.add('ap-hit'); });
}

// ---------- Namen für VoiceOver ----------
function apText(s){ return String(s||'').replace(/\s+/g,' ').trim().slice(0,60); }
function apNameFuer(e){
  if(e.placeholder)return apText(e.placeholder);
  const td=e.closest('td,th');
  if(td){ const tab=td.closest('table'), i=td.cellIndex, kopf=tab&&tab.tHead&&tab.tHead.rows[0]&&tab.tHead.rows[0].cells[i];
    const zeile=td.parentElement&&td.parentElement.cells[0]&&td.parentElement.cells[0]!==td?apText(td.parentElement.cells[0].textContent):'';
    if(kopf&&apText(kopf.textContent))return apText(kopf.textContent)+(zeile?', '+zeile:''); }
  let v=e.previousElementSibling; for(let k=0;v&&k<2;k++,v=v.previousElementSibling){ if(/^(LABEL|SPAN|B|SMALL|STRONG|EM|H4|H5|P|DIV)$/.test(v.tagName)&&!v.querySelector('input,select,textarea,button')){ const t=apText(v.textContent); if(t&&t.length<=60)return t; } }
  const eltern=e.parentElement; if(eltern&&/^(SPAN|DIV|P)$/.test(eltern.tagName)){ const t=apText([...eltern.childNodes].filter(n=>n.nodeType===3).map(n=>n.textContent).join(' ')); if(t)return t; }
  if(e.tagName==='SELECT'){ const o=e.options[e.selectedIndex]; if(o&&o.value==='')return apText(o.textContent); }
  if(e.type==='search')return 'Suchen';
  if(e.name)return apText(e.name.replace(/[_-]+/g,' '));
  return '';
}
function apNamen(root){
  (root||document).querySelectorAll('input:not([type=hidden]):not([type=checkbox]):not([type=radio]):not([type=button]):not([type=submit]), select, textarea').forEach(e=>{
    if(e.getAttribute('aria-label')||e.getAttribute('aria-labelledby')||e.closest('label')||e.title)return;
    if(e.id){ try{ if(document.querySelector(`label[for="${CSS.escape(e.id)}"]`))return; }catch(x){} }
    const n=apNameFuer(e); if(n)e.setAttribute('aria-label',n); });
  // Knöpfe nur mit Symbol: Name aus dem Tooltip (data-tip) übernehmen
  (root||document).querySelectorAll('button:not([aria-label])').forEach(b=>{ if(apText(b.textContent))return; const t=b.dataset.tip||b.title; if(t)b.setAttribute('aria-label',apText(t)); });
}

// ---------- Kästchen in Tabellen: die ganze Zelle ist Tippfläche ----------
function apZellen(root){
  if(!apGrob())return;
  (root||document).querySelectorAll('td input[type=checkbox], td input[type=radio]').forEach(cb=>{
    if(cb.closest('label'))return; const td=cb.closest('td'); if(!td||td.classList.contains('ap-zelle'))return;
    if(td.querySelectorAll('input,select,button,a,textarea').length!==1)return;
    td.classList.add('ap-zelle'); });
}
function apZeilen(root){
  if(!apGrob())return;
  // Beschriftete Kästchen: die Beschriftung ist die Tippfläche, mindestens 44 hoch
  (root||document).querySelectorAll('label').forEach(l=>{
    if(l.classList.contains('ap-lab')||!l.querySelector('input[type=checkbox],input[type=radio]')||!apSicht(l))return;
    if(l.getBoundingClientRect().height>=44)return;
    if(getComputedStyle(l).display==='inline')l.classList.add('ap-labi');
    l.classList.add('ap-lab'); });
  (root||document).querySelectorAll('input[type=checkbox], input[type=radio]').forEach(cb=>{
    if(cb.closest('label,td')||cb.id&&document.querySelector(`label[for="${CSS.escape(cb.id)}"]`))return;
    const z=cb.parentElement; if(!z||z.classList.contains('ap-zeile')||z===document.body)return;
    if(z.querySelectorAll('input,select,button,a,textarea').length!==1)return;
    z.classList.add('ap-zeile'); });
}
document.addEventListener('click',e=>{ const z=e.target.closest&&e.target.closest('.ap-zeile'); if(!z||e.target.closest('input,select,button,a,textarea,label'))return;
  const cb=z.querySelector('input'); if(cb&&!cb.disabled)cb.click(); },true);
document.addEventListener('click',e=>{ const td=e.target.closest&&e.target.closest('td.ap-zelle'); if(!td||e.target.closest('input,select,button,a,textarea,label'))return;
  const cb=td.querySelector('input'); if(cb&&!cb.disabled)cb.click(); },true);

// ---------- Text nie unter 11 Punkt (auch wenn er relativ zur Umgebung kleiner wird) ----------
function apMindest(root){
  const P=root||document.querySelector('.panel.active')||document; if(!P)return;
  P.querySelectorAll('small,span,em,i,b,strong,label,td,th,p,div,a,button').forEach(e=>{
    if(AP.text.has(e))return; let t=false; for(const n of e.childNodes){ if(n.nodeType===3&&n.textContent.trim()){ t=true; break; } } if(!t)return;
    const fs=parseFloat(getComputedStyle(e).fontSize); if(!e.getClientRects().length)return; AP.text.add(e); if(fs&&fs<10.95&&fs>=6){ e.style.fontSize='11px'; e.dataset.ap11='1'; } });
}

// ---------- Dialoge: Abbrechen links, Hauptaktion rechts ----------
function apDialog(){
  const M=document.getElementById('modal'); if(!M)return;
  M.querySelectorAll('.btnrow').forEach(row=>{
    const knoepfe=[...row.children].filter(x=>x.tagName==='BUTTON'&&apSicht(x)); if(knoepfe.length<2)return;
    const ab=knoepfe.find(x=>/^(Abbrechen|Doch nicht|Nicht jetzt)$/i.test(apText(x.textContent))); if(!ab)return;
    const top=knoepfe[0].offsetTop, nebeneinander=knoepfe.every(x=>Math.abs(x.offsetTop-top)<4);
    row.classList.toggle('ap-ios',nebeneinander);
    ab.classList.toggle('ap-abbr',nebeneinander); });
}

// ---------- Textgröße wie am iPhone (Dynamic Type) ----------
function apTextFaktor(){
  try{ if(localStorage.getItem('sv_textgroesse')==='aus')return 1; }catch(e){}
  try{ if(!CSS.supports('font','-apple-system-body'))return 1;
    const p=document.createElement('span'); p.style.cssText='font:-apple-system-body;position:absolute;visibility:hidden'; p.textContent='x'; document.body.appendChild(p);
    const px=parseFloat(getComputedStyle(p).fontSize); p.remove(); if(!px)return 1;
    return Math.max(1,Math.min(1.35,Math.round(px/17*20)/20));   // 17pt ist Apples Standard. Nur vergrößern, höchstens 135 %
  }catch(e){ return 1; }
}
function apTextAnwenden(f){
  AP.faktor=f==null?apTextFaktor():f;
  const h=document.documentElement; if(AP.faktor>1.001){ h.style.zoom=String(AP.faktor); h.dataset.apText=String(AP.faktor); } else { h.style.zoom=''; delete h.dataset.apText; }
}

// ---------- Mein Konto: Schalter für die Textgröße ----------
// Erscheinungsbild (svhell.js) hängt sich erst danach ein, darum einen Takt später
if(typeof svAccount==='function'){ const _acc=svAccount; svAccount=function(){ const r=_acc.apply(this,arguments);
  setTimeout(apKontoSchalter,0); return r; }; }
function apKontoSchalter(){
  try{ const M=document.getElementById('modal'), th=M&&M.querySelector('#thSek'); if(th&&!M.querySelector('#apTextSw')){
      let an=true; try{ an=localStorage.getItem('sv_textgroesse')!=='aus'; }catch(e){}
      const d=document.createElement('label'); d.className='ap-sw'; d.innerHTML=`<input type="checkbox" id="apTextSw"${an?' checked':''}><span><b>Textgröße vom Gerät übernehmen</b><small>Hast du am iPhone größeren Text eingestellt, wird auch die App größer.</small></span>`;
      th.appendChild(d); d.querySelector('input').onchange=e=>{ try{ localStorage.setItem('sv_textgroesse',e.target.checked?'an':'aus'); }catch(x){} apTextAnwenden(); }; } }catch(e){}
}

// ---------- Laufend anwenden ----------
function apAlles(root){ try{ apNamen(root); }catch(e){} try{ apTippflaechen(root); }catch(e){} try{ apZellen(root); }catch(e){} try{ apZeilen(root); }catch(e){} try{ apMindest(); }catch(e){} try{ apDialog(); }catch(e){} }
function apBald(){ if(AP.t)return; AP.t=setTimeout(()=>{ AP.t=null; apAlles(); },250); }
(function(){ const go=()=>{ apTextAnwenden(); apAlles();
    try{ AP.mo=new MutationObserver(m=>{ if(m.some(x=>x.addedNodes.length))apBald(); }); AP.mo.observe(document.body,{childList:true,subtree:true}); }catch(e){}
    addEventListener('resize',apBald); };
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',go); else go(); })();
{ const _gt=goTab; goTab=function(){ const r=_gt.apply(this,arguments); apBald(); return r; }; }

(function(){ try{ const s=document.createElement('style'); s.id='svm59css'; s.textContent="/* Feinschliff nach Apples Human Interface Guidelines (Beta 0.62) */\n/* Schwächste Textfarbe: Kontrast mindestens 4,5:1 auf allen Flächen */\n:root:root{--ink3:#8d96ab}\nhtml[data-theme=\"hell\"]:root{--ink3:#4d5668}\n/* Aktive Segmente: Weiß auf kräftigerem Blau (5,2:1 statt 2,8:1) */\n.k1-seg button.on,.st-bf button.on,.st-mf button.on{background:#2563eb!important}\n\n/* Tippflächen mindestens 44 x 44, ohne das Aussehen zu ändern */\n@media (pointer:coarse){\n  .ap-rel{position:relative}\n  .ap-hit::after{content:\"\";position:absolute;left:50%;top:50%;width:max(100%,44px);height:max(100%,44px);transform:translate(-50%,-50%);background:transparent}\n  .ap-hit2::before{content:\"\";position:absolute;left:50%;top:50%;width:max(100%,44px);height:max(100%,44px);transform:translate(-50%,-50%);background:transparent}\n  /* Eingabefelder: 44 hoch und 16px Schrift, damit das iPhone beim Antippen nicht hineinzoomt */\n  input:not([type=checkbox]):not([type=radio]):not([type=range]):not([type=color]):not([type=file]),select,textarea{min-height:44px!important;font-size:max(16px,1em)}\n  input[type=checkbox],input[type=radio]{min-width:22px;min-height:22px}\n  td.ap-zelle{cursor:pointer;min-width:44px;height:44px}\n  .ap-zeile{cursor:pointer;min-height:44px}\n  label.ap-lab{min-height:44px}\n  label.ap-labi{display:inline-flex;align-items:center;gap:6px}\n}\n\n/* Dialoge: Abbrechen links, Hauptaktion rechts, wenn die Knöpfe nebeneinander stehen */\n#modal .btnrow.ap-ios{display:flex;justify-content:flex-end}\n#modal .btnrow.ap-ios .ap-abbr{order:-1;margin-right:auto}\n\n/* Schalter Textgröße in Mein Konto */\n.ap-sw{display:flex;gap:12px;align-items:flex-start;margin-top:14px;cursor:pointer;min-height:44px}\n.ap-sw input{flex:none;width:22px;height:22px;margin-top:2px;accent-color:var(--accent)}\n.ap-sw span{display:grid;gap:2px}\n.ap-sw b{font-size:15px;font-weight:650}\n.ap-sw small{font-size:13px;color:var(--ink2);line-height:1.4}\n\n/* Weniger Bewegung: Animationen und Übergänge fast ganz aus, wenn am Gerät eingestellt */\n@media (prefers-reduced-motion:reduce){\n  *,*::before,*::after{animation-duration:.01ms!important;animation-iteration-count:1!important;animation-delay:0s!important;transition-duration:.01ms!important;transition-delay:0s!important;scroll-behavior:auto!important}\n}\n\n/* Fokus für Tastatur und Schalterbedienung immer sichtbar */\n:focus-visible{outline:2px solid var(--accent);outline-offset:2px}\n\n/* Einzelne Stellen mit zu wenig Kontrast */\n.pk-seg button.on{color:#141a2e}\nhtml[data-theme=\"hell\"] .k1-ann{color:#7a5200;border-color:color-mix(in srgb,#7a5200 50%,transparent)}\nhtml[data-theme=\"hell\"] .linkbox code{color:#1e3a8a;background:rgba(40,48,72,.06)}\nhtml[data-theme=\"hell\"] .trai-steps code{color:#1e3a8a!important;background:rgba(40,48,72,.06)!important}\n/* Partner-Steuerung: aktiver Unterreiter auch im hellen Modus gut lesbar */\n.pe-sub button.on{background:#2563eb!important;color:#fff!important;border-color:transparent!important}\n"; document.head.appendChild(s); }catch(e){} })();
/* =====================================================================
   Sportzentrale Beta 0.63 · Weiche für die Store-Apps (iPhone, Android) und „Konto löschen“
   Die Web-App läuft unverändert weiter. In der Store-App (Capacitor) kommen dazu:
   - Mitteilungen über Apple (APNs) und Google (FCM) statt Web-Push, mit denselben Knöpfen in der App
   - Tipp auf eine Mitteilung öffnet genau die Meldung
   - Entsperren mit Face ID oder Fingerabdruck (abschaltbar, nur wenn das Gerät es kann)
   - Teilen über das Teilen-Menü des Telefons, spürbares Tippen auch am iPhone
   - Links nach außen zeigen immer auf https://svbsc.kaderwerk.pro (svBasis in boot.js)
   Für alle (Web und App): Konto selbst löschen unter Mein Konto (Apple Richtlinie 5.1.1).
   ===================================================================== */
const SVN={nativ:false,plattform:'web',plug:{},token:null,gesperrt:false};
try{ const C=window.Capacitor; SVN.nativ=!!(C&&C.isNativePlatform&&C.isNativePlatform()); SVN.plattform=SVN.nativ&&C.getPlatform?C.getPlatform():'web'; SVN.plug=(C&&C.Plugins)||{}; }catch(e){}
const svnLs=(k,v)=>{ try{ if(v===undefined)return localStorage.getItem(k); if(v===null)localStorage.removeItem(k); else localStorage.setItem(k,v); }catch(e){ return null; } };

if(SVN.nativ){
  document.documentElement.classList.add('nativ','nativ-'+SVN.plattform);

  // ---------- Updates in der Store-App (Beta 0.65) ----------
  // Die Dateien liegen in der App selbst. Neue Versionen holt der Capgo-Updater still im Hintergrund (Funktion app-ota),
  // sie gelten ab dem nächsten Öffnen. Service Worker und version.json-Abfrage der Web-App sind hier aus.
  appRegisterSW=function(){};
  appCheckUpdate=async function(){ return null; };
  try{ const U=SVN.plug.CapacitorUpdater; if(U&&U.notifyAppReady){ const ok=()=>{ try{ U.notifyAppReady(); }catch(e){} };
    if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',ok); else ok(); } }catch(e){}

  // ---------- Mitteilungen über APNs/FCM ----------
  const PN=()=>SVN.plug.PushNotifications;
  svPushState=async function(){ const P=PN(); if(!P)return 'unsupported';
    try{ const p=await P.checkPermissions(); if(p.receive==='denied')return 'denied'; if(p.receive!=='granted')return 'off'; }catch(e){ return 'off'; }
    const t=svnLs('sv_push_token'); if(!t)return 'off';
    try{ const {data}=await SVB.sb.from('push_native').select('token').eq('token',t).maybeSingle(); return data?'on':'off'; }catch(e){ return 'off'; } };
  svPushOn=async function(){ const P=PN(); if(!P){ kToast('Mitteilungen sind in dieser App-Version nicht eingerichtet.'); return false; }
    let p=await P.checkPermissions(); if(p.receive!=='granted')p=await P.requestPermissions();
    if(p.receive!=='granted'){ svPushHelp('denied'); return false; }
    const token=await new Promise((ok,nein)=>{ let fertig=false; const t=setTimeout(()=>{ if(!fertig)nein(new Error('Das Telefon hat keine Adresse für Mitteilungen geliefert')); },15000);
      P.addListener('registration',r=>{ fertig=true; clearTimeout(t); ok(r.value); });
      P.addListener('registrationError',e=>{ fertig=true; clearTimeout(t); nein(new Error('Anmelden für Mitteilungen fehlgeschlagen')); });
      P.register(); });
    const {error}=await SVB.sb.rpc('push_nativ_anmelden',{p_token:token,p_plattform:SVN.plattform==='ios'?'ios':'android',p_version:String(typeof APP_BUILD!=='undefined'?APP_BUILD:'')});
    if(error)throw new Error('Anmelden fehlgeschlagen');
    svnLs('sv_push_token',token);
    try{ await svPushTest(); kToast('🔔 Mitteilungen sind an. Gleich kommt eine Test-Mitteilung'); }catch(e){ kToast('🔔 Mitteilungen sind an'); }
    return true; };
  svPushOff=async function(){ const t=svnLs('sv_push_token'); try{ if(t)await SVB.sb.rpc('push_nativ_abmelden',{p_token:t}); }catch(e){}
    try{ const P=PN(); if(P&&P.unregister)await P.unregister(); }catch(e){} svnLs('sv_push_token',null);
    kToast('🔕 Mitteilungen auf diesem Gerät ausgeschaltet'); };
  // Tipp auf eine Mitteilung: Link aus der Nachricht öffnen (./#meldung=…)
  // Knopf Ja oder Nein in der Mitteilung (Beta 0.99.4): actionId SVBC_JA / SVBC_NEIN, dazu die Frage aus den Daten.
  // Android schickt die Antwort als Adresse (#frage=<id>:ja), weil die Knöpfe dort der Empfangsdienst der App baut.
  try{ const P=PN(); if(P){ P.addListener('pushNotificationActionPerformed',a=>{ try{
      const d=(a&&a.notification&&a.notification.data)||{}; const act=String((a&&a.actionId)||'');
      const w=act==='SVBC_JA'?'ja':act==='SVBC_NEIN'?'nein':null;
      if(w&&d.frage&&typeof svZiel==='function'){ svZiel('frage='+String(d.frage)+':'+w,'push'); return; }
      const u=d.url||''; const h=String(u).replace(/^\.\//,'');
      if(/^#frage=/.test(h)&&typeof svZiel==='function'){ svZiel(h.slice(1),'push'); return; }
      if(/^#meldung=[\d,]+$/.test(h)&&typeof svZiel==='function'){ try{ if(typeof svzMerkzettel==='function')svzMerkzettel(); }catch(x){} svZiel(h.slice(1),'push'); }
      else if(/^#[a-z]+$/.test(h))location.hash=h; }catch(e){} }); } }catch(e){}

  // ---------- Teilen und Tippen ----------
  const SH=SVN.plug.Share;
  if(SH&&SH.share){ const alt=navigator.share&&navigator.share.bind(navigator);
    navigator.share=async d=>{ d=d||{}; if(d.files&&d.files.length){ if(alt)return alt(d); throw Object.assign(new Error('Dateien teilen geht hier nicht'),{name:'NotAllowedError'}); }
      try{ await SH.share({title:d.title||'',text:d.text||'',url:d.url||undefined,dialogTitle:'Teilen'}); }catch(e){ if(/cancel/i.test(String(e&&e.message)))throw Object.assign(new Error('abgebrochen'),{name:'AbortError'}); throw e; } }; }
  const HP=SVN.plug.Haptics;
  if(HP&&typeof svHaptic==='function'){ svHaptic=function(kind){ try{ if((typeof sv43Reduced==='function'&&sv43Reduced())||(typeof sv43HapOn==='function'&&!sv43HapOn()))return;
      if(kind==='success'||kind==='warn')HP.notification({type:kind==='success'?'SUCCESS':'WARNING'}); else HP.impact({style:kind==='medium'?'MEDIUM':'LIGHT'}); }catch(e){} }; }

  // ---------- Entsperren mit Face ID oder Fingerabdruck ----------
  const BIO=()=>SVN.plug.NativeBiometric;
  async function svnBioVerfuegbar(){ try{ const B=BIO(); if(!B)return false; const r=await B.isAvailable(); return !!(r&&r.isAvailable); }catch(e){ return false; } }
  async function svnEntsperren(){
    if(svnLs('sv_bio')!=='an'||SVN.gesperrt)return; const B=BIO(); if(!B)return;
    SVN.gesperrt=true; let w=document.getElementById('svnSperre');
    if(!w){ w=document.createElement('div'); w.id='svnSperre'; w.setAttribute('role','dialog'); w.setAttribute('aria-modal','true'); w.setAttribute('aria-label','App gesperrt');
      w.innerHTML=`<div class="svn-sp"><img src="icon-192.png" alt="" width="72" height="72"><h2>Sportzentrale</h2><p>Zum Öffnen entsperren.</p><button type="button" class="btn" id="svnAuf">Entsperren</button></div>`;
      document.body.appendChild(w); w.querySelector('#svnAuf').onclick=()=>pruefen(); }
    w.hidden=false;
    async function pruefen(){ try{ await B.verifyIdentity({reason:'Sportzentrale entsperren',title:'Sportzentrale',subtitle:'',description:''}); w.hidden=true; SVN.gesperrt=false; }catch(e){ /* bleibt gesperrt, Knopf erneut */ } }
    pruefen();
  }
  const APP=SVN.plug.App;
  try{ if(APP){ let weg=0; APP.addListener('appStateChange',s=>{ if(!s.isActive)weg=Date.now(); else if(weg&&Date.now()-weg>60000)svnEntsperren(); }); } }catch(e){}
  // Android öffnet die App über eine Adresse: Knopf Ja oder Nein in der Mitteilung (#frage=<id>:ja), später auch Links von der Webseite
  try{ if(APP)APP.addListener('appUrlOpen',ev=>{ try{ const h=String((ev&&ev.url)||'').split('#')[1]||''; if(h&&typeof svZiel==='function')svZiel(h,'push'); }catch(e){} }); }catch(e){}
  // Eine Frage kommt an, während die App offen ist: gleich oben auf der Startseite zeigen
  try{ const P=PN(); if(P)P.addListener('pushNotificationReceived',n=>{ try{ if(n&&n.data&&n.data.frage&&typeof frLaden==='function')frLaden(true).then(()=>{ try{ frKarte(); }catch(e){} }); }catch(e){} }); }catch(e){}
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',()=>svnEntsperren()); else svnEntsperren();
  SVN.bioVerfuegbar=svnBioVerfuegbar; SVN.entsperren=svnEntsperren;
}

// ---------- Mein Konto: Face ID (nur App) und Konto löschen (überall) ----------
{ const _acc=svAccount; svAccount=function(){ const r=_acc.apply(this,arguments); setTimeout(svnKonto,0); return r; }; }
async function svnKonto(){
  const M=document.getElementById('modal'); if(!M||M.querySelector('#svnLoeschSek'))return;
  const app=[...M.querySelectorAll('.editsec')].find(s=>/^App/.test((s.querySelector('h4')||{}).textContent||''));
  if(SVN.nativ&&SVN.bioVerfuegbar&&await SVN.bioVerfuegbar()&&!M.querySelector('#svnBio')){
    const d=document.createElement('label'); d.className='ap-sw'; d.innerHTML=`<input type="checkbox" id="svnBio"${svnLs('sv_bio')==='an'?' checked':''}><span><b>Mit Face ID oder Fingerabdruck sperren</b><small>Nach einer Minute im Hintergrund fragt die App beim Öffnen danach.</small></span>`;
    (app||M).appendChild(d); d.querySelector('input').onchange=e=>svnLs('sv_bio',e.target.checked?'an':'aus'); }
  const s=document.createElement('div'); s.className='editsec'; s.id='svnLoeschSek';
  s.innerHTML=`<h4>Konto löschen</h4><p class="note">Löscht dein Konto und deine Anmeldung dauerhaft. Was du für den Verein eingetragen hast (zum Beispiel Trainings oder Aufgaben), bleibt ohne deinen Namen erhalten.</p>
    <button type="button" class="btn ghost svn-rot" id="svnLoesch">${SVI('trash')} Konto löschen …</button>`;
  M.appendChild(s); s.querySelector('#svnLoesch').onclick=svnLoeschenDialog;
}
function svnLoeschenDialog(){
  const M=svModal(`<div class="og-form"><h2>Konto wirklich löschen?</h2>
    <p>Das lässt sich nicht rückgängig machen. Du wirst abgemeldet und kannst die Sportzentrale erst wieder nutzen, wenn dich jemand neu einlädt.</p>
    <label class="svn-best"><span>Zur Bestätigung <b>LÖSCHEN</b> eingeben</span><input id="svnBest" autocomplete="off" autocapitalize="characters" spellcheck="false"></label>
    <p class="note" id="svnFehler" role="alert" hidden></p>
    <div class="btnrow sbact"><button type="button" class="btn svn-rotvoll" id="svnJa" disabled>Konto löschen</button><button type="button" class="btn ghost" id="svnNein">Abbrechen</button></div></div>`);
  const i=M.querySelector('#svnBest'), ja=M.querySelector('#svnJa'), f=M.querySelector('#svnFehler');
  i.oninput=()=>{ ja.disabled=i.value.trim().toUpperCase()!=='LÖSCHEN'; };
  M.querySelector('#svnNein').onclick=()=>closeOverlay();
  ja.onclick=async()=>{ ja.disabled=true; ja.textContent='Wird gelöscht …'; f.hidden=true;
    try{ const {data,error}=await SVB.sb.functions.invoke('admin-users',{body:{action:'selbst_loeschen',bestaetigung:'LÖSCHEN',app_url:typeof svBasis==='function'?svBasis():''}});
      let msg=data&&data.error; if(error&&!msg){ try{ msg=(await error.context.json()).error; }catch(x){} }
      if(error||!data||!data.ok)throw new Error(msg||'Das Konto konnte gerade nicht gelöscht werden.');
      try{ if(SVN.nativ)await svPushOff(); }catch(x){}
      try{ await SVB.sb.auth.signOut(); }catch(x){}
      try{ localStorage.clear(); sessionStorage.clear(); }catch(x){}
      svModal('<div class="og-form"><h2>Dein Konto ist gelöscht</h2><p>Danke für deine Zeit im Team.</p></div>');
      setTimeout(()=>location.reload(),2500);
    }catch(e){ f.textContent=e.message||String(e); f.hidden=false; ja.disabled=false; ja.textContent='Konto löschen'; } };
  setTimeout(()=>i.focus(),60);
}

(function(){ try{ const s=document.createElement('style'); s.id='svm60css'; s.textContent="/* Store-Apps: Sperrbildschirm, Konto löschen */\n#svnSperre{position:fixed;inset:0;z-index:2147483000;background:#05070c;display:grid;place-items:center;padding:24px;padding-top:max(24px,env(safe-area-inset-top))}\n#svnSperre[hidden]{display:none!important}\n.svn-sp{display:grid;justify-items:center;gap:12px;text-align:center;color:#eef2f8}\n.svn-sp img{border-radius:22.37%}\n.svn-sp h2{margin:6px 0 0;font-size:22px;font-weight:750;letter-spacing:-.02em}\n.svn-sp p{margin:0;color:#a2acbf;font-size:15px}\n.svn-sp .btn{min-width:200px;min-height:48px;margin-top:10px}\n.btn.svn-rot{color:#f87171!important;border-color:color-mix(in srgb,#f87171 40%,transparent)!important}\nhtml[data-theme=\"hell\"] .btn.svn-rot{color:#b91c1c!important}\n.btn.svn-rotvoll{background:#dc2626!important;color:#fff!important;border-color:transparent!important}\n.btn.svn-rotvoll:disabled{opacity:.45}\n.svn-best{display:grid;gap:6px;margin:14px 0 4px;font-size:14px}\n.svn-best input{min-height:44px;padding:8px 12px;border-radius:10px;border:1.5px solid var(--line);background:var(--surface2);color:var(--ink);font:inherit;font-size:16px;letter-spacing:.06em}\n/* In der App: kein Hinweis „zum Homescreen hinzufügen“ */\nhtml.nativ .installcard,html.nativ #appInstall{display:none!important}\n"; document.head.appendChild(s); }catch(e){} })();
//---------------------------------------------------------------------
//
// QR Code Generator for JavaScript
//
// Copyright (c) 2009 Kazuhiko Arase
//
// URL: http://www.d-project.com/
//
// Licensed under the MIT license:
//  http://www.opensource.org/licenses/mit-license.php
//
// The word 'QR Code' is registered trademark of
// DENSO WAVE INCORPORATED
//  http://www.denso-wave.com/qrcode/faqpatent-e.html
//
//---------------------------------------------------------------------

var qrcode = function() {

  //---------------------------------------------------------------------
  // qrcode
  //---------------------------------------------------------------------

  /**
   * qrcode
   * @param typeNumber 1 to 40
   * @param errorCorrectionLevel 'L','M','Q','H'
   */
  var qrcode = function(typeNumber, errorCorrectionLevel) {

    var PAD0 = 0xEC;
    var PAD1 = 0x11;

    var _typeNumber = typeNumber;
    var _errorCorrectionLevel = QRErrorCorrectionLevel[errorCorrectionLevel];
    var _modules = null;
    var _moduleCount = 0;
    var _dataCache = null;
    var _dataList = [];

    var _this = {};

    var makeImpl = function(test, maskPattern) {

      _moduleCount = _typeNumber * 4 + 17;
      _modules = function(moduleCount) {
        var modules = new Array(moduleCount);
        for (var row = 0; row < moduleCount; row += 1) {
          modules[row] = new Array(moduleCount);
          for (var col = 0; col < moduleCount; col += 1) {
            modules[row][col] = null;
          }
        }
        return modules;
      }(_moduleCount);

      setupPositionProbePattern(0, 0);
      setupPositionProbePattern(_moduleCount - 7, 0);
      setupPositionProbePattern(0, _moduleCount - 7);
      setupPositionAdjustPattern();
      setupTimingPattern();
      setupTypeInfo(test, maskPattern);

      if (_typeNumber >= 7) {
        setupTypeNumber(test);
      }

      if (_dataCache == null) {
        _dataCache = createData(_typeNumber, _errorCorrectionLevel, _dataList);
      }

      mapData(_dataCache, maskPattern);
    };

    var setupPositionProbePattern = function(row, col) {

      for (var r = -1; r <= 7; r += 1) {

        if (row + r <= -1 || _moduleCount <= row + r) continue;

        for (var c = -1; c <= 7; c += 1) {

          if (col + c <= -1 || _moduleCount <= col + c) continue;

          if ( (0 <= r && r <= 6 && (c == 0 || c == 6) )
              || (0 <= c && c <= 6 && (r == 0 || r == 6) )
              || (2 <= r && r <= 4 && 2 <= c && c <= 4) ) {
            _modules[row + r][col + c] = true;
          } else {
            _modules[row + r][col + c] = false;
          }
        }
      }
    };

    var getBestMaskPattern = function() {

      var minLostPoint = 0;
      var pattern = 0;

      for (var i = 0; i < 8; i += 1) {

        makeImpl(true, i);

        var lostPoint = QRUtil.getLostPoint(_this);

        if (i == 0 || minLostPoint > lostPoint) {
          minLostPoint = lostPoint;
          pattern = i;
        }
      }

      return pattern;
    };

    var setupTimingPattern = function() {

      for (var r = 8; r < _moduleCount - 8; r += 1) {
        if (_modules[r][6] != null) {
          continue;
        }
        _modules[r][6] = (r % 2 == 0);
      }

      for (var c = 8; c < _moduleCount - 8; c += 1) {
        if (_modules[6][c] != null) {
          continue;
        }
        _modules[6][c] = (c % 2 == 0);
      }
    };

    var setupPositionAdjustPattern = function() {

      var pos = QRUtil.getPatternPosition(_typeNumber);

      for (var i = 0; i < pos.length; i += 1) {

        for (var j = 0; j < pos.length; j += 1) {

          var row = pos[i];
          var col = pos[j];

          if (_modules[row][col] != null) {
            continue;
          }

          for (var r = -2; r <= 2; r += 1) {

            for (var c = -2; c <= 2; c += 1) {

              if (r == -2 || r == 2 || c == -2 || c == 2
                  || (r == 0 && c == 0) ) {
                _modules[row + r][col + c] = true;
              } else {
                _modules[row + r][col + c] = false;
              }
            }
          }
        }
      }
    };

    var setupTypeNumber = function(test) {

      var bits = QRUtil.getBCHTypeNumber(_typeNumber);

      for (var i = 0; i < 18; i += 1) {
        var mod = (!test && ( (bits >> i) & 1) == 1);
        _modules[Math.floor(i / 3)][i % 3 + _moduleCount - 8 - 3] = mod;
      }

      for (var i = 0; i < 18; i += 1) {
        var mod = (!test && ( (bits >> i) & 1) == 1);
        _modules[i % 3 + _moduleCount - 8 - 3][Math.floor(i / 3)] = mod;
      }
    };

    var setupTypeInfo = function(test, maskPattern) {

      var data = (_errorCorrectionLevel << 3) | maskPattern;
      var bits = QRUtil.getBCHTypeInfo(data);

      // vertical
      for (var i = 0; i < 15; i += 1) {

        var mod = (!test && ( (bits >> i) & 1) == 1);

        if (i < 6) {
          _modules[i][8] = mod;
        } else if (i < 8) {
          _modules[i + 1][8] = mod;
        } else {
          _modules[_moduleCount - 15 + i][8] = mod;
        }
      }

      // horizontal
      for (var i = 0; i < 15; i += 1) {

        var mod = (!test && ( (bits >> i) & 1) == 1);

        if (i < 8) {
          _modules[8][_moduleCount - i - 1] = mod;
        } else if (i < 9) {
          _modules[8][15 - i - 1 + 1] = mod;
        } else {
          _modules[8][15 - i - 1] = mod;
        }
      }

      // fixed module
      _modules[_moduleCount - 8][8] = (!test);
    };

    var mapData = function(data, maskPattern) {

      var inc = -1;
      var row = _moduleCount - 1;
      var bitIndex = 7;
      var byteIndex = 0;
      var maskFunc = QRUtil.getMaskFunction(maskPattern);

      for (var col = _moduleCount - 1; col > 0; col -= 2) {

        if (col == 6) col -= 1;

        while (true) {

          for (var c = 0; c < 2; c += 1) {

            if (_modules[row][col - c] == null) {

              var dark = false;

              if (byteIndex < data.length) {
                dark = ( ( (data[byteIndex] >>> bitIndex) & 1) == 1);
              }

              var mask = maskFunc(row, col - c);

              if (mask) {
                dark = !dark;
              }

              _modules[row][col - c] = dark;
              bitIndex -= 1;

              if (bitIndex == -1) {
                byteIndex += 1;
                bitIndex = 7;
              }
            }
          }

          row += inc;

          if (row < 0 || _moduleCount <= row) {
            row -= inc;
            inc = -inc;
            break;
          }
        }
      }
    };

    var createBytes = function(buffer, rsBlocks) {

      var offset = 0;

      var maxDcCount = 0;
      var maxEcCount = 0;

      var dcdata = new Array(rsBlocks.length);
      var ecdata = new Array(rsBlocks.length);

      for (var r = 0; r < rsBlocks.length; r += 1) {

        var dcCount = rsBlocks[r].dataCount;
        var ecCount = rsBlocks[r].totalCount - dcCount;

        maxDcCount = Math.max(maxDcCount, dcCount);
        maxEcCount = Math.max(maxEcCount, ecCount);

        dcdata[r] = new Array(dcCount);

        for (var i = 0; i < dcdata[r].length; i += 1) {
          dcdata[r][i] = 0xff & buffer.getBuffer()[i + offset];
        }
        offset += dcCount;

        var rsPoly = QRUtil.getErrorCorrectPolynomial(ecCount);
        var rawPoly = qrPolynomial(dcdata[r], rsPoly.getLength() - 1);

        var modPoly = rawPoly.mod(rsPoly);
        ecdata[r] = new Array(rsPoly.getLength() - 1);
        for (var i = 0; i < ecdata[r].length; i += 1) {
          var modIndex = i + modPoly.getLength() - ecdata[r].length;
          ecdata[r][i] = (modIndex >= 0)? modPoly.getAt(modIndex) : 0;
        }
      }

      var totalCodeCount = 0;
      for (var i = 0; i < rsBlocks.length; i += 1) {
        totalCodeCount += rsBlocks[i].totalCount;
      }

      var data = new Array(totalCodeCount);
      var index = 0;

      for (var i = 0; i < maxDcCount; i += 1) {
        for (var r = 0; r < rsBlocks.length; r += 1) {
          if (i < dcdata[r].length) {
            data[index] = dcdata[r][i];
            index += 1;
          }
        }
      }

      for (var i = 0; i < maxEcCount; i += 1) {
        for (var r = 0; r < rsBlocks.length; r += 1) {
          if (i < ecdata[r].length) {
            data[index] = ecdata[r][i];
            index += 1;
          }
        }
      }

      return data;
    };

    var createData = function(typeNumber, errorCorrectionLevel, dataList) {

      var rsBlocks = QRRSBlock.getRSBlocks(typeNumber, errorCorrectionLevel);

      var buffer = qrBitBuffer();

      for (var i = 0; i < dataList.length; i += 1) {
        var data = dataList[i];
        buffer.put(data.getMode(), 4);
        buffer.put(data.getLength(), QRUtil.getLengthInBits(data.getMode(), typeNumber) );
        data.write(buffer);
      }

      // calc num max data.
      var totalDataCount = 0;
      for (var i = 0; i < rsBlocks.length; i += 1) {
        totalDataCount += rsBlocks[i].dataCount;
      }

      if (buffer.getLengthInBits() > totalDataCount * 8) {
        throw 'code length overflow. ('
          + buffer.getLengthInBits()
          + '>'
          + totalDataCount * 8
          + ')';
      }

      // end code
      if (buffer.getLengthInBits() + 4 <= totalDataCount * 8) {
        buffer.put(0, 4);
      }

      // padding
      while (buffer.getLengthInBits() % 8 != 0) {
        buffer.putBit(false);
      }

      // padding
      while (true) {

        if (buffer.getLengthInBits() >= totalDataCount * 8) {
          break;
        }
        buffer.put(PAD0, 8);

        if (buffer.getLengthInBits() >= totalDataCount * 8) {
          break;
        }
        buffer.put(PAD1, 8);
      }

      return createBytes(buffer, rsBlocks);
    };

    _this.addData = function(data, mode) {

      mode = mode || 'Byte';

      var newData = null;

      switch(mode) {
      case 'Numeric' :
        newData = qrNumber(data);
        break;
      case 'Alphanumeric' :
        newData = qrAlphaNum(data);
        break;
      case 'Byte' :
        newData = qr8BitByte(data);
        break;
      case 'Kanji' :
        newData = qrKanji(data);
        break;
      default :
        throw 'mode:' + mode;
      }

      _dataList.push(newData);
      _dataCache = null;
    };

    _this.isDark = function(row, col) {
      if (row < 0 || _moduleCount <= row || col < 0 || _moduleCount <= col) {
        throw row + ',' + col;
      }
      return _modules[row][col];
    };

    _this.getModuleCount = function() {
      return _moduleCount;
    };

    _this.make = function() {
      if (_typeNumber < 1) {
        var typeNumber = 1;

        for (; typeNumber < 40; typeNumber++) {
          var rsBlocks = QRRSBlock.getRSBlocks(typeNumber, _errorCorrectionLevel);
          var buffer = qrBitBuffer();

          for (var i = 0; i < _dataList.length; i++) {
            var data = _dataList[i];
            buffer.put(data.getMode(), 4);
            buffer.put(data.getLength(), QRUtil.getLengthInBits(data.getMode(), typeNumber) );
            data.write(buffer);
          }

          var totalDataCount = 0;
          for (var i = 0; i < rsBlocks.length; i++) {
            totalDataCount += rsBlocks[i].dataCount;
          }

          if (buffer.getLengthInBits() <= totalDataCount * 8) {
            break;
          }
        }

        _typeNumber = typeNumber;
      }

      makeImpl(false, getBestMaskPattern() );
    };

    _this.createTableTag = function(cellSize, margin) {

      cellSize = cellSize || 2;
      margin = (typeof margin == 'undefined')? cellSize * 4 : margin;

      var qrHtml = '';

      qrHtml += '<table style="';
      qrHtml += ' border-width: 0px; border-style: none;';
      qrHtml += ' border-collapse: collapse;';
      qrHtml += ' padding: 0px; margin: ' + margin + 'px;';
      qrHtml += '">';
      qrHtml += '<tbody>';

      for (var r = 0; r < _this.getModuleCount(); r += 1) {

        qrHtml += '<tr>';

        for (var c = 0; c < _this.getModuleCount(); c += 1) {
          qrHtml += '<td style="';
          qrHtml += ' border-width: 0px; border-style: none;';
          qrHtml += ' border-collapse: collapse;';
          qrHtml += ' padding: 0px; margin: 0px;';
          qrHtml += ' width: ' + cellSize + 'px;';
          qrHtml += ' height: ' + cellSize + 'px;';
          qrHtml += ' background-color: ';
          qrHtml += _this.isDark(r, c)? '#000000' : '#ffffff';
          qrHtml += ';';
          qrHtml += '"/>';
        }

        qrHtml += '</tr>';
      }

      qrHtml += '</tbody>';
      qrHtml += '</table>';

      return qrHtml;
    };

    _this.createSvgTag = function(cellSize, margin, alt, title) {

      var opts = {};
      if (typeof arguments[0] == 'object') {
        // Called by options.
        opts = arguments[0];
        // overwrite cellSize and margin.
        cellSize = opts.cellSize;
        margin = opts.margin;
        alt = opts.alt;
        title = opts.title;
      }

      cellSize = cellSize || 2;
      margin = (typeof margin == 'undefined')? cellSize * 4 : margin;

      // Compose alt property surrogate
      alt = (typeof alt === 'string') ? {text: alt} : alt || {};
      alt.text = alt.text || null;
      alt.id = (alt.text) ? alt.id || 'qrcode-description' : null;

      // Compose title property surrogate
      title = (typeof title === 'string') ? {text: title} : title || {};
      title.text = title.text || null;
      title.id = (title.text) ? title.id || 'qrcode-title' : null;

      var size = _this.getModuleCount() * cellSize + margin * 2;
      var c, mc, r, mr, qrSvg='', rect;

      rect = 'l' + cellSize + ',0 0,' + cellSize +
        ' -' + cellSize + ',0 0,-' + cellSize + 'z ';

      qrSvg += '<svg version="1.1" xmlns="http://www.w3.org/2000/svg"';
      qrSvg += !opts.scalable ? ' width="' + size + 'px" height="' + size + 'px"' : '';
      qrSvg += ' viewBox="0 0 ' + size + ' ' + size + '" ';
      qrSvg += ' preserveAspectRatio="xMinYMin meet"';
      qrSvg += (title.text || alt.text) ? ' role="img" aria-labelledby="' +
          escapeXml([title.id, alt.id].join(' ').trim() ) + '"' : '';
      qrSvg += '>';
      qrSvg += (title.text) ? '<title id="' + escapeXml(title.id) + '">' +
          escapeXml(title.text) + '</title>' : '';
      qrSvg += (alt.text) ? '<description id="' + escapeXml(alt.id) + '">' +
          escapeXml(alt.text) + '</description>' : '';
      qrSvg += '<rect width="100%" height="100%" fill="white" cx="0" cy="0"/>';
      qrSvg += '<path d="';

      for (r = 0; r < _this.getModuleCount(); r += 1) {
        mr = r * cellSize + margin;
        for (c = 0; c < _this.getModuleCount(); c += 1) {
          if (_this.isDark(r, c) ) {
            mc = c*cellSize+margin;
            qrSvg += 'M' + mc + ',' + mr + rect;
          }
        }
      }

      qrSvg += '" stroke="transparent" fill="black"/>';
      qrSvg += '</svg>';

      return qrSvg;
    };

    _this.createDataURL = function(cellSize, margin) {

      cellSize = cellSize || 2;
      margin = (typeof margin == 'undefined')? cellSize * 4 : margin;

      var size = _this.getModuleCount() * cellSize + margin * 2;
      var min = margin;
      var max = size - margin;

      return createDataURL(size, size, function(x, y) {
        if (min <= x && x < max && min <= y && y < max) {
          var c = Math.floor( (x - min) / cellSize);
          var r = Math.floor( (y - min) / cellSize);
          return _this.isDark(r, c)? 0 : 1;
        } else {
          return 1;
        }
      } );
    };

    _this.createImgTag = function(cellSize, margin, alt) {

      cellSize = cellSize || 2;
      margin = (typeof margin == 'undefined')? cellSize * 4 : margin;

      var size = _this.getModuleCount() * cellSize + margin * 2;

      var img = '';
      img += '<img';
      img += '\u0020src="';
      img += _this.createDataURL(cellSize, margin);
      img += '"';
      img += '\u0020width="';
      img += size;
      img += '"';
      img += '\u0020height="';
      img += size;
      img += '"';
      if (alt) {
        img += '\u0020alt="';
        img += escapeXml(alt);
        img += '"';
      }
      img += '/>';

      return img;
    };

    var escapeXml = function(s) {
      var escaped = '';
      for (var i = 0; i < s.length; i += 1) {
        var c = s.charAt(i);
        switch(c) {
        case '<': escaped += '&lt;'; break;
        case '>': escaped += '&gt;'; break;
        case '&': escaped += '&amp;'; break;
        case '"': escaped += '&quot;'; break;
        default : escaped += c; break;
        }
      }
      return escaped;
    };

    var _createHalfASCII = function(margin) {
      var cellSize = 1;
      margin = (typeof margin == 'undefined')? cellSize * 2 : margin;

      var size = _this.getModuleCount() * cellSize + margin * 2;
      var min = margin;
      var max = size - margin;

      var y, x, r1, r2, p;

      var blocks = {
        '██': '█',
        '█ ': '▀',
        ' █': '▄',
        '  ': ' '
      };

      var blocksLastLineNoMargin = {
        '██': '▀',
        '█ ': '▀',
        ' █': ' ',
        '  ': ' '
      };

      var ascii = '';
      for (y = 0; y < size; y += 2) {
        r1 = Math.floor((y - min) / cellSize);
        r2 = Math.floor((y + 1 - min) / cellSize);
        for (x = 0; x < size; x += 1) {
          p = '█';

          if (min <= x && x < max && min <= y && y < max && _this.isDark(r1, Math.floor((x - min) / cellSize))) {
            p = ' ';
          }

          if (min <= x && x < max && min <= y+1 && y+1 < max && _this.isDark(r2, Math.floor((x - min) / cellSize))) {
            p += ' ';
          }
          else {
            p += '█';
          }

          // Output 2 characters per pixel, to create full square. 1 character per pixels gives only half width of square.
          ascii += (margin < 1 && y+1 >= max) ? blocksLastLineNoMargin[p] : blocks[p];
        }

        ascii += '\n';
      }

      if (size % 2 && margin > 0) {
        return ascii.substring(0, ascii.length - size - 1) + Array(size+1).join('▀');
      }

      return ascii.substring(0, ascii.length-1);
    };

    _this.createASCII = function(cellSize, margin) {
      cellSize = cellSize || 1;

      if (cellSize < 2) {
        return _createHalfASCII(margin);
      }

      cellSize -= 1;
      margin = (typeof margin == 'undefined')? cellSize * 2 : margin;

      var size = _this.getModuleCount() * cellSize + margin * 2;
      var min = margin;
      var max = size - margin;

      var y, x, r, p;

      var white = Array(cellSize+1).join('██');
      var black = Array(cellSize+1).join('  ');

      var ascii = '';
      var line = '';
      for (y = 0; y < size; y += 1) {
        r = Math.floor( (y - min) / cellSize);
        line = '';
        for (x = 0; x < size; x += 1) {
          p = 1;

          if (min <= x && x < max && min <= y && y < max && _this.isDark(r, Math.floor((x - min) / cellSize))) {
            p = 0;
          }

          // Output 2 characters per pixel, to create full square. 1 character per pixels gives only half width of square.
          line += p ? white : black;
        }

        for (r = 0; r < cellSize; r += 1) {
          ascii += line + '\n';
        }
      }

      return ascii.substring(0, ascii.length-1);
    };

    _this.renderTo2dContext = function(context, cellSize) {
      cellSize = cellSize || 2;
      var length = _this.getModuleCount();
      for (var row = 0; row < length; row++) {
        for (var col = 0; col < length; col++) {
          context.fillStyle = _this.isDark(row, col) ? 'black' : 'white';
          context.fillRect(row * cellSize, col * cellSize, cellSize, cellSize);
        }
      }
    }

    return _this;
  };

  //---------------------------------------------------------------------
  // qrcode.stringToBytes
  //---------------------------------------------------------------------

  qrcode.stringToBytesFuncs = {
    'default' : function(s) {
      var bytes = [];
      for (var i = 0; i < s.length; i += 1) {
        var c = s.charCodeAt(i);
        bytes.push(c & 0xff);
      }
      return bytes;
    }
  };

  qrcode.stringToBytes = qrcode.stringToBytesFuncs['default'];

  //---------------------------------------------------------------------
  // qrcode.createStringToBytes
  //---------------------------------------------------------------------

  /**
   * @param unicodeData base64 string of byte array.
   * [16bit Unicode],[16bit Bytes], ...
   * @param numChars
   */
  qrcode.createStringToBytes = function(unicodeData, numChars) {

    // create conversion map.

    var unicodeMap = function() {

      var bin = base64DecodeInputStream(unicodeData);
      var read = function() {
        var b = bin.read();
        if (b == -1) throw 'eof';
        return b;
      };

      var count = 0;
      var unicodeMap = {};
      while (true) {
        var b0 = bin.read();
        if (b0 == -1) break;
        var b1 = read();
        var b2 = read();
        var b3 = read();
        var k = String.fromCharCode( (b0 << 8) | b1);
        var v = (b2 << 8) | b3;
        unicodeMap[k] = v;
        count += 1;
      }
      if (count != numChars) {
        throw count + ' != ' + numChars;
      }

      return unicodeMap;
    }();

    var unknownChar = '?'.charCodeAt(0);

    return function(s) {
      var bytes = [];
      for (var i = 0; i < s.length; i += 1) {
        var c = s.charCodeAt(i);
        if (c < 128) {
          bytes.push(c);
        } else {
          var b = unicodeMap[s.charAt(i)];
          if (typeof b == 'number') {
            if ( (b & 0xff) == b) {
              // 1byte
              bytes.push(b);
            } else {
              // 2bytes
              bytes.push(b >>> 8);
              bytes.push(b & 0xff);
            }
          } else {
            bytes.push(unknownChar);
          }
        }
      }
      return bytes;
    };
  };

  //---------------------------------------------------------------------
  // QRMode
  //---------------------------------------------------------------------

  var QRMode = {
    MODE_NUMBER :    1 << 0,
    MODE_ALPHA_NUM : 1 << 1,
    MODE_8BIT_BYTE : 1 << 2,
    MODE_KANJI :     1 << 3
  };

  //---------------------------------------------------------------------
  // QRErrorCorrectionLevel
  //---------------------------------------------------------------------

  var QRErrorCorrectionLevel = {
    L : 1,
    M : 0,
    Q : 3,
    H : 2
  };

  //---------------------------------------------------------------------
  // QRMaskPattern
  //---------------------------------------------------------------------

  var QRMaskPattern = {
    PATTERN000 : 0,
    PATTERN001 : 1,
    PATTERN010 : 2,
    PATTERN011 : 3,
    PATTERN100 : 4,
    PATTERN101 : 5,
    PATTERN110 : 6,
    PATTERN111 : 7
  };

  //---------------------------------------------------------------------
  // QRUtil
  //---------------------------------------------------------------------

  var QRUtil = function() {

    var PATTERN_POSITION_TABLE = [
      [],
      [6, 18],
      [6, 22],
      [6, 26],
      [6, 30],
      [6, 34],
      [6, 22, 38],
      [6, 24, 42],
      [6, 26, 46],
      [6, 28, 50],
      [6, 30, 54],
      [6, 32, 58],
      [6, 34, 62],
      [6, 26, 46, 66],
      [6, 26, 48, 70],
      [6, 26, 50, 74],
      [6, 30, 54, 78],
      [6, 30, 56, 82],
      [6, 30, 58, 86],
      [6, 34, 62, 90],
      [6, 28, 50, 72, 94],
      [6, 26, 50, 74, 98],
      [6, 30, 54, 78, 102],
      [6, 28, 54, 80, 106],
      [6, 32, 58, 84, 110],
      [6, 30, 58, 86, 114],
      [6, 34, 62, 90, 118],
      [6, 26, 50, 74, 98, 122],
      [6, 30, 54, 78, 102, 126],
      [6, 26, 52, 78, 104, 130],
      [6, 30, 56, 82, 108, 134],
      [6, 34, 60, 86, 112, 138],
      [6, 30, 58, 86, 114, 142],
      [6, 34, 62, 90, 118, 146],
      [6, 30, 54, 78, 102, 126, 150],
      [6, 24, 50, 76, 102, 128, 154],
      [6, 28, 54, 80, 106, 132, 158],
      [6, 32, 58, 84, 110, 136, 162],
      [6, 26, 54, 82, 110, 138, 166],
      [6, 30, 58, 86, 114, 142, 170]
    ];
    var G15 = (1 << 10) | (1 << 8) | (1 << 5) | (1 << 4) | (1 << 2) | (1 << 1) | (1 << 0);
    var G18 = (1 << 12) | (1 << 11) | (1 << 10) | (1 << 9) | (1 << 8) | (1 << 5) | (1 << 2) | (1 << 0);
    var G15_MASK = (1 << 14) | (1 << 12) | (1 << 10) | (1 << 4) | (1 << 1);

    var _this = {};

    var getBCHDigit = function(data) {
      var digit = 0;
      while (data != 0) {
        digit += 1;
        data >>>= 1;
      }
      return digit;
    };

    _this.getBCHTypeInfo = function(data) {
      var d = data << 10;
      while (getBCHDigit(d) - getBCHDigit(G15) >= 0) {
        d ^= (G15 << (getBCHDigit(d) - getBCHDigit(G15) ) );
      }
      return ( (data << 10) | d) ^ G15_MASK;
    };

    _this.getBCHTypeNumber = function(data) {
      var d = data << 12;
      while (getBCHDigit(d) - getBCHDigit(G18) >= 0) {
        d ^= (G18 << (getBCHDigit(d) - getBCHDigit(G18) ) );
      }
      return (data << 12) | d;
    };

    _this.getPatternPosition = function(typeNumber) {
      return PATTERN_POSITION_TABLE[typeNumber - 1];
    };

    _this.getMaskFunction = function(maskPattern) {

      switch (maskPattern) {

      case QRMaskPattern.PATTERN000 :
        return function(i, j) { return (i + j) % 2 == 0; };
      case QRMaskPattern.PATTERN001 :
        return function(i, j) { return i % 2 == 0; };
      case QRMaskPattern.PATTERN010 :
        return function(i, j) { return j % 3 == 0; };
      case QRMaskPattern.PATTERN011 :
        return function(i, j) { return (i + j) % 3 == 0; };
      case QRMaskPattern.PATTERN100 :
        return function(i, j) { return (Math.floor(i / 2) + Math.floor(j / 3) ) % 2 == 0; };
      case QRMaskPattern.PATTERN101 :
        return function(i, j) { return (i * j) % 2 + (i * j) % 3 == 0; };
      case QRMaskPattern.PATTERN110 :
        return function(i, j) { return ( (i * j) % 2 + (i * j) % 3) % 2 == 0; };
      case QRMaskPattern.PATTERN111 :
        return function(i, j) { return ( (i * j) % 3 + (i + j) % 2) % 2 == 0; };

      default :
        throw 'bad maskPattern:' + maskPattern;
      }
    };

    _this.getErrorCorrectPolynomial = function(errorCorrectLength) {
      var a = qrPolynomial([1], 0);
      for (var i = 0; i < errorCorrectLength; i += 1) {
        a = a.multiply(qrPolynomial([1, QRMath.gexp(i)], 0) );
      }
      return a;
    };

    _this.getLengthInBits = function(mode, type) {

      if (1 <= type && type < 10) {

        // 1 - 9

        switch(mode) {
        case QRMode.MODE_NUMBER    : return 10;
        case QRMode.MODE_ALPHA_NUM : return 9;
        case QRMode.MODE_8BIT_BYTE : return 8;
        case QRMode.MODE_KANJI     : return 8;
        default :
          throw 'mode:' + mode;
        }

      } else if (type < 27) {

        // 10 - 26

        switch(mode) {
        case QRMode.MODE_NUMBER    : return 12;
        case QRMode.MODE_ALPHA_NUM : return 11;
        case QRMode.MODE_8BIT_BYTE : return 16;
        case QRMode.MODE_KANJI     : return 10;
        default :
          throw 'mode:' + mode;
        }

      } else if (type < 41) {

        // 27 - 40

        switch(mode) {
        case QRMode.MODE_NUMBER    : return 14;
        case QRMode.MODE_ALPHA_NUM : return 13;
        case QRMode.MODE_8BIT_BYTE : return 16;
        case QRMode.MODE_KANJI     : return 12;
        default :
          throw 'mode:' + mode;
        }

      } else {
        throw 'type:' + type;
      }
    };

    _this.getLostPoint = function(qrcode) {

      var moduleCount = qrcode.getModuleCount();

      var lostPoint = 0;

      // LEVEL1

      for (var row = 0; row < moduleCount; row += 1) {
        for (var col = 0; col < moduleCount; col += 1) {

          var sameCount = 0;
          var dark = qrcode.isDark(row, col);

          for (var r = -1; r <= 1; r += 1) {

            if (row + r < 0 || moduleCount <= row + r) {
              continue;
            }

            for (var c = -1; c <= 1; c += 1) {

              if (col + c < 0 || moduleCount <= col + c) {
                continue;
              }

              if (r == 0 && c == 0) {
                continue;
              }

              if (dark == qrcode.isDark(row + r, col + c) ) {
                sameCount += 1;
              }
            }
          }

          if (sameCount > 5) {
            lostPoint += (3 + sameCount - 5);
          }
        }
      };

      // LEVEL2

      for (var row = 0; row < moduleCount - 1; row += 1) {
        for (var col = 0; col < moduleCount - 1; col += 1) {
          var count = 0;
          if (qrcode.isDark(row, col) ) count += 1;
          if (qrcode.isDark(row + 1, col) ) count += 1;
          if (qrcode.isDark(row, col + 1) ) count += 1;
          if (qrcode.isDark(row + 1, col + 1) ) count += 1;
          if (count == 0 || count == 4) {
            lostPoint += 3;
          }
        }
      }

      // LEVEL3

      for (var row = 0; row < moduleCount; row += 1) {
        for (var col = 0; col < moduleCount - 6; col += 1) {
          if (qrcode.isDark(row, col)
              && !qrcode.isDark(row, col + 1)
              &&  qrcode.isDark(row, col + 2)
              &&  qrcode.isDark(row, col + 3)
              &&  qrcode.isDark(row, col + 4)
              && !qrcode.isDark(row, col + 5)
              &&  qrcode.isDark(row, col + 6) ) {
            lostPoint += 40;
          }
        }
      }

      for (var col = 0; col < moduleCount; col += 1) {
        for (var row = 0; row < moduleCount - 6; row += 1) {
          if (qrcode.isDark(row, col)
              && !qrcode.isDark(row + 1, col)
              &&  qrcode.isDark(row + 2, col)
              &&  qrcode.isDark(row + 3, col)
              &&  qrcode.isDark(row + 4, col)
              && !qrcode.isDark(row + 5, col)
              &&  qrcode.isDark(row + 6, col) ) {
            lostPoint += 40;
          }
        }
      }

      // LEVEL4

      var darkCount = 0;

      for (var col = 0; col < moduleCount; col += 1) {
        for (var row = 0; row < moduleCount; row += 1) {
          if (qrcode.isDark(row, col) ) {
            darkCount += 1;
          }
        }
      }

      var ratio = Math.abs(100 * darkCount / moduleCount / moduleCount - 50) / 5;
      lostPoint += ratio * 10;

      return lostPoint;
    };

    return _this;
  }();

  //---------------------------------------------------------------------
  // QRMath
  //---------------------------------------------------------------------

  var QRMath = function() {

    var EXP_TABLE = new Array(256);
    var LOG_TABLE = new Array(256);

    // initialize tables
    for (var i = 0; i < 8; i += 1) {
      EXP_TABLE[i] = 1 << i;
    }
    for (var i = 8; i < 256; i += 1) {
      EXP_TABLE[i] = EXP_TABLE[i - 4]
        ^ EXP_TABLE[i - 5]
        ^ EXP_TABLE[i - 6]
        ^ EXP_TABLE[i - 8];
    }
    for (var i = 0; i < 255; i += 1) {
      LOG_TABLE[EXP_TABLE[i] ] = i;
    }

    var _this = {};

    _this.glog = function(n) {

      if (n < 1) {
        throw 'glog(' + n + ')';
      }

      return LOG_TABLE[n];
    };

    _this.gexp = function(n) {

      while (n < 0) {
        n += 255;
      }

      while (n >= 256) {
        n -= 255;
      }

      return EXP_TABLE[n];
    };

    return _this;
  }();

  //---------------------------------------------------------------------
  // qrPolynomial
  //---------------------------------------------------------------------

  function qrPolynomial(num, shift) {

    if (typeof num.length == 'undefined') {
      throw num.length + '/' + shift;
    }

    var _num = function() {
      var offset = 0;
      while (offset < num.length && num[offset] == 0) {
        offset += 1;
      }
      var _num = new Array(num.length - offset + shift);
      for (var i = 0; i < num.length - offset; i += 1) {
        _num[i] = num[i + offset];
      }
      return _num;
    }();

    var _this = {};

    _this.getAt = function(index) {
      return _num[index];
    };

    _this.getLength = function() {
      return _num.length;
    };

    _this.multiply = function(e) {

      var num = new Array(_this.getLength() + e.getLength() - 1);

      for (var i = 0; i < _this.getLength(); i += 1) {
        for (var j = 0; j < e.getLength(); j += 1) {
          num[i + j] ^= QRMath.gexp(QRMath.glog(_this.getAt(i) ) + QRMath.glog(e.getAt(j) ) );
        }
      }

      return qrPolynomial(num, 0);
    };

    _this.mod = function(e) {

      if (_this.getLength() - e.getLength() < 0) {
        return _this;
      }

      var ratio = QRMath.glog(_this.getAt(0) ) - QRMath.glog(e.getAt(0) );

      var num = new Array(_this.getLength() );
      for (var i = 0; i < _this.getLength(); i += 1) {
        num[i] = _this.getAt(i);
      }

      for (var i = 0; i < e.getLength(); i += 1) {
        num[i] ^= QRMath.gexp(QRMath.glog(e.getAt(i) ) + ratio);
      }

      // recursive call
      return qrPolynomial(num, 0).mod(e);
    };

    return _this;
  };

  //---------------------------------------------------------------------
  // QRRSBlock
  //---------------------------------------------------------------------

  var QRRSBlock = function() {

    var RS_BLOCK_TABLE = [

      // L
      // M
      // Q
      // H

      // 1
      [1, 26, 19],
      [1, 26, 16],
      [1, 26, 13],
      [1, 26, 9],

      // 2
      [1, 44, 34],
      [1, 44, 28],
      [1, 44, 22],
      [1, 44, 16],

      // 3
      [1, 70, 55],
      [1, 70, 44],
      [2, 35, 17],
      [2, 35, 13],

      // 4
