    <div class="sc2jv">${body}</div>
    <div class="btnrow sbact"><button class="btn" id="sc2JExp">${SVI('download')} Als PDF/Excel teilen</button>${e.art==='spieler'?`<button class="btn ghost" id="sc2JProf">Spielerprofil</button>`:''}<button class="btn ghost" id="sc2JCl">Schließen</button></div>`);
  const M=document.getElementById('modal'); sc2Wire(M,()=>sc2JobView(id));
  M.querySelectorAll('[data-sc2open]').forEach(x=>x.onclick=()=>openModal(x.dataset.sc2open));
  M.querySelectorAll('[data-plan]').forEach(b=>b.onclick=async()=>{ const p=trP(b.dataset.plan); const {error}=await SVB.sb.from('saison_plan').upsert({saison:j.saison,pos:e.pos,player_id:b.dataset.plan,status:'ziel'}); if(error)return kToast('⚠️ '+error.message); kToast('✓ '+(p?p.name:'Spieler')+' in der Saisonplanung '+sc2SN(j.saison)); sc2Load(true); });
  document.getElementById('sc2JExp').onclick=()=>sxExport('job',{job:j});
  const pr=document.getElementById('sc2JProf'); if(pr)pr.onclick=()=>openModal(e.player_id);
  document.getElementById('sc2JCl').onclick=()=>closeOverlay();
  const mm=SC2.meld.filter(m=>m.data&&String(m.data.job)===String(id)&&!m.gelesen_at); if(mm.length){ SVB.sb.rpc('meldungen_gelesen',{p_ids:mm.map(m=>m.id)}); mm.forEach(m=>m.gelesen_at=new Date().toISOString()); }
}
// fertiger Auftrag → Pop-up (einmal je Auftrag), wenn die App offen ist
function sc2JobPopup(){
  if(typeof svPopOk==='function'&&!svPopOk())return; if(document.querySelector('#overlay.open')||document.getElementById('onb'))return;
  // 0.42: jeder fertige Auftrag erscheint höchstens EINMAL als Pop-up (auch nach Neustart, auch wenn per X geschlossen)
  let gez=[]; try{ gez=JSON.parse(localStorage.getItem('sv_jpop')||'[]'); }catch(e){}
  const offen=SC2.meld.filter(x=>x.art==='scout_job'&&!x.gelesen_at&&x.data&&x.data.job&&!gez.includes(x.id));
  const m=offen[0]; if(!m||window.__sc2Pop===m.id)return; window.__sc2Pop=m.id;
  try{ localStorage.setItem('sv_jpop',JSON.stringify(gez.concat(offen.map(x=>x.id)).slice(-200))); }catch(e){}
  svModal(`<div class="kbpop"><div class="kbpop-ic scout">${SVI('search')}</div><span class="trpill">KI-Scouting</span><h2>${svEsc(m.titel.replace(/^🔎 /,''))}</h2><p class="note">${svEsc(m.text||'')}</p>
    <button class="btn kbpop-go" id="sc2PGo">${SVI('eye')} Bericht ansehen</button><div class="btnrow"><button class="btn ghost sm" id="sc2PL">Später</button></div></div>`);
  document.getElementById('sc2PGo').onclick=()=>{ closeOverlay(); setTimeout(()=>sc2JobView(m.data.job),120); };
  document.getElementById('sc2PL').onclick=()=>closeOverlay();
}

/* ---------- Kaderplanung: Bedarf je Position & Saisonplanung ---------- */
function sc2PlanBox(){
  const P=document.getElementById('panel-kaderplan'); if(!P||!canScout())return;
  let el=document.getElementById('sc2Plan'); if(!el){ el=document.createElement('div'); el.id='sc2Plan'; const w=document.getElementById('kaderplanWrap'); if(w)w.before(el); else P.prepend(el); }
  const S=sc2Seasons(); SC2.season=SC2.season&&S.includes(SC2.season)?SC2.season:S[0];
  el.innerHTML=`<div class="card sc2bed"><div class="svc-h"><h3>${SVI('target')} Positions-Bedarf <small>steuert Radar, Pop-ups und KI-Suche</small></h3><button class="btn ghost sm" id="sc2Auto">Vorschläge übernehmen</button></div>
      <div class="sc2bt">${SC2_POS.map(([k,t])=>{ const b=sc2Bedarf(k), v=sc2Vorschlag(k), ist=sc2Ist(k), soll=b&&b.soll!=null?b.soll:SC2_SOLL[k], pr=b?b.prio:null;
        return `<div class="sc2br p-${pr||v.prio}${b?'':' auto'}" data-bp="${k}"><div class="sc2bn"><b>${t}</b><small>${ist} im Kader · Soll <input type="number" min="0" max="10" value="${soll}" data-soll="${k}"> · ${svEsc(v.why)}</small></div>
          <div class="sc2seg">${SC2_PRIO.map(([x,l])=>`<button type="button" class="${(pr||'')===x?'on':''}${!pr&&v.prio===x?' sug':''}" data-pr="${k}:${x}">${l}</button>`).join('')}</div>
          <div class="sc2seg sm">${SC2_HOR.map(([x,l])=>`<button type="button" class="${((b&&b.horizont)||'')===x?'on':''}${!b&&v.horizont===x?' sug':''}" data-ho="${k}:${x}">${l}</button>`).join('')}</div></div>`; }).join('')}</div>
      <div class="note">Gestrichelt = Vorschlag aus dem aktuellen Kader. „Kein Bedarf“ blendet Tipps für diese Position aus; „Hoch“ schiebt sie nach oben.</div></div>
    <div class="card sc2sp"><div class="svc-h"><h3>${SVI('layers')} Saisonplanung</h3><div class="trtabs sm">${S.map(s=>`<button class="${SC2.season===s?'on':''}" data-sai="${s}">${sc2SN(s)}</button>`).join('')}</div></div>
      ${sc2SeasonHtml(SC2.season,S)}
      <div class="btnrow" style="margin-top:12px"><button class="btn ghost sm" id="sc2PExp">${SVI('download')} Kaderplanung als PDF/Excel</button></div></div>`;
  const save=async(pos,patch)=>{ const cur=sc2Bedarf(pos)||{pos,prio:sc2Vorschlag(pos).prio,horizont:sc2Vorschlag(pos).horizont,soll:SC2_SOLL[pos]}; const row=Object.assign({},{pos,prio:cur.prio,horizont:cur.horizont,soll:cur.soll??SC2_SOLL[pos]},patch);
    const {error}=await SVB.sb.from('kader_bedarf').upsert(row); if(error)return kToast('⚠️ '+error.message); SC2.bedarf=SC2.bedarf.filter(b=>b.pos!==pos).concat([row]); sc2PlanBox(); };
  el.querySelectorAll('[data-pr]').forEach(b=>b.onclick=()=>{ const [k,x]=b.dataset.pr.split(':'); save(k,{prio:x}); });
  el.querySelectorAll('[data-ho]').forEach(b=>b.onclick=()=>{ const [k,x]=b.dataset.ho.split(':'); save(k,{horizont:x}); });
  el.querySelectorAll('[data-soll]').forEach(i=>i.onchange=()=>save(i.dataset.soll,{soll:Math.max(0,Math.min(10,+i.value||0))}));
  document.getElementById('sc2Auto').onclick=async()=>{ const rows=SC2_POS.map(([k])=>{ const v=sc2Vorschlag(k), b=sc2Bedarf(k); return {pos:k,prio:v.prio,horizont:v.horizont,soll:b&&b.soll!=null?b.soll:SC2_SOLL[k]}; });
    const {error}=await SVB.sb.from('kader_bedarf').upsert(rows); if(error)return kToast('⚠️ '+error.message); SC2.bedarf=rows; kToast('✓ Bedarf übernommen: jederzeit änderbar'); sc2PlanBox(); };
  el.querySelectorAll('[data-sai]').forEach(b=>b.onclick=()=>{ SC2.season=b.dataset.sai; sc2PlanBox(); });
  sc2SeasonWire(el);
  document.getElementById('sc2PExp').onclick=()=>sxExport('kader');
}
// Wer ist in Saison s auf Position pos? Eigene Spieler bleiben, bis „geht“ gesetzt ist; Ziele/Wünsche kommen aus der Planung
function sc2SeasonSlots(s,pos,S){
  const idx=S.indexOf(s), P=SC2.plan.filter(x=>x.pos===pos), geht=id=>P.some(x=>x.player_id===id&&x.status==='geht'&&S.indexOf(x.saison)<=idx);
  const own=sc2Own().filter(p=>sc2Pos(p)===pos).map(p=>({p,status:geht(p.id)?'geht':'bleibt',own:true,alt:(sc2Age(p)||0)+idx>=33}));
  const fest=P.filter(x=>S.indexOf(x.saison)<idx&&x.status==='fest').map(x=>({p:trP(x.player_id),status:'bleibt',neu:true})).filter(x=>x.p);
  const cur=P.filter(x=>x.saison===s&&x.status!=='geht'&&x.status!=='bleibt').map(x=>({p:trP(x.player_id),status:x.status,plan:true})).filter(x=>x.p&&!fest.some(f=>f.p.id===x.p.id));
  return own.concat(fest,cur);
}
function sc2SeasonHtml(s,S){
  return `<div class="sc2grid">${SC2_POS.map(([k,t])=>{ const L=sc2SeasonSlots(s,k,S), b=sc2Bedarf(k), soll=b&&b.soll!=null?b.soll:SC2_SOLL[k];
    const n=L.filter(x=>x.status==='bleibt'||x.status==='fest').length, gap=soll-n;
    return `<div class="sc2pos${gap>0?' gap':''}"><div class="sc2pos-h"><b>${t}</b><span>${n}/${soll}</span>${gap>0?`<em>fehlt ${gap}</em>`:''}</div>
      <div class="sc2chips">${L.map(x=>`<button type="button" class="sc2c st-${x.status}${x.alt?' alt':''}" data-slot="${k}:${svEsc(x.p.id)}:${x.own?'own':'plan'}" title="${x.own?'Tippen: bleibt ↔ geht':'Tippen: Ziel → fest → entfernen'}">${svEsc(x.p.name.split(' ').slice(-1)[0])}${x.status==='ziel'?' 🎯':x.status==='wunsch'?' 💭':x.status==='fest'?' ✓':x.status==='geht'?' ↗':''}${x.alt?' ⏳':''}</button>`).join('')}
        <button type="button" class="sc2c add" data-add="${k}">＋</button>${gap>0?`<button type="button" class="sc2c ki" data-ki="${k}">🔎 KI-Suche</button>`:''}</div></div>`; }).join('')}</div>
    <div class="note">Eigene Spieler: tippen = bleibt ↔ geht. Neue: 🎯 Ziel → ✓ fest → entfernen. ⏳ = 33+ in dieser Saison. Lücken lassen sich per 🔎 von der KI suchen.</div>`;
}
function sc2SeasonWire(el){
  const s=SC2.season, S=sc2Seasons();
  el.querySelectorAll('[data-slot]').forEach(b=>b.onclick=async()=>{ const [pos,pid,kind]=b.dataset.slot.split(':'); const ex=SC2.plan.find(x=>x.saison===s&&x.pos===pos&&x.player_id===pid);
    let q;
    if(kind==='own'){ const g=SC2.plan.find(x=>x.player_id===pid&&x.status==='geht'&&S.indexOf(x.saison)<=S.indexOf(s)); q=g?SVB.sb.from('saison_plan').delete().match({saison:g.saison,pos:g.pos,player_id:pid}):SVB.sb.from('saison_plan').upsert({saison:s,pos,player_id:pid,status:'geht'}); }
    else if(!ex)return;
    else { const nx={ziel:'fest',wunsch:'ziel',fest:null}[ex.status]; q=nx?SVB.sb.from('saison_plan').update({status:nx}).match({saison:s,pos,player_id:pid}):SVB.sb.from('saison_plan').delete().match({saison:s,pos,player_id:pid}); }
    const {error}=await q; if(error)return kToast('⚠️ '+error.message); await sc2Load(true); });
  el.querySelectorAll('[data-add]').forEach(b=>b.onclick=()=>sc2AddPick(b.dataset.add,s));
  el.querySelectorAll('[data-ki]').forEach(b=>b.onclick=async()=>{ try{ await sc2JobStart({art:'position',pos:b.dataset.ki,saison:s}); }catch(e){ kToast('⚠️ '+e.message); } });
}
function sc2AddPick(pos,s){
  svModal(`<div class="mhead"><div class="rm-ic" style="width:46px;height:46px">${SVI('plus')}</div><div><h2 style="margin:0">${SC2_PN[pos]} · Saison ${sc2SN(s)}</h2><div class="msub">Aus Merkliste, Beobachteten oder der ganzen Datenbank</div></div></div>
    <input class="search" id="sc2AQ" placeholder="Name oder Verein …" autocomplete="off"><div class="sc2pick" id="sc2AP"></div>`);
  const pref=p=>(p.star?2:0)+(SC2.follow.has(p.id)?2:0)+(sc2Pos(p)===pos?3:(SC2_NAH[pos]||[]).includes(sc2Pos(p))?1:0);
  const list=q=>{ const n=(TRC.N?TRC.N(q):q.toLowerCase()); const L=players.filter(p=>svScoutInScope(p)&&!p.own&&!sc2No(p.id)&&(!n||(TRC.N?TRC.N(p.name+' '+(p.club||'')):(p.name+' '+p.club).toLowerCase()).includes(n))).sort((a,b)=>pref(b)-pref(a)).slice(0,10);
    document.getElementById('sc2AP').innerHTML=L.map(p=>`<button type="button" data-ap="${svEsc(p.id)}"><b>${p.star?'⭐ ':''}${SC2.follow.has(p.id)?'🔔 ':''}${svEsc(p.name)}</b><small>${svEsc((p.cur&&p.cur.club)||p.club||'')} · ${svEsc(sc2PN(p))}</small></button>`).join('')||'<div class="note">Kein Treffer.</div>';
    document.querySelectorAll('#sc2AP [data-ap]').forEach(b=>b.onclick=async()=>{ const {error}=await SVB.sb.from('saison_plan').upsert({saison:s,pos,player_id:b.dataset.ap,status:'ziel'}); if(error)return kToast('⚠️ '+error.message); closeOverlay(); kToast('🎯 Als Ziel eingeplant'); await sc2Load(true); }); };
  const q=document.getElementById('sc2AQ'); list(''); q.oninput=()=>list(q.value); q.focus();
}

/* ---------- Scouting-Briefing statt Meldungsflut ---------- */
svScoutPopup=function(){
  if(typeof svPopOk!=='function'||!svPopOk('scouting')||!svAufgaben().includes('scouting')||!canScout()||!VR.radarLoaded||!SC2.loaded)return;
  if(SV_PREFS.skip){ let t=''; try{ t=localStorage.getItem('sv_spop_test')||''; }catch(e){} if(!t)return; }
  // 0.99.55 (Albert, 16.11.2026: „Admins brauchen keinen Scoutingbericht beim Start. Ich krieg das nach jedem Refresh angezeigt, stop it!“):
  // Die Abteilungsleitung bekommt das Briefing nicht, außer sie schaltet Scouting auf der Startseite selbst ein
  try{ if(typeof hzSicht==='function'&&hzSicht()==='leitung'&&!(typeof hzScoutAn==='function'&&hzScoutAn()))return; }catch(e){}
  if(document.querySelector('#overlay.open')||document.getElementById('onb')||document.getElementById('onbTourL'))return;
  const seen=rdSeen(), N=VR.radar.filter(r=>r.created_at>seen&&r.lvl!=='info'), U=SC2.meld.filter(m=>!m.gelesen_at&&m.art==='scout_update');
  const top=sc2Relevant(N,3); if(!top.length&&!U.length)return;
  const last=[...N.map(r=>r.created_at),...U.map(m=>m.created_at)].sort().pop(); let shown=''; try{ shown=localStorage.getItem('sv_spop')||''; }catch(e){}
  if(shown>=last||window.__svSPop===last)return; window.__svSPop=last; try{ localStorage.setItem('sv_spop',last); }catch(e){}   // gilt als gesehen, sobald es einmal erschienen ist, egal wie es zugeht (wie seit 0.42, ging mit dem Briefing verloren)
  const rest=sc2Relevant(N,99).length-top.length;
  svModal(`<div class="kbpop sc2brief"><div class="kbpop-ic scout">${SVI('radar')}</div><span class="trpill">Scouting-Briefing</span><h2>${top.length?`Die ${top.length} wichtigsten Tipps`:'Neues von deinen Spielern'}</h2>
    <p class="note">${top.length?`Nach eurem Positions-Bedarf sortiert${rest>0?` · ${rest} weitere stehen im Radar`:''}. Direkt entscheiden: ⭐ merken · 🔔 beobachten · 🚫 kein Interesse.`:''}</p>
    <div class="onb-rd">${top.map(x=>rdItem(x.r)).join('')}</div>
    ${U.length?`<div class="sc2bu"><b>🔔 ${U.length} Update${U.length>1?'s':''} von beobachteten Spielern</b>${U.slice(0,3).map(m=>`<div><b>${svEsc(m.titel.replace(/ · Spieltag-Update$/,''))}</b> ${svEsc(m.text||'')}</div>`).join('')}</div>`:''}
    <button class="btn kbpop-go" id="svSpGo">${SVI('radar')} Zum Scouting</button><div class="btnrow"><button class="btn ghost sm" id="svSpL">Später</button></div></div>`);
  const M=document.getElementById('modal'); const redraw=()=>{ const h=M.querySelector('.onb-rd'); if(h){ h.innerHTML=top.filter(x=>!sc2No(x.r.player_id)).map(x=>rdItem(x.r)).join(''); sc2Wire(M,redraw); } }; sc2Wire(M,redraw);
  M.querySelectorAll('[data-svp]').forEach(x=>x.onclick=()=>{ closeOverlay(); setTimeout(()=>openModal(x.dataset.svp),100); });
  const later=()=>{ try{ localStorage.setItem('sv_spop',last); }catch(e){} };
  document.getElementById('svSpGo').onclick=()=>{ later(); closeOverlay(); if(U.length)SVB.sb.rpc('meldungen_gelesen',{p_ids:U.map(m=>m.id)}); goTab('scout'); };
  document.getElementById('svSpL').onclick=()=>{ later(); closeOverlay(); };
};

/* ---------- Einhängen ---------- */
{ const _gt7=goTab; goTab=function(tab){ const r=_gt7.apply(this,arguments); try{ if(tab==='scout'){ sc2Load(); sc2ScoutBox(); } if(tab==='kaderplan'){ sc2Load(); sc2PlanBox(); } }catch(e){ console.warn(e); } return r; }; }
{ const _si9=svInit; svInit=function(){ const r=_si9.apply(this,arguments); setTimeout(()=>{ if(canScout()){ sc2Load(); sc2Realtime(); } },1300); return r; }; }
{ const _rk=renderKaderplan; renderKaderplan=function(){ const r=_rk.apply(this,arguments); try{ if(SC2.loaded&&document.querySelector('#panel-kaderplan.active'))sc2PlanBox(); }catch(e){} return r; }; }
document.addEventListener('visibilitychange',()=>{ if(document.visibilityState==='visible'&&SC2.loaded)sc2Load(true); });

/* =====================================================================
   SV/BSC Scout · Runde 17: Berichte & Co-Trainer, der mitdenkt
   - Jeder Bericht als PDF und/oder Excel: Scouting, Trainingsbeteiligung, Spiele, Kasse, Kaderplanung, einzelner KI-Bericht
   - Wohin? Mehrfachauswahl: Herunterladen · WhatsApp (Datei oder Link) · Drive (Ordner je Thema) · E-Mail an mich → Absenden
   - Co-Trainer: nach jeder Antwort klickbare nächste Schritte (Folgefrage, Export, KI-Scouting, Bereich öffnen) + blinder Fleck
   ===================================================================== */
const SX_KIND={scouting:['Scouting-Berichte','Scouting-Berichte'],job:['Scouting-Bericht','Scouting-Berichte'],training:['Trainingsbeteiligung','Trainingsbeteiligung'],
  spiele:['Spiele & Einsätze','Trainingsbeteiligung'],kasse:['Mannschaftskasse','Mannschaftskasse'],kader:['Kaderplanung','Kaderplanung']};
const SX_MIME={pdf:'application/pdf',xlsx:'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'};
const sxD=d=>d?new Date(String(d).length===10?d+'T12:00:00':d).toLocaleDateString('de-DE',{day:'2-digit',month:'2-digit',year:'numeric'}):'';
const sxEur=v=>(Math.round((+v||0)*100)/100).toLocaleString('de-DE',{minimumFractionDigits:2,maximumFractionDigits:2})+' €';

/* ---------- Inhalte ---------- */
async function sxBuild(kind,o){
  const heute=trToday(), T=(t,cols,rows,note)=>({t,cols,rows,note});
  if(kind==='scouting'){
    if(typeof sc2Load==='function')await sc2Load(); if(!VR.radarLoaded)await vrLoadRadar();
    const pl=p=>{ const c=p.cur||{}; return {Name:p.name,Position:typeof sc2PN==='function'?sc2PN(p):p.pos||'',Alter:typeof sc2Age==='function'?sc2Age(p):p.alter,Verein:c.club||p.club||'',Liga:c.sub||c.liga||p.liga||'',Tore:c.tore??p.tore??'',Spiele:c.spiele??p.teamSp??''}; };
    const merk=players.filter(p=>p.star&&!p.own&&!sc2No(p.id)).map(p=>{ const C=crmOf(p); return Object.assign(pl(p),{Status:{att:'Attraktiv',lat:'Später'}[C.s]||'',Wechselchance:C.w||'',Kontakt:C.lc?sxD(C.lc):'',Notiz:C.n||''}); });
    const fol=[...SC2.follow].map(trP).filter(Boolean).map(p=>{ const m=SC2.meld.find(x=>x.player_id===p.id&&x.art==='scout_update'); return Object.assign(pl(p),{'Letztes Update':m?m.text:''}); });
    const rel=sc2Relevant(VR.radar.filter(r=>r.lvl!=='info'),15).map(x=>{ const p=trP(x.r.player_id); return Object.assign(pl(p),{Meldung:x.r.titel,Stand:sxD(x.r.stand),'KI-Urteil':x.r.ai?x.r.ai.urteil+' '+x.r.ai.score:'',Relevanz:x.s}); });
    const jobs=SC2.jobs.filter(j=>j.status==='fertig'&&j.ergebnis).slice(0,15).map(j=>({Auftrag:j.titel,Datum:sxD(j.done_at),Ergebnis:j.ergebnis.art==='spieler'?(j.ergebnis.ki?`KI: ${j.ergebnis.ki.urteil} (${j.ergebnis.ki.score})`:`Realismus ${j.ergebnis.realismus?j.ergebnis.realismus.w:'–'}`):`${(j.ergebnis.kandidaten||[]).length} Kandidaten: ${(j.ergebnis.kandidaten||[]).slice(0,3).map(k=>k.name).join(', ')}`}));
    const bed=SC2_POS.map(([k,t])=>{ const b=sc2Bedarf(k), v=sc2Vorschlag(k); return {Position:t,'Im Kader':sc2Ist(k),Soll:b&&b.soll!=null?b.soll:SC2_SOLL[k],Priorität:(b?b.prio:v.prio+' (Vorschlag)'),Horizont:b?b.horizont:v.horizont}; });
    return {titel:'Scouting-Berichte',sub:`Stand ${sxD(heute)}`,sections:[T('Positions-Bedarf',Object.keys(bed[0]),bed),T('Für uns am wichtigsten (Radar)',rel.length?Object.keys(rel[0]):['Name'],rel),T('Merkliste',merk.length?Object.keys(merk[0]):['Name'],merk),
      T('Beobachtet',fol.length?Object.keys(fol[0]):['Name'],fol),T('KI-Aufträge',jobs.length?Object.keys(jobs[0]):['Auftrag'],jobs)]};
  }
  if(kind==='job'){
    const j=o.job, e=j.ergebnis||{}, secs=[];
    if(e.art==='spieler'){
      secs.push(T('Steckbrief',['Feld','Wert'],[['Position',e.pos_name],['Alter',e.alter??'–'],['Verein',e.verein],['Liga',e.liga],['Entfernung',e.km!=null?e.km+' km':'–'],['Saison',`${e.saison.tore??'–'} Tore in ${e.saison.spiele??'–'} Spielen`],['Tabelle',e.saison.platz?e.saison.platz+'. von '+e.saison.teams:'–'],['Realismus',e.realismus?e.realismus.w+'/100':'–']].map(([a,b])=>({Feld:a,Wert:b}))));
      if(e.ki)secs.push(T('KI-Einschätzung',['Punkt','Inhalt'],[['Urteil',`${e.ki.urteil} (${e.ki.score}/100)`],['Fazit',e.ki.fazit],['Stärken',(e.ki.staerken||[]).join(' · ')],['Risiken',(e.ki.risiken||[]).join(' · ')],['Ansprache',e.ki.ansprache],['Nächste Schritte',(e.ki.naechste_schritte||[]).join(' · ')]].filter(x=>x[1]).map(([a,b])=>({Punkt:a,Inhalt:b}))));
      secs.push(T('Aus unseren Daten',['Art','Punkt'],[...(e.fazit.plus||[]).map(x=>({Art:'＋',Punkt:x})),...(e.fazit.minus||[]).map(x=>({Art:'－',Punkt:x})),...((e.realismus&&e.realismus.f)||[]).map(x=>({Art:'•',Punkt:x}))]));
      if((e.verlauf||[]).length)secs.push(T('Spieltag für Spieltag',['Stand','Spiele','Tore','Saisontore'],e.verlauf.filter(v=>v.spiele).map(v=>({Stand:sxD(v.stand),Spiele:v.spiele,Tore:v.tore,Saisontore:v.gesamt}))));
      if((e.aehnliche||[]).length)secs.push(T('Ähnliche Spieler',['Name','Verein','Liga','Tore','Spiele'],e.aehnliche.map(x=>({Name:x.name,Verein:x.verein,Liga:x.liga,Tore:x.tore,Spiele:x.spiele}))));
    } else {
      if(e.ki)secs.push(T('KI-Einschätzung',['Punkt','Inhalt'],[{Punkt:'Lage',Inhalt:e.ki.kommentar},...(e.ki.top||[]).map(t=>({Punkt:((e.kandidaten||[]).find(k=>k.id===t.id)||{}).name||t.id,Inhalt:t.begruendung}))]));
      secs.push(T('Kandidaten',['Name','Verein','Liga','Alter','Tore','Spiele','Score','Gründe'],(e.kandidaten||[]).map(k=>({Name:k.name,Verein:k.verein,Liga:k.liga,Alter:k.alter??'',Tore:k.tore,Spiele:k.spiele,Score:k.score,Gründe:(k.gruende||[]).join(' · ')}))));
      secs.push(T('Unser Kader auf der Position',['Name','Alter'],(e.eigene||[]).map(x=>({Name:x.name,Alter:x.alter??''}))));
    }
    return {titel:j.titel,sub:`Erstellt ${sxD(j.done_at||j.created_at)}`,sections:secs};
  }
  if(kind==='training'){
    if(!TR.loaded)await trLoad(); const since=VR_SEASON_START;
    const rows=trSquad().filter(p=>p.kader===1).map(p=>{ const R=TRC.rows(TR.st,p.id).filter(r=>r.d>=since), c=k=>R.filter(r=>r.st==='weg'&&r.g===k).length, ex=c('verletzt')+c('zweite'), n=R.length-ex, da=R.filter(r=>r.st==='da').length, sp=R.filter(r=>r.st==='spaet').length;
      const sc=TRS.trainingScore(TR.st,p.id,heute); return {Name:p.name,Einheiten:R.length,Da:da,'Zu spät':sp,Verletzt:c('verletzt'),Krank:c('krank'),Arbeit:c('arbeit'),Urlaub:c('urlaub'),'Ohne Grund':c('ohne'),Quote:n?Math.round((da+sp)/n*100)+' %':'–',Score:sc&&sc.score!=null?sc.score:'–'}; })
      .sort((a,b)=>(parseInt(b.Quote)||0)-(parseInt(a.Quote)||0));
    return {titel:'Trainingsbeteiligung',sub:`Saison ab ${sxD(since)} · Stand ${sxD(heute)}`,sections:[T('Spieler',rows.length?Object.keys(rows[0]):['Name'],rows,'Quote ohne Verletzungen und Einsätze in der Zweiten.')]};
  }
  if(kind==='spiele'){
    if(!TR.loaded)await trLoad(); if(typeof fbLoad==='function'&&!FB.loaded)await fbLoad();
    const S=fbSpielStatus(), rows=[...S.P.values()].map(x=>{ const p=trP(x.pid); return {Name:p?p.name:x.pid,Startelf:x.da,Eingewechselt:x.spaet,Kader:x.bank,Zugeschaut:x.zuschauer,'Nicht da':x.weg,Gründe:Object.entries(x.gr||{}).map(([k,v])=>(TRC.REASONS[k]||k)+' '+v).join(', ')}; })
      .sort((a,b)=>(b.Startelf+b.Eingewechselt)-(a.Startelf+a.Eingewechselt));
    return {titel:'Spiele & Einsätze',sub:`${S.spiele} Pflichtspiele · Stand ${sxD(heute)}`,sections:[T('Spieler',rows.length?Object.keys(rows[0]):['Name'],rows)]};
  }
  if(kind==='kasse'){
    if(!KB.loaded)await kbLoad(true); const S=kbSaldo();
    const kon=[{Konto:'Bank',Stand:sxEur(S.konten.bank)},{Konto:'PayPal',Stand:sxEur(S.konten.paypal)},{Konto:'Bar',Stand:sxEur(S.konten.bar)},{Konto:'Gesamt',Stand:sxEur(S.stand)}];
    const per=kbByPlayer().map(x=>({Spieler:x.name,Offen:sxEur(x.offen),Bezahlt:sxEur(x.bez)}));
    const bu=KB.buch.slice(0,300).map(b=>({Datum:sxD(b.datum),Art:b.art,Wer:b.player_id?((trP(b.player_id)||{}).name||b.name||''):'',Titel:b.titel,Betrag:(b.art==='ausgabe'?'−':'')+sxEur(b.betrag),Status:b.status,Konto:b.status==='bezahlt'?(b.konto||'bank'):''}));
    return {titel:'Mannschaftskasse',sub:`Stand ${sxD(heute)}`,sections:[T('Kontostände',['Konto','Stand'],kon),T('Je Spieler',['Spieler','Offen','Bezahlt'],per),T('Buchungen',bu.length?Object.keys(bu[0]):['Datum'],bu)]};
  }
  if(kind==='kader'){
    if(typeof sc2Load==='function')await sc2Load(); const Ss=sc2Seasons();
    const bed=SC2_POS.map(([k,t])=>{ const b=sc2Bedarf(k), v=sc2Vorschlag(k); return {Position:t,'Im Kader':sc2Ist(k),Soll:b&&b.soll!=null?b.soll:SC2_SOLL[k],Priorität:b?b.prio:v.prio,Horizont:b?b.horizont:v.horizont}; });
    const secs=[T('Positions-Bedarf',Object.keys(bed[0]),bed)];
    Ss.forEach(s=>{ const rows=[]; SC2_POS.forEach(([k,t])=>sc2SeasonSlots(s,k,Ss).forEach(x=>rows.push({Position:t,Spieler:x.p.name,Status:{bleibt:'bleibt',geht:'geht',ziel:'Ziel',wunsch:'Wunsch',fest:'fest (neu)'}[x.status]||x.status,Hinweis:x.alt?'33+':''})));
      secs.push(T('Saison '+sc2SN(s),['Position','Spieler','Status','Hinweis'],rows)); });
    return {titel:'Kaderplanung',sub:`Stand ${sxD(heute)}`,sections:secs};
  }
  throw new Error('Unbekannter Bericht');
}

/* ---------- Dateien ---------- */
function sxScript(src,test){ if(test())return Promise.resolve(); return new Promise((res,rej)=>{ const s=document.createElement('script'); s.src=src+'?v='+encodeURIComponent((window.SVBC_CFG&&SVBC_CFG.build)||''); s.onload=()=>res(); s.onerror=()=>rej(new Error('Modul konnte nicht geladen werden')); document.head.appendChild(s); }); }
const sxB64=buf=>{ const u=new Uint8Array(buf); let s=''; for(let i=0;i<u.length;i+=0x8000)s+=String.fromCharCode.apply(null,u.subarray(i,i+0x8000)); return btoa(s); };
async function sxXlsx(R){
  const X=await vrXlsx(), wb=X.utils.book_new(), used=new Set();
  R.sections.forEach(s=>{ const rows=s.rows.map(r=>Array.isArray(r)?r:s.cols.map(c=>r[c]??'')); const ws=X.utils.aoa_to_sheet([[R.titel+' · '+s.t],[R.sub],[],s.cols,...rows]);
    ws['!cols']=s.cols.map((c,i)=>({wch:Math.min(60,Math.max(8,String(c).length+2,...rows.map(r=>String(r[i]??'').length+1)))}));
    let n=s.t.replace(/[\\/?*[\]:]/g,'').slice(0,31)||'Blatt'; while(used.has(n))n=n.slice(0,28)+used.size; used.add(n); X.utils.book_append_sheet(wb,ws,n); });
  return X.write(wb,{type:'base64',bookType:'xlsx'});
}
async function sxPdf(R){
  await sxScript('vendor/jspdf.umd.min.js',()=>window.jspdf&&window.jspdf.jsPDF); await sxScript('vendor/jspdf.plugin.autotable.min.js',()=>window.jspdf&&window.jspdf.jsPDF&&window.jspdf.jsPDF.API.autoTable);
  const doc=new window.jspdf.jsPDF({unit:'pt',format:'a4'}), W=doc.internal.pageSize.getWidth();
  let logo=null; try{ const b=await (await fetch('icon-192.png')).blob(); logo=await new Promise(r=>{ const f=new FileReader(); f.onload=()=>r(f.result); f.readAsDataURL(b); }); }catch(e){}
  const head=()=>{ doc.setFillColor(13,22,44); doc.rect(0,0,W,74,'F'); doc.setFillColor(91,155,255); doc.rect(0,74,W,3,'F'); if(logo)try{ doc.addImage(logo,'PNG',30,15,44,44); }catch(e){}
    doc.setTextColor(255,255,255); doc.setFont('helvetica','bold'); doc.setFontSize(19); doc.text(R.titel,logo?86:30,38); doc.setFont('helvetica','normal'); doc.setFontSize(10); doc.setTextColor(190,205,235); doc.text('SV/BSC Mörlenbach · '+R.sub,logo?86:30,56); };
  head(); let y=100;
  R.sections.forEach(s=>{ if(y>700){ doc.addPage(); y=40; }
    doc.setTextColor(20,30,55); doc.setFont('helvetica','bold'); doc.setFontSize(13); doc.text(s.t,30,y); y+=6;
    const body=s.rows.map(r=>Array.isArray(r)?r:s.cols.map(c=>String(r[c]??'')));
    doc.autoTable({startY:y+4,head:[s.cols],body:body.length?body:[[ 'Keine Einträge' ].concat(s.cols.slice(1).map(()=>''))],margin:{left:30,right:30},styles:{fontSize:8.5,cellPadding:4,textColor:[30,38,56],lineColor:[225,230,240],lineWidth:0.4},
      headStyles:{fillColor:[29,45,86],textColor:255,fontStyle:'bold'},alternateRowStyles:{fillColor:[244,247,252]}});
    y=doc.lastAutoTable.finalY+(s.note?14:24); if(s.note){ doc.setFont('helvetica','italic'); doc.setFontSize(8); doc.setTextColor(110,120,140); doc.text(s.note,30,y); y+=18; } });
  const n=doc.getNumberOfPages(); for(let i=1;i<=n;i++){ doc.setPage(i); doc.setFontSize(8); doc.setTextColor(140,150,170); doc.setFont('helvetica','normal'); doc.text(`SV/BSC Sportzentrale · ${new Date().toLocaleString('de-DE')} · Seite ${i}/${n}`,30,doc.internal.pageSize.getHeight()-18); }
  return sxB64(doc.output('arraybuffer'));
}
function sxBlob(b64,mime){ const s=atob(b64), u=new Uint8Array(s.length); for(let i=0;i<s.length;i++)u[i]=s.charCodeAt(i); return new Blob([u],{type:mime}); }
function sxLinkBase(){ const L=window.KB&&KB.bot&&KB.bot.link_url; return L&&!/github\.io/.test(L)?L:svBasis(); }

/* ---------- Dialog: Format & Weg, Mehrfachauswahl, Absenden ---------- */
async function sxExport(kind,o){
  const K=SX_KIND[kind]; if(!K)return;
  let ok={n8n:false,drive:false,mail:false}; try{ const r=await SVB.sb.rpc('bericht_versand_ok'); if(r.data)ok=r.data; }catch(e){}
  const mail=(typeof SVU!=='undefined'&&SVU.email)||'';
  const st={fmt:new Set(['pdf']),weg:new Set(['down'])};
  svModal(`<div class="mhead"><div class="rm-ic" style="width:46px;height:46px">${SVI('file')}</div><div><h2 style="margin:0">${svEsc(kind==='job'&&o&&o.job?o.job.titel:K[0])}</h2><div class="msub">Format und Weg wählen. Beides mit Mehrfachauswahl</div></div></div>
    <h4 class="sx-h">Format</h4><div class="sx-grid" id="sxF"><button type="button" class="sx-t on" data-f="pdf"><b>📄 PDF</b><span>zum Lesen & Weiterleiten</span></button><button type="button" class="sx-t" data-f="xlsx"><b>📊 Excel</b><span>zum Weiterrechnen</span></button></div>
    <h4 class="sx-h">Wohin?</h4><div class="sx-grid" id="sxW">
      <button type="button" class="sx-t on" data-w="down"><b>⬇️ Herunterladen</b><span>auf dieses Gerät</span></button>
      <button type="button" class="sx-t" data-w="wa"><b>💬 WhatsApp</b><span>Datei oder Link teilen</span></button>
      ${ok.drive?`<button type="button" class="sx-t" data-w="drive"><b>📁 Drive</b><span>Ordner „${svEsc(K[1])}“</span></button>`:''}
      <button type="button" class="sx-t${ok.mail?'':' off'}" data-w="mail"><b>✉️ E-Mail an mich</b><span>${ok.mail?svEsc(mail):'wird noch eingerichtet'}</span></button></div>
    <div id="sxStat"></div><div class="btnrow sbact"><button class="btn" id="sxGo">${SVI('send')} Absenden</button><button class="btn ghost" id="sxCl">Abbrechen</button></div>`);
  const tg=(set,v,b)=>{ if(set.has(v)){ if(set.size>1){ set.delete(v); b.classList.remove('on'); } } else { set.add(v); b.classList.add('on'); } };
  document.querySelectorAll('#sxF [data-f]').forEach(b=>b.onclick=()=>tg(st.fmt,b.dataset.f,b));
  document.querySelectorAll('#sxW [data-w]').forEach(b=>b.onclick=()=>{ if(b.classList.contains('off'))return kToast('Der Mail-Versand wird vom Admin einmal eingerichtet (Verwaltung → Versand & Zugänge).'); tg(st.weg,b.dataset.w,b); });
  document.getElementById('sxCl').onclick=()=>closeOverlay();
  document.getElementById('sxGo').onclick=async()=>{ const go=document.getElementById('sxGo'), S=document.getElementById('sxStat'); go.disabled=true; go.textContent='Erstelle …';
    const log=(t,cls)=>{ S.insertAdjacentHTML('beforeend',`<div class="sx-l ${cls||''}">${t}</div>`); };
    try{ const R=await sxBuild(kind,o), day=trToday(), files=[];
      for(const f of ['pdf','xlsx'].filter(x=>st.fmt.has(x))){ const b64=f==='pdf'?await sxPdf(R):await sxXlsx(R); const name=`${R.titel.replace(/[\\/:*?"<>|]/g,'-')} ${day}.${f}`;
        const {data,error}=await SVB.sb.rpc('bericht_speichern',{p_name:name,p_mime:SX_MIME[f],p_art:kind,p_data:b64}); if(error)throw new Error(error.message);
        files.push({f,name,b64,mime:SX_MIME[f],id:data.id,url:sxLinkBase()+'b-'+data.token}); log(`✓ ${svEsc(name)} erstellt`,'ok'); }
      if(st.weg.has('down'))files.forEach(x=>{ const a=document.createElement('a'); a.href=URL.createObjectURL(sxBlob(x.b64,x.mime)); a.download=x.name; document.body.appendChild(a); a.click(); setTimeout(()=>{ URL.revokeObjectURL(a.href); a.remove(); },4000); });
      if(st.weg.has('down'))log('⬇️ Heruntergeladen','ok');
      if(st.weg.has('drive')||st.weg.has('mail'))for(const x of files){ const {data,error}=await SVB.sb.functions.invoke('berichte',{body:{id:x.id,drive:st.weg.has('drive'),mail:st.weg.has('mail'),ordner:K[1]}});
        if(error)log('⚠️ Versand: '+svEsc(error.message||'Fehler'),'bad');
        else { if(data.drive)log(data.drive.ok?`📁 ${svEsc(x.name)} liegt im Drive unter „${svEsc(K[1])}“${data.drive.link?` · <a href="${svEsc(data.drive.link)}" target="_blank" rel="noopener">öffnen</a>`:''}`:'⚠️ Drive: '+svEsc(data.drive.fehler||'Fehler'),data.drive.ok?'ok':'bad');
          if(data.mail)log(data.mail.ok?`✉️ ${svEsc(x.name)} an ${svEsc(data.mail.an||mail)} geschickt`:'⚠️ E-Mail: '+svEsc(data.mail.fehler||'Fehler'),data.mail.ok?'ok':'bad'); } }
      if(st.weg.has('wa')){ const fl=files.map(x=>new File([sxBlob(x.b64,x.mime)],x.name,{type:x.mime}));
        let shared=false; try{ if(navigator.canShare&&navigator.canShare({files:fl})){ await navigator.share({files:fl,title:R.titel,text:`${R.titel} · SV/BSC Mörlenbach`}); shared=true; } }catch(e){ if(e&&e.name==='AbortError')shared=true; }
        if(!shared){ const txt=`📄 ${R.titel} (${R.sub})\n${files.map(x=>`${x.f==='pdf'?'PDF':'Excel'}: ${x.url}`).join('\n')}`; window.open('https://wa.me/?text='+encodeURIComponent(txt),'_blank','noopener'); }
        log(shared?'💬 Über das Teilen-Menü geteilt':'💬 WhatsApp geöffnet, mit Link zum Bericht','ok'); }
      go.textContent='Fertig'; go.onclick=()=>closeOverlay(); go.disabled=false;
    }catch(e){ log('⚠️ '+svEsc(e.message||String(e)),'bad'); go.disabled=false; go.innerHTML=SVI('send')+' Nochmal'; } };
}

/* ---------- Co-Trainer: nächste Schritte ---------- */
function sxAutoOpts(m,prev){
  const t=(prev||'')+' '+(m.content||''), O=[];
  if(/scout|radar|kandidat|merkliste|spieler .*(verein|liga)|wechsel/i.test(t)){ O.push({label:'📄 Scouting-Bericht als PDF',typ:'export',export:'scouting'}); O.push({label:'🔎 KI-Suche starten',typ:'scouting'}); }
  if(/training|beteiligung|anwesen|fehlt|gefehlt/i.test(t))O.push({label:'📊 Trainingsbeteiligung exportieren',typ:'export',export:'training'});
  if(/spiel|startelf|einsatz|einsätze|aufstellung/i.test(t))O.push({label:'📄 Spiele & Einsätze exportieren',typ:'export',export:'spiele'});
  if(/kasse|strafe|bezahlt/i.test(t))O.push({label:'📄 Kasse als PDF',typ:'export',export:'kasse'});
  if(/kader|position|planung|saison/i.test(t))O.push({label:'📄 Kaderplanung exportieren',typ:'export',export:'kader'});
  return O.slice(0,3);
}
function trWeiterHtml(m,mi){
  if(m.role==='user')return '';
  const hasW=m.weiter&&m.weiter.optionen&&m.weiter.optionen.length; if(!hasW&&(mi===0||TR.chat[mi-1].role!=='user'))return '';
  const prev=mi>0?TR.chat[mi-1].content:'', W=hasW?m.weiter.optionen:sxAutoOpts(m,prev);
  if(!W.length&&!(m.weiter&&m.weiter.blinder_fleck))return '';
  m._opts=W;
  return `${m.weiter&&m.weiter.blinder_fleck?`<div class="trc-bf">👁️ <b>Blinder Fleck:</b> ${svEsc(m.weiter.blinder_fleck)}</div>`:''}<div class="trc-next">${W.map((o,i)=>`<button type="button" data-nx="${mi}:${i}">${svEsc(o.label)}</button>`).join('')}</div>`;
}
function trWeiterWire(L){
  L.querySelectorAll('[data-nx]').forEach(b=>b.onclick=async()=>{ const [mi,i]=b.dataset.nx.split(':').map(Number), o=(TR.chat[mi]._opts||[])[i]; if(!o)return;
    try{
      if(o.typ==='frage'&&o.frage)return trChatSend(o.frage);
      if(o.typ==='export')return sxExport(o.export||'scouting');
      if(o.typ==='scouting'){ if(o.player_id&&trP(o.player_id))return sc2JobStart({art:'spieler',player_id:o.player_id}); closeOverlay(); return setTimeout(()=>sc2JobNew(o.pos?{pos:o.pos}:null),150); }
      if(o.typ==='oeffnen'&&o.bereich){ closeOverlay(); return goTab(o.bereich); }
      if((o.typ==='profil'||o.typ==='oeffnen')&&o.player_id){ const id=o.player_id; if(/^fupa:\d+$/.test(id)&&typeof bfFupaProfil==='function')return bfFupaProfil(id.slice(5)); if(trP(id))return openModal(id); return kToast('Spieler nicht gefunden'); }
      if(o.typ==='blickfeld'&&o.player_id&&typeof bfToggle==='function'){ const p=trP(o.player_id); if(typeof bfFollowing==='function'&&bfFollowing(o.player_id))return kToast('Ist schon in deinem Blickfeld'); return bfToggle(o.player_id,p?p.name:''); }
      if(o.frage)return trChatSend(o.frage);
    }catch(e){ kToast('⚠️ '+(e.message||e)); } });
}
{ const _td=trChatDraw; trChatDraw=function(){ const r=_td.apply(this,arguments); const L=document.getElementById('trcLog'); if(!L)return r;
  const nodes=[...L.querySelectorAll('.trm')]; TR.chat.forEach((m,mi)=>{ const el=nodes[mi]; if(!el||m.role==='user'||el.querySelector('.trc-next,.trc-bf'))return; const h=trWeiterHtml(m,mi); if(h)el.insertAdjacentHTML('beforeend',h); });
  trWeiterWire(L); L.scrollTop=L.scrollHeight; return r; }; }

/* ---------- Export-Knöpfe in Training, Kasse ---------- */
{ const _trr=trRender; trRender=function(){ const r=_trr.apply(this,arguments); try{ const a=document.querySelector('#panel-training .tract'); if(a&&!a.querySelector('[data-sx]')){ a.insertAdjacentHTML('beforeend',`<button class="btn ghost" data-sx="${TR.view==='games'?'spiele':'training'}">${SVI('download')} Export</button>`); a.querySelector('[data-sx]').onclick=e=>sxExport(e.currentTarget.dataset.sx); } }catch(e){} return r; }; }
{ const _kvk=kbViewKasse; kbViewKasse=function(B){ const r=_kvk.apply(this,arguments); try{ const row=B.querySelector('.kbmoney')||B.querySelector('.kbstats'); if(row&&!B.querySelector('[data-sxk]')){ row.insertAdjacentHTML('afterend',`<div class="btnrow" style="margin:-4px 0 14px"><button class="btn ghost sm" data-sxk>${SVI('download')} Kasse als PDF/Excel</button></div>`); B.querySelector('[data-sxk]').onclick=()=>sxExport('kasse'); } }catch(e){} return r; }; }

/* =====================================================================
   SV/BSC Scout · Runde 19: Zentrale Kontakte (Handynummer & E-Mail je Spieler)
   - Im Spielerprofil unten: WhatsApp · Anrufen · E-Mail, „+ Handynummer“ / „+ E-Mail“, Korrigieren mit Verlauf
   - Kabine → Kontakte: Übersicht, wem noch was fehlt, Liste einfügen (füllt nur Leeres), E-Mail an alle
   - Co-Trainer: „Die Nummer von Max ist 0171 …“ → Vorschlag zum Eintragen. Löschen geht nie über den Chat.
   - Sehen & pflegen: Team (nicht Gäste). Löschen: nur Admin. Alles läuft über die Datenbank-Funktionen (Bremse & Verlauf dort).
   ===================================================================== */
const KX={map:new Map(),loaded:false,loading:null,imp:null};
function kxOk(){ return canTraining(); }
function kxLoad(force){
  if(!kxOk())return Promise.resolve();
  if(KX.loaded&&!force)return Promise.resolve(); if(KX.loading&&!force)return KX.loading;
  KX.loading=SVB.sb.rpc('kontakt_liste').then(({data,error})=>{ if(error)throw error; KX.map=new Map((data||[]).map(k=>[k.id,k])); KX.loaded=true; }).catch(e=>console.warn('Kontakte',e)).finally(()=>{ KX.loading=null; });
  return KX.loading;
}
const kxOf=id=>KX.map.get(id)||{};
function kxTelFmt(t){ if(!t)return ''; t=String(t); return /^\+491\d{9,11}$/.test(t)?'0'+t.slice(3,6)+' '+t.slice(6):t; }
function kxWa(t,text){ return 'https://wa.me/'+String(t).replace(/\D/g,'')+(text?'?text='+encodeURIComponent(text):''); }
function kxFirst(id){ const p=trP(id); return p?p.name.split(' ')[0]:''; }
function kxAllowed(p){ return p&&!p.isJugend; }

/* ---------- Spielerprofil: Kontakt-Block ganz unten ---------- */
function kxBoxHtml(p){
  const k=kxOf(p.id), adm=isAdmin(), st=KX.edit&&KX.edit.id===p.id?KX.edit:null;
  const row=(f)=>{ const v=k[f], lab=f==='tel'?'Handynummer':'E-Mail';
    if(st&&st.f===f)return `<div class="kx-ed"><input class="kx-in" id="kxIn" type="${f==='tel'?'tel':'email'}" inputmode="${f==='tel'?'tel':'email'}" autocomplete="off" placeholder="${f==='tel'?'0171 1234567':'name@beispiel.de'}" value="${svEsc(v?(f==='tel'?kxTelFmt(v):v):'')}">
      <div class="btnrow"><button class="btn sm" data-kx-save="${f}">${SVI('check')} Speichern</button><button class="btn ghost sm" data-kx-cancel>Abbrechen</button></div>
      ${v?`<p class="note small">Die bisherige ${lab} bleibt im Verlauf und lässt sich zurückholen.</p>`:''}</div>`;
    if(!v)return `<button class="kx-add" data-kx-edit="${f}">${SVI('plus')} ${lab}</button>`;
    return `<div class="kx-row"><span class="kx-ic">${SVI(f==='tel'?'phone':'mail')}</span><b class="kx-v">${svEsc(f==='tel'?kxTelFmt(v):v)}</b>
      <span class="kx-go">${f==='tel'?`<a class="kx-b wa" href="${svEsc(kxWa(v,'Hi '+kxFirst(p.id)+', '))}" target="_blank" rel="noopener" data-kx-wa>WhatsApp</a><a class="kx-b" href="tel:${svEsc(v)}">Anrufen</a>`
        :`<a class="kx-b" href="mailto:${svEsc(v)}">E-Mail schreiben</a>`}
      <button class="kx-b ic" data-kx-edit="${f}" title="Korrigieren" aria-label="Korrigieren">✎</button>${adm?`<button class="kx-b ic del" data-kx-del="${f}" title="Löschen (nur Admin)" aria-label="Löschen">${SVI('trash')}</button>`:''}</span></div>`; };
  return `<div class="kx-h"><h3>📇 Kontakt</h3><button class="kx-lnk" data-kx-hist>${SVI('clock')} Verlauf</button></div>
    ${!KX.loaded?'<div class="note">Lade …</div>':row('tel')+row('email')}
    ${k.optout?'<p class="note small">Hat sich von automatischen WhatsApp-Nachrichten abgemeldet. Persönliche Nachrichten gehen natürlich.</p>':''}
    <div id="kxHist"></div><p class="note small kx-foot">🔒 Nur fürs Team sichtbar · jede Änderung steht im Verlauf${adm?'':' · löschen kann nur der Admin'}</p>`;
}
function kxBox(M,id){
  const p=trP(id); if(!M||!kxAllowed(p)||!kxOk())return;
  let d=M.querySelector('.kxbox'); if(!d){ d=document.createElement('div'); d.className='kxbox'; d.id='kxBox'; M.appendChild(d); }
  const draw=()=>{ if(!document.body.contains(d))return; d.innerHTML=kxBoxHtml(p); kxWire(d,p,draw); };
  draw(); if(!KX.loaded)kxLoad().then(draw);
}
function kxWire(d,p,draw){
  d.querySelectorAll('[data-kx-edit]').forEach(b=>b.onclick=()=>{ KX.edit={id:p.id,f:b.dataset.kxEdit}; draw(); const i=d.querySelector('#kxIn'); if(i){ i.focus(); i.select(); } });
  const c=d.querySelector('[data-kx-cancel]'); if(c)c.onclick=()=>{ KX.edit=null; draw(); };
  const s=d.querySelector('[data-kx-save]'); if(s){ const go=async()=>{ const f=s.dataset.kxSave, v=d.querySelector('#kxIn').value.trim(); if(!v){ KX.edit=null; return draw(); }
      s.disabled=true; const r=await kxSave(p.id,f==='tel'?v:null,f==='email'?v:null,'app'); s.disabled=false; if(r){ KX.edit=null; draw(); } };
    s.onclick=go; d.querySelector('#kxIn').onkeydown=e=>{ if(e.key==='Enter'){ e.preventDefault(); go(); } }; }
  d.querySelectorAll('[data-kx-del]').forEach(b=>b.onclick=async()=>{
    if(!b.classList.contains('sure')){ b.classList.add('sure'); b.innerHTML='Wirklich löschen?'; setTimeout(()=>{ if(document.body.contains(b)){ b.classList.remove('sure'); b.innerHTML=SVI('trash'); } },4000); return; }
    const {error}=await SVB.sb.rpc('kontakt_loeschen',{p_player:p.id,p_feld:b.dataset.kxDel}); if(error)return kToast('⚠️ '+error.message);
    const k=Object.assign({},kxOf(p.id)); k[b.dataset.kxDel]=null; KX.map.set(p.id,k); kToast('Gelöscht: steht im Verlauf'); draw(); kxRefreshViews(); });
  const h=d.querySelector('[data-kx-hist]'); if(h)h.onclick=()=>kxHist(d.querySelector('#kxHist'),p,draw);
}
async function kxSave(id,tel,email,via){
  const p=trP(id); const {data,error}=await SVB.sb.rpc('kontakt_set',{p_player:id,p_name:p?p.name:id,p_tel:tel,p_email:email,p_via:via||'app'});
  if(error){ kToast('⚠️ '+error.message); return null; }
  const k=data.kontakt||{}; KX.map.set(id,Object.assign({},kxOf(id),{id,name:p&&p.name,tel:k.tel,email:k.email}));
  const was=[data.tel,data.email].filter(x=>x&&x!=='gleich'); kToast(was.includes('korrektur')?'✓ Korrigiert: alter Wert steht im Verlauf':was.length?'✓ Gespeichert':'Unverändert');
  kxRefreshViews(); return data;
}
async function kxHist(el,p,draw){
  if(!el)return; if(el.innerHTML){ el.innerHTML=''; return; }
  const {data,error}=await SVB.sb.rpc('kontakt_verlauf',{p_player:p.id}); if(error)return kToast('⚠️ '+error.message);
  const A={neu:'eingetragen',korrektur:'korrigiert',geloescht:'gelöscht',zurueck:'zurückgeholt'}, V={ki:' (Co-Trainer)',import:' (Liste)',kabine:' (Kabine)',app:'',system:''};
  el.innerHTML=(data||[]).length?`<div class="kx-hist">${data.map(v=>`<div class="kx-hr"><span>${svEsc(new Date(v.at).toLocaleDateString('de-DE'))} · ${svEsc(v.von||'System')}${V[v.via]||''}</span>
      <b>${v.feld==='tel'?'📱':'✉️'} ${A[v.aktion]||v.aktion}: ${svEsc(v.neu?(v.feld==='tel'?kxTelFmt(v.neu):v.neu):'–')}</b>${v.alt?`<small>vorher ${svEsc(v.feld==='tel'?kxTelFmt(v.alt):v.alt)}</small><button class="kx-b" data-kx-back="${v.id}">↩︎ zurückholen</button>`:''}</div>`).join('')}</div>`
    :'<p class="note small">Noch keine Einträge.</p>';
  el.querySelectorAll('[data-kx-back]').forEach(b=>b.onclick=async()=>{ const {data:k,error:e2}=await SVB.sb.rpc('kontakt_zurueck',{p_id:+b.dataset.kxBack}); if(e2)return kToast('⚠️ '+e2.message);
    KX.map.set(p.id,Object.assign({},kxOf(p.id),{tel:k.tel,email:k.email})); kToast('✓ Zurückgeholt'); draw(); kxRefreshViews(); });
}
{ const _omK=openModal; openModal=function(id){ const r=_omK.apply(this,arguments); try{ KX.edit=null; kxBox(document.getElementById('modal'),id); }catch(e){ console.warn(e); } return r; }; }

/* ---------- Kabine → Kontakte ---------- */
function kxSquad(){ return players.filter(p=>p.own&&!p.isJugend&&!p.verzicht&&(p.kader===1||p.kader===2||KX.map.has(p.id))).sort((a,b)=>(a.kader||9)-(b.kader||9)||a.name.localeCompare(b.name,'de')); }
function kxRefreshViews(){ if(typeof KB!=='undefined'&&KB.view==='kontakte'){ const B=document.getElementById('kbBody'); if(B&&document.getElementById('panel-kabine')&&document.getElementById('panel-kabine').classList.contains('active'))kxView(B); } }
function kxView(B){
  if(!KX.loaded){ B.innerHTML='<div class="card"><div class="note">Lade Kontakte …</div></div>'; kxLoad().then(()=>{ if(KB.view==='kontakte')kxView(B); }); return; }
  const S=kxSquad(), K=S.filter(p=>p.kader===1), withT=K.filter(p=>kxOf(p.id).tel).length, withM=K.filter(p=>kxOf(p.id).email).length;
  const f=KX.filter||'erste', L=S.filter(p=>f==='zweite'?p.kader===2:f==='ohne'?p.kader!==2&&!(kxOf(p.id).tel&&kxOf(p.id).email):p.kader!==2);
  const mails=S.map(p=>kxOf(p.id).email).filter(Boolean);
  B.innerHTML=`<div class="kbstats kxstats"><div class="kbst"><span>Handynummern</span><b class="${withT<K.length?'mid':'ok'}">${withT}/${K.length}</b></div><div class="kbst"><span>E-Mails</span><b class="${withM<K.length?'mid':'ok'}">${withM}/${K.length}</b></div></div>
    <details class="card kxcard kx-imp"${KX.imp?' open':''}><summary><span class="trh">${SVI('upload')} Liste einfügen</span><small>Excel · WhatsApp · Text</small></summary><p class="note">Namen mit Handynummer und/oder E-Mail einfügen. Eine Zeile pro Spieler, z. B. aus Excel oder WhatsApp kopiert. Es wird nur ergänzt, was noch fehlt; abweichende Nummern werden angezeigt, aber nie überschrieben.</p>
      <textarea class="kx-ta" id="kxTa" rows="5" placeholder="Max Mustermann 0171 1234567 max@web.de&#10;Tim Beispiel; +49 160 7654321"></textarea>
      <div class="btnrow"><button class="btn sm" id="kxPrev">${SVI('check')} Prüfen</button></div><div id="kxImp"></div></details>
    <div class="card kxcard"><div class="vrat-h"><h3 class="trh" style="margin:0">${SVI('users')} Spieler-Kontakte</h3><div class="kx-seg"><button class="${f==='erste'?'on':''}" data-kxf="erste">1. Mannschaft</button><button class="${f==='zweite'?'on':''}" data-kxf="zweite">2.</button><button class="${f==='ohne'?'on':''}" data-kxf="ohne">Fehlt was</button></div></div>
      <div class="kx-list">${L.map(p=>{ const k=kxOf(p.id); return `<div class="kx-li"><button class="kx-nm" data-kx-open="${svEsc(p.id)}"><b>${svEsc(p.name)}</b><small>${p.kader===2?'2. Mannschaft · ':''}${k.tel?svEsc(kxTelFmt(k.tel)):'<em>keine Nummer</em>'}${k.email?' · '+svEsc(k.email):''}</small></button>
        <span class="kx-go">${k.tel?`<a class="kx-b wa" href="${svEsc(kxWa(k.tel,'Hi '+p.name.split(' ')[0]+', '))}" target="_blank" rel="noopener" aria-label="WhatsApp">${SVI('chat')}</a>`:''}${k.email?`<a class="kx-b" href="mailto:${svEsc(k.email)}" aria-label="E-Mail">${SVI('mail')}</a>`:''}${!k.tel||!k.email?`<button class="kx-b" data-kx-open="${svEsc(p.id)}" aria-label="Ergänzen">${SVI('plus')}</button>`:''}</span></div>`; }).join('')||'<p class="note">Alles vollständig 🎉</p>'}</div>
      ${mails.length?`<a class="btn ghost sm kx-all" href="mailto:?bcc=${svEsc(mails.join(','))}&subject=${encodeURIComponent('SV/BSC Mörlenbach')}">${SVI('mail')} E-Mail an alle (${mails.length}, Blindkopie)</a>`:''}</div>
`;
  B.querySelectorAll('[data-kxf]').forEach(b=>b.onclick=()=>{ KX.filter=b.dataset.kxf; kxView(B); });
  B.querySelectorAll('[data-kx-open]').forEach(b=>b.onclick=()=>{ openModal(b.dataset.kxOpen); document.getElementById('overlay').classList.add('open'); setTimeout(()=>{ const x=document.getElementById('kxBox'); if(x)x.scrollIntoView({behavior:'smooth',block:'center'}); },150); });
  document.getElementById('kxPrev').onclick=()=>kxPreview(document.getElementById('kxTa').value,document.getElementById('kxImp'),B);
}
function kxPreview(text,el,B){
  const R=kxParse(text,{list:true}); KX.imp=R;
  if(!R.actions.length&&!R.miss.length){ el.innerHTML='<p class="note">Keine Nummern oder E-Mails gefunden.</p>'; return; }
  el.innerHTML=`<div class="kx-prev">${R.actions.map(a=>{ const k=kxOf(a.input.player_id), dT=a.input.tel&&k.tel&&k.tel!==a.input.tel, dM=a.input.email&&k.email&&k.email!==a.input.email;
      return `<div class="kx-pr"><b>${svEsc(trName(a.input.player_id))}</b><small>${a.input.tel?'📱 '+svEsc(kxTelFmt(a.input.tel))+(dT?' <em class="mid">(hinterlegt: '+svEsc(kxTelFmt(k.tel))+' · bleibt)</em>':k.tel===a.input.tel?' <em>schon da</em>':''):''}${a.input.email?' ✉️ '+svEsc(a.input.email)+(dM?' <em class="mid">(hinterlegt: '+svEsc(k.email)+' · bleibt)</em>':k.email===a.input.email?' <em>schon da</em>':''):''}</small></div>`; }).join('')}
    ${R.miss.map(m=>`<div class="kx-pr bad"><b>${svEsc(m.txt)}</b><small>${m.names&&m.names.length?'Mehrdeutig: '+m.names.map(svEsc).join(', '):'Spieler nicht erkannt, bitte vollen Namen schreiben'}</small></div>`).join('')}</div>
    ${R.actions.length?`<button class="btn" id="kxGo">${SVI('check')} ${R.actions.length} Spieler übernehmen</button>`:''}`;
  const g=document.getElementById('kxGo'); if(g)g.onclick=async()=>{ g.disabled=true;
    const rows=R.actions.map(a=>({id:a.input.player_id,name:trName(a.input.player_id),tel:a.input.tel||null,email:a.input.email||null}));
    const {data,error}=await SVB.sb.rpc('kontakt_import',{p_rows:rows}); g.disabled=false; if(error)return kToast('⚠️ '+error.message);
    await kxLoad(true); kToast(`✓ ${data.neu} Einträge ergänzt${data.konflikt.length?` · ${data.konflikt.length} Abweichung${data.konflikt.length>1?'en':''} nicht überschrieben`:''}${data.fehler.length?` · ${data.fehler.length} Fehler`:''}`);
    kxView(B); if(data.konflikt.length||data.fehler.length){ const e=document.getElementById('kxImp'); if(e)e.innerHTML=`<div class="kx-prev">${data.konflikt.map(c=>`<div class="kx-pr"><b>${svEsc(c.name)}</b><small>${c.feld==='tel'?'📱':'✉️'} hinterlegt ${svEsc(c.feld==='tel'?kxTelFmt(c.alt):c.alt)} · in der Liste ${svEsc(c.feld==='tel'?kxTelFmt(c.neu):c.neu)} · im Profil korrigieren, falls die neue stimmt</small></div>`).join('')}${data.fehler.map(x=>`<div class="kx-pr bad"><b>${svEsc(x.name)}</b><small>${svEsc(x.fehler)}</small></div>`).join('')}</div>`; } };
}

/* ---------- Text verstehen: „Nummer von Max: 0171 …“, Listen, E-Mails ---------- */
const KX_TEL=/(?:\+|00)?\d[\d \t\/().-]{6,}\d/g, KX_MAIL=/[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}/g;
function kxNormTel(t){ let x=String(t).replace(/[^\d+]/g,''); if(x.startsWith('00'))x='+'+x.slice(2); else if(x.startsWith('0'))x='+49'+x.slice(1); else if(!x.startsWith('+'))x='+'+x; return /^\+[1-9]\d{7,14}$/.test(x)?x:null; }
function kxFind(txt){
  const N=s=>TRS.key(s), words=String(txt).replace(/[^A-Za-zÄÖÜäöüßéèáàç' -]/g,' ').split(/\s+/).filter(w=>w.length>=2).map(N).filter(w=>!/^(nummer|handy|handynummer|tel|telefon|mail|email|emailadresse|adresse|von|ist|hat|die|der|das|und|neue|neu|mobil|whatsapp|seine|ihre|lautet)$/.test(w));
  if(!words.length)return {p:null};
  const pool=players.filter(p=>!p.isJugend&&p.name), full=pool.filter(p=>{ const nw=p.name.split(/\s+/).map(N); return nw.every(w=>words.includes(w)); });
  if(full.length===1)return {p:full[0]};
  const own=pool.filter(p=>p.own);
  for(const src of [own,pool]){ const hit=src.filter(p=>{ const nw=p.name.split(/\s+/).map(N); return nw.some(w=>w.length>=3&&words.includes(w)); });
    if(hit.length===1)return {p:hit[0]};
    if(hit.length>1){ const best=hit.filter(p=>{ const nw=p.name.split(/\s+/).map(N); return nw.filter(w=>words.includes(w)).length>=2; }); if(best.length===1)return {p:best[0]}; if(src===own)return {p:null,names:hit.slice(0,5).map(p=>p.name)}; } }
  return {p:null};
}
function kxParse(text,opt){
  const out={actions:[],miss:[],ambig:[]}; if(!text)return out;
  const lines=(opt&&opt.list)?String(text).split(/\r?\n/):[String(text)];
  for(const line of lines){
    const M=[]; let m; KX_MAIL.lastIndex=0; while((m=KX_MAIL.exec(line)))M.push({i:m.index,e:m.index+m[0].length,mail:m[0].toLowerCase()});
    const noMail=line.replace(KX_MAIL,s=>' '.repeat(s.length)); KX_TEL.lastIndex=0;
    while((m=KX_TEL.exec(noMail))){ const t=kxNormTel(m[0]); if(t&&m[0].replace(/\D/g,'').length>=9)M.push({i:m.index,e:m.index+m[0].length,tel:t}); }
    if(!M.length)continue; M.sort((a,b)=>a.i-b.i);
    // Name steht vor dem Wert (oder, falls davor nichts, dahinter)
    let last=0; const grp=[];
    for(const x of M){ const before=line.slice(last,x.i); const f=kxFind(before); if(f.p||f.names||!grp.length)grp.push({f,txt:before.trim(),vals:[x]}); else grp[grp.length-1].vals.push(x); last=x.e; }
    grp.forEach((g,gi)=>{ if(!g.f.p&&!g.f.names){ const after=line.slice(g.vals[g.vals.length-1].e,(grp[gi+1]||{vals:[{i:line.length}]}).vals[0].i); const f2=kxFind(after); if(f2.p||f2.names){ g.f=f2; g.txt=after.trim(); } }
      if(!g.f.p){ out.miss.push({txt:(g.txt||line).slice(0,60)||'?',names:g.f.names}); if(g.f.names)out.ambig.push({k:g.txt.split(/\s+/).pop()||'?',names:g.f.names}); return; }
      const inp={player_id:g.f.p.id}; g.vals.forEach(v=>{ if(v.tel&&!inp.tel)inp.tel=v.tel; if(v.mail&&!inp.email)inp.email=v.mail; });
      const ex=out.actions.find(a=>a.input.player_id===inp.player_id); if(ex)Object.assign(ex.input,Object.fromEntries(Object.entries(inp).filter(([k])=>!ex.input[k]))); else out.actions.push({type:'kontakt',input:inp}); });
  }
  return out;
}
const KX_DEL=/(lösch|losch|entfern|leer|weg\s*mach|raus\s*nehm|clear|delete)/i, KX_WHAT=/(nummer|handy|telefon|e-?mail|mail|kontakt)/i;
function kxDeleteAsk(text){ return KX_DEL.test(text)&&KX_WHAT.test(text); }
const KX_NO='Kontaktdaten lösche ich nicht. Das geht aus Sicherheitsgründen weder über den Co-Trainer noch in einem Rutsch. Der Admin kann einzelne Einträge im Spielerprofil löschen; Korrekturen gehen dort für alle im Team (die alte Nummer bleibt im Verlauf).';

/* ---------- Co-Trainer: Vorschlag „Kontakt eintragen“ ---------- */
{ const _as=trActSummary; trActSummary=function(a){ if(a.type!=='kontakt')return _as.apply(this,arguments); const i=a.input||{}, k=kxOf(i.player_id);
    const d=(v,alt,f)=>v?`<div>${f==='tel'?'📱 '+svEsc(kxTelFmt(v)):'✉️ '+svEsc(v)}${alt&&alt!==v?` <em class="mid">ersetzt ${svEsc(f==='tel'?kxTelFmt(alt):alt)} (bleibt im Verlauf)</em>`:alt===v?' <em>schon hinterlegt</em>':''}</div>`:'';
    return `<b>📇 Kontakt: ${svEsc(trName(i.player_id))}</b>${d(i.tel,k.tel,'tel')}${d(i.email,k.email,'email')}`; };
  const _ex=trExec; trExec=async function(a){ if(a.type!=='kontakt')return _ex.apply(this,arguments); const i=a.input||{};
    await kxLoad(); const r=await kxSave(i.player_id,i.tel||null,i.email||null,'ki'); if(!r)throw new Error('Kontakt nicht gespeichert'); return 'Kontakt von '+trShort(i.player_id)+' gespeichert'; }; }
// nach dem Anmelden im Hintergrund laden (für Profil & Co-Trainer)
{ let t=0; const iv=setInterval(()=>{ if(++t>120)return clearInterval(iv); if(typeof SVU!=='undefined'&&SVU&&SVU.role&&typeof _remoteDone!=='undefined'&&_remoteDone){ clearInterval(iv); if(kxOk())kxLoad(); } },1000); }

/* =====================================================================
   SV/BSC Sportzentrale 4.0 · Kern
   - Ein Spieler = eine Einheit: Beziehung zum Verein je Saison (Mannschaft, Zukunft) statt „intern/extern“
   - Eye-Test je Bewerter (6 Kategorien), Spielergespräche, Bedarfe, Aufstellungen je Saison, Saison-Archiv
   - MScore 2.0: Einsatz & Liga zählen, Eye-Test fließt ein, jeder Baustein mit Quelle (Info-i)
   - Navigation nach Arbeitsbereichen: Kader · Scouting · Mannschaft · Spieltag · Jugend · Kasse · Verein
   ===================================================================== */
const SV4={gen:1,name:'SV/BSC Sportzentrale',loaded:false,loading:false,eye:[],eyeBy:new Map(),ss:new Map(),bed:[],bk:[],gs:[],auf:new Map(),
  stat:[],statLoaded:false,ju:{k:[],e:[],loaded:false},geo:new Map(),cache:new Map(),cacheGen:0};
const SV4_POS=['TW','IV','AV','ZM','OM','Flügel','ST'];
const SV4_POSL={TW:'Torwart',IV:'Innenverteidiger',AV:'Außenverteidiger',ZM:'Zentrales Mittelfeld',OM:'Offensives Mittelfeld','Flügel':'Flügel',ST:'Sturm'};
const SV4_TEAM={'1':'1. Mannschaft','2':'2. Mannschaft',A:'A-Jugend',B:'B-Jugend'};
const SV4_ZUK={bleibt:['Bleibt','ok'],unsicher:['Unsicher','warn'],geht:['Geht','bad'],hoch:['Hoch in die Erste','info'],runter:['In die Zweite','info'],karriereende:['Karriereende','bad'],neu:['Neuzugang','ok'],ziel:['Wunschspieler','info']};
const SV4_EYE=[['tem','Tempo','TEM'],['sch','Schuss','SCH'],['pas','Pass','PAS'],['dri','Dribbling','DRI'],['def','Defensive','DEF'],['phy','Physis','PHY']];
const SV4_EYE_TW={def:'Torwartspiel',sch:'Abschlag',dri:'Fußarbeit'};
const SV4_EYE_W={ST:{tem:.2,sch:.35,pas:.1,dri:.2,def:0,phy:.15},'Flügel':{tem:.3,sch:.2,pas:.15,dri:.25,def:0,phy:.1},OM:{tem:.15,sch:.2,pas:.3,dri:.25,def:0,phy:.1},
  ZM:{tem:.1,sch:.1,pas:.3,dri:.15,def:.2,phy:.15},IV:{tem:.15,sch:0,pas:.15,dri:.05,def:.45,phy:.2},AV:{tem:.25,sch:.05,pas:.2,dri:.1,def:.3,phy:.1},TW:{tem:.1,sch:.05,pas:.15,dri:.05,def:.45,phy:.2}};
const SV4_LVL={GL:100,KOL:85,A:70,B:55,C:40,D:27};
const SV4_PLATZ=(window.VEREIN||{}).sportplatz||{lat:49.5989,lon:8.7353};   // Sportplatz des Vereins (verein/<id>.json)

/* ---------- Saisons ---------- */
function sv4S(){ return String((DATA&&DATA.season)||'2627'); }
function sv4SAdd(s,n){ const a=+String(s).slice(0,2)+n; return String(a).padStart(2,'0')+String(a+1).padStart(2,'0'); }
function sv4SL(s){ s=String(s||sv4S()); return s.slice(0,2)+'/'+s.slice(2); }
function sv4Seasons(){ const s=sv4S(); return [s,sv4SAdd(s,1),sv4SAdd(s,2)]; }
const sv4Esc=s=>svEsc(s);
function sv4Can(){ return typeof canScout==='function'&&canScout(); }
function sv4Today(){ return new Date(Date.now()-new Date().getTimezoneOffset()*60000).toISOString().slice(0,10); }
function sv4D(d){ if(!d)return '–'; const x=String(d).slice(0,10).split('-'); return x.length===3?`${+x[2]}.${+x[1]}.${x[0].slice(2)}`:String(d); }
function sv4Ago(d){ if(!d)return ''; const t=(Date.now()-new Date(d))/86400000; return t<1?'heute':t<2?'gestern':t<31?`vor ${Math.floor(t)} Tagen`:t<365?`vor ${Math.round(t/30)} Mon.`:`vor ${(t/365).toFixed(1).replace('.',',')} J.`; }
function sv4P(id){ return players.find(x=>x.id===id)||null; }
function sv4Num(v,d){ return v==null||isNaN(v)?'–':(+v).toFixed(d==null?0:d).replace('.',','); }

/* ---------- Info-i: woher kommt ein Wert? ---------- */
const SV4_INFO=new Map(); let _sv4i=0;
function sv4I(t,o){ const k='i'+(++_sv4i); SV4_INFO.set(k,Object.assign({t},o||{})); if(SV4_INFO.size>600){ const f=SV4_INFO.keys().next().value; SV4_INFO.delete(f); } return `<button type="button" class="i4" data-i4="${k}" aria-label="Info: ${sv4Esc(t)}">i</button>`; }
function sv4InfoShow(btn){
  const o=SV4_INFO.get(btn.dataset.i4); if(!o)return; document.querySelectorAll('.i4pop').forEach(x=>x.remove());
  const pop=document.createElement('div'); pop.className='i4pop'; pop.setAttribute('role','dialog'); window._i4t=performance.now();
  const row=(l,v)=>v==null||v===''?'':`<div><span>${sv4Esc(l)}</span><b>${v}</b></div>`;
  pop.innerHTML=`<div class="i4h"><b>${sv4Esc(o.t)}</b><button type="button" aria-label="Schließen">✕</button></div>
    ${o.txt?`<p>${o.txt}</p>`:''}
    <div class="i4rows">${row('Quelle',o.quelle?sv4Esc(o.quelle):null)}${row('Art',o.art==='manuell'?'✍️ manuell bewertet':o.art==='auto'?'⚙️ automatisch berechnet':o.art?sv4Esc(o.art):null)}
      ${row('Stand',o.stand?sv4Esc(o.stand):null)}${(o.rows||[]).map(r=>row(r[0],r[1])).join('')}</div>
    ${o.basis?`<div class="i4b"><span>Eingeflossen</span>${o.basis}</div>`:''}`;
  document.body.appendChild(pop);
  const r=btn.getBoundingClientRect(), w=Math.min(320,window.innerWidth-24); pop.style.width=w+'px';
  let x=Math.min(window.innerWidth-w-12,Math.max(12,r.left+r.width/2-w/2)), y=r.bottom+8;
  const h=pop.offsetHeight; if(y+h>window.innerHeight-12)y=Math.max(12,r.top-h-8);
  pop.style.left=x+'px'; pop.style.top=y+'px';
  pop.querySelector('.i4h button').onclick=()=>pop.remove();
}
document.addEventListener('click',e=>{ const b=e.target.closest&&e.target.closest('[data-i4]'); if(b){ e.preventDefault(); e.stopPropagation(); sv4InfoShow(b); return; }
  if(!(e.target.closest&&e.target.closest('.i4pop')))document.querySelectorAll('.i4pop').forEach(x=>x.remove()); },true);
// Rollen schließt das Info-Fenster. Nicht in den ersten 400 ms: Rückt der Tipp selbst die Seite zurecht oder läuft das Profil noch ein, wäre das Fenster sonst sofort wieder weg (0.99.42).
window.addEventListener('scroll',()=>{ if(performance.now()-(window._i4t||0)<400)return; document.querySelectorAll('.i4pop').forEach(x=>x.remove()); },{passive:true,capture:true});

/* ---------- Laden ---------- */
async function sv4Load(force){
  if(!SVB||!SVB.sb||SV4.loading)return; if(SV4.loaded&&!force)return; SV4.loading=true;
  const q=(t,sel,f)=>{ let x=SVB.sb.from(t).select(sel); if(f)x=f(x); return x.then(r=>{ if(r.error)throw r.error; return r.data||[]; }).catch(e=>{ console.warn('4.0 '+t,e.message||e); return null; }); };
  try{
    const team=sv4Can();
    const [eye,ss,bed,bk,gs,auf,stat]=await Promise.all([
      team?q('eye_tests','*',x=>x.order('updated_at',{ascending:false}).limit(3000)):null,
      team?q('spieler_saison','*',x=>x.limit(3000)):null,
      team?q('bedarfe','*',x=>x.order('created_at',{ascending:false}).limit(300)):null,
      team?q('bedarf_kandidaten','*',x=>x.limit(3000)):null,
      team?q('gespraeche','*',x=>x.order('datum',{ascending:false}).limit(1500)):null,
      q('aufstellungen','*',x=>x.limit(60)),
      SV4.statLoaded?null:q('spieler_statistik','name,saison,wettbewerb,team,spiele,startelf,minuten,tore,vorlagen,quelle',x=>x.limit(3000))]);
    if(eye){ SV4.eye=eye; sv4EyeIdx(); }
    if(ss){ SV4.ss=new Map(ss.map(r=>[r.player_id+'|'+r.saison,r])); }
    if(bed)SV4.bed=bed; if(bk)SV4.bk=bk; if(gs)SV4.gs=gs;
    if(auf)SV4.auf=new Map(auf.map(r=>[r.team+'|'+r.saison+'|'+r.art,r]));
    if(stat){ SV4.stat=stat; SV4.statLoaded=true; SV4._statIdx=null; }
    SV4.loaded=true; sv4Bump();
  }finally{ SV4.loading=false; }
  try{ sv4After(); }catch(e){ console.warn(e); }
}
function sv4After(){
  const cur=typeof svCurTab==='function'?svCurTab():'';
  try{ if(cur==='kader'&&typeof kd4Render==='function')kd4Render(); }catch(e){ console.warn(e); }
  try{ if(cur==='gespr'&&typeof kd4Gespr==='function')kd4Gespr(); }catch(e){ console.warn(e); }
  try{ if(cur==='bedarf'&&typeof sc4Bedarf==='function')sc4Bedarf(); }catch(e){ console.warn(e); }
  try{ if(cur==='kandidaten')renderKandidaten(); }catch(e){}
  try{ const M=document.getElementById('modal'), ov=document.getElementById('overlay'); if(ov&&ov.classList.contains('open')&&M&&M.dataset.pf4&&M.querySelector('.pf4')&&typeof pf4Refresh==='function')pf4Refresh(M.dataset.pf4); }catch(e){}
  try{ if(typeof svCockpit==='function'&&cur==='home')svCockpit(); }catch(e){}
}
function sv4Bump(){ SV4.gen++; SV4.cache.clear(); }
{ const _ra4=renderAll; renderAll=function(){ sv4Bump(); return _ra4.apply(this,arguments); }; }

/* ---------- Eye-Test ---------- */
function sv4EyeIdx(){ const m=new Map(); SV4.eye.forEach(e=>{ if(!m.has(e.player_id))m.set(e.player_id,[]); m.get(e.player_id).push(e); }); SV4.eyeBy=m; }
function sv4Eye(pid){
  const L=SV4.eyeBy.get(pid); if(!L||!L.length)return null;
  const s=sv4S(); let use=L.filter(e=>e.saison===s); let alt=false;
  if(!use.length){ const last=L.map(e=>e.saison).sort().pop(); use=L.filter(e=>e.saison===last); alt=last; }
  const avg={}; SV4_EYE.forEach(([k])=>{ const v=use.map(e=>e[k]).filter(v=>v!=null).map(Number); avg[k]=v.length?v.reduce((a,b)=>a+b,0)/v.length:null; });
  const me=SVB&&SVB.user&&SVB.user.id; const mine=L.find(e=>e.rater===me&&e.saison===s)||null;
  const last=use.map(e=>e.updated_at).sort().pop();
  return {n:use.length,avg,list:use,all:L,mine,alt,last};
}
function sv4EyeVal(pid,pos){
  const E=sv4Eye(pid); if(!E)return null; const w=SV4_EYE_W[pos]||SV4_EYE_W.ZM; let s=0,ws=0;
  for(const k in w){ const v=E.avg[k]; if(v!=null&&w[k]>0){ s+=v*w[k]; ws+=w[k]; } }
  return ws>0?{v:Math.max(0,Math.min(100,(s/ws)*10)),E}:null;
}
async function sv4EyeSave(o){
  const {data,error}=await SVB.sb.rpc('eye_test_save',{p:o}); if(error)throw new Error(error.message);
  SV4.eye=SV4.eye.filter(e=>!(e.player_id===data.player_id&&e.saison===data.saison&&e.rater===data.rater)); SV4.eye.unshift(data); sv4EyeIdx(); sv4Bump(); return data;
}
async function sv4EyeDel(id){
  const {error}=await SVB.sb.rpc('eye_test_loeschen',{p_id:id}); if(error)throw new Error(error.message);
  SV4.eye=SV4.eye.filter(e=>e.id!==id); sv4EyeIdx(); sv4Bump();
}

/* ---------- Beziehung zum Verein je Saison ---------- */
function sv4SS(pid,s){ return SV4.ss.get(pid+'|'+s)||null; }
function sv4Team0(p){   // Mannschaft in der laufenden Saison laut Datenbestand
  if(!p)return null;
  if(p.isJugend)return (typeof juEigen==='function'&&juEigen(p))?'A':null;
  if(!p.own)return null;
  if(p.kader===2||/ II$/.test(p.club||''))return '2';
  return '1';
}
function sv4Team(p,s){
  s=s||sv4S(); const r=sv4SS(p.id,s);
  if(r)return r.zukunft==='geht'||r.zukunft==='karriereende'||r.zukunft==='ziel'?null:r.team;
  if(s===sv4S())return sv4Team0(p);
  const prev=sv4SAdd(s,-1), pr=sv4SS(p.id,prev), t=sv4Team(p,prev);
  if(pr){ if(pr.zukunft==='geht'||pr.zukunft==='karriereende')return null; if(pr.zukunft==='hoch')return '1'; if(pr.zukunft==='runter')return '2'; }
  return t;
}
function sv4Zuk(p,s){ const r=sv4SS(p.id,s||sv4S()); return r?r.zukunft:(sv4Team(p,s)?'bleibt':null); }
function sv4Kader(team,s){ s=s||sv4S(); return players.filter(p=>sv4Team(p,s)===team||(sv4SS(p.id,s)||{}).team===team&&(sv4SS(p.id,s)||{}).zukunft==='ziel'); }
async function sv4SSSet(pid,s,upd){
  const cur=sv4SS(pid,s)||{}; const p=sv4P(pid);
  const row=Object.assign({player_id:pid,saison:s,team:cur.team!==undefined&&cur.player_id?cur.team:(p?sv4Team(p,s):null),zukunft:cur.zukunft||'bleibt',rolle:cur.rolle||null,pos:cur.pos||null,notiz:cur.notiz||null},upd);
  if(row.pos&&!SV4_POS.includes(row.pos))row.pos=null;
  const {data,error}=await SVB.sb.from('spieler_saison').upsert(row,{onConflict:'player_id,saison'}).select().single(); if(error)throw new Error(error.message);
  SV4.ss.set(pid+'|'+s,data); sv4Bump(); return data;
}
/* Wie steht der Spieler zum Verein? (für Kopfzeile, Listen, Filter) */
function sv4Bez(p){
  const s=sv4S(), t=sv4Team(p,s), nx=sv4SAdd(s,1), rn=sv4SS(p.id,nx), C=typeof crmOf==='function'?crmOf(p):{};
  if(t){ const z=sv4Zuk(p,nx); return {k:'intern',team:t,t:SV4_TEAM[t],z,zt:z&&SV4_ZUK[z]?SV4_ZUK[z][0]:''}; }
  if(rn&&rn.team&&(rn.zukunft==='neu'||rn.zukunft==='bleibt'))return {k:'verpflichtet',t:'Verpflichtet für '+sv4SL(nx),team:rn.team};
  const bk=SV4.bk.filter(x=>x.player_id===p.id&&!['absage','verworfen'].includes(x.status));
  if(C.c||bk.some(x=>x.status==='kontakt'||x.status==='zusage'))return {k:'kontaktiert',t:'Kontaktiert'};
  if(bk.some(x=>x.status==='shortlist'))return {k:'shortlist',t:'Shortlist'};
  if(bk.length||C.f||C.pl||C.s==='att')return {k:'kandidat',t:'Kandidat'};
  if(SV4.eyeBy.has(p.id)||(typeof SC2!=='undefined'&&SC2.follow&&SC2.follow.has&&SC2.follow.has(p.id)))return {k:'beobachtet',t:'Beobachtet'};
  if(C.s==='no')return {k:'nein',t:'Kein Interesse'};
  return {k:'extern',t:p.isJugend?'Jugend extern':'Extern'};
}

/* ---------- Einsätze: wann, wo, für wen ---------- */
function sv4Einsatz(p){
  const out={seasons:[],q:null,qTxt:'',est:false};
  const c=p.cur; const tm=sv4Team0(p);
  if(c&&c.spiele>0){
    const s={y:sv4SL(sv4S()),teamSp:c.spiele,liga:c.sub||c.liga,club:c.club||p.club,tore:c.tore};
    const fbT=tm==='2'?'D2':'A'; if(p.own&&typeof fbStats==='function'&&typeof FB!=='undefined'&&FB.loaded&&FB.m.some(g=>g.team===fbT&&g.bericht&&g.datum>=fbSeasonStart())){ const f=fbStats(p.id,fbSeasonStart(),fbT); if(f){ s.sp=f.sp; s.start=f.start; s.min=f.min; s.tore=f.tore; s.src='Spielberichte FUSSBALL.DE'; } }
    // 0.99.49: FuPa ist am genauesten (Ein- UND Auswechslungen, Minuten, Vorlagen) und geht vor. fussball.de kennt nur die Einwechslungen, darum stimmte dort die Spielzeit nicht.
    const kf=p.own?p.klaC:null; if(kf&&kf.einsaetze!=null){ s.sp=kf.einsaetze; s.start=kf.startelf!=null?kf.startelf:undefined; s.min=kf.minuten!=null?kf.minuten:undefined; if(kf.tore!=null)s.tore=kf.tore; s.vor=kf.vorlagen!=null?kf.vorlagen:undefined; s.src='FuPa'; }
    out.seasons.push(s);
  }
  if(!p.isJugend){
    const s={y:'25/26',teamSp:p.teamSp,liga:p.sub||p.liga,club:p.club,tore:p.tore,belegt:!!p.toreBelegt};
    if(p.einsaetze){ s.sp=p.einsaetze; s.src='FuPa-Kaderdaten'; } if(p.min)s.min=p.min; if(p.assists!=null)s.vor=p.assists;
    if(!s.sp&&p.kaderDoc&&p.kaderStarts!=null){ s.docS=p.kaderStarts; s.doc=p.kaderDoc; s.src='Vereinsheft (dokumentierte Spiele)'; }
    if(!s.src)s.src='Torjägerliste FUSSBALL.DE';
    out.seasons.push(s);
  }
  const qs=[]; out.seasons.forEach(s=>{ if(s.min&&s.teamSp)qs.push([Math.min(1,s.min/(s.teamSp*90)),s.teamSp]); else if(s.sp&&s.teamSp)qs.push([Math.min(1,s.sp/s.teamSp)*0.92,s.teamSp]); else if(s.doc)qs.push([Math.min(1,s.docS/s.doc),s.doc]); });
  if(qs.length){ const w=qs.reduce((a,x)=>a+x[1],0); out.q=qs.reduce((a,x)=>a+x[0]*x[1],0)/Math.max(1,w); }
  else if((p.tore||0)>0||(c&&c.tore>0)){ out.q=0.6; out.est=true; }
  return out;
}
function sv4EinsatzTxt(s){
  if(!s)return '–';
  const a=[]; if(s.sp!=null)a.push(`<b>${s.sp}</b> von ${s.teamSp} Sp.`); else if(s.doc)a.push(`<b>${s.docS}</b> Startelf in ${s.doc} dok. Sp.`); else a.push(`Einsätze unbekannt (Team: ${s.teamSp||'–'} Sp.)`);
  if(s.start!=null&&s.sp)a.push(`${s.start}× Startelf`); if(s.min)a.push(`${s.min.toLocaleString('de-DE')} Min.`); if(s.vor!=null)a.push(`${s.vor} Vorl.`);
  return a.join(' · ');
}

/* ---------- MScore 2.0 ---------- */
Object.assign(DEF_WEIGHTS,{prod:24,level:18,share:10,ctx:6,pot:12,trend:10,presse:6,scout:14}); W={...DEF_WEIGHTS};
Object.assign(WLBL,{prod:'Produktion / Defensivwert (ligagewichtet)',level:'Einsatz & Liga (Stammkraft)',share:'Teamrolle (Tor-Anteil bzw. Startelf)',ctx:'Teamstärke (Tabelle)',pot:'Potenzial (Alter)',trend:'Formtrend',presse:'Presse',scout:'Eye-Test (Trainer & Scouts)'});
const SV4_CL={prod:'Produktion',level:'Einsatz & Liga',share:'Teamrolle',ctx:'Teamstärke',pot:'Potenzial',trend:'Form',presse:'Presse',scout:'Eye-Test'};
{ const _sc4=scores; scores=function(p){
  if(!p)return _sc4(p);
  const ck=p.id+'|'+SV4.gen; const hit=SV4.cache.get(ck); if(hit)return hit;
  let r; try{ r=p.isJugend?sv4ScoreJ(_sc4(p),p):sv4Score(p,_sc4); }catch(e){ console.warn('MScore',p&&p.id,e); r=_sc4(p); }
  SV4.cache.set(ck,r); return r;
}; }
function sv4ScoreJ(o,p){ o.comps=[{k:'prod',t:'Produktion',v:o.prod,w:W.prod,art:'auto',basis:`${p.tore||0} Tore in ${p.teamSp||'–'} Team-Spielen (${sv4Esc(p.kurz||p.staffel||'Jugend')})`}]; o.eye=null; return o; }
function sv4Score(p,base){
  const c=p.cur&&p.cur.spiele>0?p.cur:null, useCur=!!(c&&c.spiele>=3);
  const E=sv4Einsatz(p), q=E.q;
  const ligaNow=useCur?(c.sub||c.liga):p.liga, lw=LIGA_W[ligaBase(ligaNow)]||LIGA_W[ligaBase(p.liga)]||1, w25=LIGA_W[ligaBase(p.liga)]||1;
  const sp25=p.einsaetze||((p.toreBelegt&&p.kaderDoc&&p.kaderStarts)?Math.max(6,p.kaderStarts):p.teamSp)||0;
  const t25=p.tore||0, t26=c?(c.tore||0):0, sp26=c?c.spiele:0;
  const sp26p=(E.seasons[0]&&E.seasons[0].sp!=null&&c)?E.seasons[0].sp:sp26;
  const spAll=Math.max(1,sp25+sp26p);
  const gw=(t25*w25+t26*lw)/spAll, gpg=(t25+t26)/spAll;
  let prod=clamp(gw*100,0,100);
  const tTall=(p.tT||0)+(c?(c.tT||0):0);
  let share=tTall>0?clamp(((t25+t26)/tTall)/0.40*100,0,100):50;
  const rank=useCur?c.rank:p.rank, tc=useCur?c.teamCount:p.teamCount;
  let ctx=50; if(rank!=null&&tc>1){ ctx=clamp(30+((rank-1)/(tc-1))*70,0,100); }
  let pot=50; if(p.alter!=null){ const a=p.alter; pot=a<=20?100:a<=23?88:a<=26?70:a<=29?50:a<=32?32:18; }
  let trend=50,tratio=null;
  if(useCur&&sp25>0){ const r26=(t26/Math.max(1,sp26p))*lw, r25=(t25/sp25)*w25; if(r25>0.02||r26>0.02){ tratio=r26/Math.max(0.05,r25); trend=clamp(50+(tratio-1)*40,0,100); } }
  else if(p.prev){ const wp=LIGA_W[ligaBase(p.prev.liga)]||1, rp=(p.prev.tore/Math.max(1,p.prev.spiele))*wp; tratio=((t25/Math.max(1,sp25))*w25)/Math.max(0.05,rp); trend=clamp(50+(tratio-1)*40,0,100); if(w25<wp)trend=Math.min(trend,85); }
  if(p.toreBelegt)trend=Math.max(trend,40);
  const presse=p.pressIdx!=null?p.pressIdx:50;
  // Einsatz & Liga: wer in einer höheren Liga regelmäßig spielt, ist schon deshalb gut
  const lvlBase=SV4_LVL[ligaBase(ligaNow)]||SV4_LVL[ligaBase(p.liga)]||50;
  const stamm=q==null?0.5:q; const level=clamp(lvlBase*(0.35+0.65*stamm),0,100);
  // Defensive: Team-Gegentore, aber nur so viel, wie der Spieler auch mitgespielt hat – und ligagewichtet
  let defMode=false,gaTxt=null,defRaw=null;
  if(p.pos==='TW'||p.pos==='IV'||p.pos==='AV'){
    defMode=true; ctx=50;
    const cl=typeof clubFor==='function'?clubFor(p.club):null, s26=cl&&cl.s2526, s27=cl&&cl['s'+sv4S()];
    const lg25=DATA.ligaGA&&DATA.ligaGA['2526']&&s26?DATA.ligaGA['2526'][s26.liga]:null, lg27=DATA.ligaGA&&DATA.ligaGA[sv4S()]&&s27?DATA.ligaGA[sv4S()][s27.liga]:null;
    let ga=0,sp=0,ex=0; if(s26&&s26.spiele&&lg25){ ga+=s26.gegentore; sp+=s26.spiele; ex+=lg25*s26.spiele; } if(s27&&s27.spiele&&lg27){ ga+=s27.gegentore; sp+=s27.spiele; ex+=lg27*s27.spiele; }
    let dv=50; if(sp>0&&ex>0){ const ratio=ga/ex; dv=clamp((1.45-ratio)/0.9*100,0,100); defRaw=dv; gaTxt=`${sv4Num(ga/sp,2)} Gegentore/Spiel (Team) vs. Liga-Schnitt ${sv4Num(ex/sp,2)}`; }
    const inv=clamp(q==null?0.5:q,0.15,1); dv=50+(dv-50)*inv;                      // nur so viel, wie er selbst gespielt hat
    dv=dv*(0.5+0.5*Math.min(1.3,lw)/1.25);                                        // ligagewichtet
    if(p.pos==='AV'&&p.assists)dv+=Math.min(10,p.assists*3);
    if(t25+t26>0)dv+=Math.min(15,(t25+t26)*5);
    prod=Math.max(prod,clamp(dv,0,100)); if(!(t25+t26>0))share=clamp((q==null?0.5:q)*100,0,100);
  }
  const ev=sv4EyeVal(p.id,p.pos); const eye=ev?ev.v:null;
  const Wt=Object.assign({},W); if(eye==null)Wt.scout=0; if(Wt.level==null)Wt.level=0;
  const parts={prod,level,share,ctx,pot,trend,presse,scout:eye==null?0:eye};
  const sum=Object.keys(parts).reduce((a,k)=>a+(Wt[k]||0),0)||1;
  let total=Object.keys(parts).reduce((a,k)=>a+parts[k]*(Wt[k]||0),0)/sum;
  let sdsB=0; if(p.sds>0){ sdsB=Math.min(6,p.sds*2); total=Math.min(100,total+sdsB); }
  const _mo=mvpOf(p); let mvpAdj=0,mvpVal=_mo?_mo.v:null,mvpD=_mo?_mo.d:null,mvpBase=total;
  if(mvpVal!=null&&p.adjTo==null){ const b=total; total=Math.min(100,total*mvpFactor(mvpVal)); mvpAdj=Math.round((total-b)*10)/10; }
  let adjD=0,adjBase=null; if(p.adjTo!=null){ adjBase=Math.round(total*10)/10; adjD=Math.round((p.adjTo-total)*10)/10; total=p.adjTo; }
  const proj=Math.round(gw*30);
  const s0=E.seasons[0], lig=l=>LIGA_NAME[ligaBase(l)]||l||'–';
  const comps=[
    {k:'prod',t:defMode?'Defensivwert':'Produktion',v:Math.round(prod),w:Wt.prod,art:'auto',basis:defMode?`${gaTxt?sv4Esc(gaTxt)+' · ':''}gewichtet mit seiner Einsatzquote (${q==null?'unbekannt':Math.round(q*100)+' %'}) und der Liga (× ${lw.toFixed(2)})${t25+t26>0?` · +${Math.min(15,(t25+t26)*5)} für ${t25+t26} Tore`:''}`:`${t25+t26} Tore in ${spAll} Spielen = ${sv4Num(gpg,2)}/Sp. · ligagewichtet ${sv4Num(gw,2)} (1,0 = 100)`},
    {k:'level',t:'Einsatz & Liga',v:Math.round(level),w:Wt.level,art:'auto',basis:`Liga ${sv4Esc(lig(ligaNow))} (Grundwert ${lvlBase}) × Einsatzquote ${q==null?'unbekannt → 50 %':Math.round(q*100)+' %'+(E.est?' (geschätzt)':'')}. Stammspieler einer höheren Liga zählen mehr.`},
    {k:'share',t:'Teamrolle',v:Math.round(share),w:Wt.share,art:'auto',basis:defMode&&!(t25+t26>0)?'Einsatzquote (Stammspieler = hoch)':(tTall>0?`${t25+t26} von ${tTall} Teamtoren (${Math.round((t25+t26)/tTall*100)} %) · 40 % = volle Punktzahl`:'keine Teamtore bekannt → neutral 50')},
    {k:'ctx',t:'Teamstärke',v:Math.round(ctx),w:Wt.ctx,art:'auto',basis:defMode?'bei Abwehrspielern neutral (steckt in den Gegentoren)':(rank!=null?`Tabellenplatz ${rank} von ${tc}`:'keine Tabelle')},
    {k:'pot',t:'Potenzial',v:Math.round(pot),w:Wt.pot,art:'auto',basis:p.alter!=null?`Alter ${p.alter}${p.geb?'':' (geschätzt)'}`:'Alter unbekannt → neutral'},
    {k:'trend',t:'Form',v:Math.round(trend),w:Wt.trend,art:'auto',basis:tratio!=null?`Quote aktuell vs. Vorsaison: ${tratio>=1?'+':''}${Math.round((tratio-1)*100)} %`:'noch kein Vergleich möglich → neutral'},
    {k:'presse',t:'Presse',v:Math.round(presse),w:Wt.presse,art:'auto',basis:p.pressIdx!=null?`Presse-Index aus ${(p.pressNews||[]).length} Nennungen`:'keine Presse → neutral 50'},
    {k:'scout',t:'Eye-Test',v:eye==null?null:Math.round(eye),w:Wt.scout,art:'manuell',basis:ev?`Ø aus ${ev.E.n} Bewertung${ev.E.n>1?'en':''} (${ev.E.list.map(e=>sv4Esc(e.rater_name||'?')).join(', ')})${ev.E.alt?' · aus Saison '+sv4SL(ev.E.alt):''}, positionsgewichtet für ${sv4Esc(p.pos||'–')}`:'noch kein Eye-Test: zählt dann nicht mit (Gewicht wird verteilt)'}];
  return {prod:Math.round(prod),share:Math.round(share),ctx:Math.round(ctx),pot:Math.round(pot),trend:Math.round(trend),presse:Math.round(presse),scout:eye==null?50:Math.round(eye),level:Math.round(level),
    total:Math.round(total*10)/10,mvp:mvpVal,mvpAdj,mvpD,mvpBase:Math.round(mvpBase*10)/10,gpg,proj,tratio,defMode,gaTxt,defRaw,sdsB,adjD,adjBase,
    shareRaw:tTall>0?(t25+t26)/tTall:null,cur:c,q,E,eye,eyeE:ev?ev.E:null,comps,sum};
}
function sv4ScoreInfo(p){
  const s=scores(p); if(!s.comps)return '';
  return sv4I('MScore '+sv4Num(s.total,1),{art:'auto',quelle:'Eigenes Modell (Daten + Eye-Test)',stand:(p.cur&&p.cur.stand)?sv4D(p.cur.stand):DATA.generated,
    txt:'Gewichteter Schnitt aus diesen Bausteinen. Die Gewichte stehen unter Wissen → Modell und werden mit mehr Daten besser.',
    rows:s.comps.filter(c=>c.w>0).map(c=>[`${c.t} · ${Math.round(c.w/s.sum*100)} %`,c.v==null?'–':c.v]).concat(s.sdsB?[['Elf der Woche (Bonus)','+'+s.sdsB]]:[]).concat(s.mvpAdj?[['FuPa-MVP',(s.mvpAdj>0?'+':'')+s.mvpAdj]]:[]).concat(s.adjD?[['Insider-Rating (manuell)',(s.adjD>0?'+':'')+s.adjD]]:[])});
}

/* ---------- Saison-Archiv ---------- */
function sv4StatIdx(){
  if(SV4._statIdx)return SV4._statIdx;
  const N=s=>(typeof TRC!=='undefined'?TRC.N(s||''):String(s||'').toLowerCase()).replace(/[^a-z]/g,'');
  const byN=new Map(); SV4.stat.forEach(r=>{ const k=N(r.name); if(!byN.has(k))byN.set(k,[]); byN.get(k).push(r); });
  const m=new Map(); players.filter(p=>p.own||p.exSvbc).forEach(p=>{ const L=byN.get(N(p.name)); if(L)m.set(p.id,L); });
  SV4._statIdx={byP:m,byN,N}; return SV4._statIdx;
}
function sv4Archiv(p){ if(!SV4.stat.length)return []; const I=sv4StatIdx(); return (I.byP.get(p.id)||I.byN.get(I.N(p.name))||[]).slice(); }

/* ---------- Wohnort → Entfernung ---------- */
function sv4Km(lat,lon){ if(lat==null||lon==null)return null; const R=6371,dLa=(lat-SV4_PLATZ.lat)*Math.PI/180,dLo=(lon-SV4_PLATZ.lon)*Math.PI/180;
  const a=Math.sin(dLa/2)**2+Math.cos(SV4_PLATZ.lat*Math.PI/180)*Math.cos(lat*Math.PI/180)*Math.sin(dLo/2)**2; return Math.round(2*R*Math.asin(Math.sqrt(a))*1.25); }
async function sv4Geo(ort){
  const k=String(ort||'').trim().toLowerCase(); if(!k)return null; if(SV4.geo.has(k))return SV4.geo.get(k);
  try{ const r=await fetch('https://nominatim.openstreetmap.org/search?format=json&limit=1&countrycodes=de&q='+encodeURIComponent(ort),{headers:{'Accept-Language':'de'}});
    const j=await r.json(); const x=j&&j[0]?{lat:+j[0].lat,lon:+j[0].lon,name:String(j[0].display_name||'').split(',')[0]}:null; SV4.geo.set(k,x); return x; }catch(e){ return null; }
}

/* ---------- Navigation nach Arbeitsbereichen ---------- */
const SV4_HUB={
  kader:{t:'Kader',tabs:[['kader','Kaderplan'],['elf','Aufstellung'],['gespr','Gespräche'],['sxi','Schattenelf'],['kaderplan','Rollen & Skills']]},
  scouting:{t:'Scouting',tabs:[['scout','Spielermarkt'],['bedarf','Bedarf & Aufträge'],['kandidaten','Kandidaten'],['radar','Radar'],['jugend','A-Jugend'],['cmp','Vergleich']]},
  mannschaft:{t:'Mannschaft',tabs:[['training:home','Übersicht'],['training:sessions','Einheiten'],['training:games','Spiele'],['training:players','Spieler'],['training:injuries','Verletzungen'],['kabine:abst','Abstimmungen'],['kabine:kontakte','Kontakte'],['kabine:link','Automatik']]},
  spieltag:{t:'Spieltag',tabs:[['gegner','Gegnercheck'],['totw','Elf der Woche']]},
  wissen:{t:'Wissen',tabs:[['play','Playbook'],['model','Modell']]}
};
const SV4_OF={kader:'kader',elf:'kader',gespr:'kader',sxi:'kader',kaderplan:'kader',scout:'scouting',db:'scouting',bedarf:'scouting',kandidaten:'scouting',radar:'scouting',gems:'scouting',jugend:'scouting',cmp:'scouting',
  training:'mannschaft',kabine:'mannschaft',gegner:'spieltag',totw:'spieltag',play:'wissen',model:'wissen'};
const SV4_SIDEKEY={kader:'kader',scouting:'scout',mannschaft:'training',spieltag:'gegner',wissen:'play'};
Object.assign(SV_PAGES,{
  kader:['Kader','Aktueller Kader, Zukunft je Spieler, Aufstellung und was fehlt'],gespr:['Spielergespräche','Wer bleibt? Letztes Gespräch, offene Themen, Entscheidung'],
  elf:['Aufstellung','Startelf der laufenden Saison planen'],sxi:['Schattenelf','Backups und Wunschspieler je Position'],kaderplan:['Rollen & Skills','Rollen, Special Skills und Fuß. Was haben wir, was fehlt'],
  scout:['Scouting','Spielermarkt: alle Spieler der Region. Filtern, sortieren, merken'],db:['Scouting','Spielermarkt als Tabelle'],bedarf:['Bedarf & Aufträge','Vom konkreten Bedarf zum passenden Spieler'],
  kandidaten:['Kandidaten','Externe Kandidaten: Kontakt, Wechselchance, Zuständigkeit'],radar:['Radar','Torserien, heiße Läufe, Rohdiamanten. Was in keiner Liste auffällt'],gems:['Radar','Rohdiamanten: unterschätzte Spieler'],
  jugend:['A-Jugend extern','Talente der Region (U19)'],cmp:['Vergleich','Spieler einer Position oder eines Auftrags nebeneinander'],
