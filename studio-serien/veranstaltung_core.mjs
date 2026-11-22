// Fotoserien: reine Datenlogik. Kein Netz, keine Veröffentlichung, keine Bildgenerierung.
export const GRENZEN = Object.freeze({
  fotos: 40, folien: 20, eingabeBytes: 25 * 1024 * 1024,
  bildBytes: 12 * 1024 * 1024, kante: 3200,
  vorschauKante: 768, vorschauBytes: 160 * 1024
});
export const FORMATE = Object.freeze({
  feed: Object.freeze({ breite: 1080, hoehe: 1350 }),
  story: Object.freeze({ breite: 1080, hoehe: 1920 })
});

const ARTEN = new Set(['auftakt', 'foto', 'papier', 'duo', 'abschluss']);
const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const SHA = /^[0-9a-f]{64}$/;
const DHASH = /^[0-9a-f]{16}$/;
const obj = v => v !== null && typeof v === 'object' && !Array.isArray(v) ? v : {};
const liste = v => Array.isArray(v) ? v : [];
const text = v => typeof v === 'string' ? v.replace(/\r\n?/g, '\n').replace(/[\u0000-\u0008\u000b\u000c\u000e-\u001f\u007f]/g, '') : '';
const hat = (v, k) => Object.prototype.hasOwnProperty.call(v, k);
const begrenzen = (v, min, max, fallback) => typeof v === 'number' && Number.isFinite(v) ? Math.min(max, Math.max(min, v)) : fallback;
const punkt = v => ({ x: begrenzen(obj(v).x, 0, 1, .5), y: begrenzen(obj(v).y, 0, 1, .5) });
const cropOrdnen = (v, fallback = 'ganz') => ({
  ...punkt(v), zoom: begrenzen(obj(v).zoom, 1, 8, 1),
  modus: ['fuellen', 'ganz'].includes(obj(v).modus) ? v.modus : fallback
});

function rechtecke(v) {
  return liste(v).slice(0, 40).map(value => {
    const r = obj(value), x = begrenzen(r.x, 0, 1, 0), y = begrenzen(r.y, 0, 1, 0);
    return { x, y, w: begrenzen(r.w, 0, 1 - x, 0), h: begrenzen(r.h, 0, 1 - y, 0) };
  }).filter(r => r.w > 0 && r.h > 0);
}

function analyseOrdnen(value) {
  const a = obj(value), out = {};
  for (const k of ['helligkeit', 'kontrast', 'schaerfe']) {
    if (typeof a[k] === 'number' && Number.isFinite(a[k])) out[k] = begrenzen(a[k], 0, 1, 0);
  }
  if (DHASH.test(a.dhash || '')) out.dhash = a.dhash;
  if (typeof a.rolle === 'string') out.rolle = text(a.rolle).slice(0, 80);
  if (typeof a.grund === 'string') out.grund = text(a.grund).slice(0, 240);
  if (hat(a, 'fokus')) out.fokus = punkt(a.fokus);
  if (hat(a, 'schutz')) out.schutz = rechtecke(a.schutz);
  return out;
}

export function neu() {
  return {
    schema: 1, titel: '', fakten: { anlass: '', datum: '', ort: '', rolle: '', text: '' },
    fotos: [], feed: [], story: [], texte: { instagram: '', story: [] }, vorlage: 'V1'
  };
}

// Bestehende Folien werden niemals durch bloßes Laden neu vorgeschlagen.
// Nutzereingaben bleiben vollständig, Überlängen meldet pruefen statt sie abzuschneiden.
export function normalisieren(value) {
  const d = obj(value), f = obj(d.fakten), t = obj(d.texte), out = neu();
  out.titel = text(d.titel);
  for (const k of Object.keys(out.fakten)) out.fakten[k] = text(f[k]);
  out.fotos = liste(d.fotos).map(value => {
    const p = obj(value), foto = {
      id: text(p.id), pfad: text(p.pfad), name: text(p.name),
      breite: typeof p.breite === 'number' && Number.isFinite(p.breite) ? Math.max(0, Math.round(p.breite)) : 0,
      hoehe: typeof p.hoehe === 'number' && Number.isFinite(p.hoehe) ? Math.max(0, Math.round(p.hoehe)) : 0,
      hash: text(p.hash)
    };
    if (hat(p, 'analyse')) foto.analyse = analyseOrdnen(p.analyse);
    if (hat(p, 'rolle')) foto.rolle = text(p.rolle);
    if (hat(p, 'fokus')) foto.fokus = punkt(p.fokus);
    if (hat(p, 'ausgeschlossen')) foto.ausgeschlossen = p.ausgeschlossen === true;
    return foto;
  });
  for (const format of Object.keys(FORMATE)) {
    out[format] = liste(d[format]).map(value => {
      const s = obj(value);
      return {
        id: text(s.id), art: text(s.art) || 'foto',
        bilder: liste(s.bilder).map(value => {
          const b = obj(value);
          return { fotoId: text(b.fotoId), crop: cropOrdnen(b.crop) };
        }),
        titel: text(s.titel), text: text(s.text), alt: text(s.alt)
      };
    });
  }
  out.texte = { instagram: text(t.instagram), story: liste(t.story).map(text) };
  return out;
}

// Der gewünschte Mittelpunkt ist in Bildkoordinaten 0..1 angegeben.
// Alle drawImage-Rechtecke sind endlich und bleiben in Quelle und Zielrahmen.
export function zuschnitt(iw, ih, boxW, boxH, crop = {}) {
  const c = cropOrdnen(crop), leer = {
    sx: 0, sy: 0, sw: 0, sh: 0, dx: 0, dy: 0, dw: 0, dh: 0,
    ...c, gueltig: false, beschnitt: false, vergroesserung: 0
  };
  if (![iw, ih, boxW, boxH].every(n => typeof n === 'number' && Number.isFinite(n) && n > 0 && n <= 100000)) return leer;
  if (c.modus === 'ganz') {
    const faktor = Math.min(boxW / iw, boxH / ih), dw = iw * faktor, dh = ih * faktor;
    return {
      sx: 0, sy: 0, sw: iw, sh: ih, dx: (boxW - dw) / 2, dy: (boxH - dh) / 2, dw, dh,
      ...c, zoom: 1, gueltig: true, beschnitt: false, vergroesserung: faktor
    };
  }
  const faktor = Math.max(boxW / iw, boxH / ih) * c.zoom;
  const sw = Math.min(iw, boxW / faktor), sh = Math.min(ih, boxH / faktor);
  const sx = Math.min(iw - sw, Math.max(0, iw * c.x - sw / 2));
  const sy = Math.min(ih - sh, Math.max(0, ih * c.y - sh / 2));
  return {
    sx, sy, sw, sh, dx: 0, dy: 0, dw: boxW, dh: boxH,
    ...c, gueltig: true, beschnitt: sw < iw - .01 || sh < ih - .01, vergroesserung: faktor
  };
}

function uid() {
  if (globalThis.crypto?.randomUUID) return globalThis.crypto.randomUUID();
  // Nur eine lokale Folienkennung, keine Zugangsdaten oder Projektkennung.
  return 'folie-' + Date.now().toString(36) + '-' + Math.random().toString(36).slice(2, 14);
}

const rollenwort = v => text(v).toLowerCase().replace(/ä/g, 'ae').replace(/ö/g, 'oe').replace(/ü/g, 'ue').replace(/ß/g, 'ss');
const rolle = p => text(p.rolle).trim() || text(p.analyse?.rolle).trim();
function kategorie(p) {
  const r = rollenwort(rolle(p));
  if (/abschluss|ausklang|ende/.test(r)) return 'abschluss';
  if (/auftakt|ueberblick|uebersicht|totale|panorama/.test(r) || /(?:^|\W)ort(?:$|\W)/.test(r)) return 'auftakt';
  if (/gruppe|gemeinschaft|publikum|team|menschen|gaeste/.test(r)) return 'gruppe';
  if (/detail|nahaufnahme/.test(r)) return 'detail';
  if (/helfer|aufbau|arbeit/.test(r)) return 'helfer';
  if (/buehne|aktion|action|sport|auftritt/.test(r)) return 'aktion';
  return r || 'foto';
}

function technisch(p) {
  const a = p.analyse || {};
  // Technische Messwerte beschreiben keine Bildinhalte und keine Personen.
  const hell = typeof a.helligkeit === 'number' ? 1 - Math.min(1, Math.abs(a.helligkeit - .5) * 2) : .5;
  return (a.schaerfe ?? .5) * .5 + (a.kontrast ?? .5) * .2 + hell * .2 + Math.min(1, Math.min(p.breite, p.hoehe) / 1080) * .1;
}

function anzahl(v, fallback) {
  return typeof v === 'number' && Number.isFinite(v) ? Math.round(begrenzen(v, 0, GRENZEN.folien, fallback)) : fallback;
}

function waehlen(kandidaten, menge) {
  if (!menge) return [];
  const pool = [...kandidaten], gew = [];
  const nehmen = p => { if (!p) return; gew.push(p); pool.splice(pool.indexOf(p), 1); };
  const schluss = menge > 1 ? pool.find(p => kategorie(p) === 'abschluss') : null;
  const start = pool.find(p => kategorie(p) === 'auftakt') || pool.find(p => p !== schluss) || pool[0];
  nehmen(start);
  while (gew.length < menge - (schluss && schluss !== start ? 1 : 0) && pool.length) {
    const offen = pool.filter(p => p !== schluss);
    if (!offen.length) break;
    nehmen(offen.find(p => kategorie(p) !== kategorie(gew.at(-1))) || offen[0]);
  }
  if (gew.length < menge && schluss && pool.includes(schluss)) nehmen(schluss);
  return gew;
}

function bildCrop(foto, vorhandenerCrop) {
  if (vorhandenerCrop) return cropOrdnen(vorhandenerCrop);
  const manuell = hat(foto, 'fokus'), fokus = manuell ? foto.fokus : foto.analyse?.fokus;
  const ganz = !manuell && (kategorie(foto) === 'gruppe' || !!foto.analyse?.schutz?.length);
  return { ...punkt(fokus), zoom: 1, modus: ganz ? 'ganz' : 'fuellen' };
}

function serieBauen(d, format, kandidaten, zielAnzahl) {
  const menge = Math.min(zielAnzahl, kandidaten.length);
  // Ein Duo braucht ein zusätzliches, eigenes Foto. Es erhöht nicht die Folienzahl.
  let fotos = waehlen(kandidaten, menge), paar = [];
  const hochkant = kandidaten.filter(p => p.breite <= p.hoehe && kategorie(p) !== 'gruppe' && !p.analyse?.schutz?.length && p !== fotos[0] && p !== fotos.at(-1));
  if (menge >= 4 && kandidaten.length > menge && hochkant.length >= 2) {
    paar = hochkant.slice(0, 2);
    fotos = waehlen(kandidaten.filter(p => !paar.includes(p)), menge - 1);
  }
  const cropAlt = new Map(), folieAlt = new Map();
  for (const s of d[format]) {
    for (const b of s.bilder) if (!cropAlt.has(b.fotoId)) cropAlt.set(b.fotoId, b.crop);
    const key = s.bilder.map(b => b.fotoId).join('|');
    if (key && !folieAlt.has(key)) folieAlt.set(key, s);
  }
  let fotoIndex = 0;
  return Array.from({ length: menge }, (_, index) => {
    const duoIndex = Math.max(1, Math.floor(menge / 2) - 1);
    const art = index === 0 ? 'auftakt' : index === menge - 1 ? 'abschluss' : paar.length && index === duoIndex ? 'duo' : index === Math.floor(menge / 2) ? 'papier' : 'foto';
    const bilder = art === 'duo' ? paar : fotos.slice(fotoIndex, fotoIndex + 1);
    if (art !== 'duo') fotoIndex++;
    const alt = folieAlt.get(bilder.map(p => p.id).join('|'));
    return {
      id: alt?.id || uid(), art,
      bilder: bilder.map(p => ({ fotoId: p.id, crop: bildCrop(p, cropAlt.get(p.id)) })),
      titel: alt?.titel ?? (index === 0 ? d.titel || d.fakten.anlass : ''),
      text: alt?.text ?? (index === 0 ? [d.fakten.datum, d.fakten.ort].filter(Boolean).join(' · ') : art === 'papier' ? d.fakten.text : art === 'abschluss' ? d.fakten.rolle : ''),
      alt: alt?.alt || ''
    };
  });
}

// Nur nach ausdrücklicher Nutzeraktion aufrufen. Normalisieren selbst ruft dies nie auf.
export function serieVorschlagen(value, optionen = {}) {
  const d = normalisieren(value), o = obj(optionen), auswahl = liste(o.auswahl), bekannt = new Map(d.fotos.map(p => [p.id, p]));
  const kiRang = new Map();
  for (const eintrag of auswahl) {
    const a = obj(eintrag), p = bekannt.get(a.fotoId);
    if (!p || kiRang.has(p.id)) continue;
    kiRang.set(p.id, kiRang.size);
    const vor = p.analyse || {}, neu = analyseOrdnen(a);
    p.analyse = { ...vor, ...neu };
    // fotos.rolle und fotos.fokus sind manuell und bleiben unangetastet.
  }
  const bildinhalt = new Map(), kennungen = new Set();
  const vorrang = p => (text(p.rolle).trim() ? 4 : 0) + (hat(p, 'fokus') ? 2 : 0) + (kiRang.has(p.id) ? 1 : 0);
  for (const p of d.fotos) {
    if ((Array.isArray(o.auswahl) && !kiRang.has(p.id)) || p.ausgeschlossen || !UUID.test(p.id) || p.breite <= 0 || p.hoehe <= 0) continue;
    if (kennungen.has(p.id)) continue;
    kennungen.add(p.id);
    const key = SHA.test(p.hash) ? 'hash:' + p.hash : 'id:' + p.id, vorher = bildinhalt.get(key);
    if (!vorher || vorrang(p) > vorrang(vorher)) bildinhalt.set(key, p);
  }
  const kandidaten = [...bildinhalt.values()].map((p, index) => ({ p, index })).sort((a, b) => {
    if (kiRang.size) return (kiRang.get(a.p.id) ?? 1000 + a.index) - (kiRang.get(b.p.id) ?? 1000 + b.index);
    return technisch(b.p) - technisch(a.p) || a.index - b.index;
  }).map(x => x.p);
  const storytexte = new Map(d.story.map((s,i) => [s.id,d.texte.story[i] ?? '']));
  d.feed = serieBauen(d, 'feed', kandidaten, anzahl(o.feedAnzahl, 8));
  d.story = serieBauen(d, 'story', kandidaten, anzahl(o.storyAnzahl, 3));
  if (!d.texte.instagram.trim()) {
    d.texte.instagram = [d.fakten.anlass || d.titel, d.fakten.text, [d.fakten.datum, d.fakten.ort].filter(Boolean).join(' · '), d.fakten.rolle].filter(Boolean).join('\n\n');
  }
  d.texte.story = d.story.map(s => storytexte.has(s.id) ? storytexte.get(s.id) : [s.titel, s.text].filter(Boolean).join('\n'));
  return d;
}

// KI-Storytexte beziehen sich auf die ausgewählten Foto-IDs, nie auf einen Folienindex.
export function storyTexteZuordnen(projekt, auswahl, texte) {
  const zuordnung = new Map(liste(auswahl).map((a,i) => [obj(a).fotoId,text(liste(texte)[i])]));
  return liste(projekt.story).map(s => [...new Set(liste(s.bilder).map(b=>zuordnung.get(b.fotoId)).filter(Boolean))].join('\n\n'));
}

function abstand(a, b) {
  let n = 0;
  for (let i = 0; i < 16; i++) {
    let xor = parseInt(a[i], 16) ^ parseInt(b[i], 16);
    while (xor) { n++; xor &= xor - 1; }
  }
  return n;
}

export function pruefen(value, format) {
  const raw = obj(value), d = normalisieren(raw), fehler = [], hinweise = [];
  const error = s => { if (!fehler.includes(s)) fehler.push(s); };
  const hint = s => { if (!hinweise.includes(s)) hinweise.push(s); };
  const laenge = (v, max, label) => { if (text(v).length > max) error(label + ' ist zu lang. Höchstens ' + max + ' Zeichen.'); };
  if (raw.schema !== undefined && raw.schema !== 1) error('Diese Fotoserie hat eine unbekannte Datenfassung.');
  if (raw.vorlage !== undefined && raw.vorlage !== 'V1') error('Diese Fotoserie verwendet eine unbekannte Vorlage.');
  if (!d.titel.trim()) error('Bitte einen Titel für die Fotoserie eintragen.');
  laenge(d.titel, 160, 'Der Titel');
  for (const [k, max] of Object.entries({ anlass: 240, datum: 80, ort: 240, rolle: 240, text: 6000 })) laenge(d.fakten[k], max, 'Die Angabe ' + k);
  if (d.fotos.length > GRENZEN.fotos) error('Eine Fotoserie kann höchstens 40 Fotos enthalten.');
  const fotos = new Map(), hashes = new Map();
  for (const [index, p] of d.fotos.entries()) {
    const label = 'Foto ' + (index + 1);
    if (!UUID.test(p.id)) error(label + ': Die Bildkennung ist ungültig.');
    if (fotos.has(p.id)) error(label + ': Die Bildkennung kommt mehrfach vor.');
    fotos.set(p.id, p);
    const pfad = p.pfad.match(/^([0-9a-f-]{36})\/([0-9a-f-]{36})\.(jpg|png|webp)$/i);
    if (!pfad || !UUID.test(pfad[1]) || !UUID.test(pfad[2]) || pfad[2].toLowerCase() !== p.id.toLowerCase()) error(label + ': Der gespeicherte Bildpfad ist ungültig.');
    const original = obj(liste(raw.fotos)[index]);
    if (![original.breite, original.hoehe].every(n => Number.isInteger(n) && n > 0 && n <= 20000)) error(label + ': Die Bildmaße fehlen oder sind ungültig.');
    if (!SHA.test(p.hash)) error(label + ': Die Bildprüfsumme fehlt oder ist ungültig.');
    else if (hashes.has(p.hash)) hint(label + ' hat denselben Bildinhalt wie Foto ' + hashes.get(p.hash) + '. Im Vorschlag wird es nur einmal verwendet.');
    else hashes.set(p.hash, index + 1);
    laenge(p.name, 240, label + ': Der Dateiname');
    laenge(p.rolle, 80, label + ': Die Rolle');
  }
  const formate = format === undefined ? Object.keys(FORMATE) : [format];
  if (formate.some(f => !FORMATE[f])) error('Das Ausgabeformat ist unbekannt.');
  for (const f of formate.filter(f => FORMATE[f])) {
    const titel = f === 'feed' ? 'Feed' : 'Story', folien = d[f], ids = new Set(), benutzt = new Set();
    if (!folien.length) error('Für ' + titel + ' fehlen noch Folien.');
    if (folien.length > GRENZEN.folien) error(titel + ' enthält mehr als 20 Folien. Auftakt und Abschluss zählen mit.');
    for (const [index, s] of folien.entries()) {
      const label = titel + ', Folie ' + (index + 1), original = obj(liste(raw[f])[index]);
      if (!s.id || s.id.length > 80 || ids.has(s.id)) error(label + ': Die Folienkennung fehlt oder kommt mehrfach vor.');
      ids.add(s.id);
      if (!ARTEN.has(s.art)) error(label + ': Die Gestaltung ist unbekannt.');
      if (s.bilder.length !== (s.art === 'duo' ? 2 : 1)) error(label + ': ' + (s.art === 'duo' ? 'Ein Duo braucht zwei Fotos.' : 'Bitte genau ein Foto auswählen.'));
      laenge(s.titel, 180, label + ': Der Titel'); laenge(s.text, 1200, label + ': Der Text'); laenge(s.alt, 1000, label + ': Der Alternativtext');
      if (!s.alt.trim()) hint(label + ': Alternativtext vor der Veröffentlichung ergänzen.');
      for (const [bildIndex, b] of s.bilder.entries()) {
        const p = fotos.get(b.fotoId), c = obj(obj(liste(original.bilder)[bildIndex]).crop);
        if (!p) { error(label + ': Ein ausgewähltes Foto fehlt.'); continue; }
        if (p.ausgeschlossen) hint(label + ': Das Foto ist in der Auswahl ausgeschlossen. Die vorhandene Folie bleibt erhalten.');
        if (benutzt.has(p.id)) hint(label + ': Dieses Foto wird in der Serie mehrfach verwendet.');
        benutzt.add(p.id);
        if (Object.keys(c).length && (!['fuellen', 'ganz'].includes(c.modus) || ![c.x, c.y].every(n => typeof n === 'number' && Number.isFinite(n) && n >= 0 && n <= 1) || !(typeof c.zoom === 'number' && Number.isFinite(c.zoom) && c.zoom >= 1 && c.zoom <= 8))) error(label + ': Der Bildausschnitt ist ungültig.');
        const box = FORMATE[f], z = zuschnitt(p.breite, p.hoehe, s.art === 'duo' ? box.breite / 2 : box.breite, box.hoehe, b.crop);
        if (z.vergroesserung > 1.05) hint(label + ': Das Foto wird vergrößert. Bitte die Schärfe prüfen.');
        if (z.beschnitt && p.analyse?.schutz?.length) hint(label + ': Der Ausschnitt kann markierte Bildbereiche abschneiden. Bitte den Ausschnitt prüfen oder Ganzbild wählen.');
      }
    }
    let aehnliche = 0;
    const verwendet = [...benutzt].map(id => fotos.get(id)).filter(Boolean);
    for (let i = 0; i < verwendet.length; i++) for (let j = i + 1; j < verwendet.length; j++) {
      const a = verwendet[i], b = verwendet[j];
      if (a.hash !== b.hash && DHASH.test(a.analyse?.dhash || '') && DHASH.test(b.analyse?.dhash || '') && abstand(a.analyse.dhash, b.analyse.dhash) <= 6) aehnliche++;
    }
    if (aehnliche) hint(titel + ': ' + aehnliche + ' technisch ähnliche Bildpaare. Bitte vergleichen, es wurde kein Bild entfernt.');
  }
  laenge(d.texte.instagram, 2200, 'Der Instagram-Bildtext');
  if (d.texte.story.length > 20) error('Es sind mehr als 20 Storytexte vorhanden.');
  for (const [i, s] of d.texte.story.entries()) laenge(s, 1000, 'Storytext ' + (i + 1));
  if (!d.fakten.datum.trim()) hint('Ein Datum ist noch nicht eingetragen.');
  if (!d.fakten.ort.trim()) hint('Ein Ort ist noch nicht eingetragen.');
  return { fehler, hinweise };
}

// index ist nullbasiert. Dateinamen sind nur eine Orientierung bei der Auswahl.
export function dateiname(titel, format, index) {
  if (!FORMATE[format]) throw Error('Das Ausgabeformat ist unbekannt.');
  const name = text(titel).toLowerCase().replace(/ä/g, 'ae').replace(/ö/g, 'oe').replace(/ü/g, 'ue').replace(/ß/g, 'ss')
    .normalize('NFKD').replace(/\p{M}/gu, '').replace(/[^a-z0-9]+/g, '_').replace(/^_+|_+$/g, '').slice(0, 80).replace(/_+$/g, '') || 'fotoserie';
  const n = Number.isInteger(index) && index >= 0 ? Math.min(index + 1, 999) : 1;
  return String(n).padStart(2, '0') + '_' + name + '_' + format + '.jpg';
}

export function texteExport(value, format = 'feed') {
  if (!FORMATE[format]) throw Error('Das Ausgabeformat ist unbekannt.');
  const d = normalisieren(value), zeilen = [d.titel || 'Fotoserie', ''];
  if (format === 'feed') zeilen.push('Instagram-Bildtext', d.texte.instagram, '');
  else zeilen.push('Storytexte', ...d.texte.story.map((t, i) => String(i + 1).padStart(2, '0') + '\n' + t + '\n'));
  for (const [i, s] of d[format].entries()) {
    zeilen.push(dateiname(d.titel, format, i), ...[s.titel, s.text].filter(Boolean), 'Alternativtext: ' + (s.alt || '(noch ergänzen)'), '');
  }
  zeilen.push('Die Nummerierung hilft bei der Auswahl. Reihenfolge und Ausschnitte in Instagram vor dem Teilen prüfen.');
  return zeilen.join('\n');
}

function stabil(value) {
  if (Array.isArray(value)) return '[' + value.map(stabil).join(',') + ']';
  if (value && typeof value === 'object') return '{' + Object.keys(value).sort().map(k => JSON.stringify(k) + ':' + stabil(value[k])).join(',') + '}';
  return JSON.stringify(value);
}

// Alle vertraglichen Felder, beide Formate und sämtliche Ausschnitte sind enthalten.
// Änderungsfingerabdruck für den Editor, keine kryptographische Freigabe.
export function standHash(value) {
  const s = stabil(normalisieren(value)); let a = 2166136261, b = 2246822507;
  for (let i = 0; i < s.length; i++) { const c = s.charCodeAt(i); a = Math.imul(a ^ c, 16777619) >>> 0; b = Math.imul(b ^ c, 3266489909) >>> 0; }
  return 'V1-' + a.toString(16).padStart(8, '0') + b.toString(16).padStart(8, '0') + '-' + s.length.toString(36);
}
