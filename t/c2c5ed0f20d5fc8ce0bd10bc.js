  const P=document.getElementById('panel-verein'); if(!P)return;
  const team=canTraining();
  if(!VR.view)VR.view=team?'rank':'allzeit';
  if(!team&&VR.view!=='allzeit')VR.view='allzeit';
  const tabs=(team?[['rank','Rankings'],['events','Helfer & Events']]:[]).concat([['allzeit','Allzeit & Legenden']]);
  P.innerHTML=`<div class="trtop"><div class="trtabs">${tabs.map(([k,t])=>`<button class="${VR.view===k?'on':''}" data-vrv="${k}">${t}</button>`).join('')}</div>
    ${team?`<div class="tract"><button class="btn" data-vr-ev>${SVI('plus')} Veranstaltung</button><button class="btn ghost" data-vr-imp>${SVI('upload')} Listen importieren</button></div>`:''}</div><div id="vrBody"></div>`;
  P.querySelectorAll('[data-vrv]').forEach(b=>b.onclick=()=>{ VR.view=b.dataset.vrv; vrRender(); });
  if(team){ P.querySelector('[data-vr-ev]').onclick=()=>vrEventEditor(null); P.querySelector('[data-vr-imp]').onclick=()=>vrImport(VR.view==='events'?'helfer':'training'); }
  const B=document.getElementById('vrBody');
  if(team&&(!TR.loaded||!VR.evLoaded)&&VR.view!=='allzeit'){ B.innerHTML='<div class="card"><div class="empty">Lade Daten …</div></div>'; if(!TR.loaded)trLoad(); if(!VR.evLoaded)vrLoadEvents(); return; }
  ({rank:vrViewRank,events:vrViewEvents,allzeit:vrViewAllTime})[VR.view](B);
}

/* ----- Rankings ----- */
function vrViewRank(B){
  const list=vrKader(VR.kader==='2').map(p=>Object.assign({p},vrScores(p)));
  const tr=list.filter(x=>x.ts.score!=null).sort((a,b)=>b.ts.score-a.ts.score);
  const lo=[...list].sort((a,b)=>b.ls.score-a.ls.score);
  const risk=list.filter(x=>x.rt.lvl).sort((a,b)=>b.rt.risk-a.rt.risk);
  const podium=(L,k,unit)=>L.length?`<div class="vrpod">${[1,0,2].map(i=>L[i]?`<div class="vrpod-i p${i+1}" data-why="${svEsc(L[i].p.id)}">${avaHtml(L[i].p)}<b>${svEsc(trShort(L[i].p.id))}</b><span class="${vrCls(L[i][k].score)}">${L[i][k].score}</span><i>${i+1}</i></div>`:'<div></div>').join('')}</div>`:'';
  const rows=(L,k)=>(VR.rkAll?L:L.slice(0,12)).map((x,i)=>`<div class="vrrow" data-why="${svEsc(x.p.id)}"><em>${i+1}</em>${avaHtml(x.p)}<div class="vrrow-b"><b>${svEsc(x.p.name)}${x.p.kader===2?' <small>II</small>':''}</b><div class="vrbar"><i class="${vrCls(x[k].score)}" style="width:${Math.max(3,x[k].score||0)}%"></i></div></div><span class="vrsc ${vrCls(x[k].score)}">${x[k].score==null?'–':x[k].score}</span></div>`).join('');
  const noTr=list.filter(x=>x.ts.score==null).length;
  B.innerHTML=`<div class="vrfilter"><div class="trtabs sm"><button class="${VR.kader==='1'?'on':''}" data-k="1">1. Mannschaft</button><button class="${VR.kader==='2'?'on':''}" data-k="2">+ Zweite</button></div>
      <small>Antippen zeigt, wie der Score zustande kommt.</small></div>
    <div class="vrgrid">
      <div class="card"><h3 class="trh">${SVI('activity')} Trainings-Score</h3>${tr.length?podium(tr,'ts')+`<div class="vrlist">${rows(tr,'ts')}</div>`:'<div class="note">Ab 4 erfassten Einheiten je Spieler erscheint hier das Ranking. Tipp: Julians Trainingslisten über „Listen importieren“ einlesen.</div>'}
        ${tr.length>12&&!VR.rkAll?'<button class="btn ghost sm" data-rkall>Alle '+tr.length+' zeigen</button>':''}${noTr&&tr.length?`<div class="note">${noTr} Spieler noch ohne Score (weniger als 4 Einheiten).</div>`:''}
        <div class="note">Verletzt, länger krank und „in der Zweiten“ zählen <b>nicht</b> · kurzfristige Krankmeldungen zählen halb, gehäuft stärker; ohne Grund zählt voll.</div></div>
      <div class="card"><h3 class="trh">${SVI('heart')} Loyalität &amp; Vereinsherz</h3>${podium(lo,'ls')}<div class="vrlist">${rows(lo,'ls')}</div>${lo.length>12&&!VR.rkAll?'<button class="btn ghost sm" data-rkall>Alle '+lo.length+' zeigen</button>':''}
        <div class="note">Helfereinsätze (Aufbau, Theke, Kasse … inkl. Stunden) · Vereinstreue (Pflichtspiele seit 2013/14) · Teamgeist. ${VR.ev.length?'':'<b>Noch keine Veranstaltungen erfasst</b> · aktuell zählt nur die Vereinstreue.'}</div></div>
    </div>
    ${risk.length?`<div class="card"><h3 class="trh">${SVI('bell')} Bindungsrisiko: früh das Gespräch suchen</h3>${risk.map(x=>`<div class="tra l-${x.rt.lvl}"><span class="tra-av" data-svp="${svEsc(x.p.id)}">${avaHtml(x.p)}</span><div class="tra-b"><b data-svp="${svEsc(x.p.id)}">${svEsc(x.p.name)}</b><span>${svEsc(x.rt.why.join(' · '))}</span></div></div>`).join('')}</div>`:''}`;
  B.querySelectorAll('[data-k]').forEach(b=>b.onclick=()=>{ VR.kader=b.dataset.k; vrViewRank(B); });
  B.querySelectorAll('[data-rkall]').forEach(b=>b.onclick=()=>{ VR.rkAll=true; vrViewRank(B); });
  B.querySelectorAll('[data-why]').forEach(x=>x.onclick=()=>vrWhy(x.dataset.why));
  B.querySelectorAll('[data-svp]').forEach(x=>x.onclick=e=>{ e.stopPropagation(); openModal(x.dataset.svp); });
}
function vrWhy(pid){
  const p=trP(pid); if(!p)return; const {ts,ls,rt}=vrScores(p);
  svModal(`<div class="mhead">${avaHtml(p)}<div><h2 style="margin:0">${svEsc(p.name)}</h2><div class="msub">So entstehen die Scores</div></div></div>
    <div class="vrwhy"><div class="vrwhy-s"><span>Trainings-Score</span><b class="${vrCls(ts.score)}">${ts.score==null?'–':ts.score}</b></div><ul>${ts.why.map(w=>`<li>${svEsc(w)}</li>`).join('')}</ul></div>
    <div class="vrwhy"><div class="vrwhy-s"><span>Loyalität</span><b class="${vrCls(ls.score)}">${ls.score}</b></div><ul>${ls.why.map(w=>`<li>${svEsc(w)}</li>`).join('')}</ul></div>
    ${rt.lvl?`<div class="vrwhy warn"><div class="vrwhy-s"><span>Bindungsrisiko</span><b class="bad">${rt.lvl}</b></div><ul>${rt.why.map(w=>`<li>${svEsc(w)}</li>`).join('')}</ul></div>`:''}
    <div class="btnrow sbact"><button class="btn" id="vrOpen">Spielerprofil öffnen</button><button class="btn ghost" id="vrClose">Schließen</button></div>`);
  document.getElementById('vrOpen').onclick=()=>openModal(pid);
  document.getElementById('vrClose').onclick=()=>closeOverlay();
}

/* ----- Helfer & Veranstaltungen ----- */
function vrHelpStats(since){
  const m=new Map();
  for(const e of VR.ev){ if(since&&e.d<since)continue; for(const h of e.h||[]){ if(h[3]!=='geholfen'||e.a==='mannschaft')continue; const o=m.get(h[0])||{n:0,std:0,last:null}; o.n++; o.std+=+(h[2]||0); if(!o.last||e.d>o.last)o.last=e.d; m.set(h[0],o); } }
  return m;
}
function vrSuggest(n,exclude){
  const hs=vrHelpStats(TRC.addDays(trToday(),-365)), ex=new Set(exclude||[]);
  return vrKader(true).filter(p=>!ex.has(p.id)&&!(TR.loaded&&trInjury(p.id))).map(p=>({p,s:hs.get(p.id)||{n:0,std:0,last:null}}))
    .sort((a,b)=>a.s.n-b.s.n||a.s.std-b.s.std||(a.s.last||'').localeCompare(b.s.last||'')||(a.p.kader||1)-(b.p.kader||1)).slice(0,n);
}
function vrViewEvents(B){
  const hs=vrHelpStats(VR_SEASON_START), top=[...hs.entries()].sort((a,b)=>b[1].std-a[1].std||b[1].n-a[1].n).slice(0,8);
  const season=VR.ev.filter(e=>e.d>=VR_SEASON_START), hours=season.reduce((a,e)=>a+(e.h||[]).filter(h=>h[3]==='geholfen').reduce((x,h)=>x+ +(h[2]||0),0),0);
  const never=vrKader(false).filter(p=>!hs.has(p.id));
  const sug=vrSuggest(6);
  B.innerHTML=`<div class="tiles trtiles">
      <div class="tile"><div class="v">${season.length}</div><div class="l">Veranstaltungen · Saison</div><div class="s">${VR.ev.length} insgesamt erfasst</div></div>
      <div class="tile"><div class="v">${Math.round(hours)}</div><div class="l">Helferstunden · Saison</div><div class="s">${hs.size} verschiedene Helfer</div></div>
      <div class="tile"><div class="v ${never.length?'mid':''}">${never.length}</div><div class="l">aus der Ersten noch nie geholfen</div><div class="s">diese Saison</div></div></div>
    <div class="vrgrid">
      <div class="card"><h3 class="trh">${SVI('plan')} Veranstaltungen</h3>${VR.ev.length?`<div class="trsl">${VR.ev.slice(0,80).map(e=>{ const hh=(e.h||[]).filter(h=>h[3]==='geholfen'), std=hh.reduce((a,h)=>a+ +(h[2]||0),0), ns=(e.h||[]).filter(h=>h[3]==='nicht_erschienen').length, zu=(e.h||[]).filter(h=>h[3]==='zugesagt').length;
        return `<button class="trs" data-ev="${e.id}"><div class="trs-d"><b>${new Date(e.d+'T12:00:00').toLocaleDateString('de-DE',{weekday:'short'})}</b><span>${TRC.fmt(e.d)}${e.d.slice(2,4)}</span></div>
          <div class="trs-b"><div class="trs-f"><i class="typ">${svEsc(TRS.EART[e.a]||e.a)}</i>${std?`<i>${std} Std.</i>`:''}${zu?`<i class="int">${zu} zugesagt</i>`:''}${ns?`<i class="st s1">${ns} nicht erschienen</i>`:''}</div><span><b>${svEsc(e.t)}</b> · ${hh.length?svEsc(hh.slice(0,6).map(h=>vrPersonName(h[0]).split(' ').pop()).join(', '))+(hh.length>6?' …':''):'noch keine Helfer'}</span></div>
          <div class="trs-n"><b>${hh.length}</b><span>Helfer</span></div></button>`; }).join('')}</div>`:`<div class="empty">Noch keine Veranstaltung erfasst.<br><small>Kerwe, Heimspiel-Dienste, Weihnachtsmarkt, Arbeitseinsätze …, oder dem Co-Trainer sagen: „Kerwe-Aufbau: Fries, Seiler und Walter, je 4 Stunden“.</small></div>`}</div>
      <div class="card"><h3 class="trh">${SVI('heart')} Fleißigste Helfer · Saison</h3>${top.length?`<div class="vrlist">${top.map(([pid,s],i)=>{ const p=trP(pid); return `<div class="vrrow" ${p?`data-svp="${svEsc(pid)}"`:''}><em>${i+1}</em>${avaHtml(p||{id:pid,name:vrPersonName(pid)})}<div class="vrrow-b"><b>${svEsc(vrPersonName(pid))}</b><small>${s.n}× geholfen</small></div><span class="vrsc ok">${s.std} h</span></div>`; }).join('')}</div>`:'<div class="note">Noch keine Helfereinsätze diese Saison.</div>'}
        <h3 class="trh" style="margin-top:16px">${SVI('kand')} Wer ist als Nächstes dran?</h3>
        <div class="note" style="margin-top:0">Fair verteilt: wer in den letzten 12 Monaten am wenigsten geholfen hat (ohne Verletzte).</div>
        <div class="vrchips">${sug.map(x=>`<span data-svp="${svEsc(x.p.id)}">${svEsc(x.p.name)} <small>${x.s.n?x.s.n+'×':'noch nie'}</small></span>`).join('')}</div>
        <button class="btn ghost sm" data-vr-plan style="margin-top:8px">${SVI('plus')} Nächsten Dienst mit diesen Helfern planen</button></div>
    </div>`;
  B.querySelectorAll('[data-ev]').forEach(b=>b.onclick=()=>vrEventEditor(b.dataset.ev));
  B.querySelectorAll('[data-svp]').forEach(x=>x.onclick=()=>openModal(x.dataset.svp));
  const pl=B.querySelector('[data-vr-plan]'); if(pl)pl.onclick=()=>vrEventEditor(null,{art:'heimspiel',titel:'Heimspiel-Dienst',datum:trToday(),helfer:sug.map(x=>({person:x.p.id,rollen:[],stunden:null,status:'zugesagt'}))});
}
function vrEventEditor(id,preset){
  const e0=id?VR.ev.find(e=>e.id===id):null;
  const st=e0?{id:e0.id,datum:e0.d,titel:e0.t,art:e0.a,notiz:e0.n||'',h:(e0.h||[]).map(h=>({person:h[0],rollen:[...(h[1]||[])],stunden:h[2]!=null?+h[2]:null,status:h[3]||'geholfen',notiz:h[4]||''}))}
    :Object.assign({id:null,datum:trToday(),titel:'',art:'kerwe',notiz:'',h:[]},preset?{datum:preset.datum,titel:preset.titel,art:preset.art,h:preset.helfer.map(x=>Object.assign({notiz:''},x))}:{});
  const people=vrPeople();
  svModal(`<div class="mhead"><div class="rm-ic" style="width:46px;height:46px">${SVI('heart')}</div><div><h2 style="margin:0">${e0?'Veranstaltung bearbeiten':'Veranstaltung erfassen'}</h2><div class="msub">Helfereinsätze fließen in den Loyalitäts-Score</div></div></div><div id="vrEd"></div>`);
  const draw=()=>{
    const E=document.getElementById('vrEd'); if(!E)return;
    const roleKeys=Object.keys(TRS.ROLES).filter(k=>k!=='sonstiges'&&(st.art==='mannschaft'?k==='teilnahme':k!=='teilnahme'));
    E.innerHTML=`<div class="tred-top"><div class="field"><label>Datum</label><input type="date" id="veD" value="${svEsc(st.datum)}"></div>
        <div class="field"><label>Art</label><select id="veA">${Object.entries(TRS.EART).map(([k,t])=>`<option value="${k}"${st.art===k?' selected':''}>${t}</option>`).join('')}</select></div></div>
      <div class="field" style="margin-top:8px"><label>Titel</label><input id="veT" maxlength="120" value="${svEsc(st.titel)}" placeholder="${svEsc(TRS.EART[st.art]||'')}"></div>
      <div class="sbsec"><h4>Helfer <small>${st.h.filter(h=>h.status==='geholfen').length} geholfen · ${st.h.reduce((a,h)=>a+(h.status==='geholfen'?+(h.stunden||0):0),0)} Std.</small></h4>
        <div class="vradd"><input id="veAdd" list="veList" placeholder="Name eingeben: Spieler oder freier Helfer" autocomplete="off"><datalist id="veList">${people.map(p=>`<option value="${svEsc(p.name)}">`).join('')}</datalist><button type="button" class="btn sm" id="veAddB">${SVI('plus')}</button><button type="button" class="btn ghost sm" id="veSug">Vorschlag</button></div>
        <div class="tratt">${st.h.map((h,i)=>`<div class="trr s-${h.status==='geholfen'?'da':h.status==='zugesagt'?'spaet':'weg'}"><div class="trr-h"><span class="trr-n"><b>${svEsc(vrPersonName(h.person))}</b><em>${h.person.startsWith('x:')?'Helfer ohne Spielerprofil':''}</em></span>
            <select data-hs="${i}" class="vrsel">${Object.entries(TRS.HSTAT).map(([k,t])=>`<option value="${k}"${h.status===k?' selected':''}>${t}</option>`).join('')}</select>
            <input data-hh="${i}" class="vrhrs" type="number" min="0" max="24" step="0.5" inputmode="decimal" value="${h.stunden==null?'':h.stunden}" placeholder="Std." aria-label="Stunden">
            <button type="button" class="iconbtn" data-hx="${i}" title="Entfernen">${SVI('x')}</button></div>
          <div class="trg">${roleKeys.map(k=>`<button type="button" data-hr="${i}:${k}" class="${h.rollen.includes(k)?'on':''}">${TRS.ROLES[k]}</button>`).join('')}</div></div>`).join('')||'<div class="note">Noch niemand eingetragen.</div>'}</div></div>
      <div class="field"><label>Notiz</label><input id="veN" maxlength="2000" value="${svEsc(st.notiz)}" placeholder="z.B. Wetter, Umsatz, was gut lief"></div>
      <div class="btnrow sbact"><button class="btn" id="veSave">Speichern</button><button class="btn ghost" id="veCancel">Abbrechen</button>${st.id?'<button class="btn ghost" id="veDel" style="margin-left:auto;color:#fca5a5">Löschen</button>':''}</div>`;
    const $=x=>document.getElementById(x);
    const keep=()=>{ st.datum=$('veD').value||st.datum; st.art=$('veA').value; st.titel=$('veT').value; st.notiz=$('veN').value;
      E.querySelectorAll('[data-hh]').forEach(x=>{ const v=x.value.replace(',','.'); st.h[+x.dataset.hh].stunden=v===''?null:Math.max(0,Math.min(24,+v)); });
      E.querySelectorAll('[data-hs]').forEach(x=>{ st.h[+x.dataset.hs].status=x.value; }); };
    $('veA').onchange=()=>{ keep(); draw(); };
    E.querySelectorAll('[data-hs]').forEach(x=>x.onchange=()=>{ keep(); draw(); });
    E.querySelectorAll('[data-hr]').forEach(b=>b.onclick=()=>{ keep(); const [i,k]=b.dataset.hr.split(':'); const r=st.h[+i].rollen; const j=r.indexOf(k); if(j>=0)r.splice(j,1); else r.push(k); draw(); });
    E.querySelectorAll('[data-hx]').forEach(b=>b.onclick=()=>{ keep(); st.h.splice(+b.dataset.hx,1); draw(); });
    const add=()=>{ keep(); const v=$('veAdd').value.trim(); if(!v)return; const k=TRC.N(v), hit=people.find(p=>TRC.N(p.name)===k)||(people.filter(p=>TRC.N(p.name).includes(k)).length===1?people.find(p=>TRC.N(p.name).includes(k)):null);
      const person=hit?hit.id:'x:'+v.slice(0,100); if(st.h.some(h=>h.person===person))return kToast('Schon eingetragen');
      st.h.push({person,rollen:[],stunden:null,status:st.datum>trToday()?'zugesagt':'geholfen',notiz:''}); draw(); setTimeout(()=>{ const a=document.getElementById('veAdd'); if(a)a.focus(); },50); };
    $('veAddB').onclick=add; $('veAdd').onkeydown=e=>{ if(e.key==='Enter'){ e.preventDefault(); add(); } };
    $('veSug').onclick=()=>{ keep(); const s=vrSuggest(4,st.h.map(h=>h.person)); s.forEach(x=>st.h.push({person:x.p.id,rollen:[],stunden:null,status:'zugesagt',notiz:''})); draw(); kToast(s.length?'✓ '+s.length+' Helfer vorgeschlagen: wer am wenigsten dran war':'Keine weiteren Vorschläge'); };
    $('veCancel').onclick=()=>closeOverlay();
    if($('veDel'))$('veDel').onclick=async()=>{ if(!confirm('Veranstaltung samt Helfern löschen?'))return; const {error}=await SVB.sb.from('events').delete().eq('id',st.id); if(error)return kToast('⚠️ '+error.message); await vrLoadEvents(); closeOverlay(); kToast('Gelöscht'); };
    $('veSave').onclick=async()=>{ keep(); const titel=st.titel.trim()||TRS.EART[st.art]; const b=$('veSave'); b.disabled=true;
      try{ await vrSaveEvent({id:st.id,datum:st.datum,titel,art:st.art,notiz:st.notiz.trim()||null,ersetzen:true,helfer:st.h.map(h=>({person:h.person,rollen:h.rollen,stunden:h.stunden,status:h.status,notiz:h.notiz||null}))});
        closeOverlay(); kToast('✓ '+titel+' gespeichert'); }catch(e){ b.disabled=false; kToast('⚠️ '+e.message); } };
  };
  draw();
}

/* ----- Allzeit & Legenden ----- */
function vrAtName(x){ const p=x.pid&&trP(x.pid); return p?p.name:x.r.name; }
function vrViewAllTime(B){
  if(!VR.atLoaded){ B.innerHTML='<div class="card"><div class="empty">Lade Vereinsstatistik …</div></div>'; vrLoadAllTime(); return; }
  if(!VR.at.length){ B.innerHTML=`<div class="card"><div class="empty">Die Vereinsstatistik ist noch nicht eingelesen.<br><small>Sie kommt automatisch mit dem nächsten Daten-Update von der Vereinsseite (Spielerstatistiken seit 2013/14).</small></div></div>`; return; }
  const {L,rk}=vrRanks(), today=trToday();
  const stand=VR.at.reduce((a,r)=>r.stand&&r.stand>a?r.stand:a,'');
  const active=L.filter(x=>{ const p=x.pid&&trP(x.pid); return p&&p.own&&!p.verzicht&&!p.isJugend; });
  const ms=active.map(x=>({x,p:trP(x.pid),m:TRS.nextMilestones(x.tot).filter(m=>(m.lab==='Spiele'&&m.rest<=10)||(m.lab==='Tore'&&m.rest<=5)||(m.lab==='Vorlagen'&&m.rest<=3))})).filter(o=>o.m.length).sort((a,b)=>a.m[0].rest-b.m[0].rest);
  const legends=L.filter(x=>x.tot.sp>=200||x.tot.tore>=75).sort((a,b)=>b.tot.sp-a.tot.sp);
  const q=TRC.N(VR.atQ||''), key={sp:x=>x.tot.sp,tore:x=>x.tot.tore,vor:x=>x.tot.vor,siege:x=>x.tot.siege,quote:x=>x.tot.sp>=30?x.tot.quote:-1}[VR.atSort];
  const rows=L.filter(x=>!q||TRC.N(vrAtName(x)).includes(q)||TRC.N(x.r.name).includes(q)).sort((a,b)=>key(b)-key(a)||b.tot.sp-a.tot.sp);
  const status=x=>{ const p=x.pid&&trP(x.pid); if(p&&p.own)return `<span class="trpill ok">aktiv${p.kader===2?' · II':''}</span>`; if(p)return `<span class="trpill mid" title="laut Datenbestand">jetzt ${svEsc(p.club||'')}</span>`; return ''; };
  const th=(k,t)=>`<th><button data-as="${k}" class="${VR.atSort===k?'on':''}">${t}</button></th>`;
  B.innerHTML=`<div class="vrgrid">
      <div class="card"><h3 class="trh">${SVI('trophy')} Meilensteine in Sicht</h3>${ms.length?ms.slice(0,8).map(o=>`<div class="tra l-mittel"><span class="tra-av" data-svp="${svEsc(o.p.id)}">${avaHtml(o.p)}</span><div class="tra-b"><b data-svp="${svEsc(o.p.id)}">${svEsc(o.p.name)}</b><span>${o.m.map(m=>`noch ${m.rest} bis ${m.ziel} ${m.lab}`).join(' · ')}</span></div></div>`).join('')+'<div class="note">Rechtzeitig Ehrung vorbereiten: Stadionsprecher, Social-Media-Post, Erinnerungstrikot, so etwas bindet.</div>':'<div class="note">Gerade niemand kurz vor einem runden Jubiläum.</div>'}</div>
      <div class="card"><h3 class="trh">${SVI('star')} Vereinslegenden <small>(200+ Spiele oder 75+ Tore)</small></h3><div class="vrchips">${legends.map(x=>`<span ${x.pid?`data-svp="${svEsc(x.pid)}"`:''}>${svEsc(vrAtName(x))} <small>${x.tot.sp} Sp. · ${x.tot.tore} T.</small></span>`).join('')||'<span class="note">–</span>'}</div>
        </div>
    </div>
    <div class="card"><div class="vrat-h"><h3 class="trh" style="margin:0">${SVI('chart')} Ewige Liste seit 2013/14</h3><input class="search" id="vrAtQ" type="search" placeholder="Name suchen …" value="${svEsc(VR.atQ)}"></div>
      <div class="trtw"><table class="trtab vrat"><thead><tr><th>#</th><th>Spieler</th>${th('sp','Spiele')}${th('tore','Tore')}${th('vor','Vorl.')}${th('siege','Siege')}${th('quote','Quote')}<th>Abzeichen</th></tr></thead><tbody>
      ${rows.slice(0,VR.atShow).map((x,i)=>{ const b=TRS.badges(x.tot,rk.get(x.r.key)); return `<tr ${x.pid?`data-svp="${svEsc(x.pid)}"`:''}><td>${i+1}</td><td><b>${svEsc(vrAtName(x))}</b> ${status(x)}</td><td>${x.tot.sp}${x.tot.sp>x.r.spiele?` <small>+${x.tot.sp-x.r.spiele}</small>`:''}</td><td>${x.tot.tore}</td><td>${x.tot.vor}</td><td>${x.tot.siege}</td><td>${x.tot.quote==null?'–':x.tot.quote+' %'}</td>
        <td>${b.map(y=>`<i class="vrbadge b-${y.k}" title="${svEsc(y.d)}">${svEsc(y.t)}</i>`).join('')}</td></tr>`; }).join('')}</tbody></table></div>
      ${rows.length>VR.atShow?`<button class="btn ghost sm" id="vrAtMore" style="margin-top:8px">Alle ${rows.length} zeigen</button>`:''}
      <div class="note">Quelle: Spielerstatistiken der Vereinsseite (Stand ${stand?TRC.fmt(stand)+stand.slice(0,4):'–'}). „+“ = Pflichtspiele seitdem. Kommen automatisch aus den Spielberichten auf FUSSBALL.DE (inkl. Pokal) oder aus „Spiel erfassen“.</div></div>`;
  B.querySelectorAll('[data-as]').forEach(b=>b.onclick=()=>{ VR.atSort=b.dataset.as; vrViewAllTime(B); });
  B.querySelectorAll('[data-svp]').forEach(x=>x.onclick=()=>openModal(x.dataset.svp));
  const qi=document.getElementById('vrAtQ'); let t=null; qi.oninput=()=>{ clearTimeout(t); t=setTimeout(()=>{ VR.atQ=qi.value; const pos=qi.selectionStart; vrViewAllTime(B); const n=document.getElementById('vrAtQ'); n.focus(); try{n.setSelectionRange(pos,pos);}catch(e){} },250); };
  const mo=document.getElementById('vrAtMore'); if(mo)mo.onclick=()=>{ VR.atShow=5000; vrViewAllTime(B); };
}

/* ---------- Spielerprofil: Scores, Allzeit, Moneyball, Formkurve ---------- */
function vrProfile(pid){
  const M=document.getElementById('modal'), p=trP(pid); if(!M||!p||M.querySelector('.vrprof'))return;
  const anchor=M.querySelector('.trprof')||M.querySelector('.sbwrap')||M.querySelector('.svpos-box')||M.querySelector('.mhead'); if(!anchor)return;
  const team=canTraining(), {row,ms,tot}=vrTotals(pid);
  const el=document.createElement('div'); el.className='card vrprof';
  let h='';
  if(p.own&&team){ const {ts,ls,rt}=vrScores(p);
    h+=`<div class="vrsc3"><button data-pwhy><span>Trainings-Score</span><b class="${vrCls(ts.score)}">${ts.score==null?'–':ts.score}</b></button><button data-pwhy><span>Loyalität</span><b class="${vrCls(ls.score)}">${ls.score}</b></button>${rt.lvl?`<button data-pwhy class="warn"><span>Bindungsrisiko</span><b class="bad">${rt.lvl}</b></button>`:''}</div>`;
    const hs=VR.ev.filter(e=>(e.h||[]).some(x=>x[0]===pid&&x[3]==='geholfen')).slice(0,5);
    if(hs.length)h+=`<div class="trabs"><span>Zuletzt geholfen:</span> ${hs.map(e=>`<i>${svEsc(e.t)} ${TRC.fmt(e.d)}${e.d.slice(2,4)}</i>`).join('')}</div>`; }
  if(row||(ms&&ms.sp)){ const b=TRS.badges(tot,row?vrRanks().rk.get(row.key):null), nx=TRS.nextMilestones(tot)[0];
    h+=`<div class="trkpi vrkpi"><div><b>${tot.sp}</b><span>Pflichtspiele ${row?'laut Vereinsseite seit 13/14'+(row.stand?' (Stand '+TRC.fmt(row.stand)+row.stand.slice(2,4)+')':'')+(ms&&ms.sp?' + App':''):'in der App erfasst'}</span></div><div><b>${tot.tore}</b><span>Tore</span></div><div><b>${tot.vor}</b><span>Vorlagen</span></div><div><b>${tot.quote==null?'–':tot.quote+' %'}</b><span>Siegquote</span></div></div>
      ${b.length?`<div class="vrbadges">${b.map(y=>`<i class="vrbadge b-${y.k}" title="${svEsc(y.d)}">${svEsc(y.t)}</i>`).join('')}</div>`:''}
      ${nx&&p.own?`<div class="note">Nächster Meilenstein: ${nx.ziel} ${nx.lab} · noch ${nx.rest}.</div>`:''}`; }
  if(p.own&&team&&TR.loaded){ const ww=TRS.withWithout(TR.st,pid);
    if(ms&&ms.sp)h+=`<div class="trabs"><span>Saison 26/27 (App):</span><i>${ms.sp} Spiele (${ms.start}× Startelf)</i><i>${ms.tore} Tore</i><i>${ms.vor} Vorlagen</i></div>`;
    if(ww.delta!=null)h+=`<div class="vrmb ${ww.delta>=0.5?'ok':ww.delta<=-0.5?'bad':''}"><b>Moneyball · Mit/Ohne</b><span>Mit ihm in der Startelf ${ww.with.ppg.toFixed(2)} Punkte/Spiel (${ww.with.n} Sp., ${ww.with.ga.toFixed(1)} Gegentore) · ohne ihn ${ww.without.ppg.toFixed(2)} (${ww.without.n} Sp., ${ww.without.ga.toFixed(1)} Gegentore)</span></div>`; }
  if(p.own&&team&&!row&&VR.at.length){ const free=VR.at.filter(r=>!vrIdx().used.has(r.key)).sort((a,b)=>a.name.localeCompare(b.name,'de'));
    h+=`<div class="vrmap"><label>In der Vereinsstatistik unter anderem Namen?</label><select id="vrMap"><option value="">– zuordnen –</option>${free.map(r=>`<option value="${svEsc(r.key)}">${svEsc(r.name)} (${r.spiele} Sp.)</option>`).join('')}</select></div>`; }
  if(!p.own&&canScout()){ const rd=VR.radar.filter(r=>r.player_id===pid).slice(0,4);
    h+=`<div class="vrform" id="vrForm"><span class="note">Formkurve wird geladen …</span></div>${rd.map(r=>`<div class="tra l-${r.lvl}"><span class="tra-av team">${SVI('radar')}</span><div class="tra-b"><b>${svEsc(r.titel)}</b><span>${svEsc(r.detail||'')} · ${TRC.fmt(r.stand)}</span></div></div>`).join('')}`; }
  if(!h)return;
  el.innerHTML=`<h3 class="trh">${SVI('trophy')} ${p.own?'Vereinswerte':'Radar & Form'}</h3>${h}`;
  anchor.after(el);
  el.querySelectorAll('[data-pwhy]').forEach(b=>b.onclick=()=>vrWhy(pid));
  const mp=el.querySelector('#vrMap'); if(mp)mp.onchange=()=>{ if(!mp.value)return; crmSet(pid,{at:mp.value}); try{crmApply();}catch(e){} VR._idx=null; kToast('✓ Zugeordnet: gilt fürs ganze Team'); openModal(pid); };
  const fm=el.querySelector('#vrForm'); if(fm)vrFormCurve(pid,fm);
}
async function vrFormCurve(pid,box){
  try{ const {data,error}=await SVB.sb.rpc('scorer_history',{p_player:pid}); if(error)throw error; const H=data||[];
    if(H.length<2){ box.innerHTML='<span class="note">Formkurve: sammelt sich ab jetzt mit jedem Daten-Update (montags & donnerstags).</span>'; return; }
    const pts=[]; for(let i=1;i<H.length;i++){ const dg=H[i][1]-H[i-1][1], dsp=(H[i][2]||0)-(H[i-1][2]||0); if(dsp>0||dg>0)pts.push({d:H[i][0],g:Math.max(0,dg)}); }
    const mx=Math.max(1,...pts.map(x=>x.g)), w=260, hgt=44, bw=w/Math.max(1,pts.length);
    box.innerHTML=`<div class="note" style="margin:0 0 4px">Tore je Update-Zeitraum (${pts.length} Zeiträume · aktuell ${H[H.length-1][1]} Tore)</div><svg class="trspark" viewBox="0 0 ${w} ${hgt+12}" preserveAspectRatio="none">${pts.map((x,i)=>`<rect x="${i*bw+2}" y="${hgt-(x.g/mx)*hgt}" width="${bw-4}" height="${Math.max(2,(x.g/mx)*hgt)}" rx="3" class="${x.g?'ok':'na'}"><title>bis ${TRC.fmt(x.d)}: ${x.g} Tore</title></rect>`).join('')}</svg>`;
  }catch(e){ box.innerHTML=''; }
}
{ const _om5=openModal; openModal=function(){ const r=_om5.apply(this,arguments); try{ vrProfile(arguments[0]); }catch(e){ console.warn('Vereinswerte',e); } return r; }; }
Object.assign(SV_FIELD,{at:'Allzeit-Zuordnung'});

/* ---------- Radar-Seite ---------- */
const RD_TYP={serie:'Torserie',lauf:'Heißer Lauf',quote:'Überflieger',jung:'Junges Talent',merk:'Merkliste trifft',team:'Unser Team',neu:'Neu im Radar'};
function rdSeen(){ try{ return localStorage.getItem('svbc-radar-seen')||''; }catch(e){ return ''; } }
function rdMarkSeen(){ try{ localStorage.setItem('svbc-radar-seen',new Date().toISOString()); }catch(e){} vrBadge(); }
function vrBadge(){ const s=rdSeen(), n=canScout()?VR.radar.filter(r=>r.created_at>s&&r.lvl!=='info').length:0; document.querySelectorAll('[data-cnt="radar"]').forEach(el=>{ el.textContent=n; el.style.display=n?'':'none'; }); }
function rdChances(){
  const own=p=>p.own, L=players.filter(p=>svScoutInScope(p)&&!own(p)&&p.cur&&p.cur.spiele>=3);
  const age=p=>p.alter!=null&&!p.alterCa?p.alter:null;
  const young=L.filter(p=>age(p)!=null&&age(p)<=21&&p.cur.tore>=3).sort((a,b)=>b.cur.tore/b.cur.spiele-a.cur.tore/a.cur.spiele).slice(0,10)
    .map(p=>({p,t:`${p.name} (${age(p)}) · ${p.cur.tore} Tore in ${p.cur.spiele} Spielen`,d:`${p.cur.club} · ${p.cur.sub||p.cur.liga}`}));
  const carry=L.filter(p=>p.cur.tT>0&&p.cur.tore>=4&&p.cur.tore/p.cur.tT>=0.35&&p.cur.rank&&p.cur.teamCount&&p.cur.rank>p.cur.teamCount/2).sort((a,b)=>b.cur.tore/b.cur.tT-a.cur.tore/a.cur.tT).slice(0,10)
    .map(p=>({p,t:`${p.name} · ${Math.round(p.cur.tore/p.cur.tT*100)} % der Tore seines Teams`,d:`${p.cur.tore} von ${p.cur.tT} Toren · ${p.cur.club} (Platz ${p.cur.rank}/${p.cur.teamCount}, ${p.cur.sub||p.cur.liga})`}));
  const low=L.filter(p=>['C','D1','D2','D'].includes(p.cur.sub||p.cur.liga)&&p.cur.spiele>=4&&p.cur.tore/p.cur.spiele>=1).sort((a,b)=>b.cur.tore/b.cur.spiele-a.cur.tore/a.cur.spiele).slice(0,10)
    .map(p=>({p,t:`${p.name} · ${(p.cur.tore/p.cur.spiele).toFixed(1)} Tore pro Spiel`,d:`${p.cur.tore} Tore · ${p.cur.club} (${p.cur.sub||p.cur.liga})${age(p)!=null?' · '+age(p)+' J.':''}`}));
  return {young,carry,low};
}
function rdItem(r){
  const p=r.player_id&&trP(r.player_id), star=p&&p.star;
  return `<div class="tra l-${r.lvl} rdit"><span class="tra-av ${p?'':'team'}" ${p?`data-svp="${svEsc(p.id)}"`:''}>${p?avaHtml(p):SVI(r.typ==='team'?'shield':'radar')}</span>
    <div class="tra-b"><b ${p?`data-svp="${svEsc(p.id)}"`:''}>${svEsc(r.titel)}</b><span>${svEsc(r.detail||'')}</span><small class="rdmeta">${svEsc(RD_TYP[r.typ]||r.typ)} · ${TRC.fmt(r.stand)}${r.stand.slice(2,4)}${r.created_at>rdSeen()?' · <i class="rdnew">neu</i>':''}</small></div>
    ${p&&!p.own?`<button class="iconbtn rdstar${star?' on':''}" data-star="${svEsc(p.id)}" title="${star?'Auf der Merkliste':'Auf die Merkliste'}">${SVI('star')}</button>`:''}</div>`;
}
function rdRender(){
  const P=document.getElementById('panel-radar'); if(!P)return;
  if(!canScout()){ P.innerHTML='<div class="card"><div class="empty">Das Radar sehen nur Trainer, Kaderplaner und Vorstand.</div></div>'; return; }
  if(!VR.radarLoaded){ P.innerHTML='<div class="card"><div class="empty">Lade Radar …</div></div>'; vrLoadRadar(); return; }
  const F=VR.rf, R=VR.radar.filter(r=>F==='alle'||r.typ===F||(F==='chancen'&&false));
  const ch=rdChances(), tf=TR.loaded?TRS.teamForm(TR.st):null;
  const types=[['alle','Alle'],['serie','Torserien'],['lauf','Heiße Läufe'],['quote','Überflieger'],['jung','Junge'],['merk','Merkliste'],['team','Unser Team'],['chancen','Moneyball-Chancen']];
  const newN=VR.radar.filter(r=>r.created_at>rdSeen()).length;
  const sec=(t,L,why)=>L.length?`<div class="card"><h3 class="trh">${t}</h3>${why?`<div class="note" style="margin-top:0">${why}</div>`:''}${L.map(x=>`<div class="tra l-info rdit"><span class="tra-av" data-svp="${svEsc(x.p.id)}">${avaHtml(x.p)}</span><div class="tra-b"><b data-svp="${svEsc(x.p.id)}">${svEsc(x.t)}</b><span>${svEsc(x.d)}</span></div><button class="iconbtn rdstar${x.p.star?' on':''}" data-star="${svEsc(x.p.id)}" title="Merkliste">${SVI('star')}</button></div>`).join('')}</div>`:'';
  P.innerHTML=`<div class="tiles trtiles">
      <div class="tile"><div class="v ${newN?'ok':''}">${newN}</div><div class="l">neue Meldungen</div><div class="s">seit deinem letzten Blick</div></div>
      <div class="tile"><div class="v">${VR.radar.filter(r=>r.typ==='serie').length}</div><div class="l">Torserien erkannt</div><div class="s">3+ Spieltage in Folge getroffen</div></div>
      ${tf&&tf.n?`<div class="tile"><div class="v">${tf.res.slice(0,5).join(' ')}</div><div class="l">Unsere Form</div><div class="s">${tf.ppg.toFixed(2)} Punkte/Spiel · ${tf.tf}:${tf.ta} Tore</div></div>`:''}</div>
    <div class="trtabs rdf">${types.map(([k,t])=>`<button class="${F===k?'on':''}" data-rf="${k}">${t}</button>`).join('')}</div>
    ${F==='chancen'?sec(`${SVI('sprout')} Junge Torjäger (≤ 21)`,ch.young,'Aus den aktuellen Torjägerlisten. Alter, soweit bekannt.')+sec(`${SVI('gem')} Trägt sein Team`,ch.carry,'Schießt einen Großteil der Tore einer Mannschaft aus der unteren Tabellenhälfte, oft wechselbereit.')+sec(`${SVI('chart')} Knipser in C- und D-Liga`,ch.low,'Mindestens ein Tor pro Spiel. Wer schafft den Sprung eine oder zwei Ligen höher?')
      :`<div class="card">${R.length?R.slice(0,150).map(rdItem).join(''):`<div class="empty">Noch keine Meldungen${F!=='alle'?' in dieser Kategorie':''}.<br><small>Das Radar vergleicht bei jedem Daten-Update (montags & donnerstags früh) die Torjägerlisten aller 7 Ligen mit dem letzten Stand. Torserien werden erkannt, sobald drei Spieltage vorliegen. Sofort nutzbar: „Moneyball-Chancen“.</small></div>`}</div>`}
    <div class="note">Meldungen gehen auch als Push-Nachricht an alle mit aktivierten Mitteilungen. Quelle: Torjägerlisten &amp; Tabellen von FUSSBALL.DE.</div>`;
  P.querySelectorAll('[data-rf]').forEach(b=>b.onclick=()=>{ VR.rf=b.dataset.rf; rdRender(); });
  P.querySelectorAll('[data-svp]').forEach(x=>x.onclick=()=>openModal(x.dataset.svp));
  P.querySelectorAll('[data-star]').forEach(b=>b.onclick=e=>{ e.stopPropagation(); const p=trP(b.dataset.star); if(!p)return; const on=!p.star; crmSet(p.id,{f:on?1:undefined}); try{crmApply();}catch(x){} try{renderAll();}catch(x){} kToast(on?'⭐ '+p.name+' auf der Merkliste: das Radar meldet jedes Tor':'Von der Merkliste genommen'); rdRender(); });
  setTimeout(rdMarkSeen,1500);
}

/* ---------- Ehrungen: erscheinen 3 Spiele vorher und 1 Spiel vorher nochmal, auch wenn sie weggewischt wurden ---------- */
function vrMsStufe(m){ return !m?0:m.rest<=1?1:m.rest<=3?3:0; }
function vrMsKey(pid,m){ return pid+'|'+m.lab+'|'+m.ziel+'|'+vrMsStufe(m); }
function vrMsHideList(){ try{ const H=JSON.parse(localStorage.getItem('svMsHide')||'[]'); return Array.isArray(H)?H:[]; }catch(e){ return []; } }
function vrMsHidden(k){ return vrMsHideList().includes(k); }
function vrMsHide(k,undo){ try{ const H=vrMsHideList().filter(x=>x!==k); if(!undo)H.push(k); localStorage.setItem('svMsHide',JSON.stringify(H.slice(-300))); }catch(e){} }
function vrMsDue(tot,pid){ return TRS.nextMilestones(tot).filter(m=>(m.lab==='Spiele'||m.lab==='Tore')&&vrMsStufe(m)).map(m=>Object.assign({},m,{key:vrMsKey(pid,m)})).filter(m=>!vrMsHidden(m.key)); }
function vrMsText(m){ return vrMsStufe(m)===1?(m.lab==='Spiele'?'Das nächste Spiel ist das Jubiläum. Ehrung steht?':'Beim nächsten Tor ist es so weit. Ehrung steht?'):'Ehrung vorbereiten? Kommt 1 Spiel vorher nochmal.'; }

/* ---------- Übersicht: Radar & Verein ---------- */
function vrHomeCard(){
  const host=document.getElementById('trHome')||document.getElementById('svRemind')||document.getElementById('svHello'); if(!host||!canScout())return;
  let el=document.getElementById('vrHome'); if(!el){ el=document.createElement('div'); el.id='vrHome'; host.after(el); }
  const week=TRC.addDays(trToday(),-8), R=VR.radar.filter(r=>r.stand>=week&&r.lvl!=='info'&&!(r.player_id&&typeof sc2No==='function'&&sc2No(r.player_id))).slice(0,3);   // „Kein Interesse“ taucht hier nicht mehr auf
  let ms=[]; if(VR.at.length){ try{ ms=vrRanks().L.filter(x=>{ const p=x.pid&&trP(x.pid); return p&&p.own&&!p.verzicht; }).map(x=>({p:trP(x.pid),m:vrMsDue(x.tot,x.pid)[0]})).filter(o=>o.m).sort((a,b)=>a.m.rest-b.m.rest).slice(0,3); }catch(e){} }
  const tf=TR.loaded?TRS.teamForm(TR.st):null;
  if(!R.length&&!ms.length&&!(tf&&tf.n)){ el.innerHTML=''; el.__h=''; return; }
  const html=`<div class="card trhome"><div class="rm-h"><div class="rm-ic co">${SVI('radar')}</div><div class="rm-t"><h3>Radar &amp; Verein</h3><p>${tf&&tf.n?`Form: <b>${tf.res.slice(0,5).join(' ')}</b>${tf.clean>=2?` · ${tf.clean} Spiele zu Null`:''}${tf.wins>=3?` · ${tf.wins} Siege in Folge`:''}`:'Was sich in der Region tut'}</p></div>
    <button class="btn sm" data-home-radar>${SVI('radar')} Radar</button></div>
    ${R.map(rdItem).join('')}${ms.map(o=>`<div class="tra l-mittel vrms" data-ms="${svEsc(o.m.key)}"><span class="tra-av" data-svp="${svEsc(o.p.id)}">${avaHtml(o.p)}</span><div class="tra-b"><b data-svp="${svEsc(o.p.id)}">🎉 ${svEsc(o.p.name)}: noch ${o.m.rest} bis ${o.m.ziel} ${o.m.lab}</b><span>${vrMsText(o.m)}</span></div></div>`).join('')}
    <div class="rm-f"><button class="btn ghost" data-home-verein>Rankings &amp; Verein →</button></div></div>`;
  // während einer Wischgeste auf der Karte nicht neu zeichnen (sonst reißt die Geste ab), danach nachholen
  if(typeof SW45!=='undefined'&&SW45.on&&SW45.on.el&&el.contains(SW45.on.el)){ clearTimeout(el.__t); el.__t=setTimeout(()=>{ try{ vrHomeCard(); }catch(e){} },700); return; }
  el.__h=html; el.innerHTML=html;
  el.querySelector('[data-home-radar]').onclick=()=>goTab('radar');
  el.querySelector('[data-home-verein]').onclick=()=>goTab('verein');
  el.querySelectorAll('[data-svp]').forEach(x=>x.onclick=()=>openModal(x.dataset.svp));
  el.querySelectorAll('[data-star]').forEach(b=>b.style.display='none');
  try{ if(typeof sc2Wire==='function')sc2Wire(el); }catch(e){}
}

/* ---------- Import: Excel/CSV oder Einfügen (Trainingslisten, Helferlisten, Verletzungen) ---------- */
function vrXlsx(){ if(window.XLSX)return Promise.resolve(window.XLSX); return new Promise((res,rej)=>{ const s=document.createElement('script'); s.src='vendor/xlsx.mini.min.js?v='+encodeURIComponent((window.SVBC_CFG&&SVBC_CFG.build)||''); s.onload=()=>res(window.XLSX); s.onerror=()=>rej(new Error('Excel-Modul konnte nicht geladen werden')); document.head.appendChild(s); }); }
function vrCSV(text){
  const first=(text.split(/\r?\n/).find(l=>l.trim())||'');
  const d=['\t',';',','].map(c=>[c,first.split(c).length]).sort((a,b)=>b[1]-a[1])[0][0];
  const rows=[]; let row=[], cell='', q=false;
  for(let i=0;i<text.length;i++){ const c=text[i];
    if(q){ if(c==='"'){ if(text[i+1]==='"'){ cell+='"'; i++; } else q=false; } else cell+=c; continue; }
    if(c==='"'&&cell==='')q=true; else if(c===d){ row.push(cell); cell=''; } else if(c==='\n'){ row.push(cell.replace(/\r$/,'')); rows.push(row); row=[]; cell=''; } else cell+=c; }
  if(cell!==''||row.length){ row.push(cell.replace(/\r$/,'')); rows.push(row); }
  return rows.filter(r=>r.some(x=>String(x).trim()));
}
function vrDateCell(v){
  if(v instanceof Date&&!isNaN(v)){ const t=v.getTime()-v.getTimezoneOffset()*60000; return new Date(t+43200000).toISOString().slice(0,10); }
  if(typeof v==='number'&&v>20000&&v<80000)return new Date(Date.UTC(1899,11,30)+Math.round(v)*864e5).toISOString().slice(0,10);
  const s=String(v==null?'':v).trim(); let m;
  if((m=s.match(/^(\d{4})-(\d{1,2})-(\d{1,2})/)))return `${m[1]}-${m[2].padStart(2,'0')}-${m[3].padStart(2,'0')}`;
  if((m=s.match(/^(?:[A-Za-zÄÖÜäöü]{2,3}\.?,?\s*)?(\d{1,2})\.(\d{1,2})\.(\d{2,4})\b/))){ const y=m[3].length===2?'20'+m[3]:m[3]; return `${y}-${m[2].padStart(2,'0')}-${m[1].padStart(2,'0')}`; }
  if((m=s.match(/^(\d{1,2})\/(\d{1,2})\/(\d{2,4})$/))){ const y=m[3].length===2?'20'+m[3]:m[3]; return `${y}-${m[1].padStart(2,'0')}-${m[2].padStart(2,'0')}`; }
  if((m=s.match(/^(?:[A-Za-zÄÖÜäöü]{2,3}\.?,?\s*)?(\d{1,2})\.(\d{1,2})\.?$/)))return '????-'+m[2].padStart(2,'0')+'-'+m[1].padStart(2,'0');
  return null;
}
function vrFixYears(ds){ // „12.09.“ ohne Jahr: rückwärts ab heute, Spalten chronologisch angenommen
  if(!ds.some(d=>d&&d.startsWith('????')))return ds;
  let y=+trToday().slice(0,4); const out=ds.slice(); let next=null;
  for(let i=ds.length-1;i>=0;i--){ const d=ds[i]; if(!d||!d.startsWith('????'))continue; const md=d.slice(5);
    if(next==null){ if(`${y}-${md}`>TRC.addDays(trToday(),7))y--; } else if(md>next)y--;
    out[i]=`${y}-${md}`; next=md; }
  return out;
}
const VR_CODES=[['da',/^(x|✓|✔|✅|1|ja|j|da|anw|anwesend|\+|dabei|tr)$/],['spaet',/^(sp|spaet|spät|zs|zu spät|zu spaet|verspätet|verspaetet)$/],['verletzt',/^(v|verl|verletzt|vl)$|verletz/],
  ['krank',/^(k|kr|krank)$|krank|grippe/],['urlaub',/^(ur|url|urlaub)$|urlaub/],['arbeit',/^(ar|arb|arbeit|schicht|a)$|arbeit|schicht/],['uni',/^(s|sch|schule|uni|studium|klausur)$|schule|uni|klausur/],
  ['zweite',/^(z|2|ii|zweite|res|reserve)$|zweite/],['familie',/^(fam|familie)$|famil|hochzeit|geburtstag/],['privat',/^(e|ent|entsch|entschuldigt|p|priv|privat)$|entschuld|privat/],
  ['ohne',/^(u|ue|unent|unentschuldigt|0|-|f|fehlt|n|nein|o|ohne|nicht da)$|unentsch|ohne grund/]];
function vrGuessCode(v){ const s=TRC.N(String(v).trim()); if(!s)return ''; for(const [k,rx] of VR_CODES){ if(rx.test(s))return k; } return '?'; }
const VR_CODE_OPTS=[['','nicht erfasst (überspringen)'],['da','Da'],['spaet','Zu spät'],...Object.entries(TRC.REASONS).map(([k,t])=>[k,'Fehlt · '+t])];
function vrMatchName(raw,people){
  const s=String(raw||'').trim(); if(!s||s.length<2)return null;
  const n=TRC.N(s).replace(/\s+/g,' '), sw=n.includes(',')?n.split(',').map(x=>x.trim()).reverse().join(' '):n;
  const full=people.find(p=>TRC.N(p.name)===sw||TRC.N(p.name)===n); if(full)return full.id;
  const idx=TRC.nameIndex(people), hits=TRC.findPlayers(sw.replace(/[^a-z0-9 ]/g,' '),idx); if(hits.length===1)return hits[0].id;
  const w=sw.split(' '); if(w.length===2&&w[1].length<=2){ const c=people.filter(p=>{ const q=TRC.N(p.name).split(' '); return q[0]===w[0]&&q[q.length-1].startsWith(w[1].replace('.','')); }); if(c.length===1)return c[0].id; }
  return null;
}
function vrImport(kind0,file0){
  const people=vrPeople().concat((DATA&&DATA.jugend||[]).filter(j=>j.id&&j.name).map(j=>({id:j.id,name:j.name}))).filter((p,i,a)=>a.findIndex(q=>q.id===p.id)===i);
  const S={kind:kind0||'training',rows:null,sheets:null,sheet:null,wb:null,hdr:0,nameCol:null,layout:null,map:{},codes:{},cols:{},busy:false,fileName:''};
  svModal(`<div class="mhead"><div class="rm-ic" style="width:46px;height:46px">${SVI('upload')}</div><div><h2 style="margin:0">Listen importieren</h2><div class="msub">Excel, CSV oder einfach Zellen aus Excel/Google Sheets einfügen</div></div></div><div id="vrIm"></div>`);
  const $=x=>document.getElementById(x);
  const load=async(file,text)=>{
    try{ if(file&&/\.(xlsx|xlsm|xlsb)$/i.test(file.name)){ const X=await vrXlsx(); const wb=X.read(await file.arrayBuffer(),{type:'array',cellDates:true}); S.wb=wb; S.sheets=wb.SheetNames; S.sheet=wb.SheetNames[0]; S.rows=X.utils.sheet_to_json(wb.Sheets[S.sheet],{header:1,raw:true,defval:''}); }
      else if(file){ S.rows=vrCSV(await file.text()); }
      else S.rows=vrCSV(text);
      S.fileName=file?file.name:'eingefügt'; analyse(); draw(); }catch(e){ kToast('⚠️ '+(e.message||e)); } };
  const analyse=(forceHdr)=>{
    const R=S.rows||[]; S.map={}; S.codes={}; S.cols={};
    // Kopfzeile = erste Zeile mit ≥ 2 Datumszellen oder mit bekannten Spaltennamen
    let hdr=0; for(let i=0;i<Math.min(15,R.length);i++){ const r=R[i]; const nd=r.filter(v=>vrDateCell(v)).length; const kw=r.filter(v=>/name|spieler|datum|helfer|veranstaltung|diagnose/i.test(String(v))).length; if(nd>=2||kw>=1){ hdr=i; break; } }
    if(forceHdr!=null)hdr=forceHdr; S.hdr=hdr; const H=R[hdr]||[];
    const dcols=H.map((v,i)=>vrDateCell(v)?i:-1).filter(i=>i>=0);
    const body=R.slice(hdr+1);
    // Namensspalte: meiste Treffer im Kader
    let best=-1, bs=-1; const ncol=Math.max(...R.slice(0,60).map(r=>r.length),0);
    for(let c=0;c<ncol;c++){ if(dcols.includes(c))continue; const sc=body.slice(0,80).filter(r=>vrMatchName(r[c],people)).length; if(sc>bs){ bs=sc; best=c; } }
    S.nameCol=best;
    const find=rx=>H.findIndex(v=>rx.test(TRC.N(String(v))));
    if(S.kind==='training'&&dcols.length>=2){ S.layout='matrix'; const ds=vrFixYears(dcols.map(c=>vrDateCell(H[c]))); S.cols.dates=dcols.map((c,i)=>({c,d:ds[i]})).filter(x=>x.d&&!x.d.startsWith('?'));
      const vals={}; body.forEach(r=>S.cols.dates.forEach(x=>{ const v=String(r[x.c]==null?'':r[x.c]).trim(); if(v)vals[v]=(vals[v]||0)+1; })); S.codes=Object.fromEntries(Object.keys(vals).sort((a,b)=>vals[b]-vals[a]).map(v=>[v,{n:vals[v],to:vrGuessCode(v)}])); }
    else if(S.kind==='training'){ S.layout='lang'; S.cols={datum:find(/datum|date|tag/),status:find(/status|anwesen|grund|da\b|bemerk/),motivation:find(/motiv|einsatz|lust/),notiz:find(/notiz|bemerkung|kommentar/)};
      const vals={}; if(S.cols.status>=0)body.forEach(r=>{ const v=String(r[S.cols.status]||'').trim(); if(v)vals[v]=(vals[v]||0)+1; }); S.codes=Object.fromEntries(Object.keys(vals).map(v=>[v,{n:vals[v],to:vrGuessCode(v)}])); }
    else if(S.kind==='helfer'&&dcols.length>=1&&find(/veranstaltung|event|anlass/)<0){ S.layout='matrix'; S.cols.events=dcols.map(c=>({c,d:vrFixYears([vrDateCell(H[c])])[0],t:String(H[c]).replace(/\d{1,2}\.\d{1,2}\.(\d{2,4})?/,'').replace(/[()]/g,'').trim()})); }
    else if(S.kind==='helfer'){ S.layout='lang'; S.cols={datum:find(/datum|date|tag/),titel:find(/veranstaltung|event|anlass|fest|titel/),aufgabe:find(/aufgabe|rolle|taetig|dienst|einsatz/),stunden:find(/stunden|std|dauer|zeit/),status:find(/status|erschienen/)}; }
    else { S.layout='lang'; S.cols={diagnose:find(/diagnose|verletzung|beschwerde/),von:find(/von|beginn|seit|start|datum/),bis:find(/bis|zurueck|ende|wieder/),prognose:find(/prognose|voraus/)}; }
    // Namen zuordnen
    const names=new Set(); body.forEach(r=>{ const v=String(r[S.nameCol]==null?'':r[S.nameCol]).trim(); if(!v)return; (S.kind==='helfer'?v.split(/,|;|\/|\bund\b|&/):[v]).map(x=>x.trim()).filter(x=>x.length>1).forEach(x=>names.add(x)); });
    names.forEach(n=>{ S.map[n]=vrMatchName(n,people)||(S.kind==='helfer'?'x:'+n:''); });
  };
  const plan=()=>{ // was würde importiert?
    const R=(S.rows||[]).slice(S.hdr+1), out=[]; const pid=v=>{ const k=String(v==null?'':v).trim(); return k?S.map[k]:null; };
    if(S.kind==='training'&&S.layout==='matrix'){ const by={}; R.forEach(r=>{ const p=pid(r[S.nameCol]); if(!p||p.startsWith('x:'))return; S.cols.dates.forEach(x=>{ const v=String(r[x.c]==null?'':r[x.c]).trim(); const to=v&&S.codes[v]?S.codes[v].to:''; if(!to||to==='?')return;
        (by[x.d]=by[x.d]||[]).push(to==='da'||to==='spaet'?{player_id:p,status:to}:{player_id:p,status:'weg',grund:to}); }); }); Object.keys(by).sort().forEach(d=>out.push({datum:d,spieler:by[d]})); }
    else if(S.kind==='training'){ const by={}; R.forEach(r=>{ const p=pid(r[S.nameCol]), d=vrDateCell(r[S.cols.datum]); if(!p||p.startsWith('x:')||!d||d.startsWith('?'))return; const v=S.cols.status>=0?String(r[S.cols.status]||'').trim():'x'; const to=S.cols.status>=0?(S.codes[v]&&S.codes[v].to):'da'; if(!to||to==='?')return;
        const o=to==='da'||to==='spaet'?{player_id:p,status:to}:{player_id:p,status:'weg',grund:to}; const mo=S.cols.motivation>=0?+r[S.cols.motivation]:0; if(mo>=1&&mo<=5)o.motivation=Math.round(mo); if(S.cols.notiz>=0&&String(r[S.cols.notiz]).trim())o.notiz=String(r[S.cols.notiz]).trim().slice(0,500);
        (by[d]=by[d]||[]).push(o); }); Object.keys(by).sort().forEach(d=>out.push({datum:d,spieler:by[d]})); }
    else if(S.kind==='helfer'&&S.layout==='matrix'){ S.cols.events.forEach(ev=>{ if(!ev.d||ev.d.startsWith('?'))return; const helfer=[]; R.forEach(r=>{ const p=pid(r[S.nameCol]); const v=String(r[ev.c]==null?'':r[ev.c]).trim(); if(!p||!v)return; const h=parseFloat(v.replace(',','.'));
        helfer.push({person:p,rollen:TRS.roleOf(v),stunden:isNaN(h)?null:Math.min(24,h),status:/nicht|nein|^n$|fehlt/i.test(v)?'nicht_erschienen':'geholfen'}); });
        const titel=ev.t||'Veranstaltung'; if(helfer.length)out.push({datum:ev.d,titel,art:TRS.eventArt(titel),helfer}); }); }
    else if(S.kind==='helfer'){ const by={}; R.forEach(r=>{ const d=vrDateCell(r[S.cols.datum]); const titel=String(S.cols.titel>=0?r[S.cols.titel]:'').trim()||'Veranstaltung'; if(!d||d.startsWith('?'))return;
        const raw=String(r[S.nameCol]==null?'':r[S.nameCol]); const aufg=S.cols.aufgabe>=0?String(r[S.cols.aufgabe]||''):''; const h=S.cols.stunden>=0?parseFloat(String(r[S.cols.stunden]).replace(',','.')):NaN; const stv=S.cols.status>=0?String(r[S.cols.status]||''):'';
        raw.split(/,|;|\/|\bund\b|&/).map(x=>x.trim()).filter(x=>x.length>1).forEach(n=>{ const p=S.map[n]; if(!p)return; const k=d+'|'+titel; const e=by[k]=by[k]||{datum:d,titel,art:TRS.eventArt(titel+' '+aufg),helfer:[]};
          e.helfer.push({person:p,rollen:TRS.roleOf(aufg),stunden:isNaN(h)?null:Math.min(24,h),status:/nicht erschienen|nicht gekommen|^nein$/i.test(stv)?'nicht_erschienen':/abgesagt/i.test(stv)?'abgesagt':/zugesagt/i.test(stv)?'zugesagt':'geholfen'}); }); });
      Object.values(by).forEach(e=>out.push(e)); }
    else { R.forEach(r=>{ const p=pid(r[S.nameCol]), b=vrDateCell(r[S.cols.von]); if(!p||p.startsWith('x:')||!b||b.startsWith('?'))return; const dg=String(S.cols.diagnose>=0?r[S.cols.diagnose]:'').trim()||'Verletzung';
        const z=S.cols.bis>=0?vrDateCell(r[S.cols.bis]):null, pr=S.cols.prognose>=0?vrDateCell(r[S.cols.prognose]):null;
        out.push({player_id:p,diagnose:dg.slice(0,200),beginn:b,zurueck:z&&z>=b&&!z.startsWith('?')?z:null,prognose:pr&&pr>=b&&!pr.startsWith('?')?pr:null}); }); }
    return out;
  };
  const draw=()=>{
    const E=$('vrIm'); if(!E)return;
    const kinds=[['training','Trainings-Anwesenheit'],['helfer','Helfer & Veranstaltungen'],['verletzung','Verletzungen']];
    let h=`<div class="trtabs sm" style="margin:12px 0">${kinds.map(([k,t])=>`<button class="${S.kind===k?'on':''}" data-ik="${k}">${t}</button>`).join('')}</div>`;
    if(!S.rows){
      h+=`<div class="vrdrop"><label class="btn" for="vrFile">${SVI('upload')} Datei wählen (.xlsx oder .csv)</label><input type="file" id="vrFile" accept=".xlsx,.xlsm,.csv,.txt,.tsv" hidden>
          <div class="note">oder Zellen aus Excel/Google Sheets kopieren und hier einfügen:</div><textarea id="vrPaste" rows="6" placeholder="Name	01.09.	03.09.	05.09.&#10;Tim Fries	x	k	x&#10;…"></textarea><button class="btn ghost sm" id="vrPasteGo">Eingefügtes einlesen</button></div>
        <div class="note">${S.kind==='training'?'Typisch: eine Zeile je Spieler, eine Spalte je Trainingstag (x = da, k = krank, v = verletzt, u = unentschuldigt, e = entschuldigt, ur = Urlaub …). Auch eine lange Liste „Datum | Name | Status“ geht.':S.kind==='helfer'?'Z. B. „Datum | Veranstaltung | Name(n) | Aufgabe | Stunden“. Mehrere Namen in einer Zelle mit Komma trennen. Oder: Zeilen = Helfer, Spalten = Veranstaltungen (Zelle = Stunden oder x).':'Z. B. „Name | Diagnose | von | bis“.'} Die Zuordnung prüfst du im nächsten Schritt.</div>`;
    } else {
      const P=plan(), un=Object.entries(S.map).filter(([,v])=>!v);
      const cnt=S.kind==='training'?`${P.length} Einheiten · ${P.reduce((a,s)=>a+s.spieler.length,0)} Einträge${P.length?` · ${TRC.fmt(P[0].datum)}${P[0].datum.slice(2,4)} · ${TRC.fmt(P[P.length-1].datum)}${P[P.length-1].datum.slice(2,4)}`:''}`
        :S.kind==='helfer'?`${P.length} Veranstaltungen · ${P.reduce((a,e)=>a+e.helfer.length,0)} Helfereinsätze`:`${P.length} Verletzungen`;
      const H=(S.rows[S.hdr]||[]), colOpt=(sel)=>`<option value="-1">–</option>`+H.map((v,i)=>`<option value="${i}"${sel===i?' selected':''}>${svEsc(String(v||'Spalte '+(i+1)).slice(0,30))}</option>`).join('');
      h+=`<div class="vrim-src"><b>${svEsc(S.fileName)}</b> · ${S.rows.length} Zeilen${S.sheets&&S.sheets.length>1?` · Blatt <select id="vrSheet">${S.sheets.map(n=>`<option${n===S.sheet?' selected':''}>${svEsc(n)}</option>`).join('')}</select>`:''} <button class="btn ghost sm" id="vrReset">Andere Datei</button></div>
        <div class="editgrid"><div class="field"><label>Kopfzeile</label><select id="vrHdr">${S.rows.slice(0,15).map((r,i)=>`<option value="${i}"${S.hdr===i?' selected':''}>Zeile ${i+1}: ${svEsc(r.slice(0,4).join(' | ').slice(0,40))}</option>`).join('')}</select></div>
          <div class="field"><label>Spalte mit Namen</label><select id="vrNameCol">${colOpt(S.nameCol)}</select></div>
          ${S.layout==='lang'?Object.entries(S.cols).map(([k,v])=>`<div class="field"><label>Spalte ${svEsc({datum:'Datum',status:'Status/Grund',motivation:'Motivation (1–5)',notiz:'Notiz',titel:'Veranstaltung',aufgabe:'Aufgabe',stunden:'Stunden',diagnose:'Diagnose',von:'Von/Beginn',bis:'Bis/zurück',prognose:'Prognose'}[k]||k)}</label><select data-col="${k}">${colOpt(v)}</select></div>`).join(''):''}</div>
        ${S.layout==='matrix'&&S.kind==='training'?`<div class="note">Erkannt: Tabelle mit ${S.cols.dates.length} Trainingstagen als Spalten.</div>`:''}
        ${Object.keys(S.codes).length?`<div class="sbsec"><h4>Was bedeuten die Einträge?</h4><div class="vrcodes">${Object.entries(S.codes).slice(0,30).map(([v,o])=>`<div class="${o.to==='?'?'warn':''}"><code>${svEsc(v.slice(0,20))}</code><small>${o.n}×</small><select data-code="${svEsc(v)}">${(o.to==='?'?'<option value="?" selected>– bitte wählen –</option>':'')+VR_CODE_OPTS.map(([k,t])=>`<option value="${k}"${o.to===k?' selected':''}>${t}</option>`).join('')}</select></div>`).join('')}</div></div>`:''}
        <div class="sbsec"><h4>Namen <small>${Object.keys(S.map).length-un.length} von ${Object.keys(S.map).length} zugeordnet</small></h4>
          ${un.length?`<div class="vrcodes">${un.map(([n])=>`<div class="warn"><code>${svEsc(n.slice(0,30))}</code><select data-nm="${svEsc(n)}"><option value="">ignorieren</option>${people.map(p=>`<option value="${svEsc(p.id)}">${svEsc(p.name)}</option>`).join('')}${S.kind==='helfer'?`<option value="x:${svEsc(n)}">als Helfer ohne Profil</option>`:''}</select></div>`).join('')}</div>`:'<div class="note">Alle Namen erkannt. 👍</div>'}
          <details class="vrdet"><summary>Zuordnung prüfen (${Object.keys(S.map).length-un.length})</summary>${Object.entries(S.map).filter(([,v])=>v).map(([n,v])=>`<div><code>${svEsc(n)}</code> → ${svEsc(vrPersonName(v))}</div>`).join('')}</details></div>
        <div class="vrim-sum">${SVI('check')} ${cnt}</div>
        <div class="btnrow sbact"><button class="btn" id="vrGo"${P.length&&!S.busy?'':' disabled'}>${S.busy?'Importiere …':'Importieren'}</button><button class="btn ghost" id="vrCancel">Abbrechen</button></div>
        <div class="note">Bereits vorhandene Einträge am selben Tag werden ergänzt bzw. für diese Spieler überschrieben. Nichts wird doppelt angelegt.</div>`;
    }
    E.innerHTML=h;
    E.querySelectorAll('[data-ik]').forEach(b=>b.onclick=()=>{ S.kind=b.dataset.ik; if(S.rows)analyse(); draw(); });
    if($('vrFile'))$('vrFile').onchange=e=>{ const f=e.target.files[0]; if(f)load(f); };
    if($('vrPasteGo'))$('vrPasteGo').onclick=()=>{ const t=$('vrPaste').value; if(t.trim())load(null,t); };
    if($('vrReset'))$('vrReset').onclick=()=>{ S.rows=null; S.wb=null; S.sheets=null; draw(); };
    if($('vrCancel'))$('vrCancel').onclick=()=>closeOverlay();
    if($('vrSheet'))$('vrSheet').onchange=()=>{ S.sheet=$('vrSheet').value; S.rows=window.XLSX.utils.sheet_to_json(S.wb.Sheets[S.sheet],{header:1,raw:true,defval:''}); analyse(); draw(); };
    if($('vrHdr'))$('vrHdr').onchange=()=>{ analyse(+$('vrHdr').value); draw(); };
    if($('vrNameCol'))$('vrNameCol').onchange=()=>{ S.nameCol=+$('vrNameCol').value; const body=S.rows.slice(S.hdr+1); S.map={}; body.forEach(r=>{ const v=String(r[S.nameCol]==null?'':r[S.nameCol]).trim(); if(!v)return; (S.kind==='helfer'?v.split(/,|;|\/|\bund\b|&/):[v]).map(x=>x.trim()).filter(x=>x.length>1).forEach(x=>{ S.map[x]=vrMatchName(x,people)||(S.kind==='helfer'?'x:'+x:''); }); }); draw(); };
    E.querySelectorAll('[data-col]').forEach(s=>s.onchange=()=>{ S.cols[s.dataset.col]=+s.value; if(s.dataset.col==='status'){ const vals={}; S.rows.slice(S.hdr+1).forEach(r=>{ const v=String(r[+s.value]||'').trim(); if(v)vals[v]=(vals[v]||0)+1; }); S.codes=Object.fromEntries(Object.keys(vals).map(v=>[v,{n:vals[v],to:vrGuessCode(v)}])); } draw(); });
    E.querySelectorAll('[data-code]').forEach(s=>s.onchange=()=>{ S.codes[s.dataset.code].to=s.value; draw(); });
    E.querySelectorAll('[data-nm]').forEach(s=>s.onchange=()=>{ S.map[s.dataset.nm]=s.value||null; if(!s.value)S.map[s.dataset.nm]=null; draw(); });
    if($('vrGo'))$('vrGo').onclick=async()=>{ const P=plan(); if(!P.length)return; S.busy=true; draw(); const b=$('vrGo'); let ok=0, fail=0;
      try{
        if(S.kind==='training'){ for(const s of P){ for(let i=0;i<s.spieler.length;i+=80){ try{ const {error}=await SVB.sb.rpc('training_save',{p:{datum:s.datum,typ:'training',spieler:s.spieler.slice(i,i+80)}}); if(error)throw error; ok++; }catch(e){ fail++; console.warn(s.datum,e); } } if(b)b.textContent=`Importiere … ${ok}/${P.length}`; } await trLoad(true); }
        else if(S.kind==='helfer'){ for(const e of P){ try{ const {error}=await SVB.sb.rpc('event_save',{p:e}); if(error)throw error; ok++; }catch(x){ fail++; console.warn(e,x); } if(b)b.textContent=`Importiere … ${ok}/${P.length}`; } await vrLoadEvents(); }
        else { const have=new Set(TR.st.injuries.map(i=>i.p+'|'+i.b)); const rows=P.filter(i=>!have.has(i.player_id+'|'+i.beginn)).map(i=>({player_id:i.player_id,diagnose:i.diagnose,beginn:i.beginn,zurueck:i.zurueck,prognose:i.prognose}));
          if(rows.length){ const {error}=await SVB.sb.from('injuries').insert(rows); if(error)throw error; } ok=rows.length; fail=0; await trLoad(true); }
        closeOverlay(); kToast(`✓ Import fertig: ${ok} ${S.kind==='training'?'Einheiten':S.kind==='helfer'?'Veranstaltungen':'Verletzungen'}${fail?' · '+fail+' fehlgeschlagen':''}`);
      }catch(e){ S.busy=false; draw(); kToast('⚠️ '+(e.message||e)); } };
  };
  draw();
  if(file0)load(file0);
}

/* ---------- Start ---------- */
{ const _gt3=goTab; goTab=function(tab){ const r=_gt3.apply(this,arguments); if(tab==='verein')vrRender(); if(tab==='radar')rdRender(); return r; }; }
{ const _si3=svInit; svInit=function(){
    const r=_si3.apply(this,arguments);
    const scout=canScout();
    document.querySelectorAll('[data-tab="radar"],[data-sheet="radar"]').forEach(b=>{ b.style.display=scout?'':'none'; });
    vrLoadAllTime();
    if(canTraining())vrLoadEvents();
    if(scout){ vrLoadRadar();
      try{ const ch=SVB.sb.channel('verein-live'); let t=null, t2=null;
        ['events','event_helpers'].forEach(tb=>ch.on('postgres_changes',{event:'*',schema:'public',table:tb},()=>{ clearTimeout(t); t=setTimeout(vrLoadEvents,600); }));
        ch.on('postgres_changes',{event:'INSERT',schema:'public',table:'radar'},()=>{ clearTimeout(t2); t2=setTimeout(vrLoadRadar,800); });
        ch.subscribe(); }catch(e){}
      { const _rh4=renderHome; renderHome=function(){ const x=_rh4.apply(this,arguments); try{vrHomeCard();}catch(e){} return x; }; }
    }
    { const _ta=trAfter; trAfter=function(){ const x=_ta.apply(this,arguments); try{ if(document.querySelector('#panel-verein.active'))vrRender(); vrHomeCard(); }catch(e){} return x; }; }
    const h=(location.hash||'').slice(1); if(h==='verein'||h==='radar')setTimeout(()=>goTab(h),60);
    return r; }; }

/* =====================================================================
   SV/BSC Scout · Runde 9: Zurück-Taste wie in einer richtigen App
   - Seitenwechsel landen im Verlauf → „Zurück“ führt zur vorherigen Seite
   - Offene Fenster (Spielerprofil, Co-Trainer, Editoren) und das Mehr-Menü schließen sich mit „Zurück“
   - Auf der Übersicht beendet erst ein doppeltes „Zurück“ die App
   ===================================================================== */
const SVH={ready:false,pop:false,ignore:0,layer:null,exitAt:0};
const svUrl=t=>location.pathname+(t==='home'?'':'#'+t);
function svCurTab(){ const p=document.querySelector('main .panel.active'); return p?p.id.replace('panel-',''):'home'; }
function svHist(tab){
  const st={sv:'tab',tab};
  if(!SVH.ready||SVH.pop){ try{ history.replaceState(SVH.ready?st:history.state,'',svUrl(tab)); }catch(e){} return; }
  const cur=history.state;
  if(cur&&cur.sv==='layer'){                                        // Seitenwechsel aus Fenster/Menü heraus: dessen Eintrag wird zur neuen Seite
    SVH.layer=null; try{ history.replaceState(st,'',svUrl(tab)); }catch(e){}
    const ov=document.getElementById('overlay'); if(ov&&ov.classList.contains('open'))closeOverlay();
    return; }
  if(cur&&cur.sv==='tab'&&cur.tab===tab)return;
  try{ history.pushState(st,'',svUrl(tab)); }catch(e){}
}
function svLayerOpened(kind){ if(!SVH.ready||SVH.layer)return; SVH.layer=kind; try{ history.pushState({sv:'layer',kind},'',location.href); }catch(e){} }
function svLayerClosed(kind){ if(!SVH.ready||SVH.layer!==kind)return; SVH.layer=null; if(history.state&&history.state.sv==='layer'){ SVH.ignore++; try{ history.back(); }catch(e){ SVH.ignore--; } } }
function svOnPop(e){
  if(SVH.ignore>0){ SVH.ignore--; return; }
  const st=e.state||{};
  if(SVH.layer){
    const k=SVH.layer; SVH.layer=null;
    if(k==='modal'){
      if(typeof NAV!=='undefined'&&Array.isArray(NAV)&&NAV.length&&typeof navBack==='function'&&document.getElementById('mback')){ navBack(); SVH.layer='modal'; try{ history.pushState({sv:'layer',kind:'modal'},'',location.href); }catch(x){} }
      else closeOverlay();
    } else svSheet(false);
    return;
  }
  if(st.sv==='tab'){ SVH.pop=true; try{ goTab(st.tab); }finally{ SVH.pop=false; } return; }
  // ganz unten im Verlauf
  if(svCurTab()!=='home'){ SVH.pop=true; try{ goTab('home'); }finally{ SVH.pop=false; } try{ history.pushState({sv:'tab',tab:'home'},'',svUrl('home')); }catch(x){} return; }
  if(Date.now()-SVH.exitAt<2200){ SVH.ignore=0; try{ history.back(); }catch(x){} return; }
  SVH.exitAt=Date.now(); kToast('Zum Beenden nochmal zurück');
  try{ history.pushState({sv:'tab',tab:'home'},'',svUrl('home')); }catch(x){}
}
function svHistInit(){
  if(SVH.ready)return;
  const t=svCurTab();
  try{ history.replaceState({sv:'base'},'',location.pathname+location.hash); history.pushState({sv:'tab',tab:t},'',svUrl(t)); }catch(e){ return; }
  SVH.ready=true;
  window.addEventListener('popstate',svOnPop);
  const watch=(id,kind)=>{ const el=document.getElementById(id); if(!el)return; let was=el.classList.contains('open');
    new MutationObserver(()=>{ const now=el.classList.contains('open'); if(now===was)return; was=now; if(now)svLayerOpened(kind); else svLayerClosed(kind); }).observe(el,{attributes:true,attributeFilter:['class']}); };
  watch('overlay','modal'); watch('moreSheet','sheet');
}
{ const _si4=svInit; svInit=function(){ const r=_si4.apply(this,arguments); setTimeout(svHistInit,120); return r; }; }

/* =====================================================================
   SV/BSC Scout · Runde 9: Jede Rolle bekommt ihr eigenes Cockpit
   - Tab-Leiste und Seitenleiste je Rolle (Scouting immer vorne)
   - Übersicht: Rollen-Cockpit mit Schnellaktionen, wichtigsten Meldungen und KI-Lagebild
   - Scouting-Seite: Radar-Streifen ganz oben
   - Nutzungsprotokoll (Zeit, Bereiche): Auswertung ausschließlich für den Admin
   ===================================================================== */
const SV_TABBAR={trainer:['home','training','elf','scout'],planer:['home','scout','kandidaten','kaderplan'],vorstand:['home','scout','verein','kandidaten'],
  admin:['home','scout','training','kandidaten'],viewer:['home','scout','kaderplan','verein']};
const SV_TBL={home:['home','Home'],scout:['search','Scouting'],training:['activity','Training'],elf:['pitch','Aufstellung'],kandidaten:['kand','Kandidaten'],
  kaderplan:['plan','Kaderplan'],verein:['trophy','Verein'],radar:['radar','Radar'],sxi:['layers','Schattenelf'],db:['db','Datenbank'],gems:['gem','Rohdiamanten'],
  jugend:['sprout','Jugend'],cmp:['chart','Vergleich'],play:['book','Playbook'],model:['sliders','Modell'],admin:['shield','Nutzer & Rollen']};
const SV_SIDE={trainer:['Übersicht','Spieltag','Kaderplanung','Scouting','Verein','Wissen','Verwaltung']};
const SV_TAB_ORDER={trainer:['training','elf','kaderplan','kandidaten','sxi']};

function svBuildTabbar(){
  const bar=document.getElementById('tabbar'), more=document.getElementById('tMore'); if(!bar||!more)return;
  bar.querySelectorAll('.ti').forEach(b=>b.remove());
  (SV_TABBAR[svRole()]||SV_TABBAR.viewer).filter(t=>svTabAllowed(t)).forEach(t=>{
    const [ic,l]=SV_TBL[t], b=document.createElement('button'); b.className='ti'; b.dataset.tab=t;
    b.innerHTML=SVI(ic)+svEsc(l)+(['training','kandidaten','radar'].includes(t)?`<span class="cnt" data-cnt="${t}" style="display:none"></span>`:'');
    b.onclick=()=>goTab(t); bar.insertBefore(b,more); });
  const cur=svCurTab(); bar.querySelectorAll('.ti').forEach(b=>b.classList.toggle('active',b.dataset.tab===cur));
  more.classList.toggle('on',!bar.querySelector('.ti.active'));
}
function svOrderSide(){
  const nav=document.querySelector('.snav'); if(!nav)return;
  const order=SV_SIDE[svRole()]; const groups=[]; let g=null;
  [...nav.children].forEach(el=>{ if(el.classList.contains('sgrp')){ g={name:el.textContent.trim(),els:[el]}; groups.push(g); } else if(g)g.els.push(el); });
  /* Gruppen, die in der gespeicherten Reihenfolge fehlen, sind neue Bereiche. Die landeten bisher ganz unten,
     weit weg von dem, wozu sie gehören (das Studio steht so seit seiner Einführung am Ende). Sie bleiben jetzt
     an ihrem Platz aus dem Aufbau: direkt hinter der letzten bekannten Gruppe davor. */
  if(order){ const platz=new Map(); let letzte=-1, n=0;
    groups.forEach(gr=>{ const k=order.indexOf(gr.name);
      if(k>=0){ letzte=k; n=0; platz.set(gr,k*100); } else { n++; platz.set(gr,letzte*100+n); } });
    groups.sort((a,b)=>platz.get(a)-platz.get(b)); }
  const to=SV_TAB_ORDER[svRole()];
  groups.forEach(gr=>{ if(to&&gr.name==='Kaderplanung'){ const [h,...btns]=gr.els; btns.sort((a,b)=>{ const ia=to.indexOf(a.dataset.tab), ib=to.indexOf(b.dataset.tab); return (ia<0?99:ia)-(ib<0?99:ib); }); gr.els=[h,...btns]; } gr.els.forEach(el=>nav.appendChild(el)); });
}

/* ---------- Nutzung: Zeit & Bereiche (nur für den Admin sichtbar) ---------- */
const SVUS={secs:0,last:Date.now(),views:{},started:false};
function svUseTick(force){ const now=Date.now(); if(force||document.visibilityState==='visible')SVUS.secs+=Math.min(90,Math.max(0,(now-SVUS.last)/1000)); SVUS.last=now; }
async function svUseFlush(){
  svUseTick(); const s=Math.round(SVUS.secs), v=SVUS.views; if(s<5&&!Object.keys(v).length)return;
  SVUS.secs=0; SVUS.views={};
  try{ const {error}=await SVB.sb.rpc('usage_ping',{p_secs:Math.min(300,s),p_views:v}); if(error)throw error; }
  catch(e){ SVUS.secs+=s; Object.entries(v).forEach(([k,n])=>SVUS.views[k]=(SVUS.views[k]||0)+n); }
}
function svUseView(tab){
  if(!/^[a-z]{2,20}$/.test(tab))return; SVUS.views[tab]=(SVUS.views[tab]||0)+1;
  try{ const c=JSON.parse(localStorage.getItem('svbc-views')||'{}'); c[tab]=(c[tab]||0)+1; localStorage.setItem('svbc-views',JSON.stringify(c)); }catch(e){}
}
function svUseStart(){
  if(SVUS.started)return; SVUS.started=true; SVUS.last=Date.now();
  setInterval(()=>svUseTick(),30000); setInterval(svUseFlush,120000);
  document.addEventListener('visibilitychange',()=>{ if(document.visibilityState==='hidden'){ svUseTick(true); svUseFlush(); } else SVUS.last=Date.now(); });
  window.addEventListener('pagehide',()=>{ svUseTick(true); svUseFlush(); });
}
function svTopTabs(n,skip){
  let c={}; try{ c=JSON.parse(localStorage.getItem('svbc-views')||'{}'); }catch(e){}
  const tot=Object.values(c).reduce((a,b)=>a+b,0); if(tot<12)return [];
  return Object.entries(c).filter(([t])=>t!=='home'&&SV_TBL[t]&&svTabAllowed(t)&&!(skip||[]).includes(t)).sort((a,b)=>b[1]-a[1]).slice(0,n).map(([t])=>t);
}

/* ---------- Rollen-Cockpit auf der Übersicht ---------- */
function svInsights(){
  const r=svRole(), out=[], team=canTraining();
  const add=(prio,lvl,t,d,go)=>out.push({prio,lvl,t,d,go});
  const W={trainer:{tr:1,inj:1,md:2,radar:4,kand:6,ms:3,risk:2,form:3,help:7,use:9},planer:{tr:5,inj:6,md:7,radar:1,kand:1,ms:6,risk:4,form:5,help:8,use:9},
    vorstand:{tr:3,inj:5,md:6,radar:2,kand:3,ms:2,risk:1,form:1,help:2,use:9},admin:{tr:3,inj:5,md:6,radar:2,kand:3,ms:3,risk:2,form:2,help:4,use:1},viewer:{ms:1,form:2}}[r]||{};
  try{ if(team&&TR.loaded){ trAlerts().filter(a=>a.lvl!=='info').slice(0,3).forEach(a=>add(W.tr,a.lvl,a.t,a.d,()=>goTab('training')));
    const inj=trSquad().filter(p=>trInjury(p.id)); if(inj.length)add(W.inj,'info',`${inj.length} verletzt`,inj.slice(0,4).map(p=>p.name.split(' ').pop()).join(', '),()=>{ TR.view='injuries'; goTab('training'); }); } }catch(e){}
  try{ if(canScout()){ const s=rdSeen(); VR.radar.filter(x=>x.lvl==='hoch'&&(x.created_at>s||x.stand>=TRC.addDays(trToday(),-4))).slice(0,2).forEach(x=>add(W.radar,'mittel','📡 '+x.titel,x.detail||'',()=>goTab('radar')));
    const n=VR.radar.filter(x=>x.created_at>s).length; if(n>2)add(W.radar+0.5,'info',`${n} neue Radar-Meldungen`,'Torserien, Überflieger, junge Talente',()=>goTab('radar')); } }catch(e){}
  try{ if(!svGast()){ const due=kandList().filter(kandIsDue).length; if(due)add(W.kand,due>3?'mittel':'info',`${due} Kandidaten-Kontakt${due>1?'e':''} fällig`,'Zeit für einen Anruf',()=>goTab('kandidaten')); } }catch(e){}
  try{ if(VR.at.length){ const ms=vrRanks().L.filter(x=>{ const p=x.pid&&trP(x.pid); return p&&p.own&&!p.verzicht; }).map(x=>({p:trP(x.pid),m:vrMsDue(x.tot,x.pid)[0]})).filter(o=>o.m).sort((a,b)=>a.m.rest-b.m.rest);
    ms.slice(0,2).forEach(o=>{ add(W.ms,vrMsStufe(o.m)===1?'mittel':'info',`🎉 ${o.p.name}: noch ${o.m.rest} bis ${o.m.ziel} ${o.m.lab}`,vrMsText(o.m),()=>openModal(o.p.id)); out[out.length-1].ms=o.m.key; }); } }catch(e){}
  try{ if(team&&TR.loaded&&VR.evLoaded){ const risk=vrKader(false).map(p=>({p,rt:vrScores(p).rt})).filter(x=>x.rt.lvl).sort((a,b)=>b.rt.risk-a.rt.risk);
    risk.slice(0,2).forEach(x=>add(W.risk,x.rt.lvl,`Bindungsrisiko: ${x.p.name}`,x.rt.why.join(' · '),()=>vrWhy(x.p.id))); } }catch(e){}
  try{ if(TR.loaded){ const f=TRS.teamForm(TR.st); if(f.n>=3)add(W.form,f.winless>=3?'mittel':'info',`Form: ${f.res.slice(0,5).join(' ')}`,`${f.ppg.toFixed(2)} Punkte/Spiel · ${f.tf}:${f.ta} Tore${f.clean>=2?` · ${f.clean}× zu Null in Folge`:''}`,()=>goTab('training')); } }catch(e){}
  try{ if(team&&VR.evLoaded&&VR.ev.length){ const hs=vrHelpStats(VR_SEASON_START), never=vrKader(false).filter(p=>!hs.has(p.id)).length; if(never>=5)add(W.help,'info',`${never} Spieler der Ersten haben diese Saison noch nie geholfen`,'„Wer ist dran?“ verteilt die nächsten Dienste fair',()=>{ VR.view='events'; goTab('verein'); }); } }catch(e){}
  try{ if(isAdmin()&&SVA.use){ const U=SVA.use, flag=U.filter(u=>u.flagN>0), heavy=U.filter(u=>u.ai24>=40), idle=U.filter(u=>u.active&&!['viewer','spieler','helfer','admin'].includes(u.role)&&(!u.last_seen||Date.now()-new Date(u.last_seen)>14*864e5));
    if(flag.length||heavy.length)add(W.use,'hoch',`⚠️ Co-Trainer: auffällige Nutzung`,[...heavy.map(u=>u.name+' ('+u.ai24+' Fragen/24 h)'),...flag.map(u=>u.name+' ('+u.flagN+'× abseits)')].join(' · '),()=>svUseOpen());
    if(idle.length)add(W.use+0.5,'mittel',`${idle.length} Teammitglied${idle.length>1?'er':''} seit 14+ Tagen nicht in der App`,idle.map(u=>u.name||u.email).join(', '),()=>svUseOpen()); } }catch(e){}
  return out.filter(x=>x.prio!=null).sort((a,b)=>a.prio-b.prio||({hoch:0,mittel:1,info:2}[a.lvl]-{hoch:0,mittel:1,info:2}[b.lvl])).slice(0,6);
}
const SV_ACTIONS={
  trainer:[['activity','Training erfassen',()=>trSessionEditor(trToday())],['plus','Spiel erfassen',()=>trSessionEditor(trToday(),null,'spiel')],['chat','Co-Trainer',()=>trChatOpen()],['pitch','Aufstellung',()=>goTab('elf')]],
  planer:[['radar','Radar',()=>goTab('radar')],['search','Scouting',()=>goTab('scout')],['kand','Kandidaten',()=>goTab('kandidaten')],['layers','Schattenelf',()=>goTab('sxi')]],
  vorstand:[['trophy','Rankings & Verein',()=>goTab('verein')],['radar','Radar',()=>goTab('radar')],['plan','Kaderplan',()=>goTab('kaderplan')],['kand','Kandidaten',()=>goTab('kandidaten')]],
  admin:[['user','Nutzung',()=>svUseOpen()],['radar','Radar',()=>goTab('radar')],['activity','Training',()=>goTab('training')],['kand','Kandidaten',()=>goTab('kandidaten')]],
  viewer:[['search','Scouting',()=>goTab('scout')],['plan','Kaderplan',()=>goTab('kaderplan')],['trophy','Allzeit & Legenden',()=>{ VR.view='allzeit'; goTab('verein'); }]]};
const SV_ROLE_HEAD={trainer:'Dein Trainer-Cockpit',planer:'Dein Kaderplanungs-Cockpit',vorstand:'Dein Vorstands-Cockpit',admin:'Admin-Cockpit',viewer:'Überblick'};
const SVA={use:null,brief:null,briefBusy:false};
function svCockpit(){
  const host=document.getElementById('svHello'); if(!host)return;
  let el=document.getElementById('svCockpit'); if(!el){ el=document.createElement('div'); el.id='svCockpit'; host.after(el); }
  const r=svRole(), acts=SV_ACTIONS[r]||SV_ACTIONS.viewer, ins=svInsights(), top=svTopTabs(4,[...acts.map(a=>''),'home']);
  const ai=canTraining()&&TR.ai&&TR.ai.ready;
  el.innerHTML=`<div class="card svcock"><div class="svc-h"><h3>${svEsc(SV_ROLE_HEAD[r]||'Cockpit')}</h3>${ai?`<button class="btn ghost sm" id="svBriefBtn">${SVI('chat')} KI-Lagebild</button>`:''}</div>
    <div class="svc-acts">${acts.map((a,i)=>`<button class="svc-a" data-act="${i}">${SVI(a[0])}<span>${svEsc(a[1])}</span></button>`).join('')}</div>
    ${SVA.brief?`<div class="svc-brief"><b>${SVI('chat')} Lagebild des Co-Trainers</b><div class="svc-bt">${svEsc(SVA.brief.text).replace(/\n+/g,'<br>')}</div><small>${svEsc(SVA.brief.when||'')}</small></div>`:''}
    <div class="svc-ins">${ins.length?ins.map((x,i)=>`<button class="svc-i l-${x.lvl}" data-ins="${i}"><b>${svEsc(x.t)}</b><span>${svEsc(x.d)}</span></button>`).join(''):'<div class="note">Alles ruhig, keine dringenden Punkte.</div>'}</div>
    ${top.length?`<div class="svc-top"><span>Oft genutzt:</span>${top.map(t=>`<button data-top="${t}">${SVI(SV_TBL[t][0])}${svEsc(SV_TBL[t][1])}</button>`).join('')}</div>`:''}</div>`;
  el.querySelectorAll('[data-act]').forEach(b=>b.onclick=()=>acts[+b.dataset.act][2]());
  el.querySelectorAll('[data-ins]').forEach(b=>b.onclick=()=>{ const x=ins[+b.dataset.ins]; if(x&&x.go)x.go(); });
  el.querySelectorAll('[data-top]').forEach(b=>b.onclick=()=>goTab(b.dataset.top));
  const bb=document.getElementById('svBriefBtn'); if(bb)bb.onclick=svBrief;
  svHomeOrder();
}
async function svBrief(){
  if(SVA.briefBusy)return; SVA.briefBusy=true; const b=document.getElementById('svBriefBtn'); if(b){ b.disabled=true; b.textContent='Denkt nach …'; }
  { const ex=document.querySelector('#svCockpit .svc-brief'), ac=document.querySelector('#svCockpit .svc-acts'); const ld='<div class="svc-brief load44"><b>'+SVI('chat')+' Lagebild des Co-Trainers</b><div class="svc-bt">Der Co-Trainer schaut sich gerade Kader, Training und Radar an. Das dauert ein paar Sekunden.</div></div>'; if(ex)ex.outerHTML=ld; else if(ac)ac.insertAdjacentHTML('afterend',ld); }
  try{ const {data,error}=await SVB.sb.functions.invoke('coach',{body:{mode:'lagebild'}}); if(error)throw error;
    if(!data||!data.ok)throw new Error(data&&data.error==='kein-schluessel'?'KI ist nicht eingerichtet':(data&&data.error&&(typeof svKiFehler==='function'?svKiFehler(data.error):data.error))||'keine Antwort');
    if(!String(data.text||'').trim())throw new Error('Der Co-Trainer hat gerade nichts geliefert. Bitte gleich nochmal tippen.');
    SVA.brief={text:data.text,when:(data.cached?'von heute ':'')+new Date().toLocaleTimeString('de-DE',{hour:'2-digit',minute:'2-digit'})+' Uhr',neu:true}; }
  catch(e){ kToast('⚠️ '+(e.message||e)); }
  SVA.briefBusy=false; svCockpit();
  // frisch geladenes Lagebild sichtbar machen
  if(SVA.brief&&SVA.brief.neu){ SVA.brief.neu=false; const bx=document.querySelector('#svCockpit .svc-brief'); if(bx){ bx.classList.add('in44'); try{ bx.scrollIntoView({behavior:'smooth',block:'nearest'}); }catch(x){} try{ svSound('success'); }catch(x){} } }
}
function svHomeOrder(){
  const host=document.getElementById('svHello'); if(!host)return;
  const ord={trainer:['svCockpit','trHome','vrHome','svRemind'],planer:['svCockpit','vrHome','svRemind','trHome'],vorstand:['svCockpit','vrHome','trHome','svRemind'],
    admin:['svCockpit','vrHome','trHome','svRemind'],viewer:['svCockpit']}[svRole()]||['svCockpit'];
  let after=host; ord.forEach(id=>{ const el=document.getElementById(id); if(el&&el.parentNode===host.parentNode){ if(after.nextSibling!==el)after.after(el); after=el; } });
}

/* ---------- Scouting-Seite: Radar ganz oben ---------- */
function svScoutStrip(){
  const P=document.getElementById('panel-scout'); if(!P||!canScout())return;
  let el=document.getElementById('rdStrip'); if(!el){ el=document.createElement('div'); el.id='rdStrip'; P.prepend(el); }
  const R=VR.radar.filter(r=>r.lvl!=='info').slice(0,3), n=VR.radar.filter(r=>r.created_at>rdSeen()).length;
  el.innerHTML=`<div class="card rdstrip"><div class="svc-h"><h3>${SVI('radar')} Radar${n?` <span class="pill on">${n} neu</span>`:''}</h3><div class="btnrow"><button class="btn sm" data-rs="radar">Alle Meldungen</button><button class="btn ghost sm" data-rs="chancen">Moneyball-Chancen</button></div></div>
    ${R.length?R.map(rdItem).join(''):'<div class="note">Noch keine Meldungen: das Radar wertet jedes Daten-Update aus.</div>'}</div>`;
  el.querySelectorAll('[data-rs]').forEach(b=>b.onclick=()=>{ VR.rf=b.dataset.rs==='chancen'?'chancen':'alle'; goTab('radar'); });
  el.querySelectorAll('[data-svp]').forEach(x=>x.onclick=()=>openModal(x.dataset.svp));
  el.querySelectorAll('[data-star]').forEach(b=>b.style.display='none');
}

/* ---------- Admin: Nutzung & Aktivität (nur Admin) ---------- */
async function svUseLoad(){ if(!isAdmin())return null; try{ const {data,error}=await SVB.sb.rpc('admin_usage',{p_days:30}); if(error)throw error; SVA.use=data||[]; }catch(e){ console.warn('Nutzung',e); } return SVA.use; }
const svMin=s=>{ s=+s||0; if(s<60)return s?'<1 Min.':'–'; const m=Math.round(s/60); return m<60?m+' Min.':(Math.floor(m/60)+' h '+(m%60?m%60+' Min.':'')); };
const svAgo2=d=>{ if(!d)return 'nie'; const x=(Date.now()-new Date(d))/1000; if(x<3600)return 'vor '+Math.max(1,Math.round(x/60))+' Min.'; if(x<86400)return 'vor '+Math.round(x/3600)+' Std.'; const t=Math.round(x/86400); return t===1?'gestern':'vor '+t+' Tagen'; };
function svUseTop(v,n){ return Object.entries(v||{}).sort((a,b)=>b[1]-a[1]).slice(0,n).map(([k,c])=>(SV_TBL[k]?SV_TBL[k][1]:k)+' '+c+'×').join(', '); }
async function svUseCard(P){
  if(!P||!isAdmin()||P.querySelector('#svUse'))return;
  const el=document.createElement('div'); el.className='card'; el.id='svUse'; el.innerHTML='<div class="empty">Lade Nutzung …</div>'; P.appendChild(el);
  const U=await svUseLoad()||[];
  const warn=U.filter(u=>u.ai24>=40||u.flagN>0), idle=U.filter(u=>u.active&&!['viewer','spieler','helfer','admin'].includes(u.role)&&(!u.last_seen||Date.now()-new Date(u.last_seen)>14*864e5));
  el.innerHTML=`<div class="adm-head"><div><h3 style="margin:0;display:flex;gap:8px;align-items:center">${SVI('user')} Nutzung &amp; Aktivität <span class="pill wait">nur für dich</span></h3>
      <p style="margin:6px 0 0;font-size:13.5px">Zeit in der App, aktive Tage, meistgenutzte Bereiche und Fragen an den Co-Trainer (30 Tage). Sieht außer dir niemand, auch nicht der Vorstand.</p></div></div>
    ${warn.length?`<div class="tra l-hoch"><span class="tra-av team">${SVI('bell')}</span><div class="tra-b"><b>Auffällige KI-Nutzung</b><span>${warn.map(u=>`${svEsc(u.name||u.email)}: ${u.ai24} Fragen in 24 h${u.flagN?`, ${u.flagN}× Themen außerhalb des Vereins`:''}`).join(' · ')}</span></div></div>`:''}
    ${idle.length?`<div class="tra l-mittel"><span class="tra-av team">${SVI('clock')}</span><div class="tra-b"><b>Länger nicht in der App</b><span>${idle.map(u=>`${svEsc(u.name||u.email)} (${svEsc(svRolleVon(u))}, ${svAgo2(u.last_seen)})`).join(' · ')}</span></div></div>`:''}
    <div class="trtw"><table class="trtab svuse"><thead><tr><th>Mitglied</th><th>Zuletzt</th><th>Zeit 7 T</th><th>Zeit 30 T</th><th>Aktive Tage</th><th>Meistgenutzt</th><th>Co-Trainer</th></tr></thead><tbody>
    ${U.map(u=>`<tr data-use="${svEsc(u.id)}" class="${u.active?'':'off'}"><td><b>${svEsc(u.name||u.email)}</b><br><small>${svEsc(svRolleVon(u))}${u.active?'':' · gesperrt'}</small></td><td>${svAgo2(u.last_seen)}</td><td>${svMin(u.secs7)}</td><td>${svMin(u.secsN)}</td><td>${u.daysN}</td>
      <td><small>${svEsc(svUseTop(u.views,3)||'–')}</small></td><td>${u.aiN}${u.flagN?` <b class="bad">⚠ ${u.flagN}</b>`:''}${u.ai24>=40?' <b class="bad">viel</b>':''}</td></tr>`).join('')}</tbody></table></div>
    <div class="note">Tipp: Antippen zeigt Details inkl. der letzten Fragen an den Co-Trainer. Die Mitglieder werden in „Mein Konto“ darauf hingewiesen, dass die Nutzung protokolliert wird.</div>`;
  el.querySelectorAll('[data-use]').forEach(r=>r.onclick=()=>svUseDetail(r.dataset.use));
}
function svUseDetail(id){
  const u=(SVA.use||[]).find(x=>x.id===id); if(!u)return;
  svModal(`<div class="mhead"><div class="uav r-${svEsc(u.role)}" style="width:46px;height:46px;border-radius:14px">${svEsc(svIni(u.name||u.email))}</div><div><h2 style="margin:0">${svEsc(u.name||u.email)}</h2><div class="msub">${svEsc(svRolleVon(u))} · zuletzt ${svAgo2(u.last_seen)}</div></div></div>
    <div class="trkpi" style="margin-top:14px"><div><b>${svMin(u.secs7)}</b><span>Zeit 7 Tage</span></div><div><b>${svMin(u.secsN)}</b><span>Zeit 30 Tage</span></div><div><b>${u.daysN}</b><span>aktive Tage</span></div><div><b>${u.aiN}</b><span>Co-Trainer-Fragen</span></div></div>
    <div class="sbsec"><h4>Bereiche (30 Tage)</h4><div class="vrchips">${Object.entries(u.views||{}).sort((a,b)=>b[1]-a[1]).map(([k,c])=>`<span>${svEsc(SV_TBL[k]?SV_TBL[k][1]:k)} <small>${c}×</small></span>`).join('')||'<span class="note">keine Daten</span>'}</div></div>
    <div class="sbsec"><h4>Letzte Fragen an den Co-Trainer</h4>${(u.fragen||[]).length?`<div class="svq">${u.fragen.map(f=>`<div class="${f.flagged?'flag':''}"><em>${new Date(f.at).toLocaleString('de-DE',{day:'2-digit',month:'2-digit',hour:'2-digit',minute:'2-digit'})}${f.modus!=='chat'?' · '+svEsc(f.modus):''}${f.bilder?' · 🖼 '+f.bilder:''}${f.datei?' · 📎 '+svEsc(f.datei):''}</em>${svEsc(f.frage||'–')}${f.flagged?`<b>⚠ abseits: ${svEsc(f.grund||'')}</b>`:''}</div>`).join('')}</div>`:'<div class="note">Noch keine.</div>'}</div>`);
}
function svUseOpen(){ goTab('admin'); setTimeout(()=>{ const c=document.getElementById('svUse'); if(c)c.scrollIntoView({behavior:'smooth'}); },600); }
{ const _ar2=svAdminRender; svAdminRender=async function(){ const r=await _ar2.apply(this,arguments); try{ await svUseCard(document.getElementById('panel-admin')); }catch(e){ console.warn(e); } return r; }; }

/* ---------- Mein Konto: Transparenz ---------- */
{ const _acc2=svAccount; svAccount=function(){
    const r=_acc2.apply(this,arguments);
    const M=document.getElementById('modal'), app=M&&[...M.querySelectorAll('.editsec')].pop(); if(!app)return r;
    const sec=document.createElement('div'); sec.className='editsec';
    sec.innerHTML=`<h4>Datenschutz &amp; Nutzung</h4><p class="note" style="margin:0">Damit die App fair und sicher bleibt, werden Nutzungszeit, aufgerufene Bereiche und Fragen an den Co-Trainer protokolliert. Einsehen kann das ausschließlich der Admin. <span id="svMyUse"></span></p>`;
    app.after(sec);
    SVB.sb.rpc('my_usage').then(({data})=>{ const s=document.getElementById('svMyUse'); if(s&&data)s.textContent=`Deine letzten 30 Tage: ${svMin(data.secs30)} in der App, ${data.ai30} Co-Trainer-Fragen.`; }).catch(()=>{});
    return r; }; }

/* ---------- Start ---------- */
{ const _gt4=goTab; goTab=function(tab){ const r=_gt4.apply(this,arguments); try{ svUseView(svCurTab()); if(tab==='scout')svScoutStrip(); if(tab==='home')svCockpit(); }catch(e){} return r; }; }
{ const _va=vrAfter; vrAfter=function(){ const r=_va.apply(this,arguments); try{ if(document.querySelector('#panel-home.active'))svCockpit(); if(document.querySelector('#panel-scout.active'))svScoutStrip(); }catch(e){} return r; }; }
{ const _ta3=trAfter; trAfter=function(){ const r=_ta3.apply(this,arguments); try{ if(document.querySelector('#panel-home.active'))svCockpit(); }catch(e){} return r; }; }
{ const _si5=svInit; svInit=function(){
    const r=_si5.apply(this,arguments);
    try{ svBuildTabbar(); svOrderSide(); }catch(e){ console.warn('Navigation',e); }
    { const _rh5=renderHome; renderHome=function(){ const x=_rh5.apply(this,arguments); try{ svCockpit(); }catch(e){} return x; }; }
    try{ svCockpit(); }catch(e){}
    svUseStart(); svUseView(svCurTab());
    if(isAdmin())svUseLoad().then(()=>{ try{ if(document.querySelector('#panel-home.active'))svCockpit(); }catch(e){} });
    try{ trBadge(); svBadges(); vrBadge(); }catch(e){}
    return r; }; }

/* =====================================================================
   SV/BSC Scout · Runde 10: Spielerkarten im Stil der Fußball-Sammelkarten, Vereinswappen, Spielerfotos
   - Karte: Gesamtwert (OVR) + 6 Werte aus den echten Daten (Abschluss, Anteil an Teamtoren, Form, Potenzial,
     bei eigenen Spielern Training & Loyalität, sonst Wechselchance & Nähe). Antippen dreht die Karte um.
   - Wappen: öffentliche Vereinslogos von FUSSBALL.DE (nur angezeigt, nicht kopiert)
   - Fotos: nur vereinsintern, selbst aufgenommen oder mit Einverständnis, gespeichert in der eigenen Datenbank
   ===================================================================== */
const SVC={crest:new Map(),crestLoaded:false,photos:new Map(),photosLoaded:false};
const scNorm=s=>TRC.N(String(s||'')).replace(/[^a-z0-9]/g,'');
function scCrestId(club){ if(!club)return null; const k=scNorm(club); return SVC.crest.get(k)||SVC.crest.get(k.replace(/(iii|ii|2|3)$/,''))||null; }
/* Wappen: eigenes Logo aus der App, Gegner als transparente, hochgerechnete Datei (wappen/<id>.webp).
   Fehlt die Datei, kommt das Original von fussball.de auf einer weißen Plakette, nie als weißes Quadrat. */
function scCrestErr(img){ const id=img.dataset.fid; if(id&&!img.dataset.raw){ img.dataset.raw='1'; img.classList.add('raw'); img.src='https://www.fussball.de/export.media/-/action/getLogo/format/2/id/'+encodeURIComponent(id); return; } img.remove(); }
function scCrest(club,cls){ const k=scNorm(club);
  if(/^svbscmoerlenbach/.test(k))return `<span class="crestw own ok ${cls||''}"><img class="crest" src="logo.png" alt=""></span>`;
  const id=scCrestId(club), ini=`<span class="crest cx">${svEsc(initials(club||'?'))}</span>`;
  return `<span class="crestw ${cls||''}">${ini}${id?`<img class="crest" src="wappen/${encodeURIComponent(id)}.webp" data-fid="${svEsc(id)}" alt="" referrerpolicy="no-referrer" loading="lazy" onload="this.parentNode.classList.add('ok')" onerror="scCrestErr(this)">`:''}</span>`; }
async function scLoadCrests(){
  if(SVC.crestLoaded||!canScout())return; SVC.crestLoaded=true;
  try{ const {data,error}=await SVB.sb.from('table_snaps').select('club_key,logo,stand').not('logo','is',null).order('stand',{ascending:false}).limit(600); if(error)throw error;
    (data||[]).forEach(r=>{ if(!SVC.crest.has(r.club_key))SVC.crest.set(r.club_key,r.logo); }); }catch(e){ console.warn('Wappen',e); }
}
async function scLoadPhotos(){
  if(SVC.photosLoaded||!canScout())return; SVC.photosLoaded=true;
  try{ const {data,error}=await SVB.sb.from('player_photos').select('player_id,data').limit(600); if(error)throw error;
    (data||[]).forEach(r=>{ SVC.photos.set(r.player_id,r.data); const p=players.find(x=>x.id===r.player_id); if(p)p.photo=r.data; });
    if((data||[]).length){ try{ renderAll(); }catch(e){} }
  }catch(e){ console.warn('Fotos',e); }
}
function scSquare(file,size){ return new Promise((res,rej)=>{ const fr=new FileReader(); fr.onerror=()=>rej(new Error('Datei nicht lesbar'));
  fr.onload=()=>{ const img=new Image(); img.onerror=()=>rej(new Error('Kein gültiges Bild')); img.onload=()=>{
    const s=Math.min(img.width,img.height), c=document.createElement('canvas'); c.width=c.height=size;
    // Ausschnitt: Mitte, etwas nach oben (Gesicht)
    const sx=(img.width-s)/2, sy=Math.max(0,(img.height-s)*0.3);
    c.getContext('2d').drawImage(img,sx,sy,s,s,0,0,size,size); let q=0.82, u=c.toDataURL('image/jpeg',q);
    while(u.length>150000&&q>0.4){ q-=0.12; u=c.toDataURL('image/jpeg',q); } res(u); }; img.src=fr.result; }; fr.readAsDataURL(file); }); }
async function scSavePhoto(p,file){
  try{ const data=await scSquare(file,320);
    const {error}=await SVB.sb.from('player_photos').upsert({player_id:p.id,data},{onConflict:'player_id'}); if(error)throw error;
    p.photo=data; SVC.photos.set(p.id,data); try{renderAll();}catch(e){} openModal(p.id); kToast('📷 Foto gespeichert, nur im Team sichtbar'); }
  catch(e){ kToast('⚠️ '+(e.message||e)); }
}
async function scDelPhoto(p){
  try{ const {error}=await SVB.sb.from('player_photos').delete().eq('player_id',p.id); if(error)throw error; p.photo=null; SVC.photos.delete(p.id); try{renderAll();}catch(e){} openModal(p.id); kToast('Foto entfernt'); }
  catch(e){ kToast('⚠️ '+(e.message||e)); }
}

/* ---------- Werte der Karte ---------- */
function scRate(p){
  let s; try{ s=scores(p); }catch(e){ return {ovr:'–',st:[],tier:'bronze'}; }
  const T=v=>v==null?null:Math.max(25,Math.min(99,Math.round(30+v*0.69)));
  const ovr=Math.max(30,Math.min(99,Math.round(s.total)));   // gleiche Gesamtwertung wie Aufstellung & Spielerbogen
  let st=[['ABS',T(s.prod)],['ANT',T(s.share)],['FRM',T(s.trend)],['POT',T(s.pot)]];
  const eye=typeof sbEye==='function'?sbEye(p):null;   // Eye-Test aus dem Spielerbogen hat Vorrang
  if(eye)st=[['TEM',eye[0]*10],['TEC',eye[1]*10],['ZWK',eye[2]*10],['SPI',eye[3]*10]].map(([k,v])=>[k,Math.min(99,v)]);
  if(p.own&&!p.isJugend&&typeof vrScores==='function'&&canTraining()){ let v=null; try{ v=vrScores(p); }catch(e){} st.push(['TRN',v&&v.ts.score!=null?T(v.ts.score):null],['LOY',v?T(v.ls.score):null]); }
  else { const W=typeof wscoreSafe==='function'?wscoreSafe(p):null; st.push(['WEC',W?T(W.w):null],['NÄH',p.km!=null?Math.max(25,Math.min(99,Math.round(99-p.km*2.2))):null]); }
  const tier=p.own&&!p.isJugend?'club':ovr>=75?'icon':ovr>=62?'gold':ovr>=50?'silver':'bronze';
  return {ovr,st,tier,s};
}
function scSil(p){ return `<svg class="fut-sil" viewBox="0 0 100 100" aria-hidden="true"><circle cx="50" cy="36" r="19"/><path d="M12 102c3-26 19-38 38-38s35 12 38 38z"/></svg><em>${svEsc(initials(p.name||'?'))}</em>`; }
function scSeason(p){ const c=p.cur||{}; const t=p.isJugend?p.tore:c.tore, sp=p.isJugend?p.teamSp:c.spiele; return t!=null?`${t} Tore${sp?' in '+sp+' Sp.':''}`:'–'; }
/* opts: size ('lg'|'sm'|'xs'), tier (Sonderkarte, z. B. 'totw'), badge (Text oben), sub (Zeile unter Namen), flip:false */
function fcCard(p,o){
  o=o||{}; const R=scRate(p), src=p.photo||p.photoUrl, pos=p.isJugend?'U19':(svPosTxt(p,1)||'?'), club=(p.cur&&p.cur.club)||p.club||'';
  const nm=String(p.name||'').split(' '), last=nm.slice(-1)[0]||'', first=nm.slice(0,-1).join(' ');
  const ai=o.ai||null, W=!p.own&&typeof wscoreSafe==='function'?wscoreSafe(p):null;
  let sb=null; try{ sb=typeof sbOf==='function'&&!p.isJugend?sbOf(p):null; }catch(e){}
  const role=sb&&sb.rol&&typeof SB_ROLE!=='undefined'&&SB_ROLE[sb.rol]?SB_ROLE[sb.rol].t:'';
  if(!o.sub&&role)o=Object.assign({},o,{sub:svEsc(role)});
  return `<div class="fut ${o.tier||R.tier} ${o.size||''}${o.anim?' fut-anim':''}" data-fut="${svEsc(p.id)}" style="${o.delay!=null?'--d:'+o.delay+'ms':''}" tabindex="0" role="button" aria-label="${svEsc(p.name)}, ${R.ovr}">
    <div class="fut-in"><div class="fut-f"><div class="fut-sh"></div>
      <div class="fut-ov"><b>${R.ovr}</b><span${pos.length>3?' class="fut-teil"':''}>${svEsc(pos)}</span>${R.v1&&R.v1.form&&R.v1.form!=='unbekannt'?`<span class="fut-form f-${svEsc(R.v1.form)}" title="${svEsc(V1_FORM[R.v1.form][1])}">${V1_FORM[R.v1.form][0]}</span>`:''}${sb&&sb.foot&&typeof SB_FOOT!=='undefined'&&SB_FOOT[sb.foot]?`<span class="fut-foot" title="Starker Fuß: ${svEsc(sb.foot)}">${svEsc(SB_FOOT[sb.foot])}</span>`:''}${scCrest(club)}</div>
      ${o.badge?`<div class="fut-badge">${o.badge}</div>`:''}
      <div class="fut-pic">${scSil(p)}${src?`<img src="${src}" alt="" referrerpolicy="no-referrer" loading="lazy" onerror="this.remove()">`:''}</div>
      <div class="fut-nm">${first?`<small>${svEsc(first)}</small>`:''}<b>${svEsc(last)}</b>${o.sub?`<i>${o.sub}</i>`:''}</div>
      <div class="fut-st${R.v1?' v1':''}">${R.st.map(([k,v])=>`<span><b>${v==null?'-':v}</b>${k}</span>`).join('')}</div></div>
    <div class="fut-b"><b>${svEsc(p.name)}</b><small>${svEsc(club)}${p.isJugend?' · '+svEsc(p.sub||p.staffel||''):''}</small>
      <dl><dt>Saison</dt><dd>${svEsc(scSeason(p))}</dd>
      ${p.km!=null?`<dt>Entfernung</dt><dd>${p.km} km</dd>`:''}
      ${p.alter!=null?`<dt>Alter</dt><dd>${p.alterCa?'≈':''}${p.alter}</dd>`:''}
      ${W?`<dt>Wechsel-Index</dt><dd title="Heuristik aus öffentlichen Signalen, keine Wahrscheinlichkeit">${W.w}/100</dd>`:''}
      ${ai?`<dt>KI-Scout</dt><dd>${svEsc(ai.urteil||'')}${ai.score!=null?' · '+ai.score:''}</dd>`:''}</dl>
      ${W&&W.f&&W.f[0]?`<p>${svEsc(W.f[0][1])}</p>`:''}
      ${sb&&sb.sk&&sb.sk.length&&typeof sbHex==='function'?`<div class="fut-sk">${sb.sk.slice(0,4).map(x=>sbHex(x.k,x.plus,'sm')).join('')}</div>`:''}
      <button class="btn sm" data-fut-open="${svEsc(p.id)}">Profil öffnen</button></div></div></div>`;
}
/* Karten-Interaktion: antippen = umdrehen, Profil-Knopf = Profil, Neigen beim Bewegen */
document.addEventListener('click',e=>{
  const ob=e.target.closest('[data-fut-open]'); if(ob){ e.stopPropagation(); openModal(ob.dataset.futOpen); return; }
  const c=e.target.closest('.fut'); if(!c||c.closest('.fut-noflip'))return;
  if(c.dataset.go){ openModal(c.dataset.fut); return; }
  c.classList.toggle('flip');
});
document.addEventListener('pointermove',e=>{ const c=e.target.closest&&e.target.closest('.fut'); if(!c||e.pointerType==='touch')return; const r=c.getBoundingClientRect();
  c.style.setProperty('--rx',((e.clientY-r.top)/r.height-0.5)*-10+'deg'); c.style.setProperty('--ry',((e.clientX-r.left)/r.width-0.5)*12+'deg'); c.style.setProperty('--gx',((e.clientX-r.left)/r.width*100)+'%'); },{passive:true});
document.addEventListener('pointerout',e=>{ const c=e.target.closest&&e.target.closest('.fut'); if(c&&!c.contains(e.relatedTarget)){ c.style.removeProperty('--rx'); c.style.removeProperty('--ry'); } },{passive:true});

/* ---------- Spielerprofil: Karte oben + Fotos dauerhaft speichern ---------- */
{ const _om5=openModal; openModal=function(id){ const r=_om5.apply(this,arguments); try{ scProfile(id); }catch(e){ console.warn('Karte',e); } return r; }; }
function scProfile(id){
  const p=players.find(x=>x.id===id), M=document.getElementById('modal'); if(!p||!M)return;
  const head=M.querySelector('.mhead'); if(head&&!M.querySelector('.fut-hero')){
    const ai=(typeof VR!=='undefined'&&VR.radar||[]).find(r=>r.player_id===p.id&&r.ai);
    const d=document.createElement('div'); d.className='fut-hero'; d.innerHTML=fcCard(p,{size:'lg',ai:ai&&ai.ai})+(ai&&ai.ai?scAiBox(ai.ai):'');
    const old=M.querySelector('.sbwrap .sbcard'); if(old){ old.replaceWith(d); d.classList.add('in-sb'); } else head.after(d); }
  const inp=document.getElementById('e_photo');
  if(inp&&canScout()){
    inp.onchange=e=>{ const f=e.target.files&&e.target.files[0]; if(f)scSavePhoto(p,f); };
    const lab=inp.closest('label'); if(lab&&!lab.nextElementSibling?.classList?.contains('phnote')){ const n=document.createElement('div'); n.className='note phnote'; n.textContent='Nur eigene Fotos oder mit Einverständnis des Spielers, sichtbar nur fürs Team.'; lab.after(n); }
    const del=document.getElementById('delPhoto'); if(del)del.onclick=()=>scDelPhoto(p);
    const av=document.getElementById('mAva'); if(av)av.onclick=()=>inp.click();
  }
  // Jugendspieler: als eigenes Talent markieren (Radar meldet dann jedes Tor)
  if(p.isJugend&&canScout()&&!M.querySelector('#scEg')){
    const on=!!(crmOf(p).eg), b=document.createElement('button'); b.id='scEg'; b.className='crmb'+(on?' on-att':''); b.textContent=on?'🌱 Eigener Jugendspieler ✓':'🌱 Ist einer von uns (Eigengewächs)';
    b.onclick=()=>{ crmSet(p.id,{eg:on?undefined:1}); kToast(on?'Markierung entfernt':'🌱 '+p.name+' als eigenes Talent markiert'); openModal(p.id); };
    (M.querySelector('.fut-hero')||head).after(b);
  }
}
function scAiBox(ai){
  const u={realistisch:'ok',beobachten:'mid',unrealistisch:'bad'}[ai.urteil]||'';
  return `<div class="aibox ${u}"><div class="aibox-h">${SVI('chat')} <b>KI-Scout: ${svEsc(ai.urteil||'')}</b>${ai.score!=null?`<span class="pill">${ai.score}/100</span>`:''}<small>${ai.stufe==='fein'?'Dossier':'Grobcheck'}</small></div>
    <p>${svEsc(ai.text||'')}</p>
    ${(ai.staerken||[]).length?`<div class="aib-l"><b>Stärken</b>${ai.staerken.map(x=>`<span>＋ ${svEsc(x)}</span>`).join('')}</div>`:''}
    ${(ai.risiken||[]).length?`<div class="aib-l"><b>Risiken</b>${ai.risiken.map(x=>`<span>－ ${svEsc(x)}</span>`).join('')}</div>`:''}
    ${ai.ansprache?`<div class="aib-l"><b>Ansprache</b><span>${svEsc(ai.ansprache)}</span></div>`:''}
    ${(ai.quellen||[]).length?`<div class="aib-q">${ai.quellen.map(q=>{ let h=''; try{ h=new URL(q).hostname.replace(/^www\./,''); }catch(e){} return h?`<a href="${svEsc(q)}" target="_blank" rel="noopener noreferrer">${svEsc(h)}</a>`:''; }).join('')}</div>`:''}</div>`;
}

/* =====================================================================
   SV/BSC Scout · Runde 10: Spieltag
   - Gegnercheck: nächster Gegner mit Tabelle, Heim/Auswärts, Fieberkurve, gefährlichste Spieler, Stärken & Schwächen,
     direkter Vergleich, und auf Knopfdruck ein KI-Matchplan
   - Elf der Woche: aus den Torjägerlisten (Spieltag oder Saison), jede Liga und A-Jugend
   - A-Jugend-Radar: Talente im Umkreis + eigene Jugend, als Karten
   - Ergebnisse kommen automatisch (aus der Veränderung der FUSSBALL.DE-Tabelle): niemand muss sie eintragen
   ===================================================================== */
SV_PAGES.gegner=['Gegnercheck','Der nächste Gegner: Stärken, Schwächen, gefährliche Spieler'];
SV_PAGES.totw=['Elf der Woche','Die besten Torschützen des Spieltags als Team'];
SV_PAGES.jugend=['A-Jugend','Talente im Umkreis und aus den eigenen Reihen'];
SV_TBL.gegner=['target','Gegner']; SV_TBL.totw=['star','Elf d. Woche'];
{ const _ta3=svTabAllowed; svTabAllowed=function(t){ if(t==='gegner'||t==='totw')return canScout(); return _ta3.apply(this,arguments); }; }

const SP={loaded:false,loading:false,fx:[],res:[],tabs:[],stands:[],snaps:{},team:'A',sel:null,tw:{sub:'A',mode:'tag'},jf:{liga:'alle',region:true},ai:{},aiBusy:false};
const SP_OWN={A:'svbscmoerlenbach',D2:'svbscmoerlenbachii'};
const SP_TEAMS=[['A','1. Mannschaft'],['D2','Zweite']];
const SP_LIGA={GL:'Gruppenliga',KOL:'Kreisoberliga',A:'Kreisliga A',B:'Kreisliga B',C:'Kreisliga C',D1:'Kreisliga D1',D2:'Kreisliga D2','AJ-BS':'U19 Kreis','AJ-GL':'U19 Gruppenliga','AJ-VL':'U19 Verbandsliga'};
const spWd=d=>{ try{ return new Date(d+'T12:00:00').toLocaleDateString('de-DE',{weekday:'short',day:'2-digit',month:'2-digit'}); }catch(e){ return d; } };
const spDays=d=>TRC.diffDays(d,trToday());
const spPct=(a,b)=>b?Math.round(a/b*100):0;
const spNum=(v,d=1)=>v==null||!isFinite(v)?'–':(+v).toLocaleString('de-DE',{minimumFractionDigits:d,maximumFractionDigits:d});

/* ---------- Laden ---------- */
async function spLoad(force){
  if(SP.loading||(SP.loaded&&!force)||!canScout())return; SP.loading=true;
  try{
    const [fx,res,st]=await Promise.all([
      SVB.sb.from('fixtures').select('id,sub,datum,zeit,wettbewerb,heim,gast,heim_key,gast_key').limit(2000),
      SVB.sb.from('match_results').select('id,sub,datum,heim,gast,heim_key,gast_key,tore_heim,tore_gast,von,bis,sicher,scorers').order('bis',{ascending:false}).limit(2000),
      SVB.sb.from('table_snaps').select('stand').eq('club_key','svbscmoerlenbach').eq('sub','A').gte('stand',VR_SEASON_START).order('stand',{ascending:true}).limit(400)]);
    SP.fx=fx.data||[]; SP.res=res.data||[]; SP.stands=(st.data||[]).map(r=>r.stand);
    const last=SP.stands.slice(-10);
    if(last.length){ const t=await SVB.sb.from('table_snaps').select('stand,club_key,sub,club,platz,spiele,tore,gegentore,punkte,logo,heim,ausw,fieber').in('stand',last).limit(3000);
      SP.tabs=t.data||[]; SP.tabs.forEach(r=>{ if(r.logo)SVC.crest.set(r.club_key,r.logo); }); }
    SP.loaded=true;
  }catch(e){ console.warn('Spieltag',e); SP.loaded=true; }
  SP.loading=false; spAfter();
}
async function spSnaps(sub){
  if(SP.snaps[sub])return SP.snaps[sub];
  const st=SP.stands.slice(-6); if(!st.length)return (SP.snaps[sub]=[]);
  try{ const {data,error}=await SVB.sb.from('scorer_snaps').select('stand,pkey,name,club,sub,tore,team_sp,player_id').eq('sub',sub).in('stand',st).limit(5000); if(error)throw error; SP.snaps[sub]=data||[]; }
  catch(e){ console.warn('Torjäger',e); SP.snaps[sub]=[]; }
  return SP.snaps[sub];
}
function spAfter(){ try{ if(document.querySelector('#panel-gegner.active'))spRender(); }catch(e){ console.warn(e); } try{ if(document.querySelector('#panel-totw.active'))twRender(); }catch(e){ console.warn(e); }
  try{ spHome(); }catch(e){} try{ if(document.querySelector('#panel-home.active'))svCockpit(); }catch(e){} }

/* ---------- Hilfen ---------- */
function spTab(sub,stand){ const s=stand||SP.stands[SP.stands.length-1]; const m=new Map(); SP.tabs.filter(r=>r.sub===sub&&r.stand===s).forEach(r=>m.set(r.club_key,r)); return m; }
function spRowsOf(key,sub){ return SP.tabs.filter(r=>r.club_key===key&&r.sub===sub).sort((a,b)=>a.stand<b.stand?-1:1); }
function spOwnFx(team){ const k=SP_OWN[team]; return SP.fx.filter(f=>(f.heim_key===k||f.gast_key===k)&&f.datum).sort((a,b)=>(a.datum+(a.zeit||'')).localeCompare(b.datum+(b.zeit||''))); }
function spNext(team){ const t=trToday(); return spOwnFx(team).filter(f=>f.datum>=t); }
function spResultsOf(key){ return SP.res.filter(r=>r.heim_key===key||r.gast_key===key).sort((a,b)=>((b.datum||b.bis)||'').localeCompare((a.datum||a.bis)||'')); }
function spRes(r,key){ const h=r.heim_key===key, f=h?r.tore_heim:r.tore_gast, a=h?r.tore_gast:r.tore_heim; return {f,a,e:f>a?'S':f===a?'U':'N',opp:h?r.gast:r.heim,h}; }
function spForm(key,sub){ // Ergebnisse, sonst Tabellen-Veränderung (Punkte je Zeitraum)
  const R=spResultsOf(key).map(r=>spRes(r,key)); if(R.length)return R.slice(0,6).map(x=>x.e);
  const rows=spRowsOf(key,sub), out=[]; for(let i=rows.length-1;i>0&&out.length<6;i--){ const a=rows[i-1], b=rows[i]; if(b.spiele-a.spiele===1){ const p=b.punkte-a.punkte; out.push(p===3?'S':p===1?'U':'N'); } }
  return out;
}
function spPlayersOf(key){ return players.filter(p=>!p.isJugend&&p.cur&&scNorm(p.cur.club||p.club)===key).sort((a,b)=>(b.cur.tore||0)-(a.cur.tore||0)); }
function spHot(sub,key){ // Tore in den letzten zwei Zeiträumen je Spieler
  const S=SP.snaps[sub]; if(!S||!S.length)return new Map(); const st=[...new Set(S.map(r=>r.stand))].sort(); if(st.length<2)return new Map();
  const from=st[Math.max(0,st.length-3)], to=st[st.length-1], A=new Map(), m=new Map();
  S.filter(r=>r.stand===from).forEach(r=>A.set(r.pkey,r.tore));
  S.filter(r=>r.stand===to&&(!key||scNorm(r.club)===key)).forEach(r=>{ const g=r.tore-(A.has(r.pkey)?A.get(r.pkey):0); if(g>0&&(A.has(r.pkey)||r.tore<=3))m.set(r.player_id||r.pkey,g); });
  return m;
}
function spPerGame(r,f){ if(!r)return null; const x=r[f], sp=r.sp!=null?r.sp:r.spiele; return sp?x/sp:null; }
function spFeverSvg(A,B){
  const n=Math.max(A.v.length,B.v.length); if(n<2)return '';
  const mx=Math.max(16,...A.v,...B.v), W=320, H=120, px=i=>14+i*(W-28)/(n-1), py=v=>10+(v-1)*(H-24)/(mx-1);
  const line=(v,c)=>`<polyline fill="none" stroke="${c}" stroke-width="2.6" stroke-linejoin="round" stroke-linecap="round" points="${v.map((x,i)=>px(i)+','+py(x)).join(' ')}"/>`+v.map((x,i)=>i===v.length-1?`<circle cx="${px(i)}" cy="${py(x)}" r="4" fill="${c}"/><text x="${px(i)+6}" y="${py(x)+4}" fill="${c}" font-size="11" font-weight="800">${x}.</text>`:'').join('');
  return `<svg class="spfever" viewBox="0 0 ${W+20} ${H}" role="img" aria-label="Tabellenplatz je Spieltag"><line x1="14" x2="${W-14}" y1="${py(1)}" y2="${py(1)}" class="g"/><line x1="14" x2="${W-14}" y1="${py(Math.ceil(mx/2))}" y2="${py(Math.ceil(mx/2))}" class="g"/>${line(B.v,'#ff8a5b')}${line(A.v,'#5b9bff')}</svg>
    <div class="splegend"><span style="--c:#5b9bff">${svEsc(A.n)}</span><span style="--c:#ff8a5b">${svEsc(B.n)}</span></div>`;
}
const spFormHtml=f=>f.length?`<span class="spform">${f.slice(0,5).map(x=>`<i class="f${x}">${x}</i>`).join('')}</span>`:'<span class="note">noch offen</span>';

/* ---------- Stärken & Schwächen (regelbasiert, erklärbar) ---------- */
function spTraits(row,key,sub,venue){
  const S=[], W=[]; if(!row)return {S,W};
  const sp=row.spiele||0, tpg=sp?row.tore/sp:null, gpg=sp?row.gegentore/sp:null;
  const lg=[...spTab(sub).values()], avgT=lg.length?lg.reduce((a,r)=>a+(r.spiele?r.tore/r.spiele:0),0)/lg.length:null;
  if(tpg!=null&&avgT&&tpg>=avgT*1.25)S.push(`Offensivstark: ${spNum(tpg)} Tore pro Spiel (Liga-Schnitt ${spNum(avgT)})`);
  if(tpg!=null&&avgT&&tpg<=avgT*0.75)W.push(`Wenig Torgefahr: ${spNum(tpg)} Tore pro Spiel`);
  if(gpg!=null&&avgT&&gpg<=avgT*0.75)S.push(`Stabile Abwehr: nur ${spNum(gpg)} Gegentore pro Spiel`);
  if(gpg!=null&&avgT&&gpg>=avgT*1.25)W.push(`Anfällige Abwehr: ${spNum(gpg)} Gegentore pro Spiel`);
  const V=venue==='heim'?row.heim:row.ausw, vn=venue==='heim'?'zu Hause':'auswärts';
  if(V&&V.sp>=2){ const ppg=V.pkt/V.sp;
    if(ppg>=2.2)S.push(`${venue==='heim'?'Heimstark':'Auswärtsstark'}: ${V.s} Siege aus ${V.sp} Spielen ${vn}`);
    if(ppg<=0.8)W.push(`${vn[0].toUpperCase()+vn.slice(1)} schwach: ${V.pkt} Punkte aus ${V.sp} Spielen`);
    if(V.gt/V.sp>=2.2)W.push(`Kassiert ${vn} ${spNum(V.gt/V.sp)} Tore pro Spiel`); }
  const top=spPlayersOf(key)[0]; if(top&&row.tore>=6&&top.cur.tore/row.tore>=0.33)S.push(`Tore hängen an ${top.name} (${spPct(top.cur.tore,row.tore)} % der Treffer). Ausschalten!`);
  const f=spForm(key,sub); const lastN=f.slice(0,3);
  if(lastN.length>=3&&lastN.every(x=>x==='S'))S.push('Drei Siege in Folge, mit Selbstvertrauen');
  if(lastN.length>=3&&!lastN.includes('S'))W.push(`Seit ${lastN.length} Spielen ohne Sieg`);
  const fv=row.fieber||[]; if(fv.length>=4){ const d=fv[fv.length-4]-fv[fv.length-1]; if(d>=3)S.push(`Im Aufwind: in drei Spieltagen von Platz ${fv[fv.length-4]} auf ${fv[fv.length-1]}`); if(d<=-3)W.push(`Im Abwärtstrend: von Platz ${fv[fv.length-4]} auf ${fv[fv.length-1]} gefallen`); }
  return {S,W};
}

/* ---------- Gegnercheck ---------- */
async function spRender(){
  const P=document.getElementById('panel-gegner'); if(!P)return;
  if(!canScout()){ P.innerHTML='<div class="card"><div class="empty">Den Gegnercheck sieht das Trainerteam.</div></div>'; return; }
  if(!SP.loaded){ P.innerHTML='<div class="card"><div class="empty">Lade Spielplan …</div></div>'; spLoad(); return; }
  const team=SP.team, own=SP_OWN[team], next=spNext(team), f=(SP.sel&&next.find(x=>x.id===SP.sel))||next[0];
  const head=`<div class="trtop"><div class="trtabs">${SP_TEAMS.map(([k,t])=>`<button class="${team===k?'on':''}" data-spteam="${k}">${t}</button>`).join('')}</div></div>`;
  if(!f){ P.innerHTML=head+`<div class="card"><div class="empty">Noch kein Spielplan geladen.<br><small>Der Spielplan kommt mit dem nächsten Daten-Update (sonntags spät, montags & donnerstags früh).</small></div></div>`; spBind(P); return; }
  const home=f.heim_key===own, oppKey=home?f.gast_key:f.heim_key, oppName=home?f.gast:f.heim, sub=f.sub==='POKAL'?team:f.sub;
  await spSnaps(sub);
  const T=spTab(sub), U=T.get(own), G=T.get(oppKey), dd=spDays(f.datum);
  const uF=spForm(own,sub), gF=spForm(oppKey,sub), hot=spHot(sub,oppKey), hotU=spHot(sub,own);
  const gT=spTraits(G,oppKey,sub,home?'ausw':'heim'), uT=spTraits(U,own,sub,home?'heim':'ausw');
  const oppPl=spPlayersOf(oppKey).filter(p=>p.cur.tore>0).slice(0,6);
  const exs=players.filter(p=>!p.isJugend&&scNorm((p.cur&&p.cur.club)||p.club)===oppKey&&(p.exSvbc||(crmOf(p)||{}).x));
  const h2h=spResultsOf(own).filter(r=>r.heim_key===oppKey||r.gast_key===oppKey);
  const prev=[['2526','25/26'],['2425','24/25'],['2324','23/24']].map(([k,l])=>{ const cu=Object.values(DATA.clubs||{}).find(c=>scNorm(c.name)===own.replace(/ii$/,'')&&c['s'+k]), co=Object.values(DATA.clubs||{}).find(c=>scNorm(c.name)===oppKey&&c['s'+k]);
    return cu&&co&&cu['s'+k].liga===co['s'+k].liga?`<span>${l}: wir Platz ${cu['s'+k].platz}, ${svEsc(oppName)} Platz ${co['s'+k].platz}</span>`:''; }).filter(Boolean);
  const inj=team==='A'&&TR.loaded?trSquad().filter(p=>trInjury(p.id)):[];
  const ourTop=spPlayersOf(own).filter(p=>p.cur.tore>0).slice(0,4);
  const cmp=(l,a,b,better)=>{ const av=a==null?null:+a, bv=b==null?null:+b; const w=av!=null&&bv!=null&&av!==bv?((better==='hi'?av>bv:av<bv)?'a':'b'):'';
    const tot=Math.abs(av||0)+Math.abs(bv||0)||1; return `<div class="spcmp ${w}"><b>${a==null?'–':typeof a==='number'&&!Number.isInteger(a)?spNum(a):a}</b><span><i style="width:${Math.round(Math.abs(av||0)/tot*100)}%"></i><em>${l}</em><i style="width:${Math.round(Math.abs(bv||0)/tot*100)}%"></i></span><b>${b==null?'–':typeof b==='number'&&!Number.isInteger(b)?spNum(b):b}</b></div>`; };
  const V=r=>r?(home?r.heim:r.ausw):null, Vo=r=>r?(home?r.ausw:r.heim):null;
  const others=next.slice(0,4);
  P.innerHTML=head+`
    <div class="card sphero">
      <div class="sph-meta">${svEsc(f.wettbewerb||SP_LIGA[sub]||'')} · ${spWd(f.datum)}${f.zeit?' · '+svEsc(f.zeit)+' Uhr':''} · ${home?'Heimspiel':'Auswärts'}</div>
      <div class="sph-vs"><div class="sph-t">${scCrest(f.heim,'xl')}</div><div class="sph-c"><b>${dd===0?'Heute':dd===1?'Morgen':'in '+dd+' Tagen'}</b><span>vs</span></div><div class="sph-t">${scCrest(f.gast,'xl')}</div></div>
      <div class="sph-names"><b>${svEsc(f.heim)}</b><b>${svEsc(f.gast)}</b></div>
      ${others.length>1?`<div class="sph-next">${others.map(x=>`<button class="${x.id===f.id?'on':''}" data-spsel="${svEsc(x.id)}">${spWd(x.datum)} · ${svEsc(x.heim_key===own?x.gast:x.heim)}</button>`).join('')}</div>`:''}
    </div>
    <div class="card"><h3 class="trh">${SVI('chart')} Direktvergleich</h3>
      <div class="spcmp-h"><b>${svEsc(team==='A'?'Wir':'Wir (II)')}</b><span></span><b>${svEsc(oppName)}</b></div>
      ${cmp('Tabellenplatz',U&&U.platz,G&&G.platz,'lo')}${cmp('Punkte',U&&U.punkte,G&&G.punkte,'hi')}
      ${cmp('Tore / Spiel',U&&U.spiele?U.tore/U.spiele:null,G&&G.spiele?G.tore/G.spiele:null,'hi')}${cmp('Gegentore / Spiel',U&&U.spiele?U.gegentore/U.spiele:null,G&&G.spiele?G.gegentore/G.spiele:null,'lo')}
      ${cmp(home?'Punkte/Spiel (wir heim · sie auswärts)':'Punkte/Spiel (wir ausw. · sie heim)',V(U)&&V(U).sp?V(U).pkt/V(U).sp:null,Vo(G)&&Vo(G).sp?Vo(G).pkt/Vo(G).sp:null,'hi')}
      <div class="spforms"><div>${spFormHtml(uF)}</div><small>Form (neueste links)</small><div>${spFormHtml(gF)}</div></div>
      ${U&&G&&(U.fieber||[]).length>1?`<h4 class="sph4">Fieberkurve: Tabellenplatz je Spieltag</h4>${spFeverSvg({n:team==='A'?'SV/BSC':'SV/BSC II',v:U.fieber||[]},{n:oppName,v:G.fieber||[]})}`:''}
    </div>
    <div class="card"><h3 class="trh">${SVI('target')} Auf diese Spieler achten</h3>
      ${oppPl.length?`<div class="futrow">${oppPl.map((p,i)=>fcCard(p,{size:'sm',badge:hot.get(p.id)?`🔥 ${hot.get(p.id)} Tor${hot.get(p.id)>1?'e':''} zuletzt`:(G&&G.tore?spPct(p.cur.tore,G.tore)+' % der Tore':''),anim:true,delay:i*70})).join('')}</div>`:'<div class="note">Noch keine Torschützen des Gegners in den Listen.</div>'}
      ${exs.length?`<div class="note">↩️ Ex-Mörlenbacher im Team: ${exs.map(p=>`<a data-svp="${svEsc(p.id)}">${svEsc(p.name)}</a>`).join(', ')}</div>`:''}
    </div>
    <div class="spgrid">
      <div class="card"><h3 class="trh">${svEsc(oppName)}</h3>
        ${gT.S.length?`<div class="spl ok"><b>Stärken</b>${gT.S.map(x=>`<span>＋ ${svEsc(x)}</span>`).join('')}</div>`:''}
        ${gT.W.length?`<div class="spl bad"><b>Hier packen wir sie</b>${gT.W.map(x=>`<span>－ ${svEsc(x)}</span>`).join('')}</div>`:''}
        ${!gT.S.length&&!gT.W.length?'<div class="note">Noch zu wenig Daten für ein klares Bild.</div>':''}</div>
      <div class="card"><h3 class="trh">Wir</h3>
        ${uT.S.length?`<div class="spl ok"><b>Unsere Waffen</b>${uT.S.map(x=>`<span>＋ ${svEsc(x)}</span>`).join('')}</div>`:''}
        ${uT.W.length?`<div class="spl bad"><b>Unsere Baustellen</b>${uT.W.map(x=>`<span>－ ${svEsc(x)}</span>`).join('')}</div>`:''}
        ${inj.length?`<div class="spl"><b>Fehlen verletzt</b><span>${inj.map(p=>svEsc(p.name)).join(', ')}</span></div>`:''}
        ${ourTop.length?`<div class="spl"><b>Unsere Torschützen</b><span>${ourTop.map(p=>`<a data-svp="${svEsc(p.id)}">${svEsc(p.name)}</a> ${p.cur.tore}${hotU.get(p.id)?' 🔥':''}`).join(' · ')}</span></div>`:''}</div>
    </div>
    ${h2h.length||prev.length?`<div class="card"><h3 class="trh">Bisherige Duelle</h3>${h2h.map(r=>{ const x=spRes(r,own); return `<div class="spres f${x.e}"><i>${x.e}</i><span>${r.datum?spWd(r.datum):'Spieltag bis '+TRC.fmt(r.bis)}</span><b>${svEsc(r.heim)} ${r.tore_heim}:${r.tore_gast} ${svEsc(r.gast)}</b></div>`; }).join('')}${prev.length?`<div class="note">${prev.join(' · ')}</div>`:''}</div>`:''}
    <div class="card spai"><div class="svc-h"><h3>${SVI('chat')} KI-Matchplan</h3>${TR.ai&&TR.ai.ready?`<button class="btn sm" id="spAiBtn">${SP.ai[f.id]?'Neu erstellen':'Matchplan erstellen'}</button>`:''}</div>
      ${SP.ai[f.id]?`<div class="spai-t">${spMd(SP.ai[f.id])}</div>`:TR.ai&&TR.ai.ready?'<div class="note">Der Co-Trainer fasst alles zusammen: worauf achten, wo wir sie packen, Vorschlag für Elf & Taktik.</div>':'<div class="note">Mit KI-Schlüssel (Admin → Nutzer & Rollen) erstellt der Co-Trainer hier einen Matchplan.</div>'}</div>
    <div class="note">Tabellen, Spielplan und Torjäger: FUSSBALL.DE (öffentlich). Ergebnisse berechnet die App aus der Veränderung der Tabelle, ohne Eintippen.</div>`;
  spBind(P);
  const ab=document.getElementById('spAiBtn'); if(ab)ab.onclick=()=>spAi(f,{home,oppName,oppKey,sub,U,G,uF,gF,gT,uT,oppPl,hot,inj,ourTop,h2h,own});
}
function spBind(P){
  P.querySelectorAll('[data-spteam]').forEach(b=>b.onclick=()=>{ SP.team=b.dataset.spteam; SP.sel=null; spRender(); });
  P.querySelectorAll('[data-spsel]').forEach(b=>b.onclick=()=>{ SP.sel=b.dataset.spsel; spRender(); });
  P.querySelectorAll('[data-svp]').forEach(a=>a.onclick=()=>openModal(a.dataset.svp));
}
function spMd(t){ return svEsc(t).replace(/\*\*(.+?)\*\*/g,'<b>$1</b>').replace(/^[-•]\s?/gm,'• ').replace(/\n/g,'<br>'); }
async function spAi(f,X){
  if(SP.aiBusy)return; SP.aiBusy=true; const b=document.getElementById('spAiBtn'); if(b){ b.disabled=true; b.textContent='Co-Trainer denkt nach …'; }
  const r=x=>x?`Platz ${x.platz}, ${x.punkte} Punkte, ${x.tore}:${x.gegentore} Tore nach ${x.spiele} Spielen; heim ${x.heim?x.heim.pkt+' Pkt/'+x.heim.sp+' Sp':'?'}, auswärts ${x.ausw?x.ausw.pkt+' Pkt/'+x.ausw.sp+' Sp':'?'}; Fieberkurve ${(x.fieber||[]).join('-')}`:'unbekannt';
  const fakten=[`Spiel: ${f.heim} · ${f.gast}, ${f.datum} ${f.zeit||''}, ${X.home?'wir haben Heimspiel':'wir spielen auswärts'} (${f.wettbewerb||X.sub}).`,
    `Wir: ${r(X.U)}. Form: ${X.uF.join('')||'?'}.`, `${X.oppName}: ${r(X.G)}. Form: ${X.gF.join('')||'?'}.`,
    `Gefährliche Spieler ${X.oppName}: ${X.oppPl.map(p=>`${p.name} (${p.pos||'?'}, ${p.cur.tore} Tore${X.hot.get(p.id)?', zuletzt '+X.hot.get(p.id)+' Tore':''})`).join('; ')||'keine bekannt'}.`,
    `Stärken Gegner: ${X.gT.S.join('; ')||'–'}. Schwächen Gegner: ${X.gT.W.join('; ')||'–'}.`,
    `Unsere Stärken: ${X.uT.S.join('; ')||'–'}. Unsere Baustellen: ${X.uT.W.join('; ')||'–'}.`,
    `Verletzt bei uns: ${X.inj.map(p=>p.name).join(', ')||'niemand'}. Unsere Torschützen: ${X.ourTop.map(p=>p.name+' '+p.cur.tore).join(', ')||'–'}.`,
    `Bisherige Duelle: ${X.h2h.map(h=>`${h.heim} ${h.tore_heim}:${h.tore_gast} ${h.gast}`).join('; ')||'keine erfasst'}.`].join('\n');
  try{ const {data,error}=await SVB.sb.functions.invoke('coach',{body:{mode:'gegner',gegner:{fixture:f.id,fakten,neu:!!SP.ai[f.id]}}}); if(error)throw error;
    if(!data||!data.ok)throw new Error(data&&data.error==='kein-schluessel'?'KI ist nicht eingerichtet':(data&&data.error&&(typeof svKiFehler==='function'?svKiFehler(data.error):data.error))||'keine Antwort'); SP.ai[f.id]=data.text; }
  catch(e){ kToast('⚠️ '+(e.message||e)); }
  SP.aiBusy=false; spRender();
}

/* ---------- Übersicht: nächstes Spiel ---------- */
function spHome(){
  const host=document.getElementById('svCockpit')||document.getElementById('svHello'); if(!host||!canScout()||!SP.loaded)return;
  let el=document.getElementById('spHome'); if(!el){ el=document.createElement('div'); el.id='spHome'; host.after(el); }
  const own=SP_OWN.A, f=spNext('A')[0], last=spResultsOf(own)[0];
  if(!f&&!last){ el.innerHTML=''; return; }
  const lr=last?spRes(last,own):null, dd=f?spDays(f.datum):null;
  el.innerHTML=`<div class="card sphome">${f?`<div class="sphm"><div class="sphm-t">${scCrest(f.heim)}<b>${svEsc(f.heim)}</b></div><div class="sphm-c"><small>${spWd(f.datum)}${f.zeit?' · '+svEsc(f.zeit):''}</small><b>${dd===0?'HEUTE':dd===1?'Morgen':'in '+dd+' T.'}</b></div><div class="sphm-t">${scCrest(f.gast)}<b>${svEsc(f.gast)}</b></div></div>`:''}
    ${lr?`<div class="sphm-last f${lr.e}"><i>${lr.e}</i>Zuletzt: ${svEsc(last.heim)} <b>${last.tore_heim}:${last.tore_gast}</b> ${svEsc(last.gast)}${(last.scorers||[]).filter(s=>s.club_key===own).length?` · Tore: ${(last.scorers||[]).filter(s=>s.club_key===own).map(s=>svEsc(s.name.split(' ').pop())+(s.tore>1?' '+s.tore:'')).join(', ')}`:''}</div>`:''}
    <div class="btnrow">${f?`<button class="btn sm" data-sph="gegner">${SVI('target')} Gegnercheck</button>`:''}<button class="btn ghost sm" data-sph="totw">${SVI('star')} Elf der Woche</button></div></div>`;
  el.querySelectorAll('[data-sph]').forEach(b=>b.onclick=()=>goTab(b.dataset.sph));
  try{ svHomeOrder(); }catch(e){}
}

/* ---------- Elf der Woche ---------- */
const TW_SLOTS=[['TW',50,88],['LV',13,66],['IV',37,69],['IV',63,69],['RV',87,66],['ZM',22,42],['ZM',50,45],['ZM',78,42],['LA',17,15],['ST',50,11],['RA',83,15]];
const TW_GRP={TW:'TW',LV:'DEF',IV:'DEF',RV:'DEF',ZM:'MID',LA:'ATT',ST:'ATT',RA:'ATT'};
const twGroup=p=>{ const x=p&&p.pos; return x==='TW'?'TW':x==='IV'||x==='AV'?'DEF':x==='ZM'||x==='OM'?'MID':'ATT'; };
async function twRender(){
  const P=document.getElementById('panel-totw'); if(!P)return;
  if(!canScout()){ P.innerHTML='<div class="card"><div class="empty">Die Elf der Woche sieht das Trainerteam.</div></div>'; return; }
  if(!SP.loaded){ P.innerHTML='<div class="card"><div class="empty">Lade Torjägerlisten …</div></div>'; spLoad(); return; }
  const sub=SP.tw.sub; const S=await spSnaps(sub); const st=[...new Set(S.map(r=>r.stand))].sort();
  let mode=SP.tw.mode, win=null, cand=[];
  const byPid=r=>trP(r.player_id||r.pkey);
  if(mode==='tag'&&st.length>=2){
    for(let i=st.length-1;i>0&&!cand.length;i--){ const A=new Map(S.filter(r=>r.stand===st[i-1]).map(r=>[r.pkey,r.tore]));
      cand=S.filter(r=>r.stand===st[i]).map(r=>({r,g:r.tore-(A.get(r.pkey)??0),known:A.has(r.pkey)})).filter(x=>x.g>0&&(x.known||x.r.tore<=3)); if(cand.length)win=[st[i-1],st[i]]; }
  }
  if(!cand.length){ mode='saison'; const L=st[st.length-1]; cand=S.filter(r=>r.stand===L&&r.tore>0).map(r=>({r,g:r.tore})); }
  cand=cand.map(x=>({...x,p:byPid(x.r)})).filter(x=>x.p).map(x=>({...x,sc:mode==='tag'?x.g*10+(x.r.team_sp?x.r.tore/x.r.team_sp:0):x.r.tore/Math.max(1,x.r.team_sp||1)*4+x.r.tore*0.3})).sort((a,b)=>b.sc-a.sc);
  // Aufstellung nach Positionen, fehlende Positionen mit den nächstbesten füllen
  const used=new Set(), slots=TW_SLOTS.map(()=>null);
  TW_SLOTS.forEach((s,i)=>{ const g=TW_GRP[s[0]]; if(g==='TW')return; const x=cand.find(c=>!used.has(c.p.id)&&twGroup(c.p)===g); if(x){ slots[i]=x; used.add(x.p.id); } });
  TW_SLOTS.forEach((s,i)=>{ if(slots[i]||s[0]==='TW')return; const x=cand.find(c=>!used.has(c.p.id)); if(x){ slots[i]=x; used.add(x.p.id); } });
  // Torwart-Platz: Mannschaft mit weißer Weste (oder beste Abwehr)
  let keeper=null;
  if(SP_LIGA[sub]&&!sub.startsWith('AJ')){ const tabs=SP.tabs.filter(r=>r.sub===sub); const L=[...new Set(tabs.map(r=>r.stand))].sort();
    if(mode==='tag'&&win){ const a=new Map(tabs.filter(r=>r.stand===win[0]).map(r=>[r.club_key,r])); const z=tabs.filter(r=>r.stand===win[1]).filter(r=>{ const o=a.get(r.club_key); return o&&r.spiele>o.spiele&&r.gegentore===o.gegentore; }); if(z.length)keeper={club:z[0].club,t:'Zu Null gespielt'+(z.length>1?` (+${z.length-1} weitere)`:'')}; }
    if(!keeper&&L.length){ const z=tabs.filter(r=>r.stand===L[L.length-1]&&r.spiele>=3).sort((x,y)=>x.gegentore/x.spiele-y.gegentore/y.spiele)[0]; if(z)keeper={club:z.club,t:`Beste Abwehr: ${spNum(z.gegentore/z.spiele)} Gegentore/Spiel`}; } }
  const motm=cand[0];
  const seenKey='svbc-totw-'+sub+'-'+(win?win[1]:'s'); let fresh=false; try{ fresh=!localStorage.getItem(seenKey); localStorage.setItem(seenKey,'1'); }catch(e){}
  const subs=['A','KOL','B','C','D1','D2','GL','AJ-BS','AJ-GL','AJ-VL'];
  const card=(x,i,role)=>x?fcCard(x.p,{size:'xs',tier:x===motm?'motm':'totw',badge:mode==='tag'?`⚽ ${x.g}`:`${x.r.tore} T`,sub:role,anim:fresh,delay:i*110}):`<div class="fut xs empty"><div class="fut-in"><div class="fut-f"><em>${role}</em></div></div></div>`;
  const rest=cand.filter(c=>!used.has(c.p.id)).slice(0,24);
  const ownIn=cand.filter(c=>c.p.own);
  P.innerHTML=`<div class="trtop"><div class="trtabs twsubs">${subs.map(s=>`<button class="${sub===s?'on':''}" data-twsub="${s}">${svEsc(SP_LIGA[s]||s)}</button>`).join('')}</div>
      <div class="trtabs"><button class="${SP.tw.mode==='tag'?'on':''}" data-twm="tag">Spieltag</button><button class="${SP.tw.mode==='saison'?'on':''}" data-twm="saison">Saison</button></div></div>
    <div class="card twcard"><div class="svc-h"><h3>${SVI('star')} ${mode==='tag'?'Elf der Woche':'Elf der Saison'} · ${svEsc(SP_LIGA[sub]||sub)}</h3><small class="note">${mode==='tag'&&win?`Tore zwischen ${TRC.fmt(win[0])} und ${TRC.fmt(win[1])}`:SP.tw.mode==='tag'?'Für den Spieltag braucht es zwei Daten-Stände, bis dahin die Saison-Elf':'Nach Toren pro Spiel'}</small></div>
      ${cand.length?`<div class="twpitch"><div class="twlines"></div>${TW_SLOTS.map((s,i)=>`<div class="twslot" style="left:${s[1]}%;top:${s[2]}%">${s[0]==='TW'?(keeper?`<div class="fut xs totw keeper fut-noflip"><div class="fut-in"><div class="fut-f"><div class="fut-sh"></div><div class="fut-ov"><b>🧤</b><span>TW</span></div><div class="fut-pic kp">${scCrest(keeper.club,'xl')}</div><div class="fut-nm"><b>${svEsc(keeper.club)}</b><i>${svEsc(keeper.t)}</i></div></div></div></div>`:card(null,i,'TW')):card(slots[i],i,s[0])}</div>`).join('')}</div>`
        :'<div class="empty">Noch keine Torschützen in dieser Liga.</div>'}
      ${motm?`<div class="twmotm">${SVI('star')} <b>Spieler des ${mode==='tag'?'Spieltags':'Saison'}:</b> <a data-svp="${svEsc(motm.p.id)}">${svEsc(motm.p.name)}</a> (${svEsc(motm.r.club||'')}) · ${mode==='tag'?motm.g+' Tor'+(motm.g>1?'e':''):motm.r.tore+' Tore in '+(motm.r.team_sp||'?')+' Spielen'}</div>`:''}
      ${ownIn.length?`<div class="note">🟢 Von uns dabei: ${ownIn.map(c=>`<a data-svp="${svEsc(c.p.id)}">${svEsc(c.p.name)}</a> (${mode==='tag'?c.g:c.r.tore})`).join(', ')}</div>`:''}
    </div>
    ${rest.length?`<div class="card"><h3 class="trh">Weitere Torschützen</h3><div class="twrest">${rest.map(c=>`<button class="twr" data-svp="${svEsc(c.p.id)}">${avaHtml(c.p)}<b>${svEsc(c.p.name)}</b><span>${svEsc(c.r.club||'')}</span><em>${mode==='tag'?'⚽ '+c.g:c.r.tore+' T'}</em></button>`).join('')}</div></div>`:''}
    <div class="note">Aus den Torjägerlisten von FUSSBALL.DE. Positionen laut Scouting-Datenbank: wo keine bekannt ist, stellt die App nach Toren auf. Karten antippen zum Umdrehen.</div>`;
  P.querySelectorAll('[data-twsub]').forEach(b=>b.onclick=()=>{ SP.tw.sub=b.dataset.twsub; twRender(); });
  P.querySelectorAll('[data-twm]').forEach(b=>b.onclick=()=>{ SP.tw.mode=b.dataset.twm; twRender(); });
  P.querySelectorAll('[data-svp]').forEach(a=>a.onclick=()=>openModal(a.dataset.svp));
}

/* ---------- A-Jugend-Radar (ersetzt die alte Jugendliste) ---------- */
const JU_LIGEN=[['alle','Alle'],['AJ-BS','U19 Kreis BS'],['AJ-GL','U19 Gruppenliga'],['AJ-VL','U19 Verbandsliga'],['AJ-HL','U19 Hessenliga'],['AJ-ODW','U19 Odenwald'],['AJ-MA','U19 Mannheim'],['AJ-HD','U19 Heidelberg'],['BJ-BS2','Eigene U17']];
function juMeta(p){ return (DATA.jugend||[]).find(j=>j.id===p.id)||{}; }
function juEigen(p){ const m=juMeta(p); return !!(m.own||(crmOf(p)||{}).eg); }
function juScore(p){ const m=juMeta(p), sp=m.teamSp||p.teamSp||0, q=sp?(m.tore||p.tore||0)/sp:0; const W=typeof wscoreSafe==='function'?wscoreSafe(p):null; return q*(m.w||p.jw||0.42)*100*(W?0.5+W.w/100:1)+(m.tore||0)*0.4; }
renderJugend=function(){
  const box=document.getElementById('jugendlist'); if(!box)return;
  const J=players.filter(p=>p.isJugend&&!juMeta(p).alt), F=SP.jf;
  const inL=p=>F.liga==='alle'||juMeta(p).liga===F.liga, inR=p=>!F.region||juEigen(p)||(p.km!=null&&p.km<=25);
  const eig=J.filter(juEigen).sort((a,b)=>(b.tore||0)-(a.tore||0));
  const L=J.filter(p=>!juEigen(p)&&inL(p)&&inR(p)&&juMeta(p).liga!=='BJ-BS2').sort((a,b)=>juScore(b)-juScore(a));
  const alt=players.filter(p=>p.isJugend&&juMeta(p).alt).length;
  box.innerHTML=`<div class="card jucard"><div class="trtabs jul">${JU_LIGEN.map(([k,t])=>`<button class="${F.liga===k?'on':''}" data-jul="${k}">${t}</button>`).join('')}</div>
      <label class="jutog"><input type="checkbox" id="juReg" ${F.region?'checked':''}> Nur Region (bis 25 km)</label>
      <div class="note">${J.length} Jugendspieler aus ${new Set(J.map(p=>juMeta(p).liga)).size} Ligen · A-Jugend (U19) im Umkreis bis Mannheim/Heidelberg/Darmstadt · eigene B-Jugend. Jahrgang 2008 wird zur neuen Saison Senior, jetzt ist die Zeit, Kontakt zu halten.</div></div>
    ${eig.length?`<div class="card"><h3 class="trh">🌱 Eigene Talente</h3><div class="note" style="margin-top:0">Früh ins Seniorentraining einbinden. Spieler per Profil als „Eigengewächs“ markieren, dann meldet das Radar jedes Tor.</div><div class="futgrid">${eig.map((p,i)=>fcCard(p,{size:'sm',badge:`${p.tore} Tore`,anim:true,delay:i*60})).join('')}</div></div>`:''}
    <div class="card"><h3 class="trh">${SVI('sprout')} Top-Talente der Region</h3>${L.length?`<div class="futgrid">${L.slice(0,24).map((p,i)=>fcCard(p,{size:'sm',badge:`${p.tore} T · ${juMeta(p).teamSp?spNum(p.tore/juMeta(p).teamSp):'–'}/Sp.`,sub:svEsc(juMeta(p).kurz||''),anim:true,delay:i*40})).join('')}</div>`:'<div class="empty">Keine Treffer mit diesem Filter.</div>'}
      ${L.length>24?`<div class="jurest">${L.slice(24,80).map(p=>`<button class="twr" data-svp="${svEsc(p.id)}">${avaHtml(p)}<b>${svEsc(p.name)}</b><span>${svEsc(p.club)} · ${svEsc(juMeta(p).kurz||'')}${p.km!=null?' · '+p.km+' km':''}</span><em>${p.tore} T</em></button>`).join('')}</div>`:''}</div>
    ${alt?`<div class="note">${alt} Einträge aus der Vorsaison sind ausgeblendet (Notizen bleiben erhalten).</div>`:''}`;
  box.querySelectorAll('[data-jul]').forEach(b=>b.onclick=()=>{ SP.jf.liga=b.dataset.jul; renderJugend(); });
  const rg=document.getElementById('juReg'); if(rg)rg.onchange=()=>{ SP.jf.region=rg.checked; renderJugend(); };
  box.querySelectorAll('[data-svp]').forEach(a=>a.onclick=()=>openModal(a.dataset.svp));
};

/* ---------- Radar: KI-Urteil sichtbar, Unrealistisches ausgeblendet ---------- */
RD_TYP.ajung='A-Jugend'; RD_TYP.eigen='Eigene Jugend';
{ const _ri=rdItem; rdItem=function(r){ let h=_ri.apply(this,arguments); const a=r.ai, w=r.data&&r.data.w;
    const tag=a?`<span class="aitag ${({realistisch:'ok',beobachten:'mid',unrealistisch:'bad'})[a.urteil]||''}" title="${svEsc(a.text||'')}">KI: ${svEsc(a.urteil||'')}${a.score!=null?' '+a.score:''}</span>`:(w!=null?`<span class="aitag ${w>=60?'ok':w>=40?'mid':'bad'}" title="${svEsc((r.data.wf||[]).join(' · '))}">Realismus ${w}</span>`:'');
    const txt=a&&a.text?`<small class="aitxt">${svEsc(a.text)}</small>`:'';
    return tag||txt?h.replace('<small class="rdmeta">',txt+'<small class="rdmeta">'+tag+' '):h; }; }
{ const _rr=rdRender; rdRender=function(){ const keep=VR.radar; if(!VR.showUnreal)VR.radar=keep.filter(r=>!(r.ai&&r.ai.urteil==='unrealistisch'));
    try{ _rr.apply(this,arguments); }finally{ VR.radar=keep; }
    const P=document.getElementById('panel-radar'); if(!P||!VR.radarLoaded||!canScout())return;
    const hid=keep.filter(r=>r.ai&&r.ai.urteil==='unrealistisch').length, types=P.querySelector('.rdf');
    if(types&&!P.querySelector('#rdAiBar')){ const d=document.createElement('div'); d.id='rdAiBar'; d.className='rdaibar';
      d.innerHTML=`${hid?`<button class="btn ghost sm" id="rdUnreal">${VR.showUnreal?'Unrealistische ausblenden':hid+' unrealistische eingeblendet? Anzeigen'}</button>`:''}${(svRole()==='admin'||svRole()==='vorstand'||svRole()==='planer')&&TR.ai&&TR.ai.ready?`<button class="btn sm" id="rdAiRun">${SVI('chat')} KI-Scouts jetzt prüfen lassen</button>`:''}<small class="note">Jede Meldung ist gegen Liga-Abstand, Entfernung, Rolle im Team und Alter geprüft; mit KI-Schlüssel sichtet zusätzlich ein günstiges Modell alle Kandidaten und ein starkes Modell schreibt für die besten ein Dossier.</small>`;
      types.after(d);
      const u=d.querySelector('#rdUnreal'); if(u)u.onclick=()=>{ VR.showUnreal=!VR.showUnreal; rdRender(); };
      const g=d.querySelector('#rdAiRun'); if(g)g.onclick=async()=>{ g.disabled=true; g.textContent='KI-Scouts arbeiten …';
        try{ const {data,error}=await SVB.sb.functions.invoke('scout-ai',{body:{}}); if(error)throw error; if(data&&data.ok===false)throw new Error(data.error==='kein-schluessel'?'KI ist nicht eingerichtet':data.error);
          kToast(data&&data.gestartet?'🤖 KI-Scouts laufen: Ergebnisse erscheinen in 1–2 Minuten':'✓ '+(data.grob||0)+' geprüft, '+(data.fein||0)+' Dossiers'); setTimeout(()=>vrLoadRadar(),data&&data.gestartet?60000:500); }
        catch(e){ kToast('⚠️ '+(e.message||e)); } g.disabled=false; g.innerHTML=SVI('chat')+' KI-Scouts jetzt prüfen lassen'; };
    } }; }

/* ---------- Cockpit: Schnellaktionen & Hinweise ---------- */
SV_ACTIONS.trainer[1]=['target','Gegnercheck',()=>goTab('gegner')];
SV_ACTIONS.planer[3]=['sprout','A-Jugend',()=>goTab('jugend')];
SV_ACTIONS.vorstand.splice(1,3,['target','Gegnercheck',()=>goTab('gegner')],['radar','Radar',()=>goTab('radar')],['star','Elf der Woche',()=>goTab('totw')]);
SV_ACTIONS.admin.splice(2,2,['target','Gegnercheck',()=>goTab('gegner')],['star','Elf der Woche',()=>goTab('totw')]);
{ const _si=svInsights; svInsights=function(){ const base=_si.apply(this,arguments); const add=[];
    try{ if(SP.loaded&&canScout()){ const r=svRole(), own=SP_OWN.A, f=spNext('A')[0], last=spResultsOf(own)[0];
      if(f){ const d=spDays(f.datum); if(d<=4)add.push({prio:r==='trainer'?0.2:r==='vorstand'?1.5:2.5,lvl:d<=1?'hoch':'mittel',t:`${d===0?'Heute':d===1?'Morgen':spWd(f.datum)}: ${f.heim_key===own?'gegen '+f.gast:'bei '+f.heim}${f.zeit?' · '+f.zeit:''}`,d:'Gegnercheck: Stärken, Schwächen, gefährliche Spieler',go:()=>goTab('gegner')}); }
      if(last&&last.bis&&TRC.diffDays(trToday(),last.bis)<=3){ const x=spRes(last,own); add.push({prio:0.8,lvl:x.e==='N'?'mittel':'info',t:`${x.e==='S'?'Sieg':x.e==='U'?'Remis':'Niederlage'}: ${last.heim} ${last.tore_heim}:${last.tore_gast} ${last.gast}`,d:'Automatisch aus der FUSSBALL.DE-Tabelle: nichts einzutragen',go:()=>goTab('gegner')}); } } }catch(e){}
    return add.concat(base).sort((a,b)=>a.prio-b.prio).slice(0,6); }; }
{ const _ho=svHomeOrder; svHomeOrder=function(){ _ho.apply(this,arguments); const host=document.getElementById('svCockpit'), el=document.getElementById('spHome'); if(host&&el&&host.nextSibling!==el&&['trainer','vorstand','admin'].includes(svRole()))host.after(el); }; }
{ const _gt5=goTab; goTab=function(tab){ const r=_gt5.apply(this,arguments); try{ if(tab==='gegner')spRender(); if(tab==='totw')twRender(); if(tab==='jugend')renderJugend(); }catch(e){ console.warn(e); } return r; }; }
{ const _si2=svInit; svInit=function(){ const r=_si2.apply(this,arguments); setTimeout(()=>{ scLoadCrests().then(()=>{ try{ renderJugend(); }catch(e){} }); scLoadPhotos(); spLoad(); },700); return r; }; }

/* ---------- Admin: KI-Kosten im Griff (Monatsbudget mit hartem Stopp) ---------- */
async function spCostCard(P){
  if(!P||!isAdmin()||P.querySelector('#spCost'))return;
  let s=null; try{ const {data}=await SVB.sb.rpc('ai_status'); s=data; }catch(e){}
  if(!s)return;
  const sp=+s.spent||0, bu=+s.budget||5, pct=Math.min(100,Math.round(sp/Math.max(0.01,bu)*100));
  const NM={'co-trainer':'Co-Trainer (Chat, Lagebild, Gegnercheck)',sichter:'KI-Sichter (Radar grob)',chefscout:'KI-Chefscout (Dossiers)',lauf:'Läufe'};
  const el=document.createElement('div'); el.className='card'; el.id='spCost';
  el.innerHTML=`<div class="adm-head"><div><h3 style="margin:0;display:flex;gap:8px;align-items:center">${SVI('shield')} KI-Kosten & Agenten</h3>
      <p style="margin:6px 0 0;font-size:13.5px">Alles ohne KI läuft kostenlos (Daten, Radar-Filter, Gegnercheck, Elf der Woche, Rankings). KI kostet nur, wenn sie genutzt wird, mit hartem Monatsdeckel: Ist das Budget erreicht, pausieren die KI-Scouts bis zum Monatsersten.</p></div>
      <span class="pill ${pct>=90?'off':pct>=60?'wait':'on'}">${sp.toFixed(2)} $ von ${bu.toFixed(0)} $</span></div>
    <div class="costbar"><i style="width:${pct}%"></i></div>
    ${(s.runs||[]).filter(r=>r.agent!=='lauf').length?`<div class="costrows">${s.runs.filter(r=>r.agent!=='lauf').map(r=>`<div><span>${svEsc(NM[r.agent]||r.agent)}</span><b>${(+r.usd).toFixed(2)} $</b><small>${r.n}×</small></div>`).join('')}</div>`:'<div class="note">Diesen Monat noch keine KI-Kosten.</div>'}
    <div class="invite" style="grid-template-columns:1fr 1fr auto"><div><label for="spBudget">Monatsbudget (USD)</label><input id="spBudget" class="search" type="number" min="0" max="500" step="1" value="${bu}"></div>
      <div><label for="spAgents">KI-Scouts im Hintergrund</label><select id="spAgents"><option value="1"${s.agents!==false?' selected':''}>an (nach jedem Daten-Update)</option><option value="0"${s.agents===false?' selected':''}>aus</option></select></div>
      <button class="btn" id="spCostSave" style="height:46px">Speichern</button></div>
    <p class="note">Richtwerte: Radar-Grobcheck ≈ 1 Cent pro Lauf (günstiges Modell), Dossier ≈ 3–4 Cent (max. 2 pro Lauf), Co-Trainer-Frage ≈ 1–2 Cent (wiederholter Kontext wird zwischengespeichert und kostet nur ein Zehntel). Realistisch 2–5 $ im Monat.</p>`;
  (P.querySelector('#trAi')||P.lastElementChild).after(el);
  el.querySelector('#spCostSave').onclick=async()=>{ try{ const {error}=await SVB.sb.rpc('ai_agents_set',{p_budget:+el.querySelector('#spBudget').value,p_agents:el.querySelector('#spAgents').value==='1'}); if(error)throw error; kToast('✓ KI-Budget gespeichert'); el.remove(); spCostCard(P); }catch(e){ kToast('⚠️ '+(e.message||e)); } };
}
{ const _ar2=svAdminRender; svAdminRender=async function(){ const r=await _ar2.apply(this,arguments); try{ await spCostCard(document.getElementById('panel-admin')); }catch(e){} return r; }; }
/* ---------- Admin: Sicherung herunterladen ---------- */
async function spBackupCard(P){
  if(!P||!isAdmin()||P.querySelector('#spBackup'))return;
  let last=''; try{ last=localStorage.getItem('svbc-backup-at')||''; }catch(e){}
  const el=document.createElement('div'); el.className='card'; el.id='spBackup';
  const old=!last||Date.now()-new Date(last)>14*864e5;
  el.innerHTML=`<div class="adm-head"><div><h3 style="margin:0;display:flex;gap:8px;align-items:center">${SVI('lock')} Sicherung</h3>
