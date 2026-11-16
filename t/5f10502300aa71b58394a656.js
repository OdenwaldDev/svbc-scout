  vstListe();
}

/* ---------- Übersicht ---------- */
function vstListe(){
  const P = vstPanel(); const D = VST.L || { liste:[] }; const h = vstHeute();
  const kommend = D.liste.filter(x => (x.bis || x.datum) >= h), vorbei = D.liste.filter(x => (x.bis || x.datum) < h).reverse();
  const karte = x => `<button type="button" class="vst-k${x.status === 'abgesagt' ? ' ab' : ''}" data-vst="${vstE(x.id)}">
      <span class="vst-kd"><b>${vstE(vstTag(x.datum).split(',')[1] || '')}</b><small>${vstE(vstTag(x.datum).split(',')[0])}</small></span>
      <span class="vst-kt"><b>${vstE(x.titel)}</b><small>${vstE([x.zeit ? x.zeit + ' Uhr' : '', x.ort].filter(Boolean).join(' · ') || x.art_titel)}</small>
        ${vstBalken(x.zahlen)}
        ${(x.kinder || []).length ? `<small class="vst-kk">${x.kinder.length} ${x.kinder.length === 1 ? 'Teil' : 'Teile'}: ${vstE(x.kinder.map(k => k.titel).join(', '))}</small>` : ''}</span>
      <span class="vst-ks"><i class="vst-st s-${vstE(x.status)}">${vstE(VST_STATUS[x.status] || x.status)}</i>${x.zahlen && x.zahlen.meine ? `<small>${x.zahlen.meine}× du</small>` : ''}${SVI('chev')}</span></button>`;
  P.innerHTML = `<div class="vst-kopf"><div><h2>Veranstaltungen</h2><p>Plane Bereiche und Schichten, frag Helfer an und behalte im Blick, was noch fehlt.</p></div>
      ${D.darf_neu ? `<button type="button" class="btn" id="vstNeu">${SVI('plus')} Neue Veranstaltung</button>` : ''}</div>
    ${kommend.length ? `<div class="vst-liste" role="list">${kommend.map(karte).join('')}</div>` : `<div class="card vst-leer"><b>Noch nichts geplant.</b><p>${D.darf_neu ? 'Leg die erste Veranstaltung an. Aus dem Kalender kommen größere Termine automatisch dazu.' : 'Sobald dich jemand in einer Veranstaltung einträgt, steht sie hier.'}</p></div>`}
    ${vorbei.length ? `<button type="button" class="vst-vor" id="vstVor" aria-expanded="${VST.vergangen}">${VST.vergangen ? 'Vergangene ausblenden' : `Vergangene (${vorbei.length})`}</button>${VST.vergangen ? `<div class="vst-liste alt" role="list">${vorbei.map(karte).join('')}</div>` : ''}` : ''}`;
  P.querySelectorAll('[data-vst]').forEach(b => b.onclick = () => vstOeffnen(b.dataset.vst));
  const n = P.querySelector('#vstNeu'); if(n) n.onclick = () => vstBearbeiten(null);
  const v = P.querySelector('#vstVor'); if(v) v.onclick = () => { VST.vergangen = !VST.vergangen; vstListe(); };
}
function vstOeffnen(id){ VST.v = 'detail'; VST.id = id; VST.seg = 'plan'; VST.helfer = null; vstDetail(id); try{ scrollTo(0, 0); }catch(e){} }
function vstZurueck(){ VST.v = 'liste'; VST.id = null; VST.d = null; vstStart(); }

/* ---------- Eine Veranstaltung ---------- */
async function vstDetail(id, still){
  const P = vstPanel(); if(!P) return;
  if(!still) P.innerHTML = '<div class="card"><div class="empty">Lade …</div></div>';
  try{ VST.d = await vstRpc('vst_laden', { p_id: id }); }catch(e){ P.innerHTML = `<div class="card"><div class="empty">${vstE(e.message)}</div><div class="btnrow"><button type="button" class="btn ghost" id="vstZ">Zurück</button></div></div>`; P.querySelector('#vstZ').onclick = vstZurueck; return; }
  vstZeigen();
}
function vstZeigen(){
  const P = vstPanel(), d = VST.d; if(!P || !d) return;
  const st = d.stufe, z = d.zahlen || {};
  const segs = [['plan','Plan'], ...(st >= 2 && d.helfer_darf ? [['helfer','Helfer']] : []), ['team','Team'], ...(st >= 2 ? [['liste','Checkliste']] : [])];
  if(!segs.some(s => s[0] === VST.seg)) VST.seg = 'plan';
  P.innerHTML = `<button type="button" class="vst-zur" id="vstZ">${SVI('chev')} ${d.ober ? vstE(d.ober.titel) : 'Alle Veranstaltungen'}</button>
    <div class="card vst-head">
      <div class="vst-h1"><div><h2>${vstE(d.titel)}</h2><p>${vstE(vstWann(d))}${d.ort ? ' · ' + vstE(d.ort) : ''}</p>
        <p class="vst-lt">${d.verantwortlich_name ? 'Leitung: ' + vstE(d.verantwortlich_name) : 'Noch ohne Leitung'}</p></div>
        <i class="vst-st s-${vstE(d.status)}">${vstE(VST_STATUS[d.status] || d.status)}</i></div>
      ${d.beschreibung ? `<p class="vst-bes">${vstE(d.beschreibung)}</p>` : ''}
      <div class="vst-zahlen"><div><b>${z.belegt || 0}<small>/${z.plaetze || 0}</small></b><span>Plätze besetzt</span></div>
        <div><b>${z.schichten || 0}</b><span>Schichten</span></div><div><b>${(z.punkte || 0) - (z.erledigt || 0)}</b><span>Punkte offen</span></div></div>
      <div class="vst-akt">${st >= 3 ? `<button type="button" class="btn ghost" id="vstBe">${SVI('sliders')} Bearbeiten</button>` : ''}
        <button type="button" class="btn ghost" id="vstEx">${SVI('download')} Exportieren</button>
        ${st >= 2 ? `<button type="button" class="btn ghost" id="vstTx">${SVI('copy')} Text für die Gruppe</button>` : ''}</div>
    </div>
    <div class="seg4 vst-seg" role="tablist">${segs.map(([k, t]) => `<button type="button" role="tab" aria-selected="${VST.seg === k}" class="${VST.seg === k ? 'on' : ''}" data-seg="${k}">${t}</button>`).join('')}</div>
    <div id="vstInhalt"></div>`;
  P.querySelector('#vstZ').onclick = () => d.ober ? vstOeffnen(d.ober.id) : vstZurueck();
  P.querySelectorAll('[data-seg]').forEach(b => b.onclick = () => { VST.seg = b.dataset.seg; vstZeigen(); });
  const be = P.querySelector('#vstBe'); if(be) be.onclick = () => vstBearbeiten(d);
  P.querySelector('#vstEx').onclick = () => vstExport(d);
  const tx = P.querySelector('#vstTx'); if(tx) tx.onclick = () => vstGruppenText(d);
  const I = P.querySelector('#vstInhalt');
  if(VST.seg === 'plan') vstPlan(I, d); else if(VST.seg === 'helfer') vstHelfer(I, d); else if(VST.seg === 'team') vstTeam(I, d); else vstCheckliste(I, d);
}

/* ---------- Plan: Unterveranstaltungen, Bereiche, Schichten ---------- */
function vstPlan(I, d){
  const st = d.stufe, B = d.bereiche || [], S = d.schichten || [];
  const mehrtag = d.bis && d.bis !== d.datum;
  const schicht = x => { const frei = Math.max(0, x.p - x.h.length);
    return `<div class="vst-s" data-s="${vstE(x.id)}">
      <div class="vst-sk"><b>${vstE(x.von ? (mehrtag ? vstTag(vstTagIso(x.von)) + ', ' : '') + vstUhr(x.von) + (x.bis ? ' bis ' + vstUhr(x.bis) : '') + ' Uhr' : 'Ohne Uhrzeit')}</b>
        <span>${vstE(x.st)}${x.auf ? ' · ' + vstE(x.auf) : ''}</span>${x.hin ? `<small>${vstE(x.hin)}</small>` : ''}</div>
      <div class="vst-sp">${x.h.map((h, i) => `<span class="vst-p${h.hp ? ' hp' : ''}">${vstE(h.n || '?')}${x.darf ? `<button type="button" aria-label="${vstE(h.n)} austragen" data-raus="${i}" data-sid="${vstE(x.id)}">${SVI('x')}</button>` : ''}</span>`).join('')}
        ${frei ? (x.darf ? `<button type="button" class="vst-frei" data-rein="${vstE(x.id)}">${SVI('plus')} ${frei} frei</button>` : `<span class="vst-frei aus">${frei} frei</span>`) : '<span class="vst-voll">voll</span>'}</div>
      ${x.darf ? `<button type="button" class="vst-sb" data-sbe="${vstE(x.id)}" aria-label="Schicht bearbeiten">${SVI('sliders')}</button>` : ''}</div>`; };
  const bereich = b => { const L = S.filter(x => x.b === b.id), pl = L.reduce((a, x) => a + x.p, 0), bel = L.reduce((a, x) => a + Math.min(x.p, x.h.length), 0);
    return `<div class="card vst-b"><div class="vst-bk"><div><h3>${vstE(b.titel)}</h3><small>${b.leitung_name ? 'Leitung: ' + vstE(b.leitung_name) : 'Ohne Leitung'}${pl ? ` · ${bel} von ${pl} besetzt` : ''}</small>${b.notiz ? `<p>${vstE(b.notiz)}</p>` : ''}</div>
        ${st >= 2 ? `<button type="button" class="btn ghost sm" data-bbe="${vstE(b.id)}">Bearbeiten</button>` : ''}</div>
      ${L.map(schicht).join('') || '<p class="vst-nix">Noch keine Schicht.</p>'}
      ${b.darf ? `<button type="button" class="vst-add" data-sneu="${vstE(b.id)}">${SVI('plus')} Schicht in ${vstE(b.titel)}</button>` : ''}</div>`; };
  const ohne = S.filter(x => !x.b || !B.some(b => b.id === x.b));
  I.innerHTML = `${(d.kinder || []).length ? `<div class="card vst-kinder"><div class="vst-bk"><div><h3>Teile der Veranstaltung</h3><small>Eigene Termine mit eigenen Schichten, zum Beispiel Aufbau am Vortag</small></div>
        ${st >= 3 ? `<button type="button" class="btn ghost sm" id="vstKneu">${SVI('plus')} Teil</button>` : ''}</div>
      ${(d.kinder || []).map(k => `<button type="button" class="vst-kz" data-vst="${vstE(k.id)}"><span><b>${vstE(k.titel)}</b><small>${vstE(vstTag(k.datum))}${k.zeit ? ', ' + vstE(k.zeit) + ' Uhr' : ''}</small></span>${vstBalken(k.zahlen)}${SVI('chev')}</button>`).join('')}</div>` : ''}
    ${B.map(bereich).join('')}
    ${ohne.length ? `<div class="card vst-b"><div class="vst-bk"><div><h3>${B.length ? 'Ohne Bereich' : 'Schichten'}</h3></div></div>${ohne.map(schicht).join('')}</div>` : ''}
    ${!B.length && !S.length ? `<div class="card vst-leer"><b>Noch kein Plan.</b><p>Leg Bereiche wie Theke, Kasse oder Aufbau an und darin die Schichten. ${st >= 3 ? 'Oder übernimm den Plan einer früheren Veranstaltung.' : ''}</p>
      ${st >= 2 ? `<div class="btnrow"><button type="button" class="btn" id="vstBneu0">${SVI('plus')} Bereich anlegen</button></div>` : ''}</div>` : ''}
    ${st >= 2 ? `<div class="vst-plus"><button type="button" class="btn ghost" id="vstBneu">${SVI('plus')} Bereich</button><button type="button" class="btn ghost" id="vstSneu">${SVI('plus')} Schicht</button>
      ${st >= 3 ? `<button type="button" class="btn ghost" id="vstKopie">${SVI('copy')} Wie beim letzten Mal</button>${d.oberliste ? '' : `<button type="button" class="btn ghost" id="vstKneu">${SVI('plus')} Teil, zum Beispiel Aufbau am Vortag</button>`}` : ''}</div>` : ''}`;
  I.querySelectorAll('[data-vst]').forEach(b => b.onclick = () => vstOeffnen(b.dataset.vst));
  I.querySelectorAll('[data-rein]').forEach(b => b.onclick = () => vstPersonWahl(S.find(x => x.id === b.dataset.rein)));
  I.querySelectorAll('[data-raus]').forEach(b => b.onclick = async e => { e.stopPropagation(); if(b.disabled) return; b.disabled = true;
    const x = S.find(s => s.id === b.dataset.sid), h = x && x.h[+b.dataset.raus]; if(!h) return;
    const wer = h.u ? { u: h.u } : h.hp ? { hp: h.hp } : { n: h.n };
    if(await vstAktion('vst_person', { p_schicht: x.id, p: { raus: wer } })){
      kToast(`${h.n || 'Person'} ausgetragen`, 'Rückgängig', () => vstAktion('vst_person', { p_schicht: x.id, p: h.u ? { u: h.u } : h.hp && d.stufe >= 2 ? { hp: h.hp } : { n: h.n } }, 'Wieder eingetragen')); }
    else b.disabled = false; });
  I.querySelectorAll('[data-sbe]').forEach(b => b.onclick = () => vstSchichtForm(S.find(x => x.id === b.dataset.sbe)));
  I.querySelectorAll('[data-sneu]').forEach(b => b.onclick = () => vstSchichtForm({ b: b.dataset.sneu }));
  I.querySelectorAll('[data-bbe]').forEach(b => b.onclick = () => vstBereichForm(B.find(x => x.id === b.dataset.bbe)));
  const q = (id, fn) => { const b = I.querySelector(id); if(b) b.onclick = fn; };
  q('#vstBneu', () => vstBereichForm(null)); q('#vstBneu0', () => vstBereichForm(null)); q('#vstSneu', () => vstSchichtForm({})); q('#vstKneu', () => vstBearbeiten(null, d)); q('#vstKopie', () => vstKopieWahl(d));
}
async function vstAktion(fn, args, ok){
  try{ const r = await vstRpc(fn, args); if(r && r.id && r.stufe != null){ VST.d = r; } else await vstDetail(VST.id, true); vstZeigen(); if(ok) kToast(ok); return true; }
  catch(e){ kToast(e.message); return false; } }

/* ---------- Formulare ---------- */
function vstFeld(id, l, v, typ, extra){ return `<div class="vst-f"><label for="${id}">${l}</label><input id="${id}" type="${typ || 'text'}" value="${vstE(v || '')}" ${extra || ''}></div>`; }
function vstLeuteOpt(sel, leer){ const L = (VST.d && VST.d.leute) || []; return `<option value="">${leer || 'niemand'}</option>` + L.map(p => `<option value="${vstE(p.id)}"${p.id === sel ? ' selected' : ''}>${vstE(p.name)}</option>`).join(''); }
function vstBearbeiten(d, ober){
  const neu = !d, D = VST.L || {};
  svModal(`<div class="mhead"><div><h2 style="margin:0">${neu ? (ober ? 'Neuer Teil von ' + vstE(ober.titel) : 'Neue Veranstaltung') : 'Veranstaltung bearbeiten'}</h2>
      <div class="msub">${neu && !ober ? 'Kommt auch in den Kalender, erst einmal nicht öffentlich.' : ''}</div></div></div>
    <div class="vst-form">${vstFeld('vfT', 'Titel', d ? d.titel : '', 'text', 'maxlength="120" required')}
      <div class="vst-zwei">${vstFeld('vfD', 'Datum', d ? d.datum : (ober ? ober.datum : ''), 'date')}${vstFeld('vfZ', 'Beginn', d ? d.zeit : '', 'time')}</div>
      ${ober ? '' : vstFeld('vfB', 'Bis (bei mehreren Tagen)', d ? d.bis : '', 'date')}
      ${vstFeld('vfO', 'Ort', d ? d.ort : (ober ? ober.ort : ''), 'text', 'maxlength="120"')}
      ${neu && !ober ? `<div class="vst-f"><label for="vfA">Vorlage</label><select id="vfA"><option value="sonstiges">Ohne Vorlage</option>${(D.vorlagen || []).filter(v => v.art !== 'sonstiges').map(v => `<option value="${vstE(v.art)}">${vstE(v.titel)} (${v.n} Punkte, ${v.s} Schichten)</option>`).join('')}</select></div>` : ''}
      ${!neu ? `<div class="vst-f"><label for="vfS">Stand</label><select id="vfS">${Object.entries(VST_STATUS).map(([k, t]) => `<option value="${k}"${d.status === k ? ' selected' : ''}>${t}</option>`).join('')}</select></div>
        <div class="vst-f"><label for="vfL">Leitung</label><select id="vfL">${vstLeuteOpt(d.verantwortlich, 'wie bisher')}</select></div>` : ''}
      <div class="vst-f"><label for="vfX">Worum es geht</label><textarea id="vfX" rows="3" maxlength="2000" placeholder="Für alle im Team: was wir machen, mit wem, was wichtig ist">${vstE(d ? d.beschreibung : '')}</textarea></div>
      ${!neu ? `<label class="vst-chk"><input type="checkbox" id="vfH" ${d.helfer_offen ? 'checked' : ''}> Helfer aus dem Pool dürfen sich über ihren Link selbst eintragen</label>` : ''}</div>
    <div class="btnrow sbact"><button class="btn" id="vfGo">${neu ? 'Anlegen' : 'Speichern'}</button><button class="btn ghost" id="vfAb">Abbrechen</button>
      ${!neu && d.stufe >= 3 && (d.oberliste || !d.event) ? '<button class="btn ghost" id="vfWeg">Löschen</button>' : ''}</div>`);
  const g = id => document.getElementById(id);
  g('vfAb').onclick = () => closeOverlay();
  g('vfGo').onclick = async () => { const p = { titel: g('vfT').value, datum: g('vfD').value, zeit: g('vfZ').value, ort: g('vfO').value, beschreibung: g('vfX').value };
    if(g('vfB')) p.bis = g('vfB').value; if(g('vfA')) p.art = g('vfA').value; if(g('vfS')) p.status = g('vfS').value; if(g('vfL') && g('vfL').value) p.leitung = g('vfL').value;
    if(g('vfH')) p.helfer_offen = g('vfH').checked; if(d) p.id = d.id; if(ober){ p.ober = ober.id; p.vorlage = false; } if(p.art === 'sonstiges') p.vorlage = false;
    if(String(p.titel).trim().length < 2) return kToast('Bitte einen Titel eintragen');
    if(!d && !ober && !p.datum) return kToast('Bitte ein Datum wählen');
    g('vfGo').disabled = true;
    try{ const id = await vstRpc('vst_speichern', { p }); closeOverlay(); VST.L = null; kToast(neu ? 'Angelegt' : 'Gespeichert'); vstOeffnen(id); }
    catch(e){ kToast(e.message); g('vfGo').disabled = false; } };
  const w = g('vfWeg'); if(w) w.onclick = async () => { if(!w.classList.contains('sure')){ w.classList.add('sure'); w.textContent = 'Wirklich löschen?'; return; }
    try{ await vstRpc('vst_loeschen', { p_id: d.id }); closeOverlay(); kToast('Gelöscht'); VST.L = null; if(d.ober) vstOeffnen(d.ober.id); else vstZurueck(); }catch(e){ kToast(e.message); } };
  setTimeout(() => { try{ g('vfT').focus(); }catch(e){} }, 50);
}
function vstBereichForm(b){
  const d = VST.d;
  svModal(`<div class="mhead"><div><h2 style="margin:0">${b ? 'Bereich bearbeiten' : 'Neuer Bereich'}</h2><div class="msub">Zum Beispiel Theke, Kasse, Küche, Aufbau</div></div></div>
    <div class="vst-form">${vstFeld('vbT', 'Name', b ? b.titel : '', 'text', 'maxlength="60"')}
      <div class="vst-f"><label for="vbL">Leitung (aus der App)</label><select id="vbL">${vstLeuteOpt(b ? b.leitung : null)}</select></div>
      ${vstFeld('vbLt', 'Oder Name, wenn nicht in der App', b && !b.leitung ? b.leitung_name : '', 'text', 'maxlength="80"')}
      <div class="vst-f"><label for="vbN">Notiz</label><textarea id="vbN" rows="2" maxlength="500">${vstE(b ? b.notiz : '')}</textarea></div>
      <p class="note small">Wer den Bereich leitet, kann dort selbst Schichten anlegen und Leute eintragen, auch ohne Orga-Recht.</p></div>
    <div class="btnrow sbact"><button class="btn" id="vbGo">Speichern</button><button class="btn ghost" id="vbAb">Abbrechen</button>${b ? '<button class="btn ghost" id="vbWeg">Löschen</button>' : ''}</div>`);
  const g = id => document.getElementById(id);
  g('vbAb').onclick = () => closeOverlay();
  g('vbGo').onclick = async () => { const p = { titel: g('vbT').value, leitung: g('vbL').value, leitung_text: g('vbLt').value, notiz: g('vbN').value }; if(b) p.id = b.id;
    if(!p.titel.trim()) return kToast('Bitte einen Namen eintragen');
    g('vbGo').disabled = true; if(await vstAktion('vst_bereich', { p_liste: d.id, p }, 'Gespeichert')) closeOverlay(); else g('vbGo').disabled = false; };
  const w = g('vbWeg'); if(w) w.onclick = async () => { if(!w.classList.contains('sure')){ w.classList.add('sure'); w.textContent = 'Löschen? Die Schichten bleiben unter „Ohne Bereich“'; return; }
    if(await vstAktion('vst_bereich', { p_liste: d.id, p: { id: b.id, weg: true } }, 'Bereich gelöscht')) closeOverlay(); };
}
function vstSchichtForm(x){
  const d = VST.d, B = (d.bereiche || []).filter(b => d.stufe >= 2 || b.darf), mehrtag = d.bis && d.bis !== d.datum;
  const tage = []; if(mehrtag){ for(let t = new Date(d.datum + 'T12:00:00'); t <= new Date(d.bis + 'T12:00:00'); t.setDate(t.getDate() + 1)) tage.push(t.toLocaleDateString('sv-SE')); }
  svModal(`<div class="mhead"><div><h2 style="margin:0">${x.id ? 'Schicht bearbeiten' : 'Neue Schicht'}</h2><div class="msub">${vstE(d.titel)}</div></div></div>
    <div class="vst-form">
      ${B.length ? `<div class="vst-f"><label for="vsB">Bereich</label><select id="vsB">${d.stufe >= 2 ? '<option value="">ohne Bereich</option>' : ''}${B.map(b => `<option value="${vstE(b.id)}"${x.b === b.id ? ' selected' : ''}>${vstE(b.titel)}</option>`).join('')}</select></div>` : ''}
      ${vstFeld('vsT', 'Station', x.st || '', 'text', 'maxlength="60" placeholder="zum Beispiel Theke 1"')}
      ${mehrtag ? `<div class="vst-f"><label for="vsTag">Tag</label><select id="vsTag">${tage.map(t => `<option value="${t}"${x.von && vstTagIso(x.von) === t ? ' selected' : ''}>${vstTag(t)}</option>`).join('')}</select></div>` : ''}
      <div class="vst-zwei">${vstFeld('vsV', 'Von', x.von ? vstUhr(x.von) : '', 'time')}${vstFeld('vsBi', 'Bis', x.bis ? vstUhr(x.bis) : '', 'time')}</div>
      ${vstFeld('vsP', 'Plätze (1 bis 20)', x.p || 2, 'number', 'min="1" max="20" inputmode="numeric"')}
      <p class="note small">Endet die Schicht nach Mitternacht, gilt das Ende für den nächsten Tag.</p>
      ${vstFeld('vsA', 'Aufgabe', x.auf || '', 'text', 'maxlength="200" placeholder="Was zu tun ist"')}
      ${vstFeld('vsH', 'Hinweis für die Helfer', x.hin || '', 'text', 'maxlength="200" placeholder="Treffpunkt, Kleidung, mitbringen"')}</div>
    <div class="btnrow sbact"><button class="btn" id="vsGo">Speichern</button><button class="btn ghost" id="vsAb">Abbrechen</button>${x.id ? '<button class="btn ghost" id="vsWeg">Löschen</button>' : ''}</div>`);
  const g = id => document.getElementById(id);
  g('vsAb').onclick = () => closeOverlay();
  g('vsGo').onclick = async () => { const p = { st: g('vsT').value, von: g('vsV').value, bis: g('vsBi').value, p: String(g('vsP').value || 2), auf: g('vsA').value, hin: g('vsH').value };
    if(g('vsB')) p.b = g('vsB').value || null; else if(x.b) p.b = x.b; if(g('vsTag')) p.tag = g('vsTag').value; if(x.id) p.id = x.id;
    if(!p.st.trim() && !p.b) return kToast('Bitte eine Station eintragen, zum Beispiel Theke 1');
    if(!p.von) return kToast('Bitte eintragen, wann die Schicht beginnt');
    const n = +g('vsP').value; if(!(n >= 1 && n <= 20)) return kToast('Plätze: zwischen 1 und 20');
    g('vsGo').disabled = true; if(await vstAktion('vst_schicht', { p_liste: d.id, p }, 'Gespeichert')) closeOverlay(); else g('vsGo').disabled = false; };
  const w = g('vsWeg'); if(w) w.onclick = async () => { if(!w.classList.contains('sure')){ w.classList.add('sure'); w.textContent = 'Wirklich löschen?'; return; }
    if(await vstAktion('vst_schicht', { p_liste: d.id, p: { id: x.id, weg: true } }, 'Schicht gelöscht')) closeOverlay(); };
}
// Wer kommt in die Schicht? Aus der App, aus dem Helferpool (Leitung und Team) oder nur ein Name
async function vstPersonWahl(x){
  if(!x) return; const d = VST.d;
  if(d.helfer_darf && !VST.helfer){ try{ VST.helfer = await vstRpc('vst_helfer', { p_liste: d.id }); }catch(e){ VST.helfer = { helfer:[] }; } }
  const drin = new Set(x.h.map(h => h.u || h.hp));
  const leute = (d.leute || []).filter(p => !drin.has(p.id)), pool = ((VST.helfer || {}).helfer || []).filter(h => !drin.has(h.id));
  svModal(`<div class="mhead"><div><h2 style="margin:0">Wer übernimmt?</h2><div class="msub">${vstE(x.st)}${x.von ? ', ' + vstE(vstUhr(x.von)) + ' Uhr' : ''}</div></div></div>
    <input type="search" class="search" id="vpQ" placeholder="Name suchen" autocomplete="off">
    <div class="vst-pw" id="vpL">
      ${pool.length ? `<h4>Helferpool</h4>${pool.map(h => `<button type="button" class="vst-pz" data-hp="${vstE(h.id)}" data-q="${vstE((h.vorname + ' ' + h.nachname).toLowerCase())}"><b>${vstE(h.vorname + ' ' + h.nachname)}</b><small>${h.passt ? 'passt zur Veranstaltung' : vstE((h.bereiche || []).join(', '))}</small></button>`).join('')}` : ''}
      ${leute.length ? `<h4>In der App</h4>${leute.map(p => `<button type="button" class="vst-pz" data-u="${vstE(p.id)}" data-q="${vstE(String(p.name).toLowerCase())}"><b>${vstE(p.name)}</b><small>${vstE(svRolleVon({ id:p.id, role:p.rolle }))}</small></button>`).join('')}` : ''}
    </div>
    <div class="vst-f"><label for="vpN">Oder nur einen Namen eintragen</label><div class="vst-zeile"><input id="vpN" type="text" maxlength="60" placeholder="Vor- und Nachname"><button class="btn" id="vpGo">Eintragen</button></div></div>`);
  let laeuft = false; const fertig = async p => { if(laeuft) return; laeuft = true; if(await vstAktion('vst_person', { p_schicht: x.id, p }, 'Eingetragen')) closeOverlay(); else laeuft = false; };
  document.querySelectorAll('#vpL [data-hp]').forEach(b => b.onclick = () => fertig({ hp: b.dataset.hp }));
  document.querySelectorAll('#vpL [data-u]').forEach(b => b.onclick = () => fertig({ u: b.dataset.u }));
  document.getElementById('vpGo').onclick = () => { const n = document.getElementById('vpN').value.trim(); if(n.length < 2) return kToast('Bitte einen Namen eintragen'); fertig({ n }); };
  const q = document.getElementById('vpQ'); q.oninput = () => { const v = q.value.trim().toLowerCase(); document.querySelectorAll('#vpL [data-q]').forEach(b => { b.hidden = v && !b.dataset.q.includes(v); }); };
}
async function vstKopieWahl(d){
  let F = []; try{ F = await vstRpc('vst_fruehere', { p_id: d.id }); }catch(e){ return kToast(e.message); }
  if(!F.length) return kToast('Keine frühere Veranstaltung mit Plan gefunden');
  svModal(`<div class="mhead"><div><h2 style="margin:0">Wie beim letzten Mal</h2><div class="msub">Bereiche, Schichten und Checkliste werden übernommen, Uhrzeiten aufs neue Datum verschoben. Personen und Zuständigkeiten nicht, die verteilst du neu.</div></div></div>
    <div class="vst-pw">${F.map(f => `<button type="button" class="vst-pz" data-k="${vstE(f.id)}"><b>${vstE(f.titel)}</b><small>${vstE(vstTag(f.datum, true))} · ${f.zahlen.bereiche} Bereiche, ${f.zahlen.schichten} Schichten</small></button>`).join('')}</div>`);
  let laeuft = false; document.querySelectorAll('[data-k]').forEach(b => b.onclick = async () => { if(laeuft) return; laeuft = true; if(await vstAktion('vst_kopieren', { p_quelle: b.dataset.k, p_ziel: d.id }, 'Übernommen')) closeOverlay(); else laeuft = false; });
}

/* ---------- Helfer anfragen ---------- */
async function vstHelfer(I, d){
  I.innerHTML = '<div class="card"><div class="empty">Lade den Helferpool …</div></div>';
  try{ VST.helfer = await vstRpc('vst_helfer', { p_liste: d.id }); }catch(e){ I.innerHTML = `<div class="card"><div class="empty">${vstE(e.message)}</div></div>`; return; }
  const H = VST.helfer.helfer || [], name = (typeof hpMeinName === 'function' && hpMeinName()) || svFirst(SVU.name || '');
  const text = h => `Hallo ${h.vorname},\n\nfür „${d.titel}“ am ${vstTag(d.datum)}${d.zeit ? ' ab ' + d.zeit + ' Uhr' : ''} suchen wir noch Helfer. Über deinen Link siehst du die freien Schichten und trägst dich mit einem Tipp ein:\n${VST_LINK}${h.token}${name ? '\n\nViele Grüße\n' + name : ''}`;
  const zeile = h => `<div class="vst-hz${h.drin ? ' drin' : ''}"><div><b>${vstE(h.vorname + ' ' + h.nachname)}</b>
      <small>${h.drin ? 'Eingetragen' : h.angefragt ? 'Angefragt am ' + vstE(typeof hfDatum === 'function' ? hfDatum(h.angefragt) : '') : h.passt ? 'Passt zur Veranstaltung' : vstE((h.bereiche || []).filter(b => b !== 'unsicher').join(', ') || 'ohne Bereich')}</small></div>
    <div class="vst-ha">${!VST.helfer.helfer_offen ? '' : h.handy ? `<a class="btn ghost sm" href="https://wa.me/${vstE(h.handy.replace('+', ''))}?text=${encodeURIComponent(text(h))}" target="_blank" rel="noopener" data-anf="${vstE(h.id)}" data-art="whatsapp">WhatsApp</a>` : ''}
      ${VST.helfer.helfer_offen && h.email ? `<a class="btn ghost sm" href="mailto:${vstE(h.email)}?subject=${encodeURIComponent('Helfer für ' + d.titel)}&body=${encodeURIComponent(text(h))}" data-anf="${vstE(h.id)}" data-art="mail">Mail</a>` : ''}</div></div>`;
  const passt = H.filter(h => h.passt && !h.drin), rest = H.filter(h => !h.passt && !h.drin), drin = H.filter(h => h.drin);
  I.innerHTML = `${!VST.helfer.helfer_offen ? `<div class="card vst-hinw"><b>Noch nicht freigegeben.</b><p>Erst nach der Freigabe sehen Helfer die freien Schichten über ihren Link. Danach kannst du sie hier per WhatsApp oder Mail anfragen.</p>
        ${d.stufe >= 3 ? '<button type="button" class="btn" id="vstFrei">Für den Helferpool freigeben</button>' : ''}</div>` : `<div class="card vst-hinw ok"><b>Freigegeben.</b><p>Jeder Helfer sieht über seinen persönlichen Link die freien Schichten. Der Link steht in der Nachricht, die du hier verschickst.</p></div>`}
    <div class="card"><h3 class="trh">Passend <small>${passt.length}</small></h3>${passt.map(zeile).join('') || `<p class="vst-nix">${H.length ? 'Niemand mit passendem Bereich offen.' : 'Im Helferpool ist noch niemand. Wer mithelfen will, trägt sich über die Helferseite ein.'}</p>`}</div>
    ${rest.length ? `<div class="card"><h3 class="trh">Weitere aus dem Pool <small>${rest.length}</small></h3>${rest.map(zeile).join('')}</div>` : ''}
    ${drin.length ? `<div class="card"><h3 class="trh">Schon eingetragen <small>${drin.length}</small></h3>${drin.map(zeile).join('')}</div>` : ''}`;
  I.querySelectorAll('[data-anf]').forEach(a => a.addEventListener('click', () => { vstRpc('vst_angefragt', { p_liste: d.id, p_helfer: a.dataset.anf, p_art: a.dataset.art }).catch(() => {}); }));
  const f = I.querySelector('#vstFrei'); if(f) f.onclick = () => vstAktion('vst_speichern', { p: { id: d.id, helfer_offen: true } }, 'Freigegeben').then(() => { VST.seg = 'helfer'; vstDetail(d.id, true); });
}

/* ---------- Team aus anderen Bereichen ---------- */
const VST_ROLLE = { leitung:['Leitung','plant alles, lädt ein, gibt frei'], team:['Team','arbeitet überall mit'], bereich:['Bereich','sieht alles, ändert nur im eigenen Bereich'] };
function vstTeam(I, d){
  const M = d.mitglieder || [], B = d.bereiche || [];
  I.innerHTML = `<div class="card"><h3 class="trh">Wer mitplant</h3>
      <p class="note small">Hol Leute aus anderen Bereichen dazu, zum Beispiel aus dem Partner-Team, eine Trainerin oder jemanden aus der Mannschaft. Sie sehen nur diese Veranstaltung.</p>
      <div class="vst-tz"><div><b>${vstE(d.verantwortlich_name || 'Noch offen')}</b><small>Leitung der Veranstaltung</small></div></div>
      ${B.filter(b => b.leitung_name).map(b => `<div class="vst-tz"><div><b>${vstE(b.leitung_name)}</b><small>Leitung ${vstE(b.titel)}</small></div></div>`).join('')}
      ${M.map(m => `<div class="vst-tz"><div><b>${vstE(m.name)}</b><small>${vstE(VST_ROLLE[m.rolle][0])}${m.rolle === 'bereich' ? ' ' + vstE((B.find(b => b.id === m.bereich) || {}).titel || '') : ''} · ${vstE(VST_ROLLE[m.rolle][1])}</small></div>
        ${d.stufe >= 3 ? `<button type="button" class="btn ghost sm" data-mraus="${vstE(m.u)}">Entfernen</button>` : ''}</div>`).join('')}
      ${d.stufe >= 3 ? `<div class="vst-form vst-mneu"><div class="vst-f"><label for="vmP">Person</label><select id="vmP">${vstLeuteOpt(null, 'Person wählen')}</select></div>
        <div class="vst-f"><label for="vmR">Rolle</label><select id="vmR">${Object.entries(VST_ROLLE).map(([k, v]) => `<option value="${k}"${k === 'team' ? ' selected' : ''}>${v[0]}: ${v[1]}</option>`).join('')}</select></div>
        <div class="vst-f" id="vmBf" hidden><label for="vmB">Bereich</label><select id="vmB">${B.map(b => `<option value="${vstE(b.id)}">${vstE(b.titel)}</option>`).join('')}</select></div>
        <button type="button" class="btn" id="vmGo">${SVI('plus')} Dazuholen</button></div>` : ''}</div>`;
  I.querySelectorAll('[data-mraus]').forEach(b => b.onclick = () => { if(!b.classList.contains('sure')){ b.classList.add('sure'); b.textContent = 'Wirklich entfernen?'; return; }
    vstAktion('vst_mitglied', { p_liste: d.id, p_user: b.dataset.mraus, p_rolle: null, p_bereich: null }, 'Entfernt'); });
  const r = I.querySelector('#vmR'); if(r){ const sync = () => { I.querySelector('#vmBf').hidden = r.value !== 'bereich'; }; r.onchange = sync; sync();
    I.querySelector('#vmGo').onclick = () => { const u = I.querySelector('#vmP').value; if(!u) return kToast('Bitte eine Person wählen'); if(r.value === 'bereich' && !B.length) return kToast('Leg zuerst einen Bereich an');
      vstAktion('vst_mitglied', { p_liste: d.id, p_user: u, p_rolle: r.value, p_bereich: r.value === 'bereich' ? I.querySelector('#vmB').value : null }, 'Dazugeholt'); }; }
}

/* ---------- Checkliste (die bestehenden Aufgaben & Checklisten) ---------- */
function vstCheckliste(I, d){
  const P = d.punkte || [], offen = P.filter(p => !p.e);
  I.innerHTML = `<div class="card"><h3 class="trh">Checkliste <small>${P.length - offen.length} von ${P.length} erledigt</small></h3>
      ${offen.slice(0, 8).map(p => `<div class="vst-cp"><span>${vstE(p.t)}</span><small>${vstE(p.wn || '')}${p.f ? ' · bis ' + vstE(vstTag(vstTagIso(p.f))) : ''}</small></div>`).join('') || '<p class="vst-nix">Alles erledigt.</p>'}
      ${offen.length > 8 ? `<p class="note small">und ${offen.length - 8} weitere</p>` : ''}
      <div class="btnrow"><button type="button" class="btn" id="vstCl">Checkliste öffnen</button></div></div>`;
  I.querySelector('#vstCl').onclick = () => { try{ ogOeffnen(d.id); }catch(e){ goTab('orga'); } };
}

/* ---------- Text für die WhatsApp-Gruppe ---------- */
function vstGruppenText(d){
  const S = d.schichten || [], B = d.bereiche || [];
  const zeile = x => `${x.von ? vstUhr(x.von) + (x.bis ? ' bis ' + vstUhr(x.bis) : '') : 'Zeit offen'} ${x.st}: ${x.h.map(h => (h.n || '').split(' ')[0]).join(', ') || 'noch frei'}${x.p > x.h.length ? ` (${x.p - x.h.length} frei)` : ''}`;
  const gruppen = B.map(b => [b.titel, S.filter(x => x.b === b.id)]).concat([['', S.filter(x => !x.b)]]).filter(g => g[1].length);
  const txt = `${d.titel}\n${vstWann(d)}${d.ort ? ', ' + d.ort : ''}\n\n` + gruppen.map(([t, L]) => (t ? t + '\n' : '') + L.map(zeile).join('\n')).join('\n\n')
    + (d.helfer_offen ? '\n\nFreie Schichten: über deinen persönlichen Helfer-Link eintragen.' : '');
  const t = txt;
  svModal(`<div class="mhead"><div><h2 style="margin:0">Text für die Gruppe</h2><div class="msub">Zum Kopieren in WhatsApp oder eine Mail</div></div></div>
    <textarea class="vst-txt" id="vtT" rows="12">${vstE(t)}</textarea>
    <div class="btnrow sbact"><button class="btn" id="vtC">${SVI('copy')} Kopieren</button><a class="btn ghost" href="https://wa.me/?text=${encodeURIComponent(t)}" target="_blank" rel="noopener">WhatsApp</a></div>`);
  document.getElementById('vtC').onclick = async () => { try{ await navigator.clipboard.writeText(document.getElementById('vtT').value); kToast('Kopiert'); }catch(e){ const a = document.getElementById('vtT'); a.select(); kToast('Markiert, jetzt kopieren'); } };
}

/* ---------- Export: Schichtplan (PDF zum Aushängen, Excel, CSV), Kalender (.ics), Kontakte (vCard) ---------- */
function vstKurz(n){ const t = String(n || '').trim().split(/\s+/); return t.length > 1 ? t[0] + ' ' + t[t.length - 1][0] + '.' : t[0] || ''; }
function vstBericht(d, aushang){
  const S = d.schichten || [], B = d.bereiche || [], mehrtag = d.bis && d.bis !== d.datum;
  const bn = id => (B.find(b => b.id === id) || {}).titel || '';
  const cols = [...(mehrtag ? ['Tag'] : []), 'Zeit', 'Bereich', 'Station', 'Aufgabe', 'Wer', 'Frei', 'Hinweis'];
  const rows = S.map(x => [...(mehrtag ? [x.von ? vstTag(vstTagIso(x.von)) : ''] : []), x.von ? vstUhr(x.von) + (x.bis ? ' bis ' + vstUhr(x.bis) : '') : '', bn(x.b), x.st, x.auf || '',
    x.h.map(h => aushang ? vstKurz(h.n) : h.n).join(', '), String(Math.max(0, x.p - x.h.length)), x.hin || '']);
  const P = d.punkte || [];
  return { titel: d.titel, sub: `${vstWann(d)}${d.ort ? ' · ' + d.ort : ''}${d.verantwortlich_name ? ' · Leitung ' + d.verantwortlich_name : ''}`,
    sections: [{ t: 'Schichtplan', cols, rows, note: `${(d.zahlen || {}).belegt || 0} von ${(d.zahlen || {}).plaetze || 0} Plätzen besetzt` },
      ...(B.length ? [{ t: 'Bereiche', cols: ['Bereich', 'Leitung', 'Notiz'], rows: B.map(b => [b.titel, b.leitung_name || '', b.notiz || '']) }] : []),
      ...(P.length ? [{ t: 'Checkliste', cols: ['Punkt', 'Wer', 'Fällig', 'Erledigt'], rows: P.map(p => [p.t, p.wn || '', p.f ? vstTag(vstTagIso(p.f)) : '', p.e ? 'ja' : '']) }] : [])] };
}
function vstIcs(d){
  const S = (d.schichten || []).filter(x => x.von);
  return S.map(x => ({ id: 'vst-' + x.id, titel: `${x.st}: ${d.titel}`, von: x.von, bis: x.bis || null, ort: d.ort || '', text: [x.auf, x.hin, x.h.length ? 'Dabei: ' + x.h.map(h => h.n).join(', ') : ''].filter(Boolean).join('\n') }));
}
function vstExport(d){
  const R = f => vstBericht(d, f === 'pdf');
  exDialog({ titel: d.titel, sub: 'Schichtplan, Bereiche und Checkliste. Im PDF zum Aushängen stehen nur Vornamen mit Initial.', bericht: R,
    formate: ['pdf', 'xlsx', 'csv', 'ics', ...(d.helfer_darf ? ['vcf'] : [])],
    ics: () => vstIcs(d),
    vcf: async () => { const H = (VST.helfer && VST.helfer.helfer) || (await vstRpc('vst_helfer', { p_liste: d.id })).helfer || []; return H.filter(h => h.drin).map(h => ({ name: h.vorname + ' ' + h.nachname, vorname: h.vorname, nachname: h.nachname, tel: h.handy, mail: h.email, notiz: 'Helfer ' + d.titel })); } });
}

/* ---------- Startseite: nächste Veranstaltung mit Belegung ---------- */
if(typeof HT_ZIEL !== 'undefined'){
  HT_ZIEL.veranstaltungen = ['veranstaltungen', 'cal', 'Veranstaltungen', '#e8741f'];
  if(typeof HT_TEXT !== 'undefined') HT_TEXT.veranstaltungen = 'Planen, Schichten, Helfer';
  ['vorstand', 'admin'].forEach(r => { const z = HT_ROLLE[r] && HT_ROLLE[r].z; if(z && !z.includes('veranstaltungen')) z.splice(Math.max(0, z.indexOf('orga')), 0, 'veranstaltungen'); });
  const _hs = htStand; htStand = function(k){ if(k !== 'veranstaltungen') return _hs.apply(this, arguments);
    const L = (VST.L && VST.L.liste) || [], h = vstHeute(), n = L.filter(x => (x.bis || x.datum) >= h && x.status !== 'abgesagt')[0];
    if(!VST.L && !VST.laedt){ VST.laedt = true; vstRpc('vst_uebersicht').then(d => { VST.L = d; VST.laedt = false; if(svCurTab() === 'home') htRender(); }).catch(() => { VST.laedt = false; }); }
    if(!n) return { t: 'Nichts geplant' };
    const z = n.zahlen || {}, frei = (z.plaetze || 0) - (z.belegt || 0);
    return { t: `${vstTag(n.datum)}: ${n.titel}${z.plaetze ? `, ${frei ? frei + ' Plätze frei' : 'alle Schichten besetzt'}` : ''}`, n: 0 }; };
}

/* =====================================================================
   Beta 0.75 · Export-Zentrale (Wunsch Albert, 04.11.2026)
   Ein Ort für alle Exporte, je Bereich durchdacht, immer nur das, was die eigene Rolle sehen darf (die Daten kommen aus denselben
   Server-Funktionen wie die Bereiche selbst, der Server prüft also mit).
   Formate: PDF (zum Lesen und Aushängen), Excel (zum Weiterrechnen), CSV (für andere Programme), Kalender (.ics) und Kontakte (.vcf).
   Wege: Herunterladen oder Teilen (Teilen-Menü des Handys: WhatsApp, Mail, Dateien, Drive).
   Die Dateien entstehen auf dem Gerät, es wird nichts zusätzlich auf dem Server gespeichert.
   ===================================================================== */
const EX_FMT = {
  pdf:  { t:'PDF',     s:'zum Lesen und Aushängen',      mime:'application/pdf' },
  xlsx: { t:'Excel',   s:'zum Weiterrechnen',            mime:'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' },
  csv:  { t:'CSV',     s:'für andere Programme',         mime:'text/csv;charset=utf-8' },
  ics:  { t:'Kalender', s:'Termine ins Handy oder Outlook', mime:'text/calendar;charset=utf-8' },
  vcf:  { t:'Kontakte', s:'ins Adressbuch',              mime:'text/vcard;charset=utf-8' } };
const exE = s => svEsc(s == null ? '' : String(s));
const exHeute = () => new Date().toLocaleDateString('sv-SE', { timeZone:'Europe/Berlin' });
const exName = (t, ext) => `${String(t || 'Export').replace(/[\\/:*?"<>|]/g, ' ').replace(/\s+/g, ' ').trim()} ${exHeute()}.${ext}`;
const exEur = v => (Math.round((+v || 0) * 100) / 100).toLocaleString('de-DE', { minimumFractionDigits:2, maximumFractionDigits:2 });
const exD = d => d ? new Date(String(d).length === 10 ? d + 'T12:00:00' : d).toLocaleDateString('de-DE', { day:'2-digit', month:'2-digit', year:'numeric', timeZone:'Europe/Berlin' }) : '';
async function exRpc(fn, args){ const { data, error } = await SVB.sb.rpc(fn, args || {}); if(error) throw new Error(svFehlerText(error)); return data; }

/* ---------- Dateien bauen ---------- */
function exCsv(s){ // Excel in Deutschland: Semikolon, UTF-8 mit BOM
  const q = v => { v = v == null ? '' : String(v); if(/^[=+\-@\t\r]/.test(v) && !/^-?\d+([.,]\d+)?$/.test(v)) v = "'" + v; return /[;"\n\r]/.test(v) ? '"' + v.replace(/"/g, '""') + '"' : v; };
  return '\ufeff' + [s.cols, ...s.rows.map(r => Array.isArray(r) ? r : s.cols.map(c => r[c]))].map(r => r.map(q).join(';')).join('\r\n'); }
function exIcsText(titel, E){
  const esc = v => String(v || '').replace(/\\/g, '\\\\').replace(/\r\n|\r|\n/g, '\\n').replace(/[,;]/g, m => '\\' + m);
  const utc = t => new Date(t).toISOString().replace(/[-:]/g, '').replace(/\.\d{3}/, '');
  const fold = l => { const o = []; while(l.length > 74){ o.push(l.slice(0, 74)); l = ' ' + l.slice(74); } o.push(l); return o.join('\r\n'); };
  const jetzt = utc(Date.now());
  const ev = e => { const ganz = /^\d{4}-\d{2}-\d{2}$/.test(e.von);
    const ende = ganz ? new Date(new Date((e.bis || e.von) + 'T12:00:00').getTime() + 864e5).toLocaleDateString('sv-SE').replace(/-/g, '') : utc(e.bis || new Date(new Date(e.von).getTime() + 2 * 36e5));
    return ['BEGIN:VEVENT', 'UID:' + esc(e.id) + '@svbsc.kaderwerk.pro', 'DTSTAMP:' + jetzt,
      ganz ? 'DTSTART;VALUE=DATE:' + e.von.replace(/-/g, '') : 'DTSTART:' + utc(e.von), ganz ? 'DTEND;VALUE=DATE:' + ende : 'DTEND:' + ende,
      'SUMMARY:' + esc(e.titel), ...(e.ort ? ['LOCATION:' + esc(e.ort)] : []), ...(e.text ? ['DESCRIPTION:' + esc(e.text)] : []), 'END:VEVENT'].map(fold).join('\r\n'); };
  return ['BEGIN:VCALENDAR', 'VERSION:2.0', 'PRODID:-//SV BSC Moerlenbach//Sportzentrale//DE', 'CALSCALE:GREGORIAN', 'X-WR-CALNAME:' + esc(titel), ...E.map(ev), 'END:VCALENDAR'].join('\r\n') + '\r\n'; }
function exVcfText(K){
  const esc = v => String(v || '').replace(/\\/g, '\\\\').replace(/\r\n|\r|\n/g, '\\n').replace(/[,;]/g, m => '\\' + m);
  return K.map(k => ['BEGIN:VCARD', 'VERSION:3.0', `N:${esc(k.nachname || '')};${esc(k.vorname || k.name || '')};;;`, 'FN:' + esc(k.name || ((k.vorname || '') + ' ' + (k.nachname || '')).trim()),
    ...(k.firma ? ['ORG:' + esc(k.firma)] : []), ...(k.tel ? ['TEL;TYPE=CELL:' + esc(k.tel)] : []), ...(k.mail ? ['EMAIL;TYPE=INTERNET:' + esc(k.mail)] : []),
    ...(k.notiz ? ['NOTE:' + esc(k.notiz)] : []), 'END:VCARD'].join('\r\n')).join('\r\n') + '\r\n'; }
function exB64Blob(b64, mime){ return sxBlob(b64, mime); }
// Alle gewählten Formate erzeugen: [{name, blob}]
async function exDateien(Q, fmts){
  const out = [], R = {}; const bericht = async f => { const k = f === 'pdf' ? 'pdf' : 'tab'; return R[k] || (R[k] = await Q.bericht(f)); };
  for(const f of fmts){
    if(f === 'pdf'){ const r = await bericht('pdf'); out.push({ name: exName(r.titel, 'pdf'), blob: exB64Blob(await sxPdf(r), EX_FMT.pdf.mime) }); }
    else if(f === 'xlsx'){ const r = await bericht('xlsx'); out.push({ name: exName(r.titel, 'xlsx'), blob: exB64Blob(await sxXlsx(r), EX_FMT.xlsx.mime) }); }
    else if(f === 'csv'){ const r = await bericht('csv'); r.sections.forEach(s => out.push({ name: exName(r.titel + (r.sections.length > 1 ? ' ' + s.t : ''), 'csv'), blob: new Blob([exCsv(s)], { type: EX_FMT.csv.mime }) })); }
    else if(f === 'ics' && Q.ics){ const E = await Q.ics(); if(E.length) out.push({ name: exName(Q.titel, 'ics'), blob: new Blob([exIcsText(Q.titel, E)], { type: EX_FMT.ics.mime }) }); }
    else if(f === 'vcf' && Q.vcf){ const K = await Q.vcf(); if(K.length) out.push({ name: exName(Q.titel + ' Kontakte', 'vcf'), blob: new Blob([exVcfText(K)], { type: EX_FMT.vcf.mime }) }); }
  }
  return out; }
function exLaden(D){ D.forEach((x, i) => setTimeout(() => { const a = document.createElement('a'); a.href = URL.createObjectURL(x.blob); a.download = x.name; document.body.appendChild(a); a.click(); setTimeout(() => { URL.revokeObjectURL(a.href); a.remove(); }, 4000); }, i * 350)); }

/* ---------- Dialog ---------- */
// Q: { titel, sub, bericht: async () => R (wie sxPdf/sxXlsx), formate: [...], ics?: async () => [...], vcf?: async () => [...], vorwahl?: [...] }
function exDialog(Q){
  const F = (Q.formate || ['pdf', 'xlsx']).filter(f => EX_FMT[f]), an = new Set(Q.vorwahl || [F[0]]);
  svModal(`<div class="mhead"><div class="rm-ic" style="width:46px;height:46px">${SVI('download')}</div><div class="ex-kt"><h2 style="margin:0">${exE(Q.titel)}</h2>${Q.sub ? `<div class="msub">${exE(Q.sub)}</div>` : ''}</div></div>
    <p class="ex-hw">Format wählen, mehrere gehen auch.</p>
    <div class="ex-fmt" role="group" aria-label="Format">${F.map(f => `<button type="button" class="ex-f${an.has(f) ? ' on' : ''}" data-f="${f}" aria-pressed="${an.has(f)}"><b>${EX_FMT[f].t}</b><span>${EX_FMT[f].s}</span></button>`).join('')}</div>
    <div id="exStat" class="ex-stat" role="status"></div>
    <div class="btnrow sbact"><button class="btn" id="exLad">${SVI('download')} Herunterladen</button>${navigator.share ? `<button class="btn ghost" id="exTeil">${SVI('share')} Teilen</button>` : ''}<button class="btn ghost" id="exAb">Schließen</button></div>`);
  document.querySelectorAll('.ex-fmt [data-f]').forEach(b => b.onclick = () => { const f = b.dataset.f; if(an.has(f)){ if(an.size > 1) an.delete(f); else return kToast('Mindestens ein Format bleibt gewählt'); } else an.add(f);
    b.classList.toggle('on', an.has(f)); b.setAttribute('aria-pressed', an.has(f)); fertig = null; const t = document.getElementById('exTeil'); if(t) t.innerHTML = `${SVI('share')} Teilen`; });
  document.getElementById('exAb').onclick = () => closeOverlay();
  let fertig = null; // vorbereitete Dateien: Safari teilt nur direkt nach einem Tipp, deshalb notfalls zweiter Tipp auf „Jetzt teilen“
  const teile = async (files, S, k) => { try{ await navigator.share({ files, title: Q.titel }); S.textContent = 'Geteilt.'; fertig = null; k.innerHTML = `${SVI('share')} Teilen`; }
    catch(e){ if(e && e.name === 'AbortError'){ S.textContent = ''; return; }
      if(e && e.name === 'NotAllowedError'){ fertig = files; k.innerHTML = `${SVI('share')} Jetzt teilen`; S.textContent = 'Fertig. Tipp auf „Jetzt teilen“.'; return; }
      S.textContent = 'Teilen ging nicht, bitte herunterladen.'; } };
  const los = async teilen => { const S = document.getElementById('exStat'), k = document.getElementById(teilen ? 'exTeil' : 'exLad');
    if(teilen && fertig){ k.disabled = true; await teile(fertig, S, k); k.disabled = false; return; }
    k.disabled = true; S.textContent = 'Erstelle …';
    try{ const D = await exDateien(Q, F.filter(f => an.has(f)));
      if(!D.length){ S.textContent = Q.leer || 'Für diese Auswahl gibt es noch keine Einträge.'; k.disabled = false; return; }
      if(teilen){ const files = D.map(x => new File([x.blob], x.name, { type: x.blob.type }));
        if(navigator.canShare && navigator.canShare({ files })) await teile(files, S, k);
        else { exLaden(D); S.textContent = 'Dieses Gerät kann keine Dateien teilen, deshalb heruntergeladen.'; } }
      else { exLaden(D); S.textContent = D.length === 1 ? D[0].name + ' heruntergeladen.' : D.length + ' Dateien heruntergeladen.'; }
    }catch(e){ S.textContent = e.message || String(e); }
    k.disabled = false; };
  document.getElementById('exLad').onclick = () => los(false);
  const t = document.getElementById('exTeil'); if(t) t.onclick = () => los(true);
}

/* ---------- Quellen je Bereich ---------- */
const EX_QUELLEN = [
  { k:'vst', gruppe:'Veranstaltungen und Helfer', tab:'veranstaltungen', titel:'Veranstaltungen mit Schichtplan', text:'Alle kommenden Veranstaltungen, alle Schichten mit Bereich, Aufgabe und wer eingetragen ist', formate:['pdf', 'xlsx', 'csv', 'ics'],
    bericht: async f => { const L = (await exRpc('vst_uebersicht')).liste || [], h = exHeute(), K = L.filter(x => (x.bis || x.datum) >= h);
      const D = []; let fehlt = 0; for(const x of K){ try{ D.push(await exRpc('vst_laden', { p_id: x.id })); }catch(e){ fehlt++; } }
      const nm = n => f === 'pdf' ? vstKurz(n) : n;
      const S = []; D.forEach(d => (d.schichten || []).forEach(s => S.push([exD(s.von || d.datum), d.titel, s.von ? vstUhr(s.von) + (s.bis ? ' bis ' + vstUhr(s.bis) : '') : '', ((d.bereiche || []).find(b => b.id === s.b) || {}).titel || '', s.st, s.auf || '', s.h.map(p => nm(p.n)).join(', '), String(Math.max(0, s.p - s.h.length))])));
      return { titel:'Veranstaltungen', sub:'Kommende Veranstaltungen, Stand ' + exD(h) + (fehlt ? `. ${fehlt} ${fehlt === 1 ? 'Veranstaltung' : 'Veranstaltungen'} gerade nicht geladen, bitte später nochmal.` : ''),
        sections:[{ t:'Übersicht', cols:['Datum', 'Veranstaltung', 'Ort', 'Stand', 'Plätze besetzt', 'Plätze gesamt', 'Punkte offen'], rows: K.map(x => [exD(x.datum), x.titel, x.ort || '', VST_STATUS[x.status] || x.status, x.zahlen.belegt, x.zahlen.plaetze, x.zahlen.punkte - x.zahlen.erledigt]) },
          { t:'Schichtplan', cols:['Datum', 'Veranstaltung', 'Zeit', 'Bereich', 'Station', 'Aufgabe', 'Wer', 'Frei'], rows: S }] }; },
    ics: async () => { const L = (await exRpc('vst_uebersicht')).liste || [], h = exHeute(), E = [];
      for(const x of L.filter(x => (x.bis || x.datum) >= h)){ try{ const d = await exRpc('vst_laden', { p_id: x.id }); E.push(...vstIcs(d)); if(!(d.schichten || []).some(s => s.von)) E.push({ id:'vst-' + d.id, titel:d.titel, von:d.datum, bis:d.bis, ort:d.ort }); }catch(e){} } return E; } },
  { k:'helfer', gruppe:'Veranstaltungen und Helfer', tab:'helfer', titel:'Helferpool', text:'Alle, die mithelfen wollen: Kontakt, Bereiche, Alter, Idee, wann eingeladen', formate:['xlsx', 'csv', 'pdf', 'vcf'],
    bericht: async () => { const H = ((await exRpc('helferpool_liste')).helfer || []);
      return { titel:'Helferpool', sub: H.length + ' Personen, Stand ' + exD(exHeute()), sections:[{ t:'Helfer', cols:['Vorname', 'Nachname', 'Handy', 'E-Mail', 'Bereiche', 'Alter', 'Idee', 'Eingeladen'],
        rows: H.map(h => [h.vorname, h.nachname, h.handy || '', h.email || '', (h.bereiche || []).map(b => (typeof HP_B !== 'undefined' && HP_B[b]) || b).join(', '), h.alter == null ? '' : h.alter, h.idee || '', (h.einladungen || []).length ? exD(h.einladungen[h.einladungen.length - 1].am) : '']) }] }; },
    vcf: async () => ((await exRpc('helferpool_liste')).helfer || []).filter(h => !(h.bereiche || []).includes('nicht')).map(h => ({ vorname:h.vorname, nachname:h.nachname, tel:h.handy, mail:h.email, notiz:'Helfer SV/BSC' })) },
  { k:'termine', gruppe:'Termine', tab:'kalender', titel:'Termine der nächsten sechs Monate', text:'Spiele, Veranstaltungen und Vereinstermine, ohne Geburtstage', formate:['ics', 'xlsx', 'pdf', 'csv'],
    bericht: async () => { const I = await exKal(); return { titel:'Termine', sub:'Nächste sechs Monate, Stand ' + exD(exHeute()), sections:[{ t:'Termine', cols:['Datum', 'Uhrzeit', 'Was', 'Ort', 'Art'], rows: I.map(i => [exD(i.d), i.z || '', exKalTitel(i), i.ort || '', exKalArt(i)]) }] }; },
    ics: async () => (await exKal()).map(i => { const z = /^\d{2}:\d{2}$/.test(i.z || '') ? i.z : null;
      return { id:'kal-' + i.id, titel: exKalTitel(i), von: z ? new Date(i.d + 'T' + z + ':00').toISOString() : i.d, bis: z ? null : (i.bis || null), ort: i.ort || '', text: i.info || '' }; }) },
  { k:'partner', gruppe:'Partner und Finanzen', tab:'sponsoring', titel:'Partner, Verträge und Rechnungen', text:'Für Partner-Team und Finanzen: Firmen, Verträge mit Laufzeit und Beträgen, Rechnungen mit Summen', formate:['xlsx', 'pdf', 'csv'],
    bericht: async () => { const d = await exRpc('partner_engine_laden'), F = d.partner || [], fn = id => (F.find(f => f.id === id) || {}).firma || '';
      const R = d.rechnungen || [], summe = (L, k) => L.reduce((a, r) => a + (+r[k] || 0), 0), offen = R.filter(r => r.status !== 'bezahlt' && r.status !== 'storniert');
      return { titel:'Partner und Finanzen', sub:`${F.length} Firmen, ${(d.vertraege || []).length} Verträge, ${R.length} Rechnungen, Stand ${exD(exHeute())}`,
        sections:[
          { t:'Rechnungen', cols:['Nummer', 'Art', 'Firma', 'Datum', 'Fällig', 'Netto €', 'Brutto €', 'Stand', 'Bezahlt am', 'Zweck'],
            rows: R.map(r => [r.nr, r.art === 'spende' ? 'Spende' : 'Rechnung', fn(r.sponsor), exD(r.datum), exD(r.faellig), exEur(r.netto), exEur(r.brutto), r.status, exD(r.bezahlt_am), r.zweck || '']),
            note:`Offen: ${offen.length} über ${exEur(summe(offen, 'brutto'))} € brutto. Bezahlt: ${exEur(summe(R.filter(r => r.status === 'bezahlt'), 'brutto'))} € brutto.` },
          { t:'Verträge', cols:['Nummer', 'Firma', 'Stand', 'Beginn', 'Ende', 'Saisons', 'Netto je Saison €', 'Netto gesamt €', 'Unterschrieben', 'Gegengezeichnet'],
            rows: (d.vertraege || []).map(v => [v.nr, fn(v.sponsor), v.status, exD(v.beginn), exD(v.ende), v.saisons || '', exEur(v.netto_jahr), exEur(v.netto_gesamt), exD(v.unterschrieben_am), exD(v.gegengezeichnet_am)]) },
          { t:'Firmen', cols:['Firma', 'Stand', 'Ansprechperson', 'E-Mail', 'Telefon', 'Branche'], rows: F.map(f => [f.firma, f.status, f.ansprechpartner || '', f.email || '', f.telefon || '', f.branche || '']) }] }; } },
  { k:'kasse', gruppe:'Partner und Finanzen', tab:'kasse', titel:'Mannschaftskasse', text:'Kontostände, offen und bezahlt je Spieler, alle Buchungen', alt:'kasse' },
  { k:'training', gruppe:'Mannschaft und Kader', tab:'training', titel:'Trainingsbeteiligung', text:'Je Spieler: Einheiten, da, zu spät, Abwesenheiten mit Grund, Quote', alt:'training' },
  { k:'spiele', gruppe:'Mannschaft und Kader', tab:'training', titel:'Spiele und Einsätze', text:'Je Spieler: Startelf, eingewechselt, im Kader, zugeschaut, nicht da', alt:'spiele' },
  { k:'kader', gruppe:'Mannschaft und Kader', tab:'kader', titel:'Kaderplanung', text:'Bedarf je Position und Kader je Saison mit Status', alt:'kader' },
  { k:'scouting', gruppe:'Mannschaft und Kader', tab:'scout', titel:'Scouting-Berichte', text:'Bedarf, Radar, Merkliste, Beobachtete und Aufträge', alt:'scouting' },
  { k:'planung', gruppe:'Vorstand und Verwaltung', tab:'planung', titel:'Projekte und Aufgaben', text:'Alles aus der Planung mit Stand, Zuständigkeit und Fälligkeit', formate:['xlsx', 'pdf', 'csv'],
    bericht: async () => { const d = await exRpc('plan_laden'), P = d.projekte || [], pn = id => (P.find(p => p.id === id) || {}).titel || '';
      const st = { idee:'Idee', offen:'Offen', arbeit:'In Arbeit', wartet:'Wartet', erledigt:'Erledigt' };
      return { titel:'Projekte und Aufgaben', sub:'Stand ' + exD(exHeute()), sections:[
        { t:'Aufgaben', cols:['Aufgabe', 'Projekt', 'Bereich', 'Stand', 'Wer', 'Fällig', 'Priorität'], rows:(d.aufgaben || []).map(a => [a.titel, pn(a.projekt), a.bereich, st[a.status] || a.status, a.wer_name || a.wer_text || '', exD(a.faellig), a.prio || '']) },
        { t:'Projekte', cols:['Projekt', 'Bereich', 'Stand', 'Ampel', 'Verantwortlich', 'Start', 'Ende'], rows: P.map(p => [p.titel, p.bereich, p.status, p.ampel || '', p.verantwortlich_name || p.verantwortlich_text || '', exD(p.start), exD(p.ende)]) }] }; } },
  { k:'nutzer', gruppe:'Vorstand und Verwaltung', tab:'admin', titel:'Nutzer und Rollen', text:'Wer Zugang hat, mit Rolle und Stand der Einladung', formate:['xlsx', 'csv', 'pdf'], nurAdmin:true,
    bericht: async () => { const U = (await exRpc('admin_list')) || [];
      return { titel:'Nutzer und Rollen', sub: U.length + ' Konten, Stand ' + exD(exHeute()), sections:[{ t:'Nutzer', cols:['Name', 'E-Mail', 'Rolle', 'Aktiv', 'Passwort gesetzt'],
        rows: U.map(u => [u.name || '', u.email || '', svRolleVon(u), u.active ? 'ja' : 'nein', u.pw_set ? 'ja' : 'eingeladen']) }] }; } }
];
async function exKal(){ const h = exHeute(), b = new Date(Date.now() + 183 * 864e5).toLocaleDateString('sv-SE');
  const d = await exRpc('kalender', { p_von: h, p_bis: b }); return ((d && d.items) || []).filter(i => i.k !== 'geb').sort((a, c) => (a.d + (a.z || '')).localeCompare(c.d + (c.z || ''))); }
function exKalTitel(i){ if(i.k === 'spiel'){ const m = typeof kalTeamName === 'function' ? kalTeamName(i.m) : (i.m || ''); return `${m} ${i.heim === false ? 'bei' : 'gegen'} ${i.gegner || ''}`.trim(); } return i.t || 'Termin'; }
function exKalArt(i){ return i.k === 'spiel' ? 'Spiel' : i.k === 'event' ? 'Veranstaltung' : i.k === 'tt' ? 'Mannschaftstermin' : (i.a || i.k || ''); }
function exDarf(q){ if(q.nurAdmin) return svRole() === 'admin'; try{ return svTabAllowed(q.tab); }catch(e){ return false; } }

/* ---------- Bereich „Export“ ---------- */
SVR_TAB.export = null;
SV_TBL.export = ['download', 'Export'];
Object.assign(SV_PAGES, { export:['Export', 'Alles als PDF, Excel, CSV, Kalender oder Kontakte'] });
{ const _ta = svTabAllowed; svTabAllowed = function(t){ if(t === 'export') return !svGast() && EX_QUELLEN.some(q => q.tab !== 'export' && exDarf(q)); return _ta.apply(this, arguments); }; }
function exPanel(){ let P = document.getElementById('panel-export'); if(P) return P;
  const ref = document.getElementById('panel-home') || document.querySelector('.panel'); if(!ref) return null;
  P = document.createElement('section'); P.className = 'panel'; P.id = 'panel-export'; ref.parentNode.insertBefore(P, ref.nextSibling); return P; }
{ const _gt = goTab; goTab = function(tab){ if(tab === 'export') exPanel(); const war = svCurTab(); const r = _gt.apply(this, arguments);
  try{ if(svCurTab() === 'export' && war !== 'export') exZentrale(); }catch(e){ console.warn('Export', e); } return r; }; }
function exZentrale(){
  const P = exPanel(); if(!P) return;
  const Q = EX_QUELLEN.filter(exDarf), G = [...new Set(Q.map(q => q.gruppe))];
  P.innerHTML = `<div class="vst-kopf"><div><h2>Export</h2><p>Jede Liste als PDF zum Lesen, Excel zum Weiterrechnen, CSV für andere Programme, Termine für den Kalender und Kontakte fürs Adressbuch. Du bekommst nur, was du in der App auch sehen darfst.</p></div></div>
    ${G.map(g => `<h3 class="ex-g">${exE(g)}</h3><div class="ex-liste">${Q.filter(q => q.gruppe === g).map(q => `<button type="button" class="card ex-q" data-q="${exE(q.k)}">
      <span><b>${exE(q.titel)}</b><small>${exE(q.text)}</small><span class="ex-fs">${(q.alt ? ['pdf', 'xlsx', 'csv'] : q.formate).map(f => `<i>${EX_FMT[f].t}</i>`).join('')}</span></span>${SVI('chev')}</button>`).join('')}</div>`).join('')
    || '<div class="card vst-leer"><b>Für deine Rolle gibt es hier nichts zu exportieren.</b></div>'}`;
  P.querySelectorAll('[data-q]').forEach(b => b.onclick = () => { const q = EX_QUELLEN.find(x => x.k === b.dataset.q); if(!q) return;
    if(q.alt) return exDialog({ titel: q.titel, sub: q.text, bericht: () => sxBuild(q.alt), formate: ['pdf', 'xlsx', 'csv'] });
    exDialog({ titel: q.titel, sub: q.text, bericht: q.bericht, formate: q.formate, ics: q.ics, vcf: q.vcf }); });
}
// Suche: „export“, „excel“, „pdf“ führen hierher
if(typeof SU_STICH !== 'undefined') Object.assign(SU_STICH, { export:'export excel pdf csv herunterladen liste kalender kontakte vcard ics', veranstaltungen:'veranstaltung event konzert adventsmarkt weihnachtsfeier fest schicht schichtplan helfer' });

/* =====================================================================
   Beta 0.76 · Termine für alle Abteilungen (Wunsch Albert, 04.11.2026)
   - Abteilungen (Partner-Team, Finanzen, Jugendleitung …) planen ihre eigenen Termine. Sehen dürfen sie nur ihre Mitglieder,
     dazu Personen, die einzeln eingeladen werden. Vorstand sieht alles. Geprüft wird auf dem Server (event_sieht, 110).
   - Filter „Abteilung und Einladungen“ neben Spielen, Mannschaften und Veranstaltungen, auch fürs Kalender-Abo.
   - Google Kalender und Outlook mit einem Tipp verbinden, iPhone wie bisher.
   - Teilen per WhatsApp mit Link zur Terminseite, mithelfen in freien Schichten mit einem Tipp.
   - Werbebild für Story, Beitrag und WhatsApp: svm72.js
   ===================================================================== */
Object.assign(KAL_EART, { versammlung:['📣','Versammlung'], sitzung:['🗂️','Sitzung und Treffen'], kultur:['🎵','Konzert und Kultur'] });
KAL_FARBE.abt = '#64748b';
const KAL_TERMIN_LINK = 'https://' + (((window.VEREIN || {}).texte || {}).kabine_host || 'svbsc.albertklee.de') + '/#termin=';
KAL.g = null; KAL.hg = {};

async function kalGruppenLaden(neu){
  if(KAL.g && !neu) return KAL.g;
  try{ const { data, error } = await SVB.sb.rpc('kal_gruppen_info'); if(!error && data) KAL.g = data; }catch(e){}
  return KAL.g || { gruppen:[], plant:false, verwalten:false };
}
function kalGruppeTitel(k){ const g = ((KAL.g || {}).gruppen || []).find(x => x.key === k); return g ? g.titel : k; }
function kalLeuteName(id){ const p = ((KAL.g || {}).leute || []).find(x => x.id === id); return p ? p.name : null; }

/* ---------- Kategorien: Abteilung und Einladungen ---------- */
{ const _tn = kalTeamName; kalTeamName = function(m){ return m === 'abt' ? 'Abteilung und Einladungen' : _tn.apply(this, arguments); }; }
kalCats = function(i){ if(i.k === 'spiel') return [i.m]; if(i.k === 'geb') return ['geb'];
  const S = i.sicht || ['alle']; if(S.length && S.every(x => x.startsWith('team:'))) return S.map(x => x.slice(5));
  return S.includes('alle') ? ['event'] : ['abt']; };
{ const _fa = kalFarbe; kalFarbe = function(i){ if(i.k === 'event' && kalCats(i)[0] === 'abt') return KAL_FARBE.abt; return _fa.apply(this, arguments); }; }
{ const _ch = kalChips; kalChips = function(){ const L = _ch.apply(this, arguments), n = L.findIndex(c => c.k === 'event');
  if(KAL.items.some(i => i.k === 'event' && kalCats(i)[0] === 'abt') || (KAL.g && KAL.g.plant)) L.splice(n + 1, 0, { k:'abt', t:'Abteilung und Einladungen', c:KAL_FARBE.abt });
  return L; }; }
// Gemerkte Filter von vorher: Abteilungstermine waren dort unter „Veranstaltungen“, also einmal dazunehmen
{ const _kf = kalFilter; kalFilter = function(){ let gemerkt = null; try{ gemerkt = localStorage.getItem(kalKey()); }catch(e){}
  const f = _kf.apply(this, arguments), k = kalKey() + '-abt';
  if(!gemerkt){ f.add('abt'); return f; }   // Standard: Abteilungstermine immer dabei
  try{ if(KAL.f && !localStorage.getItem(k)){ if(f.has('event')) f.add('abt'); localStorage.setItem(k, '1'); kalFilterSave(); } }catch(e){}
  return f; }; }

kalSichtText = function(S){ if(!S || S.includes('alle')) return '';
  const me = (window.__SVBC_USER || {}).id || (typeof SVU !== 'undefined' && SVU.id), U = S.filter(x => x.startsWith('u:'));
  const T = S.filter(x => !x.startsWith('u:')).map(x => x.startsWith('team:') ? kalTeamName(x.slice(5)) : x.startsWith('g:') ? kalGruppeTitel(x.slice(2)) : (KAL_GRP[x] || x));
  if(U.length){ if(U.includes('u:' + me) && !T.length) T.push('dich'); else T.push(U.length === 1 ? (kalLeuteName(U[0].slice(2)) || '1 eingeladene Person') : U.length + ' Eingeladene'); }
  return T.join(', '); };

kalDarfAnlegen = function(){ return !!KAL.flags.bearbeiten || (KAL.flags.teams || []).length > 0 || !!(KAL.g && KAL.g.plant); };

/* ---------- Laden: Abteilungen und „Helfer gesucht“ mitholen ---------- */
let KAL_EXTRA = null;
async function kalExtras(){ if(KAL_EXTRA) return KAL_EXTRA;
  KAL_EXTRA = (async () => { const [g, h] = await Promise.all([kalGruppenLaden(), SVB.sb.rpc('termine_helfer_gesucht').then(r => r.data || []).catch(() => [])]);
    KAL.hg = {}; (h || []).forEach(x => { KAL.hg[x.e] = x; }); })();
  try{ await KAL_EXTRA; } finally { KAL_EXTRA = null; } }
{ const _kl = kalLoad; kalLoad = async function(){ const t0 = KAL.t; const r = await _kl.apply(this, arguments);
  if(KAL.loaded && KAL.t !== t0){ await kalExtras(); try{ if(svCurTab() === 'kalender') kalRender(); if(document.getElementById('kalHome')) kalHome(); }catch(e){} }
  return r; }; }
{ const _ih = kalItemHtml; kalItemHtml = function(i){ let h = _ih.apply(this, arguments); const x = i.k === 'event' && KAL.hg[i.id];
  if(x){ const tag = x.mein ? '<em class="kal-hg ich">Du hilfst mit</em>' : `<em class="kal-hg">Helfer gesucht · ${x.frei} frei</em>`; h = h.replace('</div><span class="kal-tag">', tag + '</div><span class="kal-tag">'); }
  return h; }; }
// Kopfzeile: Abteilungen verwalten (Vorstand und Admin)
{ const _kr = kalRender; kalRender = function(){ const r = _kr.apply(this, arguments);
  try{ const P = kalPanel(), a = P && P.querySelector('.kal-top .tract');
    if(a && KAL.g && KAL.g.verwalten && !a.querySelector('#kalAbt')){ const b = document.createElement('button'); b.type = 'button'; b.className = 'btn ghost'; b.id = 'kalAbt'; b.innerHTML = `${SVI('users')} Abteilungen`; b.onclick = () => kalAbteilungen(); a.prepend(b); } }catch(e){}
  return r; }; }

/* ---------- Termin anlegen und ändern: wer sieht das? ---------- */
kalEventForm = async function(i){
  if(!kalDarfAnlegen()) return; const G = await kalGruppenLaden(true), red = kalDarfEdit(), teams = KAL.flags.teams || [];
  const meineG = (G.gruppen || []).filter(g => g.aktiv && (red || g.ich));
  const std = red ? ['alle'] : meineG.length ? ['g:' + meineG[0].key] : teams.slice(0, 1).map(t => 'team:' + t);
  const e = i || { d: kalHeute(), a: 'sonstiges', pub: red, sicht: std };
  const sel = new Set((e.sicht || std).filter(x => !x.startsWith('u:'))), gast = new Set((e.sicht || []).filter(x => x.startsWith('u:')).map(x => x.slice(2)));
  const T = (SVR.mann || []).filter(m => teams.includes(m.id));
  const gruppen = [red ? ['', [['alle', 'Alle Mitglieder']]] : null,
    red ? ['Vorstand und Trainer', [['vorstand', 'Vorstand'], ['trainerteam', 'Trainerteam'], ...(sel.has('sponsoring') ? [['sponsoring', 'Partner-Team (alt)']] : [])]] : null,
    ['Abteilungen', meineG.map(g => ['g:' + g.key, g.titel])],
    ['Senioren', T.filter(m => m.art !== 'jugend').map(m => ['team:' + m.id, kalTeamName(m.id)])], ['Jugend', T.filter(m => m.art === 'jugend').map(m => ['team:' + m.id, kalTeamName(m.id)])]].filter(g => g && g[1].length);
  const farbe = k => k === 'alle' ? KAL_FARBE.event : k.startsWith('team:') ? (KAL_FARBE[k.slice(5)] || KAL_FARBE.jugend) : k.startsWith('g:') ? KAL_FARBE.abt : '#94a3b8';
  const M = svModal(`<div class="mhead"><div><h2 style="margin:0">${i ? 'Termin ändern' : 'Neuer Termin'}</h2><div class="msub">${red ? 'Du bestimmst, wer den Termin sieht. Vorstand und Admin sehen immer alles.' : 'Den Termin sehen die gewählten Gruppen, eingeladene Personen und der Vorstand.'}</div></div></div>
    <form id="kalF" class="editgrid kal-f2">
      <div class="field kal-w"><label for="kfT">Titel</label><input id="kfT" required maxlength="120" value="${svEsc(e.t || '')}" placeholder="zum Beispiel Jahreshauptversammlung"></div>
      <div class="field kal-w"><label>Wer sieht das?</label><p class="note small kal-shin">„Alle Mitglieder“ heißt: alle mit Zugang zur App. Vorstand und Admin sehen immer alles.</p><div class="kal-sicht" id="kfS">${gruppen.map(([t, L]) => `${t ? `<small>${svEsc(t)}</small>` : ''}<div>${L.map(([k, l]) => `<button type="button" class="kal-chip${sel.has(k) ? ' on' : ''}" data-ks="${svEsc(k)}" aria-pressed="${sel.has(k)}" style="--c:${farbe(k)}"><i></i>${svEsc(l)}</button>`).join('')}</div>`).join('')}</div><p class="kal-sieht" id="kfSieht" role="status"></p></div>
      ${G.leute ? `<div class="field kal-w"><label for="kfU">Einzelne Personen einladen</label><p class="note small">Eingeladene sehen den Termin, auch ohne Gruppe.</p>
        <div class="kal-gast" id="kfG"></div><input id="kfU" type="search" autocomplete="off" placeholder="Name suchen"><div class="kal-gl" id="kfUL"></div></div>` : ''}
      <div class="field"><label for="kfA">Art</label><select id="kfA">${Object.entries(KAL_EART).map(([k, v]) => `<option value="${k}"${k === e.a ? ' selected' : ''}>${svEsc(v[1])}</option>`).join('')}</select></div>
      <div class="field"><label for="kfZ">Uhrzeit</label><input id="kfZ" type="time" value="${svEsc(e.z || '')}"></div>
      <div class="field"><label for="kfD">Datum</label><input id="kfD" type="date" required value="${svEsc(e.d)}"></div>
      <div class="field"><label for="kfB">Bis (mehrere Tage)</label><input id="kfB" type="date" value="${svEsc(e.bis || '')}"></div>
      <div class="field kal-w"><label for="kfO">Ort</label><input id="kfO" maxlength="120" value="${svEsc(e.ort || '')}" placeholder="zum Beispiel Sportheim"></div>
      <div class="field kal-w"><label for="kfI">Beschreibung</label><textarea id="kfI" rows="3" maxlength="600" placeholder="Was erwartet die Leute?">${svEsc(e.info || '')}</textarea></div>
      ${red || KAL.flags.helfer ? `<div class="field kal-w"><label for="kfN">Interne Notiz (Trainerteam und Vorstand)</label><textarea id="kfN" rows="2">${svEsc(e.n || '')}</textarea></div>` : ''}
      ${red ? `<label class="kal-sw kal-w" id="kfPL"><input type="checkbox" id="kfP"${e.pub !== false ? ' checked' : ''}> Auch auf der öffentlichen Terminseite und im Spielplan für Fans (nur bei „Alle Mitglieder“)</label>` : ''}
      <div class="btnrow sbact kal-w"><button class="btn" type="submit">Speichern</button><button class="btn ghost" type="button" id="kfX">Abbrechen</button>${i && i.ed ? `<button class="btn ghost kal-del" type="button" id="kfDel">Löschen</button>` : ''}</div>
    </form>`);
  const S = M.querySelector('#kfS'), pl = M.querySelector('#kfPL');
  const zeig = () => { S.querySelectorAll('[data-ks]').forEach(b => { const on = sel.has(b.dataset.ks); b.classList.toggle('on', on); b.setAttribute('aria-pressed', on); });
    if(pl){ const an = sel.has('alle'); pl.classList.toggle('aus', !an); M.querySelector('#kfP').disabled = !an; }
    const sw = M.querySelector('#kfSieht'), namen = [...sel].map(k => k === 'alle' ? 'alle Mitglieder' : k.startsWith('team:') ? kalTeamName(k.slice(5)) : k.startsWith('g:') ? kalGruppeTitel(k.slice(2)) : (KAL_GRP[k] || k)).concat([...gast].map(id => kalLeuteName(id) || 'eine Person'));
    if(sw) sw.textContent = namen.length ? 'Sehen: ' + namen.join(', ') + (sel.has('alle') ? '' : ' und der Vorstand') : 'Noch niemand gewählt. Bitte oben auswählen.';
    const g = M.querySelector('#kfG'); if(g){ g.innerHTML = [...gast].map(id => `<span class="kal-gp">${svEsc(kalLeuteName(id) || 'Person')}<button type="button" data-gweg="${svEsc(id)}" aria-label="${svEsc(kalLeuteName(id) || 'Person')} nicht mehr einladen">${SVI('x')}</button></span>`).join('');
      g.querySelectorAll('[data-gweg]').forEach(b => b.onclick = () => { gast.delete(b.dataset.gweg); zeig(); }); } };
  S.querySelectorAll('[data-ks]').forEach(b => b.onclick = () => { const k = b.dataset.ks;
    if(k === 'alle'){ sel.clear(); sel.add('alle'); } else { sel.delete('alle'); sel.has(k) ? sel.delete(k) : sel.add(k); } zeig(); });
  const u = M.querySelector('#kfU'), ul = M.querySelector('#kfUL');
  if(u) u.oninput = () => { const q = u.value.trim().toLowerCase(); if(q.length < 2){ ul.innerHTML = ''; return; }
    ul.innerHTML = (G.leute || []).filter(p => !gast.has(p.id) && String(p.name).toLowerCase().includes(q)).slice(0, 6).map(p => `<button type="button" class="kal-gz" data-gneu="${svEsc(p.id)}">${SVI('plus')} ${svEsc(p.name)}</button>`).join('') || '<p class="note small">Niemand gefunden.</p>';
    ul.querySelectorAll('[data-gneu]').forEach(b => b.onclick = () => { gast.add(b.dataset.gneu); u.value = ''; ul.innerHTML = ''; zeig(); u.focus(); }); };
  zeig();
  M.querySelector('#kfX').onclick = () => closeOverlay();
  const del = M.querySelector('#kfDel'); if(del) del.onclick = async () => { if(del.dataset.sure !== '1'){ del.dataset.sure = '1'; del.textContent = 'Wirklich löschen?'; del.classList.add('sure'); return; }
    const { error } = await SVB.sb.rpc('event_delete', { p_id: i.id }); if(error){ kToast(svFehlerText(error)); return; } kToast('Gelöscht'); closeOverlay(); kalLoad(null, null, true); };
  M.querySelector('#kalF').onsubmit = async ev => { ev.preventDefault(); const b = M.querySelector('button[type=submit]'); if(b.disabled) return;
    const v = id => { const x = M.querySelector(id); return x ? x.value.trim() : ''; }, bis = v('#kfB');
    if(!sel.size && !gast.size){ kToast('Bitte wählen, wer den Termin sieht'); return; }
    const p = { id: i ? i.id : null, titel: v('#kfT'), art: v('#kfA'), datum: v('#kfD'), ende: bis && bis > v('#kfD') ? bis : '', zeit: v('#kfZ'), ort: v('#kfO'), info: v('#kfI'),
      sicht: [...sel, ...[...gast].map(x => 'u:' + x)], oeffentlich: red ? (M.querySelector('#kfP').checked && sel.has('alle')) : false };
    if(M.querySelector('#kfN')) p.notiz = v('#kfN');
    b.disabled = true; const { error } = await SVB.sb.rpc('termin_speichern', { p }); b.disabled = false;
    if(error){ kToast(svFehlerText(error)); return; }
    kToast('Gespeichert'); closeOverlay(); kalLoad(null, null, true); };
};

/* ---------- Abteilungen verwalten (Vorstand, Admin) ---------- */
async function kalAbteilungen(){
  const G = await kalGruppenLaden(true); if(!G.verwalten) return;
  const M = svModal(`<div class="mhead"><div><h2 style="margin:0">Abteilungen</h2><div class="msub">Wer zu einer Abteilung gehört, sieht und plant ihre Termine. Andere sehen sie nur, wenn sie eingeladen werden.</div></div></div><div id="kaL"></div>
    <div class="kal-zeile"><input id="kaN" maxlength="60" placeholder="Neue Abteilung, zum Beispiel Schiedsrichter"><button type="button" class="btn" id="kaGo">${SVI('plus')} Anlegen</button></div>`);
  const zeig = () => { const D = KAL.g, L = M.querySelector('#kaL');
    L.innerHTML = (D.gruppen || []).map(g => `<details class="kal-ag"${g.key === kalAbteilungen.offen ? ' open' : ''} data-ag="${svEsc(g.key)}"><summary><b>${svEsc(g.titel)}</b><small>${(g.mitglieder || []).length} eingetragen${g.automatisch ? ' · dazu alle mit Recht „' + svEsc(g.automatisch) + '“' : ''}${g.aktiv ? '' : ' · ausgeblendet'}</small></summary>
      <div class="kal-am">${(g.mitglieder || []).map(m => `<span class="kal-gp">${svEsc(m.name)}<button type="button" data-mraus="${svEsc(m.u)}" aria-label="${svEsc(m.name)} entfernen">${SVI('x')}</button></span>`).join('') || '<p class="note small">Noch niemand eingetragen.</p>'}</div>
      <div class="kal-zeile"><select data-mneu><option value="">Person dazuholen</option>${(D.leute || []).filter(p => !(g.mitglieder || []).some(m => m.u === p.id)).map(p => `<option value="${svEsc(p.id)}">${svEsc(p.name)}</option>`).join('')}</select>
        <button type="button" class="btn ghost" data-akt="${g.aktiv ? '0' : '1'}">${g.aktiv ? 'Ausblenden' : 'Wieder zeigen'}</button></div></details>`).join('');
    L.querySelectorAll('[data-ag]').forEach(d => { const k = d.dataset.ag, g = D.gruppen.find(x => x.key === k);
      d.ontoggle = () => { if(d.open) kalAbteilungen.offen = k; };
      d.querySelectorAll('[data-mraus]').forEach(b => b.onclick = () => los('kal_gruppe_mitglied', { p_gruppe: k, p_user: b.dataset.mraus, p_an: false }, 'Entfernt'));
      d.querySelector('[data-mneu]').onchange = ev => { if(ev.target.value) los('kal_gruppe_mitglied', { p_gruppe: k, p_user: ev.target.value, p_an: true }, 'Dazugeholt'); };
      d.querySelector('[data-akt]').onclick = ev => los('kal_gruppe_speichern', { p: { key: k, titel: g.titel, aktiv: ev.currentTarget.dataset.akt === '1' } }, 'Gespeichert'); }); };
  const los = async (fn, args, ok) => { const { data, error } = await SVB.sb.rpc(fn, args); if(error){ kToast(svFehlerText(error)); return; } KAL.g = data; zeig(); kToast(ok); };
  M.querySelector('#kaGo').onclick = () => { const n = M.querySelector('#kaN').value.trim(); if(n.length < 2) return kToast('Bitte einen Namen eintragen'); M.querySelector('#kaN').value = ''; los('kal_gruppe_speichern', { p: { titel: n } }, 'Angelegt'); };
  zeig();
}

/* ---------- Teilen: WhatsApp mit Link, Terminseite für öffentliche Termine ---------- */
function kalTerminLink(i){ return i.k === 'event' && i.pub && (i.sicht || ['alle']).includes('alle') ? KAL_TERMIN_LINK + i.id : null; }
{ const _st = kalShareText; kalShareText = function(i){ let t = _st.apply(this, arguments); const l = kalTerminLink(i);
  const fr = i.k === 'event' && KAL.hg[i.id] ? KAL.hg[i.id].frei : 0; if(fr) t += `\nWir suchen noch Helfer: ${fr === 1 ? '1 Platz ist' : fr + ' Plätze sind'} frei.`;
  if(l) t += '\n' + l; else if(i.k === 'event') t += '\nIn der Sportzentrale: ' + ((((window.VEREIN || {}).texte || {}).app_url) || 'https://svbsc.kaderwerk.pro/');
  return t; }; }

/* ---------- Details: WhatsApp, Werben, Mithelfen ---------- */
{ const _kd = kalDetail; kalDetail = function(id){ const r = _kd.apply(this, arguments); const i = kalItem(id); if(!i || i.k === 'geb') return r;
  try{ const M = document.getElementById('modal'), akt = M && M.querySelector('.kal-akt'); if(!akt) return r;
    const sh = akt.querySelector('#kalShare'); if(sh) sh.classList.add('ghost');
    const wa = document.createElement('a'); wa.className = 'btn ghost'; wa.target = '_blank'; wa.rel = 'noopener'; wa.href = 'https://wa.me/?text=' + encodeURIComponent(kalShareText(i)); wa.innerHTML = `${SVI('chat')} WhatsApp`;
    akt.querySelector('#kalShare') ? akt.querySelector('#kalShare').after(wa) : akt.prepend(wa);
    if(i.k === 'event' && (i.sicht || ['alle']).includes('alle') && typeof wbOeffnen === 'function'){ const w = document.createElement('button'); w.type = 'button'; w.className = 'btn ghost'; w.id = 'kalWerb'; w.innerHTML = `${SVI('camera')} Werbebild`; w.onclick = () => wbOeffnen(i); wa.after(w); }
    const me = (window.__SVBC_USER || {}).id || (typeof SVU !== 'undefined' && SVU.id);
    if(i.k === 'event' && (i.sicht || []).includes('u:' + me) && !i.ed){ const x = document.createElement('button'); x.type = 'button'; x.className = 'btn ghost'; x.id = 'kalAusbl'; x.textContent = 'Einladung ausblenden';
      x.onclick = async () => { if(x.dataset.sure !== '1'){ x.dataset.sure = '1'; x.textContent = 'Wirklich ausblenden?'; return; }
        const { error } = await SVB.sb.rpc('termin_einladung_ausblenden', { p_id: i.id }); if(error) return kToast(svFehlerText(error)); kToast('Ausgeblendet'); closeOverlay(); kalLoad(null, null, true); };
      akt.appendChild(x); }
    if(i.k === 'event' && KAL.hg[i.id]){ const box = document.createElement('div'); box.className = 'kal-helf'; box.id = 'kalHelf'; box.innerHTML = '<p class="note">Lade die freien Schichten …</p>'; akt.before(box); kalHelfen(i, box); }
  }catch(e){ console.warn('Termine', e); }
  return r; }; }
async function kalHelfen(i, box, data){
  let D = data; if(!D){ const { data: d, error } = await SVB.sb.rpc('termin_helfen_info', { p_event: i.id }); if(error){ box.innerHTML = `<p class="note">${svEsc(svFehlerText(error))}</p>`; return; } D = d; }
  const S = D.schichten || [], uhr = t => t ? new Date(t).toLocaleTimeString('de-DE', { hour:'2-digit', minute:'2-digit', timeZone:'Europe/Berlin' }) : '';
  const tag = t => t ? new Date(t).toLocaleDateString('de-DE', { weekday:'short', day:'2-digit', month:'2-digit', timeZone:'Europe/Berlin' }) : '';
  const mehrtag = new Set(S.map(s => tag(s.von))).size > 1;
  box.innerHTML = `<h3 class="trh">Mithelfen</h3>${S.length ? S.map(s => { const frei = Math.max(0, s.p - s.belegt);
    return `<div class="kal-hs${s.mein ? ' mein' : ''}"><div><b>${svEsc((mehrtag ? tag(s.von) + ', ' : '') + (s.von ? uhr(s.von) + (s.bis ? ' bis ' + uhr(s.bis) : '') + ' Uhr' : 'Zeit offen'))}</b>
      <span>${svEsc([s.teil, s.bereich, s.st].filter(Boolean).join(' · '))}${s.auf ? ': ' + svEsc(s.auf) : ''}</span>${s.hin ? `<small>${svEsc(s.hin)}</small>` : ''}
      <small>${s.mein ? 'Du bist dabei' : frei ? frei + ' frei' : 'voll'}${(s.namen || []).length ? ' · mit ' + svEsc(s.namen.join(', ')) : ''}</small></div>
      ${s.mein ? `<button type="button" class="btn ghost" data-hraus="${svEsc(s.id)}">Austragen</button>` : frei ? `<button type="button" class="btn" data-hrein="${svEsc(s.id)}">Ich helfe mit</button>` : ''}</div>`; }).join('') : '<p class="note">Gerade ist keine Schicht offen.</p>'}`;
  const los = async (sid, an, b) => { if(b.disabled) return; b.disabled = true; const { data: d, error } = await SVB.sb.rpc('termin_helfen', { p_schicht: sid, p_an: an });
    if(error){ b.disabled = false; kToast(svFehlerText(error)); return; } kToast(an ? 'Danke, du bist eingetragen' : 'Ausgetragen'); kalHelfen(i, box, d);
    SVB.sb.rpc('termine_helfer_gesucht').then(r => { KAL.hg = {}; (r.data || []).forEach(x => { KAL.hg[x.e] = x; }); }).catch(() => {}); };
  box.querySelectorAll('[data-hrein]').forEach(b => b.onclick = () => los(b.dataset.hrein, true, b));
  box.querySelectorAll('[data-hraus]').forEach(b => b.onclick = () => los(b.dataset.hraus, false, b));
}

/* ---------- Abo: Google Kalender und Outlook direkt ---------- */
{ const _am = kalAboModal; kalAboModal = async function(){ const r = await _am.apply(this, arguments);
  try{ const M = document.getElementById('modal'), row = M && M.querySelector('#kalWeb') && M.querySelector('#kalWeb').parentNode; if(!row || row.querySelector('#kalGoo')) return r;
    let url = null; const f = [...kalFilter()];
    const holen = async () => { if(url) return url; const { data, error } = await SVB.sb.rpc('kalender_abo_link', { p_filter: f }); if(error){ kToast(svFehlerText(error)); return null; } url = kalFeedUrl('t=' + data); return url; };
    const g = document.createElement('button'); g.type = 'button'; g.className = 'btn ghost'; g.id = 'kalGoo'; g.textContent = 'Google Kalender';
    const goo = u => 'https://calendar.google.com/calendar/r?cid=' + encodeURIComponent(u.replace(/^https?:/, 'webcal:')), out = u => 'https://outlook.live.com/calendar/0/addfromweb?url=' + encodeURIComponent(u) + '&name=' + encodeURIComponent('SV/BSC Termine');
    holen();   // schon jetzt holen: Safari öffnet neue Fenster nur direkt beim Tippen
    g.onclick = async () => { if(url) return window.open(goo(url), '_blank', 'noopener'); const u = await holen(); if(u) location.href = goo(u); };
    const o = document.createElement('button'); o.type = 'button'; o.className = 'btn ghost'; o.id = 'kalOut'; o.textContent = 'Outlook';
    o.onclick = async () => { if(url) return window.open(out(url), '_blank', 'noopener'); const u = await holen(); if(u) location.href = out(u); };
    const ap = row.querySelector('#kalWeb'); ap.textContent = 'Apple Kalender (iPhone, Mac)'; ap.after(g, o);
    const how = M.querySelector('.kal-how p'); if(how) how.textContent = 'Am einfachsten: „Google Kalender“ antippen und bestätigen. Klappt das am Handy nicht, den Link kopieren und am Computer bei calendar.google.com links unter „Weitere Kalender“, „Per URL“ einfügen. Danach steht alles auch im Handy.';
  }catch(e){}
  return r; }; }

// Suche
if(typeof SU_STICH !== 'undefined') SU_STICH.kalender = ((SU_STICH.kalender || '') + ' termin termine kalender abo google outlook ics versammlung sitzung abteilung einladen').trim();

/* =====================================================================
   Beta 0.76 · Werbebild für Veranstaltungen (Wunsch Albert, 04.11.2026)
   Aus jedem Termin für alle ein Bild für Instagram-Story, Beitrag oder WhatsApp-Status, mit eigenem Foto oder einem aus der
   Galerie des Spieltagsstudios. Das Bild entsteht auf dem Gerät (Canvas), Teilen über das Teilen-Menü des Handys.
   Ruhig gesetzt: Foto oben, Vereinsblau unten, eine Schrift für die Überschrift, keine Effekte. Text bleibt in den sicheren
   Bereichen der Story (oben und unten verdeckt Instagram etwas).
   ===================================================================== */
const WB_FMT = { story:{ t:'Story', s:'Instagram und WhatsApp-Status', w:1080, h:1920, foto:.44 }, post:{ t:'Beitrag', s:'Instagram, Facebook', w:1080, h:1350, foto:.5 }, quadrat:{ t:'Quadrat', s:'WhatsApp, überall', w:1080, h:1080, foto:.44 } };
const WB_ZUSATZ = ['Wir bewirten euch', 'Helfer gesucht', 'Eintritt frei', 'Kommt vorbei'];
const WB_FARBE = { grund:'#0b1a33', linie:'#2f6bff', label:'#8fb3ff', text:'#ffffff', leise:'#c5d3ee', pill:'#2f6bff' };
const WB = { fmt:'story', foto:null, img:null, zusatz:'', titel:'', zeile:'', ort:'' };

function wbDatum(i){
  const t = d => new Date(d + 'T12:00:00').toLocaleDateString('de-DE', { weekday:'long', day:'numeric', month:'long' });
  return [t(i.d) + (i.bis && i.bis !== i.d ? ' bis ' + t(i.bis) : ''), i.z ? i.z + ' Uhr' : ''].filter(Boolean).join(' · ');
}
function wbBild(src){ return new Promise((ok, no) => { const im = new Image(); im.onload = () => ok(im); im.onerror = () => no(new Error('Bild ließ sich nicht laden')); im.src = src; }); }
let WB_CREST = null;
async function wbSchriften(){ try{ await Promise.all(['700 100px BarlowC', '600 40px BarlowC', '600 40px InterV', '400 40px InterV'].map(f => document.fonts.load(f))); }catch(e){} }
