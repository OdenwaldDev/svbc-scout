    <p style="margin:6px 0 0;font-size:13.5px">Alles, was ihr von Hand pflegt (Notizen, Kontakte, Training, Verletzungen, Helfer, Aufstellung, Fotos), als eine Datei. Der Gratis-Tarif der Datenbank macht keine Sicherungen für euch, einmal im Monat herunterladen und auf dem Mac ablegen.</p></div>
    <span class="pill ${old?'wait':'on'}">${last?'zuletzt '+new Date(last).toLocaleDateString('de-DE'):'noch nie'}</span></div>
    <button class="btn" id="spBackupGo">${SVI('upload')} Sicherung herunterladen</button>`;
  (P.querySelector('#spCost')||P.lastElementChild).after(el);
  el.querySelector('#spBackupGo').onclick=async()=>{ try{ const {data,error}=await SVB.sb.rpc('admin_export'); if(error)throw error;
    const blob=new Blob([JSON.stringify(data)],{type:'application/json'}), a=document.createElement('a'); a.href=URL.createObjectURL(blob); a.download='svbc-sicherung-'+trToday()+'.json'; document.body.appendChild(a); a.click(); a.remove(); setTimeout(()=>URL.revokeObjectURL(a.href),4000);
    try{ localStorage.setItem('svbc-backup-at',new Date().toISOString()); }catch(e){} kToast('✓ Sicherung heruntergeladen'); el.remove(); spBackupCard(P); }catch(e){ kToast('⚠️ '+(e.message||e)); } };
}
{ const _ar3=svAdminRender; svAdminRender=async function(){ const r=await _ar3.apply(this,arguments); try{ await spBackupCard(document.getElementById('panel-admin')); }catch(e){} return r; }; }

/* =====================================================================
   SV/BSC Scout · Runde 11: Saison-Statistik automatisch aus den Spielberichten (FUSSBALL.DE)
   - Einsätze, Startelf, Minuten und Tore aller Pflichtspiele der Ersten (Meisterschaft + Pokal)
   - fließt in die ewige Liste, Meilensteine, Abzeichen und Vereinstreue ein, niemand muss etwas eintragen
   ===================================================================== */
const FB={m:[],pl:new Map(),loaded:false,loading:false,map:null,mapK:'',busy:false};
async function fbLoad(force){
  if(FB.loading||(FB.loaded&&!force))return; FB.loading=true;
  try{
    const [m,p]=await Promise.all([SVB.sb.from('fde_matches').select('id,team,saison,datum,zeit,wettbewerb,code,heim,gast,wir_heim,apps,bank,bericht').order('datum',{ascending:false}).limit(400),
      SVB.sb.from('fde_players').select('key,name').limit(3000)]);
    FB.m=(m.data||[]).map(x=>Object.assign(x,{apps:Array.isArray(x.apps)?x.apps:[],bank:Array.isArray(x.bank)?x.bank:[]})); FB.pl=new Map((p.data||[]).map(r=>[r.key,r.name])); FB.loaded=true; FB.map=null;
  }catch(e){ console.warn('Spielberichte',e); FB.loaded=true; }
  FB.loading=false; fbAfter();
}
function fbAfter(){ try{ fbSyncRows(); }catch(e){} VR._idx=null; VR._rk=null; try{ if(document.querySelector('#panel-verein.active'))vrRender(); }catch(e){} try{ vrHomeCard(); }catch(e){} }

/* Zuordnung Spielbericht-Spieler → Spieler im Datenbestand: zuerst über den FUSSBALL.DE-Link, dann über den Namen */
function fbMap(){
  const k=FB.pl.size+':'+players.length+':'+FB.m.length; if(FB.map&&FB.mapK===k)return FB.map;
  const M=new Map(), byUrl=new Map(), N=s=>TRC.N(s||'').replace(/[^a-z]/g,''), loose=s=>N(s).replace(/ss|ae|oe|ue/g,'');
  players.forEach(p=>{ const m=String(p.fdeUrl||'').match(/(player-id|userid)\/([0-9A-Z]{20,40})/); if(m)byUrl.set((m[1]==='userid'?'u:':'p:')+m[2],p.id); });
  const own=players.filter(p=>p.own), byN=new Map(), byL=new Map();
  const put=(mp,k,id)=>{ if(!k)return; mp.set(k,mp.has(k)&&mp.get(k)!==id?null:id); };
  own.forEach(p=>{ put(byN,N(p.name),p.id); put(byL,loose(p.name),p.id); });
  const keys=new Set(); FB.m.forEach(g=>{ g.apps.forEach(a=>keys.add(a.p)); g.bank.forEach(k=>keys.add(k)); });
  const usedP=new Set(); keys.forEach(k=>{ const id=byUrl.get(k); if(id){ M.set(k,id); usedP.add(id); } });
  keys.forEach(k=>{ if(M.has(k))return; const nm=FB.pl.get(k), id=nm&&(byN.get(N(nm))||byL.get(loose(nm))); if(id&&!usedP.has(id)){ M.set(k,id); usedP.add(id); } });
  FB.map=M; FB.mapK=k; return M;
}
function fbSeasonStart(){ return VR_SEASON_START; }
/* Pflichtspiele der Ersten seit einem Stichtag für einen Spieler */
function fbStats(pid,since,team){
  const M=fbMap(), o={sp:0,start:0,joker:0,tore:0,min:0,pokal:0,spiele:[]};
  for(const g of FB.m){ if(g.team!==(team||'A')||!g.bericht||(since&&g.datum<=since))continue;
    const a=g.apps.find(x=>M.get(x.p)===pid); if(!a)continue;
    o.sp++; if(a.s)o.start++; else o.joker++; o.tore+=a.t||0; o.min+=a.m||0; if(g.code==='PO')o.pokal++; o.spiele.push({g,a}); }
  return o;
}
/* Spieler ohne Eintrag auf der Vereinsseite (Neuzugänge) bekommen eine eigene Zeile in der ewigen Liste */
function fbSyncRows(){
  if(!FB.loaded||!VR.atLoaded)return;
  VR.at=VR.at.filter(r=>!r._fb);
  const M=fbMap(), have=new Set(), pids=new Set();
  const idx=TRS.allTimeIndex(VR.at,[...players.filter(p=>p.own),...players.filter(p=>!p.own)],CRM||{}); idx.byPlayer.forEach((r,pid)=>have.add(pid));
  FB.m.forEach(g=>{ if(g.team==='A'&&g.bericht&&g.datum>fbSeasonStart())g.apps.forEach(a=>{ const pid=M.get(a.p); if(pid)pids.add(pid); }); });
  pids.forEach(pid=>{ if(have.has(pid))return; const p=trP(pid); if(!p)return; VR.at.push({key:'fb:'+pid,name:p.name,tore:0,assists:0,spiele:0,siege:0,quote:null,stand:null,_fb:pid}); });
  VR._idx=null; VR._rk=null;
}
{ const _vi=vrIdx; vrIdx=function(){ const I=_vi.apply(this,arguments); try{ VR.at.forEach(r=>{ if(r._fb&&!I.byPlayer.has(r._fb)){ I.byPlayer.set(r._fb,r); I.used.set(r.key,r._fb); } }); }catch(e){} return I; }; }
{ const _vt=vrTotals; vrTotals=function(pid){ const r=_vt.apply(this,arguments);
  try{ if(FB.loaded){ const since=r.row&&r.row.stand?r.row.stand:fbSeasonStart(), f=fbStats(pid,since);
    if(f.sp){ const ms=Object.assign({sp:0,start:0,joker:0,tore:0,vor:0,s:0,u:0,n:0,zuNull:0},r.ms||{}); ms.spQ=ms.sp;
      if(f.sp>ms.sp){ ms.sp=f.sp; ms.start=f.start; ms.joker=f.joker; } ms.tore=Math.max(ms.tore,f.tore);
      r.ms=ms; r.tot=TRS.totals(r.row,ms); r.fb=f; } } }catch(e){ console.warn(e); }
  return r; }; }
{ const _la=vrLoadAllTime; vrLoadAllTime=async function(){ const r=await _la.apply(this,arguments); try{ fbSyncRows(); if(document.querySelector('#panel-verein.active'))vrRender(); }catch(e){} return r; }; }

/* ---------- Karte „Saison 26/27“ über der ewigen Liste ---------- */
function fbSeasonLabel(){ const y=+VR_SEASON_START.slice(2,4); return y+'/'+(y+1); }
function fbSeasonCard(){
  const G=FB.m.filter(g=>g.team==='A'&&g.datum>fbSeasonStart()), done=G.filter(g=>g.bericht), M=fbMap();
  const agg=new Map(); done.forEach(g=>{ const seen=new Set(); g.apps.forEach(a=>{ const pid=M.get(a.p)||null, k=pid||a.p; if(seen.has(k))return; seen.add(k); const o=agg.get(k)||{pid,k,name:pid?trP(pid).name:(FB.pl.get(a.p)||'Unbekannt'),sp:0,start:0,tore:0,min:0}; o.sp++; if(a.s)o.start++; o.tore+=a.t||0; o.min+=a.m||0; agg.set(k,o); }); });
  const L=[...agg.values()].sort((a,b)=>b.sp-a.sp||b.start-a.start||b.tore-a.tore), T=[...agg.values()].filter(x=>x.tore).sort((a,b)=>b.tore-a.tore||a.sp-b.sp);
  const po=done.filter(g=>g.code==='PO').length, open=G.length-done.length, unmapped=L.filter(x=>!x.pid).length;
  const btn=canTraining()?`<button class="btn ghost sm" id="fbRun">${SVI('refresh')} Jetzt abrufen</button>`:'';
  if(!G.length)return `<div class="card fbcard"><div class="vrat-h"><h3 class="trh" style="margin:0">${SVI('ball')} Saison ${fbSeasonLabel()} · automatisch</h3>${btn}</div><div class="note">Die Spielberichte der Pflichtspiele werden nach jedem Daten-Update von FUSSBALL.DE geholt (Mo, Do und So-Abend). Noch keine Daten.</div></div>`;
  return `<div class="card fbcard"><div class="vrat-h"><h3 class="trh" style="margin:0">${SVI('ball')} Saison ${fbSeasonLabel()} · 1. Mannschaft</h3>${btn}</div>
    <div class="fbstats"><span><b>${done.length}</b> Pflichtspiele${po?` <small>davon ${po} Pokal</small>`:''}</span><span><b>${L.length}</b> eingesetzte Spieler</span><span><b>${T.reduce((a,x)=>a+x.tore,0)}</b> Tore</span></div>
    <div class="fbgrid"><div><h4>Einsätze</h4>${L.slice(0,10).map((x,i)=>`<div class="fbrow" ${x.pid?`data-svp="${svEsc(x.pid)}"`:''}><em>${i+1}</em><b>${svEsc(x.name)}</b><span>${x.sp}<small> · ${x.start}× Startelf</small></span></div>`).join('')}</div>
      <div><h4>Torschützen</h4>${T.slice(0,10).map((x,i)=>`<div class="fbrow" ${x.pid?`data-svp="${svEsc(x.pid)}"`:''}><em>${i+1}</em><b>${svEsc(x.name)}</b><span>${x.tore}<small> in ${x.sp} Sp.</small></span></div>`).join('')||'<div class="note">Noch keine Tore.</div>'}</div></div>
    <div class="note">Automatisch aus den öffentlichen Spielberichten auf FUSSBALL.DE (Meisterschaft <b>und Pokal</b>): zählt direkt in die ewige Liste unten. ${open?open+' Spiel'+(open>1?'e':'')+' noch ohne Bericht (wird nachgeholt). ':''}${unmapped?unmapped+' Spieler noch nicht im Datenbestand zugeordnet.':''}</div></div>`;
}
async function fbRun(btn){
  if(FB.busy)return; FB.busy=true; if(btn){ btn.disabled=true; btn.textContent='Holt Spielberichte …'; }
  try{ const {data:j,error}=await SVB.sb.functions.invoke('spielberichte',{body:{}});
    if(error){ let t=error.message; try{ const x=await error.context.json(); if(x&&x.error)t=x.error; }catch(_){} throw new Error(t); } if(!j||!j.ok)throw new Error((j&&j.error)||'Fehler');
    await fbLoad(true); kToast(`✓ Spielberichte aktualisiert · ${j.spiele_abgerufen||0} Spiele geprüft`);
  }catch(e){ kToast('⚠️ '+e.message); }
  FB.busy=false; if(btn){ btn.disabled=false; btn.innerHTML=SVI('refresh')+' Jetzt abrufen'; }
}
{ const _va=vrViewAllTime; vrViewAllTime=function(B){ const r=_va.apply(this,arguments);
  try{ if(!FB.loaded){ fbLoad(); } else if(VR.at.length){ const h=document.createElement('div'); h.innerHTML=fbSeasonCard(); const c=h.firstElementChild; const tgt=B.querySelector('.vrgrid'); if(tgt)tgt.before(c); else B.prepend(c);
    c.querySelectorAll('[data-svp]').forEach(x=>x.onclick=()=>openModal(x.dataset.svp)); const b=c.querySelector('#fbRun'); if(b)b.onclick=()=>fbRun(b); } }catch(e){ console.warn('Saisonkarte',e); }
  return r; }; }
{ const _si5=svInit; svInit=function(){ const r=_si5.apply(this,arguments); setTimeout(()=>fbLoad(),900); return r; }; }

/* ---------- Runde 12: Spiel-Status je Spieler (Startelf · eingewechselt · Kader · zugeschaut · nicht da) ---------- */
const FG_ST=[['da','Startelf','c1'],['spaet','Eingewechselt','c2'],['bank','Kader','c3'],['zuschauer','Zugeschaut','c4'],['weg','Nicht da','c5']];
/* Spielbericht eines Tages als Vorschlag für „Spiel erfassen“ */
function fbSpielAm(datum){
  if(!FB.loaded)return null; const g=FB.m.find(x=>x.team==='A'&&x.datum===datum&&x.bericht); if(!g)return null;
  const M=fbMap(), rows={}; let fehlt=0;
  g.apps.forEach(a=>{ const pid=M.get(a.p); if(!pid){ fehlt++; return; } rows[pid]={status:a.s?'da':'spaet',tore:a.t||0}; });
  g.bank.forEach(k=>{ const pid=M.get(k); if(!pid){ fehlt++; return; } if(!rows[pid])rows[pid]={status:'bank'}; });
  return {rows,fehlt,gegner:g.wir_heim?g.gast:g.heim,heim:g.wir_heim,code:g.code};
}
/* Alle Pflichtspiele der Ersten seit Saisonstart: erfasste Spiele (App) haben Vorrang, sonst der Spielbericht */
function fbSpielStatus(){
  const since=fbSeasonStart(), M=fbMap(), byDate=new Map();
  (TR.st.sessions||[]).filter(s=>s.t==='spiel'&&s.d>since).forEach(s=>byDate.set(s.d,{d:s.d,app:s}));
  FB.m.filter(g=>g.team==='A'&&g.bericht&&g.datum>since).forEach(g=>{ const o=byDate.get(g.datum)||{d:g.datum}; o.fb=g; byDate.set(g.datum,o); });
  const P=new Map(), get=pid=>{ if(!P.has(pid))P.set(pid,{pid,da:0,spaet:0,bank:0,zuschauer:0,weg:0,gr:{}}); return P.get(pid); };
  const G=[...byDate.values()].sort((a,b)=>a.d<b.d?-1:1);
  G.forEach(x=>{ const seen=new Set();
    if(x.app)(x.app.a||[]).forEach(a=>{ const o=get(a[0]); o[a[1]]=(o[a[1]]||0)+1; if(a[1]==='weg'){ o.gr[a[2]||'ohne']=(o.gr[a[2]||'ohne']||0)+1; } seen.add(a[0]); });
    if(x.fb){ x.fb.apps.forEach(a=>{ const pid=M.get(a.p); if(!pid||seen.has(pid))return; get(pid)[a.s?'da':'spaet']++; seen.add(pid); });
      x.fb.bank.forEach(k=>{ const pid=M.get(k); if(!pid||seen.has(pid))return; get(pid).bank++; seen.add(pid); }); } });
  return {spiele:G.length,erfasst:G.filter(x=>x.app).length,P};
}
function trViewGames(B){
  if(!FB.loaded){ B.innerHTML='<div class="card"><div class="empty">Lade Spielberichte …</div></div>'; fbLoad().then(()=>{ if(TR.view==='games')trViewGames(B); }); return; }
  const S=fbSpielStatus(), squad=trSquad(), rows=squad.map(p=>Object.assign({p},S.P.get(p.id)||{pid:p.id,da:0,spaet:0,bank:0,zuschauer:0,weg:0,gr:{}}));
  S.P.forEach((v,pid)=>{ if(!squad.some(p=>p.id===pid)&&trP(pid))rows.push(Object.assign({p:trP(pid)},v)); });
  rows.sort((a,b)=>(b.da+b.spaet)-(a.da+a.spaet)||b.da-a.da||b.bank-a.bank||a.p.name.localeCompare(b.p.name,'de'));
  const n=Math.max(1,S.spiele), bar=r=>`<div class="fgbar">${FG_ST.map(([k],i)=>r[k]?`<i class="b${i+1}" style="width:${r[k]/n*100}%"></i>`:'').join('')}</div>`;
  B.innerHTML=`<div class="card"><div class="vrat-h"><h3 class="trh" style="margin:0">${SVI('ball')} Spiele ${fbSeasonLabel()} · 1. Mannschaft</h3>${canTraining()?`<button class="btn ghost sm" id="fgRun">${SVI('refresh')} Spielberichte abrufen</button>`:''}</div>
    <div class="note" style="margin-top:6px">${S.spiele} Pflichtspiele (inkl. Pokal) · ${S.erfasst} davon in der App erfasst. Startelf, Einwechslungen und Kader kommen automatisch aus den Spielberichten. „Zugeschaut/unterstützt“ und „nicht da mit Grund“ tragt ihr unter <b>Spiel erfassen</b> ein, oder sie kommen aus der Abstimmung.</div>
    <div class="trtw"><table class="trtab fgtab"><thead><tr><th>Spieler</th>${FG_ST.map(([k,t,c])=>`<th class="${c}">${t}</th>`).join('')}<th></th></tr></thead><tbody>
    ${rows.filter(r=>r.da+r.spaet+r.bank+r.zuschauer+r.weg>0||r.p.kader===1).map(r=>`<tr data-svp="${svEsc(r.p.id)}"><td><b>${svEsc(r.p.name)}</b>${r.p.kader===2?' <small>II</small>':''}</td>
      ${FG_ST.map(([k,,c])=>`<td class="${r[k]?c:''}">${r[k]||'–'}${k==='weg'&&r.weg?`<span class="fggr">${Object.entries(r.gr).map(([g,x])=>svEsc(TRC.REASONS[g]||g)+(x>1?' '+x+'×':'')).join(', ')}</span>`:''}</td>`).join('')}<td>${bar(r)}</td></tr>`).join('')}</tbody></table></div></div>`;
  B.querySelectorAll('tr[data-svp]').forEach(r=>r.onclick=()=>openModal(r.dataset.svp));
  const b=document.getElementById('fgRun'); if(b)b.onclick=async()=>{ await fbRun(b); trViewGames(B); };
}
/* Im Spielerprofil: die fünf Zahlen der Saison */
{ const _om9=openModal; openModal=function(){ const r=_om9.apply(this,arguments); try{ const pid=arguments[0], p=trP(pid), M=document.getElementById('modal');
    if(p&&p.own&&canTraining()&&FB.loaded&&TR.loaded&&M&&!M.querySelector('.fgprofwrap')){ const o=fbSpielStatus().P.get(pid); if(o&&o.da+o.spaet+o.bank+o.zuschauer+o.weg){ const host=M.querySelector('.trprof'); if(host){
      const el=document.createElement('div'); el.className='fgprofwrap'; el.innerHTML=`<h4 class="trh" style="margin-top:12px">${SVI('ball')} Spiele ${fbSeasonLabel()}</h4><div class="fgprof">${FG_ST.map(([k,t,c])=>`<div><b class="${o[k]?c:''}">${o[k]}</b><span>${t}</span></div>`).join('')}</div>${o.weg?`<div class="trabs"><span>Nicht da:</span> ${Object.entries(o.gr).map(([g,x])=>`<i>${svEsc(TRC.REASONS[g]||g)}${x>1?' '+x+'×':''}</i>`).join('')}</div>`:''}`;
      host.appendChild(el); } } } }catch(e){ console.warn('Spielstatus',e); } return r; }; }

/* =====================================================================
   SV/BSC Scout · Runde 11: „Kabine“
   - Abstimmungen: Trainer legt an → Link in die WhatsApp-Gruppe → Spieler tippen ihren Namen und sagen zu/ab (ohne Anmeldung)
     Die App weiß, wer im Kader ist, und zeigt, wer noch fehlt, mit fertigem Erinnerungstext zum Nachhaken
   - Mannschaftskasse: Strafenkatalog, Strafen, Beiträge, Ein-/Ausgaben, Kassenstand. Für alle Spieler transparent über denselben Link,
     bezahlen per PayPal.me (kostenlos), Kassenwart bestätigt
   ===================================================================== */
SV_PAGES.kabine=['Kabine','Abstimmungen per WhatsApp-Link und Mannschaftskasse'];
SV_TBL.kabine=['users','Kabine'];
{ const _ta6=svTabAllowed; svTabAllowed=function(t){ if(t==='kabine')return canTraining(); return _ta6.apply(this,arguments); }; }

const KB={loaded:false,loading:false,view:'abst',polls:[],votes:[],cfg:{},kat:[],buch:[],link:null,showOld:false,kf:'offen'};
const KB_ART={training:'Training',spiel:'Spiel',event:'Event',sonstiges:'Sonstiges'};
const KB_KONTO={bank:['🏦','Bank'],paypal:['🅿️','PayPal'],bar:['💶','Bar']};
const KB_ANS={zu:['Dabei','ok'],vllt:['Vielleicht','mid'],ab:['Nicht dabei','bad']};
const kbEur=v=>(Math.round((+v||0)*100)/100).toLocaleString('de-DE',{style:'currency',currency:'EUR'});
// Strafen in Kästen: Menge statt Euro (0.86). Geldsummen zählen Kästen nie mit
const kbIstKasten=b=>!!b&&b.einheit==='kasten', kbGeld=b=>!kbIstKasten(b);
const kbKst=v=>{ const n=+v||0; return n===1?'1 Kasten':n.toLocaleString('de-DE')+' Kästen'; };
const kbWert=b=>kbIstKasten(b)?kbKst(b.betrag):kbEur(b.betrag);
const KB_KATG=['Training','Spiel','Allgemein'], kbKatG=k=>KB_KATG.includes(k&&k.kategorie)?k.kategorie:'Allgemein';
const kbKatWert=k=>kbIstKasten(k)?kbKst(k.betrag):kbEur(k.betrag)+(+k.pro_minute?' + '+kbEur(k.pro_minute)+' pro Minute':'');
const kbKatSort=L=>L.slice().sort((a,b)=>KB_KATG.indexOf(kbKatG(a))-KB_KATG.indexOf(kbKatG(b))||(a.sort||0)-(b.sort||0)||String(a.titel).localeCompare(String(b.titel),'de'));
function kbTeamCtx(){ try{ return mnCtx(); }catch(e){ return '1'; } }
function kbTeamT(){ return kbTeamCtx()==='2'?'2. Mannschaft':'1. Mannschaft'; }
const kbWd=d=>{ try{ return new Date(d+'T12:00:00').toLocaleDateString('de-DE',{weekday:'short',day:'2-digit',month:'2-digit'}); }catch(e){ return d; } };
const kbIgnKey='svbc_kb_ign';
function kbIgnored(){ try{ return new Set(JSON.parse(localStorage.getItem(kbIgnKey)||'[]')); }catch(e){ return new Set(); } }
function kbIgnore(ref){ try{ const s=kbIgnored(); s.add(ref); localStorage.setItem(kbIgnKey,JSON.stringify([...s].slice(-800))); }catch(e){} }

/* ---------- Laden ---------- */
// Ein erzwungenes Neuladen während eines laufenden Ladens geht nicht verloren: es läuft danach genau einmal nach
async function kbLoad(force){
  if(KB.loading){ if(force)KB.nochmal=true; return KB.loadP; }
  if((KB.loaded&&!force)||!canTraining())return;
  KB.loading=true;
  KB.loadP=(async()=>{ do{ KB.nochmal=false; await kbLoadKern(); }while(KB.nochmal); KB.loading=false; KB.loadP=null; kbAfter(); })();
  return KB.loadP;
}
async function kbLoadKern(){
  try{
    const since=TRC.addDays(trToday(),-120);
    const [p,c,k,b]=await Promise.all([SVB.sb.from('polls').select('*').gte('datum',since).order('datum',{ascending:false}).limit(120),
      SVB.sb.from('kasse_cfg').select('*').eq('id',1).maybeSingle(), SVB.sb.from('kasse_katalog').select('*').order('sort').order('titel').limit(200),
      SVB.sb.from('kasse_buchungen').select('*').order('datum',{ascending:false}).order('created_at',{ascending:false}).limit(3000)]);
    KB.polls=p.data||[]; KB.cfg=c.data||{}; KB.kat=k.data||[]; KB.buch=b.data||[];
    try{ const r=await SVB.sb.rpc('kabine_bot_get'); KB.bot=r.data||null; }catch(e){ KB.bot=null; }
    try{ const r=await SVB.sb.rpc('kabine_popup_get'); KB.popup=!r.error&&!!r.data; }catch(e){ KB.popup=false; }
    try{ const r=await SVB.sb.rpc('kasse_ich'); KB.ich=(!r.error&&r.data)||{darf:true}; }catch(e){ KB.ich={darf:true}; }
    try{ if(!KB.link)await kbLink(); }catch(e){}
    const ids=KB.polls.map(x=>x.id); KB.votes=[];
    if(ids.length){ const v=await SVB.sb.from('poll_votes').select('*').in('poll_id',ids).limit(5000); KB.votes=v.data||[]; }
    KB.loaded=true;
  }catch(e){ console.warn('Kabine',e); KB.loaded=true; }
}
function kbAfter(){ try{ if(document.querySelector('#panel-kabine.active'))kbRender(); }catch(e){ console.warn(e); } try{ kbHomeCard(); }catch(e){} try{ if(!document.querySelector('#panel-kabine.active')){ kbPopup(); kbKassePopup(); } }catch(e){ console.warn(e); } }
async function kbLink(renew){ const {data,error}=await SVB.sb.rpc('team_link',{p_new:!!renew}); if(error)throw new Error(error.message); KB.link=data; return data; }
function kbBase(){ return svBasis(); }
function kbUrl(poll){ const L=KB.bot&&KB.bot.link_url; if(L&&L!==kbBase()&&KB.link)return L+encodeURIComponent(KB.link)+(poll?'#a='+poll:'');
  return kbBase()+'team.html#k='+encodeURIComponent(KB.link||'')+(poll?'&a='+poll:''); }
function kbWa(text){ window.open('https://wa.me/?text='+encodeURIComponent(text),'_blank','noopener'); }
async function kbCopy(t){ try{ await navigator.clipboard.writeText(t); kToast('✓ Kopiert'); }catch(e){ prompt('Zum Kopieren:',t); } }

/* ---------- Abstimmungen: Auswertung ---------- */
function kbVotes(poll){ return KB.votes.filter(v=>v.poll_id===poll.id); }
function kbStat(poll, votes=kbVotes(poll)){
  const V=new Map(votes.map(v=>[v.player_id,v])), T=(poll.teilnehmer||[]);
  const o={zu:[],ab:[],vllt:[],offen:[]}; T.forEach(t=>{ const v=V.get(t.id); (v?o[v.antwort]:o.offen).push(Object.assign({},t,{v})); });
  return o;
}
function kbPollTitle(p){ return `${p.titel} · ${kbWd(p.datum)}${p.zeit?' '+p.zeit:''}`; }
function kbInviteText(p){ return `⚽ *${p.titel}* · ${kbWd(p.datum)}${p.zeit?' um '+p.zeit:''}${p.ort?' ('+p.ort+')':''}\nBist du dabei? Link öffnen, deinen Vor- und Nachnamen antippen und zu- oder absagen, ohne Anmeldung, jederzeit änderbar:\n${kbUrl(p.id)}${p.frist?'\nBis '+new Date(p.frist).toLocaleString('de-DE',{weekday:'short',hour:'2-digit',minute:'2-digit'})+' Uhr':''}`; }
function kbNudgeText(p){ const s=kbStat(p); return `⏰ *${p.titel}* (${kbWd(p.datum)}): Von euch fehlt noch die Antwort · ${s.offen.map(x=>x.name.split(' ')[0]+' '+x.name.split(' ').slice(1).join(' ').slice(0,1)+'.').join(', ')}.\nBitte kurz abstimmen, dauert 5 Sekunden:\n${kbUrl(p.id)}`; }
/* Wer im Kader ist, aber nicht auf der Liste steht (vergessen?) */
function kbForgotten(p){ const ids=new Set((p.teilnehmer||[]).map(t=>t.id)); return vrKader(false).filter(x=>!ids.has(x.id)&&!trInjury(x.id)); }

/* ---------- Seite ---------- */
function kbRender(){
  const P=document.getElementById('panel-kabine'); if(!P)return;
  if(!canTraining()){ P.innerHTML='<div class="card"><div class="empty">Die Kabine sehen Trainer, Kaderplanung und Vorstand.</div></div>'; return; }
  if(!KB.loaded){ P.innerHTML='<div class="card"><div class="empty">Lade Kabine …</div></div>'; kbLoad(); return; }
  const tabs=[['abst','Abstimmungen'],['kasse','Mannschaftskasse'],['kontakte','Kontakte'],['link','Automatik']];
  const act=KB.view==='abst'?`<button class="btn" data-kb-new>${SVI('plus')} Abstimmung</button>`:KB.view==='kasse'?`<button class="btn" data-kb-strafe>${SVI('plus')} Strafe</button><button class="btn ghost" data-kb-buch>${SVI('plus')} Ein-/Ausgabe</button>`:'';
  P.innerHTML=`<div class="trtop"><div class="trtabs">${tabs.map(([k,t])=>`<button class="${KB.view===k?'on':''}" data-kbv="${k}">${t}</button>`).join('')}</div><div class="tract">${act}</div></div><div id="kbBody"></div>`;
  P.querySelectorAll('[data-kbv]').forEach(b=>b.onclick=()=>{ KB.view=b.dataset.kbv; kbRender(); });
  const nb=P.querySelector('[data-kb-new]'); if(nb)nb.onclick=()=>kbPollEditor(null);
  const sb=P.querySelector('[data-kb-strafe]'); if(sb)sb.onclick=()=>kbStrafeEditor();
  const bb=P.querySelector('[data-kb-buch]'); if(bb)bb.onclick=()=>kbBuchEditor();
  const B=document.getElementById('kbBody');
  ({abst:kbViewPolls,kasse:kbViewKasse,kontakte:kxView,link:kbViewLink})[KB.view](B);
}

/* ----- Abstimmungen ----- */
function kbSuggest(){
  const out=[], today=trToday();
  try{ if(typeof spNext==='function'&&SP.loaded){ const f=spNext('A')[0]; if(f&&TRC.diffDays(f.datum,today)<=10&&!KB.polls.some(p=>p.datum===f.datum&&p.art==='spiel'))
    out.push({titel:`Spiel ${f.heim_key===SP_OWN.A?'gegen '+f.gast:'bei '+f.heim}`,art:'spiel',datum:f.datum,zeit:f.zeit||'',ort:f.heim_key===SP_OWN.A?'Heim':'Auswärts'}); } }catch(e){}
  // nächste zwei Trainingstage aus den letzten Einheiten ableiten (häufigste Wochentage)
  try{ const wd={}; TR.st.sessions.filter(s=>s.t==='training').slice(0,24).forEach(s=>{ const d=new Date(s.d+'T12:00:00').getDay(); wd[d]=(wd[d]||0)+1; });
    let days=Object.entries(wd).sort((a,b)=>b[1]-a[1]).slice(0,2).map(x=>+x[0]); if(!days.length)days=[2,4];
    for(let i=1;i<=9&&out.filter(x=>x.art==='training').length<2;i++){ const d=TRC.addDays(today,i); if(days.includes(new Date(d+'T12:00:00').getDay())&&!KB.polls.some(p=>p.datum===d&&p.art==='training'))out.push({titel:'Training',art:'training',datum:d,zeit:'19:00',ort:''}); } }catch(e){}
  return out.sort((a,b)=>a.datum<b.datum?-1:1).slice(0,3);
}
function kbViewPolls(B){
  const today=trToday(), open=KB.polls.filter(p=>p.datum>=today&&!p.geschlossen).sort((a,b)=>a.datum<b.datum?-1:1), old=KB.polls.filter(p=>!open.includes(p));
  const sug=kbSuggest();
  const card=p=>{ const s=kbStat(p), n=(p.teilnehmer||[]).length, pc=x=>n?Math.round(x/n*100):0, fg=kbForgotten(p).length;
    return `<div class="card kbpoll" data-poll="${p.id}"><div class="kbp-h"><div><span class="trpill">${svEsc(KB_ART[p.art]||p.art)}</span> <b>${svEsc(p.titel)}</b><small>${kbWd(p.datum)}${p.zeit?' · '+svEsc(p.zeit):''}${p.ort?' · '+svEsc(p.ort):''}${p.auto?' · 🤖 automatisch':''}${p.geteilt_at?` · ✓ in der Gruppe${p.geteilt_von?' ('+svEsc(p.geteilt_von.split(' ')[0])+')':''}`:p.gesendet_at?' · ✓ Link verschickt':''}${p.erinnert_at?' · ✓ nachgehakt':''}</small></div>
        <div class="kbnum"><b class="ok">${s.zu.length}</b><b class="mid">${s.vllt.length}</b><b class="bad">${s.ab.length}</b><b>${s.offen.length}</b></div></div>
      <div class="kbbar"><i class="ok" style="width:${pc(s.zu.length)}%"></i><i class="mid" style="width:${pc(s.vllt.length)}%"></i><i class="bad" style="width:${pc(s.ab.length)}%"></i></div>
      <div class="kblegend"><span class="ok">${s.zu.length} dabei</span><span class="mid">${s.vllt.length} vielleicht</span><span class="bad">${s.ab.length} können nicht</span><span>${s.offen.length} ohne Antwort</span></div>
      ${s.offen.length&&s.offen.length<n?`<div class="kbmiss"><b>Noch offen:</b> ${s.offen.map(x=>svEsc(x.name)).join(', ')}</div>`:''}
      ${fg?`<div class="kbmiss warn">⚠️ ${fg} ${fg>1?'Spieler aus dem Kader stehen':'Spieler aus dem Kader steht'} nicht auf der Liste. Vergessen? <button class="lnk" data-kb-fg="${p.id}">Ansehen</button></div>`:''}
      <div class="btnrow"><button class="btn sm${p.geteilt_at?' ghost':''}" data-kb-share="${p.id}">${SVI('share')} ${p.geteilt_at?'Nochmal teilen':'In die Gruppe teilen'}</button>${s.offen.length?`<button class="btn ghost sm" data-kb-nudge="${p.id}">${SVI('bell')} Nachhaken (${s.offen.length})</button>`:''}<button class="btn ghost sm" data-kb-det="${p.id}">Details</button></div></div>`; };
  B.innerHTML=`${!open.length?`<div class="card kbempty"><h3 class="trh">${SVI('users')} Wer ist dabei?</h3><p>Leg eine Abstimmung an, teile den Link in der WhatsApp-Gruppe, die Spieler tippen ihren Namen und sagen mit einem Klick zu oder ab. Kein Login, keine App nötig. Du siehst sofort, wer fehlt, und kannst gezielt nachhaken.</p></div>`:''}
    ${sug.length?`<div class="kbsug"><span>Schnell anlegen:</span>${sug.map((x,i)=>`<button class="pchip" data-kb-sug="${i}">${svEsc(x.titel)} · ${kbWd(x.datum)}</button>`).join('')}</div>`:''}
    ${open.map(card).join('')}
    ${old.length?`<button class="btn ghost sm" id="kbOld">${KB.showOld?'Vergangene ausblenden':`Vergangene Abstimmungen (${old.length})`}</button>${KB.showOld?`<div class="kbold">${old.map(p=>{ const s=kbStat(p); return `<div class="kbo" data-kb-det="${p.id}"><b>${svEsc(p.titel)}</b><small>${kbWd(p.datum)}</small><span class="ok">${s.zu.length}</span><span class="bad">${s.ab.length}</span><span>${s.offen.length} offen</span></div>`; }).join('')}</div>`:''}`:''}`;
  B.querySelectorAll('[data-kb-sug]').forEach(b=>b.onclick=()=>kbPollEditor(null,sug[+b.dataset.kbSug]));
  B.querySelectorAll('[data-kb-share]').forEach(b=>b.onclick=()=>kbShare(KB.polls.find(x=>x.id===b.dataset.kbShare)));
  B.querySelectorAll('[data-kb-nudge]').forEach(b=>b.onclick=async()=>{ const p=KB.polls.find(x=>x.id===b.dataset.kbNudge); try{ await kbLink(); kbWa(kbNudgeText(p)); }catch(e){ kToast('⚠️ '+e.message); } });
  B.querySelectorAll('[data-kb-det]').forEach(b=>b.onclick=()=>kbPollDetail(b.dataset.kbDet));
  B.querySelectorAll('[data-kb-fg]').forEach(b=>b.onclick=()=>kbPollDetail(b.dataset.kbFg));
  const ob=document.getElementById('kbOld'); if(ob)ob.onclick=()=>{ KB.showOld=!KB.showOld; kbViewPolls(B); };
  B.insertAdjacentHTML('beforeend',`<div class="kbpop-set"><span>${SVI('bell')} Einladen-Pop-up für mich</span><button class="btn ghost sm" id="kbPopT">${KB.popup?'An':'Aus'}</button></div>`);
  document.getElementById('kbPopT').onclick=async()=>{ const {data,error}=await SVB.sb.rpc('kabine_popup_set',{p_an:!KB.popup}); if(error)return kToast('⚠️ '+error.message); KB.popup=!!data; kToast(KB.popup?'✓ Pop-up an: du wirst vor jedem Training ans Einladen erinnert':'✓ Pop-up aus'); kbViewPolls(B); };
}
// Mannschaft eines Spielers (Saisonplanung vor Datenbestand); 0.87: auch Spieler der Zweiten ohne Kader-Kennzeichen
function kbTeamVon(p){ try{ const t=mnTeam(p); if(t==='1'||t==='2')return t; }catch(e){} return p.kader===2?'2':p.kader===1?'1':null; }
function kbSquadAll(){ const ctx=(()=>{ try{ return mnCtx(); }catch(e){ return '1'; } })(), o=p=>kbTeamVon(p)===ctx?0:1;
  const intern=p=>{ try{ return mnIsIntern(p); }catch(e){ return p.own&&!p.isJugend&&!p.verzicht; } };
  return players.filter(p=>{ const t=kbTeamVon(p); return (t==='1'||t==='2')&&intern(p); }).sort((a,b)=>o(a)-o(b)||(kbTeamVon(a)||'1').localeCompare(kbTeamVon(b)||'1')||a.name.localeCompare(b.name,'de')); }
function kbPollEditor(id,pre,geoeffnet){
  const p0=id?(geoeffnet?.id===id?geoeffnet:KB.polls.find(x=>x.id===id)):null, pr=pre||{};
  if(id&&!p0) return kToast('Diese Abstimmung konnte nicht geladen werden.');
  const st={titel:p0?p0.titel:(pr.titel||'Training'),art:p0?p0.art:(pr.art||'training'),datum:p0?p0.datum:(pr.datum||TRC.addDays(trToday(),1)),zeit:p0?p0.zeit||'':(pr.zeit||'19:00'),ort:p0?p0.ort||'':(pr.ort||''),notiz:p0?p0.notiz||'':'',
    frist:p0&&p0.frist?p0.frist.slice(0,16):'', sel:new Set(p0?(p0.teilnehmer||[]).map(t=>t.id):vrKader(false).map(x=>x.id))};
  svModal(`<div class="mhead"><div class="rm-ic" style="width:46px;height:46px">${SVI('users')}</div><div><h2 style="margin:0">${p0?'Abstimmung bearbeiten':'Neue Abstimmung'}</h2><div class="msub">Danach „In WhatsApp teilen“. Die Spieler stimmen über den Link ab</div></div></div><div id="kbEd"></div>`);
  const draw=()=>{ const E=document.getElementById('kbEd'); if(!E)return; const all=kbSquadAll();
    E.innerHTML=`<div class="kbform"><div class="field"><label>Titel</label><input id="kbT" maxlength="120" value="${svEsc(st.titel)}"></div>
      <div class="field"><label>Art</label><select id="kbA">${Object.entries(KB_ART).map(([k,t])=>`<option value="${k}"${st.art===k?' selected':''}>${t}</option>`).join('')}</select></div>
      <div class="field"><label>Datum</label><input id="kbD" type="date" value="${svEsc(st.datum)}"></div><div class="field"><label>Uhrzeit</label><input id="kbZ" maxlength="10" value="${svEsc(st.zeit)}" placeholder="19:00"></div>
      <div class="field"><label>Ort / Treffpunkt</label><input id="kbO" maxlength="120" value="${svEsc(st.ort)}" placeholder="z.B. Sportplatz, 45 Min. vorher"></div>
      <div class="field"><label>Antworten bis (optional)</label><input id="kbF" type="datetime-local" value="${svEsc(st.frist)}"></div>
      <div class="field kbwide"><label>Hinweis (optional)</label><input id="kbN" maxlength="500" value="${svEsc(st.notiz)}" placeholder="z.B. Bitte Laufschuhe mitbringen"></div></div>
      <div class="sbsec"><h4>Wer soll abstimmen? <small>${st.sel.size} ausgewählt</small></h4>
        <div class="btnrow" style="margin-bottom:8px"><button type="button" class="btn ghost sm" data-g="1">1. Mannschaft</button><button type="button" class="btn ghost sm" data-g="2">2. Mannschaft</button><button type="button" class="btn ghost sm" data-g="12">Beide</button><button type="button" class="btn ghost sm" data-g="0">Keiner</button></div>
        <div class="chips kbchips">${all.map(x=>`<button type="button" class="pchip${st.sel.has(x.id)?' on':''}" data-pl="${svEsc(x.id)}">${svEsc(x.name)}${kbTeamVon(x)==='2'?' <small>II</small>':''}${trInjury(x.id)?' 🩹':''}</button>`).join('')}</div></div>
      <div class="btnrow sbact"><button class="btn" id="kbSave">${p0?'Speichern':'Anlegen'}</button><button class="btn ghost" id="kbCancel">Abbrechen</button>${p0?`<button class="btn ghost" id="kbDel" style="margin-left:auto;color:#fca5a5">Löschen</button>`:''}</div>`;
    const keep=()=>{ st.titel=document.getElementById('kbT').value; st.art=document.getElementById('kbA').value; st.datum=document.getElementById('kbD').value; st.zeit=document.getElementById('kbZ').value; st.ort=document.getElementById('kbO').value; st.frist=document.getElementById('kbF').value; st.notiz=document.getElementById('kbN').value; };
    document.getElementById('kbA').onchange=()=>{ keep(); if(!p0&&/^(Training|Spiel|Event|Sonstiges)$/.test(st.titel))st.titel=KB_ART[st.art]; draw(); };
    E.querySelectorAll('[data-pl]').forEach(b=>b.onclick=()=>{ keep(); const k=b.dataset.pl; if(st.sel.has(k))st.sel.delete(k); else st.sel.add(k); draw(); });
    E.querySelectorAll('[data-g]').forEach(b=>b.onclick=()=>{ keep(); const g=b.dataset.g; st.sel=new Set(g==='0'?[]:all.filter(x=>g==='12'||kbTeamVon(x)===g).map(x=>x.id)); draw(); });
    document.getElementById('kbCancel').onclick=()=>closeOverlay();
    const del=document.getElementById('kbDel'); if(del)del.onclick=async()=>{ if(!confirm('Abstimmung samt Antworten löschen?'))return; const {error}=await SVB.sb.from('polls').delete().eq('id',p0.id); if(error)return kToast('⚠️ '+error.message); closeOverlay(); await kbLoad(true); kToast('Abstimmung gelöscht'); };
    document.getElementById('kbSave').onclick=async()=>{ keep();
      if(!st.titel.trim())return kToast('Bitte einen Titel angeben'); if(!st.datum)return kToast('Bitte ein Datum angeben'); if(!st.sel.size)return kToast('Bitte mindestens einen Spieler auswählen');
      if(st.sel.size>80)return kToast('Höchstens 80 Spieler');
      const tn=[...st.sel].map(id=>({id,name:(trP(id)||{}).name||id}));
      const row={titel:st.titel.trim().slice(0,120),art:st.art,datum:st.datum,zeit:st.zeit.trim()||null,ort:st.ort.trim()||null,notiz:st.notiz.trim()||null,frist:st.frist?new Date(st.frist).toISOString():null,teilnehmer:tn};
      const b=document.getElementById('kbSave'); b.disabled=true;
      const q=p0?SVB.sb.from('polls').update(row).eq('id',p0.id).select().single():SVB.sb.from('polls').insert(row).select().single();
      const {data,error}=await q; if(error){ b.disabled=false; return kToast('⚠️ '+error.message); }
      closeOverlay(); await kbLoad(true); kToast(p0?'✓ Gespeichert':'✓ Abstimmung angelegt: jetzt in WhatsApp teilen');
      if(!p0&&data){ try{ await kbLink(); if(confirm('Direkt in WhatsApp teilen?'))kbWa(kbInviteText(data)); }catch(e){} } };
  };
  draw();
}
// Einzeldetails haben keine Datums- oder Mengenbegrenzung der Kabinenübersicht.
async function kbAbstimmungOeffnen(pollId,team,art,darf){
  const modal=svModal('<h2>Rückmeldungen</h2><div data-hzantwort role="status">Antworten werden geladen …</div>');
  const status=modal.querySelector('[data-hzantwort]');
  const offen=()=>status.isConnected && status.closest('#overlay.open') && svCurTab()==='kabine' &&
    KB.view==='abst' && mnCtx()===team && svTabAllowed('kabine') && darf();
  try{
    if(KB.loading) await KB.loadP;
    if(!offen()) return;
    const poll=await SVB.sb.from('polls').select('*').eq('id',pollId).eq('team',team).eq('art',art).single();
    if(poll.error || !poll.data) throw new Error();
    const votes=[];
    for(let offset=0;;offset+=500){
      if(!offen()) return;
      const page=await SVB.sb.from('poll_votes').select('*').eq('poll_id',pollId).order('player_id').range(offset,offset+499);
      if(page.error || !Array.isArray(page.data)) throw new Error();
      votes.push(...page.data);
      if(page.data.length<500) break;
    }
    if(!offen()) return;
    KB.polls=(KB._p31all||KB.polls).filter(p=>p.id!==pollId).concat(poll.data);
    mn31KbFilter();
    KB.votes=KB.votes.filter(v=>v.poll_id!==pollId).concat(votes);
    kbPollDetail(pollId,{team,art,darf,votes});
  }catch(e){
    if(!offen()) return;
    status.innerHTML='<p>Die Rückmeldungen konnten nicht geladen werden.</p><button type="button" class="btn">Erneut versuchen</button>';
    status.querySelector('button').onclick=()=>kbAbstimmungOeffnen(pollId,team,art,darf);
  }
}
function kbSpielhinweis(p, modal){
  if(p.art!=='spiel' || p.geschlossen || p.event_id || !svTabAllowed('kabine') || !canTraining()) return;
  const box=document.createElement('div'), label=document.createElement('span'), button=document.createElement('button');
  box.className='kbpop-set';
  label.textContent='Hinweis für mich, wenn in den letzten zwei Stunden vor Anstoß weniger als elf Spieler zugesagt haben.';
  button.type='button'; button.className='btn ghost'; button.style.minWidth='44px'; button.style.minHeight='44px';
  box.append(label,button);
  const detail=modal.querySelector('#kbDet');
  async function laden(an){
    button.disabled=true;
    try{
      const {data,error}=await SVB.sb.rpc('mein_spielhinweis',{p_poll:p.id,p_an:an});
      if(!detail.isConnected || !modal.contains(detail)) return;
      if(error) throw error;
      if(typeof data!=='boolean'){ box.remove(); return; }
      detail.before(box);
      button.textContent=data?'An':'Aus';
      button.setAttribute('aria-label','Hinweis für dieses Spiel');
      button.setAttribute('aria-pressed',String(data));
      button.onclick=()=>laden(!data);
    }catch(e){
      if(!detail.isConnected || !modal.contains(detail)) return;
      detail.before(box);
      button.textContent='Erneut laden';
      button.removeAttribute('aria-label');
      button.removeAttribute('aria-pressed');
      button.onclick=()=>laden(null);
      kToast('Der Stand des Spielhinweises konnte nicht geladen werden.');
    }finally{ button.disabled=false; }
  }
  laden(null);
}
function kbPollDetail(id,direkt){
  const p=KB.polls.find(x=>x.id===id); if(!p)return;
  const modal=svModal(`<div class="mhead"><div class="rm-ic" style="width:46px;height:46px">${SVI('users')}</div><div><h2 style="margin:0">${svEsc(p.titel)}</h2><div class="msub">${kbWd(p.datum)}${p.zeit?' · '+svEsc(p.zeit):''}${p.ort?' · '+svEsc(p.ort):''}</div></div></div><div id="kbDet"></div>`);
  kbSpielhinweis(p,modal);
  const E=modal.querySelector('#kbDet');
  const offen=()=>E.isConnected && E.closest('#overlay.open') && (!direkt ||
    (svCurTab()==='kabine' && KB.view==='abst' && mnCtx()===direkt.team && svTabAllowed('kabine') && direkt.darf()));
  const stimmen=()=>direkt ? direkt.votes : kbVotes(p);
  async function aendern(auftrag){
    if(E.inert || !offen()) return;
    E.inert=true;
    try{
      const {error}=await auftrag();
      if(error) throw error;
      if(!offen()) return;
      if(direkt) await kbAbstimmungOeffnen(id,direkt.team,direkt.art,direkt.darf);
      else {
        await kbLoad(true);
        if(offen()) kbPollDetail(id);
      }
    }catch(e){ if(offen()) kToast('Die Änderung konnte nicht gespeichert werden.'); }
    finally{ E.inert=false; }
  }
  let such='';
  const draw=()=>{ const s=kbStat(p,stimmen()), fg=kbForgotten(p);
    const row=x=>{ const v=x.v; return `<div class="kbr"><b>${svEsc(x.name)}${x.gast?' <span class="trpill mid" title="Hat sich selbst über den Gruppenlink eingetragen">neu</span>':''}</b>${v&&v.grund?`<small>${svEsc(TRC.REASONS[v.grund]||v.grund)}</small>`:''}${v&&v.notiz?`<small>„${svEsc(v.notiz)}“</small>`:''}${v?`<em>${v.via==='link'?'über Link':'vom Trainer'} · ${new Date(v.at).toLocaleString('de-DE',{weekday:'short',hour:'2-digit',minute:'2-digit'})}</em>`:''}
      <div class="trseg">${(v&&v.antwort==='vllt'?['zu','vllt','ab']:['zu','ab']).map(a=>`<button type="button" data-set="${svEsc(x.id)}:${a}" class="${v&&v.antwort===a?'on':''}">${KB_ANS[a][0]}</button>`).join('')}</div></div>`; };
    E.innerHTML=`${p.geteilt_at?`<div class="note">✓ In die Gruppe geteilt${p.geteilt_von?' von '+svEsc(p.geteilt_von):''} · ${new Date(p.geteilt_at).toLocaleString('de-DE',{weekday:'short',hour:'2-digit',minute:'2-digit'})} Uhr</div>`:''}${[['zu','Dabei'],['vllt','Vielleicht'],['ab','Nicht dabei'],['offen','Ohne Antwort']].map(([k,t])=>s[k].length?`<div class="sbsec"><h4>${t} <small>${s[k].length}</small></h4>${s[k].map(row).join('')}</div>`:'').join('')}
      ${fg.length?`<div class="sbsec"><h4>Im Kader, aber nicht auf der Liste <small>${fg.length}</small></h4><div class="chips">${fg.map(x=>`<button type="button" class="pchip" data-add="${svEsc(x.id)}">+ ${svEsc(x.name)}</button>`).join('')}</div></div>`:''}
      <div class="sbsec kbadd"><h4>Spieler dazunehmen <small>auch aus der anderen Mannschaft oder der Jugend</small></h4><input id="kbAddQ" class="kbaddq" type="search" placeholder="Name eintippen" value="${svEsc(such)}" autocomplete="off"><div class="chips" id="kbAddL">${kbAddTreffer(p,such)}</div>
        <p class="note small">Wer noch gar nicht in der App steht, trägt sich über den Gruppenlink selbst ein und erscheint dann als „neu“.</p></div>
      <div class="btnrow sbact"><button class="btn" id="kbTr">${SVI('activity')} ${p.art==='spiel'?'Spiel':'Anwesenheit'} vorbereiten</button><button class="btn ghost" id="kbSh">${SVI('share')} ${p.geteilt_at?'Nochmal teilen':'In die Gruppe teilen'}</button><button class="btn ghost" id="kbCp">${SVI('copy')} Link kopieren</button><button class="btn ghost" id="kbEdit">Bearbeiten</button>
        <button class="btn ghost" id="kbClose">${p.geschlossen?'Wieder öffnen':'Abstimmung schließen'}</button></div>
      <div class="note">„Vorbereiten“ übernimmt die Antworten ins Training bzw. Spiel: Zusagen als da (beim Spiel: im Kader), Absagen mit Grund. Beim Spiel danach „Aus Spielbericht übernehmen“. Startelf und Einwechslungen kommen automatisch.</div>`;
    E.querySelectorAll('[data-set]').forEach(b=>b.onclick=()=>aendern(()=>{ const [pid,a]=b.dataset.set.split(':'); const cur=stimmen().find(v=>v.player_id===pid);
      return cur&&cur.antwort===a?SVB.sb.from('poll_votes').delete().eq('poll_id',p.id).eq('player_id',pid):SVB.sb.from('poll_votes').upsert({poll_id:p.id,player_id:pid,antwort:a,grund:a==='ab'?(cur&&cur.grund)||null:null,via:'app',at:new Date().toISOString()}); }));
    const aq=document.getElementById('kbAddQ'); if(aq)aq.oninput=()=>{ such=aq.value; const L=document.getElementById('kbAddL'); if(L){ L.innerHTML=kbAddTreffer(p,such); L.querySelectorAll('[data-add]').forEach(b=>b.onclick=()=>add(b.dataset.add)); } };
    const add=id=>{ const x=trP(id); if(x) return aendern(()=>SVB.sb.from('polls').update({teilnehmer:[...(p.teilnehmer||[]),{id:x.id,name:x.name}]}).eq('id',p.id)); };
    E.querySelectorAll('[data-add]').forEach(b=>b.onclick=()=>add(b.dataset.add));
    document.getElementById('kbTr').onclick=async()=>{
      if(!offen()) return;
      const vorlage={poll:p,votes:stimmen()}, team=p.team||'1';
      closeOverlay(); mnCtxSet(team,false); goTab('training');
      await trLoad();
      if(svCurTab()!=='training' || mnCtx()!==team || document.querySelector('#overlay.open')) return;
      if(p.art==='spiel') svmSpielBewerten({datum:p.datum,vorlage});
      else sv50Quick(p.datum,null,null,vorlage);
    };
    document.getElementById('kbCp').onclick=async()=>{ try{ await kbLink(); kbCopy(kbUrl(p.id)); }catch(e){ kToast('⚠️ '+e.message); } };
    document.getElementById('kbSh').onclick=()=>kbShare(p);
    document.getElementById('kbEdit').onclick=()=>{ closeOverlay(); kbPollEditor(p.id,null,p); };
    document.getElementById('kbClose').onclick=()=>aendern(()=>SVB.sb.from('polls').update({geschlossen:!p.geschlossen}).eq('id',p.id));
  };
  draw();
}

// Suche nach Spielern, die noch nicht auf der Liste stehen (eigene Spieler aller Mannschaften, auch Jugend)
function kbAddTreffer(p,q){ q=String(q||'').trim().toLowerCase(); if(q.length<2)return '';
  const ids=new Set((p.teilnehmer||[]).map(t=>t.id)), L=players.filter(x=>!ids.has(x.id)&&(x.isJugend?(typeof juEigen==='function'&&juEigen(x)):x.own)&&!x.verzicht&&String(x.name||'').toLowerCase().includes(q)).slice(0,12);
  return L.length?L.map(x=>{ const t=kbTeamVon(x); return `<button type="button" class="pchip" data-add="${svEsc(x.id)}">+ ${svEsc(x.name)}${x.isJugend?' <small>Jugend</small>':t==='2'?' <small>II</small>':''}</button>`; }).join(''):'<span class="note small">Niemand gefunden.</span>'; }

/* ----- Mannschaftskasse ----- */
const KB_DEFAULT_KAT=[['Zu spät zum Training',5,'Training',1],['Training unentschuldigt gefehlt',10,'Training'],['Zu spät zum Spiel / Treffpunkt',10,'Spiel',1],['Spiel unentschuldigt gefehlt',25,'Spiel'],
  ['Gelbe Karte wegen Meckern',10,'Spiel'],['Gelb-Rote Karte',15,'Spiel'],['Rote Karte',25,'Spiel'],['Keine Rückmeldung bei Abstimmung',2,'Allgemein'],['Handy in der Kabine',5,'Allgemein'],['Ausrüstung vergessen',5,'Allgemein'],
  ['Monatsbeitrag Mannschaftskasse',5,'Allgemein'],['Geburtstag',1,'Allgemein',null,'kasten']];
function kbSaldo(){
  const ALL=(KB._b31all||KB.buch).filter(kbGeld), MEIN=KB.buch.filter(kbGeld);
  const bez=ALL.filter(b=>b.status==='bezahlt'), plus=bez.filter(b=>b.art!=='ausgabe').reduce((a,b)=>a+ +b.betrag,0), minus=bez.filter(b=>b.art==='ausgabe').reduce((a,b)=>a+ +b.betrag,0);
  const offen=MEIN.filter(b=>b.status==='offen'||b.status==='gemeldet').reduce((a,b)=>a+ +b.betrag,0);
  const kaesten=KB.buch.filter(b=>kbIstKasten(b)&&(b.status==='offen'||b.status==='gemeldet')).reduce((a,b)=>a+ +b.betrag,0);
  const c=KB.cfg||{}, k={bank:+c.anfang||0,paypal:+c.anfang_paypal||0,bar:+c.anfang_bar||0};
  bez.forEach(b=>{ const kk=b.konto||'bank'; k[kk]=(k[kk]||0)+(b.art==='ausgabe'?-b.betrag:+b.betrag); });
  Object.keys(k).forEach(x=>k[x]=Math.round(k[x]*100)/100);
  return {stand:k.bank+k.paypal+k.bar,konten:k,offen,kaesten,plus,minus,gemeldet:ALL.filter(b=>b.status==='gemeldet')};
}
function kbByPlayer(){
  const M=new Map(); KB.buch.filter(b=>b.player_id&&(b.art==='strafe'||b.art==='beitrag')).forEach(b=>{ const o=M.get(b.player_id)||{pid:b.player_id,name:(trP(b.player_id)||{}).name||b.name||b.player_id,offen:0,bez:0,n:0,kOffen:0}; o.n++;
    if(kbIstKasten(b)){ if(b.status==='offen'||b.status==='gemeldet')o.kOffen+= +b.betrag; }
    else if(b.status==='offen'||b.status==='gemeldet')o.offen+= +b.betrag; else if(b.status==='bezahlt')o.bez+= +b.betrag; M.set(b.player_id,o); });
  return [...M.values()].sort((a,b)=>b.offen-a.offen||b.kOffen-a.kOffen||b.bez-a.bez);
}
function kbKatFind(rx,fb){ return KB.kat.find(k=>k.aktiv&&rx.test(TRC.N(k.titel)))||{titel:fb[0],betrag:fb[1],einheit:fb[2]||'eur'}; }
// Geburtstage der Mannschaft in den letzten drei Wochen: ein Kasten (oder was im Katalog steht)
function kbGeburtstage(){
  const out=[], heute=trToday(), J=+heute.slice(0,4), von=TRC.addDays(heute,-21);
  let L=[]; try{ L=(typeof mnIntern==='function'?mnIntern():kbSquadAll()); }catch(e){ L=kbSquadAll(); }
  const k=kbKatFind(/geburtstag/,['Geburtstag',1,'kasten']);
  L.forEach(p=>{ const g=String(p.geb||''); if(!/^\d{4}-\d{2}-\d{2}/.test(g))return;
    [J,J-1].forEach(j=>{ const d=j+g.slice(4,10); if(d>=von&&d<=heute)out.push({ref:`geb:${p.id}:${j}`,pid:p.id,titel:k.titel,betrag:+k.betrag||1,einheit:k.einheit||'eur',art:'beitrag',datum:d,why:`Geburtstag am ${TRC.fmt(d)}`}); }); });
  return out;
}
/* Vorschläge: aus Anwesenheit (zu spät / unentschuldigt) und Abstimmungen ohne Antwort nach Fristende */
function kbVorschlaege(){
  const out=[], refs=new Set(KB.buch.map(b=>b.ref).filter(Boolean)), ign=kbIgnored(), since=TRC.addDays(trToday(),-45);
  try{ TR.st.sessions.filter(s=>s.d>=since).forEach(s=>(s.a||[]).forEach(a=>{ const pid=a[0];
    if((a[1]==='spaet'&&s.t!=='spiel')||/zu sp(ä|ae)t/i.test(a[5]||'')){ const k=kbKatFind(s.t==='spiel'?/spaet.*spiel|spiel.*spaet|treffpunkt/:/spaet.*training|training.*spaet|^zu spaet/,[s.t==='spiel'?'Zu spät zum Spiel':'Zu spät zum Training',s.t==='spiel'?10:5]);
      out.push({ref:`att:${s.id}:${pid}`,pid,titel:k.titel,betrag:+k.betrag,einheit:k.einheit||'eur',pm:+k.pro_minute||0,datum:s.d,why:`${s.t==='spiel'?'Spiel':'Training'} ${TRC.fmt(s.d)}: zu spät`}); }
    if(a[1]==='weg'&&a[2]==='ohne'){ const k=kbKatFind(s.t==='spiel'?/spiel.*(unentschuldigt|gefehlt)/:/training.*(unentschuldigt|gefehlt)|unentschuldigt/,[s.t==='spiel'?'Spiel unentschuldigt gefehlt':'Training unentschuldigt gefehlt',s.t==='spiel'?25:10]);
      out.push({ref:`att:${s.id}:${pid}`,pid,titel:k.titel,betrag:+k.betrag,einheit:k.einheit||'eur',datum:s.d,why:`${s.t==='spiel'?'Spiel':'Training'} ${TRC.fmt(s.d)}: ohne Grund gefehlt`}); } })); }catch(e){}
  try{ out.push(...kbGeburtstage()); }catch(e){}
  try{ const now=new Date().toISOString(); KB.polls.filter(p=>p.frist&&p.frist<now&&p.datum>=since&&p.art!=='event').forEach(p=>{ const s=kbStat(p); const k=kbKatFind(/rueckmeldung|abstimmung|abgestimmt/,['Keine Rückmeldung bei Abstimmung',2]);
    s.offen.forEach(x=>out.push({ref:`poll:${p.id}:${x.id}`,pid:x.id,titel:k.titel,betrag:+k.betrag,einheit:k.einheit||'eur',datum:p.datum,why:`Keine Antwort bei „${p.titel}“ (${kbWd(p.datum)})`})); }); }catch(e){}
  return out.filter(v=>!refs.has(v.ref)&&!ign.has(v.ref)&&v.betrag>0&&trP(v.pid));
}
function kbViewKasse(B){
  const S=kbSaldo(), BP=kbByPlayer(), V=kbVorschlaege(), cfg=KB.cfg||{};
  const stat=b=>({offen:['offen','mid'],gemeldet:['gemeldet','mid'],bezahlt:['bezahlt','ok'],erlassen:['erlassen','']}[b.status]);
  const list=KB.buch.filter(b=>KB.kf==='alle'||(KB.kf==='offen'?(b.status==='offen'||b.status==='gemeldet'):KB.kf==='bewegung'?(b.art==='einzahlung'||b.art==='ausgabe'):true)).slice(0,120);
  const darf=!KB.ich||KB.ich.darf!==false;
  B.innerHTML=`<div class="kbstats"><div class="kbst kbflipw">${kbFlipHtml(S.konten,'kbFlip')}</div><div class="kbst"><span>Noch offen · ${kbTeamT()}</span><b class="mid">${kbEur(S.offen)}</b>${S.kaesten?`<small class="kbkst">+ ${kbKst(S.kaesten)}</small>`:''}</div>
      <div class="kbst"><span>Zu prüfen</span><b class="${S.gemeldet.length?'mid':''}">${S.gemeldet.length}</b></div><div class="kbst"><span>Gesamt · alle Konten</span><b class="${S.stand<0?'bad':''}">${kbEur(S.stand)}</b></div></div>
    ${darf?`<div class="btnrow kbmoney"><button class="btn ghost sm" id="kbAbg">${SVI('check')} Kontostand abgleichen</button><button class="btn ghost sm" id="kbBu2">${SVI('plus')} Zuzahlung · Gebühr · Umbuchung</button></div>`:''}
    ${!cfg.paypal?`<div class="card kbhint">${SVI('info')} <div><b>PayPal.me hinterlegen</b><span>Dann können die Spieler ihre Strafen direkt über den Team-Link bezahlen, mit „Freunde &amp; Familie“ kostenlos.</span></div><button class="btn sm" id="kbCfg1">Einrichten</button></div>`:''}
    ${S.gemeldet.length?kbGemeldetHtml(S.gemeldet,darf):''}
    ${V.length?`<div class="card"><h3 class="trh">${SVI('bell')} Vorschläge <small>${V.length}</small></h3><div class="note" style="margin-top:0">Aus Anwesenheit, Abstimmungen und Geburtstagen. Nichts wird automatisch gebucht.</div>${V.slice(0,15).map((v,i)=>`<div class="kbb"><b>${svEsc(trP(v.pid).name)}</b><span>${svEsc(v.titel)} <small>${svEsc(v.why)}</small></span><em>${kbWert(v)}${v.pm?` <small>+ ${kbEur(v.pm)}/Min.</small>`:''}</em><div class="btnrow">${v.pm?`<label class="kbmin"><input type="number" min="0" max="180" step="1" inputmode="numeric" data-vm="${i}" placeholder="0" aria-label="Minuten zu spät"> Min.</label>`:''}<button class="btn sm" data-vb="${i}">Buchen</button><button class="btn ghost sm" data-vi="${i}">Ignorieren</button></div></div>`).join('')}
      ${V.length>1?`<button class="btn ghost sm" id="kbAllV">Alle ${Math.min(V.length,15)} buchen</button>`:''}</div>`:''}
    <div class="vrgrid"><div class="card"><h3 class="trh">${SVI('users')} Spieler</h3>${BP.length?BP.map(x=>`<div class="kbpl" data-kbp="${svEsc(x.pid)}"><b>${svEsc(x.name)}</b><span>${x.offen||x.kOffen?`<i class="mid">${[x.offen?kbEur(x.offen):'',x.kOffen?kbKst(x.kOffen):''].filter(Boolean).join(' + ')} offen</i>`:'<i class="ok">alles bezahlt</i>'}</span><small>${kbEur(x.bez)} bezahlt</small></div>`).join(''):'<div class="note">Noch keine Strafen oder Beiträge gebucht.</div>'}</div>
      <div class="card"><div class="vrat-h"><h3 class="trh" style="margin:0">${SVI('book')} Strafenkatalog <small>${kbTeamT()}</small></h3><button class="btn ghost sm" id="kbKat">Bearbeiten</button></div>${KB.kat.filter(k=>k.aktiv).length?`<div class="kbkat">${KB_KATG.map(g=>{ const X=kbKatSort(KB.kat.filter(k=>k.aktiv&&kbKatG(k)===g)); return X.length?`<h4 class="kbkatg">${g}</h4>${X.map(k=>`<div><span>${svEsc(k.titel)}</span><b>${svEsc(kbKatWert(k))}</b></div>`).join('')}`:''; }).join('')}</div>`:`<div class="note">Noch kein Katalog für die ${kbTeamT()}. <button class="lnk" id="kbKatDef">Standard-Katalog laden</button> (12 übliche Einträge, alles änderbar)</div>`}
        <div class="btnrow" style="margin-top:10px"><button class="btn ghost sm" id="kbCfg">${SVI('sliders')} Kasse einstellen</button></div></div></div>
    <div class="card"><div class="vrat-h"><h3 class="trh" style="margin:0">${SVI('clock')} Buchungen</h3><div class="trtabs sm">${[['offen','Offen'],['bewegung','Ein-/Ausgaben'],['alle','Alle']].map(([k,t])=>`<button class="${KB.kf===k?'on':''}" data-kf="${k}">${t}</button>`).join('')}</div></div>
      ${list.length?list.map(b=>{ const s=stat(b); return `<div class="kbb" data-bu="${b.id}"><b>${b.art==='einzahlung'?'➕ ':b.art==='ausgabe'?'➖ ':''}${svEsc(b.player_id?((trP(b.player_id)||{}).name||b.name||''):(b.art==='ausgabe'?'Ausgabe':'Einzahlung'))}</b><span>${svEsc(b.titel)} <small>${TRC.fmt(b.datum)}${b.status==='bezahlt'?' · '+KB_KONTO[b.konto||'bank'][1]:b.status==='gemeldet'&&b.zahlweg?' · per '+KB_KONTO[b.zahlweg][1]:''}</small></span><em class="${b.art==='ausgabe'?'bad':''}">${b.art==='ausgabe'?'−':''}${kbWert(b)}</em><span class="trpill ${s[1]}">${kbIstKasten(b)&&b.status==='bezahlt'?'erledigt':s[0]}</span></div>`; }).join(''):'<div class="note">Keine Buchungen in dieser Ansicht.</div>'}
      <div class="note">Alle Spieler sehen Kassenstand, Katalog und alle Strafen über den Team-Link, volle Transparenz. Antippen ändert eine Buchung.</div></div>`;
  const upd=async(id,patch)=>{ const {error}=await SVB.sb.from('kasse_buchungen').update(patch).eq('id',id); if(error)return kToast('⚠️ '+error.message); await kbLoad(true); };
  kbGemeldetWire(B,()=>kbViewKasse(B)); kbFlipWire('kbFlip',S.konten);
  const ab=document.getElementById('kbAbg'); if(ab)ab.onclick=()=>kbAbgleich(KB.flipK||'bank');
  const b2=document.getElementById('kbBu2'); if(b2)b2.onclick=()=>kbBuchEditor();
  const book=async L=>{ const rows=L.map(v=>{ const i=V.indexOf(v), mi=v.pm?Math.max(0,Math.min(180,parseInt((B.querySelector(`[data-vm="${i}"]`)||{}).value,10)||0)):0;
      return {art:v.art||'strafe',player_id:v.pid,name:trP(v.pid).name,titel:mi?`${v.titel} (${mi} Min.)`:v.titel,betrag:Math.round((v.betrag+mi*(v.pm||0))*100)/100,einheit:v.einheit||'eur',team:kbTeamCtx(),datum:v.datum,
        quelle:{poll:'abstimmung',geb:'geburtstag'}[v.ref.split(':')[0]]||'anwesenheit',ref:v.ref,notiz:v.why}; });
    const {error}=await SVB.sb.from('kasse_buchungen').insert(rows); if(error)return kToast('⚠️ '+error.message); await kbLoad(true); kToast(`✓ ${rows.length} Posten gebucht`); };
  B.querySelectorAll('[data-vb]').forEach(b=>b.onclick=()=>book([V[+b.dataset.vb]]));
  B.querySelectorAll('[data-vi]').forEach(b=>b.onclick=()=>{ kbIgnore(V[+b.dataset.vi].ref); kbViewKasse(B); });
  const av=document.getElementById('kbAllV'); if(av)av.onclick=()=>{ if(confirm(`${Math.min(V.length,15)} Posten buchen?`))book(V.slice(0,15)); };
  B.querySelectorAll('[data-kbp]').forEach(b=>b.onclick=()=>kbPlayerDetail(b.dataset.kbp));
  B.querySelectorAll('[data-kf]').forEach(b=>b.onclick=()=>{ KB.kf=b.dataset.kf; kbViewKasse(B); });
  B.querySelectorAll('[data-bu]').forEach(b=>b.onclick=()=>kbBuchEdit(b.dataset.bu));
  const kc=document.getElementById('kbCfg'), kc1=document.getElementById('kbCfg1'); if(kc)kc.onclick=kbCfgEditor; if(kc1)kc1.onclick=kbCfgEditor;
  const kk=document.getElementById('kbKat'); if(kk)kk.onclick=kbKatEditor;
  const kd=document.getElementById('kbKatDef'); if(kd)kd.onclick=async()=>{ const {error}=await SVB.sb.from('kasse_katalog').insert(KB_DEFAULT_KAT.map(([t,b,k,pm,e],i)=>({titel:t,betrag:b,kategorie:k,pro_minute:pm||null,einheit:e||'eur',team:kbTeamCtx(),sort:i}))); if(error)return kToast('⚠️ '+error.message); await kbLoad(true); kToast('✓ Standard-Katalog geladen: alles änderbar'); };
}
function kbPlayerDetail(pid){
  const p=trP(pid), L=KB.buch.filter(b=>b.player_id===pid);
  svModal(`<div class="mhead"><div class="rm-ic" style="width:46px;height:46px">${SVI('user')}</div><div><h2 style="margin:0">${svEsc(p?p.name:pid)}</h2><div class="msub">Mannschaftskasse</div></div></div><div id="kbPd"></div>`);
  const draw=()=>{ const E=document.getElementById('kbPd'); if(!E)return; const L=KB.buch.filter(b=>b.player_id===pid), off=L.filter(b=>kbGeld(b)&&(b.status==='offen'||b.status==='gemeldet')), offK=L.filter(b=>kbIstKasten(b)&&(b.status==='offen'||b.status==='gemeldet'));
    E.innerHTML=`${L.map(b=>`<div class="kbb" data-bu="${b.id}"><b>${svEsc(b.titel)}</b><span>${TRC.fmt(b.datum)}${b.notiz?' · '+svEsc(b.notiz):''}</span><em>${kbWert(b)}</em><span class="trpill ${b.status==='bezahlt'?'ok':b.status==='erlassen'?'':'mid'}">${kbIstKasten(b)&&b.status==='bezahlt'?'erledigt':b.status}</span></div>`).join('')||'<div class="note">Keine Buchungen.</div>'}
      ${offK.length?`<div class="btnrow sbact"><span class="kbpaylbl">${kbKst(offK.reduce((a,b)=>a+ +b.betrag,0))} offen:</span><button class="btn sm" id="kbKOk">Kasten ist da</button></div>`:''}
      <div class="btnrow sbact">${off.length&&(!KB.ich||KB.ich.darf!==false)?`<span class="kbpaylbl">Alles bezahlt (${kbEur(off.reduce((a,b)=>a+ +b.betrag,0))}):</span>${['bank','paypal','bar'].map(k=>`<button class="btn sm" data-pk="${k}">${KB_KONTO[k][0]} ${KB_KONTO[k][1]}</button>`).join('')}`:''}<button class="btn ghost" id="kbNew">${SVI('plus')} Strafe</button></div>`;
    E.querySelectorAll('[data-bu]').forEach(b=>b.onclick=()=>kbBuchEdit(b.dataset.bu,()=>kbPlayerDetail(pid)));
    E.querySelectorAll('[data-pk]').forEach(x=>x.onclick=async()=>{ const {error}=await SVB.sb.rpc('kasse_bestaetigen',{p_ids:off.map(b=>b.id),p_ok:true,p_konto:x.dataset.pk}); if(error)return kToast('⚠️ '+error.message); await kbLoad(true); draw(); kToast('✓ Als bezahlt verbucht ('+KB_KONTO[x.dataset.pk][1]+')'); });
    document.getElementById('kbNew').onclick=()=>{ closeOverlay(); kbStrafeEditor([pid]); };
    const ko=document.getElementById('kbKOk'); if(ko)ko.onclick=async()=>{ ko.disabled=true; const {error}=await SVB.sb.from('kasse_buchungen').update({status:'bezahlt',bezahlt_am:trToday()}).in('id',offK.map(b=>b.id)); if(error){ ko.disabled=false; return kToast('⚠️ '+error.message); } await kbLoad(true); draw(); kToast('✓ Abgehakt'); };
  };
  draw();
}
function kbStrafeEditor(pre){
  const st={sel:new Set(pre||[]),kat:null,titel:'',betrag:'',datum:trToday(),notiz:'',art:'strafe',einheit:'eur',pm:0,min:''};
  svModal(`<div class="mhead"><div class="rm-ic" style="width:46px;height:46px">${SVI('plus')}</div><div><h2 style="margin:0">Strafe / Beitrag buchen</h2><div class="msub">${kbTeamT()} · mehrere Spieler auf einmal möglich</div></div></div><div id="kbSe"></div>`);
