  const off = hvOffeneAnzeigen(); if(off.length) L.push({ i:null, t:(off.length === 1 ? '1 Anzeige steht' : off.length + ' Anzeigen stehen') + ' noch nicht im Plan: ' + off.slice(0, 6).map(a => shpKurz(a.firma)).join(', ') + (off.length > 6 ? ' und weitere' : '') + '.' });
  return L; }
function hvHinweise(B){ const H = B.querySelector('#hvHin'); if(!H) return; const L = hvHinweisListe(), fehlt = (HV.d.anzeigen || []).filter(a => !a.bild).length, darf = !!HV.d.planen;
  H.innerHTML = `<section class="card hv-hin"><h3 class="sh-k">Vor dem Druck</h3>${L.length ? `<p class="sh-sub">${L.length === 1 ? 'Ein Punkt ist' : L.length + ' Punkte sind'} noch offen. Antippen springt zur Seite.</p><div class="hv-hl">${L.slice(0, 60).map(x => x.i == null ? `<div class="hv-hz"><span class="sh-pill gr">Heft</span><span>${hvE(x.t)}</span></div>` : `<button type="button" class="hv-hz" data-hv-hin="${x.i}"><span class="sh-pill warn">Seite ${x.i + 1}</span><span>${hvE(x.t)}</span></button>`).join('')}</div>` : '<p class="sh-sub">Alles da. Das Heft kann in den Druck.</p>'}
    ${darf && fehlt ? `<div class="sh-akt"><button type="button" class="btn ghost" id="hvViele">Druckvorlagen einlesen</button><input type="file" id="hvVieleF" accept="image/jpeg,image/png,image/webp" multiple hidden></div><p class="note">Mehrere Bilder auf einmal: Der Dateiname beginnt mit dem Namen der Firma. Was sich nicht zuordnen lässt, wird genannt.</p>` : ''}</section>`;
  H.querySelectorAll('[data-hv-hin]').forEach(b => b.onclick = () => (HV.d.planen ? hvWaehlen(+b.dataset.hvHin) : hvGeh(+b.dataset.hvHin)));
  const v = H.querySelector('#hvViele'), f = H.querySelector('#hvVieleF'); if(v && f){ v.onclick = () => f.click(); f.onchange = () => hvVieleVorlagen([...f.files]); }
  B.querySelectorAll('#hvLeiste [data-hv-geh]').forEach(b => b.classList.toggle('hin', hvWarn(+b.dataset.hvGeh).length > 0)); }

/* ---------- Druckvorlagen und Fotos hochladen ---------- */
function hvHochFehler(e){ const m = String((e && e.message) || e); return /row-level security|not authorized|unauthorized|403/i.test(m) ? 'Zum Hochladen fehlt dir das Recht. Das können die Leitung im Bereich Partner und die Redaktion.' : 'Hochladen hat nicht geklappt: ' + m; }
async function hvVorlageHoch(a, file){ const v = await hsBildKlein(file, 2600), pfad = 'anzeigen/' + a.id + '-' + Date.now().toString(36) + '.jpg';
  const up = await SVB.sb.storage.from('stadionheft').upload(pfad, v.blob, { contentType:'image/jpeg', upsert:false }); if(up.error) throw new Error(hvHochFehler(up.error));
  await shRpc('stadionheft_anzeige_bild', { p_id:a.id, p_pfad:pfad }); a.bild = pfad; await hsBildLaden('az:' + a.id, v.blob); HV.pf['az:' + a.id] = pfad; }
async function hvFotoHoch(file){ const v = await hsBildKlein(file, 2600), pfad = 'seiten/' + HV.heft + '/' + Date.now().toString(36) + '.jpg';
  const up = await SVB.sb.storage.from('stadionheft').upload(pfad, v.blob, { contentType:'image/jpeg', upsert:false }); if(up.error) throw new Error(hvHochFehler(up.error));
  await hsBildLaden('f:' + pfad, v.blob); HV.pf['f:' + pfad] = pfad; return pfad; }
async function hvVieleVorlagen(F){ const A = HV.d.anzeigen || [], ohne = [], B = shOrt(); let n = 0; if(!F.length) return;
  const finde = name => { const roh = name.replace(/\.[^.]+$/, ''), id = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}/i.exec(roh); if(id){ const a = A.find(x => x.id === id[0].toLowerCase()); if(a) return a; }
    const k = hsNorm(roh); return A.filter(a => { const f = hsNorm(shpKurz(a.firma)); return f.length >= 4 && (k.startsWith(f) || k.includes(f)); }).sort((x, y) => hsNorm(shpKurz(y.firma)).length - hsNorm(shpKurz(x.firma)).length)[0] || null; };
  for(let i = 0; i < F.length; i++){ const a = finde(F[i].name); kToast(`Lese ein: ${i + 1} von ${F.length}`); if(!a){ ohne.push(F[i].name); continue; }
    try{ await hvVorlageHoch(a, F[i]); n++; }catch(e){ ohne.push(F[i].name + ' (' + e.message + ')'); } }
  hvNeuZeichnen(); if(B) hvLeiste(B);
  svModal(`<div class="mhead"><div><h2 style="margin:0">Druckvorlagen eingelesen</h2><div class="msub">${n} von ${F.length} zugeordnet</div></div></div>${ohne.length ? `<p class="note">Nicht zugeordnet:</p><ul class="hv-ul">${ohne.slice(0, 40).map(x => `<li>${hvE(x)}</li>`).join('')}</ul>` : '<p class="note">Alle Bilder haben ihre Anzeige gefunden.</p>'}<div class="pz-tc-dlgk"><button type="button" class="btn" id="hvVOk">Fertig</button></div>`).querySelector('#hvVOk').onclick = () => closeOverlay(); }

/* ---------- Seite bearbeiten ---------- */
function hvGeaendert(){ if(HV.ed == null || !HV.entwurf) return false; return JSON.stringify(hvSauber(HV.entwurf)) !== JSON.stringify(hvSauber(HV.d.seiten[HV.ed].daten || {})); }
// Vor dem Weggehen sichern. false heißt: es hat nicht geklappt, hierbleiben.
async function hvVerlassen(){ if(HV.ed == null) return true; if(hvGeaendert() && !(await hvSpeichern(true))) return false; HV.ed = null; HV.entwurf = null; return true; }
async function hvWaehlen(i){ if(!HV.d.planen){ return hvGeh(i); } if(HV.ed === i) return; if(!(await hvVerlassen())) return;
  const s = HV.d.seiten[i]; HV.vAuto = (HV.C && HV.C.V || [])[i] || null; HV.ed = i; HV.i = i; HV.entwurf = JSON.parse(JSON.stringify(s.daten || {}));
  // Dauerseiten fangen mit dem Stand aus dem letzten Heft an
  if(!Object.keys(HV.entwurf).length && (s.typ === 'training' || s.typ === 'impressum') && (HV.auto.vorlage || {})[s.typ]) HV.entwurf = JSON.parse(JSON.stringify(HV.auto.vorlage[s.typ]));
  hvSetzen(); const B = shOrt(); if(!B) return; hvBuch(B); hvEditor(B); hvBilder();
  const ed = B.querySelector('#hvEd'); if(ed && innerWidth < 900) try{ B.querySelector('.hv-buehne').scrollIntoView({ block:'start', behavior:'smooth' }); }catch(e){} }
async function hvSpeichern(still){ const i = HV.ed, s = HV.d.seiten[i], d = hvSauber(HV.entwurf); if(!d.text) delete d.ki;
  try{ await shRpc('stadionheft_seite_inhalt', { p_id:s.id, p_daten:d }); s.daten = d; HV.entwurf = JSON.parse(JSON.stringify(d)); if(!still) kToast('Seite ist gespeichert.'); hvSetzen(); HV.vAuto = (HV.C.V || [])[i] || null; return true; }
  catch(e){ kToast(e.message); return false; } }
function hvEdZu(){ HV.ed = null; HV.entwurf = null; hvSetzen(); const B = shOrt(); if(B){ const ed = B.querySelector('#hvEd'); if(ed){ ed.hidden = true; ed.innerHTML = ''; } B.querySelector('#hvHaupt').classList.remove('mit'); hvBuch(B); hvLeiste(B); hvHinweise(B); } }
function hvSpielText(g){ return hsTagKurz(g.d) + ' ' + g.heim + ' - ' + g.gast + ' ' + g.th + ':' + g.tg; }
function hvZeilenText(Z){ return (Z || []).map(z => [z.m, z.z, z.o, z.t].map(x => String(x || '').replace(/\s*\n\s*/g, ', ')).join('; ').replace(/(; )+$/, '')).join('\n'); }
function hvZeilenLesen(t){ return String(t || '').split('\n').map(l => l.split(';').map(x => x.trim())).filter(p => p[0]).map(p => ({ m:p[0], z:p[1] || '', o:p[2] || '', t:p.slice(3).join('; ') })); }
function hvExtraText(E){ return (E || []).map(e => [hsDatum(e.d), e.t, e.u].filter(Boolean).join('; ')).join('\n'); }
function hvExtraLesen(t){ return String(t || '').split('\n').map(l => l.split(';').map(x => x.trim())).map(p => { const m = /^(\d{1,2})\.(\d{1,2})\.(\d{4})$/.exec(p[0] || ''); return m && p[1] ? { d:`${m[3]}-${m[2].padStart(2, '0')}-${m[1].padStart(2, '0')}`, t:p[1], u:p.slice(2).join('; ') } : null; }).filter(Boolean); }

function hvEditor(B){ const ed = B.querySelector('#hvEd'), i = HV.ed, s = HV.d.seiten[i], d = HV.entwurf, T = SHP_TYP[s.typ] || SHP_TYP.frei, v = (HV.C.V || [])[i] || {}, fort = (HV.C.fort || {})[i]; if(!ed) return;
  B.querySelector('#hvHaupt').classList.add('mit'); ed.hidden = false;
  const feld = (k, name, opt) => { opt = opt || {}; return `<label class="field${opt.cls ? ' ' + opt.cls : ''}"><span>${name}${opt.hilfe ? ` <small>${opt.hilfe}</small>` : ''}</span>${opt.lang ? `<textarea data-hv-f="${k}" rows="${opt.lang}" maxlength="${opt.max || 12000}">${hvE(opt.wert != null ? opt.wert : d[k])}</textarea>` : `<input data-hv-f="${k}" maxlength="${opt.max || 160}" value="${hvE(d[k])}" autocomplete="off">`}</label>`; };
  const foto = name => `<div class="hv-foto"><span class="hv-fl">${name}</span>${d.foto ? `<span class="sh-pill ok">Foto ist da</span><button type="button" class="btn ghost sh-kn" id="hvFotoWeg">Foto entfernen</button>` : ''}<button type="button" class="btn ghost sh-kn" id="hvFotoB">${d.foto ? 'Anderes Foto' : 'Foto wählen'}</button><input type="file" id="hvFotoF" accept="image/jpeg,image/png,image/webp" hidden></div>${d.foto && s.typ !== 'titel' ? feld('bu', 'Bildunterschrift', { max:200 }) : ''}`;
  const anz = id => { const a = id && (HV.d.anzeigen || []).find(x => x.id === id); return a ? `<div class="hv-foto"><span class="hv-fl">${hvE(shpKurz(a.firma))}<small>${a.groesse === '1/1' ? 'ganze Seite' : 'halbe Seite'}</small></span><span class="sh-pill ${a.bild ? 'ok' : 'warn'}">${a.bild ? 'Druckvorlage ist da' : 'Druckvorlage fehlt'}</span><button type="button" class="btn ghost sh-kn" data-hv-vl="${a.id}">${a.bild ? 'Ersetzen' : 'Hochladen'}</button></div>` : ''; };
  let innen = '';
  if(fort != null && !Object.keys(hvSauber(d)).length) innen += `<p class="note">Hier läuft der Text von Seite ${fort.von + 1} weiter. Wenn du hier selbst etwas einträgst, wird es eine eigene Seite.</p>`;
  if(s.typ === 'titel') innen += `<p class="note">Von selbst steht hier das nächste Heimspiel. Mit einer eigenen Zeile ersetzt du es.</p>` + feld('kopf', 'Eigene Zeile', { hilfe:'statt des Heimspiels' }) + feld('dach', 'Kleine Zeile darüber') + feld('vorspann', 'Zeile darunter', { lang:2, max:300 }) + foto('Titelbild');
  else if(s.typ === 'inhalt') innen += `<p class="note">Das Verzeichnis baut sich aus den Überschriften der Seiten.</p>` + feld('kopf', 'Überschrift', { hilfe:'sonst: In diesem Heft' }) + feld('vorspann', 'Vorspann', { lang:2, max:400 }) + feld('text', 'Begrüßung', { lang:7, hilfe:'steht rechts im Kasten' });
  else if(s.typ === 'erste' || s.typ === 'zweite'){ const G = ((HV.auto.spiele || {})[v.sub || (s.typ === 'erste' ? 'A' : 'D2')] || []), jetzt = v.auto ? (v.art === 'bericht' && v.g ? 'Spielbericht ' + hvSpielText(v.g) : v.art === 'ergebnisse' ? 'Ergebnisse im Überblick' : v.art === 'vorschau' ? 'Die nächsten Spiele' : 'freie Seite') : '';
    innen += `<label class="field"><span>Was zeigt die Seite?</span><select data-hv-f="art"><option value="">Von selbst${jetzt ? ' (jetzt: ' + hvE(jetzt) + ')' : ''}</option><option value="bericht"${d.art === 'bericht' ? ' selected' : ''}>Spielbericht</option><option value="ergebnisse"${d.art === 'ergebnisse' ? ' selected' : ''}>Ergebnisse im Überblick</option><option value="vorschau"${d.art === 'vorschau' ? ' selected' : ''}>Die nächsten Spiele</option><option value="text"${d.art === 'text' ? ' selected' : ''}>Freier Beitrag</option></select></label>`
      + `<label class="field" id="hvSpielF"${d.art === 'bericht' ? '' : ' hidden'}><span>Welches Spiel?</span><select data-hv-f="spiel"><option value="">bitte wählen</option>${G.map(g => `<option value="${hvE(g.id)}"${d.spiel === g.id ? ' selected' : ''}>${hvE(hvSpielText(g))}</option>`).join('')}</select>${G.length ? '' : '<small>Seit dem letzten Heft gibt es noch keine Spiele mit Ergebnis.</small>'}</label>`
      + feld('dach', 'Kleine Zeile darüber') + feld('kopf', 'Überschrift') + feld('vorspann', 'Vorspann', { lang:2, max:500 }) + feld('text', 'Text', { lang:10, hilfe:'Jede Zeile ist ein Absatz. ## davor macht eine Zwischenüberschrift.' }) + foto('Foto')
      + ((d.art || v.art) === 'bericht' ? `<label class="sh-schalter"><input type="checkbox" data-hv-c="zeigen"${d.zeigen === 'ohne' ? '' : ' checked'}><span><b>Aufstellung zeigen</b><small>steht unten auf der Seite, kommt aus dem Spielbericht</small></span></label>` : ''); }
  else if(s.typ === 'tabelle') innen += `<label class="field"><span>Welche Tabellen?</span><select data-hv-f="welche"><option value="">Beide</option><option value="A"${d.welche === 'A' ? ' selected' : ''}>Nur ${HS_LIGA.A}</option><option value="D2"${d.welche === 'D2' ? ' selected' : ''}>Nur ${HS_LIGA.D2}</option></select></label>` + feld('text', 'Anmerkung unter der Tabelle', { lang:3, max:600 }) + `<p class="note">Die Tabellen kommen aus dem Daten-Update${HV.auto.tabelle_stand ? ', Stand ' + hvE(hsDatum(HV.auto.tabelle_stand)) : ''}.</p>`;
  else if(s.typ === 'termine'){ const E = HV.auto.termine || [], weg = new Set(d.weg || []);
    innen += feld('kopf', 'Überschrift', { hilfe:'sonst: Termine' }) + feld('vorspann', 'Vorspann', { lang:2, max:400 }) + `<p class="note">Heimspiele und öffentliche Termine aus dem Kalender stehen von selbst da. Sitzungen und Internes kommen nicht ins Heft.</p>`
      + (E.length ? `<div class="hv-liste">${E.map(e => `<label class="sh-schalter"><input type="checkbox" data-hv-weg="${hvE(e.id)}"${weg.has(e.id) ? '' : ' checked'}><span><b>${hvE(e.titel)}</b><small>${hvE(hsTagKurz(e.d))}${e.ort ? ' · ' + hvE(e.ort) : ''}</small></span></label>`).join('')}</div>` : '')
      + feld('extra', 'Weitere Termine', { lang:4, wert:hvExtraText(d.extra), hilfe:'je Zeile: 24.12.2026; Titel; Zusatz' }); }
  else if(s.typ === 'training') innen += feld('kopf', 'Überschrift', { hilfe:'sonst: Trainingszeiten' }) + feld('vorspann', 'Vorspann', { lang:2, max:400 }) + feld('zeilen', 'Zeiten', { lang:12, wert:hvZeilenText(d.zeilen), hilfe:'je Zeile: Mannschaft; Zeiten; Ort; Trainer' }) + feld('text', 'Hinweis darunter', { lang:2, max:500 }) + `<p class="note">Das nächste Heft übernimmt diese Liste.</p>`;
  else if(s.typ === 'impressum') innen += feld('kopf', 'Überschrift', { hilfe:'sonst: Impressum' }) + feld('text', 'Text', { lang:12, hilfe:'Jede Zeile ist ein Absatz. ## davor macht eine Zwischenüberschrift.' }) + `<p class="note">Die Liste der Partner im Heft steht von selbst daneben. Das nächste Heft übernimmt den Text.</p>`;
  else if(s.typ === 'anzeige' || s.typ === 'anzeigen') innen += (anz(s.a) + anz(s.b) || '<p class="note">Für diese Seite ist noch keine Anzeige gewählt.</p>') + `<p class="note">Welche Anzeige hier steht, legst du unter „Seiten planen“ fest.</p>`;
  else innen += feld('dach', 'Kleine Zeile darüber') + feld('kopf', 'Überschrift') + feld('vorspann', 'Vorspann', { lang:2, max:500 }) + feld('text', 'Text', { lang:10, hilfe:'Jede Zeile ist ein Absatz. ## davor macht eine Zwischenüberschrift.' }) + foto('Foto') + (s.a ? anz(s.a) : '');
  const text = s.typ !== 'anzeige' && s.typ !== 'anzeigen';
  // Vorschlag der KI: Spielbericht, Vorschau, Begrüßung aus den Daten der App; freie Beiträge werden nur geglättet
  const kiSorte = s.typ === 'inhalt' ? 'gruss' : (s.typ === 'erste' || s.typ === 'zweite') ? 'spiel' : HS_TEXT.includes(s.typ) ? 'frei' : null;
  if(kiSorte) innen += `<div class="hv-ki" id="hvKiB"><b>${kiSorte === 'frei' ? 'Text glätten lassen' : 'Text vorschlagen lassen'}</b><small>${kiSorte === 'frei' ? 'Die KI bringt deinen Text sprachlich in Ordnung. Inhalt, Namen und Zahlen bleiben.' : kiSorte === 'gruss' ? 'Die KI schreibt eine Begrüßung aus dem Heimspiel und den letzten Ergebnissen.' : 'Die KI schreibt aus Ergebnis, Toren, Aufstellung und Tabelle. Mehr weiß sie nicht. Was du dazuschreibst, kommt in den Text.'}</small>
      ${kiSorte === 'frei' ? '' : `<label class="field"><span>Stichworte <small>${kiSorte === 'gruss' ? 'was in die Begrüßung soll' : 'Wetter, Szenen, Stimmen, Besonderes'}</small></span><textarea id="hvStich" rows="2" maxlength="1500">${hvE(HV.stich[s.id] || '')}</textarea></label>`}
      ${kiSorte === 'spiel' ? '<label class="field"><span>Länge</span><select id="hvLaenge"><option value="kurz">kurz</option><option value="mittel" selected>mittel</option><option value="lang">lang</option></select></label>' : ''}
      <button type="button" class="btn ghost" id="hvKi">${kiSorte === 'frei' ? 'Text glätten' : 'Text vorschlagen'}</button></div>`;
  if(d.ki && d.text) innen += `<label class="sh-schalter hv-kip"><input type="checkbox" id="hvKiOk"${d.ki === 'ok' ? ' checked' : ''}><span><b>Text geprüft</b><small>Der Text stammt aus einem Vorschlag der KI. Hake ab, wenn du ihn gelesen und wo nötig geändert hast.</small></span></label>`;
  ed.innerHTML = `<div class="card hv-edk"><div class="hv-edh"><div><h3>Seite ${i + 1}</h3><span class="sh-pill gr">${hvE(T[0])}</span></div><button type="button" class="btn ghost sh-kn" id="hvEdZu">Schließen</button></div>
    <div class="sh-form hv-form">${innen}</div><input type="file" id="hvVlF" accept="image/jpeg,image/png,image/webp" hidden>
    <div class="hv-warn" id="hvEdWarn"></div>
    <div class="sh-akt">${text ? '<button type="button" class="btn" id="hvEdOk">Speichern</button>' : ''}<button type="button" class="btn ghost" id="hvEdVor"${i <= 0 ? ' disabled' : ''}>Seite davor</button><button type="button" class="btn ghost" id="hvEdNach"${i >= HV.d.seiten.length - 1 ? ' disabled' : ''}>Nächste Seite</button></div></div>`;
  const frisch = (neuBauen) => { clearTimeout(HV.zeit); HV.zeit = setTimeout(() => { hvSetzen(); hvBuch(B); hvEdWarn(B); hvHinweise(B); if(neuBauen) hvEditor(B); }, neuBauen ? 0 : 220); };
  // Schreibt jemand auf eine Seite, die von selbst ein Spiel zeigt, bleibt die Seite bei diesem Spiel
  const fest = () => { const va = HV.vAuto; if(d.art || !va || !va.auto || va.leer) return; d.art = va.art; if(va.art === 'bericht' && va.g) d.spiel = va.g.id;
    const sa = ed.querySelector('[data-hv-f="art"]'), ss = ed.querySelector('[data-hv-f="spiel"]'), sf = ed.querySelector('#hvSpielF'); if(sa) sa.value = d.art; if(ss && d.spiel) ss.value = d.spiel; if(sf) sf.hidden = d.art !== 'bericht'; };
  ed.querySelectorAll('[data-hv-f]').forEach(el => { const k = el.dataset.hvF, tun = () => { if(k !== 'art' && k !== 'spiel') fest();
      if(k === 'zeilen') d.zeilen = hvZeilenLesen(el.value); else if(k === 'extra') d.extra = hvExtraLesen(el.value); else d[k] = el.value; if(k === 'art' && d.art !== 'bericht') delete d.spiel; frisch(k === 'art'); };
    el.addEventListener(el.tagName === 'SELECT' ? 'change' : 'input', tun); });
  ed.querySelectorAll('[data-hv-c]').forEach(el => el.onchange = () => { if(el.checked) delete d.zeigen; else d.zeigen = 'ohne'; frisch(); });
  ed.querySelectorAll('[data-hv-weg]').forEach(el => el.onchange = () => { const W = new Set(d.weg || []); if(el.checked) W.delete(el.dataset.hvWeg); else W.add(el.dataset.hvWeg); d.weg = [...W]; frisch(); });
  const fb = ed.querySelector('#hvFotoB'), ff = ed.querySelector('#hvFotoF'); if(fb && ff){ fb.onclick = () => ff.click();
    ff.onchange = async () => { const f = ff.files[0]; if(!f) return; fb.disabled = true; fb.textContent = 'Lädt hoch …'; try{ d.foto = await hvFotoHoch(f); fest(); }catch(e){ kToast(e.message); } frisch(true); }; }
  const fw = ed.querySelector('#hvFotoWeg'); if(fw) fw.onclick = () => { delete d.foto; delete d.bu; frisch(true); };
  const vf = ed.querySelector('#hvVlF'); let ziel = null; ed.querySelectorAll('[data-hv-vl]').forEach(b => b.onclick = () => { ziel = (HV.d.anzeigen || []).find(a => a.id === b.dataset.hvVl); vf.click(); });
  vf.onchange = async () => { const f = vf.files[0]; if(!f || !ziel) return; kToast('Lädt hoch …'); try{ await hvVorlageHoch(ziel, f); kToast('Druckvorlage ist da.'); }catch(e){ kToast(e.message); } hvSetzen(); hvBuch(B); hvHinweise(B); hvEditor(B); };
  const st = ed.querySelector('#hvStich'); if(st) st.oninput = () => { HV.stich[s.id] = st.value; };
  const kok = ed.querySelector('#hvKiOk'); if(kok) kok.onchange = () => { d.ki = kok.checked ? 'ok' : 'offen'; frisch(); };
  const kb = ed.querySelector('#hvKi'); if(kb) kb.onclick = () => hvKiHolen(B, kiSorte, fest, frisch);
  ed.querySelector('#hvEdZu').onclick = () => hvVerlassen().then(ok => { if(ok) hvEdZu(); });
  const ok = ed.querySelector('#hvEdOk'); if(ok) ok.onclick = async () => { ok.disabled = true; if(await hvSpeichern()){ hvBuch(B); hvLeiste(B); hvHinweise(B); hvEditor(B); } else ok.disabled = false; };
  ed.querySelector('#hvEdVor').onclick = () => hvWaehlen(i - 1); ed.querySelector('#hvEdNach').onclick = () => hvWaehlen(i + 1);
  hvEdWarn(B); }
function hvEdWarn(B){ const w = B.querySelector('#hvEdWarn'); if(!w || HV.ed == null) return; const L = hvWarn(HV.ed), lang = L.some(t => /zu lang/.test(t));
  w.innerHTML = L.map(t => `<p class="hv-wz">${hvE(t)}</p>`).join('') + (lang ? '<button type="button" class="btn ghost sh-kn" id="hvRest">Leere Seite dahinter einfügen</button>' : '');
  const r = w.querySelector('#hvRest'); if(r) r.onclick = () => hvSeiteDahinter(); }
// Eine leere Seite derselben Sorte hinter die aktuelle: dort läuft der Text weiter
async function hvSeiteDahinter(){ const i = HV.ed; if(i == null || !(await hvSpeichern(true))) return; const S = HV.d.seiten, L = S.map(s => ({ id:s.id, typ:s.typ, titel:s.titel || '', a:s.a || '', b:s.b || '', fest:!!s.fest }));
  L.splice(i + 1, 0, { id:'', typ:S[i].typ, titel:'', a:'', b:'', fest:false });
  try{ await shRpc('stadionheft_plan_setzen', { p_heft:HV.heft, p_seiten:L }); HV.ed = null; HV.entwurf = null; HV.d = null; await hvLaden(); const B = shOrt(); if(B){ hvMalen(B); hvWaehlen(i); } kToast('Seite ist dazu. Der Text läuft dort weiter.'); }
  catch(e){ kToast(e.message); } }

/* ---------- Vorschlag der KI ---------- */
// Was die Seite gerade zeigt, entscheidet über die Aufgabe: Spielbericht, Vorschau, Begrüßung oder Glätten
function hvKiAuftrag(sorte){ const i = HV.ed, s = HV.d.seiten[i], d = HV.entwurf, v = HV.vAuto || {}, B = { heft:HV.heft, titel:HV.d.heft.titel, stichworte:HV.stich[s.id] || '' };
  if(sorte === 'gruss') return Object.assign(B, { art:'gruss' });
  if(sorte === 'spiel'){ const a = d.art || (v.auto && !v.leer ? v.art : ''), spiel = d.spiel || (v.auto && v.g ? v.g.id : '');
    if(a === 'bericht' && spiel) return Object.assign(B, { art:'bericht', spiel, laenge:(document.getElementById('hvLaenge') || {}).value || 'mittel' });
    if(a === 'bericht') return { fehler:'Wähle erst das Spiel, zu dem der Text gehört.' };
    if(a === 'vorschau') return Object.assign(B, { art:'vorschau', team:s.typ === 'zweite' ? 'D2' : 'A' }); }
  if(String(d.text || '').trim().length < 40) return { fehler:sorte === 'spiel' ? 'Für einen freien Beitrag schreibst du erst selbst. Die KI glättet ihn dann.' : 'Schreib erst deinen Text. Die KI glättet ihn dann.' };
  return { heft:HV.heft, art:'glaetten', text:d.text, kopf:d.kopf || '' }; }
async function hvKiHolen(B, sorte, fest, frisch){ const auf = hvKiAuftrag(sorte), kb = B.querySelector('#hvKi'); if(auf.fehler){ kToast(auf.fehler); return; } if(!kb || kb.disabled) return;
  const alt = kb.textContent; kb.disabled = true; kb.textContent = 'Schreibt …';
  try{ const { data, error } = await SVB.sb.functions.invoke('heft-ki', { body:auf }); let r = data;
    if(error){ try{ r = await error.context.json(); }catch(e){ r = null; } }
    if(!r || !r.ok){ kToast((r && r.error) || 'Der KI-Assistent ist gerade nicht erreichbar.'); return; }
    hvKiDialog(B, r, sorte, fest, frisch); }
  catch(e){ kToast('Der KI-Assistent ist gerade nicht erreichbar.'); }
  finally{ const k = B.querySelector('#hvKi'); if(k){ k.disabled = false; k.textContent = alt; } } }
function hvKiDialog(B, r, sorte, fest, frisch){ const d = HV.entwurf, i = HV.ed, glatt = r.art === 'glaetten', ersetzt = !glatt && String(d.text || '').trim().length > 0;
  const M = svModal(`<div class="mhead"><div><h2 style="margin:0">${glatt ? 'Dein Text, geglättet' : 'Vorschlag der KI'}</h2><div class="msub">Seite ${i + 1}</div></div></div>
    <div class="hv-kiv" id="hvKiV">${r.kopf ? `<h3>${hvE(r.kopf)}</h3>` : ''}${r.vorspann ? `<p class="hv-kivs">${hvE(r.vorspann)}</p>` : ''}${String(r.text).split('\n').filter(Boolean).map(z => /^## /.test(z) ? `<h4>${hvE(z.slice(3))}</h4>` : `<p>${hvE(z)}</p>`).join('')}</div>
    ${r.hinweis ? `<p class="note"><b>Hinweis der KI:</b> ${hvE(r.hinweis)}</p>` : ''}
    <p class="note">${glatt ? 'Inhalt, Namen und Zahlen sollten gleich geblieben sein. Lies bitte gegen.' : 'Der Vorschlag nutzt nur, was in der App steht, und deine Stichworte. Lies ihn, bevor er ins Heft geht.'}${ersetzt ? ' Übernehmen ersetzt deinen bisherigen Text.' : ''}</p>
    <div class="pz-tc-dlgk"><button type="button" class="btn" id="hvKiJa">Übernehmen</button><button type="button" class="btn ghost" id="hvKiNeu">Noch einmal</button><button type="button" class="btn ghost" id="hvKiNein">Verwerfen</button></div>`);
  M.querySelector('#hvKiNein').onclick = () => closeOverlay();
  M.querySelector('#hvKiNeu').onclick = () => { closeOverlay(); hvKiHolen(B, sorte, fest, frisch); };
  M.querySelector('#hvKiJa').onclick = () => { closeOverlay(); if(HV.ed !== i) return; fest();
    if(r.kopf && !(glatt && d.kopf)) d.kopf = r.kopf; if(r.vorspann) d.vorspann = r.vorspann; d.text = r.text; d.ki = 'offen'; frisch(true); kToast('Übernommen. Bitte lesen und „Text geprüft“ abhaken.'); }; }

/* ---------- Druckdatei ---------- */
function hvDateiName(){ const m = /^(\d{4})-(\d{2})/.exec(HV.d.heft.monat || HV.d.heft.erscheint || ''); return 'Doppelpass_' + (m ? m[1] + '-' + m[2] : 'Heft') + '.pdf'; }
function hvDruckDialog(){ const L = hvHinweisListe(), h = HV.d.heft, n = HV.d.seiten.length;
  const M = svModal(`<div class="mhead"><div><h2 style="margin:0">Druckdatei</h2><div class="msub">${hvE(h.titel)} · ${n} Seiten</div></div></div>
    ${h.status !== 'freigegeben' && h.status !== 'gedruckt' ? '<p class="note">Das Heft ist noch nicht freigegeben. Zum Ansehen und Prüfen kannst du die Datei trotzdem schreiben.</p>' : ''}
    ${L.length ? `<p class="note"><b>${L.length === 1 ? 'Ein Punkt ist' : L.length + ' Punkte sind'} noch offen:</b></p><ul class="hv-ul">${L.slice(0, 8).map(x => `<li>${x.i == null ? '' : 'Seite ' + (x.i + 1) + ': '}${hvE(x.t)}</li>`).join('')}${L.length > 8 ? `<li>und ${L.length - 8} weitere</li>` : ''}</ul>` : '<p class="note">Alles da. Das Heft kann in den Druck.</p>'}
    <label class="sh-schalter"><input type="checkbox" id="hvBeschnitt"><span><b>Mit 3 mm Beschnitt rundum</b><small>für randlosen Druck. Die Druckerei sagt, ob sie das braucht.</small></span></label>
    <p class="note" id="hvDStand" aria-live="polite">Die Datei hat das Format A4, alle Schriften sind eingebettet.</p>
    <div class="pz-tc-dlgk"><button type="button" class="btn" id="hvDOk">Druckdatei schreiben</button><button type="button" class="btn ghost" id="hvDAb">Abbrechen</button></div>`);
  M.querySelector('#hvDAb').onclick = () => closeOverlay();
  M.querySelector('#hvDOk').onclick = async () => { const b = M.querySelector('#hvDOk'), st = M.querySelector('#hvDStand'), rand = M.querySelector('#hvBeschnitt').checked; b.disabled = true;
    try{ st.textContent = 'Lade die Bilder …'; await hvBilder(); hvSetzen(); const blob = await hsPdf(HV.P, { beschnitt:rand, titel:h.titel, schritt:(a, z) => { st.textContent = `Schreibe Seite ${a} von ${z} …`; } });
      closeOverlay(); await svdSichern(blob, hvDateiName()); }
    catch(e){ st.textContent = 'Das hat nicht geklappt: ' + (e.message || e); b.disabled = false; } }; }

(function(){ try{ const s=document.createElement('style'); s.id='svm106css'; s.textContent="/* 0.99.31: Stadionheft, Vorschau zum Blättern und Seiten bearbeiten (svm105.js, svm106.js) */\n.hs-svg{display:block;width:100%;height:auto;}\n.hs-svg text{font-kerning:none;font-variant-ligatures:none;white-space:pre;}\n.hv-kopf h2{margin:0 0 2px;font-size:20px;font-weight:800;letter-spacing:-.02em;color:var(--ink);}\n.hv-haupt{display:grid;grid-template-columns:minmax(0,1fr);gap:16px;align-items:start;margin:14px 0;}\n.hv-buehne{display:grid;grid-template-columns:44px minmax(0,1fr) 44px;gap:8px;align-items:center;}\n.hv-nav{width:44px;height:64px;border-radius:12px;border:1px solid var(--line);background:rgba(148,163,196,.1);color:var(--ink);font-size:30px;line-height:1;font-family:inherit;cursor:pointer;display:grid;place-items:center;padding:0 0 4px;}\n.hv-nav:disabled{opacity:.3;cursor:default;}\n.hv-nav:focus-visible,.hv-seite:focus-visible,.hv-ch:focus-visible,.hv-hz:focus-visible{outline:3px solid var(--brand);outline-offset:2px;}\n.hv-buch{position:relative;display:grid;grid-template-columns:1fr 1fr;max-width:min(1040px,calc((100vh - 250px) * 1.414));min-width:280px;width:100%;margin:0 auto;perspective:2400px;touch-action:pan-y;-webkit-user-select:none;user-select:none;\n  filter:drop-shadow(0 18px 30px rgba(6,10,26,.45));}\n.hv-buch.einzel{grid-template-columns:1fr;max-width:min(560px,max(300px,calc((100vh - 190px) * .707)));}\n.hv-seite{position:relative;aspect-ratio:210/297;background:#fff;overflow:hidden;min-width:0;}\n.hv-seite[data-i]{cursor:pointer;}\n.hv-seite.leer{background:transparent;}\n.hv-seite.li::after,.hv-seite.re::after{content:\"\";position:absolute;top:0;bottom:0;width:5%;pointer-events:none;}\n.hv-seite.li::after{right:0;background:linear-gradient(to right,rgba(20,24,40,0),rgba(20,24,40,.16));}\n.hv-buch:not(.einzel) .hv-seite.re::after{left:0;background:linear-gradient(to left,rgba(20,24,40,0),rgba(20,24,40,.16));}\n.hv-seite.leer::after{display:none;}\n.hv-seite.wahl{outline:3px solid var(--brand);outline-offset:3px;}\n.hv-blatt{position:absolute;top:0;bottom:0;width:50%;transform-style:preserve-3d;z-index:3;}\n.hv-blatt.vor{left:50%;transform-origin:left center;}\n.hv-blatt.rueck{left:0;transform-origin:right center;}\n.hv-bv,.hv-bh{position:absolute;inset:0;background:#fff;backface-visibility:hidden;-webkit-backface-visibility:hidden;overflow:hidden;}\n.hv-bh{transform:rotateY(180deg);}\n.hv-bh:empty{background:transparent;}\n.hv-wo{text-align:center;font-size:13.5px;font-weight:650;color:var(--ink2);margin:12px 0 8px;font-variant-numeric:tabular-nums;}\n.hv-leiste{display:flex;flex-wrap:wrap;gap:5px;justify-content:center;}\n.hv-ch{position:relative;min-width:34px;height:40px;border-radius:7px;border:1.5px solid #cfd3dc;background:#fff;color:#2a3146;font:inherit;font-size:12.5px;font-weight:750;font-variant-numeric:tabular-nums;cursor:pointer;padding:0 4px;}\n.hv-ch.ti{background:#1b2235;border-color:#1b2235;color:#fff;}\n.hv-ch.be{background:#eaf0fd;border-color:#a9bdf0;}\n.hv-ch.ju{background:#e4f5ea;border-color:#9fd3b0;}\n.hv-ch.az{background:#fdeede;border-color:#e3a36c;color:#8f3d0a;}\n.hv-ch.on{outline:3px solid var(--brand);outline-offset:1px;}\n.hv-ch.hin::after{content:\"\";position:absolute;right:-4px;top:-4px;width:10px;height:10px;border-radius:50%;background:#e8930c;border:2px solid var(--bg,#05070c);}\n.hv-hin .sh-sub{margin-bottom:10px!important;}\n.hv-hl{display:flex;flex-direction:column;gap:2px;}\n.hv-hz{display:grid;grid-template-columns:86px minmax(0,1fr);gap:10px;align-items:center;min-height:44px;padding:6px 8px;border-radius:10px;border:0;background:none;color:var(--ink);font:inherit;font-size:14px;line-height:1.35;text-align:left;}\nbutton.hv-hz{cursor:pointer;}\nbutton.hv-hz:hover{background:rgba(148,163,196,.1);}\n.hv-hz .sh-pill{justify-self:start;}\n.hv-ul{margin:0 0 12px;padding-left:20px;font-size:14px;line-height:1.5;color:var(--ink2);}\n.hv-edk{margin:0;}\n.hv-edh{display:flex;justify-content:space-between;align-items:flex-start;gap:10px;margin-bottom:12px;}\n.hv-edh h3{margin:0 0 4px;font-size:19px;font-weight:800;color:var(--ink);}\n.hv-form{grid-template-columns:minmax(0,1fr)!important;}\n.hv-form textarea{resize:vertical;line-height:1.45;padding-top:10px;padding-bottom:10px;}\n.hv-form .note{margin:0;}\n.hv-foto{display:flex;flex-wrap:wrap;gap:8px;align-items:center;padding:8px 0;border-top:1px solid var(--line);}\n.hv-fl{flex:1 1 130px;font-size:14px;font-weight:700;color:var(--ink);}\n.hv-fl small{display:block;font-size:12.5px;font-weight:500;color:var(--ink2);}\n.hv-liste{border-top:1px solid var(--line);}\n.hv-wz{margin:0 0 8px;padding:9px 12px;border-radius:10px;background:rgba(245,158,11,.14);color:var(--warn);font-size:13.5px;line-height:1.4;}\n.hv-ki{display:flex;flex-direction:column;gap:8px;padding:12px;border-radius:12px;border:1px dashed var(--line);background:rgba(148,163,196,.07);}\n.hv-ki > b{font-size:14.5px;color:var(--ink);}\n.hv-ki > small{font-size:12.5px;line-height:1.45;color:var(--ink2);}\n.hv-ki .btn{min-height:46px;}\n.hv-kip{border-top:1px solid var(--line);}\n.hv-kiv{max-height:46vh;overflow:auto;padding:14px 16px;margin:0 0 12px;border-radius:12px;background:#fff;color:#15171c;border:1px solid #d3d8e3;}\n.hv-kiv h3{margin:0 0 8px;font-size:19px;line-height:1.2;font-weight:800;color:#15171c;}\n.hv-kiv h4{margin:12px 0 4px;font-size:13px;letter-spacing:.06em;text-transform:uppercase;color:#263d8f;}\n.hv-kiv p{margin:0 0 8px;font-size:14.5px;line-height:1.5;color:#15171c;}\n.hv-kiv p.hv-kivs{font-weight:700;}\n@media (min-width:900px){\n  .hv-haupt.mit{grid-template-columns:minmax(0,1fr) minmax(340px,400px);}\n  .hv-haupt.mit .hv-ed{position:sticky;top:12px;max-height:calc(100vh - 24px);overflow:auto;border-radius:16px;}\n}\n@media (max-width:560px){\n  .hv-buehne{grid-template-columns:minmax(0,1fr);}\n  .hv-buehne .hv-nav{display:none;}\n  .hv-hz{grid-template-columns:minmax(0,1fr);gap:4px;}\n}\n@media (prefers-reduced-motion:reduce){ .hv-blatt{display:none;} }\n/* Das Stadionheft auf einem eigenen Blatt über der App (für die Redaktion ohne den Bereich Partner).\n   Liegt über Leiste und Seitenmenü (45, 50), aber unter den Dialogen (.overlay hat 60), sonst wären die nicht zu sehen. */\n.sh-voll{position:fixed;inset:0;z-index:55;overflow:auto;-webkit-overflow-scrolling:touch;background:var(--bg,#05070c);padding:calc(10px + env(safe-area-inset-top)) max(14px,env(safe-area-inset-right)) calc(28px + env(safe-area-inset-bottom)) max(14px,env(safe-area-inset-left));}\n.sh-vollk{display:flex;justify-content:space-between;align-items:center;gap:12px;max-width:1180px;margin:0 auto 12px;}\n.sh-vollk b{font-size:17px;font-weight:800;color:var(--ink);}\n.sh-vollk .btn{min-height:44px;}\n.sh-vollb{max-width:1180px;margin:0 auto;}\nhtml.sh-vollan{overflow:hidden;}\n"; document.head.appendChild(s); }catch(e){} })();
/* =====================================================================
   Beta 0.99.33 · Startseite nach dringend und wichtig
   Albert, 14.11.2026: „Die erste Seite ist vor allem für die Abteilungsleitung zu voll. Für jede Rolle prüfen, was dort dringend
   und wichtig ist, der Rest weg oder nach unten. Die Abteilungsleitung braucht keine neuen Scouting-Berichte und Scores, das gehört
   zur Seniorenabteilung und zur Kaderentwicklung.“
   Ordnung für alle Rollen, von oben nach unten:
     1. Wartet auf dich   dringend und wichtig: offene Fragen, Freigaben, überfällige To-dos, eigene Einsätze
     2. Als Nächstes      wichtig mit Termin: nächste Termine, das nächste Spiel, der eigene Spieltag
     3. Deine Bereiche    die häufigsten Wege (die Liste aus svm58.js)
     4. Im Blick          wichtig, aber nicht dringend: eigene Aufgaben, Hinweise, Stand der Mannschaft
     5. darunter          erste Schritte, App aufs Handy, lange Listen zum Aufklappen
   Was eine Rolle nicht braucht, steht nicht auf ihrer Startseite (HZ_SICHT, „weg“). Es bleibt über die Bereiche erreichbar.
   Die Karten bauen weiter die Module, die sie schon immer gebaut haben. Diese Datei ordnet sie nur und blendet aus: Sie fasst keine
   Karte an und verschiebt nichts in andere Behälter, damit die Module ihre Karten weiter finden. Neue Karten, die hier noch niemand
   kennt, bleiben sichtbar (unter „Im Blick“), bis sie einen Platz bekommen.
   ===================================================================== */
const HZ = { beob:null, t:null, laeuft:false };
const HZ_TITEL = { a:'Wartet auf dich', b:'Als Nächstes', d:'Im Blick' };
const HZ_LISTEN = ['htFeedBtn', 'vrHome', 'homeTiles', 'homeKand', 'svAct', 'homeCrm', 'homeFocus', 'homeWechsel', 'homeGems', 'homePress'];   // Scouting, Radar, Kader
// Je Sicht: welche Karte in welche Gruppe gehört (in dieser Reihenfolge) und was gar nicht auf die Startseite gehört.
// Ausgeblendet wird nur, was für die Sicht klar nicht auf die Startseite gehört. Karten, die es nur gibt, wenn sie die Person selbst betreffen
// (eigene To-dos, eigene Einsätze, das eigene Spielerkonto, eigene Mannschaften), blendet keine Sicht aus.
const HZ_SICHT = {
  leitung: { a:['zgHome', 'frKarte', 'shHome', 'prioHeute', 'sc2Home', 'svRemind', 'e95Karte'], b:['szHome', 'kalHome', 'spHome', 'sptHome'], c:['ablHeute', 'svHeute'], d:['ogHome', 'svCockpit', 'sk96Karte', 'svrMeine'], e:['appStore', 'o1karte', 'appInstall'],
             weg:['trHome', 'kbHome'], listen:false },   // To-dos gleich unter der Begrüßung (Vorstand, 04.11.2026)
  bereich: { a:['frKarte', 'shHome', 'prioHeute', 'sc2Home', 'svRemind', 'e95Karte'], b:['szHome', 'kalHome', 'spHome', 'sptHome'], c:['ablHeute', 'svHeute'], d:['ogHome', 'sk96Karte', 'svrMeine'], e:['appStore', 'o1karte', 'appInstall'],
             weg:['svCockpit', 'trHome', 'kbHome'], listen:false },
  planer:  { a:['frKarte', 'svRemind', 'prioHeute', 'e95Karte', 'shHome'], b:['szHome', 'kalHome', 'kbHome', 'spHome', 'sptHome'], c:['ablHeute', 'svHeute'], d:['svCockpit', 'sc2Home', 'ogHome', 'trHome', 'sk96Karte', 'svrMeine'], e:['appStore', 'o1karte', 'appInstall'],
             weg:[], listen:true },
  trainer: { a:['frKarte', 'svRemind', 'e95Karte', 'sc2Home', 'prioHeute', 'shHome'], b:['szHome', 'kalHome', 'kbHome', 'spHome', 'sptHome'], c:['ablHeute', 'svHeute'], d:['trHome', 'svCockpit', 'ogHome', 'sk96Karte', 'svrMeine'], e:['appStore', 'o1karte', 'appInstall'],
             weg:[], listen:true },
  jugend:  { a:['frKarte', 'svRemind', 'e95Karte', 'prioHeute', 'sc2Home', 'shHome'], b:['szHome', 'kalHome', 'sptHome'], c:['ablHeute', 'svHeute'], d:['svrMeine', 'ogHome', 'sk96Karte'], e:['appStore', 'o1karte', 'appInstall'],
             weg:['svCockpit', 'trHome', 'kbHome', 'spHome'], listen:false },
  spieler: { a:['frKarte', 'e95Karte', 'svRemind', 'prioHeute', 'shHome'], b:['szHome', 'kalHome', 'kbHome', 'spHome', 'sptHome'], c:['ablHeute', 'svHeute'], d:['sk96Karte', 'ogHome', 'svrMeine'], e:['appStore', 'o1karte', 'appInstall'],
             weg:['svCockpit', 'trHome', 'sc2Home'], listen:false },
  helfer:  { a:['frKarte', 'e95Karte', 'svRemind', 'prioHeute', 'shHome'], b:['szHome', 'kalHome', 'sptHome'], c:['ablHeute', 'svHeute'], d:['ogHome', 'sk96Karte', 'svrMeine'], e:['appStore', 'o1karte', 'appInstall'],
             weg:['svCockpit', 'trHome', 'sc2Home', 'kbHome', 'spHome'], listen:false },
  gast:    { a:['frKarte', 'shHome', 'e95Karte', 'svRemind', 'prioHeute'], b:['szHome', 'kalHome', 'spHome', 'sptHome'], c:['ablHeute', 'svHeute'], d:['svCockpit', 'sc2Home', 'ogHome', 'sk96Karte', 'svrMeine'], e:['appStore', 'o1karte', 'appInstall'],
             weg:[], listen:true } };

// Wer Scouting oder Kader leitet, vertritt oder dort mithilft (Funktion im Bereich), sieht die Startseite der Kaderplanung
function hzKaderFunktion(){ try{ return ((typeof FR100 !== 'undefined' && FR100.ich) || []).some(x => x && x.stufe && x.stufe !== 'aus' && /^(scouting|kader)(:|$)/.test(x.bereich || '')); }catch(e){ return false; } }
function hzSicht(){ const r = svRole(); if(r === 'admin' || r === 'vorstand') return 'leitung'; if(HZ_SICHT[r]) return r;
  try{ if(r === 'viewer' && hzKaderFunktion()) return 'planer'; if(r === 'viewer' && window.__SV_ROLLE_T) return 'bereich'; }catch(e){} return 'gast'; }
// Wer in der Abteilungsleitung auch mit Scouting und Kader arbeitet, holt sich beides selbst auf die Startseite zurück
function hzScoutDarf(){ try{ return hzSicht() === 'leitung' && svTabAllowed('scout'); }catch(e){ return false; } }
function hzScoutAn(){ try{ return hzScoutDarf() && localStorage.getItem('sv_hz_scout') === '1'; }catch(e){ return false; } }
function hzPlan(){ const k = hzSicht(), S = HZ_SICHT[k]; if(!hzScoutAn()) return Object.assign({ k }, S);
  return { k, a:S.a, b:S.b, c:S.c, d:[...new Set(S.d.concat(['svCockpit', 'trHome']))], e:S.e, weg:S.weg.filter(i => !['svCockpit', 'trHome'].includes(i)), listen:true, scout:true }; }

// Hinweise im Cockpit: Die Leitung bekommt nur die aus dieser Liste. Raus sind damit Radar, Kandidaten, Bindungsrisiko, Verletzte,
// Spielergespräche, Bedarf und offene Abstimmungen: Das gehört zur Kaderplanung und zum Trainerteam.
// Ein neuer Hinweis, den die Leitung sehen soll, muss hier eingetragen werden, sonst sieht sie ihn nicht.
const HZ_HINWEIS_LEITUNG = [/^⚠️ Co-Trainer: auffällige Nutzung/, /seit 14\+ Tagen nicht in der App/,          // Nutzung der App
  /^Form:/, /^🎉/, /^(Sieg|Remis|Niederlage):/, /^[^:]{2,12}: (gegen|bei) /,                                     // Ergebnis, nächstes Spiel, Jubiläen
  /noch nie geholfen/];                                                                                           // Helfer
function hzHinweisFuerLeitung(x){ const t = (x && x.t) || ''; if(HZ_HINWEIS_LEITUNG.some(re => re.test(t))) return true;
  try{ if(/^Kasse:/.test(t)) return !!(typeof KB !== 'undefined' && KB.ich && KB.ich.kassenwart); }catch(e){} return false; }
if(typeof svInsights === 'function'){ const _i = svInsights; svInsights = function(){ const L = _i.apply(this, arguments);
  try{ if(hzSicht() === 'leitung' && !hzScoutAn()) return L.filter(hzHinweisFuerLeitung); }catch(e){} return L; }; }

// „Deine Bereiche“: Das Spielerkonto steht nur bei denen vorn, die selbst spielen oder trainieren. Alle anderen finden es am Ende der Liste.
if(typeof htZiele === 'function'){ const _z = htZiele; htZiele = function(){ const Z = _z.apply(this, arguments);
  try{ const k = hzSicht(), i = Z.indexOf('spielerkonto'); if(i >= 0 && k !== 'spieler' && !(typeof MT100 !== 'undefined' && MT100.d && MT100.d.ok)){ Z.splice(i, 1); Z.push('spielerkonto'); }   /* seit 0.99.39 auch beim Trainer hinten: Für ihn steht die Mannschaft vorn (Rollenkatalog 3.2), außer er spielt selbst */ }catch(e){} return Z; }; }

// Karte „Neue Meldungen“: Sie zählte bisher alles Ungelesene, auch Radar, Scouting und Trainings-Scores. Die Leitung bekommt dort nur noch,
// was sie betrifft (Organisation, Zugänge, Partner, System), das Trainerteam alles außer Scouting. Die Meldungen selbst bleiben, wo sie sind (Glocke).
const HZ_MELD_AUS = { leitung:/^(scout_|radar|training|kontakte|brief)/, trainer:/^(scout_|radar|kontakte)/ };
if(typeof sc2HomeCard === 'function' && typeof SC2 !== 'undefined'){ const _m = sc2HomeCard; sc2HomeCard = function(){ let re = null; try{ re = hzScoutAn() ? null : HZ_MELD_AUS[hzSicht()]; }catch(e){}
  if(!re) return _m.apply(this, arguments); const alle = SC2.meld; SC2.meld = alle.filter(m => !re.test(m.art || ''));
  try{ return _m.apply(this, arguments); } finally { SC2.meld = alle; } }; }

function hzDa(el){ if(!el || el.hasAttribute('data-hz-weg')) return false; if(el.hidden || el.style.display === 'none') return false; if(!el.childElementCount && !(el.textContent || '').trim()) return false;
  return true; }
function hzStill(el){ if(!el) return false; if(el.id === 'sptHome') return /Gerade kein Heimspiel/.test(el.textContent || '');
  if(el.id === 'prioHeute') return !!el.querySelector('.prio-hl > .prio-hin');   // To-dos: nichts fällig
  return false; }
// Umgekehrt: Eine Karte aus „Im Blick“, auf der gerade etwas offen ist, gehört nach oben. Spielerkonto: offene Strafen oder ein Einspruch, den man entscheiden muss.
function hzDringt(el){ if(!el) return false;
  try{ if(el.id === 'sk96Karte' && typeof SK96 !== 'undefined' && SK96.d){ const d = SK96.d; return !!((d.ich && d.offen && +d.offen.eur > 0) || (d.pruefer && +d.einsprueche_offen)); } }catch(e){}
  return false; }
function hzTitel(home, z, text, ruhig){ let t = home.querySelector(':scope > .hz-k[data-hz="' + z + '"]');
  if(!t){ t = document.createElement('h2'); t.className = 'hz-k'; t.dataset.hz = z; }
  if(t.textContent !== text) t.textContent = text; t.classList.toggle('ruhig', !!ruhig); return t; }

function hzOrdnen(){ const home = document.getElementById('panel-home'), hello = document.getElementById('svHeute') && document.getElementById('svHello'); if(!home || !hello || hello.parentNode !== home || HZ.laeuft) return;
  HZ.laeuft = true; if(HZ.beob) HZ.beob.disconnect();
  try{ const P = hzPlan(); HZ.k = P.k; HZ.scout = !!P.scout; home.dataset.hz = P.k + (P.scout ? ' scout' : '');
    const weg = new Set(P.weg.concat(P.listen ? [] : HZ_LISTEN)), kinder = [...home.children];
    // 1. ausblenden, was diese Sicht nicht braucht (die Karte bleibt im Dokument, das Modul findet sie weiter)
    kinder.forEach(x => { if(x.classList.contains('hz-k') || x.id === 'hzAnp') return; const aus = x.id ? weg.has(x.id) : (!P.listen && (x.classList.contains('sechead') || x.classList.contains('frow')));
      if(aus !== x.hasAttribute('data-hz-weg')){ if(aus) x.setAttribute('data-hz-weg', ''); else x.removeAttribute('data-hz-weg'); } });
    // 2. Reihenfolge
    const el = i => { const x = document.getElementById(i); return x && x.parentNode === home ? x : null; }, gruppe = z => P[z].map(el).filter(Boolean);
    // Erste Schritte: solange noch nichts erledigt ist, direkt unter den Bereichen (so seit 0.74), danach ganz unten
    const neuHier = (() => { try{ const o = el('o1karte'); return o && typeof o1Stand === 'function' && o1Stand().fertig === 0 ? o : null; }catch(e){ return null; } })();
    const still = gruppe('a').concat(gruppe('b')).filter(hzStill);   // eine Karte, die selbst sagt, dass gerade nichts ansteht, rückt nach unten
    const dringt = gruppe('d').filter(hzDringt);
    const A = gruppe('a').filter(x => !still.includes(x)).concat(dringt), B = gruppe('b').filter(x => !still.includes(x)), C = gruppe('c'), D = gruppe('d').filter(x => !dringt.includes(x)).concat(still), E = gruppe('e').filter(x => x !== neuHier), bekannt = new Set([hello, neuHier, ...A, ...B, ...C, ...D, ...E].filter(Boolean));
    // Karten, die hier noch niemand kennt, bleiben sichtbar: unter „Im Blick“
    const fremd = kinder.filter(x => x.id && !bekannt.has(x) && !weg.has(x.id) && !HZ_LISTEN.includes(x.id) && x.id !== 'hzAnp' && !x.classList.contains('hz-k'));
    const listen = kinder.filter(x => !bekannt.has(x) && !fremd.includes(x) && !x.classList.contains('hz-k') && x.id !== 'hzAnp');   // Scouting-Listen und ihre Überschriften in ihrer Reihenfolge
    const hatA = A.some(hzDa), hatB = B.some(hzDa), hatD = D.concat(fremd).some(hzDa);
    const folge = [hello, hzTitel(home, 'a', hatA ? HZ_TITEL.a : 'Gerade wartet nichts auf dich.', !hatA), ...A, hatB ? hzTitel(home, 'b', HZ_TITEL.b) : null, ...B, ...C, neuHier, hatD ? hzTitel(home, 'd', HZ_TITEL.d) : null, ...D, ...fremd, ...E, ...listen, hzAnpassen(home)].filter(Boolean);
    home.querySelectorAll(':scope > .hz-k').forEach(t => { if(!folge.includes(t)) t.remove(); });
    // Nur umhängen, was nicht an seinem Platz steht: Wer gerade in einer Karte tippt, behält so fast immer seinen Platz. Geht der Fokus doch verloren, kommt er zurück.
    const fokus = document.activeElement; let ref = home.firstElementChild;
    folge.forEach(x => { if(x === ref) ref = ref.nextElementSibling; else home.insertBefore(x, ref); });
    if(fokus && fokus !== document.body && fokus !== document.activeElement && home.contains(fokus)){ try{ fokus.focus({ preventScroll:true }); }catch(e){} }
  }catch(e){ console.warn('Startseite', e); }
  finally{ HZ.laeuft = false; hzBeobachten(); } }

// Unten auf der Seite: Scouting und Kader für die eigene Startseite ein- oder ausschalten (nur wer es darf)
function hzAnpassen(home){ let b = document.getElementById('hzAnp'); if(!hzScoutDarf()){ if(b) b.remove(); return null; }
  if(!b){ b = document.createElement('button'); b.type = 'button'; b.id = 'hzAnp'; b.className = 'hz-anp';
    b.onclick = () => { const an = !hzScoutAn(); try{ localStorage.setItem('sv_hz_scout', an ? '1' : '0'); }catch(e){} try{ if(typeof svCockpit === 'function') svCockpit(); }catch(e){} try{ sc2HomeCard(); }catch(e){} hzOrdnen(); try{ if(typeof htKlappe === 'function') htKlappe(); }catch(e){} hzOrdnen();
      kToast(an ? 'Scouting und Kader stehen wieder auf deiner Startseite.' : 'Scouting und Kader sind von deiner Startseite weg. Du findest beides im Bereich Scouting.'); }; }
  const an = hzScoutAn(), text = an ? 'Scouting und Kader von meiner Startseite nehmen' : 'Scouting und Kader auf meiner Startseite zeigen'; if(b.textContent !== text) b.textContent = text; b.setAttribute('aria-pressed', an ? 'true' : 'false'); return b; }

function hzBald(){ clearTimeout(HZ.t); HZ.t = setTimeout(hzOrdnen, 80); }
// Der Beobachter ordnet sofort, also noch bevor der Browser neu zeichnet: Eine Karte, die ein Modul gerade umgehängt hat, springt so nicht sichtbar hin und her
function hzBeobachten(){ const home = document.getElementById('panel-home'); if(!home) return;
  if(!HZ.beob) HZ.beob = new MutationObserver(() => { if(!HZ.laeuft) hzOrdnen(); });
  HZ.beob.observe(home, { childList:true, subtree:true }); }
// Einhängen: nach jedem Aufbau der Startseite, und sobald eine Karte dazukommt oder sich füllt
if(typeof htOrdnen === 'function'){ const _o = htOrdnen; htOrdnen = function(){ const r = _o.apply(this, arguments); try{ hzOrdnen(); }catch(e){} return r; }; }
if(typeof htRender === 'function'){ const _r = htRender; htRender = function(){ const r = _r.apply(this, arguments); try{ hzOrdnen(); }catch(e){} return r; }; }
if(typeof fr100Ich === 'function'){ const _f = fr100Ich; fr100Ich = async function(){ const r = await _f.apply(this, arguments); try{ hzBald(); }catch(e){} return r; }; }
if(typeof document !== 'undefined') setTimeout(() => { try{ hzOrdnen(); }catch(e){} }, 0);

/* Förderzentrale verwendet Sitzung und Vereinsidentität der Sportzentrale. */
let svFoerderRueckkehr = new URLSearchParams(location.search).get('outlook');
let svFoerderDirekteinstieg = location.hash === '#foerderung';
function svFoerderSitzungsdatenLeeren() {
  try {
    Object.keys(localStorage).filter(key => key.startsWith('svbsc-foerder-sitzungswahl-v1:'))
      .forEach(key => localStorage.removeItem(key));
  } catch { /* Ein gesperrter Browserspeicher enthält hier keine nutzbare Auswahl. */ }
}
{
  const abmelden = SVB.signOut;
  SVB.signOut = function() {
    svFoerderSitzungsdatenLeeren();
    return abmelden.apply(this, arguments);
  };
  SVB.sb.auth.onAuthStateChange(event => {
    if (event === 'SIGNED_OUT') svFoerderSitzungsdatenLeeren();
  });
}
function svFoerderDarf() {
  return navigator.onLine && !SVB.offline && !svGast() &&
    typeof svDarf === 'function' && svDarf('foerderung') === true;
}
window.svFoerderKontext = function() {
  if (!svFoerderDarf()) return null;
  const v = window.VEREIN || {};
  const outcome = svFoerderRueckkehr;
  svFoerderRueckkehr = null;
  return { sb: SVB.sb, outcome, openPeople:typeof isAdmin==='function' && isAdmin() ? function() {
    if(!svFoerderDarf() || !isAdmin()) throw new Error('Einladungen verwaltet der Admin.');
    svFoerderEinladung=true;
    goTab('admin');
  } : null, club: { name:v.texte?.name, short:v.texte?.kurz, place:v.texte?.ort, website:v.texte?.website, blue:v.farben?.brand } };
};
SV_PAGES.foerderung = ['Förderzentrale','Vereinsbedarf, Förderquellen und Voranfragen'];
SV_TBL.foerderung = ['wallet','Förderzentrale'];
N77_GRP.Verein.splice(N77_GRP.Verein.indexOf('sponsoring')+1,0,'foerderung');
{
  const erlaubt = svTabAllowed;
  svTabAllowed = function(tab) { return tab === 'foerderung' ? svFoerderDarf() : erlaubt.apply(this, arguments); };
  const weiter = goTab;
  goTab = function(tab) {
    const result = weiter.apply(this, arguments);
    const panel = document.querySelector('#panel-foerderung');
    if (panel && !svFoerderDarf()) panel.replaceChildren();
    if (panel?.classList.contains('active') && svFoerderDarf() && !panel.firstElementChild) {
      const frame = document.createElement('iframe');
      frame.title = 'SV/BSC Förderzentrale';
      frame.src = 'foerderzentrale/index.html?v=' + encodeURIComponent(APP_BUILD);
      frame.width = '100%';
      frame.height = '800';
      frame.style.border = '0';
      frame.setAttribute('referrerpolicy','same-origin');
      panel.append(frame);
    }
    return result;
  };
}
{
  const init = svInit;
  svInit = function() {
    const angefragt = svFoerderDirekteinstieg || location.hash === '#foerderung';
    svFoerderDirekteinstieg = false;
    const result = init.apply(this,arguments);
    if (angefragt && svCurTab() !== 'foerderung') {
      Promise.resolve(svrLoad(true)).then(() => {
        if (svFoerderDarf() && svCurTab() === 'home') goTab('foerderung');
      });
    }
    return result;
  };
}

// Hinweis bleibt beim vorhandenen Einladungsformular; keine automatische Rechtevergabe.
let svFoerderEinladung=false;
{
  const renderPeople=svAdminRender;
  svAdminRender=async function() {
    const result=await renderPeople.apply(this,arguments);
    if(svFoerderEinladung && isAdmin()) {
      const form=document.querySelector('#svInv');
      if(form && !document.querySelector('#foerder-invite-help')) {
        const note=document.createElement('p');note.id='foerder-invite-help';
        note.textContent='Für Fördermitarbeit: Jugendtrainer mit Mannschaft, Trainer oder Kaderplaner wählen und unter Funktionen die Förderzentrale ergänzen. Die Rolle kann weitere Vereinsbereiche erlauben. Gast, Spieler, Helfer sowie reine Bereichsleitungen erhalten aktuell keinen Förderzugang. Förderberechtigte sehen alle Förderakten. Nach Einladen erhältst Du den persönlichen Link zum Weitergeben; es wird keine Mail automatisch verschickt. Bestehende Personen bitte unten über Bereiche & Funktionen bearbeiten und bei Bedarf einen neuen Anmelde-Link erstellen.';
        form.before(note);
      }
    }
    return result;
  };
}

/* =====================================================================
   Beta 0.99.38 · Treffpunkt beim Spiel (165_treff_nummern.sql)
   Albert, 14.11.2026: „Spiel mit Treffpunkt“ als Termin für die Spieler.
   Das Trainerteam setzt je Spiel der Ersten oder Zweiten Treffzeit, Ort und einen kurzen Hinweis. Sehen können es das Trainerteam und
   die Spieler dieser Mannschaft: im Termin (Liste und Einzelansicht), unter „Meine Mannschaft“ und in „Als Nächstes“ auf der Startseite.
   Der Server hängt den Treffpunkt an das Spiel (i.treff) und sagt, wer ihn setzen darf (KAL.flags.treff).
   Verschickt wird nichts. Beim Teilen und in der Kalenderdatei steht der Treffpunkt bewusst nicht: Beides geht nach außen.
   ===================================================================== */
const t108E = s => (typeof svEsc === 'function' ? svEsc(s == null ? '' : String(s)) : String(s == null ? '' : s));
const t108Team = i => i && i.k === 'spiel' ? (i.m === 'h1' ? '1' : i.m === 'h2' ? '2' : null) : null;
function t108Text(t){ if(!t || !(t.z || t.ort || t.info)) return ''; return 'Treffpunkt' + (t.z ? ' ' + t.z + ' Uhr' : '') + (t.ort ? (t.z ? ', ' : ': ') + t.ort : '') + (t.info ? '. ' + t.info : ''); }
(function(){ try{ if(document.getElementById('svm110css')) return; const s = document.createElement('style'); s.id = 'svm110css';
  s.textContent = `.kal-treff{margin-top:4px;font-size:13px;font-weight:600;color:var(--ink)}
.kal-info .kal-treff-z b{font-weight:700}
.t108 label{display:block;font-size:13px;color:var(--ink2);margin:12px 0 4px}
.t108 input,.t108 textarea{width:100%;min-height:44px;font-size:16px;padding:8px 12px;box-sizing:border-box}
.t108 .t108-zeit{max-width:160px}`; document.head.appendChild(s); }catch(e){} })();

if(typeof kalItemHtml === 'function'){ const _a = kalItemHtml; kalItemHtml = function(i){ const h = _a.apply(this, arguments), t = i && i.k === 'spiel' ? t108Text(i.treff) : '';
  return t ? String(h).replace(/(<div class="kal-meta">[\s\S]*?<\/div>)/, '$1<div class="kal-treff">' + t108E(t) + '</div>') : h; }; }

if(typeof kalDetail === 'function'){ const _a = kalDetail; kalDetail = function(id){ const r = _a.apply(this, arguments);
  try{ const i = kalItem(id), team = t108Team(i), D = document.querySelector('#modal .kal-det'); if(!team || !D) return r;
    const info = D.querySelector('.kal-info'), t = t108Text(i.treff);
    if(info && t){ const z = document.createElement('div'); z.className = 'kal-treff-z'; z.innerHTML = (typeof SVI === 'function' ? SVI('users') : '') + '<span><b>' + t108E(t) + '</b></span>'; info.appendChild(z); }
    const akt = D.querySelector('.kal-akt');
    if(akt && KAL.flags.treff && i.d >= kalHeute()){ const b = document.createElement('button'); b.className = 'btn ghost'; b.id = 'kalTreff'; b.type = 'button';
      b.textContent = t ? 'Treffpunkt ändern' : 'Treffpunkt setzen'; b.onclick = () => t108Form(i); akt.appendChild(b); }
  }catch(e){}
  return r; }; }

function t108Form(i){ const t = i.treff || {}, team = t108Team(i); if(!team) return;
  const M = svModal(`<div class="t108"><h2>Treffpunkt</h2>
    <p class="note">${t108E(kalTeamName(i.m))} ${i.heim === false ? 'bei' : 'gegen'} ${t108E(i.gegner || '')}, ${t108E(kalLang(i.d))}${i.z ? ', Anstoß ' + t108E(i.z) + ' Uhr' : ''}. Das sehen das Trainerteam und die Spieler dieser Mannschaft in der App. Eine Mitteilung geht dabei nicht raus.</p>
    <label for="t108Z">Uhrzeit</label><input id="t108Z" class="t108-zeit" type="time" value="${t108E(t.z || '')}">
    <label for="t108O">Ort</label><input id="t108O" type="text" maxlength="120" value="${t108E(t.ort || '')}" placeholder="${i.heim === false ? 'Parkplatz am Sportplatz' : 'Kabine'}" autocomplete="off">
    <label for="t108H">Hinweis (wenn nötig)</label><textarea id="t108H" maxlength="300" rows="2" placeholder="Zum Beispiel: Wir fahren gemeinsam, Trikots bringt der Betreuer mit.">${t108E(t.info || '')}</textarea>
    <div class="btnrow" style="margin-top:16px"><button class="btn" id="t108Ok" type="button">Speichern</button>${t108Text(t) ? '<button class="btn ghost" id="t108Weg" type="button">Treffpunkt entfernen</button>' : ''}</div></div>`);
  const senden = async leer => { const ok = M.querySelector('#t108Ok'); ok.disabled = true;
    const { error } = await SVB.sb.rpc('spiel_treff_setzen', { p_team:team, p_datum:i.d, p_zeit:leer ? '' : M.querySelector('#t108Z').value, p_ort:leer ? '' : M.querySelector('#t108O').value, p_hinweis:leer ? '' : M.querySelector('#t108H').value });
    if(error){ ok.disabled = false; kToast('⚠️ ' + error.message); return; }
    kToast(leer ? '✓ Treffpunkt entfernt' : '✓ Treffpunkt gespeichert'); closeOverlay(); try{ if(typeof MT100 !== 'undefined') MT100.am = 0; }catch(e){} kalLoad(null, null, true); };
  M.querySelector('#t108Ok').onclick = () => senden(false); const w = M.querySelector('#t108Weg'); if(w) w.onclick = () => senden(true);
}

/* =====================================================================
   Beta 0.99.38 · Partner-Profil intern (166_partner_profil.sql)
   Albert, 14.11.2026: Internes Profil je Partner, das ein Partner niemals sieht: Jugend, Senioren oder beides, heimatverbunden, lieber
   kleine Sachen dafür oft, lieber Veranstaltungen, wie man ihn anspricht, wie oft er Ja oder Nein sagt. Jede Anfrage mit Ergebnis
   festhalten, Absagen mit Begründung. Daraus Bewertung, Rangliste und ein Vorschlag je Vorhaben.
   1. In der Akte einer Firma: Abschnitt „Intern“ mit Profil, Bewertung und allen Anfragen (ppAkte).
   2. Reiter „Wen ansprechen“ im Partnerbereich: Vorschlag je Vorhaben, Rangliste, Suche „Wer war dabei?“ (ppRender).
   Gerechnet wird hier im Browser nach festen Regeln (ppZahlen, ppVorschlag), damit jeder sieht, warum eine Firma oben steht.
   Es geht nichts an eine KI. Die Angaben kommen nur über partner_intern_laden() und stehen nirgends sonst:
   NIE in Präsentation, Partnerflow, Vertrag, Stadionheft oder einer öffentlichen Ansicht verwenden.
   ===================================================================== */
const PP = { P:new Map(), A:[], ich:null, admin:false, geladen:false, laeuft:null, v:{ text:'', bereich:'', art:'geld' }, q:'' };
const PP_ZG = { jugend:'Jugend', senioren:'Senioren', beides:'Jugend und Senioren' };
const PP_ART = { geld:'Geld', sach:'Sachspende', veranstaltung:'Veranstaltung', hilfe:'Hilfe und Leihgabe', sonst:'Sonstiges' };
const PP_BER = { jugend:'Jugend', senioren:'Senioren', verein:'Ganzer Verein' };
const PP_ERG = { offen:'Offen', ja:'Zusage', teilweise:'Teilweise', nein:'Absage' };
const ppE = s => (typeof svEsc === 'function' ? svEsc(s == null ? '' : String(s)) : String(s == null ? '' : s));
const ppHeute = () => (typeof svtHeute === 'function' ? svtHeute() : new Date().toISOString().slice(0, 10));
const ppTage = d => Math.round((new Date(ppHeute() + 'T12:00:00') - new Date(String(d).slice(0, 10) + 'T12:00:00')) / 864e5);

async function ppLaden(neu){ if(PP.laeuft) return PP.laeuft; if(PP.geladen && !neu) return PP;
  PP.laeuft = (async () => { try{ const { data, error } = await SVB.sb.rpc('partner_intern_laden'); if(error) throw error;
      PP.P = new Map((data.profile || []).map(p => [p.sponsor, p])); PP.A = data.anfragen || []; PP.ich = data.ich || null; PP.admin = !!data.admin; PP.geladen = true; PP.err = null; }
    catch(e){ PP.err = e.message || 'Fehler'; } PP.laeuft = null; return PP; })();
  return PP.laeuft; }

/* ---------- Rechnen ---------- */
// Zusagen, Absagen und Quote einer Firma. Teilweise zählt halb, offene Anfragen zählen nicht in die Quote.
function ppZahlen(sid, A){ const L = (A || PP.A).filter(a => a.sponsor === sid), z = { ja:0, teil:0, nein:0, offen:0, n:L.length, liste:L };
  L.forEach(a => { if(a.ergebnis === 'ja') z.ja++; else if(a.ergebnis === 'teilweise') z.teil++; else if(a.ergebnis === 'nein') z.nein++; else z.offen++; });
  z.ent = z.ja + z.teil + z.nein; z.quote = z.ent ? (z.ja + z.teil * .5) / z.ent : null; z.letzte = L.length ? L.map(a => a.am).sort().pop() : null; return z; }
function ppWertung(z){ if(!z.ent) return { k:'neu', t:z.offen ? 'Noch nichts entschieden' : 'Noch keine Anfrage' };
  const t = `${z.ja + z.teil} von ${z.ent} zugesagt${z.teil ? ' (' + z.teil + ' davon teilweise)' : ''}`;
  return z.quote >= .7 ? { k:'gut', t:t + ', sagt meist zu' } : z.quote <= .3 ? { k:'schwach', t:t + ', sagt meist ab' } : { k:'mittel', t:t + ', mal so, mal so' }; }
// Wörter eines Vorhabens für den Vergleich: klein, ohne Jahreszahlen und Füllwörter, mindestens vier Buchstaben
function ppWorte(s){ return [...new Set(String(s || '').toLowerCase().replace(/[^a-zäöüß ]+/g, ' ').split(/\s+/).filter(w => w.length >= 4 && !['beim', 'eine', 'einen', 'einer', 'unser', 'unsere', 'unseren', 'oder', 'aber', 'jugend', 'senioren', 'verein', 'spende', 'anfrage'].includes(w)))]; }
// Vorschlag für ein Vorhaben. Jede Firma startet bei 50 Punkten, jede Regel nennt ihren Grund.
function ppVorschlag(v, S, P, A){ S = S || (typeof SPO !== 'undefined' ? SPO.S : []); P = P || PP.P; A = A || PP.A; v = v || {};
  const W = ppWorte(v.text);
  return S.map(x => { const pr = P.get(x.id) || {}, z = ppZahlen(x.id, A), plus = [], minus = []; let p = 50;
    if(v.bereich === 'jugend' || v.bereich === 'senioren'){
      if(pr.zielgruppe === v.bereich){ p += 15; plus.push('Unterstützt vor allem die ' + PP_ZG[v.bereich]); }
      else if(pr.zielgruppe === 'beides'){ p += 8; plus.push('Unterstützt Jugend und Senioren'); }
      else if(pr.zielgruppe){ p -= 20; minus.push('Unterstützt sonst eher die ' + PP_ZG[pr.zielgruppe]); } }
    if(v.art === 'veranstaltung' && pr.events){ p += 15; plus.push('Ist gern bei Veranstaltungen dabei'); }
    if((v.art === 'sach' || v.art === 'hilfe') && pr.klein_oft){ p += 12; plus.push('Macht lieber kleine Sachen, dafür oft'); }
    if(pr.heimat){ p += 6; plus.push('Heimatverbunden'); }
    if(z.ent){ p += (z.quote - .5) * 40 * Math.min(z.ent, 3) / 3; (z.quote >= .5 ? plus : minus).push(`Hat ${z.ja + z.teil} von ${z.ent} Anfragen zugesagt`); }
    let gleichJa = 0, gleichNein = 0;
    z.liste.forEach(a => { const passt = W.length && ppWorte(a.vorhaben).some(w => W.includes(w)), name = '„' + a.vorhaben + '“';
      if(a.ergebnis === 'offen'){ p -= 25; minus.push('Eine Anfrage ist noch offen: ' + name); return; }
      if(passt){ if(a.ergebnis === 'nein'){ p -= 15; minus.push('Hat ' + name + ' abgelehnt' + (a.grund ? ': ' + a.grund : '')); } else { p += 20; plus.push('War bei ' + name + ' dabei'); } return; }
      if(v.art && a.art === v.art){
        if(a.ergebnis === 'nein' && gleichNein < 2){ gleichNein++; p -= 12; minus.push('Hat ' + name + ' abgelehnt' + (a.grund ? ': ' + a.grund : '')); }
        else if(a.ergebnis !== 'nein' && gleichJa < 2){ gleichJa++; p += 8; plus.push('Hat bei ' + name + ' zugesagt'); } } });
    if(z.letzte && ppTage(z.letzte) >= 0 && ppTage(z.letzte) <= 45){ p -= 12; const t = ppTage(z.letzte); minus.push(t === 0 ? 'Heute schon gefragt' : t === 1 ? 'Gestern zuletzt gefragt' : 'Vor ' + t + ' Tagen zuletzt gefragt'); }
    if(x.status === 'abgesagt'){ p -= 40; minus.push('Steht in der Liste auf Abgesagt'); } else if(x.status === 'pausiert'){ p -= 30; minus.push('Pausiert gerade'); }
    return { id:x.id, firma:x.firma, punkte:Math.max(0, Math.min(100, Math.round(p))), plus, minus, z }; })
    .sort((a, b) => b.punkte - a.punkte || String(a.firma).localeCompare(String(b.firma), 'de')); }

/* ---------- Stil ---------- */
(function(){ try{ if(document.getElementById('svm109css')) return; const s = document.createElement('style'); s.id = 'svm109css';
  s.textContent = `.pp-box{margin-top:18px;padding:14px;border-radius:14px;border:1px dashed var(--line2,rgba(120,130,160,.5));background:var(--surface2,rgba(148,163,196,.08))}
.pp-box h3{margin:0 0 2px;font-size:16px}.pp-nur{margin:0 0 10px;font-size:12.5px;color:var(--ink2)}
.pp-chips{display:flex;flex-wrap:wrap;gap:6px;margin:8px 0}.pp-chip{padding:4px 10px;border-radius:999px;font-size:13px;font-weight:600;background:var(--surface,rgba(148,163,196,.18));border:1px solid var(--line,rgba(120,130,160,.3))}
.pp-wert{font-weight:700}.pp-wert.gut{color:var(--green,#1a8f55)}.pp-wert.schwach{color:var(--red,#d14343)}
.pp-l{display:grid;gap:8px;margin:10px 0}.pp-a{display:grid;grid-template-columns:1fr auto;gap:2px 10px;align-items:start;padding:10px 12px;border-radius:12px;background:var(--surface,rgba(148,163,196,.12));text-align:left;width:100%;border:0;color:inherit;font:inherit;cursor:pointer;min-height:44px}
.pp-a b{overflow-wrap:anywhere}.pp-a small{grid-column:1/-1;color:var(--ink2);font-size:13px;overflow-wrap:anywhere}
.pp-e{font-size:12.5px;font-weight:700;padding:2px 8px;border-radius:999px;white-space:nowrap;background:rgba(148,163,196,.25)}.pp-e.ja{background:rgba(26,143,85,.18);color:var(--green,#1a8f55)}.pp-e.nein{background:rgba(209,67,67,.16);color:var(--red,#d14343)}.pp-e.teilweise{background:rgba(224,161,0,.2)}
.pp-f label{display:block;font-size:13px;color:var(--ink2);margin:12px 0 4px}.pp-f input[type=text],.pp-f input[type=date],.pp-f select,.pp-f textarea{width:100%;min-height:44px;font-size:16px;padding:8px 12px;box-sizing:border-box}
.pp-f .pp-ck{display:flex;gap:10px;align-items:center;min-height:44px;margin:0;color:var(--ink);font-size:15px}.pp-f .pp-ck input{width:22px;height:22px;flex:none}
.pp-seg{display:flex;flex-wrap:wrap;gap:6px}.pp-seg button{min-height:44px;padding:0 14px;border-radius:12px;border:1px solid var(--line,rgba(120,130,160,.4));background:transparent;color:inherit;font:inherit;cursor:pointer}
.pp-seg button.on{background:var(--brand);color:#fff;border-color:var(--brand)}
.pp-raster{display:grid;grid-template-columns:1fr 1fr;gap:0 12px}@media (max-width:520px){.pp-raster{grid-template-columns:1fr}}
.pp-v{display:grid;gap:10px}.pp-vz{padding:12px 14px;border-radius:14px;background:var(--surface2,rgba(148,163,196,.1))}
.pp-vz button.pp-fn{background:none;border:0;padding:0;color:inherit;font:inherit;font-weight:700;font-size:16px;text-align:left;cursor:pointer;text-decoration:underline;text-underline-offset:3px;min-height:32px}
.pp-vz ul{margin:6px 0 0;padding-left:18px;font-size:14px}.pp-vz li.m{color:var(--ink2)}.pp-pk{float:right;font-variant-numeric:tabular-nums;font-weight:800;color:var(--ink2)}
.pp-tab{width:100%;border-collapse:collapse;font-size:14px}.pp-tab th{text-align:left;color:var(--ink2);font-weight:600;padding:6px 8px}.pp-tab td{padding:8px;border-top:1px solid var(--line,rgba(120,130,160,.25))}.pp-tab td.z{text-align:right;font-variant-numeric:tabular-nums}`;
  document.head.appendChild(s); }catch(e){} })();

/* ---------- 1. Akte: Abschnitt „Intern“ ---------- */
function ppAkteHtml(x){ const pr = PP.P.get(x.id), z = ppZahlen(x.id), w = ppWertung(z);
  const chips = pr ? [pr.zielgruppe && PP_ZG[pr.zielgruppe], pr.heimat && 'heimatverbunden', pr.klein_oft && 'lieber kleine Sachen, dafür oft', pr.events && 'lieber Veranstaltungen'].filter(Boolean) : [];
  return `<h3>Intern: Profil und Anfragen</h3><p class="pp-nur">Nur für Leitung und Partner-Team. Die Firma sieht das nie, auch nicht in Präsentation oder Vertrag.</p>
    ${chips.length ? `<div class="pp-chips">${chips.map(c => `<span class="pp-chip">${ppE(c)}</span>`).join('')}</div>` : '<p class="note" style="margin:6px 0">Noch kein Profil. Halte fest, wofür sich die Firma begeistert.</p>'}
    ${pr && pr.ansprache ? `<p style="margin:6px 0"><b>Ansprache:</b> ${ppE(pr.ansprache)}</p>` : ''}${pr && pr.notiz ? `<p style="margin:6px 0;white-space:pre-wrap">${ppE(pr.notiz)}</p>` : ''}
    <p style="margin:10px 0 0">Bewertung: <span class="pp-wert ${w.k}">${ppE(w.t)}</span>${z.offen ? ` · ${z.offen} offen` : ''}</p>
    ${z.n ? `<div class="pp-l">${z.liste.map(a => `<button type="button" class="pp-a" data-ppa="${ppE(a.id)}"><b>${ppE(a.vorhaben)}</b><span class="pp-e ${ppE(a.ergebnis)}">${ppE(PP_ERG[a.ergebnis] || a.ergebnis)}</span>
        <small>${ppE(typeof spoDat === 'function' ? spoDat(a.am) : a.am)} · ${ppE(PP_ART[a.art] || a.art)}${a.bereich ? ' · ' + ppE(PP_BER[a.bereich]) : ''}${a.grund ? ' · ' + ppE(a.grund) : ''}</small></button>`).join('')}</div>` : ''}
    <div class="btnrow"><button class="btn sm" type="button" id="ppNeu">Anfrage festhalten</button><button class="btn sm ghost" type="button" id="ppProf">${pr ? 'Profil ändern' : 'Profil anlegen'}</button></div>`; }
async function ppAkte(id){ const A = document.querySelector('#modal .spo-akte'); if(!A || typeof SPO === 'undefined') return; const x = SPO.S.find(s => s.id === id); if(!x) return;
  let B = A.querySelector('.pp-box'); if(!B){ B = document.createElement('section'); B.className = 'pp-box'; B.dataset.pps = id; B.innerHTML = '<p class="note">Internes Profil lädt …</p>'; A.appendChild(B); }
  await ppLaden(); if(!B.isConnected) return;
  if(PP.err){ B.innerHTML = '<p class="note">Das interne Profil lässt sich gerade nicht laden.</p>'; return; }
  B.innerHTML = ppAkteHtml(x);
  B.querySelector('#ppNeu').onclick = () => ppAnfrageForm(x, null, () => spoSponsor(id)); B.querySelector('#ppProf').onclick = () => ppProfilForm(x, () => spoSponsor(id));
  B.querySelectorAll('[data-ppa]').forEach(b => b.onclick = () => ppAnfrageForm(x, PP.A.find(a => a.id === b.dataset.ppa), () => spoSponsor(id))); }
if(typeof spoSponsor === 'function'){ const _a = spoSponsor; spoSponsor = function(id){ const r = _a.apply(this, arguments); try{ ppAkte(id); }catch(e){} return r; }; }

// Nach dem Speichern: Reiter „Wen ansprechen“ neu rechnen, dann zurück in die Akte (oder den Dialog schließen)
function ppNach(danach){ try{ if(typeof SPO !== 'undefined' && SPO.view === 'ansprechen' && typeof spoBody === 'function') spoBody(); }catch(e){} if(danach) danach(); else closeOverlay(); }
const PP_SACHLICH = 'Bitte sachlich bleiben: was die Firma unterstützt, was sie abgelehnt hat und mit welchem Grund. Wer Auskunft über seine Daten verlangt, bekommt auch diese Einträge.';
function ppProfilForm(x, danach){ const pr = PP.P.get(x.id) || {};
  const M = svModal(`<div class="pp-f"><h2>Internes Profil</h2><p class="note">${ppE(x.firma)}. ${PP_SACHLICH}</p>
    <label>Wofür setzt sich die Firma ein?</label><div class="pp-seg" id="ppZg" role="group" aria-label="Zielgruppe">${[['', 'Offen'], ['jugend', 'Jugend'], ['senioren', 'Senioren'], ['beides', 'Beides']].map(([k, l]) => `<button type="button" data-k="${k}" class="${(pr.zielgruppe || '') === k ? 'on' : ''}" aria-pressed="${(pr.zielgruppe || '') === k}">${l}</button>`).join('')}</div>
    <label class="pp-ck" style="margin-top:14px"><input type="checkbox" id="ppHe"${pr.heimat ? ' checked' : ''}> Heimatverbunden</label>
    <label class="pp-ck"><input type="checkbox" id="ppKl"${pr.klein_oft ? ' checked' : ''}> Lieber kleine Sachen, dafür oft</label>
    <label class="pp-ck"><input type="checkbox" id="ppEv"${pr.events ? ' checked' : ''}> Lieber Veranstaltungen als Werbung</label>
    <label for="ppAn">Wie spricht man die Firma am besten an?</label><input type="text" id="ppAn" maxlength="300" value="${ppE(pr.ansprache || '')}" placeholder="Zum Beispiel: persönlich im Laden, nicht per Mail" autocomplete="off">
    <label for="ppNo">Notiz</label><textarea id="ppNo" rows="3" maxlength="1000">${ppE(pr.notiz || '')}</textarea>
    <div class="btnrow" style="margin-top:16px"><button class="btn" type="button" id="ppOk">Speichern</button></div></div>`);
  M.querySelectorAll('#ppZg button').forEach(b => b.onclick = () => M.querySelectorAll('#ppZg button').forEach(y => { y.classList.toggle('on', y === b); y.setAttribute('aria-pressed', y === b); }));
  const ok = M.querySelector('#ppOk'); ok.onclick = async () => { ok.disabled = true;
    const { error } = await SVB.sb.rpc('partner_profil_setzen', { p_sponsor:x.id, p:{ zielgruppe:(M.querySelector('#ppZg .on') || { dataset:{ k:'' } }).dataset.k, heimat:M.querySelector('#ppHe').checked, klein_oft:M.querySelector('#ppKl').checked,
      events:M.querySelector('#ppEv').checked, ansprache:M.querySelector('#ppAn').value, notiz:M.querySelector('#ppNo').value } });
    if(error){ ok.disabled = false; kToast('⚠️ ' + error.message); return; }
    kToast('✓ Profil gespeichert'); await ppLaden(true); ppNach(danach); }; }
function ppAnfrageForm(x, a, danach){ a = a || null; const e0 = a ? a.ergebnis : 'offen';
  const wahl = (id, O, w) => `<select id="${id}">${O.map(([k, l]) => `<option value="${k}"${k === w ? ' selected' : ''}>${l}</option>`).join('')}</select>`;
  const M = svModal(`<div class="pp-f"><h2>${a ? 'Anfrage ändern' : 'Anfrage festhalten'}</h2><p class="note">${ppE(x.firma)}. ${PP_SACHLICH}</p>
    <label for="ppVo">Worum ging es?</label><input type="text" id="ppVo" maxlength="160" value="${ppE(a ? a.vorhaben : '')}" placeholder="Zum Beispiel: Tombola Sommerfest" autocomplete="off">
    <div class="pp-raster"><div><label for="ppAr">Art</label>${wahl('ppAr', Object.entries(PP_ART), a ? a.art : 'geld')}</div>
      <div><label for="ppBe">Für wen</label>${wahl('ppBe', [['', 'Offen']].concat(Object.entries(PP_BER)), a ? (a.bereich || '') : '')}</div></div>
    <label for="ppAm">Gefragt am</label><input type="date" id="ppAm" value="${ppE(a ? a.am : ppHeute())}" max="${ppHeute()}">
    <label>Ergebnis</label><div class="pp-seg" id="ppEr" role="group" aria-label="Ergebnis">${Object.entries(PP_ERG).map(([k, l]) => `<button type="button" data-k="${k}" class="${e0 === k ? 'on' : ''}" aria-pressed="${e0 === k}">${l}</button>`).join('')}</div>
    <label for="ppGr" id="ppGrL">Grund oder Anmerkung</label><textarea id="ppGr" rows="2" maxlength="400" placeholder="Bei einer Absage bitte den Grund, so wie er genannt wurde.">${ppE(a && a.grund ? a.grund : '')}</textarea>
    <div class="btnrow" style="margin-top:16px"><button class="btn" type="button" id="ppOk">Speichern</button>${a && (PP.admin || a.von === PP.ich) ? '<button class="btn ghost" type="button" id="ppWeg">Löschen</button>' : ''}</div></div>`);
  const grL = () => { M.querySelector('#ppGrL').textContent = (M.querySelector('#ppEr .on') || {}).dataset.k === 'nein' ? 'Grund der Absage' : 'Grund oder Anmerkung'; };
  M.querySelectorAll('#ppEr button').forEach(b => b.onclick = () => { M.querySelectorAll('#ppEr button').forEach(y => { y.classList.toggle('on', y === b); y.setAttribute('aria-pressed', y === b); }); grL(); }); grL();
  const fertig = async t => { kToast(t); await ppLaden(true); ppNach(danach); };
  const ok = M.querySelector('#ppOk'); ok.onclick = async () => { ok.disabled = true;
    const { error } = await SVB.sb.rpc('partner_bitte_setzen', { p:{ id:a ? a.id : null, sponsor:x.id, vorhaben:M.querySelector('#ppVo').value, art:M.querySelector('#ppAr').value, bereich:M.querySelector('#ppBe').value,
      am:M.querySelector('#ppAm').value, ergebnis:(M.querySelector('#ppEr .on') || { dataset:{ k:'offen' } }).dataset.k, grund:M.querySelector('#ppGr').value } });
    if(error){ ok.disabled = false; kToast('⚠️ ' + error.message); return; } await fertig('✓ Anfrage gespeichert'); };
  const weg = M.querySelector('#ppWeg'); if(weg) weg.onclick = async () => { if(weg.dataset.sicher !== '1'){ weg.dataset.sicher = '1'; weg.textContent = 'Wirklich löschen?'; return; } weg.disabled = true;
    const { error } = await SVB.sb.rpc('partner_bitte_weg', { p_id:a.id }); if(error){ weg.disabled = false; kToast('⚠️ ' + error.message); return; } await fertig('✓ Anfrage gelöscht'); }; }

/* ---------- 2. Reiter „Wen ansprechen“ ---------- */
function ppVzHtml(r, gegen){
  return `<div class="pp-vz"><span class="pp-pk" title="Punkte von 100">${r.punkte}</span><button type="button" class="pp-fn" data-pps="${ppE(r.id)}">${ppE(r.firma)}</button>
    <ul>${(gegen ? r.minus : r.plus).map(t => `<li>${ppE(t)}</li>`).join('')}${(gegen ? r.plus : r.minus).map(t => `<li class="m">${gegen ? 'Dafür spricht: ' : 'Bedenke: '}${ppE(t)}</li>`).join('')}</ul></div>`; }
function ppErgebnisHtml(){ const v = PP.v; if(!v.text.trim() && !v.bereich) return '<p class="note">Sag kurz, worum es geht. Dann siehst du, wen ihr zuerst ansprechen könnt und bei wem es eher nichts wird.</p>';
  const R = ppVorschlag(v), ja = R.filter(r => r.punkte >= 58 && r.plus.length).slice(0, 8), nein = R.filter(r => r.punkte <= 40 && r.minus.length).reverse().slice(0, 6);
  if(!PP.A.length && !PP.P.size) return '<p class="note">Noch ist nichts festgehalten. Trag in den Akten der Firmen ein, wofür sie sich begeistern und was ihr schon gefragt habt. Dann gibt es hier einen Vorschlag.</p>';
  return `<h4 style="margin:14px 0 8px">Zuerst ansprechen</h4>${ja.length ? `<div class="pp-v">${ja.map(r => ppVzHtml(r, false)).join('')}</div>` : '<p class="note">Zu diesem Vorhaben sticht noch keine Firma heraus. Je mehr ihr festhaltet, desto besser wird der Vorschlag.</p>'}
    <h4 style="margin:18px 0 8px">Eher nicht</h4>${nein.length ? `<div class="pp-v">${nein.map(r => ppVzHtml(r, true)).join('')}</div>` : '<p class="note">Gegen keine Firma spricht gerade etwas.</p>'}`; }
function ppRangHtml(){ const R = (SPO.S || []).map(x => ({ x, z:ppZahlen(x.id) })).filter(r => r.z.n).sort((a, b) => (b.z.quote == null ? -1 : b.z.quote) - (a.z.quote == null ? -1 : a.z.quote) || b.z.ent - a.z.ent || String(a.x.firma).localeCompare(String(b.x.firma), 'de'));
  if(!R.length) return '<p class="note">Noch keine Anfrage festgehalten.</p>';
  return `<div style="overflow-x:auto"><table class="pp-tab"><thead><tr><th>Firma</th><th>Zusagen</th><th>Absagen</th><th>Offen</th><th>Zuletzt gefragt</th></tr></thead><tbody>${R.map(r => `<tr><td><button type="button" class="pp-fn" style="font-size:14px;background:none;border:0;padding:0;color:inherit;font-weight:700;cursor:pointer;text-align:left" data-pps="${ppE(r.x.id)}">${ppE(r.x.firma)}</button></td>
      <td class="z">${r.z.ja + r.z.teil}</td><td class="z">${r.z.nein}</td><td class="z">${r.z.offen}</td><td>${r.z.letzte ? ppE(typeof spoDat === 'function' ? spoDat(r.z.letzte) : r.z.letzte) : ''}</td></tr>`).join('')}</tbody></table></div>`; }
function ppSucheHtml(){ const q = PP.q.trim().toLowerCase(); if(q.length < 2) return '<p class="note">Zum Beispiel „Kerwe“ oder „Tombola“.</p>';
  const L = PP.A.filter(a => String(a.vorhaben).toLowerCase().includes(q)).slice(0, 40); if(!L.length) return '<p class="note">Dazu ist nichts festgehalten.</p>';
  const f = id => ((SPO.S || []).find(s => s.id === id) || {}).firma || 'Firma';
  return `<div class="pp-l">${L.map(a => `<button type="button" class="pp-a" data-pps="${ppE(a.sponsor)}"><b>${ppE(f(a.sponsor))}</b><span class="pp-e ${ppE(a.ergebnis)}">${ppE(PP_ERG[a.ergebnis] || a.ergebnis)}</span><small>${ppE(a.vorhaben)} · ${ppE(typeof spoDat === 'function' ? spoDat(a.am) : a.am)}${a.grund ? ' · ' + ppE(a.grund) : ''}</small></button>`).join('')}</div>`; }
function ppDraht(B){ B.querySelectorAll('[data-pps]').forEach(b => b.onclick = () => spoSponsor(b.dataset.pps)); }
async function ppRender(B){ B.innerHTML = '<div class="card"><div class="empty">Lade …</div></div>'; await ppLaden(); if(typeof SPO === 'undefined' || SPO.view !== 'ansprechen') return;
  if(PP.err){ B.innerHTML = `<div class="card"><div class="empty">Konnte nicht laden: ${ppE(PP.err)}</div></div>`; return; }
  const wahl = (id, O, w) => `<select id="${id}">${O.map(([k, l]) => `<option value="${k}"${k === w ? ' selected' : ''}>${l}</option>`).join('')}</select>`;
  B.innerHTML = `<div class="card pp-f"><h3>Wen ansprechen?</h3><p class="pp-nur">Nur für Leitung und Partner-Team. Der Vorschlag rechnet mit dem, was ihr in den Akten festgehalten habt, nach festen Regeln. Er ersetzt kein Gespräch.</p>
      <label for="ppvT">Worum geht es?</label><input type="text" id="ppvT" maxlength="160" value="${ppE(PP.v.text)}" placeholder="Zum Beispiel: Hallenturnier der Alten Herren" autocomplete="off">
      <div class="pp-raster"><div><label for="ppvB">Für wen</label>${wahl('ppvB', [['', 'Offen']].concat(Object.entries(PP_BER)), PP.v.bereich)}</div><div><label for="ppvA">Was braucht ihr</label>${wahl('ppvA', Object.entries(PP_ART), PP.v.art)}</div></div>
      <div id="ppvR">${ppErgebnisHtml()}</div></div>
    <div class="card"><h3>Wer war dabei?</h3><p class="pp-nur">Sucht in allen festgehaltenen Anfragen.</p><input type="text" id="ppQ" value="${ppE(PP.q)}" placeholder="Stichwort" autocomplete="off" style="width:100%;min-height:44px;font-size:16px;padding:8px 12px;box-sizing:border-box" aria-label="Stichwort in den Anfragen"><div id="ppQR">${ppSucheHtml()}</div></div>
    <div class="card"><h3>Rangliste</h3><p class="pp-nur">Alle Firmen mit mindestens einer Anfrage, die verlässlichsten zuerst. Teilweise zählt als halbe Zusage.</p><div id="ppRang">${ppRangHtml()}</div></div>`;
  const neu = () => { PP.v = { text:B.querySelector('#ppvT').value, bereich:B.querySelector('#ppvB').value, art:B.querySelector('#ppvA').value }; const R = B.querySelector('#ppvR'); R.innerHTML = ppErgebnisHtml(); ppDraht(R); };
  B.querySelector('#ppvT').oninput = neu; B.querySelector('#ppvB').onchange = neu; B.querySelector('#ppvA').onchange = neu;
  B.querySelector('#ppQ').oninput = e => { PP.q = e.target.value; const R = B.querySelector('#ppQR'); R.innerHTML = ppSucheHtml(); ppDraht(R); };
  ppDraht(B); }
if(typeof SPO_REITER !== 'undefined' && !SPO_REITER.some(r => r[0] === 'ansprechen')){ const i = SPO_REITER.findIndex(r => r[0] === 'sponsoren'); SPO_REITER.splice(i < 0 ? SPO_REITER.length : i + 1, 0, ['ansprechen', 'Wen ansprechen']); }
if(typeof spoBody === 'function'){ const _b = spoBody; spoBody = function(){ if(SPO.view === 'ansprechen'){ const B = document.getElementById('spoB'); if(B) ppRender(B); return; } return _b.apply(this, arguments); }; }

/* svm111.js · Schneller Start (Beta 0.99.42)
   Rückmeldung aus dem Verein, 15.11.2026: „Die App lädt sehr, sehr langsam.“
   Gemessen: Beim Start wurde alles dreimal bis fünfmal komplett neu gezeichnet (renderAll: beim Laden, nach den
   Daten vom Server, nach den 4.0-Daten, nach den FuPa-Werten, nach den Fotos), und jedes Mal mit allen Listen:
   Scouting-Liste, Geheimtipps, Datenbank, Vergleich, Aufstellung mit Kaderbedarf. Die stehen in Bereichen, die beim
   Start gar nicht offen sind. Auf einem vier Jahre alten Handy kostete das zusammen rund 20 Sekunden.

   Jetzt gilt: Eine Liste wird nur gezeichnet, wenn ihr Bereich offen ist. Sonst merkt sich die App nur, dass sie
   neu gezeichnet werden muss, und holt das nach, sobald der Bereich geöffnet wird (im selben Schritt, also ohne
   leere Seite). Die Daten selbst sind sofort da, es geht nur ums Zeichnen.

   Wer eine weitere teure Liste hat, die in einem eigenen Bereich (.panel) steht: in LZ_TEILE eintragen
   (Funktion: Kennung eines Elements, in das sie zeichnet). Die Reihenfolge ist die von renderAll. */
const LZ = { an: true, offen: {}, zahl: { gezeichnet: 0, gemerkt: 0, nachgeholt: 0, home: 0 } };
const LZ_TEILE = { renderList: 'list', renderGems: 'gemlist', renderDB: 'dbhead', fillCompareSelects: 'cmp1', updateCompare: 'cmpBar', renderLineup: 'pitch' };
function lzPanel(n){ const e = document.getElementById(LZ_TEILE[n]); return e ? e.closest('.panel') : null; }
/* offen heißt: kein Bereich drumherum (dann wie früher immer zeichnen) oder der Bereich ist der aktive */
function lzSichtbar(n){ const e = document.getElementById(LZ_TEILE[n]); if (!e) return true; const p = e.closest('.panel'); return !p || p.classList.contains('active'); }
/* Was eine Funktion außer dem Zeichnen tut, läuft weiter sofort. renderLineup stößt am Ende das Speichern und das
   erste Laden der Daten vom Server an (lineupSync, lineupRemoteLoad): Ohne das käme nach dem Start nichts vom Server. */
const LZ_IMMER = { renderLineup(){ lineupSync(); lineupRemoteLoad(); } };
Object.keys(LZ_TEILE).forEach(n => { const alt = window[n]; if (typeof alt !== 'function') return;
  window[n] = function(){
    if (LZ.an && !lzSichtbar(n)) { LZ.offen[n] = true; LZ.zahl.gemerkt++; if (LZ_IMMER[n]) { try { LZ_IMMER[n](); } catch (e) { console.warn('Schneller Start', n, e); } } return; }
    delete LZ.offen[n]; LZ.zahl.gezeichnet++; return alt.apply(this, arguments); };
  window[n]._lzAlt = alt; });
/* Die alten Scouting-Abschnitte der Startseite (Kennzahlen, Top-Spieler, Wechsel-Index, Geheimtipps, Scouting-Zentrale,
   Presse) rechnen für jeden Spieler im Bestand Stärke, Wechsel-Index und Geheimtipp aus. Für die meisten sind sie zu:
   bei der Leitung ausgeblendet (svm107), sonst hinter „Mehr anzeigen“ eingeklappt (svm58). Sind alle sechs nicht zu
   sehen, überspringt die Basis von renderHome das Rechnen (Einhängung in build_v3.py: lzHomeZu). Alles andere auf
   der Startseite läuft wie immer. Werden sie aufgeklappt oder eingeblendet, zeichnet die Startseite einmal neu. */
const LZ_HOME = ['homeTiles', 'homeFocus', 'homeGems', 'homeWechsel', 'homeCrm', 'homePress'];
/* Solange die Anmeldeseite davor liegt, sieht niemand die Startseite: Das erste Zeichnen beim Laden entfällt dann auch. */
function lzVorAnmeldung(){ const g = document.getElementById('gate'); return !!g && !g.classList.contains('done'); }
function lzHomeSichtbar(){ return !lzVorAnmeldung() && LZ_HOME.some(i => { const e = document.getElementById(i); return e && e.offsetParent !== null; }); }
function lzHomeZu(){
  try { if (!LZ.an || lzHomeSichtbar()) { delete LZ.offen.home; LZ.zahl.home++; return false; }
    LZ.offen.home = true; LZ.zahl.gemerkt++; return true; } catch (e) { return false; }   // vor dem Laden dieses Moduls: wie früher zeichnen
}
/* Nachholen: alles Vorgemerkte, dessen Bereich jetzt offen ist. Gezeichnet wird erst nach dem Umschalten, also im
   sichtbaren Bereich (Maße stimmen dann, anders als beim Zeichnen im Verborgenen) und bevor der Browser neu zeichnet.
   Bewusst nicht nach dem Namen des Reiters: 'scout', 'elf' und 'cmp' führen heute in die neueren Übersichten
   (Entdecken, Top-Elf), die alten Bereiche dazu öffnen sich nur noch über andere Wege. */
function lzNachholen(){
  let vergleich = false;
  Object.keys(LZ_TEILE).forEach(n => { if (!LZ.offen[n] || !lzSichtbar(n)) return;
    delete LZ.offen[n]; LZ.zahl.nachgeholt++; if (n === 'fillCompareSelects') vergleich = true;
    try { window[n]._lzAlt.call(window); } catch (e) { console.warn('Nachholen', n, e); } });
  /* Der Vergleich liest die Auswahl: wurde sie eben erst gefüllt, zeichnet er danach noch einmal */
  if (vergleich) { delete LZ.offen.updateCompare; try { window.updateCompare._lzAlt.call(window); } catch (e) {} }
  /* Startseite: die ganze Kette neu, damit auch die Module, die an den Abschnitten nacharbeiten, mitlaufen */
  if (LZ.offen.home && !LZ.lauf && lzHomeSichtbar()) { LZ.lauf = true; LZ.zahl.nachgeholt++; try { renderHome(); } catch (e) { console.warn('Nachholen Startseite', e); } finally { LZ.lauf = false; } }
}
{ const _gt111 = goTab; goTab = function(){ const r = _gt111.apply(this, arguments); try { lzNachholen(); } catch (e) {} return r; }; }
/* Sicherheitsnetz: Wird ein Bereich auf anderem Weg geöffnet, holt der Beobachter nach, bevor der Browser zeichnet. */
try { const lzB = new MutationObserver(() => { if (Object.keys(LZ.offen).length) lzNachholen(); });
  document.querySelectorAll('.panel').forEach(p => lzB.observe(p, { attributes: true, attributeFilter: ['class'] }));
  LZ_HOME.forEach(i => { const e = document.getElementById(i); if (e) lzB.observe(e, { attributes: true, attributeFilter: ['data-hz-weg', 'style', 'class'] }); });
  const lzG = document.getElementById('gate'); if (lzG) lzB.observe(lzG, { attributes: true, attributeFilter: ['class'] }); } catch (e) {}

/* =====================================================================
   Beta 0.99.44 · Sitzungen: Agenda, Notizen, Aufgaben, Protokoll (168_sitzung.sql, Edge Function sitzung-ki)
   Albert, 15.11.2026: „Wenn ich auf Termin gehe, will ich die Agenda öffnen können, und da sind dann alle To-dos von allen.
   Reichen mehrere dasselbe ein, bekommt es mehr Prio. Man sieht, von wem welches Thema kommt. Jeder macht seine Notizen,
   und es wird auch ein Protokoll daraus gemacht. Es soll aussehen wie ein Notizbuch.“

   Aufbau: Die Sitzung hängt am Termin. Im Termin steht „Agenda öffnen“, auf der Startseite die nächste eigene Sitzung.
   Das Blatt (#szVoll) hat drei Reiter: Agenda, Meine Notizen, Protokoll.
   - Themen einreichen: tippen, diktieren (Mikrofon, wo der Browser es kann) oder Liste und Datei. Die KI (sitzung-ki) zerlegt
     in Themen, ordnet Bereiche zu und erkennt, was schon auf der Agenda steht. Ohne KI zerlegt die App selbst Zeile für Zeile.
     Gespeichert wird immer erst nach der Vorschau.
   - Je Thema: gemeinsames Ergebnis (steht im Protokoll), eigene Notiz (sieht nur die Person selbst), Aufgaben (normale To-dos).
   - Eigene Notizen und Ergebnisse speichern sich beim Verlassen des Felds und alle paar Sekunden beim Schreiben.
   Wer eine Sitzung öffnen kann, entscheidet der Server (event_sieht). Die Seite zeigt nur, was sitzung_laden liefert.
   ===================================================================== */
const SZ = { id:null, d:null, tab:'agenda', auf:{}, t:{}, heim:null, heimAm:0, rundeAuf:false, takt:null, roh:'', unterwegs:0, zuletzt:0, laedt:false };
const SZ_START = (() => { try{ return location.hash; }catch(e){ return ''; } })();   // die Adresse vom Aufruf, bevor die App sie umschreibt
const SZ_B = { leitung:'Leitung', projekte:'Projekte', entwicklung:'Entwicklung', finanzen:'Finanzen', partner:'Partner', spieltag:'Spieltag', veranstaltungen:'Veranstaltungen',
  kommunikation:'Kommunikation', senioren:'Senioren', jugend:'Jugend', soma:'SOMA', sonstiges:'Sonstiges' };
const SZ_FARBE = { leitung:'#7c8cff', projekte:'#4fb7c8', entwicklung:'#59b98a', finanzen:'#d9a441', partner:'#e0795b', spieltag:'#5b9be0', veranstaltungen:'#c66bb2',
  kommunikation:'#8fb04f', senioren:'#e0574f', jugend:'#f0a23c', soma:'#8a94a6', sonstiges:'#9aa3b5' };
/* Stichworte für die Zuordnung ohne KI. Trifft nichts, bleibt es „Sonstiges“ und die Person wählt in der Vorschau. */
const SZ_WORT = { finanzen:/kasse|geld|beitrag|beiträge|budget|rechnung|kosten|finanz|spende|euro|€/i, partner:/partner|bande|werbung|stadionheft|anzeige|trikotwerb/i,
  spieltag:/heimspiel|spieltag|platz|rasen|kabine|verkauf|grill|eintritt|flutlicht|schiedsrichter/i, veranstaltungen:/fest|turnier|feier|weihnacht|kerwe|event|veranstaltung|ausflug/i,
  kommunikation:/webseite|website|instagram|facebook|presse|zeitung|whatsapp|app\b|newsletter|foto/i, jugend:/jugend|junioren|\bu ?\d\d?\b|bambini|kinder|nachwuchs/i,
  senioren:/erste|zweite|1\. mannschaft|2\. mannschaft|trainer|kader|training|spieler|neuzug|vorbereitung|winterpause|testspiel/i, soma:/soma|alte herren|\bah\b/i,
  leitung:/vorstand|satzung|versammlung|wahl|abteilung|leitung|ehrenamt|mitglied/i, projekte:/projekt|umbau|sanierung|bau\b|förder/i, entwicklung:/konzept|strategie|leitbild|entwicklung|zukunft/i };
const szE = s => (typeof svEsc === 'function' ? svEsc(s == null ? '' : String(s)) : String(s == null ? '' : s).replace(/[&<>"']/g, c => ({ '&':'&amp;', '<':'&lt;', '>':'&gt;', '"':'&quot;', "'":'&#39;' }[c])));
const szI = n => (typeof SVI === 'function' ? SVI(n) : '');
const szNorm = s => String(s || '').toLowerCase().replace(/[^a-z0-9äöüß ]+/g, ' ').replace(/\s+/g, ' ').trim();
function szDatum(d, z){ try{ const x = new Date(d + 'T12:00:00'); return x.toLocaleDateString('de-DE', { weekday:'long', day:'numeric', month:'long' }) + (z ? ', ' + z + ' Uhr' : ''); }catch(e){ return d || ''; } }
function szIstSitzung(i){ return !!i && i.k === 'event' && (['sitzung', 'versammlung'].includes(i.a) || (i.sicht || []).some(x => /^(g|u):/.test(x))); }
function szVorname(n){ return String(n || '').trim().split(/\s+/)[0] || 'Jemand'; }

(function(){ try{ if(document.getElementById('svm112css')) return; const s = document.createElement('style'); s.id = 'svm112css';
  s.textContent = `.sz-voll{position:fixed;inset:0;z-index:55;overflow:auto;-webkit-overflow-scrolling:touch;background:var(--bg,#05070c);padding:calc(10px + env(safe-area-inset-top)) max(14px,env(safe-area-inset-right)) calc(40px + env(safe-area-inset-bottom)) max(14px,env(safe-area-inset-left))}
html.sz-an,html.sz-an body{overflow:hidden}
.sz-in{max-width:760px;margin:0 auto}
.sz-kopf{display:flex;justify-content:space-between;align-items:center;gap:8px;margin-bottom:6px}
.sz-kopf .btn{min-height:44px}
.sz-titel{margin:8px 0 2px;font-size:24px;line-height:1.2;font-weight:800;color:var(--ink);text-wrap:balance}
.sz-wann{margin:0 0 14px;color:var(--ink2);font-size:14px}
.sz-stand{display:inline-block;margin-left:8px;padding:2px 9px;border-radius:999px;font-size:12px;font-weight:700;background:var(--line);color:var(--ink2);vertical-align:2px}
.sz-stand.zu{background:color-mix(in srgb,var(--green,#22c55e) 22%,transparent);color:var(--ink)}
.sz-reiter{display:flex;gap:4px;padding:4px;border-radius:14px;background:var(--card);border:1px solid var(--line);margin-bottom:14px}
.sz-reiter button{flex:1;min-height:44px;border:0;border-radius:10px;background:transparent;color:var(--ink2);font:inherit;font-weight:700;font-size:14px;cursor:pointer}
.sz-reiter button[aria-selected="true"]{background:var(--brand);color:#fff}
.sz-reiter button:focus-visible,.sz-th-k:focus-visible,.sz-stat button:focus-visible{outline:2px solid var(--brand);outline-offset:2px}
.sz-leer{padding:26px 18px;border:1px dashed var(--line);border-radius:16px;text-align:center;color:var(--ink2)}
.sz-leer b{display:block;color:var(--ink);font-size:17px;margin-bottom:6px}
.sz-gr{margin:18px 0 8px;display:flex;align-items:center;gap:8px;font-size:12px;font-weight:800;letter-spacing:.06em;text-transform:uppercase;color:var(--ink2)}
.sz-gr i{width:10px;height:10px;border-radius:3px;background:var(--c)}
.sz-th{background:var(--card);border:1px solid var(--line);border-left:4px solid var(--c);border-radius:14px;margin-bottom:8px;overflow:hidden}
.sz-th-k{display:flex;gap:10px;align-items:flex-start;width:100%;min-height:56px;padding:12px 14px;border:0;background:transparent;color:inherit;font:inherit;text-align:left;cursor:pointer}
.sz-th-k>.sz-tx{flex:1;min-width:0}
.sz-th-k b{display:block;font-size:16px;line-height:1.3;color:var(--ink);overflow-wrap:anywhere}
.sz-th-k small{display:block;margin-top:3px;color:var(--ink2);font-size:13px}
.sz-prio{flex:none;align-self:flex-start;white-space:nowrap;min-width:28px;padding:3px 8px;border-radius:999px;background:var(--brand);color:#fff;font-size:12px;font-weight:800;text-align:center}
.sz-chip{flex:none;align-self:flex-start;white-space:nowrap;padding:3px 9px;border-radius:999px;font-size:12px;font-weight:700;background:var(--line);color:var(--ink2)}
.sz-chip.ok{background:color-mix(in srgb,var(--green,#22c55e) 24%,transparent);color:var(--ink)}
.sz-chip.spaeter{background:color-mix(in srgb,#d9a441 26%,transparent);color:var(--ink)}
.sz-th-b{padding:2px 14px 14px}
.sz-text{margin:0 0 10px;color:var(--ink);font-size:15px;line-height:1.5;white-space:pre-wrap;overflow-wrap:anywhere}
.sz-wort{margin:0 0 10px;padding-left:10px;border-left:2px solid var(--line);color:var(--ink2);font-size:13px;line-height:1.45}
.sz-l{display:flex;align-items:center;gap:6px;margin:12px 0 5px;font-size:13px;font-weight:700;color:var(--ink)}
.sz-l small{font-weight:500;color:var(--ink2)}
.sz-papier{display:block;width:100%;box-sizing:border-box;min-height:92px;padding:10px 12px;border:1px solid var(--line);border-radius:12px;color:var(--ink);font:inherit;font-size:16px;line-height:28px;resize:vertical}
html textarea.sz-papier.sz-papier{background:repeating-linear-gradient(to bottom,transparent 0 27px,color-mix(in srgb,var(--line) 75%,transparent) 27px 28px) 0 10px local var(--surface2,#121826)!important}
html[data-theme="hell"] textarea.sz-papier.sz-papier{background:repeating-linear-gradient(to bottom,transparent 0 27px,rgba(37,82,208,.13) 27px 28px) 0 10px local #fffdf7!important}
.sz-papier:focus{outline:2px solid var(--brand);outline-offset:1px}
.sz-papier.mein{border-style:dashed}
.sz-ok{margin-left:auto;font-size:12px;font-weight:600;color:var(--ink2);min-height:16px}
.sz-auf{list-style:none;margin:0;padding:0}
.sz-auf li{display:flex;gap:8px;align-items:baseline;padding:7px 0;border-top:1px solid var(--line);font-size:14px;color:var(--ink)}
.sz-auf li small{color:var(--ink2)}
.sz-neu input,.sz-vor input[type=text],.sz-ein #szSuch{border:1px solid var(--line);border-radius:12px;background:var(--surface2,#121826);color:var(--ink);font:inherit}
.sz-rd{margin-top:18px;border:1px dashed var(--line);border-radius:14px;padding:4px 14px 10px}
.sz-rd summary{display:flex;justify-content:space-between;align-items:center;gap:10px;min-height:48px;cursor:pointer;font-weight:700;color:var(--ink);list-style:none}
.sz-rd summary::-webkit-details-marker{display:none}
.sz-rd summary span{font-weight:600;font-size:13px;color:var(--ink2)}
.sz-rd .sz-auf li{align-items:center;flex-wrap:wrap}
.sz-rd .sz-auf li>span{flex:1 1 200px;min-width:0;overflow-wrap:anywhere}
.sz-rd .sz-auf .btn{min-height:44px;margin-left:auto}
.sz-neu{display:grid;grid-template-columns:1fr;gap:8px;margin-top:8px}
.sz-neu input,.sz-neu select,.sz-ein select,.sz-ein input[type=text]{min-height:44px;font-size:16px;padding:8px 12px;box-sizing:border-box;width:100%}
@media(min-width:620px){.sz-neu{grid-template-columns:2fr 1.2fr 1fr auto}}
.sz-stat{display:flex;gap:4px;margin-top:14px;padding:4px;border:1px solid var(--line);border-radius:12px}
.sz-stat button{flex:1;min-height:44px;border:0;border-radius:8px;background:transparent;color:var(--ink2);font:inherit;font-size:14px;font-weight:700;cursor:pointer}
.sz-stat button[aria-pressed="true"]{background:var(--line);color:var(--ink)}
.sz-zeile{display:flex;flex-wrap:wrap;gap:8px;margin-top:10px}
.sz-zeile .btn{min-height:44px}
.sz-fab{position:sticky;bottom:calc(10px + env(safe-area-inset-bottom));display:flex;justify-content:center;margin-top:18px;pointer-events:none}
.sz-fab .btn{pointer-events:auto;min-height:50px;padding:0 22px;box-shadow:0 8px 24px rgba(0,0,0,.35)}
.sz-fab.ruhig{position:static}
.sz-fab.ruhig .btn{box-shadow:none}
.sz-ein textarea{min-height:190px}
.sz-ein .sz-hin{margin:8px 0 0;font-size:13px;color:var(--ink2);line-height:1.45}
.sz-mik[aria-pressed="true"]{background:#c0392b;border-color:#c0392b;color:#fff}
.sz-vor{list-style:none;margin:12px 0 0;padding:0}
.sz-vor li{padding:12px 0;border-top:1px solid var(--line);display:grid;gap:8px}
.sz-vor label{display:flex;gap:10px;align-items:flex-start;font-size:15px;color:var(--ink)}
.sz-vor input[type=checkbox]{width:22px;height:22px;flex:none;margin-top:10px}
.sz-vor .sz-zwei{display:grid;grid-template-columns:1fr 1fr;gap:8px}
.sz-vor small{color:var(--ink2);font-size:13px}
.sz-prot{margin:0;padding:18px 18px 22px;border:1px solid var(--line);border-radius:16px;background:var(--card);color:var(--ink);font:inherit;font-size:15px;line-height:1.6;white-space:pre-wrap;overflow-wrap:anywhere}
.sz-home .sz-h-t{font-size:17px;font-weight:800;color:var(--ink);margin:2px 0}
.sz-home .sz-h-m{color:var(--ink2);font-size:14px;margin:0 0 10px}
.sz-arch{list-style:none;margin:10px 0 0;padding:0}
.sz-arch button{display:block;width:100%;min-height:56px;padding:10px 0;border:0;border-top:1px solid var(--line);background:transparent;color:inherit;font:inherit;text-align:left;cursor:pointer}
.sz-arch b{display:block;color:var(--ink);font-size:15px}
.sz-arch small{display:block;color:var(--ink2);font-size:13px;margin-top:2px}
@media(prefers-reduced-motion:no-preference){.sz-th-b{animation:szAuf .18s ease-out}}
@keyframes szAuf{from{opacity:0;transform:translateY(-4px)}to{opacity:1;transform:none}}`; document.head.appendChild(s); }catch(e){} })();

/* ---------- Laden, Öffnen, Schließen ---------- */
function szBasis(d){ (d.themen || []).forEach(t => { t._basis = t.ergebnis || ''; }); return d; }   // Stand des Ergebnisses beim Laden, siehe szErgebnis
async function szLaden(){ const ev = SZ.id; const { data, error } = await SVB.sb.rpc('sitzung_laden', { p_event:ev }); if(error) throw new Error(error.message); if(SZ.id !== ev) return null; SZ.roh = JSON.stringify(data); SZ.d = szBasis(data); SZ.zuletzt = Date.now(); return data; }
async function szOeffnen(id, tab){
  await szAllesSichern();   // offene Eingaben gehören noch zur vorigen Sitzung
  SZ.id = id; SZ.d = null; SZ.tab = tab || 'agenda'; SZ.auf = {}; SZ.t = {};
  clearInterval(SZ.takt); SZ.takt = setInterval(szFrisch, 15000);
  let v = document.getElementById('szVoll');
  if(!v){ v = document.createElement('div'); v.id = 'szVoll'; v.className = 'sz-voll'; v.setAttribute('role', 'dialog'); v.setAttribute('aria-label', 'Sitzung'); document.body.appendChild(v); document.documentElement.classList.add('sz-an'); }
  v.innerHTML = '<div class="sz-in"><div class="sz-kopf"><b>Sitzung</b><button type="button" class="btn ghost" id="szZu">Schließen</button></div><div class="sz-leer">Lade die Agenda …</div></div>';
  v.querySelector('#szZu').onclick = szZu; v.scrollTop = 0;
  try{ await szLaden(); }catch(e){ v.querySelector('.sz-leer').innerHTML = '<b>Das hat nicht geklappt</b>' + szE(e.message); return; }
  szRender();
}
function szZu(){ szAllesSichern(); clearInterval(SZ.takt); SZ.takt = null; const v = document.getElementById('szVoll'); if(v) v.remove(); document.documentElement.classList.remove('sz-an'); SZ.id = null; SZ.d = null;
  try{ if(/^#sitzung=/.test(location.hash)) history.replaceState(null, '', location.pathname + location.search); }catch(e){}
  try{ szHeim(true); }catch(e){} }
async function szNeu(){ try{ await szLaden(); szRender(); }catch(e){ kToast('⚠️ ' + e.message); } }
// Was die anderen eintragen, erscheint von selbst: alle 15 Sekunden nachsehen, aber nie, während hier jemand schreibt oder ein Dialog offen ist
async function szFrisch(){
  const v = document.getElementById('szVoll'); if(!v || !SZ.id || !SZ.d || document.hidden || SZ.laedt) return;
  const a = document.activeElement; if(a && v.contains(a) && /^(TEXTAREA|INPUT|SELECT)$/.test(a.tagName)) return;
  if(SZ.unterwegs > 0 || Object.values(SZ.t).some(j => j.offen) || document.querySelector('#overlay.open') || v.querySelector('[data-sicher="1"]')) return;
  if([...v.querySelectorAll('[data-sz-at]')].some(x => x.value.trim())) return;   // angefangene Aufgabe nicht verlieren
  const ev = SZ.id, t0 = Date.now(); SZ.laedt = true;
  try{ const { data, error } = await SVB.sb.rpc('sitzung_laden', { p_event:ev }); if(error || SZ.id !== ev || !data || SZ.unterwegs > 0 || SZ.zuletzt > t0) return;   // inzwischen selbst gespeichert oder neu geladen: Diese Antwort ist älter
    const roh = JSON.stringify(data); if(roh === SZ.roh) return;
    const b = document.activeElement; if(b && v.contains(b) && /^(TEXTAREA|INPUT|SELECT)$/.test(b.tagName)) return;   // inzwischen ins Feld getippt
    SZ.d = szBasis(data); SZ.roh = roh; const y = v.scrollTop; szRender(); v.scrollTop = y; }catch(e){} finally { SZ.laedt = false; }
}

/* ---------- Zeichnen ---------- */
function szRender(){
  const v = document.getElementById('szVoll'), d = SZ.d; if(!v || !d) return;
  const e = d.event, zu = d.stand === 'beendet', n = d.themen.length;
  v.innerHTML = `<div class="sz-in">
    <div class="sz-kopf"><button type="button" class="btn ghost" id="szArch">${szI('search')} Archiv</button><button type="button" class="btn ghost" id="szZu">Schließen</button></div>
    <h1 class="sz-titel">${szE(e.titel)}<span class="sz-stand${zu ? ' zu' : ''}">${zu ? 'beendet' : 'offen'}</span></h1>
    <p class="sz-wann">${szE(szDatum(e.datum, e.zeit))}${e.ort ? ' · ' + szE(e.ort) : ''}${d.leitung ? ' · Leitung: ' + szE(d.leitung.name) : ''}</p>
    <div class="sz-reiter" role="tablist" aria-label="Ansicht">
      ${[['agenda', 'Agenda' + (n ? ' (' + n + ')' : '')], ['notizen', 'Meine Notizen'], ['protokoll', 'Protokoll']].map(([k, l]) => `<button type="button" role="tab" data-sz-tab="${k}" aria-selected="${SZ.tab === k}">${l}</button>`).join('')}
    </div>
    <div id="szB"></div></div>`;
  v.querySelector('#szZu').onclick = szZu; v.querySelector('#szArch').onclick = szArchiv;
  v.querySelectorAll('[data-sz-tab]').forEach(b => b.onclick = () => { szAllesSichern(); SZ.tab = b.dataset.szTab; szRender(); });
  const B = v.querySelector('#szB');
  if(SZ.tab === 'notizen') szNotizen(B); else if(SZ.tab === 'protokoll') szProtokoll(B); else szAgenda(B);
}

function szThemaHtml(t){
  const d = SZ.d, zu = d.stand === 'beendet', auf = !!SZ.auf[t.id], vn = t.von.length;
  const chip = t.status === 'besprochen' ? '<span class="sz-chip ok">besprochen</span>' : t.status === 'vertagt' ? '<span class="sz-chip spaeter">vertagt</span>' : '';
  const von = vn ? 'von ' + t.von.map(x => szVorname(x.name)).join(', ') : 'ohne Absender';
  let b = '';
  if(auf){
    const wort = t.von.filter(x => x.wort && szNorm(x.wort) !== szNorm(t.titel));
    b = `<div class="sz-th-b">
      ${t.text ? `<p class="sz-text">${szE(t.text)}</p>` : ''}
      ${wort.length ? `<div class="sz-wort">${wort.map(x => `${szE(szVorname(x.name))}: „${szE(x.wort)}“`).join('<br>')}</div>` : ''}
      ${zu ? `<div class="sz-l">Ergebnis</div><p class="sz-text">${t.ergebnis ? szE(t.ergebnis) : '<span style="color:var(--ink2)">Kein Ergebnis eingetragen.</span>'}</p>`
        : `<label class="sz-l" for="szErg${t.id}">Ergebnis <small>für alle, steht im Protokoll</small><span class="sz-ok" data-sz-ok="e:${t.id}" aria-live="polite"></span></label>
      <textarea class="sz-papier" id="szErg${t.id}" data-sz-erg="${t.id}" maxlength="6000" placeholder="Was wurde besprochen, was beschlossen?">${szE(t.ergebnis || '')}</textarea>`}
      <label class="sz-l" for="szNot${t.id}">Deine Notiz <small>siehst nur du</small><span class="sz-ok" data-sz-ok="n:${t.id}" aria-live="polite"></span></label>
      <textarea class="sz-papier mein" id="szNot${t.id}" data-sz-not="${t.id}" maxlength="8000" placeholder="Gedanken, Rückfragen, was du dir merken willst">${szE(t.notiz || '')}</textarea>
      ${zu && !t.aufgaben.length ? '' : '<div class="sz-l">Aufgaben</div>'}
      ${t.aufgaben.length ? `<ul class="sz-auf">${t.aufgaben.map(a => `<li><span>${a.status === 'erledigt' ? '✓ ' : ''}${szE(a.titel)}</span><small>${szE(a.wer_name || '')}${a.faellig ? ', bis ' + szE(new Date(a.faellig + 'T12:00:00').toLocaleDateString('de-DE', { day:'numeric', month:'numeric' })) : ''}</small></li>`).join('')}</ul>` : ''}
      ${zu ? '' : `<div class="sz-neu"><input type="text" data-sz-at="${t.id}" maxlength="200" placeholder="Neue Aufgabe" aria-label="Neue Aufgabe" autocomplete="off">
        <select data-sz-aw="${t.id}" aria-label="Zuständig">${d.teilnehmer.map(p => `<option value="${p.id}"${p.id === d.ich ? ' selected' : ''}>${szE(p.name)}</option>`).join('')}${d.teilnehmer.some(p => p.id === d.ich) ? '' : `<option value="${d.ich}" selected>Ich</option>`}</select>
        <input type="date" data-sz-af="${t.id}" aria-label="Bis wann"><button type="button" class="btn ghost" data-sz-aneu="${t.id}">Anlegen</button></div>
      <div class="sz-stat" role="group" aria-label="Stand">${[['offen', 'Offen'], ['besprochen', 'Besprochen'], ['vertagt', 'Vertagt']].map(([k, l]) => `<button type="button" data-sz-st="${t.id}:${k}" aria-pressed="${t.status === k}">${l}</button>`).join('')}</div>
      <div class="sz-zeile">${!t.dabei || vn > 1 ? `<button type="button" class="btn ghost" data-sz-dabei="${t.id}">${t.dabei ? 'Nicht mehr mein Thema' : 'Betrifft mich auch'}</button>` : ''}
        ${d.leiten || (t.meins && vn <= 1) ? `<button type="button" class="btn ghost" data-sz-weg="${t.id}">Thema entfernen</button>` : ''}</div>`}
    </div>`;
  }
  return `<article class="sz-th" style="--c:${SZ_FARBE[t.bereich] || SZ_FARBE.sonstiges}" data-sz-th="${t.id}">
    <button type="button" class="sz-th-k" data-sz-auf="${t.id}" aria-expanded="${auf}"><span class="sz-tx"><b>${szE(t.titel)}</b><small>${szE(von)}${t.aufgaben.length ? ' · ' + t.aufgaben.length + (t.aufgaben.length === 1 ? ' Aufgabe' : ' Aufgaben') : ''}${t.notiz ? ' · mit Notiz' : ''}</small></span>
      ${vn > 1 ? `<span class="sz-prio" title="Von ${vn} Personen eingereicht">×${vn}</span>` : ''}${chip}</button>${b}</article>`;
}

function szAgenda(B){
  const d = SZ.d, zu = d.stand === 'beendet';
  if(!d.themen.length){
    B.innerHTML = `<div class="sz-leer"><b>Noch keine Themen</b>Trag ein, was du besprechen willst. Du kannst tippen, diktieren oder eine ganze Liste einfügen. Die App macht daraus einzelne Punkte.
      ${zu ? '' : '<div class="sz-zeile" style="justify-content:center;margin-top:14px"><button type="button" class="btn" id="szEin">Themen einreichen</button></div>'}</div><div id="szRunde"></div>`;
  }else{
    const gr = {}; d.themen.forEach(t => { (gr[t.bereich] = gr[t.bereich] || []).push(t); });
    const folge = Object.keys(gr).sort((a, b) => Math.max(...gr[b].map(t => t.von.length)) - Math.max(...gr[a].map(t => t.von.length)) || Math.min(...gr[a].map(t => t.sort)) - Math.min(...gr[b].map(t => t.sort)));
    B.innerHTML = folge.map(k => `<h2 class="sz-gr" style="--c:${SZ_FARBE[k] || SZ_FARBE.sonstiges}"><i></i>${szE(SZ_B[k] || 'Sonstiges')}</h2>` +
      gr[k].slice().sort((a, b) => b.von.length - a.von.length || a.sort - b.sort).map(szThemaHtml).join('')).join('') +
      '<div id="szRunde"></div>' + (zu ? '' : `<div class="sz-fab${Object.values(SZ.auf).some(Boolean) ? ' ruhig' : ''}"><button type="button" class="btn" id="szEin">Themen einreichen</button></div>`);   // beim Schreiben liegt die Taste nicht über den Feldern
  }
  const ein = B.querySelector('#szEin'); if(ein) ein.onclick = () => szEinreichen();
  szRunde(B);
  B.querySelectorAll('[data-sz-auf]').forEach(b => b.onclick = () => { szAllesSichern(); const id = b.dataset.szAuf; SZ.auf[id] = !SZ.auf[id]; const y = document.getElementById('szVoll').scrollTop; szAgenda(B); document.getElementById('szVoll').scrollTop = y; });
  const thema = id => (SZ.d ? SZ.d.themen.find(t => t.id === id) : null) || {};
  B.querySelectorAll('[data-sz-erg]').forEach(x => szTippen(x, 'e:' + x.dataset.szErg, () => szErgebnis(x.dataset.szErg, x.value), () => { thema(x.dataset.szErg).ergebnis = x.value; }));
  B.querySelectorAll('[data-sz-not]').forEach(x => szTippen(x, 'n:' + x.dataset.szNot, () => szNotiz(x.dataset.szNot, x.value), () => { thema(x.dataset.szNot).notiz = x.value; }));
  B.querySelectorAll('[data-sz-st]').forEach(b => b.onclick = async () => { const [id, st] = b.dataset.szSt.split(':'); await szAllesSichern();
    const { error } = await SVB.sb.rpc('sitzung_thema_setzen', { p_id:id, p:{ status:st } }); if(error){ kToast('⚠️ ' + error.message); return; } await szNeu(); });
  B.querySelectorAll('[data-sz-dabei]').forEach(b => b.onclick = async () => { const t = d.themen.find(x => x.id === b.dataset.szDabei); await szAllesSichern();
    const { error } = await SVB.sb.rpc('sitzung_thema_dabei', { p_id:t.id, p_dabei:!t.dabei }); if(error){ kToast('⚠️ ' + error.message); return; } await szNeu(); });
  B.querySelectorAll('[data-sz-weg]').forEach(b => b.onclick = async () => { if(b.dataset.sicher !== '1'){ b.dataset.sicher = '1'; b.textContent = 'Wirklich entfernen?'; return; }
    const { error } = await SVB.sb.rpc('sitzung_thema_weg', { p_id:b.dataset.szWeg }); if(error){ kToast('⚠️ ' + error.message); return; } kToast('Thema entfernt'); await szNeu(); });
  B.querySelectorAll('[data-sz-aneu]').forEach(b => b.onclick = async () => { const id = b.dataset.szAneu, ti = B.querySelector(`[data-sz-at="${id}"]`), wer = B.querySelector(`[data-sz-aw="${id}"]`), bis = B.querySelector(`[data-sz-af="${id}"]`);
    if(!ti.value.trim()){ ti.focus(); return; } b.disabled = true; await szAllesSichern();
    const { error } = await SVB.sb.rpc('sitzung_aufgabe', { p_thema:id, p_titel:ti.value, p_wer:wer.value, p_faellig:bis.value || null });
    b.disabled = false; if(error){ kToast('⚠️ ' + error.message); return; } kToast('✓ Aufgabe angelegt. Sie steht bei den To-dos.'); await szNeu(); });
}

/* ---------- To-dos, die bei den Aufgaben schon „für die nächste Runde“ vorgemerkt sind ---------- */
async function szRunde(B){
  const d = SZ.d, box = B.querySelector('#szRunde'); if(!box || !d || d.stand === 'beendet' || typeof plAuf !== 'function') return;
  try{ if(!(typeof PL !== 'undefined' && PL.d) && typeof plLaden === 'function') await plLaden(true); }catch(e){}
  if(!document.body.contains(box) || SZ.d !== d) return;
  const da = new Set(d.themen.map(t => szNorm(t.titel)));
  const L = plAuf().filter(a => a.sitzung && a.status !== 'erledigt' && !da.has(szNorm(a.titel)));
  if(!L.length) return;
  box.innerHTML = `<details class="sz-rd"${SZ.rundeAuf ? ' open' : ''}><summary>Für die nächste Runde vorgemerkt <span>${L.length} ${L.length === 1 ? 'To-do' : 'To-dos'}</span></summary>
    <p class="note" style="margin:8px 0 0">Diese To-dos sind bei den Aufgaben für die Runde markiert. Mit einem Tipp steht eines als Thema auf der Agenda.</p>
    <ul class="sz-auf">${L.slice(0, 40).map(a => `<li><span>${szE(a.titel)}</span><small>${szE([SZ_B[a.bereich], typeof plWerName === 'function' ? plWerName(a) : ''].filter(Boolean).join(' · '))}</small><button type="button" class="btn ghost" data-sz-rd="${szE(a.id)}">Auf die Agenda</button></li>`).join('')}</ul></details>`;
  box.querySelector('details').addEventListener('toggle', e => { SZ.rundeAuf = e.target.open; });
  box.querySelectorAll('[data-sz-rd]').forEach(b => b.onclick = async () => { const a = L.find(x => String(x.id) === b.dataset.szRd); if(!a) return; b.disabled = true; await szAllesSichern();
    const { error } = await SVB.sb.rpc('sitzung_themen_setzen', { p_event:SZ.id, p_themen:[{ titel:String(a.titel).slice(0, 160), bereich:SZ_B[a.bereich] ? a.bereich : 'sonstiges', wort:String(a.titel).slice(0, 300) }] });   // nur der Titel: Die Notiz am To-do bleibt in ihrem Bereich
    if(error){ b.disabled = false; kToast('⚠️ ' + error.message); return; } kToast('✓ Steht auf der Agenda'); await szNeu(); });
}

/* ---------- Schreiben mit Sichern im Hintergrund ---------- */
function szTippen(feld, key, sichern, merken){   // merken: sofort in den eigenen Stand, damit ein Neuzeichnen nichts Getipptes verliert
  const los = () => { clearTimeout((SZ.t[key] || {}).z); const j = SZ.t[key]; if(!j || !j.offen) return Promise.resolve(); j.offen = false; return szSenden(j.f); };
  feld.addEventListener('input', () => { if(merken) merken(); clearTimeout((SZ.t[key] || {}).z); SZ.t[key] = { offen:true, f:sichern, z:setTimeout(los, 2500) }; const o = document.querySelector(`[data-sz-ok="${key}"]`); if(o) o.textContent = ''; });
  feld.addEventListener('blur', los);
}
function szSenden(f){ SZ.unterwegs++; return Promise.resolve().then(f).catch(() => {}).finally(() => { SZ.unterwegs--; SZ.zuletzt = Date.now(); }); }
function szAllesSichern(){ const p = []; Object.keys(SZ.t).forEach(k => { const j = SZ.t[k]; clearTimeout(j.z); if(j.offen){ j.offen = false; p.push(szSenden(j.f)); } }); return Promise.all(p); }
function szGesichert(key, fehler){ const o = document.querySelector(`[data-sz-ok="${key}"]`); if(o) o.textContent = fehler ? 'nicht gespeichert' : 'gespeichert'; }
async function szErgebnis(id, text){ const t = SZ.d && SZ.d.themen.find(x => x.id === id), vor = t ? t._basis || '' : '';
  const { data, error } = await SVB.sb.rpc('sitzung_thema_setzen', { p_id:id, p:t ? { ergebnis:text, ergebnis_vor:vor } : { ergebnis:text } });
  if(error){ szGesichert('e:' + id, true); kToast('⚠️ ' + error.message); return; }
  if(data && data.konflikt && t){   // jemand anderes hat inzwischen am Ergebnis geschrieben: dessen Text bleibt, das Eigene kommt dahinter
    const fremd = data.ergebnis || '', mein = String(text || ''), neu = mein.startsWith(vor) ? mein.slice(vor.length).trim() : mein.trim(), zus = (fremd + (neu && !fremd.includes(neu) ? '\n' + neu : '')).slice(0, 6000);
    t._basis = fremd; t.ergebnis = zus; const f = document.querySelector(`[data-sz-erg="${id}"]`); if(f) f.value = zus;
    kToast('Jemand anderes hat hier auch geschrieben. Beides steht jetzt im Ergebnis.'); return szErgebnis(id, zus); }
  if(t){ t.ergebnis = text; t._basis = String(text || '').trim(); } szGesichert('e:' + id); }
async function szNotiz(id, text){ const ev = SZ.id; const { error } = await SVB.sb.rpc('sitzung_notiz_setzen', { p_event:ev, p_thema:id || null, p_text:text });
  if(error){ szGesichert('n:' + (id || ''), true); kToast('⚠️ ' + error.message); return; }
  if(SZ.d && SZ.id === ev){ if(id){ const t = SZ.d.themen.find(x => x.id === id); if(t) t.notiz = text; } else SZ.d.notiz = text; } szGesichert('n:' + (id || '')); }

/* ---------- Meine Notizen ---------- */
function szNotizen(B){
  const d = SZ.d, mit = d.themen.filter(t => t.notiz);
  B.innerHTML = `<label class="sz-l" for="szNotAll">Zur ganzen Sitzung <small>siehst nur du</small><span class="sz-ok" data-sz-ok="n:" aria-live="polite"></span></label>
    <textarea class="sz-papier mein" id="szNotAll" style="min-height:204px" maxlength="8000" placeholder="Hier schreibst du mit wie in ein Notizbuch. Niemand außer dir kann das lesen, auch kein Admin.">${szE(d.notiz || '')}</textarea>
    ${mit.length ? '<h2 class="sz-gr" style="--c:var(--ink2)"><i></i>Deine Notizen zu den Themen</h2>' + mit.map(t => `<label class="sz-l" for="szNotT${t.id}">${szE(t.titel)}<span class="sz-ok" data-sz-ok="n:${t.id}" aria-live="polite"></span></label>
      <textarea class="sz-papier mein" id="szNotT${t.id}" data-sz-not="${t.id}" maxlength="8000">${szE(t.notiz)}</textarea>`).join('') : '<p class="note" style="margin-top:14px">Notizen zu einzelnen Themen schreibst du in der Agenda direkt beim Thema. Sie erscheinen dann auch hier.</p>'}`;
  const all = B.querySelector('#szNotAll'); szTippen(all, 'n:', () => szNotiz('', all.value), () => { d.notiz = all.value; });
  B.querySelectorAll('[data-sz-not]').forEach(x => szTippen(x, 'n:' + x.dataset.szNot, () => szNotiz(x.dataset.szNot, x.value), () => { const t = d.themen.find(y => y.id === x.dataset.szNot); if(t) t.notiz = x.value; }));
}

/* ---------- Protokoll ---------- */
async function szProtokoll(B){
  const d = SZ.d, zu = d.stand === 'beendet'; let text = d.protokoll || '';
  if(!zu){ B.innerHTML = '<div class="sz-leer">Stelle das Protokoll zusammen …</div>';
    const { data, error } = await SVB.sb.rpc('sitzung_protokoll_vorschau', { p_event:SZ.id }); if(SZ.tab !== 'protokoll' || !document.getElementById('szVoll')) return;
    if(error){ B.innerHTML = `<div class="sz-leer"><b>Das hat nicht geklappt</b>${szE(error.message)}</div>`; return; } text = data || ''; }
  B.innerHTML = `${zu ? '' : `<p class="note" style="margin:0 0 12px">So sieht das Protokoll im Moment aus. Es entsteht aus den Themen, den Ergebnissen und den Aufgaben. Eigene Notizen kommen nicht hinein.${d.leiten ? '' : ' Beendet wird die Sitzung von der Leitung, sonst von selbst 12 Stunden nach Beginn.'}</p>`}
    <pre class="sz-prot" id="szProt">${szE(text)}</pre>
    <div class="sz-zeile"><button type="button" class="btn${zu ? '' : ' ghost'}" id="szTeilen">${szI('share')} Teilen</button><button type="button" class="btn ghost" id="szKopie">Kopieren</button>
      ${d.leiten && !zu ? '<button type="button" class="btn" id="szEnde">Sitzung beenden</button>' : ''}
      ${d.leiten && zu ? '<button type="button" class="btn ghost" id="szProtEd">Protokoll bearbeiten</button><button type="button" class="btn ghost" id="szWieder">Wieder öffnen</button>' : ''}</div>
    ${d.leiten && !zu && d.teilnehmer.length > 1 ? `<div class="sz-ein" style="margin-top:18px"><label class="sz-l" for="szLt">Wer leitet die Sitzung? <small>bekommt 5 Stunden nach Beginn die Frage, ob sie beendet ist</small></label>
      <select id="szLt">${d.teilnehmer.map(p => `<option value="${p.id}"${d.leitung && d.leitung.id === p.id ? ' selected' : ''}>${szE(p.name)}</option>`).join('')}${d.leitung && !d.teilnehmer.some(p => p.id === d.leitung.id) ? `<option value="" selected>${szE(d.leitung.name)} (nicht in der Runde)</option>` : ''}</select>
      <p class="sz-hin">Gilt auch für die nächsten Termine dieser Reihe.</p></div>` : ''}`;
  const lt = B.querySelector('#szLt');
  if(lt) lt.onchange = async () => { if(!lt.value) return; const { error } = await SVB.sb.rpc('sitzung_leitung_setzen', { p_event:SZ.id, p_wer:lt.value }); if(error){ kToast('⚠️ ' + error.message); return; } kToast('✓ Leitung geändert'); await szNeu(); };
  const kopie = async () => { try{ await navigator.clipboard.writeText(text); kToast('✓ Kopiert'); }catch(e){ kToast('Kopieren ging nicht. Bitte den Text markieren.'); } };
  B.querySelector('#szKopie').onclick = kopie;
  B.querySelector('#szTeilen').onclick = async () => { if(navigator.share){ try{ await navigator.share({ title:'Protokoll: ' + d.event.titel, text }); }catch(e){} } else kopie(); };
  const ende = B.querySelector('#szEnde');
  if(ende) ende.onclick = async () => { if(ende.dataset.sicher !== '1'){ ende.dataset.sicher = '1'; ende.textContent = 'Wirklich beenden? Alle Teilnehmer bekommen Bescheid.'; return; }
    ende.disabled = true; await szAllesSichern(); const { error } = await SVB.sb.rpc('sitzung_beenden', { p_event:SZ.id }); if(error){ ende.disabled = false; kToast('⚠️ ' + error.message); return; }
    kToast('✓ Sitzung beendet, das Protokoll ist verteilt'); await szNeu(); };
  const wieder = B.querySelector('#szWieder');
  if(wieder) wieder.onclick = async () => { const { error } = await SVB.sb.rpc('sitzung_beenden', { p_event:SZ.id, p_wieder_offen:true }); if(error){ kToast('⚠️ ' + error.message); return; } await szNeu(); };
  const ed = B.querySelector('#szProtEd');
  if(ed) ed.onclick = () => { const M = svModal(`<div class="sz-ein"><h2>Protokoll bearbeiten</h2><textarea class="sz-papier" id="szProtT" style="min-height:50vh" maxlength="60000">${szE(text)}</textarea>
      <div class="btnrow" style="margin-top:14px"><button type="button" class="btn" id="szProtOk">Speichern</button></div></div>`);
    M.querySelector('#szProtOk').onclick = async () => { const { error } = await SVB.sb.rpc('sitzung_beenden', { p_event:SZ.id, p_protokoll:M.querySelector('#szProtT').value });
      if(error){ kToast('⚠️ ' + error.message); return; } closeOverlay(); kToast('✓ Gespeichert'); await szNeu(); }; };
}

/* ---------- Themen einreichen ---------- */
function szLokal(text){   // ohne KI: eine Zeile oder ein Aufzählungspunkt ist ein Thema
  const d = SZ.d, out = [], gesehen = new Set();
  String(text || '').split(/\n+/).map(z => z.replace(/^\s*(?:[-*•·]|\d{1,2}[.)]|[a-z][.)])\s+/i, '').trim()).filter(z => z.length >= 3).forEach(z => {
    const titel = z.length > 160 ? z.slice(0, 157) + '…' : z, k = szNorm(titel); if(!k || gesehen.has(k)) return; gesehen.add(k);
    const br = Object.keys(SZ_WORT).find(b => SZ_WORT[b].test(z)) || 'sonstiges';
    out.push({ titel:titel.replace(/[.]+$/, ''), text:z.length > 160 ? z : '', bereich:br, zu:szGleich(titel, d ? d.themen : []) }); });
  return out.slice(0, 40);
}
function szGleich(titel, themen){   // dasselbe Thema: gleiche Wörter, oder fast alle Wörter gemeinsam
  const a = new Set(szNorm(titel).split(' ').filter(w => w.length > 2)); if(!a.size) return '';
  let best = '', wert = 0;
  themen.forEach(t => { const b = new Set(szNorm(t.titel).split(' ').filter(w => w.length > 2)); if(!b.size) return; let g = 0; a.forEach(w => { if(b.has(w)) g++; });
    const j = g / (a.size + b.size - g); if(j > wert){ wert = j; best = t.id; } });
  return wert >= 0.6 ? best : '';
}
function szEinreichen(){
  const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
  const M = svModal(`<div class="sz-ein"><h2>Themen einreichen</h2>
    <p class="note">Schreib oder sprich, was du besprechen willst. Mehrere Themen sind kein Problem: Die App macht einzelne Punkte daraus und zeigt sie dir, bevor etwas gespeichert wird.</p>
    <textarea class="sz-papier" id="szEinT" maxlength="12000" placeholder="Zum Beispiel:&#10;Winterpause: Wann fangen wir wieder an?&#10;Kabine 2 braucht neue Bänke&#10;Weihnachtsfeier, wer organisiert?" aria-label="Deine Themen"></textarea>
    <div class="sz-zeile">${SR ? `<button type="button" class="btn ghost sz-mik" id="szMik" aria-pressed="false">${szI('mic')} Diktieren</button>` : ''}
      <label class="btn ghost" style="cursor:pointer">${szI('upload')} Datei<input type="file" id="szDatei" accept=".pdf,.docx,.xlsx,.txt,.md,.csv,application/pdf,text/plain" hidden></label></div>
    <p class="sz-hin" id="szEinH">${SR ? '' : 'Diktieren: Tipp ins Feld und nimm das Mikrofon auf deiner Tastatur. '}Datei: PDF, Word, Excel oder Text, bis 4 MB.</p>
    <div class="btnrow" style="margin-top:14px"><button type="button" class="btn" id="szEinOk">Vorschau</button></div></div>`);
  const T = M.querySelector('#szEinT'), H = M.querySelector('#szEinH'); let datei = null, rec = null;
  setTimeout(() => { try{ T.focus(); }catch(e){} }, 80);
  const mik = M.querySelector('#szMik');
  if(mik) mik.onclick = () => { if(rec){ try{ rec.stop(); }catch(e){} return; }
    try{ rec = new SR(); rec.lang = 'de-DE'; rec.continuous = true; rec.interimResults = false;
      rec.onresult = ev => { for(let i = ev.resultIndex; i < ev.results.length; i++) if(ev.results[i].isFinal){ const s = ev.results[i][0].transcript.trim(); if(s) T.value = (T.value ? T.value.replace(/\s*$/, '') + '\n' : '') + s; } };
      rec.onend = () => { rec = null; mik.setAttribute('aria-pressed', 'false'); mik.lastChild.textContent = ' Diktieren'; };
      rec.onerror = () => { H.textContent = 'Das Mikrofon ließ sich nicht nutzen. Nimm das Mikrofon auf deiner Tastatur.'; };
      rec.start(); mik.setAttribute('aria-pressed', 'true'); mik.lastChild.textContent = ' Aufnahme läuft, tippen zum Beenden'; }catch(e){ rec = null; H.textContent = 'Das Mikrofon ließ sich nicht nutzen. Nimm das Mikrofon auf deiner Tastatur.'; } };
  M.querySelector('#szDatei').onchange = ev => { const f = ev.target.files && ev.target.files[0]; if(!f) return;
    if(f.size > 4 * 1024 * 1024){ H.textContent = 'Die Datei ist zu groß (höchstens 4 MB).'; ev.target.value = ''; return; }
    const r = new FileReader();
    if(/\.(txt|md|csv)$/i.test(f.name) || /^text\//.test(f.type)){ r.onload = () => { T.value = (T.value ? T.value + '\n' : '') + String(r.result || ''); H.textContent = '„' + f.name + '“ steht jetzt im Feld.'; }; r.readAsText(f); }
    else { r.onload = () => { datei = { name:f.name, typ:f.type, b64:String(r.result || '').replace(/^data:[^,]*,/, '') }; H.textContent = '„' + f.name + '“ ist angehängt. Die KI liest die Datei für die Vorschau.'; }; r.readAsDataURL(f); } };
  M.querySelector('#szEinOk').onclick = async () => { const ok = M.querySelector('#szEinOk'), text = T.value.trim(); if(rec){ try{ rec.stop(); }catch(e){} }
    if(!text && !datei){ T.focus(); return; }
    ok.disabled = true; ok.textContent = 'Lese deine Themen …';
    let themen = null, ki = false, hinweis = '';
    try{ const { data, error } = await SVB.sb.functions.invoke('sitzung-ki', { body:{ event:SZ.id, text, datei } });
      if(!error && data && data.ok && Array.isArray(data.themen) && data.themen.length){ themen = data.themen; ki = true; } else if(data && data.error) hinweis = data.error; }catch(e){}
    if(!themen){ if(!text){ ok.disabled = false; ok.textContent = 'Vorschau'; H.textContent = (hinweis || 'Die Datei ließ sich gerade nicht lesen.') + ' Füg den Text bitte direkt ins Feld ein.'; return; }
      themen = szLokal(text); }
    if(!themen.length){ ok.disabled = false; ok.textContent = 'Vorschau'; H.textContent = 'Darin steht noch kein Thema.'; return; }
    szVorschau(themen, ki, text); };
}
function szVorschau(themen, ki, roh){
  const d = SZ.d;
  const M = svModal(`<div class="sz-ein"><h2>${themen.length === 1 ? 'Ein Thema' : themen.length + ' Themen'} erkannt</h2>
    <p class="note">${ki ? 'Die KI hat deine Eingabe sortiert.' : 'Jede Zeile ist ein Thema.'} Schau kurz drüber, ändere, was nicht passt, und nimm den Haken weg, wo du etwas nicht einreichen willst.</p>
    <ul class="sz-vor">${themen.map((t, i) => `<li data-sz-v="${i}"><label><input type="checkbox" checked aria-label="Einreichen"><input type="text" value="${szE(t.titel)}" maxlength="160" aria-label="Titel"></label>
      ${t.text ? `<small>${szE(t.text)}</small>` : ''}
      <div class="sz-zwei"><select aria-label="Bereich" data-sz-vb>${Object.keys(SZ_B).map(k => `<option value="${k}"${k === t.bereich ? ' selected' : ''}>${szE(SZ_B[k])}</option>`).join('')}</select>
      <select aria-label="Gehört zu" data-sz-vz><option value="">Neues Thema</option>${d.themen.map(x => `<option value="${x.id}"${x.id === t.zu ? ' selected' : ''}>Wie: ${szE(x.titel.slice(0, 60))}</option>`).join('')}</select></div></li>`).join('')}</ul>
    <div class="btnrow" style="margin-top:14px"><button type="button" class="btn" id="szVorOk">Einreichen</button><button type="button" class="btn ghost" id="szVorZur">Zurück</button></div></div>`);
  M.querySelector('#szVorZur').onclick = () => { szEinreichen(); const T = document.querySelector('#modal #szEinT'); if(T) T.value = roh || ''; };
  M.querySelector('#szVorOk').onclick = async () => { const ok = M.querySelector('#szVorOk'), liste = [];
    M.querySelectorAll('[data-sz-v]').forEach(li => { const i = +li.dataset.szV, t = themen[i]; if(!li.querySelector('input[type=checkbox]').checked) return; const titel = li.querySelector('input[type=text]').value.trim(); if(!titel) return;
      liste.push({ titel, text:t.text || '', bereich:li.querySelector('[data-sz-vb]').value, zu:li.querySelector('[data-sz-vz]').value, wort:t.titel }); });
    if(!liste.length){ kToast('Kein Thema ausgewählt'); return; } ok.disabled = true;
    const { data, error } = await SVB.sb.rpc('sitzung_themen_setzen', { p_event:SZ.id, p_themen:liste }); if(error){ ok.disabled = false; kToast('⚠️ ' + error.message); return; }
    closeOverlay(); kToast('✓ ' + (data.neu ? data.neu + (data.neu === 1 ? ' neues Thema' : ' neue Themen') : '') + (data.neu && data.dazu ? ', ' : '') + (data.dazu ? data.dazu + ' zu vorhandenen dazu' : ''));
    SZ.tab = 'agenda'; await szNeu(); };
}

/* ---------- Archiv mit Suche ---------- */
function szArchiv(){
  const M = svModal(`<div class="sz-ein"><h2>Sitzungen</h2><input type="text" id="szSuch" placeholder="Suchen in Themen, Ergebnissen und deinen Notizen" aria-label="Suchen" autocomplete="off" style="width:100%;min-height:44px;font-size:16px;padding:8px 12px;box-sizing:border-box">
    <ul class="sz-arch" id="szArchL"><li class="note">Lade …</li></ul></div>`);
  const L = M.querySelector('#szArchL'), S = M.querySelector('#szSuch'); let z = null, lauf = 0;
  const hol = async () => { const n = ++lauf, q = S.value.trim(); const { data, error } = await SVB.sb.rpc('sitzungen_archiv', { p_q:q || null }); if(n !== lauf) return;
    if(error){ L.innerHTML = `<li class="note">${szE(error.message)}</li>`; return; }
    L.innerHTML = (data || []).length ? data.map(x => `<li><button type="button" data-sz-o="${x.id}"><b>${szE(x.titel)}</b><small>${szE(szDatum(x.datum, x.zeit))} · ${x.themen} ${x.themen === 1 ? 'Thema' : 'Themen'}${x.stand === 'beendet' ? ' · mit Protokoll' : ''}</small>
      ${(x.treffer || []).map(t => `<small>… ${szE(t)}</small>`).join('')}</button></li>`).join('') : `<li class="note">${q ? 'Dazu steht in keiner Sitzung etwas.' : 'Noch keine Sitzung mit Themen.'}</li>`;
    L.querySelectorAll('[data-sz-o]').forEach(b => b.onclick = () => { closeOverlay(); szOeffnen(b.dataset.szO); }); };
  S.oninput = () => { clearTimeout(z); z = setTimeout(hol, 300); }; hol();
}

/* ---------- Im Termin: „Agenda öffnen“ ---------- */
if(typeof kalDetail === 'function'){ const _a = kalDetail; kalDetail = function(id){ const r = _a.apply(this, arguments);
  try{ const i = kalItem(id), akt = document.querySelector('#modal .kal-det .kal-akt'); if(!akt || !szIstSitzung(i) || akt.querySelector('#kalAgenda')) return r;
    const b = document.createElement('button'); b.className = 'btn'; b.id = 'kalAgenda'; b.type = 'button'; b.innerHTML = szI('book') + ' Agenda öffnen';
    b.onclick = () => { closeOverlay(); szOeffnen(i.id); }; akt.insertBefore(b, akt.firstChild);
    const sh = akt.querySelector('#kalShare'); if(sh) sh.classList.add('ghost'); }catch(e){}
  return r; }; }

/* ---------- Startseite: meine nächste Sitzung ---------- */
async function szHeim(neu){
  const home = document.getElementById('panel-home'); if(!home || !(typeof SVB !== 'undefined' && SVB.sb) || (typeof svRole === 'function' && !svRole())) return;
  if(neu || Date.now() - SZ.heimAm > 120000){ SZ.heimAm = Date.now(); try{ const { data } = await SVB.sb.rpc('sitzung_naechste'); SZ.heim = data || null; }catch(e){ SZ.heim = null; } }
  let k = document.getElementById('szHome'); const x = SZ.heim;
  if(!x){ if(k) k.remove(); return; }
  if(!k){ k = document.createElement('section'); k.id = 'szHome'; k.className = 'card sz-home'; k.setAttribute('aria-label', 'Sitzung'); home.appendChild(k); }
  const zu = x.stand === 'beendet', heute = !zu && x.datum === szHeute() && x.themen > 0;   // am Tag selbst führt die Karte direkt ins Durchgehen
  const html = `<div class="sechead" style="margin:0 0 4px">${zu ? 'Protokoll ist da' : heute ? 'Heute: deine Sitzung' : 'Deine nächste Sitzung'}</div><div class="sz-h-t">${szE(x.titel)}</div>
    <p class="sz-h-m">${szE(szDatum(x.datum, x.zeit))}${x.ort ? ' · ' + szE(x.ort) : ''} · ${x.themen} ${x.themen === 1 ? 'Thema' : 'Themen'}${x.meine ? ', ' + x.meine + ' von dir' : ''}</p>
    <div class="btnrow"><button type="button" class="btn" data-sz-h="${zu ? 'protokoll' : heute ? 'los' : 'agenda'}">${zu ? 'Protokoll lesen' : heute ? 'Sitzung starten' : 'Agenda öffnen'}</button>${zu ? '' : '<button type="button" class="btn ghost" data-sz-h="ein">Themen einreichen</button>'}</div>`;
  if(k.dataset.h !== html){ k.dataset.h = html; k.innerHTML = html;
    k.querySelectorAll('[data-sz-h]').forEach(b => b.onclick = async () => { const w = b.dataset.szH; await szOeffnen(x.id, w === 'protokoll' ? 'protokoll' : 'agenda'); if(w === 'ein' && SZ.d && SZ.d.stand !== 'beendet') szEinreichen();
      if(w === 'los' && SZ.d && SZ.d.stand !== 'beendet' && SZ.d.themen.length){ await szRueckLaden(); szLaufStart(); } }); }
}
if(typeof renderHome === 'function'){ const _rh112 = renderHome; renderHome = function(){ const r = _rh112.apply(this, arguments); try{ szHeim(false); }catch(e){} return r; }; }

/* ---------- Aus einer Mitteilung: „Deine Nachricht“ bekommt den Weg in die Sitzung, die Adresse …/#sitzung=<Kennung> geht auch ---------- */
function szAusAdresse(h){ const m = /^#?sitzung=([0-9a-f-]{36})$/i.exec(String(h || '')); if(!m) return false; const t0 = Date.now();
  const los = () => { const g = document.getElementById('gate'); if(typeof _remoteDone !== 'undefined' && _remoteDone && g && g.classList.contains('done')) szOeffnen(m[1]); else if(Date.now() - t0 < 60000) setTimeout(los, 400); }; los(); return true; }
if(typeof svzInhalt === 'function'){ const _zi112 = svzInhalt; svzInhalt = async function(m){ const x = await _zi112.apply(this, arguments);
  try{ const d = (m && m.data) || {}; if(d.typ === 'sitzung' && /^[0-9a-f-]{36}$/i.test(d.event || '')){ const prot = /^Protokoll:/.test(m.titel || '');
    x.knopf = prot ? `<button class="btn" type="button" data-szm="${d.event}:protokoll">${szI('book')} Protokoll lesen</button>`
      : `<button class="btn" type="button" data-szm="${d.event}:ein">${szI('plus')} Themen einreichen</button><button class="btn ghost" type="button" data-szm="${d.event}:agenda">${szI('book')} Agenda öffnen</button>`; } }catch(e){} return x; }; }
if(typeof svMeldungZeigen === 'function'){ const _mz112 = svMeldungZeigen; svMeldungZeigen = async function(){ const r = await _mz112.apply(this, arguments);
  try{ document.querySelectorAll('#modal [data-szm]').forEach(b => b.onclick = async () => { const [ev, w] = b.dataset.szm.split(':'); closeOverlay(); await szOeffnen(ev, w === 'protokoll' ? 'protokoll' : 'agenda');
    if(w === 'ein' && SZ.d && SZ.d.stand !== 'beendet') szEinreichen(); }); }catch(e){} return r; }; }
if(typeof svZiel === 'function'){ const _z112 = svZiel; svZiel = function(h){ if(szAusAdresse(h)) return Promise.resolve(true); return _z112.apply(this, arguments); }; }
window.addEventListener('hashchange', e => { let h = ''; try{ h = new URL(e.newURL).hash; }catch(x){ h = location.hash; }
  if(/^#sitzung=/.test(h)){ try{ history.replaceState(history.state, '', location.pathname + location.search); }catch(x){} szAusAdresse(h); } });
if(navigator.serviceWorker) navigator.serviceWorker.addEventListener('message', e => { const t = e.data && e.data.svbcZiel; if(typeof t === 'string') szAusAdresse(t); });
if(/^#sitzung=/.test(SZ_START)) szAusAdresse(SZ_START);

/* =====================================================================
   Beta 0.99.57 · Der rote Faden von Sitzung zu Sitzung (179_sitzung_rueckblick.sql)
   Albert, 16.11.2026: „Können wir das Tool noch stärker machen, dass es selbstverständlich ist, dass das jede Sitzung genutzt wird? Fehlt da was?“
   Was fehlte: Jede Sitzung stand für sich. Jetzt beginnt jede Agenda mit dem, was seit dem letzten Mal offen ist, und führt durch den Abend.
   - Rückblick (szRueck*): Aufgaben aus früheren Sitzungen derselben Reihe zum Abhaken, offene und vertagte Themen zum Übernehmen.
   - Durchgehen (szLauf*): ein Thema nach dem anderen mit Ergebnis, Aufgaben und „Besprochen, weiter“. SZ.lauf ist 'rueck', 'ende' oder die Kennung des Themas.
     Das ist eine Ansicht auf demselben Stand: Alles speichert wie auf der Agenda, mehrere können gleichzeitig durchgehen.
   - Wer hat eingereicht (szWerHtml): Namen mit Anzahl, und von wem noch nichts da ist. Verschickt wird dabei nichts.
   ===================================================================== */
(function(){ try{ if(document.getElementById('svm112bcss')) return; const s = document.createElement('style'); s.id = 'svm112bcss';
  s.textContent = `.sz-start{display:flex;flex-wrap:wrap;align-items:center;gap:8px 12px;margin:0 0 12px}
.sz-start .btn{min-height:50px;padding:0 22px}
.sz-start span{color:var(--ink2);font-size:13px}
.sz-wer{margin:0 0 12px;color:var(--ink2);font-size:13px;line-height:1.5}
.sz-rb{margin:0 0 16px;padding:14px 14px 10px;border:1px solid var(--line);border-radius:16px;background:var(--card)}
.sz-rb-h{margin:0 0 4px;font-size:16px;font-weight:800;color:var(--ink)}
.sz-rb-h small{font-weight:600;color:var(--ink2);font-size:13px;margin-left:4px}
.sz-rb-z{margin:0 0 6px;color:var(--ink2);font-size:14px}
.sz-rb-z b{color:var(--ink)}
.sz-rb-z b.rot{color:var(--red,#e0574f)}
.sz-rb-l{list-style:none;margin:0;padding:0}
.sz-rb-l li{display:flex;gap:10px;align-items:center;padding:8px 0;border-top:1px solid var(--line)}
.sz-rb-l li>span{flex:1;min-width:0}
.sz-rb-l b{display:block;font-size:15px;font-weight:600;color:var(--ink);overflow-wrap:anywhere}
.sz-rb-l small{display:block;color:var(--ink2);font-size:13px;margin-top:2px;overflow-wrap:anywhere}
.sz-rb-l li.ok b{text-decoration:line-through;color:var(--ink2);font-weight:500}
.sz-rb-l li.ueber small{color:var(--red,#e0574f)}
.sz-rb-l .btn{min-height:44px;flex:none}
.sz-rb-t{margin-top:12px}
.sz-hk{flex:none;width:44px;height:44px;border-radius:12px;border:2px solid var(--line);background:transparent;color:#fff;font-size:20px;font-weight:800;cursor:pointer}
.sz-hk[aria-pressed="true"]{background:var(--green,#22c55e);border-color:var(--green,#22c55e)}
.sz-hk:focus-visible{outline:2px solid var(--brand);outline-offset:2px}
.sz-lf-k{display:flex;justify-content:space-between;align-items:center;gap:10px;margin-bottom:8px}
.sz-lf-k .btn{min-height:44px}
.sz-lf-z{color:var(--ink2);font-size:13px}
.sz-lf-bal{height:6px;border-radius:999px;background:var(--line);overflow:hidden;margin-bottom:16px}
.sz-lf-bal i{display:block;height:100%;background:var(--brand);border-radius:999px;transition:width .3s ease}
.sz-lf-nr{display:flex;align-items:center;gap:8px;margin:0 0 4px;font-size:12px;font-weight:800;letter-spacing:.06em;text-transform:uppercase;color:var(--ink2)}
.sz-lf-nr i{width:10px;height:10px;border-radius:3px;background:var(--c,var(--brand));flex:none}
.sz-lf-t{margin:0 0 6px;font-size:26px;line-height:1.2;font-weight:800;color:var(--ink);text-wrap:balance;overflow-wrap:anywhere}
.sz-lf-not{margin-top:12px;border-top:1px solid var(--line)}
.sz-lf-not summary{min-height:44px;display:flex;align-items:center;gap:6px;cursor:pointer;font-size:13px;font-weight:700;color:var(--ink)}
.sz-lf-not summary small{font-weight:500;color:var(--ink2)}
.sz-lf-nav{position:sticky;bottom:0;display:flex;gap:8px;margin:18px -4px 0;padding:10px 4px calc(10px + env(safe-area-inset-bottom));background:var(--bg,#05070c)}
.sz-lf-nav .btn{min-height:50px;flex:1 1 0;padding:0 10px}
.sz-lf-nav .btn:last-child{flex:2 1 0}
.sz-lf .sz-neu .btn{min-height:44px}
@media (prefers-reduced-motion:reduce){.sz-lf-bal i{transition:none}}`;
  document.head.appendChild(s); }catch(e){} })();
SZ.rueck = null; SZ.rueckFuer = null; SZ.lauf = null; SZ.laufSeit = 0;

function szHeute(){ try{ return new Date().toLocaleDateString('sv-SE', { timeZone:'Europe/Berlin' }); }catch(e){ return new Date().toISOString().slice(0, 10); } }
function szKurzDatum(d){ try{ return new Date(d + 'T12:00:00').toLocaleDateString('de-DE', { day:'numeric', month:'numeric' }); }catch(e){ return d || ''; } }
/* Die Themen in der Reihenfolge der Agenda: Bereiche nach der höchsten Priorität, darin nach Priorität und Eingang */
function szFolge(d){
  const gr = {}; (d.themen || []).forEach(t => { (gr[t.bereich] = gr[t.bereich] || []).push(t); });
  return Object.keys(gr).sort((a, b) => Math.max(...gr[b].map(t => t.von.length)) - Math.max(...gr[a].map(t => t.von.length)) || Math.min(...gr[a].map(t => t.sort)) - Math.min(...gr[b].map(t => t.sort)))
    .flatMap(k => gr[k].slice().sort((a, b) => b.von.length - a.von.length || a.sort - b.sort));
}
async function szRueckLaden(neu){
  const ev = SZ.id; if(!ev) return null; if(!neu && SZ.rueckFuer === ev) return SZ.rueck;
  let r = null; try{ const { data, error } = await SVB.sb.rpc('sitzung_rueckblick', { p_event:ev }); if(!error) r = data || null; }catch(e){}
  if(SZ.id !== ev) return null; SZ.rueck = r; SZ.rueckFuer = ev; return r;
}
function szRueckOffen(){ const r = SZ.rueck; return !!(r && r.vorher && ((r.aufgaben || []).some(a => a.status !== 'erledigt') || (r.themen || []).length)); }
function szRueckHtml(r){
  const d = SZ.d; if(!d || !r || !r.vorher) return '';
  const A = r.aufgaben || [], T = r.themen || [], zu = d.stand === 'beendet'; if(!A.length && (!T.length || zu)) return '';
  const offen = A.filter(a => a.status !== 'erledigt'), fertig = A.length - offen.length, ueber = offen.filter(a => a.ueber).length;
  return `<section class="sz-rb" aria-label="Seit der letzten Sitzung"><h2 class="sz-rb-h">Seit der letzten Sitzung<small>${szE(szKurzDatum(r.vorher.datum))}</small></h2>
    ${A.length ? `<p class="sz-rb-z"><b>${offen.length}</b> ${offen.length === 1 ? 'Aufgabe' : 'Aufgaben'} offen${ueber ? `, davon <b class="rot">${ueber} überfällig</b>` : ''}${fertig ? ` · <b>${fertig}</b> erledigt` : ''}</p>
    <ul class="sz-rb-l">${A.map(a => { const ok = a.status === 'erledigt'; return `<li class="${ok ? 'ok' : a.ueber ? 'ueber' : ''}"><button type="button" class="sz-hk" data-sz-hk="${szE(a.id)}" aria-pressed="${ok}" aria-label="${ok ? 'Wieder öffnen' : 'Erledigt'}: ${szE(a.titel)}"${zu ? ' disabled' : ''}>${ok ? '✓' : ''}</button>
      <span><b>${szE(a.titel)}</b><small>${szE([a.wer_name, a.faellig ? 'bis ' + szKurzDatum(a.faellig) : '', a.thema ? 'Thema: ' + a.thema : ''].filter(Boolean).join(' · '))}</small></span></li>`; }).join('')}</ul>` : ''}
    ${T.length && !zu ? `<div class="sz-rb-t"><p class="sz-rb-z"><b>${T.length}</b> ${T.length === 1 ? 'Thema blieb' : 'Themen blieben'} offen oder vertagt</p>
    <ul class="sz-rb-l">${T.map(t => `<li><span><b>${szE(t.titel)}</b><small>${t.status === 'vertagt' ? 'vertagt' : 'nicht besprochen'}${(t.von || []).length ? ' · von ' + szE(t.von.map(szVorname).join(', ')) : ''}</small></span><button type="button" class="btn ghost" data-sz-ueb="${szE(t.id)}">Übernehmen</button></li>`).join('')}</ul>
    ${T.length > 1 ? `<div class="sz-zeile"><button type="button" class="btn ghost" data-sz-ueb="alle">Alle ${T.length} übernehmen</button></div>` : ''}</div>` : ''}</section>`;
}
function szRueckDraht(box){
  const neu = () => { const v = document.getElementById('szVoll'); if(!v) return; const y = v.scrollTop; szRender(); v.scrollTop = y; };
  box.querySelectorAll('[data-sz-hk]').forEach(b => b.onclick = async () => { const an = b.getAttribute('aria-pressed') !== 'true'; b.disabled = true; await szAllesSichern();
    const { error } = await SVB.sb.rpc('sitzung_aufgabe_haken', { p_id:b.dataset.szHk, p_erledigt:an }); if(error){ b.disabled = false; kToast('⚠️ ' + error.message); return; }
    kToast(an ? '✓ Erledigt' : 'Wieder offen'); await szRueckLaden(true); neu(); });
  box.querySelectorAll('[data-sz-ueb]').forEach(b => b.onclick = async () => { const ids = b.dataset.szUeb === 'alle' ? ((SZ.rueck || {}).themen || []).map(t => t.id) : [b.dataset.szUeb]; if(!ids.length) return; b.disabled = true; await szAllesSichern();
    const { error } = await SVB.sb.rpc('sitzung_uebernehmen', { p_event:SZ.id, p_themen:ids }); if(error){ b.disabled = false; kToast('⚠️ ' + error.message); return; }
    kToast(ids.length === 1 ? '✓ Steht auf der Agenda' : '✓ ' + ids.length + ' Themen stehen auf der Agenda'); await szRueckLaden(true); await szNeu(); });
}
function szWerHtml(d){
  if(d.stand === 'beendet' || (d.teilnehmer || []).length < 2) return '';
  const n = {}; d.themen.forEach(t => t.von.forEach(x => { n[x.id] = (n[x.id] || 0) + 1; }));
  const da = d.teilnehmer.filter(p => n[p.id]), fehlt = d.teilnehmer.filter(p => !n[p.id]);
  if(!da.length) return '<p class="sz-wer" id="szWer">Noch hat niemand Themen eingereicht.</p>';
  return `<p class="sz-wer" id="szWer">Themen von ${da.map(p => szE(szVorname(p.name)) + ' (' + n[p.id] + ')').join(', ')}.${fehlt.length ? ' Noch nichts von ' + fehlt.map(p => szE(szVorname(p.name))).join(', ') + '.' : ''}</p>`;
}
/* Agenda: oben Start, wer eingereicht hat und der Rückblick */
{ const _a = szAgenda; szAgenda = function(B){ const r = _a.apply(this, arguments); try{ szAgendaMehr(B); }catch(e){ console.warn(e); } return r; }; }
function szAgendaMehr(B){
  const d = SZ.d; if(!d || !B || B.querySelector('#szMehr')) return; const zu = d.stand === 'beendet', ev = SZ.id;
  const k = document.createElement('div'); k.id = 'szMehr';
  k.innerHTML = (!zu && d.themen.length ? `<div class="sz-start"><button type="button" class="btn" id="szLos">${szI('clock')} ${d.themen.some(t => t.status !== 'offen') ? 'Weiter durchgehen' : 'Sitzung starten'}</button><span>Thema für Thema, mit Ergebnis und Aufgaben</span></div>` : '') + szWerHtml(d) + '<div id="szRb"></div>';
  B.insertBefore(k, B.firstChild);
  const los = k.querySelector('#szLos'); if(los) los.onclick = async () => { await szRueckLaden(); szLaufStart(); };
  const rb = k.querySelector('#szRb'), mal = () => { if(!document.body.contains(rb) || SZ.id !== ev) return; rb.innerHTML = szRueckHtml(SZ.rueck); szRueckDraht(rb); };
  if(SZ.rueckFuer === ev) mal(); else szRueckLaden().then(mal);
}
/* Durchgehen */
function szLaufStart(){
  const d = SZ.d; if(!d || d.stand === 'beendet') return; const F = szFolge(d), erstes = F.find(t => t.status === 'offen');
  SZ.lauf = szRueckOffen() && !F.some(t => t.status !== 'offen') ? 'rueck' : erstes ? erstes.id : 'ende';
  if(!SZ.laufSeit) SZ.laufSeit = Date.now(); SZ.tab = 'agenda'; szRender(); const v = document.getElementById('szVoll'); if(v) v.scrollTop = 0;
}
{ const _r = szRender; szRender = function(){ const r = _r.apply(this, arguments); try{ if(SZ.lauf != null && SZ.tab === 'agenda') szLauf(); }catch(e){ console.warn(e); } return r; }; }
{ const _o = szOeffnen; szOeffnen = function(){ SZ.lauf = null; SZ.laufSeit = 0; SZ.rueck = null; SZ.rueckFuer = null; return _o.apply(this, arguments); }; }
function szLauf(){
  const v = document.getElementById('szVoll'), d = SZ.d, B = v && v.querySelector('#szB'); if(!B || !d) return;
  if(d.stand === 'beendet'){ SZ.lauf = null; return; }
  const F = szFolge(d), n = F.length; let i = F.findIndex(t => t.id === SZ.lauf);
  if(SZ.lauf !== 'rueck' && SZ.lauf !== 'ende' && i < 0){ SZ.lauf = n ? F[0].id : 'ende'; i = n ? 0 : -1; }   // das Thema wurde inzwischen entfernt
  const min = Math.max(0, Math.round((Date.now() - SZ.laufSeit) / 60000)), durch = F.filter(t => t.status !== 'offen').length;
  let h = `<div class="sz-lf" id="szLf"><div class="sz-lf-k"><button type="button" class="btn ghost" id="szLfZu">Zur Übersicht</button><span class="sz-lf-z">${durch} von ${n} durch${min ? ' · seit ' + min + ' Min' : ''}</span></div>
    <div class="sz-lf-bal" role="progressbar" aria-valuemin="0" aria-valuemax="${n}" aria-valuenow="${durch}" aria-label="${durch} von ${n} Themen durch"><i style="width:${n ? Math.round(durch / n * 100) : 0}%"></i></div>`;
  if(SZ.lauf === 'rueck'){
    h += `<p class="sz-lf-nr"><i></i>Zuerst</p><h2 class="sz-lf-t">Was ist seit dem letzten Mal passiert?</h2><div id="szRb">${szRueckHtml(SZ.rueck) || '<p class="note">Aus der letzten Sitzung ist nichts offen.</p>'}</div>
      <div class="sz-lf-nav"><button type="button" class="btn" data-sz-lf="vor">${n ? 'Zum ersten Thema' : 'Fertig'}</button></div>`;
  }else if(SZ.lauf === 'ende'){
    const bes = F.filter(t => t.status === 'besprochen').length, ver = F.filter(t => t.status === 'vertagt').length, off = n - bes - ver, auf = F.reduce((s, t) => s + t.aufgaben.length, 0);
    h += `<p class="sz-lf-nr"><i></i>Geschafft</p><h2 class="sz-lf-t">Alle Themen durch</h2>
      <p class="sz-text" id="szLfSum">${bes} besprochen${ver ? ', ' + ver + ' vertagt' : ''}${off ? ', ' + off + ' noch offen' : ''}. ${auf} ${auf === 1 ? 'Aufgabe' : 'Aufgaben'} verteilt.${ver || off ? ' Was offen oder vertagt ist, steht beim nächsten Mal oben zum Übernehmen.' : ''}</p>
      <div class="sz-lf-nav"><button type="button" class="btn ghost" data-sz-lf="zurueck">Zurück</button><button type="button" class="btn" id="szLfProt">${d.leiten ? 'Zum Protokoll und beenden' : 'Protokoll ansehen'}</button></div>`;
  }else{
    const t = F[i], wort = t.von.filter(x => x.wort && szNorm(x.wort) !== szNorm(t.titel));
    h += `<p class="sz-lf-nr" style="--c:${SZ_FARBE[t.bereich] || SZ_FARBE.sonstiges}"><i></i>Thema ${i + 1} von ${n} · ${szE(SZ_B[t.bereich] || 'Sonstiges')}</p>
      <h2 class="sz-lf-t" id="szLfT">${szE(t.titel)}</h2>
      <p class="sz-wann">${t.von.length ? 'von ' + szE(t.von.map(x => szVorname(x.name)).join(', ')) : 'ohne Absender'}${t.von.length > 1 ? ' · von ' + t.von.length + ' Personen eingereicht' : ''}${t.status === 'besprochen' ? ' · schon besprochen' : t.status === 'vertagt' ? ' · vertagt' : ''}</p>
      ${t.text ? `<p class="sz-text">${szE(t.text)}</p>` : ''}
      ${wort.length ? `<div class="sz-wort">${wort.map(x => `${szE(szVorname(x.name))}: „${szE(x.wort)}“`).join('<br>')}</div>` : ''}
      <label class="sz-l" for="szErg${t.id}">Ergebnis <small>für alle, steht im Protokoll</small><span class="sz-ok" data-sz-ok="e:${t.id}" aria-live="polite"></span></label>
      <textarea class="sz-papier" id="szErg${t.id}" data-sz-erg="${t.id}" maxlength="6000" placeholder="Was wurde besprochen, was beschlossen?">${szE(t.ergebnis || '')}</textarea>
      <div class="sz-l">Aufgaben <small>wer macht was bis wann</small></div>
      ${t.aufgaben.length ? `<ul class="sz-auf">${t.aufgaben.map(a => `<li><span>${a.status === 'erledigt' ? '✓ ' : ''}${szE(a.titel)}</span><small>${szE(a.wer_name || '')}${a.faellig ? ', bis ' + szE(szKurzDatum(a.faellig)) : ''}</small></li>`).join('')}</ul>` : ''}
      <div class="sz-neu"><input type="text" data-sz-at="${t.id}" maxlength="200" placeholder="Neue Aufgabe" aria-label="Neue Aufgabe" autocomplete="off">
        <select data-sz-aw="${t.id}" aria-label="Zuständig">${d.teilnehmer.map(p => `<option value="${p.id}"${p.id === d.ich ? ' selected' : ''}>${szE(p.name)}</option>`).join('')}${d.teilnehmer.some(p => p.id === d.ich) ? '' : `<option value="${d.ich}" selected>Ich</option>`}</select>
        <input type="date" data-sz-af="${t.id}" aria-label="Bis wann"><button type="button" class="btn ghost" data-sz-aneu="${t.id}">Anlegen</button></div>
      <details class="sz-lf-not"${t.notiz ? ' open' : ''}><summary>Deine Notiz <small>siehst nur du</small><span class="sz-ok" data-sz-ok="n:${t.id}" aria-live="polite"></span></summary>
        <textarea class="sz-papier mein" data-sz-not="${t.id}" maxlength="8000" aria-label="Deine Notiz" placeholder="Gedanken, Rückfragen, was du dir merken willst">${szE(t.notiz || '')}</textarea></details>
      <div class="sz-lf-nav"><button type="button" class="btn ghost" data-sz-lf="zurueck">Zurück</button><button type="button" class="btn ghost" data-sz-lf="vertagt">Vertagen</button><button type="button" class="btn" data-sz-lf="besprochen">Besprochen, weiter</button></div>`;
  }
  B.innerHTML = h + '</div>';
  const oben = () => { const x = document.getElementById('szVoll'); if(x) x.scrollTop = 0; };
  B.querySelector('#szLfZu').onclick = () => { szAllesSichern(); SZ.lauf = null; szRender(); };
  const rb = B.querySelector('#szRb'); if(rb) szRueckDraht(rb);
  const prot = B.querySelector('#szLfProt'); if(prot) prot.onclick = () => { SZ.lauf = null; SZ.tab = 'protokoll'; szRender(); oben(); };
  const t = i >= 0 ? F[i] : null;
  B.querySelectorAll('[data-sz-erg]').forEach(x => szTippen(x, 'e:' + x.dataset.szErg, () => szErgebnis(x.dataset.szErg, x.value), () => { if(t) t.ergebnis = x.value; }));
  B.querySelectorAll('[data-sz-not]').forEach(x => szTippen(x, 'n:' + x.dataset.szNot, () => szNotiz(x.dataset.szNot, x.value), () => { if(t) t.notiz = x.value; }));
  const aufgabe = async () => { if(!t) return true; const ti = B.querySelector(`[data-sz-at="${t.id}"]`), wer = B.querySelector(`[data-sz-aw="${t.id}"]`), bis = B.querySelector(`[data-sz-af="${t.id}"]`); if(!ti || !ti.value.trim()) return true;
    const { error } = await SVB.sb.rpc('sitzung_aufgabe', { p_thema:t.id, p_titel:ti.value, p_wer:wer.value, p_faellig:bis.value || null }); if(error){ kToast('⚠️ ' + error.message); return false; } ti.value = ''; return true; };
  B.querySelectorAll('[data-sz-aneu]').forEach(b => b.onclick = async () => { const ti = B.querySelector(`[data-sz-at="${t.id}"]`); if(!ti.value.trim()){ ti.focus(); return; } b.disabled = true; await szAllesSichern();
    const gut = await aufgabe(); b.disabled = false; if(!gut) return; kToast('✓ Aufgabe angelegt. Sie steht bei den To-dos.'); await szNeu(); });
  B.querySelectorAll('[data-sz-lf]').forEach(b => b.onclick = async () => { const w = b.dataset.szLf;
    if(w === 'vor'){ const e = F.find(x => x.status === 'offen') || F[0]; SZ.lauf = e ? e.id : 'ende'; szRender(); oben(); return; }
    if(w === 'zurueck'){ await szAllesSichern(); SZ.lauf = SZ.lauf === 'ende' ? (n ? F[n - 1].id : 'rueck') : i > 0 ? F[i - 1].id : (szRueckHtml(SZ.rueck) ? 'rueck' : SZ.lauf); szRender(); oben(); return; }
    if(!t) return; b.disabled = true; await szAllesSichern();
    if(!(await aufgabe())){ b.disabled = false; return; }   // eine angefangene Aufgabe geht beim Weitergehen nicht verloren
    const { error } = await SVB.sb.rpc('sitzung_thema_setzen', { p_id:t.id, p:{ status:w } }); if(error){ b.disabled = false; kToast('⚠️ ' + error.message); return; }
    SZ.lauf = i + 1 < n ? F[i + 1].id : 'ende'; await szNeu(); oben(); });
}

/* =====================================================================
   Beta 0.99.45 · Neuer Nutzer für die Leitung (Albert, 16.11.2026)
   „Ich hätte sie gerne als Pop-up neuer User. Ich will das nicht direkt bestätigen können aus dem Pop-up heraus, sondern wenn ich
    auf das Pop-up klicke, öffnet er mir für genau den User erst einmal die Übersicht. Und wenn ich ihn bestätigt habe, kommt
    ‚Spieler bestätigt‘, und ich kann auf Übersicht gehen und sehe die anderen, die noch warten.“
   - Die Mitteilung „Neuer Nutzer“ (169_zugang_popup.sql) hat keine Ja/Nein-Knöpfe. Ein Tipp öffnet den Korb dieser Anfrage (zgKorb, svm91.js).
   - Karte „Neue Nutzer“ oben auf der Startseite der Leitung: wer wartet, ein Tipp öffnet den Korb.
   - Nach dem Bestätigen: Blatt mit „… bestätigt“ und den übrigen Wartenden (zgFertigZeigen, von svm91.js aufgerufen).
   Freigegeben wird nur im Korb, nie aus der Mitteilung oder der Karte heraus.
   ===================================================================== */
const ZH = { L:[], am:0, laeuft:false };
const zhE = s => (typeof svEsc === 'function' ? svEsc(s) : String(s == null ? '' : s).replace(/[&<>"']/g, c => ({ '&':'&amp;', '<':'&lt;', '>':'&gt;', '"':'&quot;', "'":'&#39;' }[c])));
async function zhLaden(neu){
  if(typeof canManage !== 'function' || !canManage() || !(typeof SVB !== 'undefined' && SVB.sb)) { ZH.L = []; return ZH.L; }
  if(!neu && Date.now() - ZH.am < 20000) return ZH.L;
  try{ const { data, error } = await SVB.sb.rpc('zugang_liste2'); if(error) throw error; ZH.L = (data || []).filter(a => !a.frei); ZH.am = Date.now(); }
  catch(e){ ZH.L = []; }
  return ZH.L;
}
function zhZeit(a){ try{ return typeof svAgo === 'function' ? svAgo(a) : ''; }catch(e){ return ''; } }
async function zhKarte(neu){
  const home = document.getElementById('panel-home'); if(!home) return;
  await zhLaden(neu); let k = document.getElementById('zgHome');
  if(!ZH.L.length){ if(k) k.remove(); return; }
  if(!k){ k = document.createElement('section'); k.id = 'zgHome'; k.className = 'card zh-karte'; k.setAttribute('aria-label', 'Neue Nutzer'); home.appendChild(k); }
  const html = `<div class="sechead" style="margin:0 0 6px">${ZH.L.length === 1 ? 'Neuer Nutzer wartet' : ZH.L.length + ' neue Nutzer warten'}</div>
    <div class="zh-liste">${ZH.L.slice(0, 5).map(a => `<button type="button" class="zh-z" data-zh="${zhE(a.id)}"><span class="zh-av" aria-hidden="true">${zhE((String(a.name || a.email).trim()[0] || '?').toUpperCase())}</span>
      <span class="zh-tx"><b>${zhE(a.name || a.email)}</b><small>${zhE(zhZeit(a.am))}${a.tel ? ' · ' + zhE(a.tel) : ''}</small></span><span class="zh-go" aria-hidden="true">›</span></button>`).join('')}</div>
    ${ZH.L.length > 5 ? `<p class="zh-mehr">und ${ZH.L.length - 5} weitere</p>` : ''}
    <div class="btnrow"><button type="button" class="btn ghost" data-zh-alle>Alle ansehen</button></div>`;
  if(k.dataset.h !== html){ k.dataset.h = html; k.innerHTML = html;
    k.querySelectorAll('[data-zh]').forEach(b => b.onclick = () => zhOeffnen(b.dataset.zh));
    const al = k.querySelector('[data-zh-alle]'); if(al) al.onclick = () => zhUebersicht(); }
}
function zhOeffnen(id){ if(typeof zgKorb === 'function') zgKorb(id); }
function zhUebersicht(){ try{ if(typeof closeOverlay === 'function') closeOverlay(); }catch(e){} try{ goTab('admin'); }catch(e){} }
if(typeof renderHome === 'function'){ const _rh113 = renderHome; renderHome = function(){ const r = _rh113.apply(this, arguments); try{ zhKarte(false); }catch(e){} return r; }; }
setInterval(() => { try{ if(document.visibilityState === 'visible' && typeof canManage === 'function' && canManage() && document.getElementById('panel-home')) zhKarte(true); }catch(e){} }, 60000);

/* ---------- Nach dem Bestätigen: „Spieler bestätigt“ und die übrigen Wartenden ---------- */
async function zgFertigZeigen(P, rolleTitel, fehl, mail, id){
  const L = (await zhLaden(true)).filter(a => a.id !== id), name = (P && (P.name || P.email)) || 'Die Person';
  const M = svModal(`<div class="zh-fertig"><svg class="zh-haken" viewBox="0 0 52 52" aria-hidden="true"><circle cx="26" cy="26" r="23"/><path d="M15 27l8 8 15-17"/></svg>
    <h2>${zhE(rolleTitel)} bestätigt</h2>
    <p class="zh-sub">${zhE(name)} ist freigeschaltet${mail ? zhE(mail) : ''}.</p>
    ${fehl && fehl.length ? `<p class="zk-hinweis">Nicht gesetzt: ${zhE(fehl.join(', '))}. Das lässt sich unter Nutzer & Rollen nachholen.</p>` : ''}
    ${L.length ? `<h3 class="zh-h">${L.length === 1 ? 'Noch einer wartet' : 'Noch ' + L.length + ' warten'}</h3><div class="zh-liste">${L.slice(0, 5).map(a => `<button type="button" class="zh-z" data-zh="${zhE(a.id)}"><span class="zh-av" aria-hidden="true">${zhE((String(a.name || a.email).trim()[0] || '?').toUpperCase())}</span><span class="zh-tx"><b>${zhE(a.name || a.email)}</b><small>${zhE(zhZeit(a.am))}</small></span><span class="zh-go" aria-hidden="true">›</span></button>`).join('')}</div>`
      : '<p class="zh-sub">Es wartet niemand mehr.</p>'}
    <div class="btnrow"><button type="button" class="btn" data-zh-ue>Übersicht</button><button type="button" class="btn ghost" data-zh-ok>Fertig</button></div></div>`);
  M.querySelectorAll('[data-zh]').forEach(b => b.onclick = () => { const i = b.dataset.zh; closeOverlay(); setTimeout(() => zhOeffnen(i), 80); });
  M.querySelector('[data-zh-ue]').onclick = () => zhUebersicht();
  M.querySelector('[data-zh-ok]').onclick = () => closeOverlay();
  try{ zhKarte(true); }catch(e){}
}

/* ---------- Mitteilung „Neuer Nutzer“: ein Knopf, der die Anfrage öffnet, sonst nichts ---------- */
if(typeof svzInhalt === 'function'){ const _zi113 = svzInhalt; svzInhalt = async function(m){ const x = await _zi113.apply(this, arguments);
  try{ const d = (m && m.data) || {}; if(d.typ === 'zugang' && /^[0-9a-f-]{36}$/i.test(d.anfrage || '')) x.knopf = `<button class="btn" type="button" data-zhm="${zhE(d.anfrage)}">Anfrage ansehen</button>`; }catch(e){} return x; }; }
if(typeof svMeldungZeigen === 'function'){ const _mz113 = svMeldungZeigen; svMeldungZeigen = async function(){ const r = await _mz113.apply(this, arguments);
  try{ document.querySelectorAll('#modal [data-zhm]').forEach(b => b.onclick = () => { const i = b.dataset.zhm; closeOverlay(); setTimeout(() => zhOeffnen(i), 80); }); }catch(e){} return r; }; }
const ZH_START = (() => { try{ return location.hash; }catch(e){ return ''; } })();
function zhAusAdresse(h){ const m = /^#?zugang=([0-9a-f-]{36})$/i.exec(String(h || '')); if(!m) return false; const t0 = Date.now();
  const los = () => { const g = document.getElementById('gate'); if(typeof _remoteDone !== 'undefined' && _remoteDone && g && g.classList.contains('done')) zhOeffnen(m[1]); else if(Date.now() - t0 < 60000) setTimeout(los, 400); }; los(); return true; }
if(typeof svZiel === 'function'){ const _z113 = svZiel; svZiel = function(h){ if(zhAusAdresse(h)) return Promise.resolve(true); return _z113.apply(this, arguments); }; }
window.addEventListener('hashchange', e => { let h = ''; try{ h = new URL(e.newURL).hash; }catch(x){ h = location.hash; }
  if(/^#zugang=/.test(h)){ try{ history.replaceState(history.state, '', location.pathname + location.search); }catch(x){} zhAusAdresse(h); } });
if(navigator.serviceWorker) navigator.serviceWorker.addEventListener('message', e => { const t = e.data && e.data.svbcZiel; if(typeof t === 'string') zhAusAdresse(t); });
if(/^#zugang=/.test(ZH_START)) zhAusAdresse(ZH_START);

(function(){ try{ const s=document.createElement('style'); s.id='svm113css'; s.textContent=".zh-karte .zh-liste,.zh-fertig .zh-liste{display:grid;gap:8px;margin-top:6px}\n.zh-z{display:flex;align-items:center;gap:12px;width:100%;text-align:left;background:rgba(148,163,196,.08);border:1px solid rgba(148,163,196,.2);border-radius:14px;padding:10px 12px;color:inherit;font:inherit;cursor:pointer;min-height:56px}\n.zh-z:hover{background:rgba(91,155,255,.12);border-color:rgba(91,155,255,.4)}\n.zh-av{flex:none;width:38px;height:38px;border-radius:12px;display:grid;place-items:center;font-weight:800;color:#fff;background:#2a5fe6}\n.zh-tx{display:flex;flex-direction:column;min-width:0;flex:1}.zh-tx b{font-size:15px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}.zh-tx small{opacity:.7;font-size:12.5px}\n.zh-go{opacity:.5;font-size:22px}.zh-mehr{margin:8px 2px 0;opacity:.7;font-size:13.5px}\n.zh-fertig{display:grid;gap:12px;justify-items:center;text-align:center}.zh-fertig .btnrow{justify-content:center;margin-top:6px}.zh-fertig .zh-liste{width:100%;text-align:left}\n.zh-fertig h2{margin:0}.zh-sub{margin:0;opacity:.8}.zh-h{margin:6px 0 0;font-size:15px;opacity:.85}\n.zh-haken{width:72px;height:72px;fill:none;stroke:#3ecf8e;stroke-width:3;stroke-linecap:round;stroke-linejoin:round}\n.zh-haken circle{stroke-dasharray:145;stroke-dashoffset:145;animation:zhz .8s ease .05s forwards}.zh-haken path{stroke-dasharray:40;stroke-dashoffset:40;animation:zhz .45s ease .7s forwards}\n@keyframes zhz{to{stroke-dashoffset:0}}\n@media (prefers-reduced-motion:reduce){.zh-haken circle,.zh-haken path{animation:none;stroke-dashoffset:0}}\n"; document.head.appendChild(s); }catch(e){} })();
/* =====================================================================
   Beta 0.99.52 · Die echte App für alle (Albert, 16.11.2026)
   „Ich will die Leute auf die Android und auf die Apple native App einfach drauf haben.“
   - Wer die Sportzentrale im Browser oder als Startbildschirm-Symbol am Handy nutzt, bekommt auf der Startseite eine ruhige Karte
     „Hol dir die echte App“. Der Browser-Zugang bleibt, wie er ist (iPhone-Nutzer arbeiten schon damit weiter).
   - Ob der Weg für Android oder iPhone offen ist, kommt wie auf /test.html aus app_test_stand() (ohne neue Version umstellbar).
   - Der Knopf führt auf /test.html?direkt=1: ohne Formular, der Zugang besteht ja schon.
   - Die Karte erscheint nie in der Store-App selbst und nie am Computer. „Später“ blendet sie 14 Tage aus (je Gerät).
   ===================================================================== */
const ST114 = { d:null, am:0, l:null };
function s114Geraet(){ try{ const ua = navigator.userAgent || ''; if(/iPhone|iPod/.test(ua)) return 'ios'; if(/iPad/.test(ua) || (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1)) return 'ios'; if(/Android/.test(ua)) return 'android'; }catch(e){} return null; }
function s114Nativ(){ try{ return !!(typeof SVN !== 'undefined' && SVN.nativ); }catch(e){ return false; } }
async function s114Stand(){
  if(ST114.d && Date.now() - ST114.am < 10 * 60000) return ST114.d;
  if(ST114.l) return ST114.l;
  ST114.l = (async () => { try{ if(!(typeof SVB !== 'undefined' && SVB.sb)) return ST114.d; const { data, error } = await SVB.sb.rpc('app_test_stand'); if(error) throw error; if(data && typeof data === 'object'){ ST114.d = data; ST114.am = Date.now(); } }catch(e){} return ST114.d; })();
  try{ return await ST114.l; } finally { ST114.l = null; }
}
// Ist für dieses Handy ein Weg zur echten App offen? Gibt 'ios', 'android' oder '' zurück.
async function s114Offen(){
  if(s114Nativ()) return '';
  const g = s114Geraet(); if(!g) return '';
  const d = await s114Stand(); if(!d) return '';
  if(g === 'ios') return (d.ios === 'offen' && d.testflight) ? 'ios' : '';
  return (d.android === 'offen' && d.gruppe) ? 'android' : '';
}
function s114Link(g){ return 'test.html?geraet=' + encodeURIComponent(g) + '&direkt=1'; }
function s114Zu(g){ try{ const t = +localStorage.getItem('sv_store_zu:' + g) || 0; return Date.now() < t; }catch(e){ return false; } }
function s114Merk(g, tage){ try{ localStorage.setItem('sv_store_zu:' + g, String(Date.now() + tage * 864e5)); }catch(e){} }
async function s114Karte(){
  const home = document.getElementById('panel-home'); if(!home) return;
  const ok = (typeof SVU !== 'undefined' && SVU && SVU.id);
  const g = ok ? await s114Offen() : '';
  let k = document.getElementById('appStore');   // erst nach dem Warten suchen, sonst legen zwei gleichzeitige Läufe zwei Karten an
  if(!g || s114Zu(g)){ if(k) k.remove(); return; }
  if(!k){ k = document.createElement('section'); k.id = 'appStore'; k.className = 'card s114-karte'; k.setAttribute('aria-label', 'Die echte App'); home.appendChild(k); }
  const store = g === 'ios' ? 'TestFlight' : 'Google Play';
  const html = `<div class="s114-kopf"><img src="icon-192.png" alt="" width="44" height="44"><div><b>Hol dir die echte App</b>
    <small>${g === 'ios' ? 'Aufs iPhone über TestFlight' : 'Auf dein Android-Handy über Google Play'}. Mitteilungen kommen zuverlässig an, die App startet sofort und bleibt angemeldet.</small></div></div>
    <p class="s114-p">Dein Zugang bleibt derselbe. Melde dich in der App einfach mit deiner E-Mail an. Der Browser geht weiter wie bisher.</p>
    <div class="s114-akt"><a class="btn" href="${svEsc(s114Link(g))}" data-s114="los">App über ${store} holen</a><button type="button" class="btn ghost" data-s114="spaeter">Später</button></div>`;
  if(k.dataset.h !== html){ k.dataset.h = html; k.innerHTML = html;
    const sp = k.querySelector('[data-s114="spaeter"]'); if(sp) sp.onclick = () => { s114Merk(g, 14); k.remove(); };
    const lo = k.querySelector('[data-s114="los"]'); if(lo) lo.onclick = () => { try{ if(typeof n2Ev === 'function') n2Ev('a:store:holen:' + g); }catch(e){} }; }
}
if(typeof renderHome === 'function'){ const _rh114 = renderHome; renderHome = function(){ const r = _rh114.apply(this, arguments); try{ s114Karte(); }catch(e){} return r; }; }

(function(){ try{ const s=document.createElement('style'); s.id='svm114css'; s.textContent=".s114-karte{display:grid;gap:10px;border:1px solid rgba(91,155,255,.4);background:linear-gradient(180deg,rgba(47,107,255,.14),rgba(47,107,255,.04))}\n.s114-kopf{display:flex;gap:12px;align-items:flex-start}\n.s114-kopf img{flex:none;border-radius:11px}\n.s114-kopf b{display:block;font-size:17px}\n.s114-kopf small{display:block;color:var(--ink2,#a9b3c7);line-height:1.4;margin-top:2px}\n.s114-p{margin:0;font-size:14px;color:var(--ink2,#a9b3c7)}\n.s114-akt{display:grid;grid-template-columns:1fr auto;gap:8px;align-items:center}\n.s114-akt .btn{min-height:48px;justify-content:center;text-decoration:none}\n"; document.head.appendChild(s); }catch(e){} })();
/* =====================================================================
   Beta 0.99.54 · Das Menü „Mehr“ nach Bereichen, als Ordner
   Albert, 16.11.2026: „Eine schlanke App, nur was wirklich notwendig ist. Die Bereiche wie im Konzept, und wenn man mehr will, geht man in
   den Ordner: Senioren (mit Kaderplanung), Jugend, Veranstaltungen.“ Vorher standen rund 20 Knöpfe in sechs Gruppen nach Werkzeug.
   Jetzt: „Übersicht“ bleibt offen, jeder Bereich ist eine Zeile, ein Tipp klappt den Ordner auf (immer nur einer). Die Knöpfe selbst
   und ihre Rechte ändern sich nicht (sv4NavVis, n77Koepfe); diese Datei sortiert nur um und klappt zu.
   Neuer Bereich oder neue Seite: in S115_BEREICHE eintragen. Was dort fehlt, landet wie bisher in der letzten Gruppe (svm77).
   ===================================================================== */
const S115_BEREICHE = [
  ['Übersicht',     ['home', 'planung', 'kalender', 'sptag']],
  ['Senioren',      ['mann1', 'mann2', 'somainakt', 'kader', 'scout']],
  ['Jugend',        ['teams', 'ejugend']],
  ['Spieltag',      ['gegner', 'totw', 'plakat']],
  ['Veranstaltungen', ['veranstaltungen', 'helfer']],
  ['Partner',       ['sponsoring', 'foerderung']],
  ['Verein',        ['verein', 'kasse', 'play']],
  ['Kommunikation', ['studio', 'export']],
  ['Verwaltung',    ['admin', 'pruefung']]
];
const S115 = { offen:null };
(function(){
  try{
    Object.keys(N77_GRP).forEach(k => { delete N77_GRP[k]; });
    S115_BEREICHE.forEach(([g, l]) => { N77_GRP[g] = l.slice(); });
    const namen = S115_BEREICHE.map(x => x[0]);
    N77_SEITE.splice(0, N77_SEITE.length, ...namen); N77_MENUE.splice(0, N77_MENUE.length, ...namen);
  }catch(e){ console.warn('Bereiche 0.99.54', e); }
})();
function s115Zu(sh){ sh.querySelectorAll(':scope > h4[data-s115]').forEach(h => { const g = h.nextElementSibling; const auf = S115.offen === h.dataset.n77g;
  h.setAttribute('aria-expanded', auf ? 'true' : 'false'); if(g) g.classList.toggle('s115-zu', !auf); }); }
function s115Klick(h){
  const sh = document.getElementById('moreSheet'); if(!sh) return;
  S115.offen = S115.offen === h.dataset.n77g ? null : h.dataset.n77g; s115Zu(sh);
  if(S115.offen){ setTimeout(() => { try{ h.scrollIntoView({ block:'nearest', behavior:'smooth' }); }catch(e){} }, 30); }
}
function s115Falten(){
  if(navigator.webdriver && !window.S115_TEST) return;   // automatische Tests der älteren Runden sehen alle Knöpfe wie bisher (window.S115_TEST schaltet die Ordner ein)
  const sh = document.getElementById('moreSheet'); if(!sh) return;
  sh.querySelectorAll(':scope > h4[data-n77g]').forEach(h => {
    if(h.dataset.n77g === 'Übersicht' || h.dataset.s115) return;
    const g = h.nextElementSibling; if(!g || !g.classList.contains('sgrid')) return;
    h.dataset.s115 = '1'; h.setAttribute('role', 'button'); h.tabIndex = 0;
    h.addEventListener('click', () => s115Klick(h));
    h.addEventListener('keydown', e => { if(e.key === 'Enter' || e.key === ' '){ e.preventDefault(); s115Klick(h); } });
  });
  s115Zu(sh);
}
{ const _m = n77Menue; n77Menue = function(){ const r = _m.apply(this, arguments); try{ s115Falten(); }catch(e){ console.warn('Bereiche 0.99.54', e); } return r; }; }
// Beim Öffnen des Menüs sind alle Ordner zu
{ const _s = svSheet; svSheet = function(open){ if(open) S115.offen = null; return _s.apply(this, arguments); }; }

/* ---------- Wappen beim Wechsel (Albert, 16.11.2026: „so 2 Millisekunden, wenn der Bildschirm wechselt“) ----------
   Ein kurzer Übergang über dem Inhalt: Wappen mit den zwei Ringen aus dem Ladebildschirm, rund 0,3 Sekunden, ohne den Inhalt zu blockieren
   (pointer-events: none). Aus bei „Bewegung reduzieren“ und in automatischen Tests (window.S115_TEST schaltet ihn dort ein). */
function s115Ueberblenden(){
  try{
    if(matchMedia('(prefers-reduced-motion:reduce)').matches) return;
    if(navigator.webdriver && !window.S115_TEST) return;
    const pn = document.querySelector('.panel.active'); if(!pn) return;
    const r = pn.getBoundingClientRect(), top = Math.max(r.top, 0), bot = Math.min(r.bottom, innerHeight - (document.getElementById('tabbar') ? document.getElementById('tabbar').getBoundingClientRect().height : 0));
    let o = document.getElementById('s115Ueb');
    if(!o){ o = document.createElement('div'); o.id = 's115Ueb'; o.setAttribute('aria-hidden', 'true'); o.innerHTML = '<div class="s115-l"><i></i><i class="b"></i><img src="logo.png" alt=""></div>'; document.body.appendChild(o); }
    o.style.cssText = `left:${Math.max(r.left, 0)}px;width:${Math.min(r.width, innerWidth)}px;top:${top}px;height:${Math.max(bot - top, 0)}px;background:${getComputedStyle(document.body).backgroundColor}`;
    o.classList.remove('an'); void o.offsetWidth; o.classList.add('an');
  }catch(e){}
}
{ const _g = goTab; goTab = function(tab){ let von = null; try{ von = svCurTab(); }catch(e){} const r = _g.apply(this, arguments); try{ if(von !== svCurTab()) s115Ueberblenden(); }catch(e){} return r; }; }

/* ---------- Updates nur bei großen neuen Funktionen (Albert, 16.11.2026) ----------
   Das Fenster „Was ist neu“ kam nach jedem Update. Jetzt nur, wenn unter den noch nicht gesehenen Versionen eine mit `gross: true` ist
   (neue Funktion, die man merkt). Alles andere gilt still als gesehen. „Was ist neu“ bleibt im Menü, die Historie bleibt vollständig. */
function s115Gross(){
  try{ const g = spSeen(); if(!g) return false; const k = spIdx(g); if(k >= 1e9) return false;
    return SV_PATCHES.slice(0, k).some(p => p && p.gross); }catch(e){ return false; }
}
{ const _p = spPopup; spPopup = function(force){
    if(!force && !s115Gross()){ try{ if(spSeen() !== SV_PATCH_LATEST) spMark(); }catch(e){} return; }
    return _p.apply(this, arguments); }; }
try{ n77Ordnen(); }catch(e){}

(function(){ try{ const s=document.createElement('style'); s.id='svm115css'; s.textContent="/* Beta 0.99.54 · Mehr-Menü: Bereiche als Ordner */\n#moreSheet > h4[data-s115]{display:flex;align-items:center;justify-content:space-between;gap:10px;cursor:pointer;min-height:48px;margin:6px 0 0!important;padding:0 14px;font-size:16px!important;font-weight:650;letter-spacing:0;text-transform:none!important;border-radius:14px;color:var(--ink)!important;background:var(--card,rgba(148,163,196,.08));border:1px solid var(--line);-webkit-tap-highlight-color:transparent;user-select:none;}\n#moreSheet > h4[data-s115]::before{display:none!important;}\n#moreSheet > h4[data-s115]::after{content:\"\";width:8px;height:8px;border-right:2px solid currentColor;border-bottom:2px solid currentColor;transform:rotate(45deg) translateY(-2px);opacity:.55;transition:transform .18s ease;flex:none;}\n#moreSheet > h4[data-s115][aria-expanded=\"true\"]{color:var(--ink)!important;}\n#moreSheet > h4[data-s115][aria-expanded=\"true\"]::after{transform:rotate(-135deg) translateY(-2px);}\n#moreSheet > h4[data-s115]:focus-visible{outline:2px solid var(--brand2);outline-offset:2px;}\n#moreSheet > .sgrid.s115-zu{display:none!important;}\n#moreSheet > h4[data-s115][aria-expanded=\"true\"] + .sgrid{margin-top:8px;margin-bottom:6px;animation:s115-auf .18s ease-out;}\n@keyframes s115-auf{from{opacity:0;transform:translateY(-6px);}to{opacity:1;transform:none;}}\n@media (prefers-reduced-motion:reduce){#moreSheet > h4[data-s115]::after{transition:none;}#moreSheet > h4[data-s115][aria-expanded=\"true\"] + .sgrid{animation:none;}}\nhtml[data-theme=\"hell\"] #moreSheet > h4[data-s115]{background:#fffdf9;border-color:rgba(30,36,52,.12);}\n\n/* Wappen beim Wechsel */\n#s115Ueb{position:fixed;z-index:40;pointer-events:none;display:flex;align-items:center;justify-content:center;opacity:0;}\n#s115Ueb.an{animation:s115-ueb .34s ease-out;}\n#s115Ueb .s115-l{position:relative;width:76px;height:76px;display:flex;align-items:center;justify-content:center;}\n#s115Ueb .s115-l img{width:44px;height:44px;object-fit:contain;position:relative;}\n#s115Ueb .s115-l i{position:absolute;inset:0;border-radius:50%;border:2px solid rgba(91,155,255,.14);border-top-color:#5b9bff;border-right-color:rgba(91,155,255,.45);animation:s115-spin .7s cubic-bezier(.5,.2,.5,.8) infinite;}\n#s115Ueb .s115-l i.b{inset:9px;border-top-color:transparent;border-bottom-color:rgba(169,156,255,.6);border-left-color:rgba(169,156,255,.25);animation-duration:1s;animation-direction:reverse;}\n@keyframes s115-ueb{0%{opacity:0;}20%{opacity:.97;}62%{opacity:.97;}100%{opacity:0;}}\n@media (prefers-reduced-motion:reduce){#s115Ueb{display:none;}}\n@keyframes s115-spin{to{transform:rotate(360deg);}}\n"; document.head.appendChild(s); }catch(e){} })();
(function(){ try{ const s=document.createElement('style'); s.id='svm107css'; s.textContent="/* 0.99.33: Startseite nach dringend und wichtig (svm107.js) */\n#panel-home > [data-hz-weg]{display:none!important;}\n.hz-k{margin:20px 2px 8px;font-size:12.5px;line-height:1.3;font-weight:800;letter-spacing:.09em;text-transform:uppercase;color:var(--ink2);}\n.hz-k.ruhig{text-transform:none;letter-spacing:0;font-weight:500;font-size:14.5px;margin:8px 2px 14px;}\n#svHello + .hz-k{margin-top:10px;}\n.hz-anp{display:block;width:100%;min-height:46px;margin:14px 0 18px;padding:10px 14px;border-radius:var(--r-lg,14px);border:1px dashed var(--line);background:none;color:var(--ink2);font:inherit;font-size:14px;text-align:center;cursor:pointer;}\n.hz-anp:focus-visible{outline:2px solid var(--accent);outline-offset:2px;}\n/* Der Wisch-Tipp schiebt die Karte „Neue Meldungen“ kurz zur Seite: Das darf die Seite nicht breiter machen */\n#panel-home > #sc2Home{overflow-x:clip;overflow-clip-margin:14px;}\n/* Die Leitung braucht das Lagebild aus Kader, Training und Radar nicht auf der Startseite */\n#panel-home[data-hz=\"leitung\"] #svBriefBtn{display:none!important;}\n\n/* Beta 0.99.38: Startseite kürzer. Ablage in der To-do-Karte als eine Zeile zum Wischen, erledigte erste Schritte eingeklappt. */\n#panel-home #prioHeute .abl{flex-direction:row;align-items:center;gap:10px;min-width:0;}\n#panel-home #prioHeute .abl-k{margin:0;flex:none;}\n#panel-home #prioHeute .abl-l{display:flex;gap:8px;overflow-x:auto;min-width:0;flex:1;scrollbar-width:none;padding:2px;}\n#panel-home #prioHeute .abl-l::-webkit-scrollbar{display:none;}\n#panel-home #prioHeute .abl-o{flex:none;min-height:44px;max-width:230px;padding:6px 14px;border-radius:999px;}\n#panel-home #prioHeute .abl-o small,#panel-home #prioHeute .abl-o .abl-ic{display:none;}\n#panel-home #prioHeute .abl-o b{white-space:nowrap;overflow:hidden;text-overflow:ellipsis;font-size:14px;}\n.o1-liste.o1-kurz li.ok{display:none;}\n.o1-sum{display:flex;align-items:center;gap:8px;width:100%;min-height:44px;margin:10px 0 0;padding:0 12px;border-radius:12px;border:0;background:transparent;color:var(--ink2);font:inherit;font-size:14px;cursor:pointer;text-align:left;}\n.o1-sum span{font-weight:700;color:var(--ink);}.o1-sum small{margin-left:auto;text-decoration:underline;text-underline-offset:3px;}\n.o1-sum svg{width:18px;height:18px;color:var(--green,#1a8f55);flex:none;}\n"; document.head.appendChild(s); }catch(e){} })();
(function(){ try{ const s=document.createElement('style'); s.id='svm92css'; s.textContent="/* Beta 0.99.4 · Fragen mit Ja und Nein */\n.fr-karte{border:1px solid rgba(91,155,255,.45)!important;margin-bottom:14px}\n.fr-h{margin:0 0 10px;font-size:17px}\n.fr-liste{display:flex;flex-direction:column;gap:10px}\n.fr-z{display:grid;grid-template-columns:1fr auto;gap:12px;align-items:center;padding:12px 14px;border-radius:14px;background:var(--surface2,rgba(148,163,196,.08));transition:box-shadow .3s,background .3s}\n.fr-z.fr-hin{box-shadow:0 0 0 2px var(--brand,#2f6bff)}\n.fr-tx{display:flex;flex-direction:column;gap:2px;min-width:0}\n.fr-tx span,.fr-tx small{color:var(--ink3);font-size:13.5px;overflow-wrap:anywhere}\n.fr-akt{display:flex;gap:8px;flex:none}\n.fr-akt .btn{min-height:44px;white-space:nowrap}\n.fr-akt .btn[disabled]{opacity:.5}\n@media (max-width:640px){.fr-z{grid-template-columns:1fr}.fr-akt .btn{flex:1}}\n"; document.head.appendChild(s); }catch(e){} })();
(function(){ try{ const s=document.createElement('style'); s.id='svm80css'; s.textContent="/* ===== Beta 0.82 · Rollen und Bereiche ===== */\n.r80-grid{grid-template-columns:repeat(auto-fill,minmax(250px,1fr));}\n.rolecard.r80{display:flex;flex-direction:column;gap:2px;}\n.r80-dl{margin:4px 0 10px;display:grid;grid-template-columns:auto 1fr;gap:5px 10px;font-size:13px;line-height:1.4;}\n.r80-dl dt{color:var(--ink3);font-weight:700;font-size:11px;letter-spacing:.03em;text-transform:uppercase;padding-top:1px;white-space:nowrap;}\n.r80-dl dd{margin:0;color:var(--ink2);}\n.r80-alles{margin:4px 0 10px;font-size:13px;color:var(--ink2);font-weight:650;}\n.r80-note{margin:-4px 0 10px;}\n.svr-gh{margin:10px 0 0;font-size:11px;font-weight:800;letter-spacing:.05em;text-transform:uppercase;color:var(--ink3);}\n.svr-gh:first-child{margin-top:0;}\n.svr-auf{margin-top:12px;}\n.svr-auf h3{margin:0;font-size:15px;}\n.svr-auf .note{margin:4px 0 10px;}\n.svr-auf-l{display:grid;grid-template-columns:repeat(auto-fill,minmax(190px,1fr));gap:8px;}\n.svr-auf-b{font:inherit;text-align:left;display:flex;flex-direction:column;gap:3px;padding:10px 12px;min-height:44px;border-radius:12px;border:1px solid var(--line);background:rgba(148,163,196,.04);color:inherit;cursor:pointer;}\n.svr-auf-b b{font-size:13.5px;}\n.svr-auf-b span{font-size:13px;color:var(--ink3);}\n.svr-auf-b.on{border-color:var(--brand2);background:rgba(91,155,255,.10);}\n.svr-auf-b.on b::after{content:' ✓';color:var(--ok);}\n.svr-auf-b:disabled{opacity:.55;}\n.svr-vt tr.svr-vg th{padding-top:12px;font-size:11px;font-weight:800;letter-spacing:.05em;text-transform:uppercase;color:var(--ink3);text-align:left;}\n/* Schalter „an“ auch im hellen Design grün (die helle Fassung färbte an und aus gleich grau) */\nhtml[data-theme=\"hell\"] .svr-sw.on,.svr-sw.on{background:#16a34a;}\n/* 0.83 · Funktionen je Bereich */\n.svr-fs{margin-top:12px;}\n.svr-fs h3{margin:0 0 6px;font-size:15px;}\n.svr-fl{display:flex;flex-wrap:wrap;gap:6px;}\n.svr-fchip{display:inline-flex;gap:6px;align-items:baseline;padding:5px 10px;border-radius:999px;background:rgba(91,155,255,.12);font-size:13px;}\n.svr-kopf{align-items:flex-start;}\n.svr-stand{font-size:13px!important;color:var(--ink3)!important;}\n.svr-stand.an{color:var(--ink2)!important;font-weight:600;}\n.svr-fk{flex:none;min-height:44px;max-width:46%;font:inherit;font-size:14px;font-weight:650;padding:0 10px;border-radius:10px;border:1px solid var(--line);background:var(--bg2,transparent);color:inherit;}\n.svr-row.abw .svr-fk{border-color:var(--brand2);}\n.svr-kopf .svr-rt b::after{content:none!important;}\n.svr-ab{font-style:normal;font-size:11px;font-weight:700;color:var(--ink3);margin-left:4px;}\ndetails.svr-auf{margin-top:14px;border-top:1px solid var(--line);padding-top:10px;}\ndetails.svr-auf summary{cursor:pointer;list-style:none;min-height:44px;display:flex;align-items:center;}\ndetails.svr-auf summary::-webkit-details-marker{display:none;}\ndetails.svr-auf summary h3::before{content:'▸ ';color:var(--ink3);}\ndetails.svr-auf[open] summary h3::before{content:'▾ ';}\n.r80-edit{margin-top:auto;align-self:flex-start;min-height:44px;}\n.r80-rl{display:flex;flex-direction:column;gap:8px;margin-top:12px;}\n/* 0.83 · Mannschaft */\n.s81-sort{display:flex;flex-wrap:wrap;align-items:center;gap:6px;margin:0 0 10px;}\n.s81-sort span{font-size:12px;font-weight:700;color:var(--ink3);text-transform:uppercase;letter-spacing:.04em;margin-right:4px;}\n.s81-sort button{font:inherit;font-size:13px;font-weight:650;min-height:44px;padding:0 12px;border-radius:999px;border:1px solid var(--line);background:transparent;color:inherit;cursor:pointer;}\n.s81-sort button.on{background:var(--brand);border-color:var(--brand);color:#fff;}   /* 0.99.38: --brand2 ist im dunklen Modus hell, weiße Schrift darauf hatte nur 2,8 : 1 */\n.s81-inj{white-space:nowrap;max-width:150px;overflow:hidden;text-overflow:ellipsis;display:inline-block;vertical-align:middle;}\n.k1-leiste{display:flex;flex-wrap:wrap;align-items:center;gap:10px;margin-bottom:10px;}\n.s81-feste .adm-head{display:flex;flex-wrap:wrap;gap:12px;justify-content:space-between;align-items:flex-start;}\n.s81-l{display:flex;flex-direction:column;gap:6px;margin-top:12px;}\n.s81-l.vorbei{opacity:.7;}\n.s81-ev{font:inherit;color:inherit;text-align:left;display:flex;align-items:center;gap:12px;min-height:52px;padding:8px 12px;border-radius:12px;border:1px solid var(--line);background:rgba(148,163,196,.04);cursor:pointer;}\n.s81-d{display:flex;flex-direction:column;min-width:78px;font-size:13px;}\n.s81-d small,.s81-t small{color:var(--ink3);font-size:12.5px;}\n.s81-t{display:flex;flex-direction:column;flex:1;min-width:0;}\n.s81-h{margin:16px 0 0;font-size:12px;text-transform:uppercase;letter-spacing:.05em;color:var(--ink3);}\n.q50-del{margin-left:auto;}\n.q50-del.sure{color:#b42318;border-color:#b42318;}\n/* 0.83 · Mini-Apps */\n.ma-karte{margin-top:12px;}\n.ma-kopf{display:flex;justify-content:space-between;gap:10px;align-items:flex-start;}\n.ma-kopf h3{margin:0;font-size:16px;}\n.ma-tage{display:flex;flex-direction:column;gap:10px;margin-top:10px;}\n.ma-tag{border:1px solid var(--line);border-radius:12px;padding:10px 12px;display:flex;flex-direction:column;gap:6px;}\n.ma-tk{display:flex;flex-direction:column;gap:2px;font-size:13.5px;}\n.ma-tk span{color:var(--ink2);}\n.ma-zahlen{display:flex;flex-wrap:wrap;gap:6px;}\n.ma-zahlen span{font-size:13px;font-weight:650;padding:3px 9px;border-radius:999px;}\n.ma-zahlen .offen{background:rgba(234,88,12,.12);color:#c2410c;}\n.ma-zahlen .ok{background:rgba(22,163,74,.12);color:#15803d;}\n.ma-auf{display:flex;flex-direction:column;gap:2px;padding:9px 0;border-bottom:1px solid var(--line2);font-size:14px;}\n.ma-auf span{color:var(--ink2);font-size:13px;}\n.ma-auf.offen span{color:#c2410c;font-weight:650;}\n.ma-filter{display:flex;flex-wrap:wrap;gap:6px;margin:10px 0;}\n.ma-filter button{font:inherit;font-size:13px;font-weight:650;min-height:44px;padding:0 12px;border-radius:999px;border:1px solid var(--line);background:transparent;color:inherit;cursor:pointer;}\n.ma-filter button.on{background:var(--brand2);border-color:var(--brand2);color:#fff;}\n\n.ma-kl{display:flex;flex-direction:column;}\n.ma-mehr{margin-top:10px;}\n.ma-such{margin-bottom:8px;}\n.ma-k{display:flex;justify-content:space-between;gap:10px;align-items:center;padding:8px 0;border-bottom:1px solid var(--line2);}\n.ma-k small{display:block;color:var(--ink3);font-size:12.5px;}\n.ma-kt{display:flex;flex-wrap:wrap;gap:4px;justify-content:flex-end;}\n.ma-p,.ma-g{font-size:12px;font-weight:700;padding:2px 8px;border-radius:999px;white-space:nowrap;}\n.ma-p{background:rgba(91,155,255,.14);}\n.ma-g{background:rgba(148,163,196,.18);}\n.svr-sw.sure{outline:3px solid #f59e0b;outline-offset:2px;}\n@media (max-width:560px){ .svr-kopf{flex-wrap:wrap;} .svr-kopf .svr-fk{max-width:none;width:100%;order:3;} }\n/* 0.84 · Einladen mit Funktionen */\n.r80-invf{grid-column:1/-1;display:flex;flex-direction:column;gap:8px;}\n.r80-invh{margin:-4px 0 0;font-size:13px;color:var(--ink2);}\n.r80-invl{display:flex;flex-direction:column;gap:10px;}\n.r80-invz{display:grid;grid-template-columns:1fr 44px;gap:8px;align-items:center;}\n.r80-invs{display:grid;grid-template-columns:1fr minmax(140px,200px);gap:8px;}\n.r80-invz select{min-height:44px;width:100%;}\n.r80-invz .iconbtn{width:44px;height:44px;}\n.r80-invadd{align-self:flex-start;min-height:44px;}\n@media (max-width:560px){ .r80-invs{grid-template-columns:1fr;gap:6px;} .r80-invz{padding:8px;border:1px solid var(--line);border-radius:12px;} }\n/* 0.84 · Funktionen in der Team-Liste: eigene Zeile über die ganze Breite */\n.urow .r80-hid{display:none!important;}\n.urow > .r80-uf{grid-column:1/-1;display:flex;flex-wrap:wrap;align-items:center;gap:6px;}\n.urow > .r80-uf span{font-size:12px;font-weight:650;line-height:1.35;padding:3px 9px;border-radius:999px;background:rgba(91,155,255,.14);color:var(--ink);word-break:normal;overflow-wrap:break-word;max-width:100%;}\n.r80-fb{min-height:44px;gap:6px;font-size:13px;}\n.r80-fb svg{width:16px;height:16px;}\n/* 0.85 · Funktionsrollen */\n.r80-invfr{grid-column:1/-1;margin:0;padding:10px 12px;border-radius:12px;background:rgba(91,155,255,.12);color:var(--ink);font-size:13px;}\n"; document.head.appendChild(s); }catch(e){} })();
(function(){ try{ const s=document.createElement('style'); s.id='svm71css'; s.textContent="/* Beta 0.76 · Termine für Abteilungen, Mithelfen, Werbebild, Rückmeldungen. Ruhig: flache Flächen, eine Akzentfarbe, Tipp-Ziele 44 */\n.kal-hg{display:inline-block;align-self:flex-start;width:fit-content;margin-top:6px;font-style:normal;font-size:12.5px;font-weight:600;color:var(--brand2);background:var(--brandSoft);border-radius:99px;padding:3px 9px}\n.kal-hg.ich{color:var(--ink2);background:var(--surface2)}\n.kal-f2{grid-template-columns:minmax(0,1fr) minmax(0,1fr)}\n.kal-f2>.field,.kal-f2>label{min-width:0}\n.kal-f2 .kal-sicht>div{flex-wrap:wrap}\n.kal-f2 .kal-w{grid-column:1/-1}\n@media (max-width:520px){.kal-f2{grid-template-columns:minmax(0,1fr)}}\n.kal-gast{display:flex;flex-wrap:wrap;gap:6px;margin:4px 0 8px}\n.kal-gast:empty{display:none}\n.kal-gp{display:inline-flex;align-items:center;gap:2px;padding:0 2px 0 12px;min-height:36px;border-radius:99px;background:var(--surface2);border:1px solid var(--line);font-size:14px}\n.kal-gp button{all:unset;position:relative;cursor:pointer;width:44px;height:44px;margin:-4px -4px -4px 0;display:grid;place-items:center;color:var(--ink3)}\n.kal-gp button svg{width:14px;height:14px}\n.kal-gl{display:flex;flex-direction:column;gap:4px;margin-top:6px}\n.kal-gz{all:unset;position:relative;cursor:pointer;display:flex;align-items:center;gap:8px;min-height:44px;padding:0 12px;border-radius:10px;background:var(--surface2);font-size:15px}\n.kal-gz svg{width:16px;height:16px;color:var(--brand2)}\n.kal-ag{border:1px solid var(--line);border-radius:12px;margin:8px 0;background:var(--surface2)}\n.kal-ag summary{cursor:pointer;list-style:none;display:flex;flex-direction:column;gap:2px;padding:12px 14px;min-height:44px;justify-content:center}\n.kal-ag summary::-webkit-details-marker{display:none}\n.kal-ag summary small{color:var(--ink2);font-size:13px}\n.kal-am{display:flex;flex-wrap:wrap;gap:6px;padding:0 14px}\n.kal-zeile{display:flex;gap:8px;flex-wrap:wrap;padding:12px 14px}\n.kal-zeile select,.kal-zeile input{flex:1 1 200px;min-height:44px}\n.kal-zeile .btn{min-height:44px}\n.kal-helf{margin:14px 0 4px;border-top:1px solid var(--line);padding-top:12px}\n.kal-hs{display:flex;align-items:center;justify-content:space-between;gap:12px;padding:10px 0;border-bottom:1px solid var(--line)}\n.kal-hs:last-child{border-bottom:0}\n.kal-hs>div{display:flex;flex-direction:column;gap:2px;min-width:0}\n.kal-hs span{font-size:14.5px}\n.kal-hs small{font-size:13px;color:var(--ink2)}\n.kal-hs .btn{min-height:44px;flex:0 0 auto}\n\n/* Werbebild */\n.wb{display:grid;grid-template-columns:minmax(0,300px) minmax(0,1fr);gap:18px;align-items:start}\n@media (max-width:700px){.wb{grid-template-columns:1fr}}\n.wb-vor{background:var(--surface2);border-radius:14px;padding:10px;display:grid;place-items:center}\n.wb-vor canvas{width:100%;height:auto;max-height:38vh;object-fit:contain;border-radius:6px;display:block}\n.wb-ein{display:flex;flex-direction:column;gap:12px;min-width:0}\n.wb-seg{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:6px}\n.wb-seg button{all:unset;position:relative;cursor:pointer;box-sizing:border-box;display:flex;flex-direction:column;gap:2px;padding:10px;min-height:52px;border-radius:10px;border:1px solid var(--line);background:var(--surface2)}\n.wb-seg button b{font-size:14.5px}\n.wb-seg button small{font-size:12px;color:var(--ink2)}\n.wb-seg button[aria-pressed=\"true\"]{border-color:var(--brand);box-shadow:inset 0 0 0 1px var(--brand)}\n.wb-fotos{display:grid;grid-template-columns:repeat(auto-fill,minmax(64px,1fr));gap:6px}\n.wb-f{all:unset;position:relative;cursor:pointer;box-sizing:border-box;aspect-ratio:9/16;max-height:110px;border-radius:8px;overflow:hidden;border:2px solid transparent;background:var(--surface2);display:grid;place-items:center;font-size:12.5px;color:var(--ink2);text-align:center}\n.wb-f img{width:100%;height:100%;object-fit:cover;display:block}\n.wb-f.on{border-color:var(--brand)}\n.wb-eig{display:flex;flex-direction:column;align-items:center;justify-content:center;gap:4px}\n.wb-eig svg{width:20px;height:20px}\n.wb-chips{display:flex;flex-wrap:wrap;gap:6px;margin-bottom:6px}\n\n/* Rückmeldungen */\n.rm-seg{margin:12px 0}\n.rm-zahl{font-style:normal;font-size:12px;font-weight:700;background:var(--brand);color:#fff;border-radius:99px;padding:1px 7px;margin-left:4px}\n.rm-art{display:flex;flex-wrap:wrap;gap:6px;margin:4px 0 12px}\n.rm-z{border:1px solid var(--line);border-radius:12px;padding:12px 14px;margin:8px 0;background:var(--surface2)}\n.rm-z p{margin:6px 0 0;white-space:pre-wrap;overflow-wrap:anywhere}\n.rm-k{display:flex;align-items:center;gap:8px;flex-wrap:wrap}\n.rm-k small{color:var(--ink2);font-size:13px;margin-left:auto}\n.rm-st{font-style:normal;font-size:12px;font-weight:700;padding:2px 8px;border-radius:99px;background:var(--line);color:var(--ink2)}\n.rm-st.s-neu{background:var(--brandSoft);color:var(--brand2)}\n.rm-st.s-umgesetzt{background:rgba(34,197,94,.16);color:#16a34a}\n.rm-ant{background:var(--brandSoft);border-radius:8px;padding:8px 10px}\n.rm-meta{display:block;margin-top:6px;color:var(--ink3);font-size:12.5px}\n.rm-bear{display:flex;gap:6px;flex-wrap:wrap;margin-top:10px}\n.rm-bear select{min-height:44px;flex:0 0 auto}\n.rm-bear input{min-height:44px;flex:1 1 180px}\n.rm-bear .btn{min-height:44px}\n.rm-badge[hidden]{display:none!important}\n\n/* 0.76 Prüfstraße Bedienung */\nhtml body:not(#_).kal-an main{padding-bottom:calc(170px + env(safe-area-inset-bottom))!important}\n.kal-sicht .kal-chip,.wb-chips .kal-chip,.rm-art .kal-chip{min-height:44px}\n.rm-seg button{min-height:44px}\n.kal-sieht{margin:10px 0 0;font-size:14px;color:var(--ink2)}\n.kal-shin{margin:0 0 8px}\n.kal-zeile input,.kal-zeile select,.rm-bear input,.rm-bear select{box-sizing:border-box;border:1px solid var(--line);border-radius:10px;background:var(--surface);color:inherit;padding:0 12px;font:inherit;font-size:16px}\n.kal-ag summary{position:relative;padding-right:40px}\n.kal-ag summary::after{content:'';position:absolute;right:16px;top:50%;width:8px;height:8px;border:solid var(--ink3);border-width:0 2px 2px 0;transform:translateY(-70%) rotate(45deg)}\n.kal-ag[open] summary::after{transform:translateY(-30%) rotate(-135deg)}\n#moreSheet .rm-sheet{background:var(--surface2)!important;border:1px solid var(--line)!important;box-shadow:none!important;background-image:none!important}\n"; document.head.appendChild(s); }catch(e){} })();
(function(){ try{ const s=document.createElement('style'); s.id='svm69css'; s.textContent="/* Beta 0.75 · Veranstaltungen und Export. Ruhig wie 0.74: Flächen, eine Kante, Vereinsblau als Akzent, Orange nur für „frei“. */\n.vst-kopf{display:flex;align-items:flex-end;justify-content:space-between;gap:14px;flex-wrap:wrap;margin:2px 2px 14px}\n.vst-kopf h2{margin:0;font-size:24px;letter-spacing:-.02em}\n.vst-kopf p{margin:4px 0 0;color:var(--ink2);max-width:60ch;line-height:1.45;font-size:14px}\n.vst-liste{display:flex;flex-direction:column;gap:8px;margin-bottom:12px}\n.vst-liste.alt{opacity:.85}\n.vst-k{all:unset;box-sizing:border-box;display:grid;grid-template-columns:52px minmax(0,1fr) auto;gap:12px;align-items:center;padding:12px 14px;min-height:64px;\n  background:var(--surface);border:1px solid var(--line);border-radius:14px;cursor:pointer;color:var(--ink)}\n.vst-k:hover{border-color:var(--brand2)}\n.vst-k:focus-visible{outline:2px solid var(--brand2);outline-offset:2px}\n.vst-k.ab .vst-kt>b{text-decoration:line-through;text-decoration-thickness:1px}\n.vst-kd{display:flex;flex-direction:column;align-items:center;justify-content:center;background:var(--surface2);border-radius:10px;height:52px}\n.vst-kd b{font-size:15px;font-weight:750;font-variant-numeric:tabular-nums}\n.vst-kd small{font-size:11px;color:var(--ink2);text-transform:uppercase;letter-spacing:.05em}\n.vst-kt{min-width:0;display:flex;flex-direction:column;gap:3px}\n.vst-kt>b{font-size:15.5px;font-weight:650;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}\n.vst-kt>small{color:var(--ink2);font-size:13px}\n.vst-kk{color:var(--ink3)!important;font-size:12.5px!important;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}\n.vst-ks{display:flex;flex-direction:column;align-items:flex-end;gap:4px}\n.vst-ks small{font-size:12px;color:var(--brand2)}\n.vst-ks>svg{width:16px;height:16px;color:var(--ink3)}\n.vst-st{font-style:normal;font-size:11.5px;font-weight:700;padding:3px 8px;border-radius:99px;background:var(--surface2);color:var(--ink2);white-space:nowrap}\n.vst-st.s-planung{background:var(--brandSoft);color:var(--brand2)}\n.vst-st.s-laeuft{background:rgba(34,197,94,.14);color:#4ade80}\n.vst-st.s-abgesagt{background:rgba(240,82,82,.12);color:#fca5a5}\nhtml[data-theme=\"hell\"] body .vst-st.s-laeuft{color:#166534}\nhtml[data-theme=\"hell\"] body .vst-st.s-abgesagt{color:#991b1b}\nhtml[data-theme=\"hell\"] body .vst-st.s-planung{color:var(--brand)}\n.vst-bal{height:5px;border-radius:9px;background:var(--surface3,rgba(148,163,196,.14));overflow:hidden;margin-top:4px;max-width:260px}\n.vst-bal i{display:block;height:100%;background:var(--brand2);border-radius:9px}\n.vst-bz{font-size:12px!important;color:var(--ink2)!important}\n.vst-vor{all:unset;cursor:pointer;color:var(--brand2);font-weight:600;font-size:14px;padding:12px 4px;min-height:44px;box-sizing:border-box;display:inline-flex;align-items:center}\n.vst-leer b{display:block;font-size:16px;margin-bottom:6px}\n.vst-leer p{margin:0;color:var(--ink2);line-height:1.5}\n.vst-zur{all:unset;cursor:pointer;display:inline-flex;align-items:center;gap:6px;color:var(--brand2);font-weight:600;font-size:14px;min-height:44px;margin:0 0 6px}\n.vst-zur svg{width:16px;height:16px;transform:rotate(180deg)}\n.vst-head h2{margin:0;font-size:22px;letter-spacing:-.02em;text-wrap:balance}\n.vst-h1{display:flex;justify-content:space-between;gap:12px;align-items:flex-start}\n.vst-h1 p{margin:4px 0 0;color:var(--ink2);font-size:14px}\n.vst-lt{font-size:13px!important}\n.vst-bes{margin:12px 0 0;line-height:1.5;color:var(--ink);white-space:pre-wrap}\n.vst-zahlen{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:8px;margin-top:14px}\n.vst-zahlen>div{background:var(--surface2);border-radius:12px;padding:10px 12px;display:flex;flex-direction:column;gap:2px}\n.vst-zahlen b{font-size:20px;font-variant-numeric:tabular-nums}\n.vst-zahlen b small{font-size:13px;color:var(--ink2);font-weight:600}\n.vst-zahlen span{font-size:13px;color:var(--ink2)}\n.vst-akt{display:flex;gap:8px;flex-wrap:wrap;margin-top:12px}\n.vst-akt .btn{min-height:44px!important}\n.vst-seg{margin:12px 0}\n.vst-seg button{min-height:44px}\n.vst-b h3,.vst-kinder h3{margin:0;font-size:16px}\n.vst-bk{display:flex;justify-content:space-between;gap:10px;align-items:flex-start;margin-bottom:10px}\n.vst-bk small{color:var(--ink2);font-size:12.5px}\n.vst-bk p{margin:6px 0 0;color:var(--ink2);font-size:13.5px}\n.vst-nix{color:var(--ink3);font-size:13.5px;margin:4px 0}\n.vst-s{display:grid;grid-template-columns:minmax(0,1fr) auto;gap:6px 10px;padding:10px 0;border-top:1px solid var(--line)}\n.vst-sk{display:flex;flex-direction:column;gap:2px;min-width:0}\n.vst-sk b{font-size:14px;font-variant-numeric:tabular-nums}\n.vst-sk span{font-size:13.5px;color:var(--ink)}\n.vst-sk small{font-size:12.5px;color:var(--ink2)}\n.vst-sb{all:unset;cursor:pointer;width:44px;height:44px;display:grid;place-items:center;border-radius:10px;color:var(--ink2);grid-row:1;grid-column:2}\n.vst-sb svg{width:18px;height:18px}\n.vst-sp{grid-column:1/-1;display:flex;flex-wrap:wrap;gap:6px}\n.vst-p{display:inline-flex;align-items:center;gap:2px;padding:0 4px 0 10px;min-height:32px;border-radius:99px;background:var(--surface2);border:1px solid var(--line);font-size:13px}\n.vst-p.hp{border-style:dashed}\n.vst-p button{all:unset;cursor:pointer;width:32px;height:32px;display:grid;place-items:center;color:var(--ink3)}\n.vst-p button svg{width:14px;height:14px}\n.vst-frei{all:unset;cursor:pointer;display:inline-flex;align-items:center;gap:4px;padding:0 12px;min-height:32px;border-radius:99px;border:1px dashed var(--accent);color:var(--accent);font-size:13px;font-weight:600}\n.vst-frei svg{width:14px;height:14px}\n.vst-frei.aus{cursor:default}\n.vst-voll{font-size:12.5px;color:var(--ink3);align-self:center}\n.vst-add{all:unset;cursor:pointer;display:inline-flex;align-items:center;gap:6px;color:var(--brand2);font-weight:600;font-size:14px;min-height:44px;margin-top:6px}\n.vst-add svg{width:16px;height:16px}\n.vst-plus{display:flex;gap:8px;flex-wrap:wrap;margin:4px 0 18px}\n.vst-plus .btn{min-height:44px!important}\n.vst-kz{all:unset;box-sizing:border-box;cursor:pointer;display:grid;grid-template-columns:minmax(0,1fr) 120px 16px;align-items:center;gap:10px;width:100%;padding:10px 0;border-top:1px solid var(--line);min-height:52px}\n.vst-kz span{display:flex;flex-direction:column;min-width:0}\n.vst-kz b{font-size:14.5px}\n.vst-kz small{font-size:12.5px;color:var(--ink2)}\n.vst-kz>svg{width:16px;height:16px;color:var(--ink3)}\n.vst-kz .vst-bz{display:none}\n.vst-form{display:flex;flex-direction:column;gap:12px;margin-top:14px}\n.vst-f{display:flex;flex-direction:column;gap:6px;min-width:0}\n.vst-f label{font-size:12.5px;font-weight:650;color:var(--ink2)}\n.vst-f input,.vst-f select,.vst-f textarea{font:inherit;font-size:16px;min-height:44px;padding:10px 12px;border-radius:11px;border:1px solid var(--line);background:var(--surface2);color:var(--ink);box-sizing:border-box;width:100%}\n.vst-f textarea{min-height:80px;resize:vertical;line-height:1.45}\n.vst-zwei{display:grid;grid-template-columns:1fr 1fr;gap:10px}\n.vst-zeile{display:flex;gap:8px}\n.vst-zeile input{flex:1}\n.vst-chk{display:flex;gap:10px;align-items:flex-start;font-size:14px;line-height:1.4;min-height:44px}\n.vst-chk input{width:22px;height:22px;margin-top:1px;flex:none}\n.vst-pw{display:flex;flex-direction:column;gap:6px;max-height:46vh;overflow:auto;margin:10px 0}\n.vst-pw h4{margin:8px 2px 2px;font-size:11.5px;letter-spacing:.06em;text-transform:uppercase;color:var(--ink3)}\n.vst-pz{all:unset;box-sizing:border-box;cursor:pointer;display:flex;flex-direction:column;gap:2px;padding:10px 12px;min-height:52px;border-radius:11px;background:var(--surface2);border:1px solid var(--line)}\n.vst-pz:hover{border-color:var(--brand2)}\n.vst-pz[hidden]{display:none}\n.vst-pz b{font-size:14.5px}\n.vst-pz small{font-size:12.5px;color:var(--ink2)}\n.vst-hinw b{display:block;margin-bottom:4px}\n.vst-hinw p{margin:0 0 10px;color:var(--ink2);line-height:1.45}\n.vst-hinw.ok{border-color:rgba(34,197,94,.35)!important}\n.vst-hz{display:flex;justify-content:space-between;align-items:center;gap:10px;padding:10px 0;border-top:1px solid var(--line)}\n.vst-hz>div:first-child{display:flex;flex-direction:column;min-width:0}\n.vst-hz b{font-size:14.5px}\n.vst-hz small{font-size:12.5px;color:var(--ink2)}\n.vst-hz.drin small{color:#4ade80}\nhtml[data-theme=\"hell\"] body .vst-hz.drin small{color:#166534}\n.vst-ha{display:flex;gap:6px;flex:none}\n.vst-ha .btn{min-height:40px!important}\n.vst-tz{display:flex;justify-content:space-between;align-items:center;gap:10px;padding:10px 0;border-top:1px solid var(--line)}\n.vst-tz>div{display:flex;flex-direction:column;min-width:0}\n.vst-tz small{font-size:12.5px;color:var(--ink2)}\n.vst-mneu{border-top:1px solid var(--line);padding-top:12px}\n.vst-cp{display:flex;flex-direction:column;padding:8px 0;border-top:1px solid var(--line)}\n.vst-cp small{color:var(--ink2);font-size:12.5px}\n.vst-txt{width:100%;box-sizing:border-box;font:inherit;font-size:14px;line-height:1.5;padding:12px;border-radius:11px;border:1px solid var(--line);background:var(--surface2);color:var(--ink);margin-top:12px}\n@media (max-width:520px){ .vst-k{grid-template-columns:46px minmax(0,1fr) auto;padding:10px 12px} .vst-kd{height:46px} .vst-ha .btn{padding:0 10px!important} }\n\n/* Export */\n.ex-g{margin:18px 2px 8px;font-size:11.5px;letter-spacing:.06em;text-transform:uppercase;color:var(--ink3)}\n.ex-liste{display:grid;grid-template-columns:repeat(auto-fill,minmax(280px,1fr));gap:8px}\n.ex-q{all:unset;box-sizing:border-box;cursor:pointer;display:flex!important;align-items:center;justify-content:space-between;gap:10px;padding:14px 16px!important;margin:0!important;min-height:72px}\n.ex-q>span{display:flex;flex-direction:column;gap:3px;min-width:0}\n.ex-q b{font-size:15px}\n.ex-q small{font-size:13px;color:var(--ink2);line-height:1.4}\n.ex-q>svg{width:16px;height:16px;color:var(--ink3);flex:none}\n.ex-fs{display:flex!important;flex-direction:row!important;gap:4px;flex-wrap:wrap;margin-top:4px}\n.ex-fs i{font-style:normal;font-size:11.5px;font-weight:650;padding:2px 7px;border-radius:99px;background:var(--surface2);color:var(--ink2)}\n.ex-fmt{display:grid;grid-template-columns:repeat(auto-fill,minmax(150px,1fr));gap:8px;margin-top:16px}\n.ex-f{all:unset;box-sizing:border-box;cursor:pointer;display:flex;flex-direction:column;gap:2px;padding:12px;min-height:60px;border-radius:12px;border:1px solid var(--line);background:var(--surface2)}\n.ex-f b{font-size:15px}\n.ex-f span{font-size:12.5px;color:var(--ink2)}\n.ex-f.on{border-color:var(--brand);box-shadow:inset 0 0 0 1px var(--brand)}\n.ex-f:focus-visible{outline:2px solid var(--brand2);outline-offset:2px}\n.ex-stat{min-height:22px;margin-top:12px;font-size:13.5px;color:var(--ink2)}\n\n/* 0.75 Prüfstraße: all:unset setzt auch position zurück; sonst wird eine unsichtbare Tippfläche riesig */\n.vst-k,.vst-vor,.vst-zur,.vst-sb,.vst-p,.vst-p button,.vst-frei,.vst-add,.vst-kz,.vst-pz,.ex-q,.ex-f{position:relative}\n.vst-p button{min-width:44px;min-height:44px;margin:-6px -4px -6px -6px}\n.vst-p button:disabled{opacity:.4}\n.vst-f[hidden],.vst-pz[hidden]{display:none!important}\n.ex-hw{margin:12px 0 0;font-size:13px;color:var(--ink2)}\n.ex-kt{padding-right:44px;min-width:0}\n.ex-kt h2{overflow-wrap:anywhere}\n.ex-f.on b::after{content:'';display:inline-block;width:6px;height:11px;margin-left:8px;border:solid var(--brand);border-width:0 2px 2px 0;transform:rotate(45deg) translateY(-2px)}\n.vst-akt .btn{flex:1 1 auto}\n"; document.head.appendChild(s); }catch(e){} })();
(function(){ try{ const s=document.createElement('style'); s.id='svm58css'; s.textContent="/* Heute: Liste der häufigsten Bereiche je Rolle, im Stil einer iPhone-Einstellungsliste */\n.ht{margin:4px 0 18px}\n.ht-h{font-size:20px;font-weight:750;letter-spacing:-.02em;margin:0 4px 10px;color:var(--ink);text-wrap:balance}\n.ht-liste{background:var(--card);border:1px solid var(--line);border-radius:var(--r-lg);overflow:hidden}\n.ht-z,.ht-mehr{display:flex;align-items:center;gap:14px;width:100%;min-height:60px;padding:10px 14px;border:0;background:none;color:inherit;font:inherit;text-align:left;cursor:pointer;position:relative;-webkit-tap-highlight-color:transparent}\n.ht-z+.ht-z::before{content:\"\";position:absolute;top:0;left:58px;right:0;height:1px;background:var(--line)}\n.ht-z:active,.ht-mehr:active{background:var(--card2)}\n@media (hover:hover){.ht-z:hover,.ht-mehr:hover{background:var(--card2)}}\n.ht-z:focus-visible,.ht-mehr:focus-visible{outline:2px solid var(--accent);outline-offset:-2px}\n.ht-ic{flex:none;width:30px;height:30px;border-radius:8px;display:grid;place-items:center;background:var(--c);color:#fff}\n.ht-ic svg{width:18px;height:18px;stroke-width:2.1}\n.ht-tx{flex:1;min-width:0;display:grid;gap:2px}\n.ht-tx b{font-size:16px;font-weight:620;letter-spacing:-.01em;line-height:1.25}\n.ht-tx small{font-size:13.5px;color:var(--ink2);line-height:1.3;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}\n.ht-tx small.ht-heute{color:var(--accent);font-weight:600}\n.ht-n{flex:none;min-width:24px;height:24px;padding:0 7px;border-radius:12px;display:grid;place-items:center;font-size:13px;font-weight:700;font-variant-numeric:tabular-nums;background:var(--card2);color:var(--ink2)}\n.ht-n.rot{background:var(--red);color:#fff}\n.ht-pf{flex:none;color:var(--ink3);display:grid;place-items:center;transition:transform .2s var(--ease,ease)}\n.ht-pf svg{width:16px;height:16px;stroke-width:2.4}\n.ht-pf.auf{transform:rotate(90deg)}\n/* Zugeklappte Scouting-Listen */\n.ht-mehr{background:var(--card);border:1px solid var(--line);border-radius:var(--r-lg);margin:4px 0 16px;justify-content:space-between}\n.ht-mehr span:first-child{display:grid;gap:2px}\n.ht-mehr b{font-size:16px;font-weight:620}\n.ht-mehr small{font-size:13.5px;color:var(--ink2)}\n#panel-home.ht-kompakt:not(.ht-offen)>:is(#vrHome,#homeTiles,#homeKand,#svAct,#homeCrm,.sechead,#homeFocus,#homeWechsel,#homeGems,.frow,#homePress){display:none!important}\n/* Die neue Liste ersetzt die Schnellknöpfe im Cockpit, Hinweise und Lagebild bleiben */\n#panel-home.ht-kompakt #svCockpit .svc-acts,#panel-home.ht-kompakt #svCockpit .svc-top{display:none!important}\n@media (prefers-reduced-motion:reduce){.ht-pf{transition:none}}\n/* 0.74: Leerzustand für Jugendtrainer ohne Mannschaft */\n.ht-leer{border:1px solid var(--line);border-radius:14px;padding:16px 18px;background:var(--card);color:var(--ink)}\n.ht-leer b{display:block;font-size:16px;margin-bottom:6px}\n.ht-leer p{margin:0;color:var(--ink2);line-height:1.5;font-size:14.5px}\n.ht-leer+.ht-liste{margin-top:10px}\n"; document.head.appendChild(s); }catch(e){} })();
/* =====================================================================
   Sportzentrale Beta 0.62 · Feinschliff nach Apples Human Interface Guidelines, für die ganze App
   - Tippflächen: alles, was man antippen kann, ist mindestens 44 x 44 Punkt groß. Kleine Knöpfe behalten
     ihr Aussehen, bekommen aber eine unsichtbar vergrößerte Tippfläche (wie bei iOS).
   - Eingabefelder: am Handy mindestens 44 hoch und 16px Schrift (sonst zoomt das iPhone beim Antippen).
   - VoiceOver: Eingabefelder ohne Beschriftung bekommen einen Namen aus Platzhalter, Spaltenkopf oder Text davor.
   - Dialoge: „Abbrechen“ links, die Hauptaktion rechts (wie bei iOS), wenn die Knöpfe nebeneinander stehen.
   - Textgröße: Wer am iPhone größeren Text eingestellt hat, bekommt die App entsprechend größer (abschaltbar).
   - Kontrast der schwächsten Textfarbe angehoben, weniger Bewegung respektiert (Datei svm59.css).
   - Text unter 11 Punkt hebt der Build an (build_v3.py, mind11).
   ===================================================================== */
const AP={t:null,mo:null,faktor:1,gross:new WeakSet(),text:new WeakSet()};
const apGrob=()=>{ try{ return matchMedia('(pointer:coarse)').matches; }catch(e){ return false; } };
const apSicht=e=>{ if(!e.isConnected)return false; const r=e.getBoundingClientRect(); return r.width>1&&r.height>1; };

// ---------- Tippflächen ----------
function apTippflaechen(root){
  if(!apGrob())return;
  (root||document).querySelectorAll('button, a[href], [role=button], summary, [role=tab], [role=radio], [role=checkbox]').forEach(e=>{
    if(e.tagName==='A'&&!e.classList.contains('btn')&&getComputedStyle(e).display==='inline'&&e.parentElement&&/^(P|LI|SPAN|SMALL|TD)$/.test(e.parentElement.tagName)&&e.parentElement.textContent.trim().length>e.textContent.trim().length+3)return;   // Link mitten im Text
    if(e.classList.contains('ap-hit')||e.dataset.apHit==='0'||!apSicht(e))return;
    if(AP.gross.has(e))return; const r=e.getBoundingClientRect(); if(r.width>=44&&r.height>=44){ AP.gross.add(e); return; }
    let after='none'; try{ after=getComputedStyle(e,'::after').content; }catch(x){}
    if(after&&after!=='none'&&after!=='normal'){   // ::after ist schon belegt: dann ::before nehmen, sonst Gestaltung nicht anfassen
      let vor='none'; try{ vor=getComputedStyle(e,'::before').content; }catch(x){}
      if(vor&&vor!=='none'&&vor!=='normal'){ e.dataset.apHit='0'; return; }
      if(getComputedStyle(e).position==='static')e.classList.add('ap-rel'); e.classList.add('ap-hit2'); e.dataset.apHit='0'; return; }
    if(getComputedStyle(e).position==='static')e.classList.add('ap-rel');
    e.classList.add('ap-hit'); });
}

// ---------- Namen für VoiceOver ----------
function apText(s){ return String(s||'').replace(/\s+/g,' ').trim().slice(0,60); }
function apNameFuer(e){
  if(e.placeholder)return apText(e.placeholder);
  const td=e.closest('td,th');
  if(td){ const tab=td.closest('table'), i=td.cellIndex, kopf=tab&&tab.tHead&&tab.tHead.rows[0]&&tab.tHead.rows[0].cells[i];
    const zeile=td.parentElement&&td.parentElement.cells[0]&&td.parentElement.cells[0]!==td?apText(td.parentElement.cells[0].textContent):'';
    if(kopf&&apText(kopf.textContent))return apText(kopf.textContent)+(zeile?', '+zeile:''); }
  let v=e.previousElementSibling; for(let k=0;v&&k<2;k++,v=v.previousElementSibling){ if(/^(LABEL|SPAN|B|SMALL|STRONG|EM|H4|H5|P|DIV)$/.test(v.tagName)&&!v.querySelector('input,select,textarea,button')){ const t=apText(v.textContent); if(t&&t.length<=60)return t; } }
  const eltern=e.parentElement; if(eltern&&/^(SPAN|DIV|P)$/.test(eltern.tagName)){ const t=apText([...eltern.childNodes].filter(n=>n.nodeType===3).map(n=>n.textContent).join(' ')); if(t)return t; }
  if(e.tagName==='SELECT'){ const o=e.options[e.selectedIndex]; if(o&&o.value==='')return apText(o.textContent); }
  if(e.type==='search')return 'Suchen';
  if(e.name)return apText(e.name.replace(/[_-]+/g,' '));
  return '';
}
function apNamen(root){
  (root||document).querySelectorAll('input:not([type=hidden]):not([type=checkbox]):not([type=radio]):not([type=button]):not([type=submit]), select, textarea').forEach(e=>{
    if(e.getAttribute('aria-label')||e.getAttribute('aria-labelledby')||e.closest('label')||e.title)return;
    if(e.id){ try{ if(document.querySelector(`label[for="${CSS.escape(e.id)}"]`))return; }catch(x){} }
    const n=apNameFuer(e); if(n)e.setAttribute('aria-label',n); });
  // Knöpfe nur mit Symbol: Name aus dem Tooltip (data-tip) übernehmen
  (root||document).querySelectorAll('button:not([aria-label])').forEach(b=>{ if(apText(b.textContent))return; const t=b.dataset.tip||b.title; if(t)b.setAttribute('aria-label',apText(t)); });
}

// ---------- Kästchen in Tabellen: die ganze Zelle ist Tippfläche ----------
function apZellen(root){
  if(!apGrob())return;
  (root||document).querySelectorAll('td input[type=checkbox], td input[type=radio]').forEach(cb=>{
    if(cb.closest('label'))return; const td=cb.closest('td'); if(!td||td.classList.contains('ap-zelle'))return;
    if(td.querySelectorAll('input,select,button,a,textarea').length!==1)return;
    td.classList.add('ap-zelle'); });
}
function apZeilen(root){
  if(!apGrob())return;
  // Beschriftete Kästchen: die Beschriftung ist die Tippfläche, mindestens 44 hoch
  (root||document).querySelectorAll('label').forEach(l=>{
    if(l.classList.contains('ap-lab')||!l.querySelector('input[type=checkbox],input[type=radio]')||!apSicht(l))return;
    if(l.getBoundingClientRect().height>=44)return;
    if(getComputedStyle(l).display==='inline')l.classList.add('ap-labi');
    l.classList.add('ap-lab'); });
  (root||document).querySelectorAll('input[type=checkbox], input[type=radio]').forEach(cb=>{
    if(cb.closest('label,td')||cb.id&&document.querySelector(`label[for="${CSS.escape(cb.id)}"]`))return;
    const z=cb.parentElement; if(!z||z.classList.contains('ap-zeile')||z===document.body)return;
    if(z.querySelectorAll('input,select,button,a,textarea').length!==1)return;
    z.classList.add('ap-zeile'); });
}
document.addEventListener('click',e=>{ const z=e.target.closest&&e.target.closest('.ap-zeile'); if(!z||e.target.closest('input,select,button,a,textarea,label'))return;
  const cb=z.querySelector('input'); if(cb&&!cb.disabled)cb.click(); },true);
document.addEventListener('click',e=>{ const td=e.target.closest&&e.target.closest('td.ap-zelle'); if(!td||e.target.closest('input,select,button,a,textarea,label'))return;
  const cb=td.querySelector('input'); if(cb&&!cb.disabled)cb.click(); },true);

// ---------- Text nie unter 11 Punkt (auch wenn er relativ zur Umgebung kleiner wird) ----------
function apMindest(root){
  const P=root||document.querySelector('.panel.active')||document; if(!P)return;
  P.querySelectorAll('small,span,em,i,b,strong,label,td,th,p,div,a,button').forEach(e=>{
    if(AP.text.has(e))return; let t=false; for(const n of e.childNodes){ if(n.nodeType===3&&n.textContent.trim()){ t=true; break; } } if(!t)return;
    const fs=parseFloat(getComputedStyle(e).fontSize); if(!e.getClientRects().length)return; AP.text.add(e); if(fs&&fs<10.95&&fs>=6){ e.style.fontSize='11px'; e.dataset.ap11='1'; } });
}

// ---------- Dialoge: Abbrechen links, Hauptaktion rechts ----------
function apDialog(){
  const M=document.getElementById('modal'); if(!M)return;
  M.querySelectorAll('.btnrow').forEach(row=>{
    const knoepfe=[...row.children].filter(x=>x.tagName==='BUTTON'&&apSicht(x)); if(knoepfe.length<2)return;
    const ab=knoepfe.find(x=>/^(Abbrechen|Doch nicht|Nicht jetzt)$/i.test(apText(x.textContent))); if(!ab)return;
    const top=knoepfe[0].offsetTop, nebeneinander=knoepfe.every(x=>Math.abs(x.offsetTop-top)<4);
    row.classList.toggle('ap-ios',nebeneinander);
    ab.classList.toggle('ap-abbr',nebeneinander); });
}

// ---------- Textgröße wie am iPhone (Dynamic Type) ----------
function apTextFaktor(){
  try{ if(localStorage.getItem('sv_textgroesse')==='aus')return 1; }catch(e){}
  try{ if(!CSS.supports('font','-apple-system-body'))return 1;
    const p=document.createElement('span'); p.style.cssText='font:-apple-system-body;position:absolute;visibility:hidden'; p.textContent='x'; document.body.appendChild(p);
    const px=parseFloat(getComputedStyle(p).fontSize); p.remove(); if(!px)return 1;
    return Math.max(1,Math.min(1.35,Math.round(px/17*20)/20));   // 17pt ist Apples Standard. Nur vergrößern, höchstens 135 %
  }catch(e){ return 1; }
}
function apTextAnwenden(f){
  AP.faktor=f==null?apTextFaktor():f;
  const h=document.documentElement; if(AP.faktor>1.001){ h.style.zoom=String(AP.faktor); h.dataset.apText=String(AP.faktor); } else { h.style.zoom=''; delete h.dataset.apText; }
}

// ---------- Mein Konto: Schalter für die Textgröße ----------
// Erscheinungsbild (svhell.js) hängt sich erst danach ein, darum einen Takt später
if(typeof svAccount==='function'){ const _acc=svAccount; svAccount=function(){ const r=_acc.apply(this,arguments);
  setTimeout(apKontoSchalter,0); return r; }; }
function apKontoSchalter(){
  try{ const M=document.getElementById('modal'), th=M&&M.querySelector('#thSek'); if(th&&!M.querySelector('#apTextSw')){
      let an=true; try{ an=localStorage.getItem('sv_textgroesse')!=='aus'; }catch(e){}
      const d=document.createElement('label'); d.className='ap-sw'; d.innerHTML=`<input type="checkbox" id="apTextSw"${an?' checked':''}><span><b>Textgröße vom Gerät übernehmen</b><small>Hast du am iPhone größeren Text eingestellt, wird auch die App größer.</small></span>`;
      th.appendChild(d); d.querySelector('input').onchange=e=>{ try{ localStorage.setItem('sv_textgroesse',e.target.checked?'an':'aus'); }catch(x){} apTextAnwenden(); }; } }catch(e){}
}

// ---------- Laufend anwenden ----------
function apAlles(root){ try{ apNamen(root); }catch(e){} try{ apTippflaechen(root); }catch(e){} try{ apZellen(root); }catch(e){} try{ apZeilen(root); }catch(e){} try{ apMindest(); }catch(e){} try{ apDialog(); }catch(e){} }
function apBald(){ if(AP.t)return; AP.t=setTimeout(()=>{ AP.t=null; apAlles(); },250); }
(function(){ const go=()=>{ apTextAnwenden(); apAlles();
    try{ AP.mo=new MutationObserver(m=>{ if(m.some(x=>x.addedNodes.length))apBald(); }); AP.mo.observe(document.body,{childList:true,subtree:true}); }catch(e){}
    addEventListener('resize',apBald); };
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',go); else go(); })();
{ const _gt=goTab; goTab=function(){ const r=_gt.apply(this,arguments); apBald(); return r; }; }

(function(){ try{ const s=document.createElement('style'); s.id='svm59css'; s.textContent="/* Feinschliff nach Apples Human Interface Guidelines (Beta 0.62) */\n/* Schwächste Textfarbe: Kontrast mindestens 4,5:1 auf allen Flächen */\n:root:root{--ink3:#8d96ab}\nhtml[data-theme=\"hell\"]:root{--ink3:#4d5668}\n/* Aktive Segmente: Weiß auf kräftigerem Blau (5,2:1 statt 2,8:1) */\n.k1-seg button.on,.st-bf button.on,.st-mf button.on{background:#2563eb!important}\n\n/* Tippflächen mindestens 44 x 44, ohne das Aussehen zu ändern */\n@media (pointer:coarse){\n  .ap-rel{position:relative}\n  .ap-hit::after{content:\"\";position:absolute;left:50%;top:50%;width:max(100%,44px);height:max(100%,44px);transform:translate(-50%,-50%);background:transparent}\n  .ap-hit2::before{content:\"\";position:absolute;left:50%;top:50%;width:max(100%,44px);height:max(100%,44px);transform:translate(-50%,-50%);background:transparent}\n  /* Eingabefelder: 44 hoch und 16px Schrift, damit das iPhone beim Antippen nicht hineinzoomt */\n  input:not([type=checkbox]):not([type=radio]):not([type=range]):not([type=color]):not([type=file]),select,textarea{min-height:44px!important;font-size:max(16px,1em)}\n  input[type=checkbox],input[type=radio]{min-width:22px;min-height:22px}\n  td.ap-zelle{cursor:pointer;min-width:44px;height:44px}\n  .ap-zeile{cursor:pointer;min-height:44px}\n  label.ap-lab{min-height:44px}\n  label.ap-labi{display:inline-flex;align-items:center;gap:6px}\n}\n\n/* Dialoge: Abbrechen links, Hauptaktion rechts, wenn die Knöpfe nebeneinander stehen */\n#modal .btnrow.ap-ios{display:flex;justify-content:flex-end}\n#modal .btnrow.ap-ios .ap-abbr{order:-1;margin-right:auto}\n\n/* Schalter Textgröße in Mein Konto */\n.ap-sw{display:flex;gap:12px;align-items:flex-start;margin-top:14px;cursor:pointer;min-height:44px}\n.ap-sw input{flex:none;width:22px;height:22px;margin-top:2px;accent-color:var(--accent)}\n.ap-sw span{display:grid;gap:2px}\n.ap-sw b{font-size:15px;font-weight:650}\n.ap-sw small{font-size:13px;color:var(--ink2);line-height:1.4}\n\n/* Weniger Bewegung: Animationen und Übergänge fast ganz aus, wenn am Gerät eingestellt */\n@media (prefers-reduced-motion:reduce){\n  *,*::before,*::after{animation-duration:.01ms!important;animation-iteration-count:1!important;animation-delay:0s!important;transition-duration:.01ms!important;transition-delay:0s!important;scroll-behavior:auto!important}\n}\n\n/* Fokus für Tastatur und Schalterbedienung immer sichtbar */\n:focus-visible{outline:2px solid var(--accent);outline-offset:2px}\n\n/* Einzelne Stellen mit zu wenig Kontrast */\n.pk-seg button.on{color:#141a2e}\nhtml[data-theme=\"hell\"] .k1-ann{color:#7a5200;border-color:color-mix(in srgb,#7a5200 50%,transparent)}\nhtml[data-theme=\"hell\"] .linkbox code{color:#1e3a8a;background:rgba(40,48,72,.06)}\nhtml[data-theme=\"hell\"] .trai-steps code{color:#1e3a8a!important;background:rgba(40,48,72,.06)!important}\n/* Partner-Steuerung: aktiver Unterreiter auch im hellen Modus gut lesbar */\n.pe-sub button.on{background:#2563eb!important;color:#fff!important;border-color:transparent!important}\n"; document.head.appendChild(s); }catch(e){} })();
/* =====================================================================
   Sportzentrale Beta 0.63 · Weiche für die Store-Apps (iPhone, Android) und „Konto löschen“
   Die Web-App läuft unverändert weiter. In der Store-App (Capacitor) kommen dazu:
   - Mitteilungen über Apple (APNs) und Google (FCM) statt Web-Push, mit denselben Knöpfen in der App
   - Tipp auf eine Mitteilung öffnet genau die Meldung
   - Entsperren mit Face ID oder Fingerabdruck (abschaltbar, nur wenn das Gerät es kann)
   - Teilen über das Teilen-Menü des Telefons, spürbares Tippen auch am iPhone
   - Links nach außen zeigen immer auf https://svbsc.kaderwerk.pro (svBasis in boot.js)
   Für alle (Web und App): Konto selbst löschen unter Mein Konto (Apple Richtlinie 5.1.1).
   ===================================================================== */
const SVN={nativ:false,plattform:'web',plug:{},token:null,gesperrt:false};
try{ const C=window.Capacitor; SVN.nativ=!!(C&&C.isNativePlatform&&C.isNativePlatform()); SVN.plattform=SVN.nativ&&C.getPlatform?C.getPlatform():'web'; SVN.plug=(C&&C.Plugins)||{}; }catch(e){}
const svnLs=(k,v)=>{ try{ if(v===undefined)return localStorage.getItem(k); if(v===null)localStorage.removeItem(k); else localStorage.setItem(k,v); }catch(e){ return null; } };

if(SVN.nativ){
  document.documentElement.classList.add('nativ','nativ-'+SVN.plattform);

  // ---------- Updates in der Store-App (Beta 0.65) ----------
  // Die Dateien liegen in der App selbst. Neue Versionen holt der Capgo-Updater still im Hintergrund (Funktion app-ota),
  // sie gelten ab dem nächsten Öffnen. Service Worker und version.json-Abfrage der Web-App sind hier aus.
