  const platz = teile.find(v => /^(KR|RP|HP)\s/i.test(v));
  let v = ((platz ? platz.replace(/^(KR|RP|HP)\s/i, '') : teile[0]) || 'SPIELORT FOLGT').replace(/\s*\([^)]*\)/g, '').trim();
  v = v.replace(/^(Sportplatz|Sportgel\u00e4nde|Stadion|Sportanlage)\s+/i, '').trim();   // das Wort steht schon im Label
  return v || 'SPIELORT FOLGT'; }

/* Der eigentliche Renderer: Zustand und Bilder kommen als Übergabe herein. */
function pkMalen(cv, S, A, skala){
  const [bw, bh] = PK_FORMATE[S.format] || PK_FORMATE.story, quer = S.format === 'quer', story = S.format === 'story';
  const ctx = cv.getContext('2d');
  cv.width = Math.round(bw * skala); cv.height = Math.round(bh * skala);
  ctx.setTransform(skala, 0, 0, skala, 0, 0); ctx.imageSmoothingEnabled = true; ctx.imageSmoothingQuality = 'high';
  const w = bw, h = bh, E = S.ebenen;
  /* Am Tag darf das Bild heller bleiben als am Flutlichtabend, sonst sieht jeder Spieltag nach Nacht aus. */
  const tags = (A.licht ? A.licht.stimmung : S.modus) !== 'night', dimm = tags ? .78 : 1;
  ctx.fillStyle = '#05101d'; ctx.fillRect(0, 0, w, h);

  if(E.foto && A.foto){ const f = Math.max(w / A.foto.width, h / A.foto.height), dw = A.foto.width * f, dh = A.foto.height * f;
    ctx.drawImage(A.foto, (w - dw) / 2, quer ? -(dh - h) * .78 : -(dh - h) * .62, dw, dh); }
  if(E.verlauf){
    const g1 = ctx.createLinearGradient(0, 0, w, 0); g1.addColorStop(0, 'rgba(2,9,18,.02)');
    g1.addColorStop(1, `rgba(2,9,18,${Math.min(.68, (+S.dunkel || 0) / 120 * dimm)})`); ctx.fillStyle = g1; ctx.fillRect(0, 0, w, h);
    const a = (v) => `rgba(2,9,18,${(v * dimm).toFixed(3)})`;
    const g2 = ctx.createLinearGradient(0, 0, 0, h); g2.addColorStop(0, a(.32)); g2.addColorStop(.28, a(.06));
    g2.addColorStop(.58, a(.12)); g2.addColorStop(.74, a(.40)); g2.addColorStop(.88, a(.52));
    g2.addColorStop(1, a(.22)); ctx.fillStyle = g2; ctx.fillRect(0, 0, w, h); }

  const rand = w * .05, inhalt = w - rand * 2;
  const warm = '#f1efe9', blau = S.blau || '#0757cb';

  /* Absender und Claim: rechts oben, sehr kleine weit gesperrte Versalien, der Claim deutlich leiser */
  if(E.marke){
    /* Story: unter der Profilzeile von Instagram (oben gut 13 % frei), Quer: rechts über den Wappen */
    const ax = w - rand, ay = quer ? h * .135 : story ? h * .118 : h * .098;
    const ag = quer ? 34 : story ? 31 : 32;
    pkGesperrt(ctx, S.absender, ax, ay, ag, warm, ag * .34, 'right', inhalt * .70, 600);
    const cg = quer ? 26 : story ? 24 : 25, cz = cg * 1.62;
    (S.claim || []).slice(0, 3).forEach((z, i) =>
      pkGesperrt(ctx, z, ax, ay + (quer ? 52 : 60) + i * cz, cg, 'rgba(203,212,220,.82)', cg * .40, 'right', inhalt * .70, 400));
  }

  /* Headline: zwei bündige Zeilen, sehr enger Abstand, ohne Kontur und ohne Schlagschatten.
     Die Vorlage setzt den Block etwas rechts der Mitte; das Bild gleicht das aus. */
  const erstes = S.heim ? 'HEIM' : 'AUSWÄRTS';
  /* Quer (seit 0.73): Headline groß als linke Spalte, Wappen rechts daneben. Story: größer und höher, unten bleibt Platz für die Antwortleiste. */
  const kopfOben = quer ? h * .255 : story ? h * .228 : h * .235;
  let h1 = quer ? h * .215 : story ? h * .128 : h * .140;
  let h2 = quer ? h * .210 : story ? h * .125 : h * .137;
  const spalt = h * (quer ? .012 : .009);
  const maxB = quer ? w * .40 : S.heim ? inhalt * .92 : inhalt;
  { const gr = 1 - PK_STAUCH, n1 = pkKopfVerhaeltnis(erstes) * h1, n2 = pkKopfVerhaeltnis('SPIEL') * h2;   // zu breit: kleiner statt gequetscht
    const f = Math.min(1, maxB / (n1 * gr), maxB / (n2 * gr)); h1 *= f; h2 *= f; }
  const kopfB = pkKopfSatz(erstes, h1, 'SPIEL', h2, maxB);
  const kopfX = quer ? rand + w * .01 : rand + (inhalt - kopfB) * .52;
  let kopfUnten = kopfOben + h1 + spalt + h2;
  if(E.titel){
    pkKopf(ctx, erstes, kopfX, kopfOben, kopfB, h1, warm, +S.patina || 0, skala);
    pkKopf(ctx, 'SPIEL', kopfX, kopfOben + h1 + spalt, kopfB, h2, blau, +S.patina || 0, skala);
  }

  /* Wappen: links Gastgeber, rechts Gast, dazwischen ein kleines VS. mit zwei feinen Schrägen */
  const wOben = quer ? h * .345 : kopfUnten + (story ? h * .034 : h * .036);
  const wHoehe = quer ? h * .265 : story ? h * .150 : h * .142;
  const mitte = quer ? w * .735 : w * .50, lueck = quer ? w * .075 : w * .105;
  const feld = quer ? (w - rand - (mitte + lueck / 2)) : (inhalt - lueck) / 2;
  const linksX = mitte - lueck / 2 - feld, rechtsX = mitte + lueck / 2;
  if(E.wappen){
    pkWappenMalen(ctx, S.heim ? A.eigen : A.gegner, linksX, wOben, feld, wHoehe);
    pkWappenMalen(ctx, S.heim ? A.gegner : A.eigen, rechtsX, wOben, feld, wHoehe);
    pkFett(ctx, 'VS.', mitte, wOben + wHoehe * .60, quer ? 56 : 50, '#f5f4ef', 160, 'center');
    ctx.strokeStyle = 'rgba(217,223,224,.46)'; ctx.lineWidth = Math.max(1, w / 900);
    ctx.beginPath(); ctx.moveTo(mitte + wHoehe * .10, wOben + wHoehe * .02); ctx.lineTo(mitte + wHoehe * .02, wOben + wHoehe * .28);
    ctx.moveTo(mitte - wHoehe * .02, wOben + wHoehe * .72); ctx.lineTo(mitte - wHoehe * .10, wOben + wHoehe * .98); ctx.stroke();
    const nyY = wOben + wHoehe + (quer ? 62 : story ? 56 : 50);
    const links = (S.heim ? S.absender : S.gegner || '').toUpperCase(), rechts = (S.heim ? S.gegner || '' : S.absender).toUpperCase();
    const ng = quer ? 34 : story ? 34 : 33;
    pkGesperrt(ctx, links, linksX + feld / 2, nyY, ng, '#ffffff', ng * .10, 'center', feld * 1.06, 600);
    pkGesperrt(ctx, rechts, rechtsX + feld / 2, nyY, ng, '#ffffff', ng * .10, 'center', feld * 1.06, 600);
  }

  /* Informationsreihe: drei Gruppen aus Icon, kleinem Label und kräftigem Wert, mit feinen Trennern */
  if(E.daten){
    const dy = quer ? h * .862 : story ? h * .800 : h * .825;
    const gesamt = inhalt, spalte = gesamt / 3, isz = quer ? 60 : 50;
    let d = null; try{ d = new Date(S.datum + 'T12:00:00'); }catch(e){}
    const gut = d && !isNaN(d.getTime());
    const label = [gut ? d.toLocaleDateString('de-DE', { weekday:'long' }).toUpperCase() : 'SPIELTAG', 'ANSTOSS', 'SPORTPLATZ'];
    const wert = [gut ? d.toLocaleDateString('de-DE') : 'TERMIN FOLGT', (S.zeit || '--:--') + ' UHR', pkOrtKurz(S.ort).toUpperCase()];
    for(let i = 0; i < 3; i++){
      const x = rand + i * spalte;
      pkIcon(ctx, ['kalender','uhr','ort'][i], x, dy - isz * .88, isz, '#f3f2ed');
      const tx = x + isz + (quer ? 18 : 15);
      pkGesperrt(ctx, label[i], tx, dy - (quer ? 30 : 26), quer ? 25 : 22, 'rgba(206,212,216,.92)', 2.4, 'left', spalte - isz - 34, 400);
      pkFett(ctx, wert[i], tx, dy + (quer ? 14 : 12), quer ? 44 : 38, '#f7f6f0', spalte - isz - 30);
      if(i < 2){ ctx.strokeStyle = 'rgba(226,229,224,.38)'; ctx.lineWidth = Math.max(1, w / 1000);
        ctx.beginPath(); ctx.moveTo(x + spalte - 16, dy - isz * .95); ctx.lineTo(x + spalte - 16, dy + 24); ctx.stroke(); }
    }
  }
  if(E.spruch){ const sg = quer ? 26 : story ? 23 : 24;
    ctx.save(); ctx.shadowColor = 'rgba(3,10,20,.75)'; ctx.shadowBlur = sg * .9;
    pkGesperrt(ctx, S.spruch, w * .5, quer ? h * .952 : story ? h * .862 : h * .928, sg, 'rgba(226,230,234,.95)', sg * .42, 'center', inhalt, 600);
    ctx.restore(); }
}

/* ---------- Begleittexte ---------- */
function pkTexteBauen(){
  const S = PK.s; let d = null; try{ d = new Date(S.datum + 'T12:00:00'); }catch(e){}
  const gut = d && !isNaN(d.getTime());
  const heuteIso = new Intl.DateTimeFormat('en-CA', { timeZone:'Europe/Berlin', year:'numeric', month:'2-digit', day:'2-digit' }).format(new Date());
  const diff = gut ? Math.round((new Date(S.datum) - new Date(heuteIso)) / 86400000) : 9;
  const wann = diff === 0 ? 'Heute' : diff === 1 ? 'Morgen' : gut ? 'Am ' + d.toLocaleDateString('de-DE', { weekday:'long', day:'numeric', month:'long' }) : 'Demnächst';
  const L = pkLicht(S.datum, S.zeit, S.modus), anlass = S.heim ? 'Heimspiel' : 'Auswärtsspiel';
  const auftakt = L.stimmung === 'night' ? anlass + ' unter Flutlicht!' : (gut && d.getDay() === 0) ? anlass + ' am Sonntag!'
    : L.stimmung === 'autumn' ? anlass + ' im Fußballherbst!' : L.stimmung === 'winter' ? 'Gemeinsam in den Winterspieltag!' : anlass + ', gemeinsam an den Platz!';
  const rumpf = `${wann} ${S.heim ? 'empfängt' : 'trifft'} ${String(S.mannschaft).replace(/^Unsere /, 'unsere ')} ${S.heim ? 'den' : 'auf den'} ${S.gegner || 'Gegner'}. Anstoß ist um ${S.zeit || '--:--'} Uhr.\n📍 ${S.ort || 'Spielort wird noch bestätigt'}`;
  const ruf = S.heim ? 'Kommt an den Platz und unterstützt unsere Jungs! Bringt Freunde und Familie mit und sagt es gerne weiter.'
    : 'Begleitet unsere Jungs und unterstützt sie auch auswärts! Gemeinsam zeigen wir, dass der ganze Verein hinter der Mannschaft steht.';
  const lang = `Es wäre richtig klasse, wenn möglichst viele von euch dabei sind. Die Mannschaft soll spüren, dass der ganze Verein hinter ihr steht. Jeder von euch am Spielfeldrand macht einen Unterschied.\n\n${ruf}\n\nWir freuen uns auf einen schönen Fußball${L.stimmung === 'night' ? 'abend' : 'tag'} mit euch und drücken unseren Jungs die Daumen! 💙🧡`;
  const schluss = `Bis ${diff === 0 ? 'nachher' : diff === 1 ? 'morgen' : 'zum Spiel'} am Platz! ⚽`;
  const mitte = S.ton === 'kurz' ? ruf : S.ton === 'energie' ? 'Ein Verein. Eine Mannschaft. Eure Unterstützung! ⚽\n\n' + ruf + '\n\nLasst uns gemeinsam alles geben! 💙🧡' : lang;
  PK.texte.post = `💙🧡 ${auftakt}\n\n${rumpf}\n\n${mitte}\n\n${schluss}`;
  PK.texte.whatsapp = `💙🧡 ${auftakt}\n\n${rumpf}\n\n${ruf}`;
  PK.texte.story = `${S.heim ? 'HEIMSPIEL' : 'AUSWÄRTSSPIEL'} ⚽\n${S.gegner || 'Gegner'}\n${gut ? d.toLocaleDateString('de-DE', { weekday:'short', day:'2-digit', month:'2-digit' }) : S.datum}  ${S.zeit || ''} Uhr\n📍 ${S.ort || 'Spielort folgt'}\n💙🧡 Gemeinsam hinter unserer Mannschaft!`;
}

/* =====================================================================
   Sportzentrale Beta 0.60 · Spieltagsstudio, Teil 2: Oberfläche, Export, Wappenbibliothek
   ===================================================================== */
SV_TBL.plakat = ['camera', 'Spieltagsstudio'];
Object.assign(SV_PAGES, { plakat:['Spieltagsstudio', 'Plakate zum Spieltag für Instagram, Facebook und WhatsApp'] });
{ const _ta57 = svTabAllowed; svTabAllowed = function(t){ if(t === 'plakat') return pkDarf(); return _ta57.apply(this, arguments); }; }
function pkNavVis(){ try{ const ok = pkDarf();
  document.querySelectorAll('.snav button[data-tab="plakat"],.sgrid [data-sheet="plakat"]').forEach(b => b.style.display = ok ? '' : 'none'); }catch(e){} }
if(typeof sv4NavVis === 'function'){ const _nv57 = sv4NavVis; sv4NavVis = function(){ const r = _nv57.apply(this, arguments); pkNavVis(); return r; }; }

function pkSchriften(){ return pkFontsLaden(); }
function pkPanel(){ let P = document.getElementById('panel-plakat'); if(P) return P;
  const ref = document.getElementById('panel-home') || document.querySelector('.panel'); if(!ref) return null;
  P = document.createElement('section'); P.className = 'panel'; P.id = 'panel-plakat'; ref.parentNode.insertBefore(P, ref.nextSibling); return P; }
{ const _gt57 = goTab; goTab = function(tab){ if(tab === 'plakat') pkPanel(); const war = svCurTab(); const r = _gt57.apply(this, arguments);
  try{ const jetzt = svCurTab(); if(jetzt === 'plakat' && war !== 'plakat') pkStart(); if(jetzt !== 'plakat' && war === 'plakat') pkMerken(true); }
  catch(e){ console.warn('Spieltagsstudio', e); } return r; }; }

/* ---------- Seite ---------- */
async function pkStart(){
  const P = pkPanel(); if(!P) return;
  if(!pkDarf()){ P.innerHTML = '<div class="card"><div class="empty">Das Spieltagsstudio sehen Admin, Vorstand und Planer.</div></div>'; return; }
  if(PK.laedt) return;
  P.innerHTML = '<div class="card"><div class="empty">Lade Spielplan und Wappen …</div></div>';
  PK.laedt = true;
  try{ await Promise.all([pkFontsLaden(), pkBib(), pkSpieleLaden(), sbBibLaden()]); }
  catch(e){ console.warn('Spieltagsstudio laden', e); }
  finally{ PK.laedt = false; }
  pkOberflaeche(P);
  if(PK.spiele.length) await pkSpielWaehlen(0); else { pkTexteBauen(); pkZeichnen(); pkTexteZeigen(); }
}

function pkOberflaeche(P){
  const opt = (v, t, an) => `<option value="${pkEsc(v)}"${an ? ' selected' : ''}>${pkEsc(t)}</option>`;
  const spiele = PK.spiele.map((g, i) => opt(i, `${g.datum.split('-').reverse().join('.')} · ${g.heim ? 'H' : 'A'} · ${g.gegner}`)).join('');
  const formate = Object.entries(PK_FORMATE).map(([k, v]) => `<button type="button" class="btn sm ghost pk-fmt${PK.format === k ? ' on' : ''}" data-fmt="${k}">${pkEsc(v[2])}</button>`).join('');
  const ebenen = PK_EBENEN.map(([k, t]) => `<label class="pk-eb"><input type="checkbox" data-eb="${k}"${PK.s.ebenen[k] ? ' checked' : ''}><span>${pkEsc(t)}</span></label>`).join('');
  P.innerHTML = `
  <div class="pk-wrap">
    <div class="card pk-vorschau">
      <div class="pk-buehne"><canvas id="pkCanvas" aria-label="Vorschau des Plakats"></canvas></div>
      <div class="pk-unten">
        <div class="pk-fmts">${formate}</div>
        <div class="pk-aktion">
          <span class="pk-masse" id="pkMasse"></span>
          <button type="button" class="btn sm" id="pkExport">${SVI('download')} PNG laden</button>
        </div>
      </div>
      <p class="pk-licht" id="pkLicht"></p>
    </div>

    <div class="card pk-steuer">
      <div class="pk-seg" role="tablist">
        <button type="button" role="tab" class="on" data-pkv="spiel">Spiel</button>
        <button type="button" role="tab" data-pkv="look">Aussehen</button>
        <button type="button" role="tab" data-pkv="text">Texte</button>
        <button type="button" role="tab" data-pkv="bib">Wappen</button>
      </div>
      <div class="pk-body" id="pkBody"></div>
    </div>
  </div>
  <div class="pk-vorlagen" hidden>
    <div data-pkp="spiel">
      <label class="pk-f"><span>Spiel aus dem Spielplan</span>
        <select id="pkSpiel">${spiele || opt('', 'Keine kommenden Spiele gefunden')}</select></label>
      <p class="pk-hint" id="pkQuelle"></p>
      <div class="pk-zwei">
        <label class="pk-f"><span>Heim oder auswärts</span><select id="pkHeim">${opt('true', 'Heimspiel', true)}${opt('false', 'Auswärtsspiel')}</select></label>
        <label class="pk-f"><span>Mannschaft</span><input id="pkMann" maxlength="40"></label>
      </div>
      <label class="pk-f"><span>Gegner</span><input id="pkGegner" maxlength="60" list="pkClubs"></label>
      <datalist id="pkClubs"></datalist>
      <div class="pk-zwei">
        <label class="pk-f"><span>Datum</span><input id="pkDatum" type="date"></label>
        <label class="pk-f"><span>Anstoß</span><input id="pkZeit" type="time"></label>
      </div>
      <label class="pk-f"><span>Spielort</span><input id="pkOrt" maxlength="120" placeholder="Sportplatz Mörlenbach"></label>
      <p class="pk-hint" id="pkOrtHint"></p>
      <label class="pk-f"><span>Lichtstimmung</span><select id="pkModus">
        ${opt('auto', 'Automatisch nach Termin', true)}${opt('spring', 'Frühling, Tageslicht')}${opt('summer', 'Sommer, Tageslicht')}${opt('autumn', 'Herbst')}${opt('winter', 'Winter')}${opt('night', 'Flutlicht')}</select></label>
    </div>
    <div data-pkp="look">
      <div class="pk-f"><span>Hintergrund</span></div>
      <div class="pk-galerie" id="pkGalerie" role="list"></div>
      <p class="pk-hint" id="pkGalerieHint"></p>
      <label class="btn sm ghost sb-up">${SVI('upload')} <span data-sbt>Eigenes Foto hochladen</span><input type="file" id="pkUpFoto" accept="image/*" hidden></label>
      <div class="pk-zwei">
        <label class="pk-f"><span>Vereinsblau</span><input id="pkBlau" type="color"></label>
        <label class="pk-f"><span>Orange</span><input id="pkOrange" type="color"></label>
      </div>
      <label class="pk-f"><span>Dunkler Verlauf <b id="pkDunkelW"></b></span><input id="pkDunkel" type="range" min="0" max="70"></label>
      <label class="pk-f"><span>Patina in der Schrift <b id="pkPatinaW"></b></span><input id="pkPatina" type="range" min="0" max="70"></label>
      <p class="pk-hint">Bei 0 ist die Schrift vollständig sauber. Die Patina sitzt nur in den Buchstaben, nicht in Wappen, Namen oder Terminzeile.</p>
      <label class="pk-f"><span>Absender</span><input id="pkAbsender" maxlength="40"></label>
      <label class="pk-f"><span>Claim, drei Zeilen</span><textarea id="pkClaim" rows="3"></textarea></label>
      <label class="pk-f"><span>Motto unten</span><input id="pkSpruch" maxlength="60"></label>
      <div class="pk-ebenen">${ebenen}</div>
      <div class="pk-uploads">
        <label class="btn sm ghost">Eigenes Wappen<input type="file" id="pkUpEigen" accept="image/*" hidden></label>
        <label class="btn sm ghost">Gegnerwappen<input type="file" id="pkUpGegner" accept="image/*" hidden></label>
        <button type="button" class="btn sm ghost" id="pkReset">Zurücksetzen</button>
      </div>
    </div>
    <div data-pkp="text">
      <label class="pk-f"><span>Tonfall</span><select id="pkTon">
        ${opt('normal', 'Ausführlich', true)}${opt('kurz', 'Kurz')}${opt('energie', 'Anfeuernd')}</select></label>
      <button type="button" class="btn sm ghost" id="pkTexteNeu">Texte neu erzeugen</button>
      <p class="pk-hint">Änderst du Spieldaten, werden die Texte neu geschrieben. Eigene Änderungen danach vornehmen.</p>
      ${[['post','Instagram und Facebook'],['whatsapp','WhatsApp'],['story','Story']].map(([k, t]) => `
      <div class="pk-box"><div class="pk-box-k"><b>${pkEsc(t)}</b><button type="button" class="btn sm ghost" data-kopie="${k}">Kopieren</button></div>
        <textarea data-text="${k}" rows="${k === 'post' ? 9 : 5}"></textarea></div>`).join('')}
    </div>
    <div data-pkp="bib">
      <label class="pk-f"><span>Suchen</span><input id="pkSuche" placeholder="Verein"></label>
      <p class="pk-hint" id="pkBibZahl"></p>
      <div class="pk-karten" id="pkKarten"></div>
    </div>
  </div>`;
  pkBindenRahmen(P); pkAnsicht('spiel');
}

function pkAnsicht(v){
  const B = document.getElementById('pkBody'), q = document.querySelector(`.pk-vorlagen [data-pkp="${v}"]`); if(!B || !q) return;
  document.querySelectorAll('.pk-seg [data-pkv]').forEach(b => b.classList.toggle('on', b.dataset.pkv === v));
  B.replaceChildren(); B.appendChild(q.cloneNode(true));
  PK.ansicht = v; pkBindenBody(); }

function pkBindenRahmen(P){
  P.querySelectorAll('.pk-seg [data-pkv]').forEach(b => b.onclick = () => pkAnsicht(b.dataset.pkv));
  P.querySelectorAll('.pk-fmt').forEach(b => b.onclick = () => { PK.format = b.dataset.fmt;
    P.querySelectorAll('.pk-fmt').forEach(x => x.classList.toggle('on', x === b)); pkZeichnen(); pkMerken(); });
  const ex = document.getElementById('pkExport'); if(ex) ex.onclick = pkExport; }

function pkWert(id, v){ const e = document.getElementById(id); if(e && v !== undefined && v !== null) e.value = v; return e; }
function pkBindenBody(){
  const S = PK.s;
  if(PK.ansicht === 'spiel'){
    const sel = pkWert('pkSpiel'); if(sel){ if(PK.gewaehltIdx != null) sel.value = String(PK.gewaehltIdx); sel.onchange = () => pkSpielWaehlen(+sel.value); }
    pkWert('pkHeim', String(S.heim)); pkWert('pkMann', S.mannschaft); pkWert('pkGegner', S.gegner);
    pkWert('pkDatum', S.datum); pkWert('pkZeit', S.zeit); pkWert('pkOrt', S.ort); pkWert('pkModus', S.modus);
    const dl = document.getElementById('pkClubs');
    if(dl && PK.bib) dl.replaceChildren(...(PK.bib.wappen || []).map(x => { const o = document.createElement('option'); o.value = x.name; return o; }));
    const an = (id, f) => { const e = document.getElementById(id); if(e) e.oninput = () => { f(e.value); PK.frei = true; pkTexteBauen(); pkTexteZeigen(); pkAssetsNeu(); pkMerken(); }; };
    an('pkHeim', v => S.heim = v === 'true'); an('pkMann', v => S.mannschaft = v); an('pkGegner', v => { S.gegner = v; delete PK.eigene.gegner; });
    an('pkDatum', v => S.datum = v); an('pkZeit', v => S.zeit = v); an('pkOrt', v => S.ort = v); an('pkModus', v => S.modus = v);
    const h = document.getElementById('pkHeim'); if(h) h.onchange = h.oninput;
    const m = document.getElementById('pkModus'); if(m) m.onchange = m.oninput;
    pkOrtHinweis();
  }
  if(PK.ansicht === 'look'){
    pkWert('pkBlau', S.blau); pkWert('pkOrange', S.orange); pkWert('pkDunkel', S.dunkel); pkWert('pkPatina', S.patina);
    pkWert('pkAbsender', S.absender); pkWert('pkClaim', (S.claim || []).join('\n')); pkWert('pkSpruch', S.spruch);
    const z = (id, f) => { const e = document.getElementById(id); if(e) e.oninput = () => { f(e.value); pkZeichnen(); pkMerken(); }; };
    z('pkBlau', v => S.blau = v); z('pkOrange', v => S.orange = v);
    z('pkDunkel', v => { S.dunkel = +v; const b = document.getElementById('pkDunkelW'); if(b) b.textContent = v; });
    z('pkPatina', v => { S.patina = +v; const b = document.getElementById('pkPatinaW'); if(b) b.textContent = v; });
    z('pkAbsender', v => S.absender = v); z('pkSpruch', v => S.spruch = v);
    z('pkClaim', v => S.claim = v.split('\n').slice(0, 3));
    const dw = document.getElementById('pkDunkelW'), pw = document.getElementById('pkPatinaW');
    if(dw) dw.textContent = S.dunkel; if(pw) pw.textContent = S.patina;
    document.querySelectorAll('[data-eb]').forEach(i => { i.checked = !!S.ebenen[i.dataset.eb];
      i.onchange = () => { S.ebenen[i.dataset.eb] = i.checked; pkZeichnen(); pkMerken(); }; });
    pkGalerie();
    for(const [id, k] of [['pkUpFoto','foto'],['pkUpEigen','eigen'],['pkUpGegner','gegner']]){
      const e = document.getElementById(id); if(!e) continue;
      // 0.99.21: das eigene Foto wird im Bildpool gespeichert und steht danach allen zur Auswahl
      if(k === 'foto'){ e.onchange = async ev => { const f = ev.target.files && ev.target.files[0]; if(!f) return;
          sbKnopf(e, true); const r = await sbHochladen(f); sbKnopf(e, false); e.value = '';
          if(r.ok){ S.foto = 'bib:' + r.eintrag.pfad; delete PK.eigene.foto; pkGalerie(); await pkAssetsNeu(); pkMerken(); kToast(SB_GESPEICHERT); return; }
          if(r.grund !== 'recht'){ kToast(r.text); return; }
          const rd = new FileReader(); rd.onload = () => { PK.eigene.foto = rd.result; pkGalerie(); pkAssetsNeu(); kToast('Dein Foto bleibt nur auf diesem Gerät. ' + r.text); }; rd.readAsDataURL(f); };
        continue; }
      e.onchange = ev => { const f = ev.target.files && ev.target.files[0]; if(!f) return;
        if(f.size > 6 * 1024 * 1024){ kToast('Das Bild ist größer als 6 MB'); return; }
        const r = new FileReader(); r.onload = () => { PK.eigene[k] = r.result; pkAssetsNeu(); }; r.readAsDataURL(f); };
    }
    const rs = document.getElementById('pkReset'); if(rs) rs.onclick = () => { PK.eigene = {};
      Object.assign(S, { blau:'#0757cb', orange:'#ff891c', dunkel:18, patina:26, modus:'auto', foto:'' });
      PK_EBENEN.forEach(([k]) => S.ebenen[k] = true); pkAnsicht('look'); pkAssetsNeu(); pkMerken(); };
  }
  if(PK.ansicht === 'text'){
    pkWert('pkTon', S.ton); pkTexteZeigen();
    const t = document.getElementById('pkTon'); if(t) t.onchange = () => { S.ton = t.value; pkTexteBauen(); pkTexteZeigen(); pkMerken(); };
    const n = document.getElementById('pkTexteNeu'); if(n) n.onclick = () => { pkTexteBauen(); pkTexteZeigen(); pkMerken(); };
    document.querySelectorAll('[data-text]').forEach(a => a.oninput = () => { PK.texte[a.dataset.text] = a.value; pkMerken(); });
    document.querySelectorAll('[data-kopie]').forEach(b => b.onclick = async () => {
      const a = document.querySelector(`[data-text="${b.dataset.kopie}"]`); if(!a) return;
      try{ await navigator.clipboard.writeText(a.value); kToast('Text kopiert'); }
      catch(e){ a.focus(); a.select(); kToast('Text ist markiert, bitte kopieren'); } });
  }
  if(PK.ansicht === 'bib'){ pkBibZeigen();
    const s = document.getElementById('pkSuche'); if(s) s.oninput = pkBibZeigen; }
}

function pkOrtHinweis(){ const e = document.getElementById('pkOrtHint'); if(!e) return;
  e.textContent = PK.s.ort ? 'Spielort gespeichert, alle im Team sehen denselben Stand.' : 'Spielort bitte ergänzen, sonst steht auf dem Plakat „Spielort folgt“.'; }

function pkTexteZeigen(){ document.querySelectorAll('[data-text]').forEach(a => { if(a.value !== PK.texte[a.dataset.text]) a.value = PK.texte[a.dataset.text] || ''; }); }

function pkBibZeigen(){
  const box = document.getElementById('pkKarten'), zahl = document.getElementById('pkBibZahl'); if(!box || !PK.bib) return;
  const q = pkNorm(document.getElementById('pkSuche') ? document.getElementById('pkSuche').value : '');
  const liste = (PK.bib.wappen || []).filter(x => !q || pkNorm(x.name).includes(q));
  const art = a => a === 'ai-restored' ? 'Hier wiederhergestellt' : a === 'contour-clipped' ? 'Außenkontur geprüft' : 'Originalquelle geprüft';
  box.innerHTML = liste.map(x => `<article class="pk-karte">
    <img src="plakat/wappen/${pkEsc(x.datei)}" alt="${pkEsc(x.name)}" loading="lazy">
    <h4>${pkEsc(x.name)}</h4>
    <p>${x.breite || '?'} × ${x.hoehe || '?'} px · ${pkEsc(art(x.art))}</p>
    <p class="pk-hint">Innenflächen unverändert${x.notiz ? '. ' + pkEsc(x.notiz) : ''}</p>
    <div><button type="button" class="btn sm ghost" data-nehmen="${pkEsc(x.name)}">Als Gegner nehmen</button>
      <a class="btn sm ghost" href="plakat/wappen/${pkEsc(x.datei)}" download="${pkEsc(x.slug)}-wappen">Datei laden</a></div></article>`).join('')
    || '<div class="empty">Kein Wappen gefunden.</div>';
  if(zahl) zahl.textContent = `${(PK.bib.wappen || []).length} geprüfte Wappen. Fehlheim liegt ausschließlich als geprüfte Fassung vor.`;
  box.querySelectorAll('[data-nehmen]').forEach(b => b.onclick = () => { PK.s.gegner = b.dataset.nehmen; delete PK.eigene.gegner;
    PK.frei = true; pkTexteBauen(); pkAssetsNeu(); pkMerken(); kToast(b.dataset.nehmen + ' übernommen'); pkAnsicht('spiel'); }); }

/* ---------- Spielwahl und Zeichnen ---------- */
async function pkSpielWaehlen(i){
  const g = PK.spiele[+i]; if(!g) return;
  PK.gewaehltIdx = +i; PK.gewaehlt = g.id; PK.frei = false;
  Object.assign(PK.s, { heim:g.heim, gegner:g.gegner, datum:g.datum, zeit:g.zeit, sub:g.sub, modus:'auto', foto:'' });
  PK.s.mannschaft = g.sub === 'A' ? 'Unsere Erste' : g.sub === 'D2' ? 'Unsere Zweite' : 'Unsere Mannschaft';
  PK.s.ort = g.heim ? 'Sportplatz Mörlenbach' : '';
  const stand = await pkStandLaden(g.id);
  PK.serverStand = stand;
  if(stand){
    if(stand.spielort) PK.s.ort = stand.spielort;
    const e = stand.einstell || {};
    ['blau','orange','modus','ton','spruch','foto'].forEach(k => { if(e[k] != null) PK.s[k] = e[k]; });
    ['dunkel','patina'].forEach(k => { if(e[k] != null) PK.s[k] = +e[k]; });
    if(e.ebenen) Object.assign(PK.s.ebenen, e.ebenen);
    if(e.format && PK_FORMATE[e.format]) PK.format = e.format;
  }
  pkTexteBauen();
  if(stand && stand.texte) ['post','whatsapp','story'].forEach(k => { if(stand.texte[k]) PK.texte[k] = stand.texte[k]; });
  const q = document.getElementById('pkQuelle');
  if(q) q.textContent = `Spielplan aus der App, Stand der letzten Übernahme von FUSSBALL.DE. ${PK.spiele.length} kommende Spiele.${g.wettbewerb ? ' Wettbewerb: ' + g.wettbewerb + '.' : ''}`;
  pkAnsicht(PK.ansicht || 'spiel');
  await pkAssetsNeu();
}

async function pkAssets(){
  const S = PK.s, L = pkLicht(S.datum, S.zeit, S.modus);
  const bib = !PK.eigene.foto && /^bib:/.test(S.foto || '') ? await sbUrl(S.foto.slice(4)) : null;   // 0.99.21: Bild aus der Bibliothek, fehlt es, greift wieder „Auto“
  const [foto, eigen, gegner] = await Promise.all([
    pkBild(PK.eigene.foto || bib || `plakat/foto/${pkFotoAuswahl(S, L.stimmung)}.webp`),
    pkBild(pkWappenQuelle(S.absender, PK.eigene.eigen) || 'plakat/wappen/svbsc-moerlenbach.webp'),
    pkBild(pkWappenQuelle(S.gegner, PK.eigene.gegner))
  ]);
  return { foto, eigen, gegner, licht:L }; }
async function pkAssetsNeu(){ PK.assets = await pkAssets(); pkZeichnen(); }

function pkZeichnen(){
  const cv = document.getElementById('pkCanvas'); if(!cv) return;
  const A = PK.assets || {}; pkMalen(cv, { ...PK.s, format:PK.format }, A, 1);
  const L = A.licht || pkLicht(PK.s.datum, PK.s.zeit, PK.s.modus);
  const l = document.getElementById('pkLicht');
  if(l) l.textContent = `${PK_SAISON[L.stimmung] || ''} · ${L.automatisch ? 'automatisch' : 'von Hand'} · ${L.text}`;
  const [bw, bh] = PK_FORMATE[PK.format] || PK_FORMATE.story;
  const m = document.getElementById('pkMasse'); if(m) m.textContent = `PNG ${bw * 2} × ${bh * 2} px`; }

/* ---------- Export ---------- */
let pkExportLaeuft = false;
async function pkExport(){
  if(pkExportLaeuft) return;
  if(!PK.s.ort || !String(PK.s.ort).trim()){ kToast('Bitte zuerst den Spielort ergänzen'); pkAnsicht('spiel'); return; }
  const b = document.getElementById('pkExport'); pkExportLaeuft = true;
  const alt = b ? b.innerHTML : ''; if(b){ b.disabled = true; b.textContent = 'PNG wird gebaut …'; }
  try{
    await pkFontsLaden();
    const cv = document.createElement('canvas');
    pkMalen(cv, { ...PK.s, format:PK.format }, PK.assets || await pkAssets(), 2);
    const blob = await new Promise(ok => cv.toBlob(ok, 'image/png'));
    if(!blob) throw new Error('PNG konnte nicht erzeugt werden');
    const a = document.createElement('a'); a.href = URL.createObjectURL(blob);
    a.download = `SVBSC-${PK.s.heim ? 'Heim' : 'Auswaerts'}-${PK.s.datum || 'Termin'}-${PK.format}-${cv.width}x${cv.height}.png`;
    document.body.appendChild(a); a.click(); a.remove(); setTimeout(() => URL.revokeObjectURL(a.href), 8000);
    kToast('Plakat als PNG geladen');
  }catch(e){ console.warn('Plakat-Export', e); kToast('Export hat nicht geklappt, bitte nochmal'); }
  finally{ pkExportLaeuft = false; if(b){ b.disabled = false; b.innerHTML = alt; } pkZeichnen(); }
}

/* ---------- Hintergrund-Galerie (0.73) ---------- */
function pkGalerie(){
  const G = document.getElementById('pkGalerie'); if(!G) return;
  const S = PK.s, L = pkLicht(S.datum, S.zeit, S.modus), aktiv = PK.eigene.foto || /^bib:/.test(S.foto || '') ? '' : pkFotoAuswahl(S, L.stimmung);
  const passt = f => f.st.includes(L.stimmung === 'night' ? 'night' : L.stimmung);
  const reihe = [...PK_FOTOS.filter(passt), ...PK_FOTOS.filter(f => !passt(f))];
  G.innerHTML = `<button type="button" class="pk-gb pk-auto${!S.foto && !PK.eigene.foto ? ' on' : ''}" data-foto="" role="listitem"><b>Auto</b><span>je Spiel ein anderes</span></button>`
    + reihe.map(f => `<button type="button" class="pk-gb${S.foto === f.id ? ' on' : ''}${!S.foto && aktiv === f.id ? ' auto-an' : ''}${passt(f) ? '' : ' fremd'}" data-foto="${pkEsc(f.id)}" role="listitem" title="${pkEsc(f.titel)}" aria-label="${pkEsc(f.titel)}"><img src="plakat/foto/klein/${pkEsc(f.id)}.webp" alt="" loading="lazy"></button>`).join('')
    + sbListe().map(m => `<button type="button" class="pk-gb pk-bib${S.foto === 'bib:' + m.pfad && !PK.eigene.foto ? ' on' : ''}" data-foto="${pkEsc('bib:' + m.pfad)}" role="listitem" title="${pkEsc(m.name || 'Bibliothek')}" aria-label="${pkEsc(m.name || 'Bild aus der Bibliothek')}"><img src="${pkEsc(tkFotoUrl(m.pfad))}" alt="" loading="lazy"></button>`).join('');
  const h = document.getElementById('pkGalerieHint');
  if(h) h.textContent = PK.eigene.foto ? 'Gerade ist dein eigenes Foto aktiv. Ein Bild aus der Galerie ersetzt es.'
    : S.foto ? 'Fest gewählt für dieses Spiel. „Auto“ wechselt wieder je Spiel.' : 'Auto nimmt passend zur Lichtstimmung je Spiel ein anderes Bild. Passende stehen vorne, dahinter die Bilder aus der Bibliothek.';
  G.querySelectorAll('[data-foto]').forEach(b => b.onclick = () => { S.foto = b.dataset.foto; delete PK.eigene.foto; pkGalerie(); pkAssetsNeu(); pkMerken(); });
}

(function(){ try{ const s=document.createElement('style'); s.id='svm57css'; s.textContent="@font-face{font-family:'Anton';src:url('fonts/anton.woff2') format('woff2');font-weight:400;font-display:block;}\n/* Spieltagsstudio */\n.pk-wrap{display:grid;grid-template-columns:minmax(0,1fr) minmax(320px,420px);gap:16px;align-items:start}\n@media (max-width:980px){.pk-wrap{grid-template-columns:minmax(0,1fr)}}\n.pk-vorschau{padding:14px}\n.pk-buehne{background:repeating-conic-gradient(#e9e9ec 0% 25%,#f6f6f8 0% 50%) 0 0/18px 18px;border-radius:10px;padding:12px;display:grid;place-items:center;min-height:260px}\n.pk-buehne canvas{max-width:100%;max-height:min(68vh,760px);height:auto;border-radius:6px;box-shadow:0 14px 40px rgba(10,16,28,.28)}\n.pk-unten{display:flex;justify-content:space-between;align-items:center;gap:12px;flex-wrap:wrap;margin-top:12px}\n.pk-fmts{display:flex;gap:6px;flex-wrap:wrap}\n.pk-fmt.on{background:var(--acc,#1d2760);color:#fff;border-color:transparent}\n.pk-aktion{display:flex;align-items:center;gap:10px;flex-wrap:wrap}\n.pk-masse{font-size:12.5px;opacity:.7;font-variant-numeric:tabular-nums}\n.pk-licht{margin:10px 2px 0;font-size:12.5px;line-height:1.5;opacity:.75}\n\n.pk-steuer{padding:14px}\n.pk-seg{display:flex;gap:4px;background:rgba(29,39,96,.06);padding:4px;border-radius:10px;margin-bottom:14px}\n.pk-seg button{flex:1;min-height:38px;border:0;background:none;border-radius:7px;font:inherit;font-size:13.5px;font-weight:650;color:inherit;cursor:pointer;opacity:.7}\n.pk-seg button.on{background:#fff;opacity:1;box-shadow:0 1px 3px rgba(10,16,28,.14)}\n.pk-body{display:grid;gap:12px}\n.pk-f{display:grid;gap:5px;font-size:13px;font-weight:650}\n.pk-f>span{opacity:.8}\n.pk-f>span b{font-weight:700;opacity:.9;font-variant-numeric:tabular-nums}\n.pk-f input,.pk-f select,.pk-f textarea{min-height:42px;padding:8px 10px;border:1.5px solid rgba(29,39,96,.16);border-radius:9px;font:inherit;font-weight:500;background:#fff;color:inherit;width:100%}\n.pk-f input[type=range]{min-height:30px;padding:0;border:0;background:none}\n.pk-f input[type=color]{padding:3px;min-height:42px}\n.pk-f textarea{min-height:70px;resize:vertical;line-height:1.5}\n.pk-zwei{display:grid;grid-template-columns:1fr 1fr;gap:10px}\n.pk-hint{font-size:12.5px;line-height:1.5;opacity:.7;margin:0}\n.pk-ebenen{display:grid;gap:6px;padding:10px;border:1px solid rgba(29,39,96,.12);border-radius:10px}\n.pk-eb{display:flex;align-items:center;gap:10px;min-height:34px;font-size:13.5px;font-weight:600;cursor:pointer}\n.pk-eb input{width:20px;height:20px;flex:none;accent-color:#1d2760}\n.pk-uploads{display:flex;gap:8px;flex-wrap:wrap}\n.pk-uploads label{cursor:pointer}\n.pk-box{display:grid;gap:6px}\n.pk-box-k{display:flex;justify-content:space-between;align-items:center;gap:10px;font-size:13px}\n.pk-box textarea{width:100%;padding:10px;border:1.5px solid rgba(29,39,96,.16);border-radius:9px;font:inherit;font-size:13.5px;line-height:1.55;resize:vertical;background:#fff;color:inherit}\n.pk-karten{display:grid;grid-template-columns:repeat(auto-fill,minmax(150px,1fr));gap:10px}\n.pk-karte{border:1px solid rgba(29,39,96,.12);border-radius:10px;padding:10px;display:grid;gap:6px;background:#fff}\n.pk-karte img{width:100%;height:88px;object-fit:contain;background:repeating-conic-gradient(#ececed 0% 25%,#f7f7f8 0% 50%) 0 0/12px 12px;border-radius:6px}\n.pk-karte h4{margin:0;font-size:13.5px;line-height:1.3}\n.pk-karte p{margin:0;font-size:11.5px;line-height:1.45;opacity:.75}\n.pk-karte div{display:flex;gap:6px;flex-wrap:wrap;margin-top:2px}\n/* Hintergrund-Galerie (0.73) */\n.pk-galerie{display:grid;grid-template-columns:repeat(auto-fill,minmax(64px,1fr));gap:8px;margin:2px 0 6px}\n.pk-gb{position:relative;aspect-ratio:9/16;padding:0;border:2px solid transparent;border-radius:10px;overflow:hidden;background:var(--card2);cursor:pointer;color:inherit;font:inherit}\n.pk-gb img{width:100%;height:100%;object-fit:cover;display:block}\n/* 0.99.21: Motive, die nicht zur Lichtstimmung passen, stehen hinten, sind aber nicht mehr blasser (Albert: „komischer Schleier“) */\n.pk-gb.fremd{opacity:1}\n.pk-gb.on{border-color:var(--accent);opacity:1}\n.pk-gb.auto-an{border-color:color-mix(in srgb,var(--accent) 45%,transparent);opacity:1}\n.pk-gb.pk-auto{display:grid;place-content:center;gap:4px;text-align:center;padding:6px;border:1px dashed var(--line)}\n.pk-gb.pk-auto.on{border:2px solid var(--accent)}\n.pk-gb.pk-auto b{font-size:14px}\n.pk-gb.pk-auto span{font-size:11px;line-height:1.25;color:var(--ink2)}\n.pk-gb:focus-visible{outline:2px solid var(--accent);outline-offset:2px}\n"; document.head.appendChild(s); }catch(e){} })();
/* =====================================================================
   Sportzentrale Beta 0.43 · SV/BSC Studio (Teil 1: Daten, Darstellung, Projektliste)
   Präsentationen und Dokumente im Vereinsdesign, gemeinsam bearbeiten.
   - Jede Folie ist eine HTML-Seite (aus den .dc.html-Dateien 1:1 übernommen) in einem eigenen Shadow-Root,
     damit das App-Design nichts verschiebt. Jedes Element hat eine feste ID (data-st-id).
   - Änderungen sind kleine Schritte (Stil, Text, neu, weg). Beim Speichern werden sie auf den neuesten Stand
     auf dem Server gelegt: zwei Personen können gleichzeitig an derselben Folie arbeiten, ohne dass etwas verloren geht.
   - Bilder liegen privat im Speicher „studio“ (assets/…), angezeigt über kurzlebige signierte Adressen.
   ===================================================================== */
const ST={rechte:null,projekte:null,laedt:false,p:null,folien:[],cur:0,sel:[],urls:new Map(),rev:new Map(),ohneSpeicher:false,
  q:new Map(),basis:new Map(),undo:[],redo:[],speichert:false,timer:null,ansicht:'liste',medien:null,filter:'',zoom:0,edit:null,archivOffen:false,alle:[],mModus:false};
const ST_TOK={navy:'#1d2760',orange:'#e8741f',hellblau:'#8fc9ec',creme:'#f7f4ee',sand:'#e9e5dc',eisblau:'#d9e6f1',text:'#1c1c22',grau:'#5b5b66',weiss:'#ffffff'};
const ST_FONTS='https://fonts.googleapis.com/css2?family=Barlow+Condensed:wght@600;700;800;900&family=Barlow:wght@400;500;600;700&family=Caveat:wght@500;700&display=swap';
const stE=s=>svEsc(s==null?'':String(s));
const stId=()=>'n'+Date.now().toString(36).slice(-5)+Math.random().toString(36).slice(2,6);
function stKann(){ return !!(ST.rechte&&ST.rechte.bearbeiten); }

/* ---------- Schriften einmal in die Seite holen (gelten auch im Shadow-Root) ---------- */
function stFonts(){ if(document.getElementById('stFonts'))return; const l=document.createElement('link'); l.id='stFonts'; l.rel='stylesheet'; l.href=ST_FONTS; document.head.appendChild(l); }

/* ---------- CSS der Vorlage für den Shadow-Root aufbereiten ---------- */
function stCssSauber(css){
  let c=String(css||'');
  // @media print { … } und @page entfernen (verschachtelte Klammern zählen)
  const weg=(re)=>{ let m; while((m=re.exec(c))){ let i=c.indexOf('{',m.index), d=0, j=i; for(;j<c.length;j++){ if(c[j]==='{')d++; else if(c[j]==='}'){ d--; if(!d)break; } } c=c.slice(0,m.index)+c.slice(j+1); re.lastIndex=0; } };
  weg(/@media\s+print/g); weg(/@page\b/g);
  c=c.replace(/x-dc\s*\{[^}]*\}/g,'').replace(/html,\s*body\s*\{[^}]*\}/g,'').replace(/#dc-root[^{]*\{[^}]*\}/g,'');
  c=c.replace(/(^|[\s,}])(html|body)(?=\s*[,{])/g,'$1:host');
  return c;
}
function stBaseCss(p){ const W=p.breite, H=p.hoehe, doc=p.art==='doc';
  return `:host{display:block;position:relative;width:${W}px;height:${H}px;font-family:'Barlow',sans-serif;color:#1c1c22;contain:layout paint}
  .st-root{position:relative;width:${W}px;height:${H}px;overflow:hidden}
  .st-root>section{position:relative !important;inset:auto !important;width:${W}px !important;height:${H}px !important;min-height:0 !important;max-height:none !important;box-sizing:border-box !important;overflow:hidden !important;margin:0 !important;${doc?'container-type:size;':''}}
  ${doc?'.st-root>section:not([style*="background"]){background:#fff}':''}
  .st-mlayer{position:absolute;inset:0;z-index:0;pointer-events:none}
  .st-mlayer>section{position:absolute !important;left:0 !important;top:0 !important;width:${W}px !important;height:${H}px !important;margin:0 !important;box-sizing:border-box !important;overflow:hidden !important}
  .st-mlayer+section{z-index:1}
  .st-edit [data-st-lock]{cursor:not-allowed}
  [data-st-slot]{min-height:40px}
  .st-edit [data-st-slot]:empty{outline:2px dashed rgba(29,39,96,.35);outline-offset:-2px;background:repeating-linear-gradient(45deg,rgba(29,39,96,.04) 0 12px,transparent 12px 24px)}
  .st-edit [data-st-slot]:empty::after{content:attr(data-st-ph);display:flex;height:100%;align-items:center;justify-content:center;font:600 22px Barlow,sans-serif;color:rgba(29,39,96,.55);text-align:center;padding:12px}
  .st-edit [contenteditable="true"]{outline:2px solid #e8741f;outline-offset:3px;cursor:text}
  .st-edit [data-st-sel]{outline:2px solid #3d7bff;outline-offset:2px}
  .st-edit [data-st-sel2]{outline:2px dashed #3d7bff;outline-offset:2px}
  .st-edit [data-st-remote]{outline:2px solid var(--st-rc,#e8741f);outline-offset:4px}
  .st-edit *{cursor:default}
  img{user-select:none;-webkit-user-drag:none}`;
}

/* ---------- Bilder: assets/… ↔ signierte Adressen ---------- */
function stAssets(html){ const s=new Set(); String(html||'').replace(/assets\/([A-Za-z0-9._-]+)/g,(m,n)=>{ s.add('assets/'+n); return m; }); return [...s]; }
async function stUrlsLaden(pfade){
  const neu=pfade.filter(p=>!ST.urls.has(p)); if(!neu.length||ST.ohneSpeicher)return;
  try{
    for(let i=0;i<neu.length;i+=80){ const {data,error}=await SVB.sb.storage.from('studio').createSignedUrls(neu.slice(i,i+80),6*3600); if(error)throw error;
      (data||[]).forEach(d=>{ if(d.signedUrl&&!d.error){ ST.urls.set(d.path,d.signedUrl); ST.rev.set(d.signedUrl,d.path); } }); }
  }catch(e){ console.warn('Studio-Bilder',e); ST.ohneSpeicher=true; }
}
function stUrl(p){ return ST.urls.get(p)||(ST.ohneSpeicher?'studio-assets/'+p.slice(7):p); }
function stHtmlRein(html){ return String(html||'').replace(/(&quot;|["'(=\s])assets\/([A-Za-z0-9._-]+)/g,(m,q,n)=>q+stUrl('assets/'+n)); }
function stHtmlRaus(html){ let h=String(html||'');
  ST.rev.forEach((p,u)=>{ if(h.includes(u))h=h.split(u).join(p); const a=u.replace(/&/g,'&amp;'); if(a!==u&&h.includes(a))h=h.split(a).join(p); });
  h=h.replace(/studio-assets\/([A-Za-z0-9._-]+)/g,'assets/$1');
  return h; }

/* ---------- Masterfolie: liegt als eigene Ebene hinter der Folie, Platzhalter (Seitenzahl, Titel, Datum) werden eingesetzt ---------- */
function stRootInner(html,mhtml,felder){ let m='';
  if(mhtml){ const t=document.createElement('template'); t.innerHTML=mhtml; const s=t.content.firstElementChild;
    if(s){ s.removeAttribute('data-st-id'); s.querySelectorAll('[data-st-id]').forEach(e=>e.removeAttribute('data-st-id'));
      s.querySelectorAll('[data-st-feld]').forEach(e=>{ const v=felder&&felder[e.getAttribute('data-st-feld')]; if(v!=null)e.textContent=v; });
      m='<div class="st-mlayer" aria-hidden="true">'+s.outerHTML+'</div>'; } }
  return m+html; }
function stMasterVon(f){ if(!f||!f.master_id||f.ist_master)return null; return (ST.alle||[]).find(x=>x.id===f.master_id)||(ST.masterCache&&ST.masterCache.get(f.master_id))||null; }
function stFelder(f,p){ p=p||ST.p||{}; const L=(ST.alle||[]).filter(x=>!x.ist_master&&!x.skip).sort((a,b)=>a.pos-b.pos); const i=L.findIndex(x=>x.id===f.id);
  const d=new Date(); return {nr:i>=0?String(i+1):'', gesamt:String(L.length), titel:p.titel||'', datum:String(d.getDate()).padStart(2,'0')+'.'+String(d.getMonth()+1).padStart(2,'0')+'.'+d.getFullYear()}; }
/* ---------- Eine Folie darstellen ---------- */
function stMount(host,f,opt,pp){ opt=opt||{}; const p=pp||ST.p;
  const root=host.shadowRoot||host.attachShadow({mode:'open'}); const m=stMasterVon(f);
  root.innerHTML=`<style>${stBaseCss(p)}\n${stCssSauber(p.css)}</style><div class="st-root${opt.edit?' st-edit':''}">${stHtmlRein(stRootInner(f.html||'<section></section>',m&&m.html,m&&stFelder(f,p)))}</div>`;
  root.querySelectorAll('[contenteditable]').forEach(e=>e.removeAttribute('contenteditable'));
  return root; }
function stSection(root){ return root&&root.querySelector('.st-root>section'); }
function stSkalaBox(box,f,breite,pp){ const p=pp||ST.p, s=breite/p.breite; box.style.width=Math.round(p.breite*s)+'px'; box.style.height=Math.round(p.hoehe*s)+'px';
  let h=box.querySelector('.st-host'); if(!h){ h=document.createElement('div'); h.className='st-host'; box.appendChild(h); }
  h.style.transform=`scale(${s})`; stMount(h,f,{},p); return h; }

/* ---------- Laden ---------- */
async function stRechte(){ if(ST.rechte)return ST.rechte;
  try{ const {data,error}=await SVB.sb.rpc('studio_rechte'); if(error)throw error; ST.rechte=data||{}; }
  catch(e){ ST.rechte={lesen:isAdmin(),bearbeiten:isAdmin(),admin:isAdmin(),fehlt:true}; }
  return ST.rechte; }
async function stProjekteLaden(){
  ST.laedt=true;
  try{ const {data,error}=await SVB.sb.from('studio_projekte').select('id,titel,art,ordner,breite,hoehe,css,geaendert_am,erstellt_am,bereich,privat,erstellt_von').is('geloescht_am',null).order('geaendert_am',{ascending:false}); if(error)throw error;
    ST.projekte=data||[];
    const ids=ST.projekte.map(p=>p.id); ST.ersteFolie=new Map(); ST.anzahl=new Map();
    if(ids.length){ const {data:F}=await SVB.sb.from('studio_folien').select('id,projekt_id,pos,skip,ist_master').in('projekt_id',ids).order('pos');
      (F||[]).filter(f=>!f.ist_master).forEach(f=>{ ST.anzahl.set(f.projekt_id,(ST.anzahl.get(f.projekt_id)||0)+(f.skip?0:1)); if(!ST.ersteFolie.has(f.projekt_id))ST.ersteFolie.set(f.projekt_id,f.id); }); }
  }catch(e){ console.warn('Studio',e); ST.projekte=[]; ST.fehler=e.message||String(e); }
  ST.laedt=false; }
const ST_FSEL='id,pos,label,notiz,skip,html,version,ist_master,master_id';
// Sichtbare Liste: normale Folien oder (im Master-Modus) die Masterfolien
function stSicht(){ ST.folien=(ST.alle||[]).filter(f=>!!f.ist_master===!!ST.mModus).sort((a,b)=>a.pos-b.pos); }
function stFolieId(id){ return (ST.alle||[]).find(f=>f.id===id)||null; }
async function stProjektLaden(id){
  const [{data:p,error:e1},{data:F,error:e2}]=await Promise.all([SVB.sb.from('studio_projekte').select('*').eq('id',id).single(),
    SVB.sb.from('studio_folien').select(ST_FSEL).eq('projekt_id',id).order('pos')]);
  if(e1)throw e1; if(e2)throw e2;
  ST.p=p; ST.alle=F||[]; ST.mModus=false; stSicht(); ST.cur=0; ST.sel=[]; ST.undo=[]; ST.redo=[]; ST.q=new Map(); ST.basis=new Map(ST.alle.map(f=>[f.id,f.version]));
  ST.alle.forEach(f=>{ f.html=stIdsSichern(f.html); });
  await stUrlsLaden([...new Set(ST.alle.flatMap(f=>stAssets(f.html)))]);
}
// Jedes Element braucht eine ID, sonst lassen sich Änderungen nicht zusammenführen
function stIdsSichern(html){ const t=document.createElement('template'); t.innerHTML=html||'<section></section>'; const s=t.content.firstElementChild; if(!s)return '<section></section>';
  let neu=false; s.querySelectorAll('*').forEach(e=>{ if(!e.dataset.stId){ e.dataset.stId=stId(); neu=true; } }); return neu?s.outerHTML:html; }

/* ---------- Bereich ---------- */
SV_TBL.studio=['layers','Studio'];
Object.assign(SV_PAGES,{studio:['Studio','Präsentationen und Dokumente im Vereinsdesign, gemeinsam bearbeiten']});
{ const _ta=svTabAllowed; svTabAllowed=function(t){ if(t==='studio')return !ST.rechte||ST.rechte.lesen!==false||isAdmin(); return _ta.apply(this,arguments); }; }
function stNavVis(){ try{ if(!ST.rechte&&!ST.rechteLaedt&&typeof SVB!=='undefined'&&SVB.sb&&SVB.user){ ST.rechteLaedt=true; stRechte().then(()=>{ ST.rechteLaedt=false; stNavVis(); }); }
  const ok=!ST.rechte?isAdmin():!!ST.rechte.lesen; document.querySelectorAll('.snav button[data-tab="studio"],.sgrid [data-sheet="studio"]').forEach(b=>b.style.display=ok?'':'none'); }catch(e){} }
if(typeof sv4NavVis==='function'){ const _nv=sv4NavVis; sv4NavVis=function(){ const r=_nv.apply(this,arguments); stNavVis(); return r; }; }
function stPanel(){ let P=document.getElementById('panel-studio'); if(P)return P;
  const ref=document.getElementById('panel-home')||document.querySelector('.panel'); if(!ref)return null;
  P=document.createElement('section'); P.className='panel'; P.id='panel-studio'; ref.parentNode.insertBefore(P,ref.nextSibling); return P; }
{ const _gt=goTab; goTab=function(tab){ if(tab==='studio')stPanel(); const war=svCurTab(); const r=_gt.apply(this,arguments);
  try{ const jetzt=svCurTab(); document.body.classList.toggle('st-voll',jetzt==='studio'&&ST.ansicht==='editor');
    if(jetzt==='studio'&&war!=='studio')stStart(); if(jetzt!=='studio'&&war==='studio')stSpeichernJetzt(); }catch(e){ console.warn('Studio',e); } return r; }; }
async function stStart(){ stFonts(); const P=stPanel(); if(!P)return; await stRechte(); stNavVis();
  if(ST.rechte.lesen===false&&!isAdmin()){ P.innerHTML='<div class="card"><div class="empty">Für das Studio fehlt dir die Berechtigung.</div></div>'; return; }
  if(ST.ansicht==='editor'&&ST.p){ stEditorRender(); return; }
  ST.ansicht='liste'; P.innerHTML='<div class="card"><div class="empty">Lade Projekte …</div></div>'; await stProjekteLaden(); stListe(); }

/* ---------- Projektliste ---------- */
function stListe(){
  const P=stPanel(); if(!P)return; ST.ansicht='liste'; document.body.classList.remove('st-voll');
  const L=(ST.projekte||[]).filter(p=>!ST.filter||p.titel.toLowerCase().includes(ST.filter.toLowerCase()));
  const haupt=L.filter(p=>!p.ordner), archiv=L.filter(p=>p.ordner);
  const art={deck:'Präsentation 16:9',doc:'Dokument A4',frei:'Freies Format'};
  const karte=p=>`<button type="button" class="st-pk" data-stp="${stE(p.id)}"><span class="st-pk-bild" data-stt="${stE(p.id)}"></span><span class="st-pk-t"><b>${stE(p.titel)}</b><small>${stE(art[p.art]||p.art)}${p.art==='doc'&&p.breite>p.hoehe?' quer':''} · ${ST.anzahl&&ST.anzahl.get(p.id)||0} ${p.art==='deck'?'Folien':'Seiten'} · ${TRC.fmt(String(p.geaendert_am).slice(0,10))}${String(p.geaendert_am).slice(2,4)}</small></span></button>`;
  P.innerHTML=`<div class="st-liste">
    ${ST.rechte&&ST.rechte.fehlt?`<div class="note st-warn">${SVI('info')} Das Studio braucht noch die Datenbank-Erweiterung 082. Bis dahin sieht nur der Admin diesen Bereich.</div>`:''}
    <div class="st-lk"><div class="st-such"><input type="search" id="stSuch" placeholder="Projekt suchen" value="${stE(ST.filter)}"></div>
      ${stKann()?`<div class="btnrow"><button type="button" class="btn sm" data-stneu="deck">${SVI('plus')} Präsentation</button><button type="button" class="btn sm ghost" data-stneu="doc">${SVI('plus')} Dokument A4</button><button type="button" class="btn sm ghost" data-stneu="docq">A4 quer</button><label class="btn sm ghost st-imp">${SVI('upload')} .dc.html importieren<input type="file" id="stImp" accept=".html,.htm,image/*" multiple hidden></label><button type="button" class="btn sm ghost" id="stMed">${SVI('layers')} Mediathek</button><button type="button" class="btn sm ghost" id="stPers">${SVI('users')} Personen</button></div>`:''}</div>
    ${ST.fehler?`<div class="note">Laden nicht möglich: ${stE(ST.fehler)}</div>`:''}
    ${haupt.length?`<div class="st-pks">${haupt.map(karte).join('')}</div>`:`<div class="card"><div class="empty">${ST.projekte&&ST.projekte.length?'Kein Projekt passt zur Suche.':'Noch keine Projekte.'}</div></div>`}
    ${archiv.length?`<details class="pf4-sec st-arch"${ST.archivOffen?' open':''}><summary><span>Archiv und ältere Stände</span><em>${archiv.length}</em></summary><div class="pf4-b"><div class="st-pks">${archiv.map(karte).join('')}</div></div></details>`:''}
  </div>`;
  const s=P.querySelector('#stSuch'); if(s)s.oninput=()=>{ ST.filter=s.value; const pos=s.selectionStart; stListe(); const n=document.getElementById('stSuch'); n.focus(); try{ n.setSelectionRange(pos,pos); }catch(e){} };
  P.querySelectorAll('[data-stp]').forEach(b=>b.onclick=()=>stOeffnen(b.dataset.stp));
  P.querySelectorAll('[data-stneu]').forEach(b=>b.onclick=()=>stNeuesProjekt(b.dataset.stneu));
  const ar=P.querySelector('.st-arch'); if(ar)ar.addEventListener('toggle',()=>{ ST.archivOffen=ar.open; if(ar.open)stVorschauen(ar); });
  const im=P.querySelector('#stImp'); if(im)im.onchange=()=>stImportDateien([...im.files]);
  const md=P.querySelector('#stMed'); if(md)md.onclick=()=>stMediathek();
  const pe=P.querySelector('#stPers'); if(pe)pe.onclick=()=>stPersonen();
  stVorschauen(P.querySelector('.st-pks'));
}
// Vorschaubild = erste Folie, klein gerendert
async function stVorschauen(box){ if(!box)return; const els=[...box.querySelectorAll('[data-stt]')].filter(e=>!e.dataset.ok); if(!els.length)return;
  const ids=els.map(e=>ST.ersteFolie&&ST.ersteFolie.get(e.dataset.stt)).filter(Boolean); if(!ids.length)return;
  const {data}=await SVB.sb.from('studio_folien').select('id,projekt_id,html,master_id').in('id',ids);
  const PJ=new Map((ST.projekte||[]).map(p=>[p.id,p]));
  const mids=[...new Set((data||[]).map(f=>f.master_id).filter(Boolean))]; ST.masterCache=ST.masterCache||new Map();
  if(mids.length){ const {data:M}=await SVB.sb.from('studio_folien').select('id,html').in('id',mids); (M||[]).forEach(m=>ST.masterCache.set(m.id,m)); }
  await stUrlsLaden([...new Set((data||[]).concat([...ST.masterCache.values()]).flatMap(f=>stAssets(f.html)))]);
  (data||[]).forEach(f=>{ const el=box.querySelector(`[data-stt="${f.projekt_id}"]`); const p=PJ.get(f.projekt_id); if(!el||!p)return; el.dataset.ok=1;
    stSkalaBox(el,f,el.clientWidth||260,p); }); }

async function stOeffnen(id){ const P=stPanel(); P.innerHTML='<div class="card"><div class="empty">Öffne …</div></div>';
  try{ await stProjektLaden(id); ST.ansicht='editor'; document.body.classList.add('st-voll'); stEditorRender(); }
  catch(e){ P.innerHTML=`<div class="card"><div class="empty">Projekt lässt sich nicht öffnen: ${stE(e.message||e)}</div></div>`; } }

const ST_CSS_STD=`body{margin:0;font-family:'Barlow',sans-serif;color:#1c1c22}\na{color:#1d2760}a:hover{color:#e8741f}\nsection p,section span,section div{text-wrap:balance}`;
async function stNeuesProjekt(art){
  const typ=art==='docq'?'doc':art, quer=art==='docq', W=typ==='deck'?1920:(quer?1123:794), H=typ==='deck'?1080:(quer?794:1123);
  const titel=(typ==='deck'?'Neue Präsentation':'Neues Dokument')+' '+TRC.fmt(trToday())+trToday().slice(2,4);
  try{ const {data:p,error}=await SVB.sb.from('studio_projekte').insert({titel,art:typ,breite:W,hoehe:H,css:ST_CSS_STD,bereich:(stNeuesProjekt.wahl&&stNeuesProjekt.wahl.bereich)||stStdBereich(),privat:!!(stNeuesProjekt.wahl&&stNeuesProjekt.wahl.privat)}).select().single(); if(error)throw error;
    const html=typ==='deck'?stVorlageFolie('titel',{}):stVorlageSeite();
    const {error:e2}=await SVB.sb.from('studio_folien').insert({projekt_id:p.id,pos:1,label:typ==='deck'?'Titel':'Seite 1',html}); if(e2)throw e2;
    await stOeffnen(p.id); }
  catch(e){ kToast('⚠️ '+(e.message||e)); } }

/* ---------- Eigene Adresse studio.kaderwerk.pro: nach der Anmeldung direkt ins Studio, ohne die restliche Vereins-App ---------- */
const ST_APP=/^studio\./.test(location.hostname)||/[?&]studio=1\b/.test(location.search);
if(ST_APP){ document.documentElement.classList.add('st-app'); try{ document.title='SV/BSC Studio'; }catch(e){}
  if(typeof goTab==='function'){ const _gt=goTab; goTab=function(t){ return _gt.call(this,(t==='studio'||t==='konto'||t==='admin')?t:'studio'); }; }
  let t=0; const iv=setInterval(()=>{ if(++t>600)return clearInterval(iv); const g=document.getElementById('gate');
    if(typeof _remoteDone!=='undefined'&&_remoteDone&&g&&g.classList.contains('done')){ clearInterval(iv);
      if(svCurTab()!=='studio')goTab('studio'); setTimeout(()=>{ try{ document.title='SV/BSC Studio'; }catch(e){} },200);
      [800,2500,5000].forEach(ms=>setTimeout(()=>{ try{ if(document.querySelector('#overlay.open'))closeOverlay(); }catch(e){} },ms)); } },300); }

/* =====================================================================
   SV/BSC Studio (Teil 2: Editor, Änderungsschritte, Speichern mit Zusammenführen)
   ===================================================================== */
const stF=()=>ST.folien[ST.cur]||null;
const stFind=(sec,id)=>!sec?null:(id==='@'?sec:sec.querySelector(`[data-st-id="${CSS.escape(id)}"]`));
const stIdOf=(sec,el)=>el===sec?'@':(el.dataset.stId||(el.dataset.stId=stId()));
function stHost(){ return document.getElementById('stHost'); }
function stSec(){ const h=stHost(); return h&&h.shadowRoot?stSection(h.shadowRoot):null; }

/* ---------- Änderungsschritte ---------- */
function stOpAnwenden(sec,op){
  if(!sec||!op)return false;
  if(typeof ShadowRoot!=='undefined'&&sec.getRootNode()instanceof ShadowRoot){ op=Object.assign({},op);   // auf der Bühne: Bildpfade in Adressen umsetzen
    if(op.t==='attr'&&typeof op.v==='string'&&/assets\//.test(op.v))op.v=stHtmlRein(' '+op.v).slice(1);
    if(op.html)op.html=stHtmlRein(op.html); if(op.t==='html'&&typeof op.v==='string')op.v=stHtmlRein(op.v); }
  if(op.t==='attr'){ const el=stFind(sec,op.id); if(!el)return false; if(op.v==null)el.removeAttribute(op.k); else el.setAttribute(op.k,op.v); return true; }
  if(op.t==='html'){ const el=stFind(sec,op.id); if(!el)return false; el.innerHTML=op.v; return true; }
  if(op.t==='del'){ const el=stFind(sec,op.id); if(!el)return false; el.remove(); return true; }
  if(op.t==='add'){ if(stFind(sec,op.id))return true; const par=stFind(sec,op.parent||'@')||sec; const t=document.createElement('template'); t.innerHTML=op.html; const n=t.content.firstElementChild; if(!n)return false;
    const vor=op.before?stFind(sec,op.before):null; if(vor&&vor.parentElement===par)par.insertBefore(n,vor); else par.appendChild(n); return true; }
  return false; }
function stUmkehr(op){
  if(op.t==='attr')return {t:'attr',id:op.id,k:op.k,v:op.old,old:op.v};
  if(op.t==='html')return {t:'html',id:op.id,v:op.old,old:op.v};
  if(op.t==='add')return {t:'del',id:op.id,parent:op.parent,before:op.before,html:op.html};
  if(op.t==='del')return {t:'add',id:op.id,parent:op.parent,before:op.before,html:op.html};
  return null; }
// Mehrere Schritte als einen Tun (rückgängig machbar, wird gespeichert und an andere gesendet)
function stTun(ops,opt){ opt=opt||{}; const f=stF(), sec=stSec(); if(!f||!sec||!ops.length)return;
  if(!opt.schonAngewandt)ops.forEach(o=>stOpAnwenden(sec,o));
  stQueue(f.id,ops);
  if(!opt.ohneUndo){ ST.undo.push({fid:f.id,ops}); if(ST.undo.length>200)ST.undo.shift(); ST.redo=[]; }
  f.html=stHtmlRaus(sec.outerHTML);
  try{ stLiveSenden(f.id,ops); }catch(e){}
  stNachAenderung(); }
function stQueue(fid,ops){ const q=ST.q.get(fid)||[]; ops.forEach(o=>q.push(o)); ST.q.set(fid,q); stSpeichernBald(); }
function stUndo(red){ const S=red?ST.redo:ST.undo, T=red?ST.undo:ST.redo; const g=S.pop(); if(!g)return;
  let i=ST.folien.findIndex(f=>f.id===g.fid); if(i<0){ const gf=stFolieId(g.fid); if(!gf)return; ST.mModus=!!gf.ist_master; stSicht(); stFolienliste(); i=ST.folien.findIndex(f=>f.id===g.fid); if(i<0)return; ST.cur=-1; } if(i!==ST.cur){ ST.cur=i; stCanvas(); }
  const ops=red?g.ops:g.ops.slice().reverse().map(stUmkehr).filter(Boolean);
  const sec=stSec(); ops.forEach(o=>stOpAnwenden(sec,o)); stQueue(g.fid,ops); T.push(g);
  const f=stF(); f.html=stHtmlRaus(sec.outerHTML); try{ stLiveSenden(f.id,ops); }catch(e){}
  ST.sel=ST.sel.filter(id=>stFind(sec,id)); stNachAenderung(); }
let stNachT=null;
function stNachAenderung(){ stOverlay(); stToolbar(); clearTimeout(stNachT); stNachT=setTimeout(()=>{ stThumb(ST.cur); stStatus(); },500); }

/* ---------- Speichern: auf den neuesten Stand legen, nie überschreiben ---------- */
function stSpeichernBald(){ clearTimeout(ST.timer); ST.timer=setTimeout(stSpeichernJetzt,700); stStatus('ungespeichert'); }
async function stSpeichernJetzt(){ clearTimeout(ST.timer); if(ST.speichert){ ST.nochmal=true; return; } if(!ST.p)return;
  const ids=(ST.alle||ST.folien).filter(f=>(ST.q.get(f.id)||[]).length||(f.meta&&f.meta.size)).map(f=>f.id); if(!ids.length){ stStatus(); return; }
  ST.speichert=true; stStatus('speichert');
  let fehler=null;
  for(const fid of ids){ try{ await stSpeichernFolie(fid); }catch(e){ fehler=e; console.warn('Studio speichern',e); } }
  ST.speichert=false; stStatus(fehler?'fehler':'');
  if(fehler)ST.timer=setTimeout(stSpeichernJetzt,5000);
  if(ST.nochmal){ ST.nochmal=false; stSpeichernBald(); } }
async function stSpeichernFolie(fid){
  const f=stFolieId(fid); if(!f)return;
  const ops=ST.q.get(fid)||[]; const meta=f.meta||new Set(); ST.q.set(fid,[]); f.meta=new Set();
  const felder=o=>{ const r={}; meta.forEach(k=>r[k]=f[k]); return r; };
  try{
    let base=ST.basis.get(fid);
    let {data,error}=await SVB.sb.from('studio_folien').update(Object.assign({html:f.html},felder())).eq('id',fid).eq('version',base).select('version');
    if(error)throw error;
    if(data&&data.length){ ST.basis.set(fid,data[0].version); return; }
    // Jemand war schneller: neuesten Stand holen, eigene Schritte darauflegen
    for(let i=0;i<4;i++){
