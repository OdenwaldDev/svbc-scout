  if(KAL.loaded&&!force){ von=von<KAL.von?von:KAL.von; bis=bis>KAL.bis?bis:KAL.bis; }
  try{
    const {data,error}=await SVB.sb.rpc('kalender',{p_von:von,p_bis:bis}); if(error)throw error;
    KAL.items=data.items||[]; KAL.von=von; KAL.bis=bis; KAL.flags={bearbeiten:data.bearbeiten,helfer:data.helfer,geb:data.geb,teams:data.teams||[],treff:!!data.treff}; KAL.loaded=true; KAL.t=Date.now(); KAL.err=null;
    if(!KAL.wap){ KAL.wap=true; try{ const w=await SVB.sb.rpc('wappen_liste'); if(w.data)Object.entries(w.data).forEach(([k,v])=>{ if(!SVC.crest.has(k))SVC.crest.set(k,v); }); }catch(e){} }
  }catch(e){ console.warn('Termine',e); KAL.err=String(e.message||e); }
  KAL.busy=false; freigeben();
  if(KAL.gebNeu){ KAL.gebNeu=false; kalLoad(KAL.von,KAL.bis,true); return; }
  try{ if(svCurTab()==='kalender')kalRender(); if(svCurTab()==='home')kalHome(); }catch(e){}
}

/* ---------- Darstellung ---------- */
function kalSpielZeile(i,gross){
  const wir=kalWir(i.m), heim=i.heim!==false, a=heim?wir:i.gegner, b=heim?i.gegner:wir;
  const erg=i.erg?(heim?i.erg:i.erg.split(':').reverse().join(':')):'';
  const [w,g]=i.erg?i.erg.split(':').map(Number):[null,null], res=i.erg?(w>g?'s':w===g?'u':'n'):'';
  if(!gross){   // Liste: zwei Zeilen untereinander, Uhrzeit oder Ergebnis rechts. Passt auch bei langen Namen aufs Handy
    const [ea,eb]=erg?erg.split(':'):['',''];
    return `<div class="kal-sp2"><span class="kal-t">${scCrest(a)}<b>${svEsc(a)}</b>${erg?`<em class="kal-e1 ${res}">${svEsc(ea)}</em>`:''}</span><span class="kal-t">${scCrest(b)}<b>${svEsc(b)}</b>${erg?`<em class="kal-e1 ${res}">${svEsc(eb)}</em>`:''}</span></div>`;
  }
  return `<div class="kal-sp${gross?' xl':''}"><span class="kal-t">${scCrest(a,gross?'xl':'')}<b>${svEsc(a)}</b></span>
    ${erg?`<em class="kal-erg ${res}">${svEsc(erg)}</em>`:`<em class="kal-vs">${i.z?svEsc(i.z):'vs'}</em>`}
    <span class="kal-t r">${scCrest(b,gross?'xl':'')}<b>${svEsc(b)}</b></span></div>`;
}
function kalItemHtml(i){
  const c=kalFarbe(i), tag=i.k==='spiel'?kalTeamName(i.m):i.k==='event'?(KAL_EART[i.a]||KAL_EART.sonstiges)[1]:'Geburtstag';
  let body='';
  if(i.k==='spiel'){
    body=kalSpielZeile(i)+`<div class="kal-meta">${[i.z?i.z+' Uhr':'',i.liga,i.heim===true?'Heimspiel':i.heim===false?'Auswärts':''].filter(Boolean).map(svEsc).join(' · ')}</div>`;
  }else if(i.k==='event'){
    const e=KAL_EART[i.a]||KAL_EART.sonstiges;
    body=`<div class="kal-ev"><span class="kal-emo">${e[0]}</span><b>${svEsc(i.t)}</b></div>
      <div class="kal-meta">${kalSichtText(i.sicht)?`<span class="kal-lock">🔒 ${svEsc(kalSichtText(i.sicht))}</span>`:''}${[i.bis&&i.bis!==i.d?'bis '+kalWt(i.bis)+'., '+kalDM(i.bis):'',i.z?i.z+' Uhr':'',i.ort].filter(Boolean).map(svEsc).join(' · ')}${KAL.flags.helfer&&i.hz?` · ${SVI('users')} ${i.hz}`:''}</div>`;
  }else body=`<div class="kal-ev"><span class="kal-emo">🎂</span><b>${svEsc(i.t)}</b><span class="kal-alter">wird ${svEsc(i.alter)}</span></div>`;
  return `<button type="button" class="kal-it${i.d<kalHeute()?' vorbei':''}" data-kid="${svEsc(i.id)}" style="--c:${c}"><i class="kal-bar"></i><div class="kal-b">${body}</div><span class="kal-tag">${svEsc(tag)}</span></button>`;
}
function kalListe(L){
  const h=kalHeute(); let out='', mon='', tag='', heute=false;
  L.forEach(i=>{
    const m=i.d.slice(0,7);
    if(m!==mon){ mon=m; out+=`<h3 class="kal-mon">${KAL_MON[+m.slice(5)-1]} ${m.slice(0,4)}</h3>`; }
    if(!heute&&i.d>=h){ heute=true; out+=`<div class="kal-jetzt" id="kalJetzt"><span>${i.d===h?'Heute':'Als Nächstes'}</span></div>`; }
    if(i.d!==tag){ tag=i.d; const r=kalRel(i.d); out+=`<div class="kal-tagk${i.d===h?' heute':''}"><b>${kalDM(i.d).slice(0,2)}</b><span>${kalWt(i.d)}</span>${r?`<em>${r}</em>`:''}</div>`; }
    out+=kalItemHtml(i);
  });
  if(!heute)out+=`<div class="kal-jetzt" id="kalJetzt"><span>Heute</span></div><p class="note kal-leer">Danach steht in deiner Auswahl noch nichts an.</p>`;
  return out;
}
function kalMonat(L){
  const m=KAL.monat||kalHeute().slice(0,7), [y,mo]=m.split('-').map(Number), erster=new Date(y,mo-1,1), start=(erster.getDay()+6)%7, tage=new Date(y,mo,0).getDate();
  const nach={}; L.forEach(i=>{ let d=i.d; const bis=i.bis&&i.bis>i.d?i.bis:i.d; while(d<=bis){ (nach[d]=nach[d]||[]).push(i); d=kalAdd(d,1); } });
  const h=kalHeute(), sel=KAL.tag&&KAL.tag.startsWith(m)?KAL.tag:(h.startsWith(m)?h:null);
  let g=''; for(let k=0;k<start;k++)g+='<span class="kal-d leer"></span>';
  for(let d=1;d<=tage;d++){ const s=`${m}-${String(d).padStart(2,'0')}`, I=nach[s]||[];
    g+=`<button type="button" class="kal-d${s===h?' heute':''}${s===sel?' sel':''}${I.length?' voll':''}" data-kd="${s}"><b>${d}</b><span>${I.slice(0,4).map(i=>`<i style="--c:${kalFarbe(i)}"></i>`).join('')}</span></button>`; }
  const T=sel?(nach[sel]||[]):[], geladen=sel&&KAL.von<=sel&&KAL.bis>=sel;
  return `<div class="card kal-mcard"><div class="kal-mh"><button type="button" class="iconbtn" data-km="-1" aria-label="Vormonat">‹</button><b>${KAL_MON[mo-1]} ${y}</b><button type="button" class="iconbtn" data-km="1" aria-label="Nächster Monat">›</button></div>
    <div class="kal-grid">${['Mo','Di','Mi','Do','Fr','Sa','So'].map(w=>`<span class="kal-wt">${w}</span>`).join('')}${g}</div></div>
    ${sel?`<h3 class="kal-mon">${kalLang(sel)}</h3>${!geladen?'<p class="note">Termine für diesen Tag sind noch nicht geladen.</p>':T.length?T.map(kalItemHtml).join(''):'<p class="note">An diesem Tag steht nichts an.</p>'}`:''}`;
}
function kalRender(){
  const P=kalPanel(); if(!P)return;
  if(!KAL.loaded){ if(KAL.err){ P.innerHTML=kalFehlerHtml(); kalFehlerBinden(P); } else { P.innerHTML='<div class="card"><div class="empty">Lade Termine …</div></div>'; kalLoad(); } return; }
  const f=kalFilter(), L=kalSichtbar(), chips=kalChips(), adm=svRole()==='admin';
  P.innerHTML=`<div class="trtop kal-top"><div class="trtabs"><button class="${KAL.view==='liste'?'on':''}" data-kv="liste">Liste</button><button class="${KAL.view==='monat'?'on':''}" data-kv="monat">Monat</button></div>
      <div class="tract"><button class="btn ghost" id="kalAbo" type="button">${SVI('cal')} In meinen Kalender</button>${kalDarfAnlegen()?`<button class="btn" id="kalNeu" type="button">${SVI('plus')} Termin</button>`:''}${adm?`<button class="btn ghost" id="kalGeb" type="button" title="Geburtstage einfügen">🎂</button>`:''}</div></div>
    ${kalFehlerHtml()}
    <div id="kalBody">${KAL.view==='monat'?kalMonat(L):`${KAL.von>'2013-07-01'?`<button type="button" class="btn ghost sm kal-frueher" id="kalFrueher">${SVI('clock')} Frühere Termine laden</button>`:''}${L.length?kalListe(L):'<div class="card"><div class="empty">Unten auswählen, was du sehen willst.</div></div>'}`}</div>
    <div class="kal-fbar" role="group" aria-label="Was angezeigt wird"><div class="kal-fin"><button type="button" class="kal-chip alle${chips.every(c=>f.has(c.k))?' on':''}" data-kfa style="--c:#94a3b8"><i></i>Alle</button>${chips.map(c=>`<button type="button" class="kal-chip${f.has(c.k)?' on':''}" data-kf="${svEsc(c.k)}" style="--c:${c.c}" aria-pressed="${f.has(c.k)}"><i></i>${svEsc(c.t)}</button>`).join('')}</div></div>`;
  P.querySelectorAll('[data-kv]').forEach(b=>b.onclick=()=>{ KAL.view=b.dataset.kv; kalRender(); });
  P.querySelectorAll('[data-kf]').forEach(b=>b.onclick=()=>{ const k=b.dataset.kf; f.has(k)?f.delete(k):f.add(k); kalFilterSave(); const y=window.scrollY; kalRender(); window.scrollTo(0,y); });
  const fa=P.querySelector('[data-kfa]'); if(fa)fa.onclick=()=>{ const alle=chips.every(c=>f.has(c.k)); if(alle){ KAL.f=null; try{ localStorage.removeItem(kalKey()); }catch(e){} kalFilter(); } else chips.forEach(c=>f.add(c.k)); if(!alle)kalFilterSave(); const y=window.scrollY; kalRender(); window.scrollTo(0,y); };
  P.querySelectorAll('[data-kid]').forEach(b=>b.onclick=()=>kalDetail(b.dataset.kid));
  P.querySelectorAll('[data-kd]').forEach(b=>b.onclick=()=>{ KAL.tag=b.dataset.kd; kalRender(); });
  P.querySelectorAll('[data-km]').forEach(b=>b.onclick=async()=>{ const [y,m]=(KAL.monat||kalHeute().slice(0,7)).split('-').map(Number), d=new Date(y,m-1+(+b.dataset.km),1);
    KAL.monat=d.getFullYear()+'-'+String(d.getMonth()+1).padStart(2,'0'); KAL.tag=null; const v=KAL.monat+'-01', e=kalAdd(KAL.monat+'-28',5);
    if(v<KAL.von||e>KAL.bis)await kalLoad(v<KAL.von?v:null,e>KAL.bis?e:null); kalRender(); });
  const fr=P.querySelector('#kalFrueher'); if(fr)fr.onclick=async()=>{ fr.disabled=true; const v=kalAdd(KAL.von,-365); await kalLoad(v<'2013-07-01'?'2013-07-01':v,null); };
  P.querySelector('#kalAbo').onclick=()=>kalAboModal();
  const nb=P.querySelector('#kalNeu'); if(nb)nb.onclick=()=>kalEventForm(null);
  const gb=P.querySelector('#kalGeb'); if(gb)gb.onclick=()=>kalGebImport();
  kalFehlerBinden(P);
  if(KAL.view==='liste'&&!KAL.gescrollt){ KAL.gescrollt=true; const j=P.querySelector('#kalJetzt'); if(j&&j.getBoundingClientRect().top>window.innerHeight*.6)setTimeout(()=>j.scrollIntoView({block:'start'}),50); }
}

/* ---------- Details, Teilen, einzelner Kalendereintrag ---------- */
function kalItem(id){ return KAL.items.find(i=>String(i.id)===String(id)); }
function kalShareText(i){
  const r=kalRel(i.d), wann=(r&&!/^in /.test(r)?r:kalWt(i.d)+'., '+kalDM(i.d))+(i.z?' um '+i.z+' Uhr':'');
  if(i.k==='spiel'){
    const heim=i.heim!==false;
    return `⚽ ${wann}: ${kalWir(i.m)} ${heim?'empfängt':'spielt bei'} ${i.gegner}${i.liga?' ('+i.liga+')':''}.\n${heim?'📍 '+(i.ort||KAL_HEIM):'📍 Auswärts, fahrt mit!'}\nKommt vorbei und unterstützt uns! 💙🧡`;
  }
  if(i.k==='event'){ const e=KAL_EART[i.a]||KAL_EART.sonstiges; return `${e[0]} ${i.t}\n🗓️ ${wann}${i.bis&&i.bis!==i.d?' bis '+kalWt(i.bis)+'., '+kalDM(i.bis):''}${i.ort?'\n📍 '+i.ort:''}${i.info?'\n'+i.info:''}\nSV/BSC Mörlenbach freut sich auf euch! 💙🧡`; }
  return `🎂 Alles Gute, ${i.t}!`;
}
async function kalTeilen(i){
  const text=kalShareText(i);
  if(navigator.share){ try{ await navigator.share({text}); return; }catch(e){ if(e&&e.name==='AbortError')return; } }
  kCopy(text);
}
function kalDetail(id){
  const i=kalItem(id); if(!i)return; const vorbei=i.d<kalHeute(), c=kalFarbe(i);
  let kopf='', info='';
  if(i.k==='spiel'){
    kopf=`<div class="kal-dh" style="--c:${c}"><span class="kal-tag">${svEsc(kalTeamName(i.m))}</span><small>${svEsc(i.liga||'')}</small></div>${kalSpielZeile(i,true)}`;
    info=`<div class="kal-info"><div>${SVI('cal')}<span>${svEsc(kalLang(i.d))}${i.z?' · '+svEsc(i.z)+' Uhr':''}${kalRel(i.d)?' · <b>'+svEsc(kalRel(i.d))+'</b>':''}</span></div>
      <div>${SVI('target')}<span>${svEsc(i.ort||(i.heim===true?KAL_HEIM:i.heim===false?'Auswärts bei '+i.gegner:'Ort offen'))}</span></div></div>`;
  }else if(i.k==='event'){
    const e=KAL_EART[i.a]||KAL_EART.sonstiges;
    kopf=`<div class="kal-dh" style="--c:${c}"><span class="kal-tag">${svEsc(e[1])}</span>${kalSichtText(i.sicht)?`<small>🔒 nur für ${svEsc(kalSichtText(i.sicht))}</small>`:!i.pub?'<small>nicht im Fan-Spielplan</small>':''}</div><h2 class="kal-dt">${e[0]} ${svEsc(i.t)}</h2>`;
    info=`<div class="kal-info"><div>${SVI('cal')}<span>${svEsc(kalLang(i.d))}${i.bis&&i.bis!==i.d?' bis '+svEsc(kalLang(i.bis)):''}${i.z?' · '+svEsc(i.z)+' Uhr':''}</span></div>${i.ort?`<div>${SVI('target')}<span>${svEsc(i.ort)}</span></div>`:''}</div>
      ${i.info?`<p class="kal-txt">${svEsc(i.info)}</p>`:''}${i.n?`<details class="kal-intern"><summary>Interne Notiz</summary><p>${svEsc(i.n)}</p></details>`:''}
      ${KAL.flags.helfer&&i.hz?`<p class="note">${SVI('users')} ${i.hz} Helfer eingetragen${i.hz_offen?`, davon ${i.hz_offen} nur zugesagt`:''}. Details unter Verein → Helfer & Events.</p>`:''}`;
  }else{
    kopf=`<div class="kal-dh" style="--c:${c}"><span class="kal-tag">Geburtstag</span></div><h2 class="kal-dt">🎂 ${svEsc(i.t)}</h2>`;
    info=`<div class="kal-info"><div>${SVI('cal')}<span>${svEsc(kalLang(i.d))} · wird ${svEsc(i.alter)}</span></div></div>`;
  }
  const M=svModal(`<div class="kal-det">${kopf}${info}
    <div class="btnrow kal-akt">${i.k!=='geb'?`<button class="btn" id="kalShare" type="button">${SVI('share')} Teilen</button>`:''}<button class="btn ghost" id="kalIcs" type="button">${SVI('cal')} In den Kalender</button>
      ${i.k==='event'&&KAL.flags.helfer&&vorbei&&i.hz_offen?`<button class="btn ghost" id="kalBest" type="button">${SVI('check')} Zugesagte als geholfen</button>`:''}
      ${i.k==='event'&&i.ed?`<button class="btn ghost" id="kalEd" type="button">Bearbeiten</button>`:''}</div></div>`);
  const sh=M.querySelector('#kalShare'); if(sh)sh.onclick=()=>kalTeilen(i);
  M.querySelector('#kalIcs').onclick=()=>kalIcsDatei([i],(i.k==='spiel'?'spiel':'termin')+'-'+i.d);
  const ed=M.querySelector('#kalEd'); if(ed)ed.onclick=()=>kalEventForm(i);
  const be=M.querySelector('#kalBest'); if(be)be.onclick=async()=>{ const {data,error}=await SVB.sb.rpc('event_helfer_bestaetigen',{p_id:i.id}); if(error){ kToast('⚠️ '+error.message); return; } kToast('✓ '+(data||0)+' als geholfen bestätigt'); closeOverlay(); kalLoad(null,null,true); };
}

/* ---------- ICS ---------- */
const KAL_VTZ=['BEGIN:VTIMEZONE','TZID:Europe/Berlin','BEGIN:DAYLIGHT','TZOFFSETFROM:+0100','TZOFFSETTO:+0200','TZNAME:CEST','DTSTART:19700329T020000','RRULE:FREQ=YEARLY;BYMONTH=3;BYDAY=-1SU','END:DAYLIGHT',
  'BEGIN:STANDARD','TZOFFSETFROM:+0200','TZOFFSETTO:+0100','TZNAME:CET','DTSTART:19701025T030000','RRULE:FREQ=YEARLY;BYMONTH=10;BYDAY=-1SU','END:STANDARD','END:VTIMEZONE'];
function kalIcsText(L){
  const esc=s=>String(s==null?'':s).replace(/\\/g,'\\\\').replace(/\n/g,'\\n').replace(/([,;])/g,'\\$1');
  const ymd=d=>d.replace(/-/g,''), hm=z=>z.replace(':','')+'00';
  const ende=(d,z,min)=>{ const [h,m]=z.split(':').map(Number), t=h*60+m+min, dd=kalAdd(d,Math.floor(t/1440)), r=t%1440; return ymd(dd)+'T'+String(Math.floor(r/60)).padStart(2,'0')+String(r%60).padStart(2,'0')+'00'; };
  const now=new Date().toISOString().replace(/[-:]/g,'').replace(/\.\d+/,'');
  const out=['BEGIN:VCALENDAR','VERSION:2.0','PRODID:-//SV-BSC Moerlenbach//Sportzentrale//DE','CALSCALE:GREGORIAN','METHOD:PUBLISH',...KAL_VTZ];
  L.forEach(i=>{
    out.push('BEGIN:VEVENT','UID:'+String(i.id).replace(/[^\w:.-]/g,'')+'@svbsc.kaderwerk.pro','DTSTAMP:'+now);
    if(i.k==='spiel'){ const heim=i.heim!==false, wir=kalWir(i.m);
      out.push('SUMMARY:'+esc('⚽ '+(heim?wir+' gegen '+i.gegner:i.gegner+' gegen '+wir)+(i.erg?' '+(heim?i.erg:i.erg.split(':').reverse().join(':')):'')));
      if(i.z)out.push('DTSTART;TZID=Europe/Berlin:'+ymd(i.d)+'T'+hm(i.z),'DTEND;TZID=Europe/Berlin:'+ende(i.d,i.z,['h1','h2','soma'].includes(i.m)?110:90));
      else out.push('DTSTART;VALUE=DATE:'+ymd(i.d),'DTEND;VALUE=DATE:'+ymd(kalAdd(i.d,1)));
      const ort=i.ort||(i.heim===true?KAL_HEIM:i.heim===false?'Auswärts bei '+i.gegner:''); if(ort)out.push('LOCATION:'+esc(ort));
      out.push('DESCRIPTION:'+esc([i.liga,heim?'Heimspiel':'Auswärtsspiel','Kommt vorbei und unterstützt uns!'].filter(Boolean).join('\n')));
    }else if(i.k==='event'){ const e=KAL_EART[i.a]||KAL_EART.sonstiges;
      out.push('SUMMARY:'+esc(e[0]+' '+i.t));
      if(i.z)out.push('DTSTART;TZID=Europe/Berlin:'+ymd(i.d)+'T'+hm(i.z),'DTEND;TZID=Europe/Berlin:'+ende(i.bis||i.d,i.z,180));
      else out.push('DTSTART;VALUE=DATE:'+ymd(i.d),'DTEND;VALUE=DATE:'+ymd(kalAdd(i.bis||i.d,1)));
      if(i.ort)out.push('LOCATION:'+esc(i.ort)); if(i.info)out.push('DESCRIPTION:'+esc(i.info));
    }else out.push('SUMMARY:'+esc('🎂 '+i.t+' ('+i.alter+')'),'DTSTART;VALUE=DATE:'+ymd(i.d),'DTEND;VALUE=DATE:'+ymd(kalAdd(i.d,1)),'TRANSP:TRANSPARENT');
    out.push('END:VEVENT');
  });
  out.push('END:VCALENDAR'); return out.join('\r\n')+'\r\n';
}
function kalIcsDatei(L,name){
  const b=new Blob([kalIcsText(L)],{type:'text/calendar;charset=utf-8'}), u=URL.createObjectURL(b), a=document.createElement('a');
  a.href=u; a.download='svbsc-'+name+'.ics'; document.body.appendChild(a); a.click(); setTimeout(()=>{ a.remove(); URL.revokeObjectURL(u); },2000);
  kToast('📅 Kalenderdatei erstellt. Öffnen und „Hinzufügen“ tippen.');
}
function kalFeedUrl(q){ const base=(window.SVBC_CFG||{}).url||''; return base+'/functions/v1/kalender?'+q; }
async function kalAboModal(){
  const f=[...kalFilter()], M=svModal(`<div class="mhead"><div><h2 style="margin:0">In meinen Kalender</h2><div class="msub">Einmal abonnieren, dann stehen neue und geänderte Termine automatisch in deinem Handy-Kalender.</div></div></div>
    <div class="kal-abo"><div class="kal-ab"><b>${SVI('cal')} Meine Auswahl abonnieren</b><p class="note">Genau das, was du unten im Filter gewählt hast (${f.map(k=>svEsc(k==='event'?'Veranstaltungen':k==='geb'?'Geburtstage':kalTeamName(k))).join(', ')||'nichts'}). Aktualisiert sich von selbst.</p>
        <div class="btnrow"><a class="btn" id="kalWeb" href="#">iPhone und Mac: abonnieren</a><button class="btn ghost" id="kalLink" type="button">${SVI('copy')} Link für Google Kalender</button></div>
        <details class="kal-how"><summary>So geht's bei Android und Google</summary><p>Link kopieren, am Computer calendar.google.com öffnen, links bei „Weitere Kalender“ auf Plus, dann „Per URL“ und den Link einfügen. Danach erscheint alles auch auf dem Handy.</p></details></div>
      <div class="kal-ab"><b>${SVI('share')} Spielplan für Fans teilen</b><p class="note">Erste, Zweite und öffentliche Veranstaltungen. Ohne Anmeldung, ideal für Familie, Freunde und die WhatsApp-Gruppe.</p>
        <div class="btnrow"><button class="btn ghost" id="kalPubWa" type="button">${SVI('chat')} Per WhatsApp teilen</button><button class="btn ghost" id="kalPubCp" type="button">${SVI('copy')} Link kopieren</button></div></div>
      <div class="kal-ab"><b>${SVI('download')} Als Datei</b><p class="note">Alle Termine deiner Auswahl der nächsten 12 Monate als .ics-Datei. Aktualisiert sich nicht von selbst.</p>
        <div class="btnrow"><button class="btn ghost" id="kalDatei" type="button">Datei erstellen</button></div></div></div>`);
  let url=null;
  const holen=async()=>{ if(url)return url; const {data,error}=await SVB.sb.rpc('kalender_abo_link',{p_filter:f}); if(error){ kToast('⚠️ '+error.message); return null; } url=kalFeedUrl('t='+data); return url; };
  M.querySelector('#kalWeb').onclick=async e=>{ e.preventDefault(); const u=await holen(); if(u)location.href=u.replace(/^https?:/,'webcal:'); };
  M.querySelector('#kalLink').onclick=async()=>{ const u=await holen(); if(u)kCopy(u); };
  const pub=kalFeedUrl('m=h1,h2,event'), pubTxt=`⚽ Alle Spiele und Termine vom SV/BSC Mörlenbach direkt im Handy-Kalender. Einmal antippen und abonnieren:\n${pub.replace(/^https?:/,'webcal:')}\n\nFür Google Kalender diesen Link nutzen: ${pub}`;
  M.querySelector('#kalPubWa').onclick=()=>window.open('https://wa.me/?text='+encodeURIComponent(pubTxt),'_blank','noopener');
  M.querySelector('#kalPubCp').onclick=()=>kCopy(pub);
  M.querySelector('#kalDatei').onclick=()=>{ const h=kalHeute(), L=kalSichtbar().filter(i=>i.d>=h&&i.d<=kalAdd(h,366)); if(!L.length){ kToast('In deiner Auswahl steht nichts an'); return; } kalIcsDatei(L,'termine'); };
}

/* ---------- Veranstaltung anlegen / ändern ---------- */
function kalEventForm(i){
  if(!kalDarfAnlegen())return; const red=kalDarfEdit(), teams=KAL.flags.teams||[];
  const e=i||{d:kalHeute(),a:red?'sonstiges':'mannschaft',pub:true,sicht:red?['alle']:teams.slice(0,1).map(t=>'team:'+t)};
  const sel=new Set(e.sicht||['alle']);
  const T=(SVR.mann||[]).filter(m=>teams.includes(m.id));
  const gruppen=[red?['',[['alle','Alle Mitglieder']]]:null, red?['Vorstand und Organisation',[['vorstand','Vorstand'],['sponsoring','Partner-Team'],['trainerteam','Trainerteam']]]:null,
    ['Senioren',T.filter(m=>m.art!=='jugend').map(m=>['team:'+m.id,kalTeamName(m.id)])],['Jugend',T.filter(m=>m.art==='jugend').map(m=>['team:'+m.id,kalTeamName(m.id)])]].filter(g=>g&&g[1].length);
  const M=svModal(`<div class="mhead"><div><h2 style="margin:0">${i?'Termin ändern':'Neuer Termin'}</h2><div class="msub">${red?'Du bestimmst, wer den Termin sieht. Vorstand und Admin sehen immer alles.':'Du planst für deine Mannschaft. Den Termin sehen die Mannschaft, der Vorstand und die Bereichsleitung.'}</div></div></div>
    <form id="kalF" class="editgrid" style="grid-template-columns:1fr 1fr">
      <div class="field" style="grid-column:1/-1"><label for="kfT">Titel</label><input id="kfT" required maxlength="120" value="${svEsc(e.t||'')}" placeholder="${red?'z.B. Jahreshauptversammlung':'z.B. Mannschaftsabend'}"></div>
      <div class="field" style="grid-column:1/-1"><label>Wer sieht das?</label><div class="kal-sicht" id="kfS">${gruppen.map(([t,L])=>`${t?`<small>${svEsc(t)}</small>`:''}<div>${L.map(([k,l])=>`<button type="button" class="kal-chip${sel.has(k)?' on':''}" data-ks="${svEsc(k)}" style="--c:${k==='alle'?KAL_FARBE.event:k.startsWith('team:')?(KAL_FARBE[k.slice(5)]||KAL_FARBE.jugend):'#94a3b8'}"><i></i>${svEsc(l)}</button>`).join('')}</div>`).join('')}</div></div>
      <div class="field"><label for="kfA">Art</label><select id="kfA">${Object.entries(KAL_EART).map(([k,v])=>`<option value="${k}"${k===e.a?' selected':''}>${v[0]} ${svEsc(v[1])}</option>`).join('')}</select></div>
      <div class="field"><label for="kfZ">Uhrzeit</label><input id="kfZ" type="time" value="${svEsc(e.z||'')}"></div>
      <div class="field"><label for="kfD">Datum</label><input id="kfD" type="date" required value="${svEsc(e.d)}"></div>
      <div class="field"><label for="kfB">Bis (mehrere Tage)</label><input id="kfB" type="date" value="${svEsc(e.bis||'')}"></div>
      <div class="field" style="grid-column:1/-1"><label for="kfO">Ort</label><input id="kfO" maxlength="120" value="${svEsc(e.ort||'')}" placeholder="z.B. Bürgerhaus Mörlenbach"></div>
      <div class="field" style="grid-column:1/-1"><label for="kfI">Beschreibung</label><textarea id="kfI" rows="3" maxlength="600" placeholder="Was erwartet die Leute?">${svEsc(e.info||'')}</textarea></div>
      <div class="field" style="grid-column:1/-1"><label for="kfN">Interne Notiz (Trainerteam und Vorstand)</label><textarea id="kfN" rows="2">${svEsc(e.n||'')}</textarea></div>
      ${red?`<label class="kal-sw" style="grid-column:1/-1" id="kfPL"><input type="checkbox" id="kfP"${e.pub!==false?' checked':''}> Auch im Spielplan für Fans (nur bei „Alle Mitglieder“)</label>`:''}
      <div class="btnrow sbact" style="grid-column:1/-1"><button class="btn" type="submit">Speichern</button><button class="btn ghost" type="button" id="kfX">Abbrechen</button>${i?`<button class="btn ghost kal-del" type="button" id="kfDel">Löschen</button>`:''}</div>
    </form>`);
  const S=M.querySelector('#kfS'), pl=M.querySelector('#kfPL');
  const zeig=()=>{ S.querySelectorAll('[data-ks]').forEach(b=>{ b.classList.toggle('on',sel.has(b.dataset.ks)); }); if(pl){ const an=sel.has('alle'); pl.classList.toggle('aus',!an); M.querySelector('#kfP').disabled=!an; } };
  S.querySelectorAll('[data-ks]').forEach(b=>b.onclick=()=>{ const k=b.dataset.ks;
    if(k==='alle'){ sel.clear(); sel.add('alle'); } else { sel.delete('alle'); sel.has(k)?sel.delete(k):sel.add(k); if(!sel.size)sel.add(red?'alle':k); } zeig(); });
  zeig();
  M.querySelector('#kfX').onclick=()=>closeOverlay();
  const del=M.querySelector('#kfDel'); if(del)del.onclick=async()=>{ if(del.dataset.sure!=='1'){ del.dataset.sure='1'; del.textContent='Wirklich löschen?'; del.classList.add('sure'); return; }
    const {error}=await SVB.sb.rpc('event_delete',{p_id:i.id}); if(error){ kToast('⚠️ '+error.message); return; } kToast('Gelöscht'); closeOverlay(); kalLoad(null,null,true); };
  M.querySelector('#kalF').onsubmit=async ev=>{ ev.preventDefault(); const b=M.querySelector('button[type=submit]'); b.disabled=true;
    const v=id=>M.querySelector(id).value.trim(), bis=v('#kfB');
    const p={id:i?i.id:null,titel:v('#kfT'),art:v('#kfA'),datum:v('#kfD'),ende:bis&&bis>v('#kfD')?bis:'',zeit:v('#kfZ'),ort:v('#kfO'),info:v('#kfI'),notiz:v('#kfN'),
      sicht:[...sel],oeffentlich:red?(M.querySelector('#kfP').checked&&sel.has('alle')):false};
    const {error}=await SVB.sb.rpc('event_save',{p}); b.disabled=false;
    if(error){ kToast('⚠️ '+error.message); return; }
    kToast('✓ Gespeichert'); closeOverlay(); kalLoad(null,null,true); };
}
/* Geburtstage aus einer Liste (Admin): „Name; TT.MM.JJJJ“ je Zeile */
function kalGebImport(){
  const M=svModal(`<div class="mhead"><div><h2 style="margin:0">Geburtstage einfügen</h2><div class="msub">Eine Person pro Zeile: Name, dann Datum (z.B. „Max Muster; 03.05.1994“). Aus Excel einfach die zwei Spalten kopieren. Unter 18 wird nie angezeigt.</div></div></div>
    <textarea id="kgT" rows="10" style="width:100%" placeholder="Max Muster; 03.05.1994"></textarea><p class="note" id="kgN"></p>
    <div class="btnrow sbact"><button class="btn" id="kgOk" type="button">Übernehmen</button><button class="btn ghost" id="kgX" type="button">Abbrechen</button></div>`);
  const T=M.querySelector('#kgT'), N=M.querySelector('#kgN');
  const lesen=()=>T.value.split('\n').map(l=>{ const m=l.match(/^\s*(.+?)[;,\t]+\s*(\d{1,2})\.(\d{1,2})\.(\d{4})\s*$/)||l.match(/^\s*(.+?)[;,\t]+\s*(\d{4})-(\d{2})-(\d{2})\s*$/); if(!m)return null;
    const iso=m[2].length===4?`${m[2]}-${m[3]}-${m[4]}`:`${m[4]}-${m[3].padStart(2,'0')}-${m[2].padStart(2,'0')}`; return {name:m[1].trim(),datum:iso,quelle:'Liste'}; }).filter(Boolean);
  T.oninput=()=>{ N.textContent=lesen().length+' erkannt'; };
  M.querySelector('#kgX').onclick=()=>closeOverlay();
  M.querySelector('#kgOk').onclick=async()=>{ const L=lesen(); if(!L.length){ N.textContent='Keine Zeile erkannt'; return; }
    const {data,error}=await SVB.sb.rpc('geburtstage_import',{p:L}); if(error){ kToast('⚠️ '+error.message); return; } kToast('✓ '+(data||0)+' Geburtstage übernommen'); closeOverlay(); kalLoad(null,null,true); };
}

/* ---------- Übersicht: nächste Termine ---------- */
function kalHome(){
  const home=document.getElementById('panel-home'); if(!home||!svTabAllowed('kalender'))return;
  let box=document.getElementById('kalHome');
  if(!KAL.loaded&&!KAL.err){ kalLoad(); return; }
  const h=kalHeute(), L=kalSichtbar().filter(i=>(i.bis||i.d)>=h).slice(0,4);
  if(!box){ box=document.createElement('div'); box.id='kalHome'; box.className='card kal-home'; const m=document.getElementById('svrMeine')||document.getElementById('svCockpit'); if(m)m.after(box); else home.prepend(box); }
  box.innerHTML=`<div class="kal-hh"><h3 class="trh">${SVI('cal')} Nächste Termine</h3><button type="button" class="btn ghost sm" id="kalAlle">Alle Termine ${SVI('chev')}</button></div>
    ${kalFehlerHtml()}${L.length?L.map(i=>`<div class="kal-hrow">${kalRel(i.d)?`<em class="kal-rel">${svEsc(kalRel(i.d))}</em>`:`<em class="kal-rel">${svEsc(kalWt(i.d)+'., '+kalDM(i.d))}</em>`}${kalItemHtml(i)}</div>`).join(''):KAL.err?'':'<p class="note">In deiner Auswahl steht gerade nichts an.</p>'}`;
  box.querySelector('#kalAlle').onclick=()=>goTab('kalender');
  box.querySelectorAll('[data-kid]').forEach(b=>b.onclick=()=>kalDetail(b.dataset.kid));
  kalFehlerBinden(box);
}
{ const _rh=renderHome; renderHome=function(){ const r=_rh.apply(this,arguments); try{ kalHome(); }catch(e){ console.warn('Termine',e); } return r; }; }
{ const _l=svrApply; svrApply=function(){ const r=_l.apply(this,arguments); try{ if(svCurTab()==='home')kalHome(); }catch(e){} return r; }; }

/* KLA-Paket: participation-client.mjs unverändert, nur ohne export (die App ist kein Modul) */
const KLA_PART=(function(){
// Neutral published observations, never a health or future-availability estimate.
function participationFacts(side){
 const rows=(side?.players||[]).filter(r=>r.player?.id&&(!r.coach||r.starting===true||r.statistics?.minutes>0));
 const ids=rows.map(r=>String(r.player.id));
 const starters=rows.filter(r=>r.starting===true).length;
 return {version:1,basis:'published_lineup',starting_eleven_verified:starters===11&&new Set(ids).size===ids.length,bench_completeness:'unknown',
  players:rows.map(r=>({player_id:r.player.id,starting:r.starting===true?true:r.starting===false?false:null,
   minutes_played:Number.isFinite(r.statistics?.minutes)?r.statistics.minutes:null,
   substituted_out:Number.isFinite(r.statistics?.substituteOut)?r.statistics.substituteOut>0:null,
   substituted_in:Number.isFinite(r.statistics?.substituteIn)?r.statistics.substituteIn>0:null,
   substitution_minute:null,availability_next_match:'unknown'}))};
}
function comparePublishedLineups(current,previous,teamSeasonId){
 const find=r=>['homeTeam','awayTeam'].map(k=>r?.data?.[k]).find(s=>String(s?.team_season_id)===String(teamSeasonId));
 const a=find(current),b=find(previous);
 const valid=current?.season===previous?.season&&current?.data?.age_group==='m'&&previous?.data?.age_group==='m'&&
  Number.isFinite(Date.parse(current?.data?.kickoff))&&Number.isFinite(Date.parse(previous?.data?.kickoff))&&Date.parse(current.data.kickoff)>Date.parse(previous.data.kickoff)&&
  a&&b&&participationFacts(a).starting_eleven_verified&&participationFacts(b).starting_eleven_verified;
 if(!valid)return {status:'insufficient_comparable_lineups',players:[]};
 const present=new Set((a.players||[]).map(r=>String(r.player?.id)));
 const missing=participationFacts(b).players.filter(p=>!present.has(String(p.player_id)));
 return {status:'compared_published_lists',current_match_id:current.entity,previous_match_id:previous.entity,team_season_id:teamSeasonId,
  current_source_url:current.source_url,previous_source_url:previous.source_url,current_checked_at:current.checked_at,previous_checked_at:previous.checked_at,
  players:missing.map(p=>({player_id:p.player_id,observation:'not_named_in_compared_published_lineup',label:'In der neueren veroeffentlichten Aufstellung nicht genannt',absence_confirmed:false,availability_next_match:'unknown'}))};
}

return {participationFacts, comparePublishedLineups};})();
/* =====================================================================
   SV/BSC Sportzentrale · Beta 0.26: Gegnercheck mit Spielberichten
   - Formkurve zum Antippen: jeder Spieltag mit Gegnerwappen, Ergebnis und Farbe (Sieg, Remis, Niederlage)
   - Spielbericht je Spiel: Tore mit Minute und Schütze, Strafstoß- und Eigentore, Karten, Wechsel, Aufstellungen
   - Vor dem Spiel: Platzverweise und Sperren, Stammspieler, die zuletzt nicht im Kader standen (ohne Grund, keine Gesundheitsdaten),
     häufigste Startelf, Torminuten, Torschützen, Verhalten nach Führung und Rückstand, gemeinsame Gegner
   - Quelle: öffentliche Spielberichte von FUSSBALL.DE (Kreisliga A und D2). FuPa ergänzt Positionen und Karten-Namen, wo die Quelle sie liefert.
   ===================================================================== */
const GC={cache:new Map(),busy:new Map(),modus:{},sicht:'gegner'};
const GC_BINS=['1-15','16-30','31-45','46-60','61-75','76-90'];
const GC_ART={tor:['⚽','Tor'],elf:['⚽','Strafstoßtor'],et:['⚽','Eigentor'],gelb:['<i class="gc-k y"></i>','Gelbe Karte'],gelbrot:['<i class="gc-k yr"></i>','Gelb-Rote Karte'],rot:['<i class="gc-k r"></i>','Rote Karte'],wechsel:['⇄','Wechsel']};
const gcName=(D,k)=>{ const n=k&&D&&D.namen?D.namen[k]:null; return n?String(n).replace(/\s*\([^)]*\)\s*$/,'').trim():null; };
const gcMin=e=>e.m==null?'':e.m+(e.x?'+'+e.x:'')+'.';
const gcBin=e=>e.m==null?null:e.m<=15?0:e.m<=30?1:e.m<=45?2:e.m<=60?3:e.m<=75?4:5;
const gcTor=e=>e.t==='tor'||e.t==='elf'||e.t==='et';

/* ---------- Laden ---------- */
async function gcLoad(sub,key,force){
  const id=sub+'|'+key; if(!force&&GC.cache.has(id))return GC.cache.get(id); if(GC.busy.has(id))return GC.busy.get(id);
  const p=(async()=>{ try{ const {data,error}=await SVB.sb.rpc('gegner_daten',{p_sub:sub,p_key:key}); if(error)throw error; GC.cache.set(id,data||null); return data||null; }
    catch(e){ console.warn('Gegnercheck',e); return null; } finally{ GC.busy.delete(id); } })();
  GC.busy.set(id,p); return p;
}

/* ---------- Auswerten (rein rechnerisch, ohne DOM) ---------- */
function gcSpiele(D,key){
  if(!D||!Array.isArray(D.spiele))return [];
  return D.spiele.map((s,i)=>{
    const h=s.hk===key, side=h?'h':'g', geg=h?'g':'h', v=Array.isArray(s.v)?s.v:[];
    let tf=null, ta=null, q=null;
    if(s.b&&v.some(gcTor)){ tf=h?s.th:s.tg; ta=h?s.tg:s.th; q='bericht'; }
    else if(Array.isArray(s.mr)&&s.mr[0]!=null){ tf=h?s.mr[0]:s.mr[1]; ta=h?s.mr[1]:s.mr[0]; q='tabelle'; }
    else if(s.b&&s.a&&!v.some(gcTor)&&v.length){ tf=0; ta=0; q='bericht'; }
    const e=tf==null?null:tf>ta?'S':tf===ta?'U':'N';
    const k={gelb:0,gelbrot:0,rot:0}; v.forEach(x=>{ if(x.s===side&&k[x.t]!=null)k[x.t]++; });
    return {i,id:s.id,datum:s.datum,zeit:s.zeit,heim:h,side,geg,opp:h?s.gast:s.heim,oppKey:h?s.gk:s.hk,tf,ta,e,q,b:!!s.b,v,a:s.a||null,ende:s.ende||90,karten:k,roh:s};
  });
}
// Minuten je Spieler aus Aufstellung und Wechseln
function gcEinsaetze(sp){
  const A=sp.a&&sp.a[sp.side]; if(!A||!(A.start||[]).length)return null;
  const end=sp.ende||90, m=new Map();
  (A.start||[]).forEach(k=>m.set(k,{k,start:true,von:0,bis:end,tore:0}));
  sp.v.filter(e=>e.t==='wechsel'&&e.s===sp.side).sort((a,b)=>(a.m??99)-(b.m??99)).forEach(w=>{
    const raus=w.p2&&m.get(w.p2); if(raus)raus.bis=Math.min(raus.bis,w.m??end);
    if(w.p&&!m.has(w.p))m.set(w.p,{k:w.p,start:false,von:w.m??end,bis:end,tore:0}); });
  sp.v.filter(e=>(e.t==='tor'||e.t==='elf')&&e.s===sp.side&&e.p&&m.has(e.p)).forEach(e=>m.get(e.p).tore++);
  return {liste:[...m.values()].map(x=>({...x,min:Math.max(0,Math.min(130,x.bis-x.von))})),bank:(A.bank||[]).filter(k=>!m.has(k)),kader:new Set([...(A.start||[]),...(A.bank||[])]),tw:A.tw||null,c:A.c||null};
}
function gcAuswertung(D,key){
  const G=gcSpiele(D,key), gespielt=G.filter(g=>g.e), mitAuf=G.filter(g=>g.a&&g.a[g.side]&&(g.a[g.side].start||[]).length>=7), voll=G.filter(g=>g.a&&g.a[g.side]&&(g.a[g.side].start||[]).length>=11);
  // Torminuten und Halbzeiten
  const bins={f:[0,0,0,0,0,0],a:[0,0,0,0,0,0]}, hz={f:[0,0],a:[0,0]}; let mitVerlauf=0;
  G.forEach(g=>{ if(!g.b||!g.v.some(gcTor))return; mitVerlauf++; g.v.filter(gcTor).forEach(e=>{ const b=gcBin(e); if(b==null)return; const w=e.s===g.side?'f':'a'; bins[w][b]++; hz[w][b<3?0:1]++; }); });
  // Torschützen
  const sch=new Map(); G.forEach(g=>g.v.filter(e=>(e.t==='tor'||e.t==='elf')&&e.s===g.side&&e.p).forEach(e=>{ const x=sch.get(e.p)||{k:e.p,tore:0,elf:0,min:[],zuletzt:null}; x.tore++; if(e.t==='elf')x.elf++; if(e.m!=null)x.min.push(e.m); x.zuletzt=g.datum; sch.set(e.p,x); }));
  const schuetzen=[...sch.values()].sort((a,b)=>b.tore-a.tore||(b.zuletzt||'').localeCompare(a.zuletzt||''));
  // Einsätze, Stammspieler, zuletzt nicht im Kader
  const E=mitAuf.map(g=>({g,x:gcEinsaetze(g)})).filter(o=>o.x);
  const sp=new Map(); E.forEach(({g,x},idx)=>{ x.liste.forEach(p=>{ const s=sp.get(p.k)||{k:p.k,start:0,eins:0,min:0,tore:0,letzte4:0,tw:0,c:0}; if(p.start)s.start++; s.eins++; s.min+=p.min; s.tore+=p.tore; if(idx>=E.length-4&&p.start)s.letzte4++; if(x.tw===p.k)s.tw++; if(x.c===p.k)s.c++; sp.set(p.k,s); }); });
  const stamm=[...sp.values()].sort((a,b)=>b.start-a.start||b.min-a.min);
  // Abwesenheit nur aus vergleichbaren, vollständig veröffentlichten Aufstellungen (mindestens vier, das letzte Spiel eingeschlossen), ohne Grund
  const EV=voll.map(g=>({g,x:gcEinsaetze(g)})).filter(o=>o.x), letzteVoll=EV.length&&G.filter(g=>g.b).slice(-1)[0]===EV[EV.length-1].g;
  const fehlt=[]; if(EV.length>=4&&letzteVoll){ stamm.filter(s=>{ const st=EV.filter(o=>o.x.liste.some(p=>p.k===s.k&&p.start)).length; return st>=3&&st/EV.length>=0.5; }).forEach(s=>{ let n=0; for(let i=EV.length-1;i>=0;i--){ if(EV[i].x.kader.has(s.k))break; n++; } if(n>=1)fehlt.push({...s,seit:n,zuletzt:EV[EV.length-1].g}); }); }
  const elf=[...sp.values()].filter(s=>s.letzte4>0).sort((a,b)=>b.letzte4-a.letzte4||b.start-a.start||b.min-a.min).slice(0,11);
  // Karten und Platzverweise
  const karten={gelb:0,gelbrot:0,rot:0}; G.forEach(g=>{ karten.gelb+=g.karten.gelb; karten.gelbrot+=g.karten.gelbrot; karten.rot+=g.karten.rot; });
  const letztes=[...G].reverse().find(g=>g.b)||null;
  const pv=letztes?letztes.v.filter(e=>(e.t==='gelbrot'||e.t==='rot')&&e.s===letztes.side):[];
  // Führung und Rückstand (nur Spiele mit Verlauf)
  const lage={fuehrung:{sp:0,pkt:0},rueckstand:{sp:0,pkt:0}};
  G.filter(g=>g.b&&g.e&&g.v.some(gcTor)).forEach(g=>{ const first=g.v.filter(gcTor).sort((a,b)=>((a.m??0)*100+(a.x||0))-((b.m??0)*100+(b.x||0)))[0]; if(!first)return;
    const w=first.s===g.side?'fuehrung':'rueckstand'; lage[w].sp++; lage[w].pkt+=g.e==='S'?3:g.e==='U'?1:0; });
  const zuNull=gespielt.filter(g=>g.ta===0).length, ohneTor=gespielt.filter(g=>g.tf===0).length;
  return {G,gespielt,mitAuf:E.length,mitVoll:EV.length,mitVerlauf,bins,hz,schuetzen,stamm,fehlt,elf,karten,letztes,pv,lage,zuNull,ohneTor};
}
// Klare Sätze für das Trainerteam, nur wenn die Datenlage trägt
function gcHinweise(A,wer){
  const out=[], s=(n,a,b)=>n===1?a:b;
  const tf=A.bins.f.reduce((a,b)=>a+b,0), ta=A.bins.a.reduce((a,b)=>a+b,0);
  if(ta>=4){ const spaet=A.bins.a[5]; if(spaet/ta>=0.35)out.push(`${wer} kassiert ${spaet} von ${ta} Gegentoren nach der 75. Minute. Hinten raus drücken lohnt sich.`);
    const frueh=A.bins.a[0]; if(frueh/ta>=0.3)out.push(`${wer} kassiert ${frueh} von ${ta} Gegentoren in den ersten 15 Minuten. Früh draufgehen.`); }
  if(tf>=4){ const spaet=A.bins.f[5]; if(spaet/tf>=0.35)out.push(`${wer} trifft oft spät: ${spaet} von ${tf} Toren nach der 75. Minute. Konzentration bis zum Schluss.`);
    if(A.hz.f[1]>=A.hz.f[0]*2&&A.hz.f[1]>=4)out.push(`${wer} kommt stark aus der Kabine: ${A.hz.f[1]} Tore nach der Pause, ${A.hz.f[0]} davor.`); }
  if(A.lage.rueckstand.sp>=2)out.push(`Nach 0:1-Rückstand holte ${wer} ${A.lage.rueckstand.pkt} ${s(A.lage.rueckstand.pkt,'Punkt','Punkte')} aus ${A.lage.rueckstand.sp} Spielen.`);
  if(A.lage.fuehrung.sp>=2&&A.lage.fuehrung.pkt<=A.lage.fuehrung.sp*1.5)out.push(`Nach eigener Führung nur ${A.lage.fuehrung.pkt} Punkte aus ${A.lage.fuehrung.sp} Spielen. ${wer} lässt sich zurückdrängen.`);
  const top=A.schuetzen[0]; if(top&&tf>=5&&top.tore/tf>=0.35)out.push(`${top.name||'Ein Spieler'} erzielte ${top.tore} von ${tf} Toren. Ihn aus dem Spiel nehmen.`);
  const elf=A.schuetzen.reduce((a,x)=>a+x.elf,0); if(elf>=2)out.push(`${elf} Strafstoßtore bisher. Im Strafraum sauber verteidigen.`);
  if(A.gespielt.length>=4&&A.karten.gelb/A.gespielt.length>=2.5)out.push(`${wer} sammelt viele Karten: ${A.karten.gelb} Gelbe in ${A.gespielt.length} Spielen.`);
  return out;
}
// FuPa (KLA): Bericht zum Spiel über die Spiel-ID der Liga (serverseitig über team_season_id + Datum verbunden)
const GC_KARTE={card_yellow:'gelb',card_yellow_red:'gelbrot',card_second_yellow:'gelbrot',card_red:'rot'};
function gcFupa(D,sp){ return D&&sp?(D.fupa||[]).find(x=>x.id===sp.id)||null:null; }
function gcFupaKarten(D,sp){
  const f=gcFupa(D,sp); if(!f||!Array.isArray(f.ev))return [];
  return f.ev.filter(e=>e.t==='card').map(e=>({s:e.s,name:e.name||null,t:GC_KARTE[e.st]||(/red/.test(e.st||'')?(/yellow/.test(e.st)?'gelbrot':'rot'):'gelb'),m:e.m,x:e.x}));
}
// Positionsverteilung der Startelf laut FuPa: nur veröffentlichte, vollständige Startelf, ausdrücklich keine Formation
const GC_POS=['Torwart','Abwehr','Mittelfeld','Angriff','unbekannt'];
function gcPosText(p){ return GC_POS.filter(k=>k!=='unbekannt'||(p[k]||0)>0).map(k=>`${k} ${p[k]||0}`).join(' · '); }
function gcFupaVerteilung(D,key){
  const L=(D&&D.fupa||[]).filter(f=>f.auf&&f.auf[f.seite]&&f.auf[f.seite].availability==='published'&&(f.auf[f.seite].start_n||0)>=11&&f.auf[f.seite].pos);
  if(!L.length)return null; const f=L[L.length-1]; return {pos:f.auf[f.seite].pos,datum:f.datum,n:L.length};
}
/* ---------- Formkurve zum Antippen ---------- */
// Tabellenplatz je Spiel: die Fieberkurve hat einen Wert je Spieltag. Spieltage = Wochen mit mehreren Ligaspielen,
// ein Nachholspiel unter der Woche bekommt den Platz des Spieltags davor.
function gcMontag(d){ const x=new Date(d+'T12:00:00Z'); const w=(x.getUTCDay()+6)%7; x.setUTCDate(x.getUTCDate()-w); return x.toISOString().slice(0,10); }
function gcPlaetze(D,G,fv){
  if(!fv.length||!G.length)return null;
  const W=(D.spieltage||[]).map(String);
  if(W.length===fv.length){ const out=G.map(g=>{ const m=gcMontag(g.datum); let i=-1; W.forEach((w,j)=>{ if(w<=m)i=j; }); return i>=0?fv[i]:null; }); if(out.every(v=>v!=null))return out; }
  return fv.length===G.length?fv.slice():null;
}
function gcKurve(D,key,wer){
  const G=gcSpiele(D,key).filter(g=>g.e||g.b); if(!G.length)return '<div class="note">Noch keine Spiele mit Ergebnis in dieser Saison.</div>';
  const fv=(D.fieber||[]).filter(x=>x>0), pl=gcPlaetze(D,G,fv), platz=!!pl;
  const mode=GC.modus[key]||(platz?'platz':'form'), usePlatz=mode==='platz'&&platz;
  let ys; if(usePlatz){ const mx=Math.max(8,...fv); ys=pl.map(v=>8+(v-1)/(mx-1)*70); }
  else{ let c=0; const cum=G.map(g=>c+=g.e==='S'?1:g.e==='N'?-1:0); const lo=Math.min(0,...cum), hi=Math.max(1,...cum); ys=cum.map(v=>78-(v-lo)/(hi-lo||1)*70); }
  const n=G.length, xs=G.map((_,i)=>n===1?50:4+i*92/(n-1));
  const pts=xs.map((x,i)=>x.toFixed(2)+','+ys[i].toFixed(2)).join(' ');
  const lbl=g=>g.tf==null?'?':g.tf+':'+g.ta;
  return `<div class="gc-kv-top"><div class="trtabs gc-mode">${platz?`<button class="${usePlatz?'on':''}" data-gcmode="platz" data-gckey="${svEsc(key)}">Tabellenplatz</button>`:''}<button class="${!usePlatz?'on':''}" data-gcmode="form" data-gckey="${svEsc(key)}">Formkurve</button></div>
      <small class="note">${usePlatz?'Platz nach jedem Spieltag. Oben ist besser.':'Sieg geht hoch, Niederlage runter, Remis bleibt.'} Wappen antippen für den Spielbericht.</small></div>
    <div class="gc-kv-scroll"><div class="gc-kv" style="--n:${n}">
      <svg class="gc-kv-l" viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden="true">${usePlatz?'<line x1="0" x2="100" y1="8" y2="8" class="g"/>':''}<polyline points="${pts}" vector-effect="non-scaling-stroke"/></svg>
      ${G.map((g,i)=>`<button class="gc-pt f${g.e||'x'}${g.b?'':' nob'}" style="left:${xs[i]}%;top:${ys[i]}%" data-gcspiel="${svEsc(g.id)}" data-gckey="${svEsc(key)}" title="${svEsc((g.heim?'gegen ':'bei ')+g.opp)}">
          ${scCrest(g.opp,'sm')}<b>${svEsc(lbl(g))}</b>${usePlatz?`<em>${pl[i]}.</em>`:''}${g.karten.rot+g.karten.gelbrot?'<i class="gc-rk" title="Platzverweis"></i>':''}</button>`).join('')}
    </div></div>
    <div class="gc-strip">${G.slice().reverse().map(g=>`<button class="gc-sp f${g.e||'x'}" data-gcspiel="${svEsc(g.id)}" data-gckey="${svEsc(key)}"><span>${spWd(g.datum)}</span>${scCrest(g.opp,'sm')}<b>${g.heim?'':'@ '}${svEsc(g.opp)}</b><i>${svEsc(lbl(g))}</i>${g.b?'':'<small>ohne Bericht</small>'}</button>`).join('')}</div>`;
}

/* ---------- Spielbericht ---------- */
function gcBericht(key,id){
  let D=null, sp=null; for(const [k,v] of GC.cache){ if(!v)continue; const s=gcSpiele(v,v.key).find(g=>g.id===id); if(s&&(!sp||v.key===key)){ D=v; sp=s; } }
  if(!sp)return;
  const r=sp.roh, V=[...sp.v].sort((a,b)=>((a.m??0)*100+(a.x||0))-((b.m??0)*100+(b.x||0)));
  const nm=k=>gcName(D,k), fk=gcFupaKarten(D,sp);
  let h=0, g=0; const zeilen=[]; let halb=false;
  V.forEach(e=>{
    if(!halb&&e.m!=null&&e.m>45&&V.some(x=>x.m!=null&&x.m<=45)){ halb=true; zeilen.push(`<div class="gc-hz">Halbzeit ${h}:${g}</div>`); }
    if(gcTor(e)){ if(e.s==='h')h++; else g++; }
    const [ic,art]=GC_ART[e.t]||['•',e.t];
    let text='';
    if(e.t==='wechsel')text=`<b>${svEsc(nm(e.p)||'Spieler')}</b> kommt${e.p2?` für ${svEsc(nm(e.p2)||'Spieler')}`:''}`;
    else if(gcTor(e))text=`<b>${svEsc(nm(e.p)||'Torschütze')}</b>${e.t==='elf'?' (Strafstoß)':e.t==='et'?' (Eigentor)':''} <span class="gc-st">${h}:${g}</span>`;
    else text=`${art}${nm(e.p)?' · <b>'+svEsc(nm(e.p))+'</b>':''}`;
    zeilen.push(`<div class="gc-ev ${e.s} t-${e.t}"><span class="gc-m">${svEsc(gcMin(e))}</span><span class="gc-ic">${ic}</span><span class="gc-tx">${text}</span></div>`);
  });
  const auf=s=>{ const A=r.a&&r.a[s]; if(!A||!(A.start||[]).length)return '<div class="note">Keine Aufstellung veröffentlicht.</div>';
    const x=gcEinsaetze({...sp,side:s}), mm=new Map((x?x.liste:[]).map(p=>[p.k,p]));
    const zeile=(k,bank)=>{ const p=mm.get(k); const tore=V.filter(e=>(e.t==='tor'||e.t==='elf')&&e.s===s&&e.p===k).length;
      return `<li class="${bank&&!p?'unb':''}"><span>${svEsc(nm(k)||'Name folgt')}</span>${A.c===k?'<em>C</em>':''}${A.tw===k?'<em>TW</em>':''}${tore?`<i>${'⚽'.repeat(Math.min(tore,4))}</i>`:''}${p?`<small>${p.min}′</small>`:bank?'<small>Bank</small>':''}</li>`; };
    return `<ol>${(A.start||[]).map(k=>zeile(k,false)).join('')}</ol>${(A.bank||[]).length?`<div class="gc-bk">Ersatz</div><ul>${A.bank.map(k=>zeile(k,true)).join('')}</ul>`:''}`; };
  const erg=sp.b&&sp.v.some(gcTor)?`${r.th}:${r.tg}`:Array.isArray(r.mr)&&r.mr[0]!=null?`${r.mr[0]}:${r.mr[1]}`:(sp.b?'0:0':'?');
  svModal(`<div class="gc-rep">
    <div class="gc-rh"><div>${scCrest(r.heim,'xl')}<b>${svEsc(r.heim)}</b></div><div class="gc-re"><strong>${svEsc(erg)}</strong><small>${svEsc(spWd(r.datum))}${r.zeit?' · '+svEsc(r.zeit):''}</small></div><div>${scCrest(r.gast,'xl')}<b>${svEsc(r.gast)}</b></div></div>
    ${sp.b?`<h3 class="trh">Spielverlauf</h3><div class="gc-tl">${zeilen.join('')||'<div class="note">Kein Verlauf veröffentlicht.</div>'}</div>`:'<div class="note">Für dieses Spiel gibt es bei FUSSBALL.DE noch keinen Spielbericht. Das Ergebnis stammt aus der Tabelle.</div>'}
    ${sp.b&&r.a?`<h3 class="trh">Aufstellungen</h3><div class="gc-auf"><div><h4>${svEsc(r.heim)}</h4>${auf('h')}</div><div><h4>${svEsc(r.gast)}</h4>${auf('g')}</div></div>`:''}
    ${gcFupaBlock(D,sp,r)}
    <p class="note">Quelle: öffentlicher Spielbericht auf FUSSBALL.DE. Karten stehen dort ohne Namen im Klartext${fk.length?', die Namen kommen aus dem FuPa-Spielbericht':''}.</p></div>`);
}

// Ergänzung aus FuPa im Spielbericht: Karten mit veröffentlichten Namen, Aufstellung je Seite (oder „nicht veröffentlicht“),
// Positionsverteilung der Startelf (keine bestätigte Formation), Hinweis auf nicht vollständig bestätigten Verlauf
function gcFupaBlock(D,sp,r){
  const f=gcFupa(D,sp); if(!f)return '';
  const K=gcFupaKarten(D,sp), nm=s=>s==='h'?r.heim:r.gast;
  const seite=s=>{ const A=f.auf&&f.auf[s]; if(!A)return '<div class="note">Keine Aufstellung von FuPa.</div>';
    if(A.availability!=='published')return '<div class="note gc-np">Aufstellung nicht veröffentlicht. Wer gespielt hat, ist damit unbekannt.</div>';
    const st=(A.spieler||[]).filter(p=>p.start), bk=(A.spieler||[]).filter(p=>!p.start);
    const li=p=>`<li><span>${svEsc(p.name||'ohne Namen')}</span>${p.c?'<em>C</em>':''}${p.tore?`<i>${'⚽'.repeat(Math.min(p.tore,4))}</i>`:''}${p.gelbrot?' <i class="gc-k yr"></i>':p.rot?' <i class="gc-k r"></i>':p.gelb?' <i class="gc-k y"></i>':''}<small>${p.pos?svEsc(p.pos)+' · ':''}${p.min!=null?p.min+'′':''}</small></li>`;
    return `${(A.start_n||0)<11?`<div class="note gc-np">Startelf unvollständig veröffentlicht (${A.start_n||0} Spieler).</div>`:''}
      <div class="gc-pv">Positionsverteilung der Startelf: ${svEsc(gcPosText(A.pos||{}))}<small>laut veröffentlichter Position, keine bestätigte Formation</small></div>
      ${sp.b&&r.a?'':`<ol>${st.map(li).join('')}</ol>${bk.length?`<div class="gc-bk">Ersatz</div><ul>${bk.map(li).join('')}</ul>`:''}`}`; };
  const tore=(f.ev||[]).filter(e=>e.t==='goal');
  return `<h3 class="trh">Aus dem FuPa-Spielbericht</h3>
    ${K.length?`<div class="gc-fk">${K.map(k=>`<span class="${k.s||''}">${GC_ART[k.t][0]} ${k.m!=null?svEsc(k.m+(k.x?'+'+k.x:'')+'. '):''}${svEsc(k.name||'ohne veröffentlichten Namen')} <small>${svEsc(k.s?nm(k.s):'')} · ${svEsc(GC_ART[k.t][1])}</small></span>`).join('')}</div>`:'<div class="note">Keine Karten im FuPa-Bericht.</div>'}
    ${!sp.b&&tore.length?`<div class="gc-tl">${tore.map(e=>`<div class="gc-ev ${e.s||'h'} t-tor"><span class="gc-m">${svEsc((e.m??'')+(e.x?'+'+e.x:'')+'.')}</span><span class="gc-ic">⚽</span><span class="gc-tx"><b>${svEsc(e.name||'ohne Namen')}</b></span></div>`).join('')}</div>`:''}
    <div class="gc-auf"><div><h4>${svEsc(r.heim)}</h4>${seite('h')}</div><div><h4>${svEsc(r.gast)}</h4>${seite('g')}</div></div>
    ${f.timeline_ok===false?'<p class="note">FuPa zeigt nur veröffentlichte Höhepunkte, der Verlauf ist nicht als vollständig bestätigt.</p>':''}`;
}

/* ---------- Karten im Gegnercheck ---------- */
function gcKarteVorSpiel(D,key,wer){
  const A=gcAuswertung(D,key); A.schuetzen.forEach(x=>x.name=gcName(D,x.k));
  const hin=gcHinweise(A,wer), vt=gcFupaVerteilung(D,key);
  const pvFu=A.letztes?gcFupaKarten(D,A.letztes).filter(k=>k.s===A.letztes.side&&(k.t==='gelbrot'||k.t==='rot')):[];
  const sperre=A.pv.length?`<div class="gc-warn"><b>🟥 Platzverweis im letzten Spiel</b><span>${A.pv.map(e=>`${GC_ART[e.t][1]} (${gcMin(e)} Minute)`).join(', ')} gegen ${svEsc(A.letztes.opp)} am ${svEsc(spWd(A.letztes.datum)).replace(/\.$/,'')}.
      ${pvFu.filter(k=>k.name).length?` Laut FuPa: <b>${pvFu.filter(k=>k.name).map(k=>svEsc(k.name)).join(', ')}</b>.`:' Wer es war, nennt FUSSBALL.DE nicht im Klartext.'} Nach Gelb-Rot oder Rot folgt oft eine Sperre, eine bestätigte Sperre liefert aber keine Quelle.</span></div>`:'';
  const pvSaison=(D.fupa||[]).flatMap(f=>(f.ev||[]).filter(e=>e.t==='card'&&e.s===f.seite&&/red/.test(e.st||'')&&e.name).map(e=>({...e,datum:f.datum})));
  const fehlt=A.fehlt.slice(0,6).map(s=>`<li><b>${svEsc(gcName(D,s.k)||'Name folgt')}</b><span>${s.start} von ${A.mitAuf} Spielen in der Startelf${s.tore?', '+s.tore+' Tor'+(s.tore>1?'e':''):''}</span><em>${s.seit===1?'in der neuesten':'in den '+s.seit+' neuesten'} veröffentlichten Aufstellung${s.seit===1?'':'en'} nicht genannt</em></li>`).join('');
  const elf=A.elf.map(s=>`<li><span>${svEsc(gcName(D,s.k)||'Name folgt')}</span>${s.tw?'<em>TW</em>':''}${s.c?'<em>C</em>':''}<small>${s.letzte4}/${Math.min(4,A.mitAuf)}</small></li>`).join('');
  const mx=Math.max(1,...A.bins.f,...A.bins.a);
  const bins=GC_BINS.map((l,i)=>`<div class="gc-bin"><i class="f" style="height:${Math.round(A.bins.f[i]/mx*100)}%"><b>${A.bins.f[i]||''}</b></i><i class="a" style="height:${Math.round(A.bins.a[i]/mx*100)}%"><b>${A.bins.a[i]||''}</b></i><span>${l}</span></div>`).join('');
  const sch=A.schuetzen.slice(0,6).map(x=>`<li><b>${svEsc(x.name||'Name folgt')}</b><span>${x.tore} Tor${x.tore>1?'e':''}${x.elf?`, davon ${x.elf} Strafstoß`:''}</span><em>${x.min.length?'Minuten '+x.min.sort((a,b)=>a-b).join(', '):''}</em></li>`).join('');
  return `${sperre}
    ${hin.length?`<div class="spl ok gc-hin"><b>Das fällt auf</b>${hin.map(x=>`<span>${svEsc(x)}</span>`).join('')}</div>`:''}
    <div class="gc-grid">
      <div><h4 class="sph4">Wann fallen die Tore?</h4>${A.mitVerlauf?`<div class="gc-bins">${bins}</div><div class="splegend"><span style="--c:var(--gc-f)">Tore</span><span style="--c:var(--gc-a)">Gegentore</span></div><small class="note">Aus ${A.mitVerlauf} Spielberichten. 1. Halbzeit ${A.hz.f[0]}:${A.hz.a[0]}, 2. Halbzeit ${A.hz.f[1]}:${A.hz.a[1]}.</small>`:'<div class="note">Noch keine Spielberichte mit Toren.</div>'}</div>
      <div><h4 class="sph4">Torschützen mit Minute</h4>${sch?`<ul class="gc-li">${sch}</ul>`:'<div class="note">Noch keine Torschützen aus Spielberichten.</div>'}</div>
      <div><h4 class="sph4">Häufigste Startelf zuletzt</h4>${elf?`<ul class="gc-elf">${elf}</ul><small class="note">Startelf-Einsätze in den letzten ${Math.min(4,A.mitAuf)} Spielen mit Aufstellung.</small>`:'<div class="note">Noch keine Aufstellungen veröffentlicht.</div>'}</div>
      <div><h4 class="sph4">Oft in der Startelf, zuletzt nicht genannt</h4>${fehlt?`<ul class="gc-li gc-fehlt">${fehlt}</ul><small class="note">Nur ein Unterschied zwischen veröffentlichten Aufstellungen (FUSSBALL.DE). Keine bestätigte Abwesenheit, keine Aussage über Verletzung, Sperre oder das nächste Spiel.</small>`:`<div class="note">${A.mitVoll>=4?'Alle häufigen Startelf-Spieler sind in der neuesten veröffentlichten Aufstellung genannt. Das bestätigt keine Verfügbarkeit.':'Dafür braucht es mindestens vier vollständig veröffentlichte Aufstellungen, das letzte Spiel eingeschlossen.'}</div>`}</div>
    </div>
    <div class="gc-facts"><span>🟨 ${A.karten.gelb} Gelbe</span><span>🟨🟥 ${A.karten.gelbrot} Gelb-Rote</span><span>🟥 ${A.karten.rot} Rote</span><span>🧱 ${A.zuNull}× zu Null</span><span>🚫 ${A.ohneTor}× ohne eigenes Tor</span></div>
    ${vt?`<div class="gc-pv">Positionsverteilung der Startelf laut FuPa (${svEsc(spWd(vt.datum))}): ${svEsc(gcPosText(vt.pos))}<small>veröffentlichte Positionen, keine bestätigte Formation</small></div>`:''}
    ${pvSaison.length?`<div class="gc-pv">Platzverweise laut FuPa: ${pvSaison.map(e=>`${svEsc(e.name)} (${e.st==='card_red'?'Rot':'Gelb-Rot'}, ${svEsc(spWd(e.datum))})`).join(', ')}<small>Karten aus veröffentlichten Spielberichten, keine Sperrenliste</small></div>`:''}`;
}
function gcGemeinsam(Do,oKey,Dw,wKey){
  if(!Do||!Dw)return ''; const O=gcSpiele(Do,oKey).filter(g=>g.e), W=gcSpiele(Dw,wKey).filter(g=>g.e); const out=[];
  const opps=new Set(O.map(g=>g.oppKey)); [...new Set(W.map(g=>g.oppKey))].filter(k=>opps.has(k)&&k!==oKey&&k!==wKey).forEach(k=>{
    const w=W.filter(g=>g.oppKey===k), o=O.filter(g=>g.oppKey===k);
    out.push(`<div class="gc-gm"><span>${scCrest(w[0].opp,'sm')}<b>${svEsc(w[0].opp)}</b></span><em class="f${w[0].e}" data-gcspiel="${svEsc(w[0].id)}" data-gckey="${svEsc(wKey)}">Wir ${w.map(g=>g.tf+':'+g.ta).join(', ')}</em><em class="f${o[0].e}" data-gcspiel="${svEsc(o[0].id)}" data-gckey="${svEsc(oKey)}">Sie ${o.map(g=>g.tf+':'+g.ta).join(', ')}</em></div>`); });
  return out.length?`<div class="card gc-card"><h3 class="trh">${SVI('users')} Gemeinsame Gegner</h3><div class="gc-gms">${out.join('')}</div><small class="note">Ergebnis antippen für den Spielbericht.</small></div>`:'';
}

/* ---------- Letzte veröffentlichte Einsätze (neutrale Teilnahmehinweise der KLA-Quelle) ----------
   Historische Beobachtungen aus veröffentlichten Aufstellungen. Vergleiche bildet participation-client.mjs (KLA-Paket) aus den aktuell
   importierten Berichten neu: aktueller Bericht gegen den zeitlich nächsten älteren gespeicherten Bericht derselben Mannschaft. */
function gcTnSeite(r){ return r&&r.data?r.data[r.seite==='h'?'homeTeam':'awayTeam']:null; }
function gcTnName(pl){ const n=[pl&&pl.player&&pl.player.firstName,pl&&pl.player&&pl.player.lastName].filter(Boolean).join(' ').trim(); return n||null; }
function gcTnFakten(side){
  const P=side&&side.participation; const eigen=KLA_PART.participationFacts(side||{});
  return P&&Array.isArray(P.players)?P:eigen;
}
function gcTnVergleich(D,i){
  const L=(D&&D.einsaetze)||[], cur=L[i], prev=L[i+1]; if(!cur)return null;
  if(!prev)return {status:'kein_vorgaenger',players:[]};
  let v; try{ v=KLA_PART.comparePublishedLineups(cur,prev,D.fupa_team); }catch(e){ v={status:'insufficient_comparable_lineups',players:[]}; }
