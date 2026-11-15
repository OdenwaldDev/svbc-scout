import { blankCase, caseDecisionText, categories, euro, evaluate, instruments, isOriginal, makeLetter, offerRequestStatuses, requiredChecks,
  results, routeStatuses, sourceRegister, sourceUrl, states } from "./domain.mjs";
import { embeddedApi, outlookOutcome } from "./sportzentrale.mjs";

const root = document.querySelector("#app"), notice = document.querySelector("#notice");
const steps = ["Projekt", "Angebot und Quellen", "Förderprüfung", "Entscheidung", "Anschreiben"];
const stepAddresses = ["projekt", "angebote", "pruefung", "entscheidung", "anschreiben"];
const factLabels = { legal:"Rechtsträger", representation:"Vertretung und Absenderrolle", nonprofit:"Gemeinnützigkeit", youth:"Jugend- und Mitgliederzahlen (aggregiert)" };
const factStatuses = { unverified:"Unbestätigt", verified:"Bestätigt", conflicting:"Widersprüchlich", expired:"Abgelaufen" };
let state, item, detail, page = "cases", step = 0, dirty = false, busy = false, noticeTimer;
let queue = null;

function escape(value) {
  return String(value ?? "").replace(/[&<>"']/g, char => ({ "&":"&amp;", "<":"&lt;", ">":"&gt;", '"':"&quot;", "'":"&#39;" })[char]);
}
const x = escape;
const choices = (options, value) => Object.entries(options).map(([v, label]) => `<option value="${x(v)}"${v === value ? " selected" : ""}>${x(label)}</option>`).join("");
const button = (label, action, cls = "", extra = "") => `<button type="button" class="${cls}" data-action="${action}" ${extra}>${x(label)}</button>`;
const tag = (status, label) => `<span class="tag ${x(status)}">${x(label)}</span>`;
const sourceChoices = () => Object.fromEntries([["","Bitte auswählen"], ...item.sources.map(s => [s.id, s.title])]);
const money = (path, label, hint) => field(path, label, { mode:"decimal", hint });
const select = (path, label, options, hint) => field(path, label, { options, hint });
const block = (path, label, hint, css = "wide") => field(path, label, { block:true, css, hint });
const field = (path, label, options = {}) => {
  const { type = "text", options: list, hint, css = "", mode, block: area } = options;
  const value = path.split(".").reduce((obj, key) => obj?.[key], item);
  const common = `data-field="${x(path)}" aria-label="${x(label)}"`;
  const input = list ? `<select ${common}>${choices(list,value)}</select>` : area
    ? `<textarea ${common} maxlength="8000" class="${path === "draft.body" ? "letter" : ""}">${x(value)}</textarea>`
    : `<input ${common} type="${type}" ${mode ? `inputmode="${mode}"` : ""} maxlength="300" value="${x(value)}">`;
  return `<label class="field ${css}">${x(label)}${hint ? `<small>${x(hint)}</small>` : ""}${input}</label>`;
};
const link = source => sourceUrl(source?.url) ? `<a href="${x(sourceUrl(source.url))}" target="_blank" rel="noopener noreferrer">${x(source.title)}</a>` : x(source?.title || "");
const card = (title, body, css = "") => `<section class="card ${css}"><h2>${x(title)}</h2>${body}</section>`;
const lead = (title, subtitle, action = "") => `<div class="lead"><div><h1>${x(title)}</h1><p class="muted">${x(subtitle)}</p></div>${action}</div>`;
const save = label => `<div class="actions">${button(label, "save", "primary")}<small id="saved-status">${dirty ? "Ungespeicherte Änderungen" : item.version ? "Gespeichert · Version " + item.version : ""}</small></div>`;
const showNotice = (message, error = false) => {
  notice.hidden = false; notice.textContent = message; notice.classList.toggle("error", error);
  clearTimeout(noticeTimer); noticeTimer = setTimeout(() => { notice.hidden = true; }, 8000);
};
async function api(path, method = "GET", data) {
  if (embeddedApi) return embeddedApi(path, method, data);
  const response = await fetch("/api/" + path, { method, headers: data ? { "Content-Type":"application/json" } : {},
    body: data ? JSON.stringify(data) : undefined });
  const result = await response.json();
  if (!response.ok) throw new Error(result.error || "Die Anfrage konnte nicht abgeschlossen werden.");
  return result;
}
function downloadLink(action, label) {
  return embeddedApi ? button(label, "download-" + action)
    : `<a class="button" href="/api/cases/${item.id}/${action}">${x(label)}</a>`;
}
async function refresh() { state = await api("state"); queue = null; }
async function refreshDetail() { detail = item.id ? await api("cases/" + item.id) : null; }
async function openCase(id, selectedStep = 0) {
  detail = await api("cases/" + id);
  item = detail.item;
  item.fundingRoutes ??= [];
  item.offerRequests ??= [];
  dirty = false;
  step = selectedStep;
  page = "case";
}
async function openCaseAddress() {
  if (location.hash === "#arbeitskorb") {
    if (dirty && !window.confirm("Ungespeicherte Eingaben verwerfen?")) return;
    dirty = false;
    page = "queue";
    return;
  }
  const address = /^#vorgang\/([a-f0-9-]{36})\/([a-z]+)$/.exec(location.hash);
  if (!address || !state.cases.some(row => row.id === address[1])) return;
  if (dirty && !window.confirm("Ungespeicherte Eingaben verwerfen?")) return;
  await openCase(address[1], Math.max(0, stepAddresses.indexOf(address[2])));
}
function fileDownload(content, type, filename) {
  const url = URL.createObjectURL(new Blob([content], {type}));
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = filename;
  anchor.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}
function top() {
  const tab = (id, title) => button(title, "page-" + id, "", (page === id || page === "case" && id === "cases") ? 'aria-current="page"' : "");
  return `<header class="top"><div class="top-inner"><button type="button" class="brand" data-action="page-cases"><span class="brand-mark">${x(state.club.short)}</span><span><strong>Förderzentrale</strong><small>${x(state.club.name)}</small></span></button>
  <nav aria-label="Hauptnavigation">${tab("cases","Vorgänge")}${tab("queue","Arbeitskorb")}${tab("sources","Förderradar")}${tab("facts","Vereinsdossier")}${tab("settings","Outlook")}</nav></div></header>`;
}
function caseList() {
  const rows = state.cases.map(row => {
    const status = row.status;
    return `<button class="project" data-action="open" data-id="${x(row.id)}"><span><strong>${x(row.title)}</strong><small>${x(categories[row.type])}${row.place ? " · " + x(row.place) : ""}</small></span>${status ? tag(status,states[status]) : ""}</button>`;
  }).join("");
  return lead("Fördervorgänge", "Vom konkreten Vereinsbedarf zur geprüften Voranfrage.", button("Projekt anlegen","new","primary")) +
    `<div class="layout">${card("Projekte", rows || '<div class="empty"><h3>Welchen Bedarf wollt ihr zuerst angehen?</h3><p class="muted">Lege ein Projekt an. Angebote und Förderquellen kannst du anschließend hinzufügen.</p></div>')}
    <aside class="stack">${card("Bewerbungsassistent",`<p class="muted">Prüfe nächste Schritte, Förderbedingungen und vorbereitete Anschreiben je Vorgang.</p><div class="actions">${button("Zum Arbeitskorb","page-queue","primary")}</div>`, "accent")}
    ${card("Originalquellen",`<div class="source-list">${sourceRegister.map(s => link(s)).join("")}</div><div class="actions">${button("Förderradar öffnen","page-sources")}</div>`)}</aside></div>`;
}
const queueGroups = {
  ready: "Zur Freigabe", approved: "Freigegebene Entwürfe", followUp: "Konkrete Vorgänge",
  suggested: "Bedarf bestätigen", planned: "Angekündigte Antragsphase", watch: "Weitere Runde beobachten",
  unavailable: "Arbeitsstand erneut laden"
};
function queueGroup(entry) {
  const { item: project, approval, problems } = entry;
  if (!project) return "unavailable";
  if (approval) return "approved";
  if (!problems.length) return "ready";
  if (project.intake !== "suggested") return "followUp";
  if (project.program.status === "closed" || (project.program.until && project.program.until < state.day)) return "watch";
  if (!project.program.status && project.program.until >= state.day &&
      project.sources.some(source => source.id === project.program.source && isOriginal(source,state.day))) return "planned";
  return "suggested";
}
const queueOrder = project => ["open","rolling"].includes(project?.program.status) ? 0 : project?.draft ? 1 : 2;
async function loadQueue() {
  if (queue !== null) return;
  const entries = [], currentCases = state.cases, loading = queue = [];
  for (let start = 0; start < currentCases.length; start += 5) {
    const rows = currentCases.slice(start, start + 5);
    const batch = await Promise.allSettled(rows.map(row => api("cases/" + row.id)));
    if (queue !== loading) return;
    entries.push(...batch.map((result, i) => ({ row:rows[i], ...result.value })));
  }
  queue = entries;
  if (page === "queue") render();
}
function workQueue() {
  const rows = queue ? Object.entries(queueGroups).map(([group, label]) => {
    const entries = queue.filter(entry => queueGroup(entry) === group)
      .sort((a,b) => queueOrder(a.item) - queueOrder(b.item));
    if (!entries.length) return "";
    return card(label, entries.map(({ row, item:project }) => {
      const path = "#vorgang/" + row.id + "/";
      return `<article class="queue-row"><div><h3>${x(row.title)}</h3>
        ${project?.program.title ? `<p class="muted">${x(project.program.provider)} · ${x(project.program.title)}</p>` : ""}
        ${project?.followUp ? `<p>${x(project.followUp)}</p>` : ""}</div>
        <div class="actions"><a href="${x(path + (group === "suggested" ? "projekt" : "entscheidung"))}">${group === "suggested" ? "Bedarf prüfen" : "Entscheidung ansehen"}</a>
        ${project?.draft ? `<a href="${x(path + "anschreiben")}">Anschreiben prüfen</a>` : ""}</div></article>`;
    }).join(""));
  }).join("") : "";
  return lead("Arbeitskorb","Prüfe je Vorgang den nächsten Schritt und die vorbereiteten Unterlagen.", button("Projekt anlegen","new","primary")) +
    `<div class="stack">${rows || card("Bewerbungen", queue?.length === 0 && state.cases.length ? "<p>Vorgänge werden geladen …</p>" : "<p>Lege einen Vereinsbedarf an, um eine Bewerbung vorzubereiten.</p>")}</div>`;
}
function radar() {
  const run=state.radar;
  const statusLabels={baseline:"Erste Fassung erfasst",unchanged:"Unverändert",changed:"Änderung gefunden",error:"Manuell prüfen",blocked:"Manuell prüfen"};
  const datetime=value=>new Date(value).toLocaleString("de-DE",{timeZone:"Europe/Berlin",dateStyle:"medium",timeStyle:"short"});
  const history=run?.events.filter(evt=>evt.event!=="Erste Inhaltsfassung erfasst") || [];
  return lead("Förderradar","Originalseiten als Ausgangspunkt für die Prüfung eines konkreten Projekts.",run ? button(run.busy ? "Quellenprüfung läuft" : "Quellen jetzt prüfen","radar-run","primary",run.busy ? "disabled" : "") : "") +
    (run ? card("Letzte sieben Tage",`<p class="muted">${run.scheduled ? "Tägliche Prüfung aktiv, solange der lokale Server läuft." : "Manuelle Prüfung aktiv."}</p>
      ${history.length ? `<ul class="list">${history.slice(0,5).map(evt=>`<li><strong>${x(sourceRegister.find(s=>s.url===evt.url)?.title)}</strong><br>${x(evt.event)} <small>${x(datetime(evt.time))}</small></li>`).join("")}</ul>` : "<p>Keine neuen Änderungen oder Probleme aus den gespeicherten Abrufen.</p>"}`) : "") +
    (run?.dates?.length ? card("Fristen in den nächsten 30 Tagen",`<ul class="list">${run.dates.map(d=>`<li>
      <strong>${x(d.date.split("-").reverse().join("."))}</strong> ${x(d.reason)} ${button(d.title,"open","",`data-id="${x(d.caseId)}"`)}
      </li>`).join("")}</ul>`) : "") +
    `<div class="stack form-row">${sourceRegister.map(s=>{
      const info=run?.sources.find(row=>row.url===s.url);
      return card(s.title,`<p>${x(s.excerpt)}</p><p class="muted">Redaktionell geprüft am ${x(s.checked.split("-").reverse().join("."))}</p>
        ${info ? `<p>${tag(["error","changed","blocked"].includes(info.status)?"unknown":"pass",statusLabels[info.status])} <small>Abruf ${x(datetime(info.checked))}</small></p>
        ${info.note ? `<p class="muted">${x(info.note)}</p>`:""} ${info.lastChange ? `<small>Letzte erkannte Änderung ${x(datetime(info.lastChange))}</small>`:""}` : ""}
        <div class="actions">${link(s)}</div>`);
    }).join("")}</div>`;
}
function factsPage() {
  return lead("Vereinsdossier","Belege und Verantwortliche für Angaben, die in einer Voranfrage verwendet werden.") +
    `<div class="stack">${Object.entries(factLabels).map(([key, label]) => {
      const f = state.facts[key] || {};
      return card(label,`<div class="grid" data-fact="${key}">
      <label class="field">Status<select name="status">${choices(factStatuses,f.status)}</select></label>
      <label class="field">Verantwortlich<input name="owner" value="${x(f.owner)}"></label>
      <label class="field wide">Bestätigte Angabe<input name="value" value="${x(f.value)}" placeholder="${key === 'representation' ? 'Name und genaue Vereinsfunktion' : ''}"></label>
      <label class="field wide">Nachweis oder Ablageverweis<input name="reference" value="${x(f.reference)}"></label>
      <label class="field">Geprüft am<input name="checked" type="date" value="${x(f.checked)}"></label>
      <label class="field">Gültig bis (wenn befristet)<input name="expires" type="date" value="${x(f.expires)}"></label>
      </div>`);
    }).join("")}</div><div class="actions">${button("Dossier speichern","save-facts","primary")}</div>
    ${state.importAllowed ? card("Förderakten übernehmen",`<p>Übernimm eine Exportdatei aus der lokalen Förderzentrale in den Vereinsbestand. Vorhandene Fälle bleiben erhalten.</p>
      <label class="field">Förderakten-Datei<input type="file" id="case-import-file" accept=".json,application/json"></label>
      <div class="actions">${button("Förderakten importieren","import-cases","primary")}</div>`) : ""}`;
}
function settings() {
  const o = state.outlook;
  return lead("Outlook und Entwürfe","Postfachverbindung für freigegebene Voranfragen.") +
    card("Verbindungsstatus", `${tag(o.address ? "pass" : "unknown",o.address ? "Verbunden" : o.configured ? "Bereit zur Anmeldung" : "Testbetrieb · EML")}
    <p class="record">${o.address ? x(o.address) : "Freigegebene Anschreiben lassen sich mit PDF-Anlage als EML-Datei herunterladen."}</p>
    <p class="muted">Microsoft verlangt für die Entwurfsanlage Mail.ReadWrite. Dieses Recht ist breiter als der Entwurfsordner. Verwende das vorgesehene Vereinspostfach.</p>
    <div class="actions">${o.address ? button("Verbindung trennen","disconnect") : o.configured ? button("Vereinspostfach verbinden","connect","primary") : ""}</div>`) +
    card("Schreibunterstützung",`<p>${state.ai ? "Lokales Modell konfiguriert. Formulierungsvorschläge müssen geprüft und gespeichert werden." : "Die Entwurfsvorlage funktioniert lokal. Optional kann ein vorhandenes Ollama-Modell zum Überarbeiten eingerichtet werden."}</p>`);
}
function projectPage() {
  return card("Bedarf und Umsetzung",`<div class="grid">
    ${item.intake ? select("intake","Bedarf im Verein", {suggested:"Recherchevorschlag · intern zu bestätigen",confirmed:"Konkreter Bedarf bestätigt"}) : ""}
    ${field("title","Projekttitel", {css:"wide"})}${select("type","Projektkategorie",categories)}
    ${field("place","Projektort")}${block("need","Was braucht der Verein konkret?")}
    ${field("audience","Zielgruppe",{hint:"Beschreibe die Gruppen ohne personenbezogene Daten."})}
    ${field("owner","Intern verantwortlich")}${block("measure","Geplante Umsetzung")}${block("outcome","Angestrebtes Ergebnis")}
    ${field("start","Voraussichtlicher Beginn",{type:"date"})}${select("begun","Bereits bestellt oder begonnen?",{"":"Offen",no:"Nein",yes:"Ja"})}
    ${select("vat","Vorsteuerabzug für dieses Projekt",{"":"Offen",no:"Nein",yes:"Ja, vollständig"})}
    ${money("funds","Bestätigte Eigenmittel in €","Leer lassen, wenn die Mittel noch offen sind.")}
    ${block("otherFunding","Weitere beantragte oder bewilligte Mittel","Betrag, betroffene Positionen und Fördergeber nennen. Die Berechnung addiert diese Beträge nicht automatisch.")}
    </div>${save(item.id ? "Projekt speichern" : "Projekt anlegen")}`);
}
function sourceForm(s, i) {
  const p = "sources." + i + ".";
  return `<div class="form-row"><div class="row-main"><h3>${x(s.title || "Neue Quelle")}</h3>${button("Entfernen","remove-source","",`data-i="${i}"`)}</div><div class="grid">
   ${field(p+"title","Quellentitel")}${select(p+"kind","Quellenart",{primary:"Originalquelle",quote:"Angebot",tip:"Recherchehinweis"})}
   ${field(p+"url","Originaladresse (HTTPS)",{type:"url",css:"wide"})}
   ${field(p+"section","Fundstelle, Version oder Dateiname")}${field(p+"checked","Geprüft am",{type:"date"})}
   ${s.kind==="quote" ? field(p+"validUntil","Angebot gültig bis",{type:"date"}) : ""}
   ${block(p+"excerpt","Belegtext oder eigener Auszug")}</div>${s.url ? link(s) : ""}</div>`;
}
function costsForm(row, i) {
  const p = "costs." + i + ".";
  return `<div class="form-row"><div class="row-main"><h3>${x(row.name || "Neue Position")}</h3>${button("Entfernen","remove-cost","",`data-i="${i}"`)}</div>
  <div class="grid three">
  ${field(p+"name","Position")}${select(p+"kind","Kostenart",categories)}${field(p+"qty","Stück / Einheiten",{mode:"numeric"})}
  ${money(p+"net","Einzelpreis netto")}${money(p+"gross","Einzelpreis brutto")}${field(p+"term","Laufzeit oder Leistungsumfang")}
  ${select(p+"offer","Angebotsbeleg",sourceChoices())}</div></div>`;
}
function offerRequests() {
  return card("Angebotsanfragen", item.offerRequests.map((request,i) => {
    const path = "offerRequests." + i + ".";
    const source = item.sources.find(s => s.id === request.source && isOriginal(s,state.day));
    return `<div class="criterion"><div class="row-main"><strong>${x(request.supplier || "Neue Anfrage")}</strong>
      ${tag(request.status === "received" ? "pass" : "candidate", offerRequestStatuses[request.status])}</div>
      <p>${x([request.date && request.date.split("-").reverse().join("."),request.note].filter(Boolean).join(" · "))}</p>
      ${source ? link(source) : ""}
      <details class="detail"><summary>Anfrage bearbeiten</summary><div class="grid">
      ${field(path+"supplier","Lieferant")}${select(path+"status","Stand der Anfrage",offerRequestStatuses)}
      ${field(path+"date","Datum der Anfrage",{type:"date"})}
      ${select(path+"source","Lieferantenseite",primarySourceChoices())}
      ${block(path+"note","Angefragter Umfang und nächster Schritt")}
      </div><div class="actions">${button("Anfrage entfernen","remove-request","",`data-i="${i}"`)}</div></details></div>`;
  }).join("") + `<div class="actions">${button("Anfrage hinzufügen","add-request")}</div>`, "offer-requests");
}
const primarySourceChoices = () => Object.fromEntries([["","Bitte auswählen"],...item.sources.filter(source=>source.kind==="primary").map(source=>[source.id,source.title])]);
function sourcesPage() {
  const sources = item.sources.map(sourceForm).join("");
  const costs = item.costs.map(costsForm).join("");
  return `<div class="stack">${card("Quellen und Angebote",`<p class="muted">Erfasse Link, Fundstelle und tragenden Beleg. Ein Angebotsdokument kannst du als PDF oder Text ablegen.</p>
  <div class="actions">${button("Quelle hinzufügen","add-source")}</div>
  <details class="detail"><summary>Geprüfte Originalseiten übernehmen</summary><div class="actions">
  ${sourceRegister.map((s,i)=>button(i === 0 ? "LSB Hessen übernehmen" : s.title,"import-source","",`data-i="${i}"`)).join("")}</div></details>
  <label class="field form-row">Angebotsdatei (PDF oder Text, bis 200 kB)<input type="file" id="offer-file" accept=".pdf,.txt,application/pdf,text/plain"></label>${sources}`)}
  ${item.offerVariants?.length ? card("Angebotsvarianten",item.offerVariants.map((variant,i)=>`<div class="form-row"><h3>${x(variant.title)}</h3>
    <p>${euro(variant.net)} netto · ${euro(variant.gross)} brutto</p>
    ${button("Kosten dieser Variante übernehmen","offer-variant","",`data-i="${i}"`)}</div>`).join("")) : ""}
  ${offerRequests()}
  ${card("Kostenpositionen",`<p class="muted">Trage tatsächliche Einzelpreise nach Rabatt ein. Geräte und Abos gehören in getrennte Positionen.</p>${costs}<div class="actions">${button("Position hinzufügen","add-cost")}</div>${save("Angebote und Quellen speichern")}`)}</div>`;
}
function rulesPage() {
  return `<div class="stack">${card("Programm und Runde",`<div class="grid">
  ${field("program.title","Programm oder Partnerangebot")}${field("program.provider","Fördergeber / Partner")}
  ${select("program.instrument","Instrument",instruments)}${select("program.source","Originalquelle zum Programm",sourceChoices())}
  ${item.program.instrument === "partner" ? field("program.route","Veröffentlichter Kontaktweg") : `
  ${field("program.round","Ausschreibungsrunde oder Stand")}${select("program.status","Antragsstand",{"":"Offen",open:"Offen mit Datum",rolling:"Laufend laut Richtlinie",closed:"Geschlossen / nächste Runde offenlassen"})}
  ${field("program.until","Frist (Datum in Deutschland)",{type:"date"})}${field("program.route","Einreichungsweg laut Quelle")}
  ${select("applicationSource","Link zum Portal oder Formular",primarySourceChoices())}
  ${select("program.startRule","Regel zum Vorhabenbeginn",{"":"Offen",before:"Antrag muss vor Bestellung oder Beginn gestellt werden",allowed:"Beginn laut Regel oder schriftlicher Ausnahme zulässig"})}
  ${select("program.begin","Beleg zum Vorhabenbeginn",sourceChoices())}`}</div>`)}
  ${item.program.instrument === "grant" ? card("Förderrechenregeln",`<div class="grid three">
  ${select("program.financial","Beleg für die Rechenregeln",sourceChoices())}${select("program.basis","Bemessungsgrundlage",{"":"Offen",net:"Netto",gross:"Brutto bei fehlendem Vorsteuerabzug"})}
  ${money("program.rate","Förderquote in %")}${money("program.cap","Obergrenze in €")}${money("program.min","Mindestbemessung gesamt in €")}
  ${money("program.unitMin","Mindestpreis je Einheit in €","0 nur eintragen, wenn keine Einzelpreisgrenze gilt.")}</div>`) : ""}
  ${card("Kriterien belegen",Object.entries(requiredChecks(item)).map(([key,label]) => `<div class="form-row"><h3>${x(label)}</h3><div class="grid">
  ${select("checks."+key+".status","Ergebnis",{"":"Offen",...results})}${select("checks."+key+".source","Originalbeleg",sourceChoices())}
  ${block("checks."+key+".note","Begründung zum konkreten Fall")}</div></div>`).join(""))}
  ${item.costs.length ? card("Positionen prüfen",item.costs.map((row,i)=>`<div class="form-row"><h3>${x(row.name)}</h3><div class="grid">
  ${select("costs."+i+".status","Förderfähigkeit der Position",{"":"Offen",...results})}${select("costs."+i+".source","Originalbeleg",sourceChoices())}
  ${item.program.instrument === "grant" ? money("costs."+i+".rate","Abweichende Positionsquote in %","Nur bei belegter Sonderquote eintragen.") : ""}
  ${block("costs."+i+".note","Begründung und Laufzeitgrenze")}</div></div>`).join("")) : ""}
  ${save("Förderprüfung speichern")}</div>`;
}
function figures(report) {
  return `<div class="metricgrid">${[["Kosten",report.total],["Förderfähige Kosten",report.eligible],["Förderpotenzial",report.funding],["Rechnerischer Eigenanteil",report.own],["Bestätigte Eigenmittel",report.available],["Finanzierungslücke",report.gap]].map(([label,value])=>`<div class="metric"><small>${label}</small><strong>${euro(value)}</strong></div>`).join("")}</div>`;
}
function fundingRoutes() {
  const routes = item.fundingRoutes || [];
  const original = id => item.sources.find(source => source.id === id && isOriginal(source, state.day));
  const assessments = routes.map(route => {
    const source = original(route.source);
    const portal = original(route.portal);
    return `<div class="criterion">
      <div class="row-main"><strong>${x(route.title)}</strong>${tag(route.status === "excluded" ? "fail" : "unknown", source ? routeStatuses[route.status] : "Beleg fehlt")}</div>
      <p>${x(route.finding)}</p><p><strong>Nächster Schritt</strong> ${x(route.next)}</p>
      ${route.question ? `<details class="detail"><summary>Frage für die Voranfrage</summary><p>${x(route.question)}</p></details>` : ""}
      <div class="actions">${source ? link(source) : ""}${portal ? link(portal) : ""}</div>
    </div>`;
  }).join("");
  return card("Förderwege im Vergleich", assessments + `<details class="detail"><summary>Arbeitsstand bearbeiten</summary>
    <div class="grid">
    ${block("followUp","Nächster Schritt im Verein")}
    ${routes.map((_,i) => {
      const prefix = "fundingRoutes." + i + ".";
      return `<div class="form-row wide"><div class="grid">
      ${field(prefix+"title","Förderweg")}${select(prefix+"status","Einschätzung",routeStatuses)}
      ${select(prefix+"source","Originalregel",sourceChoices())}${select(prefix+"portal","Portal oder Kontakt (optional)",sourceChoices())}
      ${block(prefix+"finding","Was ergibt sich aus dem Beleg?")}${block(prefix+"next","Nächster Schritt für diesen Förderweg")}
      ${block(prefix+"question","Frage für die Voranfrage (optional)")}
      </div><div class="actions">${button("Förderweg entfernen","remove-route","",`data-i="${i}"`)}</div></div>`;
    }).join("")}</div>
    <div class="actions">${button("Förderweg ergänzen","add-route")}</div>
    ${save("Arbeitsstand speichern")}</details>`);
}
function decision() {
  const report = evaluate(item,state.facts,state.day);
  const open = report.checks.filter(c => c.status !== "pass");
  return `<div class="stack">${card("Entscheidungsvorlage",`<p>${item.program.title ? `<strong>${x(item.program.title)}</strong> ` : ""}${tag(report.status,states[report.status])}</p><p class="muted">${x(item.program.instrument === "grant" ? "Förderpotenzial ist ein Rechenwert. Bewilligte und erhaltene Mittel werden hier nicht erfasst." : "Für dieses Instrument wird kein Zuschuss als gesicherte Finanzierung angesetzt.")}</p>
  <div class="record"><strong>Nächster Schritt</strong><p>${x(item.followUp || (open.length ? open[0].name + ": " + open[0].reason : "Unterlagen und Zuständigkeit für die nächste Aktion prüfen."))}</p></div>
  ${item.offerVariants?.length ? `<p><strong>Vorliegende Angebote</strong></p><ul class="list">${item.offerVariants.map(offer=>`<li>${x(offer.title)} · ${euro(offer.gross)} brutto</li>`).join("")}</ul><p class="muted">Die Kosten für die Förderrechnung hängen von der gewählten Variante und der Vorsteuer ab.</p>` : ""}
  ${report.total == null && item.offerVariants?.length ? `<details class="detail"><summary>Förderrechnung und Eigenmittel</summary>${figures(report)}</details>` : figures(report)}
  ${item.otherFunding ? `<p class="record"><strong>Weitere Mittel im Vorgang</strong><br>${x(item.otherFunding)}</p>` : ""}
  ${item.id && !dirty ? `<div class="actions">${button("Interne Entscheidung herunterladen","download-decision")}</div>` : ""}`,"accent")}
  ${fundingRoutes()}
  ${card("Prüfprotokoll",report.checks.map(c=>`<div class="criterion"><div class="row-main"><strong>${x(c.name)}</strong>${tag(c.status,results[c.status])}</div><p>${x(c.reason)}</p>${c.source ? `<small>${link(c.source)} · ${x(c.source.section)} · ${x(c.source.checked)}</small>` : ""}</div>`).join(""))}
  ${report.rows.length ? card("Rechenweg je Position",report.rows.map(r=>`<div class="criterion"><strong>${x(r.name)}</strong><p>${x(r.qty)} × ${euro(r.total == null ? null : r.total/Number(r.qty))} · Förderfähig ${euro(r.eligible)}${r.eligible > 0 && r.appliedRate != null && item.program.instrument === "grant" ? " · " + (r.appliedRate / 100).toLocaleString("de-DE") + " %" : ""}</p><small>${x(r.reason)} ${r.evidence ? link(r.evidence) : ""}</small></div>`).join("")) : ""}
  ${item.id && !dirty ? `<div class="actions">${downloadLink("pdf","Projektskizze als PDF")}${button("Zum Anschreiben","step","primary",'data-i="4"')}</div>` : ""}</div>`;
}
function letterPage() {
  const approval = dirty ? null : detail?.approval;
  const problems = detail?.problems || [];
  const o = state.outlook;
  const application = item.sources.find(source => source.id === item.applicationSource && isOriginal(source, state.day));
  return `<div class="stack">${application ? card("Antrag vorbereiten", `<p>${x(item.program.route)}</p>
    <p class="muted">Die Entscheidung enthält die offenen Prüfpunkte. Die Projektskizze steht unten als PDF zur Verfügung.</p>
    <div class="actions">${link(application)}${dirty ? "" : button("Interne Entscheidung herunterladen","download-decision")}</div>`) : ""}
  ${card("Empfänger und Anlass",`<div class="grid">
  ${field("contact.name","Empfänger / zuständige Stelle")}${field("contact.email","E-Mail-Adresse",{type:"email"})}
  ${field("contact.salutation","Persönliche Anrede")}${select("contact.source","Originalquelle der Adresse",sourceChoices())}
  ${field("contact.sender","Absendername im Verein")}${field("contact.role","Vereinsfunktion")}
  ${block("contact.relevance","Warum passt das Vorhaben zu diesem Empfänger?","Nutze einen konkreten Bezug, den du belegen kannst.")}
  ${block("contact.request","Konkrete Bitte (optional)")}
  ${item.program.instrument === "partner" ? block("contact.offer","Welche Gegenleistung ist möglich?") : ""}
  </div><div class="actions">${button(item.draft ? "Anschreiben neu formulieren" : "Anschreiben erstellen","generate")}</div>`)}
  ${item.draft ? card("Voranfrage",`<div class="grid">${field("draft.subject","Betreff",{css:"wide"})}${block("draft.body","Anschreiben")}</div>
  ${save("Anschreiben und Empfänger speichern")}
  ${state.ai ? `<div class="actions">${button("Lokalen Formulierungsvorschlag laden","ai")}</div>` : ""}`) : save("Empfänger speichern")}
  ${item.id ? card("Freigabe und Outlook-Entwurf",`<p class="muted">Die Freigabe gilt für diese Fassung von Empfänger, Anschreiben und Projekt-PDF.</p>
  ${dirty ? '<p class="record">Änderungen zuerst speichern und die gespeicherte Fassung prüfen.</p>' : problems.length ? `<ul class="list">${problems.map(p=>`<li>${x(p)}</li>`).join("")}</ul>` : ""}
  <div class="actions">${dirty ? "" : downloadLink("pdf","Anlage ansehen")}</div>
  ${!dirty && !approval && item.draft && !problems.length ? `<label class="checkline"><input type="checkbox" id="confirm"> Empfänger, Text und Anlage sind geprüft. Ich gebe diese Voranfrage als Entwurf frei.</label>
    <div class="actions">${button(o.address ? "GO · Outlook-Entwurf anlegen" : "GO · EML herunterladen","approve","primary")}</div><p class="muted">GO gibt diese Fassung frei und erstellt einen Entwurf.</p>` : ""}
  ${approval ? `<p class="record">${approval.status === "created" ? "Outlook hat die Entwurfsanlage bestätigt." : ["pending","uncertain"].includes(approval.status) ? "Outlook-Versuch protokolliert. Bitte das Entwurfsfach prüfen." : "Diese Fassung wurde freigegeben."}</p>
    ${detail?.outlookUnresolved && approval.status === "approved" ? '<p class="record">Ein früherer Outlook-Versuch ist offen. Bitte zuerst das Entwurfsfach prüfen.</p>' : ""}
    <div class="actions">${downloadLink("eml","EML-Datei exportieren")}${o.address && approval.status === "approved" && !detail?.outlookUnresolved ? button("In Outlook-Entwürfe ablegen","outlook","primary") : ""}</div>` : ""}`,"accent") : ""}
  </div>`;
}
function casePage() {
  const report = evaluate(item,state.facts,state.day);
  const next = report.checks.find(row => row.status !== "pass");
  const pages = [projectPage,sourcesPage,rulesPage,decision,letterPage];
  return lead(item.title || "Neues Projekt", item.id ? "Fördervorgang · " + categories[item.type] : "Beginne mit einem tatsächlichen Vereinsbedarf.", button("Alle Vorgänge","page-cases")) +
    `<nav class="steps" aria-label="Arbeitsschritte">${steps.map((name,i)=>button(name,"step","",`data-i="${i}" ${i===step ? 'aria-current="step"' : ""}`)).join("")}</nav>
    <div class="layout"><div class="stack">${pages[step]()}</div><aside class="stack sticky">
    ${step === 3 ? "" : card("Fallstand",`<p>${tag(report.status,states[report.status])}</p>${item.followUp || next ? `<p class="muted">${x(item.followUp || next.reason)}</p>` : ""}`, "accent")}
    ${item.sources.length ? card("Belege",`<div class="source-list">${item.sources.map(s=>`<div>${link(s)}${s.file ? button("Datei öffnen","offer-download","",`data-id="${x(s.id)}"`) : ""}<small>${x(s.section)}</small></div>`).join("")}</div>`) : ""}
    ${detail?.events?.length ? card("Verlauf",`<details class="detail"><summary>Letzte Aktionen</summary><ul class="list">${detail.events.map(e=>`<li>${x(e.event)} <small>${x(new Date(e.time).toLocaleString("de-DE"))}</small></li>`).join("")}</ul></details>`) : ""}
    </aside></div>`;
}
function render() {
  const hash = page === "queue" ? "#arbeitskorb" : page === "case" && item.id ? "#vorgang/" + item.id + "/" + stepAddresses[step] : "";
  const current = location.hash;
  if (hash || current.startsWith("#vorgang/") || current === "#arbeitskorb") history.replaceState(history.state, "", location.pathname + location.search + hash);
  root.innerHTML = top() + '<main class="shell" id="content">' +
    ({ cases:caseList,queue:workQueue,case:casePage,sources:radar,facts:factsPage,settings })[page]() + '</main>';
  if (page === "queue") void loadQueue();
}
function changed() {
  dirty = true;
  const status = document.querySelector("#saved-status"); if (status) status.textContent = "Ungespeicherte Änderungen";
  for (const el of document.querySelectorAll('a[href$="/eml"], a[href$="/pdf"], [data-action^="download-"], [data-action=approve], [data-action=outlook]')) el.hidden = true;
}
async function persist() {
  const wasNew = !item.id;
  item = await api(wasNew ? "cases" : "cases/" + item.id, wasNew ? "POST" : "PUT", item);
  dirty = false;
  await refresh(); await refreshDetail(); render();
  showNotice(wasNew ? "Projekt angelegt." : "Änderungen gespeichert.");
}
function go(next) {
  if ((dirty || page === "facts" && document.querySelector('[data-fact] [data-edited]')) &&
      !window.confirm("Ungespeicherte Eingaben verwerfen?")) return;
  dirty = false; page = next; render();
  window.scrollTo(0,0);
}
function newSource(data = {}) {
  item.sources.push({ id:crypto.randomUUID(),title:"",url:"",kind:"primary",section:"",checked:"",excerpt:"",...data });
  changed(); render();
}
root.addEventListener("input", e => {
  const field = e.target.dataset.field;
  if (!field) { if (page === "facts" && e.target.closest("[data-fact]")) e.target.dataset.edited = "yes"; return; }
  const parts = field.split(".");
  const key = parts.pop();
  const target = parts.reduce((obj, part) => obj[part] ??= {}, item);
  target[key] = e.target.value;
  changed();
  if (field === "program.instrument" || /^costs\.\d+\.kind$/.test(field)) render();
});
root.addEventListener("change", async e => {
  if (e.target.id !== "offer-file" || !e.target.files[0]) return;
  try {
    const file = e.target.files[0];
    if (file.size > 200000 || !/\.(pdf|txt)$/i.test(file.name)) throw new Error("Bitte eine PDF- oder TXT-Datei bis 200 kB auswählen.");
    const bytes = new Uint8Array(await file.arrayBuffer());
    const pdf = /\.pdf$/i.test(file.name);
    if (pdf && new TextDecoder().decode(bytes.slice(0,5)) !== "%PDF-") throw new Error("Die Datei ist kein PDF.");
    let binary = "";
    for (let i=0;i<bytes.length;i+=8192) binary += String.fromCharCode(...bytes.slice(i,i+8192));
    newSource({ kind:"quote", title:file.name, section:file.name, checked:state.day,
      excerpt:pdf ? "" : new TextDecoder().decode(bytes).slice(0,8000),
      file:{ name:file.name,type:pdf ? "application/pdf" : "text/plain", data:btoa(binary) } });
    showNotice("Angebot hinzugefügt. Bitte Fundstelle und Kostenpositionen prüfen.");
  } catch (error) { showNotice(error.message,true); }
});
root.addEventListener("click", async e => {
  const target = e.target.closest("[data-action]");
  if (!target || busy) return;
  const action = target.dataset.action, i = Number(target.dataset.i);
  if (action.startsWith("page-")) { go(action.slice(5)); return; }
  busy = true;
  if (target.tagName === "BUTTON") target.disabled = true;
  try {
    if (action === "new") { item = blankCase(); item.place = state.club.place; detail=null; dirty=false; page="case"; step=0; render(); }
    if (action === "open") { await openCase(target.dataset.id); render(); window.scrollTo(0,0); }
    if (action === "step") { step=i; render(); window.scrollTo(0,0); }
    if (action === "save") await persist();
    if (action === "add-source") newSource();
    if (action === "import-source") {
      const s = sourceRegister[i];
      if (item.sources.some(row=>row.url===s.url)) showNotice("Diese Quelle ist bereits im Vorgang.");
      else newSource({ ...s });
    }
    if (action === "add-cost") {
      item.costs.push({name:"",kind:item.type,qty:"1",net:"",gross:"",term:"",status:"",source:"",note:"",offer:""});
      changed(); render();
    }
    if (action === "remove-source") {
      const [removed] = item.sources.splice(i,1);
      if (removed.id === item.applicationSource) item.applicationSource = "";
      for (const request of item.offerRequests) if (request.source === removed.id) request.source = "";
      changed(); render();
    }
    if (action === "add-request") {
      item.offerRequests.push({supplier:"",status:"planned",date:"",source:"",note:""});
      changed(); render();
      const edit = root.querySelectorAll(".offer-requests .criterion details").item(item.offerRequests.length - 1);
      if (edit) edit.open = true;
    }
    if (action === "remove-request") { item.offerRequests.splice(i,1); changed(); render(); }
    if (action === "remove-cost") { item.costs.splice(i,1); changed(); render(); }
    if (action === "add-route" || action === "remove-route") {
      if (action === "add-route") item.fundingRoutes.push({title:"",status:"clarify",finding:"",next:"",question:"",source:"",portal:""});
      else item.fundingRoutes.splice(i,1);
      changed(); render();
      root.querySelector("#saved-status").closest("details").open = true;
    }
    if (action === "offer-variant") {
      if (item.costs.length && !window.confirm("Die aktuell ausgewählten Kostenpositionen durch diese Angebotsvariante ersetzen?")) return;
      item.costs=structuredClone(item.offerVariants[i].costs);
      changed(); render();
    }
    if (action === "radar-run") {
      state.radar=await api("radar","POST",{});
      render();
      showNotice("Quellenprüfung abgeschlossen.");
    }
    if (action === "download-pdf" || action === "download-eml") await api("cases/"+item.id+"/"+action.slice(9));
    if (action === "download-decision" && !dirty) {
      fileDownload("\uFEFF" + caseDecisionText(item, state.facts, state.day), "text/plain;charset=utf-8", "Foerderentscheidung.txt");
    }
    if (action === "offer-download") {
      const file = item.sources.find(s=>s.id===target.dataset.id)?.file;
      if (file) {
        fileDownload(Uint8Array.from(atob(file.data), c=>c.charCodeAt(0)), file.type, file.name);
      }
    }
    if (action === "generate") {
      if (item.draft && !window.confirm("Vorhandenen Text durch einen neu formulierten Entwurf ersetzen?")) return;
      if (!item.title || !item.need || !item.measure) throw new Error("Erfasse zuerst Projekttitel, Bedarf und geplante Umsetzung.");
      item.draft=makeLetter(item,state.club); changed(); render();
    }
    if (action === "ai") {
      if (dirty) throw new Error("Zuerst die Fassung speichern.");
      const res=await api("cases/"+item.id+"/ai","POST",{});
      if (window.confirm("Formulierungsvorschlag als ungespeicherten Text übernehmen?")) { item.draft.body=res.text; changed(); render(); }
    }
    if (action === "save-facts") {
      const facts = Object.fromEntries([...root.querySelectorAll("[data-fact]")].map(group=>[group.dataset.fact,Object.fromEntries(
        [...group.querySelectorAll("[name]")].map(input=>[input.name,input.value.trim()]))]));
      state.facts = await api("facts","POST",facts); queue = null; render(); showNotice("Vereinsdossier gespeichert.");
    }
    if (action === "import-cases") {
      const file = root.querySelector("#case-import-file")?.files[0];
      if (!file || file.size > 1_900_000) throw new Error("Bitte eine Förderakten-Datei bis 1,9 MB auswählen.");
      if (root.querySelector("[data-fact] [data-edited]")) throw new Error("Bitte das bearbeitete Dossier zuerst speichern.");
      const payload = JSON.parse(await file.text());
      if (payload?.format !== "svbsc-foerderakten-1" || !Array.isArray(payload.cases)) throw new Error("Die Datei ist kein gültiger Förderakten-Export.");
      const result = await api("import","POST",payload);
      await refresh(); render();
      showNotice(`${result.imported} neue Förderakten übernommen. ${result.skipped} waren bereits vorhanden.`);
    }
    if (action === "approve") {
      if (dirty || !document.querySelector("#confirm")?.checked) throw new Error("Bitte die Prüfung der aktuellen Fassung ausdrücklich bestätigen.");
      await api("cases/"+item.id+"/approve","POST",{confirmed:true,version:item.version,review:detail.review});
      queue = null;
      await refreshDetail(); render();
      if (state.outlook.address && !detail.outlookUnresolved && detail.approval?.status === "approved") {
        try { await api("cases/"+item.id+"/outlook","POST",{}); showNotice("Outlook-Entwurf angelegt."); }
        finally { await refreshDetail(); render(); }
      } else if (embeddedApi) {
        await api("cases/"+item.id+"/eml");
        showNotice("Entwurf freigegeben.");
      } else {
        root.querySelector('a[href$="/eml"]')?.click();
        showNotice("Entwurf freigegeben.");
      }
    }
    if (action === "outlook") {
      try { await api("cases/"+item.id+"/outlook","POST",{}); showNotice("Outlook-Entwurf angelegt."); }
      finally { queue = null; await refreshDetail(); render(); }
    }
    if (action === "connect") (embeddedApi ? window.top : window).location.assign((await api("outlook/connect","POST",{})).url);
    if (action === "disconnect") { state.outlook=await api("outlook/disconnect","POST",{}); render(); }
  } catch (error) { showNotice(error.message,true); }
  finally { busy=false; target.disabled=false; }
});
try {
  await refresh();
  const carrier=embeddedApi ? window.parent : window;
  const outcome=outlookOutcome || new URLSearchParams(carrier.location.search).get("outlook");
  if (outcome) { page="settings"; carrier.history.replaceState(carrier.history.state,"",carrier.location.pathname+carrier.location.hash); showNotice(state.outlook.address ? "Vereinspostfach verbunden." : "Outlook-Verbindung konnte nicht bestätigt werden.",!state.outlook.address); }
  else await openCaseAddress();
  render();
  window.addEventListener("hashchange", async () => {
    if (!(location.hash.startsWith("#vorgang/") || location.hash === "#arbeitskorb") || busy) return;
    try { await openCaseAddress(); render(); }
    catch (error) { showNotice(error.message, true); }
  });
} catch (error) {
  root.innerHTML = '<main id="content" class="loading"><h1>Förderzentrale nicht erreichbar</h1><p>' + x(error.message) + '</p></main>';
}
