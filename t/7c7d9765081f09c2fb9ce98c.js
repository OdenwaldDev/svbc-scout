  M.querySelector('#s1fvgl').onclick=()=>{ closeOverlay(); const ids=[pid]; if(b.ref&&b.ref.id)ids.push(b.ref.id); s1Vergleich(ids,b); };
  M.querySelector('#s1fok').onclick=async()=>{ const v=id=>M.querySelector(id).value;
    const upd={bedarf_id:bid,player_id:pid,stufe:v('#s1fs'),kontakt:v('#s1fk'),machbarkeit:v('#s1fm'),entscheidung:v('#s1fe'),verantwortlich:v('#s1fv'),naechster_schritt:v('#s1fn'),
      wiedervorlage:v('#s1fw'),verbindung:M.querySelector('#s1fb').checked,gespraech:v('#s1fg')};
    if(v('#s1fi')!==(k.interesse||''))upd.interesse=v('#s1fi');
    if(upd.stufe!==k.stufe||upd.kontakt!==k.kontakt||upd.entscheidung!==k.entscheidung)upd.letzte_aktion=`${S1_STUFE[upd.stufe]}, ${S1_ENT[upd.entscheidung]}`;
    if(upd.entscheidung==='verpflichtet'&&k.entscheidung!=='verpflichtet'&&!M.dataset.ok){ M.dataset.ok='1'; return kToast('Nochmal tippen: Verpflichtung bestätigen'); }
    try{ await s1KandSet(upd); closeOverlay(); kToast('✓ Gespeichert'); }catch(e){ kToast('⚠️ '+e.message); } };
}

/* ---------- Vergleich (Aktion, verbale Unterschiede, §5) ---------- */
function s1Vergleich(ids,b){
  ids=[...new Set((ids||[]).filter(Boolean))].slice(0,3); const L=ids.map(id=>sv4P(id)).filter(Boolean).map(s1Sp); if(!L.length)return;
  const z=(f,fmt)=>L.map(s=>`<td>${fmt?fmt(s):k1E(s[f]??'?')}</td>`).join('');
  const attr=Object.entries(V1K.ATTR_L).map(([a,l])=>`<tr><th>${k1E(l)}</th>${z(a,s=>s.attr&&s.attr[a]!=null?`<b>${s.attr[a]}</b>`:'?')}</tr>`).join('');
  const a=L[0], saetze=L.slice(1).map(o=>{ const d=a.ca!=null&&o.ca!=null?a.ca-o.ca:null;
    const t=[`${a.name} gegenüber ${o.name}: Stärke ${d==null?'nicht vergleichbar':`${d>0?'+':''}${d}, ${V1K.unterschied(a.ca,o.ca,a.sicherheit,o.sicherheit)}`}`];
    if(a.p24!=null&&o.p24!=null)t.push(`in 24 Monaten ${V1K.unterschied(a.p24,o.p24,a.sicherheit,o.sicherheit)} (${a.p24} zu ${o.p24})`);
    if(a.alter&&o.alter&&Math.abs(a.alter-o.alter)>=3)t.push(`${Math.abs(a.alter-o.alter)} Jahre ${a.alter<o.alter?'jünger':'älter'}`);
    const at=Object.keys(V1K.ATTR_L).filter(k=>a.attr&&o.attr&&a.attr[k]!=null&&o.attr[k]!=null&&Math.abs(a.attr[k]-o.attr[k])>=1).map(k=>`${V1K.ATTR_L[k]} ${a.attr[k]>o.attr[k]?'besser':'schwächer'}`);
    if(at.length)t.push('im Eye-Test '+at.join(', '));
    return t.join(', ')+'.'; });
  const M=svModal(`<h2 style="margin:0 0 4px">Vergleich</h2>${b?`<p class="note">${k1E(b.titel)}, Zielniveau ${s1Ziel(b)}</p>`:''}
    <div class="k1-tw"><table class="s1-vgl"><thead><tr><th></th>${L.map(s=>`<th><span class="lnk" data-svp="${k1E(s.id)}">${k1E(s.name)}</span></th>`).join('')}</tr></thead><tbody>
      <tr><th>Stärke</th>${z('ca',s=>`<b>${s.ca??'?'}</b>`)}</tr><tr><th>Sicherheit</th>${z('sicherheit')}</tr><tr><th>Form</th>${z('form',s=>s.form==null?'?':(s.form>0?'+':'')+s.form)}</tr>
      <tr><th>24 Monate</th>${z('p24')}</tr><tr><th>Position</th>${z('pos',s=>k1E([s.pos].concat(s.pos2).filter(Boolean).join(', ')))}</tr><tr><th>Alter</th>${z('alter')}</tr>
      <tr><th>Verein</th>${z('club',s=>k1E([s.club,s.liga].filter(Boolean).join(', ')||'?'))}</tr>${attr}</tbody></table></div>
    ${saetze.length?`<ul class="s1-satz">${saetze.map(t=>`<li>${k1E(t)}</li>`).join('')}</ul>`:''}
    <div class="btnrow"><button class="btn ghost" type="button" data-x>Schließen</button></div>`);
  M.querySelector('[data-x]').onclick=()=>closeOverlay();
  M.querySelectorAll('[data-svp]').forEach(x=>x.onclick=()=>{ closeOverlay(); openModal(x.dataset.svp); });
}

/* ---------- Entdecken: Markt, Radar, Rückkehrer, Talente ---------- */
function s1Entdecken(){
  const P=k1Panel('entdecken'); if(!P||!s1Bereit(P,s1Entdecken))return;
  const seg=`<div class="k1-seg">${[['markt','Markt'],['radar','Radar'],['rueck','Rückkehrer'],['talente','Talente']].map(([k,l])=>`<button type="button" class="${S1.ent===k?'on':''}" data-s1e="${k}">${l}</button>`).join('')}</div>`;
  let body='';
  if(S1.ent==='radar')body=s1Radar(); else if(S1.ent==='rueck')body=s1Rueck(); else if(S1.ent==='talente')body=s1Talente(); else { S1.ent='markt'; body=s1Markt(); }
  P.innerHTML=`${k1Kopf('Entdecken','Spieler finden, bevor ein Bedarf drängt. Treffer lassen sich einem Bedarf zuordnen.')}<div class="k1-leiste">${seg}</div>${body}`;
  P.querySelectorAll('[data-s1e]').forEach(x=>x.onclick=()=>{ S1.ent=x.dataset.s1e; s1Entdecken(); });
  P.querySelectorAll('[data-svp]').forEach(x=>x.onclick=()=>openModal(x.dataset.svp));
  P.querySelectorAll('[data-s1kl]').forEach(x=>x.onclick=()=>{ V1NAV.klassisch=true; goTab(x.dataset.s1kl); });
  P.querySelectorAll('[data-s1zub]').forEach(x=>x.onclick=async()=>{ const [bid,pid]=x.dataset.s1zub.split('|'); x.disabled=true;
    try{ await s1KandSet({bedarf_id:bid,player_id:pid,quelle:S1.ent==='radar'?'radar':'manuell'}); kToast('✓ Als Kandidat aufgenommen'); }catch(e){ kToast('⚠️ '+e.message); } s1Entdecken(); });
  P.querySelectorAll('[data-s1mf]').forEach(x=>x.onchange=x.oninput=()=>{ S1.mf[x.dataset.s1mf]=x.value; clearTimeout(S1._mt); S1._mt=setTimeout(()=>{ s1Entdecken(); const f=document.querySelector(`#panel-entdecken [data-s1mf="${x.dataset.s1mf}"]`); if(f&&x.tagName==='INPUT'){ f.focus(); try{ f.setSelectionRange(f.value.length,f.value.length); }catch(e){} } },x.tagName==='INPUT'?350:0); });
  P.querySelectorAll('[data-s1ms]').forEach(x=>x.onclick=()=>{ const k=x.dataset.s1ms; if(S1.msort.k===k)S1.msort.d*=-1; else S1.msort={k,d:k==='name'?1:-1}; s1Entdecken(); });
}
function s1BedarfKnopf(p){ const b=s1BedarfFuer(p); if(!b)return ''; const drin=(SV4.bk||[]).some(k=>k.bedarf_id===b.id&&k.player_id===p.id);
  return drin?`<small>Kandidat für ${k1E(b.titel)}</small>`:`<button class="btn sm ghost" type="button" data-s1zub="${k1E(b.id)}|${k1E(p.id)}" title="${k1E(b.titel)}">+ ${k1E(V1K.POSL[s1Pos(b)])}</button>`; }
function s1Markt(){
  const f=S1.mf, q=String(f.q||'').trim().toLowerCase();
  let L=players.filter(p=>s1Extern(p)&&!p.isJugend&&k1W(p.id).ca!=null).map(s1Sp)
    .filter(s=>!f.pos||V1K.passung(s,f.pos)>=.8).filter(s=>!f.liga||s1LigaKey(s.p)===f.liga).filter(s=>!f.alter||(s.alter!=null&&s.alter<=+f.alter))
    .filter(s=>!q||s.name.toLowerCase().includes(q)||String(s.club).toLowerCase().includes(q));
  const k=S1.msort.k, d=S1.msort.d, val=s=>k==='name'?s.name:k==='alter'?(s.alter??99):k==='sicherheit'?({hoch:3,mittel:2,niedrig:1}[s.sicherheit]||0):(s[k]??-1);
  L.sort((a,b)=>{ const x=val(a),y=val(b); return (x<y?-1:x>y?1:0)*d||a.name.localeCompare(b.name,'de'); });
  const n=L.length; L=L.slice(0,150);
  const th=(key,l)=>`<th><button type="button" class="k1-sort${k===key?' on':''}" data-s1ms="${key}">${l}${k===key?(d<0?' ↓':' ↑'):''}</button></th>`;
  const ligen=['GL','KOL','KLA','KLB','KLC','KLD'];
  return `<div class="k1-leiste"><input data-s1mf="q" placeholder="Name oder Verein" value="${k1E(f.q)}" style="min-width:160px">
      <label>Position <select data-s1mf="pos"><option value="">alle</option>${V1K.POS.map(x=>`<option${f.pos===x?' selected':''}>${x}</option>`).join('')}</select></label>
      <label>Liga <select data-s1mf="liga"><option value="">alle</option>${ligen.map(x=>`<option value="${x}"${f.liga===x?' selected':''}>${V1K.LIGA[x]}</option>`).join('')}</select></label>
      <label>bis Alter <input data-s1mf="alter" type="number" min="16" max="45" value="${k1E(f.alter)}" style="width:70px"></label>
      <button class="btn sm ghost" type="button" data-s1kl="best">Klassischer Markt</button></div>
    <div class="card"><div class="k1-tw"><table class="k1-t"><thead><tr>${th('name','Spieler')}<th>Pos</th><th>Verein</th>${th('ca','Stärke')}${th('p24','24M')}${th('sicherheit','Sicherheit')}${th('alter','Alter')}<th>Bedarf</th></tr></thead><tbody>
      ${L.map(s=>`<tr><td><span class="lnk" data-svp="${k1E(s.id)}">${k1E(s.name)}</span></td><td>${k1E(s.pos||'?')}</td><td><small>${k1E([s.club,s.liga].filter(Boolean).join(' · '))}</small></td>
        <td><b>${s.ca}</b></td><td>${s.p24??''}</td><td><span class="v1-c s-${k1E(s.sicherheit)}">${k1E(s.sicherheit||'?')}</span></td><td>${s.alter??''}</td><td>${s1BedarfKnopf(s.p)}</td></tr>`).join('')}</tbody></table></div>
      <p class="note small">${n} Spieler${n>150?', die ersten 150 gezeigt. Filter eingrenzen.':'.'}</p></div>`;
}
function s1Radar(){
  const L=players.filter(p=>s1Extern(p)&&(k1W(p.id).signale||[]).length).map(s1Sp).sort((a,b)=>b.signale.length-a.signale.length||(b.ca||0)-(a.ca||0)).slice(0,60);
  return `<div class="card"><h3 class="trh">${SVI('eye')} Radar <small>${L.length}</small></h3><p class="note small">Auffällige Entwicklungen aus den Spieldaten: höhere Liga, größere Rolle, außergewöhnlicher Output, Aufwärtstrend.</p>
    ${L.map(s=>`<div class="s1-m">${s1Ca(s)}<div class="s1-mt"><b class="lnk" data-svp="${k1E(s.id)}">${k1E(s.name)}</b><small>${s1Unter(s)}</small><p>${s.signale.map(g=>`<span class="s1-sig">${k1E(g.t)}</span>`).join('')}</p></div>
      <div class="s1-ma">${s1BedarfKnopf(s.p)}</div></div>`).join('')||'<p class="note">Gerade keine Signale.</p>'}
    <div class="btnrow"><button class="btn sm ghost" type="button" data-s1kl="radar">Klassisches Radar</button></div></div>`;
}
function s1Rueck(){
  const L=typeof rk43Liste==='function'?rk43Liste():null;
  if(L==null){ try{ if(typeof VR!=='undefined'&&!VR.atLoaded&&typeof vrLoadAllTime==='function'&&!S1._rkL){ S1._rkL=1; Promise.resolve(vrLoadAllTime()).then(()=>{ if(svCurTab()==='entdecken'&&S1.ent==='rueck')s1Entdecken(); }); } }catch(e){}
    return `<div class="card"><div class="empty">Vereinsstatistik wird geladen …</div></div>`; }
  const R=L.map(x=>({x,p:sv4P(x.pid)})).filter(y=>y.p).map(y=>Object.assign(y,{s:s1Sp(y.p)}));
  return `<div class="card"><h3 class="trh">${SVI('refresh')} Rückkehrer <small>${R.length}</small></h3><p class="note small">Ehemalige mit vielen Spielen für uns, die jetzt woanders spielen. Mit aktueller Stärke und passendem offenen Bedarf.</p>
    ${R.map(({x,s})=>`<div class="s1-m">${s1Ca(s)}<div class="s1-mt"><b class="lnk" data-svp="${k1E(s.id)}">${k1E(s.name)}</b><small>${s1Unter(s)}</small><p>${x.tot.sp} Spiele für uns${s.p24!=null?` · in 24 Monaten ${s.p24}`:''}</p></div>
      <div class="s1-ma">${s1BedarfKnopf(s.p)}</div></div>`).join('')||'<p class="note">Keine Rückkehrer im Datenbestand.</p>'}</div>`;
}
function s1Talente(){
  const L=players.filter(p=>s1Extern(p)&&k1W(p.id).ca!=null).map(s1Sp).filter(s=>s.alter!=null&&s.alter<=21).sort((a,b)=>(b.p24??b.ca??0)-(a.p24??a.ca??0)).slice(0,60);
  return `<div class="card"><h3 class="trh">${SVI('sprout')} Talente <small>${L.length}</small></h3><p class="note small">Externe Spieler bis 21 Jahre, sortiert nach der Projektion in 24 Monaten. Eigene Jugend steht in der Kaderplanung.</p>
    ${L.map(s=>`<div class="s1-m">${s1Ca(s)}<div class="s1-mt"><b class="lnk" data-svp="${k1E(s.id)}">${k1E(s.name)}</b><small>${s1Unter(s)}</small><p>${s.p24!=null?`In 24 Monaten ${s.p24}`:'Noch keine Projektion'}${s.sicherheit==='niedrig'?', noch unsicher':''}</p></div>
      <div class="s1-ma">${s1BedarfKnopf(s.p)}</div></div>`).join('')||'<p class="note">Keine jungen externen Spieler mit Stärke.</p>'}
    <div class="btnrow"><button class="btn sm ghost" type="button" data-s1kl="jugend">Klassische Talentliste</button></div></div>`;
}

/* ---------- Beobachtung: Hinweise, wo Eye-Test und Daten deutlich auseinanderliegen ---------- */
function s1EyeHinweise(){
  if(!S1.attr||!V1.werte)return [];
  const out=[];
  for(const [pid,a] of Object.entries(S1.attr)){ const p=sv4P(pid), w=k1W(pid); if(!p||w.ca==null)continue;
    const v=Object.keys(V1K.ATTR_L).map(k=>a[k]).filter(x=>x!=null); if(!v.length)continue;
    const lk=s1LigaKey(p)||(sv4Team(p)==='1'?'KLA':sv4Team(p)==='2'?'KLC':null); if(!lk||!V1K.ANKER[lk])continue;
    const e=v.reduce((s,x)=>s+x,0)/v.length, erwartet=Math.round(V1K.ANKER[lk]+(e-3)*5), d=w.ca-erwartet;
    if(Math.abs(d)>=8)out.push({p,ca:w.ca,erwartet,d,n:a.n||1}); }
  return out.sort((x,y)=>Math.abs(y.d)-Math.abs(x.d)).slice(0,8);
}
if(typeof bfRender==='function'){ const _bf47=bfRender; bfRender=function(){ const r=_bf47.apply(this,arguments);
  try{ if(!V1.an)return r; const P=document.getElementById('panel-blick'); if(!P)return r;
    if(!S1.attr){ s1AttrLaden().then(()=>{ if(svCurTab()==='blick')bfRender(true); }); return r; }
    P.querySelector('.s1-hin')?.remove(); const H=s1EyeHinweise(); if(!H.length)return r;
    const c=document.createElement('div'); c.className='card s1-hin';
    c.innerHTML=`<h3 class="trh">${SVI('eye')} Eye-Test und Daten uneinig <small>${H.length}</small></h3><p class="note small">Hier lohnt ein weiterer Blick: Der Eye-Test sieht den Spieler deutlich anders als die Spieldaten. Bei Bedarf „Bewertung prüfen“ im Profil nutzen.</p>
      ${H.map(h=>`<div class="k1-oe"><span class="lnk" data-svp="${k1E(h.p.id)}">${k1E(h.p.name)}</span><small>Daten ${h.ca}, Eye-Test spricht eher für ${h.erwartet} (${h.n} Test${h.n>1?'s':''})</small><b>${h.d>0?'Daten höher':'Eye-Test höher'}</b></div>`).join('')}`;
    P.prepend(c); c.querySelectorAll('[data-svp]').forEach(x=>x.onclick=()=>openModal(x.dataset.svp));
  }catch(e){ console.warn('Beobachtung V1',e); }
  return r; }; }

/* ---------- Navigation: Scouting-Reiter rendern ---------- */
{ const _gt47=goTab; goTab=function(tab){ const r=_gt47.apply(this,arguments);
  try{ const c=svCurTab(); if(c==='sbedarf')s1Bedarfe(); else if(c==='skand')s1Kandidaten(); else if(c==='entdecken')s1Entdecken(); }catch(e){ console.warn('Scouting V1',e); }
  return r; }; }
{ const _co47=closeOverlay; closeOverlay=function(){ const r=_co47.apply(this,arguments);
  try{ const c=svCurTab(); if(c==='skand')setTimeout(s1Kandidaten,60); else if(c==='sbedarf')setTimeout(s1Bedarfe,60); }catch(e){} return r; }; }

/* =====================================================================
   Sportzentrale · Umbau V1, Paket F: Mannschaft = DIESE WOCHE (hinter dem Schalter ui_v1)
   Mannschaft: Übersicht | Spieler | Training | Spiele | Verfügbarkeit | Organisation
   - Übersicht: nächstes Spiel, nächstes Training, wer fehlt, offene Aufgaben (nur lesen und weiterleiten)
   - Verfügbarkeit: Verletzungen und Abwesenheiten in einer Zeitleiste, Pflege in den bisherigen Ansichten
   - Organisation: Abstimmungen, Materialdienst, Kasse
   - Spieler: „Mehrere Spieler bearbeiten“ führt in die Massenpflege; dort kein Eye-Test mehr (der liegt im Profil)
   ===================================================================== */
const F1={ladeSp:false,ladeKb:false,ladeAbw:false};
function f1Team(){ try{ return typeof mnCtx==='function'?mnCtx():'1'; }catch(e){ return '1'; } }
function f1Mein(pid){ const p=sv4P(pid); return !!p&&sv4Team(p,sv4S())===f1Team(); }
function f1Tag(d){ try{ return new Date(d+'T12:00:00').toLocaleDateString('de-DE',{weekday:'short',day:'numeric',month:'numeric'}); }catch(e){ return d; } }
function f1Laden(again){
  const L=[];
  if(typeof SP!=='undefined'&&!SP.loaded&&!F1.ladeSp&&typeof spLoad==='function'){ F1.ladeSp=true; L.push(Promise.resolve(spLoad()).catch(()=>{})); }
  if(typeof KB!=='undefined'&&!KB.loaded&&!F1.ladeKb&&typeof kbLoad==='function'){ F1.ladeKb=true; L.push(Promise.resolve(kbLoad()).catch(()=>{})); }
  if(typeof SV91!=='undefined'&&!SV91.loaded&&!F1.ladeAbw&&typeof sv91Load==='function'){ F1.ladeAbw=true; L.push(Promise.resolve(sv91Load()).catch(()=>{})); }
  if(L.length)Promise.all(L).then(()=>{ try{ if(svCurTab()==='training'&&['uebersicht','verf','orga'].includes(TR.view))again(); }catch(e){} });
}
function f1Verletzt(){ return (TR.st.injuries||[]).filter(i=>!i.z&&f1Mein(i.p)); }
function f1Abwesend(von,bis){ return (typeof SV91!=='undefined'?SV91.abw:[]).filter(a=>a.bis>=von&&a.von<=bis&&f1Mein(a.player_id)); }
function f1NaechstesSpiel(){
  const t=trToday();
  try{ if(typeof spNext==='function'&&SP.loaded){ const f=spNext(f1Team()==='2'?'D2':'A')[0]; if(f)return {datum:f.datum,zeit:f.zeit||'',titel:`${f.heim||'?'} gegen ${f.gast||'?'}`,wb:f.wettbewerb||''}; } }catch(e){}
  const p=(KB.polls||[]).filter(x=>x.art==='spiel'&&x.datum>=t).sort((a,b)=>a.datum<b.datum?-1:1)[0];
  return p?{datum:p.datum,zeit:p.zeit||'',titel:p.titel||'Spiel',wb:''}:null;
}
function f1NaechstesTraining(){ const t=trToday(); return (KB.polls||[]).filter(x=>x.art==='training'&&x.datum>=t).sort((a,b)=>(a.datum+(a.zeit||''))<(b.datum+(b.zeit||''))?-1:1)[0]||null; }
function f1Zusagen(poll){ try{ const V=(KB.votes||[]).filter(v=>v.poll_id===poll.id); return {ja:V.filter(v=>v.antwort==='zu').length,n:V.length}; }catch(e){ return null; } }
function f1Aufgaben(){
  const t=trToday(), out=[];
  (KB.polls||[]).filter(p=>p.datum>=t&&TRC.diffDays(p.datum,t)<=3&&!p.geteilt_at&&!p.geschlossen).forEach(p=>out.push({t:`Abstimmung „${p.titel||p.art}“ am ${f1Tag(p.datum)} ist noch nicht verschickt`,go:'kabine:abst'}));
  (KB.polls||[]).filter(p=>p.art==='training'&&p.datum<t&&TRC.diffDays(t,p.datum)<=7&&!(TR.st.sessions||[]).some(s=>s.d===p.datum)).forEach(p=>out.push({t:`Training am ${f1Tag(p.datum)}: Beteiligung noch nicht erfasst`,go:'training:sessions'}));
  try{ if(typeof SV91!=='undefined'&&SV91.loaded){ const in7=sv91Add(t,7); if(!sv91MdAm(in7)&&!sv91MdAm(t))out.push({t:'Materialdienst für die nächsten Tage ist nicht vergeben',go:'training:material'}); } }catch(e){}
  f1Verletzt().filter(i=>TRC.diffDays(t,i.b)>=28&&!i.pr).slice(0,3).forEach(i=>out.push({t:`${trName(i.p)} ist seit ${TRC.diffDays(t,i.b)} Tagen verletzt: Stand klären`,go:'training:injuries'}));
  return out.slice(0,8);
}
function f1Seg(cur,L){ return `<div class="k1-leiste"><div class="k1-seg">${L.map(([k,l])=>`<button type="button" class="${cur===k?'on':''}" data-f1go="${k}">${l}</button>`).join('')}</div></div>`; }
function f1Bind(B){ B.querySelectorAll('[data-f1go]').forEach(b=>b.onclick=()=>{ const k=b.dataset.f1go; if(k==='kasse')goTab('kasse'); else sv4Go(k); });
  B.querySelectorAll('[data-svp]').forEach(x=>x.onclick=()=>openModal(x.dataset.svp)); }

/* ---------- Übersicht ---------- */
MN_VIEWS.uebersicht=function(B){
  f1Laden(()=>trRender());
  const t=trToday(), sp=f1NaechstesSpiel(), tr=f1NaechstesTraining(), verl=f1Verletzt(), woche=f1Abwesend(t,sv91Add?sv91Add(t,7):t), auf=f1Aufgaben();
  const z=tr?f1Zusagen(tr):null;
  let ve=null; try{ if(typeof s83KalSicher==='function')s83KalSicher('uebersicht');
    ve=typeof s81Feste==='function'&&KAL.loaded?s81Feste().filter(i=>(i.bis||i.d)>=t)[0]||null:null; }catch(e){}
  const vp=ve&&typeof s83Poll==='function'?s83Poll(ve.id):null, vz=vp?s83Zahl(vp):null, darfV=typeof s81DarfAnlegen==='function'&&s81DarfAnlegen();
  B.innerHTML=`<div class="f1-grid">
    <div class="card"><h3 class="trh">${SVI('pitch')} Nächstes Spiel</h3>${sp?`<p class="f1-gr">${k1E(f1Tag(sp.datum))}${sp.zeit?' · '+k1E(String(sp.zeit).slice(0,5)):''}</p><p>${k1E(sp.titel)}${sp.wb?` <small>${k1E(sp.wb)}</small>`:''}</p>`:'<p class="note">Kein Spiel geplant.</p>'}
      <div class="btnrow"><button class="btn sm ghost" type="button" data-f1go="training:games">Spiele</button></div></div>
    <div class="card"><h3 class="trh">${SVI('users')} Nächstes Training</h3>${tr?`<p class="f1-gr">${k1E(f1Tag(tr.datum))}${tr.zeit?' · '+k1E(String(tr.zeit).slice(0,5)):''}</p><p>${k1E(tr.titel||'Training')}${tr.ort?' · '+k1E(tr.ort):''}${z&&z.n?` · ${z.ja} Zusagen`:''}</p>`:'<p class="note">Keine Abstimmung für das nächste Training.</p>'}
      <div class="btnrow"><button class="btn sm ghost" type="button" data-f1go="training:sessions">Training</button><button class="btn sm ghost" type="button" data-f1go="kabine:abst">Abstimmungen</button></div></div>
    <div class="card"><h3 class="trh">${SVI('cal')} Nächste Veranstaltung</h3>${ve?`<p class="f1-gr">${k1E(f1Tag(ve.d))}${ve.z?' · '+k1E(String(ve.z).slice(0,5)):''}</p><p>${k1E(ve.t||'Veranstaltung')}${ve.ort?' · '+k1E(ve.ort):''}${vz?` · ${vz.zu} Zusagen`:''}</p>`:'<p class="note">Keine Veranstaltung geplant.</p>'}
      <div class="btnrow">${darfV?`<button class="btn sm ghost" type="button" data-f1neuv>${SVI('plus')} Veranstaltung erstellen</button>`:''}<button class="btn sm ghost" type="button" data-f1go="training:feste">Veranstaltungen</button></div></div>
    <div class="card"><h3 class="trh">${SVI('info')} Wer fehlt <small>${verl.length+woche.length}</small></h3>
      ${verl.map(i=>`<div class="k1-oe"><span class="lnk" data-svp="${k1E(i.p)}">${k1E(trName(i.p))}</span><small>verletzt seit ${k1E(TRC.fmt(i.b))}${i.dg?' · '+k1E(i.dg):''}</small></div>`).join('')}
      ${woche.map(a=>`<div class="k1-oe"><span class="lnk" data-svp="${k1E(a.player_id)}">${k1E(trName(a.player_id))}</span><small>${k1E((SV91_GR&&SV91_GR[a.grund])||'abwesend')} bis ${k1E(f1Tag(a.bis))}</small></div>`).join('')}
      ${verl.length+woche.length?'':'<p class="note">Alle verfügbar.</p>'}<div class="btnrow"><button class="btn sm ghost" type="button" data-f1go="training:verf">Verfügbarkeit</button></div></div>
    <div class="card"><h3 class="trh">${SVI('check')} Offene Aufgaben <small>${auf.length}</small></h3>
      ${auf.map(a=>`<div class="k1-oe"><span>${k1E(a.t)}</span><button class="btn sm ghost" type="button" data-f1go="${k1E(a.go)}">Öffnen</button></div>`).join('')||'<p class="note">Nichts offen.</p>'}</div>
    <div class="card"><h3 class="trh">${SVI('activity')} Beteiligung</h3><p class="note">Training, Spiele und Veranstaltungen je Spieler seit Saisonbeginn.</p>
      <div class="btnrow"><button class="btn sm ghost" type="button" data-f1go="training:betl">Ansehen</button><button class="btn sm ghost" type="button" data-f1pdf>${SVI('download')} Als PDF</button></div></div></div>`;
  f1Bind(B);
  const nv=B.querySelector('[data-f1neuv]'); if(nv)nv.onclick=()=>s83Form(null);
  const pd=B.querySelector('[data-f1pdf]'); if(pd)pd.onclick=()=>s83BetExport();
};

/* ---------- Verfügbarkeit ---------- */
MN_VIEWS.verf=function(B){
  f1Laden(()=>trRender());
  const t=trToday(), bis=sv91Add(t,28), E=[];
  f1Verletzt().forEach(i=>E.push({pid:i.p,von:i.b,bis:i.pr||null,art:'verletzt',text:[i.dg,i.kt].filter(Boolean).join(' · ')||'verletzt',id:i.id}));
  f1Abwesend(t,bis).forEach(a=>E.push({pid:a.player_id,von:a.von,bis:a.bis,art:'abwesend',text:(SV91_GR&&SV91_GR[a.grund])||'abwesend'}));
  E.sort((a,b)=>(a.von<b.von?-1:a.von>b.von?1:0)||trName(a.pid).localeCompare(trName(b.pid),'de'));
  B.innerHTML=`<div class="card"><div class="f1-vk"><h3 class="trh">${SVI('info')} Wer fehlt in den nächsten vier Wochen <small>${E.length}</small></h3>
      <div class="btnrow"><button class="btn sm" type="button" data-f1inj>${SVI('plus')} Verletzung</button><button class="btn sm" type="button" data-f1abw>${SVI('plus')} Abwesenheit</button></div></div>
      ${E.length?`<div class="f1-tl">${E.map(e=>`<div class="f1-te ${e.art}"><span class="f1-dt">${k1E(f1Tag(e.von<t?t:e.von))}${e.bis?' bis '+k1E(f1Tag(e.bis)):' bis offen'}</span>
        <span class="lnk" data-svp="${k1E(e.pid)}">${k1E(trName(e.pid))}</span><small>${e.art==='verletzt'?'Verletzt':'Abwesend'}: ${k1E(e.text)}</small></div>`).join('')}</div>`:'<p class="note">Niemand fällt aus.</p>'}</div>`;
  f1Bind(B); const i=B.querySelector('[data-f1inj]'); if(i)i.onclick=()=>trInjuryEditor(null);
  const ab=B.querySelector('[data-f1abw]'); if(ab)ab.onclick=()=>{ if(typeof svmAbwEdit==='function')svmAbwEdit(null); else sv4Go('training:urlaub'); };
};

/* ---------- Organisation ---------- */
MN_VIEWS.orga=function(B){
  f1Laden(()=>trRender());
  const t=trToday(), offen=(KB.polls||[]).filter(p=>p.datum>=t&&!p.geschlossen).sort((a,b)=>a.datum<b.datum?-1:1);
  let md=null; try{ md=SV91.loaded?sv91MdAm(t)||SV91.md.filter(m=>m.von>t).sort((a,b)=>a.von<b.von?-1:1)[0]||null:null; }catch(e){}
  const kasse=typeof svTabAllowed==='function'&&svTabAllowed('kasse');
  B.innerHTML=`${f1Seg('',[['kabine:abst','Abstimmungen'],['training:material','Materialdienst']].concat(kasse?[['kasse','Kasse']]:[]))}
    <div class="f1-grid"><div class="card"><h3 class="trh">${SVI('chat')} Abstimmungen <small>${offen.length}</small></h3>
      ${offen.slice(0,5).map(p=>{ const z=f1Zusagen(p); return `<div class="k1-oe"><span>${k1E(p.titel||p.art)}</span><small>${k1E(f1Tag(p.datum))}${p.geteilt_at?'':' · nicht verschickt'}${z&&z.n?` · ${z.ja} Zusagen`:''}</small></div>`; }).join('')||'<p class="note">Keine offenen Abstimmungen.</p>'}
      <div class="btnrow"><button class="btn sm ghost" type="button" data-f1go="kabine:abst">Öffnen</button></div></div>
    <div class="card"><h3 class="trh">${SVI('users')} Materialdienst</h3>${md?`<p>${k1E(f1Tag(md.von))} bis ${k1E(f1Tag(md.bis))}: ${k1E(sv91Namen(md).join(', ')||'offen')}</p>`:'<p class="note">Kein Materialdienst eingeteilt.</p>'}
      <div class="btnrow"><button class="btn sm ghost" type="button" data-f1go="training:material">Öffnen</button></div></div>
    ${kasse?`<div class="card"><h3 class="trh">${SVI('check')} Mannschaftskasse</h3><p class="note">Strafen, Beiträge und Ausgaben der Mannschaft.</p><div class="btnrow"><button class="btn sm ghost" type="button" data-f1go="kasse">Öffnen</button></div></div>`:''}</div>`;
  f1Bind(B);
};

/* ---------- Spieler: Massenpflege als Aktion, Eye-Test nicht mehr in der Massenpflege ---------- */
{ const _ar48=mnAfterRender; mnAfterRender=function(v){ const r=_ar48.apply(this,arguments);
  try{ if(!V1NAV.an||v!=='players')return r; const B=document.getElementById('trBody'); if(!B||B.querySelector('[data-f1mass]'))return r;
    const d=document.createElement('div'); d.className='k1-leiste'; d.innerHTML=`<button class="btn" type="button" data-f1mass>${SVI('users')} Spielerdaten pflegen</button><span class="note small">Position, Fuß, Status und mehr für viele Spieler auf einmal</span>`;
    B.prepend(d); d.querySelector('[data-f1mass]').onclick=()=>sv4Go('training:pflege'); }catch(e){ console.warn(e); }
  return r; }; }
try{ const eyeA=MN_AREAS.find(a=>a.k==='eye'); if(eyeA){ const _c=eyeA.can; eyeA.can=function(){ if(typeof V1!=='undefined'&&V1.an)return false; return _c.apply(this,arguments); }; } }catch(e){}
{ const _pf48=MN_VIEWS.pflege; MN_VIEWS.pflege=mnViewPflege=function(B){ try{ if(typeof V1!=='undefined'&&V1.an&&MN.area==='eye')MN.area='fuss'; }catch(e){} return _pf48.apply(this,arguments); }; }

/* =====================================================================
   Sportzentrale · Umbau V1, Paket G: Admin (hinter dem Schalter ui_v1)
   - Datenqualität (Verwaltung → Datenprüfung): Lücken und Widersprüche, die Stärke, Fit und Planung betreffen.
     Doppelte Spieler bleiben in der bestehenden Prüfung darunter: zusammengeführt wird nur nach Bestätigung durch den Admin.
   - Modellprüfung (Wissen → Modell): Muster aus „Bewertung prüfen“, Widersprüche aus Vergleichen, Simulation eines
     Vorschlags (alt gegen neu, ohne Speichern), Warnung bei großen Auswirkungen, neue Version als Entwurf, Aktivierung
     nur durch den Admin mit Bestätigung. Alte Stände bleiben erhalten.
   ===================================================================== */
const G1={pr:null,prP:null,mod:null,sim:null,simBusy:false,simSig:'',ok:false,versionen:null,dqOffen:{}};
const G1_DIR={zu_hoch:'zu hoch',zu_niedrig:'zu niedrig',passt:'passt'};
const g1E=s=>svEsc(s==null?'':String(s));
function g1Name(id){ const p=sv4P(id); return p?p.name:id; }
function g1W(id){ const w=V1.werte&&V1.werte[id]; return w?{ca:w[0],sicherheit:w[1],position:w[7]||null}:null; }

/* ---------- Datenqualität ---------- */
function g1Qualitaet(){
  const s=sv4S(), eigene=players.filter(p=>!p.isJugend&&['1','2'].includes(sv4Team(p,s)));
  const L={pos:[],geb:[],ca:[],unsicher:[],fuss:[],posw:[]};
  eigene.forEach(p=>{ const w=g1W(p.id);
    if(!p.pos)L.pos.push(p); if(!p.geb&&!(+p.alter>0))L.geb.push(p); if(!p.fuss)L.fuss.push(p);
    if(!w||w.ca==null)L.ca.push(p); else if(w.sicherheit==='niedrig')L.unsicher.push(p); });
  const kand=new Set((SV4.bk||[]).map(k=>k.player_id));
  players.filter(p=>!p.isJugend&&(eigene.includes(p)||kand.has(p.id))).forEach(p=>{ const w=g1W(p.id); if(!w||!w.position||!p.pos)return;
    const h=V1K.posV1(p.pos), d=V1K.posV1(String(w.position).replace('?',''))||w.position, n=(p.pos2||[]).map(V1K.posV1); if(h===d||n.includes(d)||(h==='MF'&&['DM','OM','MF'].includes(d))||(d==='MF'&&['DM','OM'].includes(h)))return;
    L.posw.push({id:p.id,name:p.name,pos:p.pos,_posDaten:w.position}); });
  let dub=null; try{ if(typeof dpDubletten==='function'&&DP.ent)dub=dpDubletten().length; }catch(e){}
  return {L,dub,n:eigene.length};
}
function g1QualHtml(){
  const {L,dub,n}=g1Qualitaet();
  const zeile=(k,t,hilfe,txt)=>{ const A=L[k]; if(!A.length)return `<div class="k1-oe"><span>${g1E(t)}</span><small>✓ vollständig</small></div>`;
    const off=G1.dqOffen[k]; return `<div class="k1-oe"><span>${g1E(t)}</span><small>${g1E(hilfe)}</small><button class="btn sm ghost" type="button" data-g1dq="${k}">${A.length}</button></div>
    ${off?`<p class="note small">${A.slice(0,40).map(p=>`<span class="lnk" data-svp="${g1E(p.id)}">${g1E(p.name)}</span>${txt?' ('+g1E(txt(p))+')':''}`).join(', ')}${A.length>40?' …':''}</p>`:''}`; };
  return `<div class="card g1-dq"><h3 class="trh">${SVI('check')} Datenqualität für Stärke, Fit und Planung <small>${n} eigene Spieler</small></h3>
    <p class="note small">Fehlende Angaben zählen im Modell als unbekannt, nicht als schlecht. Sie senken aber die Sicherheit und machen Fit und Planung ungenauer.</p>
    <h4 class="s1-gruppe">Lücken</h4>
    ${zeile('pos','Ohne Position','nötig für Plan-Elf und Bedarfe')}${zeile('geb','Ohne Geburtsdatum','nötig für Projektion und Entwicklungsrollen')}
    ${zeile('fuss','Ohne starken Fuß','nur für Suchprofile wichtig')}${zeile('ca','Ohne Stärke','erst nach der nächsten Berechnung oder ohne Spieldaten')}
    ${zeile('unsicher','Stärke noch unsicher','wenige Einsätze: Eye-Test hilft')}
    <h4 class="s1-gruppe">Widersprüche</h4>
    ${zeile('posw','Position der Saison weicht von den Stammdaten ab','im Profil vereinheitlichen',p=>`Stammdaten ${p.pos}, Saison ${p._posDaten}`)}
    <h4 class="s1-gruppe">Doppelte Spieler</h4>
    <div class="k1-oe"><span>${dub==null?'Prüfung lädt':dub?`${dub} Vorschläge`:'Keine Vorschläge'}</span><small>Zusammenführen nur nach deiner Bestätigung, unten in „Doppelte Spieler“</small></div></div>`;
}
if(typeof dpRender==='function'){ const _dp49=dpRender; dpRender=function(){ const r=_dp49.apply(this,arguments);
  try{ if(!V1.an||!isAdmin())return r; const P=document.getElementById('panel-pruefung'); if(!P||!DP.ent)return r;
    if(!V1.werte)return r; P.querySelector('.g1-dq')?.remove(); const t=document.createElement('div'); t.innerHTML=g1QualHtml(); const c=t.firstElementChild; P.prepend(c);
    c.querySelectorAll('[data-svp]').forEach(x=>x.onclick=()=>openModal(x.dataset.svp));
    c.querySelectorAll('[data-g1dq]').forEach(b=>b.onclick=()=>{ const k=b.dataset.g1dq; G1.dqOffen[k]=!G1.dqOffen[k]; dpRender(); });
  }catch(e){ console.warn('Datenqualität V1',e); }
  return r; }; }

/* ---------- Modellprüfung ---------- */
function g1PrLaden(force){
  if(G1.prP)return G1.prP; if(G1.pr&&!force)return Promise.resolve();
  G1.prP=(async()=>{
    try{ const {data,error}=await SVB.sb.from('rating_pruefung').select('id,player_id,art,urteil,vergleich,vergleich_player,status,erstellt_am').order('erstellt_am',{ascending:false}).limit(600);
      if(error)throw error; G1.pr=data||[]; }catch(e){ G1.pr=[]; }
    try{ G1.versionen=await v1Rpc('rating_modelle_liste'); }catch(e){ G1.versionen=[]; }
    G1.prP=null; })();
  return G1.prP;
}
function g1Gruppe(id){ const p=sv4P(id); if(!p)return null; const t=sv4Team(p,sv4S()); const w=g1W(id);
  const liga=t==='1'?'1. Mannschaft':t==='2'?'2. Mannschaft':(typeof s1Liga==='function'?s1Liga(p):p.liga)||'unbekannt';
  return {liga,pos:V1K.posV1(String((w&&w.position)||p.pos||'').replace('?',''))||'?'}; }
function g1Muster(){
  const R=(G1.pr||[]).filter(x=>['zu_hoch','zu_niedrig'].includes(x.urteil||x.art)&&x.status!=='abgelehnt'), G={};
  const add=(k,t,dir)=>{ (G[k]=G[k]||{t,hoch:0,niedrig:0,ids:new Set()}); G[k][dir==='zu_hoch'?'hoch':'niedrig']++; };
  R.forEach(x=>{ const g=g1Gruppe(x.player_id); if(!g)return; const d=x.urteil||x.art;
    add('l|'+g.liga,`Spieler aus ${g.liga}`,d); add('p|'+g.pos,`Position ${V1K.POSL[g.pos]||g.pos}`,d); add('lp|'+g.liga+'|'+g.pos,`${V1K.POSL[g.pos]||g.pos} aus ${g.liga}`,d); });
  return Object.values(G).map(g=>{ const n=g.hoch+g.niedrig, m=Math.max(g.hoch,g.niedrig); return Object.assign(g,{n,m,dir:g.hoch>=g.niedrig?'zu hoch':'zu niedrig'}); })
    .filter(g=>g.m>=3&&g.m/g.n>=.7).sort((a,b)=>b.m-a.m).slice(0,8);
}
function g1VglWiderspruch(){
  return (G1.pr||[]).filter(x=>x.vergleich&&x.vergleich_player&&x.status!=='abgelehnt').map(x=>{ const a=g1W(x.player_id), b=g1W(x.vergleich_player); if(!a||!b||a.ca==null||b.ca==null)return null;
    const d=a.ca-b.ca, w=(x.vergleich==='groesser'&&d<=-2)||(x.vergleich==='kleiner'&&d>=2)||(x.vergleich==='aehnlich'&&Math.abs(d)>=6);
    return w?{x,a,b,d}:null; }).filter(Boolean).slice(0,10);
}
function g1Aktiv(){ const m=(V1.modell&&V1.modell.modell)||{}; const pa=m.parameter||{};
  return {version:m.version||'?',basis:pa.basis||m.version,anker:Object.assign({},pa.liga_anker||{}),rolle:Object.assign({},pa.rolle||{}),kmax:pa.korrektur_gesamt_max??8}; }
function g1NaechsteVersion(v){ const m=String(v||'').match(/^v(\d+)\.(\d+)\.(\d+)$/); if(!m)return 'v1.0.2';
  let n=+m[3]+1; const da=new Set((G1.versionen||[]).map(x=>x.version)); while(da.has(`v${m[1]}.${m[2]}.${n}`))n++; return `v${m[1]}.${m[2]}.${n}`; }
function g1Vorschlag(c){ const A=g1Aktiv(), anker={}, rolle={};
  c.querySelectorAll('[data-g1a]').forEach(i=>{ anker[i.dataset.g1a]=+i.value; }); c.querySelectorAll('[data-g1r]').forEach(i=>{ rolle[i.dataset.g1r]=-Math.abs(+i.value); });
  const k=+c.querySelector('[data-g1k]').value;
  return {liga_anker:Object.assign({},A.anker,anker),rolle:Object.assign({},A.rolle,rolle),korrektur_gesamt_max:k||A.kmax}; }
function g1Gross(s){ return s&&(Math.max(s.max_auf||0,-(s.max_ab||0))>=6||Math.abs(s.schnitt||0)>=2||(s.spieler&&s.geaendert/s.spieler>.5)); }
function g1ModellHtml(){
  const A=g1Aktiv(), Z=G1.vor||{liga_anker:A.anker,rolle:A.rolle,korrektur_gesamt_max:A.kmax}, admin=svRole()==='admin', M=g1Muster(), W=g1VglWiderspruch(), S=G1.sim, gross=g1Gross(S);
  const offen=(G1.pr||[]).filter(x=>x.status==='offen').length, passt=(G1.pr||[]).filter(x=>x.urteil==='passt').length;
  const V=(G1.versionen||[]);
  return `<div class="card g1-modell"><h3>Modellprüfung</h3>
    <p class="note">${(G1.pr||[]).length} Hinweise aus „Bewertung prüfen“, davon ${offen} offen und ${passt} mit „Wert passt“. Ein einzelner Hinweis ändert nie das Modell. Erst wenn sich ein Muster zeigt, lohnt ein Vorschlag.</p>
    <h5>Muster</h5>${M.length?M.map(g=>`<div class="k1-oe"><span>${g1E(g.t)}</span><small>${g.m} von ${g.n} Hinweisen: ${g1E(g.dir)}</small></div>`).join(''):'<p class="note small">Kein Muster: höchstens vereinzelte Hinweise.</p>'}
    <h5>Vergleiche, die der Stärke widersprechen</h5>${W.length?W.map(v=>`<div class="k1-oe"><span><span class="lnk" data-svp="${g1E(v.x.player_id)}">${g1E(g1Name(v.x.player_id))}</span> ${g1E(V1_VGL[v.x.vergleich])} <span class="lnk" data-svp="${g1E(v.x.vergleich_player)}">${g1E(g1Name(v.x.vergleich_player))}</span></span><small>Stärke ${v.a.ca} zu ${v.b.ca}</small></div>`).join(''):'<p class="note small">Keine.</p>'}
    <h5>Vorschlag simulieren</h5><p class="note small">Aktives Modell ${g1E(A.version)}. Werte ändern, dann simulieren: alle Spieler werden alt gegen neu gerechnet, nichts wird gespeichert.</p>
    <div class="s1-fm">${Object.keys(V1K.ANKER).map(k=>`<label>${g1E(V1K.LIGA[k])}<input type="number" min="30" max="99" data-g1a="${k}" value="${Z.liga_anker[k]??V1K.ANKER[k]}"></label>`).join('')}
      ${[['rotation','Rotation'],['ersatz','Meist Ersatz'],['bank_unbenutzt','Ungenutzte Bank']].map(([k,l])=>`<label>Abzug ${l}<input type="number" min="0" max="15" data-g1r="${k}" value="${Math.abs(Z.rolle[k]??0)}"></label>`).join('')}
      <label>Korrekturen höchstens ±<input type="number" min="2" max="15" data-g1k value="${Z.korrektur_gesamt_max}"></label></div>
    <div class="btnrow"><button class="btn sm" type="button" data-g1sim${G1.simBusy?' disabled':''}>${SVI('refresh')} ${G1.simBusy?'Simuliert … (bis zu einer Minute)':'Auswirkung simulieren'}</button></div>
    ${S?`<div class="card ${gross?'g1-warn':''}" style="margin:8px 0"><p><b>${S.geaendert}</b> von ${S.spieler} Spielern ändern sich · Schnitt ${S.schnitt>0?'+':''}${String(S.schnitt).replace('.',',')} · größte Änderung +${S.max_auf} / ${S.max_ab}</p>
      ${(S.groesste||[]).length?`<p class="note small">${S.groesste.map(x=>`<span class="lnk" data-svp="${g1E(x.id)}">${g1E(g1Name(x.id))}</span> ${x.alt} → ${x.neu}`).join(' · ')}</p>`:''}
      ${gross?`<p class="note"><b>Achtung: große Auswirkung.</b> Viele oder starke Änderungen. Bitte prüfen, ob das gewollt ist, bevor eine neue Version entsteht.</p><label class="jutog"><input type="checkbox" data-g1ok${G1.ok?' checked':''}> Ich habe die Auswirkungen geprüft</label>`:''}
      ${admin?`<div class="s1-fm"><label>Neue Version<input data-g1v value="${g1E(g1NaechsteVersion(A.version))}" maxlength="20"></label><label class="w">Was ändert sich und warum? *<textarea data-g1b maxlength="2000" placeholder="z. B. Kreisoberliga-Anker um 1 gesenkt: 5 Hinweise ‚zu hoch‘ für KOL-Spieler"></textarea></label></div>
        <div class="btnrow"><button class="btn sm" type="button" data-g1save>${SVI('check')} Als Entwurf speichern</button></div>`:'<p class="note small">Neue Versionen legt der Admin an.</p>'}</div>`:''}
    <h5>Versionen</h5>${V.map(v=>`<div class="k1-oe"><span><b>${g1E(v.version)}</b> ${g1E(v.status==='aktiv'?'aktiv':v.status==='entwurf'?'Entwurf':'Archiv')}</span><small>${g1E(v.beschreibung||'')}${v.staende?` · ${v.staende} Stände`:''}</small>
      ${admin&&v.status==='entwurf'?`<button class="btn sm" type="button" data-g1akt="${g1E(v.version)}">Aktivieren</button>`:''}</div>`).join('')||'<p class="note small">Keine.</p>'}
  </div>`;
}
function g1ModellKarte(){
  const P=document.getElementById('panel-model'); if(!P||!V1.an||!['admin','vorstand'].includes(svRole())||!V1.modell)return;
  if(!G1.pr){ g1PrLaden().then(g1ModellKarte); return; }
  let c=P.querySelector('.g1-modell'); const t=document.createElement('div'); t.innerHTML=g1ModellHtml(); const n=t.firstElementChild;
  if(c)c.replaceWith(n); else { const v=P.querySelector('.v1-modell'); if(v)v.after(n); else P.prepend(n); } c=n;
  c.querySelectorAll('[data-svp]').forEach(x=>x.onclick=()=>openModal(x.dataset.svp));
  const ok=c.querySelector('[data-g1ok]'); if(ok)ok.onchange=()=>{ G1.ok=ok.checked; };
  c.querySelector('[data-g1sim]').onclick=async()=>{ const vor=g1Vorschlag(c); G1.vor=vor; G1.simBusy=true; G1.ok=false; g1ModellKarte();
    try{ const {data,error}=await SVB.sb.functions.invoke('rating',{body:{simulation:vor}}); if(error)throw new Error(error.message||'Simulation fehlgeschlagen'); if(!data||!data.simulation)throw new Error((data&&data.error)||'Keine Simulation');
      G1.sim=data; G1.simSig=JSON.stringify(vor); G1.simVor=vor; }catch(e){ kToast('⚠️ '+e.message); }
    G1.simBusy=false; g1ModellKarte(); };
  const sv=c.querySelector('[data-g1save]'); if(sv)sv.onclick=async()=>{ const vor=g1Vorschlag(c);
    if(JSON.stringify(vor)!==G1.simSig)return kToast('Die Werte wurden geändert: bitte erst neu simulieren');
    if(g1Gross(G1.sim)&&!G1.ok)return kToast('Bitte bestätigen, dass du die Auswirkungen geprüft hast');
    const b=c.querySelector('[data-g1b]').value.trim(); if(b.length<10)return kToast('Bitte kurz beschreiben, was sich ändert und warum');
    sv.disabled=true;
    try{ await v1Rpc('rating_modell_entwurf',{p:{version:c.querySelector('[data-g1v]').value.trim(),basis:g1Aktiv().basis,parameter:vor,beschreibung:b,
        simulation:{geaendert:G1.sim.geaendert,spieler:G1.sim.spieler,schnitt:G1.sim.schnitt,max_auf:G1.sim.max_auf,max_ab:G1.sim.max_ab}}});
      kToast('✓ Entwurf gespeichert. Aktivieren in der Liste der Versionen.'); G1.sim=null; G1.vor=null; G1.ok=false; await g1PrLaden(true); g1ModellKarte(); }catch(e){ kToast('⚠️ '+e.message); sv.disabled=false; } };
  c.querySelectorAll('[data-g1akt]').forEach(b=>b.onclick=async()=>{
    if(!b.classList.contains('sure')){ b.classList.add('sure'); b.textContent='Wirklich aktivieren? Alle Spieler werden neu gerechnet'; return; }
    b.disabled=true;
    try{ await v1Rpc('rating_modell_aktivieren',{p_version:b.dataset.g1akt,p_bestaetigt:true}); kToast('✓ Aktiviert. Die Neuberechnung läuft etwa eine Minute.');
      await g1PrLaden(true); await v1ModellKarte(); }catch(e){ kToast('⚠️ '+e.message); b.disabled=false; } });
}
{ const _mk49=v1ModellKarte; v1ModellKarte=async function(){ const r=await _mk49.apply(this,arguments); try{ g1ModellKarte(); }catch(e){ console.warn('Modellprüfung',e); } return r; }; }

(function(){ try{ const s=document.createElement('style'); s.id='svm46css'; s.textContent="/* Umbau V1, Pakete D und E · Kader (Planung, Kaderübersicht, Top-Elf) und Scouting (Bedarfe, Kandidaten, Entdecken) */\n.k1-kopf{display:flex;justify-content:space-between;align-items:flex-end;gap:12px;margin:2px 0 10px;}\n.k1-kopf h2{margin:0;font-family:var(--disp);font-size:22px;color:var(--ink);}\n.k1-kopf p{margin:2px 0 0;color:var(--ink3);font-size:13px;}\n.k1-leiste{display:flex;flex-wrap:wrap;gap:8px 14px;align-items:center;margin:0 0 10px;}\n.k1-leiste label{display:inline-flex;align-items:center;gap:6px;font-size:12.5px;font-weight:700;color:var(--ink3);}\n.k1-leiste select,.k1-leiste input{min-height:34px;border-radius:10px;border:1px solid var(--line);background:var(--surface);color:var(--ink);padding:4px 8px;font:inherit;font-size:13.5px;}\n.k1-seg{display:inline-flex;border:1px solid var(--line);border-radius:12px;overflow:hidden;background:var(--surface);}\n.k1-seg button{border:0;background:transparent;color:var(--ink2);font:inherit;font-size:13px;font-weight:700;padding:7px 12px;cursor:pointer;min-height:34px;}\n.k1-seg button+button{border-left:1px solid var(--line);}\n.k1-seg button.on{background:var(--brand2);color:#fff;}\n.k1-sys{font-weight:800;color:var(--ink2);font-size:13px;}\n.k1-zeile{display:flex;flex-wrap:wrap;gap:4px 8px;align-items:center;font-size:13.5px;color:var(--ink2);margin:0 0 12px;}\n.k1-zeile b{color:var(--ink);font-variant-numeric:tabular-nums;}\n.k1-zeile i{font-style:normal;color:var(--line2);}\n.k1-ann{display:inline-block;font-style:normal;font-size:11px;font-weight:700;color:var(--v1-mittel);border:1px dashed color-mix(in srgb,var(--v1-mittel) 60%,transparent);border-radius:999px;padding:1px 7px;}\n.k1-grid{display:grid;grid-template-columns:minmax(0,1.05fr) minmax(0,1fr);gap:12px;align-items:start;}\n.k1-seite{display:flex;flex-direction:column;gap:12px;min-width:0;}\n.k1-seite>.card,.k1-grid>.card{margin:0;}\n@media (max-width:860px){.k1-grid{grid-template-columns:1fr;}}\n.k1-pitch{position:relative;width:100%;max-width:520px;margin:6px auto;aspect-ratio:68/88;border-radius:14px;overflow:hidden;\n  background:linear-gradient(180deg,#1f6f43 0%,#1b6a3f 50%,#1f6f43 100%);border:2px solid rgba(255,255,255,.55);}\n.k1-l{position:absolute;border:2px solid rgba(255,255,255,.45);pointer-events:none;}\n.k1-l.mid{left:0;right:0;top:50%;height:0;border-width:2px 0 0;}\n.k1-l.kreis{left:50%;top:50%;width:24%;aspect-ratio:1;border-radius:50%;transform:translate(-50%,-50%);}\n.k1-l.box{left:25%;right:25%;height:14%;}\n.k1-l.box.o{top:-2px;border-top:0;} .k1-l.box.u{bottom:-2px;border-bottom:0;}\n.k1-slot{position:absolute;transform:translate(-50%,-50%);display:flex;flex-direction:column;align-items:center;gap:1px;width:74px;padding:4px 2px;\n  border:0;border-radius:10px;background:rgba(10,20,30,.62);color:#fff;font:inherit;cursor:pointer;line-height:1.1;}\n.k1-slot b{font-family:var(--disp);font-size:17px;font-weight:800;font-variant-numeric:tabular-nums;}\n.k1-slot span{font-size:11.5px;font-weight:700;max-width:70px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;}\n.k1-slot small{font-size:11px;opacity:.8;white-space:nowrap;}\n.k1-slot.leer{background:rgba(255,255,255,.12);border:2px dashed rgba(255,255,255,.7);}\n.k1-slot.kand{background:rgba(10,20,30,.4);border:2px dashed #fbbf24;}\n.k1-slot.fix{box-shadow:0 0 0 2px #fff inset;}\n.k1-slot.aus{box-shadow:0 0 0 2px #f59e0b inset;}\n.k1-slot:focus-visible{outline:3px solid #fff;outline-offset:2px;}\n@media (max-width:480px){.k1-slot{width:58px}.k1-slot b{font-size:14px}.k1-slot span{font-size:11px;max-width:56px}.k1-slot small{display:none}}\n.k1-b{border:1px solid var(--line);border-left-width:4px;border-radius:12px;padding:9px 11px;margin:8px 0;background:var(--surface);}\n.k1-b.ext-offen{border-left-color:var(--v1-ab);} .k1-b.ext-teilweise{border-left-color:var(--v1-mittel);} .k1-b.ext-gedeckt{border-left-color:var(--v1-hoch);}\n.k1-bh{display:flex;justify-content:space-between;gap:8px;align-items:baseline;}\n.k1-bh b{color:var(--ink);font-size:14px;}\n.k1-b p{margin:4px 0;color:var(--ink2);font-size:13px;line-height:1.4;}\n.k1-c{font-size:11.5px;font-weight:700;color:var(--ink3);white-space:nowrap;}\n.k1-int{margin:4px 0 6px;padding-left:18px;font-size:13px;color:var(--ink2);}\n.k1-int li{margin:2px 0;} .k1-int small{color:var(--ink3);}\n.k1-st{display:inline-block;font-size:11px;font-weight:800;border-radius:6px;padding:1px 6px;background:var(--surface2);color:var(--ink2);}\n.k1-st.team{color:var(--v1-hoch);} .k1-st.zweite{color:var(--brand2);} .k1-st.jugend{color:var(--v1-mittel);}\n.k1-oe{display:flex;align-items:center;gap:8px;padding:6px 0;border-bottom:1px solid var(--line);font-size:13.5px;}\n.k1-oe:last-child{border-bottom:0;}\n.k1-oe>span{flex:1 1 auto;min-width:0;overflow:hidden;text-overflow:ellipsis;}\n.k1-oe small{color:var(--ink3);flex:0 1 auto;}\n.k1-oe b{font-variant-numeric:tabular-nums;}\n.k1-tw{overflow-x:auto;-webkit-overflow-scrolling:touch;}\n.k1-t{width:100%;border-collapse:collapse;font-size:13.5px;}\n.k1-t th{text-align:left;font-size:11.5px;font-weight:800;color:var(--ink3);text-transform:uppercase;letter-spacing:.04em;padding:6px 6px;border-bottom:1px solid var(--line2);white-space:nowrap;}\n.k1-t td{padding:6px 6px;border-bottom:1px solid var(--line);vertical-align:middle;color:var(--ink2);}\n.k1-t td b{color:var(--ink);font-variant-numeric:tabular-nums;}\n.k1-t select{min-height:32px;border-radius:8px;border:1px solid var(--line);background:var(--surface);color:var(--ink);font:inherit;font-size:13px;padding:2px 4px;max-width:150px;}\n.k1-sort{border:0;background:none;color:inherit;font:inherit;text-transform:inherit;letter-spacing:inherit;cursor:pointer;padding:0;}\n.k1-sort.on{color:var(--ink);}\n.k1-wahl{display:grid;grid-template-columns:repeat(auto-fill,minmax(150px,1fr));gap:8px;margin:10px 0;max-height:55vh;overflow:auto;}\n.k1-w{display:flex;flex-direction:column;align-items:flex-start;gap:2px;padding:8px 10px;border:1px solid var(--line);border-radius:10px;background:var(--surface);color:var(--ink);font:inherit;cursor:pointer;text-align:left;}\n.k1-w b{font-family:var(--disp);font-size:18px;} .k1-w small{color:var(--ink3);font-size:11.5px;}\n.k1-w.on{border-color:var(--brand2);box-shadow:0 0 0 2px var(--brand2) inset;}\n.k1-ju summary{list-style:none;cursor:pointer;} .k1-ju summary::-webkit-details-marker{display:none;}\n.k1-chip{border:1px solid var(--line);background:var(--surface2);color:var(--ink2);border-radius:999px;padding:3px 9px;font:inherit;font-size:12px;cursor:pointer;margin:2px 0;}\n\n/* Scouting */\n.s1-grid{display:grid;grid-template-columns:minmax(0,320px) minmax(0,1fr);gap:12px;align-items:start;}\n@media (max-width:860px){.s1-grid{grid-template-columns:1fr;}}\n.s1-liste{display:flex;flex-direction:column;gap:6px;margin:0;}\n.s1-bl{display:flex;flex-direction:column;gap:2px;text-align:left;border:1px solid var(--line);border-left-width:4px;border-radius:12px;padding:8px 10px;background:var(--surface);color:var(--ink);font:inherit;cursor:pointer;}\n.s1-bl.on{box-shadow:0 0 0 2px var(--brand2) inset;}\n.s1-bl.ext-offen{border-left-color:var(--v1-ab);} .s1-bl.ext-teilweise{border-left-color:var(--v1-mittel);} .s1-bl.ext-gedeckt{border-left-color:var(--v1-hoch);}\n.s1-bl b{font-size:13.5px;} .s1-bl small{color:var(--ink3);font-size:12px;}\n.s1-gruppe{font-size:11.5px;font-weight:800;color:var(--ink3);text-transform:uppercase;letter-spacing:.05em;margin:8px 2px 0;}\n.s1-kv{display:flex;flex-wrap:wrap;gap:6px;margin:6px 0;}\n.s1-krit{display:flex;flex-direction:column;gap:4px;font-size:13px;color:var(--ink2);margin:6px 0;}\n.s1-krit span b{color:var(--ink);}\n.s1-m{display:grid;grid-template-columns:44px minmax(0,1fr) auto;gap:4px 10px;align-items:center;padding:9px 0;border-bottom:1px solid var(--line);}\n.s1-m:last-child{border-bottom:0;}\n.s1-ca{width:42px;height:42px;border-radius:50%;display:flex;align-items:center;justify-content:center;font-family:var(--disp);font-weight:800;font-size:17px;border:2px solid var(--v1-niedrig);color:var(--ink);font-variant-numeric:tabular-nums;}\n.s1-ca.s-hoch{border-color:var(--v1-hoch);} .s1-ca.s-mittel{border-color:var(--v1-mittel);} .s1-ca.s-niedrig{border-style:dashed;}\n.s1-mt{min-width:0;display:flex;flex-direction:column;gap:3px;}\n.s1-mt>b{font-size:14px;color:var(--ink);} .s1-mt>small{color:var(--ink3);font-size:12px;}\n.s1-mt p{margin:0;font-size:12.5px;color:var(--ink2);line-height:1.4;}\n.s1-ma{display:flex;flex-direction:column;gap:4px;align-items:flex-end;}\n.s1-emp{font-size:12px;font-weight:800;color:var(--brand2);}\n.s1-pipe{display:grid;grid-template-columns:repeat(4,minmax(220px,1fr));gap:10px;overflow-x:auto;padding-bottom:4px;}\n.s1-sp{background:var(--surface2);border:1px solid var(--line);border-radius:14px;padding:8px;min-height:80px;}\n.s1-sp h4{margin:2px 4px 8px;font-size:12px;font-weight:800;text-transform:uppercase;letter-spacing:.05em;color:var(--ink3);display:flex;justify-content:space-between;}\n.s1-k{display:flex;flex-direction:column;gap:3px;width:100%;text-align:left;border:1px solid var(--line);border-radius:10px;background:var(--surface);padding:8px 9px;margin:0 0 6px;font:inherit;color:var(--ink);cursor:pointer;}\n.s1-k b{font-size:13.5px;} .s1-k small{color:var(--ink3);font-size:11.5px;line-height:1.35;}\n.s1-k .s1-emp{font-size:11.5px;}\n.s1-k.faellig{border-color:var(--v1-mittel);}\n.s1-vgl{width:100%;border-collapse:collapse;font-size:13.5px;margin:8px 0;}\n.s1-vgl th,.s1-vgl td{padding:6px;border-bottom:1px solid var(--line);text-align:left;color:var(--ink2);}\n.s1-vgl th{color:var(--ink3);font-size:12px;font-weight:800;}\n.s1-vgl td b{color:var(--ink);}\n.s1-satz{margin:6px 0;padding-left:18px;font-size:13.5px;color:var(--ink2);line-height:1.5;}\n.s1-sig{display:inline-block;font-size:11.5px;font-weight:700;border-radius:999px;padding:2px 8px;margin:2px 4px 2px 0;background:color-mix(in srgb,var(--v1-auf) 14%,transparent);color:var(--ink2);}\n.s1-fm{display:grid;grid-template-columns:repeat(auto-fill,minmax(180px,1fr));gap:8px 12px;margin:10px 0;}\n.s1-fm label{display:flex;flex-direction:column;gap:3px;font-size:12px;font-weight:700;color:var(--ink3);}\n.s1-fm select,.s1-fm input,.s1-fm textarea{min-height:34px;border-radius:10px;border:1px solid var(--line);background:var(--surface);color:var(--ink);font:inherit;font-size:13.5px;padding:4px 8px;}\n.s1-fm textarea{min-height:70px;grid-column:1/-1;}\n.s1-fm .w{grid-column:1/-1;}\n.s1-hin{border-left:4px solid var(--v1-mittel);}\n\n/* Mannschaft (Paket F) */\n.f1-grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(260px,1fr));gap:12px;align-items:start;}\n.f1-grid>.card{margin:0;}\n.f1-gr{margin:2px 0;font-family:var(--disp);font-size:20px;font-weight:800;color:var(--ink);}\n.f1-tl{display:flex;flex-direction:column;gap:6px;}\n.f1-te{display:grid;grid-template-columns:150px minmax(0,1fr);gap:2px 10px;padding:7px 10px;border-radius:10px;border-left:4px solid var(--v1-mittel);background:var(--surface2);font-size:13.5px;}\n.f1-te.verletzt{border-left-color:var(--v1-ab);}\n.f1-te small{grid-column:2;color:var(--ink3);}\n.f1-dt{grid-row:span 2;font-weight:700;color:var(--ink2);font-variant-numeric:tabular-nums;}\n@media (max-width:520px){.f1-te{grid-template-columns:1fr}.f1-dt{grid-row:auto}.f1-te small{grid-column:1}}\n/* Admin (Paket G) */\n.g1-t td small{color:var(--ink3);}\n.g1-warn{border-left:4px solid var(--v1-ab);}\n#panel-kplan,#panel-kueber,#panel-topelf,#panel-sbedarf,#panel-skand,#panel-entdecken{min-width:0;max-width:100%;}\n.s1-pipe{max-width:100%;}\n.k1-oe select{min-width:0;max-width:42vw;min-height:32px;border-radius:8px;border:1px solid var(--line);background:var(--surface);color:var(--ink);font:inherit;font-size:12.5px;}\n@media (max-width:600px){.s1-pipe{grid-template-columns:repeat(4,minmax(200px,82vw));}}\n.k1-leiste label{max-width:100%;min-width:0;flex-wrap:wrap;}\n.k1-leiste select{min-width:0;max-width:100%;}\n/* 0.99: Legende unter der Kaderübersicht */\n.k1-leg{margin-top:10px;border-top:1px solid var(--line);padding-top:8px;}\n.k1-leg summary{display:flex;align-items:center;gap:8px;min-height:44px;cursor:pointer;font-weight:800;font-size:13.5px;color:var(--ink);list-style:none;}\n.k1-leg summary::-webkit-details-marker{display:none;}\n.k1-leg summary svg{width:16px;height:16px;flex:none;color:var(--ink3);}\n.k1-leg p{max-width:72ch;margin:0 0 8px;font-size:13.5px;line-height:1.5;color:var(--ink2);}\n"; document.head.appendChild(s); }catch(e){} })();
/* =====================================================================
   Sportzentrale Beta 0.53 · „Als App installieren“ und „Mitteilungen einschalten“ (Wunsch Albert, 23.10.2026)
   Dezentes Blatt von unten, vor allem auf dem Handy. Wegwischen nach unten, Kreuz oder „Später“ schließt es.
   Es kommt wieder, aber mit wachsendem Abstand (1, 2, dann alle 3 Tage), nie über einem offenen Fenster und
   nie in den ersten Sekunden. Auch schon auf der Anmeldeseite, damit man sich gleich in der App anmeldet. Läuft die Seite schon als App, wird stattdessen zu Mitteilungen eingeladen.
   - Android und Chrome/Edge: echter Installieren-Knopf (beforeinstallprompt)
   - iPhone/iPad: kurze Anleitung „Teilen, Zum Home-Bildschirm“ mit Symbol
   - andere Browser: Hinweis auf das Browsermenü
   Gespeichert wird nur auf diesem Gerät (localStorage), keine personenbezogenen Daten.
   ===================================================================== */
const I1={ev:window.__svBip||null,offen:false,el:null,gezeigt:false,timer:null};
const I1_KEY='sv_i1';
const I1_ABSTAND=[1,2,3];                    // Tage bis zum nächsten Mal, danach immer der letzte Wert
function i1Lesen(){ try{ return JSON.parse(localStorage.getItem(I1_KEY)||'{}')||{}; }catch(e){ return {}; } }
function i1Schreiben(o){ try{ localStorage.setItem(I1_KEY,JSON.stringify(o)); }catch(e){} }
function i1Handy(){ try{ return /iPhone|iPod|Android/.test(navigator.userAgent)||(navigator.maxTouchPoints>1&&/Macintosh/.test(navigator.userAgent))||matchMedia('(max-width:820px) and (pointer:coarse)').matches; }catch(e){ return false; } }
function i1IOS(){ try{ return svIsIOS(); }catch(e){ return /iPad|iPhone|iPod/.test(navigator.userAgent); } }
function i1App(){ try{ return avApp(); }catch(e){ try{ return svStandalone(); }catch(x){ return false; } } }
function i1Angemeldet(){ try{ return document.getElementById('gate').classList.contains('done')&&typeof _remoteDone!=='undefined'&&_remoteDone&&typeof SVU!=='undefined'&&!!SVU; }catch(e){ return false; } }
function i1Frei(){ // nichts anderes offen: kein Fenster, kein Update-Hinweis, keine Tastatur
  try{ const ov=document.getElementById('overlay'); if(ov&&ov.classList.contains('open'))return false;
    const a=document.activeElement; if(a&&/^(INPUT|TEXTAREA|SELECT)$/.test(a.tagName)&&a.offsetParent!==null&&!a.closest('#gate.done'))return false; }catch(e){}   // 0.74: ein verstecktes Anmeldefeld zählt nicht
  return document.visibilityState==='visible';
}
// 0.74: Besuche zählen. Beim allerersten Besuch kommt kein Blatt, erst ab dem zweiten (Apple: Berechtigungen und Install erst, wenn man die App kennt)
{ try{ const o=i1Lesen(); o.besuche=(o.besuche||0)+1; i1Schreiben(o); }catch(e){} }
function i1Faellig(art){ const o=i1Lesen(), s=o[art]||{}; if(s.fertig)return false; if((o.besuche||0)<2)return false; if(!s.naechst)return true; return Date.now()>=s.naechst; }
function i1Spaeter(art){ const o=i1Lesen(), s=o[art]||{n:0}; s.n=(s.n||0)+1; const tage=I1_ABSTAND[Math.min(s.n-1,I1_ABSTAND.length-1)];
  s.naechst=Date.now()+tage*864e5; o[art]=s; i1Schreiben(o); }
function i1Fertig(art){ const o=i1Lesen(); o[art]=Object.assign(o[art]||{},{fertig:true}); i1Schreiben(o); }

// Android/Chrome: den Installieren-Dialog für später aufheben
window.addEventListener('beforeinstallprompt',e=>{ e.preventDefault(); I1.ev=e; window.__svBip=e; });
window.addEventListener('appinstalled',()=>{ I1.ev=null; i1Fertig('app'); i1Zu(); try{ kToast('📲 Installiert. Ab jetzt einfach über das Symbol starten'); }catch(e){} });

async function i1Art(){
  if(!i1App()){
    if(!(i1Handy()||I1.ev))return null;           // am Computer nur, wenn der Browser wirklich installieren kann
    return i1Faellig('app')?'app':null;
  }
  // läuft als App: Mitteilungen anbieten, wenn möglich und noch aus
  try{ if(!svPushSupported()||Notification.permission==='denied')return null;
    const st=await svPushState(); if(st==='on'){ i1Fertig('push'); return null; } if(st!=='off')return null; }catch(e){ return null; }
  return i1Faellig('push')?'push':null;
}
function i1Inhalt(art){
  const vorteile=`<ul class="i1-vt"><li>${SVI('bell')}<span>Mitteilungen bei Abstimmungen, Kandidaten und Neuigkeiten</span></li>
    <li>${SVI('check')}<span>Startet sofort, ohne Adressleiste, bleibt angemeldet</span></li><li>${SVI('refresh')}<span>Aktualisiert sich von selbst</span></li></ul>`;
  if(art==='push')return `<div class="i1-kopf"><div class="i1-ic">${SVI('bell')}</div><div><b>Mitteilungen einschalten?</b><small>Damit du Abstimmungen, Erinnerungen und Neuigkeiten direkt aufs Handy bekommst.</small></div></div>
    <div class="i1-knoepfe"><button class="btn" type="button" data-i1="push">${SVI('bell')} Einschalten</button><button class="btn ghost" type="button" data-i1="spaeter">Später</button></div>`;
  let wie;
  if(I1.ev)wie=`<div class="i1-knoepfe"><button class="btn" type="button" data-i1="install">📲 Jetzt installieren</button><button class="btn ghost" type="button" data-i1="spaeter">Später</button></div>`;
  else if(i1IOS())wie=`<ol class="i1-schritte"><li>Unten auf <b>Teilen</b> tippen <span class="i1-teilen" aria-hidden="true"><svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 3v12"/><path d="M8 7l4-4 4 4"/><path d="M5 12v7a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2v-7"/></svg></span></li>
      <li><b>„Zum Home-Bildschirm“</b> wählen und bestätigen</li><li>Ab dann über das neue Symbol öffnen und dort einmal anmelden</li></ol>
    <div class="i1-knoepfe"><button class="btn ghost" type="button" data-i1="spaeter">Später</button><button class="btn ghost" type="button" data-i1="habs">Erledigt</button></div>`;
  else wie=`<ol class="i1-schritte"><li>Oben rechts das <b>Browsermenü</b> öffnen (⋮)</li><li><b>„App installieren“</b> oder <b>„Zum Startbildschirm hinzufügen“</b> wählen</li></ol>
    <div class="i1-knoepfe"><button class="btn ghost" type="button" data-i1="spaeter">Später</button><button class="btn ghost" type="button" data-i1="habs">Erledigt</button></div>`;
  return `<div class="i1-kopf"><div class="i1-ic"><img src="icon-192.png" alt="" width="40" height="40"></div><div><b>Sportzentrale als App</b><small>Auf dem Handy viel bequemer, und nur so kommen Mitteilungen an.</small></div></div>${vorteile}${wie}`;
}
async function i1Zeigen(force){
  if(I1.offen)return; const art=force||await i1Art(); if(!art)return;
  if(!force&&(!i1Frei()||(art==='push'&&!i1Angemeldet())))return;   // Installieren auch schon vor der Anmeldung (iPhone: App hat eigene Anmeldung)
  let el=I1.el; if(!el){ el=document.createElement('div'); el.id='i1blatt'; el.className='i1-blatt'; el.setAttribute('role','dialog'); el.setAttribute('aria-modal','false');
    document.body.appendChild(el); I1.el=el; }
  el.dataset.art=art; el.setAttribute('aria-label',art==='push'?'Mitteilungen einschalten':'Als App installieren');
  el.innerHTML=`<div class="i1-griff" aria-hidden="true"></div><button class="i1-x" type="button" data-i1="spaeter" aria-label="Schließen">×</button>${i1Inhalt(art)}`;
  el.querySelectorAll('[data-i1]').forEach(b=>b.onclick=()=>i1Aktion(b.dataset.i1,b));
  i1Wischen(el);
  I1.offen=true; I1.gezeigt=true; el.style.transform='';
  requestAnimationFrame(()=>el.classList.add('auf'));
}
function i1Zu(){ const el=I1.el; if(!el)return; el.classList.remove('auf'); el.style.transform=''; I1.offen=false; }
async function i1Aktion(k,b){
  const art=I1.el&&I1.el.dataset.art;
  if(k==='spaeter'){ i1Spaeter(art); i1Zu(); return; }
  if(k==='habs'){ i1Spaeter(art); i1Zu(); try{ kToast('Danke! Öffne die Sportzentrale ab jetzt über das Symbol auf dem Startbildschirm'); }catch(e){} return; }
  if(k==='install'&&I1.ev){ const ev=I1.ev; I1.ev=null; window.__svBip=null; try{ ev.prompt(); const r=await ev.userChoice; if(r&&r.outcome==='accepted'){ i1Fertig('app'); i1Zu(); } else { i1Spaeter('app'); i1Zu(); } }catch(e){ i1Spaeter('app'); i1Zu(); } return; }
  if(k==='push'){ b.disabled=true; let ok=false; try{ ok=await svPushOn(); }catch(e){ try{ kToast('⚠️ '+e.message); }catch(x){} }
    if(ok)i1Fertig('push'); else i1Spaeter('push'); i1Zu(); }
}
// Nach unten wischen schließt (wie ein Blatt), kleines Ziehen springt zurück
function i1Wischen(el){
  if(el.dataset.wisch)return; el.dataset.wisch='1'; let y0=null,dy=0;
  el.addEventListener('touchstart',e=>{ if(e.target.closest('button,a,input'))return; y0=e.touches[0].clientY; dy=0; el.style.transition='none'; },{passive:true});
  el.addEventListener('touchmove',e=>{ if(y0==null)return; dy=Math.max(0,e.touches[0].clientY-y0); el.style.transform=`translate(-50%,${dy}px)`; },{passive:true});
  el.addEventListener('touchend',()=>{ if(y0==null)return; el.style.transition=''; if(dy>70){ i1Spaeter(el.dataset.art); i1Zu(); } else el.style.transform=''; y0=null; });
}
document.addEventListener('keydown',e=>{ if(e.key==='Escape'&&I1.offen){ i1Spaeter(I1.el.dataset.art); i1Zu(); } });
// Prüfen: kurz nach dem Start, beim Zurückkehren in die App und alle paar Minuten, solange nichts im Weg ist
function i1Pruefen(){ if(I1.offen||I1.gezeigt)return; i1Zeigen().catch(()=>{}); }
setTimeout(()=>{ i1Pruefen(); I1.timer=setInterval(i1Pruefen,120000); },20000);   // 0.74: frühestens nach 20 Sekunden, nicht über den ersten Bildschirm
document.addEventListener('visibilitychange',()=>{ if(document.visibilityState==='visible'){ I1.gezeigt=false; setTimeout(i1Pruefen,6000); } });

(function(){ try{ const s=document.createElement('style'); s.id='svm50css'; s.textContent="/* Beta 0.53 · Blatt „Als App installieren“ / „Mitteilungen einschalten“: dezent von unten, wegwischbar */\n.i1-blatt{position:fixed;left:50%;bottom:0;z-index:9000;width:min(520px,100%);box-sizing:border-box;transform:translate(-50%,110%);\n  transition:transform .32s cubic-bezier(.2,.8,.2,1);background:var(--surface);color:var(--ink);border:1px solid var(--line);border-bottom:0;\n  border-radius:20px 20px 0 0;box-shadow:0 -12px 40px -16px rgba(0,0,0,.45);padding:10px 16px calc(14px + env(safe-area-inset-bottom,0px));}\n.i1-blatt.auf{transform:translate(-50%,0);}\n.i1-griff{width:40px;height:5px;border-radius:3px;background:var(--line2);margin:0 auto 10px;}\n.i1-x{position:absolute;top:8px;right:10px;width:34px;height:34px;border:0;border-radius:50%;background:transparent;color:var(--ink3);font-size:22px;line-height:1;cursor:pointer;}\n.i1-x:focus-visible{outline:2px solid var(--brand2);}\n.i1-kopf{display:flex;gap:12px;align-items:center;padding-right:30px;}\n.i1-kopf b{display:block;font-size:15.5px;color:var(--ink);}\n.i1-kopf small{display:block;font-size:13px;color:var(--ink2);line-height:1.35;margin-top:2px;}\n.i1-ic{flex:0 0 44px;width:44px;height:44px;border-radius:12px;display:flex;align-items:center;justify-content:center;background:var(--surface2);overflow:hidden;}\n.i1-ic img{width:40px;height:40px;border-radius:10px;}\n.i1-vt{list-style:none;margin:10px 0 4px;padding:0;display:flex;flex-direction:column;gap:5px;}\n.i1-vt li{display:flex;gap:8px;align-items:center;font-size:13px;color:var(--ink2);}\n.i1-vt li svg{width:16px;height:16px;flex:0 0 16px;color:var(--brand2);}\n.i1-schritte{margin:8px 0 4px;padding-left:20px;font-size:13.5px;color:var(--ink2);line-height:1.5;}\n.i1-teilen{display:inline-flex;vertical-align:middle;color:var(--brand2);}\n.i1-knoepfe{display:flex;gap:8px;margin-top:10px;}\n.i1-knoepfe .btn{flex:1 1 0;justify-content:center;min-height:42px;}\n@media (min-width:821px){.i1-blatt{bottom:16px;border-radius:18px;border-bottom:1px solid var(--line);}}\n@media (prefers-reduced-motion:reduce){.i1-blatt{transition:none;}}\n"; document.head.appendChild(s); }catch(e){} })();
/* =====================================================================
   Sportzentrale Beta 0.54 · Nutzung verstehen (Wunsch Albert, 23.10.2026)
   1) Protokoll: welche Seiten und Unterseiten, wie lange (nur sichtbare Zeit), welche Aktionen (nur der Name der Aktion,
      nie Inhalte), wie Hinweise ankommen (gezeigt, angenommen, später). Gesammelt und alle 60 Sekunden gemeldet.
   2) Klick-Heatmap je Seite: nur zusammengezählt, ohne Person, in einem groben Raster (20 × 60).
   3) Admin-Dashboard „Nutzung“: Aktive, Zeit, App, Mitteilungen, Erste Schritte, Bereiche, Personen mit Nutzertyp,
      ungenutzte Funktionen, Hinweise, Heatmap direkt auf der Seite.
   Jede Person sieht unter Mein Konto, was erfasst wird, und kann es abschalten. Aufbewahrung solange der Zugang besteht (Wunsch Albert 24.10.: Daten dauerhaft für die Vereinsarbeit, keine Löschfrist; beim Löschen des Zugangs fallen sie per Fremdschlüssel weg).
   ===================================================================== */
const N2={e:{},s:{},h:{},cur:null,t0:Date.now(),aus:false,me:null,meP:null,timer:null,daten:null,tage:30,offen:null,heat:null,sort:'last'};
const N2_AKTIONEN=/^(eye_v1_speichern|rating_pruefung_neu|kandidat_v1_set|kader_plan_v1_set|bedarf_v1_kriterien|training_save|push_sub|rating_modell_entwurf|rating_modell_aktivieren|funktion_setzen|rating_neu_berechnen|daten_entscheiden|spieler_zusammenfuehren)$|(_save|_set|_speichern|_neu|_anlegen|_teilen|_senden|_erledigen)$/;
const N2_STILL=/^(nutzung_|lernen_|usage_|app_melden|my_usage)/;
const N2_BEREICH={home:'Übersicht',kplan:'Kader',kueber:'Kader',topelf:'Kader',kader:'Kader',elf:'Kader',sxi:'Kader',gespr:'Kader',kaderplan:'Kader',
  sbedarf:'Scouting',skand:'Scouting',entdecken:'Scouting',blick:'Scouting',scout:'Scouting',bedarf:'Scouting',kandidaten:'Scouting',radar:'Scouting',best:'Scouting',cmp:'Scouting',jugend:'Scouting',
  training:'Mannschaft',kabine:'Mannschaft',kasse:'Kasse',gegner:'Spieltag',totw:'Spieltag',play:'Wissen',model:'Wissen',verein:'Verein',admin:'Verwaltung',pruefung:'Verwaltung',nutzung:'Verwaltung',lernen:'Lernen'};
const n2E=s=>svEsc(s==null?'':String(s));
function n2Key(s){ return String(s||'').toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g,'').replace(/[^a-z0-9_:.-]/g,'').slice(0,60); }
function n2Ev(k,n){ if(N2.aus)return; k=n2Key(k); if(!/^[a-z]:./.test(k))return; N2.e[k]=(N2.e[k]||0)+(n||1); }
function n2Seite(){ try{ const t=svCurTab(); return n2Key(typeof sv4Sub==='function'?sv4Sub(t):t)||'home'; }catch(e){ return 'home'; } }
function n2Bereich(seite){ return N2_BEREICH[String(seite||'').split(':')[0]]||'Sonstiges'; }
function n2Zeit(){ const now=Date.now();
  if(N2.cur&&document.visibilityState==='visible'){ const d=Math.min(120,(now-N2.t0)/1000); if(d>0)N2.s['s:'+N2.cur]=(N2.s['s:'+N2.cur]||0)+d; }
  N2.t0=now; }
function n2Wechsel(){ n2Zeit(); const s=n2Seite(); if(s!==N2.cur){ N2.cur=s; n2Ev('v:'+s); } }
async function n2Melden(){
  n2Zeit(); if(N2.aus){ N2.e={}; N2.s={}; N2.h={}; return; }
  const s={}; Object.entries(N2.s).forEach(([k,v])=>{ const r=Math.round(v); if(r>=1)s[k]=Math.min(r,3600); });
  const h=Object.entries(N2.h).map(([k,n])=>{ const [seite,ger,gx,gy]=k.split('|'); return [seite,ger,+gx,+gy,Math.min(n,50)]; }).slice(0,200);
  const e=N2.e; if(!Object.keys(e).length&&!Object.keys(s).length&&!h.length)return;
  N2.e={}; N2.s={}; N2.h={};
  try{ if(!SVB||!SVB.sb)throw new Error('offline'); const {error}=await SVB.sb.rpc('nutzung_melden',{p:{e,s,h}}); if(error)throw error; }
  catch(x){ Object.entries(e).forEach(([k,n])=>N2.e[k]=(N2.e[k]||0)+n); Object.entries(s).forEach(([k,n])=>N2.s[k]=(N2.s[k]||0)+n); }
}
// Eigener Stand (Lernen, Schalter, schon genutzte Funktionen): einmal laden, von Onboarding und Tipps mitbenutzt
function n2Meine(force){
  if(N2.meP&&!force)return N2.meP;
  N2.meP=(async()=>{ try{ const {data,error}=await SVB.sb.rpc('lernen_meine'); if(error)throw error; N2.me=data||{}; N2.aus=!!(data&&data.nutzung_aus); }catch(e){ N2.me=N2.me||{}; } return N2.me; })();
  return N2.meP;
}
function n2Genutzt(keys){ const g=(N2.me&&N2.me.genutzt)||{}; return (keys||[]).some(k=>g[k]>0||N2.e[k]>0||(k.startsWith('v:')&&N2.cur===k.slice(2))); }

// ---------- Erfassen ----------
{ const _gt51=goTab; goTab=function(){ const r=_gt51.apply(this,arguments); setTimeout(n2Wechsel,0); return r; }; }
if(typeof trRender==='function'){ const _tr51=trRender; trRender=function(){ const r=_tr51.apply(this,arguments); setTimeout(n2Wechsel,0); return r; }; }
{ const _om51=openModal; openModal=function(){ n2Ev('a:profil'); return _om51.apply(this,arguments); }; }
document.addEventListener('click',e=>{
  if(N2.aus)return; try{
    const ov=document.getElementById('overlay'), fenster=ov&&ov.classList.contains('open');
    const seite=fenster?'fenster':n2Seite(), ger=innerWidth<=820?'handy':'gross';
    const gx=Math.max(0,Math.min(19,Math.floor(e.clientX/innerWidth*20)));
    const H=fenster?innerHeight:Math.max(document.documentElement.scrollHeight,innerHeight), y=fenster?e.clientY:e.clientY+scrollY;
    const gy=Math.max(0,Math.min(59,Math.floor(y/H*60)));
    const k=seite+'|'+ger+'|'+gx+'|'+gy; N2.h[k]=(N2.h[k]||0)+1;
  }catch(x){}
},{capture:true,passive:true});
function n2RpcHaken(){
  if(!SVB||!SVB.sb||SVB.sb.__n2)return; SVB.sb.__n2=true;
  const _rpc=SVB.sb.rpc.bind(SVB.sb);
  SVB.sb.rpc=function(fn){ try{ if(!N2_STILL.test(fn)&&N2_AKTIONEN.test(fn))n2Ev('r:'+fn); }catch(e){} return _rpc.apply(null,arguments); };
  try{ const f=SVB.sb.functions, _inv=f.invoke.bind(f); f.invoke=function(name,opt){ try{ const b=opt&&opt.body||{}; if(!b.simulation&&!b.trocken)n2Ev('f:'+name); }catch(e){} return _inv(name,opt); }; }catch(e){}
}
function n2Start(){
  if(N2.timer)return; n2RpcHaken(); n2Meine(); n2Wechsel();
  N2.timer=setInterval(()=>{ n2Wechsel(); n2Melden(); },60000);
  document.addEventListener('visibilitychange',()=>{ if(document.visibilityState==='hidden')n2Melden(); else N2.t0=Date.now(); });
  window.addEventListener('pagehide',()=>{ n2Melden(); });
  setTimeout(()=>{ try{ SVB.sb.rpc('nutzung_aufraeumen_anstossen'); }catch(e){} },30000);
}
setTimeout(function n2Warte(){ try{ if(document.getElementById('gate').classList.contains('done')&&typeof _remoteDone!=='undefined'&&_remoteDone){ n2Start(); return; } }catch(e){} setTimeout(n2Warte,2000); },1500);
// Hinweise der App (Installieren, Mitteilungen, Tipps): gezeigt, angenommen, später
if(typeof i1Zeigen==='function'){ const _z=i1Zeigen; i1Zeigen=async function(){ const vor=I1.offen; const r=await _z.apply(this,arguments); if(!vor&&I1.offen&&I1.el)n2Ev('t:'+I1.el.dataset.art+':zeigen'); return r; }; }
if(typeof i1Aktion==='function'){ const _a=i1Aktion; i1Aktion=function(k){ try{ if(I1.el)n2Ev('t:'+I1.el.dataset.art+':'+k); }catch(e){} return _a.apply(this,arguments); }; }

// ---------- Mein Konto: offen sagen, was erfasst wird, und abschalten können ----------
{ const _acc51=svAccount; svAccount=function(){ const r=_acc51.apply(this,arguments);
  try{ const M=document.getElementById('modal'); const sp=M&&M.querySelector('#svMyUse'); const sec=sp&&sp.closest('.editsec'); if(sec&&!sec.querySelector('.n2-schalter')){
    const d=document.createElement('div'); d.className='n2-schalter';
    d.innerHTML=`<div class="n2-zeile"><label class="jutog"><input type="checkbox" id="n2an"${N2.aus?'':' checked'}> Nutzungsstatistik zur Verbesserung der App</label><button type="button" class="lnk n2-ds">Datenschutzhinweise</button></div>`;
    sec.appendChild(d); d.querySelector('.n2-ds').onclick=()=>{ closeOverlay(); setTimeout(n2Datenschutz,80); };
    d.querySelector('#n2an').onchange=async e=>{ const aus=!e.target.checked; try{ const {error}=await SVB.sb.rpc('nutzung_einstellen',{p_aus:aus}); if(error)throw error; N2.aus=aus; if(N2.me)N2.me.nutzung_aus=aus;
      kToast(aus?'Nutzungsstatistik ist aus':'Nutzungsstatistik ist an'); }catch(x){ e.target.checked=!aus; kToast('⚠️ '+(x.message||x)); } };
  } }catch(e){ console.warn(e); }
  return r; }; }

// ---------- Datenschutzhinweise (in Mein Konto verlinkt) ----------
function n2Datenschutz(){
  const v=(window.VEREIN&&(window.VEREIN.name||window.VEREIN.kurz))||'der Verein';
  const M=svModal(`<div class="mhead"><div class="rm-ic" style="width:46px;height:46px">${SVI('shield')}</div><div><h2 style="margin:0">Datenschutzhinweise</h2><div class="msub">Sportzentrale · ${n2E(v)}</div></div></div>
    <div class="n2-dsx">
      <h4>Wer verarbeitet die Daten?</h4><p>${n2E(v)}, Fußballabteilung. Die Sportzentrale ist ein internes Werkzeug für Vorstand, Trainer, Planer und Jugend. Zugriff haben nur angemeldete Mitglieder mit ihrer Rolle.</p>
      <h4>Konto und Inhalte</h4><p>Name, E-Mail und Rolle für die Anmeldung. Alles, was du in der App einträgst (z. B. Trainings, Abstimmungen, Einschätzungen), dient der Arbeit im Verein und ist nur für Berechtigte sichtbar.</p>
      <h4>Nutzungsauswertung</h4><p>Damit wir die App verbessern und gezielt erklären können, werten wir aus, welche Bereiche und Funktionen wie oft und wie lange genutzt werden, wie Hinweise ankommen und welche Geräte die App nutzen. Inhalte und Eingaben werden dabei nicht erfasst. Tipp-Positionen werden nur zusammengezählt und ohne Bezug zur Person gespeichert. Einsehen kann die Auswertung nur der Admin. Rechtsgrundlage ist das berechtigte Interesse des Vereins an einer gut funktionierenden App (Art. 6 Abs. 1 lit. f DSGVO). Die Daten bleiben gespeichert, solange dein Zugang zur Sportzentrale besteht, weil wir sie dauerhaft für die Vereinsarbeit brauchen. Wird dein Zugang gelöscht, werden sie mit gelöscht.</p>
      <h4>Dein Widerspruch</h4><p>Du kannst der Nutzungsauswertung jederzeit widersprechen: unter Mein Konto den Schalter „Nutzungsstatistik“ ausschalten oder dich an den Vorstand wenden.</p>
      <h4>Mitteilungen</h4><p>Wenn du Mitteilungen einschaltest, speichern wir die technische Adresse deines Geräts für den Versand. Ausschalten geht jederzeit unter Mein Konto.</p>
      <h4>Deine Rechte</h4><p>Du hast das Recht auf Auskunft, Berichtigung, Löschung, Einschränkung und Beschwerde bei der zuständigen Aufsichtsbehörde. Ansprechpartner ist der Vorstand der Abteilung.</p>
    </div><div class="btnrow"><button class="btn ghost" type="button" data-x>Schließen</button></div>`);
  M.querySelector('[data-x]').onclick=()=>closeOverlay();
}

// ---------- Funktionen, die je Rolle sinnvoll sind (Dashboard „ungenutzt“, Tipps, Onboarding) ----------
const N2_FUNK=[
  {id:'app',t:'Als App installiert',r:['admin','vorstand','planer','trainer','jugend','viewer','spieler','helfer'],k:['t:app:install']},
  {id:'push',t:'Mitteilungen an',r:['admin','vorstand','planer','trainer','jugend','spieler','helfer'],k:['r:push_sub','t:push:push']},
  {id:'kplan',t:'Kaderplanung',r:['admin','vorstand','planer'],k:['v:kplan']},
  {id:'topelf',t:'Top-Elf',r:['admin','vorstand','planer','trainer'],k:['v:topelf']},
  {id:'sbedarf',t:'Bedarfe',r:['admin','vorstand','planer'],k:['v:sbedarf']},
  {id:'skand',t:'Kandidaten-Pipeline',r:['admin','vorstand','planer'],k:['v:skand','r:kandidat_v1_set']},
  {id:'entdecken',t:'Entdecken (Markt, Radar)',r:['admin','vorstand','planer','trainer'],k:['v:entdecken']},
  {id:'eye',t:'Eye-Test abgeben',r:['admin','vorstand','planer','trainer'],k:['r:eye_v1_speichern']},
  {id:'pruefen',t:'Bewertung prüfen',r:['admin','vorstand','planer','trainer'],k:['r:rating_pruefung_neu']},
  {id:'mannschaft',t:'Mannschaft: Übersicht',r:['admin','trainer'],k:['v:training:uebersicht']},
  {id:'verf',t:'Verfügbarkeit',r:['admin','trainer'],k:['v:training:verf']},
  {id:'training',t:'Training erfassen',r:['admin','trainer'],k:['r:training_save']},
  {id:'abst',t:'Abstimmungen',r:['admin','trainer'],k:['v:kabine:abst']},
  {id:'profil',t:'Spielerprofil geöffnet',r:['admin','vorstand','planer','trainer','viewer'],k:['a:profil']}
];
function n2Relevant(role){ return N2_FUNK.filter(f=>f.r.includes(role)); }

// ---------- Admin-Dashboard ----------
function n2Panel(){ let P=document.getElementById('panel-nutzung'); if(P)return P; const ref=document.getElementById('panel-admin')||document.querySelector('main .panel'); if(!ref)return null;
  P=document.createElement('section'); P.className='panel'; P.id='panel-nutzung'; ref.parentNode.insertBefore(P,ref.nextSibling); return P; }
SV_TBL.nutzung=['chart','Nutzung'];
Object.assign(SV_PAGES,{nutzung:['Nutzung','Wer nutzt was, wie lange, und wo wir die App besser machen können']});
{ const _ta51=svTabAllowed; svTabAllowed=function(t){ if(t==='nutzung')return isAdmin(); return _ta51.apply(this,arguments); }; }
{ const _gt51b=goTab; goTab=function(tab){ if(tab==='nutzung')n2Panel(); const r=_gt51b.apply(this,arguments); try{ if(svCurTab()==='nutzung')n2Dashboard(); else n2HeatAus(); }catch(e){ console.warn('Nutzung',e); } return r; }; }
try{ svUseOpen=function(){ goTab('nutzung'); }; }catch(e){}
async function n2Laden(){ const {data,error}=await SVB.sb.rpc('admin_nutzung',{p_days:N2.tage}); if(error)throw new Error(error.message); N2.daten=data; return data; }
const n2Min=s=>{ s=+s||0; if(s<60)return s?'<1 Min':'0'; const m=Math.round(s/60); return m<60?m+' Min':Math.floor(m/60)+' Std '+(m%60?m%60+' Min':''); };
const N2_AKT={profil:'Spielerprofil geöffnet',eye_v1_speichern:'Eye-Test abgegeben',rating_pruefung_neu:'Bewertung geprüft',kandidat_v1_set:'Kandidat bearbeitet',kader_plan_v1_set:'Kaderplan geändert',
  bedarf_v1_kriterien:'Suchprofil angepasst',training_save:'Training erfasst',push_sub:'Mitteilungen eingeschaltet',coach:'Co-Trainer gefragt',rating:'Bewertung neu gerechnet'};
function n2AktText(k){ const t=k.slice(2), m=t.match(/^uebung:([a-z]+):(start|fertig)$/); if(m)return 'Übung '+((typeof O1_UEB!=='undefined'&&O1_UEB[m[1]])?O1_UEB[m[1]].t:m[1])+(m[2]==='fertig'?' geschafft':' begonnen');
  const s=t.match(/^schritt:(.+)$/); if(s)return 'Erste Schritte: '+s[1]; return N2_AKT[t]||t.replace(/[_:]/g,' '); }
const n2Tage=d=>{ if(!d)return 'nie'; const t=Math.floor((Date.now()-Date.parse(d))/864e5); return t<=0?'heute':t===1?'gestern':'vor '+t+' Tagen'; };
function n2Typ(u){
  const tage=+u.tageN||0, sek=+u.secsN||0, seit=u.created_at?(Date.now()-Date.parse(u.created_at))/864e5:999, zul=u.last_use?(Date.now()-Date.parse(u.last_use))/864e5:999;
  const akt=Object.keys(u.ev||{}).filter(k=>/^[ar]:/.test(k)&&k!=='a:profil').reduce((s,k)=>s+(u.ev[k][0]||0),0);
  if(!u.last_use)return {k:'nie',t:'Noch nie drin',d:'Hat sich noch nicht angemeldet oder die App nie benutzt.'};
  if(seit<14&&tage<3)return {k:'neu',t:'Neu',d:'Seit weniger als zwei Wochen dabei.'};
  if(zul>21)return {k:'inaktiv',t:'Eingeschlafen',d:`Seit ${Math.round(zul)} Tagen nicht mehr in der App.`};
  const leser=akt===0&&tage>=2;
  if(tage>=12||sek>=5*3600)return {k:'power',t:leser?'Viel lesend':'Stark dabei',d:`${tage} aktive Tage, ${n2Min(sek)} im Zeitraum.`};
  if(tage>=4)return {k:'regel',t:leser?'Regelmäßig, nur lesend':'Regelmäßig',d:`${tage} aktive Tage im Zeitraum.`};
  return {k:'selten',t:leser?'Schaut selten rein':'Gelegentlich',d:`${tage} aktive Tage im Zeitraum.`};
}
function n2Erste(u){ // Erste Schritte (Onboarding) in Prozent
  const L=u.lernen||{}, schritte=Object.keys(L).filter(k=>k.startsWith('s:')); const fertig=schritte.filter(k=>L[k]===true||L[k]==='ok').length;
  return L.fertig?100:(typeof o1Schritte==='function'?Math.round(fertig/Math.max(1,o1Schritte(u.role).length)*100):null); }
function n2Ungenutzt(u){ const je=new Set(u.je||[]), ev=u.ev||{};
  return n2Relevant(u.role).filter(f=>{ if(f.id==='app')return !(u.geraete||[]).some(g=>g.app); if(f.id==='push')return !u.push; return !f.k.some(k=>je.has(k)||ev[k]); }); }
function n2Hinweise(u){ const o={zeigen:0,ja:0,spaeter:0}; Object.entries(u.ev||{}).forEach(([k,v])=>{ if(!k.startsWith('t:'))return; const a=k.split(':').pop(), n=v[0]||0;
  if(a==='zeigen')o.zeigen+=n; else if(['install','push','ok','los'].includes(a))o.ja+=n; else if(['spaeter','weg','habs'].includes(a))o.spaeter+=n; }); return o; }
async function n2Dashboard(){
  const P=n2Panel(); if(!P)return; if(!isAdmin()){ P.innerHTML='<div class="card"><div class="empty">Nur für den Admin.</div></div>'; return; }
  if(!N2.daten||N2.daten.tage!==N2.tage){ P.innerHTML='<div class="card"><div class="empty">Nutzung wird geladen …</div></div>'; try{ await n2Laden(); }catch(e){ P.innerHTML=`<div class="card"><div class="empty">Nutzung lässt sich gerade nicht laden: ${n2E(e.message)}</div></div>`; return; } }
  await n2Melden().catch(()=>{});
  const D=N2.daten, L=(D.leute||[]).filter(u=>u.active!==false), n=L.length||1;
  const akt7=L.filter(u=>u.last_use&&(Date.now()-Date.parse(u.last_use))<7*864e5).length, aktN=L.filter(u=>u.tageN>0).length;
  const app=L.filter(u=>(u.geraete||[]).some(g=>g.app)).length, push=L.filter(u=>u.push).length, erst=L.filter(u=>(u.lernen||{}).fertig).length, aus=L.filter(u=>u.nutzung_aus).length;
  const sek7=L.reduce((s,u)=>s+(+u.secs7||0),0);
  const kpi=(z,t,sub,ton)=>`<div class="n2-kpi ${ton||''}"><b>${z}</b><span>${n2E(t)}</span>${sub?`<small>${n2E(sub)}</small>`:''}</div>`;
  // Bereiche: Zeit aus s:-Schlüsseln, Personen und Aufrufe
  const B={}; Object.entries(D.gesamt||{}).forEach(([k,[cnt,sec,leute]])=>{ if(!/^[sv]:/.test(k))return; const b=n2Bereich(k.slice(2)); B[b]=B[b]||{sec:0,auf:0,leute:0};
    if(k[0]==='s')B[b].sec+=sec; else { B[b].auf+=cnt; B[b].leute=Math.max(B[b].leute,leute); } });
  const BL=Object.entries(B).sort((a,b)=>b[1].sec-a[1].sec||b[1].auf-a[1].auf), bmax=Math.max(1,...BL.map(x=>x[1].sec));
  const sortF={last:(a,b)=>String(b.last_use||'').localeCompare(String(a.last_use||'')),zeit:(a,b)=>b.secsN-a.secsN,name:(a,b)=>String(a.name).localeCompare(String(b.name),'de')}[N2.sort];
  const LL=L.slice().sort(sortF);
  const trichter=[['Konto',L.length],['Schon drin',L.filter(u=>u.last_use).length],['Als App',app],['Mitteilungen an',push],['Erste Schritte fertig',erst]];
  const heatSeiten=Object.entries(D.heat||{}).map(([s,z])=>[s,z.reduce((a,x)=>a+x[3],0)]).sort((a,b)=>b[1]-a[1]);
  const HW=L.reduce((o,u)=>{ const h=n2Hinweise(u); o.zeigen+=h.zeigen; o.ja+=h.ja; o.spaeter+=h.spaeter; return o; },{zeigen:0,ja:0,spaeter:0});
  P.innerHTML=`<div class="n2">
    <div class="n2-kopf"><p>Zeitraum für Zeit, Tage und Bereiche</p>
      <div class="k1-seg">${[7,30,90].map(t=>`<button type="button" class="${N2.tage===t?'on':''}" data-n2t="${t}">${t} Tage</button>`).join('')}</div></div>
    <div class="n2-kpis">${kpi(akt7+' / '+L.length,'aktiv in 7 Tagen',aktN+' im Zeitraum')}${kpi(n2Min(sek7),'Zeit in 7 Tagen','alle zusammen')}${kpi(app+' / '+L.length,'als App installiert','',app<L.length?'warn':'')}${kpi(push+' / '+L.length,'Mitteilungen an','',push<L.length?'warn':'')}${kpi(erst+' / '+L.length,'Erste Schritte fertig')}</div>
    <div class="n2-grid">
      <div class="card n2-trichter"><h3 class="trh">${SVI('target')} Vom Konto bis zur vollen Nutzung</h3>
        ${trichter.map(([t,z])=>`<div class="n2-tr"><span>${n2E(t)}</span><i><i style="width:${Math.round(z/n*100)}%"></i></i><b>${z}</b></div>`).join('')}
        <p class="note small">Wer fehlt, steht unten in der Liste. Installieren und Mitteilungen bietet die App von selbst immer wieder an.</p></div>
      <div class="card"><h3 class="trh">${SVI('chart')} Bereiche <small>${N2.tage} Tage</small></h3>
        ${BL.length?BL.map(([b,x])=>`<div class="n2-tr"><span>${n2E(b)}</span><i><i style="width:${Math.round(x.sec/bmax*100)}%"></i></i><b>${n2Min(x.sec)}</b><small>${x.auf} Aufrufe · ${x.leute} Pers.</small></div>`).join(''):'<p class="note">Noch keine Daten. Die feinere Erfassung läuft ab Version 0.54.</p>'}</div>
    </div>
    <div class="card"><h3 class="trh">${SVI('users')} Personen <small>${L.length}${aus?` · ${aus} ohne Statistik`:''}</small></h3>
      <div class="k1-leiste"><div class="k1-seg">${[['last','Zuletzt'],['zeit','Zeit'],['name','Name']].map(([k,l])=>`<button type="button" class="${N2.sort===k?'on':''}" data-n2s="${k}">${l}</button>`).join('')}</div></div>
      <div class="n2-leute">${LL.map(u=>n2Person(u)).join('')}</div></div>
    <div class="n2-grid">
      <div class="card"><h3 class="trh">${SVI('eye')} Heatmap <small>wo getippt wird, ohne Person</small></h3>
        ${heatSeiten.length?`<div class="n2-heatl">${heatSeiten.slice(0,14).map(([s,z])=>`<button type="button" class="n2-hs" data-n2h="${n2E(s)}"><span>${n2E(s)}</span><b>${z}</b></button>`).join('')}</div>
          <p class="note small">Seite antippen: sie öffnet sich mit den Tipp-Punkten darüber. Antippen der Punkte schließt die Ansicht.</p>`:'<p class="note">Noch keine Klicks erfasst.</p>'}</div>
      <div class="card"><h3 class="trh">${SVI('bell')} Hinweise der App</h3>
        <div class="n2-tr"><span>gezeigt</span><b>${HW.zeigen}</b></div><div class="n2-tr"><span>angenommen</span><b>${HW.ja}</b></div><div class="n2-tr"><span>später / weggewischt</span><b>${HW.spaeter}</b></div>
        <p class="note small">Wer Hinweise oft wegwischt, bekommt sie seltener (der Abstand wächst von selbst).</p></div>
    </div>
    <p class="note small">Erfasst wird nur das Wo, Wie oft und Wie lange, nie Inhalte. Jede Person sieht das unter Mein Konto und kann es abschalten. Die Daten bleiben für die Vereinsarbeit erhalten, solange der Zugang besteht. Stand ${n2E(new Date(D.stand).toLocaleString('de-DE'))}.</p></div>`;
  P.querySelectorAll('[data-n2t]').forEach(b=>b.onclick=()=>{ N2.tage=+b.dataset.n2t; n2Dashboard(); });
  P.querySelectorAll('[data-n2s]').forEach(b=>b.onclick=()=>{ N2.sort=b.dataset.n2s; n2Dashboard(); });
  P.querySelectorAll('[data-n2p]').forEach(b=>b.onclick=()=>{ N2.offen=N2.offen===b.dataset.n2p?null:b.dataset.n2p; n2Dashboard(); });
  P.querySelectorAll('[data-n2h]').forEach(b=>b.onclick=()=>n2HeatZeigen(b.dataset.n2h));
}
function n2Person(u){
  const ty=n2Typ(u), un=n2Ungenutzt(u), hw=n2Hinweise(u), es=n2Erste(u), offen=N2.offen===u.id;
  const app=(u.geraete||[]).some(g=>g.app), ger=(u.geraete||[])[0];
  let detail='';
  if(offen){
    const tage=[]; for(let i=N2.tage-1;i>=0;i--){ const d=new Date(Date.now()-i*864e5); const k=new Intl.DateTimeFormat('sv-SE',{timeZone:'Europe/Berlin'}).format(d); tage.push([k,(u.tage||{})[k]||0]); }
    const tmax=Math.max(60,...tage.map(x=>x[1]));
    const ber={}; Object.entries(u.ev||{}).forEach(([k,[n,s]])=>{ if(k.startsWith('s:')){ const b=n2Bereich(k.slice(2)); ber[b]=(ber[b]||0)+s; } });
    if(!Object.keys(ber).length)Object.entries(u.views||{}).forEach(([k,n])=>{ const b=n2Bereich(k); ber[b]=(ber[b]||0)+n*60; });
    const BL=Object.entries(ber).sort((a,b)=>b[1]-a[1]), bm=Math.max(1,...BL.map(x=>x[1]));
    const akt=Object.entries(u.ev||{}).filter(([k])=>/^[raf]:/.test(k)).sort((a,b)=>b[1][0]-a[1][0]).slice(0,8);
    const tipp=un.length?`Sinnvoll für ${u.role==='trainer'?'einen Trainer':u.role==='planer'?'die Kaderplanung':'die Rolle'}, aber noch nie genutzt: ${un.map(f=>f.t).join(', ')}. Die App weist von selbst darauf hin; ein kurzer persönlicher Tipp wirkt meist besser.`:'Nutzt alle Funktionen, die für die Rolle wichtig sind.';
    detail=`<div class="n2-detail"><div class="n2-spark" title="Zeit je Tag">${tage.map(([d,s])=>`<i style="height:${Math.max(2,Math.round(s/tmax*100))}%" title="${n2E(d)}: ${n2Min(s)}"></i>`).join('')}</div>
      <div class="n2-grid"><div><h5>Wo die Zeit hingeht</h5>${BL.length?BL.map(([b,s])=>`<div class="n2-tr"><span>${n2E(b)}</span><i><i style="width:${Math.round(s/bm*100)}%"></i></i><b>${n2Min(s)}</b></div>`).join(''):'<p class="note small">Noch keine Daten.</p>'}</div>
        <div><h5>Häufigste Aktionen</h5>${akt.length?akt.map(([k,[n]])=>`<div class="n2-tr"><span>${n2E(n2AktText(k))}</span><b>${n}</b></div>`).join(''):'<p class="note small">Bisher nur gelesen.</p>'}</div></div>
      <p class="note small"><b>${n2E(ty.t)}:</b> ${n2E(ty.d)} ${n2E(tipp)}</p>
      <p class="note small">Gerät: ${ger?n2E([ger.app?'App':'Browser',ger.plattform,ger.build].filter(Boolean).join(' · ')):'unbekannt'} · Hinweise: ${hw.zeigen} gezeigt, ${hw.ja} angenommen, ${hw.spaeter} später${u.nutzung_aus?' · <b>Statistik abgeschaltet</b>':''}</p></div>`;
  }
  return `<div class="n2-p${offen?' offen':''}"><button type="button" class="n2-pz" data-n2p="${n2E(u.id)}" aria-expanded="${offen}">
      <span class="n2-pn"><b>${n2E(u.name||'?')}</b><small>${n2E(u.role)} · ${n2E(n2Tage(u.last_use))}</small></span>
      <span class="n2-typ t-${ty.k}">${n2E(ty.t)}</span>
      <span class="n2-pw"><b>${n2Min(u.secsN)}</b><small>${u.tageN} Tage</small></span>
      <span class="n2-ic" title="App / Mitteilungen"><i class="${app?'an':''}">📲</i><i class="${u.push?'an':''}">🔔</i></span>
      <span class="n2-pw"><b>${es==null?'?':es+' %'}</b><small>Erste Schritte</small></span>
      <span class="n2-pw"><b>${un.length}</b><small>ungenutzt</small></span></button>${detail}</div>`;
}
// ---------- Heatmap auf der echten Seite ----------
function n2HeatAus(){ document.getElementById('n2heat')?.remove(); }
function n2HeatZeigen(seite){
  const z=(N2.daten&&N2.daten.heat||{})[seite]||[]; if(!z.length)return;
  const [tab,sub]=seite.split(':');
  if(seite!=='fenster'){ if(tab==='training'&&sub)sv4Go(seite); else if(tab==='kabine'&&sub)sv4Go(seite); else goTab(tab); }
  setTimeout(()=>{
    n2HeatAus(); const ger=innerWidth<=820?'handy':'gross'; let pts=z.filter(x=>x[0]===ger); if(!pts.length)pts=z;
    const H=Math.max(document.documentElement.scrollHeight,innerHeight), mx=Math.max(...pts.map(x=>x[3]));
    const el=document.createElement('div'); el.id='n2heat'; el.className='n2-heat'; el.style.height=H+'px';
    el.innerHTML=pts.map(([g,gx,gy,n])=>{ const s=18+Math.round(n/mx*46); return `<i style="left:${(gx+.5)*5}%;top:${Math.round((gy+.5)/60*H)}px;width:${s}px;height:${s}px;opacity:${(.25+.6*n/mx).toFixed(2)}" title="${n} Tipps"></i>`; }).join('')
      +`<button type="button" class="n2-heat-x">Heatmap „${n2E(seite)}“ schließen · ${pts.reduce((a,x)=>a+x[3],0)} Tipps</button>`;
    document.body.appendChild(el); el.onclick=()=>n2HeatAus();
  },900);
}

/* =====================================================================
   Sportzentrale Beta 0.54 · Erste Schritte, Übungen und Tipps (Wunsch Albert, 23.10.2026)
   - „Deine ersten Schritte“ oben auf der Übersicht, je Rolle: App installieren, Mitteilungen, Rundgang und zwei bis drei
     Übungen zu den wichtigsten Funktionen. Erledigtes hakt sich selbst ab, die Karte verschwindet, wenn alles fertig ist.
   - Übungen spielen in einem eigenen Fenster mit Übungsspielern. Es wird NICHTS in die Vereinsdaten geschrieben,
     gespeichert wird nur, dass die Übung gemacht ist (lernen_setzen, je Person).
   - Tipps: Wer eine für seine Rolle sinnvolle Funktion nach ein paar Tagen noch nie benutzt hat, bekommt einen dezenten
     Hinweis von unten. Höchstens alle 3 Tage; wer dreimal hintereinander wegwischt, hat drei Wochen Ruhe.
   - „Lernen“: alle Schritte und Übungen jederzeit wiederholen (Mein Konto und Karte).
   ===================================================================== */
const O1={busy:false,uebung:null,schritt:0,tourVonO1:false,tippEl:null};
const o1E=s=>svEsc(s==null?'':String(s));
function o1L(){ return (N2.me&&N2.me.lernen)||{}; }
async function o1Setzen(o){ try{ const {data,error}=await SVB.sb.rpc('lernen_setzen',{p:o}); if(error)throw error; if(N2.me)N2.me.lernen=data||Object.assign(o1L(),o); }
  catch(e){ if(N2.me)N2.me.lernen=Object.assign(o1L(),o); } }
function o1Rolle(){ try{ return svRole(); }catch(e){ return 'viewer'; } }
const O1_UEB={
  eye:{t:'Eye-Test abgeben',ic:'eye',d:'In einer Minute einen Spieler einschätzen. Je besser du ihn kennst, desto mehr zählt dein Urteil.'},
  kand:{t:'Kandidat aufnehmen',ic:'users',d:'Aus einem Bedarf den passenden Spieler wählen und den nächsten Schritt festhalten.'},
  training:{t:'Training erfassen',ic:'activity',d:'Wer war da, wer hat gefehlt. Dauert 30 Sekunden.'},
  abst:{t:'Abstimmung verschicken',ic:'chat',d:'Eine Abstimmung fürs Training anlegen und in die Gruppe teilen.'}
};
function o1Schritte(role){
  role=role||o1Rolle(); const me=N2.me||{}, L=(me.lernen)||{}, g=k=>n2Genutzt([k]);
  const S=[
    {id:'app',t:'App installieren',d:'Startet wie eine richtige App und bleibt angemeldet.',ok:()=>i1App()||me.app||L['s:app'],los:()=>{ if(i1App())return; I1.gezeigt=false; i1Zeigen('app'); }},
    {id:'push',t:'Mitteilungen einschalten',d:'Abstimmungen, Erinnerungen und Neuigkeiten direkt aufs Handy.',ok:()=>me.push||L['s:push'],los:async()=>{
      if(i1IOS()&&!i1App()){ kToast('Auf dem iPhone gehen Mitteilungen nur in der installierten App. Erst Schritt 1.'); return; }
      try{ if(await svPushOn()){ await o1Setzen({'s:push':true}); if(N2.me)N2.me.push=true; o1Karte(); } }catch(e){ kToast('⚠️ '+e.message); } }},
    {id:'tour',t:'Kurzer Rundgang',d:'Wo du was findest, in einer Minute.',ok:()=>L['s:tour'],los:()=>{ O1.tourVonO1=true; try{ svTour(); }catch(e){ o1Setzen({'s:tour':true}).then(o1Karte); } }}];
  const ueb=id=>({id:'u:'+id,t:O1_UEB[id].t+' üben',d:O1_UEB[id].d,uebung:true,ok:()=>L['s:u:'+id],los:()=>o1Uebung(id)});
  if(['admin','vorstand','planer'].includes(role)){ S.push(ueb('eye'),ueb('kand'),{id:'v:kplan',t:'Kaderplanung ansehen',d:'Plan-Elf der nächsten Saison und was fehlt.',ok:()=>L['s:v:kplan']||g('v:kplan'),los:()=>goTab('kplan')}); }
  else if(role==='trainer'){ S.push(ueb('training'),ueb('abst'),ueb('eye'),{id:'v:verf',t:'Verfügbarkeit ansehen',d:'Wer diese Woche fehlt, auf einen Blick.',ok:()=>L['s:v:verf']||g('v:training:verf'),los:()=>sv4Go('training:verf')}); }
  else if(role==='spieler'){ S.push({id:'v:meinteam',t:'Deine Mannschaft ansehen',d:'Kader, nächste Spiele und Tabelle.',ok:()=>L['s:v:meinteam'],los:()=>{ try{ o1Setzen({'s:v:meinteam':true}); }catch(e){} goTab('meinteam'); }}); }   // 0.99.23
  else if(role==='helfer'){ }
  else S.push({id:'a:profil',t:'Ein Spielerprofil öffnen',d:'Stärke, Statistik und Verlauf eines Spielers.',ok:()=>L['s:a:profil']||g('a:profil'),los:()=>goTab('scout')});
  return S;
}
function o1Stand(){ const S=o1Schritte(); const fertig=S.filter(s=>{ try{ return !!s.ok(); }catch(e){ return false; } }); return {S,fertig:fertig.length,alle:S.length}; }
async function o1Pruefen(){ // automatisch erledigte Schritte festhalten, bei allem erledigt: fertig
  if(!N2.me)return; const L=o1L(), neu={}; o1Schritte().forEach(s=>{ let ok=false; try{ ok=!!s.ok(); }catch(e){} if(ok&&!L['s:'+s.id])neu['s:'+s.id]=true; });
  const st=o1Stand(); if(st.fertig===st.alle&&!L.fertig)neu.fertig=true;
  if(Object.keys(neu).length)await o1Setzen(neu);
}

// ---------- Karte „Deine ersten Schritte“ auf der Übersicht ----------
function o1Karte(){
  const host=document.getElementById('svHello'); if(!host||!N2.me)return;
  let el=document.getElementById('o1karte'); const L=o1L();
  const pause=L.karte_bis&&Date.now()<L.karte_bis;
  if(L.fertig||pause){ if(el)el.remove(); return; }
  const st=o1Stand(); if(!el){ el=document.createElement('div'); el.id='o1karte'; }
  host.after(el);
  const pr=Math.round(st.fertig/st.alle*100);
  el.className='card o1-karte';
  el.innerHTML=`<div class="o1-kopf"><div class="o1-ring" style="--p:${pr}"><b>${st.fertig}/${st.alle}</b></div><div><h3>Deine ersten Schritte</h3><p>So holst du am meisten aus der Sportzentrale. Übungen schreiben nichts in die echten Daten.</p></div>
      <button type="button" class="o1-x" data-o1="pause" aria-label="Für drei Tage ausblenden">×</button></div>
    ${st.fertig>0&&st.fertig<st.alle?`<button type="button" class="o1-sum" data-o1="fertige" aria-expanded="false">${SVI('check')}<span>${st.fertig} erledigt</span><small>anzeigen</small></button>`:''}
    <ol class="o1-liste${st.fertig>0&&st.fertig<st.alle?' o1-kurz':''}">${st.S.map(s=>{ let ok=false; try{ ok=!!s.ok(); }catch(e){} return `<li class="${ok?'ok':''}"><span class="o1-hk">${ok?SVI('check'):''}</span>
      <span class="o1-t"><b>${o1E(s.t)}</b><small>${o1E(s.d)}</small></span>${ok?'':`<button type="button" class="btn sm${s.uebung?'':' ghost'}" data-o1s="${o1E(s.id)}">${s.uebung?'Üben':'Los'}</button>`}</li>`; }).join('')}</ol>`;
  el.querySelectorAll('[data-o1s]').forEach(b=>b.onclick=()=>{ const s=st.S.find(x=>x.id===b.dataset.o1s); if(s){ n2Ev('a:schritt:'+s.id); s.los(); } });
  // seit 0.99.38: Erledigtes steht eingeklappt in einer Zeile, damit die Karte kurz bleibt
  const sum=el.querySelector('[data-o1="fertige"]'); if(sum)sum.onclick=()=>{ const ol=el.querySelector('.o1-liste'), zu=ol.classList.toggle('o1-kurz'); sum.setAttribute('aria-expanded',String(!zu)); sum.querySelector('small').textContent=zu?'anzeigen':'einklappen'; };
  el.querySelector('[data-o1="pause"]').onclick=async()=>{ await o1Setzen({karte_bis:Date.now()+3*864e5}); el.remove(); kToast('In drei Tagen wieder da. Jederzeit unter Mein Konto, Lernen.'); };
}
if(typeof svHomeOrder==='function'){ const _ho52=svHomeOrder; svHomeOrder=function(){ const r=_ho52.apply(this,arguments); try{ const k=document.getElementById('o1karte'), h=document.getElementById('svHello'); if(k&&h&&h.nextSibling!==k)h.after(k); }catch(e){} return r; }; }
if(typeof svCockpit==='function'){ const _ck52=svCockpit; svCockpit=function(){ const r=_ck52.apply(this,arguments); try{ o1Karte(); }catch(e){} return r; }; }
if(typeof svTourEnd==='function'){ const _te52=svTourEnd; svTourEnd=function(){ const r=_te52.apply(this,arguments); if(O1.tourVonO1){ O1.tourVonO1=false; o1Setzen({'s:tour':true}).then(()=>o1Karte()); } return r; }; }

// ---------- Übungen (eigenes Fenster, Übungsspieler, nichts wird gespeichert) ----------
const O1_SP=[{n:'Max Übung',p:'IV',c:'SV Beispielhausen',l:'Kreisliga A',ca:63,a:24},{n:'Tim Probe',p:'IV',c:'FC Musterdorf',l:'Kreisoberliga',ca:71,a:27},{n:'Leon Test',p:'IV',c:'TSV Übungstal',l:'Kreisliga B',ca:58,a:21}];
function o1Uebung(id){ O1.uebung=id; O1.schritt=0; o1Zeichnen(); n2Ev('a:uebung:'+id+':start'); }
function o1Fenster(inner,fuss){ return `<div class="o1-ueb"><div class="o1-uk"><span class="o1-badge">Übung</span><b>${o1E(O1_UEB[O1.uebung].t)}</b><small>Nichts davon wird gespeichert</small></div>${inner}${fuss||''}</div>`; }
function o1Fertig(){ const id=O1.uebung;
  const M=svModal(o1Fenster(`<div class="o1-geschafft"><div class="o1-konfetti" aria-hidden="true">${'<i></i>'.repeat(14)}</div><h2>Geschafft!</h2>
    <p>Das war nur eine Übung, gespeichert wurde nichts. ${o1E({eye:'Im echten Spielerprofil findest du „Eye-Test abgeben“ oben bei der Stärke.',kand:'Echte Bedarfe stehen unter Scouting, Bedarfe.',training:'Echte Trainings erfasst du unter Mannschaft, Training.',abst:'Echte Abstimmungen findest du unter Mannschaft, Organisation.'}[id])}</p></div>`,
    `<div class="btnrow"><button class="btn" type="button" data-o1z>Weiter</button></div>`));
  M.querySelector('[data-o1z]').onclick=()=>closeOverlay();
  try{ svSound('success'); }catch(e){}
  n2Ev('a:uebung:'+id+':fertig'); o1Setzen({['s:u:'+id]:true}).then(()=>{ o1Pruefen().then(o1Karte); });
}
function o1Zeichnen(){
  const id=O1.uebung, s=O1.schritt; let M;
  const weiter=(fn)=>{ M.querySelectorAll('[data-o1w]').forEach(b=>b.onclick=()=>fn(b)); M.querySelectorAll('[data-o1x]').forEach(b=>b.onclick=()=>closeOverlay()); };
  const fehler=t=>{ const f=M.querySelector('.o1-fehler'); if(f){ f.textContent=t; f.hidden=false; } };
  const ab=`<button class="btn ghost" type="button" data-o1x>Abbrechen</button>`;
  if(id==='eye'){
    const sp=O1_SP[0];
    if(s===0){ M=svModal(o1Fenster(`<p class="o1-auf">So sieht ein Spielerprofil aus. Tippe auf <b>Eye-Test abgeben</b>.</p>
        <div class="o1-profil"><div class="v1-zahl s-mittel"><b>${sp.ca}</b><small>Stärke</small></div><div><b>${o1E(sp.n)}</b><small>${o1E(sp.p+' · '+sp.c+' · '+sp.l)}</small>
        <div class="v1-chips"><span class="v1-c s-mittel">Sicherheit mittel</span><span class="v1-c">→ Form normal</span></div></div></div>`,
        `<div class="btnrow"><button class="btn" type="button" data-o1w>${SVI('eye')} Eye-Test abgeben</button>${ab}</div>`)); weiter(()=>{ O1.schritt=1; o1Zeichnen(); }); return; }
    M=svModal(o1Fenster(`<p class="o1-auf">Wähle ein <b>Gesamturteil</b>: Auf welchem Niveau würde er Stammspieler sein? Sag dann, <b>wie gut du ihn kennst</b>.</p>
      <div class="v1-gs">${V1_GESAMT.map(([n,t])=>`<label class="v1-g"><input type="radio" name="o1g" value="${n}"><b>${n}</b><small>${o1E(t)}</small></label>`).join('')}</div>
      <div class="v1-zeile"><label>Wie gut kennst du ihn?<select id="o1t"><option value="">bitte wählen</option>${V1_TIEFE.map(([k,t])=>`<option value="${k}">${o1E(t)}</option>`).join('')}</select></label>
        <label class="w">Wo gesehen?<input id="o1w" maxlength="80" placeholder="z. B. Auswärtsspiel in Beispielhausen"></label></div>
      <p class="o1-fehler" hidden></p><p class="note small">Tipp: Das Urteil zählt nur, wenn es vom Modell abweicht, und höchstens so stark, wie du ihn kennst.</p>`,
      `<div class="btnrow"><button class="btn" type="button" data-o1w>${SVI('check')} Speichern</button>${ab}</div>`));
    weiter(()=>{ if(!M.querySelector('[name="o1g"]:checked'))return fehler('Bitte ein Gesamturteil von 1 bis 5 wählen.');
      if(!M.querySelector('#o1t').value)return fehler('Wie gut kennst du ihn? Das bestimmt, wie stark dein Urteil zählt.');
      if(M.querySelector('#o1w').value.trim().length<3)return fehler('Wo hast du ihn gesehen? Bei Spielern anderer Vereine ist das Pflicht.');
      o1Fertig(); });
    return;
  }
  if(id==='kand'){
    if(s===0){ M=svModal(o1Fenster(`<p class="o1-auf">Der Bedarf „Innenverteidiger: Stammqualität fehlt“ zeigt passende Spieler. Nimm den auf, der <b>sofort hilft und wechselbereit</b> ist.</p>
        ${O1_SP.map((p,i)=>{ const ein=['Kaderbreite: +1 gegenüber dem Maßstab','Sofortverstärkung: +9 gegenüber dem Maßstab','Entwicklungsspieler: in 24 Monaten 64'][i], tc=['Wechsel offen','Wechsel offen','Wechsel unwahrscheinlich: ist Stammspieler'][i];
          return `<div class="s1-m"><span class="s1-ca s-mittel">${p.ca}</span><div class="s1-mt"><b>${o1E(p.n)}</b><small>${o1E(p.p+' · '+p.c+' · '+p.l+' · '+p.a+' J.')}</small><p>${o1E(ein)}</p><p><b>Fit hoch</b> · ${o1E(tc)}</p></div>
            <div class="s1-ma"><button class="btn sm" type="button" data-o1w="${i}">+ Kandidat</button></div></div>`; }).join('')}<p class="o1-fehler" hidden></p>`,`<div class="btnrow">${ab}</div>`));
      weiter(b=>{ if(b.dataset.o1w!=='1')return fehler(b.dataset.o1w==='0'?'Er wäre nur Kaderbreite. Gesucht ist jemand, der sofort hilft.':'Er ist ein Talent, aber gerade nicht wechselbereit.'); O1.schritt=1; o1Zeichnen(); });
      return; }
    M=svModal(o1Fenster(`<p class="o1-auf">${o1E(O1_SP[1].n)} steht jetzt unter <b>Kandidaten</b>. Du hast ihn angerufen: setze die Stufe auf <b>Kontakt</b> und notiere den nächsten Schritt.</p>
      <div class="s1-fm"><label>Stufe<select id="o1st"><option value="kandidat">Kandidat</option><option value="kontakt">Kontakt</option><option value="gespraech">Gespräch</option><option value="entscheidung">Entscheidung</option></select></label>
        <label>Interesse (seine Aussage)<select id="o1in"><option value="">unbekannt</option><option value="offen">offen</option><option value="signalisiert">Interesse signalisiert</option></select></label>
        <label class="w">Nächster Schritt<input id="o1ns" maxlength="80" placeholder="z. B. Treffen nach dem Spiel am Sonntag"></label></div><p class="o1-fehler" hidden></p>`,
      `<div class="btnrow"><button class="btn" type="button" data-o1w>${SVI('check')} Speichern</button>${ab}</div>`));
    weiter(()=>{ if(M.querySelector('#o1st').value!=='kontakt')return fehler('Die Stufe ist jetzt „Kontakt“: du hast mit ihm gesprochen.'); if(M.querySelector('#o1ns').value.trim().length<3)return fehler('Halte kurz fest, was als Nächstes passiert.'); o1Fertig(); });
    return;
  }
  if(id==='training'){
    const L=['Jonas Übung','Paul Probe','Ben Beispiel','Finn Test','Noah Muster','Elias Übung'];
    M=svModal(o1Fenster(`<p class="o1-auf">Training am Dienstag: Markiere, wer <b>da</b> war. Wer gefehlt hat, bekommt einen Grund.</p>
      <div class="o1-tr">${L.map((n,i)=>`<div class="o1-trz"><span>${o1E(n)}</span><div class="k1-seg">${[['da','da'],['fehlt','fehlt'],['verletzt','verletzt']].map(([k,l])=>`<button type="button" data-o1p="${i}" data-v="${k}">${l}</button>`).join('')}</div></div>`).join('')}</div>
      <p class="o1-fehler" hidden></p>`,`<div class="btnrow"><button class="btn" type="button" data-o1w>${SVI('check')} Training speichern</button>${ab}</div>`));
    const st={}; M.querySelectorAll('[data-o1p]').forEach(b=>b.onclick=()=>{ st[b.dataset.o1p]=b.dataset.v; M.querySelectorAll(`[data-o1p="${b.dataset.o1p}"]`).forEach(x=>x.classList.toggle('on',x===b)); });
    weiter(()=>{ const v=Object.values(st); if(Object.keys(st).length<L.length)return fehler(`Noch ${L.length-Object.keys(st).length} Spieler ohne Angabe.`); if(!v.includes('da'))return fehler('Mindestens einer war doch da?'); o1Fertig(); });
    return;
  }
  if(id==='abst'){
    if(s===0){ const d=new Date(); d.setDate(d.getDate()+((9-d.getDay())%7||7)); const ds=d.toISOString().slice(0,10);
      M=svModal(o1Fenster(`<p class="o1-auf">Lege eine Abstimmung fürs nächste Training an. Datum und Uhrzeit sind schon ausgefüllt.</p>
        <div class="s1-fm"><label>Titel<input id="o1ti" value="Training" maxlength="40"></label><label>Datum<input id="o1da" type="date" value="${ds}"></label><label>Uhrzeit<input id="o1uz" type="time" value="19:00"></label></div><p class="o1-fehler" hidden></p>`,
        `<div class="btnrow"><button class="btn" type="button" data-o1w>${SVI('check')} Abstimmung anlegen</button>${ab}</div>`));
      weiter(()=>{ if(!M.querySelector('#o1da').value)return fehler('Bitte ein Datum wählen.'); O1.schritt=1; o1Zeichnen(); }); return; }
    M=svModal(o1Fenster(`<p class="o1-auf">Jetzt den Link <b>in die Mannschaftsgruppe teilen</b>. Die Spieler sagen mit einem Tipp zu oder ab, ohne Anmeldung.</p>
      <div class="o1-wa"><b>Mannschaftsgruppe</b><p>Training Dienstag 19:00 · Bitte kurz zu- oder absagen 👇<br><u>svbsc.albertklee.de/…</u></p></div>`,
      `<div class="btnrow"><button class="btn" type="button" data-o1w>${SVI('chat')} In die Gruppe teilen</button>${ab}</div>`));
    weiter(()=>o1Fertig()); return;
  }
}

// ---------- Lernen: alles wiederholen ----------
function o1Lernen(){
  const st=o1Stand(), L=o1L(), role=o1Rolle();
  const alle=Object.keys(O1_UEB).filter(k=>role==='trainer'?true:['admin','vorstand','planer'].includes(role)?['eye','kand'].includes(k)||role==='admin':false);
  const M=svModal(`<div class="mhead"><div class="rm-ic" style="width:46px;height:46px">${SVI('help')}</div><div><h2 style="margin:0">Lernen</h2><div class="msub">Erste Schritte und Übungen, jederzeit wiederholbar</div></div></div>
    <h4 class="s1-gruppe">Deine ersten Schritte · ${st.fertig} von ${st.alle}</h4>
    ${st.fertig>0&&st.fertig<st.alle?`<button type="button" class="o1-sum" data-o1="fertige" aria-expanded="false">${SVI('check')}<span>${st.fertig} erledigt</span><small>anzeigen</small></button>`:''}
    <ol class="o1-liste${st.fertig>0&&st.fertig<st.alle?' o1-kurz':''}">${st.S.map(s=>{ let ok=false; try{ ok=!!s.ok(); }catch(e){} return `<li class="${ok?'ok':''}"><span class="o1-hk">${ok?SVI('check'):''}</span><span class="o1-t"><b>${o1E(s.t)}</b><small>${o1E(s.d)}</small></span>
      <button type="button" class="btn sm ghost" data-o1s="${o1E(s.id)}">${ok?'Nochmal':s.uebung?'Üben':'Los'}</button></li>`; }).join('')}</ol>
    ${alle.length?`<h4 class="s1-gruppe">Alle Übungen</h4><div class="o1-uebs">${alle.map(k=>`<button type="button" class="o1-ub" data-o1u="${k}">${SVI(O1_UEB[k].ic)}<b>${o1E(O1_UEB[k].t)}</b><small>${L['s:u:'+k]?'schon geübt':o1E(O1_UEB[k].d)}</small></button>`).join('')}</div>`:''}
    <div class="btnrow"><button class="btn ghost" type="button" data-o1k>Karte auf der Übersicht wieder zeigen</button><button class="btn ghost" type="button" data-o1z>Schließen</button></div>`);
  M.querySelectorAll('[data-o1s]').forEach(b=>b.onclick=()=>{ const s=st.S.find(x=>x.id===b.dataset.o1s); closeOverlay(); setTimeout(()=>s&&s.los(),80); });
  M.querySelectorAll('[data-o1u]').forEach(b=>b.onclick=()=>{ closeOverlay(); setTimeout(()=>o1Uebung(b.dataset.o1u),80); });
  M.querySelector('[data-o1k]').onclick=async()=>{ await o1Setzen({karte_bis:0,fertig:false}); closeOverlay(); goTab('home'); setTimeout(o1Karte,300); };
  M.querySelector('[data-o1z]').onclick=()=>closeOverlay();
}
{ const _acc52=svAccount; svAccount=function(){ const r=_acc52.apply(this,arguments);
  try{ const M=document.getElementById('modal'), sec=M&&M.querySelector('.editsec'); if(sec&&!M.querySelector('.o1-konto')){ const d=document.createElement('div'); d.className='editsec o1-konto';
    d.innerHTML=`<h4>Lernen</h4><p class="note" style="margin:0 0 8px">Erste Schritte und kurze Übungen, die nichts in die echten Daten schreiben.</p><button class="btn sm" type="button">${SVI('help')} Erste Schritte und Übungen</button>`;
    sec.before(d); d.querySelector('button').onclick=()=>{ closeOverlay(); setTimeout(o1Lernen,80); }; } }catch(e){}
  return r; }; }

// ---------- Tipps zu ungenutzten Funktionen ----------
const O1_TIPP={
  kplan:['Kaderplanung','In der Planung siehst du die Plan-Elf der nächsten Saison und was fehlt. Fehlt etwas, entsteht automatisch ein Bedarf.',()=>goTab('kplan')],
  sbedarf:['Bedarfe','Unter Scouting, Bedarfe stehen alle Lücken aus der Planung, jeweils mit passenden Spielern und einer Empfehlung.',()=>goTab('sbedarf')],
  skand:['Kandidaten','Kandidaten laufen von Kontakt über Gespräch bis zur Entscheidung. So geht keiner verloren.',()=>goTab('skand')],
  entdecken:['Entdecken','Das Radar zeigt Spieler, die gerade auffallen: höhere Liga, größere Rolle, starker Output.',()=>{ try{ S1.ent='radar'; }catch(e){} goTab('entdecken'); }],
  eye:['Eye-Test','Du kennst einen Spieler gut? Ein Eye-Test dauert eine Minute und macht seine Stärke genauer.',()=>o1Uebung('eye')],
  pruefen:['Bewertung prüfen','Passt eine Stärke nicht? Im Spielerprofil unter „Bewertung prüfen“ sagst du es der Sportlichen Leitung.',()=>goTab('kueber')],
  topelf:['Top-Elf','Die Top-Elf zeigt die stärkste Elf heute und die Plan-Elf der nächsten Saison, zum Umstellen per Tipp.',()=>goTab('topelf')],
  mannschaft:['Mannschaft','Die Übersicht zeigt nächstes Spiel, nächstes Training, wer fehlt und was offen ist.',()=>sv4Go('training:uebersicht')],
  verf:['Verfügbarkeit','Verletzungen und Abwesenheiten stehen in einer Zeitleiste. So planst du das Wochenende entspannt.',()=>sv4Go('training:verf')],
  training:['Training erfassen','Training in 30 Sekunden erfassen: daraus entstehen Beteiligung und Form der Spieler.',()=>o1Uebung('training')],
  abst:['Abstimmungen','Abstimmungen fürs Training: Link in die Gruppe, die Spieler sagen mit einem Tipp zu oder ab.',()=>sv4Go('kabine:abst')],
  profil:['Spielerprofil','Tippe auf einen Namen: im Profil stehen Stärke, Verlauf und alles zum Spieler.',()=>goTab('kueber')]
};
function o1TippWahl(){
  const me=N2.me; if(!me||me.nutzung_aus)return null; const L=me.lernen||{};
  if((me.tage||0)<3)return null;                                   // erst nach ein paar Tagen
  if(L.tipp_naechst&&Date.now()<L.tipp_naechst)return null;
  if(!L.fertig&&!(L.karte_bis&&Date.now()<L.karte_bis))return null;  // solange die Erste-Schritte-Karte offen ist, reicht die
  const role=o1Rolle(), schon=new Set((L.tipps||'').split(',').filter(Boolean));
  return n2Relevant(role).filter(f=>O1_TIPP[f.id]&&!schon.has(f.id)&&!n2Genutzt(f.k)).filter(f=>{ try{ const t=f.k.find(k=>k.startsWith('v:')); return !t||svTabAllowed(t.slice(2).split(':')[0]); }catch(e){ return true; } })[0]||null;
}
function o1TippZeigen(f){
  if(!f||(I1&&I1.offen)||!i1Frei())return; const [t,d,go]=O1_TIPP[f.id];
  let el=O1.tippEl; if(!el){ el=document.createElement('div'); el.id='o1tipp'; el.className='i1-blatt o1-tipp'; el.setAttribute('role','dialog'); el.setAttribute('aria-modal','false'); document.body.appendChild(el); O1.tippEl=el; }
  el.dataset.art='tipp'; el.setAttribute('aria-label','Tipp: '+t);
  el.innerHTML=`<div class="i1-griff" aria-hidden="true"></div><button class="i1-x" type="button" data-o1t="weg" aria-label="Schließen">×</button>
    <div class="i1-kopf"><div class="i1-ic">💡</div><div><b>Schon gewusst? ${o1E(t)}</b><small>${o1E(d)}</small></div></div>
    <div class="i1-knoepfe"><button class="btn" type="button" data-o1t="los">Zeig mir das</button><button class="btn ghost" type="button" data-o1t="weg">Später</button></div>`;
  const zu=async(art)=>{ el.classList.remove('auf'); el.style.transform=''; const L=o1L(); const weg=art==='weg'?(L.tipp_weg||0)+1:0;
    const tipps=[...new Set((L.tipps||'').split(',').filter(Boolean).concat(art==='los'?[f.id]:[]))].join(',');
    n2Ev('t:tipp:'+f.id+':'+art); await o1Setzen({tipp_weg:weg,tipps,tipp_naechst:Date.now()+(weg>=3?21:3)*864e5}); };
  el.querySelectorAll('[data-o1t]').forEach(b=>b.onclick=()=>{ const a=b.dataset.o1t; zu(a); if(a==='los')setTimeout(go,150); });
  try{ i1Wischen(el); }catch(e){}
  n2Ev('t:tipp:'+f.id+':zeigen'); requestAnimationFrame(()=>el.classList.add('auf'));
  o1Setzen({tipp_naechst:Date.now()+3*864e5});
}
// Wegwischen des Tipps zählt wie „Später“
if(typeof i1Spaeter==='function'){ const _sp52=i1Spaeter; i1Spaeter=function(art){ if(art==='tipp'){ const b=O1.tippEl&&O1.tippEl.querySelector('[data-o1t="weg"]'); if(b){ b.click(); return; } } return _sp52.apply(this,arguments); }; }

// ---------- Start ----------
setTimeout(function o1Warte(){
  try{ if(!(document.getElementById('gate').classList.contains('done')&&typeof _remoteDone!=='undefined'&&_remoteDone)){ setTimeout(o1Warte,2000); return; } }catch(e){ setTimeout(o1Warte,2000); return; }
  n2Meine().then(async()=>{ await o1Pruefen(); try{ if(svCurTab()==='home')o1Karte(); }catch(e){}
    setTimeout(()=>{ const f=o1TippWahl(); if(f)o1TippZeigen(f); },45000); });
},2500);
{ const _gt52=goTab; goTab=function(tab){ const r=_gt52.apply(this,arguments); try{ if(svCurTab()==='home')setTimeout(o1Karte,50); if(N2.me)o1Pruefen(); }catch(e){} return r; }; }

(function(){ try{ const s=document.createElement('style'); s.id='svm51css'; s.textContent="/* Beta 0.54 · Nutzung (Admin), Erste Schritte, Übungen, Tipps */\n.n2{display:flex;flex-direction:column;gap:12px;}\n.n2-kopf{display:flex;justify-content:space-between;align-items:flex-end;gap:12px;flex-wrap:wrap;}\n.n2-kopf h2{margin:0;font-family:var(--disp);font-size:22px;color:var(--ink);}\n.n2-kopf p{margin:2px 0 0;color:var(--ink3);font-size:13px;}\n.n2-kpis{display:grid;grid-template-columns:repeat(auto-fit,minmax(150px,1fr));gap:10px;}\n.n2-kpi{display:flex;flex-direction:column;gap:2px;padding:12px 14px;border-radius:16px;border:1px solid var(--line);background:var(--surface);}\n.n2-kpi b{font-family:var(--disp);font-size:24px;font-weight:800;color:var(--ink);font-variant-numeric:tabular-nums;}\n.n2-kpi span{font-size:12.5px;font-weight:700;color:var(--ink2);}\n.n2-kpi small{font-size:11.5px;color:var(--ink3);}\n.n2-kpi.warn b{color:var(--v1-mittel);}\n.n2-grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(280px,1fr));gap:12px;align-items:start;}\n.n2-grid>.card{margin:0;}\n.n2-tr{display:grid;grid-template-columns:minmax(90px,30%) 1fr auto;gap:4px 10px;align-items:center;font-size:13px;color:var(--ink2);padding:4px 0;}\n.n2-tr>i{display:block;height:8px;border-radius:5px;background:var(--surface2);overflow:hidden;}\n.n2-tr>i>i{display:block;height:100%;border-radius:5px;background:linear-gradient(90deg,var(--brand2),#8b7cf6);}\n.n2-tr b{color:var(--ink);font-variant-numeric:tabular-nums;}\n.n2-tr small{grid-column:2/4;color:var(--ink3);font-size:11.5px;}\n.n2-leute{display:flex;flex-direction:column;gap:6px;}\n.n2-p{border:1px solid var(--line);border-radius:14px;background:var(--surface);overflow:hidden;}\n.n2-p.offen{border-color:var(--brand2);}\n.n2-pz{width:100%;display:grid;grid-template-columns:minmax(0,1.6fr) auto repeat(4,minmax(64px,auto));gap:8px 12px;align-items:center;padding:10px 12px;border:0;background:none;color:var(--ink);font:inherit;text-align:left;cursor:pointer;}\n.n2-pn{min-width:0;display:flex;flex-direction:column;}\n.n2-pn b{font-size:14px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;}\n.n2-pn small,.n2-pw small{font-size:11.5px;color:var(--ink3);}\n.n2-pw{display:flex;flex-direction:column;align-items:flex-end;}\n.n2-pw b{font-variant-numeric:tabular-nums;font-size:13.5px;}\n.n2-ic{display:flex;gap:4px;} .n2-ic i{font-style:normal;opacity:.25;filter:grayscale(1);} .n2-ic i.an{opacity:1;filter:none;}\n.n2-typ{font-size:11.5px;font-weight:800;border-radius:999px;padding:3px 9px;white-space:nowrap;background:var(--surface2);color:var(--ink2);}\n.n2-typ.t-power{background:color-mix(in srgb,var(--v1-hoch) 18%,transparent);color:var(--v1-hoch);}\n.n2-typ.t-regel{background:color-mix(in srgb,var(--brand2) 16%,transparent);color:var(--brand2);}\n.n2-typ.t-inaktiv,.n2-typ.t-nie{background:color-mix(in srgb,var(--v1-ab) 14%,transparent);color:var(--v1-ab);}\n.n2-typ.t-neu{background:color-mix(in srgb,var(--v1-mittel) 16%,transparent);color:var(--v1-mittel);}\n@media (max-width:700px){.n2-pz{grid-template-columns:minmax(0,1fr) auto auto;}.n2-pz>.n2-pw:nth-of-type(n+3),.n2-pz>.n2-ic{display:none;}}\n.n2-detail{padding:4px 12px 12px;border-top:1px solid var(--line);}\n.n2-detail h5{margin:10px 0 4px;font-size:12px;text-transform:uppercase;letter-spacing:.05em;color:var(--ink3);}\n.n2-spark{display:flex;align-items:flex-end;gap:2px;height:46px;margin:10px 0 4px;}\n.n2-spark i{flex:1 1 0;min-width:2px;border-radius:3px 3px 0 0;background:linear-gradient(180deg,#8b7cf6,var(--brand2));opacity:.85;}\n.n2-heatl{display:flex;flex-wrap:wrap;gap:6px;}\n.n2-hs{display:inline-flex;gap:8px;align-items:center;border:1px solid var(--line);border-radius:999px;background:var(--surface2);color:var(--ink2);font:inherit;font-size:12.5px;padding:5px 10px;cursor:pointer;}\n.n2-hs b{color:var(--ink);}\n.n2-heat{position:absolute;left:0;top:0;width:100%;z-index:8500;pointer-events:auto;}\n.n2-heat i{position:absolute;transform:translate(-50%,-50%);border-radius:50%;background:radial-gradient(circle,rgba(255,80,40,.95) 0%,rgba(255,170,0,.55) 45%,rgba(255,170,0,0) 72%);pointer-events:none;}\n.n2-heat-x{position:fixed;left:50%;top:calc(10px + env(safe-area-inset-top,0px));transform:translateX(-50%);z-index:8600;border:0;border-radius:999px;padding:8px 14px;background:#111827;color:#fff;font:inherit;font-size:13px;font-weight:700;box-shadow:0 6px 20px rgba(0,0,0,.35);cursor:pointer;}\n\n/* Erste Schritte */\n.o1-karte{position:relative;overflow:hidden;background:linear-gradient(135deg,color-mix(in srgb,var(--brand2) 14%,var(--surface)) 0%,var(--surface) 55%,color-mix(in srgb,#8b7cf6 12%,var(--surface)) 100%);}\n.o1-kopf{display:flex;gap:14px;align-items:center;padding-right:28px;}\n.o1-kopf h3{margin:0;font-family:var(--disp);font-size:18px;color:var(--ink);}\n.o1-kopf p{margin:2px 0 0;font-size:13px;color:var(--ink2);line-height:1.4;}\n.o1-ring{flex:0 0 58px;width:58px;height:58px;border-radius:50%;display:grid;place-items:center;\n  background:conic-gradient(var(--brand2) calc(var(--p)*1%),var(--surface2) 0);position:relative;}\n.o1-ring::before{content:\"\";position:absolute;inset:6px;border-radius:50%;background:var(--surface);}\n.o1-ring b{position:relative;font-size:13px;font-weight:800;color:var(--ink);font-variant-numeric:tabular-nums;}\n.o1-x{position:absolute;top:8px;right:8px;width:32px;height:32px;border:0;border-radius:50%;background:transparent;color:var(--ink3);font-size:20px;cursor:pointer;}\n.o1-liste{list-style:none;margin:12px 0 0;padding:0;display:flex;flex-direction:column;gap:6px;}\n.o1-liste li{display:flex;gap:10px;align-items:center;padding:8px 10px;border-radius:12px;background:color-mix(in srgb,var(--surface2) 70%,transparent);}\n.o1-liste li.ok{opacity:.65;}\n.o1-liste li.ok b{text-decoration:line-through;text-decoration-color:color-mix(in srgb,var(--ink3) 60%,transparent);}\n.o1-hk{flex:0 0 24px;width:24px;height:24px;border-radius:50%;border:2px solid var(--line2);display:grid;place-items:center;color:#fff;}\n.o1-liste li.ok .o1-hk{background:var(--v1-hoch);border-color:var(--v1-hoch);}\n.o1-hk svg{width:14px;height:14px;}\n.o1-t{flex:1 1 auto;min-width:0;display:flex;flex-direction:column;}\n.o1-t b{font-size:13.5px;color:var(--ink);} .o1-t small{font-size:12px;color:var(--ink3);line-height:1.35;}\n/* Übungen */\n.o1-ueb{display:flex;flex-direction:column;gap:10px;}\n.o1-uk{display:flex;align-items:center;gap:8px;flex-wrap:wrap;}\n.o1-uk b{font-size:16px;color:var(--ink);} .o1-uk small{color:var(--ink3);font-size:12px;}\n.o1-badge{font-size:11px;font-weight:800;text-transform:uppercase;letter-spacing:.06em;border-radius:999px;padding:3px 9px;background:color-mix(in srgb,var(--v1-mittel) 18%,transparent);color:var(--v1-mittel);}\n.o1-auf{margin:0;padding:10px 12px;border-radius:12px;background:color-mix(in srgb,var(--brand2) 10%,transparent);color:var(--ink);font-size:14px;line-height:1.45;}\n.o1-profil{display:flex;gap:14px;align-items:center;padding:12px;border:1px solid var(--line);border-radius:16px;}\n.o1-profil small{display:block;color:var(--ink3);font-size:12px;margin:2px 0 6px;}\n.o1-fehler{margin:0;color:var(--v1-ab);font-size:13px;font-weight:700;}\n.o1-tr{display:flex;flex-direction:column;gap:6px;}\n.o1-trz{display:flex;justify-content:space-between;align-items:center;gap:8px;font-size:13.5px;color:var(--ink);}\n.o1-wa{padding:10px 12px;border-radius:14px;background:color-mix(in srgb,#25d366 12%,var(--surface));border:1px solid color-mix(in srgb,#25d366 35%,transparent);font-size:13.5px;color:var(--ink);}\n.o1-wa p{margin:4px 0 0;color:var(--ink2);}\n.o1-geschafft{text-align:center;position:relative;padding:14px 0 4px;}\n.o1-geschafft h2{margin:4px 0;font-family:var(--disp);}\n.o1-geschafft p{color:var(--ink2);font-size:14px;line-height:1.5;}\n.o1-konfetti{position:relative;height:36px;}\n.o1-konfetti i{position:absolute;left:50%;top:18px;width:8px;height:12px;border-radius:2px;background:var(--brand2);animation:o1k 1.1s ease-out forwards;}\n.o1-konfetti i:nth-child(3n){background:#f59e0b;} .o1-konfetti i:nth-child(3n+1){background:#8b7cf6;}\n.o1-konfetti i:nth-child(1){--x:-120px;--r:220deg}.o1-konfetti i:nth-child(2){--x:-90px;--r:-160deg}.o1-konfetti i:nth-child(3){--x:-60px;--r:300deg}.o1-konfetti i:nth-child(4){--x:-30px;--r:-90deg}\n.o1-konfetti i:nth-child(5){--x:0;--r:180deg}.o1-konfetti i:nth-child(6){--x:30px;--r:-240deg}.o1-konfetti i:nth-child(7){--x:60px;--r:120deg}.o1-konfetti i:nth-child(8){--x:90px;--r:-300deg}\n.o1-konfetti i:nth-child(9){--x:120px;--r:200deg}.o1-konfetti i:nth-child(10){--x:-140px;--r:-200deg}.o1-konfetti i:nth-child(11){--x:140px;--r:260deg}.o1-konfetti i:nth-child(12){--x:-40px;--r:-320deg}\n.o1-konfetti i:nth-child(13){--x:40px;--r:160deg}.o1-konfetti i:nth-child(14){--x:0;--r:-120deg}\n@keyframes o1k{0%{transform:translate(-50%,0) rotate(0);opacity:1}100%{transform:translate(calc(-50% + var(--x)),-30px) rotate(var(--r));opacity:0}}\n@media (prefers-reduced-motion:reduce){.o1-konfetti i{animation:none;opacity:0}}\n.o1-uebs{display:grid;grid-template-columns:repeat(auto-fill,minmax(160px,1fr));gap:8px;}\n.o1-ub{display:flex;flex-direction:column;gap:4px;align-items:flex-start;text-align:left;padding:10px 12px;border:1px solid var(--line);border-radius:14px;background:var(--surface);color:var(--ink);font:inherit;cursor:pointer;}\n.o1-ub svg{width:20px;height:20px;color:var(--brand2);} .o1-ub small{color:var(--ink3);font-size:12px;line-height:1.35;}\n.o1-tipp .i1-ic{font-size:22px;}\n.o1-geschafft h2{text-align:center;}\n.o1-ueb .btnrow{justify-content:flex-end;}\n.n2-kopf p{margin:0;color:var(--ink3);font-size:13px;}\n.n2-zeile{display:flex;justify-content:space-between;align-items:center;gap:10px;flex-wrap:wrap;margin-top:8px;}\n.n2-ds{font-size:12.5px;}\n.n2-dsx h4{margin:14px 0 4px;font-size:14px;color:var(--ink);}\n.n2-dsx p{margin:0;font-size:13.5px;line-height:1.5;color:var(--ink2);}\n"; document.head.appendChild(s); }catch(e){} })();
/* =====================================================================
   Sportzentrale Beta 0.55 · Wohlfühl-Design
   - Lebendiger Hintergrund in den Vereinsfarben (Blau, Hellblau, Orange), weiche Formen, geschwungene Linien
   - Stimmung nach Tageszeit (morgens wärmer, abends ruhiger), pausiert im Hintergrund, aus bei „Bewegung reduzieren“
   - Wappen in der Kopfleiste ohne weiße Kachel, Mehr-Menü kompakter, Mannschaft-Knöpfe in einer Zeile
   ===================================================================== */
function w5Tageszeit(){ const h=new Date().getHours(); return h<10?'morgen':h<17?'tag':h<21?'abend':'nacht'; }
function w5Welt(){
  return;   // 0.74: kein bewegter Hintergrund mehr, eine ruhige Fläche (svm41.css)
  try{
    document.documentElement.dataset.tz=w5Tageszeit();
    if(document.getElementById('svWelt'))return;
    const w=document.createElement('div'); w.id='svWelt'; w.setAttribute('aria-hidden','true');
    // Geschwungene Linien oben, darunter ein Mittelkreis wie auf dem Platz (ganz leise)
    w.innerHTML=`<i class="w5b w5b1"></i><i class="w5b w5b2"></i><i class="w5b w5b3"></i><i class="w5b w5b4"></i>
      <svg class="w5welle" viewBox="0 0 1200 320" preserveAspectRatio="none">
        <defs><linearGradient id="w5g1" x1="0" x2="1"><stop offset="0" stop-color="#2f6bff"/><stop offset=".55" stop-color="#18b1fc"/><stop offset="1" stop-color="#f7711c"/></linearGradient>
          <linearGradient id="w5g2" x1="0" x2="0" y1="0" y2="1"><stop offset="0" stop-color="#2f6bff" stop-opacity=".16"/><stop offset="1" stop-color="#2f6bff" stop-opacity="0"/></linearGradient></defs>
        <path class="w5f" d="M0 0H1200V170C1040 240 900 120 720 150S420 270 240 220 60 150 0 180Z" fill="url(#w5g2)"/>
        <path class="w5l" d="M0 196C120 160 220 250 380 238S640 140 820 168 1060 250 1200 186" fill="none" stroke="url(#w5g1)" stroke-width="2"/>
        <path class="w5l w5l2" d="M0 226C160 196 260 276 420 262S700 176 880 206 1080 268 1200 220" fill="none" stroke="url(#w5g1)" stroke-width="1.2"/>
      </svg>
      <svg class="w5kreis" viewBox="0 0 200 200"><circle cx="100" cy="100" r="92" fill="none" stroke="currentColor" stroke-width="1.5"/><circle cx="100" cy="100" r="3" fill="currentColor"/></svg>`;
    document.body.prepend(w);
  }catch(e){ console.warn('Hintergrund',e); }
}
w5Welt();
setInterval(()=>{ try{ document.documentElement.dataset.tz=w5Tageszeit(); }catch(e){} },10*60*1000);

/* Mehr-Menü: kleine Gruß-Zeile oben, damit es sich nicht wie ein Formular anfühlt */
function w5Sheet(){
  return;   // 0.74: kein Gruß im Mehr-Menü
  try{
    const s=document.getElementById('moreSheet'); if(!s||s.querySelector('.w5-gruss'))return;
    const g=document.createElement('div'); g.className='w5-gruss';
    const grab=s.querySelector('.grab'); if(grab)grab.after(g); else s.prepend(g);
    w5GrussText();
  }catch(e){}
}
function w5GrussText(){
  const g=document.querySelector('#moreSheet .w5-gruss'); if(!g)return;
  const grab=document.querySelector('#moreSheet .grab'); if(grab&&grab.nextElementSibling!==g)grab.after(g);   // Gruß immer ganz oben
  const n=(typeof SVU!=='undefined'&&typeof svFirst==='function')?svFirst(SVU.name):'';
  const t=w5Tageszeit(), hallo={morgen:'Guten Morgen',tag:'Hallo',abend:'Guten Abend',nacht:'Noch wach'}[t];
  g.innerHTML=`<b>${svEsc(hallo+(n?', '+n:''))}</b><span>Wohin möchtest du?</span>`;
}
w5Sheet();
if(typeof svSheet==='function'){ const _ss53=svSheet; svSheet=function(open){ if(open)w5GrussText(); return _ss53.apply(this,arguments); }; }

(function(){ try{ const s=document.createElement('style'); s.id='svm53css'; s.textContent="/* =====================================================================\n   Sportzentrale Beta 0.55 · Wohlfühl-Design\n   Dunkle Regeln stehen unter html:not([data-theme=\"hell\"]), helle unter html[data-theme=\"hell\"] body,\n   damit die automatische Übersetzung (hellcss.py) sie nicht anfasst und svhell.css sie nicht überschreibt.\n   ===================================================================== */\n\n/* ---------- Lebendiger Hintergrund ---------- */\nbody::before,body::after{display:none!important;}            /* alte Aurora (sv43) wird ersetzt */\nhtml body:not(#_),html[data-theme=\"hell\"] body:not(#_){background:var(--bg)!important;isolation:isolate;}   /* eigene Ebene: der Hintergrund liegt über der Grundfarbe, unter allem Inhalt */\n#svWelt{position:fixed;inset:0;z-index:-1;pointer-events:none;overflow:hidden;contain:strict;}\nbody.gated #svWelt{opacity:.55;}\nhtml:not([data-theme=\"hell\"]) #svWelt{background:linear-gradient(180deg,#081022 0%,#05070c 55%,#04060a 100%);}\n.w5b{position:absolute;display:block;border-radius:50%;will-change:transform;}\n.w5b1{width:110vmax;height:80vmax;left:-45vmax;top:-42vmax;background:radial-gradient(closest-side,rgba(47,107,255,.42),rgba(47,107,255,.12) 55%,transparent);animation:w5a 38s ease-in-out infinite alternate;}\n.w5b2{width:80vmax;height:70vmax;right:-38vmax;top:18vh;background:radial-gradient(closest-side,rgba(24,177,252,.18),rgba(24,177,252,.05) 60%,transparent);animation:w5b 46s ease-in-out infinite alternate;}\n.w5b3{width:90vmax;height:70vmax;left:-30vmax;bottom:-40vmax;background:radial-gradient(closest-side,rgba(247,113,28,.22),rgba(247,113,28,.05) 60%,transparent);animation:w5c 52s ease-in-out infinite alternate;}\n.w5b4{width:60vmax;height:55vmax;right:-20vmax;top:-28vmax;background:radial-gradient(closest-side,rgba(139,124,246,.20),transparent 70%);animation:w5b 34s ease-in-out infinite alternate-reverse;}\n@keyframes w5a{0%{transform:translate3d(0,0,0) rotate(0) scale(1);}50%{transform:translate3d(6vw,4vh,0) rotate(12deg) scale(1.08);}100%{transform:translate3d(-3vw,8vh,0) rotate(-6deg) scale(1.02);}}\n@keyframes w5b{0%{transform:translate3d(0,0,0) scale(1);}100%{transform:translate3d(-8vw,10vh,0) scale(1.15);}}\n@keyframes w5c{0%{transform:translate3d(0,0,0) rotate(0);}100%{transform:translate3d(10vw,-8vh,0) rotate(18deg);}}\n.w5welle{position:absolute;left:-5%;top:0;width:110%;height:300px;opacity:.9;animation:w5w 30s ease-in-out infinite alternate;}\n.w5welle .w5l{opacity:.32;}\n.w5welle .w5l2{opacity:.16;}\n@keyframes w5w{0%{transform:translate3d(-2%,0,0);}100%{transform:translate3d(2%,10px,0);}}\n.w5kreis{position:absolute;width:62vmin;height:62vmin;right:-22vmin;bottom:8vh;color:rgba(156,195,255,.07);animation:w5k 120s linear infinite;}\n@keyframes w5k{to{transform:rotate(360deg);}}\n/* Stimmung nach Tageszeit */\nhtml[data-tz=\"morgen\"] .w5b3{background:radial-gradient(closest-side,rgba(247,140,40,.24),rgba(247,113,28,.07) 60%,transparent);}\nhtml[data-tz=\"abend\"] .w5b4,html[data-tz=\"nacht\"] .w5b4{background:radial-gradient(closest-side,rgba(139,124,246,.28),transparent 70%);}\nhtml[data-tz=\"nacht\"] .w5b1{background:radial-gradient(closest-side,rgba(47,90,220,.26),rgba(47,107,255,.07) 55%,transparent);}\n/* Hell: Papier mit Punktraster bleibt, darüber pastellige Vereinsfarben */\nhtml[data-theme=\"hell\"] body #svWelt{background:radial-gradient(circle at 1px 1px,rgba(40,48,72,.11) 1.1px,transparent 1.5px) 0 0/22px 22px;}\nhtml[data-theme=\"hell\"] body .w5b1{background:radial-gradient(closest-side,rgba(47,107,255,.17),rgba(47,107,255,.05) 55%,transparent);}\nhtml[data-theme=\"hell\"] body .w5b2{background:radial-gradient(closest-side,rgba(24,177,252,.14),transparent 70%);}\nhtml[data-theme=\"hell\"] body .w5b3{background:radial-gradient(closest-side,rgba(247,113,28,.16),rgba(247,113,28,.05) 60%,transparent);}\nhtml[data-theme=\"hell\"] body .w5b4{background:radial-gradient(closest-side,rgba(139,124,246,.10),transparent 70%);}\nhtml[data-theme=\"hell\"] body .w5welle .w5l{opacity:.38;}\nhtml[data-theme=\"hell\"] body .w5welle .w5f{opacity:.7;}\nhtml[data-theme=\"hell\"] body .w5kreis{color:rgba(37,82,208,.045);}\n/* Ruhe: im Hintergrund pausieren, bei „Bewegung reduzieren“ ganz still */\nbody.vh #svWelt *{animation-play-state:paused!important;}\n@media (prefers-reduced-motion:reduce){ #svWelt *{animation:none!important;} }\n@media print{ #svWelt{display:none!important;} }\n\n/* Glas: Karten lassen die Farben etwas durchscheinen */\nhtml:not([data-theme=\"hell\"]) .card{background:linear-gradient(165deg,rgba(22,30,48,.74),rgba(12,16,26,.80))!important;}\nhtml[data-theme=\"hell\"] body .card{background:linear-gradient(165deg,rgba(255,254,250,.86),rgba(250,246,238,.82))!important;}\n.card{backdrop-filter:blur(12px) saturate(1.2);-webkit-backdrop-filter:blur(12px) saturate(1.2);}\n\n/* ---------- Begrüßung: Name in Vereinsfarben, geschwungene Linie darunter ---------- */\nhtml:not([data-theme=\"hell\"]) .hello h2 span{background:linear-gradient(90deg,#9cc3ff 0%,#5b9bff 45%,#ffb27a 100%);-webkit-background-clip:text;background-clip:text;color:transparent;}\nhtml[data-theme=\"hell\"] body .hello h2 span{background:linear-gradient(90deg,#2552d0 0%,#2f6bff 50%,#d9661a 100%);-webkit-background-clip:text;background-clip:text;color:transparent;}\n.hello h2::after{content:\"\";display:block;width:132px;height:12px;margin-top:6px;\n  background:url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 132 12'%3E%3Cdefs%3E%3ClinearGradient id='g' x1='0' x2='1'%3E%3Cstop offset='0' stop-color='%232f6bff'/%3E%3Cstop offset='.6' stop-color='%2318b1fc'/%3E%3Cstop offset='1' stop-color='%23f7711c'/%3E%3C/linearGradient%3E%3C/defs%3E%3Cpath d='M2 8C20 2 34 11 52 7S88 1 106 6 124 9 130 5' fill='none' stroke='url(%23g)' stroke-width='3' stroke-linecap='round'/%3E%3C/svg%3E\") no-repeat left center/contain;}\n\n/* ---------- Wappen oben links: frei, ohne weiße Kachel ---------- */\n.tb-crest{width:auto!important;object-fit:contain;background:none!important;padding:0!important;border-radius:0!important;box-shadow:none!important;}\n@media (max-width:760px){\n  .tb-crest{height:28px!important;max-width:52px;filter:drop-shadow(0 4px 10px rgba(47,107,255,.35));}\n  html[data-theme=\"hell\"] body .tb-crest{filter:drop-shadow(0 3px 8px rgba(40,48,72,.18));background:none!important;}\n}\n\n/* ---------- Untere Leiste: weicher, runder, aktive Seite als leuchtende Blase ---------- */\n@media (max-width:760px){\n  .tabbar{border-radius:28px!important;padding:6px 6px!important;}\n  html:not([data-theme=\"hell\"]) .tabbar{background:linear-gradient(180deg,rgba(22,30,50,.78),rgba(12,16,28,.86))!important;border:1px solid rgba(140,175,255,.20)!important;}\n  .tabbar .ti,.tabbar .tmore{border-radius:22px!important;position:relative;}\n  html:not([data-theme=\"hell\"]) .tabbar .ti.active{background:radial-gradient(120% 140% at 50% 0%,rgba(47,107,255,.55),rgba(47,107,255,.16) 60%,rgba(24,177,252,.10))!important;box-shadow:inset 0 1px 0 rgba(255,255,255,.22),0 8px 20px -10px rgba(47,107,255,.8)!important;}\n  html[data-theme=\"hell\"] body .tabbar{border-radius:28px!important;background:rgba(255,253,249,.86)!important;}\n  html[data-theme=\"hell\"] body .tabbar .ti.active{background:radial-gradient(120% 140% at 50% 0%,rgba(47,107,255,.20),rgba(47,107,255,.06) 65%)!important;color:var(--brand)!important;box-shadow:inset 0 0 0 1px rgba(37,82,208,.16)!important;}\n  .tabbar .ti.active::after{content:\"\";position:absolute;left:50%;bottom:3px;width:5px;height:5px;margin-left:-2.5px;border-radius:50%;background:#f7711c;box-shadow:0 0 8px rgba(247,113,28,.8);}\n  .tabbar .ti,.tabbar .tmore{white-space:nowrap;overflow:hidden;font-size:11px!important;letter-spacing:-.01em!important;}\n}\n\n/* ---------- Mehr-Menü: kompakter, Gruß oben, Gruppen mit Farbpunkt ---------- */\n.sheet{border-radius:30px 30px 0 0!important;max-height:86vh;overflow-y:auto;overscroll-behavior:contain;}\n.w5-gruss{display:flex;flex-direction:column;gap:1px;margin:0 4px 12px;}\n.w5-gruss b{font-size:18px;font-weight:800;letter-spacing:-.02em;}\n.w5-gruss span{font-size:12.5px;color:var(--ink3);}\n.sheet h4{display:flex;align-items:center;gap:7px;margin:14px 4px 8px!important;}\n.sheet h4::before{content:\"\";width:7px;height:7px;border-radius:50%;background:linear-gradient(135deg,#2f6bff,#18b1fc);flex:none;}\n.sheet h4:nth-of-type(2)::before{background:linear-gradient(135deg,#f7711c,#ffb27a);}\n.sheet h4:nth-of-type(3)::before{background:linear-gradient(135deg,#18b1fc,#22c55e);}\n.sheet h4:nth-of-type(4)::before{background:linear-gradient(135deg,#8b7cf6,#2f6bff);}\n.sgrid button{border-radius:18px!important;padding:12px 4px 10px!important;gap:6px!important;}\n.sgrid button svg{width:21px;height:21px;}\n\n/* ---------- Seiten mit Reitern: Überschrift nicht doppelt (der Reiter oben sagt es schon) ---------- */\n@media (max-width:760px){\n  .k1-kopf h2{display:none;}\n  .k1-kopf p{margin-top:0;}\n}\n\n/* ---------- Mannschaft: Aktionen in einer Zeile zum Wischen statt drei Reihen Knöpfe ---------- */\n@media (max-width:760px){\n  #panel-training .trtop{min-width:0;max-width:100%;}\n  #panel-training .trtop .tract{flex-wrap:nowrap!important;min-width:0;align-self:stretch!important;box-sizing:border-box;width:calc(100% + 28px)!important;max-width:none;overflow-x:auto;gap:8px;margin:0 -14px!important;padding:2px 14px 6px!important;scrollbar-width:none;-webkit-overflow-scrolling:touch;}\n  #panel-training .trtop .tract::-webkit-scrollbar{display:none;}\n  #panel-training .trtop .tract .btn{flex:0 0 auto!important;width:auto!important;min-height:38px;padding:8px 14px!important;border-radius:999px!important;font-size:13.5px!important;white-space:nowrap;}\n}\n"; document.head.appendChild(s); }catch(e){} })();
/* =====================================================================
   Sportzentrale Beta 0.56 · Helfer-Einsatzplan und Rundnachricht
   - Schichtplan einer Checkliste „für den Helferpool freigeben“: Helfer tragen sich über ihren persönlichen Link
     (svbsc.albertklee.de/#einsatz=<code>) selbst ein, ohne App-Zugang
   - „Helfer anfragen“: passende Leute aus dem Helferpool, WhatsApp mit fertigem Text und persönlichem Link,
     am Vortag „Erinnern“. Verschickt wird vom eigenen Handy, die App merkt sich, wer gefragt und erinnert ist.
   - Rundnachricht (Admin und Vorstand): an alle oder an Rollen, als Meldung in der App und Mitteilung aufs Handy
   ===================================================================== */
const E5={d:null,nur:'passend',links:null};
const E5_LINK='https://svbsc.albertklee.de/#einsatz=';
const E5_ROLLEN=[['vorstand','Vorstand'],['planer','Planer'],['trainer','Trainer'],['jugend','Jugend'],['admin','Admin'],['viewer','Gäste']];
function e5Url(tok){ return E5_LINK+tok; }
function e5Datum(d){ try{ return new Date(d+'T12:00:00').toLocaleDateString('de-DE',{weekday:'long',day:'numeric',month:'long'}); }catch(e){ return d; } }
function e5Kurz(ts){ try{ return new Date(ts).toLocaleDateString('de-DE',{day:'2-digit',month:'2-digit'}); }catch(e){ return ''; } }
function e5Ich(){ return (typeof SVU!=='undefined'&&SVU.name)||''; }
function e5Tage(d){ const h=new Date(); h.setHours(12,0,0,0); return Math.round((new Date(d+'T12:00:00')-h)/864e5); }

/* ---------- Schichtplan in der Checkliste: Freigabe und „Helfer anfragen“ ---------- */
{ const _sh54=ogSchichtHtml; ogSchichtHtml=function(L){ const h=_sh54.apply(this,arguments);
  try{ if(!h||!(OG.ue&&OG.ue.darf)||!(L.schichten||[]).length)return h;
    const box=`<div class="e5-box${L.helfer_offen?' an':''}"><label class="e5-sw"><input type="checkbox" id="e5Frei"${L.helfer_offen?' checked':''}><span><b>Für den Helferpool freigeben</b>
        <small>${L.helfer_offen?'Helfer aus dem Pool tragen sich über ihren persönlichen Link selbst ein.':'Dann tragen sich Helfer aus dem Pool über ihren persönlichen Link selbst ein, ganz ohne App.'}</small></span></label>
      <button type="button" class="btn sm" id="e5Anfragen">🙌 Helfer anfragen</button></div>`;
    return h.includes('<a class="og-papier"')?h.replace('<a class="og-papier"',box+'<a class="og-papier"'):h.replace(/<\/div>\s*$/,box+'</div>');
  }catch(e){ return h; } }; }
{ const _sw54=ogSchichtWire; ogSchichtWire=function(P){ const r=_sw54.apply(this,arguments);
  try{ const S=(OG.L&&OG.L.schichten)||[];
    P.querySelectorAll('.og-schicht .og-sr').forEach((row,i)=>{ const H=(S[i]&&S[i].h)||[]; row.querySelectorAll('.og-shn').forEach((sp,j)=>{ if(H[j]&&H[j].hp){ sp.classList.add('e5-pool'); sp.title='Aus dem Helferpool, selbst eingetragen'; } }); });
    const f=P.querySelector('#e5Frei'); if(f)f.onchange=async()=>{ try{ const R=await ogRpc('einsatz_freigeben',{p_liste:OG.L.id,p_an:f.checked}); OG.L=Object.assign(OG.L,R); ogListeZeigen();
      kToast(f.checked?'✓ Freigegeben. Jetzt passende Helfer anfragen':'Nicht mehr freigegeben'); if(f.checked)setTimeout(()=>e5Anfragen(),350); }catch(e){ f.checked=!f.checked; kToast('⚠️ '+e.message); } };
    const a=P.querySelector('#e5Anfragen'); if(a)a.onclick=()=>e5Anfragen();
  }catch(e){ console.warn('Einsatzplan',e); } return r; }; }

function e5Frei(L){ return (L.schichten||[]).map(x=>({st:x.st,von:x.von,bis:x.bis,frei:Math.max(0,x.p-(x.h||[]).length)})).filter(x=>x.frei>0); }
function e5Zeit(x){ return x.von?ogZeitraum(x.von,x.bis):''; }
function e5Termin(L){ return `${L.titel} am ${e5Datum(L.datum)}${L.zeit?' um '+L.zeit+' Uhr':''}`; }
function e5TextAnfrage(h,L){ const fr=e5Frei(L), n=e5Ich().split(' ')[0];
  return `Hallo ${h.vorname}, hier ist ${n||'die Orga'} vom SV/BSC Mörlenbach. Für ${e5Termin(L)} suchen wir noch Helfer`+
    (fr.length?`: ${fr.map(x=>x.st+(x.von?' ('+e5Zeit(x)+')':'')).join(', ')}`:'')+`. Hast du Zeit? Über deinen persönlichen Link trägst du dich mit einem Tipp selbst ein:\n${e5Url(h.token)}\n\nDanke dir!`; }
function e5TextErinnern(h,L){ const t=e5Tage(L.datum), wann=t===0?'heute':t===1?'morgen':'am '+e5Datum(L.datum);
  const st=(L.schichten||[]).filter(x=>(x.h||[]).some(y=>y.hp===h.id)).map(x=>x.st+(x.von?' '+e5Zeit(x):''));
  return `Hallo ${h.vorname}, kurze Erinnerung: ${wann} hilfst du bei ${L.titel}${st.length?' ('+st.join(', ')+')':''}. Bitte 15 Minuten vorher an der Station sein. Falls etwas dazwischenkommt, kannst du dich hier austragen:\n${e5Url(h.token)}\n\nDanke, dass du dabei bist!`; }
function e5TextGruppe(L){ const fr=e5Frei(L);
  return `🙌 Helfer gesucht: ${e5Termin(L)}${L.ort?', '+L.ort:''}\n\n`+(fr.length?fr.map(x=>`• ${x.st}${x.von?' '+e5Zeit(x):''}: noch ${x.frei} ${x.frei===1?'Platz':'Plätze'}`).join('\n'):'Alle Schichten sind besetzt, danke!')+
    `\n\nWer mag, schreibt mir kurz. Dann schicke ich dir deinen Link zum Eintragen.`; }

async function e5Anfragen(){
  if(!OG.L||!OG.L.id)return;
  const M=svModal('<div class="og-form e5"><h2>🙌 Helfer anfragen</h2><div class="empty">Lade Helferpool …</div></div>');
  try{ E5.d=await ogRpc('einsatz_helfer',{p_liste:OG.L.id}); }catch(e){ M.querySelector('.empty').textContent='⚠️ '+e.message; return; }
  e5Zeigen();
}
function e5Zeigen(){
  const M=document.getElementById('modal'); if(!M||!E5.d||!OG.L)return;
  const L=OG.L, H=E5.d.helfer||[], S=L.schichten||[], pl=S.reduce((a,x)=>a+x.p,0), bes=S.reduce((a,x)=>a+(x.h||[]).length,0), t=e5Tage(L.datum), bald=t>=0&&t<=2;
  const n={passend:H.filter(h=>h.passt||h.drin).length,alle:H.length,drin:H.filter(h=>h.drin).length};
  const X=H.filter(h=>E5.nur==='alle'||(E5.nur==='drin'?h.drin:(h.passt||h.drin)));
  const bn=(E5.d.bereiche||[]).map(b=>HP_B[b]||b).join(', ');
  M.innerHTML=`<button class="close" id="svClose" aria-label="Schließen">✕</button><div class="og-form e5"><h2>🙌 Helfer anfragen</h2>
    <div class="e5-kopf"><b>${ogE(L.titel)}</b><small>${ogE(e5Datum(L.datum))}${L.zeit?' · '+ogE(L.zeit)+' Uhr':''}</small>
      <div class="e5-bar"><i style="width:${pl?Math.round(bes/pl*100):0}%"></i></div><small>${bes} von ${pl} Plätzen besetzt${pl-bes>0?' · noch '+(pl-bes)+' frei':' · alles besetzt 🎉'}</small></div>
    ${L.helfer_offen?'':`<div class="e5-warn">Noch nicht für den Helferpool freigegeben. Ohne Freigabe zeigt der persönliche Link diesen Termin nicht. <button type="button" class="btn sm" id="e5JetztFrei">Jetzt freigeben</button></div>`}
    <p class="note">„Anfragen“ öffnet WhatsApp auf deinem Handy mit fertigem Text und dem persönlichen Link der Person. Du schickst selbst ab. Passend heißt: hat ${ogE(bn||'den Bereich')} angekreuzt.</p>
    <div class="chips4 e5-f">${[['passend','Passend'],['alle','Alle'],['drin','Eingetragen']].map(([k,l])=>`<button type="button" class="${E5.nur===k?'on':''}" data-e5f="${k}">${l} ${n[k]}</button>`).join('')}</div>
    <div class="e5-l">${X.map(h=>{ const st=(h.schichten||[]).join(', ');
      const zust=h.drin?`<small class="e5-ok">✓ eingetragen: ${ogE(st)}${h.erinnert?' · erinnert '+ogE(e5Kurz(h.erinnert)):''}</small>`:h.angefragt?`<small class="e5-ang">angefragt am ${ogE(e5Kurz(h.angefragt))}</small>`:'';
      const text=h.drin?e5TextErinnern(h,L):e5TextAnfrage(h,L), art=h.drin?'r':'e';
      const knopf=h.handy?`<a class="btn sm${h.drin&&!bald?' ghost':''}${!h.drin&&h.angefragt?' ghost':''}" data-e5log="${ogE(h.id)}" data-art="${art}" data-weg="whatsapp" href="https://wa.me/${ogE(h.handy.replace('+',''))}?text=${encodeURIComponent(text)}" target="_blank" rel="noopener">💬 ${h.drin?'Erinnern':h.angefragt?'Nochmal':'Anfragen'}</a>`
        :`<a class="btn sm ghost" data-e5log="${ogE(h.id)}" data-art="${art}" data-weg="mail" href="mailto:${ogE(h.email)}?subject=${encodeURIComponent('Helfen beim SV/BSC: '+L.titel)}&body=${encodeURIComponent(text)}">✉️ ${h.drin?'Erinnern':'Anfragen'}</a>`;
      return `<div class="e5-r${h.drin?' drin':''}"><div class="e5-w"><b>${ogE(h.vorname+' '+h.nachname)}</b>${h.passt?'<i class="e5-passt">passt</i>':''}
          <small>${ogE((h.bereiche||[]).map(b=>HP_B[b]||b).join(', ')||'ohne Bereich')}</small>${zust}</div>
        <div class="e5-k">${knopf}<button type="button" class="btn ghost sm" data-e5cp="${ogE(h.token)}" aria-label="Persönlichen Link kopieren" title="Persönlichen Link kopieren">🔗</button></div></div>`; }).join('')||'<div class="empty">Hier ist noch niemand. Schau unter „Alle“.</div>'}</div>
    <div class="btnrow sbact"><button type="button" class="btn ghost" id="e5Gruppe">📋 Text für die WhatsApp-Gruppe</button></div>
    <p class="note small">Helfer haben keine App und bekommen von selbst keine Erinnerung. Am Vortag meldet sich die Sportzentrale bei dir, dann reicht ein Tipp auf „Erinnern“.</p></div>`;
  document.getElementById('svClose').onclick=()=>closeOverlay();
  M.querySelectorAll('[data-e5f]').forEach(b=>b.onclick=()=>{ E5.nur=b.dataset.e5f; e5Zeigen(); });
  const jf=M.querySelector('#e5JetztFrei'); if(jf)jf.onclick=async()=>{ try{ const R=await ogRpc('einsatz_freigeben',{p_liste:L.id,p_an:true}); OG.L=Object.assign(OG.L,R); try{ ogListeZeigen(); }catch(e){} kToast('✓ Freigegeben'); e5Zeigen(); }catch(e){ kToast('⚠️ '+e.message); } };
  M.querySelectorAll('[data-e5log]').forEach(a=>a.addEventListener('click',()=>{ const id=a.dataset.e5log, art=a.dataset.art;
    ogRpc('helfer_einladung_merken',{p_helfer:id,p_bereich:art+':'+L.id,p_art:a.dataset.weg}).then(()=>{ const h=H.find(x=>x.id===id); if(h){ if(art==='r')h.erinnert=new Date().toISOString(); else h.angefragt=new Date().toISOString(); } setTimeout(e5Zeigen,400); }).catch(e=>kToast('⚠️ '+e.message)); }));
  M.querySelectorAll('[data-e5cp]').forEach(b=>b.onclick=async()=>{ const u=e5Url(b.dataset.e5cp); try{ await navigator.clipboard.writeText(u); kToast('✓ Persönlicher Link kopiert'); }catch(e){ kToast(u); } });
  M.querySelector('#e5Gruppe').onclick=async()=>{ const t=e5TextGruppe(L); try{ await navigator.clipboard.writeText(t); kToast('✓ Text kopiert, jetzt in der Gruppe einfügen'); }catch(e){ kToast(t); } };
}

/* Meldung „Morgen helfen …“ oder „Noch Plätze frei“ öffnet direkt „Helfer anfragen“ */
{ const _zi54=svzInhalt; svzInhalt=async function(m){ const x=await _zi54.apply(this,arguments);
  if(m&&m.art==='orga'&&(m.data||{}).liste&&(m.data||{}).einsatz)x.knopf=`<button class="btn sv32-go" type="button" data-e5go="${ogE(m.data.liste)}">🙌 <span>${m.data.einsatz==='erinnern'?'Helfer erinnern':'Helfer anfragen'}</span></button>`;
  return x; }; }
{ const _mz54=svMeldungZeigen; svMeldungZeigen=async function(){ const r=await _mz54.apply(this,arguments);
  try{ document.querySelectorAll('#modal [data-e5go]').forEach(b=>b.onclick=()=>{ const id=b.dataset.e5go; closeOverlay(); setTimeout(async()=>{ await ogOeffnen(id); E5.nur='passend'; e5Anfragen(); },60); }); }catch(e){} return r; }; }

/* Helferpool: persönlicher Einsatz-Link je Person */
{ const _hl54=hpLaden; hpLaden=async function(){ const r=await _hl54.apply(this,arguments); try{ E5.links=await ogRpc('helfer_links'); }catch(e){ E5.links=null; } return r; }; }
{ const _hz54=hpZeigen; hpZeigen=function(){ const r=_hz54.apply(this,arguments);
  try{ const M=document.getElementById('modal'); if(M&&E5.links)M.querySelectorAll('.hp-r[data-hp]').forEach(row=>{ const tok=E5.links[row.dataset.hp], k=row.querySelector('.hp-kontakt'); if(!tok||!k||k.querySelector('.e5-hpl'))return;
      const b=document.createElement('button'); b.type='button'; b.className='e5-hpl'; b.textContent='🔗 Einsatz-Link'; b.title='Persönlicher Link: hier trägt sich die Person selbst für Schichten ein';
      b.onclick=async()=>{ const u=e5Url(tok); try{ await navigator.clipboard.writeText(u); kToast('✓ Einsatz-Link kopiert'); }catch(e){ kToast(u); } }; k.appendChild(b); }); }catch(e){} return r; }; }

/* ---------- Rundnachricht (Admin und Vorstand) ---------- */
const RN={rollen:[],v:null};
function rnDarf(){ return ['admin','vorstand'].includes(typeof svRole==='function'?svRole():''); }
{ const _ck54=svCockpit; svCockpit=function(){ const r=_ck54.apply(this,arguments);
  try{ const h=document.querySelector('#svCockpit .svc-h'); if(h&&rnDarf()&&!h.querySelector('#rnBtn')){ const b=document.createElement('button'); b.type='button'; b.className='btn ghost sm'; b.id='rnBtn'; b.innerHTML='📣 Rundnachricht'; b.onclick=()=>rnOeffnen(); h.appendChild(b); } }catch(e){} return r; }; }
