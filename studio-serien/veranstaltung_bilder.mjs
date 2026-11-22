// Ausschließlich lokale Rasteraufbereitung. Originaldateien bleiben unverändert.
import { GRENZEN } from './veranstaltung_core.mjs';

let warteschlange = Promise.resolve();
const seriell = arbeit => {
  const lauf = warteschlange.then(arbeit);
  warteschlange = lauf.catch(() => {});
  return lauf;
};
const begrenzen = v => Math.min(1, Math.max(0, v));
const rasterFormat = /^(?:image\/(?:jpeg|jpg|png|webp|avif|heic|heif|bmp|tiff|gif))$/i;
const rasterName = /\.(?:jpe?g|png|webp|avif|hei[cf]|bmp|tiff?|gif)$/i;
const heic = file => /hei[cf]/i.test(file.type || '') || /\.hei[cf]$/i.test(file.name || '');

function eingabePruefen(file) {
  if (!file || typeof file.arrayBuffer !== 'function' || !Number.isFinite(file.size) || file.size <= 0) throw Error('Bitte eine lesbare Bilddatei auswählen.');
  if (file.size > GRENZEN.eingabeBytes) throw Error('Ein Eingabefoto darf höchstens 25 MiB groß sein.');
  const typ = (file.type || '').split(';')[0].trim();
  if ((typ && !rasterFormat.test(typ) && !(typ === 'application/octet-stream' && rasterName.test(file.name || ''))) || (!typ && !rasterName.test(file.name || ''))) throw Error('Bitte ein Foto als JPEG, PNG, WebP oder HEIC auswählen. Vektordateien sind hier nicht vorgesehen.');
}

function nichtLesbar(file) {
  return Error(heic(file)
    ? 'Dieses HEIC-Foto kann der Browser nicht lesen. Bitte als JPEG oder PNG exportieren und erneut auswählen.'
    : 'Dieses Foto kann der Browser nicht lesen. Bitte als JPEG oder PNG exportieren und erneut auswählen.');
}

async function bildLesen(file) {
  if (typeof globalThis.createImageBitmap === 'function') {
    try {
      // Die Browserausrichtung berücksichtigt EXIF. Keine zweite manuelle Rotation.
      const bild = await globalThis.createImageBitmap(file, { imageOrientation: 'from-image', colorSpaceConversion: 'default' });
      return { bild, breite: bild.width, hoehe: bild.height, freigeben: () => bild.close?.() };
    } catch (_) { /* Safari kann manche HEICs über <img>, obwohl ImageBitmap fehlschlägt. */ }
  }
  if (typeof globalThis.Image !== 'function' || !globalThis.URL?.createObjectURL) throw nichtLesbar(file);
  const url = globalThis.URL.createObjectURL(file), bild = new globalThis.Image();
  try {
    await new Promise((resolve, reject) => {
      const zeit = setTimeout(() => { bild.onload = bild.onerror = null; reject(nichtLesbar(file)); }, 20000);
      bild.onload = () => { clearTimeout(zeit); resolve(); };
      bild.onerror = () => { clearTimeout(zeit); reject(nichtLesbar(file)); };
      bild.src = url;
    });
    return {
      bild, breite: bild.naturalWidth || bild.width, hoehe: bild.naturalHeight || bild.height,
      freigeben: () => { bild.src = ''; globalThis.URL.revokeObjectURL(url); }
    };
  } catch (error) {
    bild.src = ''; globalThis.URL.revokeObjectURL(url); throw error;
  }
}

function kante(breite, hoehe, max) {
  const faktor = Math.min(1, max / Math.max(breite, hoehe));
  return { breite: Math.max(1, Math.round(breite * faktor)), hoehe: Math.max(1, Math.round(hoehe * faktor)) };
}

function werkstatt() {
  const leinwaende = new Set();
  return {
    leinwand(breite, hoehe) {
      let canvas;
      if (globalThis.document?.createElement) canvas = globalThis.document.createElement('canvas');
      else if (typeof globalThis.OffscreenCanvas === 'function') canvas = new globalThis.OffscreenCanvas(breite, hoehe);
      else throw Error('Die Bildaufbereitung wird von diesem Browser nicht unterstützt.');
      canvas.width = breite; canvas.height = hoehe;
      leinwaende.add(canvas);
      const ctx = canvas.getContext('2d', { alpha: false, colorSpace: 'srgb', colorType: 'unorm8' });
      if (!ctx) throw Error('Die Bildfläche konnte nicht vorbereitet werden.');
      // Transparenz wird ausdrücklich weiß, statt beim JPEG-Export schwarz zu werden.
      ctx.fillStyle = '#ffffff'; ctx.fillRect(0, 0, breite, hoehe);
      ctx.imageSmoothingEnabled = true; ctx.imageSmoothingQuality = 'high';
      return { canvas, ctx };
    },
    weg(canvas) { canvas.width = 0; canvas.height = 0; leinwaende.delete(canvas); },
    schliessen() { for (const canvas of leinwaende) { canvas.width = 0; canvas.height = 0; } leinwaende.clear(); }
  };
}

async function jpeg(canvas, quality) {
  let blob;
  if (typeof canvas.convertToBlob === 'function') blob = await canvas.convertToBlob({ type: 'image/jpeg', quality });
  else blob = await new Promise((resolve, reject) => {
    try { canvas.toBlob(resolve, 'image/jpeg', quality); } catch (error) { reject(error); }
  });
  if (!blob || !blob.size) throw Error('Das JPEG konnte nicht erzeugt werden. Bitte das Foto erneut versuchen.');
  if (String(blob.type).toLowerCase() !== 'image/jpeg') throw Error('Der Browser konnte kein JPEG erzeugen. Bitte einen aktuellen Browser verwenden.');
  return blob;
}

async function begrenztesJpeg(werk, quelle, maxKante, maxBytes, startQualitaet) {
  const mass = kante(quelle.width, quelle.height, maxKante);
  let { canvas, ctx } = werk.leinwand(mass.breite, mass.hoehe);
  ctx.drawImage(quelle, 0, 0, canvas.width, canvas.height);
  // Erst Qualität anpassen, danach bei Bedarf die tatsächlichen Pixelmaße reduzieren.
  for (let runde = 0; runde < 10; runde++) {
    for (const quality of [startQualitaet, .82, .72, .62, .52]) {
      const blob = await jpeg(canvas, quality);
      if (blob.size <= maxBytes) {
        const ergebnis = { blob, breite: canvas.width, hoehe: canvas.height };
        werk.weg(canvas); return ergebnis;
      }
    }
    const breite = Math.max(1, Math.floor(canvas.width * .8)), hoehe = Math.max(1, Math.floor(canvas.height * .8));
    if (breite === canvas.width && hoehe === canvas.height) break;
    const neu = werk.leinwand(breite, hoehe);
    neu.ctx.drawImage(canvas, 0, 0, breite, hoehe); werk.weg(canvas);
    canvas = neu.canvas; ctx = neu.ctx;
  }
  throw Error('Das Foto konnte nicht innerhalb der zulässigen Dateigröße aufbereitet werden.');
}

function analyse(werk, bild) {
  const { canvas, ctx } = werk.leinwand(64, 64);
  try {
    ctx.drawImage(bild, 0, 0, 64, 64);
    const pixels = ctx.getImageData(0, 0, 64, 64).data, grau = new Float64Array(4096);
    let summe = 0, quadrate = 0, kanten = 0, nachbarn = 0;
    for (let i = 0; i < grau.length; i++) {
      const j = i * 4, wert = (.2126 * pixels[j] + .7152 * pixels[j + 1] + .0722 * pixels[j + 2]) / 255;
      grau[i] = wert; summe += wert; quadrate += wert * wert;
      if (i % 64) { kanten += Math.abs(wert - grau[i - 1]); nachbarn++; }
      if (i >= 64) { kanten += Math.abs(wert - grau[i - 64]); nachbarn++; }
    }
    let dhash = '', nibble = 0, bits = 0;
    for (let y = 0; y < 8; y++) for (let x = 0; x < 8; x++) {
      const row = Math.floor((y + .5) * 8) * 64;
      const a = grau[row + Math.floor(x * 63 / 8)], b = grau[row + Math.floor((x + 1) * 63 / 8)];
      nibble = (nibble << 1) | (a > b ? 1 : 0); bits++;
      if (bits === 4) { dhash += nibble.toString(16); nibble = 0; bits = 0; }
    }
    const helligkeit = summe / grau.length;
    // Messwerte für Helligkeit, Kontrast und Kantenanteil, keine Inhalts-/Personenerkennung.
    return {
      helligkeit: begrenzen(helligkeit),
      kontrast: begrenzen(Math.sqrt(Math.max(0, quadrate / grau.length - helligkeit * helligkeit)) * 2),
      schaerfe: begrenzen(kanten / nachbarn * 4), dhash
    };
  } catch (_) { return {}; }
  finally { werk.weg(canvas); }
}

async function pruefsumme(blob) {
  if (!globalThis.crypto?.subtle?.digest) throw Error('Die Bildprüfsumme ist hier nicht verfügbar. Bitte einen aktuellen Browser über eine sichere Verbindung verwenden.');
  const bytes = await globalThis.crypto.subtle.digest('SHA-256', await blob.arrayBuffer());
  return [...new Uint8Array(bytes)].map(n => n.toString(16).padStart(2, '0')).join('');
}

async function aufbereiten(file, nurMiniatur) {
  eingabePruefen(file);
  let quelle; const werk = werkstatt();
  try {
    quelle = await bildLesen(file);
    if (![quelle.breite, quelle.hoehe].every(n => Number.isInteger(n) && n > 0 && n <= 20000)) throw Error('Das Foto hat ungültige oder zu große Bildmaße. Höchstens 20.000 Pixel je Seite sind möglich.');
    if (nurMiniatur) return await begrenztesJpeg(werk, quelle.bild, GRENZEN.vorschauKante, GRENZEN.vorschauBytes, .88);
    const mass = kante(quelle.breite, quelle.hoehe, GRENZEN.kante);
    const { canvas, ctx } = werk.leinwand(mass.breite, mass.hoehe);
    ctx.drawImage(quelle.bild, 0, 0, mass.breite, mass.hoehe);
    // Das große Kamerabild wird vor JPEG-Kodierung und Vorschau wieder freigegeben.
    quelle.freigeben(); quelle = null;
    const messung = analyse(werk, canvas);
    const bild = await begrenztesJpeg(werk, canvas, GRENZEN.kante, GRENZEN.bildBytes, .92);
    const klein = await begrenztesJpeg(werk, canvas, GRENZEN.vorschauKante, GRENZEN.vorschauBytes, .88);
    const hash = await pruefsumme(bild.blob);
    return {
      ...bild, hash, analyse: messung, vorschau: klein.blob,
      name: typeof file.name === 'string' ? file.name.replace(/[\u0000-\u001f\u007f]/g, '').slice(0, 240) : 'Foto.jpg'
    };
  } finally { try { quelle?.freigeben(); } finally { werk.schliessen(); } }
}

// Mehrere Aufrufe werden ebenfalls sequenziell abgearbeitet, um Bildspeicher freizugeben.
export function vorbereiten(file) { return seriell(() => aufbereiten(file, false)); }
export function miniatur(blob) { return seriell(() => aufbereiten(blob, true)); }
