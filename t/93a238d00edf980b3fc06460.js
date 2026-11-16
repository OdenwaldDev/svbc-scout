    else if(g === 'teilen'){ const p = (KB.polls || []).find(x => x.id === b.dataset.poll); if(p) kbShare(p); }
    else if(g === 'neu') kbPollEditor(null);
    else if(g === 'links') kbSpielerLinks();
    else if(g === 'einladen') goTab('admin');
  });
}
if(typeof kbViewPolls === 'function'){ const _vp84 = kbViewPolls; kbViewPolls = function(B){ const r = _vp84.apply(this, arguments); try{ s84Karte(B); }catch(e){ console.warn('Trainingsabfrage', e); } return r; }; }

/* ---------- 3. Pop-up zum Einladen: Mannschaften des eigenen Trainerteams ---------- */
function s84MeineTeams(){
  try{ const F = (typeof SVR !== 'undefined' && Array.isArray(SVR.funk) && SVR.funk) || [], h = F.map(f => f.mannschaft);
    const t = []; if(!h.length || h.includes('h1')) t.push('1'); if(h.includes('h2')) t.push('2'); return t.length ? t : ['1']; }
  catch(e){ return ['1']; }
}
function s84NurZweite(){ const t = s84MeineTeams(); return t.length === 1 && t[0] === '2'; }
if(typeof kbInviteDue === 'function'){ const _id84 = kbInviteDue; kbInviteDue = function(){
  // In der Kabine gilt die gewählte Mannschaft, sonst die des eigenen Trainerteams
  if(document.querySelector('#panel-kabine.active')) return _id84.apply(this, arguments);
  const M = s84MeineTeams(), heute = trToday(), L = (KB._p31all || KB.polls || []);
  return L.filter(p => M.includes(p.team || '1') && p.art === 'training' && !p.event_id && !p.geschlossen && !p.geteilt_at && p.datum >= heute && TRC.diffDays(p.datum, heute) <= 2)
    .sort((a, b) => a.datum < b.datum ? -1 : 1)[0] || null; }; }
if(typeof kbPopup === 'function'){ const _pp84 = kbPopup; kbPopup = function(){ const r = _pp84.apply(this, arguments);
  try{ const p = kbInviteDue(), h = document.querySelector('.kbpop h2'); if(p && h && (p.team || '1') === '2' && !h.dataset.s84){ h.dataset.s84 = 1; h.textContent = 'Spieler der 2. Mannschaft zum Training einladen'; } }catch(e){}
  return r; }; }

/* ---------- 4. Die Zweite öffnet die Mannschaft, nicht die alte Teamseite ---------- */
if(typeof svrHomeTeams === 'function'){ const _ht84 = svrHomeTeams; svrHomeTeams = function(){ const r = _ht84.apply(this, arguments);
  try{ document.querySelectorAll('#svrMeine [data-svrm="h2"]').forEach(b => b.onclick = () => goTab('mann2')); }catch(e){}
  return r; }; }
// Wer nur die Zweite betreut, landet in der Mannschaft auch bei der Zweiten
{ const _gt84 = goTab; goTab = function(tab){
  try{ const cur = typeof svCurTab === 'function' ? svCurTab() : '';
    if((tab === 'training' || tab === 'kabine') && cur !== 'training' && cur !== 'kabine' && s84NurZweite() && s84Team() !== '2') mnCtxSet('2', false); }catch(e){}
  return _gt84.apply(this, arguments); }; }

/* ---------- 5. Beteiligung: eine Seite ---------- */
// „Aus der App“ zählt die Einheiten in der App, „Aus den Listen“ zeigt die Beteiligungslisten je Saison (nur 1. Mannschaft), getrennt nebeneinander.
if(typeof MN_VIEWS !== 'undefined' && MN_VIEWS.betl){ const _bl84 = MN_VIEWS.betl; MN_VIEWS.betl = function(B){
  const listen = s84Team() === '1' && typeof tm41Bet === 'function';
  if(!listen) S84.betTab = 'app';
  const seg = listen ? `<div class="k1-seg s84-bseg" role="tablist" aria-label="Zeitraum">${[['app', 'Aus der App'], ['alt', 'Aus den Listen']].map(([k, t]) => `<button type="button" role="tab" data-s84b="${k}" class="${S84.betTab === k ? 'on' : ''}" aria-selected="${S84.betTab === k}">${t}</button>`).join('')}</div>` : '';
  if(S84.betTab === 'alt'){ B.innerHTML = seg + '<div id="s84Alt"></div>'; const A = B.querySelector('#s84Alt');
    if(typeof SV41 !== 'undefined' && !SV41.betLoaded){ if(!SV41.betBusy && typeof sv41LoadBet === 'function') sv41LoadBet();
      // lädt gerade (auch vom Start der App): neu zeichnen, sobald die Listen da sind
      clearTimeout(S84.betT); S84.betT = setTimeout(function nochmal(){ if(svCurTab() !== 'training' || TR.view !== 'betl' || S84.betTab !== 'alt') return; if(SV41.betLoaded) trRender(); else S84.betT = setTimeout(nochmal, 700); }, 700); }
    tm41Bet(A); }
  else { _bl84.apply(this, arguments); if(seg) B.insertAdjacentHTML('afterbegin', seg); }
  B.querySelectorAll('[data-s84b]').forEach(b => b.onclick = () => { S84.betTab = b.dataset.s84b; MN_VIEWS.betl(B); });
}; }
// Alte Wege zur Beteiligung (Rankings & Verein, Teamseite, Profil) führen auf diese Seite
{ const _go84 = sv4Go; sv4Go = function(k){ if(k === 'training:bet'){ S84.betTab = 'alt'; TR.view = 'betl'; return goTab('mann1'); } return _go84.apply(this, arguments); }; }
if(typeof vrRender === 'function'){ const _vr84 = vrRender; vrRender = function(){
  if(typeof VR !== 'undefined' && VR.view === 'bet'){ VR.view = 'rank'; S84.betTab = 'alt'; TR.view = 'betl'; setTimeout(() => goTab('mann1'), 0); }
  const r = _vr84.apply(this, arguments);
  try{ document.querySelectorAll('#panel-verein [data-vrv="bet"]').forEach(b => b.remove()); }catch(e){}
  return r; }; }
// Ältere Ansicht „training:bet“ gibt es nicht mehr als eigenen Reiter
try{ if(typeof SV4_HUB !== 'undefined' && SV4_HUB.mannschaft){ const T = SV4_HUB.mannschaft.tabs, i = T.findIndex(([k]) => k === 'training:bet'); if(i >= 0) T.splice(i, 1); } }catch(e){}
{ const _tr84 = trRender; trRender = function(){ if(typeof TR !== 'undefined' && TR.view === 'bet'){ TR.view = 'betl'; S84.betTab = 'alt'; } return _tr84.apply(this, arguments); }; }

(function(){ try{ const s=document.createElement('style'); s.id='svm84css'; s.textContent="/* Beta 0.87 · Trainingsabfrage je Mannschaft, Beteiligung auf einer Seite */\n.s84-tt{font-size:13px;font-weight:600;color:var(--ink2);margin-left:6px;}\n.s84-aus{display:none!important;}\n.s84-gem{margin:8px 0;}\n\n/* Einrichtungs-Karte */\n.s84-setup{padding:0;overflow:hidden;}\n.s84-kopf{display:flex;align-items:center;gap:12px;width:100%;min-height:56px;padding:12px 14px;background:none;border:0;color:inherit;font:inherit;text-align:left;cursor:pointer;}\n.s84-kopf>span:nth-child(2){flex:1;min-width:0;}\n.s84-kopf b{display:block;font-size:15px;}\n.s84-kopf small{display:block;color:var(--ink2);font-size:13px;margin-top:2px;}\n.s84-kopf>i{display:inline-grid;place-items:center;width:28px;height:28px;transition:transform .2s ease;transform:rotate(90deg);}\n.s84-setup.zu .s84-kopf>i{transform:rotate(0deg);}\n.s84-ring{flex:none;display:inline-grid;place-items:center;width:42px;height:42px;border-radius:50%;border:2px solid var(--line);font-size:13px;font-weight:800;font-variant-numeric:tabular-nums;}\n.s84-ring.ok{border-color:rgba(34,197,94,.7);background:rgba(34,197,94,.12);}\n.s84-l{list-style:none;margin:0;padding:0 14px 12px;display:grid;gap:8px;}\n.s84-setup.zu .s84-l{display:none;}\n.s84-l li{display:grid;grid-template-columns:28px minmax(0,1fr) auto;align-items:center;gap:10px;padding:10px 12px;border:1px solid var(--line);border-radius:12px;}\n.s84-l li p{margin:2px 0 0;font-size:13px;color:var(--ink2);}\n.s84-c{display:inline-grid;place-items:center;width:24px;height:24px;border-radius:50%;border:2px solid var(--line);font-size:12px;font-weight:800;}\n.s84-l li.ok .s84-c{border-color:rgba(34,197,94,.7);background:rgba(34,197,94,.14);}\n.s84-l li.info .s84-c{font-style:normal;color:var(--ink2);}\n.s84-l li.ok{opacity:.8;}\n#s84Setup .s84-l .btn{min-height:44px!important;white-space:nowrap;}\n@media (max-width:560px){\n  .s84-l li{grid-template-columns:28px minmax(0,1fr);}\n  .s84-l li>.btn{grid-column:2;justify-self:start;}\n}\n\n/* Beteiligung: Diese Saison | Frühere Saisons */\n.s84-bseg{margin:0 0 12px;}\n.s84-bseg button{min-height:44px!important;padding:0 16px;}\n.kbaddq{width:100%;min-height:44px;padding:8px 12px;border-radius:10px;border:1px solid var(--line);background:var(--surface3);color:var(--ink);font:inherit;margin-bottom:8px;}\n"; document.head.appendChild(s); }catch(e){} })();
/* Beta 0.88 · Helferplan in der Sportzentrale (ersetzt die Mini-App)
   Je Spieltag: Gemeinsame Aufgaben, Aufgaben je Mannschaft, Freiwillige Unterstützung. Eintragen mit einem Tipp.
   Die Orga teilt auch andere ein (Helferpool oder Name), sieht Zu- und Absagen und stellt die Anfrage vor dem Spieltag ein.
   Server: 122_helferplan.sql (hp_uebersicht, hp_setzen, hp_entfernen, hp_antworten_liste, hp_cfg_setzen, hp_import). */
const HPL = { d:null, t:0, busy:null, tag:null, meinAuf:false, ant:{}, err:null };
const HPL_GRUPPE = { g:'Gemeinsame Aufgaben', '1':'1. Mannschaft', '2':'2. Mannschaft', f:'Freiwillige Unterstützung' };
const hplE = s => svEsc(s == null ? '' : String(s));
function hplTag(d){ try{ return new Date(d + 'T12:00:00').toLocaleDateString('de-DE', { weekday:'short', day:'2-digit', month:'2-digit' }); }catch(e){ return d; } }
function hplSpiele(t){ return (t.spiele || []).slice().sort((a, b) => a.team.localeCompare(b.team)).map(s => (s.team === '2' ? 'Zweite' : 'Erste') + (s.heim ? ' zu Hause' : ' auswärts') + (s.zeit ? ' ' + s.zeit : '') + (s.gegner ? ' gegen ' + s.gegner : '')).join(' · '); }
function hplOffen(t){ return (t.aufgaben || []).filter(a => !a.frei && !(a.namen || []).length).length; }
function hplMeine(t){ return (t.aufgaben || []).filter(a => (a.namen || []).some(n => n.mein)); }

async function hplLaden(neu){
  if(HPL.busy){ if(!neu) return HPL.busy; await HPL.busy.catch(() => {}); }   // nach einer Änderung immer frisch laden
  if(!neu && HPL.d && Date.now() - HPL.t < 30000) return HPL.d;
  if(neu) HPL.ant = {};
  const stand = SVB.sb.rpc('hp_abgleich_stand').then(r => { HPL.stand = (r && r.data) || null; }).catch(() => {});   // 0.90: Stand des Abgleichs mit Lukas' App
  HPL.busy = Promise.all([SVB.sb.rpc('hp_uebersicht', { p_tage:60 }), stand]).then(([r]) => { if(r.error) throw r.error; HPL.d = r.data; HPL.t = Date.now(); HPL.err = null;
      if(!HPL.tag || !(HPL.d.tage || []).some(t => t.datum === HPL.tag)) HPL.tag = ((HPL.d.tage || [])[0] || {}).datum || null; return HPL.d; },
    e => { HPL.err = e.message || String(e); return null; }).finally(() => { HPL.busy = null; });
  return HPL.busy; }

// Karte „Helferplan“ (Helfer-Bereich und Mein Spieltag)
function hplKarte(ort){
  const box = document.createElement('div'); box.className = 'card hpl'; box.dataset.hpl = ort; box.dataset.ma = 'helfer';
  box.innerHTML = '<div class="empty">Lade den Helferplan …</div>';
  hplLaden().then(() => hplZeichnen(box));
  box.addEventListener('click', e => { const b = e.target.closest('#hplImp'); if(b && !b.disabled) hplImport(box, b); });   // 0.90: Abgleich anstoßen
  return box; }
function hplZeichnen(box){
  if(!box || !box.isConnected && box.dataset.gezeichnet) return; box.dataset.gezeichnet = 1;
  if(!HPL.d){ box.innerHTML = `<h3 class="trh">${SVI('users')} Helferplan</h3><p class="note">${HPL.err ? 'Der Helferplan lädt gerade nicht. Prüf die Verbindung und versuch es gleich noch mal.' : 'Lade …'}</p>`; return; }
  const T = HPL.d.tage || [], t = T.find(x => x.datum === HPL.tag) || T[0], orga = !!HPL.d.orga;
  if(!t){ box.innerHTML = `<h3 class="trh">${SVI('users')} Helferplan</h3><p class="note">In den nächsten Wochen steht kein Spiel der Ersten oder Zweiten im Kalender. Sobald fussball.de den Spielplan meldet, erscheinen die Aufgaben hier.</p>${hplStandText()}`; return; }
  const offen = hplOffen(t), meine = hplMeine(t), gruppen = ['g', '1', '2', 'f'].filter(g => t.aufgaben.some(a => a.bereich === g));
  const zeile = a => { const N = a.namen || [], ich = N.some(n => n.mein);
    return `<div class="hpl-a${N.length ? '' : ' leer'}"><div class="hpl-at"><b>${hplE(a.titel)}</b>${a.hinweis ? `<small>${hplE(a.hinweis)}</small>` : ''}
        <div class="hpl-n">${N.length ? N.map(n => `<span class="hpl-p${n.mein ? ' ich' : ''}">${hplE(n.n)}${orga || n.mein ? `<button type="button" data-hplx="${hplE(n.id)}" aria-label="${hplE(n.n)} austragen">×</button>` : ''}</span>`).join('') : '<span class="hpl-frei">noch frei</span>'}</div></div>
      <button type="button" class="btn ghost sm hpl-ein${ich ? ' raus' : ''}" data-hpla="${a.bereich}|${a.key}" data-an="${ich ? 0 : 1}">${ich ? 'Austragen' : `${SVI('plus')} Eintragen`}</button></div>`; };
  box.innerHTML = `<div class="hpl-kopf"><h3 class="trh">${SVI('users')} Helferplan</h3><span class="hpl-off${offen ? '' : ' ok'}">${offen ? offen + ' unbesetzt' : 'alles besetzt'}</span></div>${hplStandText()}
    <div class="hpl-tage" role="tablist" aria-label="Spieltag">${T.slice(0, 8).map(x => `<button type="button" role="tab" class="${x.datum === t.datum ? 'on' : ''}" aria-selected="${x.datum === t.datum}" data-hplt="${x.datum}"><b>${hplE(hplTag(x.datum))}</b><small>${(x.spiele || []).some(s => s.heim) ? 'Heim' : 'Auswärts'}${hplOffen(x) ? ' · ' + hplOffen(x) + ' frei' : ''}</small></button>`).join('')}</div>
    <p class="note hpl-sp">${hplE(hplSpiele(t))}</p>
    <details class="hpl-mein"${HPL.meinAuf ? ' open' : ''}><summary>Meine Aufgaben (${meine.length})</summary>${meine.length ? `<ul>${meine.map(a => `<li>${hplE(a.titel)} <small>${hplE(HPL_GRUPPE[a.bereich])}</small></li>`).join('')}</ul>` : '<p class="note">Du bist an diesem Tag noch nicht eingetragen.</p>'}</details>
    ${gruppen.map(g => `<section class="hpl-g"><h4>${hplE(HPL_GRUPPE[g])}</h4>${t.aufgaben.filter(a => a.bereich === g).map(zeile).join('')}</section>`).join('')}
    ${orga ? `<div class="hpl-orga" id="hplOrga"></div>` : ''}`;
  box.querySelectorAll('[data-hplt]').forEach(b => b.onclick = () => { HPL.tag = b.dataset.hplt; hplZeichnen(box); });
  const md = box.querySelector('.hpl-mein'); if(md) md.ontoggle = () => { HPL.meinAuf = md.open; };
  box.querySelectorAll('[data-hpla]').forEach(b => b.onclick = () => { const [ber, key] = b.dataset.hpla.split('|');
    if(orga && b.dataset.an === '1') return hplWer(box, t, ber, key, b);
    hplSetzen(box, t.datum, ber, key, b.dataset.an === '1', null, null, b); });
  box.querySelectorAll('[data-hplx]').forEach(b => b.onclick = async () => {
    const sp = b.closest('.hpl-p'); if(sp && !sp.classList.contains('ich') && !confirm(b.getAttribute('aria-label').replace(' austragen', '') + ' aus dieser Aufgabe austragen?')) return;
    b.disabled = true;
    const { error } = await SVB.sb.rpc('hp_entfernen', { p_id:b.dataset.hplx }); if(error){ b.disabled = false; return kToast('⚠️ ' + error.message); }
    await hplLaden(true); hplZeichnen(box); kToast('✓ Ausgetragen'); });
  if(orga) hplOrga(box, t);
}
async function hplSetzen(box, datum, ber, key, an, helfer, name, knopf){
  if(knopf) knopf.disabled = true;
  const { error } = await SVB.sb.rpc('hp_setzen', { p_datum:datum, p_bereich:ber, p_aufgabe:key, p_an:an, p_helfer:helfer || null, p_name:name || null });
  if(error){ if(knopf) knopf.disabled = false; return kToast('⚠️ ' + error.message); }
  try{ navigator.vibrate && navigator.vibrate(12); }catch(e){}
  await hplLaden(true); hplZeichnen(box); kToast(an ? '✓ Eingetragen' : '✓ Ausgetragen'); }
// Orga: wen eintragen? Mich, jemand aus dem Helferpool oder ein Name
async function hplWer(box, t, ber, key, knopf){
  const a = t.aufgaben.find(x => x.bereich === ber && x.key === key); if(!a) return;
  svModal(`<div class="mhead"><div class="rm-ic" style="width:46px;height:46px">${SVI('users')}</div><div><h2 style="margin:0">${hplE(a.titel)}</h2><div class="msub">${hplE(hplTag(t.datum))} · ${hplE(HPL_GRUPPE[ber])}</div></div></div>
    <div class="hpl-wer"><button type="button" class="btn" id="hplIch">Mich eintragen</button>
      <label class="field"><span>Aus dem Helferpool</span><input id="hplQ" type="search" placeholder="Name eintippen" autocomplete="off"></label><div class="chips" id="hplL"><span class="note small">Lade …</span></div>
      <label class="field"><span>Oder nur den Namen</span><input id="hplN" maxlength="80" placeholder="Vor- und Nachname"></label><button type="button" class="btn ghost" id="hplNOk">Name eintragen</button></div>`);
  const fertig = async (helfer, name) => { closeOverlay(); await hplSetzen(box, t.datum, ber, key, true, helfer, name, knopf); };
  document.getElementById('hplIch').onclick = () => fertig(null, null);
  document.getElementById('hplNOk').onclick = () => { const n = document.getElementById('hplN').value.trim(); if(n.length < 2) return kToast('Bitte Vor- und Nachname eintragen'); fertig(null, n); };
  let pool = (HPL.ant[t.datum] && HPL.ant[t.datum].pool) || null;
  if(!pool){ const r = await SVB.sb.rpc('hp_antworten_liste', { p_datum:t.datum }); if(!r.error && r.data){ HPL.ant[t.datum] = r.data; pool = r.data.pool; }
    else { const L0 = document.getElementById('hplL'); if(L0) L0.innerHTML = '<span class="note small">Der Helferpool lädt gerade nicht. Name unten eintippen geht trotzdem.</span>'; return; } }
  const zu = new Set(((HPL.ant[t.datum] || {}).antworten || []).filter(x => x.antwort === 'ja').map(x => x.helfer));
  const L = document.getElementById('hplL'), Q = document.getElementById('hplQ'); if(!L) return;
  const zeigen = () => { const q = Q.value.trim().toLowerCase(), drin = new Set((a.namen || []).map(n => n.n.toLowerCase()));
    const X = (pool || []).filter(h => !drin.has(h.name.toLowerCase()) && (!q || h.name.toLowerCase().includes(q))).sort((x, y) => (zu.has(y.id) - zu.has(x.id)) || (y.heimspieltag - x.heimspieltag)).slice(0, 14);
    L.innerHTML = X.length ? X.map(h => `<button type="button" class="pchip${zu.has(h.id) ? ' on' : ''}" data-hplh="${hplE(h.id)}">${hplE(h.name)}${zu.has(h.id) ? ' <small>hat zugesagt</small>' : ''}</button>`).join('') : '<span class="note small">Niemand gefunden.</span>';
    L.querySelectorAll('[data-hplh]').forEach(b => b.onclick = () => fertig(b.dataset.hplh, null)); };
  Q.oninput = zeigen; zeigen();
}
// Orga: Zu- und Absagen, Anfrage vor dem Spieltag
async function hplOrga(box, t){
  const O = box.querySelector('#hplOrga'); if(!O) return;
  const c = HPL.d.cfg || {};
  let A = HPL.ant[t.datum]; if(!A){ const r = await SVB.sb.rpc('hp_antworten_liste', { p_datum:t.datum }); if(!r.error && r.data){ A = HPL.ant[t.datum] = r.data; } }
  if(!O.isConnected) return;
  const ja = ((A || {}).antworten || []).filter(x => x.antwort === 'ja'), nein = ((A || {}).antworten || []).filter(x => x.antwort === 'nein'), vl = ((A || {}).antworten || []).filter(x => x.antwort === 'vielleicht');
  O.innerHTML = `<section class="hpl-g hpl-ant"><h4>Rückmeldungen</h4>
      <p class="note">${A ? `${A.gefragt ? A.gefragt + ' Helfer per WhatsApp gefragt. ' : ''}${ja.length} helfen mit, ${vl.length} vielleicht, ${nein.length} diesmal nicht.` : 'Die Rückmeldungen laden gerade nicht. Öffne den Helferplan gleich noch mal.'}</p>
      ${ja.length ? `<p class="hpl-n">${ja.map(x => `<span class="hpl-p ok">${hplE(x.name)}</span>`).join('')}</p>` : ''}
      ${nein.length ? `<p class="hpl-n">${nein.map(x => `<span class="hpl-p nein">${hplE(x.name)}</span>`).join('')}</p>` : ''}</section>
    <details class="hpl-set"><summary>Anfrage vor dem Spieltag ${c.aktiv ? '<span class="hpl-off ok">an</span>' : '<span class="hpl-off">aus</span>'}</summary>
      <p class="note">Vor jedem Heimspieltag bekommen alle Helfer mit Bereich „Heimspieltag“ und Handynummer eine WhatsApp: „Hilfst du mit?“ mit ihrem persönlichen Link. Wer schon geantwortet hat oder sich abgemeldet hat, bekommt nichts. Mit Testnummer kommt je Spieltag genau eine Beispielnachricht an diese Nummer, ohne echten Link. Echte Helfer anschreiben schaltet der Admin frei.</p>
      <div class="hpl-form"><label class="kbchk"><input type="checkbox" id="hplAn"${c.aktiv ? ' checked' : ''}> Anfrage verschicken</label>
        <label class="field"><span>Tage vorher</span><select id="hplTv">${[2, 3, 4, 5, 6, 7].map(n => `<option value="${n}"${+c.tage_vorher === n ? ' selected' : ''}>${n} Tage</option>`).join('')}</select></label>
        <label class="field"><span>ab</span><select id="hplSt">${[10, 12, 16, 17, 18, 19, 20].map(n => `<option value="${n}"${+c.stunde === n ? ' selected' : ''}>${n}:00 Uhr</option>`).join('')}</select></label>
        <label class="field"><span>Testnummer (leer = echte Helfer)</span><input id="hplTel" inputmode="tel" maxlength="20" value="${hplE(c.test_tel || '')}" placeholder="0171 1234567"></label></div>
      <div class="btnrow"><button type="button" class="btn" id="hplCfg">Speichern</button>${typeof maRufen === 'function' ? '' : ''}</div></details>`;
  const s = O.querySelector('#hplCfg'); if(s) s.onclick = async () => { s.disabled = true;
    const p = { aktiv:O.querySelector('#hplAn').checked, tage_vorher:+O.querySelector('#hplTv').value, stunde:+O.querySelector('#hplSt').value, test_tel:O.querySelector('#hplTel').value.trim() };
    if(p.aktiv && !p.test_tel && !confirm('Ab jetzt bekommen echte Helfer vor jedem Heimspieltag eine WhatsApp mit ihrem Link. Einschalten?')){ s.disabled = false; return; }
    const { data, error } = await SVB.sb.rpc('hp_cfg_setzen', { p }); s.disabled = false; if(error) return kToast('⚠️ ' + error.message);
    HPL.d.cfg = data; kToast(data.aktiv ? (data.test_tel ? '✓ Gespeichert: Anfragen gehen nur an die Testnummer' : '✓ Gespeichert: Anfragen gehen an die Helfer') : '✓ Gespeichert: Anfrage ist aus'); hplOrga(box, t); };
}
// 0.90: Abgleich mit Lukas' Helferplan läuft auf dem Server alle 15 Minuten, die Orga kann ihn hier sofort anstoßen
// 0.90: Abgleich läuft auf dem Server (alle 15 Minuten), der Knopf stößt ihn sofort an
function hplStandText(){ const a = HPL.stand, orga = !!(HPL.d && HPL.d.orga); if(!a || !a.at) return orga ? `<p class="note small hpl-sync"><button type="button" class="btn ghost sm hpl-sk" id="hplImp">Mit Lukas' Helferplan abgleichen</button></p>` : '';
  const min = Math.max(0, Math.round((Date.now() - new Date(a.at).getTime()) / 60000)), wann = min < 1 ? 'gerade eben' : min < 60 ? `vor ${min} Min.` : `am ${new Date(a.at).toLocaleString('de-DE', { day:'2-digit', month:'2-digit', hour:'2-digit', minute:'2-digit', timeZone:'Europe/Berlin' })} Uhr`;
  if(!a.ok && !orga) return '';   // Störungen sieht nur die Orga, sie kann etwas tun
  const txt = a.ok ? `Abgeglichen mit Lukas' Helferplan ${wann}.`
    : a.fehler === 'zu-viel-weg' ? `Abgleich angehalten (${wann}): In Lukas' Helferplan fehlen auf einmal viele Einträge. Bitte dort nachsehen, danach hier neu abgleichen.`
    : `Abgleich mit Lukas' Helferplan klappt gerade nicht (${wann} versucht). Später noch mal abgleichen, sonst Albert Bescheid geben.`;
  const weg = (orga && (a.aufgaben || []).length ? ` Neu von Lukas übernommen: ${hplE(a.aufgaben.join(', '))}.` : '')
    + (orga && (a.nicht_erkannt || []).length ? ` Nicht übernommen: ${hplE(a.nicht_erkannt.join(', '))}.` : '');
  return `<p class="note small hpl-sync${a.ok ? '' : ' warn'}">${txt}${weg}${orga ? ` <button type="button" class="btn ghost sm hpl-sk" id="hplImp">Jetzt abgleichen</button>` : ''}</p>`; }
async function hplImport(box, knopf){
  knopf.disabled = true; knopf.textContent = 'Gleiche ab …';
  try{ const d = await maRufen({ quelle:'helfer', art:'abgleich' });
    await hplLaden(true); await SVB.sb.rpc('hp_abgleich_stand').then(r => { HPL.stand = r.data || HPL.stand; }).catch(() => {}); hplZeichnen(box);
    kToast(d.gebremst ? '⚠️ Abgleich angehalten: in Lukas\' Helferplan fehlen auf einmal viele Einträge' : d.gerade ? '✓ Ist schon aktuell, gerade erst abgeglichen' : `✓ Abgeglichen: ${d.neu || 0} neu, ${d.weg || 0} entfernt` + ((d.aufgaben || []).length ? `, ${d.aufgaben.length === 1 ? '1 Aufgabe' : d.aufgaben.length + ' Aufgaben'} von Lukas übernommen` : '')); }
  catch(e){ kToast('⚠️ Abgleich ging nicht: ' + (typeof maFehlerText === 'function' ? maFehlerText(e) : e.message)); knopf.disabled = false; knopf.textContent = 'Jetzt abgleichen'; } }

// Einhängen: Helfer-Bereich (statt der Mini-App-Karte) und „Mein Spieltag“
if(typeof maHelferKarte === 'function') maHelferKarte = function(){ return hplKarte('helfer'); };
{ const _sr85 = sptRender; sptRender = async function(){ const r = await _sr85.apply(this, arguments);
  try{ const P = sptPanel(); if(P && svCurTab() === 'sptag' && !P.querySelector('[data-hpl]')) P.appendChild(hplKarte('sptag')); }catch(e){ console.warn('Helferplan', e); }
  return r; }; }

/* ---------- Einladung zusätzlich per E-Mail (0.88) ----------
   Bisher gab die App nur den Link zurück; wer ihn nicht teilte, bekam nichts. Jetzt verschickt der Server die Einladung
   und neue Links auch selbst per E-Mail (admin-users mit mail:true, Resend), und die Box sagt, ob die Mail raus ist. */
const HPL_MAIL = { letzt:null };
if(typeof SVB !== 'undefined' && SVB.admin){ const _ad85 = SVB.admin; SVB.admin = async function(action, payload){
  if(action === 'invite' || action === 'link') payload = Object.assign({ mail:true }, payload || {});
  const r = await _ad85.call(this, action, payload);
  if(action === 'invite' || action === 'link') HPL_MAIL.letzt = { mail:r && r.mail, email:(payload && payload.email) || null, t:Date.now() };
  return r; }; }
if(typeof svLinkBox === 'function'){ const _lb85 = svLinkBox; svLinkBox = function(link, name){ const r = _lb85.apply(this, arguments);
  try{ const m = HPL_MAIL.letzt, box = document.querySelector('#svInvOut .linkbox'); if(m && box && Date.now() - m.t < 15000){
    const p = document.createElement('p'); p.className = 'note hpl-mailst ' + (m.mail === 'gesendet' ? 'ok' : 'warn');
    p.textContent = m.mail === 'gesendet' ? '✓ Die E-Mail mit dem Link ist raus' + (m.email ? ' an ' + m.email : '') + '. Teilen per WhatsApp geht zusätzlich.' : m.mail === 'fehler' ? 'Die E-Mail ging gerade nicht raus. Teil den Link bitte per WhatsApp oder Mail.' : 'Den Link bitte per WhatsApp oder Mail teilen.';
    box.insertBefore(p, box.querySelector('code')); HPL_MAIL.letzt = null; } }catch(e){}
  return r; }; }

(function(){ try{ const s=document.createElement('style'); s.id='svm85css'; s.textContent="/* Beta 0.88 · Helferplan */\n.hpl{padding:14px 16px;}\n.hpl-kopf{display:flex;align-items:center;justify-content:space-between;gap:10px;flex-wrap:wrap;}\n.hpl-kopf .trh{margin:0;}\n.hpl-off{display:inline-flex;align-items:center;gap:6px;font-size:12.5px;font-weight:800;padding:3px 10px;border-radius:999px;background:rgba(232,116,31,.14);color:var(--ink);}\n.hpl-off::before{content:\"\";width:7px;height:7px;border-radius:50%;background:#e8741f;}\n.hpl-off.ok{background:rgba(34,197,94,.14);}\n.hpl-off.ok::before{background:#22c55e;}\n.hpl-tage{display:flex;gap:8px;overflow-x:auto;-webkit-overflow-scrolling:touch;margin:12px 0 4px;padding-bottom:4px;scrollbar-width:none;}\n.hpl-tage::-webkit-scrollbar{display:none;}\n.hpl-tage button{flex:none;min-height:52px;padding:6px 12px;border-radius:12px;border:1px solid var(--line);background:var(--surface);color:var(--ink);font:inherit;text-align:left;cursor:pointer;}\n.hpl-tage button b{display:block;font-size:14px;}\n.hpl-tage button small{display:block;font-size:12px;color:var(--ink2);}\n.hpl-tage button.on{border-color:var(--brand2);box-shadow:inset 0 0 0 1px var(--brand2);}\n.hpl-sp{margin:6px 0 10px;}\n.hpl-mein{border-top:1px solid var(--line);border-bottom:1px solid var(--line);padding:2px 0;margin-bottom:12px;}\n.hpl-mein summary{min-height:44px;display:flex;align-items:center;font-weight:700;cursor:pointer;}\n.hpl-mein ul{margin:0 0 10px;padding-left:18px;}\n.hpl-mein li small{color:var(--ink2);margin-left:6px;}\n.hpl-g{border:1px solid var(--line);border-radius:12px;overflow:hidden;margin-bottom:12px;}\n.hpl-g>h4{margin:0;padding:10px 12px;font-size:14px;font-weight:800;background:var(--surface3);border-bottom:1px solid var(--line);}\n.hpl-g>.note,.hpl-g>p{padding:0 12px;}\n.hpl-a{display:grid;grid-template-columns:minmax(0,1fr) auto;align-items:center;gap:10px;padding:10px 12px;}\n.hpl-a+.hpl-a{border-top:1px solid var(--line);}\n.hpl-at b{font-size:15px;hyphens:auto;-webkit-hyphens:auto;overflow-wrap:anywhere;}\n.hpl-at small{display:block;color:var(--ink2);font-size:12.5px;margin-top:2px;}\n.hpl-n{display:flex;flex-wrap:wrap;gap:4px 10px;margin-top:4px;font-size:13.5px;color:var(--ink2);}\n.hpl-p{display:inline-flex;align-items:center;gap:2px;}\n.hpl-p.ich{color:var(--ink);font-weight:700;}\n.hpl-p.ok{color:var(--ink);}\n.hpl-p.nein{text-decoration:line-through;}\n.hpl-p button{border:0;background:none;color:var(--ink2);font-size:16px;line-height:1;min-width:40px;min-height:40px;margin:-8px 0;cursor:pointer;border-radius:8px;}\n.hpl-p button:hover{background:var(--surface3);}\n.hpl-frei{color:#fdba74;font-weight:600;}\nhtml[data-theme=\"hell\"] .hpl-frei{color:#c2410c;}\n.hpl-a.leer .hpl-at b{color:var(--ink);}\n.card.hpl .hpl-a .btn.hpl-ein{min-height:44px!important;white-space:nowrap;}\n.hpl .hpl-ein.raus{color:var(--ink2);}\n.hpl-set{border:1px solid var(--line);border-radius:12px;padding:0 12px 12px;}\n.hpl-set summary{min-height:48px;display:flex;align-items:center;gap:8px;font-weight:800;cursor:pointer;}\n.hpl-form{display:grid;grid-template-columns:repeat(auto-fit,minmax(150px,1fr));gap:10px;align-items:end;margin:10px 0;}\n.hpl-form .field{display:flex;flex-direction:column;gap:4px;font-size:13px;color:var(--ink2);}\n.hpl-form select,.hpl-form input:not([type=checkbox]),.hpl-wer input{min-height:44px;padding:8px 10px;border-radius:10px;border:1px solid var(--line);background:var(--surface3);color:var(--ink);font:inherit;}\n.hpl-wer{display:flex;flex-direction:column;gap:10px;margin-top:12px;}\n.hpl-wer .field{display:flex;flex-direction:column;gap:4px;font-size:13px;color:var(--ink2);}\n@media (max-width:560px){ .hpl{padding:12px;} .hpl-a{gap:8px;padding:10px;} .card.hpl .hpl-a .btn.hpl-ein{padding:0 10px!important;} }\n.hpl-wer .chips{display:flex;flex-wrap:wrap;gap:8px;}\n.hpl-wer .pchip{min-height:44px;}\n.hpl-mailst{margin:8px 0;font-weight:600;} .hpl-mailst.ok{color:var(--ink);} .hpl-mailst.warn{color:#fdba74;} html[data-theme=\"hell\"] .hpl-mailst.warn{color:#c2410c;}\n.hpl-sync{margin:4px 0 0;color:var(--ink2);display:flex;flex-wrap:wrap;align-items:center;gap:6px 10px;}\n.card p.hpl-sync.warn{color:#f59e0b!important;} html[data-theme=\"hell\"] .card p.hpl-sync.warn{color:#b45309!important;}\n.hpl-sync .hpl-sk{min-height:40px;}\n"; document.head.appendChild(s); }catch(e){} })();
/* Beta 0.89 · Planung als Board (Wunsch von Albert, 06.11.2026)
   Aufgaben und Projekte in Spalten: In Vorbereitung, In Bearbeitung, Offene Punkte, Erledigt (Projekte: Geplant, Läuft, Pausiert, Fertig).
   Karten per Ziehen in die nächste Spalte schieben oder auf eine Person ziehen, dann ist sie zuständig. Alle sehen es sofort.
   Ohne Maus: Karte antippen und „Verschieben“ wählen. Gleiche Daten und Rechte wie die Planung (svm44.js, svm75.js, 112_aufgaben_prio.sql). */
const BRD = { art:'aufgaben', bereich:'alle', projekt:'alle', wer:'alle', zieh:null };
const BRD_A = [['idee', 'Ideen', '#a78bfa'], ['offen', 'In Vorbereitung', '#94a3b8'], ['arbeit', 'In Bearbeitung', '#3b82f6'], ['wartet', 'Offene Punkte', '#f59e0b'], ['erledigt', 'Erledigt', '#22c55e']];
const BRD_P = [['idee', 'Idee', '#a78bfa'], ['geplant', 'Geplant', '#94a3b8'], ['laeuft', 'Läuft', '#3b82f6'], ['pausiert', 'Pausiert', '#f59e0b'], ['fertig', 'Fertig', '#22c55e']];
const brdE = s => svEsc(s == null ? '' : String(s));
function brdKurz(n){ const w = String(n || '').trim().split(/\s+/), v = w[0] || '';
  // gleicher Vorname mehrmals: mit Anfangsbuchstaben des Nachnamens
  const doppelt = ((PL.d && PL.d.leute) || []).filter(l => String(l.name || '').trim().split(/\s+/)[0] === v).length > 1;
  return doppelt && w.length > 1 ? v + ' ' + w[w.length - 1][0] + '.' : v; }
function brdIni(n){ const w = String(n || '').trim().split(/\s+/); return ((w[0] || '')[0] || '') + ((w[1] || '')[0] || ''); }
// Leute: ich zuerst, dann wer die meisten offenen Aufgaben hat, dann alphabetisch
function brdLeute(){ const ich = PL.d && PL.d.ich, n = id => plAuf().filter(a => a.status !== 'erledigt' && (a.wer === id || (a.mit || []).includes(id))).length;
  return ((PL.d && PL.d.leute) || []).filter(l => l.id && l.name).map(l => ({ l, n:n(l.id) })).sort((a, b) => ((b.l.id === ich) - (a.l.id === ich)) || (b.n - a.n) || String(a.l.name).localeCompare(String(b.l.name), 'de')).map(x => x.l); }
function brdAufgaben(){
  const vor14 = plIso(new Date(Date.now() - 14 * 864e5));
  return plAuf().filter(a => (BRD.bereich === 'alle' || a.bereich === BRD.bereich) && (BRD.projekt === 'alle' || (BRD.projekt === 'ohne' ? !a.projekt : a.projekt === BRD.projekt))
    && (BRD.wer === 'alle' || a.wer === BRD.wer || (a.mit || []).includes(BRD.wer))
    && (a.status !== 'erledigt' || !a.erledigt_am || plIso(new Date(a.erledigt_am)) >= vor14)); }
// Reihenfolge in der Spalte: zuerst die von Hand gezogene (sort), dann Stufe, dann Fälligkeit
function brdSpalte(L, k){
  const X = L.filter(x => x.status === k); if(BRD.art !== 'aufgaben') return X;
  return X.sort((a, b) => ((a.sort || 0) - (b.sort || 0)) || (prioStufe(a) - prioStufe(b))
    || (plTage(a.faellig) == null) - (plTage(b.faellig) == null) || ((plTage(a.faellig) || 0) - (plTage(b.faellig) || 0))); }
function brdProjekte(){ return plPro().filter(p => p.status !== 'verworfen' && (BRD.bereich === 'alle' || p.bereich === BRD.bereich) && (BRD.wer === 'alle' || p.verantwortlich === BRD.wer)); }

function brdKarteA(a){
  const s = prioStufe(a), erl = a.status === 'erledigt', t = plTage(a.faellig), ueber = !erl && a.faellig && t < 0, nm = prioNamen(a), pr = a.projekt ? plProj(a.projekt) : null;
  return `<article class="brd-k s${s}${erl ? ' erl' : ''}" data-brdk="${brdE(a.id)}" tabindex="0" aria-label="${brdE(a.titel)}">
    <span class="brd-griff" data-brdg title="Ziehen: in eine andere Spalte, an eine andere Stelle oder auf eine Person" aria-hidden="true">${SVI('griff')}</span>
    <b>${brdE(a.titel)}</b>
    <div class="brd-m">${s <= 2 && !erl ? `<span class="prio-st s${s}">${PRIO_ST[s]}</span>` : ''}${a.faellig && !erl ? `<span class="${ueber ? 'rot' : ''}">${brdE(prioWann(a))}</span>` : ''}${pr ? `<span>${brdE(pr.titel)}</span>` : ''}${a.status === 'wartet' && a.wartet_auf ? `<span>wartet auf ${brdE(a.wartet_auf)}</span>` : ''}</div>
    <div class="brd-wer">${nm.length ? nm.slice(0, 3).map(n => `<i title="${brdE(n)}">${brdE(brdIni(n))}</i>`).join('') + `<small>${brdE(nm.map(brdKurz).join(', '))}</small>` : '<small class="brd-nie">Noch niemand</small>'}</div></article>`; }
function brdKarteP(p){
  const offen = plAuf().filter(a => a.projekt === p.id && a.status !== 'erledigt').length, alle = plAuf().filter(a => a.projekt === p.id).length, wer = p.verantwortlich_name || p.verantwortlich_text || '';
  return `<article class="brd-k amp-${brdE(p.ampel || 'gruen')}" data-brdk="${brdE(p.id)}" tabindex="0" aria-label="${brdE(p.titel)}">
    <span class="brd-griff" data-brdg title="Ziehen: in eine andere Spalte oder auf eine Person" aria-hidden="true">${SVI('griff')}</span>
    <b>${brdE(p.titel)}</b>
    <div class="brd-m"><span>${brdE((PL_B[p.bereich] || {}).t || '')}</span>${alle ? `<span>${alle - offen} von ${alle} Aufgaben erledigt</span>` : ''}${p.ende ? `<span>bis ${brdE(prioDatum(p.ende))}</span>` : ''}</div>
    ${alle ? `<div class="brd-bar"><i style="width:${Math.round((alle - offen) / alle * 100)}%"></i></div>` : ''}
    <div class="brd-wer">${wer ? `<i>${brdE(brdIni(wer))}</i><small>${brdE(brdKurz(wer))}</small>` : '<small class="brd-nie">Noch niemand</small>'}</div></article>`; }

function brdSeite(R){
  if(BRD.zieh && BRD.zieh.bewegt && R.contains(document.querySelector('.brd-weg'))){ BRD.spaeter = true; return; }   // während des Ziehens nicht neu zeichnen (Daten kommen im Hintergrund)
  const B = plBer(), aufg = BRD.art === 'aufgaben', SP = aufg ? BRD_A : BRD_P, L = aufg ? brdAufgaben() : brdProjekte();
  const spalten = SP.filter(([k]) => k !== 'idee' || L.some(x => x.status === 'idee'));
  const leute = brdLeute();
  R.innerHTML = `<div class="brd">
    <div class="brd-leiste">
      <div class="prio-seg" role="tablist" aria-label="Was"><button type="button" data-brda="aufgaben" class="${aufg ? 'on' : ''}" aria-selected="${aufg}">Aufgaben</button><button type="button" data-brda="projekte" class="${!aufg ? 'on' : ''}" aria-selected="${!aufg}">Projekte</button></div>
      <label class="brd-f"><span>Bereich</span><select id="brdB"><option value="alle">Alle Bereiche</option>${B.map(k => `<option value="${brdE(k)}"${BRD.bereich === k ? ' selected' : ''}>${brdE((PL_B[k] || {}).t || k)}</option>`).join('')}</select></label>
      ${aufg ? `<label class="brd-f"><span>Projekt</span><select id="brdP"><option value="alle">Alle</option><option value="ohne"${BRD.projekt === 'ohne' ? ' selected' : ''}>Ohne Projekt</option>${plPro().filter(p => p.status !== 'verworfen' && p.status !== 'fertig' && (BRD.bereich === 'alle' || p.bereich === BRD.bereich)).map(p => `<option value="${brdE(p.id)}"${BRD.projekt === p.id ? ' selected' : ''}>${brdE(p.titel)}</option>`).join('')}</select></label>` : ''}
      <button type="button" class="btn sm" id="brdNeu">${SVI('plus')} ${aufg ? 'Aufgabe' : 'Projekt'}</button></div>
    ${leute.length ? `<div class="brd-leute" aria-label="Zuständig: Karte auf eine Person ziehen"><span class="brd-lt">Zuschieben an</span>${leute.map(l => `<button type="button" class="brd-l${BRD.wer === l.id ? ' on' : ''}" data-brdl="${brdE(l.id)}" aria-pressed="${BRD.wer === l.id}" title="${brdE(l.name)}: antippen filtert, Karte hierher ziehen macht zuständig"><i>${brdE(brdIni(l.name))}</i>${brdE(brdKurz(l.name))}</button>`).join('')}${BRD.wer !== 'alle' ? '<button type="button" class="brd-l alle" data-brdl="alle">Alle zeigen</button>' : ''}</div>` : ''}
    <div class="brd-phasen" aria-label="Phasen">${spalten.map(([k, t, c]) => `<button type="button" data-brdph="${k}" style="--c:${c}"><span>${brdE(t)}</span><i>${brdSpalte(L, k).length}</i></button>`).join('')}</div>
    <div class="brd-sp" style="--n:${spalten.length}">${spalten.map(([k, t, c]) => { const X = brdSpalte(L, k);
      return `<section class="brd-s" data-brdsp="${k}" style="--c:${c}"><h3><span>${brdE(t)}</span><i>${X.length}</i></h3><div class="brd-l1" data-brdliste>${X.length ? X.map(aufg ? brdKarteA : brdKarteP).join('') : '<p class="brd-leer">Hierher ziehen</p>'}</div></section>`; }).join('')}</div>
    <p class="note small">Karte am Griff ziehen: in eine andere Spalte, an eine andere Stelle oder auf eine Person. Am Handy die Karte kurz gedrückt halten, dann ziehen, oder antippen und „Verschieben“ wählen. Erledigtes bleibt 14 Tage stehen.</p></div>`;
  // Leute-Leiste bleibt beim Scrollen sichtbar (unter der Kopfzeile), damit man Karten auch aus langen Spalten zuschieben kann
  try{ const lt = R.querySelector('.brd-leute'); if(lt){ let top = 0; document.querySelectorAll('.topbar, .pl-nav').forEach(el => { const cs = getComputedStyle(el); if(/sticky|fixed/.test(cs.position) && el.offsetHeight) top = Math.max(top, (parseFloat(cs.top) || 0) + el.offsetHeight); }); lt.style.top = top + 'px'; } }catch(e){}
  R.querySelectorAll('[data-brda]').forEach(b => b.onclick = () => { BRD.art = b.dataset.brda; brdSeite(R); });
  const sb = R.querySelector('#brdB'); if(sb) sb.onchange = () => { BRD.bereich = sb.value; BRD.projekt = 'alle'; brdSeite(R); };
  const sp = R.querySelector('#brdP'); if(sp) sp.onchange = () => { BRD.projekt = sp.value; brdSeite(R); };
  R.querySelectorAll('[data-brdl]').forEach(b => b.onclick = () => { BRD.wer = BRD.wer === b.dataset.brdl ? 'alle' : b.dataset.brdl; brdSeite(R); });
  R.querySelector('#brdNeu').onclick = () => { const b = BRD.bereich !== 'alle' ? BRD.bereich : prioStdBereich();
    if(aufg) plAufgabeOeffnen(null, Object.assign({ bereich:b }, BRD.projekt !== 'alle' && BRD.projekt !== 'ohne' ? { projekt:BRD.projekt } : {})); else plProjektOeffnen(null, { bereich:b }); };
  R.querySelectorAll('[data-brdk]').forEach(k => { k.onclick = e => { if((BRD.zieh && BRD.zieh.bewegt) || Date.now() < (BRD.ruhe || 0)) return; brdMenue(R, k.dataset.brdk); };
    k.onkeydown = e => { if(e.key === 'Enter' || e.key === ' '){ e.preventDefault(); brdMenue(R, k.dataset.brdk); } };
    brdZiehen(R, k); });
  brdPhasen(R);
}
// Phasen-Leiste: am Handy steht immer nur eine Spalte im Bild, hier stehen alle. Antippen springt zur Spalte.
function brdPhasen(R){
  const S = R.querySelector('.brd-sp'), PH = R.querySelector('.brd-phasen'); if(!S || !PH) return;
  PH.querySelectorAll('[data-brdph]').forEach(b => b.onclick = () => { const s = S.querySelector(`[data-brdsp="${b.dataset.brdph}"]`);
    if(s) S.scrollTo({ left: s.offsetLeft - S.offsetLeft - 6, behavior: 'smooth' }); });
  const markiere = () => { const mitte = S.scrollLeft + S.clientWidth / 2; let nah = null, d = 1e9;
    S.querySelectorAll('[data-brdsp]').forEach(s => { const m = s.offsetLeft - S.offsetLeft + s.offsetWidth / 2, x = Math.abs(m - mitte); if(x < d){ d = x; nah = s.dataset.brdsp; } });
    PH.querySelectorAll('[data-brdph]').forEach(b => b.classList.toggle('on', b.dataset.brdph === nah)); };
  S.onscroll = markiere; markiere();
}
// Antippen: öffnen oder verschieben (Bedienung ohne Ziehen)
function brdMenue(R, id){
  const aufg = BRD.art === 'aufgaben', x = aufg ? plAuf().find(a => a.id === id) : plProj(id); if(!x) return;
  const SP = aufg ? BRD_A : BRD_P;
  svModal(`<div class="mhead"><div><h2 style="margin:0">${brdE(x.titel)}</h2><div class="msub">${brdE((SP.find(s => s[0] === x.status) || [])[1] || '')}</div></div></div>
    <div class="brd-mn"><h4>Verschieben nach</h4><div class="chips">${SP.filter(([k]) => k !== x.status).map(([k, t, c]) => `<button type="button" class="pchip brd-ch" style="--c:${c}" data-brdz="${k}">${brdE(t)}</button>`).join('')}</div>
      ${brdLeute().length ? `<h4>Zuständig</h4><div class="chips">${brdLeute().map(l => `<button type="button" class="pchip${(aufg ? x.wer : x.verantwortlich) === l.id ? ' on' : ''}" data-brdw="${brdE(l.id)}">${brdE(l.name)}</button>`).join('')}</div>` : ''}
      <div class="btnrow"><button type="button" class="btn ghost" id="brdOf">Alles bearbeiten</button></div></div>`);
  document.querySelectorAll('[data-brdz]').forEach(b => b.onclick = async () => { closeOverlay(); await brdSetzen(R, id, { status:b.dataset.brdz }); });
  document.querySelectorAll('[data-brdw]').forEach(b => b.onclick = async () => { closeOverlay(); await brdSetzen(R, id, { wer:b.dataset.brdw }); });
  document.getElementById('brdOf').onclick = () => { closeOverlay(); aufg ? plAufgabeOeffnen(id) : plProjektOeffnen(id); };
}
// Neue Reihenfolge einer Spalte: die gezogene Karte vor „vor“ einsortieren und die Spalte neu durchnummerieren
async function brdStelle(id, stelle){
  const L = brdAufgaben(), X = brdSpalte(L, stelle.spalte).filter(a => a.id !== id), a = plAuf().find(x => x.id === id);
  if(!a) return;
  const i = stelle.vor ? X.findIndex(x => x.id === stelle.vor) : -1;
  const neu = X.slice(); neu.splice(i < 0 ? neu.length : i, 0, a);
  const ids = neu.map(x => x.id);
  if(ids.every((x, n) => (neu[n].sort || 0) === (n + 1) * 10)) return;   // steht schon so
  await ogRpc('plan_sort_setzen', { p_ids: ids });
  neu.forEach((x, n) => { x.sort = (n + 1) * 10; });
}
async function brdSetzen(R, id, was){
  const aufg = BRD.art === 'aufgaben';
  try{
    if(aufg){ if(was.status || was.wer){ const p = { id }; if(was.status) p.status = was.status; if(was.wer) p.wer = was.wer;
        const n = await ogRpc('plan_aufgabe_speichern', { p }); const folge = n.folge; delete n.folge; plErsetzen('aufgaben', n); if(folge) plErsetzen('aufgaben', folge); }
      if(was.stelle) await brdStelle(id, was.stelle); }
    else { const p = { id }; if(was.status) p.status = was.status; if(was.wer) p.verantwortlich = was.wer;
      plErsetzen('projekte', await ogRpc('plan_projekt_speichern', { p })); }
    try{ navigator.vibrate && navigator.vibrate(12); }catch(e){}
    const sp = (aufg ? BRD_A : BRD_P).find(s => s[0] === was.status), wer = was.wer && (brdLeute().find(l => l.id === was.wer) || {}).name;
    kToast(sp ? '✓ ' + sp[1] : wer ? '✓ Zuständig: ' + wer : was.stelle ? '✓ Neue Reihenfolge' : '✓ Gespeichert');
  }catch(e){ kToast('⚠️ ' + e.message); }
  if(R.isConnected) brdSeite(R);
}
// Ziehen mit Maus, Stift und Finger. Ziel: Spalte, Stelle in der Spalte oder Person.
// Maus und Stift: sofort losziehen. Finger: am Griff sofort, sonst kurz gedrückt halten (250 ms), damit Wischen weiter scrollt.
function brdMarke(){ let m = document.getElementById('brdMarke');
  if(!m){ m = document.createElement('div'); m.id = 'brdMarke'; m.className = 'brd-marke'; } return m; }
function brdZiehen(R, k){
  const griff = k.querySelector('[data-brdg]');
  const losgehts = (e, sofort) => { const r = k.getBoundingClientRect();
    BRD.zieh = { id:k.dataset.brdk, x0:e.clientX, y0:e.clientY, dx:e.clientX - r.left, dy:e.clientY - r.top,
      bewegt:false, geist:null, ziel:null, vor:null, pid:e.pointerId, frei:sofort };
    try{ k.setPointerCapture(e.pointerId); }catch(x){} };
  const start = e => {
    if(e.button !== undefined && e.button !== 0) return;
    const amGriff = !!(e.target.closest && e.target.closest('[data-brdg]'));
    if(e.pointerType === 'mouse' || amGriff){ losgehts(e, true); return; }
    // Finger auf der Karte: erst nach kurzem Halten ziehen, vorher scrollt die Seite wie gewohnt
    losgehts(e, false);
    const Z = BRD.zieh;
    Z.timer = setTimeout(() => { if(BRD.zieh === Z && !Z.bewegt){ Z.frei = true; try{ navigator.vibrate && navigator.vibrate(14); }catch(x){} k.classList.add('brd-bereit'); } }, 250);
  };
  const aufraeumen = Z => { if(Z && Z.timer){ clearTimeout(Z.timer); Z.timer = null; } k.classList.remove('brd-bereit'); };
  const zug = e => { const Z = BRD.zieh; if(!Z || Z.pid !== e.pointerId) return;
    const weg = Math.hypot(e.clientX - Z.x0, e.clientY - Z.y0);
    if(!Z.frei){ if(weg > 8){ aufraeumen(Z); BRD.zieh = null; }   // das war Scrollen, kein Ziehen
      return; }
    if(!Z.bewegt){ if(weg < 6) return; Z.bewegt = true; aufraeumen(Z);
      const g = k.cloneNode(true); g.classList.add('brd-geist'); g.style.width = k.offsetWidth + 'px'; document.body.appendChild(g); Z.geist = g; k.classList.add('brd-weg'); R.classList.add('brd-zieht'); }
    e.preventDefault();
    Z.geist.style.transform = `translate(${e.clientX - Z.dx}px, ${e.clientY - Z.dy}px) rotate(1.5deg)`;
    const el = document.elementFromPoint(e.clientX, e.clientY), ziel = el && (el.closest('[data-brdsp]') || el.closest('[data-brdl]'));
    if(Z.ziel !== ziel){ if(Z.ziel) Z.ziel.classList.remove('brd-hier'); Z.ziel = ziel && R.contains(ziel) && ziel.dataset.brdl !== 'alle' ? ziel : null; if(Z.ziel) Z.ziel.classList.add('brd-hier'); }
    // Stelle in der Spalte: Marke zwischen die Karten setzen
    const m = brdMarke();
    if(Z.ziel && Z.ziel.dataset.brdsp && BRD.art === 'aufgaben'){
      const liste = Z.ziel.querySelector('[data-brdliste]'), karten = liste ? [...liste.querySelectorAll('[data-brdk]')].filter(c => c !== k) : [];
      let vor = null; for(const c of karten){ const b = c.getBoundingClientRect(); if(e.clientY < b.top + b.height / 2){ vor = c; break; } }
      Z.vor = vor; if(liste) liste.insertBefore(m, vor);
    } else { Z.vor = null; m.remove(); }
    // am oberen und unteren Rand die Seite mitscrollen (lange Spalten, Leute oben)
    if(e.clientY < 110) window.scrollBy(0, -14); else if(e.clientY > window.innerHeight - 70) window.scrollBy(0, 14);
    // am Rand automatisch weiterscrollen (Spalten nebeneinander)
    const S = R.querySelector('.brd-sp'); if(S){ const b = S.getBoundingClientRect(); if(e.clientX > b.right - 40) S.scrollLeft += 12; else if(e.clientX < b.left + 40) S.scrollLeft -= 12; } };
  const ende = async e => { const Z = BRD.zieh; if(!Z || Z.pid !== e.pointerId) return;
    aufraeumen(Z); brdMarke().remove();
    if(Z.geist) Z.geist.remove(); k.classList.remove('brd-weg'); R.classList.remove('brd-zieht'); if(Z.ziel) Z.ziel.classList.remove('brd-hier');
    const ziel = Z.ziel, bewegt = Z.bewegt, vor = Z.vor; setTimeout(() => { BRD.zieh = null; }, 0);
    if(!bewegt || !ziel){ if(BRD.spaeter){ BRD.spaeter = false; BRD.zieh = null; try{ plRender(); }catch(x){ if(R.isConnected) brdSeite(R); } } return; }
    BRD.spaeter = false; BRD.ruhe = Date.now() + 400;   // der Klick nach dem Loslassen öffnet nichts
    if(ziel.dataset.brdsp){ const aufg = BRD.art === 'aufgaben', x = aufg ? plAuf().find(a => a.id === Z.id) : plProj(Z.id); if(!x) return;
      const neuerStatus = x.status !== ziel.dataset.brdsp ? ziel.dataset.brdsp : null;
      await brdSetzen(R, Z.id, Object.assign(neuerStatus ? { status:neuerStatus } : {}, aufg ? { stelle:{ spalte:ziel.dataset.brdsp, vor:vor ? vor.dataset.brdk : null } } : {}));
    }
    else if(ziel.dataset.brdl) await brdSetzen(R, Z.id, { wer:ziel.dataset.brdl }); };
  k.addEventListener('pointerdown', start); k.addEventListener('pointermove', zug); k.addEventListener('pointerup', ende); k.addEventListener('pointercancel', ende);
  k.addEventListener('lostpointercapture', e => { const Z = BRD.zieh; if(Z && Z.pid === e.pointerId && Z.bewegt && !document.contains(k)){ if(Z.geist) Z.geist.remove(); BRD.zieh = null; } });
  if(griff) griff.style.touchAction = 'none';
}

// Einhängen: vierte Ansicht „Board“ neben Fokus, Alle, Woche
if(typeof prioSeite === 'function'){ const _ps86 = prioSeite; prioSeite = function(R){
  if(BRD.zieh && BRD.zieh.bewegt){ BRD.spaeter = true; return; }   // Abgleich im Hintergrund wartet, bis die Karte losgelassen ist
  const board = PRIO.sicht === 'board'; if(board) PRIO.sicht = 'fokus';
  const r = _ps86.apply(this, arguments);
  try{ if(!PL.d) return r;
    const seg = R.querySelector('.prio-seg'); if(seg && !seg.querySelector('[data-priov="board"]')){ const b = document.createElement('button'); b.type = 'button'; b.setAttribute('role', 'tab'); b.dataset.priov = 'board'; b.textContent = 'Board';
      b.onclick = () => { PRIO.sicht = 'board'; PRIO.ordnen = false; plRender(); }; seg.appendChild(b); }
    if(board){ PRIO.sicht = 'board'; seg && seg.querySelectorAll('[data-priov]').forEach(x => { const an = x.dataset.priov === 'board'; x.classList.toggle('on', an); x.setAttribute('aria-selected', String(an)); });
      const I = R.querySelector('#prioInhalt'); if(I){ R.querySelector('.prio').classList.add('prio-board'); brdSeite(I); } }
  }catch(e){ console.warn('Board', e); }
  return r; }; }

(function(){ try{ const s=document.createElement('style'); s.id='svm86css'; s.textContent="/* Beta 0.89 · Planung als Board */\n.brd-leiste{display:flex;flex-wrap:wrap;align-items:flex-end;gap:10px;margin:4px 0 10px;}\n.brd-f{display:flex;flex-direction:column;gap:3px;font-size:12px;color:var(--ink2);}\n.brd-f select{min-height:44px;padding:6px 10px;border-radius:10px;border:1px solid var(--line);background:var(--surface);color:var(--ink);font:inherit;max-width:240px;}\n.brd-leiste #brdNeu{min-height:44px!important;margin-left:auto;}\n.brd-leute{display:flex;align-items:center;gap:8px;overflow-x:auto;padding:6px 0 8px;scrollbar-width:none;position:sticky;top:0;z-index:6;background:var(--bg,var(--surface));}\n.brd-leute::-webkit-scrollbar{display:none;}\n.brd-lt{flex:none;font-size:12px;font-weight:700;color:var(--ink2);text-transform:uppercase;letter-spacing:.05em;}\n.brd-l{flex:none;display:inline-flex;align-items:center;gap:8px;min-height:44px;padding:4px 12px 4px 4px;border-radius:999px;border:1px dashed var(--line);background:var(--surface);color:var(--ink);font:inherit;font-size:14px;font-weight:600;cursor:pointer;transition:background .15s,border-color .15s,transform .15s;}\n.brd-l i{display:inline-grid;place-items:center;width:34px;height:34px;border-radius:50%;background:var(--surface3);font-style:normal;font-size:12.5px;font-weight:800;text-transform:uppercase;}\n.brd-l.on{border-style:solid;border-color:var(--brand2);}\n.brd-l.alle{padding:4px 12px;}\n.brd-l.brd-hier{border-style:solid;border-color:var(--brand2);background:rgba(59,130,246,.12);transform:scale(1.05);}\n.brd-sp{display:grid;grid-template-columns:repeat(var(--n),minmax(200px,1fr));gap:12px;overflow-x:auto;-webkit-overflow-scrolling:touch;padding-bottom:8px;scroll-snap-type:x proximity;}\n.brd-s{background:var(--surface3);border-radius:14px;border-top:4px solid var(--c);display:flex;flex-direction:column;min-height:200px;scroll-snap-align:start;transition:box-shadow .15s,background .15s;}\n.brd-s>h3{display:flex;align-items:center;justify-content:space-between;margin:0;padding:10px 12px;font-size:14px;}\n.brd-s>h3 span::before{content:\"\";display:inline-block;width:9px;height:9px;border-radius:50%;background:var(--c);margin-right:8px;}\n.brd-s>h3 i{font-style:normal;font-size:12px;font-weight:800;color:var(--ink2);background:var(--surface);border-radius:999px;padding:2px 8px;}\n.brd-s.brd-hier{box-shadow:inset 0 0 0 2px var(--c);background:color-mix(in srgb,var(--c) 10%,var(--surface3));}\n.brd-l1{display:flex;flex-direction:column;gap:8px;padding:0 10px 12px;flex:1;}\n.brd-leer{margin:8px 0;padding:16px 8px;text-align:center;font-size:13px;color:var(--ink2);border:1px dashed var(--line);border-radius:10px;}\n.brd-k{position:relative;background:var(--surface);border:1px solid var(--line);border-left:4px solid var(--line);border-radius:12px;padding:10px 12px 10px 14px;cursor:pointer;user-select:none;-webkit-user-select:none;}\n.brd-k:focus-visible{outline:2px solid var(--brand2);outline-offset:2px;}\n.brd-k.s1{border-left-color:#ef4444;} .brd-k.s2{border-left-color:#f59e0b;} .brd-k.s4{border-left-color:var(--surface3);}\n.brd-k.amp-gelb{border-left-color:#f59e0b;} .brd-k.amp-rot{border-left-color:#ef4444;} .brd-k.amp-gruen{border-left-color:#22c55e;}\n.brd-k.erl b{text-decoration:line-through;color:var(--ink2);}\n.brd-k b{display:block;font-size:14.5px;line-height:1.35;padding-right:38px;overflow-wrap:anywhere;}\n.brd-griff{position:absolute;top:2px;right:2px;display:inline-grid;place-items:center;width:44px;height:44px;border-radius:8px;color:var(--ink2);opacity:.55;cursor:grab;touch-action:none;}\n.brd-griff:hover{background:var(--surface3);opacity:1;}\n.brd-k:focus-within .brd-griff{opacity:1;}\n.brd-k.brd-bereit{box-shadow:0 0 0 2px var(--brand2);transform:scale(1.02);}\n.brd-marke{height:3px;border-radius:99px;background:var(--brand2);margin:1px 0;}\n.brd-phasen{display:none;gap:6px;overflow-x:auto;scrollbar-width:none;padding:2px 0 8px;}\n.brd-phasen::-webkit-scrollbar{display:none;}\n.brd-phasen button{flex:none;display:inline-flex;align-items:center;gap:6px;min-height:36px;padding:4px 12px;border-radius:999px;border:1px solid var(--line);border-left:4px solid var(--c);background:var(--surface);color:var(--ink);font:inherit;font-size:13px;font-weight:600;cursor:pointer;}\n.brd-phasen button.on{background:color-mix(in srgb,var(--c) 14%,var(--surface));border-color:var(--c);}\n.brd-phasen button i{font-style:normal;font-size:12px;font-weight:800;color:var(--ink2);}\n.brd-m{display:flex;flex-wrap:wrap;gap:4px 10px;margin-top:6px;font-size:12.5px;color:var(--ink2);}\n.brd-m .rot{color:#f87171;font-weight:700;}\nhtml[data-theme=\"hell\"] .brd-m .rot{color:#dc2626;}\n.brd-wer{display:flex;align-items:center;gap:4px;margin-top:8px;}\n.brd-wer i{display:inline-grid;place-items:center;width:24px;height:24px;border-radius:50%;background:var(--surface3);font-style:normal;font-size:11px;font-weight:800;text-transform:uppercase;}\n.brd-wer small{margin-left:4px;font-size:12.5px;color:var(--ink2);}\n.brd-nie{color:#fdba74!important;}\nhtml[data-theme=\"hell\"] .brd-nie{color:#c2410c!important;}\n.brd-bar{height:5px;border-radius:99px;background:var(--surface3);overflow:hidden;margin-top:8px;}\n.brd-bar i{display:block;height:100%;background:#22c55e;}\n.brd-weg{opacity:.35;}\n.brd-geist{position:fixed;left:0;top:0;z-index:9999;pointer-events:none;box-shadow:0 12px 28px rgba(15,23,42,.22);opacity:.96;}\n.brd-zieht{cursor:grabbing;}\n.brd-mn h4{margin:14px 0 6px;font-size:13px;color:var(--ink2);text-transform:uppercase;letter-spacing:.05em;}\n.brd-mn .pchip{min-height:44px;}\n.brd-ch{border-left:4px solid var(--c)!important;}\n.prio-board{max-width:none;}\n@media (max-width:700px){ .brd-sp{grid-template-columns:repeat(var(--n),minmax(82vw,1fr));} .brd-leiste #brdNeu{margin-left:0;} .brd-phasen{display:flex;} }\n@media (prefers-reduced-motion:reduce){ .brd-l,.brd-s{transition:none;} }\n"; document.head.appendChild(s); }catch(e){} })();
/* =====================================================================
   Beta 0.89 · Treffen als Serie und Einladung per WhatsApp (Wunsch Albert, 06.11.2026)
   - Termin anlegen: „Bis (Uhrzeit)“ und „Wiederholen“ (jede Woche, alle zwei Wochen, jeden Monat am gleichen Wochentag, jedes Quartal).
     Gespeichert wird über termin_speichern2 (123_treffen.sql), die Rechte prüft wie bisher termin_speichern.
   - Bei Treffen (Sitzung, Versammlung, Abteilung, Einladungen) öffnet sich nach dem Speichern sofort die Einladung:
     fertiger WhatsApp-Text, Kalenderdatei mit allen Terminen der Serie, Erinnerung eine Woche und einen Tag vorher.
   - In den Details: Uhrzeit bis, Regel der Serie, „Einladung“ und „Serie ab hier löschen“.
   ===================================================================== */
const TF = { art: { woche:'Jede Woche', zweiwochen:'Alle zwei Wochen', monat:'Jeden Monat', quartal:'Jedes Quartal' },
  oft: { woche:'jede Woche', zweiwochen:'alle zwei Wochen', monat:'einmal im Monat', quartal:'einmal im Quartal' },
  wt: ['Montag','Dienstag','Mittwoch','Donnerstag','Freitag','Samstag','Sonntag'],
  mon: ['Januar','Februar','März','April','Mai','Juni','Juli','August','September','Oktober','November','Dezember'] };
const tfE = s => svEsc(s == null ? '' : String(s));
const tfD = d => { const x = new Date(d + 'T12:00:00'); return x.toLocaleDateString('de-DE', { day:'2-digit', month:'2-digit', year:'numeric', timeZone:'Europe/Berlin' }); };
const tfWD = d => new Date(d + 'T12:00:00').toLocaleDateString('de-DE', { weekday:'short', timeZone:'Europe/Berlin' });
const tfTreffen = (a, sicht) => ['sitzung', 'versammlung'].includes(a) || (sicht || []).some(x => /^(g|u):/.test(x));
// Uhr-Emoji passend zur Uhrzeit (auf die halbe Stunde gerundet), wie Albert es schreibt: 17:30 🕠, 17:45 🕕
function tfUhr(z){ const m = /^(\d{1,2}):(\d{2})$/.exec(z || ''); if(!m) return '🕒'; let t = Math.round((+m[1] * 60 + +m[2]) / 30) * 30, h = Math.floor(t / 60) % 12, halb = t % 60 === 30;
  return String.fromCodePoint((halb ? 0x1F55C : 0x1F550) + ((h + 11) % 12)); }

/* ---------- Regel und Tage im Browser (nur für die Vorschau im Formular, gespeichert rechnet der Server) ---------- */
function tfRegel(art, d){ const x = new Date(d + 'T12:00:00'), wt = TF.wt[(x.getDay() + 6) % 7], nr = Math.min(4, Math.floor((x.getDate() - 1) / 7) + 1);
  if(art === 'woche') return 'Jeden ' + wt; if(art === 'zweiwochen') return 'Alle zwei Wochen ' + wt.toLowerCase() + 's';
  if(art === 'monat') return `Jeden ${nr}. ${wt} im Monat`;
  const M = [0, 3, 6, 9].map(k => (x.getMonth() + k) % 12).sort((a, b) => a - b).map(m => TF.mon[m]);
  return `Immer am ${nr}. ${wt} im ${M.slice(0, -1).join(', ')} und ${M[M.length - 1]}`; }
function tfTage(art, d, bis){ const out = [], x = new Date(d + 'T12:00:00'), wd = x.getDay(), nr = Math.min(4, Math.floor((x.getDate() - 1) / 7) + 1), ende = new Date(bis + 'T12:00:00');
  const iso = t => t.toLocaleDateString('sv-SE');
  if(art === 'woche' || art === 'zweiwochen'){ for(const t = new Date(x); t <= ende && out.length < 400; t.setDate(t.getDate() + (art === 'woche' ? 7 : 14))) out.push(iso(t)); return out; }
  for(let k = 0; k < 400; k += art === 'quartal' ? 3 : 1){ const m = new Date(x.getFullYear(), x.getMonth() + k, 1, 12), t = new Date(m); t.setDate(1 + ((wd - m.getDay() + 7) % 7) + (nr - 1) * 7);
    if(t > ende) break; out.push(iso(t)); }
  return out; }

/* ---------- Formular: Uhrzeit bis und Wiederholen ---------- */
{ const _ef = kalEventForm; kalEventForm = async function(i){ const r = await _ef.apply(this, arguments); try{ tfFormErweitern(i); }catch(e){ console.warn('Treffen', e); } return r; }; }
function tfFormErweitern(i){
  const M = document.getElementById('modal'), z = M && M.querySelector('#kfZ'); if(!z || M.querySelector('#kfZB')) return; tfHook();
  const f = document.createElement('div'); f.className = 'field'; f.innerHTML = '<label for="kfZB">Bis (Uhrzeit)</label><input id="kfZB" type="time">';
  z.closest('.field').after(f);
  const zb = f.querySelector('#kfZB'); zb.oninput = () => { zb.dataset.ok = '1'; };
  // Beim Ändern erst den gespeicherten Wert holen; bis dahin (oder ohne Netz) wird „bis“ nicht mitgeschickt und bleibt, wie es war
  if(i && i.id) SVB.sb.rpc('termin_extra', { p_id: i.id }).then(r => { if(!zb.isConnected || zb.dataset.ok) return; if(r && r.data){ zb.value = r.data.zb || ''; zb.dataset.ok = '1'; } }).catch(() => {});
  else zb.dataset.ok = '1';
  if(i && i.id){   // einzelner Termin einer Serie: sagen, dass nur dieser geändert wird
    SVB.sb.rpc('termin_extra', { p_id: i.id }).then(r => { if(r && r.data && r.data.serie && zb.isConnected){ const h = document.createElement('p'); h.className = 'note small kal-w tf-hin'; h.textContent = 'Dieser Termin gehört zu einer Serie. Geändert wird nur dieser eine Termin.'; const t = M.querySelector('#kfT'); if(t) t.closest('.field').after(h); } }).catch(() => {});
    return; }   // Serien entstehen nur beim Anlegen
  const b = M.querySelector('#kfB'), w = document.createElement('div'); w.className = 'field kal-w tf-w';
  const in1 = new Date(); in1.setFullYear(in1.getFullYear() + 1);
  w.innerHTML = `<label for="kfW">Wiederholen</label><div class="tf-wz"><select id="kfW"><option value="">Nein, einmalig</option>${Object.entries(TF.art).map(([k, l]) => `<option value="${k}">${l}</option>`).join('')}</select>
    <span class="tf-wb" hidden><label for="kfWB">bis</label><input id="kfWB" type="date" value="${in1.toLocaleDateString('sv-SE')}"></span></div><p class="note small tf-wt" id="kfWT" role="status"></p>`;
  (b ? b.closest('.field') : z.closest('.field')).after(w);
  const sel = w.querySelector('#kfW'), wb = w.querySelector('.tf-wb'), bis = w.querySelector('#kfWB'), t = w.querySelector('#kfWT'), d = M.querySelector('#kfD');
  const zeig = () => { const a = sel.value; wb.hidden = !a; if(!a || !d.value){ t.textContent = ''; return; }
    if(['monat', 'quartal'].includes(a) && +d.value.slice(8) > 28){ t.textContent = 'Monats- und Quartalsserien bitte an einem Tag bis zum 28. beginnen, sonst gibt es den Wochentag nicht in jedem Monat.'; return; }
    const max = new Date(d.value + 'T12:00:00'); max.setFullYear(max.getFullYear() + 5); const grenze = max.toLocaleDateString('sv-SE'), b = bis.value > grenze ? grenze : bis.value;
    const T = b > d.value ? tfTage(a, d.value, b).slice(0, 161) : [];
    const ein = tfTreffen((M.querySelector('#kfA') || {}).value, [...M.querySelectorAll('.kal-chip.on[data-ks]')].map(x => x.dataset.ks).concat(M.querySelector('#kfG .kal-gp') ? ['u:x'] : []));
    t.textContent = T.length > 1 ? `${tfRegel(a, d.value)}, ${T.length} Termine bis ${tfD(T[T.length - 1])}.${T.length === 161 || b !== bis.value ? ' Mehr geht auf einmal nicht.' : ''}${ein ? ' Danach kommt die Einladung für WhatsApp.' : ''}` : 'Bitte ein Enddatum nach dem ersten Termin wählen.'; };
  sel.onchange = zeig; bis.oninput = zeig; d.addEventListener('input', zeig); M.querySelector('#kfA').addEventListener('change', zeig); M.querySelector('#kfS').addEventListener('click', () => setTimeout(zeig)); zeig();
}
// termin_speichern aus diesem Formular läuft über termin_speichern2 (mit Uhrzeit bis und Wiederholung)
function tfHook(){
  const sb = typeof SVB !== 'undefined' && SVB.sb; if(!sb || sb._s87) return; sb._s87 = 1;
  const rpc = sb.rpc.bind(sb);
  sb.rpc = function(fn, args, opt){
    const zb = document.getElementById('kfZB');
    if(fn === 'termin_speichern' && zb && args && args.p){ const p = Object.assign({}, args.p), w = document.getElementById('kfW'); if(zb.dataset.ok) p.zeit_bis = zb.value || '';
      if(w && w.value){ p.wiederholung = { art: w.value, bis: (document.getElementById('kfWB') || {}).value || '' }; }
      const neu = !p.id, P = Promise.resolve(rpc('termin_speichern2', { p }, opt)).then(r => {
        if(!r || r.error || !r.data) return r;
        // Einladung nur für eigene neue Treffen, und nur wenn gerade kein anderes Fenster offen ist
        if(neu && r.data.ed && tfTreffen(p.art, p.sicht)) setTimeout(() => { const o = document.getElementById('overlay'); if(o && o.classList.contains('open')) return; tfEinladung(r.data.id, { t: p.titel, d: p.datum, z: p.zeit, ort: p.ort, info: p.info, a: p.art }); }, 700);
        if(r.data.anzahl > 1) setTimeout(() => kToast(`${r.data.anzahl} Termine eingetragen`), 300);
        return Object.assign({}, r, { data: r.data.id }); });
      return { then:(a, b) => P.then(a, b), catch:f => P.catch(f), finally:f => P.finally(f) }; }
    return rpc(fn, args, opt); };
}

/* ---------- Details: Uhrzeit bis, Serie, Einladung ---------- */
{ const _kd = kalDetail; kalDetail = function(id){ const r = _kd.apply(this, arguments); const i = kalItem(id); if(!i || i.k !== 'event') return r;
  const M = document.getElementById('modal'), akt = M && M.querySelector('.kal-akt'); if(!akt) return r;
  SVB.sb.rpc('termin_extra', { p_id: i.id }).then(({ data: X }) => { if(!X || M.querySelector('.kal-akt') !== akt || !akt.isConnected) return;   // inzwischen anderer Termin offen
    const info = M.querySelector('.kal-info > div span');
    if(X.zb && i.z && info) info.textContent = info.textContent.replace(i.z + ' Uhr', i.z + ' bis ' + X.zb + ' Uhr');
    if(X.serie){ const s = X.serie, n = (s.termine || []).filter(t => t.d >= i.d).length, z = document.createElement('div');
      z.className = 'tf-serie'; z.innerHTML = `${SVI('refresh')}<span><b>${tfE(s.regel)}</b>${n > 1 ? ` · noch ${n} Termine bis ${tfE(tfD(s.termine[s.termine.length - 1].d))}` : ''}</span>`;
      (M.querySelector('.kal-info') || akt).appendChild(z); }
    if(tfTreffen(i.a, i.sicht) || X.serie){ const b = document.createElement('button'); b.type = 'button'; b.className = 'btn'; b.id = 'tfEinl'; b.innerHTML = `${SVI('send')} Einladung`;
      b.onclick = () => tfEinladung(i.id, i, X); akt.appendChild(b); }
    if(X.serie && X.ed){ const d = document.createElement('button'); d.type = 'button'; d.className = 'btn ghost kal-del'; d.id = 'tfSerieWeg'; d.textContent = 'Serie ab hier löschen';
      d.onclick = async () => { if(d.dataset.sure !== '1'){ d.dataset.sure = '1'; d.textContent = 'Wirklich alle ab ' + tfD(i.d) + ' löschen?'; d.classList.add('sure'); return; }
        d.disabled = true; const { data: n, error } = await SVB.sb.rpc('termin_serie_loeschen', { p_id: i.id }); d.disabled = false;
        if(error) return kToast(svFehlerText(error)); kToast(n === 1 ? '1 Termin gelöscht' : n + ' Termine gelöscht'); closeOverlay(); kalLoad(null, null, true); };
      akt.appendChild(d); }
  }).catch(() => {});
  return r; }; }

/* ---------- Einladung: Text, WhatsApp, Kalenderdatei ---------- */
function tfText(e, X){
  // Blöcke mit Leerzeile dazwischen, leere Zeilen fallen weg
  const s = X && X.serie, zb = (X && X.zb) || '', zeit = e.z ? `${tfUhr(e.z)} ${e.z}${zb ? ' bis ' + zb : ''} Uhr` : '', ort = e.ort ? '📍 ' + e.ort : '';
  const bau = B => B.map(x => x.filter(Boolean).join('\n')).filter(Boolean).join('\n\n');
  if(s){ const heute = new Date().toLocaleDateString('sv-SE'), T = (s.termine || []).filter(t => t.d >= heute), erst = T[0] ? T[0].d : e.d, letzt = T.length ? T[T.length - 1].d : s.bis;
    const ende = new Date(letzt + 'T12:00:00').toLocaleDateString('de-DE', { month:'long', year:'numeric', timeZone:'Europe/Berlin' });
    return bau([['Hallo zusammen,'], [`für ${/^(runde|sitzung|abstimmung|sportliche|versammlung|besprechung|leiter)/i.test(e.t || '') ? 'unsere ' + e.t : '„' + e.t + '“'} treffen wir uns künftig ${TF.oft[s.art] || 'regelmäßig'}${/^(clubhaus|sportheim|vereinsheim|sportlerheim)\b/i.test(e.ort || '') ? ' im ' + e.ort : ''}.`],
      ['📅 ' + s.regel, zeit, ort, `▶️ ${erst === s.von ? 'Erster Termin' : 'Nächster Termin'}: ${tfD(erst)}`], [e.info],
      [`Anbei die Kalenderdatei mit allen Terminen bis ${ende}. Damit übernehmt ihr die Termine direkt in euren Kalender. Erinnerungen eine Woche und einen Tag vorher sind schon drin.`],
      ['📱 Hinweis für iPhone: Klappt der Import nicht direkt, die Datei an die eigene E-Mail-Adresse schicken und den Anhang in Apple Mail öffnen.']]); }
  return bau([['Hallo zusammen,'], [`wir laden euch herzlich ein: ${e.t}.`], [`📅 ${tfWD(e.d)}, ${tfD(e.d)}`, zeit, ort], [e.info],
    ['Gebt bitte kurz Bescheid, ob ihr dabei seid. Die Kalenderdatei hängt an, eine Erinnerung einen Tag vorher ist schon drin.']]); }
function tfIcs(e, X){
  const s = X && X.serie, heute = new Date().toLocaleDateString('sv-SE');
  const T = s ? (s.termine || []).filter(t => t.d >= heute) : [{ id: e.id, d: e.d, z: e.z, zb: X && X.zb }];
  const esc = v => String(v || '').replace(/\\/g, '\\\\').replace(/\r\n|\r|\n/g, '\\n').replace(/[,;]/g, m => '\\' + m);
  // Zeilen nach höchstens 75 Bytes umbrechen, nie mitten in einem Zeichen (Umlaute, Emojis)
  const fold = l => { const o = []; let cur = '', n = 0; for(const ch of l){ const b = new TextEncoder().encode(ch).length; if(n + b > 74){ o.push(cur); cur = ' '; n = 1; } cur += ch; n += b; } o.push(cur); return o.join('\r\n'); };
  const ymd = d => d.replace(/-/g, ''), hm = z => z.replace(':', '') + '00', jetzt = new Date().toISOString().replace(/[-:]/g, '').replace(/\.\d{3}/, '');
  const plus = (z, min) => { const [h, m] = z.split(':').map(Number), t = h * 60 + m + min; return String(Math.min(23, Math.floor(t / 60))).padStart(2, '0') + ':' + String(t >= 1440 ? 59 : t % 60).padStart(2, '0'); };
  const nx = d => { const x = new Date(d + 'T12:00:00'); x.setDate(x.getDate() + 1); return x.toLocaleDateString('sv-SE'); };
  const VTZ = ['BEGIN:VTIMEZONE', 'TZID:Europe/Berlin', 'BEGIN:DAYLIGHT', 'TZOFFSETFROM:+0100', 'TZOFFSETTO:+0200', 'TZNAME:CEST', 'DTSTART:19700329T020000', 'RRULE:FREQ=YEARLY;BYMONTH=3;BYDAY=-1SU', 'END:DAYLIGHT',
    'BEGIN:STANDARD', 'TZOFFSETFROM:+0200', 'TZOFFSETTO:+0100', 'TZNAME:CET', 'DTSTART:19701025T030000', 'RRULE:FREQ=YEARLY;BYMONTH=10;BYDAY=-1SU', 'END:STANDARD', 'END:VTIMEZONE'];
  const alarm = (dauer, txt) => ['BEGIN:VALARM', 'ACTION:DISPLAY', 'DESCRIPTION:' + esc(txt), 'TRIGGER:-' + dauer, 'END:VALARM'];
  const text = [s ? s.regel : '', e.info || ''].filter(Boolean).join('\n');
  const ev = t => { const z = t.z || e.z, zb0 = s ? t.zb : (t.zb || (X && X.zb)), zb = zb0 && z && zb0 > z ? zb0 : '';   // ohne „bis“ kein ausgedachtes Ende
    return ['BEGIN:VEVENT', 'UID:' + String(t.id || e.id) + '@svbsc.kaderwerk.pro', 'DTSTAMP:' + jetzt,
      ...(z ? ['DTSTART;TZID=Europe/Berlin:' + ymd(t.d) + 'T' + hm(z), ...(zb ? ['DTEND;TZID=Europe/Berlin:' + ymd(t.d) + 'T' + hm(zb)] : [])] : ['DTSTART;VALUE=DATE:' + ymd(t.d), 'DTEND;VALUE=DATE:' + ymd(nx(t.d))]),
      'SUMMARY:' + esc(e.t), ...(e.ort ? ['LOCATION:' + esc(e.ort)] : []), ...(text ? ['DESCRIPTION:' + esc(text)] : []),
      ...(s ? alarm('P7D', e.t + ' in einer Woche') : []), ...alarm('P1D', e.t + ' morgen'), 'END:VEVENT']; };
  return ['BEGIN:VCALENDAR', 'VERSION:2.0', 'PRODID:-//SV BSC Moerlenbach//Sportzentrale//DE', 'CALSCALE:GREGORIAN', 'METHOD:PUBLISH', 'X-WR-CALNAME:' + esc(e.t), ...VTZ, ...T.flatMap(ev), 'END:VCALENDAR'].map(fold).join('\r\n') + '\r\n'; }
async function tfEinladung(id, e, X){
  if(!X){ try{ const r = await SVB.sb.rpc('termin_extra', { p_id: id }); if(r.error) throw r.error; X = r.data || {}; }catch(err){ X = {}; kToast('Die Serie ließ sich gerade nicht laden. Die Einladung gilt nur für diesen Termin.'); } }
  e = Object.assign({ id }, e);
  const txt = tfText(e, X), ics = tfIcs(e, X), name = String(e.t || 'Termin').replace(/[\\/:*?"<>|]/g, ' ').trim() + '.ics';
  const anz = X.serie ? (X.serie.termine || []).filter(t => t.d >= new Date().toLocaleDateString('sv-SE')).length : 1;
  const M = svModal(`<div class="mhead"><div><h2 style="margin:0">Einladung</h2><div class="msub">${tfE(e.t)}${X.serie ? ' · ' + tfE(X.serie.regel) : ' · ' + tfE(tfD(e.d))}</div></div></div>
    <div class="tf-e"><label for="tfTxt" class="tf-l">Text für WhatsApp, hier noch änderbar</label><textarea id="tfTxt" rows="14">${tfE(txt)}</textarea>
      <div class="tf-ics">${SVI('cal')}<span><b>${tfE(name)}</b><small>${anz === 1 ? '1 Termin' : anz + ' Termine'}, Erinnerung ${X.serie ? 'eine Woche und ' : ''}einen Tag vorher</small></span></div>
      <div class="btnrow sbact tf-b"><button type="button" class="btn" id="tfTeil">${SVI('chat')} Mit Kalenderdatei teilen</button>
        <a class="btn ghost" id="tfWa" target="_blank" rel="noopener">WhatsApp, nur Text</a>
        <button type="button" class="btn ghost" id="tfCopy">Text kopieren</button><button type="button" class="btn ghost" id="tfIcs">Kalenderdatei laden</button></div>
      <p class="note small">Teilen öffnet am Handy das Teilen-Menü, dort WhatsApp und die Gruppe wählen. Der Text ist außerdem kopiert: fehlt er in WhatsApp, einfach einfügen. Geht Teilen nicht, wird die Datei geladen, dann in WhatsApp anhängen.</p></div>`);
  const ta = M.querySelector('#tfTxt'), wa = M.querySelector('#tfWa'), datei = () => new File([ics], name, { type: 'text/calendar' });
  // Ohne Datei: die Sätze zur Kalenderdatei weglassen
  const ohneDatei = t => t.split('\n\n').filter(x => !/^(Anbei die Kalenderdatei|📱 Hinweis für iPhone)/.test(x)).join('\n\n').replace(/ Die Kalenderdatei hängt an, eine Erinnerung einen Tag vorher ist schon drin\./, '');
  const waSetzen = () => { wa.href = 'https://wa.me/?text=' + encodeURIComponent(ohneDatei(ta.value)); }; ta.oninput = waSetzen; waSetzen();
  const laden = () => { const a = document.createElement('a'); a.href = URL.createObjectURL(new Blob([ics], { type: 'text/calendar;charset=utf-8' })); a.download = name; document.body.appendChild(a); a.click(); setTimeout(() => { URL.revokeObjectURL(a.href); a.remove(); }, 4000); };
  M.querySelector('#tfCopy').onclick = () => { try{ navigator.clipboard.writeText(ta.value).then(() => kToast('Text kopiert'), () => { ta.select(); document.execCommand('copy'); kToast('Text kopiert'); }); }catch(err){ ta.select(); document.execCommand('copy'); kToast('Text kopiert'); } };
  M.querySelector('#tfIcs').onclick = laden;
  M.querySelector('#tfTeil').onclick = async () => { const f = datei();
    try{ await navigator.clipboard.writeText(ta.value); }catch(err){}   // falls WhatsApp beim Teilen nur die Datei übernimmt: Text liegt schon bereit
    if(navigator.canShare && navigator.canShare({ files: [f] })){ try{ await navigator.share({ text: ta.value, files: [f] }); return; }catch(err){ if(err && err.name === 'AbortError') return; } }
    laden();
    kToast('Datei geladen und Text kopiert. In WhatsApp einfügen und die Datei anhängen.'); };
  TF.letzte = { txt, ics, name };   // für Tests
  return M;
}
if(typeof SU_STICH !== 'undefined') SU_STICH.kalender = ((SU_STICH.kalender || '') + ' serie wiederholen leiter runde sportliche abstimmung einladung treffen').trim();

(function(){ try{ const s=document.createElement('style'); s.id='svm87css'; s.textContent="/* 0.89 · Treffen als Serie, Einladung */\n.tf-wz{display:flex;flex-wrap:wrap;gap:8px 12px;align-items:center;}\n.tf-wz select{flex:1 1 220px;min-height:44px;}\n.tf-wb{display:flex;align-items:center;gap:8px;flex:1 1 200px;}\n.tf-wb[hidden]{display:none;}\n.tf-wb label{margin:0;font-size:13px;color:var(--ink2);}\n.tf-wb input{flex:1;min-height:44px;}\n.tf-wt{margin:6px 0 0;min-height:1.2em;}\n.tf-serie{display:flex;gap:10px;align-items:flex-start;color:var(--ink2);}\n.tf-serie svg{flex:none;width:18px;height:18px;margin-top:2px;}\n.tf-serie b{color:var(--ink);font-weight:650;}\n.tf-e{display:grid;gap:12px;margin-top:6px;}\n.tf-l{font-size:13px;color:var(--ink2);}\n.tf-e textarea{width:100%;box-sizing:border-box;font:inherit;font-size:14.5px;line-height:1.5;padding:12px 14px;border-radius:12px;border:1px solid var(--line);background:var(--card,transparent);color:var(--ink);resize:vertical;min-height:220px;}\n.tf-ics{display:flex;gap:12px;align-items:center;padding:10px 12px;border:1px solid var(--line);border-radius:12px;}\n.tf-ics svg{flex:none;width:22px;height:22px;color:var(--ink2);}\n.tf-ics span{display:grid;gap:2px;min-width:0;}\n.tf-ics b{overflow-wrap:anywhere;}\n.tf-ics small{color:var(--ink2);}\n.tf-b{flex-wrap:wrap;}\n.tf-b .btn{min-height:44px;}\n"; document.head.appendChild(s); }catch(e){} })();

/* =====================================================================
   Beta 0.99 · Navigation: Namen in der schmalen Leiste und die Unterseiten sichtbar
   Albert, 11.11.2026: „Nur Symbole in der Leiste reichen net, um Submenüs zu finden.“
   Zwischen 761 und 1180 px (Tablet, kleiner Laptop) war die Seitenleiste eine reine Symbolleiste. Die Namen
   standen nur im Tooltip, und den gibt es auf dem Tablet nicht. Unterseiten wie Top-Elf, Banden oder
   Verfügbarkeit sah man erst, wenn man den Bereich schon geöffnet hatte.
   1. Schmale Leiste: unter jedem Symbol steht der Name.
   2. Schmale Leiste: Bereiche mit Unterseiten zeigen ein kleines Zeichen. Antippen klappt daneben eine Liste
      mit allen Unterseiten auf. Ein Tipp darauf führt direkt hin.
   3. Breite Leiste am Rechner: unter dem offenen Bereich stehen seine Unterseiten, eingerückt. Die anderen
      Bereiche mit Unterseiten lassen sich über den Pfeil rechts aufklappen, ohne die Seite zu wechseln.
   Die Unterseiten kommen aus denselben Listen wie die Reiter oben (SV4_HUB, Partner: SPO_REITER), es gibt also
   keine zweite Liste, die auseinanderlaufen kann.
   ===================================================================== */
const N88 = { auf:{}, flyFuer:null };
// Welche Bereiche der Leiste Unterseiten haben und woher die kommen. Termine, Mein Spieltag, Gegneranalyse und
// Eigene Jugend stehen selbst in der Leiste, deshalb hängt an ihnen keine eigene Liste.
const N88_QUELLE = { planung:'steuerung', mann1:'mannschaft', mann2:'mannschaft', kader:'kader', scout:'scouting', play:'wissen', sponsoring:'spo' };

const n88Schmal = () => matchMedia('(max-width:1180px) and (min-width:761px)').matches;
const n88Breit = () => matchMedia('(min-width:1181px)').matches;

function n88Erlaubt(k){
  const t = String(k).split(':')[0];
  try{ if(typeof svTabAllowed === 'function' && !svTabAllowed(t)) return false; }catch(e){}
  if(k === 'kabine:kontakte' || k === 'kabine:link' || k === 'kabine:abst') return typeof canTraining === 'function' && canTraining();
  return true;
}
// Die Unterseiten eines Bereichs, in der Reihenfolge der Reiter oben
function n88Unter(t){
  const q = N88_QUELLE[t]; if(!q) return [];
  if(q === 'spo'){
    if(typeof SPO_REITER === 'undefined') return [];
    try{ if(typeof spoDarf === 'function' && !spoDarf('sponsoring')) return []; }catch(e){}
    return SPO_REITER.map(([k, l]) => ({ k:'spo:' + k, l, go:() => n88Partner(k) }));
  }
  const H = typeof SV4_HUB !== 'undefined' && SV4_HUB[q]; if(!H) return [];
  return H.tabs.filter(([k]) => n88Erlaubt(k)).map(([k, l]) => ({ k, l, go:() => n88Hub(t, k) }));
}
// Welche Unterseite gerade offen ist
function n88Jetzt(t){
  if(N88_QUELLE[t] === 'spo') return typeof SPO !== 'undefined' ? 'spo:' + (SPO.view === 'uebersicht' ? 'zentrale' : SPO.view) : '';
  try{ return typeof sv4Sub === 'function' ? sv4Sub(svCurTab()) : svCurTab(); }catch(e){ return ''; }
}
// Erst den Bereich öffnen (der setzt zum Beispiel die richtige Mannschaft), dann den Reiter oben antippen,
// genau so wie es ein Mensch tun würde. So bleibt die ganze Logik der Reiter an einer Stelle.
function n88Hub(t, k){
  if(svCurTab() !== t && !(N88_QUELLE[t] && n88Bereich() === t)) goTab(t);
  let n = 0;
  const klick = () => {
    const b = document.querySelector('#hubbar [data-hub="' + (window.CSS && CSS.escape ? CSS.escape(k) : k) + '"]');
    if(b){ if(!b.classList.contains('on')) b.click(); n88Zeichnen(); return; }
    if(++n < 40) setTimeout(klick, 50);
  };
  setTimeout(klick, 0);
}
function n88Partner(k){
  if(typeof SPO !== 'undefined') SPO.view = k;
  if(svCurTab() === 'sponsoring' && typeof spoWechsel === 'function') spoWechsel(k); else goTab('sponsoring');
  setTimeout(n88Zeichnen, 0);
}
// Welcher Bereich der Leiste gerade markiert ist
function n88Bereich(){ const a = document.querySelector('.side .snav > button[data-tab].active'); return a ? a.dataset.tab : null; }

/* ---------- 2. Liste neben der schmalen Leiste ---------- */
function n88FlyZu(){ const f = document.getElementById('n88fly'); if(f) f.remove(); N88.flyFuer = null;
  document.querySelectorAll('.side .snav > button.n88-auf').forEach(b => { b.classList.remove('n88-auf'); b.setAttribute('aria-expanded', 'false'); }); }
function n88FlyAuf(btn){
  const t = btn.dataset.tab, U = n88Unter(t); if(!U.length){ goTab(t); return; }
  if(N88.flyFuer === t){ n88FlyZu(); return; }
  n88FlyZu();
  const name = (btn.querySelector(':scope > span:not(.cnt)') || btn).textContent.trim();
  const jetzt = n88Bereich() === t ? n88Jetzt(t) : '';
  const f = document.createElement('div'); f.id = 'n88fly'; f.className = 'n88-fly'; f.setAttribute('role', 'menu'); f.setAttribute('aria-label', name);
  f.innerHTML = `<div class="n88-fk"><b>${svEsc(name)}</b><button type="button" class="n88-fx" aria-label="Schließen">${SVI('x')}</button></div>
    <div class="n88-fl">${U.map((u, i) => `<button type="button" role="menuitem" data-n88="${i}" class="${u.k === jetzt ? 'on' : ''}"${u.k === jetzt ? ' aria-current="page"' : ''}>${svEsc(u.l)}</button>`).join('')}</div>`;
  document.body.appendChild(f);
  // Neben den Knopf, aber immer ganz im Bild
  const r = btn.getBoundingClientRect(), h = f.offsetHeight, top = Math.max(10, Math.min(r.top - 6, innerHeight - h - 10));
  f.style.left = Math.round(r.right + 10) + 'px'; f.style.top = Math.round(top) + 'px';
  f.style.setProperty('--n88-pfeil', Math.round(Math.min(Math.max(r.top + r.height / 2 - top, 18), h - 18)) + 'px');
  f.querySelector('.n88-fx').onclick = n88FlyZu;
  f.querySelectorAll('[data-n88]').forEach(b => b.onclick = () => { const u = U[+b.dataset.n88]; n88FlyZu(); u.go(); });
  btn.classList.add('n88-auf'); btn.setAttribute('aria-expanded', 'true'); N88.flyFuer = t;
  requestAnimationFrame(() => { const x = f.querySelector('.on') || f.querySelector('[data-n88]'); if(x) x.focus({ preventScroll:true }); });
}
// Antippen in der schmalen Leiste: Bereiche mit Unterseiten öffnen die Liste, alle anderen wie bisher die Seite
document.addEventListener('click', e => {
  const b = e.target.closest && e.target.closest('.side .snav > button[data-tab]');
  if(b && n88Schmal() && N88_QUELLE[b.dataset.tab] && n88Unter(b.dataset.tab).length){
    e.preventDefault(); e.stopImmediatePropagation(); n88FlyAuf(b); return;
  }
  if(N88.flyFuer && !(e.target.closest && e.target.closest('#n88fly'))) n88FlyZu();
}, true);
document.addEventListener('keydown', e => {
  if(e.key === 'Escape' && N88.flyFuer){ const t = N88.flyFuer; n88FlyZu(); const b = document.querySelector(`.side .snav > button[data-tab="${t}"]`); if(b) b.focus(); }
});
addEventListener('resize', () => { if(N88.flyFuer) n88FlyZu(); n88Zeichnen(); }, { passive:true });

/* ---------- 3. Unterseiten in der breiten Leiste ---------- */
function n88Zeichnen(){
  try{
    const nav = document.querySelector('.side .snav'); if(!nav) return;
    nav.querySelectorAll('.n88-sub, .n88-pf').forEach(x => x.remove());
    const schmal = n88Schmal(), breit = n88Breit(), akt = n88Bereich();
    nav.querySelectorAll(':scope > button[data-tab]').forEach(b => {
      const t = b.dataset.tab, hat = !!N88_QUELLE[t] && b.style.display !== 'none' && n88Unter(t).length > 0;
      b.classList.toggle('n88-hat', hat);
      if(hat){ b.setAttribute('aria-haspopup', schmal ? 'menu' : 'false'); if(!b.hasAttribute('aria-expanded')) b.setAttribute('aria-expanded', 'false'); }
      else { b.removeAttribute('aria-haspopup'); b.removeAttribute('aria-expanded'); }
      if(!hat || !breit) return;
      const offen = t === akt || !!N88.auf[t];
      // Pfeil rechts im Knopf: auf- und zuklappen, ohne die Seite zu wechseln
      const pf = document.createElement('button'); pf.type = 'button'; pf.className = 'n88-pf' + (offen ? ' auf' : '');
      pf.setAttribute('aria-label', (offen ? 'Unterseiten von ' : 'Unterseiten von ') + ((b.querySelector(':scope > span:not(.cnt)') || b).textContent.trim()) + (offen ? ' zuklappen' : ' aufklappen'));
      pf.setAttribute('aria-expanded', String(offen)); pf.innerHTML = SVI('chev');
      pf.onclick = ev => { ev.stopPropagation(); N88.auf[t] = !offen; if(t === akt && offen) N88.auf[t + ':zu'] = true; else delete N88.auf[t + ':zu']; n88Zeichnen(); };
      b.after(pf);
      if(!offen || N88.auf[t + ':zu']){ pf.classList.remove('auf'); pf.setAttribute('aria-expanded', 'false'); return; }
      const jetzt = t === akt ? n88Jetzt(t) : '', U = n88Unter(t);
      const d = document.createElement('div'); d.className = 'n88-sub'; d.setAttribute('role', 'group'); d.setAttribute('aria-label', 'Unterseiten');
      d.innerHTML = U.map((u, i) => `<button type="button" data-n88="${i}" class="${u.k === jetzt ? 'on' : ''}"${u.k === jetzt ? ' aria-current="page"' : ''}>${svEsc(u.l)}</button>`).join('');
      d.querySelectorAll('[data-n88]').forEach(x => x.onclick = () => U[+x.dataset.n88].go());
      pf.after(d);
    });
  }catch(e){ console.warn('Navigation 0.99', e); }
}
// Nach jedem Seitenwechsel und jedem Neuaufbau der Leiste neu zeichnen
{ const _gt88 = goTab; goTab = function(){ const r = _gt88.apply(this, arguments); if(N88.flyFuer) n88FlyZu(); setTimeout(n88Zeichnen, 0); return r; }; }
// n77Seite sortiert die Knöpfe der Leiste um; Pfeile und Unterseiten blieben dann oben in der Leiste hängen, bis zum nächsten Wechsel (0.99.42)
if(typeof n77Seite === 'function'){ const _ns88 = n77Seite; n77Seite = function(){ const r = _ns88.apply(this, arguments); setTimeout(n88Zeichnen, 0); return r; }; }
if(typeof sv4NavVis === 'function'){ const _nv88 = sv4NavVis; sv4NavVis = function(){ const r = _nv88.apply(this, arguments); setTimeout(n88Zeichnen, 0); return r; }; }
if(typeof sv4HubBar === 'function'){ const _hb88 = sv4HubBar; sv4HubBar = function(){ const r = _hb88.apply(this, arguments); setTimeout(n88Zeichnen, 0); return r; }; }
if(typeof spoReiterAn === 'function'){ const _sr88 = spoReiterAn; spoReiterAn = function(){ const r = _sr88.apply(this, arguments); setTimeout(n88Zeichnen, 0); return r; }; }
if(document.readyState === 'loading') document.addEventListener('DOMContentLoaded', () => setTimeout(n88Zeichnen, 300)); else setTimeout(n88Zeichnen, 300);

/* ---------- 4. Handy: im Mehr-Menü zu den Unterseiten durchtippen ----------
   Vorbild aus navbar.gallery (Seitenleisten, die eine Ebene tiefer führen): Antippen einer Kachel mit Unterseiten
   zeigt im selben Menü die Unterseiten, oben „Alle Bereiche“ als Weg zurück. Kacheln ohne Unterseiten öffnen wie bisher. */
function n88TiefZu(){ const s = document.getElementById('moreSheet'); if(!s) return; s.classList.remove('n88-drin'); const d = s.querySelector('.n88-dr'); if(d) d.remove(); }
function n88TiefAuf(kachel){
  const t = kachel.dataset.sheet, U = n88Unter(t), s = document.getElementById('moreSheet'); if(!U.length || !s) return false;
  n88TiefZu();
  const name = [...kachel.childNodes].filter(n => n.nodeType === 3).map(n => n.textContent).join('').replace(/­/g, '').trim() || kachel.textContent.trim();
  const icon = (kachel.querySelector('svg') || {}).outerHTML || '';
  const jetzt = n88Bereich() === t ? n88Jetzt(t) : '';
  const d = document.createElement('div'); d.className = 'n88-dr'; d.setAttribute('role', 'group'); d.setAttribute('aria-label', name);
  d.innerHTML = `<button type="button" class="n88-zur">${SVI('chev')}<span>Alle Bereiche</span></button>
    <div class="n88-dk"><span class="n88-di">${icon}</span><b>${svEsc(name)}</b></div>
    <div class="n88-dl">${U.map((u, i) => `<button type="button" data-n88="${i}" class="${u.k === jetzt ? 'on' : ''}"${u.k === jetzt ? ' aria-current="page"' : ''}><span>${svEsc(u.l)}</span>${SVI('chev')}</button>`).join('')}</div>`;
  s.appendChild(d); s.classList.add('n88-drin'); s.scrollTop = 0;
  d.querySelector('.n88-zur').onclick = () => { n88TiefZu(); const k = s.querySelector(`.sgrid [data-sheet="${t}"]`); if(k){ k.scrollIntoView({ block:'center' }); k.focus({ preventScroll:true }); } };
  d.querySelectorAll('[data-n88]').forEach(b => b.onclick = () => { const u = U[+b.dataset.n88]; try{ svSheet(false); }catch(e){} n88TiefZu(); u.go(); });
  requestAnimationFrame(() => { const x = d.querySelector('.on') || d.querySelector('[data-n88]'); if(x) x.focus({ preventScroll:true }); });
  return true;
}
document.addEventListener('click', e => {
  const k = e.target.closest && e.target.closest('#moreSheet .sgrid [data-sheet]');
  if(k && N88_QUELLE[k.dataset.sheet] && n88TiefAuf(k)){ e.preventDefault(); e.stopImmediatePropagation(); }
}, true);
document.addEventListener('keydown', e => { if(e.key === 'Escape' && document.querySelector('#moreSheet.n88-drin')){ e.stopPropagation(); n88TiefZu(); } }, true);
function n88Kacheln(){
  try{ document.querySelectorAll('#moreSheet .sgrid [data-sheet]').forEach(b => { const hat = !!N88_QUELLE[b.dataset.sheet] && n88Unter(b.dataset.sheet).length > 0;
    b.classList.toggle('n88-hat', hat); if(hat) b.setAttribute('aria-haspopup', 'true'); else b.removeAttribute('aria-haspopup'); }); }catch(e){}
}
if(typeof svSheet === 'function'){ const _sh88 = svSheet; svSheet = function(open){ n88TiefZu(); const r = _sh88.apply(this, arguments); if(open) n88Kacheln(); return r; }; }

(function(){ try{ const s=document.createElement('style'); s.id='svm88css'; s.textContent="/* Beta 0.99 · Navigation: Namen in der schmalen Leiste, Unterseiten sichtbar */\n\n/* 1. Schmale Leiste (Tablet, kleiner Laptop): Symbol und Name untereinander */\n@media (max-width:1180px) and (min-width:761px){\n  :root{--rail:96px;}\n  .side{padding-left:8px;padding-right:8px;}\n  .side .snav{gap:2px;}\n  .side .snav > button[data-tab],.side .snav > .sp-nav{\n    position:relative;width:80px;height:auto;min-height:56px;flex-direction:column;justify-content:center;align-items:center;\n    gap:4px;padding:8px 4px 7px;border-radius:12px;}\n  .side .snav > button[data-tab] > svg,.side .snav > .sp-nav > svg{width:21px;height:21px;flex:none;}\n  .side .snav > button[data-tab] > span:not(.cnt),.side .snav > .sp-nav > span:not(.cnt):not(.sp-nic){\n    display:-webkit-box!important;-webkit-box-orient:vertical;-webkit-line-clamp:2;overflow:hidden;\n    max-width:76px;font-size:11px;line-height:1.18;font-weight:650;letter-spacing:0;text-align:center;\n    white-space:normal;overflow-wrap:break-word;hyphens:auto;-webkit-hyphens:auto;}\n  .side .snav > button[data-tab].active > span:not(.cnt){font-weight:750;}\n  /* Der Tooltip ist überflüssig, der Name steht ja da */\n  .side .snav button[data-tip]:hover:after{display:none!important;}\n  .side .snav > button.active:before{left:-8px;top:12px;bottom:12px;}\n  .side .snav .cnt{top:5px;right:10px;}\n  /* Bereiche mit Unterseiten: kleines Zeichen oben rechts, offen hervorgehoben */\n  .side .snav > button.n88-hat:after{content:\"\";position:absolute;top:9px;right:9px;width:5px;height:5px;border-right:1.6px solid currentColor;border-bottom:1.6px solid currentColor;transform:rotate(-45deg);opacity:.5;}\n  .side .snav > button.n88-auf{background:rgba(91,155,255,.14);color:var(--ink);}\n  .side .snav > button.n88-auf:after{opacity:.9;}\n}\n\n/* 2. Liste neben der schmalen Leiste */\n.n88-fly{position:fixed;z-index:9000;width:236px;max-height:calc(100vh - 20px);overflow:auto;padding:8px;border:1px solid var(--line);border-radius:16px;\n  background:var(--surface,#151b2b);box-shadow:0 22px 50px -18px rgba(0,0,0,.55),0 2px 8px rgba(0,0,0,.2);animation:n88rein .16s ease-out both;}\n.n88-fly:before{content:\"\";position:absolute;left:-6px;top:var(--n88-pfeil,24px);width:10px;height:10px;margin-top:-5px;background:inherit;border-left:1px solid var(--line);border-bottom:1px solid var(--line);transform:rotate(45deg);}\n@keyframes n88rein{from{opacity:0;transform:translateX(-6px);}to{opacity:1;transform:none;}}\n@media (prefers-reduced-motion:reduce){.n88-fly{animation:none;}}\n.n88-fk{display:flex;align-items:center;justify-content:space-between;gap:8px;padding:4px 4px 8px 10px;border-bottom:1px solid var(--line);margin-bottom:6px;}\n.n88-fk b{font-size:14px;font-weight:800;color:var(--ink);}\n.n88-fx{display:grid;place-items:center;width:36px;height:36px;border:0;border-radius:10px;background:none;color:var(--ink3);cursor:pointer;}\n.n88-fx svg{width:17px;height:17px;}\n.n88-fx:hover{background:rgba(148,163,196,.1);color:var(--ink);}\n.n88-fl{display:flex;flex-direction:column;gap:2px;}\n.n88-fl button{display:flex;align-items:center;min-height:44px;padding:0 12px;border:0;border-radius:10px;background:none;font:inherit;font-size:14.5px;font-weight:600;color:var(--ink2);text-align:left;cursor:pointer;}\n.n88-fl button:hover{background:rgba(148,163,196,.1);color:var(--ink);}\n.n88-fl button.on{background:rgba(91,155,255,.14);color:var(--ink);font-weight:750;}\n.n88-fl button.on:before{content:\"\";width:3px;height:18px;margin-right:9px;border-radius:2px;background:var(--brand2,#5b9bff);}\n.n88-fl button:focus-visible,.n88-fx:focus-visible{outline:2px solid var(--brand2,#5b9bff);outline-offset:1px;}\n\n/* 3. Breite Leiste am Rechner: Unterseiten eingerückt, Pfeil zum Aufklappen */\n@media (min-width:1181px){\n  .side .snav > button.n88-hat{padding-right:34px;}\n  .side .snav > .n88-pf{position:relative;align-self:flex-end;width:28px;height:26px;margin:-28px 3px 2px 0;display:grid;place-items:center;\n    border:0;border-radius:7px;background:none;color:var(--ink3);cursor:pointer;z-index:1;}\n  .side .snav > .n88-pf svg{width:14px;height:14px;transition:transform .15s ease;}\n  .side .snav > .n88-pf.auf svg{transform:rotate(90deg);}\n  .side .snav > .n88-pf:hover{background:rgba(148,163,196,.12);color:var(--ink);}\n  .side .snav > .n88-sub{display:flex;flex-direction:column;gap:1px;margin:0 0 4px 22px;padding-left:10px;border-left:1px solid var(--line2,rgba(148,163,196,.18));}\n  .side .snav > .n88-sub button{display:flex;align-items:center;height:28px;padding:0 10px;border:0;border-radius:8px;background:none;font:inherit;font-size:13px;font-weight:550;color:var(--ink3);text-align:left;cursor:pointer;}\n  .side .snav > .n88-sub button:hover{background:rgba(148,163,196,.08);color:var(--ink);}\n  .side .snav > .n88-sub button.on{color:var(--ink);font-weight:700;background:rgba(91,155,255,.1);}\n}\n@media (max-width:1180px){ .side .snav > .n88-sub,.side .snav > .n88-pf{display:none!important;} }\n\n/* 4. Mehr-Menü am Handy: eine Ebene tiefer */\n#moreSheet .sgrid button.n88-hat{position:relative;}\n#moreSheet .sgrid button.n88-hat:after{content:\"\";position:absolute;top:9px;right:9px;width:5px;height:5px;border-right:1.6px solid currentColor;border-bottom:1.6px solid currentColor;transform:rotate(-45deg);opacity:.45;}\n#moreSheet.n88-drin > :not(.grab):not(.n88-dr){display:none!important;}\n.n88-dr{display:flex;flex-direction:column;gap:6px;padding-bottom:6px;animation:n88tief .2s cubic-bezier(.2,.8,.2,1) both;}\n@keyframes n88tief{from{opacity:0;transform:translateX(18px);}to{opacity:1;transform:none;}}\n@media (prefers-reduced-motion:reduce){.n88-dr{animation:none;}}\n.n88-zur{display:inline-flex;align-items:center;gap:4px;align-self:flex-start;min-height:44px;padding:0 12px 0 6px;margin-left:-6px;border:0;border-radius:12px;background:none;font:inherit;font-size:14px;font-weight:650;color:var(--brand2,#5b9bff);cursor:pointer;}\n.n88-zur svg{width:16px;height:16px;transform:rotate(180deg);}\n.n88-dk{display:flex;align-items:center;gap:12px;padding:2px 2px 8px;}\n.n88-di{display:grid;place-items:center;width:44px;height:44px;border-radius:14px;background:var(--surface2,rgba(148,163,196,.12));color:var(--ink);flex:none;}\n.n88-di svg{width:22px;height:22px;}\n.n88-dk b{font-size:24px;line-height:1.1;font-weight:800;letter-spacing:-.01em;color:var(--ink);text-wrap:balance;}\n.n88-dl{display:flex;flex-direction:column;border:1px solid var(--line);border-radius:16px;overflow:hidden;background:var(--surface2,transparent);}\n.n88-dl button{display:flex;align-items:center;justify-content:space-between;gap:10px;min-height:52px;padding:0 14px 0 16px;border:0;border-top:1px solid var(--line);background:none;font:inherit;font-size:16px;font-weight:600;color:var(--ink);text-align:left;cursor:pointer;}\n.n88-dl button:first-child{border-top:0;}\n.n88-dl button svg{width:16px;height:16px;color:var(--ink3);flex:none;}\n.n88-dl button:active{background:rgba(148,163,196,.12);}\n.n88-dl button.on{font-weight:750;color:var(--brand2,#5b9bff);}\n.n88-dl button.on svg{color:currentColor;}\n.n88-zur:focus-visible,.n88-dl button:focus-visible{outline:2px solid var(--brand2,#5b9bff);outline-offset:-2px;}\n"; document.head.appendChild(s); }catch(e){} })();
/* =====================================================================
   Beta 1.00 · Spieltagsstudio: Events (Nachspielzeit und andere Sondertage)
   Albert, 11.11.2026: „Nachspielzeit genauso geil gemacht wie das mit dem Heimspiel. Poster zum Aushängen,
   Flyer zum Rumschicken, mit eigenen Bildern.“
   - Vierter Bereich im Spieltagsstudio: „Event“ neben Spielplakat, Live-Ticker und Ergebnis.
   - Dieselbe Bildsprache wie das Spielplakat: Foto aus dem Vereinsfundus oder der Studio-Bibliothek oder ein eigenes,
     dunkler Verlauf, zweizeilige Headline in Anton mit Patina (Zeile 1 warmweiß, Zeile 2 Vereinsblau), gesperrte Versalien.
   - Formate: Story, Feed, Quer (Social) und Plakat A4, Flyer A5 (Druck, 300 dpi).
   - Vorlage „Nachspielzeit“ mit allen Texten, alles änderbar. Gespeichert in plakat_spiel unter event-<datum>-<name>,
     so sehen alle im Team denselben Stand. Eigene Fotos landen seit 0.99.21 im Bildpool (svm98.js).
   ===================================================================== */
const EV_FORMATE = { story:[1080,1920,'Story 9:16'], feed:[1080,1350,'Feed 4:5'], quer:[1920,1080,'Quer 16:9'], a4:[1240,1754,'Plakat A4'], a5:[874,1240,'Flyer A5'] };
const EV_EBENEN = [['foto','Hintergrundfoto'],['marke','Absender und Hinweis oben'],['titel','Headline'],['lead','Zwei Sätze'],['termin','Datum und Anlass'],['kasten','Programmkasten'],['spruch','Vereinsmotto']];
const EV_VORLAGEN = {
  nachspielzeit:{ titel:'Nachspielzeit', s:{ kicker:'NEU · ZUM ERSTEN MAL', zeile1:'NACH', zeile2:'SPIELZEIT.', unter:'DER SV/BSC FANTREFF',
    lead1:'Nach dem Spiel.', lead2:'Zusammen im Verein.', anlass:'', ort:'Danach gemeinsam im Clubhaus',
    kastenTitel:'BLEIBT NACH DEM SPIEL NOCH DA.', programm:'Erste & Zweite. Fans. Musik & Essen.', hinweis:'', foto:'night' } },
  frei:{ titel:'Eigenes Event', s:{ kicker:'SV/BSC MÖRLENBACH LÄDT EIN', zeile1:'VEREINS', zeile2:'ABEND.', unter:'FÜR ALLE IM VEREIN',
    lead1:'', lead2:'', anlass:'', ort:'Clubhaus Mörlenbach', kastenTitel:'DAS ERWARTET EUCH', programm:'', hinweis:'', foto:'linie-abend' } }
};
const EV = { format:'story', liste:[], id:'', eigen:null, eigenName:'', laedt:false,
  s:{ vorlage:'nachspielzeit', datum:'', zeit:'', dunkel:22, patina:34, blau:'#0757cb', orange:'#ff891c',
      absender:'SV/BSC MÖRLENBACH · FUSSBALL', spruch:'GEMEINSAM. LAUTER. STÄRKER.',
      ebenen:{ foto:true, marke:true, titel:true, lead:true, termin:true, kasten:true, spruch:true } } };
Object.assign(EV.s, EV_VORLAGEN.nachspielzeit.s);
const evE = s => svEsc(s == null ? '' : String(s));

/* ---------- Schrift und Umbruch ---------- */
function evSchrift(ctx, gewicht, groesse, familie){ ctx.font = `${gewicht} ${groesse}px ${familie === 'b' ? "TKB,'InterV',sans-serif" : "TKC,'BarlowC','Barlow Condensed',sans-serif"}`; }
function evUmbruch(ctx, text, breite){
  const W = String(text || '').split(/\s+/).filter(Boolean), Z = []; let z = '';
  for(const w of W){ const t = z ? z + ' ' + w : w; if(ctx.measureText(t).width <= breite || !z) z = t; else { Z.push(z); z = w; } }
  if(z) Z.push(z); return Z; }
function evDatumTeile(datum){
  let d = null; try{ d = new Date(datum + 'T12:00:00'); }catch(e){}
  if(!d || isNaN(d.getTime())) return null;
  return { tag:d.toLocaleDateString('de-DE', { weekday:'long' }).toUpperCase(),
    datum:(d.getDate() + '. ' + d.toLocaleDateString('de-DE', { month:'long' })).toUpperCase(), jahr:String(d.getFullYear()) }; }

/* ---------- Bausteine: jeder kennt seine Höhe und malt sich an y ---------- */
function evBausteine(ctx, S, x, bw, u, teil){
  const E = S.ebenen, warm = '#f1efe9', blau = S.blau || '#0757cb', orange = S.orange || '#ff891c', B = [];
  const add = (h, mal, luft) => B.push({ h, mal, luft:luft || 0 });
  if(teil !== 'rechts'){
    if(E.marke){
      const ag = 26 * u; add(ag, y => pkGesperrt(ctx, S.absender, x, y + ag * .8, ag, warm, ag * .30, 'left', bw, 600), 30 * u);
      if(S.kicker){ const kg = 27 * u; add(kg, y => pkGesperrt(ctx, S.kicker, x, y + kg * .8, kg, orange, kg * .22, 'left', bw, 700), 30 * u); }
    }
    if(E.titel){
      const z1 = String(S.zeile1 || '').toUpperCase(), z2 = String(S.zeile2 || '').toUpperCase();
      const r1 = z1 ? pkKopfVerhaeltnis(z1) : 1, r2 = z2 ? pkKopfVerhaeltnis(z2) : 1;
      /* Beide Zeilen auf dieselbe Breite, die kurze Zeile wird höher. Sehr kurze erste Zeile: höchstens 1,9-mal so hoch wie die zweite. */
      let breite = bw, h1 = z1 ? breite / r1 : 0, h2 = z2 ? breite / r2 : 0;
      if(h1 && h2 && h1 > h2 * 1.5){ h1 = h2 * 1.5; }
      /* Die Headline darf höchstens gut 40 % der Fläche nehmen, sonst bleibt für Termin und Programm zu wenig */
      const spalt = 12 * u, kmax = S._kopfMax || Infinity, kh = h1 + (z2 ? spalt + h2 : 0);
      if(kh > kmax){ const f = kmax / kh; h1 *= f; h2 *= f; breite *= f; }
      const b1 = z1 ? h1 * r1 : 0;
      add(h1 + (z2 ? spalt + h2 : 0), y => {
        if(z1) pkKopf(ctx, z1, x, y, b1, h1, warm, +S.patina || 0, EV.skala || 1);
        if(z2) pkKopf(ctx, z2, x, y + h1 + spalt, breite, h2, blau, +S.patina || 0, EV.skala || 1);
      }, 32 * u);
      if(S.unter){ const ug = 40 * u; add(ug, y => pkGesperrt(ctx, S.unter, x, y + ug * .82, ug, warm, ug * .06, 'left', bw, 700), 34 * u); }
      add(9 * u, y => { ctx.fillStyle = orange; ctx.fillRect(x, y, 108 * u, 9 * u); }, 40 * u);
    }
    if(E.lead && (S.lead1 || S.lead2)){
      const lg = 62 * u; evSchrift(ctx, 600, lg, 'b');
      const Z = [...evUmbruch(ctx, S.lead1, bw), ...evUmbruch(ctx, S.lead2, bw)];
      add(Z.length * lg * 1.18, y => { evSchrift(ctx, 600, lg, 'b'); ctx.fillStyle = warm; ctx.textAlign = 'left';
        Z.forEach((z, i) => ctx.fillText(z, x, y + lg * .92 + i * lg * 1.18)); }, 48 * u);
    }
  }
  if(teil !== 'links'){
    if(E.termin){
      const D = evDatumTeile(S.datum);
      const lg = 27 * u; add(lg, y => pkGesperrt(ctx, D ? D.tag + (S.zeit ? ' · AB ' + S.zeit + ' UHR' : '') : 'TERMIN FOLGT', x, y + lg * .8, lg, warm, lg * .22, 'left', bw, 700), 10 * u);
      if(D){ const dg = 128 * u; add(dg * .9, y => { evSchrift(ctx, 800, dg, 'c'); ctx.fillStyle = orange; ctx.textAlign = 'left';
          const t = D.datum, m = ctx.measureText(t).width, f = Math.min(1, bw * .78 / m); ctx.save(); ctx.translate(x, y + dg * .82); ctx.scale(f, 1); ctx.fillText(t, 0, 0); ctx.restore();
          /* Jahr klein direkt dahinter, auf derselben Grundlinie */
          evSchrift(ctx, 700, dg * .42, 'c'); ctx.fillStyle = 'rgba(255,137,28,.78)'; ctx.fillText(D.jahr, x + m * f + dg * .22, y + dg * .82); }, 22 * u); }
      if(S.anlass){ const ag = 48 * u; evSchrift(ctx, 700, ag, 'c'); const Z = evUmbruch(ctx, S.anlass, bw);
        add(Z.length * ag * 1.1, y => { evSchrift(ctx, 700, ag, 'c'); ctx.fillStyle = '#ffffff'; Z.forEach((z, i) => ctx.fillText(z, x, y + ag * .86 + i * ag * 1.1)); }, 8 * u); }
      if(S.ort){ const og = 36 * u, is = 34 * u; add(og * 1.1, y => { pkIcon(ctx, 'ort', x, y + og * .05, is, 'rgba(226,230,234,.9)');
          evSchrift(ctx, 500, og, 'b'); ctx.fillStyle = 'rgba(226,230,234,.92)'; ctx.fillText(S.ort, x + is + 12 * u, y + og * .86, bw - is - 12 * u); }, 40 * u); }
    }
    if(E.kasten && (S.kastenTitel || S.programm || S.hinweis)){
      const pad = 34 * u, iw = bw - pad * 2, tg = 50 * u, pg = 38 * u, hg = 34 * u;
      evSchrift(ctx, 800, tg, 'c'); const T = evUmbruch(ctx, String(S.kastenTitel || '').toUpperCase(), iw);
      evSchrift(ctx, 500, pg, 'b'); const P = evUmbruch(ctx, S.programm, iw);
      evSchrift(ctx, 700, hg, 'b'); const H = evUmbruch(ctx, S.hinweis, iw);
      const hoehe = pad + T.length * tg * 1.05 + (P.length ? 16 * u + P.length * pg * 1.3 : 0) + (H.length ? 18 * u + H.length * hg * 1.3 : 0) + pad * .8;
      add(hoehe, y => {
        ctx.save(); ctx.fillStyle = 'rgba(9,24,58,.86)'; ctx.shadowColor = 'rgba(0,0,0,.35)'; ctx.shadowBlur = 30 * u; ctx.fillRect(x, y, bw, hoehe); ctx.restore();
        ctx.fillStyle = blau; ctx.fillRect(x, y, 8 * u, hoehe);
        let yy = y + pad;
        evSchrift(ctx, 800, tg, 'c'); ctx.fillStyle = warm; ctx.textAlign = 'left'; T.forEach(z => { ctx.fillText(z, x + pad, yy + tg * .86); yy += tg * 1.05; });
        if(P.length){ yy += 16 * u; evSchrift(ctx, 500, pg, 'b'); ctx.fillStyle = 'rgba(232,236,240,.94)'; P.forEach(z => { ctx.fillText(z, x + pad, yy + pg * .95); yy += pg * 1.3; }); }
        if(H.length){ yy += 18 * u; evSchrift(ctx, 700, hg, 'b'); ctx.fillStyle = orange; H.forEach(z => { ctx.fillText(z, x + pad, yy + hg * .95); yy += hg * 1.3; }); }
      }, 0);
    }
  }
  return B; }

/* Bausteine zwischen oben und unten setzen: passt es nicht, wird alles kleiner; ist Platz übrig, wachsen die Abstände. */
function evSetzen(ctx, S, x, bw, oben, unten, u, teil, mitte){
  S._kopfMax = (unten - oben) * (teil === 'links' ? .62 : .40);
  let B = evBausteine(ctx, S, x, bw, u, teil);
  const summe = L => L.reduce((a, b) => a + b.h + b.luft, 0) - (L.length ? L[L.length - 1].luft : 0);
  let f = 1, n = 0;
  while(summe(B) > unten - oben && n++ < 6){ f *= Math.max(.7, (unten - oben) / summe(B) * .98); B = evBausteine(ctx, S, x, bw, u * f, teil); }
  const frei = Math.max(0, unten - oben - summe(B)), luefte = B.slice(0, -1).reduce((a, b) => a + b.luft, 0) || 1;
  /* Übrigen Platz: höchstens das Doppelte der Abstände, der Rest bleibt als Rand (oben bündig, in Quer mittig) */
  const dehn = Math.min(frei, luefte * 1.2), rest = frei - dehn;
  let y = oben + (mitte ? rest / 2 : rest * .35);
  B.forEach((b, i) => { b.mal(y); y += b.h + (i < B.length - 1 ? b.luft + b.luft / luefte * dehn : 0); });
}

function evMalen(cv, S, A, skala){
  const [w, h] = EV_FORMATE[S.format] || EV_FORMATE.story, quer = S.format === 'quer', story = S.format === 'story';
  const ctx = cv.getContext('2d'); cv.width = Math.round(w * skala); cv.height = Math.round(h * skala);
  ctx.setTransform(skala, 0, 0, skala, 0, 0); ctx.imageSmoothingEnabled = true; ctx.imageSmoothingQuality = 'high';
  EV.skala = skala;
  const E = S.ebenen;
  ctx.fillStyle = '#05101d'; ctx.fillRect(0, 0, w, h);
  if(E.foto && A.foto){ const f = Math.max(w / A.foto.width, h / A.foto.height), dw = A.foto.width * f, dh = A.foto.height * f;
    ctx.drawImage(A.foto, (w - dw) / 2, (h - dh) * .5, dw, dh); }
  else { const g = ctx.createRadialGradient(w * .8, h * .1, 0, w * .8, h * .1, Math.max(w, h)); g.addColorStop(0, 'rgba(7,87,203,.45)'); g.addColorStop(1, 'rgba(5,16,29,0)'); ctx.fillStyle = g; ctx.fillRect(0, 0, w, h); }
  /* Lesbarkeit: links und unten dunkler, ohne das Foto zuzudecken */
  const d = (+S.dunkel || 0) / 100;
  const g1 = ctx.createLinearGradient(0, 0, w, 0); g1.addColorStop(0, `rgba(2,9,18,${(.55 + d * .35).toFixed(3)})`); g1.addColorStop(quer ? .62 : 1, `rgba(2,9,18,${(.18 + d * .4).toFixed(3)})`);
  ctx.fillStyle = g1; ctx.fillRect(0, 0, w, h);
  const g2 = ctx.createLinearGradient(0, 0, 0, h); g2.addColorStop(0, 'rgba(2,9,18,.30)'); g2.addColorStop(.35, 'rgba(2,9,18,.05)'); g2.addColorStop(.7, `rgba(2,9,18,${(.35 + d * .3).toFixed(3)})`); g2.addColorStop(1, `rgba(2,9,18,${(.6 + d * .3).toFixed(3)})`);
  ctx.fillStyle = g2; ctx.fillRect(0, 0, w, h);
  /* Senkrechte Vereinskante links: Blau oben, Orange unten (wie die Vorlage) */
  const kante = Math.max(6, w * .011); ctx.fillStyle = S.blau || '#0757cb'; ctx.fillRect(0, 0, kante, h * .5); ctx.fillStyle = S.orange || '#ff891c'; ctx.fillRect(0, h * .5, kante, h * .5);

  const u = w / 1080, rand = w * .075;
  /* Story: oben die Profilzeile, unten die Antwortleiste von Instagram freilassen */
  const oben = story ? h * .115 : h * .06, spruchY = story ? h * .855 : h * .955, unten = (E.spruch ? spruchY - 70 * u : h * .95) - (story ? 0 : 0);
  if(quer){
    const uq = h / 1080, lb = w * .47;
    evSetzen(ctx, S, rand, lb, h * .08, h * .86, uq, 'links', true);
    evSetzen(ctx, S, w * .58, w * .42 - rand * .6, h * .08, h * .86, uq, 'rechts', true);
  } else evSetzen(ctx, S, rand, w - rand * 2, oben, unten, u, 'alle', false);
  if(E.spruch){ const sg = (quer ? h / 1080 : u) * 23;
    pkGesperrt(ctx, S.spruch, w * .5, quer ? h * .95 : spruchY, sg, 'rgba(226,230,234,.9)', sg * .42, 'center', w - rand * 2, 600); }
  return cv; }

/* ---------- Bilder ---------- */
async function evAssets(){
  const S = EV.s; let foto = null;
  if(S.foto === 'eigen' && EV.eigen) foto = EV.eigen;
  else if(S.foto && S.foto.startsWith('bib:')){ const url = await sbUrl(S.foto.slice(4)); foto = url ? await pkBild(url) : null; }
  else if(S.foto && S.foto !== 'ohne') foto = await pkBild('plakat/foto/' + S.foto + '.webp');
  return { foto }; }
let evBib = null;
// 0.99.21: dieselbe Bibliothek wie Spielplakat und Ergebnis (svm98.js)
async function evBibLaden(neu){ if(evBib && !neu) return evBib; evBib = await sbBibLaden(neu); return evBib; }

/* ---------- Speichern im Team ---------- */
const evSchluessel = () => 'event-' + (EV.s.datum || 'ohne-datum') + '-' + (pkNorm(EV.s.zeile1 + EV.s.zeile2) || 'event').slice(0, 40);
async function evListe(){ try{ const { data } = await SVB.sb.from('plakat_spiel').select('spiel,datum,einstell').like('spiel', 'event-%').order('datum', { ascending:false }).limit(20);
    EV.liste = data || []; }catch(e){ EV.liste = []; } return EV.liste; }
let evMerkT = 0;
function evMerken(){ clearTimeout(evMerkT); evMerkT = setTimeout(async () => {
  const id = EV.id || evSchluessel(); EV.id = id;
  const s = { ...EV.s }; if(s.foto === 'eigen') s.foto = 'night';
  try{ await svtRpc('plakat_merken', { p:{ spiel:id, datum:EV.s.datum || null, zeit:/^\d\d:\d\d$/.test(EV.s.zeit) ? EV.s.zeit : null, heim:true, gegner:null, spielort:EV.s.ort || null, texte:{}, einstell:{ event:s, format:EV.format } } }); }
  catch(e){ console.warn('Event merken', e); } }, 900); }

/* ---------- Oberfläche ---------- */
function evSchalter(P){ const leiste = P && P.querySelector('.tk-modus'); if(!leiste || leiste.querySelector('[data-tkm="event"]')) return;
  const b = document.createElement('button'); b.type = 'button'; b.setAttribute('role', 'tab'); b.dataset.tkm = 'event'; b.innerHTML = `${SVI('star')} Event`;
  b.className = TKR.modus === 'event' ? 'on' : ''; leiste.appendChild(b); b.onclick = () => tkModus('event'); }
/* tkSchalter (svm64) baut die Leiste oben; danach kommt der vierte Knopf dazu. Liegt das Event offen, bleibt es offen. */
{ const _ts89 = tkSchalter; tkSchalter = function(P){ const neu = P && !P.querySelector('.tk-modus'); const r = _ts89.apply(this, arguments); evSchalter(P);
  if(neu && TKR.modus === 'event'){ P.querySelectorAll(':scope > :not(.tk-modus)').forEach(e => e.remove()); evStart(P); } return r; }; }
{ const _tm89 = tkModus; tkModus = async function(m){ const P = document.getElementById('panel-plakat');
  if(m === 'event'){ if(!P || TKR.modus === 'event') return; TKR.modus = 'event';
    P.querySelectorAll(':scope > :not(.tk-modus)').forEach(e => e.remove()); P.querySelectorAll('.tk-modus [data-tkm]').forEach(b => b.classList.toggle('on', b.dataset.tkm === 'event'));
    return evStart(P); }
  return _tm89.apply(this, arguments); }; }

async function evStart(P){
  const h = document.createElement('div'); h.className = 'tk-wrap ev-wrap'; h.innerHTML = '<div class="card"><div class="empty">Lade Schriften und Bilder …</div></div>'; P.appendChild(h);
  await Promise.all([pkFontsLaden(), tkFonts(), evListe(), evBibLaden()]);
  if(!EV.s.datum){ const n = new Date(); n.setDate(n.getDate() + ((7 - n.getDay()) % 7 || 7)); EV.s.datum = n.toISOString().slice(0, 10); }
  evOberflaeche(h); evZeichnen(); }

function evOberflaeche(h){
  const S = EV.s, opt = (v, t, an) => `<option value="${evE(v)}"${an ? ' selected' : ''}>${evE(t)}</option>`;
  const fm = Object.entries(EV_FORMATE).map(([k, v]) => `<button type="button" class="btn sm ghost tk-fmt${EV.format === k ? ' on' : ''}" data-evf="${k}">${evE(v[2])}</button>`).join('');
  const gespeichert = EV.liste.map(r => { const e = (r.einstell || {}).event || {}; return opt(r.spiel, `${r.datum ? new Date(r.datum + 'T12:00:00').toLocaleDateString('de-DE') : 'ohne Datum'} · ${(e.zeile1 || '') + (e.zeile2 || '')}`, r.spiel === EV.id); }).join('');
  const foto = (id, titel, src) => `<button type="button" class="er-bg${S.foto === id ? ' on' : ''}" data-evb="${evE(id)}" title="${evE(titel)}">${src ? `<img src="${evE(src)}" alt="" loading="lazy">` : '<i class="ev-ohne"></i>'}<span>${evE(titel)}</span></button>`;
  const fotos = foto('ohne', 'Ohne Foto') + PK_FOTOS.map(f => foto(f.id, f.titel, 'plakat/foto/klein/' + f.id + '.webp')).join('')
    + sbListe().map(m => foto('bib:' + m.pfad, m.name || 'Bibliothek', tkFotoUrl(m.pfad))).join('')
    + (EV.eigen ? foto('eigen', EV.eigenName || 'Eigenes Foto', EV.eigen.src) : '');
  const feld = (id, label, wert, max, ph) => `<label class="tk-feld ev-feld"><span>${evE(label)}</span><input id="${id}" maxlength="${max}" value="${evE(wert)}"${ph ? ` placeholder="${evE(ph)}"` : ''}></label>`;
  h.innerHTML = `
    <div class="card pk-vorschau tk-vorschau">
      <div class="pk-buehne tk-buehne"><canvas id="evCanvas" aria-label="Vorschau des Event-Plakats"></canvas></div>
      <div class="pk-unten"><div class="pk-fmts">${fm}</div>
        <div class="pk-aktion"><button type="button" class="btn sm ghost" id="evTeilen">${SVI('share')} Teilen</button><button type="button" class="btn sm" id="evExport">${SVI('download')} PNG laden</button></div></div>
      <p class="tk-hinweis" id="evInfo"></p>
    </div>
    <div class="card pk-steuer tk-steuer ev-steuer">
      <div class="ev-kopf">
        <label class="tk-feld"><span>Vorlage</span><select id="evVorlage">${Object.entries(EV_VORLAGEN).map(([k, v]) => opt(k, v.titel, S.vorlage === k)).join('')}</select></label>
        <label class="tk-feld"><span>Gespeichert</span><select id="evGespeichert">${opt('', 'Neues Event', !EV.id)}${gespeichert}</select></label>
      </div>
      <h4 class="ev-h">Termin</h4>
      <div class="ev-zwei"><label class="tk-feld ev-feld"><span>Datum</span><input id="evDatum" type="date" value="${evE(S.datum)}"></label>
        <label class="tk-feld ev-feld"><span>Ab Uhrzeit (optional)</span><input id="evZeit" type="time" value="${evE(S.zeit)}"></label></div>
      ${feld('evAnlass', 'Anlass', S.anlass, 70, 'Topspiel gegen den Tabellenführer')}
      ${feld('evOrt', 'Ort', S.ort, 60)}
      <h4 class="ev-h">Headline</h4>
      ${feld('evKicker', 'Über der Headline (orange)', S.kicker, 40)}
      <div class="ev-zwei">${feld('evZ1', 'Zeile 1 (weiß)', S.zeile1, 14)}${feld('evZ2', 'Zeile 2 (blau)', S.zeile2, 14)}</div>
      ${feld('evUnter', 'Unter der Headline', S.unter, 40)}
      <div class="ev-zwei">${feld('evL1', 'Satz 1', S.lead1, 40)}${feld('evL2', 'Satz 2', S.lead2, 40)}</div>
      <h4 class="ev-h">Programmkasten</h4>
      ${feld('evKT', 'Titel', S.kastenTitel, 40)}
      ${feld('evProg', 'Programm', S.programm, 90, 'Erste & Zweite. Fans. Musik & Essen.')}
      ${feld('evHinw', 'Hinweis (orange)', S.hinweis, 70, 'Essen vorbestellen bis Donnerstagabend.')}
      <h4 class="ev-h">Hintergrund</h4>
      <div class="er-bgs ev-bgs">${fotos}</div>
      <label class="btn sm ghost ev-upload sb-up">${SVI('upload')} <span data-sbt>Eigenes Foto hochladen</span><input type="file" id="evDatei" accept="image/*" hidden></label>
      <label class="tk-feld"><span>Dunkler für bessere Lesbarkeit</span><input type="range" id="evDunkel" min="0" max="80" value="${+S.dunkel || 0}"></label>
      <details class="tk-eb"><summary>Ebenen</summary><div>${EV_EBENEN.map(([k, t]) => `<label class="pk-eb"><input type="checkbox" data-eve="${k}"${S.ebenen[k] ? ' checked' : ''}><span>${evE(t)}</span></label>`).join('')}</div></details>
      <h4 class="ev-h">Text für WhatsApp und Instagram</h4>
      <textarea id="evText" rows="4" class="ev-text">${evE(evTextBauen())}</textarea>
      <button type="button" class="btn sm ghost" id="evKopie">${SVI('copy')} Text kopieren</button>
    </div>`;
  const neu = () => { evOberflaeche(h); evZeichnen(); };
  h.querySelectorAll('[data-evf]').forEach(b => b.onclick = () => { EV.format = b.dataset.evf; h.querySelectorAll('[data-evf]').forEach(x => x.classList.toggle('on', x === b)); evZeichnen(); evMerken(); });
  const t = (id, k, gross) => { const i = h.querySelector(id); i.oninput = () => { S[k] = gross ? i.value.toUpperCase() : i.value; evBald(); evMerken(); evTextNeu(h); }; };
  t('#evAnlass', 'anlass'); t('#evOrt', 'ort'); t('#evKicker', 'kicker', true); t('#evZ1', 'zeile1', true); t('#evZ2', 'zeile2', true); t('#evUnter', 'unter', true);
  t('#evL1', 'lead1'); t('#evL2', 'lead2'); t('#evKT', 'kastenTitel', true); t('#evProg', 'programm'); t('#evHinw', 'hinweis');
  h.querySelector('#evDatum').onchange = e => { S.datum = e.target.value; evZeichnen(); evMerken(); evTextNeu(h); };
  h.querySelector('#evZeit').onchange = e => { S.zeit = e.target.value; evZeichnen(); evMerken(); evTextNeu(h); };
  h.querySelector('#evDunkel').oninput = e => { S.dunkel = +e.target.value; evBald(); evMerken(); };
  h.querySelectorAll('[data-evb]').forEach(b => b.onclick = () => { S.foto = b.dataset.evb; h.querySelectorAll('[data-evb]').forEach(x => x.classList.toggle('on', x === b)); evZeichnen(); evMerken(); });
  h.querySelectorAll('[data-eve]').forEach(c => c.onchange = () => { S.ebenen[c.dataset.eve] = c.checked; evZeichnen(); evMerken(); });
  // 0.99.21: das eigene Foto wird im Bildpool gespeichert; ohne Recht im Studio bleibt es wie früher auf dem Gerät
  h.querySelector('#evDatei').onchange = async e => { const inp = e.target, f = inp.files && inp.files[0]; if(!f) return;
    sbKnopf(inp, true); const erg = await sbHochladen(f); sbKnopf(inp, false); inp.value = '';
    if(erg.ok){ evBib = SB.bib; S.foto = 'bib:' + erg.eintrag.pfad; neu(); evMerken(); kToast(SB_GESPEICHERT); return; }
    if(erg.grund !== 'recht'){ kToast(erg.text); return; }
    const r = new FileReader(); r.onload = () => { const i = new Image(); i.onload = () => { EV.eigen = i; EV.eigenName = f.name.replace(/\.[^.]+$/, '').slice(0, 24); S.foto = 'eigen'; neu(); kToast('Dein Foto bleibt nur auf diesem Gerät. ' + erg.text); }; i.src = r.result; }; r.readAsDataURL(f); };
  h.querySelector('#evVorlage').onchange = e => { const v = EV_VORLAGEN[e.target.value]; if(!v) return; Object.assign(S, v.s, { vorlage:e.target.value }); EV.id = ''; neu(); };
  h.querySelector('#evGespeichert').onchange = e => { const r = EV.liste.find(x => x.spiel === e.target.value);
    if(!r){ EV.id = ''; Object.assign(S, EV_VORLAGEN[S.vorlage || 'nachspielzeit'].s); neu(); return; }
    const ev = (r.einstell || {}).event || {}; Object.assign(S, ev); S.ebenen = { ...EV.s.ebenen, ...(ev.ebenen || {}) }; EV.format = (r.einstell || {}).format || EV.format; EV.id = r.spiel; neu(); };
  h.querySelector('#evKopie').onclick = async () => { const ta = h.querySelector('#evText'); try{ await navigator.clipboard.writeText(ta.value); kToast('Text kopiert'); }catch(e){ ta.select(); kToast('Text markiert, jetzt kopieren'); } };
  h.querySelector('#evExport').onclick = () => evExport(false); h.querySelector('#evTeilen').onclick = () => evExport(true); }

const evWort = t => String(t || '').split(/\s+/).filter(Boolean).map(w => /\//.test(w) ? w : w.charAt(0).toUpperCase() + w.slice(1).toLowerCase()).join(' ');
function evTextBauen(){ const S = EV.s; let d = null; try{ d = new Date(S.datum + 'T12:00:00'); }catch(e){}
  const gut = d && !isNaN(d.getTime());
  const wann = gut ? d.toLocaleDateString('de-DE', { weekday:'long', day:'numeric', month:'long' }) + (S.zeit ? ', ab ' + S.zeit + ' Uhr' : '') : 'Termin folgt';
  const titel = evWort((S.zeile1 + S.zeile2).replace(/\.$/, ''));
  return [`${titel}${S.unter ? ': ' + evWort(S.unter) : ''}`, `${wann}${S.anlass ? '. ' + S.anlass : ''}.`, S.ort ? S.ort + '.' : '', S.programm, S.hinweis].filter(Boolean).join('\n'); }
function evTextNeu(h){ const ta = h.querySelector('#evText'); if(ta && !ta.dataset.selbst) ta.value = evTextBauen(); }

let evZeit = 0; const evBald = () => { clearTimeout(evZeit); evZeit = setTimeout(evZeichnen, 120); };
async function evZeichnen(){ const cv = document.getElementById('evCanvas'); if(!cv) return;
  const A = await evAssets(); const [w, hh] = EV_FORMATE[EV.format];
  const S = { ...EV.s, format:EV.format }; evMalen(cv, S, A, Math.min(1, 900 / Math.max(w, hh)));
  const i = document.getElementById('evInfo'); if(i){ const [bw, bh] = EV_FORMATE[EV.format]; i.textContent = `PNG ${bw * 2} × ${bh * 2} px` + (EV.format === 'a4' || EV.format === 'a5' ? ' · 300 dpi zum Drucken' : ''); } }

let evLaeuft = false;
async function evExport(teilen){ if(evLaeuft) return; evLaeuft = true;
  try{ await Promise.all([pkFontsLaden(), tkFonts()]); const A = await evAssets(), cv = document.createElement('canvas');
    evMalen(cv, { ...EV.s, format:EV.format }, A, 2);
    const blob = await new Promise(ok => cv.toBlob(ok, 'image/png')); if(!blob) throw new Error('PNG konnte nicht erzeugt werden');
    const name = `SVBSC-${(EV.s.zeile1 + EV.s.zeile2).replace(/[^\wÄÖÜäöüß]+/g, '')}-${EV.s.datum || 'Event'}-${EV.format}.png`;
    const file = new File([blob], name, { type:'image/png' });
    if(teilen && navigator.canShare && navigator.canShare({ files:[file] })){ try{ await navigator.share({ files:[file], text:document.getElementById('evText')?.value || '' }); return; }catch(e){ if(e && e.name === 'AbortError') return; } }
    const a = document.createElement('a'); a.href = URL.createObjectURL(blob); a.download = name; document.body.appendChild(a); a.click(); a.remove(); setTimeout(() => URL.revokeObjectURL(a.href), 8000);
    kToast('Plakat als PNG geladen'); evMerken();
  }catch(e){ console.warn('Event-Export', e); kToast('Export hat nicht geklappt, bitte nochmal'); }
  finally{ evLaeuft = false; } }

(function(){ try{ const s=document.createElement('style'); s.id='svm89css'; s.textContent="/* Beta 1.00 · Spieltagsstudio: Events */\n.ev-steuer{display:flex;flex-direction:column;gap:10px}\n.ev-kopf,.ev-zwei{display:grid;grid-template-columns:1fr 1fr;gap:10px}\n@media (max-width:480px){.ev-zwei{grid-template-columns:1fr}}\n.ev-h{margin:10px 0 0;font-size:12px;font-weight:750;letter-spacing:.08em;text-transform:uppercase;color:var(--ink3)}\n.ev-feld input{width:100%}\n.ev-bgs{max-height:260px;overflow:auto}\n.ev-ohne{display:block;width:100%;height:100%;background:radial-gradient(circle at 80% 10%,rgba(7,87,203,.6),#05101d 70%)}\n.ev-upload{align-self:flex-start;cursor:pointer;min-height:44px;display:inline-flex;align-items:center;gap:6px}\n.ev-text{width:100%;font:inherit;font-size:14px;padding:10px 12px;border:1px solid var(--line);border-radius:12px;background:var(--surface2,transparent);color:var(--ink);resize:vertical}\n/* Vier Bereiche passen am Handy nebeneinander: Symbole klein, Text bleibt, notfalls zwei Reihen */\n@media (max-width:520px){.tk-modus{flex-wrap:wrap}.tk-modus button{flex:1 1 calc(50% - 4px);min-width:0;min-height:44px;font-size:13px;padding:0 6px}}\n@media (min-width:400px) and (max-width:520px){.tk-modus button{flex:1 1 0}.tk-modus button svg{display:none}}\n"; document.head.appendChild(s); }catch(e){} })();
/* =====================================================================
   Beta 0.99.2 · Leitung und Notfall (Konzept „Fortbestand und Zugriff“, Albert 11.11.2026)
   - Nutzer & Rollen: Der Super-Admin ist markiert. Wer nicht Super-Admin ist, kann Admins und den Super-Admin
     weder ändern noch sperren, löschen oder ihnen einen Anmeldelink machen. „Admin“ vergibt nur der Super-Admin.
     Die Regeln stehen in der Datenbank (136_super_admin.sql), die Oberfläche zeigt sie nur rechtzeitig an.
   - Mein Konto → „Leitung und Notfall“ (nur Admins):
     Super-Admin: Nachfolger bestimmen, Mastercode erzeugen (wird genau einmal gezeigt), laufende Übernahme abbrechen, Protokoll.
     Nachfolger: Übernahme mit dem Mastercode beantragen, Frist sehen.
   ===================================================================== */
const LN = { schutz:null };
const lnE = s => svEsc(s == null ? '' : String(s));
const lnDatum = t => { try{ return new Date(t).toLocaleString('de-DE', { day:'numeric', month:'long', year:'numeric', hour:'2-digit', minute:'2-digit' }); }catch(e){ return ''; } };
async function lnSchutz(){ try{ const { data } = await SVB.sb.rpc('leitung_schutz'); LN.schutz = data || null; }catch(e){ LN.schutz = null; } return LN.schutz; }

/* ---------- Nutzer & Rollen: markieren und sperren, was nur der Super-Admin darf ---------- */
async function lnAdminListe(){
  const P = document.getElementById('panel-admin'); if(!P) return;
  const S = await lnSchutz(); if(!S) return;
  const sup = new Set(S.supers || []), adm = new Set(S.admins || []);
  P.querySelectorAll('.urow[data-u]').forEach(r => {
    const id = r.dataset.u, b = r.querySelector('.nm b');
    if(sup.has(id) && b && !b.querySelector('.ln-super')) b.insertAdjacentHTML('beforeend', ' <span class="ln-super" title="Super-Admin: Eigentümer der App, kann als Einziger Admins ändern">Super-Admin</span>');
    if(S.ich_super) return;
    const geschuetzt = sup.has(id) || adm.has(id);
    const sel = r.querySelector('select[data-role]');
    if(sel){ sel.querySelectorAll('option[value="admin"]').forEach(o => { if(sel.value !== 'admin') o.disabled = true; });
      if(geschuetzt){ sel.disabled = true; sel.title = 'Admins ändert nur der Super-Admin'; } }
    if(geschuetzt) r.querySelectorAll('[data-act],[data-del],[data-link]').forEach(x => { x.disabled = true; x.title = 'Nur der Super-Admin'; x.classList.add('ln-aus'); });
  });
  const inv = P.querySelector('#svInvRole'); if(inv && !S.ich_super) inv.querySelectorAll('option[value="admin"]').forEach(o => o.remove());
}
{ const _ar90 = svAdminRender; svAdminRender = async function(){ const r = await _ar90.apply(this, arguments); try{ await lnAdminListe(); }catch(e){} return r; }; }

/* ---------- Mein Konto: Leitung und Notfall ---------- */
{ const _acc90 = svAccount; svAccount = function(){ const r = _acc90.apply(this, arguments); setTimeout(lnKonto, 0); return r; }; }
async function lnKonto(){
  if(typeof isAdmin !== 'function' || !isAdmin()) return;
  const M = document.getElementById('modal'); if(!M || M.querySelector('#lnSek')) return;
  const s = document.createElement('div'); s.className = 'editsec'; s.id = 'lnSek';
  s.innerHTML = `<h4>Leitung und Notfall</h4><p class="note">Lade …</p>`;
  const vor = M.querySelector('#svnLoeschSek'); vor ? M.insertBefore(s, vor) : M.appendChild(s);
  await lnZeichnen(s); }

async function lnZeichnen(s){
  let st = null, admins = [];
  try{ const { data, error } = await SVB.sb.rpc('notfall_stand'); if(error) throw error; st = data; }catch(e){ s.innerHTML = `<h4>Leitung und Notfall</h4><p class="note">Konnte nicht geladen werden: ${lnE(SVB.errText ? SVB.errText(e) : e.message)}</p>`; return; }
  if(!st){ s.remove(); return; }
  if(st.ich_super){ try{ const { data } = await SVB.sb.rpc('admin_list'); admins = (data || []).filter(u => u.role === 'admin' && u.active && u.id !== SVU.id); }catch(e){} }
  const offen = st.offen;
  const kopf = `<h4>Leitung und Notfall</h4>
    <p class="note">${st.ich_super ? 'Du bist <b>Super-Admin</b>: Eigentümer der App. Admins ändern, sperren und löschen kannst nur du.' : 'Admins und den Super-Admin ändert nur der Super-Admin.'}
      Nachfolger im Notfall: <b>${lnE(st.nachfolger || 'noch nicht bestimmt')}</b>.</p>`;
  const lauf = offen ? `<div class="ln-alarm" role="alert"><b>Notfall-Übernahme läuft</b><span>Beantragt von ${lnE(offen.von)} am ${lnE(lnDatum(offen.am))}. Ohne Abbruch wird ${lnE(offen.von)} am ${lnE(lnDatum(offen.frist))} Super-Admin.</span>
      ${st.ich_super ? `<button type="button" class="btn svn-rotvoll" id="lnAbbruch">${SVI('x')} Übernahme abbrechen</button>` : ''}</div>` : '';
  const superTeil = st.ich_super ? `
    <div class="ln-reihe"><label class="ln-feld"><span>Nachfolger im Notfall</span><select id="lnNach"><option value="">Niemand</option>${admins.map(a => `<option value="${lnE(a.id)}"${a.id === st.nachfolger_id ? ' selected' : ''}>${lnE(a.name || a.email)}</option>`).join('')}</select></label>
      <button type="button" class="btn ghost sm" id="lnNachGo">Speichern</button></div>
    ${admins.length ? '' : '<p class="note">Als Nachfolger kommt nur ein aktiver Admin in Frage. Mach die Person zuerst unter Nutzer & Rollen zum Admin.</p>'}
    <div class="ln-reihe"><div><b>Mastercode</b><p class="note" style="margin:2px 0 0">${st.code_da ? 'Erzeugt am ' + lnE(lnDatum(st.code_am)) + '. Er liegt versiegelt bei der Vertrauensperson.' : 'Noch kein gültiger Mastercode.'}</p></div>
      <button type="button" class="btn ghost sm" id="lnCode">${SVI('key')} ${st.code_da ? 'Neuen Code erzeugen' : 'Code erzeugen'}</button></div>
    <details class="ln-prot" id="lnProt"><summary>Protokoll der Leitung</summary><div class="note">Lade …</div></details>` : '';
  const nachTeil = st.ich_nachfolger && !st.ich_super && !offen ? `
    <details class="ln-prot"><summary>Notfall-Übernahme beantragen</summary>
      <p class="note">Nur, wenn Albert nicht erreichbar ist. Dafür braucht es den Mastercode aus dem versiegelten Umschlag. Danach läuft eine Frist von 7 Tagen, in der der Super-Admin jeden Tag eine Mitteilung bekommt und abbrechen kann.</p>
      <label class="ln-feld"><span>Mastercode</span><input id="lnEin" autocomplete="off" autocapitalize="characters" spellcheck="false" placeholder="XXXXX-XXXXX-XXXXX-XXXXX" maxlength="30"></label>
      <p class="note" id="lnEinFehler" role="alert" hidden></p>
      <button type="button" class="btn sm" id="lnEinGo">Übernahme beantragen</button></details>` : '';
  s.innerHTML = kopf + lauf + superTeil + nachTeil;
  const neu = () => lnZeichnen(s);
  const ab = s.querySelector('#lnAbbruch'); if(ab) ab.onclick = async () => { ab.disabled = true;
    try{ const { error } = await SVB.sb.rpc('notfall_abbrechen'); if(error) throw error; kToast('Übernahme abgebrochen. Bitte einen neuen Mastercode erzeugen.'); neu(); }catch(e){ ab.disabled = false; kToast('⚠️ ' + (SVB.errText ? SVB.errText(e) : e.message)); } };
  const ng = s.querySelector('#lnNachGo'); if(ng) ng.onclick = async () => { ng.disabled = true;
    try{ const v = s.querySelector('#lnNach').value || null; const { error } = await SVB.sb.rpc('notfall_nachfolger_setzen', { p_id:v }); if(error) throw error; kToast('Nachfolger gespeichert'); neu(); }catch(e){ ng.disabled = false; kToast('⚠️ ' + (SVB.errText ? SVB.errText(e) : e.message)); } };
  const cb = s.querySelector('#lnCode'); if(cb) cb.onclick = () => lnCodeDialog(st.code_da, neu);
  const pr = s.querySelector('#lnProt'); if(pr) pr.addEventListener('toggle', () => { if(pr.open) lnProtokoll(pr); }, { once:false });
  const eg = s.querySelector('#lnEinGo'); if(eg) eg.onclick = async () => { const f = s.querySelector('#lnEinFehler'); eg.disabled = true; f.hidden = true;
    try{ const { data, error } = await SVB.sb.rpc('notfall_beantragen', { p_code:s.querySelector('#lnEin').value }); if(error) throw error;
      if(!data || !data.ok){ f.textContent = (data && data.grund) || 'Hat nicht geklappt.'; f.hidden = false; eg.disabled = false; return; }
      kToast('Übernahme beantragt. Der Super-Admin wird benachrichtigt.'); neu(); }catch(e){ eg.disabled = false; f.textContent = SVB.errText ? SVB.errText(e) : e.message; f.hidden = false; } };
}

async function lnProtokoll(pr){
  const ziel = pr.querySelector('div'); if(!ziel) return;
  try{ const { data, error } = await SVB.sb.rpc('rollen_protokoll', { p_limit:30 }); if(error) throw error;
    const was = { rolle:'Rolle geändert', notfall_uebernahme:'Notfall-Übernahme', notfall_nachfolger:'Nachfolger bestimmt', notfall_code_neu:'Neuer Mastercode', notfall_beantragt:'Übernahme beantragt', notfall_abgebrochen:'Übernahme abgebrochen' };
    const R = { admin:'Admin', vorstand:'Vorstand', planer:'Kaderplaner', trainer:'Trainer', jugend:'Jugendtrainer', viewer:'Gast', spieler:'Spieler', helfer:'Helfer' };
    const z = l => { if(l.was !== 'rolle' && l.was !== 'notfall_uebernahme') return '';
      const v = l.vorher || {}, n = l.nachher || {}, t = [];
      if(v.role !== n.role) t.push(`${R[v.role] || v.role} → ${R[n.role] || n.role}`); if(v.active !== n.active) t.push(n.active ? 'freigegeben' : 'gesperrt'); if(v.super !== n.super) t.push(n.super ? 'Super-Admin' : 'nicht mehr Super-Admin'); return t.join(', '); };
    ziel.className = 'ln-liste';
    ziel.innerHTML = (data || []).length ? data.map(l => `<div><span>${lnE(lnDatum(l.am))}</span><b>${lnE(was[l.was] || l.was)}: ${lnE(l.ziel)}</b><small>${lnE(z(l))}${l.von ? ' · von ' + lnE(l.von) : ''}</small></div>`).join('') : '<p class="note">Noch keine Einträge.</p>';
  }catch(e){ ziel.textContent = 'Konnte nicht geladen werden.'; } }

function lnCodeDialog(schonDa, fertig){
  const M = svModal(`<div class="og-form"><h2>${schonDa ? 'Neuen Mastercode erzeugen?' : 'Mastercode erzeugen'}</h2>
    <p>Der Mastercode ist die zweite Hälfte des Notfallzugangs. Er wird <b>genau einmal</b> angezeigt. Schreib ihn ab oder drucke ihn, steck ihn in einen Umschlag, versiegle ihn und gib ihn der Vertrauensperson.</p>
    ${schonDa ? '<p>Der bisherige Code gilt danach nicht mehr. Den alten Umschlag bitte zurückholen und vernichten.</p>' : ''}
    <div class="btnrow sbact"><button type="button" class="btn" id="lnJa">${SVI('key')} Code erzeugen</button><button type="button" class="btn ghost" id="lnNein">Abbrechen</button></div></div>`);
  M.querySelector('#lnNein').onclick = () => closeOverlay();
  M.querySelector('#lnJa').onclick = async () => { const b = M.querySelector('#lnJa'); b.disabled = true;
    try{ const { data, error } = await SVB.sb.rpc('notfall_code_neu'); if(error) throw error;
      M.querySelector('.og-form').innerHTML = `<h2>Dein Mastercode</h2>
        <p class="ln-code" aria-label="Mastercode">${lnE(data)}</p>
        <p>Für den Umschlag: „Mastercode Notfallzugang SVBSC-App. Nur zusammen mit dem Nachfolger verwenden, wenn Albert Klee nicht erreichbar ist. Eingabe in der App unter Mein Konto, Leitung und Notfall.“</p>
        <p class="note">Dieser Code wird nicht noch einmal angezeigt und ist nirgends lesbar gespeichert, nur seine Prüfsumme.</p>
        <div class="btnrow sbact"><button type="button" class="btn ghost" id="lnKopie">${SVI('copy')} Kopieren</button><button type="button" class="btn" id="lnFertig">Erledigt, Umschlag ist versiegelt</button></div>`;
      M.querySelector('#lnKopie').onclick = async () => { try{ await navigator.clipboard.writeText(data); kToast('Kopiert. Danach bitte aus der Zwischenablage löschen.'); }catch(e){ kToast('Bitte abschreiben'); } };
      M.querySelector('#lnFertig').onclick = () => { closeOverlay(); setTimeout(() => { try{ svAccount(); }catch(e){} }, 50); if(fertig) fertig(); };
    }catch(e){ b.disabled = false; kToast('⚠️ ' + (SVB.errText ? SVB.errText(e) : e.message)); } }; }

(function(){ try{ const s=document.createElement('style'); s.id='svm90css'; s.textContent="/* Beta 0.99.2 · Leitung und Notfall */\n.ln-super{display:inline-block;margin-left:6px;padding:2px 8px;border-radius:999px;font-size:11px;font-weight:750;letter-spacing:.02em;background:rgba(255,137,28,.16);color:var(--ink);vertical-align:1px}\n.ln-aus{opacity:.35;pointer-events:none}\n#lnSek .ln-reihe{display:flex;align-items:flex-end;justify-content:space-between;gap:12px;flex-wrap:wrap;margin:10px 0}\n#lnSek .ln-feld{display:flex;flex-direction:column;gap:4px;flex:1 1 200px}\n#lnSek .ln-feld span{font-size:12.5px;font-weight:650;color:var(--ink3)}\n#lnSek .btn.sm{min-height:44px}\n.ln-alarm{display:flex;flex-direction:column;gap:8px;margin:10px 0;padding:12px 14px;border-radius:12px;border:1px solid rgba(239,68,68,.45);background:rgba(239,68,68,.10)}\n.ln-alarm span{font-size:14px;color:var(--ink2)}\n.ln-prot{margin-top:10px}\n.ln-prot summary{min-height:44px;display:flex;align-items:center;cursor:pointer;font-weight:650}\n.ln-liste{display:flex;flex-direction:column;gap:8px;max-height:280px;overflow:auto}\n.ln-liste>div{display:flex;flex-direction:column;padding:8px 10px;border-radius:10px;background:var(--surface2,rgba(148,163,196,.08))}\n.ln-liste span,.ln-liste small{font-size:12px;color:var(--ink3)}\n.ln-code{font:800 26px/1.3 ui-monospace,Menlo,Consolas,monospace;letter-spacing:.06em;text-align:center;padding:16px;border-radius:12px;background:var(--surface2,rgba(148,163,196,.1));user-select:all;overflow-wrap:anywhere}\n"; document.head.appendChild(s); }catch(e){} })();
/* =====================================================================
   Beta 0.99.3 · Zugangsanfragen freigeben (137_zugang.sql)
   Albert, 11.11.2026: „so easy wie irgendwie möglich, dass es nicht am Anmelden scheitert.“
   Wer sich selbst anmeldet (Mail mit Link, Passwort zweimal, oder Google/Apple), landet hier als Anfrage.
   Admins und Vorstand sehen oben in Nutzer & Rollen alle offenen Anfragen und geben mit einem Tipp frei.
   Beta 0.99.17 · Der Korb (149_zugang_korb.sql). Albert, 13.11.2026: „wie ein Warenkorb, wenn ein neuer User dazukommt.
   Freigeben als (Rolle) mit folgenden Rechten. Freigeben? Da kann ich dann noch Rechte adden oder herausnehmen.“
   Freigeben öffnet immer den Korb: wer hat was eingetragen, welche Hüte hat der Abgleich gefunden, welche Rolle, welche Bereiche.
   ===================================================================== */
const ZG_ART_T = { spieler:'Spieler/in', eltern:'Eltern', helfer:'Helfer/in', trainer:'Trainer/in', sonstiges:'Sonstiges' };
const ZG_ROLLE_VORSCHLAG = { trainer:'trainer', spieler:'spieler', helfer:'helfer' };   // 0.99.23: Spieler und Helfer sind eigene Rollen
// Funktionsrollen (Abteilungsleiter, Stellvertreter) heißen wie unter Nutzer & Rollen (svm80.js). Technisch: Gast plus Funktion im Bereich.
const zgFr = r => (typeof R80_FROLLE !== 'undefined' && R80_FROLLE[r]) || '';
// Vorschlag aus dem Organigramm: wer einen Bereich leitet oder vertritt, ist Abteilungsleiter oder Stellvertreter (nur wenn sonst Gast, Spieler oder Helfer dran wäre)
const zgFrVor = (korb, rolle) => { const H = (korb && korb.huete) || []; if(!['viewer', 'spieler', 'helfer'].includes(rolle)) return null;
  return H.some(h => h.typ === 'leitung' && /^verantwortlich/.test(h.text || '')) ? 'f:leitung' : H.some(h => h.typ === 'stellv') ? 'f:stellv' : null; };
const zgName = r => zgFr(r) || (typeof SV_ROLE_INFO !== 'undefined' && SV_ROLE_INFO[r] && SV_ROLE_INFO[r].t) || (typeof ROLE_T !== 'undefined' && ROLE_T[r]) || r;
async function zgKarte(){
  const P = document.getElementById('panel-admin'); if(!P || typeof canManage !== 'function' || !canManage()) return;
  let L = [];
  try{ const { data, error } = await SVB.sb.rpc('zugang_liste2'); if(error) throw error; L = data || []; }
  catch(e){ try{ const { data, error } = await SVB.sb.rpc('zugang_liste'); if(error) throw error; L = data || []; }catch(e2){ return; } }
  P.querySelectorAll('.zg-karte').forEach(x => x.remove());
  L.filter(a => !a.frei).forEach(a => P.querySelectorAll(`.urow[data-u="${a.id}"]`).forEach(r => r.remove()));   // offene Anfragen nur oben, nicht doppelt als „gesperrt“
  if(!L.length) return;
  const ADM = typeof isAdmin === 'function' && isAdmin();
  const rollen = (typeof SV_ROLES !== 'undefined' ? SV_ROLES : ['vorstand','planer','trainer','jugend','viewer']).filter(r => r !== 'admin' && (ADM || ['planer','trainer','viewer','jugend','spieler','helfer'].includes(r)));
  const FRL = ADM && typeof R80_FROLLE !== 'undefined';   // Abteilungsleiter und Stellvertreter zur Auswahl: Funktionen setzt nur ein Admin
  const k = document.createElement('div'); k.className = 'card zg-karte';
  k.innerHTML = `<div class="adm-head"><div><h3 style="margin:0">Zugangsanfragen <span class="zg-n">${L.length}</span></h3>
      <p style="margin:6px 0 0;font-size:13.5px">${L.some(a => !a.frei) ? 'Diese Personen haben sich selbst angemeldet und warten auf die Freigabe. Bis dahin sehen sie keine Daten.' : 'Schon freigeschaltet mit der einfachen Rolle. Im Korb liegt noch etwas, das du bestätigen solltest.'}</p></div></div>
    <div class="zg-liste">${L.map(a => { const vor = (a.korb && a.korb.rolle) || ZG_ROLLE_VORSCHLAG[a.art] || 'viewer', wahl0 = rollen.includes(vor) ? vor : (ZG_ROLLE_VORSCHLAG[a.art] || 'viewer'), wahl = (FRL && zgFrVor(a.korb, wahl0)) || wahl0;
      const hu = ((a.korb && a.korb.huete) || []).map(h => h.titel).filter((t, i, l) => l.indexOf(t) === i);
      return `<div class="zg-z" data-zg="${svEsc(a.id)}">
      <div class="zg-wer"><b>${svEsc(a.name || a.email)}</b><span>${svEsc(a.email)}${a.tel ? ' · ' + svEsc(a.tel) : ''}</span>
        <small>${svEsc([ZG_ART_T[a.art] || 'Angaben fehlen noch', a.team].filter(Boolean).join(' · '))} · ${svEsc(typeof svAgo === 'function' ? svAgo(a.am) : '')}${a.frei ? ' · freigeschaltet als ' + svEsc(zgName(a.rolle_jetzt)) + ', Korb noch offen' : a.bestaetigt ? '' : ' · E-Mail noch nicht bestätigt'}</small>
        ${hu.length ? `<div class="zg-hut">${hu.slice(0, 5).map(t => `<i>${svEsc(t)}</i>`).join('')}${hu.length > 5 ? `<i>+${hu.length - 5}</i>` : ''}</div>` : ''}</div>
      <select data-zgr aria-label="Rolle für ${svEsc(a.name || a.email)}">${rollen.concat(FRL ? ['f:leitung', 'f:stellv'] : []).map(r => `<option value="${r}"${wahl === r ? ' selected' : ''}>${svEsc(zgName(r))}</option>`).join('')}</select>
      <div class="zg-akt"><button type="button" class="btn sm" data-zgf>${SVI('check')} ${a.frei ? 'Korb ansehen' : 'Freigeben'}</button>${a.frei ? '<button type="button" class="btn sm ghost" data-zgp>Passt so</button>' : '<button type="button" class="btn sm ghost" data-zga>Ablehnen</button>'}</div>
    </div>`; }).join('')}</div>`;
  P.insertBefore(k, P.firstChild);
  k.querySelectorAll('.zg-z').forEach(z => {
    const id = z.dataset.zg;
    z.querySelector('[data-zgf]').onclick = () => zgKorb(id, z.querySelector('[data-zgr]').value);
    const weg = () => { z.remove(); if(!k.querySelector('.zg-z')) k.remove(); };
    const ab = z.querySelector('[data-zga]'); if(ab) ab.onclick = async ev => { const b = ev.currentTarget; b.disabled = true;
      try{ await SVB.admin('ablehnen', { user_id:id }); kToast('Anfrage abgelehnt'); weg(); }
      catch(e){ b.disabled = false; kToast('⚠️ ' + e.message); } };
    const ps = z.querySelector('[data-zgp]'); if(ps) ps.onclick = async ev => { const b = ev.currentTarget; b.disabled = true;
      try{ const { error } = await SVB.sb.rpc('zugang_korb_fertig', { p_id:id }); if(error) throw error; kToast('✓ Bleibt bei der einfachen Rolle'); weg(); }
      catch(e){ b.disabled = false; kToast('⚠️ ' + e.message); } };
  });
}

/* ---------- Der Korb ---------- */
const ZK_ICON = { spieler:'⚽', leitung:'★', stellv:'☆', team:'●', helfer:'🤝', gremium:'◆' };
async function zgKorb(id, rolleWahl){
  let K; try{ const { data, error } = await SVB.sb.rpc('zugang_korb', { p_id:id }); if(error) throw error; K = data; }
  catch(e){ kToast('⚠️ ' + String(e.message || e).replace(/^.*?: /, '')); return; }
  const P = K.person || {}, rollen = K.rollen || ['viewer'], plus = {}; (K.plus || []).forEach(x => { plus[x.key] = x.grund; });
  const Z = { rolle: rollen.includes(rolleWahl) ? rolleWahl : rollen.includes(K.rolle) ? K.rolle : (rollen.includes(K.rolle_jetzt) ? K.rolle_jetzt : 'viewer'), hand:{}, spieler: !!K.spieler, helfer: !!K.helfer };
  // 0.99.23: Wer laut Organigramm einen Bereich leitet oder vertritt, wird als Abteilungsleiter oder Stellvertreter vorgeschlagen, nicht als Gast.
  // Funktionen setzt nur ein Admin (admin_funktion_set), darum gibt es die Auswahl nur für ihn.
  const frDarf = !!K.rechte_aendern && rollen.includes('viewer') && typeof isAdmin === 'function' && isAdmin() && typeof R80_FROLLE !== 'undefined';
  if(frDarf && zgFr(rolleWahl)) Z.rolle = rolleWahl; else if(frDarf && !rolleWahl) Z.rolle = zgFrVor(K, Z.rolle) || Z.rolle;
  const eff = () => Z.rolle.startsWith('f:') ? 'viewer' : Z.rolle;   // Rolle, die wirklich im Konto steht
  const std = k => { const b = (K.bereiche || []).find(x => x.key === k); return Z.rolle === 'admin' || !!(b && (b.vorgabe || []).includes(eff())); };
  const an = k => k in Z.hand ? Z.hand[k] : (std(k) || (!!K.rechte_aendern && k in plus));   // ohne das Recht dazu zeigt der Korb nur, was die Rolle wirklich bringt
  const zeile = (t, w) => `<div><dt>${t}</dt><dd>${w ? svEsc(w) : '<em>nicht angegeben</em>'}</dd></div>`;
  const M = svModal(`<div class="zk" id="zk">
    <p class="zk-auge">${K.frei ? 'Schon freigegeben als ' + svEsc(zgName(K.rolle_jetzt)) : 'Neue Anfrage'} · ${svEsc(typeof svAgo === 'function' ? svAgo(P.am) : '')}</p>
    <h2>${svEsc(P.name || P.email)}</h2>
    <p class="zk-sub">hat eingetragen:</p>
    <dl class="zk-wer">${zeile('Vorname', P.vorname)}${zeile('Name', P.nachname)}${zeile('E-Mail', P.email)}${zeile('Handynummer', P.tel)}${P.art && P.art !== 'sonstiges' || P.team ? zeile('Ich bin', [ZG_ART_T[P.art], P.team].filter(Boolean).join(' · ')) : ''}</dl>
    ${P.bestaetigt ? '' : '<p class="zk-hinweis">Die E-Mail-Adresse ist noch nicht bestätigt.</p>'}
    ${K.doppelt ? `<p class="zk-hinweis">Es gibt schon ein Konto mit diesem Namen (${svEsc(zgName(K.doppelt.rolle))}, Adresse bei ${svEsc(K.doppelt.wo)}). Bitte prüfen, ob das alte Konto noch gebraucht wird.</p>` : ''}
    <h3>Im Korb</h3>
    <div class="zk-korb" id="zkKorb">${(K.huete || []).length ? (K.huete || []).map(h => { const wahl = h.typ === 'spieler' ? 'spieler' : h.typ === 'helfer' ? 'helfer' : '';
        return `<label class="zk-hut${wahl ? '' : ' fest'}">${wahl ? `<input type="checkbox" data-zkh="${wahl}" checked>` : `<span class="zk-ic" aria-hidden="true">${ZK_ICON[h.typ] || '●'}</span>`}<span><b>${svEsc(h.titel)}</b><small>${svEsc(h.text || '')}</small></span></label>`; }).join('')
      : '<p class="zk-leer">Der Abgleich mit Kader, Organigramm und Helferpool hat nichts gefunden. Die Person kommt mit der einfachen Rolle rein.</p>'}</div>
    <h3>Freigeben als</h3>
    <select id="zkRolle" aria-label="Rolle">${frDarf ? '<optgroup label="Rolle">' : ''}${rollen.map(r => `<option value="${r}">${svEsc(zgName(r))}</option>`).join('')}${frDarf ? '</optgroup><optgroup label="Funktion in Bereichen">' + ['f:leitung', 'f:stellv'].map(r => `<option value="${r}">${svEsc(zgName(r))}</option>`).join('') + '</optgroup>' : ''}</select>
    <p class="zk-hinweis" id="zkRolleHinweis" hidden></p>
    ${K.rolle_moeglich === false ? `<p class="zk-hinweis">Vorschlag aus dem Organigramm: ${svEsc(zgName(K.rolle))}. Diese Rolle vergibt nur ein Admin.</p>` : ''}
    <h3>Mit diesen Rechten</h3>
    <div class="zk-rechte" id="zkRechte" role="group" aria-label="Bereiche"></div>
    <p class="zk-klein">${K.rechte_aendern ? 'Antippen nimmt einen Bereich heraus oder dazu. Feinere Rechte stellst du später unter Nutzer & Rollen ein.' : 'Einzelne Bereiche ändert nur ein Admin. Du gibst mit den Rechten der Rolle frei.'}</p>
    <p class="zk-satz" id="zkSatz" aria-live="polite"></p>
    <div class="zk-akt"><button type="button" class="btn" id="zkOk">${SVI('check')} ${K.frei ? 'Bestätigen' : 'Freigeben'}</button>${K.frei ? '' : '<button type="button" class="btn ghost" id="zkNein">Ablehnen</button>'}<button type="button" class="btn ghost" id="zkAb">Abbrechen</button></div>
  </div>`);
  const R = M.querySelector('#zkRechte'), S = M.querySelector('#zkSatz'), sel = M.querySelector('#zkRolle'); sel.value = Z.rolle;
  const malen = () => {
    { const hw = M.querySelector('#zkRolleHinweis'); if(hw){ const t = Z.rolle === 'spieler' ? 'Spieler sehen Termine, ihr Spielerkonto und ihre Mannschaft (Kader, Spiele, Tabelle), nur zum Ansehen. „1. Mannschaft“ unten ist der Trainerbereich mit Schreibrechten, Verletzungen und Kontaktdaten. Für Spieler bitte aus lassen.'
        : Z.rolle === 'helfer' ? 'Helfer sehen Termine und ihre eigenen Einsätze.' : Z.rolle === 'viewer' ? 'Gäste sehen Termine, Rankings und Teile des Scoutings. Für Spieler, Helfer, Abteilungsleiter und Stellvertreter gibt es eigene Rollen.'
        : Z.rolle.startsWith('f:') ? zgName(Z.rolle) + ': Tipp unten die Bereiche an, die die Person ' + (Z.rolle === 'f:leitung' ? 'leitet' : 'vertritt') + '. Dort bekommt sie alles, was zur Funktion gehört. Dazu sieht sie, was jeder Gast sieht.' : ''; hw.textContent = t; hw.hidden = !t; } }
    R.innerHTML = (K.bereiche || []).map(b => { const on = an(b.key), ab = on !== std(b.key);
      return `<button type="button" class="zk-b${on ? ' an' : ''}${ab ? ' ab' : ''}" data-zkb="${svEsc(b.key)}" aria-pressed="${on}"${K.rechte_aendern && Z.rolle !== 'admin' ? '' : ' disabled'}${plus[b.key] && on ? ` title="${svEsc('wegen: ' + plus[b.key])}"` : ''}>${svEsc(b.titel)}</button>`; }).join('');
    R.querySelectorAll('[data-zkb]').forEach(b => b.onclick = () => { const k = b.dataset.zkb; Z.hand[k] = !an(k); malen(); });
    const n = (K.bereiche || []).filter(b => an(b.key)).length;
    S.textContent = `${K.frei ? 'Bestätigen' : 'Freigeben'} als ${zgName(Z.rolle)} mit ${n === 1 ? 'einem Bereich' : n + ' Bereichen'}?`;
  };
  sel.onchange = () => { Z.rolle = sel.value; malen(); };
  M.querySelectorAll('[data-zkh]').forEach(c => c.onchange = () => { Z[c.dataset.zkh] = c.checked; });
  malen();
  M.querySelector('#zkAb').onclick = () => closeOverlay();
  const nein = M.querySelector('#zkNein'); if(nein) nein.onclick = async () => { nein.disabled = true;
    try{ await SVB.admin('ablehnen', { user_id:id }); kToast('Anfrage abgelehnt'); closeOverlay(); try{ if(typeof frLaden === 'function') frLaden(true).then(frKarte); }catch(e){} try{ if(typeof zhKarte === 'function') zhKarte(true); }catch(e){} await svAdminRender(true); }catch(e){ nein.disabled = false; kToast('⚠️ ' + e.message); } };
  M.querySelector('#zkOk').onclick = async ev => { const b = ev.currentTarget; const fehl = [];
    const fs = Z.rolle.startsWith('f:') ? Z.rolle.slice(2) : null, rolle = eff();
    if(fs && !(K.bereiche || []).some(x => an(x.key) && !std(x.key))){ kToast(zgName(Z.rolle) + ': bitte unten mindestens einen Bereich antippen.'); return; }
    b.disabled = true;
    try{
      let mail = '';
      if(!K.frei){ const r = await SVB.admin('freigeben', { user_id:id, role:rolle }); mail = r && r.mail === 'gesendet' ? ', die Mail ist raus' : ''; }
      else if(rolle !== K.rolle_jetzt){ const { error } = await SVB.sb.rpc('admin_update', { p_id:id, p_role:rolle, p_active:null, p_name:null }); if(error) throw error; }
      if(K.rechte_aendern && Z.rolle !== 'admin') for(const x of (K.bereiche || [])){ const on = an(x.key);
        if(on !== std(x.key)){ let error = true;
          // Abteilungsleiter und Stellvertreter: der Bereich bekommt die Funktion (setzt die Rechte der Unterbereiche nach ihrer Stufe)
          if(fs && on){ try{ error = (await SVB.sb.rpc('admin_funktion_set', { p_user:id, p_bereich:x.key, p_stufe:fs })).error; }catch(e){ error = e; } }
          if(error) error = (await SVB.sb.rpc('admin_zugriff_set', { p_user:id, p_bereich:x.key, p_an:on })).error;
          if(error) fehl.push(x.titel); } }
      if(Z.spieler && K.spieler){ const { error } = await SVB.sb.rpc('konto_spieler_setzen', { p_user:id, p_spieler:K.spieler.id }); if(error) fehl.push('Spieler'); }
      if(Z.helfer && K.helfer){ const { error } = await SVB.sb.rpc('einsatz_person_setzen', { p_key:'h:' + K.helfer.id, p_user:id }); if(error) fehl.push('Helfer'); }
      if(K.frei){ try{ await SVB.sb.rpc('zugang_korb_fertig', { p_id:id }); }catch(e){} }
      closeOverlay();
      if(typeof zgFertigZeigen !== 'function') kToast(fehl.length ? `⚠️ ${P.name || P.email} ist freigeschaltet, aber nicht gesetzt: ${fehl.join(', ')}` : `✓ ${P.name || P.email} ist freigeschaltet als ${zgName(Z.rolle)}${mail}`);
      try{ if(typeof frLaden === 'function') frLaden(true).then(frKarte); }catch(e){}
      await svAdminRender(true);
      // 0.99.45: „Spieler bestätigt“ mit den übrigen Wartenden (svm113.js)
      if(typeof zgFertigZeigen === 'function') zgFertigZeigen(P, zgName(Z.rolle), fehl, mail, id);
    }catch(e){ b.disabled = false; kToast('⚠️ ' + String(e.message || e)); }
  };
}
{ const _ar91 = svAdminRender; svAdminRender = async function(){ const r = await _ar91.apply(this, arguments); try{ await zgKarte(); }catch(e){} return r; }; }

(function(){ try{ const s=document.createElement('style'); s.id='svm91css'; s.textContent="/* Beta 0.99.3 · Zugangsanfragen */\n.zg-karte{border:1px solid rgba(91,155,255,.4)!important}\n.zg-n{display:inline-grid;place-items:center;min-width:24px;height:24px;padding:0 7px;margin-left:6px;border-radius:999px;background:var(--brand,#2f6bff);color:#fff;font-size:13px;vertical-align:2px}\n.zg-liste{display:flex;flex-direction:column;gap:10px;margin-top:12px}\n.zg-z{display:grid;grid-template-columns:1fr 170px auto;gap:10px;align-items:center;padding:12px;border-radius:12px;background:var(--surface2,rgba(148,163,196,.08))}\n.zg-wer{display:flex;flex-direction:column;gap:2px;min-width:0}\n.zg-wer span,.zg-wer small{color:var(--ink3);font-size:13px;overflow-wrap:anywhere}\n.zg-z select{min-height:44px}\n.zg-akt{display:flex;gap:8px}\n.zg-akt .btn{min-height:44px}\n@media (max-width:640px){.zg-z{grid-template-columns:1fr}.zg-akt .btn{flex:1}}\n\n/* Beta 0.99.17 · Der Korb */\n.zg-hut{display:flex;flex-wrap:wrap;gap:5px;margin-top:6px}\n.zg-hut i{font-style:normal;font-size:12px;line-height:1;padding:5px 8px;border-radius:999px;background:rgba(91,155,255,.16);color:var(--ink,#eef2fb)}\n.zk{display:flex;flex-direction:column;gap:10px;min-width:0}\n.zk h2{margin:0;font-size:26px;line-height:1.1;overflow-wrap:anywhere}\n.zk h3{margin:10px 0 0;font-size:13px;letter-spacing:.06em;text-transform:uppercase;color:var(--ink3)}\n.zk-auge,.zk-sub,.zk-klein{margin:0;font-size:13px;color:var(--ink3)}\n.zk-wer{margin:0;display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:8px 14px}\n.zk-wer div{min-width:0}\n.zk-wer dt{font-size:12px;color:var(--ink3)}\n.zk-wer dd{margin:2px 0 0;font-weight:600;overflow-wrap:anywhere}\n.zk-wer dd em{font-style:normal;font-weight:400;color:var(--ink3)}\n.zk-hinweis{margin:0;padding:10px 12px;border-radius:10px;background:rgba(245,158,11,.14);font-size:13.5px}\n.zk-korb{display:flex;flex-direction:column;gap:6px}\n.zk-hut{display:grid;grid-template-columns:28px 1fr;gap:10px;align-items:center;min-height:44px;padding:8px 12px;border-radius:12px;background:var(--surface2,rgba(148,163,196,.08))}\n.zk-hut input{width:20px;height:20px;margin:0}\n.zk-hut .zk-ic{text-align:center;color:var(--brand2,#5b9bff)}\n.zk-hut span{display:flex;flex-direction:column;min-width:0}\n.zk-hut small{color:var(--ink3);font-size:12.5px;overflow-wrap:anywhere}\n.zk-leer{margin:0;font-size:13.5px;color:var(--ink3)}\n.zk select{min-height:44px;width:100%}\n.zk-rechte{display:flex;flex-wrap:wrap;gap:6px}\n.zk-b{min-height:44px;padding:8px 12px;border-radius:999px;border:1px solid var(--line,#2a3550);background:transparent;color:var(--ink3);font:inherit;font-size:13.5px;cursor:pointer}\n.zk-b.an{background:var(--brand,#2f6bff);border-color:transparent;color:#fff}\n.zk-b.ab{box-shadow:0 0 0 2px rgba(245,158,11,.75)}\n.zk-b:disabled{cursor:default;opacity:.85}\n.zk-satz{margin:6px 0 0;font-weight:700;font-size:16px}\n.zk-akt{display:flex;flex-wrap:wrap;gap:8px}\n.zk-akt .btn{min-height:44px;flex:1 1 130px}\n.zk-wer div:nth-child(n+3){grid-column:1/-1}\n"; document.head.appendChild(s); }catch(e){} })();
/* =====================================================================
   Beta 0.99.4 · Fragen mit Ja und Nein (138_fragen.sql)
   Albert, 11.11.2026: „Auf der Push können Spieler dann einfach ja oder nein tippen.“
   - In der Store-App stehen die beiden Knöpfe in der Mitteilung selbst. Ein Tipp öffnet die App
     kurz mit #frage=<id>:ja und die Antwort ist gespeichert.
   - Wer die Mitteilung weggewischt hat, findet dieselbe Frage oben auf der Startseite.
   - Im Browser (Web-Push) hängen die Knöpfe ebenfalls an der Mitteilung, siehe sw.js.
   ===================================================================== */
const FR={offen:[],laeuft:null,geladen:0};
function frKnopf(t,w,id){ return `<button type="button" class="btn${w==='ja'?'':' ghost'} fr-b" data-fr-w="${w}" data-fr-id="${svEsc(id)}">${w==='ja'?SVI('check'):''} ${svEsc(t)}</button>`; }

async function frLaden(force){
  if(!force&&Date.now()-FR.geladen<20000)return FR.offen;
  try{ const {data,error}=await SVB.sb.rpc('fragen_offen'); if(error)throw error; FR.offen=Array.isArray(data)?data:[]; FR.geladen=Date.now(); }
  catch(e){ FR.offen=[]; }
  return FR.offen;
}
function frKarte(){
  const home=document.getElementById('panel-home'); if(!home)return;
  let k=document.getElementById('frKarte');
  if(!FR.offen.length){ if(k)k.remove(); return; }
  if(!k){ k=document.createElement('section'); k.id='frKarte'; k.className='card fr-karte'; k.setAttribute('aria-label','Offene Fragen'); }
  // Die Frage steht immer ganz oben, auch wenn andere Bereiche sich später dazwischenschieben
  const hello=document.getElementById('svHello'), soll=(hello&&hello.parentNode===home)?hello.nextSibling:home.firstChild;
  if(k.parentNode!==home||k.previousSibling!==(soll?soll.previousSibling:home.lastChild))home.insertBefore(k,soll);
  k.innerHTML=`<h3 class="fr-h">${FR.offen.length===1?'Kurze Frage an dich':FR.offen.length+' Fragen an dich'}</h3>
    <div class="fr-liste">${FR.offen.map(f=>`<div class="fr-z" data-fr="${svEsc(f.id)}">
      <div class="fr-tx"><b>${svEsc(f.titel)}</b>${f.text?`<span>${svEsc(f.text)}</span>`:''}${f.frist?`<small>Bitte bis ${svEsc(frZeit(f.frist))}</small>`:''}</div>
      <div class="fr-akt">${f.anfrage&&typeof zgKorb==='function'
        ?`<button type="button" class="btn fr-b" data-fr-korb="${svEsc(f.anfrage)}">${SVI('check')} Ansehen und freigeben</button>${frKnopf('Ablehnen','nein',f.id)}`
        :frKnopf((f.knoepfe||{}).ja||'Ja','ja',f.id)+frKnopf((f.knoepfe||{}).nein||'Nein','nein',f.id)}</div></div>`).join('')}</div>`;
  k.querySelectorAll('[data-fr-w]').forEach(b=>b.onclick=()=>svFrageAntwort(b.dataset.frId,b.dataset.frW,'app'));
  // Beta 0.99.17: Zugangsanfragen gehen in den Korb (Rolle und Rechte bestätigen) statt mit einem Tipp durch
  k.querySelectorAll('[data-fr-korb]').forEach(b=>b.onclick=()=>zgKorb(b.dataset.frKorb));
}
function frZeit(t){ try{ return new Date(t).toLocaleString('de-DE',{weekday:'short',day:'2-digit',month:'2-digit',hour:'2-digit',minute:'2-digit'})+' Uhr'; }catch(e){ return ''; } }

// Antwort speichern. via 'push' = aus der Mitteilung heraus, via 'app' = Knopf in der App.
async function svFrageAntwort(id,wert,via){
  if(!id||FR.laeuft===id)return false; FR.laeuft=id;
  const z=document.querySelector(`.fr-z[data-fr="${CSS.escape(String(id))}"]`);
  if(z)z.querySelectorAll('button').forEach(b=>b.disabled=true);
  try{
    const {data,error}=await SVB.sb.rpc('frage_antwort',{p_id:id,p_wert:wert,p_via:via==='push'?'push':'app'});
    if(error)throw error;
    FR.offen=FR.offen.filter(f=>String(f.id)!==String(id)); frKarte();
    if(typeof svHaptic==='function')svHaptic('success');
    kToast(`✓ ${(data&&data.text)||(wert==='ja'?'Ja':'Nein')} gespeichert`);
    return true;
  }catch(e){
    if(z)z.querySelectorAll('button').forEach(b=>b.disabled=false);
    kToast('⚠️ '+String((e&&e.message)||e).replace(/^.*?:\s*/,''));
    return false;
  }finally{ FR.laeuft=null; }
}

// Ziel aus der Mitteilung: #frage=<id> oder #frage=<id>:ja / :nein
{ const _p=svzParse; svzParse=function(h){ const s=String(h||'').replace(/^#/,'');
    const m=/^frage=([0-9a-f-]{36})(?::(ja|nein))?$/i.exec(s); if(m)return {frage:m[1],wert:m[2]||null};
    return _p.apply(this,arguments); }; }
{ const _z=svZiel; svZiel=async function(h,quelle){ const s=String(h||'').replace(/^#/,'');
    const m=/^frage=([0-9a-f-]{36})(?::(ja|nein))?$/i.exec(s);
    if(!m)return _z.apply(this,arguments);
    const t0=Date.now(); while(!svzBereit()&&Date.now()-t0<45000)await new Promise(r=>setTimeout(r,250));
    if(!svzBereit())return false;
    try{ goTab('home'); }catch(e){}
    if(m[2]){ const ok=await svFrageAntwort(m[1],m[2],'push'); await frLaden(true); frKarte(); return ok; }
    await frLaden(true); frKarte();
    const z=document.querySelector(`.fr-z[data-fr="${CSS.escape(m[1])}"]`);
    if(z){ try{ z.scrollIntoView({behavior:'smooth',block:'center'}); }catch(e){} z.classList.add('fr-hin'); setTimeout(()=>z.classList.remove('fr-hin'),2400); }
    else kToast('Diese Frage ist schon beantwortet');
    return true; }; }

// Startseite: Fragen mitladen und anzeigen
{ const _h=typeof htRender==='function'?htRender:null;
  if(_h){ htRender=function(){ const r=_h.apply(this,arguments); frLaden().then(frKarte); return r; }; } }

/* =====================================================================
   Beta 0.99.8 · App-Test: wer hat sich über /test.html angemeldet, wie weit ist er (142_app_tester.sql)
   Albert, 12.11.2026: „Leute sollen sich über den Funnel entscheiden, ob Play oder Apple, Daten eintragen. Will die User.“
   Karte in Nutzer & Rollen für Admin und Vorstand: Zähler je Handy, Liste mit Schritt, Konto und Store-App.
   Der Admin stellt hier um, sobald Google oder Apple freigeben, und schickt allen Wartenden mit einem Tipp Bescheid.
   ===================================================================== */
const AT93 = { L:null };
const AT93_SCHRITT = { android:['Eingetragen','Mail bestätigt','In der Gruppe','Tester bei Google','Installiert','Fertig'], ios:['Eingetragen','Mail bestätigt','TestFlight da','Installiert','Fertig'] };
const AT93_KONTO = { frei:'Zugang frei', anfrage:'wartet auf Freigabe', ohne:'noch kein Konto', gesperrt:'gesperrt' };
function at93Css(){ if(document.getElementById('svm93css')) return; const s = document.createElement('style'); s.id = 'svm93css';
  s.textContent = `.at-karte .at-zahl{display:flex;gap:10px;flex-wrap:wrap;margin:12px 0}.at-zahl div{flex:1;min-width:120px;padding:12px;border-radius:12px;background:var(--surface2,rgba(148,163,196,.08))}
.at-zahl b{display:block;font-size:26px;line-height:1;font-variant-numeric:tabular-nums}.at-zahl span{font-size:12.5px;color:var(--ink2,#a9b3c7)}
.at-bal{height:6px;border-radius:6px;background:rgba(148,163,196,.2);overflow:hidden;margin-top:8px}.at-bal i{display:block;height:100%;background:var(--brand,#2f6bff);border-radius:6px}
.at-liste{display:grid;gap:8px;margin-top:10px}.at-z{display:grid;grid-template-columns:1fr auto;gap:4px 10px;padding:10px 12px;border-radius:12px;background:var(--surface2,rgba(148,163,196,.08))}
.at-z small{grid-column:1/-1;color:var(--ink2,#a9b3c7);font-size:13px}.at-g{font-size:12px;font-weight:700;letter-spacing:.06em;padding:3px 8px;border-radius:99px;border:1px solid rgba(148,163,196,.35);align-self:start}
.at-g.ok{border-color:rgba(62,207,142,.6);color:#3ecf8e}.at-st{display:grid;gap:10px;margin-top:14px;padding-top:14px;border-top:1px solid rgba(148,163,196,.2)}
.at-st .at-r{display:flex;gap:8px;flex-wrap:wrap;align-items:center}.at-st input[type=url]{flex:1;min-width:200px;min-height:44px}.at-st label{display:flex;gap:8px;align-items:center;min-height:44px}`;
  document.head.appendChild(s); }
async function at93Karte(){
  const P = document.getElementById('panel-admin'); if(!P || typeof canManage !== 'function' || !canManage()) return;
  let D = null; try{ const { data, error } = await SVB.sb.rpc('app_tester_liste'); if(error) throw error; D = data; }catch(e){ return; }
  AT93.L = D; at93Css(); P.querySelectorAll('.at-karte').forEach(x => x.remove());
  const T = (D && D.tester) || [], S = (D && D.stand) || {}, ADM = typeof isAdmin === 'function' && isAdmin();
  const nA = T.filter(t => t.geraet === 'android').length, nI = T.filter(t => t.geraet === 'ios').length, ziel = +S.ziel || 12;
  const wA = T.filter(t => t.geraet === 'android' && !t.benachrichtigt).length, wI = T.filter(t => t.geraet === 'ios' && !t.benachrichtigt).length;
  const zeile = t => { const st = (AT93_SCHRITT[t.geraet] || [])[Math.min(t.schritt || 0, (AT93_SCHRITT[t.geraet] || []).length - 1)] || '';
    const store = t.store ? 'nutzt die Store-App' : '';
    return `<div class="at-z"><b>${svEsc(t.name || t.email)}</b><span class="at-g${t.store ? ' ok' : ''}">${t.geraet === 'ios' ? 'IPHONE' : t.geraet === 'android' ? 'ANDROID' : 'HANDY OFFEN'}</span>
      <small>${svEsc([store || st, AT93_KONTO[t.konto] || '', typeof svAgo === 'function' ? svAgo(t.am) : ''].filter(Boolean).join(' · '))}</small></div>`; };
  const k = document.createElement('div'); k.className = 'card at-karte';
  k.innerHTML = `<div class="adm-head"><div><h3 style="margin:0">App-Test</h3>
      <p style="margin:6px 0 0;font-size:13.5px">Wer sich unter <b>svbsc.kaderwerk.pro/test.html</b> einträgt, steht hier. Der Zugang zur App läuft wie gewohnt über die Zugangsanfragen.</p></div></div>
    <div class="at-zahl"><div><b>${nA}</b><span>Android, Ziel ${ziel}</span><div class="at-bal"><i style="width:${Math.min(100, Math.round(nA / ziel * 100))}%"></i></div></div>
      <div><b>${nI}</b><span>iPhone</span></div><div><b>${T.filter(t => t.store).length + ((D && D.ohne_anmeldung) || []).length}</b><span>nutzen die Store-App</span></div></div>
    ${T.length ? `<div class="at-liste">${T.map(zeile).join('')}</div>` : '<p class="note">Noch niemand eingetragen. Schick den Link an die Mannschaften.</p>'}
    ${ADM ? `<div class="at-st"><b>Stand auf der Seite</b>
      <div class="at-r"><label><input type="checkbox" data-at="android"${S.android === 'offen' ? ' checked' : ''}> Android ist bei Google freigegeben</label>
        <button type="button" class="btn sm ghost" data-atb="android"${S.android === 'offen' && wA ? '' : ' disabled'}>${wA} Wartenden Bescheid geben</button></div>
      <div class="at-r"><label><input type="checkbox" data-at="ios"${S.ios === 'offen' ? ' checked' : ''}> iPhone ist bei Apple freigegeben</label>
        <button type="button" class="btn sm ghost" data-atb="ios"${S.ios === 'offen' && S.testflight && wI ? '' : ' disabled'}>${wI} Wartenden Bescheid geben</button></div>
      <div class="at-r"><input type="url" data-attf placeholder="Öffentlicher TestFlight-Link (https://testflight.apple.com/join/…)" value="${svEsc(S.testflight || '')}" aria-label="TestFlight-Link">
        <button type="button" class="btn sm" data-atsp>Speichern</button></div>
      <p class="note" style="margin:0">Erst speichern, dann Bescheid geben. Jede Person bekommt die Mail genau einmal.</p></div>` : ''}`;
  const zg = P.querySelector('.zg-karte'); if(zg) zg.after(k); else P.insertBefore(k, P.firstChild);
  try{ await at93Links(k); }catch(e){}
  try{ await at93Spieler(k); }catch(e){}
  if(!ADM) return;
  k.querySelector('[data-atsp]').onclick = async ev => { const b = ev.currentTarget; b.disabled = true;
    try{ const tf = k.querySelector('[data-attf]').value.trim();
      if(tf && !/^https:\/\/testflight\.apple\.com\/join\/[A-Za-z0-9]{4,20}$/.test(tf)) throw new Error('Der TestFlight-Link sieht anders aus: https://testflight.apple.com/join/…');
      if(k.querySelector('[data-at="ios"]').checked && !tf) throw new Error('Fürs iPhone fehlt noch der TestFlight-Link');
      const { error } = await SVB.sb.rpc('app_test_setzen', { p:{ android:k.querySelector('[data-at="android"]').checked ? 'offen' : 'bald', ios:k.querySelector('[data-at="ios"]').checked ? 'offen' : 'bald', testflight:tf } });
      if(error) throw error; kToast('✓ Stand gespeichert, die Seite zeigt ihn sofort'); await at93Karte(); }
    catch(e){ b.disabled = false; kToast('⚠️ ' + (e.message || e)); } };
  k.querySelectorAll('[data-atb]').forEach(b => b.onclick = async () => { const g = b.dataset.atb; b.disabled = true;
    try{ const r = await SVB.admin('test_bescheid', { geraet:g }); kToast(`✓ ${r.gesendet || 0} Mail${r.gesendet === 1 ? '' : 's'} sind raus${r.fehler ? ', ' + r.fehler + ' mit Fehler' : ''}`); await at93Karte(); }
    catch(e){ b.disabled = false; kToast('⚠️ ' + (e.message || e)); } });
}
// 0.99.9: Welches Konto gehört zu welchem Spieler? Nur dann kommen Trainingsabfragen als Frage aufs Handy (143_startklar.sql).
async function at93Spieler(k){
  const { data, error } = await SVB.sb.rpc('konto_spieler_liste'); if(error) return; const K = data || [];
  let eig = []; try{ eig = players.filter(p => p.own && !p.isJugend).slice().sort((x, y) => String(x.name).localeCompare(String(y.name), 'de')); }catch(e){}
  if(!eig.length || !K.length) return;
  const vergeben = new Set(K.map(x => x.spieler).filter(Boolean)), nm = id => (eig.find(p => p.id === id) || {}).name || id;
  const N = t => String(t || '').toLowerCase().replace(/ä/g, 'ae').replace(/ö/g, 'oe').replace(/ü/g, 'ue').replace(/ß/g, 'ss').replace(/[^a-z]/g, '');
  const box = document.createElement('div'); box.className = 'at-st at-sp';
  box.innerHTML = `<b>Konten und Spieler <span style="font-weight:400;color:var(--ink2,#a9b3c7)">${K.filter(x => x.spieler).length} von ${K.length} zugeordnet</span></b>
    <p class="note" style="margin:0">Nur wer einem Spieler zugeordnet ist, bekommt Training und Spiel als Frage mit Zusagen und Absagen aufs Handy.</p>
    ${K.map(x => `<div class="at-r" data-atk="${svEsc(x.id)}"><span style="flex:1;min-width:140px"><b>${svEsc(x.name || '')}</b>${x.spieler ? ` <small style="color:#3ecf8e">ist ${svEsc(nm(x.spieler))}</small>` : ''}</span>
      <select data-atsel aria-label="Spieler zu ${svEsc(x.name || '')}" style="min-height:44px;max-width:230px"><option value="">kein Spieler</option>${eig.filter(p => p.id === x.spieler || !vergeben.has(p.id)).map(p => `<option value="${svEsc(p.id)}"${p.id === x.spieler || (!x.spieler && x.art === 'spieler' && N(p.name) === N(x.name)) ? ' selected' : ''}>${svEsc(p.name)}</option>`).join('')}</select>
      <button type="button" class="btn sm ghost" data-atset>Speichern</button></div>`).join('')}`;
  k.appendChild(box);
  box.querySelectorAll('[data-atk]').forEach(z => z.querySelector('[data-atset]').onclick = async ev => { const b = ev.currentTarget; b.disabled = true;
    try{ const { data:r, error:e } = await SVB.sb.rpc('konto_spieler_setzen', { p_user:z.dataset.atk, p_spieler:z.querySelector('[data-atsel]').value || null }); if(e) throw e;
      kToast(r && r.spieler ? `✓ Zugeordnet: ${r.spieler}${r.fragen ? ', ' + r.fragen + ' offene Abfrage' + (r.fragen > 1 ? 'n' : '') + ' ist raus' : ''}` : '✓ Zuordnung entfernt'); await at93Karte(); }
    catch(e){ b.disabled = false; kToast('⚠️ ' + (e.message || e)); } });
}
{ const _ar93 = svAdminRender; svAdminRender = async function(){ const r = await _ar93.apply(this, arguments); try{ await at93Karte(); }catch(e){} return r; }; }

// 0.99.12: Persönlicher Link zum App-Test je Konto (146_tester_link.sql). Albert, 12.11.2026: „Brauche nen Funnellink je User.“
// Die Leitung teilt den Link selbst weiter (WhatsApp, Mail). Die Seite kennt dann den Vornamen und führt ohne Formular zur App.
async function at93Links(k){
  const { data, error } = await SVB.sb.rpc('app_tester_konten'); if(error) return; const K = data || []; if(!K.length) return;
  const basis = (typeof svBasis === 'function' ? svBasis() : location.origin + '/');
  const box = document.createElement('div'); box.className = 'at-st at-links';
  box.innerHTML = `<b>Persönliche Links <span style="font-weight:400;color:var(--ink2,#a9b3c7)">${K.filter(x => x.store).length} von ${K.length} nutzen die Store-App</span></b>
    <p class="note" style="margin:0">Für alle, die schon einen Zugang haben. Tippe auf „Link teilen“ und schick ihn zum Beispiel per WhatsApp. Die Seite begrüßt die Person mit Vornamen und führt ohne Formular bis zur installierten App. Von selbst wird nichts verschickt.</p>
    ${K.map(x => { const st = x.store ? 'nutzt die Store-App' : x.link ? ((AT93_SCHRITT[x.geraet] || [])[Math.min(x.schritt || 0, (AT93_SCHRITT[x.geraet] || []).length - 1)] || 'Link erstellt') : '';
      return `<div class="at-r" data-atl="${svEsc(x.id)}" style="align-items:center"><span style="flex:1;min-width:140px"><b>${svEsc(x.name || '')}</b>${st ? ` <small style="color:${x.store ? '#3ecf8e' : 'var(--ink2,#a9b3c7)'}">${svEsc(st)}</small>` : ''}</span>
      <select data-atlg aria-label="Handy von ${svEsc(x.name || '')}" style="min-height:44px"><option value="">Handy offen</option><option value="android"${x.geraet === 'android' ? ' selected' : ''}>Android</option><option value="ios"${x.geraet === 'ios' ? ' selected' : ''}>iPhone</option></select>
      <button type="button" class="btn sm" data-atlb>Link teilen</button>
      <input type="text" readonly data-atlu hidden aria-label="Persönlicher Link für ${svEsc(x.name || '')}" style="flex-basis:100%;min-height:44px;font-size:13px"></div>`; }).join('')}`;
  const vor = k.querySelector('.at-st'); if(vor) k.insertBefore(box, vor); else k.appendChild(box);
  const teilen = async (z) => { const text = z.dataset.text; if(!text) return false;
    if(navigator.share){ try{ await navigator.share({ text }); return true; }catch(e){ if(e && e.name === 'AbortError') return true; } }
    try{ await navigator.clipboard.writeText(text); kToast('✓ Text mit Link kopiert'); return true; }catch(e){ return false; } };
  box.querySelectorAll('[data-atl]').forEach(z => { const b = z.querySelector('[data-atlb]'), sel = z.querySelector('[data-atlg]'), u = z.querySelector('[data-atlu]');
    sel.onchange = () => { delete z.dataset.text; };
    u.onfocus = () => { try{ u.select(); }catch(e){} };
    b.onclick = async () => {
      if(z.dataset.text){ if(!(await teilen(z))) kToast('Link steht unten zum Kopieren'); return; }   // zweiter Tipp: sofort teilen, ohne Wartezeit dazwischen
      b.disabled = true;
      try{ const { data:r, error:e } = await SVB.sb.rpc('app_tester_link', { p_user:z.dataset.atl, p_geraet:sel.value || null }); if(e) throw e;
        const url = basis + 'test.html?k=' + r.token;
        z.dataset.text = `Hi ${r.vorname || ''}, hier ist dein persönlicher Link zum Test der SVBSC-App. Am Handy öffnen, die Seite führt dich Schritt für Schritt: ${url}`.replace('Hi ,', 'Hi,');
        u.value = url; u.hidden = false; b.disabled = false; b.textContent = 'Jetzt teilen';
        if(!(await teilen(z))) kToast('Link ist da. Noch einmal tippen zum Teilen oder unten kopieren.'); }
      catch(e){ b.disabled = false; kToast('⚠️ ' + String((e && e.message) || e)); } }; });
}

/* =====================================================================
   Beta 0.99.9 · Willkommen beim ersten Start (Albert, 12.11.2026)
   „Wenn die jemand installiert, soll es ein Onboarding geben … alle Berechtigungen, die wir brauchen, gleich mit einholen.
    Auch wegen Push-Nachrichten, die sind ja super wichtig für uns.“
   Ein kurzer Ablauf über den ganzen Bildschirm, einmal je Person: Begrüßung, Mitteilungen erlauben (erst erklären, dann fragt
   das Handy), im Browser der Hinweis auf den Startbildschirm, fertig. Danach übernimmt „Deine ersten Schritte“ (svm52.js).
   Gemerkt wird es bei der Person (lernen_setzen, Schlüssel w:fertig), nicht im Gerät. Mikrofon fragt die Store-App erst ab
   der nächsten Fassung ab, die Berechtigung fehlt in Build 4 noch.
   ===================================================================== */
const W94 = { i:0, offen:false, S:[] };
function w94Css(){ if(document.getElementById('svm94css')) return; const s = document.createElement('style'); s.id = 'svm94css';
  s.textContent = `#w94{position:fixed;inset:0;z-index:9000;background:var(--bg,#05070c);color:var(--ink,#eef2fb);display:flex;flex-direction:column;padding:calc(22px + env(safe-area-inset-top,0px)) 22px calc(22px + env(safe-area-inset-bottom,0px));overflow:auto;
  background-image:radial-gradient(120% 55% at 50% -10%,rgba(47,107,255,.28),transparent 60%)}
#w94 .w-in{max-width:480px;width:100%;margin:auto;display:grid;gap:18px}
#w94 .w-sch{display:flex;gap:6px}#w94 .w-sch i{flex:1;height:4px;border-radius:4px;background:rgba(148,163,196,.25)}#w94 .w-sch i.an{background:var(--brand,#2f6bff)}
#w94 .w-bild.hand{width:100%;height:auto;max-width:300px;background:none;border-radius:0;display:block;font-size:inherit;margin:0 auto}#w94 .w-bild.hand .gw-hand{--gw-ink:currentColor;max-width:300px;margin:0 auto;filter:none;cursor:pointer}
#w94 .w-bild{width:76px;height:76px;border-radius:22px;background:rgba(47,107,255,.16);display:grid;place-items:center;font-size:38px}
#w94 h2{font-size:30px;line-height:1.1;margin:0;text-wrap:balance}#w94 p{margin:0;color:var(--ink2,#a9b3c7);font-size:16.5px;line-height:1.55}
#w94 ul{margin:0;padding:0;list-style:none;display:grid;gap:10px}#w94 li{display:flex;gap:10px;color:var(--ink2,#a9b3c7)}#w94 li b{color:var(--ink,#eef2fb)}
#w94 li::before{content:'';flex:none;width:8px;height:8px;border-radius:50%;background:var(--brand2,#5b9bff);margin-top:9px}
#w94 .w-akt{display:grid;gap:10px;margin-top:6px}#w94 .btn{min-height:54px;font-size:16.5px;justify-content:center}
#w94 .w-leise{background:none;border:0;color:var(--ink2,#a9b3c7);font:inherit;padding:10px;text-decoration:underline;text-underline-offset:3px;cursor:pointer}
#w94 .w-ok{color:#3ecf8e;font-weight:650}
@media (prefers-reduced-motion:no-preference){#w94 .w-in{animation:w94rein .3s cubic-bezier(.2,.7,.2,1) both}@keyframes w94rein{from{opacity:0;transform:translateY(10px)}to{opacity:1;transform:none}}}`;
  document.head.appendChild(s); }
function w94Nativ(){ try{ return !!(typeof SVN !== 'undefined' && SVN.nativ); }catch(e){ return false; } }
function w94Schritte(){
  const me = (typeof SVU !== 'undefined' && SVU) || {}, vn = String(me.name || '').split(' ')[0];
  const S = [{ id:'hallo', bild:'\u{1F44B}', t:`Schön, dass du dabei bist${vn ? ', ' + vn : ''}!`, x:'Das ist die App des SV/BSC. In einer Minute ist alles eingerichtet.', hand:true,
    punkte:[['Zusagen mit einem Tipp', 'Training und Spiel beantwortest du direkt in der Mitteilung.'], ['Deine Aufgaben', 'Was für dich ansteht, steht oben auf der Startseite.'], ['Alles an einem Ort', 'Termine, Helferplan und Neuigkeiten aus dem Verein.']], los:'Los geht es' }];
  S.push({ id:'push', bild:'\u{1F514}', t:'Mitteilungen erlauben', x:'Darüber kommen Trainingsabfragen, Erinnerungen und deine Aufgaben. Ohne Mitteilungen verpasst du das Wichtigste. Wir schicken nur, was dich betrifft.',
    hinweis: (typeof i1IOS === 'function' && i1IOS() && !w94Nativ() && typeof i1App === 'function' && !i1App()) ? 'Auf dem iPhone gehen Mitteilungen im Browser erst, wenn die App auf dem Startbildschirm liegt. Das kommt im nächsten Schritt.' : 'Gleich fragt dein Handy nach. Bitte „Erlauben“ antippen.',
    los:'Mitteilungen erlauben', aktion:'push', spaeter:'Später' });
  if(W94.store) S.push({ id:'store', bild:'\u{1F4F2}', t:'Hol dir die echte App', x:(W94.store === 'ios' ? 'Über TestFlight kommt sie aufs iPhone.' : 'Über Google Play kommt sie aufs Handy.') + ' Mitteilungen kommen dort zuverlässig an, und die App startet sofort. Dein Zugang bleibt derselbe.', los:'App holen', aktion:'store', spaeter:'Später' });
  else if(!w94Nativ() && typeof i1App === 'function' && !i1App()) S.push({ id:'app', bild:'\u{1F4F2}', t:'Auf den Startbildschirm', x:'So startet die Sportzentrale wie eine richtige App und bleibt angemeldet.', los:'Zeig mir, wie', aktion:'app', spaeter:'Später' });
  S.push({ id:'fertig', bild:'✅', t:'Fertig. Du bist startklar.', x:'Oben auf der Startseite steht, was für dich ansteht. Unter „Deine ersten Schritte“ findest du einen kurzen Rundgang.', los:'Zur Startseite' });
  return S;
}
function w94Zeig(){
  const s = W94.S[W94.i]; let el = document.getElementById('w94');
  if(!s){ if(el) el.remove(); W94.offen = false; document.body.classList.remove('w94-offen'); return; }
  if(!el){ el = document.createElement('div'); el.id = 'w94'; el.setAttribute('role', 'dialog'); el.setAttribute('aria-modal', 'true'); el.setAttribute('aria-label', 'Willkommen'); document.body.appendChild(el); }
  el.innerHTML = `<div class="w-in" data-w="${svEsc(s.id)}"><div class="w-sch">${W94.S.map((_, i) => `<i class="${i <= W94.i ? 'an' : ''}"></i>`).join('')}</div>
    ${s.hand && window.SVBC && SVBC.hand ? `<div class="w-bild hand">${SVBC.hand('willkommen', { delay:.2, label:'Willkommen' })}</div>` : `<div class="w-bild" aria-hidden="true">${s.bild}</div>`}<h2 tabindex="-1">${svEsc(s.t)}</h2><p>${svEsc(s.x)}</p>
    ${s.punkte ? `<ul>${s.punkte.map(p => `<li><span><b>${svEsc(p[0])}.</b> ${svEsc(p[1])}</span></li>`).join('')}</ul>` : ''}
    ${s.hinweis ? `<p style="font-size:14.5px">${svEsc(s.hinweis)}</p>` : ''}<p class="w-ok" id="w94ok" hidden></p>
    <div class="w-akt"><button type="button" class="btn" id="w94los">${svEsc(s.los)}</button>${s.spaeter ? `<button type="button" class="w-leise" id="w94sp">${svEsc(s.spaeter)}</button>` : ''}</div></div>`;
  const weiter = () => { W94.i++; if(W94.i >= W94.S.length) w94Ende(); else w94Zeig(); };
  el.querySelector('#w94los').onclick = async ev => { const b = ev.currentTarget;
    if(s.aktion === 'push'){ b.disabled = true; b.textContent = 'Einen Moment …'; let an = false;
      try{ an = !!(await svPushOn()); }catch(e){ an = false; }
      try{ if(an && typeof o1Setzen === 'function'){ await o1Setzen({ 's:push':true }); if(typeof N2 !== 'undefined' && N2.me) N2.me.push = true; } }catch(e){}
      try{ if(typeof n2Ev === 'function') n2Ev(an ? 'a:willkommen:push_an' : 'a:willkommen:push_aus'); }catch(e){}
      if(an){ const o = el.querySelector('#w94ok'); o.hidden = false; o.textContent = '✓ Mitteilungen sind an.'; b.disabled = false; b.textContent = 'Weiter'; s.aktion = null; return; }
      b.disabled = false; b.textContent = 'Weiter'; s.aktion = null; const o = el.querySelector('#w94ok'); o.hidden = false; o.style.color = 'inherit';
      o.textContent = 'Noch nicht eingeschaltet. Du kannst es jederzeit unter Mein Konto nachholen.'; return; }
    if(s.aktion === 'store'){ s.aktion = null; try{ window.open(s114Link(W94.store), '_blank', 'noopener'); }catch(e){} b.textContent = 'Weiter'; return; }
    if(s.aktion === 'app'){ s.aktion = null; try{ if(typeof I1 !== 'undefined') I1.gezeigt = false; el.style.display = 'none'; await i1Zeigen('app'); }catch(e){} el.style.display = ''; b.textContent = 'Weiter'; return; }
    weiter(); };
  const sp = el.querySelector('#w94sp'); if(sp) sp.onclick = weiter;
  try{ el.querySelector('h2').focus({ preventScroll:true }); }catch(e){}
}
async function w94Ende(){ const el = document.getElementById('w94'); if(el) el.remove(); W94.offen = false; document.body.classList.remove('w94-offen');
  try{ if(typeof o1Setzen === 'function') await o1Setzen({ 'w:fertig':true, 'w:am':Date.now(), 'w:wo':w94Nativ() ? 'store' : 'web' }); }catch(e){}
  try{ if(typeof o1Karte === 'function') o1Karte(); }catch(e){} }
async function w94Start(force){
  if(W94.offen) return; if(typeof SVU === 'undefined' || !SVU || !SVU.id) return;
  if(!force && navigator.webdriver && !window.W94_TEST) return;   // automatische Tests der anderen Runden laufen ohne den Ablauf, Runde 147 schaltet ihn ein
  // 0.99.13: den eigenen Stand sicher laden, bevor entschieden wird. Sonst kam der Ablauf bei langsamer Verbindung ein zweites Mal.
  let me = null; try{ if(typeof n2Meine === 'function') me = await n2Meine(); }catch(e){}
  if(!force && (!me || typeof me.lernen !== 'object' || me.lernen === null)){ W94.versuch = (W94.versuch || 0) + 1; if(W94.versuch <= 3) setTimeout(() => { try{ n2Meine(true).then(() => w94Start()); }catch(e){} }, 4000); return; }
  const L = (typeof o1L === 'function' && o1L()) || {};
  if(!force && L['w:fertig']) return;
  if(!force && (document.querySelector('#overlay.open') || document.getElementById('svnSperre'))) { setTimeout(() => w94Start(), 4000); return; }
  try{ W94.store = (typeof s114Offen === 'function') ? await s114Offen() : ''; }catch(e){ W94.store = ''; }
  w94Css(); W94.S = w94Schritte(); W94.i = 0; W94.offen = true; document.body.classList.add('w94-offen'); w94Zeig();
}
if(typeof svCockpit === 'function'){ const _ck94 = svCockpit; let einmal = false; svCockpit = function(){ const r = _ck94.apply(this, arguments); if(!einmal){ einmal = true; setTimeout(() => { try{ w94Start(); }catch(e){} }, 1800); } return r; }; }

/* =====================================================================
   Beta 0.99.10 · Deine Einsätze (144_helfer_konto.sql)
   Albert, 12.11.2026: „… die Helfer, dass die ihre Aufgaben, To-Dos kriegen.“
   Wer im Helferplan steht und ein Konto hat, sieht seine kommenden Einsätze oben auf der Startseite: Tag, Aufgabe, Spiel.
   Die Zusage kommt wenige Tage vorher als Frage (svm92.js). Hier steht nur, was ansteht und was schon beantwortet ist.
   Der Helferplan selbst bleibt, wo er gepflegt wird. Die Karte liest nur.
   ===================================================================== */
const E95 = { liste:[], geladen:0, laeuft:null };
function e95Css(){ if(document.getElementById('svm95css')) return; const s = document.createElement('style'); s.id = 'svm95css';
  s.textContent = `.e95{margin-bottom:14px}.e95 h3{margin:0 0 10px;font-size:17px}.e95-l{display:grid;gap:8px}
.e95-z{display:grid;grid-template-columns:auto 1fr auto;gap:12px;align-items:center;padding:11px 14px;border-radius:14px;background:var(--surface2,rgba(148,163,196,.08))}
.e95-d{min-width:54px;text-align:center;font-variant-numeric:tabular-nums;line-height:1.15}.e95-d b{display:block;font-size:19px}.e95-d small{color:var(--ink2,#a9b3c7);font-size:12.5px;text-transform:uppercase;letter-spacing:.04em}
.e95-t{display:grid;gap:2px;min-width:0}.e95-t b{overflow-wrap:anywhere}.e95-t span{color:var(--ink2,#a9b3c7);font-size:14px;overflow-wrap:anywhere}
.e95-s{font-size:13px;font-weight:650;white-space:nowrap;padding:4px 10px;border-radius:999px;background:rgba(148,163,196,.14);color:var(--ink2,#a9b3c7)}
.e95-s.ja{background:rgba(62,207,142,.16);color:#3ecf8e}.e95-s.nein{background:rgba(255,107,107,.16);color:#ff8f8f}
.e95-f{margin:10px 0 0;color:var(--ink2,#a9b3c7);font-size:13.5px}
@media (max-width:480px){.e95-z{grid-template-columns:auto 1fr}.e95-s{grid-column:2;justify-self:start}}`;
  document.head.appendChild(s); }
async function e95Laden(force){
  if(!force && Date.now() - E95.geladen < 60000) return E95.liste;
  if(E95.laeuft) return E95.laeuft;
  E95.laeuft = (async () => {
    try{ const { data, error } = await SVB.sb.rpc('meine_einsaetze'); if(error) throw error; E95.liste = Array.isArray(data) ? data : []; }
    catch(e){ E95.liste = []; }
    E95.geladen = Date.now(); E95.laeuft = null; return E95.liste; })();
  return E95.laeuft;
}
function e95Tag(d){ try{ const t = new Date(d + 'T12:00:00'); return { wt:t.toLocaleDateString('de-DE', { weekday:'short' }).replace('.', ''), tm:String(t.getDate()).padStart(2, '0') + '.' + String(t.getMonth() + 1).padStart(2, '0') + '.' }; }catch(e){ return { wt:'', tm:String(d || '') }; } }
function e95Karte(){
  const home = document.getElementById('panel-home'); if(!home) return;
  let k = document.getElementById('e95Karte');
  if(!E95.liste.length){ if(k) k.remove(); return; }
  e95Css();
  if(!k){ k = document.createElement('section'); k.id = 'e95Karte'; k.className = 'card e95'; k.setAttribute('aria-label', 'Deine Einsätze'); }
  // direkt unter den offenen Fragen, sonst unter der Begrüßung
  const fr = document.getElementById('frKarte'), hello = document.getElementById('svHello');
  const nach = (fr && fr.parentNode === home) ? fr : ((hello && hello.parentNode === home) ? hello : null), soll = nach ? nach.nextSibling : home.firstChild;
  if(soll !== k) home.insertBefore(k, soll);
  const L = E95.liste.slice(0, 5), mehr = E95.liste.length - L.length;
  k.innerHTML = `<h3>${E95.liste.length === 1 ? 'Dein nächster Einsatz' : 'Deine Einsätze'}</h3><div class="e95-l">${L.map(e => { const t = e95Tag(e.datum);
    const st = e.antwort === 'ja' ? ['ja', 'Zugesagt'] : e.antwort === 'nein' ? ['nein', 'Abgesagt'] : ['', 'Eingeplant'];
    return `<div class="e95-z" data-e95="${svEsc(e.datum)}"><div class="e95-d"><small>${svEsc(t.wt)}</small><b>${svEsc(t.tm)}</b></div>
      <div class="e95-t"><b>${svEsc(e.titel || e.aufgabe)}</b>${e.spiel ? `<span>${svEsc(e.spiel)}</span>` : ''}</div><span class="e95-s ${st[0]}">${st[1]}</span></div>`; }).join('')}</div>
    <p class="e95-f">${mehr > 0 ? `Dazu ${mehr === 1 ? 'kommt ein weiterer Einsatz' : 'kommen ' + mehr + ' weitere Einsätze'}. ` : ''}Ein paar Tage vorher fragen wir kurz nach, ob es bei dir klappt.</p>`;
}
async function e95Zeig(force){ try{ if(typeof SVU === 'undefined' || !SVU || !SVU.id) return; await e95Laden(force); e95Karte(); }catch(e){} }
if(typeof svCockpit === 'function'){ const _ck95 = svCockpit; svCockpit = function(){ const r = _ck95.apply(this, arguments); try{ e95Karte(); e95Zeig(); }catch(e){} return r; }; }
// Nach einer Antwort auf eine Frage stimmt der Stand in der Karte sofort
if(typeof svFrageAntwort === 'function'){ const _fa95 = svFrageAntwort; svFrageAntwort = async function(){ const r = await _fa95.apply(this, arguments); try{ if(r) e95Zeig(true); }catch(e){} return r; }; }

// Für die Leitung, in der Karte „App-Test“: Wer im Helferplan steht, gehört zu welchem Konto?
// Eindeutige Fälle (gleiche E-Mail, gleicher Name) verbindet der Server von selbst. Der Rest braucht einen Tipp.
async function e95Admin(k){
  if(!k || k.querySelector('.e95-adm')) return;
  const { data, error } = await SVB.sb.rpc('einsatz_personen'); if(error || !data) return;
  const P = data.personen || [], K = data.konten || []; if(!P.length || !K.length) return;
  const nm = id => (K.find(x => x.id === id) || {}).name || '';
  const box = document.createElement('div'); box.className = 'at-st at-sp e95-adm';
  box.innerHTML = `<b>Helferplan und Konten <span style="font-weight:400;color:var(--ink2,#a9b3c7)">${P.filter(x => x.konto).length} von ${P.length} verbunden</span></b>
    <p class="note" style="margin:0">Wer verbunden ist, sieht seine Einsätze auf der Startseite und bekommt sie ein paar Tage vorher als Frage mit Zusagen und Absagen aufs Handy. Eine Absage landet bei der Leitung.</p>
    ${P.map(x => `<div class="at-r" data-e95p="${svEsc(x.key)}"><span style="flex:1;min-width:140px"><b>${svEsc(x.name || '')}</b> <small style="color:var(--ink2,#a9b3c7)">${x.einsaetze} ${x.einsaetze === 1 ? 'Einsatz' : 'Einsätze'}</small>${x.konto ? ` <small style="color:#3ecf8e">Konto: ${svEsc(nm(x.konto))}</small>` : ''}</span>
      <select data-e95sel aria-label="Konto zu ${svEsc(x.name || '')}" style="min-height:44px;max-width:230px"><option value="">kein Konto</option>${K.map(c => `<option value="${svEsc(c.id)}"${c.id === x.konto ? ' selected' : ''}>${svEsc(c.name || '')}</option>`).join('')}</select>
      <button type="button" class="btn sm ghost" data-e95set>Speichern</button></div>`).join('')}`;
  k.appendChild(box);
  box.querySelectorAll('[data-e95p]').forEach(z => z.querySelector('[data-e95set]').onclick = async ev => { const b = ev.currentTarget; b.disabled = true;
    try{ const u = z.querySelector('[data-e95sel]').value || null;
      const { data:r, error:e } = await SVB.sb.rpc('einsatz_person_setzen', { p_key:z.dataset.e95p, p_user:u }); if(e) throw e;
      kToast(u ? `✓ Verbunden${r && r.fragen ? ', ' + r.fragen + (r.fragen > 1 ? ' Fragen sind' : ' Frage ist') + ' raus' : ''}` : '✓ Verbindung gelöst');
      E95.geladen = 0; if(typeof at93Karte === 'function') await at93Karte(); }
    catch(e){ b.disabled = false; kToast('⚠️ ' + String((e && e.message) || e)); } });
}
if(typeof at93Spieler === 'function'){ const _sp95 = at93Spieler; at93Spieler = async function(k){ try{ await _sp95.apply(this, arguments); }catch(e){} try{ await e95Admin(k); }catch(e){} }; }

/* =====================================================================
   Beta 0.99.13 · Spielerkonto (147_spielerkonto.sql)
   Albert, 13.11.2026: „Ich will ein bisschen die Ernsthaftigkeit rauskriegen aus dem Thema Strafenkatalog. Top 3, wer im Monat
   am meisten hat, im Jahr, All-Time. Für die Spieler ein Konto, wo die ihre Strafen sehen und was die aktuell haben, in einem
   schönen Dashboard. Eine Strafe hinterfragen, dann kriegt der Julian ein Pop-up. Und die Trainingsbeteiligung als eigenen Score.“
   - Spieler (Konto ist einem Spieler zugeordnet): eigener Stand, Strafen, Siegprämien, Trainingsbeteiligung, Ehrentitel.
   - Bestenlisten sieht nur die eigene Mannschaft, das Trainerteam beide.
   - Kassenwarte prüfen hinterfragte Strafen. Admin und Vorstand sehen die Prämien der Mannschaft und haken Auszahlungen ab.
   Gerechnet wird auf dem Server. Hier wird nur gezeigt.
   ===================================================================== */
const SK96 = { d:null, geladen:0, laeuft:null, team:null, zeit:'monat', liste:null, pruef:null, praem:null };
const SK96_ZEIT = { monat:'Dieser Monat', saison:'Saison', immer:'All-Time' };
const sk96E = v => svEsc(v == null ? '' : String(v));
const sk96Eur = v => (Math.round((+v || 0) * 100) / 100).toLocaleString('de-DE', { style:'currency', currency:'EUR' });
const sk96Kst = v => { const n = +v || 0; return n === 1 ? '1 Kasten' : n.toLocaleString('de-DE') + ' Kästen'; };
const sk96Wert = b => b.einheit === 'kasten' ? sk96Kst(b.betrag) : sk96Eur(b.betrag);
const sk96Tag = d => { const m = /^(\d{4})-(\d{2})-(\d{2})/.exec(String(d || '')); return m ? m[3] + '.' + m[2] + '.' : String(d || ''); };
const sk96TeamT = t => t === '2' ? '2. Mannschaft' : '1. Mannschaft';
const sk96Ruhig = () => { try{ return matchMedia('(prefers-reduced-motion: reduce)').matches; }catch(e){ return true; } };

function sk96Css(){ if(document.getElementById('svm96css')) return; const s = document.createElement('style'); s.id = 'svm96css';
  s.textContent = `#panel-spielerkonto{display:none}#panel-spielerkonto.active{display:block}
.sk-wrap{display:grid;gap:14px;max-width:860px}.sk-wrap h3{margin:0 0 10px;font-size:17px}.sk-wrap .note{margin:0;color:var(--ink2);font-size:13.5px;line-height:1.5}
.sk-held{display:grid;gap:16px}.sk-saldo small{display:block;color:var(--ink2);font-size:13px;letter-spacing:.04em;text-transform:uppercase}
.sk-saldo b{display:block;font-size:44px;line-height:1.05;letter-spacing:-.02em;font-variant-numeric:tabular-nums;margin:4px 0}
.sk-saldo b.plus{color:var(--green,#1a8f55)}.sk-saldo b.minus{color:var(--red,#d14343)}.sk-saldo span{color:var(--ink2);font-size:13.5px}
.sk-kacheln{display:grid;grid-template-columns:repeat(auto-fit,minmax(140px,1fr));gap:10px}
.sk-k{padding:12px 14px;border-radius:14px;background:var(--surface2,rgba(148,163,196,.1));display:grid;gap:2px}
.sk-k small{color:var(--ink2);font-size:12.5px}.sk-k b{font-size:22px;font-variant-numeric:tabular-nums}.sk-k i{font-style:normal;color:var(--ink2);font-size:12.5px}
.sk-titel{display:flex;gap:8px;flex-wrap:wrap}.sk-chip{display:inline-flex;gap:6px;align-items:center;padding:6px 12px;border-radius:999px;background:rgba(234,179,8,.16);color:var(--ink);font-size:13.5px;font-weight:650}
