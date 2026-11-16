{ const _zi=svzInhalt; svzInhalt=async function(m){ const x=await _zi.apply(this,arguments);
    if(m&&m.art==='system'&&(m.data||{}).quelle==='checker')x.h=(x.h||'')+sv32Html((m.data||{}).problem||'');
    return x; }; }
{ const _mz=svMeldungZeigen; svMeldungZeigen=async function(){ const r=await _mz.apply(this,arguments); try{ sv32Wire(document.querySelector('#modal .svz')); }catch(e){} return r; }; }
// Datenqualität: gleicher Knopf, wenn der Checker etwas meldet, das ein Abgleich löst
{ const _dh=svqDetailHtml; svqDetailHtml=function(){ let h=_dh.apply(this,arguments);
    try{ const c=SVQ.q&&SVQ.q.checker, P=Object.keys((c&&c.probleme)||{}), f=P.find(k=>SV32_FIX[k]); if(f&&sv32Admin())h=sv32Html(f)+h; }catch(e){}
    setTimeout(()=>{ try{ sv32Wire(document.getElementById('svqDet')); }catch(e){} },0); return h; }; }

/* =====================================================================
   Sportzentrale Beta 0.31 · Aufgaben & Checklisten
   - Jedes Heimspiel (Erste, Zweite, Jugend) und jede Veranstaltung (Kerwe, Weihnachten, Turnier, Saisonfeier, Arbeitseinsatz,
     Jahreshauptversammlung, Neujahrsempfang) hat eine Checkliste zum Abhaken wie eine Einkaufsliste.
   - Große Kreise zum Antippen, Häkchen mit Animation, erledigte Punkte rutschen nach unten. Alles erledigt: kleines Feuerwerk.
   - Neuer Punkt: oben eintippen, fertig. Er kommt beim nächsten Mal automatisch wieder (Vorlage merkt sich das).
   - Verantwortliche und Durchführende: App-Nutzer oder Helfer ohne Konto (persönlicher Link per WhatsApp).
   - Kleiner Chat je Checkliste mit Namen, Fotos und Dateien landen sortiert im Vereins-Drive.
   - Erinnerungen per Push: am Vorabend, eine Woche vor Veranstaltungen und kurz vor jeder Aufgabe (Server, orga_erinnern).
   - Große Schrift, klare Wörter, wenig Knöpfe: gedacht auch für Leute, die nicht jeden Tag Apps bedienen.
   ===================================================================== */
const OG={ue:null,L:null,filter:'alle',merken:true,t:null,laedt:false,offen:null,chatN:0,vorlage:null};
const OG_ART={heim1:['🏟️','Heimspiel Erste'],heim2:['🏟️','Heimspiel Zweite'],heimjgd:['⚽','Jugend-Heimspiel'],kerwe:['🎪','Kerwe'],weihnacht:['🎄','Weihnachten'],
  turnier:['🏆','Turnier'],saisonfeier:['🎉','Saisonfeier'],arbeit:['🛠️','Arbeitseinsatz'],jhv:['🏛️','Jahreshauptversammlung'],neujahr:['🥂','Neujahrsempfang'],sonstiges:['📋','Veranstaltung']};
const OG_GRP=[['vorher','Vorher'],['spieltag','Am Tag'],['danach','Danach']];
// Vereinsformulare (Stand 09/2026). F-09 und die Formularmappe tragen die Bankdaten des Vereins; Albert hat sie ausdrücklich für die App freigegeben (Beta 0.32).
const OG_FORM={'F-01':['Aufnahmeantrag','Neues Mitglied, mit SEPA-Mandat','F-01-Aufnahmeantrag.pdf'],'F-02':['Einwilligung Foto & Video','Vor Fotos und Social-Media-Posts','F-02-Einwilligung-Foto-Video.pdf'],
  'F-03':['Notfall- und Gesundheitsbogen Jugend','Bei Jugendspielen und Turnieren beim Betreuer','F-03-Notfall-Gesundheitsbogen-Jugend.pdf'],'F-04':['Trainer- und Übungsleitervereinbarung','Bei neuen Trainern und Betreuern','F-04-Trainer-Uebungsleitervereinbarung.pdf'],
  'F-05':['Auslagen- und Fahrtkostenabrechnung','Wer bei Spielen oder Events etwas ausgelegt hat','F-05-Auslagen-Fahrtkostenabrechnung.pdf'],'F-06':['Spieltag-Kassenabrechnung','Nach jedem Heimspiel (geht auch direkt in der App)','F-06-Spieltag-Kassenabrechnung.pdf'],
  'F-07':['Heimspiel-Checkliste','Papierfassung der Heimspiel-Liste','F-07-Heimspiel-Checkliste.pdf'],'F-08':['Protokoll Abteilungssitzung','Sitzungen und Jahreshauptversammlung','F-08-Protokoll-Abteilungssitzung.pdf'],
  'F-09':['Rechnungsvorlage','Rechnungen an Partner, Standmieten, Gastvereine','F-09-Rechnungsvorlage.pdf'],
  'F-10':['Helfer-Schichtplan','Spieltage, Kerwe, Turniere (geht auch direkt in der App)','F-10-Helfer-Schichtplan.pdf'],'F-11':['Wochen-Trainingsplan','Für Trainer, jede Woche','F-11-Wochen-Trainingsplan.pdf'],
  'F-12':['Abmeldung & Spielerfreigabe','Beim Vereinswechsel (1.7. bis 31.8. und im Januar)','F-12-Abmeldung-Spielerfreigabe.pdf'],
  'Alle':['Formularmappe, am PC ausfüllbar','Alle zwölf Formulare in einer Datei (4,8 MB)','Formularmappe-ausfuellbar.pdf']};
const OG_FORM_ART={heim1:['F-07','F-06','F-10','F-05','F-09'],heim2:['F-07','F-06','F-10','F-05'],heimjgd:['F-03','F-06','F-10','F-02'],kerwe:['F-10','F-06','F-05','F-09'],weihnacht:['F-10','F-06','F-05','F-09'],
  turnier:['F-10','F-03','F-06','F-05','F-09'],saisonfeier:['F-10','F-05','F-02'],arbeit:['F-05'],jhv:['F-08','F-05'],neujahr:['F-10','F-05','F-02'],sonstiges:['F-10','F-05']};
const ogFormUrl=k=>'formulare/'+(OG_FORM[k]||[])[2];
SV_TBL.orga=['check','Aufgaben'];
Object.assign(SV_PAGES,{orga:['Aufgaben','Checklisten für Heimspiele und Veranstaltungen: abhaken, verteilen, absprechen']});
{ const _ta=svTabAllowed; svTabAllowed=function(t){ if(t==='orga')return typeof SVR==='undefined'||!SVR.loaded||!!SVR.role; return _ta.apply(this,arguments); }; }
function ogPanel(){ let P=document.getElementById('panel-orga'); if(P)return P;
  const ref=document.getElementById('panel-home')||document.querySelector('.panel'); if(!ref)return null;
  P=document.createElement('section'); P.className='panel'; P.id='panel-orga'; ref.parentNode.insertBefore(P,ref.nextSibling); return P; }
{ const _gt=goTab; goTab=function(tab){ if(tab==='orga')ogPanel(); const was=svCurTab(); const r=_gt.apply(this,arguments);
    try{ const jetzt=svCurTab(); if(jetzt==='orga'&&was!=='orga'){ OG.L=null; ogRender(); } if(jetzt!=='orga')ogStop(); }catch(e){ console.warn('Aufgaben',e); } return r; }; }

/* ---------- Hilfen ---------- */
const ogE=s=>svEsc(s==null?'':String(s));
const ogHeute=()=>{ const d=new Date(); return d.getFullYear()+'-'+String(d.getMonth()+1).padStart(2,'0')+'-'+String(d.getDate()).padStart(2,'0'); };
function ogTag(d){ try{ const x=new Date(d+'T12:00:00'), h=ogHeute(), n=Math.round((x-new Date(h+'T12:00:00'))/864e5);
  const rel=n===0?'Heute':n===1?'Morgen':n===-1?'Gestern':n>1&&n<7?'in '+n+' Tagen':null;
  return (rel?rel+', ':'')+x.toLocaleDateString('de-DE',{weekday:'short',day:'2-digit',month:'2-digit'}); }catch(e){ return d; } }
function ogUhr(ts){ try{ const x=new Date(ts); return x.toLocaleTimeString('de-DE',{hour:'2-digit',minute:'2-digit'}); }catch(e){ return ''; } }
function ogWann(ts,datum){ if(!ts)return ''; try{ const x=new Date(ts), d=x.getFullYear()+'-'+String(x.getMonth()+1).padStart(2,'0')+'-'+String(x.getDate()).padStart(2,'0');
  if(d===datum)return ogUhr(ts)+' Uhr'; const n=Math.round((new Date(datum+'T12:00:00')-new Date(d+'T12:00:00'))/864e5);
  return (n>0&&n<=14?n+' '+(n===1?'Tag':'Tage')+' vorher':x.toLocaleDateString('de-DE',{day:'2-digit',month:'2-digit'}))+(n>0&&n<=2?', '+ogUhr(ts):''); }catch(e){ return ''; } }
function ogRing(f,n,gross){ const p=n?f/n:0, r=gross?34:20, c=2*Math.PI*r, s=gross?84:52;
  return `<svg class="og-ring${gross?' gross':''}" viewBox="0 0 ${s} ${s}" width="${s}" height="${s}" aria-hidden="true"><circle cx="${s/2}" cy="${s/2}" r="${r}" class="bg"/>
    <circle cx="${s/2}" cy="${s/2}" r="${r}" class="fg${p>=1?' voll':''}" style="stroke-dasharray:${c.toFixed(1)};stroke-dashoffset:${(c*(1-p)).toFixed(1)}" transform="rotate(-90 ${s/2} ${s/2})"/>
    <text x="50%" y="50%" dominant-baseline="central" text-anchor="middle">${p>=1&&n?'✓':Math.round(p*100)+'%'}</text></svg>`; }
async function ogRpc(fn,args){ const {data,error}=await SVB.sb.rpc(fn,args||{}); if(error)throw new Error(/42501|Berechtigung/.test(error.message+error.code)?'Dafür fehlt dir die Berechtigung.':error.message); return data; }
function ogStop(){ if(OG.t){ clearInterval(OG.t); OG.t=null; } }
function ogStart(){ ogStop(); OG.t=setInterval(()=>{ if(document.hidden||svCurTab()!=='orga'||!OG.L||document.querySelector('#panel-orga :focus'))return; ogLaden(OG.L.id,true); },10000); }
function ogFeier(el){ try{ if(typeof sv43Reduced==='function'&&sv43Reduced())return; const r=(el||document.body).getBoundingClientRect(), box=document.createElement('div'); box.className='og-konfetti';
  box.style.left=(r.left+r.width/2)+'px'; box.style.top=(r.top+Math.min(r.height/2,120))+'px';
  const F=['#3b7bff','#22c55e','#f59e0b','#ec4899','#a855f7','#14b8a6'];
  for(let i=0;i<28;i++){ const s=document.createElement('i'); const a=Math.random()*Math.PI*2, d=60+Math.random()*120; s.style.setProperty('--x',Math.cos(a)*d+'px'); s.style.setProperty('--y',(Math.sin(a)*d-60)+'px'); s.style.background=F[i%F.length]; s.style.animationDelay=(Math.random()*.12)+'s'; box.appendChild(s); }
  document.body.appendChild(box); setTimeout(()=>box.remove(),1400); }catch(e){} }

/* ---------- Übersicht ---------- */
async function ogRender(){
  const P=ogPanel(); if(!P)return;
  if(OG.L){ ogListeZeigen(); return; }
  if(!OG.ue){ P.innerHTML='<div class="card"><div class="empty">Lade Checklisten …</div></div>'; }
  try{ OG.ue=await ogRpc('orga_uebersicht',{p_tage:120}); }catch(e){ if(!OG.ue){ P.innerHTML=`<div class="card"><div class="empty">Checklisten konnten nicht geladen werden. ${ogE(e.message)}</div></div>`; return; } }
  if(OG.L||svCurTab()!=='orga')return;
  const U=OG.ue, h=ogHeute(), L=U.listen||[], kommend=L.filter(l=>l.datum>=h), vorbei=L.filter(l=>l.datum<h).reverse(), meine=L.reduce((a,l)=>a+(l.meine||0),0);
  const karte=l=>{ const a=OG_ART[l.art]||OG_ART.sonstiges;
    return `<button type="button" class="og-karte${l.n&&l.fertig===l.n?' fertig':''}" data-ogl="${ogE(l.id)}"><span class="og-em">${a[0]}</span>
      <span class="og-kt"><b>${ogE(l.titel)}</b><small>${ogE(ogTag(l.datum))}${l.zeit?' · '+ogE(l.zeit)+' Uhr':''}</small>
        <small class="og-v">${l.verantwortlich_name?'Verantwortlich: '+ogE(l.verantwortlich_name):'Noch niemand verantwortlich'}</small>
        ${l.meine?`<em class="og-mein">${l.meine} für dich</em>`:''}</span>
      ${ogRing(l.fertig,l.n)}</button>`; };
  P.innerHTML=`<div class="og-kopf"><div><h2>Aufgaben</h2><p>Tippe eine Checkliste an. Abhaken geht mit einem Tipp auf den Kreis.</p></div>
      ${U.darf?`<button class="btn og-neu" type="button" id="ogNeu">${SVI('plus')} Neue Checkliste</button>`:''}</div>
    ${!U.drive&&svRole()==='admin'?ogDriveBanner():''}
    ${meine?`<button type="button" class="og-meine" id="ogMeine"><span>👋</span><b>Du hast ${meine} offene Aufgabe${meine>1?'n':''}</b><i>${SVI('chev')}</i></button>`:''}
    ${kommend.length?`<div class="og-karten">${kommend.map(karte).join('')}</div>`:`<div class="card og-leer"><div class="og-leer-em">✅</div><b>Gerade steht nichts an</b><p>Heimspiele und Veranstaltungen bekommen ihre Checkliste automatisch ein bis zwei Wochen vorher.${U.darf?' Du kannst auch selbst eine anlegen.':''}</p></div>`}
    ${vorbei.length?`<details class="og-vorbei"><summary>Vergangene Checklisten (${vorbei.length})</summary><div class="og-karten">${vorbei.map(karte).join('')}</div></details>`:''}
    <div class="og-fuss"><button type="button" class="btn ghost sm" id="ogForm">📄 Formulare</button>${U.darf?`<button type="button" class="btn ghost sm" id="ogRol">${SVI('users')} Zuständigkeiten</button><button type="button" class="btn ghost sm" id="ogVorl">${SVI('book')} Vorlagen ansehen und ändern</button>${!U.drive&&svRole()==='admin'?`<button type="button" class="btn ghost sm" id="ogDrive">${SVI('upload')} Vereins-Drive verbinden</button>`:''}`:''}</div>`;
  P.querySelectorAll('[data-ogl]').forEach(b=>b.onclick=()=>ogOeffnen(b.dataset.ogl));
  const nb=P.querySelector('#ogNeu'); if(nb)nb.onclick=()=>ogNeuForm();
  const mb=P.querySelector('#ogMeine'); if(mb)mb.onclick=()=>{ const l=kommend.find(x=>x.meine)||L.find(x=>x.meine); if(l){ OG.filter='meine'; ogOeffnen(l.id); } };
  const vb=P.querySelector('#ogVorl'); if(vb)vb.onclick=()=>ogVorlagen();
  P.querySelector('#ogForm').onclick=()=>ogFormulare(); const rb=P.querySelector('#ogRol'); if(rb)rb.onclick=()=>ogRollen();
  P.querySelectorAll('#ogDrive,[data-ogdrive]').forEach(b=>b.onclick=()=>ogDriveSetup());
}
function ogDriveBanner(){ return `<div class="og-dban"><span class="og-dban-em">📁</span><div><b>Noch ein Schritt: Vereins-Drive verbinden</b>
    <p>Dann landen Fotos, Belege und Kassenabrechnungen aus den Checklisten automatisch sortiert im Google Drive des Vereins. Einmalig, etwa fünf Minuten, am besten am Computer mit dem Vereinskonto.</p></div>
    <button type="button" class="btn" data-ogdrive="1">${SVI('upload')} Jetzt verbinden</button></div>`; }
async function ogOeffnen(id,filter){ if(filter)OG.filter=filter; if(svCurTab()!=='orga'){ ogPanel(); goTab('orga'); }
  const P=ogPanel(); OG.L={id,laedt:true}; P.innerHTML='<div class="card"><div class="empty">Lade Checkliste …</div></div>';
  await ogLaden(id); window.scrollTo(0,0); }
async function ogLaden(id,still){
  try{ const L=await ogRpc('orga_liste',{p_id:id}); const alt=OG.L&&OG.L.id===id?OG.L:null; OG.L=L;
    if(still&&alt&&JSON.stringify(alt.punkte)===JSON.stringify(L.punkte)&&(alt.chat||[]).length===(L.chat||[]).length&&(alt.dateien||[]).length===(L.dateien||[]).length)return;
    ogListeZeigen(); if(!OG.t)ogStart(); }
  catch(e){ if(!still){ OG.L=null; kToast('⚠️ '+e.message); ogRender(); } } }

/* ---------- Eine Checkliste ---------- */
function ogPunktHtml(p,L){ const done=!!p.e, ich=(OG.ue&&OG.ue.ich)||'', meins=p.wu&&p.wu===ich, jetzt=Date.now(), ueber=!done&&p.f&&new Date(p.f).getTime()<jetzt;
  return `<div class="og-p${done?' done':''}${meins?' meins':''}" data-ogp="${ogE(p.id)}">
    <button type="button" class="og-haken" data-ogh="${ogE(p.id)}" aria-label="${done?'Wieder offen':'Erledigt'}: ${ogE(p.t)}"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M5 12.5l4.2 4.2L19 7"/></svg></button>
    <button type="button" class="og-pt" data-oge="${ogE(p.id)}"><b>${ogE(p.t)}</b>
      <span class="og-pm">${p.f?`<i class="og-uhr${ueber?' ueber':''}">${SVI('clock')} ${ogE(ogWann(p.f,L.datum))}</i>`:''}
        ${p.wn?`<i class="og-wer${meins?' ich':''}">${SVI('user')} ${meins?'Du':ogE(p.wn)}</i>`:done?'':`<i class="og-wer leer">+ Wer macht das?</i>`}
        ${done&&p.ev?`<i class="og-ev">✓ ${ogE(p.ev)}</i>`:''}${p.n?`<i class="og-notiz">„${ogE(p.n.slice(0,60))}“</i>`:''}</span></button>
    ${p.fo&&OG_FORM[p.fo]?`<button type="button" class="og-fo" data-ogfo="${ogE(p.fo)}">${p.fo==='F-10'?'👥 Schichtplan':p.fo==='F-06'?'💶 Kasse':'📄 '+ogE(p.fo)}</button>`:''}</div>`; }
function ogListeZeigen(){
  const P=ogPanel(), L=OG.L; if(!P||!L||!L.punkte)return;
  const a=OG_ART[L.art]||OG_ART.sonstiges, ich=(OG.ue&&OG.ue.ich)||'', alle=L.punkte, fertig=alle.filter(p=>p.e).length;
  const sicht=alle.filter(p=>OG.filter==='meine'?p.wu===ich:true), offen=sicht.filter(p=>!p.e), erledigt=sicht.filter(p=>p.e);
  const scroll=window.scrollY, chatAuf=document.getElementById('ogChatIn')===document.activeElement;
  const neuChat=(L.chat||[]).length;
  P.innerHTML=`<button type="button" class="og-zurueck" id="ogZur">${SVI('chev')} Alle Checklisten</button>
    <div class="card og-hero"><div class="og-ht"><span class="og-em gross">${a[0]}</span><div><small>${ogE(L.art_titel||a[1])}</small><h2>${ogE(L.titel)}</h2>
      <p>${ogE(ogTag(L.datum))}${L.zeit?' · '+ogE(L.zeit)+' Uhr':''}${L.ort?' · '+ogE(L.ort):''}</p></div>${ogRing(fertig,alle.length,true)}</div>
      <div class="og-hstat"><b>${fertig} von ${alle.length} erledigt</b>${fertig===alle.length&&alle.length?' 🎉':''}</div>
      <button type="button" class="og-verant" id="ogVer">${SVI('shield')} ${L.verantwortlich_name?'Verantwortlich: <b>'+ogE(L.verantwortlich_name)+'</b>':'<b>Verantwortlich festlegen</b>'}</button>
      ${/^heim[12]$/.test(L.art)&&OG.ue&&OG.ue.darf?`<button type="button" class="og-verant og-sotd" id="ogSotd">⭐ ${L.sotd?'Partner des Tages: <b>'+ogE(L.sotd)+'</b>':'Partner des Tages festlegen'}</button>`:''}</div>
    <form class="og-add" id="ogAdd" autocomplete="off"><input id="ogAddIn" maxlength="160" placeholder="Was muss noch erledigt werden?" aria-label="Neue Aufgabe" enterkeyhint="done">
      <button class="btn" type="submit" aria-label="Hinzufügen">${SVI('plus')}</button></form>
    <label class="og-merk"><input type="checkbox" id="ogMerk"${OG.merken?' checked':''}> Beim nächsten Mal automatisch wieder auf die Liste</label>
    <div class="og-filter" role="tablist"><button type="button" data-ogf="alle" class="${OG.filter!=='meine'?'on':''}">Alle Aufgaben</button><button type="button" data-ogf="meine" class="${OG.filter==='meine'?'on':''}">Nur meine</button></div>
    ${OG_GRP.map(([g,t])=>{ const X=offen.filter(p=>p.g===g); return X.length?`<div class="og-grp"><h3>${t} <small>${X.length}</small></h3>${X.map(p=>ogPunktHtml(p,L)).join('')}</div>`:''; }).join('')}
    ${!offen.length?`<div class="card og-alle"><div class="og-leer-em">${sicht.length?'🎉':'🙌'}</div><b>${sicht.length?'Alles erledigt!':OG.filter==='meine'?'Für dich steht hier nichts an.':'Noch keine Aufgaben.'}</b>${sicht.length?'<p>Danke an alle, die mitgeholfen haben.</p>':''}</div>`:''}
    ${erledigt.length?`<details class="og-grp og-erl"${offen.length?'':' open'}><summary>Erledigt <small>${erledigt.length}</small></summary>${erledigt.map(p=>ogPunktHtml(p,L)).join('')}</details>`:''}
    ${ogSchichtHtml(L)}${ogKasseKarte(L)}
    <div class="card og-helfer"><h3>${SVI('users')} Helfer ohne App</h3><p>Schick einem Helfer seinen eigenen Link per WhatsApp. Er sieht die Liste, hakt ab und kann im Chat schreiben, ganz ohne Anmeldung.</p>
      <div class="og-hl">${(L.helfer||[]).map(h=>`<button type="button" class="og-hchip" data-oghl="${ogE(h.token)}" data-ogn="${ogE(h.name)}">${SVI('share')} ${ogE(h.name)}</button>`).join('')}
      <button type="button" class="btn ghost sm" id="ogHelferNeu">${SVI('plus')} Helfer einladen</button></div></div>
    <div class="card og-chat" id="ogChat"><h3>${SVI('chat')} Absprache <small>${neuChat?neuChat+' Nachricht'+(neuChat>1?'en':''):''}</small></h3>
      <div class="og-msgs" id="ogMsgs">${(L.chat||[]).map(c=>`<div class="og-m${c.u&&c.u===ich?' ich':''}"><b>${ogE(c.von)}</b>${c.datei&&c.text==='📎 '+c.datei.name?'':`<p>${ogE(c.text)}</p>`}${c.datei?`<a href="${ogE(c.datei.link||'#')}" target="_blank" rel="noopener" class="og-datei">${SVI('file')} ${ogE(c.datei.name)}</a>`:''}<small>${ogE(new Date(c.at).toLocaleString('de-DE',{weekday:'short',hour:'2-digit',minute:'2-digit'}))}</small></div>`).join('')||'<p class="note">Noch keine Nachricht. Hier stimmt ihr euch ab, zum Beispiel wer den Grill mitbringt.</p>'}</div>
      <form class="og-send" id="ogSend" autocomplete="off"><label class="og-att" title="Foto oder Datei">${SVI('camera')}<input type="file" id="ogFile" accept="image/*,application/pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.txt,.csv" hidden></label>
        <input id="ogChatIn" maxlength="1000" placeholder="Nachricht schreiben" aria-label="Nachricht" enterkeyhint="send"><button class="btn" type="submit" aria-label="Senden">${SVI('send')}</button></form>
      <p class="note og-dhin">${OG.ue&&OG.ue.drive===false?'Fotos und Dateien gehen, sobald der Vereins-Drive verbunden ist.'+(svRole()==='admin'?' <button type="button" class="btn ghost sm" data-ogdrive="1">Jetzt verbinden</button>':''):'Fotos und Dateien landen sortiert im Vereins-Drive'}${L.drive_link?` · <a href="${ogE(L.drive_link)}" target="_blank" rel="noopener">Ordner öffnen</a>`:''}</p></div>
    ${(L.dateien||[]).length?`<div class="card og-dateien"><h3>${SVI('file')} Dateien</h3>${L.dateien.map(d=>`<a href="${ogE(d.link||'#')}" target="_blank" rel="noopener" class="og-dz">${/^image/.test(d.mime||'')?'🖼️':'📄'} <b>${ogE(d.name)}</b><small>${ogE(d.von||'')}</small></a>`).join('')}</div>`:''}
    ${ogNummernHtml(L)}${ogFormHtml(L.art)}`;
  window.scrollTo(0,scroll);
  P.querySelector('#ogZur').onclick=()=>{ OG.L=null; ogStop(); OG.filter='alle'; ogRender(); window.scrollTo(0,0); };
  P.querySelector('#ogVer').onclick=()=>ogWerWahl('Wer ist verantwortlich?',L.verantwortlich,true,async v=>{ OG.L=await ogRpc('orga_liste_aendern',{p_id:L.id,p:{verantwortlich:v.id||v.name||''}}); OG.L=await ogRpc('orga_liste',{p_id:L.id}); ogListeZeigen(); kToast('✓ Gespeichert'); });
  const so=P.querySelector('#ogSotd'); if(so)so.onclick=()=>ogSotd();
  P.querySelectorAll('[data-ogdrive]').forEach(b=>b.onclick=()=>ogDriveSetup());
  P.querySelectorAll('[data-ogfo]').forEach(b=>b.onclick=()=>{ const k=b.dataset.ogfo; if(k==='F-06')return ogKasse(); if(k==='F-10'){ const c=document.getElementById('ogSchicht'); if(c){ c.scrollIntoView({behavior:'smooth',block:'start'}); c.classList.add('blink'); setTimeout(()=>c.classList.remove('blink'),1200); } return; } window.open(ogFormUrl(k),'_blank','noopener'); });
  ogSchichtWire(P); const kb=P.querySelector('#ogKasseGo'); if(kb)kb.onclick=()=>ogKasse();
  P.querySelector('#ogMerk').onchange=e=>{ OG.merken=e.target.checked; };
  P.querySelector('#ogAdd').onsubmit=async e=>{ e.preventDefault(); const i=P.querySelector('#ogAddIn'), t=i.value.trim(); if(t.length<2){ i.focus(); return; }
    i.disabled=true; try{ const R=await ogRpc('orga_punkt_neu',{p_liste:L.id,p_titel:t,p_gruppe:null,p_merken:OG.merken}); OG.L=Object.assign(OG.L,R); svSound('pop'); svHaptic('light'); ogListeZeigen();
      const n=document.getElementById('ogAddIn'); if(n)n.focus(); const neu=[...document.querySelectorAll('.og-p:not(.done) .og-pt b')].find(b=>b.textContent===t); if(neu)neu.closest('.og-p').classList.add('neu'); }
    catch(x){ kToast('⚠️ '+x.message); i.disabled=false; } };
  P.querySelectorAll('[data-ogf]').forEach(b=>b.onclick=()=>{ OG.filter=b.dataset.ogf; ogListeZeigen(); });
  P.querySelectorAll('[data-ogh]').forEach(b=>b.onclick=()=>ogHaken(b.dataset.ogh,b));
  P.querySelectorAll('[data-oge]').forEach(b=>b.onclick=()=>ogPunktForm(b.dataset.oge));
  P.querySelector('#ogHelferNeu').onclick=()=>ogHelferNeu();
  P.querySelectorAll('[data-oghl]').forEach(b=>b.onclick=()=>ogHelferTeilen(b.dataset.ogn,b.dataset.oghl));
  P.querySelector('#ogSend').onsubmit=async e=>{ e.preventDefault(); const i=P.querySelector('#ogChatIn'), t=i.value.trim(); if(!t)return; i.disabled=true;
    try{ const R=await ogRpc('orga_chat_senden',{p_liste:L.id,p_text:t}); OG.L=Object.assign(OG.L,R); ogListeZeigen(); const n=document.getElementById('ogChatIn'); if(n)n.focus(); ogChatUnten(); }
    catch(x){ kToast('⚠️ '+x.message); i.disabled=false; } };
  P.querySelector('#ogFile').onchange=e=>{ const f=e.target.files&&e.target.files[0]; e.target.value=''; if(f)ogHochladen(f); };
  const M=document.getElementById('ogMsgs'); if(M&&(!OG.chatN||neuChat!==OG.chatN))M.scrollTop=M.scrollHeight; OG.chatN=neuChat;
  if(chatAuf){ const n=document.getElementById('ogChatIn'); if(n)n.focus(); }
}
function ogChatUnten(){ const M=document.getElementById('ogMsgs'); if(M)M.scrollTop=M.scrollHeight; }
async function ogHaken(id,btn){
  const L=OG.L, p=L.punkte.find(x=>x.id===id); if(!p)return; const an=!p.e, row=btn.closest('.og-p');
  row.classList.add(an?'hakt':'loest'); svHaptic(an?'success':'light'); svSound(an?'success':'tick');
  const vorher=L.punkte.filter(x=>x.e).length;
  try{ const R=await ogRpc('orga_punkt_haken',{p_id:id,p_erledigt:an}); await new Promise(r=>setTimeout(r,an?520:200)); OG.L=Object.assign(OG.L,R); ogListeZeigen();
    const n=OG.L.punkte.length, f=OG.L.punkte.filter(x=>x.e).length; if(an&&f===n&&vorher<n){ ogFeier(document.querySelector('.og-hero')); kToast('🎉 Alles erledigt, danke!'); } }
  catch(x){ row.classList.remove('hakt','loest'); kToast('⚠️ '+x.message); } }

/* ---------- Punkt bearbeiten ---------- */
function ogPunktForm(id){
  const L=OG.L, p=L.punkte.find(x=>x.id===id); if(!p)return;
  const f=p.f?new Date(p.f):null, uhr=f?String(f.getHours()).padStart(2,'0')+':'+String(f.getMinutes()).padStart(2,'0'):'';
  const tag=f?f.getFullYear()+'-'+String(f.getMonth()+1).padStart(2,'0')+'-'+String(f.getDate()).padStart(2,'0'):L.datum;
  const M=svModal(`<div class="og-form"><h2>${ogE(p.t)}</h2>
    <label class="og-fl">Was genau?<input id="ogPt" maxlength="160" value="${ogE(p.t)}"></label>
    <label class="og-fl">Wer macht das?<button type="button" class="og-werbtn" id="ogPw">${p.wn?SVI('user')+' '+ogE(p.wn):'+ Person auswählen'}</button></label>
    <div class="og-zwei"><label class="og-fl">Tag<input type="date" id="ogPd" value="${ogE(tag)}"></label><label class="og-fl">Uhrzeit<input type="time" id="ogPu" value="${ogE(uhr)}"></label></div>
    <label class="og-fl">Wann in der Liste?<div class="og-seg">${OG_GRP.map(([g,t])=>`<button type="button" data-ogg="${g}" class="${p.g===g?'on':''}">${t}</button>`).join('')}</div></label>
    <label class="og-fl">Notiz<input id="ogPn" maxlength="500" value="${ogE(p.n||'')}" placeholder="z.B. Schlüssel liegt im Vereinsheim"></label>
    <div class="btnrow sbact"><button class="btn" type="button" id="ogPs">${SVI('check')} Speichern</button><button class="btn ghost" type="button" onclick="closeOverlay()">Abbrechen</button></div>
    <div class="og-weg"><button type="button" class="btn ghost sm" id="ogPx">${SVI('trash')} Aufgabe entfernen</button><label><input type="checkbox" id="ogPxv"> auch beim nächsten Mal weglassen</label></div></div>`);
  let g=p.g, wer; M.querySelectorAll('[data-ogg]').forEach(b=>b.onclick=()=>{ g=b.dataset.ogg; M.querySelectorAll('[data-ogg]').forEach(x=>x.classList.toggle('on',x===b)); });
  M.querySelector('#ogPw').onclick=()=>ogWerWahl('Wer macht das?',p.wu,true,v=>{ wer=v; M.querySelector('#ogPw').innerHTML=v.name?SVI('user')+' '+ogE(v.name):'+ Person auswählen'; },M);
  M.querySelector('#ogPs').onclick=async()=>{ const b=M.querySelector('#ogPs'); b.disabled=true;
    const d=M.querySelector('#ogPd').value, u=M.querySelector('#ogPu').value, patch={t:M.querySelector('#ogPt').value,g,n:M.querySelector('#ogPn').value};
    if(u&&d&&(d!==tag||u!==uhr))patch.am=d+'T'+u; else if(!u&&uhr)patch.uhr='';
    if(wer)patch.wer=wer.id||wer.name||'';
    try{ const R=await ogRpc('orga_punkt_aendern',{p_id:id,p:patch}); OG.L=Object.assign(OG.L,R); closeOverlay(); ogListeZeigen(); kToast('✓ Gespeichert'); }catch(x){ b.disabled=false; kToast('⚠️ '+x.message); } };
  M.querySelector('#ogPx').onclick=async()=>{ const b=M.querySelector('#ogPx');
    if(!b.dataset.sicher){ b.dataset.sicher='1'; b.innerHTML=SVI('trash')+' Wirklich entfernen?'; b.classList.add('warn'); return; }
    try{ const R=await ogRpc('orga_punkt_loeschen',{p_id:id,p_aus_vorlage:M.querySelector('#ogPxv').checked}); OG.L=Object.assign(OG.L,R); closeOverlay(); ogListeZeigen(); kToast('✓ Entfernt'); }catch(x){ kToast('⚠️ '+x.message); } };
}
// Person auswählen: App-Nutzer (Liste mit Suche) oder freier Name (Helfer ohne App)
function ogWerWahl(titel,aktuell,freiErlaubt,fertig,zurueck){
  const leute=(OG.L&&OG.L.leute)||(OG.ue&&OG.ue.leute)||[], ich=(OG.ue&&OG.ue.ich)||'';
  const box=document.createElement('div'); box.className='og-wahl'; box.innerHTML=`<div class="og-wahl-in"><h3>${ogE(titel)}</h3>
    <input id="ogWs" placeholder="Name suchen oder eintippen" maxlength="60" autocomplete="off">
    <div class="og-wl" id="ogWl"></div>
    <div class="btnrow"><button type="button" class="btn ghost" data-ogwx>Abbrechen</button>${aktuell?'<button type="button" class="btn ghost" data-ogw0>Niemand</button>':''}</div></div>`;
  document.body.appendChild(box); requestAnimationFrame(()=>box.classList.add('auf'));
  const zu=()=>{ box.classList.remove('auf'); setTimeout(()=>box.remove(),200); };
  const zeig=()=>{ const q=box.querySelector('#ogWs').value.trim(), ql=q.toLowerCase();
    const T=leute.filter(x=>!ql||x.name.toLowerCase().includes(ql)).sort((a,b)=>(b.id===ich)-(a.id===ich)).slice(0,30);
    box.querySelector('#ogWl').innerHTML=(T.map(x=>`<button type="button" data-ogwi="${ogE(x.id)}" class="${x.id===aktuell?'on':''}">${SVI('user')} ${x.id===ich?'Ich ('+ogE(x.name)+')':ogE(x.name)}</button>`).join(''))
      +(freiErlaubt&&q.length>=2&&!T.some(x=>x.name.toLowerCase()===ql)?`<button type="button" data-ogwf class="frei">${SVI('plus')} „${ogE(q)}“ eintragen <small>(ohne App)</small></button>`:'')
      +(!T.length&&!(freiErlaubt&&q.length>=2)?'<p class="note">Niemand gefunden.</p>':'');
    box.querySelectorAll('[data-ogwi]').forEach(b=>b.onclick=()=>{ const x=leute.find(y=>y.id===b.dataset.ogwi); zu(); fertig({id:x.id,name:x.name}); });
    const fr=box.querySelector('[data-ogwf]'); if(fr)fr.onclick=()=>{ zu(); fertig({id:null,name:q}); }; };
  box.querySelector('#ogWs').oninput=zeig; zeig(); setTimeout(()=>{ try{ box.querySelector('#ogWs').focus(); }catch(e){} },80);
  box.querySelector('[data-ogwx]').onclick=zu; const n0=box.querySelector('[data-ogw0]'); if(n0)n0.onclick=()=>{ zu(); fertig({id:null,name:''}); };
  box.onclick=e=>{ if(e.target===box)zu(); };
}

/* ---------- Helfer-Links ---------- */
function ogHelferUrl(tok){ return svBasis()+'team.html#h='+tok; }
function ogHelferNeu(){ ogWerWahl('Wen möchtest du einladen?',null,true,async v=>{ if(!v.name)return;
  try{ const tok=await ogRpc('orga_helfer_link',{p_liste:OG.L.id,p_name:v.name}); OG.L=await ogRpc('orga_liste',{p_id:OG.L.id}); ogListeZeigen(); ogHelferTeilen(v.name,tok); }catch(x){ kToast('⚠️ '+x.message); } }); }
function ogHelferTeilen(name,tok){
  const L=OG.L, url=ogHelferUrl(tok), mine=L.punkte.filter(p=>!p.e&&p.wn&&p.wn.toLowerCase()===String(name).toLowerCase());
  const text=`Hallo ${name.split(' ')[0]}, hier ist die Checkliste für ${L.titel} (${ogTag(L.datum)}${L.zeit?', '+L.zeit+' Uhr':''}).${mine.length?' Deine Aufgaben: '+mine.map(p=>p.t).join(', ')+'.':''} Abhaken und Absprache hier: ${url}`;
  const M=svModal(`<div class="og-form"><h2>${SVI('share')} Link für ${ogE(name)}</h2><p class="note">Der Link gilt nur für diese Checkliste und läuft zwei Wochen nach dem Termin ab. Keine Anmeldung nötig.</p>
    <textarea class="og-wtext" readonly rows="5">${ogE(text)}</textarea>
    <div class="btnrow sbact"><a class="btn og-wa" href="https://wa.me/?text=${encodeURIComponent(text)}" target="_blank" rel="noopener">${SVI('send')} Per WhatsApp schicken</a><button class="btn ghost" type="button" id="ogCopy">${SVI('copy')} Kopieren</button></div></div>`);
  M.querySelector('#ogCopy').onclick=async()=>{ try{ await navigator.clipboard.writeText(text); kToast('✓ Kopiert'); }catch(e){ const t=M.querySelector('.og-wtext'); t.select(); } };
}

/* ---------- Dateien ---------- */
function ogBase64(blob){ return new Promise((ok,nein)=>{ const r=new FileReader(); r.onload=()=>ok(String(r.result).split(',')[1]||''); r.onerror=nein; r.readAsDataURL(blob); }); }
async function ogVerkleinern(f){ // Handyfotos: auf 2400 Pixel und JPEG, damit das Hochladen schnell geht
  if(!/^image\/(jpeg|png|webp)$/.test(f.type)||f.size<1500000)return f;
  try{ const img=await createImageBitmap(f), s=Math.min(1,2400/Math.max(img.width,img.height)), c=document.createElement('canvas'); c.width=Math.round(img.width*s); c.height=Math.round(img.height*s);
    c.getContext('2d').drawImage(img,0,0,c.width,c.height); const b=await new Promise(r=>c.toBlob(r,'image/jpeg',0.85)); return b&&b.size<f.size?new File([b],f.name.replace(/\.\w+$/,'')+'.jpg',{type:'image/jpeg'}):f; }catch(e){ return f; } }
async function ogHochladen(f0){
  const L=OG.L; if(!L)return; if(OG.ue&&OG.ue.drive===false){ kToast('⚠️ Der Vereins-Drive ist noch nicht verbunden. Das macht der Admin einmal.'); return; }
  const hin=document.querySelector('.og-dhin'); const alt=hin?hin.innerHTML:''; if(hin)hin.innerHTML='⏳ Lädt in den Vereins-Drive …';
  try{ const f=await ogVerkleinern(f0); if(f.size>15*1024*1024)throw new Error('Die Datei ist zu groß (höchstens 15 MB).');
    const text=(document.getElementById('ogChatIn')||{}).value||'';
    const {data,error}=await SVB.sb.functions.invoke('orga-datei',{body:{liste:L.id,name:f.name||'Foto.jpg',mime:f.type||'application/octet-stream',data:await ogBase64(f),text}});
    if(error)throw new Error(error.message); if(!data||!data.ok)throw new Error(data&&data.error==='drive-fehlt'?'Der Vereins-Drive ist noch nicht verbunden.':(data&&data.error)||'Hochladen hat nicht geklappt');
    kToast('✓ Im Drive abgelegt: '+String(data.ordner||'').split(' / ').slice(-2).join(' / ')); const i=document.getElementById('ogChatIn'); if(i)i.value='';
    await ogLaden(L.id); ogChatUnten(); }
  catch(e){ if(hin)hin.innerHTML=alt; kToast('⚠️ '+e.message); } }

/* ---------- Neue Checkliste ---------- */
function ogNeuForm(){
  const arten=Object.keys(OG_ART).filter(k=>k!=='heim1'&&k!=='heim2');
  const M=svModal(`<div class="og-form"><h2>Neue Checkliste</h2><p class="note">Heimspiele der Ersten und Zweiten und Termine aus dem Kalender bekommen ihre Checkliste von selbst. Hier legst du alles andere an.</p>
    <div class="og-arten">${arten.map(k=>`<button type="button" data-oga="${k}" class="${k==='sonstiges'?'on':''}"><span>${OG_ART[k][0]}</span>${ogE(OG_ART[k][1])}</button>`).join('')}</div>
    <label class="og-fl">Titel<input id="ogNt" maxlength="120" placeholder="z.B. Kerwe 2026"></label>
    <div class="og-zwei"><label class="og-fl">Datum<input type="date" id="ogNd" value="${ogHeute()}"></label><label class="og-fl">Uhrzeit<input type="time" id="ogNz"></label></div>
    <label class="og-fl">Ort<input id="ogNo" maxlength="120" placeholder="optional"></label>
    <div class="btnrow sbact"><button class="btn" type="button" id="ogNs">${SVI('check')} Anlegen</button><button class="btn ghost" type="button" onclick="closeOverlay()">Abbrechen</button></div></div>`);
  let art='sonstiges'; M.querySelectorAll('[data-oga]').forEach(b=>b.onclick=()=>{ art=b.dataset.oga; M.querySelectorAll('[data-oga]').forEach(x=>x.classList.toggle('on',x===b)); const t=M.querySelector('#ogNt'); if(!t.value)t.placeholder=OG_ART[art][1]+' '+new Date().getFullYear(); });
  M.querySelector('#ogNs').onclick=async()=>{ const t=M.querySelector('#ogNt').value.trim()||(art!=='sonstiges'?OG_ART[art][1]+' '+M.querySelector('#ogNd').value.slice(0,4):'');
    if(t.length<2){ kToast('⚠️ Bitte einen Titel eintragen'); return; }
    try{ const id=await ogRpc('orga_liste_fuer',{p_bezug:null,p_art:art,p_titel:t,p_datum:M.querySelector('#ogNd').value,p_zeit:M.querySelector('#ogNz').value||null,p_team:null,p_ort:M.querySelector('#ogNo').value||null});
      closeOverlay(); OG.ue=null; ogOeffnen(id); }catch(x){ kToast('⚠️ '+x.message); } };
}

/* ---------- Vorlagen ---------- */
async function ogVorlagen(){
  const V=(OG.ue&&OG.ue.vorlagen)||[];
  const M=svModal(`<div class="og-form"><h2>${SVI('book')} Vorlagen</h2><p class="note">Aus der Vorlage entsteht jede neue Checkliste. Punkte, die ihr in einer Liste ergänzt, kommen automatisch hier dazu.</p>
    <div class="og-vl">${V.map(v=>`<button type="button" data-ogv="${ogE(v.art)}"><span>${(OG_ART[v.art]||OG_ART.sonstiges)[0]}</span><b>${ogE(v.titel)}</b><small>${v.n} Punkte</small></button>`).join('')}</div></div>`);
  M.querySelectorAll('[data-ogv]').forEach(b=>b.onclick=()=>ogVorlageEdit(b.dataset.ogv));
}
async function ogVorlageEdit(art){
  let V; try{ V=await ogRpc('orga_vorlage',{p_art:art}); }catch(e){ kToast('⚠️ '+e.message); return; }
  const P=V.punkte.slice(), mt=m=>{ if(m==null||m==='')return ''; m=+m; const a=Math.abs(m); const t=a>=1440?Math.round(a/1440)+' Tag'+(Math.round(a/1440)>1?'e':''):a>=60?(a/60).toString().replace('.',',')+' Std.':a+' Min.'; return m<0?t+' vorher':m>0?t+' nachher':'zu Beginn'; };
  const zeig=()=>{ const M=svModal(`<div class="og-form"><h2>${(OG_ART[art]||OG_ART.sonstiges)[0]} ${ogE(V.titel)}</h2><p class="note">Reihenfolge mit den Pfeilen, Text antippen zum Ändern. Zeiten gelten relativ zum Beginn.</p>
      ${OG_GRP.map(([g,t])=>`<h3 class="og-vh">${t}</h3>${P.map((p,i)=>p.g===g?`<div class="og-vp"><input data-ogvt="${i}" value="${ogE(p.t)}" maxlength="160"><small>${ogE(mt(p.m))}</small>
        <button type="button" data-ogvu="${i}" aria-label="nach oben">▲</button><button type="button" data-ogvx="${i}" aria-label="entfernen">✕</button></div>`:'').join('')}`).join('')}
      <form class="og-add" id="ogVa"><input id="ogVai" maxlength="160" placeholder="Neuer Punkt"><button class="btn" type="submit">${SVI('plus')}</button></form>
      <div class="btnrow sbact"><button class="btn" type="button" id="ogVs">${SVI('check')} Vorlage speichern</button><button class="btn ghost" type="button" id="ogVz">Zurück</button></div></div>`);
    const lesen=()=>M.querySelectorAll('[data-ogvt]').forEach(i=>{ P[+i.dataset.ogvt].t=i.value; });
    M.querySelectorAll('[data-ogvu]').forEach(b=>b.onclick=()=>{ lesen(); const i=+b.dataset.ogvu; let j=i-1; while(j>=0&&P[j].g!==P[i].g)j--; if(j>=0){ const x=P[i]; P[i]=P[j]; P[j]=x; } zeig(); });
    M.querySelectorAll('[data-ogvx]').forEach(b=>b.onclick=()=>{ lesen(); P.splice(+b.dataset.ogvx,1); zeig(); });
    M.querySelector('#ogVa').onsubmit=e=>{ e.preventDefault(); lesen(); const t=M.querySelector('#ogVai').value.trim(); if(t.length<2)return; P.push({t,g:'spieltag',m:-60}); zeig(); };
    M.querySelector('#ogVs').onclick=async()=>{ lesen(); try{ V=await ogRpc('orga_vorlage_speichern',{p_art:art,p_punkte:P}); kToast('✓ Vorlage gespeichert'); OG.ue=null; ogVorlagen(); }catch(x){ kToast('⚠️ '+x.message); } };
    M.querySelector('#ogVz').onclick=()=>ogVorlagen(); };
  zeig();
}

/* ---------- Vereins-Drive verbinden (Admin, einmalig) ---------- */
function ogScript(key,root){ return `// SV/BSC Sportzentrale · Ablage im Vereins-Drive
// Einmal im Vereinskonto unter script.google.com einfügen und als Web-App bereitstellen.
const SCHLUESSEL = '${key}';
function doPost(e) {
  try {
    const b = JSON.parse(e.postData.contents);
    if (b.key !== SCHLUESSEL) return antwort({ ok: false, error: 'key' });
    let ordner = DriveApp.getFolderById(b.root || '${root}');
    (b.pfad || []).forEach(function (n) { const it = ordner.getFoldersByName(n); ordner = it.hasNext() ? it.next() : ordner.createFolder(n); });
    if (b.nurOrdner) return antwort({ ok: true, ordner: ordner.getId(), ordner_link: ordner.getUrl() });
    if (b.ersetzen) { const alt = ordner.getFilesByName(b.name); while (alt.hasNext()) alt.next().setTrashed(true); }
    const datei = ordner.createFile(Utilities.newBlob(Utilities.base64Decode(b.data), b.mime, b.name));
    return antwort({ ok: true, id: datei.getId(), link: datei.getUrl(), ordner: ordner.getId(), ordner_link: ordner.getUrl() });
  } catch (err) { return antwort({ ok: false, error: String(err && err.message || err) }); }
}
function antwort(o) { return ContentService.createTextOutput(JSON.stringify(o)).setMimeType(ContentService.MimeType.JSON); }
`; }
async function ogDriveSetup(){
  let S; try{ S=await ogRpc('orga_drive_setup',{p_url:null}); }catch(e){ kToast('⚠️ '+e.message); return; }
  const code=ogScript(S.key,S.root_id);
  const M=svModal(`<div class="og-form"><h2>${SVI('upload')} Vereins-Drive verbinden</h2>
    <p class="note">💻 <b>Am besten am Computer machen</b>, dort geht das Kopieren und Einfügen am leichtesten. Einmalig, dauert fünf Minuten. Danach landen Fotos und Dateien aus den Checklisten sortiert im Ordner „SV BSC Mörlenbach Fußball“. Die App bekommt dabei keinen Zugang zum Google-Konto.</p>
    <ol class="og-steps"><li>Mit dem Vereinskonto (vorstand.svmoerlenbach@gmail.com) <b>script.google.com</b> öffnen, „Neues Projekt“.</li>
      <li>Alles löschen und diesen Code einfügen: <button type="button" class="btn ghost sm" id="ogSc">${SVI('copy')} Code kopieren</button></li>
      <li>Oben „Bereitstellen“, „Neue Bereitstellung“, Typ „Web-App“. Ausführen als: <b>Ich</b>. Zugriff: <b>Jeder</b>. Dem Zugriff auf Drive zustimmen.</li>
      <li>Die Web-App-Adresse (endet auf /exec) hier einfügen:</li></ol>
    <input id="ogDu" placeholder="https://script.google.com/macros/s/…/exec" value="">
    <p class="note">${S.verbunden?`✓ Verbunden${S.geprueft_at?', zuletzt geprüft '+ogE(new Date(S.geprueft_at).toLocaleString('de-DE')):''}`:'Noch nicht verbunden.'}</p>
    <textarea class="og-code" readonly rows="6">${ogE(code)}</textarea>
    <div class="btnrow sbact"><button class="btn" type="button" id="ogDs">${SVI('check')} Speichern und testen</button>${S.verbunden?`<button class="btn ghost" type="button" id="ogDt">Nur testen</button>`:''}<button class="btn ghost" type="button" onclick="closeOverlay()">Schließen</button></div>
    <p class="note" id="ogDm"></p></div>`);
  M.querySelector('#ogSc').onclick=async()=>{ try{ await navigator.clipboard.writeText(code); kToast('✓ Code kopiert'); }catch(e){ const t=M.querySelector('.og-code'); t.select(); } };
  const testen=async()=>{ const m=M.querySelector('#ogDm'); m.textContent='Teste die Verbindung …';
    const {data,error}=await SVB.sb.functions.invoke('orga-datei',{body:{test:true}}); if(error||!data||!data.ok){ m.textContent='⚠️ '+((data&&data.error)||(error&&error.message)||'Test fehlgeschlagen'); return; }
    m.innerHTML='✓ Verbindung klappt.'+(data.ordner_link?` <a href="${ogE(data.ordner_link)}" target="_blank" rel="noopener">Ordner ansehen</a>`:''); if(OG.ue)OG.ue.drive=true;
    try{ const ap=document.getElementById('panel-admin'); if(ap&&ap.querySelector('#ogDriveKarte'))ogDriveKarte(ap); if(svCurTab()==='orga'&&!OG.L)ogRender(); }catch(e){} };
  M.querySelector('#ogDs').onclick=async()=>{ const u=M.querySelector('#ogDu').value.trim(); if(!u){ kToast('⚠️ Bitte die Adresse einfügen'); return; }
    try{ await ogRpc('orga_drive_setup',{p_url:u}); await testen(); }catch(x){ M.querySelector('#ogDm').textContent='⚠️ '+x.message; } };
  const t=M.querySelector('#ogDt'); if(t)t.onclick=testen;
}

/* ---------- Helfer-Schichtplan (F-10) ---------- */
function ogZeitraum(a,b){ return (a?ogUhr(a):'?')+(b?' bis '+ogUhr(b):'')+' Uhr'; }
function ogSchichtHtml(L){ const S=L.schichten||[]; if(!S.length&&!(OG.ue&&OG.ue.darf))return '';
  const frei=S.reduce((a,x)=>a+Math.max(0,x.p-(x.h||[]).length),0), plaetze=S.reduce((a,x)=>a+x.p,0), ich=(OG.ue&&OG.ue.ich)||'';
  return `<div class="card og-schicht" id="ogSchicht"><h3>👥 Helfer-Schichtplan <small>${plaetze?`${plaetze-frei} von ${plaetze} Plätzen besetzt`:''}</small></h3>
    <p class="og-regel">Bitte 15 Minuten vor Schichtbeginn an der Station sein und die Übergabe persönlich machen. Wer ausfällt, organisiert selbst Ersatz und sagt dem Verantwortlichen Bescheid.</p>
    ${S.map(x=>{ const H=x.h||[], leer=Math.max(0,x.p-H.length), drin=H.some(h=>h.u===ich);
      return `<div class="og-sr${leer?'':' voll'}"><div class="og-sk"><b>${ogE(x.st)}</b><small>${ogE(ogZeitraum(x.von,x.bis))}</small>${OG.ue&&OG.ue.darf?`<button type="button" class="og-sx" data-ogsed="${ogE(x.id)}" aria-label="Schicht ändern">✎</button>`:''}</div>
        <div class="og-sh">${H.map((h,i)=>`<span class="og-shn${h.u&&h.u===ich?' ich':''}">${h.u&&h.u===ich?'Du':ogE(h.n||'?')}<button type="button" data-ogsraus="${ogE(x.id)}" data-i="${i}" aria-label="austragen">×</button></span>`).join('')}
          ${leer?`<button type="button" class="og-shfrei" data-ogsein="${ogE(x.id)}">${drin?'+ Weitere Person':'+ Eintragen'}</button>`:''}${leer>1?`<small class="og-shr">${leer} frei</small>`:''}</div></div>`; }).join('')}
    ${OG.ue&&OG.ue.darf?`<button type="button" class="btn ghost sm" id="ogSneu">${SVI('plus')} Schicht hinzufügen</button>`:''}
    <a class="og-papier" href="${ogE(ogFormUrl('F-10'))}" target="_blank" rel="noopener">📄 Papierfassung F-10 zum Aushängen</a></div>`; }
function ogSchichtWire(P){
  P.querySelectorAll('[data-ogsein]').forEach(b=>b.onclick=()=>{ const id=b.dataset.ogsein, x=OG.L.schichten.find(s=>s.id===id), ich=(OG.ue&&OG.ue.ich)||'';
    const set=async wer=>{ try{ const R=await ogRpc('orga_schicht_setzen',{p_schicht:id,p_wer:wer,p_raus:null}); OG.L=Object.assign(OG.L,R); svHaptic('success'); svSound('pop'); ogListeZeigen(); kToast('✓ Eingetragen'); }catch(e){ kToast('⚠️ '+e.message); } };
    if(!(x.h||[]).some(h=>h.u===ich)&&!(OG.ue&&OG.ue.darf))return set(null);
    ogWerWahl(x.st+', '+ogZeitraum(x.von,x.bis),null,true,v=>{ if(v.id||v.name)set(v.id||v.name); }); });
  P.querySelectorAll('[data-ogsraus]').forEach(b=>b.onclick=async()=>{ if(!b.dataset.sicher){ b.dataset.sicher='1'; b.textContent='austragen?'; b.classList.add('warn'); setTimeout(()=>{ if(b.isConnected){ delete b.dataset.sicher; b.textContent='×'; b.classList.remove('warn'); } },3000); return; }
    try{ const R=await ogRpc('orga_schicht_setzen',{p_schicht:b.dataset.ogsraus,p_wer:null,p_raus:+b.dataset.i}); OG.L=Object.assign(OG.L,R); ogListeZeigen(); }catch(e){ kToast('⚠️ '+e.message); } });
  const n=P.querySelector('#ogSneu'); if(n)n.onclick=()=>ogSchichtForm(null);
  P.querySelectorAll('[data-ogsed]').forEach(b=>b.onclick=()=>ogSchichtForm(b.dataset.ogsed));
}
function ogSchichtForm(id){ const x=id?OG.L.schichten.find(s=>s.id===id):{st:'',von:null,bis:null,p:2}; const t=v=>v?String(new Date(v).getHours()).padStart(2,'0')+':'+String(new Date(v).getMinutes()).padStart(2,'0'):'';
  const M=svModal(`<div class="og-form"><h2>${id?'Schicht ändern':'Neue Schicht'}</h2>
    <label class="og-fl">Station<input id="ogSs" maxlength="60" value="${ogE(x.st)}" placeholder="z.B. Grill" list="ogSsl"><datalist id="ogSsl">${['Aufbau','Kasse / Eintritt','Ausschank','Grill','Kaffee & Kuchen','Parkplatz / Ordner','Spülen / Theke','Abbau'].map(v=>`<option value="${v}">`).join('')}</datalist></label>
    <div class="og-zwei"><label class="og-fl">Von<input type="time" id="ogSv" value="${t(x.von)}"></label><label class="og-fl">Bis<input type="time" id="ogSb" value="${t(x.bis)}"></label></div>
    <label class="og-fl">Plätze<div class="og-seg">${[1,2,3,4].map(n=>`<button type="button" data-ogsp="${n}" class="${x.p===n?'on':''}">${n}</button>`).join('')}</div></label>
    <div class="btnrow sbact"><button class="btn" type="button" id="ogSsave">${SVI('check')} Speichern</button><button class="btn ghost" type="button" onclick="closeOverlay()">Abbrechen</button></div>
    ${id?`<div class="og-weg"><button type="button" class="btn ghost sm" id="ogSdel">${SVI('trash')} Schicht entfernen</button></div>`:''}</div>`);
  let pl=x.p; M.querySelectorAll('[data-ogsp]').forEach(b=>b.onclick=()=>{ pl=+b.dataset.ogsp; M.querySelectorAll('[data-ogsp]').forEach(y=>y.classList.toggle('on',y===b)); });
  M.querySelector('#ogSsave').onclick=async()=>{ try{ const R=await ogRpc('orga_schicht_aendern',{p_liste:OG.L.id,p_schicht:id,p:{st:M.querySelector('#ogSs').value,von:M.querySelector('#ogSv').value,bis:M.querySelector('#ogSb').value,p:String(pl)}});
    OG.L=Object.assign(OG.L,R); closeOverlay(); ogListeZeigen(); kToast('✓ Gespeichert'); }catch(e){ kToast('⚠️ '+e.message); } };
  const d=M.querySelector('#ogSdel'); if(d)d.onclick=async()=>{ if(!d.dataset.sicher){ d.dataset.sicher='1'; d.innerHTML=SVI('trash')+' Wirklich entfernen?'; d.classList.add('warn'); return; }
    try{ const R=await ogRpc('orga_schicht_aendern',{p_liste:OG.L.id,p_schicht:id,p:{weg:true}}); OG.L=Object.assign(OG.L,R); closeOverlay(); ogListeZeigen(); }catch(e){ kToast('⚠️ '+e.message); } };
}

/* ---------- Spieltag-Kassenabrechnung (F-06) ---------- */
function ogKasseKarte(L){ if(!(L.punkte||[]).some(p=>p.fo==='F-06'))return ''; const k=L.kasse;
  return `<div class="card og-kasse"><h3>💶 Kassenabrechnung</h3>${k?`<p class="og-ksum"><b>${ogEur(k.summe)}</b> an die Kasse abgeführt · Eintritt ${ogEur(k.a)}, Bewirtung ${ogEur(k.b)}, Ausgaben ${ogEur(k.c)}${k.zuschauer?` · ${k.zuschauer} Zuschauer`:''}</p>`:'<p class="note">Nach dem Spiel hier ausfüllen: Eintritt, Bewirtung, Ausgaben. Die App rechnet alles zusammen.</p>'}
    <button type="button" class="btn${k?' ghost':''}" id="ogKasseGo">${k?'Abrechnung ansehen':'Abrechnung ausfüllen'}</button></div>`; }
const ogEur=v=>(Math.round((+v||0)*100)/100).toLocaleString('de-DE',{style:'currency',currency:'EUR'});
const ogZahl=v=>{ const n=parseFloat(String(v==null?'':v).replace(',','.')); return isFinite(n)?n:0; };
async function ogKasse(){
  const L=OG.L; let K={}; try{ K=await ogRpc('orga_kasse',{p_liste:L.id}); }catch(e){ kToast('⚠️ '+e.message); return; }
  const D=K.daten||{}, A=D.a||[{k:'Erwachsene',anzahl:'',preis:''},{k:'Ermäßigt (Schüler, Studenten, Rentner)',anzahl:'',preis:''},{k:'Dauerkarten / Freikarten',anzahl:'',preis:0,nur:1}],
    B=D.b||['Getränke','Grill / Speisen','Kaffee & Kuchen','Sonstiges'].map(k=>({k,beginn:'',ende:''})), C=D.c||['Schiedsrichter (Spesen, Fahrtkosten)','Einkauf Bewirtung','Sonstiges'].map(k=>({k,beleg:'',betrag:''}));
  const M=svModal(`<div class="og-form og-kf"><h2>💶 Spieltag-Kassenabrechnung</h2><p class="note">${ogE(L.titel)} · ${ogE(ogTag(L.datum))}${L.zeit?' · '+ogE(L.zeit)+' Uhr':''}</p>
    <h3>A · Eintritt</h3>${A.map((x,i)=>`<div class="og-kr"><span>${ogE(x.k)}</span><input inputmode="numeric" data-oka="${i}" data-f="anzahl" value="${ogE(x.anzahl)}" placeholder="Anzahl">${x.nur?'<i></i>':`<input inputmode="decimal" data-oka="${i}" data-f="preis" value="${ogE(x.preis)}" placeholder="Preis €">`}<b data-okas="${i}"></b></div>`).join('')}
    <h3>B · Bewirtung</h3><div class="og-kh"><span></span><small>Kasse Beginn €</small><small>Kasse Ende €</small><small>Einnahme</small></div>${B.map((x,i)=>`<div class="og-kr"><span>${ogE(x.k)}</span><input inputmode="decimal" data-okb="${i}" data-f="beginn" value="${ogE(x.beginn)}" placeholder="Beginn €"><input inputmode="decimal" data-okb="${i}" data-f="ende" value="${ogE(x.ende)}" placeholder="Ende €"><b data-okbs="${i}"></b></div>`).join('')}
    <h3>C · Ausgaben aus der Kasse</h3>${C.map((x,i)=>`<div class="og-kr"><span>${ogE(x.k)}</span><input data-okc="${i}" data-f="beleg" value="${ogE(x.beleg)}" placeholder="Beleg / Empfänger"><input inputmode="decimal" data-okc="${i}" data-f="betrag" value="${ogE(x.betrag)}" placeholder="Betrag €"><i></i></div>`).join('')}
    <label class="og-fl">Bemerkungen (Besonderheiten, Differenzen)<input id="okBem" maxlength="500" value="${ogE(D.bem||'')}"></label>
    <div class="og-zwei"><label class="og-fl">Kassendienst<input id="okKd" maxlength="80" value="${ogE(D.kassendienst||'')}"></label><label class="og-fl">Übernommen (Kassier/in)<input id="okUe" maxlength="80" value="${ogE(D.uebernommen||'')}"></label></div>
    <div class="og-kend" id="okEnd"></div>
    <div class="btnrow sbact"><button class="btn" type="button" id="okSave">${SVI('check')} Speichern</button><button class="btn ghost" type="button" id="okPdf">${SVI('download')} Als PDF</button><button class="btn ghost" type="button" onclick="closeOverlay()">Schließen</button></div>
    ${K.at?`<p class="note small">Zuletzt gespeichert ${ogE(new Date(K.at).toLocaleString('de-DE'))}${K.von?' von '+ogE(K.von):''}</p>`:''}</div>`);
  const lesen=()=>{ M.querySelectorAll('[data-oka]').forEach(i=>A[+i.dataset.oka][i.dataset.f]=i.value); M.querySelectorAll('[data-okb]').forEach(i=>B[+i.dataset.okb][i.dataset.f]=i.value); M.querySelectorAll('[data-okc]').forEach(i=>C[+i.dataset.okc][i.dataset.f]=i.value); };
  const rechnen=()=>{ lesen(); let a=0,b=0,c=0,z=0; A.forEach((x,i)=>{ const s=ogZahl(x.anzahl)*ogZahl(x.preis); a+=s; z+=ogZahl(x.anzahl); const e=M.querySelector(`[data-okas="${i}"]`); if(e)e.textContent=x.nur?'':ogEur(s); });
    B.forEach((x,i)=>{ const s=ogZahl(x.ende)-ogZahl(x.beginn); b+=s; const e=M.querySelector(`[data-okbs="${i}"]`); if(e)e.textContent=ogEur(s); }); C.forEach(x=>c+=ogZahl(x.betrag));
    M.querySelector('#okEnd').innerHTML=`<div><span>A Eintritt${z?` (${z} Zuschauer)`:''}</span><b>${ogEur(a)}</b></div><div><span>B Bewirtung</span><b>${ogEur(b)}</b></div><div><span>− C Ausgaben</span><b>${ogEur(c)}</b></div><div class="sum"><span>Abgeführt an Kasse</span><b>${ogEur(a+b-c)}</b></div>`; return {a,b,c,z}; };
  M.querySelectorAll('input').forEach(i=>i.addEventListener('input',rechnen)); rechnen();
  const daten=()=>{ lesen(); return {a:A,b:B,c:C,bem:M.querySelector('#okBem').value,kassendienst:M.querySelector('#okKd').value,uebernommen:M.querySelector('#okUe').value}; };
  M.querySelector('#okSave').onclick=async()=>{ const b=M.querySelector('#okSave'); b.disabled=true;
    try{ await ogRpc('orga_kasse_speichern',{p_liste:L.id,p_daten:daten()}); kToast('✓ Abrechnung gespeichert'); closeOverlay(); await ogLaden(L.id); }catch(e){ b.disabled=false; kToast('⚠️ '+e.message); } };
  M.querySelector('#okPdf').onclick=()=>ogKassePdf(L,daten(),rechnen());
}
// PDF im Stil der Vereinsformulare (CI: SVM Marine #1D2760, BSC Orange #E8741F)
async function ogKassePdf(L,D,S){
  try{ await sxScript('vendor/jspdf.umd.min.js',()=>window.jspdf&&window.jspdf.jsPDF); }catch(e){ kToast('⚠️ PDF geht gerade nicht'); return; }
  const doc=new window.jspdf.jsPDF({unit:'pt',format:'a4'}), W=doc.internal.pageSize.getWidth(), X=48; let y=58;
  const marine=[29,39,96], orange=[232,116,31], grau=[91,91,102];
  doc.setFont('helvetica','bold'); doc.setTextColor(...marine); doc.setFontSize(22); doc.text('SPIELTAG-KASSENABRECHNUNG',W-X,y,{align:'right'});
  doc.setFontSize(8); doc.setTextColor(...grau); doc.text('HEIMSPIEL · EINTRITT & BEWIRTUNG',W-X,y+14,{align:'right'});
  doc.setFont('helvetica','bold'); doc.setFontSize(15); doc.setTextColor(...marine); doc.text('SV/BSC',X,y); doc.setFontSize(7); doc.setTextColor(...grau); doc.text('MÖRLENBACH · FUSSBALL',X,y+11);
  y+=26; doc.setDrawColor(...orange); doc.setLineWidth(2); doc.line(X,y,X+60,y); doc.setDrawColor(...marine); doc.setLineWidth(.6); doc.line(X+60,y,W-X,y);
  y+=24; doc.setFont('helvetica','normal'); doc.setFontSize(10); doc.setTextColor(28,28,34);
  doc.text('Datum: '+new Date(L.datum+'T12:00:00').toLocaleDateString('de-DE'),X,y); doc.text('Begegnung: '+L.titel,X+130,y); if(L.zeit)doc.text('Anstoß: '+L.zeit+' Uhr',W-X,y,{align:'right'});
  const kopf=t=>{ y+=28; doc.setFont('helvetica','bold'); doc.setFontSize(11); doc.setTextColor(...marine); doc.text(t,X,y); y+=6; doc.setDrawColor(...marine); doc.setLineWidth(.6); doc.line(X,y,W-X,y); doc.setFont('helvetica','normal'); doc.setFontSize(10); doc.setTextColor(28,28,34); };
  const zeile=(a,b,c,d)=>{ y+=18; doc.text(String(a),X,y); if(b!=null)doc.text(String(b),X+270,y,{align:'right'}); if(c!=null)doc.text(String(c),X+360,y,{align:'right'}); if(d!=null)doc.text(String(d),W-X,y,{align:'right'}); doc.setDrawColor(220,215,205); doc.setLineWidth(.4); doc.line(X,y+6,W-X,y+6); };
  kopf('A · EINTRITT'); D.a.forEach(x=>zeile(x.k,x.anzahl||'',x.nur?'':(x.preis!==''?ogEur(ogZahl(x.preis)):''),x.nur?'':ogEur(ogZahl(x.anzahl)*ogZahl(x.preis)))); doc.setFont('helvetica','bold'); zeile('Zuschauer gesamt / Summe Eintritt',S.z,null,ogEur(S.a)); doc.setFont('helvetica','normal');
  kopf('B · BEWIRTUNG'); D.b.forEach(x=>zeile(x.k,x.beginn!==''?ogEur(ogZahl(x.beginn)):'',x.ende!==''?ogEur(ogZahl(x.ende)):'',ogEur(ogZahl(x.ende)-ogZahl(x.beginn)))); doc.setFont('helvetica','bold'); zeile('Summe Bewirtung',null,null,ogEur(S.b)); doc.setFont('helvetica','normal');
  kopf('C · AUSGABEN AUS DER KASSE'); D.c.forEach(x=>zeile(x.k,null,x.beleg||'',x.betrag!==''?ogEur(ogZahl(x.betrag)):'')); doc.setFont('helvetica','bold'); zeile('Summe Ausgaben',null,null,ogEur(S.c)); doc.setFont('helvetica','normal');
  y+=34; doc.setDrawColor(...marine); doc.setLineWidth(1); doc.rect(W-X-220,y,220,92); const r=(t,v,b)=>{ y+=18; doc.setFont('helvetica',b?'bold':'normal'); doc.text(t,W-X-208,y); doc.text(v,W-X-12,y,{align:'right'}); };
  const y0=y; r('A Eintritt',ogEur(S.a)); r('B Bewirtung',ogEur(S.b)); r('− C Ausgaben',ogEur(S.c)); doc.setDrawColor(...orange); doc.line(W-X-208,y+6,W-X-12,y+6); y+=6; r('Abgeführt an Kasse',ogEur(S.a+S.b-S.c),true);
  doc.setFont('helvetica','normal'); doc.setFontSize(9); doc.setTextColor(...grau); doc.text('BEMERKUNGEN',X,y0+14); doc.setTextColor(28,28,34); doc.text(doc.splitTextToSize(D.bem||'',W-2*X-240),X,y0+30);
  y=y0+140; doc.setDrawColor(28,28,34); doc.setLineWidth(.5); doc.line(X,y,X+220,y); doc.line(W-X-220,y,W-X,y); doc.setFontSize(8); doc.setTextColor(...grau);
  doc.text('KASSENDIENST: '+(D.kassendienst||''),X,y+12); doc.text('ÜBERNOMMEN KASSIER/IN: '+(D.uebernommen||''),W-X-220,y+12);
  doc.text('SV MÖRLENBACH 1896 E.V. · ABTEILUNG FUSSBALL · SCHULSTRASSE 2 · 69509 MÖRLENBACH',X,812); doc.text('F-06 · digital aus der Sportzentrale',W-X,812,{align:'right'});
  const name='Kassenabrechnung-'+L.datum+'.pdf', blob=doc.output('blob');
  const M=svModal(`<div class="og-form"><h2>📄 ${ogE(name)}</h2><p class="note">Fertig. Du kannst die Abrechnung speichern, teilen oder direkt in den Vereins-Drive legen.</p>
    <div class="btnrow sbact"><a class="btn" id="okDl" href="#">${SVI('download')} Herunterladen</a>${OG.ue&&OG.ue.drive?`<button class="btn ghost" type="button" id="okDr">${SVI('upload')} In den Vereins-Drive</button>`:''}<button class="btn ghost" type="button" onclick="closeOverlay()">Schließen</button></div></div>`);
  const url=URL.createObjectURL(blob), dl=M.querySelector('#okDl'); dl.href=url; dl.download=name;
  const dr=M.querySelector('#okDr'); if(dr)dr.onclick=async()=>{ dr.disabled=true; try{ await ogHochladen(new File([blob],name,{type:'application/pdf'})); closeOverlay(); }catch(e){ dr.disabled=false; } };
}

/* ---------- Partner des Tages ---------- */
async function ogSotd(){ let P=[]; try{ P=await ogRpc('orga_partner'); }catch(e){}
  const M=svModal(`<div class="og-form"><h2>⭐ Partner des Tages</h2><p class="note">Laut Partnersheet gehören dazu: Matchday-Grafik mit Logo, Social-Media-Story, 4 Gästekarten, sichtbare Präsenz, Durchsage des Stadionsprechers und Nennung im Spielbericht. Die Aufgaben kommen automatisch auf die Liste.</p>
    <input id="ogSp" maxlength="120" placeholder="Name des Partners" list="ogSpl" value="${ogE(OG.L.sotd||'')}"><datalist id="ogSpl">${P.map(n=>`<option value="${ogE(n)}">`).join('')}</datalist>
    <div class="btnrow sbact"><button class="btn" type="button" id="ogSps">${SVI('check')} Übernehmen</button>${OG.L.sotd?'<button class="btn ghost" type="button" id="ogSpx">Entfernen</button>':''}<button class="btn ghost" type="button" onclick="closeOverlay()">Abbrechen</button></div></div>`);
  const go=async v=>{ try{ await ogRpc('orga_liste_aendern',{p_id:OG.L.id,p:{sotd:v}}); closeOverlay(); await ogLaden(OG.L.id); kToast(v?'✓ Partner des Tages eingetragen':'✓ Entfernt'); }catch(e){ kToast('⚠️ '+e.message); } };
  M.querySelector('#ogSps').onclick=()=>{ const v=M.querySelector('#ogSp').value.trim(); if(v.length<2){ kToast('⚠️ Bitte einen Namen eintragen'); return; } go(v); };
  const x=M.querySelector('#ogSpx'); if(x)x.onclick=()=>go(''); }

/* ---------- Wichtige Nummern, Formulare, Zuständigkeiten ---------- */
function ogNummernHtml(L){ const N=(L.nummern||[]);
  return `<div class="card og-num"><h3>📞 Wichtige Nummern</h3><div class="og-nl"><a href="tel:112"><span>Notruf</span><b>112</b></a><a href="tel:110"><span>Polizei</span><b>110</b></a>
    ${N.map(n=>n.tel?`<a href="tel:${ogE(n.tel.replace(/[^0-9+]/g,''))}"><span>${ogE(n.t)}${n.n?' · '+ogE(n.n):''}</span><b>${ogE(n.tel)}</b></a>`:`<div><span>${ogE(n.t)}${n.n?' · '+ogE(n.n):''}</span><i>Nummer fehlt</i></div>`).join('')}</div></div>`; }
function ogFormHtml(art){ const F=OG_FORM_ART[art]||[]; if(!F.length)return '';
  return `<div class="card og-forms"><h3>📄 Passende Formulare</h3>${F.map(k=>`<a href="${ogE(ogFormUrl(k))}" target="_blank" rel="noopener" class="og-fz"><b>${ogE(k)}</b><span>${ogE(OG_FORM[k][0])}</span><small>${ogE(OG_FORM[k][1])}</small></a>`).join('')}</div>`; }
function ogFormulare(){
  const M=svModal(`<div class="og-form"><h2>📄 Formulare des Vereins</h2><p class="note">Stand 09/2026. Zum Ansehen, Ausdrucken oder Weiterleiten. Die Formularmappe kannst du am PC direkt ausfüllen. Schichtplan und Kassenabrechnung gehen auch direkt in der App.</p>
    <div class="og-fl2">${Object.keys(OG_FORM).map(k=>`<a href="${ogE(ogFormUrl(k))}" target="_blank" rel="noopener" class="og-fz"><b>${ogE(k)}</b><span>${ogE(OG_FORM[k][0])}</span><small>${ogE(OG_FORM[k][1])}</small></a>`).join('')}</div>
    ${svRole()==='admin'?`<div class="og-fdrive"><p class="note small">${OG.ue&&OG.ue.drive?'Alle Formulare und das Partnersheet mit einem Tipp in den Vereins-Drive legen, Ordner „00 Logo & Vorlagen“ und „04 Partner“. Alte Stände werden dabei ersetzt.':'Sobald der Vereins-Drive verbunden ist, kannst du hier alle Formulare mit einem Tipp dort ablegen.'}</p>
      ${OG.ue&&OG.ue.drive?`<button type="button" class="btn ghost sm" id="ogFzD">${SVI('upload')} Alle in den Vereins-Drive</button>`:`<button type="button" class="btn ghost sm" id="ogFzV">${SVI('upload')} Vereins-Drive verbinden</button>`}<p class="note small" id="ogFzM"></p></div>`:''}</div>`);
  const d=M.querySelector('#ogFzD'); if(d)d.onclick=()=>ogFormInDrive(d,M.querySelector('#ogFzM'));
  const v=M.querySelector('#ogFzV'); if(v)v.onclick=()=>{ closeOverlay(); ogDriveSetup(); }; }
async function ogB64(url){ const r=await fetch(url,{cache:'no-store'}); if(!r.ok)throw new Error('Datei fehlt: '+url.split('/').pop());
  const b=new Uint8Array(await r.arrayBuffer()); let s=''; for(let i=0;i<b.length;i+=0x8000)s+=String.fromCharCode.apply(null,b.subarray(i,i+0x8000)); return btoa(s); }
async function ogVorlageInDrive(url,name){ const data=await ogB64(url);
  const {data:r,error}=await SVB.sb.functions.invoke('orga-datei',{body:{ablage:'vorlagen',name,mime:'application/pdf',data}});
  if(error||!r||!r.ok)throw new Error(r&&r.error==='drive-fehlt'?'Der Vereins-Drive ist noch nicht verbunden.':(r&&r.error)||(error&&error.message)||'Ablage hat nicht geklappt'); return r; }
async function ogFormInDrive(btn,msg){ const K=Object.keys(OG_FORM).map(k=>[ogFormUrl(k),OG_FORM[k][2],OG_FORM[k][0]]).concat([['formulare/Partnersheet-2027-28.pdf','Partnersheet-2027-28.pdf','Partnersheet 2027/28']]); btn.disabled=true; let n=0, link=null;
  try{ for(const [u,f,t] of K){ msg.textContent=`Lege ab … ${n+1} von ${K.length}: ${t}`; const r=await ogVorlageInDrive(u,f); if(!/^Partnersheet/.test(f))link=r.ordner_link||link; n++; }
    msg.innerHTML=`✓ ${n} Dateien liegen im Vereins-Drive (Formulare und Partnersheet).`+(link?` <a href="${ogE(link)}" target="_blank" rel="noopener">Ordner öffnen</a>`:''); kToast('✓ Formulare im Vereins-Drive'); }
  catch(e){ msg.textContent='⚠️ '+e.message+(n?` (${n} geschafft)`:''); btn.disabled=false; } }
async function ogRollen(){ let R; try{ R=await ogRpc('orga_rollen'); }catch(e){ kToast('⚠️ '+e.message); return; }
  const M=svModal(`<div class="og-form"><h2>${SVI('users')} Zuständigkeiten</h2><p class="note">Aus dem Abteilungskonzept: jede Aufgabe hat einen Namen. Neue Checklisten tragen die Zuständigen automatisch ein. Mehrere Namen mit Komma trennen. Nummern mit Haken erscheinen unter „Wichtige Nummern“.</p>
    ${R.map((r,i)=>`<div class="og-rolle"><b>${ogE(r.titel)}</b><input data-ogrn="${i}" maxlength="160" value="${ogE(r.namen||'')}" placeholder="Name"><input data-ogrt="${i}" maxlength="40" inputmode="tel" value="${ogE(r.tel||'')}" placeholder="${r.nummer?'Telefon (wichtige Nummer)':'Telefon (optional)'}"></div>`).join('')}
    <div class="btnrow sbact"><button class="btn" type="button" id="ogRs">${SVI('check')} Speichern</button><button class="btn ghost" type="button" onclick="closeOverlay()">Abbrechen</button></div></div>`);
  M.querySelector('#ogRs').onclick=async()=>{ const P=R.map((r,i)=>({key:r.key,namen:M.querySelector(`[data-ogrn="${i}"]`).value,tel:M.querySelector(`[data-ogrt="${i}"]`).value}));
    try{ await ogRpc('orga_rollen_speichern',{p:P}); kToast('✓ Zuständigkeiten gespeichert'); closeOverlay(); }catch(e){ kToast('⚠️ '+e.message); } }; }

/* ---------- Start: Übersicht-Karte, Termine, Meldungen ---------- */
async function ogHome(){
  const home=document.getElementById('panel-home'); if(!home||!svTabAllowed('orga'))return;
  let U; try{ U=await ogRpc('orga_uebersicht',{p_tage:10}); }catch(e){ return; } OG.ue=OG.ue||U;
  const h=ogHeute(), L=(U.listen||[]).filter(l=>l.datum>=h).slice(0,3), meine=(U.listen||[]).reduce((a,l)=>a+(l.meine||0),0);
  let box=document.getElementById('ogHome');
  if(!L.length){ if(box)box.remove(); return; }
  if(!box){ box=document.createElement('div'); box.id='ogHome'; box.className='card og-home'; const k=document.getElementById('kalHome')||document.getElementById('svrMeine')||document.getElementById('svCockpit'); if(k)k.after(box); else home.prepend(box); }
  box.innerHTML=`<div class="kal-hh"><h3 class="trh">${SVI('check')} Aufgaben${meine?` <em class="og-mein">${meine} für dich</em>`:''}</h3><button type="button" class="btn ghost sm" id="ogAlle">Alle ${SVI('chev')}</button></div>
    ${L.map(l=>`<button type="button" class="og-hz" data-ogl="${ogE(l.id)}"><span class="og-em">${(OG_ART[l.art]||OG_ART.sonstiges)[0]}</span><span><b>${ogE(l.titel)}</b><small>${ogE(ogTag(l.datum))} · ${l.fertig} von ${l.n} erledigt</small></span>${ogRing(l.fertig,l.n)}</button>`).join('')}`;
  box.querySelector('#ogAlle').onclick=()=>goTab('orga');
  box.querySelectorAll('[data-ogl]').forEach(b=>b.onclick=()=>ogOeffnen(b.dataset.ogl));
}
{ const _rh=renderHome; renderHome=function(){ const r=_rh.apply(this,arguments); try{ setTimeout(ogHome,300); }catch(e){} return r; }; }

// Termine: Heimspiel oder Veranstaltung antippen → „Checkliste“
function ogBezug(i){ if(!i)return null;
  if(i.k==='spiel'&&i.heim===true&&(i.m==='h1'||i.m==='h2'))return 'spiel:'+i.m+':'+i.d;
  if(i.k==='spiel'&&i.heim===true&&/^tt:[0-9a-f-]{36}$/.test(String(i.id)))return String(i.id);
  if(i.k==='event'&&/^[0-9a-f-]{36}$/.test(String(i.id)))return 'event:'+i.id; return null; }
{ const _kd=kalDetail; kalDetail=function(id){ const r=_kd.apply(this,arguments);
    try{ const i=kalItem(id), bz=ogBezug(i); const row=document.querySelector('#modal .kal-akt');
      if(bz&&row&&(svDarf('orga')!==false||(i.m&&svDarf('team:'+i.m)))){ const b=document.createElement('button'); b.type='button'; b.className='btn og-kalbtn'; b.innerHTML=SVI('check')+' Checkliste';
        b.onclick=async()=>{ b.disabled=true; try{ const lid=await ogRpc('orga_liste_fuer',{p_bezug:bz,p_art:null,p_titel:i.k==='spiel'?'Heimspiel '+(i.m==='h1'?'Erste':i.m==='h2'?'Zweite':'')+' gegen '+(i.gegner||'?'):null,p_datum:null,p_zeit:i.z||null,p_team:null,p_ort:null});
          closeOverlay(); ogOeffnen(lid); }catch(x){ b.disabled=false; kToast('⚠️ '+x.message); } };
        row.prepend(b); } }catch(e){} return r; }; }

// Push-Nachricht „Morgen: …“ oder „Um 13:30 Uhr: …“ öffnet direkt die Checkliste
SVZ_ART.orga=['✅','Aufgaben'];
{ const _zi=svzInhalt; svzInhalt=async function(m){ const x=await _zi.apply(this,arguments);
    if(m&&m.art==='orga'&&(m.data||{}).liste)x.knopf=`<button class="btn sv32-go" type="button" data-svzorga="${ogE(m.data.liste)}">${SVI('check')} <span>Checkliste öffnen</span></button>`;
    return x; }; }
{ const _mz=svMeldungZeigen; svMeldungZeigen=async function(){ const r=await _mz.apply(this,arguments);
    try{ document.querySelectorAll('#modal [data-svzorga]').forEach(b=>b.onclick=()=>{ closeOverlay(); setTimeout(()=>ogOeffnen(b.dataset.svzorga),60); }); }catch(e){} return r; }; }

/* ---------- 0.32: Vereins-Drive auch im Admin-Bereich, gut sichtbar ---------- */
async function ogDriveKarte(P){
  if(!P||svRole()!=='admin')return;
  let S=null; try{ S=await ogRpc('orga_drive_setup',{p_url:null}); }catch(e){ return; }
  const el=document.createElement('div'); el.className='card og-dkarte'+(S.verbunden?' ok':''); el.id='ogDriveKarte';
  el.innerHTML=`<div class="adm-head"><div><h3 style="margin:0;display:flex;gap:8px;align-items:center">📁 Vereins-Drive</h3>
      <p style="margin:6px 0 0;font-size:13.5px">${S.verbunden?`<b>✓ Verbunden.</b> Fotos, Belege und Kassenabrechnungen aus den Checklisten landen sortiert im Ordner „SV BSC Mörlenbach Fußball“.${S.geprueft_at?' Zuletzt geprüft '+ogE(new Date(S.geprueft_at).toLocaleString('de-DE',{day:'2-digit',month:'2-digit',hour:'2-digit',minute:'2-digit'}))+'.':''}`
        :'<b>Noch nicht verbunden.</b> Einmalig etwa fünf Minuten, am besten am Computer mit dem Vereinskonto. Danach landen Fotos und Dateien aus den Checklisten automatisch sortiert im Google Drive des Vereins.'}</p></div>
      <button class="btn${S.verbunden?' ghost':''}" type="button" id="ogDkGo">${SVI('upload')} ${S.verbunden?'Verbindung ändern':'Jetzt verbinden'}</button></div>
    ${S.verbunden?`<div class="btnrow"><button class="btn ghost sm" type="button" id="ogDkT">${SVI('check')} Verbindung testen</button><button class="btn ghost sm" type="button" id="ogDkF">📄 Formulare und Partnersheet in den Drive</button></div><p class="note small" id="ogDkM"></p>`:''}`;
  const old=P.querySelector('#ogDriveKarte'); if(old)old.replaceWith(el); else { const d=P.querySelector('#svData'); if(d&&d.nextSibling)P.insertBefore(el,d.nextSibling); else P.appendChild(el); }
  el.querySelector('#ogDkGo').onclick=()=>ogDriveSetup();
  const t=el.querySelector('#ogDkT'); if(t)t.onclick=async()=>{ const m=el.querySelector('#ogDkM'); m.textContent='Teste die Verbindung …';
    const {data,error}=await SVB.sb.functions.invoke('orga-datei',{body:{test:true}}); if(error||!data||!data.ok){ m.textContent='⚠️ '+((data&&data.error)||(error&&error.message)||'Test fehlgeschlagen'); return; }
    m.innerHTML='✓ Verbindung klappt.'+(data.ordner_link?` <a href="${ogE(data.ordner_link)}" target="_blank" rel="noopener">Ordner ansehen</a>`:''); };
  const f=el.querySelector('#ogDkF'); if(f)f.onclick=()=>ogFormInDrive(f,el.querySelector('#ogDkM'));
