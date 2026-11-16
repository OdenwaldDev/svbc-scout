      MN.sp = S; trRender(); }); }catch(e){ console.warn('Sortieren 0.83', e); }
  return r; }; }

/* ---------- 2. Spalte „Verfügbar“: nur das Stichwort ---------- */
// Stichwort: die ersten Wörter bis etwa 16 Zeichen, nichts dazugedeutet (der ganze Text steht im Tooltip und unter Verfügbarkeit)
function s81Stichwort(t){
  const s = String(t || '').trim(); if(!s) return 'verletzt';
  const kurz = s.split(/[,.;:(\n]/)[0].trim(), w = kurz.split(/\s+/).filter(Boolean); let out = '';
  for(const x of w){ if(!out){ out = x; continue; } if((out + ' ' + x).length > 16) break; out += ' ' + x; }
  return out.length > 18 ? out.slice(0, 16) + '…' : out;
}
if(typeof SV50_COLS !== 'undefined' && SV50_COLS.status){ const _h81 = SV50_COLS.status.h;
  SV50_COLS.status.h = (p, s) => s && s.inj ? `<span class="trpill bad s81-inj" title="${svEsc(s.inj.dg || '')}">🩹 ${svEsc(s81Stichwort(s.inj.dg))}</span>` : _h81(p, s); }

/* ---------- 3. Verletzungen und Abwesenheiten nur der gewählten Mannschaft ---------- */
function s81Meine(pid){ try{ if(typeof mnCtx !== 'function') return true; const p = trP(pid); return !p || mnTeam(p) === mnCtx(); }catch(e){ return true; } }
// Aktuelle Spielerliste der gewählten Mannschaft, auch wenn in der Massenpflege gerade „Extern“ gewählt ist
function svAktuelleSpieler(){ const L = mnIntern(); try{ return MN.team === 'X' ? L.filter(p => mnTeam(p) === mnCtx()) : L; }catch(e){ return L; } }
{ const _vi81 = trViewInjuries; trViewInjuries = function(B){
  const alle = TR.st.injuries; TR.st.injuries = (alle || []).filter(i => s81Meine(i.p || i.player_id));
  try{ return _vi81.apply(this, arguments); } finally { TR.st.injuries = alle; } }; }
if(typeof svmAbwListe === 'function'){ const _al81 = svmAbwListe; svmAbwListe = function(){
  const a0 = SVM_ABW.all, b0 = typeof SV91 !== 'undefined' ? SV91.abw : null;
  try{ if(a0) SVM_ABW.all = a0.filter(x => s81Meine(x.player_id)); if(b0) SV91.abw = b0.filter(x => s81Meine(x.player_id)); return _al81.apply(this, arguments); }
  finally { if(a0) SVM_ABW.all = a0; if(b0) SV91.abw = b0; } }; }
// Abwesenheiten (Liste und Übersicht) starten bei der gewählten Mannschaft
{ const _cs81 = typeof mnCtxSet === 'function' ? mnCtxSet : null; if(_cs81) mnCtxSet = function(){ const r = _cs81.apply(this, arguments); try{ SVM_ABW.team = mnCtx(); }catch(e){} return r; }; }
try{ SVM_ABW.team = mnCtx(); }catch(e){}

/* ---------- 4. Veranstaltungen der Mannschaft ---------- */
function s81TeamId(){ try{ return mnCtx() === '2' ? 'h2' : 'h1'; }catch(e){ return 'h1'; } }
function s81Feste(){ const t = 'team:' + s81TeamId(); return (KAL.items || []).filter(i => i.k === 'event' && (i.sicht || []).includes(t)).sort((a, b) => String(a.d).localeCompare(String(b.d)) || String(a.z || '').localeCompare(String(b.z || ''))); }
function s81DarfAnlegen(){ try{ return !!KAL.flags.bearbeiten || (KAL.flags.teams || []).includes(s81TeamId()); }catch(e){ return false; } }
MN_VIEWS.feste = function(B){
  if(!KAL.loaded && !KAL.s81){ KAL.s81 = true; kalLoad().then(() => { if(!KAL.loaded) KAL.s81 = false; if(svCurTab() === 'training' && TR.view === 'feste') trRender(); }); }
  const heute = kalHeute(), L = s81Feste(), komm = L.filter(i => (i.bis || i.d) >= heute), vorbei = L.filter(i => (i.bis || i.d) < heute).reverse().slice(0, 6);
  const name = typeof mnCtxT === 'function' ? mnCtxT() : 'Mannschaft';
  const zeile = i => { const a = KAL_EART[i.a] || ['📅', 'Termin']; return `<button type="button" class="s81-ev" data-s81ev="${svEsc(i.id)}"><span class="s81-d"><b>${svEsc(TRC.fmt(i.d))}</b>${i.z ? `<small>${svEsc(String(i.z).slice(0, 5))} Uhr</small>` : ''}</span>
    <span class="s81-t"><b>${svEsc(i.t || 'Veranstaltung')}</b><small>${a[0]} ${svEsc(a[1])}${i.ort ? ' · ' + svEsc(i.ort) : ''}</small></span><i aria-hidden="true">›</i></button>`; };
  B.innerHTML = `<div class="card s81-feste"><div class="adm-head"><div><h3 style="margin:0">Veranstaltungen der ${svEsc(name)}</h3><p class="note" style="margin:6px 0 0">Weihnachtsfeier, Abschlussfahrt, Saisonabschluss: alles, was die Mannschaft außerhalb von Training und Spiel vorhat. Sehen kann es die Mannschaft und der Vorstand.</p></div>
    ${s81DarfAnlegen() ? `<button type="button" class="btn" id="s81neu">${SVI('plus')} Veranstaltung anlegen</button>` : ''}</div>
    ${!KAL.loaded ? (KAL.err && !KAL.s81 ? '<div class="empty">Die Termine konnten nicht geladen werden. Prüf die Verbindung und öffne den Reiter noch mal.</div>' : '<div class="note">Lade …</div>') : komm.length ? `<div class="s81-l">${komm.map(zeile).join('')}</div>` : `<div class="empty">Noch nichts geplant.${s81DarfAnlegen() ? ' Leg die erste Veranstaltung an, zum Beispiel die Weihnachtsfeier.' : ''}</div>`}
    ${vorbei.length ? `<h4 class="s81-h">Vorbei</h4><div class="s81-l vorbei">${vorbei.map(zeile).join('')}</div>` : ''}</div>`;
  B.querySelectorAll('[data-s81ev]').forEach(b => b.onclick = () => kalDetail(b.dataset.s81ev));
  const n = B.querySelector('#s81neu'); if(n) n.onclick = async () => {
    await kalEventForm({ d:heute, a:'mannschaft', pub:false, sicht:['team:' + s81TeamId()] });
    const h = document.querySelector('#kalF') && document.querySelector('#kalF').closest('.modal, .mbox, [role=dialog]') ; const h2 = (h || document).querySelector('.mhead h2'); if(h2) h2.textContent = 'Neue Veranstaltung';
    const t = document.getElementById('kfT'); if(t) t.placeholder = 'zum Beispiel Weihnachtsfeier'; };
};
// Nach dem Speichern im Kalender die Liste der Mannschaft neu zeichnen
{ const _kl81 = kalLoad; kalLoad = async function(){ const r = await _kl81.apply(this, arguments); try{ if(svCurTab() === 'training' && TR.view === 'feste') trRender(); }catch(e){} return r; }; }
// Reiter: nach „Spiele“, klassisch und in der neuen Navigation
function s81Reiter(){ try{ const T = SV4_HUB.mannschaft.tabs; if(!T.some(([k]) => k === 'training:feste')){ const i = T.findIndex(([k]) => k === 'training:games'); T.splice(i < 0 ? T.length : i + 1, 0, ['training:feste', 'Veranstaltungen']); } }catch(e){} }
s81Reiter();
if(typeof v1NavAn === 'function'){ const _v81 = v1NavAn; v1NavAn = function(){ const r = _v81.apply(this, arguments); s81Reiter(); try{ const t = svCurTab(); if(t === 'training') sv4HubBar(t); }catch(e){} return r; }; }
if(typeof v1NavAus === 'function'){ const _va81 = v1NavAus; v1NavAus = function(){ const r = _va81.apply(this, arguments); s81Reiter(); return r; }; }
SVR_TRV.feste = 'mannschaft';

/* =====================================================================
   Beta 0.83 · Mini-Apps in der Sportzentrale (nur lesen)
   Helferplan: die nächsten Spieltage mit offenen Aufgaben, im Helfer-Bereich und bei „Mein Spieltag“.
   Kaderplanung: Kandidaten mit Priorität und Gesprächsstand, im Kader-Bereich.
   Alles läuft über die Edge Function mini-apps: die Schlüssel kennt nur der Server, er prüft auch die Rechte.
   ===================================================================== */
const MA = { h:null, hT:0, hErr:null, hErrT:0, hBusy:null, k:null, kT:0, kErr:null, kErrT:0, kBusy:null, kQ:'', kS:'', kMehr:false };
const MA_FEHLER = { 'nicht-erreichbar':'Gerade nicht erreichbar. Prüf die Verbindung und versuch es gleich noch mal.', 'zu-viele-anfragen':'Gerade zu viele Anfragen. In einer Minute geht es wieder.',
  'nicht-gefunden':'Für diesen Tag gibt es im Helferplan nichts.', 'abgemeldet':'Du bist nicht mehr angemeldet. Bitte die App neu öffnen.', fehler:'Gerade nicht verfügbar. Versuch es später noch mal.' };
// Admins sehen, was zu tun ist; alle anderen bekommen keinen Fachbegriff
const MA_ADMIN = { 'nicht-eingerichtet':'Noch nicht verbunden. In Supabase unter Edge Functions, Secrets fehlt der Zugang für diese App.', 'schluessel-falsch':'Der Zugang zu dieser App passt nicht mehr. In Supabase unter Edge Functions, Secrets neu hinterlegen.' };
async function maRufen(body){ const { data, error } = await SVB.sb.functions.invoke('mini-apps', { body });
  if(error){ const st = error.context && error.context.status; throw new Error(st === 403 ? 'keine-rechte' : st === 401 ? 'abgemeldet' : 'nicht-erreichbar'); }
  if(!data || !data.ok) throw new Error((data && data.fehler) || 'fehler'); return data; }
function maFehlerText(e){ const k = String(e && e.message || e); return (svRole() === 'admin' && MA_ADMIN[k]) || MA_FEHLER[k] || MA_FEHLER.fehler; }
// Karte ganz weglassen, wenn sie für diese Person nichts Sinnvolles zeigen kann
function maAusblenden(k){ return k === 'keine-rechte' || (svRole() !== 'admin' && ['nicht-eingerichtet', 'schluessel-falsch'].includes(k)); }
const maZahl = x => { const n = Number(x); return Number.isFinite(n) && n >= 0 ? Math.round(n) : 0; };
function maTag(d){ try{ return new Date(d + 'T12:00:00').toLocaleDateString('de-DE', { weekday:'short', day:'numeric', month:'numeric' }); }catch(e){ return d; } }
function maLink(u, t){ return /^https:\/\//.test(String(u || '')) ? `<a class="btn ghost" href="${svEsc(u)}" target="_blank" rel="noopener">${svEsc(t)} ↗</a>` : ''; }

/* ---------- Helferplan ---------- */
function maHelferDarf(){ return svRole() === 'admin' || svDarf('orga') === true || svDarf('mannschaften:leitung_senioren') === true || svDarf('planung:senioren') === true; }
async function maHelferLaden(neu){
  if(MA.hBusy) return MA.hBusy; if(!neu && MA.h && Date.now() - MA.hT < 60000) return MA.h; if(!neu && MA.hErr && Date.now() - MA.hErrT < 60000) return null;
  MA.hBusy = maRufen({ quelle:'helfer', art:'uebersicht', limit:4 }).then(d => { MA.h = d; MA.hT = Date.now(); MA.hErr = null; return d; }, e => { MA.hErr = String(e.message || e); MA.hErrT = Date.now(); return null; }).finally(() => { MA.hBusy = null; });
  return MA.hBusy; }
function maHelferKarte(){
  const box = document.createElement('div'); box.className = 'card ma-karte'; box.dataset.ma = 'helfer';
  const zeichnen = () => {
    const d = MA.h, R = d && d.meta && d.meta.rechte || {};
    if(!d && MA.hErr){ if(maAusblenden(MA.hErr)){ box.remove(); return; }
      box.innerHTML = `<div class="ma-kopf"><h3>Helferplan</h3></div><p class="note">${svEsc(maFehlerText(MA.hErr))}</p>`; return; }
    if(!d){ box.innerHTML = '<div class="ma-kopf"><h3>Helferplan</h3></div><p class="note">Lade …</p>'; return; }
    const tage = (d.data || []).filter(t => (t.games || []).length);
    box.innerHTML = `<div class="ma-kopf"><div><h3>Helferplan</h3><p class="note small">Aus der Helfer-App. Eintragen und tauschen geht dort.</p></div></div>
      ${tage.length ? `<div class="ma-tage">${tage.map(t => { const s = t.task_summary, m = t.management_task_summary;
        const offen = s ? maZahl(s.unfilled_task_count) : 0, mo = m ? maZahl(m.unfilled_task_count) : 0, sn = s ? maZahl(s.task_count) : 0, mn = m ? maZahl(m.task_count) : 0;
        return `<div class="ma-tag"><div class="ma-tk"><b>${svEsc(maTag(t.date))}</b>${(t.games || []).map(g => `<span>${+g.team === 2 ? 'Zweite' : +g.team === 1 ? 'Erste' : 'Mannschaft ' + svEsc(String(g.team || ''))} ${g.home_away === 'home' ? 'gegen' : 'bei'} ${svEsc(g.opponent || '')}${g.kickoff_time ? ', ' + svEsc(g.kickoff_time) : ''}${g.status === 'ausgefallen' ? ' (fällt aus)' : ''}</span>`).join('')}</div>
          <div class="ma-zahlen">${R.spielbetrieb && sn ? `<span class="${offen ? 'offen' : 'ok'}">${offen ? offen + ' von ' + sn + ' Aufgaben offen' : 'Alle ' + sn + ' Aufgaben besetzt'}</span>` : ''}
            ${R.senioren && mn ? `<span class="${mo ? 'offen' : 'ok'}">Seniorenleitung: ${mo ? mo + ' offen' : 'besetzt'}</span>` : ''}</div>
          <div class="btnrow">${R.spielbetrieb && sn ? `<button type="button" class="btn" data-maauf="${svEsc(t.date)}">Aufgaben ansehen</button>` : ''}${maLink(t.plan_url, 'Im Helferplan öffnen')}</div></div>`; }).join('')}</div>`
        : '<p class="note">In den nächsten Wochen stehen keine Spiele im Helferplan.</p>'}`;
    box.querySelectorAll('[data-maauf]').forEach(b => b.onclick = () => maAufgaben(b.dataset.maauf));
  };
  zeichnen(); maHelferLaden().then(() => { if(box.isConnected) zeichnen(); });
  return box;
}
async function maAufgaben(datum){
  const M = svModal(`<div class="mhead"><div><h2 style="margin:0">Aufgaben am ${svEsc(maTag(datum))}</h2><div class="msub">Aus der Helfer-App, nur zum Ansehen.</div></div></div><div id="maAB"><p class="note">Lade …</p></div>`);
  const B = M.querySelector('#maAB');
  try{ const d = await maRufen({ quelle:'helfer', art:'aufgaben', datum }); const T = (d.data && d.data.tasks) || [];
    const pflicht = T.filter(t => !t.is_flexible_help), reserve = T.filter(t => t.is_flexible_help);
    const zeile = t => `<div class="ma-auf${t.is_unfilled ? ' offen' : ''}"><b>${svEsc(t.title || 'Aufgabe')}</b><span>${t.is_unfilled ? 'noch offen' : (t.assigned_helpers || []).map(svEsc).join(', ')}</span></div>`;
    B.innerHTML = `${pflicht.length ? pflicht.map(zeile).join('') : '<p class="note">Keine Aufgaben an diesem Tag.</p>'}${reserve.length && reserve.some(t => (t.assigned_helpers || []).length) ? `<h4 class="svr-gh">Springer</h4>${reserve.map(zeile).join('')}` : ''}`;
  }catch(e){ B.innerHTML = `<p class="note">${svEsc(maFehlerText(e))}</p>`; }
}
{ const _hf82 = hfRender; hfRender = function(){ const r = _hf82.apply(this, arguments);
  try{ const P = hfPanel(); if(P && maHelferDarf() && !P.querySelector('[data-ma="helfer"]') && (typeof HF === 'undefined' || HF.v !== 'bereich')){ P.prepend(maHelferKarte()); } }catch(e){ console.warn('Helferplan', e); }
  return r; }; }
{ const _sr82 = sptRender; sptRender = async function(){ const r = await _sr82.apply(this, arguments);
  try{ const P = sptPanel(); if(P && maHelferDarf() && !P.querySelector('[data-ma="helfer"]') && svCurTab() === 'sptag') P.appendChild(maHelferKarte()); }catch(e){ console.warn('Helferplan', e); }
  return r; }; }

/* ---------- Kaderplanung ---------- */
async function maKaderLaden(neu){
  if(MA.kBusy) return MA.kBusy; if(!neu && MA.k && Date.now() - MA.kT < 60000) return MA.k; if(!neu && MA.kErr && Date.now() - MA.kErrT < 60000) return null;
  MA.kBusy = maRufen({ quelle:'kader', art:'kandidaten' }).then(d => { MA.k = d; MA.kT = Date.now(); MA.kErr = null; return d; }, e => { MA.kErr = String(e.message || e); MA.kErrT = Date.now(); return null; }).finally(() => { MA.kBusy = null; });
  return MA.kBusy; }
function maKaderKarte(){
  const box = document.createElement('div'); box.className = 'card ma-karte'; box.dataset.ma = 'kader';
  const zeichnen = () => {
    const d = MA.k;
    if(!d && MA.kErr){ if(maAusblenden(MA.kErr)){ box.remove(); return; }
      box.innerHTML = `<div class="ma-kopf"><h3>Aus der Kaderplanung-App</h3></div><p class="note">${svEsc(maFehlerText(MA.kErr))}</p>`; return; }
    if(!d){ box.innerHTML = '<div class="ma-kopf"><h3>Aus der Kaderplanung-App</h3></div><p class="note">Lade …</p>'; return; }
    const L = d.data || [], q = TRC.N(MA.kQ || ''), stand = [...new Set(L.map(k => k.conversationStatus || 'ohne Gesprächsstand'))];
    const zahl = s => L.filter(k => (k.conversationStatus || 'ohne Gesprächsstand') === s).length;
    const sicht = L.filter(k => (!MA.kS || (k.conversationStatus || 'ohne Gesprächsstand') === MA.kS) && (!q || TRC.N([k.name, k.club, k.position].join(' ')).includes(q))).sort(svNachCmp);
    if(!L.length){ box.innerHTML = '<div class="ma-kopf"><h3>Aus der Kaderplanung-App</h3></div><p class="note">In der Kaderplanung-App steht noch niemand.</p>'; return; }
    const zeig = MA.kMehr ? sicht : sicht.slice(0, 60);
    box.innerHTML = `<div class="ma-kopf"><div><h3>Aus der Kaderplanung-App</h3><p class="note small">${L.length} Kandidaten${d.meta && d.meta.vollstaendig === false ? ' (die ersten 1000)' : ''}, nur zum Ansehen. Ändern geht in der Kaderplanung-App.</p></div></div>
      <div class="ma-filter" role="group" aria-label="Gesprächsstand"><button type="button" data-mas="" class="${!MA.kS ? 'on' : ''}" aria-pressed="${!MA.kS}">Alle ${L.length}</button>${stand.map(s => `<button type="button" data-mas="${svEsc(s)}" class="${MA.kS === s ? 'on' : ''}" aria-pressed="${MA.kS === s}">${svEsc(s)} ${zahl(s)}</button>`).join('')}</div>
      <div class="hf-such ma-such"><input type="search" placeholder="Name, Verein oder Position" value="${svEsc(MA.kQ || '')}" aria-label="Kandidaten suchen"></div>
      <div class="ma-kl">${zeig.map(k => `<div class="ma-k"><div><b>${svEsc(k.name)}</b><small>${[k.position, k.club].filter(Boolean).map(svEsc).join(' · ') || '&nbsp;'}</small></div>
        <div class="ma-kt">${k.priority ? `<span class="ma-p">${svEsc(k.priority)}</span>` : ''}${k.conversationStatus ? `<span class="ma-g">${svEsc(k.conversationStatus)}</span>` : ''}</div></div>`).join('') || '<p class="note">Keine Kandidaten für diese Auswahl.</p>'}</div>
      ${zeig.length < sicht.length ? `<button type="button" class="btn ghost ma-mehr" data-mamehr>Alle ${sicht.length} zeigen</button>` : ''}`;
    const mehr = box.querySelector('[data-mamehr]'); if(mehr) mehr.onclick = () => { MA.kMehr = true; zeichnen(); };
    box.querySelectorAll('[data-mas]').forEach(b => b.onclick = () => { MA.kS = b.dataset.mas; zeichnen(); });
    const s = box.querySelector('.ma-such input'); if(s) s.oninput = () => { MA.kQ = s.value; const pos = s.selectionStart; zeichnen(); const n = box.querySelector('.ma-such input'); if(n){ n.focus(); try{ n.setSelectionRange(pos, pos); }catch(e){} } };
  };
  zeichnen(); maKaderLaden().then(() => { if(box.isConnected) zeichnen(); });
  return box;
}
function maKaderDarf(){ return svRole() === 'admin' || svDarf('kader:planung') === true; }
function maKaderEinhaengen(P){ if(!P || !maKaderDarf() || P.querySelector('[data-ma="kader"]')) return; const k = maKaderKarte(), erste = P.querySelector(':scope > .card, :scope > div'); if(erste) erste.after(k); else P.appendChild(k); }
if(typeof k1Planung === 'function'){ const _kp82 = k1Planung; k1Planung = function(){ const r = _kp82.apply(this, arguments); try{ maKaderEinhaengen(document.getElementById('panel-kplan')); }catch(e){ console.warn('Kaderplanung', e); } return r; }; }
if(typeof kd4Render === 'function'){ const _kd82 = kd4Render; kd4Render = function(){ const r = _kd82.apply(this, arguments); try{ maKaderEinhaengen(document.getElementById('panel-kader')); }catch(e){ console.warn('Kaderplanung', e); } return r; }; }

/* =====================================================================
   Beta 0.86 · Wünsche aus dem Trainerteam (Julian), Teil Mannschaft
   1. Veranstaltungen wie Training: Termin plus Zu- und Absagen je Mannschaft (polls.event_id), auch für beide Mannschaften,
      mit Statistik. Anlegen auch aus der Übersicht.
   2. Beteiligung: Training, Spiele und Veranstaltungen je Spieler, als PDF oder Excel.
   3. Verfügbarkeit: Umschalter Zeitleiste, Verletzungen, Abwesenheiten bleibt oben stehen.
   4. Statistiklisten (Training, Spiele, Veranstaltungen) zeigen nur Spieler aus dem Kader der gewählten Mannschaft.
   5. Die Anlege-Leiste (Training, Spiel …) fehlt in Veranstaltungen, Verfügbarkeit und Organisation (CSS).
   ===================================================================== */
const S83 = { strikt:false, bet:null, betP:null, kalP:null, kalT:0 };
function s83KalSicher(view){
  if(typeof KAL === 'undefined' || KAL.loaded || S83.kalP || Date.now() - S83.kalT < 10000) return;
  S83.kalT = Date.now();
  S83.kalP = Promise.resolve(kalLoad()).catch(() => {}).finally(() => { S83.kalP = null; if(KAL.loaded && svCurTab() === 'training' && TR.view === view) trRender(); });
}
const s83E = s => svEsc(s == null ? '' : String(s));
function s83Team(){ try{ return mnCtx(); }catch(e){ return '1'; } }
function s83TeamT(t){ return (t || s83Team()) === '2' ? '2. Mannschaft' : '1. Mannschaft'; }
function s83Hx(t){ return t === '2' ? 'h2' : 'h1'; }
// Kader einer Mannschaft (eigene Spieler, nach Nachname)
function s83Kader(t){
  try{ return players.filter(p => mnIsIntern(p) && mnTeam(p) === t).sort(typeof svNachCmp === 'function' ? svNachCmp : (a, b) => String(a.name).localeCompare(String(b.name), 'de')); }
  catch(e){ return []; }
}
function s83Saison(){ try{ return sv50Start(); }catch(e){ return trToday().slice(0, 4) + '-07-01'; } }
// Abstimmung (Zu- und Absagen) einer Veranstaltung für die gewählte Mannschaft
function s83Poll(evId, t){ const L = (typeof KB !== 'undefined' && (KB._p31all || KB.polls)) || []; return L.find(p => p.event_id === evId && (p.team || '1') === (t || s83Team())) || null; }
function s83Zahl(p){ try{ const s = kbStat(p); return { zu:s.zu.length, ab:s.ab.length, vllt:s.vllt.length, offen:s.offen.length }; }catch(e){ return null; } }

/* ---------- 4. Statistik nur Kader ---------- */
{ const _sq83 = trSquad; trSquad = function(){ const L = _sq83.apply(this, arguments); if(!S83.strikt) return L; try{ return L.filter(p => mnTeam(p) === mnCtx()); }catch(e){ return L; } }; }
{ const _vh83 = trViewHome; trViewHome = function(){ S83.strikt = true; try{ return _vh83.apply(this, arguments); } finally { S83.strikt = false; } }; }
function s83NurKader(f){ return function(){ if(S83.trpTausch) return f.apply(this, arguments);
  const _p = trP; S83.trpTausch = true; trP = function(id){ const p = _p.apply(this, arguments); try{ return p && mnTeam(p) === mnCtx() ? p : null; }catch(e){ return p; } };
  try{ return f.apply(this, arguments); } finally { trP = _p; S83.trpTausch = false; } }; }
if(MN_VIEWS.gstat) MN_VIEWS.gstat = s83NurKader(MN_VIEWS.gstat);
if(typeof svmViewGStat === 'function') svmViewGStat = s83NurKader(svmViewGStat);

/* ---------- 1. Veranstaltungen ---------- */
MN_VIEWS.feste = function(B){
  s83KalSicher('feste');
  if(typeof KB !== 'undefined' && !KB.loaded && !S83.kbLaden){ S83.kbLaden = true; Promise.resolve(kbLoad()).finally(() => { if(svCurTab() === 'training' && TR.view === 'feste') trRender(); }); }
  const heute = kalHeute(), L = s81Feste(), komm = L.filter(i => (i.bis || i.d) >= heute), vorbei = L.filter(i => (i.bis || i.d) < heute).reverse().slice(0, 6);
  const zeile = i => { const a = KAL_EART[i.a] || ['📅', 'Termin'], p = s83Poll(i.id), z = p && s83Zahl(p), beide = (i.sicht || []).includes('team:h1') && (i.sicht || []).includes('team:h2');
    return `<button type="button" class="s81-ev" data-s83ev="${s83E(i.id)}"><span class="s81-d"><b>${s83E(TRC.fmt(i.d))}</b>${i.z ? `<small>${s83E(String(i.z).slice(0, 5))} Uhr</small>` : ''}</span>
      <span class="s81-t"><b>${s83E(i.t || 'Veranstaltung')}</b><small>${a[0]} ${s83E(a[1])}${i.ort ? ' · ' + s83E(i.ort) : ''}${beide ? ' · beide Mannschaften' : ''}</small>
      ${z ? `<span class="s83-z"><i class="ok">${z.zu} zu</i><i class="bad">${z.ab} ab</i>${z.vllt ? `<i class="mid">${z.vllt} vielleicht</i>` : ''}<i>${z.offen} offen</i></span>` : ''}</span><i aria-hidden="true">›</i></button>`; };
  B.innerHTML = `<div class="card s81-feste"><div class="adm-head"><div><h3 style="margin:0">Veranstaltungen der ${s83E(s83TeamT())}</h3><p class="note" style="margin:6px 0 0">Weihnachtsfeier, Abschlussfahrt, Saisonabschluss: alles außerhalb von Training und Spiel. Die Spieler sagen zu oder ab, wie beim Training.</p></div>
      ${s81DarfAnlegen() ? `<button type="button" class="btn" id="s81neu">${SVI('plus')} Veranstaltung anlegen</button>` : ''}</div>
    ${!KAL.loaded ? (KAL.err && !S83.kalP ? '<div class="empty">Die Termine konnten nicht geladen werden. Prüf die Verbindung und öffne den Reiter noch mal.</div>' : '<div class="note">Lade …</div>') : komm.length ? `<div class="s81-l">${komm.map(zeile).join('')}</div>` : `<div class="empty">Noch nichts geplant.${s81DarfAnlegen() ? ' Leg die erste Veranstaltung an, zum Beispiel die Weihnachtsfeier.' : ''}</div>`}
    ${vorbei.length ? `<h4 class="s81-h">Vorbei</h4><div class="s81-l vorbei">${vorbei.map(zeile).join('')}</div>` : ''}</div>
    <div class="card" id="s83Stat"></div>`;
  B.querySelectorAll('[data-s83ev]').forEach(b => b.onclick = () => s83Detail(b.dataset.s83ev));
  const n = B.querySelector('#s81neu'); if(n) n.onclick = () => s83Form(null);
  s83StatKarte(B.querySelector('#s83Stat'));
};
// Statistik der Veranstaltungen: Zusagen je Spieler aus dem Kader der Mannschaft
function s83StatKarte(C){ if(!C) return;
  const P = ((typeof KB !== 'undefined' && KB.polls) || []).filter(p => p.event_id && p.art === 'event').sort((a, b) => a.datum < b.datum ? -1 : 1);
  if(!P.length){ C.innerHTML = `<h3 class="trh">${SVI('activity')} Statistik</h3><p class="note">Sobald Veranstaltungen mit Zu- und Absagen da sind, steht hier, wer wie oft dabei war.</p>`; return; }
  const K = s83Kader(s83Team()), V = P.map(p => new Map(kbVotes(p).map(v => [v.player_id, v.antwort])));
  const rows = K.map(pl => { let ein = 0, zu = 0, ab = 0; P.forEach((p, i) => { if((p.teilnehmer || []).some(t => t.id === pl.id)){ ein++; const a = V[i].get(pl.id); if(a === 'zu') zu++; else if(a === 'ab') ab++; } }); return { pl, ein, zu, ab }; }).filter(r => r.ein).sort((a, b) => b.zu - a.zu || a.ab - b.ab);
  C.innerHTML = `<h3 class="trh">${SVI('activity')} Statistik <small>${P.length} Veranstaltung${P.length === 1 ? '' : 'en'}</small></h3>
    <div class="s83-tw"><table class="s83-t"><thead><tr><th>Spieler</th><th>Zugesagt</th><th>Abgesagt</th><th>Eingeladen</th></tr></thead><tbody>
    ${rows.map(r => `<tr><td>${s83E(r.pl.name)}</td><td>${r.zu}</td><td>${r.ab}</td><td>${r.ein}</td></tr>`).join('') || '<tr><td colspan="4">Noch keine Einladungen.</td></tr>'}</tbody></table></div>
    <p class="note">Nur Spieler aus dem Kader der ${s83E(s83TeamT())}. Gezählt werden die Veranstaltungen der letzten vier Monate und die geplanten.</p>`;
}
function s83Event(id){ return (KAL.items || []).find(i => i.id === id && i.k === 'event') || null; }
function s83Detail(id){
  const i = s83Event(id); if(!i) return kToast('Die Veranstaltung gibt es nicht mehr.');
  const a = KAL_EART[i.a] || ['📅', 'Termin'], teams = ['1', '2'].filter(t => (i.sicht || []).includes('team:' + s83Hx(t)));
  const p = s83Poll(i.id), z = p && s83Zahl(p), darf = !!i.ed || s81DarfAnlegen();
  svModal(`<div class="mhead"><div class="rm-ic" style="width:46px;height:46px">${a[0]}</div><div><h2 style="margin:0">${s83E(i.t)}</h2><div class="msub">${s83E(kbWd(i.d))}${i.bis ? ' bis ' + s83E(kbWd(i.bis)) : ''}${i.z ? ' · ' + s83E(String(i.z).slice(0, 5)) + ' Uhr' : ''}${i.ort ? ' · ' + s83E(i.ort) : ''}</div></div></div>
    ${i.info ? `<p class="s83-info">${s83E(i.info)}</p>` : ''}
    <p class="note">${s83E(a[1])} · für ${teams.map(t => s83TeamT(t)).join(' und ') || 'die Mannschaft'}</p>
    ${p ? `<div class="s83-zk"><div><b class="ok">${z.zu}</b><span>zugesagt</span></div><div><b class="bad">${z.ab}</b><span>abgesagt</span></div><div><b class="mid">${z.vllt}</b><span>vielleicht</span></div><div><b>${z.offen}</b><span>offen</span></div></div>
      <div class="btnrow sbact"><button class="btn" id="s83Zu">${SVI('users')} Zu- und Absagen</button><button class="btn ghost" id="s83Sh">${SVI('share')} ${p.geteilt_at ? 'Nochmal teilen' : 'In die Gruppe teilen'}</button></div>`
      : `<div class="btnrow sbact">${darf ? `<button class="btn" id="s83Start">${SVI('users')} Zu- und Absagen abfragen</button>` : '<p class="note">Für diese Veranstaltung gibt es keine Zu- und Absagen.</p>'}</div>`}
    ${darf ? `<div class="btnrow sbact"><button class="btn ghost" id="s83Ed">Bearbeiten</button><button class="btn ghost s83-del" id="s83Del">Löschen</button></div>` : ''}`);
  const $ = s => document.querySelector('#modal ' + s);
  const zu = $('#s83Zu'); if(zu) zu.onclick = () => kbPollDetail(p.id);
  const sh = $('#s83Sh'); if(sh) sh.onclick = () => kbShare(p);
  const st = $('#s83Start'); if(st) st.onclick = async () => { st.disabled = true; const ok = await s83PollsAnlegen(i, teams.length ? teams : [s83Team()], null); if(ok){ await kbLoad(true); s83Detail(i.id); } else st.disabled = false; };
  const ed = $('#s83Ed'); if(ed) ed.onclick = () => s83Form(i);
  const del = $('#s83Del'); if(del) del.onclick = async () => {
    if(del.dataset.sure !== '1'){ del.dataset.sure = '1'; del.textContent = 'Wirklich löschen? Auch alle Zu- und Absagen'; del.classList.add('sure'); return; }
    del.disabled = true; const { error } = await SVB.sb.rpc('event_delete', { p_id:i.id }); if(error){ del.disabled = false; return kToast(svFehlerText(error)); }
    closeOverlay(); kToast('Veranstaltung gelöscht'); await Promise.all([kalLoad(null, null, true), kbLoad(true)]); if(svCurTab() === 'training') trRender(); };
}
// Zu- und Absagen: je Mannschaft eine Abstimmung am Termin, eingeladen ist der Kader der Mannschaft
async function s83PollsAnlegen(i, teams, frist){
  for(const t of teams){
    if(s83Poll(i.id, t)) continue;
    const K = s83Kader(t).slice(0, 80);
    const row = { titel:String(i.t || 'Veranstaltung').slice(0, 120), art:'event', datum:i.d, zeit:i.z ? String(i.z).slice(0, 5) : null, ort:i.ort || null, notiz:i.info ? String(i.info).slice(0, 500) : null,
      frist:frist || null, teilnehmer:K.map(p => ({ id:p.id, name:p.name })), team:t, event_id:i.id };
    const { error } = await SVB.sb.from('polls').insert(row); if(error && error.code !== '23505'){ kToast('⚠️ ' + svFehlerText(error)); return false; }
  }
  return true;
}
function s83Form(i){
  const heute = kalHeute(), teams0 = i ? ['1', '2'].filter(t => (i.sicht || []).includes('team:' + s83Hx(t))) : [s83Team()];
  const st = { teams:new Set(teams0.length ? teams0 : [s83Team()]), rsvp:i ? !!(s83Poll(i.id, '1') || s83Poll(i.id, '2')) : true };
  const arten = ['weihnachten', 'saisonfeier', 'mannschaft', 'turnier', 'arbeitseinsatz', 'sonstiges'].filter(k => KAL_EART[k]);
  svModal(`<div class="mhead"><div class="rm-ic" style="width:46px;height:46px">${SVI('cal')}</div><div><h2 style="margin:0">${i ? 'Veranstaltung ändern' : 'Neue Veranstaltung'}</h2><div class="msub">Erscheint bei den gewählten Mannschaften und im Kalender</div></div></div>
    <form id="s83F" class="kbform" autocomplete="off">
      <div class="field kbwide"><label for="s83T">Titel</label><input id="s83T" maxlength="120" required placeholder="zum Beispiel Weihnachtsfeier" value="${s83E(i ? i.t : '')}"></div>
      <div class="field"><label for="s83A">Art</label><select id="s83A">${arten.map(k => `<option value="${k}"${(i ? i.a : 'mannschaft') === k ? ' selected' : ''}>${s83E(KAL_EART[k][1])}</option>`).join('')}</select></div>
      <div class="field"><label for="s83D">Datum</label><input id="s83D" type="date" required value="${s83E(i ? i.d : heute)}"></div>
      <div class="field"><label for="s83B">Bis (mehrtägig, optional)</label><input id="s83B" type="date" value="${s83E(i && i.bis ? i.bis : '')}"></div>
      <div class="field"><label for="s83Z">Uhrzeit</label><input id="s83Z" type="time" value="${s83E(i && i.z ? String(i.z).slice(0, 5) : '')}"></div>
      <div class="field kbwide"><label for="s83O">Ort</label><input id="s83O" maxlength="120" value="${s83E(i && i.ort ? i.ort : '')}"></div>
      <div class="field kbwide"><label for="s83I">Beschreibung (optional)</label><input id="s83I" maxlength="500" value="${s83E(i && i.info ? i.info : '')}"></div>
      <div class="field kbwide"><label>Für welche Mannschaft?</label><div class="s83-teams" role="group" aria-label="Mannschaften">${['1', '2'].map(t => `<button type="button" class="pchip${st.teams.has(t) ? ' on' : ''}" data-s83t="${t}" aria-pressed="${st.teams.has(t)}">${s83TeamT(t)}</button>`).join('')}</div></div>
      <label class="s83-chk kbwide"><input type="checkbox" id="s83R"${st.rsvp ? ' checked' : ''}> Zu- und Absagen abfragen, wie beim Training</label>
      <div class="field" id="s83Ff"${st.rsvp ? '' : ' hidden'}><label for="s83Fr">Antworten bis (optional)</label><input id="s83Fr" type="datetime-local"></div>
      <div class="btnrow sbact kbwide"><button class="btn" type="submit">${i ? 'Speichern' : 'Anlegen'}</button><button class="btn ghost" type="button" id="s83X">Abbrechen</button></div>
    </form>`);
  const F = document.getElementById('s83F'), $ = s => F.querySelector(s);
  F.querySelectorAll('[data-s83t]').forEach(b => b.onclick = () => { const t = b.dataset.s83t; if(st.teams.has(t)){ if(st.teams.size === 1) return kToast('Mindestens eine Mannschaft'); st.teams.delete(t); } else st.teams.add(t);
    b.classList.toggle('on', st.teams.has(t)); b.setAttribute('aria-pressed', st.teams.has(t)); });
  $('#s83R').onchange = () => { $('#s83Ff').hidden = !$('#s83R').checked; };
  $('#s83X').onclick = () => closeOverlay();
  F.onsubmit = async ev => { ev.preventDefault(); const b = F.querySelector('button[type=submit]'); if(b.disabled) return;
    const v = s => $(s).value.trim(), d = v('#s83D'), bis = v('#s83B'), teams = [...st.teams].sort();
    if(v('#s83T').length < 2) return kToast('Bitte einen Titel angeben'); if(!d) return kToast('Bitte ein Datum angeben');
    // Bisherige Sichtbarkeit bleibt, nur die Mannschaften ändern sich
    const andere = i ? (i.sicht || []).filter(s => s !== 'team:h1' && s !== 'team:h2') : [];
    const p = { id:i ? i.id : null, titel:v('#s83T'), art:v('#s83A'), datum:d, ende:bis && bis > d ? bis : '', zeit:v('#s83Z'), ort:v('#s83O'), info:v('#s83I'),
      sicht:[...andere, ...teams.map(t => 'team:' + s83Hx(t))], oeffentlich:i ? !!i.pub : false };
    b.disabled = true;
    const { data:eid, error } = await SVB.sb.rpc('termin_speichern', { p }); if(error){ b.disabled = false; return kToast(svFehlerText(error)); }
    const ev2 = { id:eid || (i && i.id), t:p.titel, d, z:p.zeit, ort:p.ort, info:p.info }, rsvp = $('#s83R').checked, fr = v('#s83Fr'), frist = fr ? new Date(fr).toISOString() : null;
    let fehler = null; const pruef = r => { if(r && r.error && !fehler) fehler = r.error; };
    try{
      if(i){ // Abstimmungen am Termin mitziehen; wegfallende Mannschaft oder abgeschaltete Zusagen nur nach Rückfrage löschen
        for(const t of ['1', '2']){ const q = s83Poll(i.id, t); if(!q) continue;
          if(!st.teams.has(t) || !rsvp){ const n = kbVotes(q).length;
            if(!n || confirm(`${s83TeamT(t)}: ${n} Zu- und Absage${n === 1 ? '' : 'n'} ${!rsvp ? 'werden gelöscht, weil keine Zusagen mehr abgefragt werden' : 'werden gelöscht, weil die Mannschaft nicht mehr dabei ist'}. Weiter?`)) pruef(await SVB.sb.from('polls').delete().eq('id', q.id));
            continue; }
          const patch = { titel:ev2.t.slice(0, 120), datum:d, zeit:ev2.z || null, ort:ev2.ort || null, notiz:ev2.info ? ev2.info.slice(0, 500) : null }; if(frist) patch.frist = frist;
          pruef(await SVB.sb.from('polls').update(patch).eq('id', q.id)); } }
      if(rsvp && ev2.id && !await s83PollsAnlegen(ev2, teams, frist)) fehler = fehler || { message:'Zu- und Absagen konnten nicht angelegt werden' };
    }catch(e){ fehler = fehler || e; }
    if(fehler){ closeOverlay(); kToast('Termin gespeichert, aber die Zu- und Absagen nicht: ' + svFehlerText(fehler)); await Promise.all([kalLoad(null, null, true), kbLoad(true)]); if(svCurTab() === 'training') trRender(); return; }
    closeOverlay(); kToast(i ? '✓ Gespeichert' : '✓ Veranstaltung angelegt' + (rsvp ? ': jetzt in die Gruppe teilen' : ''));
    await Promise.all([kalLoad(null, null, true), kbLoad(true)]); if(svCurTab() === 'training') trRender(); };
  setTimeout(() => { const t = $('#s83T'); if(t && !t.value) t.focus(); }, 60);
}
// Zu- und Absagen einer Veranstaltung: ohne „Anwesenheit vorbereiten“ (das gibt es nur für Training und Spiel)
{ const _pd83 = kbPollDetail; kbPollDetail = function(id){ const r = _pd83.apply(this, arguments);
  try{ const p = (KB.polls || []).find(x => x.id === id); if(p && p.art === 'event'){ const fix = () => { const b = document.getElementById('kbTr'); if(b) b.remove(); const n = document.querySelector('#kbDet > .note:last-child'); if(n && /Vorbereiten/.test(n.textContent)) n.remove(); };
    fix(); const D = document.getElementById('kbDet'); if(D) new MutationObserver(fix).observe(D, { childList:true }); } }catch(e){}
  return r; }; }

/* ---------- 2. Beteiligung ---------- */
function s83BetLaden(){
  if(S83.betP) return S83.betP;
  const t = s83Team(), seit = s83Saison();
  S83.betP = (async () => {
    try{ const r = await SVB.sb.from('polls').select('id,titel,datum,teilnehmer,team,event_id').not('event_id', 'is', null).eq('team', t).gte('datum', seit).lte('datum', trToday()).limit(200);
      if(r.error) throw r.error; const P = r.data || [], ids = P.map(p => p.id); let V = [];
      if(ids.length){ const v = await SVB.sb.from('poll_votes').select('poll_id,player_id,antwort').in('poll_id', ids).limit(5000); if(v.error) throw v.error; V = v.data || []; }
      S83.bet = { team:t, polls:P, votes:V };
    }catch(e){ S83.bet = { team:t, polls:[], votes:[], err:true }; }
  })().finally(() => { S83.betP = null; });
  return S83.betP;
}
function s83BetDaten(){
  const t = s83Team(), seit = s83Saison(), heute = trToday(), K = s83Kader(t);
  const SS = (TR.st.sessions || []).filter(s => s.d >= seit && s.d <= heute), TRN = SS.filter(s => s.t !== 'spiel' && s.t !== 'test'), SP = SS.filter(s => s.t === 'spiel' || s.t === 'test');
  const B = S83.bet && S83.bet.team === t ? S83.bet : { polls:[], votes:[] };
  const rows = K.map(p => {
    const st = s => { const a = (s.a || []).find(x => x[0] === p.id); return a ? a[1] : null; };
    const tr = TRN.filter(s => ['da', 'spaet'].includes(st(s))).length, sp = SP.filter(s => ['da', 'spaet'].includes(st(s))).length, kd = SP.filter(s => ['da', 'spaet', 'bank'].includes(st(s))).length;
    const ein = B.polls.filter(q => (q.teilnehmer || []).some(x => x.id === p.id)), zu = ein.filter(q => B.votes.some(v => v.poll_id === q.id && v.player_id === p.id && v.antwort === 'zu')).length;
    return { p, tr, trN:TRN.length, sp, kd, spN:SP.length, ev:zu, evN:ein.length };
  });
  return { t, seit, rows, trN:TRN.length, spN:SP.length, evN:B.polls.length };
}
const s83Q = (a, n) => n ? Math.round(a / n * 100) + ' %' : '';
MN_VIEWS.betl = function(B){
  if((!S83.bet || S83.bet.team !== s83Team()) && !S83.betP){ s83BetLaden().then(() => { if(svCurTab() === 'training' && TR.view === 'betl') trRender(); }); }
  const D = s83BetDaten(), laed = !S83.bet || S83.bet.team !== s83Team(), err = !laed && S83.bet.err;
  B.innerHTML = `<div class="card"><div class="adm-head"><div><h3 style="margin:0">Beteiligung der ${s83E(s83TeamT())}</h3><p class="note" style="margin:6px 0 0">Seit ${s83E(TRC.fmt(D.seit))}: ${D.trN} Trainingseinheiten, ${D.spN} Spiele, ${D.evN} Veranstaltungen mit Zu- und Absagen. Nur Spieler aus dem Kader der Mannschaft.</p></div>
      <div class="btnrow"><button type="button" class="btn" id="s83Pdf">${SVI('download')} Als PDF</button><button type="button" class="btn ghost" data-f1go="training:uebersicht">Zur Übersicht</button></div></div>
    <div class="s83-tw"><table class="s83-t"><thead><tr><th>Spieler</th><th>Training</th><th>Spiele: Einsätze</th><th>Spiele: im Kader</th><th>Veranstaltungen</th></tr></thead><tbody>
    ${D.rows.map(r => `<tr><td>${s83E(r.p.name)}</td><td>${r.tr} / ${r.trN} <small>${s83Q(r.tr, r.trN)}</small></td><td>${r.sp} / ${r.spN}</td><td>${r.kd} / ${r.spN}</td><td>${r.evN ? `${r.ev} / ${r.evN}` : 'keine'}</td></tr>`).join('') || '<tr><td colspan="5">Keine Spieler im Kader.</td></tr>'}</tbody></table></div>
    ${laed ? '<p class="note">Veranstaltungen werden noch geladen …</p>' : err ? '<p class="note s83-warn">Die Zu- und Absagen der Veranstaltungen konnten nicht geladen werden. Prüf die Verbindung und öffne die Seite noch mal.</p>' : ''}
    <p class="note">Training: da oder zu spät. Spiele: Einsatz von Anfang an oder eingewechselt; im Kader zählt auch die Bank. Veranstaltungen: Zusagen von allen Einladungen.</p></div>`;
  f1Bind(B);
  B.querySelector('#s83Pdf').onclick = () => s83BetExport();
};
async function s83BetExport(){
  if(!S83.bet || S83.bet.team !== s83Team() || S83.bet.err) await s83BetLaden();
  if(S83.bet && S83.bet.err) return kToast('Die Veranstaltungen konnten nicht geladen werden. Prüf die Verbindung und versuch es noch mal.');
  const D = s83BetDaten(), titel = 'Beteiligung ' + s83TeamT();
  const R = { titel, sub:'Saison seit ' + TRC.fmt(D.seit) + ' · Stand ' + TRC.fmt(trToday()), sections:[{ t:'Training, Spiele und Veranstaltungen', cols:['Spieler', 'Training', 'Quote', 'Spiele: Einsätze', 'Spiele: im Kader', 'Veranstaltungen'],
    rows:D.rows.map(r => [r.p.name, `${r.tr} / ${r.trN}`, s83Q(r.tr, r.trN), `${r.sp} / ${r.spN}`, `${r.kd} / ${r.spN}`, r.evN ? `${r.ev} / ${r.evN}` : '']),
    note:'Nur Spieler aus dem Kader. Training: da oder zu spät. Veranstaltungen: Zusagen von allen Einladungen.' }] };
  if(typeof exDialog === 'function') exDialog({ titel, sub:'Training, Spiele und Veranstaltungen je Spieler', bericht:async () => R, formate:['pdf', 'xlsx'], vorwahl:['pdf'] });
  else { try{ const b64 = await sxPdf(R), a = document.createElement('a'); a.href = URL.createObjectURL(sxBlob(b64, 'application/pdf')); a.download = titel.replace(/\s+/g, '-') + '.pdf'; a.click(); }catch(e){ kToast('⚠️ PDF ging nicht: ' + e.message); } }
}
// Mannschaft gewechselt: Beteiligung neu laden
{ const _cs83 = mnCtxSet; mnCtxSet = function(){ const r = _cs83.apply(this, arguments); if(r) S83.bet = null; return r; }; }
// Reiter oben: Beteiligung gehört zur Übersicht
{ const _sub83 = sv4Sub; sv4Sub = function(tab){ const k = _sub83.apply(this, arguments); return k === 'training:betl' ? 'training:uebersicht' : k; }; }
SVR_TRV.betl = 'mannschaft';

/* ---------- 3. Verfügbarkeit: Umschalter bleibt oben ---------- */
function s83VerfSeg(){
  const P = document.getElementById('panel-training'), B = document.getElementById('trBody'); if(!P || !B) return;
  const alt = P.querySelector('#s83Seg'), an = (typeof V1NAV === 'undefined' || V1NAV.an) && ['verf', 'injuries', 'urlaub'].includes(TR.view) && svCurTab() === 'training';
  if(!an){ if(alt) alt.remove(); return; }
  const L = [['training:verf', 'Zeitleiste'], ['training:injuries', 'Verletzungen'], ['training:urlaub', 'Abwesenheiten']].filter(([k]) => k !== 'training:injuries' || typeof svrSubOk !== 'function' || svrSubOk('training:injuries'));
  const d = alt || document.createElement('div'); d.id = 's83Seg'; d.innerHTML = f1Seg('training:' + TR.view, L);
  if(!alt) B.before(d); f1Bind(d);
}
{ const _tr83 = trRender; trRender = function(){ const r = _tr83.apply(this, arguments); try{ s83VerfSeg(); }catch(e){ console.warn('Verfügbarkeit 0.86', e); } return r; }; }

/* ---------- Kasse: Umschalter 1./2. Mannschaft oben in der Kasse ---------- */
{ const _vk83 = kbViewKasse; kbViewKasse = function(B){ const r = _vk83.apply(this, arguments);
  try{ if(!B.querySelector('.s83-kt')){ const t = s83Team(), d = document.createElement('div'); d.className = 'k1-leiste s83-kt';
      d.innerHTML = `<div class="k1-seg" role="tablist" aria-label="Mannschaft">${['1', '2'].map(k => `<button type="button" role="tab" aria-selected="${k === t}" class="${k === t ? 'on' : ''}" data-s83kt="${k}">${s83TeamT(k)}</button>`).join('')}</div><span class="note small">Eigener Strafenkatalog je Mannschaft. Kassenstand und Konten sind gemeinsam.</span>`;
      B.prepend(d);
      d.querySelectorAll('[data-s83kt]').forEach(b => b.onclick = () => { if(mnCtxSet(b.dataset.s83kt, false)){ const neu = () => { try{ kbRender(); }catch(e){ kbViewKasse(B); } }; neu();
        let n = 0; const warte = setInterval(() => { n++; if(TR.loaded || n > 40){ clearInterval(warte); if(TR.loaded && svCurTab() === 'kabine' && KB.view === 'kasse') neu(); } }, 250); } }); } }catch(e){ console.warn('Kasse Mannschaft', e); }
  return r; }; }
if(typeof svmAbwSeg === 'function'){ const _as83 = svmAbwSeg; svmAbwSeg = function(B){ const r = _as83.apply(this, arguments);
  try{ if(document.getElementById('s83Seg') || (typeof V1NAV === 'undefined' || V1NAV.an)){ const b = B.querySelector('.svm-aseg [data-aseg]'); if(b && /Abwesenheiten/.test(b.textContent)) b.textContent = 'Liste'; } }catch(e){}
  return r; }; }

(function(){ try{ const s=document.createElement('style'); s.id='svm83css'; s.textContent="/* Beta 0.86 · Mannschaft: Veranstaltungen, Beteiligung, Verfügbarkeit, Kasse je Mannschaft */\n/* Abstand zwischen Anlege-Leiste und Karten in der Übersicht */\n#panel-training[data-v50=\"uebersicht\"] .trtop{margin-bottom:14px;}\n/* In Veranstaltungen, Verfügbarkeit, Organisation und Beteiligung gibt es nichts anzulegen */\n#panel-training[data-v50=\"feste\"] .tract,#panel-training[data-v50=\"verf\"] .tract,#panel-training[data-v50=\"orga\"] .tract,#panel-training[data-v50=\"betl\"] .tract,\n#panel-training[data-v50=\"injuries\"] .tract,#panel-training[data-v50=\"urlaub\"] .tract{display:none;}\n#s83Seg{margin:0 0 12px;}\n#s83Seg .k1-leiste{margin:0;}\n.f1-vk{display:flex;flex-wrap:wrap;align-items:center;justify-content:space-between;gap:10px;margin-bottom:10px;}\n.f1-vk .trh{margin:0;}\n.f1-vk .btnrow{margin:0;}\n.f1-vk .btn,.f1-grid .btn.sm{min-height:44px;}\n\n/* Veranstaltungen */\n.s83-z{display:flex;flex-wrap:wrap;gap:6px;margin-top:5px;}\n.s83-z i{font-style:normal;font-size:12px;font-weight:700;padding:2px 8px;border-radius:999px;background:rgba(148,163,196,.14);color:var(--ink2);}\n.s83-z i.ok{background:rgba(34,197,94,.14);color:var(--ink);} .s83-z i.bad{background:rgba(240,82,82,.14);color:var(--ink);} .s83-z i.mid{background:rgba(234,179,8,.16);color:var(--ink);}\n.s83-zk{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:8px;margin:12px 0;}\n.s83-zk>div{border:1px solid var(--line);border-radius:14px;padding:10px 12px;text-align:center;}\n.s83-zk b{display:block;font-size:22px;font-weight:800;} .s83-zk span{font-size:12px;color:var(--ink2);}\n.s83-info{margin:10px 0 0;white-space:pre-wrap;}\n.s83-teams{display:flex;flex-wrap:wrap;gap:8px;}\n.s83-teams .pchip{min-height:44px;}\n.s83-chk{display:flex;align-items:center;gap:10px;min-height:44px;font-weight:600;}\n.s83-chk input{width:20px;height:20px;}\n.s83-del{color:#dc2626;}\n.s83-del.sure{outline:3px solid #f59e0b;outline-offset:2px;}\n\n/* Tabellen (Statistik, Beteiligung) */\n.s83-tw{overflow-x:auto;-webkit-overflow-scrolling:touch;margin-top:8px;}\n.s83-t{width:100%;border-collapse:collapse;font-size:13.5px;font-variant-numeric:tabular-nums;}\n.s83-t th{text-align:left;font-size:11.5px;letter-spacing:.04em;text-transform:uppercase;color:var(--ink2);padding:8px 10px;border-bottom:1px solid var(--line);white-space:nowrap;}\n.s83-t td{padding:9px 10px;border-bottom:1px solid var(--line2,var(--line));white-space:nowrap;}\n.s83-t td:first-child{font-weight:650;white-space:normal;min-width:140px;}\n.s83-t small{color:var(--ink2);margin-left:4px;}\n\n/* Kasse je Mannschaft */\n.kbkst{display:block;margin-top:2px;font-size:13px;font-weight:700;color:var(--ink2);}\n.kbkatg{margin:12px 0 4px;font-size:12px;letter-spacing:.06em;text-transform:uppercase;color:var(--ink2);}\n.kbkat .kbkatg:first-child{margin-top:4px;}\n.kbkat>.kbkatg{display:block;border-top:0;padding:0;}\n.kbkatc{margin-bottom:8px;} .kbkatc>small{display:block;font-weight:700;color:var(--ink2);margin-bottom:4px;}\n.kbmin{display:inline-flex;align-items:center;gap:6px;font-size:13px;color:var(--ink2);}\n.kbmin input{width:64px;min-height:44px;padding:6px 8px;border-radius:10px;border:1px solid var(--line);background:var(--surface3);color:var(--ink);font:inherit;}\n.kbkrow.kbk2{grid-template-columns:minmax(0,1.6fr) minmax(0,1fr) 80px 92px 110px auto auto;}\n.kbkrow select{padding:9px 8px;border-radius:10px;background:var(--surface3);border:1px solid var(--line);color:var(--ink);font:inherit;min-width:0;}\n.kbpm{display:inline-flex;align-items:center;gap:4px;font-size:12.5px;color:var(--ink2);white-space:nowrap;}\n.kbpm input{width:64px;}\n@media (max-width:760px){\n  .kbkrow.kbk2{grid-template-columns:1fr 1fr;padding:10px;border:1px solid var(--line);border-radius:12px;}\n  .kbkrow.kbk2>input:first-child{grid-column:1/-1;}\n  .s83-zk{grid-template-columns:repeat(2,minmax(0,1fr));}\n}\n/* Tipp-Ziele und Hinweise (0.86 Prüfer) */\n.s83-kt{display:flex;flex-wrap:wrap;align-items:center;gap:10px;margin-bottom:12px;}\n.s83-kt .k1-seg button{min-height:44px;padding:0 16px;}\n.kbkrow .lnk[data-del]{min-width:44px;min-height:44px;display:inline-grid;place-items:center;font-size:16px;}\n.kbkrow .kbchk{min-height:44px;display:inline-flex;align-items:center;gap:6px;}\n.s83-warn{color:var(--ink);background:rgba(234,179,8,.16);border-radius:10px;padding:8px 12px;}\n\n/* Beta 0.99.20 · Strafenkatalog: Reihenfolge je Kategorie mit Pfeilen */\n.kbkrow.kbk2.kbmvr{grid-template-columns:auto minmax(0,1.6fr) minmax(0,1fr) 80px 92px 110px auto auto;}\n.kbmv{display:inline-flex;gap:2px;}\n.kbmv .lnk{min-width:44px;min-height:44px;display:inline-grid;place-items:center;font-size:18px;line-height:1;border-radius:10px;text-decoration:none;}\n.kbmv .lnk:disabled{opacity:.25;cursor:default;}\n.kbmv .lnk:not(:disabled):hover{background:rgba(148,163,196,.14);}\n.kbkrow.kbmv-neu{animation:kbmvNeu .9s ease-out;}\n@keyframes kbmvNeu{from{background:rgba(47,107,255,.18);}to{background:transparent;}}\n@media (prefers-reduced-motion:reduce){.kbkrow.kbmv-neu{animation:none;}}\n@media (max-width:760px){\n  /* Handy: Bezeichnung oben, Pfeile unten zwischen „aktiv“ und Löschen, damit keine Zeile dazukommt */\n  .kbkrow.kbk2.kbmvr{grid-template-columns:repeat(4,minmax(0,1fr));}\n  .kbkrow.kbk2.kbmvr>input[data-f=titel]{grid-column:1/-1;}\n  .kbkrow.kbk2.kbmvr>select,.kbkrow.kbk2.kbmvr>input[data-f=betrag],.kbkrow.kbk2.kbmvr>.kbpm{grid-column:span 2;}\n  .kbkrow.kbk2.kbmvr>.kbmv{grid-column:span 2;order:1;justify-content:center;}\n  .kbkrow.kbk2.kbmvr>[data-del]{order:2;justify-self:end;}\n}\n"; document.head.appendChild(s); }catch(e){} })();
/* Beta 0.87 · Trainingsabfrage auch für die 2. Mannschaft, Abstimmungen und Beteiligung zusammengelegt
   1. Die Automatik (Kabinen-Bot) gibt es je Mannschaft: die Server-Aufrufe tragen die gewählte Mannschaft mit (121_zweite_abfrage.sql).
   2. Einrichtungs-Karte „Trainingsabfrage“ je Mannschaft oben in den Abstimmungen.
   3. Pop-up zum Einladen für das eigene Trainerteam, auch wenn es die Zweite betreut.
   4. Startseite „Deine Mannschaft“: die Zweite öffnet direkt die Mannschaft (Training, Abstimmungen, Kasse).
   5. Beteiligung: eine Seite mit „Aus der App“ und „Aus den Listen“.
   6. Gruppenlink je Mannschaft (team_link_team): die Spielerseite zeigt nur die eigene Mannschaft. */
const S84 = { betTab:'app', botP:null };
function s84Team(){ try{ return mnCtx(); }catch(e){ return '1'; } }
function s84TeamT(t){ return (t || s84Team()) === '2' ? '2. Mannschaft' : '1. Mannschaft'; }
const s84E = s => (typeof svEsc === 'function' ? svEsc(s) : String(s == null ? '' : s));

/* ---------- 1. Server-Aufrufe der Automatik mit Mannschaft ---------- */
function s84Hook(){
  const sb = typeof SVB !== 'undefined' && SVB.sb; if(!sb || sb._s84) return; sb._s84 = 1;
  const rpc = sb.rpc.bind(sb);
  sb.rpc = function(fn, args, opt){
    if(fn === 'kabine_bot_get'){ const t = s84Team(), q = rpc('kabine_bot_get_team', { p_team:t }, opt);
      const P = Promise.resolve(q).then(r => (r && r.data && r.data.team && r.data.team !== s84Team()) ? Object.assign({}, r, { veraltet:true }) : r);
      return { then:(a, b) => P.then(a, b), catch:f => P.catch(f), finally:f => P.finally(f) }; }
    if(fn === 'kabine_bot_set' && args && args.p && !args.p.team){ const p = Object.assign({}, args.p, { team:s84Team() });
      // gemeinsamer Versand gehört der Ersten: aus der Zweiten nie mitschicken (sonst überschreibt eine alte Seite neue Werte)
      if(p.team === '2'){ delete p.sc_channel; delete p.sc_template; delete p.app_url; delete p.sc_key; }
      args = Object.assign({}, args, { p }); }
    if(fn === 'kabine_bot_einzeln'){ const a = Object.assign({ p_team:s84Team() }, args || {}); if(a.p_team === '2') a.p_template = null; return rpc('kabine_bot_einzeln_team', a, opt); }
    // Gruppenlink je Mannschaft: wer den Link der Zweiten hat, sieht nur deren Abstimmungen
    if(fn === 'team_link'){ const t = s84Team(), P = Promise.resolve(rpc('team_link_team', { p_team:t, p_new:!!(args && args.p_new) }, opt))
        .then(r => { if(r && !r.error && r.data){ KB.links = KB.links || {}; KB.links[t] = r.data; } return r; });
      return { then:(a, b) => P.then(a, b), catch:f => P.catch(f), finally:f => P.finally(f) }; }
    return rpc(fn, args, opt); };
  // Edge Function: „Testnachricht“ und „Jetzt prüfen“ gelten der gewählten Mannschaft
  try{ const FP = Object.getPrototypeOf(sb.functions); if(FP && !FP._s84 && typeof FP.invoke === 'function'){ const inv = FP.invoke; FP._s84 = 1;
    FP.invoke = function(name, o){ if(name === 'kabine-bot'){ o = Object.assign({}, o || {}); o.body = Object.assign({ team:s84Team() }, o.body || {}); } return inv.call(this, name, o); }; } }catch(e){}
}
if(typeof kbLoadKern === 'function'){ const _kl84 = kbLoadKern; kbLoadKern = async function(){ s84Hook(); return _kl84.apply(this, arguments); }; }
// Einstellungen der gerade gewählten Mannschaft laden (nach dem Umschalten)
function s84BotLaden(){
  if(S84.botP) return S84.botP; s84Hook();
  S84.botP = (async () => { try{ const r = await SVB.sb.rpc('kabine_bot_get'); if(!r.veraltet) KB.bot = r.data || null; }catch(e){} })().finally(() => { S84.botP = null; });
  return S84.botP;
}
function s84BotPasst(){ return !!(KB.bot && (KB.bot.team || '1') === s84Team()); }
{ const _cs84 = mnCtxSet; mnCtxSet = function(){ const r = _cs84.apply(this, arguments);
  try{ if(r && typeof KB !== 'undefined'){ KB.link = (KB.links || {})[s84Team()] || null; if(KB.loaded) s84BotLaden(); } }catch(e){} return r; }; }
// Link einer Abstimmung immer mit dem Gruppenlink ihrer Mannschaft (auch auf der Startseite und im Pop-up)
async function s84Links(){ s84Hook(); KB.links = KB.links || {};
  for(const t of ['1', '2']) if(!KB.links[t]){ try{ const r = await SVB.sb.rpc('team_link_team', { p_team:t, p_new:false }); if(!r.error && r.data) KB.links[t] = r.data; }catch(e){} } }
if(typeof kbLoadKern === 'function'){ const _kl84b = kbLoadKern; kbLoadKern = async function(){ const r = await _kl84b.apply(this, arguments); try{ if(canTraining()){ await s84Links(); KB.link = KB.links[s84Team()] || KB.link; } }catch(e){} return r; }; }
if(typeof kbUrl === 'function'){ const _ku84 = kbUrl; kbUrl = function(poll){
  const p = poll && ((KB._p31all || KB.polls || []).find(x => x.id === poll)), t = p ? (p.team || '1') : s84Team(), alt = KB.link;
  if(KB.links && KB.links[t]) KB.link = KB.links[t];
  try{ return _ku84.apply(this, arguments); } finally{ KB.link = alt; } }; }
if(typeof kbPollTitle === 'function'){ const _pt84 = kbPollTitle; kbPollTitle = function(p){ const h = _pt84.apply(this, arguments); return p && (p.team || '1') === '2' && s84Team() !== '2' ? h + ' · 2. Mannschaft' : h; }; }
// Startseite: Karte „Abstimmung“ für die Mannschaft(en) des eigenen Trainerteams
if(typeof kbHomeCard === 'function'){ const _hc84 = kbHomeCard; kbHomeCard = function(){
  if(typeof KB === 'undefined' || !KB.loaded || document.querySelector('#panel-kabine.active')) return _hc84.apply(this, arguments);
  const M = s84MeineTeams(), alt = KB.polls; KB.polls = (KB._p31all || alt || []).filter(p => M.includes(p.team || '1'));
  try{ return _hc84.apply(this, arguments); } finally{ KB.polls = alt; } }; }
// Automatik-Karte: immer mit den Einstellungen der gewählten Mannschaft
if(typeof kbViewLink === 'function'){ const _vl84 = kbViewLink; kbViewLink = async function(B){
  if(typeof KB !== 'undefined' && KB.loaded && !s84BotPasst()){ if(B) B.innerHTML = '<div class="card"><div class="empty">Lade Automatik …</div></div>'; await s84BotLaden(); if(B && !B.isConnected) return; }
  return _vl84.apply(this, arguments); }; }
if(typeof kbViewLink === 'function'){ const _vl84b = kbViewLink; kbViewLink = async function(B){ const r = await _vl84b.apply(this, arguments);
  try{ const h = B && B.querySelector('.kblink h3'); if(h && !h.dataset.s84){ h.dataset.s84 = 1; h.insertAdjacentHTML('beforeend', ` <small class="s84-tt">${s84E(s84TeamT())}</small>`);
    const pp = B.querySelector('.kblink p'); if(pp) pp.insertAdjacentHTML('beforeend', ' Jede Mannschaft hat ihren eigenen Link und sieht nur ihre Abstimmungen.'); } }catch(e){}
  return r; }; }
if(typeof kbBotCard === 'function'){ const _bc84 = kbBotCard; kbBotCard = function(){ const h = _bc84.apply(this, arguments);
  return h.replace('Automatik fürs Training</h3>', `Automatik fürs Training <small class="s84-tt">${s84E(s84TeamT())}</small></h3>`); }; }
if(typeof kbBotWire === 'function'){ const _bw84 = kbBotWire; kbBotWire = function(B){ const r = _bw84.apply(this, arguments);
  try{ if(s84Team() === '2'){
    // Zugang, Kanal und Vorlagen gelten für beide Mannschaften und stehen bei der Ersten
    const ch = B.querySelector('#kbA_ch'), f = ch && ch.closest('.kbform'); if(f){ f.classList.add('s84-aus'); const n = f.nextElementSibling; if(n && n.classList.contains('note')) n.classList.add('s84-aus');
      f.insertAdjacentHTML('beforebegin', `<p class="note s84-gem">WhatsApp-Zugang, Kanal und Vorlagen gelten für beide Mannschaften. ${KB.bot && KB.bot.versand && KB.bot.sc_template ? 'Sie sind eingerichtet ✓' : 'Eingerichtet werden sie einmal bei der 1. Mannschaft.'}</p>`); }
    const tps = B.querySelector('#kbA_tps'), tf = tps && tps.closest('.field'); if(tf) tf.classList.add('s84-aus'); } }catch(e){ console.warn('Automatik 0.87', e); }
  return r; }; }

/* ---------- 2. Einrichtungs-Karte „Trainingsabfrage“ ---------- */
function s84Schritte(){
  const c = KB.bot || {}, t = s84Team(), heute = trToday(), P = KB.polls || [];
  const offen = P.filter(p => p.art === 'training' && !p.event_id && !p.geschlossen && p.datum >= heute).sort((a, b) => a.datum < b.datum ? -1 : 1)[0] || null;
  const geteilt = P.some(p => (p.geteilt_at || p.gesendet_at) && TRC.diffDays(heute, p.datum) <= 21);
  const versand = !!(c.versand && c.sc_channel && c.sc_template);
  return [
    { k:'auto', ok:!!(c.aktiv && (c.tage || []).length), t:'Automatik an, Trainingstage gewählt',
      d:c.aktiv && (c.tage || []).length ? 'Die App legt für jedes Training die Abstimmung selbst an.' : 'Trainingstage antippen, Automatik anschalten, speichern. Dann muss niemand mehr daran denken.', b:'Einstellen', go:'auto' },
    { k:'trainer', ok:!!((c.empfaenger || []).length && versand), opt:!versand, t:'Link kommt per WhatsApp ans Trainerteam',
      d:!versand ? 'Der WhatsApp-Versand ist noch nicht verbunden. Bis dahin erinnert euch das Pop-up in der App, den Link selbst zu teilen.' : (c.empfaenger || []).length ? `${(c.empfaenger || []).length} Empfänger hinterlegt.` : 'Trag unten Name und Handynummer der Trainer ein.', b:'Empfänger', go:'auto' },
    { k:'gruppe', ok:geteilt, t:'Abstimmung in der Mannschaftsgruppe geteilt',
      d:geteilt ? 'Die Spieler haben den Link. Bei jeder neuen Abstimmung kommt er wieder.' : offen ? 'Die nächste Abstimmung ist fertig. Einmal in die WhatsApp-Gruppe teilen.' : 'Noch keine Abstimmung offen. Leg eine an oder schalt die Automatik an.', b:offen ? 'Jetzt teilen' : 'Abstimmung anlegen', go:offen ? 'teilen' : 'neu', poll:offen && offen.id },
    { k:'spieler', ok:true, info:true, t:'Fehlt ein Spieler?',
      d:'In jeder Abstimmung unter „Details“ nimmst du ihn mit einem Tipp dazu. Wer noch gar nicht in der App steht, trägt sich über den Gruppenlink der Mannschaft selbst ein.' + (c.einzeln_einladen && versand ? ' Spieler mit hinterlegter Handynummer bekommen ihren persönlichen Link per WhatsApp.' : ' Mit Handynummer kann jeder seinen persönlichen Link bekommen, das schaltest du unten unter „Spieler einzeln per WhatsApp“ an.'), b:'Nummern & Links', go:'links' }
  ].concat(t === '2' || isAdmin() ? [{ k:'team', ok:true, info:true, t:'Trainerteam in der App',
      d:'Trainer und Co-Trainer bekommen einen eigenen Zugang mit Rolle Trainer und Mannschaft „2. Mannschaft“. Dann sehen sie Abstimmungen, Pop-ups und die Beteiligung.' + (isAdmin() ? '' : ' Einladen kann der Admin.'), b:isAdmin() ? 'Einladen' : '', go:'einladen' }] : []);
}
function s84Karte(B){
  if(!B || !canTraining() || typeof KB === 'undefined' || !KB.loaded) return;
  const alt = B.querySelector('#s84Setup'); if(alt) alt.remove();
  if(!s84BotPasst()){ s84BotLaden().then(() => { if(B.isConnected && s84BotPasst()) s84Karte(B); }); return; }
  const L = s84Schritte(), pflicht = L.filter(x => !x.info && !x.opt), fertig = pflicht.filter(x => x.ok).length, alle = fertig === pflicht.length;
  let zu = alle; try{ const v = localStorage.getItem('s84_setup_' + s84Team()); if(v === 'auf') zu = false; else if(v === 'zu' && alle) zu = true; }catch(e){}
  const box = document.createElement('div'); box.id = 's84Setup'; box.className = 'card s84-setup' + (zu ? ' zu' : '');
  box.innerHTML = `<button type="button" class="s84-kopf" aria-expanded="${!zu}"><span class="s84-ring${alle ? ' ok' : ''}">${fertig}/${pflicht.length}</span><span><b>Trainingsabfrage ${s84E(s84TeamT())}</b><small>${alle ? 'Läuft. Nach dem Training „Anwesenheit vorbereiten“ tippen, dann zählt es in der Beteiligung.' : 'So fragt ihr die Trainingsbeteiligung über die App ab.'}</small></span><i>${SVI('chev')}</i></button>
    <ol class="s84-l">${L.map(x => `<li class="${x.ok && !x.info ? 'ok' : x.info ? 'info' : x.opt ? 'opt' : ''}"><span class="s84-c">${x.ok && !x.info ? '✓' : x.info ? 'i' : ''}</span><div><b>${s84E(x.t)}</b><p>${s84E(x.d)}</p></div>${x.b ? `<button type="button" class="btn ghost sm" data-s84="${x.go}"${x.poll ? ` data-poll="${s84E(x.poll)}"` : ''}>${s84E(x.b)}</button>` : ''}</li>`).join('')}</ol>`;
  B.prepend(box);
  box.querySelector('.s84-kopf').onclick = () => { const z = !box.classList.contains('zu'); box.classList.toggle('zu', z); box.querySelector('.s84-kopf').setAttribute('aria-expanded', String(!z)); try{ localStorage.setItem('s84_setup_' + s84Team(), z ? 'zu' : 'auf'); }catch(e){} };
  box.querySelectorAll('[data-s84]').forEach(b => b.onclick = () => {
    const g = b.dataset.s84;
    if(g === 'auto'){ const a = document.getElementById('kbAuto50') || document.querySelector('.kbbot'); if(a) a.scrollIntoView({ behavior:'smooth', block:'start' }); }
