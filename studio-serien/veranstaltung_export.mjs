// Der Export verwendet denselben Satz wie die Vorschau. Kein Versand, keine Veröffentlichung.
import { normalisieren, pruefen, FORMATE, dateiname, texteExport } from './veranstaltung_core.mjs';

export const PAKET_LIMIT = 48 * 1024 * 1024;
export async function jpeg(canvas) {
  const blob = await new Promise((ok, nein) => {
    try { canvas.toBlob(ok, 'image/jpeg', .94); } catch (e) { nein(e); }
  });
  if (!blob?.size || blob.type !== 'image/jpeg') throw Error('Das Bild konnte nicht als JPEG erzeugt werden. Bitte einen aktuellen Browser verwenden.');
  if (blob.size > 8 * 1024 * 1024) throw Error('Ein Bild ist größer als 8 MiB. Bitte den Ausschnitt prüfen und erneut versuchen.');
  return blob;
}

export async function bildErstellen({ projekt, format, index, malen, laden, wappen, canvasErstellen }) {
  if (!FORMATE[format] || !Number.isInteger(index) || !projekt[format]?.[index]) throw Error('Bitte eine vorhandene Folie auswählen.');
  const folie = projekt[format][index], bilder = new Map();
  for (const b of folie.bilder) bilder.set(b.fotoId, await laden(b.fotoId));
  const canvas = canvasErstellen();
  try {
    const r = await malen(canvas, { projekt, format, folie, bilder, wappen, hilfen:false, index:index + 1, gesamt:projekt[format].length });
    if (r.fehler?.length) throw Error('Folie ' + (index + 1) + ': ' + r.fehler.join(' '));
    const mass = FORMATE[format];
    if (canvas.width !== mass.breite || canvas.height !== mass.hoehe) throw Error('Die Bildmaße stimmen nicht. Der Export wurde angehalten.');
    return { name:dateiname(projekt.titel, format, index), blob:await jpeg(canvas), hinweise:r.hinweise || [] };
  } finally { canvas.width = 0; canvas.height = 0; }
}

export async function paketErstellen(optionen) {
  const projekt = normalisieren(optionen.projekt), format = optionen.format;
  const p = pruefen(projekt, format);
  if (p.fehler.length) throw Error(p.fehler.join(' '));
  const dateien = [], hinweise = [...p.hinweise]; let bytes = 0;
  for (let index = 0; index < projekt[format].length; index++) {
    optionen.fortschritt?.(index, projekt[format].length);
    const f = await bildErstellen({ ...optionen, projekt, index });
    bytes += f.blob.size;
    if (bytes > PAKET_LIMIT) throw Error('Die Serie ist größer als 48 MiB. Bitte weniger Folien wählen oder die Bilder einzeln laden.');
    dateien.push(f); hinweise.push(...f.hinweise);
  }
  const zip = await optionen.zipErstellen();
  for (const f of dateien) zip.file(f.name, await f.blob.arrayBuffer(), { compression:'STORE' });
  zip.file('bildtexte.txt', '\ufeff' + texteExport(projekt, format));
  zip.file('so_geht_es.txt', 'Die JPG-Dateien sind in der gewünschten Reihenfolge nummeriert.\n\n' +
    (format === 'feed' ? 'In Instagram einen Beitrag mit mehreren Bildern anlegen. Die Bilder in der gewünschten Reihenfolge auswählen. Alle Bilder haben 4:5 und 1080 × 1350 Pixel.\n' : 'Die Storybilder einzeln in der gewünschten Reihenfolge auswählen. Alle Bilder haben 9:16 und 1080 × 1920 Pixel.\n') +
    '\nBildtext und Alternativtexte stehen in bildtexte.txt. Die Bildauswahl in Instagram vor dem Veröffentlichen prüfen. Dateinamen legen die Reihenfolge in der Foto-App nicht verbindlich fest.\n\nAuf dem iPhone liegt die ZIP-Datei in Dateien unter Downloads. Antippen entpackt sie. Gewünschte JPG-Dateien auswählen und über Teilen in Fotos sichern. Ein Download veröffentlicht nichts.\n');
  const blob = await zip.generateAsync({ type:'blob', compression:'STORE' });
  if (blob.size > PAKET_LIMIT) throw Error('Das Paket ist größer als 48 MiB. Bitte weniger Folien wählen oder die Bilder einzeln laden.');
  optionen.fortschritt?.(dateien.length, dateien.length);
  return { blob, dateien, hinweise:[...new Set(hinweise)], name:dateiname(projekt.titel, format, 0).replace(/^01_/, '').replace(/\.jpg$/, '.zip') };
}
