  B.querySelectorAll('[data-edit-s]').forEach(b=>b.onclick=()=>trSessionEditor(null,b.dataset.editS));
  trWireAlerts(B); trWireInj(B); trWireMatchday(B);
}
function trInjRow(p,i){
  const today=trToday(), days=TRC.diffDays(today,i.b), over=i.pr&&i.pr<today, left=i.pr?TRC.diffDays(i.pr,today):null;
  return `<div class="trinj${over?' over':''}">${avaHtml(p)}<div class="trinj-b"><b data-svp="${svEsc(p.id)}">${svEsc(p.name)}</b><span>${svEsc(i.dg)}${i.kt?' · '+svEsc(i.kt):''} · seit ${TRC.fmt(i.b)} (${days} T)</span>
    ${i.pr?`<div class="trprog"><i style="width:${Math.max(4,Math.min(100,days/Math.max(1,TRC.diffDays(i.pr,i.b))*100))}%"></i></div><small>${over?'Prognose '+TRC.fmt(i.pr)+' überschritten':'voraussichtlich zurück '+TRC.fmt(i.pr)+' · noch '+left+' T'}</small>`:'<small>keine Prognose</small>'}</div>
    <div class="trinj-a"><button class="btn sm" data-inj-fit="${i.id}">Wieder fit</button><button class="iconbtn" data-inj-ed="${i.id}" title="Bearbeiten">${SVI('sliders')}</button></div></div>`;
}
function trWireInj(B){
  B.querySelectorAll('[data-inj-fit]').forEach(b=>b.onclick=async()=>{ b.disabled=true; try{ await trCloseInjury(b.dataset.injFit,trToday()); kToast('✓ Wieder fit: Verletzung abgeschlossen'); }catch(e){ kToast('⚠️ '+e.message); b.disabled=false; } });
  B.querySelectorAll('[data-inj-ed]').forEach(b=>b.onclick=()=>trInjuryEditor(b.dataset.injEd));
  B.querySelectorAll('[data-svp]').forEach(x=>x.onclick=()=>openModal(x.dataset.svp));
}
/* Rückfragen vor dem Spieltag: Spieler der aktuellen Elf mit offenen Punkten */
function trMatchdayHtml(){
  let F=null; try{ F=FORMATIONS[LINEUP.formation]; }catch(e){}
  if(!F)return '';
  const today=trToday(), items=[];
  F.forEach((slot,i)=>{ const p=trP(LINEUP.slots[i]); if(!p)return; const s=TRC.playerStats(TR.st,p.id,today);
    const recent=s.rows.filter(r=>TRC.diffDays(today,r.d)<=10);
    if(s.injury)items.push({p,slot:slot[0],lvl:'hoch',t:`verletzt · ${s.injury.dg}${s.injury.pr?', Prognose '+TRC.fmt(s.injury.pr):''}`,q:'fit',inj:s.injury.id});
    else if(recent.length>=2&&recent.filter(r=>r.st==='weg').length>=2)items.push({p,slot:slot[0],lvl:'mittel',t:`fehlte ${recent.filter(r=>r.st==='weg').length}× in den letzten 10 Tagen (${[...new Set(recent.filter(r=>r.st==='weg').map(r=>TRC.REASONS[r.g]||r.g))].join(', ')})`});
    else if(s.mot[0]&&TRC.diffDays(today,s.mot[0].d)<=10&&s.mot[0].v<=2)items.push({p,slot:slot[0],lvl:'mittel',t:`zuletzt lustlos im Training (Motivation ${s.mot[0].v}/5)`});
    else if(s.fit[0]&&TRC.diffDays(today,s.fit[0].d)<=10&&s.fit[0].v<=2)items.push({p,slot:slot[0],lvl:'info',t:`wirkte zuletzt platt (Fitness ${s.fit[0].v}/5)`});
    else if(!s.mot.some(m=>TRC.diffDays(today,m.d)<=7))items.push({p,slot:slot[0],lvl:'info',t:'Wie war sein Eindruck im Training diese Woche?',q:'rate'}); });
  if(!items.length)return `<div class="card"><h3 class="trh">${SVI('pitch')} Rückfragen zur Startelf</h3><div class="note">Alle Spieler der aktuellen Elf sind fit, im Training und bewertet. 👍</div></div>`;
  const issues=items.filter(x=>x.q!=='rate'), rate=items.filter(x=>x.q==='rate');
  return `<div class="card"><h3 class="trh">${SVI('pitch')} Rückfragen zur Startelf <small>(${svEsc(LINEUP.formation)})</small></h3>
    ${issues.map(x=>`<div class="trmd l-${x.lvl}"><span class="trmd-slot">${svEsc(x.slot)}</span><div class="trmd-b"><b data-svp="${svEsc(x.p.id)}">${svEsc(x.p.name)}</b><span>${svEsc(x.t)}</span>
      ${x.q==='fit'?`<div class="tra-q"><button class="btn sm" data-q-fit="${x.inj}">Ist wieder fit</button></div>`:''}</div></div>`).join('')}
    ${rate.length?`<div class="trmd-rh">Wie war der Eindruck diese Woche? <small>Motivation 1–5 antippen</small></div><div class="trrgrid">${rate.map(x=>`<div class="trrg" data-rate="${svEsc(x.p.id)}"><span data-svp="${svEsc(x.p.id)}"><em>${svEsc(x.slot)}</em> ${svEsc(x.p.name.split(' ').pop())}</span><div>${[1,2,3,4,5].map(n=>`<button data-m="${n}">${n}</button>`).join('')}</div></div>`).join('')}</div>`:''}
    ${issues.length?'<div class="note" style="margin-top:8px">Tipp: Verletzte und Unsichere in der Aufstellung tauschen, der Positions-Check zeigt, wer passt.</div>':''}</div>`;
}
function trWireMatchday(B){
  B.querySelectorAll('[data-rate] [data-m]').forEach(b=>b.onclick=async()=>{ const pid=b.closest('[data-rate]').dataset.rate, v=+b.dataset.m;
    const s=TR.st.sessions.find(x=>x.t==='training'&&(x.a||[]).some(a=>a[0]===pid&&a[1]!=='weg'))||null;
    try{ await trSaveSession({datum:s?s.d:trToday(),typ:'training',spieler:[{player_id:pid,status:'da',motivation:v}]}); kToast('✓ Motivation '+v+'/5 für '+trShort(pid)); }catch(e){ kToast('⚠️ '+e.message); } });
  trWireAlerts(B);
}
function trViewSessions(B){
  const S=TR.st.sessions;
  B.innerHTML=`<div class="card">${S.length?`<div class="trsl">${S.slice(0,120).map(s=>{ const da=(s.a||[]).filter(a=>a[1]!=='weg').length, weg=(s.a||[]).filter(a=>a[1]==='weg');
    return `<button class="trs" data-edit-s="${s.id}"><div class="trs-d"><b>${new Date(s.d+'T12:00:00').toLocaleDateString('de-DE',{weekday:'short'})}</b><span>${TRC.fmt(s.d)}${s.d.slice(0,4)!==trToday().slice(0,4)?s.d.slice(2,4):''}</span></div>
      <div class="trs-b"><div class="trs-f">${s.t!=='training'?`<i class="typ">${svEsc(s.t)}</i>`:''}${s.t==='spiel'&&s.tw!=null?`<i class="res ${s.tw>s.tg?'w':s.tw===s.tg?'d':'l'}">${s.tw}:${s.tg}${s.g?' '+svEsc(s.g):''}</i>`:s.g?`<i>${svEsc(s.g)}</i>`:''}${(s.f||[]).map(f=>`<i>${svEsc(TRC.FOKUS[f]||f)}</i>`).join('')}${s.i?`<i class="int">Intensität ${s.i}/5</i>`:''}${s.s?`<i class="st s${s.s}">Eindruck ${s.s}/5</i>`:''}</div>
      <span>${weg.length?'Fehlend: '+svEsc(weg.slice(0,6).map(a=>trShort(a[0])+(a[2]==='ohne'?' (!)':'')).join(', '))+(weg.length>6?' …':''):'Alle da'}${s.n?' · '+svEsc(s.n.slice(0,80)):''}</span></div>
      <div class="trs-n"><b>${da}</b><span>da</span></div></button>`; }).join('')}</div>`:'<div class="empty">Noch keine Einheiten erfasst.</div>'}</div>`;
  B.querySelectorAll('[data-edit-s]').forEach(b=>b.onclick=()=>trSessionEditor(null,b.dataset.editS));
}
let trSort='rate';
function trViewPlayers(B){
  const today=trToday(), rows=trSquad().map(p=>({p,s:TRC.playerStats(TR.st,p.id,today)}));
  const key={rate:x=>x.s.rate28==null?2:x.s.rate28,season:x=>x.s.rateSeason==null?2:x.s.rateSeason,ohne:x=>-x.s.ohne28,name:x=>x.p.name,mot:x=>x.s.mot[0]?x.s.mot[0].v:9};
  rows.sort((a,b)=>{ const ka=key[trSort](a), kb=key[trSort](b); return ka<kb?-1:ka>kb?1:0; });
  const th=(k,t)=>`<th><button data-sort="${k}" class="${trSort===k?'on':''}">${t}</button></th>`;
  B.innerHTML=`<div class="card"><div class="trtw"><table class="trtab"><thead><tr>${th('name','Spieler')}<th>Pos</th>${th('rate','4 Wochen')}${th('season','12 Monate')}<th>Trend</th>${th('ohne','Ohne Grund')}${th('mot','Motivation')}<th>Fitness</th><th>Status</th></tr></thead><tbody>
    ${rows.map(({p,s})=>{ const tr=s.rate28!=null&&s.ratePrev!=null?s.rate28-s.ratePrev:null;
      return `<tr data-svp="${svEsc(p.id)}"><td><b>${svEsc(p.name)}</b>${p.kader===2?' <small>II</small>':''}</td><td>${svEsc(p.pos||'–')}</td>
      <td><span class="trpill ${trRateCls(s.rate28)}">${trPct(s.rate28)}</span> <small>${s.n28}×</small></td><td>${trPct(s.rateSeason)}</td>
      <td>${tr==null?'–':`<b class="${tr>=0?'ok':'bad'}">${tr>=0.05?'▲':tr<=-0.05?'▼':'▶'}</b>`}</td><td>${s.ohne28?`<b class="bad">${s.ohne28}</b>`:'0'}</td>
      <td>${s.mot.length?trDots(s.mot.map(m=>m.v)):'–'}</td><td>${s.fit.length?trDots(s.fit.map(m=>m.v)):'–'}</td>
      <td>${s.injury?`<span class="trpill bad">🩹 ${svEsc(s.injury.dg)}</span>`:s.lastSeen?`<small>zuletzt ${TRC.fmt(s.lastSeen)}</small>`:'–'}</td></tr>`; }).join('')}</tbody></table></div>
    <div class="note">Beteiligung = anwesend ÷ Einheiten, bei denen der Spieler erfasst ist (verletzt/krank/„in der Zweiten“ zählen nicht dagegen).</div></div>`;
  B.querySelectorAll('[data-sort]').forEach(b=>b.onclick=e=>{ e.stopPropagation(); trSort=b.dataset.sort; trViewPlayers(B); });
  B.querySelectorAll('tr[data-svp]').forEach(r=>r.onclick=()=>openModal(r.dataset.svp));
}
function trViewInjuries(B){
  const today=trToday(), act=TR.st.injuries.filter(i=>!i.z), hist=TR.st.injuries.filter(i=>i.z);
  const byArt={}; TR.st.injuries.filter(i=>TRC.diffDays(today,i.b)<=365).forEach(i=>byArt[i.art||'sonstiges']=(byArt[i.art||'sonstiges']||0)+1);
  const daysOut=hist.filter(i=>TRC.diffDays(today,i.b)<=365).reduce((a,i)=>a+TRC.diffDays(i.z,i.b),0);
  B.innerHTML=`<div class="card"><h3 class="trh">${SVI('shield')} Aktuell verletzt (${act.length})</h3>${act.length?`<div class="trinjl">${act.map(i=>trInjRow(trP(i.p)||{id:i.p,name:i.p},i)).join('')}</div>`:'<div class="note">Niemand verletzt.</div>'}</div>
    <div class="card"><h3 class="trh">${SVI('chart')} Letzte 12 Monate</h3><div class="trart">${Object.entries(byArt).map(([k,n])=>`<span><b>${n}</b> ${svEsc(TRC.ART[k]||k)}</span>`).join('')||'<span class="note">keine</span>'}<span><b>${daysOut}</b> Ausfalltage (abgeschlossen)</span></div></div>
    <div class="card"><h3 class="trh">Verlauf</h3>${hist.length?`<div class="trhist">${hist.slice(0,80).map(i=>`<div class="trh-r" data-inj-ed="${i.id}"><b>${svEsc(trName(i.p))}</b><span>${svEsc(i.dg)}${i.kt?' · '+svEsc(i.kt):''}</span><em>${TRC.fmt(i.b)}${i.b.slice(2,4)} · ${TRC.fmt(i.z)}${i.z.slice(2,4)} · ${TRC.diffDays(i.z,i.b)} T</em></div>`).join('')}</div>`:'<div class="note">Noch keine abgeschlossenen Verletzungen.</div>'}</div>`;
  trWireInj(B);
  B.querySelectorAll('.trh-r[data-inj-ed]').forEach(r=>r.onclick=()=>trInjuryEditor(r.dataset.injEd));
}

/* ---------- Einheit bearbeiten ---------- */
function trSessionEditor(datum,sid,typ0){
  const s0=sid?TR.st.sessions.find(s=>s.id===sid):trSessionOn(datum||trToday(),typ0||'training');
  const st={id:s0&&s0.id,datum:s0?s0.d:(datum||trToday()),typ:s0?s0.t:(typ0||'training'),fokus:new Set(s0?s0.f||[]:[]),i:s0?s0.i:null,s:s0?s0.s:null,n:s0?s0.n||'':'',
    g:s0?s0.g||'':'',h:s0?s0.h:null,tw:s0&&s0.tw!=null?s0.tw:'',tg:s0&&s0.tg!=null?s0.tg:'',
    rows:{}, orig:new Set(), open:null, extra:[]};
  (s0&&s0.a||[]).forEach(a=>{ st.rows[a[0]]={status:a[1],grund:a[2],motivation:a[3],fitness:a[4],notiz:a[5]||'',tore:a[6]||0,vorlagen:a[7]||0}; st.orig.add(a[0]); if(!trSquad().some(p=>p.id===a[0]))st.extra.push(a[0]); });
  if(TR.prefill&&TR.prefill.datum===st.datum){ Object.entries(TR.prefill.rows||{}).forEach(([id,r])=>{ if(!trP(id))return; const cur=st.rows[id]; if(cur&&cur.status)return; st.rows[id]=Object.assign({},cur||{},r); if(!trSquad().some(p=>p.id===id)&&!st.extra.includes(id))st.extra.push(id); }); TR.prefill=null; }
  const M=svModal(`<div class="mhead"><div class="rm-ic" style="width:46px;height:46px">${SVI('activity')}</div><div><h2 style="margin:0">${s0?(s0.t==='spiel'?'Spiel bearbeiten':'Einheit bearbeiten'):(typ0==='spiel'?'Spiel erfassen':'Training erfassen')}</h2><div class="msub">${typ0==='spiel'||(s0&&s0.t==='spiel')?'Ergebnis, Aufstellung, Tore & Vorlagen. Zählt für Allzeit-Statistik und Moneyball-Auswertung':'Anwesenheit, Gründe, Eindruck: für alle gespeichert'}</div></div></div><div id="trEd"></div>`);
  const draw=()=>{
    const E=document.getElementById('trEd'); if(!E)return;
    const list=[...trSquad(),...st.extra.map(trP).filter(Boolean).filter(p=>!trSquad().includes(p))];
    const cnt={da:0,spaet:0,weg:0,bank:0,zuschauer:0,offen:0}; list.forEach(p=>{ const r=st.rows[p.id]; if(r&&r.status)cnt[r.status]++; else cnt.offen++; });
    const G=st.typ==='spiel', OPTS=G?[['da','Startelf'],['spaet','Eingewechselt'],['bank','Kader'],['zuschauer','Zugeschaut'],['weg','Nicht da']]:[['da','Da'],['weg','Fehlt']], spielt=r=>r&&(r.status==='da'||r.status==='spaet');
    const step=(id,k,v)=>`<span class="trstep"><em>${k==='tore'?'⚽ Tore':'🅰️ Vorl.'}</em><button type="button" data-step="${svEsc(id)}:${k}:-1">−</button><b>${v||0}</b><button type="button" data-step="${svEsc(id)}:${k}:1">+</button></span>`;
    const sumT=Object.values(st.rows).reduce((a,r)=>a+(spielt(r)?(r.tore||0):0),0);
    E.innerHTML=`<div class="tred-top">
        <div class="field"><label>Datum</label><input type="date" id="trD" value="${svEsc(st.datum)}" max="${TRC.addDays(trToday(),14)}"></div>
        <div class="field"><label>Art</label><select id="trT">${[['training','Training'],['spiel','Spiel'],['test','Testspiel'],['sonstiges','Sonstiges']].map(([k,t])=>`<option value="${k}"${st.typ===k?' selected':''}>${t}</option>`).join('')}</select></div></div>
      ${G?`<div class="sbsec trmatch"><h4>Spiel</h4><div class="trm-row"><div class="field"><label>Gegner</label><input id="trG" maxlength="80" value="${svEsc(st.g)}" placeholder="z.B. VfR Fehlheim II"></div>
          <div class="trseg trha"><button type="button" data-ha="1" class="${st.h===true?'on':''}">Heim</button><button type="button" data-ha="0" class="${st.h===false?'on':''}">Auswärts</button></div></div>
        <div class="trres"><input id="trTW" type="number" min="0" max="40" inputmode="numeric" value="${svEsc(String(st.tw))}" aria-label="Tore wir"><span>:</span><input id="trTG" type="number" min="0" max="40" inputmode="numeric" value="${svEsc(String(st.tg))}" aria-label="Tore Gegner"><small>${st.tw!==''&&st.tg!==''?(+st.tw>+st.tg?'Sieg':+st.tw===+st.tg?'Unentschieden':'Niederlage'):'Ergebnis (wir : Gegner)'}${sumT&&st.tw!==''&&sumT>+st.tw?` · <b class="bad">${sumT} Torschützen > ${st.tw} Tore</b>`:''}</small></div></div>`:''}
      <div class="sbsec"${G?' style="display:none"':''}><h4>Inhalt</h4><div class="chips">${Object.entries(TRC.FOKUS).map(([k,t])=>`<button type="button" class="pchip${st.fokus.has(k)?' on':''}" data-fk="${k}">${t}</button>`).join('')}</div>
        <div class="trscale"><span>Intensität</span>${[1,2,3,4,5].map(n=>`<button type="button" data-int="${n}" class="${st.i===n?'on':''}">${n}</button>`).join('')}<small>${['','sehr locker','locker','mittel','intensiv','sehr intensiv'][st.i||0]||''}</small></div>
        <div class="trscale"><span>Eindruck</span>${[1,2,3,4,5].map(n=>`<button type="button" data-st="${n}" class="${st.s===n?'on s'+n:''}">${n}</button>`).join('')}<small>${['','schwach','zäh','ok','gut','top'][st.s||0]||''}</small></div>
        <div class="field" style="margin-top:8px"><label>Notiz zur Einheit</label><input id="trN" maxlength="2000" value="${svEsc(st.n)}" placeholder="z.B. sehr laufintensiv, gute Stimmung, Standards geübt"></div></div>
      <div class="sbsec"><h4>${G?'Kader':'Anwesenheit'} <small>${G?`${cnt.da} Startelf · ${cnt.spaet} eingewechselt · ${cnt.bank} Kader · ${cnt.zuschauer} zugeschaut · ${cnt.weg} nicht da`:`${cnt.da} da · ${cnt.weg} fehlen`}${cnt.offen?' · '+cnt.offen+' offen':''}</small></h4>
        <div class="btnrow" style="margin-bottom:8px">${G?((typeof fbSpielAm==='function'&&fbSpielAm(st.datum)?'<button type="button" class="btn sm" id="trFB">Aus Spielbericht übernehmen</button>':'')+(typeof LINEUP!=='undefined'&&LINEUP.slots&&Object.values(LINEUP.slots).some(Boolean)?'<button type="button" class="btn ghost sm" id="trXI">Aktuelle Aufstellung übernehmen</button>':'')):'<button type="button" class="btn ghost sm" id="trAll">Alle offenen = da</button>'}<button type="button" class="btn ghost sm" id="trAdd">${SVI('plus')} Spieler aus der Zweiten</button></div>
        <div class="tratt">${list.map(p=>{ const r=st.rows[p.id]||{}, o=st.open===p.id;
          return `<div class="trr${r.status?' s-'+r.status:''}"><div class="trr-h"><span class="trr-n" data-open-r="${svEsc(p.id)}"><b>${svEsc(p.name)}</b><em>${svEsc(p.pos||'')}${p.kader===2?' · II':''}${trInjury(p.id)?' · 🩹':''}${r.motivation?' · M'+r.motivation:''}${r.fitness?' · F'+r.fitness:''}</em></span>
            <div class="trseg${G?' trseg5':''}">${OPTS.map(([k,t])=>`<button type="button" data-set="${svEsc(p.id)}:${k}" class="${r.status===k?'on':''}">${t}</button>`).join('')}</div></div>
            ${G&&spielt(r)?`<div class="trsteps">${step(p.id,'tore',r.tore)}${step(p.id,'vorlagen',r.vorlagen)}</div>`:''}
            ${r.status==='weg'?`<div class="trg">${Object.entries(TRC.REASONS).map(([k,t])=>`<button type="button" data-gr="${svEsc(p.id)}:${k}" class="${r.grund===k?'on'+(k==='ohne'?' warn':''):''}">${t}</button>`).join('')}</div>`:''}
            ${o?`<div class="trx"><div class="trscale"><span>Motivation</span>${[1,2,3,4,5].map(n=>`<button type="button" data-mo="${svEsc(p.id)}:${n}" class="${r.motivation===n?'on s'+n:''}">${n}</button>`).join('')}</div>
              <div class="trscale"><span>Fitness/Frische</span>${[1,2,3,4,5].map(n=>`<button type="button" data-fi="${svEsc(p.id)}:${n}" class="${r.fitness===n?'on s'+n:''}">${n}</button>`).join('')}</div>
              <input data-no="${svEsc(p.id)}" maxlength="500" value="${svEsc(r.notiz||'')}" placeholder="Notiz, z.B. „sehr lustlos“, „stark im Abschlussspiel“"></div>`:`<button type="button" class="trr-more" data-open-r="${svEsc(p.id)}">+ Motivation, Fitness, Notiz</button>`}</div>`; }).join('')}</div></div>
      <div class="btnrow sbact"><button class="btn" type="button" id="trSave">Für alle speichern</button><button class="btn ghost" type="button" id="trCancel">Abbrechen</button>${st.id?`<button class="btn ghost" type="button" id="trDel" style="margin-left:auto;color:#fca5a5">Einheit löschen</button>`:''}</div>`;
    const keep=()=>{ const d=document.getElementById('trD'), t=document.getElementById('trT'), n=document.getElementById('trN'); if(d)st.datum=d.value||st.datum; if(t)st.typ=t.value; if(n)st.n=n.value;
      const g=document.getElementById('trG'), tw=document.getElementById('trTW'), tg=document.getElementById('trTG'); if(g)st.g=g.value; if(tw)st.tw=tw.value; if(tg)st.tg=tg.value;
      E.querySelectorAll('[data-no]').forEach(i=>{ const r=st.rows[i.dataset.no]=st.rows[i.dataset.no]||{}; r.notiz=i.value; }); };
    document.getElementById('trT').onchange=()=>{ keep(); draw(); };
    ['trTW','trTG'].forEach(i=>{ const x=document.getElementById(i); if(x)x.oninput=()=>{ keep(); const sm=E.querySelector('.trres small'); if(sm)sm.textContent=st.tw!==''&&st.tg!==''?(+st.tw>+st.tg?'Sieg':+st.tw===+st.tg?'Unentschieden':'Niederlage'):'Ergebnis (wir : Gegner)'; }; });
    E.querySelectorAll('[data-ha]').forEach(b=>b.onclick=()=>{ keep(); const v=b.dataset.ha==='1'; st.h=st.h===v?null:v; draw(); });
    E.querySelectorAll('[data-step]').forEach(b=>b.onclick=()=>{ keep(); const [id,k,dv]=b.dataset.step.split(':'); const r=st.rows[id]=st.rows[id]||{}; r[k]=Math.max(0,Math.min(20,(r[k]||0)+(+dv))); draw(); });
    if(document.getElementById('trFB'))document.getElementById('trFB').onclick=()=>{ keep(); const R=fbSpielAm(st.datum); let n=0; Object.entries(R.rows).forEach(([id,x])=>{ const r=st.rows[id]=st.rows[id]||{}; if(r.status==='weg'||r.status==='zuschauer')return; r.status=x.status; r.grund=null; if(x.tore)r.tore=x.tore; if(!list.some(p=>p.id===id)&&!st.extra.includes(id))st.extra.push(id); n++; });
      if(!st.g&&R.gegner)st.g=R.gegner; if(st.h==null&&R.heim!=null)st.h=R.heim; draw(); kToast(`✓ ${n} Spieler aus dem Spielbericht übernommen${R.fehlt?` · ${R.fehlt} nicht zugeordnet`:''}`); };
    if(document.getElementById('trXI'))document.getElementById('trXI').onclick=()=>{ keep(); const xi=new Set(Object.values(LINEUP.slots||{}).filter(Boolean)); list.forEach(p=>{ if(xi.has(p.id)){ const r=st.rows[p.id]=st.rows[p.id]||{}; r.status='da'; r.grund=null; } }); draw(); };
    E.querySelectorAll('[data-fk]').forEach(b=>b.onclick=()=>{ keep(); const k=b.dataset.fk; if(st.fokus.has(k))st.fokus.delete(k); else st.fokus.add(k); draw(); });
    E.querySelectorAll('[data-int]').forEach(b=>b.onclick=()=>{ keep(); const n=+b.dataset.int; st.i=st.i===n?null:n; draw(); });
    E.querySelectorAll('[data-st]').forEach(b=>b.onclick=()=>{ keep(); const n=+b.dataset.st; st.s=st.s===n?null:n; draw(); });
    E.querySelectorAll('[data-set]').forEach(b=>b.onclick=()=>{ keep(); const [id,v]=b.dataset.set.split(':'); const r=st.rows[id]=st.rows[id]||{}; r.status=r.status===v?null:v; if(v==='weg'&&r.status&&!r.grund)r.grund=trInjury(id)?'verletzt':null; if(r.status!=='weg')r.grund=null; draw(); });
    E.querySelectorAll('[data-gr]').forEach(b=>b.onclick=()=>{ keep(); const [id,g]=b.dataset.gr.split(':'); st.rows[id].grund=g; draw(); });
    E.querySelectorAll('[data-mo]').forEach(b=>b.onclick=()=>{ keep(); const [id,n]=b.dataset.mo.split(':'); const r=st.rows[id]=st.rows[id]||{}; r.motivation=r.motivation===+n?null:+n; if(!r.status)r.status='da'; draw(); });
    E.querySelectorAll('[data-fi]').forEach(b=>b.onclick=()=>{ keep(); const [id,n]=b.dataset.fi.split(':'); const r=st.rows[id]=st.rows[id]||{}; r.fitness=r.fitness===+n?null:+n; if(!r.status)r.status='da'; draw(); });
    E.querySelectorAll('[data-open-r]').forEach(b=>b.onclick=()=>{ keep(); st.open=st.open===b.dataset.openR?null:b.dataset.openR; draw(); });
    if(document.getElementById('trAll'))document.getElementById('trAll').onclick=()=>{ keep(); list.forEach(p=>{ const r=st.rows[p.id]=st.rows[p.id]||{}; if(!r.status)r.status=trInjury(p.id)?'weg':'da'; if(r.status==='weg'&&!r.grund)r.grund='verletzt'; }); draw(); };
    document.getElementById('trAdd').onclick=()=>{ keep(); const cand=players.filter(p=>p.own&&!p.isJugend&&p.kader===2&&!list.includes(p)).sort((a,b)=>a.name.localeCompare(b.name,'de'));
      const nm=prompt('Name des Spielers (2. Mannschaft/Gast):\n'+cand.slice(0,30).map(p=>p.name).join(', ')); if(!nm)return;
      const k=TRC.N(nm), hit=cand.find(p=>TRC.N(p.name)===k)||cand.find(p=>TRC.N(p.name).includes(k)); if(!hit)return kToast('Kein Spieler der Zweiten mit diesem Namen'); st.extra.push(hit.id); st.rows[hit.id]={status:'da'}; draw(); };
    document.getElementById('trCancel').onclick=()=>closeOverlay();
    if(document.getElementById('trDel'))document.getElementById('trDel').onclick=async()=>{ if(!confirm('Diese Einheit samt Anwesenheit löschen?'))return; try{ await trDeleteSession(st.id); closeOverlay(); kToast('Einheit gelöscht'); }catch(e){ kToast('⚠️ '+e.message); } };
    document.getElementById('trSave').onclick=async()=>{ keep();
      const miss=Object.entries(st.rows).filter(([,r])=>r.status==='weg'&&!r.grund); if(miss.length){ kToast('Bitte Grund angeben: '+miss.map(([id])=>trShort(id)).join(', ')); return; }
      const sp=[]; Object.entries(st.rows).forEach(([id,r])=>{ if(r.status)sp.push(Object.assign({player_id:id,status:r.status,grund:r.status==='weg'?r.grund:null,motivation:r.motivation||null,fitness:r.fitness||null,notiz:(r.notiz||'').trim()||null},st.typ==='spiel'?{tore:(r.status==='da'||r.status==='spaet')&&r.tore||null,vorlagen:(r.status==='da'||r.status==='spaet')&&r.vorlagen||null}:{})); else if(st.orig.has(id))sp.push({player_id:id,status:''}); });
      if(st.typ==='spiel'&&((st.tw==='')!==(st.tg===''))){ kToast('Bitte beide Ergebnis-Felder ausfüllen (oder beide leer lassen)'); return; }
      if(s0&&(s0.d!==st.datum||s0.t!==st.typ)){ try{ await trDeleteSession(s0.id); }catch(e){} }
      const b=document.getElementById('trSave'); b.disabled=true; b.textContent='Speichert …';
      try{ await trSaveSession(Object.assign({datum:st.datum,typ:st.typ,fokus:[...st.fokus],intensitaet:st.i,stimmung:st.s,notiz:st.n.trim()||null,spieler:sp},
          st.typ==='spiel'?{gegner:st.g.trim()||null,heim:st.h,tore_wir:st.tw===''?null:+st.tw,tore_gegner:st.tg===''?null:+st.tg}:{}));
        closeOverlay(); kToast(st.typ==='spiel'?'✓ Spiel vom '+TRC.fmt(st.datum)+' gespeichert':'✓ Einheit vom '+TRC.fmt(st.datum)+' gespeichert · '+sp.filter(x=>x.status==='weg').length+' fehlten'); }
      catch(e){ b.disabled=false; b.textContent='Für alle speichern'; kToast('⚠️ '+e.message); } };
  };
  draw();
}

/* ---------- Verletzung bearbeiten ---------- */
function trInjuryEditor(id,pid){
  const i0=id?TR.st.injuries.find(x=>x.id===id):null;
  const st=i0?{id:i0.id,player_id:i0.p,diagnose:i0.dg,art:i0.art||'',koerperteil:i0.kt||'',beginn:i0.b,prognose:i0.pr||'',zurueck:i0.z||'',notiz:i0.n||''}
    :{player_id:pid||'',diagnose:'',art:'',koerperteil:'',beginn:trToday(),prognose:'',zurueck:'',notiz:''};
  const sq=trSquad();
  svModal(`<div class="mhead"><div class="rm-ic" style="width:46px;height:46px">${SVI('shield')}</div><div><h2 style="margin:0">${i0?'Verletzung bearbeiten':'Verletzung eintragen'}</h2><div class="msub">Gesundheitsdaten: sichtbar nur fürs Trainerteam und den Vorstand</div></div></div>
    <div class="editgrid" style="margin-top:14px">
      <div class="field" style="grid-column:1/-1"><label>Spieler</label><select id="ijP"><option value="">– wählen –</option>${sq.map(p=>`<option value="${svEsc(p.id)}"${st.player_id===p.id?' selected':''}>${svEsc(p.name)}</option>`).join('')}</select></div>
      <div class="field" style="grid-column:1/-1"><label>Diagnose / Beschwerden</label><input id="ijD" maxlength="200" value="${svEsc(st.diagnose)}" placeholder="z.B. Zerrung hinterer Oberschenkel links"></div>
      <div class="field"><label>Art</label><select id="ijA"><option value="">–</option>${Object.entries(TRC.ART).map(([k,t])=>`<option value="${k}"${st.art===k?' selected':''}>${t}</option>`).join('')}</select></div>
      <div class="field"><label>Körperteil</label><input id="ijK" maxlength="60" value="${svEsc(st.koerperteil)}" placeholder="z.B. Knie rechts"></div>
      <div class="field"><label>Seit</label><input type="date" id="ijB" value="${svEsc(st.beginn)}"></div>
      <div class="field"><label>Voraussichtlich zurück</label><input type="date" id="ijPr" value="${svEsc(st.prognose)}"><div class="trquick">${[1,2,3,4,6,8].map(w=>`<button type="button" data-w="${w}">+${w} W</button>`).join('')}</div></div>
      <div class="field"><label>Wieder im Training am</label><input type="date" id="ijZ" value="${svEsc(st.zurueck)}"></div>
      <div class="field" style="grid-column:1/-1"><label>Notiz</label><input id="ijN" maxlength="1000" value="${svEsc(st.notiz)}" placeholder="z.B. Arzttermin Do, Physio 2× pro Woche"></div>
    </div>
    <div class="note" style="margin-top:8px">Der Co-Trainer gibt auf Wunsch eine grobe Einschätzung zu typischen Ausfallzeiten, ersetzt aber nie Arzt oder Physio.</div>
    <div class="btnrow sbact"><button class="btn" id="ijSave">Speichern</button><button class="btn ghost" id="ijCancel">Abbrechen</button>${i0?'<button class="btn ghost" id="ijDel" style="margin-left:auto;color:#fca5a5">Löschen</button>':''}</div>`);
  const $i=x=>document.getElementById(x);
  document.querySelectorAll('.trquick [data-w]').forEach(b=>b.onclick=()=>{ $i('ijPr').value=TRC.addDays($i('ijB').value||trToday(),+b.dataset.w*7); });
  $i('ijCancel').onclick=()=>closeOverlay();
  if($i('ijDel'))$i('ijDel').onclick=async()=>{ if(!confirm('Eintrag löschen?'))return; try{ await trDeleteInjury(i0.id); closeOverlay(); kToast('Gelöscht'); }catch(e){ kToast('⚠️ '+e.message); } };
  $i('ijSave').onclick=async()=>{
    const v={id:st.id,player_id:$i('ijP').value,diagnose:$i('ijD').value.trim(),art:$i('ijA').value||null,koerperteil:$i('ijK').value.trim()||null,beginn:$i('ijB').value,prognose:$i('ijPr').value||null,zurueck:$i('ijZ').value||null,notiz:$i('ijN').value.trim()||null};
    if(!v.player_id||!v.diagnose||!v.beginn)return kToast('Bitte Spieler, Diagnose und Beginn angeben');
    try{ await trSaveInjury(v); closeOverlay(); kToast('✓ Verletzung von '+trShort(v.player_id)+' gespeichert'); }catch(e){ kToast('⚠️ '+e.message); } };
}

/* ---------- Spielerprofil: Training & Fitness ---------- */
function trProfile(pid){
  if(!canTraining()||!TR.loaded)return;
  const M=document.getElementById('modal'), p=trP(pid); if(!M||!p||M.querySelector('.trprof'))return;
  const s=TRC.playerStats(TR.st,pid,trToday()); if(!p.own&&!s.rows.length&&!s.injuries.length)return;
  const anchor=M.querySelector('.sbwrap')||M.querySelector('.svpos-box')||M.querySelector('.mhead'); if(!anchor)return;
  const abs=s.rows.filter(r=>r.st==='weg').slice(0,6);
  const el=document.createElement('div'); el.className='card trprof';
  el.innerHTML=`<div class="trprof-h"><h3 class="trh">${SVI('activity')} Training &amp; Fitness</h3><div class="btnrow"><button class="btn ghost sm" data-pr-rate>Bewerten</button><button class="btn ghost sm" data-pr-inj>${SVI('plus')} Verletzung</button></div></div>
    ${s.injury?`<div class="trinj over" style="margin-bottom:10px"><div class="trinj-b"><b>🩹 ${svEsc(s.injury.dg)}</b><span>seit ${TRC.fmt(s.injury.b)}${s.injury.pr?' · Prognose '+TRC.fmt(s.injury.pr):''}</span></div><div class="trinj-a"><button class="btn sm" data-inj-fit="${s.injury.id}">Wieder fit</button></div></div>`:''}
    <div class="trkpi"><div><b class="${trRateCls(s.rate28)}">${trPct(s.rate28)}</b><span>Beteiligung 4 W. (${s.n28})</span></div><div><b>${trPct(s.rateSeason)}</b><span>12 Monate</span></div>
      <div><b class="${s.ohne28?'bad':''}">${s.ohne28}</b><span>ohne Grund (4 W.)</span></div><div><b>${s.lastSeen?TRC.fmt(s.lastSeen):'–'}</b><span>zuletzt da</span></div></div>
    ${s.mot.length||s.fit.length?`<div class="trmf">${s.mot.length?`<div><span>Motivation</span>${trDots(s.mot.map(m=>m.v))}</div>`:''}${s.fit.length?`<div><span>Fitness</span>${trDots(s.fit.map(m=>m.v))}</div>`:''}</div>`:''}
    ${abs.length?`<div class="trabs"><span>Zuletzt gefehlt:</span> ${abs.map(r=>`<i class="${r.g==='ohne'?'bad':''}">${TRC.fmt(r.d)} ${svEsc(TRC.REASONS[r.g]||r.g)}</i>`).join('')}</div>`:''}
    ${s.rows.filter(r=>r.n).slice(0,3).map(r=>`<div class="trnote">„${svEsc(r.n)}“ <small>${TRC.fmt(r.d)}</small></div>`).join('')}
    ${s.injuries.filter(i=>i.z).length?`<div class="trabs"><span>Verletzungshistorie:</span> ${s.injuries.filter(i=>i.z).slice(0,6).map(i=>`<i>${svEsc(i.dg)} (${TRC.fmt(i.b)}${i.b.slice(2,4)}, ${TRC.diffDays(i.z,i.b)} T)</i>`).join('')}</div>`:''}
    ${!s.rows.length&&!s.injuries.length?'<div class="note">Noch keine Trainingsdaten für diesen Spieler.</div>':''}`;
  anchor.after(el);
  el.querySelector('[data-pr-inj]').onclick=()=>trInjuryEditor(null,pid);
  el.querySelector('[data-pr-rate]').onclick=()=>trQuickRate(pid);
  el.querySelectorAll('[data-inj-fit]').forEach(b=>b.onclick=async()=>{ try{ await trCloseInjury(b.dataset.injFit,trToday()); openModal(pid); kToast('✓ Wieder fit'); }catch(e){ kToast('⚠️ '+e.message); } });
}
function trQuickRate(pid){
  const p=trP(pid); let mo=null, fi=null;
  svModal(`<div class="mhead">${avaHtml(p)}<div><h2 style="margin:0">${svEsc(p.name)}</h2><div class="msub">Eindruck aus dem Training</div></div></div>
    <div class="field" style="margin-top:12px"><label>Datum</label><input type="date" id="qrD" value="${trToday()}"></div>
    <div class="trscale" id="qrM"><span>Motivation</span>${[1,2,3,4,5].map(n=>`<button type="button" data-v="${n}">${n}</button>`).join('')}</div>
    <div class="trscale" id="qrF"><span>Fitness/Frische</span>${[1,2,3,4,5].map(n=>`<button type="button" data-v="${n}">${n}</button>`).join('')}</div>
    <div class="field"><label>Notiz</label><input id="qrN" maxlength="500" placeholder="z.B. sehr lustlos, stark im Abschlussspiel"></div>
    <div class="btnrow sbact"><button class="btn" id="qrS">Speichern</button><button class="btn ghost" id="qrC">Zurück</button></div>`);
  const sel=(box,cb)=>document.querySelectorAll('#'+box+' [data-v]').forEach(b=>b.onclick=()=>{ document.querySelectorAll('#'+box+' [data-v]').forEach(x=>x.className=''); b.className='on s'+b.dataset.v; cb(+b.dataset.v); });
  sel('qrM',v=>mo=v); sel('qrF',v=>fi=v);
  document.getElementById('qrC').onclick=()=>openModal(pid);
  document.getElementById('qrS').onclick=async()=>{ const d=document.getElementById('qrD').value||trToday(), n=document.getElementById('qrN').value.trim();
    if(!mo&&!fi&&!n)return kToast('Bitte etwas bewerten');
    try{ await trSaveSession({datum:d,typ:'training',spieler:[Object.assign({player_id:pid,status:'da'},mo?{motivation:mo}:{},fi?{fitness:fi}:{},n?{notiz:n}:{})]}); openModal(pid); kToast('✓ Bewertung gespeichert'); }catch(e){ kToast('⚠️ '+e.message); } };
}
{ const _om4=openModal; openModal=function(){ const r=_om4.apply(this,arguments); try{ trProfile(arguments[0]); }catch(e){ console.warn('Training-Profil',e); } return r; }; }

/* ---------- Aufstellung: Verletzte markieren ---------- */
{ const _lc2=lineupCardHtml; lineupCardHtml=function(p){ let h=_lc2.apply(this,arguments); try{ const i=trInjury(p.id); if(i)h=h.replace('<div class="fcardm"','<div class="fcardm trhurt" title="Verletzt: '+svEsc(i.dg)+'"').replace(/<\/div>$/,'<span class="trhurt-b">🩹</span></div>'); }catch(e){} return h; }; }
{ const _fr=sbFitRow; sbFitRow=function(){ const r=_fr.apply(this,arguments); try{
    const el=document.getElementById('sbFitRow'); if(!el||!TR.loaded)return r; const F=FORMATIONS[LINEUP.formation];
    const hurt=F.map((s,i)=>trP(LINEUP.slots[i])).filter(p=>p&&trInjury(p.id));
    if(hurt.length){ const box=el.querySelector('.sbfitbox'); if(box){ box.classList.remove('good'); box.classList.add('warn');
      box.querySelector('.sbfit-t').insertAdjacentHTML('beforeend',`<span>🩹 Verletzt: ${hurt.map(p=>`<b>${svEsc(p.name.split(' ').pop())}</b> (${svEsc(trInjury(p.id).dg)})`).join(' · ')}</span>`); } }
  }catch(e){} return r; }; }

/* ---------- Übersicht: Co-Trainer-Karte ---------- */
function trHomeCard(){
  const host=document.getElementById('svRemind')||document.getElementById('svHello'); if(!host||!canTraining())return;
  let el=document.getElementById('trHome'); if(!el){ el=document.createElement('div'); el.id='trHome'; host.after(el); }
  if(!TR.loaded){ el.innerHTML=''; return; }
  const al=trAlerts().filter(a=>a.lvl!=='info').slice(0,3), T=TRC.teamStats(TR.st,trToday(),trSquad().map(p=>p.id));
  el.innerHTML=`<div class="card trhome"><div class="rm-h"><div class="rm-ic co">${SVI('chat')}</div><div class="rm-t"><h3>Co-Trainer</h3><p>${TR.st.sessions.length?`Trainingsbeteiligung 3 Wochen: <b>${trPct(T.r21.rate)}</b>`+(al.length?` · ${al.length} Hinweis${al.length>1?'e':''}`:' · alles im grünen Bereich'):'Noch keine Einheiten: einfach nach dem Training reinsprechen.'}</p></div>
    <button class="btn sm" data-home-chat>${SVI('chat')} Fragen / eintragen</button></div>${al.map(a=>trAlertHtml(a,true)).join('')}
    <div class="rm-f"><button class="btn ghost" data-home-tr>Training öffnen →</button></div></div>`;
  el.querySelector('[data-home-chat]').onclick=()=>trChatOpen();
  el.querySelector('[data-home-tr]').onclick=()=>goTab('training');
  el.querySelectorAll('[data-svp]').forEach(x=>x.onclick=()=>openModal(x.dataset.svp));
}

/* ---------- Co-Trainer-Chat ---------- */
function trSquadLite(){ return trSquad().map(p=>({id:p.id,name:p.name})); }
function trGreeting(){
  const al=trAlerts(), fn=svFirst(SVU.name)||'Coach', h=new Date().getHours(), g=h<11?'Guten Morgen':h<17?'Hi':'Guten Abend';
  const todayS=trSessionOn(trToday());
  let t=`${g} ${fn}! `;
  if(al.length)t+=`Mir fällt gerade auf:\n${al.slice(0,3).map(a=>'• '+a.t+' · '+a.d).join('\n')}\n\n`;
  else t+='Aktuell keine Auffälligkeiten im Training. ';
  t+=todayS?'Das heutige Training ist schon eingetragen. Willst du noch Eindrücke zu einzelnen Spielern ergänzen?':'Wie war das Training? Sag mir einfach, wer gefehlt hat und warum, oder wer besonders auffiel.';
  return t;
}
function trChatOpen(){
  if(!canTraining())return;
  if(!TR.chat.length)TR.chat.push({role:'assistant',content:TR.loaded?trGreeting():'Hallo! Einen Moment, ich lade die Trainingsdaten …',local:true});
  const M=svModal(`<div class="trchat"><div class="trc-h"><div class="rm-ic co">${SVI('chat')}</div><div><h2 style="margin:0">Co-Trainer</h2><div class="msub" id="trcMode"></div></div></div>
    <div class="trc-log" id="trcLog"></div>
    <div class="trc-sug" id="trcSug"></div>
    <div class="trc-att" id="trcAtt"></div>
    <form class="trc-in" id="trcForm"><textarea id="trcTxt" rows="1" placeholder="z.B. „Max und Tim waren heute nicht da, Tom hat eine Zerrung“"></textarea>
      <input type="file" id="trcFile" accept="image/*,.txt,.csv,.xlsx,.xlsm" multiple hidden>
      <button type="button" class="iconbtn trc-clip" id="trcClip" title="Screenshot oder Datei (z.B. WhatsApp-Export)">📎</button>
      <button type="button" class="iconbtn trc-mic" id="trcMic" title="Sprechen">🎙️</button><button type="submit" class="btn" id="trcGo">Senden</button></form></div>`);
  M.classList.add('trchatmodal');
  trChatDraw(); trChatMode();
  const ta=document.getElementById('trcTxt');
  ta.addEventListener('input',()=>{ ta.style.height='auto'; ta.style.height=Math.min(140,ta.scrollHeight)+'px'; });
  ta.addEventListener('keydown',e=>{ if(e.key==='Enter'&&!e.shiftKey){ e.preventDefault(); document.getElementById('trcForm').requestSubmit(); } });
  document.getElementById('trcForm').onsubmit=e=>{ e.preventDefault(); const v=ta.value.trim(); if((!v&&!trAttHas())||TR.chatBusy)return; ta.value=''; ta.style.height='auto'; trChatSend(v); };
  trMicSetup(); trAttSetup();
  if(!TR.loaded)trLoad().then(()=>{ if(TR.chat.length===1&&TR.chat[0].local){ TR.chat[0].content=trGreeting(); trChatDraw(); } trChatMode(); });
  setTimeout(()=>ta.focus(),200);
}
function trChatMode(){ const el=document.getElementById('trcMode'); if(!el)return; const ai=TR.ai&&TR.ai.ready;
  el.innerHTML=ai?'KI-Modus · versteht freie Sätze und Fragen':'Einfacher Modus · Anwesenheit, Gründe, Verletzungen'+(isAdmin()?' · <a href="#" id="trcKey">KI einschalten</a>':'');
  const k=document.getElementById('trcKey'); if(k)k.onclick=e=>{ e.preventDefault(); closeOverlay(); goTab('admin'); setTimeout(()=>{ const c=document.getElementById('trAi'); if(c)c.scrollIntoView({behavior:'smooth'}); },500); };
  const sug=document.getElementById('trcSug'); if(sug){ const S=['Heute fehlten …','📎 WhatsApp auswerten','Spiel: 3:1 gegen …','Kerwe-Aufbau: …','Wer ist aktuell verletzt?','Wie ist die Trainingsbeteiligung?'].concat(ai?['Wie siehst du die Elf fürs Wochenende?','Wer ist in den letzten Wochen auffällig?']:[]);
    sug.innerHTML=S.map(s=>`<button type="button">${svEsc(s)}</button>`).join(''); sug.querySelectorAll('button').forEach(b=>b.onclick=()=>{ if(/^📎/.test(b.textContent)){ const c=document.getElementById('trcClip'); if(c)c.click(); return; } const ta=document.getElementById('trcTxt'); if(/…$/.test(b.textContent)){ ta.value=b.textContent.replace('…',''); ta.focus(); } else trChatSend(b.textContent); }); } }
function trActSummary(a){
  const i=a.input||{};
  if(a.type==='training'){
    const sp=(i.spieler||[]), weg=sp.filter(x=>x.status==='weg'), sp2=sp.filter(x=>x.status==='spaet'), rated=sp.filter(x=>x.motivation||x.fitness||x.notiz);
    return `<b>Training ${TRC.fmt(i.datum)}${i.datum&&i.datum.slice(0,4)!==trToday().slice(0,4)?i.datum.slice(0,4):''}</b>
      ${weg.length?`<div>Fehlend: ${weg.map(x=>`${svEsc(trShort(x.player_id))} <em class="${x.grund==='ohne'?'bad':''}">(${svEsc(TRC.REASONS[x.grund]||'Grund?')})</em>`).join(', ')}</div>`:''}
      ${sp2.length?`<div>Zu spät: ${sp2.map(x=>svEsc(trShort(x.player_id))).join(', ')}</div>`:''}
      ${rated.length?`<div>Eindrücke: ${rated.map(x=>`${svEsc(trShort(x.player_id))}${x.motivation?' M'+x.motivation:''}${x.fitness?' F'+x.fitness:''}${x.notiz?' „'+svEsc(x.notiz)+'“':''}`).join(', ')}</div>`:''}
      ${(i.fokus||[]).length||i.intensitaet||i.stimmung?`<div>Einheit: ${(i.fokus||[]).map(f=>svEsc(TRC.FOKUS[f]||f)).join(', ')}${i.intensitaet?' · Intensität '+i.intensitaet+'/5':''}${i.stimmung?' · Eindruck '+i.stimmung+'/5':''}</div>`:''}
      ${i.notiz?`<div>Notiz: ${svEsc(i.notiz)}</div>`:''}
      <label class="trc-rest"><input type="checkbox" data-rest ${i.rest_da?'checked':''}> Alle anderen Kaderspieler als anwesend eintragen</label>`;
  }
  if(a.type==='spiel'){ const sp=i.spieler||[]; return `<b>⚽ Spiel ${TRC.fmt(i.datum)}${i.gegner?' gegen '+svEsc(i.gegner):''}${i.heim===true?' (Heim)':i.heim===false?' (Auswärts)':''}</b>
      <div>Ergebnis: <b>${i.tore_wir!=null?i.tore_wir:'?'}:${i.tore_gegner!=null?i.tore_gegner:'?'}</b></div>
      ${sp.some(x=>x.tore)?`<div>Tore: ${sp.filter(x=>x.tore).map(x=>svEsc(trShort(x.player_id))+(x.tore>1?' ('+x.tore+')':'')).join(', ')}</div>`:''}
      ${sp.some(x=>x.vorlagen)?`<div>Vorlagen: ${sp.filter(x=>x.vorlagen).map(x=>svEsc(trShort(x.player_id))+(x.vorlagen>1?' ('+x.vorlagen+')':'')).join(', ')}</div>`:''}`; }
  if(a.type==='veranstaltung'){ const h=i.helfer||[]; return `<b>🎪 ${svEsc(i.titel||TRS.EART[i.art]||'Veranstaltung')} · ${TRC.fmt(i.datum)}</b>
      ${h.length?`<div>${h.map(x=>`${svEsc(vrPersonName(x.person))}${(x.rollen||[]).length?' <em>('+x.rollen.map(r=>svEsc(TRS.ROLES[r]||r)).join(', ')+')</em>':''}${x.stunden?' '+x.stunden+' Std.':''}${x.status&&x.status!=='geholfen'?` <em class="${x.status==='nicht_erschienen'?'bad':''}">${svEsc(TRS.HSTAT[x.status]||x.status)}</em>`:''}`).join(' · ')}</div>`:'<div>Noch keine Helfer erkannt</div>'}`; }
  if(a.type==='verletzung')return `<b>🩹 Verletzung: ${svEsc(trName(i.player_id))}</b><div>${svEsc(i.diagnose||'')}${i.koerperteil?' · '+svEsc(i.koerperteil):''} · seit ${TRC.fmt(i.beginn)}${i.prognose?' · voraussichtlich zurück '+TRC.fmt(i.prognose):''}</div>`;
  if(a.type==='verletzung_ende'){ const inj=TR.st.injuries.find(x=>x.id===i.injury_id); return `<b>✅ Wieder fit: ${svEsc(trName(inj?inj.p:i.player_id))}</b><div>${svEsc(inj?inj.dg:i.diagnose||'')} · zurück am ${TRC.fmt(i.zurueck)}</div>`; }
  return '';
}
async function trExec(a,rest){
  const i=a.input||{};
  if(a.type==='training'){
    const sp=(i.spieler||[]).filter(x=>x.player_id).map(x=>Object.assign({player_id:x.player_id,status:x.status||'da'},x.status==='weg'?{grund:x.grund||'ohne'}:{},x.motivation?{motivation:x.motivation}:{},x.fitness?{fitness:x.fitness}:{},x.notiz?{notiz:x.notiz}:{}));
    if(rest){ const ex=trSessionOn(i.datum), have=new Set([...sp.map(x=>x.player_id),...(ex&&ex.a||[]).map(x=>x[0])]);
      trSquad().filter(p=>p.kader===1&&!have.has(p.id)).forEach(p=>{ const inj=trInjury(p.id); sp.push(inj?{player_id:p.id,status:'weg',grund:'verletzt'}:{player_id:p.id,status:'da'}); }); }
    const p={datum:i.datum||trToday(),typ:'training',spieler:sp}; ['fokus','intensitaet','stimmung','notiz'].forEach(k=>{ if(i[k]!=null&&!(Array.isArray(i[k])&&!i[k].length))p[k]=i[k]; });
    await trSaveSession(p); return 'Training '+TRC.fmt(p.datum)+' eingetragen';
  }
  if(a.type==='spiel'){ const sp=(i.spieler||[]).filter(x=>x.player_id).map(x=>Object.assign({player_id:x.player_id,status:x.status||'da'},x.tore?{tore:x.tore}:{},x.vorlagen?{vorlagen:x.vorlagen}:{}));
    const p={datum:i.datum||trToday(),typ:'spiel',spieler:sp}; ['gegner','heim','tore_wir','tore_gegner'].forEach(k=>{ if(i[k]!=null&&i[k]!=='')p[k]=i[k]; });
    await trSaveSession(p); return 'Spiel '+TRC.fmt(p.datum)+' eingetragen'; }
  if(a.type==='veranstaltung'){ await vrSaveEvent(i); return (i.titel||'Veranstaltung')+' eingetragen'; }
  if(a.type==='verletzung'){ await trSaveInjury(i); return 'Verletzung von '+trShort(i.player_id)+' eingetragen'; }
  if(a.type==='verletzung_ende'){ await trCloseInjury(i.injury_id,i.zurueck||trToday()); return 'Verletzung abgeschlossen'; }
}
function trChatDraw(){
  const L=document.getElementById('trcLog'); if(!L)return;
  L.innerHTML=TR.chat.map((m,mi)=>`<div class="trm ${m.role==='user'?'me':'co'}"><div class="trm-t">${svEsc(m.content).replace(/\n/g,'<br>')}${(m.imgs||[]).length?`<div class="trm-img">${m.imgs.map(u=>`<img src="${svEsc(u)}" alt="">`).join('')}</div>`:''}${m.file?`<div class="trm-img">📎 ${svEsc(m.file)}</div>`:''}</div>
    ${(m.actions||[]).map((a,ai)=>`<div class="trc-act${a.done?' done':''}${a.skip?' skip':''}" data-ai="${mi}:${ai}">${trActSummary(a)}
      <div class="btnrow">${a.done?`<span class="ok">✓ ${svEsc(a.done)}</span>`:a.skip?'<span class="note">verworfen</span>':`<button class="btn sm" data-do>Eintragen</button><button class="btn ghost sm" data-skip>Verwerfen</button>`}</div></div>`).join('')}</div>`).join('')
    +(TR.chatBusy?'<div class="trm co"><div class="trm-t trtyping"><i></i><i></i><i></i></div></div>':'');
  L.querySelectorAll('[data-ai]').forEach(box=>{ const [mi,ai]=box.dataset.ai.split(':').map(Number), a=TR.chat[mi].actions[ai];
    const d=box.querySelector('[data-do]'); if(d)d.onclick=async()=>{ d.disabled=true; const rest=box.querySelector('[data-rest]'); try{ a.done=await trExec(a,rest&&rest.checked); trChatDraw(); kToast('✓ '+a.done); }catch(e){ d.disabled=false; kToast('⚠️ '+e.message); } };
    const s=box.querySelector('[data-skip]'); if(s)s.onclick=()=>{ a.skip=true; trChatDraw(); }; });
  L.scrollTop=L.scrollHeight;
}
async function trChatSend(text){
  const att=TR.att||{imgs:[],file:null}; TR.att={imgs:[],file:null}; trAttDraw();
  if(!text)text=att.imgs.length?'Werte den Screenshot aus: Wer war beim Training dabei, wer hat abgesagt (mit Grund)? Bereite die Einträge vor.':att.file?'Werte diesen Verlauf aus: Wer hat fürs Training zu- oder abgesagt (mit Grund)? Bereite die Einträge vor.':'';
  TR.chat.push({role:'user',content:text,imgs:att.imgs.map(i=>i.thumb),file:att.file&&att.file.name}); TR.chatBusy=true; trChatDraw();
  if(!TR.loaded)await trLoad();
  let reply=null;
  if(typeof kxDeleteAsk==='function'&&kxDeleteAsk(text)){ TR.chatBusy=false; TR.chat.push({role:'assistant',local:true,content:KX_NO}); trChatDraw(); return; }
  if(att.imgs.length&&!(TR.ai&&TR.ai.ready)){
    TR.chatBusy=false; TR.chat.push({role:'assistant',local:true,content:'Screenshots kann nur der KI-Co-Trainer lesen. Der Admin schaltet ihn unter „Nutzer & Rollen“ ein.\nTipp: In WhatsApp den Gruppenchat exportieren (⋮ → Mehr → Chat exportieren → ohne Medien) und die Textdatei hier anhängen, die verstehe ich auch ohne KI.'}); trChatDraw(); return;
  }
  if(TR.ai&&TR.ai.ready){
    try{ const hist=TR.chat.filter(m=>!m.local||m.role==='user').slice(-12).map(m=>({role:m.role,content:m.content+(m.actions&&m.actions.length?'\n[Vorschläge: '+m.actions.map(a=>a.type+(a.done?' · eingetragen':a.skip?' · verworfen':' · offen')).join(', ')+']':'')}));
      const body={messages:hist}; try{ const F=typeof svSpielerAntwort==='function'?svSpielerAntwort(text):null; if(F)body.fakten=F; }catch(e){} if(att.imgs.length)body.bilder=att.imgs.map(i=>({mt:i.mt,data:i.data})); if(att.file)body.datei={name:att.file.name,text:att.file.text};
      const {data,error}=await SVB.sb.functions.invoke('coach',{body});
      if(error)throw error;
      if(data&&data.ok)reply={role:'assistant',content:data.text||(data.actions&&data.actions.length?'Hab ich so verstanden. Passt das?':'…'),actions:data.actions||[],weiter:data.weiter||null};
      else if(data&&data.error&&data.error!=='kein-schluessel')reply={role:'assistant',content:'',local:true,hinweis:typeof svKiFehler==='function'?svKiFehler(data.error):data.error};
    }catch(e){ reply={role:'assistant',content:'',local:true,hinweis:'Die KI ist gerade kurz nicht erreichbar.'}; }
  }
  if((!reply||reply.local)&&att.file&&TRS.isWhatsApp(att.file.text)){
    const W=TRS.parseWhatsApp(att.file.text,vrPeople(),trToday(),21);
    reply={role:'assistant',local:true,actions:W.actions,content:W.actions.length?`Aus ${W.used} Nachrichten der letzten 3 Wochen habe ich Zu- und Absagen erkannt, bitte kurz prüfen:`:`Ich habe ${W.messages} Nachrichten gelesen, aber keine eindeutigen Zu- oder Absagen der letzten 3 Wochen gefunden.`};
    TR.chatBusy=false; TR.chat.push(reply); trChatDraw(); return;
  }
  if((!reply||reply.local)&&att.file&&!text.trim())text=att.file.text.slice(0,2000);
  if(!reply||reply.local){
    const sq=trSquadLite(), PK=typeof kxParse==='function'&&kxOk()?kxParse(text,{list:/\n/.test(text)}):null, PM=PK&&PK.actions.length?null:TRS.parseMatch(text,sq,trToday()), PE=PM||(PK&&PK.actions.length)?null:TRS.parseEvent(text,vrPeople(),trToday());
    const P=PK&&PK.actions.length?{actions:PK.actions,ambig:PK.ambig}:PM?{actions:[PM.action],ambig:PM.ambig,warn:PM.warn}:PE?{actions:[PE.action],ambig:PE.ambig}:TRC.parse(text,sq,trToday(),TR.st);
    let content, actions=P.actions;
    if(PK&&!PK.actions.length&&PK.miss.length&&!(PK.ambig||[]).length&&!actions.length){ TR.chatBusy=false; TR.chat.push({role:'assistant',local:true,content:'Zu wem gehört die Nummer bzw. E-Mail? Schreib bitte den Namen dazu, z. B. „Max Mustermann 0171 1234567“.'}); trChatDraw(); return; }
    if(PK&&PK.ambig&&PK.ambig.length&&!PK.actions.length)P.ambig=PK.ambig;
    if(P.ambig&&P.ambig.length){ content=(reply&&reply.content?reply.content+'\n':'')+P.ambig.map(a=>`Welchen meinst du mit „${a.k.replace(/^\w/,c=>c.toUpperCase())}“: ${a.names.join(', ')}?`).join('\n')+(actions.length?'\n\nDen Rest habe ich schon vorbereitet:':' Schreib bitte den vollen Namen.'); }
    else if(actions.length){ content=(reply&&reply.content?reply.content+'\n':'')+'Verstanden, so würde ich es eintragen:'+(P.warn?'\n⚠️ '+P.warn:''); }
    else { const ans=(typeof svSpielerAntwort==='function'&&svSpielerAntwort(text))||TRC.answer(text,sq,TR.st,trToday()); content=(reply&&reply.content?reply.content+'\n':'')+(ans?ans+(reply&&reply.hinweis?'\n\n'+reply.hinweis+' Das ist die Antwort aus den Daten der App.':''):(reply&&reply.hinweis?reply.hinweis+' Bitte gleich noch einmal fragen. ':'')+'Das habe ich nicht verstanden. Im einfachen Modus verstehe ich Sätze wie „Max und Tim waren heute nicht da (Arbeit), Tom hat eine Zerrung, drei Wochen“ oder Fragen wie „Ist Tom wieder fit?“.'+(TR.ai&&TR.ai.ready?'':' Für freie Fragen und Aufstellungs-Tipps kann der Admin die KI einschalten.')); }
    reply={role:'assistant',content,actions,local:true};
  }
  TR.chatBusy=false; TR.chat.push(reply); trChatDraw();
}
/* Anhänge: Screenshots (KI), WhatsApp-Export (.txt), Listen (.xlsx/.csv → Import) */
function trAttHas(){ return !!(TR.att&&(TR.att.imgs.length||TR.att.file)); }
function trAttDraw(){ const el=document.getElementById('trcAtt'); if(!el)return; const A=TR.att||{imgs:[],file:null};
  el.innerHTML=A.imgs.map((i,k)=>`<span><img src="${svEsc(i.thumb)}" alt=""><button type="button" data-rmi="${k}" aria-label="Entfernen">✕</button></span>`).join('')+(A.file?`<span>📎 ${svEsc(A.file.name)} <button type="button" data-rmf aria-label="Entfernen">✕</button></span>`:'');
  el.querySelectorAll('[data-rmi]').forEach(b=>b.onclick=()=>{ A.imgs.splice(+b.dataset.rmi,1); trAttDraw(); });
  const f=el.querySelector('[data-rmf]'); if(f)f.onclick=()=>{ A.file=null; trAttDraw(); }; }
function trImg(file){ return new Promise((res,rej)=>{ const u=URL.createObjectURL(file), im=new Image();
  im.onload=()=>{ const mx=1568, k=Math.min(1,mx/Math.max(im.width,im.height)), c=document.createElement('canvas'); c.width=Math.round(im.width*k); c.height=Math.round(im.height*k);
    c.getContext('2d').drawImage(im,0,0,c.width,c.height); URL.revokeObjectURL(u); let q=0.85, d=c.toDataURL('image/jpeg',q); while(d.length>1500000&&q>0.4){ q-=0.15; d=c.toDataURL('image/jpeg',q); }
    const t=document.createElement('canvas'), tk=96/Math.max(c.width,c.height); t.width=Math.round(c.width*tk); t.height=Math.round(c.height*tk); t.getContext('2d').drawImage(c,0,0,t.width,t.height);
    res({mt:'image/jpeg',data:d.split(',')[1],thumb:t.toDataURL('image/jpeg',0.7),name:file.name}); };
  im.onerror=()=>{ URL.revokeObjectURL(u); rej(new Error('Bild konnte nicht gelesen werden')); }; im.src=u; }); }
function trAttSetup(){
  TR.att=TR.att||{imgs:[],file:null}; trAttDraw();
  const inp=document.getElementById('trcFile'), b=document.getElementById('trcClip'); if(!inp||!b)return;
  b.onclick=()=>inp.click();
  inp.onchange=async()=>{ const files=[...inp.files]; inp.value='';
    for(const f of files){
      try{
        if(/\.(xlsx|xlsm|csv)$/i.test(f.name)){ closeOverlay(); vrImport('training',f); return; }
        if(/^image\//.test(f.type)||/\.(jpe?g|png|webp|gif|heic)$/i.test(f.name)){ if(TR.att.imgs.length>=4){ kToast('Höchstens 4 Bilder auf einmal'); continue; } TR.att.imgs.push(await trImg(f)); }
        else if(/\.txt$/i.test(f.name)||f.type==='text/plain'){ if(f.size>5e6){ kToast('Datei zu groß'); continue; } const t=await f.text(); TR.att.file={name:f.name.slice(0,80),text:t.slice(-60000)}; }
        else kToast('Dieser Dateityp geht nicht: '+f.name);
      }catch(e){ kToast('⚠️ '+(e.message||e)); }
    }
    trAttDraw(); document.getElementById('trcTxt').focus(); };
}
/* Spracheingabe (Web Speech API – iPhone/Safari & Chrome) */
function trMicSetup(){
  const b=document.getElementById('trcMic'), SR=window.SpeechRecognition||window.webkitSpeechRecognition;
  if(!b)return; if(!SR){ b.title='Diktieren: Mikrofon-Taste der Handy-Tastatur nutzen'; b.onclick=()=>{ kToast('Tipp: Mikrofon-Taste auf der Tastatur antippen und losreden'); document.getElementById('trcTxt').focus(); }; return; }
  let rec=null;
  b.onclick=()=>{
    if(rec){ rec.stop(); return; }
    rec=new SR(); rec.lang='de-DE'; rec.interimResults=true; rec.continuous=true;
    const ta=document.getElementById('trcTxt'), base=ta.value?ta.value+' ':'';
    rec.onresult=e=>{ let t=''; for(let i=0;i<e.results.length;i++)t+=e.results[i][0].transcript; ta.value=base+t; ta.dispatchEvent(new Event('input')); };
    rec.onend=()=>{ b.classList.remove('rec'); rec=null; };
    rec.onerror=e=>{ b.classList.remove('rec'); rec=null; if(e.error==='not-allowed')kToast('Mikrofon nicht erlaubt: in den Einstellungen freigeben'); };
    try{ rec.start(); b.classList.add('rec'); kToast('🎙️ Ich höre zu … nochmal tippen zum Beenden'); }catch(e){ rec=null; }
  };
}
/* schwebender Knopf */
function trFab(){
  // 0.74: kein schwebender Knopf mehr, der Inhalt verdeckt. Der Co-Trainer sitzt in der Kopfzeile.
  const b=document.getElementById('tbKi'); if(!b)return;
  if(!canTraining()){ b.style.display='none'; return; }
  b.style.display=''; if(!b.dataset.wired){ b.dataset.wired='1'; b.onclick=()=>trChatOpen(); }
}

/* ---------- Admin: KI-Schlüssel ---------- */
async function trAiCard(P){
  if(!P||!isAdmin())return;
  let s=null; try{ const {data}=await SVB.sb.rpc('ai_status'); s=data; }catch(e){}
  const ready=!!(s&&s.ready), server=s&&s.quelle==='server', aus=s&&s.aus;
  const el=document.createElement('div'); el.className='card'; el.id='trAi';
  el.innerHTML=`<div class="adm-head"><div><h3 style="margin:0;display:flex;gap:8px;align-items:center">${SVI('chat')} KI (Co-Trainer, KI-Scouts, Aufträge)</h3>
    <p style="margin:6px 0 0;font-size:13.5px">Der KI-Schlüssel wird <b>nicht in der App</b> eingegeben. Er liegt nur auf dem Server. Niemand in der App kann ihn sehen, und er wandert nie aufs Handy.</p></div>
    <span class="pill ${ready?'on':'wait'}">${ready?'aktiv'+(server?' · Server':'')+' · '+svEsc(s.model||''):aus?'ausgeschaltet':'noch nicht hinterlegt'}</span></div>
    ${!ready&&!aus?`<ol class="trai-steps"><li>Im Supabase-Dashboard: Projekt → <b>Edge Functions → Secrets</b> → „Add new secret“</li><li>Name <code>ANTHROPIC_API_KEY</code>, Wert: der Schlüssel (sk-ant-…) → Speichern</li><li>Hier auf <b>Prüfen</b> tippen: fertig.</li></ol>`:''}
    <div class="invite" style="grid-template-columns:1fr auto auto"><div><label for="trAiModel">Modell</label><select id="trAiModel">${[['claude-sonnet-5','Claude Sonnet 5 (empfohlen)'],['claude-haiku-4-5-20251001','Claude Haiku 4.5 (günstig)'],['claude-opus-5-5','Claude Opus 5.5 (stärkstes)']].map(([k,t])=>`<option value="${k}"${s&&s.model===k?' selected':''}>${t}</option>`).join('')}</select></div>
      <button class="btn ghost" id="trAiCheck" style="height:46px">${SVI('refresh')} Prüfen</button><button class="btn" id="trAiSave" style="height:46px">${aus?'KI einschalten':'Speichern'}</button></div>
    <p class="note">Kosten laufen direkt über euer Anthropic-Konto; die KI-Scouts haben einen Monatsdeckel${s&&s.budget!=null?' ('+svEsc(s.budget)+' $)':''}. ${ready?'<a href="#" id="trAiOff">KI ausschalten</a>':''}</p>`;
  P.appendChild(el);
  const reload=()=>{ TR.ai=null; trLoad(true); const c=document.getElementById('trAi'); if(c)c.remove(); trAiCard(P); };
  document.getElementById('trAiSave').onclick=async()=>{ const m=document.getElementById('trAiModel').value;
    try{ const {error}=await SVB.sb.rpc('ai_set',{p_key:null,p_model:m,p_clear:false}); if(error)throw error; kToast(aus?'✓ KI eingeschaltet':'✓ Gespeichert'); reload(); }catch(e){ kToast('⚠️ '+(e.message||e)); } };
  document.getElementById('trAiCheck').onclick=async e=>{ const b=e.currentTarget; b.disabled=true;
    try{ const {data,error}=await SVB.sb.functions.invoke('ki-check',{body:{}}); if(error)throw error;
      kToast(data&&data.secret?(data.gueltig===false?'⚠️ Schlüssel gefunden, wird aber von Anthropic abgelehnt':'✓ Schlüssel auf dem Server gefunden. KI ist aktiv'):'Noch kein Schlüssel auf dem Server (ANTHROPIC_API_KEY)'); reload(); }
    catch(x){ b.disabled=false; kToast('⚠️ '+(x.message||x)); } };
  const off=document.getElementById('trAiOff'); if(off)off.onclick=async e=>{ e.preventDefault(); try{ await SVB.sb.rpc('ai_set',{p_key:null,p_model:null,p_clear:true}); kToast('KI ausgeschaltet'); reload(); }catch(x){ kToast('⚠️ '+x.message); } };
}
{ const _ar1=svAdminRender; svAdminRender=async function(){ const r=await _ar1.apply(this,arguments); try{ const P=document.getElementById('panel-admin'); if(P&&!P.querySelector('#trAi'))await trAiCard(P); }catch(e){} return r; }; }

/* ---------- Start ---------- */
{ const _gt2=goTab; goTab=function(tab){ const r=_gt2.apply(this,arguments); if(tab==='training')trRender(); return r; }; }
{ const _si2=svInit; svInit=function(){
    const r=_si2.apply(this,arguments);
    const show=canTraining();
    document.querySelectorAll('[data-tab="training"],[data-sheet="training"]').forEach(b=>{ b.style.display=show?'':'none'; });
    document.querySelectorAll('.tabbar .ti[data-tab="scout"]').forEach(b=>{ b.style.display=show?'none':''; });
    if(show){ trFab(); trLoad();
      try{ const ch=SVB.sb.channel('training-live'); let t=null; const pull=()=>{ clearTimeout(t); t=setTimeout(()=>trLoad(true),500); };
        ['training_sessions','training_attendance','injuries'].forEach(tb=>ch.on('postgres_changes',{event:'*',schema:'public',table:tb},pull)); ch.subscribe(); }catch(e){}
      document.addEventListener('visibilitychange',()=>{ if(document.visibilityState==='visible')trLoad(true); });
      { const _rh3=renderHome; renderHome=function(){ const x=_rh3.apply(this,arguments); try{trHomeCard();}catch(e){} return x; }; }
      if((location.hash||'').slice(1)==='training')setTimeout(()=>goTab('training'),50);
    }
    return r; }; }

/* =====================================================================
   SV/BSC Scout · Runde 8: Verein: Rankings (Training & Loyalität), Veranstaltungen & Helfer,
   Allzeit-Statistik & Legenden, Import von Listen (Excel/CSV/Einfügen), Scouting-Radar
   Rechte: Rankings, Helfer, Radar nur fürs Team (Admin, Vorstand, Kaderplaner, Trainer);
           Allzeit-Statistik (öffentliche Vereinsseite) sehen alle Mitglieder.
   ===================================================================== */
SV_PAGES.verein=['Verein','Rankings, Helfer & Veranstaltungen, Allzeit-Statistik und Legenden'];
SV_PAGES.radar=['Radar','Formkurven, Torserien und Moneyball-Chancen. Bevor es andere merken'];
function canScout(){ return canEdit(); }
{ const _ta2=svTabAllowed; svTabAllowed=function(t){ if(t==='radar')return canScout(); if(t==='verein')return true; return _ta2.apply(this,arguments); }; }

const VR={ev:[],evLoaded:false,at:[],atLoaded:false,radar:[],radarLoaded:false,view:null,atSort:'sp',atQ:'',rf:'alle',kader:'1',atShow:40};
const VR_SEASON_START='2026-07-01';
function vrPeople(){ return players.filter(p=>p.own&&!p.verzicht).map(p=>({id:p.id,name:p.name})); }
function vrPersonName(person){ return String(person||'').startsWith('x:')?String(person).slice(2):trName(person); }
function vrKader(all){ return players.filter(p=>p.own&&!p.isJugend&&!p.verzicht&&(p.kader===1||(all&&p.kader===2))).sort((a,b)=>a.name.localeCompare(b.name,'de')); }

/* ---------- Laden ---------- */
async function vrLoadEvents(){ if(!canTraining())return; try{ const {data,error}=await SVB.sb.rpc('events_state',{p_since:TRC.addDays(trToday(),-1100)}); if(error)throw error; VR.ev=(data||[]).map(e=>Object.assign(e,{id:String(e.id)})); VR.evLoaded=true; }catch(e){ console.warn('Veranstaltungen',e); } vrAfter(); }
async function vrLoadAllTime(){ try{ const {data,error}=await SVB.sb.from('club_stats').select('key,name,tore,assists,spiele,siege,quote,stand').order('spiele',{ascending:false}).limit(2000); if(error)throw error; VR.at=data||[]; VR.atLoaded=true; VR._idx=null; }catch(e){ console.warn('Allzeit',e); VR.atLoaded=true; } vrAfter(); }
async function vrLoadRadar(){ if(!canScout())return; try{ const {data,error}=await SVB.sb.from('radar').select('id,key,stand,typ,lvl,player_id,club_key,titel,detail,data,ai,created_at').order('created_at',{ascending:false}).limit(400); if(error)throw error; VR.radar=data||[]; VR.radarLoaded=true; }catch(e){ console.warn('Radar',e); VR.radarLoaded=true; } vrAfter(); }
function vrAfter(){ try{ if(document.querySelector('#panel-verein.active'))vrRender(); }catch(e){ console.warn(e); } try{ if(document.querySelector('#panel-radar.active'))rdRender(); }catch(e){ console.warn(e); } try{ vrHomeCard(); }catch(e){} vrBadge(); }
async function vrSaveEvent(i){ const {data,error}=await SVB.sb.rpc('event_save',{p:i}); if(error)throw new Error(/check/.test(error.message)?'Ungültige Angabe (Art, Stunden oder Status)':error.message); await vrLoadEvents(); return data; }

/* ---------- Allzeit: Zuordnung Spieler ↔ Vereinsstatistik ---------- */
function vrIdx(){
  const k=VR.at.length+':'+Object.keys(CRM||{}).length+':'+players.length;
  if(VR._idx&&VR._idxK===k)return VR._idx;
  const ordered=[...players.filter(p=>p.own),...players.filter(p=>!p.own)];
  VR._idx=TRS.allTimeIndex(VR.at,ordered,CRM||{}); VR._idxK=k; return VR._idx;
}
function vrTotals(pid){ const row=vrIdx().byPlayer.get(pid)||null; const p=trP(pid); const ms=p&&p.own&&TR.loaded?TRS.matchStats(TR.st,pid,row&&row.stand?row.stand:VR_SEASON_START):null; return {row,ms,tot:TRS.totals(row,ms)}; }
function vrRanks(){ // ewige Listen: Platz nach Spielen und Toren
  if(VR._rk&&VR._rkK===VR._idxK)return VR._rk;
  const idx=vrIdx(), L=VR.at.map(r=>{ const pid=idx.used.get(r.key); return {r,pid,tot:pid?vrTotals(pid).tot:TRS.totals(r,null)}; });
  const bySp=[...L].sort((a,b)=>b.tot.sp-a.tot.sp), byT=[...L].sort((a,b)=>b.tot.tore-a.tot.tore);
  const rk=new Map(); bySp.forEach((x,i)=>rk.set(x.r.key,{sp:i+1})); byT.forEach((x,i)=>{ rk.get(x.r.key).tore=i+1; });
  VR._rk={L,rk}; VR._rkK=VR._idxK; return VR._rk;
}
function vrScores(p){
  const today=trToday(), {row,ms}=vrTotals(p.id);
  const ts=TR.loaded?TRS.trainingScore(TR.st,p.id,today):{score:null,why:['Trainingsdaten werden geladen …']};
  const ls=TRS.loyaltyScore(p.id,VR.ev,row,ms?ms.sp:0,today);
  const ps=TR.loaded?TRC.playerStats(TR.st,p.id,today):null;
  const rt=ps?TRS.retention(ts,ls,ps,VR.ev.length>0):{risk:0,lvl:null,why:[]};
  return {ts,ls,rt};
}
const vrCls=v=>v==null?'':v>=75?'ok':v>=55?'mid':'bad';

/* ---------- Seite „Verein“ ---------- */
function vrRender(){
