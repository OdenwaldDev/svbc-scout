  if(L.liga==='VL'){   // die Grundrechnung kennt die Verbandsliga nicht: drei Ligen über uns
    const low=(p.min&&p.teamSp&&p.min/(p.teamSp*90)<0.45)||(!p.min&&p.einsaetze&&p.teamSp&&p.einsaetze/p.teamSp<0.6);
    const v=low?-10:-32; r.f.push([v,low?'Kickt drei Ligen höher (Verbandsliga), dort aber meist draußen. Für garantierte Spielzeit ansprechbar':'Verbandsliga (3 Ligen über uns). Wechsel in die A-Klasse sehr unwahrscheinlich']);
    r.w=Math.max(3,Math.min(97,Math.round(r.w+v))); r.k=Math.round((s.total*0.55+r.w*0.45)*10)/10; r.f.sort((a,b)=>Math.abs(b[0])-Math.abs(a[0])); }
  r.f.forEach(x=>{ if(SVL_VS.test(x[1])&&!/25\/26/.test(x[1]))x[1]+=' (25/26)'; });
  return r; }; }

// Suche: der Ligafilter nutzt die aktuelle Liga (nicht die der Vorsaison)
if(typeof visible==='function'){ const _vL=visible; visible=function(){
  const alt=[]; try{ players.forEach(p=>{ if(p.isJugend)return; const L=svLigaJetzt(p); if(L&&L.jetzt){ alt.push([p,p.liga,p.club]); p.liga=L.liga.split('/').find(l=>activeLigen.has(l))||L.liga; p.club=L.club||p.club; } }); }catch(e){}
  try{ return _vL.apply(this,arguments); } finally{ alt.forEach(([p,l,c])=>{ p.liga=l;p.club=c; }); } }; }

// Startseite: Verein und Liga der laufenden Saison
{ const _rhL=renderHome; renderHome=function(){ const r=_rhL.apply(this,arguments);
  try{ document.querySelectorAll('#homeCrm .rankrow[data-id], #homeWechsel .rankrow[data-id]').forEach(row=>{ const p=players.find(x=>x.id===row.dataset.id); if(!p)return;
    const i=row.querySelector('.rn i'); const alt=p.club+' · '+((typeof LIGA_NAME!=='undefined'&&LIGA_NAME[p.liga])||p.liga);
    if(i&&i.textContent.trim()===alt){ i.textContent=svLigaZeile(p); i.dataset.liga='jetzt'; } }); }catch(e){}
  return r; }; }

// Profil: Kopfzeile mit Liga und Platz der laufenden Saison
{ const _omL=openModal; openModal=function(id){ const r=_omL.apply(this,arguments);
  try{ const p=players.find(x=>x.id===id); const m=document.querySelector('#modal .msub'); if(p&&m&&!p.isJugend){
      const L=svLigaJetzt(p), h=svLigaHinweis(L);
      const platz=L.jetzt?(L.rank!=null?' · Platz '+L.rank+(L.teamCount?'/'+L.teamCount:''):''):(p.rank!=null?' · Platz '+p.rank+'/'+p.teamCount+' in 25/26':'');
      if(m.textContent.startsWith(p.club+' · '))m.textContent=(L.club||p.club)+' · '+L.liga.split('/').map(svLigaName).join(' / ')+(h?' ('+h+')':'')+platz+(p.km!=null?' · '+p.km+' km':''); } }catch(e){}
  return r; }; }

/* =====================================================================
   Sportzentrale Beta 0.15 · Spieler-Abgleich (kleine App in der App)
   Wo die automatische Zuordnung App-Spieler ↔ FuPa-Spieler unsicher ist, entscheidet ein Mensch, einmal und dauerhaft:
     nach links wischen oder „Bestätigen“  = das ist er (gilt immer, hat Vorrang vor der Automatik)
     nach rechts wischen oder „Ignorieren“ = das ist er nicht (das Paar kommt nie wieder)
     bei „kein Treffer“: selbst suchen und „Das ist er“ tippen, oder nach rechts = für FuPa nicht relevant
   Richtung wie beim Wischen in den Scouting-Listen: rechts = weg. Rückgängig ist jederzeit möglich.
   Nur für Personen der sportlichen Planung (can_scout). Die FuPa-Daten bleiben intern.
   ===================================================================== */
const ABG={L:null,modus:'offen',spaeter:[],geaendert:false,undoT:null,fokus:null,suche:{q:'',r:null,t:0},busy:false};
const ABG_ART={unsicher:'Unsicher',kein_treffer:'Kein Treffer',kontrolle:'Zur Kontrolle'};
function abgE(s){ return typeof svEsc==='function'?svEsc(s):String(s==null?'':s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c])); }
function abgSz(s){ return String(s||'').replace(/^20(\d\d)-(\d\d)$/,'$1/$2'); }
function abgLiga(l){ return (typeof impLiga==='function')?impLiga(l):String(l||''); }
function abgKey(k){ return k.app_id+'|'+k.fupa_id; }
async function abgLaden(){ const {data,error}=await SVB.sb.rpc('import_abgleich_liste'); if(error)throw error; ABG.L=data||{karten:[],entschieden:[]}; }
function abgAlle(){ return ((ABG.L&&ABG.L.karten)||[]); }
function abgKarten(){ const K=abgAlle().filter(k=>ABG.modus==='kontrolle'?k.art==='kontrolle':k.art!=='kontrolle');
  // Karte aus dem Profil zuerst, „Später“ ans Ende
  const f=ABG.fokus, sp=ABG.spaeter;
  return K.slice().sort((a,b)=>((f&&b.app_id===f)-(f&&a.app_id===f))||(sp.indexOf(abgKey(a))-sp.indexOf(abgKey(b)))); }
function abgZahl(art){ return abgAlle().filter(k=>art==='kontrolle'?k.art==='kontrolle':k.art!=='kontrolle').length; }

async function svAbgleich(appId){
  if(typeof canScout!=='function'||!canScout())return;
  let el=document.getElementById('abgApp');
  if(!el){ el=document.createElement('div'); el.id='abgApp'; el.className='abg'; el.setAttribute('role','dialog'); el.setAttribute('aria-label','Spieler-Abgleich'); document.body.appendChild(el); }
  el.hidden=false; document.body.classList.add('abg-offen');
  ABG.spaeter=[]; ABG.fokus=appId||null; ABG.modus='offen'; ABG.suche={q:'',r:null,t:0};
  el.innerHTML=`<div class="abg-top"><button class="abg-x" id="abgZu" aria-label="Schließen">✕</button><div><b>Spieler-Abgleich</b><small>App-Spieler und FuPa: stimmt das?</small></div></div><div class="abg-body"><p class="note">Lädt …</p></div>`;
  el.querySelector('#abgZu').onclick=abgZu;
  try{ await abgLaden();
    if(appId&&!abgAlle().some(k=>k.app_id===appId)){ const r=await SVB.sb.rpc('import_abgleich_karte',{p_app:appId}); if(!r.error&&r.data){ ABG.L.karten.unshift(r.data); } }
    if(appId){ const k=abgAlle().find(x=>x.app_id===appId); if(k)ABG.modus=k.art==='kontrolle'?'kontrolle':'offen'; }
    else if(!abgZahl('offen')&&abgZahl('kontrolle'))ABG.modus='kontrolle';
    abgRender();
  }catch(e){ el.querySelector('.abg-body').innerHTML=`<p class="note">Der Abgleich konnte nicht geladen werden. Bitte später noch einmal versuchen.</p>`; }
}
function abgZu(){ const el=document.getElementById('abgApp'); if(el){ el.hidden=true; el.innerHTML=''; } document.body.classList.remove('abg-offen');
  if(ABG.geaendert){ ABG.geaendert=false; try{ if(typeof svKlaLaden==='function')svKlaLaden(); }catch(e){} try{ const P=document.querySelector('#svImport')?.parentElement; if(P&&typeof svImportCard==='function')svImportCard(P); }catch(e){} try{ abgRadarHinweis(); }catch(e){} } }
document.addEventListener('keydown',e=>{ const el=document.getElementById('abgApp'); if(!el||el.hidden)return;
  if(e.target&&/INPUT|TEXTAREA/.test(e.target.tagName))return;
  if(e.key==='Escape')abgZu(); else if(e.key==='ArrowLeft')abgAktion('bestaetigt'); else if(e.key==='ArrowRight')abgAktion('ignoriert'); });

function abgSaisonen(f){ return (f&&f.saisons||[]).map(s=>`<li><b>${abgE(abgSz(s.saison))}</b> ${abgE(s.verein||s.mannschaft||'')}${s.mannschaft&&s.verein&&s.mannschaft!==s.verein?` <i>${abgE(s.mannschaft)}</i>`:''}<span>${abgE(abgLiga(s.liga))}${s.einsaetze!=null?' · '+s.einsaetze+' Einsätze':''}${s.tore!=null?', '+s.tore+' Tore':''}</span></li>`).join(''); }
function abgKarteHtml(k){ const a=k.app||{}, f=k.fupa;
  const appTeil=`<section class="abg-s"><small>In der App</small><b>${abgE(a.name||k.app_id)}</b><span>${abgE(a.verein||'')}${a.liga?' · '+abgE(a.liga):''}</span>${a.verein_vorher&&a.verein_vorher!==a.verein?`<span class="abg-m">vorher ${abgE(a.verein_vorher)}</span>`:''}
      <div class="abg-bd">${a.eigene?'<em class="eig">Eigener Spieler</em>':''}${a.beobachtet?'<em>Beobachtet</em>':''}</div></section>`;
  const fupaTeil=k.art==='kein_treffer'?`<section class="abg-s abg-such"><small>Bei FuPa suchen</small>
      <input type="search" id="abgQ" placeholder="Name eintippen" autocomplete="off" value="${abgE(ABG.suche.q||(a.name||'').split(' ').slice(-1)[0])}" aria-label="FuPa-Spieler suchen">
      <div id="abgTreffer" class="abg-tr"></div></section>`
    :`<section class="abg-s"><small>Bei FuPa</small><b>${abgE(f&&f.name||'unbekannt')}</b><ul class="abg-sa">${abgSaisonen(f)}</ul>${f&&f.url?`<a href="${abgE(f.url)}" target="_blank" rel="noopener noreferrer">Seite bei FuPa</a>`:''}</section>`;
  return `<div class="abg-k" id="abgK" data-art="${abgE(k.art)}"><div class="abg-lab l">✓ Bestätigen</div><div class="abg-lab r">${k.art==='kein_treffer'?'Nicht relevant':'✕ Ignorieren'}</div>
    <div class="abg-kh"><span class="abg-tag ${abgE(k.art)}">${abgE(ABG_ART[k.art]||k.art)}</span>${(k.belege||[]).length?`<span class="abg-bl">${k.belege.map(b=>`<i>${abgE(b)}</i>`).join('')}</span>`:''}</div>
    ${k.grund?`<p class="abg-g">${abgE(k.grund)}</p>`:''}
    <div class="abg-cmp">${appTeil}<div class="abg-vs" aria-hidden="true">↔</div>${fupaTeil}</div></div>`; }

function abgRender(){ const el=document.getElementById('abgApp'); if(!el||el.hidden)return; const B=el.querySelector('.abg-body'); if(!B)return;
  const K=abgKarten(), k=K[0], no=abgZahl('offen'), nk=abgZahl('kontrolle'), ne=((ABG.L&&ABG.L.entschieden)||[]).length;
  const seg=`<div class="seg4 sm abg-seg"><button type="button" data-m="offen" class="${ABG.modus==='offen'?'on':''}">Offen <b>${no}</b></button><button type="button" data-m="kontrolle" class="${ABG.modus==='kontrolle'?'on':''}">Kontrolle <b>${nk}</b></button><button type="button" data-m="entschieden" class="${ABG.modus==='entschieden'?'on':''}">Entschieden <b>${ne}</b></button></div>`;
  let h;
  if(ABG.modus==='entschieden'){
    const L=(ABG.L&&ABG.L.entschieden)||[];
    h=L.length?`<ul class="abg-ent">${L.map((x,i)=>`<li><div><b>${abgE(x.app_name||x.app_id)}</b><span>${x.entscheid==='bestaetigt'?'✓ bestätigt: '+abgE(x.fupa_name||('FuPa '+x.fupa_id)):x.fupa_id>0?'✕ nicht '+abgE(x.fupa_name||('FuPa '+x.fupa_id)):'✕ für FuPa nicht relevant'}</span><small>${x.am?new Date(x.am).toLocaleDateString('de-DE'):''}${x.von?' · '+abgE(x.von):''}</small></div><button class="btn sm ghost" data-undo="${i}">Zurücknehmen</button></li>`).join('')}</ul>`
      :'<p class="note abg-leer">Noch nichts entschieden.</p>';
  }else if(!k){
    h=`<div class="abg-fertig"><div class="abg-ok">✓</div><b>${ABG.modus==='kontrolle'?'Alles kontrolliert.':'Alles abgeglichen.'}</b><p class="note">${ABG.modus==='kontrolle'?'Jede automatische Zuordnung eurer Spieler ist bestätigt oder entschieden.':'Nach jedem stündlichen Abgleich kommen neue unsichere Fälle von selbst hierher.'}</p>${ABG.modus==='offen'&&nk?`<button class="btn sm" data-m="kontrolle">Automatische Zuordnungen kontrollieren (${nk})</button>`:''}</div>`;
  }else{
    const rest=K.length-1;
    h=`<div class="abg-stapel">${rest>0?'<div class="abg-hinter"></div>':''}${abgKarteHtml(k)}</div>
      <div class="abg-knoepfe"><button class="btn ghost abg-nein" id="abgNein">${k.art==='kein_treffer'?'Nicht relevant':'✕ Ignorieren'}</button><button class="btn ghost sm" id="abgSp">Später</button>${k.art==='kein_treffer'?'':'<button class="btn abg-ja" id="abgJa">✓ Bestätigen</button>'}</div>
      <p class="abg-tipp">${k.art==='kein_treffer'?'Nach rechts wischen blendet ihn für FuPa aus.':'Nach links wischen: bestätigen · nach rechts: ignorieren'} · noch ${rest} danach</p>`;
  }
  B.innerHTML=seg+`<p class="abg-msg" id="abgMsg" role="status"></p>`+h;
  B.querySelectorAll('[data-m]').forEach(b=>b.onclick=()=>{ ABG.modus=b.dataset.m; ABG.suche={q:'',r:null,t:0}; abgRender(); });
  B.querySelectorAll('[data-undo]').forEach(b=>b.onclick=()=>abgZuruecknehmen((ABG.L.entschieden||[])[+b.dataset.undo]));
  const ja=B.querySelector('#abgJa'), nein=B.querySelector('#abgNein'), sp=B.querySelector('#abgSp');
  if(ja)ja.onclick=()=>abgAktion('bestaetigt'); if(nein)nein.onclick=()=>abgAktion('ignoriert');
  if(sp)sp.onclick=()=>{ const kk=abgKarten()[0]; if(!kk)return; ABG.spaeter=ABG.spaeter.filter(x=>x!==abgKey(kk)).concat(abgKey(kk)); if(ABG.fokus===kk.app_id)ABG.fokus=null; ABG.suche={q:'',r:null,t:0}; abgRender(); };
  const kEl=B.querySelector('#abgK'); if(kEl)abgWischen(kEl,k);
  const q=B.querySelector('#abgQ'); if(q){ q.oninput=()=>abgSuchen(q.value); abgSuchen(q.value,true); }
}

// Suche bei „kein Treffer“
async function abgSuchen(v,sofort){ ABG.suche.q=v; const t=++ABG.suche.t;
  if(!sofort)await new Promise(r=>setTimeout(r,280)); if(t!==ABG.suche.t)return;
  const T=document.getElementById('abgTreffer'); if(!T)return;
  if(String(v||'').trim().length<3){ T.innerHTML='<p class="abg-m">Mindestens 3 Buchstaben.</p>'; return; }
  T.innerHTML='<p class="abg-m">Sucht …</p>';
  let L=[]; try{ const r=await SVB.sb.rpc('import_fupa_suche',{p_q:v}); L=r.error?[]:(r.data||[]); }catch(e){}
  if(t!==ABG.suche.t||!document.getElementById('abgTreffer'))return;
  const byId=new Map((typeof players!=='undefined'?players:[]).map(p=>[p.id,p]));
  T.innerHTML=L.length?L.map((f,i)=>`<div class="abg-ti"><div><b>${abgE(f.name)}</b><ul class="abg-sa">${abgSaisonen({saisons:(f.saisons||[]).slice(0,2)})}</ul>${f.app_id?`<span class="abg-m">schon verbunden mit ${abgE((byId.get(f.app_id)||{}).name||f.app_id)}</span>`:''}</div><button class="btn sm" data-f="${i}">Das ist er</button></div>`).join('')
    :'<p class="abg-m">Kein FuPa-Spieler mit diesem Namen in den freigegebenen Ligen.</p>';
  T.querySelectorAll('[data-f]').forEach(b=>b.onclick=()=>abgAktion('bestaetigt',L[+b.dataset.f]));
}

// Wischen: links = bestätigen, rechts = ignorieren
function abgWischen(el,k){ let S=null;
  const darfL=k.art!=='kein_treffer';
  el.addEventListener('pointerdown',e=>{ if(e.button>0||e.target.closest('input,button,a,select,textarea'))return; S={x:e.clientX,y:e.clientY,dx:0,achse:null,t:performance.now(),id:e.pointerId}; });
  el.addEventListener('pointermove',e=>{ if(!S||e.pointerId!==S.id)return; const dx=e.clientX-S.x, dy=e.clientY-S.y;
    if(!S.achse){ if(Math.abs(dx)<8&&Math.abs(dy)<8)return; S.achse=Math.abs(dx)>Math.abs(dy)*1.2?'x':'y'; if(S.achse==='x'){ try{ el.setPointerCapture(e.pointerId); }catch(x){} el.classList.add('zieht'); } }
    if(S.achse!=='x')return; e.preventDefault();
    let d=dx; if(d<0&&!darfL)d*=0.2; S.dx=d;
    el.style.transform=`translate3d(${d}px,0,0) rotate(${d/24}deg)`;
    el.querySelector('.abg-lab.l').style.opacity=Math.min(1,Math.max(0,-d/110)); el.querySelector('.abg-lab.r').style.opacity=Math.min(1,Math.max(0,d/110)); });
  const ende=e=>{ if(!S)return; const s=S; S=null; el.classList.remove('zieht'); if(s.achse!=='x')return;
    const W=el.offsetWidth||320, v=Math.abs(s.dx)/Math.max(1,performance.now()-s.t), weit=Math.abs(s.dx)>W*0.3||(v>0.6&&Math.abs(s.dx)>60);
    if(weit&&s.dx<0&&darfL)return abgAktion('bestaetigt');
    if(weit&&s.dx>0)return abgAktion('ignoriert');
    el.style.transition='transform .25s ease'; el.style.transform=''; el.querySelectorAll('.abg-lab').forEach(x=>x.style.opacity=0); setTimeout(()=>{ el.style.transition=''; },260); };
  el.addEventListener('pointerup',ende); el.addEventListener('pointercancel',ende);
}

async function abgAktion(entscheid,gewaehlt){ if(ABG.busy||ABG.modus==='entschieden')return; const k=abgKarten()[0]; if(!k)return;
  if(entscheid==='bestaetigt'&&k.art==='kein_treffer'&&!gewaehlt)return;
  const fupaId=gewaehlt?gewaehlt.id:k.fupa_id, el=document.getElementById('abgK');
  ABG.busy=true;
  if(el){ el.style.transition='transform .28s ease, opacity .28s ease'; el.style.transform=`translate3d(${entscheid==='bestaetigt'?'-':''}130%,0,0) rotate(${entscheid==='bestaetigt'?-12:12}deg)`; el.style.opacity='0'; }
  try{
    const {data,error}=await SVB.sb.rpc('import_abgleich_entscheiden',{p_app:k.app_id,p_fupa:fupaId,p_entscheid:entscheid});
    if(error||!data||!data.ok)throw error||new Error('fehlgeschlagen');
    ABG.geaendert=true;
    const L=ABG.L; L.karten=L.karten.filter(x=>!(x.app_id===k.app_id&&(entscheid==='bestaetigt'||fupaId===0||x.fupa_id===fupaId)));
    const fn=gewaehlt?gewaehlt.name:(k.fupa&&k.fupa.name);
    L.entschieden=[{app_id:k.app_id,fupa_id:fupaId,entscheid,am:new Date().toISOString(),app_name:k.app&&k.app.name,fupa_name:fn,von:null}].concat((L.entschieden||[]).filter(x=>!(x.app_id===k.app_id&&x.fupa_id===fupaId)));
    if(ABG.fokus===k.app_id)ABG.fokus=null; ABG.suche={q:'',r:null,t:0};
    ABG.busy=false; abgRender();
    abgToast(entscheid==='bestaetigt'?`✓ ${k.app&&k.app.name||''} ist ${fn||'der FuPa-Spieler'}. Seine Werte sind schon da.`:fupaId===0?`${k.app&&k.app.name||''} ist für FuPa ausgeblendet.`:`${k.app&&k.app.name||''} ist nicht ${fn||'dieser FuPa-Spieler'}. Das Paar kommt nicht wieder.`,{app_id:k.app_id,fupa_id:fupaId});
  }catch(e){ ABG.busy=false; abgRender(); const m=document.getElementById('abgMsg'); if(m)m.textContent='Das hat nicht geklappt. Bitte noch einmal versuchen.'; }
}
function abgToast(text,x){ let t=document.getElementById('abgToast'); const app=document.getElementById('abgApp'); if(!app)return;
  if(!t){ t=document.createElement('div'); t.id='abgToast'; t.className='abg-toast'; app.appendChild(t); }
  t.innerHTML=`<span>${abgE(text)}</span>${x?'<button type="button" id="abgUndo">Rückgängig</button>':''}`; t.hidden=false;
  const u=t.querySelector('#abgUndo'); if(u)u.onclick=()=>{ t.hidden=true; abgZuruecknehmen(x); };
  clearTimeout(ABG.undoT); ABG.undoT=setTimeout(()=>{ t.hidden=true; },7000); }
async function abgZuruecknehmen(x){ if(!x||ABG.busy)return; ABG.busy=true; const m=document.getElementById('abgMsg'); if(m)m.textContent='Nimmt zurück …';
  try{ const {error}=await SVB.sb.rpc('import_abgleich_zuruecknehmen',{p_app:x.app_id,p_fupa:x.fupa_id}); if(error)throw error;
    ABG.geaendert=true; await abgLaden(); ABG.busy=false; abgRender(); const m2=document.getElementById('abgMsg'); if(m2)m2.textContent='Zurückgenommen. Die Automatik rechnet diesen Spieler neu.'; }
  catch(e){ ABG.busy=false; const m2=document.getElementById('abgMsg'); if(m2)m2.textContent='Zurücknehmen hat nicht geklappt. Bitte noch einmal versuchen.'; } }

/* ---------- Einstiege ---------- */
// Radar: Hinweis, wenn Spieler auf den Abgleich warten. Die Zahl wird einmal nach der Anmeldung und nach dem Abgleich geholt,
// das Radar selbst fragt nichts ab (kein Umbau der Liste beim Wischen).
ABG.n=0;
async function abgZahlLaden(){ if(typeof canScout!=='function'||!canScout())return;
  try{ const r=await SVB.sb.from('import_pruefung').select('app_id',{count:'exact',head:true}).neq('art','kontrolle'); ABG.n=r.error?0:(r.count||0); }catch(e){ ABG.n=0; }
  abgRadarZeigen(); }
function abgRadarZeigen(){ const P=document.getElementById('panel-radar'); if(!P)return; const alt=P.querySelector('#abgRadar');
  if(!ABG.n){ if(alt)alt.remove(); return; }
  const txt=`${ABG.n} Spieler warten auf den Abgleich mit FuPa`; if(alt&&alt.dataset.n===String(ABG.n)&&alt.isConnected)return;
  if(alt)alt.remove();
  const el=document.createElement('div'); el.className='card abg-rad'; el.id='abgRadar'; el.dataset.n=String(ABG.n);
  el.innerHTML=`<div><b>${txt}</b><span>Einmal kurz wischen: bestätigen oder ignorieren. Dann stimmen Profil, MScore und Bestenliste.</span></div><button class="btn sm">Abgleichen</button>`;
  el.querySelector('button').onclick=()=>svAbgleich();
  const rd=P.querySelector('.rd4'); if(rd)rd.after(el); else P.prepend(el); }
function abgRadarHinweis(){ return abgZahlLaden(); }
if(typeof rdRender==='function'){ const _rdA=rdRender; rdRender=function(){ const r=_rdA.apply(this,arguments); if(ABG.n)try{ abgRadarZeigen(); }catch(e){} return r; }; }
{ let t=0; const iv=setInterval(()=>{ if(++t>240)return clearInterval(iv); if(typeof SVU!=='undefined'&&SVU&&SVU.role&&typeof _remoteDone!=='undefined'&&_remoteDone){ clearInterval(iv); abgZahlLaden().catch(()=>{}); } },500); }
// Profil: Zuordnung prüfen oder selbst zuordnen
if(typeof klaProfilHtml==='function'){ const _kp=klaProfilHtml; klaProfilHtml=function(p){ let h=_kp.apply(this,arguments);
  if(!p||typeof canScout!=='function'||!canScout()||p.isJugend)return h;
  const btn=`<button type="button" class="btn sm ghost abg-pf" data-abg="${abgE(p.id)}">${h?'Zuordnung prüfen':'FuPa-Spieler zuordnen'}</button>`;
  if(h)return h.replace(/<\/div>\s*$/,btn+'</div>');
  return (p.own&&typeof KLAW!=='undefined'&&KLAW.geladen)?`<div class="kla-pf"><div class="m94-h">Zahlen von FuPa</div><p class="note small">Noch kein FuPa-Spieler zugeordnet.</p>${btn}</div>`:h; }; }
document.addEventListener('click',e=>{ const b=e.target.closest&&e.target.closest('[data-abg]'); if(!b)return; e.preventDefault(); e.stopPropagation(); svAbgleich(b.dataset.abg); },true);

/* =====================================================================
   Sportzentrale Beta 0.16 · Live-Aktualisierung (Realtime)
   Der Server sendet auf dem privaten Kanal kla:dataset das Ereignis dataset_updated, sobald sich der App-Datenbestand
   oder die importierten FuPa-Werte ändern. Die Meldung enthält nur Version/Cursor/Zeitpunkt, keine Spielerdaten.
   Die App lädt dann mit dem angemeldeten Client auf dem normalen, geschützten Weg nach (gleiche Zugriffsregeln wie beim Start):
     1) dataset, wenn sich die Version geändert hat (Spieler werden an Ort und Stelle aktualisiert, eigene Ergänzungen bleiben)
     2) die importierten FuPa-Werte (Profil, MScore, Bestenliste, Radar, Gegner-Vorschau, Abgleich-Zähler)
     3) Zwischenspeicher leeren und neu zeichnen: Liga, Ligaabstand und Wechselbegründung werden frisch gerechnet
   Beim (Wieder-)Verbinden wird einmal nachgeladen, damit verpasste Meldungen nicht fehlen. Kein Schlüssel im Browser.
   connectKlaPush ist unverändert aus push-client.mjs (KLA-Paket) übernommen, nur ohne „export“, weil die App kein Modul ist.
   ===================================================================== */
/** Use the existing logged-in Supabase browser client; never a service key.
 * reloadDataset must use the app's existing authorized loader and update its store.
 */
function connectKlaPush(supabase, reloadDataset, onError = console.error) {
 let busy=false,again=false,closed=false;
 async function refresh(){
  if(closed)return;
  if(busy){again=true;return;}
  busy=true;
  try{do{again=false;await reloadDataset();}while(again&&!closed);}
  catch(e){onError(e);}finally{busy=false;}
 }
 const channel=supabase.channel('kla:dataset',{config:{private:true}})
  .on('broadcast',{event:'dataset_updated'},refresh)
  .subscribe(status=>{if(status==='SUBSCRIBED')refresh();});
 // Reconnect subscription refresh catches events missed while offline.
 return ()=>{closed=true;supabase.removeChannel(channel);};
}

const SVP={n:0,letzte:null,version:null,stand:null,werte:null,cursor:null,checker:null,fehler:null,stop:null,lauf:null,nochmal:false,geprueftT:0};
// Neue Fassung des Datenbestands in den laufenden Store übernehmen (an Ort und Stelle, ohne Seite neu zu laden)
function svDatasetAnwenden(ds){
  const B=ds&&ds.body; if(!B||!Array.isArray(B.players))return false;
  Object.keys(B).forEach(k=>{ if(k!=='players'&&k!=='jugend')DATA[k]=B[k]; });
  DATA.players=B.players; if(Array.isArray(B.jugend))DATA.jugend=B.jugend;
  const byId=new Map(players.map(p=>[p.id,p]));
  B.players.forEach(n=>{ const p=byId.get(n.id);
    if(p){ Object.keys(p).forEach(k=>{ if(k==='__vs')delete p[k]; }); Object.assign(p,n,{isJugend:false});
      if(!('cur' in n))delete p.cur; if(!('historical_classification_before_fix' in n))delete p.historical_classification_before_fix; }
    else players.push(Object.assign({},typeof V6DEF!=='undefined'?V6DEF:{},n,{isJugend:false})); });
  window.__SVBC_DATA=DATA; window.__SVBC_DSVER=ds.version; SVP.version=ds.version;
  if(typeof svLigaNormAlle==='function')svLigaNormAlle();
  return true; }
// Stand vom Server: nur Versionsangaben und Zähler (kla_stand), daraus folgt, was neu geladen werden muss
async function svStandHolen(){
  const r=await SVB.sb.rpc('kla_stand'); if(!r.error&&r.data)return r.data;
  const v=await SVB.sb.from('dataset').select('version,updated_at').eq('id',1).single(); if(v.error)throw v.error;   // Rückfall ohne kla_stand
  return {dataset:v.data.version+'|'+v.data.updated_at}; }
// Die vorhandene Ladefunktion: Datenbestand + importierte Werte + neu zeichnen, jeweils nur wenn sich etwas geändert hat
async function svDatenNeuLadenKern(){
  if(!SVB||!SVB.sb||SVB.offline)return;
  const st=await svStandHolen(); let neu=false, kla=false;
  if(SVP.stand==null&&st.dataset&&st.dataset.split('|')[0]===window.__SVBC_DSVER)SVP.stand=st.dataset;   // Startstand = was die App gerade geladen hat
  if(st.dataset&&st.dataset!==SVP.stand){
    const {data,error}=await SVB.sb.from('dataset').select('version,body').eq('id',1).single(); if(error)throw error;
    neu=svDatasetAnwenden(data); if(neu)SVP.stand=st.dataset; }
  const wk=[st.werte||'',st.entscheid||'',st.cursor==null?'':st.cursor].join('#');
  if(SVP.werte==null){ SVP.werte=wk; }   // erster Lauf: nur den Ausgangsstand merken (die App hat gerade frisch geladen), nichts neu zeichnen
  else if(wk!==SVP.werte){ SVP.werte=wk; kla=true; }
  if(st.cursor!=null&&SVP.cursor!=null&&st.cursor!==SVP.cursor)kla=true; SVP.cursor=st.cursor;
  if(kla&&typeof svKlaLaden==='function')await svKlaLaden();
  if(kla){ try{ if(typeof KLAG!=='undefined')KLAG.v=undefined; if(typeof KLAR!=='undefined')KLAR.v=null; if(typeof abgZahlLaden==='function')abgZahlLaden(); }catch(e){} }
  SVP.checker=st.checker||null; SVP.n++; SVP.letzte=new Date().toISOString(); SVP.fehler=null;
  if(!neu&&!kla)return;
  try{ if(typeof sv4Bump==='function')sv4Bump(); if(typeof SV94!=='undefined'){ SV94.cache.clear(); SV94.dist=null; } }catch(e){}
  try{ if(typeof renderAll==='function')renderAll(); }catch(e){ console.warn('Neu zeichnen',e); }
  try{ const M=document.getElementById('modal'), O=document.getElementById('overlay'); const pid=M&&M.dataset&&M.dataset.pid;
    if(O&&O.classList.contains('open')&&pid&&typeof openModal==='function'){
      if(svModalBearbeitet(M)){ try{ kToast('Neue Daten da. Nach dem Speichern das Profil neu öffnen.'); }catch(e){} }   // nie in eine laufende Eingabe hineinzeichnen
      else openModal(pid); } }catch(e){}
  if(neu){ try{ kToast('Daten aktualisiert'); }catch(e){} }
}
// Nie zwei Läufe gleichzeitig: kommt währenddessen ein Anstoß, läuft danach genau einer nach
async function svDatenNeuLaden(){
  if(SVP.lauf){ SVP.nochmal=true; return SVP.lauf; }
  SVP.lauf=(async()=>{ try{ do{ SVP.nochmal=false; await svDatenNeuLadenKern(); }while(SVP.nochmal); } finally{ SVP.lauf=null; SVP.geprueftT=Date.now(); } })();
  return SVP.lauf; }
// Unabhängig von der Live-Verbindung prüfen: beim Zurückholen in den Vordergrund, wieder online, und alle 5 Minuten solange sichtbar
function svFrischPruefen(){ if(!SVP.stop||Date.now()-SVP.geprueftT<15000)return; svDatenNeuLaden().catch(e=>{ SVP.fehler=String(e&&e.message||e); }); }
document.addEventListener('visibilitychange',()=>{ if(document.visibilityState==='visible')svFrischPruefen(); });
window.addEventListener('online',svFrischPruefen);
window.addEventListener('focus',svFrischPruefen);
setInterval(()=>{ if(document.visibilityState==='visible')svFrischPruefen(); },5*60*1000);
function svLiveStatus(){ let ch=null; try{ ch=(SVB.sb.getChannels()||[]).find(c=>/kla:dataset$/.test(c.topic)); }catch(e){}
  return {verbunden:!!(ch&&ch.state==='joined'), letzte:SVP.letzte, checker:SVP.checker, fehler:SVP.fehler}; }
// Mein Konto: Live-Stand und Server-Checker
if(typeof svAccount==='function'){ const _acc=svAccount; svAccount=function(){ const r=_acc.apply(this,arguments);
  try{ const M=document.getElementById('modal'); const n=[...M.querySelectorAll('.note')].find(x=>/Datenstand/.test(x.textContent)); if(n&&!M.querySelector('.sv-live')){
    const L=svLiveStatus(), c=L.checker, z=t=>t?new Date(t).toLocaleTimeString('de-DE',{hour:'2-digit',minute:'2-digit'}):'';
    n.insertAdjacentHTML('afterend',`<p class="note small sv-live">${L.verbunden?'🟢 Live-Verbindung aktiv':'⚪ Live-Verbindung gerade getrennt, die App prüft trotzdem beim Öffnen und alle 5 Minuten'}${L.letzte?' · zuletzt abgeglichen '+z(L.letzte)+' Uhr':''}${c?' · Server-Checker '+(c.ok?'✓ alles aktuell':'⚠ '+Object.keys(c.probleme||{}).length+' Problem(e)')+(c.geprueft?' ('+z(c.geprueft)+' Uhr)':''):''}</p>`); } }catch(e){}
  return r; }; }
async function svPushStart(){
  if(SVP.stop||!SVB||!SVB.sb||SVB.offline)return;
  try{ const {data:{session}}=await SVB.sb.auth.getSession(); if(!session)return; if(SVB.sb.realtime&&SVB.sb.realtime.setAuth)await SVB.sb.realtime.setAuth(session.access_token); }catch(e){}
  SVP.version=window.__SVBC_DSVER||null;
  try{ await svDatenNeuLaden(); }catch(e){ SVP.fehler=String(e&&e.message||e); }   // Ausgangsstand merken, unabhängig von der Live-Verbindung
  SVP.stop=connectKlaPush(SVB.sb, svDatenNeuLaden, e=>{ SVP.fehler=String(e&&e.message||e); console.warn('Live-Aktualisierung',e); });
}
// Profil merkt sich, wer offen ist (damit ein offenes Profil nach der Aktualisierung neu gezeichnet wird)
{ const _omP=openModal; openModal=function(id){ const r=_omP.apply(this,arguments); try{ const M=document.getElementById('modal'); if(M){ M.dataset.pid=id; M.dataset.fw='1'; setTimeout(()=>{ try{ M.__fw=svFormWerte(M); }catch(e){} },0); } }catch(e){} return r; }; }
// Wer im offenen Profil gerade etwas eintippt oder verstellt hat, wird nicht durch eine Aktualisierung unterbrochen
function svFormWerte(M){ return [...M.querySelectorAll('input,textarea,select')].map(el=>el.type==='checkbox'||el.type==='radio'?el.checked:el.value).join('\u0001'); }
function svModalBearbeitet(M){ try{ const a=document.activeElement; if(a&&M.contains(a)&&/^(INPUT|TEXTAREA|SELECT)$/.test(a.tagName))return true;
  return M.dataset.fw!=null&&svFormWerte(M)!==M.__fw; }catch(e){ return false; } }
// Start, sobald Anmeldung und Daten da sind
{ let t=0; const iv=setInterval(()=>{ if(++t>240)return clearInterval(iv); if(typeof SVU!=='undefined'&&SVU&&SVU.role&&typeof _remoteDone!=='undefined'&&_remoteDone&&typeof players!=='undefined'&&players.length){ clearInterval(iv); svPushStart().catch(()=>{}); } },500); }
window.addEventListener('pagehide',()=>{ try{ if(SVP.stop)SVP.stop(); }catch(e){} });

/* =====================================================================
   Sportzentrale Beta 0.18 · Mannschaft neu geordnet
   - Reiter: Spieler · Training · Spiele · Verletzungen · Abwesenheiten · Materialdienst · Abstimmungen · Massenpflege
   - Spieler: eine zentrale Liste aller internen Spieler, mehr Filter, eigene Ansichten (Spalten, Filter, Sortierung) je Nutzer
   - Training: Einheiten nur Trainings, Anwesenheit nur Da oder Fehlt (zu spät steht in der Notiz), Statistik ohne Erfassung
   - Spiele: Spiele und Statistik der laufenden Saison
   - Verletzungen ohne fremde Knöpfe, Abwesenheiten und Materialdienst als eigene Reiter
   - Massenpflege: alle internen Spieler je Bereich auf einer Seite bearbeiten und gesammelt speichern
   - Spielerprofile interner Spieler sind nur noch Leseansicht, „Spielerdaten pflegen“ springt in die Massenpflege
   ===================================================================== */
const MN={area:'fuss',focus:null,draft:{},open:new Set(),q:'',team:'alle',leer:false,loadTry:{},views:[],viewsLoaded:false,viewsBusy:false,
  sp:null,fOpen:false,gsort:'ein',gdir:1};
const mnPlaner=()=>['admin','vorstand','planer'].includes(svRole());
const MN_TEAM={'1':'1. Mannschaft','2':'2. Mannschaft',A:'A-Jugend',U:'Umfeld'};
const MN_TK={'1':'I','2':'II',A:'A',U:'U',B:'B'};
const MN_TEAMS=['1','2','A','U'];
if(typeof SV4_TEAM!=='undefined')SV4_TEAM.U='Umfeld';
Object.assign(SV_TRAINER_FIELDS,{gw:1}); SV_FIELD.gw='Gewicht';

/* ---------- Wer ist intern, welche Mannschaft? ---------- */
function mnTeam(p){ try{ return sv4Team(p)||null; }catch(e){ return p&&p.own?(p.kader===2||/ II$/.test(p.club||'')?'2':'1'):null; } }
function mnTeam2(p){ try{ return typeof sv60Team2==='function'&&typeof sv4S==='function'?sv60Team2(p,sv4S())||null:null; }catch(e){ return null; } }
function mnIsIntern(p){ if(!p||p.isJugend)return false; if(p.own&&!p.verzicht)return true; return MN_TEAMS.includes(mnTeam(p)); }
function mnIntern(){ const pi=p=>{ const i=TR_POS.indexOf(p.pos); return i<0?99:i; };
  return players.filter(mnIsIntern).sort((a,b)=>(pi(a)-pi(b))||a.name.localeCompare(b.name,'de')); }
function mnTeamOrd(t){ const i=MN_TEAMS.indexOf(t); return i<0?9:i; }
// Umfeld (Spielerpass, spielt nicht regelmäßig) zählt nicht zum Trainingskader, lässt sich aber im Training dazunehmen
{ const _sq18=trSquad; trSquad=function(){ const L=_sq18.apply(this,arguments); try{ return L.filter(p=>mnTeam(p)!=='U'); }catch(e){ return L; } }; }
function mnApplyGw(){ players.forEach(p=>{ const C=CRM[p.id], g=C?+C.gw:NaN; if(!('_gw0' in p))p._gw0=p.gewicht??null; p.gewicht=g>=40&&g<=160?g:p._gw0; }); }
{ const _ca18=crmApply; crmApply=function(){ const r=_ca18.apply(this,arguments); try{ mnApplyGw(); }catch(e){} return r; }; }
function mnLoadOnce(key,fn,after){ if(MN.loadTry[key])return; MN.loadTry[key]=1; Promise.resolve().then(fn).then(()=>{ try{ after&&after(); }catch(e){} }).catch(()=>{}); }
function mnRerender(v){ return ()=>{ if(svCurTab()==='training'&&(!v||TR.view===v))trRender(); }; }
const mnMiss=t=>`<i class="miss50">${t||'fehlt'}</i>`;

/* ---------- Navigation ---------- */
SV4_HUB.mannschaft.tabs=[['training:players','Spieler'],['training:sessions','Training'],['training:games','Spiele'],['training:injuries','Verletzungen'],
  ['training:urlaub','Abwesenheiten'],['training:material','Materialdienst'],['kabine:abst','Abstimmungen'],['training:pflege','Massenpflege']];
{ const _sub18=sv4Sub; sv4Sub=function(tab){ const k=_sub18.apply(this,arguments); return k==='training:gstat'?'training:games':k; }; }
Object.assign(SV_PAGES,{training:['Mannschaft','Spieler, Training, Spiele, Verletzungen, Abwesenheiten und Spielerdaten der laufenden Saison']});
const MN_VIEWS={};
{ const _tr18=trRender; trRender=function(){
  const v=typeof TR!=='undefined'?TR.view:null;
  if(!MN_VIEWS[v]){ const r=_tr18.apply(this,arguments); mnAfterRender(v); return r; }
  const h=trViewPlayers; trViewPlayers=MN_VIEWS[v]; TR.view='players';
  try{ _tr18.apply(this,arguments); }finally{ trViewPlayers=h; TR.view=v; }
  mnAfterRender(v);
}; }
function mnAfterRender(v){ const P=document.getElementById('panel-training'); if(!P)return; P.dataset.mn=v||''; if(MN_VIEWS[v])P.dataset.v50=v;
  try{ if(svCurTab()==='training')sv4HubBar('training'); }catch(e){} }
function mnGo(area,pid){
  const p=pid?trP(pid):null;
  if(area)MN.area=area; else if(p){ const g=MN_AREAS.find(a=>a.can()&&a.leer&&a.leer(p)); if(g)MN.area=g.k; }
  MN.focus=pid||null; MN.q=''; MN.team='alle'; MN.leer=false; if(pid&&MN.area==='skills')MN.open.add(pid);
  try{ closeOverlay(); }catch(e){} sv4Go('training:pflege');
}

/* ---------- Info-Kästen ---------- */
Object.assign(SV50_INFO,{
  'training:players':{w:'Alle internen Spieler in einer Liste: 1. und 2. Mannschaft, A-Jugend und Umfeld.',f:'Filtern, sortieren und die Spalten zeigen, die du gerade brauchst.',
    h:'Statt fester Ansichten legst du dir eigene an: Spalten, Filter und Sortierung werden für dich gespeichert und stehen auf jedem Gerät bereit.',
    s:'Oben eine Ansicht wählen, über „Filter“ und „Spalten“ anpassen und als eigene Ansicht speichern. Auf einen Namen tippen öffnet das Profil.',
    b:['Vor dem Spieltag: Filter „verfügbar“, sortiert nach Beteiligung.','Kontaktliste: Spalten Handy und E-Mail.']},
  'training:gstat':{w:'Die Auswertung der Spiele dieser Saison: Bilanz, Form, Einsätze, Minuten, Tore und Vorlagen.',f:'Sehen, wer trägt und wer kaum Spielzeit bekommt.',
    h:'Nur Auswertung, erfasst wird unter „Spiele“.',s:'Auf eine Spalte tippen zum Sortieren, auf einen Namen für das Profil.',b:[]},
  'training:urlaub':{w:'Wer wann nicht kann: Urlaub, Arbeit, Uni, Familie.',f:'Für jedes Training im Zeitraum ist der Spieler automatisch abgemeldet und wird nicht erinnert.',
    h:'Spieler tragen es selbst über ihren Kabinen-Link ein, das Trainerteam kann es hier für sie tun.',s:'„Für einen Spieler eintragen“ oder einen Eintrag löschen.',b:[]},
  'training:material':{w:'Wer ist mit Bällen, Leibchen und Hütchen dran?',f:'Ein Team ist für einen Zeitraum zuständig, standardmäßig vier Wochen.',
    h:'Die Eingeteilten sehen es in der Kabine und bekommen zum Start und an Trainingstagen eine Nachricht.',s:'Team einteilen oder die nächsten Teams vorschlagen lassen.',b:[]},
  'training:pflege':{w:'Alle Spielerdaten der internen Spieler an einem Ort.',f:'Einen Bereich wählen, alle Spieler untereinander bearbeiten und gesammelt speichern.',
    h:'Spielerdaten werden nur hier geändert. Die Profile zeigen sie an, „Spielerdaten pflegen“ im Profil springt hierher.',
    s:'Oben den Bereich wählen. Geänderte Zeilen sind markiert, unten „Speichern“ übernimmt alles auf einmal für das ganze Team.',
    b:['„Nur Lücken“ zeigt, wer in diesem Bereich noch nichts hat.']}});
if(SV50_INFO['kabine:abst']){ SV50_INFO['kabine:abst'].w='Wer kommt zum Training oder Spiel? Die Abstimmungen per Link und die Automatik.';
  SV50_INFO['kabine:abst'].b=['Dienstag und Donnerstag wird automatisch abgestimmt, der Link geht am Vortag raus.','Urlaub und Materialdienst haben jetzt eigene Reiter.']; }
if(SV50_INFO['training:home'])Object.assign(SV50_INFO['training:home'],{s:'In der Tabelle auf eine Spalte tippen zum Sortieren, auf einen Namen für das Profil. Erfasst wird unter „Einheiten“.'});
if(SV50_INFO['training:injuries'])SV50_INFO['training:injuries'].h='Verletzungen betreffen die Mannschaft von heute. Oben stehen nur Aktionen rund um Verletzungen.';
if(SV50_INFO['training:sessions'])SV50_INFO['training:sessions'].b=['„Gutes Training, Tim und Ben fehlten wegen Arbeit, Max kam zu spät.“','Anwesenheit ist Da oder Fehlt. Wer zu spät kam, ist da und bekommt die Notiz „zu spät“.'];

/* =====================================================================
   Training
   ===================================================================== */
{ const _vs18=trViewSessions; trViewSessions=function(B){
  const all=TR.st.sessions; TR.st.sessions=all.filter(s=>s.t==='training');
  try{ return _vs18.apply(this,arguments); }finally{ TR.st.sessions=all; } }; }
{ const _vh18=trViewHome; trViewHome=function(B){
  const r=_vh18.apply(this,arguments);
  try{ B.querySelectorAll(':scope > .card').forEach(c=>{ const h=((c.querySelector('h3')||{}).textContent||'').trim();
      if(c.classList.contains('rt4')||c.classList.contains('trhero')||/^(Bewerten|Rückfragen zur Startelf|Lazarett)/.test(h))c.remove(); });
    B.querySelectorAll('.tra-q,.trtoday [data-edit-s]').forEach(x=>x.remove()); }catch(e){ console.warn('Statistik 0.18',e); }
  return r; }; }

/* =====================================================================
   Spiele: Spiele | Statistik, nur laufende Saison
   ===================================================================== */
function mnGSeg(B,v){
  B.insertAdjacentHTML('afterbegin',`<div class="seg50 mn-gseg" role="tablist"><button type="button" class="${v==='games'?'on':''}" data-segg="games">Spiele</button><button type="button" class="${v==='gstat'?'on':''}" data-segg="gstat">Statistik</button></div>`);
  B.querySelectorAll('[data-segg]').forEach(b=>b.onclick=()=>{ TR.view=b.dataset.segg; trRender(); });
}
{ const _vg18=trViewGames; trViewGames=function(B){
  if(typeof TM4!=='undefined')TM4.gs=null;
  const r=_vg18.apply(this,arguments);
  try{ if(B.querySelector('.mn-gseg'))return r;
    B.querySelectorAll('.tm4s').forEach(x=>x.remove());
    B.querySelectorAll(':scope > .card').forEach(c=>{ if(c.querySelector('.fgtab')||/Lade Spielberichte/.test(c.textContent)||/^Saison .* · 1\. Mannschaft/.test(((c.querySelector('h3')||{}).textContent||'').trim()))c.remove(); });
    const gm=B.querySelector('.gm50 .vrat-h .btnrow');
    if(gm&&canTraining()&&typeof fbRun==='function'&&!gm.querySelector('[data-fb18]')){ gm.insertAdjacentHTML('beforeend',`<button type="button" class="btn ghost sm" data-fb18>${SVI('refresh')} Spielberichte abrufen</button>`);
      const b=gm.querySelector('[data-fb18]'); b.onclick=async()=>{ try{ await fbRun(b); }catch(e){ kToast('⚠️ '+e.message); } trRender(); }; }
    if(gm&&canTraining()&&typeof tm4Rate==='function'&&!gm.querySelector('[data-rt18]')){ gm.insertAdjacentHTML('beforeend',`<button type="button" class="btn ghost sm" data-rt18>${SVI('star')} Spieler bewerten</button>`); gm.querySelector('[data-rt18]').onclick=()=>tm4Rate(); }
    mnGSeg(B,'games');
  }catch(e){ console.warn('Spiele 0.18',e); }
  return r; }; }
function mnGames(){ const st=sv50Start(), t=trToday(); return TR.st.sessions.filter(s=>s.t==='spiel'&&s.d>=st&&s.d<=t).sort((a,b)=>a.d.localeCompare(b.d)); }
const MN_GCOLS=[['name','Spieler'],['ein','Einsätze'],['s11','Startelf'],['einw','Einw.'],['min','Minuten'],['tore','Tore'],['vor','Vorl.'],['sc','Scorer'],['mps','Min./Scorer'],['note','Ø Note'],['quote','Kader']];
function mnViewGStat(B){
  const G=mnGames(), R=G.filter(s=>s.tw!=null&&s.tg!=null), n=G.length;
  const res=s=>s.tw>s.tg?'w':s.tw===s.tg?'d':'l';
  const w=R.filter(s=>res(s)==='w').length, d=R.filter(s=>res(s)==='d').length, l=R.filter(s=>res(s)==='l').length;
  const tf=R.reduce((a,s)=>a+s.tw,0), ta=R.reduce((a,s)=>a+s.tg,0), pts=w*3+d, zn=R.filter(s=>s.tg===0).length;
  const split=h=>{ const L=R.filter(s=>s.h===h); return L.length?`${L.filter(s=>res(s)==='w').length}-${L.filter(s=>res(s)==='d').length}-${L.filter(s=>res(s)==='l').length} · ${L.reduce((a,s)=>a+s.tw,0)}:${L.reduce((a,s)=>a+s.tg,0)}`:'–'; };
  const P=new Map(), get=pid=>{ if(!P.has(pid))P.set(pid,{pid,ein:0,s11:0,einw:0,min:0,minK:0,tore:0,vor:0,nS:0,nN:0,kader:0}); return P.get(pid); };
  G.forEach(s=>(s.a||[]).forEach(a=>{ const x=get(a[0]); if(a[1]==='weg')return; x.kader++;
    if(a[1]==='da'||a[1]==='spaet'){ x.ein++; if(a[1]==='da')x.s11++; else x.einw++; if(a[11]!=null){ x.min+=a[11]; x.minK++; } }
    x.tore+=a[6]||0; x.vor+=a[7]||0; if(a[8]!=null&&a[9]!=='default'){ x.nS+=a[8]; x.nN++; } }));
  const rows=[...P.values()].filter(x=>trP(x.pid)&&(x.kader||x.tore||x.vor)).map(x=>Object.assign(x,{p:trP(x.pid),sc:x.tore+x.vor,note:x.nN?x.nS/x.nN:null,
    mps:x.tore+x.vor&&x.minK?x.min/(x.tore+x.vor):null,quote:n?x.kader/n:null}));
  const k=MN.gsort, dir=MN.gdir, val=(x)=>k==='name'?x.p.name:k==='note'?(x.note==null?9:-x.note):k==='mps'?(x.mps==null?1e9:x.mps):-(x[k]||0);
  rows.sort((a,b)=>{ const va=val(a), vb=val(b); if(va!==vb)return (va<vb?-1:1)*dir; return b.ein-a.ein||a.p.name.localeCompare(b.p.name,'de'); });
  const top=(key,lbl)=>{ const L=rows.filter(x=>x[key]>0).sort((a,b)=>b[key]-a[key]).slice(0,3); return `<div class="mn-top"><span>${lbl}</span>${L.length?L.map(x=>`<p data-svp="${svEsc(x.pid)}"><b>${svEsc(x.p.name)}</b><em>${key==='min'?x.min.toLocaleString('de-DE'):x[key]}</em></p>`).join(''):'<p class="note small">noch niemand</p>'}</div>`; };
  const form=R.slice(-5).map(s=>`<i class="res ${res(s)}" title="${TRC.fmt(s.d)} ${s.h===false?'@':'vs'} ${svEsc(s.g||'?')} ${s.tw}:${s.tg}">${res(s)==='w'?'S':res(s)==='d'?'U':'N'}</i>`).join('');
  B.innerHTML=`<div class="tiles trtiles mn-gt">
      <div class="tile"><div class="v">${n}</div><div class="l">Spiele</div><div class="s">${R.length<n?`${n-R.length} ohne Ergebnis`:'seit '+TRC.fmt(sv50Start())}</div></div>
      <div class="tile"><div class="v">${w}-${d}-${l}</div><div class="l">Siege · Remis · Niederlagen</div><div class="s">${pts} Punkte${R.length?' · Ø '+(pts/R.length).toFixed(2).replace('.',','):''}</div></div>
      <div class="tile"><div class="v">${tf}:${ta}</div><div class="l">Tore</div><div class="s">${R.length?`Ø ${(tf/R.length).toFixed(1).replace('.',',')} : ${(ta/R.length).toFixed(1).replace('.',',')} · ${zn}× zu null`:'–'}</div></div>
      <div class="tile"><div class="v mn-form">${form||'–'}</div><div class="l">Form (letzte 5)</div><div class="s">Heim ${split(true)} · Ausw. ${split(false)}</div></div></div>
    ${rows.length?`<div class="mn-tops">${top('tore','Tore')}${top('vor','Vorlagen')}${top('min','Minuten')}${top('s11','Startelf')}</div>`:''}
    <div class="card"><h3 class="trh">${SVI('users')} Einsätze der Saison <small>${rows.length} Spieler</small></h3>
      ${rows.length?`<div class="trtw"><table class="trtab t50 mn-gtab"><thead><tr>${MN_GCOLS.map(([c,t])=>`<th${c==='name'?' class="nm50"':''}><button data-gs18="${c}" class="${k===c?'on':''}">${t}${k===c?(dir>0?' ▼':' ▲'):''}</button></th>`).join('')}</tr></thead><tbody>
      ${rows.map(x=>`<tr data-svp="${svEsc(x.pid)}"><td class="nm50"><b>${svEsc(x.p.name)}</b> <small>${svEsc(x.p.pos||'')}</small></td><td><b>${x.ein}</b></td><td>${x.s11}</td><td>${x.einw}</td>
        <td>${x.minK?x.min.toLocaleString('de-DE')+(x.minK<x.ein?' <small title="Nicht für jedes Spiel sind Minuten erfasst">~</small>':''):'–'}</td><td>${x.tore||'–'}</td><td>${x.vor||'–'}</td><td>${x.sc||'–'}</td>
        <td>${x.mps!=null?Math.round(x.mps):'–'}</td><td>${x.note!=null?`<b class="note50 n${Math.round(x.note)}">${x.note.toFixed(1).replace('.',',')}</b>`:'–'}</td><td>${x.quote!=null?Math.round(x.quote*100)+' %':'–'}</td></tr>`).join('')}</tbody></table></div>`
        :'<p class="note">Noch keine Spiele in dieser Saison erfasst. Unter „Spiele“ die FuPa-Datei übernehmen oder ein Spiel eintragen.</p>'}
      <div class="note">Nur Spiele der laufenden Saison ab ${TRC.fmt(sv50Start())}${sv50Start().slice(2,4)}. Einsätze = Startelf und Einwechslungen. „Kader“ = in wie vielen Spielen er im Aufgebot war. Minuten und Noten zählen, wo sie erfasst sind.</div></div>`;
  mnFbCard(B);
  B.querySelectorAll('[data-gs18]').forEach(b=>b.onclick=e=>{ e.stopPropagation(); const c=b.dataset.gs18; if(MN.gsort===c)MN.gdir*=-1; else { MN.gsort=c; MN.gdir=1; } mnViewGStat(B); });
  B.querySelectorAll('[data-svp]').forEach(x=>x.onclick=()=>openModal(x.dataset.svp));
  mnGSeg(B,'gstat');
}
// Aus den Spielberichten: Startelf, Einwechslungen, Kader, zugeschaut, nicht da je Spieler (nur Auswertung)
function mnFbCard(B){
  if(typeof fbSpielStatus!=='function'||typeof FB==='undefined')return;
  if(!FB.loaded){ mnLoadOnce('fb',()=>fbLoad(),mnRerender('gstat')); return; }
  const S=fbSpielStatus(), squad=trSquad(), rows=squad.map(p=>Object.assign({p},S.P.get(p.id)||{pid:p.id,da:0,spaet:0,bank:0,zuschauer:0,weg:0,gr:{}}));
  S.P.forEach((v,pid)=>{ if(!squad.some(p=>p.id===pid)&&trP(pid))rows.push(Object.assign({p:trP(pid)},v)); });
  rows.sort((a,b)=>(b.da+b.spaet)-(a.da+a.spaet)||b.da-a.da||b.bank-a.bank||a.p.name.localeCompare(b.p.name,'de'));
  const L=rows.filter(r=>r.da+r.spaet+r.bank+r.zuschauer+r.weg>0); if(!S.spiele&&!L.length)return;
  const n=Math.max(1,S.spiele), bar=r=>`<div class="fgbar">${FG_ST.map(([k],i)=>r[k]?`<i class="b${i+1}" style="width:${r[k]/n*100}%"></i>`:'').join('')}</div>`;
  const c=document.createElement('div'); c.className='card mn-fb';
  c.innerHTML=`<h3 class="trh">${SVI('ball')} Spiele ${fbSeasonLabel()} · Status je Spieler</h3>
    <div class="note" style="margin-top:6px">${S.spiele} Pflichtspiele (inkl. Pokal) · ${S.erfasst} davon in der App erfasst. Startelf, Einwechslungen und Kader aus den Spielberichten, zugeschaut und nicht da aus der Erfassung.</div>
    <div class="trtw"><table class="trtab fgtab"><thead><tr><th>Spieler</th>${FG_ST.map(([k,t,cl])=>`<th class="${cl}">${t}</th>`).join('')}<th></th></tr></thead><tbody>
    ${L.map(r=>`<tr data-svp="${svEsc(r.p.id)}"><td><b>${svEsc(r.p.name)}</b></td>${FG_ST.map(([k,,cl])=>`<td class="${r[k]?cl:''}">${r[k]||'–'}${k==='weg'&&r.weg?`<span class="fggr">${Object.entries(r.gr).map(([g,x])=>svEsc(TRC.REASONS[g]||g)+(x>1?' '+x+'×':'')).join(', ')}</span>`:''}</td>`).join('')}<td>${bar(r)}</td></tr>`).join('')}</tbody></table></div>`;
  B.appendChild(c);
}
MN_VIEWS.gstat=mnViewGStat;

/* =====================================================================
   Abstimmungen: Urlaub und Materialdienst haben eigene Reiter
   ===================================================================== */
{ const _vp18=kbViewPolls; kbViewPolls=function(B){ const r=_vp18.apply(this,arguments); try{ B.querySelectorAll('.k91').forEach(x=>x.remove()); }catch(e){} return r; }; }
{ const _l18=sv91Load; sv91Load=async function(){ const r=await _l18.apply(this,arguments);
  try{ if(SV91.loaded&&svCurTab()==='training'&&(TR.view==='urlaub'||TR.view==='material'))setTimeout(()=>trRender(),0); }catch(e){} return r; }; }
function mnViewUrlaub(B){
  if(!SV91.loaded){ B.innerHTML='<div class="card"><div class="empty">Lade Abwesenheiten …</div></div>'; mnLoadOnce('u91',()=>sv91Load(),mnRerender('urlaub')); return; }
  const t=trToday(), heute=SV91.abw.filter(a=>a.von<=t&&t<=a.bis), bald=SV91.abw.filter(a=>a.von>t&&a.von<=sv91Add(t,14)), alt=SV91.abw.filter(a=>a.bis<t).slice(-12).reverse();
  const box=document.createElement('div'); box.className='mn91';
  box.innerHTML=`<div class="tiles trtiles"><div class="tile"><div class="v ${heute.length?'warn':''}">${heute.length}</div><div class="l">Heute abwesend</div><div class="s">${heute.length?svEsc(heute.slice(0,3).map(a=>sv91Vor(trName(a.player_id))).join(', '))+(heute.length>3?' …':''):'alle an Bord'}</div></div>
      <div class="tile"><div class="v">${bald.length}</div><div class="l">Nächste 14 Tage</div><div class="s">${bald.length?svEsc(bald.slice(0,3).map(a=>sv91Vor(trName(a.player_id))+' ab '+TRC.fmt(a.von)).join(', ')):'nichts geplant'}</div></div></div>
    ${sv91AbwHtml()}
    ${alt.length?`<details class="card md91-alt"><summary>Zuletzt (${alt.length})</summary>${alt.map(a=>`<div class="ab91-r"><div><b>${svEsc(trName(a.player_id))}</b><small>${sv91Tag(a.von)} bis ${sv91Tag(a.bis)} · ${svEsc(SV91_GR[a.grund]||a.grund)}${a.notiz?' · '+svEsc(a.notiz):''}</small></div></div>`).join('')}</details>`:''}`;
  B.innerHTML=''; B.appendChild(box); sv91Wire(box);
}
function mnViewMaterial(B){
  if(!SV91.loaded){ B.innerHTML='<div class="card"><div class="empty">Lade Materialdienst …</div></div>'; mnLoadOnce('m91',()=>sv91Load(),mnRerender('material')); return; }
  const C=sv91Zaehler(), sq=trSquad().map(p=>({p,n:C.get(p.id)||0})).sort((a,b)=>a.n-b.n||a.p.name.localeCompare(b.p.name,'de'));
  const box=document.createElement('div'); box.className='mn91';
  box.innerHTML=`${sv91MdHtml()}
    <div class="card"><h3 class="trh">${SVI('users')} Wer war wie oft dran? <small>seit ${TRC.fmt(sv91Add(trToday(),-120))}</small></h3>
      <div class="mn-md">${sq.map(x=>`<span class="${x.n?'':'nie'}"><b>${svEsc(x.p.name)}</b><em>${x.n}×</em></span>`).join('')}</div>
      <p class="note small">Wer am seltensten dran war, steht vorne. „Nächste Teams vorschlagen“ nimmt genau diese Reihenfolge, Verletzte und Abwesende sind ausgelassen.</p></div>`;
  B.innerHTML=''; B.appendChild(box); sv91Wire(box);
}
MN_VIEWS.urlaub=mnViewUrlaub; MN_VIEWS.material=mnViewMaterial;

/* =====================================================================
   Spieler: zentrale Liste mit eigenen Ansichten
   ===================================================================== */
if(SV50_COLS.team)SV50_COLS.team={t:'Mannschaft',v:p=>mnTeamOrd(mnTeam(p))*10+mnTeamOrd(mnTeam2(p)),
  h:p=>{ const t=mnTeam(p), t2=mnTeam2(p); return `<b>${MN_TK[t]||'–'}</b>${t2?` <small class="sek90" title="Sekundärmannschaft">auch ${MN_TK[t2]||t2}</small>`:''}`; }};
Object.assign(SV50_COLS,{
  geb:{t:'Geburtsdatum',v:p=>p.geb||'9999',h:p=>p.geb?TRC.fmt(p.geb)+String(p.geb).slice(2,4):mnMiss('?')},
  wf:{t:'Schw. Fuß',v:p=>-(+crmOf(p).wf||0),h:p=>{ const n=+crmOf(p).wf||0; return n?`<span class="mn-st">${'★'.repeat(n)}<i>${'★'.repeat(5-n)}</i></span>`:'–'; }},
  groesse:{t:'Größe',v:p=>p.groesse||999,h:p=>p.groesse?p.groesse+' cm':mnMiss('?')},
  gewicht:{t:'Gewicht',v:p=>p.gewicht||999,h:p=>p.gewicht?p.gewicht+' kg':mnMiss('?')},
  rolle:{t:'Rolle',v:p=>{ const b=sbOf(p); return b.rol&&SB_ROLE[b.rol]?SB_ROLE[b.rol].t:'~'; },h:p=>{ const b=sbOf(p); return b.rol&&SB_ROLE[b.rol]?svEsc(SB_ROLE[b.rol].t):'–'; }},
  skills:{t:'Skills',v:p=>-sbOf(p).sk.length,h:p=>{ const L=sbOf(p).sk; return L.length?`<span title="${svEsc(L.map(x=>SB_SK[x.k].t+(x.plus?'+':'')).join(', '))}">${L.length} · ${svEsc(L.slice(0,2).map(x=>SB_SK[x.k].t+(x.plus?'+':'')).join(', '))}${L.length>2?' …':''}</span>`:'–'; }},
  charakter:{t:'Charakter',v:p=>{ const c=Object.values(sbOf(p).ch).filter(Boolean); return c.length?-c.reduce((a,b)=>a+b,0)/c.length:1; },
    h:p=>{ const c=Object.values(sbOf(p).ch).filter(Boolean); return c.length?`Ø ${(c.reduce((a,b)=>a+b,0)/c.length).toFixed(1).replace('.',',')}`:'–'; }}
});
const MN_COLGRP=[['Spielerdaten',['pos','pos2','team','alter','geb','fuss','wf','groesse','gewicht']],['Training',['bet','r28','note','last','status']],['Spiele',['ein','min','tore']],
  ['Bewertung',['mscore','eye','rolle','skills','charakter','basis','treue']],['Planung',['zuk']],['Kontakt',['tel','mail','luecken']]];
const MN_STD={id:'std',name:'Standard',cols:['pos','team','alter','fuss','bet','note','ein','min','tore','status'],f:{},sort:null,dir:1,group:true};
function mnColOk(c){ return !!SV50_COLS[c]; }
function mnViewDef(id){ return id==='std'?MN_STD:MN.views.find(v=>v.id===id)||MN_STD; }
function mnSpInit(){ if(MN.sp)return; let id='std'; try{ id=localStorage.getItem('mnView')||'std'; }catch(e){}
  if(id!=='std'&&!MN.viewsLoaded)MN.wantVid=id;
  const v=mnViewDef(id); MN.sp={vid:v.id,cols:v.cols.filter(mnColOk),f:Object.assign({},v.f),sort:v.sort,dir:v.dir||1,group:v.group!==false,q:''}; }
function mnSpUse(id){ const v=mnViewDef(id); MN.sp={vid:v.id,cols:v.cols.filter(mnColOk),f:Object.assign({},v.f),sort:v.sort,dir:v.dir||1,group:v.group!==false,q:MN.sp?MN.sp.q:''}; try{ localStorage.setItem('mnView',v.id); }catch(e){} }
const mnJs=o=>JSON.stringify(o,(k,v)=>v&&typeof v==='object'&&!Array.isArray(v)?Object.keys(v).sort().reduce((a,x)=>(a[x]=v[x],a),{}):v);
function mnSpDirty(){ const v=mnViewDef(MN.sp.vid), S=MN.sp; return mnJs([v.cols.filter(mnColOk),v.f||{},v.sort||null,v.dir||1,v.group!==false])!==mnJs([S.cols,S.f,S.sort||null,S.dir,S.group]); }
async function mnViewsLoad(){ if(MN.viewsBusy)return; MN.viewsBusy=true;
  try{ const {data,error}=await SVB.sb.rpc('me_ansichten'); if(error)throw error; MN.views=Array.isArray(data)?data:[]; }catch(e){ console.warn('Ansichten',e); MN.views=[]; }
  MN.viewsLoaded=true; MN.viewsBusy=false;
  const w=MN.wantVid; MN.wantVid=null;
  if(MN.sp&&w&&MN.sp.vid==='std'&&!mnSpDirty()&&MN.views.some(v=>v.id===w))mnSpUse(w);
  else if(MN.sp&&MN.sp.vid!=='std'&&!MN.views.some(v=>v.id===MN.sp.vid))mnSpUse('std'); }
async function mnViewsSave(list){ const {data,error}=await SVB.sb.rpc('me_ansichten_set',{p:list}); if(error)throw new Error(error.message); MN.views=data||[]; }
const MN_F={
  team:[['','Alle'],['1','1. Mannschaft'],['2','2. Mannschaft'],['A','A-Jugend'],['U','Umfeld']],
  fuss:[['','Alle'],['Rechts','Rechts'],['Links','Links'],['Beidfüßig','Beidfüßig'],['?','unbekannt']],
  alter:[['','Alle'],['u21','unter 21'],['u23','unter 23'],['23','23 bis 29'],['30','ab 30'],['?','unbekannt']],
  status:[['','Alle'],['fit','verfügbar'],['verletzt','verletzt'],['weg','heute abwesend']],
  eye:[['','Alle'],['hat','mit Eye-Test'],['fehlt','ohne Eye-Test']]};
function mnFilterRow(p,f){
  const t=mnTeam(p), t2=mnTeam2(p);
  if(f.team&&!(t===f.team||(f.t2&&t2===f.team)))return false;
  if(f.pos&&f.pos.length&&!f.pos.includes(p.pos)&&!(f.t2pos&&(p.pos2||[]).some(x=>f.pos.includes(x))))return false;
  if(f.fuss&&(f.fuss==='?'?!!p.fuss:p.fuss!==f.fuss))return false;
  if(f.alter){ const a=p.alter; if(f.alter==='?'){ if(a!=null)return false; } else if(a==null)return false; else if(f.alter==='u21'&&a>=21)return false; else if(f.alter==='u23'&&a>=23)return false; else if(f.alter==='23'&&(a<23||a>29))return false; else if(f.alter==='30'&&a<30)return false; }
  if(f.status){ const inj=trInjury(p.id), abw=typeof sv91Abw==='function'&&SV91.loaded?sv91Abw(p.id,trToday()):null;
    if(f.status==='fit'&&(inj||abw))return false; if(f.status==='verletzt'&&!inj)return false; if(f.status==='weg'&&!abw)return false; }
  if(f.eye){ let e=null; try{ e=sv4EyeVal(p.id,p.pos); }catch(x){} if(f.eye==='hat'&&!e)return false; if(f.eye==='fehlt'&&e)return false; }
  return true;
}
function mnFCount(f){ return ['team','fuss','alter','status','eye'].filter(k=>f[k]).length+(f.pos&&f.pos.length?1:0); }
function mnViewPlayers(B){
  mnSpInit();
  if(!MN.viewsLoaded)mnLoadOnce('views',()=>mnViewsLoad(),mnRerender('players'));
  if(typeof kxLoad==='function'&&!KX.loaded&&typeof kxOk==='function'&&kxOk())mnLoadOnce('kx',()=>kxLoad(),mnRerender('players'));
  if(typeof SV4!=='undefined'&&!SV4.loaded&&typeof sv4Can==='function'&&sv4Can())mnLoadOnce('sv4',()=>sv4Load(),mnRerender('players'));
  if(typeof SV91!=='undefined'&&!SV91.loaded&&canTraining())mnLoadOnce('sv91p',()=>sv91Load(),mnRerender('players'));
  try{ mnApplyGw(); }catch(e){}
  const S=MN.sp, f=S.f, cols=S.cols.length?S.cols:MN_STD.cols, q=TRC.N(S.q||'');
  const qs=q&&typeof suFind==='function'?new Set(suFind(S.q,{limit:1e5,noScore:true,scope:mnIsIntern}).list.map(x=>x.p.id)):null;
  let rows=mnIntern().filter(p=>(!q||(qs?qs.has(p.id):TRC.N(p.name).includes(q)))&&mnFilterRow(p,f)).map(p=>({p,t:mnTeam(p)||'-',s:sv50Stat(p)}));
  const sk=S.sort&&(cols.includes(S.sort)||S.sort==='_nach')?S.sort:null;
  rows.sort((a,b)=>{ if(sk==='_nach')return svNachCmp(a.p,b.p)*S.dir; if(sk){ const va=SV50_COLS[sk].v(a.p,a.s), vb=SV50_COLS[sk].v(b.p,b.s); if(va!==vb)return (va<vb?-1:1)*S.dir; }
    const pi=p=>{ const i=TR_POS.indexOf(p.pos); return i<0?99:i; }; return (pi(a.p)-pi(b.p))||a.p.name.localeCompare(b.p.name,'de'); });
  const table=L=>`<div class="trtw"><table class="trtab t50"><thead><tr><th class="nm50"><button data-s50="_nach" class="${sk==='_nach'?'on':''}" title="Nach Nachname sortieren">Spieler${sk==='_nach'?(S.dir>0?' A bis Z':' Z bis A'):''}</button></th>${cols.map(c=>`<th><button data-s50="${c}" class="${sk===c?'on':''}">${SV50_COLS[c].t}${sk===c?(S.dir>0?' ▲':' ▼'):''}</button></th>`).join('')}</tr></thead>
    <tbody>${L.map(({p,s})=>{ const lk=sv50Luecken(p); return `<tr data-svp="${svEsc(p.id)}"><td class="nm50"><b>${svEsc(p.name)}</b></td>${cols.map(c=>{ let h='–'; try{ h=SV50_COLS[c].h(p,s); }catch(e){} return `<td>${h}</td>`; }).join('')}</tr>`; }).join('')}</tbody></table></div>`;
  const groups=S.group?[...MN_TEAMS.map(t=>[t,MN_TEAM[t]]),['-','Ohne Mannschaft']]:[['*','']];
  const fc=mnFCount(f), dirty=mnSpDirty(), cur=mnViewDef(S.vid);
  const chips=(k,L)=>`<div class="mn-fg"><span>${{team:'Mannschaft',fuss:'Starker Fuß',alter:'Alter',status:'Verfügbar',eye:'Eye-Test'}[k]}</span><div class="chips4">${L.map(([v,t])=>`<button type="button" class="${(f[k]||'')===v?'on':''}" data-mnf="${k}:${v}">${t}</button>`).join('')}</div></div>`;
  B.innerHTML=`<div class="card sp50 mn-sp">
      <div class="mn-views"><div class="chips4">${[MN_STD,...MN.views].map(v=>`<button type="button" class="${S.vid===v.id?'on':''}" data-mnv="${svEsc(v.id)}">${svEsc(v.name)}${S.vid===v.id&&dirty?' *':''}</button>`).join('')}<button type="button" class="mn-add" data-mnnew>${SVI('plus')} Ansicht</button></div></div>
      <div class="sp50-bar"><div class="sp50-f"><input type="search" id="sp50q" placeholder="Name suchen" value="${svEsc(S.q)}">
        <div class="chips4"><button type="button" class="${MN.fOpen||fc?'on':''}" data-mnfo>Filter${fc?' ('+fc+')':''}</button><button type="button" data-mncols>Spalten (${cols.length})</button><button type="button" class="${S.group?'on':''}" data-mngrp>Nach Mannschaft</button></div></div></div>
      ${MN.fOpen?`<div class="mn-fbox">${chips('team',MN_F.team)}${f.team?`<label class="mn-chk"><input type="checkbox" data-mnt2 ${f.t2?'checked':''}> auch Spieler, bei denen das die Zweitmannschaft ist</label>`:''}
        <div class="mn-fg"><span>Position</span><div class="chips4">${TR_POS.map(x=>`<button type="button" class="${(f.pos||[]).includes(x)?'on':''}" data-mnpos="${x}">${x}</button>`).join('')}</div></div>
        ${(f.pos||[]).length?`<label class="mn-chk"><input type="checkbox" data-mnt2pos ${f.t2pos?'checked':''}> auch Nebenpositionen</label>`:''}
        ${chips('fuss',MN_F.fuss)}${chips('alter',MN_F.alter)}${chips('status',MN_F.status)}${chips('eye',MN_F.eye)}
        ${fc?'<div class="btnrow"><button type="button" class="btn ghost sm" data-mnfx>Filter zurücksetzen</button></div>':''}</div>`:''}
      ${dirty||S.vid!=='std'?`<div class="mn-vbar">${dirty?`<span>Ansicht „${svEsc(cur.name)}“ geändert</span>${S.vid!=='std'?'<button type="button" class="btn sm" data-mnvsave>Speichern</button>':''}<button type="button" class="btn ${S.vid==='std'?'':'ghost '}sm" data-mnnew>Als neue Ansicht</button><button type="button" class="btn ghost sm" data-mnvreset>Zurücksetzen</button>`
        :`<span>Eigene Ansicht „${svEsc(cur.name)}“</span><button type="button" class="btn ghost sm" data-mnvren>Umbenennen</button><button type="button" class="btn ghost sm" data-mnvdel>Löschen</button>`}</div>`:''}
      ${groups.map(([t,l])=>{ const L=t==='*'?rows:rows.filter(x=>(MN_TEAMS.includes(x.t)?x.t:'-')===t); return L.length?`${l?`<h3 class="trh sp50-h">${l} <small>${L.length}</small></h3>`:''}${table(L)}${sv50Karten(L,cols,false)}`:''; }).join('')||'<div class="empty">Keine Spieler für diese Auswahl.</div>'}
      <div class="note">${rows.length} von ${mnIntern().length} internen Spielern. Beteiligung und Noten zählen ab ${TRC.fmt(sv50Start())}${sv50Start().slice(2,4)}. Fehlende Angaben pflegst du in der <a href="#" data-mngo>Massenpflege</a>.</div>
    </div>`;
  const re=()=>trRender(), $=s=>B.querySelector(s), all=(s,fn)=>B.querySelectorAll(s).forEach(b=>b.onclick=e=>{ e.preventDefault(); e.stopPropagation(); fn(b); });
  all('[data-mnv]',b=>{ mnSpUse(b.dataset.mnv); re(); });
  all('[data-mnnew]',()=>mnViewName(null));
  all('[data-mnfo]',()=>{ MN.fOpen=!MN.fOpen; re(); });
  all('[data-mncols]',()=>mnColsPick(B));
  all('[data-mngrp]',()=>{ S.group=!S.group; re(); });
  all('[data-mnf]',b=>{ const [k,v]=b.dataset.mnf.split(':'); f[k]=v||undefined; if(!f[k])delete f[k]; if(k==='team'&&!v)delete f.t2; re(); });
  all('[data-mnpos]',b=>{ const x=b.dataset.mnpos, L=new Set(f.pos||[]); if(L.has(x))L.delete(x); else L.add(x); f.pos=[...L]; if(!f.pos.length){ delete f.pos; delete f.t2pos; } re(); });
  all('[data-mnluecken]',()=>{ if(f.luecken)delete f.luecken; else f.luecken=true; re(); });
  all('[data-mnfx]',()=>{ S.f={}; re(); });
  const t2=$('[data-mnt2]'); if(t2)t2.onchange=()=>{ if(t2.checked)f.t2=true; else delete f.t2; re(); };
  const t2p=$('[data-mnt2pos]'); if(t2p)t2p.onchange=()=>{ if(t2p.checked)f.t2pos=true; else delete f.t2pos; re(); };
  all('[data-mnvreset]',()=>{ mnSpUse(S.vid); re(); });
  all('[data-mnvsave]',async()=>{ const L=MN.views.map(v=>v.id===S.vid?Object.assign({},v,{cols:S.cols,f:S.f,sort:S.sort,dir:S.dir,group:S.group}):v);
    try{ await mnViewsSave(L); kToast('✓ Ansicht gespeichert'); re(); }catch(e){ kToast('⚠️ '+e.message); } });
  all('[data-mnvren]',()=>mnViewName(S.vid));
  all('[data-mnvdel]',async b=>{ if(!b.classList.contains('sure')){ b.classList.add('sure'); b.textContent='Wirklich löschen?'; return; }
    try{ await mnViewsSave(MN.views.filter(v=>v.id!==S.vid)); mnSpUse('std'); kToast('Ansicht gelöscht'); re(); }catch(e){ kToast('⚠️ '+e.message); } });
  all('[data-mngo]',()=>mnGo(null,null));
  B.querySelectorAll('[data-s50]').forEach(b=>b.onclick=e=>{ e.stopPropagation(); const k=b.dataset.s50||null; if(k==='_nach'&&S.sort==='_nach'&&S.dir<0){ S.sort=null; S.dir=1; } else if(S.sort===k)S.dir*=-1; else { S.sort=k; S.dir=1; } re(); });
  const qi=$('#sp50q'); qi.oninput=()=>{ S.q=qi.value; clearTimeout(MN._t); MN._t=setTimeout(()=>{ re(); const n=document.getElementById('sp50q'); if(n){ n.focus(); n.setSelectionRange(n.value.length,n.value.length); } },250); };
  B.querySelectorAll('tr[data-svp],.sp50-k[data-svp]').forEach(r=>r.onclick=()=>openModal(r.dataset.svp));
}
trViewPlayers=mnViewPlayers;
function mnViewName(id){
  const v=id?MN.views.find(x=>x.id===id):null, S=MN.sp;
  if(!v&&MN.views.length>=20)return kToast('Höchstens 20 eigene Ansichten');
  const M=svModal(`<h2 style="margin:0 0 4px">${v?'Ansicht umbenennen':'Neue Ansicht'}</h2><p class="note">${v?'':'Gespeichert werden die Spalten, Filter, Sortierung und Gruppierung, die gerade eingestellt sind. Nur für dich, auf jedem Gerät.'}</p>
    <div class="field"><label>Name</label><input id="mnVn" maxlength="40" value="${svEsc(v?v.name:'')}" placeholder="z.B. Spieltag, Kontakte, Torhüter"></div>
    <div class="btnrow sbact"><button class="btn" type="button" id="mnVok">Speichern</button><button class="btn ghost" type="button" id="mnVx">Abbrechen</button></div>`);
  const i=M.querySelector('#mnVn'); setTimeout(()=>i.focus(),50);
  M.querySelector('#mnVx').onclick=()=>closeOverlay();
  M.querySelector('#mnVok').onclick=async e=>{ const name=i.value.trim(); if(!name)return kToast('Bitte einen Namen eingeben'); const b=e.currentTarget; b.disabled=true;
    const nid=v?v.id:Date.now().toString(36).slice(-8)+Math.random().toString(36).slice(2,5);
    const L=v?MN.views.map(x=>x.id===v.id?Object.assign({},x,{name}):x):MN.views.concat([{id:nid,name,cols:S.cols,f:S.f,sort:S.sort,dir:S.dir,group:S.group}]);
    try{ await mnViewsSave(L); if(!v)mnSpUse(nid); closeOverlay(); kToast('✓ Ansicht „'+name+'“ gespeichert'); if(svCurTab()==='training')trRender(); }catch(x){ b.disabled=false; kToast('⚠️ '+x.message); } };
}
function mnColsPick(B){
  const S=MN.sp, sel=S.cols.slice();
  const M=svModal(`<h2 style="margin:0 0 4px">Spalten</h2><p class="note">Antippen zum Ein- und Ausblenden. Die Reihenfolge der gewählten Spalten mit den Pfeilen ändern.</p><div id="mnCp"></div>
    <div class="btnrow sbact"><button class="btn" type="button" id="mnCok">Übernehmen</button><button class="btn ghost" type="button" id="mnCx">Abbrechen</button></div>`);
  const draw=()=>{ const E=M.querySelector('#mnCp');
    E.innerHTML=`<div class="mn-csel">${sel.map((c,i)=>`<div><b>${svEsc(SV50_COLS[c].t)}</b><span><button type="button" data-cu="${i}" ${i?'':'disabled'} aria-label="nach oben">▲</button><button type="button" data-cd="${i}" ${i<sel.length-1?'':'disabled'} aria-label="nach unten">▼</button><button type="button" data-cx="${c}" aria-label="entfernen">✕</button></span></div>`).join('')||'<p class="note small">Keine Spalte gewählt, es gilt der Standard.</p>'}</div>
      ${MN_COLGRP.map(([g,L])=>{ const ok=L.filter(mnColOk); return ok.length?`<div class="mn-fg"><span>${g}</span><div class="chips4">${ok.map(c=>`<button type="button" class="${sel.includes(c)?'on':''}" data-ct="${c}">${svEsc(SV50_COLS[c].t)}</button>`).join('')}</div></div>`:''; }).join('')}`;
    E.querySelectorAll('[data-ct]').forEach(b=>b.onclick=()=>{ const c=b.dataset.ct, i=sel.indexOf(c); if(i>=0)sel.splice(i,1); else sel.push(c); draw(); });
    E.querySelectorAll('[data-cx]').forEach(b=>b.onclick=()=>{ sel.splice(sel.indexOf(b.dataset.cx),1); draw(); });
    E.querySelectorAll('[data-cu]').forEach(b=>b.onclick=()=>{ const i=+b.dataset.cu; [sel[i-1],sel[i]]=[sel[i],sel[i-1]]; draw(); });
    E.querySelectorAll('[data-cd]').forEach(b=>b.onclick=()=>{ const i=+b.dataset.cd; [sel[i+1],sel[i]]=[sel[i],sel[i+1]]; draw(); }); };
  draw();
  M.querySelector('#mnCx').onclick=()=>closeOverlay();
  M.querySelector('#mnCok').onclick=()=>{ S.cols=sel.slice(); if(S.sort&&S.sort!=='_nach'&&!S.cols.includes(S.sort))S.sort=null; closeOverlay(); if(svCurTab()==='training')trRender(); };
}

/* =====================================================================
   Massenpflege
   ===================================================================== */
const mnKeys=a=>{ const o=Object.keys(POS_W); return a.slice().sort((x,y)=>o.indexOf(x)-o.indexOf(y)); };
const mnSkStr=sk=>SB_SKILLS.map(s=>s.k).filter(k=>sk[k]).map(k=>k+(sk[k]===2?'+':'')).join(',');
const mnSkObj=v=>Object.fromEntries(sbSk(v).map(x=>[x.k,x.plus?2:1]));
const mnChStr=o=>{ const s=SB_CHAR.map(c=>o[c.k]||0).join(','); return /[1-5]/.test(s)?s:''; };
const mnTgStr=set=>SB_TAGS.map(t=>t.k).filter(k=>set.has(k)).join(',');
const mnKxOk=p=>typeof kxAllowed==='function'&&kxAllowed(p)&&!(p.alter!=null&&p.alter<18);
const mnEyeNorm=v=>{ if(v===''||v==null)return null; let x=Math.round(parseFloat(String(v).replace(',','.'))*2)/2; if(!isFinite(x))return null; return Math.max(1,Math.min(10,x)); };
const MN_AREAS=[
  {k:'fuss',t:'Starker Fuß',can:()=>canWriteField('fu'),leer:p=>!p.fuss,
    orig:p=>({fu:p.fuss||'',wf:+crmOf(p).wf||0}),
    ctl:(p,v,ok)=>`<div class="sbseg mn-seg">${['Rechts','Links','Beidfüßig'].map(x=>`<button type="button" data-set="fu:${x}" class="${v.fu===x?'on':''}" ${ok?'':'disabled'}>${x}</button>`).join('')}</div>
      <div class="sbwf mn-wf"><span>Schwacher Fuß</span>${[1,2,3,4,5].map(n=>`<button type="button" data-set="wf:${n}" class="${n<=v.wf?'on':''}" ${ok?'':'disabled'} aria-label="${n} Sterne">★</button>`).join('')}</div>`,
    set:(v,k,x)=>{ if(k==='fu')v.fu=v.fu===x?'':x; if(k==='wf')v.wf=v.wf===+x?0:+x; }},
  {k:'eye',t:'Eye-Test',can:()=>typeof sv4Can==='function'&&sv4Can(),leer:p=>{ try{ return !sv4Eye(p.id); }catch(e){ return true; } },
    orig:p=>{ let m=null; try{ const E=sv4Eye(p.id); m=E&&E.mine; }catch(e){} const o={}; SV4_EYE.forEach(([k])=>o[k]=m&&m[k]!=null?+m[k]:null); return o; },
    ctl:(p,v,ok)=>{ let E=null,ev=null; try{ E=sv4Eye(p.id); ev=sv4EyeVal(p.id,p.pos); }catch(e){}
      return `<div class="mn-eye">${SV4_EYE.map(([k,l,ab])=>`<label title="${svEsc(p.pos==='TW'&&SV4_EYE_TW[k]?SV4_EYE_TW[k]:l)}"><span>${ab}</span><input type="number" inputmode="decimal" min="1" max="10" step="0.5" data-f="${k}" value="${v[k]!=null?v[k]:''}" placeholder="–" ${ok?'':'disabled'}></label>`).join('')}</div>
        <small class="mn-eyeavg">${ev?`Schnitt aller: <b style="color:${tierColor(ev.v)}">${Math.round(ev.v)}</b> aus ${E.n}`:'noch keine Bewertung'}</small>`; },
    read:(k,val)=>mnEyeNorm(val)},
  {k:'pos',t:'Position',can:()=>canWriteField('ps'),leer:p=>!p.pos,
    orig:p=>({ps:p.pos||'',ps2:mnKeys((p.pos2||[]).filter(x=>x!==p.pos)).join(',')}),
    ctl:(p,v,ok)=>{ const alt=new Set(String(v.ps2||'').split(',').filter(Boolean));
      return `<select data-f="ps" ${ok?'':'disabled'}><option value="">Hauptposition?</option>${Object.keys(POS_W).map(x=>`<option${x===v.ps?' selected':''}>${x}</option>`).join('')}</select>
        <div class="chips mn-alt"><span>auch</span>${Object.keys(POS_W).filter(x=>x!==v.ps).map(x=>`<button type="button" class="pchip alt${alt.has(x)?' on':''}" data-set="ps2:${x}" ${ok?'':'disabled'}>${x}</button>`).join('')}</div>`; },
    set:(v,k,x)=>{ const s=new Set(String(v.ps2||'').split(',').filter(Boolean)); if(s.has(x))s.delete(x); else s.add(x); v.ps2=mnKeys([...s]).join(','); },
    read:(k,val,v)=>{ if(k==='ps'){ const s=String(v.ps2||'').split(',').filter(x=>x&&x!==val); v.ps2=mnKeys(s).join(','); } return val; }},
  {k:'team',t:'Mannschaft',can:()=>typeof sv4Can==='function'&&sv4Can(),leer:p=>!mnTeam(p),
    orig:p=>({t:mnTeam(p)||'',t2:mnTeam2(p)||''}),
    ctl:(p,v,ok)=>`<label class="mn-lbl"><span>Stammmannschaft</span><select data-f="t" ${ok?'':'disabled'}>${v.t?'':'<option value="">–</option>'}${MN_TEAMS.map(t=>`<option value="${t}"${v.t===t?' selected':''}>${MN_TEAM[t]}</option>`).join('')}</select></label>
      <label class="mn-lbl"><span>Zweitmannschaft</span><select data-f="t2" ${ok?'':'disabled'}><option value="">keine</option>${MN_TEAMS.filter(t=>t!==v.t).map(t=>`<option value="${t}"${v.t2===t?' selected':''}>${MN_TEAM[t]}</option>`).join('')}</select></label>`,
    read:(k,val,v)=>{ if(k==='t'&&v.t2===val)v.t2=''; return val; }},
  {k:'kontakt',t:'Kontaktdaten',can:()=>typeof kxOk==='function'&&kxOk(),leer:p=>mnKxOk(p)&&!kxOf(p.id).tel,
    orig:p=>{ const k=typeof kxOf==='function'?kxOf(p.id):{}; return {tel:k.tel?kxTelFmt(k.tel):'',email:k.email||''}; },
    ctl:(p,v,ok)=>mnKxOk(p)?`<input type="tel" inputmode="tel" data-f="tel" value="${svEsc(v.tel)}" placeholder="0171 1234567" autocomplete="off" ${ok?'':'disabled'}><input type="email" inputmode="email" data-f="email" value="${svEsc(v.email)}" placeholder="name@beispiel.de" autocomplete="off" ${ok?'':'disabled'}>${ok?'<button type="button" class="lk4" data-kxh>Verlauf</button>':''}`
      :'<small class="note">Für Jugendspieler werden keine Kontaktdaten gespeichert.</small>'},
  {k:'geb',t:'Geburtsdatum',can:()=>canWriteField('gb'),leer:p=>!p.geb,
    orig:p=>({gb:p.geb||''}),
    ctl:(p,v,ok)=>`<input type="date" data-f="gb" value="${svEsc(v.gb)}" min="1960-01-01" max="${trToday()}" ${ok?'':'disabled'}><small class="mn-age">${v.gb?(svAge(v.gb)!=null?svAge(v.gb)+' Jahre':''):p.alter!=null?'bisher ca. '+p.alter+' Jahre':''}</small>`},
  {k:'skills',t:'Skills, Rolle & Charakter',can:()=>canWriteField('sk'),leer:p=>!sbHas(sbOf(p)),
    orig:p=>{ const b=sbOf(p); return {rol:b.rol||'',sk:mnSkStr(Object.fromEntries(b.sk.map(x=>[x.k,x.plus?2:1]))),ch:mnChStr(b.ch),tg:mnTgStr(new Set(b.tg)),sts:b.sts||'',sws:b.sws||''}; },
    ctl:(p,v,ok)=>{ const open=MN.open.has(p.id), sk=mnSkObj(v.sk), ch=sbCh(v.ch), tg=new Set(String(v.tg||'').split(',').filter(Boolean)), R=SB_ROLE[v.rol];
      const sum=`<button type="button" class="mn-sum" data-open>${R?`<b>${svEsc(R.t)}</b>`:'<i class="miss50">Rolle offen</i>'} · ${Object.keys(sk).length} Skills · ${Object.values(ch).some(Boolean)?'Charakter Ø '+(Object.values(ch).filter(Boolean).reduce((a,b)=>a+b,0)/Object.values(ch).filter(Boolean).length).toFixed(1).replace('.',','):'Charakter offen'}${tg.size?' · '+tg.size+' Tags':''}<em>${open?'zuklappen':'bearbeiten'}</em></button>`;
      if(!open)return sum;
      const isTW=p.pos==='TW', posList=[p.pos,...(p.pos2||[])].filter((x,i,a)=>x&&SB_ROLES[x]&&a.indexOf(x)===i), dis=ok?'':'disabled';
      return sum+`<div class="mn-sb">
        <div class="mn-fg"><span>Spielerrolle</span>${posList.map(pos=>`<div class="chips">${SB_ROLES[pos].map(r=>`<button type="button" class="pchip role${v.rol===r.k?' on':''}" data-set="rol:${r.k}" title="${svEsc(r.d)}" ${dis}>${svEsc(r.t)}</button>`).join('')}</div>`).join('')||'<p class="note small">Erst eine Position pflegen.</p>'}</div>
        <div class="mn-fg"><span>Special Skills <small>1× = hat er · 2× = herausragend</small></span><div class="chips">${SB_SKILLS.filter(s=>isTW?(s.g==='Torwart'||s.g==='Passspiel'):s.g!=='Torwart').map(s=>{ const n=sk[s.k]||0; return `<button type="button" class="sbskchip v${n}" data-set="sk:${s.k}" title="${svEsc(s.d)}" ${dis}>${svEsc(s.t)}${n===2?' +':''}</button>`; }).join('')}</div></div>
        <div class="mn-fg"><span>Charakter &amp; Training <small>1 bis 5</small></span>${SB_CHAR.map(c=>`<div class="sbrate"><span>${c.t}</span><div>${[1,2,3,4,5].map(n=>`<button type="button" data-set="ch:${c.k}.${n}" class="${n<=ch[c.k]?'on v'+ch[c.k]:''}" ${dis}>${n}</button>`).join('')}</div></div>`).join('')}</div>
        <div class="mn-fg"><span>Charakter-Tags</span><div class="chips">${SB_TAGS.map(t=>`<button type="button" class="pchip tag${t.w?' warn':''}${tg.has(t.k)?' on':''}" data-set="tg:${t.k}" ${dis}>${svEsc(t.t)}</button>`).join('')}</div></div>
        <div class="mn-2"><label class="mn-lbl"><span>Stärken</span><input data-f="sts" maxlength="160" value="${svEsc(v.sts)}" ${dis}></label><label class="mn-lbl"><span>Schwächen</span><input data-f="sws" maxlength="160" value="${svEsc(v.sws)}" ${dis}></label></div></div>`; },
    set:(v,k,x)=>{ if(k==='rol')v.rol=v.rol===x?'':x;
      if(k==='sk'){ const o=mnSkObj(v.sk); o[x]=((o[x]||0)+1)%3; if(!o[x])delete o[x]; v.sk=mnSkStr(o); }
      if(k==='ch'){ const [c,n]=x.split('.'), o=sbCh(v.ch); o[c]=o[c]===+n?0:+n; v.ch=mnChStr(o); }
      if(k==='tg'){ const s=new Set(String(v.tg||'').split(',').filter(Boolean)); if(s.has(x))s.delete(x); else s.add(x); v.tg=mnTgStr(s); } }},
  {k:'groesse',t:'Größe',can:()=>canWriteField('gr'),leer:p=>!p.groesse,
    orig:p=>({gr:p.groesse?String(p.groesse):''}),
    ctl:(p,v,ok)=>`<label class="mn-num"><input type="number" inputmode="numeric" min="140" max="215" data-f="gr" value="${svEsc(v.gr)}" placeholder="–" ${ok?'':'disabled'}><span>cm</span></label>`},
  {k:'gewicht',t:'Gewicht',can:()=>canWriteField('gw'),leer:p=>!p.gewicht,
    orig:p=>({gw:p.gewicht?String(p.gewicht):''}),
    ctl:(p,v,ok)=>`<label class="mn-num"><input type="number" inputmode="numeric" min="40" max="160" data-f="gw" value="${svEsc(v.gw)}" placeholder="–" ${ok?'':'disabled'}><span>kg</span></label>`}
];
const MN_A={}; MN_AREAS.forEach(a=>MN_A[a.k]=a);
function mnVal(a,p){ return Object.assign(a.orig(p),(MN.draft[a.k]||{})[p.id]||{}); }
function mnDraftN(k){ return Object.keys(MN.draft[k]||{}).length; }
function mnDraftAll(){ return MN_AREAS.reduce((s,a)=>s+mnDraftN(a.k),0); }
function mnPut(a,p,v){ const o=a.orig(p), d={}; Object.keys(o).forEach(k=>{ const x=v[k]==null?'':v[k], y=o[k]==null?'':o[k]; if(String(x)!==String(y))d[k]=v[k]; });
  const D=MN.draft[a.k]=MN.draft[a.k]||{}; if(Object.keys(d).length)D[p.id]=d; else delete D[p.id]; }
function mnRowHtml(a,p,ok){ const v=mnVal(a,p), chg=!!(MN.draft[a.k]||{})[p.id], t=mnTeam(p);
  return `<div class="mp-n"><b data-svp="${svEsc(p.id)}">${svEsc(p.name)}</b><small>${svEsc(p.pos||'–')} · ${MN_TK[t]||'–'}${chg?' · <em>geändert</em>':''}</small></div><div class="mp-c">${a.ctl(p,v,ok)}</div>`; }
function mnViewPflege(B){
  if(!MN_A[MN.area])MN.area='fuss';
  if(typeof SV4!=='undefined'&&!SV4.loaded&&typeof sv4Can==='function'&&sv4Can())mnLoadOnce('sv4',()=>sv4Load(),mnRerender('pflege'));
  if(typeof kxLoad==='function'&&!KX.loaded&&typeof kxOk==='function'&&kxOk())mnLoadOnce('kx',()=>kxLoad(),mnRerender('pflege'));
  try{ mnApplyGw(); }catch(e){}
  const a=MN_A[MN.area], ok=a.can(), q=TRC.N(MN.q||'');
  const qs=q&&typeof suFind==='function'?new Set(suFind(MN.q,{limit:1e5,noScore:true,scope:mnIsIntern}).list.map(x=>x.p.id)):null;
  const L=mnIntern().filter(p=>(!q||(qs?qs.has(p.id):TRC.N(p.name).includes(q)))&&(MN.team==='alle'||(mnTeam(p)||'-')===MN.team)&&(!MN.leer||a.leer(p)||(MN.draft[a.k]||{})[p.id]));
  const leerN=mnIntern().filter(a.leer).length, n=mnDraftAll();
  const hint={eye:'Deine eigene Bewertung dieser Saison, 1 bis 10 (5 = Kreisliga-Durchschnitt). Die Karte zeigt den Schnitt aller Bewerter.',
    team:'Stammmannschaft und Zweitmannschaft der laufenden Saison. Umfeld: hat einen Spielerpass, spielt aber nicht regelmäßig.',
    kontakt:'Korrekturen landen im Verlauf, die alte Angabe lässt sich zurückholen. Leeren kann nur der Admin.',
    pos:'Hauptposition wählen, darunter antippen, was er noch spielen kann.',
    skills:'Zeile antippen zum Aufklappen. Rolle, Special Skills, Charakter und Tags wie im Spielerbogen.'}[a.k]||'';
  B.innerHTML=`<div class="card mp18">
      <div class="mp-areas" role="tablist">${MN_AREAS.map(x=>`<button type="button" role="tab" class="${x.k===a.k?'on':''}" data-mpa="${x.k}">${svEsc(x.t)}${mnDraftN(x.k)?`<i>${mnDraftN(x.k)}</i>`:''}${x.can()?'':` <span class="mp-lock" title="Nur ansehen">${SVI('lock')}</span>`}</button>`).join('')}</div>
      <div class="mp-f"><input type="search" id="mpq" placeholder="Name suchen" value="${svEsc(MN.q)}">
        <div class="chips4">${[['alle','Alle'],['1','Erste'],['2','Zweite'],['A','A-Jugend'],['U','Umfeld'],['-','ohne Mannschaft']].map(([k,t])=>`<button type="button" class="${MN.team===k?'on':''}" data-mpt="${k}">${t}</button>`).join('')}
          <button type="button" class="${MN.leer?'on':''}" data-mpl>Nur Lücken${leerN?' ('+leerN+')':''}</button></div></div>
      ${!ok?`<div class="ro-note">${SVI('lock')}<span><b>Nur ansehen.</b> Das pflegen Trainer, Kaderplaner, Vorstand und Admin.</span></div>`:hint?`<p class="note small">${svEsc(hint)}</p>`:''}
      <div class="mp-list mp-${a.k}">${L.map(p=>`<div class="mp-r${(MN.draft[a.k]||{})[p.id]?' chg':''}${MN.focus===p.id?' fo':''}" data-mp="${svEsc(p.id)}">${mnRowHtml(a,p,ok)}</div>`).join('')||'<div class="empty">Keine Spieler für diese Auswahl.</div>'}</div>
      <p class="note small">${L.length} von ${mnIntern().length} internen Spielern.</p></div>
    <div class="mp-bar${n?' on':''}"><span>${n?`<b>${n}</b> ${n===1?'Spieler':'Spieler'} geändert${MN_AREAS.filter(x=>mnDraftN(x.k)).length>1?' in '+MN_AREAS.filter(x=>mnDraftN(x.k)).map(x=>x.t).join(', '):''}`:'Keine offenen Änderungen'}</span>
      <button type="button" class="btn ghost sm" data-mpx ${n?'':'disabled'}>Verwerfen</button><button type="button" class="btn sm" data-mps ${n?'':'disabled'}>${SVI('check')} Speichern</button></div>`;
  B.querySelectorAll('[data-mpa]').forEach(b=>b.onclick=()=>{ MN.area=b.dataset.mpa; MN.focus=null; trRender(); });
  B.querySelectorAll('[data-mpt]').forEach(b=>b.onclick=()=>{ MN.team=b.dataset.mpt; trRender(); });
  B.querySelector('[data-mpl]').onclick=()=>{ MN.leer=!MN.leer; trRender(); };
  const qi=B.querySelector('#mpq'); qi.oninput=()=>{ MN.q=qi.value; clearTimeout(MN._pt); MN._pt=setTimeout(()=>{ trRender(); const n2=document.getElementById('mpq'); if(n2){ n2.focus(); n2.setSelectionRange(n2.value.length,n2.value.length); } },250); };
  const bar=()=>{ const b=B.querySelector('.mp-bar'), m=mnDraftAll(); if(!b)return; b.classList.toggle('on',!!m); b.querySelector('span').innerHTML=m?`<b>${m}</b> Spieler geändert`:'Keine offenen Änderungen';
    b.querySelectorAll('button').forEach(x=>x.disabled=!m); const c=B.querySelector(`[data-mpa="${a.k}"]`); if(c){ let i=c.querySelector('i'); const k=mnDraftN(a.k); if(k){ if(!i){ i=document.createElement('i'); c.appendChild(i); } i.textContent=k; } else if(i)i.remove(); } };
  const row=(el,p)=>{ el.innerHTML=mnRowHtml(a,p,ok); el.classList.toggle('chg',!!(MN.draft[a.k]||{})[p.id]); bar(); };
  const list=B.querySelector('.mp-list');
  list.addEventListener('click',e=>{ const el=e.target.closest('[data-mp]'); if(!el)return; const p=trP(el.dataset.mp); if(!p)return;
    const sv=e.target.closest('[data-svp]'); if(sv){ openModal(sv.dataset.svp); return; }
    if(e.target.closest('[data-kxh]')){ mnKxHist(p); return; }
    if(e.target.closest('[data-open]')){ if(MN.open.has(p.id))MN.open.delete(p.id); else MN.open.add(p.id); row(el,p); return; }
    const b=e.target.closest('[data-set]'); if(!b||!ok||b.disabled)return;
    const i=b.dataset.set.indexOf(':'), k=b.dataset.set.slice(0,i), x=b.dataset.set.slice(i+1), v=mnVal(a,p); a.set(v,k,x); mnPut(a,p,v); row(el,p); });
  list.addEventListener('change',e=>{ const f=e.target.closest('[data-f]'), el=e.target.closest('[data-mp]'); if(!f||!el||!ok)return; const p=trP(el.dataset.mp); if(!p)return;
    const v=mnVal(a,p), k=f.dataset.f; v[k]=a.read?a.read(k,f.value,v):f.value; mnPut(a,p,v);
    const keepOpen=a.k==='skills'||a.k==='pos'||a.k==='team'||a.k==='geb'; if(keepOpen)row(el,p); else { el.classList.toggle('chg',!!(MN.draft[a.k]||{})[p.id]); const sm=el.querySelector('.mp-n small'); if(sm)sm.innerHTML=`${svEsc(p.pos||'–')} · ${MN_TK[mnTeam(p)]||'–'}${(MN.draft[a.k]||{})[p.id]?' · <em>geändert</em>':''}`; if(a.k==='eye'&&v[k]!=null&&String(v[k])!==f.value)f.value=v[k]; bar(); } });
  B.querySelector('[data-mpx]').onclick=e=>{ const b=e.currentTarget; if(!b.classList.contains('sure')){ b.classList.add('sure'); b.textContent='Wirklich verwerfen?'; return; } MN.draft={}; trRender(); kToast('Änderungen verworfen'); };
  B.querySelector('[data-mps]').onclick=e=>mnSave(e.currentTarget);
  if(MN.focus){ const el=B.querySelector(`[data-mp="${CSS.escape(MN.focus)}"]`); if(el)setTimeout(()=>{ try{ el.scrollIntoView({behavior:'smooth',block:'center'}); }catch(x){} },60); }
}
MN_VIEWS.pflege=mnViewPflege;
function mnKxHist(p){
  const M=svModal(`<h2 style="margin:0 0 4px">Kontakt-Verlauf</h2><p class="note">${svEsc(p.name)} · jede Änderung mit Datum und wer sie gemacht hat. Eine frühere Angabe lässt sich zurückholen.</p><div id="mnKxH"></div><div class="btnrow sbact"><button class="btn ghost" type="button" id="mnKxX">Schließen</button></div>`);
  M.querySelector('#mnKxX').onclick=()=>closeOverlay();
  kxHist(M.querySelector('#mnKxH'),p,()=>{ closeOverlay(); if(svCurTab()==='training')trRender(); });
}
async function mnSave(btn){
  if(MN.saving)return; MN.saving=true; if(btn){ btn.disabled=true; btn.textContent='Speichert …'; }
  const fehler=[]; let ok=0; const crm=new Map(), add=(pid,u)=>crm.set(pid,Object.assign(crm.get(pid)||{},u));
  const P=id=>trP(id);
  try{
    // 1) Felder im gemeinsamen Spielerdaten-Speicher
    for(const k of ['fuss','pos','geb','skills','groesse','gewicht']){ const D=MN.draft[k]||{}, a=MN_A[k]; if(!a.can())continue;
      for(const [pid,d] of Object.entries(D)){ const p=P(pid); if(!p){ delete D[pid]; continue; } const o=a.orig(p);
        if(k==='fuss'){ if('fu' in d)add(pid,{fu:d.fu||undefined}); if('wf' in d)add(pid,{wf:d.wf||undefined}); }
        if(k==='pos'){ const u={}; if('ps' in d&&d.ps&&d.ps!==o.ps){ u.ps=d.ps; u.ph=o.ps||undefined; } const ps=d.ps||o.ps, a2=String(('ps2' in d)?d.ps2:o.ps2).split(',').filter(x=>x&&x!==ps);
          if('ps2' in d||u.ps)u.ps2=mnKeys(a2).join(',')||'-'; if(Object.keys(u).length)add(pid,u); }
        if(k==='geb'){ if(d.gb&&!/^\d{4}-\d{2}-\d{2}$/.test(d.gb)){ fehler.push(p.name+': Geburtsdatum ungültig'); continue; } add(pid,{gb:d.gb||undefined}); }
        if(k==='skills'){ const u={}; ['rol','sk','ch','tg'].forEach(f=>{ if(f in d)u[f]=d[f]||undefined; }); ['sts','sws'].forEach(f=>{ if(f in d)u[f]=String(d[f]||'').trim().slice(0,160)||undefined; }); add(pid,u); }
        if(k==='groesse'){ const n=d.gr===''?null:Math.round(+d.gr); if(n!=null&&!(n>=140&&n<=215)){ fehler.push(p.name+': Größe 140 bis 215 cm'); continue; } add(pid,{gr:n||undefined}); }
        if(k==='gewicht'){ const n=d.gw===''?null:Math.round(+d.gw); if(n!=null&&!(n>=40&&n<=160)){ fehler.push(p.name+': Gewicht 40 bis 160 kg'); continue; } add(pid,{gw:n||undefined}); }
        delete D[pid]; } }
    crm.forEach((u,pid)=>{ crmSet(pid,u); ok++; });
    if(crm.size){ try{ crmApply(); }catch(e){} }
    // 2) Eye-Test (eigene Bewertung)
    { const D=MN.draft.eye||{}; if(MN_A.eye.can())for(const [pid,d] of Object.entries(D)){ const p=P(pid); if(!p){ delete D[pid]; continue; }
        const v=Object.assign(MN_A.eye.orig(p),d); let E=null; try{ E=sv4Eye(pid); }catch(e){} const mine=E&&E.mine;
        const any=SV4_EYE.some(([k])=>v[k]!=null);
        try{ if(!any){ if(mine&&typeof sv4EyeDel==='function')await sv4EyeDel(mine.id); }
          else { const rec={player_id:pid,saison:sv4S()}; SV4_EYE.forEach(([k])=>rec[k]=v[k]); ['anlass','gesehen_am','gesehen_bei','notiz'].forEach(f=>{ if(mine&&mine[f]!=null)rec[f]=mine[f]; }); if(!rec.anlass)rec.anlass='training';
            await sv4EyeSave(rec); }
          ok++; delete D[pid]; }catch(e){ fehler.push(p.name+': '+e.message); } } }
    // 3) Mannschaft der laufenden Saison
    { const D=MN.draft.team||{}; if(MN_A.team.can())for(const [pid,d] of Object.entries(D)){ const p=P(pid); if(!p){ delete D[pid]; continue; }
        const v=Object.assign(MN_A.team.orig(p),d); if(!v.t){ fehler.push(p.name+': bitte eine Stammmannschaft wählen'); continue; }
        try{ await sv4SSSet(pid,sv4S(),{team:v.t,team2:v.t2&&v.t2!==v.t?v.t2:null}); ok++; delete D[pid]; }catch(e){ fehler.push(p.name+': '+e.message); } } }
    // 4) Kontaktdaten (mit Verlauf)
    { const D=MN.draft.kontakt||{}; if(MN_A.kontakt.can())for(const [pid,d] of Object.entries(D)){ const p=P(pid); if(!p||!mnKxOk(p)){ delete D[pid]; continue; }
        const o=MN_A.kontakt.orig(p); let tel=null, email=null; const del=[];
        if('tel' in d){ const t=String(d.tel||'').trim(); if(!t){ if(o.tel)del.push('tel'); } else { tel=kxNormTel(t); if(!tel){ fehler.push(p.name+': Handynummer ungültig'); continue; } } }
        if('email' in d){ const m=String(d.email||'').trim(); if(!m){ if(o.email)del.push('email'); } else if(!/^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$/.test(m)){ fehler.push(p.name+': E-Mail ungültig'); continue; } else email=m.toLowerCase(); }
        if(del.length&&!isAdmin()){ fehler.push(p.name+': Kontaktdaten leeren kann nur der Admin'); continue; }
        try{ if(tel||email){ const {data,error}=await SVB.sb.rpc('kontakt_set',{p_player:pid,p_name:p.name,p_tel:tel,p_email:email,p_via:'app'}); if(error)throw error;
              const k=(data&&data.kontakt)||{}; KX.map.set(pid,Object.assign({},kxOf(pid),{id:pid,name:p.name,tel:k.tel,email:k.email})); }
            for(const f of del){ const {error}=await SVB.sb.rpc('kontakt_loeschen',{p_player:pid,p_feld:f}); if(error)throw error; const k=Object.assign({},kxOf(pid)); delete k[f]; KX.map.set(pid,k); }
            ok++; delete D[pid]; }catch(e){ fehler.push(p.name+': '+(e.message||e)); } } }
  }catch(e){ fehler.push(e.message||String(e)); }
  MN.saving=false;
  try{ renderAll(); }catch(e){}
  if(svCurTab()==='training')trRender();
  if(fehler.length){ svModal(`<h2 style="margin:0 0 4px">${ok?ok+' gespeichert, ':''}${fehler.length} nicht gespeichert</h2><p class="note">Diese Zeilen bleiben markiert, damit du sie korrigieren kannst:</p><ul class="mn-err">${fehler.map(x=>`<li>${svEsc(x)}</li>`).join('')}</ul><div class="btnrow sbact"><button class="btn" type="button" onclick="closeOverlay()">OK</button></div>`); }
  else if(ok){ try{ svSound('success'); }catch(e){} kToast('✓ '+ok+' Spieler gespeichert · gilt fürs ganze Team'); }
}

{ const _sm18=svModal; svModal=function(){ const M=document.getElementById('modal'); if(M)M.classList.remove('ro18'); return _sm18.apply(this,arguments); }; }
/* =====================================================================
   Profil: interne Spieler nur lesen, „Spielerdaten pflegen“
   ===================================================================== */
{ const _om18=openModal; openModal=function(id){ const r=_om18.apply(this,arguments); try{ mnProfil(id); }catch(e){ console.warn('Profil 0.18',e); } return r; }; }
function mnProfil(id){
  const M=document.getElementById('modal'), p=trP(id); if(!M)return;
  const ro=!!(p&&mnIsIntern(p)&&M.querySelector('.pf4')); M.classList.toggle('ro18',ro); if(!ro)return;
  M.querySelectorAll('.zk4 button').forEach(b=>{ b.disabled=true; b.onclick=null; });
  if(!canTraining())return;
  const head=M.querySelector('.pf4-head');
  if(head&&!head.querySelector('.mn-pfl')){ const b=document.createElement('button'); b.type='button'; b.className='btn sm mn-pfl'; b.innerHTML=SVI('sliders')+' Spielerdaten pflegen'; b.onclick=()=>mnGo(null,id); head.appendChild(b); }
  const lnk=(sel,area,txt)=>{ const box=M.querySelector(sel); if(box&&!box.querySelector('.mn-lnk')){ box.insertAdjacentHTML('beforeend',`<button type="button" class="lk4 mn-lnk" data-mnarea="${area}">${SVI('sliders')} ${txt}</button>`); box.querySelector('.mn-lnk').onclick=()=>mnGo(area,id); } };
  lnk('.pf4-sec[data-k="bogen"] .pf4-b','skills','Spielerbogen in der Massenpflege bearbeiten');
  lnk('.pf4-sec[data-k="kontakt"] .pf4-b','kontakt','Kontaktdaten in der Massenpflege bearbeiten');
  lnk('.pf4-eyel','eye','Eye-Test abgeben');
}
// Andere Wege zu den Bearbeitungsfenstern führen bei internen Spielern in die Massenpflege
{ const _sb18=sbEditor; sbEditor=function(pid){ const p=trP(pid); if(p&&mnIsIntern(p))return mnGo('skills',pid); return _sb18.apply(this,arguments); }; }
{ const _pe18=svPosEditor; svPosEditor=function(p){ if(p&&mnIsIntern(p))return mnGo('pos',p.id); return _pe18.apply(this,arguments); }; }
{ const _ef18=pf4EyeForm; pf4EyeForm=function(box,p){ if(p&&mnIsIntern(p)){ box.innerHTML=`<div class="ey4"><p class="note">Eye-Tests für eigene Spieler gibst du in der Massenpflege ab, alle untereinander.</p><div class="btnrow"><button class="btn sm" type="button" data-mneye>${SVI('sliders')} Zur Massenpflege</button></div></div>`;
  box.querySelector('[data-mneye]').onclick=()=>mnGo('eye',p.id); return; } return _ef18.apply(this,arguments); }; }
if(typeof sv90EyeOpen==='function'){ const _eo18=sv90EyeOpen; sv90EyeOpen=function(pid){ const p=trP(pid); if(p&&mnIsIntern(p))return mnGo('eye',pid); return _eo18.apply(this,arguments); }; }
if(typeof sv90EyeKat==='function'){ const _ek18=sv90EyeKat; sv90EyeKat=function(B){ const r=_ek18.apply(this,arguments);
  try{ B.querySelectorAll('[data-ek90p]').forEach(row=>{ const pid=row.dataset.ek90p, p=trP(pid), lab=row.querySelector('.ek90-in'); if(p&&mnIsIntern(p)&&lab){
      lab.outerHTML=`<button type="button" class="lk4" data-mneye="${svEsc(pid)}">in der Massenpflege</button>`; } });
    B.querySelectorAll('[data-mneye]').forEach(b=>b.onclick=()=>mnGo('eye',b.dataset.mneye)); }catch(e){}
  return r; }; }
// Kader → Rollen & Skills: die frühere Schnell-Erfassung lebt jetzt in der Massenpflege
{ const _kr18=sbKaderRender; sbKaderRender=function(){ sbQuickOpen=false; const r=_kr18.apply(this,arguments);
  try{ const b=document.getElementById('sbQuickT'); if(b){ b.id='sbQuickMn'; b.innerHTML=SVI('sliders')+' Fuß, Rolle &amp; Charakter in der Massenpflege bearbeiten'; b.onclick=()=>mnGo('skills',null); } }catch(e){}
  return r; }; }
// Frühere Saisons der Spiele: nicht mehr unter Mannschaft (nur laufende Saison), sondern unter Verein → Spiele-Archiv
{ const _vr18=vrRender; vrRender=function(){
  const on=VR.view==='sparchiv'; if(on)VR.view='rank';
  const r=_vr18.apply(this,arguments);
  try{ if(!canTraining()||typeof tm4ArchView!=='function')return r;
    const P=document.getElementById('panel-verein'), tabs=P&&P.querySelector('.trtabs'); if(!tabs||tabs.querySelector('[data-vrv="sparchiv"]'))return r;
    const b=document.createElement('button'); b.dataset.vrv='sparchiv'; b.textContent='Spiele-Archiv'; tabs.appendChild(b); b.onclick=()=>{ VR.view='sparchiv'; vrRender(); };
    if(on){ VR.view='sparchiv'; tabs.querySelectorAll('button').forEach(x=>x.classList.toggle('on',x===b)); const B=document.getElementById('vrBody'); if(B)mnArchiv(B); }
  }catch(e){ console.warn('Spiele-Archiv',e); }
  return r; }; }
function mnArchiv(B){
  if(!TM4.arch){ B.innerHTML='<div class="card"><div class="empty">Lade Archiv …</div></div>'; mnLoadOnce('arch',()=>tm4ArchLoad(),()=>{ if(svCurTab()==='verein'&&VR.view==='sparchiv')vrRender(); }); return; }
  const L=tm4Seasons(); if(!L.length){ B.innerHTML='<div class="card"><div class="empty">Keine früheren Saisons im Archiv.</div></div>'; return; }
  if(!MN.arch||!L.includes(MN.arch))MN.arch=L[0];
  tm4ArchView(B,MN.arch); B.querySelectorAll('.tm4s').forEach(x=>x.remove());
  B.insertAdjacentHTML('afterbegin',`<div class="chips4 tm4s mn-arch">${L.map(y=>`<button type="button" class="${y===MN.arch?'on':''}" data-sa18="${y}">${y.slice(2,4)}/${y.slice(5)}</button>`).join('')}</div>`);
  try{ if(typeof sv41AlbumHtml==='function'&&!B.querySelector('.a41')){ B.insertAdjacentHTML('beforeend',sv41AlbumHtml(MN.arch)); sv41AlbumWire(B); } }catch(e){}
  B.querySelectorAll('[data-sa18]').forEach(x=>x.onclick=()=>{ MN.arch=x.dataset.sa18; mnArchiv(B); });
}

/* =====================================================================
   Sportzentrale Beta 0.19 · Spielersuche: sofort und mit Vorschlägen
   - Ein Suchindex für alle Spieler (einmal aufgebaut, bei neuen Daten erneuert), Rechnen nur für die Treffer, die angezeigt werden
   - Umlaute egal: „Mueller“, „Müller“ und „Muller“ finden dasselbe, „ß“ = „ss“, Akzente zählen nicht
   - Anfang von Vor- oder Nachname zählt am meisten, dann Teil des Namens, dann Verein; eigene Spieler und Merkliste leicht vorne
   - Vertipper: findet die Suche nichts, schlägt sie ähnliche Namen vor („Meintest du …“)
   - Vorschläge beim Tippen in der Kopfzeile, im Spielermarkt, in der Spielerliste und in der Massenpflege
   - Leeres Feld: zuletzt angesehene Spieler
   ===================================================================== */
const SU={idx:null,n:-1,sc:new Map(),recent:null};
const suN1=s=>svNorm(s).replace(/[^a-z0-9]+/g,' ').trim();
const suN2=s=>suN1(s).replace(/ae/g,'a').replace(/oe/g,'o').replace(/ue/g,'u');
const suN3=s=>suN1(String(s||'').toLowerCase().replace(/ä/g,'ae').replace(/ö/g,'oe').replace(/ü/g,'ue'));
function suIndex(){
  if(SU.idx&&SU.n===players.length)return SU.idx;
  SU.idx=players.map(p=>{ const n1=suN1(p.name), c1=suN1(((p.cur&&p.cur.club)||p.club||''));
    const n3=suN3(p.name); return {p,n1,n2:suN2(p.name),n3,w1:n1.split(' '),w2:suN2(p.name).split(' '),w3:n3.split(' '),c1,c2:suN2(c1)}; });
  SU.n=players.length; SU.sc.clear(); return SU.idx;
}
{ const _ra19=renderAll; renderAll=function(){ SU.idx=null; return _ra19.apply(this,arguments); }; }
function suScore(p){ if(SU.sc.has(p.id))return SU.sc.get(p.id); let v=0; try{ v=scores(p).total||0; }catch(e){} SU.sc.set(p.id,v); return v; }
// Wie gut passt ein Suchwort? 0 = gar nicht
function suPart(x,w){
  const w2=suN2(w), dig=w2!==w; let s=0;   // „ue“ bewusst getippt: dann nur Namen mit ü oder ue
  const edge=i=>i===0||i===x.w1.length-1;
  for(let i=0;i<x.w1.length;i++){ if(x.w1[i].startsWith(w)||(x.w3[i]||'').startsWith(w))s=Math.max(s,edge(i)?3:2.6); else if(!dig&&x.w2[i].startsWith(w2))s=Math.max(s,edge(i)?2.2:2); }
  if(!s&&(x.n1.includes(w)||x.n3.includes(w)))s=1.4; else if(!s&&!dig&&x.n2.includes(w2))s=1.1;
  if(!s&&w.length>=2&&(x.c1.includes(w)||x.c2.includes(w2)))s=x.c1.split(' ').some(c=>c.startsWith(w))?0.9:0.5;
  return s;
}
function suLev1(a,b){ // höchstens ein Tippfehler (vertauscht, fehlt, zu viel, falsch)
  if(a===b)return true; const la=a.length, lb=b.length; if(Math.abs(la-lb)>1)return false;
  let i=0; while(i<la&&i<lb&&a[i]===b[i])i++;
  if(la===lb)return a.slice(i+1)===b.slice(i+1)||(a[i]===b[i+1]&&a[i+1]===b[i]&&a.slice(i+2)===b.slice(i+2));
  return la>lb?a.slice(i+1)===b.slice(i):a.slice(i)===b.slice(i+1);
}
function suFind(q,opt){
  opt=opt||{}; const lim=opt.limit||8, parts=suN1(q).split(' ').filter(Boolean); if(!parts.length)return {list:[],fuzzy:false};
  const I=suIndex(), scope=opt.scope||null, full=suN1(q), full2=suN2(q);
  let hits=[];
  for(const x of I){ if(scope&&!scope(x.p))continue; let s=0, ok=true;
    for(const w of parts){ const v=suPart(x,w); if(!v){ ok=false; break; } s+=v; }
    if(!ok)continue;
    if(x.n1===full||x.n3===full||x.n2===full2)s+=5; else if(x.n1.startsWith(full)||x.n3.startsWith(full))s+=2.5; else if(x.n2.startsWith(full2))s+=1;
    if(x.p.own)s+=1.2; if(x.p.star)s+=0.6; if(x.p.isJugend)s-=0.3;
    hits.push({p:x.p,s}); }
  let fuzzy=false;
  if(!hits.length&&parts[parts.length-1].length>=4){
    const seen=new Set(hits.map(h=>h.p.id)), w=suN2(parts[parts.length-1]), pre=parts.slice(0,-1);
    for(const x of I){ if(seen.has(x.p.id)||(scope&&!scope(x.p)))continue;
      if(pre.some(v=>!suPart(x,v)))continue;
      if(x.w2.some(t=>suLev1(t,w)||(t.length>w.length&&suLev1(t.slice(0,w.length),w)))){ hits.push({p:x.p,s:(x.p.own?1.2:0)+0.2,fz:true}); fuzzy=true; } } }
  // erst nach Treffergüte grob vorsortieren, dann nur die Besten mit der Spielstärke fein sortieren
  hits.sort((a,b)=>b.s-a.s);
  if(opt.noScore)return {list:hits.slice(0,lim),total:hits.length,fuzzy};
  const top=hits.slice(0,Math.max(lim*5,40)); top.forEach(h=>h.m=suScore(h.p));
  top.sort((a,b)=>(b.s-a.s)||(b.m-a.m)||a.p.name.localeCompare(b.p.name,'de'));
  return {list:top.slice(0,lim),total:hits.length,fuzzy};
}
// Treffer im Namen hervorheben (Wortanfänge)
function suMark(name,q){
  const parts=suN1(q).split(' ').filter(Boolean); if(!parts.length)return svEsc(name);
  const n=svNorm(name); if(n.length!==name.length)return svEsc(name);
  const mark=new Array(name.length).fill(false);
  parts.forEach(w=>{ const w2=suN2(w); let re=/[a-z0-9]+/g, m; while((m=re.exec(n))){ const t=m[0];
      if(t.startsWith(w))for(let i=0;i<w.length;i++)mark[m.index+i]=true;
      else if(suN2(t).startsWith(w2)){ let k=0,j=0; while(j<w2.length&&k<t.length){ mark[m.index+k]=true; if(t.slice(k,k+2)===w2[j]+'e'&&'aou'.includes(w2[j])&&w2[j+1]!=='e'){ mark[m.index+k+1]=true; k+=2; } else k++; j++; } } } });
  let out='', on=false; for(let i=0;i<name.length;i++){ if(mark[i]&&!on){ out+='<mark>'; on=true; } if(!mark[i]&&on){ out+='</mark>'; on=false; } out+=svEsc(name[i]); } if(on)out+='</mark>';
  return out;
}
// Zuletzt angesehen
function suRecent(){ if(SU.recent)return SU.recent; try{ SU.recent=JSON.parse(localStorage.getItem('svRecent')||'[]').filter(x=>typeof x==='string').slice(0,8); }catch(e){ SU.recent=[]; } return SU.recent; }
{ const _om19=openModal; openModal=function(id){ const r=_om19.apply(this,arguments);
  try{ if(typeof id==='string'&&players.some(p=>p.id===id)){ const L=suRecent().filter(x=>x!==id); L.unshift(id); SU.recent=L.slice(0,8); try{ localStorage.setItem('svRecent',JSON.stringify(SU.recent)); }catch(e){} } }catch(e){}
  return r; }; }
function suLiga(p){ try{ return typeof svLigaText==='function'?svLigaText(p):((LIGA_NAME&&LIGA_NAME[p.liga])||p.liga||''); }catch(e){ return p.liga||''; } }
function suItem(p,q,i,sel,fz){
  const club=(p.cur&&p.cur.club)||p.club||'', m=suScore(p);
  return `<div class="gi${i===sel?' sel':''}" role="option" aria-selected="${i===sel}" data-i="${i}">${avaHtml(p)}<div style="min-width:0"><b>${q&&!fz?suMark(p.name,q):svEsc(p.name)}${p.own?' <i class="su-own">eigener</i>':''}${p.star?' <i class="su-star">★</i>':''}</b><span>${svEsc(club)}${club?' · ':''}${svEsc(suLiga(p))}${p.pos?' · '+svEsc(svPosTxt(p)):''}${p.alter!=null?' · '+p.alter:''}</span></div><div class="sc">${Math.round(m)}</div></div>`;
}
// Bereiche der App, die die Person öffnen darf, nach Titel, Untertitel und Stichworten
const SU_STICH={kalender:'termine kalender aufgaben planung geburtstag',sponsoring:'partner firmen vertrag rechnung präsentation',helfer:'helfer ehrenamt whatsapp gruppe',
  kasse:'kasse strafe geld beitrag',plakat:'plakat spieltagsstudio story feed',studio:'studio präsentation design',admin:'nutzer rollen einladen rechte',
  play:'wissen playbook hilfe',sptag:'spieltag heimspiel interview',training:'training mannschaft spieler anwesenheit',scout:'scouting spieler suche transfer',kader:'kader planung saison'};
function suBereiche(q){ const n=svNorm(q); if(n.length<2)return [];
  const out=[]; try{ Object.entries(SV_PAGES||{}).forEach(([t,m])=>{ if(!m||!m[0]||!svTabAllowed(t)||!(document.querySelector(`.snav [data-tab="${t}"],[data-sheet="${t}"]`)||document.getElementById('panel-'+t)))return;
    { const nb=document.querySelector(`.snav [data-tab="${t}"]`); if(nb&&nb.style.display==='none')return; }
    const h=svNorm(m[0]+' '+(m[1]||'')+' '+(SU_STICH[t]||'')); if(!n.split(/\s+/).every(w=>h.includes(w)))return;
    if(out.some(o=>o.l===m[0]))return; out.push({t,l:m[0],s:m[1]||'',ic:(typeof SV_TBL!=='undefined'&&SV_TBL[t]&&SV_TBL[t][0])||'grid',prio:svNorm(m[0]).startsWith(n)?0:1}); }); }catch(e){}
  return out.sort((a,b)=>a.prio-b.prio).slice(0,3); }
// Vorschläge an ein Suchfeld hängen
function suAttach(inp,opt){
  if(!inp||inp.dataset.su)return; inp.dataset.su='1'; opt=opt||{};
  inp.setAttribute('autocomplete','off'); inp.setAttribute('role','combobox'); inp.setAttribute('aria-autocomplete','list');
  let pop=opt.pop||null, sel=0, list=[], moved=false;
  if(!pop){ pop=document.createElement('div'); pop.className='gres su-pop'; pop.setAttribute('role','listbox'); document.body.appendChild(pop); }
  const place=()=>{ if(opt.pop)return; const r=inp.getBoundingClientRect(); pop.style.position='fixed'; pop.style.top=(r.bottom+6)+'px'; pop.style.left=Math.max(8,r.left)+'px'; pop.style.width=Math.max(280,Math.min(r.width,innerWidth-16))+'px'; pop.style.right='auto'; };
  const close=()=>{ pop.classList.remove('open'); moved=false; };
  const draw=()=>{
    const q=inp.value.trim();
    if(!q){ const R=opt.recent===false?[]:suRecent().map(id=>players.find(p=>p.id===id)).filter(p=>p&&(!opt.scope||opt.scope(p))).slice(0,6);
      list=R; if(!R.length){ close(); return; }
      pop.innerHTML='<div class="gh">Zuletzt angesehen</div>'+R.map((p,i)=>suItem(p,'',i,moved?sel:-1)).join('');
    } else {
      const t=performance.now(), F=suFind(q,{scope:opt.scope,limit:opt.limit||8,fupa:opt.fupa}); list=F.list.map(x=>x.p); SU.last=performance.now()-t;
      sel=Math.min(sel,Math.max(0,list.length-1));
      pop.innerHTML=list.length?`<div class="gh">${F.fuzzy&&!F.list.some(x=>!x.fz)?'Meintest du':opt.title||'Spieler'}${F.total>list.length?` <small>${F.total} Treffer</small>`:''}</div>`+F.list.map((x,i)=>suItem(x.p,q,i,sel,x.fz)).join('')
        +(opt.more&&F.total>list.length?`<div class="su-more" data-more>Alle ${F.total} Treffer in der Liste zeigen</div>`:'')
        :'<div class="ge">Kein Spieler gefunden. Tippfehler? Schon ein Teil vom Vor- oder Nachnamen reicht.</div>';
    }
    // 0.74: Kopfzeilen-Suche findet auch Bereiche (Termine, Partner, Helfer, Kasse …), nicht nur Spieler
    if(opt.bereiche&&q){ const B=suBereiche(q); if(B.length){ pop.insertAdjacentHTML('afterbegin','<div class="gh">Bereiche</div>'+B.map(b=>`<div class="gi su-ber" role="option" data-tab="${svEsc(b.t)}"><span class="su-ber-ic">${SVI(b.ic)}</span><div style="min-width:0"><b>${svEsc(b.l)}</b><span>${svEsc(b.s)}</span></div></div>`).join(''));
      if(!list.length){ const ge=pop.querySelector('.ge'); if(ge)ge.remove(); } } }
    place(); pop.classList.add('open');
    pop.querySelectorAll('.gi:not(.su-ber)').forEach(g=>g.onmousedown=e=>{ e.preventDefault(); pick(+g.dataset.i); });
    pop.querySelectorAll('.su-ber').forEach(g=>g.onmousedown=e=>{ e.preventDefault(); close(); inp.value=''; inp.blur(); if(opt.onBereich)opt.onBereich(); goTab(g.dataset.tab); });
    const mo=pop.querySelector('[data-more]'); if(mo)mo.onmousedown=e=>{ e.preventDefault(); close(); if(opt.more)opt.more(inp.value); };
  };
  const pick=i=>{ const p=list[i]; if(!p)return; close(); (opt.pick||(p=>{ inp.value=''; inp.blur(); openModal(p.id); }))(p,inp); };
  inp.addEventListener('input',()=>{ sel=0; moved=false; draw(); if(opt.onInput)opt.onInput(inp.value); });
  inp.addEventListener('focus',()=>{ if(opt.focusOpen!==false)draw(); });
  inp.addEventListener('keydown',e=>{
    const open=pop.classList.contains('open');
    if(e.key==='ArrowDown'&&open){ e.preventDefault(); sel=moved?Math.min(sel+1,list.length-1):0; moved=true; draw(); }
    else if(e.key==='ArrowUp'&&open){ e.preventDefault(); sel=Math.max(sel-1,0); moved=true; draw(); }
    else if(e.key==='Enter'){ if(open&&list.length&&(moved||opt.enterPicks)){ e.preventDefault(); pick(moved?sel:0); } else { close(); if(opt.onEnter)opt.onEnter(inp.value); } }
    else if(e.key==='Escape'){ close(); if(opt.onEscape)opt.onEscape(); }
  });
  inp.addEventListener('blur',()=>setTimeout(close,160));
  addEventListener('resize',()=>{ if(pop.classList.contains('open'))place(); });
  document.addEventListener('scroll',()=>{ if(pop.classList.contains('open')&&document.activeElement===inp)place(); else close(); },true);
  return {draw,close};
}

/* ---------- Kopfzeile (⌘K) ---------- */
function svSearchWire(){
  const box=document.getElementById('gSearchBox'), inp=document.getElementById('gSearch'), res=document.getElementById('gRes'); if(!inp)return;
  const shut=()=>{ box.classList.remove('mopen'); };
  suAttach(inp,{pop:res,enterPicks:true,bereiche:true,onBereich:shut,pick:p=>{ inp.value=''; inp.blur(); shut(); openModal(p.id); },onEscape:()=>{ inp.value=''; inp.blur(); shut(); }});
  inp.addEventListener('blur',()=>setTimeout(shut,160));
  document.addEventListener('keydown',e=>{
    if((e.metaKey||e.ctrlKey)&&e.key.toLowerCase()==='k'){ e.preventDefault(); svSearchOpen(); }
    else if(e.key==='/'&&!crmIsTyping()&&!document.getElementById('overlay').classList.contains('open')){ e.preventDefault(); svSearchOpen(); }
  });
}

/* ---------- Spielermarkt: Vorschläge sofort, die große Liste zieht kurz danach nach ---------- */
function suMarkt(){
  const q=document.getElementById('q'); if(!q||q.dataset.su)return;
  let t=null; const apply=v=>{ clearTimeout(t); query=String(v||'').toLowerCase(); renderList(); };
  q.oninput=null;
  suAttach(q,{title:'Spieler',onInput:v=>{ clearTimeout(t); t=setTimeout(()=>apply(v),260); },onEnter:v=>apply(v),more:v=>apply(v),
    pick:p=>{ q.blur(); openModal(p.id); }});
}

/* ---------- Mannschaft → Spieler und Massenpflege: Zeilen sofort filtern, ohne neu zu zeichnen ---------- */
function suRows(inp,rowSel,idOf,after,scope){
  const f=()=>{ const v=inp.value.trim(); const I=v?new Set(suFind(v,{limit:100000,noScore:true,scope}).list.map(x=>x.p.id)):null; let n=0;
    document.querySelectorAll(rowSel).forEach(r=>{ const show=!I||I.has(idOf(r)); r.style.display=show?'':'none'; if(show)n++; }); if(after)after(v,n); };
  return f;
}
{ const _vp19=mnViewPlayers; mnViewPlayers=function(B){ const r=_vp19.apply(this,arguments);
  try{ const qi=B.querySelector('#sp50q'); if(qi){ qi.oninput=null; const rows=suRows(qi,'.mn-sp tr[data-svp]',x=>x.dataset.svp,v=>{ MN.sp.q=v; B.querySelectorAll('.mn-sp .sp50-h').forEach(h=>{ const t=h.nextElementSibling; const n=t?[...t.querySelectorAll('tr[data-svp]')].filter(x=>x.style.display!=='none').length:0; h.style.display=n?'':'none'; const s=h.querySelector('small'); if(s)s.textContent=n; }); },mnIsIntern);
      suAttach(qi,{scope:mnIsIntern,recent:false,focusOpen:false,onInput:rows}); if(qi.value)rows(); } }catch(e){ console.warn('Suche Spielerliste',e); }
  return r; }; }
trViewPlayers=mnViewPlayers;
{ const _pf19=mnViewPflege; mnViewPflege=function(B){ const r=_pf19.apply(this,arguments);
  try{ const qi=B.querySelector('#mpq'); if(qi){ qi.oninput=null; const rows=suRows(qi,'.mp-list .mp-r',x=>x.dataset.mp,v=>{ MN.q=v; },mnIsIntern);
      suAttach(qi,{scope:mnIsIntern,recent:false,focusOpen:false,onInput:rows,pick:p=>{ qi.value=p.name; rows(); const el=B.querySelector(`[data-mp="${CSS.escape(p.id)}"]`); if(el){ el.classList.add('fo'); el.scrollIntoView({behavior:'smooth',block:'center'}); } }}); if(qi.value)rows(); } }catch(e){ console.warn('Suche Massenpflege',e); }
  return r; }; }
MN_VIEWS.pflege=mnViewPflege;
// Spielermarkt-Liste: dieselbe Suche (Umlaute egal) statt „Text kommt vor“
{ const _vis19=visible; visible=function(){ const v=((document.getElementById('q')||{}).value||'').trim(); if(!v||!query)return _vis19.apply(this,arguments);
  const I=new Set(suFind(v,{limit:1e6,noScore:true}).list.map(x=>x.p.id)), sv=query; query=''; let L; try{ L=_vis19.apply(this,arguments); }finally{ query=sv; } return L.filter(p=>I.has(p.id)); }; }

/* ---------- Start ---------- */
{ const _si19=svInit; svInit=function(){ const r=_si19.apply(this,arguments);
  try{ suMarkt(); }catch(e){ console.warn('Suche Spielermarkt',e); }
  // Index im Leerlauf vorbereiten, damit schon der erste Buchstabe sofort kommt
  try{ suWarm(); }catch(e){}
  return r; }; }

// Im Leerlauf: Index bauen, einmal „durchsuchen“ und die Spielstärke aller Spieler vorrechnen (in kleinen Häppchen, blockiert nichts)
function suWarm(){
  const idle=window.requestIdleCallback||(f=>setTimeout(()=>f({timeRemaining:()=>8}),300));
  let i=0;
  const step=d=>{ try{ const I=suIndex(); if(i===0){ suFind('a'); suItem(I[0].p,'a',0,0); }
      while(i<I.length&&(!d||d.timeRemaining()>2)){ suScore(I[i].p); i++; if(!d&&i%200===0)break; }
      if(i<I.length)idle(step); }catch(e){} };
  setTimeout(()=>idle(step),1200);
}
{ const _ra19b=renderAll; renderAll=function(){ const r=_ra19b.apply(this,arguments); try{ clearTimeout(SU.wt); SU.wt=setTimeout(()=>{ try{ suIndex(); }catch(e){} suWarm(); },80); }catch(e){} return r; }; }   // Index gleich nach dem Neuzeichnen wieder aufbauen (eigener Schritt), damit der erste Buchstabe nie warten muss

/* =====================================================================
   Sportzentrale Beta 0.19 · Im Blickfeld und FuPa-Spieler
   - Die Suche kennt jetzt auch alle FuPa-Spieler (Herren) der laufenden und letzten Saison, die noch nicht in der App sind
   - FuPa-Profil: Saisons, Einsätze, Minuten, Tore, Vorlagen, Tabellenplatz des Teams
   - Im Blickfeld: jeder beobachtet seine eigenen Spieler, geordnet vom Torwart bis zum Sturm. Montags kommt ein Wochenbericht
     nur mit den eigenen Spielern (Spiele, Minuten, Tore, Vorlagen oder „kein Einsatz“, Tabellenplatz des Teams)
   ===================================================================== */
const BF={dir:null,dirBusy:false,rep:null,repBusy:false,repT:0};
const BF_POS=[['TW','Torwart'],['IV','Innenverteidigung'],['AV','Außenverteidigung'],['ZM','Zentrales Mittelfeld'],['OM','Offensives Mittelfeld'],['Flügel','Flügel'],['ST','Sturm'],['?','Position offen']];
const bfFollowing=k=>typeof SC2!=='undefined'&&SC2.follow&&SC2.follow.has(k);
async function bfToggle(key,name){
  if(!canScout())return svDenied('Das Blickfeld gibt es für das Scouting-Team.');
  if(typeof SC2!=='undefined'&&!SC2.loaded&&typeof sc2Load==='function')await sc2Load();
  const on=bfFollowing(key);
  try{ if(on){ const {error}=await SVB.sb.from('scout_follow').delete().eq('player_id',key); if(error)throw error; SC2.follow.delete(key); kToast('Aus deinem Blickfeld genommen: '+(name||'Spieler')); }
    else { const {error}=await SVB.sb.from('scout_follow').insert({player_id:key}); if(error)throw error; SC2.follow.add(key); kToast('👁 '+(name||'Spieler')+' ist in deinem Blickfeld. Montags kommt dein Wochenbericht.'); }
    BF.rep=null; try{ svSound('pop'); }catch(e){}
  }catch(e){ kToast('⚠️ '+(e.message||e)); }
  if(svCurTab()==='blick')bfRender();
  return !on;
}

/* ---------- FuPa-Verzeichnis für die Suche ---------- */
async function bfDirLoad(){
  if(BF.dir||BF.dirBusy||!canScout())return; BF.dirBusy=true;
  try{ const {data,error}=await SVB.sb.rpc('kla_spieler_verzeichnis'); if(error)throw error;
    const inApp=new Set(players.map(p=>p.id));
    BF.dir=(data||[]).filter(r=>!(r[10]&&inApp.has(r[10]))).map(r=>({id:'fupa:'+r[0],fid:r[0],name:((r[1]||'')+' '+(r[2]||'')).trim(),club:r[3]||'',liga:r[4]||'',fupa:true,season:r[5],sp:r[6],mi:r[7],t:r[8],v:r[9]}))
      .filter(x=>x.name);
    BF.cur=(data||[]).reduce((m,r)=>r[5]>m?r[5]:m,'');
    SU.idx=null;
  }catch(e){ console.warn('FuPa-Verzeichnis',e); BF.dir=[]; }
  BF.dirBusy=false;
  setTimeout(()=>{ try{ suIndex(); }catch(e){} },50);
}
// Index: App-Spieler und FuPa-Spieler zusammen, FuPa-Spieler nur, wenn die Suche sie will
{ const _ix19=suIndex; suIndex=function(){
  const known=SU.idx&&SU.n===players.length&&SU.nf===(BF.dir?BF.dir.length:-1);
  if(known)return SU.idx;
  SU.idx=null; const I=_ix19.apply(this,arguments).filter(x=>!x.p.fupa);
  (BF.dir||[]).forEach(p=>{ const n1=suN1(p.name), c1=suN1(p.club), n3=suN3(p.name); I.push({p,n1,n2:suN2(p.name),n3,w1:n1.split(' '),w2:suN2(p.name).split(' '),w3:n3.split(' '),c1,c2:suN2(c1)}); });
  SU.idx=I; SU.nf=BF.dir?BF.dir.length:-1; return I; }; }
{ const _sf19=suScore; suScore=function(p){ if(p&&p.fupa)return -1; return _sf19.apply(this,arguments); }; }
{ const _fd19=suFind; suFind=function(q,opt){ opt=Object.assign({},opt||{}); const sc=opt.scope; if(!opt.fupa)opt.scope=p=>!p.fupa&&(!sc||sc(p)); else if(sc)opt.scope=p=>p.fupa||sc(p);
  const R=_fd19.call(this,q,opt);
  if(opt.fupa&&!opt.noScore)R.list.sort((a,b)=>(b.s-a.s)||((a.p.fupa?1:0)-(b.p.fupa?1:0))||((b.m??-1)-(a.m??-1)));
  return R; }; }

/* ---------- Vorschläge: Wappen, Bild, FuPa-Kennzeichen, Blickfeld-Knopf ---------- */
function bfCrest(club){ try{ return typeof scCrest==='function'?scCrest(club,'su-crest'):''; }catch(e){ return ''; } }
suItem=function(p,q,i,sel,fz){
  const club=p.fupa?p.club:((p.cur&&p.cur.club)||p.club||''), liga=p.fupa?(LIGA_NAME[p.liga]||p.liga):suLiga(p), key=p.id, on=bfFollowing(key);
  const stats=p.fupa?`${p.sp||0} Sp. · ${p.t||0} T.${p.season&&BF.cur&&p.season<BF.cur?' ('+p.season.slice(2,4)+'/'+p.season.slice(5)+')':''}`:(p.pos?svEsc(p.pos):'')+(p.alter!=null?' · '+p.alter:'');
  return `<div class="gi${i===sel?' sel':''}${p.fupa?' su-fupa':''}" role="option" aria-selected="${i===sel}" data-i="${i}">${p.fupa?`<div class="ava">${svEsc(svIni(p.name))}</div>`:avaHtml(p)}
    <div style="min-width:0;flex:1"><b>${q&&!fz?suMark(p.name,q):svEsc(p.name)}${p.own?' <i class="su-own">eigener</i>':''}${p.fupa?' <i class="su-fp">nur FuPa</i>':''}</b>
      <span class="su-cl">${bfCrest(club)}${svEsc(club)}${club&&liga?' · ':''}${svEsc(liga||'')}${stats?' · '+stats:''}</span></div>
    ${canScout()?`<button type="button" class="su-eye${on?' on':''}" data-eye="${svEsc(key)}" title="${on?'Aus dem Blickfeld nehmen':'Ins Blickfeld'}" aria-label="${on?'Aus dem Blickfeld nehmen':'Ins Blickfeld'}">${SVI(on?'eye':'eye')}</button>`:''}
    ${p.fupa?'':`<div class="sc">${Math.round(suScore(p))}</div>`}</div>`;
};
// Klick auf das Auge: ins Blickfeld, ohne das Profil zu öffnen
document.addEventListener('mousedown',e=>{ const b=e.target.closest&&e.target.closest('.gres [data-eye]'); if(!b)return; e.preventDefault(); e.stopPropagation();
  const k=b.dataset.eye, it=b.closest('.gi'), nm=it&&it.querySelector('b')?it.querySelector('b').textContent.replace(/(eigener|nur FuPa)/g,'').trim():'';
  bfToggle(k,nm).then(on=>{ b.classList.toggle('on',!!on); b.title=on?'Aus dem Blickfeld nehmen':'Ins Blickfeld'; }); },true);
function bfOpen(p){ if(p&&p.fupa)return bfFupaProfil(p.fid); openModal(p.id); }
// Kopfzeile und Spielermarkt: FuPa-Spieler mit anbieten
{ const _at19=suAttach; suAttach=function(inp,opt){ opt=opt||{};
  if(inp&&(inp.id==='gSearch'||inp.id==='q'||inp.id==='bfq')){ opt=Object.assign({},opt,{fupa:true});
    const pk=opt.pick; if(inp.id!=='bfq')opt.pick=(p,i)=>{ if(p.fupa){ i.value=''; i.blur(); try{ document.getElementById('gSearchBox').classList.remove('mopen'); }catch(e){} return bfFupaProfil(p.fid); } return pk?pk(p,i):(i.value='',i.blur(),openModal(p.id)); }; }
  return _at19.call(this,inp,opt); }; }

/* ---------- FuPa-Profil (Spieler, der noch nicht in der App ist) ---------- */
async function bfFupaProfil(fid){
  const M=svModal(`<div class="mhead"><div class="rm-ic" style="width:46px;height:46px">${SVI('user')}</div><div><h2 style="margin:0">Lade …</h2></div></div>`);
  let P=null; try{ const {data,error}=await SVB.sb.rpc('kla_spieler_profil',{p_fid:+fid}); if(error)throw error; P=data; }catch(e){ M.innerHTML='<p class="note">⚠️ '+svEsc(e.message||e)+'</p>'; return; }
  if(!P){ M.querySelector('h2').textContent='Keine Daten gefunden'; return; }
  if(P.app_id&&players.some(p=>p.id===P.app_id)){ closeOverlay(); return openModal(P.app_id); }
  const key='fupa:'+fid, on=bfFollowing(key), T=P.team, form=(T&&T.form||[]).slice(0,5).map(r=>`<i class="res ${r==='win'?'w':r==='draw'?'d':'l'}">${r==='win'?'S':r==='draw'?'U':'N'}</i>`).join('');
  const S=P.saisons||[], s0=S[0]||{};
  svModal(`<div class="mhead bf-head"><div class="ava bf-ava">${svEsc(svIni(P.name))}</div><div style="min-width:0"><h2 style="margin:0">${svEsc(P.name)}</h2>
      <div class="msub">${bfCrest(P.club)} ${svEsc(P.club||'')} · ${svEsc(LIGA_NAME[P.liga]||P.liga||'')} <i class="su-fp">nur FuPa</i></div></div></div>
    <div class="bf-act"><button type="button" class="btn sm${on?' ghost':''}" id="bfTog">${SVI('eye')} ${on?'Im Blickfeld · entfernen':'Ins Blickfeld'}</button></div>
    <div class="tiles trtiles bf-tiles"><div class="tile"><div class="v">${s0.sp??'–'}</div><div class="l">Spiele ${svEsc(String(s0.season||'').replace(/^20/,''))}</div><div class="s">${s0.mi?s0.mi.toLocaleString('de-DE')+' Min.':'Minuten offen'}</div></div>
      <div class="tile"><div class="v">${s0.t??'–'}</div><div class="l">Tore</div><div class="s">${s0.v??'–'} Vorlagen</div></div>
      ${T&&T.platz?`<div class="tile"><div class="v">${T.platz}.</div><div class="l">Tabellenplatz Team</div><div class="s">${T.vorher&&T.vorher!==T.platz?'vorher '+T.vorher+'. · ':''}${svEsc(T.liga||'')}</div></div>`:''}
      ${form?`<div class="tile"><div class="v mn-form">${form}</div><div class="l">Form des Teams</div><div class="s">letzte Spiele</div></div>`:''}</div>
    <div class="card"><h3 class="trh">${SVI('chart')} Saisons</h3><div class="trtw"><table class="trtab"><thead><tr><th>Saison</th><th>Verein</th><th>Liga</th><th>Sp.</th><th>Min.</th><th>T</th><th>V</th></tr></thead><tbody>
      ${S.map(x=>`<tr><td>${svEsc(x.season)}</td><td>${svEsc(x.club||'')}</td><td>${svEsc(LIGA_NAME[x.liga]||x.liga||'')}</td><td>${x.sp??'–'}</td><td>${x.mi!=null?x.mi.toLocaleString('de-DE'):'–'}</td><td>${x.t??'–'}</td><td>${x.v??'–'}</td></tr>`).join('')}</tbody></table></div>
      <p class="note small">Dieser Spieler ist noch nicht im Datenbestand der App. Die Werte kommen aus FuPa (Herren, alle Teams zusammen), nur für die interne Kaderplanung.</p></div>
    <div class="btnrow sbact"><button class="btn ghost" type="button" onclick="closeOverlay()">Schließen</button></div>`);
  const b=document.getElementById('bfTog'); if(b)b.onclick=async()=>{ const now=await bfToggle(key,P.name); b.className='btn sm'+(now?' ghost':''); b.innerHTML=SVI('eye')+' '+(now?'Im Blickfeld · entfernen':'Ins Blickfeld'); };
}

/* ---------- Profil: Knopf „Ins Blickfeld“ ---------- */
{ const _om19b=openModal; openModal=function(id){ const r=_om19b.apply(this,arguments);
  try{ const M=document.getElementById('modal'), act=M&&M.querySelector('.pf4-act'), p=trP(id);
    if(act&&p&&canScout()&&!act.querySelector('[data-bf]')){ const on=bfFollowing(p.id); act.insertAdjacentHTML('afterbegin',`<button type="button" class="btn sm${on?'':' ghost'}" data-bf>${SVI('eye')} ${on?'Im Blickfeld':'Ins Blickfeld'}</button>`);
      const b=act.querySelector('[data-bf]'); b.onclick=async()=>{ const now=await bfToggle(p.id,p.name); b.className='btn sm'+(now?'':' ghost'); b.innerHTML=SVI('eye')+' '+(now?'Im Blickfeld':'Ins Blickfeld'); }; } }catch(e){ console.warn('Blickfeld-Knopf',e); }
  return r; }; }

/* ---------- Bereich „Im Blickfeld“ ---------- */
SV4_HUB.scouting.tabs.splice(1,0,['blick','Im Blickfeld']);
SV4_OF.blick='scouting';
SV_PAGES.blick=['Scouting','Im Blickfeld: deine Spieler, jede Woche auf dem neuesten Stand'];
{ const _ta19=svTabAllowed; svTabAllowed=function(t){ if(t==='blick')return canScout(); return _ta19.apply(this,arguments); }; }
{ const _gt19=goTab; goTab=function(tab){ const r=_gt19.apply(this,arguments); try{ if(svCurTab()==='blick')bfRender(); }catch(e){ console.warn('Blickfeld',e); } return r; }; }
if(typeof SV50_INFO!=='undefined')SV50_INFO.blick={w:'Deine persönliche Beobachtungsliste, wie „Im Blickfeld“ bei FIFA: nur du siehst sie, jeder im Team hat seine eigene.',
  f:'Montags bekommst du einen Wochenbericht nur zu diesen Spielern: Spiele, Minuten, Tore, Vorlagen oder „kein Einsatz“, dazu der Tabellenplatz seines Teams.',
  h:'Spieler kommen über das Auge in der Suche, im Profil oder hier oben dazu, auch FuPa-Spieler, die noch nicht in der App sind.',
  s:'Oben einen Namen tippen und das Auge antippen. Geordnet vom Torwart bis zum Sturm.',b:['„Diese Woche“ zeigt, was sich seit dem letzten Wochenbericht getan hat.']};
async function bfRepLoad(force){
  if(BF.repBusy||(!force&&BF.rep&&Date.now()-BF.repT<60000))return; BF.repBusy=true;
  try{ const {data,error}=await SVB.sb.rpc('blick_bericht'); if(error)throw error; BF.rep=data||[]; BF.repT=Date.now(); }catch(e){ console.warn('Blickfeld',e); BF.rep=BF.rep||[]; }
  BF.repBusy=false; if(svCurTab()==='blick')bfRender(true);
}
function bfPos(x){ const p=trP(x.key); const pos=(p&&p.pos)||x.pos; return BF_POS.some(([k])=>k===pos)?pos:'?'; }
function bfWoche(x){
  if(x.da===false)return '<span class="bf-w nix">keine FuPa-Daten diese Saison</span>';
  if(x.d_sp==null)return '<span class="bf-w neu">neu im Blickfeld</span>';
  if(x.d_sp>0)return `<span class="bf-w ok">+${x.d_sp} Spiel${x.d_sp>1?'e':''}${x.d_mi>0?` · ${x.d_mi} Min.`:''}${x.d_t>0?` · ⚽ ${x.d_t}`:''}${x.d_v>0?` · 🅰️ ${x.d_v}`:''}</span>`;
  return '<span class="bf-w nix">kein Einsatz</span>';
}
function bfRender(noLoad){
  const P=document.getElementById('panel-blick'); if(!P)return;
  if(!canScout()){ P.innerHTML='<div class="card"><div class="empty">Das Blickfeld gibt es für das Scouting-Team.</div></div>'; return; }
  if(!noLoad)bfRepLoad(); if(!BF.dir)bfDirLoad();
  const L=BF.rep, n=L?L.length:0;
  P.innerHTML=`<div class="card bf-top"><div class="bf-srch">${SVI('search')}<input type="search" id="bfq" placeholder="Spieler suchen und mit dem Auge ins Blickfeld nehmen" autocomplete="off" aria-label="Spieler fürs Blickfeld suchen"></div>
      <p class="note small">${n?`<b>${n}</b> Spieler in deinem Blickfeld. `:''}Montags kommt dein Wochenbericht mit allen Spielern hier. Nur du siehst diese Liste.</p></div>
    ${L==null?'<div class="card"><div class="empty">Lade dein Blickfeld …</div></div>':!n?'<div class="card"><div class="empty">Noch niemand im Blickfeld. Oben einen Namen tippen und auf das Auge drücken, oder im Spielerprofil auf „Ins Blickfeld“.</div></div>'
      :BF_POS.map(([k,t])=>{ const G=L.filter(x=>bfPos(x)===k); if(!G.length)return '';
        return `<div class="bf-grp"><h3 class="trh">${svEsc(t)} <small>${G.length}</small></h3><div class="bf-l">${G.map(x=>{ const p=trP(x.key), T=x.team||{};
          return `<div class="bf-c" data-bfk="${svEsc(x.key)}">${p?avaHtml(p):`<div class="ava">${svEsc(svIni(x.name||'?'))}</div>`}
            <div class="bf-m"><b>${svEsc(x.name||x.key)}${x.key.startsWith('fupa:')?' <i class="su-fp">nur FuPa</i>':''}</b><span>${bfCrest(x.club)}${svEsc(x.club||'?')}${x.liga?' · '+svEsc(LIGA_NAME[x.liga]||x.liga):''}</span>
              <span>${x.da===false?'Saison: keine FuPa-Daten':`Saison ${x.sp??'–'} Sp. · ${x.mi!=null?x.mi.toLocaleString('de-DE')+' Min. · ':''}${x.t??'–'} T. · ${x.v??'–'} V.`}${T.platz?` · Team ${T.platz}. von ${T.teams||'?'}`:''}${x.alt?` · zuletzt ${svEsc(x.alt.season)}: ${x.alt.sp??'–'} Sp.`:''}</span></div>
            <div class="bf-r">${bfWoche(x)}<button type="button" class="lk4 mut" data-bfx="${svEsc(x.key)}" title="Aus dem Blickfeld nehmen">✕</button></div></div>`; }).join('')}</div></div>`; }).join('')}`;
  const q=P.querySelector('#bfq'); if(q)suAttach(q,{title:'Spieler',recent:true,pick:(p,i)=>{ i.value=''; bfToggle(p.id,p.name); }});
  P.querySelectorAll('.bf-c').forEach(c=>c.onclick=e=>{ if(e.target.closest('[data-bfx]'))return; const k=c.dataset.bfk; if(k.startsWith('fupa:'))bfFupaProfil(k.slice(5)); else openModal(k); });
  P.querySelectorAll('[data-bfx]').forEach(b=>b.onclick=async e=>{ e.stopPropagation(); if(!b.classList.contains('sure')){ b.classList.add('sure'); b.textContent='Entfernen?'; return; }
    const x=(BF.rep||[]).find(r=>r.key===b.dataset.bfx); await bfToggle(b.dataset.bfx,x&&x.name); BF.rep=(BF.rep||[]).filter(r=>r.key!==b.dataset.bfx); bfRender(true); bfRepLoad(true); });
}
// Nach dem Start: Verzeichnis im Leerlauf laden
{ const _si19b=svInit; svInit=function(){ const r=_si19b.apply(this,arguments);
  try{ setTimeout(()=>{ if(canScout())bfDirLoad(); },2500); }catch(e){} return r; }; }

/* =====================================================================
   Sportzentrale Beta 0.20 · Qualitätspaket (KLA-Daten)
   - Datenqualität sichtbar: Übertragungsnachweis (currently_verified), Quellenvollständigkeit und App-Abnahme sind drei
     getrennte Tore. Grün gibt es nur für das, was wirklich geprüft ist, nie als Gesamtaussage.
   - Profil: aktuelle Zuordnung der laufenden Saison aus belegter Mannschaftszugehörigkeit (Kader, sonst Einsätze),
     alle Stationen je Mannschaftssaison mit Mannschaft 1/2, erfasste SV/BSC-Einsätze getrennt nach Mannschaft,
     MVP der Quelle, von Hand eingetragener MVP und experimentelles Modell getrennt.
   - Fehlende Werte bleiben „k. A.“ (unbekannt), 0 ist ein belegter Nullwert. Startelf aus Einsätzen minus Einwechslungen ist abgeleitet.
   - Live-Aktualisierung lädt auch Suchverzeichnis, Blickfeld, Qualitätsstatus und offene Profile nach.
   Daten kommen ausschließlich über geschützte RPCs (can_scout). Kein Schlüssel im Browser.
   ===================================================================== */
const SVQ={q:null,qT:0,qLaeuft:null,prof:new Map(),fehler:null};
function svqE(s){ return typeof svEsc==='function'?svEsc(s):String(s==null?'':s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c])); }
// null/undefined = unbekannt, 0 = belegter Nullwert
function svqNv(v,f){ return v==null||v===''?'<i class="svq-na" title="unbekannt: kein Wert in der Quelle">k. A.</i>':(f?f(v):String(v)); }
function svqNum(v){ return svqNv(v,x=>Number(x).toLocaleString('de-DE')); }
function svqS(s){ return String(s||'').replace(/^20(\d\d)-(\d\d)$/,'$1/$2'); }
function svqD(t,mitZeit){ if(!t)return ''; const d=new Date(t); if(isNaN(d))return svqE(t); return mitZeit?d.toLocaleString('de-DE',{day:'2-digit',month:'2-digit',year:'numeric',hour:'2-digit',minute:'2-digit'}):d.toLocaleDateString('de-DE'); }
function svqMannschaft(n){ return n==null?'Mannschaft unbekannt':n+'. Mannschaft'; }
// Liga aus dem Quellen-Slug (auch Ligen außerhalb der Suchauswahl, z. B. Verbandsliga)
function svqLigaCode(l){ l=String(l||''); return /^kla-/.test(l)?'A':/^klb-/.test(l)?'B':/^klc-/.test(l)?'C':/^kld\d?-|^kreisliga-d/.test(l)?'D':/kreisoberliga/.test(l)?'KOL':/gruppenliga/.test(l)?'GL':/verbandsliga/.test(l)?'VL':/hessenliga/.test(l)?'HL':(l?l.split('-')[0].toUpperCase():null); }
const SVQ_REG={'bergstrasse':'Bergstraße','darmstadt':'Darmstadt','darmstadt-grossgerau':'Darmstadt/Groß-Gerau','hessen-sued':'Hessen Süd','hessen-nord':'Hessen Nord','hessen-mitte':'Hessen Mitte','odenwald':'Odenwald','dieburg':'Dieburg','gross-gerau':'Groß-Gerau','offenbach':'Offenbach'};
function svqLigaName(l){ l=String(l||''); if(!l)return 'Liga unbekannt';
  const P=[[/^kla-/,'Kreisliga A'],[/^klb-/,'Kreisliga B'],[/^klc-/,'Kreisliga C'],[/^kld(\d)?-/,'Kreisliga D'],[/^(herren-)?kreisoberliga-/,'Kreisoberliga'],[/^(herren-)?gruppenliga-/,'Gruppenliga'],[/^verbandsliga-/,'Verbandsliga'],[/^hessenliga/,'Hessenliga']];
  for(const [re,t] of P){ const m=re.exec(l); if(m){ const r=l.slice(m[0].length), reg=SVQ_REG[r]||r.replace(/-/g,' ').replace(/\b\w/g,c=>c.toUpperCase()); return (t+' '+reg).trim()+(/^kld\d/.test(l)&&m[1]?' Gruppe '+m[1]:''); } }
  return l.replace(/-/g,' '); }

/* ---------- Qualitätsstatus ---------- */
async function svqLaden(force){
  if(typeof canScout!=='function'||!canScout())return null;
  if(!force&&SVQ.q&&Date.now()-SVQ.qT<120000)return SVQ.q;
  if(SVQ.qLaeuft)return SVQ.qLaeuft;
  SVQ.qLaeuft=(async()=>{ try{ const {data,error}=await SVB.sb.rpc('kla_qualitaet'); if(error)throw error; SVQ.q=data||null; SVQ.fehler=null; }
    catch(e){ SVQ.fehler=String(e&&e.message||e); }   // letzter nutzbarer Stand bleibt stehen, Fehler wird angezeigt
    finally{ SVQ.qT=Date.now(); SVQ.qLaeuft=null; }
    try{ svqBarZeichnen(); }catch(e){} return SVQ.q; })();
  return SVQ.qLaeuft; }
// Drei getrennte Tore. ok nur, wenn wirklich geprüft; Gesamtanzeige wird nie grün, solange Quelle oder App-Abnahme offen sind.
function svqTore(q){
  const d=q&&q.delivery, T=[];
  if(!q){ T.push({k:'status',t:SVQ.fehler?'Qualitätsstatus nicht abrufbar':'Qualitätsstatus lädt',s:SVQ.fehler?'bad':'na',d:SVQ.fehler||''}); return T; }
  if(!d){ T.push({k:'uebertragung',t:'Übertragung: kein Prüfbericht',s:'bad',d:q.delivery_fehler||'Der Server liefert keinen Abgleich (not_checked).'}); }
  else { const st=d.audit_state, ab=(d.missing||0)+(d.data_mismatch||0)+(d.metadata_mismatch||0)+(d.freshness_mismatch||0);
    const txt={verified:'geprüft',changed_since_audit:'seit der Prüfung geändert',stale:'Prüfbericht veraltet',not_checked:'nicht geprüft',incomplete:'unvollständig'}[st]||st||'unbekannt';
    T.push({k:'uebertragung',t:d.currently_verified?'Übertragung aktuell geprüft':'Übertragung: '+txt,s:d.currently_verified&&!ab?'ok':ab?'bad':'warn',
      d:`${d.currently_verified?'Rohdaten vollständig und unverändert in der App (':'Letzter Abgleich '}${svqD(d.last_audit_at,true)}${d.currently_verified?')':''}. ${ab?ab.toLocaleString('de-DE')+' Abweichungen oder fehlende Datensätze.':'0 fehlend, 0 Abweichungen im letzten Bericht.'}`}); }
  T.push({k:'quelle',t:d&&d.source_complete?'Quelle vollständig':'Quelle unvollständig',s:d&&d.source_complete?'ok':'warn',d:(d&&d.source_completeness_note)||'FuPa-Abdeckung ist ein Ausschnitt der vereinbarten Ligen und Spielzeiten.'});
  T.push({k:'app',t:d&&d.ui_verified?'App-Anzeige abgenommen':'App-Anzeige nicht abgenommen',s:d&&d.ui_verified?'ok':'warn',d:'Eigene Prüfung der Anzeige, getrennt vom Übertragungsnachweis.'});
  const k=q.kapazitaet, k0=k; if(k&&k.ueber)T.push({k:'kap',t:'Speichergrenze erreicht',s:'bad',d:`${(k.bytes/1e6).toFixed(1)} von ${(k.grenze/1e6).toFixed(0)} MB: Quellabruf und Nachladen pausieren. Die Grenze hält die Datenbank in den 8 GB des Supabase-Tarifs.`});
  const i=q.import||{}; if(i.lauf_status&&i.lauf_status!=='ok')T.push({k:'import',t:'Letzter Import: '+i.lauf_status,s:'bad',d:(i.lauf_fehler||'')+(i.lauf_start?' · '+svqD(i.lauf_start,true):'')});
  const c=q.checker; if(c){ const P=c.probleme||{}, S=c.stufen||{}, ks=Object.keys(P).filter(k=>S[k]!=='info'&&!(k==='speicher'&&k0&&k0.ueber)), alt=!c.geprueft||Date.now()-new Date(c.geprueft).getTime()>30*60000;
    T.push({k:'checker',t:alt?'Server-Checker steht':ks.length?'Server-Checker: '+ks.length+' Problem'+(ks.length>1?'e':''):'Server-Checker ok',s:alt||ks.some(k=>S[k]==='fehler')?'bad':ks.length?'warn':'ok',
      d:alt?'Letzte Prüfung '+svqD(c.geprueft,true)+'. Sonst prüft er alle 10 Minuten.':ks.length?ks.map(k=>P[k]).join(' '):'Prüft alle 10 Minuten Übertragung, Speicher und Quellabruf, zuletzt '+svqD(c.geprueft,true)+'.'}); }
  const qe=d&&(d.source_queue||[]).find(x=>x.status==='error'); if(qe&&qe.n)T.push({k:'queue',t:qe.n+' Quellenabrufe mit Fehler',s:'warn',d:'Warteschlange der Quelle: '+(d.source_queue||[]).map(x=>x.n+' '+x.status).join(', ')});
  return T; }
function svqGesamt(T){ return T.some(x=>x.s==='bad')?'bad':T.every(x=>x.s==='ok')?'ok':'warn'; }
function svqChips(T,klein){ return T.map(x=>`<span class="svq-chip ${x.s}" title="${svqE(x.d)}">${x.s==='ok'?'✓':x.s==='bad'?'✕':x.s==='na'?'…':'!'} ${svqE(x.t)}</span>`).join(klein?' ':''); }
function svqBarHtml(){ const T=svqTore(SVQ.q), g=svqGesamt(T), d=SVQ.q&&SVQ.q.delivery;
  return `<button type="button" class="svq-bar ${g}" data-svq><span class="svq-l">FuPa-Datenqualität</span>${svqChips(T,true)}${d&&d.last_audit_at?`<span class="svq-t">Prüfung ${svqD(d.last_audit_at,true)}</span>`:''}${SVQ.fehler&&SVQ.q?'<span class="svq-t">⚠ letzter Abruf fehlgeschlagen, zeigt letzten Stand</span>':''}</button>`; }
function svqBarZeichnen(){
  if(typeof canScout!=='function'||!canScout())return;
  const ziele=[document.getElementById('panel-scout'),document.getElementById('panel-blick')].filter(Boolean);
  ziele.forEach(P=>{ let b=P.querySelector(':scope > .svq-wrap'); if(!b){ b=document.createElement('div'); b.className='svq-wrap'; P.prepend(b); }
    b.innerHTML=svqBarHtml(); const k=b.querySelector('[data-svq]'); if(k)k.onclick=()=>svqDetail(); });
  document.querySelectorAll('.svq-prof-q').forEach(el=>{ el.innerHTML=svqChips(svqTore(SVQ.q),true); });
}
function svqCheckerHtml(q){ const c=q&&q.checker; if(!c)return '';
  const B=c.beobachtet||{}, S=c.stufen||{}, Z=c.seit||{}, Q=c.quelle||{}, ks=Object.keys(B), lab={fehler:'Fehler',warnung:'Warnung',info:'Info'};
  return `<div class="svq-chk"><b>Server-Checker</b> <span class="note small">prüft alle 10 Minuten, zuletzt ${svqD(c.geprueft,true)}. Ein Problem zählt ab 15 Minuten Dauer, dann bekommen Admins eine Meldung.</span>
    ${ks.length?`<ul>${ks.map(k=>`<li class="${S[k]==='fehler'?'svq-bad':''}"><b>${lab[S[k]]||'Warnung'}</b> ${svqE(B[k])} <small>seit ${svqD(Z[k],true)}${c.probleme&&c.probleme[k]?'':' (noch in der 15-Minuten-Frist)'}</small></li>`).join('')}</ul>`:'<p class="note small">Keine Probleme.</p>'}
    <p class="note small">Quellabruf: ${svqNum(Q.wartend)} Seiten wartend, ${svqNum(Q.fehler)} ohne Ergebnis, letzter Abruf ${Q.letzter_abruf?svqD(Q.letzter_abruf,true):'unbekannt'}${Q.pausiert?', pausiert wegen Speicher':''}.</p></div>`; }
function svqDetailHtml(){ const q=SVQ.q, d=q&&q.delivery, T=svqTore(q), i=(q&&q.import)||{}, k=q&&q.kapazitaet;
  const arten=d&&d.by_kind?d.by_kind.map(x=>`<tr class="${x.missing||x.data_mismatch||x.metadata_mismatch||x.freshness_mismatch?'svq-bad':''}"><td>${svqE(x.kind)}</td><td>${svqNum(x.expected)}</td><td>${svqNum(x.missing)}</td><td>${svqNum(x.data_mismatch)}</td><td>${svqNum(x.metadata_mismatch)}</td><td>${svqNum(x.freshness_mismatch)}</td></tr>`).join(''):'';
  return `<div class="svq-det">${T.map(x=>`<div class="svq-row ${x.s}"><b>${x.s==='ok'?'✓':x.s==='bad'?'✕':'!'} ${svqE(x.t)}</b><span>${svqE(x.d)}</span></div>`).join('')}
    ${d?`<div class="trtw"><table class="trtab svq-t"><thead><tr><th>Art</th><th>erwartet</th><th>fehlt</th><th>Inhalt</th><th>Metadaten</th><th>Prüfzeit</th></tr></thead><tbody>${arten}</tbody></table></div>
      <p class="note small">Nachweis-Status <b>${svqE(d.audit_state)}</b> · letzter Bericht ${svqD(d.last_audit_at,true)} · App-Cursor ${svqNum(d.app_cursor)} von ${svqNum(d.source_head)} · Epoche ${d.app_epoch&&d.app_epoch===d.dataset_epoch?'gleich':'abweichend oder unbekannt'}.
        „Aktuell geprüft“ gilt nur für die Rohdatenübertragung in die App. Vollständigkeit der FuPa-Quelle und Abnahme der Anzeige sind eigene, offene Punkte.</p>`:''}
    ${svqCheckerHtml(q)}
    <p class="note small">Import: letzter Lauf ${svqE(i.lauf_status||'unbekannt')}${i.lauf_start?' ('+svqD(i.lauf_start,true)+')':''}${i.lauf_fehler?' · Fehler: '+svqE(i.lauf_fehler):''} · letzter Erfolg ${i.letzter_erfolg?svqD(i.letzter_erfolg,true):'unbekannt'}.
      ${k?` Datenbank ${(k.bytes/1e6).toFixed(1)} MB von ${(k.grenze/1e6).toFixed(0)} MB Grenze${k.ueber?': Quellenimport pausiert':''}.`:''} Abgefragt ${q?svqD(q.abgefragt,true):'nie'}${SVQ.fehler?' · letzter Abruf fehlgeschlagen: '+svqE(SVQ.fehler):''}.</p></div>`; }
function svqDetail(){ svModal(`<div class="mhead"><div class="rm-ic" style="width:46px;height:46px">${SVI('db')}</div><div><h2 style="margin:0">FuPa-Datenqualität</h2><div class="msub">Getrennte Prüfungen, keine Gesamtnote</div></div></div>
    <div id="svqDet">${svqDetailHtml()}</div><div class="btnrow sbact"><button class="btn ghost" type="button" id="svqNeu">${SVI('refresh')} Neu abfragen</button><button class="btn" type="button" onclick="closeOverlay()">Schließen</button></div>`);
  const b=document.getElementById('svqNeu'); if(b)b.onclick=async()=>{ b.disabled=true; await svqLaden(true); const x=document.getElementById('svqDet'); if(x)x.innerHTML=svqDetailHtml(); b.disabled=false; }; }

/* ---------- Stationen und aktuelle Zuordnung (Profil) ---------- */
function svqZeile(x){ const kb=x.nur_kader?'nur Kader':x.kader?'Kader belegt':'Statistik';
  return `<tr><td>${svqS(x.saison)}</td><td>${svqE(x.verein||x.mannschaft||'?')}<small>${svqMannschaft(x.squad)}</small></td><td title="${svqE(x.liga||'')}">${svqE(svqLigaName(x.liga))}</td>
    <td>${svqNv(x.sp)}</td><td>${svqNum(x.mi)}</td><td>${svqNv(x.t)}</td><td>${svqNv(x.v)}</td><td><small>${kb}</small></td></tr>`; }
function svqAktuellHtml(P){ const A=P&&P.aktuell, s=svqS(P&&P.saison);
  if(!A||!A.length)return `<div class="svq-akt na"><b>Saison ${s}: unbekannt</b><span>Keine belegte Mannschaftszugehörigkeit in den FuPa-Daten dieser Saison (kein Kader, keine Einsätze). Nichts wird aus Vorjahren übernommen.</span></div>`;
  return `<div class="svq-akt">${A.length>1?`<p class="note small">In ${s} bei ${A.length} Mannschaften erfasst.</p>`:''}${A.map(x=>`<div><b>${svqE(x.verein||'?')} · ${svqMannschaft(x.squad)}</b>
      <span>${svqE(svqLigaName(x.liga))} · Saison ${s} · ${x.kader?'im Kader belegt':'durch Einsätze belegt'}</span>
      <span>${svqNv(x.sp)} Einsätze · ${svqNum(x.mi)} Min. · ${svqNv(x.t)} Tore · ${svqNv(x.v)} Vorlagen${x.startelf_abgeleitet!=null?` · Startelf ${x.startelf_abgeleitet} <small>(abgeleitet: Einsätze minus Einwechslungen)</small>`:''}</span></div>`).join('')}
    ${P.tabelle&&P.tabelle.platz!=null?`<p class="note small">Team: Platz ${P.tabelle.platz}${P.tabelle.teams?' von '+P.tabelle.teams:''} (${svqE(P.tabelle.liga||'')}, Stand ${svqD(P.tabelle.geprueft)})</p>`:''}</div>`; }
function svqMoerlenbachHtml(P,p){ const M=(P&&P.moerlenbach)||[]; let h='';
  if(M.length){ const sum=M.reduce((a,x)=>a+(x.sp||0),0), von=M.map(x=>x.von).sort()[0], bis=M.map(x=>x.bis).sort().pop(), ohne=M.reduce((a,x)=>a+(x.ohne_wert||0),0);
    h+=`<div class="svq-mb">${M.map(x=>`<div><b>${svqMannschaft(x.squad)}</b><span>${svqNv(x.sp)} Einsätze · ${svqNv(x.t)} Tore · ${svqS(x.von)} bis ${svqS(x.bis)} (${x.saisons} Spielzeit${x.saisons>1?'en':''})</span></div>`).join('')}
      ${M.length>1?`<div class="sum"><b>Zusammen</b><span>${sum} Einsätze · ${svqS(von)} bis ${svqS(bis)}</span></div>`:''}</div>
      <p class="note small">Nur identifizierte SV/BSC-Stationen aus FuPa, alle erfassten Wettbewerbe dieser Mannschaftssaisons${ohne?`, ${ohne} Spielzeit${ohne>1?'en':''} ohne Einsatzwert (nicht mitgezählt)`:''}. Keine vollständige Laufbahnbilanz.</p>`; }
  try{ const row=typeof vrTotals==='function'&&p?vrTotals(p.id).row:null;
    if(row)h+=`<p class="note small svq-vs">Vereinsseite: ${row.spiele} Pflichtspiele, ${row.tore} Tore seit 13/14 (Stand ${svqD(row.stand)}), Mannschaften dort nicht getrennt. Eigene Quelle, nicht mit FuPa verrechnet.</p>`; }catch(e){}
  return h; }
function svqMvpHtml(P,p){ const st=(P&&P.stationen)||[], cur=st.find(x=>x.saison===P.saison&&x.mvp!=null), vor=st.find(x=>x.saison!==P.saison&&x.mvp>0);
  let C=null; try{ C=CRM[p&&p.id]; }catch(e){}
  const m=SVQ.q&&SVQ.q.modell;
  return `<div class="svq-mvp">
    <div><b>MVP der Quelle (FuPa)</b><span>${cur?`${cur.mvp===0?'0 (kann „nicht veröffentlicht“ heißen)':cur.mvp} · ${svqS(cur.saison)} · ${svqE(cur.verein||'')}${cur.mvp_stand?' · berechnet '+svqD(cur.mvp_stand):''}`:'für die laufende Saison unbekannt'}${vor?` · zuletzt >0: ${vor.mvp} in ${svqS(vor.saison)}`:''}</span></div>
    <div><b>Von Hand eingetragen</b><span>${C&&typeof C.mv==='number'?`${C.mv}${C.mvd?' · '+svqD(C.mvd):''} (hat im MScore Vorrang)`:'kein Eintrag'}</span></div>
    <div><b>Experimentelles Modell</b><span>${m?`nur als Näherung (experimentell, keine FuPa-Formel, Stichprobe ${m.stichprobe||'?'} Spieler-Saisons, mittlerer Fehler ${m.mittlerer_fehler!=null?String(m.mittlerer_fehler).replace('.',','):'?'} Punkte). Für einzelne Spieler nicht berechnet und nie als FuPa-Wert verwendet.`:'kein Modellstand geladen'}</span></div></div>`; }
function svqProfilHtml(P,p){
  if(!P)return '<p class="note">Lädt die FuPa-Daten …</p>';
  if(P.fehler)return `<p class="note">⚠ FuPa-Daten nicht abrufbar: ${svqE(P.fehler)}. Angezeigt bleibt der letzte Stand der App.</p>`;
  if(P.zugeordnet===false)return '<p class="note">Diesem Spieler ist kein FuPa-Spieler zugeordnet. Werte bleiben unbekannt (keine Nullen).</p>';
  const st=(P.stationen||[]);
  return `<div class="svq-prof"><div class="svq-prof-q">${svqChips(svqTore(SVQ.q),true)}</div>
    <h5>Aktuelle Zuordnung</h5>${svqAktuellHtml(P)}
    ${(P.moerlenbach&&P.moerlenbach.length)||(p&&typeof vrTotals==='function'&&vrTotals(p.id).row)?`<h5>Erfasste Einsätze für den SV/BSC Mörlenbach</h5>${svqMoerlenbachHtml(P,p)}`:''}
    <h5>Stationen laut FuPa <small>je Mannschaft und Saison</small></h5>
    <div class="trtw"><table class="trtab svq-st"><thead><tr><th>Saison</th><th>Verein</th><th>Liga</th><th>Sp.</th><th>Min.</th><th>T</th><th>V</th><th>Beleg</th></tr></thead><tbody>${st.map(svqZeile).join('')}</tbody></table></div>
    <p class="note small">Quelle: FuPa über die KLA-Datenquelle, je Zeile eigene Saison und Mannschaft. „k. A.“ heißt unbekannt, 0 ist ein belegter Wert. ${P.profil&&P.profil.url?`<a href="${svqE(P.profil.url)}" target="_blank" rel="noopener noreferrer">Seite bei FuPa</a> · geprüft ${svqD(P.profil.geprueft)}`:st[0]&&st[0].url?`<a href="${svqE(st[0].url)}" target="_blank" rel="noopener noreferrer">Seite bei FuPa</a> · geprüft ${svqD(st[0].geprueft)}`:''}. ${svqE(P.hinweis||'')}</p></div>`; }
async function svqProfilLaden(pid,force){
  const c=SVQ.prof.get(pid); if(c&&!force&&Date.now()-c.t<300000)return c.P;
  let P; try{ const {data,error}=await SVB.sb.rpc('kla_app_profil',{p_app:pid}); if(error)throw error; P=data||{zugeordnet:false}; }
  catch(e){ P=c&&c.P&&!c.P.fehler?c.P:{fehler:String(e&&e.message||e)}; }
  SVQ.prof.set(pid,{P,t:Date.now()}); return P; }
function svqSektion(M,p){
  const secs=M.querySelector('.pf4-secs'); if(!secs||M.querySelector('.pf4-sec[data-k="fupa"]'))return;
  const d=document.createElement('details'); d.className='pf4-sec'; d.dataset.k='fupa';
  const offen=typeof PF4!=='undefined'&&PF4.open&&PF4.open.has('fupa'); if(offen)d.open=true;
  const abg=()=>typeof svAbgleich==='function'?`<div class="svq-abg"><button type="button" class="btn sm ghost abg-pf" data-abg="${svqE(p.id)}">${typeof KLAW!=='undefined'&&KLAW.by&&KLAW.by[p.id]?'Zuordnung prüfen':'FuPa-Spieler zuordnen'}</button></div>`:'';
  d.innerHTML=`<summary><span>FuPa-Stationen & Datenlage</span><em class="svq-sum"></em></summary><div class="pf4-b"><div id="svqProf">${svqProfilHtml(null,p)}</div>${abg()}</div>`;
  d.addEventListener('toggle',()=>{ try{ if(d.open)PF4.open.add('fupa'); else PF4.open.delete('fupa'); }catch(e){} });
  const stat=secs.querySelector('.pf4-sec[data-k="stat"]'); if(stat)stat.after(d); else secs.prepend(d);
  svqProfilLaden(p.id).then(P=>{ if(!M.contains(d)||M.dataset.pid!==p.id)return; d.querySelector('#svqProf').innerHTML=svqProfilHtml(P,p);
    const ab=d.querySelector('.svq-abg button'); if(ab&&P)ab.textContent=P.zugeordnet===false?'FuPa-Spieler zuordnen':'Zuordnung prüfen';
    const A=P&&P.aktuell; const sum=d.querySelector('.svq-sum'); if(sum)sum.textContent=A&&A.length?A.map(x=>svqLigaCode(x.liga)).join(' / ')+' '+svqS(P.saison):P&&P.zugeordnet===false?'nicht zugeordnet':'aktuell unbekannt'; });
  if(!SVQ.q)svqLaden().then(()=>{ const q=M.querySelector('.svq-prof-q'); if(q)q.innerHTML=svqChips(svqTore(SVQ.q),true); });
}
{ const _omQ=openModal; openModal=function(id){ const r=_omQ.apply(this,arguments);
  try{ const M=document.getElementById('modal'), p=typeof trP==='function'?trP(id):null; if(M&&p&&!p.isJugend&&typeof canScout==='function'&&canScout())svqSektion(M,p); }catch(e){ console.warn('FuPa-Sektion',e); }
  return r; }; }
// alte Tabelle „Zahlen von FuPa“ (Saison zusammengefasst, Verein nach meisten Minuten) ersetzt durch die Stationen oben
if(typeof klaProfilHtml==='function')klaProfilHtml=function(){ return ''; };

/* ---------- FuPa-Profil (Spieler noch nicht in der App) ---------- */
if(typeof bfFupaProfil==='function'){ bfFupaProfil=async function(fid){
  const M=svModal(`<div class="mhead"><div class="rm-ic" style="width:46px;height:46px">${SVI('user')}</div><div><h2 style="margin:0">Lade …</h2></div></div>`);
  let P=null; try{ const {data,error}=await SVB.sb.rpc('kla_spieler_profil',{p_fid:+fid}); if(error)throw error; P=data; }catch(e){ M.innerHTML='<p class="note">⚠️ '+svqE(e.message||e)+'</p>'; return; }
  if(!P){ M.querySelector('h2').textContent='Keine Daten gefunden'; return; }
  if(P.app_id&&players.some(p=>p.id===P.app_id)){ closeOverlay(); return openModal(P.app_id); }
  const key='fupa:'+fid, on=typeof bfFollowing==='function'&&bfFollowing(key), A=P.aktuell||[];
  const kopf=A.length?A.map(x=>`${svqE(x.verein||'?')} (${svqMannschaft(x.squad)}) · ${svqE(svqLigaName(x.liga))}`).join(' / ')+' · '+svqS(P.saison):`Saison ${svqS(P.saison)}: aktuelle Mannschaft unbekannt`;
  if(!SVQ.q)await svqLaden();
  svModal(`<div class="mhead bf-head"><div class="ava bf-ava">${svqE(svIni(P.name||'?'))}</div><div style="min-width:0"><h2 style="margin:0">${svqE(P.name||'')}</h2>
      <div class="msub">${A.length&&typeof bfCrest==='function'?bfCrest(A[0].verein):''} ${kopf} <i class="su-fp">nur FuPa</i></div></div></div>
    <div class="bf-act"><button type="button" class="btn sm${on?' ghost':''}" id="bfTog">${SVI('eye')} ${on?'Im Blickfeld · entfernen':'Ins Blickfeld'}</button></div>
    <div class="card">${svqProfilHtml(P,null)}<p class="note small">Dieser Spieler ist noch nicht im Datenbestand der App. Nur für die interne Kaderplanung.</p></div>
    <div class="btnrow sbact"><button class="btn ghost" type="button" onclick="closeOverlay()">Schließen</button></div>`);
  const b=document.getElementById('bfTog'); if(b)b.onclick=async()=>{ const now=await bfToggle(key,P.name); b.className='btn sm'+(now?' ghost':''); b.innerHTML=SVI('eye')+' '+(now?'Im Blickfeld · entfernen':'Ins Blickfeld'); };
}; }

/* ---------- Liga-Abzeichen in Listen: Liga der laufenden Saison, sonst mit Saison gekennzeichnet ---------- */
if(typeof badges==='function'){ const _bdQ=badges; badges=function(p){ let h=_bdQ.apply(this,arguments);
  try{ if(!p||p.isJugend||typeof svLigaJetzt!=='function')return h; const L=svLigaJetzt(p); if(!L)return h;
    const neu=L.jetzt?`<span class="badge b-${svqE(L.liga)}" title="Liga ${svqS(svSaisonCur())} (${svqE(L.quelle)})">${L.liga==='KOL'||L.liga==='GL'||L.liga==='VL'?svqE(L.liga):svqE(L.liga)+'-Klasse'}</span>`
      :`<span class="badge b-${svqE(p.liga)} svq-alt" title="Aktuelle Liga unbekannt, Stand 25/26">25/26 · ${svqE(p.liga)}</span>`;
    h=h.replace(/^<span class="badge b-[^"]*">[^<]*<\/span>/,neu); }catch(e){}
  return h; }; }

/* ---------- MVP: Herkunft mitgeben ---------- */
if(typeof mvpOf==='function'){ const _mQ=mvpOf; mvpOf=function(p){ const m=_mQ.apply(this,arguments); if(!m)return m;
  return Object.assign({},m,{txt:m.src==='app'?'MVP von Hand eingetragen':m.src==='fupa'?'MVP der Quelle (FuPa'+(m.saison?', '+svqS(m.saison):'')+')':'MVP aus FuPa-Export (Stand '+(m.d||'?')+')'}); }; }

/* ---------- Live-Aktualisierung: alle betroffenen Speicher nachladen ---------- */
if(typeof svDatenNeuLadenKern==='function'){ const _nlQ=svDatenNeuLadenKern; svDatenNeuLadenKern=async function(){
  const vor=[SVP.stand,SVP.werte,SVP.cursor].join('#');
  const r=await _nlQ.apply(this,arguments);
  const nach=[SVP.stand,SVP.werte,SVP.cursor].join('#');
  try{ svqLaden(true); }catch(e){}
  if(vor!==nach&&SVP.n>1){
    SVQ.prof.clear();
    try{ if(typeof BF!=='undefined'){ BF.dir=null; if(typeof SU!=='undefined')SU.idx=null; if(canScout())bfDirLoad(); if(document.querySelector('#panel-blick.active')&&typeof bfRender==='function')bfRender(); } }catch(e){}
    try{ const M=document.getElementById('modal'), d=M&&M.querySelector('.pf4-sec[data-k="fupa"]'), p=M&&typeof trP==='function'&&trP(M.dataset.pid);
      if(d&&p){ const P=await svqProfilLaden(p.id,true); const b=d.querySelector('#svqProf'); if(b&&M.dataset.pid===p.id)b.innerHTML=svqProfilHtml(P,p); } }catch(e){}
  }
  return r; }; }

/* ---------- Start und Anzeige ---------- */
{ const _gtQ=goTab; goTab=function(t){ const r=_gtQ.apply(this,arguments); try{ if(t==='scout'||t==='blick'){ svqBarZeichnen(); svqLaden(); } }catch(e){} return r; }; }
{ let t=0; const iv=setInterval(()=>{ if(++t>240)return clearInterval(iv); if(typeof SVU!=='undefined'&&SVU&&SVU.role&&typeof _remoteDone!=='undefined'&&_remoteDone){ clearInterval(iv); if(canScout())svqLaden(true); } },500); }
setInterval(()=>{ try{ if(document.visibilityState==='visible'&&canScout())svqLaden(true); }catch(e){} },10*60*1000);
// Importstatus (Admin): Qualitätsblock oben
if(typeof impCard==='function'){ const _icQ=impCard; impCard=function(P){ const r=_icQ.apply(this,arguments);
  try{ const el=P.querySelector('#svImport'); if(el&&!el.querySelector('.svq-imp')){ const d=document.createElement('div'); d.className='svq-imp'; d.innerHTML=`<h4>FuPa-Datenqualität</h4>${svqDetailHtml()}`;
      const h=el.querySelector('.adm-head'); if(h)h.after(d); else el.prepend(d);
      svqLaden(true).then(()=>{ d.innerHTML=`<h4>FuPa-Datenqualität</h4>${svqDetailHtml()}`; }); } }catch(e){}
  return r; }; }

/* =====================================================================
   Sportzentrale Beta 0.21 · Push öffnet genau die Nachricht
   - Jede Push-Nachricht liegt als Meldung in der Datenbank (nur für den Empfänger lesbar) und trägt ihr Ziel: #meldung=<id>[,<id>…]
   - Tipp auf die Push-Nachricht: die App öffnet genau diese Nachricht mit vollem Text und dem, worum es geht
     (Radar-Tipps und Talente mit Profil, Spieltag-Update mit Spieler, fertiger KI-Auftrag, Co-Trainer-Hinweise, Kandidaten, Checker)
   - Das Ziel kommt auf drei Wegen an, damit es auch am iPhone nicht verloren geht: Adresse (#…), Nachricht vom Service Worker
     an die offene App und ein kurzer Merkzettel im Cache, den die App beim Start oder beim Zurückkehren abholt.
   ===================================================================== */
const SVZ={offen:null, cache:'svbc-ziel', key:'./__ziel'};
function svzParse(h){ h=String(h||'').replace(/^#/,''); const m=/^meldung=([\d,]{1,200})$/.exec(h);
  if(m){ const ids=m[1].split(',').map(Number).filter(x=>x>0).slice(0,20); return ids.length?{ids}:null; }
  return /^[a-z]+$/.test(h)?{tab:h}:null; }
async function svzMerkzettel(){ // vom Service Worker abgelegt (max. 10 Minuten alt), einmal abholen
  try{ if(!('caches' in window))return null; const c=await caches.open(SVZ.cache); const r=await c.match(SVZ.key); if(!r)return null; await c.delete(SVZ.key);
    const j=await r.json(); return j&&j.ziel&&Date.now()-(+j.t||0)<600000?j.ziel:null; }catch(e){ return null; } }
function svzBereit(){ return typeof SVB!=='undefined'&&SVB.sb&&typeof SVU!=='undefined'&&SVU&&SVU.id&&typeof _remoteDone!=='undefined'&&_remoteDone; }
async function svZiel(h,quelle){
  const z=svzParse(h); if(!z)return false;
  const t0=Date.now(); while(!svzBereit()&&Date.now()-t0<45000)await new Promise(r=>setTimeout(r,250));
  if(!svzBereit())return false;
  if(z.tab){ try{ if(z.tab==='kandidaten'&&typeof svMyCands==='function'&&svMyCands().length)kandFP='__me'; goTab(z.tab); }catch(e){} return true; }
  const k=z.ids.join(','); if(SVZ.laeuft===k||(SVZ.offen===k&&document.querySelector('#overlay.open .svz')))return true;
  SVZ.laeuft=k; try{ await svMeldungZeigen(z.ids); }finally{ SVZ.laeuft=null; } return true; }
async function svzPruefen(){ // beim Start, beim Zurückkehren in die App
  let h=(location.hash||'').slice(1);
  if(/^(meldung|frage)=/.test(h)){ try{ history.replaceState(history.state,'',location.pathname+location.search); }catch(e){} await svzMerkzettel(); return svZiel(h,'adresse'); }
  const m=await svzMerkzettel(); if(m)return svZiel(m,'merkzettel'); return false; }

const SVZ_ART={scout_update:['⚽','Spieltag-Update'],scout_job:['🔎','KI-Auftrag'],radar:['📡','Radar'],training:['🧠','Co-Trainer'],kontakte:['📞','Kandidaten'],
  brief:['🗓️','Wochen-Briefing'],admin:['🔒','Admin'],system:['🩺','Server-Checker'],kasse:['💶','Kasse']};
function svzZeit(t){ try{ return new Date(t).toLocaleString('de-DE',{weekday:'short',day:'2-digit',month:'2-digit',hour:'2-digit',minute:'2-digit'})+' Uhr'; }catch(e){ return ''; } }
function svzSpieler(id,txt){ const p=typeof trP==='function'&&trP(id); if(!p)return '';
  return `<div class="tra l-info svz-sp" data-svzp="${svEsc(p.id)}"><span class="tra-av">${avaHtml(p)}</span><div class="tra-b"><b>${svEsc(p.name)}</b><span>${svEsc(txt||[p.pos,p.club].filter(Boolean).join(' · '))}</span></div><button class="btn sm ghost" type="button">Profil</button></div>`; }
async function svzInhalt(m){ const d=m.data||{}; let h='', knopf='', ohneText=false;
  if(m.art==='radar'&&Array.isArray(d.radar)&&d.radar.length){
    let R=[]; try{ const {data}=await SVB.sb.from('radar').select('id,key,stand,typ,lvl,player_id,club_key,titel,detail,data,created_at').in('id',d.radar.slice(0,60)); R=data||[]; }catch(e){}
    const pos=new Map(d.radar.map((x,i)=>[String(x),i])); R.sort((a,b)=>(pos.get(String(a.id))??99)-(pos.get(String(b.id))??99));
    if(R.length){ ohneText=true; h+=`<div class="svz-liste">${R.map(r=>typeof rdItem==='function'?rdItem(r):`<div class="tra"><div class="tra-b"><b>${svEsc(r.titel)}</b><span>${svEsc(r.detail||'')}</span></div></div>`).join('')}</div>`; }
    knopf=`<button class="btn ghost" type="button" data-svzgo="radar">${SVI('radar')} Ganzes Radar</button>`; }
  else if(m.art==='kontakte'&&Array.isArray(d.spieler)){ h+=`<div class="svz-liste">${d.spieler.slice(0,20).map(x=>svzSpieler(x.id||x,x.why||'')).join('')}</div>`; knopf=`<button class="btn ghost" type="button" data-svzgo="kandidaten">${SVI('users')} Meine Kandidaten</button>`; }
  else if(m.art==='training'){ knopf=`<button class="btn ghost" type="button" data-svzgo="training">${SVI('activity')} Zum Training</button>`; }
  else if(m.art==='scout_job'&&d.job){ knopf=`<button class="btn" type="button" data-svzjob="${svEsc(d.job)}">${SVI('search')} Ergebnis ansehen</button>`; }
  else if(m.art==='system'&&d.quelle==='checker'){ knopf=typeof canScout==='function'&&canScout()?`<button class="btn ghost" type="button" data-svzq>${SVI('db')} Datenqualität</button>`:''; }
  else if(m.art==='admin'){ knopf=`<button class="btn ghost" type="button" data-svzgo="admin">${SVI('shield')} Adminbereich</button>`; }
  if(m.player_id)h+=svzSpieler(m.player_id);
  return {h,knopf,ohneText}; }
async function svMeldungZeigen(ids){
  let M=[]; try{ const {data,error}=await SVB.sb.from('meldungen').select('*').in('id',ids); if(error)throw error; M=data||[]; }catch(e){ M=null; }
  if(M===null){ if(typeof kToast==='function')kToast('Die Nachricht lässt sich gerade nicht laden. Bitte gleich nochmal.'); return; }
  if(!M.length){ if(typeof kToast==='function')kToast('Diese Nachricht gibt es nicht mehr.'); return; }
  const pos=new Map(ids.map((x,i)=>[x,i])); M.sort((a,b)=>(pos.get(a.id)??99)-(pos.get(b.id)??99));
  const teile=[]; for(const m of M){ const [ic,lab]=SVZ_ART[m.art]||['🔔','Meldung']; const x=await svzInhalt(m);
    teile.push(`<section class="svz-m" data-svzm="${m.id}"><div class="svz-kopf"><span class="svz-ic">${ic}</span><div><b>${svEsc(m.titel)}</b><small>${svEsc(lab)} · ${svzZeit(m.created_at)}</small></div></div>
      ${m.text&&!x.ohneText?`<p class="svz-text">${svEsc(m.text)}</p>`:''}${x.h}${x.knopf?`<div class="btnrow">${x.knopf}</div>`:''}</section>`); }
  SVZ.offen=ids.join(',');
  svModal(`<div class="svz"><div class="mhead"><div class="rm-ic" style="width:46px;height:46px">${SVI('bell')}</div><div><h2 style="margin:0">${M.length>1?M.length+' Nachrichten':'Deine Nachricht'}</h2><div class="msub">Genau das, was als Push-Nachricht kam</div></div></div>
    ${teile.join('')}<div class="btnrow sbact"><button class="btn" type="button" onclick="closeOverlay()">Schließen</button></div></div>`);
  const W=document.querySelector('#modal .svz'); if(W){
    W.querySelectorAll('[data-svp],[data-svzp]').forEach(x=>x.onclick=e=>{ e.stopPropagation(); const id=x.dataset.svp||x.dataset.svzp; closeOverlay(); setTimeout(()=>openModal(id),60); });
    W.querySelectorAll('[data-svzgo]').forEach(b=>b.onclick=()=>{ closeOverlay(); const t=b.dataset.svzgo; if(t==='kandidaten'&&typeof svMyCands==='function'&&svMyCands().length)kandFP='__me'; goTab(t); });
    W.querySelectorAll('[data-svzjob]').forEach(b=>b.onclick=()=>{ closeOverlay(); setTimeout(()=>sc2JobView(b.dataset.svzjob),60); });
    W.querySelectorAll('[data-svzq]').forEach(b=>b.onclick=()=>{ closeOverlay(); setTimeout(()=>svqDetail(),60); });
    W.querySelectorAll('[data-star]').forEach(b=>b.onclick=e=>{ e.stopPropagation(); const p=trP(b.dataset.star); if(!p)return; const on=!p.star; crmSet(p.id,{f:on?1:undefined}); try{crmApply();}catch(x){} b.classList.toggle('on',on); if(typeof kToast==='function')kToast(on?'⭐ '+p.name+' auf der Merkliste':'Von der Merkliste genommen'); });
  }
  const neu=M.filter(m=>!m.gelesen_at).map(m=>m.id);
  if(neu.length){ try{ await SVB.sb.rpc('meldungen_gelesen',{p_ids:neu}); }catch(e){}
    try{ if(typeof SC2!=='undefined'&&SC2.meld)SC2.meld.forEach(m=>{ if(neu.includes(m.id))m.gelesen_at=new Date().toISOString(); }); if(typeof sc2After==='function')sc2After(); }catch(e){} try{ svBadges(); }catch(e){} } }

// Anschluss: Service Worker schickt das Ziel an die offene App; beim Start und beim Zurückkehren Merkzettel abholen
if(navigator.serviceWorker)navigator.serviceWorker.addEventListener('message',e=>{ const t=e.data&&e.data.svbcZiel; if(typeof t==='string'&&/^(meldung|frage)=/.test(t)){ svzMerkzettel(); svZiel(t,'sw'); } });
document.addEventListener('visibilitychange',()=>{ if(document.visibilityState==='visible')setTimeout(svzPruefen,150); });
// Ziel per Adresse, während die App offen ist (z. B. Link): vor der Zurück-Logik abfangen, damit sie nicht als „Zurück“ zählt
window.addEventListener('popstate',e=>{ if(e.state)return; const h=location.hash;   // nur fremde Adresswechsel, nicht die eigenen Verlaufseinträge
  if(/^#(meldung|frage)=/.test(h)){ if(typeof SVH!=='undefined'&&SVH.ready)SVH.ignore++; svzPruefen(); }
  else if(/^#[a-z]+$/.test(h)&&document.getElementById('panel-'+h.slice(1))){ if(typeof SVH!=='undefined'&&SVH.ready)SVH.ignore++; svZiel(h.slice(1),'adresse'); } });
window.addEventListener('hashchange',e=>{ let h=''; try{ h=new URL(e.newURL).hash; }catch(x){} if(/^#(meldung|frage)=/.test(h)){ try{ history.replaceState(history.state,'',location.pathname+location.search); }catch(x){} svZiel(h,'adresse'); } });
setTimeout(svzPruefen,50);

/* =====================================================================
   Sportzentrale Beta 0.22 · Mannschaft und Spielerprofil (Änderungswünsche aus dem Trainerteam)
   Teil A: Erklärungen zu Spalten und Kennzahlen, Tab „Kennzahlen“, Suchfelder, Fotos in der Spielerliste,
           „2. POS“, Saison-Album raus aus Spiele, Verletzung mit vier Angaben, Massenpflege-Reihenfolge ohne „Schwacher Fuß“,
           Spielerprofil ohne Umdrehen, ohne Hinweisblöcke, ohne „Gespräch“ und ohne „Ins Blickfeld“ bei eigenen Spielern
   ===================================================================== */

/* ---------- 1.1 Kennzahlen und Spalten: eine zentrale Beschreibung ---------- */
// g = Bereich, l = Spaltenköpfe, unter denen die Kennzahl in Tabellen steht, k = kurz (beim Überfahren), d = ausführlich (Tab „Kennzahlen“)
const SVM_KPI=[
  {g:'Spielerübersicht',l:['Spieler'],t:'Spieler',k:'Name des Spielers. Antippen öffnet das Profil.',d:'Alle internen Spieler: 1. und 2. Mannschaft, A-Jugend und „Keine Mannschaft, aber Pass“. Die Zahl am Namen zeigt, wie viele Angaben noch fehlen.'},
  {g:'Spielerübersicht',l:['Pos'],t:'Position',k:'Hauptposition des Spielers.',d:'Die Position, auf der er am häufigsten spielt. Gepflegt in der Massenpflege unter „Position“. Daraus ergibt sich auch der Mannschaftsteil.'},
  {g:'Spielerübersicht',l:['2. POS'],t:'2. Position',k:'Weitere Positionen, die er spielen kann.',d:'Nebenpositionen, auf denen er schon gespielt hat oder die er sicher kann. Hilft bei Ausfällen und in der Aufstellung.'},
  {g:'Spielerübersicht',l:['Mannschaftsteil','Teil'],t:'Mannschaftsteil',k:'Torwart, Abwehr, Mittelfeld oder Sturm, passend zur Hauptposition.',d:'Grobe Einteilung wie bei FuPa. Folgt immer der Hauptposition und bestimmt, welche Leistungswerte im MScore zählen (Tore vorne, Gegentore hinten).'},
  {g:'Spielerübersicht',l:['Mannschaft'],t:'Mannschaft',k:'Stammmannschaft in dieser Saison (I, II, A), dahinter eine Zweitmannschaft.',d:'Aus der Kaderplanung der laufenden Saison. „Keine Mannschaft, aber Pass“: hat einen Spielerpass, spielt aber nicht regelmäßig. „Extern“: spielt inzwischen woanders.'},
  {g:'Spielerübersicht',l:['Alter'],t:'Alter',k:'Alter in Jahren, „~“ = geschätzt.',d:'Aus dem Geburtsdatum. Ohne Geburtsdatum stammt das Alter aus FuPa oder einer Schätzung und ist mit „~“ markiert.'},
  {g:'Spielerübersicht',l:['Geburtsdatum'],t:'Geburtsdatum',k:'Geburtsdatum, wenn gepflegt.',d:'Nur für interne Spieler, gepflegt in der Massenpflege.'},
  {g:'Spielerübersicht',l:['Fuß'],t:'Starker Fuß',k:'Rechts, Links oder Beidfüßig.',d:'Der stärkere Fuß. Gepflegt in der Massenpflege unter „Starker Fuß“.'},
  {g:'Spielerübersicht',l:['Größe'],t:'Größe',k:'Körpergröße in cm.',d:'Gepflegt in der Massenpflege.'},
  {g:'Spielerübersicht',l:['Gewicht'],t:'Gewicht',k:'Körpergewicht in kg.',d:'Gepflegt in der Massenpflege.'},
  {g:'Training',l:['Beteiligung'],t:'Trainingsbeteiligung',k:'Anteil der Trainings dieser Saison, bei denen er da war.',d:'Da geteilt durch alle Trainings seit Saisonstart. Verletzt, krank und „in der Zweiten“ zählen nicht dagegen. Die kleine Zahl zeigt, wie viele Trainings erfasst sind.'},
  {g:'Training',l:['4 Wochen'],t:'Beteiligung 4 Wochen',k:'Trainingsbeteiligung der letzten vier Wochen.',d:'Wie „Beteiligung“, aber nur die letzten 28 Tage. Zeigt, ob jemand gerade nachlässt oder anzieht.'},
  {g:'Training',l:['Ø Eindruck','Ø Note'],t:'Eindruck im Training',k:'Wie oft positiv, neutral oder negativ im Training.',d:'Der Trainer bewertet jeden Spieler im Training mit Positiv, Neutral oder Negativ. Gezeigt wird der Schnitt der echten Bewertungen dieser Saison, ohne automatisch gesetzte Werte.'},
  {g:'Training',l:['Letzte Noten','Letzte Eindrücke'],t:'Letzte Eindrücke',k:'Die letzten Bewertungen im Training, neueste links.',d:'Zeigt den Verlauf der letzten Einheiten.'},
  {g:'Training',l:['Ohne Grund'],t:'Ohne Grund gefehlt',k:'Wie oft er ohne Abmeldung oder Grund gefehlt hat.',d:'Unentschuldigtes Fehlen in dieser Saison. Zählt voll gegen die Beteiligung.'},
  {g:'Training',l:['Zuletzt da'],t:'Zuletzt da',k:'Datum des letzten Trainings, bei dem er da war.',d:'Hilft, lange Abwesenheiten schnell zu sehen.'},
  {g:'Training',l:['Status'],t:'Status',k:'Verfügbar, verletzt oder abwesend.',d:'Heutiger Stand aus Verletzungen und Abwesenheiten.'},
  {g:'Spiele',l:['Einsätze'],t:'Einsätze',k:'Spiele mit Einsatz: Startelf plus Einwechslungen.',d:'Zählt alle Pflichtspiele der laufenden Saison, in denen er gespielt hat. In Klammern die Startelf-Einsätze.'},
  {g:'Spiele',l:['Startelf','S11'],t:'Startelf',k:'Spiele, in denen er von Beginn an gespielt hat.',d:'Aus dem Eintrag in der App, sonst aus dem FuPa-Spielbericht, sonst aus fussball.de.'},
  {g:'Spiele',l:['Einw.','Eingewechselt'],t:'Eingewechselt',k:'Spiele, in denen er eingewechselt wurde.',d:'Aus dem Eintrag in der App, sonst aus dem Spielbericht.'},
  {g:'Spiele',l:['Kader'],t:'Kader',k:'Im Aufgebot, aber nicht eingesetzt (Bank).',d:'Stand im Spielberichtsbogen, kam aber nicht zum Einsatz. In der Einsatztabelle zählt „Kader %“, in wie vielen Spielen er insgesamt im Aufgebot war.'},
  {g:'Spiele',l:['Kader %'],t:'Kaderquote',k:'Anteil der Spiele, in denen er im Aufgebot war.',d:'Startelf, Einwechslung oder Bank geteilt durch alle Spiele der Saison.'},
  {g:'Spiele',l:['Zugeschaut'],t:'Zugeschaut',k:'War beim Spiel, aber nicht im Aufgebot.',d:'Spieler, die nicht im Kader standen, bekommen zunächst „Zugeschaut“, bis der Trainer etwas anderes einträgt.'},
  {g:'Spiele',l:['Nicht da'],t:'Nicht da',k:'War beim Spiel nicht dabei, mit Grund wenn bekannt.',d:'Urlaub, Arbeit, verletzt und so weiter. Der Grund steht klein darunter.'},
  {g:'Spiele',l:['Min.','Minuten'],t:'Minuten',k:'Gespielte Minuten, „~“ = nicht für jedes Spiel erfasst.',d:'Aus dem Spielbericht oder dem Eintrag in der App. Fehlen für einzelne Spiele Minuten, steht ein „~“ dahinter.'},
  {g:'Spiele',l:['Tore'],t:'Tore',k:'Tore in dieser Saison.',d:'Pflichtspiele der laufenden Saison.'},
  {g:'Spiele',l:['Vorl.','Vorlagen'],t:'Vorlagen',k:'Torvorlagen in dieser Saison.',d:'Soweit im Spielbericht oder in der App erfasst.'},
  {g:'Spiele',l:['T / V'],t:'Tore / Vorlagen',k:'Tore und Vorlagen dieser Saison.',d:'Erst die Tore, dann die Vorlagen.'},
  {g:'Spiele',l:['Scorer'],t:'Scorerpunkte',k:'Tore plus Vorlagen.',d:'Einfacher Offensivwert.'},
  {g:'Spiele',l:['Min./Scorer'],t:'Minuten je Scorerpunkt',k:'Wie viele Minuten er im Schnitt für einen Scorerpunkt braucht.',d:'Kleiner ist besser. Nur, wo Minuten erfasst sind.'},
  {g:'Spiele',l:['Ø Eindruck Spiel'],t:'Eindruck im Spiel',k:'Wie oft positiv, neutral oder negativ im Spiel.',d:'Bewertung des Trainers nach dem Spiel: Positiv, Neutral oder Negativ, mit Notiz.'},
  {g:'Bewertung',l:['MScore'],t:'MScore',k:'Gesamtbewertung von 0 bis 99.',d:'Setzt sich zusammen aus Einsatz, Leistung, Potenzial und Eye-Test, bei eigenen Spielern zusätzlich Trainingsleistung und Spielleistung. Die laufende Saison und die letzten drei vollen Jahre zählen, je älter, desto weniger.'},
  {g:'Bewertung',l:['EIN','Einsatz'],t:'Einsatz',k:'Wie viel und wie hoch er spielt.',d:'Liga-Niveau und Einsatzquote (Minuten oder Einsätze je Spiel der Mannschaft). Gezählt werden die laufende Saison und die drei Spielzeiten davor, jüngere mehr als ältere. Der Tabellenplatz der Mannschaft zählt nicht.'},
  {g:'Bewertung',l:['LEI','Leistung'],t:'Leistung',k:'Was er im Spiel beiträgt, je nach Mannschaftsteil.',d:'Im Sturm und Mittelfeld Tore und halbe Vorlagen je Spiel, verglichen mit Spielern derselben Liga und desselben Mannschaftsteils. In Abwehr und Tor die Gegentore der Mannschaft im Verhältnis zur Liga, gewichtet mit seiner Einsatzzeit. Gleiche Zeitgewichtung wie beim Einsatz.'},
  {g:'Bewertung',l:['POT','Potenzial'],t:'Potenzial',k:'Wie viel Luft nach oben er hat.',d:'Aus Alter und Leistungsniveau. Junge Spieler mit guten Werten haben mehr Potenzial.'},
  {g:'Bewertung',l:['EYE','Eye-Test'],t:'Eye-Test',k:'Wie ihn die Beobachter sehen, 1 bis 10 je Kategorie.',d:'Feldspieler: Tempo, Schuss, Pass, Dribbling, Defensive, Physis. Torhüter: Hechten, Ballsicherheit, Abschlag, Stellungsspiel, Reflexe. Der Schnitt aller Bewerter zählt.'},
  {g:'Bewertung',l:['TRN','Trainingsleistung'],t:'Trainingsleistung',k:'Nur eigene Spieler: Eindruck des Trainers aus dem Training.',d:'Die Bewertungen Positiv, Neutral, Negativ aus dem Training dieser Saison. Zählt ab drei echten Bewertungen, angenommene Werte zählen nicht.'},
  {g:'Bewertung',l:['SPL','Spielleistung'],t:'Spielleistung',k:'Nur eigene Spieler: Eindruck des Trainers aus den Spielen.',d:'Die Bewertungen Positiv, Neutral, Negativ nach den Spielen dieser Saison, nur wenn er gespielt hat. Zählt ab drei echten Bewertungen.'},
  {g:'Bewertung',l:['Treue','Vereinstreue'],t:'Vereinstreue',k:'Bronze, Silber oder Gold für Jahre und Spiele im Verein.',d:'Aus Pflichtspielen und Jahren im Verein. Drei Stufen: Bronze, Silber, Gold.'},
  {g:'Bewertung',l:['Datenbasis'],t:'Datenbasis',k:'Wie sicher der MScore ist, in Prozent.',d:'Je mehr Spiele, Minuten und Bewertungen vorliegen, desto höher. Bei wenig Daten ist der MScore nur eine grobe Einschätzung.'},
  {g:'Planung',l:['Nächste Saison','Zukunft'],t:'Zukunft',k:'Geplant für die nächsten Saisonhälften.',d:'Bleibt, unsicher, geht, rauf oder runter. Gepflegt unter Kaderplanung und Gespräche.'},
  {g:'Kontakt',l:['Handy'],t:'Handy',k:'Handynummer, antippen öffnet WhatsApp.',d:'Nur für erwachsene Spieler gespeichert.'},
  {g:'Kontakt',l:['E-Mail'],t:'E-Mail',k:'E-Mail-Adresse.',d:'Nur für erwachsene Spieler gespeichert.'},
  {g:'Kontakt',l:['Lücken'],t:'Lücken',k:'Welche Angaben noch fehlen.',d:'Zum Beispiel Geburtsdatum, Fuß oder Handynummer.'},
  {g:'Bewertung',l:['PlayStyles'],t:'PlayStyles',k:'Besondere Stärken des Spielers, mit „+“ = herausragend.',d:'Einheitliche Beschreibung der Fähigkeiten nach Kategorien: Torwart, Körperlich, Ballkontrolle, Defensive, Pass, Abschluss.'}
];
const SVM_QUELLEN=[
  ['Training',['Eintrag des Trainers in der App (live oder danach)','Anwesenheitsliste (Excel-Import)','Abstimmung per Link (Zu- oder Absage)','Standardannahme (zum Beispiel „da“, wenn nichts anderes bekannt ist)'],
    'Widerspricht die Anwesenheitsliste einem Eintrag in der App, gilt der App-Eintrag. Der Widerspruch steht im Info-i der Einheit, dort lässt sich die Angabe aus der Liste mit einem Tipp übernehmen.'],
  ['Spiele',['Eintrag in der App','FuPa (Datei oder Spielplan)','Spielbericht von fussball.de','Annahme: wer nicht im Kader stand, hat zugeschaut'],
    'FuPa und fussball.de füllen Startelf, Einwechslungen, Tore und Minuten automatisch. Ein Eintrag in der App wird nie überschrieben.'],
  ['Statistiken',['Einzelwerte je Spiel oder Training nach den Regeln oben','Saisonsummen aus Listen, wenn keine Einzelwerte da sind'],
    'Summen werden immer aus den Einzelwerten gerechnet. Gibt es nur eine Saisonsumme (zum Beispiel aus einer PDF-Liste), steht das dabei.']
];
const svmNorm=s=>String(s||'').replace(/[▲▼↑↓*]/g,'').replace(/\(\d+\)/g,'').replace(/\s+/g,' ').trim();
const SVM_KPI_BY=new Map(); SVM_KPI.forEach(x=>x.l.forEach(l=>{ if(!SVM_KPI_BY.has(l))SVM_KPI_BY.set(l,x); }));
function svmTipps(root){
  (root||document).querySelectorAll('th').forEach(th=>{ const n=svmNorm(th.textContent); if(th.dataset.kpi===n)return;
    const x=SVM_KPI_BY.get(n); th.dataset.kpi=n; if(!x){ th.classList.remove('kpi-th'); return; }
    th.title=x.k; th.classList.add('kpi-th'); const b=th.querySelector('button'); if(b)b.title=x.k; });
}
{ let t=null; const mo=new MutationObserver(()=>{ clearTimeout(t); t=setTimeout(()=>{ try{ svmTipps(document); const pf=document.querySelector('#modal .pf4'); if(pf)svmNoFlip(pf); }catch(e){} },80); });
  const start=()=>{ const m=document.querySelector('main')||document.body; if(m)mo.observe(m,{childList:true,subtree:true}); const md=document.getElementById('modal'); if(md)mo.observe(md,{childList:true,subtree:true}); svmTipps(document); };
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',start); else start(); }

/* ---------- Tab „Kennzahlen“ unter Wissen ---------- */
SV4_HUB.wissen.tabs.push(['kpi','Kennzahlen']); SV4_OF.kpi='wissen';
Object.assign(SV_PAGES,{kpi:['Wissen','Kennzahlen und Spalten: was jede Zahl bedeutet und woher sie kommt']});
function svmKpiPanel(){ let P=document.getElementById('panel-kpi'); if(P)return P;
  const ref=document.getElementById('panel-play'); if(!ref)return null; P=document.createElement('section'); P.className='panel'; P.id='panel-kpi'; ref.parentNode.insertBefore(P,ref.nextSibling); return P; }
function svmKpiRender(){ const P=svmKpiPanel(); if(!P)return; const G=[...new Set(SVM_KPI.map(x=>x.g))];
  P.innerHTML=`<div class="card svm-kpi"><h3 class="trh">${SVI('book')} Kennzahlen und Spalten <small>${SVM_KPI.length} Begriffe</small></h3>
      <p class="note">Jede Spalte in den Tabellen erklärt sich kurz, wenn du mit der Maus darüber fährst. Hier steht alles ausführlich an einem Ort.</p>
      <input type="search" class="svm-such" id="svmKq" placeholder="Begriff suchen, z.B. Beteiligung">
      <div id="svmKl">${G.map(g=>`<div class="svm-kg" data-g="${svEsc(g)}"><h4>${svEsc(g)}</h4>${SVM_KPI.filter(x=>x.g===g).map(x=>`<details class="svm-k" data-q="${svEsc((x.t+' '+x.l.join(' ')+' '+x.k).toLowerCase())}"><summary><b>${svEsc(x.t)}</b>${x.l[0]!==x.t?`<code>${svEsc(x.l.join(' · '))}</code>`:''}<span>${svEsc(x.k)}</span></summary><p>${svEsc(x.d)}</p></details>`).join('')}</div>`).join('')}</div></div>
    <div class="card svm-kpi"><h3 class="trh">${SVI('db')} Datenquellen und Vorrang</h3>
      <p class="note">Liegen zu einer Einheit, einem Spiel oder einer Statistik mehrere Quellen vor, gilt diese Reihenfolge. Das Info-i an Training, Spielen und Statistiken zeigt, was im Einzelfall verwendet wurde, was fehlt und wo sich Quellen widersprechen.</p>
      ${SVM_QUELLEN.map(([t,L,w])=>`<div class="svm-q"><h4>${svEsc(t)}</h4><ol>${L.map(x=>`<li>${svEsc(x)}</li>`).join('')}</ol><p class="note small">${svEsc(w)}</p></div>`).join('')}</div>`;
  const q=P.querySelector('#svmKq'); q.oninput=()=>{ const s=q.value.trim().toLowerCase(); P.querySelectorAll('.svm-k').forEach(d=>{ const on=!s||d.dataset.q.includes(s); d.hidden=!on; if(s&&on)d.open=true; });
    P.querySelectorAll('.svm-kg').forEach(g=>g.hidden=!g.querySelector('.svm-k:not([hidden])')); };
}
{ const _gtM=goTab; goTab=function(tab){ if(tab==='kpi')svmKpiPanel(); const r=_gtM.apply(this,arguments); try{ if(svCurTab()==='kpi')svmKpiRender(); }catch(e){ console.warn('Kennzahlen',e); } return r; }; }

/* ---------- 2.1 Spielerliste: Fotos, „2. POS“ ---------- */
if(SV50_COLS.pos2)SV50_COLS.pos2.t='2. POS';
{ const _vp22=mnViewPlayers; mnViewPlayers=function(B){ const r=_vp22.apply(this,arguments);
  try{ B.querySelectorAll('tr[data-svp] td.nm50').forEach(td=>{ if(td.querySelector('.svm-av'))return; const p=trP(td.parentNode.dataset.svp); if(!p)return;
      td.insertAdjacentHTML('afterbegin',`<span class="svm-av">${avaHtml(p)}</span>`); td.classList.add('svm-nm'); });
    B.querySelectorAll('#sp50q').forEach(i=>i.classList.add('svm-such')); svmTipps(B); }catch(e){ console.warn('Spielerliste 0.22',e); }
  return r; }; }
trViewPlayers=mnViewPlayers;

/* ---------- 4.5 Saison-Album nicht mehr unter Spiele ---------- */
{ const _vg22=trViewGames; trViewGames=function(B){ const r=_vg22.apply(this,arguments); try{ B.querySelectorAll('.a41').forEach(x=>x.remove()); }catch(e){} return r; }; }

/* ---------- 5. Verletzung: Spieler, Notiz, seit wann, voraussichtlich zurück ---------- */
trInjuryEditor=function(id,pid){
  const i0=id?TR.st.injuries.find(x=>x.id===id):null;
  const notiz0=i0?((i0.n&&i0.dg&&!i0.n.startsWith(i0.dg))?i0.dg+(i0.n?'\n'+i0.n:''):(i0.n||i0.dg||'')):'';
  const st=i0?{id:i0.id,player_id:i0.p,notiz:notiz0,beginn:i0.b,prognose:i0.pr||''}:{player_id:pid||'',notiz:'',beginn:trToday(),prognose:''};
  const sq=svAktuelleSpieler().slice().sort(svNachCmp); if(st.player_id&&!sq.some(p=>p.id===st.player_id)&&trP(st.player_id))sq.unshift(trP(st.player_id));   // 0.83: aktuelle Spielerliste, nach Nachname
  svModal(`<div class="mhead"><div class="rm-ic" style="width:46px;height:46px">${SVI('shield')}</div><div><h2 style="margin:0">${i0?'Verletzung bearbeiten':'Verletzung eintragen'}</h2><div class="msub">Nur das Nötigste. Sichtbar nur fürs Trainerteam.</div></div></div>
    <div class="editgrid svm-inj" style="margin-top:14px">
      <div class="field" style="grid-column:1/-1"><label>Spieler</label><select id="ijP"><option value="">– wählen –</option>${sq.map(p=>`<option value="${svEsc(p.id)}"${st.player_id===p.id?' selected':''}>${svEsc(p.name)}</option>`).join('')}</select></div>
      <div class="field" style="grid-column:1/-1"><label>Notiz</label><textarea id="ijN" maxlength="1000" rows="3" placeholder="z.B. Zerrung Oberschenkel links, Physio zweimal pro Woche">${svEsc(st.notiz)}</textarea></div>
      <div class="field"><label>Seit</label><input type="date" id="ijB" value="${svEsc(st.beginn)}"></div>
      <div class="field"><label>Voraussichtlich zurück</label><input type="date" id="ijPr" value="${svEsc(st.prognose)}"><div class="trquick">${[1,2,3,4,6,8].map(w=>`<button type="button" data-w="${w}">+${w} W</button>`).join('')}</div></div>
    </div>
    <div class="btnrow sbact"><button class="btn" id="ijSave">Speichern</button><button class="btn ghost" id="ijCancel">Abbrechen</button>${i0?'<button class="btn ghost" id="ijDel" style="margin-left:auto;color:#fca5a5">Löschen</button>':''}</div>`);
  const $i=x=>document.getElementById(x);
  document.querySelectorAll('.svm-inj [data-w]').forEach(b=>b.onclick=()=>{ $i('ijPr').value=TRC.addDays($i('ijB').value||trToday(),+b.dataset.w*7); });
  $i('ijCancel').onclick=()=>closeOverlay();
  if($i('ijDel'))$i('ijDel').onclick=async e=>{ const b=e.currentTarget; if(!b.classList.contains('sure')){ b.classList.add('sure'); b.textContent='Wirklich löschen?'; return; } try{ await trDeleteInjury(i0.id); closeOverlay(); kToast('Gelöscht'); }catch(x){ kToast('⚠️ '+x.message); } };
  $i('ijSave').onclick=async()=>{
    const n=$i('ijN').value.trim(), erste=n.split('\n')[0].trim();
    const v={id:st.id,player_id:$i('ijP').value,diagnose:(erste||'Verletzung').slice(0,200),art:i0?i0.art||null:null,koerperteil:i0?i0.kt||null:null,beginn:$i('ijB').value,prognose:$i('ijPr').value||null,zurueck:i0?i0.z||null:null,notiz:n.includes('\n')?n.slice(n.indexOf('\n')+1).trim()||null:null};
    if(!v.player_id||!v.beginn)return kToast('Bitte Spieler und „Seit“ angeben');
    if(v.prognose&&v.prognose<v.beginn)return kToast('„Voraussichtlich zurück“ liegt vor „Seit“');
    try{ await trSaveInjury(v); closeOverlay(); kToast('✓ Verletzung von '+trShort(v.player_id)+' gespeichert'); }catch(e){ kToast('⚠️ '+e.message); } };
};

/* ---------- 7.1 / 7.4 Massenpflege: Mannschaft und Position zuerst, ohne „Schwacher Fuß“ ---------- */
{ const ord=['team','pos','fuss','eye','skills','kontakt','geb','groesse','gewicht'];
  MN_AREAS.sort((a,b)=>{ const i=ord.indexOf(a.k), j=ord.indexOf(b.k); return (i<0?99:i)-(j<0?99:j); });
  if(MN_A.fuss){ MN_A.fuss.orig=p=>({fu:p.fuss||''}); MN_A.fuss.ctl=(p,v,ok)=>`<div class="sbseg mn-seg">${['Rechts','Links','Beidfüßig'].map(x=>`<button type="button" data-set="fu:${x}" class="${v.fu===x?'on':''}" ${ok?'':'disabled'}>${x}</button>`).join('')}</div>`;
    MN_A.fuss.set=(v,k,x)=>{ if(k==='fu')v.fu=v.fu===x?'':x; }; }
  const g=MN_COLGRP.find(x=>x[0]==='Spielerdaten'); if(g)g[1]=g[1].filter(c=>c!=='wf');
  if(MN.area==='fuss'||!MN.area)MN.area='team'; }
{ const _pf22=mnViewPflege; mnViewPflege=function(B){ const r=_pf22.apply(this,arguments); try{ B.querySelectorAll('#mpq').forEach(i=>i.classList.add('svm-such')); }catch(e){} return r; }; MN_VIEWS.pflege=mnViewPflege; }

/* ---------- 8.2 Spielerprofil: kein Umdrehen, keine Hinweisblöcke, kein „Gespräch“, kein „Ins Blickfeld“ bei eigenen ---------- */
// Karte dreht sich nicht mehr: jede Karte bekommt „fut-noflip“ (so prüft es svcards.js), dazu eine CSS-Sperre
function svmNoFlip(root){ (root||document).querySelectorAll('.fut:not(.fut-noflip):not([data-go])').forEach(c=>{ c.classList.add('fut-noflip'); c.classList.remove('flip'); }); }
{ const _om22=openModal; openModal=function(id){ const r=_om22.apply(this,arguments);
  try{ const M=document.getElementById('modal'), p=trP(id); if(M&&M.querySelector('.pf4')){
      M.querySelectorAll('.pf4-hints').forEach(x=>x.remove());
      M.querySelectorAll('[data-pf4="gespr"]').forEach(x=>x.remove());
      if(p&&typeof mnIsIntern==='function'&&mnIsIntern(p))M.querySelectorAll('.pf4-act [data-bf]').forEach(x=>x.remove());
      svmNoFlip(M.querySelector('.pf4')); } }catch(e){ console.warn('Profil 0.22',e); }
  return r; }; }

/* =====================================================================
   Sportzentrale Beta 0.22 · Teil B (Änderungswünsche aus dem Trainerteam)
   2.2  Mannschaft: „Keine Mannschaft, aber Pass“ statt „Umfeld“, neu „Extern“, Prüffälle aus FuPa
   3.1  Training: Eindruck Positiv, Neutral, Negativ je Einheit und Spieler, ohne Position, ohne „Details“
   1.2/3.2  Info-i je Einheit: Quellen, Vorrang, was fehlt, Widersprüche (Anwesenheitsliste gegen App)
   4.1–4.4  Spiele: Vergangene, Bevorstehende, Statistik; Quelle und Lücken je Spiel; neue Spielbewertung;
            eine gemeinsame Statistik aus App, FuPa und fussball.de mit festen Vorrang-Regeln
   ===================================================================== */
const SVM={liste:0,listeStat:null,plan:null,planTry:0,planBusy:false};
const svmN=s=>String(s||'').toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g,'').replace(/[^a-z0-9]/g,'');
function svmIstWir(name){ try{ const T=(window.VEREIN&&VEREIN.texte)||{}, n=svmN(name); if(!n)return false;
    if(T.name&&n===svmN(T.name))return true; return !!(T.ort&&T.kurz&&n.includes(svmN(T.ort))&&n.includes(svmN(T.kurz))); }catch(e){ return false; } }
function svmTag(d){ try{ return new Date(d+'T12:00:00').toLocaleDateString('de-DE',{weekday:'short',day:'2-digit',month:'2-digit'}); }catch(e){ return d; } }

/* ---------- Eindruck: Positiv, Neutral, Negativ (intern weiter als Note 2, 3, 5 gespeichert) ---------- */
const SVM_EI={p:{t:'Positiv',n:2,i:'+'},o:{t:'Neutral',n:3,i:'○'},m:{t:'Negativ',n:5,i:'−'}};
function svmEiK(n){ if(n==null||n===''||isNaN(+n))return null; n=+n; return n<=2.4?'p':n>=4.5?'m':'o'; }
function svmEiChip(n,extra){ const k=svmEiK(n); if(!k)return ''; const e=SVM_EI[k]; return `<i class="svm-ei ${k}" title="Eindruck ${e.t}${extra?' · '+svEsc(extra):''}">${e.i}</i>`; }
function svmEiBtns(cur,attr,ann){ return `<div class="svm-eib">${['p','o','m'].map(k=>`<button type="button" data-${attr}="${k}" class="${k}${cur===k?' on'+(ann?' ann':''):''}" title="${SVM_EI[k].t}">${SVM_EI[k].i}<span> ${SVM_EI[k].t}</span></button>`).join('')}</div>`; }
if(typeof SV50_COLS!=='undefined'&&SV50_COLS.note){ SV50_COLS.note.t='Ø Eindruck';
  SV50_COLS.note.h=(p,s)=>s.note!=null?`${svmEiChip(s.note)} <small>${SVM_EI[svmEiK(s.note)].t} · ${s.noteN}×</small>`:s.noteAll!=null?'<small title="Nur angenommen, noch keine echte Bewertung">neutral · Annahme</small>':'–'; }

/* =====================================================================
   2.2 Mannschaft: Mit Pass ohne Mannschaft, Extern
   ===================================================================== */
MN_TEAM.U='Keine Mannschaft, aber Pass'; MN_TEAM.X='Extern'; MN_TK.U='P'; MN_TK.X='X';
if(typeof SV4_TEAM!=='undefined'){ SV4_TEAM.U='Keine Mannschaft, aber Pass'; SV4_TEAM.X='Extern'; }
if(MN_F&&MN_F.team){ const u=MN_F.team.find(x=>x[0]==='U'); if(u)u[1]='Mit Pass, ohne Mannschaft'; }
function svmExtern(p){ try{ if(!p||typeof sv4SS!=='function')return false; const r=sv4SS(p.id,sv4S()); return !!(r&&r.team==='X'); }catch(e){ return false; } }
{ const _t22=sv4Team; sv4Team=function(p,s){ const t=_t22.apply(this,arguments); return t==='X'?null:t; }; }
{ const _i22=mnIsIntern; mnIsIntern=function(p){ if(svmExtern(p))return false; return _i22.apply(this,arguments); }; }
{ const _sq22=trSquad; trSquad=function(){ const L=_sq22.apply(this,arguments); try{ return L.filter(p=>!svmExtern(p)); }catch(e){ return L; } }; }
if(SV50_INFO['training:players'])SV50_INFO['training:players'].w='Alle internen Spieler in einer Liste: 1. und 2. Mannschaft, A-Jugend und Spieler mit Pass ohne feste Mannschaft. Wer als „Extern“ markiert ist, steht hier nicht mehr.';
if(MN_A.team){
  MN_A.team.orig=p=>({t:svmExtern(p)?'X':(mnTeam(p)||''),t2:svmExtern(p)?'':(mnTeam2(p)||'')});
  MN_A.team.ctl=(p,v,ok)=>`<label class="mn-lbl"><span>Mannschaft</span><select data-f="t" ${ok?'':'disabled'}>${v.t?'':'<option value="">–</option>'}${['1','2','A','S','U','X'].map(t=>`<option value="${t}"${v.t===t?' selected':''}>${MN_TEAM[t]}</option>`).join('')}</select></label>
    ${v.t==='X'?'<small class="note svm-xh">Extern: zählt nicht mehr zum Kader und taucht in Training und Listen nicht mehr auf. Die App prüft weiter mit FuPa, ob er wieder bei uns spielt.</small>'
      :`<label class="mn-lbl"><span>Zweitmannschaft</span><select data-f="t2" ${ok?'':'disabled'}><option value="">keine</option>${['1','2','A','S','U'].filter(t=>t!==v.t).map(t=>`<option value="${t}"${v.t2===t?' selected':''}>${MN_TEAM[t]}</option>`).join('')}</select></label>`}`;
  MN_A.team.read=(k,val,v)=>{ if(k==='t'&&(v.t2===val||val==='X'))v.t2=''; return val; };
}

// Prüffälle: laut FuPa woanders im Kader, in dieser Saison in keinem FuPa-Kader, oder als extern markiert und wieder bei uns
function svmPrueffaelle(){
  if(typeof KLAW==='undefined'||!KLAW.geladen||typeof klaSk!=='function')return [];
  const cur=klaSk('cur'), vor=klaVor(cur), out=[];
  players.forEach(p=>{ if(p.isJugend)return; const C=(typeof crmOf==='function'?crmOf(p):CRM[p.id])||{}, K=(KLAW.by[p.id]||{})[cur], KV=(KLAW.by[p.id]||{})[vor];
    const basis=K?(K.basis||[]):[], wir=basis.some(r=>svmIstWir(r.verein||r.mannschaft)), fremd=basis.filter(r=>!svmIstWir(r.verein||r.mannschaft)).map(r=>r.verein||r.mannschaft).filter(Boolean);
    const ok=C.xok&&C.xok===cur;
    if(svmExtern(p)){ if(K&&wir&&K.kaderBelegt)out.push({p,k:'zurueck',t:'Als extern markiert, steht laut FuPa aber wieder in unserem Kader',K}); return; }
    if(!mnIsIntern(p)||ok)return; if(typeof mnCtx==='function'&&MN.team!=='X'&&mnTeam(p)!==mnCtx())return;   // 0.83: nur die gewählte Mannschaft
    if(K&&K.kaderBelegt&&!wir&&fremd.length)out.push({p,k:'fremd',t:'Laut FuPa diese Saison im Kader von '+[...new Set(fremd)].join(' / '),K});
    else if(!K&&KV&&KV.belegt)out.push({p,k:'fehlt',t:'Letzte Saison bei FuPa geführt, diese Saison in keinem FuPa-Kader',K:KV}); });
  return out;
}
function svmPrueffCard(){
  const L=svmPrueffaelle(); if(!L.length)return '';
  return `<div class="card svm-pf"><h3 class="trh">${SVI('radar')} Prüffälle aus FuPa <small>${L.length}</small></h3>
    <p class="note small">FuPa führt die Kader aller Vereine. Wo das nicht zu unserer Zuordnung passt, steht der Spieler hier. Nichts wird automatisch geändert.</p>
    ${L.map(x=>`<div class="svm-pfr" data-pf="${svEsc(x.p.id)}"><div><b data-svp="${svEsc(x.p.id)}">${svEsc(x.p.name)}</b><small>${svEsc(x.t)}${x.K&&x.K.geprueft?' · geprüft '+svEsc(TRC.fmt(String(x.K.geprueft).slice(0,10))):''}</small></div>
      <div class="btnrow">${x.k==='zurueck'?`<button type="button" class="btn sm" data-pfa="intern">Wieder intern</button>`:`<button type="button" class="btn sm" data-pfa="extern">Als extern markieren</button><button type="button" class="btn ghost sm" data-pfa="ok">Passt so</button>`}${x.K&&x.K.url?`<a class="btn ghost sm" href="${svEsc(x.K.url)}" target="_blank" rel="noopener">FuPa</a>`:''}</div></div>`).join('')}</div>`;
}
function svmPrueffWire(B){
  B.querySelectorAll('.svm-pf [data-svp]').forEach(x=>x.onclick=()=>openModal(x.dataset.svp));
  B.querySelectorAll('.svm-pf [data-pfa]').forEach(b=>b.onclick=async()=>{ const pid=b.closest('[data-pf]').dataset.pf, p=trP(pid), a=b.dataset.pfa; if(!p)return; b.disabled=true;
    try{ if(a==='ok'){ crmSet(pid,{xok:klaSk('cur')}); try{ crmApply(); }catch(e){} kToast('✓ '+p.name+' bleibt, wie er ist'); }
      else if(a==='extern'){ await sv4SSSet(pid,sv4S(),{team:'X',team2:null}); kToast('✓ '+p.name+' ist jetzt extern'); }
      else { const t=sv4Team0(p)||'1'; await sv4SSSet(pid,sv4S(),{team:t==='X'?'1':t}); kToast('✓ '+p.name+' ist wieder intern'); }
      trRender(); }catch(e){ b.disabled=false; kToast('⚠️ '+e.message); } });
}
// Massenpflege: Filter „Mit Pass“ und „Extern“, Prüffälle oben im Bereich Mannschaft
{ const _pf22b=MN_VIEWS.pflege; MN_VIEWS.pflege=mnViewPflege=function(B){
  let hI=null, hT=null;
  if(MN.team==='X'){ hI=mnIntern; hT=mnTeam; mnIntern=()=>players.filter(p=>!p.isJugend&&svmExtern(p)).sort((a,b)=>a.name.localeCompare(b.name,'de')); mnTeam=p=>svmExtern(p)?'X':hT(p); }
  let r; try{ r=_pf22b.apply(this,arguments); }finally{ if(hI){ mnIntern=hI; mnTeam=hT; } }
  try{
    const ch=B.querySelector('.mp-f .chips4'); if(ch){ const u=ch.querySelector('[data-mpt="U"]'); if(u)u.textContent='Mit Pass';
      if(!ch.querySelector('[data-mpt="X"]')){ const nx=ch.querySelector('[data-mpt="-"]'); const nb=document.createElement('button'); nb.type='button'; nb.dataset.mpt='X'; nb.textContent='Extern'; if(MN.team==='X')nb.className='on';
        nb.onclick=()=>{ MN.team='X'; trRender(); }; (nx||ch.lastElementChild).after(nb); } }
    B.querySelectorAll('.mp18 > p.note.small').forEach(x=>{ if(/^Stammmannschaft und Zweitmannschaft/.test(x.textContent))x.textContent='Mannschaft und Zweitmannschaft der laufenden Saison. „Keine Mannschaft, aber Pass“: hat einen Spielerpass, spielt aber nicht regelmäßig. „Extern“: spielt nicht mehr bei uns, die App prüft ihn weiter mit FuPa.'; });
    if(MN.team==='X'){ const n=B.querySelector('.mp18 > p.note.small:last-of-type'); if(n&&/internen Spielern/.test(n.textContent))n.textContent=B.querySelectorAll('.mp-r').length+' Spieler als extern markiert. Unter „Mannschaft“ lässt sich das zurücknehmen.'; }
    if(MN.area==='team'&&!B.querySelector('.svm-pf')){ const h=svmPrueffCard(); if(h){ B.querySelector('.mp18').insertAdjacentHTML('beforebegin',h); svmPrueffWire(B); } }
  }catch(e){ console.warn('Massenpflege 0.22 B',e); }
  return r; }; }

/* =====================================================================
   3.1 Training erfassen: Eindruck statt Noten, ohne Position, ohne „Details“
   ===================================================================== */
function svmTrainQuick(datum,sid,ki){
  const s0=sid?TR.st.sessions.find(s=>s.id===sid):trSessionOn(datum||trToday(),'training');
  const st={datum:s0?s0.d:(datum||trToday()),no:s0&&s0.no!=null?s0.no:null,ns:s0?s0.ns:null,n:s0?s0.n||'':'',rows:{},orig:new Set(),open:null,ki:!!ki};
  const fill=()=>{
    st.rows={}; st.orig=new Set();
    const cur=trSessionOn(st.datum,'training'), D=sv50Defaults(st.datum); st.poll=D.poll;
    const have=new Map(((cur&&cur.a)||[]).map(a=>[a[0],a]));
    new Set([...svAktuelleSpieler().map(p=>p.id),...have.keys()]).forEach(id=>{   // 0.83: aktuelle Spielerliste der Mannschaft plus schon Erfasste
      const a=have.get(id);
      if(a){ st.orig.add(id); st.rows[id]={status:a[1],grund:a[2],notiz:a[5]||'',note:a[8],note_src:a[9]||null,status_src:a[10]||'manuell',saved:true}; }
      else if(D.rows[id])st.rows[id]=Object.assign({notiz:''},D.rows[id]); });
    if(cur){ st.no=cur.no!=null?cur.no:st.no; st.ns=cur.ns||st.ns; st.n=cur.n||st.n; }
  };
  fill();
  if(ki){ const i=ki.input||ki; if(i.datum&&i.datum!==st.datum){ st.datum=i.datum; fill(); }
    (i.spieler||[]).forEach(x=>{ if(!x.player_id||!trP(x.player_id))return; const r=st.rows[x.player_id]=st.rows[x.player_id]||{notiz:''};
      if(x.status){ r.status=x.status; r.status_src='ki'; r.grund=x.status==='weg'?(x.grund||r.grund||'ohne'):null; }
      if(x.note){ r.note=SVM_EI[svmEiK(x.note)].n; r.note_src='ki'; } else if(r.status!=='weg'&&r.note==null){ r.note=3; r.note_src='default'; }
      if(x.notiz)r.notiz=x.notiz; if(x.motivation)r.motivation=x.motivation; if(x.fitness)r.fitness=x.fitness; });
    if(i.note){ st.no=SVM_EI[svmEiK(i.note)].n; st.ns='ki'; } if(i.notiz&&!st.n)st.n=i.notiz; }
  svModal(`<div class="mhead"><div class="rm-ic" style="width:46px;height:46px">${SVI('activity')}</div><div><h2 style="margin:0">Training ${s0?'bearbeiten':'erfassen'} <button type="button" class="svm-i" id="q50i" title="Woher kommen die Angaben?">i</button></h2><div class="msub">Anwesenheit und Eindruck: Positiv, Neutral oder Negativ. Die Herkunft jeder Angabe steht daneben.</div></div></div><div id="q50"></div>`);
  document.getElementById('q50i').onclick=()=>svmQuelleTraining(st.datum);
  const draw=()=>{
    const E=document.getElementById('q50'); if(!E)return;
    const list=Object.keys(st.rows).map(trP).filter(Boolean).sort(svNachCmp);
    const c={da:0,spaet:0,weg:0}; list.forEach(p=>{ const r=st.rows[p.id]; if(r.status)c[r.status]++; });
    const ann=list.filter(p=>{ const r=st.rows[p.id]; return r.status_src==='default'||(r.status!=='weg'&&r.note_src==='default'); }).length;
    const gk=svmEiK(st.no);
    E.innerHTML=`<div class="q50-top"><div class="field"><label>Datum</label><input type="date" id="q50d" value="${svEsc(st.datum)}" max="${TRC.addDays(trToday(),14)}"></div>
        <div class="q50-ges"><span>Eindruck der Einheit ${st.ns?sv50Src(st.ns):''}</span>${svmEiBtns(gk,'ges',st.ns==='default')}</div></div>
      <div class="field q50-note"><label>Notiz zur Einheit</label><input id="q50n" maxlength="2000" value="${svEsc(st.n)}" placeholder="z.B. laufintensiv, gute Stimmung, Standards geübt"></div>
      <div class="q50-info">${st.poll?`${SVI('check')} Anwesenheit aus der Abstimmung „${svEsc(st.poll.titel||'Training')}“ übernommen.`:'Keine Abstimmung für diesen Tag, deshalb gelten erst einmal alle als da.'} ${ann?`<b>${ann} Annahmen</b> sind gelb markiert, tippe nur an, was anders war.`:''}</div>
      <div class="q50-sum"><span><b>${c.da+c.spaet}</b> da</span><span class="${c.weg?'bad':''}"><b>${c.weg}</b> fehlen</span>
        <button type="button" class="btn ghost sm" data-all3>Alle Annahmen bestätigen</button></div>
      <div class="q50l">${list.map(p=>{ const r=st.rows[p.id], o=st.open===p.id, weg=r.status==='weg', annS=r.status_src==='default', annN=!weg&&r.note_src==='default';
        return `<div class="q50r${weg?' weg':''}${annS||annN?' ann':''}" data-q50="${svEsc(p.id)}" data-gr="${weg?svEsc(r.grund||''):''}">
          <div class="q50-h"><span class="q50-n" data-q50open><b>${svEsc(p.name)}</b><em>${trInjury(p.id)?'🩹 ':''}${sv50Src(r.status_src)}</em></span>
            <div class="trseg">${[['da','Da'],['weg','Fehlt']].map(([k,t])=>`<button type="button" data-q50s="${k}" class="${r.status===k||(k==='da'&&r.status==='spaet')?'on':''}">${t}</button>`).join('')}</div></div>
          ${weg?`<div class="q50-weg">${r.grund&&r.grund!=='keine_antwort'&&r.grund!=='ohne'&&r.status_src!=='manuell'?`fehlt · ${svEsc(TRC.REASONS[r.grund]||r.grund)}`:'fehlt'}</div>`
            :`<div class="q50-no">${svmEiBtns(svmEiK(r.note),'q50e',annN)}${r.note!=null?sv50Src(r.note_src):''}</div>`}
          ${o?`<input class="q50-in" data-q50t maxlength="500" value="${svEsc(r.notiz||'')}" placeholder="Notiz, z.B. „stark im Abschlussspiel“">`:`<button type="button" class="trr-more" data-q50open>${r.notiz?'„'+svEsc(r.notiz.slice(0,60))+'“':'+ Notiz'}</button>`}
        </div>`; }).join('')}</div>
      <div class="btnrow sbact"><button class="btn" type="button" id="q50save">${SVI('check')} Speichern</button>${trSessionOn(st.datum,'training')?'<button class="btn ghost q50-del" type="button" id="q50del">Einheit löschen</button>':''}</div>`;
    const keep=()=>{ const n=E.querySelector('#q50n'); if(n)st.n=n.value; E.querySelectorAll('[data-q50t]').forEach(i=>{ const r=st.rows[i.closest('[data-q50]').dataset.q50]; if(r)r.notiz=i.value; }); };
    E.querySelector('#q50d').onchange=e=>{ keep(); if(!e.target.value)return; st.datum=e.target.value; const ex=trSessionOn(st.datum,'training'); st.no=ex&&ex.no!=null?ex.no:null; st.ns=ex?ex.ns:null; st.n=ex?ex.n||'':''; fill(); draw(); };
    E.querySelectorAll('[data-ges]').forEach(b=>b.onclick=()=>{ keep(); const n=SVM_EI[b.dataset.ges].n; if(st.no===n&&st.ns==='manuell'){ st.no=null; st.ns=null; } else { st.no=n; st.ns='manuell'; } draw(); });
    E.querySelectorAll('[data-q50]').forEach(row=>{ const id=row.dataset.q50, r=st.rows[id];
      row.querySelectorAll('[data-q50s]').forEach(b=>b.onclick=()=>{ keep(); const v=b.dataset.q50s; r.status=v; r.status_src='manuell';
        if(v==='weg'){ const ab=typeof sv91Abw==='function'?sv91Abw(id,st.datum):null; r.grund=trInjury(id)?'verletzt':ab&&TRC.REASONS[ab.grund]?ab.grund:'keine_antwort'; } else { r.grund=null; if(r.note==null){ r.note=3; r.note_src='default'; } }
        svSound('tick'); draw(); });
      row.querySelectorAll('[data-q50g]').forEach(b=>b.onclick=()=>{ keep(); r.grund=b.dataset.q50g; r.status_src='manuell'; draw(); });
      row.querySelectorAll('[data-q50e]').forEach(b=>b.onclick=()=>{ keep(); const n=SVM_EI[b.dataset.q50e].n; if(r.note===n&&r.note_src==='manuell'){ r.note=3; r.note_src='default'; } else { r.note=n; r.note_src='manuell'; } if(r.status_src==='default')r.status_src='manuell'; draw(); });
      row.querySelectorAll('[data-q50open]').forEach(b=>b.onclick=()=>{ keep(); st.open=st.open===id?null:id; draw(); const i=document.querySelector(`[data-q50="${CSS.escape(id)}"] [data-q50t]`); if(i)i.focus(); }); });
    E.querySelector('[data-all3]').onclick=()=>{ keep(); let n=0; Object.values(st.rows).forEach(r=>{ if(r.status_src==='default'){ r.status_src='manuell'; n++; } if(r.status!=='weg'&&r.note_src==='default'){ r.note_src='manuell'; n++; } }); draw(); kToast(n?'✓ Annahmen bestätigt':'Keine offenen Annahmen'); };
    const del=E.querySelector('#q50del'); if(del)del.onclick=async()=>{ const cur=trSessionOn(st.datum,'training'); if(!cur)return;
      if(del.dataset.sure!=='1'){ del.dataset.sure='1'; del.textContent='Wirklich löschen? Noch mal tippen'; del.classList.add('sure'); return; }
      del.disabled=true; try{ await trDeleteSession(cur.id); closeOverlay(); kToast('Training vom '+TRC.fmt(st.datum)+' gelöscht'); try{ trRender(); }catch(_){} }
      catch(x){ del.disabled=false; kToast('Das hat nicht geklappt. Prüf die Verbindung und versuch es noch mal.'); } };
    E.querySelector('#q50save').onclick=async e=>{ keep(); const b=e.currentTarget;
      const sp=[]; Object.entries(st.rows).forEach(([id,r])=>{ if(!r.status){ if(st.orig.has(id))sp.push({player_id:id,status:''}); return; }
        const weg=r.status==='weg';
        if(r.status==='spaet'){ r.status='da'; if(!/zu sp(ä|ae)t/i.test(r.notiz||''))r.notiz=('zu spät '+(r.notiz||'')).trim(); }
        sp.push(Object.assign({player_id:id,status:r.status,grund:weg?(r.grund||'ohne'):null,status_src:r.status_src||'manuell',notiz:(r.notiz||'').trim()||null,
          note:weg?null:(r.note||null),note_src:weg||r.note==null?null:(r.note_src||'manuell')},r.motivation?{motivation:r.motivation}:{},r.fitness?{fitness:r.fitness}:{})); });
      b.disabled=true; b.textContent='Speichert …';
      try{ await trSaveSession({datum:st.datum,typ:'training',note:st.no,note_src:st.no?(st.ns||'manuell'):null,notiz:(st.n||'').trim()||null,quelle:st.ki?'ki':'manuell',spieler:sp});
        closeOverlay(); svSound('success'); kToast('✓ Training vom '+TRC.fmt(st.datum)+' gespeichert · '+sp.filter(x=>x.status==='weg').length+' fehlten');
        if(ki&&typeof ki==='object'&&!ki.done){ ki.done='Training '+TRC.fmt(st.datum)+' eingetragen'; }
      }catch(x){ b.disabled=false; b.innerHTML=SVI('check')+' Speichern'; kToast('⚠️ '+x.message); } };
  };
  draw();
  if(typeof KB!=='undefined'&&!KB.loaded&&typeof kbLoad==='function')kbLoad().then(()=>{ if(!document.getElementById('q50'))return; const touched=Object.values(st.rows).some(r=>r.status_src==='manuell'&&!r.saved); if(!touched&&!st.ki&&!st.orig.size){ fill(); draw(); } });
}
// Abwesenheiten (Urlaub) vorher laden, wie bisher
sv50Quick=function(){ const a=arguments; if(typeof SV91!=='undefined'&&!SV91.loaded&&canTraining()&&typeof sv91Load==='function'){ sv91Load().then(()=>svmTrainQuick.apply(null,a),()=>svmTrainQuick.apply(null,a)); return; } return svmTrainQuick.apply(null,a); };

// Einheiten-Liste: Eindruck statt Note, Info-i je Einheit
{ const _vs22=trViewSessions; trViewSessions=function(B){ const r=_vs22.apply(this,arguments);
  try{ B.querySelectorAll('.trs[data-edit-s]').forEach(b=>{ const s=TR.st.sessions.find(x=>x.id===b.dataset.editS); if(!s)return; const f=b.querySelector('.trs-f'); if(!f||f.querySelector('.svm-i'))return;
      f.querySelectorAll('.note50').forEach(x=>x.remove());
      if(s.no!=null)f.insertAdjacentHTML('afterbegin',`<i class="svm-eil ${svmEiK(s.no)}">${svmEiChip(s.no)} ${SVM_EI[svmEiK(s.no)].t}</i>`);
      if(s.q==='liste')f.insertAdjacentHTML('beforeend','<i class="src50 i">Liste</i>');
      f.insertAdjacentHTML('beforeend',`<span role="button" tabindex="0" class="svm-i" data-svmi="${svEsc(s.d)}" title="Woher kommen die Angaben?">i</span>`);
      f.querySelector('[data-svmi]').addEventListener('click',e=>{ e.stopPropagation(); e.preventDefault(); svmQuelleTraining(s.d); }); });
    const h=B.querySelector('.hero50-t p'); if(h)h.textContent=h.textContent.replace(/, Gesamteindruck (\d)/,(m,n)=>', Eindruck '+SVM_EI[svmEiK(+n)].t.toLowerCase());
  }catch(e){ console.warn('Einheiten 0.22',e); }
  return r; }; }
// Statistik: „Ø Eindruck“ und „Letzte Eindrücke“
{ const _vh22=trViewHome; trViewHome=function(B){ const r=_vh22.apply(this,arguments);
  try{ B.querySelectorAll('table.trtab th').forEach(th=>{ const t=th.textContent.trim(); if(t==='Ø Note')th.textContent='Ø Eindruck'; else if(t==='Letzte Noten')th.textContent='Letzte Eindrücke'; });
    B.querySelectorAll('table.trtab td i.note50[title]').forEach(i=>{ const n=+i.textContent; i.outerHTML=svmEiChip(n,i.title); });
    B.querySelectorAll('.card > .note').forEach(n=>{ if(/Automatisch vergebene 3er/.test(n.textContent))n.textContent='Nur echte Bewertungen zählen in den Schnitt. Automatisch angenommene Eindrücke (neutral) stehen in den Einheiten, fließen aber nicht ein. „Ohne Grund“ zählt auch fehlende Rückmeldungen.'; });
    B.querySelectorAll('.rt4 .note.small').forEach(n=>{ n.textContent='Einheit: Anwesenheit und Eindruck · Spiel: Einsatz und Eindruck je Spieler · Eye-Test: im Spielerprofil.'; });
  }catch(e){ console.warn('Statistik 0.22',e); }
  return r; }; }

/* ---------- Info-i: Woher kommen die Angaben einer Einheit? ---------- */
const SVM_SRC_T={manuell:'Trainer in der App',ki:'Co-Trainer (vom Trainer bestätigt)',abstimmung:'Abstimmung per Link',import:'Anwesenheitsliste oder Datei',default:'Annahme'};
if(typeof SV50_Q!=='undefined')SV50_Q.liste='Anwesenheitsliste';
async function svmQuelleTraining(datum){
  const M=svModal(`<div class="mhead"><div class="rm-ic" style="width:46px;height:46px">${SVI('info')}</div><div><h2 style="margin:0">Training ${svEsc(TRC.fmt(datum))}</h2><div class="msub">Welche Quellen, welcher Vorrang, was fehlt, wo es sich widerspricht</div></div></div><div id="svmQ"><div class="empty">Lade …</div></div>`);
  let L=[]; try{ const {data}=await SVB.sb.from('training_liste').select('player_id,status,grund,importiert_am').eq('datum',datum); L=data||[]; }catch(e){}
  const E=document.getElementById('svmQ'); if(!E)return;
  const s=trSessionOn(datum,'training'), A=new Map(((s&&s.a)||[]).map(x=>[x[0],x])), cnt={};
  ((s&&s.a)||[]).forEach(x=>{ const k=x[10]||'manuell'; cnt[k]=(cnt[k]||0)+1; });
  const art=x=>x==='weg'?'fehlt':'da';
  const wid=L.filter(l=>{ const x=A.get(l.player_id); return x&&art(x[1])!==art(l.status); });
  const fehlt=[]; if(!s)fehlt.push('Die Einheit ist in der App noch nicht erfasst.');
  else { if(s.no==null)fehlt.push('Eindruck der Einheit vom Trainer');
    const oe=(s.a||[]).filter(x=>x[1]!=='weg'&&(x[8]==null||x[9]==='default')).length; if(oe)fehlt.push(oe+' Spieler ohne echten Eindruck (nur angenommen)');
    const an=(s.a||[]).filter(x=>x[10]==='default').length; if(an)fehlt.push(an+' Anwesenheiten nur angenommen'); }
  const neuL=L.filter(l=>!A.has(l.player_id)).length;
  E.innerHTML=`<div class="svm-qb"><h4>Verwendet</h4><ul>
      <li>Einheit angelegt über: <b>${svEsc(s?(SV50_Q[s.q]||s.q||'App'):'noch nicht angelegt')}</b></li>
      ${Object.entries(cnt).map(([k,n])=>`<li>${n}× Anwesenheit von: <b>${svEsc(SVM_SRC_T[k]||k)}</b></li>`).join('')}
      <li>Anwesenheitsliste: ${L.length?`<b>${L.length} Einträge</b>, eingelesen ${svEsc(TRC.fmt(String(L[0].importiert_am).slice(0,10)))}`:'für diesen Tag nicht eingelesen'}</li></ul></div>
