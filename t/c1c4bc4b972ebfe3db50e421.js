async function sv41LoadBet(force){
  if(typeof canTraining!=='function'||!canTraining()||SV41.betBusy||(SV41.betLoaded&&!force)||!SVB||!SVB.sb)return;
  SV41.betBusy=true;
  try{ const {data,error}=await SVB.sb.from('spieler_beteiligung').select('*').order('saison',{ascending:false}).limit(3000); if(error)throw error;
    SV41.bet=data||[]; SV41.betLoaded=true; SV41._idx=null; try{ sv4Bump(); }catch(e){} }
  catch(e){ console.warn('Beteiligung',e.message||e); SV41.betLoaded=true; }
  finally{ SV41.betBusy=false; }
  try{ const cur=typeof svCurTab==='function'?svCurTab():''; if(cur==='training'&&(TR.view==='bet'||TR.view==='games'))trRender(); if(cur==='kader'&&typeof kd4Render==='function')kd4Render(); }catch(e){}
}
{ const _ra41=renderAll; renderAll=function(){ SV41._idx=null; return _ra41.apply(this,arguments); }; }
{ const _l41=sv4Load; sv4Load=async function(){ const r=await _l41.apply(this,arguments); sv41LoadBet(); return r; }; }
function sv41Idx(){
  if(SV41._idx)return SV41._idx; const byN=new Map();
  SV41.bet.forEach(r=>{ const k=sv41N(r.name); if(!byN.has(k))byN.set(k,[]); byN.get(k).push(r); });
  const pid=new Map(); (typeof players!=='undefined'?players:[]).forEach(p=>{ if(p.isJugend)return; const k=sv41N(p.name); if(byN.has(k)&&(!pid.has(k)||p.own))pid.set(k,p.id); });
  SV41._idx={byN,pid}; return SV41._idx;
}
function sv41Bet(p){ if(!p||!SV41.bet.length||p.isJugend)return []; return (sv41Idx().byN.get(sv41N(p.name))||[]).slice().sort((a,b)=>b.saison.localeCompare(a.saison)); }
function sv41Seasons(){ return [...new Set(SV41.bet.map(r=>r.saison))].sort().reverse(); }
function sv41Bar(v){ const c=v==null?'var(--ink3)':v>=75?'var(--ok,#22c55e)':v>=55?'#eab308':'#ef4444'; return `<i class="b41"><u style="width:${v||0}%;background:${c}"></u></i>`; }

/* ---------- Mannschaft → Beteiligung ---------- */
SV4_HUB.mannschaft.tabs.splice(SV4_HUB.mannschaft.tabs.findIndex(([k])=>k==='training:players')+1,0,['training:bet','Beteiligung']);
{ const _tr41=trRender; trRender=function(){
  if(typeof TR==='undefined'||TR.view!=='bet')return _tr41.apply(this,arguments);
  const h=trViewHome; trViewHome=tm41Bet; TR.view='home';
  try{ return _tr41.apply(this,arguments); }finally{ trViewHome=h; TR.view='bet'; }
}; }
function tm41Bet(B){
  if(!SV41.betLoaded){ B.innerHTML='<div class="card"><div class="empty">Lade Beteiligung …</div></div>'; sv41LoadBet(); return; }
  const ys=sv41Seasons();
  if(!ys.length){ B.innerHTML='<div class="card"><div class="empty">Noch keine Beteiligungslisten vorhanden.</div></div>'; return; }
  const s=SV41.bs&&ys.includes(SV41.bs)?SV41.bs:ys[0], L=SV41.bet.filter(r=>r.saison===s), f=L[0]||{};
  const rows=L.map(r=>({r,t:sv41Pct(r.training,r.training_max),g:sv41Pct(r.training+r.spiele+r.zuschauer+(r.events||0),(r.training_max||0)+(r.spiele_max||0)+Math.max(0,...L.map(x=>x.events||0)))}))
    .sort((a,b)=>(b.g||0)-(a.g||0)||(b.t||0)-(a.t||0));
  const I=sv41Idx(), mon=String(f.monat_lbl||'').split(' ');
  const mmax=mon.map((_,i)=>Math.max(1,...L.map(r=>(r.monate||[])[i]||0)));
  const avgT=rows.length?Math.round(rows.reduce((a,x)=>a+(x.t||0),0)/rows.length):null;
  B.innerHTML=tm4Chips(ys.map(y=>[y,sv41Lbl(y)]),s,'data-bs')+`<div class="card">
    <div class="vrat-h"><h3 class="trh" style="margin:0">${SVI('activity')} Trainings- & Spielbeteiligung ${sv41Lbl(s)} <small>${f.stand?'Stand '+sv4D(f.stand):'ganze Saison'}</small></h3></div>
    <div class="kd4-sum"><span><b>${f.training_max||'–'}</b> Trainings</span><span><b>${f.spiele_max||'–'}</b> Spiele (Pflicht + Test)</span><span><b>${L.length}</b> Spieler</span><span class="${avgT>=70?'ok':avgT<55?'bad':''}">Ø Training <b>${avgT!=null?avgT+' %':'–'}</b></span></div>
    <div class="trtw"><table class="trtab b41t"><thead><tr><th>Spieler</th><th>Training</th><th>Spiele</th><th title="Beim Spiel dabei, ohne zu spielen">Zusch.</th><th>Gesamt</th><th class="b41m">Monate (${sv4Esc(mon[0]||'')}–${sv4Esc(mon[mon.length-1]||'')})</th></tr></thead><tbody>
    ${rows.map(({r,t,g})=>{ const pid=I.pid.get(sv41N(r.name));
      return `<tr${pid?` data-svp="${sv4Esc(pid)}"`:''}><td><b>${sv4Esc(r.name)}</b></td>
        <td><span class="b41c">${sv41Bar(t)}<em><span class="b41n">${r.training}<small>/${r.training_max}</small> · </span>${t!=null?t+' %':'–'}</em></span></td>
        <td>${r.spiele}<small>/${r.spiele_max}</small></td><td>${r.zuschauer||'–'}</td><td><b>${g!=null?g+' %':'–'}</b></td>
        <td class="b41m"><span class="b41mo">${(r.monate||[]).map((v,i)=>`<i title="${sv4Esc(mon[i]||'')}: ${v}" style="opacity:${v?0.25+0.75*v/mmax[i]:0.08}"></i>`).join('')}</span></td></tr>`; }).join('')}</tbody></table></div>
    <p class="note small">Quelle: Beteiligungslisten von Julian (je Saison). Spiele = Pflicht- und Testspiele, in denen der Spieler gespielt hat · Zuschauer = beim Spiel dabei, ohne zu spielen · Gesamt = Training + Spiele + Zuschauer${L.some(x=>x.events)?' + Events':''} geteilt durch alle Termine.
    ${s===sv41Long(sv4S())?' Neue Einheiten am besten direkt hier in der App erfassen („Training erfassen“), dann rechnet der Co-Trainer mit.':''}</p></div>`;
  B.querySelectorAll('[data-bs]').forEach(x=>x.onclick=()=>{ SV41.bs=x.dataset.bs; tm41Bet(B); });
  B.querySelectorAll('tr[data-svp]').forEach(r=>r.onclick=()=>openModal(r.dataset.svp));
}

/* ---------- Profil: Beteiligung je Saison ---------- */
function pf41BetHtml(p){
  const L=sv41Bet(p); if(!L.length)return '';
  return `<h5 class="pf41h">Trainings- & Spielbeteiligung ${sv4I('Beteiligung',{art:'Datenbestand',quelle:'Beteiligungslisten von Julian (PDF je Saison)',txt:'Training = besuchte Einheiten. Spiele = Pflicht- und Testspiele, in denen er gespielt hat. Zuschauer = beim Spiel dabei, ohne zu spielen.'})}</h5>
    <table class="pf4-st pf41"><thead><tr><th>Saison</th><th>Training</th><th>Spiele</th><th>Zusch.</th></tr></thead><tbody>
    ${L.map(r=>{ const t=sv41Pct(r.training,r.training_max); return `<tr><th>${sv41Lbl(r.saison)}${r.stand?`<small>Stand ${sv4D(r.stand)}</small>`:''}</th><td><span class="b41c">${sv41Bar(t)}<em>${r.training}/${r.training_max} · ${t!=null?t+' %':'–'}</em></span></td><td><b>${r.spiele}</b><small>/${r.spiele_max}</small></td><td>${r.zuschauer||'–'}</td></tr>`; }).join('')}</tbody></table>`;
}
{ const _ps41=pf4SeasonsHtml; pf4SeasonsHtml=function(p){
  let h=_ps41.apply(this,arguments);
  const L=sv41Bet(p);
  h=h.replace(' 23/24 fehlt noch (FuPa-Daten folgen).',L.some(r=>r.saison==='2023/24')?' 23/24: Spiele und Training aus Julians Liste (Tore liegen für die Saison nicht vor).':'');
  return h+pf41BetHtml(p);
}; }

/* ---------- Kaderplan: Trainingsquote der laufenden Saison ---------- */
{ const _kr41=kd4Row; kd4Row=function(p){
  const h=_kr41.apply(this,arguments); const r=sv41Bet(p).find(x=>x.saison===sv41Long(sv4S())); if(!r)return h;
  const t=sv41Pct(r.training,r.training_max);
  return h.replace('<span class="kr4-o"',`<span class="kr4-t ${t>=75?'ok':t<55?'bad':''}" title="Training ${sv41Lbl(r.saison)}: ${r.training} von ${r.training_max}${r.stand?' (Stand '+sv4D(r.stand)+')':''}">🏃 ${t} %</span><span class="kr4-o"`);
}; }

/* ---------- Bilder verkleinern ---------- */
function sv41Img(file,edge,maxLen){ return new Promise((res,rej)=>{ const u=URL.createObjectURL(file), img=new Image();
  img.onerror=()=>{ URL.revokeObjectURL(u); rej(new Error('Kein gültiges Bild: '+file.name)); };
  img.onload=()=>{ const k=Math.min(1,edge/Math.max(img.width,img.height)), c=document.createElement('canvas');
    c.width=Math.max(1,Math.round(img.width*k)); c.height=Math.max(1,Math.round(img.height*k)); c.getContext('2d').drawImage(img,0,0,c.width,c.height);
    URL.revokeObjectURL(u); let q=0.82, d=c.toDataURL('image/jpeg',q);
    while(d.length>maxLen&&q>0.35){ q-=0.1; d=c.toDataURL('image/jpeg',q); }
    if(d.length>maxLen){ const c2=document.createElement('canvas'); c2.width=Math.round(c.width*0.7); c2.height=Math.round(c.height*0.7); c2.getContext('2d').drawImage(c,0,0,c2.width,c2.height); d=c2.toDataURL('image/jpeg',0.6); }
    d.length>maxLen?rej(new Error('Bild zu groß: '+file.name)):res(d); };
  img.src=u; }); }

/* ---------- Spielerfotos auf einen Schlag ---------- */
function sv41FotoPool(){ const I=sv41Idx();
  return players.filter(p=>!p.isJugend&&(p.own||p.exSvbc||I.byN.has(sv41N(p.name))||(typeof sv4Archiv==='function'&&sv4Archiv(p).length)))
    .sort((a,b)=>(b.own?1:0)-(a.own?1:0)||a.name.localeCompare(b.name,'de')); }
function sv41Guess(fname,pool){
  const b=sv41N(String(fname).replace(/\.[a-z0-9]{2,5}$/i,'').replace(/\(\d+\)/g,'')); if(b.length<3)return null;
  const C=pool.map(p=>{ const parts=String(p.name).split(/\s+/).map(sv41N).filter(Boolean); return {p,f:parts[0]||'',l:parts[parts.length-1]||'',full:parts.join('')}; });
  const one=a=>a.length===1?a[0].p:null;
  const run=X=>one(X.filter(c=>c.full===b))||one(X.filter(c=>c.f+c.l===b))||one(X.filter(c=>c.l===b))||one(X.filter(c=>c.f===b))
    ||(b.length>=4?one(X.filter(c=>c.l.startsWith(b)))||one(X.filter(c=>c.f.startsWith(b))):null);
  return run(C.filter(c=>c.p.own))||run(C);
}
function sv41FotoTool(files){
  const pool=sv41FotoPool(), F=[...files].filter(f=>/^image\//.test(f.type)||/\.(jpe?g|png|webp|heic)$/i.test(f.name)).slice(0,120);
  if(!F.length){ kToast('Keine Bilder ausgewählt'); return; }
  const G=F.map(f=>({f,u:URL.createObjectURL(f),p:sv41Guess(f.name,pool)}));
  const opts=sel=>`<option value="">– überspringen –</option>`+pool.map(p=>`<option value="${sv4Esc(p.id)}"${sel===p.id?' selected':''}>${sv4Esc(p.name)}${p.own?'':' (ehem.)'}${p.photo?' · hat Foto':''}</option>`).join('');
  const M=svModal(`<div class="mhead"><div class="rm-ic" style="width:46px;height:46px">${SVI('user')}</div><div><h2 style="margin:0">Spielerfotos zuordnen</h2><div class="msub">${G.filter(x=>x.p).length} von ${G.length} automatisch erkannt, bitte kurz prüfen</div></div></div>
    <div class="f41g">${G.map((x,i)=>`<label class="f41"><img src="${x.u}" alt=""><span>${sv4Esc(x.f.name)}</span><select data-f41="${i}">${opts(x.p&&x.p.id)}</select></label>`).join('')}</div>
    <label class="f41x"><input type="checkbox" id="f41ow"> Vorhandene Fotos ersetzen</label>
    <div class="btnrow" style="margin-top:12px"><button class="btn" id="f41go">${SVI('check')} Fotos speichern</button><button class="btn ghost" id="f41no">Abbrechen</button></div>
    <p class="note small">Fotos werden quadratisch zugeschnitten (320 px) und sind nur fürs Team sichtbar. Nur Senioren, keine Fotos von Jugendspielern.</p>`);
  const done=()=>G.forEach(x=>URL.revokeObjectURL(x.u));
  M.querySelector('#f41no').onclick=()=>{ done(); closeOverlay(); };
  M.querySelector('#f41go').onclick=async()=>{
    const b=M.querySelector('#f41go'), ow=M.querySelector('#f41ow').checked; b.disabled=true; let n=0, skip=0, bad=[];
    const seen=new Set();
    for(let i=0;i<G.length;i++){
      const id=M.querySelector(`[data-f41="${i}"]`).value; if(!id||seen.has(id)){ continue; } seen.add(id);
      const p=players.find(x=>x.id===id); if(!p||p.isJugend)continue;
      if(p.photo&&!ow){ skip++; continue; }
      b.textContent=`Speichere ${n+1} …`;
      try{ const data=await scSquare(G[i].f,320); const {error}=await SVB.sb.from('player_photos').upsert({player_id:id,data},{onConflict:'player_id'}); if(error)throw error; p.photo=data; SVC.photos.set(id,data); n++; }
      catch(e){ bad.push(G[i].f.name); }
    }
    done(); closeOverlay(); try{ renderAll(); }catch(e){}
    kToast(`📷 ${n} Foto${n===1?'':'s'} gespeichert${skip?` · ${skip} übersprungen (hatten schon eins)`:''}${bad.length?` · ${bad.length} fehlgeschlagen`:''}`);
    try{ svAdminRender(); }catch(e){}
  };
}

/* ---------- Saison-Album ---------- */
const sv41CanAlbum=()=>['admin','vorstand','planer'].includes(svRole());
async function sv41AlbumLoad(y,force){
  if((SV41.album.has(y)&&!force)||SV41.albumBusy.has(y))return; SV41.albumBusy.add(y);
  try{ const {data,error}=await SVB.sb.from('saison_bilder').select('id,saison,titel,datum,thumb,created_by').eq('saison',y).order('datum',{ascending:true,nullsFirst:false}).order('id').limit(300); if(error)throw error; SV41.album.set(y,data||[]); }
  catch(e){ console.warn('Album',e.message||e); SV41.album.set(y,[]); }
  finally{ SV41.albumBusy.delete(y); }
}
function sv41AlbumHtml(y){ return `<details class="pf4-sec a41" data-a41="${sv4Esc(y)}"><summary><span>📸 Saison-Album ${sv41Lbl(y)}</span><em data-a41n>${SV41.album.has(y)?SV41.album.get(y).length:''}</em></summary><div class="pf4-b" data-a41b><div class="empty">Lade Bilder …</div></div></details>`; }
function sv41AlbumWire(root){
  root.querySelectorAll('[data-a41]').forEach(d=>{ const y=d.dataset.a41;
    const draw=()=>{ const L=SV41.album.get(y)||[], B=d.querySelector('[data-a41b]'); d.querySelector('[data-a41n]').textContent=L.length||'';
      B.innerHTML=`${L.length?`<div class="a41g">${L.map(x=>`<button type="button" class="a41i" data-a41o="${x.id}" title="${sv4Esc(x.titel||'')}"><img src="${x.thumb}" alt="" loading="lazy"><span>${sv4Esc(x.titel||'')}${x.datum?` · ${sv4D(x.datum)}`:''}</span></button>`).join('')}</div>`:'<div class="empty">Noch keine Bilder für diese Saison.</div>'}
        ${sv41CanAlbum()?`<div class="btnrow" style="margin-top:10px"><label class="btn sm ghost">${SVI('plus')} Bilder hinzufügen<input type="file" accept="image/*" multiple hidden data-a41up></label><span class="note small" data-a41st></span></div>`:''}`;
      B.querySelectorAll('[data-a41o]').forEach(b=>b.onclick=()=>sv41AlbumShow(y,+b.dataset.a41o,()=>draw()));
      const up=B.querySelector('[data-a41up]'); if(up)up.onchange=()=>sv41AlbumUpload(y,up.files,B.querySelector('[data-a41st]'),draw); };
    const go=()=>{ if(SV41.album.has(y))draw(); else sv41AlbumLoad(y).then(draw); };
    d.addEventListener('toggle',()=>{ if(d.open)go(); });
    if(d.open)go(); });
}
function sv41TitelDatum(name,y){
  let t=String(name).replace(/\.[a-z0-9]{2,5}$/i,'').replace(/\s*\(\d+\)\s*$/,'').replace(/_\d{2,4}$/,'').replace(/[_]+/g,' ').replace(/\s{2,}/g,' ').trim();
  const y1=+String(y).slice(0,4), y2=y1+1; let d=null, m;
  if((m=t.match(/(20\d{2})[ ._-](\d{2})[ ._-](\d{2})/)))d=`${m[1]}-${m[2]}-${m[3]}`;
  else if((m=t.match(/(?:^|\D)(\d{1,2})\.(\d{1,2})\.?(\d{2,4})?(?!\d)/))){ const mo=+m[2], da=+m[1]; if(mo>=1&&mo<=12&&da>=1&&da<=31){ const yy=m[3]?(m[3].length===2?2000+ +m[3]:+m[3]):(mo>=7?y1:y2); d=`${yy}-${String(mo).padStart(2,'0')}-${String(da).padStart(2,'0')}`; } }
  t=t.replace(/(20\d{2})[ ._-](\d{2})[ ._-](\d{2})/,'');
  if(d&&m&&m[0]&&!/^20\d{2}/.test(m[0].trim()))t=t.replace(m[0].replace(/^\D/,''),'');
  t=t.replace(/\s+(am|vom)\s*$/i,'').replace(/\s{2,}/g,' ').trim();
  return {titel:t.slice(0,120)||null,datum:d};
}
async function sv41AlbumUpload(y,files,st,draw){
  const F=[...files].slice(0,60); let n=0, bad=0;
  for(const f of F){
    if(st)st.textContent=`Lade ${n+bad+1} von ${F.length} hoch …`;
    try{ const [bild,thumb]=[await sv41Img(f,1600,500000),await sv41Img(f,420,58000)]; const {titel,datum}=sv41TitelDatum(f.name,y);
      const {error}=await SVB.sb.from('saison_bilder').insert({saison:y,titel,datum,thumb,bild}); if(error)throw error; n++; }
    catch(e){ bad++; console.warn(e); }
  }
  await sv41AlbumLoad(y,true); draw(); kToast(`📸 ${n} Bild${n===1?'':'er'} hinzugefügt${bad?` · ${bad} fehlgeschlagen`:''}`);
}
async function sv41AlbumShow(y,id,after){
  const L=SV41.album.get(y)||[], i=L.findIndex(x=>x.id===id), x=L[i]; if(!x)return;
  const me=SVB.user&&SVB.user.id, del=['admin','vorstand'].includes(svRole())||x.created_by===me;
  const M=svModal(`<div class="a41v"><img src="${x.thumb}" alt="" id="a41img"><div class="a41vh"><b>${sv4Esc(x.titel||'Bild')}</b><span>${x.datum?sv4D(x.datum)+' · ':''}${sv41Lbl(y)} · ${i+1}/${L.length}</span></div>
    <div class="btnrow">${i>0?`<button class="btn sm ghost" data-a41n="-1">‹ Zurück</button>`:''}${i<L.length-1?`<button class="btn sm ghost" data-a41n="1">Weiter ›</button>`:''}${del?`<button class="btn sm ghost" data-a41d>${SVI('trash')} Löschen</button>`:''}</div></div>`);
  M.querySelectorAll('[data-a41n]').forEach(b=>b.onclick=()=>sv41AlbumShow(y,L[i+ +b.dataset.a41n].id,after));
  const d=M.querySelector('[data-a41d]'); if(d)d.onclick=async()=>{ if(d.dataset.sure!=='1'){ d.dataset.sure='1'; d.textContent='Wirklich löschen?'; return; }
    const {error}=await SVB.sb.from('saison_bilder').delete().eq('id',x.id); if(error){ kToast('⚠️ '+error.message); return; }
    SV41.album.set(y,L.filter(z=>z.id!==x.id)); closeOverlay(); kToast('Bild gelöscht'); if(after)after(); };
  try{ const {data}=await SVB.sb.from('saison_bilder').select('bild').eq('id',id).single(); const im=M.querySelector('#a41img'); if(data&&im&&M.contains(im))im.src=data.bild; }catch(e){}
}

/* ---------- Verwaltung: Spielerfotos & n8n-Verbindung ---------- */
{ const _ad41=svAdminRender; svAdminRender=async function(){
  const r=await _ad41.apply(this,arguments); const P=document.getElementById('panel-admin'); if(!P||!canManage())return r;
  P.querySelectorAll('.adm41').forEach(x=>x.remove());
  const pool=sv41FotoPool(), mit=pool.filter(p=>p.photo).length;
  const c=document.createElement('div'); c.className='card adm41';
  c.innerHTML=`<div class="adm-head"><div><h3 style="margin:0">📷 Spielerfotos auf einen Schlag</h3><p style="margin:6px 0 0;font-size:13.5px">Mehrere Porträts auswählen (z. B. alle aus dem Drive-Ordner „Spielerbilder“). Die App erkennt am Dateinamen, wer drauf ist. Vor dem Speichern prüfst du die Zuordnung.</p></div>
    <div class="adm-stats"><div class="adm-stat"><b>${mit}</b><span>mit Foto</span></div><div class="adm-stat"><b>${pool.filter(p=>p.own&&!p.photo).length}</b><span>eigene ohne Foto</span></div></div></div>
    <label class="btn" style="margin-top:10px">${SVI('plus')} Fotos auswählen<input type="file" accept="image/*" multiple hidden id="f41in"></label>`;
  P.appendChild(c); c.querySelector('#f41in').onchange=e=>sv41FotoTool(e.target.files);
  if(isAdmin())await sv41RelayCard(P);
  return r;
}; }
async function sv41RelayCard(P){
  let R=null; try{ const {data,error}=await SVB.sb.rpc('admin_relay_get'); if(error)throw error; R=data; }catch(e){ return; }
  const row=(k,t,d,o)=>{ const x=R[k]||{}; return `<div class="r41"><div class="r41h"><b>${t}</b>${x.url&&x.key?'<span class="pill on">verbunden</span>':'<span class="pill wait">nicht eingerichtet</span>'}</div><p class="note small">${d}</p>
    <div class="r41f"><input class="search" data-r41="${k}" placeholder="https://dein-n8n.de/webhook/…" value="${sv4Esc(x.url||'')}">${o||''}<button class="btn sm" data-r41s="${k}">Speichern</button></div></div>`; };
  const S=R.server||{}, st=(ok,t1,t2)=>ok?`<span class="pill on">${t1}</span>`:`<span class="pill wait">${t2}</span>`;
  const c=document.createElement('div'); c.className='card adm41';
  c.innerHTML=`<div class="adm-head"><div><h3 style="margin:0">🔌 Versand & Zugänge</h3><p style="margin:6px 0 0;font-size:13.5px">WhatsApp (Superchat) und Mail laufen direkt über den Server der App. Die Schlüssel liegen nur als Supabase-Secret, nie in der App.</p></div>
      <button class="btn sm ghost" data-r41chk>${SVI('check')} Jetzt prüfen</button></div>
    <div class="r41 r41z"><div class="r41h"><b>💬 WhatsApp-Versand (Kabine)</b>${st(S.superchat,'aktiv','Schlüssel fehlt')}</div><p class="note small">Supabase → Edge Functions → Secrets: <code>SUPERCHAT_API_KEY</code> mit dem API-Schlüssel aus Superchat (Einstellungen → Entwickler). Danach unter Mannschaft → Automatik die WhatsApp-Vorlagen und Empfänger eintragen.</p></div>
    <div class="r41 r41z"><div class="r41h"><b>✉️ Berichte per Mail</b>${st(S.mail,'aktiv','Schlüssel fehlt')}</div><p class="note small">Supabase → Edge Functions → Secrets: <code>RESEND_API_KEY</code> (Resend → API Keys, „Sending access“ reicht). Absender: ${sv4Esc(S.absender||'')}</p></div>
    <div class="r41 r41z"><div class="r41h"><b>🤖 KI (Claude)</b>${st(S.ki,'aktiv','Schlüssel fehlt')}</div></div>
    <p class="note small" data-r41msg>Nach dem Anlegen eines Secrets einmal „Jetzt prüfen“ tippen, sonst prüft die App es automatisch in der Nacht.</p>
    <details class="r41alt"><summary>Alternativ: eigener n8n-Server (dann auch Drive-Ablage)</summary>
    ${row('kabine','WhatsApp-Versand über n8n','Nur nötig, wenn der Superchat-Zugang in n8n statt auf dem Server liegen soll.')}
    ${row('berichte','Berichte in den Drive / per Mail über n8n','Excel/PDF-Berichte landen im Drive-Ordner oder im Postfach.',`<input class="search" data-r41o placeholder="Drive-Ordner" value="${sv4Esc((R.berichte||{}).ordner||'')}" style="max-width:190px">`)}
    <div data-r41k></div></details>`;
  P.appendChild(c);
  c.querySelector('[data-r41chk]').onclick=async e=>{ const b=e.currentTarget; b.disabled=true; b.textContent='Prüfe …';
    try{ const {data,error}=await SVB.sb.functions.invoke('ki-check',{body:{}}); if(error)throw error;
      const t=(x,n)=>x?(x.gueltig===false?`${n}: Schlüssel „${x.name}“ wird abgelehnt`:`${n}: ✓ (${x.name})`):`${n}: kein Schlüssel gefunden`;
      c.querySelector('[data-r41msg]').textContent=[t(data.superchat,'WhatsApp'),t(data.resend,'Mail'),data.secret?'KI: ✓':'KI: kein Schlüssel'].join(' · ');
      c.remove(); await sv41RelayCard(P); const m=P.querySelector('.adm41:last-child [data-r41msg]'); if(m)m.textContent=[t(data.superchat,'WhatsApp'),t(data.resend,'Mail'),(data.secret||(data.andere||[]).some(a=>a.gueltig))?'KI: ✓':'KI: kein Schlüssel'].join(' · '); }
    catch(err){ b.disabled=false; b.innerHTML=SVI('check')+' Jetzt prüfen'; kToast('⚠️ Prüfung fehlgeschlagen: '+String(err.message||err)); } };
  c.querySelectorAll('[data-r41s]').forEach(b=>b.onclick=async()=>{
    const k=b.dataset.r41s, url=c.querySelector(`[data-r41="${k}"]`).value.trim(), o=k==='berichte'?c.querySelector('[data-r41o]').value.trim():null;
    if(url&&!/\/webhook\//.test(url)){ kToast('Bitte die komplette Production-URL aus dem Webhook-Knoten einfügen (…/webhook/…)'); return; }
    b.disabled=true;
    try{ const {data,error}=await SVB.sb.rpc('admin_relay_set',{p_art:k,p_url:url||null,p_ordner:o||null}); if(error)throw error;
      if(data&&data.schluessel_neu){ c.querySelector('[data-r41k]').innerHTML=`<div class="r41n"><b>Neuer Schlüssel: einmalig angezeigt</b><p class="note small">In n8n im Knoten „Prüfen“ den Schlüssel durch diesen ersetzen:</p><code>${sv4Esc(data.schluessel_neu)}</code></div>`; }
      kToast(url?'✓ n8n-Verbindung gespeichert':'Verbindung entfernt'); b.disabled=false;
      const st=b.closest('.r41').querySelector('.pill'); if(st){ st.className='pill '+(url?'on':'wait'); st.textContent=url?'verbunden':'nicht eingerichtet'; } }
    catch(e){ b.disabled=false; kToast('⚠️ '+String(e.message||e)); }
  });
}

/* ---------- Mannschaft → Spiele: Album für jede Saison ---------- */
{ const _vg41=trViewGames; trViewGames=function(B){
  const r=_vg41.apply(this,arguments);
  try{ const now=sv4S(), s=TM4.gs||now, y=s.length===4?sv41Long(s):s;
    if(!B.querySelector('.a41')){ B.insertAdjacentHTML('beforeend',sv41AlbumHtml(y)); sv41AlbumWire(B); } }catch(e){ console.warn(e); }
  return r;
}; }

/* =====================================================================
   Sportzentrale 4.3 · Bewegung & Haptik
   - Seitenwechsel mit Richtung (vor/zurück), Karten erscheinen kurz nacheinander
   - Gleitender Unterstrich in der Reiter-Leiste
   - Haptik: kurzes Tippen-Gefühl bei Navigation/Auswahl (Android per Vibration, iPhone ab iOS 18 über einen Schalter),
     Erfolg/Warnung bei Meldungen. Aus bei „Bewegung reduzieren“ oder in „Mein Konto“ (svHaptik).
   - Pausiert Animationen, wenn die App im Hintergrund ist
   ===================================================================== */
const SV43={sw:null,last:null,order:[],hubRect:null};
const sv43Reduced=()=>{ try{ return matchMedia('(prefers-reduced-motion: reduce)').matches; }catch(e){ return false; } };
const sv43HapOn=()=>{ try{ return localStorage.getItem('svHaptik')!=='aus'; }catch(e){ return true; } };
function svHaptic(kind){
  try{
    if(sv43Reduced()||!sv43HapOn())return;
    const pat={light:8,medium:14,success:[10,50,18],warn:[22,60,22]}[kind||'light']||8;
    if(navigator.vibrate&&/Android/i.test(navigator.userAgent)){ navigator.vibrate(pat); return; }
    // iPhone (Safari ab iOS 18): ein unsichtbarer Schalter gibt das System-Tippen aus
    if(!SV43.sw){ const l=document.createElement('label'); l.setAttribute('aria-hidden','true'); l.style.cssText='position:fixed;left:-200px;top:0;width:1px;height:1px;opacity:0;pointer-events:none;overflow:hidden';
      const i=document.createElement('input'); i.type='checkbox'; i.setAttribute('switch',''); i.tabIndex=-1; l.appendChild(i); document.body.appendChild(l); SV43.sw=l; }
    SV43.sw.click();
    if(kind==='success'||kind==='warn')setTimeout(()=>{ try{ SV43.sw.click(); }catch(e){} },90);
  }catch(e){}
}
// Tippen auf Navigation, Reiter, Chips, Auswahl-Knöpfe
document.addEventListener('click',e=>{
  const b=e.target.closest&&e.target.closest('.snav button,.tabbar .ti,.tabbar .tmore,#hubbar [data-hub],.chips4 button,.zk4 button,.kr4-z,.sx-t,.sheet [data-sheet],.kd4-tabs button,.seg button,.r4n button,[data-kz],.fut');
  if(b&&!b.disabled)svHaptic('light');
},true);
// Erfolg / Warnung bei Meldungen
{ const _kt43=kToast; kToast=function(msg){ try{ const m=String(msg||''); if(/^(✓|📷|📸|✅|🎉)/.test(m))svHaptic('success'); else if(/^⚠️/.test(m))svHaptic('warn'); }catch(e){} return _kt43.apply(this,arguments); }; }

// Seitenwechsel: Richtung merken, Karten-Einblendung nur direkt nach dem Wechsel
function sv43Order(){ if(SV43.order.length)return SV43.order;
  const o=[]; document.querySelectorAll('.snav button[data-tab]').forEach(b=>o.push(b.dataset.tab));
  Object.values(typeof SV4_HUB!=='undefined'?SV4_HUB:{}).forEach(h=>h.tabs.forEach(([k])=>{ const t=k.split(':')[0]; if(!o.includes(t))o.push(t); }));
  SV43.order=o; return o; }
let _nav43=null;
{ const _gt45=goTab; goTab=function(tab){
  const prev=typeof svCurTab==='function'?svCurTab():null;
  try{
    if(prev&&tab&&prev!==tab&&!sv43Reduced()){
      const O=sv43Order(); const hk=typeof SV4_OF!=='undefined'?SV4_OF:{};
      const same=hk[prev]&&hk[prev]===hk[tab];
      let dir='';
      if(same){ const H=SV4_HUB[hk[tab]].tabs.map(([k])=>k.split(':')[0]); dir=H.indexOf(tab)>=H.indexOf(prev)?'fwd':'back'; }
      document.body.dataset.nav=dir;
      document.body.classList.add('nav43'); clearTimeout(_nav43); _nav43=setTimeout(()=>document.body.classList.remove('nav43'),700);
    }
  }catch(e){}
  return _gt45.apply(this,arguments);
}; }
// Mannschaft-Unteransichten (Übersicht/Einheiten/Spiele …) wechseln ohne goTab – auch dort sanft einblenden
{ const _sg43=sv4Go; sv4Go=function(k){
  try{ const [t,v]=String(k).split(':'); if(v&&typeof svCurTab==='function'&&svCurTab()===t&&!sv43Reduced()){
    const H=(SV4_HUB[SV4_OF[t]]||{tabs:[]}).tabs.map(([x])=>x), cur=t==='training'?'training:'+(TR.view||'home'):t==='kabine'?'kabine:'+(KB.view||'abst'):t;
    document.body.dataset.nav=H.indexOf(k)>=H.indexOf(cur)?'fwd':'back';
    const P=document.getElementById('panel-'+t); if(P){ P.style.animation='none'; void P.offsetWidth; P.style.animation=''; }
    document.body.classList.add('nav43'); clearTimeout(_nav43); _nav43=setTimeout(()=>document.body.classList.remove('nav43'),700); } }catch(e){}
  return _sg43.apply(this,arguments);
}; }

// Gleitender Unterstrich in der Reiter-Leiste
{ const _hb43=sv4HubBar; sv4HubBar=function(){
  const r=_hb43.apply(this,arguments);
  try{ const bar=document.getElementById('hubbar'), inn=bar&&bar.querySelector('.hub-in'), on=inn&&inn.querySelector('button.on'); if(!inn||!on)return r;
    const ind=document.createElement('i'); ind.className='hub-ind'; inn.appendChild(ind);
    const hub=inn.getAttribute('aria-label')||'', T={x:on.offsetLeft+10,w:Math.max(12,on.offsetWidth-20)}, P=SV43.hubRect&&SV43.hubRect.hub===hub?SV43.hubRect:null;
    const set=(p)=>{ ind.style.width=p.w+'px'; ind.style.transform=`translateX(${p.x}px)`; };
    if(P&&!sv43Reduced()){ ind.style.transition='none'; set(P); void ind.offsetWidth; ind.style.transition=''; requestAnimationFrame(()=>set(T)); } else set(T);
    SV43.hubRect={...T,hub};
  }catch(e){}
  return r;
}; }
window.addEventListener('resize',()=>{ try{ const inn=document.querySelector('#hubbar .hub-in'), on=inn&&inn.querySelector('button.on'), ind=inn&&inn.querySelector('.hub-ind'); if(on&&ind){ ind.style.transition='none'; ind.style.width=Math.max(12,on.offsetWidth-20)+'px'; ind.style.transform=`translateX(${on.offsetLeft+10}px)`; } }catch(e){} },{passive:true});

// Im Hintergrund pausieren (Akku)
document.addEventListener('visibilitychange',()=>document.body.classList.toggle('vh',document.hidden));


// Mein Konto: Haptik an/aus
{ const _acc43=svAccount; svAccount=function(){ const r=_acc43.apply(this,arguments);
  try{ const M=document.getElementById('modal'), app=[...M.querySelectorAll('.editsec')].find(x=>/^App/.test((x.querySelector('h4')||{}).textContent||''));
    if(M&&app&&!M.querySelector('[data-hap43]')){ const on=sv43HapOn();
      app.insertAdjacentHTML('beforeend',`<label class="hap43l"><span><b>Haptik</b><small>Kurzes Tippen-Gefühl bei Navigation und Meldungen (Android, iPhone ab iOS 18)</small></span><input type="checkbox" data-hap43 ${on?'checked':''}></label>`);
      M.querySelector('[data-hap43]').onchange=e=>{ try{ localStorage.setItem('svHaptik',e.target.checked?'an':'aus'); }catch(x){} if(e.target.checked)svHaptic('success'); }; } }catch(e){}
  return r; }; }

/* =====================================================================
   Sportzentrale 4.4 · Töne & „Kein Interesse“ mit Schwung
   - Kleine, leise Töne (im Browser erzeugt, keine Dateien): Tippen, Erfolg, Hinweis, Swoosh
   - Aus in „Mein Konto“ (svToene) · bei stummem iPhone still (Audio-Sitzung „ambient“)
   - „Kein Interesse“: Spieler fliegt mit Swoosh aus der Liste bzw. das Profil schließt sich,
     danach kurze Meldung mit „Rückgängig“
   ===================================================================== */
const SV44={ctx:null,noise:null,busy:false};
const sv44On=()=>{ try{ return localStorage.getItem('svToene')!=='aus'; }catch(e){ return true; } };
function sv44Ctx(){
  if(SV44.ctx)return SV44.ctx;
  const AC=window.AudioContext||window.webkitAudioContext; if(!AC)return null;
  try{ if(navigator.audioSession)navigator.audioSession.type='ambient'; }catch(e){}
  try{ SV44.ctx=new AC(); }catch(e){ return null; }
  return SV44.ctx;
}
// Audio erst nach der ersten Berührung starten (Vorgabe der Browser)
['pointerdown','keydown'].forEach(ev=>document.addEventListener(ev,()=>{ try{ if(!sv44On())return; const c=sv44Ctx(); if(c&&c.state==='suspended')c.resume(); }catch(e){} },{capture:true,passive:true}));
function sv44Noise(c){
  if(SV44.noise)return SV44.noise;
  const n=Math.floor(c.sampleRate*0.6), b=c.createBuffer(1,n,c.sampleRate), d=b.getChannelData(0);
  for(let i=0;i<n;i++)d[i]=Math.random()*2-1;
  return SV44.noise=b;
}
function svSound(kind){
  try{
    if(!sv44On()||document.hidden)return;
    const c=sv44Ctx(); if(!c||c.state!=='running')return;
    const t=c.currentTime+0.005, out=c.createGain(); out.gain.value=1; out.connect(c.destination);
    const tone=(f1,f2,start,dur,vol,type)=>{ const o=c.createOscillator(), g=c.createGain(); o.type=type||'sine';
      o.frequency.setValueAtTime(f1,start); if(f2)o.frequency.exponentialRampToValueAtTime(f2,start+dur);
      g.gain.setValueAtTime(0.0001,start); g.gain.exponentialRampToValueAtTime(vol,start+0.008); g.gain.exponentialRampToValueAtTime(0.0001,start+dur);
      o.connect(g); g.connect(out); o.start(start); o.stop(start+dur+0.02); };
    if(kind==='tick'||kind==='light'){ tone(1650,1100,t,0.035,0.022); return; }
    if(kind==='success'){ tone(880,null,t,0.11,0.035); tone(1318,null,t+0.075,0.16,0.03); return; }
    if(kind==='warn'){ tone(392,294,t,0.16,0.04,'triangle'); return; }
    if(kind==='pop'){ tone(520,880,t,0.07,0.03); return; }
    if(kind==='swoosh'){
      const src=c.createBufferSource(); src.buffer=sv44Noise(c);
      const bp=c.createBiquadFilter(); bp.type='bandpass'; bp.Q.value=1.1;
      bp.frequency.setValueAtTime(380,t); bp.frequency.exponentialRampToValueAtTime(3600,t+0.26); bp.frequency.exponentialRampToValueAtTime(1800,t+0.42);
      const g=c.createGain(); g.gain.setValueAtTime(0.0001,t); g.gain.exponentialRampToValueAtTime(0.16,t+0.12); g.gain.exponentialRampToValueAtTime(0.0001,t+0.44);
      let last=g; if(c.createStereoPanner){ const p=c.createStereoPanner(); p.pan.setValueAtTime(-0.6,t); p.pan.linearRampToValueAtTime(0.7,t+0.4); g.connect(p); last=p; }
      src.connect(bp); bp.connect(g); last.connect(out); src.start(t); src.stop(t+0.46);
    }
  }catch(e){}
}
// Töne an die vorhandene Haptik koppeln (Navigation, Erfolg, Hinweis)
{ const _h44=svHaptic; svHaptic=function(kind){ const r=_h44.apply(this,arguments); try{ svSound(kind||'light'); }catch(e){} return r; }; }

/* ---------- „Kein Interesse“: weg damit, mit Schwung ---------- */
function sv44Refresh(){
  try{ renderAll(); }catch(e){}
  try{ if(typeof sc2After==='function')sc2After(); }catch(e){}
  try{ if(svCurTab()==='bedarf'&&typeof sc4Bedarf==='function')sc4Bedarf(); }catch(e){}
  try{ if(typeof vrAfter==='function')vrAfter(); }catch(e){}   // Rückkehrer-Radar im Verein
}
function sv44Undo(pid,name){
  kToast('🚫 '+name+' ist raus','Rückgängig',()=>{
    try{ crmSet(pid,{s:undefined,u:undefined}); try{crmApply();}catch(x){} sv44Refresh(); svSound('pop'); kToast('↩️ '+name+' ist wieder dabei'); }catch(x){} });
}
document.addEventListener('click',e=>{
  const b=e.target.closest&&e.target.closest('[data-sc2="no"],[data-crm="no"]');
  if(!b||b.__sw44||b.disabled)return;
  if(b.dataset.crm==='no'&&b.classList.contains('on-no'))return;          // Zurücknehmen läuft normal
  const host=b.closest('[data-sc2p]'), M=b.closest('#overlay .modal, #modal');
  const pid=host?host.dataset.sc2p:(typeof CURVIEW!=='undefined'&&CURVIEW&&CURVIEW.id)||null, p=pid&&typeof trP==='function'?trP(pid):null;
  const row=b.closest('.rdit,.sc2k,.sc2f,.kd4r,.kr4-row');
  const still=sv43Reduced();
  e.stopPropagation(); e.preventDefault();
  const fire=()=>{ b.__sw44=1; try{ b.click(); }finally{ b.__sw44=0; } };
  const done=()=>{ if(p)sv44Undo(p.id,p.name); };
  svSound('swoosh'); try{ if(navigator.vibrate&&/Android/i.test(navigator.userAgent)&&sv43HapOn()&&!still)navigator.vibrate([6,40,10]); }catch(x){}
  if(row){
    // Eintrag in einer Liste: zur Seite wegfliegen, dann Lücke schließen
    if(still){ fire(); done(); return; }
    const h=row.getBoundingClientRect().height; row.style.height=h+'px'; row.classList.add('sw44'); void row.offsetWidth; row.classList.add('go');
    setTimeout(()=>{ row.classList.add('zu'); },260);
    setTimeout(()=>{ fire(); done(); },520);
    return;
  }
  if(M){
    // Im Spielerprofil: die ganze Karte fliegt weg, das Profil schließt sich
    const card=M.classList.contains('modal')?M:(M.closest('.modal')||M);
    if(still){ fire(); try{ closeOverlay(); }catch(x){} sv44Refresh(); done(); return; }
    card.classList.add('sw44m'); const ov=document.getElementById('overlay'); if(ov)ov.classList.add('sw44o');
    setTimeout(()=>{ fire(); try{ closeOverlay(); }catch(x){} card.classList.remove('sw44m'); if(ov)ov.classList.remove('sw44o'); sv44Refresh(); done(); },430);
    return;
  }
  fire(); done();
},true);

// Mein Konto: Töne an/aus (neben der Haptik)
{ const _acc44=svAccount; svAccount=function(){ const r=_acc44.apply(this,arguments);
  try{ const M=document.getElementById('modal'), hap=M&&M.querySelector('.hap43l');
    if(hap&&!M.querySelector('[data-snd44]')){ const on=sv44On();
      hap.insertAdjacentHTML('afterend',`<label class="hap43l"><span><b>Töne</b><small>Leise Klicks, ein kurzer Klang bei Erfolg und ein Swoosh, wenn ein Spieler rausfliegt</small></span><input type="checkbox" data-snd44 ${on?'checked':''}></label>`);
      M.querySelector('[data-snd44]').onchange=e=>{ try{ localStorage.setItem('svToene',e.target.checked?'an':'aus'); }catch(x){} if(e.target.checked){ const c=sv44Ctx(); if(c&&c.state==='suspended')c.resume(); setTimeout(()=>svSound('success'),60); } }; } }catch(e){}
  return r; }; }

/* =====================================================================
   Sportzentrale 4.5 · Wischen wie auf dem Sperrbildschirm
   - Spieler in Listen (Scouting, Radar, Bedarf, KI-Aufträge):
       nach rechts wischen = Kein Interesse (fliegt raus, die anderen rücken nach, Rückgängig möglich)
       nach links wischen  = Merkliste an/aus (Eintrag federt zurück)
   - Meldungen: nach rechts wischen = erledigt (gelesen bzw. ausgeblendet)
       „Neu für dich“ → gelesen · Radar ohne Spieler → ausgeblendet · Cockpit-Hinweis → für heute weg
   - Beobachtet: nach rechts = nicht mehr beobachten
   - Erkennt waagerecht vs. senkrecht (Scrollen bleibt ungestört), Tippen bleibt Tippen
   - Beim ersten Mal zeigt ein Eintrag kurz, was geht (einmal pro Gerät)
   ===================================================================== */
const SW45={on:null,hintShown:false,justSwiped:0};
const SW45_SEL='.tra.vrms[data-ms],.tra.vrback,.sw45no[data-id],#list .row[data-id],#gemlist .row[data-id],.rdit,.sc2k,.sc2f[data-sc2open],.bk4r,.sc2m[data-m],.svc-i[data-ins],[data-sc2h]';
const sw45Today=()=>new Date().toLocaleDateString('sv-SE');
function sw45Get(k,d){ try{ return JSON.parse(localStorage.getItem(k)||'null')||d; }catch(e){ return d; } }
function sw45Set(k,v){ try{ localStorage.setItem(k,JSON.stringify(v)); }catch(e){} }

// Radar-Einträge bekommen ihre Kennung, ausgeblendete Meldungen bleiben weg
{ const _ri45=rdItem; rdItem=function(r){ const h=_ri45.apply(this,arguments); return r&&r.id!=null?h.replace(/^<div /,`<div data-rid="${svEsc(String(r.id))}" `):h; }; }
{ const _rr45=rdRender; rdRender=function(){ const hide=new Set(sw45Get('svRdHide',[]).map(String)); if(!hide.size)return _rr45.apply(this,arguments);
  const all=VR.radar; VR.radar=all.filter(r=>!hide.has(String(r.id))); try{ return _rr45.apply(this,arguments); } finally{ VR.radar=all; } }; }
// Cockpit-Hinweise: „für heute erledigt“
const sw45InsKey=x=>sw45Today()+'|'+String(x&&x.t||'');
{ const _si45=svInsights; svInsights=function(){ const L=_si45.apply(this,arguments); const H=new Set(sw45Get('svInsHide',[])); return H.size?L.filter(x=>!H.has(sw45InsKey(x))):L; }; }

// Was bedeutet Wischen bei diesem Eintrag?
function sw45What(el){
  let pid=null;
  if(el.matches('.vrms[data-ms]'))return {kind:'ms',key:el.dataset.ms};
  if(el.matches('.vrback')){ const h=el.querySelector('[data-svp]'), q=h&&trP(h.dataset.svp); return q&&!q.own&&canScout()?{kind:'ehem',pid:q.id,p:q}:null; }
  if(el.matches('.sw45no[data-id]')){ const q=trP(el.dataset.id); return q?{kind:'nolist',pid:q.id,p:q}:null; }
  if(el.matches('.row[data-id]'))pid=el.dataset.id;
  else if(el.matches('.sc2f'))return {kind:'follow',pid:el.dataset.sc2open};
  else if(el.matches('.sc2m'))return {kind:'meld',id:+el.dataset.m};
  else if(el.matches('.svc-i'))return {kind:'ins',idx:+el.dataset.ins};
  else if(el.matches('[data-sc2h]'))return {kind:'meldall'};
  else { const h=el.querySelector('[data-sc2p]')||el.querySelector('[data-svp]'); pid=h?(h.dataset.sc2p||h.dataset.svp):null;
    if(!pid&&el.matches('.rdit'))return el.dataset.rid?{kind:'radar',rid:el.dataset.rid}:null; }
  const p=pid&&typeof trP==='function'?trP(pid):null;
  if(!p||p.own)return null;
  if(!canScout())return null;
  return {kind:'player',pid:p.id,p};
}
const SW45_LAB={player:{r:['🚫','Kein Interesse','no'],l:['⭐','Merkliste','fav']},ehem:{r:['🚫','Weg damit','no'],l:['⭐','Interessiert','fav']},ms:{r:['✓','Ausblenden','ok']},nolist:{r:['↩️','Zurückholen','back'],l:['⭐','Zurück auf die Merkliste','fav']},follow:{r:['🔕','Nicht mehr beobachten','no']},meld:{r:['✓','Gelesen','ok']},meldall:{r:['✓','Alle gelesen','ok']},radar:{r:['✓','Ausblenden','ok']},ins:{r:['✓','Für heute erledigt','ok']}};

function sw45Bg(el,w){
  const par=el.parentElement; if(!par)return null;
  if(getComputedStyle(par).position==='static')par.style.position='relative';
  const bg=document.createElement('div'); bg.className='sw45bg';
  bg.style.cssText=`top:${el.offsetTop}px;left:${el.offsetLeft}px;width:${el.offsetWidth}px;height:${el.offsetHeight}px;border-radius:${getComputedStyle(el).borderRadius}`;
  const L=SW45_LAB[w.kind]||{};
  bg.innerHTML=`${L.r?`<span class="sw45r t-${L.r[2]}"><b>${L.r[0]}</b>${L.r[1]}</span>`:''}${L.l?`<span class="sw45l t-${L.l[2]}">${L.l[1]}<b>${L.l[0]}</b></span>`:''}`;
  par.insertBefore(bg,el); return bg;
}

document.addEventListener('pointerdown',e=>{
  if(e.button>0||SW45.on)return;
  const el=e.target.closest&&e.target.closest(SW45_SEL); if(!el)return;
  if(e.target.closest('input,select,textarea,[contenteditable],.noswipe,.chips4'))return;
  if(el.closest('.overlay:not(.open)'))return;
  SW45.on={el,x:e.clientX,y:e.clientY,t:performance.now(),dx:0,axis:null,id:e.pointerId,bg:null,w:null,passed:false,type:e.pointerType};
},true);
document.addEventListener('pointermove',e=>{
  const S=SW45.on; if(!S||e.pointerId!==S.id)return;
  const dx=e.clientX-S.x, dy=e.clientY-S.y;
  if(!S.axis){ if(Math.abs(dx)<9&&Math.abs(dy)<9)return;
    if(Math.abs(dx)>Math.abs(dy)*1.25){ S.w=sw45What(S.el); if(!S.w){ SW45.on=null; return; } S.axis='x'; S.bg=sw45Bg(S.el,S.w); S.el.classList.add('sw45drag'); document.body.classList.add('sw45nosel'); try{ S.el.setPointerCapture(e.pointerId); }catch(x){} }
    else { SW45.on=null; return; } }
  e.preventDefault();
  const W=S.el.offsetWidth||300, L=SW45_LAB[S.w.kind]||{};
  let d=dx; if(d<0&&!L.l)d=d*0.25; if(d>0&&!L.r)d=d*0.25;           // Richtung ohne Aktion: nur leicht nachgeben
  S.dx=d; S.el.style.transform=`translate3d(${d}px,0,0)`;
  const pass=Math.abs(d)>W*0.33; if(S.bg){ S.bg.classList.toggle('go-r',d>0); S.bg.classList.toggle('go-l',d<0); S.bg.classList.toggle('pass',pass); }
  if(pass!==S.passed){ S.passed=pass; if(pass)try{ svHaptic('light'); }catch(x){} }
},{passive:false,capture:true});
function sw45End(e,cancel){
  const S=SW45.on; if(!S||(e&&e.pointerId!==S.id))return; SW45.on=null;
  if(S.axis!=='x')return;
  document.body.classList.remove('sw45nosel'); SW45.justSwiped=Date.now();
  const el=S.el, W=el.offsetWidth||300, v=Math.abs(S.dx)/Math.max(1,performance.now()-S.t), L=SW45_LAB[S.w.kind]||{};
  const dir=S.dx>0?'r':'l', ok=!cancel&&L[dir]&&(Math.abs(S.dx)>W*0.33||(v>0.65&&Math.abs(S.dx)>48));
  el.classList.remove('sw45drag');
  if(!ok){ el.classList.add('sw45back'); el.style.transform=''; setTimeout(()=>{ el.classList.remove('sw45back'); if(S.bg)S.bg.remove(); },300); return; }
  if(dir==='l'&&S.w.kind==='nolist'){ try{ svSound('swoosh'); }catch(x){} el.style.height=el.offsetHeight+'px'; el.classList.add('sw45out'); el.style.transform=`translate3d(${-W*1.15}px,0,0)`; if(S.bg)S.bg.classList.add('fade'); setTimeout(()=>{ el.classList.add('sw45zu'); if(S.bg)S.bg.remove(); },200); setTimeout(()=>sw45Do(S.w,'l'),460); return; }
  if(dir==='l'){ // Merken: zurückfedern
    el.classList.add('sw45back'); el.style.transform=''; setTimeout(()=>{ el.classList.remove('sw45back'); if(S.bg)S.bg.remove(); sw45Do(S.w,'l'); },280); return; }
  // rechts: rausfliegen, dann Lücke schließen und handeln
  try{ svSound('swoosh'); }catch(x){}
  el.style.height=el.offsetHeight+'px'; el.classList.add('sw45out'); el.style.transform=`translate3d(${W*1.15}px,0,0)`;
  if(S.bg)S.bg.classList.add('fade');
  setTimeout(()=>{ el.classList.add('sw45zu'); if(S.bg)S.bg.remove(); },200);
  setTimeout(()=>sw45Do(S.w,'r'),460);
}
document.addEventListener('pointerup',e=>sw45End(e,false),true);
document.addEventListener('pointercancel',e=>sw45End(e,true),true);
// Nach dem Wischen kein versehentliches Antippen
window.addEventListener('click',e=>{ if(Date.now()-SW45.justSwiped<400&&e.target.closest&&e.target.closest(SW45_SEL)){ e.stopPropagation(); e.preventDefault(); } },true);

async function sw45Do(w,dir){
  try{
    if(w.kind==='ehem'){ w=Object.assign({},w,{kind:'player'}); setTimeout(()=>{ try{ vrAfter(); }catch(x){} },30); }
    if(w.kind==='ms'){
      vrMsHide(w.key); const st=w.key.split('|').pop();
      try{ vrHomeCard(); }catch(x){} try{ svCockpit(); }catch(x){}
      kToast(st==='3'?'🎉 Ausgeblendet. Kommt 1 Spiel vorher nochmal':'🎉 Ausgeblendet','Rückgängig',()=>{ vrMsHide(w.key,true); try{ vrHomeCard(); }catch(x){} try{ svCockpit(); }catch(x){} }); return; }
    if(w.kind==='player'&&dir==='r'){
      const p=w.p; crmSet(p.id,{s:'no'}); try{ crmApply(); }catch(x){}
      if(SC2.follow.has(p.id)){ SC2.follow.delete(p.id); SVB.sb.from('scout_follow').delete().eq('player_id',p.id).then(()=>{},()=>{}); }
      sv44Refresh(); sv44Undo(p.id,p.name); return; }
    if(w.kind==='player'&&dir==='l'){
      const p=w.p, on=!p.star; crmSet(p.id,{f:on?1:undefined}); try{ crmApply(); }catch(x){}
      sv44Refresh(); kToast(on?'⭐ '+p.name+' auf der Merkliste':'Von der Merkliste genommen'); try{ svSound(on?'success':'pop'); }catch(x){} return; }
    if(w.kind==='nolist'){
      const p=w.p; crmSet(p.id,{s:undefined,u:undefined,...(dir==='l'?{f:1}:{})}); try{ crmApply(); }catch(x){}
      sv44Refresh(); sw45NoList(true);
      kToast(dir==='l'?'⭐ '+p.name+' ist zurück und auf der Merkliste':'↩️ '+p.name+' ist wieder dabei'); try{ svSound('success'); }catch(x){} return; }
    if(w.kind==='follow'){
      const p=trP(w.pid); SC2.follow.delete(w.pid); const {error}=await SVB.sb.from('scout_follow').delete().eq('player_id',w.pid); if(error)throw error;
      sv44Refresh(); kToast('🔕 '+(p?p.name:'Spieler')+' wird nicht mehr beobachtet','Rückgängig',async()=>{ await SVB.sb.from('scout_follow').insert({player_id:w.pid}); SC2.follow.add(w.pid); sv44Refresh(); }); return; }
    if(w.kind==='meld'){
      const m=SC2.meld.find(x=>x.id===w.id); if(m)m.gelesen_at=new Date().toISOString();
      SVB.sb.rpc('meldungen_gelesen',{p_ids:[w.id]}).then(()=>{},()=>{});
      sv44Refresh(); try{ sc2HomeCard(); }catch(x){} kToast('✓ Gelesen'); return; }
    if(w.kind==='meldall'){
      const now=new Date().toISOString(); SC2.meld.forEach(m=>{ if(!m.gelesen_at)m.gelesen_at=now; });
      SVB.sb.rpc('meldungen_gelesen',{p_ids:null}).then(()=>{},()=>{});
      try{ sc2HomeCard(); }catch(x){} sv44Refresh(); kToast('✓ Alle Scouting-Meldungen gelesen'); return; }
    if(w.kind==='radar'){
      const H=sw45Get('svRdHide',[]); H.push(String(w.rid)); sw45Set('svRdHide',H.slice(-400));
      try{ rdRender(); }catch(x){}
      kToast('Meldung ausgeblendet','Rückgängig',()=>{ sw45Set('svRdHide',sw45Get('svRdHide',[]).filter(x=>x!==String(w.rid))); try{ rdRender(); }catch(x){} }); return; }
    if(w.kind==='ins'){
      const L=svInsights(), x=L[w.idx]; if(x&&x.ms){ vrMsHide(x.ms); svCockpit(); kToast(x.ms.endsWith('|3')?'🎉 Ausgeblendet. Kommt 1 Spiel vorher nochmal':'🎉 Ausgeblendet'); try{ vrHomeCard(); }catch(y){} return; }
      if(x){ const H=sw45Get('svInsHide',[]).filter(k=>k.startsWith(sw45Today())); H.push(sw45InsKey(x)); sw45Set('svInsHide',H); }
      svCockpit(); kToast('✓ Für heute erledigt'); return; }
  }catch(e){ kToast('⚠️ '+(e.message||e)); try{ sv44Refresh(); }catch(x){} }
}

// Einmaliger Hinweis: ein Eintrag zeigt kurz, was Wischen kann
function sw45Hint(){
  if(SW45.hintShown||!matchMedia('(pointer: coarse)').matches||sv43Reduced())return;
  if(sw45Get('svWischTipp',0))return;
  const el=[...document.querySelectorAll('main .panel.active '+SW45_SEL.split(',').join(',main .panel.active '))].find(x=>{ const r=x.getBoundingClientRect(); return r.top>60&&r.bottom<innerHeight-90&&sw45What(x); });
  if(!el)return; SW45.hintShown=true; sw45Set('svWischTipp',1);
  const w=sw45What(el), bg=sw45Bg(el,w); if(bg)bg.classList.add('go-r');
  el.classList.add('sw45peek');
  setTimeout(()=>{ el.classList.remove('sw45peek'); if(bg)bg.remove();
    kToast(w.kind==='player'||w.kind==='ehem'?'Tipp: Nach rechts wischen = Kein Interesse, nach links = Merkliste':'Tipp: Nach rechts wischen = erledigt'); },1500);
}
{ const _gt45b=goTab; goTab=function(){ const r=_gt45b.apply(this,arguments); setTimeout(()=>{ try{ sw45Hint(); }catch(e){} },900); return r; }; }

// Spielermarkt: Spieler mit „Kein Interesse“ verschwinden aus der Liste (auf Wunsch wieder einblenden)
{ const _rl45=renderList; renderList=function(){
  if(SW45.showNo)return _rl45.apply(this,arguments);
  const _v=visible; let hid=0;
  visible=function(){ const A=_v.apply(this,arguments), B=A.filter(p=>crmOf(p).s!=='no'); hid=A.length-B.length; return B; };
  try{ _rl45.apply(this,arguments); } finally{ visible=_v; }
  try{ const h=document.getElementById('filterHint'); if(h&&hid){ const t=h.textContent; h.innerHTML=`<span>${svEsc(t)} · ${hid} ausgeblendet <button type="button" class="sw45show">Liste ansehen</button></span>`; h.querySelector('.sw45show').onclick=()=>sw45NoList(); } }catch(e){}
}; }
// auch direkt nach dem Start (ohne Bereichswechsel)
{ const t0=Date.now(), iv=setInterval(()=>{ if(typeof _remoteDone!=='undefined'&&_remoteDone&&document.getElementById('gate')&&document.getElementById('gate').classList.contains('done')){ clearInterval(iv); setTimeout(()=>{ try{ if(!document.querySelector('#overlay.open'))sw45Hint(); }catch(e){} },1800); } else if(Date.now()-t0>120000)clearInterval(iv); },500); }
// … und beim Scrollen, sobald zum ersten Mal ein wischbarer Eintrag im Blick ist
{ let last=0; const onS=()=>{ if(SW45.hintShown){ window.removeEventListener('scroll',onS,true); return; } const n=Date.now(); if(n-last<700)return; last=n; try{ sw45Hint(); }catch(e){} }; window.addEventListener('scroll',onS,{passive:true,capture:true}); }

/* ---------- Liste „Kein Interesse“: wischen holt zurück ---------- */
function sw45NoList(refresh){
  const M=document.getElementById('modal');
  if(refresh&&!(M&&M.querySelector('.sw45nol')))return;
  const L=players.filter(p=>!p.own&&crmOf(p).s==='no').sort((a,b)=>String(a.name).localeCompare(String(b.name),'de'));
  const row=p=>{ const c=(p.cur&&p.cur.club)||p.club||''; return `<div class="sw45no" data-id="${svEsc(p.id)}"><span class="tra-av">${avaHtml(p)}</span><div class="sw45no-b"><b>${svEsc(p.name)}</b><span>${svEsc(c)}${p.pos?' · '+svEsc(svPosTxt(p)):''}${p.alter!=null?' · '+p.alter+' J.':''}</span></div><button type="button" class="btn ghost sm" data-back45="${svEsc(p.id)}">↩️ Zurück</button></div>`; };
  const html=`<div class="sw45nol"><div class="mhead"><div><h2>🚫 Kein Interesse</h2><div class="note">${L.length?`${L.length} Spieler. Nach rechts wischen holt einen Spieler zurück, nach links kommt er direkt auf die Merkliste.`:'Niemand auf dieser Liste. Wer hier landet, taucht in Radar und Vorschlägen nicht mehr auf.'}</div></div></div>
    <div class="sw45no-l">${L.map(row).join('')}</div></div>`;
  const box=refresh&&M.querySelector('.sw45nol');
  if(box){ const d=document.createElement('div'); d.innerHTML=html; box.replaceWith(d.firstElementChild); } else svModal(html);
  document.querySelectorAll('#modal [data-back45]').forEach(b=>b.onclick=e=>{ e.stopPropagation(); const p=trP(b.dataset.back45); if(!p)return; const r=b.closest('.sw45no');
    r.style.height=r.offsetHeight+'px'; r.classList.add('sw45out'); r.style.transform='translate3d(115%,0,0)'; try{ svSound('swoosh'); }catch(x){}
    setTimeout(()=>r.classList.add('sw45zu'),200); setTimeout(()=>sw45Do({kind:'nolist',pid:p.id,p},'r'),460); });
  document.querySelectorAll('#modal .sw45no .tra-av,#modal .sw45no-b').forEach(x=>x.onclick=()=>{ const id=x.closest('.sw45no').dataset.id; if(Date.now()-SW45.justSwiped>400)openModal(id); });
}
// Radar-Hinweis „… ausgeblendet (Kein Interesse)“ wird zum Link auf die Liste
{ const _rr45b=rdRender; rdRender=function(){ const r=_rr45b.apply(this,arguments);
  try{ const P=document.getElementById('panel-radar'); const n=P&&[...P.querySelectorAll('.note')].find(x=>/ausgeblendet \(Kein Interesse\)/.test(x.textContent)&&!x.querySelector('.sw45show'));
    if(n){ n.insertAdjacentHTML('beforeend',' <button type="button" class="sw45show">Liste ansehen</button>'); n.querySelector('.sw45show').onclick=()=>sw45NoList(); } }catch(e){}
  return r; }; }

/* =====================================================================
   Sportzentrale 5.0 · Etappe 1: Arbeitsabläufe statt Einzelfunktionen
   - Reihenfolge Mannschaft → Kader → Scouting, Nebenbereiche (Gegnercheck, Kasse) weiter unten
   - Mannschaft: Spieler · Training (Einheiten | Statistik) · Spiele · Verletzungen · Abstimmungen (mit Automatik)
   - Kader: Kaderplan · Gespräche · Eigene Jugend · Traumelf · Rollen & Skills (Aufstellung nicht mehr als eigener Tab)
   - Scouting: … · Elf der Woche · A-Jugend extern
   - Beteiligung (mehrjährig) wandert zu Rankings & Verein
   - Jede Ansicht erklärt sich oben in einem kleinen, einklappbaren Kasten
   ===================================================================== */

/* ---------- Navigation ---------- */
SV4_HUB.mannschaft.tabs=[['training:players','Spieler'],['training:sessions','Training'],['training:games','Spiele'],['training:injuries','Verletzungen'],['kabine:abst','Abstimmungen']];
SV4_HUB.kader.tabs=[['kader','Kaderplan'],['gespr','Gespräche'],['ejugend','Eigene Jugend'],['sxi','Traumelf'],['kaderplan','Rollen & Skills']];
SV4_HUB.scouting.tabs=[['scout','Spielermarkt'],['bedarf','Bedarf & Aufträge'],['kandidaten','Kandidaten'],['radar','Radar'],['totw','Elf der Woche'],['jugend','A-Jugend extern'],['cmp','Vergleich']];
Object.assign(SV4_OF,{ejugend:'kader',totw:'scouting'}); delete SV4_OF.gegner;
Object.assign(SV_PAGES,{
  training:['Mannschaft','Spieler, Training, Spiele, Verletzungen und Abstimmungen der laufenden Saison'],
  kabine:['Mannschaft','Abstimmungen und automatischer Versand'],
  sxi:['Traumelf','Wunschspieler und Planung für Rückrunde, nächste und übernächste Saison'],
  totw:['Scouting','Elf der Woche: wer ist gerade in Form?'],
  ejugend:['Kader','Eigene Jugend: A- und B-Jugend auf dem Weg zu den Aktiven'],
  jugend:['Scouting','A-Jugend extern: Talente anderer Vereine'],
  gegner:['Gegnercheck','Der nächste Gegner in Zahlen']});
Object.assign(SV_TABBAR,{trainer:['home','training','kader','scout'],planer:['home','training','kader','scout'],admin:['home','training','kader','scout']});
{ const O=['Übersicht','Mannschaft','Kader','Scouting','Verein','Spieltag & Kasse','Wissen','Verwaltung'];
  ['trainer','planer','vorstand','admin'].forEach(r=>SV_SIDE[r]=O.slice()); }
if(typeof TR!=='undefined')TR.view='players';
// Unteransichten, die keinen eigenen Reiter mehr haben, markieren den passenden Reiter
{ const _sub50=sv4Sub; sv4Sub=function(tab){ const k=_sub50.apply(this,arguments);
  return ({'training:home':'training:sessions','training:bet':'training:players','kabine:link':'kabine:abst','kabine:kontakte':'kabine:abst'})[k]||k; }; }
// Alte Wege führen an den neuen Ort
{ const _go50=sv4Go; sv4Go=function(k){
  if(k==='training:bet'){ VR.view='bet'; return goTab('verein'); }
  if(k==='elf'&&false)return;
  return _go50.apply(this,arguments); }; }

/* ---------- Abstimmungen und Automatik auf einer Seite ---------- */
{ const _vp50=kbViewPolls; kbViewPolls=function(B){ const r=_vp50.apply(this,arguments);
  try{ if(!canTraining())return r; const box=document.createElement('div'); box.id='kbAuto50'; box.innerHTML='<h3 class="sec50">Automatik & Kabinen-Link</h3><div id="kbAuto50b"></div>'; B.appendChild(box);
    kbViewLink(document.getElementById('kbAuto50b')); }catch(e){ console.warn('Automatik',e); }
