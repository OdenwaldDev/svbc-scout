/* Veranstaltungen V1: derselbe feste Satz für Vorschau und Export.
   Fotos und Schriftdateien lädt der Host. Dieses Modul lädt keine Quellen nach. */
import { zuschnitt, FORMATE } from './veranstaltung_core.mjs';

export const CI = Object.freeze({
  navy:'#041127', navy2:'#0B1A31', blau:'#2F8BEF', orange:'#FF8731',
  papier:'#F6F6F2', grau:'#AAB5C8', linie:'#22345A'
});
const RAND = 72;
const ARTEN = new Set(['auftakt', 'foto', 'papier', 'duo', 'abschluss']);
const sauber = value => String(value == null ? '' : value).replace(/\r\n?/g, '\n').trim();
const masse = bild => ({
  w:Number(bild && (bild.naturalWidth || bild.videoWidth || bild.width)) || 0,
  h:Number(bild && (bild.naturalHeight || bild.videoHeight || bild.height)) || 0
});
const quelle = (bilder, id) => bilder instanceof Map ? bilder.get(id) : bilder && bilder[id];
const rect = (x, y, w, h) => ({ x, y, w, h });
function fuellen(ctx, box, farbe){ ctx.fillStyle = farbe; ctx.fillRect(box.x, box.y, box.w, box.h); }
function font(ctx, familie, groesse, gewicht){ ctx.font = `${gewicht} ${groesse}px "${familie}", sans-serif`; }

/* Keine heimliche Schriftverkleinerung, Auslassung oder Wortabkürzung.
   Ein nicht passender Text wird als Fehler an den Host gemeldet. */
function zeilen(ctx, text, breite){
  const aus = [];
  for(const absatz of text.split('\n')){
    if(!absatz.trim()){ aus.push(''); continue; }
    let zeile = '';
    for(const wort of absatz.trim().split(/\s+/)){
      if(ctx.measureText(wort).width > breite + .5) return null;
      const neu = zeile ? zeile + ' ' + wort : wort;
      if(ctx.measureText(neu).width <= breite + .5) zeile = neu;
      else { aus.push(zeile); zeile = wort; }
    }
    if(zeile) aus.push(zeile);
  }
  return aus;
}
function textblock(s, inhalt, box, optionen){
  const t = sauber(inhalt); if(!t) return;
  const o = Object.assign({ familie:'SGB', gewicht:600, groesse:40, zeilenhoehe:1.25, maxZeilen:2, farbe:s.c.navy, feld:'Text' }, optionen);
  const text = o.versalien ? t.toLocaleUpperCase('de-DE') : t;
  const ctx = s.ctx; font(ctx, o.familie, o.groesse, o.gewicht);
  const z = zeilen(ctx, text, box.w), abstand = o.groesse * o.zeilenhoehe;
  if(!z || z.length > o.maxZeilen || (z.length && o.groesse + (z.length - 1) * abstand > box.h + .5)){
    s.fehler.push(`${o.feld} ist zu lang. Bitte kürzen oder ein anderes Layout wählen.`);
    font(ctx, 'SGB', 28, 600); ctx.fillStyle = o.farbe; ctx.textBaseline = 'top';
    ctx.fillText(`${o.feld} zu lang`, box.x, box.y + 4);
    s.textRects.push({ ...box, feld:o.feld, fehler:true });
    return;
  }
  ctx.fillStyle = o.farbe; ctx.textBaseline = 'top'; ctx.textAlign = 'left';
  z.forEach((zeile, i) => ctx.fillText(zeile, box.x, box.y + i * abstand));
  s.textRects.push({ x:box.x, y:box.y, w:box.w, h:z.length ? o.groesse + (z.length - 1) * abstand : 0, feld:o.feld, zeilen:z.length, groesse:o.groesse });
}
function fehlstelle(s, box, meldung){
  fuellen(s.ctx, box, s.dunkel ? s.c.navy2 : '#E3E7E8');
  s.ctx.save(); s.ctx.strokeStyle = s.dunkel ? s.c.grau : s.c.navy; s.ctx.lineWidth = 2;
  s.ctx.setLineDash([10, 10]); s.ctx.strokeRect(box.x + 1, box.y + 1, box.w - 2, box.h - 2); s.ctx.restore();
  textblock(s, meldung, rect(box.x + 24, box.y + 24, box.w - 48, 84), { groesse:28, maxZeilen:2, farbe:s.dunkel ? s.c.papier : s.c.navy, feld:'Bildhinweis' });
}
function foto(s, benutzung, box){
  if(!benutzung || !benutzung.fotoId){ s.fehler.push('Ein Foto für dieses Layout fehlt.'); fehlstelle(s, box, 'Foto fehlt'); return; }
  const p = (s.projekt.fotos || []).find(f => f.id === benutzung.fotoId), bild = quelle(s.bilder, benutzung.fotoId);
  if(!p || !bild){ s.fehler.push(`Die Quelle für Foto „${p && p.name || benutzung.fotoId}“ fehlt.`); fehlstelle(s, box, 'Foto konnte nicht geladen werden'); return; }
  const {w, h} = masse(bild);
  if(w <= 0 || h <= 0){ s.fehler.push(`Foto „${p.name || p.id}“ ist noch nicht lesbar.`); fehlstelle(s, box, 'Foto ist noch nicht lesbar'); return; }
  const crop = benutzung.crop || { x:.5, y:.5, zoom:1, modus:'ganz' };
  const a = zuschnitt(w, h, box.w, box.h, crop);
  if(!a || a.gueltig === false || ![a.sx,a.sy,a.sw,a.sh,a.dx,a.dy,a.dw,a.dh].every(Number.isFinite) || a.sw <= 0 || a.sh <= 0 || a.dw <= 0 || a.dh <= 0){
    s.fehler.push(`Der Ausschnitt von „${p.name || p.id}“ ist ungültig.`); fehlstelle(s, box, 'Ausschnitt bitte neu einstellen'); return;
  }
  fuellen(s.ctx, box, s.dunkel ? s.c.navy2 : '#E3E7E8');
  s.ctx.save(); s.ctx.beginPath(); s.ctx.rect(box.x, box.y, box.w, box.h); s.ctx.clip();
  try { s.ctx.drawImage(bild, a.sx, a.sy, a.sw, a.sh, box.x + a.dx, box.y + a.dy, a.dw, a.dh); }
  catch(e){ s.ctx.restore(); s.fehler.push(`Foto „${p.name || p.id}“ konnte nicht gezeichnet werden.`); fehlstelle(s, box, 'Foto konnte nicht gezeichnet werden'); return; }
  s.ctx.restore();
  const verg = Math.max(a.dw / a.sw, a.dh / a.sh);
  if(verg > 1.15) s.hinweise.push(`„${p.name || p.id}“ wird in diesem Ausschnitt vergrößert. Bitte die Schärfe prüfen.`);
  const schutz = p.analyse && p.analyse.schutz;
  if(Array.isArray(schutz) && schutz.some(b => b && Number.isFinite(b.x) && Number.isFinite(b.y) && Number.isFinite(b.w) && Number.isFinite(b.h) &&
    (b.x * w < a.sx - 1 || b.y * h < a.sy - 1 || (b.x + b.w) * w > a.sx + a.sw + 1 || (b.y + b.h) * h > a.sy + a.sh + 1)))
    s.hinweise.push(`Der Ausschnitt von „${p.name || p.id}“ schneidet einen markierten Bildbereich an. Bitte prüfen oder das ganze Foto zeigen.`);
  s.fotoRects.push({ ...box, fotoId:p.id, sx:a.sx, sy:a.sy, sw:a.sw, sh:a.sh,
    dx:box.x + a.dx, dy:box.y + a.dy, dw:a.dw, dh:a.dh, quellBreite:w, quellHoehe:h, vergroesserung:verg, modus:a.modus || crop.modus });
}
function logo(s, box){
  const bild = s.wappen, m = masse(bild);
  if(!bild || !m.w || !m.h){ s.fehler.push('Das Vereinswappen fehlt.'); return; }
  const f = Math.min(box.w / m.w, box.h / m.h);
  try { s.ctx.drawImage(bild, box.x + box.w - m.w * f, box.y + (box.h - m.h * f) / 2, m.w * f, m.h * f); }
  catch(e){ s.fehler.push('Das Vereinswappen konnte nicht gezeichnet werden.'); }
}
function kopf(s){
  const y = s.story ? 300 : 72, tinte = s.dunkel ? s.c.papier : s.c.navy;
  textblock(s, 'SV/BSC MÖRLENBACH', rect(RAND, y + 4, 680, 42), { groesse:28, maxZeilen:1, gewicht:700, farbe:tinte, feld:'Absender' });
  const f = s.projekt.fakten || {}, meta = [sauber(f.datum), sauber(f.ort)].filter(Boolean).join(' · ');
  textblock(s, meta, rect(RAND, y + 53, 660, 76), { groesse:24, maxZeilen:2, farbe:s.dunkel ? s.c.grau : '#4A586E', feld:'Datum und Ort' });
  logo(s, rect(810, y, 198, 112));
}
function akzent(s, x, y){ fuellen(s.ctx, rect(x, y, 64, 5), s.c.orange); }
function titel(s, box, groesse, maxZeilen, farbe){
  textblock(s, s.folie.titel, box, { familie:'Anton', gewicht:400, groesse, zeilenhoehe:1.08, maxZeilen, farbe:farbe || (s.dunkel ? s.c.papier : s.c.navy), versalien:true, feld:'Titel' });
}
function text(s, box, groesse = 40, maxZeilen = 2){
  textblock(s, s.folie.text, box, { groesse, zeilenhoehe:1.25, maxZeilen, farbe:s.dunkel ? s.c.papier : s.c.navy, feld:'Begleittext' });
}
function fuss(s, index, gesamt){
  if(!Number.isInteger(index) || !Number.isInteger(gesamt) || index < 1 || gesamt < index) return;
  const y = s.story ? 1612 : 1293;
  textblock(s, String(index).padStart(2, '0') + ' / ' + String(gesamt).padStart(2, '0'), rect(RAND, y, 180, 32), { groesse:23, maxZeilen:1, farbe:s.dunkel ? s.c.grau : '#4A586E', feld:'Folienzähler' });
  fuellen(s.ctx, rect(970, y + 10, 38, 3), s.c.blau);
}
function feed(s){
  const b = s.folie.bilder || [], breit = 936;
  switch(s.folie.art){
    case 'auftakt':
      foto(s, b[0], rect(RAND, 224, breit, 610)); akzent(s, RAND, 875);
      titel(s, rect(RAND, 909, breit, 232), 104, 2);
      text(s, rect(RAND, 1168, breit, 100), 40, 2); break;
    case 'foto':
      foto(s, b[0], rect(0, 224, 1080, 785)); akzent(s, RAND, 1050);
      titel(s, rect(RAND, 1081, breit, 92), 80, 1);
      text(s, rect(RAND, 1180, breit, 92), 40, 2); break;
    case 'papier':
      akzent(s, RAND, 220); titel(s, rect(RAND, 256, breit, 203), 88, 2);
      text(s, rect(RAND, 488, breit, 183), 40, 3);
      foto(s, b[0], rect(RAND, 715, breit, 536)); break;
    case 'duo':
      akzent(s, RAND, 220); titel(s, rect(RAND, 256, breit, 180), 80, 2);
      foto(s, b[0], rect(RAND, 468, 456, 652)); foto(s, b[1], rect(552, 468, 456, 652));
      text(s, rect(RAND, 1160, breit, 105), 40, 2); break;
    case 'abschluss':
      foto(s, b[0], rect(RAND, 224, breit, 571)); akzent(s, RAND, 842);
      titel(s, rect(RAND, 881, breit, 221), 96, 2, s.c.navy);
      text(s, rect(RAND, 1144, breit, 122), 40, 2); break;
  }
}
function story(s){
  const b = s.folie.bilder || [], breit = 936;
  /* Kerntexte stehen zwischen y=300 und y=1250. Fotos erhalten eigene Rahmen.
     Bedienoberflächen der Ziel-App können sich ändern; die Hilfen sind Orientierung. */
  switch(s.folie.art){
    case 'auftakt':
      akzent(s, RAND, 468); titel(s, rect(RAND, 503, breit, 223), 104, 2);
      text(s, rect(RAND, 750, breit, 103), 40, 2);
      foto(s, b[0], rect(RAND, 900, breit, 660)); break;
    case 'foto':
      akzent(s, RAND, 468); titel(s, rect(RAND, 503, breit, 191), 88, 2);
      text(s, rect(RAND, 721, breit, 105), 40, 2);
      foto(s, b[0], rect(0, 870, 1080, 690)); break;
    case 'papier':
      akzent(s, RAND, 468); titel(s, rect(RAND, 503, breit, 222), 100, 2);
      text(s, rect(RAND, 753, breit, 174), 40, 3);
      foto(s, b[0], rect(RAND, 975, breit, 585)); break;
    case 'duo':
      akzent(s, RAND, 468); titel(s, rect(RAND, 503, breit, 198), 88, 2);
      text(s, rect(RAND, 729, breit, 105), 40, 2);
      foto(s, b[0], rect(RAND, 890, 456, 670)); foto(s, b[1], rect(552, 890, 456, 670)); break;
    case 'abschluss':
      akzent(s, RAND, 468); titel(s, rect(RAND, 503, breit, 222), 100, 2, s.c.navy);
      text(s, rect(RAND, 754, breit, 105), 40, 2);
      foto(s, b[0], rect(RAND, 907, breit, 653)); break;
  }
}
function hilfen(s){
  if(!s.story) return;
  const ctx = s.ctx; ctx.save(); ctx.strokeStyle = s.c.blau; ctx.lineWidth = 2; ctx.setLineDash([10, 8]);
  ctx.strokeRect(RAND - 12, 286, 960, 980); ctx.setLineDash([]);
  fuellen(ctx, rect(RAND, 1715, 936, 62), s.dunkel ? s.c.navy2 : '#E3E7E8');
  font(ctx, 'SGB', 25, 600); ctx.fillStyle = s.dunkel ? s.c.papier : s.c.navy; ctx.textBaseline = 'top';
  ctx.fillText('Orientierung für Text. Einblendungen der App können abweichen.', RAND + 18, 1733); ctx.restore();
}

/** Keine Netzaufrufe, keine veränderten Fotoquellen, keine variablen Exportmaße.
 * @returns {{fehler:string[],hinweise:string[],textRects:object[],fotoRects:object[]}}
 */
export function malen(canvas, optionen = {}){
  const { format = 'feed', folie = {}, projekt = {}, bilder = new Map(), wappen, index, gesamt } = optionen;
  const ergebnis = { fehler:[], hinweise:[], textRects:[], fotoRects:[] };
  const f = FORMATE[format];
  if(!f){ ergebnis.fehler.push('Das Ausgabeformat ist unbekannt.'); return ergebnis; }
  if(!canvas || typeof canvas.getContext !== 'function'){ ergebnis.fehler.push('Die Zeichenfläche fehlt.'); return ergebnis; }
  canvas.width = f.breite; canvas.height = f.hoehe;
  const ctx = canvas.getContext('2d');
  if(!ctx){ ergebnis.fehler.push('Die Zeichenfläche ist nicht verfügbar.'); return ergebnis; }
  const s = { ...ergebnis, ctx, folie, projekt, bilder, wappen, c:{ ...CI, ...(optionen.ci || {}) }, story:format === 'story', dunkel:['auftakt','duo'].includes(folie.art) };
  ctx.setTransform(1, 0, 0, 1, 0, 0); ctx.globalAlpha = 1; ctx.globalCompositeOperation = 'source-over';
  ctx.imageSmoothingEnabled = true; ctx.imageSmoothingQuality = 'high';
  fuellen(ctx, rect(0, 0, f.breite, f.hoehe), s.dunkel ? s.c.navy : s.c.papier);
  if(!ARTEN.has(folie.art)){ ergebnis.fehler.push('Das Folienlayout ist unbekannt.'); return ergebnis; }
  kopf(s); if(s.story) story(s); else feed(s); fuss(s, index, gesamt);
  if(optionen.hilfen) hilfen(s);
  ergebnis.fehler = [...new Set(s.fehler)]; ergebnis.hinweise = [...new Set(s.hinweise)];
  return ergebnis;
}
