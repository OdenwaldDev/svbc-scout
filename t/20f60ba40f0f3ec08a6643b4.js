  c.globalCompositeOperation = 'lighter'; const r = hoch ? 26 : 30;
  K.forEach(k => { const x = k[1] / 1000 * W, y = k[2] / 1000 * Hh, g = c.createRadialGradient(x, y, 0, x, y, r); g.addColorStop(0, 'rgba(255,154,74,.55)'); g.addColorStop(.5, 'rgba(232,116,31,.22)'); g.addColorStop(1, 'rgba(232,116,31,0)'); c.fillStyle = g; c.beginPath(); c.arc(x, y, r, 0, 6.3); c.fill(); });
  c.globalCompositeOperation = 'source-over'; }
async function r122Blatt(deck){ let A; try{ A = await svtRpc('partner_reise_auswertung', { p_deck: deck }); }catch(e){ kToast('⚠️ ' + (e.message || e)); return; }
  const x = (R122.d || []).find(y => y.deck === deck) || {}, S = A.sitzungen || [], K = S.flatMap(s => (s.klicks || []).map(k => k.concat([s.hoch !== false]))), hoch = S.filter(s => s.hoch !== false).length >= S.length / 2;
  const szMit = R122_SZ.filter(z => K.some(k => k[0] === z[0]));
  svModal(`<div class="r122-blatt"><h3>Auswertung der Präsentation</h3><p class="r122-firma">${r122E(x.firma || '')}${A.am ? ' · Stand ' + r122E(r122Tag(A.am)) : ''}</p>
    <h4>Antworten</h4>${r122Antworten(A.stand)}
    <h4>Geöffnet</h4>${S.length ? '<ul class="r122-sitz">' + S.map(s => `<li><b>${r122E(r122Tag(s.am))}</b><span class="r122-m r122-${r122E(s.modus)}">${s.modus === 'termin' ? 'im Termin' : 'allein geöffnet'}</span><span>${r122E(r122Dauer(s.dauer_s))}${s.schritt ? ', bis „' + r122E(R122_SZN[s.schritt] || s.schritt) + '“' : ''}${s.ergebnis ? ', ' + (s.ergebnis === 'dabei' ? 'Ja' : 'Heute nicht') : ''}</span></li>`).join('') + '</ul>' : '<p class="note">Noch nicht geöffnet.</p>'}
    ${S.length ? '<h4>Zeit je Szene</h4>' + r122Balken(S) : ''}
    ${szMit.length ? `<h4>Wohin getippt wurde</h4><div class="r122-chips" id="r122Sz">${szMit.map((z, i) => `<button type="button" class="chip${i ? '' : ' on'}" data-sz="${z[0]}">${r122E(z[1])}</button>`).join('')}</div>
      <div class="r122-wb"><canvas id="r122Cv" aria-label="Wärmebild der Tipps"></canvas><ol id="r122Top"></ol></div>
      <p class="note">Die Punkte zeigen, wo auf dem Bildschirm getippt wurde, über alle Sitzungen. Die Liste nennt die Knöpfe.</p>` : ''}
    <p class="note r122-ds">Gespeichert werden Antworten, Dauer und Tipps zu diesem Link. Keine Adresse und keine Gerätekennung. Sitzungen fallen nach 12 Monaten weg.</p></div>`);
  const cv = document.getElementById('r122Cv'); if(!cv) return;
  const zeig = sz => { const L = K.filter(k => k[0] === sz && k[4] === hoch); r122Waerme(cv, L, hoch); const n = {}; K.filter(k => k[0] === sz && k[3]).forEach(k => { n[k[3]] = (n[k[3]] || 0) + 1; });
    document.getElementById('r122Top').innerHTML = Object.entries(n).sort((a, b) => b[1] - a[1]).slice(0, 8).map(e => `<li><span>${r122E(R122_GRUND[e[0]] || R122_PAKET[e[0]] || R122_VERB[e[0]] || R122_PLATZ[e[0]] || e[0])}</span><b>${e[1]}×</b></li>`).join('') || '<li><span>Nur Tipps neben die Knöpfe</span></li>'; };
  document.querySelectorAll('#r122Sz [data-sz]').forEach(b => b.onclick = () => { document.querySelectorAll('#r122Sz [data-sz]').forEach(y => y.classList.toggle('on', y === b)); zeig(b.dataset.sz); });
  zeig(szMit[0][0]); }

/* ---------- 3. „Wen ansprechen“: was Firmen wichtig war ---------- */
function r122Offen(x, grund){ const g = x.gebucht || []; return !(R122_PASST[grund] || []).some(k => g.includes(k)); }
function r122WichtigHtml(L){ const mit = L.filter(x => ((x.stand || {}).antrieb || []).length); if(!mit.length) return '<p class="note">Noch hat keine Firma in der Präsentation gesagt, was ihr wichtig ist. Die Antworten erscheinen hier von selbst.</p>';
  return Object.keys(R122_GRUND).map(g => { const F = mit.map(x => ({ x, rang: x.stand.antrieb.indexOf(g) })).filter(y => y.rang >= 0).sort((a, b) => a.rang - b.rang || String(a.x.firma).localeCompare(String(b.x.firma), 'de'));
    if(!F.length) return ''; const offen = F.filter(y => r122Offen(y.x, g)).length;
    return `<div class="r122-g" data-grund="${g}"><div class="r122-gk"><b>${r122E(R122_GRUND[g])}</b><small>${F.length} ${F.length === 1 ? 'Firma' : 'Firmen'}${offen ? ', davon ' + offen + ' ohne passende Buchung' : ''}</small></div>
      <div class="r122-gf">${F.map(y => `<button type="button" class="r122-f${r122Offen(y.x, g) ? ' offen' : ''}" data-r122="${r122E(y.x.deck)}"${y.x.sponsor ? ` data-spo="${r122E(y.x.sponsor)}"` : ''} title="${r122Offen(y.x, g) ? 'Hat dazu noch nichts gebucht' : 'Hat dazu schon etwas gebucht'}"><i>${y.rang + 1}</i>${r122E(y.x.firma)}</button>`).join('')}</div></div>`; }).join(''); }
async function r122Wichtig(B){ if(!B || B.querySelector('#r122W')) return; const L = await r122Laden(); if(!B.isConnected || B.querySelector('#r122W') || typeof SPO === 'undefined' || SPO.view !== 'ansprechen') return;
  const k = document.createElement('div'); k.className = 'card r122-w'; k.id = 'r122W';
  k.innerHTML = `<h3>Was Firmen in der Präsentation wichtig war</h3><p class="pp-nur">Aus den Antworten auf „Was wäre euch wichtig?“. Die Zahl ist der Rang, den die Firma dem Grund gegeben hat. Orange heißt: Dazu ist noch nichts gebucht.</p>${r122WichtigHtml(L)}`;
  B.appendChild(k); k.querySelectorAll('[data-r122]').forEach(b => b.onclick = () => r122Blatt(b.dataset.r122)); }
if(typeof ppRender === 'function'){ const _p = ppRender; ppRender = async function(B){ const r = await _p.apply(this, arguments); try{ await r122Wichtig(B); }catch(e){} return r; }; }

(function(){ try{ const s=document.createElement('style'); s.id='svm122css'; s.textContent="/* Beta 0.99.76 · Auswertung der Partnerreise */\n.r122-z{display:flex;flex-wrap:wrap;align-items:center;justify-content:space-between;gap:6px 12px;margin:8px 0 2px;padding-top:8px;border-top:1px dashed var(--line);}\n.r122-z small{font-size:12.5px;line-height:1.35;color:var(--ink2);min-width:0;flex:1 1 220px;}\n.r122-z small svg{width:13px;height:13px;vertical-align:-2px;}\n.r122-z .r122-leer{color:var(--ink3);}\n.r122-erg{font-weight:800;}\n.r122-erg.r122-dabei{color:#1f8a4c;}\n.r122-blatt h3{margin:0 0 2px;}\n.r122-blatt h4{margin:16px 0 6px;font-size:12.5px;letter-spacing:.08em;text-transform:uppercase;color:var(--ink3);}\n.r122-firma{margin:0;color:var(--ink2);font-size:13.5px;}\n.r122-dl{display:grid;grid-template-columns:minmax(110px,34%) 1fr;gap:6px 12px;margin:0;font-size:14px;line-height:1.35;}\n.r122-dl dt{color:var(--ink3);font-weight:700;}\n.r122-dl dd{margin:0;overflow-wrap:anywhere;}\n.r122-sitz{list-style:none;margin:0;padding:0;display:grid;gap:6px;font-size:13.5px;}\n.r122-sitz li{display:flex;flex-wrap:wrap;gap:4px 10px;align-items:baseline;padding:6px 0;border-bottom:1px solid var(--line);}\n.r122-m{font-size:11.5px;font-weight:800;letter-spacing:.04em;text-transform:uppercase;padding:2px 7px;border-radius:99px;border:1px solid var(--line);}\n.r122-m.r122-termin{border-color:#e8741f;color:#e8741f;}\n.r122-bal{display:grid;gap:5px;font-size:13px;}\n.r122-bal div{display:grid;grid-template-columns:minmax(120px,38%) 1fr 74px;gap:8px;align-items:center;}\n.r122-bal i{height:9px;border-radius:9px;background:var(--line);position:relative;overflow:hidden;}\n.r122-bal i::after{content:\"\";position:absolute;inset:0;width:calc(var(--w)*100%);background:#e8741f;border-radius:9px;}\n.r122-bal b{text-align:right;font-variant-numeric:tabular-nums;font-weight:700;}\n.r122-chips{display:flex;flex-wrap:wrap;gap:6px;margin-bottom:8px;}\n.r122-wb{display:grid;grid-template-columns:minmax(0,200px) minmax(0,1fr);gap:14px;align-items:start;}\n.r122-wb canvas{width:100%;height:auto;border-radius:10px;display:block;}\n.r122-wb ol{list-style:none;margin:0;padding:0;display:grid;gap:4px;font-size:13.5px;}\n.r122-wb li{display:flex;justify-content:space-between;gap:10px;padding:5px 0;border-bottom:1px solid var(--line);}\n.r122-ds{margin-top:14px;}\n.r122-w{margin-top:14px;}\n.r122-g{padding:10px 0;border-top:1px solid var(--line);}\n.r122-gk{display:flex;flex-wrap:wrap;justify-content:space-between;gap:2px 12px;align-items:baseline;}\n.r122-gk small{color:var(--ink3);font-size:12.5px;}\n.r122-gf{display:flex;flex-wrap:wrap;gap:6px;margin-top:7px;}\n.r122-f{display:inline-flex;align-items:center;gap:7px;padding:5px 11px 5px 5px;border-radius:99px;border:1px solid var(--line);background:none;color:inherit;font:inherit;font-size:13px;font-weight:700;cursor:pointer;max-width:100%;}\n.r122-f i{font-style:normal;display:grid;place-items:center;width:20px;height:20px;border-radius:50%;background:var(--line);font-size:11.5px;flex:none;}\n.r122-f.offen{border-color:#e8741f;}\n.r122-f.offen i{background:#e8741f;color:#fff;}\n@media (max-width:560px){ .r122-wb{grid-template-columns:1fr;} .r122-wb canvas{max-width:220px;} .r122-dl{grid-template-columns:1fr;gap:1px 0;} .r122-dl dd{margin-bottom:6px;} }\n"; document.head.appendChild(s); }catch(e){} })();
/* =====================================================================
   Sportzentrale Beta 0.99.84 · Verträge an einem Ort (Reiter „Verträge“ im Partner-Bereich)
   Albert, 18.11.2026: Leitung im Bereich Partner, Finanzen und alle Admins sollen alle Verträge einfach finden:
   die Fassung, wie die Firma unterschrieben hat, die Fassung mit unserer Unterschrift, beide Daten,
   bezahlt oder nicht bezahlt zum Antippen, und ob sich der Vertrag von selbst verlängert.
   Daten: vertraege_uebersicht() (199). Neues Konzept kommt aus partner_vertraege, alte Verträge trägt man hier ein.
   Die PDFs liegen fest in der Ablage (partner_vertrag_pdf): Was einmal abgelegt ist, ändert niemand mehr.
   Beta 0.99.85 · Der Vorstand unterschreibt auf Papier (200): Für den Verein zeichnet der Vorstand des Gesamtvereins,
   nicht die Abteilungsleitung, und der Vorstand hat kein Konto in der App. Darum an der Karte eines wartenden Vertrags:
   Fassung der Firma drucken, unterschreiben lassen, Scan eintragen (partner_vertrag_papier). Danach schickt ein eigener
   Tipp die Fassung mit beiden Unterschriften an die Firma. Von selbst geht dabei nichts raus.
   ===================================================================== */
const VT = { d:null, laden:null, filter:'alle', fehler:'' };
const vtE = s => svEsc(s == null ? '' : String(s));
function vtTag(iso){ if(!iso) return ''; const m = String(iso).slice(0, 10).split('-'); return m.length === 3 ? `${m[2]}.${m[1]}.${m[0]}` : ''; }
function vtEur(v){ return (Math.round((+v || 0) * 100) / 100).toLocaleString('de-DE', { minimumFractionDigits:2, maximumFractionDigits:2 }) + ' €'; }
function vtLaden(neu){ if(neu) VT.laden = null; if(!VT.laden) VT.laden = svtRpc('vertraege_uebersicht').then(d => { VT.d = d; VT.fehler = ''; return d; }).catch(e => { VT.laden = null; VT.fehler = String((e && e.message) || e); throw e; }); return VT.laden; }

// Was steht bei der Zahlung an? offen: Rechnung da und nicht bezahlt. kommt: Rechnung kommt noch. bezahlt. leer: nichts zu zahlen bekannt.
function vtZahl(v){
  if(v.k === 'alt') return v.bezahlt_am ? 'bezahlt' : (+v.netto_jahr > 0 ? 'offen' : 'leer');
  const r = v.rechnungen || []; if(r.some(x => x.status === 'offen')) return 'offen'; if(r.length) return 'bezahlt';
  return +v.netto_jahr > 0 ? 'kommt' : 'leer';
}
// Verlängerung prüfen: noch nicht geklärt, oder der letzte Kündigungstag liegt in den nächsten 120 Tagen
function vtPruefen(v){ if(v.auto == null) return true; if(!v.auto || !v.kuendigung_bis || !VT.d) return false; const t = (new Date(v.kuendigung_bis) - new Date(VT.d.heute)) / 864e5; return t >= 0 && t <= 120; }
const VT_FILTER = [['alle', 'Alle', () => true], ['gegen', 'Wartet auf unsere Unterschrift', v => v.k === 'neu' && v.status === 'unterschrieben'], ['senden', 'Noch an die Firma schicken', v => vtSendenOffen(v)], ['offen', 'Zahlung offen', v => vtZahl(v) === 'offen'], ['pruefen', 'Verlängerung prüfen', vtPruefen]];

// Auf Papier gegengezeichnet, aber die Firma hat die Fassung mit beiden Unterschriften noch nicht per Mail bekommen
function vtSendenOffen(v){ return v.k === 'neu' && v.status === 'aktiv' && v.gegen_art === 'papier' && !v.mail_gegen; }
// Wer laut Vereinsdaten im Vorstand ist: „Name (Funktion), Name (Funktion)“ wird zu Vorschlägen im Formular
function vtVorstand(){ return String((VT.d && VT.d.vorstand) || '').split(/,\s*(?![^()]*\))/).map(t => { const m = t.trim().match(/^(.+?)\s*\((.+)\)$/); return m ? { name:m[1].trim(), funktion:m[2].trim() } : null; }).filter(Boolean).slice(0, 8); }
function vtRegelSatz(){ const r = VT.d && VT.d.regel; return !r ? 'In den Vereinsdaten fehlt noch, wer den Verein laut Satzung vertritt.' : r === 'einzeln' ? 'Eine Unterschrift des Vorstands reicht.' : r === 'zwei_vorsitz' ? 'Es unterschreiben zwei aus dem Vorstand gemeinsam, eine davon ist der Erste oder der stellvertretende Vorsitzende.' : 'Es unterschreiben zwei aus dem Vorstand gemeinsam.'; }
function vtPapierHtml(v){
  if(!VT.d.pflegen) return '';
  if(v.k === 'neu' && v.status === 'unterschrieben'){ const pp = (v.pdfs || []).find(d => d.art === 'partner');
    return `<div class="vt-papier"><b>Für den Verein unterschreibt der Vorstand</b>
      <ol><li>Die Fassung der Firma drucken. ${pp ? `<button type="button" class="vt-link" data-vtpdf="${vtE(pp.id)}">PDF zum Drucken laden</button>` : `<button type="button" class="vt-link" data-vtlive="${vtE(v.id)}">PDF zum Drucken laden</button>`}</li>
      <li>Der Vorstand unterschreibt von Hand bei „Unterschrift des Vereins“, mit Name, Funktion und Datum. ${vtRegelSatz()}</li>
      <li>Den unterschriebenen Vertrag scannen und hier eintragen${v.bindung_bis ? `, spätestens am ${vtTag(v.bindung_bis)}` : ''}.</li></ol>
      <button type="button" class="btn" data-vtpapier="${vtE(v.id)}">Vorstand hat unterschrieben</button></div>`; }
  if(vtSendenOffen(v)) return `<div class="vt-papier"><b>Die Firma hat die Fassung mit beiden Unterschriften noch nicht bekommen</b>
      <p>Der Vertrag ist geschlossen. Schick der Firma jetzt den Scan, damit sie die Annahme in der Hand hat.</p>
      <button type="button" class="btn" data-vtsenden="${vtE(v.id)}">An die Firma schicken</button></div>`;
  return '';
}
function vtVerl(v){
  if(v.auto == null) return '<b class="vt-warn">Noch nicht geprüft</b>, ob sich der Vertrag von selbst verlängert';
  if(!v.auto) return v.ende ? `Endet am ${vtTag(v.ende)}, verlängert sich nicht von selbst` : 'Verlängert sich nicht von selbst';
  return 'Verlängert sich von selbst um je eine Saison' + (v.kuendigung_bis ? `, kündbar bis ${vtTag(v.kuendigung_bis)}` : v.kuendigung ? `. Kündigung: ${vtE(v.kuendigung)}` : '');
}
function vtZahlHtml(v){
  const kann = true;
  if(v.k === 'alt'){
    if(!(+v.netto_jahr > 0) && !v.bezahlt_am) return '<span class="vt-leer">Kein Betrag eingetragen</span>';
    return v.bezahlt_am ? `<span class="vt-ok">${SVI('check')} Saison ${vtE(VT.d.saison)} bezahlt am ${vtTag(v.bezahlt_am)}</span> <button type="button" class="vt-link" data-vtbez="a:${vtE(v.id)}:0">zurücknehmen</button>`
      : `<span class="vt-off">Saison ${vtE(VT.d.saison)} noch nicht bezahlt</span> <button type="button" class="vt-btn" data-vtbez="a:${vtE(v.id)}:1">Als bezahlt abhaken</button>`;
  }
  const r = v.rechnungen || [];
  if(!r.length) return +v.netto_jahr > 0 ? `<span class="vt-leer">Noch keine Rechnung${v.rechnung_tag && v.rechnung_tag > VT.d.heute ? `, sie kommt am ${vtTag(v.rechnung_tag)}` : v.status === 'unterschrieben' ? ', erst nach unserer Unterschrift' : ''}</span>` : '<span class="vt-leer">Kein Betrag</span>';
  return r.map(x => `<div class="vt-re"><span>${vtE(x.nr)} · ${vtEur(x.brutto)} brutto${x.von ? ` · ${vtTag(x.von)} bis ${vtTag(x.bis)}` : ''}</span> ${x.status === 'bezahlt'
    ? `<span class="vt-ok">${SVI('check')} bezahlt am ${vtTag(x.bezahlt_am)}</span> <button type="button" class="vt-link" data-vtbez="r:${vtE(x.id)}:0">zurücknehmen</button>`
    : `<span class="vt-off">offen${x.faellig ? `, fällig ${vtTag(x.faellig)}` : ''}</span> <button type="button" class="vt-btn" data-vtbez="r:${vtE(x.id)}:1">Als bezahlt abhaken</button>`}</div>`).join('');
}
const VT_PDF = { partner:'Wie die Firma unterschrieben hat', beide:'Mit beiden Unterschriften' };
function vtPdfHtml(v){
  const p = (v.pdfs || []).map(d => `<button type="button" class="vt-pdf" data-vtpdf="${vtE(d.id)}">${SVI('file')}<span><b>${vtE(VT_PDF[d.art] || d.name)}</b><small>abgelegt am ${vtTag(d.am)}</small></span></button>`).join('');
  const live = v.k === 'neu' ? `<button type="button" class="vt-link" data-vtlive="${vtE(v.id)}">Aktueller Stand als PDF</button>` : '';
  const hoch = VT.d.pflegen ? `<button type="button" class="vt-link" data-vthoch="${v.k === 'neu' ? 'v' : 'a'}:${vtE(v.id)}">PDF hochladen</button>` : '';
  return `<div class="vt-pdfs">${p || '<span class="vt-leer">Noch kein PDF abgelegt</span>'}</div><div class="vt-zus">${live}${hoch}${v.k === 'alt' && VT.d.pflegen ? `<button type="button" class="vt-link" data-vtalt="${vtE(v.id)}">Bearbeiten</button>` : ''}</div>`;
}
function vtKarte(v){
  const gegen = v.k === 'neu' && v.status === 'unterschrieben';
  const zeile = (k, w) => `<div><dt>${k}</dt><dd>${w}</dd></div>`;
  return `<article class="vt-k${gegen ? ' vt-gegen' : ''}" data-vt="${vtE(v.id)}">
    <header><div><h4>${vtE(v.firma)}</h4><p>${v.nr ? vtE(v.nr) + ' · ' : ''}${vtE(v.titel || '')}</p></div><span class="vt-tag ${v.k === 'neu' ? 'vt-neu' : 'vt-alt'}">${v.k === 'neu' ? 'Neues Konzept' : 'Alte Struktur'}</span></header>
    <dl>
      ${zeile('Firma', v.partner_am ? `unterschrieben am ${vtTag(v.partner_am)}${v.partner_name ? ' (' + vtE(v.partner_name) + ')' : ''}` : '<span class="vt-leer">Datum fehlt</span>')}
      ${zeile('Verein', v.verein_am ? `unterschrieben am ${vtTag(v.verein_am)}${v.verein_name ? ' (' + (v.verein_erste ? vtE(v.verein_erste) + ' und ' : '') + vtE(v.verein_name) + ')' : ''}${v.gegen_art === 'papier' ? ', auf Papier' : ''}` : gegen ? `<b class="vt-warn">Unterschrift fehlt noch</b>${v.bindung_bis ? `, die Firma ist bis ${vtTag(v.bindung_bis)} gebunden` : ''}` : '<span class="vt-leer">Datum fehlt</span>')}
      ${zeile('Laufzeit', v.beginn || v.ende ? `${v.beginn ? vtTag(v.beginn) : 'offen'} bis ${v.ende ? vtTag(v.ende) : 'offen'}` : '<span class="vt-leer">nicht eingetragen</span>')}
      ${zeile('Verlängerung', vtVerl(v))}
      ${zeile('Betrag', +v.netto_jahr > 0 ? `${vtEur(v.netto_jahr)} netto je Saison${v.k === 'neu' && +v.netto_gesamt > +v.netto_jahr ? `, ${vtEur(v.netto_gesamt)} über die Laufzeit` : ''}` : '<span class="vt-leer">nicht eingetragen</span>')}
      ${zeile('Zahlung', vtZahlHtml(v))}
    </dl>
    ${v.notiz ? `<p class="vt-notiz">${vtE(v.notiz)}</p>` : ''}
    ${vtPapierHtml(v)}
    <footer>${vtPdfHtml(v)}</footer></article>`;
}

function vtZeigen(B){
  if(!B) return;
  if(!VT.d){ B.innerHTML = `<div class="card"><div class="empty">${VT.fehler ? vtE(VT.fehler) : 'Lade Verträge …'}</div></div>`; if(!VT.fehler) vtLaden().then(() => { if(B.isConnected && SPO.view === 'vertraege') vtZeigen(B); }).catch(() => { if(B.isConnected && SPO.view === 'vertraege') vtZeigen(B); }); return; }
  const L = VT.d.liste || [], f = VT_FILTER.find(x => x[0] === VT.filter) || VT_FILTER[0], zeig = L.filter(f[2]);
  zeig.sort((a, b) => ((b.k === 'neu' && b.status === 'unterschrieben') - (a.k === 'neu' && a.status === 'unterschrieben')) || String(a.firma).localeCompare(String(b.firma), 'de'));
  B.innerHTML = `<div class="card vt"><div class="vt-kopf"><div><h3 class="trh">Verträge</h3><p class="note">Alle Verträge an einem Ort: wer wann unterschrieben hat, was bezahlt ist und ob sich der Vertrag von selbst verlängert. Die PDFs liegen so in der Ablage, wie sie unterschrieben wurden.</p></div>
      ${VT.d.pflegen ? '<button type="button" class="btn" id="vtNeu">Bestehenden Vertrag eintragen</button>' : ''}</div>
    <div class="vt-chips" role="group" aria-label="Auswahl">${VT_FILTER.map(x => `<button type="button" data-vtf="${x[0]}" class="${x[0] === VT.filter ? 'on' : ''}" aria-pressed="${x[0] === VT.filter}">${x[1]} (${L.filter(x[2]).length})</button>`).join('')}</div>
    ${zeig.length ? `<div class="vt-liste">${zeig.map(vtKarte).join('')}</div>` : `<div class="empty">${L.length ? 'In dieser Auswahl steht gerade kein Vertrag.' : 'Noch kein Vertrag in der Liste. Verträge aus der Präsentation erscheinen hier von selbst, bestehende Verträge trägst du oben ein.'}</div>`}</div>`;
  const neu = async () => { await vtLaden(true).catch(svtErr); if(B.isConnected && SPO.view === 'vertraege') vtZeigen(B); };
  B.querySelectorAll('[data-vtf]').forEach(b => b.onclick = () => { VT.filter = b.dataset.vtf; vtZeigen(B); });
  B.querySelectorAll('[data-vtpdf]').forEach(b => b.onclick = () => vtPdf(b.dataset.vtpdf, b));
  B.querySelectorAll('[data-vtlive]').forEach(b => b.onclick = () => spoVertragPdf(b.dataset.vtlive));
  B.querySelectorAll('[data-vtbez]').forEach(b => b.onclick = async () => { const [art, id, ja] = b.dataset.vtbez.split(':'); b.disabled = true;
    try{ await svtRpc('vertrag_bezahlt', { p: Object.assign({ bezahlt: ja === '1' }, art === 'r' ? { rechnung:id } : { altvertrag:id }) }); kToast(ja === '1' ? '✓ Als bezahlt abgehakt' : 'Zahlung zurückgenommen'); if(typeof PE !== 'undefined') PE.d = null; await neu(); }catch(e){ b.disabled = false; svtErr(e); } });
  B.querySelectorAll('[data-vthoch]').forEach(b => b.onclick = () => { const [art, id] = b.dataset.vthoch.split(':'); vtHoch(art, id, neu); });
  B.querySelectorAll('[data-vtalt]').forEach(b => b.onclick = () => vtAlt((VT.d.liste || []).find(x => x.id === b.dataset.vtalt), neu));
  const n = B.querySelector('#vtNeu'); if(n) n.onclick = () => vtAlt(null, neu);
  const finde = id => (VT.d.liste || []).find(x => x.id === id);
  B.querySelectorAll('[data-vtpapier]').forEach(b => b.onclick = () => vtPapier(finde(b.dataset.vtpapier), neu));
  B.querySelectorAll('[data-vtsenden]').forEach(b => b.onclick = () => vtSenden(finde(b.dataset.vtsenden), neu));
}
// Der Vorstand hat auf dem Ausdruck unterschrieben: wer, wann, dazu der Scan. Damit ist der Vertrag geschlossen (200).
function vtPapier(v, fertig){
  if(!v) return; const zwei = VT.d.regel !== 'einzeln', vs = vtVorstand();
  const wer = n => `<label>${zwei ? (n === 1 ? 'Erste Unterschrift: Name' : 'Zweite Unterschrift: Name') : 'Name'}<input id="vpN${n}" maxlength="80" autocomplete="off"></label><label>Funktion im Verein<input id="vpF${n}" maxlength="80" autocomplete="off" placeholder="z. B. 1. Vorsitzender"></label>`;
  const M = svModal(`<div class="vt-sheet"><h2>Vorstand hat unterschrieben</h2><p class="msub">${vtE(v.firma)}${v.nr ? ', ' + vtE(v.nr) : ''}. Trag ein, wer wann auf dem Ausdruck unterschrieben hat, und lade den Scan hoch. Damit ist der Vertrag geschlossen. An die Firma geht dabei noch nichts.</p>
    <div class="svt-form vt-form">
      <label class="vt-breit">Unterschrieben am<input type="date" id="vpD"${v.partner_am ? ` min="${vtE(String(v.partner_am).slice(0, 10))}"` : ''} max="${vtE(VT.d.heute)}"></label>
      ${vs.length ? `<div class="vt-breit vt-vs"><span>Aus dem Vorstand, zum Antippen:</span>${vs.map((x, i) => `<button type="button" data-vpvs="${i}">${vtE(x.name)}</button>`).join('')}</div>` : ''}
      ${wer(1)}${zwei ? wer(2) : ''}
      <label class="vt-breit">Scan des unterschriebenen Vertrags (PDF, höchstens 6 MB)<input type="file" id="vpS" accept="application/pdf,.pdf"></label>
      <label class="svt-cb vt-breit"><input type="checkbox" id="vpJ"><span>Die Unterschriften stehen auf genau der Fassung, die die Firma unterschrieben hat. Am Text wurde nichts geändert oder ergänzt.</span></label></div>
    <p class="note">${vtRegelSatz()} Am Handy scannst du über die Dateien-App oder die Notizen („Dokumente scannen“), das ergibt ein PDF.</p>
    <p class="vt-hin" id="vpH"></p><div class="btnrow"><button type="button" class="btn" id="vpOk">Vertrag abschließen</button></div></div>`);
  const g = id => M.querySelector(id), H = g('#vpH'), ok = g('#vpOk');
  M.querySelectorAll('[data-vpvs]').forEach(b => b.onclick = () => { const x = vs[+b.dataset.vpvs], n = !g('#vpN1').value.trim() ? 1 : (zwei && !g('#vpN2').value.trim() ? 2 : 0); if(!n) return; g('#vpN' + n).value = x.name; g('#vpF' + n).value = x.funktion; b.disabled = true; });
  ok.onclick = async () => { H.textContent = ''; const f = g('#vpS').files[0], w = n => g('#vpN' + n) ? g('#vpN' + n).value.trim() : '', fk = n => g('#vpF' + n) ? g('#vpF' + n).value.trim() : '';
    if(!g('#vpD').value){ H.textContent = 'Bitte das Datum eintragen, an dem der Vorstand unterschrieben hat.'; return; }
    if(w(1).length < 3 || fk(1).length < 3 || (zwei && (w(2).length < 3 || fk(2).length < 3))){ H.textContent = zwei ? 'Bitte beide Namen mit Funktion eintragen.' : 'Bitte Name und Funktion eintragen.'; return; }
    if(!f){ H.textContent = 'Bitte den Scan als PDF wählen.'; return; } if(f.size > 6e6){ H.textContent = 'Die Datei ist zu groß (höchstens 6 MB).'; return; }
    if(!g('#vpJ').checked){ H.textContent = 'Bitte bestätigen, dass es die Fassung der Firma ist.'; return; }
    ok.disabled = true;
    try{ const u = new Uint8Array(await f.arrayBuffer()); let s = ''; for(let i = 0; i < u.length; i += 0x8000) s += String.fromCharCode.apply(null, u.subarray(i, i + 0x8000));
      await svtRpc('partner_vertrag_papier', { p:{ vertrag:v.id, datum:g('#vpD').value, name1:w(1), funktion1:fk(1), name2:w(2), funktion2:fk(2), b64:btoa(s) } });
      closeOverlay(); kToast('✓ Vertrag ist geschlossen'); if(typeof PE !== 'undefined') PE.d = null; if(fertig) await fertig();
      const n = (VT.d && VT.d.liste || []).find(x => x.id === v.id); if(n && vtSendenOffen(n)) vtSenden(n, fertig); }
    catch(e){ ok.disabled = false; H.textContent = String((e && e.message) || e); } };
}
// Ein Tipp schickt der Firma den Scan mit beiden Unterschriften (partner-deck). Vorher sagt das Blatt, was rausgeht.
function vtSenden(v, fertig){
  if(!v) return;
  const M = svModal(`<div class="vt-sheet"><h2>An die Firma schicken</h2><p class="msub">${vtE(v.firma)}${v.nr ? ', ' + vtE(v.nr) : ''}</p>
    ${v.hat_mail ? `<p>Die Firma bekommt eine Mail mit dem Scan im Anhang: ihr Vertrag mit den Unterschriften des Vorstands. Eine Kopie geht an die Adresse des Vereins. Eine offene erste Rechnung liegt als eigenes PDF bei.</p>`
      : `<p>Bei dieser Firma ist keine E-Mail-Adresse hinterlegt. Trag sie in der Akte der Firma ein, oder gib ihr die Fassung mit beiden Unterschriften persönlich.</p>`}
    <p class="vt-hin" id="vsH"></p><div class="btnrow">${v.hat_mail ? '<button type="button" class="btn" id="vsOk">Jetzt schicken</button>' : ''}<button type="button" class="btn ghost" id="vsSp">${v.hat_mail ? 'Später' : 'Schließen'}</button></div></div>`);
  const ok = M.querySelector('#vsOk'), H = M.querySelector('#vsH'); M.querySelector('#vsSp').onclick = () => closeOverlay();
  if(ok) ok.onclick = async () => { ok.disabled = true; H.textContent = '';
    try{ const { data, error } = await SVB.sb.functions.invoke('partner-deck', { body:{ vertrag:v.id } }); if(error) throw error;
      if(!data || !data.ok) throw new Error((data && data.fehler) || (data && data.eingerichtet === false ? 'Der Mail-Versand ist nicht eingerichtet.' : 'Die Mail ging nicht raus.'));
      closeOverlay(); kToast(data.schon ? '✓ War schon verschickt' : '✓ Mail ist raus' + (data.an ? ' an ' + data.an : '')); fertig && fertig(); }
    catch(e){ ok.disabled = false; H.textContent = String((e && e.message) || e); } };
}
async function vtPdf(id, b){
  if(b) b.disabled = true;
  try{ const d = await svtRpc('vertrag_pdf', { p_id:id }); const s = atob(d.data), u = new Uint8Array(s.length); for(let i = 0; i < s.length; i++) u[i] = s.charCodeAt(i); spoDownload(new Blob([u], { type:'application/pdf' }), d.name); }
  catch(e){ svtErr(e); } finally { if(b) b.disabled = false; }
}
// PDF hochladen: ein Scan oder das Original aus einer Mail. Danach bleibt es, wie es ist.
function vtHoch(art, id, fertig){
  const M = svModal(`<div class="vt-sheet"><h2>PDF hochladen</h2><p class="msub">Zum Beispiel der unterschriebene Vertrag als Scan. Die Datei bleibt danach unverändert in der Ablage.</p>
    <div class="svt-form"><label>Datei (PDF, höchstens 6 MB)<input type="file" id="vtF" accept="application/pdf,.pdf"></label>
      <label>Bezeichnung<input id="vtN" maxlength="160" placeholder="z. B. Vertrag mit beiden Unterschriften, Scan"></label></div>
    <p class="vt-hin" id="vtH"></p><div class="btnrow"><button type="button" class="btn" id="vtOk">Hochladen</button></div></div>`);
  const F = M.querySelector('#vtF'), N = M.querySelector('#vtN'), H = M.querySelector('#vtH'), ok = M.querySelector('#vtOk');
  F.onchange = () => { const f = F.files[0]; if(f && !N.value.trim()) N.value = f.name.replace(/\.pdf$/i, ''); };
  ok.onclick = async () => { const f = F.files[0]; H.textContent = '';
    if(!f){ H.textContent = 'Bitte eine Datei wählen.'; return; } if(f.size > 6e6){ H.textContent = 'Die Datei ist zu groß (höchstens 6 MB).'; return; } if(!N.value.trim()){ H.textContent = 'Bitte eine Bezeichnung eintragen.'; return; }
    ok.disabled = true;
    try{ const u = new Uint8Array(await f.arrayBuffer()); let s = ''; for(let i = 0; i < u.length; i += 0x8000) s += String.fromCharCode.apply(null, u.subarray(i, i + 0x8000));
      await svtRpc('vertrag_pdf_hochladen', { p: Object.assign({ name:N.value.trim(), b64:btoa(s) }, art === 'v' ? { vertrag:id } : { altvertrag:id }) }); closeOverlay(); kToast('✓ PDF liegt in der Ablage'); fertig && fertig(); }
    catch(e){ ok.disabled = false; H.textContent = String((e && e.message) || e); } };
}
// Vertrag der alten Struktur eintragen oder ändern
function vtAlt(v, fertig){
  const neu = !v; v = v || {}; const F = (SPO.S || []).slice().sort((a, b) => String(a.firma).localeCompare(String(b.firma), 'de'));
  const M = svModal(`<div class="vt-sheet"><h2>${neu ? 'Bestehenden Vertrag eintragen' : 'Vertrag bearbeiten'}</h2><p class="msub">Für Verträge, die nicht über die Präsentation geschlossen wurden. Das PDF lädst du danach an der Karte hoch.</p>
    <div class="svt-form vt-form">
      ${neu ? `<label class="vt-breit">Firma<select id="vaF"><option value="">Bitte wählen</option>${F.map(x => `<option value="${vtE(x.id)}">${vtE(x.firma)}</option>`).join('')}</select></label>` : `<p class="vt-breit vt-firma">${vtE(v.firma)}</p>`}
      <label class="vt-breit">Bezeichnung<input id="vaT" maxlength="120" value="${vtE(v.titel || '')}" placeholder="z. B. Werbevertrag Bande"></label>
      <label>Firma hat unterschrieben am<input type="date" id="vaP" value="${vtE(v.partner_am || '')}"></label>
      <label>Verein hat unterschrieben am<input type="date" id="vaV" value="${vtE(v.verein_am || '')}"></label>
      <label>Beginn<input type="date" id="vaB" value="${vtE(v.beginn || '')}"></label>
      <label>Ende<input type="date" id="vaE" value="${vtE(v.ende || '')}"></label>
      <label class="vt-breit">Verlängert sich der Vertrag von selbst?<select id="vaA"><option value="">Noch nicht geprüft</option><option value="ja" ${v.auto === true ? 'selected' : ''}>Ja, er verlängert sich von selbst</option><option value="nein" ${v.auto === false ? 'selected' : ''}>Nein, er endet zum Enddatum</option></select></label>
      <label class="vt-breit">Kündigung (wie im Vertrag)<input id="vaK" maxlength="200" value="${vtE(v.kuendigung || '')}" placeholder="z. B. bis einen Monat vor dem 30.04."></label>
      <label>Betrag je Jahr, netto in €<input id="vaG" inputmode="decimal" value="${v.netto_jahr != null ? String(v.netto_jahr).replace('.', ',') : ''}"></label>
      <label class="vt-breit">Notiz<input id="vaN" maxlength="1000" value="${vtE(v.notiz || '')}"></label></div>
    <p class="vt-hin" id="vaH"></p><div class="btnrow"><button type="button" class="btn" id="vaOk">Speichern</button></div></div>`);
  const g = id => M.querySelector(id), H = g('#vaH'), ok = g('#vaOk');
  ok.onclick = async () => { H.textContent = ''; const betrag = g('#vaG').value.trim().replace(/\s|€/g, '').replace(/\.(?=\d{3}(\D|$))/g, '').replace(',', '.');
    if(betrag && !/^\d+(\.\d{1,2})?$/.test(betrag)){ H.textContent = 'Bitte den Betrag als Zahl eintragen, zum Beispiel 500 oder 499,50.'; return; }
    ok.disabled = true;
    try{ await svtRpc('altvertrag_speichern', { p:{ id:v.id || null, sponsor:neu ? g('#vaF').value : null, titel:g('#vaT').value, partner_am:g('#vaP').value, verein_am:g('#vaV').value, beginn:g('#vaB').value, ende:g('#vaE').value,
        auto_verl:g('#vaA').value, kuendigung:g('#vaK').value, betrag_jahr:betrag, notiz:g('#vaN').value } }); closeOverlay(); kToast('✓ Vertrag gespeichert'); fertig && fertig(); }
    catch(e){ ok.disabled = false; H.textContent = String((e && e.message) || e); } };
}

// Reiter einhängen: hinter der Zentrale in der Verwaltung, nur für alle, die Verträge sehen dürfen (der Server prüft es noch einmal)
if(typeof SPO_REITER !== 'undefined' && !SPO_REITER.some(r => r[0] === 'vertraege')){ const i = SPO_REITER.findIndex(r => r[0] === 'steuerung'); SPO_REITER.splice(i < 0 ? SPO_REITER.length : i, 0, ['vertraege', 'Verträge']); }
if(typeof S120_GRUPPEN !== 'undefined'){ const g = S120_GRUPPEN.find(x => x[0] === 'verwaltung'); if(g && !g[2].includes('vertraege')) g[2].unshift('vertraege'); }
if(typeof spoBody === 'function'){ const _b = spoBody; spoBody = function(){ if(SPO.view === 'vertraege'){ const B = document.getElementById('spoB'); if(B){ VT.laden = null; VT.d = null; vtZeigen(B); } return; } return _b.apply(this, arguments); }; }

(function(){ try{ const s=document.createElement('style'); s.id='svm123css'; s.textContent="/* Beta 0.99.84 · Verträge an einem Ort */\n.vt-kopf{display:flex;flex-wrap:wrap;gap:10px 16px;align-items:flex-start;justify-content:space-between;margin-bottom:10px;}\n.vt-kopf>div{flex:1 1 260px;min-width:0;}\n.vt-kopf .note{margin:4px 0 0;}\n.vt-chips{display:flex;flex-wrap:wrap;gap:6px;margin:0 0 12px;}\n.vt-chips button{font:inherit;font-size:13px;font-weight:700;padding:7px 12px;border-radius:99px;border:1px solid var(--line);background:transparent;color:var(--ink2);cursor:pointer;min-height:36px;}\n.vt-chips button.on{background:#e8741f;border-color:#e8741f;color:#fff;}\n.vt-liste{display:grid;gap:12px;}\n.vt-k{border:1px solid var(--line);border-radius:14px;padding:14px;display:grid;gap:10px;min-width:0;}\n.vt-k.vt-gegen{border-color:#e8741f;box-shadow:inset 3px 0 0 #e8741f;}\n.vt-k header{display:flex;gap:10px;justify-content:space-between;align-items:flex-start;}\n.vt-k header>div{min-width:0;}\n.vt-k h4{margin:0;font-size:16.5px;line-height:1.25;overflow-wrap:anywhere;}\n.vt-k header p{margin:2px 0 0;font-size:13px;color:var(--ink3);overflow-wrap:anywhere;}\n.vt-tag{flex:none;font-size:11px;font-weight:800;letter-spacing:.05em;text-transform:uppercase;padding:3px 8px;border-radius:99px;border:1px solid var(--line);color:var(--ink3);white-space:nowrap;}\n.vt-tag.vt-neu{border-color:#1f8a4c;color:#1f8a4c;}\n.vt-k dl{margin:0;display:grid;gap:6px;font-size:14px;line-height:1.4;}\n.vt-k dl>div{display:grid;grid-template-columns:minmax(92px,22%) 1fr;gap:4px 12px;}\n.vt-k dt{color:var(--ink3);font-weight:700;}\n.vt-k dd{margin:0;min-width:0;overflow-wrap:anywhere;}\n.vt-leer{color:var(--ink3);}\n.vt-warn{color:#c2570c;}\n.vt-ok{color:#1f8a4c;font-weight:700;}\n.vt-ok svg{width:14px;height:14px;vertical-align:-2px;}\n.vt-off{color:#c2570c;font-weight:700;}\n.vt-re{display:flex;flex-wrap:wrap;gap:4px 10px;align-items:center;padding:2px 0;}\n.vt-btn{font:inherit;font-size:13px;font-weight:700;padding:6px 12px;border-radius:9px;border:1px solid #1f8a4c;background:transparent;color:#1f8a4c;cursor:pointer;min-height:34px;}\n.vt-link{font:inherit;font-size:13px;font-weight:600;padding:6px 4px;border:0;background:none;color:var(--ink3);text-decoration:underline;cursor:pointer;min-height:34px;}\n.vt-notiz{margin:0;font-size:13px;color:var(--ink2);}\n.vt-k footer{display:grid;gap:6px;border-top:1px dashed var(--line);padding-top:10px;}\n.vt-pdfs{display:flex;flex-wrap:wrap;gap:8px;}\n.vt-pdf{display:flex;gap:8px;align-items:center;text-align:left;font:inherit;padding:8px 12px;border-radius:10px;border:1px solid var(--line);background:transparent;color:inherit;cursor:pointer;min-height:44px;max-width:100%;}\n.vt-pdf svg{width:18px;height:18px;flex:none;color:#e8741f;}\n.vt-pdf span{display:grid;min-width:0;}\n.vt-pdf b{font-size:13.5px;overflow-wrap:anywhere;}\n.vt-pdf small{font-size:12px;color:var(--ink3);}\n.vt-zus{display:flex;flex-wrap:wrap;gap:2px 14px;}\n.vt-form{display:grid;grid-template-columns:1fr 1fr;gap:10px;}\n.vt-form .vt-breit{grid-column:1/-1;}\n.vt-firma{margin:0;font-weight:800;}\n.vt-hin{min-height:1.3em;margin:8px 0 0;font-size:13.5px;color:#c2570c;}\n@media(max-width:560px){.vt-form{grid-template-columns:1fr;}.vt-k dl>div{grid-template-columns:1fr;gap:0;}.vt-k dt{font-size:12px;text-transform:uppercase;letter-spacing:.05em;}}\n/* Beta 0.99.85 · Der Vorstand unterschreibt auf Papier */\n.vt-papier{display:grid;gap:8px;justify-items:start;border-radius:12px;padding:12px 14px;background:color-mix(in srgb,#e8741f 9%,transparent);font-size:14px;line-height:1.45;}\n.vt-papier ol{margin:0;padding-left:20px;display:grid;gap:4px;}\n.vt-papier p{margin:0;}\n.vt-papier .vt-link{padding:0 2px;min-height:0;color:inherit;font-weight:700;}\n.vt-vs{display:flex;flex-wrap:wrap;gap:6px;align-items:center;font-size:13px;color:var(--ink3);}\n.vt-vs span{flex:1 1 100%;}\n.vt-vs button{font:inherit;font-size:13px;font-weight:700;padding:7px 12px;border-radius:99px;border:1px solid var(--line);background:transparent;color:var(--ink2);cursor:pointer;min-height:36px;}\n.vt-vs button:disabled{opacity:.45;cursor:default;}\n"; document.head.appendChild(s); }catch(e){} })();
/* =====================================================================
   Sportzentrale Beta 0.99.86 · Seitenleiste am Rechner mit denselben Ordnern wie das Menü am Handy
   Sportliche Leitung, 18.11.2026: „In der Browser Version ist die Strukturierung nicht gleich.“ Am Handy stehen acht Ordner
   (Planung & Termine, Senioren, Jugend, Veranstaltungen, Partner, Verein, Kommunikation, Verwaltung), am Rechner standen dieselben
   Bereiche alle aufgeklappt untereinander, und der erste hieß „Übersicht“. Albert: „Ordner wie am Handy.“
   Jetzt in der Leiste am Rechner (ab 761 px, also auch in der schmalen Leiste mit Symbolen auf kleinen Laptops: dort war es eine
   Spalte mit über 20 Symbolen ohne jede Gliederung): „Heute“ steht oben allein, jeder Bereich ist eine Zeile zum Aufklappen. Offen ist
   der Bereich der Seite, auf der man gerade ist, dazu höchstens einer, den man selbst aufklappt. Ein Bereich mit nur einer Seite bleibt offen.
   Die Knöpfe, ihre Rechte und die Unterseiten (svm88) ändern sich nicht: Diese Datei blendet nur aus (Klasse s124-zu) und ordnet nichts um,
   außer „Heute“ nach oben.
   In automatischen Tests aus, window.S115_TEST schaltet es ein (wie die Ordner am Handy aus svm115 und svm121).
   ===================================================================== */
const S124 = { offen:null };
const s124An = () => !(navigator.webdriver && !window.S115_TEST);
const s124Breit = () => matchMedia('(min-width:761px)').matches;   // breite Leiste und die schmale mit Symbolen (kleiner Laptop, Tablet quer)
const s124Name = g => g === 'Übersicht' && typeof S121_NAME !== 'undefined' ? S121_NAME : g;
// Der Bereich, zu dem die offene Seite gehört
function s124Aktiv(nav){ const a = nav.querySelector(':scope > button[data-tab].active'); let n = a; while(n && !(n.classList && n.classList.contains('sgrp'))) n = n.previousElementSibling; return n ? n.dataset.n77g : null; }
function s124Stand(){
  try{
    const nav = document.querySelector('.side .snav'); if(!nav) return;
    const an = s124An() && s124Breit();
    if(!an){ nav.querySelectorAll('.s124-zu').forEach(x => x.classList.remove('s124-zu'));
      nav.querySelectorAll(':scope > .sgrp.s124-k').forEach(h => { h.classList.remove('s124-k'); h.removeAttribute('role'); h.removeAttribute('tabindex'); h.removeAttribute('aria-expanded'); if(h.dataset.n77g && h.textContent !== h.dataset.n77g) h.textContent = h.dataset.n77g; });
      return; }
    // „Heute“ steht über den Bereichen
    const heute = nav.querySelector(':scope > button[data-tab="home"]'), erster = nav.querySelector(':scope > .sgrp');
    if(heute && erster && heute.previousElementSibling !== null && erster.compareDocumentPosition(heute) & Node.DOCUMENT_POSITION_FOLLOWING) nav.insertBefore(heute, erster);
    const akt = s124Aktiv(nav), sicht = b => b.style.display !== 'none' && !(b.classList.contains('adm-only') && typeof canManage === 'function' && !canManage());
    let kopf = null, teile = [];
    const fertig = () => { if(!kopf) return; const g = kopf.dataset.n77g, n = teile.filter(x => x.matches('button[data-tab]') && sicht(x)).length;
      const ordner = g !== 'App' && n > 1, auf = !ordner || g === akt || g === S124.offen;
      const name = ordner ? s124Name(g) : g; if(kopf.textContent !== name) kopf.textContent = name;
      kopf.classList.toggle('s124-k', ordner);
      if(ordner){ kopf.setAttribute('role', 'button'); kopf.tabIndex = 0; kopf.setAttribute('aria-expanded', auf ? 'true' : 'false'); }
      else { kopf.removeAttribute('role'); kopf.removeAttribute('tabindex'); kopf.removeAttribute('aria-expanded'); }
      teile.forEach(x => x.classList.toggle('s124-zu', !auf)); };
    [...nav.children].forEach(c => { if(c.classList.contains('sgrp')){ fertig(); kopf = c; teile = []; } else if(kopf) teile.push(c); else c.classList.remove('s124-zu'); });
    fertig();
  }catch(e){ console.warn('Seitenleiste 0.99.86', e); }
}
function s124Klick(h){ if(!h.classList.contains('s124-k')) return; const g = h.dataset.n77g; S124.offen = S124.offen === g ? null : g; s124Stand(); }
document.addEventListener('click', e => { const h = e.target.closest && e.target.closest('.side .snav > .sgrp.s124-k'); if(h) s124Klick(h); });
document.addEventListener('keydown', e => { if(e.key !== 'Enter' && e.key !== ' ') return; const h = e.target.closest && e.target.closest('.side .snav > .sgrp.s124-k'); if(h){ e.preventDefault(); s124Klick(h); } });
// Nach jedem Ordnen und Zeichnen der Leiste neu einteilen. Beim Wechsel der Seite ist nur der Bereich der neuen Seite offen.
if(typeof n77Seite === 'function'){ const _s = n77Seite; n77Seite = function(){ const r = _s.apply(this, arguments); s124Stand(); return r; }; }
if(typeof n88Zeichnen === 'function'){ const _z = n88Zeichnen; n88Zeichnen = function(){ const r = _z.apply(this, arguments); s124Stand(); return r; }; }
if(typeof sv4NavVis === 'function'){ const _v = sv4NavVis; sv4NavVis = function(){ const r = _v.apply(this, arguments); s124Stand(); return r; }; }
if(typeof goTab === 'function'){ const _g = goTab; goTab = function(){ let von = null; try{ von = svCurTab(); }catch(e){} const r = _g.apply(this, arguments); try{ if(von !== svCurTab()) S124.offen = null; }catch(e){} s124Stand(); setTimeout(s124Stand, 0); return r; }; }
addEventListener('resize', s124Stand, { passive:true });
setTimeout(s124Stand, 0);

(function(){ try{ const s=document.createElement('style'); s.id='svm124css'; s.textContent="/* Beta 0.99.86 · Seitenleiste am Rechner: Bereiche als Ordner wie im Menü am Handy */\n@media(min-width:1181px){\n  .side .snav .sgrp.s124-k{display:flex;align-items:center;justify-content:space-between;gap:8px;cursor:pointer;user-select:none;-webkit-user-select:none;padding:10px 12px;margin-top:2px;border-radius:9px;font-size:11.5px;color:var(--ink2);}\n  .side .snav .sgrp.s124-k::after{content:\"\";flex:none;width:6px;height:6px;margin-right:5px;border-right:1.6px solid currentColor;border-bottom:1.6px solid currentColor;transform:rotate(-45deg);transition:transform .15s ease;opacity:.75;}\n  .side .snav .sgrp.s124-k[aria-expanded=\"true\"]::after{transform:rotate(45deg);}\n  .side .snav .sgrp.s124-k[aria-expanded=\"true\"]{color:var(--ink);}\n  .side .snav .sgrp.s124-k:hover{background:var(--line2);color:var(--ink);}\n  .side .snav .sgrp.s124-k:focus-visible{outline:2px solid #3b78ff;outline-offset:-2px;}\n}\n@media(min-width:761px){.side .snav .s124-zu{display:none!important;}}\n/* Schmale Leiste mit Symbolen (kleiner Laptop): der Name des Bereichs als kleine Zeile, darunter klappen seine Symbole auf */\n@media(min-width:761px) and (max-width:1180px){\n  .side .snav .sgrp.s124-k{display:block;height:auto;border-top:0;margin:2px 4px 0;padding:7px 2px 6px;font-size:11px;line-height:1.15;font-weight:700;letter-spacing:0;text-transform:none;text-align:center;color:var(--ink2);cursor:pointer;user-select:none;-webkit-user-select:none;border-radius:9px;hyphens:auto;-webkit-hyphens:auto;overflow-wrap:anywhere;}\n  .side .snav .sgrp.s124-k::after{content:\"\";display:block;width:5px;height:5px;margin:5px auto 0;border-right:1.5px solid currentColor;border-bottom:1.5px solid currentColor;transform:rotate(45deg);opacity:.7;}\n  .side .snav .sgrp.s124-k[aria-expanded=\"true\"]{color:var(--ink);background:var(--line2);}\n  .side .snav .sgrp.s124-k[aria-expanded=\"true\"]::after{transform:rotate(-135deg);margin-top:8px;}\n  .side .snav .sgrp.s124-k:hover{background:var(--line2);color:var(--ink);}\n  .side .snav .sgrp.s124-k:focus-visible{outline:2px solid #3b78ff;outline-offset:-2px;}\n}\n@media(prefers-reduced-motion:reduce){.side .snav .sgrp.s124-k::after{transition:none;}}\n"; document.head.appendChild(s); }catch(e){} })();
/* =====================================================================
   Beta 0.99.90 · Bandenplan ab Saison 2027/28 (gehört zum Bandenplan, svm101.js, und zum Bandencreator, svm79.js)
   Albert, 18.11.2026: „Da braucht man so einen einfachen Switch: aktuell und ab Saison 27/28. An der Mittellinie eine
   Doppelbande, jeweils vier Doppelbanden links und rechts von den großen Partnern, daneben einfache Banden, die noch
   komplett frei sind. Die gilt es nach und nach zu besetzen. Alles in unserem CI: einfach Logo und Name.“
   - Schalter über dem Plan. „Aktuell“ ist der Plan, wie er war. „Ab Saison 2027/28“ zeigt die geplante Reihe gegenüber vom
     Clubhaus (207_banden_plan.sql): Was heute hängt, bleibt unberührt.
   - Die Reihe liegt mit der Doppelbande in der Mitte genau auf der Mittellinie (bpNordPunkt aus svm101.js).
   - Antippen zeigt den Platz mit einer Vorschau im Partner-CI (weiße Bande, Marine, nur Logo und Name).
   - Eintragen, vormerken, frei machen: Admin, Vorstand und die Leitung im Bereich Partner (darf vom Server).
   ===================================================================== */
const B27 = { saison:2027, modus:'neu', modi:new Map(), ciListe:null, d:null, laedt:null, sel:null, err:null, kam:null, tex:new Map(), boxen:[], pxm:40 };
const B27_L = { doppel:5, einzel:2.5 };
const b27Name = s => s.art === 'doppel' ? 'Doppelbande' : 'Einzelbande';
const b27Saison = () => B27.saison + '/' + String(B27.saison + 1).slice(-2);
async function b27Laden(neu){ if(B27.laedt && !neu) return B27.laedt;
  B27.laedt = bcRpc('banden_plan_laden', { p_saison:B27.saison }).then(d => { B27.d = d; B27.ciListe=null; B27.err = null; return d; }).catch(e => { B27.err = e.message; B27.laedt = null; throw e; }); return B27.laedt; }
// Lage der Plätze: von links nach rechts, die Doppelbande „mitte“ liegt mit ihrer Mitte auf der Mittellinie
function b27Reihe(){ if(B27._r && B27._rd === B27.d) return B27._r; B27._rd = B27.d; const S = ((B27.d && B27.d.slots) || []).slice().sort((a, b) => a.pos - b.pos); if(!S.length) return (B27._r = []);
  const mi = Math.max(0, S.findIndex(s => s.rolle === 'mitte')); let x = -(S.slice(0, mi).reduce((t, s) => t + B27_L[s.art], 0) + B27_L[S[mi].art] / 2);
  return (B27._r = S.map((s, i) => { const l = B27_L[s.art], o = Object.assign({ s, l, s0:x, i, mi }, bpNordPunkt(x + l / 2)); x += l; return o; })); }
// Kennung je Platz, von links nach rechts vom Rasen aus: D1 bis D9 für die Doppelbanden, E1 bis E24 für die Einzelbanden.
// Bewusst mit Buchstaben: Die Banden von heute haben blanke Nummern (bandenplaetze.nummer), die in Angeboten stehen und bleiben.
function b27Nr(o){ const R = b27Reihe(), k = R.filter(x => x.s.art === o.s.art && x.i <= o.i).length; return (o.s.art === 'doppel' ? 'D' : 'E') + k; }
// Wo der Platz steht, in Worten
function b27Wo(o){ const s = o.s; if(s.rolle === 'mitte') return 'Doppelbande an der Mittellinie'; const seite = o.i < o.mi ? 'links' : 'rechts', R = b27Reihe();
  if(s.art === 'doppel'){ const n = Math.abs(o.i - o.mi); return `Doppelbande, die ${n}. ${seite} von der Mittellinie`; }
  const D = R.filter(x => x.s.art === 'doppel'), rand = seite === 'links' ? D[0].i : D[D.length - 1].i, n = Math.abs(o.i - rand);
  return `Einzelbande, die ${n}. ${seite} neben den Doppelbanden`; }
function b27Zahlen(){ const S = (B27.d && B27.d.slots) || [], z = (art, f) => S.filter(s => s.art === art && f(s)).length;
  return { d:z('doppel', () => true), dv:z('doppel', s => s.stand !== 'frei'), e:z('einzel', () => true), ev:z('einzel', s => s.stand !== 'frei') }; }

function b27Svg(){ const R = b27Reihe(), G2 = BP.G / 2, D = BP.DICK, f = n => (+n).toFixed(2);
  const oval = r => `M${-G2},${-r} L${G2},${-r} A${r},${r} 0 0 1 ${G2},${r} L${-G2},${r} A${r},${r} 0 0 1 ${-G2},${-r} Z`;
  const tx = (x, y, t, o) => `<text x="${x}" y="${y}" class="bp-t" text-anchor="middle"${o && o.r ? ` transform="rotate(${o.r} ${x} ${y})"` : ''}>${bpE(t)}</text>`;
  const slots = R.map(o => `<g class="b27-s ${o.s.art} ${o.s.rolle} ${o.s.stand}${B27.sel === o.s.id ? ' an' : ''}" data-b27="${o.s.id}" transform="translate(${f(o.x)} ${f(o.y)}) rotate(${(+o.w).toFixed(1)})"><title>${bpE(b27Wo(o) + ': ' + (o.s.firma ? bpFirma(o.s.firma) : 'frei'))}</title><rect x="${f(-o.l / 2 + .18)}" y="${f(-D / 2)}" width="${f(o.l - .36)}" height="${D}" rx=".6"/></g>`).join('');
  const nummern = R.map(o => (o.s.art === 'doppel' || /^E(1|6|12|13|19|24)$/.test(b27Nr(o))) ? `<text class="bp-nr b27-nr" x="${f(o.x + o.nx * 4.4)}" y="${f(o.y + o.ny * 4.4)}" text-anchor="middle" dominant-baseline="central">${b27Nr(o)}</text>` : '').join('');
  const a = R.find(o => o.s.id === B27.sel), zeig = a ? `<g class="bp-zeig"><line x1="${f(a.x + a.nx * 2.4)}" y1="${f(a.y + a.ny * 2.4)}" x2="${f(a.x + a.nx * 5.2)}" y2="${f(a.y + a.ny * 5.2)}"/></g>` : '';
  return `<svg viewBox="-106 -70 212 140" role="img" aria-label="Plan vom Hauptplatz mit der Bandenreihe ab Saison ${b27Saison()}. Die Leiste darunter nennt jeden Platz einzeln.">
    <path d="${oval(BP.RA)}" fill="#b56a45"/><path d="${oval(BP.RI)}" fill="#5c9443"/>
    <g fill="none" stroke="rgba(255,255,255,.82)" stroke-width=".55"><rect x="-50" y="-32" width="100" height="64"/><line x1="0" y1="-32" x2="0" y2="32"/><circle cx="0" cy="0" r="9.15"/>
      <rect x="-50" y="-20.15" width="16.5" height="40.3"/><rect x="33.5" y="-20.15" width="16.5" height="40.3"/><rect x="-50" y="-9.15" width="5.5" height="18.3"/><rect x="44.5" y="-9.15" width="5.5" height="18.3"/></g>
    <line class="b27-ml" x1="0" y1="${f(-BP.NORD + D)}" x2="0" y2="-32"/>
    <rect x="-6" y="55" width="60" height="11" rx="1.2" fill="#d9d2c3" stroke="#8a8377" stroke-width=".4"/>
    ${tx(24, 62.2, 'Clubhaus')}${tx(-62, -61, 'Spielplatz')}${tx(-101, 0, 'Kunstrasen', { r:-90 })}${tx(101, 0, 'Schulstraße', { r:90 })}${tx(0, -62, 'Mittellinie')}
    ${slots}<g class="bp-nrn" aria-hidden="true">${nummern}</g>${zeig}</svg>`; }
// Die Reihe als ein Band im Maßstab: am Handy sind die Plätze im Plan sehr schmal
function b27Band(){ return `<div class="b27-band" id="b27Band" aria-hidden="true">${b27Reihe().map(o => `<i class="${o.s.art} ${o.s.rolle} ${o.s.stand}${B27.sel === o.s.id ? ' an' : ''}" data-b27="${o.s.id}" style="flex:${o.l}"></i>`).join('')}</div><div class="b27-bandt" aria-hidden="true"><span>links</span><span>Mittellinie</span><span>rechts</span></div>`; }
function b27Karte(o){ const s = o.s, frei = s.stand === 'frei';
  return `<button type="button" role="option" aria-selected="${B27.sel === s.id}" class="bp-k b27-k ${s.art} ${s.rolle} ${s.stand}${B27.sel === s.id ? ' an' : ''}" data-b27="${s.id}"><b>${b27Nr(o)} <i>${s.art === 'doppel' ? 'Doppel' : 'Einzel'}</i></b><span>${bpE(frei?BANDEN_CI.titel(s):bpFirma(s.firma))}</span><small>${bpE(bpMeter(o.l))}${s.rolle === 'mitte' ? ' · Mitte' : ''}${s.stand === 'vorgemerkt' ? ' · vorgemerkt' : ''}</small></button>`; }
// Vorschau im Partner-CI: dasselbe Bild wie in der 3D-Ansicht (b27Tex); bis es fertig ist, steht der Name als Schrift da
function b27Bande(s){ const frei = s.stand === 'frei';
  return `<div class="b27-vor"><div class="b27-bande ${s.art}${frei ? ' leer' : ''}"${frei ? '' : ` data-b27tex="${s.id}"`}>${frei ? '<span class="b27-ph">'+bpE(BANDEN_CI.titel(s))+'</span>' : `<span class="b27-n">${bpE(bpFirma(s.firma))}</span>`}</div><small>${s.art === 'doppel' ? '5 m mal 80 cm' : '2,5 m mal 80 cm'} · ${B27.modi.get(s.id)==='original'?'Originalfarben':'Vereins-CI'}</small></div>`; }
function b27Detail(){ const R = b27Reihe(), o = R.find(x => x.s.id === B27.sel), darf = !!(B27.d && B27.d.darf);
  if(!o) return '<p class="pz-tc-tipp">Tipp im Plan oder in der Leiste auf einen Platz. Dann siehst du, wo er steht und wer dort vorgesehen ist.</p>';
  const s = o.s, frei = s.stand === 'frei';
  return `<p class="bp-wo"><b>${b27Nr(o)} · ${bpE(b27Wo(o))}</b> ${frei ? 'ist noch frei.' : bpE((s.stand === 'fest' ? 'Fest vergeben an ' : 'Vorgemerkt für ') + bpFirma(s.firma) + '.')}</p>${s.zone==='premium'?'<p class="pz-tc-tipp">'+(s.temporaer_standard?'Vorläufig mit einer Standardbande belegt.':'Bevorzugter Einzelplatz für Premium-Partner.')+'</p>':''}${b27Bande(s)}${!frei&&(s.markenschluessel||b27Quelle(s))?`<div class="b27-farbe"><div class="b27-sw" role="group" aria-label="Logofarben dieser Bande"><button type="button" data-b27farbe="ci" aria-pressed="${B27.modi.get(s.id)!=='original'}">Vereins-CI</button><button type="button" data-b27farbe="original" aria-pressed="${B27.modi.get(s.id)==='original'}">Originallogo</button></div><div data-b27freigabe></div></div>`:''}${s.notiz ? `<p class="pz-tc-tipp b27-notiz">${bpE(s.notiz)}</p>` : ''}
    <div class="b27-kn">${darf ? `<button type="button" class="pz-tc-k" data-b27setzen="${s.id}">${frei ? 'Firma eintragen' : 'Ändern'}</button>` : ''}${!frei ? `<button type="button" class="pz-tc-k leise" data-b27gest="${s.id}">Bande gestalten</button>` : ''}${darf && !frei ? `<button type="button" class="pz-tc-k leise" data-b27frei="${s.id}">Frei machen</button>` : ''}</div>
    ${darf ? '' : '<p class="pz-tc-tipp">Eintragen können Admin, Vorstand und die Leitung im Bereich Partner.</p>'}`; }
function b27Schalter(){ return `<div class="b27-sw" role="group" aria-label="Welcher Stand"><button type="button" data-b27modus="heute" aria-pressed="${B27.modus === 'heute'}">Aktuell</button><button type="button" data-b27modus="neu" aria-pressed="${B27.modus === 'neu'}">Ab Saison ${b27Saison()}</button></div>`; }
function b27Html(){ if(B27.err) return `<section class="pz-tc-block b27"><p class="pz-tc-tipp">${bpE(B27.err)}</p></section>`;
  if(!B27.d) return '<section class="pz-tc-block b27"><p class="pz-tc-tipp">Lädt …</p></section>';
  const R = b27Reihe(), z = b27Zahlen();
  return `<section class="pz-tc-block bp b27" aria-label="Bandenreihe ab Saison ${b27Saison()}"><div class="pz-tc-bk"><h3>Ab Saison ${b27Saison()}</h3><span class="pz-tc-zahl">${z.d - z.dv + z.e - z.ev} frei</span></div>
      <p class="pz-tc-tipp b27-idee">Ein Bild für alle: An der Mittellinie steht eine Doppelbande, links und rechts davon je vier Doppelbanden für die großen Partner, daneben Einzelbanden. Auf jeder Bande stehen nur Logo und Name, in Marine auf Weiß.</p>
      <div class="pz-bc-schema bp-plan" id="b27Plan">${b27Svg()}</div>
      ${b27Band()}
      <div class="pz-bc-legende"><span><i class="frei"></i>Frei ${z.d - z.dv + z.e - z.ev}</span><span><i class="res"></i>Vorgemerkt ${R.filter(o => o.s.stand === 'vorgemerkt').length}</span><span><i class="bel"></i>Fest ${R.filter(o => o.s.stand === 'fest').length}</span></div>
      ${b27RundHtml()}
      <div class="b27-zahl"><div><b>${z.dv} von ${z.d}</b><span>Doppelbanden fest oder vorgemerkt</span></div><div><b>${z.ev} von ${z.e}</b><span>Einzelbanden fest oder vorgemerkt</span></div></div>
      <div class="bp-leiste" id="b27Leiste" role="listbox" aria-label="Alle Plätze von links nach rechts">${R.map(b27Karte).join('')}</div>
      <div class="bp-detail" id="b27Detail" aria-live="polite">${b27Detail()}</div>
      ${b27ListeHtml()}
      ${B27.d.darf?'<button type="button" class="pz-tc-k" data-b27export>Freigegebene CI-Logos exportieren</button>':''}
      <p class="pz-tc-tipp">Von links nach rechts, vom Rasen aus gesehen. Das ist ein Plan für die neue Saison: Was heute hängt, steht unter „Aktuell“ und ändert sich dadurch nicht. Die Reihe ist 105 m lang gerechnet, vor dem Druck bitte am Platz nachmessen.</p></section>`; }

/* ---------- Die neue Reihe in 3D, vom Rasen aus (dieselbe Szene wie „So hängt es heute“, BANDE.reihe) ---------- */
// Eine vergebene Bande als Bild im Partner-CI: weiß und Marine, nur Logo und Name, und der Name nie doppelt (Albert, 18.11.2026:
// „Nimm das große Logo und setz den Text von denen rechts daneben, dass du nicht Basakci und nochmal Basakci hast.“)
// Drei Fälle, entschieden am Logo selbst (b27Satz): (1) Zeichen über Schriftzug: Zeichen links, der Schriftzug der Firma rechts daneben,
// beides aus ihrem Logo. (2) Breites Logo, das den Namen schon trägt: das Logo allein, groß. (3) Nur ein Zeichen: Zeichen links, Name rechts in unserer Schrift.
function b27Marine(c){ const n = document.createElement('canvas'); n.width = c.width; n.height = c.height; const x = n.getContext('2d'); x.drawImage(c, 0, 0); x.globalCompositeOperation = 'source-in'; x.fillStyle = '#1d2760'; x.fillRect(0, 0, n.width, n.height); return n; }
// Waagrechte Bänder eines Logos (Zeilen mit Inhalt, getrennt durch leere Zeilen), je mit linkem und rechtem Rand
function b27Baender(c){ const W = c.width, H = c.height, d = c.getContext('2d', { willReadFrequently:true }).getImageData(0, 0, W, H).data, B = []; let b = null, leer = 0; const luecke = Math.max(2, Math.round(H * .025));
  for(let y = 0; y < H; y++){ let x0 = -1, x1 = -1; for(let x = 0; x < W; x++){ if(d[(y * W + x) * 4 + 3] > 40){ if(x0 < 0) x0 = x; x1 = x; } }
    if(x0 >= 0){ if(!b){ b = { y0:y, y1:y, x0, x1 }; B.push(b); } else { b.y1 = y; b.x0 = Math.min(b.x0, x0); b.x1 = Math.max(b.x1, x1); } leer = 0; } else if(b && ++leer >= luecke) b = null; }
  return B.map(k => Object.assign(k, { w:k.x1 - k.x0 + 1, h:k.y1 - k.y0 + 1 })); }
function b27Satz(lg, name, W, H){ const c = document.createElement('canvas'); c.width = W; c.height = H; const x = c.getContext('2d'); x.fillStyle = '#ffffff'; x.fillRect(0, 0, W, H); x.imageSmoothingEnabled = true; x.imageSmoothingQuality = 'high';
  const rand = W * .05, schrift = (txt, tx0, tw) => { const W2 = txt.split(/\s+/), pass = (Z, max) => { x.font = `800 ${max}px BandeT,Barlow,sans-serif`; const w = Math.max(...Z.map(z => x.measureText(z).width)); return w > tw ? max * tw / w : max; };
    let Z = [txt], fs = pass(Z, H * .5); if(fs < H * .3 && W2.length > 1){ let best = null; for(let i = 1; i < W2.length; i++){ const a = W2.slice(0, i).join(' '), b = W2.slice(i).join(' '), d = Math.abs(a.length - b.length); if(!best || d < best.d) best = { d, Z:[a, b] }; } const f2 = pass(best.Z, H * .36); if(f2 > fs * 1.1){ Z = best.Z; fs = f2; } }
    x.font = `800 ${fs}px BandeT,Barlow,sans-serif`; x.fillStyle = '#1d2760'; x.textAlign = 'center'; x.textBaseline = 'middle'; Z.forEach((z, i) => x.fillText(z, tx0 + tw / 2, H / 2 + (i - (Z.length - 1) / 2) * fs * 1.1 + fs * .04)); };
  if(!lg){ schrift(name, rand, W - 2 * rand); return { c, art:'name' }; }
  const B = b27Baender(lg), rest = B.slice(1), T = rest.length ? { x0:Math.min(...rest.map(b => b.x0)), x1:Math.max(...rest.map(b => b.x1)), y0:rest[0].y0, y1:rest[rest.length - 1].y1 } : null;
  if(T){ T.w = T.x1 - T.x0 + 1; T.h = T.y1 - T.y0 + 1; }
  // (1) Zeichen über Schriftzug: oben das höchste Band, darunter ein breiter Textblock
  if(T && B[0].h >= 1.3 * Math.max(...rest.map(b => b.h)) && T.w / T.h >= 2.2 && B[0].w <= T.w * 1.15){ const m = B[0], mh = H * .68, mw = m.w / m.h * mh, luft = W * .035, st = Math.min(H * (rest.length > 1 ? .5 : .36) / T.h, (W - 2 * rand - mw - luft) / T.w), tw = T.w * st, th = T.h * st, x0 = (W - (mw + luft + tw)) / 2;
    x.drawImage(lg, m.x0, m.y0, m.w, m.h, x0, (H - mh) / 2, mw, mh); x.drawImage(lg, T.x0, T.y0, T.w, T.h, x0 + mw + luft, (H - th) / 2, tw, th); return { c, art:'zeichen-schriftzug' }; }
  // (2) Breites Logo: trägt seinen Namen selbst
  if(lg.width / lg.height >= 2){ const f = Math.min(W * .86 / lg.width, H * .66 / lg.height), w = lg.width * f, h = lg.height * f; x.drawImage(lg, (W - w) / 2, (H - h) / 2, w, h); return { c, art:'logo' }; }
  // (3) Nur ein Zeichen: Name in unserer Schrift daneben
  const lh = H * .64, lw = Math.min(W * .34, lg.width / lg.height * lh), hh = lw / (lg.width / lg.height); x.drawImage(lg, rand, (H - hh) / 2, lw, hh); schrift(name, rand + lw + W * .04, W - 2 * rand - lw - W * .04); return { c, art:'zeichen-name' }; }
function b27Quelle(s){
  if(!s.sponsor)return null;
  if(Object.prototype.hasOwnProperty.call(s,'ci_logo'))return s.ci_logo;
  // Beim Übergang vom älteren Plan ist nur eine Vorschau aus dem lokalen Bestand möglich.
  const logos=(BC.d?.logos||[]).filter(l=>l.sponsor===s.sponsor&&l.bild);
  const firma=bcFirmen().find(f=>f.sponsor===s.sponsor), bevorzugt=s.vorschau_logo||firma?.bandenLogo;
  return (logos.find(l=>l.id===bevorzugt)||logos[0])?.bild||null;
}
function b27Tex(s,neu){
  const quelle=b27Quelle(s), modus=B27.modi.get(s.id)||'ci';
  if(!quelle&&!s.markenschluessel)return null;
  const k=JSON.stringify([s.id,s.markenschluessel,quelle,modus,s.art]);
  if(B27.tex.has(k))return B27.tex.get(k);
  B27.tex.set(k,null);
  BANDEN_CI.tafel(s.markenschluessel,quelle,modus,s.art==='doppel').then(im=>{
    B27.tex.set(k,im);neu();
  }).catch(()=>B27.tex.delete(k));
  return null;
}
function b27Cistand(){
  if(!B27.ciListe)B27.ciListe=bcRpc('banden_ci_liste',{p_saison:B27.saison}).catch(e=>{B27.ciListe=null;throw e;});
  return B27.ciListe;
}
function b27RundTafeln(){ return b27Reihe().map(o => { const s = o.s, frei = s.stand === 'frei', img = frei ? null : b27Tex(s, b27Neu);
  return { id:s.id, x0:o.s0, l:o.l, h:.8, frei, nr:b27Nr(o), platztext:BANDEN_CI.titel(s), name:frei?BANDEN_CI.titel(s):bpFirma(s.firma), farbe:frei || img ? null : '#ffffff', img, an:B27.sel === s.id, ring:s.rolle === 'mitte' ? '#e8741f' : null }; }); }
function b27RundHtml(){ if(typeof BANDE === 'undefined' || !BANDE.reihe) return '';
  return `<div class="bp-rund b27-rund" id="b27Rund"><canvas id="b27RundCv" role="img" aria-label="Die Bandenreihe ab Saison ${b27Saison()} in 3D, vom Rasen aus gesehen. Die Leiste darunter nennt jeden Platz einzeln."></canvas>
      <div class="bp-rundk"><button type="button" class="bp-rb" data-b27rund="-1" aria-label="Einen Platz nach links">${SVI('chev')}</button><span id="b27RundWo" aria-live="polite"></span><button type="button" class="bp-rb" data-b27rund="1" aria-label="Einen Platz nach rechts">${SVI('chev')}</button></div></div>
      <p class="pz-tc-tipp">So sieht die Reihe ab ${b27Saison()} vom Rasen aus: vergebene Banden weiß mit Logo und Name, freie Plätze gestrichelt. Zieh das Bild zur Seite oder nimm die Pfeile. Der orange Ring markiert die Mittellinie.</p>`; }
function b27RundMalen(){ const cv = document.getElementById('b27RundCv'); if(!cv || typeof BANDE === 'undefined' || !BANDE.reihe) return; const T = b27RundTafeln(); if(!T.length) return;
  const a = T[0].x0, b = T[T.length - 1].x0 + T[T.length - 1].l; if(B27.kam == null){ const sel = T.find(t => t.an); B27.kam = sel ? sel.x0 + sel.l / 2 : 0; } B27.kam = Math.max(a - 2, Math.min(b + 2, B27.kam));
  const r = BANDE.reihe(cv, { tafeln:T, kamX:B27.kam }); B27.boxen = r.boxen; B27.pxm = r.pxm || 40;
  const wo = document.getElementById('b27RundWo'), nah = T.slice().sort((x, y) => Math.abs(x.x0 + x.l / 2 - B27.kam) - Math.abs(y.x0 + y.l / 2 - B27.kam))[0];
  if(wo && nah) wo.textContent = `${nah.nr}: ${nah.name} · ${bpMeter(nah.l)}`; }
function b27RundBinden(k, waehl){ const cv = k.querySelector('#b27RundCv'); if(!cv) return;
  let roh = null; const mal = () => { if(roh) return; roh = requestAnimationFrame(() => { roh = null; b27RundMalen(); }); }; b27RundMalen();
  const mitte = t => t.x0 + t.l / 2;
  k.querySelectorAll('[data-b27rund]').forEach(b => b.onclick = () => { const L = b27RundTafeln(), d = +b.dataset.b27rund, i = L.map(mitte).reduce((bi, m, n, A) => Math.abs(m - B27.kam) < Math.abs(A[bi] - B27.kam) ? n : bi, 0), z = L[Math.max(0, Math.min(L.length - 1, i + d))]; if(z){ B27.kam = mitte(z); mal(); } });
  let st = null;
  cv.addEventListener('pointerdown', e => { st = { x:e.clientX, k:B27.kam, weg:0 }; try{ cv.setPointerCapture(e.pointerId); }catch(x){} });
  cv.addEventListener('pointermove', e => { if(!st) return; const dx = e.clientX - st.x; st.weg = Math.max(st.weg, Math.abs(dx)); B27.kam = st.k - dx / Math.max(8, B27.pxm); mal(); });
  cv.addEventListener('pointerup', e => { if(!st) return; const tipp = st.weg < 7; st = null; if(!tipp) return;
    const r = cv.getBoundingClientRect(), px = e.clientX - r.left, py = e.clientY - r.top, t = (B27.boxen || []).filter(b => px >= b.x - 4 && px <= b.x + b.w + 4 && py >= b.y - 30 && py <= b.y + b.h + 14).sort((a, b) => a.w - b.w).pop(); if(t) waehl(t.id, true); });
  cv.addEventListener('pointercancel', () => { st = null; });
  cv.addEventListener('keydown', e => { if(e.key === 'ArrowLeft' || e.key === 'ArrowRight'){ B27.kam += e.key === 'ArrowLeft' ? -2.5 : 2.5; mal(); e.preventDefault(); } }); cv.tabIndex = 0;
  if(!B27.rundGroesse){ B27.rundGroesse = true; window.addEventListener('resize', () => { if(document.getElementById('b27RundCv')) b27RundMalen(); }); } }
// Belegungsplan als Liste: Kennung, Art, Lage ab der Mittellinie, Firma. Für die Übersicht und später für die Montage.
function b27ListeHtml(){ const R = b27Reihe(), m = v => (v < 0 ? 'links ' : v > 0 ? 'rechts ' : '') + String(Math.abs(Math.round(v * 10) / 10)).replace('.', ',') + ' m';
  return `<details class="b27-liste"><summary>Belegungsplan als Liste</summary><div class="b27-tw"><table><thead><tr><th>Platz</th><th>Art</th><th>Von der Mittellinie</th><th>Firma</th><th>Stand</th></tr></thead><tbody>${R.map(o => `<tr class="${o.s.stand}"><td><b>${b27Nr(o)}</b></td><td>${o.s.art === 'doppel' ? 'Doppel, 5 m' : 'Einzel, 2,5 m'}</td><td>${o.s.rolle === 'mitte' ? 'mittig' : bpE(m(o.s0) + ' bis ' + m(o.s0 + o.l))}</td><td>${o.s.firma ? bpE(bpFirma(o.s.firma)) : ''}</td><td>${o.s.stand === 'frei' ? 'frei' : o.s.stand === 'fest' ? 'fest' : 'vorgemerkt'}</td></tr>`).join('')}</tbody></table></div><p class="pz-tc-tipp">D1 bis D9 sind die Doppelbanden, E1 bis E24 die Einzelbanden, jeweils von links nach rechts vom Rasen aus. Die Abstände gelten ab der Mittellinie und sind gerechnet, nicht gemessen.</p></details>`; }

function b27LogosMalen(I){ I.querySelectorAll('[data-b27tex]').forEach(el => { const sl = ((B27.d && B27.d.slots) || []).find(x => x.id === el.dataset.b27tex); if(!sl || el.querySelector('img')) return;
  const img = b27Tex(sl, b27Neu); if(!img) return; const i = document.createElement('img'); i.src = img.src; i.alt = ''; i.dataset.art = img.dataset.art || ''; el.classList.add('tex'); el.appendChild(i); }); }
// Ein Bild ist fertig: 3D-Ansicht und Vorschau nachziehen
function b27Neu(){ try{ b27RundMalen(); const k = document.querySelector('.b27-kopf'); if(k) b27LogosMalen(k); }catch(e){} }
function b27Zeigen(I){ const W = I.querySelector('.pz-bc-plan'); if(!W) return; W.classList.toggle('b27-neu', B27.modus === 'neu');
  let k = W.querySelector('.b27-kopf'); if(!k){ k = document.createElement('div'); k.className = 'b27-kopf'; W.insertBefore(k, W.firstChild); }
  k.innerHTML = b27Schalter() + (B27.modus === 'neu' ? b27Html() : '');
  k.querySelectorAll('[data-b27modus]').forEach(b => b.onclick = () => { if(B27.modus === b.dataset.b27modus) return; B27.modus = b.dataset.b27modus; b27Zeigen(I); if(B27.modus === 'neu' && !B27.d) b27Laden().then(() => b27Zeigen(I)).catch(() => b27Zeigen(I)); });
  if(B27.modus !== 'neu') return;
  const waehl = (id, ausRund) => { const L = k.querySelector('#b27Leiste'), sl = L ? L.scrollLeft : 0, offen = !!(k.querySelector('.b27-liste') || {}).open; B27.sel = B27.sel === id && !ausRund ? null : id; if(B27.sel && !ausRund){ const o = b27Reihe().find(x => x.s.id === B27.sel); if(o) B27.kam = o.s0 + o.l / 2; } b27Zeigen(I); const dl = I.querySelector('.b27-liste'); if(dl && offen) dl.open = true; const L2 = I.querySelector('#b27Leiste'); if(L2){ L2.scrollLeft = sl; const a = L2.querySelector('.bp-k.an'); if(a){ const x = a.offsetLeft, y = x + a.offsetWidth; if(x < L2.scrollLeft + 8 || y > L2.scrollLeft + L2.clientWidth - 8) L2.scrollLeft = Math.max(0, x - (L2.clientWidth - a.offsetWidth) / 2); } } };
  k.querySelectorAll('#b27Leiste [data-b27], #b27Band [data-b27]').forEach(b => b.onclick = () => waehl(b.dataset.b27));
  if(!B27.sel){ const L = k.querySelector('#b27Leiste'), m = L && L.querySelector('.b27-k.mitte'); if(m) L.scrollLeft = Math.max(0, m.offsetLeft - (L.clientWidth - m.offsetWidth) / 2); }   // die Mitte zuerst zeigen
  const svg = k.querySelector('#b27Plan svg'); if(svg) svg.addEventListener('click', e => { const g = e.target.closest && e.target.closest('[data-b27]'); if(g){ waehl(g.dataset.b27); return; }
    try{ const m = svg.getScreenCTM().inverse(), pt = svg.createSVGPoint(); pt.x = e.clientX; pt.y = e.clientY; const q = pt.matrixTransform(m); let best = null, bd = 1e9; b27Reihe().forEach(o => { const dd = Math.hypot(o.x - q.x, o.y - q.y); if(dd < bd){ bd = dd; best = o; } }); if(best && bd < 9) waehl(best.s.id); }catch(x){} });
  k.querySelectorAll('[data-b27setzen]').forEach(b => b.onclick = () => b27Dialog(b.dataset.b27setzen, I));
  k.querySelectorAll('[data-b27frei]').forEach(b => b.onclick = () => paEinmal(b, async () => { try{ await bcRpc('banden_plan_setzen', { p:{ id:b.dataset.b27frei, stand:'frei' } }); await b27Laden(true); b27Zeigen(I); kToast('Der Platz ist wieder frei.'); }catch(e){ kToast(e.message); } }, 'Einen Moment …'));
  k.querySelectorAll('[data-b27gest]').forEach(b => b.onclick = () => { const s = ((B27.d && B27.d.slots) || []).find(x => x.id === b.dataset.b27gest); if(!s) return;
    BC.platz = null; BC.spec.format = s.art === 'doppel' ? '500x80' : '250x80'; const fa = bcFirmen().find(x => (s.sponsor && x.sponsor === s.sponsor) || x.firma.toLowerCase() === String(s.firma || '').toLowerCase());
    if(fa) bcFirmaWaehlen(fa.key); else bcFirmaLeer(bpFirma(s.firma)); BC.ansicht = 'gestalten'; bcAnsichtZeigen(); });
  const sl=B27.d?.slots.find(s=>s.id===B27.sel);
  k.querySelectorAll('[data-b27farbe]').forEach(b=>b.onclick=()=>{
    B27.modi.set(sl.id,b.dataset.b27farbe);b27Zeigen(I);
    I.querySelector('[data-b27farbe="'+b.dataset.b27farbe+'"]')?.focus({preventScroll:true});
  });
  const e=k.querySelector('[data-b27freigabe]');
  if(e&&sl&&B27.d.darf&&B27.modi.get(sl.id)!=='original')BANDEN_CI.freigabefeld(e,sl,()=>b27Quelle(sl),b27Cistand,bcRpc);
  const exportTaste=k.querySelector('[data-b27export]');if(exportTaste)exportTaste.onclick=()=>b27ExportDialog();
  b27RundBinden(k, waehl); b27LogosMalen(k);
}
function b27Dialog(id, I){ const s = ((B27.d && B27.d.slots) || []).find(x => x.id === id); if(!s) return; const R = b27Reihe(), o = R.find(x => x.s.id === id), F = ((BC.d && BC.d.firmen) || []).slice().sort((a, b) => a.firma.localeCompare(b.firma, 'de'));
  const M = svModal(`<div class="mhead"><div><h2 style="margin:0">${bpE(b27Name(s))}</h2><div class="msub">${bpE(b27Wo(o) + ' · Saison ' + b27Saison())}</div></div></div>
    <label class="pz-tc-dlgf"><span>Firma aus der Partnerliste</span><select id="b27Sp"><option value="">nicht in der Liste</option>${F.map(f => `<option value="${f.id}"${f.id === s.sponsor ? ' selected' : ''}>${bpE(f.firma)}</option>`).join('')}</select></label>
    <label class="pz-tc-dlgf" id="b27FrW"><span>Oder Name der Firma</span><input type="text" id="b27Fr" maxlength="120" value="${s.sponsor ? '' : bpE(s.firma || '')}" autocomplete="off"></label>
    <div class="bp-bwahl" role="radiogroup" aria-label="Wie fest ist das?">${[['vorgemerkt', 'Vorgemerkt'], ['fest', 'Fest vergeben']].map(([k, t]) => `<label><input type="radio" name="b27St" value="${k}"${(s.stand === 'fest' ? 'fest' : 'vorgemerkt') === k ? ' checked' : ''}><span>${t}</span></label>`).join('')}</div>
    ${s.zone==='premium'?'<label class="bn-check"><input type="checkbox" id="b27Temp"'+(s.temporaer_standard?' checked':'')+'> Diesen Premium-Platz vorläufig mit einer Standardbande auffüllen</label>':''}
    <label class="pz-tc-dlgf"><span>Notiz (nur intern)</span><textarea id="b27No" maxlength="300" rows="2">${bpE(s.notiz || '')}</textarea></label>
    <p class="pz-tc-tipp" id="b27H" role="alert" hidden></p>
    <div class="pz-tc-dlgk"><button type="button" class="btn" id="b27Ok">Speichern</button><button type="button" class="btn ghost" id="b27Nein">Abbrechen</button></div>`);
  const sp = M.querySelector('#b27Sp'), frw = M.querySelector('#b27FrW'), zeig = () => { frw.hidden = !!sp.value; }; sp.onchange = zeig; zeig();
  M.querySelector('#b27Nein').onclick = () => closeOverlay();
  M.querySelector('#b27Ok').onclick = () => paEinmal(M.querySelector('#b27Ok'), async () => { const h = M.querySelector('#b27H'); h.hidden = true;
    try{ await bcRpc('banden_plan_setzen', { p:{ id, temporaer_standard:!!M.querySelector('#b27Temp')?.checked, stand:(M.querySelector('input[name="b27St"]:checked') || {}).value || 'vorgemerkt', sponsor:sp.value || null, firma:sp.value ? null : M.querySelector('#b27Fr').value, notiz:M.querySelector('#b27No').value } });
      closeOverlay(); await b27Laden(true); b27Zeigen(I); kToast('Gespeichert.'); }catch(e){ h.textContent = e.message; h.hidden = false; } }, 'Speichert …'); }

// Der Plan im Bandencreator bekommt den Schalter; „Aktuell“ bleibt, wie es war
if(typeof bcPlan === 'function'){ const _p = bcPlan; bcPlan = function(I){ const r = _p.apply(this, arguments); try{ b27Zeigen(I); if(B27.modus === 'neu' && !B27.d) b27Laden().then(() => b27Zeigen(I)).catch(() => b27Zeigen(I)); }catch(e){} return r; }; }

(function(){ try{ const s=document.createElement('style'); s.id='svm125css'; s.textContent="/* Beta 0.99.90 · Bandenplan ab Saison 2027/28 (svm125.js). Farben wie im Bandenplan (svm79.css). */\n.b27-kopf{display:grid;grid-template-columns:minmax(0,1fr);gap:12px;}\n.b27-kopf>*{min-width:0;}\n.b27-sw{display:inline-flex;align-self:start;justify-self:start;border:1.5px solid var(--blau,#1d2760);border-radius:999px;padding:3px;background:#fff;max-width:100%;}\n.b27-sw button{min-height:44px;padding:0 16px;border:0;border-radius:999px;background:transparent;color:var(--blau,#1d2760);font:inherit;font-weight:700;font-size:14.5px;cursor:pointer;white-space:nowrap;}\n.b27-sw button[aria-pressed=\"true\"]{background:var(--blau,#1d2760);color:#fff;}\n.b27-sw button:focus-visible{outline:2px solid var(--or,#e8741f);outline-offset:2px;}\n.pz-bc-plan.b27-neu>:not(.b27-kopf){display:none;}\n.b27-idee{margin:0 2px 6px;}\n.b27-s rect{fill:#1d2760;stroke:#1d2760;stroke-width:.4;}\n#b27Plan .b27-s.frei rect{fill:#ffffff;stroke:#1d2760;stroke-width:.35;stroke-dasharray:.9 .6;}\n#b27Plan .b27-s.vorgemerkt rect{fill:#fbe3cf;stroke:#e8741f;stroke-dasharray:none;}\n#b27Plan .b27-s.mitte rect{stroke:#e8741f;stroke-width:.9;}\n#b27Plan .b27-s.an rect{stroke:#e8741f;stroke-width:1.5;stroke-dasharray:none;}\n.b27-ml{stroke:#e8741f;stroke-width:.5;stroke-dasharray:1.4 1;}\n.b27-zahl{display:grid;grid-template-columns:1fr 1fr;gap:8px;margin-top:10px;}\n.b27-zahl>div{border:1px solid var(--linie);border-radius:12px;padding:9px 12px;display:grid;gap:1px;background:var(--papier,#fff);}\n.b27-zahl b{font-size:19px;font-weight:800;font-variant-numeric:tabular-nums;color:var(--blau,#1d2760);}\n.b27-zahl span{font-size:12.5px;color:var(--ink2);}\n.b27-k.doppel{width:118px;}\n.b27-k.einzel{width:84px;}\n.b27-k.mitte{border-top-color:#e8741f !important;}\n.b27-k.vorgemerkt{border-top-color:#e8741f !important;}\n.b27-k b{font-size:14px;letter-spacing:.04em;text-transform:uppercase;}\n.b27-vor{display:grid;gap:6px;margin:10px 0 4px;justify-items:start;}\n.b27-vor small{font-size:12.5px;color:var(--ink2);}\n.b27-bande{width:100%;aspect-ratio:500/80;background:#ffffff;border:1.5px solid #1d2760;border-radius:3px;display:flex;align-items:center;justify-content:center;gap:4%;padding:0 4%;overflow:hidden;box-shadow:0 6px 14px -8px rgba(29,39,96,.5);container-type:inline-size;}\n.b27-bande.einzel{aspect-ratio:250/80;width:min(100%,360px);}\n.b27-bande{position:relative;}\n.b27-bande.tex{padding:0;}\n.b27-bande.tex img{position:absolute;inset:0;width:100%;height:100%;object-fit:fill;}\n.b27-bande.tex .b27-n{opacity:0;}\n.b27-bande .b27-n{font-family:var(--c,'Barlow Condensed',sans-serif);font-weight:800;font-size:clamp(15px,7cqw,54px);line-height:.95;text-transform:uppercase;letter-spacing:.01em;color:#1d2760;text-align:center;overflow-wrap:anywhere;min-width:0;}\n.b27-bande.einzel .b27-n{font-size:clamp(14px,10cqw,44px);}\n.b27-bande.leer{border-style:dashed;box-shadow:none;}\n.b27-bande .b27-ph{font-weight:700;font-size:clamp(12px,3.4cqw,20px);color:#6a7090;letter-spacing:.06em;text-transform:uppercase;}\n.b27-kn{display:flex;flex-wrap:wrap;gap:8px;margin-top:10px;}\n.b27-notiz{font-style:italic;}\n.b27-band{display:flex;gap:2px;height:28px;margin-top:12px;}\n.b27-band i{min-width:0;border-radius:2px;background:#fff;border:1.5px dashed #1d2760;cursor:pointer;}\n.b27-band i.vorgemerkt{background:#fbe3cf;border:1.5px solid #e8741f;}\n.b27-band i.fest{background:#1d2760;border:1.5px solid #1d2760;}\n.b27-band i.mitte{box-shadow:0 -4px 0 0 #e8741f;}\n.b27-band i.an{outline:3px solid #e8741f;outline-offset:1px;}\n.b27-bandt{display:grid;grid-template-columns:1fr auto 1fr;font-size:11.5px;color:var(--ink2);margin-top:3px;}\n.b27-bandt span:last-child{text-align:right;}\n.bp-rb[data-b27rund=\"-1\"] svg{transform:rotate(180deg);}\n.b27-nr{font-size:2.5px;}\n.b27-k b i{font-style:normal;font-weight:600;font-size:11px;letter-spacing:.04em;color:var(--ink2);margin-left:3px;}\n.b27-liste{margin-top:12px;border:1px solid var(--linie);border-radius:12px;padding:0 12px;background:var(--papier,#fff);}\n.b27-liste summary{min-height:44px;display:flex;align-items:center;font-weight:700;color:var(--blau,#1d2760);cursor:pointer;}\n.b27-tw{overflow-x:auto;margin:0 -4px 8px;}\n.b27-liste table{border-collapse:collapse;width:100%;font-size:13.5px;min-width:440px;}\n.b27-liste th{text-align:left;font-size:11.5px;letter-spacing:.06em;text-transform:uppercase;color:var(--ink2);padding:6px 6px;border-bottom:1.5px solid var(--linie);white-space:nowrap;}\n.b27-liste td{padding:7px 6px;border-bottom:1px solid var(--linie);vertical-align:top;}\n.b27-liste tr.frei td{color:var(--ink2);}\n.b27-liste td:first-child{white-space:nowrap;}\n\n.b27-farbe {display:flex;align-items:center;flex-wrap:wrap;justify-content:space-between;gap:8px;margin:.7rem 0}\n.b27-farbe button,.b27 [data-b27export]{min-height:44px}\n.b27 .b27-bande img{object-fit:contain}\n\n.ci-freigabe{display:inline-flex;align-items:center;gap:8px;min-height:44px;font-size:14px;cursor:pointer}.ci-freigabe input{width:20px;height:20px;accent-color:#174782}.ci-freigabe+span{display:block;font-size:13px}\n"; document.head.appendChild(s); }catch(e){} })();
/* =====================================================================
   Beta 0.99.91 · Datenprüfung: Vereinswechsel als eigene Ansicht (gehört zu svm43dp.js, svm49.js, svm116.js)
   Rückmeldung aus der sportlichen Leitung, 18.11.2026: „Den Bereich gibt's gar nicht in der Datenprüfung.“ Der Abschnitt
   „Vereinswechsel“ (0.99.63) stand nur als eine Zeile in der Karte „Datenqualität“, und die Karte fehlte ganz, wenn die
   Seite geöffnet wurde, bevor Stärken und FuPa-Werte geladen waren: Danach zeichnete niemand neu.
   - Vierte Ansicht „Vereinswechsel“ neben Doppelte Spieler, Namensvarianten und Spieldaten, mit Zahl.
   - Eigene Spieler mit Stand (wird als extern geführt, oder: steht bei uns noch im Kader), darunter Spieler anderer Vereine,
     bei denen die Stammdaten einen anderen Verein nennen als FuPa.
   - Die Seite zeichnet sich neu, sobald Stärken und FuPa-Werte da sind.
   Es wird nichts geändert und nichts verschickt: nur Anzeige. Was mit einem eigenen Spieler geschieht, regelt 185.
   ===================================================================== */
const DP126 = { n:0, t:0, offen:false };
const dp126E = s => svEsc(s == null ? '' : String(s));
function dp126Bereit(){ try{ return !!(typeof KLAW !== 'undefined' && KLAW.geladen) && !(typeof V1 !== 'undefined' && V1.an && !V1.werte && !V1.geladen); }catch(e){ return true; } }
function dp126Liste(){ const E = [], X = []; try{ players.forEach(p => { if(!p.fupaWechsel || p.isJugend) return; (p.own ? E : X).push(p); }); }catch(e){}
  const nm = (a, b) => String(a.name).localeCompare(String(b.name), 'de'); return { E:E.sort(nm), X:X.sort(nm) }; }
// Wie der eigene Spieler in dieser Saison geführt wird: 'X' ist extern, '1' oder '2' die Mannschaft, leer: nicht eingeplant
function dp126Team(p){ try{ const r = sv4SS(p.id, sv4S()); return r && r.team ? String(r.team) : ''; }catch(e){ return ''; } }
function dp126Wo(W){ return dp126E(W.alle || W.nach) + (W.einsaetze ? ` (${W.einsaetze} ${W.einsaetze === 1 ? 'Einsatz' : 'Einsätze'}${W.kader ? ', steht dort im Kader' : ''})` : W.kader ? ' (steht dort im Kader)' : ''); }
function dp126Html(){ const { E, X } = dp126Liste(), fertig = dp126Bereit();
  const eigen = p => { const t = dp126Team(p), ext = t === 'X', st = ext ? 'Wird bei uns als extern geführt.' : t ? `Steht bei uns noch im Kader (${t === '1' ? 'Erste' : t === '2' ? 'Zweite' : dp126E(t)}). Bitte ansehen.` : 'Ist bei uns in dieser Saison nicht eingeplant.';
    return `<div class="dpw-z${ext || !t ? '' : ' warn'}"><button type="button" class="lnk" data-svp="${dp126E(p.id)}">${dp126E(p.name)}</button><span>Laut FuPa bei <b>${dp126Wo(p.fupaWechsel)}</b>. In den Stammdaten stand ${dp126E(p.fupaWechsel.von)}.</span><em>${st}</em></div>`; };
  const fremd = p => `<tr><td><button type="button" class="lnk" data-svp="${dp126E(p.id)}">${dp126E(p.name)}</button></td><td>${dp126E(p.fupaWechsel.von)}</td><td><b>${dp126E(p.fupaWechsel.nach)}</b></td></tr>`;
  return `<div class="card dpw"><h3 class="trh">${SVI('check')} Vereinswechsel laut FuPa <small>${E.length + X.length} Spieler</small></h3>
    <p class="note small">Für den Verein eines Spielers gilt FuPa. Hier steht, wo die Stammdaten der App einen anderen Verein nennen. Die App zeigt in diesen Fällen schon den Verein laut FuPa, im Profil steht ein Hinweis.</p>
    ${fertig ? '' : '<p class="note small dpw-laedt">Die FuPa-Werte laden noch. Die Liste füllt sich gleich von selbst.</p>'}
    <h4 class="s1-gruppe">Eigene Spieler · ${E.length}</h4>
    ${E.length ? E.map(eigen).join('') : `<div class="k1-oe"><span>Kein eigener Spieler steht laut FuPa bei einem anderen Verein</span><small>${fertig ? '✓ niemand' : 'lädt'}</small></div>`}
    ${E.length ? '<p class="note small">Steht ein eigener Spieler laut FuPa bei einem anderen Verein im Kader und bei uns nicht mehr, führt ihn die App von selbst als extern (stündlich). Wer danach von Hand wieder intern gesetzt wird, bleibt intern.</p>' : ''}
    <h4 class="s1-gruppe">Spieler anderer Vereine · ${X.length}</h4>
    ${X.length ? `<details class="dpw-d"${DP126.offen ? ' open' : ''}><summary>${X.length} Spieler aus dem Scouting, bei denen die Stammdaten einen anderen Verein nennen</summary><div class="dpw-tw"><table><thead><tr><th>Spieler</th><th>Stammdaten</th><th>Laut FuPa</th></tr></thead><tbody>${X.map(fremd).join('')}</tbody></table></div></details>
      <p class="note small">Zu tun ist hier nichts: Listen, Profile und Filter rechnen schon mit dem Verein laut FuPa. Gleich heißt ein Verein, wenn der Ortsname übereinstimmt; zwei Vereine im selben Ort gelten deshalb noch als gleich.</p>` : `<div class="k1-oe"><span>Keine Abweichung</span><small>${fertig ? '✓ stimmt überein' : 'lädt'}</small></div>`}</div>`; }

if(typeof dpRender === 'function'){ const _dp126 = dpRender; dpRender = function(){ const r = _dp126.apply(this, arguments);
  try{ const P = document.getElementById('panel-pruefung'), seg = P && P.querySelector('.dp-seg'); if(!seg || !isAdmin()) return r;
    const n = dp126Liste().E.length;
    if(!seg.querySelector('[data-dps="wechsel"]')){ const b = document.createElement('button'); b.type = 'button'; b.dataset.dps = 'wechsel'; b.className = DP.sicht === 'wechsel' ? 'on' : ''; b.innerHTML = 'Vereinswechsel' + (n ? ` <em>${n}</em>` : ''); b.onclick = () => { DP.sicht = 'wechsel'; dpRender(); }; seg.appendChild(b); }
    if(DP.sicht === 'wechsel'){ const B = P.querySelector('.dp-b'); if(B){ B.innerHTML = dp126Html(); B.querySelectorAll('[data-svp]').forEach(x => x.onclick = e => { e.preventDefault(); openModal(x.dataset.svp); }); const d = B.querySelector('.dpw-d'); if(d) d.addEventListener('toggle', () => { DP126.offen = d.open; }); } }
    // Die Zeile in der Karte „Datenqualität“ führt zur neuen Ansicht
    const z = [...P.querySelectorAll('.g1-dq .s1-gruppe')].find(h => h.textContent.trim() === 'Vereinswechsel'); if(z && !z.querySelector('button')){ const k = document.createElement('button'); k.type = 'button'; k.className = 'btn sm ghost dpw-zu'; k.textContent = 'Alle ansehen'; k.onclick = () => { DP.sicht = 'wechsel'; dpRender(); try{ P.querySelector('.dp-seg').scrollIntoView({ block:'start', behavior:'smooth' }); }catch(e){} }; z.appendChild(k); }
    // Stärken und FuPa-Werte kommen nach dem Start: neu zeichnen, sobald sie da sind (höchstens eine Minute lang nachsehen)
    if(!dp126Bereit() || (typeof V1 !== 'undefined' && V1.an && !V1.werte)){ if(!DP126.t && DP126.n < 40){ DP126.t = setTimeout(() => { DP126.t = 0; DP126.n++; try{ if(svCurTab() === 'pruefung' && !document.querySelector('#modal.open, .overlay.open')) dpRender(); }catch(e){} }, 1500); } }
    else DP126.n = 0;
  }catch(e){ console.warn('Datenprüfung Vereinswechsel', e); }
  return r; }; }

(function(){ try{ const s=document.createElement('style'); s.id='svm126css'; s.textContent="/* Beta 0.99.91 · Datenprüfung: Ansicht „Vereinswechsel“ (svm126.js) */\n.dpw-z{display:grid;gap:3px;padding:10px 0;border-top:1px solid var(--linie);}\n.dpw-z .lnk{justify-self:start;font-weight:700;font-size:15.5px;background:none;border:0;padding:0;color:var(--blau);cursor:pointer;text-align:left;min-height:28px;}\n.dpw-z span{font-size:14px;line-height:1.4;}\n.dpw-z em{font-style:normal;font-size:13px;font-weight:600;color:var(--gruen,#2c6b3a);}\n.dpw-z.warn em{color:#a11b12;}\n.dpw-d{border:1px solid var(--linie);border-radius:12px;padding:0 12px;margin-top:6px;}\n.dpw-d summary{min-height:44px;display:flex;align-items:center;font-weight:700;cursor:pointer;}\n.dpw-tw{overflow-x:auto;margin:0 -4px 10px;}\n.dpw-d table{border-collapse:collapse;width:100%;font-size:13.5px;min-width:420px;}\n.dpw-d th{text-align:left;font-size:11.5px;letter-spacing:.06em;text-transform:uppercase;color:var(--ink2);padding:6px;border-bottom:1.5px solid var(--linie);}\n.dpw-d td{padding:6px;border-bottom:1px solid var(--linie);vertical-align:top;}\n.dpw-d td .lnk{background:none;border:0;padding:0;color:var(--blau);cursor:pointer;font:inherit;font-weight:600;text-align:left;}\n.g1-dq .s1-gruppe .dpw-zu{margin-left:10px;vertical-align:middle;}\n"; document.head.appendChild(s); }catch(e){} })();
/* Derselbe Bildausschnitt in der Vorschau und in der gespeicherten Datei.
   Die Positionen gehören zum Spiel, Motiv und Format, nicht zum Gerät. */
function sgAusschnitt(D,m,fmt){const c=D?.bildausschnitt?.[m]?.[fmt]||{};return{x:sgQuerNorm(c.x,.5,0,1),y:sgQuerNorm(c.y,m==='E'&&D.zeigeTore===true?.35:.3,0,1),zoom:sgQuerNorm(c.zoom,1,1,3)};}
function sgFotoGeometrie(iw,ih,w,h,c){if(!(iw>0&&ih>0&&w>0&&h>0))return null;const s=Math.max(w/iw,h/ih)*c.zoom,dw=iw*s,dh=ih*s;return{...c,scale:s,dw,dh,reserveX:Math.max(0,dw-w),reserveY:Math.max(0,dh-h),w,h};}
/* Farbkorrektur auf der Fotofläche, bevor Texte und Wappen hinzukommen.
   Soft Light erhält die Zeichnung in Haut, Trikots und hellen Spitzlichtern. */
function sgFotoFarblook(ctx,x,y,w,h,D,m){
  const ergebnis = sgFotoErgebnis(D, m === 'E' ? 'fotoE' : 'fotoH');
  const farben = ergebnis === 'Sieg' ? ['#ffd6a4','#284361'] :
    ergebnis === 'Niederlage' ? ['#c1cbd1','#35465e'] : ['#eadcc8','#344b65'];
  ctx.save();
  ctx.globalCompositeOperation = 'soft-light';
  ctx.globalAlpha = .38;
  const ton = ctx.createLinearGradient(x,y,x+w*.28,y+h);
  ton.addColorStop(0,farben[0]); ton.addColorStop(1,farben[1]);
  ctx.fillStyle = ton; ctx.fillRect(x,y,w,h);
  ctx.restore();
}
function sgFotoMalen(ctx,img,x,y,w,h,D,m,standard){
  if(!img)return;
  const fmt=SG.oy?'story':'beitrag';
  const ausschnitt=D?.bildausschnitt?.[m]?.[fmt];
  if(ausschnitt){
    const g=sgFotoGeometrie(img.naturalWidth||img.width,img.naturalHeight||img.height,w,h,sgAusschnitt(D,m,fmt));
    if(!g)return;
    ctx.save();ctx.beginPath();ctx.rect(x,y,w,h);ctx.clip();
    ctx.drawImage(img,x-g.reserveX*g.x,y-g.reserveY*g.y,g.dw,g.dh);ctx.restore();
  } else sgCover(ctx,img,x,y,w,h,standard);
  sgFotoFarblook(ctx,x,y,w,h,D,m);
}
function sgAusschnittGeometrie(D=SG.d,A=SG.A,m=SG.motiv,fmt=sgFormat(m)){
  if(!['H','E'].includes(m)||fmt==='quer')return null;const im=A?.[m==='H'?'fotoH':'fotoE'];if(!im)return null;
  const oy=fmt==='story'?285:0,h=m==='H'?(D.wirHeim?1000:940)+oy:D.zeigeTore===true?1350+oy*2:646;
  return sgFotoGeometrie(im.naturalWidth||im.width,im.naturalHeight||im.height,1080,h,sgAusschnitt(D,m,fmt));
}
function sgAusschnittHtml(m,fmt){if(!['H','E'].includes(m)||fmt==='quer')return'';const c=sgAusschnittGeometrie(SG.d,SG.A,m,fmt);if(!c)return'';
  return `<section class="sg-ausschnitt" aria-label="Foto ausrichten"><div class="sg-zeile"><button type="button" class="btn sm ghost" data-sgcut-aktiv aria-pressed="${!!SG.ausschnittAktiv}">${SG.ausschnittAktiv?'Ausrichten beenden':'Foto ausrichten'}</button><button type="button" class="btn sm ghost" data-sgcut-reset>Ausschnitt zurücksetzen</button></div>
    ${[['x','Links / rechts'],['y','Oben / unten'],['zoom','Zoom']].map(([k,t])=>`<label class="sg-f"><span>${t} <output data-sgcut-wert="${k}">${k==='zoom'?c[k].toFixed(2)+'×':Math.round(c[k]*100)+'%'}</output></span><input type="range" data-sgcut="${k}" aria-label="${t}" min="${k==='zoom'?1:0}" max="${k==='zoom'?3:100}" step="${k==='zoom'?.05:1}" value="${k==='zoom'?c[k]:Math.round(c[k]*100)}"${k!=='zoom'&&c[k==='x'?'reserveX':'reserveY']<=1?' disabled':''}></label>`).join('')}
    <p class="sg-hin" data-sgcut-hilfe>Mit der Maus direkt im Foto ziehen. Auf dem Handy zuerst „Foto ausrichten“ einschalten. Bei Bedarf hineinzoomen, um mehr Spielraum zu erhalten.</p></section>`;
}
function sgAusschnittAktualisieren(h){if(!['H','E'].includes(SG.motiv)||sgFormat(SG.motiv)==='quer')return;const c=sgAusschnittGeometrie();if(!c)return;
  const gesperrt=sgSpeicherKonflikt();h.querySelectorAll('[data-sgcut]').forEach(e=>{const k=e.dataset.sgcut;e.value=k==='zoom'?c[k]:Math.round(c[k]*100);e.disabled=gesperrt||k!=='zoom'&&c[k==='x'?'reserveX':'reserveY']<=1;});
  h.querySelectorAll('[data-sgcut-aktiv],[data-sgcut-reset]').forEach(e=>e.disabled=gesperrt);
  h.querySelectorAll('[data-sgcut-wert]').forEach(e=>{const k=e.dataset.sgcutWert;e.textContent=k==='zoom'?c[k].toFixed(2)+'×':Math.round(c[k]*100)+'%';});
  const b=h.querySelector('[data-sgcut-aktiv]'),bild=h.querySelector('#sgBild');if(b){b.setAttribute('aria-pressed',String(!!SG.ausschnittAktiv));b.textContent=SG.ausschnittAktiv?'Ausrichten beenden':'Foto ausrichten';}if(bild?.dataset)bild.dataset.ausrichten=SG.ausschnittAktiv?'1':'0';
}
function sgAusschnittSetzen(k,v,h){const m=SG.motiv,fmt=sgFormat(m);if(!['H','E'].includes(m)||fmt==='quer'||sgSpeicherKonflikt())return;const f=SG.neu.f||(SG.neu.f={}),C=f.bildausschnitt||(f.bildausschnitt={}),M=C[m]||(C[m]={});
  M[fmt]={...sgAusschnitt(SG.d,m,fmt),[k]:Math.round(sgQuerNorm(v,k==='zoom'?1:.5,k==='zoom'?1:0,k==='zoom'?3:1)*10000)/10000};
  SG.d=sgDaten();sgMalen(SG.cv[m],m,SG.d,SG.A,0);if(fmt!=='beitrag')sgSchau(m);sgMerken();sgAusschnittAktualisieren(h);sgFotoQualitaetAktualisieren(h);
  const fr=(SG.neu.frei||{})[m],frei=fr&&fr.stand===sgStandHash(m,SG.d);h.querySelectorAll('[data-sgx="teilen"],[data-sgx="png"],[data-sgx="zip"]').forEach(e=>e.disabled=!frei);
}
function sgAusschnittBinden(h){const m=SG.motiv,fmt=sgFormat(m),spiel=SG.satz?.spiel,konto=sgKonto();if(!['H','E'].includes(m)||fmt==='quer')return;
  const aktuell=()=>SG.motiv===m&&sgFormat(m)===fmt&&SG.satz?.spiel===spiel&&sgKonto()===konto&&h.isConnected!==false;
  h.querySelectorAll('[data-sgcut]').forEach(e=>{e.oninput=()=>{if(aktuell())sgAusschnittSetzen(e.dataset.sgcut,+e.value/(e.dataset.sgcut==='zoom'?1:100),h);};e.onchange=()=>{if(aktuell())sgBald(false,false);};});
  const b=h.querySelector('[data-sgcut-aktiv]');if(b)b.onclick=()=>{SG.ausschnittAktiv=!SG.ausschnittAktiv;sgAusschnittAktualisieren(h);};
  const reset=h.querySelector('[data-sgcut-reset]');if(reset)reset.onclick=()=>{if(!aktuell())return;const C=SG.neu.f?.bildausschnitt?.[m];if(C)delete C[fmt];SG.d=sgDaten();sgMerken();sgBald(false,true);};
  const bild=h.querySelector('#sgBild');if(!bild)return;sgAusschnittAktualisieren(h);let zug=null;
  bild.onpointerdown=e=>{if(!aktuell()||e.pointerType==='touch'&&!SG.ausschnittAktiv||e.isPrimary===false||e.button!=null&&e.button!==0||zug)return;
    const cv=bild.querySelector('canvas'),g=sgAusschnittGeometrie();if(!cv||!g||e.target&&e.target!==cv)return;const r=cv.getBoundingClientRect();if(!r.width||!r.height)return;
    bild.sgQuerKlickSperre=false;zug={id:e.pointerId,x:e.clientX,y:e.clientY,g,skala:cv.width/r.width,bewegt:false};};
  bild.onpointermove=e=>{if(!zug||zug.id!==e.pointerId||!aktuell())return;const dx=e.clientX-zug.x,dy=e.clientY-zug.y;if(!zug.bewegt&&Math.hypot(dx,dy)<5)return;
    if(!zug.bewegt){zug.bewegt=true;try{bild.setPointerCapture(e.pointerId);}catch(_){}}e.preventDefault();bild.classList.add('sg-zieht');
    if(zug.g.reserveX>1)sgAusschnittSetzen('x',zug.g.x-dx*zug.skala/zug.g.reserveX,h);if(zug.g.reserveY>1)sgAusschnittSetzen('y',zug.g.y-dy*zug.skala/zug.g.reserveY,h);};
  const ende=e=>{if(!zug||zug.id!==e.pointerId)return;const z=zug;zug=null;bild.classList.remove('sg-zieht');if(z.bewegt)bild.sgQuerKlickSperre=true;try{if(bild.hasPointerCapture(e.pointerId))bild.releasePointerCapture(e.pointerId);}catch(_){}if(z.bewegt&&aktuell())sgBald(false,false);};
  bild.onpointerup=ende;bild.onpointercancel=ende;bild.onlostpointercapture=ende;
}

/* Eingaben sofort auf diesem Gerät sichern. Nur ein bestätigter Serverstand
   räumt denselben lokalen Entwurf auf. Konten und Spiele bleiben getrennt. */
const SG_LOKAL_PRAEFIX='svbsc-spieltag-entwurf-v1:';
const sgSpeicherEditor=Date.now().toString(36)+'-'+Math.random().toString(36).slice(2);
let sgSpeicherFassung=0;
const sgSpeicherZustaende=new Map();
function sgMerkPlan(spiel,konto=sgKonto()){const p=SG_MERKPLAENE.get(spiel);return p?.konto===konto?p:null;}
function sgSpeicherKonflikt(){return!!((SG.lokalFassungen||[]).length||sgMerkPlan(SG.satz?.spiel)?.konflikt);}
function sgSpeicherInhalt(neu){const ohne={...(neu||{})};delete ohne.frei;delete ohne._sg_basis;if(!ohne.f)ohne.f={};
  const ordnen=x=>Array.isArray(x)?x.map(ordnen):x&&typeof x==='object'?Object.fromEntries(Object.keys(x).sort().map(k=>[k,ordnen(x[k])])):x;return JSON.stringify(ordnen(ohne));}
function sgLokalPraefix(konto,spiel){return SG_LOKAL_PRAEFIX+encodeURIComponent(String(konto||''))+':'+encodeURIComponent(String(spiel||''))+':';}
function sgLokalLesen(konto,spiel,mitArchiv=false){if(!konto||!spiel)return[];const L=[];try{const p=sgLokalPraefix(konto,spiel);
  for(let i=0;i<localStorage.length;i++){const key=localStorage.key(i);if(!key||!key.startsWith(p))continue;try{const s=localStorage.getItem(key);if(!s||s.length>262144)continue;const r=JSON.parse(s);
    if(r.v===1&&r.konto===konto&&r.spiel===spiel&&r.neu&&typeof r.neu==='object'&&!Array.isArray(r.neu))L.push({...r,key});}catch(_){}}
  }catch(_){}const archiv=L.filter(r=>r.archiviert),version=r=>r.fassung||String(r.am)+'|'+sgSpeicherInhalt(r.neu);
  return L.filter(r=>!archiv.some(a=>a.ersetzt_key===r.key&&a.ersetzt_fassung===version(r))).filter(r=>mitArchiv||!r.archiviert).sort((a,b)=>b.am-a.am);}
function sgSpeicherStatus(text,art='lokal',spiel=SG.satz?.spiel,konto=sgKonto()){if(!spiel||!konto)return;sgSpeicherZustaende.set(konto+'|'+spiel,{text,art});
  if(SG.satz?.spiel===spiel&&sgKonto()===konto&&typeof document.querySelectorAll==='function')document.querySelectorAll('[data-sgspeicherstatus]').forEach(e=>{e.textContent=text;e.dataset.art=art;});}
function sgLokalSichern(konto,spiel,neu,basis){if(!konto||!spiel)return false;try{const key=sgLokalPraefix(konto,spiel)+sgSpeicherEditor,alt=JSON.parse(localStorage.getItem(key)||'null');
  const r={v:1,konto,spiel,neu,am:Date.now(),fassung:sgSpeicherEditor+'-'+(++sgSpeicherFassung),basis:basis||null,unterwegs:alt?.unterwegs||[],auswahl:alt?.auswahl?{...alt.auswahl,inhalt:sgSpeicherInhalt(neu)}:undefined},s=JSON.stringify(r);if(s.length>262144)throw Error('zu gross');localStorage.setItem(key,s);
  sgSpeicherStatus('Auf diesem Gerät gesichert. Wird synchronisiert.','lokal',spiel,konto);return true;
  }catch(_){sgSpeicherStatus('Lokale Sicherung nicht möglich. Bitte auf die Serverbestätigung warten.','fehler',spiel,konto);return false;}}
function sgLokalUnterwegs(konto,spiel,neu){try{const key=sgLokalPraefix(konto,spiel)+sgSpeicherEditor,r=JSON.parse(localStorage.getItem(key)||'null');if(!r)return;
  r.unterwegs=[...new Set([...(r.unterwegs||[]),sgSpeicherInhalt(neu)])].slice(-3);localStorage.setItem(key,JSON.stringify(r));}catch(_){}}
// Fremde Editor-Schlüssel niemals verändern oder löschen. Ein Archivvermerk
// gilt nur für genau die gelesene Fassung; weiteres Tippen bleibt aktiv.
function sgLokalArchivieren(L){for(const r of L){try{const fassung=r.fassung||String(r.am)+'|'+sgSpeicherInhalt(r.neu),key=sgLokalPraefix(r.konto,r.spiel)+sgSpeicherEditor+'-archiv-'+sgHash(r.key+'|'+fassung);
  const archiv={v:1,konto:r.konto,spiel:r.spiel,neu:r.neu,am:r.am,basis:r.basis,archiviert:Date.now(),ersetzt_key:r.key,ersetzt_fassung:fassung};localStorage.setItem(key,JSON.stringify(archiv));}catch(_){}}}
function sgLokalAuswahl(konto,spiel,L){try{const key=sgLokalPraefix(konto,spiel)+sgSpeicherEditor,r=JSON.parse(localStorage.getItem(key)||'null');if(!r)return;r.auswahl={inhalt:sgSpeicherInhalt(r.neu),ersetzt:L.filter(x=>x.key!==key).map(x=>({key:x.key,neu:x.neu,konto:x.konto,spiel:x.spiel,am:x.am,basis:x.basis,fassung:x.fassung}))};localStorage.setItem(key,JSON.stringify(r));}catch(_){}}
function sgLokalBestaetigt(konto,spiel,neu,basis){const inhalt=sgSpeicherInhalt(neu);try{
  const key=sgLokalPraefix(konto,spiel)+sgSpeicherEditor,r=JSON.parse(localStorage.getItem(key)||'null');if(r?.auswahl?.inhalt===inhalt){sgLokalArchivieren(r.auswahl.ersetzt||[]);delete r.auswahl;localStorage.setItem(key,JSON.stringify(r));}
  for(const r of sgLokalLesen(konto,spiel)){
  if(sgSpeicherInhalt(r.neu)===inhalt){if(r.key===key)localStorage.removeItem(r.key);else sgLokalArchivieren([r]);}
  else if(r.key.endsWith(':'+sgSpeicherEditor)){r.basis=basis||r.basis;r.unterwegs=(r.unterwegs||[]).filter(s=>s!==inhalt);delete r.key;localStorage.setItem(sgLokalPraefix(konto,spiel)+sgSpeicherEditor,JSON.stringify(r));}
  }}catch(_){}const offen=sgLokalLesen(konto,spiel).some(r=>sgSpeicherInhalt(r.neu)!==inhalt);sgSpeicherStatus(offen?'Auf diesem Gerät gesichert. Weitere Eingaben werden synchronisiert.':'Gespeichert.','server',spiel,konto);}
function sgLokalWiederherstellen(r,konto){const L=sgLokalLesen(konto,r.spiel);if(!L.length)return{neu:r.neu||{}};const server=sgSpeicherInhalt(r.neu),gleich=L.filter(x=>sgSpeicherInhalt(x.neu)===server);
  sgLokalArchivieren(gleich);const offen=L.filter(x=>!gleich.includes(x)),einzig=[...new Map(offen.map(x=>[sgSpeicherInhalt(x.neu),x])).values()];
  if(!einzig.length)return{neu:r.neu||{}};const l=einzig[0];
  if(einzig.length===1&&l.basis===r.entwurf_stand){return{neu:{...l.neu,frei:r.neu?.frei||{}},wieder:true};}
  return{neu:r.neu||{},konflikt:einzig};}
function sgSpeicherHtml(){const id=SG.satz?.spiel,k=sgKonto(),z=sgSpeicherZustaende.get(k+'|'+id),L=SG.lokalFassungen||[],plan=sgMerkPlan(id),konflikt=L.length||plan?.konflikt;
  const auswahl=L.length?`<label>Gesicherte Eingaben<select data-sglokalwahl>${L.map((r,i)=>`<option value="${i}">${sgE(new Date(r.am).toLocaleString('de-DE',{day:'2-digit',month:'2-digit',hour:'2-digit',minute:'2-digit',second:'2-digit'}))}</option>`).join('')}</select></label>`:'';
  const archiv=sgLokalLesen(k,id,true).filter(r=>r.archiviert),zeit=r=>sgE(new Date(r.am).toLocaleString('de-DE',{day:'2-digit',month:'2-digit',hour:'2-digit',minute:'2-digit',second:'2-digit'}));
  return `<section class="sg-speicher" aria-label="Automatisches Speichern"><p data-sgspeicherstatus data-art="${konflikt?'konflikt':z?.art||'server'}" role="status" aria-live="polite">${sgE(konflikt?'Es gibt nicht übertragene Eingaben und einen anderen gespeicherten Stand. Bitte wähle, womit du weiterarbeiten möchtest.':z?.text||'Änderungen werden automatisch gespeichert.')}</p>${konflikt?`${auswahl}<div class="sg-zeile"><button type="button" class="btn sm" data-sgspeicher="lokal">Meine Eingaben verwenden</button><button type="button" class="btn sm ghost" data-sgspeicher="server">Gespeicherten Stand verwenden</button></div>`:z?.art==='fehler'?'<button type="button" class="btn sm ghost" data-sgspeicher="retry">Erneut speichern</button>':''}${archiv.length?`<details><summary>Andere gesicherte Fassungen (${archiv.length})</summary><p>Diese Fassungen werden nicht automatisch übertragen. Du kannst eine davon wiederherstellen.</p><label>Fassung<select data-sgarchivwahl>${archiv.map((r,i)=>`<option value="${i}">${zeit(r)}</option>`).join('')}</select></label><button type="button" class="btn sm ghost" data-sgspeicher="archiv">Fassung wiederherstellen</button></details>`:''}</section>`;}
function sgSpeicherBinden(h){h.querySelectorAll('[data-sgspeicher]').forEach(b=>b.onclick=async()=>{const spiel=SG.satz?.spiel,konto=sgKonto(),art=b.dataset.sgspeicher,vorher=sgSpeicherInhalt(SG.neu);if(!spiel||!konto)return;b.disabled=true;
  try{if(art==='retry'){await sgMerkSofort(spiel);return;}const plan=sgMerkPlan(spiel),L=SG.lokalFassungen||[],wahl=+h.querySelector('[data-sglokalwahl]')?.value||0;
    const alle=sgLokalLesen(konto,spiel),archiv=sgLokalLesen(konto,spiel,true).filter(r=>r.archiviert),aw=+h.querySelector('[data-sgarchivwahl]')?.value||0;
    const lokal=art==='archiv'?archiv[aw]?.neu:L[wahl]?.neu||plan?.neu||(plan?.stand?JSON.parse(plan.stand):null);
    if(plan?.laeuft)await plan.lauf;const r=await svtRpc('spieltag_satz',{p_spiel:spiel});if(SG.satz?.spiel!==spiel||sgKonto()!==konto)return;if(!r?.ok)throw Error('Der gespeicherte Stand konnte nicht geladen werden.');
    if(sgSpeicherInhalt(SG.neu)!==vorher)throw Error('Inzwischen weiterbearbeitet');
    // Den aktuellen Editor vor einer bewussten Fassungswahl ebenfalls erhalten.
    const eigener=alle.find(x=>x.key.endsWith(':'+sgSpeicherEditor));if(eigener){const sicher={...eigener},key=eigener.key+'-ablage-'+Date.now();delete sicher.key;localStorage.setItem(key,JSON.stringify(sicher));alle.push({...sicher,key});}
    if(plan){clearTimeout(plan.timer);clearTimeout(plan.retry);SG_MERKPLAENE.delete(spiel);}SG.satz=r;SG.lokalFassungen=[];
    if((art==='lokal'||art==='archiv')&&lokal){SG.neu={...lokal,frei:r.neu?.frei||{}};sgMerken();sgLokalAuswahl(konto,spiel,alle);try{await sgMerkSofort(spiel);}catch(_){/* Die gewählte Fassung bleibt bis zur Bestätigung lokal gesichert. */}}else{sgLokalArchivieren(alle);SG.neu=r.neu||{};sgSpeicherStatus('Gespeicherten Stand geladen.','server');}
    if(!SG.neu.f)SG.neu.f={};await sgNeu(true);
  }catch(_){sgSpeicherStatus('Das Speichern hat nicht geklappt. Deine lokalen Eingaben bleiben erhalten.','fehler');}finally{b.disabled=false;}});
  if(sgSpeicherKonflikt())h.querySelectorAll('#sgForm input,#sgForm textarea,#sgForm select,#sgForm button,[data-sgx],[data-sgcut],[data-sgcut-reset],[data-sgcut-aktiv],#sgQuerY,#sgQuerZoom,#sgQuerReset').forEach(e=>e.disabled=true);}
let sgSpeicherLaeuft=false;
function sgSpeicherStart(){if(sgSpeicherLaeuft||typeof window.addEventListener!=='function')return;sgSpeicherLaeuft=true;
  const flush=()=>{for(const p of SG_MERKPLAENE.values()){if(p.konto!==sgKonto()||p.konflikt)continue;clearTimeout(p.timer);clearTimeout(p.retry);p.timer=null;if(!p.laeuft&&p.neu)sgMerkSenden(p);}};
  window.addEventListener('pagehide',flush);window.addEventListener('online',flush);
  if(typeof document.addEventListener==='function')document.addEventListener('visibilitychange',flush);}

/* Vorhandene Vereinsmotive: kleine Galeriebilder, feste Originalquellen für die Ausgabe. */
const SG_FOTO_FUNDUS = Object.freeze(PK_FOTOS.map(f => Object.freeze({...f,st:Object.freeze([...f.st])})));
const sgFotoFundus = id => SG_FOTO_FUNDUS.find(f => f.id === id) || null;
const sgFotoFeld = feld => feld === 'fotoH' || feld === 'fotoE';
const sgFotoEsc = s => String(s == null ? '' : s).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
function sgFotoPfad(p){ return typeof p === 'string' && p.length <= 300 && /^assets\/[a-z0-9_.-]+(?:\/[a-z0-9_.-]+)*\.(?:jpe?g|png|webp)$/i.test(p) && p.split('/').every(s => s !== '.' && s !== '..'); }
function sgFotoWahl(wahl){
  if(typeof wahl !== 'string' || wahl.length > 512) return {art:'auto'};
  const w = wahl.trim(), id = w.startsWith('fundus:') ? w.slice(7) : w;
  if(sgFotoFundus(id)) return {art:'fundus',id};
  if(w.startsWith('bib:') && sgFotoPfad(w.slice(4))) return {art:'bibliothek',pfad:w.slice(4)};
  return {art:'auto'};
}
function sgFotoTermin(D, feld){
  const d = /^(\d{4})-(\d{2})-(\d{2})$/.exec(String(D.datum || ''));
  const t = /^(\d{1,2}):([0-5]\d)(?::[0-5]\d)?$/.exec(String(D.zeit || ''));
  if(!d || !t || +t[1] > 23) return {datum:'',zeit:''};
  const z = new Date(0); z.setUTCFullYear(+d[1], +d[2] - 1, +d[3]); z.setUTCHours(+t[1], +t[2], 0, 0);
  if(z.getUTCFullYear() !== +d[1] || z.getUTCMonth() !== +d[2] - 1 || z.getUTCDate() !== +d[3]) return {datum:'',zeit:''};
  if(feld === 'fotoE') z.setUTCMinutes(z.getUTCMinutes() + 105);
  return {datum:z.toISOString().slice(0,10),zeit:z.toISOString().slice(11,16)};
}
/* Redaktionelle Motiv-Tags aus Bibliothek und Fundus. Nur Ergebnisbilder
   bekommen eine Spielwertung, immer aus Sicht des eigenen Vereins. */
function sgFotoErgebnis(D, feld) {
  if (feld !== 'fotoE' || !D?.gespielt || !Number.isInteger(D.toreH) || !Number.isInteger(D.toreG)) return '';
  const differenz = (D.toreH - D.toreG) * (D.wirHeim ? 1 : -1);
  return differenz > 0 ? 'Sieg' : differenz < 0 ? 'Niederlage' : 'Remis';
}
const SG_MOTIV_TAGS = {
  Sieg: /jubel|sieg|feier|torjubel|gegenlicht|flutlicht|sommertag/i,
  Niederlage: /zusammenhalt|mannschaftskreis|teamkreis|linie|schuhe|mittelkreis|herbstlaub|raureif/i,
  Remis: /zweikampf|spielszene|aktion|elfmeterpunkt|eckfahne|ball im gras/i
};
function sgMotivWert(foto, ergebnis) {
  if (!ergebnis) return 0;
  const tags = Array.isArray(foto.tags) ? foto.tags : [];
  const text = [foto.titel, foto.name, ...tags].join(' ');
  const direkt = ['Sieg', 'Niederlage', 'Remis'].filter(w => tags.includes(w.toLowerCase()));
  if (direkt.length) return direkt.includes(ergebnis) ? 2 : -1;
  if (ergebnis !== 'Sieg' && /jubel|sieg|feier/i.test(text)) return -1;
  return SG_MOTIV_TAGS[ergebnis].test(text) ? 1 : 0;
}
function sgFotoAuto(D, feld){
  const termin = sgFotoTermin(D || {}, feld); if(!termin.datum) return sgFotoFundus('summer');
  const licht = typeof pkLicht === 'function' ? pkLicht(termin.datum, termin.zeit, 'auto') : {stimmung:'summer'};
  const stimmung = ['night','spring','summer','autumn','winter'].includes(licht && licht.stimmung) ? licht.stimmung : 'summer';
  const ergebnis = sgFotoErgebnis(D, feld);
  const passend = SG_FOTO_FUNDUS.filter(f => f.auto && f.st.includes(stimmung) && sgMotivWert(f, ergebnis) > 0);
  if (passend.length) {
    const index = Array.from(String(D.spiel || D.gegner || '')).reduce((n,c) => (31*n + c.charCodeAt(0)) >>> 0, 0);
    return passend[index % passend.length];
  }
  const auswahl = typeof pkFotoAuswahl === 'function' ? pkFotoAuswahl({datum:termin.datum,gegner:D && D.gegner || ''}, stimmung) : stimmung;
  return sgFotoFundus(auswahl) || SG_FOTO_FUNDUS.find(f=>f.auto&&f.st.includes(stimmung)) || sgFotoFundus('summer');
}
function sgFotoEmpfehlung(D,feld){const t=sgFotoTermin(D||{},feld);if(!t.datum)return{ids:[],text:'Datum und Anstoßzeit ergänzen, dann passen die Vorschläge zum Spiel.'};
  const l=pkLicht(t.datum,t.zeit,'auto'),ids=SG_FOTO_FUNDUS.filter(f=>f.auto&&f.st.includes(l.stimmung)).map(f=>f.id);
  const jahreszeit={spring:'Frühling',summer:'Sommer',autumn:'Herbst',winter:'Winter'};
  return{ids,text:(feld==='fotoE'?'Nach dem Spiel':'Zum Anstoß')+' um '+t.zeit+' Uhr: '+(l.nacht?'Abend mit Flutlicht.':(jahreszeit[l.stimmung]||'Spieltag')+' bei Tageslicht.')};}
async function sgSpielbildAusDrive(D){
  if (typeof SVB === 'undefined' || !SVB.sb || !D?.gespielt ||
      !/^[A-Z0-9]{20,40}$/.test(D.spiel) || !/^\d{4}-\d{2}-\d{2}$/.test(D.datum)) return null;
  const prefix = `assets/spieltag/drive/${D.spiel.toLowerCase()}/${D.datum}/`;
  try {
    const {data, error} = await SVB.sb.from('studio_medien').select('pfad,name,tags')
      .like('pfad', prefix + '%').contains('tags', ['drive-spielbild'])
      .order('am', {ascending:false}).order('pfad').limit(60);
    const ausgang = sgFotoErgebnis(D, 'fotoE');
    const foto = (data || []).filter(f => sgFotoPfad(f?.pfad) && f.pfad.startsWith(prefix) && sgMotivWert(f, ausgang) >= 0)
      .sort((a,b) => sgMotivWert(b, ausgang) - sgMotivWert(a, ausgang))[0];
    if (!error && foto?.pfad.startsWith(prefix) && sgFotoPfad(foto.pfad)) return foto;
  } catch (_) {}
  return null;
}
async function sgFotoQuelle(wahl, D, feld){
  const w = sgFotoWahl(wahl);
  if (feld === 'fotoE' && w.art === 'auto') {
    const foto = await sgSpielbildAusDrive(D);
    if (foto) {
      let url = null;
      try { url = await sbUrl(foto.pfad); } catch (_) {}
      return {url, pfad:foto.pfad, spiel:D.spiel, datum:D.datum,
        titel:'Spielbild · Gabi', art:'bibliothek', echt:true};
    }
  }
  if(w.art === 'bibliothek'){
    try{ const url = typeof sbUrl === 'function' ? await sbUrl(w.pfad) : null; if(typeof url === 'string' && url){
      const L = typeof sbListe === 'function' ? sbListe(60) : [], m = L.find(m => m && m.pfad === w.pfad);
      return {url,titel:String(m && m.name || 'Eigenes Foto').slice(0,120),art:'bibliothek',echt:true};
    } }catch(e){ /* Die ausdrückliche Bildwahl bleibt bestehen und wird als fehlend geprüft. */ }
    return {url:null,titel:'Eigenes Foto nicht erreichbar',art:'bibliothek',echt:true};
  }
  const f = w.art === 'fundus' ? sgFotoFundus(w.id) : sgFotoAuto(D || {}, feld);
  return {url:'plakat/foto/' + f.id + '.webp',titel:f.titel,art:'fundus',echt:false};
}
function sgFotoBibliothek(A){
  const L = A && (Array.isArray(A.bibliothek) ? A.bibliothek : Array.isArray(A.eigene) ? A.eigene : []) || [], seen = new Set();
  return L.filter(m => m && sgFotoPfad(m.pfad) && !seen.has(m.pfad) && seen.add(m.pfad)).slice(0,60);
}
function sgFotoGalerieHtml(feld, wahl, A, D){
  if(!sgFotoFeld(feld)) return '';
  const w = sgFotoWahl(wahl), L = sgFotoBibliothek(A), esc = sgFotoEsc,emp=sgFotoEmpfehlung(D||{},feld);
  const ergebnis = sgFotoErgebnis(D, feld);
  const gewicht = f => Number(emp.ids.includes(f.id)) * 3 + sgMotivWert(f, ergebnis);
  L.sort((a,b) => sgMotivWert(b, ergebnis) - sgMotivWert(a, ergebnis));
  const motive=[...SG_FOTO_FUNDUS].sort((a,b)=>gewicht(b)-gewicht(a));
  const knopf = f => `<button type="button" class="sg-fotomotiv" data-sgfundus="${f.id}" aria-pressed="${w.art === 'fundus' && w.id === f.id}" aria-label="Hintergrundmotiv: ${esc(f.titel)}${emp.ids.includes(f.id) ? (sgMotivWert(f,ergebnis)>0 ? ', Vorschlag für '+ergebnis : ', passend zum Termin') : ''}"><img src="plakat/foto/klein/${f.id}.webp" alt="" loading="lazy" draggable="false" width="180" height="320"><span>${esc(f.titel)}</span>${emp.ids.includes(f.id) ? '<small>'+(sgMotivWert(f,ergebnis)>0 ? 'Vorschlag · '+ergebnis : 'Passt zum Termin')+'</small>' : ''}</button>`;
  const eigene = L.map(m => { const u = typeof tkFotoUrl === 'function' ? tkFotoUrl(m.pfad) : '', an = w.art === 'bibliothek' && w.pfad === m.pfad, name = String(m.name || 'Eigenes Foto').slice(0,120);
    return `<button type="button" class="sg-fotobibmotiv${an ? ' on' : ''}" data-sgbib="${esc(m.pfad)}" aria-pressed="${an}" aria-label="Eigenes Foto: ${esc(name)}${sgMotivWert(m,ergebnis)>0 ? ', Vorschlag für '+ergebnis : ''}">${u ? `<img src="${esc(u)}" alt="" loading="lazy">` : '<span class="sg-fotoplatz" aria-hidden="true">Foto</span>'}<span>${esc(name)}</span>${sgMotivWert(m,ergebnis)>0 ? '<small>Vorschlag · '+ergebnis+'</small>' : ''}</button>`;
  }).join('');
  return `<div class="sg-foto sg-fotowahl" data-sgfoto="${feld}"><p class="sg-l">${feld === 'fotoE' ? 'Ergebnis-Hintergrund' : 'Ankündigungs-Hintergrund'}</p>
    <p class="sg-fotohin">${esc(emp.text)} ${ergebnis ? 'Bildvorschläge für '+({Sieg:'den Sieg',Niederlage:'die Niederlage',Remis:'das Remis'}[ergebnis])+'.' : 'Passende Motive stehen zuerst.'} Du kannst jedes Motiv selbst wählen.</p>
    <div class="sg-fotoreihe" role="group" tabindex="0" aria-label="Fußballmotive, seitlich blättern"><button type="button" class="sg-fotoauto" data-sgfotoauto aria-pressed="${w.art === 'auto'}"><b>Auto</b><span>${feld === 'fotoE' ? (A?.fotoWahlE?.pfad ? 'Spielbild · Gabi' : 'Spielbild oder Lichtstimmung') : 'Lichtstimmung zum Anstoß'}</span></button>${motive.map(knopf).join('')}</div>
    <div class="sg-fotoscroll"><button type="button" data-sgfoto-vor="-1" aria-label="Vorherige Motive">Zurück</button><label><span>Galerie durchsehen</span><input type="range" data-sgfoto-scroll min="0" max="0" step="1" value="0" aria-label="Position in der Motivgalerie"></label><button type="button" data-sgfoto-vor="1" aria-label="Weitere Motive">Weiter</button></div>
    <details class="sg-fotobibliothek"${w.art === 'bibliothek' ? ' open' : ''}><summary>Eigene Bibliothek (${L.length})</summary>${L.length ? `<div class="sg-bib">${eigene}</div>` : '<p class="sg-fotohin">Noch keine eigenen Hintergrundfotos in der Bibliothek.</p>'}</details>
    <label class="sg-up sg-fotoupload" role="button" tabindex="0" data-sgfotohoch aria-label="Eigenes Foto hochladen"><span data-sbt>Eigenes Foto hochladen</span><input type="file" accept="image/*" data-sgup="${feld}" hidden></label></div>`;
}
const sgFotoScrollMerk=new WeakMap();
function sgFotoScrollAktuell(p){const r=p.querySelector('.sg-fotoreihe'),s=p.querySelector('[data-sgfoto-scroll]');if(!r||!s)return;
  const max=Math.max(0,r.scrollWidth-r.clientWidth),links=Math.max(0,Math.min(max,r.scrollLeft));s.max=String(max);s.value=String(links);s.disabled=max<1;
  s.setAttribute('aria-valuetext',max<1?'Alle Motive sichtbar':Math.round(links/max*100)+' Prozent der Galerie');
  p.querySelectorAll('[data-sgfoto-vor]').forEach(b=>b.disabled=+b.dataset.sgfotoVor<0?links<=1:links>=max-1);
}
function sgFotoScrollBinden(p){const r=p.querySelector('.sg-fotoreihe'),s=p.querySelector('[data-sgfoto-scroll]');if(!r||!s)return()=>{};
  const setzen=x=>{r.scrollLeft=Math.max(0,Math.min(r.scrollWidth-r.clientWidth,x));sgFotoScrollAktuell(p);};let zug=null,sperre=false;
  r.onscroll=()=>sgFotoScrollAktuell(p);s.oninput=()=>setzen(+s.value);
  p.querySelectorAll('[data-sgfoto-vor]').forEach(b=>b.onclick=()=>setzen(r.scrollLeft+Number(b.dataset.sgfotoVor)*Math.max(100,r.clientWidth*.8)));
  r.ondragstart=e=>e.preventDefault();
  r.onpointerdown=e=>{sperre=false;if(e.pointerType==='touch'||e.isPrimary===false||e.button!=null&&e.button!==0)return;zug={id:e.pointerId,x:e.clientX,links:r.scrollLeft,bewegt:false};};
  r.onpointermove=e=>{if(!zug||zug.id!==e.pointerId)return;const delta=e.clientX-zug.x;if(!zug.bewegt&&Math.abs(delta)<5)return;
    if(!zug.bewegt){zug.bewegt=true;try{r.setPointerCapture(e.pointerId);}catch(_){}}sperre=true;e.preventDefault();setzen(zug.links-delta);r.classList.add('sg-foto-zieht');};
  const ende=e=>{if(!zug||zug.id!==e.pointerId)return;zug=null;r.classList.remove('sg-foto-zieht');try{if(r.hasPointerCapture(e.pointerId))r.releasePointerCapture(e.pointerId);}catch(_){}};
  r.onpointerup=ende;r.onpointercancel=ende;r.onlostpointercapture=ende;
  const klick=e=>{if(sperre){e.preventDefault();e.stopPropagation();sperre=false;}};r.addEventListener('click',klick,true);
  r.onkeydown=e=>{sperre=false;if(e.target!==r)return;const x=e.key==='Home'?0:e.key==='End'?r.scrollWidth:e.key==='ArrowLeft'?r.scrollLeft-100:e.key==='ArrowRight'?r.scrollLeft+100:null;if(x!=null){e.preventDefault();setzen(x);}};
  sgFotoScrollAktuell(p);let o=null;
  if(typeof ResizeObserver==='function'){o=new ResizeObserver(()=>sgFotoScrollAktuell(p));o.observe(r);}
  return()=>{if(o)o.disconnect();r.removeEventListener('click',klick,true);};
}
function sgFotoBinden(h){
  if(!h || typeof h.querySelectorAll !== 'function') return;
  (sgFotoScrollMerk.get(h)||[]).forEach(f=>f());sgFotoScrollMerk.set(h,[...h.querySelectorAll('[data-sgfoto]')].map(sgFotoScrollBinden));
  h.querySelectorAll('[data-sgfotohoch]').forEach(l => { l.onkeydown = ev => {
    if(ev.key !== 'Enter' && ev.key !== ' ') return; const inp = l.querySelector('[data-sgup]');
    if(inp && !inp.disabled){ ev.preventDefault(); inp.click(); }
  }; });
  const binden = (selector, wert) => h.querySelectorAll(selector).forEach(b => { b.onclick = () => {
    if(h.isConnected === false || typeof h.contains === 'function' && !h.contains(b)) return;
    const p = b.closest('[data-sgfoto]'), feld = p && p.dataset.sgfoto, v = wert(b);
    if(!sgFotoFeld(feld) || v === null || typeof sgSetzen !== 'function' || typeof sgBald !== 'function') return;
    sgSetzen(feld, v); sgBald(true, true);
  }; });
  binden('[data-sgfundus]', b => sgFotoFundus(b.dataset.sgfundus) ? 'fundus:' + b.dataset.sgfundus : null);
  binden('[data-sgfotoauto]', () => '');
}
function sgFotoQualitaet(D, A, feld, fmt){
  if(!sgFotoFeld(feld)) return '';
  const im = A && A[feld], iw = im && (im.naturalWidth || im.width), ih = im && (im.naturalHeight || im.height);
  if(!(Number.isFinite(iw) && Number.isFinite(ih) && iw > 0 && ih > 0)) return '';
  const quer = fmt === 'quer' && feld === 'fotoH'; const hoehe = feld === 'fotoE' ? fmt === 'story' ? 1920 : 1350 : (D && D.wirHeim === false ? 940 : 1000) + (fmt === 'story' ? 285 : 0); let scale = Math.max(1080 / iw, hoehe / ih);
  if(!quer&&typeof sgAusschnittGeometrie==='function'){const g=sgAusschnittGeometrie(D,A,feld==='fotoH'?'H':'E',fmt);if(g)scale=g.scale;}
  if(quer){
    const zoom = D && Number.isFinite(Number(D.querZoom)) ? Math.max(1, Math.min(2, Number(D.querZoom))) : 1;
    const crop = typeof sgQuerCrop === 'function' ? sgQuerCrop(iw, ih, D && D.querY, zoom) : {sw:1920 / (Math.max(1920 / iw, 1080 / ih) * zoom)};
    if(!crop || !(crop.sw > 0)) return ''; scale = 1920 / crop.sw;
  }
  if(!(scale > 1.5)) return '';
  const faktor = scale.toFixed(1).replace('.', ',');
  return `${iw} × ${ih} Pixel: ${quer ? 'im Querbanner' : 'im Motiv'} ${faktor}-fach vergrößert. ${quer ? 'Nutze möglichst ein größeres Querfoto oder weniger Zoom.' : 'Nutze möglichst ein größeres Original.'}`;
}

/* Auswahl und Tastaturposition bleiben auch nach einer neuen Bildladung stehen. */
function sgFotoZustand(h){
  const A = document.activeElement, innen = A && h.contains(A), p = innen && typeof A.closest === 'function' ? A.closest('[data-sgfoto]') : null;
  let fokus = '';
  if(p && sgFotoFeld(p.dataset.sgfoto)){
    const basis = '[data-sgfoto="' + p.dataset.sgfoto + '"] ', d = A.dataset || {};
    if(sgFotoFundus(d.sgfundus)) fokus = basis + '[data-sgfundus="' + d.sgfundus + '"]';
    else if(d.sgfotoauto != null) fokus = basis + '[data-sgfotoauto]';
    else if(sgFotoPfad(d.sgbib)) fokus = basis + '[data-sgbib="' + d.sgbib + '"]';
    else if(d.sgfotohoch != null) fokus = basis + '[data-sgfotohoch]';
  }
  const reihen = [...h.querySelectorAll('.sg-fotoreihe')].map(e => ({feld:e.closest('[data-sgfoto]').dataset.sgfoto,links:e.scrollLeft}));
  const offen = [...h.querySelectorAll('.sg-fotobibliothek')].filter(e => e.open).map(e => e.closest('[data-sgfoto]').dataset.sgfoto);
  return {fokus,reihen,offen};
}
function sgFotoWiederherstellen(h, z){
  if(!z) return;
  for(const r of z.reihen){ const e = h.querySelector('[data-sgfoto="' + r.feld + '"] .sg-fotoreihe'); if(e){e.scrollLeft = r.links;const p=e.closest?.('[data-sgfoto]');if(p&&p.querySelector)sgFotoScrollAktuell(p);} }
  for(const feld of z.offen){ const e = h.querySelector('[data-sgfoto="' + feld + '"] .sg-fotobibliothek'); if(e) e.open = true; }
  if(z.fokus){ const e = h.querySelector(z.fokus); if(e) e.focus({preventScroll:true}); }
}

/* Ergebnis: Originalfoto, Wappen und belegte Tore. Keine erzeugten Bildtexte. */
const sgTorMinuteGueltig = t => Number.isInteger(t.m) && t.m >= 1 && t.m <= 130 && Number.isInteger(t.x || 0) && (t.x || 0) >= 0 && (t.x || 0) <= 20;
function sgErgebnisTore(D, wir = true){
  const tore = (D.tore || []).filter(t => t.wir === wir), gruppen = [], map = new Map();
  let fehlendeNamen = 0, fehlendeMinuten = 0;
  const erwartet = D.wirHeim === wir ? D.toreH : D.toreG;
  const sortiert = tore.slice().sort((a,b) => (+a.m || 0) - (+b.m || 0) || (+a.x || 0) - (+b.x || 0));
  for(const t of sortiert){
    const name = String(t.name || '').trim(), minute = sgTorMinuteGueltig(t);
    if(!name) fehlendeNamen++; if(!minute) fehlendeMinuten++;
    if(!name) continue;
    const eigentor = t.art === 'et', key = name.toLocaleLowerCase('de') + ':' + eigentor;
    let g = map.get(key); if(!g){ g = { name, eigentor, wir, zeiten:[] }; map.set(key, g); gruppen.push(g); }
    if(minute) g.zeiten.push(sgMin(t) + (t.art === 'elf' ? ' (Elfmeter)' : ''));
  }
  return { gruppen, erwartet, anzahl:tore.length, fehlendeNamen, fehlendeMinuten,
    vollstaendig:Number.isInteger(erwartet) && erwartet >= 0 && erwartet === tore.length && !fehlendeNamen && !fehlendeMinuten };
}
function sgErgebnisBeide(D){const heim=sgErgebnisTore(D,D.wirHeim),gast=sgErgebnisTore(D,!D.wirHeim);return{heim,gast,gruppen:[...heim.gruppen,...gast.gruppen],vollstaendig:heim.vollstaendig&&gast.vollstaendig};}

/* Lukas' Ergebnisvorlage: Originalfoto, Headline und großer Endstand.
   Die Schützenliste ist eine ausdrücklich gewählte Zusatzfassung. */
function sgErgebnisOriginalMalen(ctx,D,A){
  ctx.fillStyle=CI.navy;ctx.fillRect(0,0,SG_W,SG_H);
  sgFotoMalen(ctx,A.fotoE,0,197,SG_W,646,D,'E',.3);
  const g=ctx.createLinearGradient(0,430,0,843);g.addColorStop(0,'rgba(4,17,39,0)');g.addColorStop(.7,'rgba(4,17,39,.74)');g.addColorStop(1,'rgba(4,17,39,.94)');ctx.fillStyle=g;ctx.fillRect(0,430,SG_W,413);
  sgKopf(ctx,D,true);sgWappen(ctx,A);
  if(D.h2){sgT(ctx,D.h1.toUpperCase(),SG_X,664,{fam:'Anton',w:400,cap:69,c:CI.weiss,max:936,min:.7,k:'h1'});sgT(ctx,D.h2.toUpperCase(),SG_X,787,{fam:'Anton',w:400,cap:108,c:CI.orange,max:936,min:.6,k:'h2'});}
  else sgT(ctx,D.h1.toUpperCase(),SG_X,787,{fam:'Anton',w:400,cap:108,c:CI.orange,max:936,min:.6,k:'h1'});
  sgLinie(ctx,SG_X,842,SG_R,'rgba(170,181,200,.32)',2);sgLinie(ctx,SG_X,841,158,CI.orange,4);
  const cap=272,mitte=540,a=String(D.toreH),b=String(D.toreG);ctx.font=`400 ${cap/sgCapR(ctx,'Anton',400)}px Anton`;
  const wa=ctx.measureText(a).width,wb=ctx.measureText(b).width,f=Math.min(1,300/Math.max(wa,wb));
  sgT(ctx,a,mitte-44,1216-(1-f)*cap*.5,{fam:'Anton',w:400,cap:cap*f,c:CI.weiss,a:'r',k:'toreH'});sgT(ctx,b,mitte+44,1216-(1-f)*cap*.5,{fam:'Anton',w:400,cap:cap*f,c:CI.weiss,k:'toreG'});
  ctx.fillStyle=CI.orange;ctx.fillRect(mitte-23,1006,46,46);ctx.fillRect(mitte-23,1112,46,46);
  const aussen=Math.max(wa,wb)*f+44+28,platz=mitte-aussen-SG_X;
  const label=(name,links,k)=>{const Z=sgZweiZeilen(name),y0=Z.length===1?1092:1047;Z.forEach((z,i)=>sgT(ctx,z,links?SG_X:SG_R,y0+i*58,{fam:'SGC',w:800,cap:30,c:CI.weiss,a:links?'l':'r',max:Math.max(150,platz),min:.62,k}));};
  label(D.heim,true,D.wirHeim?'wir':'gegner');label(D.gast,false,D.wirHeim?'gegner':'wir');
}

/* Umbruch an Wortgrenzen statt abgeschnittener Namen. Passt selbst ein Wort
   nicht, meldet das Motiv den Überlauf und bleibt vor dem Export gesperrt. */
function sgErgebnisZeilen(ctx, text, breite, schrift){
  ctx.font = schrift; const zeilen = []; let zeile = '';
  for(const wort of String(text || '').trim().split(/\s+/).filter(Boolean)){
    const neu = zeile ? zeile + ' ' + wort : wort;
    if(zeile && ctx.measureText(neu).width > breite){ zeilen.push(zeile); zeile = wort; } else zeile = neu;
  }
  if(zeile) zeilen.push(zeile); return zeilen;
}
function sgErgebnisName(ctx, name, cx, y, breite, key){
  let s = 44, zeilen;
  do{ zeilen = sgErgebnisZeilen(ctx, String(name).toUpperCase(), breite, '800 ' + s + 'px SGC'); if(zeilen.length <= 2) break; s -= 2; }while(s >= 32);
  if(zeilen.length > 2) SG.ueber[key] = true;
  zeilen.forEach((z,i) => sgT(ctx, z, cx, y + i * (s + 5), {fam:'SGC',w:800,s,c:CI.weiss,a:'c',max:breite,min:1,k:key}));
}
function sgErgebnisMalen(ctx, D, A){
  if(D.zeigeTore !== true)return sgErgebnisOriginalMalen(ctx,D,A);
  const oy = SG.oy || 0;
  ctx.save(); ctx.filter = 'none'; ctx.shadowBlur = 0; ctx.imageSmoothingQuality = 'high';
  ctx.fillStyle = CI.navy; ctx.fillRect(0, -oy, SG_W, SG_H + oy * 2);
  sgFotoMalen(ctx, A.fotoE, 0, -oy, SG_W, SG_H + oy * 2, D, 'E', .35);
  /* Ein ruhiger Leseschutz, ohne Lichtstrahlen, Glanz oder Weichzeichnung. */
  ctx.fillStyle = 'rgba(4,17,39,.24)'; ctx.fillRect(0, -oy, SG_W, 640 + oy);
  sgKopf(ctx, D, true);
  sgT(ctx, D.h1.toUpperCase(), SG_X, D.h2 ? 372 : 435, {fam:'Anton',w:400,cap:100,c:CI.weiss,max:936,min:.66,k:'h1'});
  sgT(ctx, D.h2.toUpperCase(), SG_X, 499, {fam:'Anton',w:400,cap:100,c:CI.orange,max:936,min:.66,k:'h2'});
  ctx.fillStyle = 'rgba(4,17,39,.78)'; ctx.fillRect(0, 640, SG_W, SG_H - 640 + oy);
  ctx.fillStyle = CI.orange; ctx.fillRect(SG_X, 640, 72, 5);
  sgT(ctx, 'ENDSTAND', SG_W / 2, 617, {fam:'SGB',w:700,s:23,c:CI.weiss,a:'c',sp:4});
  const links = D.wirHeim ? A.wWir : A.wGeg, rechts = D.wirHeim ? A.wGeg : A.wWir;
  for(const [im,cx] of [[links,190],[rechts,890]]) if(im){
    let h = 130; const w = sgWappenBreite(im,h); if(w > 210) h *= 210 / w;
    sgWappenMalen(ctx, im, cx - sgWappenBreite(im,h) / 2, 782, h);
  }
  const basis = 201, schrift = basis / sgCapR(ctx, 'Anton', 400);
  ctx.font = '400 ' + schrift + 'px Anton';
  const faktor = Math.min(1, 178 / Math.max(ctx.measureText(String(D.toreH)).width, ctx.measureText(String(D.toreG)).width)), cap = basis * faktor, scoreY = 867 - (basis - cap) / 2;
  sgT(ctx, D.toreH, 502, scoreY, {fam:'Anton',w:400,cap,c:CI.weiss,a:'r',max:178,min:1,k:'toreH'});
  sgT(ctx, D.toreG, 578, scoreY, {fam:'Anton',w:400,cap,c:CI.weiss,max:178,min:1,k:'toreG'});
  ctx.fillStyle = CI.orange; ctx.fillRect(530, 725, 20, 20); ctx.fillRect(530, 802, 20, 20);
  sgErgebnisName(ctx, D.heim, 249, 913, 354, D.wirHeim ? 'wir' : 'gegner');
  sgErgebnisName(ctx, D.gast, 831, 913, 354, D.wirHeim ? 'gegner' : 'wir');
  const T = sgErgebnisBeide(D);
  if(T.gruppen.length){
    sgLinie(ctx, SG_X, 977, SG_R, CI.linie, 2);
    sgT(ctx,'TORE '+D.heim.toUpperCase(),SG_X,1007,{fam:'SGB',w:700,s:21,c:CI.blau,max:438,k:'ergebnisHeim'});
    sgT(ctx,'TORE '+D.gast.toUpperCase(),570,1007,{fam:'SGB',w:700,s:21,c:CI.blau,max:438,k:'ergebnisGast'});
    const zeilen=Math.max(T.heim.gruppen.length,T.gast.gruppen.length),schritt=Math.min(69,280/Math.max(1,zeilen-1)),eng=zeilen>5;
    if(zeilen>8)SG.ueber.ergebnisTore=true;
    T.gruppen.forEach((g,i) => {
      const links=i<T.heim.gruppen.length,row=links?i:i-T.heim.gruppen.length;if(row>=8)return;
      const x=links?SG_X:570,y=1042+row*schritt,max=438,s=eng?24:32;
      const name = g.name + (g.eigentor ? ' (Eigentor)' : ''), zeiten = g.zeiten.join(', ');
      /* Namen und Minuten haben feste Zeilen; selbst lange Namen bleiben Text. */
      sgT(ctx, name, x, y, {fam:'SGB',w:600,s,c:CI.weiss,max,min:.80,k:'ergebnisTor' + i});
      sgT(ctx, zeiten, x, y + (eng?18:25), {fam:'SGB',w:500,s:eng?18:23,c:CI.grau,max,min:.8,k:'ergebnisMinute' + i});
    });
  }
  ctx.restore();
}

/* =====================================================================
   Beta 0.99.92 · Spieltagsstudio: der Spieltag mit den vier Motiven der Designbibel
   Albert und Lukas, 18.11.2026: „Aufmachen, und es ist schon vorbelegt.“
   - Erster Bereich im Spieltagsstudio: „Spieltag“. Ein Spiel, vier Karten: Heimspiel (oder Auswärtsspiel), Aufstellung,
     Ergebnis, Spielverlauf. Jede Karte ist fertig, bereit, wartet auf Daten oder braucht genau eine Entscheidung.
   - Grundlage: CI-Handbuch 1.0 und Reproduktionsspezifikation der Spieltagsvisuals 1.0 (Drive, Kommunikation).
     Format 1080 × 1350, gemeinsame Kopfzeile, Wappen farbig oben rechts, Anton für Headlines und Ziffern, Barlow für den Rest.
   - Ein Datensatz je Spiel (208, spieltag_satz): Alle vier Motive lesen dieselben Angaben. Von Hand Geändertes liegt in
     plakat_spiel.einstell.neu (spieltag_merken) und wird von keinem späteren Abruf überschrieben; meldet die Quelle
     später etwas anderes, sagt die Karte das.
   - Gezeichnet wird immer von der festen Vorlage (sgH, sgA, sgE, sgS), nie von einer Bild-KI. Namen, Nummern, Ergebnis und
     Minuten sind Text aus den Daten, Wappen und Porträts sind die Originaldateien.
   - Die Farben stehen einmal in CI. Wer künftig Plakate baut, nimmt sie von dort.
   - Vorlagen (Assists) kennt der Spielbericht nicht: Sie werden von Hand bestätigt, sonst steht ein Strich.
   ===================================================================== */
const CI = { navy:'#041127', navy2:'#0B1A31', blau:'#2F8BEF', orange:'#FF8731', papier:'#F6F6F2', weiss:'#F6F6F2', grau:'#AAB5C8', grau2:'#7C8799', linie:'#22345A', hell:'#D5DCE8' };
const SG_W = 1080, SG_H = 1350, SG_X = 72, SG_R = 1008;
/* Story 9:16: dasselbe Motiv, 285 Pixel tiefer gesetzt, damit oben und unten frei bleibt, was Instagram mit Bedienung überdeckt; der Grund läuft weiter */
const SG_STORY_H = 1920, SG_OY = 285;
const SG_QUER_W = 1920, SG_QUER_H = 1080;
const SG_VERSION = { H:'H 1.2', A:'A 1.0', E:'E 3.0', S:'S 1.0' };
const SG_LIGA = { A:'Kreisliga A', D2:'Kreisliga D', POKAL:'Kreispokal' };
const SG_MONAT = ['Januar','Februar','März','April','Mai','Juni','Juli','August','September','Oktober','November','Dezember'];
const SG_TAG = ['Sonntag','Montag','Dienstag','Mittwoch','Donnerstag','Freitag','Samstag'];
const SG = { spiele:[], idx:0, satz:null, kontext:null, abruf:null, neu:{}, motiv:'', A:{}, laedt:false, merkT:null, ueber:{}, reg:{} };
const sgE = s => svEsc(s == null ? '' : String(s));

/* ---------- Schriften ---------- */
let sgFontsP = null;
function sgFonts(){ if(sgFontsP) return sgFontsP;
  sgFontsP = (async () => { try{
    const L = [['SGB','partner/barlow-500.woff2','500'],['SGB','partner/barlow-600.woff2','600'],['SGB','partner/barlow-700.woff2','700'],
               ['SGC','partner/barlowc-700.woff2','700'],['SGC','partner/barlowc-800.woff2','800']];
    await Promise.all(L.map(async ([f, u, w]) => { const ff = new FontFace(f, `url(${u})`, { weight:w }); await ff.load(); document.fonts.add(ff); }));
    await document.fonts.load('400 120px Anton');
  }catch(e){ console.warn('Spieltag-Schriften', e); } })();
  return sgFontsP; }

/* ---------- kleine Helfer ---------- */
function sgHash(s){ let h = 5381, g = 52711; s = String(s); for(let i = 0; i < s.length; i++){ const c = s.charCodeAt(i); h = (Math.imul(h, 33) ^ c) >>> 0; g = (Math.imul(g, 31) + c) >>> 0; } return h.toString(36) + g.toString(36); }
const sgName = n => String(n || '').replace(/\s*\([^)]*\)\s*$/, '').trim();
function sgDatumTeile(iso){ const m = /^(\d{4})-(\d{2})-(\d{2})/.exec(iso || ''); if(!m) return null;
  const d = new Date(Date.UTC(+m[1], +m[2] - 1, +m[3])); return { lang:`${+m[3]}. ${SG_MONAT[+m[2] - 1]} ${m[1]}`, kurz:`${m[3]}.${m[2]}.${m[1]}`, tag:SG_TAG[d.getUTCDay()] }; }
const sgSaison = s => /^\d{4}$/.test(s || '') ? `20${s.slice(0, 2)}/${s.slice(2)}` : String(s || '');
const sgSlug = n => String(n || '').replace(/ä/g, 'ae').replace(/ö/g, 'oe').replace(/ü/g, 'ue').replace(/Ä/g, 'Ae').replace(/Ö/g, 'Oe').replace(/Ü/g, 'Ue').replace(/ß/g, 'ss').replace(/[^A-Za-z0-9]+/g, '-').replace(/^-+|-+$/g, '');
const sgMin = t => t.m > 0 ? t.m + (t.x ? '+' + t.x : '') + '’' : 'XX’';

/* ---------- Zeichnen: Text mit Laufweite, Größe über die Versalhöhe, Überlauf merken ---------- */
const sgCapCache = new Map();
function sgCapR(ctx, fam, w){ const k = fam + w; if(sgCapCache.has(k)) return sgCapCache.get(k);
  ctx.font = `${w} 200px ${fam}`; const m = ctx.measureText('H'); const r = (m.actualBoundingBoxAscent || 140) / 200; sgCapCache.set(k, r); return r; }
function sgBreite(ctx, text, sp){ if(!sp) return ctx.measureText(text).width; let w = 0; for(const ch of text) w += ctx.measureText(ch).width + sp; return w - sp; }
/* o: fam, w (Gewicht), s (Größe) oder cap (Versalhöhe), c (Farbe), sp (Laufweite in px), a ('l','r','c'), max (Breite), min (kleinster Faktor), k (Feld) */
function sgT(ctx, text, x, y, o){ text = String(text == null ? '' : text); if(!text) return 0;
  const fam = o.fam || 'SGB', gw = o.w || 600; let s = o.cap ? o.cap / sgCapR(ctx, fam, gw) : o.s; const sp0 = o.sp || 0;
  ctx.font = `${gw} ${s}px ${fam}`; let w = sgBreite(ctx, text, sp0), f = 1;
  if(o.max && w > o.max){ f = Math.max(o.min || .78, o.max / w); s *= f; ctx.font = `${gw} ${s}px ${fam}`; w = sgBreite(ctx, text, sp0 * f);
    if(w > o.max + 1 && o.k) SG.ueber[o.k] = true; }
  const sp = sp0 * f, x0 = o.a === 'r' ? x - w : o.a === 'c' ? x - w / 2 : x;
  ctx.fillStyle = o.c || CI.weiss; ctx.textBaseline = 'alphabetic'; ctx.textAlign = 'left';
  if(!sp) ctx.fillText(text, x0, y); else { let cx = x0; for(const ch of text){ ctx.fillText(ch, cx, y); cx += ctx.measureText(ch).width + sp; } }
  if(o.k && SG.reg._an) SG.reg._an.push({ k:o.k, x:x0 - 8, y:y - s, w:w + 16, h:s * 1.25 });
  return w; }
/* Mehrfarbige Zeile: Teile [[text, farbe], …] nacheinander */
function sgTeile(ctx, teile, x, y, o){ let cx = x; teile.forEach(([t, c]) => { cx += sgT(ctx, t, cx, y, Object.assign({}, o, { c, a:'l', max:0 })); }); return cx - x; }
function sgTeileBreite(ctx, teile, o){ const fam = o.fam || 'SGB', gw = o.w || 600, s = o.cap ? o.cap / sgCapR(ctx, fam, gw) : o.s; ctx.font = `${gw} ${s}px ${fam}`; return teile.reduce((a, [t]) => a + sgBreite(ctx, t, o.sp || 0), 0); }
function sgLinie(ctx, x1, y, x2, farbe, h){ ctx.fillStyle = farbe; ctx.fillRect(x1, y, x2 - x1, h || 2); }
function sgCover(ctx, img, x, y, w, h, fy){ if(!img) return; const iw = img.naturalWidth || img.width, ih = img.naturalHeight || img.height, s = Math.max(w / iw, h / ih), dw = iw * s, dh = ih * s;
  ctx.save(); ctx.beginPath(); ctx.rect(x, y, w, h); ctx.clip(); ctx.drawImage(img, x + (w - dw) / 2, y + (h - dh) * (fy == null ? .5 : fy), dw, dh); ctx.restore(); }
function sgRund(ctx, x, y, w, h, r){ ctx.beginPath(); ctx.moveTo(x + r, y); ctx.arcTo(x + w, y, x + w, y + h, r); ctx.arcTo(x + w, y + h, x, y + h, r); ctx.arcTo(x, y + h, x, y, r); ctx.arcTo(x, y, x + w, y, r); ctx.closePath(); }

/* Sichtbarer Bereich eines Wappens (ohne die durchsichtigen Ränder der Datei), einmal je Bild gemessen */
const sgBoxCache = new WeakMap();
function sgBox(img){ if(sgBoxCache.has(img)) return sgBoxCache.get(img);
  const iw = img.naturalWidth || img.width || 100, ih = img.naturalHeight || img.height || 100; let b = { x:0, y:0, w:1, h:1, iw, ih };
  try{ const n = 96, c = document.createElement('canvas'); c.width = n; c.height = n; const x = c.getContext('2d', { willReadFrequently:true }); x.drawImage(img, 0, 0, n, n);
    const d = x.getImageData(0, 0, n, n).data; let x0 = n, y0 = n, x1 = -1, y1 = -1;
    for(let j = 0; j < n; j++) for(let i = 0; i < n; i++) if(d[(j * n + i) * 4 + 3] > 24){ if(i < x0) x0 = i; if(i > x1) x1 = i; if(j < y0) y0 = j; if(j > y1) y1 = j; }
    if(x1 >= x0 && y1 >= y0) b = { x:x0 / n, y:y0 / n, w:(x1 - x0 + 1) / n, h:(y1 - y0 + 1) / n, iw, ih };
  }catch(e){}
  sgBoxCache.set(img, b); return b; }
/* Wappen so zeichnen, dass sein sichtbarer Teil genau die Höhe h hat; (x, cy) ist linke Kante und Mitte. Gibt die sichtbare Breite zurück. */
function sgWappenBreite(img, h){ const b = sgBox(img); return h * (b.w * b.iw) / (b.h * b.ih); }
function sgWappenMalen(ctx, img, x, cy, h){ const b = sgBox(img), s = h / (b.h * b.ih); ctx.drawImage(img, x - b.x * b.iw * s, cy - h / 2 - b.y * b.ih * s, b.iw * s, b.ih * s); return b.w * b.iw * s; }
/* Wappengruppe oben rechts: SV/BSC links, Gegner rechts, farbig, ohne Kasten. Breite Wappen etwas niedriger, damit beide gleich schwer wirken. */
function sgWappen(ctx, A){ const L = [A.wWir, A.wGeg].filter(Boolean); if(!L.length) return;
  const hoehe = im => { const b = sgBox(im), r = (b.w * b.iw) / (b.h * b.ih); return r >= 1.25 ? 70 : 84; };
  let x = SG_R; for(let i = L.length - 1; i >= 0; i--){ const h = hoehe(L[i]), w = sgWappenBreite(L[i], h); x -= w; sgWappenMalen(ctx, L[i], x, 124, h); x -= 20; } }
/* Gemeinsame Kopfzeile, zweizeilig (Spezifikation 2.2): Wettbewerb und Saison, darunter Saisonspiel und Datum */
function sgKopf(ctx, D, dunkel){
  sgT(ctx, `${D.wettbewerb} / Saison ${D.saison}`.toUpperCase().replace(/ \/ /g, '  /  '), SG_X, 112, { fam:'SGB', w:700, s:24.5, c:dunkel ? CI.weiss : CI.navy, sp:1.1, max:620, k:'wettbewerb' });
  const dt = sgDatumTeile(D.datum), z2 = [D.nr ? `${D.nr}. Saisonspiel` : '', dt ? dt.lang : ''].filter(Boolean).join('  /  ').toUpperCase();
  sgT(ctx, z2, SG_X, 153, { fam:'SGB', w:600, s:23.5, c:dunkel ? CI.grau : '#6F7E98', sp:1.1, max:620, k:'nr' }); }
/* Kreis mit Porträt (oder neutral mit Nummer), feiner Rand in der Farbe ring */
function sgKreis(ctx, img, cx, cy, r, ring, o){ o = o || {};
  ctx.save(); ctx.beginPath(); ctx.arc(cx, cy, r, 0, Math.PI * 2); ctx.closePath(); ctx.fillStyle = o.grund || '#1B3A66'; ctx.fill(); ctx.clip();
  if(img){ const iw = img.naturalWidth, ih = img.naturalHeight; let u = { frei:false }; try{ if(typeof tkUmriss === 'function') u = tkUmriss(img); }catch(e){}
    /* Freigestelltes Foto: Kopf und Schultern, am sichtbaren Umriss ausgerichtet. Sonst das Bild füllend, etwas nach oben gerückt. */
    if(u.frei){ const s = (r * 2 * 1.5) / u.w; ctx.drawImage(img, cx - (u.x + u.w / 2) * s, cy - r * .9 - u.y * s, iw * s, ih * s); }
    else { const s = (r * 2) / Math.min(iw, ih); ctx.drawImage(img, cx - iw * s / 2, cy - r - (ih * s - 2 * r) * .2, iw * s, ih * s); } }
  ctx.restore();
  if(!img && o.text) sgT(ctx, o.text, cx, cy + r * .3, { fam:'Anton', w:400, s:r * .86, c:o.textFarbe || '#8FB6EC', a:'c' });
  ctx.beginPath(); ctx.arc(cx, cy, r, 0, Math.PI * 2); ctx.lineWidth = o.breite || 3; ctx.strokeStyle = ring; ctx.stroke(); }
function sgMarke(ctx, text, x, y, o){ const s = o.s || 15; ctx.font = `700 ${s}px SGB`; const w = sgBreite(ctx, text, .6) + s * 1.1, h = s * 1.75;
  sgRund(ctx, x, y - h / 2, w, h, h * .28); ctx.fillStyle = o.grund; ctx.fill(); sgT(ctx, text, x + s * .55, y + s * .36, { fam:'SGB', w:700, s, c:o.c, sp:.6 }); return w; }
function sgZweiZeilen(name){ const t = String(name || '').toUpperCase().trim(); if(t.length <= 11) return [t];
  let best = null; for(let i = 1; i < t.length - 1; i++){ const c = t[i]; if(c !== ' ' && c !== '/') continue;
    const a = t.slice(0, i).trim(), b = (c === '/' ? '/ ' : '') + t.slice(i + 1).trim(), d = Math.abs(a.length - b.length); if(!best || d < best.d) best = { d, z:[a, b] }; }
  return best ? best.z : [t]; }

/* ---------- Motiv H: Heimspiel (Schwester: Auswärtsspiel) ---------- */
function sgH(ctx, D, A){
  ctx.fillStyle = CI.navy; ctx.fillRect(0, 0, SG_W, SG_H);
  const oy = SG.oy || 0; sgFotoMalen(ctx, A.fotoH, 0, -oy, SG_W, (D.wirHeim ? 1000 : 940) + oy, D, 'H', .3);
  let g = ctx.createLinearGradient(0, -oy, 0, 260); g.addColorStop(0, 'rgba(4,17,39,.82)'); g.addColorStop(1, 'rgba(4,17,39,0)'); ctx.fillStyle = g; ctx.fillRect(0, -oy, SG_W, 260 + oy);
  const oben = D.wirHeim ? 560 : 470;
  g = ctx.createLinearGradient(0, oben, 0, oben + 440); g.addColorStop(0, 'rgba(4,17,39,0)'); g.addColorStop(.5, 'rgba(4,17,39,.72)'); g.addColorStop(1, 'rgba(4,17,39,1)'); ctx.fillStyle = g; ctx.fillRect(0, oben, SG_W, SG_H - oben);
  sgKopf(ctx, D, true); sgWappen(ctx, A);
  const x = 84;
  if(D.wirHeim){ sgTeile(ctx, [['HEIM', CI.weiss], ['SPIEL', CI.blau]], x, 950, { fam:'Anton', w:400, cap:172 }); }
  else { sgT(ctx, 'AUSWÄRTS', x, 800, { fam:'Anton', w:400, cap:150, c:CI.weiss }); sgT(ctx, 'SPIEL', x, 968, { fam:'Anton', w:400, cap:150, c:CI.blau }); }
  if(D.teaser){ const t = D.teaser.trim(), punkt = /[.!?]$/.test(t), o = { fam:'SGB', w:700, cap:55 };
    ctx.font = `700 ${55 / sgCapR(ctx, 'SGB', 700)}px SGB`; const w = ctx.measureText(t).width, f = w > 924 ? Math.max(.6, 924 / w) : 1; if(w * f > 925) SG.ueber.teaser = true;
    const oo = Object.assign({}, o, { cap:55 * f, k:'teaser' }), w1 = sgT(ctx, punkt ? t.slice(0, -1) : t, x, 1046, Object.assign({}, oo, { c:CI.orange })); if(punkt) sgT(ctx, t.slice(-1), x + w1, 1046, Object.assign({}, oo, { c:CI.weiss, k:null })); }
  sgT(ctx, D.ort ? 'SPIELORT: ' + D.ort : 'SPIELORT BITTE ERGÄNZEN', x, 1095, { fam:'SGB', w:600, s:28, c:CI.weiss, max:924, min:.75, k:'ort' });
  { const teile = [[D.heim.toUpperCase(), CI.weiss], ['   vs.   ', CI.orange], [D.gast.toUpperCase(), CI.weiss]], o = { fam:'SGC', w:800, cap:34 };
    const w = sgTeileBreite(ctx, teile, o), f = w > 924 ? Math.max(.74, 924 / w) : 1; if(w * f > 926) SG.ueber.paarung = true;
    let cx = x; teile.forEach(([t, c], i) => { cx += sgT(ctx, t, cx, 1150, { fam:'SGC', w:i === 1 ? 700 : 800, cap:(i === 1 ? 24 : 34) * f, c, k:i === 0 ? (D.wirHeim ? 'wir' : 'gegner') : i === 2 ? (D.wirHeim ? 'gegner' : 'wir') : null }); }); }
  sgLinie(ctx, x, 1189, SG_R, 'rgba(246,246,242,.7)', 2);
  const dt = sgDatumTeile(D.datum) || { tag:'', kurz:'' };
  sgT(ctx, dt.tag.toUpperCase(), x, 1238, { fam:'SGB', w:500, s:21.5, c:CI.weiss, sp:3 }); sgT(ctx, dt.kurz, x, 1311, { fam:'Anton', w:400, cap:50, c:CI.weiss });
  ctx.fillStyle = 'rgba(246,246,242,.7)'; ctx.fillRect(538, 1222, 2, 96);
  sgT(ctx, 'ANSTOSS', 588, 1238, { fam:'SGB', w:500, s:21.5, c:CI.weiss, sp:3 }); sgT(ctx, D.zeit ? `${D.zeit} UHR` : '', 588, 1311, { fam:'Anton', w:400, cap:50, c:CI.weiss, k:'zeit' }); }

const sgQuerNorm = (v, standard, min, max) => v == null || v === '' || !Number.isFinite(Number(v)) ? standard : Math.max(min, Math.min(max, Number(v)));
/* Ein gemeinsamer Quellausschnitt für Vorschau, Regler, Ziehen und Export.
   y=0 zeigt den oberen, y=1 den unteren Bildbereich. Kein Strecken. */
function sgQuerCrop(iw, ih, y = .5, zoom = 1){
  if(!(Number.isFinite(iw) && Number.isFinite(ih) && iw > 0 && ih > 0)) return null;
  y = sgQuerNorm(y, .5, 0, 1); zoom = sgQuerNorm(zoom, 1, 1, 2);
  const s = Math.max(SG_QUER_W / iw, SG_QUER_H / ih) * zoom, sw = Math.min(iw, SG_QUER_W / s), sh = Math.min(ih, SG_QUER_H / s);
  return { sx:(iw - sw) / 2, sy:(ih - sh) * y, sw, sh, reserve:Math.max(0, ih * s - SG_QUER_H), y, zoom };
}
function sgQuerGeometrie(D = SG.d, A = SG.A){ const im = A && A.fotoH; return im ? sgQuerCrop(im.naturalWidth || im.width, im.naturalHeight || im.height, D.querY, D.querZoom) : null; }
/* WhatsApp-Ankündigung: vollflächiges Originalfoto mit ruhiger dunkler
   Textzone. Die Hochkant-Master bleiben unverändert. */
function sgQuer(ctx, D, A){
  ctx.fillStyle = CI.navy; ctx.fillRect(0, 0, SG_QUER_W, SG_QUER_H);
  const crop = sgQuerGeometrie(D, A);
  if(crop) {
    ctx.drawImage(A.fotoH, crop.sx, crop.sy, crop.sw, crop.sh, 0, 0, SG_QUER_W, SG_QUER_H);
    sgFotoFarblook(ctx,0,0,SG_QUER_W,SG_QUER_H,D,'H');
  }
  let g = ctx.createLinearGradient(0, 0, SG_QUER_W, 0);
  g.addColorStop(0, 'rgba(4,17,39,.90)'); g.addColorStop(.42, 'rgba(4,17,39,.86)'); g.addColorStop(.62, 'rgba(4,17,39,.38)'); g.addColorStop(1, 'rgba(4,17,39,.06)'); ctx.fillStyle = g; ctx.fillRect(0, 0, SG_QUER_W, SG_QUER_H);
  g = ctx.createLinearGradient(0, 0, 0, 380); g.addColorStop(0, 'rgba(4,17,39,.55)'); g.addColorStop(1, 'rgba(4,17,39,0)'); ctx.fillStyle = g; ctx.fillRect(0, 0, SG_QUER_W, 380);
  g = ctx.createLinearGradient(0, 760, 0, SG_QUER_H); g.addColorStop(0, 'rgba(4,17,39,0)'); g.addColorStop(1, 'rgba(4,17,39,.82)'); ctx.fillStyle = g; ctx.fillRect(0, 760, SG_QUER_W, SG_QUER_H - 760);
  sgT(ctx, `${D.wettbewerb || ''}${D.saison ? ' / Saison ' + D.saison : ''}`.toUpperCase(), 96, 108, { fam:'SGB', w:700, s:30, c:CI.weiss, max:900, k:'querKopf' });
  const dt = sgDatumTeile(D.datum);
  sgT(ctx, [D.nr ? D.nr + '. SAISONSPIEL' : '', dt ? dt.lang.toUpperCase() : ''].filter(Boolean).join(' / '), 96, 157, { fam:'SGB', w:600, s:28, c:CI.grau, max:900, k:'querKopf' });
  let x = 1824;
  for(const im of [A.wGeg, A.wWir].filter(Boolean)){
    const b = sgBox(im), h = (b.w * b.iw) / (b.h * b.ih) >= 1.25 ? 104 : 122, w = sgWappenBreite(im, h);
    x -= w; sgWappenMalen(ctx, im, x, 128, h); x -= 28;
  }
  if(D.wirHeim){ const w = sgTeile(ctx, [['HEIM', CI.weiss], ['SPIEL', CI.blau]], 96, 429, { fam:'Anton', w:400, cap:142 }); if(w > 888) SG.ueber.querTitel = true;
    if(SG.reg._an) SG.reg._an.push({ k:'querTitel', x:96, y:260, w, h:180 }); }
  else { sgT(ctx, 'AUSWÄRTS', 96, 354, { fam:'Anton', w:400, cap:112, c:CI.weiss, max:888, k:'querTitel' });
    sgT(ctx, 'SPIEL', 96, 494, { fam:'Anton', w:400, cap:112, c:CI.blau, max:888, k:'querTitel' }); }
  if(D.teaser) sgT(ctx, D.teaser, 96, D.wirHeim ? 513 : 558, { fam:'SGB', w:700, cap:42, c:CI.orange, max:888, min:.8, k:'querTeaser' });
  sgT(ctx, String(D.heim || '').toUpperCase(), 96, 654, { fam:'SGC', w:800, cap:40, c:CI.weiss, max:888, k:'querPaarung' });
  sgT(ctx, 'VS. ' + String(D.gast || '').toUpperCase(), 96, 719, { fam:'SGC', w:800, cap:40, c:CI.weiss, max:888, k:'querPaarung' });
  sgLinie(ctx, 96, 771, 984, CI.linie, 2); sgLinie(ctx, 96, 770, 160, CI.orange, 4);
  if(dt) sgT(ctx, dt.tag.toUpperCase() + ', ' + dt.kurz, 96, 845, { fam:'SGB', w:700, s:34, c:CI.weiss, max:888, k:'querDatum' });
  if(D.zeit) sgT(ctx, 'ANSTOSS ' + D.zeit + ' UHR', 96, 904, { fam:'SGB', w:700, s:34, c:CI.weiss, max:888, k:'querZeit' });
  sgT(ctx, D.ort ? 'Spielort: ' + D.ort : 'Spielort bitte ergänzen', 96, 1000, { fam:'SGB', w:700, s:42, c:CI.weiss, max:1728, min:.85, k:'querOrt' });
}

/* ---------- Motiv E: Ergebnis mit Originalfoto und unseren Torschützen ---------- */
function sgEMalen(ctx, D, A){ sgErgebnisMalen(ctx, D, A); }

/* ---------- Motiv S: Spielverlauf, Tor für Tor ---------- */
function sgS(ctx, D, A, seite){
  ctx.fillStyle = CI.navy; ctx.fillRect(0, 0, SG_W, SG_H);
  sgKopf(ctx, D, true); sgWappen(ctx, A);
  sgTeile(ctx, [['SPIEL', CI.weiss], ['VERLAUF', CI.blau]], SG_X, 324, { fam:'Anton', w:400, cap:110 });
  sgT(ctx, `${D.heim}  ${D.toreH}:${D.toreG}  ${D.gast}`.toUpperCase(), SG_X, 431, { fam:'SGB', w:600, s:24, c:CI.grau, sp:.6, max:936, min:.7, k:'paarung' });
  sgLinie(ctx, SG_X, 463, SG_R, '#2A3F66', 2);
  sgT(ctx, 'TOR', 860, 484, { fam:'SGB', w:600, s:15.5, c:CI.grau, sp:1.4, a:'c' }); sgT(ctx, 'VORLAGE', 967, 484, { fam:'SGB', w:600, s:15.5, c:CI.grau, sp:1.4, a:'c' });
  const T = D.tore, eng = T.length > 6, je = eng ? 8 : 6, ab = (seite || 0) * je, L = T.slice(ab, ab + je), teil = eng ? 96 : 121, k = teil / 121;
  let h = 0, gs = 0; T.slice(0, ab).forEach(t => { if(t.wir === D.wirHeim) h++; else gs++; });
  L.forEach((t, i) => { const y0 = 493 + i * teil, cy = y0 + teil / 2; if(t.wir === D.wirHeim) h++; else gs++;
    if(!t.wir){ ctx.fillStyle = CI.navy2; ctx.fillRect(SG_X, y0 + 2, SG_R - SG_X, teil - 2); }
    sgLinie(ctx, SG_X, y0 + teil, SG_R, '#1C2D4D', 2);
    ctx.fillStyle = t.wir ? CI.blau : CI.grau2; ctx.fillRect(SG_X, cy - 32 * k, 8, 64 * k);
    sgT(ctx, sgMin(t), 94, cy + 12 * k, { fam:'SGC', w:800, cap:23 * k, c:t.wir ? CI.blau : CI.grau2, max:86, min:.7 });
    sgT(ctx, `${h}:${gs}`, 193, cy + 25 * k, { fam:'Anton', w:400, cap:50 * k, c:t.wir ? CI.weiss : CI.hell, max:124, min:.7 });
    sgT(ctx, t.name ? t.name + (t.art === 'et' ? ' (Eigentor)' : t.art === 'elf' ? ' (Elfmeter)' : '') : 'Torschütze fehlt', 337, cy - 6 * k, { fam:'SGB', w:600, cap:23.5 * k, c:t.name ? (t.wir ? CI.weiss : '#E4E9F1') : CI.orange, max:450, min:.72, k:'tor' + (ab + i) });
    if(t.wir){ const v = t.vorlage && t.vorlage !== '-' ? t.vorlage : '';
      sgT(ctx, 'Vorlage: ' + (v || '–'), 337, cy + 37 * k, { fam:'SGB', w:600, cap:16.5 * k, c:v ? CI.orange : CI.grau, max:450, min:.72 });
      sgKreis(ctx, A.portrait.get(t.bild) || null, 860, cy, 34 * k, CI.blau, { text:t.nr != null ? String(t.nr) : '' });
      if(v) sgKreis(ctx, A.portrait.get(t.vbild) || null, 967, cy, 34 * k, CI.orange, { text:t.vnr != null ? String(t.vnr) : '' });
      else sgT(ctx, '–', 967, cy + 9, { fam:'SGB', w:600, s:28, c:CI.grau, a:'c' });
    } else {
      sgT(ctx, `GEGENTOR · ${D.gegner}`.toUpperCase(), 337, cy + 36 * k, { fam:'SGB', w:600, cap:14.5 * k, c:CI.grau, sp:.5, max:450, min:.72 });
      if(A.wGeg){ const hh = 70 * k; sgWappenMalen(ctx, A.wGeg, 860 - sgWappenBreite(A.wGeg, hh) / 2, cy, hh); }
    } });
  if(eng && T.length > je) sgT(ctx, `${(seite || 0) + 1} / ${Math.ceil(T.length / je)}`, SG_R, 1310, { fam:'SGB', w:600, s:20, c:CI.grau, a:'r', sp:1 }); }
const sgSeitenS = D => D.tore.length > 6 ? Math.ceil(D.tore.length / 8) : 1;

/* ---------- Motiv A: Aufstellung, heller Grund ---------- */
function sgA(ctx, D, A){
  ctx.fillStyle = CI.papier; ctx.fillRect(0, 0, SG_W, SG_H);
  sgKopf(ctx, D, false); sgWappen(ctx, A);
  sgTeile(ctx, [['AUF', CI.navy], ['STELLUNG', CI.blau]], SG_X, 324, { fam:'Anton', w:400, cap:110 });
  sgT(ctx, `${D.wir}  /  Startelf`.toUpperCase(), SG_X, 424, { fam:'SGB', w:700, s:24, c:CI.navy, sp:.8, max:936, k:'wir' });
  sgLinie(ctx, SG_X, 449, SG_R, '#C5D1E4', 2);
  const tinte = CI.navy, marke = (t, x, y, blau) => sgMarke(ctx, t, x, y, blau ? { grund:'#D8E8FB', c:'#1C5FB5', s:14.5 } : { grund:'#FFDCC4', c:'#8A4A12', s:14.5 });
  const S = D.start, links = Math.ceil(S.length / 2);
  S.forEach((p, i) => { const sp = i < links ? 0 : 1, z = sp ? i - links : i, x0 = sp ? 552 : SG_X, cy = 501 + z * 81;
    sgKreis(ctx, A.portrait.get(p.bild) || null, x0 + 31, cy, 30, CI.blau, { grund:'#DCE6F4', breite:2.5 });
    sgT(ctx, p.nr != null ? String(p.nr) : '–', x0 + 80, cy + 19, { fam:'Anton', w:400, cap:38, c:CI.blau });
    const w = sgT(ctx, p.name, x0 + 144, cy + 10, { fam:'SGB', w:700, cap:18.5, c:tinte, max:260, min:.74, k:'start' + i }); let mx = x0 + 144 + Math.min(w, 260) + 12;
    if(p.tw) mx += marke('TW', mx, cy + 2) + 6; if(p.c) marke('C', mx, cy + 2);
    sgLinie(ctx, x0, cy + 40, x0 + 457, '#DCE2EC', 1.5); });
  sgLinie(ctx, SG_X, 962, SG_R, '#C5D1E4', 2);
  sgT(ctx, 'ERSATZBANK', SG_X, 1008, { fam:'SGB', w:700, s:24, c:tinte, sp:2.6 });
  const B = D.bank, bl = Math.ceil(B.length / 2), teil = B.length > 10 ? 44 : 55;
  B.slice(0, 12).forEach((p, i) => { const sp = i < bl ? 0 : 1, z = sp ? i - bl : i, x0 = sp ? 552 : SG_X, cy = 1054 + z * teil;
    sgKreis(ctx, A.portrait.get(p.bild) || null, x0 + 20, cy, 19, CI.blau, { grund:'#DCE6F4', breite:2 });
    sgT(ctx, p.nr != null ? String(p.nr) : '–', x0 + 56, cy + 10, { fam:'Anton', w:400, cap:19.5, c:CI.blau });
    const w = sgT(ctx, p.name, x0 + 106, cy + 8, { fam:'SGB', w:600, cap:16.5, c:tinte, max:230, min:.74, k:'bank' + i }); let mx = x0 + 106 + Math.min(w, 230) + 10;
    if(p.ein) mx += marke('↑ ' + p.ein + '’', mx, cy + 1, true) + 6; if(p.tw) marke('TW', mx, cy + 1); });
  if(D.trainer){ const t = D.trainer.toUpperCase(); ctx.font = '700 22px SGB'; const w = sgBreite(ctx, t, .8); sgT(ctx, t, SG_R - 18, 1291, { fam:'SGB', w:700, s:22, c:tinte, sp:.8, a:'r', k:'trainer' });
    ctx.font = '700 14.5px SGB'; const mw = sgBreite(ctx, 'TRAINER', .6) + 16; marke('TRAINER', SG_R - 18 - w - 10 - mw, 1283); } }

function sgMalen(cv, motiv, D, A, seite, fmt){ const quer = fmt === 'quer' && motiv === 'H', story = fmt === 'story', oy = story ? SG_OY : 0; cv.width = quer ? SG_QUER_W : SG_W; cv.height = quer ? SG_QUER_H : story ? SG_STORY_H : SG_H;
  const ctx = cv.getContext('2d'); SG.ueber = {}; SG.reg._an = []; SG.reg[motiv] = SG.reg._an; SG.oy = oy; ctx.setTransform(1, 0, 0, 1, 0, 0);
  if(story){ ctx.fillStyle = motiv === 'A' ? CI.papier : CI.navy; ctx.fillRect(0, 0, SG_W, SG_STORY_H); ctx.translate(0, oy); }
  try{ if(quer) sgQuer(ctx, D, A); else if(motiv === 'H') sgH(ctx, D, A); else if(motiv === 'E') sgEMalen(ctx, D, A); else if(motiv === 'S') sgS(ctx, D, A, seite); else sgA(ctx, D, A); }
  catch(e){ console.warn('Spieltag zeichnen', motiv, e); }
  ctx.setTransform(1, 0, 0, 1, 0, 0); SG.reg._an.forEach(g => { g.y += oy; }); SG.reg._an = null; SG.oy = 0; return Object.assign({}, SG.ueber); }

/* ---------- Daten: Quelle, Kader, von Hand Geändertes ---------- */
function sgKaderListe(sub){ try{ return ((TKR.kader || {})[sub === 'D2' ? 'D2' : 'A'] || []).filter(p => p.aktiv !== false); }catch(e){ return []; } }
function sgKaderId(sub, id){ if(!/^[A-Za-z0-9_-]{1,100}$/.test(String(id||'')))return null; const L = sgKaderListe(sub).filter(p => String(p.id) === String(id)); return L.length === 1 ? L[0] : null; }
function sgPerson(sub){ return p => {
  const id = p && (p.fupa || (SG.satz?.personen || {})[p.key]), k = id && sgKaderId(sub, id);
  return k ? { fupa:String(k.id), nr:k.nr === '' || k.nr == null ? null : +k.nr, bild:k.bild || '', tw:k.pos === 'TW' }
           : { fupa:'', nr:null, bild:'', tw:false }; }; }
function sgQuelle(S){ const nm = k => sgName((S.namen || {})[k] || ''), wirS = S.wir_heim ? 'h' : 'g', V = S.verlauf || [];
  const tore = V.filter(e => e.t === 'tor').map(e => ({ key:e.p || '', m:+e.m || 0, x:+e.x || 0, wir:e.s === wirS, art:['elf','et'].includes(e.art) ? e.art : '', name:nm(e.p), vorlage:'' }));
  const ein = new Map(); V.filter(e => e.t === 'wechsel' && e.s === wirS).forEach(e => { if(e.p) ein.set(e.p, e.m + (e.x ? '+' + e.x : '')); });
  const A = S.aufstellung || {}, start = (A.start || []).map(k => Object.assign({ key:k, name:nm(k), c:k === A.c }, A.tw ? { tw:k === A.tw } : {}));
  const bank = (A.bank || []).map(k => ({ key:k, name:nm(k), ein:ein.get(k) || '' }));
  return { tore, start, bank }; }
/* Nur historische Prüfsummen vergleichen, niemals über Namen Personen zuordnen. */
function sgQuelleAlt(S,Q){ const ein=new Map();
  (S.verlauf||[]).filter(e=>e.t==='wechsel'&&e.s===(S.wir_heim?'h':'g')).forEach(e=>{const n=sgName((S.namen||{})[e.p]||'');if(n)ein.set(n,e.m+(e.x?'+'+e.x:''));});
  const ohne=({key,...p})=>p;
  return {tore:Q.tore.map(ohne),start:Q.start.map(ohne).filter(p=>p.name),bank:Q.bank.map(p=>({name:p.name,ein:ein.get(p.name)||''})).filter(p=>p.name)};
}
function sgQuelleNeu(alt,quelle,version,vorher){return !!alt&&alt!==sgHash(JSON.stringify(quelle))&&(version===3||alt!==sgHash(JSON.stringify(vorher)));}
function sgVorschlaege(D){ const punkte = ['A','D2'].includes(D.sub) && !/pokal|freundschaft|testspiel/i.test(D.wettbewerb || ''), g = D.gegner.toUpperCase(), a = D.wirHeim ? D.toreH : D.toreG, b = D.wirHeim ? D.toreG : D.toreH, heim = D.wirHeim, L = [];
  if(a > b){ L.push([heim ? 'Heim' : 'Auswärts', 'Sieg.']); L.push([heim ? 'Heimsieg gegen' : 'Auswärtssieg bei', g + '.']); if(punkte) L.push(['Drei Punkte', heim ? 'zuhause.' : 'mitgenommen.']); if(a - b >= 3) L.push([`${a}:${b}.`, 'Klare Sache.']); else L.push([`${a}:${b} gegen`, g + '.']); }
  else if(a === b){ L.push(['Unentschieden.', '']); L.push([`${a}:${b} gegen`, g + '.']); if(punkte){ L.push(['Punkteteilung', heim ? 'zuhause.' : 'auswärts.']); L.push(a ? [`${a + b} Tore,`, 'ein Punkt.'] : ['Keine Tore,', 'ein Punkt.']); } }
  else { L.push(['Niederlage.', '']); L.push(['Niederlage gegen', g + '.']); L.push([`${a}:${b} gegen`, g + '.']); }
  return L; }
const sgZahlMitQuelle = (v, q) => v === '' || v == null || isNaN(+v) ? q : +v;
function sgDaten(){ const S = SG.satz, N = SG.neu, f = N.f || {}, Q = sgQuelle(S), person = sgPerson(S.sub), alt = sgQuelleAlt(S,Q);
  const ohne = n => String(n || '').replace(/\s*\((FB|H|FB, ?H)[^)]*\)\s*$/i, '').trim();
  const wir = f.wir || ohne(S.wir_heim ? S.heim : S.gast), gegner = f.gegner || ohne(S.wir_heim ? S.gast : S.heim);
  /* Von Hand geführte Listen stehen in derselben Reihenfolge wie die Anzeige, damit Zeile i im Formular Eintrag i ist */
  const nummer=p=>Object.prototype.hasOwnProperty.call(p,'nr')&&p.nrHand!==false?(p.nr==null||p.nr===''?null:+p.nr):person(p).nr;
  const nachNr=(a,b)=>(nummer(a)??999)-(nummer(b)??999);
  if(Array.isArray(N.tore))N.tore.sort((a,b)=>(+a.m||0)-(+b.m||0)||(+a.x||0)-(+b.x||0));
  if(Array.isArray(N.start)){if(!Array.isArray(N.bank))N.bank=[];[N.start,N.bank].forEach(L=>L.sort(nachNr));}
  const toreH = sgZahlMitQuelle(f.toreH, S.tore_h), toreG = sgZahlMitQuelle(f.toreG, S.tore_g), gespielt = toreH != null && toreG != null;
  const D = { spiel:S.spiel,sub:S.sub, wettbewerb:f.wettbewerb || SG_LIGA[S.sub] || 'Spiel', saison:sgSaison(S.saison), nr:f.nr === 0 ? null : sgZahlMitQuelle(f.nr, S.nr), datum:S.datum, zeit:f.zeit || S.zeit || '',
    ort:f.ort != null ? String(f.ort) : String(S.ort || ''),
    querY:sgQuerNorm(f.querY, .5, 0, 1), querZoom:sgQuerNorm(f.querZoom, 1, 1, 2),bildausschnitt:f.bildausschnitt||{},
    kontext:sgKontextPassend(SG.kontext, S), rueckblick:f.rueckblick !== false, geschichte:typeof f.geschichte === 'string' ? f.geschichte.trim().slice(0,600) : '',
    wirHeim:!!S.wir_heim, wir, gegner, heim:S.wir_heim ? wir : gegner, gast:S.wir_heim ? gegner : wir, toreH, toreG, gespielt,
