  const rated=rows.filter(x=>x.ka!=null).sort((a,b)=>b.ka-a.ka), hi=rated[0], lo=rated[rated.length-1];
  const avgAll=rated.length?rated.reduce((a,x)=>a+x.ka,0)/rated.length:null;
  const L=rows.slice().sort((a,b)=>(b.ka??-1)-(a.ka??-1)||a.p.name.localeCompare(b.p.name,'de'));
  B.innerHTML=`<div class="card ey90k">
      <div class="chips4">${SV4_EYE.map(([key,l])=>`<button type="button" data-ek90="${key}" class="${k===key?'on':''}">${svEsc(l)}</button>`).join('')}</div>
      <div class="seg4 sm">${[['alle','Alle'],['eigen','Intern'],['extern','Extern']].map(([x,t])=>`<button type="button" data-es90="${x}" class="${sc===x?'on':''}">${t}</button>`).join('')}</div>
      <div class="ek90-st">
        <div><span>Höchster</span><b style="color:${hi?tierColor(hi.ka):'inherit'}">${hi?Math.round(hi.ka):'–'}</b><small>${hi?svEsc(hi.p.name):'noch niemand'}</small></div>
        <div><span>Schnitt</span><b>${avgAll!=null?Math.round(avgAll):'–'}</b><small>${rated.length} bewertet</small></div>
        <div><span>Niedrigster</span><b style="color:${lo?tierColor(lo.ka):'inherit'}">${lo?Math.round(lo.ka):'–'}</b><small>${lo?svEsc(lo.p.name):'–'}</small></div></div>
      <p class="note small">Alle Spieler in <b>${svEsc(lbl(k))}</b> untereinander: so bewertest du relativ zueinander statt jeden für sich. Der Regler speichert deine Einschätzung sofort, der Schnitt zeigt alle Planer zusammen.</p></div>
    <div class="card"><div class="ek90-l">${L.slice(0,160).map(x=>{ const ext=!x.own&&!x.mine;
      return `<div class="ek90-r" data-ek90p="${svEsc(x.p.id)}"><button type="button" class="ek90-n" data-eyp="${svEsc(x.p.id)}"><b>${svEsc(x.p.name)}</b><small><i class="io90 ${x.own?'in':'ex'}">${x.own?'intern':'extern'}</i> ${svEsc(x.p.pos||'')}</small></button>
        <div class="ek90-bar"><u style="width:${x.ka||0}%;background:${x.ka!=null?tierColor(x.ka):'transparent'}"></u>${avgAll!=null?`<em style="left:${avgAll}%"></em>`:''}</div>
        <span class="ek90-v"><b>${x.ka!=null?Math.round(x.ka):'–'}</b><small>${x.kn?'Ø '+x.kn:'keine'}</small></span>
        ${ext?`<button type="button" class="lk4" data-eyp="${svEsc(x.p.id)}" title="Bei externen Spielern bitte angeben, wann du ihn gesehen hast">im Profil bewerten</button>`
          :`<label class="ek90-in"><input type="range" min="1" max="10" step="0.5" value="${x.km!=null?x.km/10:5}" data-ek90in class="${x.km==null?'leer':''}"><output>${x.km!=null?Math.round(x.km):'du?'}</output></label>`}</div>`; }).join('')||'<p class="note">Niemand in dieser Auswahl.</p>'}</div></div>`;
  B.querySelectorAll('[data-ek90]').forEach(b=>b.onclick=()=>{ SV90.eyeCat=b.dataset.ek90; sv90EyeKat(B); });
  B.querySelectorAll('[data-es90]').forEach(b=>b.onclick=()=>{ SV90.eyeScope=b.dataset.es90; sv90EyeKat(B); });
  B.querySelectorAll('[data-eyp]').forEach(b=>b.onclick=()=>sv90EyeOpen(b.dataset.eyp));
  B.querySelectorAll('[data-ek90in]').forEach(i=>{ const o=i.nextElementSibling;
    i.oninput=()=>{ o.textContent=Math.round(+i.value*10); i.classList.remove('leer'); };
    i.onchange=async()=>{ const pid=i.closest('[data-ek90p]').dataset.ek90p, p=sv4P(pid), E=sv4Eye(pid), mine=E&&E.mine;
      const rec={player_id:pid,saison:s}; SV4_EYE.forEach(([kk])=>{ rec[kk]=mine&&mine[kk]!=null?+mine[kk]:null; }); rec[k]=+i.value;
      ['anlass','gesehen_am','gesehen_bei','notiz'].forEach(f=>{ if(mine&&mine[f]!=null)rec[f]=mine[f]; });
      if(!rec.anlass)rec.anlass=p&&p.own?'training':'scouting';
      i.disabled=true; try{ await sv4EyeSave(rec); kToast('✓ '+lbl(k,p)+' für '+(p?p.name:'')+': '+Math.round(+i.value*10)); try{ SV70.cache.clear(); }catch(e){} sv90EyeKat(B); }catch(e){ i.disabled=false; kToast('⚠️ '+e.message); } }; });
}
// Profil: erst der Schnitt, die Einzelbewertungen der Kollegen eingeklappt
{ const _ef90=pf4EyeForm; pf4EyeForm=function(box,p){
  const r=_ef90.apply(this,arguments);
  try{ const l=box.querySelector('.ey4-l'); if(l&&!l.closest('details')){ const E=sv4Eye(p.id);
      const avg=E?SV4_EYE.map(([k,,ab])=>E.avg[k]!=null?`${ab} ${Math.round(E.avg[k]*10)}`:'').filter(Boolean).join(' · '):'';
      const d=document.createElement('details'); d.className='ey90-d'; d.innerHTML=`<summary>Einzelbewertungen der Planer (${E?E.all.length:0})</summary>`;
      l.before(d); d.appendChild(l); const h=l.querySelector('h5'); if(h)h.remove();
      if(avg)d.insertAdjacentHTML('beforebegin',`<div class="ey90-avg"><b>Schnitt aller Planer</b><span>${svEsc(avg)}</span></div>`); } }catch(e){}
  return r; }; }

/* =====================================================================
   Kader: Verfügbarkeit, Sekundärspieler, Reserve, freie Plätze, Stand der Planung
   ===================================================================== */
const SV90_VF={eingeschraenkt:['eingeschränkt','Zählt nur halb. Zum Beispiel Schichtdienst, Studium weiter weg, oft verletzt.'],nein:['nicht verfügbar','Zählt in diesem Zeitraum nicht. Zum Beispiel Auslandssemester, lange Verletzung.']};
function sv90Verf(p,s){ const r=sv4SS(p.id,s); return r&&r.verfuegbar?{v:r.verfuegbar,g:r.verf_grund||''}:null; }
{ const _ak90=sv60Aktiv; sv60Aktiv=function(p,s,team){ const V=sv90Verf(p,s); if(V&&V.v==='nein')return false; return _ak90.apply(this,arguments); }; }
{ const _cv90=sv60Cov; sv60Cov=function(all,s,team){
  const V=_cv90.apply(this,arguments);
  try{ const C=V.C, halb=p=>{ const x=sv90Verf(p,s); return x&&x.v==='eingeschraenkt'; };
    V.rows.forEach(n=>{ const eh=n.haupt.filter(halb).length, en=n.neben.filter(halb).length; if(!eh&&!en)return;
      const d=eh*0.5+en*C.neben*0.5; n.cov-=d; n.covSicher-=d; n.eing=eh+en;
      n.gap=Math.max(0,Math.ceil(n.soll-n.cov-1e-9)); n.risk=Math.max(0,Math.ceil(n.soll-n.covSicher-1e-9)); });
    V.eing=V.aktiv.filter(halb).length;
  }catch(e){}
  return V; }; }
{ const _row90=kd4Row; kd4Row=function(p,s,team){
  let h=_row90.apply(this,arguments);
  try{ const V=sv90Verf(p,s); if(V){ const L=SV90_VF[V.v];
      h=h.replace(/(<button type="button" class="kr4-n"[^>]*><b>[^<]*<\/b><small>)/,`$1<i class="si60 vf90 ${V.v}" title="${svEsc(L[1])}">${L[0]}${V.g?': '+svEsc(V.g):''}</i> `);
      h=h.replace('class="kr4',`class="kr4 vf90r ${V.v==='nein'?'ina60':'halb90'}`); } }catch(e){}
  return h; }; }

// Zukunfts-Menü: Stand der Planung auf einen Blick, Verfügbarkeit, Verlauf
{ const _zm90=kd4ZukMenu; kd4ZukMenu=function(btn,pid){
  const r=_zm90.apply(this,arguments);
  try{ const m=document.querySelector('.zm4'); if(!m||m.querySelector('.zm90'))return r;
    const p=sv4P(pid), s=kd4S(), t=sv60Target(s), row=sv4SS(pid,t), cur=sv4SS(pid,s)||{}, team=sv4Team(p,t)||KD4.team, g=sv60LastG(pid), si=sv60Si(p,t);
    const Zg=typeof SV80_Z!=='undefined'?SV80_Z:{};
    // Zweite Mannschaft und inaktiv gelten für den angezeigten Zeitraum (in der laufenden Saison also sofort)
    const t2b=m.querySelector('[data-t2]'), inb=m.querySelector('[data-ina]'), t0=sv4Team(p,s)||KD4.team;
    const done=async(upd,msg,ss)=>{ m.remove(); try{ await sv4SSSet(pid,ss,upd); kToast('✓ '+p.name+': '+msg); kd4Render(); }catch(e){ kToast('⚠️ '+e.message); } };
    if(t2b){ t2b.innerHTML=(cur.team2?'✓ ':'')+'Auch in der '+(t0==='2'?'Ersten':'Zweiten')+' einsetzbar'+(s===sv4S()?' (jetzt)':'');
      t2b.onclick=e=>{ e.stopPropagation(); const want=t0==='2'?'1':'2'; done({team2:cur.team2?null:want},cur.team2?'nur noch '+SV4_TEAM[t0]:'auch '+SV4_TEAM[want],s); }; }
    if(inb){ inb.innerHTML=cur.inaktiv?'✓ Inaktiv ('+svEsc(cur.inaktiv)+'), wieder aktiv setzen':'Inaktiv setzen (Reserve, zählt nicht)';
      inb.onclick=e=>{ e.stopPropagation(); if(cur.inaktiv)return done({inaktiv:null},'wieder aktiv',s);
        const gr=prompt('Warum inaktiv? (z. B. spielt praktisch keine Rolle mehr, Pause)',''); if(gr===null){ m.remove(); return; } done({inaktiv:(gr.trim()||'Pause').slice(0,80)},'inaktiv',s); }; }
    const vf=cur.verfuegbar||'';
    const sec=document.createElement('div'); sec.className='zm90';
    sec.innerHTML=`<b>Stand für ${sv4SL(t)}</b>
      <div class="st90"><span>Systemannahme</span><em>bleibt in der ${svEsc(SV4_TEAM[sv4Team(p,s)||KD4.team]||'Mannschaft')}</em>
        <span>Planung</span><em class="${row?'':'mut'}">${row?svEsc((row.team?SV4_TEAM[row.team]:'nicht mehr bei uns')+' · '+((SV4_ZUK[row.zukunft]||[row.zukunft])[0])):'noch nichts geplant'}</em>
        <span>Gespräch</span><em class="${g?'':'mut'}">${g?svEsc((Zg[g.zukunft]||g.zukunft||'ohne Tendenz')+' · '+sv4D(g.datum)):'noch keins'}</em>
        <span>Zusage</span><em class="${si==='zusage'||si==='fakt'?'ok':'mut'}">${si==='fakt'?'steht fest':si==='zusage'?'ja':'nein'}</em></div>
      <b>Verfügbar ${s===sv4S()?'bis Saisonende':sv4SL(s)}</b>
      <div class="zm60-si">${[['','voll'],['eingeschraenkt','eingeschränkt'],['nein','nicht verfügbar']].map(([k,l])=>`<button type="button" data-vf90="${k}" class="si60 ${vf===k?'on':''}">${l}</button>`).join('')}</div>`;
    const anchor=m.querySelector('.zm60')||m.lastElementChild; if(anchor&&anchor.nextSibling)m.insertBefore(sec,anchor.nextSibling); else m.appendChild(sec);
    sec.querySelectorAll('[data-vf90]').forEach(b=>b.onclick=e=>{ e.stopPropagation(); const k=b.dataset.vf90;
      if(!k)return done({verfuegbar:null,verf_grund:null},'voll verfügbar',s);
      const gr=prompt(k==='nein'?'Warum nicht verfügbar? (z. B. Auslandssemester)':'Was schränkt ein? (z. B. Schichtdienst)',cur.verf_grund||''); if(gr===null){ m.remove(); return; }
      done({verfuegbar:k,verf_grund:gr.trim().slice(0,80)||null},SV90_VF[k][0],s); });
    const vw=document.createElement('div'); vw.className='zm90v'; m.appendChild(vw);
    sv90VerlaufBox(vw,q=>q.eq('tabelle','spieler_saison').eq('player_id',pid),false).addEventListener('click',e=>e.stopPropagation());
    const r2=btn.getBoundingClientRect(); m.style.top=Math.max(8,Math.min(window.innerHeight-m.offsetHeight-10,r2.bottom+6))+'px';
  }catch(e){ console.warn('Zukunft 0.7',e); }
  return r; }; }

// Kaderplan-Liste: Zeiträume, freie Plätze, Sekundärspieler, Reserve
{ const _kr90=kd4Render; kd4Render=function(){
  const r=_kr90.apply(this,arguments);
  try{ const P=document.getElementById('panel-kader'); if(!P||!P.querySelector('.kd4'))return r;
    const s=kd4S(), team=KD4.team, all=kd4Members(team,s), C=sv60C(), md=x=>{ const [mm,dd]=String(x).split('-'); return (+dd)+'.'+(+mm)+'.'; };
    // Zeiträume als Wechselperioden
    P.querySelectorAll('[data-ks]').forEach(b=>{ const x=b.dataset.ks; if(!b.querySelector('small'))b.insertAdjacentHTML('beforeend',`<small class="pz90">${x===sv4S()?'Winterfenster':'Sommerfenster'}</small>`); });
    const top=P.querySelector('.kd4-top > .note.small');
    if(top&&!P.querySelector('.pz90t'))top.insertAdjacentHTML('afterend',`<p class="note small pz90t">Geplant wird in Wechselperioden: <b>${sv4SL(sv4S())}</b> bis zum Winterfenster (${md(C.winter.von)} bis ${md(C.winter.bis)}), Verstärkung am schnellsten aus der Zweiten oder der A-Jugend. <b>${sv4SL(sv4SAdd(sv4S(),1))}</b> und <b>${sv4SL(sv4SAdd(sv4S(),2))}</b> über das Sommerfenster (${md(C.sommer.von)} bis ${md(C.sommer.bis)}).</p>`);
    const list=P.querySelector('.kd4-list'); if(!list||SV60.view==='backup')return r;
    const groups=[...list.querySelectorAll(':scope > .kl4:not(.out)')].slice(0,KD4_LINES.length);
    // Freie Plätze je Position als eigene Zeilen
    const V=sv60Cov(all,s,team);
    V.rows.filter(n=>n.gap>0).forEach(n=>{ const gi=KD4_LINES.findIndex(([,ps])=>ps.includes(n.pos)), G=groups[gi]; if(!G)return;
      const bed=SV4.bed.find(b=>b.pos===n.pos&&b.saison===s&&b.team===team&&!['erledigt','verworfen'].includes(b.status));
      for(let i=0;i<Math.min(3,n.gap);i++)G.insertAdjacentHTML('beforeend',`<div class="kr4 frei90"><span class="kr4-pos">${svEsc(n.pos)}</span><span class="fr90-t"><b>Freier Platz</b><small>Bedarf ${svEsc(SV4_POSL[n.pos]||n.pos)}${n.eing?' · eingeschränkt Verfügbare zählen halb':''}</small></span>
        ${bed?`<button type="button" class="lk4" data-bedopen90="${bed.id}">📋 Bedarf läuft</button>`:`<button type="button" class="lk4" data-fr90="${svEsc(n.pos)}">${SVI('plus')} Bedarf anlegen</button>`}</div>`); });
    // Reserve: inaktiv oder nicht verfügbar, zählt nicht
    const res=[...list.querySelectorAll('.kr4.ina60')].filter(x=>!x.closest('.out'));
    if(res.length){ const d=document.createElement('details'); d.className='kl4 res90'; d.open=true; d.innerHTML=`<summary>Reserve · zählen nicht<i>${res.length}</i></summary>`;
      res.forEach(x=>d.appendChild(x)); const out=list.querySelector(':scope > .kl4.out'); if(out)out.before(d); else list.appendChild(d); }
    // Sekundärspieler aus der anderen Mannschaft: sichtbar, aber ausgegraut, zählen dort
    const sek=players.filter(p=>sv4Team(p,s)&&sv4Team(p,s)!==team&&sv60Team2(p,s)===team&&!all.includes(p));
    if(sek.length){ const d=document.createElement('div'); d.className='kl4 sek90g';
      d.innerHTML=`<h5>Auch hier einsetzbar<i>${sek.length}</i> <small>zählen in ihrer eigenen Mannschaft</small></h5>${sek.map(p=>kd4Row(p,s,team).replace('class="kr4','class="kr4 sek90r').replace(/<button type="button" class="kr4-z[^"]*" data-kz="[^"]*">[^<]*<\/button>/,`<span class="kr4-z mut">${svEsc(SV4_TEAM[sv4Team(p,s)]||'')}</span>`)).join('')}`;
      const res2=list.querySelector(':scope > .res90')||list.querySelector(':scope > .kl4.out'); if(res2)res2.before(d); else list.appendChild(d); }
    list.querySelectorAll('.sek90g [data-svp]').forEach(b=>b.onclick=()=>openModal(b.dataset.svp));
    list.querySelectorAll('[data-fr90]').forEach(b=>b.onclick=()=>{ if(typeof sc4BedarfEditor==='function')sc4BedarfEditor(null,{pos:b.dataset.fr90,saison:s,team,zeitpunkt:s===sv4S()?'winter':'sommer',grund:'verstaerkung'}); });
    list.querySelectorAll('[data-bedopen90]').forEach(b=>b.onclick=()=>{ SC4.open=b.dataset.bedopen90; goTab('bedarf'); });
  }catch(e){ console.warn('Kaderplan 0.7',e); }
  return r; }; }

// „+ Spieler“: auch einen offenen Platz anlegen, ohne schon einen Namen zu haben
{ const _ap90=kd4AddPicker; kd4AddPicker=function(){
  const r=_ap90.apply(this,arguments);
  try{ const M=document.getElementById('modal'), seg=M&&M.querySelector('[data-am]')&&M.querySelector('[data-am]').parentElement, R=M&&M.querySelector('#kd4R'), q=M&&M.querySelector('#kd4Q');
    if(seg&&R&&!seg.querySelector('[data-am90]')){ seg.insertAdjacentHTML('beforeend','<button type="button" data-am90>Offener Platz</button>');
      const b=seg.querySelector('[data-am90]'); const s=kd4S(), team=KD4.team;
      seg.querySelectorAll('[data-am]').forEach(x=>x.addEventListener('click',()=>{ b.classList.remove('on'); if(q)q.style.display=''; }));
      b.onclick=()=>{ seg.querySelectorAll('button').forEach(x=>x.classList.toggle('on',x===b)); if(q)q.style.display='none';
        R.innerHTML=`<p class="note">Du weißt, dass auf einer Position jemand fehlt, aber noch nicht wer? Lege den Platz als Bedarf an. Er erscheint im Kaderplan als freier Platz und geht direkt ans Scouting.</p>
          <div class="op90">${SV4_POS.map(p=>`<button type="button" data-op90="${p}"><b>${svEsc(p)}</b><span>${svEsc(SV4_POSL[p])}</span></button>`).join('')}</div>`;
        R.querySelectorAll('[data-op90]').forEach(x=>x.onclick=()=>{ closeOverlay(); setTimeout(()=>sc4BedarfEditor(null,{pos:x.dataset.op90,saison:s,team,zeitpunkt:s===sv4S()?'winter':'sommer',grund:'verstaerkung'}),40); }); }; }
  }catch(e){}
  return r; }; }

// Bedarf: wer zählt zum Kader, und die Anforderungen des Trainers
function sv90Wuensche(team,s){ const W=(SV60.cfg&&SV60.cfg.wuensche)||{}; return (W[team+'|'+s]||[]).slice(); }
async function sv90WSave(team,s,L){
  const W=Object.assign({},(SV60.cfg&&SV60.cfg.wuensche)||{}), keep=new Set(sv4Seasons());
  Object.keys(W).forEach(k=>{ if(!keep.has(k.split('|')[1]))delete W[k]; });
  if(L.length)W[team+'|'+s]=L.slice(0,6); else delete W[team+'|'+s];
  await sv60CfgSave(Object.assign({},SV60.cfg||{},{wuensche:W}));
}
{ const _cs90=sv60CfgSave; sv60CfgSave=async function(cfg){ cfg=Object.assign({},cfg||{}); if(!('wuensche' in cfg)&&SV60.cfg&&SV60.cfg.wuensche)cfg.wuensche=SV60.cfg.wuensche; return _cs90.call(this,cfg); }; }
{ const _nh90=kd4NeedHtml; kd4NeedHtml=function(all,s,team){
  let h=_nh90.apply(this,arguments);
  try{ const V=sv60Cov(all,s,team), L=sv90Wuensche(team,s), edit=['admin','vorstand','planer','trainer'].includes(svRole());
    h=h.replace(/(<div class="fr60-t">)/,`$1<span class="def90">Zum Kader zählen alle aktiven, eingeplanten Spieler dieser Mannschaft. Reserve, nicht Verfügbare und Spieler anderer Mannschaften zählen nicht, eingeschränkt Verfügbare halb${V.eing?` (${V.eing} im Moment)`:''}.</span> `);
    h+=`<h4 class="sec60">Anforderungen des Trainers <small>was der Kader können soll, jenseits der Zahlen</small></h4>
      <div class="tw90">${L.map((w,i)=>`<div class="q60 fehlt tw90r"><b>${svEsc(w.t)}</b><span>${w.pos?svEsc(SV4_POSL[w.pos]||w.pos):'ganzer Kader'}</span>
        <div class="btnrow"><button type="button" class="lk4" data-twb90="${i}">${SVI('plus')} Bedarf anlegen</button>${edit?`<button type="button" class="lk4 mut" data-twx90="${i}" title="Entfernen">✕</button>`:''}</div></div>`).join('')||'<p class="note small">Noch keine. Zum Beispiel „insgesamt mehr Tempo“, „ein Sechser, der das Spiel eröffnet“ oder „für die Dreierkette planen“.</p>'}</div>
      ${edit?`<div class="tw90-add"><input id="tw90t" maxlength="60" placeholder="z. B. insgesamt mehr Tempo"><select id="tw90p"><option value="">ganzer Kader</option>${SV4_POS.map(p=>`<option value="${p}">${svEsc(SV4_POSL[p])}</option>`).join('')}</select><button type="button" class="btn sm" data-twadd90>${SVI('plus')} Hinzufügen</button></div>`:''}`;
  }catch(e){ console.warn('Bedarf 0.7',e); }
  return h; }; }
document.addEventListener('click',async e=>{
  const t=e.target.closest&&e.target.closest('[data-twadd90],[data-twx90],[data-twb90]'); if(!t||!t.closest('#panel-kader'))return;
  const s=kd4S(), team=KD4.team, L=sv90Wuensche(team,s);
  if(t.dataset.twb90!=null){ const w=L[+t.dataset.twb90]; if(!w)return; sc4BedarfEditor(null,{pos:w.pos||'ZM',saison:s,team,zeitpunkt:s===sv4S()?'winter':'sommer',grund:'verstaerkung'});
    setTimeout(()=>{ const M=document.getElementById('modal'); if(!M)return; const ro=M.querySelector('#b4ro'); if(ro)ro.value=w.t; const ti=M.querySelector('#b4t'); if(ti){ ti.value=w.t+' '+sv4SL(s); ti.dataset.touched='1'; } },30); return; }
  if(SV90.wBusy)return; SV90.wBusy=true;
  try{
    if(t.dataset.twx90!=null){ L.splice(+t.dataset.twx90,1); await sv90WSave(team,s,L); kToast('Anforderung entfernt'); }
    else { const i=document.getElementById('tw90t'), p=document.getElementById('tw90p'), v=(i&&i.value||'').trim(); if(!v){ kToast('Was soll der Kader können?'); return; }
      if(L.length>=6){ kToast('Höchstens sechs Anforderungen je Mannschaft und Saison'); return; }
      L.push(Object.assign({t:v.slice(0,60)},p&&p.value?{pos:p.value}:{})); await sv90WSave(team,s,L); kToast('✓ Anforderung gespeichert'); }
    kd4Render();
  }catch(x){ kToast('⚠️ '+x.message); } finally{ SV90.wBusy=false; }
});

// Backup je Position: eigener Kader zuerst, dann ausgegraut Zweite, Jugend und Sekundärspieler
sv60BackupHtml=function(all,s,team){
  const L=kd4Lineup(), xi=new Set(Object.values(L.slots)), C=sv60C(), {st}=sv60Starts();
  const aktiv=all.filter(p=>sv60Aktiv(p,s,team));
  const fit=(p,pos)=>kd4Pos(p,s)===pos?3:(p.pos2||[]).includes(pos)?2:((POSSIM[pos]||{})[kd4Pos(p,s)]||0);
  const extra=players.filter(p=>!all.includes(p)&&!sv60Inaktiv(p,s)&&!(sv90Verf(p,s)&&sv90Verf(p,s).v==='nein')).map(p=>{ const t=sv4Team(p,s);
      const src=sv60Team2(p,s)===team&&t!==team?'Sekundär':(team==='1'&&t==='2')?'Zweite':(team!=='A'&&t==='A')?'Jugend':null; return src?{p,src}:null; }).filter(Boolean);
  const cell=(p,pos,tag)=>{ const h=fit(p,pos)===3, V=sv90Verf(p,s);
    return `<button type="button" class="bk60${tag?' grau90':''}" data-svp="${svEsc(p.id)}"><em style="--c:${tierColor(kd4Ovr(p))}">${kd4Ovr(p)}</em><b>${svEsc(p.name)}</b><small>${svEsc(kd4Pos(p,s))}${h?'':' · Neben'}${tag?' · '+tag:''}${kd4Status(p,s,team)==='unsicher'?' · unsicher':''}${V?' · '+SV90_VF[V.v][0]:''}</small></button>`; };
  const lines=SV4_POS.filter(pos=>st[pos]).map(pos=>{
    const need=Math.max(1,Math.round((C.faktor-1)*st[pos]));
    const start=Object.entries(L.slots).filter(([i])=>{ const F=FORMATIONS[L.formation]||[]; return F[i]&&ROLE2POS[F[i][0]]===pos; }).map(([,id])=>sv4P(id)).filter(Boolean);
    const back=aktiv.filter(p=>!xi.has(p.id)&&fit(p,pos)>=2).sort((a,b)=>fit(b,pos)-fit(a,pos)||kd4Ovr(b)-kd4Ovr(a)).slice(0,need+1);
    const more=extra.filter(x=>fit(x.p,pos)>=2).sort((a,b)=>fit(b.p,pos)-fit(a.p,pos)||kd4Ovr(b.p)-kd4Ovr(a.p)).slice(0,3);
    const fehlt=Math.max(0,need-back.length);
    return `<div class="bu60${fehlt?' bad':''}"><div class="bu60-h"><b>${svEsc(SV4_POSL[pos])}</b><span>${st[pos]} in der Elf · ${need} Backup${need>1?'s':''} nötig</span>${fehlt?`<em class="bad">fehlt ${fehlt}</em>`:'<em class="ok">gesichert</em>'}</div>
      <div class="bu60-c"><div><h6>Startelf</h6>${start.map(p=>cell(p,pos)).join('')||'<p class="note small">nicht besetzt</p>'}</div><div><h6>Backup</h6>${back.map(p=>cell(p,pos)).join('')||'<p class="note small bad">niemand</p>'}</div></div>
      ${more.length?`<div class="bu90"><h6>Notfalls <small>zählen nicht im Kader</small></h6>${more.map(x=>cell(x.p,pos,x.src)).join('')}</div>`:''}</div>`; }).join('');
  return `<div class="kd4-lh"><h3>${SV4_TEAM[team]} · ${sv4SL(s)} <small>Backup je Position</small></h3></div>
    <p class="note small">Wer springt ein, wenn einer aus der Startelf (${svEsc(L.formation)}) ausfällt? Nebenpositionen zählen mit, Reserve und nicht Verfügbare nicht. Ausgegraut: Spieler aus der Zweiten, der Jugend oder mit anderer Hauptmannschaft. Wer mehrere Positionen kann, taucht mehrfach auf, zählt aber nur einmal.</p>${lines}`;
};

/* =====================================================================
   Traumelf je Zeitraum: frei planen, auch mit Spielern ohne Zusage
   ===================================================================== */
function sv90TKey(){ const T=SV90.traum; if(!T.s||!sv4Seasons().includes(T.s))T.s=sv4SAdd(sv4S(),1); return T.team+'|'+T.s+'|traum'; }
function sv90TLineup(){ const r=SV4.auf.get(sv90TKey()); return r?{formation:r.formation,slots:Object.assign({},r.slots||{})}:{formation:(SV4.auf.get(SV90.traum.team+'|'+SV90.traum.s+'|haupt')||{}).formation||'4-4-2',slots:{},neu:true}; }
async function sv90TSave(L){
  const T=SV90.traum, row={team:T.team,saison:T.s,art:'traum',formation:L.formation,slots:L.slots,bank:[]};
  const {data,error}=await SVB.sb.from('aufstellungen').upsert(row,{onConflict:'team,saison,art'}).select().single(); if(error)throw new Error(error.message);
  SV4.auf.set(sv90TKey(),data); return data;
}
function sv90Traum(){
  const P=document.getElementById('panel-sxi'); if(!P)return;
  if(!sv4Can()){ return; }
  if(!SV4.loaded){ if(!SV4.loading)sv4Load(); return; }
  // Alte Schattenelf (Startelf, Backup, Ziel auf der Hauptaufstellung) bleibt eingeklappt darunter erreichbar
  let old=P.querySelector(':scope > details.sx90-old'), host=P.querySelector(':scope > .sx90');
  if(!host){ old=document.createElement('details'); old.className='sx90-old pf4-sec'; old.innerHTML='<summary><span>Schattenelf wie bisher (Startelf, Backup, Transferziel)</span></summary>';
    [...P.children].forEach(c=>{ if(!c.classList.contains('info50'))old.appendChild(c); }); host=document.createElement('div'); host.className='sx90'; P.appendChild(host); P.appendChild(old); }
  const T=SV90.traum; sv90TKey(); const L=sv90TLineup(), F=FORMATIONS[L.formation]||FORMATIONS['4-4-2'];
  const lab=x=>x===sv4S()?'Rückrunde '+sv4SL(x):sv4SL(x);
  const card=(id,role,i)=>{ const p=id&&sv4P(id); if(!p)return `<button type="button" class="ps4 empty" data-tslot="${i}" style="left:${F[i][1]}%;top:${F[i][2]}%"><b>+</b><span>${svEsc(role)}</span></button>`;
    const ov=kd4Ovr(p), nm=p.name.split(' '), stat=sv90TStat(p);
    return `<button type="button" class="ps4 ${stat.k}" data-tslot="${i}" style="left:${F[i][1]}%;top:${F[i][2]}%" title="${svEsc(p.name)} · ${svEsc(stat.t)}"><em style="--c:${tierColor(ov)}">${ov}</em><i>${(p.photo||p.photoUrl)?`<img src="${p.photo||p.photoUrl}" alt="" loading="lazy" onerror="this.remove()">`:svEsc(initials(p.name))}</i><b>${svEsc(nm.slice(-1)[0])}</b><span>${svEsc(role)}${stat.k==='ext90'?' · ext':''}</span></button>`; };
  const ids=Object.values(L.slots).filter(id=>sv4P(id)), ps=ids.map(sv4P);
  const avg=A=>A.length?Math.round(A.reduce((a,p)=>a+kd4Ovr(p),0)/A.length):null;
  const kp=SV4.auf.get(T.team+'|'+T.s+'|haupt'), kIds=kp?Object.values(kp.slots||{}).filter(id=>sv4P(id)):[];
  const ext=ps.filter(p=>sv90TStat(p).k==='ext90'), zi=players.filter(p=>{ const r=sv4SS(p.id,T.s); return r&&r.zukunft==='ziel'&&r.team===T.team&&!ids.includes(p.id); });
  host.innerHTML=`<div class="card sx90-top">
      <div class="seg4">${[['1','1. Mannschaft'],['2','2. Mannschaft']].map(([k,t])=>`<button type="button" data-tt90="${k}" class="${T.team===k?'on':''}">${t}</button>`).join('')}</div>
      <div class="seg4 sm">${sv4Seasons().map(x=>`<button type="button" data-ts90="${x}" class="${T.s===x?'on':''}">${svEsc(lab(x))}</button>`).join('')}</div>
      <div class="sx90-f"><select data-tf90 aria-label="Formation">${Object.keys(FORMATIONS).map(f=>`<option${f===L.formation?' selected':''}>${f}</option>`).join('')}</select>
        <span class="note small">Hier darf geträumt werden: jeder Spieler, auch ohne Gespräch. Der verbindliche Kaderplan bleibt davon unberührt.</span></div></div>
    <div class="kd4-main">
      <div class="card"><div class="pitch4 fut-noflip"><div class="pl4"></div>${F.map(([role],i)=>card(L.slots[i],role,i)).join('')}</div></div>
      <div class="card sx90-side">
        <div class="sx90-cmp"><div><span>Traumelf</span><b style="color:${tierColor(avg(ps)||0)}">${avg(ps)??'–'}</b><small>Ø Stärke · ${ps.length}/11</small></div>
          <div><span>Kaderplan</span><b style="color:${tierColor(avg(kIds.map(sv4P))||0)}">${avg(kIds.map(sv4P))??'–'}</b><small>${kp?'Startelf im Kaderplan':'noch keine Aufstellung im Kaderplan'}</small></div></div>
        <h4 class="sec60">Wunschspieler in dieser Elf <small>${ext.length}</small></h4>
        ${ext.map(p=>{ const g=SV4.gs.some(x=>x.player_id===p.id); return `<div class="sx90-w"><button type="button" class="kr4-n" data-svp="${svEsc(p.id)}"><b>${svEsc(p.name)}</b><small>${svEsc((p.cur&&p.cur.club)||p.club||'')} · ${svEsc(sv90TStat(p).t)}</small></button>
          ${g?'<span class="ok small">Gespräch ✓</span>':`<button type="button" class="lk4" data-tg90="${svEsc(p.id)}">💬 Gespräch festhalten</button>`}</div>`; }).join('')||'<p class="note small">Nur eigene Spieler. Setz einen Wunschspieler auf eine Position, um ihn hier zu verfolgen.</p>'}
        ${zi.length?`<h4 class="sec60">Wunschspieler aus dem Kaderplan <small>noch nicht in der Elf</small></h4><div class="chips4">${zi.map(p=>`<span class="chip">${svEsc(p.name)} <i>${svEsc(p.pos||'')}</i></span>`).join('')}</div>`:''}
        <p class="note small">Kommt ein Wunschspieler ins Gespräch, halte es fest. Erst dann kann er im Kaderplan als Neuzugang zählen.</p></div></div>`;
  host.querySelectorAll('[data-tt90]').forEach(b=>b.onclick=()=>{ T.team=b.dataset.tt90; sv90Traum(); });
  host.querySelectorAll('[data-ts90]').forEach(b=>b.onclick=()=>{ T.s=b.dataset.ts90; sv90Traum(); });
  host.querySelector('[data-tf90]').onchange=async e=>{ const f=e.target.value, G=FORMATIONS[f], ids2=Object.keys(L.slots).sort((a,b)=>a-b).map(k=>L.slots[k]).filter(Boolean), sl={};
    G.forEach(([role],i)=>{ const want=ROLE2POS[role], j=ids2.findIndex(id=>{ const p=sv4P(id); return p&&p.pos===want; }); if(j>=0){ sl[i]=ids2[j]; ids2.splice(j,1); } });
    G.forEach((x,i)=>{ if(!sl[i]&&ids2.length)sl[i]=ids2.shift(); });
    try{ await sv90TSave({formation:f,slots:sl}); sv90Traum(); }catch(x){ kToast('⚠️ '+x.message); } };
  host.querySelectorAll('[data-tslot]').forEach(b=>b.onclick=()=>sv90TPick(+b.dataset.tslot));
  host.querySelectorAll('[data-svp]').forEach(b=>b.onclick=()=>openModal(b.dataset.svp));
  host.querySelectorAll('[data-tg90]').forEach(b=>b.onclick=()=>{ kd4GesprEditor(b.dataset.tg90); setTimeout(()=>{ const a=document.getElementById('g4a'); if(a)a.value='verhandlung'; },30); });
}
function sv90TStat(p){
  const T=SV90.traum, t=sv4Team(p,T.s);
  if(p.own&&t===T.team)return {k:'own90',t:'im Kader'};
  if(p.own&&t)return {k:'own90',t:SV4_TEAM[t]||'eigener Spieler'};
  if(p.own)return {k:'own90',t:'eigener Spieler'};
  const b=typeof sv4Bez==='function'?sv4Bez(p):{t:'extern'}; return {k:'ext90',t:b.t||'extern'};
}
function sv90TPick(slot){
  const L=sv90TLineup(), F=FORMATIONS[L.formation]||FORMATIONS['4-4-2'], role=F[slot][0], want=ROLE2POS[role], cur=L.slots[slot];
  const fit=p=>p.pos===want?3:(p.pos2||[]).includes(want)?2:((POSSIM[want]||{})[p.pos]||0);
  const M=svModal(`<h2 style="margin:0 0 4px">${svEsc(role)} in der Traumelf</h2><p class="note">${SV4_TEAM[SV90.traum.team]} · ${SV90.traum.s===sv4S()?'Rückrunde ':''}${sv4SL(SV90.traum.s)} · eigene und fremde Spieler</p>
    <input class="kx-in" id="tp90q" placeholder="Name oder Verein …" autocomplete="off"><div id="tp90r" class="pk4"></div>`);
  const q=M.querySelector('#tp90q'), R=M.querySelector('#tp90r');
  const draw=()=>{ const t=svNorm?svNorm(q.value):q.value.toLowerCase();
    const Lp=players.filter(p=>!p.isJugend||p.own).filter(p=>!t||(svNorm?svNorm(p.name+' '+(p.club||'')):(p.name+' '+(p.club||'')).toLowerCase()).includes(t))
      .sort((a,b)=>(t?0:fit(b)-fit(a))||kd4Ovr(b)-kd4Ovr(a)).slice(0,40);
    R.innerHTML=(cur?`<button type="button" data-tp90="" class="rm"><b>Platz leeren</b></button>`:'')+Lp.map(p=>{ const st=sv90TStat(p);
      return `<button type="button" data-tp90="${svEsc(p.id)}" class="${p.id===cur?'on':''}"><b>${svEsc(p.name)}</b><span>${svEsc((p.cur&&p.cur.club)||p.club||'')} · ${svEsc(svPosTxt(p)||'')} · ${kd4Ovr(p)}</span><i>${svEsc(st.t)}</i></button>`; }).join('')||'<p class="note">Niemand gefunden.</p>';
    R.querySelectorAll('[data-tp90]').forEach(b=>b.onclick=async()=>{ const id=b.dataset.tp90||null, N={formation:L.formation,slots:Object.assign({},L.slots)};
      if(id){ const from=Object.keys(N.slots).find(k=>N.slots[k]===id); if(from!=null){ if(cur)N.slots[from]=cur; else delete N.slots[from]; } N.slots[slot]=id; } else delete N.slots[slot];
      try{ await sv90TSave(N); closeOverlay(); sv90Traum(); }catch(x){ kToast('⚠️ '+x.message); } }); };
  q.oninput=draw; draw(); setTimeout(()=>q.focus(),50);
}
{ const _gt90=goTab; goTab=function(tab){ const r=_gt90.apply(this,arguments); try{ if(svCurTab()==='sxi')sv90Traum(); }catch(e){ console.warn('Traumelf',e); } return r; }; }
{ const _af90=sv4After; sv4After=function(){ const r=_af90.apply(this,arguments); try{ if(svCurTab()==='sxi')sv90Traum(); }catch(e){} return r; }; }

/* =====================================================================
   MScore: Historie, Vorlagen, Form hinten, und für jeden Baustein: warum eigenständig
   ===================================================================== */
const SV90_WARUM={
  level:'Misst, auf welchem Niveau und wie regelmäßig er spielt. In unseren Ligen die verlässlichste Zahl, deshalb das größte Gewicht. Frühere Saisons zählen mit, je älter, desto schwächer: wer schon höher gespielt hat, bekommt einen Teil davon angerechnet.',
  prod:'Misst, was er auf dem Platz bewirkt: vorne Tore, Vorlagen halb und nur als Zusatz (nicht jeder Verein pflegt sie), hinten wenige Gegentore im Verhältnis zur Liga. Wie oft er spielt, steckt schon in Einsatz & Liga und wird hier nicht noch einmal belohnt.',
  share:'Misst, wie wichtig er für seine Mannschaft ist: vorne sein Anteil an den Teamtoren, hinten ob er gesetzt ist. Zehn von 30 Teamtoren tragen mehr als zehn von 80. Das zeigt keine andere Zahl, darum ein eigener Baustein mit kleinem Gewicht.',
  ctx:'Misst nur den Tabellenplatz seiner Mannschaft. Die Liga steckt schon in Einsatz & Liga, deshalb zählt Teamstärke kaum und bei Abwehrspielern gar nicht, weil die Gegentore es schon abbilden.',
  pot:'Misst die Entwicklungsmöglichkeit über das Alter. Keine andere Zahl bildet das ab.',
  trend:'Misst die Richtung, nicht das Niveau: spielt er gerade besser oder schlechter als in der Vorsaison? Vorne über die Torquote, hinten über die Gegentore seiner Mannschaft. Niveau zeigen Einsatz & Liga und Produktion, deshalb ist Form nur ein kleiner Zusatz.',
  presse:'Was die Zeitungen schreiben, als kleines Korrektiv von rund 5 Prozent.',
  scout:'Was erfahrene Augen sehen und in keiner Statistik steht: Tempo, Technik, Zweikampf. Schnitt aller Planer auf der regionalen Skala.',
  trainer:'Nur bei eigenen Spielern: die echten Noten aus Training und Spiel. Automatisch vergebene 3er zählen nicht, die reine Spielbeteiligung steckt schon in Einsatz & Liga.'};
SV90.cache=new Map();
function sv90Stamm(sp,teamSp,tore){ if(sp&&teamSp)return Math.min(1,sp/teamSp); return tore>0?0.6:0.45; }
{ const _sc90=scores; scores=function(p){
  const r=_sc90.apply(this,arguments);
  if(!p||!r||!r.comps||p.isJugend||r._v90)return r;
  const ck=p.id+'|'+SV4.gen+'|'+(typeof TR!=='undefined'&&TR.loaded?TR.st.sessions.length:0)+'|'+r.total; const hit=SV90.cache.get(ck); if(hit)return hit;
  if(SV90.cache.size>6000)SV90.cache.clear();
  const o=Object.assign({},r,{comps:r.comps.map(c=>Object.assign({},c)),_v90:true}), known=Object.assign({},r.basisK||{});
  const adj=(key,nv,basis)=>{ const c=o.comps.find(x=>x.k===key); if(!c||c.v==null||nv==null||!isFinite(nv))return;
    nv=Math.round(Math.max(0,Math.min(100,nv))); const d=nv-c.v; if(basis!=null)c.basis=basis; if(!d)return;
    if(c.w&&p.adjTo==null&&o.sum)o.total=Math.round(Math.max(0,Math.min(100,o.total+d*c.w/o.sum))*10)/10; c.v=nv; o[key]=nv; };
  try{
    // 1) Einsatz & Liga: frühere Saisons mit Abklingen (nur nach oben, niemand wird für eine starke Vergangenheit bestraft)
    const lv=o.comps.find(c=>c.k==='level'), useCur=!!(p.cur&&p.cur.spiele>=3), H=[];
    if(useCur&&p.liga)H.push({y:'25/26',l:p.liga,st:sv90Stamm(p.einsaetze,p.teamSp,p.tore),d:0.8});
    if(p.prev&&p.prev.liga)H.push({y:'24/25',l:p.prev.liga,st:sv90Stamm(null,null,p.prev.tore),d:useCur?0.5:0.65});
    if(lv&&H.length){ const best=H.map(h=>({h,v:(SV4_LVL[ligaBase(h.l)]||0)*(0.35+0.65*h.st)*h.d})).sort((a,b)=>b.v-a.v)[0];
      if(best&&best.v>lv.v+2)adj('level',lv.v+(best.v-lv.v)*0.5,lv.basis+` · Früher höher: ${best.h.y} in der ${LIGA_NAME[ligaBase(best.h.l)]||best.h.l}, zur Hälfte angerechnet und nach Alter der Saison abgeschwächt`); }
    // 2) Vorlagen als Zusatz, halb so viel wie Tore
    let as=p.assists||0, asp=Math.max(1,p.einsaetze||p.teamSp||1);
    if(!as&&p.own&&typeof TR!=='undefined'&&TR.loaded){ const st0=typeof sv50Start==='function'?sv50Start():'2026-07-01'; let n=0,v=0;
      TR.st.sessions.forEach(g=>{ if(g.t!=='spiel'||g.d<st0)return; const a=(g.a||[]).find(x=>x[0]===p.id); if(!a||!(a[1]==='da'||a[1]==='spaet'))return; n++; v+=a[7]||0; }); if(v){ as=v; asp=Math.max(1,n); } }
    if(!r.defMode&&as>0){ const pr=o.comps.find(c=>c.k==='prod'), lw=LIGA_W[ligaBase(p.liga)]||1, bonus=Math.min(12,as/asp*50*lw);
      if(pr&&bonus>=0.5)adj('prod',pr.v+bonus,pr.basis+` · +${Math.round(bonus)} für ${as} Vorlagen (zählen halb so viel wie Tore)`); }
    // 3) Form bei Abwehr und Torwart: Gegentore dieser Saison gegen die Vorsaison, jeweils im Verhältnis zur Liga
    if(r.defMode&&typeof clubFor==='function'&&DATA.ligaGA){ const cl=clubFor(p.club), a=cl&&cl.s2526, b=cl&&cl['s'+sv4S()];
      const la=a&&DATA.ligaGA['2526']?DATA.ligaGA['2526'][a.liga]:null, lb=b&&DATA.ligaGA[sv4S()]?DATA.ligaGA[sv4S()][b.liga]:null;
      if(a&&b&&la&&lb&&a.spiele>=5&&b.spiele>=3){ const ra=a.gegentore/(la*a.spiele), rb=b.gegentore/(lb*b.spiele);
        adj('trend',50+(ra-rb)*80,`Gegentore im Verhältnis zum Liga-Schnitt: diese Saison ${sv4Num(rb,2)}, Vorsaison ${sv4Num(ra,2)} (unter 1 heißt besser als die Liga)`); known.trend=true; } }
    o.comps.forEach(c=>{ if(SV90_WARUM[c.k])c.warum=SV90_WARUM[c.k]; });
    if(r.basisK){ let wa=0,wk=0; Object.keys(known).forEach(c=>{ if(c==='trainer'&&!p.own)return; const w=W[c]||0; wa+=w; if(known[c])wk+=w; }); o.basis=wa?Math.round(wk/wa*100):0; o.basisK=known; }
  }catch(e){ console.warn('MScore 0.7',p.id,e); }
  SV90.cache.set(ck,o); return o;
}; }
{ const _rb90=renderAll; renderAll=function(){ SV90.cache.clear(); return _rb90.apply(this,arguments); }; }
{ const _ph90=pf4ScoreHtml; pf4ScoreHtml=function(p,s){
  const h=_ph90.apply(this,arguments);
  try{ const o=scores(p), keys=[...h.matchAll(/data-i4="(i\d+)"/g)].map(m=>m[1]);
    (o.comps||[]).forEach((c,i)=>{ const I=keys[i]&&SV4_INFO.get(keys[i]); if(I&&c.warum&&I.t===c.t)I.txt=svEsc('Warum eigener Baustein: '+c.warum); }); }catch(e){}
  return h; }; }
if(typeof SV4_MODEL!=='undefined'){
  SV4_MODEL.forEach(m=>{ if(m[0]==='prod')m[2]='Vorne: Tore pro Spiel, ligagewichtet (1,0 Tore je Spiel in der A-Liga = 100), Vorlagen zählen halb als Zusatz. Hinten: Gegentore der Mannschaft im Vergleich zur Liga, nur so weit, wie er selbst gespielt hat.';
    if(m[0]==='level')m[2]='Liga-Grundwert (GL 100 bis D 27) mal Einsatzquote. Hat er früher höher gespielt, wird ein Teil davon angerechnet, je älter, desto weniger.';
    if(m[0]==='trend')m[2]='Vorne die Torquote dieser Saison gegen die Vorsaison, hinten die Gegentore seiner Mannschaft im Verhältnis zur Liga, beides ab drei Spielen.'; });
  if(!SV4_MODEL.some(m=>m[0]==='trainer'))SV4_MODEL.push(['trainer','Trainerbewertung','Nur eigene Spieler: Durchschnitt der echten Noten aus Training und Spiel (Note 1 = 100, Note 6 = 0), ab drei Noten.']);
  { const _mc90=sv4ModelCard; sv4ModelCard=function(){ const r=_mc90.apply(this,arguments);
    try{ const P=document.getElementById('panel-model'), c=P&&P.querySelector('.m4'), t=c&&c.querySelector('table'); if(!t||c.querySelector('.m90'))return r;
      const hd=t.querySelector('thead tr'); if(hd)hd.insertAdjacentHTML('beforeend','<th>Warum eigenständig</th>');
      [...t.querySelectorAll('tbody tr')].forEach((tr,i)=>{ const k=SV4_MODEL[i]&&SV4_MODEL[i][0]; tr.insertAdjacentHTML('beforeend',`<td class="m90w">${svEsc(SV90_WARUM[k]||'')}</td>`); });
      t.insertAdjacentHTML('afterend',`<div class="m90"><h4>Keine Doppelzählung</h4><p class="note">Ein guter Spieler spielt viel, schießt deshalb mehr Tore und ist oft in Form. Damit das nicht dreifach zählt, misst jeder Baustein etwas anderes: <b>Einsatz & Liga</b> das Niveau und die Regelmäßigkeit, <b>Produktion</b> die Wirkung je Spiel, <b>Form</b> nur die Veränderung, <b>Teamstärke</b> nur den Tabellenplatz (kaum Gewicht). Fehlen Daten, zählt ein Baustein nicht, und die Datenbasis im Profil zeigt, wie belastbar der Wert ist. Vereinstreue gehört bewusst nicht in den MScore.</p></div>`); }catch(e){}
    return r; }; }
}

/* ---------- Vereinstreue in fünf Stufen, als Abzeichen ---------- */
const SV90_TREUE=[[80,5,'Vereinsikone'],[60,4,'Herzblut'],[40,3,'Verwurzelt'],[20,2,'Dabei'],[0,1,'Am Anfang']];
function sv90Stufe(score){ if(score==null)return null; const x=SV90_TREUE.find(a=>score>=a[0]); return {n:x[1],t:x[2]}; }
function sv90Herzen(n){ return `<span class="hz90" aria-label="${n} von 5">${[1,2,3,4,5].map(i=>`<i class="${i<=n?'on':''}">♥</i>`).join('')}</span>`; }
{ const _om90=openModal; openModal=function(){ const r=_om90.apply(this,arguments);
  try{ const M=document.getElementById('modal'), T=M&&M.querySelector('.tr70'), p=sv4P(arguments[0]); if(T&&p&&!T.querySelector('.hz90')){ const L=sv70Treue(p), S=L&&sv90Stufe(L.score);
      if(S){ const b=T.querySelector('b'); if(b)b.outerHTML=`<b class="tr90">${sv90Herzen(S.n)}<em>${svEsc(S.t)}</em></b>`; const sm=T.querySelector('small'); if(sm)sm.insertAdjacentHTML('afterbegin',`Stufe ${S.n} von 5 · Wert ${L.score} · `); } } }catch(e){}
  return r; }; }
if(typeof SV50_COLS!=='undefined'&&SV50_COLS.treue)SV50_COLS.treue.h=p=>{ const L=sv70Treue(p), S=L&&sv90Stufe(L.score); return S?`<span title="Vereinstreue: ${svEsc(S.t)} (${L.score})">${sv90Herzen(S.n)}</span>`:'–'; };
{ const _fc90=fcCard; fcCard=function(p,o){ try{ if(p&&p.own&&!(o&&o.badge)){ const L=sv70Treue(p), S=L&&sv90Stufe(L.score); if(S&&S.n>=3)o=Object.assign({},o||{},{badge:`<span class="tb90" title="Vereinstreue: ${svEsc(S.t)}">${'♥'.repeat(S.n)}</span>`}); } }catch(e){} return _fc90.call(this,p,o); }; }

/* =====================================================================
   Sportzentrale Beta 0.7 · Kabine: Urlaub vorab und Materialdienst
   - Spieler tragen Urlaub über ihren Kabinen-Link ein (oder das Trainerteam hier). Für jede Abstimmung im Zeitraum
     stehen sie automatisch auf „nicht dabei“ mit Grund, bekommen keine Einladung und keine Erinnerung,
     und im Training sind sie mit Grund vorbelegt.
   - Materialdienst: ein Team ist für einen Zeitraum zuständig (Standard vier Wochen). Das Trainerteam teilt ein,
     die Kabine zeigt es an, der Kabinen-Bot schreibt den Eingeteilten zum Start und an Trainingstagen.
   ===================================================================== */
const SV91={abw:[],md:[],loaded:false,busy:false,wochen:4};
const SV91_GR={urlaub:'Urlaub',arbeit:'Arbeit',uni:'Schule/Uni',familie:'Familie',privat:'Privat',krank:'Krank',verletzt:'Verletzt'};
const sv91Tag=d=>{ try{ return new Date(d+'T12:00:00').toLocaleDateString('de-DE',{weekday:'short',day:'numeric',month:'numeric'}); }catch(e){ return d; } };
const sv91Add=(d,n)=>{ const x=new Date(d+'T12:00:00Z'); x.setUTCDate(x.getUTCDate()+n); return x.toISOString().slice(0,10); };
async function sv91Load(force){
  if(SV91.busy||(SV91.loaded&&!force)||!SVB||!SVB.sb)return; SV91.busy=true;
  try{ const t=trToday();
    const [a,m]=await Promise.all([
      canTraining()?SVB.sb.from('abwesenheiten').select('*').gte('bis',sv91Add(t,-14)).order('von').limit(400):Promise.resolve({data:[]}),
      SVB.sb.from('materialdienst').select('*').gte('bis',sv91Add(t,-120)).order('von').limit(60)]);
    SV91.abw=(a&&a.data)||[]; SV91.md=(m&&m.data)||[]; SV91.loaded=true;
  }catch(e){ console.warn('Kabine 0.7',e); } finally{ SV91.busy=false; }
}
function sv91Abw(pid,d){ return SV91.abw.find(a=>a.player_id===pid&&a.von<=d&&d<=a.bis)||null; }
function sv91MdAm(d){ return SV91.md.find(m=>m.von<=d&&d<=m.bis)||null; }
const sv91Namen=m=>(m.spieler||[]).map(x=>x.name||(typeof trName==='function'?trName(x.id):x.id));
const sv91Vor=n=>String(n||'').split(' ')[0];

/* ---------- Training: Abwesende sind vorbelegt, auch ohne Abstimmung ---------- */
{ const _df91=sv50Defaults; sv50Defaults=function(datum){
  const D=_df91.apply(this,arguments);
  try{ Object.keys(D.rows).forEach(id=>{ const a=sv91Abw(id,datum), r=D.rows[id]; if(!a||(r.status_src==='abstimmung'&&r.status==='weg'))return;
      if(r.status_src==='abstimmung'&&r.status==='da')return;   // hat trotz Urlaub zugesagt: das zählt
      D.rows[id]={status:'weg',grund:SV91_GR[a.grund]?a.grund:'urlaub',status_src:'abstimmung'}; }); }catch(e){}
  return D; }; }
// Beim Öffnen des Trainings einmal nachladen, damit die Vorbelegung stimmt
{ const _q91=sv50Quick; sv50Quick=function(){ const a=arguments, self=this; if(!SV91.loaded&&canTraining()){ sv91Load().then(()=>_q91.apply(self,a)); return; } return _q91.apply(this,arguments); }; }

/* ---------- Training: wer hat gerade Materialdienst? ---------- */
{ const _vs91=trViewSessions; trViewSessions=function(B){
  const r=_vs91.apply(this,arguments);
  try{ if(!SV91.loaded){ sv91Load().then(()=>{ if(SV91.loaded&&svCurTab()==='training'&&TR.view==='sessions')trRender(); }); return r; }
    const h=B.querySelector('.hero50 .hero50-t'), m=sv91MdAm(trToday()), a=SV91.abw.filter(x=>x.von<=trToday()&&trToday()<=x.bis);
    if(h&&!h.querySelector('.md91h')&&(m||a.length))h.insertAdjacentHTML('beforeend',`<p class="md91h">${m?`🧺 Materialdienst: <b>${svEsc(sv91Namen(m).map(sv91Vor).join(' und '))}</b> bis ${TRC.fmt(m.bis)}`:''}${m&&a.length?' · ':''}${a.length?`🌴 ${a.length} im Urlaub oder abwesend: ${svEsc(a.map(x=>sv91Vor(trName(x.player_id))).join(', '))}`:''}</p>`);
  }catch(e){}
  return r; }; }

/* ---------- Abstimmungen: Materialdienst und Urlaub auf derselben Seite ---------- */
{ const _vp91=kbViewPolls; kbViewPolls=function(B){
  const r=_vp91.apply(this,arguments);
  try{ if(!canTraining())return r;
    if(!SV91.loaded){ sv91Load().then(()=>{ if(SV91.loaded&&svCurTab()==='kabine'&&KB.view!=='kasse')kbRender(); }); return r; }
    const box=document.createElement('div'); box.className='k91'; box.innerHTML=sv91MdHtml()+sv91AbwHtml();
    const auto=B.querySelector('#kbAuto50'); if(auto)auto.before(box); else B.appendChild(box);
    sv91Wire(box);
  }catch(e){ console.warn('Kabine 0.7',e); }
  return r; }; }
function sv91MdHtml(){
  const t=trToday(), cur=sv91MdAm(t), next=SV91.md.filter(m=>m.von>t).slice(0,4), alt=SV91.md.filter(m=>m.bis<t).slice(-2).reverse();
  const row=(m,k)=>`<div class="md91-r ${k}"><div><b>${svEsc(sv91Namen(m).join(', '))}</b><small>${TRC.fmt(m.von)} bis ${TRC.fmt(m.bis)}${m.notiz?' · '+svEsc(m.notiz):''}${k==='jetzt'?(m.start_gesendet_at?' · Nachricht verschickt':' · Nachricht folgt'):''}</small></div>
    <div class="btnrow"><button type="button" class="lk4" data-md91e="${m.id}">Ändern</button><button type="button" class="lk4 mut" data-md91x="${m.id}" title="Löschen">✕</button></div></div>`;
  return `<div class="card md91"><h3 class="sec50">🧺 Materialdienst</h3>
    <p class="note small">Ein Team ist für einen Zeitraum zuständig: Bälle, Leibchen und Hütchen mitbringen und wieder einräumen. Die Eingeteilten sehen es in der Kabine und bekommen zum Start und an Trainingstagen eine WhatsApp-Nachricht (wenn ihre Nummer hinterlegt ist).</p>
    ${cur?`<div class="md91-jetzt"><span>Jetzt dran</span><b>${svEsc(sv91Namen(cur).join(' und '))}</b><small>bis ${sv91Tag(cur.bis)}</small></div>`:'<p class="note">Gerade ist niemand eingeteilt.</p>'}
    ${cur||next.length?`<div class="md91-l">${cur?row(cur,'jetzt'):''}${next.map(m=>row(m,'bald')).join('')}</div>`:''}
    ${alt.length?`<details class="md91-alt"><summary>Zuletzt</summary>${alt.map(m=>row(m,'alt')).join('')}</details>`:''}
    <div class="btnrow"><button type="button" class="btn sm" data-md91n>${SVI('plus')} Team einteilen</button><button type="button" class="btn ghost sm" data-md91v>Nächste Teams vorschlagen</button></div></div>`;
}
function sv91AbwHtml(){
  const t=trToday(), L=SV91.abw.filter(a=>a.bis>=t);
  return `<div class="card ab91"><h3 class="sec50">🌴 Urlaub & Abwesenheiten</h3>
    <p class="note small">Spieler tragen Urlaub selbst über ihren Kabinen-Link ein. Für jedes Training im Zeitraum sind sie dann automatisch abgemeldet, bekommen keine Erinnerung und stehen im Training mit Grund als entschuldigt drin.</p>
    ${L.length?`<div class="ab91-l">${L.map(a=>`<div class="ab91-r${a.von<=t?' jetzt':''}"><div><b>${svEsc(trName(a.player_id))}</b><small>${sv91Tag(a.von)} bis ${sv91Tag(a.bis)} · ${svEsc(SV91_GR[a.grund]||a.grund)}${a.notiz?' · '+svEsc(a.notiz):''} · ${a.via==='link'?'selbst eingetragen':'vom Trainerteam'}</small></div>
      <button type="button" class="lk4 mut" data-ab91x="${a.id}" title="Löschen">✕</button></div>`).join('')}</div>`:'<p class="note">Niemand hat gerade Urlaub eingetragen.</p>'}
    <div class="btnrow"><button type="button" class="btn ghost sm" data-ab91n>${SVI('plus')} Für einen Spieler eintragen</button></div></div>`;
}
function sv91Wire(box){
  const q=(s,f)=>box.querySelectorAll(s).forEach(b=>b.onclick=()=>f(b));
  q('[data-md91n]',()=>sv91MdEdit(null)); q('[data-md91e]',b=>sv91MdEdit(b.dataset.md91e)); q('[data-md91v]',()=>sv91MdVorschlag());
  q('[data-md91x]',async b=>{ if(!b.classList.contains('sure')){ b.classList.add('sure'); b.textContent='Löschen?'; return; }
    const {error}=await SVB.sb.from('materialdienst').delete().eq('id',b.dataset.md91x); if(error)return kToast('⚠️ '+error.message); await sv91Load(true); kbRender(); kToast('Team gelöscht'); });
  q('[data-ab91x]',async b=>{ if(!b.classList.contains('sure')){ b.classList.add('sure'); b.textContent='Löschen?'; return; }
    const {error}=await SVB.sb.from('abwesenheiten').delete().eq('id',b.dataset.ab91x); if(error)return kToast('⚠️ '+error.message); await sv91Load(true); try{ await kbLoad(true); }catch(e){} kbRender(); kToast('Eintrag gelöscht, die automatischen Absagen sind zurückgenommen'); });
  q('[data-ab91n]',()=>sv91AbwEdit());
}
// Wer war wie oft dran? (für faire Vorschläge)
function sv91Zaehler(){ const c=new Map(); SV91.md.forEach(m=>(m.spieler||[]).forEach(x=>c.set(x.id,(c.get(x.id)||0)+1))); return c; }
function sv91Start(){ const t=trToday(), last=SV91.md.filter(m=>m.bis>=t).map(m=>m.bis).sort().pop(); return last?sv91Add(last,1):t; }
function sv91MdEdit(id,pre){
  const m=id?SV91.md.find(x=>x.id===id):null, sq=svAktuelleSpieler().slice().sort(svNachCmp), C=sv91Zaehler();
  const st={von:m?m.von:(pre&&pre.von)||sv91Start(),bis:m?m.bis:null,wo:SV91.wochen,sel:new Set(m?(m.spieler||[]).map(x=>x.id):((pre&&pre.ids)||[])),notiz:m?m.notiz||'':''};
  if(!st.bis)st.bis=sv91Add(st.von,st.wo*7-1);
  const M=svModal(`<div class="mhead"><div class="rm-ic" style="width:46px;height:46px">🧺</div><div><h2 style="margin:0">Materialdienst ${m?'ändern':'einteilen'}</h2><div class="msub">Standard sind vier Wochen, du kannst den Zeitraum frei anpassen</div></div></div><div id="md91f"></div>`);
  const draw=()=>{ const F=M.querySelector('#md91f'); if(!F)return;
    F.innerHTML=`<div class="editgrid"><div class="field"><label>Von</label><input type="date" id="md91von" value="${svEsc(st.von)}"></div>
        <div class="field"><label>Dauer</label><select id="md91wo">${[1,2,3,4,6,8].map(w=>`<option value="${w}"${st.wo===w?' selected':''}>${w} Woche${w>1?'n':''}</option>`).join('')}</select></div>
        <div class="field"><label>Bis</label><input type="date" id="md91bis" value="${svEsc(st.bis)}"></div>
        <div class="field w"><label>Hinweis (optional)</label><input id="md91n" maxlength="200" value="${svEsc(st.notiz)}" placeholder="z. B. Ballsack steht im Geräteraum"></div></div>
      <h4 class="sec60">Team <small>${st.sel.size} gewählt · meist zwei</small></h4>
      <div class="md91-p">${sq.map(p=>{ const ab=SV91.abw.find(a=>a.player_id===p.id&&a.von<=st.bis&&st.von<=a.bis);
        return `<button type="button" data-md91p="${svEsc(p.id)}" class="${st.sel.has(p.id)?'on':''}${ab?' ab':''}"><b>${svEsc(p.name)}</b><small>${C.get(p.id)?C.get(p.id)+'× dran':'noch nie'}${ab?' · '+svEsc(SV91_GR[ab.grund]||'abwesend'):''}${trInjury(p.id)?' · verletzt':''}</small></button>`; }).join('')}</div>
      <div class="btnrow sbact"><button class="btn" type="button" id="md91s">${SVI('check')} Speichern</button><button class="btn ghost" type="button" id="md91c">Abbrechen</button></div>`;
    const keep=()=>{ st.notiz=F.querySelector('#md91n').value; };
    F.querySelector('#md91von').onchange=e=>{ keep(); if(!e.target.value)return; st.von=e.target.value; st.bis=sv91Add(st.von,st.wo*7-1); draw(); };
    F.querySelector('#md91wo').onchange=e=>{ keep(); st.wo=+e.target.value; SV91.wochen=st.wo; st.bis=sv91Add(st.von,st.wo*7-1); draw(); };
    F.querySelector('#md91bis').onchange=e=>{ keep(); if(e.target.value)st.bis=e.target.value; };
    F.querySelectorAll('[data-md91p]').forEach(b=>b.onclick=()=>{ keep(); const id=b.dataset.md91p; if(st.sel.has(id))st.sel.delete(id); else if(st.sel.size<6)st.sel.add(id); draw(); });
    F.querySelector('#md91c').onclick=()=>closeOverlay();
    F.querySelector('#md91s').onclick=async e=>{ keep(); if(!st.sel.size)return kToast('Mindestens einen Spieler wählen'); if(st.bis<st.von)return kToast('„Bis“ liegt vor „von“');
      const row={von:st.von,bis:st.bis,spieler:[...st.sel].map(pid=>({id:pid,name:trName(pid)})),notiz:st.notiz.trim()||null};
      e.currentTarget.disabled=true;
      const {error}=m?await SVB.sb.from('materialdienst').update(row).eq('id',m.id):await SVB.sb.from('materialdienst').insert(row);
      if(error){ e.currentTarget.disabled=false; return kToast('⚠️ '+error.message); }
      closeOverlay(); svSound('success'); kToast('✓ Materialdienst '+TRC.fmt(st.von)+' bis '+TRC.fmt(st.bis)+': '+row.spieler.map(x=>sv91Vor(x.name)).join(' und ')); await sv91Load(true); if(svCurTab()==='kabine')kbRender(); };
  };
  draw();
}
// Vorschlag: die nächsten drei Zeiträume, je zwei Spieler, wer am seltensten dran war zuerst; Verletzte und Abwesende nicht
function sv91MdVorschlag(){
  const C=sv91Zaehler(), used=new Set(), pool=trSquad().filter(p=>!p.isJugend), plan=[]; let von=sv91Start();
  for(let i=0;i<3;i++){ const bis=sv91Add(von,SV91.wochen*7-1);
    const L=pool.filter(p=>!used.has(p.id)&&!trInjury(p.id)&&!SV91.abw.some(a=>a.player_id===p.id&&a.von<=bis&&von<=a.bis)).sort((a,b)=>(C.get(a.id)||0)-(C.get(b.id)||0)||a.name.localeCompare(b.name,'de')).slice(0,2);
    if(L.length<2)break; L.forEach(p=>used.add(p.id)); plan.push({von,bis,spieler:L.map(p=>({id:p.id,name:p.name}))}); von=sv91Add(bis,1); }
  if(!plan.length)return kToast('Zu wenige verfügbare Spieler für einen Vorschlag');
  const M=svModal(`<h2 style="margin:0 0 4px">Nächste Teams</h2><p class="note">Je ${SV91.wochen} Wochen, wer bisher am seltensten dran war, zuerst. Verletzte und Abwesende sind ausgelassen.</p>
    <div class="md91-l">${plan.map(x=>`<div class="md91-r bald"><div><b>${svEsc(x.spieler.map(s=>s.name).join(', '))}</b><small>${TRC.fmt(x.von)} bis ${TRC.fmt(x.bis)}</small></div></div>`).join('')}</div>
    <div class="btnrow sbact"><button class="btn" type="button" id="md91ok">${SVI('check')} So übernehmen</button><button class="btn ghost" type="button" id="md91no">Abbrechen</button></div>`);
  M.querySelector('#md91no').onclick=()=>closeOverlay();
  M.querySelector('#md91ok').onclick=async e=>{ e.currentTarget.disabled=true; const {error}=await SVB.sb.from('materialdienst').insert(plan);
    if(error){ e.currentTarget.disabled=false; return kToast('⚠️ '+error.message); } closeOverlay(); kToast('✓ '+plan.length+' Teams eingeteilt'); await sv91Load(true); if(svCurTab()==='kabine')kbRender(); };
}
function sv91AbwEdit(){
  const sq=svAktuelleSpieler().slice().sort(svNachCmp), t=trToday();
  const M=svModal(`<h2 style="margin:0 0 4px">Urlaub oder Abwesenheit eintragen</h2><p class="note">Für jedes Training im Zeitraum ist der Spieler dann automatisch abgemeldet und bekommt keine Erinnerung.</p>
    <div class="editgrid"><div class="field w"><label>Spieler</label><select id="ab91p">${sq.map(p=>`<option value="${svEsc(p.id)}">${svEsc(p.name)}</option>`).join('')}</select></div>
      <div class="field"><label>Von</label><input type="date" id="ab91v" value="${t}" min="${t}"></div><div class="field"><label>Bis</label><input type="date" id="ab91b" value="${sv91Add(t,6)}" min="${t}"></div>
      <div class="field"><label>Grund</label><select id="ab91g">${Object.entries(SV91_GR).map(([k,v])=>`<option value="${k}">${v}</option>`).join('')}</select></div>
      <div class="field w"><label>Notiz (optional)</label><input id="ab91n" maxlength="200"></div></div>
    <div class="btnrow sbact"><button class="btn" type="button" id="ab91s">${SVI('check')} Eintragen</button><button class="btn ghost" type="button" id="ab91c">Abbrechen</button></div>`);
  M.querySelector('#ab91c').onclick=()=>closeOverlay();
  M.querySelector('#ab91s').onclick=async e=>{ const v=id=>M.querySelector(id).value, row={player_id:v('#ab91p'),von:v('#ab91v'),bis:v('#ab91b'),grund:v('#ab91g'),notiz:v('#ab91n').trim()||null,via:'app'};
    if(!row.von||!row.bis||row.bis<row.von)return kToast('Bitte einen gültigen Zeitraum wählen');
    e.currentTarget.disabled=true; const {error}=await SVB.sb.from('abwesenheiten').insert(row);
    if(error){ e.currentTarget.disabled=false; return kToast('⚠️ '+error.message); }
    closeOverlay(); kToast('✓ '+trName(row.player_id)+': '+SV91_GR[row.grund]+' eingetragen'); await sv91Load(true); try{ await kbLoad(true); }catch(x){} if(svCurTab()==='kabine')kbRender(); };
}
if(typeof SV50_INFO!=='undefined'&&SV50_INFO['kabine:abst']){ SV50_INFO['kabine:abst'].w='Wer kommt zum Training oder Spiel? Die Abstimmungen per Link, die Automatik, Urlaub und der Materialdienst.';
  SV50_INFO['kabine:abst'].b=['Dienstag und Donnerstag wird automatisch abgestimmt, der Link geht am Vortag raus.','Wer Urlaub eingetragen hat, ist für diese Tage schon abgemeldet und wird nicht erinnert.']; }

/* =====================================================================
   Sportzentrale Beta 0.9 · MScore 4: Spielstärke wie bei FIFA
   Der Wert beschreibt, wie gut ein Spieler ist, nicht in welcher Liga er gerade spielt.
   1. Jede Saison (24/25, 25/26, laufende) ist ein Beleg: Liga-Niveau plus Rolle, Leistung im Vergleich
      zu Spielern derselben Liga und desselben Mannschaftsteils, Ausnahmeleistung, FuPa-MVP und Elf der Woche.
      Seit 0.22: laufende Saison plus drei Spielzeiten davor, der Tabellenplatz der Mannschaft zählt nicht mehr.
   2. Belege werden auf heute gealtert (Alterskurve je Position) und nach Spielen und Aktualität gewichtet.
   3. Deckeneffekt: Wer in einer tieferen Liga als zuvor vorne mitspielt, kann dort nach oben nichts mehr
      beweisen. Solche Saisons ziehen ihn kaum nach unten. Wer dort nur Ergänzung ist, zählt voll.
   4. Der Eye-Test ist eine eigene Messung auf derselben Skala und zählt je nach Zahl der Planer mehr.
   5. Dazu Trainernoten, Erfahrung und Presse. Das Insider-Rating überschreibt weiter transparent.
   Skala wie beim Eye-Test: 50 = solider Stammspieler Kreisliga A.
   ===================================================================== */
const SV94_NIVEAU={HL:86,VL:79,GL:72,KOL:63,A:51,B:42,C:34,D:27};
const SV94_LNAME={HL:'Hessenliga',VL:'Verbandsliga'};
const SV94_GRUPPE=pos=>['ST','OM','Flügel'].includes(pos)?'off':['IV','AV','TW'].includes(pos)?'def':'mid';
const SV94_GRUPPE_T={off:'Offensivspieler',mid:'Mittelfeldspieler',def:'Abwehrspieler und Torhüter'};
const SV94={dist:null,gen:-1,cache:new Map(),tc:{}};
const sv94C=(v,a,b)=>Math.max(a,Math.min(b,v));
const sv94Lv=l=>{ if(!l)return null; const b=ligaBase(l); return SV94_NIVEAU[b]!=null?b:null; };
const sv94LN=l=>LIGA_NAME[l]||SV94_LNAME[l]||l;
const sv94N=(v,d=1)=>sv4Num(v,d);
const sv94Pm=(v,d=1)=>(v>0?'+':v<0?'−':'±')+sv4Num(Math.abs(v),d);
let _sv94prev=null;

/* ---------- Alterskurve: Punkte je Jahr (Anstieg bis Mitte 20, ab 29 Abbau, Flügel und Außen schneller, Innenverteidiger und Torhüter langsamer) ---------- */
function sv94Rate(age,pos){
  if(age==null)return 0;
  let r=age<=18?4:age<=20?3:age<=22?2:age<=24?1:age<=28?0:age<=30?-0.8:age<=32?-1.6:age<=34?-2.6:-3.5;
  if(r<0){ if(['Flügel','AV','ST'].includes(pos))r*=1.25; else if(['IV','TW'].includes(pos))r*=0.7; }
  else if(pos==='Flügel')r*=1.2;
  return r;
}
function sv94Alterung(age,pos,jahre){ if(age==null||!(jahre>0))return 0; let s=0,y=jahre,a=age-jahre; while(y>1e-6){ const st=Math.min(1,y); s+=sv94Rate(Math.floor(a),pos)*st; a+=st; y-=st; } return s; }
// Jahre zwischen Saisonmitte und heute (oder heute und einem Datum in der Zukunft)
const sv94Jahr0=()=>2000+parseInt(sv4S().slice(0,2),10);
const sv94Mitte=d=>`${sv94Jahr0()+d}-01-15`;   // Saisonmitte: 0 = Vorsaison (25/26), 2 = nächste Saison
const sv94Next=()=>{ const y=sv94Jahr0()%100+1; return `${y}/${y+1}`; };
function sv94Jahre(d,zukunft){ const now=Date.now(); if(!d)return 0.05; const t=new Date(d+'T12:00:00').getTime(); return Math.max(0,(zukunft?t-now:now-t)/(365.25*864e5)); }
function sv94Pot(wert,age,pos){ if(age==null)return null; let s=0; for(let a=age;a<27;a++)s+=Math.max(0,sv94Rate(a,pos)); return Math.round(Math.min(97,wert+s*0.8)*10)/10; }

/* ---------- Vergleichswerte je Liga und Positionsgruppe (Saison 25/26) ---------- */
function sv94Dist(){
  if(SV94.dist&&SV94.gen===SV4.gen)return SV94.dist;
  const D={};
  players.forEach(p=>{ if(p.isJugend)return; const g=SV94_GRUPPE(p.pos); if(g==='def')return; const lv=sv94Lv(p.sub||p.liga); if(!lv)return;
    const sp=p.einsaetze||0; if(sp<6)return; const v=(p.tore||0)/sp+(p.assists>0?0.5*p.assists/sp:0); (D[lv+'|'+g]=D[lv+'|'+g]||[]).push(v); });
  Object.values(D).forEach(a=>a.sort((x,y)=>x-y));
  SV94.dist=D; SV94.gen=SV4.gen; SV94.tc={}; return D;
}
function sv94Pct(k,v){ const a=sv94Dist()[k]; if(!a||a.length<8||v==null)return null; let lo=0,hi=a.length; while(lo<hi){ const m=(lo+hi)>>1; if(a[m]<v)lo=m+1; else hi=m; } let up=lo; while(up<a.length&&a[up]===v)up++; return ((lo+up)/2)/a.length; }
function sv94TC(sk,liga){ const k=sk+'|'+liga; if(SV94.tc[k]!=null)return SV94.tc[k]; let m=0; Object.values(DATA.clubs||{}).forEach(c=>{ const s=c['s'+sk]; if(s&&s.liga===liga&&s.platz>m)m=s.platz; }); return SV94.tc[k]=m||null; }
function sv94Def(club,sk,liga){
  if(typeof clubFor!=='function'||!DATA.ligaGA)return null; const cl=clubFor(club), s=cl&&cl['s'+sk], lg=DATA.ligaGA[sk];
  if(!s||!s.spiele||s.gegentore==null||!lg)return null; const avg=lg[s.liga]||lg[liga]; if(!avg)return null;
  return sv94C((1.45-(s.gegentore/s.spiele)/avg)/0.9,0,1);
}

/* ---------- Saisons als Belege ---------- */
// Eigene Spiele aus der App (z. B. per FuPa-Auswerter übernommen): Minuten, Startelf, Tore, Vorlagen, Punkte mit und ohne ihn
function sv94AppSpiele(p){
  if(!p||!p.own||typeof TR==='undefined'||!TR.loaded||!TR.st||typeof sv50Start!=='function')return null;
  const start=sv50Start(), heute=trToday(), G=TR.st.sessions.filter(x=>x.t==='spiel'&&x.d>=start&&x.d<=heute&&x.tw!=null&&x.tg!=null);
  if(G.length<3)return null;
  let sp=0,s11=0,min=0,minN=0,tore=0,ast=0,dabei=false; const mit=[],ohne=[];
  G.forEach(g=>{ const a=(g.a||[]).find(x=>x[0]===p.id), pk=g.tw>g.tg?3:g.tw===g.tg?1:0;
    if(a)dabei=true;
    const spielte=a&&(a[1]==='da'||a[1]==='spaet');
    if(spielte){ sp++; if(a[1]==='da')s11++; if(a[11]!=null){ min+=a[11]; minN++; } }
    if(a){ tore+=a[6]||0; ast+=a[7]||0; }
    if(spielte&&(a[1]==='da'||(a[11]||0)>=45))mit.push(pk); else if(!spielte)ohne.push(pk); });
  if(!dabei&&p.kader!==1)return null;
  const ppg=L=>L.length?L.reduce((x,y)=>x+y,0)/L.length:null;
  return {G:G.length,sp,s11,min:minN===sp&&sp>0?min:null,tore,ast,mit:mit.length,ohne:ohne.length,ppgMit:ppg(mit),ppgOhne:ppg(ohne)};
}
function sv94Seasons(p,r){
  const S=[], c=p.cur&&p.cur.spiele>0?p.cur:null, E=(r&&r.E)||{seasons:[]};
  let qB=null; if(p.min&&p.teamSp)qB=Math.min(1,p.min/(p.teamSp*90)); else if(p.einsaetze&&p.teamSp)qB=Math.min(1,p.einsaetze/p.teamSp)*0.92; else if(p.kaderDoc&&p.kaderStarts!=null)qB=Math.min(1,p.kaderStarts/p.kaderDoc);
  const AS=sv94AppSpiele(p);
  if(AS){ const lg=c?(c.sub||c.liga):(p.sub||p.liga), q=AS.min!=null?Math.min(1,AS.min/(AS.G*90)):Math.min(1,AS.sp/AS.G)*0.92;
    S.push({k:'cur',y:sv4SL(sv4S()),sk:sv4S(),liga:lg,club:c?(c.club||p.club):p.club,teamSp:AS.G,sp:AS.sp,q,qF:null,tore:AS.tore,ast:AS.ast,rank:c?c.rank:p.rank,tc:c?c.teamCount:p.teamCount,jahre:sv94Jahre(null),rec:1.2,app:AS}); }
  else if(c){ const e0=E.seasons[0]&&E.seasons[0].y===sv4SL(sv4S())?E.seasons[0]:null; let q=null, sp=null;
    if(e0&&e0.sp!=null){ sp=e0.sp; q=e0.min?Math.min(1,e0.min/(c.spiele*90)):Math.min(1,e0.sp/c.spiele)*0.92; }
    S.push({k:'cur',y:sv4SL(sv4S()),sk:sv4S(),liga:c.sub||c.liga,club:c.club||p.club,teamSp:c.spiele,sp,q,qF:qB,tore:e0&&e0.tore!=null?e0.tore:(c.tore||0),ast:0,rank:c.rank,tc:c.teamCount,jahre:sv94Jahre(null),rec:1.2}); }
  S.push({k:'base',y:'25/26',sk:'2526',liga:p.sub||p.liga,club:p.club,teamSp:p.teamSp,sp:p.einsaetze||null,q:qB,qF:null,tore:p.tore||0,ast:p.assists||0,rank:p.rank,tc:p.teamCount,jahre:sv94Jahre(sv94Mitte(0)),rec:0.9});
  if(p.prev&&p.prev.liga){ const cl=typeof clubFor==='function'?clubFor(p.prev.verein):null, cs=cl&&cl.s2425; const tsp=(cs&&cs.spiele)||30, sp=p.prev.spiele||null;
    S.push({k:'prev',y:'24/25',sk:'2425',liga:p.prev.liga,club:p.prev.verein,teamSp:tsp,sp,q:sp!=null?Math.min(1,sp/tsp)*0.92:null,qF:null,tore:p.prev.tore||0,ast:0,rank:cs?cs.platz:null,tc:cs?sv94TC('2425',cs.liga):null,jahre:sv94Jahre(sv94Mitte(-1)),rec:0.5}); }
  return S;
}
function sv94Eval(p,s,grp,mvp){
  const lv=sv94Lv(s.liga); if(!lv)return null; const L=SV94_NIVEAU[lv];
  let q=s.q, qEst=false; if(q==null){ q=s.qF!=null?s.qF:0.55; qEst=true; }
  const n=s.sp!=null?s.sp:Math.round((s.teamSp||0)*q);
  let role=q>=0.75?(q-0.75)*8:(q-0.75)*20;
  const t=s.rank!=null&&s.tc>1?sv94C(1-(s.rank-1)/(s.tc-1),0,1):0.5;
  let pct=null, raw=null;
  if(grp==='def')pct=sv94Def(s.club,s.sk,s.liga);
  else { const sp=Math.max(1,n); raw=(s.tore||0)/sp+(s.ast>0?0.5*s.ast/sp:0); pct=n>0?sv94Pct(lv+'|'+grp,raw):null; }
  let lei=pct==null?0.5:pct;   // 0.22: Tabellenplatz der Mannschaft zählt nicht mehr
  let prod=(lei-0.5)*12*(n/(n+4));
  if(grp==='def'){ prod*=0.5+0.5*Math.min(1,q/0.75); if(s.tore>0)prod+=Math.min(3,s.tore*0.8); }
  const team=0;   // 0.22: Baustein „Mannschaft“ entfällt
  const gpg=(s.tore||0)/Math.max(1,n);
  const dom=grp!=='def'&&gpg>1&&n>=6?Math.min(30,(gpg-1)*13):0;
  let mvpOff=0; if(mvp!=null){ mvpOff=(mvp-60)/40*8; role*=0.5; prod*=0.5; }
  const sds=s.k==='base'&&p.sds>0?Math.min(4,p.sds*0.8):0;
  const E=L+role+prod+team+dom+mvpOff+sds;
  let w=n>0?s.rec*n/(n+5):s.rec*0.1; if(qEst)w*=0.6; if(mvp!=null)w*=1.25;
  return Object.assign({},s,{L,lv,q,qEst,n,role,t,pct,raw,lei,prod,team,dom,mvp,mvpOff,sds,E,w,w0:w,gpg});
}

/* ---------- MScore 4 ---------- */
function sv94Score(p,r,opt){
  opt=opt||{}; const grp=typeof svmGrp==='function'?svmGrp(p):SV94_GRUPPE(p.pos);   // 0.22: Gruppe aus dem Mannschaftsteil
  const M=opt.mvp!==undefined?(opt.mvp==null?null:{v:opt.mvp}):(typeof mvpOf==='function'?mvpOf(p):null), mvp=M?M.v:null;
  const S=sv94Seasons(p,r); const mvpK=S.some(s=>s.k==='cur')?'cur':'base';
  const ev=S.map(s=>sv94Eval(p,s,grp,s.k===mvpK?mvp:null)).filter(Boolean);
  if(!ev.length)return null;
  ev.forEach(s=>{ s.alt=sv94Alterung(p.alter,p.pos,s.jahre); s.Eh=s.E+s.alt; });
  // Deckeneffekt: gute Saison in tieferer Liga als zuvor zieht kaum nach unten
  ev.forEach(s=>{ const hi=ev.filter(o=>o!==s&&SV94_NIVEAU[o.lv]>SV94_NIVEAU[s.lv]&&o.w0>0.1); if(!hi.length)return;
    const hw=hi.reduce((a,o)=>a+o.w0,0), Po=hi.reduce((a,o)=>a+o.Eh*o.w0,0)/hw; if(s.Eh>=Po)return;
    const perf=0.5*Math.min(1,s.q/0.75)+0.5*s.lei, d=sv94C((perf-0.5)/0.35,0,1)*Math.min(1,hw/0.6); if(d>0.05){ s.w=s.w0*(1-0.85*d); s.decke=d; s.Po=Po; } });
  const Wd=ev.reduce((a,s)=>a+s.w,0), P=Wd>0?ev.reduce((a,s)=>a+s.Eh*s.w,0)/Wd:null;
  const c=p.cur&&p.cur.spiele>=3?p.cur:null, lvNow=sv94Lv(c?(c.sub||c.liga):(p.sub||p.liga))||ev[0].lv;
  const prior=SV94_NIVEAU[lvNow]-6, Wp=Math.max(0,0.5-Wd);
  const eye=r&&r.eye!=null?r.eye:null, en=eye!=null&&r.eyeE?r.eyeE.n:0, We=eye==null?0:en>=3?2:en===2?1.5:1;
  const Wall=Wd+Wp+We, base=((P==null?0:P*Wd)+prior*Wp+(eye==null?0:eye*We))/Wall;
  const adj=[]; let T=base;
  // 0.22: Trainings- und Spielleistung (Eindruck Positiv, Neutral, Negativ) nur für eigene Spieler
  try{ const Q=typeof svmEindruecke==='function'?svmEindruecke(p):null; if(Q)[['trn','Trainingsleistung',Q.trn,2.5],['spl','Spielleistung',Q.spl,2]].forEach(([k,t,x,f])=>{ if(!x||x.avg==null)return; const b=sv94C((3-x.avg)*f*Math.min(1,x.n/6),-5,5); if(Math.abs(b)>=0.3){ T+=b; adj.push([k,t,b,`${x.n} Eindrücke: ${x.pos} positiv, ${x.neu} neutral, ${x.neg} negativ`]); } }); }catch(e){}
  const reg=ev.filter(s=>s.n>=12&&s.q>=0.5&&!s.qEst); let ex=0; const exT=[];
  if(reg.length>=2){ ex+=Math.min(1.6,0.8*(reg.length-1)); exT.push(`${reg.length} Saisons als Stammkraft`); }
  if(p.alter!=null&&p.alter>=26&&p.alter<=33&&reg.length){ ex+=1; exT.push('im besten Fußballeralter, Routine'); }
  if(p.alter!=null&&p.alter<=20&&!reg.length){ ex-=1.5; exT.push('jung und noch ohne Stammplatz'); }
  if(Math.abs(ex)>=0.5){ T+=ex; adj.push(['exp','Erfahrung',ex,exT.join(', ')]); }
  const APP=(ev.find(x=>x.app)||{}).app; if(APP&&APP.mit>=5&&APP.ohne>=3&&APP.ppgMit!=null&&APP.ppgOhne!=null){ const b=sv94C((APP.ppgMit-APP.ppgOhne)*1.5*Math.min(1,APP.ohne/6),-2,2); if(Math.abs(b)>=0.5){ T+=b; adj.push(['onoff','Mit ihm auf dem Platz',b,`${sv94N(APP.ppgMit,2)} Punkte je Spiel mit ihm, ${sv94N(APP.ppgOhne,2)} ohne ihn`]); } }
  if(p.pressIdx!=null){ const b=sv94C((p.pressIdx-50)/50*1.5,-1.5,1.5); if(Math.abs(b)>=0.5){ T+=b; adj.push(['presse','Presse',b,'Tenor der Nennungen']); } }
  T=sv94C(T,5,97);
  let total=Math.round(T*10)/10, man=null; if(p.adjTo!=null&&!opt.ohneManuell){ man=Math.round((p.adjTo-total)*10)/10; total=p.adjTo; }
  ev.forEach(s=>{ s.anteil=s.w/Wall; });
  const main=ev.slice().sort((a,b)=>b.w0-a.w0)[0];
  return {grp,ev,main,P,Wd,prior,Wp,priorAnteil:Wp/Wall,lvNow,eye,en,We,eyeAnteil:We/Wall,base,adj,total,man,mvp,mvpK,
    pot:sv94Pot(T,p.alter,p.pos),rate:sv94Rate(p.alter,p.pos),prog:p.alter!=null?Math.round(sv94C(T+sv94Alterung(p.alter+sv94Jahre(sv94Mitte(2),true),p.pos,sv94Jahre(sv94Mitte(2),true)),5,97)*10)/10:null};
}

/* ---------- Jugend auf derselben Skala: Liga-Gewicht der Jugendliga → Niveau wie bei den Aktiven ---------- */
const SV94_WMAP=[[0.3,22],[0.42,27],[0.6,34],[0.78,42],[1,51],[1.25,63],[1.55,72]];
function sv94JNiveau(w){ if(w==null)return 30; const M=SV94_WMAP; if(w<=M[0][0])return M[0][1]; for(let i=1;i<M.length;i++){ if(w<=M[i][0]){ const [a,x]=M[i-1],[b,y]=M[i]; return x+(y-x)*(w-a)/(b-a); } } return M[M.length-1][1]; }
function sv94Jugend(p,r){
  const jw=p.jw!=null?p.jw:p.w, L=Math.round(sv94JNiveau(jw)*10)/10, grp=SV94_GRUPPE(p.pos||'ST');
  const n=p.einsaetze||p.teamSp||0, tore=p.tore||0, gpg=tore/Math.max(1,n);
  const prod=grp==='def'?0:sv94C((gpg-0.35)*10,-4,6)*(n/(n+4));
  const dom=grp!=='def'&&gpg>1&&n>=6?Math.min(20,(gpg-1)*10):0;
  const E=L+prod+dom, w=n>0?0.9*n/(n+5):0.05;
  const ev=[{k:'jug',y:/Vorsaison/.test(p.staffel||'')?'25/26':sv4SL(sv4S()),lv:p.kurz||p.sub||'Jugend',L,role:0,prod,team:0,dom,mvp:null,sds:0,n,qEst:!p.einsaetze,tore,rank:p.rank!=null?p.rank:null,E,Eh:E,alt:0,w,w0:w,q:0.75,lei:0.5,t:0.5,pct:null,raw:gpg}];
  const prior=L-4, Wp=0.5;
  const eye=r&&r.eye!=null?r.eye:null, en=eye!=null&&r.eyeE?r.eyeE.n:0, We=eye==null?0:en>=3?2:en===2?1.5:1;
  const Wall=w+Wp+We, base=(E*w+prior*Wp+(eye==null?0:eye*We))/Wall;
  const T=sv94C(base,5,97); ev[0].anteil=w/Wall;
  let total=Math.round(T*10)/10, man=null; if(p.adjTo!=null){ man=Math.round((p.adjTo-total)*10)/10; total=p.adjTo; }
  return {grp,ev,main:ev[0],P:E,Wd:w,prior,Wp,priorAnteil:Wp/Wall,lvNow:ev[0].lv,eye,en,We,eyeAnteil:We/Wall,base,adj:[],total,man,mvp:null,mvpK:'cur',jugend:true,
    pot:sv94Pot(T,p.alter!=null?p.alter:(p.estAlter!=null?p.estAlter:18),p.pos),rate:sv94Rate(p.alter!=null?p.alter:18,p.pos),prog:null};
}
{ _sv94prev=scores; scores=function(p){
  const r=_sv94prev.apply(this,arguments);
  if(!p||!r||!r.comps)return r;
  if(p.isJugend){ const ckj=p.id+'|'+SV4.gen+'|'+(r.eye==null?'':r.eye); const hj=SV94.cache.get(ckj); if(hj)return hj;
    let J=null; try{ J=sv94Jugend(p,r); }catch(e){ console.warn('MScore 4 Jugend',p.id,e); } if(!J)return r;
    const o=Object.assign({},r); o.alt=r.total; o.total=J.total; o.m4=J;
