    const w=peVertretungWerte(M); if(!w)return;
    let g=null; try{ g=await svtRpc('partner_vertrag_annehmen',{p_vertrag:v.id,p_unterzeichner:w.wer,p_funktion:w.fkt}); }catch(e){ kToast('⚠️ '+(e.message||e)); return; }
    await peNachUnterschrift(g,v,f,'Angenommen');
  },'Speichert …'); }

// ---------- Nicht annehmen: unterschrieben, aber noch nicht gegengezeichnet. Plätze werden frei, eine Mail geht nur nach Freigabe hier im Blatt raus. ----------
function peAblehnen(v){ if(!v)return; const f=peFirma(v.sponsor), x=((typeof SPO!=='undefined'&&SPO.S)||[]).find(s=>s.id===v.sponsor)||{};
  const gruss=typeof paAnrede==='function'?paAnrede(x.anrede,x.ansprechpartner):'Hallo,', wer=(typeof SVU!=='undefined'&&SVU.name)||'';
  const vor=`${gruss}\n\ndanke für euer Interesse und deine Unterschrift für den Partnervertrag ${v.nr}. Leider können wir das Angebot dieses Mal nicht annehmen. Der Vertrag kommt deshalb nicht zustande, und für euch entstehen keine Kosten.\n\nWir würden gern in Kontakt bleiben. Bei Fragen antworte einfach auf diese Mail.\n\nViele Grüße\n${wer}`.trim();
  const M=svModal(`<div class="og-form pe-form pa-blatt"><div class="pa-bk"><h2>Nicht annehmen</h2><button type="button" class="pa-bx" onclick="closeOverlay()">Abbrechen</button></div>
    <p>Vertrag <b>${peE(v.nr)}</b> von <b>${peE(f)}</b>. Der Vertrag kommt nicht zustande, die Plätze werden frei.</p>
    <label class="pe-f"><span>Grund (bleibt intern)</span><input id="peAbG" maxlength="300" placeholder="z. B. Branche passt nicht zum Verein"></label>
    <label class="pe-sw2"><input type="checkbox" id="peAbM"> Freundliche Mail an ${peE(f)} schicken</label>
    <div id="peAbW" hidden><label class="pe-f"><span>Mail an die Firma</span><textarea id="peAbT" rows="9" maxlength="4000">${peE(vor)}</textarea></label>
      <p class="note small">Die Mail geht erst raus, wenn du unten bestätigst. Ohne Haken geht keine Mail raus.</p></div>
    <div class="btnrow sbact"><button class="btn" type="button" id="peAbOk">Nicht annehmen und Plätze freigeben</button></div></div>`);
  const cb=M.querySelector('#peAbM'), w=M.querySelector('#peAbW'); cb.onchange=()=>{ w.hidden=!cb.checked; };
  const ok=M.querySelector('#peAbOk'); ok.onclick=()=>paEinmal(ok,async()=>{ const g=M.querySelector('#peAbG').value.trim();
    if(g.length<3){ kToast('Bitte kurz den Grund eintragen (bleibt intern).'); return; }
    const mitMail=cb.checked, text=M.querySelector('#peAbT').value.trim();
    if(mitMail&&text.length<20){ kToast('Bitte einen kurzen Text für die Mail schreiben.'); return; }
    try{ await svtRpc('partner_vertrag_ablehnen',{p_vertrag:v.id,p_grund:g}); }catch(e){ kToast('⚠️ '+(e.message||e)); return; }
    let mail=null; if(mitMail){ try{ const {data,error}=await SVB.sb.functions.invoke('partner-deck',{body:{absage:v.id,text}}); if(error)throw error; mail=data; }catch(e){ mail={ok:false,fehler:e.message||String(e)}; } }
    closeOverlay(); await peNeu();
    kToast(!mitMail?'Nicht angenommen, die Plätze sind frei. Es ging keine Mail raus.':mail&&mail.ok?'Nicht angenommen, die Plätze sind frei. '+f+' bekommt die Mail.':'Nicht angenommen, die Plätze sind frei. Die Mail ging nicht raus'+(mail&&mail.fehler?': '+mail.fehler:'')+'.');
  },'Speichert …'); }


// ---------- Laufzeit eintragen (Bestand) oder Vertrag von Hand ----------
// Auswahl der Firma: nichts vorausgewählt, zuerst Partner ohne Laufzeit, dann die übrigen Partner, dann der Rest
function peLsOptionen(sponsor){ const D=PE.d, mitV=new Set(D.vertraege.filter(v=>['unterschrieben','aktiv'].includes(v.status)).map(v=>v.sponsor));
  const P=D.partner.filter(p=>p.status==='partner'), ohne=P.filter(p=>!mitV.has(p.id)), mit=P.filter(p=>mitV.has(p.id)), rest=D.partner.filter(p=>p.status!=='partner');
  const o=p=>`<option value="${peE(p.id)}"${p.id===sponsor?' selected':''}>${peE(p.firma)}</option>`, g=(t,L)=>L.length?`<optgroup label="${peE(t)}">${L.map(o).join('')}</optgroup>`:'';
  return `<option value=""${sponsor?'':' selected'}>Bitte wählen</option>${g('Partner ohne Laufzeit',ohne)}${g('Partner',mit)}${g('Weitere Firmen',rest)}`; }
function peLaufzeitForm(sponsor,vor){
  const D=PE.d, L=D.leistungen.filter(l=>l.aktiv&&l.art!=='spende'), jug=D.mannschaften.filter(m=>m.art==='jugend');
  const sb=D.saison, ende0=String(+sb.slice(0,4)+1)+'-06-30', aj=sponsor?peAusJahr(sponsor):null, ende=aj&&aj>=+sb.slice(0,4)+1?aj+'-06-30':ende0;
  const M=svModal(`<div class="og-form pe-form pa-blatt"><div class="pa-bk"><h2>Laufzeit eintragen</h2><button type="button" class="pa-bx" id="peLx0">Abbrechen</button></div>
    <label class="pe-f"><span>Partner</span><select id="peLs">${peLsOptionen(sponsor)}</select></label>
    <div class="pe-f"><span>Was ist gebucht?</span><div class="pe-wahl" id="peLw">${L.map(l=>`<label class="pe-chip"><input type="checkbox" value="${peE(l.key)}"><span>${peE(l.titel)}</span></label>`).join('')}</div></div>
    <div id="peLx"></div>
    <div class="pe-2"><label class="pe-f"><span>Beginn</span><input type="date" id="peLb" value="${peE(sb)}"></label><label class="pe-f"><span>Ende</span><input type="date" id="peLe" value="${peE(ende)}"></label></div>
    <p class="note small" id="peLaj"${aj&&ende!==ende0?'':' hidden'}>Laut Ausrüstung bis ${peE(aj||'')}. Ende ist schon so eingetragen.</p>
    <label class="pe-sw2"><input type="checkbox" id="peLa"> Verlängert sich automatisch, wenn niemand kündigt</label>
    <p class="note">Trag den Betrag je Saison so ein, wie er im alten Vertrag steht. Die App zieht davon nichts ab. Rechnungen schreibt sie ab der laufenden Saison. Für Saisons, die schon vorbei sind, schreibt sie keine, da bleibt alles, wie es ist. An die Verlängerung erinnert sie dich rechtzeitig.</p>
    <div class="btnrow sbact"><button class="btn" type="button" id="peLok">Speichern</button><button class="btn ghost" type="button" id="peLno">Abbrechen</button></div></div>`);
  const zeig=()=>{ const sel=[...M.querySelectorAll('#peLw input:checked')].map(i=>D.leistungen.find(l=>l.key===i.value));
    M.querySelector('#peLx').innerHTML=sel.map(l=>`<div class="pe-zeile" data-k="${peE(l.key)}"><b>${peE(l.titel)}</b>
      ${l.je_mannschaft?`<select data-m aria-label="Mannschaft für ${peE(l.titel)}">${jug.map(m=>`<option value="${peE(m.id)}">${peE(m.kurz||m.name)}</option>`).join('')}</select>`:''}
      <input type="number" min="0" step="1" data-p placeholder="${l.preis!=null?peE(l.preis):'Betrag'}" aria-label="Betrag je Saison für ${peE(l.titel)}, wie er im Vertrag steht"></div>`).join('')+(sel.length?'<p class="note small">Betrag je Saison, wie er im Vertrag steht. Leer heißt Katalogpreis.</p>':''); };
  M.querySelectorAll('#peLw input').forEach(i=>i.onchange=zeig);
  if(vor&&vor.key){ const i=M.querySelector(`#peLw input[value="${CSS.escape(vor.key)}"]`); if(i){ i.checked=true; zeig(); const m=M.querySelector(`#peLx [data-k="${CSS.escape(vor.key)}"] [data-m]`); if(m&&vor.mannschaft)m.value=vor.mannschaft; } }
  M.querySelector('#peLno').onclick=()=>closeOverlay(); M.querySelector('#peLx0').onclick=()=>closeOverlay();
  M.querySelector('#peLs').onchange=e=>{ const j=peAusJahr(e.target.value), n=M.querySelector('#peLaj'); if(j&&j>=+sb.slice(0,4)+1){ M.querySelector('#peLe').value=j+'-06-30'; n.textContent='Laut Ausrüstung bis '+j+'. Ende ist schon so eingetragen.'; n.hidden=false; } else n.hidden=true; };
  const ok=M.querySelector('#peLok'); ok.onclick=()=>paEinmal(ok,async()=>{ const pos=[...M.querySelectorAll('#peLx .pe-zeile')].map(z=>{ const o={key:z.dataset.k}; const m=z.querySelector('[data-m]'); if(m)o.mannschaft=m.value; const p=z.querySelector('[data-p]').value; if(p!==''){ o.preis=+p; o.fest=true; } return o; });
    if(!M.querySelector('#peLs').value){ kToast('Bitte die Firma wählen'); return; }
    if(!pos.length){ kToast('Bitte mindestens eine Leistung wählen'); return; }
    const b=M.querySelector('#peLb').value, e=M.querySelector('#peLe').value; if(!b||!e||e<b){ kToast('Bitte Beginn und Ende prüfen'); return; }
    const yb=+b.slice(0,4)+(+b.slice(5,7)>=7?0:-1), ye=+e.slice(0,4)+(+e.slice(5,7)>=7?0:-1), saisons=Math.max(1,Math.min(5,ye-yb+1));   // Saisons 1.7. bis 30.6., ohne Millisekunden-Rechnung
    try{ await svtRpc('partner_vertrag_speichern',{p:{sponsor:M.querySelector('#peLs').value,positionen:pos,saisons,beginn:b,ende:e,auto_verlaengerung:M.querySelector('#peLa').checked,status:'aktiv',quelle:'bestand'}});
      closeOverlay(); kToast('✓ Laufzeit gespeichert'); const a=PE.d.aufgaben.filter(x=>x.art==='laufzeit'&&x.sponsor===M.querySelector('#peLs').value);
      for(const x of a){ try{ await svtRpc('partner_aufgabe_erledigen',{p_id:x.id,p_antwort:'eingetragen',p_status:'erledigt',p_neu:null}); }catch(_){} }
      await peNeu(); }catch(err){ kToast('⚠️ '+(err.message||err)); } },'Speichert …');
}

// ---------- Belegung ----------
function peBelegt(key,mann,tag){ const t=tag||svtHeute(); return PE.d.belegung.filter(b=>b.leistung===key&&(b.mannschaft||'')===(mann||'')&&b.von<=t&&(!b.bis||b.bis>=t)&&b.status!=='angeboten'); }
function peBelegung(H){
  const D=PE.d, jug=D.mannschaften.filter(m=>m.art==='jugend'), L=D.leistungen.filter(l=>l.aktiv&&!['spende','sonstiges'].includes(l.art));
  const W=k=>D.warteliste.filter(w=>w.leistung===k);
  const angeb=(key,mann)=>{ const t=svtHeute(); return PE.d.belegung.filter(b=>b.leistung===key&&(b.mannschaft||'')===(mann||'')&&b.status==='angeboten'&&b.von<=t&&(!b.bis||b.bis>=t)).reduce((a,b)=>a+(b.menge||1),0); };
  const zeile=l=>{ const B=peBelegt(l.key), n=B.reduce((a,b)=>a+(b.menge||1),0), max=l.plaetze, w=W(l.key).length, ang=angeb(l.key,null);
    const bald=B.filter(b=>b.bis&&peTage(b.bis)<=180).length;
    return `<button type="button" class="pe-bz" data-pel="${peE(l.key)}"><div><b>${peE(l.titel)}</b><small>${l.preis!=null?peEur(l.preis)+' '+peE(PLIB.EINHEIT[l.einheit]||''):''}${l.vorschlag?' · <i class="pe-vs">Vorschlag</i>':''}${l.vorrecht?` · Vorrecht ${peE(l.vorrecht)}`:''}</small>
      ${B.length?`<span class="pe-wer">${B.slice(0,4).map(b=>`${peE(peFirma(b.sponsor)||'reserviert')}${b.status==='vorrecht'?' (Vorrecht)':''}${b.bis?' bis '+peDat(b.bis):''}`).join(' · ')}${B.length>4?' · …':''}</span>`:''}</div>
      <div class="pe-bz-r">${max!=null?`<span class="pe-bar" style="--p:${Math.min(100,Math.round(n/max*100))}%"></span><small>${n} von ${max}${ang?`, ${ang} im Angebot`:''}</small>`:`<small>${n} gebucht${ang?`, ${ang} im Angebot`:''}</small>`}
        ${w?`<em class="pe-w">${w} warten</em>`:''}${bald?`<em class="pe-b">${bald} läuft aus</em>`:''}</div></button>`; };
  const je=L.filter(l=>l.je_mannschaft);
  const raster=`<div class="pe-raster-w"><table class="pe-raster"><thead><tr><th scope="col">Mannschaft</th>${je.map(l=>`<th scope="col">${peE(l.titel.replace(/ Jugend$/,''))}</th>`).join('')}</tr></thead><tbody>
    ${jug.map(m=>`<tr><th scope="row">${peE(m.kurz||m.name)}</th>${je.map(l=>{ const B=peBelegt(l.key,m.id), w=D.warteliste.filter(x=>x.leistung===l.key&&x.mannschaft===m.id).length, b=B[0];
      return `<td><button type="button" class="pe-zelle ${b?(b.status==='vorrecht'?'vr':'voll'):'frei'}" data-pel="${peE(l.key)}" data-pem="${peE(m.id)}" aria-label="${peE(l.titel+' '+(m.kurz||m.name)+': '+(b?peFirma(b.sponsor)||'reserviert':'frei'))}">${b?peE((peFirma(b.sponsor)||'reserviert').slice(0,14)):'frei'}${w?`<i>${w}</i>`:''}</button></td>`; }).join('')}</tr>`).join('')}</tbody></table></div>`;
  const grp=(k,t)=>{ const X=L.filter(l=>l.bereich===k&&!l.je_mannschaft); return X.length?`<h3 class="pe-h">${peE(t)}</h3><div class="pe-liste">${X.map(zeile).join('')}</div>`:''; };
  H.innerHTML=`${grp('verein','Pakete und Verein')}${grp('erste','1. Mannschaft')}${grp('zweite','2. Mannschaft')}
    <h3 class="pe-h">Jugend je Mannschaft</h3>${raster}${grp('jugend','Jugend')}${grp('events','Events')}`;
  H.querySelectorAll('[data-pel]').forEach(b=>b.onclick=()=>peFlaeche(b.dataset.pel,b.dataset.pem||null));
}
// Belegung eines offenen Angebots oder laufenden Vertrags: nicht hier freigeben, sondern dort ablehnen oder beenden (der Server lehnt es auch ab)
function peFlVertrag(b){ const v=b.vertrag&&(PE.d.vertraege||[]).find(x=>x.id===b.vertrag);
  if(v&&v.status==='angebot')return `<small class="pe-vtg">gehört zu Angebot ${peE(v.nr)}, dort ablehnen</small>`;
  if(v&&['unterschrieben','aktiv'].includes(v.status))return `<small class="pe-vtg">gehört zu Vertrag ${peE(v.nr)}, dort beenden</small>`;
  return `<button type="button" class="btn ghost sm" data-peb="weg" data-id="${b.id}">Freigeben</button>`; }
function peFlaeche(key,mann){
  const D=PE.d, l=peL(key), B=PE.d.belegung.filter(b=>b.leistung===key&&(b.mannschaft||'')===(mann||'')&&(!b.bis||b.bis>=svtHeute())), W=D.warteliste.filter(w=>w.leistung===key&&(w.mannschaft||'')===(mann||''));
  const vrH=D.partner.filter(p=>p.vorrecht), vr=D.partner.find(p=>l.vorrecht&&p.firma.toLowerCase().includes(String(l.vorrecht).toLowerCase()))||(vrH.length===1?vrH[0]:null);
  const M=svModal(`<div class="og-form pe-form"><h2>${peE(l.titel)}${mann?' · '+peE(peM(mann)):''}</h2><p>${peE(l.kurz||'')}</p>
    <h4>Belegt</h4>${B.length?B.map(b=>`<div class="pe-bl"><div><b>${peE(peFirma(b.sponsor)||'reserviert')}</b><small>${b.status==='vorrecht'?`Vorrecht bis ${peDat(b.vorrecht_bis)}`:b.status==='angeboten'?'im Angebot':b.status==='reserviert'?'reserviert':'belegt'} · ${peDat(b.von)}${b.bis?' bis '+peDat(b.bis):''}</small></div>
      <div class="btnrow">${!b.vertrag&&(b.status==='vorrecht'||b.status==='reserviert')?`<button type="button" class="btn sm" data-peb="ja" data-id="${b.id}">Übernimmt</button>`:''}${peFlVertrag(b)}</div></div>`).join(''):'<p class="note">Frei.</p>'}
    <h4>Warteliste</h4>${W.length?W.map(w=>`<div class="pe-bl"><div><b>${peE(peFirma(w.sponsor))}</b><small>seit ${peDat(w.seit)}${w.notiz?' · '+peE(w.notiz):''}</small></div><button type="button" class="btn ghost sm" data-pew="${w.id}">Entfernen</button></div>`).join(''):'<p class="note">Niemand wartet.</p>'}
    <h4>Neu</h4><label class="pe-f"><span>Partner</span><select id="peFs"><option value="">bitte wählen</option>${D.partner.map(p=>`<option value="${peE(p.id)}">${peE(p.firma)}</option>`).join('')}</select></label>
    <div class="pe-2"><label class="pe-f"><span>Von</span><input type="date" id="peFv" value="${peE(svtHeute())}"></label><label class="pe-f"><span>Bis</span><input type="date" id="peFb" value="${peE(String(+PE.d.saison.slice(0,4)+1)+'-06-30')}"></label></div>
    <div class="btnrow sbact">${l.vorrecht&&vr?`<button type="button" class="btn" id="peFvr">${peE(vr?vr.firma:l.vorrecht)} fragen (${l.vorrecht_tage||7} Tage)</button>`:''}<button type="button" class="btn${l.vorrecht&&vr?' ghost':''}" id="peFok">Belegen</button><button type="button" class="btn ghost" id="peFw">Auf Warteliste</button><button type="button" class="btn ghost" id="peFno">Schließen</button></div></div>`);
  const s=()=>M.querySelector('#peFs').value;
  M.querySelectorAll('[data-peb]').forEach(b=>b.onclick=async()=>{
    if(b.dataset.peb==='ja'){ closeOverlay();   // derselbe Weg wie die Frage unter Heute: belegt bis Saisonende, Frage erledigt, dann die Laufzeit
      try{ const r=await svtRpc('partner_vorrecht_uebernehmen_belegung',{p_belegung:b.dataset.id}); kToast('✓ Übernommen, belegt bis '+peDat(r&&r.bis)); await peNeu();
        if(PE.d.darf_vertrag&&r)peLaufzeitForm(r.sponsor,{key:r.leistung,mannschaft:r.mannschaft}); }catch(e){ kToast('⚠️ '+(e.message||e)); } return; }
    // Freigeben erst nach Bestätigung hier im Blatt (kein confirm), danach mit Rückgängig
    if(b.dataset.sure!=='1'){ b.dataset.sure='1'; b.classList.remove('ghost'); b.textContent='Wirklich freigeben? Der Platz ist danach frei.'; return; }
    const alt=PE.d.belegung.find(x=>x.id===b.dataset.id); closeOverlay();
    // Rückgängig nur für einfache Belegungen: ein Vorrecht käme mit neuer Frist zurück, die gelöschten Fragen nicht
    const zurueck=alt&&!alt.vertrag&&alt.status!=='vorrecht'&&alt.status!=='reserviert';
    try{ await svtRpc('partner_belegung_loeschen',{p_id:b.dataset.id}); await peNeu();
      if(!zurueck){ kToast('Freigegeben'); return; }
      kToast('Freigegeben','Rückgängig',async()=>{ if(!alt)return; try{ await peRpc('partner_belegen',{p:{leistung:alt.leistung,mannschaft:alt.mannschaft,sponsor:alt.sponsor,vertrag:alt.vertrag,von:alt.von,bis:alt.bis,status:alt.status,menge:alt.menge,notiz:alt.notiz}},'Wieder belegt'); }catch(e){} }); }
    catch(e){ kToast('⚠️ '+(e.message||e)); } });
  M.querySelectorAll('[data-pew]').forEach(b=>b.onclick=async()=>{
    if(b.dataset.sure!=='1'){ b.dataset.sure='1'; b.classList.remove('ghost'); b.textContent='Wirklich entfernen? Der Platz in der Reihe geht verloren.'; return; }
    closeOverlay(); const id=b.dataset.pew;
    try{ await svtRpc('partner_warteliste_setzen',{p:{id,status:'zurueckgezogen'}}); await peNeu();
      kToast('Von der Warteliste genommen','Rückgängig',async()=>{ try{ await peRpc('partner_warteliste_setzen',{p:{id,status:'wartet'}},'Wieder auf der Warteliste, an alter Stelle'); }catch(e){} }); }
    catch(e){ kToast('⚠️ '+(e.message||e)); } });
  M.querySelector('#peFno').onclick=()=>closeOverlay();
  const vrb=M.querySelector('#peFvr'); if(vrb)vrb.onclick=async()=>{ closeOverlay(); await peRpc('partner_belegen',{p:{leistung:key,mannschaft:mann,sponsor:vr.id,status:'vorrecht',bis:String(+PE.d.saison.slice(0,4)+1)+'-06-30'}},`${vr.firma} hat jetzt ${l.vorrecht_tage||7} Tage Vorrecht. Die App erinnert.`); };
  M.querySelector('#peFok').onclick=async()=>{ if(!s()){ kToast('Bitte Partner wählen'); return; } closeOverlay(); await peRpc('partner_belegen',{p:{leistung:key,mannschaft:mann,sponsor:s(),von:M.querySelector('#peFv').value,bis:M.querySelector('#peFb').value,status:'belegt'}},'✓ Belegt'); };
  M.querySelector('#peFw').onclick=async()=>{ if(!s()){ kToast('Bitte Partner wählen'); return; } closeOverlay(); await peRpc('partner_warteliste_setzen',{p:{leistung:key,mannschaft:mann,sponsor:s()}},'✓ Auf der Warteliste. Wird die Fläche frei, meldet sich die App.'); };
}

// ---------- Laufzeiten ----------
function peLaufzeiten(H){
  const D=PE.d, V=D.vertraege.filter(v=>v.art!=='spende'&&['angebot','unterschrieben','aktiv'].includes(v.status)).sort((a,b)=>(a.ende||'9')<(b.ende||'9')?-1:1);
  const ohne=D.partner.filter(p=>p.status==='partner'&&!D.vertraege.some(v=>v.sponsor===p.id&&['unterschrieben','aktiv'].includes(v.status)));
  const dv=!!D.darf_vertrag;
  H.innerHTML=`${dv?`<div class="btnrow" style="margin-bottom:12px"><button type="button" class="btn" id="peLneu">${SVI('plus')} Laufzeit eintragen</button></div>`:`<p class="pe-hinw">${PE_NUR_LEITUNG}</p>`}
    ${ohne.length?`<div class="card pe-hin"><b>${ohne.length} Partner ohne Laufzeit in der App</b><p>${ohne.slice(0,12).map(p=>dv?`<button type="button" class="pe-link" data-pelz="${peE(p.id)}">${peE(p.firma)}</button>`:peE(p.firma)).join(', ')}${ohne.length>12?' …':''}</p></div>`:''}
    <div class="pe-liste">${V.map(v=>{ const t=v.ende?peTage(v.ende):null, mon=t!=null?Math.round(t/30.4):null;
      return `<div class="pe-lz ${v.status==='angebot'?'ang':t!=null&&t<0?'ab':t!=null&&t<=183?'rot':t!=null&&t<=365?'gelb':''}"><div><b>${peE(peFirma(v.sponsor))}</b><small>${peE(v.nr)} · ${peE((v.positionen||[]).map(p=>p.titel+(p.mannschaft?' '+peM(p.mannschaft):'')).join(', '))}</small></div>
        <div class="pe-lz-r">${v.status==='angebot'?`<span>Angebot vom ${peDat(v.erstellt_am)}</span>`:v.ende?`<span>bis ${peDat(v.ende)}</span><small>${t<0?'abgelaufen':mon<=1?'unter 1 Monat':'noch '+mon+' Monate'}</small>`:'<span>offen</span>'}
          <i class="pe-vst v-${peE(v.status==='unterschrieben'?'wartet':v.verlaengerung)}">${peE(v.status==='angebot'?'Angebot':v.status==='unterschrieben'?'wartet auf eure Unterschrift':PE_VST[v.verlaengerung]||v.verlaengerung)}</i><strong>${peEur(v.netto_jahr||v.netto_gesamt)}${v.netto_jahr?' / Saison':''}</strong></div></div>`; }).join('')||'<div class="card"><div class="empty">Noch keine Verträge mit Laufzeit. Oben eintragen, dann erinnert dich die App rechtzeitig.</div></div>'}</div>`;
  const ln=H.querySelector('#peLneu'); if(ln)ln.onclick=()=>peLaufzeitForm(null);
  H.querySelectorAll('[data-pelz]').forEach(b=>b.onclick=()=>peLaufzeitForm(b.dataset.pelz));
}

// ---------- Rechnungen ----------
function peRechnungen(H){
  const D=PE.d, R=D.rechnungen.slice().sort((a,b)=>(a.status==='offen')===(b.status==='offen')?(a.datum<b.datum?1:-1):a.status==='offen'?-1:1), vd=D.verein||{};
  H.innerHTML=`${vd.iban?'':`<div class="card pe-hin"><b>Bankverbindung fehlt</b><p>Für Girocode und Rechnung bitte unter Vereinsdaten IBAN und Kontoinhaber eintragen.</p></div>`}
    <div class="pe-liste">${R.map(r=>`<div class="pe-re ${peE(r.status)}"><div><b>${peE(r.empfaenger&&r.empfaenger.firma||peFirma(r.sponsor))}</b><small>${peE(r.nr)} · ${peDat(r.datum)}${r.status==='offen'?` · fällig ${peDat(r.faellig)}`:r.bezahlt_am?` · bezahlt ${peDat(r.bezahlt_am)}`:''}${r.art==='spende'?' · Spende':''}${r.mail&&r.mail.ok?` · per Mail raus am ${peDat(String(r.mail.at||'').slice(0,10))}`:''}</small></div>
      <div class="pe-re-r"><strong>${peEur(r.brutto,true)}</strong><div class="btnrow"><button type="button" class="btn ghost sm" data-perp="${r.id}">${SVI('download')} PDF</button>
      ${r.status==='offen'&&r.art==='rechnung'&&peReMail(r)?`<button type="button" class="btn ghost sm" data-perm="${r.id}">${SVI('mail')} ${r.mail&&r.mail.ok?'Erneut schicken':'Per Mail schicken'}</button>`:''}${r.status==='offen'?`<button type="button" class="btn sm" data-perb="${r.id}">Bezahlt</button>`:''}${r.art==='spende'&&r.quittung==='offen'&&r.status==='bezahlt'?(peGem()?`<button type="button" class="btn ghost sm" data-perq="${r.id}">Bestätigung erstellt</button>`:'<small class="pe-hinw">Gemeinnützigkeit noch offen, Bestätigung erst nach Klärung</small>'):''}</div></div></div>`).join('')||'<div class="card"><div class="empty">Noch keine Rechnungen. Sie entstehen beim Abschluss im Termin oder über den Link.</div></div>'}</div>`;
  H.querySelectorAll('[data-perp]').forEach(b=>b.onclick=()=>peRechnungPdf(R.find(x=>x.id===b.dataset.perp)));
  H.querySelectorAll('[data-perm]').forEach(b=>b.onclick=()=>paEinmal(b,()=>peRechnungMail(b.dataset.perm),'Schickt …'));
  H.querySelectorAll('[data-perb]').forEach(b=>b.onclick=async()=>{ const r=await peDatumFrage('Bezahlt am?','Tag des Zahlungseingangs.'); if(r)await peRpc('partner_rechnung_bezahlt',{p_id:b.dataset.perb,p_datum:r.d,p_bezahlt:true},'✓ Verbucht'); });
  H.querySelectorAll('[data-perq]').forEach(b=>b.onclick=()=>peRpc('partner_quittung_erstellt',{p_id:b.dataset.perq},'✓ Notiert'));
}
// ---------- Rechnungsmonat (seit 0.99.81) ----------
// Adresse, an die eine Rechnung per Mail geht: aus dem Vertrag, sonst von der Firma. Leer heißt: PDF selbst schicken.
function peReMail(r,v){ if(!r)return ''; v=v||(PE.d.vertraege||[]).find(x=>x.id===r.vertrag)||{};
  const s=typeof SPO!=='undefined'&&SPO.S?SPO.S.find(x=>x.id===r.sponsor):null, m=String((r.empfaenger&&r.empfaenger.email)||(v.partner_daten&&v.partner_daten.email)||(s&&s.email)||'').trim();
  return /^[^@\s]+@[^@\s]+\.[a-z]{2,}$/i.test(m)?m:''; }
// „im August 2027“, wenn im Vertrag ein Rechnungsmonat steht und der Rechnungstag der ersten Saison noch vor uns liegt, sonst leer
function peRgWann(v){ const m=+(v&&v.rechnung_monat); if(!(m>=1&&m<=12)||!(+v.netto_jahr>0)||!v.beginn)return ''; const t=PLIB.rechnungTag(m,String(v.beginn).slice(0,10));
  return t>svtHeute()?'im '+PLIB.MONATE[+t.slice(5,7)-1]+' '+t.slice(0,4):''; }
function peRgSatz(v){ const w=peRgWann(v); return w?'Danach geht er mit beiden Unterschriften per Mail raus. Die Rechnung legt die App '+w+' an und erinnert euch vorher.':'Danach geht er mit beiden Unterschriften und der ersten Rechnung per Mail raus.'; }
// Ein Tipp: die Rechnung als PDF per Mail an die Firma (partner-deck), Kopie an den Verein
async function peRechnungMail(id){ const r=(PE.d.rechnungen||[]).find(x=>x.id===id); if(!r)return;
  try{ const {data,error}=await SVB.sb.functions.invoke('partner-deck',{body:{rechnung:id}}); if(error)throw error;
    kToast(data&&data.ok?'✓ Rechnung '+r.nr+' ist per Mail raus'+(data.an?' an '+data.an:''):'⚠️ '+((data&&data.fehler)||'Die Mail ging nicht raus')); await peNeu(); }
  catch(e){ kToast('⚠️ '+(e.message||e)); } }
async function peRechnungPdf(R){ if(!R)return;
  try{ await sxScript('vendor/jspdf.umd.min.js',()=>window.jspdf&&window.jspdf.jsPDF); const doc=PLIB.rechnungPdf(window.jspdf.jsPDF,R,PE.d.verein||{});
    spoDownload(doc.output('blob'),R.nr+'.pdf'); }catch(e){ kToast('⚠️ PDF geht gerade nicht: '+(e.message||e)); } }

// ---------- Katalog ----------
function peKatalog(H,zusatz=false){
  const D=PE.d, liste=zusatz?D.leistungen.filter(l=>l.art!=='paket'):D.leistungen, vs=liste.filter(l=>l.vorschlag&&l.aktiv).length, darf=!!D.darf_team;
  H.innerHTML=`<div class="btnrow" style="margin-bottom:12px">${darf?`<button type="button" class="btn" id="peKneu">${SVI('plus')} Neue Leistung</button>${vs?`<span class="note">${vs} Preise sind noch Vorschläge. Antippen, prüfen, freigeben.</span>`:''}`:'<span class="note">Preise ändert die Abteilungsleitung. Antippen zeigt die Einzelheiten.</span>'}</div>
    ${Object.entries(PLIB.BEREICHE).map(([k,t])=>{ const X=liste.filter(l=>l.bereich===k); return X.length?`<h3 class="pe-h">${peE(t)}</h3><div class="pe-liste">${X.map(l=>`<button type="button" class="pe-bz${l.aktiv?'':' aus'}" data-pek="${peE(l.key)}"><div><b>${peE(l.titel)}</b><small>${peE(l.kurz||'')}</small></div>
      <div class="pe-bz-r"><strong>${l.preis!=null?peEur(l.preis):'frei'}</strong><small>${peE(PLIB.EINHEIT[l.einheit]||'')}${l.plaetze!=null?' · '+l.plaetze+' Plätze'+(l.je_mannschaft?' je Mannschaft':''):''}</small>${l.vorschlag?'<em class="pe-vs">Vorschlag</em>':''}${l.aktiv?'':'<em>aus</em>'}</div></button>`).join('')}</div>`:''; }).join('')}`;
  const kn=H.querySelector('#peKneu'); if(kn)kn.onclick=()=>peLeistungForm(null,zusatz);
  H.querySelectorAll('[data-pek]').forEach(b=>b.onclick=()=>peLeistungForm(b.dataset.pek));
}
function peLeistungForm(key,zusatz=false){
  const l=key?peL(key):{key:'',titel:'',bereich:'verein',art:'flaeche',einheit:'saison',ziele:[],aktiv:true,oeffentlich:!zusatz,vorschlag:zusatz}, darf=!!(PE.d&&PE.d.darf_team);
  const sel=(id,o,v)=>`<select id="${id}">${Object.entries(o).map(([k,t])=>`<option value="${k}"${k===v?' selected':''}>${peE(t)}</option>`).join('')}</select>`;
  const M=svModal(`<div class="og-form pe-form pa-blatt"><div class="pa-bk"><h2>${key?peE(l.titel):'Neue Leistung'}</h2><button type="button" class="pa-bx" id="peKx0">${darf?'Abbrechen':'Schließen'}</button></div>${darf?'':'<p class="note">Preise ändert die Abteilungsleitung.</p>'}
    ${key?'':`<label class="pe-f"><span>Kurzname (klein, ohne Leerzeichen)</span><input id="peKk" maxlength="40" pattern="[a-z0-9_]+"></label>`}
    <label class="pe-f"><span>Titel</span><input id="peKt" maxlength="80" value="${peE(l.titel)}"></label>
    <label class="pe-f"><span>Ein Satz</span><input id="peKs" maxlength="200" value="${peE(l.kurz||'')}"></label>
    <label class="pe-f"><span>Beschreibung</span><textarea id="peKx" rows="3" maxlength="1500">${peE(l.text||'')}</textarea></label>
    <div class="pe-2"><label class="pe-f"><span>Bereich</span>${sel('peKb',PLIB.BEREICHE,l.bereich)}</label><label class="pe-f"><span>Art</span>${sel('peKa',{...(zusatz?{}:{paket:'Paket'}),flaeche:'Fläche',patenschaft:'Patenschaft',event:'Event',spende:'Spende',sonstiges:'Sonstiges'},l.art)}</label></div>
    <div class="pe-2"><label class="pe-f"><span>Preis netto (€)</span><input type="number" id="peKp" min="0" step="1" value="${l.preis!=null?peE(l.preis):''}"></label><label class="pe-f"><span>Einheit</span>${sel('peKe',{saison:'je Saison',einmalig:'einmalig',spieltag:'je Spieltag',stueck:'je Stück',frei:'frei'},l.einheit)}</label></div>
    <div class="pe-2"><label class="pe-f"><span>Plätze (leer = unbegrenzt)</span><input type="number" id="peKpl" min="0" value="${l.plaetze!=null?peE(l.plaetze):''}"></label><label class="pe-f"><span>Vorrecht (z. B. Basakci)</span><input id="peKv" maxlength="80" value="${peE(l.vorrecht||'')}"></label></div>
    <div class="pe-f"><span>Wofür steht es? (steuert die Präsentation)</span><div class="pe-wahl">${Object.entries(PLIB.ZIELE).map(([k,t])=>`<label class="pe-chip"><input type="checkbox" value="${k}"${(l.ziele||[]).includes(k)?' checked':''}><span>${peE(t)}</span></label>`).join('')}</div></div>
    <label class="pe-sw2"><input type="checkbox" id="peKj"${l.je_mannschaft?' checked':''}> Je Jugendmannschaft</label>
    <label class="pe-sw2"><input type="checkbox" id="peKo"${l.oeffentlich?' checked':''}> In der Präsentation zeigen</label>
    <label class="pe-sw2"><input type="checkbox" id="peKfrei"${l.vorschlag?'':' checked'}> Preis ist freigegeben</label>
    <label class="pe-sw2"><input type="checkbox" id="peKak"${l.aktiv?' checked':''}> Aktiv</label>
    <div class="btnrow sbact">${darf?'<button class="btn" type="button" id="peKok">Speichern</button>':''}<button class="btn ghost" type="button" id="peKno">${darf?'Abbrechen':'Schließen'}</button></div></div>`);
  M.querySelector('#peKno').onclick=()=>closeOverlay(); M.querySelector('#peKx0').onclick=()=>closeOverlay();
  if(!darf){ M.querySelectorAll('input,select,textarea').forEach(i=>i.disabled=true); return; }
  const kok=M.querySelector('#peKok'); kok.onclick=()=>paEinmal(kok,async()=>{ const k=key||M.querySelector('#peKk').value.trim(); if(!/^[a-z0-9_]{2,40}$/.test(k)){ kToast('Kurzname: klein, ohne Leerzeichen'); return; }
    if(!key&&PE.d.leistungen.some(x=>x.key===k)){ kToast(`Den Kurznamen „${k}“ gibt es schon. Bitte einen anderen wählen.`); return; }
    const p={key:k,titel:M.querySelector('#peKt').value.trim(),kurz:M.querySelector('#peKs').value.trim(),text:M.querySelector('#peKx').value.trim(),bereich:M.querySelector('#peKb').value,art:M.querySelector('#peKa').value,
      preis:M.querySelector('#peKp').value,einheit:M.querySelector('#peKe').value,plaetze:M.querySelector('#peKpl').value,vorrecht:M.querySelector('#peKv').value,
      ziele:[...M.querySelectorAll('.pe-wahl input:checked')].map(i=>i.value),je_mannschaft:M.querySelector('#peKj').checked,oeffentlich:M.querySelector('#peKo').checked,
      vorschlag:!M.querySelector('#peKfrei').checked,aktiv:M.querySelector('#peKak').checked,neu:!key};
    if(!p.titel){ kToast('Bitte einen Titel'); return; }
    try{ await svtRpc('partner_leistung_speichern',{p}); }catch(e){ kToast('⚠️ '+(e.message||e)); return; }   // bei Fehler bleibt das Blatt mit allen Eingaben offen
    closeOverlay(); kToast('✓ Gespeichert'); await peNeu(); },'Speichert …');
}

// ---------- Team ----------
async function peTeam(H){
  H.innerHTML='<div class="card"><div class="empty">Lade …</div></div>';
  let T=[]; try{ T=await svtRpc('partner_team',{}); }catch(e){ H.innerHTML=`<div class="card"><div class="empty">${peE(e.message)}</div></div>`; return; }
  const darf=PE.d.darf_team;
  H.innerHTML=`<p class="note">Die Abteilungsleitung ist immer im Partner-Team. ${darf?'Weitere Personen hier freischalten: Sie sehen den Partnerbereich, schreiben Firmen an und bereiten Angebote vor. Verträge annehmen, gegenzeichnen und verlängern kann nur, wer den Verein vertreten darf. Bankdaten von Partnern sehen sie nicht.':'Freischalten kann die Abteilungsleitung.'}</p>
    <div class="ht-liste pe-team">${T.map(p=>`<div class="pe-tz"><div><b>${peE(p.name)}</b><small>${p.fest?'Abteilungsleitung':p.im_team?'Partner-Team':'nicht im Team'}</small></div>
      ${p.fest?'<span class="pe-fest">immer dabei</span>':darf?`<label class="pe-sw3"><input type="checkbox" data-pet="${peE(p.id)}"${p.im_team?' checked':''} aria-label="${peE(p.name)} im Partner-Team"><span></span></label>`:p.im_team?'<span class="pe-fest">im Team</span>':''}</div>`).join('')}</div>`;
  // Wer den Verein vertreten darf (Vorstand nach § 26 BGB oder mit Vollmacht): setzen nur Admins, nicht über die Rolle in der App
  const ichAdmin=(T.find(p=>p.id===PE.d.ich)||{}).rolle==='admin';
  H.insertAdjacentHTML('beforeend',`<h3 class="pe-h">Vertritt den Verein</h3><p class="note">Gegenzeichnen und Annehmen darf nur, wer hier eingetragen ist. ${ichAdmin?'Eintragen nur, wenn die Person laut Vereinsregister im Vorstand nach § 26 BGB ist oder eine Vollmacht des Vorstands hat.':'Eintragen können die Admins.'}</p>
    <div class="ht-liste pe-team">${T.filter(p=>p.im_team).map(p=>`<div class="pe-tz"><div><b>${peE(p.name)}</b><small>${p.vertritt?peE(p.v_art==='vollmacht'?'mit Vollmacht':'Vorstand nach § 26 BGB')+(p.v_funktion?' · '+peE(p.v_funktion):''):'vertritt den Verein nicht'}</small></div>
      ${ichAdmin?`<label class="pe-sw3"><input type="checkbox" data-pevt="${peE(p.id)}"${p.vertritt?' checked':''} aria-label="${peE(p.name)} vertretungsberechtigt"><span></span></label>`:p.vertritt?'<span class="pe-fest">vertretungsberechtigt</span>':''}</div>`).join('')}</div>`);
  H.querySelectorAll('[data-pevt]').forEach(i=>i.onchange=async()=>{ let art='vorstand', fkt=null;
    if(i.checked){ const r=await peVertretungFrage((T.find(p=>p.id===i.dataset.pevt)||{}).name); if(!r){ i.checked=false; return; } art=r.art; fkt=r.fkt; }
    try{ await svtRpc('partner_vertretung_setzen',{p_user:i.dataset.pevt,p_an:i.checked,p_art:art,p_funktion:fkt}); kToast(i.checked?'✓ Vertritt den Verein':'Vertritt den Verein nicht mehr'); await peLaden(true); peTeam(H); }catch(e){ kToast('⚠️ '+e.message); i.checked=!i.checked; } });
  H.querySelectorAll('[data-pet]').forEach(i=>i.onchange=async()=>{ try{ await svtRpc('partner_team_setzen',{p_user:i.dataset.pet,p_an:i.checked}); kToast(i.checked?'✓ Im Partner-Team':'Aus dem Partner-Team genommen'); peTeam(H); }catch(e){ kToast('⚠️ '+e.message); i.checked=!i.checked; } });
}

function peVertretungFrage(name){ return new Promise(res=>{ let fertig=false; const ende=v=>{ if(fertig)return; fertig=true; res(v); };
  const M=svModal(`<div class="og-form pe-form pa-blatt"><div class="pa-bk"><h2>Vertritt den Verein</h2><button type="button" class="pa-bx" id="peVx">Abbrechen</button></div>
    <p>${peE(name||'')} darf dann für den Verein gegenzeichnen und annehmen.</p>
    <label class="pe-f"><span>Grundlage</span><select id="peVa"><option value="vorstand">Vorstand nach § 26 BGB (im Vereinsregister)</option><option value="vollmacht">mit Vollmacht des Vorstands</option></select></label>
    <label class="pe-f"><span>Funktion (steht unter der Unterschrift)</span><input id="peVf" maxlength="120" placeholder="z. B. 1. Vorsitzender"></label>
    <div class="btnrow sbact"><button class="btn" type="button" id="peVok">Eintragen</button></div></div>`);
  M.querySelector('#peVx').onclick=()=>{ ende(null); closeOverlay(); };
  M.querySelector('#peVok').onclick=()=>{ const fkt=M.querySelector('#peVf').value.trim(); if(fkt.length<3){ kToast('Bitte die Funktion eintragen.'); return; } ende({art:M.querySelector('#peVa').value,fkt}); closeOverlay(); };
  peBeimSchliessen(()=>ende(null)); }); }

// ---------- Vereinsdaten (Bank, Steuer) ----------
function peVerein(H){
  const v=PE.d.verein||{}, darf=PE.d.darf_team, g=v.gemeinnuetzig===true||v.gemeinnuetzig==='true'?'true':v.gemeinnuetzig===false||v.gemeinnuetzig==='false'?'false':'';
  const f=(k,t,typ,h)=>`<label class="pe-f"><span>${peE(t)}</span><input id="peV_${k}" ${typ?`type="${typ}"`:''} value="${peE(v[k]==null?'':v[k])}" ${darf?'':'disabled'} ${h||''}></label>`;
  H.innerHTML=`<div class="card pe-form"><h3>Für Rechnungen und Girocode</h3>
    ${f('kontoinhaber','Kontoinhaber','', 'maxlength="70" placeholder="'+peE(v.name||'')+'"')}${f('iban','IBAN','','maxlength="34" autocomplete="off"')}
    <div class="pe-2">${f('bic','BIC','','maxlength="11"')}${f('bank','Bank','','maxlength="60"')}</div>
    <div class="pe-2">${f('steuernr','Steuernummer','','maxlength="30"')}${f('ustid','USt-IdNr.','','maxlength="20"')}</div>
    <div class="pe-2"><label class="pe-f"><span>Umsatzsteuer auf Partnerleistungen</span><select id="peV_ust_satz" ${darf?'':'disabled'}>${['19','7','0'].map(x=>`<option value="${x}"${String(v.ust_satz==null?19:v.ust_satz)===x?' selected':''}>${x} %</option>`).join('')}</select></label>
      <label class="pe-f"><span>Gemeinnützig (Spendenquittungen)</span><select id="peV_gemeinnuetzig" ${darf?'':'disabled'}><option value=""${g===''?' selected':''}>Noch offen</option><option value="true"${g==='true'?' selected':''}>Ja, Freistellungsbescheid liegt vor</option><option value="false"${g==='false'?' selected':''}>Nein</option></select></label></div>
    <div class="pe-2">${f('finanzamt','Finanzamt','','maxlength="60"')}${f('freistellung_datum','Freistellungsbescheid vom','date')}</div>
    <p class="note">Die Umsatzsteuer gilt für Leistungen mit Gegenleistung (Werbung). Spenden ohne Gegenleistung laufen ohne Umsatzsteuer. Im Zweifel mit dem Steuerberater des Vereins klären.</p>
    <h3>Für Verträge</h3>
    <div class="pe-2">${f('name','Verein','','maxlength="120"')}${f('abteilung','Abteilung','','maxlength="80"')}</div>
    <div class="pe-2">${f('strasse','Straße','','maxlength="120"')}${f('ort','PLZ, Ort','','maxlength="80"')}</div>
    <div class="pe-2">${f('register','Registergericht','','maxlength="120"')}${f('email','E-Mail','email','maxlength="120"')}</div>
    <div class="pe-2">${f('vertreter','Vertreten durch','','maxlength="80"')}${f('vertreter_funktion','Funktion','','maxlength="80"')}</div>
    ${f('glaeubiger_id','Gläubiger-ID (SEPA)','','maxlength="35" autocomplete="off"')}
    <h3>Vertretung laut Satzung</h3>
    <label class="pe-f"><span>Wer vertritt den Verein?</span><select id="peV_vertretung" ${darf?'':'disabled'}><option value=""${!v.vertretung?' selected':''}>XX (bitte aus der Satzung eintragen)</option><option value="einzeln"${v.vertretung==='einzeln'?' selected':''}>Eine Person aus dem Vorstand allein</option><option value="zwei"${v.vertretung==='zwei'?' selected':''}>Zwei aus dem Vorstand gemeinsam</option><option value="zwei_vorsitz"${v.vertretung==='zwei_vorsitz'?' selected':''}>Zwei gemeinsam, eine davon Vorsitz</option></select></label>
    <label class="pe-f"><span>Hinterlegte Vollmacht (freiwillig)</span><textarea id="peV_vollmacht" rows="2" maxlength="500" ${darf?'':'disabled'} placeholder="z. B. Vollmacht des Vorstands vom … für die Abteilungsleitung, Partnerverträge allein zu schließen">${peE(v.vollmacht||'')}</textarea></label>
    <p class="note">Gegenzeichnen dürfen nur Personen, die unter Team als vertretungsberechtigt eingetragen sind. Bei „zwei gemeinsam“ braucht jeder Vertrag zwei Unterschriften, außer jemand unterschreibt mit der hier hinterlegten Vollmacht.</p>
    <h3>Für das Impressum</h3>${String(v.vorstand||'').trim()?'':'<p class="pe-rot" role="alert">Für das Impressum fehlen die Namen des Vorstands. Ohne sie verschickt die App keine Links zur Präsentation.</p>'}
    <div class="pe-2">${f('vorstand','Vorstand (vertretungsberechtigt)','','maxlength="160" placeholder="Namen nach § 26 BGB"')}${f('telefon','Telefon','tel','maxlength="40"')}</div>
    <p class="note">Beides steht im Impressum der Partner-Präsentation. Vorstand: wer den Verein nach § 26 BGB vertritt, so wie im Vereinsregister.</p>
    <h3>Für die Präsentation</h3>
    <div class="pe-2">${f('heimspiele','Heimspiele je Saison','number','min="0" max="999" step="1" inputmode="numeric"')}${f('zuschauer','Zuschauer im Schnitt (eure Schätzung)','number','min="0" max="99999" step="1" inputmode="numeric"')}</div>
    <div class="pe-2">${f('jugend','Kinder und Jugendliche im Verein','number','min="0" max="9999" step="1" inputmode="numeric"')}</div>
    <p class="note">Diese Zahlen erscheinen in der Präsentation bei den Firmen, die gesehen werden wollen. Leer lassen, dann steht dort nichts dazu.</p>
    <div class="pe-2">${f('whatsapp','WhatsApp-Nummer für Partner (freiwillig)','tel','maxlength="40" placeholder="z. B. 0170 1234567"')}</div>
    <p class="note">Steht hier eine Handynummer, bekommt der Ansprechpartner in der Präsentation einen WhatsApp-Knopf. Leer lassen, dann gibt es nur Anrufen und Mail.</p>
    ${darf?`<div class="btnrow"><button type="button" class="btn" id="peVok">Speichern</button></div>`:'<p class="note">Ändern kann die Abteilungsleitung.</p>'}</div>`;
  const b=H.querySelector('#peVok'); if(b)b.onclick=()=>paEinmal(b,async()=>{ const p={};
    ['kontoinhaber','iban','bic','bank','steuernr','ustid','ust_satz','finanzamt','freistellung_datum','name','abteilung','strasse','ort','register','email','vertreter','vertreter_funktion','glaeubiger_id','heimspiele','zuschauer','jugend','vorstand','telefon','whatsapp','vertretung','vollmacht'].forEach(k=>{ p[k]=H.querySelector('#peV_'+k).value.trim(); });
    const gw=H.querySelector('#peV_gemeinnuetzig').value; p.gemeinnuetzig=gw===''?null:gw==='true';   // „Noch offen“ bleibt offen
    if(p.iban&&!spoIbanOk(p.iban)){ kToast('Die IBAN stimmt noch nicht. Bitte jede Ziffer prüfen.'); return; }
    try{ await peRpc('partner_vereinsdaten_setzen',{p},'✓ Gespeichert'); }catch(e){} },'Speichert …');
}

// ---------- Mitteilungen vom Wächter öffnen die Steuerung ----------
if(typeof svzInhalt==='function'){ const _zi=svzInhalt; svzInhalt=async function(m){ const x=await _zi.apply(this,arguments);
  try{ const d=(m&&m.data)||{}; if(d.partner_aufgabe)x.knopf=`<button class="btn sv32-go" type="button" data-svzpe="1">${SVI('heart')} <span>In der Partner-Steuerung öffnen</span></button>`; }catch(e){} return x; }; }
if(typeof svMeldungZeigen==='function'){ const _mz=svMeldungZeigen; svMeldungZeigen=async function(){ const r=await _mz.apply(this,arguments);
  try{ document.querySelectorAll('#modal [data-svzpe]').forEach(b=>b.onclick=()=>{ closeOverlay(); SPO.view='steuerung'; PE.v='heute'; PE.d=null; goTab('sponsoring'); }); }catch(e){} return r; }; }

// Gemeinsame Vorbereitung im Partnerteam. Veröffentlichung und Preise bleiben im Leistungskatalog bei der Leitung.
const PE_PLANSTAND={idee:'Idee',abstimmung:'In Abstimmung',abgestimmt:'Intern abgestimmt',archiv:'Archiviert'};
async function peBausteine(B){
  const karte=document.createElement('section'); karte.className='card';
  karte.innerHTML='<h2>Bausteine</h2><p class="note" role="status">Bausteine werden geladen …</p>';
  B.replaceChildren(karte);
  const [planung,katalog]=await Promise.allSettled([svtRpc('partner_bausteinplanung_laden',{}),peLaden()]);
  if(!karte.isConnected || SPO.view!=='bausteine')return;
  karte.innerHTML='<div class="btnrow"><h2 style="margin:0 auto 0 0">Bausteine</h2><button type="button" class="btn sm" id="pePlanNeu">Projekt anlegen</button></div><p class="note">Hier stimmt ihr Bedarf und Leistungen im Partnerteam ab. Die Entwürfe sind nur im Verein sichtbar.</p><div id="pePlanListe"></div>';
  const liste=karte.querySelector('#pePlanListe'), leistungen=katalog.value?.leistungen || [];
  if(planung.status==='fulfilled'){
    const aktiv=planung.value.filter(p=>p.stand!=='archiv'), archiv=planung.value.filter(p=>p.stand==='archiv');
    const zeilen=arr=>arr.map(p=>{
      const l=leistungen.find(x=>x.key===p.leistung);
      return '<button type="button" class="pe-bz" data-plan-id="'+peE(p.id)+'"><span><b>'+peE(p.titel)+'</b><small>'+peE(p.notiz)+'</small></span><span class="pe-bz-r"><b>'+peE(PE_PLANSTAND[p.stand])+'</b>'+(l?'<small>'+peE(l.titel)+'</small>':'')+'</span></button>';
    }).join('');
    liste.innerHTML='<div class="pe-liste">'+(zeilen(aktiv)||'<p class="note">Noch keine Projekte angelegt.</p>')+'</div>'+(archiv.length?'<details><summary>Archiv ('+archiv.length+')</summary><div class="pe-liste">'+zeilen(archiv)+'</div></details>':'');
    liste.querySelectorAll('[data-plan-id]').forEach(b=>{b.onclick=()=>pePlanForm(planung.value.find(p=>p.id===b.dataset.planId),leistungen,B);});
    karte.querySelector('#pePlanNeu').onclick=()=>pePlanForm(null,leistungen,B);
  }else{
    karte.querySelector('#pePlanNeu').hidden=true;
    liste.innerHTML='<p role="alert">Die Projekte konnten nicht geladen werden.</p><button type="button" class="btn sm ghost">Erneut laden</button>';
    liste.querySelector('button').onclick=()=>peBausteine(B);
  }
  if(katalog.value){
    const details=document.createElement('details');details.className='card';details.innerHTML='<summary>Zusatzleistungen im Katalog</summary><div class="pe-plan-katalog"></div>';
    B.append(details);peKatalog(details.querySelector('div'),true);
  }
}

function pePlanForm(entwurf,leistungen,B){
  const p=entwurf || {id:crypto.randomUUID(),version:0,titel:'',stand:'idee',notiz:'',leistung:null};
  const katalog=leistungen.filter(l=>l.art!=='paket');
  const option=(key,text,wert)=>'<option value="'+peE(key)+'"'+(key===wert?' selected':'')+'>'+peE(text)+'</option>';
  const M=svModal('<form class="og-form pe-form pa-blatt" id="pePlanForm"><h2>'+(entwurf?'Projekt bearbeiten':'Projekt anlegen')+'</h2>'
    +'<label class="pe-f">Projekt<input name="titel" required minlength="2" maxlength="80" value="'+peE(p.titel)+'"></label>'
    +'<label class="pe-f">Stand<select name="stand">'+Object.entries(PE_PLANSTAND).map(([k,t])=>option(k,t,p.stand)).join('')+'</select></label>'
    +'<label class="pe-f">Verknüpfte Katalogleistung<select name="leistung">'+option('','Ohne Verknüpfung',p.leistung||'')+katalog.map(l=>option(l.key,l.titel,p.leistung)).join('')+(p.leistung&&!katalog.some(l=>l.key===p.leistung)?option(p.leistung,p.leistung,p.leistung):'')+'</select></label>'
    +'<label class="pe-f">Was ist vereinbart, was ist noch offen?<textarea name="notiz" rows="4" maxlength="1500">'+peE(p.notiz)+'</textarea></label>'
    +'<p role="alert" class="note"></p><button type="button" class="btn sm ghost" data-plan-aktuell hidden>Aktuelle Fassung öffnen</button><div class="btnrow"><button class="btn" type="submit">Intern speichern</button><button class="btn ghost" type="button" data-plan-zu>Abbrechen</button></div></form>');
  const form=M.querySelector('#pePlanForm'), speichern=form.querySelector('[type=submit]');
  if(!leistungen.length)form.elements.leistung.disabled=true;
  form.querySelector('[data-plan-zu]').onclick=()=>closeOverlay();
  const aktuell=form.querySelector('[data-plan-aktuell]');
  aktuell.onclick=async()=>{
    try{
      const liste=await svtRpc('partner_bausteinplanung_laden',{}), neu=liste.find(x=>x.id===p.id);
      if(form.isConnected && neu){ closeOverlay(); pePlanForm(neu,leistungen,B); }
    }catch(err){form.querySelector('[role=alert]').textContent=err.message||'Laden ist gerade nicht möglich.';}
  };
  form.onsubmit=async e=>{
    e.preventDefault();if(speichern.disabled)return;
    const fehler=form.querySelector('[role=alert]');fehler.textContent='';speichern.disabled=true;
    try{
      await svtRpc('partner_bausteinplanung_speichern',{p_id:p.id,p_version:p.version,p_titel:form.elements.titel.value.trim(),p_stand:form.elements.stand.value,p_leistung:form.elements.leistung.value||null,p_notiz:form.elements.notiz.value.trim()});
      if(form.isConnected)closeOverlay();
      if(B.isConnected&&SPO.view==='bausteine')await peBausteine(B);
    }catch(err){fehler.textContent=err.message||'Speichern ist gerade nicht möglich. Bitte erneut versuchen.'; aktuell.hidden=!(err.code==='40001'||fehler.textContent.includes('inzwischen geändert'));}
    finally{speichern.disabled=false;}
  };
}

(function(){ try{ const s=document.createElement('style'); s.id='svm61css'; s.textContent="/* Partner-Steuerung (Beta 0.64) */\n.pe-kpis{display:grid;grid-template-columns:repeat(auto-fit,minmax(150px,1fr));gap:10px;margin-bottom:14px}\n.pe-kpi{display:grid;gap:3px;text-align:left;padding:14px 16px;border-radius:var(--r-lg);border:1px solid var(--line);background:var(--card);color:inherit;font:inherit;cursor:pointer;min-height:76px}\n.pe-kpi b{font-size:22px;font-weight:800;letter-spacing:-.02em;font-variant-numeric:tabular-nums}\n.pe-kpi span{font-size:12.5px;color:var(--ink2);line-height:1.3}\n.pe-kpi.warn b{color:#f59e0b} .pe-kpi.rot b{color:#f87171}\nhtml[data-theme=\"hell\"] .pe-kpi.warn b{color:#a35a00} html[data-theme=\"hell\"] .pe-kpi.rot b{color:#b91c1c}\n.pe-sub{margin-bottom:14px}\n.pe-n{display:inline-grid;place-items:center;min-width:20px;height:20px;padding:0 6px;border-radius:10px;background:#dc2626;color:#fff;font-style:normal;font-size:11.5px;margin-left:4px}\n.pe-h{display:flex;align-items:center;gap:8px;font-size:17px;font-weight:750;margin:18px 2px 10px;letter-spacing:-.01em}\n.pe-h i{font-style:normal;font-size:12px;font-weight:700;color:var(--ink2);background:var(--card2);padding:2px 8px;border-radius:10px}\n.pe-liste{display:grid;gap:10px}\n.pe-auf{background:var(--card);border:1px solid var(--line);border-radius:var(--r-lg);padding:14px 16px;display:grid;gap:8px}\n.pe-auf-k{display:flex;gap:12px;align-items:flex-start}\n.pe-ic{flex:none;width:34px;height:34px;border-radius:10px;display:grid;place-items:center;background:var(--card2);font-size:17px}\n.pe-auf-k small{display:block;font-size:12px;color:var(--ink2);font-weight:650;text-transform:uppercase;letter-spacing:.04em}\n.pe-auf-k b{display:block;font-size:15.5px;line-height:1.3;margin-top:2px}\n.pe-auf p{margin:0;font-size:14px;color:var(--ink2);line-height:1.5}\n.pe-auf-b{display:flex;gap:8px;flex-wrap:wrap}\n.pe-auf.art-verlaengerung .pe-ic{background:rgba(59,130,246,.16)} .pe-auf.art-nachfassen .pe-ic{background:rgba(245,158,11,.18)}\n.pe-auf.art-laufzeit .pe-ic{background:rgba(139,92,246,.16)} .pe-auf.art-vorrecht .pe-ic{background:rgba(236,72,153,.16)} .pe-auf.art-zahlung .pe-ic{background:rgba(34,197,94,.16)}\n.pe-liste.klein .pe-auf{opacity:.8}\n.pe-ruhe{padding:22px} .pe-ruhe p{margin:6px 0 0}\n.pe-hin{padding:16px 18px;border-left:4px solid #f59e0b} .pe-hin p{margin:6px 0 0}\n.pe-link{background:none;border:0;padding:6px 0;color:var(--accent);font:inherit;font-weight:650;cursor:pointer;text-decoration:underline;text-underline-offset:3px}\n.pe-bz{display:flex;justify-content:space-between;align-items:center;gap:14px;text-align:left;width:100%;padding:14px 16px;border-radius:var(--r-lg);border:1px solid var(--line);background:var(--card);color:inherit;font:inherit;cursor:pointer}\n.pe-bz>div:first-child{display:grid;gap:3px;min-width:0}\n.pe-bz b{font-size:15px}\n.pe-bz small{font-size:12.5px;color:var(--ink2)}\n.pe-bz.aus{opacity:.55}\n.pe-wer{font-size:12.5px;color:var(--ink);opacity:.85}\n.pe-bz-r{display:grid;justify-items:end;gap:4px;flex:none;min-width:110px}\n.pe-bz-r strong{font-size:15px;font-variant-numeric:tabular-nums}\n.pe-bar{display:block;width:110px;height:6px;border-radius:3px;background:var(--card2);position:relative;overflow:hidden}\n.pe-bar::after{content:\"\";position:absolute;inset:0 auto 0 0;width:var(--p);background:linear-gradient(90deg,#3b82f6,#22c55e);border-radius:3px}\n.pe-w,.pe-b,.pe-vs,.pe-bz-r em{font-style:normal;font-size:11.5px;font-weight:700;padding:2px 7px;border-radius:7px}\n.pe-w{background:rgba(139,92,246,.18);color:#c4b5fd} .pe-b{background:rgba(245,158,11,.18);color:#fcd34d} .pe-vs{background:rgba(148,163,196,.16);color:var(--ink2)}\nhtml[data-theme=\"hell\"] .pe-w{color:#5b21b6} html[data-theme=\"hell\"] .pe-b{color:#8a4b00}\n.pe-raster-w{overflow-x:auto;border:1px solid var(--line);border-radius:var(--r-lg);background:var(--card)}\n.pe-raster{border-collapse:collapse;width:100%;min-width:560px;font-size:13px}\n.pe-raster th,.pe-raster td{padding:6px;border-bottom:1px solid var(--line);text-align:left}\n.pe-raster thead th{font-size:12px;color:var(--ink2);font-weight:700;white-space:nowrap}\n.pe-raster tbody th{font-weight:750;white-space:nowrap}\n.pe-zelle{width:100%;min-height:44px;border-radius:10px;border:1px dashed var(--line);background:none;color:var(--ink2);font:inherit;font-size:12.5px;cursor:pointer;position:relative;padding:4px 8px}\n.pe-zelle.voll{border-style:solid;background:rgba(34,197,94,.14);color:var(--ink);font-weight:650}\n.pe-zelle.vr{border-style:solid;background:rgba(236,72,153,.14);color:var(--ink)}\n.pe-zelle i{position:absolute;top:-6px;right:-4px;min-width:18px;height:18px;border-radius:9px;background:#8b5cf6;color:#fff;font-style:normal;font-size:11px;display:grid;place-items:center}\n.pe-lz{display:flex;justify-content:space-between;gap:14px;align-items:center;padding:14px 16px;border-radius:var(--r-lg);border:1px solid var(--line);background:var(--card);border-left:4px solid var(--line)}\n.pe-lz>div:first-child{display:grid;gap:3px;min-width:0} .pe-lz small{font-size:12.5px;color:var(--ink2)}\n.pe-lz.gelb{border-left-color:#f59e0b} .pe-lz.rot{border-left-color:#ef4444} .pe-lz.ab{border-left-color:#7f1d1d} .pe-lz.ang{border-left-color:#8b5cf6}\n.pe-lz-r{display:grid;justify-items:end;gap:3px;flex:none;text-align:right}\n.pe-vst{font-style:normal;font-size:11.5px;font-weight:700;padding:2px 8px;border-radius:7px;background:var(--card2);color:var(--ink2)}\n.pe-vst.v-verlaengert{background:rgba(34,197,94,.18);color:#86efac} .pe-vst.v-ueberlegt{background:rgba(245,158,11,.18);color:#fcd34d} .pe-vst.v-beendet{background:rgba(239,68,68,.18);color:#fca5a5}\nhtml[data-theme=\"hell\"] .pe-vst.v-verlaengert{color:#166534} html[data-theme=\"hell\"] .pe-vst.v-ueberlegt{color:#8a4b00} html[data-theme=\"hell\"] .pe-vst.v-beendet{color:#991b1b}\n.pe-re{display:flex;justify-content:space-between;gap:14px;align-items:center;padding:14px 16px;border-radius:var(--r-lg);border:1px solid var(--line);background:var(--card)}\n.pe-re>div:first-child{display:grid;gap:3px} .pe-re small{font-size:12.5px;color:var(--ink2)} .pe-re.bezahlt{opacity:.7}\n.pe-re-r{display:grid;justify-items:end;gap:6px}\n.pe-form h4{margin:16px 0 8px;font-size:13px;text-transform:uppercase;letter-spacing:.05em;color:var(--ink2)}\n.pe-f{display:grid;gap:6px;margin:10px 0}\n.pe-f>span{font-size:13px;font-weight:650;color:var(--ink2)}\n.pe-f input,.pe-f select,.pe-f textarea{width:100%;padding:10px 12px;border-radius:10px;border:1.5px solid var(--line);background:var(--surface2);color:var(--ink);font:inherit}\n.pe-2{display:grid;grid-template-columns:1fr 1fr;gap:10px}\n@media (max-width:520px){.pe-2{grid-template-columns:1fr}}\n.pe-wahl{display:flex;flex-wrap:wrap;gap:6px}\n.pe-chip{display:inline-flex;align-items:center;gap:6px;padding:8px 12px;min-height:40px;border-radius:12px;border:1px solid var(--line);background:var(--card2);cursor:pointer;font-size:13.5px}\n.pe-chip input{accent-color:var(--accent)}\n.pe-chip:has(input:checked){border-color:var(--accent);background:color-mix(in srgb,var(--accent) 16%,transparent)}\n.pe-zeile{display:grid;grid-template-columns:1fr auto 110px;gap:8px;align-items:center;padding:8px 0;border-bottom:1px solid var(--line)}\n.pe-zeile input,.pe-zeile select{padding:8px 10px;border-radius:9px;border:1.5px solid var(--line);background:var(--surface2);color:var(--ink);font:inherit}\n.pe-sw2{display:flex;gap:10px;align-items:center;margin:10px 0;cursor:pointer;min-height:44px}\n.pe-sw2 input{width:20px;height:20px;accent-color:var(--accent)}\n.pe-bl{display:flex;justify-content:space-between;align-items:center;gap:10px;padding:10px 0;border-bottom:1px solid var(--line)}\n.pe-bl>div:first-child{display:grid;gap:2px} .pe-bl small{color:var(--ink2);font-size:12.5px}\n.pe-team{margin-top:10px}\n.pe-tz{display:flex;justify-content:space-between;align-items:center;gap:12px;padding:12px 16px;min-height:60px;border-bottom:1px solid var(--line)}\n.pe-tz>div{display:grid;gap:2px} .pe-tz small{color:var(--ink2);font-size:12.5px}\n.pe-fest{font-size:12px;color:var(--ink2);font-weight:650}\n.pe-sw3{position:relative;display:inline-block;width:51px;height:31px;flex:none;cursor:pointer}\n.pe-sw3 input{position:absolute;opacity:0;width:100%;height:100%;margin:0;cursor:pointer;z-index:1}\n.pe-sw3 span{position:absolute;inset:0;border-radius:16px;background:var(--card2);border:1px solid var(--line);transition:background .2s}\n.pe-sw3 span::after{content:\"\";position:absolute;top:2px;left:2px;width:25px;height:25px;border-radius:50%;background:#fff;box-shadow:0 1px 3px rgba(0,0,0,.3);transition:transform .2s}\n.pe-sw3 input:checked+span{background:#22c55e;border-color:#22c55e}\n.pe-sw3 input:checked+span::after{transform:translateX(20px)}\n.pe-sw3 input:focus-visible+span{outline:2px solid var(--accent);outline-offset:2px}\n/* 0.72: Linien-Icons statt Emojis, gebündelte Fragen, Verlängerung und Zahlung oben */\n.pe-ic svg{width:18px;height:18px;}\n.pe-auf.art-verlaengerung .pe-ic{color:#8fc9ec} .pe-auf.art-zahlung .pe-ic{color:#86efac} .pe-auf.art-laufzeit .pe-ic{color:#f59b52} .pe-auf.art-nachfassen .pe-ic{color:#fcd34d}\n.pe-auf.art-laufzeit .pe-ic{background:rgba(232,116,31,.16)}\nhtml[data-theme=\"hell\"] .pe-auf .pe-ic{color:#1d2760}\n.pe-bd summary{display:flex;align-items:center;min-height:44px;cursor:pointer;font-weight:700;color:var(--ink);}\n.pe-bdl{display:grid}\n.pe-bdz{display:flex;justify-content:space-between;align-items:center;gap:10px;padding:8px 0;border-top:1px solid var(--line)}\n.pe-bdz>div{display:grid;gap:2px;min-width:0} .pe-bdz small{font-size:12.5px;color:var(--ink2)}\n.pe-bdz .btn{flex:none;min-height:44px!important}\n.pe-vtg{font-size:12px;color:var(--ink2);max-width:180px;text-align:right}\n.pe-auf-b .btn,.pe-bl .btn{min-height:44px!important}\n/* 0.73: ruhiger Hinweis, wenn die Steuernummer fehlt */\n.pe-steuer{display:flex;align-items:center;justify-content:space-between;gap:10px;flex-wrap:wrap;margin:0 0 12px;padding:10px 14px;border-radius:var(--r-lg);border:1px solid var(--line);border-left:4px solid #e8741f;background:var(--card);font-size:14px;color:var(--ink2)}\n.pe-steuer span{display:inline-flex;align-items:center;gap:8px} .pe-steuer svg{width:16px;height:16px;color:#e8741f}\n.pe-steuer .btn{min-height:44px!important}\n#pePlanListe .pe-bz>span:first-child{display:grid;min-width:0;gap:4px;overflow-wrap:anywhere}\n#pePlanListe .pe-bz-r{max-width:35%;min-width:0;overflow-wrap:anywhere;text-align:right}\n.pe-plan-katalog{margin-top:14px}\n"; document.head.appendChild(s); }catch(e){} })();
/* =====================================================================
   Sportzentrale Beta 0.64 · Partner-Termin vorbereiten („Heute sind wir bei …“)
   1. Firma und Website eintragen
   2. Der Server liest die Website, holt Logo-Kandidaten und lässt Claude den Passungstext schreiben (partner-vorbereiten)
   3. Hier: Logo freistellen (Hintergrund weg, Ränder ab, sauber hochskaliert), Texte prüfen, Präsentation speichern
      (gibt es für die Firma schon eine, wird sie aktualisiert: gleicher Link, keine zweite)
   4. Präsentation starten: auf dieser Adresse geöffnet, mit Anmeldung, also im Termin-Modus (Sonderpreis, Sonstiges, Unterschrift für den Verein)
   ===================================================================== */
const PT={r:null,logos:[],wahl:0,hell:true,busy:false,speichert:false,sid:null,sidFirma:''};
const ptE=s=>svEsc(s==null?'':String(s));
const PT_HERZ={jugend:'Jugend',erste:'1. Mannschaft',zweite:'2. Mannschaft',events:'Events',verein:'Ganzer Verein'};
function ptLink(code){ return svBasis()+'partner.html#d='+code; }

function ptStart(vor){
  const v=vor||{}, firmen=(typeof SPO!=='undefined'&&SPO.S||[]).map(s=>s.firma).filter(Boolean);
  PT.sid=v.id||null; PT.sidFirma=String(v.firma||'').trim().toLowerCase();   // Firmen-ID aus der Akte oder Zentrale
  if(typeof pdLaden==='function'&&typeof PD!=='undefined'&&!PD.d)pdLaden().catch(()=>{});
  const M=svModal(`<div class="og-form pt-f pa-blatt"><div class="pa-bk"><h2>${SVI('cal')} Termin vorbereiten</h2><button type="button" class="pa-bx" onclick="closeOverlay()">Abbrechen</button></div>
    <p class="note">Trag Firma und Website ein. Die App holt das Logo und schlägt einen Text vor, warum ihr zusammenpasst. Du schaust drüber, dann kannst du die Präsentation im Termin zeigen.</p>
    <div class="pd-g"><label class="og-fl">Firma<input id="ptFi" maxlength="120" list="ptFl" value="${ptE(v.firma||'')}" placeholder="Muster GmbH" autocomplete="off"><datalist id="ptFl">${firmen.slice(0,300).map(f=>`<option value="${ptE(f)}">`).join('')}</datalist></label>
      <label class="og-fl">Website<input id="ptWe" maxlength="200" inputmode="url" value="${ptE(v.web||'')}" placeholder="muster.de"></label>
      <label class="og-fl">Anrede<select id="ptAn"><option value="">Bitte wählen</option><option${v.anrede==='Frau'?' selected':''}>Frau</option><option${v.anrede==='Herr'?' selected':''}>Herr</option></select></label>
      <label class="og-fl">Ansprechpartner<input id="ptAp" maxlength="80" value="${ptE(v.ansprech||'')}" placeholder="Vor- und Nachname"></label>
      <label class="og-fl">E-Mail<input id="ptEm" type="email" maxlength="120" value="${ptE(v.email||'')}"></label>
      <label class="og-fl">Adresse<input id="ptAd" maxlength="160" value="${ptE(v.adresse||'')}" placeholder="Straße, PLZ Ort"></label></div>
    <p class="note small pt-vorh" id="ptVorh" hidden></p>
    <label class="og-fl">Was wissen wir schon? (hilft beim Text)<textarea id="ptNo" rows="3" maxlength="600" placeholder="z. B. Chef spielt bei den Alten Herren, sucht Azubis, Sohn in der D1">${ptE(v.notiz||'')}</textarea></label>
    <div class="btnrow sbact"><button class="btn" type="button" id="ptGo">${SVI('star')} Vorbereiten</button></div>
    <div id="ptOut"></div></div>`);
  // bekannte Firma: Daten übernehmen
  const fi=M.querySelector('#ptFi'); fi.onchange=()=>{ const s=(SPO.S||[]).find(x=>String(x.firma).toLowerCase()===fi.value.trim().toLowerCase()); if(!s)return;
    const set=(id,val)=>{ const e=M.querySelector(id); if(e&&!e.value&&val)e.value=val; };
    set('#ptWe',s.web||s.website); set('#ptAp',s.ansprechpartner); set('#ptEm',s.email); set('#ptAd',[s.strasse,s.ort].filter(Boolean).join(', '));
    const an=M.querySelector('#ptAn'); if(an&&!an.value&&s.anrede)an.value=s.anrede; ptVorhanden(M); };
  fi.oninput=()=>ptVorhanden(M);
  if(v.firma)ptVorhanden(M);
  M.querySelector('#ptGo').onclick=()=>ptVorbereiten(M);
}

// Gibt es für diese Firma schon eine Präsentation? Dann wird sie aktualisiert, der Link bleibt gleich.
// zuerst über die Firmen-ID (bleibt auch nach Umbenennen), sonst über den Namen
function ptDeckVon(firma,sid){ const L=(typeof PD!=='undefined'&&PD.d&&PD.d.decks)||[], f=String(firma||'').trim().toLowerCase();
  return (sid&&L.find(d=>d.sponsor===sid))||(f&&L.find(d=>String(d.firma||'').trim().toLowerCase()===f))||null; }
// Firmen-ID zur eingetragenen Firma: die übergebene, sonst über den Namen
function ptFirmaId(M){ const f=String((M.querySelector('#ptFi')||{}).value||'').trim().toLowerCase(), s=((typeof SPO!=='undefined'&&SPO.S)||[]).find(x=>String(x.firma).trim().toLowerCase()===f);
  return PT.sid||(s?s.id:null); }   // aus der Akte oder Zentrale geöffnet: die Firma bleibt dieselbe, auch wenn der Name im Feld korrigiert wird
function ptVorhanden(M){ const n=M.querySelector('#ptVorh'); if(!n)return; const d=ptDeckVon((M.querySelector('#ptFi')||{}).value,ptFirmaId(M));
  n.hidden=!d; n.textContent=d?'Für diese Firma gibt es schon eine Präsentation. Speichern aktualisiert sie, der Link bleibt gleich.':''; }
async function ptVorbereiten(M){
  if(PT.busy)return; const v=id=>(M.querySelector(id)||{}).value||'', firma=v('#ptFi').trim();
  if(firma.length<2){ kToast('Bitte den Firmennamen eintragen'); return; }
  if(v('#ptAp').trim()&&!v('#ptAn')){ kToast('Bitte die Anrede wählen, damit die Präsentation die Person richtig anspricht.'); const a=M.querySelector('#ptAn'); if(a)a.focus(); return; }
  PT.busy=true; const O=M.querySelector('#ptOut'), go=M.querySelector('#ptGo'); go.disabled=true;
  const schritte=[['web','Website lesen'],['logo','Logo freistellen'],['text','Passung schreiben']];
  const zeig=(fertig,akt)=>{ O.innerHTML=`<ol class="pt-steps">${schritte.map(([k,t],i)=>`<li class="${i<fertig?'ok':i===akt?'an':''}">${i<fertig?SVI('check'):''}<span>${t}</span></li>`).join('')}</ol>`; };
  zeig(0,0);
  try{
    const {data,error}=await SVB.sb.functions.invoke('partner-vorbereiten',{body:{firma,web:v('#ptWe').trim(),notiz:v('#ptNo').trim()}});
    if(error)throw error; if(!data||!data.ok)throw new Error((data&&data.error)||'Vorbereitung ging nicht');
    zeig(1,1); PT.r=Object.assign(data,{anrede:v('#ptAn'),ansprech:v('#ptAp').trim(),email:v('#ptEm').trim(),adresse:v('#ptAd').trim()});
    PT.logos=[]; for(const l of data.logos||[]){ try{ PT.logos.push(Object.assign({quelle:l.quelle},await ptFreistellen(l.src))); }catch(e){} }
    PT.logos.sort((a,b)=>b.guete-a.guete); PT.wahl=PT.logos.length?0:-1; PT.hell=PT.logos.length?!PT.logos[0].weiss:true;
    zeig(2,2); await new Promise(r=>setTimeout(r,120)); zeig(3,-1);
    ptErgebnis(M);
  }catch(e){ O.innerHTML=`<div class="pt-err">⚠️ ${ptE(e.message||e)}</div>`; }
  finally{ PT.busy=false; go.disabled=false; }
}

function ptErgebnis(M){
  const R=PT.r, P=R.passung||{}, O=M.querySelector('#ptOut');
  const go=M.querySelector('#ptGo'); if(go){ const row=go.closest('.btnrow'); if(row)row.classList.remove('sbact'); go.innerHTML=SVI('refresh')+' Neu vorbereiten'; go.classList.add('ghost'); }
  O.innerHTML=`<div class="pt-erg">
    ${R.web_gelesen?'':`<p class="note">${R.web?'Die Website war nicht erreichbar. ':''}Text ohne Website geschrieben, gern ergänzen.</p>`}
    ${R.ki?'':'<p class="note">Die KI ist gerade nicht eingerichtet, hier ein Vorschlag zum Anpassen.</p>'}
    <h3 class="pd-h">Logo</h3>
    <div class="pt-logos">${PT.logos.map((l,i)=>`<button type="button" class="pt-lg${i===PT.wahl?' on':''}${l.weiss?' dk':''}" data-lg="${i}" aria-pressed="${i===PT.wahl}"><img src="${l.src}" alt="Logo-Vorschlag ${i+1}"><small>${ptE(l.quelle)}${l.frei?', freigestellt':''}</small></button>`).join('')}
      <label class="pt-lg pt-eigen">${SVI('plus')}<small>Eigenes Bild</small><input type="file" accept="image/*" id="ptLo" hidden></label></div>
    <label class="jutog"><input type="checkbox" id="ptLd"${PT.hell?'':' checked'}> Logo ist weiß oder hell (auf dunklem Grund zeigen)</label>
    ${R.ueber||(R.gespraech||[]).length?`<div class="pt-intern"><b>Nur fürs Team</b>${R.ueber?`<p>${ptE(R.ueber)}</p>`:''}${(R.gespraech||[]).length?`<ul>${R.gespraech.map(g=>`<li>${ptE(g)}</li>`).join('')}</ul>`:''}</div>`:''}
    <h3 class="pd-h">Für die Firma</h3>
    <div class="pd-g"><label class="og-fl">Kurzname im Text<input id="ptKu" maxlength="60" value="${ptE(R.kurzname||'')}"></label>
      <label class="og-fl">Branche<input id="ptBr" maxlength="80" value="${ptE(R.branche||'')}"></label></div>
    <label class="og-fl">Überschrift<input id="ptTi" maxlength="80" value="${ptE(P.titel||'')}"></label>
    <label class="og-fl">Einstieg oben<textarea id="ptHe" rows="2" maxlength="300">${ptE(P.hero||'')}</textarea></label>
    <label class="og-fl">Warum es passt<textarea id="ptTx" rows="4" maxlength="700">${ptE(P.text||'')}</textarea></label>
    <label class="og-fl">Punkte (eine Zeile je Punkt)<textarea id="ptPu" rows="3" maxlength="900">${ptE((P.punkte||[]).join('\n'))}</textarea></label>
    <div class="og-fl"><span>Bereiche, die passen (sortiert die Präsentation)</span><div class="pt-chips">${Object.keys(PT_HERZ).map(k=>`<label class="pe-chip"><input type="checkbox" data-herz="${k}"${(P.herz||[]).includes(k)?' checked':''}> ${PT_HERZ[k]}</label>`).join('')}</div></div>
    <label class="og-fl">Empfohlenes Paket<select id="ptEmpf"><option value="">keins</option>${[['supporter','SVM Supporter'],['club','Club Partner'],['premium','Premium Partner'],['p1896','1896 Partner']].map(([k,t])=>`<option value="${k}"${R.empfehlung===k?' selected':''}>${t}</option>`).join('')}</select></label>
    <div class="btnrow sbact"><button class="btn" type="button" id="ptStart">${SVI('eye')} Speichern und Präsentation starten</button><button class="btn ghost" type="button" id="ptSave">Nur speichern</button></div></div>`;
  O.querySelectorAll('[data-lg]').forEach(b=>b.onclick=()=>{ PT.wahl=+b.dataset.lg; PT.hell=!PT.logos[PT.wahl].weiss; ptErgebnis(M); });
  O.querySelector('#ptLo').onchange=async e=>{ const f=e.target.files&&e.target.files[0]; if(!f)return; try{ const src=await pdLogo(f); PT.logos.unshift(Object.assign({quelle:'Eigenes Bild'},await ptFreistellen(src))); PT.wahl=0; PT.hell=!PT.logos[0].weiss; ptErgebnis(M); }catch(err){ kToast('⚠️ '+err.message); } };
  O.querySelector('#ptLd').onchange=e=>{ PT.hell=!e.target.checked; };
  // Doppeltipp-Sperre: beide Knöpfe sind gesperrt, solange gespeichert wird
  const st=O.querySelector('#ptStart'), sv=O.querySelector('#ptSave');
  const sperren=an=>{ [st,sv].forEach(b=>{ if(b)b.disabled=an; }); };
  st.onclick=async()=>{ if(PT.speichert)return; PT.speichert=true; sperren(true); try{ await ptSpeichern(M,true); }finally{ PT.speichert=false; if(st.isConnected)sperren(false); } };
  sv.onclick=async()=>{ if(PT.speichert)return; PT.speichert=true; sperren(true); try{ await ptSpeichern(M,false); }finally{ PT.speichert=false; if(sv.isConnected)sperren(false); } };
}

async function ptSpeichern(M,starten){
  const R=PT.r, v=id=>(M.querySelector(id)||{}).value||'', lg=PT.logos[PT.wahl];
  const passung={titel:v('#ptTi').trim(),hero:v('#ptHe').trim(),text:v('#ptTx').trim(),punkte:v('#ptPu').split('\n').map(s=>s.trim()).filter(Boolean).slice(0,6),
    herz:[...M.querySelectorAll('[data-herz]:checked')].map(x=>x.dataset.herz),ziele:(R.passung||{}).ziele||[]};   // „ohne“ und Zahlen nicht mitschicken: der Server ergänzt, was schon da ist (z. B. ohne Jugend-Trikot)
  if(/[–—]/.test(JSON.stringify(passung))){ kToast('Bitte keine Gedankenstriche, lieber Komma oder Doppelpunkt'); return; }
  const p={firma:v('#ptFi').trim()||R.firma,kurzname:v('#ptKu').trim(),anrede:v('#ptAn'),ansprech:v('#ptAp').trim(),email:v('#ptEm').trim(),adresse:v('#ptAd').trim(),branche:v('#ptBr').trim(),web:R.web||'',
    passung,empfehlung:v('#ptEmpf'),logo_hell:PT.hell,notiz:[R.ueber,...(R.gespraech||[]).map(g=>'• '+g)].filter(Boolean).join('\n').slice(0,1000)};
  if(lg)p.logo=lg.src;
  // erst die Rückfrage zum Namen (vor dem neuen Fenster, sonst wartet sie am iPhone unsichtbar im alten Tab)
  const sid=ptFirmaId(M);
  // Name im Blatt geändert: die Firma umbenennen statt eine zweite anzulegen (nach Rückfrage)
  const fx=sid&&SPO.S.find(y=>y.id===sid);
  if(fx&&String(fx.firma).trim().toLowerCase()!==p.firma.toLowerCase()&&typeof peBestaetigen==='function'){
    if(await peBestaetigen('Firma umbenennen?',`In der App heißt die Firma „${fx.firma}“. Soll sie ab jetzt „${p.firma}“ heißen? Mit „Abbrechen“ bleibt der alte Name, die Präsentation hängt trotzdem an dieser Firma.`)){
      try{ const {error}=await SVB.sb.from('sponsoren').update({firma:p.firma,geaendert_am:new Date().toISOString()}).eq('id',sid); if(error)throw error; fx.firma=p.firma; PT.sidFirma=p.firma.toLowerCase(); }catch(e){ kToast('Name nicht geändert: '+(e.message||e)); } } }
  // Fenster sofort öffnen (sonst blockt der Browser), Adresse kommt nach dem Speichern
  const w=starten?window.open('about:blank','_blank'):null;
  try{ // vorhandene Präsentation der Firma aktualisieren statt eine zweite anzulegen
    if(typeof PD!=='undefined'&&!PD.d&&typeof pdLaden==='function'){ try{ await pdLaden(); }catch(_){} }
    if(sid)p.sponsor=sid;   // Präsentation immer mit der Firmen-ID verknüpfen

    const alt=ptDeckVon(p.firma,sid); if(alt){ p.id=alt.id; p.aktiv=true; if(alt.notiz)delete p.notiz; }   // Teamnotiz der vorhandenen Präsentation bleibt
    // Anrede bei der Firma merken, wenn sie dort noch fehlt
    if(sid&&p.anrede){ const x=SPO.S.find(y=>y.id===sid); if(x&&!x.anrede){ try{ await SVB.sb.from('sponsoren').update({anrede:p.anrede}).eq('id',sid); x.anrede=p.anrede; }catch(_){} } }
    const r=await svtRpc('partner_deck_speichern',{p}); if(typeof PD!=='undefined')PD.d=null;
    closeOverlay();
    // die Firma legt der Server an, falls sie fehlte: Liste neu laden, damit sie in Zentrale und Firmen steht
    try{ await spoLoad(true); if(typeof pdLaden==='function')await pdLaden(); }catch(_){}
    if(starten){ kToast(alt?'✓ Präsentation aktualisiert, der Link bleibt gleich':'✓ Präsentation gespeichert'); if(w&&!w.closed)w.location.href=ptLink(r.code); else location.href=ptLink(r.code); }
    else ptFertig(r,p,!!alt);
    try{ if(SPO.view==='zentrale'||SPO.view==='sponsoren'||SPO.view==='decks')spoBody(); }catch(_){} }
  catch(e){ if(w)try{ w.close(); }catch(_){} kToast('⚠️ '+(e.message||e)); }
}

// Nach dem Speichern: gleich weiter zum Verschicken (2 Tipps bis „Gesendet“)
function ptFertig(r,p,aktualisiert){ const x=(SPO.S||[]).find(s=>s.id===r.sponsor), name=String(p.ansprech||'').trim();
  const M=svModal(`<div class="og-form pa-blatt pt-fertig"><div class="pa-bk"><h2>${SVI('check')} Fertig</h2><button type="button" class="pa-bx" onclick="closeOverlay()">Später</button></div>
    <p>${aktualisiert?'Die Präsentation ist aktualisiert, der Link bleibt gleich. ':''}Wie geht die Präsentation ${name?'an '+ptE(name)+' ':''}raus?</p>
    <div class="pt-wege"><button type="button" class="btn" data-ptw="wa">${SVI('chat')} Per WhatsApp</button><button type="button" class="btn ghost" data-ptw="mail">${SVI('mail')} Per Mail</button>
      <button type="button" class="btn ghost" data-ptw="termin">${SVI('eye')} Im Termin zeigen</button></div></div>`);
  M.querySelectorAll('[data-ptw]').forEach(b=>b.onclick=()=>{ const w=b.dataset.ptw;
    if(w==='termin'){ closeOverlay(); const u=ptLink(r.code); window.open(u,'_blank')||(location.href=u); return; }
    if(x&&typeof pzNachricht==='function'){ pzNachricht(x,'praesentation'); return; }   // dort prüft das Blatt Impressum und Zustimmung
    const fehlt=typeof paImpressumFehlt==='function'?paImpressumFehlt():[];
    if(fehlt.length){ closeOverlay(); kToast('Bevor ihr Links verschickt: Im Impressum fehlen noch '+fehlt.join(', ')+'. Bitte in den Vereinsdaten eintragen.'); if(typeof PE!=='undefined')PE.v='verein'; spoWechsel('steuerung'); return; }
    const t=`Hallo, hier ist eure Übersicht zur Partnerschaft mit dem SV/BSC Mörlenbach: ${pdLink(r.code,r.kurz)}`;
    if(w==='wa')window.open('https://wa.me/?text='+encodeURIComponent(t),'_blank'); else location.href='mailto:'+encodeURIComponent(p.email||'')+'?body='+encodeURIComponent(t);
    closeOverlay(); }); }

/* ---------- Logo freistellen ----------
   Hintergrund vom Rand her entfernen (nur wenn der Rand einfarbig ist), weiche Kante, leere Ränder ab,
   kleine Bilder in Schritten hochrechnen, höchstens 900 × 360. Ergebnis als PNG. */
function ptFreistellen(src){ return new Promise((ok,no)=>{ const img=new Image(); img.onerror=()=>no(new Error('Bild nicht lesbar')); img.onload=()=>{
  try{
    const svg=/^data:image\/svg/.test(src); let w=img.naturalWidth||600, h=img.naturalHeight||240;
    if(svg){ const f=1200/Math.max(w,h); w=Math.round(w*f); h=Math.round(h*f); }
    const c=document.createElement('canvas'); c.width=Math.max(1,w); c.height=Math.max(1,h); const x=c.getContext('2d',{willReadFrequently:true}); x.drawImage(img,0,0,c.width,c.height);
    const D=x.getImageData(0,0,c.width,c.height), d=D.data, W=c.width, H=c.height;
    // Randfarbe
    const rand=[]; for(let i=0;i<W;i+=Math.max(1,W>>6)){ rand.push(i,(H-1)*W+i); } for(let j=0;j<H;j+=Math.max(1,H>>6)){ rand.push(j*W,j*W+W-1); }
    const deckend=rand.filter(p=>d[p*4+3]>200); let frei=false;
    if(deckend.length>rand.length*.6){
      const med=k=>{ const a=deckend.map(p=>d[p*4+k]).sort((a,b)=>a-b); return a[a.length>>1]; }, bg=[med(0),med(1),med(2)];
      const dist=p=>Math.hypot(d[p*4]-bg[0],d[p*4+1]-bg[1],d[p*4+2]-bg[2]);
      if(deckend.filter(p=>dist(p)<28).length>deckend.length*.85){
        const tol=40, weich=26, seen=new Uint8Array(W*H), st=[]; deckend.forEach(p=>{ if(dist(p)<tol){ st.push(p); seen[p]=1; } });
        while(st.length){ const p=st.pop(), di=dist(p);
          d[p*4+3]=di<tol-weich?0:Math.min(d[p*4+3],Math.round(255*(di-(tol-weich))/weich));
          if(di>=tol)continue; const px=p%W, py=(p/W)|0;
          for(const q of [px>0?p-1:-1,px<W-1?p+1:-1,py>0?p-W:-1,py<H-1?p+W:-1])if(q>=0&&!seen[q]){ seen[q]=1; if(dist(q)<tol+weich||d[q*4+3]<12)st.push(q); } }
        frei=true; x.putImageData(D,0,0); }
    }
    // Ränder ab
    let t=0,b=H-1,l=0,r=W-1; const leer=p=>d[p*4+3]<14;
    const zl=y=>{ for(let i=0;i<W;i++)if(!leer(y*W+i))return false; return true; }, sl=i=>{ for(let y=t;y<=b;y++)if(!leer(y*W+i))return false; return true; };
    while(t<b&&zl(t))t++; while(b>t&&zl(b))b--; while(l<r&&sl(l))l++; while(r>l&&sl(r))r--;
    const bw=r-l+1, bh=b-t+1;
    // helles Logo? (mittlere Helligkeit der deckenden Pixel)
    let s=0,n=0; for(let y=t;y<=b;y+=2)for(let i=l;i<=r;i+=2){ const p=(y*W+i)*4; if(d[p+3]>160){ s+=(.2126*d[p]+.7152*d[p+1]+.0722*d[p+2])/255; n++; } }
    const weiss=n>0&&s/n>.86&&(frei||deckend.length<=rand.length*.6);
    // hochrechnen in Schritten (Faktor höchstens 2 je Schritt), dann auf Zielgröße
    const ziel=Math.min(900/bw,360/bh,Math.max(1,560/bw)); let cur=document.createElement('canvas'); cur.width=bw; cur.height=bh; cur.getContext('2d').drawImage(c,l,t,bw,bh,0,0,bw,bh);
    let f=1; while(f*2<ziel){ const nx=document.createElement('canvas'); nx.width=Math.round(cur.width*2); nx.height=Math.round(cur.height*2); const g=nx.getContext('2d'); g.imageSmoothingEnabled=true; g.imageSmoothingQuality='high'; g.drawImage(cur,0,0,nx.width,nx.height); cur=nx; f*=2; }
    const o=document.createElement('canvas'); o.width=Math.max(1,Math.round(bw*ziel)); o.height=Math.max(1,Math.round(bh*ziel)); const og=o.getContext('2d'); og.imageSmoothingEnabled=true; og.imageSmoothingQuality='high'; og.drawImage(cur,0,0,o.width,o.height);
    let out=o.toDataURL('image/png'); if(out.length>880000){ const k=Math.sqrt(880000/out.length)*.95, o2=document.createElement('canvas'); o2.width=Math.round(o.width*k); o2.height=Math.round(o.height*k); o2.getContext('2d').drawImage(o,0,0,o2.width,o2.height); out=o2.toDataURL('image/png'); }
    const guete=(svg?3:0)+(frei?2:0)+Math.min(3,bw/200)+(bw/bh>1.4?1:0);
    ok({src:out,frei,weiss,w:o.width,h:o.height,guete});
  }catch(e){ no(e); } }; img.src=src; }); }

(function(){ try{ const s=document.createElement('style'); s.id='svm62css'; s.textContent="/* Partner-Termin vorbereiten (Beta 0.64) */\n.pt-steps{list-style:none;margin:16px 0 0;padding:0;display:grid;gap:8px}\n.pt-steps li{display:flex;align-items:center;gap:10px;min-height:40px;padding:8px 12px;border-radius:12px;background:var(--card2);color:var(--ink2);font-weight:600}\n.pt-steps li svg{width:18px;height:18px;color:#22c55e}\n.pt-steps li.an{color:var(--ink)}\n.pt-steps li.an::before{content:\"\";width:16px;height:16px;border-radius:50%;border:2px solid var(--accent);border-top-color:transparent;animation:ptdreh .8s linear infinite}\n.pt-steps li.ok{color:var(--ink)}\n@keyframes ptdreh{to{transform:rotate(360deg)}}\n@media (prefers-reduced-motion:reduce){.pt-steps li.an::before{animation:none}}\n.pt-err{margin-top:14px;padding:12px 14px;border-radius:12px;background:rgba(239,68,68,.12);color:var(--ink)}\n.pt-erg{margin-top:12px}\n.pt-logos{display:grid;grid-template-columns:repeat(auto-fill,minmax(150px,1fr));gap:10px;margin:8px 0}\n.pt-lg{display:flex;flex-direction:column;align-items:center;justify-content:center;gap:6px;min-height:110px;padding:12px;border-radius:14px;border:2px solid var(--line);background:#fff;cursor:pointer;color:#333;font:inherit}\n.pt-lg img{max-width:100%;max-height:64px;object-fit:contain}\n.pt-lg small{font-size:11.5px;color:#555;text-align:center}\n.pt-lg.dk{background:#141b47}\n.pt-lg.dk small{color:#b9d9f0}\n.pt-lg.on{border-color:var(--accent);box-shadow:0 0 0 3px color-mix(in srgb,var(--accent) 35%,transparent)}\n.pt-eigen{background:var(--card2);color:var(--ink2);border-style:dashed}\n.pt-eigen svg{width:22px;height:22px}\n.pt-eigen small{color:var(--ink2)}\n.pt-intern{margin:14px 0;padding:12px 14px;border-radius:12px;background:var(--card2);border-left:4px solid #8b5cf6}\n.pt-intern b{font-size:12px;text-transform:uppercase;letter-spacing:.06em;color:var(--ink2)}\n.pt-intern p{margin:6px 0 0;font-size:14px;line-height:1.5}\n.pt-intern ul{margin:6px 0 0;padding-left:18px;font-size:14px;line-height:1.5}\n.pt-chips{display:flex;flex-wrap:wrap;gap:6px;margin-top:6px}\n.pt-f textarea{font:inherit;line-height:1.45}\n"; document.head.appendChild(s); }catch(e){} })();
/* =====================================================================
   Sportzentrale Beta 0.66 · Partner-Zentrale („Partner gewinnen“)
   Ein durchgehender Weg statt Reitern und Spalten:
   Idee › Angeschrieben › Gespräch › Angebot › Partner.
   Jede Firma steht an ihrer Station und hat genau einen nächsten Schritt mit großem Knopf.
   Die Werkzeuge dahinter gibt es schon: Termin vorbereiten (svm62), Präsentation mit Vertrag
   (partner.html), Akte (spoSponsor), Wächter (svm61). Die Zentrale verbindet sie.
   ===================================================================== */
const PZ={st:null,q:'',zeig:12};
// Stationsnamen wie überall im Partnerbereich (SPO_STL in svm26): „Angeschrieben“ statt „Kontakt“
const PZ_WEG=['idee','angeschrieben','gespraech','angebot','partner'].map(k=>[k,SPO_STL[k]]);
// Bewertung aus der Kriterienmatrix in Worten, die Zahl steht nur im Tooltip
const PZ_PRIO={A:'passt sehr gut',B:'passt gut',C:'mal probieren'};
const pzE=s=>svEsc(s==null?'':String(s));

// Kriterienmatrix aus der Notiz lesen („Score 77, Priorität A“), damit die besten Ideen oben stehen
function pzWert(x){ const n=String(x.notiz||''); const s=+((n.match(/Score\s*(\d+)/i)||[])[1]||0), p=(n.match(/Priorit\S*\s*([ABC])/i)||[])[1]||'';
  return {score:s,prio:p,rang:(p==='A'?300:p==='B'?200:p==='C'?100:150)+s}; }
function pzKurz(f){ const w=String(f||'').replace(/\b(GmbH|AG|KG|e\.K\.|UG|Co\.?|&|mbH|OHG|GbR)\b/g,' ').split(/\s+/).filter(Boolean);
  return ((w[0]||'?')[0]+(w[1]?w[1][0]:(w[0]||'')[1]||'')).toUpperCase(); }
function pzFarbe(f){ let h=0; for(const c of String(f||''))h=(h*31+c.charCodeAt(0))>>>0; return ['#1d2760','#2c6b3a','#7a3b12','#3d2a6b','#0f5967','#5b2333'][h%6]; }
// Präsentation einer Firma: zuerst über die Firmen-ID, nur hilfsweise über den Namen (falls die Firma umbenannt wurde, bleibt die Verbindung)
function pzDeck(x){ const L=(typeof PD!=='undefined'&&PD.d&&PD.d.decks)||[]; const f=String(x.firma||'').trim().toLowerCase();
  return (x.id&&L.find(d=>d.sponsor===x.id))||L.find(d=>String(d.firma||'').trim().toLowerCase()===f)||null; }
function pzOrt(x){ return String(x.ort||'').replace(/^\d{5}\s*/,''); }

// Der eine nächste Schritt je Station
// Vertrag, den die Firma unterschrieben hat und der auf eure Unterschrift wartet (seit 0.74 steht sie dann noch auf „Angebot“).
// Bei Partnern mit einem weiteren Vertrag bleibt der Hauptschritt die Akte; der wartende Vertrag steht in der Steuerung und in der Akte.
function pzWartet(x){ return x.status!=='partner'&&typeof PE!=='undefined'&&PE.d?(PE.d.vertraege||[]).find(v=>v.sponsor===x.id&&v.status==='unterschrieben'&&!v.hat_unterschrift_verein&&!v.gegengezeichnet_am&&v.art!=='spende')||null:null; }
function pzSchritt(x){
  const d=pzDeck(x), w=pzWartet(x);
  if(w){ const ab=typeof peAbgelaufen==='function'&&peAbgelaufen(w), dg=!!PE.d.darf_gegenzeichnen;
    if(ab)return {k:'gz-ab',t:PE.d.darf_vertrag?'Nicht annehmen':'Ansehen',ic:'clock',h:'Bindefrist abgelaufen. Neues Angebot oder neue Unterschrift nötig'};
    return dg?{k:'gegen',t:'Gegenzeichnen',ic:'check',h:'Unterschrieben, wartet auf eure Unterschrift'}:{k:'gegen',t:'Ansehen',ic:'check',h:'Unterschrieben, wartet auf eure Unterschrift. Gegenzeichnen kann, wer den Verein vertreten darf'}; }
  switch(x.status){
    case 'idee': return {k:'schreiben',t:'Anschreiben',ic:'send',h:'Nachricht ist vorgeschrieben'};
    case 'angeschrieben': return x.faellig&&x.faellig<=svtHeute()?{k:'nachhaken',t:'Nachhaken',ic:'mail',h:'Noch keine Antwort'}:{k:'termin',t:'Termin vorbereiten',ic:'cal',h:'Präsentation fehlt noch, in zwei Minuten vorbereitet'};
    case 'gespraech': return d?{k:'zeigen',t:'Präsentation starten',ic:'eye',h:'Präsentation ist fertig'}:{k:'termin',t:'Termin vorbereiten',ic:'cal',h:'Präsentation fehlt noch, in zwei Minuten vorbereitet'};
    // mit Präsentation zum Abschluss; ist die Wiedervorlage fällig, erst freundlich nachfassen (der Link kommt mit)
    case 'angebot': return d&&!(x.faellig&&x.faellig<=svtHeute())?{k:'abschluss',t:'Zum Abschluss',ic:'check',h:'Vertrag im Termin unterschreiben'}:{k:'nachfassen',t:'Nachfassen',ic:'mail',h:'Freundlich erinnern'};
    case 'partner': return {k:'akte',t:'Partner ansehen',ic:'heart',h:'Vertrag, Rechnung, Kontakte'};
    default: return {k:'akte',t:'Öffnen',ic:'chev',h:''};
  }
}

// ---------- Einhängen: „Zentrale“ ist der erste Reiter und die Übersicht (Reiter steht fest in SPO_REITER, svm26) ----------
{ const _b=spoBody; spoBody=function(){ const P=document.getElementById('panel-sponsoring'); if(P)P.classList.toggle('pz-an',SPO.view==='zentrale');
  if(SPO.view==='zentrale'){ const B=document.getElementById('spoB'); if(B)pzRender(B); return; } return _b.apply(this,arguments); }; }

// Wie lange ist bei einer Firma nichts passiert? Zählt jeden Eintrag im Verlauf (auch Stand und „Gesendet“), sonst die letzte Änderung.
function pzStill(x){ const l=typeof spoLetzter==='function'?spoLetzter(x.id):null; const am=l?l.am:String(x.geaendert_am||'').slice(0,10); return am?{am,tage:spoTage(am)}:null; }

async function pzRender(B){
  if(!SPO.loaded){ B.innerHTML='<div class="pz pz-lade"><div class="pz-hero"><h2 class="pz-h1">Partner gewinnen</h2><p class="pz-satz">Lade …</p></div></div>'; await spoLoad(); }
  if(!SPO.loaded){ B.innerHTML=`<div class="card"><div class="empty">Konnte nicht laden: ${pzE(SPO.err||'unbekannt')}</div></div>`; return; }
  // Präsentationen und Steuerung im Hintergrund nachladen (gemeinsame Ladeversprechen), dann neu zeichnen
  if(typeof PD!=='undefined'&&!PD.d&&typeof pdLaden==='function'&&!PZ.pdl){ PZ.pdl=1; pdLaden().then(()=>{ if(SPO.view==='zentrale'&&B.isConnected&&!pzTippt(B))pzRender(B); }).catch(()=>{}).finally(()=>{ PZ.pdl=0; }); }
  if(typeof PE!=='undefined'&&!PE.d&&typeof peLaden==='function'&&!PZ.pel){ PZ.pel=1; peLaden().then(()=>{ if(SPO.view==='zentrale'&&B.isConnected&&!pzTippt(B))pzRender(B); }).catch(()=>{}).finally(()=>{ PZ.pel=0; }); }
  const S=SPO.S, h=svtHeute();
  const zahl=Object.fromEntries(PZ_WEG.map(([k])=>[k,S.filter(x=>x.status===k).length]));
  const unterwegs=zahl.angeschrieben+zahl.gespraech+zahl.angebot;
  const waechter=(typeof PE!=='undefined'&&PE.d&&PE.d.aufgaben||[]).filter(a=>a.faellig<=h);
  const faellig=S.filter(x=>x.faellig&&x.faellig<=h&&!['partner','abgesagt','pausiert'].includes(x.status));
  const ideen=S.filter(x=>x.status==='idee').sort((a,b)=>pzWert(b).rang-pzWert(a).rang);
  // Heute dran: nur, was fällig ist. Was unterwegs, aber nicht fällig ist, steht darunter unter „Als Nächstes“; ganz ohne beides die drei besten Ideen
  const unterwegsL=S.filter(x=>['angebot','gespraech','angeschrieben'].includes(x.status)&&!faellig.includes(x)).sort((a,b)=>PZ_WEG.findIndex(w=>w[0]===b.status)-PZ_WEG.findIndex(w=>w[0]===a.status));
  const startIdeen=!faellig.length&&!unterwegsL.length;
  const heute=startIdeen?ideen.slice(0,3):faellig.slice(0,5), naechste=startIdeen?[]:unterwegsL.slice(0,faellig.length?3:5);
  PZ.oben=new Set(heute.concat(naechste).map(x=>x.id));
  // Partner mit Vertrag in der App (Partner-Engine) getrennt nennen, damit die Zahlen zusammenpassen
  const mitV=(typeof PE!=='undefined'&&PE.d)?new Set((PE.d.vertraege||[]).filter(v=>v.status==='aktiv'&&v.art!=='spende'&&(!v.ende||v.ende>=h)).map(v=>v.sponsor).filter(id=>S.some(x=>x.id===id&&x.status==='partner'))).size:null;
  const satz=zahl.partner?`<b>${zahl.partner}</b> Partner sind an Bord${mitV!=null?`, <b>${mitV}</b> davon mit Vertrag in der App.`:'.'}`:'Noch kein Partner an Bord.';
  // dieselben Zahlen wie in Firmen: „auf dem Weg“ sind Idee bis Angebot
  const satz2=unterwegs?` <b>${unterwegs}</b> ${unterwegs===1?'Firma haben':'Firmen haben'} wir schon angesprochen${zahl.idee?`, dazu ${zahl.idee===1?'kommt':'kommen'} <b>${zahl.idee}</b> ${zahl.idee===1?'Idee':'Ideen'}`:''}.`:zahl.idee?` <b>${zahl.idee}</b> Firmen warten darauf, dass wir sie ansprechen.`:'';
  const aufDemWeg=unterwegs+zahl.idee;
  // Freie Plätze aus der Partner-Engine (Belegungen): partner_kontingente rechnet seit 106 damit
  const K=(typeof PD!=='undefined'&&PD.d&&PD.d.kontingente)||null;
  const frei=K?Object.values(K).reduce((a,k)=>a+Math.max(0,(+k.max||0)-(+k.belegt||0)),0):null;
  const satz3=frei!=null?` In den Partnerstufen sind noch <b>${frei}</b> Plätze frei.`:'';
  const nW=typeof peKarten==='function'&&PE.d?peKarten(PE.d).jetzt:waechter.length;   // Karten zählen, nicht Einträge
  // Titel ist die wichtigste Aufgabe (Gegenzeichnen), darunter der Rest: „8 Verträge warten auf deine Unterschrift · Dazu: 1 Rechnung, 1 Warteliste“
  const nG=typeof peGegen==='function'&&PE.d?peGegen(PE.d).length:0, teile=typeof peFragenTeile==='function'&&PE.d?peFragenTeile(PE.d):[];
  const dgz=typeof PE!=='undefined'&&PE.d&&PE.d.darf_gegenzeichnen;   // zum Unterschreiben auffordern nur, wer den Verein vertreten darf
  const waTitel=nG?`${nG} ${nG===1?'Vertrag wartet':'Verträge warten'} auf ${dgz?'deine Unterschrift':'die Unterschrift des Vereins'}`:`${nW} ${nW===1?'Sache':'Sachen'} zu tun`;
  const waUnter=nG?[dgz?'':'Gib dem Vorstand kurz Bescheid',teile.length>1?'Dazu: '+teile.slice(1).join(', '):dgz?'In der Steuerung ansehen':''].filter(Boolean).join('. '):teile.join(', ');

  B.innerHTML=`<div class="pz">
    <section class="pz-hero">
      <img class="pz-bild" src="partner/hero.jpg" alt="" aria-hidden="true" onerror="this.remove()">
      <div class="pz-in">
        <span class="pz-hand">Saison ${pzE(pzSaison())}</span>
        <h2 class="pz-h1">Partner gewinnen</h2>
        <p class="pz-satz">${satz}<span class="pz-mehrsatz">${satz2}${satz3}</span></p>
        <nav class="pz-weg" aria-label="Der Weg zum Partner">${PZ_WEG.map(([k,l])=>`<button type="button" class="pz-st${PZ.st===k?' on':''}${zahl[k]?' voll':''}" data-pzst="${k}" aria-pressed="${PZ.st===k}">
            <i class="pz-dot" aria-hidden="true"></i><b>${zahl[k]}</b><span>${k==='angeschrieben'?'Ange\u00ADschrieben':l}</span></button>`).join('')}</nav>
        <div class="pz-akt"><button type="button" class="pz-b or" id="pzNeu">${SVI('plus')} Neue Firma</button>
          ${typeof ptStart==='function'?`<button type="button" class="pz-b pz-ter" id="pzTer" aria-label="Termin vorbereiten">${SVI('cal')} <span>Termin vorbereiten</span></button>`:''}</div>
      </div>
    </section>

    <section class="pz-papier">
      ${nW?`<button type="button" class="pz-waechter" id="pzWa"><span class="pz-wi">${SVI('bell')}</span><span><b>${pzE(waTitel)}</b><small>${pzE(waUnter||'In der Steuerung ansehen')}</small></span>${SVI('chev')}</button>`:''}
      <div class="pz-kopf"><h3 class="pz-h2">${startIdeen?'Mit diesen dreien anfangen':'Heute dran'}</h3>${startIdeen&&ideen.length?'<span class="pz-hand dk">die besten aus der Liste</span>':''}</div>
      ${heute.length?`<div class="pz-heute">${heute.map(x=>pzZeile(x,true)).join('')}</div>`:naechste.length?'<p class="pz-leer pz-nichts">Heute ist nichts fällig. Als Nächstes:</p>':'<p class="pz-leer">Noch keine Firma auf der Liste. Leg die erste mit „Neue Firma“ an.</p>'}
      ${naechste.length?`${heute.length?'<h3 class="pz-h2 pz-h3">Als Nächstes</h3>':''}<div class="pz-naechst">${naechste.map(x=>pzZeile(x,false)).join('')}</div>`:''}

      ${aufDemWeg?`<button type="button" class="pz-alle pz-zuf" id="pzFirmen">Alle ${aufDemWeg} Firmen unterwegs ${SVI('chev')}</button>`:''}
    </section>
  </div>`;

  // Eine Firmenliste: Stationen und „Alle … Firmen auf dem Weg“ öffnen den Reiter Firmen mit passendem Filter
  B.querySelectorAll('[data-pzst]').forEach(b=>b.onclick=()=>{ SPO.flt=b.dataset.pzst; SPO.q=''; pzWechsel('sponsoren'); });
  const fi=B.querySelector('#pzFirmen'); if(fi)fi.onclick=()=>{ SPO.flt='offen'; SPO.q=''; pzWechsel('sponsoren'); };
  B.querySelector('#pzNeu').onclick=()=>spoForm(null);
  const te=B.querySelector('#pzTer'); if(te)te.onclick=()=>ptStart();
  const wa=B.querySelector('#pzWa'); if(wa)wa.onclick=()=>{ if(typeof PE!=='undefined')PE.v='heute'; pzWechsel('steuerung'); };
  pzVerdrahten(B.querySelector('.pz-heute'));
}
// Tippt gerade jemand in die Suche? Dann nicht alles neu zeichnen.
function pzTippt(B){ const a=document.activeElement; return !!(a&&a.id==='pzQ'&&B.contains(a)); }
function pzVerdrahten(R){ if(!R)return;
  R.querySelectorAll('[data-pzgo]').forEach(b=>b.onclick=e=>{ e.stopPropagation(); pzLos(b.dataset.pzgo,b.dataset.pzk); });
  R.querySelectorAll('[data-pzweiter]').forEach(b=>b.onclick=e=>{ e.stopPropagation(); paEinmal(b,()=>pzWeiter(b.dataset.pzweiter)); });
  R.querySelectorAll('[data-pzakte]').forEach(r=>{ r.onclick=()=>{ if(typeof SWX!=='undefined'&&Date.now()-SWX.just<400)return; spoSponsor(r.dataset.pzakte); }; r.onkeydown=e=>{ if(e.key==='Enter'&&e.target===r)spoSponsor(r.dataset.pzakte); }; }); }
function pzSaison(){ const d=new Date(), y=d.getFullYear()%100, a=d.getMonth()>=6?y:y-1; return String(a).padStart(2,'0')+'/'+String(a+1).padStart(2,'0'); }
function pzWechsel(v){ spoWechsel(v); try{ document.getElementById('panel-sponsoring').scrollIntoView({block:'start'}); }catch(e){} }

function pzZeile(x,gross){
  const s=pzSchritt(x), w=pzWert(x), i=PZ_WEG.findIndex(z=>z[0]===x.status), naechst=PZ_WEG[i+1];
  const unter=[x.branche,pzOrt(x),x.pate?'Pate: '+x.pate:''].filter(Boolean).join(' · ');
  const gz=s.k==='gegen'||s.k==='gz-ab';   // wartet auf eure Unterschrift: statt Nachfassen und Wiedervorlage den Grund zeigen
  const tipp=gz?s.h:x.status==='idee'&&x.naechster&&!/^Erstansprache planen$/i.test(x.naechster)?x.naechster:(x.naechster&&x.status!=='idee'?x.naechster:'');
  const spur=PZ_WEG.slice(0,5).map((z,j)=>`<i class="${j<i?'d':j===i?'a':''}"></i>`).join('');
  // lange nichts gehört (Angeschrieben oder Angebot, 14 Tage ohne Eintrag)
  const ruhe=['angeschrieben','angebot'].includes(x.status)?pzStill(x):null, still=ruhe&&ruhe.tage>=14;
  return `<article class="pz-z${gross?' gr':''}" data-pzakte="${pzE(x.id)}" tabindex="0" aria-label="${pzE(x.firma)} öffnen">
    <span class="pz-lg" style="--lc:${pzFarbe(x.firma)}" aria-hidden="true">${pzE(pzKurz(x.firma))}</span>
    <div class="pz-zt"><b>${pzE(x.firma)}${x.vip?' <span class="pz-vip" title="VIP-Firma" aria-label="VIP-Firma">★</span>':''}${typeof spoNeuK==='function'&&spoNeuK(x)?' <span class="pz-best pz-neuk">Neues Konzept</span>':x.bestand?' <span class="pz-best">Bestand</span>':''}</b><small>${pzE(unter)}${w.prio?` <em class="pz-prio p${w.prio}"${w.score?` title="Bewertung ${w.score} von 100"`:''}>${PZ_PRIO[w.prio]}</em>`:''}</small>
      ${tipp?`<span class="pz-tipp">${pzE(tipp)}</span>`:!x.faellig&&s.h&&x.status!=='partner'?`<span class="pz-tipp pz-grund">${pzE(s.h)}</span>`:''}${x.faellig&&x.status!=='partner'&&!gz?`<span class="pz-tipp${x.faellig<=svtHeute()?' rot':''}">${SVI('clock')} ${pzE(spoDat(x.faellig))}</span>`:''}
      ${still?`<span class="pz-ruhe">Seit dem ${pzE(spoDat(ruhe.am))} nichts mehr vermerkt</span>`:''}
      <span class="pz-spur" aria-label="Station ${i+1} von 5">${spur}</span></div>
    <div class="pz-zb"><button type="button" class="pz-go" data-pzgo="${pzE(x.id)}" data-pzk="${s.k}">${SVI(s.ic)}<span>${s.t}</span></button>
      ${pzZweiter(x,s,naechst)}</div>
  </article>`;
}

// Zweiter Knopf neben dem nächsten Schritt: nie dieselbe Handlung doppelt. Beim Angebot nur, wenn der erste „Nachfassen“ ist, dann „Hat zugesagt“.
function pzZweiter(x,s,naechst){ if(!naechst||x.status==='partner')return ''; if(x.status==='angebot'&&s.k!=='nachfassen')return '';
  const t=x.status==='idee'?'Schon erledigt':x.status==='angebot'?'Hat zugesagt':x.status==='angeschrieben'?'Hat geantwortet':x.status==='gespraech'?'Angebot gemacht':'Weiter zu '+naechst[1].replace(/\u00AD/g,'');
  return `<button type="button" class="pz-weiter" data-pzweiter="${pzE(x.id)}" title="${x.status==='angebot'?'Vertrag unterschreiben':'Stand auf '+pzE(naechst[1])+' setzen'}" aria-label="${pzE(x.firma)}: ${pzE(t.toLowerCase())}">${pzE(t)} ${SVI('chev')}</button>`; }
async function pzWeiter(id){
  const x=SPO.S.find(s=>s.id===id); if(!x)return; const n=SPO_WEITER[x.status]; if(!n)return; const alt=x.status;
  if(n==='partner'){ // Partner wird man über den Vertrag, nicht über einen Knopf
    return pzLos(id,pzDeck(x)?'abschluss':'vertrag'); }
  try{ const lid=await spoStatus(x,n,true); await spoReload();
    kToast(x.firma+': '+SPO_STL[n],'Rückgängig',async()=>{ await spoStatusZurueck(x,alt,lid); await spoReload(); }); }catch(e){ kToast('⚠️ '+(e.message||e)); }
}

function pzLos(id,k){
  const x=SPO.S.find(s=>s.id===id); if(!x)return;
  if(k==='schreiben'||k==='nachfassen'||k==='nachhaken'||k==='verlaengerung')return pzNachricht(x,k);
  if(k==='termin'&&typeof ptStart==='function')return ptStart(pzVor(x));
  if((k==='zeigen'||k==='abschluss')&&pzDeck(x)){ const d=pzDeck(x); const u=(typeof ptLink==='function'?ptLink(d.code):svBasis()+'partner.html#d='+d.code)+(k==='abschluss'?'&s=abschluss':''); window.open(u,'_blank')||(location.href=u); return; }
  if(k==='vertrag')return spoVertragLos(x);
  const w=pzWartet(x);
  if(k==='gegen'&&w&&PE.d.darf_gegenzeichnen)return w.hat_unterschrift_partner?peGegenzeichnen(w):peAnnehmen(w);
  if(k==='gz-ab'&&w&&PE.d.darf_vertrag)return peAblehnen(w);
  spoSponsor(id);
}
function pzVor(x){ return {id:x.id,firma:x.firma,web:x.web,anrede:x.anrede||'',ansprech:x.ansprechpartner,email:x.email,adresse:[x.strasse,x.ort].filter(Boolean).join(', '),notiz:''}; }
// Vertrag abschließen: eine Vertragsquelle (Partner-Engine). Die Firma unterschreibt in ihrer persönlichen Präsentation.
// Gibt es schon eine, öffnet sie direkt beim Abschluss, sonst „Termin vorbereiten“ mit der Firma vorbefüllt.
async function spoVertragLos(x){
  if(!x)return;
  if(typeof PD!=='undefined'&&!PD.d&&typeof pdLaden==='function'){ try{ await pdLaden(); }catch(e){} }
  const d=pzDeck(x);
  if(d){ try{ closeOverlay(); }catch(e){} const u=(typeof ptLink==='function'?ptLink(d.code):svBasis()+'partner.html#d='+d.code)+'&s=abschluss'; window.open(u,'_blank')||(location.href=u); return; }
  if(typeof ptStart==='function'){ ptStart(pzVor(x)); kToast('Für '+x.firma+' gibt es noch keine Präsentation. Erst vorbereiten, dann darin unterschreiben.'); }
}

// ---------- Anschreiben / Nachhaken / Nachfassen: Nachricht ist vorgeschrieben ----------
// Anrede „Guten Tag Herr/Frau Nachname,“ (Anrede aus der Firma oder ihrer Präsentation), ohne Anrede „Guten Tag,“.
// Gibt es schon eine Präsentation, kommt ihr Link mit (öffentlicher Link, ohne Anmeldung).
// Impressum der Präsentation vollständig? (§ 5 DDG: Vertretungsberechtigte, Register, Anschrift)
function paImpressumFehlt(){ const v=(typeof PE!=='undefined'&&PE.d&&PE.d.verein)||(typeof SPO!=='undefined'&&SPO.verein)||{}, t=k=>String(v[k]||'').trim();
  return [t('vorstand')?'':'die Namen des Vorstands', t('register')?'':'das Registergericht', t('strasse')&&t('ort')?'':'die Anschrift'].filter(Boolean); }
// Zustimmung der Firma zu Mail und WhatsApp notieren: Datum, wer, wie
function pzZustimmung(x,k){
  const M=svModal(`<div class="og-form pa-blatt"><div class="pa-bk"><h2>Zustimmung notieren</h2><button type="button" class="pa-bx" id="pzZx">Zurück</button></div>
    <p>${pzE(x.firma)} ist einverstanden, dass wir per Mail oder WhatsApp schreiben.</p>
    <label class="og-fl">Wann<input type="date" id="pzZd" value="${pzE(svtHeute())}"></label>
    <label class="og-fl">Wer hat zugestimmt<input id="pzZw" maxlength="120" value="${pzE(x.ansprechpartner||'')}"></label>
    <label class="og-fl">Wie<select id="pzZh"><option>im Gespräch</option><option>am Telefon</option><option>per Mail</option><option>schriftlich</option></select></label>
    <div class="btnrow sbact"><button type="button" class="btn" id="pzZok">${SVI('check')} Zustimmung speichern</button></div></div>`);
  M.querySelector('#pzZx').onclick=()=>pzNachricht(x,k);
  const ok=M.querySelector('#pzZok'); ok.onclick=()=>paEinmal(ok,async()=>{
    try{ await svtRpc('partner_einwilligung_notieren',{p_sponsor:x.id,p_am:M.querySelector('#pzZd').value,p_wer:M.querySelector('#pzZw').value.trim(),p_wie:M.querySelector('#pzZh').value});
      x.einwilligung={am:M.querySelector('#pzZd').value,wer:M.querySelector('#pzZw').value.trim(),wie:M.querySelector('#pzZh').value}; const y=SPO.S.find(s=>s.id===x.id); if(y)y.einwilligung=x.einwilligung;
      kToast('✓ Zustimmung notiert'); pzNachricht(x,k); }catch(e){ kToast('⚠️ '+(e.message||e)); } },'Speichert …'); }
function pzText(x,k){
  const ich=((window.SVBC&&SVBC.profile)||{}).name||'', d=pzDeck(x);
  const anrede=paAnrede(x.anrede||(d&&d.anrede)||'',x.ansprechpartner||(d&&d.ansprech)||'');
  const link=d&&typeof pdLink==='function'?pdLink(d.code):'';
  const ort=pzOrt(x)||'der Region';
  const gruss=`Viele Grüße
${ich}
SV/BSC Mörlenbach, Fußball`;
  if(k==='nachhaken')return {betreff:'Kurz nachgehakt: '+x.firma+' und der SV/BSC',text:`${anrede}

${(typeof spoLetzter==='function'&&(spoLetzter(x.id)||{}).art)==='anruf'?'wir hatten vor ein paar Tagen telefoniert. Ich wollte mich wie besprochen noch einmal melden.':'ich hatte dir vor ein paar Tagen wegen einer Partnerschaft mit unserer Fußballabteilung geschrieben. Vielleicht ist die Nachricht untergegangen.'} Hast du in den nächsten Wochen 20 Minuten für ein kurzes Treffen? Ich komme gern bei euch vorbei.${link?`

Hier kannst du schon mal reinschauen: ${link}`:''}

${gruss}`};
  if(k==='praesentation')return {betreff:'Eure Übersicht vom SV/BSC Mörlenbach',text:`${anrede}
