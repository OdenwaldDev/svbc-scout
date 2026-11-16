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
  if(!KAL.loaded){ kalLoad(); return; }
  const h=kalHeute(), L=kalSichtbar().filter(i=>(i.bis||i.d)>=h).slice(0,4);
  if(!box){ box=document.createElement('div'); box.id='kalHome'; box.className='card kal-home'; const m=document.getElementById('svrMeine')||document.getElementById('svCockpit'); if(m)m.after(box); else home.prepend(box); }
  box.innerHTML=`<div class="kal-hh"><h3 class="trh">${SVI('cal')} Nächste Termine</h3><button type="button" class="btn ghost sm" id="kalAlle">Alle Termine ${SVI('chev')}</button></div>
    ${L.length?L.map(i=>`<div class="kal-hrow">${kalRel(i.d)?`<em class="kal-rel">${svEsc(kalRel(i.d))}</em>`:`<em class="kal-rel">${svEsc(kalWt(i.d)+'., '+kalDM(i.d))}</em>`}${kalItemHtml(i)}</div>`).join(''):'<p class="note">In deiner Auswahl steht gerade nichts an.</p>'}`;
  box.querySelector('#kalAlle').onclick=()=>goTab('kalender');
  box.querySelectorAll('[data-kid]').forEach(b=>b.onclick=()=>kalDetail(b.dataset.kid));
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
  const ps=gcTnSeite(prev), byId=new Map(((ps&&ps.players)||[]).map(p=>[String(p.player&&p.player.id),p]));
  v={...v,players:(v.players||[]).map(p=>({...p,name:gcTnName(byId.get(String(p.player_id)))}))};
  const st=(gcTnSeite(cur)||{}).participation_comparison;
  if(st&&st.status){ const a=new Set((st.players||[]).map(p=>String(p.player_id))), b=new Set(v.players.map(p=>String(p.player_id)));
    v.neu_gebildet=st.status!==v.status||a.size!==b.size||[...a].some(x=>!b.has(x))||(st.previous_match_id!=null&&v.status==='compared_published_lists'&&String(st.previous_match_id)!==String(prev.entity)); }
  v.prev=prev; return v;
}
const gcZeit=t=>{ try{ return new Date(t).toLocaleString('de-DE',{day:'2-digit',month:'2-digit',year:'numeric',hour:'2-digit',minute:'2-digit'}); }catch(e){ return String(t||''); } };
const gcTag=r=>{ try{ return spWd(new Date(r.data.kickoff).toLocaleDateString('sv-SE',{timeZone:'Europe/Berlin'})); }catch(e){ return ''; } };
function gcEinsaetzeKarte(D){
  const L=((D&&D.einsaetze)||[]).slice(0,5); if(!L.length)return '';
  const min=m=>m==null?'<small class="gc-unb">Minuten unbekannt</small>':`<small>${m}′</small>`;
  const item=(r,i)=>{
    const side=gcTnSeite(r)||{}, F=gcTnFakten(side), fm=new Map((F.players||[]).map(p=>[String(p.player_id),p]));
    const rows=(side.players||[]).filter(p=>p.player&&p.player.id!=null&&(!p.coach||p.starting===true||(p.statistics&&p.statistics.minutes>0)));
    const nm=p=>svEsc(gcTnName(p)||'ohne veröffentlichten Namen');
    const start=rows.filter(p=>{ const f=fm.get(String(p.player.id)); return f?f.starting===true:p.starting===true; });
    const ein=rows.filter(p=>{ const f=fm.get(String(p.player.id)); return f&&f.starting!==true&&f.substituted_in===true; });
    const rest=rows.filter(p=>!start.includes(p)&&!ein.includes(p));
    const li=(p,extra)=>{ const f=fm.get(String(p.player.id))||{}; return `<li><span>${nm(p)}</span>${p.captain?'<em>C</em>':''}${p.position?`<small>${svEsc(p.position)}</small>`:''}${min(f.minutes_played)}${f.substituted_out===true?'<i class="gc-tag">Laut Spielstatistik ausgewechselt</i>':''}${extra||''}</li>`; };
    const nichtVer=side.availability==='not_published';
    const v=gcTnVergleich(D,i), pv=v&&v.prev;
    const vgl=!v?'':v.status==='compared_published_lists'?
        `<div class="gc-vgl"><b>In der neueren veröffentlichten Aufstellung nicht genannt</b><small>Vergleich ${svEsc(gcTag(r))} mit ${svEsc(gcTag(pv))} (${svEsc(pv.heim||'')} gegen ${svEsc(pv.gast||'')})</small>
          ${v.players.length?`<ul>${v.players.map(p=>`<li>${svEsc(p.name||'ohne veröffentlichten Namen')}</li>`).join('')}</ul>`:'<p class="note">Alle Spieler der älteren Liste sind auch in der neueren genannt. Das bestätigt nicht, dass alle verfügbar sind.</p>'}
          <p class="note">Nur ein Unterschied zwischen zwei veröffentlichten Listen. Keine bestätigte Abwesenheit, keine Aussage über Verletzung, Sperre oder das nächste Spiel.</p>
          <small class="gc-src">Quellen: <a href="${svEsc(r.source_url||'#')}" target="_blank" rel="noopener">${svEsc(gcTag(r))}</a> (geprüft ${svEsc(gcZeit(r.checked_at))}) und <a href="${svEsc(pv.source_url||'#')}" target="_blank" rel="noopener">${svEsc(gcTag(pv))}</a> (geprüft ${svEsc(gcZeit(pv.checked_at))})</small>
          ${v.neu_gebildet?'<small class="gc-src">Aus den aktuell importierten Berichten neu gebildet, weicht vom gespeicherten Vergleich der Quelle ab.</small>':''}</div>`
      :v.status==='kein_vorgaenger'?'<div class="gc-vgl"><small>Kein älterer gespeicherter Bericht dieser Mannschaft zum Vergleich.</small></div>'
      :`<div class="gc-vgl"><b>Zu wenige vergleichbare Aufstellungsdaten</b><small>${pv?`Vergleich mit ${svEsc(gcTag(pv))} nicht möglich: nicht beide Listen mit genau elf eindeutigen Startern.`:''} Der Vergleich bleibt unbekannt.</small>${v.neu_gebildet?'<small class="gc-src">Aus den aktuell importierten Berichten neu gebildet, weicht vom gespeicherten Vergleich der Quelle ab.</small>':''}</div>`;
    const e=String(r.entity), offen=GC.offen?(GC.offen.has(e)||(i===0&&!(GC.gesehen&&GC.gesehen.has(e)))):i===0;
    (GC.gesehen=GC.gesehen||new Set()).add(e);
    return `<details class="gc-tn" data-gctn="${svEsc(r.entity)}"${offen?' open':''}><summary><b>${svEsc(r.heim||'')} gegen ${svEsc(r.gast||'')}</b><span>${svEsc(gcTag(r))}${r.tore?' · '+r.tore[0]+':'+r.tore[1]:''}</span></summary>
      <div class="gc-tn-q">Quelle: <a href="${svEsc(r.source_url||'#')}" target="_blank" rel="noopener">FuPa-Spielbericht</a> · Spiel ${svEsc(r.entity)} · geprüft ${svEsc(gcZeit(r.checked_at))}${r.id?` · <button type="button" class="linkbtn" data-gcspiel="${svEsc(r.id)}" data-gckey="${svEsc(D.key)}">ganzer Spielbericht</button>`:''}</div>
      ${nichtVer?'<div class="note gc-np">Aufstellung nicht veröffentlicht. Wer gespielt hat, ist damit unbekannt.</div>':`
      ${F.starting_eleven_verified===false?`<div class="note gc-np">Startelf nicht vollständig oder nicht eindeutig veröffentlicht (${start.length} Starter).</div>`:''}
      <div class="gc-tn-g"><div><h4>Startelf</h4><ul class="gc-tnl">${start.map(p=>li(p)).join('')||'<li class="gc-unb">keine</li>'}</ul></div>
        <div><h4>Eingewechselt</h4><ul class="gc-tnl">${ein.map(p=>li(p,'<i class="gc-tag in">Laut Spielstatistik eingewechselt</i>')).join('')||'<li class="gc-unb">laut Statistik niemand</li>'}</ul>
        ${rest.length?`<h4>Ohne Einsatz laut Statistik</h4><ul class="gc-tnl">${rest.map(p=>{ const f=fm.get(String(p.player.id))||{}; return `<li><span>${nm(p)}</span>${f.substituted_in==null&&f.minutes_played==null?'<small class="gc-unb">Einsatz unbekannt</small>':''}</li>`; }).join('')}</ul>`:''}
        <small class="note">Vollständigkeit der Ersatzbank: unbekannt.</small></div></div>`}
      ${vgl}</details>`; };
  return `<div class="card gc-card" id="gcEins"><h3 class="trh">${SVI('users')} Letzte veröffentlichte Einsätze</h3>
    <p class="note">Aus veröffentlichten FuPa-Aufstellungen. Historische Beobachtungen mit Spiel und Quelle, keine Prognose für das nächste Spiel.</p>
    ${L.map(item).join('')}</div>`;
}

/* ---------- Einbau in den Gegnercheck ---------- */
async function gcEnhance(){
  const P=document.getElementById('panel-gegner'); if(!P||!P.classList.contains('active')||typeof SP==='undefined'||!SP.loaded)return;
  const team=SP.team, own=SP_OWN[team], next=spNext(team), f=(SP.sel&&next.find(x=>x.id===SP.sel))||next[0]; if(!f)return;
  const home=f.heim_key===own, oppKey=home?f.gast_key:f.heim_key, oppName=home?f.gast:f.heim, sub=f.sub==='POKAL'?team:f.sub;
  if(sub!=='A'&&sub!=='D2')return;
  // alte Fieberkurve weicht der neuen Kurve
  P.querySelectorAll('.spfever,.spfever+.splegend').forEach(x=>x.remove()); P.querySelectorAll('h4.sph4').forEach(h=>{ if(/Fieberkurve/.test(h.textContent))h.remove(); });
  const anchor=P.querySelector('.sphero'); if(!anchor)return;
  let box=P.querySelector('#gcBox'); if(!box){ box=document.createElement('div'); box.id='gcBox'; anchor.after(box); }
  box.dataset.f=f.id;
  if(!GC.cache.has(sub+'|'+oppKey))box.innerHTML='<div class="card"><div class="empty">Lade Spielberichte …</div></div>';
  const [Do,Dw]=await Promise.all([gcLoad(sub,oppKey),gcLoad(sub,own)]);
  if(!box.isConnected||box.dataset.f!==f.id)return;
  if(!Do||!Do.spiele||!Do.spiele.length){ box.innerHTML=`<div class="card"><div class="note">Für ${svEsc(oppName)} sind noch keine Spielberichte da. Sie kommen nach dem nächsten Abruf (sonntags abends, montags, dienstags und donnerstags früh).</div></div>`; return; }
  const sicht=GC.sicht==='wir'?'wir':'gegner', D=sicht==='wir'?Dw:Do, key=sicht==='wir'?own:oppKey, wer=sicht==='wir'?'Wir':oppName;
  const W=team==='A'?'SV/BSC':'SV/BSC II';
  box.innerHTML=`<div class="card gc-card"><div class="svc-h"><h3>${SVI('chart')} Saisonverlauf</h3><div class="trtabs gc-sicht"><button class="${sicht==='gegner'?'on':''}" data-gcsicht="gegner">${svEsc(oppName)}</button><button class="${sicht==='wir'?'on':''}" data-gcsicht="wir">${svEsc(W)}</button></div></div>
      ${D?gcKurve(D,key,wer):'<div class="note">Noch keine Daten.</div>'}</div>
    <div class="card gc-card"><h3 class="trh">${SVI('target')} Vor dem Spiel: ${svEsc(sicht==='wir'?W:oppName)}</h3>${D?gcKarteVorSpiel(D,key,sicht==='wir'?'Unser Team':oppName):''}</div>
    ${D?gcEinsaetzeKarte(D):''}
    ${gcGemeinsam(Do,oppKey,Dw,own)}
    <div class="note">Spielberichte: FUSSBALL.DE, öffentlich. ${Do.berichte_liga||0} von ${Do.spiele_liga||0} Ligaspielen mit Bericht${Do.stand?', Stand '+new Date(Do.stand).toLocaleString('de-DE',{day:'2-digit',month:'2-digit',hour:'2-digit',minute:'2-digit'}):''}.${(Do.fupa||[]).length?` FuPa-Spielberichte des Gegners: ${(Do.fupa||[]).length} (nur intern${Do.fupa_abdeckung&&Do.fupa_abdeckung.detail_targets!=null?', Quelle plant bis zu '+svEsc(Do.fupa_abdeckung.detail_targets)+' Berichte':''}).`:''}</div>`;
  gcBind(box);
}
function gcBind(root){
  // aufgeklappte Einsatzberichte bleiben beim Neuzeichnen (Push, Umschalten) offen
  root.querySelectorAll('details.gc-tn').forEach(d=>d.addEventListener('toggle',()=>{ GC.offen=new Set([...root.querySelectorAll('details.gc-tn[open]')].map(x=>x.dataset.gctn)); }));
  root.querySelectorAll('[data-gcspiel]').forEach(b=>b.onclick=e=>{ e.stopPropagation(); gcBericht(b.dataset.gckey,b.dataset.gcspiel); });
  root.querySelectorAll('[data-gcmode]').forEach(b=>b.onclick=()=>{ GC.modus[b.dataset.gckey]=b.dataset.gcmode; gcEnhance(); });
  root.querySelectorAll('[data-gcsicht]').forEach(b=>b.onclick=()=>{ GC.sicht=b.dataset.gcsicht; gcEnhance(); });
}
{ const _spr=spRender; spRender=async function(){ const r=await _spr.apply(this,arguments); try{ await gcEnhance(); }catch(e){ console.warn('Gegnercheck',e); } return r; }; }
SV_PAGES.gegner=['Gegnercheck','Der nächste Gegner: Formkurve, Spielberichte, Tore, Karten, Startelf'];

// Push/Neuladen: kommen neue KLA-Daten (Cursor, Werte), Gegnerdaten verwerfen und die offene Ansicht neu zeichnen
if(typeof svKlaLaden==='function'){ const _kl=svKlaLaden; svKlaLaden=async function(){ const r=await _kl.apply(this,arguments);
  try{ GC.cache.clear(); GC.gen=(GC.gen||0)+1; if(document.querySelector('#panel-gegner.active #gcBox'))await gcEnhance(); }catch(e){ console.warn('Gegnercheck neu',e); } return r; }; }

/* =====================================================================
   Sportzentrale Beta 0.29 · Mannschaften neu geordnet (Wünsche von Lukas)
   - Mannschaften: 1. Mannschaft · 2. Mannschaft · SOMA & Inaktive · Eigene Jugend, auf allen Geräten gleich
   - 1. und 2. Mannschaft: dieselben Reiter und Funktionen, jeweils nur mit den Spielern ihrer Stammmannschaft
     (Training, Spiele, Abstimmungen und Materialdienst werden je Mannschaft gespeichert)
   - SOMA & Inaktive: SOMA-Spieler, Spieler mit Pass ohne Mannschaft und Spieler ganz ohne Zuordnung, mit Profil und Zuordnung
   - Eigene Jugend: nur Jugendmannschaften; A-Jugend aus fussball.de übernehmen („(u)“ = unbestätigt, Bestätigen per Link)
   ===================================================================== */
MN.ctx='1';
const MN_CTX_T={'1':'1. Mannschaft','2':'2. Mannschaft'};
function mnCtx(){ return MN.ctx==='2'?'2':'1'; }
function mnCtxT(){ return MN_CTX_T[mnCtx()]; }
MN_TEAM.S='SOMA'; MN_TK.S='S'; if(!MN_TEAMS.includes('S'))MN_TEAMS.splice(Math.max(0,MN_TEAMS.indexOf('U')),0,'S');
MN_TEAM.U='Inaktiv mit Pass';
if(typeof SV4_TEAM!=='undefined'){ SV4_TEAM.S='SOMA'; SV4_TEAM.U='Inaktiv mit Pass'; }
if(MN_F&&MN_F.team&&!MN_F.team.some(x=>x[0]==='S')){ const i=MN_F.team.findIndex(x=>x[0]==='U'); MN_F.team.splice(i<0?MN_F.team.length:i,0,['S','SOMA']); const u=MN_F.team.find(x=>x[0]==='U'); if(u)u[1]='Inaktiv mit Pass'; }

/* ---------- Seiten, Titel, Seitenleiste ---------- */
Object.assign(SV_PAGES,{training:['1. Mannschaft','Spieler, Training, Spiele, Verletzungen, Abwesenheiten, Materialdienst, Abstimmungen und Massenpflege'],
  somainakt:['SOMA & Inaktive','SOMA-Spieler und Spieler mit Pass, die gerade für keine Mannschaft spielen'],
  teams:['Eigene Jugend','Jugendmannschaften: Kader, Termine, Aufstellung, Statistik, Entwicklung und Abstimmung']});
Object.assign(SV_TBL,{training:['activity','Mannschaft']});
if(typeof SV_SIDE!=='undefined')Object.keys(SV_SIDE).forEach(r=>{ const L=SV_SIDE[r]; const i=L.indexOf('Mannschaft'); if(i>=0){ if(L.includes('Mannschaften'))L.splice(i,1); else L.splice(i,1,'Mannschaften'); } });
const MN31_TABS=['mann1','mann2','somainakt'];
{ const _ta31=svTabAllowed; svTabAllowed=function(t){
  if(t==='mann1'||t==='mann2')return _ta31('training');
  if(t==='somainakt')return _ta31('training');
  if(t==='teams')return mn31Jugend().length>0;
  return _ta31.apply(this,arguments); }; }
function mn31IstJugend(m){ return m&&(m.art==='jugend'||/^(a|b|c|d|e|f|g|mini)/.test(String(m.id||'')))&&m.id!=='h2'&&m.id!=='soma'; }
function mn31Jugend(){ try{ return svrTeams().filter(mn31IstJugend); }catch(e){ return []; } }

/* ---------- Server-Aufrufe tragen die Mannschaft mit ---------- */
function mn31Hook(){
  const sb=typeof SVB!=='undefined'&&SVB.sb; if(!sb||sb._mn31)return; sb._mn31=1;
  const rpc=sb.rpc.bind(sb), from=sb.from.bind(sb);
  sb.rpc=function(fn,args,opt){
    if(fn==='training_state'){ const want=mnCtx(), q=rpc(fn,Object.assign({},args||{},{p_team:want}),opt);
      // Antwort für eine andere Mannschaft (inzwischen umgeschaltet) verwerfen
      const P=Promise.resolve(q).then(r=>r&&r.data&&(r.data.team||'1')!==mnCtx()?{data:null,error:null,veraltet:true}:r);
      return {then:(a,b)=>P.then(a,b),catch:f=>P.catch(f),finally:f=>P.finally(f)}; }
    if((fn==='training_save'||fn==='training_liste_import')&&args&&args.p&&!args.p.team)args=Object.assign({},args,{p:Object.assign({},args.p,{team:mnCtx()})});
    return rpc(fn,args,opt); };
  sb.from=function(t){ const q=from(t);
    if(t==='kasse_katalog'||t==='kasse_buchungen'){   // 0.86: Katalog und Strafen je Mannschaft; Ein-/Ausgaben bleiben gemeinsam
      const add1=x=>(t==='kasse_katalog'||x.art==='strafe'||x.art==='beitrag')&&!x.team?Object.assign({},x,{team:mnCtx()}):x, add=r=>Array.isArray(r)?r.map(add1):add1(r);
      const ins=q.insert.bind(q); q.insert=(r,o)=>ins(add(r),o); }
    if(t==='polls'||t==='materialdienst'){ const add=r=>Array.isArray(r)?r.map(x=>Object.assign({team:mnCtx()},x)):Object.assign({team:mnCtx()},r);
      const ins=q.insert.bind(q); q.insert=(r,o)=>ins(add(r),o);
      if(q.upsert){ const ups=q.upsert.bind(q); q.upsert=(r,o)=>ups(add(r),o); } }
    return q; };
}
{ const _tl31=trLoad; trLoad=function(){ mn31Hook(); return _tl31.apply(this,arguments); }; }
if(typeof kbLoadKern==='function'){ const _kl31=kbLoadKern; kbLoadKern=async function(){ mn31Hook(); const r=await _kl31.apply(this,arguments); try{ mn31KbFilter(); }catch(e){} return r; }; }
if(typeof sv91Load==='function'){ const _ml31=sv91Load; sv91Load=async function(){ mn31Hook(); const r=await _ml31.apply(this,arguments); try{ mn31MdFilter(); }catch(e){} return r; }; }
function mn31KbFilter(){ if(typeof KB==='undefined'||!Array.isArray(KB.polls))return; if(KB.polls!==KB._p31f){ KB._p31all=KB.polls; }
  KB.polls=KB._p31f=(KB._p31all||[]).filter(p=>(p.team||'1')===mnCtx());
  // Kasse: Katalog und Strafen der gewählten Mannschaft, gemeinsame Ein-/Ausgaben (ohne Mannschaft) bei beiden
  if(Array.isArray(KB.kat)){ if(KB.kat!==KB._k31f)KB._k31all=KB.kat; KB.kat=KB._k31f=(KB._k31all||[]).filter(k=>(k.team||'1')===mnCtx()); }
  if(Array.isArray(KB.buch)){ if(KB.buch!==KB._b31f)KB._b31all=KB.buch; KB.buch=KB._b31f=(KB._b31all||[]).filter(b=>!b.team||b.team===mnCtx()); } }
function mn31MdFilter(){ if(typeof SV91==='undefined'||!Array.isArray(SV91.md))return; if(SV91.md!==SV91._m31f){ SV91._m31all=SV91.md; }
  SV91.md=SV91._m31f=(SV91._m31all||[]).filter(m=>(m.team||'1')===mnCtx()); }

/* ---------- Mannschaft wechseln ---------- */
function mnCtxSet(t,render){
  t=t==='2'?'2':'1'; if(MN.ctx===t)return false;
  MN.ctx=t; MN.team='alle'; MN.focus=null; MN.q='';
  try{ TR.st={sessions:[],injuries:TR.st.injuries||[]}; TR.loaded=false; TR.loading=null; }catch(e){}
  try{ mn31KbFilter(); }catch(e){} try{ mn31MdFilter(); }catch(e){}
  try{ if(typeof SVM!=='undefined'){ SVM.g31=null; } }catch(e){}
  try{ trLoad(true); }catch(e){}
  if(render){ try{ if(svCurTab()==='training')trRender(); }catch(e){} }
  return true;
}
function mn31Titel(){ const cur=svCurTab(); if(cur!=='training'&&!(cur==='kabine'&&typeof KB!=='undefined'&&KB.view!=='kasse'))return;
  const h=document.getElementById('pgTitle'); if(h)h.textContent=mnCtxT(); try{ document.title=mnCtxT()+' · '+SV4.name; }catch(e){}
  const side=mnCtx()==='2'?'mann2':'mann1';
  document.querySelectorAll('.snav button[data-tab]').forEach(x=>{ if(['training','mann1','mann2'].includes(x.dataset.tab))x.classList.toggle('active',x.dataset.tab===side); });
  document.querySelectorAll('.sgrid [data-sheet]').forEach(x=>{ if(['training','mann1','mann2'].includes(x.dataset.sheet))x.classList.toggle('active',x.dataset.sheet===side); });
}
{ const _gt31=goTab; goTab=function(tab){
  if(tab==='mann1'||tab==='mann2'){ mnCtxSet(tab==='mann2'?'2':'1',false); tab='training'; }
  else if(tab==='somainakt')mn31Panel();
  else if(tab!=='training'&&tab!=='kabine'&&tab!=='kasse')mnCtxSet('1',false);   // außerhalb der Mannschaft gilt die Erste; die Kasse behält die gewählte Mannschaft (0.86)
  const r=_gt31(tab);
  try{ mn31Titel(); if(svCurTab()==='somainakt')mn31Render(); }catch(e){ console.warn('Mannschaften 0.29',e); }
  return r; }; }
{ const _hb31=sv4HubBar; sv4HubBar=function(tab){ const r=_hb31.apply(this,arguments); try{ mn31Switch(tab); mn31Titel(); }catch(e){} return r; }; }
function mn31Ind(inn){ try{ const on=inn.querySelector(':scope > button.on'), ind=inn.querySelector('.hub-ind'); if(!on||!ind)return; const x=on.offsetLeft+10, w=Math.max(12,on.offsetWidth-20);
  ind.style.transition='none'; ind.style.width=w+'px'; ind.style.transform=`translateX(${x}px)`; if(typeof SV43!=='undefined'&&SV43.hubRect)Object.assign(SV43.hubRect,{x,w}); }catch(e){} }
addEventListener('resize',()=>{ const inn=document.querySelector('#hubbar .hub-in'); if(inn&&inn.querySelector('.mn31-sw'))mn31Ind(inn); },{passive:true});
// Umschalter 1./2. Mannschaft vorne in der Reiterleiste (Handy, Tablet, Browser)
function mn31Switch(tab){
  const bar=document.getElementById('hubbar'); if(!bar||bar.hidden)return;
  const on=tab==='training'||tab==='kabine'; let sw=bar.querySelector('.mn31-sw');
  if(!on){ if(sw)sw.remove(); return; }
  const inn=bar.querySelector('.hub-in'); if(!inn)return;
  if(!sw){ sw=document.createElement('div'); sw.className='mn31-sw'; sw.setAttribute('role','tablist'); sw.setAttribute('aria-label','Mannschaft'); inn.prepend(sw); }
  sw.innerHTML=[['1','1. Mannschaft','Erste'],['2','2. Mannschaft','Zweite']].map(([k,t,s])=>`<button type="button" role="tab" data-mctx="${k}" class="${mnCtx()===k?'act':''}" aria-selected="${mnCtx()===k}" title="${t}"><span class="l">${t}</span><span class="s">${s}</span></button>`).join('');
  mn31Ind(inn); requestAnimationFrame(()=>requestAnimationFrame(()=>mn31Ind(inn))); setTimeout(()=>mn31Ind(inn),400);
  sw.querySelectorAll('[data-mctx]').forEach(b=>b.onclick=e=>{ e.stopPropagation(); if(mnCtxSet(b.dataset.mctx,false)){ if(svCurTab()==='kabine'){ try{ kbRender(); }catch(x){} } else trRender(); mn31Titel(); } });
}

/* ---------- Spieler je Mannschaft ---------- */
{ const _mi31=mnIntern; mnIntern=function(){ const L=_mi31.apply(this,arguments); if(MN.team==='X')return L; return L.filter(p=>mnTeam(p)===mnCtx()); }; }
{ const _sq31=trSquad; trSquad=function(){ if(mnCtx()!=='2')return _sq31.apply(this,arguments);
  const inAtt=new Set(); (TR.st.sessions||[]).forEach(s=>(s.a||[]).forEach(a=>inAtt.add(a[0])));
  return players.filter(p=>!p.isJugend&&!p.verzicht&&!(typeof svmExtern==='function'&&svmExtern(p))&&(mnTeam(p)==='2'||inAtt.has(p.id)))
    .sort((a,b)=>(TR_POS.indexOf(a.pos)-TR_POS.indexOf(b.pos))||a.name.localeCompare(b.name,'de')); }; }
if(typeof vrKader==='function'){ const _vk31=vrKader; vrKader=function(all){ if(mnCtx()==='2'&&!all)return trSquad().slice().sort((a,b)=>a.name.localeCompare(b.name,'de')); return _vk31.apply(this,arguments); }; }
// Massenpflege: die Mannschaft steht fest, Filter „Extern“ und „Nur Lücken“ bleiben
{ const _pf31=MN_VIEWS.pflege; MN_VIEWS.pflege=mnViewPflege=function(B){ if(MN.team!=='X')MN.team='alle'; const r=_pf31.apply(this,arguments);
  try{ B.querySelectorAll('.mp-f [data-mpt]').forEach(b=>{ const k=b.dataset.mpt; if(k==='alle'){ b.textContent=mnCtxT(); } else if(k!=='X')b.remove(); });
    const n=B.querySelector('.mp18 > p.note.small:last-of-type'); if(n&&/internen Spielern/.test(n.textContent))n.textContent=n.textContent.replace('internen Spielern','Spielern der '+mnCtxT());
    if(MN.area==='eye')mn31EyeBox(B); }catch(e){ console.warn('Massenpflege 0.29',e); }
  return r; }; }
// Spielerliste: nur die Mannschaft, ohne Gruppierung nach Mannschaft
{ const _pl31=trViewPlayers; trViewPlayers=function(B){ const r=_pl31.apply(this,arguments);
  try{ B.querySelectorAll('.sp50-h').forEach(h=>{ const t=h.textContent||''; if(/Mannschaft|Pass|Jugend|Umfeld|SOMA|Ohne/.test(t))h.innerHTML=`${svEsc(mnCtxT())} <small>${B.querySelectorAll('tbody tr').length}</small>`; }); }catch(e){}
  return r; }; }
if(SV50_INFO['training:players'])SV50_INFO['training:players'].w='Alle Spieler dieser Mannschaft (Stammmannschaft in der laufenden Saison). Wer hier fehlt, steht in der anderen Mannschaft, unter SOMA & Inaktive oder in der Eigenen Jugend.';

/* =====================================================================
   SOMA & Inaktive
   ===================================================================== */
const MN31={view:'soma',q:''};
function mn31Panel(){ let P=document.getElementById('panel-somainakt'); if(P)return P;
  const ref=document.getElementById('panel-training')||document.querySelector('.panel'); if(!ref)return null;
  P=document.createElement('section'); P.className='panel'; P.id='panel-somainakt'; ref.parentNode.insertBefore(P,ref.nextSibling); return P; }
function mn31Gruppen(){
  const own=players.filter(p=>!p.isJugend&&!(typeof svmExtern==='function'&&svmExtern(p)));
  const soma=[], inakt=[], ohne=[];
  own.forEach(p=>{ const t=mnTeam(p); if(t==='S')soma.push(p); else if(t==='U')inakt.push(p); else if(!t&&p.own&&!p.verzicht)ohne.push(p); });
  const by=(a,b)=>a.name.localeCompare(b.name,'de'); return {soma:soma.sort(by),inakt:inakt.sort(by),ohne:ohne.sort(by)};
}
function mn31Render(){
  const P=mn31Panel(); if(!P)return;
  if(typeof SV4!=='undefined'&&!SV4.loaded&&typeof sv4Load==='function'&&typeof sv4Can==='function'&&sv4Can()){ mnLoadOnce('sv4s',()=>sv4Load(),()=>{ if(svCurTab()==='somainakt')mn31Render(); }); }
  const G=mn31Gruppen(), V=[['soma','SOMA',G.soma.length],['inakt','Inaktiv mit Pass',G.inakt.length],['ohne','Ohne Mannschaft',G.ohne.length]];
  if(!V.some(v=>v[0]===MN31.view))MN31.view='soma';
  const L=(G[MN31.view]||[]).filter(p=>!MN31.q||TRC.N(p.name).includes(TRC.N(MN31.q)));
  const ok=typeof sv4Can==='function'&&sv4Can(), somaTeam=(typeof svrTeams==='function'?svrTeams():[]).find(m=>m.id==='soma');
  const txt={soma:'Spieler mit Stammmannschaft SOMA. Termine, Anwesenheit und Abstimmung der SOMA liegen im Teambereich der SOMA.',
    inakt:'Spieler mit Spielerpass im Verein, die gerade für keine Mannschaft spielen. Sie zählen nicht zum Trainingskader, lassen sich aber jederzeit wieder zuordnen.',
    ohne:'Eigene Spieler ohne Stammmannschaft in der laufenden Saison. Bitte zuordnen: 1., 2., SOMA, Inaktiv mit Pass oder Extern.'}[MN31.view];
  P.innerHTML=`<div class="card mn31">
      <div class="seg50 mn31-seg" role="tablist">${V.map(([k,t,n])=>`<button type="button" role="tab" class="${MN31.view===k?'on':''}" data-m31v="${k}">${t} <small>${n}</small></button>`).join('')}</div>
      <p class="note small">${svEsc(txt)}</p>
      <div class="mn31-f"><input type="search" id="m31q" placeholder="Name suchen" value="${svEsc(MN31.q)}">${MN31.view==='soma'&&somaTeam?`<button type="button" class="btn sm ghost" id="m31soma">${SVI('cal')} Termine & Abstimmung der SOMA</button>`:''}</div>
      <div class="mn31-l">${L.map(p=>{ const t=mnTeam(p)||''; return `<div class="mn31-r" data-m31p="${svEsc(p.id)}">
          <span class="mn31-av">${typeof avaHtml==='function'?avaHtml(p):''}</span>
          <div class="mn31-n"><b>${svEsc(p.name)}</b><small>${svEsc([p.pos,p.alter!=null?p.alter+' J.':'',typeof mn31NrTxt==='function'?mn31NrTxt(p):''].filter(Boolean).join(' · '))}</small></div>
          ${ok?`<select data-m31t aria-label="Stammmannschaft">${[['','–'],['1','1. Mannschaft'],['2','2. Mannschaft'],['S','SOMA'],['U','Inaktiv mit Pass'],['X','Extern']].map(([k,l])=>`<option value="${k}"${k===t?' selected':''}>${l}</option>`).join('')}</select>`:`<span class="c4 mut">${svEsc(MN_TEAM[t]||'–')}</span>`}
        </div>`; }).join('')||'<div class="empty">Niemand in dieser Gruppe.</div>'}</div>
      <p class="note small">Antippen öffnet das Profil. ${ok?'Die Zuordnung gilt für die laufende Saison und landet im Verlauf.':'Zuordnen können Kaderplaner, Trainer, Vorstand und Admin.'}</p></div>`;
  P.querySelectorAll('[data-m31v]').forEach(b=>b.onclick=()=>{ MN31.view=b.dataset.m31v; mn31Render(); });
  const qi=P.querySelector('#m31q'); qi.oninput=()=>{ MN31.q=qi.value; clearTimeout(MN31._t); MN31._t=setTimeout(()=>{ mn31Render(); const n=document.getElementById('m31q'); if(n){ n.focus(); n.setSelectionRange(n.value.length,n.value.length); } },250); };
  const sb=P.querySelector('#m31soma'); if(sb)sb.onclick=()=>{ SVT.soma31=true; SVT._o31=Date.now(); svtOpen('soma'); };
  P.querySelectorAll('[data-m31p]').forEach(r=>{ r.onclick=e=>{ if(e.target.closest('select'))return; openModal(r.dataset.m31p); };
    const s=r.querySelector('[data-m31t]'); if(s)s.onchange=async()=>{ const p=trP(r.dataset.m31p); if(!p)return; s.disabled=true;
      try{ const v=s.value||null; await sv4SSSet(p.id,sv4S(),v==='X'?{team:'X',team2:null}:{team:v}); kToast('✓ '+p.name+': '+(MN_TEAM[v]||(v==='X'?'Extern':'ohne Mannschaft'))); mn31Render(); }
      catch(x){ s.disabled=false; kToast('⚠️ '+x.message); } }; });
}

/* =====================================================================
   Eigene Jugend: Teambereich nur mit Jugendmannschaften (SOMA über „SOMA & Inaktive“)
   ===================================================================== */
{ const _sr31=svtRender; svtRender=function(){ const h=svrTeams;
  svrTeams=function(){ const L=h.apply(this,arguments); if(SVT.soma31&&SVT.team==='soma')return L.filter(m=>m.id==='soma'); return L.filter(mn31IstJugend); };
  let r; try{ r=_sr31.apply(this,arguments); }finally{ svrTeams=h; }
  Promise.resolve(r).then(()=>{ try{ mn31JugendKopf(); }catch(e){} });
  return r; }; }
{ const _gt31b=goTab; goTab=function(tab){ if(SVT.soma31&&(tab!=='teams'||Date.now()-(SVT._o31||0)>800))SVT.soma31=false; const r=_gt31b.apply(this,arguments);
  try{ if(svCurTab()==='teams'){ const side=SVT.soma31?'somainakt':'teams'; document.querySelectorAll('.snav button[data-tab]').forEach(x=>{ if(['teams','somainakt'].includes(x.dataset.tab))x.classList.toggle('active',x.dataset.tab===side); });
      const h=document.getElementById('pgTitle'); if(h)h.textContent=SVT.soma31?'SOMA & Inaktive':'Eigene Jugend'; } }catch(e){}
  return r; }; }
function mn31JugendKopf(){
  const P=document.getElementById('panel-teams'); if(!P)return;
  if(SVT.soma31&&!P.querySelector('.mn31-back')){ const t=P.querySelector('.svt-top'); if(t)t.insertAdjacentHTML('afterbegin',`<button type="button" class="btn sm ghost mn31-back">← SOMA & Inaktive</button>`);
    const b=P.querySelector('.mn31-back'); if(b)b.onclick=()=>{ SVT.soma31=false; goTab('somainakt'); }; }
}

/* =====================================================================
   Training: nur noch die schnelle Erfassung (Da/Fehlt, Eindruck +/0/−, Notiz), kein „Details“-Editor
   ===================================================================== */
var _te31alt=trSessionEditor;
{ const _te31=trSessionEditor; trSessionEditor=function(datum,sid,typ){
  const s=sid?TR.st.sessions.find(x=>x.id===sid):null, t=s?s.t:(typ||'training');
  if(t==='training')return sv50Quick(datum||(s&&s.d)||trToday(),s?s.id:undefined);
  if(t==='spiel')return svmSpielBewerten(s?{id:s.id}:{datum:datum||trToday()});
  return _te31.apply(this,arguments); }; }
window.trSessionEditorAlt=_te31alt;   // alter Editor nur noch intern (Tests, Co-Trainer-Hilfen), in der Oberfläche nicht mehr erreichbar

/* =====================================================================
   Spiele: jedes Spiel eine Einheit, automatisch aus FuPa und fussball.de, Bewertung im geöffneten Spiel
   ===================================================================== */
function mn31Fde(){ return mnCtx()==='2'?'D2':'A'; }
function svm31Plan(){ return mnCtx()==='2'?[]:((typeof SVM!=='undefined'&&SVM.plan)||[]); }
// Freundschaftsspiele von fussball.de getrennt halten: sie gehören zu den Spielen der Mannschaft, nicht in die Pflichtspiel-Statistik
fbLoad=async function(force){
  if(FB.loading||(FB.loaded&&!force))return; FB.loading=true;
  try{
    const [m,p]=await Promise.all([SVB.sb.from('fde_matches').select('id,team,saison,datum,zeit,wettbewerb,code,heim,gast,wir_heim,apps,bank,bericht').order('datum',{ascending:false}).limit(400),
      SVB.sb.from('fde_players').select('key,name').limit(3000)]);
    const all=(m.data||[]).map(x=>Object.assign(x,{apps:Array.isArray(x.apps)?x.apps:[],bank:Array.isArray(x.bank)?x.bank:[]}));
    FB.m=all.filter(x=>x.code!=='FS'); FB.fs=all.filter(x=>x.code==='FS'); FB.pl=new Map((p.data||[]).map(r=>[r.key,r.name])); FB.loaded=true; FB.map=null;
  }catch(e){ console.warn('Spielberichte',e); FB.loaded=true; }
  FB.loading=false; fbAfter();
};
{ const _fm31=fbMap; fbMap=function(){ const h=FB.m; if(!(FB.fs||[]).length)return _fm31.apply(this,arguments); FB.m=h.concat(FB.fs); try{ return _fm31.apply(this,arguments); }finally{ FB.m=h; } }; }
function mn31FbAlle(){ return (typeof FB!=='undefined'&&FB.loaded)?(FB.m||[]).concat(FB.fs||[]):[]; }
if(typeof fbSpielAm==='function'){ fbSpielAm=function(datum){
  if(!FB.loaded)return null; const g=mn31FbAlle().find(x=>x.team===mn31Fde()&&x.datum===datum&&x.bericht); if(!g)return null;
  const M=fbMap(), rows={}; let fehlt=0;
  g.apps.forEach(a=>{ const pid=M.get(a.p); if(!pid){ fehlt++; return; } rows[pid]={status:a.s?'da':'spaet',tore:a.t||0,min:a.m!=null?a.m:null}; });
  g.bank.forEach(k=>{ const pid=M.get(k); if(!pid){ fehlt++; return; } if(!rows[pid])rows[pid]={status:'bank'}; });
  return {rows,fehlt,gegner:g.wir_heim?g.gast:g.heim,heim:g.wir_heim,code:g.code}; }; }
// FuPa-Angaben je Spiel (Aufstellung, Tore, Vorlagen, Minuten, Karten) für die ganze Saison, einmal geladen
SVM.q31=null; SVM.q31Busy=false;
function mn31QLoad(after){
  if(mnCtx()==='2'||SVM.q31||SVM.q31Busy||!canTraining())return; SVM.q31Busy=true;
  Promise.resolve(SVB.sb.rpc('spiel_quellen',{p_von:sv50Start(),p_bis:trToday()})).then(r=>{ SVM.q31Busy=false; if(r&&!r.error){ SVM.q31=new Map((r.data||[]).map(x=>[String(x.datum),x])); try{ after&&after(); }catch(e){} } },()=>{ SVM.q31Busy=false; });
}
function mn31Q(d){ return mnCtx()==='2'||!SVM.q31?null:SVM.q31.get(d)||null; }
{ const _sb31=svmSpielBewerten; svmSpielBewerten=function(o){ if(mnCtx()==='1'&&!SVM.q31&&!SVM.q31Busy&&canTraining()&&!(o&&o._q31)){ const a=Object.assign({},o,{_q31:1}); let done=false; const go=()=>{ if(done)return; done=true; _sb31(a); }; mn31QLoad(go); setTimeout(go,1500); return; } return _sb31.apply(this,arguments); }; }
const MN31_ART={ME:'Liga',PO:'Pokal',FS:'Freundschaftsspiel'};
function mn31Art(g){ const c=g.fb&&g.fb.code, w=(g.fb&&g.fb.wettbewerb)||(g.fq&&g.fq.wettbewerb)||(g.fu&&g.fu.wettbewerb)||'';
  if(c==='FS'||/freundschaft/i.test(w))return 'Freundschaftsspiel'; if(c==='PO'||/pokal/i.test(w))return 'Pokal'; if(c==='ME'||/liga|klasse/i.test(w)||g.fu||g.fq)return 'Liga'; return 'Spiel'; }
function mn31Spiele(){
  const st=sv50Start(), t=trToday(), by=new Map(), get=d=>{ if(!by.has(d))by.set(d,{d}); return by.get(d); };
  (TR.st.sessions||[]).filter(s=>s.t==='spiel'&&s.d>=st&&s.d<=t).forEach(s=>get(s.d).app=s);
  svmPlanVorbei().forEach(g=>get(svmPlanD(g)).fu=g);
  if(SVM.q31&&mnCtx()==='1')SVM.q31.forEach((x,d)=>{ if(d>=st&&d<=t&&x.status!=='PRE')get(d).fq=x; });
  try{ mn31FbAlle().filter(g=>g.team===mn31Fde()&&g.datum>=st&&g.datum<=t).forEach(g=>get(g.datum).fb=g); }catch(e){}
  const G=[...by.values()].sort((a,b)=>b.d.localeCompare(a.d));
  G.forEach(g=>{ const a=g.app, fu=g.fu, fq=g.fq, fb=g.fb;
    g.gegner=(a&&a.g)||(fq&&fq.gegner)||(fu&&fu.gegner)||(fb&&(fb.wir_heim?fb.gast:fb.heim))||'?';
    g.heim=a&&a.h!=null?a.h:fq?fq.heim:fu?fu.heim:fb?fb.wir_heim:null;
    if(a&&a.tw!=null){ g.tw=a.tw; g.tg=a.tg; g.resQ='App'; } else if(fq&&fq.tw!=null){ g.tw=fq.tw; g.tg=fq.tg; g.resQ='FuPa'; } else if(fu&&fu.tore_wir!=null){ g.tw=+fu.tore_wir; g.tg=+fu.tore_gegner; g.resQ='FuPa'; }
    g.art=mn31Art(g); const aq=a?(a.q==='fupa'?'FuPa':a.q==='fussballde'?'fussball.de':'App'):null;
    g.q=[...new Set([aq,fq||fu?'FuPa':null,fb?'fussball.de':null].filter(Boolean))];
    g.bewertet=!!(a&&(a.no!=null||(a.a||[]).some(x=>(x[1]==='da'||x[1]==='spaet')&&x[8]!=null&&x[9]!=='default')));
    g.hw=mn31Konflikte(g); });
  return G;
}
// Widersprüche zwischen Quellen: nie still überschreiben, immer als Hinweis zeigen
function mn31Konflikte(g){
  const out=[], a=g.app, A=(a&&a.a)||[], trainer=x=>['manuell','ki'].includes(x[10]||'manuell');
  const T=Object.fromEntries(SVM_EIN), nm=id=>{ const p=trP(id); return p?p.name:id; };
  if(a&&a.tw!=null&&g.fq&&g.fq.tw!=null&&(g.fq.tw!==a.tw||g.fq.tg!==a.tg))out.push({k:'erg',t:`Ergebnis: App ${a.tw}:${a.tg}, FuPa ${g.fq.tw}:${g.fq.tg}`});
  else if(a&&a.tw!=null&&!g.fq&&g.fu&&g.fu.tore_wir!=null&&(+g.fu.tore_wir!==a.tw||+g.fu.tore_gegner!==a.tg))out.push({k:'erg',t:`Ergebnis: App ${a.tw}:${a.tg}, FuPa ${g.fu.tore_wir}:${g.fu.tore_gegner}`});
  // Torschützen: App (vom Trainerteam eingetragen) gegen FuPa und fussball.de
  const appT=new Map(); A.filter(x=>trainer(x)&&(x[6]||0)>0).forEach(x=>appT.set(x[0],x[6]));
  const hatAppT=A.some(x=>trainer(x)&&(x[1]==='da'||x[1]==='spaet'));
  const liste=m=>[...m.entries()].map(([id,n])=>(typeof id==='string'&&trP(id)?nm(id):id)+(n>1?' ('+n+')':'')).join(', ')||'keiner';
  const gleich=(m1,m2)=>m1.size===m2.size&&[...m1].every(([k,v])=>m2.get(k)===v);
  if(hatAppT&&g.fq&&g.fq.aufstellung){ const fT=new Map(); (g.fq.spieler||[]).filter(x=>(x.tore||0)>0).forEach(x=>fT.set(x.app_id&&trP(x.app_id)?x.app_id:(x.name||'?'),x.tore));
    if(!gleich(appT,fT))out.push({k:'tore',t:`Torschützen: App ${liste(appT)} · FuPa ${liste(fT)}`}); }
  if(hatAppT&&g.fb&&g.fb.bericht){ const fr=fbSpielAm(g.d); if(fr){ const bT=new Map(); Object.entries(fr.rows).forEach(([id,r])=>{ if((r.tore||0)>0)bT.set(id,r.tore); });
    if(!fr.fehlt&&!gleich(appT,bT))out.push({k:'tore',t:`Torschützen: App ${liste(appT)} · fussball.de ${liste(bT)}`}); } }
  // Einsatz: App (Trainer) gegen FuPa-Aufstellung
  if(g.fq&&g.fq.aufstellung)(g.fq.spieler||[]).forEach(x=>{ if(!x.app_id)return; const r=A.find(y=>y[0]===x.app_id); if(!r||!trainer(r))return;
    const f=x.start?'da':(x.min||0)>0?'spaet':'bank'; if(r[1]!==f&&!(r[1]==='bank'&&f==='bank'))out.push({k:'einsatz',t:`${nm(x.app_id)}: App ${T[r[1]]||r[1]}, FuPa ${T[f]||f}`}); });
  return out;
}
function mn31ViewGames(B){
  if(mnCtx()==='1'){ if(!SVM.plan)svmPlanLoad(mnRerender('games')); mn31QLoad(mnRerender('games')); }
  if(typeof FB!=='undefined'&&!FB.loaded&&typeof fbLoad==='function')mnLoadOnce('fb31',()=>fbLoad(),mnRerender('games'));
  const G=mn31Spiele(), off=G.filter(g=>!g.bewertet).length, wid=G.filter(g=>g.hw.length).length, ok=canTraining();
  B.innerHTML=`<div class="card mn31g"><div class="vrat-h"><h3 class="trh" style="margin:0">${SVI('ball')} Vergangene Spiele <small>${G.length}${off?` · ${off} noch nicht bewertet`:''}${wid?` · <b class="bad">${wid} mit Widerspruch</b>`:''}</small></h3></div>
      ${G.length?`<div class="gm50-l">${G.map(g=>`<button type="button" class="gm50-r mn31-gr${g.hw.length?' bad':''}" data-g31="${svEsc(g.d)}"><span class="gm50-d">${TRC.fmt(g.d)}</span>
          <span class="gm50-t"><b>${g.heim===false?'@':'vs'} ${svEsc(g.gegner)}</b><small>${svEsc(g.art)}${g.hw.length?' · '+svEsc(g.hw[0].t)+(g.hw.length>1?` (+${g.hw.length-1})`:''):''}</small></span>
          <span class="gm50-s">${g.tw!=null?`<i class="res ${g.tw>g.tg?'w':g.tw===g.tg?'d':'l'}">${g.tw}:${g.tg}</i>`:''}${g.q.map(q=>`<i class="src50 ${q==='App'?'m':'i'}">${q}</i>`).join('')}${g.app&&g.app.ds&&SV50_DS[g.app.ds]?`<i class="src50 ${SV50_DS[g.app.ds][1]}" title="${g.app.ds==='vorlaeufig'?'FuPa kann noch nachtragen, die App gleicht das automatisch ab':'Datenstatus'}">${SV50_DS[g.app.ds][0]}</i>`:''}${g.bewertet?`<i class="mn31-ok">${g.app&&g.app.no!=null?svmEiChip(g.app.no):''} bewertet</i>`:ok?'<small class="mn31-off">bewerten</small>':''}</span></button>`).join('')}</div>`
        :`<p class="note">${(mnCtx()==='1'&&(SVM.planBusy||SVM.q31Busy))||(typeof FB!=='undefined'&&FB.loading)?'Lade Spiele …':'Noch keine Spiele in dieser Saison. Sie erscheinen automatisch, sobald FuPa oder fussball.de sie melden.'}</p>`}
      <details class="mn31-src"><summary>Woher kommen die Spiele, welche Quelle gilt?</summary>${mn31QuellenHtml()}</details>
      ${ok?`<p class="mn31-add"><a href="#" data-g31new>+ Spiel manuell hinzufügen</a> <span class="note small">nur für Spiele, die weder FuPa noch fussball.de kennen</span></p>`:''}</div>`;
  mnGSeg(B,'games');
  B.querySelectorAll('[data-g31]').forEach(b=>b.onclick=()=>{ const g=G.find(x=>x.d===b.dataset.g31); if(!g)return;
    if(!ok)return mn31SpielInfoModal(g);
    svmSpielBewerten(g.app?{id:g.app.id}:{datum:g.d,gegner:g.gegner,heim:g.heim,tw:g.tw,tg:g.tg}); });
  const n=B.querySelector('[data-g31new]'); if(n)n.onclick=e=>{ e.preventDefault(); svmSpielBewerten({datum:trToday(),neu31:1}); };
}
MN_VIEWS.games=mn31ViewGames;
if(SV50_INFO['training:games'])Object.assign(SV50_INFO['training:games'],{w:'Alle Spiele der Saison, jedes als eigener Eintrag: Liga, Pokal und Freundschaftsspiele. Sie kommen automatisch aus FuPa und fussball.de.',
  f:'Spiel antippen: Ergebnis, Quellen, Torschützen und Karten sehen und direkt im Spiel bewerten.',
  h:'FuPa und fussball.de werden regelmäßig neu abgefragt, spätere Nachträge (zum Beispiel Vorlagen) kommen von selbst dazu. Einträge des Trainerteams werden nie überschrieben: widersprechen sich Quellen, steht ein Hinweis am Spiel.',
  s:'Ein Spiel antippen zum Bewerten. „+ Spiel manuell hinzufügen“ nur für Ausnahmen.',b:['Rot markierte Spiele haben einen Widerspruch zwischen App, FuPa und fussball.de.']});
function mn31QuellenHtml(){
  return `<div class="mn31-qt"><p class="note small"><b>Automatisch:</b> ${mnCtx()==='1'?'FuPa (Spielplan, Ergebnis, Aufstellung, Tore, Vorlagen, Minuten, Karten) und fussball.de (amtlicher Spielbericht mit Startelf, Wechseln, Toren, auch Pokal und Freundschaftsspiele)':'fussball.de (Spielplan und amtlicher Spielbericht mit Startelf, Wechseln und Toren, auch Pokal und Freundschaftsspiele). FuPa liefert für die 2. Mannschaft keine Spieldaten'}. Beide werden mehrmals pro Woche neu abgefragt.</p>
    <table class="trtab mn31-qtab"><thead><tr><th>Angabe</th><th>Es gilt</th><th>Warum</th></tr></thead><tbody>
      <tr><td>Alles, was das Trainerteam einträgt</td><td><b>App</b></td><td>Wer beim Spiel war, weiß es am besten. Wird nie automatisch überschrieben.</td></tr>
      <tr><td>Ergebnis, Aufstellung, Tore, Vorlagen, Minuten</td><td><b>FuPa</b>, sonst fussball.de</td><td>FuPa hat Minuten und Vorlagen und wird oft nachgetragen. fussball.de ist der amtliche Bericht und dient als Gegenprobe.</td></tr>
      <tr><td>Freundschafts- und Pokalspiele</td><td><b>fussball.de</b></td><td>Stehen dort, sobald der Verein sie meldet.</td></tr>
      <tr><td>Wer nirgends steht</td><td><b>Annahme</b> „zugeschaut“</td><td>Bis jemand etwas anderes einträgt.</td></tr></tbody></table>
    <p class="note small"><b>Widerspruch:</b> Sagen App und FuPa oder fussball.de etwas anderes (Beispiel: in der App trifft Müller zum 1:0, FuPa meldet später Meier), bleibt der App-Eintrag stehen und das Spiel bekommt einen roten Hinweis. Im Spiel steht, was wo steht, korrigiert wird dort mit einem Tipp.</p></div>`;
}
// Kopf im geöffneten Spiel: Quellen, Torschützen und Karten, Widersprüche
function mn31SpielInfo(E,d){
  if(!E)return; const draw=()=>{ const g=mn31Spiele().find(x=>x.d===d); if(!g){ E.innerHTML=''; return; }
    const fq=g.fq, ev=((fq&&fq.ereignisse)||[]), tore=ev.filter(x=>x.t==='goal'&&x.wir), karten=ev.filter(x=>x.t==='card'&&x.wir);
    const kt=st=>({gelb:'Gelb',gelbrot:'Gelb-Rot',rot:'Rot'})[(typeof GC_KARTE!=='undefined'&&GC_KARTE[st])||(/red/.test(st||'')?(/yellow/.test(st||'')?'gelbrot':'rot'):'gelb')];
    E.innerHTML=`<div class="sb31-info"><div class="sb31-src">${g.q.map(q=>`<i class="src50 ${q==='App'?'m':'i'}">${q}</i>`).join('')}<span>${svEsc(g.art)}${g.tw!=null?` · <b>${g.tw}:${g.tg}</b> <small>laut ${svEsc(g.resQ)}</small>`:''}${fq&&fq.url?` · <a href="${svEsc(fq.url)}" target="_blank" rel="noopener">FuPa-Spiel</a>`:''}</span></div>
      ${tore.length||karten.length?`<div class="sb31-ev">${tore.map(x=>`<span>⚽ ${x.m!=null?x.m+'.':''} ${svEsc(x.name||'unbekannt')}${x.name2?` <small>(Vorlage ${svEsc(x.name2)})</small>`:''}</span>`).join('')}${karten.map(x=>`<span><i class="gc-k ${kt(x.st)==='Gelb'?'y':kt(x.st)==='Rot'?'r':'yr'}"></i> ${x.m!=null?x.m+'.':''} ${svEsc(x.name||'')} <small>${kt(x.st)}</small></span>`).join('')}<small class="note">laut FuPa</small></div>`:''}
      ${g.hw.length?`<div class="sb31-hw"><b>${SVI('info')} Quellen widersprechen sich</b><ul>${g.hw.map(h=>`<li>${svEsc(h.t)}</li>`).join('')}</ul><small>Es gilt der Eintrag in der App. Stimmt er nicht, unten korrigieren und speichern.</small></div>`:''}</div>`; };
  draw(); if(mnCtx()==='1'&&!SVM.q31)mn31QLoad(draw);
}
function mn31SpielInfoModal(g){ svModal(`<div class="mhead"><div class="rm-ic" style="width:46px;height:46px">${SVI('ball')}</div><div><h2 style="margin:0">${g.heim===false?'@':'vs'} ${svEsc(g.gegner)}</h2><div class="msub">${svEsc(TRC.fmt(g.d))} · ${svEsc(g.art)}</div></div></div><div id="sb31q"></div><div class="btnrow sbact"><button class="btn ghost" type="button" onclick="closeOverlay()">Schließen</button></div>`); mn31SpielInfo(document.getElementById('sb31q'),g.d); }
// Statistik ohne Saisonwahl und ohne Album
{ const _gs31=MN_VIEWS.gstat; MN_VIEWS.gstat=function(B){ const r=_gs31.apply(this,arguments); try{ B.querySelectorAll('.a41,.tm4s,[data-fu50],[data-fb18],[data-rt18]').forEach(x=>x.remove()); }catch(e){} return r; }; }
{ const _gn31=MN_VIEWS.gnext; MN_VIEWS.gnext=function(B){ const r=_gn31.apply(this,arguments); try{ B.querySelectorAll('.a41,.tm4s').forEach(x=>x.remove()); }catch(e){} return r; }; }

/* =====================================================================
   Massenpflege → Eye-Test: was welcher Wert bedeutet, dazu höchster, niedrigster und Durchschnitt der Mannschaft
   ===================================================================== */
// Skala wie im Modell: Wert × 10 entspricht der Spielstärke (10 Gruppenliga, 8,5 Kreisoberliga, 7 Kreisliga A, 5,5 Kreisliga B, 4 Kreisliga C)
const MN31_STUFEN=[[3,'unter Kreisliga C'],[4,'Kreisliga C'],[5.5,'Kreisliga B'],[7,'Kreisliga A'],[8.5,'Kreisoberliga'],[10,'Gruppenliga und höher']];
const MN31_EYE_TXT={
  tem:['Tempo',['verliert fast jedes Laufduell','kommt in Laufduellen selten vorbei','hält mit, zieht aber selten davon','gewinnt viele Laufduelle, auch mit Ball','einer der Schnellsten auf dem Platz','Tempo ist seine Waffe, auch höherklassig']],
  sch:['Schuss',['Abschlüsse sind selten gefährlich','trifft nur freistehend aus kurzer Distanz','trifft freistehend sicher, aus der Distanz selten','sicherer Abschluss mit dem starken Fuß, auch aus 16 bis 20 Metern','beidfüßig gefährlich, Torjäger dieser Klasse','Abschluss auf höherem Niveau, trifft aus allen Lagen']],
  pas:['Pass',['einfache Pässe kommen oft nicht an','sicher nur ohne Gegnerdruck','sichere Kurzpässe, lange Bälle selten genau','sauber unter Druck, öffnet mit Pässen das Spiel','lenkt das Spiel, Steilpässe und Seitenwechsel sitzen','Passspiel auf höherem Niveau']],
  dri:['Dribbling',['verliert den Ball im Eins gegen Eins fast immer','behauptet den Ball nur ohne Druck','hält den Ball, selten am Gegner vorbei','gewinnt viele Eins gegen Eins, enge Ballführung','geht an zwei Gegnern vorbei, auch auf engem Raum','Dribbling auf höherem Niveau']],
  def:['Defensive',['Zweikämpfe und Stellungsspiel oft falsch','viele verlorene Zweikämpfe, Probleme bei Tempo','solide ohne Druck, Fehler gegen schnelle Gegner','zweikampfstark, gutes Timing und Stellungsspiel','liest das Spiel, gewinnt fast alle Duelle','Abwehrarbeit auf höherem Niveau']],
  phy:['Physis',['körperlich klar unterlegen, baut früh ab','hält selten 90 Minuten durch','hält 90 Minuten, im Körperduell Mittelmaß','robust und laufstark, gewinnt die meisten Körperduelle','einer der Stärksten und Ausdauerndsten der Liga','Athletik auf höherem Niveau']]};
const MN31_EYE_TW_TXT={
  tem:['Hechten',['kommt an flache Bälle ins Eck selten','hält nur, was auf ihn kommt','hält die haltbaren Bälle','kommt auch an platzierte Schüsse','holt Bälle, die als unhaltbar gelten','Sprungkraft auf höherem Niveau']],
  def:['Ballsicherheit',['lässt viele Bälle abprallen','unsicher bei Flanken und Nässe','fängt die meisten Bälle sicher','kaum Abpraller, sicher bei Flanken','sehr sicher, beherrscht den Strafraum','Ballsicherheit auf höherem Niveau']],
  sch:['Abschlag',['Abschläge landen oft beim Gegner','kurz sicher, lang ungenau','solide kurz und lang','findet mit Abschlägen gezielt Mitspieler','leitet mit Abschlag und Abwurf Angriffe ein','Spieleröffnung auf höherem Niveau']],
  pas:['Stellungsspiel',['steht oft falsch','Probleme bei Flanken und langen Bällen','steht meistens richtig','gutes Timing beim Herauslaufen','organisiert die Abwehr, steht fast immer richtig','Stellungsspiel auf höherem Niveau']],
  dri:['Reflexe',['reagiert spät','hält nur mit Zeit zum Reagieren','hält normale Schüsse aus der Nähe','starke Reflexe auf kurze Distanz','pariert auch abgefälschte Bälle','Reflexe auf höherem Niveau']]};
function mn31Kurz(n){ const w=String(n||'').split(' '); return w.length>1?w[0][0]+'. '+w.slice(1).join(' '):n; }
function mn31EyeBox(B){
  const box=B.querySelector('.mp18'); if(!box||box.querySelector('.mn31-eye'))return;
  const hint=[...box.querySelectorAll(':scope > p.note.small')].find(x=>/Deine eigene Bewertung/.test(x.textContent));
  if(hint)hint.innerHTML='Deine eigene Bewertung dieser Saison, 1 bis 10 in halben Schritten. Die Zahl mal zehn entspricht der Spielstärke im Modell: <b>4</b> Kreisliga C, <b>5,5</b> Kreisliga B, <b>7</b> Kreisliga A, <b>8,5</b> Kreisoberliga, <b>10</b> Gruppenliga. Die Karte zeigt den Schnitt aller Bewerter.';
  const L=mnIntern(), feld=[], tw=[];
  L.forEach(p=>{ let E=null; try{ E=sv4Eye(p.id); }catch(e){} if(!E)return; (p.pos==='TW'?tw:feld).push({p,E}); });
  const stat=(arr,k)=>{ const v=arr.map(x=>({p:x.p,v:x.E.avg[k]})).filter(x=>x.v!=null); if(!v.length)return null; v.sort((a,b)=>b.v-a.v);
    return {hi:v[0],lo:v[v.length-1],avg:v.reduce((s,x)=>s+x.v,0)/v.length,n:v.length}; };
  const f1=x=>(Math.round(x*10)/10).toLocaleString('de-DE');
  const stufe=v=>{ let t=MN31_STUFEN[0][1]; MN31_STUFEN.forEach(([g,l])=>{ if(v>=g-.25)t=l; }); return t; };
  const card=(k,txt,arr)=>{ const s=stat(arr,k), [t,L6]=txt;
    return `<details class="mn31-ek"><summary><span class="mn31-ekh"><b>${svEsc(t)}</b>${s?`<em>Ø ${f1(s.avg)}</em>`:'<em>–</em>'}</span>
        ${s?`<span class="mn31-ekr"><span title="höchster Wert">▲ ${f1(s.hi.v)} ${svEsc(mn31Kurz(s.hi.p.name))}</span><span title="niedrigster Wert">▼ ${f1(s.lo.v)} ${svEsc(mn31Kurz(s.lo.p.name))}</span></span><small>${s.n} bewertet · Schnitt ≈ ${svEsc(stufe(s.avg))}</small>`:'<small>noch keine Bewertung</small>'}</summary>
      <ul class="mn31-ekl">${L6.map((d,i)=>`<li><b>${f1(MN31_STUFEN[i][0])}</b><span>${svEsc(MN31_STUFEN[i][1])}</span><em>${svEsc(d)}</em></li>`).join('')}</ul></details>`; };
  const html=`<div class="mn31-eye"><div class="mn31-eyeh"><b>${SVI('chart')} ${svEsc(mnCtxT())} im Eye-Test</b><small>Kategorie antippen: was welcher Wert bedeutet</small></div>
      <div class="mn31-eg">${SV4_EYE.map(([k])=>card(k,MN31_EYE_TXT[k],feld)).join('')}</div>
      ${tw.length?`<div class="mn31-eyeh tw"><b>Torhüter</b><small>eigene Kategorien</small></div><div class="mn31-eg">${Object.keys(MN31_EYE_TW_TXT).map(k=>card(k,MN31_EYE_TW_TXT[k],tw)).join('')}</div>`:''}</div>`;
  const areas=box.querySelector('.mp-f')||box.querySelector('.mp-areas'); if(areas)areas.insertAdjacentHTML('afterend',html); else box.insertAdjacentHTML('afterbegin',html);
}

/* =====================================================================
   Mannschaftsteil aus FuPa (externe Spieler) und Rückennummer
   ===================================================================== */
const KF31={d:null,busy:false,t:0};
function mn31KfLoad(after){
  if(KF31.d||KF31.busy)return; if(!((typeof canScout==='function'&&canScout())||canTraining()))return; KF31.busy=true;
  Promise.resolve(SVB.sb.rpc('kader_fupa_info')).then(r=>{ KF31.busy=false; if(r&&!r.error){ KF31.d=r.data||{}; KF31.t=Date.now(); try{ after&&after(); }catch(e){} } },()=>{ KF31.busy=false; });
}
function mn31Fu(p){ const a=KF31.d&&p?KF31.d[p.id]:null; return Array.isArray(a)?{mt:a[0],nr:a[1],verein:a[2],squad:a[3]}:null; }
function mn31Nr(p){ const f=mn31Fu(p); return f&&f.nr!=null?f.nr:null; }
function mn31NrTxt(p){ const n=mn31Nr(p); return n!=null?'#'+n:''; }

// Externe Spieler: Gruppierung aus der FuPa-Kaderseite, bis jemand eine genauere Position einträgt. Interne: wie bisher aus der Hauptposition.
function mn31MtFupa(p){ if(!p||mnIsIntern(p))return null; let C={}; try{ C=(typeof crmOf==='function'?crmOf(p):CRM[p.id])||{}; }catch(e){} if(C.ps)return null; const f=mn31Fu(p); return f&&SVM_MT[f.mt]?f.mt:null; }
{ const _mt31=svmMt; svmMt=function(p,pos){ if(!pos){ const k=mn31MtFupa(p); if(k)return k; } return _mt31.apply(this,arguments); }; }

/* ---------- Profil: Rückennummer groß, Mannschaftsteil, Teilen ---------- */
{ const _pb31=pf4Build; pf4Build=function(id){ const r=_pb31.apply(this,arguments); try{ mn31Profil(id); }catch(e){ console.warn('Profil 0.29',e); } return r; }; }
function mn31Profil(id){
  const M=document.getElementById('modal'), root=M&&M.querySelector('.pf4'), p=trP(id); if(!root||!p)return;
  if(!KF31.d&&!KF31.busy){ mn31KfLoad(()=>{ const R=document.querySelector('#modal .pf4'); if(R&&document.getElementById('modal').dataset.pf4===id){ R.querySelectorAll('.pf31-nr,.pf31-mt').forEach(x=>x.remove()); mn31Profil(id); } }); }
  const h2=root.querySelector('.pf4-hm h2'), nr=mn31Nr(p);
  if(h2&&nr!=null&&!root.querySelector('.pf31-nr'))h2.insertAdjacentHTML('afterbegin',`<span class="pf31-nr" title="Rückennummer${mn31Fu(p)&&mn31Fu(p).verein?' bei '+svEsc(mn31Fu(p).verein):''} laut FuPa">${nr}</span>`);
  const l2=root.querySelector('.pf4-l2'), mt=typeof svmMt==='function'?svmMt(p):null, ausFupa=!!mn31MtFupa(p);
  if(l2&&mt&&SVM_MT[mt]&&!root.querySelector('.pf31-mt'))l2.insertAdjacentHTML('afterbegin',`<span class="pf31-mt" title="Mannschaftsteil">${svEsc(SVM_MT[mt])}${ausFupa?' <i>laut FuPa</i>':''}</span>`);
  const act=root.querySelector('.pf4-act');
  if(act&&!act.querySelector('[data-pf31s]')){ act.insertAdjacentHTML('beforeend',`<button class="btn sm ghost" type="button" data-pf31s>${SVI('share')} Teilen</button>`);
    act.querySelector('[data-pf31s]').onclick=e=>mn31Teilen(p,e.currentTarget); }
}
function mn31Link(p){ return svBasis()+'#spieler='+encodeURIComponent(p.id); }
async function mn31Teilen(p,btn){
  const url=mn31Link(p), text=`${p.name} in der SV/BSC Sportzentrale`;
  if(navigator.share&&matchMedia('(pointer:coarse)').matches){ try{ await navigator.share({title:p.name,text,url}); return; }catch(e){ if(e&&e.name==='AbortError')return; } }
  const act=btn&&btn.parentNode; if(!act)return; let box=act.parentNode.querySelector('.pf31-share'); if(box){ box.remove(); return; }
  act.insertAdjacentHTML('afterend',`<div class="pf31-share"><a class="btn sm" href="https://wa.me/?text=${encodeURIComponent(text+'\n'+url)}" target="_blank" rel="noopener">WhatsApp</a>
    <button class="btn sm ghost" type="button" data-pf31c>Link kopieren</button><small>Öffnet das Profil nach der Anmeldung. Jeder sieht nur, was er in der App sehen darf.</small></div>`);
  box=act.parentNode.querySelector('.pf31-share');
  box.querySelector('[data-pf31c]').onclick=async()=>{ try{ await navigator.clipboard.writeText(url); kToast('✓ Link kopiert'); }catch(e){ try{ kCopy(url); }catch(x){ prompt('Link',url); } } };
}
// Geteilter Link …/#spieler=<id>: nach der Anmeldung das Profil öffnen
const MN31_ZIEL={id:null};
{ const m=/^#spieler=([A-Za-z0-9_:.%-]{1,160})$/.exec(location.hash||''); if(m){ try{ MN31_ZIEL.id=decodeURIComponent(m[1]); history.replaceState(history.state,'',location.pathname+location.search); }catch(e){} } }
async function mn31ZielOeffnen(){
  const id=MN31_ZIEL.id; if(!id)return; const t0=Date.now();
  while(!(typeof svzBereit==='function'&&svzBereit())&&Date.now()-t0<600000)await new Promise(r=>setTimeout(r,400));
  if(!MN31_ZIEL.id)return; MN31_ZIEL.id=null; await new Promise(r=>setTimeout(r,600));
  if(players.some(p=>p.id===id)){ try{ closeOverlay(); }catch(e){} openModal(id); }
  else kToast('Dieses Spielerprofil ist für dich nicht sichtbar oder gibt es nicht mehr.');
}
setTimeout(mn31ZielOeffnen,60);
window.addEventListener('hashchange',()=>{ const m=/^#spieler=([A-Za-z0-9_:.%-]{1,160})$/.exec(location.hash||''); if(!m)return; try{ MN31_ZIEL.id=decodeURIComponent(m[1]); history.replaceState(history.state,'',location.pathname+location.search); }catch(e){} mn31ZielOeffnen(); });

/* =====================================================================
   Suche nach Rückennummer: „Fürth 15“ zeigt alle Fürther Mannschaften und alle Spieler mit der 15 (FuPa-Kader, nur Erwachsene)
   ===================================================================== */
const SU31={q:'',t:null,r:null};
function su31Wire(){
  const inp=document.getElementById('gSearch'), res=document.getElementById('gRes'); if(!inp||!res||inp.dataset.su31)return; inp.dataset.su31='1';
  inp.addEventListener('input',()=>{ clearTimeout(SU31.t); const q=inp.value.trim(); SU31.q=q; if(!/(^|\s)#?\d{1,2}(\s|$)/.test(q)||!(typeof canScout==='function'&&canScout()))return;
    su31Zeige(res,q,SU31.r&&SU31.r.q===q?SU31.r.d:null);
    SU31.t=setTimeout(async()=>{ try{ const {data,error}=await SVB.sb.rpc('rueckennummer_suche',{p_q:q}); if(error)throw error; SU31.r={q,d:data}; if(SU31.q===q)su31Zeige(res,q,data); }catch(e){ console.warn('Rückennummer',e); } },280); });
}
function su31Zeige(res,q,d){
  res.querySelectorAll('.su31').forEach(x=>x.remove()); const box=document.createElement('div'); box.className='su31';
  if(!d){ box.innerHTML='<div class="gh">Rückennummer <small>suche …</small></div>'; res.prepend(box); res.classList.add('open'); return; }
  const T=d.teams||[], S=d.spieler||[], vn=x=>x.verein+(x.squad>1?' '+'I'.repeat(Math.min(3,x.squad)):'');
  if(!T.length&&!S.length){ box.innerHTML=`<div class="gh">Rückennummer${d.nr!=null?' '+d.nr:''}</div><div class="ge">Keine Mannschaft oder kein Spieler mit dieser Nummer in den FuPa-Kadern.</div>`; }
  else box.innerHTML=`${S.length?`<div class="gh">Rückennummer ${d.nr} <small>${S.length} Spieler · FuPa ${svEsc(typeof klaSaisonKurz==='function'?klaSaisonKurz(d.saison):d.saison||'')}</small></div>${S.map((x,i)=>`<div class="gi su31-s" data-su31s="${i}"><i class="su31-nr">${x.nr}</i><div style="min-width:0"><b>${svEsc(x.name)}${x.app_id&&trP(x.app_id)?'':' <i class="su-own">nur FuPa</i>'}</b><span>${svEsc(vn(x))} · ${svEsc(x.pos||'')}</span></div></div>`).join('')}`:''}
    ${T.length?`<div class="gh">Mannschaften <small>${T.length}</small></div>${T.slice(0,12).map((x,i)=>`<div class="gi su31-t" data-su31t="${i}"><i class="su31-nr t">${x.squad||1}</i><div style="min-width:0"><b>${svEsc(vn(x))}</b><span>${x.n} Spieler im FuPa-Kader${d.nr!=null?' · '+(S.filter(s=>s.tsid===x.tsid).map(s=>svEsc(s.name)).join(', ')||'keine '+d.nr):''}</span></div></div>`).join('')}`:''}`;
  res.prepend(box); res.classList.add('open'); if(T.length||S.length)res.querySelectorAll(':scope > .ge').forEach(x=>x.remove());
  box.querySelectorAll('[data-su31s]').forEach(g=>g.onmousedown=e=>{ e.preventDefault(); const x=S[+g.dataset.su31s]; if(!x)return;
    if(x.app_id&&trP(x.app_id)){ const inp=document.getElementById('gSearch'); if(inp){ inp.value=''; inp.blur(); } openModal(x.app_id); }
    else if(x.fupa)window.open('https://www.fupa.net/player/'+encodeURIComponent(x.fupa),'_blank','noopener'); });
  box.querySelectorAll('[data-su31t]').forEach(g=>g.onmousedown=e=>{ e.preventDefault(); const x=T[+g.dataset.su31t]; if(x&&x.url)window.open(x.url,'_blank','noopener'); });
}
{ const _sw31=svSearchWire; svSearchWire=function(){ const r=_sw31.apply(this,arguments); try{ su31Wire(); }catch(e){} return r; }; }
setTimeout(()=>{ try{ su31Wire(); }catch(e){} },1500);

/* =====================================================================
   Eigene Jugend: A-Jugend aus fussball.de übernehmen, „(u)“ = unbestätigt, Bestätigen per persönlichem Link
   ===================================================================== */
Object.assign(SV_PAGES,{ejugend:['Jugend-Einschätzung','A- und B-Jugend auf dem Weg zu den Aktiven: Statistik, Entwicklung, Einschätzungen der Trainer']});
function mn31U(v){ return v&&v.bestaetigt===false; }
{ const _sk31=svtSpieler; svtSpieler=function(n){ const s=_sk31.apply(this,arguments); return s&&mn31U(n)?s+' (u)':s; }; }
{ const _kd31=svtKader; svtKader=function(B){ const r=_kd31.apply(this,arguments);
  try{ const a=/^a/.test(SVT.team||''), ch=B.querySelector('.svt-ch .btnrow'), offen=SVT.K.filter(k=>mn31U(k.vereinsspieler)&&k.status!=='abgang');
    if(a&&ch&&!ch.querySelector('#svt31i'))ch.insertAdjacentHTML('afterbegin',`<button class="btn sm" id="svt31i" type="button">${SVI('download')} Von fussball.de übernehmen</button>`);
    const bi=B.querySelector('#svt31i'); if(bi)bi.onclick=mn31JugendImport;
    B.querySelectorAll('tr[data-svtp]').forEach(tr=>{ const k=SVT.K.find(x=>x.spieler===tr.dataset.svtp); if(k&&mn31U(k.vereinsspieler)){ tr.classList.add('svt31-u'); const b=tr.querySelector('td b'); if(b)b.title='Unbestätigt: aus fussball.de übernommen, der Spieler hat sich noch nicht bestätigt'; } });
    if(offen.length){ const card=B.querySelector('.card'); card.insertAdjacentHTML('afterbegin',`<div class="svt31-hint">${SVI('info')}<span><b>${offen.length} unbestätigt (u)</b>: aus fussball.de übernommen. Jeder Spieler bestätigt sich selbst über seinen persönlichen Link oder lässt sich löschen.</span><button type="button" class="btn sm ghost" id="svt31l">Links verschicken</button></div>`);
      card.querySelector('#svt31l').onclick=()=>mn31LinksModal(offen); }
    // A-Jugend-Spieler, die im Datenbestand der Aktiven die Stammmannschaft „A-Jugend“ haben
    if(a){ const L=players.filter(p=>!p.isJugend&&mnTeam(p)==='A'); if(L.length&&!B.querySelector('.svt31-akt')){ B.insertAdjacentHTML('beforeend',`<div class="card svt31-akt"><h3 class="trh">${SVI('users')} Bei den Aktiven geführt <small>${L.length}</small></h3>
        <p class="note small">Diese A-Jugend-Spieler stehen im Spielerbestand der Aktiven (Stammmannschaft A-Jugend), zum Beispiel weil sie schon mittrainieren.</p>
        <div class="mn31-l">${L.map(p=>`<div class="mn31-r" data-svt31p="${svEsc(p.id)}"><div class="mn31-n"><b>${svEsc(p.name)}</b><small>${svEsc([p.pos,mn31NrTxt(p)].filter(Boolean).join(' · '))}</small></div></div>`).join('')}</div></div>`);
        B.querySelectorAll('[data-svt31p]').forEach(x=>x.onclick=()=>openModal(x.dataset.svt31p)); } }
  }catch(e){ console.warn('Jugend 0.29',e); }
  return r; }; }
function mn31JugendImport(){
  let url=''; try{ url=localStorage.getItem('svt31-fde-'+SVT.team)||''; }catch(e){}
  const M=svModal(`<div class="mhead"><div class="rm-ic" style="width:46px;height:46px">${SVI('download')}</div><div><h2 style="margin:0">Kader von fussball.de übernehmen</h2><div class="msub">${svEsc(svtM(SVT.team).name)} · Saison ${svEsc(svtSL(SVT.saison))}</div></div></div>
    <p class="note">Die App liest die öffentliche Kaderliste der Mannschaft bei fussball.de. Übernommen werden nur Vor- und Nachname, keine Fotos, keine Kontaktdaten. Wer noch kein Profil hat, bekommt eins mit <b>(u)</b> für unbestätigt.</p>
    <div class="field"><label>Link der Mannschaft bei fussball.de</label><input id="svt31u" type="url" inputmode="url" placeholder="https://www.fussball.de/mannschaft/…/team-id/…" value="${svEsc(url)}"></div>
    <p class="note small">Unsere A-Junioren spielen nicht unter dem Vereinsnamen? Dann den Link der Spielgemeinschaft nehmen (auf fussball.de die Mannschaft öffnen und die Adresse kopieren).</p>
    <div id="svt31r"></div>
    <div class="btnrow sbact"><button class="btn" type="button" id="svt31go">${SVI('download')} Übernehmen</button><button class="btn ghost" type="button" id="svt31x">Schließen</button></div>`);
  M.querySelector('#svt31x').onclick=()=>closeOverlay();
  M.querySelector('#svt31go').onclick=async e=>{ const b=e.currentTarget, u=M.querySelector('#svt31u').value.trim(), R=M.querySelector('#svt31r');
    if(!/^https:\/\/www\.fussball\.de\/mannschaft\/.+\/team-id\/[0-9A-Z]{20,40}/.test(u)){ R.innerHTML='<p class="bad">Bitte den Link einer Mannschaft bei fussball.de einfügen (er enthält „/team-id/“).</p>'; return; }
    try{ localStorage.setItem('svt31-fde-'+SVT.team,u); }catch(x){}
    b.disabled=true; b.textContent='Liest fussball.de …'; R.innerHTML='<p class="note">Das dauert bis zu einer Minute: für jeden Spieler wird das öffentliche Profil gelesen.</p>';
    try{ const {data,error}=await SVB.sb.functions.invoke('kader-import',{body:{m:SVT.team,saison:SVT.saison,url:u}}); if(error)throw error; if(data&&data.error)throw new Error(data.error);
      R.innerHTML=`<p><b>✓ ${data.gefunden} Spieler auf fussball.de</b>: ${data.neu} neu angelegt (u), ${data.vorhanden} schon vorhanden${data.ohne_name?`, ${data.ohne_name} ohne öffentlichen Namen (nicht übernommen)`:''}.</p>`;
      b.disabled=false; b.innerHTML=SVI('download')+' Nochmal übernehmen'; await svtReload(); }
    catch(x){ b.disabled=false; b.innerHTML=SVI('download')+' Übernehmen'; R.innerHTML=`<p class="bad">⚠️ ${svEsc(x.message||String(x))}</p>`; } };
}
function mn31BestLink(tok){ return svBasis()+'team.html#b='+tok; }
async function mn31LinkFuer(sid){ const tok=await svtRpc('team_bestaetigung_link',{p_spieler:sid}); return mn31BestLink(tok); }
function mn31WaText(v,url){ return `Hallo ${v.vorname}, wir haben dich in der App der SV/BSC Mörlenbach für die ${svtM(SVT.team).name} angelegt (nur Name, keine Kontaktdaten). Bitte kurz bestätigen, dass du das bist, oder löschen lassen:\n${url}`; }
function mn31LinksModal(L){
  svModal(`<div class="mhead"><div class="rm-ic" style="width:46px;height:46px">${SVI('send')}</div><div><h2 style="margin:0">Bestätigen lassen</h2><div class="msub">Jeder Spieler bekommt seinen eigenen Link: „Ja, das bin ich“ oder „Bitte löschen“</div></div></div>
    <div class="mn31-l">${L.map(k=>`<div class="mn31-r" data-svt31b="${svEsc(k.spieler)}"><div class="mn31-n"><b>${svEsc(svtSpieler(k.vereinsspieler))}</b><small>noch nicht bestätigt</small></div><button class="btn sm" type="button" data-wa>WhatsApp</button><button class="btn sm ghost" type="button" data-cp>Link kopieren</button></div>`).join('')}</div>
    <p class="note small">WhatsApp öffnet sich mit fertigem Text, die Nummer wählst du dort aus. Die App speichert keine Nummern.</p>
    <div class="btnrow sbact"><button class="btn ghost" type="button" onclick="closeOverlay()">Schließen</button></div>`);
  document.querySelectorAll('#modal [data-svt31b]').forEach(r=>{ const k=L.find(x=>x.spieler===r.dataset.svt31b);
    r.querySelector('[data-wa]').onclick=async()=>{ const w=window.open('about:blank','_blank'); try{ const u=await mn31LinkFuer(k.spieler), t='https://wa.me/?text='+encodeURIComponent(mn31WaText(k.vereinsspieler,u)); if(w)w.location.href=t; else location.href=t; }catch(e){ if(w)w.close(); svtErr(e); } };
    r.querySelector('[data-cp]').onclick=async()=>{ try{ const u=await mn31LinkFuer(k.spieler); try{ await navigator.clipboard.writeText(u); }catch(x){ prompt('Link',u); } kToast('✓ Link kopiert'); }catch(e){ svtErr(e); } }; });
}
{ const _sm31=svtSpielerModal; svtSpielerModal=function(sid){ const r=_sm31.apply(this,arguments);
  try{ const k=SVT.K.find(x=>x.spieler===sid), M=document.getElementById('modal'); if(k&&mn31U(k.vereinsspieler)&&M&&!M.querySelector('.svt31-mb')){ const row=M.querySelector('.btnrow');
      if(row){ row.insertAdjacentHTML('beforebegin',`<div class="svt31-hint svt31-mb">${SVI('info')}<span><b>Unbestätigt (u)</b>: aus fussball.de übernommen. Der Spieler bestätigt sich selbst oder lässt sich löschen.</span><button type="button" class="btn sm" data-svt31w>Link per WhatsApp</button></div>`);
        M.querySelector('[data-svt31w]').onclick=()=>mn31LinksModal([k]); } } }catch(e){}
  return r; }; }

(function(){ try{ const s=document.createElement('style'); s.id='svm31css'; s.textContent="/* ===== Beta 0.29 · Mannschaften, Spiele, Eye-Test, Rückennummer, Teilen ===== */\n/* Umschalter 1./2. Mannschaft vorne in der Reiterleiste */\n.hub-in .mn31-sw{flex:none;display:flex;align-items:center;gap:2px;margin:6px 10px 6px 0;padding:3px;border-radius:12px;background:rgba(148,163,196,.1);border:1px solid var(--line2);align-self:center;}\n.hub-in .mn31-sw button{padding:6px 11px;border:0;border-radius:9px;font-size:12.5px;font-weight:800;color:var(--ink3);border-bottom:0;}\n.hub-in .mn31-sw button.act{background:var(--brand2);color:#fff;border-bottom:0;}\n.hub-in .mn31-sw .s{display:none;}\n@media (max-width:700px){ .hub-in .mn31-sw .l{display:none;} .hub-in .mn31-sw .s{display:inline;} .hub-in .mn31-sw{margin-right:6px;} }\n\n/* SOMA & Inaktive */\n.mn31 .mn31-seg{margin-bottom:10px;flex-wrap:wrap;}\n.mn31 .mn31-seg small{opacity:.7;font-weight:700;margin-left:3px;}\n.mn31-f{display:flex;gap:10px;flex-wrap:wrap;align-items:center;margin:8px 0 12px;}\n.mn31-f input{flex:1;min-width:180px;}\n.mn31-l{display:flex;flex-direction:column;gap:6px;}\n.mn31-r{display:flex;align-items:center;gap:12px;padding:9px 12px;border:1px solid var(--line2);border-radius:12px;background:rgba(148,163,196,.04);cursor:pointer;flex-wrap:wrap;}\n.mn31-r:hover{border-color:var(--line);}\n.mn31-av{flex:none;display:flex;}\n.mn31-n{flex:1;min-width:140px;display:flex;flex-direction:column;gap:2px;}\n.mn31-n small{color:var(--ink3);font-size:12px;}\n.mn31-r select{min-width:170px;}\n\n/* Spiele */\n.mn31g .gm50-t small{display:block;color:var(--ink3);font-weight:600;font-size:12px;margin-top:2px;}\n.mn31-gr.bad .gm50-t small{color:#fca5a5;}\n.mn31-ok{font-style:normal;font-size:11.5px;font-weight:700;color:#86efac;display:inline-flex;align-items:center;gap:4px;}\n.mn31-off{font-weight:700;color:var(--brand2);}\n.mn31-src{margin-top:14px;border-top:1px solid var(--line2);padding-top:10px;}\n.mn31-src summary{cursor:pointer;font-weight:700;font-size:13.5px;color:var(--ink2);}\n.mn31-qt{margin-top:10px;}\n.mn31-qtab{width:100%;font-size:13px;}\n.mn31-qtab td{vertical-align:top;}\n.mn31-add{margin:12px 0 0;font-size:13px;display:flex;gap:8px;flex-wrap:wrap;align-items:baseline;}\n.mn31-add a{color:var(--ink3);font-weight:700;text-decoration:underline;text-underline-offset:3px;}\n.sb31d{font-size:13px;color:var(--ink3);font-weight:700;margin-left:4px;}\n.sb31-info{display:flex;flex-direction:column;gap:8px;margin:4px 0 12px;}\n.sb31-src{display:flex;flex-wrap:wrap;gap:6px;align-items:center;font-size:13px;}\n.sb31-src a{color:var(--brand2);}\n.sb31-ev{display:flex;flex-wrap:wrap;gap:6px 14px;font-size:13px;padding:8px 10px;border-radius:10px;background:rgba(148,163,196,.06);border:1px solid var(--line2);align-items:center;}\n.sb31-ev small{color:var(--ink3);}\n.sb31-hw{padding:10px 12px;border-radius:12px;border:1px solid rgba(248,113,113,.45);background:rgba(248,113,113,.08);font-size:13px;}\n.sb31-hw ul{margin:6px 0;padding-left:18px;}\n.sb31-hw svg{width:14px;height:14px;vertical-align:-2px;}\n.sb31-hw small{color:var(--ink3);}\n.sb31-st{display:flex;gap:8px;flex-wrap:wrap;margin-top:6px;}\n.sb31-st label{display:flex;align-items:center;gap:4px;font-size:12px;color:var(--ink3);font-weight:700;}\n.sb31-st input{width:58px;padding:5px 6px;font-size:13px;}\n.q50-weg{font-size:12.5px;color:var(--ink3);font-weight:700;margin-top:4px;}\n\n/* Training → Statistik: Abstand zwischen Kacheln und Liste */\n#panel-training .trtiles{margin-bottom:18px;}\n#panel-training .trtiles + .card,#panel-training .trtiles + div{margin-top:4px;}\n\n/* Eye-Test */\n.mn31-eye{margin:12px 0 14px;padding:12px;border-radius:14px;border:1px solid var(--line2);background:rgba(148,163,196,.04);}\n.mn31-eyeh{display:flex;justify-content:space-between;gap:10px;flex-wrap:wrap;align-items:baseline;margin-bottom:10px;}\n.mn31-eyeh.tw{margin-top:14px;}\n.mn31-eyeh small{color:var(--ink3);font-size:12px;}\n.mn31-eyeh svg{width:15px;height:15px;vertical-align:-3px;}\n.mn31-eg{display:grid;grid-template-columns:repeat(auto-fill,minmax(210px,1fr));gap:8px;}\n.mn31-ek{border:1px solid var(--line2);border-radius:12px;background:var(--card);}\n.mn31-ek[open]{grid-column:1/-1;}\n.mn31-ek summary{cursor:pointer;list-style:none;padding:10px 12px;display:flex;flex-direction:column;gap:4px;}\n.mn31-ek summary::-webkit-details-marker{display:none;}\n.mn31-ekh{display:flex;justify-content:space-between;align-items:baseline;gap:8px;}\n.mn31-ekh em{font-style:normal;font-weight:800;font-size:15px;font-variant-numeric:tabular-nums;}\n.mn31-ekr{display:flex;flex-direction:column;gap:1px;font-size:12.5px;color:var(--ink2);font-variant-numeric:tabular-nums;}\n.mn31-ek summary small{color:var(--ink3);font-size:11.5px;}\n.mn31-ekl{list-style:none;margin:0;padding:0 12px 10px;display:flex;flex-direction:column;gap:4px;}\n.mn31-ekl li{display:grid;grid-template-columns:34px 120px 1fr;gap:8px;font-size:12.5px;align-items:baseline;border-top:1px solid var(--line2);padding-top:4px;}\n.mn31-ekl li b{font-variant-numeric:tabular-nums;}\n.mn31-ekl li span{color:var(--ink3);}\n@media (max-width:560px){ .mn31-ekl li{grid-template-columns:30px 1fr;} .mn31-ekl li em{grid-column:2;} }\n\n/* Profil: Rückennummer, Mannschaftsteil, Teilen */\n.pf31-nr{display:inline-flex;align-items:center;justify-content:center;min-width:40px;height:40px;padding:0 8px;margin-right:10px;border-radius:12px;background:linear-gradient(160deg,var(--brand2),#1e3a8a);color:#fff;font-size:22px;font-weight:900;vertical-align:middle;font-variant-numeric:tabular-nums;box-shadow:0 6px 16px -8px rgba(59,123,255,.8);}\n.pf31-mt{font-weight:700;}\n.pf31-mt i{font-style:normal;font-size:11px;color:var(--ink3);font-weight:600;}\n.pf31-share{display:flex;flex-wrap:wrap;gap:8px;align-items:center;margin-top:8px;}\n.pf31-share small{color:var(--ink3);font-size:12px;flex-basis:100%;}\n\n/* Suche nach Rückennummer */\n.gres .su31 .su31-nr{font-style:normal;flex:none;display:inline-flex;align-items:center;justify-content:center;width:34px;height:34px;border-radius:10px;background:rgba(59,123,255,.18);color:#bcd3ff;font-weight:900;font-variant-numeric:tabular-nums;}\n.gres .su31 .su31-nr.t{background:rgba(148,163,196,.15);color:var(--ink2);font-size:12px;}\n.su31 .gi{cursor:pointer;}\n\n/* Eigene Jugend: unbestätigt (u) */\ntr.svt31-u td b{color:var(--ink2);font-style:italic;}\n.svt31-hint{display:flex;gap:10px;align-items:center;flex-wrap:wrap;padding:10px 12px;margin-bottom:12px;border-radius:12px;border:1px solid rgba(250,204,21,.4);background:rgba(250,204,21,.07);font-size:13px;}\n.svt31-hint svg{width:16px;height:16px;flex:none;}\n.svt31-hint span{flex:1;min-width:200px;}\n.svt31-akt{margin-top:14px;}\n.mn31-back{margin-bottom:10px;}\n/* 0.30 · Meldungen mit „Jetzt aktualisieren“ */\n.sv32{margin:12px 0 4px;display:flex;flex-direction:column;gap:8px;align-items:stretch;}\n.sv32 .sv32-go{min-height:52px;font-size:17px;font-weight:800;justify-content:center;gap:10px;border-radius:14px;width:100%;}\n.sv32 .sv32-go svg{width:20px;height:20px;}\n.sv32 .sv32-go.busy svg{animation:sv32dreh 1s linear infinite;}\n.sv32 .sv32-go:disabled{opacity:.85;cursor:default;}\n.sv32.fertig .sv32-go{background:rgba(34,197,94,.14)!important;background-image:none!important;color:#22c55e!important;box-shadow:none!important;border:1px solid rgba(34,197,94,.4)!important;opacity:1;}\n.sv32-st{margin:0;font-size:15px;line-height:1.45;color:var(--ink2);}\n.sv32-st.lauf{color:var(--ink);}\n.sv32-st.ok{color:#22c55e;font-weight:700;}\n.sv32-st.warn{color:#f59e0b;font-weight:600;}\n@keyframes sv32dreh{to{transform:rotate(360deg);}}\n@media (prefers-reduced-motion:reduce){.sv32 .sv32-go.busy svg{animation:none;}}\n"; document.head.appendChild(s); }catch(e){} })();
/* =====================================================================
   Sportzentrale Beta 0.30 · Meldungen mit „Jetzt aktualisieren“
   - Kommt eine Checker-Meldung („Daten nicht aktuell“, „kein Abgleich“ …), steht direkt darunter ein großer Knopf.
     Antippen startet den Abgleich wirklich (Edge import-sync, nur Admin), holt bei Bedarf den FUSSBALL.DE-Datenstand (data-update),
     prüft danach sofort nach (kla_jetzt_pruefen) und lädt die Daten in der offenen App neu. Kein Neustart, kein Suchen im Adminbereich.
   - Probleme, die ein Abgleich nicht lösen kann (Speicher, Quellabruf, Übertragungsnachweis), bekommen „Jetzt nachprüfen“.
   - Ist die Meldung beim Öffnen schon erledigt, steht das gleich da.
   - Große Schrift, ein Knopf, klare Rückmeldung in Worten (auch für Leute, die nicht jeden Tag Apps bedienen).
   Nichts wird zurückgesetzt: kein Cursor, keine Epoche. Der Abgleich macht genau das, was der stündliche Lauf auch macht.
   ===================================================================== */
const SV32={laeuft:false};
const SV32_FIX={rueckstand:1,abgleich:1,helfer:1,push:1,datenbestand:1};
function sv32Admin(){ try{ return typeof isAdmin==='function'&&isAdmin(); }catch(e){ return false; } }
function sv32Html(problem){ const fix=!!SV32_FIX[problem];
  if(!sv32Admin())return `<div class="sv32" data-sv32="${svEsc(problem||'')}"><p class="sv32-st">Den Abgleich startet der Admin. Er hat dieselbe Nachricht bekommen.</p></div>`;
  return `<div class="sv32" data-sv32="${svEsc(problem||'')}">
    <button class="btn sv32-go" type="button" data-sv32go>${SVI('refresh')} <span>${fix?'Jetzt aktualisieren':'Jetzt nachprüfen'}</span></button>
    <p class="sv32-st" aria-live="polite">${fix?'Ein Tipp genügt. Die App holt die fehlenden Daten und prüft danach selbst nach.':'Ein Abgleich allein löst das nicht. Die App prüft auf Knopfdruck, ob es noch besteht.'}</p></div>`; }
function sv32Text(el,t,art){ const s=el.querySelector('.sv32-st'); if(s){ s.textContent=t; s.className='sv32-st'+(art?' '+art:''); } }
async function sv32Invoke(fn,body){ const {data,error}=await SVB.sb.functions.invoke(fn,{body});
  if(error){ let t=error.message; try{ const j=await error.context.json(); if(j&&j.error)t=j.error; }catch(_){} throw new Error(t==='Nicht angemeldet'?'Bitte neu anmelden.':t); }
  if(data&&data.ok===false)throw new Error(data.error||'nicht möglich'); return data; }
async function sv32Pruefen(){ const {data,error}=await SVB.sb.rpc('kla_jetzt_pruefen'); if(error)throw error; return data||{}; }
function sv32OffenText(p){ const o=Object.values((p&&p.offen)||{}); return o.length?o.join(' '):''; }
async function sv32Lauf(el){
  if(SV32.laeuft)return; SV32.laeuft=true;
  const b=el.querySelector('[data-sv32go]'), problem=el.dataset.sv32||'', fix=!!SV32_FIX[problem];
  const setB=(t,dis)=>{ if(!b)return; b.disabled=!!dis; b.classList.toggle('busy',!!dis); const sp=b.querySelector('span'); if(sp)sp.textContent=t; };
  try{
    let erg='';
    if(fix){
      setB('Wird aktualisiert …',true); sv32Text(el,'Die App holt gerade die neuen Daten. Das dauert meist unter einer Minute.','lauf');
      if(problem==='datenbestand'){ const d=await sv32Invoke('data-update',{}); const s=d&&d.stats||{}; erg=`Datenstand von FUSSBALL.DE geholt (${s.matched||0} Torschützen zugeordnet). `; }
      const r=await sv32Invoke('import-sync',{aktion:'abgleich',quelle:'kla'}), e=r&&r.ergebnis||{};
      if(e.status&&e.status!=='ok')throw new Error(((e.fehler||[])[0]||{}).meldung||'Der Abgleich meldet einen Fehler.');
      const n=(+e.neu||0)+(+e.geaendert||0); erg+=n?`${n} Änderung${n===1?'':'en'} übernommen. `:'Alles war schon da. ';
      if(e.komplett===false)erg+='Der Rest folgt automatisch beim nächsten Lauf. ';
    } else { setB('Wird geprüft …',true); sv32Text(el,'Die App prüft den Stand auf dem Server.','lauf'); }
    const p=await sv32Pruefen(), offen=sv32OffenText(p);
    try{ if(typeof svDatenNeuLaden==='function')await svDatenNeuLaden(); }catch(e){}
    try{ if(typeof SVQ!=='undefined'&&typeof svqLaden==='function')svqLaden(true); }catch(e){}
    if(!offen){ sv32Text(el,`✓ Erledigt. ${erg}Die App ist wieder aktuell${p.cursor!=null?' (Stand '+Number(p.cursor).toLocaleString('de-DE')+')':''}.`,'ok'); setB('Aktuell',true); el.classList.add('fertig'); if(b){ b.classList.remove('busy'); const sv=b.querySelector('svg'); if(sv)sv.outerHTML=SVI('check'); } }
    else { sv32Text(el,`${erg}Noch offen: ${offen}`,'warn'); setB(fix?'Nochmal aktualisieren':'Nochmal prüfen',false); }
  }catch(e){ sv32Text(el,'⚠ Das hat nicht geklappt: '+String(e&&e.message||e).slice(0,160)+' Bitte in ein paar Minuten nochmal tippen.','warn'); setB(fix?'Nochmal versuchen':'Nochmal prüfen',false); }
  finally{ SV32.laeuft=false; } }
// Beim Öffnen: ist das Problem schon weg? (nur lesen, ohne den Checker anzustoßen)
async function sv32Stand(el){ if(!sv32Admin())return;
  try{ const {data}=await SVB.sb.rpc('kla_qualitaet'); const c=data&&data.checker; if(!c||!c.beobachtet&&!c.probleme)return;
    const beob=c.beobachtet||c.probleme||{}; const pr=el.dataset.sv32;
    if(pr&&!(pr in beob)&&!(pr in (c.probleme||{}))){ sv32Text(el,'✓ Inzwischen erledigt, die App ist aktuell. Tippen prüft trotzdem nochmal.','ok'); } }catch(e){} }
function sv32Wire(root){ (root||document).querySelectorAll('.sv32').forEach(el=>{ if(el.dataset.w)return; el.dataset.w='1';
  const b=el.querySelector('[data-sv32go]'); if(b)b.onclick=()=>sv32Lauf(el); sv32Stand(el); }); }

// Meldungsfenster: Checker-Meldungen bekommen den Knopf direkt unter dem Text (der Datenqualitäts-Knopf bleibt daneben)
