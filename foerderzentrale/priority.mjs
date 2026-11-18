import { cents, euro, isDay, isOriginal, sourceUrl } from './domain.mjs?v=beta-0.99.98';

// Redaktionelle Arbeitshypothesen, keine behaupteten Bearbeitungszeiten oder Förderauflagen.
const profiles = [
  [/jährliche jugendförderung/i, 1, 4, 'Vorhandene Vereinsmeldung zuerst auf Vollständigkeit prüfen. Keine neue Maßnahme nötig.', 'Gesamtverein und bereits gestellten Antrag abgleichen.'],
  [/lizenzierte übungsleitungen/i, 2, 4, 'Bestehendes Training und vorhandene Lizenzen bieten einen Ansatz ohne zusätzliches Projekt.', 'Vergütung, Einsatz und vollständige Lizenznachweise mit der Geschäftsstelle prüfen.'],
  [/fahrtkostenzuschüsse/i, 2, 3, 'Vorhandene Pflichtspiele und Belege auswerten, statt ein neues Vorhaben aufzubauen.', 'Abrechnungsweg und verfügbare Mittel über die Fachschaft klären.'],
  [/c-lizenz/i, 2, 4, 'Überschaubarer Antrag bei ohnehin geplanter Ausbildung, aber längerfristige Verpflichtung.', 'Dreijährige Bindung und Rückzahlung aus dem Merkblatt vor Buchung prüfen.'],
  [/sichere jugend|trainingstore/i, 3, 4, 'Angebote, Klassifizierung und sichere Aufstellung erfordern Abstimmung. Bedeutung ist ein Vorschlag, kein Befund über vorhandene Tore.', 'Gebrauchtkauf mit Transport, Kippsicherung, Reparaturen und Restnutzungsdauer vergleichen.'],
  [/langlebige geräte/i, 3, 3, 'Geräteeignung, Preise und verfügbares Fondsguthaben müssen zusammenpassen.', 'Gebrauchte Geräte, gemeinsamer Materialpool und Kauf ohne Zuschuss vergleichen.'],
  [/trainingsbälle/i, 2, 3, 'Ein klar abgegrenztes Materialpaket lässt sich relativ einfach darstellen; die Bankbedingungen bleiben zu prüfen.', 'Sammelbestellung und Mengenrabatt vergleichen; Zustand und Eignung gebrauchter Bälle beachten.'],
  [/personalkosten.*fußball-ag/i, 3, 4, 'Die Kooperation ist ein Ansatzpunkt, aber Stunden, Qualifikation und Restfinanzierung brauchen laufende Nachweise.', 'Mit der Schule bereits finanzierte Stunden und Gesamtaufwand abgleichen.'],
  [/materialpool/i, 2, 3, 'Kleine Projektbeschreibung möglich, eine Auslosung bleibt unplanbar.', 'Vorhandenes Schulmaterial und direkte Sachspenden zuerst prüfen.'],
  [/flutlicht/i, 5, 3, 'Technische Planung, Eigentümer, Einsparung und Ausführung machen dies zu einem langfristigen Vorhaben.', 'Planungs-, Genehmigungs- und Nachweiskosten erfragen. Eine Planerpflicht ist damit nicht festgestellt.'],
  [/materiallager/i, 5, 3, 'Standort, Eigentum, Bauart und mögliche Genehmigungen können den Zuschussvorteil aufzehren.', 'Vorhandenen Raum oder gebrauchten Container einschließlich Transport, Fundament und Genehmigungen vergleichen.'],
  [/videoanalyse|veo/i, 4, 2, 'Laufende Lizenzen und mehrjährige Bindung erschweren den Fördervergleich.', 'Gesamte Vertragslaufzeit und günstigere Aufnahme-/Analysevarianten vergleichen.'],
  [/digitale abläufe/i, 4, 3, 'Einführung, Datenschutz, Schulung und laufende Kosten gehen über einen Softwarekauf hinaus.', 'Kleine Einführung mit vorhandenen Werkzeugen gegen ein größeres Förderprojekt rechnen.'],
  [/inklusiver/i, 5, 3, 'Ein tragfähiges Angebot verlangt Beteiligung, Partner, Personal und längerfristige Durchführung.', 'Nur bei bestätigtem Bedarf und dauerhaft verfügbarer Betreuung vorbereiten.'],
  [/zugewanderte/i, 4, 3, 'Koordination, Zugänge und dauerhafte Begleitung sind wichtiger als die Antragshöhe.', 'Bestehende Teams zugänglich machen und lokale Partner einbeziehen.'],
  [/gesundheit/i, 4, 3, 'Fachliche Leitung und eine tatsächliche Durchführung müssen gesichert sein.', 'Verfügbare Bildungsbausteine gegen ein eigenes neues Projekt abwägen.'],
  [/jugendworkshop/i, 3, 3, 'Ein begrenzter Workshop ist planbar, benötigt aber Bildungsziel, Betreuung und Nachweise.', 'Vorhandenen Jugendtermin und externe Bildungsbausteine nutzen.'],
  [/soforthilfe/i, 2, 4, 'Bei konkreter Teilhabehürde kann eine kleine Hilfe viel bewirken. Das ist kein allgemeiner Materialtopf.', 'Örtliche vorrangige Hilfen prüfen; keine privaten Angaben von Kindern hier erfassen.'],
  [/ehrenamtliche/i, 3, 3, 'Rollen, Einführung und Begleitung müssen auch nach einem geförderten Termin funktionieren.', 'Kleinen vereinsinternen Einführungstermin als Alternative prüfen.'],
  [/mädchenfußball/i, 3, 3, 'Aktion und anschließendes Training brauchen Betreuung; Beratung ist noch kein Geldzuschuss.', 'Vorhandenes Training öffnen und Unterstützung des Verbandes erfragen.'],
  [/bildungsausflug/i, 3, 2, 'Bildungsziel, Teilnehmende, Betreuung und Kosten müssen zur richtigen Förderrubrik passen.', 'Günstigeres Ziel und bestehende Angebote vergleichen.'],
  [/ferienfreizeit/i, 4, 2, 'Bewerbung, Betreuung und Teilnahmebedingungen benötigen Vorlauf.', 'Teilnahmeangebot statt frei verfügbarem Geld bewerten.'],
  [/projektpartnerschaft/i, 3, 3, 'Partnerabstimmung und Gegenleistungen verursachen Aufwand und Verpflichtungen.', 'Bestehende Partnerverträge, Sachleistungen und Veranstaltungskosten abgleichen.'],
];
const esc = v => String(v ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'})[c]);
const date = v => v.split('-').reverse().join('.');
const money = v => { try { return cents(v); } catch { return null; } };
const positive = v => Number.isFinite(v) && v >= 0;
const usedSource = 'https://www.kreis-bergstrasse.de/unser-buergerservice/freizeit-kultur-tourismus/ehrenamt-im-kreis-bergstrasse/flyer-vereinsfoerderrichtlinie-2020.pdf?cid=ltg';
export const horizonLabels = { now:'Schnell prüfen', medium:'Mittelfristig vorbereiten', long:'Langfristig planen', wait:'Derzeit zurückstellen' };
export function cleanAssessment(value = {}) {
  if (!value || typeof value !== 'object') value = {};
  const result = {};
  for (const k of ['effort','importance']) if (/^[1-5]$/.test(String(value[k]))) result[k] = Number(value[k]);
  for (const k of ['projectCost','grant','extra','hours','hourValue','alternative']) {
    if (typeof value[k] === 'string' && value[k].length <= 12) result[k] = value[k];
  }
  result.comparable = value.comparable === true;
  result.note = typeof value.note === 'string' ? value.note.slice(0, 500) : '';
  return result;
}
export function costComparison(report, input = {}) {
  const invalid = ['projectCost','grant','extra','hours','hourValue','alternative'].some(k=>String(input[k] || '').trim() && money(input[k])==null);
  const scenario = Boolean(String(input.projectCost || '').trim() || String(input.grant || '').trim());
  const total = scenario ? money(input.projectCost) : report?.total;
  const funding = scenario ? money(input.grant) : report?.funding;
  const inconsistent = positive(total) && positive(funding) && funding > total;
  const own = !invalid && !inconsistent && positive(total) && positive(funding) ? total-funding : null;
  const extra = money(input.extra), alternative = money(input.alternative);
  const hours = money(input.hours), hourValue = money(input.hourValue);
  const time = hours != null && hourValue != null ? Math.round(hours * hourValue / 100) : null;
  const cash = own != null && extra != null ? own + extra : null;
  const economic = cash != null && time != null ? cash + time : null;
  const delta = input.comparable && alternative != null && economic != null ? alternative - economic : null;
  const netGrant = own != null && extra != null && time != null ? funding - extra - time : null;
  return { extra, alternative, time, cash, economic, delta, netGrant, invalid, inconsistent, scenario, funding, own };
}
// Belegte veröffentlichte Rahmen, nur bei passender Originalquelle. Nicht in Projektberechnung einsetzen.
function publishedFrame(item, source) {
  const p = item.program;
  let u; try { u=new URL(source?.url); } catch { return 'Höchstbetrag offen. Originalquelle prüfen.'; }
  const host=u.hostname.replace(/^www\./,''), path=u.pathname;
  if (host==='aktion-mensch.de' && path==='/foerderung/foerderangebote/sport-kultur') return 'Bis 50.000 € und bis 90 %; mindestens 10 % Eigenmittel. Kein reiner Gerätekauftopf.';
  if (host==='kreis-bergstrasse.de' && /flyer-vereinsfoerderrichtlinie-2020\.pdf$/.test(path) && item.type === 'goal') return 'Regelfall Anschaffungen: bis 20 %, maximal 800 € je Verein/Jahr. Abteilungsregel und begründete Ausnahmen gesondert klären; bereits genutzte Mittel beachten.';
  if (host==='kreis-bergstrasse.de' && /uebungsleiterausbildung-merkblatt\.pdf$/.test(path)) return 'Bis 260 € Ausbildung, bis 100 € Weiterbildung; dreijährige Bindung laut Merkblatt.';
  if (host==='landessportbund-hessen.de' && /\/schule-und-verein\/landesprogramm\/?$/.test(path)) return 'Bis 700 € Personalkosten je Schuljahr bei 40 Unterrichtsstunden; Auszahlung nach Stundennachweis.';
  if (host==='static-sportjugend-hessen-de.s3.amazonaws.com' && /Antrag_Kinderarmut_2025_ed\.pdf$/.test(path)) return 'Bis 300 € je Antrag und Organisation/Kalenderjahr, mindestens 25 % Eigenanteil; keine allgemeine Vereinsförderung.';
  if (host==='moerlenbach.de' && /Vereins-_und_Jugendfoerderung/.test(path) && /jährliche/i.test(item.title)) return '2,50 € je berücksichtigtem Jugendmitglied plus 100 € Sockel je antragstellendem Sportverein. Mitgliederzahl und bereits gestellten Antrag klären.';
  if (host==='lotto-hilft-hessen.de' && /\/teilnahmebedingungen\/?$/.test(path)) return '2.000 € bei Auslosungsgewinn. Nicht als sichere Finanzierung einplanen.';
  if (host==='landessportbund-hessen.de' && /Richtlinien_fuer_Investitionszuschuesse/.test(path)) return ['goal','equipment'].includes(item.type)
    ? 'Langlebige Sportgeräte bis 50 %, Zusatzgeräte bis 10 %; tatsächliches Fondsguthaben des Vereins begrenzt den Zuschuss.'
    : 'Die Richtlinie unterscheidet Bauvorhaben, Sportgeräte und Zusatzgeräte. Passenden Bereich und verfügbares Fondsguthaben zuerst klären; keine Gerätequote auf das Gesamtvorhaben übertragen.';
  if (host==='digitales.hessen.de' && path==='/foerderprogramme/ehrenamt-digitalisiert' && p.status==='closed') return 'Geschlossene Runde 2026: 5.000 bis 15.000 € Zuschuss, bis 90 %. Keine Übertragung auf eine neue Runde ohne Prüfung.';
  const cap = money(p.cap);
  return cap != null && p.financial === source?.id ? 'Erfasste Obergrenze: ' + euro(cap) + '. Geltungsbereich der Quelle prüfen.' : 'Höchstbetrag für diesen Fall offen. Nicht mit 0 € oder einer Zusage gleichsetzen.';
}
export function priority(entry, input = {}, day) {
  const item = entry.item, report = entry.report;
  const profile = profiles.find(row => row[0].test(item.title)) || [null,3,3,'Aufwand und Nutzen sind noch nicht individuell eingeordnet.','Zuständigkeit, Auflagen und kostengünstige Alternativen klären.'];
  const effort = input.effort || profile[1], importance = input.importance || profile[2];
  const source = item.sources.find(s => s.id === item.program.source);
  // Die redaktionellen Rahmen werden nicht durch ein neues Prüfdatum einer Akte automatisch aktualisiert.
  const researchDay='2026-11-15';
  const researchFresh=isDay(day) && day>=researchDay && (Date.parse(day)-Date.parse(researchDay))/86400000<=90;
  const frameSource = source?.url?.startsWith('https://www.sportjugend-hessen.de/') && /Soforthilfe_Antrag_2024\.pdf$/.test(source.url)
    ? {...source,url:'https://static-sportjugend-hessen-de.s3.amazonaws.com/user_upload/Download_Center_Files/Antrag_Kinderarmut_2025_ed.pdf'} : source;
  const age = source && isDay(source.checked) ? (Date.parse(day) - Date.parse(source.checked)) / 86400000 : Infinity;
  const fresh = Boolean(isOriginal(source,day)) && age <= 90;
  const until = fresh && isDay(item.program.until) ? item.program.until : null;
  const days = until ? Math.ceil((Date.parse(until) - Date.parse(day)) / 86400000) : null;
  const expired = isDay(item.program.until) && item.program.until < day;
  const closed = item.program.status === 'closed' || expired || report?.status === 'watch_next_round';
  const excluded = report?.status === 'ineligible';
  const comparison = costComparison(report,input);
  const disadvantage = comparison.delta != null && comparison.delta < 0;
  const deadlinePoints = !closed && days != null ? days <= 14 ? 3 : days <= 30 ? 2 : days <= 90 ? 1 : 0 : 0;
  const score = importance * 2 + 6 - effort + deadlinePoints;
  const group = closed || excluded || disadvantage ? 'D' : score >= 12 ? 'A' : score >= 8 ? 'B' : 'C';
  const horizon = group === 'D' ? 'wait' : effort <= 2 ? 'now' : effort <= 3 ? 'medium' : 'long';
  const unplanned=['lottery','prize','advisory','goods'].includes(item.program.instrument);
  const quick = effort <= 2 && !closed && !excluded && fresh && !disadvantage && !unplanned;
  const label = closed ? 'Runde geschlossen' : excluded ? 'Förderweg passt derzeit nicht' : disadvantage ? 'Direkte Alternative günstiger' : quick ? 'Quick-Win-Kandidat' : horizonLabels[horizon];
  const deadline = closed ? (expired ? 'Zuletzt erfasste Frist vorbei: ' + date(item.program.until) + (fresh?'':'; Quelle erneut prüfen') : 'Runde geschlossen; Folgerunde offen')
    : until ? (days === 0 ? 'Heute: ' : 'Frist: ') + date(until) + (days > 0 ? ' · noch ' + days + ' Tage' : '')
    : fresh && item.program.status === 'rolling' ? 'Laufend laut Quelle, keinen festen Stichtag erfasst' : 'Aktuelle Antragsfrist offen';
  return { effort,importance,reason:profile[3],caution:profile[4],source,frameSource,researchDay,fresh,score,group,horizon,quick,label,deadline,days,comparison,
    usedHint:researchFresh && ['goal','equipment','storage'].includes(item.type) ? 'Auch Gebrauchtkauf kann ein Förderweg sein: Abschnitt 9 der Kreisrichtlinie nennt hochwertige, langlebige Anschaffungen aus zweiter Hand. Bis 20 %, maximal 3.000 € in diesem gesonderten Förderbereich. Zuordnung und Kombination vor Kauf klären; nicht zum Regelzuschuss addieren.' : '',
    frame:fresh && researchFresh ? publishedFrame(item,frameSource) : 'Förderrahmen erst nach aktueller Originalquellenprüfung bewerten.',
    basis:input.effort || input.importance ? 'Deine Einstufung mit redaktionellem Ausgangsvorschlag' : 'Redaktionelle Ersteinschätzung, im Verein bestätigen' };
}
export function prioritySummary(p) {
  const c=p.comparison;
  return [`Priorität ${p.group} · ${p.label}`,`Aufwand ${p.effort}/5 · Wichtigkeit ${p.importance}/5 (Vorschlag bzw. eigene Einstufung)`,p.deadline,
    'Förderrahmen: '+p.frame,'Begründung: '+p.reason,'Abwägung: '+p.caution,
    ...(p.usedHint?[p.usedHint,'Quelle: '+usedSource]:[]),
    'Quelle zum Förderrahmen: '+(sourceUrl(p.frameSource?.url)||'offen')+' · Rahmenrecherche '+p.researchDay,
    c.scenario ? 'Kostenvergleich verwendet eigene Planungsschätzungen, keine belegte Förderzusage.' : 'Kostenvergleich verwendet die erfasste Aktenberechnung, keine Förderzusage.',
    c.cash != null ? 'Vereinsausgaben mit Förderung und Zusatzkosten: '+euro(c.cash) : 'Vereinsausgaben mit Förderung: noch nicht vollständig berechenbar',
    c.delta != null ? 'Vorteil der Förderung gegenüber der vergleichbaren direkten Alternative einschließlich bewerteter Zeit: '+euro(c.delta) : 'Wirtschaftlichkeitsvergleich offen'];
}
export function priorityCard(entry, input, day) {
  const p=priority(entry,input,day), c=p.comparison;
  const proposed=priority(entry,{},day);
  const field=(key,label)=>`<label class="field">${label}<input inputmode="decimal" maxlength="12" data-rating="${key}" value="${esc(input[key] || '')}" placeholder="Offen"></label>`;
  const rating=(key,label)=>`<label class="field">${label}<select aria-label="${esc(label)}" data-rating="${key}"><option value="">Vorschlag: ${proposed[key]}/5</option>${[1,2,3,4,5].map(n=>`<option value="${n}"${input[key]===n?' selected':''}>${n}/5</option>`).join('')}</select></label>`;
  return `<div class="priority-summary"><strong>Priorität ${p.group} · ${esc(p.label)}</strong><p>Aufwand ${p.effort}/5 · Wichtigkeit ${p.importance}/5</p><p>${esc(p.deadline)}</p><p><strong>Rahmen laut Quelle:</strong> ${esc(p.frame)}</p></div>
    <details class="detail priority-detail"><summary>Rating und Kostenvergleich</summary><div class="meeting-details">
    <p class="priority-basis">${esc(p.basis)}. Kein Nachweis eines bestätigten Bedarfs, keine Bewilligungsprognose.</p><p>${esc(p.reason)}</p><p>${esc(p.caution)}</p>
    ${sourceUrl(p.frameSource?.url) ? `<p><a href="${esc(sourceUrl(p.frameSource.url))}" target="_blank" rel="noopener noreferrer">Originalquelle zum Förderrahmen</a> · Rahmenrecherche ${date(p.researchDay)} · Aktenprüfung ${esc(p.source?.checked || 'offen')}${p.fresh?'':', Aktualität prüfen'}</p>`:''}
    ${p.usedHint?`<p>${esc(p.usedHint)} <a href="${usedSource}" target="_blank" rel="noopener noreferrer">Kreisrichtlinie, Abschnitt 9</a></p>`:''}
    <div class="priority-fields">${rating('effort','Aufwand: 1 gering, 5 sehr hoch',p.effort)}${rating('importance','Wichtigkeit: 1 optional, 5 unverzichtbar',p.importance)}</div>
    <p>Vergleiche denselben Bedarf, dieselbe Nutzungsdauer und sichere, geeignete Ausführung. Bei Gebrauchtkauf auch Lieferung, Reparaturen, Wartung und Restnutzungsdauer berücksichtigen. Planer, Vergabe, Zweckbindung, Vorfinanzierung und Verwendungsnachweis je Richtlinie klären.</p>
    <p>Hier nur Zusatzkosten und zusätzliche Stunden eintragen, die noch nicht in den Projektkosten stecken. 0 ausdrücklich eintragen, wenn geprüft nichts anfällt. Leer bedeutet unbekannt. Deine Werte sind Planungsschätzungen.</p>
    <p>Optional ein eigenes Szenario rechnen: Dann beide folgenden Beträge eintragen. Leer nutzt die Aktenberechnung. Der Zuschuss ist eine Annahme, kein bewilligter Betrag.</p>
    <div class="priority-fields">${field('projectCost','Szenario: Projektkosten insgesamt (€)')}${field('grant','Szenario: angenommener Zuschuss (€)')}</div>
    <div class="priority-fields">${field('extra','Zusätzliche Auflagen-/Planungskosten (€)')}${field('hours','Zusätzlicher Zeitaufwand (Stunden)')}${field('hourValue','Wert einer Ehrenamtsstunde (€/h)')}${field('alternative','Direkte Alternative ohne Förderung, Gesamtkosten (€)')}</div>
    <label class="meeting-choice"><input type="checkbox" data-rating="comparable"${input.comparable?' checked':''}> Umfang, Nutzungsdauer und Eignung sind vergleichbar</label>
    <label class="field">Annahmen und offene Auflagen<textarea data-rating="note" maxlength="500" rows="3">${esc(input.note || '')}</textarea></label>
    <div class="priority-result" role="status"><p>${c.scenario?'Dein Planungsszenario':'Aktenberechnung'}: Zuschuss ${euro(c.funding)} · Eigenanteil ${euro(c.own)}</p>
    ${c.invalid?'<p>Mindestens eine Zahl ist ungültig. Nur positive Beträge ohne Tausendertrennzeichen und maximal zwei Nachkommastellen verwenden.</p>':''}${c.inconsistent?'<p>Der angenommene Zuschuss darf nicht höher als die Projektkosten sein.</p>':''}
    <p>Vereinsausgaben einschließlich Zusatzkosten: ${euro(c.cash)}<br>Zusätzliche Zeit, bewertet: ${euro(c.time)}<br>Gesamtbelastung mit Förderung: ${euro(c.economic)}</p>
    <p>Verbleibender Zuschussvorteil nach Zusatzkosten und Zeit: ${euro(c.netGrant)}</p>
    <p><strong>${c.delta==null?'Vergleich noch offen. Kosten vervollständigen und Vergleichbarkeit bestätigen.':c.delta<0?'Direkte Alternative rechnerisch '+euro(-c.delta)+' günstiger.':c.delta===0?'Rechnerisch gleich teuer. Aufwand und Bindungen entscheiden.':'Förderweg rechnerisch '+euro(c.delta)+' günstiger.'}</strong></p>
    <p>Rechenhilfe, keine Bewilligung. Stundenwert ist keine Auszahlung; Vorfinanzierung und tatsächliche Liquidität zusätzlich prüfen.</p></div>
    </div></details>`;
}
