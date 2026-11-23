    teaser:f.teaser || '', trainer:f.trainer || '', zeigeTore:f.zeigeTore === true, fotoH:f.fotoH || '', fotoE:f.fotoE || '', wappen:f.wappen || '', quelle:Q,
    toreHand:Array.isArray(N.tore), elfHand:Array.isArray(N.start),
    ergebnisNeu:gespielt && S.tore_h != null && S.tore_g != null && (toreH !== S.tore_h || toreG !== S.tore_g),
    toreNeu:Array.isArray(N.tore) && sgQuelleNeu(N.toreQ,Q.tore,N.toreQV,alt.tore) && Q.tore.length > 0,
    elfNeu:Array.isArray(N.start) && sgQuelleNeu(N.elfQ,[Q.start,Q.bank],N.elfQV,[alt.start,alt.bank]) && Q.start.length > 0 };
  D.tore = (Array.isArray(N.tore) ? N.tore : Q.tore).map(t => { const p = t.wir ? person(t) : {}, v = t.wir && t.vorlage && t.vorlage !== '-' ? person({fupa:t.vfupa}) : {};
    return { key:t.key || '', fupa:t.fupa || '', vfupa:t.vfupa || '', m:+t.m || 0, x:+t.x || 0, wir:!!t.wir, art:['elf','et'].includes(t.art) ? t.art : '', name:t.name || '', vorlage:t.vorlage || '', nr:p.nr, bild:p.bild || '', vnr:v.nr, vbild:v.bild || '' }; })
    .sort((a, b) => a.m - b.m || a.x - b.x);
  const mit = (p, bank) => { const k = person(p); return { key:p.key || '', fupa:p.fupa || '', name:p.name || '', nr:nummer(p), nrHand:Object.prototype.hasOwnProperty.call(p,'nr')&&p.nrHand!==false, bild:k.bild, tw:p.tw != null ? !!p.tw : k.tw, c:!!p.c, ein:bank ? p.ein || '' : '' }; };
  D.start = (Array.isArray(N.start) ? N.start : Q.start).map(p => mit(p, false)).sort(nachNr);
  D.bank = (Array.isArray(N.bank) ? N.bank : Array.isArray(N.start) ? [] : Q.bank).map(p => mit(p, true)).sort(nachNr);
  D.vorschlaege = gespielt ? sgVorschlaege(D) : [];
  D.kopfGewaehlt = f.h1 != null;
  D.h1 = f.h1 != null ? f.h1 : (D.vorschlaege[0] || ['', ''])[0]; D.h2 = f.h1 != null ? (f.h2 || '') : (D.vorschlaege[0] || ['', ''])[1];
  return D; }

/* Bilder zum Datensatz: Wappen, Fotos, Porträts. Fehlt ein echtes Foto, steht ein Stimmungsbild aus dem Vereinsfundus und die Karte sagt es. */
async function sgAssets(D){ const S = SG.satz, A = { portrait:new Map(), echtH:false, echtE:false };
  const bib = (typeof sbListe === 'function' ? sbListe(60) : []), eigene = bib.filter(m => (m.tags || []).includes('eigene') || (m.tags || []).includes('spieltag'));
  const [quelleH, quelleE] = await Promise.all([sgFotoQuelle(D.fotoH, D, 'fotoH'), sgFotoQuelle(D.fotoE, D, 'fotoE')]);
  A.echtH = quelleH.echt; A.echtE = quelleE.echt;
  const uH = quelleH.url, uE = quelleE.url;
  const bilder = [...new Set([...D.tore.flatMap(t => [t.bild, t.vbild]), ...D.start.map(p => p.bild), ...D.bank.map(p => p.bild)].filter(Boolean))];
  try{ if(bilder.length && typeof tkUrls === 'function') await tkUrls(bilder); }catch(e){}
  const [wWir, wGeg, fotoH, fotoE] = await Promise.all([
    pkBild(pkWappenQuelle(VEREIN && VEREIN.texte ? VEREIN.texte.name : 'SV/BSC Mörlenbach') || 'plakat/wappen/svbsc-moerlenbach.webp').then(i => i || pkBild('plakat/wappen/svbsc-moerlenbach.webp')),
    (async () => { if(/^bib:/.test(D.wappen || '')){ const u = await sbUrl(D.wappen.slice(4)); const im = u ? await pkBild(u) : null; if(im) return im; } return pkBild(pkWappenQuelle(D.gegner)); })(), pkBild(uH), pkBild(uE)]);
  await Promise.all(bilder.map(async b => { const u = typeof tkFotoUrl === 'function' ? tkFotoUrl(b) : null; if(u){ const im = await pkBild(u); if(im) A.portrait.set(b, im); } }));
  return Object.assign(A, { wWir, wGeg, fotoH, fotoE, eigene, bibliothek:bib, fotoWahlH:quelleH, fotoWahlE:quelleE }); }

/* ---------- Prüfen (Spezifikation 7.3 und 9.1): was fehlt, sagt die Karte in einem Satz ---------- */
function sgPruefen(m, D, A, ueber){ const R = { wartet:'', fehler:[], hinweise:[], notizen:[] }, U = ueber || {};
  const F = t => R.fehler.push(t), H = t => R.hinweise.push(t);
  if(sgSpeicherKonflikt())F('Bitte zuerst eine gespeicherte Fassung auswählen.');
  if(SG.bildOffen) F('Das gewählte Bild ist noch nicht bereit. Bitte warte auf die neue Vorschau.');
  if(!A.wGeg) F('Das Wappen von ' + D.gegner + ' fehlt');
  if(m === 'H'){ if(!D.datum) F('Das Datum fehlt'); if(!D.zeit) F('Die Anstoßzeit fehlt');
    if(!String(D.ort || '').trim()) F('Der Spielort fehlt. Bitte unten eintragen.'); if(U.ort) F('Der Spielort ist zu lang. Bitte kürzen.');
    if(U.teaser) F('Die Unterzeile ist zu lang'); if(U.paarung) F('Die Vereinsnamen passen nicht in eine Zeile, bitte Kurznamen eintragen');
    if(!A.fotoH) F(A.fotoWahlH?.art === 'bibliothek' ? 'Dein gewähltes Foto ist nicht erreichbar. Wähle ein anderes Foto oder ein Vereinsmotiv.' : 'Das Hintergrundbild fehlt. Bitte ein anderes Motiv wählen.'); if(!D.wirHeim) R.notizen.push('Die Auswärts-Vorlage ist die Schwester der Heimspiel-Vorlage und noch nicht eigens abgenommen.'); }
  if(Object.keys(U).some(k => k.startsWith('quer') && U[k])) F('Eine Angabe ist für das Querbanner zu lang. Bitte kürzen.');
  if(m === 'E'){ if(!D.gespielt){ R.wartet = 'Der Endstand fehlt noch'; return R; }
    if(!D.h1) F('Die Headline fehlt'); if(U.h1 || U.h2) F('Die Headline ist zu lang'); if(U.wir || U.gegner) F('Ein Vereinsname ist zu lang, bitte Kurznamen eintragen');
    if(!D.kopfGewaehlt) H('Headline wählen'); if(!A.fotoE) F(A.fotoWahlE?.art === 'bibliothek' ? 'Dein gewähltes Foto ist nicht erreichbar. Wähle ein anderes Foto oder ein Vereinsmotiv.' : 'Das Hintergrundbild fehlt. Bitte ein anderes Motiv wählen.');
    if(D.zeigeTore === true){ const beide = sgErgebnisBeide(D),L=[beide.heim,beide.gast];
      if(L.some(T=>T.anzahl!==T.erwartet)) F('Die Torschützen sind noch nicht vollständig. Ergebnis abrufen, Tore ergänzen oder die Liste bewusst ausblenden.');
      if(L.some(T=>T.fehlendeNamen)) F('Bei einem Tor fehlt der Name. Bitte unter Torschützen ergänzen.');
      if(L.some(T=>T.fehlendeMinuten)) F('Bei einem Tor fehlt die Minute. Bitte unter Torschützen ergänzen.');
      if(L.some(T=>T.gruppen.length>8) || U.ergebnisTore) F('Mehr als acht verschiedene Torschützen einer Mannschaft: Bitte den Spielverlauf nutzen oder die Liste auf dem Ergebnisbild ausblenden.');
      if(Object.keys(U).some(k => /^ergebnis(Tor|Minute)/.test(k) && U[k])) F('Ein Torschützenname oder seine Minuten sind zu lang. Bitte kürzen oder die Liste auf dem Ergebnisbild ausblenden.');
    } }
  if(m === 'S'){ if(!D.gespielt){ R.wartet = 'Der Endstand fehlt noch'; return R; }
    const n = D.tore.length, soll = D.toreH + D.toreG;
    if(!soll && !n){ R.wartet = 'Keine Tore, kein Spielverlauf'; return R; }
    if(!n){ R.wartet = 'Wartet auf den Spielbericht'; return R; }
    const hT = D.tore.filter(t => t.wir === D.wirHeim).length;
    if(n !== soll || hT !== D.toreH) F(`Die Tore im Verlauf ergeben ${hT}:${n - hT}, der Endstand ist ${D.toreH}:${D.toreG}`);
    if(D.tore.some(t => !t.name)) F('Bei einem Tor fehlt der Schütze');
    if(D.tore.some(t => !sgTorMinuteGueltig(t))) F('Bei einem Tor fehlt eine gültige Minute. Bitte ergänzen.');
    if(D.toreNeu) H('Der Spielbericht meldet jetzt andere Tore');
    const offen = D.tore.filter(t => t.wir && !t.vorlage).length; if(offen) H(offen === 1 ? '1 Vorlage unbestätigt' : `${offen} Vorlagen unbestätigt`);
    if(n > 6) R.notizen.push(n > 8 ? `Bei ${n} Toren entstehen ${Math.ceil(n / 8)} Karten.` : 'Bei mehr als sechs Toren rücken die Zeilen enger.'); }
  if(m === 'A'){ if(!D.start.length){ R.wartet = 'Die Aufstellung fehlt noch'; return R; }
    if(D.start.length !== 11) F(`Die Startelf hat ${D.start.length} statt 11 Spieler`);
    const person=sgPerson(D.sub),ids=[...D.start,...D.bank].map(p=>{const id=person(p).fupa;return id?'k:'+id:p.key?'fde:'+p.key:'n:'+pkNorm(p.name);});
    if(new Set(ids).size!==ids.length)F('Ein Spieler steht doppelt');
    if([...D.start,...D.bank].some(p => !p.name)) F('Bei einem Spieler fehlt der Name'); if(D.bank.length > 12) F('Auf der Bank stehen mehr als 12 Spieler');
    if(D.elfNeu) H('Der Spielbericht meldet jetzt eine andere Aufstellung');
    const ohneBild = [...D.start, ...D.bank].filter(p => !p.bild || !A.portrait.get(p.bild)).length, ohneNr = [...D.start, ...D.bank].filter(p => p.nr == null).length;
    if(ohneBild) R.notizen.push(`${ohneBild} ohne Porträt: Dort steht ein neutraler Kreis. Fotos pflegst du im Live-Ticker unter Kader.`);
    if(ohneNr) R.notizen.push(`${ohneNr} ohne Rückennummer.`); if(!D.trainer) R.notizen.push('Kein Trainer eingetragen.'); }
  return R; }
function sgKontextPassend(k, S){
  if(!k || !S || k.ok !== true || k.schema !== 'spieltag-kontext-v1' || k.spiel !== S.spiel || k.sub !== S.sub || k.datum !== S.datum || k.saison !== S.saison || k.quelle !== 'FUSSBALL.DE') return null;
  if(!['svbscmoerlenbach','svbscmoerlenbachii'].includes(k.team) || typeof k.gegner_key !== 'string' || !k.gegner_key.trim() || ['svbscmoerlenbach','svbscmoerlenbachii'].includes(k.gegner_key) || (S.sub === 'A' && k.team !== 'svbscmoerlenbach') || (S.sub === 'D2' && k.team !== 'svbscmoerlenbachii')) return null;
  if(!k.abdeckung || typeof k.abdeckung.form_vollstaendig !== 'boolean' || typeof k.abdeckung.saison_vollstaendig !== 'boolean') return null;
  const tag = d => typeof d === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(d) && Number.isFinite(Date.parse(d)) && new Date(d).toISOString().slice(0,10) === d && d < S.datum;
  const tore = x => Number.isInteger(x) && x >= 0 && x <= 40;
  if(!Array.isArray(k.form) || k.form.length > 5 || k.form.some((s,i) => !s || typeof s.id !== 'string' || !tag(s.datum) || !tore(s.wir) || !tore(s.gegner_tore) || typeof s.gegner !== 'string' || (i && s.datum > k.form[i-1].datum)) || new Set(k.form.map(s => s.id)).size !== k.form.length) return null;
  if(k.duell && (!tag(k.duell.datum) || !tore(k.duell.wir) || !tore(k.duell.gegner_tore) || !['hinspiel','letztes_duell'].includes(k.duell.art) || (k.duell.art === 'hinspiel' && k.duell.saison !== k.saison))) return null;
  const gleich = k.duell && k.form.find(s => s.id === k.duell.id); if(gleich && (gleich.datum !== k.duell.datum || gleich.wir !== k.duell.wir || gleich.gegner_tore !== k.duell.gegner_tore)) return null;
  const b = k.bilanz; if(!b || ['spiele','siege','remis','niederlagen'].some(p => !Number.isInteger(b[p]) || b[p] < 0 || b[p] > 80) || b.siege + b.remis + b.niederlagen !== b.spiele) return null;
  if(b.spiele < k.form.length || b.siege < k.form.filter(s => s.wir > s.gegner_tore).length || b.remis < k.form.filter(s => s.wir === s.gegner_tore).length || b.niederlagen < k.form.filter(s => s.wir < s.gegner_tore).length) return null;
  return k;
}
function sgHinspielBesonderheit(h){const E=h?.ereignisse;if(!Array.isArray(E)||!E.length||E.length>80||E.some(e=>typeof e.wir!=='boolean'||!sgTorMinuteGueltig(e))||E.filter(e=>e.wir).length!==h.wir||E.filter(e=>!e.wir).length!==h.gegner_tore)return'';
  const L=E.slice().sort((a,b)=>a.m-b.m||(a.x||0)-(b.x||0));let a=0,b=0,tief=null,hoch=null;const staende=[];
  for(const e of L){if(e.wir)a++;else b++;staende.push({a,b,e});if(!tief||b-a>tief.b-tief.a)tief={a,b};if(!hoch||a-b>hoch.a-hoch.b)hoch={a,b};}
  if(tief&&tief.b-tief.a>=2&&h.wir>=h.gegner_tore)return`Dabei haben wir einen ${tief.a}:${tief.b}-Rückstand noch ${h.wir>h.gegner_tore?'in einen Sieg gedreht':'ausgeglichen'}.`;
  if(hoch&&hoch.a-hoch.b>=2&&h.wir<=h.gegner_tore)return`Eine ${hoch.a}:${hoch.b}-Führung hat damals ${h.wir===h.gegner_tore?'nicht zum Sieg gereicht':'nicht gereicht'}.`;
  const z=staende.at(-1);if(z.e.m>=85&&h.wir===h.gegner_tore)return`Der Ausgleich fiel erst in der ${z.e.m}${z.e.x?'+'+z.e.x:''}. Minute.`;
  if(z.e.m>=85&&Math.abs(h.wir-h.gegner_tore)===1){const v=staende.at(-2)||{a:0,b:0};if(v.a===v.b)return`Das Siegtor fiel in der ${z.e.m}${z.e.x?'+'+z.e.x:''}. Minute.`;}
  return'';
}
function sgGeschichte(D){ const teile = [], k = D.rueckblick !== false && D.kontext;
  let kurz = '';
  if(k){ const F = k.abdeckung.form_vollstaendig ? k.form : [], anzahl = ['null','ein','zwei','drei','vier','fünf']; let siege = 0, ungeschlagen = 0;
    for(const s of F){ if(s.wir <= s.gegner_tore) break; siege++; }
    for(const s of F){ if(s.wir < s.gegner_tore) break; ungeschlagen++; }
    if(siege >= 3){ teile.push(`Unsere Jungs haben die letzten ${anzahl[siege]} Ligaspiele gewonnen.`); kurz = `${anzahl[siege][0].toUpperCase() + anzahl[siege].slice(1)} Siege in Folge.`; }
    else if(ungeschlagen >= 3){ teile.push(`In den letzten ${anzahl[ungeschlagen]} Ligaspielen ist unsere Mannschaft ungeschlagen geblieben.`); kurz = `Seit ${anzahl[ungeschlagen]} Ligaspielen ungeschlagen.`; }
    else { const gewonnen = F.filter(s => s.wir > s.gegner_tore).length;
      if(F.length >= 3 && gewonnen >= 3){ teile.push(`Aus den letzten ${anzahl[F.length]} Ligaspielen hat unsere Mannschaft ${anzahl[gewonnen]} Siege geholt.`); kurz = `${gewonnen} Siege aus den letzten ${F.length} Ligaspielen.`; }
      else if(k.abdeckung.saison_vollstaendig && k.bilanz.spiele >= 5 && k.bilanz.siege * 2 >= k.bilanz.spiele){ teile.push(`In dieser Runde stehen bisher ${k.bilanz.siege} Siege aus ${k.bilanz.spiele} Ligaspielen.`); kurz = `${k.bilanz.siege} Siege aus ${k.bilanz.spiele} Ligaspielen.`; }
    }
    const h = k.duell; if(h){ const ergebnis = `${h.wir}:${h.gegner_tore}`, datum = sgDatumTeile(h.datum), bezug = h.art === 'hinspiel' ? 'Das Hinspiel' : 'Das letzte Ligaduell' + (datum ? ' am ' + datum.lang : '');
      if(h.wir < h.gegner_tore) teile.push(`${bezug} gegen ${D.gegner} ging ${h.gegner_tore - h.wir === 1 ? 'knapp ' : ''}mit ${ergebnis} verloren.`);
      else if(h.wir > h.gegner_tore) teile.push(`${bezug} gegen ${D.gegner} haben unsere Jungs mit ${ergebnis} gewonnen.`);
      else teile.push(`${bezug} gegen ${D.gegner} endete ${ergebnis}.`);
      const besonders=sgHinspielBesonderheit(h);if(besonders){teile.push(besonders);kurz=(h.art==='hinspiel'?'Im Hinspiel: ':'Beim letzten Duell: ')+besonders.replace(/^Dabei haben wir/,'Wir haben');}
      if(!kurz) kurz = h.art === 'hinspiel' ? h.gegner_tore - h.wir >= 4 ? 'Zeit für das Rückspiel.' : `Hinspiel: ${ergebnis}${h.wir < h.gegner_tore ? ' verloren' : h.wir > h.gegner_tore ? ' gewonnen' : ''}.` : 'Die Mannschaften treffen wieder aufeinander.';
    }
  }
  const eigen = String(D.geschichte || '').trim().slice(0,600);
  if(eigen){ const auszug = eigen.replace(/\s+/g, ' '); kurz = auszug.length <= 140 ? auszug : auszug.slice(0,137).replace(/\s+\S*$/, '') + '…'; }
  return { auto:teile, eigen, alle:[...teile, eigen].filter(Boolean), kurz };
}
function sgKontextVorschau(D){ const G = sgGeschichte(D);
  return G.auto.map(t => `<p class="sg-hin">${sgE(t)}</p>`).join('') || `<p class="sg-hin">${D.rueckblick === false ? 'Der automatische Rückblick ist ausgeschaltet.' : 'Gerade ist kein automatischer Rückblick verfügbar. Deinen Blick aufs Spiel kannst du unten ergänzen.'}</p>`;
}
function sgKontextHtml(D){ const k = D.kontext;
  const ergebnis = s => `${s.wir}:${s.gegner_tore}`, tag = s => { const d = sgDatumTeile(s.datum); return d ? d.lang : s.datum; };
  const quelle = k ? `<details class="sg-grundlage"><summary>Grundlage ansehen</summary><p class="sg-hin">${sgE(D.wir)}. Ligaergebnisse von FUSSBALL.DE vor diesem Spiel.</p><ul>${k.form.map(s => `<li>${sgE(tag(s))}: ${sgE(s.gegner)}, ${ergebnis(s)}</li>`).join('')}${k.duell ? `<li>${k.duell.art === 'hinspiel' ? 'Hinspiel' : 'Letztes Ligaduell'} am ${sgE(tag(k.duell))}: ${ergebnis(k.duell)}</li>` : ''}</ul><p class="sg-hin">${k.abdeckung.saison_vollstaendig ? `${k.bilanz.spiele} erfasste Ligaspiele in dieser Saison.` : 'Saisonergebnisse sind noch unvollständig. Eine Saisonbilanz wird deshalb nicht formuliert.'}${k.abdeckung.form_vollstaendig ? '' : ' In den jüngsten Ligaterminen fehlen Ergebnisse. Eine Serie wird deshalb nicht behauptet.'}</p></details>` : '';
  return `<div class="sg-rueckblick"><p class="sg-l">Die Geschichte zum Spiel</p><div data-sgkontext-vorschau aria-live="polite">${sgKontextVorschau(D)}</div>${quelle}
    <label class="sg-ohne"><input type="checkbox" data-sgrueckblick${D.rueckblick !== false ? ' checked' : ''}> Form und frühere Duelle einbeziehen</label>
    <label class="sg-f"><span>Dein Blick aufs Spiel (optional)</span><textarea data-sggeschichte rows="3" maxlength="600" placeholder="Der belegte Rückblick steht oben. Hier kannst du deine Einschätzung ergänzen.">${sgE(D.geschichte || '')}</textarea></label>
    <p class="sg-hin">Hier ist Platz für deine Einschätzung, etwa einen unglücklichen Spielverlauf. In der Story steht ein kurzer Auszug. Eigene Änderungen in den fertigen Texten bleiben erhalten.</p></div>`;
}
/* Die früheren Einladungen kehren zurück. Fakten kommen aus demselben
   Spielstand wie das Motiv, ohne geratenen Platz oder Flutlicht. */
function sgTexteBauen(D, m, ton = 'normal'){
  const dt = sgDatumTeile(D.datum), paarung = [D.heim, D.gast].map(x => String(x || '').trim()).filter(Boolean).join(' gegen ');
  const titel = m === 'H' ? (D.wirHeim ? 'Heimspiel' : 'Auswärtsspiel') : m === 'E' ? 'Endergebnis' : m === 'A' ? 'Aufstellung' : 'Spielverlauf';
  const kopf = [titel, D.wettbewerb].filter(Boolean).join(' · ');
  const termin = [dt ? dt.tag + ', ' + dt.lang : String(D.datum || '').trim(), D.zeit ? D.zeit + ' Uhr' : ''].filter(Boolean).join(' · ');
  const ergebnis = m !== 'H' && D.gespielt && D.toreH != null && D.toreG != null ? 'Endstand: ' + D.toreH + ':' + D.toreG : '';
  const ort = String(D.ort || '').trim(), teile = [kopf, paarung, ergebnis, termin, ort ? 'Spielort: ' + ort : ''].filter(Boolean);
  if(m === 'H' && paarung && dt){
    const auswahl=parseInt(sgHash([D.spiel,D.datum,D.gegner].join('|')).slice(0,6),36)||0;
    const auftakt = (D.wirHeim ? ['Am '+dt.tag+' spielen wir zuhause.','Am '+dt.tag+' ist '+D.gegner+' bei uns zu Gast.','Heimspiel am '+dt.tag+'.'] : ['Am '+dt.tag+' spielen wir auswärts gegen '+D.gegner+'.','Auswärtsspiel am '+dt.tag+'.','Nächste Aufgabe: '+D.gegner+'.'])[auswahl%3];
    const ruf = (D.wirHeim?['Kommt vorbei und macht euch am Spielfeldrand bemerkbar. Unsere Mannschaft freut sich über jeden, der dabei ist.','Wer am '+dt.tag+' noch nichts vorhat: Kommt an den Platz und unterstützt die Jungs.','Kommt zum Spiel und unterstützt unsere Mannschaft. Wir sehen uns am Platz!']:['Wer mitfährt, sorgt auch auswärts für Unterstützung. Die Jungs freuen sich auf euch.','Unterstützt unsere Mannschaft auch auf fremdem Platz. Wer ist dabei?','Auch auswärts tut Rückhalt vom Spielfeldrand gut. Kommt mit und feuert die Jungs an.'])[auswahl%3];
    const mitte=ton==='energie'?(D.wirHeim?'Lasst euch am Spielfeldrand hören!':'Auch auswärts wollen wir euch hören!')+'\n\n'+ruf:ruf;
    const fakten = [D.wettbewerb && D.wettbewerb !== 'Spiel' ? D.wettbewerb : '', paarung, termin, ort ? 'Spielort: ' + ort : ''].filter(Boolean).join('\n');
    const kurz = ton === 'kurz', schlussStory = kurz?(D.wirHeim?'Kommt an den Platz!':'Kommt mit!'):ton==='energie'?'Lasst euch am Spielfeldrand hören!':(D.wirHeim?'Kommt an den Platz und unterstützt uns!':'Unterstützt die Jungs auch auswärts!');
    const waRuf=kurz?(D.wirHeim?'Kommt an den Platz!':'Kommt mit und unterstützt uns auch auswärts!'):ton==='energie'?mitte:D.wirHeim?'Kommt an den Platz und feuert die Jungs an. Wir freuen uns auf euch!':'Kommt mit und unterstützt unsere Mannschaft auch auswärts. Wer ist dabei?';
    const G = sgGeschichte(D), postGeschichte = (kurz ? [G.kurz] : G.alle).filter(Boolean).join('\n\n'), waGeschichte = (kurz ? [G.kurz] : G.alle).filter(Boolean).join('\n\n');
    return { post:[kurz?titel:auftakt, fakten, postGeschichte, mitte].filter(Boolean).join('\n\n'),
      whatsapp:[titel+(kurz?'':' am '+dt.tag), fakten, waGeschichte, waRuf].filter(Boolean).join('\n\n'),
      story:[D.wirHeim ? 'HEIMSPIEL' : 'AUSWÄRTSSPIEL', paarung, termin, ort, G.kurz, schlussStory].filter(Boolean).join('\n') };
  }
  const T = m === 'E' ? sgErgebnisBeide(D) : null;
  const schuetzen = T?[['heim',D.heim],['gast',D.gast]].flatMap(([k,name])=>T[k].vollstaendig&&T[k].gruppen.length?['Tore '+name+': '+T[k].gruppen.map(g=>g.name+(g.eigentor?' (Eigentor)':'')+' ('+g.zeiten.join(', ')+')').join('; ')]:[]).join('\n'):'';
  if(schuetzen) teile.splice(3, 0, schuetzen);
  return { post:teile.join('\n\n'), whatsapp:teile.join('\n'), story:[titel, paarung, ergebnis, schuetzen, termin, ort].filter(Boolean).join('\n') };
}
function sgTexte(m, D){ const auto = sgTexteBauen(D || SG.d, m, SG.neu.textTon || 'normal'), hand = (SG.neu.texte || {})[m] || {};
  for(const k of ['post','whatsapp','story']) if(typeof hand[k] === 'string') auto[k] = hand[k]; return auto; }
function sgTexteHtml(m){ const T = sgTexte(m);
  return `<section class="sg-texte" id="sgTexte" tabindex="-1"><p class="sg-l">Texte zum Kopieren</p><p class="sg-hin">${m === 'H' ? 'Die Einladungen für eure Gruppen und Storys sind wieder da. Spielort und Anstoß kommen aus deinen Angaben.' : 'Aus den vorhandenen Spieldaten vorbelegt.'} Du kannst jeden Text bearbeiten.</p>
    ${m === 'H' ? `<label class="sg-f"><span>Tonfall</span><select data-sgton>${[['normal','Ausführlich'],['kurz','Kurz'],['energie','Anfeuernd']].map(([k,t]) => `<option value="${k}"${(SG.neu.textTon || 'normal') === k ? ' selected' : ''}>${t}</option>`).join('')}</select></label>` : ''}
    ${m === 'H' ? sgKontextHtml(SG.d) : ''}
    ${[['post','Instagram und Facebook'],['whatsapp','WhatsApp-Ankündigungsgruppe'],['story','Story']].map(([k,t]) => `<label class="sg-f"><span>${t}</span><textarea data-sgtext="${k}" maxlength="2200" rows="${k === 'post' ? 7 : 6}">${sgE(T[k])}</textarea></label><button type="button" class="btn sm ghost" data-sgkopie="${k}">${SVI('copy')} ${k === 'whatsapp' ? 'WhatsApp-Text' : k === 'post' ? 'Beitragstext' : 'Storytext'} kopieren</button>`).join('')}
    <div class="sg-zeile"><button type="button" class="btn sm ghost" data-sgtexte-neu>Texte neu erzeugen</button></div><p class="sg-hin">Eigene Textänderungen bleiben erhalten. „Texte neu erzeugen“ ersetzt sie durch die aktuelle Vorlage. Kopieren verschickt nichts.</p></section>`;
}
function sgTexteHoehen(h){ h.querySelectorAll('[data-sgtext]').forEach(e => { if(!e.style || !Number.isFinite(e.scrollHeight)) return; e.style.height = 'auto'; e.style.height = Math.max(120, e.scrollHeight + 2) + 'px'; }); }
function sgTexteAktualisieren(h){ const T = sgTexte(SG.motiv); h.querySelectorAll('[data-sgtext]').forEach(e => { if(e !== document.activeElement && e.value !== T[e.dataset.sgtext]) e.value = T[e.dataset.sgtext]; }); const v = h.querySelector('[data-sgkontext-vorschau]'); if(v) v.innerHTML = sgKontextVorschau(SG.d); sgTexteHoehen(h); }
async function sgTextKopieren(m, key, feld){ if(SG.satz) SG.d = sgDaten(); const text = sgTexte(m)[key] || ''; if(!text.trim()){ kToast('Der Text ist leer. Bitte zuerst ergänzen.'); return; }
  try{ await navigator.clipboard.writeText(text); kToast('Text kopiert'); }catch(e){ if(feld){ feld.value = text; feld.focus(); feld.select(); } kToast('Text ist markiert. Bitte über das Kopieren-Menü kopieren.'); } }
/* Geladene Porträts gehören zur Freigabe. Ein neutraler Kreis ist ein anderer Bildstand. */
const sgPortraitMerk=new WeakMap();
function sgPortraitStand(b,A){
  const im=b&&A?.portrait?.get(b); if(!im)return '';
  if(typeof im!=='object')return 'geladen'; if(sgPortraitMerk.has(im))return sgPortraitMerk.get(im);
  let stand;
  try{const c=document.createElement('canvas');c.width=c.height=64;const x=c.getContext('2d');x.drawImage(im,0,0,64,64);
    stand=sgHash(Array.from(x.getImageData(0,0,64,64).data).join(','));}
  catch(e){stand='geladen:'+String(im.naturalWidth||im.width||0)+'x'+String(im.naturalHeight||im.height||0)+':'+String(im.currentSrc||im.src||'');}
  sgPortraitMerk.set(im,stand);return stand;
}
/* Prüfsumme des Stands, den eine Freigabe meint: alles, was im Motiv zu sehen ist */
function sgStandHash(m, D){ const k = [SG_VERSION[m], D.wettbewerb, D.saison, D.nr, D.datum, D.heim, D.gast, D.wappen];
  k.push('Texte 1.0', D.ort, sgTexte(m, D));
  if(m==='H'||m==='E'){const feld=m==='H'?'fotoH':'fotoE',w=sgFotoWahl(D[feld]);k.push('Fotoauswahl 2',w.art==='auto'?sgFotoAuto(D,feld).id:w,D.bildausschnitt?.[m]||{});}
  if(m === 'H') k.push('Quer 2.0', D.zeit, D.teaser, D.fotoH, sgQuerNorm(D.querY, .5, 0, 1), sgQuerNorm(D.querZoom, 1, 1, 2));
  if(m === 'E') k.push(D.toreH, D.toreG, D.h1, D.h2, D.fotoE, D.zeigeTore === true, D.zeigeTore === true ? sgErgebnisBeide(D) : null);
  if(m === 'S') k.push('Personen 3',D.toreH,D.toreG,D.tore.map(t=>[t.m,t.x,t.wir,t.name,t.vorlage,t.art,t.nr,t.vnr,t.bild,sgPortraitStand(t.bild,SG.A),t.vbild,sgPortraitStand(t.vbild,SG.A)]));
  if(m === 'A') k.push('Personen 3',D.start.map(p=>[p.name,p.nr,p.tw,p.c,p.bild,sgPortraitStand(p.bild,SG.A)]),D.bank.map(p=>[p.name,p.nr,p.ein,p.tw,p.bild,sgPortraitStand(p.bild,SG.A)]),D.trainer);
  return sgHash(JSON.stringify(k)); }
function sgStand(m){ const P = SG.pruef[m], fr = (SG.neu.frei || {})[m];
  if(P.wartet) return { art:'wartet', text:P.wartet };
  if(P.fehler.length) return { art:'du', text:'Braucht dich: ' + P.fehler[0] };
  if(fr && fr.stand === sgStandHash(m, SG.d)) return { art:'fertig', text:'Fertig, freigegeben' };
  if(fr) return { art:'du', text:'Braucht dich: seit der Freigabe geändert' };
  if(P.hinweise.length) return { art:'du', text:'Braucht dich: ' + P.hinweise[0] };
  return { art:'bereit', text:'Vorbelegt. Ansehen und freigeben' }; }
const sgTitel = m => m === 'H' ? (SG.d && !SG.d.wirHeim ? 'Auswärtsspiel' : 'Heimspiel') : m === 'A' ? 'Aufstellung' : m === 'E' ? 'Ergebnis' : 'Spielverlauf';

/* Wappen des Gegners, wenn die Bibliothek keins hat. Erfunden oder nachgezeichnet wird nie eins: Die Originaldatei kommt als Bild
   (am besten PNG mit durchsichtigem Grund), höchstens 600 Pixel, in den Studio-Speicher unter assets/wappen und gilt für dieses Spiel. */
async function sgWappenHoch(file){
  if(!file || !/^image\//.test(file.type || '')) return { ok:false, text:'Bitte ein Bild wählen. Am besten ein PNG mit durchsichtigem Grund.' };
  if(file.size > 12 * 1024 * 1024) return { ok:false, text:'Das Bild ist größer als 12 MB.' };
  try{
    const im = await new Promise(ok => { const u = URL.createObjectURL(file), i = new Image(); i.onload = () => { URL.revokeObjectURL(u); ok(i); }; i.onerror = () => { URL.revokeObjectURL(u); ok(null); }; i.src = u; });
    if(!im) return { ok:false, text:'Das Bild ließ sich nicht lesen.' };
    const s = Math.min(1, 600 / Math.max(im.naturalWidth, im.naturalHeight)), c = document.createElement('canvas'); c.width = Math.max(1, Math.round(im.naturalWidth * s)); c.height = Math.max(1, Math.round(im.naturalHeight * s));
    c.getContext('2d').drawImage(im, 0, 0, c.width, c.height);
    const blob = await new Promise(ok => c.toBlob(ok, 'image/png')); if(!blob) return { ok:false, text:'Das Bild ließ sich nicht umrechnen.' };
    const pfad = `assets/wappen/${sbSlug(SG.d.gegner)}-${Date.now().toString(36)}.png`, recht = 'Zum Speichern fehlt dir das Recht, im Studio zu bearbeiten.';
    const up = await SVB.sb.storage.from('studio').upload(pfad, blob, { contentType:'image/png', upsert:false });
    if(up.error){ const m = String(up.error.message || up.error); return { ok:false, text:/row-level security|not authorized|unauthorized|403/i.test(m + ' ' + (up.error.statusCode || up.error.status || '')) ? recht : 'Hochladen hat nicht geklappt: ' + m }; }
    const ins = await SVB.sb.from('studio_medien').insert({ pfad, name:('Wappen ' + SG.d.gegner).slice(0, 60), tags:['wappen'], breite:c.width, hoehe:c.height, bytes:blob.size });
    if(ins.error){ try{ await SVB.sb.storage.from('studio').remove([pfad]); }catch(e){} return { ok:false, text:/row-level security|permission denied/i.test(ins.error.message || '') ? recht : 'Speichern hat nicht geklappt: ' + ins.error.message }; }
    return { ok:true, pfad };
  }catch(e){ return { ok:false, text:'Hochladen hat nicht geklappt: ' + (e.message || e) }; } }
function sgWappenHtml(){ const fehlt = !SG.A.wGeg;
  return `<div class="sg-wap${fehlt ? ' fehlt' : ''}">${fehlt ? `<b>Das Wappen von ${sgE(SG.d.gegner)} fehlt.</b><span>Ohne das Originalwappen geht kein Motiv raus. Lade die Datei hoch, am besten als PNG mit durchsichtigem Grund.</span>` : ''}
    <label class="btn sm ghost sg-wapk">${SVI('upload')}<span data-sbt>${fehlt ? 'Wappen hochladen' : 'Anderes Wappen für dieses Spiel hochladen'}</span><input type="file" accept="image/png,image/webp,image/svg+xml,image/jpeg" data-sgwap hidden></label></div>`; }

/* ---------- Laden ---------- */
async function sgSpieleLaden(){ const wir = k => String(k || '').startsWith(PK_EIGEN);
  const heute = new Intl.DateTimeFormat('en-CA', { timeZone:'Europe/Berlin', year:'numeric', month:'2-digit', day:'2-digit' }).format(new Date());
  const vor = new Date(Date.parse(heute) - 21 * 864e5).toISOString().slice(0, 10);
  const { data, error } = await SVB.sb.from('fixtures').select('id,sub,datum,zeit,heim,gast,heim_key,gast_key').gte('datum', vor).order('datum', { ascending:true }).limit(120);
  if(error) throw error;
  SG.heute = heute;
  SG.spiele = (data || []).filter(f => wir(f.heim_key) || wir(f.gast_key)).map(f => { const heim = wir(f.heim_key);
    return { id:f.id, sub:f.sub, datum:f.datum, zeit:String(f.zeit || '').slice(0, 5), heim, gegner:String(heim ? f.gast : f.heim).replace(/\s*\((FB|H|FB, ?H)[^)]*\)\s*$/i, '') }; });
  /* Vorgewählt: ein Spiel der letzten drei Tage (dann liegen Ergebnis und Verlauf an), sonst das nächste */
  const d3 = new Date(Date.parse(heute) - 3 * 864e5).toISOString().slice(0, 10);
  const frisch = SG.spiele.filter(s => s.datum >= d3 && s.datum <= heute && s.sub !== 'D2').pop() || SG.spiele.filter(s => s.datum >= d3 && s.datum <= heute).pop();
  const naechstes = SG.spiele.findIndex(s => s.datum >= heute && s.sub !== 'D2'), irgend = SG.spiele.findIndex(s => s.datum >= heute);
  SG.idx = frisch ? SG.spiele.indexOf(frisch) : naechstes >= 0 ? naechstes : irgend >= 0 ? irgend : Math.max(0, SG.spiele.length - 1); }
let sgSatzLauf = 0, sgBildLauf = 0;
const sgKonto = () => typeof SVB !== 'undefined' && SVB.user ? SVB.user.id : null;
function sgKontextLaden(id){ let timer;
  const laden = Promise.resolve().then(() => svtRpc('spieltag_kontext', { p_spiel:id })).catch(() => null);
  return Promise.race([laden, new Promise(ok => { timer = setTimeout(() => ok(null), 3500); })]).finally(() => clearTimeout(timer)); }
async function sgSatzLaden(){ const nr = ++sgSatzLauf, s = SG.spiele[SG.idx], vorgemerkt = s && SG_MERKPLAENE.get(s.id), konto = sgKonto(); ++sgBildLauf; clearTimeout(sgZeichenT); SG.abruf = null; SG.bildOffen = false; SG.satz = null; SG.kontext = null; SG.neu = {}; if(!s) return false;
  const [satz, kontext] = await Promise.allSettled([svtRpc('spieltag_satz', { p_spiel:s.id }), sgKontextLaden(s.id)]);
  if(nr !== sgSatzLauf || konto !== sgKonto()) return false;
  if(satz.status === 'rejected') throw satz.reason; const r = satz.value, k = kontext.status === 'fulfilled' ? kontext.value : null;
  if(!r || !r.ok || r.spiel !== s.id) throw new Error('Zu diesem Spiel gibt es keine Daten.'); SG.kontext = sgKontextPassend(k, r);
  SG.satz = r; const plan = SG_MERKPLAENE.get(s.id) || vorgemerkt, lokal = plan && plan.konto === konto ? plan : null,rettung=lokal?null:sgLokalWiederherstellen(r,konto);
  SG.neu = lokal ? JSON.parse(lokal.stand) : rettung.neu;SG.lokalFassungen=rettung?.konflikt||[];if(!SG.neu.f)SG.neu.f={};sgSpeicherStart();if(rettung?.wieder)sgMerken();return true; }
const SG_MERKPLAENE = new Map();
function sgMerken(){ const id = SG.satz && SG.satz.spiel; if(!id) return;
  let stand, neu; try{ stand = JSON.stringify(SG.neu); neu = JSON.parse(stand); }catch(e){ console.warn('Spieltag speichern', e); kToast('Speichern hat nicht geklappt'); return; }
  let plan = SG_MERKPLAENE.get(id); if(!plan || plan.konto !== sgKonto()){ plan = { id, konto:sgKonto(), basis:SG.satz.entwurf_stand||null,timer:null, laeuft:false }; SG_MERKPLAENE.set(id, plan); }
  clearTimeout(plan.timer); plan.neu = neu; plan.stand = stand;
  plan.lokal=sgLokalSichern(plan.konto,id,neu,plan.basis);
  if(plan.konflikt||(SG.lokalFassungen||[]).length){plan.konflikt=plan.konflikt||{lokal:true};plan.fehler=new Error('Bitte zuerst eine Fassung auswählen.');sgSpeicherStatus('Deine Eingaben sind lokal gesichert. Bitte zuerst den gespeicherten Stand auswählen.','konflikt');return;}
  plan.timer = setTimeout(() => { plan.timer = null; return sgMerkSenden(plan); }, 700); }
function sgMerkSenden(plan){ if(plan.laeuft || !plan.neu || plan.konflikt) return;
  if(plan.konto !== sgKonto()){ clearTimeout(plan.timer); plan.timer = null; plan.neu = null; plan.fehler = new Error('Das Konto wurde gewechselt. Bitte den Spieltag neu öffnen.'); if(SG_MERKPLAENE.get(plan.id) === plan) SG_MERKPLAENE.delete(plan.id); return Promise.resolve(); }
  const neu = plan.neu, stand = plan.stand; plan.neu = null; plan.laeuft = true;sgLokalUnterwegs(plan.konto,plan.id,neu);
  plan.lauf = (async () => { try{ const payload=plan.basis?{...neu,_sg_basis:plan.basis}:neu,r = await svtRpc('spieltag_merken', { p_spiel:plan.id, p_neu:payload });
    if(r?.konflikt){plan.neu=plan.neu||neu;
      plan.konflikt=r;plan.fehler=new Error('Ein anderer Stand wurde gespeichert. Bitte zuerst entscheiden.');
      sgSpeicherStatus('Deine Eingaben sind lokal gesichert. Auf dem Server gibt es einen anderen Stand.','konflikt',plan.id,plan.konto);
      if(SG.satz?.spiel===plan.id&&sgKonto()===plan.konto){const h=document.getElementById('sgWrap');if(h){if(SG.motiv)sgDetail(h);else sgUebersicht(h);}}return;}
    if(!r || !r.neu) throw new Error('Der Spieltag wurde nicht gespeichert. Bitte erneut versuchen.'); plan.fehler = null;
    plan.basis=r.entwurf_stand||plan.basis;plan.versuche=0;if(SG.satz?.spiel===plan.id&&sgKonto()===plan.konto)SG.satz.entwurf_stand=plan.basis;sgLokalBestaetigt(plan.konto,plan.id,neu,plan.basis);
    if(r && r.neu && plan.konto === sgKonto() && SG.satz && SG.satz.spiel === plan.id && JSON.stringify(SG.neu) === stand) SG.neu.frei = r.neu.frei || {}; }
  catch(e){ plan.fehler=e;plan.neu=plan.neu||neu;plan.versuche=(plan.versuche||0)+1;console.warn('Spieltag speichern',e);sgSpeicherStatus(plan.lokal?'Server noch nicht erreicht. Deine Eingaben bleiben auf diesem Gerät gesichert.':'Speichern noch nicht möglich. Bitte die Seite geöffnet lassen und erneut versuchen.','fehler',plan.id,plan.konto);
    if(plan.versuche<=5){clearTimeout(plan.retry);plan.retry=setTimeout(()=>{if(plan.konto===sgKonto())sgMerkSenden(plan);},Math.min(60000,3000*2**(plan.versuche-1)));} }
  finally{ plan.laeuft=false;if(!plan.konflikt&&!plan.fehler&&plan.timer===null){if(plan.neu)return sgMerkSenden(plan);if(SG_MERKPLAENE.get(plan.id)===plan)SG_MERKPLAENE.delete(plan.id);} } })(); return plan.lauf; }
async function sgMerkSofort(id){ sgMerken(); const plan = SG_MERKPLAENE.get(id); if(!plan) throw new Error('Speichern hat nicht geklappt. Bitte erneut versuchen.');
  do{if(plan.konflikt)throw plan.fehler;clearTimeout(plan.timer);clearTimeout(plan.retry);plan.timer=null;await(plan.laeuft?plan.lauf:sgMerkSenden(plan));if(plan.konflikt||plan.fehler)throw plan.fehler;}while(plan.neu||plan.laeuft);
  if(plan.fehler) throw plan.fehler; }

/* Ein gezielter Abruf für das gewählte Spiel. Eigene Eingaben bleiben im
   laufenden Formular; nur die amtliche Quelle wird anschließend neu gelesen. */
function sgAbrufStand(){ const a = SG.abruf; return a && SG.satz && a.spiel === SG.satz.spiel && a.konto === sgKonto() ? a : null; }
function sgAbrufHtml(m){ const a = sgAbrufStand(), laedt = a && a.phase === 'laden', D = SG.d, direkt = (SG.satz || {}).direkt;
  const wann = direkt && direkt.abgerufen_am ? new Date(direkt.abgerufen_am).toLocaleString('de-DE', { day:'2-digit', month:'2-digit', hour:'2-digit', minute:'2-digit' }) : '';
  const text = a ? a.text : 'Endstand, Torschützen und Aufstellung direkt für dieses Spiel nachladen.';
  const art = m === 'A' ? 'aufstellung' : 'ergebnis';
  const vorhanden = D && (art === 'aufstellung' ? D.start.length > 0 : D.gespielt);
  return `<section class="sg-abruf" aria-label="Spieldaten von FUSSBALL.DE"><p class="sg-l">Direkt von FUSSBALL.DE</p><p class="sg-hin" data-sgabruf-status role="status" aria-live="polite" tabindex="-1">${sgE(text)}</p>
    <div class="sg-zeile"><button type="button" class="btn sm${vorhanden ? ' ghost' : ''}" data-sgabruf="${art}"${laedt ? ' disabled aria-busy="true"' : ''}>${laedt ? 'Wird abgerufen …' : art === 'aufstellung' ? 'Aufstellung abrufen' : 'Ergebnis abrufen'}</button>${!m ? `<button type="button" class="btn sm ghost" data-sgabruf="aufstellung"${laedt ? ' disabled' : ''}>Aufstellung abrufen</button>` : ''}</div>
    ${wann ? `<p class="sg-hin">Letzter Abruf: ${sgE(wann)} Uhr.</p>` : ''}
    ${D && D.ergebnisNeu ? `<div class="sg-quelle"><b>Die Quelle meldet ${sgE(SG.satz.tore_h)}:${sgE(SG.satz.tore_g)}.</b><span>Dein eingetragener Endstand bleibt erhalten.</span><button type="button" class="btn sm ghost" data-sgq="ergebnis-quelle">Endstand übernehmen</button></div>` : ''}
    <p class="sg-hin">Nur freigegebene Angaben werden übernommen. Eigene Änderungen bleiben erhalten.</p></section>`;
}
function sgAbrufZeigen(fokus){ const h = document.getElementById('sgWrap'); if(!h || !SG.satz) return null; SG.d = sgDaten(); if(SG.motiv) sgDetail(h); else sgUebersicht(h);
  const status = h.querySelector('[data-sgabruf-status]'); if(fokus && status && status.focus) status.focus({ preventScroll:true }); return status; }
function sgAbrufStatusAktualisieren(h){ const a = sgAbrufStand(), laedt = a && a.phase === 'laden'; if(!a || !h) return;
  h.querySelectorAll('[data-sgabruf-status]').forEach(e => { e.textContent = a.text; });
  h.querySelectorAll('[data-sgabruf]').forEach(b => { b.disabled = !!laedt; b.textContent = laedt ? 'Wird abgerufen …' : b.dataset.sgabruf === 'aufstellung' ? 'Aufstellung abrufen' : 'Ergebnis abrufen'; if(b.setAttribute) b.setAttribute('aria-busy', laedt ? 'true' : 'false'); }); }
async function sgAbrufAnfragen(id){ let timer; try{ const antwort = SVB.sb.functions.invoke('spieltag-abrufen', { body:{ spiel:id } });
    const { data, error } = await Promise.race([antwort, new Promise((ok, nein) => { timer = setTimeout(() => nein(new Error('timeout')), 75000); })]);
    if(error){ let r; try{ r = await error.context.json(); }catch(e){} return { ok:false, error:r && r.error || 'FUSSBALL.DE konnte gerade nicht abgerufen werden. Bitte erneut versuchen.', warten:r && r.warten }; }
    return data && typeof data === 'object' ? data : { ok:false, error:'Der Abruf hat keine Antwort geliefert. Bitte erneut versuchen.' };
  }catch(e){ return { ok:false, error:'Der Abruf hat nicht geklappt. Prüfe deine Verbindung und versuche es erneut.' }; }finally{ clearTimeout(timer); } }
async function sgAbrufen(art){ if(!SG.satz || !['ergebnis','aufstellung'].includes(art) || sgAbrufStand()?.phase === 'laden') return;
  const spiel = SG.satz.spiel, konto = sgKonto(), motiv = SG.motiv, lauf = sgSatzLauf; let satz = SG.satz;
  const a = { spiel, konto, phase:'laden', text:'FUSSBALL.DE wird abgerufen. Einen Moment bitte.' }; SG.abruf = a;
  const aktuell = () => SG.abruf === a && SG.satz === satz && sgSatzLauf === lauf && sgKonto() === konto;
  const statusFokus = sgAbrufZeigen(true), folgtFokus = () => document.activeElement === statusFokus || document.activeElement === document.body;
  try{ const r = await sgAbrufAnfragen(spiel); if(!aktuell()) return;
    if(!r.ok){ const warten = Number.isFinite(r.warten) ? Math.max(1, Math.ceil(r.warten)) : 0; throw new Error((r.error || 'Die Daten konnten nicht abgerufen werden.') + (warten ? ` Bitte in ${warten} Sekunden erneut versuchen.` : '')); }
    if(r.spiel !== spiel) throw new Error('Die Antwort gehört nicht zu diesem Spiel. Bitte erneut versuchen.');
    const [neu, kontext] = await Promise.allSettled([svtRpc('spieltag_satz', { p_spiel:spiel }), sgKontextLaden(spiel)]);
    if(!aktuell()) return;
    if(neu.status !== 'fulfilled' || !neu.value || !neu.value.ok || neu.value.spiel !== spiel) throw new Error('Der Abruf ist fertig, aber die Anzeige konnte nicht aktualisiert werden. Bitte erneut versuchen.');
    clearTimeout(sgZeichenT); ++sgBildLauf; SG.satz = neu.value; satz = SG.satz; SG.kontext = sgKontextPassend(kontext.status === 'fulfilled' ? kontext.value : null, SG.satz);
    const gefunden = [], quelle = sgQuelle(SG.satz); if(SG.satz.tore_h != null && SG.satz.tore_g != null) gefunden.push(`Endstand ${SG.satz.tore_h}:${SG.satz.tore_g} geladen`);
    if(quelle.tore.length) gefunden.push(`${quelle.tore.length} Torereignisse`); if(quelle.start.length) gefunden.push(`Aufstellung mit ${quelle.start.length} Spielern`);
    a.phase = 'fertig'; a.text = gefunden.length ? gefunden.join('. ') + '.' : 'FUSSBALL.DE liefert noch keinen bestätigten Endstand und keine freigegebene Aufstellung. Bitte später erneut abrufen.';
    if(art === 'ergebnis' && SG.satz.tore_h == null) a.text += ' Ein bestätigter Endstand fehlt noch.';
    if(art === 'aufstellung' && !quelle.start.length) a.text += ' Die Aufstellung fehlt noch.';
    if(Number.isInteger(r.namen_offen) && r.namen_offen > 0) a.text += ` ${r.namen_offen} Namen fehlen noch in der Quelle. Du kannst sie im Formular ergänzen.`;
    if(SG.satz.direkt?.tore_konflikt) a.text += ' Der Torverlauf passt noch nicht zum Endstand. Bitte prüfe die Tore.';
    if(SG.motiv === motiv) SG.motiv = art === 'aufstellung' ? 'A' : 'E';
    const fokus = folgtFokus(); await sgNeu(true); if(aktuell()){ const h = document.getElementById('sgWrap'); sgAbrufStatusAktualisieren(h); if(fokus && folgtFokus()){ const status = h && h.querySelector('[data-sgabruf-status]'); if(status && status.focus) status.focus({ preventScroll:true }); } }
  }catch(e){ if(!aktuell()) return; a.phase = 'fehler'; a.text = String(e.message || 'Der Abruf hat nicht geklappt. Bitte erneut versuchen.').slice(0,400); sgAbrufZeigen(folgtFokus()); }
}

/* ---------- Oberfläche ---------- */
async function sgStart(P){
  P.querySelectorAll(':scope > :not(.tk-modus)').forEach(e => e.remove());
  const h = document.createElement('div'); h.className = 'sg-wrap'; h.id = 'sgWrap'; h.innerHTML = '<div class="card"><div class="empty">Lade den Spieltag …</div></div>'; P.appendChild(h);
  try{ await Promise.all([sgFonts(), pkFontsLaden(), pkBib(), sgSpieleLaden(), tkKaderLaden().catch(() => {}), sbBibLaden().catch(() => {})]); }
  catch(e){ h.innerHTML = `<div class="card"><div class="empty">Der Spieltag konnte nicht geladen werden: ${sgE(e.message || e)}</div></div>`; return; }
  if(!SG.spiele.length){ h.innerHTML = '<div class="card"><div class="empty">Im Spielplan steht gerade kein Spiel. Sobald eins eingetragen ist, liegt hier das Plakat bereit.</div></div>'; return; }
  await sgSpielZeigen(); }
async function sgSpielZeigen(){ const h = document.getElementById('sgWrap'); if(!h) return; SG.motiv = '';
  h.innerHTML = '<div class="card"><div class="empty">Lade den Spieltag …</div></div>';
  try{ if(!await sgSatzLaden()) return; await sgNeu(true); }catch(e){ h.innerHTML = `<div class="card"><div class="empty">${sgE(e.message || e)}</div></div>`; } }
/* Bildwechsel sperren Freigabe und Export sofort, auch vor dem verzögerten
   Zeichnen. Neue Texte während einer Bildladung laden die aktuelle Wahl weiter. */
function sgBildStatus(text){ const h = document.getElementById('sgWrap'); if(!h) return;
  const e = h.querySelector('[data-sgbildstatus]'); if(e){ e.textContent = text; e.hidden = !text; }
  if(text) h.querySelectorAll('[data-sgx]').forEach(b => { if(b.dataset.sgx !== 'zurueck') b.disabled = true; });
}
function sgBildWarten(){ SG.bildOffen = true; sgBildStatus('Das gewählte Bild wird geladen. Bitte warte auf die neue Vorschau.'); }
/* Alles neu rechnen und zeichnen. mitBildern: Fotos und Wappen neu holen (sonst nur Text). */
async function sgNeu(mitBildern){ const h = document.getElementById('sgWrap'); if(!h || !SG.satz) return;
  const lauf = ++sgBildLauf, satz = SG.satz, konto = sgKonto(), aktuell = () => lauf === sgBildLauf && satz === SG.satz && konto === sgKonto();
  const D = sgDaten(), bilderLaden = mitBildern || SG.bildOffen || !SG.A.portrait; let A = SG.A;
  if(bilderLaden) sgBildWarten();
  try{ if(bilderLaden) A = await sgAssets(D); }catch(e){ if(!aktuell()) return false; sgBildStatus('Das Bild konnte nicht geladen werden. Wähle das Motiv bitte erneut.'); throw e; }
  if(!aktuell()) return false; SG.d = D; SG.A = A; SG.bildOffen = false;
  SG.pruef = {}; SG.cv = SG.cv || {};
  ['H', 'A', 'E', 'S'].forEach(m => { const cv = SG.cv[m] || (SG.cv[m] = document.createElement('canvas')); const vor = sgPruefen(m, SG.d, SG.A, {});
    const ue = vor.wartet ? {} : sgMalen(cv, m, SG.d, SG.A, m === 'S' ? (SG.seite || 0) : 0); SG.pruef[m] = sgPruefen(m, SG.d, SG.A, ue); });
  if(SG.motiv) sgDetail(h); else sgUebersicht(h); return true; }
function sgKopfHtml(){ const D = SG.d, dt = sgDatumTeile(D.datum) || { lang:'', tag:'' };
  const opt = SG.spiele.map((s, i) => `<option value="${i}"${i === SG.idx ? ' selected' : ''}>${sgE(s.datum.split('-').reverse().join('.'))} · ${s.sub === 'D2' ? 'Zweite' : s.sub === 'POKAL' ? 'Pokal' : 'Erste'} · ${s.heim ? 'H' : 'A'} · ${sgE(s.gegner)}</option>`).join('');
  return `<div class="sg-kopf"><p class="sg-meta"><b>${sgE(D.wettbewerb)} / Saison ${sgE(D.saison)}</b><br>${D.nr ? D.nr + '. Saisonspiel / ' : ''}${sgE(dt.lang)}</p>
    <h2 class="sg-h">Spiel<i>tag</i></h2>
    <p class="sg-paar">${sgE(D.heim)} <em>vs.</em> ${sgE(D.gast)}${D.gespielt ? ` <b>${D.toreH}:${D.toreG}</b>` : ''}</p>
    <label class="sg-wahl"><span>Spiel</span><select id="sgSpiel" aria-label="Spiel wählen">${opt}</select></label></div>`; }
function sgUebersicht(h){ const D = SG.d, M = ['H', 'A', 'E', 'S'];
  const frE = (SG.neu.frei || {}).E, zeigeDa = D.gespielt && !(frE && frE.stand === sgStandHash('E', D));
  const n = D.tore.length, da = zeigeDa ? `<div class="sg-da" id="sgDa"><strong>Ergebnis ist da: ${D.toreH}:${D.toreG}</strong><span>${n ? (n === 1 ? 'Ein Tor' : n + ' Tore') + ' aus dem Spielbericht übernommen.' : D.toreH === 0 && D.toreG === 0 ? 'Bei diesem Spiel sind keine Tore gefallen.' : 'Der Spielbericht mit den Toren fehlt noch.'} Schau kurz drüber, dann kann es raus.</span><button type="button" class="btn sm" data-sgm="E">Ergebnis ansehen</button></div>` : '';
  h.innerHTML = sgKopfHtml() + sgSpeicherHtml() + sgAbrufHtml('') + da + `<div class="sg-grid">${M.map(m => { const st = sgStand(m);
      return `<button type="button" class="sg-karte" data-sgm="${m}" data-art="${st.art}"><span class="sg-mini${st.art === 'wartet' ? ' leer' : ''}" data-sgcv="${m}">${st.art === 'wartet' ? `<i>${sgE(sgTitel(m))}</i>` : ''}</span><b>${sgE(sgTitel(m))}</b><span class="sg-st" data-art="${st.art}">${sgE(st.text)}</span></button>`; }).join('')}</div>
    <p class="sg-fuss">Die vier Motive lesen dieselben Angaben. Was du in einem änderst, stimmt in allen. Gezeichnet wird nach der Designbibel (Vorlagen ${Object.values(SG_VERSION).join(', ')}).</p>`;
  M.forEach(m => { const z = h.querySelector(`[data-sgcv="${m}"]`); if(z && !z.classList.contains('leer')) z.appendChild(SG.cv[m]); });
  sgBinden(h); }
function sgFeld(k, label, wert, o){ o = o || {}; return `<label class="sg-f"><span>${sgE(label)}</span><input type="${o.typ || 'text'}" data-sgf="${k}" value="${sgE(wert == null ? '' : wert)}" ${o.max ? `maxlength="${o.max}"` : ''} ${o.ph ? `placeholder="${sgE(o.ph)}"` : ''} ${o.attr || ''}></label>`; }
function sgFotoHtml(feld, wahl){ return sgFotoGalerieHtml(feld, wahl, SG.A, SG.d); }
function sgKaderName(p){ return `${String(p.vorname || '').trim()} ${String(p.nachname || '').trim()}`.trim(); }
function sgSpielerHtml(p, attr, titel){ const id = sgPerson(SG.d.sub)(p).fupa;
  const L = sgKaderListe(SG.d.sub).filter(k => sgKaderId(SG.d.sub, k.id));
  return `<label class="sg-zuordnung">${sgE(titel)}<select ${attr} aria-label="${sgE(titel)}"><option value="">Nicht zugeordnet, ohne Foto</option>${L.map(k => {
    const name = sgKaderName(k), doppelt = L.filter(x => sgKaderName(x) === name).length > 1;
    return `<option value="${sgE(k.id)}"${String(k.id) === id ? ' selected' : ''}>${sgE(name)}${k.nr != null && k.nr !== '' ? ' · Nr. ' + sgE(k.nr) : ''}${doppelt ? ' · Kennung ' + sgE(k.id) : ''}</option>`;
  }).join('')}</select></label>`; }
function sgSpielerSetzen(p, id, vorlage){ const vorher=sgPerson(SG.d.sub)(p).fupa,k=sgKaderId(SG.d.sub,id);
  if(vorlage){ p.vfupa = k ? String(k.id) : ''; if(k) p.vorlage = sgKaderName(k); }
  else { p.key = ''; p.fupa = k ? String(k.id) : ''; if(k){ p.name = sgKaderName(k); if('nr' in p&&p.nrHand===false)p.nr=k.nr===''||k.nr==null?null:+k.nr;if('tw'in p&&vorher!==String(k.id))p.tw=k.pos==='TW'; } }
}
function sgNummerSetzen(p,wert){p.nr=wert===''?null:Math.max(0,Math.round(+wert));p.nrHand=true;}
function sgListenHtml(){ return '<p class="sg-hin">' + (sgKaderListe(SG.d.sub).some(p=>sgKaderId(SG.d.sub,p.id)) ? 'Foto und Nummer werden nur bei eindeutiger Zuordnung ergänzt. Fehlt sie, wähle den Spieler im Kader. Eine Namensänderung löst die Zuordnung. Fehlende Fotos pflegst du im Live-Ticker unter Kader.' : 'Der Kader ist leer, konnte nicht geladen werden oder enthält keine eindeutigen Kennungen. Öffne im Live-Ticker den Bereich Kader und prüfe die Spieler dieser Mannschaft. Lade danach den Spieltag erneut. Namen und Nummern kannst du bis dahin von Hand eintragen.') + '</p>'; }
function sgToreEditorHtml(D){ return `${D.toreNeu ? `<div class="sg-quelle"><b>Der Spielbericht meldet jetzt andere Tore.</b><span>Deine Fassung bleibt, bis du entscheidest.</span><button type="button" class="btn sm ghost" data-sgq="tore-quelle">Spielbericht übernehmen</button><button type="button" class="btn sm ghost" data-sgq="tore-meins">Meine behalten</button></div>` : ''}
    <p class="sg-l">Tore</p><div class="sg-tore">${D.tore.map((t, i) => `<div class="sg-tor" data-i="${i}" data-wir="${t.wir ? 1 : 0}">
      <input type="number" data-sgt="m" value="${t.m || ''}" min="1" max="130" inputmode="numeric" aria-label="Minute"><input type="number" data-sgt="x" value="${t.x || ''}" min="0" max="20" inputmode="numeric" placeholder="+" aria-label="Nachspielzeit">
      <select data-sgt="wir" aria-label="Für wen"><option value="1"${t.wir ? ' selected' : ''}>Wir</option><option value="0"${t.wir ? '' : ' selected'}>Gegner</option></select>
      <input type="text" data-sgt="name" value="${sgE(t.name)}" placeholder="Torschütze" maxlength="40" aria-label="Torschütze">${t.wir?sgSpielerHtml(t,'data-sgt="fupa"','Spieler im Kader'):""}
      ${t.wir ? `<input type="text" data-sgt="vorlage" value="${sgE(t.vorlage === '-' ? '' : t.vorlage)}" placeholder="Vorlage" maxlength="40" aria-label="Vorlage">${sgSpielerHtml({fupa:t.vfupa},'data-sgt="vfupa"','Vorlagengeber im Kader')}<label class="sg-ohne"><input type="checkbox" data-sgt="ohne"${t.vorlage === '-' ? ' checked' : ''}> ohne Vorlage</label>` : ''}
      <button type="button" class="sg-weg" data-sgt="weg" aria-label="Tor entfernen">${SVI('x')}</button></div>`).join('')}</div>
    <div class="sg-zeile"><button type="button" class="btn sm ghost" data-sgq="tor-neu">Tor hinzufügen</button>${D.toreHand ? '<button type="button" class="btn sm ghost" data-sgq="tore-quelle">Zurück zum Spielbericht</button>' : ''}</div>
    <p class="sg-hin">Vorlagen stehen nicht im Spielbericht. Trag sie ein oder hake „ohne Vorlage“ an, sonst bleibt ein Strich und die Karte fragt nach.</p>
`; }
function sgFormular(m){ const D = SG.d, f = SG.neu.f || {};
  const kopf = `<details class="sg-mehr"><summary>Kopfzeile und Namen</summary>${sgFeld('wettbewerb', 'Wettbewerb', D.wettbewerb, { max:40 })}${sgFeld('nr', 'Saisonspiel Nummer', D.nr == null ? '' : D.nr, { typ:'number', attr:'min="0" max="60" inputmode="numeric"' })}
    ${sgFeld('wir', 'Unser Name auf dem Plakat', D.wir, { max:40 })}${sgFeld('gegner', 'Name des Gegners auf dem Plakat', D.gegner, { max:40 })}<p class="sg-hin">Die Nummer zählt die gespielten Ligaspiele dieser Mannschaft, nicht den Spieltag der Staffel.</p>${SG.A.wGeg ? sgWappenHtml() : ''}</details>`;
  if(m === 'H') return sgFeld('teaser', 'Unterzeile (nur, wenn sie stimmt)', D.teaser, { max:44, ph:'zum Beispiel: Derby am Sonntag.' }) + sgFeld('zeit', 'Anstoß', D.zeit, { typ:'time' }) + sgFeld('ort', 'Spielort auf Banner, Beitrag und Story', D.ort, { max:180 }) + '<p class="sg-hin">Deine Änderung erscheint direkt im Bild und in den vorbelegten Texten. Fehlt der Ort in den Spieldaten, trage ihn hier ein.</p>' + sgFotoHtml('fotoH', D.fotoH, SG.A.echtH) + kopf;
  if(m === 'E') return `<p class="sg-l">Headline</p><div class="sg-vor">${D.vorschlaege.map((v, i) => `<button type="button" data-sgvor="${i}" class="${D.kopfGewaehlt && D.h1 === v[0] && D.h2 === v[1] ? 'on' : ''}"><b>${sgE(v[0])}</b> ${sgE(v[1])}</button>`).join('')}</div>
    <p class="sg-hin">Die Vorschläge sagen nur, was der Endstand belegt. Wertungen wie „Favorit“ oder „verdient“ schreibst du selbst, wenn sie stimmen.</p>
    ${sgFeld('h1', 'Zeile 1', D.h1, { max:26 })}${sgFeld('h2', 'Zeile 2', D.h2, { max:22 })}
    <div class="sg-zwei">${sgFeld('toreH', 'Tore ' + D.heim, D.toreH, { typ:'number', attr:'min="0" max="40" inputmode="numeric"' })}${sgFeld('toreG', 'Tore ' + D.gast, D.toreG, { typ:'number', attr:'min="0" max="40" inputmode="numeric"' })}</div>
    <label class="sg-ergebnis-tore"><input type="checkbox" data-sgergebnistore${D.zeigeTore ? ' checked' : ''}><span>Torschützen beider Mannschaften auf dem Ergebnisbild</span></label>
    <p class="sg-hin">Die Schützen beider Mannschaften mit belegten Minuten. Mehrfachtore stehen gemeinsam unter einem Namen. Fehlen noch Angaben, kannst du sie hier ergänzen.</p>
    <details class="sg-mehr" data-sgtore-editor${D.zeigeTore && !sgErgebnisBeide(D).vollstaendig ? ' open' : ''}><summary>Torschützen bearbeiten</summary>${sgToreEditorHtml(D)}</details>` + sgFotoHtml('fotoE', D.fotoE, SG.A.echtE) + kopf + sgListenHtml();
  if(m === 'S') return sgToreEditorHtml(D) + `
    <div class="sg-zwei">${sgFeld('toreH', 'Tore ' + D.heim, D.toreH, { typ:'number', attr:'min="0" max="40" inputmode="numeric"' })}${sgFeld('toreG', 'Tore ' + D.gast, D.toreG, { typ:'number', attr:'min="0" max="40" inputmode="numeric"' })}</div>` + kopf + sgListenHtml();
  const zeile = (p, i, art) => `<div class="sg-sp" data-art="${art}" data-i="${i}"><input type="number" data-sgp="nr" value="${p.nr == null ? '' : p.nr}" min="0" max="99" inputmode="numeric" placeholder="Nr." aria-label="Rückennummer">
      <input type="text" data-sgp="name" value="${sgE(p.name)}" placeholder="Name" maxlength="40" aria-label="Name">${sgSpielerHtml(p,'data-sgp="fupa"','Spieler im Kader')}
      ${art === 'start' ? `<label class="sg-ohne"><input type="checkbox" data-sgp="c"${p.c ? ' checked' : ''}> C</label>` : `<input type="text" data-sgp="ein" value="${sgE(p.ein)}" placeholder="kam" maxlength="6" inputmode="numeric" aria-label="Eingewechselt in Minute">`}
      <label class="sg-ohne"><input type="checkbox" data-sgp="tw"${p.tw ? ' checked' : ''}> TW</label><button type="button" class="sg-weg" data-sgp="weg" aria-label="Entfernen">${SVI('x')}</button></div>`;
  return `${D.elfNeu ? `<div class="sg-quelle"><b>Der Spielbericht meldet jetzt eine andere Aufstellung.</b><span>Deine Fassung bleibt, bis du entscheidest.</span><button type="button" class="btn sm ghost" data-sgq="elf-quelle">Spielbericht übernehmen</button><button type="button" class="btn sm ghost" data-sgq="elf-meins">Meine behalten</button></div>` : ''}
    <p class="sg-l">Startelf (${D.start.length} von 11)</p><div class="sg-elf">${D.start.map((p, i) => zeile(p, i, 'start')).join('')}</div>
    <div class="sg-zeile"><button type="button" class="btn sm ghost" data-sgq="start-neu">Spieler hinzufügen</button></div>
    <p class="sg-l">Ersatzbank (${D.bank.length})</p><div class="sg-elf">${D.bank.map((p, i) => zeile(p, i, 'bank')).join('')}</div>
    <div class="sg-zeile"><button type="button" class="btn sm ghost" data-sgq="bank-neu">Spieler hinzufügen</button>${D.elfHand ? '<button type="button" class="btn sm ghost" data-sgq="elf-quelle">Zurück zum Spielbericht</button>' : ''}</div>
    ${sgFeld('trainer', 'Trainer', D.trainer, { max:40 })}` + kopf + sgListenHtml(); }
const sgFormat = m => SG.fmt === 'story' ? 'story' : SG.fmt === 'quer' && m === 'H' ? 'quer' : 'beitrag';
function sgQuerReglerHtml(){ const c = sgQuerGeometrie(), beweglich = c && c.reserve > 1;
  return `<div class="sg-quer-ausschnitt"><label class="sg-f" for="sgQuerY"><span>Foto höher / tiefer <output id="sgQuerYWert">${Math.round(SG.d.querY * 100)}%</output></span><input id="sgQuerY" type="range" min="0" max="100" step="1" value="${Math.round(SG.d.querY * 100)}" ${beweglich ? '' : 'disabled'}></label>
    <div class="sg-quer-enden"><span>Oberer Bildbereich</span><span>Unterer Bildbereich</span></div>
    <label class="sg-f" for="sgQuerZoom"><span>Zoom <output id="sgQuerZoomWert">${SG.d.querZoom.toFixed(2)}×</output></span><input id="sgQuerZoom" type="range" min="1" max="2" step="0.05" value="${SG.d.querZoom}" ${c ? '' : 'disabled'}></label>
    <p class="sg-hin" id="sgQuerHilfe">${beweglich ? 'Ziehe das Foto im Banner nach oben oder unten. Ein Tipp auf Text öffnet weiterhin das passende Feld.' : 'Zum Verschieben braucht das Foto mehr Höhe. Zoome etwas hinein, dann kannst du es höher oder tiefer schieben.'}</p>
    <button type="button" class="btn sm ghost" id="sgQuerReset">Ausschnitt zurücksetzen</button></div>`;
}
function sgQuerReglerAktualisieren(h){ if(SG.motiv !== 'H' || sgFormat('H') !== 'quer') return;
  const c = sgQuerGeometrie(), beweglich = !!(c && c.reserve > 1), y = h.querySelector('#sgQuerY'), z = h.querySelector('#sgQuerZoom');
  const gesperrt=sgSpeicherKonflikt();if(y){ y.value = Math.round(SG.d.querY * 100); y.disabled = gesperrt||!beweglich; } if(z){ z.value = SG.d.querZoom; z.disabled = gesperrt||!c; }const reset=h.querySelector('#sgQuerReset');if(reset)reset.disabled=gesperrt;
  const yw = h.querySelector('#sgQuerYWert'), zw = h.querySelector('#sgQuerZoomWert'), hilfe = h.querySelector('#sgQuerHilfe'), bild = h.querySelector('#sgBild');
  if(yw) yw.textContent = Math.round(SG.d.querY * 100) + '%'; if(zw) zw.textContent = SG.d.querZoom.toFixed(2) + '×';
  if(hilfe) hilfe.textContent = beweglich ? 'Ziehe das Foto im Banner nach oben oder unten. Ein Tipp auf Text öffnet weiterhin das passende Feld.' : 'Zum Verschieben braucht das Foto mehr Höhe. Zoome etwas hinein, dann kannst du es höher oder tiefer schieben.';
  if(bild) bild.dataset.querBeweglich = beweglich ? '1' : '0';
  const fr = (SG.neu.frei || {}).H, frei = fr && fr.stand === sgStandHash('H', SG.d), p = sgPruefen('H', SG.d, SG.A, SG.ueber || {});
  h.querySelectorAll('[data-sgx="teilen"],[data-sgx="png"],[data-sgx="zip"]').forEach(b => b.disabled = !frei || !!p.wartet || p.fehler.length > 0);
  const st = SG.pruef && SG.pruef.H ? sgStand('H') : null, status = h.querySelector('.sg-dkopf .sg-st'); if(st && status){ status.dataset.art = st.art; status.textContent = st.text; }
}
function sgQuerAendern(k, v, h){ if(SG.motiv !== 'H' || sgFormat('H') !== 'quer') return;
  if(sgSpeicherKonflikt())return;
  const wert = k === 'querZoom' ? sgQuerNorm(v, 1, 1, 2) : sgQuerNorm(v, .5, 0, 1);
  sgSetzen(k, Math.round(wert * 10000) / 10000); SG.d = sgDaten(); sgSchau('H'); sgQuerReglerAktualisieren(h); sgFotoQualitaetAktualisieren(h); sgMerken();
}
function sgBildTreffer(cv, ev){ const r = cv.getBoundingClientRect(); if(!r.width || !r.height) return null;
  const x = (ev.clientX - r.left) * cv.width / r.width, y = (ev.clientY - r.top) * cv.height / r.height;
  return (SG.reg[SG.motiv] || []).find(g => x >= g.x && x <= g.x + g.w && y >= g.y && y <= g.y + g.h) || null;
}
function sgQuerBinden(h){ if(SG.motiv !== 'H' || sgFormat('H') !== 'quer') return;
  const bild = h.querySelector('#sgBild'), spiel = SG.satz && SG.satz.spiel;
  const aktuell = () => SG.motiv === 'H' && sgFormat('H') === 'quer' && SG.satz && SG.satz.spiel === spiel && h.isConnected !== false;
  for(const [id, k] of [['sgQuerY','querY'],['sgQuerZoom','querZoom']]){ const e = h.querySelector('#' + id); if(e){ e.oninput = () => { if(aktuell()) sgQuerAendern(k, Number(e.value) / (k === 'querY' ? 100 : 1), h); }; e.onchange = () => { if(aktuell()) sgBald(false, false); }; } }
  const reset = h.querySelector('#sgQuerReset'); if(reset) reset.onclick = () => { if(!aktuell()) return; sgQuerAendern('querY', .5, h); sgQuerAendern('querZoom', 1, h); sgBald(false, false); };
  if(!bild) return; sgQuerReglerAktualisieren(h); let zug = null;
  bild.onpointerdown = ev => { if(!aktuell() || ev.isPrimary === false || ev.button != null && ev.button !== 0 || zug) return;
    const cv = bild.querySelector('canvas'); if(!cv || ev.target && ev.target !== cv) return; const c = sgQuerGeometrie(), r = cv.getBoundingClientRect(); if(!c || !r.height) return;
    bild.sgQuerKlickSperre = false;
    zug = { id:ev.pointerId, x:ev.clientX, y:ev.clientY, wert:c.y, reserve:c.reserve, skala:cv.height / r.height, bewegt:false, geaendert:false };
  };
  bild.onpointermove = ev => { if(!zug || ev.pointerId !== zug.id || !aktuell()) return;
    if(!zug.bewegt && Math.hypot(ev.clientX - zug.x, ev.clientY - zug.y) < 5) return;
    if(!zug.bewegt){ zug.bewegt = true; try{ bild.setPointerCapture(ev.pointerId); }catch(e){} }
    ev.preventDefault();
    if(zug.reserve > 1){ sgQuerAendern('querY', zug.wert - (ev.clientY - zug.y) * zug.skala / zug.reserve, h); zug.geaendert = true; bild.classList.add('sg-zieht'); }
  };
  const ende = ev => { if(!zug || ev.pointerId !== zug.id) return; const z = zug; zug = null; bild.classList.remove('sg-zieht');
    // Die Sperre wird vom folgenden Click verbraucht. Ein neuer echter Pointerdown
    // hebt sie auf, sodass nach Cancel auch ein sofortiger neuer Tipp funktioniert.
    if(z.bewegt) bild.sgQuerKlickSperre = true;
    try{ if(bild.hasPointerCapture(ev.pointerId)) bild.releasePointerCapture(ev.pointerId); }catch(e){}
    if(z.geaendert && aktuell()) sgBald(false, false);
  };
  bild.onpointerup = ende; bild.onpointercancel = ende; bild.onlostpointercapture = ende;
}
function sgFormFokus(aktiv,h){if(!aktiv||!h.contains(aktiv))return'';const d=aktiv.dataset||{};
  for(const k of ['sgtext','sgf','sgcut'])if(d[k])return`[data-${k}="${d[k]}"]`;
  for(const k of ['sggeschichte','sgergebnistore'])if(d[k]!=null)return`[data-${k}]`;
  const row=aktiv.closest?.('.sg-tor,.sg-sp');if(!row)return'';const tor=!!d.sgt,art=tor?'tore':row.dataset.art,L=SG.neu[art],i=row.sgDatensatz&&Array.isArray(L)?L.indexOf(row.sgDatensatz):+row.dataset.i;if(i<0)return'';
  return tor?`.sg-tor[data-i="${i}"] [data-sgt="${d.sgt}"]`:`.sg-sp[data-art="${art}"][data-i="${i}"] [data-sgp="${d.sgp}"]`;
}
function sgDetail(h){ const m = SG.motiv, D = SG.d, fmt = sgFormat(m), vor = SG.pruef[m];
  const P = SG.bildOffen ? sgPruefen(m, D, SG.A, {}) : fmt === 'quer' && !vor.wartet ? sgPruefen(m, D, SG.A, sgMalen(SG.cvQuer || (SG.cvQuer = document.createElement('canvas')), m, D, SG.A, 0, 'quer')) : vor;
  const st = P.fehler.length ? { art:'du', text:'Braucht dich: ' + P.fehler[0] } : sgStand(m), fr = (SG.neu.frei || {})[m], frei = fr && fr.stand === sgStandHash(m, D);
  const aktiv = document.activeElement, fokus = sgFormFokus(aktiv,h), auswahl = fokus ? [aktiv.selectionStart, aktiv.selectionEnd] : null;
  const fotoZustand = sgFotoZustand(h), toreEditorOffen = h.querySelector('[data-sgtore-editor]')?.open;
  const querFokus = aktiv && h.contains(aktiv) && ['sgQuerY','sgQuerZoom'].includes(aktiv.id) ? aktiv.id : '';
  const offen = !!P.wartet || P.fehler.length > 0, seiten = m === 'S' ? sgSeitenS(D) : 1;
  const liste = [...P.fehler.map(t => `<li class="f">${sgE(t)}</li>`), ...P.hinweise.map(t => `<li class="h">${sgE(t)}</li>`), ...(!offen && !P.hinweise.length ? ['<li class="ok">Angaben vollständig, nichts läuft über</li>'] : []), ...P.notizen.map(t => `<li class="n">${sgE(t)}</li>`)].join('');
  const am = fr && fr.am ? new Date(fr.am).toLocaleString('de-DE', { day:'2-digit', month:'2-digit', hour:'2-digit', minute:'2-digit' }) : '';
  h.innerHTML = `${sgSpeicherHtml()}<div class="sg-dkopf"><button type="button" class="btn sm ghost" id="sgZurueck"><span class="sg-zur">${SVI('chev')}</span> Spieltag</button><h3>${sgE(sgTitel(m))}</h3><span class="sg-st" data-art="${st.art}">${sgE(st.text)}</span></div>
    <div class="sg-zwei-sp"><div class="sg-buehne">${P.wartet ? '' : `<div class="sg-zeile sg-fmt"><button type="button" class="btn sm ${fmt === 'beitrag' ? '' : 'ghost'}" data-sgfmt="beitrag">Beitrag 4:5</button><button type="button" class="btn sm ${fmt === 'story' ? '' : 'ghost'}" data-sgfmt="story">Story 9:16</button>${m === 'H' ? `<button type="button" class="btn sm ${fmt === 'quer' ? '' : 'ghost'}" data-sgfmt="quer">WhatsApp-Banner 16:9</button>` : ''}</div>`}
        ${m !== 'H' ? sgAbrufHtml(m) : ''}<div class="sg-bild${P.wartet ? ' leer' : ''}" id="sgBild" data-fmt="${!P.wartet ? fmt : 'beitrag'}">${P.wartet ? `<i>${sgE(P.wartet)}</i>` : ''}</div>
        <div class="sg-zeile"><button type="button" class="btn sm ghost" data-sgtexte-zeigen>Texte für Gruppen und Storys</button></div>
        ${!P.wartet ? m==='H'&&fmt==='quer'?sgQuerReglerHtml():sgAusschnittHtml(m,fmt) : ''}
        ${seiten > 1 ? `<div class="sg-zeile sg-seiten">${Array.from({ length:seiten }, (_, i) => `<button type="button" class="btn sm ${i === (SG.seite || 0) ? '' : 'ghost'}" data-sgseite="${i}">Karte ${i + 1}</button>`).join('')}</div>` : ''}
        <p class="sg-hin" data-sgbildstatus role="status" aria-live="polite" hidden></p><p class="sg-hin sg-fotoqualitaet" data-sgfotoqualitaet hidden></p><ul class="sg-pruef" id="sgPruef">${liste}</ul>
        <div class="sg-akt">${frei ? `<p class="sg-frei">Freigegeben von ${sgE(fr.name || 'jemandem')}${am ? ', ' + sgE(am) + ' Uhr' : ''}.</p><button type="button" class="btn" data-sgx="teilen" ${offen ? 'disabled' : ''}>${SVI('share')} ${seiten > 1 ? 'Diese Karte teilen' : 'Teilen'}</button><button type="button" class="btn ghost" data-sgx="png" ${offen ? 'disabled' : ''}>${seiten > 1 ? 'Diese Karte als PNG' : 'PNG laden'}</button>${seiten > 1 ? `<button type="button" class="btn ghost" data-sgx="zip" ${offen ? 'disabled' : ''}>Alle ${seiten} Karten als ZIP</button>` : ''}<button type="button" class="btn ghost sm" data-sgx="zurueck">Freigabe zurücknehmen</button>`
          : `<button type="button" class="btn" data-sgx="frei" ${offen ? 'disabled' : ''}>${SVI('check')} Stimmt so</button>${offen ? `<p class="sg-hin">${sgE(P.wartet || 'Erst wenn nichts mehr fehlt, lässt sich das Motiv freigeben.')}</p>` : '<p class="sg-hin">Mit „Stimmt so“ gibst du diesen Stand frei. Danach kannst du teilen.</p>'}`}</div></div>
      <div class="sg-form" id="sgForm">${SG.A.wGeg ? '' : sgWappenHtml()}<p class="sg-tipp">Tipp auf ein Wort im Bild, und du landest im passenden Feld.</p>${sgFormular(m)}${sgTexteHtml(m)}</div></div>`;
  if(!P.wartet){ const z = h.querySelector('#sgBild'); z.appendChild(sgSchau(m)); }
  sgBinden(h); sgTexteHoehen(h); sgFotoWiederherstellen(h, fotoZustand); if(toreEditorOffen){ const e = h.querySelector('[data-sgtore-editor]'); if(e) e.open = true; } if(fokus || querFokus){ const ziel = h.querySelector(fokus || '#' + querFokus); if(ziel){ ziel.focus({ preventScroll:true }); if(auswahl) try{ ziel.setSelectionRange(...auswahl); }catch(e){} } } }
/* Die Leinwand der Einzelansicht: der Beitrag aus der Übersicht oder dasselbe Motiv als Story, frisch gezeichnet */
function sgSchau(m){ const fmt = sgFormat(m); if(fmt === 'beitrag') return SG.cv[m]; const key = fmt === 'quer' ? 'cvQuer' : 'cvStory', cv = SG[key] || (SG[key] = document.createElement('canvas')); sgMalen(cv, m, SG.d, SG.A, m === 'S' ? (SG.seite || 0) : 0, fmt); return cv; }
function sgSetzen(k, v){ SG.neu.f = SG.neu.f || {}; if(k === 'ort') SG.neu.f[k] = String(v || ''); else if(v === '' || v == null) delete SG.neu.f[k]; else SG.neu.f[k] = v; }
function sgToreHand(vor=SG.d.tore){ if(!Array.isArray(SG.neu.tore)){ SG.neu.tore = vor.map(t => ({key:t.key,fupa:t.fupa,vfupa:t.vfupa,m:t.m,x:t.x,wir:t.wir,art:t.art,name:t.name,vorlage:t.vorlage})); SG.neu.toreQ = sgHash(JSON.stringify(SG.d.quelle.tore)); SG.neu.toreQV=3; } return SG.neu.tore; }
function sgElfHand(start=SG.d.start,bank=SG.d.bank){ if(!Array.isArray(SG.neu.start)){ const z = p => ({key:p.key,fupa:p.fupa,name:p.name,nr:p.nr,nrHand:p.nrHand,tw:p.tw,c:p.c,ein:p.ein}); SG.neu.start = start.map(z); SG.neu.bank = bank.map(z); SG.neu.elfQ = sgHash(JSON.stringify([SG.d.quelle.start, SG.d.quelle.bank])); SG.neu.elfQV=3; }
  if(!Array.isArray(SG.neu.bank)) SG.neu.bank = []; return SG.neu; }
let sgZeichenT = null;
function sgBald(mitBildern, ganz){ mitBildern = mitBildern || !!SG.bildOffen; if(mitBildern) sgBildWarten(); const satz = SG.satz, konto = sgKonto(), lauf = ++sgBildLauf, aktuell = () => lauf === sgBildLauf && satz === SG.satz && konto === sgKonto(); sgMerken(); clearTimeout(sgZeichenT); sgZeichenT = setTimeout(async () => { if(!aktuell()) return; if(ganz){ try{ return await sgNeu(mitBildern); }catch(e){ if(satz === SG.satz && konto === sgKonto()) kToast('Das Bild konnte nicht geladen werden. Wähle das Motiv bitte erneut.'); return false; } }
    /* Beim Tippen bleibt das Formular stehen: nur Bild, Prüfliste und Zustand werden frisch */
    const m = SG.motiv, D = sgDaten(); let A = SG.A;
    try{ if(mitBildern) A = await sgAssets(D); }catch(e){ if(aktuell()){ sgBildStatus('Das Bild konnte nicht geladen werden. Wähle das Motiv bitte erneut.'); kToast('Das Bild konnte nicht geladen werden. Wähle das Motiv bitte erneut.'); } return; }
    if(!aktuell()) return; SG.d = D; SG.A = A; SG.bildOffen = false; sgBildStatus('');
    ['H', 'A', 'E', 'S'].forEach(x => { const vor = sgPruefen(x, SG.d, SG.A, {}); const ue = vor.wartet ? {} : sgMalen(SG.cv[x], x, SG.d, SG.A, x === 'S' ? (SG.seite || 0) : 0); SG.pruef[x] = sgPruefen(x, SG.d, SG.A, ue); });
    const h = document.getElementById('sgWrap'); if(!h || !m) return; if(sgFormat(m) !== 'beitrag' && !SG.pruef[m].wartet) sgSchau(m);
    const P = sgFormat(m) === 'quer' && !SG.pruef[m].wartet ? sgPruefen(m, SG.d, SG.A, SG.ueber) : SG.pruef[m], st = P.fehler.length ? { art:'du', text:'Braucht dich: ' + P.fehler[0] } : sgStand(m), kopf = h.querySelector('.sg-dkopf .sg-st'); if(kopf){ kopf.dataset.art = st.art; kopf.textContent = st.text; }
    sgTexteAktualisieren(h);
