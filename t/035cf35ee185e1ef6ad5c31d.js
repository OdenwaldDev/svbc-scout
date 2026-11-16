    <div class="svm-qb"><h4>Vorrang</h4><ol>${SVM_QUELLEN[0][1].map(x=>`<li>${svEsc(x)}</li>`).join('')}</ol></div>
    <div class="svm-qb"><h4>Fehlt</h4>${fehlt.length?`<ul>${fehlt.map(x=>`<li>${svEsc(x)}</li>`).join('')}</ul>`:'<p class="note small">Nichts, die Einheit ist vollständig.</p>'}</div>
    <div class="svm-qb"><h4>Widersprüche <small>${wid.length}</small></h4>${wid.length?`<p class="note small">Hier gilt der Eintrag in der App. Stimmt die Liste, lässt sie sich übernehmen.</p>${wid.map(l=>{ const x=A.get(l.player_id);
        return `<div class="svm-wr" data-wr="${svEsc(l.player_id)}"><span><b>${svEsc(trName(l.player_id))}</b><small>App: ${art(x[1])}${x[1]==='weg'?' ('+svEsc(TRC.REASONS[x[2]]||x[2]||'')+')':''} · Liste: ${art(l.status)}${l.status==='weg'?' ('+svEsc(TRC.REASONS[l.grund]||l.grund||'')+')':''}</small></span>${canTraining()?'<button type="button" class="btn ghost sm" data-wrl>Liste übernehmen</button>':''}</div>`; }).join('')}`
      :`<p class="note small">${L.length?'Liste und App passen zusammen.':'Keine zweite Quelle zum Vergleichen.'}${neuL?' '+neuL+' Einträge der Liste stehen nur dort.':''}</p>`}</div>
    <div class="btnrow sbact">${s&&canTraining()?`<button class="btn" type="button" id="svmQe">Einheit bearbeiten</button>`:''}<button class="btn ghost" type="button" id="svmQx">Schließen</button></div>`;
  E.querySelectorAll('[data-wrl]').forEach(b=>b.onclick=async()=>{ const pid=b.closest('[data-wr]').dataset.wr, l=L.find(x=>x.player_id===pid); b.disabled=true;
    try{ await trSaveSession({datum,typ:'training',spieler:[{player_id:pid,status:l.status,grund:l.status==='weg'?(l.grund||'ohne'):null,status_src:'import'}]}); kToast('✓ Angabe aus der Liste übernommen'); svmQuelleTraining(datum); }catch(e){ b.disabled=false; kToast('⚠️ '+e.message); } });
  const be=E.querySelector('#svmQe'); if(be)be.onclick=()=>{ closeOverlay(); setTimeout(()=>sv50Quick(datum,s.id),40); };
  E.querySelector('#svmQx').onclick=()=>closeOverlay();
}

/* ---------- Anwesenheitsliste (Excel): eigene Quelle, Trainereinträge bleiben ---------- */
// Der Datei-Import ruft pro Tag training_save auf. Nur während „Importieren“ geht das über training_liste_import:
// Rohwerte bleiben erhalten, ein Eintrag des Trainers wird nie überschrieben, Widersprüche zählen mit.
function svmRpcHook(){ if(SVM.rpcHooked||typeof SVB==='undefined'||!SVB.sb)return; SVM.rpcHooked=1; const sb=SVB.sb, _rpc=sb.rpc.bind(sb);
  sb.rpc=function(name,args,opt){ const p=args&&args.p;
    if(name==='training_save'&&SVM.liste&&Date.now()-SVM.liste<15*60e3&&p&&p.typ==='training'&&Array.isArray(p.spieler)&&p.spieler.length
       &&Object.keys(p).every(k=>['datum','typ','spieler'].includes(k))&&p.spieler.every(x=>!('status_src' in x)&&!('note' in x)))
      return _rpc('training_liste_import',{p:{datum:p.datum,spieler:p.spieler}},opt).then(r=>{ if(r&&!r.error&&r.data){ const S=SVM.listeStat=SVM.listeStat||{tage:0,uebernommen:0,gleich:0,widersprueche:0}; S.tage++; ['uebernommen','gleich','widersprueche'].forEach(k=>S[k]+=+r.data[k]||0); } return r; });
    return _rpc(name,args,opt); }; }
document.addEventListener('click',e=>{ if(e.target.closest&&e.target.closest('#vrGo')){ svmRpcHook(); SVM.liste=Date.now(); SVM.listeStat=null; } },true);
{ const _tl22=trLoad; trLoad=async function(force){ const r=await _tl22.apply(this,arguments);
  try{ if(force&&SVM.liste){ SVM.liste=0; const S=SVM.listeStat; SVM.listeStat=null;
      if(S&&S.tage)setTimeout(()=>kToast(`Anwesenheitsliste: ${S.uebernommen} Angaben übernommen${S.gleich?', '+S.gleich+' schon gleich':''}${S.widersprueche?`, ${S.widersprueche} Widersprüche (App-Eintrag gilt, Info-i der Einheit)`:''}`),1600); } }catch(e){}
  return r; }; }

/* =====================================================================
   4. Spiele: Vergangene | Bevorstehende | Statistik
   ===================================================================== */
mnGSeg=function(B,v){ B.querySelectorAll(':scope > .mn-gseg').forEach(x=>x.remove());
  B.insertAdjacentHTML('afterbegin',`<div class="seg50 mn-gseg" role="tablist">${[['games','Vergangene'],['gnext','Bevorstehende'],['gstat','Statistik']].map(([k,t])=>`<button type="button" class="${v===k?'on':''}" data-segg="${k}">${t}</button>`).join('')}</div>`);
  B.querySelectorAll('[data-segg]').forEach(b=>b.onclick=()=>{ TR.view=b.dataset.segg; trRender(); }); };
{ const _sub22=sv4Sub; sv4Sub=function(tab){ const k=_sub22.apply(this,arguments); return k==='training:gnext'?'training:games':k; }; }
Object.assign(SV50_INFO,{'training:gnext':{w:'Die nächsten Spiele unserer Mannschaften, aus dem FuPa-Spielplan und von fussball.de.',f:'Früh sehen, wer an welchem Spieltag fehlt.',
  h:'Nur Anzeige. Erfasst und bewertet wird ein Spiel, wenn es gespielt ist, unter „Vergangene“.',s:'Die Spalte „Fehlt“ zählt eingetragene Abwesenheiten und Verletzungen an diesem Tag.',b:[]}});
if(SV50_INFO['training:gstat'])Object.assign(SV50_INFO['training:gstat'],{w:'Eine Statistik für alle Spiele dieser Saison: Einsätze, Kader, zugeschaut, nicht da, Minuten, Tore, Vorlagen und Eindruck.',
  h:'Liegen mehrere Quellen vor, gilt: Eintrag in der App, dann FuPa, dann fussball.de, sonst die Annahme „zugeschaut“. Das Info-i zeigt die Details.'});

// FuPa-Spielplan (nur eigene Mannschaften) einmal laden
function svmPlanLoad(after){
  if(SVM.plan||SVM.planBusy||SVM.planTry>2)return; if(!(canTraining()||(typeof canScout==='function'&&canScout())))return;
  SVM.planBusy=true; SVM.planTry++;
  Promise.resolve(SVB.sb.rpc('kla_spielplan')).then(r=>{ SVM.planBusy=false; if(!r.error){ SVM.plan=(Array.isArray(r.data)?r.data:[]).filter(g=>!('own_side' in g)||g.own_side==='home'||g.own_side==='away');   // nur eigene Spiele (Gegnerberichte gehören in den Gegnercheck)
 try{ after&&after(); }catch(e){} } },()=>{ SVM.planBusy=false; });
}
const svmPlanD=g=>String(g.anstoss||'').slice(0,10);
function svmPlanVorbei(){ const t=trToday(); return svm31Plan().filter(g=>svmPlanD(g)&&svmPlanD(g)<=t&&g.status!=='PRE'&&svmPlanD(g)>=sv50Start()); }
function svmFbAm(d){ try{ return typeof FB!=='undefined'&&FB.loaded?FB.m.find(g=>g.team===mn31Fde()&&g.datum===d&&g.bericht)||null:null; }catch(e){ return null; } }

// Vergangene: Quelle und Lücken je Spiel, neue Bewertung, noch nicht erfasste Spiele aus FuPa und fussball.de
{ const _vg22b=trViewGames; trViewGames=function(B){ const r=_vg22b.apply(this,arguments);
  try{ const gm=B.querySelector('.gm50'); if(!gm||gm.dataset.svm)return r; gm.dataset.svm='1';
    if(!SVM.plan)svmPlanLoad(()=>{ if(svCurTab()==='training'&&TR.view==='games')trRender(); });
    const P=new Map(svmPlanVorbei().map(g=>[svmPlanD(g),g]));
    gm.querySelectorAll('[data-gs50]').forEach(b=>{ const s=TR.st.sessions.find(x=>x.id===b.dataset.gs50); if(!s)return; const box=b.querySelector('.gm50-s'); if(!box)return;
      const miss=[]; if(s.no==null)miss.push('Trainereinschätzung'); const aa=s.a||[];
      if(!aa.some(a=>(a[1]==='da'||a[1]==='spaet')&&a[8]!=null&&a[9]!=='default'))miss.push('Spielerbewertung'); if(!aa.length)miss.push('Einsätze');
      if(s.no!=null)box.insertAdjacentHTML('afterbegin',svmEiChip(s.no,'Gesamteindruck'));
      const src=[s.q==='fupa'?'FuPa-Datei':SV50_Q[s.q]||'App']; if(P.has(s.d))src.push('FuPa-Spielplan'); if(svmFbAm(s.d))src.push('fussball.de');
      box.insertAdjacentHTML('beforeend',`${miss.length?`<i class="src50 d" title="Fehlt: ${svEsc(miss.join(', '))}">fehlt: ${svEsc(miss.join(', '))}</i>`:''}<span role="button" tabindex="0" class="svm-i" data-svmg="${svEsc(s.d)}" title="Quellen: ${svEsc(src.join(', '))}">i</span>`);
      b.onclick=e=>{ if(e.target.closest('[data-svmg]'))return; svmSpielBewerten({id:s.id}); };
      b.querySelector('[data-svmg]').addEventListener('click',e=>{ e.stopPropagation(); svmQuelleSpiel(s.d); }); });
    // Gespielt, aber noch nicht in der App
    const have=new Set(TR.st.sessions.filter(s=>s.t==='spiel').map(s=>s.d)), offen=new Map();
    svmPlanVorbei().forEach(g=>{ const d=svmPlanD(g); if(!have.has(d))offen.set(d,{d,gegner:g.gegner,heim:g.heim,tw:g.tore_wir,tg:g.tore_gegner,q:'FuPa'}); });
    try{ if(typeof FB!=='undefined'&&FB.loaded)FB.m.filter(g=>g.team===mn31Fde()&&g.bericht&&g.datum>sv50Start()&&g.datum<=trToday()&&!have.has(g.datum)).forEach(g=>{ if(!offen.has(g.datum))offen.set(g.datum,{d:g.datum,gegner:g.wir_heim?g.gast:g.heim,heim:g.wir_heim,q:'fussball.de'}); else offen.get(g.datum).q+=' + fussball.de'; }); }catch(e){}
    if(offen.size){ const L=[...offen.values()].sort((a,b)=>b.d.localeCompare(a.d));
      gm.insertAdjacentHTML('afterend',`<div class="card svm-off"><h3 class="trh">${SVI('clock')} Gespielt, aber noch nicht bewertet <small>${L.length}</small></h3>
        <div class="gm50-l">${L.map(g=>`<button type="button" class="gm50-r" data-svmo="${svEsc(g.d)}"><span class="gm50-d">${TRC.fmt(g.d)}</span><span class="gm50-t"><b>${g.heim===false?'@':'vs'} ${svEsc(g.gegner||'?')}</b></span>
          <span class="gm50-s">${g.tw!=null&&g.tg!=null?`<i class="res ${g.tw>g.tg?'w':g.tw===g.tg?'d':'l'}">${g.tw}:${g.tg}</i>`:''}<i class="src50 i">${svEsc(g.q)}</i>${canTraining()?'<small>Bewerten</small>':''}</span></button>`).join('')}</div>
        <p class="note small">Ergebnis und Aufstellung kommen aus FuPa und fussball.de. Einsatz und Eindruck je Spieler trägst du beim Bewerten ein, wer nicht im Kader stand, gilt als „zugeschaut“.</p></div>`);
      B.querySelectorAll('[data-svmo]').forEach(b=>b.onclick=()=>{ if(!canTraining())return; const g=offen.get(b.dataset.svmo); svmSpielBewerten({datum:g.d,gegner:g.gegner,heim:g.heim,tw:g.tw,tg:g.tg}); }); }
    B.querySelectorAll('[data-rt18]').forEach(x=>{ x.innerHTML=`${SVI('star')} Letztes Spiel bewerten`; x.onclick=()=>svmSpielBewerten(); });
  }catch(e){ console.warn('Spiele 0.22',e); }
  return r; }; }
tm4Rate=function(){ svmSpielBewerten(); };

/* ---------- 4.3 Spiel bewerten: Gesamteindruck, je Spieler Einsatz und Eindruck ---------- */
const SVM_EIN=[['da','Startelf'],['spaet','Eingewechselt'],['bank','Kader'],['zuschauer','Zugeschaut'],['weg','Nicht da']];
function svmLetztesSpiel(){ const t=trToday(); const c=[];
  TR.st.sessions.filter(s=>s.t==='spiel'&&s.d<=t).forEach(s=>c.push({d:s.d}));
  svmPlanVorbei().forEach(g=>c.push({d:svmPlanD(g),gegner:g.gegner,heim:g.heim,tw:g.tore_wir,tg:g.tore_gegner}));
  try{ if(typeof FB!=='undefined'&&FB.loaded)FB.m.filter(g=>g.team===mn31Fde()&&g.bericht&&g.datum<=t).forEach(g=>c.push({d:g.datum,gegner:g.wir_heim?g.gast:g.heim,heim:g.wir_heim})); }catch(e){}
  c.sort((a,b)=>b.d.localeCompare(a.d)); return c[0]||{d:t}; }
function svmSpielBewerten(o){
  if(!canTraining())return kToast('Bewerten können Trainer, Kaderplaner, Vorstand und Admin.');
  if(typeof SV91!=='undefined'&&!SV91.loaded&&typeof sv91Load==='function'&&!(o&&o._abw)){ sv91Load().then(()=>svmSpielBewerten(Object.assign({},o,{_abw:1})),()=>svmSpielBewerten(Object.assign({},o,{_abw:1}))); return; }
  o=o||{}; let s0=o.id?TR.st.sessions.find(x=>x.id===o.id):null;
  if(!s0&&!o.datum){ const l=svmLetztesSpiel(); o=Object.assign({},l,{datum:l.d}); }
  const datum=s0?s0.d:o.datum; if(!s0)s0=trSessionOn(datum,'spiel');
  const fu=svm31Plan().find(g=>svmPlanD(g)===datum)||null;
  const st={datum,gegner:s0&&s0.g||o.gegner||(fu&&fu.gegner)||'',heim:s0&&s0.h!=null?s0.h:(o.heim!=null?o.heim:(fu?fu.heim:true)),
    tw:s0&&s0.tw!=null?s0.tw:(o.tw!=null?o.tw:(fu&&fu.tore_wir!=null?fu.tore_wir:null)),tg:s0&&s0.tg!=null?s0.tg:(o.tg!=null?o.tg:(fu&&fu.tore_gegner!=null?fu.tore_gegner:null)),
    no:s0&&s0.no!=null?s0.no:null,ns:s0?s0.ns:null,n:s0?s0.n||'':'',rows:{},open:null};
  const fb=typeof fbSpielAm==='function'?fbSpielAm(datum):null, fq=typeof mn31Q==='function'?mn31Q(datum):null, fqs={};
  ((fq&&fq.spieler)||[]).forEach(x=>{ if(x.app_id&&trP(x.app_id))fqs[x.app_id]=x; });
  const have=new Map(((s0&&s0.a)||[]).map(a=>[a[0],a]));
  const abw=id=>{ try{ return typeof SV91!=='undefined'&&SV91.loaded?SV91.abw.find(a=>a.player_id===id&&a.von<=datum&&datum<=a.bis)||null:null; }catch(e){ return null; } };
  new Set([...trSquad().map(p=>p.id),...have.keys(),...Object.keys((fb&&fb.rows)||{}),...Object.keys(fqs)]).forEach(id=>{ if(!trP(id))return;
    const a=have.get(id), f=fb&&fb.rows[id], q=fqs[id], qst=q?(q.start?'da':(q.min||0)>0?'spaet':'bank'):null;
    if(a&&(a[10]||'manuell')!=='default')st.rows[id]={status:a[1],grund:a[2],src:a[10]||'manuell',note:a[8],nsrc:a[9]||null,notiz:a[5]||'',saved:true,tore:a[6],vorlagen:a[7],min:a[11]};
    else if(q)st.rows[id]={status:qst,src:'import',note:a?a[8]:null,nsrc:a?a[9]:null,notiz:a?a[5]||'':'',saved:!!a,tore:q.tore,vorlagen:q.vorlagen,min:q.min};
    else if(f)st.rows[id]={status:f.status,src:'fde',note:a?a[8]:null,nsrc:a?a[9]:null,notiz:a?a[5]||'':'',saved:!!a,tore:f.tore};
    else if(a)st.rows[id]={status:a[1],grund:a[2],src:'default',note:a[8],nsrc:a[9]||null,notiz:a[5]||'',saved:true};
    else { const ab=abw(id), inj=trInjury(id); st.rows[id]=ab||inj?{status:'weg',grund:inj?'verletzt':(['urlaub','krank','arbeit','familie','uni','privat'].includes(ab.grund)?ab.grund:'privat'),src:'default',notiz:''}:{status:'zuschauer',src:'default',notiz:''}; } });
  const SRC={manuell:['App','m'],ki:['Co-Trainer','k'],abstimmung:['Abstimmung','a'],import:['FuPa','i'],fde:['fussball.de','i'],default:['Annahme','d']};
  const srcH=k=>{ const x=SRC[k]; return x?`<i class="src50 ${x[1]}">${x[0]}</i>`:''; };
  svModal(`<div class="mhead"><div class="rm-ic" style="width:46px;height:46px">${SVI('ball')}</div><div><h2 style="margin:0">${s0||st.gegner?`${st.heim===false?'@':'vs'} ${svEsc(st.gegner||'?')}`:'Spiel'} <small class="sb31d">${svEsc(TRC.fmt(st.datum))}${String(st.datum).slice(2,4)}</small> <button type="button" class="svm-i" id="sb22i" title="Woher kommen die Angaben?">i</button></h2><div class="msub">${svEsc(typeof mnCtxT==='function'?mnCtxT():'')} · Ergebnis, Quellen und Bewertung: Gesamteindruck, je Spieler Einsatz und Eindruck. Wer nicht im Kader stand, hat zugeschaut.</div></div></div><div id="sb31q"></div><div id="sb22"></div>`);
  try{ if(typeof mn31SpielInfo==='function')mn31SpielInfo(document.getElementById('sb31q'),st.datum); }catch(e){}
  document.getElementById('sb22i').onclick=()=>svmQuelleSpiel(st.datum);
  const draw=()=>{ const E=document.getElementById('sb22'); if(!E)return;
    const ord=['da','spaet','bank','zuschauer','weg'], pi=p=>{ const i=TR_POS.indexOf(p.pos); return i<0?99:i; };
    const list=Object.keys(st.rows).map(trP).filter(Boolean).sort((a,b)=>ord.indexOf(st.rows[a.id].status)-ord.indexOf(st.rows[b.id].status)||(pi(a)-pi(b))||a.name.localeCompare(b.name,'de'));
    const c={}; list.forEach(p=>{ const k=st.rows[p.id].status; c[k]=(c[k]||0)+1; });
    E.innerHTML=`<div class="editgrid sb22-top"><div class="field"><label>Datum</label><input type="date" id="sbD" value="${svEsc(st.datum)}" max="${trToday()}" ${s0?'disabled':''}></div>
        <div class="field"><label>Gegner</label><input id="sbG" maxlength="80" value="${svEsc(st.gegner)}" placeholder="Gegner"></div>
        <div class="field"><label>Ort</label><div class="trseg"><button type="button" data-sbh="1" class="${st.heim!==false?'on':''}">Heim</button><button type="button" data-sbh="0" class="${st.heim===false?'on':''}">Auswärts</button></div></div>
        <div class="field"><label>Ergebnis (wir : Gegner)</label><div class="sb22-res"><input type="number" id="sbTw" min="0" max="40" inputmode="numeric" value="${st.tw!=null?st.tw:''}"><span>:</span><input type="number" id="sbTg" min="0" max="40" inputmode="numeric" value="${st.tg!=null?st.tg:''}"></div></div></div>
      <div class="q50-ges"><span>Gesamteindruck ${st.ns?sv50Src(st.ns):''}</span>${svmEiBtns(svmEiK(st.no),'sbges')}</div>
      <div class="field q50-note"><label>Notiz zum Spiel</label><input id="sbN" maxlength="2000" value="${svEsc(st.n)}" placeholder="z.B. starke erste Halbzeit, nach der Pause zu passiv"></div>
      ${s0&&s0.hw?`<div class="q50-info">${SVI('info')} ${svEsc(s0.hw)}</div>`:''}
      <div class="q50-info">${fb?`${SVI('check')} Startelf, Wechsel und Kader aus dem Spielbericht von fussball.de übernommen.`:have.size?'Einsätze aus der App.':'Kein Spielbericht gefunden. Alle stehen erst einmal auf „zugeschaut“, tippe an, wer gespielt hat.'}</div>
      <div class="q50-sum sb22-sum">${SVM_EIN.map(([k,t])=>`<span><b>${c[k]||0}</b> ${t}</span>`).join('')}</div>
      <div class="q50l">${list.map(p=>{ const r=st.rows[p.id], weg=r.status==='weg', spielt=r.status==='da'||r.status==='spaet', ann=r.src==='default';
        return `<div class="q50r sb22-r${weg?' weg':''}${ann?' ann':''}" data-sb="${svEsc(p.id)}">
          <div class="q50-h"><span class="q50-n" data-sbo><b>${svEsc(p.name)}</b><em>${trInjury(p.id)?'🩹 ':''}${srcH(r.src)}</em></span></div>
          <div class="sb22-ein">${SVM_EIN.map(([k,t])=>`<button type="button" data-sbs="${k}" class="${r.status===k?'on':''}">${t}</button>`).join('')}</div>
          ${weg?`<div class="trg">${Object.entries(TRC.REASONS).filter(([k])=>k!=='keine_antwort').map(([k,t])=>`<button type="button" data-sbg="${k}" class="${r.grund===k?'on':''}">${t}</button>`).join('')}</div>`:''}
          ${spielt?`<div class="q50-no">${svmEiBtns(svmEiK(r.nsrc==='default'?null:r.note),'sbe')}</div><div class="sb31-st"><label>Min.<input type="number" min="0" max="130" inputmode="numeric" data-sbm="min" value="${r.min!=null?r.min:''}"></label><label>Tore<input type="number" min="0" max="30" inputmode="numeric" data-sbm="tore" value="${r.tore?r.tore:''}" placeholder="0"></label><label>Vorl.<input type="number" min="0" max="30" inputmode="numeric" data-sbm="vorlagen" value="${r.vorlagen?r.vorlagen:''}" placeholder="0"></label></div>`:''}
          ${st.open===p.id?`<input class="q50-in" data-sbt maxlength="500" value="${svEsc(r.notiz||'')}" placeholder="Notiz, z.B. „zwei Tore vorbereitet“">`:`<button type="button" class="trr-more" data-sbo>${r.notiz?'„'+svEsc(r.notiz.slice(0,60))+'“':'+ Notiz'}</button>`}</div>`; }).join('')}</div>
      <div class="btnrow sbact"><button class="btn" type="button" id="sbSave">${SVI('check')} Speichern</button><button class="btn ghost" type="button" id="sbX">Abbrechen</button></div>`;
    const keep=()=>{ st.gegner=E.querySelector('#sbG').value; st.n=E.querySelector('#sbN').value; const tw=E.querySelector('#sbTw').value, tg=E.querySelector('#sbTg').value; st.tw=tw===''?null:+tw; st.tg=tg===''?null:+tg;
      const d=E.querySelector('#sbD'); if(d&&d.value)st.datum=d.value; E.querySelectorAll('[data-sbt]').forEach(i=>{ const r=st.rows[i.closest('[data-sb]').dataset.sb]; if(r)r.notiz=i.value; });
      E.querySelectorAll('[data-sbm]').forEach(i=>{ const r=st.rows[i.closest('[data-sb]').dataset.sb]; if(!r)return; const k=i.dataset.sbm, v=i.value===''?null:Math.max(0,Math.min(k==='min'?130:30,Math.round(+i.value)||0)); if(r[k]!==v&&!(v==null&&!r[k])){ r[k]=v; r.stSrc='manuell'; } }); };
    E.querySelectorAll('[data-sbh]').forEach(b=>b.onclick=()=>{ keep(); st.heim=b.dataset.sbh==='1'; draw(); });
    E.querySelectorAll('[data-sbges]').forEach(b=>b.onclick=()=>{ keep(); const n=SVM_EI[b.dataset.sbges].n; if(st.no===n){ st.no=null; st.ns=null; } else { st.no=n; st.ns='manuell'; } draw(); });
    E.querySelectorAll('[data-sb]').forEach(row=>{ const id=row.dataset.sb, r=st.rows[id];
      row.querySelectorAll('[data-sbs]').forEach(b=>b.onclick=()=>{ keep(); r.status=b.dataset.sbs; r.src='manuell'; r.grund=r.status==='weg'?(trInjury(id)?'verletzt':(r.grund||'ohne')):null; if(!(r.status==='da'||r.status==='spaet')){ r.note=null; r.nsrc=null; } svSound('tick'); draw(); });
      row.querySelectorAll('[data-sbg]').forEach(b=>b.onclick=()=>{ keep(); r.grund=b.dataset.sbg; r.src='manuell'; draw(); });
      row.querySelectorAll('[data-sbe]').forEach(b=>b.onclick=()=>{ keep(); const n=SVM_EI[b.dataset.sbe].n; if(r.note===n&&r.nsrc==='manuell'){ r.note=null; r.nsrc=null; } else { r.note=n; r.nsrc='manuell'; } draw(); });
      row.querySelectorAll('[data-sbo]').forEach(b=>b.onclick=()=>{ keep(); st.open=st.open===id?null:id; draw(); const i=document.querySelector(`[data-sb="${CSS.escape(id)}"] [data-sbt]`); if(i)i.focus(); }); });
    E.querySelector('#sbX').onclick=()=>closeOverlay();

    E.querySelector('#sbSave').onclick=async e=>{ keep(); const b=e.currentTarget;
      if(!st.datum)return kToast('Bitte ein Datum angeben');
      if((st.tw==null)!==(st.tg==null))return kToast('Bitte beide Tore angeben oder keins');
      const sp=Object.entries(st.rows).map(([id,r])=>{ const weg=r.status==='weg', spielt=r.status==='da'||r.status==='spaet';
        const o={player_id:id,status:r.status,grund:weg?(r.grund||'ohne'):null,status_src:r.src==='fde'?'import':(r.src||'manuell'),notiz:(r.notiz||'').trim()||null,note:spielt&&r.note!=null&&r.nsrc!=='default'?r.note:null,note_src:spielt&&r.note!=null&&r.nsrc!=='default'?(r.nsrc||'manuell'):null};
        if(spielt){ o.tore=r.tore||0; o.vorlagen=r.vorlagen||0; o.minuten=r.min!=null?r.min:null; if(r.stSrc==='manuell'&&o.status_src==='import')o.status_src='manuell'; } else { o.tore=null; o.vorlagen=null; o.minuten=null; }
        return o; });
      const p={datum:st.datum,typ:'spiel',heim:st.heim!==false,note:st.no,note_src:st.no!=null?(st.ns||'manuell'):null,notiz:(st.n||'').trim()||null,spieler:sp};
      if(st.gegner.trim())p.gegner=st.gegner.trim().slice(0,80); if(st.tw!=null){ p.tore_wir=Math.max(0,Math.min(40,st.tw)); p.tore_gegner=Math.max(0,Math.min(40,st.tg)); }
      if(!s0){ p.quelle='manuell'; if(fu||fb)p.quelle_ref=(fu?'FuPa-Spielplan':'')+(fu&&fb?' + ':'')+(fb?'fussball.de':''); }
      b.disabled=true; b.textContent='Speichert …';
      try{ for(let i=0;i<sp.length;i+=80)await trSaveSession(Object.assign({},p,{spieler:sp.slice(i,i+80)}));
        closeOverlay(); svSound('success'); kToast('✓ Spiel vom '+TRC.fmt(st.datum)+' bewertet'); try{ if(svCurTab()==='training')trRender(); }catch(x){} }
      catch(x){ b.disabled=false; b.innerHTML=SVI('check')+' Speichern'; kToast('⚠️ '+x.message); } };
  };
  draw();
}

/* ---------- Info-i je Spiel ---------- */
function svmQuelleSpiel(d){
  const s=trSessionOn(d,'spiel'), fu=svm31Plan().find(g=>svmPlanD(g)===d)||null, fb=svmFbAm(d), fbr=typeof fbSpielAm==='function'?fbSpielAm(d):null;
  const A=(s&&s.a)||[], cnt={}; A.forEach(a=>{ const k=a[10]||'manuell'; cnt[k]=(cnt[k]||0)+1; });
  const fehlt=[]; if(!s)fehlt.push('Das Spiel ist in der App noch nicht bewertet.'); else { if(s.no==null)fehlt.push('Trainereinschätzung (Gesamteindruck)');
    const sp=A.filter(a=>a[1]==='da'||a[1]==='spaet'); if(!sp.some(a=>a[8]!=null&&a[9]!=='default'))fehlt.push('Eindruck der Spieler'); if(sp.length&&!sp.some(a=>a[11]!=null))fehlt.push('Minuten'); if(s.tw==null)fehlt.push('Ergebnis'); }
  const wid=[];
  if(s&&s.tw!=null&&fu&&fu.tore_wir!=null&&(+fu.tore_wir!==s.tw||+fu.tore_gegner!==s.tg))wid.push(`Ergebnis: App ${s.tw}:${s.tg}, FuPa ${fu.tore_wir}:${fu.tore_gegner}`);
  const T=Object.fromEntries(SVM_EIN);
  if(s&&fbr)Object.entries(fbr.rows).forEach(([pid,f])=>{ const a=A.find(x=>x[0]===pid); if(a&&a[1]!==f.status&&(a[10]||'manuell')!=='default')wid.push(`${trName(pid)}: App ${T[a[1]]||a[1]}, fussball.de ${T[f.status]||f.status}`); });
  svModal(`<div class="mhead"><div class="rm-ic" style="width:46px;height:46px">${SVI('info')}</div><div><h2 style="margin:0">Spiel ${svEsc(TRC.fmt(d))}${s&&s.g?' · '+svEsc(s.g):fu?' · '+svEsc(fu.gegner||''):''}</h2><div class="msub">Welche Quellen, welcher Vorrang, was fehlt, wo es sich widerspricht</div></div></div>
    <div class="svm-qb"><h4>Verwendet</h4><ul>
      <li>App: ${s?`<b>bewertet</b>${s.q?' · angelegt über '+svEsc(SV50_Q[s.q]||s.q):''}${s.qr?' · '+svEsc(s.qr):''}`:'noch nicht bewertet'}</li>
      ${Object.entries(cnt).map(([k,n])=>`<li>${n}× Einsatz von: <b>${svEsc(k==='import'?'FuPa oder fussball.de':SVM_SRC_T[k]||k)}</b></li>`).join('')}
      <li>FuPa-Spielplan: ${fu?`<b>${svEsc(fu.heim?'Heim':'Auswärts')} gegen ${svEsc(fu.gegner||'?')}</b>${fu.tore_wir!=null?' · '+fu.tore_wir+':'+fu.tore_gegner:''}${fu.geprueft?' · geprüft '+svEsc(TRC.fmt(String(fu.geprueft).slice(0,10))):''}`:'kein Eintrag'}</li>
      <li>fussball.de: ${fb?`<b>Spielbericht</b> mit ${(fb.apps||[]).length} Einsätzen${fbr&&fbr.fehlt?', '+fbr.fehlt+' Namen nicht zugeordnet':''}`:'kein Spielbericht'}</li></ul></div>
    <div class="svm-qb"><h4>Vorrang</h4><ol>${SVM_QUELLEN[1][1].map(x=>`<li>${svEsc(x)}</li>`).join('')}</ol></div>
    <div class="svm-qb"><h4>Fehlt</h4>${fehlt.length?`<ul>${fehlt.map(x=>`<li>${svEsc(x)}</li>`).join('')}</ul>`:'<p class="note small">Nichts, das Spiel ist vollständig.</p>'}</div>
    <div class="svm-qb"><h4>Widersprüche <small>${wid.length}</small></h4>${wid.length?`<ul>${wid.map(x=>`<li>${svEsc(x)}</li>`).join('')}</ul><p class="note small">Es gilt der Eintrag in der App.</p>`:'<p class="note small">Keine.</p>'}</div>
    <div class="btnrow sbact">${canTraining()?'<button class="btn" type="button" id="sqB">Bewerten</button>':''}<button class="btn ghost" type="button" id="sqX">Schließen</button></div>`);
  const b=document.getElementById('sqB'); if(b)b.onclick=()=>{ closeOverlay(); setTimeout(()=>svmSpielBewerten(s?{id:s.id}:{datum:d,gegner:fu&&fu.gegner,heim:fu&&fu.heim,tw:fu&&fu.tore_wir,tg:fu&&fu.tore_gegner}),40); };
  document.getElementById('sqX').onclick=()=>closeOverlay();
}

/* ---------- 4.1 Bevorstehende Spiele ---------- */
function svmViewKommend(B){
  const need=!SVM.plan&&SVM.planTry<3&&(canTraining()||(typeof canScout==='function'&&canScout()));
  if(need)svmPlanLoad(()=>{ if(svCurTab()==='training'&&TR.view==='gnext')trRender(); });
  if(typeof SP!=='undefined'&&!SP.loaded&&typeof spLoad==='function'&&typeof canScout==='function'&&canScout())mnLoadOnce('sp22',()=>spLoad(),mnRerender('gnext'));
  if(typeof SV91!=='undefined'&&!SV91.loaded&&typeof sv91Load==='function'&&canTraining())mnLoadOnce('u22',()=>sv91Load(),mnRerender('gnext'));
  const t=trToday(), key0=(window.VEREIN&&VEREIN.texte&&VEREIN.texte.fde_schluessel)||'', key=key0&&mnCtx()==='2'?key0+'ii':key0, G=new Map();
  svm31Plan().filter(g=>svmPlanD(g)>=t).forEach(g=>{ const d=svmPlanD(g); G.set(d+'|A',{d,zeit:String(g.anstoss).slice(11,16),team:'A',heim:g.heim,gegner:g.gegner,wb:g.wettbewerb||'',st:g.spieltag,q:'FuPa',url:g.quelle}); });
  try{ if(typeof SP!=='undefined'&&SP.loaded&&key)(SP.fx||[]).filter(f=>f.datum>=t&&(f.heim_key===key||f.gast_key===key)).forEach(f=>{ const k=f.datum+'|'+(f.sub||'A');
      if(G.has(k)){ G.get(k).q+=' + fussball.de'; return; } G.set(k,{d:f.datum,zeit:(f.zeit||'').slice(0,5),team:f.sub||'A',heim:f.heim_key===key,gegner:f.heim_key===key?f.gast:f.heim,wb:f.wettbewerb||'',q:'fussball.de'}); }); }catch(e){}
  const L=[...G.values()].sort((a,b)=>a.d.localeCompare(b.d)||(a.zeit||'').localeCompare(b.zeit||'')).slice(0,40);
  const sq=trSquad(), fehlt=d=>{ let n=0; const names=[]; sq.forEach(p=>{ const ab=typeof SV91!=='undefined'&&SV91.loaded&&SV91.abw.some(a=>a.player_id===p.id&&a.von<=d&&d<=a.bis);
      const inj=(TR.st.injuries||[]).some(i=>i.p===p.id&&i.b<=d&&(!i.z||i.z>d)&&(!i.pr||i.pr>d)); if(ab||inj){ n++; names.push(p.name.split(' ')[0]+(inj?' 🩹':'')); } }); return {n,names}; };
  const lade=(need||SVM.planBusy)&&!SVM.plan;
  B.innerHTML=`<div class="card svm-next"><h3 class="trh">${SVI('clock')} Bevorstehende Spiele <small>${L.length}</small></h3>
    ${L.length?`<div class="trtw"><table class="trtab t50"><thead><tr><th>Datum</th><th>Anstoß</th><th>Art</th><th>Spiel</th><th>Wettbewerb</th><th>Fehlt</th><th>Quelle</th></tr></thead><tbody>
      ${L.map(g=>{ const f=fehlt(g.d);
        return `<tr><td><b>${svEsc(svmTag(g.d))}</b></td><td>${svEsc(g.zeit||'–')}</td><td>${svEsc(/^FS/.test(g.team)?'Freundschaftsspiel':g.team==='POKAL'?'Pokal':'Liga')}</td>
          <td><b>${g.heim?'vs':'@'} ${svEsc(g.gegner||'?')}</b></td><td>${svEsc(g.wb)}${g.st?' · '+svEsc(g.st)+'. Spieltag':''}</td>
          <td>${f?(f.n?`<span class="warn" title="${svEsc(f.names.join(', '))}">${f.n}</span>`:'0'):'–'}</td><td><i class="src50 i">${svEsc(g.q)}</i></td></tr>`; }).join('')}</tbody></table></div>`
      :`<p class="note">${lade?'Lade Spielplan …':'Keine bevorstehenden Spiele gefunden. Der FuPa-Spielplan kommt mit dem nächsten Abgleich, fussball.de mit dem Spieltag-Abruf.'}</p>`}
    <p class="note small">Quelle: ${mnCtx()==='1'?'FuPa-Spielplan, ergänzt um fussball.de':'Spielplan von fussball.de'} (auch Freundschaftsspiele, sobald sie dort stehen). „Fehlt“ zählt eingetragene Abwesenheiten und Verletzungen der ${svEsc(mnCtxT())} an diesem Tag, die Namen stehen beim Überfahren.</p></div>`;
  mnGSeg(B,'gnext');
}
MN_VIEWS.gnext=svmViewKommend;

/* ---------- 4.4 Eine Statistik für alle Spiele (App > FuPa > fussball.de > Annahme „zugeschaut“) ---------- */
function svmSpieleSaison(){
  const st=sv50Start(), t=trToday(), by=new Map(), get=d=>{ if(!by.has(d))by.set(d,{d}); return by.get(d); };
  TR.st.sessions.filter(s=>s.t==='spiel'&&s.d>=st&&s.d<=t).forEach(s=>get(s.d).app=s);
  svmPlanVorbei().forEach(g=>get(svmPlanD(g)).fu=g);
  try{ if(typeof FB!=='undefined'&&FB.loaded)FB.m.filter(g=>g.team===mn31Fde()&&g.bericht&&g.datum>=st&&g.datum<=t).forEach(g=>get(g.datum).fb=g); }catch(e){}
  const G=[...by.values()].sort((a,b)=>a.d.localeCompare(b.d));
  G.forEach(g=>{ const a=g.app; if(a&&a.tw!=null){ g.tw=a.tw; g.tg=a.tg; g.h=a.h; g.gg=a.g; } else if(g.fu&&g.fu.tore_wir!=null){ g.tw=+g.fu.tore_wir; g.tg=+g.fu.tore_gegner; g.h=g.fu.heim; g.gg=g.fu.gegner; }
    else if(g.fb){ g.h=g.fb.wir_heim; g.gg=g.fb.wir_heim?g.fb.gast:g.fb.heim; } if(g.gg==null&&a){ g.gg=a.g; g.h=a.h; } });
  return G;
}
function svmViewGStat(B){
  if(typeof FB!=='undefined'&&!FB.loaded&&typeof fbLoad==='function')mnLoadOnce('fb',()=>fbLoad(),mnRerender('gstat'));
  if(!SVM.plan)svmPlanLoad(()=>{ if(svCurTab()==='training'&&TR.view==='gstat')trRender(); });
  const G=svmSpieleSaison(), R=G.filter(g=>g.tw!=null&&g.tg!=null), n=G.length, M=typeof FB!=='undefined'&&FB.loaded&&typeof fbMap==='function'?fbMap():new Map();
  const res=g=>g.tw>g.tg?'w':g.tw===g.tg?'d':'l';
  const w=R.filter(g=>res(g)==='w').length, d=R.filter(g=>res(g)==='d').length, l=R.filter(g=>res(g)==='l').length;
  const tf=R.reduce((a,g)=>a+g.tw,0), ta=R.reduce((a,g)=>a+g.tg,0), pts=w*3+d, zn=R.filter(g=>g.tg===0).length;
  const split=h=>{ const L=R.filter(g=>g.h===h); return L.length?`${L.filter(g=>res(g)==='w').length}-${L.filter(g=>res(g)==='d').length}-${L.filter(g=>res(g)==='l').length} · ${L.reduce((a,g)=>a+g.tw,0)}:${L.reduce((a,g)=>a+g.tg,0)}`:'–'; };
  const P=new Map(), get=pid=>{ if(!P.has(pid))P.set(pid,{pid,da:0,spaet:0,bank:0,zuschauer:0,weg:0,min:0,minK:0,tore:0,vor:0,eS:0,eN:0,src:{app:0,fupa:0,fde:0,std:0},gr:{}}); return P.get(pid); };
  const Q={app:0,fupa:0,fde:0,nur:0};
  G.forEach(g=>{ const seen=new Set(), A=(g.app&&g.app.a)||[];
    if(g.app)Q[g.app.q==='fupa'?'fupa':'app']++; else if(g.fb)Q.fde++; else Q.nur++;
    const fbA=new Map(), fbB=new Set(); if(g.fb){ (g.fb.apps||[]).forEach(a=>{ const pid=M.get(a.p); if(pid&&!fbA.has(pid))fbA.set(pid,a); }); (g.fb.bank||[]).forEach(k=>{ const pid=M.get(k); if(pid)fbB.add(pid); }); }
    const zaehl=(pid,status,src,x)=>{ const o=get(pid); o[status]++; o.src[src]++; seen.add(pid); if(status==='weg'){ const gr=x&&x.grund||'ohne'; o.gr[gr]=(o.gr[gr]||0)+1; }
      if(status==='da'||status==='spaet'){ if(x&&x.min!=null){ o.min+=x.min; o.minK++; } } o.tore+=x&&x.tore||0; o.vor+=x&&x.vor||0; if(x&&x.ei!=null){ o.eS+=x.ei; o.eN++; } };
    A.forEach(a=>{ const s=a[10]||'manuell', f=fbA.get(a[0]);
      const x={grund:a[2],min:a[11],tore:a[6]||0,vor:a[7]||0,ei:a[8]!=null&&a[9]!=='default'?a[8]:null};
      if(s==='default'&&(f||fbB.has(a[0]))){ zaehl(a[0],f?(f.s?'da':'spaet'):'bank','fde',Object.assign(x,{min:f?f.m:null,tore:f?f.t||0:0})); return; }
      zaehl(a[0],a[1],s==='import'?'fupa':s==='default'?'std':'app',x); });
    fbA.forEach((f,pid)=>{ if(!seen.has(pid))zaehl(pid,f.s?'da':'spaet','fde',{min:f.m,tore:f.t||0}); });
    fbB.forEach(pid=>{ if(!seen.has(pid))zaehl(pid,'bank','fde',null); }); });
  const rows=[...P.values()].filter(x=>trP(x.pid)).map(x=>Object.assign(x,{p:trP(x.pid),ein:x.da+x.spaet,kader:x.da+x.spaet+x.bank,sc:x.tore+x.vor,ei:x.eN?x.eS/x.eN:null,quote:n?(x.da+x.spaet+x.bank)/n:null}))
    .filter(x=>x.kader||x.zuschauer||x.weg||x.tore||x.vor);
  const COLS=[['name','Spieler'],['ein','Einsätze'],['da','Startelf'],['spaet','Einw.'],['bank','Kader'],['zuschauer','Zugeschaut'],['weg','Nicht da'],['min','Minuten'],['tore','Tore'],['vor','Vorl.'],['sc','Scorer'],['ei','Ø Eindruck'],['quote','Quote']];
  const k=COLS.some(c=>c[0]===MN.gsort)?MN.gsort:'ein', dir=MN.gdir, val=x=>k==='name'?x.p.name:k==='ei'?(x.ei==null?9:x.ei):-(x[k]||0);
  rows.sort((a,b)=>{ const va=val(a), vb=val(b); if(va!==vb)return (va<vb?-1:1)*dir; return b.ein-a.ein||a.p.name.localeCompare(b.p.name,'de'); });
  const top=(key,lbl)=>{ const L=rows.filter(x=>x[key]>0).sort((a,b)=>b[key]-a[key]).slice(0,3); return `<div class="mn-top"><span>${lbl}</span>${L.length?L.map(x=>`<p data-svp="${svEsc(x.pid)}"><b>${svEsc(x.p.name)}</b><em>${key==='min'?x.min.toLocaleString('de-DE'):x[key]}</em></p>`).join(''):'<p class="note small">noch niemand</p>'}</div>`; };
  const form=R.slice(-5).map(g=>`<i class="res ${res(g)}" title="${TRC.fmt(g.d)} ${g.h===false?'@':'vs'} ${svEsc(g.gg||'?')} ${g.tw}:${g.tg}">${res(g)==='w'?'S':res(g)==='d'?'U':'N'}</i>`).join('');
  const srcT=x=>Object.entries(x.src).filter(([,v])=>v).map(([s,v])=>({app:'App',fupa:'FuPa',fde:'fussball.de',std:'Annahme'})[s]+' '+v).join(' · ');
  const n1=v=>v?v:'–';
  B.innerHTML=`<div class="tiles trtiles mn-gt">
      <div class="tile"><div class="v">${n}</div><div class="l">Spiele</div><div class="s">${R.length<n?`${n-R.length} ohne Ergebnis`:'seit '+TRC.fmt(sv50Start())}</div></div>
      <div class="tile"><div class="v">${w}-${d}-${l}</div><div class="l">Siege · Remis · Niederlagen</div><div class="s">${pts} Punkte${R.length?' · Ø '+(pts/R.length).toFixed(2).replace('.',','):''}</div></div>
      <div class="tile"><div class="v">${tf}:${ta}</div><div class="l">Tore</div><div class="s">${R.length?`Ø ${(tf/R.length).toFixed(1).replace('.',',')} : ${(ta/R.length).toFixed(1).replace('.',',')} · ${zn}× zu null`:'–'}</div></div>
      <div class="tile"><div class="v mn-form">${form||'–'}</div><div class="l">Form (letzte 5)</div><div class="s">Heim ${split(true)} · Ausw. ${split(false)}</div></div></div>
    ${rows.length?`<div class="mn-tops">${top('tore','Tore')}${top('vor','Vorlagen')}${top('min','Minuten')}${top('da','Startelf')}</div>`:''}
    <div class="card"><div class="vrat-h"><h3 class="trh" style="margin:0">${SVI('users')} Spiele ${svEsc(typeof fbSeasonLabel==='function'?fbSeasonLabel():'')} · je Spieler <small>${rows.length} Spieler</small></h3><button type="button" class="svm-i" data-svmgs title="Woher kommen die Zahlen?">i</button></div>
      ${rows.length?`<div class="trtw"><table class="trtab t50 mn-gtab svm-gs"><thead><tr>${COLS.map(([c,t])=>`<th${c==='name'?' class="nm50"':''}><button data-gs22="${c}" class="${k===c?'on':''}">${t}${k===c?(dir>0?' ▼':' ▲'):''}</button></th>`).join('')}</tr></thead><tbody>
      ${rows.map(x=>`<tr data-svp="${svEsc(x.pid)}"><td class="nm50" title="${svEsc(srcT(x))}"><b>${svEsc(x.p.name)}</b> <small>${svEsc(x.p.pos||'')}</small></td><td><b>${x.ein}</b></td><td class="c1">${n1(x.da)}</td><td class="c2">${n1(x.spaet)}</td><td class="c3">${n1(x.bank)}</td><td class="c4">${n1(x.zuschauer)}</td>
        <td class="c5">${n1(x.weg)}${x.weg?`<span class="fggr">${svEsc(Object.entries(x.gr).map(([g,c])=>(TRC.REASONS[g]||g)+(c>1?' '+c+'×':'')).join(', '))}</span>`:''}</td>
        <td>${x.minK?x.min.toLocaleString('de-DE')+(x.minK<x.ein?' <small title="Nicht für jedes Spiel sind Minuten bekannt">~</small>':''):'–'}</td><td>${n1(x.tore)}</td><td>${n1(x.vor)}</td><td>${n1(x.sc)}</td>
        <td>${x.ei!=null?svmEiChip(x.ei)+` <small>${x.eN}×</small>`:'–'}</td><td>${x.quote!=null?Math.round(x.quote*100)+' %':'–'}</td></tr>`).join('')}</tbody></table></div>`
        :'<p class="note">Noch keine Spiele in dieser Saison. Sobald FuPa oder fussball.de einen Spielbericht haben oder ihr ein Spiel bewertet, steht es hier.</p>'}
      <div class="note">${n} Spiele seit ${TRC.fmt(sv50Start())}${sv50Start().slice(2,4)}: ${Q.app} in der App bewertet, ${Q.fupa} aus der FuPa-Datei, ${Q.fde} nur mit Spielbericht von fussball.de${Q.nur?', '+Q.nur+' nur mit Ergebnis aus FuPa':''}. Einsätze = Startelf und Einwechslungen, Quote = im Kader je Spiel. Beim Überfahren eines Namens steht, woher seine Angaben kommen.</div></div>`;
  B.querySelectorAll('[data-gs22]').forEach(b=>b.onclick=e=>{ e.stopPropagation(); const c=b.dataset.gs22; if(MN.gsort===c)MN.gdir*=-1; else { MN.gsort=c; MN.gdir=1; } svmViewGStat(B); });
  B.querySelectorAll('[data-svp]').forEach(x=>x.onclick=()=>openModal(x.dataset.svp));
  const qi=B.querySelector('[data-svmgs]'); if(qi)qi.onclick=()=>svmQuelleStat(Q,n);
  mnGSeg(B,'gstat');
}
function svmQuelleStat(Q,n){
  svModal(`<div class="mhead"><div class="rm-ic" style="width:46px;height:46px">${SVI('info')}</div><div><h2 style="margin:0">Woher kommen die Zahlen?</h2><div class="msub">Spielstatistik der laufenden Saison</div></div></div>
    <div class="svm-qb"><h4>Verwendet</h4><ul><li>${n} Spiele seit Saisonstart</li><li>${Q.app} in der App bewertet</li><li>${Q.fupa} aus der FuPa-Datei übernommen</li><li>${Q.fde} nur mit Spielbericht von fussball.de</li>${Q.nur?`<li>${Q.nur} nur mit Ergebnis aus dem FuPa-Spielplan (ohne Aufstellung)</li>`:''}</ul></div>
    <div class="svm-qb"><h4>Vorrang je Spiel und Spieler</h4><ol>${SVM_QUELLEN[1][1].map(x=>`<li>${svEsc(x)}</li>`).join('')}</ol><p class="note small">${svEsc(SVM_QUELLEN[1][2])}</p></div>
    <div class="svm-qb"><h4>Fehlt</h4><p class="note small">${Q.fde+Q.nur?`${Q.fde+Q.nur} Spiele haben noch keinen Eindruck vom Trainer. Unter „Vergangene“ stehen sie bei „Gespielt, aber noch nicht bewertet“.`:'Alle Spiele sind in der App bewertet.'}</p></div>
    <div class="btnrow sbact"><button class="btn ghost" type="button" onclick="closeOverlay()">Schließen</button></div>`);
}
MN_VIEWS.gstat=svmViewGStat;
if(SV50_INFO['training:games'])Object.assign(SV50_INFO['training:games'],{w:'Die gespielten Spiele der Saison, jedes mit Quelle und dem, was noch fehlt.',f:'Nach dem Spiel in einer Minute bewerten: Gesamteindruck, dazu je Spieler Einsatz und Eindruck.',
  h:'Startelf, Wechsel und Ergebnis kommen aus FuPa und fussball.de. Was in der App eingetragen ist, hat immer Vorrang.',
  s:'Ein Spiel antippen zum Bewerten. Das Info-i zeigt die Quellen, Lücken und Widersprüche. Spiele, die FuPa oder fussball.de kennen, die aber noch nicht bewertet sind, stehen darunter.',
  b:['Nach dem Wochenende: „Letztes Spiel bewerten“, Startelf ist schon vorausgefüllt, nur Eindruck antippen.','Weicht das Ergebnis in der App von FuPa ab, steht das im Info-i.']});

/* =====================================================================
   Sportzentrale Beta 0.22 · Teil C (Änderungswünsche aus dem Trainerteam)
   6.   Abwesenheiten: eintragen und bearbeiten, dazu Übersicht mit Zeitstrahl der laufenden Halbserie je Mannschaft
   7.2  Mannschaftsteil (Torwart, Abwehr, Mittelfeld, Sturm) passend zur Hauptposition, Grundlage für den MScore
   7.3  Torwart-Eye-Test mit fünf Kategorien: Hechten, Ballsicherheit, Abschlag, Stellungsspiel, Reflexe
   7.4  Skills, Rolle und Charakter werden zu PlayStyles (Kategorien wie in EA SPORTS FC 26)
   ===================================================================== */

/* ---------- Halbserie ---------- */
function svmHalb(d){ d=d||trToday(); const y=+d.slice(0,4), m=+d.slice(5,7), yy=n=>String(((n%100)+100)%100).padStart(2,'0');
  return m>=7?{von:y+'-07-01',bis:y+'-12-31',t:'Hinrunde '+yy(y)+'/'+yy(y+1),k:'H'+y}:{von:y+'-01-01',bis:y+'-06-30',t:'Rückrunde '+yy(y-1)+'/'+yy(y),k:'R'+y}; }
const svmTage=(a,b)=>Math.round((new Date(b+'T12:00:00Z')-new Date(a+'T12:00:00Z'))/864e5);

/* =====================================================================
   7.2 Mannschaftsteil
   ===================================================================== */
const SVM_MT={T:'Torwart',A:'Abwehr',M:'Mittelfeld',S:'Sturm'};
const SVM_MT_POS={TW:['T'],IV:['A'],AV:['A','M'],ZM:['M','A'],OM:['M','S'],'Flügel':['M','S'],ST:['S','M']};
function svmMtErlaubt(pos){ return SVM_MT_POS[pos]||['M']; }
function svmMt(p,pos){ pos=pos||(p&&p.pos); const L=svmMtErlaubt(pos); let c=null; try{ c=(crmOf(p)||{}).mt; }catch(e){} return L.includes(c)?c:L[0]; }
Object.assign(SV_TRAINER_FIELDS,{mt:1}); SV_FIELD.mt='Mannschaftsteil';
if(MN_A.pos){ const _o=MN_A.pos.orig, _c=MN_A.pos.ctl, _r=MN_A.pos.read;
  MN_A.pos.orig=p=>Object.assign(_o(p),{mt:p.pos?svmMt(p):''});
  MN_A.pos.ctl=(p,v,ok)=>{ const L=v.ps?svmMtErlaubt(v.ps):[];
    return _c(p,v,ok)+`<div class="mn-mt"><span>Mannschaftsteil</span>${L.length?`<div class="sbseg mn-seg">${L.map(k=>`<button type="button" data-set="mt:${k}" class="${v.mt===k?'on':''}" ${ok&&L.length>1?'':'disabled'}>${SVM_MT[k]}</button>`).join('')}</div>${L.length<2?'<small>folgt aus der Position</small>':''}`:'<small>erst die Hauptposition wählen</small>'}</div>`; };
  const _s=MN_A.pos.set; MN_A.pos.set=(v,k,x)=>{ if(k==='mt'){ if(svmMtErlaubt(v.ps).includes(x))v.mt=x; return; } return _s(v,k,x); };
  MN_A.pos.read=(k,val,v)=>{ const r=_r?_r(k,val,v):val; if(k==='ps'){ const L=svmMtErlaubt(val); if(!L.includes(v.mt))v.mt=L[0]; } return r; };
}
{ const _sv22=mnSave; mnSave=async function(btn){
  try{ const D=MN.draft.pos||{}; if(MN_A.pos.can())Object.entries(D).forEach(([pid,d])=>{ const p=trP(pid); if(!p||!('mt' in d))return; const pos=d.ps||p.pos;
      if(d.mt&&svmMtErlaubt(pos).includes(d.mt))crmSet(pid,{mt:d.mt}); delete d.mt; if(!Object.keys(d).length)delete D[pid]; }); }catch(e){ console.warn('Mannschaftsteil',e); }
  return _sv22.apply(this,arguments); }; }

/* =====================================================================
   7.3 Torwart-Eye-Test: fünf Kategorien auf den bestehenden Spalten
   ===================================================================== */
const SVM_EYE_TW=[['tem','Hechten','HEC'],['def','Ballsicherheit','BAL'],['sch','Abschlag','ABS'],['pas','Stellungsspiel','STE'],['dri','Reflexe','REF']];
Object.keys(SV4_EYE_TW).forEach(k=>delete SV4_EYE_TW[k]); SVM_EYE_TW.forEach(([k,l])=>SV4_EYE_TW[k]=l);
SV4_EYE_W.TW={tem:.2,def:.2,sch:.15,pas:.2,dri:.25,phy:0};
// Während ein Torwart gezeichnet wird, zeigt SV4_EYE nur seine fünf Kategorien (Spalte „phy“ bleibt beim Torwart leer)
function svmMitTw(p,fn){ if(!p||p.pos!=='TW')return fn(); const alt=SV4_EYE.slice(); SV4_EYE.splice(0,SV4_EYE.length,...SVM_EYE_TW); try{ return fn(); }finally{ SV4_EYE.splice(0,SV4_EYE.length,...alt); } }
{ const _ef=pf4EyeForm; pf4EyeForm=function(box,p){ return svmMitTw(p,()=>_ef.apply(this,arguments)); }; }
if(MN_A.eye){ const _c=MN_A.eye.ctl; MN_A.eye.ctl=(p,v,ok)=>svmMitTw(p,()=>_c(p,v,ok)); }
if(typeof SV50_INFO!=='undefined'&&SV50_INFO.eye)SV50_INFO.eye.h=(SV50_INFO.eye.h||'')+' Torhüter werden in fünf eigenen Kategorien bewertet: Hechten, Ballsicherheit, Abschlag, Stellungsspiel und Reflexe.';

/* =====================================================================
   7.4 PlayStyles statt Skills, Rolle und Charakter
   Gespeichert wird weiter im Feld „sk“ (gleiche Schlüssel, wo es eine Entsprechung gibt), „+“ = herausragend.
   ===================================================================== */
const SVM_PST=[
  // Torwart
  {k:'reflexe',t:'Schnelle Reflexe',g:'Torwart',fc:'Quick Reflexes',d:'Reagiert blitzschnell, auch bei Schüssen aus kurzer Distanz',tw:1},
  {k:'reichweite',t:'Große Reichweite',g:'Torwart',fc:'Far Reach',d:'Kommt auch an Bälle in die langen Ecken',tw:1},
  {k:'strafraum',t:'Flankenfänger',g:'Torwart',fc:'Cross Claimer',d:'Kommt raus und pflückt Flanken sicher',tw:1},
  {k:'einsgegeneins',t:'Herauslaufen',g:'Torwart',fc:'Rush Out',d:'Verkürzt den Winkel und gewinnt Eins-gegen-eins-Duelle',tw:1},
  {k:'abwehren',t:'Sicheres Abwehren',g:'Torwart',fc:'Deflector',d:'Lenkt Schüsse zur Seite aus der Gefahrenzone',tw:1},
  {k:'fussarbeit',t:'Fußarbeit',g:'Torwart',fc:'Footwork',d:'Sicher mit dem Ball am Fuß, spielt mit',tw:1},
  {k:'abwurf',t:'Weiter Abwurf',g:'Torwart',fc:'Far Throw',d:'Leitet mit weiten, genauen Abwürfen Konter ein',tw:1},
  // Körperlich
  {k:'luftduell',t:'Lufthoheit',g:'Körperlich',fc:'Aerial Fortress',d:'Gewinnt Kopfballduelle in beiden Strafräumen'},
  {k:'robust',t:'Robust',g:'Körperlich',fc:'Bruiser',d:'Körperlich präsent, schwer vom Ball zu trennen'},
  {k:'antritt',t:'Antritt',g:'Körperlich',fc:'Quick Step',d:'Explosiv auf den ersten Metern'},
  {k:'motor',t:'Unermüdlich',g:'Körperlich',fc:'Relentless',d:'Läuft 90 Minuten durch, lässt kaum nach'},
  {k:'einwurf',t:'Weiter Einwurf',g:'Körperlich',fc:'Long Throw',d:'Einwurf als Standardwaffe'},
  {k:'akrobatisch',t:'Akrobatisch',g:'Körperlich',fc:'Acrobatic',d:'Kommt auch per Seitfall- oder Fallrückzieher an den Ball'},
  // Ballkontrolle
  {k:'dribbling',t:'Technisch',g:'Ballkontrolle',fc:'Technical',d:'Enge Ballführung, kommt im Dribbling vorbei'},
  {k:'tempo',t:'Schnell am Ball',g:'Ballkontrolle',fc:'Rapid',d:'Hohes Tempo mit dem Ball am Fuß'},
  {k:'erstkontakt',t:'Erster Kontakt',g:'Ballkontrolle',fc:'First Touch',d:'Saubere Ballannahme, auch unter Druck'},
  {k:'trickser',t:'Trickser',g:'Ballkontrolle',fc:'Trickster',d:'Setzt Tricks und Finten gewinnbringend ein'},
  {k:'pressresistent',t:'Pressingresistent',g:'Ballkontrolle',fc:'Press Proven',d:'Behauptet den Ball gegen Druck'},
  {k:'kreativ',t:'Kreativ',g:'Ballkontrolle',fc:'Flair',d:'Löst Situationen mit überraschenden Ideen'},
  // Defensive
  {k:'zweikampf',t:'Zweikampfstark',g:'Defensive',fc:'Anticipate',d:'Gewinnt Duelle am Boden mit sauberem Tackling'},
  {k:'antizipation',t:'Abfangen',g:'Defensive',fc:'Intercept',d:'Liest das Spiel und fängt Pässe ab'},
  {k:'stellung',t:'Stellungsspiel',g:'Defensive',fc:'Jockey',d:'Steht richtig, lässt sich nicht ausspielen'},
  {k:'block',t:'Blocken',g:'Defensive',fc:'Block',d:'Wirft sich in jeden Schuss'},
  {k:'graetsche',t:'Grätsche',g:'Defensive',fc:'Slide Tackle',d:'Grätscht sauber im richtigen Moment'},
  // Pass
  {k:'steilpass',t:'Steilpass',g:'Pass',fc:'Incisive Pass',d:'Sieht und spielt den Pass in die Tiefe'},
  {k:'scharf',t:'Scharfer Pass',g:'Pass',fc:'Pinged Pass',d:'Harte, flache Pässe über weite Distanz'},
  {k:'langball',t:'Langer Ball',g:'Pass',fc:'Long Ball Pass',d:'Lange Bälle und Verlagerungen kommen an'},
  {k:'kurzpass',t:'Tiki-Taka',g:'Pass',fc:'Tiki Taka',d:'Sicher im Kurzpassspiel, verliert kaum Bälle'},
  {k:'flanke',t:'Scharfe Flanke',g:'Pass',fc:'Whipped Pass',d:'Scharfe, präzise Flanken'},
  {k:'einfall',t:'Einfallsreich',g:'Pass',fc:'Inventive',d:'Überraschende Pässe, auch mit Hacke oder Außenrist'},
  // Abschluss
  {k:'abschluss',t:'Platzierter Schuss',g:'Abschluss',fc:'Finesse Shot',d:'Schlenzt und platziert sicher'},
  {k:'wucht',t:'Wuchtiger Schuss',g:'Abschluss',fc:'Power Shot',d:'Harter Schuss, auch aus der Distanz'},
  {k:'flach',t:'Flachschuss',g:'Abschluss',fc:'Low Driven Shot',d:'Flache, harte Abschlüsse'},
  {k:'lupfer',t:'Lupfer',g:'Abschluss',fc:'Chip Shot',d:'Hebt den Ball über den Torwart'},
  {k:'kopfball',t:'Kopfballstark',g:'Abschluss',fc:'Precision Header',d:'Trifft mit dem Kopf, stark bei Flanken'},
  {k:'standard',t:'Standards',g:'Abschluss',fc:'Dead Ball',d:'Freistöße und Ecken mit Qualität'},
  {k:'gamechanger',t:'Gamechanger',g:'Abschluss',fc:'Gamechanger',d:'Spektakuläre Abschlüsse, auch mit dem Außenrist'},
  {k:'elfer',t:'Elfmeterschütze',g:'Abschluss',fc:'',d:'Nervenstark vom Punkt (keine EA-Entsprechung, aus der früheren Liste)'}
];
SB_SKILLS.splice(0,SB_SKILLS.length,...SVM_PST);
Object.keys(SB_SK).forEach(k=>delete SB_SK[k]); SB_SKILLS.forEach(s=>SB_SK[s.k]=s);
SB_GROUPS.splice(0,SB_GROUPS.length,'Torwart','Körperlich','Ballkontrolle','Defensive','Pass','Abschluss');
Object.assign(SB_IC,{
  reichweite:'<path d="M3 12h18"/><path d="m6 9-3 3 3 3M18 9l3 3-3 3"/><circle cx="12" cy="7" r="2"/>',
  abwehren:'<path d="M5 19 19 5"/><circle cx="7" cy="7" r="3"/><path d="M14 18h6v-6"/>',
  antritt:'<path d="M4 18h6"/><path d="M4 13h9"/><path d="M4 8h13l-3-3M17 8l-3 3"/>',
  akrobatisch:'<circle cx="16" cy="6" r="2.5"/><path d="M4 20c3-7 6-9 11-9"/><path d="M9 13 5 9"/>',
  trickser:'<path d="M4 16c2-6 4-6 6 0s4 6 6 0 3-4 4-4"/>',
  kreativ:'<path d="M9 18h6M10 21h4"/><path d="M12 3a6 6 0 0 0-4 10.5c.7.7 1 1.5 1 2.5h6c0-1 .3-1.8 1-2.5A6 6 0 0 0 12 3z"/>',
  stellung:'<path d="M4 20h16"/><path d="M8 20V9M16 20V9"/><path d="M8 9h8"/><circle cx="12" cy="5" r="2"/>',
  scharf:'<path d="M3 12h14"/><path d="m13 7 5 5-5 5"/><path d="M3 8h5M3 16h5"/>',
  einfall:'<path d="M5 19c0-8 6-14 14-14"/><path d="M15 5h4v4"/><circle cx="6" cy="18" r="2"/>',
  flach:'<path d="M3 17h18"/><path d="m16 13 4 4-4 4"/><circle cx="6" cy="14" r="2"/>',
  lupfer:'<path d="M4 18C7 6 17 6 20 18"/><path d="M3 18h18"/><circle cx="12" cy="8" r="1.5"/>',
  gamechanger:'<path d="m12 3 2.6 5.4 5.9.8-4.3 4.1 1 5.9L12 16.4 6.8 19.2l1-5.9L3.5 9.2l5.9-.8z"/>'});
try{ if(typeof SVM_KPI!=='undefined'){ const x=SVM_KPI.find(k=>k.t==='PlayStyles'); if(x)x.d='Besondere Stärken nach den Kategorien aus EA SPORTS FC 26: Torwart, Körperlich, Ballkontrolle, Defensive, Pass, Abschluss. Einmal antippen = hat er, zweimal = herausragend („+“). Ersetzt die frühere Einteilung in Skills, Rolle und Charakter.'; } }catch(e){}
if(MN_A.skills){
  MN_A.skills.t='PlayStyles';
  MN_A.skills.leer=p=>!sbOf(p).sk.length;
  MN_A.skills.orig=p=>{ const b=sbOf(p); return {sk:mnSkStr(Object.fromEntries(b.sk.map(x=>[x.k,x.plus?2:1])))}; };
  MN_A.skills.ctl=(p,v,ok)=>{ const open=MN.open.has(p.id), sk=mnSkObj(v.sk), tw=p.pos==='TW', n=Object.keys(sk).length;
    const sum=`<button type="button" class="mn-sum svm-pst-sum" data-open>${n?Object.entries(sk).map(([k,x])=>SB_SK[k]?sbHex(k,x===2,'sm'):'').join(''):'<i class="miss50">noch keine PlayStyles</i>'}${n?` <span>${n} PlayStyle${n===1?'':'s'}</span>`:''}<em>${open?'zuklappen':'bearbeiten'}</em></button>`;
    if(!open)return sum;
    const G=tw?['Torwart','Pass','Körperlich']:SB_GROUPS.filter(g=>g!=='Torwart');
    return sum+`<div class="mn-sb svm-pst">${G.map(g=>`<div class="mn-fg"><span>${svEsc(g)}</span><div class="chips">${SB_SKILLS.filter(s=>s.g===g).map(s=>{ const x=sk[s.k]||0; return `<button type="button" class="sbskchip v${x}" data-set="sk:${s.k}" title="${svEsc(s.d+(s.fc?' · EA: '+s.fc:''))}" ${ok?'':'disabled'}>${svEsc(s.t)}${x===2?' +':''}</button>`; }).join('')}</div></div>`).join('')}
      <p class="note small">Einmal antippen = hat er, zweimal = herausragend („+“), dreimal = entfernen.</p></div>`; };
}
{ const _pf22c=MN_VIEWS.pflege; MN_VIEWS.pflege=mnViewPflege=function(B){ const r=_pf22c.apply(this,arguments);
  try{ B.querySelectorAll('.mp18 > p.note.small').forEach(x=>{ if(/^Zeile antippen zum Aufklappen\. Rolle/.test(x.textContent))x.textContent='Zeile antippen zum Aufklappen. PlayStyles wie in EA SPORTS FC 26, nach Kategorien. Frühere Angaben zu Rolle und Charakter bleiben gespeichert, werden aber nicht mehr gepflegt.';
      if(/^Hauptposition wählen/.test(x.textContent))x.textContent='Hauptposition wählen, darunter antippen, was er noch spielen kann. Der Mannschaftsteil folgt aus der Hauptposition, bei Außenverteidiger, Mittelfeld, Flügel und Sturm lässt er sich umstellen. Er bestimmt, womit der MScore die Leistung vergleicht.'; }); }catch(e){}
  return r; }; }

/* =====================================================================
   6. Abwesenheiten: eintragen, bearbeiten, Übersicht mit Zeitstrahl
   ===================================================================== */
const SVM_ABW={seg:'liste',team:'1',all:null,busy:false,key:''};
async function svmAbwAll(force){ const H=svmHalb(); if(SVM_ABW.busy||(!force&&SVM_ABW.all&&SVM_ABW.key===H.k)||!canTraining())return; SVM_ABW.busy=true;
  try{ const {data,error}=await SVB.sb.from('abwesenheiten').select('*').gte('bis',H.von).lte('von',H.bis).order('von').limit(2000); if(!error){ SVM_ABW.all=data||[]; SVM_ABW.key=H.k; } }catch(e){ console.warn('Abwesenheiten',e); }
  finally{ SVM_ABW.busy=false; } }
async function svmAbwNeu(){ SVM_ABW.all=null; await Promise.all([sv91Load(true),svmAbwAll(true)]); try{ if(typeof kbLoad==='function')await kbLoad(true); }catch(e){} try{ if(svCurTab()==='training')trRender(); }catch(e){} }
function svmAbwEdit(id,pid){
  const a0=id?((SVM_ABW.all||[]).find(x=>x.id===id)||SV91.abw.find(x=>x.id===id)):null, t=trToday();
  const sq=svAktuelleSpieler().slice().sort(svNachCmp); if(a0&&!sq.some(p=>p.id===a0.player_id)&&trP(a0.player_id))sq.unshift(trP(a0.player_id));
  const st=a0?{player_id:a0.player_id,von:a0.von,bis:a0.bis,grund:a0.grund,notiz:a0.notiz||''}:{player_id:pid||'',von:t,bis:sv91Add(t,6),grund:'urlaub',notiz:''};
  const M=svModal(`<div class="mhead"><div class="rm-ic" style="width:46px;height:46px">${SVI('clock')}</div><div><h2 style="margin:0">${a0?'Abwesenheit bearbeiten':'Abwesenheit eintragen'}</h2><div class="msub">Für jedes Training und Spiel im Zeitraum ist der Spieler automatisch abgemeldet und wird nicht erinnert.</div></div></div>
    <div class="editgrid" style="margin-top:12px"><div class="field w" style="grid-column:1/-1"><label>Spieler</label><select id="sa22p"><option value="">– wählen –</option>${sq.map(p=>`<option value="${svEsc(p.id)}"${st.player_id===p.id?' selected':''}>${svEsc(p.name)}</option>`).join('')}</select></div>
      <div class="field"><label>Von</label><input type="date" id="sa22v" value="${svEsc(st.von)}"></div><div class="field"><label>Bis</label><input type="date" id="sa22b" value="${svEsc(st.bis)}"><div class="trquick">${[1,2,3,4].map(w=>`<button type="button" data-w="${w}">${w} W</button>`).join('')}</div></div>
      <div class="field"><label>Grund</label><select id="sa22g">${Object.entries(SV91_GR).map(([k,v])=>`<option value="${k}"${st.grund===k?' selected':''}>${v}</option>`).join('')}</select></div>
      <div class="field" style="grid-column:1/-1"><label>Notiz (optional)</label><input id="sa22n" maxlength="200" value="${svEsc(st.notiz)}"></div></div>
    ${a0&&a0.via==='link'?'<p class="note small">Vom Spieler selbst über den Kabinen-Link eingetragen.</p>':''}
    <div class="btnrow sbact"><button class="btn" type="button" id="sa22s">${SVI('check')} Speichern</button><button class="btn ghost" type="button" id="sa22c">Abbrechen</button>${a0?'<button class="btn ghost" type="button" id="sa22x" style="margin-left:auto;color:#fca5a5">Löschen</button>':''}</div>`);
  const $=s=>M.querySelector(s);
  M.querySelectorAll('[data-w]').forEach(b=>b.onclick=()=>{ $('#sa22b').value=sv91Add($('#sa22v').value||t,+b.dataset.w*7-1); });
  $('#sa22c').onclick=()=>closeOverlay();
  if($('#sa22x'))$('#sa22x').onclick=async e=>{ const b=e.currentTarget; if(!b.classList.contains('sure')){ b.classList.add('sure'); b.textContent='Wirklich löschen?'; return; } b.disabled=true;
    const {error}=await SVB.sb.from('abwesenheiten').delete().eq('id',a0.id); if(error){ b.disabled=false; return kToast('⚠️ '+error.message); }
    closeOverlay(); kToast('Gelöscht, die automatischen Absagen sind zurückgenommen'); svmAbwNeu(); };
  $('#sa22s').onclick=async e=>{ const row={player_id:$('#sa22p').value,von:$('#sa22v').value,bis:$('#sa22b').value,grund:$('#sa22g').value,notiz:$('#sa22n').value.trim()||null};
    if(!row.player_id)return kToast('Bitte einen Spieler wählen'); if(!row.von||!row.bis||row.bis<row.von)return kToast('Bitte einen gültigen Zeitraum wählen');
    if(svmTage(row.von,row.bis)>90)return kToast('Höchstens 90 Tage am Stück, bitte aufteilen');
    const b=e.currentTarget; b.disabled=true;
    const q=a0?SVB.sb.from('abwesenheiten').update(row).eq('id',a0.id):SVB.sb.from('abwesenheiten').insert(Object.assign(row,{via:'app'}));
    const {error}=await q; if(error){ b.disabled=false; return kToast('⚠️ '+error.message); }
    closeOverlay(); kToast('✓ '+trName(row.player_id)+': '+SV91_GR[row.grund]+' '+(a0?'geändert':'eingetragen')); svmAbwNeu(); };
}
function svmAbwSeg(B){ B.insertAdjacentHTML('afterbegin',`<div class="seg50 svm-aseg" role="tablist">${[['liste','Abwesenheiten'],['uebersicht','Übersicht']].map(([k,t])=>`<button type="button" class="${SVM_ABW.seg===k?'on':''}" data-aseg="${k}">${t}</button>`).join('')}</div>`);
  B.querySelectorAll('[data-aseg]').forEach(b=>b.onclick=()=>{ SVM_ABW.seg=b.dataset.aseg; trRender(); }); }
function svmViewAbw(B){
  if(!SV91.loaded){ B.innerHTML='<div class="card"><div class="empty">Lade Abwesenheiten …</div></div>'; mnLoadOnce('u91',()=>sv91Load(),mnRerender('urlaub')); return; }
  const H=svmHalb(); if(!SVM_ABW.all||SVM_ABW.key!==H.k){ if(!SVM_ABW.busy)svmAbwAll().then(()=>{ if(svCurTab()==='training'&&TR.view==='urlaub')trRender(); }); }
  if(SVM_ABW.seg==='uebersicht')svmAbwUebersicht(B,H); else svmAbwListe(B,H);
  svmAbwSeg(B);
}
function svmAbwListe(B,H){
  const t=trToday(), all=(SVM_ABW.all||SV91.abw).slice(), byId=new Map(); SV91.abw.forEach(a=>byId.set(a.id,a)); all.forEach(a=>byId.set(a.id,a));
  const L=[...byId.values()], heute=L.filter(a=>a.von<=t&&t<=a.bis), bald=L.filter(a=>a.von>t).sort((a,b)=>a.von.localeCompare(b.von)), alt=L.filter(a=>a.bis<t&&a.bis>=H.von).sort((a,b)=>b.von.localeCompare(a.von));
  const row=a=>`<button type="button" class="ab91-r svm-ar${a.von<=t&&t<=a.bis?' jetzt':''}" data-sa22="${svEsc(a.id)}"><div><b>${svEsc(trName(a.player_id))}</b><small>${sv91Tag(a.von)} bis ${sv91Tag(a.bis)} · ${svmTage(a.von,a.bis)+1} Tage · ${svEsc(SV91_GR[a.grund]||a.grund)}${a.notiz?' · '+svEsc(a.notiz):''} · ${a.via==='link'?'selbst eingetragen':'vom Trainerteam'}</small></div><em>${SVI('chev')}</em></button>`;
  B.innerHTML=`<div class="tiles trtiles"><div class="tile"><div class="v ${heute.length?'warn':''}">${heute.length}</div><div class="l">Heute abwesend</div><div class="s">${heute.length?svEsc(heute.slice(0,3).map(a=>sv91Vor(trName(a.player_id))).join(', '))+(heute.length>3?' …':''):'alle an Bord'}</div></div>
      <div class="tile"><div class="v">${bald.filter(a=>a.von<=sv91Add(t,14)).length}</div><div class="l">Nächste 14 Tage</div><div class="s">${bald.length?svEsc(bald.slice(0,3).map(a=>sv91Vor(trName(a.player_id))+' ab '+TRC.fmt(a.von)).join(', ')):'nichts geplant'}</div></div></div>
    <div class="card"><div class="vrat-h"><h3 class="trh" style="margin:0">${SVI('clock')} Aktuell und geplant <small>${heute.length+bald.length}</small></h3>${canTraining()?`<button type="button" class="btn sm" data-sa22n>${SVI('plus')} Eintragen</button>`:''}</div>
      ${heute.length+bald.length?`<div class="ab91-l">${heute.concat(bald).map(row).join('')}</div>`:'<p class="note">Niemand hat gerade eine Abwesenheit eingetragen.</p>'}
      <p class="note small">Spieler tragen Urlaub auch selbst über ihren Kabinen-Link ein. Antippen zum Ändern oder Löschen.</p></div>
    ${alt.length?`<details class="card md91-alt"><summary>Vorbei in der ${svEsc(H.t)} (${alt.length})</summary><div class="ab91-l">${alt.map(row).join('')}</div></details>`:''}`;
  B.querySelectorAll('[data-sa22]').forEach(b=>b.onclick=()=>{ if(canTraining())svmAbwEdit(b.dataset.sa22); });
  const n=B.querySelector('[data-sa22n]'); if(n)n.onclick=()=>svmAbwEdit(null);
}
function svmAbwUebersicht(B,H){
  const t=trToday(), tage=svmTage(H.von,H.bis)+1, team=SVM_ABW.team;
  const pl=mnIntern().filter(p=>team==='alle'||(mnTeam(p)||'-')===team).sort((a,b)=>(mnTeamOrd(mnTeam(a))-mnTeamOrd(mnTeam(b)))||a.name.localeCompare(b.name,'de'));
  const ids=new Set(pl.map(p=>p.id)), A=(SVM_ABW.all||[]).filter(a=>ids.has(a.player_id));
  const clip=(v,b)=>({v:v<H.von?H.von:v,b:b>H.bis?H.bis:b});
  const I=(TR.st.injuries||[]).filter(i=>ids.has(i.p)).map(i=>({player_id:i.p,von:i.b,bis:i.z||i.pr||t,grund:'verletzt',inj:1,offen:!i.z})).filter(i=>i.bis>=H.von&&i.von<=H.bis);
  const S=new Map(); pl.forEach(p=>S.set(p.id,{p,n:0,tage:0,gr:{},inj:0}));
  A.forEach(a=>{ const x=S.get(a.player_id); if(!x)return; const c=clip(a.von,a.bis), d=svmTage(c.v,c.b)+1; x.n++; x.tage+=d; x.gr[a.grund]=(x.gr[a.grund]||0)+d; });
  I.forEach(i=>{ const x=S.get(i.player_id); if(!x)return; const c=clip(i.von,i.bis); x.inj+=svmTage(c.v,c.b)+1; });
  const rows=[...S.values()], sumT=rows.reduce((s,x)=>s+x.tage,0), betr=rows.filter(x=>x.n).length, gr={}; rows.forEach(x=>Object.entries(x.gr).forEach(([g,d])=>gr[g]=(gr[g]||0)+d));
  const top=Object.entries(gr).sort((a,b)=>b[1]-a[1])[0], injT=rows.reduce((s,x)=>s+x.inj,0);
  const pct=d=>Math.max(0,Math.min(100,svmTage(H.von,d)/tage*100));
  const monate=[]; { let d=H.von; while(d<=H.bis){ monate.push(d); const y=+d.slice(0,4), m=+d.slice(5,7); d=(m===12?(y+1)+'-01':y+'-'+String(m+1).padStart(2,'0'))+'-01'; } }
  const MON=['Jan','Feb','Mär','Apr','Mai','Jun','Jul','Aug','Sep','Okt','Nov','Dez'];
  const bars=pid=>A.filter(a=>a.player_id===pid).map(a=>{ const c=clip(a.von,a.bis); return `<i class="svm-tb g-${svEsc(a.grund)}${a.bis<t?' alt':''}" style="left:${pct(c.v)}%;width:${Math.max(.6,pct(sv91Add(c.b,1))-pct(c.v))}%" title="${svEsc(trName(pid))}: ${svEsc(SV91_GR[a.grund]||a.grund)} ${TRC.fmt(a.von)} bis ${TRC.fmt(a.bis)}${a.notiz?' · '+svEsc(a.notiz):''}"></i>`; }).join('')
    +I.filter(i=>i.player_id===pid).map(i=>{ const c=clip(i.von,i.bis); return `<i class="svm-tb g-inj${i.offen?' offen':''}" style="left:${pct(c.v)}%;width:${Math.max(.6,pct(sv91Add(c.b,1))-pct(c.v))}%" title="${svEsc(trName(pid))}: verletzt seit ${TRC.fmt(i.von)}${i.offen?' (noch offen)':' bis '+TRC.fmt(i.bis)}"></i>`; }).join('');
  const lade=!SVM_ABW.all;
  B.innerHTML=`<div class="chips4 svm-at">${[['1','Erste'],['2','Zweite'],['A','A-Jugend'],['U','Mit Pass'],['alle','Alle']].map(([k,l])=>`<button type="button" class="${team===k?'on':''}" data-sat="${k}">${l}</button>`).join('')}</div>
    <div class="tiles trtiles"><div class="tile"><div class="v">${sumT}</div><div class="l">Abwesenheitstage</div><div class="s">${svEsc(H.t)}, ohne Verletzungen</div></div>
      <div class="tile"><div class="v">${betr}</div><div class="l">Spieler betroffen</div><div class="s">von ${pl.length} ${team==='alle'?'internen Spielern':'in '+svEsc(MN_TEAM[team]||team)}</div></div>
      <div class="tile"><div class="v">${top?svEsc(SV91_GR[top[0]]||top[0]):'–'}</div><div class="l">Häufigster Grund</div><div class="s">${top?top[1]+' Tage':'noch nichts eingetragen'}</div></div>
      <div class="tile"><div class="v">${injT}</div><div class="l">Verletzungstage</div><div class="s">zum Vergleich, aus „Verletzungen“</div></div></div>
    <div class="card"><h3 class="trh">${SVI('clock')} Zeitstrahl ${svEsc(H.t)} <small>${TRC.fmt(H.von)}${H.von.slice(2,4)} bis ${TRC.fmt(H.bis)}${H.bis.slice(2,4)}</small></h3>
      ${lade?'<p class="note">Lade Abwesenheiten der Halbserie …</p>':pl.length?`<div class="svm-tlw"><div class="svm-tl" style="--heute:${pct(t)}%">
        <div class="svm-tr svm-th"><span></span><div class="svm-tt">${monate.map(m=>`<b style="left:${pct(m)}%">${MON[+m.slice(5,7)-1]}</b>`).join('')}${t>=H.von&&t<=H.bis?`<i class="svm-now" style="left:${pct(t)}%"></i>`:''}</div></div>
        ${pl.map(p=>`<div class="svm-tr"><span data-svp="${svEsc(p.id)}">${svEsc(p.name)} <small>${svEsc(MN_TK[mnTeam(p)]||'')}</small></span><div class="svm-tt">${monate.map(m=>`<u style="left:${pct(m)}%"></u>`).join('')}${bars(p.id)}${t>=H.von&&t<=H.bis?`<i class="svm-now" style="left:${pct(t)}%"></i>`:''}</div></div>`).join('')}</div></div>
        <div class="svm-leg">${Object.entries(SV91_GR).filter(([k])=>k!=='verletzt').map(([k,v])=>`<span><i class="svm-tb g-${k}"></i>${v}</span>`).join('')}<span><i class="svm-tb g-inj"></i>Verletzt</span><span><i class="svm-tb g-urlaub alt"></i>vorbei</span></div>`
      :'<p class="note">Keine Spieler in dieser Mannschaft.</p>'}</div>
    <div class="card"><h3 class="trh">${SVI('users')} Je Spieler <small>${svEsc(H.t)}</small></h3>
      <div class="trtw"><table class="trtab t50"><thead><tr><th class="nm50">Spieler</th><th>Einträge</th><th>Tage</th><th>Gründe</th><th>Verletzt</th></tr></thead><tbody>
      ${rows.filter(x=>x.n||x.inj).sort((a,b)=>b.tage-a.tage||b.inj-a.inj).map(x=>`<tr data-svp="${svEsc(x.p.id)}"><td class="nm50"><b>${svEsc(x.p.name)}</b></td><td>${x.n||'–'}</td><td><b>${x.tage||'–'}</b></td><td>${Object.entries(x.gr).map(([g,d])=>svEsc(SV91_GR[g]||g)+' '+d).join(', ')||'–'}</td><td>${x.inj?x.inj+' Tage':'–'}</td></tr>`).join('')||'<tr><td colspan="5" class="note">In dieser Halbserie noch keine Abwesenheiten.</td></tr>'}</tbody></table></div>
      <p class="note small">Gezählt werden Kalendertage in der ${svEsc(H.t)}, geplante Abwesenheiten eingeschlossen. Verletzungen stehen getrennt, weil sie unter „Verletzungen“ gepflegt werden.</p></div>`;
  B.querySelectorAll('[data-sat]').forEach(b=>b.onclick=()=>{ SVM_ABW.team=b.dataset.sat; trRender(); });
  B.querySelectorAll('[data-svp]').forEach(x=>x.onclick=()=>openModal(x.dataset.svp));
}
MN_VIEWS.urlaub=svmViewAbw;
if(SV50_INFO['training:urlaub'])Object.assign(SV50_INFO['training:urlaub'],{w:'Urlaub und andere Abwesenheiten: eintragen, ändern und für die laufende Halbserie auswerten.',
  s:'Unter „Abwesenheiten“ antippen zum Ändern. Unter „Übersicht“ steht der Zeitstrahl der Halbserie je Mannschaft.'});
else SV50_INFO['training:urlaub']={w:'Urlaub und andere Abwesenheiten: eintragen, ändern und für die laufende Halbserie auswerten.',f:'Früh sehen, wer wann fehlt.',h:'Wer eingetragen ist, ist für Training und Spiele automatisch abgemeldet.',s:'Unter „Abwesenheiten“ antippen zum Ändern. Unter „Übersicht“ steht der Zeitstrahl der Halbserie je Mannschaft.',b:[]};

/* ---------- Profil: „Spielerbogen“ wird zu „PlayStyles“ ---------- */
function svmPstHtml(p){ const b=sbOf(p), by={}; b.sk.forEach(x=>{ const s=SB_SK[x.k]; if(s)(by[s.g]=by[s.g]||[]).push(x); });
  const G=SB_GROUPS.filter(g=>by[g]);
  return `${G.length?G.map(g=>`<div class="svm-pstg"><span>${svEsc(g)}</span><div>${by[g].map(x=>`<span class="svm-pstc">${sbHex(x.k,x.plus,'sm')}<b>${svEsc(SB_SK[x.k].t)}${x.plus?' +':''}</b></span>`).join('')}</div></div>`).join('')
      :'<p class="note">Noch keine PlayStyles gepflegt.</p>'}
    ${canWriteField('sk')&&mnIsIntern(p)?`<div class="btnrow"><button type="button" class="btn ghost sm" data-svmpst="${svEsc(p.id)}">${SVI('sliders')} PlayStyles pflegen</button></div>`:''}`; }
{ const _pb22=pf4Build; pf4Build=function(id){ const r=_pb22.apply(this,arguments);
  try{ const M=document.getElementById('modal'), d=M&&M.querySelector('details.pf4-sec[data-k="bogen"]'), p=trP(id); if(d&&p){ const s=d.querySelector('summary span'); if(s)s.textContent='PlayStyles';
      const b=d.querySelector('.pf4-b'); if(b){ b.innerHTML=svmPstHtml(p); const btn=b.querySelector('[data-svmpst]'); if(btn)btn.onclick=()=>mnGo('skills',p.id); } } }catch(e){ console.warn('PlayStyles Profil',e); }
  return r; }; }
// Spielerbogen externer Spieler: nur Fuß, PlayStyles und Bemerkungen (Rolle, Charakter und Tags werden nicht mehr gepflegt)
{ const _se22=sbEditor; sbEditor=function(pid){ const r=_se22.apply(this,arguments);
  try{ const E=document.getElementById('sbEd'); if(E){ const fix=()=>{ E.querySelectorAll('.sbsec h4').forEach(h=>{ if(/^Special Skills/.test(h.textContent))h.innerHTML='PlayStyles <small>1× tippen = hat er · 2× = herausragend (+)</small>'; }); };
      fix(); new MutationObserver(fix).observe(E,{childList:true}); const h2=document.querySelector('#modal .mhead h2'); if(h2&&h2.textContent==='Spielerbogen')h2.textContent='Fuß und PlayStyles'; } }catch(e){}
  return r; }; }

/* =====================================================================
   Sportzentrale Beta 0.22 · Teil D (Änderungswünsche aus dem Trainerteam)
   8.3  MScore: Einsatz und Leistung aus der laufenden Saison und den drei Spielzeiten davor, jüngere zählen mehr;
        Leistung nach Mannschaftsteil; ohne „Mannschaft“ und „Form“; eigene Spieler zusätzlich mit Trainings- und Spielleistung
   8.4  FIFA-Karte: genau diese vier oder sechs Bausteine, Foto, Gesamtwert, Position, Mannschaft, starker Fuß, Name,
        Treue-Abzeichen in Bronze, Silber oder Gold statt fünf Herzen
   ===================================================================== */
function svmGrp(p){ const mt=p&&p.pos&&typeof svmMt==='function'?svmMt(p):null; return mt==='S'?'off':mt==='M'?'mid':mt==='A'||mt==='T'?'def':SV94_GRUPPE(p&&p.pos); }
// Eindrücke der laufenden Saison: Training (anwesend) und Spiel (gespielt), ohne angenommene Werte
function svmEindruecke(p){
  if(!p||!p.own||typeof TR==='undefined'||!TR.loaded||!TR.st)return null;
  const st=typeof sv50Start==='function'?sv50Start():'2026-07-01', o={trn:{n:0,s:0,pos:0,neu:0,neg:0},spl:{n:0,s:0,pos:0,neu:0,neg:0}};
  TR.st.sessions.forEach(s=>{ if(s.d<st)return; const a=(s.a||[]).find(x=>x[0]===p.id); if(!a||a[8]==null||!a[9]||a[9]==='default')return;
    const x=s.t==='spiel'?(a[1]==='da'||a[1]==='spaet'?o.spl:null):s.t==='training'&&a[1]!=='weg'?o.trn:null; if(!x)return;
    x.n++; x.s+=+a[8]; const k=svmEiK(a[8]); if(k==='p')x.pos++; else if(k==='m')x.neg++; else x.neu++; });
  ['trn','spl'].forEach(k=>{ const x=o[k]; x.avg=x.n>=3?x.s/x.n:null; });
  return o;
}
// Spielzeiten: laufende plus drei davor, jüngere zählen mehr (1,2 · 1,0 · 0,6 · 0,35 vor Einsatz-Gewichtung)
{ const _se22=sv94Seasons; sv94Seasons=function(p,r){ const S=_se22.apply(this,arguments);
  try{ S.forEach(s=>{ if(s.k==='base')s.rec=1.0; if(s.k==='prev')s.rec=0.6; });
    const K=typeof KLAW!=='undefined'&&KLAW.by&&KLAW.by[p.id];
    if(K&&typeof klaSk==='function'&&typeof svlCode==='function'){
      const add=(k,sk,y,rec,mitte)=>{ const x=K[klaSk(sk)]; if(!x||!x.belegt)return; const lg=[...new Set((x.basis||[]).map(b=>svlCode(b.league)).filter(Boolean))][0]; if(!lg||!sv94Lv(lg))return;
        const sp=+x.einsaetze||0, tsp=30, q=x.minuten!=null&&+x.minuten>0?Math.min(1,+x.minuten/(tsp*90)):sp?Math.min(1,sp/tsp)*0.92:null;
        S.push({k,y,sk,liga:lg,club:x.mannschaft,teamSp:tsp,sp:sp||null,q,qF:null,tore:+x.tore||0,ast:+x.vorlagen||0,rank:null,tc:null,jahre:sv94Jahre(mitte),rec,kla:1}); };
      if(!S.some(s=>s.k==='prev'))add('prev','2425','24/25',0.6,sv94Mitte(-1));
      add('pre2','2324','23/24',0.35,sv94Mitte(-2)); } }catch(e){ console.warn('MScore Saisons',e); }
  return S; }; }
if(typeof SV4_CL!=='undefined')Object.assign(SV4_CL,{trn:'Trainingsleistung',spl:'Spielleistung'});
{ const _tl22d=trLoad; trLoad=async function(){ const r=await _tl22d.apply(this,arguments); try{ SV94.cache.clear(); if(typeof SV70!=='undefined')SV70.cache.clear(); }catch(e){} return r; }; }

/* ---------- Karte: genau die Bausteine des MScore ---------- */
const SVM_KARTE={level:'EIN',prod:'LEI',pot:'POT',scout:'EYE',trn:'TRN',spl:'SPL'};
{ const _sr22=scRate; scRate=function(p){ const R=_sr22.apply(this,arguments);
  try{ const s=R&&R.s; if(s&&s.m4&&!p.isJugend&&Array.isArray(s.comps)){ const T=v=>v==null?null:Math.max(25,Math.min(99,Math.round(30+v*0.69)));
      R.st=s.comps.filter(c=>SVM_KARTE[c.k]).map(c=>[SVM_KARTE[c.k],c.v==null?null:(c.k==='level'||c.k==='prod'||c.k==='trn'||c.k==='spl')?T(c.v):Math.max(25,Math.min(99,Math.round(c.v)))]); } }catch(e){}
  return R; }; }

/* ---------- Treue: Bronze, Silber, Gold ---------- */
const SVM_TREUE={5:['gold','Gold'],4:['gold','Gold'],3:['silber','Silber'],2:['bronze','Bronze']};
function svmTreueBadge(n,t){ const x=SVM_TREUE[n]; return x?`<span class="svm-tb3 ${x[0]}" title="Vereinstreue ${x[1]}${t?': '+svEsc(t):''}">${x[1]}</span>`:''; }
sv90Herzen=function(n){ return svmTreueBadge(n)||'<span class="svm-tb3 none" title="Noch keine Treue-Stufe">–</span>'; };
{ const _fc22=fcCard; fcCard=function(p,o){ o=Object.assign({},o||{});
  try{ if(p&&!p.isJugend&&!o.sub){ const t=typeof mnTeam==='function'?mnTeam(p):null; const club=(p.cur&&p.cur.club)||p.club||''; o.sub=t&&MN_TEAM[t]?svEsc(MN_TEAM[t]):club?svEsc(club):' '; }
    if(p&&p.own&&!o.badge){ const L=sv70Treue(p), S=L&&sv90Stufe(L.score); if(S&&SVM_TREUE[S.n])o.badge=svmTreueBadge(S.n,S.t); } }catch(e){}
  return _fc22.call(this,p,o); }; }

/* =====================================================================
   Sportzentrale Beta 0.22 · Teil E: Zukunft nach Hin- und Rückrunden (Punkte 8.1 und 8.2)
   Regel: die restliche Halbserie der laufenden Saison plus zwei volle Spielzeiten danach.
   Heute (Hinrunde 26/27): Rückrunde 26/27, Hinrunde 27/28, Rückrunde 27/28, Hinrunde 28/29, Rückrunde 28/29.
   Speicherung in spieler_saison, aufstellungen und bedarfe mit Schlüssel „2728H“ oder „2728R“.
   Bestehende Planungen je Saison („2728“) gelten weiter: sie zählen ab der Hinrunde dieser Saison,
   bis für eine Halbserie etwas Eigenes eingetragen ist.
   Kaderplanung und Gespräche sind ein Bereich; Gespräche werden nur dort erfasst, das Profil zeigt das Ergebnis.
   ===================================================================== */
const SVM_HR=/^(\d{2})(\d{2})([HR])$/;
function svmHalbJetzt(){ const m=+trToday().slice(5,7); return m>=7?'H':'R'; }
function svmIdx(k){ const m=SVM_HR.exec(k); return m?(+m[1])*2+(m[3]==='R'?1:0):null; }
function svmKeyOf(i){ const y=Math.floor(i/2); return String(y).padStart(2,'0')+String((y+1)%100).padStart(2,'0')+(i%2?'R':'H'); }
function svmJetztIdx(){ return svmIdx(sv4S()+svmHalbJetzt()); }
function svmPlainOf(i){ const y=Math.floor(i/2); return String(y).padStart(2,'0')+String((y+1)%100).padStart(2,'0'); }
// Zeiträume der Planung: „jetzt“ (laufender Stand) und die folgenden Halbserien bis zur Rückrunde der übernächsten Saison
function svmPerioden(){ const j=svmJetztIdx(), end=(+sv4S().slice(0,2)+2)*2+1, L=[sv4S()]; for(let i=j+1;i<=end;i++)L.push(svmKeyOf(i)); return L; }
function svmIstHalb(s){ return SVM_HR.test(String(s||'')); }

{ const _sl22=sv4SL; sv4SL=function(s){ const m=SVM_HR.exec(String(s||'')); if(m)return (m[3]==='H'?'Hinrunde ':'Rückrunde ')+m[1]+'/'+m[2]; return _sl22.apply(this,arguments); }; }
{ const _sa22=sv4SAdd; sv4SAdd=function(s,n){ const i=svmIdx(String(s||'')); if(i==null)return _sa22.apply(this,arguments);
    const k=i+n, j=svmJetztIdx(); return k<=j?svmPlainOf(k):svmKeyOf(k); }; }
sv4Seasons=function(){ return svmPerioden(); };
// Nachschlagen: genaue Halbserie, sonst Hinrunde derselben Saison (bei Rückrunde), sonst Eintrag der ganzen Saison.
// Übernommene Zeilen bringen keinen Wechsel mit (hoch, runter, neu gelten nur für den Zeitraum, in dem sie stehen).
{ const _ss22=sv4SS; sv4SS=function(pid,s){ const r=_ss22.apply(this,arguments); if(r)return r; s=String(s||''); const m=SVM_HR.exec(s);
  const erb=x=>x?Object.assign({},x,{zukunft:['hoch','runter','neu'].includes(x.zukunft)?'bleibt':x.zukunft,_erbt:x.saison}):null;
  if(m){ const y=m[1]+m[2]; if(m[3]==='R'){ const h=_ss22(pid,y+'H'); if(h)return erb(h); } const pl=_ss22(pid,y); if(!pl)return null; return y===sv4S()||m[3]==='R'?erb(pl):pl; }
  if(/^\d{4}$/.test(s)&&s>sv4S())return _ss22(pid,s+'H');
  return null; }; }
{ const _st22=sv60Target; sv60Target=function(s){ return s===sv4S()?(svmPerioden()[1]||_st22(s)):s; }; }

// Bedarfe und Aufstellungen: Einträge je Saison zeigen sich in der Hinrunde dieser Saison
function svmNormBedarf(){ try{ (SV4.bed||[]).forEach(b=>{ if(/^\d{4}$/.test(b.saison)&&b.saison>sv4S()){ b._saison=b.saison; b.saison=b.saison+'H'; } }); }catch(e){} }
{ const _l22=sv4Load; sv4Load=async function(){ const r=await _l22.apply(this,arguments); svmNormBedarf();
  try{ if(SV4.auf&&SV4.auf.forEach){ const add=[]; SV4.auf.forEach((v,k)=>{ const [t,s,a]=k.split('|'); if(/^\d{4}$/.test(s)&&s>sv4S()&&!SV4.auf.has(t+'|'+s+'H|'+a))add.push([t+'|'+s+'H|'+a,v]);
      if(a==='traum'&&s===sv4S()&&svmPerioden()[1]&&!SV4.auf.has(t+'|'+svmPerioden()[1]+'|traum'))add.push([t+'|'+svmPerioden()[1]+'|traum',v]); }); add.forEach(([k,v])=>SV4.auf.set(k,v)); } }catch(e){}
  return r; }; }

// Traumelf: Zeiträume ohne „jetzt“
sv90TKey=function(){ const T=SV90.traum, L=svmPerioden().slice(1); if(!T.s||!L.includes(T.s))T.s=L[0]; return T.team+'|'+T.s+'|traum'; };
{ const _tr22=sv90Traum; sv90Traum=function(){ const r=_tr22.apply(this,arguments); try{ const P=document.getElementById('panel-sxi'); if(P)P.querySelectorAll(`[data-ts90="${sv4S()}"]`).forEach(b=>b.remove()); }catch(e){} return r; }; }
sv90Wuensche=function(team,s){ const W=(SV60.cfg&&SV60.cfg.wuensche)||{}; let L=W[team+'|'+s]; if(!L&&svmIstHalb(s)){ const y=s.slice(0,4); L=W[team+'|'+y]||(s.endsWith('R')?W[team+'|'+y+'H']:null); } return (L||[]).slice(); };
sv90WSave=async function(team,s,L){
  const W=Object.assign({},(SV60.cfg&&SV60.cfg.wuensche)||{}), keep=new Set(svmPerioden()); svmPerioden().forEach(x=>{ if(svmIstHalb(x))keep.add(x.slice(0,4)); });
  Object.keys(W).forEach(k=>{ if(!keep.has(k.split('|')[1]))delete W[k]; });
  if(L.length)W[team+'|'+s]=L.slice(0,6); else delete W[team+'|'+s];
  await sv60CfgSave(Object.assign({},SV60.cfg||{},{wuensche:W}));
};
if(SV50_INFO.kader)SV50_INFO.kader.s='Oben den Zeitraum wählen: jetzt, die Rückrunde und die Halbserien der nächsten beiden Spielzeiten. Spieler antippen und Zukunft, Sicherheit und Verfügbarkeit festlegen. Gespräche stehen im selben Bereich unter „Gespräche“.';
if(SV50_INFO.sxi)SV50_INFO.sxi.w='Deine Wunschelf je Halbserie, bis zur Rückrunde der übernächsten Saison, auch mit Spielern, die noch nicht zugesagt haben.';
if(typeof SV_PAGES!=='undefined'&&SV_PAGES.sxi)SV_PAGES.sxi=['Traumelf','Wunschspieler und Planung je Halbserie bis zur Rückrunde der übernächsten Saison'];

/* ---------- Ein Bereich: Kaderplanung & Gespräche ---------- */
SV4_HUB.kader.tabs=SV4_HUB.kader.tabs.filter(([k])=>k!=='gespr').map(([k,l])=>k==='kader'?[k,'Kaderplanung & Gespräche']:k==='kaderplan'?[k,'Rollen & PlayStyles']:[k,l]);
{ const _sb22e=sv4Sub; sv4Sub=function(tab){ const k=_sb22e.apply(this,arguments); return k==='gespr'?'kader':k; }; }
function svmKgSeg(P,v){ if(!P||P.querySelector(':scope > .svm-kg'))return; P.insertAdjacentHTML('afterbegin',`<div class="seg50 svm-kg" role="tablist"><button type="button" class="${v==='kader'?'on':''}" data-kg="kader">Planung</button><button type="button" class="${v==='gespr'?'on':''}" data-kg="gespr">Gespräche</button></div>`);
  P.querySelectorAll('[data-kg]').forEach(b=>b.onclick=()=>{ if(b.dataset.kg!==v)goTab(b.dataset.kg); }); }
{ const _kr22=kd4Render; kd4Render=function(){ const r=_kr22.apply(this,arguments);
  try{ const P=document.getElementById('panel-kader'); svmKgSeg(P,'kader');
    if(P){ P.querySelectorAll('[data-ks] small.pz90').forEach(sm=>{ const x=sm.parentNode.dataset.ks, h=svmIstHalb(x)?x.slice(-1):null; sm.textContent=(h?h==='R':svmHalbJetzt()==='H')?'Winterfenster':'Sommerfenster'; });
      const n=P.querySelector('.pz90t'); if(n&&!n.dataset.svm){ n.dataset.svm='1'; const C=sv60C(), md=x=>{ const [mm,dd]=String(x).split('-'); return (+dd)+'.'+(+mm)+'.'; };
        n.innerHTML=`Geplant wird je Halbserie bis zur ${svEsc(sv4SL(svmPerioden().slice(-1)[0]))}. Vor jeder Rückrunde liegt das Winterfenster (${md(C.winter.von)} bis ${md(C.winter.bis)}), Verstärkung dann am schnellsten aus der Zweiten oder der A-Jugend. Vor jeder Hinrunde liegt das Sommerfenster (${md(C.sommer.von)} bis ${md(C.sommer.bis)}).`; } } }catch(e){ console.warn('Kader 0.22',e); }
  return r; }; }
{ const _kg22=kd4Gespr; kd4Gespr=function(){ const r=_kg22.apply(this,arguments); try{ svmKgSeg(document.getElementById('panel-gespr'),'gespr'); }catch(e){} return r; }; }
if(typeof SV_PAGES!=='undefined'){ if(SV_PAGES.kader)SV_PAGES.kader=['Kaderplanung & Gespräche','Wer spielt wann wo: jetzt, Rückrunde und die Halbserien der nächsten beiden Spielzeiten, dazu alle Spielergespräche'];
  if(SV_PAGES.gespr)SV_PAGES.gespr=['Kaderplanung & Gespräche','Alle Spielergespräche: Sicht des Spielers, offene Themen, Entscheidung. Nur hier werden Gespräche erfasst.']; }

/* ---------- Profil: nur das Ergebnis der Planung, keine Eingabe ---------- */
function svmPlanErgebnis(p){
  const P=svmPerioden(), t0=sv4Team(p,P[0]); let w=null;
  for(const x of P.slice(1)){ const t=sv4Team(p,x), z=sv4Zuk(p,x); if(t!==t0||['geht','karriereende','unsicher'].includes(z)){ w={x,t,z}; break; } }
  if(!w)return {b:t0?'Bleibt':'–',s:t0?`${SV4_TEAM[t0]||''} bis ${sv4SL(P[P.length-1])}`:'nicht im Kader',c:'ok'};
  if(!w.t||w.z==='geht'||w.z==='karriereende')return {b:w.z==='karriereende'?'Karriereende':'Geht',s:'ab '+sv4SL(w.x),c:'bad'};
  if(w.z==='unsicher')return {b:'Unsicher',s:'ab '+sv4SL(w.x),c:'warn'};
  return {b:SV4_TEAM[w.t]||w.t,s:'ab '+sv4SL(w.x),c:'ok'};
}
{ const _pb22e=pf4Build; pf4Build=function(id){ const r=_pb22e.apply(this,arguments);
  try{ const M=document.getElementById('modal'), p=sv4P(id); if(M&&p){
      const zk=M.querySelector('.g4.zk'); if(zk){ const E=svmPlanErgebnis(p); zk.innerHTML=`<span>Planung</span><b class="svm-pl ${E.c}">${svEsc(E.b)}</b><small>${svEsc(E.s)} · aus der Kaderplanung</small>`; zk.classList.remove('zk'); }
      const d=M.querySelector('details.pf4-sec[data-k="kader"]'); if(d){ d.querySelectorAll('[data-pf4="gespr"]').forEach(x=>x.remove());
        const b=d.querySelector('.pf4-b'); if(b&&!b.querySelector('.svm-kgo')&&sv4Can())b.insertAdjacentHTML('beforeend',`<div class="btnrow svm-kgo"><button type="button" class="btn ghost sm" data-svmkg>${SVI('users')} In der Kaderplanung öffnen</button></div>`);
        const bt=d.querySelector('[data-svmkg]'); if(bt)bt.onclick=()=>{ try{ closeOverlay(); }catch(e){} const t=sv4Team(p,svmPerioden()[0])||sv4Team(p,svmPerioden()[1]); if(t)KD4.team=t==='A'?'1':t; goTab('kader'); }; } } }catch(e){ console.warn('Profil Planung',e); }
  return r; }; }

/* =====================================================================
   Sportzentrale Beta 0.23 · Rechte je Person, Mannschaften, Jugendtrainer
   - Rechte kommen vom Server (meine_rechte): Bereiche und Unterbereiche je Person, Rolle als Vorgabe
   - App blendet aus, was jemand nicht darf; Datenbank prüft dasselbe (can_training, can_scout, Kontakte)
   - Rechte werden beim Start, alle 5 Minuten und beim Zurückkehren in die App frisch geholt
   - Admin: je Person Bereiche an und aus schalten, Vorgaben je Rolle, Mannschaft und Funktion
   - Neue Rolle „Jugendtrainer“: sieht nur die eigene Mannschaft, alles andere schaltet der Admin frei
   ===================================================================== */
const SVR={loaded:false,role:null,darf:{},titel:{},parent:{},mann:[],funk:[],kann:{},t:0,sig:''};
const SVR_TAB={training:'mannschaft',kabine:'mannschaft:abstimmungen',kasse:'kasse',kader:'kader:planung',gespr:'kader:planung',elf:'kader',ejugend:'kader:jugend',sxi:'kader:traumelf',kaderplan:'kader:rollen',
  scout:'scouting:markt',db:'scouting:markt',blick:'scouting:blick',best:'scouting:beste',bedarf:'scouting:bedarf',kandidaten:'scouting:bedarf',radar:'scouting:radar',gems:'scouting:radar',eye:'scouting:eye',
  totw:'scouting:totw',jugend:'scouting:ajugend',cmp:'scouting:vergleich',verein:'verein',gegner:'spieltag',play:'wissen',model:'wissen',kpi:'wissen'};
const SVR_TRV={home:'mannschaft',players:'mannschaft:spieler',bet:'mannschaft:spieler',sessions:'mannschaft:training',games:'mannschaft:spiele',gstat:'mannschaft:spiele',kommend:'mannschaft:spiele',
  injuries:'mannschaft:verletzungen',urlaub:'mannschaft:abwesenheiten',abw:'mannschaft:abwesenheiten',material:'mannschaft:material',pflege:'mannschaft:massenpflege'};
const SVR_KBV={abst:'mannschaft:abstimmungen',link:'mannschaft:abstimmungen',kontakte:'mannschaft:kontakte',kasse:'kasse'};
const SVR_FUNK={haupttrainer:'Haupttrainer',co:'Co-Trainer',betreuer:'Betreuer'};
const SVR_STUFE={voll:'volle Ausstattung',jugend:'volle Ausstattung',basis:'Basis: ohne Schattenplanung',mini:'Leicht: Anwesenheit und Termine'};

/* Rolle „Jugendtrainer“ in allen Listen */
SVB.ROLE_T.jugend='Jugendtrainer';
SV_ROLE_INFO.jugend={t:'Jugendtrainer',d:'Eigene Mannschaft: Kader, Training, Spiele, Entwicklung',yes:['Nur die eigene Mannschaft','Kader, Training und Spiele','Abstimmung per Gruppenlink','Weitere Bereiche schaltet der Admin frei'],no:['Erste Mannschaft, Scouting, Kaderplanung','Kontaktdaten']};
SV_ROLES.push('jugend'); SV_VORSTAND_INVITE.push('jugend');
SV_TABBAR.jugend=['home','teams'];
if(typeof SV_SIDE!=='undefined'){ Object.keys(SV_SIDE).forEach(r=>{ const L=SV_SIDE[r]; if(L.includes('Mannschaften'))return; const i=L.indexOf('Mannschaft'); L.splice(i<0?1:i+1,0,'Mannschaften'); });
  SV_SIDE.jugend=['Übersicht','Mannschaften','Verein','Wissen','Verwaltung']; }
if(typeof SV_AUF_STD!=='undefined')SV_AUF_STD.jugend=[];
SV_TBL.teams=['users','Teams'];
Object.assign(SV_PAGES,{teams:['Mannschaften','Zweite und Jugend: Kader, Training, Spiele, Abstimmung und Entwicklung je Mannschaft']});

/* ---------- Laden und Zwischenspeicher ---------- */
function svrKey(){ return 'svbc-rechte-'+((window.__SVBC_USER||{}).id||SVU.id||''); }
function svrApply(d){
  if(!d||!d.role)return false;
  SVR.role=d.role; SVR.darf={}; SVR.titel={}; SVR.parent={};
  (d.bereiche||[]).forEach(b=>{ SVR.darf[b.key]=!!b.darf; SVR.titel[b.key]=b.titel; SVR.parent[b.key]=b.parent||null; });
  SVR.mann=d.mannschaften||[]; SVR.funk=d.funktionen||[]; SVR.kann=d.kann||{}; SVR.t=Date.now(); SVR.loaded=true;
  const sig=JSON.stringify([SVR.role,SVR.darf,SVR.kann,SVR.funk]); const alt=SVR.sig; SVR.sig=sig; return alt&&alt!==sig;
}
try{ const c=JSON.parse(localStorage.getItem(svrKey())||'null'); if(c&&c.role===((window.__SVBC_USER||{}).role))svrApply(c); }catch(e){}
let _svrBusy=null;
async function svrLoad(force){
  if(_svrBusy)return _svrBusy; if(!force&&Date.now()-SVR.t<60000&&SVR.loaded)return;
  _svrBusy=(async()=>{
    const vorher={kann:Object.assign({},SVR.kann),loaded:SVR.loaded,darf:Object.assign({},SVR.darf)};
    const {data,error}=await SVB.sb.rpc('meine_rechte'); if(error)throw error;
    const neu=svrApply(data);
    try{ localStorage.setItem(svrKey(),JSON.stringify(data)); }catch(e){}
    if(!vorher.loaded||neu)svrNachAenderung(vorher);
  })().catch(e=>{ if(!/meine_rechte|function|schema/i.test(String(e&&e.message)))console.warn('Rechte',e); }).finally(()=>{ _svrBusy=null; });
  return _svrBusy;
}
function svrNachAenderung(vorher){
  try{ sv4NavVis(); }catch(e){} try{ svBuildTabbar(); }catch(e){}
  try{ document.querySelectorAll('[data-tab="teams"],[data-sheet="teams"]').forEach(b=>b.style.display=svTabAllowed('teams')?'':'none'); sv4NavVis(); }catch(e){}
  try{ const cur=svCurTab(); if(cur&&cur!=='home'&&!svTabAllowed(cur))goTab('home'); else if(cur==='training'||cur==='kabine')sv4HubBar(cur); }catch(e){}
  // Neue Fähigkeiten brauchen Daten, die beim Start nicht geladen wurden: einmal sauber neu laden
  const dazu=vorher.loaded&&(['training','scout','jugend','erste'].some(k=>SVR.kann[k]&&!vorher.kann[k]));
  if(dazu)svrHinweis();
}
function svrHinweis(){
  if(document.getElementById('svrNeu'))return;
  const d=document.createElement('div'); d.id='svrNeu'; d.className='svr-neu';
  d.innerHTML=`<span>${SVI('shield')} Du hast neue Bereiche freigeschaltet bekommen.</span><button class="btn sm" type="button">Jetzt laden</button>`;
  document.body.appendChild(d); d.querySelector('button').onclick=()=>{ try{ appReload(); }catch(e){ location.reload(); } };
}
function svDarf(k){ if(!SVR.loaded)return null; if(SVR.role==='admin')return true; return Object.prototype.hasOwnProperty.call(SVR.darf,k)?SVR.darf[k]:null; }
function svrTeams(){ if(!SVR.loaded)return []; return SVR.mann.filter(m=>m.id!=='h1'&&svDarf('team:'+m.id)); }
function svrTeamsAny(){ return svrTeams().length>0; }
function svrFunk(mid){ const f=SVR.funk.find(x=>x.mannschaft===mid); return f?f.funktion:null; }

/* ---------- App-Prüfungen an den Server angleichen ---------- */
{ const _ct=canTraining; canTraining=function(){ if(SVR.loaded&&SVR.kann&&'training' in SVR.kann)return !!SVR.kann.training; return svRole()==='jugend'?false:_ct.apply(this,arguments); }; }
{ const _cs=canScout; canScout=function(){ if(SVR.loaded&&SVR.kann&&'scout' in SVR.kann)return !!SVR.kann.scout; return svRole()==='jugend'?false:_cs.apply(this,arguments); }; }
{ const _sj=sv4Jugend; sv4Jugend=function(){ if(SVR.loaded&&SVR.kann&&'jugend' in SVR.kann)return !!SVR.kann.jugend; return _sj.apply(this,arguments); }; }
{ const _kx=kxOk; kxOk=function(){ if(SVR.loaded&&SVR.kann&&'kontakte' in SVR.kann)return !!SVR.kann.kontakte; return _kx.apply(this,arguments); }; }
{ const _ta=svTabAllowed; svTabAllowed=function(t){
  if(t==='teams')return svrTeamsAny();
  const r=_ta.apply(this,arguments);
  if(t==='admin'||t==='home')return r;
  if(!SVR.loaded)return svRole()==='jugend'?false:r;
  if(SVR.role==='admin')return r;
  if(t==='ejugend')return !!SVR.kann.jugend;
  const b=SVR_TAB[t]; if(!b)return svRole()==='jugend'?false:r;
  const d=svDarf(b); if(d===null)return r; if(!d)return false;
  if(b.startsWith('mannschaft'))return !!SVR.kann.training;
  if(b.startsWith('kader'))return !!SVR.kann.scout;
  if(['scouting:blick','scouting:bedarf','scouting:radar','scouting:eye','scouting:totw','scouting:ajugend'].includes(b))return !!SVR.kann.scout||r;
  return true;
}; }
function svrSubOk(k){
  const [t,v]=String(k).split(':'); if(!SVR.loaded||SVR.role==='admin')return true;
  const b=t==='training'?(SVR_TRV[v]||'mannschaft'):t==='kabine'?(SVR_KBV[v]||'mannschaft:abstimmungen'):null;
  if(!b)return svTabAllowed(t);
  const d=svDarf(b); return d===null?true:d;
}
{ const _hb=sv4HubBar; sv4HubBar=function(tab){ const r=_hb.apply(this,arguments);
  try{ const bar=document.getElementById('hubbar'); if(bar&&SVR.loaded)bar.querySelectorAll('[data-hub]').forEach(b=>{ if(!svrSubOk(b.dataset.hub))b.remove(); }); }catch(e){}
  return r; }; }
{ const _go=sv4Go; sv4Go=function(k){ if(!svrSubOk(k)){ kToast('Dieser Bereich ist für dich nicht freigeschaltet'); return; } return _go.apply(this,arguments); }; }
{ const _tr=trRender; trRender=function(){
  try{ if(SVR.loaded&&typeof TR!=='undefined'&&!svrSubOk('training:'+(TR.view||'home'))){ const erst=Object.keys(SVR_TRV).find(v=>v!=='home'&&svrSubOk('training:'+v)); if(erst)TR.view=erst; } }catch(e){}
  return _tr.apply(this,arguments); }; }
{ const _kr=typeof kbRender==='function'?kbRender:null; if(_kr)kbRender=function(){
  try{ if(SVR.loaded&&typeof KB!=='undefined'&&!svrSubOk('kabine:'+(KB.view||'abst'))){ if(KB.view!=='kasse'&&svrSubOk('training:players')){ TR.view='players'; return goTab('training'); } } }catch(e){}
  return _kr.apply(this,arguments); }; }

/* ---------- Start, regelmäßig, beim Zurückkehren ---------- */
{ const _si=svInit; svInit=function(){
  const r=_si.apply(this,arguments);
  try{ if(svRole()==='jugend'){ document.body.classList.add('role-jugend'); } svrNachAenderung({kann:SVR.kann,loaded:false}); }catch(e){}
  svrLoad(true);
  setInterval(()=>{ if(document.visibilityState==='visible')svrLoad(true); },300000);
  document.addEventListener('visibilitychange',()=>{ if(document.visibilityState==='visible')svrLoad(false); });
  return r; }; }

/* ---------- Übersicht: eigene Mannschaften als erste Kachel ---------- */
function svrHomeTeams(){
  const home=document.getElementById('panel-home'); if(!home)return; let box=document.getElementById('svrMeine');
  const meine=SVR.loaded?SVR.funk.map(f=>Object.assign({},SVR.mann.find(m=>m.id===f.mannschaft)||{},{funktion:f.funktion})).filter(m=>m.id&&m.id!=='h1'):[];
  if(!meine.length){ if(box)box.remove(); return; }
  if(!box){ box=document.createElement('div'); box.id='svrMeine'; box.className='card svr-meine'; const ck=document.getElementById('svCockpit'); if(ck)ck.after(box); else home.prepend(box); }
  box.innerHTML=`<h3 class="trh">${SVI('users')} Deine Mannschaft${meine.length>1?'en':''}</h3><div class="svr-mgrid">${meine.map(m=>`<button type="button" class="svr-m" data-svrm="${svEsc(m.id)}"><b>${svEsc(m.kurz)}</b><span>${svEsc(m.name)}</span><em>${svEsc(SVR_FUNK[m.funktion]||'')}</em></button>`).join('')}</div>`;
  box.querySelectorAll('[data-svrm]').forEach(b=>b.onclick=()=>{ if(typeof svtOpen==='function')svtOpen(b.dataset.svrm); else goTab('teams'); });
}
{ const _rh=renderHome; renderHome=function(){ const r=_rh.apply(this,arguments); try{ svrHomeTeams(); }catch(e){} return r; }; }
{ const _l=svrApply; svrApply=function(){ const r=_l.apply(this,arguments); try{ if(svCurTab()==='home')svrHomeTeams(); }catch(e){} return r; }; }

/* ---------- Admin: Einladen mit Mannschaft und Funktion ---------- */
{ const _ar=svAdminRender; svAdminRender=async function(){
  const r=await _ar.apply(this,arguments);
  try{ await svrAdminExtras(); }catch(e){ console.warn('Rechte-Verwaltung',e); }
  return r; }; }
async function svrAdminExtras(){
  const P=document.getElementById('panel-admin'); if(!P||!canManage())return;
  if(!SVR.loaded)await svrLoad(true);
  const f=P.querySelector('#svInv');
  if(f&&!f.querySelector('.svr-inv')){
    const rs=f.querySelector('#svInvRole'), d=document.createElement('div'); d.className='svr-inv';
    const mOpts=SVR.mann.filter(m=>m.id!=='h1').map(m=>`<option value="${svEsc(m.id)}">${svEsc(m.name)}</option>`).join('');
    d.innerHTML=`<div><label for="svInvTeam">Mannschaft</label><select id="svInvTeam"><option value="">keine</option>${mOpts}</select></div>
      <div><label for="svInvFunk">Funktion</label><select id="svInvFunk">${Object.entries(SVR_FUNK).map(([k,t])=>`<option value="${k}">${svEsc(t)}</option>`).join('')}</select></div>`;
    rs.closest('div').after(d);
    const sync=()=>{ d.classList.toggle('pflicht',rs.value==='jugend'); };
    rs.addEventListener('change',sync); sync();
    // Absenden: Mannschaft und Funktion mitschicken (die Nutzerverwaltung trägt sie gleich ein)
    const go=f.onsubmit; f.onsubmit=async e=>{
      const team=f.querySelector('#svInvTeam').value, funk=f.querySelector('#svInvFunk').value;
      if(rs.value==='jugend'&&!team){ e.preventDefault(); kToast('Bitte die Mannschaft wählen'); return; }
      SVR._inv=team?{mannschaft:team,funktion:funk}:null; return go.call(f,e);
    };
  }
  // Pro Person: Knopf „Bereiche“ (nur Admin, nicht für Admins selbst)
  if(isAdmin())P.querySelectorAll('.urow[data-u]').forEach(row=>{ const u=(SV_USERS||[]).find(x=>x.id===row.dataset.u); if(!u||u.role==='admin'||row.querySelector('[data-svrb]'))return;
    const b=document.createElement('button'); b.type='button'; b.className='iconbtn'; b.dataset.svrb=u.id; b.title='Bereiche und Mannschaften'; b.innerHTML=SVI('layers');
    const acts=row.querySelector('.acts'); if(acts)acts.prepend(b); b.onclick=()=>svrPerson(u.id); });
  // Mannschaften und Vorgaben
  if(!P.querySelector('#svrTeamsCard')){ const c=document.createElement('div'); c.className='card'; c.id='svrTeamsCard'; const team=[...P.querySelectorAll('.card')][1]; if(team)team.after(c); else P.appendChild(c); }
  await svrTeamsCard();
  if(isAdmin()&&!P.querySelector('#svrVorgCard')){ const c=document.createElement('div'); c.className='card'; c.id='svrVorgCard'; P.querySelector('#svrTeamsCard').after(c); svrVorgCard(); }
}
{ const _adm=SVB.admin; SVB.admin=async function(action,payload){ if(action==='invite'&&SVR._inv){ payload=Object.assign({},payload,SVR._inv); SVR._inv=null; } return _adm.call(this,action,payload); }; }

/* Mannschaften: wer ist wo Trainer, Co-Trainer, Betreuer */
let SVR_MP=null;
async function svrTeamsCard(){
  const c=document.getElementById('svrTeamsCard'); if(!c)return;
  const {data,error}=await SVB.sb.from('mannschaft_personen').select('mannschaft,user_id,funktion'); if(error){ c.innerHTML=`<div class="empty">Mannschaften konnten nicht geladen werden.</div>`; return; }
  SVR_MP=data||[]; const nm=id=>{ const u=(SV_USERS||[]).find(x=>x.id===id); return u?(u.name||u.email):'?'; };
  const teams=SVR.mann.filter(m=>m.id!=='h1');
  c.innerHTML=`<div class="adm-head"><div><h3 style="margin:0">Mannschaften</h3><p class="note" style="margin:6px 0 0">Wer in einer Mannschaft eingetragen ist, sieht deren Bereich. Zwei Haupttrainer sind möglich. Neue Jugendtrainer lädst du oben mit der Rolle „Jugendtrainer“ ein.</p></div></div>
    <div class="svr-teams">${teams.map(m=>{ const L=SVR_MP.filter(x=>x.mannschaft===m.id).sort((a,b)=>Object.keys(SVR_FUNK).indexOf(a.funktion)-Object.keys(SVR_FUNK).indexOf(b.funktion));
      return `<div class="svr-team"><div class="svr-th"><b>${svEsc(m.kurz)}</b><span>${svEsc(m.name)}</span><em>${svEsc(SVR_STUFE[m.stufe]||'')}</em></div>
        <div class="svr-tp">${L.map(x=>`<span class="svr-p"><i>${svEsc(SVR_FUNK[x.funktion])}</i>${svEsc(nm(x.user_id))}<button type="button" data-svrx="${svEsc(m.id)}|${svEsc(x.user_id)}" aria-label="Austragen" title="Austragen">✕</button></span>`).join('')||'<span class="note small">noch niemand</span>'}
        <button type="button" class="svr-add" data-svradd="${svEsc(m.id)}">${SVI('plus')} Person</button></div></div>`; }).join('')}</div>`;
  c.querySelectorAll('[data-svrx]').forEach(b=>b.onclick=async()=>{ const [m,u]=b.dataset.svrx.split('|'); await svrMpSet(u,m,null); });
