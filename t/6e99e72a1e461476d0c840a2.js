// Zeilen umbrechen für eine Breite
function wbZeilen(ctx, text, breite){ const W = String(text).split(/\s+/).filter(Boolean), L = []; let z = '';
  W.forEach(w => { const t = z ? z + ' ' + w : w; if(ctx.measureText(t).width <= breite || !z) z = t; else { L.push(z); z = w; } }); if(z) L.push(z); return L; }

async function wbZeichnen(cv){
  const F = WB_FMT[WB.fmt], W = F.w, H = F.h, ctx = cv.getContext('2d'); cv.width = W; cv.height = H;
  await wbSchriften(); if(!WB_CREST){ try{ WB_CREST = await wbBild('crest.svg'); }catch(e){} }
  const pad = 84, story = WB.fmt === 'story', fotoH = WB.img ? Math.round(H * F.foto) : 0;
  ctx.fillStyle = WB_FARBE.grund; ctx.fillRect(0, 0, W, H);
  if(WB.img){ const im = WB.img, s = Math.max(W / im.width, fotoH / im.height), w = im.width * s, h = im.height * s;
    ctx.save(); ctx.beginPath(); ctx.rect(0, 0, W, fotoH); ctx.clip(); ctx.drawImage(im, (W - w) / 2, (fotoH - h) * 0.72, w, h);   // Motiv der Galerie-Fotos sitzt meist im unteren Drittel ctx.restore();
    ctx.fillStyle = WB_FARBE.linie; ctx.fillRect(0, fotoH - 6, W, 12); }
  // Inhalt unten, sichere Zone der Story: oben 260, unten 300 frei
  const oben = WB.img ? fotoH + 70 : (story ? 280 : pad), unten = H - (story ? 260 : pad);
  const crest = WB.img ? 150 : (story ? 220 : 170);
  // Erst messen, dann den Block mittig in den freien Platz setzen
  const breite = W - pad * 2, crestTop = !WB.img;
  ctx.font = '600 44px InterV, sans-serif'; const zeilen = wbZeilen(ctx, WB.zeile, breite).slice(0, 2);
  const restH = 58 + zeilen.length * 58 + (WB.ort ? 52 : 0) + (WB.zusatz ? 104 : 0) + 26 + (crestTop ? crest + 36 : 0);
  let gr = story ? 168 : 132, L = [];
  for(; gr >= 48; gr -= 4){ ctx.font = `700 ${gr}px BarlowC, sans-serif`; L = wbZeilen(ctx, String(WB.titel || '').toUpperCase(), breite);
    if(L.length <= 3 && L.every(z => ctx.measureText(z).width <= breite) && L.length * gr * 0.98 + restH <= unten - oben) break; }
  L = L.slice(0, 3);
  const blockH = restH + L.length * gr * 0.98;
  let y = oben + Math.max(0, (unten - oben - blockH) / (WB.img ? 3 : 2));
  if(WB_CREST){ const cw = crest * (52 / 54.67);
    if(WB.img) ctx.drawImage(WB_CREST, W - pad - cw, fotoH - crest / 2, cw, crest);
    else { ctx.drawImage(WB_CREST, pad, y, cw, crest); y += crest + 36; } }
  ctx.textBaseline = 'top';
  ctx.fillStyle = WB_FARBE.label; ctx.font = '600 34px BarlowC, sans-serif';
  if('letterSpacing' in ctx) ctx.letterSpacing = '4px'; ctx.fillText('SV/BSC MÖRLENBACH', pad, y); if('letterSpacing' in ctx) ctx.letterSpacing = '0px';
  y += 58;
  ctx.font = `700 ${gr}px BarlowC, sans-serif`; ctx.fillStyle = WB_FARBE.text; L.forEach((z, n) => ctx.fillText(z, pad, y + n * gr * 0.98, breite));
  y += L.length * gr * 0.98 + 26;
  ctx.font = '600 44px InterV, sans-serif'; ctx.fillStyle = WB_FARBE.text; zeilen.forEach(z => { ctx.fillText(z, pad, y, breite); y += 58; });
  if(WB.ort){ ctx.font = '400 38px InterV, sans-serif'; ctx.fillStyle = WB_FARBE.leise; ctx.fillText(wbZeilen(ctx, WB.ort, breite)[0] || '', pad, y, breite); y += 52; }
  if(WB.zusatz){ y += 28; ctx.font = '700 38px InterV, sans-serif'; const t = WB.zusatz, tw = Math.min(ctx.measureText(t).width, breite - 64), ph = 76;
    ctx.fillStyle = WB_FARBE.pill; if(ctx.roundRect){ ctx.beginPath(); ctx.roundRect(pad, y, tw + 64, ph, ph / 2); ctx.fill(); } else ctx.fillRect(pad, y, tw + 64, ph);
    ctx.fillStyle = '#ffffff'; ctx.textBaseline = 'middle'; ctx.fillText(t, pad + 32, y + ph / 2 + 2, breite - 64); ctx.textBaseline = 'top'; }
  return cv;
}
function wbBlob(cv){ return new Promise(ok => cv.toBlob(b => ok(b), 'image/jpeg', 0.92)); }
function wbName(i){ return ('svbsc ' + (i.t || 'termin') + ' ' + WB.fmt).replace(/[^\wäöüÄÖÜß -]+/g, '').replace(/\s+/g, '-').toLowerCase() + '.jpg'; }

async function wbOeffnen(i){
  Object.assign(WB, { fmt:'story', foto:null, img:null, titel:i.t || '', zeile:wbDatum(i), ort:i.ort || '', zusatz:'' });
  const fotos = (typeof PK_FOTOS !== 'undefined' ? PK_FOTOS : []).slice(0, 12);
  const M = svModal(`<div class="mhead"><div><h2 style="margin:0">Werbebild</h2><div class="msub">Für Story, Beitrag oder WhatsApp. Das Bild entsteht auf deinem Handy.</div></div></div>
    <div class="wb">
      <div class="wb-vor"><canvas id="wbC" aria-label="Vorschau des Werbebilds" role="img"></canvas></div>
      <div class="wb-ein">
        <div class="wb-seg" role="group" aria-label="Format">${Object.entries(WB_FMT).map(([k, f]) => `<button type="button" data-wf="${k}" aria-pressed="${k === WB.fmt}"><b>${f.t}</b><small>${f.s}</small></button>`).join('')}</div>
        <div class="field"><label>Foto</label><div class="wb-fotos"><label class="wb-f wb-eig">${SVI('camera')}<span>Eigenes</span><input type="file" id="wbDatei" accept="image/*" hidden></label>
          <button type="button" class="wb-f wb-ohne on" data-wb="">Ohne</button>${fotos.map(f => `<button type="button" class="wb-f" data-wb="plakat/foto/${svEsc(f.id)}.webp" aria-label="${svEsc(f.titel)}"><img src="plakat/foto/klein/${svEsc(f.id)}.webp" alt="" loading="lazy"></button>`).join('')}</div>
          <p class="note small">Nur eigene Fotos oder Fotos, die ihr nutzen dürft. Keine Logos fremder Firmen.</p></div>
        <div class="field"><label for="wbT">Überschrift</label><input id="wbT" maxlength="80" value="${svEsc(WB.titel)}"></div>
        <div class="field"><label for="wbZ">Wann</label><input id="wbZ" maxlength="80" value="${svEsc(WB.zeile)}"></div>
        <div class="field"><label for="wbO">Wo</label><input id="wbO" maxlength="80" value="${svEsc(WB.ort)}"></div>
        <div class="field"><label for="wbX">Zusatz</label><div class="wb-chips">${WB_ZUSATZ.map(z => `<button type="button" class="kal-chip" data-wz="${svEsc(z)}" style="--c:#2f6bff"><i></i>${svEsc(z)}</button>`).join('')}</div>
          <input id="wbX" maxlength="40" placeholder="oder eigener Text"></div>
      </div>
    </div>
    <div class="btnrow sbact">${navigator.share ? `<button class="btn" id="wbTeil" type="button">${SVI('share')} Teilen</button>` : ''}<button class="btn${navigator.share ? ' ghost' : ''}" id="wbLad" type="button">${SVI('download')} Herunterladen</button>
      <button class="btn ghost" id="wbTxt" type="button">${SVI('copy')} Text dazu</button></div>`);
  const cv = M.querySelector('#wbC'); let tim = null;
  const neu = () => { clearTimeout(tim); tim = setTimeout(() => wbZeichnen(cv).catch(e => console.warn('Werbebild', e)), 60); };
  M.querySelectorAll('[data-wf]').forEach(b => b.onclick = () => { WB.fmt = b.dataset.wf; M.querySelectorAll('[data-wf]').forEach(x => x.setAttribute('aria-pressed', x === b)); neu(); });
  const fotoWahl = async (src, btn) => { M.querySelectorAll('.wb-f').forEach(x => x.classList.toggle('on', x === btn)); WB.foto = src || null;
    try{ WB.img = src ? await wbBild(src) : null; }catch(e){ WB.img = null; kToast(e.message); } neu(); };
  M.querySelectorAll('[data-wb]').forEach(b => b.onclick = () => fotoWahl(b.dataset.wb, b));
  M.querySelector('#wbDatei').onchange = ev => { const f = ev.target.files && ev.target.files[0]; if(!f) return; fotoWahl(URL.createObjectURL(f), M.querySelector('.wb-eig')); };
  [['#wbT', 'titel'], ['#wbZ', 'zeile'], ['#wbO', 'ort'], ['#wbX', 'zusatz']].forEach(([id, k]) => { M.querySelector(id).oninput = ev => { WB[k] = ev.target.value; if(k === 'zusatz') M.querySelectorAll('[data-wz]').forEach(x => x.classList.toggle('on', x.dataset.wz === WB.zusatz)); neu(); }; });
  M.querySelectorAll('[data-wz]').forEach(b => b.onclick = () => { WB.zusatz = WB.zusatz === b.dataset.wz ? '' : b.dataset.wz; M.querySelector('#wbX').value = WB.zusatz; M.querySelectorAll('[data-wz]').forEach(x => x.classList.toggle('on', x.dataset.wz === WB.zusatz)); neu(); });
  const text = () => (typeof kalShareText === 'function' ? kalShareText(i) : i.t);
  const fertig = async () => { await wbZeichnen(cv); return new File([await wbBlob(cv)], wbName(i), { type:'image/jpeg' }); };
  const lad = M.querySelector('#wbLad'); lad.onclick = async () => { if(lad.disabled) return; lad.disabled = true;
    try{ const f = await fertig(), a = document.createElement('a'); a.href = URL.createObjectURL(f); a.download = f.name; document.body.appendChild(a); a.click(); setTimeout(() => { URL.revokeObjectURL(a.href); a.remove(); }, 4000); kToast('Bild gespeichert'); }
    catch(e){ kToast('Das Bild ließ sich nicht erstellen'); } lad.disabled = false; };
  const t = M.querySelector('#wbTeil'); if(t) t.onclick = async () => { if(t.disabled) return; t.disabled = true;
    try{ const f = await fertig(); if(navigator.canShare && navigator.canShare({ files:[f] })) await navigator.share({ files:[f], text: text() }); else { kToast('Teilen geht hier nicht, bitte herunterladen'); } }
    catch(e){ if(!(e && e.name === 'AbortError')) kToast('Teilen ging nicht, bitte herunterladen'); } t.disabled = false; };
  M.querySelector('#wbTxt').onclick = async () => { const x = text(); try{ await navigator.clipboard.writeText(x); kToast('Text kopiert'); }catch(e){ kToast('Kopieren ging nicht'); } };
  neu();
}

/* =====================================================================
   Beta 0.76 · Ideen und Fehler melden (Wunsch Albert, 04.11.2026)
   Von überall: unter „Mehr“, in der Seitenleiste und unter Mein Konto. Mit dabei automatisch: Bereich, Version, Gerät.
   Jeder sieht seine eigenen Meldungen mit Stand und Antwort. Vorstand und Admin sehen alle und antworten.
   ===================================================================== */
const RM_ART = { idee:'Idee', fehler:'Fehler', frage:'Frage', lob:'Lob' };
const RM_STAND = { neu:'Neu', gesehen:'Gesehen', geplant:'Geplant', umgesetzt:'Umgesetzt', abgelehnt:'Nicht geplant' };
const RM = { d:null, art:'idee', reiter:'neu' };

function rmGeraet(){ const u = navigator.userAgent || '', s = (window.matchMedia && matchMedia('(display-mode: standalone)').matches) ? 'App' : 'Browser';
  const os = /iPhone|iPad/.test(u) ? 'iOS' : /Android/.test(u) ? 'Android' : /Mac/.test(u) ? 'Mac' : /Windows/.test(u) ? 'Windows' : 'anderes';
  return `${os}, ${s}, ${innerWidth}×${innerHeight}`; }
async function rmLaden(){ const { data, error } = await SVB.sb.rpc('rueckmeldungen_laden'); if(error) throw new Error(svFehlerText(error)); RM.d = data; rmBadge(); return data; }
function rmDatum(t){ try{ return new Date(t).toLocaleDateString('de-DE', { day:'2-digit', month:'2-digit', year:'2-digit' }); }catch(e){ return ''; } }

function rmOeffnen(reiter){
  RM.reiter = reiter || 'neu'; const bereich = (typeof svCurTab === 'function' && svCurTab()) || '', bereichName = ((typeof SV_PAGES !== 'undefined' && SV_PAGES[bereich]) || [bereich || 'Start'])[0];
  const M = svModal(`<div class="mhead"><div><h2 style="margin:0">Idee oder Fehler melden</h2><div class="msub">Was fehlt dir, was stört, was klappt nicht? Jede Meldung landet direkt beim Vorstand.</div></div></div>
    <div class="seg4 rm-seg" role="tablist"><button type="button" role="tab" data-rr="neu">Melden</button><button type="button" role="tab" data-rr="meine">Meine</button><button type="button" role="tab" data-rr="alle" hidden>Alle</button></div>
    <div id="rmI"></div>`);
  const I = M.querySelector('#rmI');
  const reiterZeigen = () => { M.querySelectorAll('[data-rr]').forEach(b => { b.classList.toggle('on', b.dataset.rr === RM.reiter); b.setAttribute('aria-selected', b.dataset.rr === RM.reiter); });
    const a = M.querySelector('[data-rr="alle"]'); if(RM.d && RM.d.verwalten){ a.hidden = false; a.innerHTML = 'Alle' + (RM.d.neu ? ` <em class="rm-zahl">${RM.d.neu}</em>` : ''); } };
  const zeig = () => { reiterZeigen();
    if(RM.reiter === 'neu'){
      I.innerHTML = `<div class="rm-art" role="group" aria-label="Art">${Object.entries(RM_ART).map(([k, t]) => `<button type="button" class="kal-chip${RM.art === k ? ' on' : ''}" data-ra="${k}" aria-pressed="${RM.art === k}" style="--c:#2f6bff"><i></i>${t}</button>`).join('')}</div>
        <div class="field"><label for="rmT">${RM.art === 'fehler' ? 'Was ist passiert, und was hättest du erwartet?' : RM.art === 'frage' ? 'Deine Frage' : RM.art === 'lob' ? 'Was gefällt dir?' : 'Deine Idee'}</label>
          <textarea id="rmT" rows="5" maxlength="2000" placeholder="${RM.art === 'fehler' ? 'Zum Beispiel: Beim Speichern einer Schicht kommt eine Fehlermeldung.' : 'Zum Beispiel: Ich hätte gern eine Erinnerung am Vortag.'}"></textarea></div>
        <p class="note small">Mitgeschickt wird, wo du gerade warst (${svEsc(bereichName)}), die Version und dein Gerät. Sonst nichts.</p>
        <div class="btnrow sbact"><button type="button" class="btn" id="rmGo">${SVI('send')} Senden</button></div>`;
      I.querySelectorAll('[data-ra]').forEach(b => b.onclick = () => { const t = I.querySelector('#rmT').value; RM.art = b.dataset.ra; zeig(); I.querySelector('#rmT').value = t; });
      const go = I.querySelector('#rmGo'); go.onclick = async () => { const t = I.querySelector('#rmT').value.trim(); if(t.length < 3) return kToast('Schreib kurz, worum es geht');
        if(go.disabled) return; go.disabled = true;
        const v = (typeof SV_PATCHES !== 'undefined' && SV_PATCHES[0] && SV_PATCHES[0].v) || '';
        const { error } = await SVB.sb.rpc('rueckmeldung_senden', { p:{ art: RM.art, text: t, bereich, version: v, geraet: rmGeraet() } });
        go.disabled = false; if(error) return kToast(svFehlerText(error));
        kToast('Danke! Deine Meldung ist angekommen.'); RM.reiter = 'meine'; await rmLaden().catch(() => {}); zeig(); };
      setTimeout(() => { try{ I.querySelector('#rmT').focus(); }catch(e){} }, 60);
      return;
    }
    if(!RM.d){ I.innerHTML = '<p class="note">Lade …</p>'; rmLaden().then(zeig).catch(e => { I.innerHTML = `<p class="note">${svEsc(e.message)}</p>`; }); return; }
    if(RM.reiter === 'meine'){
      const L = RM.d.meine || [];
      I.innerHTML = L.length ? L.map(r => `<div class="rm-z"><div class="rm-k"><b>${RM_ART[r.art] || r.art}</b><i class="rm-st s-${svEsc(r.status)}">${RM_STAND[r.status] || r.status}</i><small>${rmDatum(r.am)}</small></div>
          <p>${svEsc(r.text)}</p>${r.antwort ? `<p class="rm-ant"><b>Antwort:</b> ${svEsc(r.antwort)}</p>` : ''}</div>`).join('') : '<p class="note">Du hast noch nichts gemeldet.</p>';
      return;
    }
    const L = RM.d.alle || [];
    I.innerHTML = L.length ? L.map(r => `<div class="rm-z" data-rid="${svEsc(r.id)}"><div class="rm-k"><b>${RM_ART[r.art] || r.art}</b><i class="rm-st s-${svEsc(r.status)}">${RM_STAND[r.status] || r.status}</i><small>${svEsc(r.von)} · ${rmDatum(r.am)}</small></div>
        <p>${svEsc(r.text)}</p><small class="rm-meta">${svEsc([r.bereich ? ((typeof SV_PAGES !== 'undefined' && SV_PAGES[r.bereich]) || [r.bereich])[0] : '', r.version ? 'Version ' + r.version : '', r.geraet].filter(Boolean).join(' · '))}</small>
        <div class="rm-bear"><select data-rs aria-label="Stand">${Object.entries(RM_STAND).map(([k, t]) => `<option value="${k}"${k === r.status ? ' selected' : ''}>${t}</option>`).join('')}</select>
          <input data-rt maxlength="1000" placeholder="Antwort, sieht die Person" value="${svEsc(r.antwort || '')}"><button type="button" class="btn ghost" data-rgo>Speichern</button></div></div>`).join('') : '<p class="note">Noch keine Meldungen.</p>';
    I.querySelectorAll('[data-rid]').forEach(z => { const b = z.querySelector('[data-rgo]'); b.onclick = async () => { if(b.disabled) return; b.disabled = true;
      const { data, error } = await SVB.sb.rpc('rueckmeldung_antwort', { p_id: z.dataset.rid, p_status: z.querySelector('[data-rs]').value, p_antwort: z.querySelector('[data-rt]').value });
      b.disabled = false; if(error) return kToast(svFehlerText(error)); RM.d = data; rmBadge(); kToast('Gespeichert'); zeig(); }; });
  };
  M.querySelectorAll('[data-rr]').forEach(b => b.onclick = () => { RM.reiter = b.dataset.rr; zeig(); });
  zeig(); if(!RM.d) rmLaden().then(reiterZeigen).catch(() => {});
}
function rmBadge(){ const n = RM.d && RM.d.verwalten ? (RM.d.neu || 0) : 0; document.querySelectorAll('.rm-badge').forEach(b => { b.textContent = n; b.hidden = !n; }); }

/* ---------- Einstiege ---------- */
function rmEinstiege(){
  const sh = document.getElementById('moreSheet');
  if(sh && !sh.querySelector('.rm-sheet')){ const b = document.createElement('button'); b.type = 'button'; b.className = 'sp-sheet rm-sheet';
    b.innerHTML = `<span>${SVI('chat')}</span><div><b>Idee oder Fehler melden</b><small>Direkt an den Vorstand</small></div><em class="rm-badge rm-zahl" hidden>0</em><i>›</i>`;
    b.onclick = () => { svSheet(false); rmOeffnen(); }; const v = sh.querySelector('.sp-sheet'); if(v) v.after(b); else { const g = sh.querySelector('.grab'); if(g) g.after(b); else sh.prepend(b); } }
  const nav = document.querySelector('.snav');
  if(nav && !nav.querySelector('.rm-nav')){ const b = document.createElement('button'); b.type = 'button'; b.className = 'sp-nav rm-nav'; b.setAttribute('data-tip', 'Idee oder Fehler melden');
    b.innerHTML = `<span class="sp-nic">${SVI('chat')}</span><span>Idee oder Fehler melden</span><span class="cnt rm-badge" hidden>0</span>`; b.onclick = () => rmOeffnen();
    const v = nav.querySelector('.sp-nav'); if(v) v.after(b); else nav.appendChild(b); }
  rmBadge();
}
{ const _se = spEntries; spEntries = function(){ const r = _se.apply(this, arguments); try{ rmEinstiege(); }catch(e){} return r; }; }
{ const _acc = svAccount; svAccount = function(){ const r = _acc.apply(this, arguments);
  try{ const M = document.getElementById('modal'); if(M && !M.querySelector('#rmAcc')){ const s = document.createElement('div'); s.className = 'editsec'; s.id = 'rmAcc';
    s.innerHTML = `<h4>Idee oder Fehler</h4><button class="btn ghost sm" id="rmAccB" type="button">${SVI('chat')} Melden oder Antworten lesen</button>`; M.appendChild(s); s.querySelector('#rmAccB').onclick = () => rmOeffnen(); } }catch(e){}
  return r; }; }
// Vorstand und Admin: Zahl der neuen Meldungen einmal nach dem Start holen
setTimeout(() => { try{ if(typeof SVU !== 'undefined' && SVU && SVU.id && ['admin', 'vorstand'].includes(svRole())) rmLaden().catch(() => {}); rmEinstiege(); }catch(e){} }, 7000);

/* =====================================================================
   Beta 0.77 · Passkeys unter Mein Konto (Wunsch Albert, 04.11.2026)
   Einrichten (Face ID, Touch ID, Windows Hello), Liste mit Name und Datum, umbenennen, entfernen mit Rückfrage.
   Nach einer Anmeldung mit Passwort einmal pro Gerät ein dezenter Hinweis, wenn das Gerät Passkeys kann.
   Passkeys ändern nichts an Rolle und Rechten: die prüft der Server wie immer. Es wird nichts geloggt.
   Fehlertexte und Geräte-Erkennung kommen aus boot.js (SVB.passkey).
   ===================================================================== */
const PSK = { liste:null, aus:false, laden:null, hinweisOffen:false };
const PSK_HINWEIS = 'svbcPkHinweis';
function pskLs(k, v){ try{ if(v === undefined) return localStorage.getItem(k); if(v === null) localStorage.removeItem(k); else localStorage.setItem(k, v); }catch(e){ return null; } }
function pskGeht(){ try{ return !!(SVB.passkey && SVB.passkey.geht()); }catch(e){ return false; } }
function pskGeraet(){ try{ return SVB.passkey.geraet(); }catch(e){ return 'Face ID, Touch ID oder Windows Hello'; } }
function pskDatum(t){ try{ return t ? new Date(t).toLocaleDateString('de-DE', { day:'2-digit', month:'2-digit', year:'numeric' }) : ''; }catch(e){ return ''; } }
function pskName(p){ return (p && p.friendly_name) || 'Passkey'; }
// Ein Name für neue Passkeys, falls der Server keinen mitliefert
function pskGeraetName(){ const u = navigator.userAgent || '';
  return /iPhone/.test(u) ? 'iPhone' : (/iPad/.test(u) || (/Macintosh/.test(u) && navigator.maxTouchPoints > 1)) ? 'iPad' : /Android/.test(u) ? 'Android' : /Macintosh|Mac OS X/.test(u) ? 'Mac' : /Windows/.test(u) ? 'Windows' : 'Dieses Gerät'; }

async function pskLaden(){
  const { data, error } = await SVB.sb.auth.passkey.list();
  if(error){ const f = SVB.passkey.fehler(error, 'konto'); if(f.art === 'aus'){ PSK.aus = true; PSK.liste = []; return PSK.liste; } throw f; }
  PSK.aus = false; PSK.liste = (Array.isArray(data) ? data : (data && (data.passkeys || data.items)) || []).slice().sort((a, b) => String(b.created_at || '').localeCompare(String(a.created_at || '')));
  if(!PSK.liste.length) SVB.passkey.merken(false);
  return PSK.liste;
}
async function pskEinrichten(){
  const { data, error } = await SVB.sb.auth.registerPasskey();
  if(error) return SVB.passkey.fehler(error, 'konto');
  SVB.passkey.merken(true); pskLs(PSK_HINWEIS, '1');
  if(data && data.id && !data.friendly_name){ try{ await SVB.sb.auth.passkey.update({ passkeyId: data.id, friendlyName: pskGeraetName() }); }catch(e){} }
  return { ok:true };
}

/* ---------- Abschnitt unter Mein Konto ---------- */
function pskKonto(M){
  if(!M || M.querySelector('#pskAcc')) return;
  const s = document.createElement('div'); s.className = 'editsec'; s.id = 'pskAcc';
  const pw = M.querySelector('#svPw1'), nach = pw && pw.closest('.editsec'); if(nach) nach.after(s); else M.appendChild(s);
  pskZeigen(s);
  if(pskGeht()) pskLaden().then(() => pskZeigen(s)).catch(f => { PSK.liste = []; pskZeigen(s, f); });
}
function pskZeigen(s, f){
  if(!s || !s.isConnected) return;
  const geht = pskGeht(), L = PSK.liste;
  let inhalt;
  if(!geht) inhalt = `<p class="note">${(window.Capacitor && window.Capacitor.isNativePlatform && window.Capacitor.isNativePlatform()) ? 'In der Store-App gibt es Passkeys noch nicht. Öffne die Sportzentrale im Browser unter svbsc.kaderwerk.pro, um einen einzurichten.' : 'Dieser Browser kann keine Passkeys. Mit einem aktuellen Safari, Chrome, Edge oder Firefox geht es.'}</p>`;
  else if(PSK.aus) inhalt = `<p class="note psk-info" id="pskAus">Passkeys sind im Verein noch nicht freigeschaltet. Sobald der Admin sie einschaltet, kannst du hier einen einrichten.</p>`;
  else if(L === null) inhalt = `<p class="note">Lade …</p>`;
  else inhalt = `<div class="psk-liste" id="pskListe">${L.length ? L.map(p => pskZeile(p)).join('') : '<p class="note psk-leer">Noch kein Passkey eingerichtet.</p>'}</div>
      <div class="btnrow"><button class="btn psk-neu" id="pskNeu" type="button">${SVI('key')} ${L.length ? 'Weiteren Passkey einrichten' : 'Passkey einrichten'}</button></div>`;
  s.innerHTML = `<h4>Passkeys</h4><p class="note psk-lead">Melde dich mit ${svEsc(pskGeraet())} an, ganz ohne Passwort. Der Schlüssel bleibt auf deinem Gerät, der Verein bekommt nur den öffentlichen Teil.</p>
    ${inhalt}<div class="psk-msg" id="pskMsg" role="status" aria-live="polite"></div>`;
  s.querySelectorAll('.btn svg').forEach(v => { v.style.cssText = 'width:16px;height:16px;vertical-align:-3px;margin-right:4px'; });
  if(f && f.text) pskMeldung(s, f.kind, f.text);
  const neu = s.querySelector('#pskNeu');
  if(neu) neu.onclick = async () => { if(neu.disabled) return; neu.disabled = true; neu.dataset.l = neu.innerHTML; neu.textContent = 'Warte auf Bestätigung …'; pskMeldung(s);
    const r = await pskEinrichten().catch(e => SVB.passkey.fehler(e, 'konto'));
    if(r.ok){ await pskLaden().catch(() => {}); pskZeigen(s); pskMeldung(s, 'ok', 'Passkey eingerichtet. Ab jetzt reicht beim Anmelden ' + pskGeraet() + '.'); return; }
    if(r.art === 'aus'){ PSK.aus = true; pskZeigen(s); return; }
    neu.disabled = false; neu.innerHTML = neu.dataset.l; if(!r.still) pskMeldung(s, r.kind, r.text); };
  s.querySelectorAll('[data-psk]').forEach(z => pskZeileVerdrahten(s, z));
}
function pskZeile(p){
  const d = [p.created_at ? 'Eingerichtet am ' + pskDatum(p.created_at) : '', p.last_used_at ? 'zuletzt benutzt am ' + pskDatum(p.last_used_at) : ''].filter(Boolean).join(', ');
  return `<div class="psk-z" data-psk="${svEsc(p.id)}"><span class="psk-ic" aria-hidden="true">${SVI('key')}</span>
    <div class="psk-t"><b>${svEsc(pskName(p))}</b><small>${svEsc(d)}</small></div>
    <div class="psk-k"><button type="button" class="psk-b" data-pskren>Umbenennen</button><button type="button" class="psk-b psk-weg" data-pskdel>Entfernen</button></div></div>`;
}
function pskZeileVerdrahten(s, z){
  const id = z.dataset.psk, p = (PSK.liste || []).find(x => String(x.id) === id) || {};
  const ren = z.querySelector('[data-pskren]'), del = z.querySelector('[data-pskdel]');
  if(ren) ren.onclick = () => {
    z.classList.add('psk-edit');
    z.innerHTML = `<label class="psk-lab" for="pskN-${svEsc(id)}">Name für diesen Passkey</label><div class="psk-form"><input id="pskN-${svEsc(id)}" maxlength="120" value="${svEsc(pskName(p))}" autocomplete="off">
      <button type="button" class="psk-b psk-ja" data-pskok>Speichern</button><button type="button" class="psk-b" data-pskab>Abbrechen</button></div>`;
    const inp = z.querySelector('input'); inp.focus(); inp.select();
    const speichern = async () => { const n = inp.value.trim().slice(0, 120); if(!n){ inp.focus(); return; }
      const b = z.querySelector('[data-pskok]'); if(b.disabled) return; b.disabled = true;
      const { error } = await SVB.sb.auth.passkey.update({ passkeyId: id, friendlyName: n });
      if(error){ b.disabled = false; const f = SVB.passkey.fehler(error, 'konto'); return pskMeldung(s, f.kind, f.text); }
      p.friendly_name = n; pskZeigen(s); pskMeldung(s, 'ok', 'Gespeichert.'); };
    z.querySelector('[data-pskok]').onclick = speichern;
    inp.onkeydown = e => { if(e.key === 'Enter'){ e.preventDefault(); speichern(); } else if(e.key === 'Escape'){ e.stopPropagation(); pskZeigen(s); } };
    z.querySelector('[data-pskab]').onclick = () => pskZeigen(s);
  };
  if(del) del.onclick = () => {
    z.classList.add('psk-frage');
    z.innerHTML = `<p class="psk-fr"><b>„${svEsc(pskName(p))}“ entfernen?</b> Auf dem Gerät mit diesem Passkey meldest du dich danach wieder mit Passwort an.</p>
      <div class="psk-k"><button type="button" class="psk-b psk-weg psk-ja" data-pskja>Entfernen</button><button type="button" class="psk-b" data-pskab>Abbrechen</button></div>`;
    z.querySelector('[data-pskab]').onclick = () => pskZeigen(s);
    const ja = z.querySelector('[data-pskja]'); ja.focus();
    ja.onclick = async () => { if(ja.disabled) return; ja.disabled = true;
      const { error } = await SVB.sb.auth.passkey.delete({ passkeyId: id });
      if(error){ ja.disabled = false; const f = SVB.passkey.fehler(error, 'konto'); return pskMeldung(s, f.kind, f.text); }
      PSK.liste = (PSK.liste || []).filter(x => String(x.id) !== id); if(!PSK.liste.length) SVB.passkey.merken(false);
      pskZeigen(s); pskMeldung(s, 'ok', 'Passkey entfernt.'); };
  };
}
function pskMeldung(s, kind, text){ const m = s && s.querySelector('#pskMsg'); if(!m) return; m.className = 'psk-msg' + (text ? ' ' + (kind || 'info') : ''); m.textContent = text || ''; }

{ const _acc = svAccount; svAccount = function(){ const r = _acc.apply(this, arguments);
  try{ pskKonto(document.getElementById('modal')); }catch(e){} return r; }; }

/* ---------- Einmaliger Hinweis nach der Anmeldung mit Passwort ---------- */
function pskFrei(){
  try{ if(!document.getElementById('gate').classList.contains('done')) return false;
    const ov = document.getElementById('overlay'); if(ov && ov.classList.contains('open')) return false;
    if(typeof I1 !== 'undefined' && I1.offen) return false;
    const a = document.activeElement; if(a && /^(INPUT|TEXTAREA|SELECT)$/.test(a.tagName) && a.offsetParent !== null) return false; }catch(e){ return false; }
  return document.visibilityState === 'visible';
}
async function pskHinweisPruefen(n){
  if(!window.__svbcPwLogin || pskLs(PSK_HINWEIS) || PSK.hinweisOffen || !pskGeht()) return;
  if(!pskFrei()){ if(n < 8) setTimeout(() => pskHinweisPruefen(n + 1), 8000); return; }
  try{ if(PublicKeyCredential.isUserVerifyingPlatformAuthenticatorAvailable && !(await PublicKeyCredential.isUserVerifyingPlatformAuthenticatorAvailable())) return; }catch(e){ return; }
  try{ const L = await pskLaden(); if(PSK.aus) return; if(L.length){ pskLs(PSK_HINWEIS, '1'); return; } }catch(e){ return; }
  if(!pskFrei() || pskLs(PSK_HINWEIS)) return;
  pskHinweis();
}
function pskHinweis(){
  pskLs(PSK_HINWEIS, '1');   // nur einmal pro Gerät, egal wie es ausgeht
  const g = pskGeraet(), kurz = /^(Face ID|Touch ID|Windows Hello)$/.test(g) ? g : 'Passkey';
  let el = document.getElementById('pskblatt'); if(!el){ el = document.createElement('div'); el.id = 'pskblatt'; el.className = 'i1-blatt psk-blatt'; el.setAttribute('role', 'dialog'); el.setAttribute('aria-modal', 'false'); document.body.appendChild(el); }
  el.setAttribute('aria-label', 'Passkey einrichten');
  el.innerHTML = `<button class="i1-x psk-x" type="button" data-pskh="zu" aria-label="Schließen">×</button>
    <div class="i1-kopf"><div class="i1-ic psk-hic">${SVI('key')}</div><div><b>Nächstes Mal mit ${svEsc(kurz)} anmelden?</b><small>Mit einem Passkey meldest du dich auf diesem Gerät ohne Passwort an. Du findest das jederzeit unter Mein Konto.</small></div></div>
    <div class="psk-msg" id="pskHMsg" role="status" aria-live="polite"></div>
    <div class="i1-knoepfe"><button class="btn" type="button" data-pskh="ja">Jetzt einrichten</button><button class="btn ghost" type="button" data-pskh="zu">Nein, danke</button></div>`;
  PSK.hinweisOffen = true;
  const zu = () => { el.classList.remove('auf'); PSK.hinweisOffen = false; };
  el.querySelectorAll('[data-pskh="zu"]').forEach(b => b.onclick = zu);
  const ja = el.querySelector('[data-pskh="ja"]');
  ja.onclick = async () => { if(ja.disabled) return; ja.disabled = true; const m = el.querySelector('#pskHMsg'); m.className = 'psk-msg'; m.textContent = '';
    const r = await pskEinrichten().catch(e => SVB.passkey.fehler(e, 'konto'));
    ja.disabled = false;
    if(r.ok){ zu(); try{ kToast('Passkey eingerichtet. Ab jetzt reicht beim Anmelden ' + g + '.'); }catch(e){} return; }
    if(r.still) return; m.className = 'psk-msg ' + (r.kind || 'info'); m.textContent = r.text; };
  requestAnimationFrame(() => el.classList.add('auf'));
}
document.addEventListener('keydown', e => { if(e.key === 'Escape' && PSK.hinweisOffen){ const el = document.getElementById('pskblatt'); if(el) el.classList.remove('auf'); PSK.hinweisOffen = false; } });
// Das Installieren-Blatt (svm50) wartet, solange der Hinweis offen ist
if(typeof i1Zeigen === 'function'){ const _i1z = i1Zeigen; i1Zeigen = function(force){ if(PSK.hinweisOffen && !force) return Promise.resolve(); return _i1z.apply(this, arguments); }; }
setTimeout(() => pskHinweisPruefen(0), 6000);

(function(){ try{ const s=document.createElement('style'); s.id='svm74pcss'; s.textContent="/* Beta 0.77 · Passkeys unter Mein Konto und einmaliger Hinweis. Tipp-Ziele mindestens 44 px */\n#pskAcc .psk-lead{margin:0 0 12px;}\n.psk-liste{display:flex;flex-direction:column;gap:8px;margin-bottom:12px;}\n.psk-leer{margin:0;}\n.psk-z{display:flex;align-items:center;gap:12px;padding:10px 12px;border:1px solid var(--line);border-radius:14px;background:var(--surface2);flex-wrap:wrap;}\n.psk-ic{flex:0 0 40px;width:40px;height:40px;border-radius:12px;display:grid;place-items:center;background:var(--brandSoft);color:var(--brand2);}\n.psk-ic svg{width:18px;height:18px;}\n.psk-t{flex:1 1 160px;min-width:0;}\n.psk-t b{display:block;font-size:14.5px;color:var(--ink);overflow:hidden;text-overflow:ellipsis;white-space:nowrap;}\n.psk-t small{display:block;font-size:12.5px;color:var(--ink2);margin-top:2px;}\n.psk-k{display:flex;gap:6px;flex:0 0 auto;}\n.psk-b{min-height:44px;min-width:44px;padding:0 14px;border-radius:12px;border:1px solid var(--line);background:transparent;color:var(--ink);font:600 13.5px var(--font);cursor:pointer;}\n.psk-b:hover{background:rgba(148,163,196,.08);}\n.psk-b:focus-visible{outline:2px solid var(--brand2);outline-offset:2px;}\n.psk-b[disabled]{opacity:.55;cursor:default;}\n.psk-weg{color:var(--bad);}\n.psk-weg.psk-ja{background:rgba(240,82,82,.12);border-color:rgba(240,82,82,.35);}\n.psk-form .psk-ja:not(.psk-weg){background:var(--brand);border-color:transparent;color:#fff;}\n.psk-frage,.psk-edit{flex-direction:column;align-items:stretch;}\n.psk-fr{margin:0;font-size:13.5px;line-height:1.45;color:var(--ink2);}\n.psk-fr b{color:var(--ink);}\n.psk-lab{font-size:12.5px;font-weight:650;color:var(--ink2);}\n.psk-form{display:flex;gap:6px;flex-wrap:wrap;}\n.psk-form input{flex:1 1 180px;min-height:44px;box-sizing:border-box;border-radius:12px;border:1px solid var(--line);background:var(--bg2);color:var(--ink);font:inherit;font-size:16px;padding:0 12px;}\n.psk-neu{min-height:44px;}\n.psk-msg{font-size:13px;line-height:1.45;border-radius:12px;display:none;margin-top:10px;}\n.psk-msg.ok,.psk-msg.err,.psk-msg.info{display:block;padding:10px 12px;}\n.psk-msg.ok{background:rgba(34,197,94,.1);border:1px solid rgba(34,197,94,.3);color:var(--ink);}\n.psk-msg.err{background:rgba(240,82,82,.1);border:1px solid rgba(240,82,82,.3);color:var(--ink);}\n.psk-msg.info{background:var(--brandSoft);border:1px solid rgba(91,155,255,.3);color:var(--ink);}\n.psk-blatt .i1-x{width:44px;height:44px;top:4px;right:6px;}\n.psk-blatt{padding-top:16px;}\n.psk-hic{color:var(--brand2);}\n.psk-hic svg{width:20px;height:20px;}\n.psk-blatt .psk-msg{margin-top:10px;}\n.psk-blatt .i1-knoepfe .btn{min-height:44px;}\n.psk-blatt .i1-knoepfe svg{width:16px;height:16px;}\n@media (max-width:520px){.psk-k{width:100%;}.psk-k .psk-b{flex:1 1 0;}}\n"; document.head.appendChild(s); }catch(e){} })();
/* =====================================================================
   Sportzentrale Beta 0.78 · To-do-Liste als Prioritäten-Werkzeug (Wunsch des Vorstands, 04.11.2026)
   „Themen nicht vergessen, priorisieren und mit Ablaufdaten und Zeitplan festhalten. Dass uns nie etwas entgeht.“
   Erweitert die Planung aus svm44.js (gleiche Daten, gleiche Rechte), Server in 112_aufgaben_prio.sql.
   - Schnell erfassen: „Was steht an?“ auf Heute (ein Tipp) und in der Planung, mit Vorschau dessen, was erkannt wurde
     („bis Freitag“, „morgen“, „15.11.“, „um 18 Uhr“, „!“ wichtig, „!!“ dringend, „jeden Monat“, @Person). Bei Unklarheit wird nichts gesetzt.
   - Fokus statt „Meine“: Überfällig, Heute (mit Wiedervorlage und Nachfassen), Diese Woche, Wichtiges ohne Datum, Wartet auf, Ungeklärtes
   - Alle: nach Stufe (Dringend, Wichtig, Normal, Irgendwann) mit eigener Reihenfolge je Stufe
   - Woche: Rückblick (erledigt, neu, offen, überfällig) und der ganze Verlauf erledigter Aufgaben
   - Aufgabe: Stufe, Uhrzeit, Wiedervorlage, Wiederholung, mehrere Zuständige, Sichtbarkeit (Bereich, nur Vorstand, privat)
   - Einstellungen: Tagesübersicht per Push, Meldungen über Überfälliges (Vorstand), fällige Aufgaben im Kalender-Abo
   ===================================================================== */
const PRIO={sicht:'fokus',filter:'alle',ordnen:false,wMeine:false,archiv:null,archivEnde:false,archivLaedt:false};
const prioE=s=>svEsc(s==null?'':String(s));
const PRIO_ST={1:'Dringend',2:'Wichtig',3:'Normal',4:'Irgendwann'};
const PRIO_WDH={woche:'Jede Woche','2wochen':'Alle zwei Wochen',monat:'Jeden Monat',quartal:'Jedes Quartal',jahr:'Jedes Jahr'};
const PRIO_SICHT={bereich:'Alle im Bereich',vorstand:'Nur Vorstand',privat:'Nur ich und die Zuständigen'};
const PRIO_WT=['Sonntag','Montag','Dienstag','Mittwoch','Donnerstag','Freitag','Samstag'];

/* ---------- Kleine Helfer ---------- */
function prioStufe(a){ return +a.stufe||(a.prio===1?2:a.prio===3?4:3); }
function prioIch(){ return PL.d&&PL.d.ich; }
function prioMein(a){ const i=prioIch(); return !!i&&(a.wer===i||(a.mit||[]).includes(i)); }
function prioUngeklaert(a){ return plOffen(a)&&!a.faellig&&!a.wer&&!a.wer_text&&!(a.mit||[]).length; }
function prioHeuteDran(a){ const h=plHeute(); return plOffen(a)&&((a.wiedervorlage&&a.wiedervorlage<=h)||(a.status==='wartet'&&a.nachfassen&&a.nachfassen<=h)); }
function prioSortiert(A){ return A.slice().sort((x,y)=>(prioStufe(x)-prioStufe(y))||((x.sort||0)-(y.sort||0))||((x.faellig||'9999')<(y.faellig||'9999')?-1:(x.faellig||'9999')>(y.faellig||'9999')?1:0)||String(x.am||'').localeCompare(String(y.am||''))); }
function prioNachDatum(A){ return A.slice().sort((x,y)=>((x.faellig||'9999')+(x.zeit||'99'))<((y.faellig||'9999')+(y.zeit||'99'))?-1:((x.faellig||'9999')+(x.zeit||'99'))>((y.faellig||'9999')+(y.zeit||'99'))?1:(prioStufe(x)-prioStufe(y))||((x.sort||0)-(y.sort||0))); }
function prioDatum(iso){ if(!iso)return ''; const d=new Date(iso+'T12:00:00'); return PRIO_WT[d.getDay()].slice(0,2)+', '+d.toLocaleDateString('de-DE',{day:'2-digit',month:'2-digit'})+(d.getFullYear()!==new Date().getFullYear()?String(d.getFullYear()).slice(2):''); }
function prioWann(a){ if(!a.faellig)return ''; const t=plTage(a.faellig);
  const tag=t===0?'Heute':t===1?'Morgen':t===-1?'Gestern':t<0?'Seit '+(-t)+' Tagen':t<7?PRIO_WT[new Date(a.faellig+'T12:00:00').getDay()]:prioDatum(a.faellig);
  return tag+(a.zeit?', '+a.zeit+' Uhr':''); }
function prioNamen(a){ return [plWerName(a)].concat(a.mit_namen||[]).filter(Boolean); }
function prioBereichTitel(k){ return PL_B[k]?PL_B[k].t:''; }
function prioStdBereich(){ const B=plBer(); let k=null; try{ k=localStorage.getItem('sv_prio_b'); }catch(e){} if(k&&B.includes(k))return k; return B.includes('leitung')?'leitung':B[0]||null; }
function prioLaden(){ return PL.d?Promise.resolve(PL.d):plLaden(); }

/* ---------- Natürliche Eingabe (deutsch, ohne Raten) ---------- */
// Ergebnis wie plParse (titel, faellig, prio, wer, wer_text, sitzung, mehrdeutig), dazu stufe, zeit, mit, sicht, wiederholung.
// Was unklar ist (zwei Daten, 31.02., Uhrzeit ohne Tag), bleibt im Titel und steht in „unklar“.
function prioParse(txt){
  let t=' '+String(txt||'').replace(/\s+/g,' ').trim()+' '; const r={}, unklar=[];
  const h=plHeute(), L=(PL.d&&PL.d.leute)||[];
  t=t.replace(/\s#runde(?=\s)/ig,()=>{ r.sitzung=true; return ' '; });
  t=t.replace(/\s#privat(?=\s)/ig,()=>{ r.sicht='privat'; return ' '; });
  t=t.replace(/\s#vorstand(?=\s)/ig,()=>{ r.sicht='vorstand'; return ' '; });
  let st=0;
  t=t.replace(/\s(?:!{2,}|#dringend)(?=\s)/ig,()=>{ st=1; return ' '; });
  t=t.replace(/\s(?:!|#wichtig)(?=\s)/ig,()=>{ if(!st||st>2)st=2; return ' '; });
  t=t.replace(/\s#irgendwann(?=\s)/ig,()=>{ if(!st)st=4; return ' '; });
  if(st){ r.stufe=st; r.prio=st<=2?1:st===3?2:3; }
  // Wiederholung
  const WDH=[[/\s(?:alle\s+(?:zwei|2)\s+wochen|zweiwöchentlich|14-tägig)(?=\s)/i,'2wochen'],[/\s(?:jede[nrs]?\s+woche|wöchentlich|woechentlich)(?=\s)/i,'woche'],
    [/\s(?:jede[nrs]?\s+monat|monatlich)(?=\s)/i,'monat'],[/\s(?:jede[nrs]?\s+quartal|quartalsweise|vierteljährlich)(?=\s)/i,'quartal'],[/\s(?:jede[nrs]?\s+jahr|jährlich|jaehrlich)(?=\s)/i,'jahr']];
  for(const [re,w] of WDH){ if(re.test(t)){ if(r.wiederholung&&r.wiederholung!==w){ unklar.push('Zwei verschiedene Wiederholungen'); delete r.wiederholung; break; } r.wiederholung=w; t=t.replace(re,' '); } }
  // Personen: die erste ist zuständig, weitere mit Konto kommen dazu
  let ersteP=true;
  t=t.replace(/\s@([A-Za-zÄÖÜäöüß][\wÄÖÜäöüß.-]*)(?:\s+([A-Za-zÄÖÜäöüß0-9][\wÄÖÜäöüß.-]*))?/g,(m,n,n2)=>{
    const k=n.toLowerCase(), nm=l=>String(l.name).toLowerCase(); let id=null, rest=n2?' '+n2:'';
    if(n2){ const z=L.filter(l=>nm(l).startsWith(k+' '+n2.toLowerCase())); if(z.length===1){ id=z[0].id; rest=''; } }
    if(!id){ let z=L.filter(l=>nm(l).split(/\s+/)[0]===k); if(!z.length)z=L.filter(l=>nm(l).startsWith(k)); if(!z.length)z=L.filter(l=>nm(l).includes(k));
      if(z.length===1)id=z[0].id; else if(z.length>1){ if(!r.mehrdeutig)r.mehrdeutig=n; return rest+' '; }
      else if(ersteP){ ersteP=false; r.wer_text=n.charAt(0).toUpperCase()+n.slice(1); return rest+' '; }
      else { unklar.push('„'+n+'“ hat kein Konto'); return m; } }
    if(ersteP){ ersteP=false; r.wer=id; } else if(id!==r.wer){ (r.mit=r.mit||[]); if(!r.mit.includes(id))r.mit.push(id); }
    return rest+' '; });
  // Datum: alle Kandidaten sammeln, nur bei genau einem eindeutigen Tag setzen
  const kand=[], belegt=[];
  const frei=(a,b)=>!belegt.some(([x,y])=>a<y&&b>x);
  const nimm=(re,fn)=>{ re.lastIndex=0; let m; while((m=re.exec(t))){ const a=m.index, b=a+m[0].length; if(!frei(a,b))continue; belegt.push([a,b]); const iso=fn(m); kand.push({a,b,iso,txt:m[0].trim()}); if(m[0].length===0)re.lastIndex++; } };
  const echt=(J,M,D)=>{ const d=new Date(J,M-1,D,12); return d.getFullYear()===J&&d.getMonth()===M-1&&d.getDate()===D?plIso(d):null; };
  nimm(/\s(?:bis\s+(?:zum\s+)?|am\s+|zum\s+)?(\d{1,2})\.(\d{1,2})\.(\d{4}|\d{2})?(?=\s)/gi,m=>{ const D=+m[1], M=+m[2]; let J=m[3]?(m[3].length===2?2000+ +m[3]:+m[3]):new Date().getFullYear();
    let iso=echt(J,M,D); if(iso&&!m[3]&&iso<h)iso=echt(J+1,M,D); return iso; });
  nimm(/\s(?:bis\s+)?(heute|morgen|übermorgen|uebermorgen)(?=\s)/gi,m=>plPlus(h,{heute:0,morgen:1,'übermorgen':2,uebermorgen:2}[m[1].toLowerCase()]));
  nimm(/\s(?:bis\s+)?(?:zur\s+|in\s+der\s+)?(?:nächste[nr]?|naechste[nr]?|kommende[nr]?)\s+woche(?=\s)/gi,()=>{ const d=new Date(h+'T12:00:00'), n=((8-d.getDay())%7)||7; return plPlus(h,n); });
  nimm(/\s(?:bis\s+)?(?:zum\s+)?(?:monatsende|ende\s+des\s+monats)(?=\s)/gi,()=>{ const d=new Date(h+'T12:00:00'); return plIso(new Date(d.getFullYear(),d.getMonth()+1,0,12)); });
  nimm(/\s(?:bis\s+)?in\s+(\d{1,3}|einem|einer|zwei|drei|vier|fünf|sechs)\s+(tag|tagen|woche|wochen|monat|monaten)(?=\s)/gi,m=>{ const z={einem:1,einer:1,zwei:2,drei:3,vier:4,'fünf':5,sechs:6}; const n=/^\d+$/.test(m[1])?+m[1]:z[m[1].toLowerCase()];
    const e=m[2].toLowerCase(); if(e.startsWith('tag'))return plPlus(h,n); if(e.startsWith('woche'))return plPlus(h,7*n); const d=new Date(h+'T12:00:00'); d.setMonth(d.getMonth()+n); return plIso(d); });
  nimm(/\s(?:bis\s+)?(?:zum\s+|am\s+)?(?:nächsten\s+|naechsten\s+|kommenden\s+)?(montag|dienstag|mittwoch|donnerstag|freitag|samstag|sonntag)(?=\s)/gi,m=>{ const z=PL_WT.indexOf(m[1].toLowerCase()), d=new Date(h+'T12:00:00').getDay(); return plPlus(h,((z-d+7)%7)||7); });
  const tage=[...new Set(kand.map(k=>k.iso))];
  if(kand.some(k=>!k.iso)){ kand.filter(k=>!k.iso).forEach(k=>unklar.push('„'+k.txt+'“ ist kein gültiges Datum')); }
  else if(tage.length===1){ r.faellig=tage[0]; kand.sort((x,y)=>y.a-x.a).forEach(k=>{ t=t.slice(0,k.a)+' '+t.slice(k.b); }); }
  else if(tage.length>1)unklar.push('Mehrere Daten erkannt, bitte selbst wählen');
  // Uhrzeit: nur zusammen mit einem Tag
  const zr=/\s(?:um\s+)?(?:([01]?\d|2[0-3])(?::([0-5]\d))?\s*uhr|([01]?\d|2[0-3]):([0-5]\d))(?=\s)/gi; const zeiten=[]; let zm;
  while((zm=zr.exec(t))){ zeiten.push({a:zm.index,b:zm.index+zm[0].length,z:String(zm[1]||zm[3]).padStart(2,'0')+':'+(zm[2]||zm[4]||'00')}); }
  const zs=[...new Set(zeiten.map(z=>z.z))];
  if(zs.length===1&&r.faellig){ r.zeit=zs[0]; zeiten.sort((x,y)=>y.a-x.a).forEach(z=>{ t=t.slice(0,z.a)+' '+t.slice(z.b); }); }
  else if(zs.length===1)unklar.push('Uhrzeit ohne Tag, bitte ein Datum dazuschreiben');
  else if(zs.length>1)unklar.push('Mehrere Uhrzeiten erkannt');
  r.titel=t.replace(/\s+/g,' ').trim();
  Object.defineProperty(r,'unklar',{value:unklar,enumerable:false});
  return r; }
// Was erkannt wurde, als ruhige Zeile unter dem Eingabefeld
function prioVorschau(r){ const L=(PL.d&&PL.d.leute)||[], name=id=>(L.find(l=>l.id===id)||{}).name||'';
  const c=[]; if(r.faellig)c.push(['Fällig',prioDatum(r.faellig)+(r.zeit?', '+r.zeit+' Uhr':'')]);
  if(r.stufe)c.push(['Stufe',PRIO_ST[r.stufe]]); if(r.wer)c.push(['Für',name(r.wer)]); if(r.wer_text)c.push(['Für',r.wer_text+' (ohne Konto)']);
  if(r.mit&&r.mit.length)c.push(['Mit',r.mit.map(name).join(', ')]); if(r.wiederholung)c.push(['Wiederholt',PRIO_WDH[r.wiederholung]]);
  if(r.sitzung)c.push(['Runde','Für die nächste Runde']); if(r.sicht)c.push(['Sicht',PRIO_SICHT[r.sicht]]);
  return c.map(([k,v])=>`<span class="prio-chip"><small>${prioE(k)}</small> ${prioE(v)}</span>`).join('')
    +(r.unklar||[]).map(u=>`<span class="prio-chip warn">${prioE(u)}</span>`).join('')
    +(r.mehrdeutig?`<span class="prio-chip warn">Mehrere heißen „${prioE(r.mehrdeutig)}“, bitte mit Nachnamen</span>`:''); }

/* ---------- Schnell erfassen ---------- */
function prioQuickHtml(id,vor){ const B=plBer(), b=vor.bereich||prioStdBereich();
  return `<form class="prio-q" id="${id}F" autocomplete="off"><label class="prio-ql" for="${id}">Was steht an?</label>
    <div class="prio-qz"><input id="${id}" maxlength="240" enterkeyhint="done" placeholder="z. B. Versicherung kündigen bis 15.11. !" aria-describedby="${id}V"><button class="btn" type="submit">Anlegen</button></div>
    <div class="prio-qv" id="${id}V" aria-live="polite"></div>
    ${B.length>1&&!vor.festerBereich?`<div class="prio-qb"><label for="${id}B">Bereich</label><select id="${id}B">${B.map(k=>`<option value="${k}"${k===b?' selected':''}>${prioE(PL_B[k].t)}</option>`).join('')}</select></div>`:''}
    <p class="prio-qh">Datum, Uhrzeit und Person schreibst du einfach dazu: „morgen“, „bis Freitag“, „15.11. um 18 Uhr“, „@Name“. „!“ heißt wichtig, „!!“ dringend, „jeden Monat“ wiederholt.</p></form>`; }
function prioQuickBinden(R,id,vor,fertig){
  const f=R.querySelector('#'+id+'F'); if(!f)return; const i=f.querySelector('#'+id), v=f.querySelector('#'+id+'V'), bs=f.querySelector('#'+id+'B');
  const zeig=()=>{ const s=i.value.trim(); v.innerHTML=s?prioVorschau(prioParse(s)):''; };
  i.addEventListener('input',()=>{ clearTimeout(PRIO.qt); PRIO.qt=setTimeout(zeig,120); });
  if(bs)bs.onchange=()=>{ try{ localStorage.setItem('sv_prio_b',bs.value); }catch(e){} };
  f.onsubmit=async e=>{ e.preventDefault(); const knopf=f.querySelector('button[type=submit]'); if(knopf.disabled)return;
    const p=prioParse(i.value);
    if(!p.titel){ kToast('Schreib kurz, was ansteht'); i.focus(); return; }
    if(p.mehrdeutig){ kToast('Mehrere Personen heißen „'+p.mehrdeutig+'“. Bitte mit Nachnamen schreiben'); return; }
    const neu=Object.assign({bereich:bs?bs.value:(vor.bereich||prioStdBereich())},vor.projekt?{projekt:vor.projekt}:{},!p.wer&&!p.wer_text&&vor.wer?{wer:vor.wer}:{},p);
    if(!neu.bereich){ kToast('Dir fehlt ein Bereich in der Planung'); return; }
    knopf.disabled=true;
    try{ const a=await ogRpc('plan_aufgabe_speichern',{p:neu}); PL.d.aufgaben.push(a); i.value=''; v.innerHTML='';
      kToast('Angelegt'+(a.wer_name&&a.wer!==PL.d.ich?' für '+a.wer_name.split(' ')[0]:'')+(a.faellig?', fällig '+prioWann(a).toLowerCase():'')+((p.unklar||[]).length?'. Datum bitte prüfen':''));
      if(fertig)fertig(a); }
    catch(x){ kToast('⚠️ '+x.message); }
    finally{ knopf.disabled=false; } };
  zeig(); }
// Blatt „Was steht an?“: von Heute und vom Plus-Knopf in der Planung
async function prioSchnell(vor={}){
  if(!plDarf())return;
  try{ await prioLaden(); }catch(e){ kToast('⚠️ '+e.message); return; }
  const M=svModal(`<div class="og-form prio-blatt"><h2>Neue Aufgabe</h2>${prioQuickHtml('prioS',Object.assign({wer:PL.d.ich},vor))}
    <div class="btnrow sbact"><button class="btn ghost" type="button" id="prioSmehr">Mit allen Angaben</button></div></div>`);
  prioQuickBinden(M,'prioS',Object.assign({wer:PL.d.ich},vor),a=>{ closeOverlay(); prioNeuZeichnen(); prioRueck('Angelegt: „'+a.titel+'“','Öffnen',()=>plAufgabeOeffnen(a.id)); });
  M.querySelector('#prioSmehr').onclick=()=>{ const s=M.querySelector('#prioS').value, p=s?prioParse(s):{}, b=M.querySelector('#prioSB'); closeOverlay();
    plAufgabeOeffnen(null,Object.assign({bereich:b?b.value:(vor.bereich||prioStdBereich()),wer:PL.d.ich},p)); };
  setTimeout(()=>{ const i=M.querySelector('#prioS'); i&&i.focus(); },60); }
function prioNeuZeichnen(){ try{ if(svCurTab()==='planung')plRender(); else if(svCurTab()==='home')prioHeute(); }catch(e){} }
// Kurzer Hinweis unten mit einer Aktion (Rückgängig, Öffnen)
function prioRueck(text,knopf,fn){
  const alt=document.getElementById('prioUndo'); if(alt)alt.remove();
  const d=document.createElement('div'); d.id='prioUndo'; d.className='pl-undo prio-undo'; d.setAttribute('role','status');
  d.innerHTML=`<span>${prioE(text)}</span>${knopf?`<button type="button">${prioE(knopf)}</button>`:''}`; document.body.appendChild(d);
  const t=setTimeout(()=>d.remove(),7000);
  const b=d.querySelector('button'); if(b)b.onclick=()=>{ clearTimeout(t); d.remove(); fn&&fn(); }; }

/* ---------- Abhaken (mit Rückgängig und nächstem Termin bei Wiederholung) ---------- */
async function prioAbhaken(id,b){
  const a=plAuf().find(x=>x.id===id); if(!a)return; const ziel=a.status==='erledigt'?'offen':'erledigt'; if(b)b.disabled=true;
  try{ const n=await ogRpc('plan_aufgabe_speichern',{p:{id:a.id,status:ziel}}); const folge=n.folge; delete n.folge; plErsetzen('aufgaben',n);
    if(folge)plErsetzen('aufgaben',folge);
    try{ navigator.vibrate&&navigator.vibrate(12); }catch(x){}
    prioNeuZeichnen();
    if(ziel==='erledigt')prioRueck(folge?'Erledigt. Nächster Termin: '+prioDatum(folge.faellig):'Erledigt: „'+String(a.titel).slice(0,40)+'“','Rückgängig',async()=>{
      try{ plErsetzen('aufgaben',await ogRpc('plan_aufgabe_speichern',{p:{id:a.id,status:a.status}}));
        if(folge){ await ogRpc('plan_papierkorb',{p_art:'aufgabe',p_id:folge.id,p_zurueck:false}); PL.d.aufgaben=PL.d.aufgaben.filter(x=>x.id!==folge.id); }
        prioNeuZeichnen(); }catch(e){ kToast('⚠️ '+e.message); } });
    else kToast('Wieder offen'); }
  catch(x){ if(b)b.disabled=false; kToast('⚠️ '+x.message); } }

/* ---------- Karte ---------- */
function prioKarte(a,opt={}){
  const s=prioStufe(a), t=plTage(a.faellig), erl=a.status==='erledigt', ueber=!erl&&a.faellig&&t<0, h=plHeute();
  const m=[];
  if(s<=2&&!erl)m.push(`<span class="prio-st s${s}">${PRIO_ST[s]}</span>`);
  if(s===4&&!erl)m.push(`<span class="prio-st s4">Irgendwann</span>`);
  if(erl)m.push(`<span>Erledigt ${prioE(a.erledigt_am?prioDatum(plIso(new Date(a.erledigt_am))):'')}${a.erledigt_von?' von '+prioE(a.erledigt_von):''}</span>`);
  else if(a.faellig)m.push(`<span class="prio-f${ueber?' rot':t===0?' heute':''}">${SVI('cal')}${prioE(prioWann(a))}</span>`);
  if(!erl&&a.status==='wartet')m.push(`<span class="prio-w">Wartet auf ${prioE(a.wartet_auf||'Rückmeldung')}${a.nachfassen?', nachfassen '+prioE(a.nachfassen<=h?'heute':prioDatum(a.nachfassen)):''}</span>`);
  if(!erl&&a.wiedervorlage&&a.wiedervorlage<=h)m.push('<span class="prio-w">Wiedervorlage heute</span>');
  else if(!erl&&a.wiedervorlage)m.push(`<span>Wiedervorlage ${prioE(prioDatum(a.wiedervorlage))}</span>`);
  if(a.wiederholung)m.push(`<span>${prioE(PRIO_WDH[a.wiederholung]||'')}</span>`);
  if(opt.bereich!==false&&PL_B[a.bereich])m.push(`<span>${prioE(PL_B[a.bereich].t)}</span>`);
  const nm=prioNamen(a); if(nm.length&&!(opt.ohneIch&&nm.length===1&&a.wer===prioIch()))m.push(`<span>${prioE(nm.join(', '))}</span>`);
  else if(!nm.length&&!erl)m.push('<span class="prio-w">Noch niemand zuständig</span>');
  if(a.sicht&&a.sicht!=='bereich')m.push(`<span>${a.sicht==='privat'?'Privat':'Nur Vorstand'}</span>`);
  if(a.eskaliert_am&&ueber)m.push('<span>An den Vorstand gemeldet</span>');
  return `<div class="prio-k s${s}${ueber?' ueber':''}${erl?' erl':''}" data-prio="${prioE(a.id)}">
    <button type="button" class="prio-chk" data-priochk="${prioE(a.id)}" aria-label="${erl?'Wieder öffnen':'Erledigt'}: ${prioE(a.titel)}"><i>${erl?SVI('check'):''}</i></button>
    <button type="button" class="prio-kb" data-prioa="${prioE(a.id)}"><span class="prio-kt">${prioE(a.titel)}</span><span class="prio-km">${m.join('')}</span></button>
    ${opt.ordnen?`<span class="prio-ord"><button type="button" data-prioup="${prioE(a.id)}" aria-label="Nach oben: ${prioE(a.titel)}">${SVI('chev')}</button><button type="button" data-priodn="${prioE(a.id)}" aria-label="Nach unten: ${prioE(a.titel)}">${SVI('chev')}</button></span>`:''}</div>`; }
function prioBinden(R){
  R.querySelectorAll('[data-prioa]').forEach(b=>b.onclick=()=>plAufgabeOeffnen(b.dataset.prioa));
  R.querySelectorAll('[data-priochk]').forEach(b=>b.onclick=e=>{ e.stopPropagation(); prioAbhaken(b.dataset.priochk,b); }); }
function prioGruppe(titel,L,opt={}){ if(!L.length)return '';
  const inner=L.map(a=>prioKarte(a,opt)).join('');
  if(opt.zu)return `<details class="prio-gr prio-zu"${opt.id?` id="${opt.id}"`:''}><summary><span>${prioE(titel)}</span><i>${L.length}</i></summary>${opt.hinweis?`<p class="prio-hin">${prioE(opt.hinweis)}</p>`:''}${inner}</details>`;
  return `<section class="prio-gr${opt.cls?' '+opt.cls:''}"${opt.id?` id="${opt.id}"`:''}><h3><span>${prioE(titel)}</span><i>${L.length}</i></h3>${opt.hinweis?`<p class="prio-hin">${prioE(opt.hinweis)}</p>`:''}${inner}</section>`; }

/* ---------- Seite „Fokus“ (vorher „Meine“) ---------- */
function prioSeite(R){
  if(!PL.d){ R.innerHTML=''; return; }
  const seg=[['fokus','Fokus'],['alle','Alle'],['woche','Woche']];
  R.innerHTML=`<div class="prio">
    <div class="prio-kopf"><div class="prio-seg" role="tablist" aria-label="Ansicht">${seg.map(([k,l])=>`<button type="button" role="tab" data-priov="${k}" aria-selected="${PRIO.sicht===k}" class="${PRIO.sicht===k?'on':''}">${l}</button>`).join('')}</div>
      <button type="button" class="prio-ib" id="prioEinstB" aria-label="Erinnerungen und Kalender">${SVI('bell')}</button></div>
    <div id="prioInhalt"></div></div>`;
  R.querySelectorAll('[data-priov]').forEach(b=>b.onclick=()=>{ PRIO.sicht=b.dataset.priov; PRIO.ordnen=false; plRender(); });
  R.querySelector('#prioEinstB').onclick=prioEinst;
  const I=R.querySelector('#prioInhalt');
  if(PRIO.sicht==='alle')prioAlle(I); else if(PRIO.sicht==='woche')prioWoche(I); else prioFokus(I);
}
function prioFokus(R){
  const h=plHeute(), O=plAuf().filter(plOffen), M=O.filter(prioMein);
  const ueber=prioNachDatum(M.filter(a=>a.faellig&&a.faellig<h));
  const heute=prioNachDatum(M.filter(a=>a.faellig===h));
  const dran=prioSortiert(M.filter(a=>!(a.faellig&&a.faellig<=h)&&prioHeuteDran(a)));
  const woche=prioNachDatum(M.filter(a=>a.faellig>h&&plTage(a.faellig)<=7&&!dran.includes(a)));
  const wichtig=prioSortiert(M.filter(a=>!a.faellig&&prioStufe(a)<=2&&a.status!=='wartet'&&!dran.includes(a)));
  const gezeigt=new Set([...ueber,...heute,...dran,...woche,...wichtig]);
  const wartet=prioNachDatum(M.filter(a=>a.status==='wartet'&&!gezeigt.has(a))); wartet.forEach(a=>gezeigt.add(a));
  const spaeter=prioNachDatum(M.filter(a=>a.faellig&&plTage(a.faellig)>7&&!gezeigt.has(a)));
  const ohne=prioSortiert(M.filter(a=>!a.faellig&&!gezeigt.has(a)&&prioStufe(a)===3));
  const irgend=prioSortiert(M.filter(a=>!a.faellig&&!gezeigt.has(a)&&prioStufe(a)===4));
  const ich=PL.d.ich, vergeben=prioNachDatum(O.filter(a=>a.von_id===ich&&!prioMein(a)&&(a.wer||a.wer_text||(a.mit||[]).length)));
  const ungek=prioSortiert(O.filter(a=>prioUngeklaert(a)&&a.bearbeiten!==false));
  const teamUeber=PL.d.vorstand?prioNachDatum(O.filter(a=>!prioMein(a)&&a.faellig&&plTage(a.faellig)<=-3)):[];
  const proj=plPro().filter(p=>p.verantwortlich===ich&&!['fertig','verworfen'].includes(p.status));
  const n7=M.filter(a=>a.faellig&&a.faellig>=h&&plTage(a.faellig)<=7).length;
  const satz=!M.length?'Bei dir ist nichts offen.':[ueber.length?ueber.length+' überfällig':'',heute.length?heute.length+' heute':'',n7-heute.length>0?(n7-heute.length)+' in den nächsten sieben Tagen':''].filter(Boolean).join(', ')||'Heute ist bei dir nichts fällig.';
  R.innerHTML=`<div class="prio-titel"><h2>Hallo ${prioE(String(PL.d.ich_name||'').split(' ')[0])}</h2><p>${prioE(satz.charAt(0).toUpperCase()+satz.slice(1))}${satz.endsWith('.')?'':'.'}</p></div>
    ${prioQuickHtml('prioQ',{})}
    <div class="prio-liste">
      ${prioGruppe('Überfällig',ueber,{cls:'rot',ohneIch:true})}
      ${prioGruppe('Heute',heute,{ohneIch:true})}
      ${prioGruppe('Heute draufschauen',dran,{ohneIch:true,hinweis:'Wiedervorlage oder Nachfassen ist heute dran.'})}
      ${prioGruppe('Diese Woche',woche,{ohneIch:true})}
      ${prioGruppe('Wichtig, ohne Datum',wichtig,{ohneIch:true})}
      ${prioGruppe('Wartet auf',wartet,{ohneIch:true})}
      ${!ueber.length&&!heute.length&&!dran.length&&!woche.length&&!wichtig.length&&!wartet.length?`<div class="card prio-leer"><b>${M.length?'Für die nächsten Tage ist alles im Griff.':'Nichts offen.'}</b><p>${M.length?'Weiter unten steht, was später kommt.':'Neue Aufgaben schreibst du oben ins Feld.'}</p></div>`:''}
      ${prioGruppe('Später',spaeter,{zu:true,ohneIch:true})}
      ${prioGruppe('Ohne Datum',ohne,{zu:true,ohneIch:true})}
      ${prioGruppe('Irgendwann',irgend,{zu:true,ohneIch:true})}
      ${teamUeber.length?prioGruppe('Im Team seit über drei Tagen überfällig',teamUeber,{zu:true,id:'prioTeamUe',hinweis:'Das bekommt der Vorstand auch als Mitteilung. Am besten kurz nachfragen oder neu planen.'}):''}
      ${prioGruppe('Ungeklärt',ungek,{zu:true,id:'prioUngek',hinweis:'Ohne Datum und ohne Zuständige. Gib jeder Aufgabe ein Datum oder eine Person, damit nichts liegen bleibt.'})}
      ${prioGruppe('Von dir vergeben, noch offen',vergeben,{zu:true})}
    </div>
    ${proj.length?`<h3 class="pl-h3">Deine Projekte</h3><div class="pl-pgrid">${proj.map(plProjektKarte).join('')}</div>`:''}`;
  prioBinden(R); plProjektKartenBinden(R);
  prioQuickBinden(R,'prioQ',{wer:ich},()=>plRender());
}

/* ---------- Alle, nach Stufe ---------- */
function prioAlle(R){
  const O=plAuf().filter(plOffen), h=plHeute();
  const F={alle:['Alle offen',O],meine:['Meine',O.filter(prioMein)],ungeklaert:['Ungeklärt',O.filter(prioUngeklaert)],ueber:['Überfällig',O.filter(a=>a.faellig&&a.faellig<h)],wartet:['Wartet auf',O.filter(a=>a.status==='wartet')]};
  if(!F[PRIO.filter])PRIO.filter='alle';
  const A=F[PRIO.filter][1];
  R.innerHTML=`<div class="prio-filter" role="group" aria-label="Filter">${Object.entries(F).map(([k,[l,L]])=>`<button type="button" data-priof="${k}" aria-pressed="${PRIO.filter===k}" class="${PRIO.filter===k?'on':''}">${l}<i>${L.length}</i></button>`).join('')}</div>
    <div class="prio-zeile"><p>${A.length?'Nach Stufe, darin in deiner Reihenfolge.':'Hier ist gerade nichts.'}</p><button type="button" class="btn ghost sm" id="prioOrdnen" aria-pressed="${PRIO.ordnen}">${PRIO.ordnen?'Fertig':'Reihenfolge ändern'}</button></div>
    <div class="prio-liste">${[1,2,3,4].map(s=>{ const L=prioSortiert(A.filter(a=>prioStufe(a)===s)); return L.length?`<section class="prio-gr" data-priogr="${s}"><h3><span class="prio-st s${s}">${PRIO_ST[s]}</span><i>${L.length}</i></h3>${L.map(a=>prioKarte(a,{ordnen:PRIO.ordnen&&a.bearbeiten!==false})).join('')}</section>`:''; }).join('')}</div>`;
  R.querySelectorAll('[data-priof]').forEach(b=>b.onclick=()=>{ PRIO.filter=b.dataset.priof; plRender(); });
  R.querySelector('#prioOrdnen').onclick=()=>{ PRIO.ordnen=!PRIO.ordnen; plRender(); };
  prioBinden(R);
  const schiebe=async(id,d)=>{ const a=plAuf().find(x=>x.id===id); if(!a)return; const s=prioStufe(a);
    const L=prioSortiert(F[PRIO.filter][1].filter(x=>prioStufe(x)===s&&x.bearbeiten!==false)); const i=L.indexOf(a), j=i+d; if(i<0||j<0||j>=L.length)return;
    [L[i],L[j]]=[L[j],L[i]]; L.forEach((x,k)=>{ x.sort=(k+1)*10; }); plRender();
    try{ await ogRpc('plan_reihenfolge',{p_ids:L.map(x=>x.id)}); }catch(e){ kToast('⚠️ '+e.message); await plLaden(); plRender(); } };
  R.querySelectorAll('[data-prioup]').forEach(b=>b.onclick=()=>schiebe(b.dataset.prioup,-1));
  R.querySelectorAll('[data-priodn]').forEach(b=>b.onclick=()=>schiebe(b.dataset.priodn,1));
}

/* ---------- Woche: Rückblick und Verlauf ---------- */
function prioWoche(R){
  const h=plHeute(), vor7=Date.now()-7*864e5, Z=a=>!PRIO.wMeine||prioMein(a)||a.erledigt_von===PL.d.ich_name;
  const A=plAuf().filter(Z), erl=A.filter(a=>a.status==='erledigt'&&a.erledigt_am&&new Date(a.erledigt_am)>=vor7).sort((x,y)=>String(y.erledigt_am).localeCompare(String(x.erledigt_am)));
  const neu=A.filter(a=>a.am&&new Date(a.am)>=vor7&&a.status!=='idee'), offen=A.filter(plOffen), ueber=offen.filter(a=>a.faellig&&a.faellig<h);
  const naechste=prioNachDatum(offen.filter(a=>a.faellig&&a.faellig>=h&&plTage(a.faellig)<=7));
  const von=new Date(vor7).toLocaleDateString('de-DE',{day:'2-digit',month:'2-digit'}), bis=new Date().toLocaleDateString('de-DE',{day:'2-digit',month:'2-digit'});
  R.innerHTML=`<div class="prio-zeile"><p>Die letzten sieben Tage, ${von} bis ${bis}</p>
      <button type="button" class="btn ghost sm" id="prioWm" aria-pressed="${PRIO.wMeine}">${PRIO.wMeine?'Ganzes Team':'Nur meine'}</button></div>
    <div class="prio-zahlen">${[['Erledigt',erl.length],['Neu',neu.length],['Offen',offen.length],['Überfällig',ueber.length]].map(([l,n])=>`<div class="${l==='Überfällig'&&n?'rot':''}"><b>${n}</b><span>${l}</span></div>`).join('')}</div>
    <div class="prio-liste">
      ${prioGruppe('Erledigt',erl,{})||'<div class="card prio-leer"><b>Diese Woche ist noch nichts abgehakt.</b></div>'}
      ${prioGruppe('Neu dazugekommen',prioSortiert(neu.filter(plOffen)),{zu:true})}
      ${prioGruppe('Überfällig',prioNachDatum(ueber),{zu:true})}
      ${prioGruppe('In den nächsten sieben Tagen fällig',naechste,{zu:true})}
    </div>
    <div class="btnrow"><button type="button" class="btn ghost" id="prioWtext">${SVI('copy')} Als Text kopieren</button></div>
    <details class="prio-gr prio-zu" id="prioVerlauf"${PRIO.archiv?' open':''}><summary><span>Verlauf: alles Erledigte</span><i>${PRIO.archiv?PRIO.archiv.length:'…'}</i></summary>
      <p class="prio-hin">Erledigtes bleibt hier stehen. Gelöschtes liegt 60 Tage im Papierkorb.</p>
      <div id="prioArchiv">${PRIO.archiv?PRIO.archiv.map(a=>prioKarte(a,{})).join('')||'<p class="prio-hin">Noch nichts erledigt.</p>':''}</div>
      <div class="btnrow">${PRIO.archiv&&!PRIO.archivEnde?'<button type="button" class="btn ghost" id="prioMehr">Ältere laden</button>':''}<button type="button" class="btn ghost" id="prioKorb">${SVI('trash')} Papierkorb</button></div></details>`;
  prioBinden(R);
  R.querySelector('#prioWm').onclick=()=>{ PRIO.wMeine=!PRIO.wMeine; plRender(); };
  R.querySelector('#prioKorb').onclick=plPapierkorb;
  R.querySelector('#prioWtext').onclick=()=>{ const z=a=>'• '+a.titel+(prioNamen(a).length?' ('+prioNamen(a).join(', ')+')':'');
    plKopieren(`Wochenrückblick ${von} bis ${bis}\n\nErledigt: ${erl.length}, neu: ${neu.length}, offen: ${offen.length}, überfällig: ${ueber.length}`
      +(erl.length?'\n\nErledigt\n'+erl.map(z).join('\n'):'')+(ueber.length?'\n\nÜberfällig\n'+prioNachDatum(ueber).map(a=>z(a)+', fällig war '+prioDatum(a.faellig)).join('\n'):'')
      +(naechste.length?'\n\nDiese Woche fällig\n'+naechste.map(a=>z(a)+', '+prioWann(a)).join('\n'):'')); };
  const lade=async()=>{ if(PRIO.archivLaedt)return; PRIO.archivLaedt=true;
    try{ const vor=PRIO.archiv&&PRIO.archiv.length?PRIO.archiv[PRIO.archiv.length-1].erledigt_am:null; const L=await ogRpc('plan_erledigt',{p_vor:vor,p_anzahl:50});
      PRIO.archiv=(PRIO.archiv||[]).concat(L); PRIO.archivEnde=L.length<50; }catch(e){ kToast('⚠️ '+e.message); } finally{ PRIO.archivLaedt=false; }
    if(svCurTab()==='planung'&&PRIO.sicht==='woche')plRender(); };
  const d=R.querySelector('#prioVerlauf'); d.addEventListener('toggle',()=>{ if(d.open&&!PRIO.archiv)lade(); });
  const m=R.querySelector('#prioMehr'); if(m)m.onclick=lade;
}

/* ---------- Aufgabe öffnen und bearbeiten (ersetzt das Formular aus svm44) ---------- */
function prioMitFeld(mit,wer){ const L=(PL.d.leute||[]), S=(mit||[]).filter(id=>id!==wer);
  return `<div class="field w"><label for="prioMitS">Weitere Zuständige</label><div class="prio-mit" id="prioMit">${S.map(id=>{ const p=L.find(l=>l.id===id); return `<button type="button" class="prio-chip an" data-priomx="${prioE(id)}" aria-label="${prioE((p?p.name:'?')+' entfernen')}">${prioE(p?p.name:'?')} ${SVI('x')}</button>`; }).join('')}</div>
    <select id="prioMitS"><option value="">Person dazunehmen …</option>${L.filter(l=>!S.includes(l.id)&&l.id!==wer).map(l=>`<option value="${prioE(l.id)}">${prioE(l.name)}${l.id===PL.d.ich?' (ich)':''}</option>`).join('')}</select></div>`; }
plAufgabeOeffnen=function(id,vor={}){
  if(!PL.d)return;
  const a=id?plAuf().find(x=>x.id===id):null; if(id&&!a){ kToast('Diese Aufgabe gibt es nicht mehr oder du siehst sie nicht.'); return; }
  const x=a||Object.assign({titel:'',status:'offen',prio:2,stufe:3,bereich:vor.bereich||prioStdBereich(),projekt:vor.projekt||null,wer:vor.wer||null,sitzung:!!vor.sitzung,mit:[],sicht:'bereich'},vor);
  if(!x.stufe)x.stufe=prioStufe(x);
  const voll=!a||a.bearbeiten!==false, h=plHeute();
  const projekte=plPro().filter(p=>!['fertig','verworfen'].includes(p.status)||p.id===x.projekt);
  // Geschützt (nur Vorstand, privat): Sichtbarkeit, Zuständige und Löschen nur für Ersteller und Vorstand; privat stellen nur der Ersteller
  const eigen=!a||a.von_id===PL.d.ich, hoheit=eigen||!!PL.d.vorstand, geschuetzt=!!a&&['vorstand','privat'].includes(a.sicht)&&!hoheit;
  const sichten=Object.keys(PRIO_SICHT).filter(k=>(k!=='vorstand'||PL.d.vorstand||x.sicht==='vorstand')&&(k!=='privat'||eigen||x.sicht==='privat'));
  const M=svModal(`<div class="og-form pl-form prio-form"><h2>${a?'Aufgabe':'Neue Aufgabe'}${a?`<small>${prioE(prioBereichTitel(a.bereich))}</small>`:''}</h2>
    ${voll?`<div class="field w"><label for="plT">Was ist zu tun?</label><input id="plT" maxlength="200" value="${prioE(x.titel)}" placeholder="z. B. Angebot für Getränke einholen"></div>
    <div class="field w"><span class="prio-lbl" id="prioStL">Priorität</span><div class="prio-stufen" role="radiogroup" aria-labelledby="prioStL">${[1,2,3,4].map(s=>`<button type="button" role="radio" aria-checked="${x.stufe===s}" data-priost="${s}" class="s${s}${x.stufe===s?' on':''}">${PRIO_ST[s]}</button>`).join('')}</div></div>`
    :`<p class="prio-nur">${prioE(x.titel)}</p><p class="note">Du bist zuständig. Den Stand pflegst du hier, alles andere der Bereich.</p>`}
    <div class="pl-st prio-status">${Object.keys(PL_ST).filter(s=>s!=='idee'||x.status==='idee'||voll).map(s=>`<button type="button" data-plst="${s}" class="s-${s} ${x.status===s?'on':''}" aria-pressed="${x.status===s}">${PL_ST[s]}</button>`).join('')}</div>
    <div class="pl-fg" id="plWaF" ${x.status==='wartet'?'':'hidden'}><div class="field"><label for="plWa">Worauf wird gewartet?</label><input id="plWa" maxlength="120" value="${prioE(x.wartet_auf||'')}" placeholder="z. B. Rückmeldung der Gemeinde"></div>
      <div class="field"><label for="prioNf">Nachfassen am</label><input id="prioNf" type="date" value="${prioE(x.nachfassen||'')}"></div></div>
    ${voll?`<div class="pl-fg">
      <div class="field"><label for="plF">Fällig am</label><input id="plF" type="date" value="${prioE(x.faellig||'')}">
        <div class="prio-schnell">${[['Heute',0],['Morgen',1],['In einer Woche',7]].map(([l,n])=>`<button type="button" data-plfd="${n}">${l}</button>`).join('')}<button type="button" data-plfd="x">Ohne</button></div></div>
      <div class="field"><label for="prioZ">Uhrzeit (optional)</label><input id="prioZ" type="time" value="${prioE(x.zeit||'')}"></div>
      <div class="field"><label for="prioWv">Erinnere mich am</label><input id="prioWv" type="date" value="${prioE(x.wiedervorlage||'')}"></div>
      <div class="field"><label for="prioWdh">Wiederholen</label><select id="prioWdh"><option value="">Nicht wiederholen</option>${Object.entries(PRIO_WDH).map(([k,l])=>`<option value="${k}"${x.wiederholung===k?' selected':''}>${l}</option>`).join('')}</select></div>
      ${geschuetzt?`<div class="field w"><span class="prio-lbl">Zuständig</span><p class="prio-nur" style="font-size:15px">${prioE(prioNamen(x).join(', ')||'Noch niemand')}</p><p class="note">Zuständige und Sichtbarkeit ändert hier nur, wer die Aufgabe angelegt hat, oder der Vorstand.</p></div>`
        :`${plPersonFeld('plWer',x.wer,x.wer_text,'Wer macht es?')}
      ${prioMitFeld(x.mit,x.wer)}`}
      <div class="field"><label for="plPj">Projekt</label><select id="plPj"><option value="">Kein Projekt</option>${projekte.map(p=>`<option value="${prioE(p.id)}"${p.id===x.projekt?' selected':''}>${prioE(p.titel)}</option>`).join('')}</select></div>
      ${plBereichFeld('plB',x.bereich,!!x.projekt)}
      <div class="field w"><label for="prioSi">Wer sieht die Aufgabe?</label><select id="prioSi"${geschuetzt||(x.sicht==='vorstand'&&!PL.d.vorstand)?' disabled':''}>${sichten.map(k=>`<option value="${k}"${(x.sicht||'bereich')===k?' selected':''}>${PRIO_SICHT[k]}</option>`).join('')}</select></div></div>
    <div class="pl-sw"><label><input type="checkbox" id="plMs"${x.meilenstein?' checked':''}> Meilenstein</label><label><input type="checkbox" id="plSi"${x.sitzung?' checked':''}> Für die nächste Runde</label></div>
    <div class="field w"><label for="plN">Notiz</label><textarea id="plN" rows="3" maxlength="4000" placeholder="Details, Links, Ansprechpartner">${prioE(x.notiz||'')}</textarea></div>`
    :`<div class="pl-fg"><div class="field"><label for="prioWv">Erinnere mich am</label><input id="prioWv" type="date" value="${prioE(x.wiedervorlage||'')}"></div></div>${x.notiz?`<p class="note">${prioE(x.notiz)}</p>`:''}`}
    <div class="btnrow sbact"><button class="btn" type="button" id="plSave">${a?'Speichern':'Anlegen'}</button>${a&&voll&&!geschuetzt?`<button class="btn ghost" type="button" id="plDel">${SVI('trash')} Papierkorb</button>`:''}</div>
    ${a?`<p class="note small pl-meta">Angelegt von ${prioE(a.von||'?')} ${prioE(plZeit(a.am))}${a.erledigt_am?`, erledigt von ${prioE(a.erledigt_von||'?')} ${prioE(plZeit(a.erledigt_am))}`:''}${a.serie?'. Gehört zu einer wiederkehrenden Reihe.':''}</p>${plKommHtml('a',a.id)}`:''}</div>`);
  let st=x.status, stufe=x.stufe, mit=(x.mit||[]).slice();
  M.querySelectorAll('[data-plst]').forEach(b=>b.onclick=()=>{ st=b.dataset.plst; M.querySelectorAll('[data-plst]').forEach(y=>{ y.classList.toggle('on',y===b); y.setAttribute('aria-pressed',y===b); }); M.querySelector('#plWaF').hidden=st!=='wartet'; });
  M.querySelectorAll('[data-priost]').forEach(b=>b.onclick=()=>{ stufe=+b.dataset.priost; M.querySelectorAll('[data-priost]').forEach(y=>{ y.classList.toggle('on',y===b); y.setAttribute('aria-checked',y===b); }); });
  M.querySelectorAll('[data-plfd]').forEach(b=>b.onclick=()=>{ M.querySelector('#plF').value=b.dataset.plfd==='x'?'':plPlus(h,+b.dataset.plfd); });
  if(voll){
    M.querySelector('#plPj').onchange=e=>{ const p=plProj(e.target.value), s=M.querySelector('#plB'); s.disabled=!!p; if(p)s.value=p.bereich; };
    if(!geschuetzt)plPersonBinden(M,'plWer');
    const mitNeu=()=>{ const box=M.querySelector('#prioMit').closest('.field'), w=M.querySelector('#plWer').value; const n=document.createElement('div'); n.innerHTML=prioMitFeld(mit,w); box.replaceWith(n.firstElementChild); mitBinden(); };
    const mitBinden=()=>{ M.querySelector('#prioMitS').onchange=e=>{ if(e.target.value&&!mit.includes(e.target.value)&&mit.length<8){ mit.push(e.target.value); mitNeu(); } };
      M.querySelectorAll('[data-priomx]').forEach(b=>b.onclick=()=>{ mit=mit.filter(i=>i!==b.dataset.priomx); mitNeu(); }); };
    if(!geschuetzt)mitBinden();
  }
  if(!a)setTimeout(()=>{ const t=M.querySelector('#plT'); t&&t.focus(); },60);
  M.querySelector('#plSave').onclick=async()=>{ const b=M.querySelector('#plSave'); if(b.disabled)return;
    let p;
    if(voll){ const per=geschuetzt?{id:x.wer||'',text:x.wer_text||''}:plPersonLesen(M,'plWer');
      p={titel:M.querySelector('#plT').value.trim(),status:st,stufe,wartet_auf:M.querySelector('#plWa').value,nachfassen:st==='wartet'?M.querySelector('#prioNf').value:'',wer:per.id,wer_text:per.text,
        mit:mit.filter(i=>i!==per.id),faellig:M.querySelector('#plF').value,zeit:M.querySelector('#plF').value?M.querySelector('#prioZ').value:'',wiedervorlage:M.querySelector('#prioWv').value,
        wiederholung:M.querySelector('#prioWdh').value,sicht:M.querySelector('#prioSi').value,projekt:M.querySelector('#plPj').value,bereich:M.querySelector('#plB').value,
        meilenstein:M.querySelector('#plMs').checked,sitzung:M.querySelector('#plSi').checked,notiz:M.querySelector('#plN').value};
      if(geschuetzt){ delete p.wer; delete p.wer_text; delete p.mit; delete p.sicht; }
      if(!p.titel){ kToast('Bitte eintragen, was zu tun ist'); M.querySelector('#plT').focus(); return; }
      if(p.zeit&&!p.faellig){ kToast('Eine Uhrzeit braucht ein Datum'); return; } }
    else p={status:st,wartet_auf:M.querySelector('#plWa').value,nachfassen:st==='wartet'?M.querySelector('#prioNf').value:'',wiedervorlage:M.querySelector('#prioWv').value};
    if(a)p.id=a.id; b.disabled=true;
    try{ const n=await ogRpc('plan_aufgabe_speichern',{p}); const folge=n.folge; delete n.folge; plErsetzen('aufgaben',n); if(folge)plErsetzen('aufgaben',folge);
      closeOverlay(); kToast((a?'Gespeichert':'Angelegt')+(folge?'. Nächster Termin: '+prioDatum(folge.faellig):'')); prioNeuZeichnen(); }
    catch(e){ b.disabled=false; kToast('⚠️ '+e.message); } };
  const d=M.querySelector('#plDel'); if(d)d.onclick=()=>plWeg('aufgabe',a.id,a.titel);
  if(a)plKommBinden(M,'a',a.id,()=>plAufgabeOeffnen(a.id));
};

/* ---------- Einstellungen: Erinnerungen und Kalender ---------- */
async function prioEinst(){
  const E=(PL.d&&PL.d.einst)||{tages:true,eskalation:true};
  const M=svModal(`<div class="og-form prio-blatt"><h2>Erinnerungen und Kalender</h2>
    <p class="note">So geht dir nichts durch: jeden Morgen eine Übersicht, Erinnerungen am Vortag und am Fälligkeitstag, montags der Wochenrückblick.</p>
    <label class="prio-sw"><span><b>Tagesübersicht am Morgen</b><small>Eine Mitteilung um 7 Uhr mit allem, was überfällig, heute fällig oder wieder dran ist. Ausgeschaltet kommt jede Aufgabe einzeln.</small></span><input type="checkbox" id="prioEt"${E.tages!==false?' checked':''}></label>
    ${PL.d&&PL.d.vorstand?`<label class="prio-sw"><span><b>Überfälliges im Team melden</b><small>Ist eine Aufgabe seit drei Tagen überfällig, bekommst du als Vorstand einmal Bescheid.</small></span><input type="checkbox" id="prioEe"${E.eskalation!==false?' checked':''}></label>`:''}
    <div class="prio-ein" id="prioPush"><p class="note">Mitteilungen auf diesem Gerät werden geprüft …</p></div>
    <h3 class="prio-h">Fällige Aufgaben im Kalender</h3>
    <p class="note">Deine offenen Aufgaben mit Datum als eigener Kalender im Handy. Aktualisiert sich von selbst, nur du siehst ihn.</p>
    <div class="btnrow prio-abo"><button type="button" class="btn ghost" id="prioAboA">Apple Kalender</button><button type="button" class="btn ghost" id="prioAboG">Google Kalender</button><button type="button" class="btn ghost" id="prioAboO">Outlook</button><button type="button" class="btn ghost" id="prioAboL">${SVI('copy')} Link kopieren</button></div></div>`);
  const set=async(k,el)=>{ el.disabled=true; try{ const r=await ogRpc('plan_einstellung',{p_key:k,p_an:el.checked}); if(PL.d)PL.d.einst=r; kToast('Gespeichert'); }catch(e){ el.checked=!el.checked; kToast('⚠️ '+e.message); } el.disabled=false; };
  M.querySelector('#prioEt').onchange=e=>set('tages',e.target); const ee=M.querySelector('#prioEe'); if(ee)ee.onchange=e=>set('eskalation',e.target);
  let url=null; const holen=async()=>{ if(url)return url; try{ const t=await ogRpc('plan_abo_link'); url=kalFeedUrl('t='+t); return url; }catch(e){ kToast('⚠️ '+e.message); return null; } };
  holen();
  const auf=(fn)=>async()=>{ const u=url||await holen(); if(u)fn(u); };
  M.querySelector('#prioAboA').onclick=auf(u=>{ location.href=u.replace(/^https?:/,'webcal:'); });
  M.querySelector('#prioAboG').onclick=auf(u=>window.open('https://calendar.google.com/calendar/r?cid='+encodeURIComponent(u.replace(/^https?:/,'webcal:')),'_blank','noopener'));
  M.querySelector('#prioAboO').onclick=auf(u=>window.open('https://outlook.live.com/calendar/0/addfromweb?url='+encodeURIComponent(u)+'&name='+encodeURIComponent('SV/BSC Aufgaben'),'_blank','noopener'));
  M.querySelector('#prioAboL').onclick=auf(u=>plKopieren(u));
  const P=M.querySelector('#prioPush');
  try{ const s=typeof svPushState==='function'?await svPushState():'unsupported';
    P.innerHTML=s==='on'?'<p class="note">Mitteilungen sind auf diesem Gerät an.</p>':s==='unsupported'?'<p class="note">Dieser Browser kann keine Mitteilungen empfangen. Die Übersicht steht trotzdem jeden Tag auf Heute.</p>'
      :`<p class="note">Auf diesem Gerät sind Mitteilungen noch aus.</p><div class="btnrow"><button type="button" class="btn" id="prioPushAn">${SVI('bell')} Mitteilungen einschalten</button></div>`;
    const an=P.querySelector('#prioPushAn'); if(an)an.onclick=async()=>{ an.disabled=true; try{ await svPushOn(); }catch(e){ kToast('⚠️ '+e.message); } an.disabled=false; };
  }catch(e){ P.innerHTML=''; }
}

/* ---------- Heute: „Neue Aufgabe“ mit einem Tipp und der Fokus des Tages ---------- */
function prioHeuteKopf(){
  const el=document.getElementById('svHeute'); if(!el)return; const h2=el.querySelector('.ht-h'); if(!h2)return;
  const da=plDarf(); let k=el.querySelector('.prio-htk');
  if(!da){ if(k){ k.before(h2); k.remove(); } return; }
  if(!k){ k=document.createElement('div'); k.className='prio-htk'; h2.before(k); k.appendChild(h2);
    const b=document.createElement('button'); b.type='button'; b.className='prio-plus'; b.id='prioHtPlus'; b.setAttribute('aria-label','Neue Aufgabe'); b.innerHTML=SVI('plus')+'<span>Aufgabe</span>';
    b.onclick=()=>prioSchnell(); k.appendChild(b); } }
// Vorstand (04.11.): die To-dos als Kurzansicht ganz oben, gleich unter der Begrüßung, damit man sofort sieht, was bis wann zu tun ist
function prioHeutePlatz(){
  const c=document.getElementById('prioHeute'), el=document.getElementById('svHeute'); if(!c||!el||!el.parentNode)return;
  if(el.previousElementSibling!==c)el.before(c); }
function prioHeute(){
  const home=document.getElementById('panel-home'), el=document.getElementById('svHeute'); let c=document.getElementById('prioHeute');
  const d=(typeof HT!=='undefined'&&HT.plan)||PL.d;
  if(!home||!el){ if(c)c.remove(); return; }
  if(!plDarf())return prioHeuteZug(el,c);
  if(!PL.d&&typeof HT!=='undefined'&&HT.plan)PL.d=HT.plan;
  if(!d){ try{ htPlanHolen(); }catch(e){} return; }
  const h=plHeute(), i=d.ich, O=(d.aufgaben||[]).filter(plOffen), M=O.filter(a=>a.wer===i||(a.mit||[]).includes(i));
  const ueber=prioNachDatum(M.filter(a=>a.faellig&&a.faellig<h)), heute=prioNachDatum(M.filter(a=>a.faellig===h)), dran=M.filter(a=>!(a.faellig&&a.faellig<=h)&&prioHeuteDran(a));
  let top=[...ueber,...heute,...dran].slice(0,3), rest=ueber.length+heute.length+dran.length-top.length;   // seit 0.99.38 drei statt vier: die Startseite bleibt kurz
  // Vorstand: die nächsten Fristen im ganzen Team (Überfälliges zuerst, dann nach Datum, Dringendes ohne Datum dazu)
  const teamSicht=!!d.vorstand, teamL=teamSicht?prioNachDatum(O.filter(a=>(a.faellig&&plTage(a.faellig)<=14)||prioStufe(a)===1||prioHeuteDran(a))):[];
  if(teamSicht){ top=teamL.slice(0,3); rest=teamL.length-top.length; }   // seit 0.99.38 drei statt fünf
  const woche=M.filter(a=>a.faellig>h&&plTage(a.faellig)<=7).length, ungek=d.vorstand?O.filter(a=>prioUngeklaert(a)&&a.bearbeiten!==false).length:0;
  const team=d.vorstand?O.filter(a=>!(a.wer===i||(a.mit||[]).includes(i))&&a.faellig&&plTage(a.faellig)<=-3).length:0;
  if(!d.vorstand&&!M.length){ if(c)c.remove(); return; }
  const ueberT=teamSicht?O.filter(a=>a.faellig&&a.faellig<h).length:ueber.length;
  if(!c){ c=document.createElement('section'); c.id='prioHeute'; c.className='prio-heute'; }
  c.setAttribute('aria-label',teamSicht?'To-dos im Team':'Dein Fokus heute');
  const zeilen=[woche?`${woche} in den nächsten sieben Tagen`:'',ungek?`${ungek} ungeklärt im Team`:'',team?`${team} im Team seit über drei Tagen überfällig`:''].filter(Boolean);
  c.innerHTML=`<div class="prio-hk"><h2>${teamSicht?'To-dos im Team':'Dein Fokus heute'}</h2>${ueberT?`<span class="prio-hz rot">${ueberT} überfällig</span>`:''}</div>
    <div class="prio-hl">${top.map(a=>prioKarte(a,teamSicht?{}:{ohneIch:true})).join('')||`<p class="prio-hin">${teamSicht?'In den nächsten zwei Wochen ist nichts fällig.':'Heute ist bei dir nichts fällig.'}</p>`}</div>
    ${zeilen.length?`<p class="prio-hin">${prioE(zeilen.join(' · '))}</p>`:''}
    <button type="button" class="prio-hm" id="prioHtAlle"><span>${rest>0?`Alle ${top.length+rest} anzeigen`:'Mehr anzeigen'}</span>${SVI('chev')}</button>`;
  c.querySelectorAll('[data-prioa]').forEach(b=>b.onclick=async()=>{ try{ await prioLaden(); }catch(e){} plAufgabeOeffnen(b.dataset.prioa); });
  c.querySelectorAll('[data-priochk]').forEach(b=>b.onclick=async e=>{ e.stopPropagation(); try{ await prioLaden(); }catch(x){} prioAbhaken(b.dataset.priochk,b); });
  c.querySelector('#prioHtAlle').onclick=()=>{ PL.b='meine'; PRIO.sicht=teamSicht?'alle':'fokus'; goTab('planung'); };
  if(!c.parentNode)el.before(c);
  prioHeutePlatz();
}

/* ---------- Ohne Recht auf die Planung: nur die eigenen zugewiesenen Aufgaben ---------- */
async function prioZugHolen(){
  if(PRIO.zugLaedt||Date.now()-(PRIO.zugAm||0)<60000)return; PRIO.zugLaedt=true;
  try{ const d=await ogRpc('plan_laden'); if(d&&d.nur_zugewiesen){ PRIO.zug=d; if(!PL.d||PL.d.nur_zugewiesen)PL.d=d; } }catch(e){}
  finally{ PRIO.zugAm=Date.now(); PRIO.zugLaedt=false; }
  if(PRIO.zug&&svCurTab()==='home')prioHeute(); }
function prioZugOffen(){ const d=PRIO.zug, i=d&&d.ich; return d?prioNachDatum((d.aufgaben||[]).filter(a=>plOffen(a)&&(a.wer===i||(a.mit||[]).includes(i)))):[]; }
function prioHeuteZug(el,c){
  try{ if(typeof SVR!=='undefined'&&SVR.loaded&&!svRole()){ if(c)c.remove(); return; } }catch(e){}
  if(!PRIO.zug){ if(c)c.remove(); prioZugHolen(); return; }
  if(!PL.d||PL.d.nur_zugewiesen)PL.d=PRIO.zug;
  const M=prioZugOffen(); if(!M.length){ if(c)c.remove(); return; }
  const h=plHeute(), ueber=M.filter(a=>a.faellig&&a.faellig<h).length, top=M.slice(0,4);
  if(!c){ c=document.createElement('section'); c.id='prioHeute'; c.className='prio-heute'; }
  c.setAttribute('aria-label','Deine Aufgaben');
  c.innerHTML=`<div class="prio-hk"><h2>Deine Aufgaben</h2>${ueber?`<span class="prio-hz rot">${ueber} überfällig</span>`:''}</div>
    <div class="prio-hl">${top.map(a=>prioKarte(a,{ohneIch:true})).join('')}</div>
    ${M.length>top.length?`<p class="prio-hin">und ${M.length-top.length} weitere</p>`:''}
    <button type="button" class="prio-hm" id="prioHtAlle"><span>Alle deine Aufgaben</span>${SVI('chev')}</button>`;
  c.querySelectorAll('[data-prioa]').forEach(b=>b.onclick=()=>plAufgabeOeffnen(b.dataset.prioa));
  c.querySelectorAll('[data-priochk]').forEach(b=>b.onclick=e=>{ e.stopPropagation(); prioAbhaken(b.dataset.priochk,b); });
  c.querySelector('#prioHtAlle').onclick=prioZugListe;
  if(!c.parentNode)el.before(c);
  prioHeutePlatz(); }
// Schlanke Liste für alle, die nur zugewiesene Aufgaben haben
function prioZugListe(){
  const M=svModal(`<div class="og-form prio-blatt"><h2>Deine Aufgaben</h2><p class="note">Diese Aufgaben hat dir jemand aus dem Team gegeben. Hier hakst du sie ab oder setzt den Stand.</p><div class="prio-liste" id="prioZugL"></div></div>`);
  const zeig=()=>{ const L=prioZugOffen(), B=M.querySelector('#prioZugL'); if(!B)return;
    B.innerHTML=L.map(a=>prioKarte(a,{ohneIch:true})).join('')||'<div class="card prio-leer"><b>Alles erledigt.</b></div>';
    B.querySelectorAll('[data-prioa]').forEach(b=>b.onclick=()=>plAufgabeOeffnen(b.dataset.prioa));
    B.querySelectorAll('[data-priochk]').forEach(b=>b.onclick=async e=>{ e.stopPropagation(); await prioAbhaken(b.dataset.priochk,b); zeig(); }); };
  zeig(); }

/* ---------- Plus-Knopf in der Planung (am Handy) ---------- */
function prioFab(){
  let b=document.getElementById('prioFab'); const da=svCurTab()==='planung'&&plDarf();
  if(!da){ if(b)b.hidden=true; return; }
  if(!b){ b=document.createElement('button'); b.type='button'; b.id='prioFab'; b.className='prio-fab'; b.setAttribute('aria-label','Neue Aufgabe'); b.innerHTML=SVI('plus');
    b.onclick=()=>prioSchnell(PL_B[PL.b]?{bereich:PL.b}:{}); document.body.appendChild(b); }
  b.hidden=false; }

/* ---------- Einhängen ---------- */
// „Meine“ wird zum Fokus (der Schlüssel bleibt „meine“, damit Mitteilungen und Links weiter passen)
plMeine=function(R){ prioSeite(R); };
plParse=prioParse;
// Board und Liste der Bereiche: nach Stufe sortieren, Dringend sichtbar markieren
plSort=function(A){ return prioSortiert(A); };
{ const _k=plKarte; plKarte=function(a,opt){ const s=prioStufe(a); let html=_k.apply(this,arguments);
    html=html.replace('class="pl-k ','class="pl-k prio-s'+s+' ');
    if(s===1&&a.status!=='erledigt')html=html.replace('<span class="pl-pr" title="Wichtig">!</span>','<span class="pl-pr prio-dr" title="Dringend">!!</span>');
    if(a.zeit&&a.faellig)html=html.replace(/(<span class="pl-f[^"]*">[^<]*)(<\/span>)/,'$1, '+a.zeit+'$2');
    return html; }; }
{ const _r=plRender; plRender=async function(){
    const f=document.activeElement&&document.activeElement.id==='prioQ'?document.activeElement.value:null;
    const r=await _r.apply(this,arguments);
    try{ const b=document.querySelector('#panel-planung [data-plb="meine"]');
      if(b&&PL.d){ const h=plHeute(), M=plAuf().filter(a=>plOffen(a)&&prioMein(a)), u=M.filter(a=>a.faellig&&a.faellig<h).length;
        b.innerHTML=`To-dos<i>${M.length}</i>${u?`<b class="pl-rot">${u}</b>`:''}`; b.setAttribute('aria-label','To-dos: '+M.length+' offen'+(u?', '+u+' überfällig':'')); }
      if(f!==null){ const q=document.getElementById('prioQ'); if(q){ q.value=f; q.focus(); q.dispatchEvent(new Event('input')); } }
      prioFab(); }catch(e){ console.warn('Fokus',e); }
    return r; }; }
{ const _gt=goTab; goTab=function(){ const r=_gt.apply(this,arguments); try{ prioFab(); }catch(e){} return r; }; }
{ const _h=htRender; htRender=function(){ const r=_h.apply(this,arguments); try{ prioHeuteKopf(); prioHeute(); }catch(e){ console.warn('Fokus heute',e); } return r; }; }
{ const _o=htOrdnen; htOrdnen=function(){ const r=_o.apply(this,arguments); try{ prioHeutePlatz(); }catch(e){} return r; }; }
// Nach dem Laden der Planung auch den Fokus auf Heute auffrischen
{ const _l=plLaden; plLaden=async function(){ const r=await _l.apply(this,arguments); try{ if(PL.d&&typeof HT!=='undefined'){ HT.plan=PL.d; HT.planAm=Date.now(); } if(svCurTab()==='home')prioHeute(); }catch(e){} return r; }; }

// Export-Zentrale: alle neuen Felder, der ganze Verlauf und fällige Aufgaben als Kalenderdatei
(function(){ if(typeof EX_QUELLEN==='undefined')return; const q=EX_QUELLEN.find(x=>x.k==='planung'); if(!q)return;
  q.text='Aufgaben mit Priorität, Fälligkeit, Wiedervorlage und Verlauf, dazu die Projekte'; q.formate=['xlsx','pdf','csv','ics'];
  q.bericht=async()=>{ const d=await exRpc('plan_laden'), P=d.projekte||[], pn=id=>(P.find(p=>p.id===id)||{}).titel||'';
    let alt=[]; try{ alt=await exRpc('plan_erledigt',{p_vor:null,p_anzahl:1000}); }catch(e){}
    const ids=new Set((d.aufgaben||[]).map(a=>a.id)), A=(d.aufgaben||[]).concat((alt||[]).filter(a=>!ids.has(a.id)));
    const st={idee:'Idee',offen:'Offen',arbeit:'In Arbeit',wartet:'Wartet',erledigt:'Erledigt'}, bt=k=>(PL_B[k]||{}).t||k;
    const offen=A.filter(a=>a.status!=='erledigt'), erl=A.filter(a=>a.status==='erledigt');
    const zeile=a=>[a.titel,PRIO_ST[prioStufe(a)],st[a.status]||a.status,exD(a.faellig),a.zeit||'',[a.wer_name||a.wer_text||''].concat(a.mit_namen||[]).filter(Boolean).join(', '),
      bt(a.bereich),pn(a.projekt),a.wartet_auf||'',exD(a.nachfassen),exD(a.wiedervorlage),PRIO_WDH[a.wiederholung]||'',PRIO_SICHT[a.sicht||'bereich']||'',a.notiz||'',a.von||'',exD(a.am),exD(a.erledigt_am),a.erledigt_von||''];
    const cols=['Aufgabe','Priorität','Stand','Fällig','Uhrzeit','Zuständig','Bereich','Projekt','Wartet auf','Nachfassen','Wiedervorlage','Wiederholung','Sichtbar für','Notiz','Angelegt von','Angelegt am','Erledigt am','Erledigt von'];
    return { titel:'Projekte und Aufgaben', sub:'Stand '+exD(exHeute())+', '+offen.length+' offen, '+erl.length+' erledigt', sections:[
      { t:'Offene Aufgaben', cols, rows:prioSortiert(offen).map(zeile) },
      { t:'Erledigt', cols, rows:erl.sort((x,y)=>String(y.erledigt_am).localeCompare(String(x.erledigt_am))).map(zeile) },
      { t:'Projekte', cols:['Projekt','Bereich','Stand','Ampel','Verantwortlich','Start','Ende'], rows:P.map(p=>[p.titel,bt(p.bereich),(PL_PST[p.status]||p.status),PL_AMP[p.ampel]||'',p.verantwortlich_name||p.verantwortlich_text||'',exD(p.start),exD(p.ende)]) }] }; };
  q.ics=async()=>{ const d=await exRpc('plan_laden');
    return (d.aufgaben||[]).filter(a=>plOffen(a)&&a.faellig).map(a=>{ const von=a.zeit?a.faellig+'T'+a.zeit+':00':a.faellig;
      return { id:'auf-'+a.id, von, bis:a.zeit?new Date(new Date(von).getTime()+30*6e4).toISOString():null, titel:(prioStufe(a)<=2?PRIO_ST[prioStufe(a)]+': ':'')+a.titel,
        text:[a.status==='wartet'?'Wartet auf: '+(a.wartet_auf||''):'',[a.wer_name||a.wer_text||''].concat(a.mit_namen||[]).filter(Boolean).join(', ')].filter(Boolean).join('\n') }; }); };
})();
if(typeof SU_STICH!=='undefined')SU_STICH.planung=((SU_STICH.planung||'')+' aufgabe aufgaben todo to-do prio priorität fokus dringend wichtig wiedervorlage erinnerung frist fällig wiederkehrend').trim();

(function(){ try{ const s=document.createElement('style'); s.id='svm75css'; s.textContent="/* Beta 0.78 · To-do-Liste als Prioritäten-Werkzeug: ruhig, klar, Tipp-Ziele 44 px */\n:root{--prio-dr:#f05252;--prio-wi:#f59e0b;--prio-ir:#687288;}\nhtml[data-theme=\"hell\"]:root{--prio-dr:#b91c1c;--prio-wi:#c2620a;--prio-ir:#8a90a0;}\n\n.prio{display:flex;flex-direction:column;gap:14px;min-width:0;}\n.prio-kopf{display:flex;align-items:center;gap:10px;justify-content:space-between;}\n.prio-seg{display:inline-flex;gap:3px;padding:3px;border-radius:13px;background:rgba(148,163,196,.07);border:1px solid var(--line);min-width:0;}\n.prio-seg button{min-height:44px;min-width:64px;font:inherit;font-size:15px;font-weight:700;padding:0 16px;border-radius:10px;border:0;background:none;color:var(--ink2);cursor:pointer;}\n.prio-seg button.on{background:var(--card);color:var(--ink);box-shadow:0 1px 3px rgba(0,0,0,.18);}\n.prio-ib{flex:none;width:44px;height:44px;border-radius:12px;border:1px solid var(--line);background:var(--card);color:var(--ink2);display:grid;place-items:center;cursor:pointer;}\n.prio-ib svg{width:20px;height:20px;}\n.prio-titel h2{margin:0;font-family:var(--disp);font-size:27px;font-weight:800;line-height:1.1;}\n.prio-titel p{margin:4px 0 0;color:var(--ink2);line-height:1.45;}\n.prio .btn,.prio .btn.sm,.prio-heute .btn,.prio-form .btn,.prio-form .btn.sm,.prio-blatt .btn{min-height:44px!important;}\n.prio .pl-h3{margin-top:4px;}\n\n/* Schnell erfassen */\n.prio-q{display:grid;gap:8px;background:var(--card);border:1px solid var(--line);border-radius:var(--r-lg);padding:12px;}\n.prio-ql{font-size:15px;font-weight:750;color:var(--ink);}\n.prio-qz{display:flex;gap:8px;min-width:0;}\n.prio-qz input{flex:1;min-width:0;min-height:48px;font:inherit;font-size:16px;padding:0 14px;border-radius:12px;border:1px solid var(--line);background:rgba(148,163,196,.06);color:var(--ink);}\n.prio-qz input:focus{outline:none;border-color:rgba(91,155,255,.6);box-shadow:0 0 0 4px rgba(47,107,255,.14);}\n.prio-qz .btn{flex:none;min-height:48px;padding:0 16px!important;}\n.prio-qv{display:flex;flex-wrap:wrap;gap:6px;}\n.prio-qv:empty{display:none;}\n.prio-qb{display:flex;align-items:center;gap:10px;}\n.prio-qb label{font-size:13.5px;color:var(--ink2);}\n.prio-qb select{flex:1;min-width:0;min-height:44px;font-size:16px;}\n.prio-qh{margin:0;font-size:13px;color:var(--ink2);line-height:1.45;}\n.prio-chip{display:inline-flex;align-items:center;gap:5px;font-size:13px;line-height:1.3;padding:5px 10px;border-radius:999px;background:rgba(148,163,196,.1);color:var(--ink);border:1px solid var(--line);}\n.prio-chip small{font-size:12px;color:var(--ink2);}\n.prio-chip.warn{border-color:var(--prio-wi);}\nbutton.prio-chip{font:inherit;font-size:14px;min-height:44px;padding:0 12px;cursor:pointer;}\nbutton.prio-chip svg{width:14px;height:14px;}\n\n/* Gruppen und Karten */\n.prio-liste{display:flex;flex-direction:column;gap:14px;}\n.prio-gr{display:flex;flex-direction:column;gap:8px;}\n.prio-gr>h3,.prio-gr>summary{display:flex;align-items:center;gap:8px;margin:0;font-size:13px;font-weight:800;text-transform:uppercase;letter-spacing:.06em;color:var(--ink2);}\n.prio-gr>summary{min-height:44px;cursor:pointer;list-style:none;padding:0 4px;border-radius:10px;}\n.prio-gr>summary::-webkit-details-marker{display:none;}\n.prio-gr>summary::after{content:\"\";width:8px;height:8px;border-right:2px solid var(--ink2);border-bottom:2px solid var(--ink2);transform:rotate(-45deg);margin-left:auto;margin-right:6px;transition:transform .15s;}\n.prio-gr[open]>summary::after{transform:rotate(45deg);}\n.prio-gr>h3 i,.prio-gr>summary i{font-style:normal;font-size:12px;font-weight:800;letter-spacing:0;text-transform:none;color:var(--ink2);background:rgba(148,163,196,.12);border-radius:99px;padding:1px 8px;}\n.prio-gr.rot>h3{color:var(--prio-dr);}\n.prio-hin{margin:0;font-size:13.5px;color:var(--ink2);line-height:1.45;}\n.prio-k{display:flex;align-items:stretch;min-width:0;background:var(--card);border:1px solid var(--line);border-radius:14px;position:relative;overflow:hidden;}\n.prio-k.s1{box-shadow:inset 3px 0 0 var(--prio-dr);}\n.prio-k.s2{box-shadow:inset 3px 0 0 var(--prio-wi);}\n.prio-k.erl .prio-kt{text-decoration:line-through;text-decoration-color:var(--ink3);color:var(--ink2);}\n.prio-chk{flex:none;width:48px;min-height:52px;border:0;background:none;display:grid;place-items:center;cursor:pointer;padding:0;}\n.prio-chk i{width:22px;height:22px;border-radius:50%;border:2px solid var(--ink3);display:grid;place-items:center;color:#fff;}\n.prio-k.s1 .prio-chk i{border-color:var(--prio-dr);}\n.prio-k.s2 .prio-chk i{border-color:var(--prio-wi);}\n.prio-k.erl .prio-chk i{background:#16a34a;border-color:#16a34a;}\n.prio-chk i svg{width:13px;height:13px;stroke-width:3;}\n@media (hover:hover){.prio-chk:hover i{border-color:#16a34a;background:rgba(34,197,94,.14);}}\n.prio-chk:focus-visible,.prio-kb:focus-visible{outline:2px solid var(--brand2);outline-offset:-2px;}\n.prio-kb{flex:1;min-width:0;display:grid;gap:4px;align-content:center;text-align:left;border:0;background:none;color:inherit;font:inherit;padding:10px 12px 10px 0;cursor:pointer;min-height:52px;}\n.prio-kt{font-size:15.5px;font-weight:600;line-height:1.3;color:var(--ink);overflow-wrap:anywhere;}\n.prio-km{display:flex;flex-wrap:wrap;gap:4px 12px;font-size:13px;color:var(--ink2);line-height:1.35;}\n.prio-km>span{display:inline-flex;align-items:center;gap:4px;min-width:0;overflow-wrap:anywhere;}\n.prio-km svg{width:13px;height:13px;flex:none;}\n.prio-f.rot{color:var(--prio-dr);font-weight:700;}\n.prio-f.heute{color:var(--ink);font-weight:700;}\n.prio-w{color:var(--ink);}\n.prio-st{display:inline-flex;align-items:center;gap:6px;color:var(--ink);font-weight:700;}\n.prio-st::before{content:\"\";width:8px;height:8px;border-radius:50%;background:var(--ink3);flex:none;}\n.prio-st.s1::before{background:var(--prio-dr);} .prio-st.s2::before{background:var(--prio-wi);} .prio-st.s3::before{background:var(--brand2);} .prio-st.s4::before{background:var(--prio-ir);}\n.prio-gr>h3 .prio-st{font-size:13px;}\n.prio-ord{display:flex;flex-direction:column;flex:none;border-left:1px solid var(--line);}\n.prio-ord button{width:44px;flex:1;min-height:44px;border:0;background:none;color:var(--ink2);display:grid;place-items:center;cursor:pointer;}\n.prio-ord button svg{width:18px;height:18px;}\n.prio-ord button:first-child svg{transform:rotate(-90deg);} .prio-ord button:last-child svg{transform:rotate(90deg);}\n.prio-ord button+button{border-top:1px solid var(--line);}\n.prio-leer{display:grid;gap:4px;text-align:center;padding:22px 16px!important;}\n.prio-leer b{font-size:16px;} .prio-leer p{margin:0;color:var(--ink2);}\n\n/* Alle: Filter */\n.prio-filter{display:flex;gap:6px;overflow-x:auto;scrollbar-width:none;padding:2px 0;}\n.prio-filter::-webkit-scrollbar{display:none;}\n.prio-filter button{flex:none;min-height:44px;display:inline-flex;align-items:center;gap:6px;font:inherit;font-size:14px;font-weight:700;padding:0 14px;border-radius:999px;border:1px solid var(--line);background:var(--card);color:var(--ink2);cursor:pointer;white-space:nowrap;}\n.prio-filter button i{font-style:normal;font-size:12px;color:var(--ink2);}\n.prio-filter button.on{border-color:var(--brand2);color:var(--ink);background:var(--brandSoft);}\n.prio-zeile{display:flex;align-items:center;justify-content:space-between;gap:10px;flex-wrap:wrap;}\n.prio-zeile p{margin:0;font-size:13.5px;color:var(--ink2);}\n\n/* Woche */\n.prio-zahlen{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:8px;}\n.prio-zahlen div{background:var(--card);border:1px solid var(--line);border-radius:14px;padding:10px 8px;text-align:center;display:grid;gap:2px;}\n.prio-zahlen b{font-size:24px;font-weight:800;font-variant-numeric:tabular-nums;color:var(--ink);}\n.prio-zahlen span{font-size:12px;color:var(--ink2);}\n.prio-zahlen div.rot b{color:var(--prio-dr);}\n\n/* Formular */\n.prio-form .prio-lbl{display:block;font-size:13px;font-weight:600;color:var(--ink2);margin-bottom:6px;}\n.prio-stufen{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:6px;}\n.prio-stufen button{min-height:44px;font:inherit;font-size:14px;font-weight:700;border-radius:12px;border:1px solid var(--line);background:rgba(148,163,196,.06);color:var(--ink2);cursor:pointer;padding:0 4px;display:inline-flex;align-items:center;justify-content:center;gap:6px;}\n.prio-stufen [data-priost]::before{content:\"\";width:8px;height:8px;border-radius:50%;background:var(--ink3);flex:none;}\n.prio-stufen .s1::before{background:var(--prio-dr);} .prio-stufen .s2::before{background:var(--prio-wi);} .prio-stufen .s3::before{background:var(--brand2);} .prio-stufen .s4::before{background:var(--prio-ir);}\n.prio-stufen button.on{border-color:var(--brand2);color:var(--ink);background:var(--brandSoft);}\n@media (max-width:420px){.prio-stufen{grid-template-columns:repeat(2,minmax(0,1fr));}}\n.prio-status button{min-height:44px;padding:0 14px!important;font-size:14px!important;}\n.prio-schnell{display:flex;flex-wrap:wrap;gap:6px;margin-top:6px;}\n.prio-schnell button{min-height:44px;font:inherit;font-size:13.5px;font-weight:700;padding:0 12px;border-radius:10px;border:1px solid var(--line);background:transparent;color:var(--ink2);cursor:pointer;}\n.prio-form .pl-sw label{min-height:44px;}\n.prio-form .pl-sw input{width:20px;height:20px;}\n.prio-mit{display:flex;flex-wrap:wrap;gap:6px;margin-bottom:6px;}\n.prio-mit:empty{display:none;}\n.prio-nur{font-size:17px;font-weight:700;margin:0 0 4px;}\n.prio-blatt .prio-q{border:0;padding:0;background:none;}\n.prio-sw{display:flex;align-items:center;justify-content:space-between;gap:14px;padding:12px 0;border-top:1px solid var(--line);cursor:pointer;min-height:44px;}\n.prio-sw span{display:grid;gap:3px;} .prio-sw small{font-size:13px;color:var(--ink2);line-height:1.4;}\n.prio-sw input{width:24px;height:24px;flex:none;}\n.prio-h{font-size:16px;margin:16px 0 4px;}\n.prio-abo .btn{min-height:44px;}\n.prio-undo{max-width:calc(100vw - 32px);}\n.prio-undo span{overflow:hidden;text-overflow:ellipsis;white-space:nowrap;min-width:0;}\n.prio-undo button{min-height:44px;padding:0 6px;}\n\n/* Heute */\n.prio-htk{display:flex;align-items:center;justify-content:space-between;gap:10px;margin:0 4px 6px;}\n.prio-htk .ht-h{margin:0;}\n.prio-plus{flex:none;min-height:44px;display:inline-flex;align-items:center;gap:6px;font:inherit;font-size:14.5px;font-weight:700;padding:0 14px;border-radius:999px;border:1px solid var(--line);background:var(--card);color:var(--ink);cursor:pointer;}\n.prio-plus svg{width:17px;height:17px;}\n.prio-heute{display:flex;flex-direction:column;gap:8px;margin:0 0 18px;}\n.prio-hk{display:flex;align-items:center;gap:10px;margin:0 4px;}\n.prio-hk h2{font-size:20px;font-weight:750;letter-spacing:-.02em;margin:0;color:var(--ink);}\n.prio-hz{font-size:13px;font-weight:700;padding:3px 10px;border-radius:999px;background:rgba(148,163,196,.12);color:var(--ink);}\n.prio-hz.rot{color:var(--prio-dr);}\n.prio-hl{display:flex;flex-direction:column;gap:8px;}\n.prio-heute>.prio-hin{margin:0 4px;}\n.prio-hm{display:flex;align-items:center;justify-content:space-between;gap:10px;min-height:48px;padding:0 14px;border-radius:14px;border:1px solid var(--line);background:var(--card);color:var(--ink);font:inherit;font-size:15px;font-weight:650;cursor:pointer;}\n.prio-hm svg{width:16px;height:16px;color:var(--ink2);}\n\n/* Plus-Knopf in der Planung */\n.prio-fab{position:fixed;right:18px;bottom:28px;z-index:45;width:56px;height:56px;border-radius:50%;border:0;background:var(--brand);color:#fff;display:grid;place-items:center;cursor:pointer;box-shadow:0 8px 20px -6px rgba(0,0,0,.45);}\n.prio-fab svg{width:26px;height:26px;stroke-width:2.4;}\n.prio-fab[hidden]{display:none;}\n@media (max-width:760px){.prio-fab{right:16px;bottom:calc(92px + env(safe-area-inset-bottom));}\n  #panel-planung{padding-bottom:72px;}}\n/* Board und Liste der Bereiche: Dringend deutlich, aber ruhig */\n.pl-k.prio-s1{box-shadow:inset 3px 0 0 var(--prio-dr);}\n.pl-pr.prio-dr{color:var(--prio-dr);}\n"; document.head.appendChild(s); }catch(e){} })();
/* =====================================================================
   Beta 0.78 · Ablage: der Vereins-Drive in der App (Wunsch Albert, 04.11.2026)
   Die App lädt nichts hoch und hat keinen Zugang zum Drive. Sie zeigt nur die Links.
   Jeder öffnet die Ordner aus seinem eigenen Google-Konto, die Freigabe regelt Google Drive.
   - Jeder Bereich und jede Mannschaft sieht nur den eigenen Ordner („Drive Veranstaltungen“, „Drive Partner“ …).
     Vorstand, Admin und Leitung sehen alles, dazu „Ganzer Drive“ mit Suche.
   - Kurzlinks: …/#drive=veranstaltungen öffnet nach dem Anmelden direkt den Ordner, wenn er für die Person bestimmt ist.
   - Freigaben: die App rechnet aus, wer im Drive welchen Ordner braucht. Die Leitung gibt frei und hakt ab.
   - Mein Konto: Google-Konto für den Drive (gmail-Adressen gelten automatisch).
   ===================================================================== */
const ABL = { d:null, am:0, laedt:null, bearb:false, q:'', offen:new Set() };
// Kurzlink beim Start merken, bevor die App die Adresse ändert
const ABL_ZIEL = (() => { try{ const m = /^#drive=([a-z0-9-]{2,60})$/.exec(location.hash || ''); if(m){ sessionStorage.setItem('sv_drive', m[1]); return m[1]; }
  return sessionStorage.getItem('sv_drive') || ''; }catch(e){ return ''; } })();

function ablLaden(neu){
  if(!neu && ABL.d && Date.now() - ABL.am < 300000) return Promise.resolve(ABL.d);
  if(ABL.laedt) return ABL.laedt;
  ABL.laedt = SVB.sb.rpc('ablage_laden', { p_bereich:'planung' }).then(({ data, error }) => {
    if(error) throw new Error(svFehlerText(error)); ablSetzen(data); return ABL.d; })
    .finally(() => { ABL.laedt = null; });
  return ABL.laedt;
}
function ablSetzen(d){ ABL.d = d || { links:[], gruppen:[], aendern:false }; ['links', 'gruppen', 'auswahl'].forEach(k => { ABL.d[k] = ABL.d[k] || []; }); ABL.am = Date.now(); }
function ablOben(){ return ABL.d.links.filter(l => l.oben).sort((a, b) => a.oben - b.oben); }
function ablWurzel(){ return ABL.d.links.find(l => l.ebene === 0) || null; }
function ablKurzUrl(k){ return location.origin + location.pathname + '#drive=' + k; }
// Was steht für diese Person auf Heute? Leitung: Angeheftetes. Alle anderen: ihre eigenen Ordner (Bereich, sonst Unterordner).
function ablMeine(){
  const L = ABL.d.links; if(ABL.d.alles) return ablOben();
  const B = L.filter(l => l.ebene === 1);
  return [...B, ...L.filter(l => l.ebene === 2 && !B.some(b => b.titel === l.gruppe))];
}
function ablUnter(l){ return l.ebene === 2 ? String(l.gruppe || '').replace(/^\d+\s+/, '') : l.ebene === 1 ? 'Google Drive' : 'Ganzer Verein'; }
function ablKachel(l){ return `<a class="abl-o" href="${svEsc(l.url)}" target="_blank" rel="noopener" data-ablo="${svEsc(l.id)}"><span class="abl-ic">${SVI('file')}</span><span><b>${svEsc(l.name || l.titel)}</b><small>${svEsc(ablUnter(l))}</small></span></a>`; }
function ablHtml(){
  const d = ABL.d; if(!d || !d.links.length) return '';
  const M = ablMeine(), viele = !d.alles && M.length > 4, zeig = viele ? M.slice(0, 3) : M;
  const n = d.links.filter(l => l.ebene > 0).length;
  const alle = d.alles || viele ? `<button type="button" class="abl-o abl-alle" data-ablalle><span class="abl-ic">${SVI('grid')}</span><span><b>${d.alles ? 'Ganzer Drive' : 'Alle deine Ordner'}</b><small>${n} Ordner</small></span></button>` : '';
  if(!zeig.length && !alle) return '';
  return `<div class="abl" aria-label="Ablage im Drive"><div class="abl-k"><b>Ablage</b></div><div class="abl-l">${zeig.map(ablKachel).join('')}${alle}</div></div>`;
}
function ablBinden(root){ const b = root.querySelector('[data-ablalle]'); if(b) b.onclick = () => ablAlle(); }

// Auf Heute: in der To-do-Kurzansicht vor „Mehr anzeigen“, ohne To-dos als eigener Block über dem Rest
function ablHeute(){
  const home = document.getElementById('panel-home'), el = document.getElementById('svHeute'); if(!home || !el) return;
  if(typeof SVU === 'undefined' || !SVU || !SVU.id) return;
  if(!ABL.d){ ablLaden().then(() => ablHeute()).catch(() => {}); return; }
  const c = document.getElementById('prioHeute'), html = ablHtml();
  let s = document.querySelector('#panel-home .abl'); let eigen = document.getElementById('ablHeute');
  if(!html){ if(s) s.remove(); if(eigen) eigen.remove(); return; }
  const t = document.createElement('div'); t.innerHTML = html; const neu = t.firstElementChild;
  if(c){ if(eigen) eigen.remove(); s = c.querySelector('.abl'); if(s) s.replaceWith(neu); else { const m = c.querySelector('#prioHtAlle'); if(m) m.before(neu); else c.appendChild(neu); } }
  else { if(!eigen){ eigen = document.createElement('section'); eigen.id = 'ablHeute'; eigen.className = 'abl-heute'; } eigen.innerHTML = ''; eigen.appendChild(neu);
    if(el.previousElementSibling !== eigen) el.before(eigen); }
  ablBinden(neu);
}
// In der Planung: gleich unter den Reitern
function ablPlanung(){
  const P = document.getElementById('panel-planung'), nav = P && P.querySelector('.pl-nav'); if(!nav) return;
  if(!ABL.d){ ablLaden().then(() => ablPlanung()).catch(() => {}); return; }
  let s = P.querySelector('.abl'); const html = ablHtml(); if(!html){ if(s) s.remove(); return; }
  const t = document.createElement('div'); t.innerHTML = html; const neu = t.firstElementChild; neu.classList.add('abl-pl');
  if(s) s.replaceWith(neu); else nav.after(neu);
  ablBinden(neu);
}
// In den Bereichen der App: der passende Ordner als Kurzknopf, wenn er für die Person bestimmt ist
const ABL_TAB = { sponsoring:'partner', jugend:'jugend', kalender:'veranstaltungen' };
function ablTab(tab){
  const k = ABL_TAB[tab], P = document.getElementById('panel-' + tab); if(!k || !P || !ABL.d) return;
  const l = ABL.d.links.find(x => x.kurz === k); let c = P.querySelector(':scope > .abl-chip');
  if(!l){ if(c) c.remove(); return; }
  if(!c){ c = document.createElement('a'); c.className = 'abl-chip'; c.target = '_blank'; c.rel = 'noopener'; P.prepend(c); }
  c.href = l.url; c.innerHTML = `${SVI('file')}<span>${svEsc(l.name || l.titel)}</span>`;
}
function ablUeberall(){ try{ ablHeute(); ablPlanung(); ablTab(typeof svCurTab === 'function' ? svCurTab() : ''); }catch(e){} }

async function ablSenden(p, b){
  if(b){ if(b.disabled) return false; b.disabled = true; }
  const { data, error } = await SVB.sb.rpc('ablage_speichern', { p }); if(b) b.disabled = false;
  if(error){ kToast(svFehlerText(error)); return false; }
  ablSetzen(data); ablUeberall(); return true;
}
async function ablKopieren(text, was){
  try{ await navigator.clipboard.writeText(text); kToast((was || 'Link') + ' kopiert'); }
  catch(e){ svModal(`<div class="mhead"><div><h2 style="margin:0">${svEsc(was || 'Link')}</h2></div></div><div class="field"><input readonly value="${svEsc(text)}" onfocus="this.select()"></div>`); }
}

/* ---------- Ganzer Drive (Leitung) bzw. alle eigenen Ordner ---------- */
function ablAlle(){
  const M = svModal(`<div class="mhead"><div><h2 style="margin:0">${ABL.d && !ABL.d.alles ? 'Deine Ordner im Drive' : 'Vereins-Drive'}</h2><div class="msub">Ein Tipp öffnet den Ordner in Google Drive, mit deinem eigenen Google-Konto. Du siehst nur die Ordner, die für dich bestimmt sind.</div></div></div>
    <div class="abl-such"><input type="search" class="search" id="ablQ" placeholder="Ordner suchen, zum Beispiel Protokolle" aria-label="Ordner suchen" autocomplete="off"></div>
    <div id="ablA" class="abl-a"></div>`);
  const A = M.querySelector('#ablA'), Q = M.querySelector('#ablQ'); Q.value = ABL.q;
  const zeile = l => `<div class="abl-r${l.ebene === 1 ? ' abl-r1' : ''}" data-ablr="${svEsc(l.id)}">
      <a href="${svEsc(l.url)}" target="_blank" rel="noopener" class="abl-ra"><span class="abl-ic">${SVI('file')}</span><span>${svEsc(l.ebene === 1 ? (l.name || 'Ganzen Bereich öffnen') : l.titel)}</span>${l.oben && ABL.d.alles ? '<em class="abl-pin">Auf Heute</em>' : ''}</a>
      ${ABL.bearb ? `<button type="button" class="abl-rb" data-ablpin aria-pressed="${!!l.oben}" aria-label="${l.oben ? 'Nicht mehr auf Heute zeigen' : 'Auf Heute zeigen'}: ${svEsc(l.titel)}">${SVI('star')}</button>
        <button type="button" class="abl-rb" data-ablchg aria-label="Ändern: ${svEsc(l.titel)}">${SVI('sliders')}</button>` : (l.kurz && ABL.d.aendern ? `<button type="button" class="abl-rb" data-ablkurz aria-label="Kurzlink kopieren: ${svEsc(l.name || l.titel)}">${SVI('link')}</button>` : '')}</div>`;
  const zeig = () => {
    const d = ABL.d; if(!d){ A.innerHTML = '<p class="note">Lade …</p>'; return; }
    const q = ABL.q.trim().toLowerCase(), passt = l => !q || l.titel.toLowerCase().includes(q) || String(l.name || '').toLowerCase().includes(q) || String(l.gruppe || '').toLowerCase().includes(q);
    const W = ablWurzel();
    let html = `<div class="abl-kopf">${W ? `<a class="btn ghost" href="${svEsc(W.url)}" target="_blank" rel="noopener">${SVI('share')} Im Drive öffnen</a>` : ''}
      ${d.aendern ? `<button type="button" class="btn ghost" data-ablbearb aria-pressed="${ABL.bearb}">${ABL.bearb ? 'Fertig' : 'Bearbeiten'}</button><button type="button" class="btn ghost" data-ablfrei>Freigaben</button>` : ''}</div>`;
    if(ABL.bearb) html += `<p class="note small">Mit dem Stern zeigst du einen Ordner auf Heute an. Unter „Ändern“ legst du fest, welcher Bereich und welche Mannschaft den Ordner sieht.</p>`;
    let treffer = 0;
    d.links.filter(l => l.ebene === 1).forEach(g => {
      const U = d.links.filter(l => l.ebene === 2 && l.gruppe === g.titel), zeigU = U.filter(passt), gPasst = passt(g);
      if(q && !gPasst && !zeigU.length) return;
      const L = q && !gPasst ? zeigU : U; treffer += L.length + 1;
      html += `<details class="abl-g" data-ablg="${svEsc(g.titel)}"${q || ABL.offen.has(g.titel) || !d.alles ? ' open' : ''}><summary><b>${svEsc(g.titel)}</b><small>${U.length} Ordner</small></summary>
        ${zeile(g)}${L.map(zeile).join('')}</details>`;
    });
    const ohne = d.links.filter(l => l.ebene === 2 && !d.links.some(g => g.ebene === 1 && g.titel === l.gruppe) && passt(l));
    if(ohne.length){ treffer += ohne.length; html += `<details class="abl-g" open><summary><b>${d.alles ? 'Weitere' : 'Deine Ordner'}</b><small>${ohne.length} Ordner</small></summary>${ohne.map(zeile).join('')}</details>`; }
    if(q && !treffer) html += `<p class="note">Kein Ordner passt zu „${svEsc(ABL.q)}“.</p>`;
    if(!q && !treffer) html += `<p class="note">Für dich ist noch kein Ordner bestimmt.</p>`;
    if(ABL.bearb) html += `<div class="btnrow"><button type="button" class="btn" data-ablneu>${SVI('plus')} Ordner hinzufügen</button></div>`;
    A.innerHTML = html;
    if(!q) A.querySelectorAll('[data-ablg]').forEach(x => x.addEventListener('toggle', () => { if(x.open) ABL.offen.add(x.dataset.ablg); else ABL.offen.delete(x.dataset.ablg); }));
    const be = A.querySelector('[data-ablbearb]'); if(be) be.onclick = () => { ABL.bearb = !ABL.bearb; zeig(); };
    const fr = A.querySelector('[data-ablfrei]'); if(fr) fr.onclick = () => ablFreigaben();
    const nu = A.querySelector('[data-ablneu]'); if(nu) nu.onclick = () => ablForm(null);
    A.querySelectorAll('[data-ablr]').forEach(r => { const l = d.links.find(x => x.id === r.dataset.ablr); if(!l) return;
      const pin = r.querySelector('[data-ablpin]'); if(pin) pin.onclick = async () => { if(await ablSenden({ id:l.id, oben:!l.oben }, pin)){ kToast(l.oben ? 'Nicht mehr auf Heute' : 'Steht jetzt auf Heute'); zeig(); } };
      const chg = r.querySelector('[data-ablchg]'); if(chg) chg.onclick = () => ablForm(l);
      const ku = r.querySelector('[data-ablkurz]'); if(ku) ku.onclick = () => ablKopieren(ablKurzUrl(l.kurz), 'Link „' + (l.name || l.titel) + '“'); });
  };
  let t = 0; Q.oninput = () => { clearTimeout(t); t = setTimeout(() => { ABL.q = Q.value; zeig(); }, 120); };
  zeig(); if(!ABL.d) ablLaden(true).then(zeig).catch(e => { A.innerHTML = `<p class="note">${svEsc(e.message)}</p>`; });
}

// Ordner neu anlegen oder ändern: Name, Link, Kurzlink, wer ihn sieht
function ablForm(l){
  const d = ABL.d, G = d.gruppen || [], S = new Set((l && l.sicht) || []);
  const erbt = l && l.ebene === 2 ? (d.links.find(g => g.ebene === 1 && g.titel === l.gruppe) || {}).sicht || [] : [];
  const name = k => ((d.auswahl || []).find(a => a.k === k) || {}).t || k;
  const M = svModal(`<div class="mhead"><div><h2 style="margin:0">${l ? 'Ordner ändern' : 'Ordner hinzufügen'}</h2><div class="msub">Ordner in Google Drive öffnen, oben auf „Teilen“ und „Link kopieren“, dann hier einfügen.</div></div></div>
    <div class="field"><label for="ablT">Name</label><input id="ablT" maxlength="80" value="${svEsc(l ? l.titel : '')}" placeholder="Zum Beispiel: Protokolle Leiterrunde"></div>
    <div class="field"><label for="ablU">Link</label><input id="ablU" maxlength="500" inputmode="url" value="${svEsc(l ? l.url : '')}" placeholder="https://drive.google.com/drive/folders/…"></div>
    ${l ? '' : `<div class="field"><label for="ablG">Bereich</label><select id="ablG"><option value="">Eigener Bereich</option>${G.map(g => `<option value="${svEsc(g)}">${svEsc(g)}</option>`).join('')}</select></div>`}
    <div class="field"><label for="ablK">Kurzlink</label><input id="ablK" maxlength="60" value="${svEsc(l && l.kurz || '')}" placeholder="zum Beispiel veranstaltungen" autocapitalize="off"><small class="abl-kl">${svEsc(location.origin + location.pathname)}#drive=…</small></div>
    ${l && l.ebene === 0 ? '' : `<fieldset class="abl-sicht"><legend>Wer sieht den Ordner?</legend>
      <p class="note small">Vorstand und Leitung sehen immer alles.${erbt.length ? ' Vom Bereich kommen dazu: ' + svEsc(erbt.map(name).join(', ')) + '.' : ''}</p>
      <div class="abl-wahl">${(d.auswahl || []).map(a => `<label class="abl-w"><input type="checkbox" value="${svEsc(a.k)}"${S.has(a.k) ? ' checked' : ''}><span>${svEsc(a.t)}</span></label>`).join('')}</div></fieldset>`}
    <div class="btnrow sbact"><button type="button" class="btn" id="ablSp">Speichern</button>${l && l.ebene > 0 ? '<button type="button" class="btn ghost" id="ablWeg">Entfernen</button>' : ''}</div>`);
  const sp = M.querySelector('#ablSp'), weg = M.querySelector('#ablWeg');
  sp.onclick = async () => { const p = { id: l ? l.id : null, titel: M.querySelector('#ablT').value, url: M.querySelector('#ablU').value, kurz: M.querySelector('#ablK').value };
    const W = M.querySelectorAll('.abl-wahl input'); if(W.length) p.sicht = [...W].filter(x => x.checked).map(x => x.value);
    if(!l){ p.gruppe = M.querySelector('#ablG').value; if(p.gruppe) ABL.offen.add(p.gruppe); }
    if(await ablSenden(p, sp)){ kToast('Gespeichert'); ablAlle(); } };
  if(weg) weg.onclick = async () => {
    if(weg.dataset.sicher !== '1'){ weg.dataset.sicher = '1'; weg.textContent = 'Wirklich entfernen?'; return; }
    if(await ablSenden({ id:l.id, loeschen:true }, weg)){ kToast('Entfernt, im Drive bleibt alles'); ablAlle(); } };
  setTimeout(() => { try{ M.querySelector('#ablT').focus(); }catch(e){} }, 60);
}

/* ---------- Freigaben im Drive (Leitung) ---------- */
async function ablFreigaben(){
  const M = svModal(`<div class="mhead"><div><h2 style="margin:0">Freigaben im Drive</h2><div class="msub">Wer welchen Ordner braucht, rechnet die App aus Abteilungen und Mannschaften aus. Freigeben musst du im Drive selbst: Ordner öffnen, „Teilen“, Adresse einfügen, dann hier abhaken.</div></div></div><div id="ablF"><p class="note">Lade …</p></div>`);
  const F = M.querySelector('#ablF');
  const zeig = d => {
    const L = d.liste || [], off = L.filter(x => x.status === 'offen'), weg = L.filter(x => x.status === 'entfernen'), ok = L.filter(x => x.status === 'erledigt');
    const zeile = x => `<div class="abl-fz" data-ablf="${svEsc(x.id)}"><div class="abl-fk"><b>${svEsc(x.person || 'Gelöschte Person')}</b><small>${svEsc(x.email)}${x.eigene_angabe ? ' <em class="abl-eig">selbst eingetragen, bitte prüfen</em>' : ''}</small><span>${svEsc(x.ordner)}</span></div>
      <div class="abl-fb"><a class="btn ghost sm" href="${svEsc(x.url)}" target="_blank" rel="noopener">Ordner öffnen</a><button type="button" class="btn ghost sm" data-ablmail>Adresse kopieren</button>
      ${x.status === 'offen' ? '<button type="button" class="btn sm" data-ablst="erledigt">Freigegeben</button>' : x.status === 'entfernen' ? '<button type="button" class="btn sm" data-ablst="entfernt">Im Drive entfernt</button>' : '<button type="button" class="btn ghost sm" data-ablst="offen">Wieder offen</button>'}</div></div>`;
    F.innerHTML = `${off.length ? `<h4 class="abl-fh">Freigeben (${off.length})</h4>${off.map(zeile).join('')}` : '<p class="note">Im Moment ist nichts freizugeben.</p>'}
      ${weg.length ? `<h4 class="abl-fh">Im Drive entfernen (${weg.length})</h4><p class="note small">Diese Personen gehören nicht mehr zum Bereich. Im Drive unter „Teilen“ die Adresse entfernen.</p>${weg.map(zeile).join('')}` : ''}
      ${(d.ohne_google || []).length ? `<p class="note small abl-og">Ohne Google-Konto, deshalb noch keine Freigabe möglich: ${svEsc(d.ohne_google.join(', '))}. Unter Mein Konto tragen sie ihr Google-Konto ein.</p>` : ''}
      ${ok.length ? `<details class="abl-g"><summary><b>Schon freigegeben</b><small>${ok.length}</small></summary>${ok.map(zeile).join('')}</details>` : ''}`;
    F.querySelectorAll('[data-ablf]').forEach(z => { const x = L.find(y => y.id === z.dataset.ablf);
      z.querySelector('[data-ablmail]').onclick = () => ablKopieren(x.email, 'Adresse');
      const b = z.querySelector('[data-ablst]'); b.onclick = async () => { if(b.disabled) return; b.disabled = true;
        const { data, error } = await SVB.sb.rpc('ablage_freigabe_setzen', { p_id: x.id, p_status: b.dataset.ablst }); b.disabled = false;
        if(error) return kToast(svFehlerText(error)); kToast('Gespeichert'); zeig(data); }; });
  };
  const { data, error } = await SVB.sb.rpc('ablage_freigaben'); if(error){ F.innerHTML = `<p class="note">${svEsc(svFehlerText(error))}</p>`; return; }
  zeig(data);
}

/* ---------- Kurzlink …/#drive=<kurz> ---------- */
async function ablZielOeffnen(k){
  try{ sessionStorage.removeItem('sv_drive'); }catch(e){}
  try{ history.replaceState(history.state, '', location.pathname + location.search); }catch(e){}
  const { data, error } = await SVB.sb.rpc('ablage_kurz', { p_kurz: k });
  if(error) return svModal(`<div class="mhead"><div><h2 style="margin:0">Drive</h2><div class="msub">${svEsc(svFehlerText(error))}</div></div></div><p class="note">Wenn du den Ordner brauchst, sag dem Vorstand Bescheid.</p>`);
  // Nur in den Google Drive weiterleiten, nie auf eine fremde Seite
  if(!/^https:\/\/(drive|docs)\.google\.com\//.test(String(data && data.url || ''))) return kToast('Dieser Link führt nicht in den Google Drive');
  location.assign(data.url);
}
{ let n = 0; const iv = setInterval(() => { if(++n > 240) return clearInterval(iv);
    try{ const k = (() => { try{ return sessionStorage.getItem('sv_drive'); }catch(e){ return ABL_ZIEL; } })();
      if(!k){ clearInterval(iv); return; }
      if(typeof SVU !== 'undefined' && SVU && SVU.id && typeof _remoteDone !== 'undefined' && _remoteDone){ clearInterval(iv); ablZielOeffnen(k); } }catch(e){} }, 500); }
// Adresswechsel bei offener App (z. B. Link in einer Nachricht): vor der Zurück-Steuerung (svnav) abfangen, damit er nicht als „Zurück“ zählt
let ablZuletzt = 0;
function ablAdresse(){ const m = /^#drive=([a-z0-9-]{2,60})$/.exec(location.hash || ''); if(!m || typeof SVU === 'undefined' || !SVU || !SVU.id || Date.now() - ablZuletzt < 1500) return false;
  ablZuletzt = Date.now(); setTimeout(() => ablZielOeffnen(m[1]), 50); return true; }
window.addEventListener('popstate', e => { if(e.state) return; if(/^#drive=/.test(location.hash || '') && typeof SVH !== 'undefined' && SVH.ready) SVH.ignore++; ablAdresse(); });
window.addEventListener('hashchange', () => ablAdresse());

/* ---------- Mein Konto: Google-Konto für den Drive ---------- */
{ const _acc = svAccount; svAccount = function(){ const r = _acc.apply(this, arguments);
  try{ const M = document.getElementById('modal'); if(M && !M.querySelector('#ablAcc')){ const s = document.createElement('div'); s.className = 'editsec'; s.id = 'ablAcc';
    s.innerHTML = `<h4>Google-Konto für den Drive</h4><p class="note small">Damit der Vorstand dir die Ordner deines Bereichs im Drive freigeben kann. Eine Gmail-Adresse gilt automatisch.</p>
      <div class="abl-acc"><input id="ablAccE" type="email" inputmode="email" autocomplete="email" maxlength="200" placeholder="name@gmail.com" aria-label="Google-Konto"><button class="btn ghost sm" id="ablAccB" type="button">Speichern</button></div>`;
    M.appendChild(s); const e = s.querySelector('#ablAccE'), b = s.querySelector('#ablAccB');
    ablLaden().then(d => { if(d && d.google && !e.value) e.value = d.google; }).catch(() => {});
    b.onclick = async () => { if(b.disabled) return; b.disabled = true; const { data, error } = await SVB.sb.rpc('drive_konto_setzen', { p_email: e.value }); b.disabled = false;
      if(error) return kToast(svFehlerText(error)); if(ABL.d) ABL.d.google = data.google; kToast('Gespeichert'); }; } }catch(e){}
  return r; }; }

{ const _ph = prioHeute; prioHeute = function(){ const r = _ph.apply(this, arguments); try{ ablHeute(); }catch(e){} return r; }; }
{ const _h = htRender; htRender = function(){ const r = _h.apply(this, arguments); try{ ablHeute(); }catch(e){} return r; }; }
{ const _r = plRender; plRender = async function(){ const r = await _r.apply(this, arguments); try{ ablPlanung(); }catch(e){} return r; }; }
{ const _gt = goTab; goTab = function(t){ const r = _gt.apply(this, arguments); setTimeout(() => { try{ if(ABL.d) ablTab(t); else if(ABL_TAB[t] && typeof SVU !== 'undefined' && SVU && SVU.id) ablLaden().then(() => ablTab(t)).catch(() => {}); }catch(e){} }, 400); return r; }; }

(function(){ try{ const s=document.createElement('style'); s.id='svm76css'; s.textContent="/* Beta 0.78 · Ablage: Drive-Ordner als ruhige Zeile */\n.abl{display:flex;flex-direction:column;gap:6px;}\n.abl-k{display:flex;align-items:center;justify-content:space-between;gap:10px;margin:2px 4px 0;}\n.abl-k b{font-size:13px;font-weight:700;letter-spacing:.04em;text-transform:uppercase;color:var(--ink2);}\n.abl-l{display:grid;grid-template-columns:repeat(auto-fit,minmax(150px,1fr));gap:8px;}\n.abl-o{display:flex;align-items:center;gap:10px;min-height:60px;padding:10px 12px;border-radius:14px;border:1px solid var(--line);background:var(--card);color:var(--ink);text-decoration:none;}\n.abl-o:hover{border-color:var(--ink2);}\n.abl-o:focus-visible{outline:2px solid var(--brand);outline-offset:2px;}\n.abl-o>span:last-child{display:flex;flex-direction:column;min-width:0;}\n.abl-o b{font-size:15px;font-weight:650;line-height:1.25;overflow:hidden;display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical;overflow-wrap:break-word;hyphens:auto;-webkit-hyphens:auto;}\n.abl-o small{font-size:12.5px;color:var(--ink2);}\n.abl-ic{flex:none;display:grid;place-items:center;width:34px;height:34px;border-radius:10px;background:var(--line);color:var(--ink2);}\n.abl-ic svg{width:18px;height:18px;}\n.abl-pl{margin:12px 0 4px;}\n/* Kachel „Ganzer Drive“ */\nbutton.abl-o{font:inherit;text-align:left;cursor:pointer;width:100%;}\n.abl-alle .abl-ic{color:var(--ink);}\n.abl-l .abl-alle:nth-child(odd){grid-column:1/-1;}\n/* Ganzer Drive: Suche, Bereiche, Ordner */\n.abl-such input{width:100%;min-height:48px;font-size:16px!important;}\n.abl-a{display:flex;flex-direction:column;gap:8px;margin-top:12px;}\n.abl-kopf{display:flex;flex-wrap:wrap;gap:8px;}\n.abl-kopf .btn{min-height:44px;display:inline-flex;align-items:center;gap:8px;text-decoration:none;}\n.abl-kopf .btn svg{width:16px;height:16px;}\n.abl-g{border:1px solid var(--line);border-radius:14px;background:var(--card);overflow:hidden;}\n.abl-g>summary{display:flex;align-items:center;justify-content:space-between;gap:10px;min-height:52px;padding:0 14px;cursor:pointer;list-style:none;}\n.abl-g>summary::-webkit-details-marker{display:none;}\n.abl-g>summary b{font-size:15px;font-weight:650;}\n.abl-g>summary small{font-size:13px;color:var(--ink2);flex:none;}\n.abl-g>summary:focus-visible{outline:2px solid var(--brand);outline-offset:-2px;}\n.abl-r{display:flex;align-items:center;gap:4px;border-top:1px solid var(--line);padding-right:6px;}\n.abl-ra{flex:1;min-width:0;display:flex;align-items:center;gap:10px;min-height:48px;padding:4px 14px;color:var(--ink);text-decoration:none;font-size:15px;}\n.abl-ra>span:nth-child(2){min-width:0;overflow-wrap:anywhere;}\n.abl-r1 .abl-ra{color:var(--ink2);font-weight:600;}\n.abl-ra .abl-ic{width:28px;height:28px;border-radius:8px;}\n.abl-ra .abl-ic svg{width:15px;height:15px;}\n.abl-ra:focus-visible,.abl-rb:focus-visible{outline:2px solid var(--brand);outline-offset:-2px;}\n.abl-pin{flex:none;font-style:normal;font-size:12px;font-weight:650;color:var(--ink2);border:1px solid var(--line);border-radius:999px;padding:2px 8px;}\n.abl-rb{all:unset;position:relative;flex:none;display:grid;place-items:center;width:44px;height:44px;border-radius:10px;color:var(--ink2);cursor:pointer;}\n.abl-rb svg{width:18px;height:18px;}\n.abl-rb[aria-pressed=\"true\"]{color:var(--ink);}\n.abl-rb[aria-pressed=\"true\"] svg{fill:currentColor;}\n/* Ohne To-dos: eigener Block auf Heute */\n.abl-heute{margin:0 0 18px;}\n/* Kurzknopf im Bereich der App */\n.abl-chip{display:inline-flex;align-items:center;gap:8px;min-height:44px;padding:0 14px;margin:0 0 12px;border-radius:999px;border:1px solid var(--line);background:var(--card);color:var(--ink);text-decoration:none;font-size:14px;font-weight:650;}\n.abl-chip svg{width:16px;height:16px;color:var(--ink2);}\n.abl-chip:focus-visible{outline:2px solid var(--brand);outline-offset:2px;}\n/* Formular: Kurzlink und wer sieht */\n.abl-kl{display:block;margin-top:4px;font-size:12.5px;color:var(--ink2);overflow-wrap:anywhere;}\n.abl-sicht{border:0;padding:0;margin:14px 0 0;}\n.abl-sicht legend{font-weight:650;font-size:15px;padding:0;margin-bottom:4px;}\n.abl-wahl{display:flex;flex-wrap:wrap;gap:8px;}\n.abl-w{display:inline-flex;align-items:center;gap:8px;min-height:44px;padding:0 12px;border:1px solid var(--line);border-radius:12px;cursor:pointer;font-size:14px;}\n.abl-w input{width:18px;height:18px;margin:0;}\n/* Freigaben */\n.abl-fh{margin:16px 0 6px;}\n.abl-fz{display:flex;flex-direction:column;gap:8px;padding:12px 0;border-bottom:1px solid var(--line);}\n.abl-fk{display:flex;flex-direction:column;gap:2px;min-width:0;}\n.abl-fk b{font-size:15px;}\n.abl-fk small,.abl-fk span{font-size:13.5px;color:var(--ink2);overflow-wrap:anywhere;}\n.abl-fb{display:flex;flex-wrap:wrap;gap:8px;}\n.abl-fb .btn{min-height:44px!important;display:inline-flex;align-items:center;text-decoration:none;}\n.abl-og{margin-top:14px;}\n/* Mein Konto */\n.abl-acc{display:flex;gap:8px;flex-wrap:wrap;}\n.abl-acc input{flex:1 1 200px;min-height:44px;font-size:16px;}\n.abl-acc .btn{min-height:44px!important;}\n.abl-eig{font-style:normal;font-weight:650;color:var(--ink);}\n"; document.head.appendChild(s); }catch(e){} })();
/* =====================================================================
   Beta 0.79 · Struktur und Navigation (Audit 11/2026, Teil C)
   1. Ein Name je Ziel: „Planung“ ist der Bereich mit den Reitern Planung, Termine, Aufgaben, Vorstand & Ziele.
      Termine heißt überall Termine, Aufgaben heißt überall Aufgaben (Leiste, Titel, Heute, Menü).
   2. Ein Bereich, eine Leiste: Scouting zeigt am Handy immer dieselben ersten Reiter, der Rest steckt unter „Mehr“.
      Die Gegneranalyse gehört zur Mannschaft (Spiele) und heißt dort auch so.
   3. „Kasse“ heißt im Menü wie die Seite: Mannschaftskasse.
   4. Gast und Jugend sehen „Vorstand & Ziele“ nicht.
   5. Titel am Handy: kürzer, und wenn es doch eng wird, zweizeilig statt abgeschnitten.
   6. Mehr-Menü: Gruppen mit Überschriften, nur was die Rolle darf, nichts doppelt zur unteren Leiste.
   7. Seitenleiste am Rechner: dieselben Gruppen, kompakter, scrollt in sich, wenn es mehr wird.
   8. Leere Zustände mit einem Satz und einem Knopf (SOMA, Gegner, Vereinsstatistik, Helfer).
   9. „Nur du bist gerade online“ verschwindet ganz.
  10. Mein Konto: Hilfe und Datenschutz als Links, Technik unter „Über die App“ (zugeklappt).
   ===================================================================== */
const N77 = { menu:null };

/* ---------- 1. Benennung ---------- */
SV4_HUB.steuerung.t = 'Planung';
SV_TBL.kalender = ['cal', 'Termine'];
Object.assign(SV_PAGES, {
  planung:['Planung', 'Projekte, To-dos und Beschlüsse aller Bereiche'],
  kalender:['Termine', 'Spiele, Veranstaltungen und Geburtstage'],
  orga:['Aufgaben', 'Checklisten für Heimspiele und Veranstaltungen'],
  vorstand:['Vorstand & Ziele', 'Zuständigkeiten und unsere Ziele bis 2030'],
  // 2. Die Gegneranalyse hängt an Mannschaft → Spiele: Titel und Leiste sagen dasselbe
  gegner:['Mannschaft', 'Gegneranalyse: Formkurve, Spielberichte, gefährliche Spieler, Historie'],
  // 5. kürzer, die Reiter darunter sagen den Rest
  kader:['Kader', (SV_PAGES.kader || [])[1] || 'Wer spielt wann wo, dazu alle Spielergespräche']
});
if(typeof HT_ZIEL !== 'undefined'){ HT_ZIEL.orga[2] = 'Aufgaben'; HT_ZIEL.kasse[2] = 'Mannschaftskasse'; }
if(typeof HT_TEXT !== 'undefined'){ HT_TEXT.orga = 'Checklisten für Heimspiele und Veranstaltungen'; HT_TEXT.kasse = 'Strafen, Beiträge, Kassenstand'; }

/* ---------- 4. Unterreiter nach Rolle ---------- */
{ const _ta = svTabAllowed; svTabAllowed = function(t){
  if(t === 'vorstand' && ['viewer', 'jugend', 'spieler', 'helfer'].includes(svRole())) return false;
  return _ta.apply(this, arguments); }; }

/* ---------- 6. und 7. Mehr-Menü und Seitenleiste ---------- */
// Dieselben Gruppen in beiden. Reihenfolge wie bisher: am Rechner Mannschaften vor Spieltag, im Menü Spieltag vorne.
const N77_GRP = {
  'Übersicht':['home', 'planung', 'kalender'],
  'Mannschaften':['mann1', 'mann2', 'somainakt', 'teams'],
  'Spieltag':['sptag', 'gegner', 'totw', 'plakat'],
  'Kader & Scouting':['kader', 'ejugend', 'scout'],
  'Verein':['verein', 'sponsoring', 'veranstaltungen', 'helfer', 'kasse'],
  'Werkzeuge':['studio', 'export', 'play'],
  'Verwaltung':['admin', 'pruefung']
};
const N77_SEITE = ['Übersicht', 'Mannschaften', 'Spieltag', 'Kader & Scouting', 'Verein', 'Werkzeuge', 'Verwaltung'];
const N77_MENUE = ['Übersicht', 'Spieltag', 'Mannschaften', 'Kader & Scouting', 'Verein', 'Werkzeuge', 'Verwaltung'];
// Namen wie die Seite heißt, die man öffnet
const N77_NAME = { planung:'Planung', kalender:'Termine', gegner:'Gegneranalyse', sptag:'Mein Spieltag', kasse:'Mannschaftskasse' };
const N77_MENUE_NAME = Object.assign({}, N77_NAME, { kasse:'Mannschafts\u00adkasse', gegner:'Gegner\u00adanalyse', plakat:'Spieltags\u00adstudio', veranstaltungen:'Veranstal\u00adtungen', admin:'Nutzer & Rollen' });
const N77_ICON = { planung:'check', kalender:'cal' };

function n77Knopf(art, t){
  const b = document.createElement('button'); b.type = 'button';
  if(art === 'seite'){ b.dataset.tab = t; b.dataset.tip = N77_NAME[t] || t; b.innerHTML = `${SVI(N77_ICON[t] || 'grid')}<span>${svEsc(N77_NAME[t] || t)}</span>`; }
  else { b.dataset.sheet = t; b.innerHTML = `${SVI(N77_ICON[t] || 'grid')}${N77_MENUE_NAME[t] || t}`; }
  b.onclick = () => goTab(t); return b;
}
function n77Beschriften(b, name){
  if(b.dataset.tab){ const s = b.querySelector(':scope > span:not(.cnt)'); if(s && s.textContent !== name) s.textContent = name; b.dataset.tip = name; return; }
  const t = [...b.childNodes].filter(n => n.nodeType === 3); const soll = name.replace(/\u00ad/g, '');
  if(t.map(n => n.textContent).join('').replace(/\u00ad/g, '').trim() === soll) return;
  t.forEach(n => n.remove()); b.appendChild(document.createTextNode(name));
}
function n77Icon(b, t){ if(!N77_ICON[t] || b.dataset.n77ic) return; const s = b.querySelector('svg'); if(s){ const x = document.createElement('span'); x.innerHTML = SVI(N77_ICON[t]); const neu = x.firstElementChild; if(neu){ neu.setAttribute('aria-hidden', 'true'); s.replaceWith(neu); } } b.dataset.n77ic = '1'; }

function n77Seite(){
  const nav = document.querySelector('.side .snav'); if(!nav) return;
  const akt = nav.scrollTop;
  const B = {}; nav.querySelectorAll(':scope > button[data-tab]').forEach(b => { B[b.dataset.tab] = b; });
  if(!B.planung) B.planung = n77Knopf('seite', 'planung');
  const app = [...nav.querySelectorAll(':scope > .sp-nav')];
  const frag = document.createDocumentFragment();
  N77_SEITE.forEach(g => {
    const h = document.createElement('div'); h.className = 'sgrp n77-g' + (g === 'Verwaltung' ? ' adm-only' : ''); h.textContent = g; h.dataset.n77g = g; frag.appendChild(h);
    N77_GRP[g].forEach(t => { const b = B[t]; if(!b) return; if(N77_NAME[t]) n77Beschriften(b, N77_NAME[t]); n77Icon(b, t); frag.appendChild(b); delete B[t]; });
  });
  // Was noch übrig ist (neue Bereiche aus späteren Versionen) bleibt erreichbar
  Object.values(B).forEach(b => frag.appendChild(b));
  if(app.length){ const h = document.createElement('div'); h.className = 'sgrp n77-g'; h.textContent = 'App'; h.dataset.n77g = 'App'; frag.appendChild(h); app.forEach(b => frag.appendChild(b)); }
  [...nav.children].forEach(c => { if(c.classList.contains('sgrp')) c.remove(); });
  nav.appendChild(frag); nav.dataset.n77 = '1'; nav.scrollTop = akt;
  n77Koepfe();
}
function n77Menue(){
  const sh = document.getElementById('moreSheet'); if(!sh) return;
  const B = {}; sh.querySelectorAll('.sgrid [data-sheet]').forEach(b => { B[b.dataset.sheet] = b; });
  (N77.uebrig || []).forEach(b => { if(!B[b.dataset.sheet]) B[b.dataset.sheet] = b; }); N77.uebrig = null;
  if(!B.planung) B.planung = n77Knopf('menue', 'planung');
  const me = sh.querySelector('.meline'), app = [...sh.querySelectorAll(':scope > .sp-sheet')];
  sh.querySelectorAll(':scope > h4, :scope > .sgrid').forEach(x => x.remove());
  N77_MENUE.forEach(g => {
    const h = document.createElement('h4'); h.textContent = g; h.dataset.n77g = g; if(g === 'Verwaltung') h.className = 'adm-only';
    const d = document.createElement('div'); d.className = 'sgrid' + (g === 'Verwaltung' ? ' adm-only' : '');
    N77_GRP[g].forEach(t => { const b = B[t]; if(!b) return; if(N77_MENUE_NAME[t]) n77Beschriften(b, N77_MENUE_NAME[t]); n77Icon(b, t); d.appendChild(b); delete B[t]; });
    sh.insertBefore(h, me); sh.insertBefore(d, me);
  });
  // Knöpfe, die (noch) in keiner Gruppe stehen: in die letzte Gruppe, die alle sehen. Vorher lief das hier auf einen Fehler,
  // und der Knopf war danach ganz aus dem Menü verschwunden (so die Förderzentrale am Handy, 0.99.36 bis 0.99.41). Beim
  // nächsten Ordnen kommt er in seine Gruppe, sobald er in N77_GRP steht.
  const rest = Object.values(B); if(rest.length){ const d = [...sh.querySelectorAll(':scope > .sgrid:not(.adm-only)')].pop(); if(d) rest.forEach(b => d.appendChild(b)); else N77.uebrig = rest; }
  // „Was ist neu“ und „Idee oder Fehler melden“ unter die Bereiche
  app.forEach(x => sh.insertBefore(x, me));
  sh.dataset.n77 = '1';
  n77Koepfe();
}
// Was die untere Leiste schon zeigt, steht nicht noch einmal im Mehr-Menü
function n77Leiste(){ return [...document.querySelectorAll('#tabbar .ti')].filter(b => b.style.display !== 'none').map(b => b.dataset.tab); }
function n77Koepfe(){
  try{
    const L = n77Leiste(), handy = innerWidth <= 760;
    let zurueck = false;
    document.querySelectorAll('.sgrid [data-sheet]').forEach(b => {
      const t = b.dataset.sheet, doppelt = handy && L.includes(t);
      if(doppelt){ if(b.style.display !== 'none'){ b.style.display = 'none'; b.dataset.n77l = '1'; } }
      else if(b.dataset.n77l){ delete b.dataset.n77l; b.style.display = ''; zurueck = true; }
    });
    // Wieder freigegeben: die Rechte entscheidet sv4NavVis (ruft danach wieder hierher)
    if(zurueck && !N77.nv){ N77.nv = 1; try{ sv4NavVis(); }finally{ N77.nv = 0; } return; }
    const sicht = b => b.style.display !== 'none' && !(b.classList.contains('adm-only') && !canManage());
    document.querySelectorAll('.snav .sgrp').forEach(h => { let n = h.nextElementSibling, any = false;
      while(n && !n.classList.contains('sgrp')){ if(sicht(n)) any = true; n = n.nextElementSibling; }
      h.style.display = any && !(h.classList.contains('adm-only') && !canManage()) ? '' : 'none'; });
    document.querySelectorAll('#moreSheet > h4').forEach(h => { const g = h.nextElementSibling; const any = !!g && [...g.children].some(sicht) && !(h.classList.contains('adm-only') && !canManage());
      h.style.display = any ? '' : 'none'; if(g) g.style.display = any ? '' : 'none'; });
  }catch(e){ console.warn('Navigation 0.79', e); }
}
function n77Ordnen(){ try{ n77Seite(); n77Menue(); }catch(e){ console.warn('Navigation 0.79', e); } }
if(document.readyState === 'loading') document.addEventListener('DOMContentLoaded', n77Ordnen); else n77Ordnen();
setTimeout(() => n77Ordnen(), 0);   // noch einmal, wenn das ganze Bündel geladen ist: spätere Module tragen ihre Bereiche in N77_GRP nach
{ const _nv = sv4NavVis; sv4NavVis = function(){ const r = _nv.apply(this, arguments); n77Koepfe(); return r; }; }
{ const _os = svOrderSide; svOrderSide = function(){ const r = _os.apply(this, arguments); try{ n77Seite(); }catch(e){} return r; }; }
{ const _bt = svBuildTabbar; svBuildTabbar = function(){ const r = _bt.apply(this, arguments); n77Koepfe(); return r; }; }
{ const _sh = svSheet; svSheet = function(open){ if(open){ try{ n77Menue(); }catch(e){} } return _sh.apply(this, arguments); }; }
if(typeof spEntries === 'function'){ const _se = spEntries; spEntries = function(){ const r = _se.apply(this, arguments); try{ n77Ordnen(); }catch(e){} return r; }; }
if(typeof rmEinstiege === 'function'){ const _re = rmEinstiege; rmEinstiege = function(){ const r = _re.apply(this, arguments); try{ n77Ordnen(); }catch(e){} return r; }; }
addEventListener('resize', () => { clearTimeout(N77.rs); N77.rs = setTimeout(n77Koepfe, 200); }, { passive:true });

/* ---------- Aktiver Eintrag und Titel ---------- */
function n77Aktiv(){
  const cur = svCurTab(), nav = document.querySelector('.side .snav'); if(!nav) return;
  if(!['planung', 'kalender', 'orga', 'vorstand'].includes(cur)) return;
  const pl = nav.querySelector('button[data-tab="planung"]'), plSicht = pl && pl.style.display !== 'none';
  const ziel = cur === 'kalender' || !plSicht ? nav.querySelector('button[data-tab="kalender"]') : pl;
  if(!ziel) return; nav.querySelectorAll('button[data-tab]').forEach(b => b.classList.toggle('active', b === ziel));
  document.querySelectorAll('.sgrid [data-sheet]').forEach(b => b.classList.toggle('active', b.dataset.sheet === ziel.dataset.tab));
}
function n77Titel(){
  const h = document.getElementById('pgTitle'); if(!h) return;
  h.classList.remove('n77-lang');
  if(innerWidth <= 760 && h.scrollWidth > h.clientWidth + 1) h.classList.add('n77-lang');
}
{ const _gt = goTab; goTab = function(){ const r = _gt.apply(this, arguments);
  try{ n77Aktiv(); n77Titel(); n77Koepfe(); setTimeout(() => { try{ n77Aktiv(); n77Titel(); }catch(e){} }, 80); }catch(e){}
  return r; }; }

/* ---------- 2. Eine Leiste: Scouting am Handy mit „Mehr“ statt wechselndem Ausschnitt ---------- */
const N77_UEBERLAUF = ['scouting'];
function n77Name(b){ const x = b.cloneNode(true); x.querySelectorAll('.cnt').forEach(c => c.remove()); return x.textContent.trim(); }
function n77MenueZu(){ if(N77.menu){ N77.menu.remove(); N77.menu = null; } const m = document.querySelector('#hubbar .n77-hm'); if(m) m.setAttribute('aria-expanded', 'false'); }
function n77Ueberlauf(tab){
  const bar = document.getElementById('hubbar'), inn = bar && bar.querySelector('.hub-in'); if(!inn || bar.hidden) return;
  const hk = SV4_OF[tab]; if(!N77_UEBERLAUF.includes(hk)) return;
  const K = [...inn.querySelectorAll(':scope > button[data-hub]')]; if(K.length < 4) return;
  // Handy: Leiste breiter als der Bildschirm. Rechner: Leiste bricht in eine zweite Reihe um.
  if(innerWidth <= 760){ const c = getComputedStyle(inn), g = parseFloat(c.columnGap) || 0;
    if(K.reduce((a, b) => a + b.offsetWidth + g, 0) + (parseFloat(c.paddingLeft) || 0) + (parseFloat(c.paddingRight) || 0) <= inn.clientWidth + 1) return; }
  else if(new Set(K.map(b => b.offsetTop)).size < 2) return;
  const cs = getComputedStyle(inn), gap = parseFloat(cs.columnGap) || 0, pr = parseFloat(cs.paddingRight) || 0;
  const platz = inn.clientWidth - (parseFloat(cs.paddingLeft) || 0) - pr - 2, w = K.map(b => b.offsetWidth + gap);
  const mehrW = t => { const p = document.createElement('button'); p.className = 'n77-hm'; p.style.visibility = 'hidden'; p.innerHTML = `<span>${svEsc(t)}</span>` + SVI('chev'); inn.appendChild(p); const x = p.offsetWidth + gap; p.remove(); return x; };
  // Platz für den längsten Namen freihalten: so bleiben die vorderen Reiter gleich, egal welcher offen ist
  const reserve = Math.max(mehrW('Mehr'), ...K.map(b => mehrW(n77Name(b))));
  let s = reserve, n = 0; for(const x of w){ if(s + x > platz) break; s += x; n++; }
  n = Math.max(1, n);
  const aktiv = K.findIndex(b => b.classList.contains('on')), on = aktiv >= n;
  const label = on ? n77Name(K[aktiv]) : 'Mehr';
  K.slice(n).forEach(b => { b.hidden = true; b.classList.add('n77-weg'); });
  if(on) K[aktiv].classList.remove('on');
  const m = document.createElement('button'); m.type = 'button'; m.className = 'n77-hm' + (on ? ' on' : ''); m.setAttribute('aria-haspopup', 'menu'); m.setAttribute('aria-expanded', 'false');
  m.setAttribute('aria-label', on ? label + ', weitere Reiter' : 'Weitere Reiter'); m.innerHTML = `<span>${svEsc(label)}</span>${SVI('chev')}`;
  const ind = inn.querySelector('.hub-ind'); inn.insertBefore(m, ind || null);
  inn.classList.add('n77-fest'); inn.scrollLeft = 0;
  if(ind){ const ziel = on ? m : inn.querySelector(':scope > button.on'); if(ziel){ ind.style.transition = 'none'; ind.style.width = Math.max(12, ziel.offsetWidth - 20) + 'px'; ind.style.transform = `translateX(${ziel.offsetLeft + 10}px)`; } }
  m.onclick = e => { e.stopPropagation(); if(N77.menu){ n77MenueZu(); return; }
    const r = m.getBoundingClientRect(), M = document.createElement('div'); M.className = 'n77-menu'; M.setAttribute('role', 'menu'); M.setAttribute('aria-label', 'Weitere Reiter');
    M.innerHTML = K.filter(b => b.hidden).map(b => `<button type="button" role="menuitem" data-n77hub="${svEsc(b.dataset.hub)}"${b === K[aktiv] ? ' aria-current="page" class="on"' : ''}>${svEsc(n77Name(b))}</button>`).join('');
    M.style.top = Math.round(r.bottom + 6) + 'px'; M.style.right = Math.max(8, Math.round(innerWidth - r.right)) + 'px';
    document.body.appendChild(M); N77.menu = M; m.setAttribute('aria-expanded', 'true');
    M.querySelectorAll('[data-n77hub]').forEach(x => x.onclick = () => { n77MenueZu(); sv4Go(x.dataset.n77hub); });
    const f = M.querySelector('.on') || M.querySelector('button'); if(f) try{ f.focus({ preventScroll:true }); }catch(x){} };
}
document.addEventListener('pointerdown', e => { if(N77.menu && !N77.menu.contains(e.target) && !e.target.closest('.n77-hm')) n77MenueZu(); }, true);
document.addEventListener('keydown', e => { if(e.key === 'Escape' && N77.menu){ const m = document.querySelector('#hubbar .n77-hm'); n77MenueZu(); if(m) m.focus(); } });
addEventListener('scroll', () => { if(N77.menu) n77MenueZu(); }, { passive:true });
{ const _hb = sv4HubBar; sv4HubBar = function(tab){ n77MenueZu(); const r = _hb.apply(this, arguments); try{ n77Ueberlauf(tab); }catch(e){ console.warn('Reiter 0.79', e); } return r; }; }

/* ---------- 8. Leere Zustände: ein Satz und ein Knopf ---------- */
function n77Leer(titel, satz, knopf, fn){
  const d = document.createElement('div'); d.className = 'n77-leer';
  d.innerHTML = `<b>${svEsc(titel)}</b><p>${svEsc(satz)}</p><button type="button" class="btn ghost sm">${svEsc(knopf)}</button>`;
  d.querySelector('button').onclick = fn; return d;
}
if(typeof mn31Render === 'function'){ const _r = mn31Render; mn31Render = function(){ const r = _r.apply(this, arguments);
  try{ const P = document.getElementById('panel-somainakt'), E = P && P.querySelector('.mn31-l > .empty'); if(!E) return r;
    const G = mn31Gruppen(), v = MN31.view;
    let x;
    if(MN31.q) x = n77Leer('Niemand passt zu „' + MN31.q + '“.', 'Prüf die Schreibweise oder such nach dem Nachnamen.', 'Suche leeren', () => { MN31.q = ''; mn31Render(); });
    else {
      const T = { soma:['Niemand in der SOMA.', 'Wer in seiner Mannschaft die Stammmannschaft SOMA bekommt, steht hier.'],
        inakt:['Niemand ist gerade inaktiv mit Pass.', 'Wer pausiert, aber den Pass behält, bekommt in seiner Mannschaft „Inaktiv mit Pass“ und steht dann hier.'],
        ohne:['Alle eigenen Spieler sind zugeordnet.', 'Neue Spieler ordnest du hier oder in der Spielerliste ihrer Mannschaft zu.'] }[v] || ['Niemand in dieser Gruppe.', 'Spieler ordnest du in der Spielerliste ihrer Mannschaft zu.'];
      x = v !== 'ohne' && G.ohne.length ? n77Leer(T[0], T[1], G.ohne.length + ' ohne Mannschaft zuordnen', () => { MN31.view = 'ohne'; mn31Render(); })
        : n77Leer(T[0], T[1], 'Zur 1. Mannschaft', () => goTab('mann1'));
    }
    E.replaceWith(x); }catch(e){}
  return r; }; }
if(typeof spRender === 'function'){ const _r = spRender; spRender = async function(){ const r = await _r.apply(this, arguments);
  try{ const P = document.getElementById('panel-gegner'), E = P && [...P.querySelectorAll('.card > .empty')].find(x => /Noch kein Spielplan/.test(x.textContent)); if(!E) return r;
    const zuSpielen = typeof canTraining === 'function' && canTraining();
    E.replaceWith(n77Leer('Noch kein Spielplan da.', 'Er kommt mit dem nächsten Daten-Update, sonntags spät sowie montags und donnerstags früh.',
      zuSpielen ? 'Zu den Spielen der Mannschaft' : 'Zu den Terminen', () => zuSpielen ? sv4Go('training:games') : goTab('kalender'))); }catch(e){}
  return r; }; }
if(typeof vrViewAllTime === 'function'){ const _r = vrViewAllTime; vrViewAllTime = function(B){ const r = _r.apply(this, arguments);
  try{ const E = B && [...B.querySelectorAll('.card > .empty')].find(x => /noch nicht eingelesen/.test(x.textContent)); if(!E) return r;
    const [k, fn] = canManage() && svTabAllowed('quellen') ? ['Datenquellen ansehen', () => goTab('quellen')]
      : svTabAllowed('scout') ? ['Spieler der Region ansehen', () => goTab('scout')] : ['Zu den Terminen', () => goTab('kalender')];
    E.replaceWith(n77Leer('Die Vereinsstatistik ist noch nicht eingelesen.', 'Sie kommt automatisch mit dem nächsten Daten-Update von der Vereinsseite.', k, fn)); }catch(e){}
  return r; }; }
if(typeof hfUebersicht === 'function'){ const _r = hfUebersicht; hfUebersicht = function(P){ const r = _r.apply(this, arguments);
  try{ if((HP.d && HP.d.helfer || []).length) return r; const H = P.querySelector('.hf'), Z = P.querySelector('.hf-zahlen'); if(!H || H.querySelector('.n77-leer')) return r;
    if(Z) Z.hidden = true;
    H.prepend(n77Leer('Noch keine Helfer eingetragen.', 'Teil den Anmeldelink, dann tragen sich Helfer selbst ein und kreuzen an, wo sie mitmachen.', 'Anmeldelink kopieren', () => { const l = P.querySelector('#hfLink'); if(l) l.click(); })); }catch(e){}
  return r; }; }

/* ---------- 9. Anwesenheit nur, wenn noch jemand da ist ---------- */
{ const _or = svOnlineRender; svOnlineRender = function(){ const r = _or.apply(this, arguments);
  try{ document.querySelectorAll('#svOnline,#svOnline2,.online-chip').forEach(el => { if(el.classList.contains('allein')){ el.innerHTML = ''; el.setAttribute('aria-hidden', 'true'); } else el.removeAttribute('aria-hidden'); }); }catch(e){}
  return r; }; }
try{ svOnlineRender(); }catch(e){}

/* ---------- 10. Mein Konto: Hilfe, Datenschutz, Über die App ---------- */
{ const _acc = svAccount; svAccount = function(){ const r = _acc.apply(this, arguments);
  try{ const M = document.getElementById('modal'); if(!M || M.querySelector('#n77Ueber')) return r;
    const tech = [...M.querySelectorAll('.note')].filter(n => /Datenstand|Live-Verbindung/.test(n.textContent) && !n.closest('#n77Ueber'));
    const s = document.createElement('div'); s.className = 'editsec n77-hilfe'; s.id = 'n77Ueber';
    s.innerHTML = `<h4>Hilfe und Rechtliches</h4>
      <div class="n77-links"><a class="btn ghost sm" href="hilfe.html" target="_blank" rel="noopener">${SVI('book')} Hilfe</a><a class="btn ghost sm" href="datenschutz.html" target="_blank" rel="noopener">${SVI('shield')} Datenschutzhinweise</a></div>
      <details class="n77-tech"><summary>Über die App</summary><div class="n77-tech-in"></div></details>`;
    const inn = s.querySelector('.n77-tech-in'); tech.forEach(n => inn.appendChild(n));
    const weg = M.querySelector('#svnLoeschSek'); if(weg) M.insertBefore(s, weg); else M.appendChild(s);
  }catch(e){ console.warn('Konto 0.79', e); }
  return r; }; }

(function(){ try{ const s=document.createElement('style'); s.id='svm77css'; s.textContent="/* Beta 0.79 · Struktur und Navigation */\n\n/* 7. Seitenleiste am Rechner: kompakter, Gruppen wie im Menü, scrollt in sich */\n@media (min-width:1181px){\n  .side .brand{padding:2px 8px 12px;}\n  .side .brand img{width:36px;height:36px;border-radius:11px;}\n  .side .snav{gap:1px;}\n  .side .snav .sgrp{padding:10px 12px 3px;font-size:11px;line-height:1.2;}\n  .side .snav .sgrp:first-child{padding-top:2px;}\n  .side .snav button[data-tab],.side .snav .sp-nav{min-height:0;height:30px;padding:0 10px;gap:10px;font-size:13.5px;border-radius:9px;}\n  .side .snav button svg{width:17px;height:17px;}\n  .side .snav button.active:before{top:7px;bottom:7px;}\n  .side .snav .sp-nav .sp-nic{font-size:13px;}\n}\n\n/* 6. Mehr-Menü: Gruppen, lange Namen dürfen umbrechen */\n#moreSheet .sgrid button{hyphens:manual;-webkit-hyphens:manual;text-align:center;line-height:1.2;}\n#moreSheet > .sp-sheet{margin-top:12px;}\n#moreSheet > .sp-sheet + .sp-sheet{margin-top:8px;}\n\n/* 5. Titel am Handy: lieber zwei Zeilen als abgeschnitten */\n@media (max-width:760px){\n  #pgTitle.n77-lang{white-space:normal!important;display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical;overflow:hidden;text-overflow:clip;font-size:17px!important;line-height:1.15;}\n}\n\n/* 2. Scouting am Handy: feste Reiter, der Rest unter „Mehr“ */\n.hub-in.n77-fest{overflow-x:hidden;flex-wrap:nowrap!important;justify-content:flex-start!important;}\n@media (min-width:761px){ .hub-in > button{padding-left:11px;padding-right:11px;} }\n.hub-in > button[hidden]{display:none!important;}\n.hub-in .n77-hm{font:inherit;font-size:13px;font-weight:700;color:var(--ink3);background:none;border:0;padding:11px 8px 10px 11px;white-space:nowrap;cursor:pointer;display:inline-flex;align-items:center;gap:4px;margin-left:auto;}\n.hub-in .n77-hm svg{width:14px;height:14px;transform:rotate(90deg);opacity:.8;}\n.hub-in .n77-hm[aria-expanded=\"true\"] svg{transform:rotate(-90deg);}\n.hub-in .n77-hm.on{color:var(--ink);}\n.hub-in .n77-hm:focus-visible{outline:2px solid var(--brand2);outline-offset:-2px;border-radius:8px;}\n.n77-menu{position:fixed;z-index:120;min-width:190px;max-width:calc(100vw - 16px);padding:6px;border-radius:14px;border:1px solid var(--line);background:var(--card,#141a28);box-shadow:0 12px 32px -8px rgba(0,0,0,.45);display:flex;flex-direction:column;}\n.n77-menu button{font:inherit;font-size:15px;font-weight:600;text-align:left;color:var(--ink);background:none;border:0;border-radius:10px;min-height:44px;padding:0 12px;cursor:pointer;}\n.n77-menu button:hover,.n77-menu button:focus-visible{background:rgba(148,163,196,.12);outline:none;}\n.n77-menu button.on{color:var(--brand2);}\nhtml[data-theme=\"hell\"] .n77-menu{background:#fffdf9;box-shadow:0 12px 32px -10px rgba(30,36,52,.25);}\nhtml[data-theme=\"hell\"] .n77-menu button.on{color:var(--brand);}\n\n/* 8. Leere Zustände */\n.n77-leer{display:flex;flex-direction:column;align-items:flex-start;gap:6px;padding:18px 16px;border:1px dashed var(--line);border-radius:14px;margin:6px 0;}\n.n77-leer b{font-size:15px;font-weight:650;color:var(--ink);}\n.n77-leer p{margin:0;font-size:14px;line-height:1.45;color:var(--ink2);max-width:60ch;}\n.n77-leer .btn{margin-top:6px;min-height:44px;}\n\n/* 10. Mein Konto: Hilfe und Über die App */\n.n77-links{display:flex;flex-wrap:wrap;gap:8px;}\n.n77-links .btn{display:inline-flex;align-items:center;gap:6px;min-height:44px;text-decoration:none;}\n.n77-links .btn svg{width:16px;height:16px;}\n.n77-tech{margin-top:12px;border-top:1px solid var(--line2);padding-top:8px;}\n.n77-tech>summary{cursor:pointer;min-height:44px;display:flex;align-items:center;font-size:14px;font-weight:600;color:var(--ink2);}\n.n77-tech>summary:focus-visible{outline:2px solid var(--brand2);outline-offset:2px;border-radius:6px;}\n.n77-tech .note{margin:4px 0;}\n"; document.head.appendChild(s); }catch(e){} })();
/* =====================================================================
   Beta 0.80/0.81 · Logo-Werkstatt (gemeinsam für Trikot- und Bandencreator)
   Ein Partnerlogo (PNG, JPG, SVG, Data-URL) wird im Browser analysiert und aufbereitet:
   - Hintergrund weg: weiße oder einfarbige Flächen am Rand werden durchsichtig (Flutfüllung vom Rand aus)
   - Zuschnitt auf das Logo (ohne leeren Rand)
   - Originalfarben: die wichtigsten Farben mit Anteil, hell oder dunkel, empfohlene Variante je Untergrund
   - Varianten: original, weiss, schwarz, farbe (beliebige Einfarbigkeit, z. B. Vereinsblau)
     Bei weiss/schwarz werden helle Innenflächen (z. B. weiße Schrift im farbigen Kasten) ausgespart, damit Details bleiben.
   Alles passiert auf dem Gerät, nichts verlässt den Browser.
   ===================================================================== */
const LOGO = (() => {
  const cache = new Map();
  function laden(src){
    if(cache.has(src)) return cache.get(src);
    const p = new Promise((ok, nein) => { const i = new Image(); i.decoding = 'async';
      if(!/^data:|^blob:/.test(src)) i.crossOrigin = 'anonymous';
      i.onload = () => ok(i); i.onerror = () => nein(new Error('Logo lässt sich nicht laden')); i.src = src; });
    cache.set(src, p); p.catch(() => cache.delete(src)); return p;
  }
  function leinwand(w, h){ const c = document.createElement('canvas'); c.width = Math.max(1, w | 0); c.height = Math.max(1, h | 0); return c; }
  function hex(r, g, b){ return '#' + [r, g, b].map(x => x.toString(16).padStart(2, '0')).join(''); }
  function lum(r, g, b){ const f = v => { v /= 255; return v <= .03928 ? v / 12.92 : Math.pow((v + .055) / 1.055, 2.4); }; return .2126 * f(r) + .7152 * f(g) + .0722 * f(b); }
  // Bild in eine Arbeitsfläche (höchstens 1200 px lange Seite, SVG ohne Maß bekommt 800 px)
  function raster(img, max = 1200){
    let w = img.naturalWidth || img.width || 800, h = img.naturalHeight || img.height || 400;
    const s = Math.min(1, max / Math.max(w, h)); w = Math.round(w * s); h = Math.round(h * s);
    const c = leinwand(w, h), x = c.getContext('2d', { willReadFrequently:true }); x.drawImage(img, 0, 0, w, h); return c;
  }
  // Hintergrund vom Rand her entfernen, wenn der Rand einfarbig ist (weiß, hellgrau oder eine Flächenfarbe)
  function freistellen(c, tol = 38){
    const x = c.getContext('2d', { willReadFrequently:true }), { width:w, height:h } = c, d = x.getImageData(0, 0, w, h), p = d.data;
    let rand = []; for(let i = 0; i < w; i++) rand.push(i, (h - 1) * w + i);
    for(let j = 1; j < h - 1; j++) rand.push(j * w, j * w + w - 1);
    // Alpha wird über die ganze Fläche geprüft, nicht nur an den Bildkanten.
    // Kleine Außenstreifen oder abgerundete Ecken einer sonst geschlossenen
    // Bildfläche sind noch kein freigestelltes Logo. Transparente Pixel zählen
    // bei der folgenden Farberkennung nie als schwarzer Hintergrund.
    let sichtbar = 0, x0 = w, y0 = h, x1 = -1, y1 = -1;
    for(let k = 0; k < w * h; k++){ if(p[k * 4 + 3] < 20) continue; sichtbar++;
      const xx = k % w, yy = (k / w) | 0; x0 = Math.min(x0, xx); y0 = Math.min(y0, yy); x1 = Math.max(x1, xx); y1 = Math.max(y1, yy); }
    const alpha = sichtbar < w * h;
    if(alpha){
      if(!sichtbar || sichtbar / ((x1 - x0 + 1) * (y1 - y0 + 1)) < .9) return { c, entfernt:false };
      rand = rand.filter(k => p[k * 4 + 3] >= 20);
      if(!rand.length) return { c, entfernt:false };
    }
    // häufigste Randfarbe
    const zaehl = new Map();
    rand.forEach(k => { const q = ((p[k * 4] >> 4) << 8) | ((p[k * 4 + 1] >> 4) << 4) | (p[k * 4 + 2] >> 4); zaehl.set(q, (zaehl.get(q) || 0) + 1); });
    let best = 0, bq = 0; zaehl.forEach((v, q) => { if(v > best){ best = v; bq = q; } });
    if(best / rand.length < .55) return { c, entfernt:false };
    let br = 0, bg = 0, bb = 0, bn = 0; rand.forEach(k => { const q = ((p[k * 4] >> 4) << 8) | ((p[k * 4 + 1] >> 4) << 4) | (p[k * 4 + 2] >> 4); if(q === bq){ br += p[k * 4]; bg += p[k * 4 + 1]; bb += p[k * 4 + 2]; bn++; } });
    br /= bn; bg /= bn; bb /= bn;
    const nah = k => p[k * 4 + 3] >= 20 && Math.abs(p[k * 4] - br) + Math.abs(p[k * 4 + 1] - bg) + Math.abs(p[k * 4 + 2] - bb) < tol * 1.6;
    // Eine einfarbige sichtbare Fläche mit Alpha-Rand kann selbst die Marke sein.
    if(alpha){ let anders = false; for(let k = 0; k < w * h; k++) if(p[k * 4 + 3] >= 20 && !nah(k)){ anders = true; break; }
      if(!anders) return { c, entfernt:false }; }
    const weg = new Uint8Array(w * h), st = []; rand.forEach(k => { if(nah(k)){ weg[k] = 1; st.push(k); } });
    while(st.length){ const k = st.pop(), xx = k % w, yy = (k / w) | 0;
      [[1, 0], [-1, 0], [0, 1], [0, -1]].forEach(([dx, dy]) => { const nx = xx + dx, ny = yy + dy; if(nx < 0 || ny < 0 || nx >= w || ny >= h) return; const n = ny * w + nx; if(!weg[n] && nah(n)){ weg[n] = 1; st.push(n); } }); }
    // weiche Kante: Pixel neben dem Hintergrund halb durchsichtig
    for(let k = 0; k < w * h; k++){ if(weg[k]){ p[k * 4 + 3] = 0; continue; }
      const xx = k % w, yy = (k / w) | 0; let n = 0; if(xx > 0 && weg[k - 1]) n++; if(xx < w - 1 && weg[k + 1]) n++; if(yy > 0 && weg[k - w]) n++; if(yy < h - 1 && weg[k + w]) n++;
      if(n) p[k * 4 + 3] = Math.min(p[k * 4 + 3], 255 - n * 45); }
    x.putImageData(d, 0, 0); return { c, entfernt:true, hintergrund:hex(br | 0, bg | 0, bb | 0) };
  }
  function zuschneiden(c, pad = .03){
    const x = c.getContext('2d', { willReadFrequently:true }), { width:w, height:h } = c, p = x.getImageData(0, 0, w, h).data;
    let x0 = w, y0 = h, x1 = -1, y1 = -1;
    for(let y = 0; y < h; y++) for(let i = 0; i < w; i++){ if(p[(y * w + i) * 4 + 3] > 24){ if(i < x0) x0 = i; if(i > x1) x1 = i; if(y < y0) y0 = y; if(y > y1) y1 = y; } }
    if(x1 < 0) return c;
    const m = Math.round(Math.max(x1 - x0, y1 - y0) * pad); x0 = Math.max(0, x0 - m); y0 = Math.max(0, y0 - m); x1 = Math.min(w - 1, x1 + m); y1 = Math.min(h - 1, y1 + m);
    const n = leinwand(x1 - x0 + 1, y1 - y0 + 1); n.getContext('2d').drawImage(c, x0, y0, n.width, n.height, 0, 0, n.width, n.height); return n;
  }
  // Farben zählen (grob in 4-Bit je Kanal), nur sichtbare Pixel
  function farben(c){
    const p = c.getContext('2d', { willReadFrequently:true }).getImageData(0, 0, c.width, c.height).data, m = new Map(); let n = 0;
    const schritt = Math.max(1, Math.floor(c.width * c.height / 60000));
    for(let k = 0; k < p.length / 4; k += schritt){ if(p[k * 4 + 3] < 128) continue; n++;
      const q = ((p[k * 4] >> 4) << 8) | ((p[k * 4 + 1] >> 4) << 4) | (p[k * 4 + 2] >> 4); const e = m.get(q) || { n:0, r:0, g:0, b:0 }; e.n++; e.r += p[k * 4]; e.g += p[k * 4 + 1]; e.b += p[k * 4 + 2]; m.set(q, e); }
    let L = [...m.values()].map(e => ({ r:e.r / e.n | 0, g:e.g / e.n | 0, b:e.b / e.n | 0, n:e.n }));
    // ähnliche Farben zusammenfassen
    const zus = []; L.sort((a, b) => b.n - a.n).forEach(f => { const z = zus.find(g => Math.abs(g.r - f.r) + Math.abs(g.g - f.g) + Math.abs(g.b - f.b) < 60); if(z){ z.n += f.n; } else zus.push({ ...f }); });
    return zus.filter(f => f.n / Math.max(1, n) > .015).slice(0, 6).map(f => ({ hex:hex(f.r, f.g, f.b), anteil:Math.round(f.n / Math.max(1, n) * 100), hell:lum(f.r, f.g, f.b) > .55 }));
  }
  // Einfarbig (0.81): Abstand zu Weiß als weiche Deckung. Farbiges und Dunkles wird voll, Weißes im Logo fällt weg (bleibt als Aussparung),
  // Kanten bleiben glatt. Ist das Logo selbst überwiegend hell (weiße Schrift), wird alles Sichtbare eingefärbt.
  const sst = (a, b, x) => { const t = Math.max(0, Math.min(1, (x - a) / (b - a))); return t * t * (3 - 2 * t); };
  function einfarbig(c, farbe, hintergrund){
    const n = leinwand(c.width, c.height), x = n.getContext('2d', { willReadFrequently:true }); x.drawImage(c, 0, 0);
    const d = x.getImageData(0, 0, n.width, n.height), p = d.data;
    let hell = 0, dunkel = 0; for(let k = 0; k < p.length; k += 4){ if(p[k + 3] < 128) continue; if(lum(p[k], p[k + 1], p[k + 2]) > .78) hell++; else dunkel++; }
    const nurHell = hell / Math.max(1, hell + dunkel) >= .6;
    const [r, g, b] = [1, 3, 5].map(i => parseInt(farbe.slice(i, i + 2), 16));
    const bg = /^#[0-9a-f]{6}$/i.test(hintergrund || '') ? [1, 3, 5].map(i => parseInt(hintergrund.slice(i, i + 2), 16)) : null;
    for(let k = 0; k < p.length; k += 4){ const a = p[k + 3] / 255; if(!a){ continue; }
      let deck = a;
      if(!nurHell){ const m = Math.min(p[k], p[k + 1], p[k + 2]) / 255 * a + (1 - a); deck = sst(.1, .42, 1 - m); }
      // Ein dunkler Bildhintergrund kann auch in geschlossenen Buchstaben oder einem Fenster liegen.
      // Nur die beim Freistellen erkannte Farbe aussparen, nicht pauschal alle dunklen Markenteile.
      if(bg) deck *= sst(16, 64, Math.abs(p[k] - bg[0]) + Math.abs(p[k + 1] - bg[1]) + Math.abs(p[k + 2] - bg[2]));
      p[k] = r; p[k + 1] = g; p[k + 2] = b; p[k + 3] = Math.round(deck * 255); }
    x.putImageData(d, 0, 0); return n;
  }
  // Mitgelieferte Logos (kit/logos/name.png) haben eine von Hand geprüfte weiße Fassung unter kit/logos/weiss/name.png
  function weissDatei(src){ const m = /^(.*?)(kit\/logos\/)([a-z0-9-]+)\.png(\?.*)?$/.exec(String(src || '')); return m ? m[1] + m[2] + 'weiss/' + m[3] + '.png' : null; }
  const merk = new Map();
  function sichtbar(c){ const p = c.getContext('2d', { willReadFrequently:true }).getImageData(0, 0, c.width, c.height).data;
    for(let i = 3; i < p.length; i += 4) if(p[i] > 24) return true; return false; }
  // Aufbereiten: freistellen, zuschneiden, analysieren. Ergebnis wird je Quelle gemerkt.
  async function aufbereiten(src){
    if(merk.has(src)) return merk.get(src);
    const pr = (async () => {
      const img = await laden(src); const r = raster(img);
      if(!sichtbar(r)) throw new Error('Die Logodatei enthält keine sichtbare Grafik. Bitte lade ein anderes Logo hoch.');
      const f = freistellen(r); const c = zuschneiden(f.c);
      if(!sichtbar(c)) throw new Error('Beim Freistellen bleibt keine sichtbare Marke übrig. Bitte nutze ein PNG mit transparentem Hintergrund.');
      const F = farben(c), dunkelAnteil = F.filter(x => !x.hell).reduce((s, x) => s + x.anteil, 0);
      return { quelle:src, c, breite:c.width, hoehe:c.height, seiten:c.width / Math.max(1, c.height), farben:F, hintergrundEntfernt:f.entfernt, hintergrund:f.hintergrund || null,
        hell:dunkelAnteil < 35, empfehlung: dunkelAnteil < 35 ? 'auf dunklem Grund im Original, sonst weiß' : 'auf hellem Grund im Original, auf Farbe weiß' };
    })();
    merk.set(src, pr); pr.catch(() => merk.delete(src)); return pr;
  }
  // Variante als Leinwand: original | weiss | schwarz | farbe:#rrggbb
  async function variante(src, art = 'original'){
    const a = await aufbereiten(src);
    if(art === 'original') return a.c;
    const k = art + '|' + src; if(merk.has(k)) return merk.get(k);
    const wd = art === 'weiss' && weissDatei(src);
    if(wd){ try{ const w = (await aufbereiten(wd)).c; merk.set(k, w); return w; }catch(e){ /* sonst selbst rechnen */ } }
    const farbe = art === 'weiss' ? '#ffffff' : art === 'schwarz' ? '#111111' : (art.startsWith('farbe:') ? art.slice(6) : '#ffffff');
    // Weiß ausgesparte Flächen können nach der Umfärbung leer sein. Den Druck dann erneut einpassen,
    // sonst bestimmt die frühere Fläche die Größe und das sichtbare Zeichen wird unnötig klein.
    const c = zuschneiden(einfarbig(a.c, farbe, a.hintergrund));
    if(!sichtbar(c)) throw new Error('Diese Logo-Fassung ist leer. Bitte wähle ein anderes Logo.');
    merk.set(k, c); return c;
  }
  async function alsDataUrl(src, art, max = 1024){
    const c = await variante(src, art); const s = Math.min(1, max / Math.max(c.width, c.height));
    if(s >= 1) return c.toDataURL('image/png'); const n = leinwand(c.width * s, c.height * s); n.getContext('2d').drawImage(c, 0, 0, n.width, n.height); return n.toDataURL('image/png');
  }
  // Datei vom Gerät (input type=file) als Data-URL, höchstens 2 MB
  function dateiLesen(f){ return new Promise((ok, nein) => { if(!f) return nein(new Error('Keine Datei'));
    if(!/^image\/(png|jpeg|webp|svg\+xml)$/.test(f.type)) return nein(new Error('Bitte ein Bild (PNG, JPG, WebP oder SVG)'));
    if(f.size > 2 * 1024 * 1024) return nein(new Error('Das Logo ist größer als 2 MB'));
    const r = new FileReader(); r.onload = () => ok(r.result); r.onerror = () => nein(new Error('Datei lässt sich nicht lesen')); r.readAsDataURL(f); }); }
  return { laden, aufbereiten, variante, alsDataUrl, dateiLesen, lum, hex };
})();

/* Trainingsanzug: dieselbe fotobasierte Ärmelvorlage für jede Firma.
   Originale bleiben erhalten. Das Logo wird schwarz auf den Stoff gesetzt. */
(function(root){
  'use strict';
  const SEITEN={
    aermel_l:{datei:'aermel-links.webp',feld:[[.503,.352],[.737,.370],[.755,.554],[.485,.542]]},
    aermel_r:{datei:'aermel-rechts.webp',feld:[[.257,.370],[.493,.352],[.514,.542],[.238,.554]]}
  };
  const cache=new Map();let zuletzt=null;
  function canvas(w,h){const c=document.createElement('canvas');c.width=w;c.height=h;return c;}
  function bild(src){if(cache.has(src))return cache.get(src);const p=new Promise((ok,nein)=>{const im=new Image();im.onload=()=>ok(im);im.onerror=()=>nein(Error('Die Anzugvorschau konnte nicht geladen werden. Bitte versuche es erneut.'));if(!/^data:|^blob:/.test(src))im.crossOrigin='anonymous';im.src=src;});cache.set(src,p);p.catch(()=>cache.delete(src));return p;}
  function feld(seite,w,h){const s=SEITEN[seite];if(!s)throw Error('Bitte einen linken oder rechten Ärmel wählen.');return s.feld.map(([x,y])=>[x*w,y*h]);}
  function punkt(q,u,v){return [(1-v)*((1-u)*q[0][0]+u*q[1][0])+v*((1-u)*q[3][0]+u*q[2][0]),(1-v)*((1-u)*q[0][1]+u*q[1][1])+v*((1-u)*q[3][1]+u*q[2][1])];}
  function aufdruck(x,im,q,seite,variante,trikot){const iw=im.naturalWidth||im.width,ih=im.naturalHeight||im.height,w=(Math.hypot(q[1][0]-q[0][0],q[1][1]-q[0][1])+Math.hypot(q[2][0]-q[3][0],q[2][1]-q[3][1]))/2,h=(Math.hypot(q[3][0]-q[0][0],q[3][1]-q[0][1])+Math.hypot(q[2][0]-q[1][0],q[2][1]-q[1][1]))/2,s=Math.min(w/iw,h/ih),uw=iw*s/w,vh=ih*s/h,u0=(1-uw)/2,v0=(1-vh)/2;
    // Ein durchgehender Aufdruck statt einzeln geglätteter Dreiecke: keine hellen Maschennähte im Logo.
    const r=[[u0,v0],[u0+uw,v0],[u0+uw,v0+vh],[u0,v0+vh]].map(([u,v])=>punkt(q,u,v)),ox=Math.floor(Math.min(...r.map(p=>p[0]))),oy=Math.floor(Math.min(...r.map(p=>p[1]))),W=Math.ceil(Math.max(...r.map(p=>p[0])))-ox,H=Math.ceil(Math.max(...r.map(p=>p[1])))-oy;
    // Vor dem Abtasten verkleinern: dünne Striche bleiben auch bei großen Originaldateien glatt.
    const sw=Math.min(iw,Math.max(1,Math.ceil(W*1.5))),sh=Math.max(1,Math.round(ih*sw/iw));
    const sc=canvas(sw,sh),sx=sc.getContext('2d');
    sx.imageSmoothingQuality='high';sx.drawImage(im,0,0,sw,sh);
    const maske=sx.getImageData(0,0,sw,sh).data;
    const stoff=x.getImageData(ox,oy,W,H),pixel=stoff.data;
    const licht=new Float32Array(W*H);
    for(let i=0;i<licht.length;i++)licht[i]=(pixel[i*4]+2*pixel[i*4+1]+pixel[i*4+2])/4;
    const mittel=licht.reduce((sum,l)=>sum+l,0)/licht.length;
    const A=r[0],B=[r[1][0]-A[0],r[1][1]-A[1]],C=[r[3][0]-A[0],r[3][1]-A[1]],D=[r[2][0]-r[1][0]-r[3][0]+A[0],r[2][1]-r[1][1]-r[3][1]+A[1]];
    const radius=Math.max(2,Math.round(x.canvas.width*.007));
    const hell=(px,py)=>licht[Math.min(H-1,Math.max(0,py))*W+Math.min(W-1,Math.max(0,px))];
    // Falten aus einer verkleinerten Lichtkarte ableiten. Einzelne Maschen dürfen
    // feine Buchstaben nicht verziehen, bleiben aber in der Druckhelligkeit sichtbar.
    let faltenLicht=hell;
    if(trikot){
      const klein=canvas(Math.max(2,Math.ceil(W/radius)),Math.max(2,Math.ceil(H/radius)));
      const k=klein.getContext('2d');k.imageSmoothingQuality='high';
      k.drawImage(x.canvas,ox,oy,W,H,0,0,klein.width,klein.height);
      const farben=k.getImageData(0,0,klein.width,klein.height).data;
      const wert=(a,b)=>{const i=(b*klein.width+a)*4;return (farben[i]+2*farben[i+1]+farben[i+2])/4;};
      faltenLicht=(px,py)=>{
        const u=Math.max(0,Math.min(klein.width-1,(px+.5)*klein.width/W-.5));
        const v=Math.max(0,Math.min(klein.height-1,(py+.5)*klein.height/H-.5));
        const a=Math.floor(u),b=Math.floor(v),a1=Math.min(klein.width-1,a+1),b1=Math.min(klein.height-1,b+1);
        const du=u-a,dv=v-b;
        return (wert(a,b)*(1-du)+wert(a1,b)*du)*(1-dv)+(wert(a,b1)*(1-du)+wert(a1,b1)*du)*dv;
      };
    }
    const aussen=seite==='aermel_r'?-1:1;
    // Projektion eines zylindrischen Ärmels, leicht von vorn gesehen. Die äußere Kante läuft um den Arm.
    const mitte=aussen*.16,halbwinkel=.75*uw;
    const links=Math.sin(mitte-halbwinkel),bogen=Math.sin(mitte+halbwinkel)-links;
    for(let py=0;py<H;py++)for(let px=0;px<W;px++){
      const X=ox+px+.5,Y=oy+py+.5;
      let u=(X-A[0])/B[0],v=(Y-A[1])/C[1];
      for(let i=0;i<5;i++){
        const ex=A[0]+B[0]*u+C[0]*v+D[0]*u*v-X,ey=A[1]+B[1]*u+C[1]*v+D[1]*u*v-Y;
        const du=[B[0]+D[0]*v,B[1]+D[1]*v],dv=[C[0]+D[0]*u,C[1]+D[1]*u],det=du[0]*dv[1]-dv[0]*du[1];
        if(Math.abs(det)<1e-8)break;
        u-=(ex*dv[1]-ey*dv[0])/det;v-=(ey*du[0]-ex*du[1])/det;
      }
      if(u<0||u>1||v<0||v>1)continue;
      const horizontal=(Math.asin(links+u*bogen)-mitte+halbwinkel)/(2*halbwinkel);
      const lx=faltenLicht(px+radius,py)-faltenLicht(px-radius,py),ly=faltenLicht(px,py+radius)-faltenLicht(px,py-radius);
      const kanten=4*u*(1-u), innen=4*v*(1-v);
      u=horizontal+kanten*lx*.00030;
      v+=innen*(.038*kanten+ly*.00040);
      const tx=Math.max(0,Math.min(sw-1,u*sw-.5)),ty=Math.max(0,Math.min(sh-1,v*sh-.5));
      const ix=Math.floor(tx),iy=Math.floor(ty),dx=tx-ix,dy=ty-iy;
      const texel=(xx,yy,c)=>maske[(yy*sw+xx)*4+c];
      const alpha=(xx,yy)=>texel(xx,yy,3)/255;
      const deckung=(alpha(ix,iy)*(1-dx)+alpha(Math.min(ix+1,sw-1),iy)*dx)*(1-dy)
        +(alpha(ix,Math.min(iy+1,sh-1))*(1-dx)+alpha(Math.min(ix+1,sw-1),Math.min(iy+1,sh-1))*dx)*dy;
      // Das schwarze Transfermaterial übernimmt Licht, Schatten und die feine Struktur des Fotos.
      const l=hell(px,py),detail=l-(hell(px-1,py)+hell(px+1,py)+hell(px,py-1)+hell(px,py+1))/4;
      const schwarz=Math.min(55,Math.max(9,12+(l-155)*.29+detail*.8));
      const pos=(py*W+px)*4;
      if(!deckung)continue;
      const gewebelicht=Math.max(.55,Math.min(1.03,.91+(l-mittel)/230+detail/420));
      for(let c=0;c<3;c++){
        let tinte=schwarz;
        if(variante!=='schwarz'){
          const farbe=(xx,yy)=>texel(xx,yy,c)*alpha(xx,yy);
          const x1=Math.min(ix+1,sw-1),y1=Math.min(iy+1,sh-1);
          const wert=((farbe(ix,iy)*(1-dx)+farbe(x1,iy)*dx)*(1-dy)
            +(farbe(ix,y1)*(1-dx)+farbe(x1,y1)*dx)*dy)/deckung;
          tinte=schwarz+(255-schwarz)*(wert/255)*gewebelicht;
        }
        pixel[pos+c]+=deckung*(tinte-pixel[pos+c]);
      }
    }
    x.putImageData(stoff,ox,oy);
  }
  const TRIKOT={
    heim:{datei:'heim.webp',feld:[[.331,.285],[.605,.312],[.591,.642],[.288,.606]]},
    auswaerts:{datei:'auswaerts.webp',feld:[[.324,.265],[.634,.285],[.630,.628],[.277,.617]]}
  };
  function trikotFeld(art,seite,w,h){
    const trikot=TRIKOT[art];
    if(!trikot||!SEITEN[seite])throw Error('Bitte Trikot und Ärmelseite wählen.');
    const q=trikot.feld.map(([u,v])=>[u*w,v*h]);
    return seite==='aermel_l'?[1,0,3,2].map(i=>[w-q[i][0],q[i][1]]):q;
  }
  async function druckbild(o,variante){
    if(o.logo){
      if(typeof LOGO==='undefined')throw Error('Die Logoaufbereitung wird noch geladen. Bitte versuche es erneut.');
      return bild(await LOGO.alsDataUrl(o.logo,variante,1600));
    }
    const c=canvas(1200,280),x=c.getContext('2d'),name=String(o.firma||'Euer Name').trim().slice(0,120);
    x.fillStyle=variante==='schwarz'?'#111':variante.startsWith('farbe:')?variante.slice(6):'#fff';
    x.textAlign='center';x.textBaseline='middle';x.font='700 100px BarlowC,Arial,sans-serif';
    const breite=x.measureText(name).width;
    if(breite>1120)x.font='700 '+Math.floor(100*1120/breite)+'px BarlowC,Arial,sans-serif';
    x.fillText(name,600,140);
    return c;
  }
  async function motiv(o,trikot){
    const seite=o.seite||'aermel_r',seitenDaten=SEITEN[seite];
    if(!seitenDaten)throw Error('Bitte einen linken oder rechten Ärmel wählen.');
    const w=Math.max(360,Math.min(1536,Math.round(+o.breite||1200))),h=Math.round(w*2/3);
    const c=canvas(w,h),x=c.getContext('2d'),kit=o.kit||'kit/';
    const foto=await bild(kit+(trikot?'trikot-aermel/'+trikot.datei:'anzug/'+seitenDaten.datei));
    const spiegeln=trikot&&seite==='aermel_l';
    x.save();
    if(spiegeln){x.translate(w,0);x.scale(-1,1);}
    x.drawImage(foto,0,0,w,h);x.restore();
    if(o.leer)return c;
    let q=trikot?trikotFeld(o.art||'heim',seite,w,h):feld(seite,w,h);
    const groesse=Math.max(.5,Math.min(1.5,Number(o.groesse)||1));
    // Beim Trikot umschreibt das Viereck die maximale freie Fläche bis zu den Nähten.
    const faktor=trikot?(groesse<=1?.8*groesse:.8+.4*(groesse-1)):Math.min(1.12,groesse);
    const rand=(1-faktor)/2;
    q=[[rand,rand],[1-rand,rand],[1-rand,1-rand],[rand,1-rand]].map(([u,v])=>punkt(q,u,v));
    const variante=trikot?(o.variante||'weiss'):'schwarz';
    aufdruck(x,await druckbild(o,variante),q,seite,variante,trikot);
