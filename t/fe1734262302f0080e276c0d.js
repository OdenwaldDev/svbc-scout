  clearTimeout(_syncT); clearTimeout(_verifyT); _pushTries=0;
  syncState('pending');
  _syncT=setTimeout(syncPush,1500);
}
async function syncPush(){
  try{
    const d=await syncFetch();                       /* ohne gültigen Online-Stand wird NICHT geschrieben */
    if(syncAdoptRemote(d))crmAfterRemote();
    const s=syncSer(); _lastSync=s;
    const fd=new FormData();fd.append('lk','svbc-elf-4471');fd.append('lineup',s);
    await fetch(SYNCU,{method:'POST',mode:'no-cors',body:fd});
    clearTimeout(_verifyT); _verifyT=setTimeout(syncVerify,3500);
  }catch(e){
    _pushTries++; syncState('err');
    clearTimeout(_syncT); _syncT=setTimeout(syncPush,Math.min(120000,15000*_pushTries));
  }
}
function syncMissing(d){ /* fehlt dem Server etwas, das wir haben? */
  const R=(d&&d.crm&&typeof d.crm==='object')?d.crm:{};
  for(const id of Object.keys(CRM)){
    const L=CRM[id], LT=(L&&L._t)||{}, RT=(R[id]&&R[id]._t)||{};
    for(const k of Object.keys(LT)){ if(id===META_ID&&k==='kv')continue; if((+RT[k]||0)<LT[k])return true; }
  }
  return _lineupT>syncTime(d.lt);
}
async function syncVerify(){
  try{
    const d=await syncFetch();
    if(syncAdoptRemote(d))crmAfterRemote();
    if(syncMissing(d)){
      if(_pushTries<3){ _pushTries++; syncState('pending'); clearTimeout(_syncT); _syncT=setTimeout(syncPush,600); }
      else { syncState('err'); clearTimeout(_syncT); _syncT=setTimeout(()=>{_pushTries=0;syncPush();},60000); }
    } else { _pushTries=0; syncState('ok'); }
  }catch(e){ syncState('err'); clearTimeout(_syncT); _syncT=setTimeout(syncPush,20000); }
}
function crmIsTyping(){const ae=document.activeElement;return !!(ae&&/^(INPUT|TEXTAREA|SELECT)$/.test(ae.tagName)&&ae.type!=='checkbox');}
function crmRefreshViews(){
  if(_kvChanged){ _kvChanged=false; try{tkVerified=false;}catch(e){} }
  try{crmApply();}catch(e){}
  if(_lineupAdopted){ _lineupAdopted=false; try{renderLineup();}catch(e){} }
  try{renderKandidaten();}catch(e){} try{renderKaderplan();}catch(e){} try{renderHome();}catch(e){} try{renderMvpCard();}catch(e){}
  outboxSave();
}
function crmAfterRemote(){ if(crmIsTyping()){_pendingRefresh=true;return;} crmRefreshViews(); }
document.addEventListener('focusout',()=>{ if(!_pendingRefresh)return; setTimeout(()=>{ if(_pendingRefresh&&!crmIsTyping()){_pendingRefresh=false;crmRefreshViews();} },350); });
/* App kommt wieder in den Vordergrund (z.B. am Handy): Änderungen der anderen Planer holen */
document.addEventListener('visibilitychange',()=>{
  if(document.visibilityState!=='visible'||!_remoteDone)return;
  syncFetch().then(d=>{ if(syncAdoptRemote(d))crmAfterRemote(); }).catch(()=>{});
});
function lineupRemoteLoad(){
  if(_remoteLoaded)return; _remoteLoaded=true;
  const ob=outboxLoad(); if(ob){ try{crmApply();}catch(e){} } /* letzter Stand vom Gerät (auch offline) */
  syncFetch().then(d=>{
    syncAdoptRemote(d); _lineupAdopted=false;
    crmApply();
    _lastLineupSer=lineupSer(); _lastSync=syncSer(); _remoteDone=true;
    if(ob&&syncMissing(d))_lastSync=''; /* auf dem Gerät liegt Neueres → gleich hochladen */
    outboxSave();
    if(_crmDirty){_crmDirty=false;_lastSync='';lineupSync();}
    renderAll();
  }).catch(()=>{
    /* Online-Stand nicht erreichbar: Bearbeiten ist erlaubt – geschrieben wird erst, wenn ein Abgleich klappt */
    _remoteDone=true; syncState('err');
    if(_crmDirty){_crmDirty=false;lineupSync();}
    if(ob){ try{renderAll();}catch(e){} }
    let tries=0; const retry=()=>{ if(++tries>5)return; setTimeout(()=>syncFetch().then(d=>{ if(syncAdoptRemote(d))crmAfterRemote(); if(SYNC_ST==='err')syncState('idle'); }).catch(retry),15000*tries); }; retry();
  });
}

function xiVal(p){ /* Engine-Wert: Stärke + Trainer-Vertrauen − Disziplin-Risiko */
  let v=scores(p).total*0.75 + Math.min(12,(p.kaderStarts||0)*1.2);
  if(p.risiko&&/diszip/i.test(p.risiko))v-=12; /* nur echte Disziplin-Historie (mehrfach Rot), nicht eine einzelne Gelb-Rote */
  return v;
}
function bestXI(){
  const pool=players.filter(p=>p.own&&p.kader===1&&!p.verzicht&&!(p.status&&/erletzt/.test(p.status))&&((p.kaderStarts||0)>0||p.bankOk));
  let best=null;
  for(const fname in FORMATIONS){
    const form=FORMATIONS[fname];
    const used=new Set(); const slots={}; let sum=0;
    const take=(i,p,bonus)=>{slots[i]=p.id;used.add(p.id);sum+=xiVal(p)+bonus;};
    form.forEach((sl,i)=>{ /* Pass 1: Hauptposition */
      const want=ROLE2POS[sl[0]];
      let bp=null,bv=-1;
      pool.forEach(p=>{if(used.has(p.id)||p.pos!==want)return;const v=xiVal(p);if(v>bv){bv=v;bp=p;}});
      if(bp)take(i,bp,8);
    });
    form.forEach((sl,i)=>{ /* Pass 2: Nebenposition UND (für LM/RM) zentrale Alternativen im direkten Vergleich */
      if(slots[i]!==undefined)return;
      const want=ROLE2POS[sl[0]];
      let bp=null,bv=-1,bb=0;
      pool.forEach(p=>{
        if(used.has(p.id))return;
        let bonus=null;
        if(p.pos2&&p.pos2.includes(want))bonus=3;
        else if((sl[0]==='LM'||sl[0]==='RM')&&(p.pos==='ZM'||p.pos==='OM'||p.pos==='ST'))bonus=-5;
        if(bonus===null)return;
        const v=xiVal(p)+bonus;
        if(v>bv){bv=v;bp=p;bb=bonus;}
      });
      if(bp)take(i,bp,bb);
    });
    if(!best||sum>best.sum)best={sum,formation:fname,slots,label:'Beste Elf (automatisch, '+fname+')'};
  }
  return best;
}
function initLineupSeed(){
  if(DATA.startelfNow&&DATA.startelfNow.slots){
    LINEUP={formation:DATA.startelfNow.formation,slots:{}};
    for(const k in DATA.startelfNow.slots){const id=DATA.startelfNow.slots[k];
      if(players.some(p=>p.id===id))LINEUP.slots[+k]=id;}
    return; /* Cloud-Stand überschreibt das gleich asynchron, falls neuer */
  }
  if(DATA.startelf&&DATA.startelf.slots){
    LINEUP={formation:DATA.startelf.formation,slots:{}};
    for(const k in DATA.startelf.slots){const id=DATA.startelf.slots[k];
      if(players.some(p=>p.id===id))LINEUP.slots[+k]=id;}
    return;
  }
  const form=FORMATIONS[LINEUP.formation];
  const own=players.filter(p=>p.own&&!p.isJugend);
  own.forEach(p=>{
    let bi=-1;
    for(let i=0;i<form.length;i++){ if(!LINEUP.slots[i]&&ROLE2POS[form[i][0]]===p.pos){bi=i;break;} }
    if(bi<0)for(let i=0;i<form.length;i++){ if(!LINEUP.slots[i]&&form[i][0]!=='TW'){bi=i;break;} }
    if(bi>=0)LINEUP.slots[bi]=p.id;
  });
}
function lineupCardHtml(p,role,i){
  const s=scores(p);const ov=Math.round(s.total);const c=tierColor(s.total);const src=p.photo||p.photoUrl;
  return `<div class="fcardm" style="--tc:${c}">${i!=null?`<button class="swapbtn" data-swap="${i}" title="Ersatzspieler anzeigen">⇄</button>`:``}<div class="ov">${ov}</div>`+
    `<div class="pic">${src?`<img src="${src}" alt="" onerror="this.remove()">`:initials(p.name)}</div>`+
    `<div class="nm">${p.name.split(' ').slice(-1)[0]}</div>`+
    (p.pos!=='TW'?`<div class="xg" title="Erwartete Tore über 30 Spiele Kreisliga A: Tore pro Team-Spiel × Liga-Gewicht × 30, reale Einsatzquote eingerechnet">${role} · ≈${s.proj} xT</div>`:`<div class="xg">🧤 ${role}</div>`)+`</div>`;
}
function renderLineup(){
  const pitch=document.getElementById('pitch');if(!pitch)return;
  const form=FORMATIONS[LINEUP.formation];
  // Formationswahl
  document.getElementById('formRow').innerHTML='<span class="lbl">Formation</span>'+
    Object.keys(FORMATIONS).map(f=>`<button class="fpick ${f===LINEUP.formation?'on':''}" data-f="${f}">${f}</button>`).join('');
  document.querySelectorAll('#formRow .fpick').forEach(b=>b.onclick=()=>{
    const nf=b.dataset.f, old=FORMATIONS[LINEUP.formation], nw=FORMATIONS[nf];
    const ns={}; // Spieler nach Rolle möglichst mitnehmen
    const taken=new Set();
    nw.forEach((slot,i)=>{
      for(const oi in LINEUP.slots){ if(taken.has(oi))continue; if(old[oi]&&old[oi][0]===slot[0]){ns[i]=LINEUP.slots[oi];taken.add(oi);break;} }
    });
    let pool=Object.keys(LINEUP.slots).filter(oi=>!taken.has(oi)).map(oi=>LINEUP.slots[oi]);
    nw.forEach((slot,i)=>{ if(ns[i]===undefined&&pool.length){ns[i]=pool.shift();} });
    LINEUP={formation:nf,slots:ns};renderLineup();
  });
  // Elf-Knöpfe (oben)
  {const sr=document.getElementById('seedRow');
   if(sr){
     sr.innerHTML=`<span class="lbl">Elf laden</span>`
       +(DATA.startelfNow?`<button class="rtab" data-seed="now" style="border-color:rgba(77,163,255,.55);color:#4da3ff">📌 Aktuelle Startelf</button>`:``)
       +(DATA.startelf?`<button class="rtab" data-seed="stamm">⭐ Stammelf 25/26</button>`:``)
       +`<button class="rtab" data-seed="best" style="border-color:rgba(179,157,247,.5);color:#b39df7">🏆 Beste Elf (auto)</button>`;
     sr.querySelectorAll('[data-seed]').forEach(b=>b.onclick=()=>{
       const dd=b.dataset.seed==='stamm'?DATA.startelf:(b.dataset.seed==='best'?bestXI():DATA.startelfNow); if(!dd)return;
       LINEUP={formation:dd.formation,slots:{}};
       for(const k in dd.slots){ if(players.some(p=>p.id===dd.slots[k]))LINEUP.slots[+k]=dd.slots[k]; }
       renderLineup();
     });
   }}
  // Pitch
  let html='<div class="pl mid"></div><div class="pl circ"></div><div class="pl boxT"></div><div class="pl boxB"></div>';
  form.forEach((slot,i)=>{
    const [role,x,y]=slot;const pid=LINEUP.slots[i];const p=pid&&players.find(z=>z.id===pid);
    html+=`<div class="slot ${p?'':'vac'}" data-slot="${i}" style="left:${x}%;top:${y}%;z-index:${Math.round(y)}">`+
      (p?lineupCardHtml(p,role,i):`<div class="vcard">＋<span>${role}</span></div>`)+`</div>`;
  });
  pitch.innerHTML=html;
  // Ersatzbank: alle eigenen Spieler, die nicht aufgestellt sind
  {const benchEl=document.getElementById('bench');
   if(benchEl){
     const inXI=new Set(Object.values(LINEUP.slots));
     const bench=players.filter(p=>p.own&&p.kader===1&&!p.verzicht&&!(p.status&&/erletzt/.test(p.status))&&((p.kaderStarts||0)>0||p.bankOk)&&!inXI.has(p.id)).sort((a,b)=>(b.kaderStarts||0)-(a.kaderStarts||0)||scores(b).total-scores(a).total);
     benchEl.innerHTML=`<div class="lbl" style="display:block;margin:12px 2px 2px">🪑 Ersatzbank 25/26 (${bench.length}), nur Spieler mit dokumentiertem Einsatz in der Ersten, sortiert nach Startelf-Häufigkeit. Aufs Feld ziehen = einwechseln · Feldspieler hierher ziehen = auswechseln · antippen = Profil.</div>
       <div class="benchrow">${bench.map(p=>`<div class="bcard" data-bpid="${p.id}">${lineupCardHtml(p,p.pos||'–')}<div class="btag" title="${p.kaderStarts||0}× Startelf 25/26 (dokumentiert)">${p.kaderStarts||0}×</div></div>`).join('')}</div>`;
   }}
  // Statistik / Lücken
  const filled=form.filter((_,i)=>LINEUP.slots[i]).length;
  const gaps=form.filter((_,i)=>!LINEUP.slots[i]).map(s=>s[0]);
  const gapCount={};gaps.forEach(g=>gapCount[ROLE2POS[g]]=(gapCount[ROLE2POS[g]]||0)+1);
  document.getElementById('gapRow').innerHTML=`<span class="lbl">${filled}/11 besetzt</span>`+
    (gaps.length?Object.entries(gapCount).map(([p,n])=>`<span class="gapchip" style="cursor:pointer" onclick="document.getElementById('needs').scrollIntoView({behavior:'smooth'})">Lücke: ${n}× ${p} ›</span>`).join(''):'<span class="gapchip" style="border-color:rgba(47,210,122,.4);background:rgba(47,210,122,.1);color:#5fe09b">Elf komplett ✓</span>');
  // Team-OVR
  const ids=form.map((_,i)=>LINEUP.slots[i]).filter(Boolean);
  const ovrs=ids.map(id=>scores(players.find(z=>z.id===id)).total);
  const teamOvr=ovrs.length?Math.round(ovrs.reduce((a,b)=>a+b,0)/ovrs.length):0;
  const lines=(function(){
    const zone=(y)=>y>=66?'def':y>=40?'mid':'att';
    const acc={def:[],mid:[],att:[]};
    form.forEach((s,i)=>{if(s[0]==='TW')return;const id=LINEUP.slots[i];if(id)acc[zone(s[2])].push(scores(players.find(z=>z.id===id)).total);});
    const avg=a=>a.length?Math.round(a.reduce((x,y)=>x+y,0)/a.length):'–';
    return `Abwehr ${avg(acc.def)} · Mittelfeld ${avg(acc.mid)} · Angriff ${avg(acc.att)}`;
  })();
  document.getElementById('lineupStats').innerHTML=`
    <div class="tiles" style="margin-top:14px">
      <div class="tile"><div class="v">${teamOvr}</div><div class="l">Team-OVR (Ø MScore)</div></div>
      <div class="tile"><div class="v">${filled}/11</div><div class="l">Positionen besetzt</div></div>
      <div class="tile" style="flex:2 1 260px"><div class="v" style="font-size:16px">${lines}</div><div class="l">Mannschaftsteile (Ø MScore)</div></div>
    </div>`;
  wireSlots();
  renderShadow();
  renderNeeds();
  lineupSync();
  lineupRemoteLoad();
}
function shadowAutoFill(){
  const form=FORMATIONS[LINEUP.formation];
  const inXI=new Set(Object.values(LINEUP.slots));
  const usedB=new Set(), usedZ=new Set();
  for(const k in SHADOW){ if(SHADOW[k].b)usedB.add(SHADOW[k].b); if(SHADOW[k].z)usedZ.add(SHADOW[k].z); }
  form.forEach((sl,i)=>{
    const want=ROLE2POS[sl[0]];
    SHADOW[i]=SHADOW[i]||{};
    if(!SHADOW[i].b){
      let bp=null,bv=-1;
      players.forEach(p=>{
        if(!p.own||p.verzicht||inXI.has(p.id)||usedB.has(p.id))return;
        if(p.status&&/erletzt/.test(p.status))return;
        const F=posFit(p,want); if(!F||F.lvl<1)return;
        const v=scores(p).total+F.lvl*4; if(v>bv){bv=v;bp=p;}
      });
      if(bp){SHADOW[i].b=bp.id;usedB.add(bp.id);}
    }
    if(!SHADOW[i].z){
      let bp=null,bv=-1;
      players.forEach(p=>{
        if(p.own||usedZ.has(p.id)||crmHidden(p))return;
        const F=posFit(p,want); if(!F||F.lvl<1)return;
        const W=wscore(p); if(!W)return;
        const v=W.k+F.lvl*4; if(v>bv){bv=v;bp=p;}
      });
      if(bp){SHADOW[i].z=bp.id;usedZ.add(bp.id);}
    }
  });
  renderLineup();
}
const SXI_L=['S','B','Z'];
const SXI_COL={S:'#4da3ff',B:'#5fe09b',Z:'#ffb347'};
function sxiStack(i){return [LINEUP.slots[i]||null,(SHADOW[i]||{}).b||null,(SHADOW[i]||{}).z||null];}
function renderShadowXI(){
  const pitch=document.getElementById('spitch'); if(!pitch)return;
  const form=FORMATIONS[LINEUP.formation];
  let html='<div class="pl mid"></div><div class="pl circ"></div><div class="pl boxT"></div><div class="pl boxB"></div>';
  form.forEach((sl,i)=>{
    const [role,x,y]=sl;
    const st=sxiStack(i);
    const li=(((SHADOW[i]||{}).r)||0)%3;
    const pid=st[li];
    const p=pid&&players.find(z2=>z2.id===pid);
    const nexts=[1,2].map(k=>{const idx=(li+k)%3;const pp=st[idx]&&players.find(z2=>z2.id===st[idx]);
      return `<b style="color:${SXI_COL[SXI_L[idx]]}">${SXI_L[idx]}</b> ${pp?pp.name.split(' ').slice(-1)[0]:'–'}`;}).join(' · ');
    let card;
    if(p){
      const s=scores(p);const W=p.own?null:wscore(p);const v=W?W.k:s.total;const c=tierColor(v);const src=p.photo||p.photoUrl;
      card=`<div class="fcardm" style="--tc:${c}" data-sxigo="${p.id}">
        <button class="swapbtn" data-sxirot="${i}" title="Ebene durchrotieren">↻</button>
        <div class="ov">${Math.round(v)}</div>
        <div class="pic">${src?`<img src="${src}" alt="" onerror="this.remove()">`:initials(p.name)}</div>
        <div class="nm">${p.name.split(' ').slice(-1)[0]}</div>
        <div class="xg"><b style="color:${SXI_COL[SXI_L[li]]}">${SXI_L[li]}</b> · ${role}${p.own?'':' · extern'}</div></div>`;
    } else {
      card=`<div class="vcard" data-sxiedit="${i}:${li}" style="position:relative">＋<span>${SXI_L[li]} · ${role}</span><button class="swapbtn" data-sxirot="${i}" title="Ebene durchrotieren">↻</button></div>`;
    }
    html+=`<div class="slot ${p?'':'vac'}" style="left:${x}%;top:${y}%;z-index:${Math.round(y)}">${card}<div class="sxinext">${nexts}</div></div>`;
  });
  pitch.innerHTML=html;
  // Ebenen-Schnellwahl + Statistik
  const seed=document.getElementById('sxiSeed');
  if(seed){
    seed.innerHTML=`<span class="lbl">Ebene</span>
      <button class="rtab" data-sxiall="0" style="border-color:rgba(77,163,255,.5);color:#4da3ff">S · Startelf</button>
      <button class="rtab" data-sxiall="1" style="border-color:rgba(47,210,122,.4);color:#5fe09b">B · Backup-Elf</button>
      <button class="rtab" data-sxiall="2" style="border-color:rgba(255,179,71,.5);color:#ffb347">Z · Ziel-Elf</button>
      <button class="rtab" data-sxifill="1">⚡ Auto-Vervollständigen</button>`;
    seed.querySelectorAll('[data-sxiall]').forEach(b=>b.onclick=()=>{
      const r=+b.dataset.sxiall;
      FORMATIONS[LINEUP.formation].forEach((_,i)=>{SHADOW[i]=SHADOW[i]||{};SHADOW[i].r=r;});
      renderLineup();});
    const f=seed.querySelector('[data-sxifill]'); if(f)f.onclick=shadowAutoFill;
  }
  const stats=document.getElementById('sxiStats');
  if(stats){
    const avg=(li)=>{const vs=form.map((_,i)=>{const pid=sxiStack(i)[li];const p=pid&&players.find(z2=>z2.id===pid);if(!p)return null;const W=p.own?null:wscore(p);return W?W.k:scores(p).total;}).filter(v=>v!=null);
      return vs.length?Math.round(vs.reduce((a,b)=>a+b,0)/vs.length)+' <i style="font-size:11px;color:var(--ink3)">('+vs.length+'/11)</i>':'–';};
    stats.innerHTML=`<div class="tiles" style="margin-top:14px">
      <div class="tile"><div class="v" style="color:#4da3ff">${avg(0)}</div><div class="l">Ø Startelf</div></div>
      <div class="tile"><div class="v" style="color:#5fe09b">${avg(1)}</div><div class="l">Ø Backup-Elf</div></div>
      <div class="tile"><div class="v" style="color:#ffb347">${avg(2)}</div><div class="l">Ø Ziel-Elf (Transfer-Chance)</div></div>
    </div>`;
  }
  pitch.querySelectorAll('[data-sxirot]').forEach(b=>b.onclick=(e)=>{e.stopPropagation();
    const i=+b.dataset.sxirot;SHADOW[i]=SHADOW[i]||{};SHADOW[i].r=(((SHADOW[i].r)||0)+1)%3;renderLineup();});
  pitch.querySelectorAll('[data-sxigo]').forEach(c=>c.onclick=()=>startPlayer(c.dataset.sxigo));
  pitch.querySelectorAll('[data-sxiedit]').forEach(c=>c.onclick=(e)=>{if(e.target.closest('.swapbtn'))return;
    const [i,li]=c.dataset.sxiedit.split(':').map(Number);
    if(li===0)openSlotPicker(i); else openSlotPicker(i, li===1?'b':'z');});
}
function renderShadow(){
  const el=document.getElementById('shadow'); if(!el)return;
  const form=FORMATIONS[LINEUP.formation];
  const cell=(pid,i,depth)=>{
    if(!pid)return `<div class="shcell empty" data-shadow="${i}:${depth}">＋ planen</div>`;
    const p=players.find(x=>x.id===pid);
    if(!p)return `<div class="shcell empty" data-shadow="${i}:${depth}">＋ planen</div>`;
    const s=scores(p);const W=p.own?null:wscore(p);
    return `<div class="shcell" data-shadow="${i}:${depth}" title="Antippen: ändern">
      <span class="sc" style="color:${tierColor(W?W.k:s.total)}">${Math.round(W?W.k:s.total)}</span>
      <span style="min-width:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap">${p.name.split(' ').slice(-1)[0]}<br><i>${p.own?'eigen':p.club}</i></span></div>`;
  };
  el.innerHTML=`<div class="card needcard"><h3>👥 Schattenmannschaft <i style="color:var(--ink2);font-weight:600;font-size:12px">Kaderplanung: pro Position: Startelf · Backup · Transferziel</i></h3>
    <div style="display:flex;gap:8px;margin:8px 0 4px"><button class="rtab" id="shFill">⚡ Auto-Vervollständigen</button><button class="rtab" id="shClear">✕ Planung leeren</button></div>
    <div class="shrow" style="border-bottom:1px solid var(--line)"><span class="shhead">Pos</span><span class="shhead">Startelf</span><span class="shhead">Backup (Kader)</span><span class="shhead">🎯 Ziel (extern)</span></div>
    ${form.map((sl,i)=>{
      const st=LINEUP.slots[i];const sh=SHADOW[i]||{};
      const stp=st?players.find(x=>x.id===st):null;
      return `<div class="shrow"><span class="shrole">${sl[0]}</span>
        ${stp?`<div class="shcell" data-goid="${stp.id}"><span class="sc" style="color:${tierColor(scores(stp).total)}">${Math.round(scores(stp).total)}</span><span style="min-width:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap">${stp.name.split(' ').slice(-1)[0]}</span></div>`:`<div class="shcell empty">— vakant —</div>`}
        ${cell(sh.b,i,'b')}${cell(sh.z,i,'z')}</div>`;
    }).join('')}
    <p class="note">Backup = bester verfügbarer eigener Spieler der Position · Ziel = externes Wunschziel (Zahl = Transfer-Chance). Zellen antippen zum Ändern, Startelf-Zelle → Profil. Wird wie die Aufstellung <b>geräteübergreifend gespeichert</b>.</p></div>`;
  el.querySelectorAll('[data-shadow]').forEach(c=>c.onclick=()=>{const [i,dep]=c.dataset.shadow.split(':');openSlotPicker(+i,dep);});
  el.querySelectorAll('[data-goid]').forEach(c=>c.onclick=()=>startPlayer(c.dataset.goid));
  const f=document.getElementById('shFill'); if(f)f.onclick=shadowAutoFill;
  const cl=document.getElementById('shClear'); if(cl)cl.onclick=()=>{SHADOW={};renderLineup();};
  renderShadowXI();
}
function renderNeeds(){
  const el=document.getElementById('needs'); if(!el)return;
  const form=FORMATIONS[LINEUP.formation];
  const inXI=new Set(Object.values(LINEUP.slots));
  const byScore=(a,b)=>scores(b).total-scores(a).total;
  const ext=players.filter(p=>!p.own&&!inXI.has(p.id));
  const OFF=new Set(['ST','OM','Flügel']);
  // vakante Rollen gruppieren
  const vac={};
  form.forEach((s,i)=>{ if(LINEUP.slots[i]===undefined){const w=ROLE2POS[s[0]];
    if(!vac[w])vac[w]={n:0,slot:i,roles:new Set()};
    vac[w].n++; vac[w].roles.add(s[0]); }});
  const byK=(a,b)=>{const x=wscore(a),y=wscore(b);return (y?y.k:scores(b).total)-(x?x.k:scores(a).total);};
  const row=(p,slot,tag,tagCol)=>{const s=scores(p);const W=wscore(p);const c=tierColor(W?W.k:s.total);const src=p.photo||p.photoUrl;
    return `<div class="rankrow" data-goid="${p.id}">
      <span class="rk" style="color:${c}" title="${W?`Transfer-Chance`:`MScore`}">${Math.round(W?W.k:s.total)}</span>
      <div class="ava l-${p.liga}" style="width:30px;height:30px;font-size:11px;border-radius:9px">${src?`<img src="${src}" onerror="this.remove()">`:initials(p.name)}</div>
      <span class="rn">${p.name}${p.risiko?` <span title="${p.risiko}">⚠</span>`:''} <b style="color:${tagCol||'#5fe09b'};font-size:11px">${tag}</b><br><i>${p.club} · ${p.km!=null?p.km+' km':'km –'} · ${p.alter?(p.alterCa?'ca. ':'')+p.alter+' J.':'Alter –'} · <b style="color:var(--ink)">≈${s.proj} xT</b> · ${p.tore} Tore 25/26</i>${W?`<br><i style="color:#8fa3c7;font-size:11px">🕵️ Stärke ${Math.round(s.total)} · Wechsel ${W.w} · ${wreason(W,2)}</i>`:``}</span>
      ${slot!=null?`<button class="fillbtn" data-fill="${slot}:${p.id}" title="Direkt aufstellen">＋</button>`:'<span></span>'}</div>`;};
  let html='';
  // Kader-Bedarfsanalyse-Überblick
  const xiP=form.map((_,i)=>LINEUP.slots[i]).filter(Boolean).map(id=>players.find(z=>z.id===id)).filter(Boolean);
  const ages=xiP.filter(p=>p.alter).map(p=>p.alter);
  const oldies=xiP.filter(p=>p.alter&&p.alter>=32);
  const vacChips=Object.entries(vac).map(([w,v])=>`<span class="needchip" style="border-color:rgba(255,214,10,.4);color:#ffe064">${v.n}× ${w} offen</span>`).join('');
  html+=`<div class="card needcard"><h3>📋 Kader-Bedarfsanalyse</h3>
    <div style="margin-top:6px">${vacChips||'<span class="needchip" style="border-color:rgba(47,210,122,.4);color:#5fe09b">Alle 11 Positionen besetzt ✓</span>'}
    ${ages.length?`<span class="needchip">Ø Alter der Elf: ${(ages.reduce((a,b)=>a+b,0)/ages.length).toFixed(1)} J. (${ages.length}/${xiP.length} bekannt)</span>`:''}
    ${oldies.length?`<span class="needchip" style="border-color:rgba(255,107,107,.4);color:#ff8a8a">Nachfolge planen: ${oldies.map(p=>p.name.split(' ').slice(-1)[0]+' ('+(p.alterCa?'ca. ':'')+p.alter+')').join(', ')}</span>`:''}</div>
    <p class="note">☁️ Die Aufstellung wird automatisch <b>geräteübergreifend gespeichert</b> · die zuletzt gesetzte Elf erscheint auf jedem Gerät.</p>
    ${DATA.startelf?`<p class="note">Stammelf-Referenz: <b>${DATA.startelf.label}</b> · <a href="${DATA.startelf.quelle}" target="_blank" rel="noopener" style="color:var(--accent)">Quelle: Vereinsheft ↗</a>. Per Antippen/Ziehen frei änderbar.</p>`:``}<p class="note">Basis: öffentliche Torjägerlisten &amp; fussball.de-Profile. Torhüter/Verteidiger tauchen dort kaum auf. Für Defensiv-Positionen ersetzt kein Datensatz die Sichtung vor Ort.</p></div>`;
  {const pool=ext.filter(p=>{const W=wscore(p);return W&&W.w>=55;}).sort(byK).slice(0,6);
   if(pool.length){
     html+=`<div class="card needcard"><h3>🕵️ Digital-Scout: die realistischsten Verstärkungen</h3>
       <div style="margin-top:6px">${pool.map(p=>row(p,null,p.pos||'Pos. –','#8fd0ff')).join('')}</div>
       <p class="note"><b>Transfer-Chance</b> = 55 % Stärke (MScore) + 45 % <b>Wechsel-Index</b>. Der Wechsel-Index schätzt aus öffentlichen Signalen (Zweitvertretung, Spielzeit, Liga-Differenz, Entfernung, Tabellenlage, Torjäger-Status, Verletzung), wie realistisch ein Wechsel zum SV/BSC ist, ein Superstürmer, der höherklassig oben mitspielt, landet bewusst weit unten. Komplette Begründung im Spielerprofil.</p></div>`;
   }}
  const entries=Object.entries(vac);
  if(entries.length){
    html+=entries.map(([want,v])=>{
      const match=ext.filter(p=>p.pos===want).sort(byK).slice(0,4);
      let extra=[];
      if(OFF.has(want)&&match.length<4){
        extra=ext.filter(p=>p.pos!==want&&(p.pos==='ST'||!p.pos)).sort(byK).slice(0,4-match.length);
      }
      const rows=match.map(p=>row(p,v.slot,'✓ '+want)).concat(
        extra.map(p=>row(p,v.slot,p.isJugend?'Jugend-Torjäger':(p.pos?'geführt als '+p.pos:'Pos. nicht erfasst'),'#ffd60a')));
      const empty=!rows.length?`<p class="note">Für <b>${want}</b> ist in den öffentlichen Torjägerlisten kein Spieler mit Positionsangabe erfasst, hier hilft nur klassische Sichtung. Über die Position auf dem Feld (＋) kannst du trotzdem jeden Spieler manuell einplanen.</p>`:'';
      return `<div class="card needcard"><h3>🎯 Transfer-Vorschläge: ${v.n}× ${[...v.roles].join(' / ')} <i>(${want})</i></h3>
        <div style="margin-top:6px">${rows.join('')}</div>${empty}
        ${rows.length?'<p class="note">Beste verfügbare Spieler nach MScore (ohne eigene &amp; bereits aufgestellte). Zeile → Profil · ＋ → direkt aufstellen.</p>':''}</div>`;
    }).join('');
  } else {
    const ups=[];
    form.forEach((s,i)=>{const pid=LINEUP.slots[i];if(!pid)return;const cur=players.find(z=>z.id===pid);if(!cur)return;
      const want=ROLE2POS[s[0]];
      const best=ext.filter(p=>p.pos===want).sort(byScore)[0];
      if(best&&scores(best).total-scores(cur).total>=8)ups.push({i,role:s[0],cur,best,diff:scores(best).total-scores(cur).total});});
    ups.sort((a,b)=>b.diff-a.diff);
    html+= ups.length?`<div class="card needcard"><h3>📈 Upgrade-Potenzial <i>(Elf ist komplett)</i></h3>
        <div style="margin-top:6px">${ups.slice(0,5).map(u=>row(u.best,u.i,`＋${u.diff.toFixed(0)} MScore vs. ${u.cur.name.split(' ').slice(-1)[0]} (${u.role})`,'#b39df7')).join('')}</div>
        <p class="note">Erfasste externe Spieler, die auf ihrer Position deutlich stärker bewertet sind als der aktuelle Elf-Spieler. ＋ ersetzt ihn in der Aufstellung.</p></div>`
      :`<div class="card needcard"><h3>✓ Kader-Check</h3><p class="note">Elf komplett: aktuell ist kein erfasster externer Spieler auf seiner Position deutlich stärker bewertet als deine Aufstellung.</p></div>`;
  }
  if(DATA.elfSaison&&DATA.elfSaison.names&&DATA.elfSaison.names.length){
    html+=`<div class="card needcard"><h3>🏆 ${DATA.elfSaison.label||'Elf der Saison'}</h3>
      <div style="margin-top:6px">${DATA.elfSaison.names.map(n=>{
        const p=players.find(x=>nrm(x.name)===nrm(n));
        if(!p)return `<span class="needchip">${n}</span>`;
        const mine=p.own?` style="border-color:rgba(77,163,255,.55);color:#4da3ff"`:``;
        return `<span class="needchip" data-goid="${p.id}"${mine} title="Profil öffnen">${n} · ${Math.round(scores(p).total)}</span>`;
      }).join('')}</div>
      <p class="note">Blau = eigener Spieler. Chip antippen → Profil (falls im Datenpool). ${DATA.elfSaison.quelle?`Quelle: <a href="${DATA.elfSaison.quelle}" target="_blank" rel="noopener">${DATA.elfSaison.quelleName||'FuPa'} ↗</a>`:''}</p></div>`;
  }
  el.innerHTML=html;
  el.querySelectorAll('[data-goid]').forEach(r=>{r.style.cursor='pointer';r.onclick=()=>startPlayer(r.dataset.goid);});
  el.querySelectorAll('[data-fill]').forEach(b=>b.onclick=(e)=>{e.stopPropagation();
    const [si,pid]=b.dataset.fill.split(':');LINEUP.slots[+si]=pid;renderLineup();
    const n=document.getElementById('pitch');if(n)n.scrollIntoView({behavior:'smooth',block:'center'});});
  el.querySelectorAll('[data-seed]').forEach(b=>b.onclick=()=>{
    const d=b.dataset.seed==='stamm'?DATA.startelf:(b.dataset.seed==='best'?bestXI():(b.dataset.seed==='now'?DATA.startelfNow:DATA.startelfLast)); if(!d)return;
    LINEUP={formation:d.formation,slots:{}};
    for(const k in d.slots){ if(players.some(p=>p.id===d.slots[k]))LINEUP.slots[+k]=d.slots[k]; }
    renderLineup();
    const n=document.getElementById('pitch');if(n)n.scrollIntoView({behavior:'smooth',block:'center'});});
}
let dragState=null;
let autoScrollDir=0, autoScrollRAF=null;
function dragAutoScroll(e){
  const m=90;
  autoScrollDir = e.clientY<m ? -1 : (e.clientY>window.innerHeight-m ? 1 : 0);
  if(autoScrollDir&&!autoScrollRAF){
    const step=()=>{
      if(!autoScrollDir||!dragState){autoScrollRAF=null;return;}
      /* App scrollt im <body> (overflow:auto), nicht im window */
      document.body.scrollTop+=autoScrollDir*16;
      window.scrollBy(0,autoScrollDir*16);
      autoScrollRAF=requestAnimationFrame(step);
    };
    autoScrollRAF=requestAnimationFrame(step);
  }
}
function slotAtPoint(x,y){
  const el=document.elementFromPoint(x,y);
  const direct=el&&el.closest('.slot'); if(direct)return direct;
  let best=null,bd=95*95;
  document.querySelectorAll('#pitch .slot').forEach(sl=>{
    const r=sl.getBoundingClientRect();
    const dx=r.x+r.width/2-x, dy=r.y+r.height/2-y, d=dx*dx+dy*dy;
    if(d<bd){bd=d;best=sl;}
  });
  return best;
}
function dragCleanup(){
  autoScrollDir=0;
  document.querySelectorAll('.slot.droptgt').forEach(x=>x.classList.remove('droptgt'));
  if(dragState&&dragState.ghost)dragState.ghost.remove();
  if(dragState&&dragState.el)dragState.el.classList.remove('drag');
  dragState=null;
}
function wireSlots(){
  document.querySelectorAll('#pitch .slot').forEach(sl=>{
    sl.onpointerdown=(e)=>{
      if(e.target.closest('.swapbtn'))return;
      const i=+sl.dataset.slot;const pid=LINEUP.slots[i];
      dragState={i,pid,x0:e.clientX,y0:e.clientY,moved:false,ghost:null,el:sl};
      try{sl.setPointerCapture&&sl.setPointerCapture(e.pointerId);}catch(_e){}
    };
    sl.onpointermove=(e)=>{
      if(!dragState||dragState.el!==sl)return;
      const dx=e.clientX-dragState.x0,dy=e.clientY-dragState.y0;
      if(!dragState.moved&&Math.hypot(dx,dy)>8&&dragState.pid){
        dragState.moved=true;sl.classList.add('drag');
        const g=document.createElement('div');g.className='ghost';
        g.innerHTML=sl.innerHTML;document.body.appendChild(g);dragState.ghost=g;
      }
      if(dragState.moved&&dragState.ghost){dragState.ghost.style.left=e.clientX+'px';dragState.ghost.style.top=e.clientY+'px';dragAutoScroll(e);
        document.querySelectorAll('.slot.droptgt').forEach(x=>x.classList.remove('droptgt'));
        const t=slotAtPoint(e.clientX,e.clientY); if(t&&+t.dataset.slot!==dragState.i)t.classList.add('droptgt');}
    };
    sl.onpointercancel=()=>{if(dragState&&dragState.el===sl)dragCleanup();};
    sl.onpointerup=(e)=>{
      if(!dragState||dragState.el!==sl)return;
      const i=dragState.i;
      if(dragState.moved){
        sl.classList.remove('drag');
        if(dragState.ghost)dragState.ghost.remove();
        const tgt=document.elementFromPoint(e.clientX,e.clientY);
        const overBench=tgt&&tgt.closest('#bench');
        const tslot=overBench?null:slotAtPoint(e.clientX,e.clientY);
        if(tslot&&+tslot.dataset.slot!==i){const j=+tslot.dataset.slot;const a=LINEUP.slots[i],b=LINEUP.slots[j];
          if(b)LINEUP.slots[i]=b;else delete LINEUP.slots[i];
          if(a)LINEUP.slots[j]=a;else delete LINEUP.slots[j];}
        else if(overBench){delete LINEUP.slots[i];}
        autoScrollDir=0;
        document.querySelectorAll('.slot.droptgt').forEach(x=>x.classList.remove('droptgt'));
        renderLineup();
      } else if(!e.target.closest('.swapbtn')) {
        const pid2=LINEUP.slots[i];
        if(pid2)startPlayer(pid2); else openSlotPicker(i);
      }
      dragState=null;
    };
  });
  document.querySelectorAll('#pitch .swapbtn').forEach(b=>{
    b.onpointerdown=e=>{e.stopPropagation();};
    b.onclick=e=>{e.stopPropagation();openSlotPicker(+b.dataset.swap);};
  });
  document.querySelectorAll('#bench [data-bpid]').forEach(bc=>{
    bc.onpointerdown=(e)=>{
      dragState={bench:true,pid:bc.dataset.bpid,x0:e.clientX,y0:e.clientY,moved:false,ghost:null,el:bc};
      try{bc.setPointerCapture&&bc.setPointerCapture(e.pointerId);}catch(_e){}
    };
    bc.onpointermove=(e)=>{
      if(!dragState||dragState.el!==bc)return;
      const dx=e.clientX-dragState.x0,dy=e.clientY-dragState.y0;
      if(!dragState.moved&&Math.hypot(dx,dy)>8){
        dragState.moved=true;bc.classList.add('drag');
        const g=document.createElement('div');g.className='ghost';
        g.innerHTML=bc.innerHTML;document.body.appendChild(g);dragState.ghost=g;
      }
      if(dragState.moved&&dragState.ghost){dragState.ghost.style.left=e.clientX+'px';dragState.ghost.style.top=e.clientY+'px';dragAutoScroll(e);
        document.querySelectorAll('.slot.droptgt').forEach(x=>x.classList.remove('droptgt'));
        const t=slotAtPoint(e.clientX,e.clientY); if(t)t.classList.add('droptgt');}
    };
    bc.onpointercancel=()=>{if(dragState&&dragState.el===bc)dragCleanup();};
    bc.onpointerup=(e)=>{
      if(!dragState||dragState.el!==bc)return;
      if(dragState.moved){
        bc.classList.remove('drag');
        if(dragState.ghost)dragState.ghost.remove();
        const tslot=slotAtPoint(e.clientX,e.clientY);
        autoScrollDir=0;
        document.querySelectorAll('.slot.droptgt').forEach(x=>x.classList.remove('droptgt'));
        if(tslot){LINEUP.slots[+tslot.dataset.slot]=dragState.pid;renderLineup();}
      } else { startPlayer(dragState.pid); }
      dragState=null;
    };
  });
}
function openSlotPicker(i,depth){
  const role=FORMATIONS[LINEUP.formation][i][0];const want=ROLE2POS[role];
  const pid=depth?((SHADOW[i]||{})[depth]):LINEUP.slots[i];
  const rank=(p)=>{const W=wscore(p);const base=W?W.k:scores(p).total;
    const F=posFit(p,want);let m=F?F.lvl*400:-500;
    if(depth==='z'){ if(!p.own)m+=3000; } else { if(p.own)m+=3000; }
    if(p.isJugend)m-=100;
    return base+m;};
  let q='';
  const draw=()=>{
    let arr=players.filter(p=>!(q&&!(p.name+' '+p.club).toLowerCase().includes(q)));
    arr=arr.filter(p=>!Object.values(LINEUP.slots).includes(p.id)||p.id===pid);
    arr=arr.filter(p=>!p.verzicht);
    if(!q)arr=arr.filter(p=>posFit(p,want)&&(p.own||!crmHidden(p))); /* ohne Suche: nur realistisch passende, nicht ausgeblendete Spieler */
    arr.sort((a,b)=>rank(b)-rank(a));
    document.getElementById('modal').innerHTML=`<button class="close" id="mclose">✕</button>
      <h2 style="font-size:19px">${depth?`${depth===`b`?`👥 Backup`:`🎯 Transferziel`} für ${role} planen`:(pid?`Ersatz für ${(players.find(z=>z.id===pid)||{name:role}).name}`:`Position ${role} besetzen`)}</h2>
      <div class="msub">Nur Spieler, die <b>${want}</b> realistisch spielen können: ✓ Hauptposition · ◐ dokumentierte Nebenposition · ~ ähnliche Position (Kreisliga-Polyvalenz: LV↔LM, ST↔Flügel …). Eigene zuerst (MScore), dann Externe nach 🕵️ Transfer-Chance. Die Suche findet weiterhin jeden Spieler.</div>
      <input type="search" class="search" id="pkq" placeholder="Spieler oder Verein suchen …" style="margin:12px 0" value="${q}">
      ${pid?`<button class="fpick" id="clr" style="margin-bottom:8px">✕ ${depth?`Planung entfernen`:`Position frei machen`}</button>`:''}
      <div style="max-height:52vh;overflow:auto">
        ${arr.slice(0,80).map(p=>{const s=scores(p);const W=wscore(p);const src=p.photo||p.photoUrl;const F=posFit(p,want);
          return `<div class="rankrow" data-pk="${p.id}">
            <span class="rk" style="color:${tierColor(W?W.k:s.total)}" title="${W?`Transfer-Chance (55% Stärke + 45% Wechsel-Index)`:`MScore`}">${Math.round(W?W.k:s.total)}</span>
            <div class="ava l-${p.liga}" style="width:30px;height:30px;font-size:11px;border-radius:9px">${src?`<img src="${src}" onerror="this.remove()">`:initials(p.name)}</div>
            <span class="rn">${p.own?'<b style="color:#4da3ff">●</b> ':''}${p.name} ${F?`<b style="color:${F.col}">${F.tag}</b>`:'<i style="color:var(--ink3)">'+(p.pos||'–')+'</i>'}<br><i>${p.club}${W?` · Stärke ${Math.round(s.total)} · Wechsel ${W.w}`:``}</i></span>
            <span class="rv">≈${s.proj} <i style="font-style:normal;font-size:11px">xT</i><br><i style="font-size:11px;color:var(--ink3);font-style:normal">${p.tore} Tore 25/26</i></span></div>`;}).join('')}
      </div>
      <p class="note">● = eigener Spieler. Unpassende Positionen (z.B. IV für einen Sturmplatz) sind bewusst ausgeblendet, über die Suche erreichbar, falls du es doch wissen willst.</p>`;
    document.getElementById('overlay').classList.add('open');
    document.getElementById('mclose').onclick=closeOverlay;
    const inp=document.getElementById('pkq');inp.oninput=e=>{q=e.target.value.toLowerCase();const c=inp.selectionStart;draw();const n=document.getElementById('pkq');n.focus();n.setSelectionRange(c,c);};
    const clr=document.getElementById('clr');if(clr)clr.onclick=()=>{if(depth){if(SHADOW[i])delete SHADOW[i][depth];}else{delete LINEUP.slots[i];}closeOverlay();renderLineup();};
    document.querySelectorAll('#modal [data-pk]').forEach(el=>el.onclick=()=>{if(depth){SHADOW[i]=SHADOW[i]||{};SHADOW[i][depth]=el.dataset.pk;}else{LINEUP.slots[i]=el.dataset.pk;}closeOverlay();renderLineup();});
  };
  draw();
}

/* ===== App-Modus: installierbar, offline-fest, aktualisiert sich selbst ===== */
const APP_BUILD='beta-0.99.164', OUTBOX_KEY='svbcOutbox', APP_HIDE_KEY='svbcInstallHide';
let _appPrompt=null, _appNew=null, _obT=null;
function appStandalone(){ try{ return !!(window.matchMedia&&matchMedia('(display-mode: standalone)').matches)||navigator.standalone===true; }catch(e){ return false; } }
function appPlatform(){
  const ua=navigator.userAgent||'';
  const ios=/iPhone|iPad|iPod/.test(ua)||(navigator.platform==='MacIntel'&&navigator.maxTouchPoints>1);
  return { ios, android:/Android/i.test(ua), inApp:/FBAN|FBAV|Instagram|WhatsApp|Line\//i.test(ua), iosOther:ios&&/CriOS|FxiOS|EdgiOS/.test(ua) };
}

/* --- Offline-Ausgang: letzter Stand liegt auf dem Gerät, nichts geht bei Funkloch/App-Schließen verloren --- */
function outboxSave(){ clearTimeout(_obT); _obT=setTimeout(()=>{ if(window.__svbcOut)return; try{ lsSet(OUTBOX_KEY,syncSer()); }catch(e){} },250); }
function outboxLoad(){
  let d=null; try{ const s=lsGet(OUTBOX_KEY); if(s)d=JSON.parse(s); }catch(e){ d=null; }
  if(!d||typeof d!=='object'||Array.isArray(d))return null;
  try{ syncAdoptRemote(d); _lineupAdopted=false; return d; }catch(e){ return null; }
}
window.addEventListener('online',()=>{ if(_remoteDone&&SYNC_ST==='err'){ clearTimeout(_syncT); _pushTries=0; _syncT=setTimeout(syncPush,800); } });
window.addEventListener('pagehide',()=>{ if(window.__svbcOut)return; try{ clearTimeout(_obT); lsSet(OUTBOX_KEY,syncSer()); }catch(e){} });

/* --- Service Worker --- */
function appRegisterSW(){
  if(!('serviceWorker' in navigator)||!/^https?:$/.test(location.protocol))return;
  navigator.serviceWorker.register('sw.js',{scope:'./'}).catch(()=>{});
}

/* --- Selbst-Aktualisierung: neue Version wird erkannt, ohne dass jemand „neu laden“ muss --- */
function appSafeToReload(){
  if(crmIsTyping())return false;
  if(SYNC_ST==='pending'||SYNC_ST==='err')return false;
  try{ if(document.getElementById('overlay').classList.contains('open'))return false; }catch(e){}
  try{ if(mvpDirty)return false; }catch(e){}
  return true;
}
function appReload(){
  try{ sessionStorage.setItem('svbcReloadFor',_appNew||''); }catch(e){}
  try{ lsSet(OUTBOX_KEY,syncSer()); }catch(e){}
  const go=()=>location.replace(location.pathname+'?v='+encodeURIComponent(_appNew||Date.now()));
  if(navigator.serviceWorker&&navigator.serviceWorker.getRegistration){
    navigator.serviceWorker.getRegistration().then(r=>r?r.update().catch(()=>{}):null).finally(go);
  } else go();
}
function appShowUpdate(){
  let el=document.getElementById('appUpd');
  if(!el){ el=document.createElement('button'); el.id='appUpd'; el.className='appupd'; el.type='button'; document.body.appendChild(el);
    el.onclick=()=>{ if(!appSafeToReload()&&SYNC_ST==='pending'){ kToast('Wird noch gespeichert: gleich nochmal tippen'); return; } appReload(); }; }
  el.innerHTML='🔄 <b>Neue Version</b> · tippen zum Laden';
  el.style.display='';
}
let _appLastCheck=0;
async function appCheckUpdate(auto){
  if(!/^https?:$/.test(location.protocol))return;
  const now=Date.now(); if(now-_appLastCheck<30000)return; _appLastCheck=now;
  try{
    const r=await fetch('version.json?t='+now,{cache:'no-store'}); if(!r.ok)return;
    const v=await r.json(); if(!v||typeof v.build!=='string'||!v.build||v.build===APP_BUILD)return;
    _appNew=v.build;
    let tried=''; try{ tried=sessionStorage.getItem('svbcReloadFor')||''; }catch(e){}
    if(auto&&tried!==v.build&&appSafeToReload()){ appReload(); return; }
    appShowUpdate();
  }catch(e){}
}
document.addEventListener('visibilitychange',()=>{ if(document.visibilityState==='visible')appCheckUpdate(true); });
setInterval(()=>{ if(document.visibilityState==='visible')appCheckUpdate(false); },20*60*1000);

/* --- Installieren (Home) --- */
window.addEventListener('beforeinstallprompt',e=>{ e.preventDefault(); _appPrompt=e; renderAppInstall(); });
window.addEventListener('appinstalled',()=>{ _appPrompt=null; lsSet(APP_HIDE_KEY,'1'); renderAppInstall(); try{kToast('📲 Installiert: ab jetzt über das Icon öffnen');}catch(e){} });
function appShare(){
  const url=location.origin+location.pathname.replace(/index\.html$/,'');
  const text='SV/BSC Scout: unsere Kaderplanungs-App. Link öffnen und „Zum Home-Bildschirm“ wählen: ';
  if(navigator.share){ navigator.share({title:'SV/BSC Scout',text,url}).catch(()=>{}); return; }
  kCopy(text+url);
}
function renderAppInstall(){
  const box=document.getElementById('appInstall'); if(!box)return;
  const P=appPlatform();
  if(appStandalone()||lsGet(APP_HIDE_KEY)==='1'||!(_appPrompt||P.ios||P.android)){ box.innerHTML=''; return; }
  let how;
  if(_appPrompt) how=`<button class="kbtn appgo" id="appInstBtn">📲 Jetzt installieren</button>`;
  else if(P.ios&&P.inApp) how=`<ol class="appsteps"><li>Unten rechts auf <b>„In Safari öffnen“</b> (Kompass-Symbol) tippen</li><li>Dort <b>Teilen</b> <span class="appico">⬆︎</span> → <b>„Zum Home-Bildschirm“</b></li><li>Oben rechts <b>„Hinzufügen“</b></li></ol>`;
  else if(P.ios) how=`<ol class="appsteps"><li>Unten (bzw. oben) auf <b>Teilen</b> <span class="appico">⬆︎</span> tippen</li><li>Runterscrollen: <b>„Zum Home-Bildschirm“</b></li><li>Oben rechts <b>„Hinzufügen“</b> · fertig</li></ol>`;
  else how=`<ol class="appsteps"><li>Oben rechts das Browser-Menü <span class="appico">⋮</span> öffnen</li><li><b>„App installieren“</b> bzw. <b>„Zum Startbildschirm hinzufügen“</b></li></ol>`;
  box.innerHTML=`<div class="card appcard"><button class="kx" id="appInstHide" title="Ausblenden" aria-label="Ausblenden">×</button>
    <div class="apphead"><img src="icon-192.png" alt="" class="appicon"><div><h3>SV/BSC Scout als App</h3>
    <p>Eigenes Icon auf dem Startbildschirm, Vollbild, startet auch im Funkloch am Sportplatz, und aktualisiert sich von selbst.</p></div></div>
    ${how}
    <div class="approw"><button class="kbtn" id="appShareBtn">📤 Link an Planer schicken</button></div></div>`;
  const b=document.getElementById('appInstBtn');
  if(b)b.onclick=async()=>{ const p=_appPrompt; if(!p)return; _appPrompt=null; try{ await p.prompt(); await p.userChoice; }catch(e){} renderAppInstall(); };
  document.getElementById('appInstHide').onclick=()=>{ lsSet(APP_HIDE_KEY,'1'); renderAppInstall(); };
  document.getElementById('appShareBtn').onclick=appShare;
}
function appInit(){
  document.documentElement.classList.toggle('standalone',appStandalone());
  const acts=document.getElementById('appActs');
  if(acts){
    acts.innerHTML=`<button class="appact" id="appRefresh" title="Neu laden" aria-label="Neu laden">↻</button><button class="appact" id="appShareTop" title="App teilen" aria-label="App teilen">📤</button>`;
    document.getElementById('appRefresh').onclick=()=>{ if(SYNC_ST==='pending'){kToast('Wird noch gespeichert: gleich nochmal');return;} _appNew=_appNew||String(Date.now()); appReload(); };
    document.getElementById('appShareTop').onclick=appShare;
  }
  if(/[?&]v=/.test(location.search)){ try{ history.replaceState(null,'',location.pathname+location.hash); }catch(e){} }
  const h=(location.hash||'').slice(1); if(/^[a-z]+$/.test(h)&&document.getElementById('panel-'+h)){ try{goTab(h);}catch(e){} }
  renderAppInstall();
  appRegisterSW();
  setTimeout(()=>appCheckUpdate(true),4000);
}

/* Gruppenliga scouting scope, verified clubs in vendor/scouting-scope.json. */
function svScoutInScope(p){
 if(!p)return false;
 if(p.own||p.isJugend||(typeof sv4Team==='function'&&['1','2','A','B'].includes(sv4Team(p))))return true;
 const gl=l=>l==='GL'||(/(^|-)gruppenliga(-|$)/.test(l)&&!/(junior|jugend)/.test(l));
 const names=new Set(['SV Fürth','FC Fürth','FSG Riedrode','Tvgg. Lorsch','SC Olympia Lorsch','TSV Rot-Weiss Auerbach','TSV Rot-Weiß Auerbach','TSV Auerbach','TSV Höchst']);
 const clubOk=r=>["sv-fuerth", "fc-fuerth", "fsg-riedrode", "tsv-hoechst", "tvgg-lorsch", "sc-olympia-lorsch", "tsv-rot-weiss-auerbach"].includes(r.club_slug)||[87768, 23257, 39284, 26305, 87762, 87761, 87773].includes(Number(r.team_id))||names.has(r.verein||r.mannschaft||r.club);
 const K=typeof KLAW!=='undefined'&&KLAW.by&&KLAW.by[p.id], season=typeof klaSk==='function'?klaSk('cur'):null;
 const rows=K&&K[season]&&K[season].zeilen, active=(rows||[]).filter(r=>r.kader===true);
 const basis=active.length?active:(rows||[]).filter(r=>Number(r.einsaetze)>0);
 if(basis.length)return basis.some(r=>!gl(r.league)||clubOk(r));
 const now=typeof svLigaJetzt==='function'?svLigaJetzt(p):null;
 const league=now&&now.jetzt?now.liga:(p.cur&&p.cur.liga)||p.liga;
 const club=now&&now.jetzt?now.club:(p.cur&&p.cur.club)||p.club;
 return !gl(league)||clubOk({club,club_slug:p.club_slug,team_id:p.team_id});
}
// Re-evaluated on each render, including initial load, pull and push reload.
{const original=visible;visible=function(){return original.apply(this,arguments).filter(svScoutInScope);};}

// Home scouting suggestions share the same exclusion, without removing profiles.
if(typeof crmHidden==='function'){const prior=crmHidden;crmHidden=function(p){return !svScoutInScope(p)||prior.apply(this,arguments);};}

// Stored stars remain intact; only the active shortlist is filtered.
renderShortlist=function(){const arr=sorted(players.filter(p=>p.star&&svScoutInScope(p)));$('#shortlist').innerHTML=arr.length?arr.map((p,i)=>rowHtml(p,i)).join(''):'<div class="empty">Keine Markierungen im aktuellen Scoutinggebiet.</div>';};

// A permitted second team keeps the person, but must not admit a foreign GL membership into the GL filter.
function svScoutLigaErlaubt(p,l){
 if(l!=='GL'||p.own||p.isJugend)return true;
 const K=typeof KLAW!=='undefined'&&KLAW.by&&KLAW.by[p.id], sk=typeof klaSk==='function'?klaSk('cur'):null;
 const rows=K&&K[sk]&&K[sk].zeilen||[], roster=rows.filter(r=>r.kader===true), basis=roster.length?roster:rows.filter(r=>Number(r.einsaetze)>0);
 if(!basis.length)return svScoutInScope(p);
 return basis.some(r=>/(^|-)gruppenliga(-|$)/.test(r.league)&&svScoutInScope({liga:'GL',club:r.verein||r.mannschaft,club_slug:r.club_slug,team_id:r.team_id}));
}

/* =====================================================================
   SV/BSC Scout v3 · Rollen, Supabase-Sync, Nutzerverwaltung, App-Shell
   (wird an den App-Code angehängt und überschreibt gezielt einzelne Funktionen)
   ===================================================================== */
const SVB=window.SVBC, SVU=window.__SVBC_USER||{role:'viewer',name:'',email:''};
// Texte ohne Gedankenstriche: aus „A – B“ wird je nach Satz ein Komma, Doppelpunkt oder Punkt (auch für Daten und KI-Antworten)
const SV_KONJ=new Set('und oder aber sonst dann also damit nur nicht je auch wird werden ist sind bitte weil wenn falls statt ohne mit bis wie als ob denn doch jedoch egal danach dabei dafür deshalb daher so noch schon gern gerne etwa inkl. außer ggf. vielleicht meist oft immer nie kein keine keinen keiner'.split(' '));
function svPolish(t){ if(t.indexOf(' – ')<0&&t.indexOf(' — ')<0)return t;
  t=t.replace(/ [–—] ([^–—\n]{1,60}?) [–—] /g,', $1, ');
  return t.replace(/ [–—] (\S)/g,(m,c,off,str)=>{ const left=str.slice(0,off), lw=left.split(/[.:!?·(\n]\s*/).pop().trim().split(/\s+/).filter(Boolean).length, nx=str.slice(off+3).split(/\s/)[0].toLowerCase().replace(/[,.;:]+$/,'');
    if(SV_KONJ.has(nx)||(/[a-zäöüß]/.test(c)&&lw>6))return ', '+c; if(lw>0&&lw<=3)return ': '+c; return '. '+c.toUpperCase(); }).replace(/ [–—]$/,''); }
const svEsc=s=>svPolish(String(s==null?'':s)).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const svIni=n=>String(n||'?').trim().split(/\s+/).map(w=>w[0]).slice(0,2).join('').toUpperCase()||'?';
const svFirst=n=>String(n||'').trim().split(/\s+/)[0]||'';
function svRole(){ return SVU.role||'viewer'; }
// 0.99.23: Gast, Spieler und Helfer arbeiten nicht in Kader, Scouting und Kasse mit. Wo früher „nicht Gast“ stand, gilt das für alle drei.
function svGast(){ return ['viewer','spieler','helfer'].includes(svRole()); }
// Angezeigter Rollenname. Wer als Gast eine Funktion in einem Bereich hat, heißt nach der Funktion: „Abteilungsleiter Partner“ (svm100.js)
function svRolleT(){ try{ if(svRole()==='viewer'&&window.__SV_ROLLE_T)return window.__SV_ROLLE_T; }catch(e){} return SVB.ROLE_T[svRole()]||''; }
function canEdit(){ const r=svRole(); return r==='admin'||r==='vorstand'||r==='planer'; }
function canNotes(){ return canEdit()||svRole()==='trainer'; }
function canContacts(){ return canEdit(); }
function isAdmin(){ return svRole()==='admin'; }
/* Eigene Adressen starten gleich im passenden Bereich: studio.… im Studio, spieltag.… im Spieltagsstudio.
   Ohne Berechtigung oder bei unbekannter Adresse bleibt es bei der Übersicht. */
const SV_START={studio:'studio',spieltag:'plakat'};
function svStartBereich(host){ try{ const t=SV_START[String(host||location.hostname||'').split('.')[0]];
  return (t && typeof svTabAllowed==='function' && svTabAllowed(t)) ? t : null; }catch(e){ return null; } }
function canManage(){ const r=svRole(); return r==='admin'||r==='vorstand'; }
const SV_TRAINER_FIELDS={n:1,f:1,mv:1,mvd:1,x:1,ps:1,ps2:1,ph:1,gb:1,al:1,fu:1,gr:1,sc:1};
function canWriteField(k){ if(canEdit())return true; if(svRole()==='trainer')return !!SV_TRAINER_FIELDS[k]; return false; }
let _svDeniedT=0;
function svDenied(t){ const n=Date.now(); if(n-_svDeniedT<2500)return; _svDeniedT=n; try{kToast('🔒 '+(t||'Dafür fehlt dir die Berechtigung. Das machen die Kaderplaner.'));}catch(e){} }
function svAgo(ts){ const d=(Date.now()-new Date(ts).getTime())/1000; if(!isFinite(d))return ''; if(d<60)return 'gerade eben'; if(d<3600)return 'vor '+Math.round(d/60)+' Min.'; if(d<86400)return 'vor '+Math.round(d/3600)+' Std.';
  const days=Math.round(d/86400); if(days===1)return 'gestern'; if(days<7)return 'vor '+days+' Tagen'; return new Date(ts).toLocaleDateString('de-DE',{day:'2-digit',month:'2-digit',year:'2-digit'}); }

/* ---------- Supabase-Sync (ersetzt den öffentlichen Webhook) ---------- */
async function syncFetch(){
  const {data,error}=await SVB.sb.rpc('scout_state'); if(error)throw error;
  if(!data||typeof data!=='object'||Array.isArray(data))throw new Error('ungültiger Online-Stand');
  if(!data.crm||typeof data.crm!=='object')data.crm={};
  return data;
}
function syncDiff(d){
  const R=(d&&d.crm)||{}, rows=[];
  for(const id of Object.keys(CRM)){
    const L=CRM[id], LT=(L&&L._t)||{}, RT=(R[id]&&R[id]._t)||{};
    for(const k of Object.keys(LT)){
      if(k==='kv'||!canWriteField(k))continue;
      if((+RT[k]||0)<LT[k]) rows.push({id,f:k,v:Object.prototype.hasOwnProperty.call(L,k)?L[k]:null,t:LT[k]});
    }
  }
  return rows;
}
function syncMissing(d){ return syncDiff(d).length>0||(canEdit()&&_lineupT>syncTime(d.lt)); }
async function syncPush(){
  let gebGespeichert=false;
  try{
    const d=await syncFetch();
    if(syncAdoptRemote(d))crmAfterRemote();
    const rows=syncDiff(d), lin=canEdit()&&_lineupT>syncTime(d.lt);
    _lastSync=syncSer();
    for(let i=0;i<rows.length;i+=500){ const block=rows.slice(i,i+500), {error}=await SVB.sb.rpc('crm_put',{rows:block}); if(error)throw error;
      if(block.some(r=>r.f==='gb'))gebGespeichert=true; }
    if(lin){ const {error}=await SVB.sb.rpc('lineup_put',{p_formation:LINEUP.formation,p_slots:LINEUP.slots,p_shadow:SHADOW,p_lt:_lineupT}); if(error)throw error; }
    clearTimeout(_verifyT); _verifyT=setTimeout(syncVerify,(rows.length||lin)?700:0);
  }catch(e){
    _pushTries++; syncState('err');
    clearTimeout(_syncT); _syncT=setTimeout(syncPush,Math.min(120000,15000*_pushTries));
  }finally{
    if(gebGespeichert&&typeof kalGebAktualisieren==='function')kalGebAktualisieren();
  }
}
function svPull(){ if(!_remoteDone)return; syncFetch().then(d=>{ if(syncAdoptRemote(d))crmAfterRemote(); }).catch(()=>{}); }

/* ---------- Kontaktdaten: durch Rechte geschützt (kein Team-Schlüssel mehr nötig) ---------- */
async function tkInit(){}
async function kandCryptoTick(){}
function kandKeyPanel(){ return ''; }
async function kandSaveContact(id,val){
  if(!canContacts())return svDenied();
  val=(val||'').trim(); crmSet(id,{k:val||undefined}); kandSoftRender();
}
function kandContactPlain(p){ const C=crmOf(p); if(!C.k||isEnc(C.k))return ''; return String(C.k); }
function kandContactCell(p,C){
  if(!canContacts())return '<span class="kand-lock" title="Kontaktdaten sehen nur Kaderplaner">🔒</span>';
  if(C.k&&isEnc(C.k))return '<span class="kand-lock" title="Mit altem Team-Schlüssel verschlüsselt, bitte neu eintragen">🔒 alt: neu eintragen</span><input class="kand-in" data-kc="'+p.id+'" value="" placeholder="Handy / E-Mail" autocomplete="off">';
  const v=kandContactPlain(p), ph=kandPhone(v), ml=kandMail(v);
  return '<input class="kand-in" data-kc="'+p.id+'" value="'+kEsc(v)+'" placeholder="Handy / E-Mail" autocomplete="off">'
    +((ph||ml)?'<div class="kacts">'+(ph?'<a class="kbtn klink" href="tel:'+kEsc(ph.tel)+'" title="Anrufen">📞</a><a class="kbtn klink" href="https://wa.me/'+kEsc(ph.wa)+'" target="_blank" rel="noopener" title="WhatsApp-Chat öffnen">💬</a>':'')+(ml?'<a class="kbtn klink" href="mailto:'+kEsc(ml)+'" title="E-Mail">✉️</a>':'')+'</div>':'');
}

/* ---------- Schreibschutz je Rolle ---------- */
{ const _cs=crmSet; crmSet=function(id,upd){ const u={}; let blocked=false;
    for(const k in upd){ if(canWriteField(k))u[k]=upd[k]; else blocked=true; }
    if(blocked)svDenied(); if(Object.keys(u).length)_cs(id,u); }; }
{ const _rk=renderKandidaten; renderKandidaten=function(){
    const r=_rk.apply(this,arguments);
    const P=document.getElementById('panel-kandidaten');
    if(P&&!canEdit()){
      P.querySelectorAll('.kand-table input,.kand-table select,.kand-table textarea').forEach(el=>{ el.disabled=true; });
      P.querySelectorAll('.kand-table button:not(.kand-name)').forEach(el=>{ el.disabled=true; el.style.visibility='hidden'; });
      P.querySelectorAll('.kadd,#kDigBtn').forEach(el=>el.style.display='none');
      if(!P.querySelector('.ro-note')){ const n=document.createElement('div'); n.className='ro-note'; n.innerHTML=SVI('lock')+'<span><b>Nur lesen.</b> Die Pipeline pflegen die Kaderplaner. Kontaktdaten sind für deine Rolle ausgeblendet.</span>'; P.prepend(n); }
    }
    svBadges(); return r; }; }
function svGateModal(){
  const M=document.getElementById('modal'); if(!M||!svGast())return;
  M.querySelectorAll('.editsec').forEach(el=>{ el.style.display='none'; });
  const av=M.querySelector('#mAva'); if(av){ av.classList.remove('avaCam'); av.title=''; const c=av.cloneNode(true); av.replaceWith(c); }
}
{ const _rv=renderView; renderView=function(){ const r=_rv.apply(this,arguments); svGateModal(); return r; }; }
{ const _om=openModal; openModal=function(){ const r=_om.apply(this,arguments); svGateModal(); return r; }; }
/* Aufstellung/Schattenelf: nur Kaderplaner ändern */
['pointerdown','click','dragstart','touchstart'].forEach(ev=>document.addEventListener(ev,e=>{
  if(canEdit())return;
  const t=e.target&&e.target.closest&&e.target.closest('#panel-elf .slot,#panel-elf .bcard,#panel-elf .fpick,#panel-elf .fillbtn,#panel-elf .swapbtn,#panel-elf button,#panel-sxi .slot,#panel-sxi .shcell,#panel-sxi button,#panel-sxi .fillbtn');
  if(!t)return;
  e.preventDefault(); e.stopPropagation(); if(ev==='click')svDenied('Die Aufstellung ändern nur Kaderplaner.');
},true));

/* ---------- Shell: Titel, Navigation, Mehr-Menü ---------- */
const SV_PAGES={home:['Übersicht','Dein Lagebild für die Kaderplanung'],scout:['Scouting','Alle Spieler der Region. Filtern, vergleichen, merken'],
  kandidaten:['Kandidaten','Kontakte, Wechselchancen und Zuständigkeiten'],kaderplan:['Kaderplan','Traumelf, Backups und offene Positionen'],
  db:['Datenbank','Alle Spieler als Tabelle. Sortieren und filtern'],elf:['Aufstellung','Startelf planen und Positionen besetzen'],
  sxi:['Schattenelf','Backups und Wunschspieler je Position'],gems:['Rohdiamanten','Unterschätzte Spieler mit Potenzial'],
  jugend:['Jugend','Nachwuchs-Radar im Umkreis'],cmp:['Vergleich','Spieler direkt gegenüberstellen'],
  play:['Playbook','Wie datenbasierte Klubs Kader bauen'],model:['Modell','So rechnet der Scout'],admin:['Nutzer & Rollen','Wer hat Zugang, und was darf wer']};
function svTabAllowed(t){ if(t==='admin')return canManage(); if(t==='kandidaten')return !svGast(); return true; }
{ const _gt=goTab; goTab=function(tab){
    if(!tab||!svTabAllowed(tab)||!document.getElementById('panel-'+tab))tab='home';
    _gt(tab);
    const m=SV_PAGES[tab]||['',''];
    const h=document.getElementById('pgTitle'), s=document.getElementById('pgSub');
    if(h)h.textContent=m[0]; if(s)s.textContent=m[1];
    document.title=m[0]+' · SV/BSC Sportzentrale';
    document.querySelectorAll('.sgrid [data-sheet]').forEach(b=>b.classList.toggle('active',b.dataset.sheet===tab));
    const inBar=!!document.querySelector('.tabbar .ti.active'); const mb=document.getElementById('tMore'); if(mb)mb.classList.toggle('on',!inBar);
    if(tab==='admin')svAdminRender();
    try{ svHist(tab); }catch(e){}
    svSheet(false);
  }; }
function svSheet(open){ const s=document.getElementById('moreSheet'), bg=document.getElementById('sheetBg'); if(!s)return; s.classList.toggle('open',!!open); bg.classList.toggle('open',!!open); }
function svBadges(){
  try{ const due=kandList().filter(kandIsDue).length; document.querySelectorAll('[data-cnt="kandidaten"]').forEach(el=>{ el.textContent=due; el.style.display=due&&!svGast()?'':'none'; }); }catch(e){}
}

/* ---------- Kennzahlen auf der Übersicht ---------- */
function svTiles(){
  const el=document.getElementById('homeTiles'); if(!el)return;
  let kand=[],due=0; try{ kand=kandList(); due=kand.filter(kandIsDue).length; }catch(e){}
  let filled=0,total=11,form=''; try{ form=LINEUP.formation; const F=FORMATIONS[form]; total=F.length; filled=F.filter((_,i)=>LINEUP.slots[i]).length; }catch(e){}
  const stars=players.filter(p=>p.star).length, sen=players.filter(p=>!p.isJugend).length, jug=players.length-sen;
  const T=[];
  if(!svGast())T.push({go:'kandidaten',ic:'kand',c:'b',v:kand.length,l:'Kandidaten in der Pipeline',s:due?`<b class="bad">${due} Kontakt${due>1?'e':''} überfällig</b>`:(kand.length?'<b class="ok">alles im Plan</b>':'noch keine aufgenommen')});
  T.push({go:'elf',ic:'pitch',c:'g',v:filled+'<small>/'+total+'</small>',l:'Startelf besetzt',s:'Formation '+svEsc(form||'–')});
  T.push({go:'scout',ic:'gem',c:'v',v:stars,l:'Auf der Merkliste',s:'Favoriten im Blick'});
  T.push({go:'db',ic:'db',c:'y',v:sen.toLocaleString('de-DE'),l:'Spieler im Radar',s:(DATA.updated?'Stand '+new Date(DATA.updated).toLocaleDateString('de-DE',{day:'2-digit',month:'2-digit'})+' · ':'')+'7 Ligen'});
  if(svRole()==='viewer')T.push({go:'kaderplan',ic:'plan',c:'b',v:'26/27',l:'Kaderplan',s:'Traumelf & Backups'});
  el.innerHTML=T.map(t=>`<button class="tile ktile c-${t.c}" data-go="${t.go}"><span class="ti-ic">${SVI(t.ic)}</span><div class="v">${t.v}</div><div class="l">${svEsc(t.l)}</div><div class="s">${t.s}</div></button>`).join('');
  el.querySelectorAll('[data-go]').forEach(b=>b.onclick=()=>goTab(b.dataset.go));
}

/* ---------- Begrüßung, Aktivität, Online ---------- */
function svHello(){
  const el=document.getElementById('svHello'); if(!el)return;
  const h=new Date().getHours(), g=h<11?'Guten Morgen':h<17?'Hallo':'Guten Abend';
  const d=new Date().toLocaleDateString('de-DE',{weekday:'long',day:'numeric',month:'long'});
  const st=(typeof DATA!=='undefined'&&DATA.updated)?' · Daten vom '+new Date(DATA.updated).toLocaleDateString('de-DE',{day:'2-digit',month:'2-digit'}):'';
  el.innerHTML=`<div><h2>${g}, <span>${svEsc(svFirst(SVU.name)||'Coach')}</span></h2><p><span class="hello-d">${svEsc(d+st)}</span> <span class="rolechip r-${svEsc(svRole())}"><i></i>${svEsc(svRolleT())}</span></p></div>
    <div class="online" id="svOnline2"></div>`;
  svOnlineRender();
}
const SV_FIELD={k:'Kontaktdaten',n:'Notiz',w:'Wechselchance',s:'Status',lc:'Kontakt',pl:'Zuständigkeit',rl:'Rolle',tp:'Zielposition',f:'Merkliste',mv:'MVP von Hand',mvd:'MVP von Hand',c:'Kontakt-Status',x:'Ex-Spieler',px:'Pipeline',u:'Wiedervorlage'};
let _svActT=null;
async function svActivity(){
  const el=document.getElementById('svAct'); if(!el||!navigator.onLine)return;
  try{
    const {data,error}=await SVB.sb.rpc('recent_activity',{lim:40}); if(error)throw error;
    const seen=new Set(), items=[];
    for(const r of (data||[])){ if(r.field==='mvd')continue; const key=r.player_id+'|'+r.who; if(seen.has(key))continue; seen.add(key);
      const p=players.find(x=>x.id===r.player_id); if(!p)continue; items.push({r,p}); if(items.length>=7)break; }
    if(!items.length){ el.innerHTML=''; return; }
    el.innerHTML=`<div class="card"><h3 style="display:flex;align-items:center;gap:8px">${SVI('activity')} Letzte Aktivität</h3><ul class="act">`+items.map(({r,p})=>{
      const what=r.field==='px'?(r.deleted?'wieder aufgenommen':'aus der Pipeline genommen'):(SV_FIELD[r.field]||'Eintrag')+(r.deleted?' entfernt':'');
      return `<li><div class="uav">${svEsc(svIni(r.who))}</div><div><b>${svEsc(r.who)}</b> · ${svEsc(what)} · <span class="pl" data-svp="${svEsc(p.id)}">${svEsc(p.name)}</span><span class="tm">${svEsc(svAgo(r.at))}</span></div></li>`; }).join('')+'</ul></div>';
    el.querySelectorAll('[data-svp]').forEach(a=>a.onclick=()=>openModal(a.dataset.svp));
  }catch(e){}
}
function svActivitySoon(){ clearTimeout(_svActT); _svActT=setTimeout(svActivity,900); }
let SV_ONLINE=[];
function svOnlineRender(){
  const others=SV_ONLINE.filter(u=>u.id!==SVU.id);
  const html=others.length?`<span class="dot"></span><span class="avs">${others.slice(0,5).map(u=>`<i class="r-${svEsc(u.role)}" title="${svEsc(u.name)} ist online">${svEsc(svIni(u.name))}</i>`).join('')}</span><span class="lbl">${others.length===1?svEsc(svFirst(others[0].name))+' ist online':others.length+' Kollegen online'}</span>`
    :'<span class="lbl">Nur du bist gerade online</span>';
  document.querySelectorAll('#svOnline,#svOnline2').forEach(el=>{ el.innerHTML=html; el.classList.toggle('allein',!others.length); });   // 0.74: allein nichts anzeigen
}
function svRealtime(){
  try{
    const ch=SVB.sb.channel('scout-live',{config:{presence:{key:SVU.id||'x'}}});
    let t=null; const pull=()=>{ clearTimeout(t); t=setTimeout(()=>{ svPull(); svActivitySoon(); },400); };
    ch.on('postgres_changes',{event:'*',schema:'public',table:'crm_fields'},pull)
      .on('postgres_changes',{event:'*',schema:'public',table:'lineup'},pull)
      .on('presence',{event:'sync'},()=>{ const st=ch.presenceState(), m=new Map();
        Object.values(st).forEach(arr=>arr.forEach(u=>{ if(u&&u.id)m.set(u.id,u); })); SV_ONLINE=[...m.values()]; svOnlineRender(); })
      .subscribe(async s=>{ if(s==='SUBSCRIBED'){ try{ await ch.track({id:SVU.id,name:SVU.name||SVU.email,role:svRole()}); }catch(e){} } });
    SVB.channel=ch;
  }catch(e){}
}

/* ---------- Globale Spielersuche (⌘K) ---------- */
function svNorm(s){ return String(s||'').toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g,'').replace(/ß/g,'ss'); }
function svSearchWire(){
  const box=document.getElementById('gSearchBox'), inp=document.getElementById('gSearch'), res=document.getElementById('gRes'); if(!inp)return;
  let sel=0, list=[];
  const idx=players.map(p=>({p,k:svNorm(p.name+' '+(p.club||''))}));
  const draw=()=>{
    const q=svNorm(inp.value.trim());
    if(!q){ res.classList.remove('open'); return; }
    const parts=q.split(/\s+/);
    list=idx.filter(x=>parts.every(w=>x.k.includes(w))).map(x=>({p:x.p,s:scores(x.p).total})).sort((a,b)=>{ const sa=svNorm(a.p.name).startsWith(q)?1:0, sb2=svNorm(b.p.name).startsWith(q)?1:0; return sb2-sa||b.s-a.s; }).slice(0,8);
