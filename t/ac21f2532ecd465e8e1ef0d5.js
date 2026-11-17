// Bis wann gekündigt sein muss: einen Monat vor Ablauf
function bpKuendigung(bis){ const m = /^(\d{4})-(\d{2})-(\d{2})/.exec(String(bis || '')); if(!m) return ''; const d = new Date(+m[1], +m[2] - 2, +m[3]); if(d.getDate() !== +m[3]) d.setDate(0);
  return `${String(d.getDate()).padStart(2, '0')}.${String(d.getMonth() + 1).padStart(2, '0')}.${d.getFullYear()}`; }
// Stand eines Platzes in der Saison, die im Jahr y beginnt: { k, t }
function bpStand(p, y){
  if(p.status === 'frei') return p.nachfolger ? { k:'vor', t:'Vorgemerkt', lang:'Vorgemerkt: ' + p.nachfolger } : { k:'frei', t:'Frei' };
  if(p.status === 'reserviert') return { k:'res', t:'Reserviert' };
  if(!p.laufzeit_bis) return { k:'offen', t:'Fehlt', lang:'Laufzeit fehlt' };
  if(String(p.laufzeit_bis) >= (y + 1) + '-01-01') return p.laufzeit_geprueft ? { k:'fest', t:'Fest' } : { k:'fest', ang:true, t:'Angenommen', lang:'Fest, Laufzeit angenommen' };
  if(p.weiter === 'nein') return p.nachfolger ? { k:'vor', t:'Vorgemerkt', lang:'Vorgemerkt: ' + p.nachfolger } : { k:'aus', t:'Läuft aus' };
  if(p.auto_verl === true) return { k:'verl', t:'Verlängert', lang:'Verlängert sich von selbst' };
  if(p.weiter === 'ja') return { k:'verl', t:'Will weiter', lang:'Will verlängern' };
  return { k:'offen', t:'Offen' };
}
function bpVorschauHtml(){ if(!bpSicht()) return ''; const P = ((BC.d && BC.d.plaetze) || []).slice().sort((a, b) => (a.nummer || 999) - (b.nummer || 999)), S = bpSaisons();
  const kopf = S.map(y => { const st = P.map(p => ({ p, s:bpStand(p, y) })), n = k => st.filter(x => x.s.k === k).length, sum = k => st.filter(x => x.s.k === k).reduce((t, x) => t + (+x.p.betrag || 0), 0), fest = sum('fest'), verl = sum('verl');
    return `<div class="bp-vs"><b>${bpSaisonT(y)}</b><span>${n('fest')} fest · ${n('verl')} verlängert · ${n('offen')} offen</span><span>${n('aus')} läuft aus · ${n('vor')} vorgemerkt · ${n('frei') + n('res')} frei</span><strong>${bpEuro(fest)}${verl ? ' + ' + bpEuro(verl) : ''}</strong><small>${verl ? 'fest + erwartet, netto' : 'fest, netto'}</small></div>`; }).join('');
  const zeilen = P.filter(p => p.status !== 'frei' || p.nachfolger).map(p => `<button type="button" class="bp-vz" data-bpv="${p.id}"><b>${bpNr(p)}</b><span>${bpE(p.status === 'frei' ? 'Frei' : bpFirma(p.firma))}</span>${S.map(y => { const s = bpStand(p, y); return `<i class="${s.k}${s.ang ? ' ang' : ''}" title="${bpE(bpSaisonT(y) + ': ' + (s.lang || s.t))}">${bpE(s.t)}</i>`; }).join('')}</button>`).join('');
  const frei = P.filter(p => p.status === 'frei' && !p.nachfolger).length;
  return `<section class="pz-tc-block bp-vor" id="bpVor" aria-label="Vorschau: wer hängt wann"><div class="pz-tc-bk"><h3>Wer hängt wann</h3><span class="pz-tc-zahl">${S.map(bpSaisonT).join(' · ')}</span></div>
    <div class="bp-vsl">${kopf}</div>
    <div class="bp-vkopf" aria-hidden="true"><span></span><span>Bande</span>${S.map(y => `<span>${bpSaisonT(y)}</span>`).join('')}</div>
    <div class="bp-vl">${zeilen || '<p class="pz-tc-tipp">Noch keine Bande vergeben.</p>'}</div>
    <p class="pz-tc-tipp">${frei ? `Dazu ${frei === 1 ? 'ein freier Platz' : frei + ' freie Plätze'} ohne Vormerkung. ` : ''}Eine Saison zählt als belegt, wenn die Laufzeit über den 1. Januar der Saison reicht. „Angenommen“ heißt: Laufzeit nach dem Werbevertrag gesetzt, noch nicht mit dem Vertrag verglichen. „Fehlt“ heißt: keine Laufzeit eingetragen. Tipp auf eine Zeile für die Einzelheiten. Das sehen nur Admin, Vorstand und die Leitung im Bereich Partner.</p></section>`; }
// Einzelansicht: Laufzeit, was danach kommt, Betrag, Notizen
function bpLaufzeitZeile(p){ if(!bpSicht() || !p) return ''; const frei = p.status === 'frei', T = [];
  if(!frei){
    if(p.laufzeit_bis) T.push(`Läuft bis ${bpDatum(p.laufzeit_bis)}${p.vertrag_seit ? ', Partner seit ' + bpDatum(p.vertrag_seit) : ''}${p.laufzeit_geprueft ? '' : ' (angenommen, noch nicht mit dem Vertrag verglichen)'}.`); else T.push('Laufzeit noch nicht eingetragen.');
    if(p.auto_verl === true) T.push(`Verlängert sich von selbst um ein Jahr${p.laufzeit_bis ? ', kündbar bis ' + bpKuendigung(p.laufzeit_bis) : ''}.`); else if(p.auto_verl === false) T.push('Verlängert sich nicht von selbst.');
    if(p.weiter === 'nein') T.push('Der Partner will danach nicht weitermachen.'); else if(p.weiter === 'ja') T.push('Der Partner will danach weitermachen.');
    if(p.betrag != null) T.push(`Beitrag ${bpEuro(p.betrag)} netto im Jahr.`);
  }
  if(p.nachfolger) T.push(`Für danach vorgemerkt: ${p.nachfolger}.`);
  const N = p.notizen || [];
  return `<div class="bp-lz" id="bpLz"><div class="bp-lzk"><b>${frei ? 'Vormerkung' : 'Laufzeit'}</b><button type="button" class="pz-tc-k leise" data-bplz="${p.id}">${frei ? 'Vormerken' : 'Ändern'}</button></div>
    ${T.length ? `<ul>${T.map(t => `<li>${bpE(t)}</li>`).join('')}</ul>` : '<p class="pz-tc-tipp">Niemand vorgemerkt.</p>'}
    <div class="bp-lzk"><b>Notizen</b><button type="button" class="pz-tc-k leise" data-bpnotiz="${p.id}">Notiz schreiben</button></div>
    ${N.length ? `<ol class="bp-nl">${N.map(n => `<li><span>${bpE(n.text)}</span><small>${bpE(bpDatum(n.am))} · ${bpE(n.von)}${n.mein || (BC.d && BC.d.admin) ? ` <button type="button" class="bp-nw" data-bpnweg="${n.id}" aria-label="Notiz löschen">Löschen</button>` : ''}</small></li>`).join('')}</ol>` : '<p class="pz-tc-tipp">Noch keine Notiz. Schreib auf, was besprochen wurde, zum Beispiel wenn ein Partner aufhören will.</p>'}</div>`; }
function bpLaufzeitDialog(id){ const p = bcPlatz(id); if(!p) return; const frei = p.status === 'frei', F = ((BC.d && BC.d.firmen) || []);
  const wahl = (name, L, akt) => `<div class="bp-bwahl drei" role="radiogroup">${L.map(([k, t]) => `<label><input type="radio" name="${name}" value="${k}"${k === akt ? ' checked' : ''}><span>${t}</span></label>`).join('')}</div>`;
  const M = svModal(`<div class="mhead"><div><h2 style="margin:0">${frei ? 'Vormerken' : 'Laufzeit'}</h2><div class="msub">${bpE('Bande ' + bpNr(p) + (p.firma ? ' · ' + bpFirma(p.firma) : ''))}</div></div></div>
    ${frei ? '' : `<div class="bp-lzf"><label class="pz-tc-dlgf"><span>Partner seit</span><input type="date" id="bpLzSeit" value="${bpE(p.vertrag_seit || '')}"></label><label class="pz-tc-dlgf"><span>Bezahlt und gebucht bis</span><input type="date" id="bpLzBis" value="${bpE(p.laufzeit_bis || '')}"></label></div>
    <p class="bp-lzt">Verlängert sich der Vertrag von selbst?</p>${wahl('bpLzAv', [['true', 'Ja'], ['false', 'Nein'], ['', 'Weiß nicht']], p.auto_verl === true ? 'true' : p.auto_verl === false ? 'false' : '')}
    <p class="bp-lzt">Will der Partner danach weitermachen?</p>${wahl('bpLzWe', [['ja', 'Ja'], ['nein', 'Nein'], ['', 'Offen']], p.weiter === 'ja' || p.weiter === 'nein' ? p.weiter : '')}
    <div class="bp-lzf"><label class="pz-tc-dlgf"><span>Beitrag netto im Jahr (€)</span><input type="text" inputmode="decimal" id="bpLzBe" maxlength="10" value="${p.betrag != null ? bpE(String(p.betrag).replace('.', ',')) : ''}"></label>
      <label class="pz-tc-dlgf"><span>Firma in der Partnerliste</span><select id="bpLzSp"><option value="">nicht verbunden</option>${F.map(f => `<option value="${f.id}"${f.id === p.sponsor ? ' selected' : ''}>${bpE(f.firma)}</option>`).join('')}</select></label></div>
    <label class="bp-lzc"><input type="checkbox" id="bpLzGp"${p.laufzeit_geprueft ? ' checked' : ''}><span>Mit dem Vertrag verglichen, die Laufzeit stimmt</span></label>`}
    <label class="pz-tc-dlgf"><span>${frei ? 'Wer möchte diesen Platz?' : 'Wer möchte den Platz danach?'}</span><input type="text" id="bpLzNf" maxlength="120" value="${bpE(p.nachfolger || '')}" autocomplete="organization"></label>
    <div class="pz-tc-dlgk"><button type="button" class="btn" id="bpLzOk">Speichern</button><button type="button" class="btn ghost" id="bpLzNein">Abbrechen</button></div>`);
  M.querySelector('#bpLzNein').onclick = () => closeOverlay();
  M.querySelector('#bpLzOk').onclick = () => paEinmal(M.querySelector('#bpLzOk'), async () => { const v = s => { const e = M.querySelector(s); return e ? e.value : ''; }, r = n => { const e = M.querySelector(`input[name="${n}"]:checked`); return e ? e.value : ''; };
    const a = { platz:p.id, nachfolger:v('#bpLzNf') }; if(!frei) Object.assign(a, { vertrag_seit:v('#bpLzSeit'), laufzeit_bis:v('#bpLzBis'), auto_verl:r('bpLzAv'), weiter:r('bpLzWe'), betrag:v('#bpLzBe').trim(), sponsor:v('#bpLzSp'), geprueft:!!(M.querySelector('#bpLzGp') || {}).checked });
    try{ await bcRpc('bandenplatz_laufzeit', { p:a }); closeOverlay(); await bcLaden(true); bcAnsichtZeigen(); kToast(frei ? 'Vormerkung für Bande ' + bpNr(p) + ' ist gespeichert.' : 'Laufzeit für Bande ' + bpNr(p) + ' ist gespeichert.'); }catch(e){ kToast(e.message); } }, 'Speichert …'); }
function bpNotizDialog(id){ const p = bcPlatz(id); if(!p) return;
  const M = svModal(`<div class="mhead"><div><h2 style="margin:0">Notiz</h2><div class="msub">${bpE('Bande ' + bpNr(p) + (p.firma ? ' · ' + bpFirma(p.firma) : ''))}</div></div></div>
    <label class="pz-tc-dlgf"><span>Was wurde besprochen?</span><textarea id="bpNoText" maxlength="500" rows="4"></textarea></label>
    <p class="note">Die Notiz bleibt mit Datum und deinem Namen beim Platz stehen. Sachlich bleiben: was gesagt wurde und was daraus folgt.</p>
    <div class="pz-tc-dlgk"><button type="button" class="btn" id="bpNoOk">Speichern</button><button type="button" class="btn ghost" id="bpNoNein">Abbrechen</button></div>`);
  const t = M.querySelector('#bpNoText'); setTimeout(() => { try{ t.focus(); }catch(e){} }, 60);
  M.querySelector('#bpNoNein').onclick = () => closeOverlay();
  M.querySelector('#bpNoOk').onclick = () => paEinmal(M.querySelector('#bpNoOk'), async () => { if(!t.value.trim()){ kToast('Bitte etwas schreiben.'); t.focus(); return; }
    try{ await bcRpc('banden_notiz', { p:{ platz:p.id, text:t.value } }); closeOverlay(); await bcLaden(true); bcAnsichtZeigen(); kToast('Notiz ist gespeichert.'); }catch(e){ kToast(e.message); } }, 'Speichert …'); }
function bpNotizWegDialog(id){
  const M = svModal(`<div class="mhead"><div><h2 style="margin:0">Notiz löschen?</h2></div></div><p class="note">Die Notiz ist danach weg und lässt sich nicht zurückholen.</p>
    <div class="pz-tc-dlgk"><button type="button" class="btn" id="bpNwOk">Löschen</button><button type="button" class="btn ghost" id="bpNwNein">Abbrechen</button></div>`);
  M.querySelector('#bpNwNein').onclick = () => closeOverlay();
  M.querySelector('#bpNwOk').onclick = () => paEinmal(M.querySelector('#bpNwOk'), async () => { try{ await bcRpc('banden_notiz_weg', { p_id:id }); closeOverlay(); await bcLaden(true); bcAnsichtZeigen(); kToast('Notiz ist gelöscht.'); }catch(e){ kToast(e.message); } }, 'Löscht …'); }
function bpLaufzeitBinden(I){
  I.querySelectorAll('[data-bplz]').forEach(b => b.onclick = () => bpLaufzeitDialog(b.dataset.bplz));
  I.querySelectorAll('[data-bpnotiz]').forEach(b => b.onclick = () => bpNotizDialog(b.dataset.bpnotiz));
  I.querySelectorAll('[data-bpnweg]').forEach(b => b.onclick = () => bpNotizWegDialog(b.dataset.bpnweg));
  // Tipp in der Vorschau wählt die Bande und springt zur Einzelansicht
  I.querySelectorAll('[data-bpv]').forEach(b => b.onclick = () => { BP.sel = null; bpWaehlen(b.dataset.bpv, I); const d = I.querySelector('#bpDetail'); if(d){ try{ d.scrollIntoView({ block:'center', behavior:'smooth' }); }catch(e){} } });
}

/* =====================================================================
   Beta 0.99.28 · Training über die App statt über WhatsApp (159_training_app.sql, kabine-bot)
   Albert, 14.11.2026: „Training, Spielersitzung, Spiel: das müssen alles Termine sein, die auch die Spieler kriegen. Kommst du ins Training,
   ja oder nein, muss vorher automatisch rausgehen. Ich will gar nicht, dass der Trainer dieses WhatsApp in die Gruppe schickt. Nimm die
   WhatsApp-Funktion für Trainer und Verantwortliche raus, das machen wir über die Mitteilungen.“
   1. Termine: Trainings stehen im Kalender (Sorte 'training'): das Trainerteam sieht alle mit dem Stand, Spieler ihre eigenen mit ihrer
      Antwort und sagen dort zu oder ab. Termine der eigenen Mannschaft sehen Spieler über event_sieht (Server).
   2. Automatik: Uhrzeit je Trainingstag. Ist WhatsApp aus (KB.bot.whatsapp === false), verschwinden die WhatsApp-Einstellungen und das
      Pop-up „In die WhatsApp-Gruppe teilen“. Dafür steht da, wen die App erreicht und wen noch nicht (kabine_app_stand).
   3. Den Schalter für WhatsApp stellt nur der Admin um.
   ===================================================================== */
const S102 = { stand:{}, laedt:{} };
const s102E = s => (typeof svEsc === 'function' ? svEsc(s == null ? '' : String(s)) : String(s == null ? '' : s));
function s102Aus(){ return !!(typeof KB !== 'undefined' && KB.bot && KB.bot.whatsapp === false); }
function s102Team(){ try{ return s84Team(); }catch(e){ return '1'; } }

/* ---------- 1. Termine: Trainings im Kalender ---------- */
if(typeof KAL_EART !== 'undefined') KAL_EART.training = ['⚽', 'Training'];
// Für Liste, Einzelansicht und Kalenderdatei sieht ein Training aus wie ein Termin der Mannschaft
// Vergangene Trainings: „noch offen“ stimmt dann nicht mehr
const s102Info = i => i.d < kalHeute() && /noch offen/.test(i.info || '') ? 'Du hattest nicht geantwortet.' : (i.info || '').replace(/^Du hast /, i.d < kalHeute() ? 'Du hattest ' : 'Du hast ');
const s102Ev = (i, liste) => i && i.k === 'training' ? Object.assign({}, i, { k:'event', _tr:true, info:'' }, liste ? { ort:[i.ort, s102Info(i)].filter(Boolean).join(' · ') } : {}) : i;
if(typeof kalItemHtml === 'function'){ const _a = kalItemHtml; kalItemHtml = function(i){ return _a.call(this, s102Ev(i, true)); }; }
if(typeof kalShareText === 'function'){ const _a = kalShareText; kalShareText = function(i){
  if(i && (i.k === 'training' || i._tr)){ const r = kalRel(i.d), wann = (r && !/^in /.test(r) ? r : kalWt(i.d) + '., ' + kalDM(i.d)) + (i.z ? ' um ' + i.z + ' Uhr' : ''); return `⚽ ${i.t || 'Training'}\n🗓️ ${wann}${i.ort ? '\n📍 ' + i.ort : ''}`; }
  return _a.apply(this, arguments); }; }
if(typeof kalIcsText === 'function'){ const _a = kalIcsText; kalIcsText = function(L){ return _a.call(this, (L || []).map(i => i && i.k === 'training' ? Object.assign({}, i, { k:'event', info:'' }) : i)); }; }
if(typeof kalDetail === 'function'){ const _a = kalDetail; kalDetail = function(id){
  const i = kalItem(id); if(!i || i.k !== 'training') return _a.apply(this, arguments);
  const alt = kalItem; kalItem = function(){ const r = alt.apply(this, arguments); return s102Ev(r, false); };
  let r; try{ r = _a.apply(this, arguments); } finally { kalItem = alt; }
  try{ s102Antwort(i); }catch(e){ console.warn('Training im Kalender', e); }
  return r; }; }
// Einzelansicht eines Trainings: Spieler sagen hier zu oder ab, das Trainerteam springt zur Abstimmung
async function s102Antwort(i){
  const M = document.getElementById('modal'); if(!M || !i.poll) return; const akt = M.querySelector('.kal-akt');
  const box = document.createElement('div'); box.className = 's102-antw'; box.id = 's102Antw'; if(akt) akt.before(box); else M.appendChild(box);
  const vorbei = i.d < kalHeute() || !!i.zu;
  // Trainings werden nicht per WhatsApp geteilt: die Frage kommt über die App
  if(akt){ akt.querySelectorAll('a[href*="wa.me"]').forEach(x => x.remove()); if(!(typeof canTraining === 'function' && canTraining())){ const sh = akt.querySelector('#kalShare'); if(sh) sh.remove(); } }
  if(typeof canTraining === 'function' && canTraining()){
    box.innerHTML = `<p class="s102-st">${s102E(i.info || '')}</p><button type="button" class="btn ghost" id="s102Zur">Zur Abstimmung</button>`;
    box.querySelector('#s102Zur').onclick = () => { closeOverlay(); try{ if(typeof mnCtxSet === 'function') mnCtxSet(i.m === 'h2' ? '2' : '1'); }catch(e){} goTab('kabine'); };
    return; }
  box.innerHTML = '<p class="note">Lade deine Antwort …</p>';
  let f = null; try{ const r = await SVB.sb.from('push_fragen').select('id,antwort').eq('art', 'poll').contains('ziel', { poll:i.poll }).order('created_at', { ascending:false }).limit(1); f = (r.data || [])[0] || null; }catch(e){}
  if(!box.isConnected) return;
  const mal = () => { const a = f && f.antwort;
    box.innerHTML = `<p class="s102-st ${a === 'ja' ? 'ja' : a === 'nein' ? 'nein' : 'offen'}">${a === 'ja' ? 'Du hast zugesagt.' : a === 'nein' ? 'Du hast abgesagt.' : 'Deine Antwort ist noch offen.'}</p>`
      + (vorbei ? '<p class="note">Das Training ist vorbei oder die Abstimmung ist geschlossen.</p>' : !f ? '<p class="note">Für dieses Training gibt es noch keine Frage an dich. Melde dich bitte beim Trainerteam.</p>'
        : `<div class="s102-kn"><button type="button" class="btn${a === 'ja' ? '' : ' ghost'}" data-s102a="ja" aria-pressed="${a === 'ja'}">Ich bin dabei</button><button type="button" class="btn${a === 'nein' ? '' : ' ghost'}" data-s102a="nein" aria-pressed="${a === 'nein'}">Ich kann nicht</button></div><p class="note small">Ändern kannst du bis zum Training.</p>`);
    box.querySelectorAll('[data-s102a]').forEach(b => b.onclick = () => paEinmal(b, async () => {
      // Seit 0.99.66: Absage zu Training und Spiel nur mit Grund (svm117.js)
      if(b.dataset.s102a === 'nein' && typeof s117AbsageWenn === 'function'){ try{ if(await s117AbsageWenn(f.id, w => { f.antwort = w; i.info = w === 'ja' ? 'Du hast zugesagt.' : 'Du hast abgesagt.'; })) return; }catch(e){} }
      try{ const r = await SVB.sb.rpc('frage_antwort', { p_id:f.id, p_wert:b.dataset.s102a, p_via:'app' }); if(r.error) throw r.error; f.antwort = b.dataset.s102a;
        i.info = f.antwort === 'ja' ? 'Du hast zugesagt.' : 'Du hast abgesagt.'; mal(); kToast(f.antwort === 'ja' ? 'Zusage ist gespeichert.' : 'Absage ist gespeichert.');
        try{ if(svCurTab() === 'kalender') kalRender(); }catch(e){} try{ if(typeof frLaden === 'function') frLaden(true).then(() => { try{ frKarte(); }catch(e){} }); }catch(e){} }
      catch(e){ kToast(typeof svFehlerText === 'function' ? svFehlerText(e) : e.message); } }, 'Speichert …')); };
  mal();
}

/* ---------- 2. Automatik fürs Training: Uhrzeit je Tag, App statt WhatsApp ---------- */
const S102_WT = { 0:'Sonntag', 1:'Montag', 2:'Dienstag', 3:'Mittwoch', 4:'Donnerstag', 5:'Freitag', 6:'Samstag' };
function s102Hook(){ const sb = typeof SVB !== 'undefined' && SVB.sb; if(!sb || sb._s102) return; sb._s102 = 1; const rpc = sb.rpc.bind(sb);
  // beim Speichern der Automatik die Uhrzeiten je Tag mitschicken (nur beim vollen Speichern, erkennbar an den Trainingstagen)
  sb.rpc = function(fn, args, opt){
    if(fn === 'kabine_bot_set' && args && args.p && Array.isArray(args.p.tage) && !('zeiten' in args.p)){ const z = s102ZeitenLesen(); if(z) args = Object.assign({}, args, { p:Object.assign({}, args.p, { zeiten:z }) }); }
    return rpc(fn, args, opt); }; }
function s102ZeitenLesen(){ const box = document.getElementById('s102Zeiten'); if(!box) return null; const z = {};
  box.querySelectorAll('input[data-s102z]').forEach(i => { const v = i.value.trim().replace('.', ':'); if(v) z[i.dataset.s102z] = /^\d{1,2}$/.test(v) ? v + ':00' : v; }); return z; }
function s102ZeitenMalen(B){ const box = B.querySelector('#s102Zeiten'); if(!box) return; const c = KB.bot || {}, alt = box.dataset.da ? (s102ZeitenLesen() || {}) : (c.zeiten || {}); box.dataset.da = '1';
  const tage = [...B.querySelectorAll('[data-wd].on')].map(b => +b.dataset.wd), std = (B.querySelector('#kbA_z') || {}).value || c.zeit || '19:00';
  box.innerHTML = tage.length < 1 ? '' : `<label>Andere Uhrzeit an einzelnen Tagen <small>leer lassen, wenn ${s102E(std)} Uhr gilt</small></label><div class="s102-zl">${tage.map(n => `<span><b>${S102_WT[n]}</b><input data-s102z="${n}" value="${s102E(alt[n] || '')}" placeholder="${s102E(std)}" maxlength="5" inputmode="numeric" aria-label="Uhrzeit am ${S102_WT[n]}"></span>`).join('')}</div>`; }
async function s102StandLaden(){ const t = s102Team(); if(S102.laedt[t]) return S102.laedt[t];
  S102.laedt[t] = (async () => { try{ const r = await SVB.sb.rpc('kabine_app_stand', { p_team:t }); if(!r.error && r.data) S102.stand[t] = r.data; }catch(e){} })().finally(() => { S102.laedt[t] = null; });
  return S102.laedt[t]; }
function s102StandHtml(){ const S = S102.stand[s102Team()]; if(!S) return '<p class="note">Lade, wen die App erreicht …</p>';
  const mit = (S.mit || []).length, om = S.ohne_mitteilung || [], ok = S.ohne_konto || [], liste = L => L.map(s102E).join(', ');
  if(!S.gesamt) return '<p class="note">Sobald die erste Trainingsabstimmung angelegt ist, steht hier, wen die App erreicht.</p>';
  return `<p class="s102-zahl"><b>${mit} von ${S.gesamt}</b> Spielern bekommen die Frage als Mitteilung aufs Handy.</p>`
    + (om.length ? `<p class="s102-li"><b>Konto, aber Mitteilungen aus (${om.length}):</b> ${liste(om)}</p>` : '')
    + (ok.length ? `<p class="s102-li"><b>Noch ohne Konto (${ok.length}):</b> ${liste(ok)}</p>` : '')
    + (om.length + ok.length ? '<p class="note">Wer hier steht, wird nicht erreicht. Den persönlichen Link zur App gibt es unter Nutzer &amp; Rollen, App-Test.</p>' : '<p class="note">Alle auf der Liste werden erreicht.</p>'); }
if(typeof kbBotWire === 'function'){ const _bw = kbBotWire; kbBotWire = function(B){ const r = _bw.apply(this, arguments);
  try{ s102Hook(); const karte = B.querySelector('.kbbot'), c = KB.bot; if(!karte || !c) return r;
    // Uhrzeit je Tag
    const zf = B.querySelector('#kbA_z'), feld = zf && zf.closest('.field');
    if(feld && !B.querySelector('#s102Zeiten')){ const d = document.createElement('div'); d.className = 'field kbwide s102-zeiten'; d.id = 's102Zeiten'; const ort = B.querySelector('#kbA_o'), of = ort && ort.closest('.field'); (of || feld).after(d);
      s102ZeitenMalen(B); B.querySelectorAll('[data-wd]').forEach(b => b.addEventListener('click', () => setTimeout(() => s102ZeitenMalen(B), 0))); zf.addEventListener('change', () => s102ZeitenMalen(B)); }
    if(s102Aus()){
      karte.classList.add('s102-app');
      karte.querySelectorAll('.sbsec').forEach(x => x.classList.add('s102-weg'));
      const tb = B.querySelector('#kbA_test'); if(tb) tb.remove();
      // Der Kabinen-Link bleibt für alle ohne die App, aber ohne den Knopf „In WhatsApp teilen“
      const kl = B.querySelector('.kblink'); if(kl){ const h = kl.querySelector('h3'), tx = kl.querySelector('p'), wa = kl.querySelector('#klWa'), cp = kl.querySelector('#klCp');
        if(h) h.innerHTML = `${SVI('link')} Link für Spieler ohne die App`; if(tx) tx.textContent = 'Wer die App noch nicht hat, stimmt über diesen Link ab und sieht die Mannschaftskasse. Einmal den Namen antippen, danach reicht ein Klick. Kein Login.';
        if(wa) wa.classList.add('s102-weg'); if(cp) cp.classList.remove('ghost'); }
      const note = karte.querySelector('.vrat-h + p.note'); if(note) note.textContent = 'Die App legt die Abstimmung für jedes Training selbst an. Spieler mit der App bekommen die Frage als Mitteilung und antworten mit einem Tipp. Am Trainingstag erinnert die App alle, die noch nicht geantwortet haben, und das Trainerteam bekommt den Stand. Per WhatsApp geht nichts mehr raus.';
      const v = B.querySelector('#kbA_v'), vl = v && v.closest('.field') && v.closest('.field').querySelector('label'); if(vl) vl.textContent = 'Frage an die Spieler';
      const e = B.querySelector('#kbA_e'), el = e && e.closest('.field') && e.closest('.field').querySelector('label'); if(el) el.textContent = 'Am Trainingstag erinnern und Stand ans Trainerteam';
      const box = document.createElement('div'); box.className = 'sbsec s102-stand'; box.innerHTML = `<h4>Einladung über die App <small>${s102E(typeof s84TeamT === 'function' ? s84TeamT() : '')}</small></h4><div id="s102Stand">${s102StandHtml()}</div>`;
      const akt = karte.querySelector('.sbact'); if(akt) akt.before(box); else karte.appendChild(box);
      s102StandLaden().then(() => { const s = document.getElementById('s102Stand'); if(s) s.innerHTML = s102StandHtml(); try{ const k = document.getElementById('s84Setup'); if(k && typeof s84Karte === 'function') s84Karte(k.parentElement); }catch(e){} });
    }
    // Schalter für WhatsApp: nur der Admin
    if(typeof isAdmin === 'function' && isAdmin() && !B.querySelector('#s102Wa')){ const p = document.createElement('p'); p.className = 'note s102-wa';
      p.innerHTML = s102Aus() ? 'WhatsApp ist für Training und Materialdienst ausgeschaltet. <button type="button" class="s102-link" id="s102Wa">Wieder einschalten</button>' : 'Einladungen und Erinnerungen gehen per WhatsApp. <button type="button" class="s102-link" id="s102Wa">WhatsApp ausschalten, alles über die App</button>';
      karte.appendChild(p); p.querySelector('#s102Wa').onclick = () => s102WaDialog(B); }
  }catch(e){ console.warn('Automatik 0.99.28', e); }
  return r; }; }
function s102WaDialog(B){ const aus = s102Aus();
  const M = svModal(`<div class="mhead"><div><h2 style="margin:0">${aus ? 'WhatsApp wieder einschalten?' : 'WhatsApp ausschalten?'}</h2><div class="msub">Gilt für beide Mannschaften</div></div></div>
    <p class="note">${aus ? 'Dann gehen Einladung, Erinnerung und Materialdienst wieder per WhatsApp raus, so wie es eingerichtet war. Jede Nachricht kostet.' : 'Dann geht für Training und Materialdienst nichts mehr per WhatsApp raus. Spieler ohne die App bekommen keine Einladung mehr. Die Anfrage an Spieltagshelfer bleibt, wie sie ist.'}</p>
    <div class="pz-tc-dlgk"><button type="button" class="btn" id="s102WaOk">${aus ? 'Einschalten' : 'Ausschalten'}</button><button type="button" class="btn ghost" id="s102WaNein">Abbrechen</button></div>`);
  M.querySelector('#s102WaNein').onclick = () => closeOverlay();
  M.querySelector('#s102WaOk').onclick = () => paEinmal(M.querySelector('#s102WaOk'), async () => {
    try{ const r = await SVB.sb.rpc('kabine_bot_set', { p:{ whatsapp:aus } }); if(r.error) throw r.error; const g = await SVB.sb.rpc('kabine_bot_get'); if(g && g.data) KB.bot = g.data;
      closeOverlay(); kToast(aus ? 'WhatsApp ist wieder an.' : 'WhatsApp ist aus. Alles geht über die App.'); if(B && B.isConnected && typeof kbViewLink === 'function') kbViewLink(B); }
    catch(e){ kToast(typeof svFehlerText === 'function' ? svFehlerText(e) : e.message); } }, 'Speichert …'); }
// Ohne WhatsApp gibt es nichts mehr in die Gruppe zu teilen: kein Pop-up „Spieler einladen“
if(typeof kbInviteDue === 'function'){ const _id = kbInviteDue; kbInviteDue = function(){ return s102Aus() ? null : _id.apply(this, arguments); }; }
// Einrichtungs-Karte „Trainingsabfrage“: ohne WhatsApp zwei Schritte statt vier
if(typeof s84Schritte === 'function'){ const _s = s84Schritte; s84Schritte = function(){ const L = _s.apply(this, arguments); if(!s102Aus()) return L;
  const S = S102.stand[s102Team()], mit = S ? (S.mit || []).length : 0, fehlen = S ? (S.ohne_mitteilung || []).length + (S.ohne_konto || []).length : 0; if(!S) s102StandLaden().then(() => { try{ const k = document.getElementById('s84Setup'); if(k && S102.stand[s102Team()]) s84Karte(k.parentElement); }catch(e){} });
  const auto = L.find(x => x.k === 'auto'), team = L.filter(x => x.k === 'team');
  return [auto, { k:'app', ok:!!(S && S.gesamt && !fehlen), opt:!!(S && fehlen), t:'Einladung und Erinnerung kommen über die App',
      d:!S ? 'Spieler mit der App bekommen die Frage als Mitteilung und antworten mit einem Tipp.' : !S.gesamt ? 'Sobald die erste Abstimmung angelegt ist, steht hier, wen die App erreicht.' : `${mit} von ${S.gesamt} Spielern bekommen die Frage aufs Handy.` + (fehlen ? ` ${fehlen} ${fehlen === 1 ? 'wird' : 'werden'} noch nicht erreicht, die Namen stehen unten in der Automatik.` : ''), b:'Wer fehlt', go:'auto' },
    { k:'spieler', ok:true, info:true, t:'Fehlt ein Spieler?', d:'In jeder Abstimmung unter „Details“ nimmst du ihn mit einem Tipp dazu und trägst seine Antwort ein, wenn er die App noch nicht hat.' }].filter(Boolean).concat(team); }; }

(function(){ try{ const s=document.createElement('style'); s.id='svm102css'; s.textContent="/* 0.99.28: Training über die App (svm102.js) */\n.s102-weg{display:none !important;}\n.s102-zeiten label{display:block;margin-bottom:6px;}\n.s102-zeiten label small{font-weight:400;color:var(--ink2);}\n.s102-zl{display:flex;flex-wrap:wrap;gap:8px;}\n.s102-zl span{display:inline-flex;align-items:center;gap:8px;padding:4px 6px 4px 12px;border:1.5px solid var(--linie,rgba(120,130,160,.35));border-radius:12px;}\n.s102-zl b{font-size:14px;font-weight:600;}\n.s102-zl input{width:74px;min-height:40px;text-align:center;font:inherit;border:0;background:transparent;color:inherit;border-left:1px solid var(--linie,rgba(120,130,160,.35));border-radius:0;padding:4px 6px;}\n.s102-stand .s102-zahl{margin:4px 0 8px;font-size:15px;line-height:1.4;}\n.s102-stand .s102-li{margin:0 0 6px;font-size:14px;line-height:1.45;}\n.s102-wa{margin-top:12px;}\n.s102-link{font:inherit;font-weight:600;color:inherit;text-decoration:underline;background:none;border:0;padding:10px 4px;margin:-10px 0;cursor:pointer;}\n.s102-antw{margin:12px 0 4px;padding:12px 14px;border-radius:14px;border:1.5px solid var(--linie,rgba(120,130,160,.35));}\n.s102-st{margin:0 0 10px;font-size:16px;font-weight:700;}\n.s102-st.ja{color:var(--ok);}.s102-st.nein{color:var(--bad);}\n.s102-kn{display:grid;grid-template-columns:1fr 1fr;gap:10px;}\n.s102-kn .btn{min-height:48px;}\n"; document.head.appendChild(s); }catch(e){} })();
/* =====================================================================
   Beta 0.99.29 · Stadionheft, Stufe 1 (160_stadionheft.sql): Reiter „Stadionheft“ im Partnerbereich
   Albert, 14.11.2026: „Das muss ein extra Bereich bei uns bei Partner werden. Wer ist im Stadionheft, wer zahlt dafür, wer wird trotzdem
   abgedruckt. Deadlines für den Druck, die Redaktion gibt frei, drei Tage vorher ohne Freigabe sieht es die Abteilungsleitung.“
   - Nächstes Heft mit den Schritten Termin, Anzeigen, Freigabe, Druck und allen Fristen
   - Anzeigen mit Einordnung: zahlt, Gegenleistung, ohne Beitrag, zahlt und fehlt im Heft. Beträge sieht nur die Leitung im Bereich Partner.
   - Hinweis auf der Startseite für Abteilungsleitung und Redaktion (stadionheft_hinweis)
   Stufe 2 (Heftplaner zum Ziehen) und Stufe 3 (Satz und Druckdatei) kommen in dieselbe Datei oder daneben.
   ===================================================================== */
const SH = { d:null, flt:'alle', laedt:null, hin:null, hinT:0 };
const shE = s => (typeof svEsc === 'function' ? svEsc(s == null ? '' : String(s)) : String(s == null ? '' : s));
const SH_WT = ['So.', 'Mo.', 'Di.', 'Mi.', 'Do.', 'Fr.', 'Sa.'];
const shTag = s => { if(!s) return null; const [y, m, d] = String(s).slice(0, 10).split('-').map(Number); return new Date(y, m - 1, d); };
const shIso = d => d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0');
const shDatum = s => { const d = shTag(s); return d ? SH_WT[d.getDay()] + ', ' + String(d.getDate()).padStart(2, '0') + '.' + String(d.getMonth() + 1).padStart(2, '0') + '.' : ''; };
const shPlus = (s, n) => { const d = shTag(s); if(!d) return null; d.setDate(d.getDate() + n); return shIso(d); };
const shEuro = n => (Number(n) || 0).toLocaleString('de-DE', { minimumFractionDigits:(Number(n) % 1 ? 2 : 0), maximumFractionDigits:2 }) + ' €';
const SH_GR = { '1/1':'Ganze Seite', '1/2':'Halbe Seite', '1/4':'Viertelseite' };
const SH_ART = { zahlt:['ok', 'zahlt'], gegenleistung:['gr', 'Gegenleistung'], ohne:['warn', 'ohne Beitrag'], fehlt:['bad', 'zahlt, fehlt im Heft'], aus:['gr', 'nicht im Heft'] };
const SH_STATUS = { entwurf:['gr', 'Entwurf'], freigabe:['warn', 'wartet auf Freigabe'], freigegeben:['ok', 'freigegeben'], gedruckt:['ok', 'gedruckt'] };
async function shRpc(fn, args){ const { data, error } = await SVB.sb.rpc(fn, args || {}); if(error) throw new Error(typeof svFehlerText === 'function' ? svFehlerText(error) : error.message); return data; }

/* ---------- Reiter einhängen (nach dem Bandencreator, sonst nach den Banden) ---------- */
if(typeof SPO_REITER !== 'undefined' && !SPO_REITER.some(r => r[0] === 'stadionheft')){ let i = SPO_REITER.findIndex(r => r[0] === 'bandencreator'); if(i < 0) i = SPO_REITER.findIndex(r => r[0] === 'banden');
  SPO_REITER.splice(i < 0 ? SPO_REITER.length : i + 1, 0, ['stadionheft', 'Stadionheft']); }
if(typeof spoBody === 'function'){ const _b = spoBody; spoBody = function(){ if(SPO.view === 'stadionheft'){ const B = document.getElementById('spoB'); if(B) shRender(B); return; } return _b.apply(this, arguments); }; }

async function shLaden(){ if(SH.laedt) return SH.laedt; SH.laedt = shRpc('stadionheft_laden').then(d => { SH.d = d; return d; }).finally(() => { SH.laedt = null; }); return SH.laedt; }
function shNaechstes(){ const H = (SH.d && SH.d.hefte) || []; return H.filter(h => h.status !== 'gedruckt').sort((a, b) => a.monat < b.monat ? -1 : 1)[0] || null; }
function shZahlen(){ const A = (SH.d && SH.d.anzeigen) || [], n = k => A.filter(a => a.art === k).length;
  return { imHeft:A.filter(a => a.im_heft).length, zahlt:n('zahlt'), ohne:n('ohne'), gegen:n('gegenleistung'), fehlt:n('fehlt'), klaeren:A.filter(a => a.klaeren).length, alle:A.length }; }

// Wo das Stadionheft gezeichnet wird: im Reiter des Bereichs Partner oder, für die Redaktion ohne diesen Bereich, auf einem eigenen Blatt über der App
function shOrt(){ return document.getElementById('shVollB') || document.getElementById('spoB'); }
function shAn(){ return !!document.getElementById('shVollB') || (typeof SPO !== 'undefined' && SPO.view === 'stadionheft'); }
function shVollZu(){ const v = document.getElementById('shVoll'); if(v) v.remove(); document.documentElement.classList.remove('sh-vollan'); if(typeof SHP !== 'undefined') SHP.heft = null; if(typeof HV !== 'undefined'){ HV.heft = null; HV.ed = null; } try{ shHomeKarte(true); }catch(e){} }
function shVoll(oeffne){ let v = document.getElementById('shVoll');
  if(!v){ v = document.createElement('div'); v.id = 'shVoll'; v.className = 'sh-voll'; v.setAttribute('role', 'dialog'); v.setAttribute('aria-label', 'Stadionheft');
    v.innerHTML = '<div class="sh-vollk"><b>Stadionheft</b><button type="button" class="btn ghost" id="shVollZu">Schließen</button></div><div class="sh-vollb" id="shVollB"></div>'; document.body.appendChild(v); document.documentElement.classList.add('sh-vollan');
    v.querySelector('#shVollZu').onclick = () => { const zu = () => shVollZu(); if(typeof hvVerlassen === 'function' && typeof HV !== 'undefined' && HV.heft) hvVerlassen().then(ok => { if(ok) zu(); }); else zu(); }; }
  const B = v.querySelector('#shVollB'); SH.d = null; if(oeffne) oeffne(B); else shRender(B); return B; }
if(typeof window !== 'undefined' && !window._shVollNav){ window._shVollNav = 1; window.addEventListener('hashchange', () => { if(document.getElementById('shVoll')) shVollZu(); }); }
async function shRender(B){
  if(!SH.d) B.innerHTML = '<div class="card"><div class="empty">Lade das Stadionheft …</div></div>';
  try{ await shLaden(); }catch(e){ B.innerHTML = `<div class="card"><div class="empty">${shE(e.message)}</div></div>`; return; }
  if(!B.isConnected || !shAn()) return;
  const D = SH.d, lt = D.darf.leitung;
  B.innerHTML = `<div class="sh">${shHeftHtml()}${shFristenHtml()}${shAnzeigenHtml()}${shArchivHtml()}${lt ? shCfgHtml() : ''}</div>`;
  shBinden(B);
}

/* ---------- Nächstes Heft ---------- */
function shTageText(t){ return t == null ? '' : t < 0 ? 'Abgabe war vor ' + (-t) + (t === -1 ? ' Tag' : ' Tagen') : t === 0 ? 'Abgabe ist heute' : t === 1 ? 'Abgabe ist morgen' : 'noch ' + t + ' Tage bis zur Abgabe'; }
function shHeftHtml(){ const D = SH.d, h = shNaechstes(), lt = D.darf.leitung, c = D.cfg, Z = shZahlen();
  if(!h) return `<section class="card sh-heft" id="shHeft"><h3 class="sh-k">Nächstes Heft</h3><p class="sh-leer">Es ist noch kein Heft geplant.${lt ? ' Leg das nächste an, dann rechnet die App alle Fristen aus.' : ''}</p>${lt ? '<button type="button" class="btn" id="shNeu">Heft anlegen</button>' : ''}</section>`;
  const offen = Z.fehlt + Z.klaeren, st = SH_STATUS[h.status] || SH_STATUS.entwurf, frei = h.status === 'freigegeben' || h.status === 'gedruckt';
  const tp = h.tage == null || frei ? '' : `<span class="sh-pill ${h.tage <= 3 ? 'bad' : h.tage <= c.freigabe_tage ? 'warn' : 'gr'}">${shE(shTageText(h.tage))}</span>`;
  const schritt = (n, ok, jetzt, t, sub, pill) => `<div class="sh-st"><span class="sh-pk ${ok ? 'ok' : jetzt ? 'jetzt' : 'offen'}" aria-hidden="true">${ok ? '✓' : n}</span><div><b>${t}</b><small>${sub}</small></div>${pill || ''}</div>`;
  const s1 = !!(h.erscheint && h.abgabe), s2 = offen === 0 && Z.alle > 0;
  return `<section class="card sh-heft" id="shHeft"><div class="sh-kopf"><div><h3 class="sh-k">Nächstes Heft</h3><h2>${shE(h.titel)}</h2><p class="sh-sub">${h.erscheint ? 'Erscheint am ' + shE(shDatum(h.erscheint)) : 'Der Tag, an dem es erscheint, fehlt noch.'}${h.seiten ? ' · ' + h.seiten + ' Seiten' : ''}</p></div>${tp}</div>
    ${schritt(1, s1, !s1, 'Termin und Abgabe', s1 ? 'Abgabe an die Druckerei am ' + shE(shDatum(h.abgabe)) : 'Trag ein, zu welchem Heimspiel das Heft erscheint.', s1 ? '<span class="sh-pill ok">steht</span>' : '<span class="sh-pill warn">fehlt</span>')}
    ${schritt(2, s2, s1 && !s2, 'Anzeigen', Z.alle ? Z.imHeft + ' im Heft' + (offen ? ', ' + offen + ' zu klären' : ', alles geklärt') : 'Noch keine Anzeigen erfasst.', offen ? `<span class="sh-pill warn">${offen} offen</span>` : Z.alle ? '<span class="sh-pill ok">geklärt</span>' : '')}
    ${schritt(3, frei, s1 && !frei, 'Freigabe der Redaktion', frei ? 'Freigegeben' + (h.freigegeben_von ? ' von ' + shE(h.freigegeben_von) : '') + (h.freigegeben_am ? ' am ' + shE(shDatum(h.freigegeben_am)) : '') : (c.redaktion_name ? shE(c.redaktion_name) + ', ' : '') + (h.freigabe_ab ? 'Bitte geht am ' + shE(shDatum(h.freigabe_ab)) + ' raus' : 'sobald die Abgabe steht') + (h.freigabe_notiz ? '. Notiz: ' + shE(h.freigabe_notiz) : ''), `<span class="sh-pill ${st[0]}">${st[1]}</span>`)}
    ${schritt(4, h.status === 'gedruckt', frei, 'Druck', (c.druck_firma ? shE(c.druck_firma) : 'Druckerei') + (c.druck_name ? ', ' + shE(c.druck_name) : '') + (h.abgabe ? ' · Abgabe ' + shE(shDatum(h.abgabe)) : ''), frei ? '<span class="sh-pill warn">Datei abgeben</span>' : '')}
    ${h.notiz ? `<p class="note sh-notiz">${shE(h.notiz)}</p>` : ''}
    <div class="sh-akt">${D.darf.freigeben && !frei ? `<button type="button" class="btn" data-sh-frei="ja" data-id="${h.id}">Freigeben</button><button type="button" class="btn ghost" data-sh-frei="nein" data-id="${h.id}">Noch nicht</button>` : ''}
      ${lt && !frei && s1 ? `<button type="button" class="btn ghost" id="shFragen" data-id="${h.id}">${h.status === 'freigabe' ? 'Noch einmal um Freigabe bitten' : 'Zur Freigabe schicken'}</button>` : ''}
      ${lt && h.status === 'freigegeben' ? `<button type="button" class="btn" id="shGedruckt" data-id="${h.id}">Als gedruckt abhaken</button>` : ''}
      <button type="button" class="btn ghost" data-sh-plan="${h.id}">Seiten planen</button><button type="button" class="btn ghost" data-sh-satz="${h.id}">Vorschau und Texte</button>
      ${lt ? `<button type="button" class="btn ghost" data-sh-heft="${h.id}">Bearbeiten</button><button type="button" class="btn ghost" id="shNeu">Weiteres Heft</button>` : ''}</div>
    <p class="note sh-stufe">Unter „Seiten planen“ legst du fest, was auf welcher Seite steht. Den Satz der Seiten und die Druckdatei bringt die nächste Stufe, bis dahin wird das Heft wie gewohnt gesetzt.</p></section>`; }

/* ---------- Fristen ---------- */
function shFristenHtml(){ const D = SH.d, h = shNaechstes(), c = D.cfg; if(!h || !h.abgabe) return '';
  const red = c.redaktion_name || 'Die Redaktion', e = (kl, wann, t, d) => `<div class="sh-e ${kl}"><em>${wann}</em><b>${t}</b><span>${d}</span></div>`;
  return `<section class="card sh-fristen" id="shFristen"><h3 class="sh-k">Wer bekommt wann was</h3><div class="sh-zs">
    ${e('', c.freigabe_tage + ' Tage vor der Abgabe · ' + shE(shDatum(h.freigabe_ab)), 'Bitte um Freigabe', shE(red) + ' bekommt eine Mitteilung mit den Knöpfen Freigeben und Noch nicht.' + (c.redaktion_konto ? '' : ' Dafür braucht die Redaktion ein Konto in der App.'))}
    ${e('', '3, 2 und 1 Tag vorher · ab ' + shE(shDatum(shPlus(h.abgabe, -3))), 'Tägliche Erinnerung', 'Solange die Freigabe fehlt.')}
    ${e('rot', '3 Tage vorher ohne Freigabe', 'Hinweis an die Abteilungsleitung', 'Als Mitteilung und oben auf der Startseite, bis freigegeben ist.')}
    ${e('', 'Abgabe · ' + shE(shDatum(h.abgabe)), 'Druckdatei an die Druckerei', (c.druck_name ? shE(c.druck_name) : 'Die Druckerei') + (c.druck_firma ? ' (' + shE(c.druck_firma) + ')' : '') + ' bekommt das Heft. Die Druckerei braucht ' + c.abgabe_tage + ' Tage.')}
    ${h.erscheint ? e('gr', shE(shDatum(h.erscheint)), 'Das Heft liegt am Platz', 'Zum Heimspiel.') : ''}</div>
    <p class="note ${c.erinnern ? '' : 'sh-aus'}">${c.erinnern ? 'Erinnerungen sind eingeschaltet. Die App verschickt die Mitteilungen von selbst.' : 'Erinnerungen sind ausgeschaltet. Von selbst geht an niemanden etwas raus. „Zur Freigabe schicken“ fragt die Redaktion sofort.'}</p></section>`; }

/* ---------- Anzeigen ---------- */
function shAnzeigenHtml(){ const D = SH.d, lt = D.darf.leitung, Z = shZahlen(), A = D.anzeigen || [];
  const F = [['alle', 'Alle', Z.alle], ['zahlt', 'Zahlen', Z.zahlt], ['ohne', 'Ohne Beitrag', Z.ohne], ['fehlt', 'Zahlen, fehlen', Z.fehlt], ['klaeren', 'Zu klären', Z.klaeren]].filter(f => f[0] === 'alle' || f[2]);
  if(!F.some(f => f[0] === SH.flt)) SH.flt = 'alle';
  const L = A.filter(a => SH.flt === 'alle' || (SH.flt === 'klaeren' ? a.klaeren : a.art === SH.flt));
  const zeile = a => { const k = SH_ART[a.art] || SH_ART.aus, ini = a.firma.replace(/[^A-Za-zÄÖÜäöü ]/g, '').split(/\s+/).filter(Boolean).slice(0, 2).map(w => w[0].toUpperCase()).join('');
    return `<${lt ? 'button type="button"' : 'div'} class="sh-az" ${lt ? `data-sh-az="${a.id}"` : ''}><span class="sh-logo" aria-hidden="true">${shE(ini)}</span><span class="sh-azt"><b>${shE(a.firma)}</b><small>${[a.im_heft ? SH_GR[a.groesse] : null, a.platz, a.fest ? 'fester Platz' : null, a.art === 'gegenleistung' ? a.gegenleistung : null, a.hinweis].filter(Boolean).map(shE).join(' · ') || 'ohne Angaben'}</small></span>
      <span class="sh-azr"><span class="sh-pill ${k[0]}">${k[1]}</span>${lt && a.beitrag ? `<small>${shEuro(a.beitrag)}</small>` : ''}${a.klaeren ? '<small class="sh-kl">zu klären</small>' : ''}</span></${lt ? 'button' : 'div'}>`; };
  return `<section class="card sh-anz" id="shAnz"><div class="sh-kopf"><h3 class="sh-k">Anzeigen im Heft</h3>${lt ? '<button type="button" class="btn ghost sh-kn" id="shAzNeu">Anzeige erfassen</button>' : ''}</div>
    <div class="sh-zahlen"><div><b>${Z.imHeft}</b><span>im Heft</span></div><div class="ok"><b>${Z.zahlt}</b><span>zahlen</span></div><div class="warn"><b>${Z.ohne}</b><span>ohne Beitrag</span></div><div class="bad"><b>${Z.fehlt}</b><span>zahlen, fehlen</span></div></div>
    ${lt && D.summe ? `<p class="sh-sum">Beiträge im Jahr: <b>${shEuro(D.summe.zahlt)}</b> für Anzeigen im Heft${Number(D.summe.fehlt) ? `, <b>${shEuro(D.summe.fehlt)}</b> von Firmen, die nicht im Heft stehen` : ''}.</p>` : ''}
    ${A.length ? `<div class="sh-chips" role="tablist" aria-label="Anzeigen filtern">${F.map(f => `<button type="button" role="tab" aria-selected="${f[0] === SH.flt}" class="sh-chip${f[0] === SH.flt ? ' on' : ''}" data-sh-flt="${f[0]}">${f[1]} ${f[2]}</button>`).join('')}</div>
    <div class="sh-liste">${L.map(zeile).join('') || '<p class="sh-leer">Keine Anzeige in dieser Auswahl.</p>'}</div>` : `<p class="sh-leer">Noch keine Anzeigen erfasst.${lt ? ' Erfasse, wer im Heft steht und wer dafür zahlt.' : ''}</p>`}</section>`; }

/* ---------- Bisherige Hefte ---------- */
function shArchivHtml(){ const H = ((SH.d && SH.d.hefte) || []).filter(h => h.status === 'gedruckt'), lt = SH.d.darf.leitung; if(!H.length) return '';
  return `<section class="card sh-archiv" id="shArchiv"><h3 class="sh-k">Bisherige Hefte</h3>${H.map(h => `<div class="sh-ar"><div><b>${shE(h.titel)}</b><small>${[h.seiten ? h.seiten + ' Seiten' : null, h.erscheint ? 'erschienen am ' + shDatum(h.erscheint) : null].filter(Boolean).map(shE).join(' · ')}</small></div>
    <span class="sh-arr">${h.pdf_url ? `<a class="btn ghost sh-kn" href="${shE(h.pdf_url)}" target="_blank" rel="noopener">Ansehen</a>` : ''}${lt ? `<button type="button" class="btn ghost sh-kn" data-sh-heft="${h.id}">Ändern</button>` : ''}</span></div>`).join('')}</section>`; }

/* ---------- Einstellungen (Leitung) ---------- */
function shCfgHtml(){ const D = SH.d, c = D.cfg, K = D.konten || [];
  return `<details class="card sh-cfg" id="shCfg"><summary>Einstellungen</summary>
    <div class="sh-form"><label class="field"><span>Tage, die die Druckerei braucht</span><input id="shC_ab" type="number" min="1" max="21" inputmode="numeric" value="${c.abgabe_tage}"></label>
    <label class="field"><span>Bitte um Freigabe, Tage vor der Abgabe</span><input id="shC_fr" type="number" min="1" max="21" inputmode="numeric" value="${c.freigabe_tage}"></label>
    <label class="field"><span>Redaktion (Name)</span><input id="shC_rn" maxlength="80" value="${shE(c.redaktion_name || '')}" autocomplete="off"></label>
    <label class="field"><span>Konto der Redaktion <small>bekommt die Bitte um Freigabe</small></span><select id="shC_rk"><option value="">noch kein Konto</option>${K.map(k => `<option value="${k.id}"${k.id === c.redaktion ? ' selected' : ''}>${shE(k.name)}</option>`).join('')}</select></label>
    <label class="field"><span>Druckerei</span><input id="shC_df" maxlength="80" value="${shE(c.druck_firma || '')}" autocomplete="off"></label>
    <label class="field"><span>Ansprechpartner Druck</span><input id="shC_dn" maxlength="80" value="${shE(c.druck_name || '')}" autocomplete="off"></label></div>
    ${D.darf.admin ? `<label class="sh-schalter"><input type="checkbox" id="shC_er"${c.erinnern ? ' checked' : ''}><span><b>Erinnerungen verschicken</b><small>Bitte um Freigabe, tägliche Erinnerung und Hinweis an die Abteilungsleitung gehen dann von selbst raus.</small></span></label>` : `<p class="note">Erinnerungen sind ${c.erinnern ? 'eingeschaltet' : 'ausgeschaltet'}. Das stellt der Admin um.</p>`}
    <button type="button" class="btn" id="shC_ok">Einstellungen speichern</button></details>`; }

/* ---------- Bedienung ---------- */
function shNeuZeichnen(){ const B = shOrt(); if(B && shAn()) return shLaden().then(() => shRender(B)); return shLaden(); }
function shBinden(B){
  B.querySelectorAll('[data-sh-flt]').forEach(b => b.onclick = () => { SH.flt = b.dataset.shFlt; const s = B.querySelector('#shAnz'); if(s){ s.outerHTML = shAnzeigenHtml(); shBinden(B); } });
  B.querySelectorAll('[data-sh-az]').forEach(b => b.onclick = () => shAnzeigeDialog(SH.d.anzeigen.find(a => a.id === b.dataset.shAz)));
  const an = B.querySelector('#shAzNeu'); if(an) an.onclick = () => shAnzeigeDialog(null);
  B.querySelectorAll('#shNeu').forEach(b => b.onclick = () => shHeftDialog(null));
  B.querySelectorAll('[data-sh-heft]').forEach(b => b.onclick = () => shHeftDialog(SH.d.hefte.find(h => h.id === b.dataset.shHeft)));
  B.querySelectorAll('[data-sh-frei]').forEach(b => b.onclick = () => shFreigabeDialog(SH.d.hefte.find(h => h.id === b.dataset.id), b.dataset.shFrei === 'ja'));
  const fr = B.querySelector('#shFragen'); if(fr) fr.onclick = () => paEinmal(fr, async () => { try{ const r = await shRpc('stadionheft_freigabe_anfragen', { p_id:fr.dataset.id });
      kToast(r.frage ? 'Die Redaktion ist gefragt.' : r.grund === 'offen' ? 'Die Frage liegt schon bei der Redaktion.' : r.grund === 'konto' ? 'Die Redaktion hat noch kein Konto. Gebt das Heft selbst frei oder tragt das Konto in den Einstellungen ein.' : 'Das Heft ist schon freigegeben.'); await shNeuZeichnen(); }
    catch(e){ kToast(e.message); } }, 'Fragt …');
  const gd = B.querySelector('#shGedruckt'); if(gd) gd.onclick = () => paEinmal(gd, async () => { try{ await shRpc('stadionheft_speichern', { p:{ id:gd.dataset.id, status:'gedruckt' } }); kToast('Als gedruckt abgehakt.'); await shNeuZeichnen(); }catch(e){ kToast(e.message); } }, 'Speichert …');
  const ok = B.querySelector('#shC_ok'); if(ok) ok.onclick = () => paEinmal(ok, async () => { const v = id => (B.querySelector('#' + id) || {}).value, p = { abgabe_tage:v('shC_ab'), freigabe_tage:v('shC_fr'), redaktion_name:v('shC_rn'), redaktion:v('shC_rk'), druck_firma:v('shC_df'), druck_name:v('shC_dn') };
      const er = B.querySelector('#shC_er'); if(er && er.checked !== !!SH.d.cfg.erinnern) p.erinnern = er.checked;
      try{ await shRpc('stadionheft_cfg_setzen', { p }); kToast('Einstellungen sind gespeichert.'); await shNeuZeichnen(); const d = document.getElementById('shCfg'); if(d) d.open = true; }catch(e){ kToast(e.message); } }, 'Speichert …');
}

function shHeftDialog(h){ const D = SH.d, c = D.cfg, neu = !h, HS = D.heimspiele || [];
  const M = svModal(`<div class="mhead"><div><h2 style="margin:0">${neu ? 'Heft anlegen' : shE(h.titel)}</h2><div class="msub">${neu ? 'Die Abgabe rechnet die App aus' : (SH_STATUS[h.status] || [0, ''])[1]}</div></div></div>
    <div class="sh-form"><label class="field"><span>Monat</span><input id="shH_m" type="month" value="${neu ? '' : String(h.monat).slice(0, 7)}"></label>
    <label class="field"><span>Erscheint am <small>meist das erste Heimspiel im Monat</small></span><input id="shH_e" type="date" value="${neu || !h.erscheint ? '' : h.erscheint}"></label>
    ${HS.length ? `<div class="sh-vor" aria-label="Kommende Heimspiele">${HS.slice(0, 6).map(s => `<button type="button" class="sh-chip" data-sh-hs="${s.datum}">${shE(shDatum(s.datum))}${s.gegner ? ' gegen ' + shE(s.gegner) : ''}</button>`).join('')}</div>` : ''}
    <label class="field"><span>Abgabe an die Druckerei <small>${c.abgabe_tage} Tage vorher</small></span><input id="shH_a" type="date" value="${neu || !h.abgabe ? '' : h.abgabe}"></label>
    <label class="field"><span>Seiten <small>durch vier teilbar</small></span><input id="shH_s" type="number" min="4" max="96" step="4" inputmode="numeric" value="${neu || !h.seiten ? '' : h.seiten}"></label>
    <label class="field sh-breit"><span>Adresse des fertigen Hefts <small>zum Ansehen, wenn es online steht</small></span><input id="shH_p" type="url" inputmode="url" placeholder="https://" value="${neu ? '' : shE(h.pdf_url || '')}" autocomplete="off"></label>
    <label class="field sh-breit"><span>Notiz</span><textarea id="shH_n" rows="2" maxlength="1000">${neu ? '' : shE(h.notiz || '')}</textarea></label></div>
    <p class="note" id="shH_f" role="alert" hidden></p>
    <div class="pz-tc-dlgk"><button type="button" class="btn" id="shH_ok">Speichern</button>${!neu && h.status !== 'entwurf' ? '<button type="button" class="btn ghost" id="shH_zu">Zurück auf Entwurf</button>' : ''}${!neu && h.status === 'entwurf' ? '<button type="button" class="btn ghost" id="shH_weg">Entfernen</button>' : ''}<button type="button" class="btn ghost" id="shH_ab">Abbrechen</button></div>`);
  const g = id => M.querySelector('#' + id), f = g('shH_f'), fehler = t => { f.textContent = t; f.hidden = false; };
  let abHand = !neu && !!h.abgabe;
  const rechne = () => { const e = g('shH_e').value; if(e && !abHand) g('shH_a').value = shPlus(e, -c.abgabe_tage); if(e && !g('shH_m').value) g('shH_m').value = e.slice(0, 7); };
  g('shH_e').onchange = rechne; g('shH_a').oninput = () => { abHand = true; };
  M.querySelectorAll('[data-sh-hs]').forEach(b => b.onclick = () => { g('shH_e').value = b.dataset.shHs; g('shH_m').value = b.dataset.shHs.slice(0, 7); abHand = false; rechne(); });
  g('shH_ab').onclick = () => closeOverlay();
  const sichern = (extra, text) => async () => { const m = g('shH_m').value; if(!m){ fehler('Bitte den Monat wählen.'); return; }
    const p = Object.assign({ monat:m + '-01', erscheint:g('shH_e').value, abgabe:g('shH_a').value, seiten:g('shH_s').value, pdf_url:g('shH_p').value.trim(), notiz:g('shH_n').value }, neu ? {} : { id:h.id }, extra || {});
    try{ await shRpc('stadionheft_speichern', { p }); closeOverlay(); kToast(text || 'Heft ist gespeichert.'); await shNeuZeichnen(); }catch(e){ fehler(e.message); } };
  g('shH_ok').onclick = () => paEinmal(g('shH_ok'), sichern(), 'Speichert …');
  if(g('shH_zu')) g('shH_zu').onclick = () => paEinmal(g('shH_zu'), sichern({ status:'entwurf' }, 'Das Heft ist wieder ein Entwurf.'), 'Speichert …');
  if(g('shH_weg')) g('shH_weg').onclick = () => { const b = g('shH_weg'); if(b.dataset.sicher !== '1'){ b.dataset.sicher = '1'; b.textContent = 'Wirklich entfernen?'; return; }
    paEinmal(b, async () => { try{ await shRpc('stadionheft_weg', { p_id:h.id }); closeOverlay(); kToast('Heft ist entfernt.'); await shNeuZeichnen(); }catch(e){ fehler(e.message); } }, 'Entfernt …'); };
}

function shFreigabeDialog(h, ja){ if(!h) return;
  const M = svModal(`<div class="mhead"><div><h2 style="margin:0">${ja ? 'Heft freigeben?' : 'Noch nicht freigeben'}</h2><div class="msub">${shE(h.titel)}</div></div></div>
    <p class="note">${ja ? 'Mit der Freigabe geht das Heft in den Druck' + (h.abgabe ? ', Abgabe ist am ' + shE(shDatum(h.abgabe)) : '') + '. Die Leitung im Bereich Partner bekommt Bescheid.' : 'Schreib kurz dazu, was noch fehlt. Die Leitung im Bereich Partner bekommt Bescheid.'}</p>
    ${h.pdf_url ? `<p><a class="btn ghost" href="${shE(h.pdf_url)}" target="_blank" rel="noopener">Heft ansehen</a></p>` : ''}
    <label class="field"><span>Notiz${ja ? ' <small>wenn du magst</small>' : ''}</span><textarea id="shF_n" rows="2" maxlength="500"></textarea></label>
    <p class="note" id="shF_f" role="alert" hidden></p>
    <div class="pz-tc-dlgk"><button type="button" class="btn" id="shF_ok">${ja ? 'Freigeben' : 'Noch nicht'}</button><button type="button" class="btn ghost" id="shF_ab">Abbrechen</button></div>`);
  M.querySelector('#shF_ab').onclick = () => closeOverlay();
  M.querySelector('#shF_ok').onclick = () => paEinmal(M.querySelector('#shF_ok'), async () => {
    try{ await shRpc('stadionheft_freigabe', { p_id:h.id, p_ja:ja, p_notiz:M.querySelector('#shF_n').value }); closeOverlay(); kToast(ja ? 'Das Heft ist freigegeben.' : 'Notiert: noch nicht freigegeben.');
      SH.hin = null; try{ shHomeKarte(true); }catch(e){} try{ if(typeof frLaden === 'function') frLaden(true).then(() => { try{ frKarte(); }catch(e){} }); }catch(e){} await shNeuZeichnen(); }
    catch(e){ const f = M.querySelector('#shF_f'); f.textContent = e.message; f.hidden = false; } }, 'Speichert …');
}

function shAnzeigeDialog(a){ const neu = !a;
  const M = svModal(`<div class="mhead"><div><h2 style="margin:0">${neu ? 'Anzeige erfassen' : shE(a.firma)}</h2><div class="msub">Nur für die Leitung im Bereich Partner</div></div></div>
    <div class="sh-form"><label class="field sh-breit"><span>Firma</span><input id="shA_f" maxlength="120" value="${neu ? '' : shE(a.firma)}" autocomplete="off"></label>
    <label class="field"><span>Größe</span><select id="shA_g">${Object.keys(SH_GR).map(k => `<option value="${k}"${(neu ? '1/2' : a.groesse) === k ? ' selected' : ''}>${SH_GR[k]}</option>`).join('')}</select></label>
    <label class="field"><span>Platz im Heft <small>zum Beispiel Seite 2 oder Rückseite</small></span><input id="shA_p" maxlength="60" value="${neu ? '' : shE(a.platz || '')}" autocomplete="off"></label>
    <label class="field"><span>Beitrag im Jahr, netto</span><input id="shA_b" type="number" min="0" step="0.01" inputmode="decimal" value="${neu || a.beitrag == null ? '' : a.beitrag}"></label>
    <label class="field"><span>Gegenleistung statt Beitrag <small>zum Beispiel druckt das Heft</small></span><input id="shA_gl" maxlength="160" value="${neu ? '' : shE(a.gegenleistung || '')}" autocomplete="off"></label>
    <label class="field sh-breit"><span>Hinweis</span><textarea id="shA_h" rows="2" maxlength="400">${neu ? '' : shE(a.hinweis || '')}</textarea></label></div>
    <label class="sh-schalter"><input type="checkbox" id="shA_i"${neu || a.im_heft ? ' checked' : ''}><span><b>Steht im Heft</b></span></label>
    <label class="sh-schalter"><input type="checkbox" id="shA_fe"${!neu && a.fest ? ' checked' : ''}><span><b>Fester Platz</b><small>bleibt beim Ordnen der Seiten stehen</small></span></label>
    <label class="sh-schalter"><input type="checkbox" id="shA_k"${!neu && a.klaeren ? ' checked' : ''}><span><b>Zu klären</b><small>zählt als offener Punkt beim nächsten Heft</small></span></label>
    <p class="note" id="shA_fl" role="alert" hidden></p>
    <div class="pz-tc-dlgk"><button type="button" class="btn" id="shA_ok">Speichern</button>${neu ? '' : '<button type="button" class="btn ghost" id="shA_weg">Entfernen</button>'}<button type="button" class="btn ghost" id="shA_ab">Abbrechen</button></div>`);
  const g = id => M.querySelector('#' + id), fehler = t => { const f = g('shA_fl'); f.textContent = t; f.hidden = false; };
  g('shA_ab').onclick = () => closeOverlay();
  g('shA_ok').onclick = () => paEinmal(g('shA_ok'), async () => { const firma = g('shA_f').value.trim(); if(!firma){ fehler('Bitte die Firma eintragen.'); return; }
    const p = Object.assign({ firma, groesse:g('shA_g').value, platz:g('shA_p').value, beitrag:g('shA_b').value, gegenleistung:g('shA_gl').value, hinweis:g('shA_h').value, im_heft:g('shA_i').checked, fest:g('shA_fe').checked, klaeren:g('shA_k').checked }, neu ? {} : { id:a.id });
    try{ await shRpc('stadionheft_anzeige', { p }); closeOverlay(); kToast('Anzeige ist gespeichert.'); await shNeuZeichnen(); }catch(e){ fehler(e.message); } }, 'Speichert …');
  if(g('shA_weg')) g('shA_weg').onclick = () => { const b = g('shA_weg'); if(b.dataset.sicher !== '1'){ b.dataset.sicher = '1'; b.textContent = 'Wirklich entfernen?'; return; }
    paEinmal(b, async () => { try{ await shRpc('stadionheft_anzeige_weg', { p_id:a.id }); closeOverlay(); kToast('Anzeige ist entfernt.'); await shNeuZeichnen(); }catch(e){ fehler(e.message); } }, 'Entfernt …'); };
}

/* ---------- Startseite: Hinweis für Abteilungsleitung und Redaktion ---------- */
async function shHomeKarte(neu){ const home = document.getElementById('panel-home'); if(!home || !(typeof SVB !== 'undefined' && SVB.sb)) return;
  if(neu || SH.hin === null || Date.now() - SH.hinT > 300000){ SH.hinT = Date.now(); try{ const { data, error } = await SVB.sb.rpc('stadionheft_hinweis'); SH.hin = error ? false : (data || false); }catch(e){ SH.hin = false; } }
  let k = document.getElementById('shHome'); const x = SH.hin;
