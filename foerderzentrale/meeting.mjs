import { categories, euro, instruments, isOriginal, sourceUrl } from "./domain.mjs";

const decisions = { prepare: "Vorbereiten", clarify: "Zuerst klären", defer: "Zurückstellen" };
const bundles = [
  {
    title: "Laufende Zuschüsse",
    idea: "Mit der Geschäftsstelle bestehende Meldungen und Anträge abgleichen. Je Förderstelle die fehlenden Nachweise sammeln.",
    ids: ["9d659d50-6476-4679-88f5-5dd92a894044", "ca04fc51-11b5-45cd-9513-8df047be9ab0", "3c325926-5e2f-454e-aa35-0695bd5c2ca5", "b135b448-296b-77ec-3be4-2408999212e2"],
  },
  {
    title: "Trainingsausstattung",
    idea: "Tore, langlebige Geräte und Bälle gemeinsam erfassen. Angebote und Zuschüsse je Kostenart prüfen.",
    ids: ["db35dcb3-6091-50f4-af87-d6c98638f0b3", "a23a96a1-2b47-ba6d-bbbc-8864345f36a8", "d3a9d62b-2aca-2b3e-a7b7-faee8b5f3d02"],
  },
  {
    title: "Schlosshofschule",
    idea: "Mit der Schule ein Gespräch führen. Betreuung und Material mit getrennten Kosten und Finanzierungswegen vorbereiten.",
    ids: ["5e3d2460-adf4-4408-bcea-efe7b71c628c", "90f04534-0adf-9e3a-2f32-d5e3e401aae6"],
  },
  {
    title: "Jugend gewinnen und beteiligen",
    idea: "Mit der Jugendleitung prüfen, welche Lücke ein Schnupperangebot, ein Workshop oder die Begleitung neuer Helfender schließt.",
    ids: ["a1b15e36-c088-f615-4805-e5dfc344f081", "ec361b39-6f55-62b3-e783-ddf9dda834e3", "9ba40e32-40f0-2528-757c-d2a8091f763e"],
  },
];

const uidPattern = /^[a-f0-9-]{36}$/i;
const cleanLine = value => String(value ?? "").trim().replace(/\s+/g, " ");
const date = value => value.split("-").reverse().join(".");
const escape = value => String(value ?? "").replace(/[&<>"']/g, char =>
  ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[char]);
const fundName = program => [program.provider, program.title].filter(Boolean).join(" · ");

export function loadMeeting(scope) {
  const key = scope ? "svbsc-foerder-sitzungswahl-v1:" + scope : "";
  let saved;
  try { saved = key && JSON.parse(localStorage.getItem(key)); } catch { /* Der Browser kann Speicher sperren. */ }
  const packages = Array.isArray(saved?.packages) ? [...new Set(saved.packages.filter(name =>
    typeof name === "string" && name.length > 0 && name.length <= 80))].slice(0, 30) : [];
  const choices = Object.fromEntries(Object.entries(saved?.choices || {}).filter(([id, choice]) =>
    uidPattern.test(id) && Object.hasOwn(decisions, choice?.decision)).map(([id, choice]) => [id, {
      decision: choice.decision,
      mine: choice.mine === true,
      bundle: packages.includes(choice.bundle) ? choice.bundle : "",
      task: typeof choice.task === "string" ? choice.task.slice(0, 320) : "",
    }]));
  return { key, choices, packages,
    draft: typeof saved?.draft === "string" ? saved.draft.slice(0, 50000) : null,
    draftStale: saved?.draftStale === true,
    draftContext: typeof saved?.draftContext === "string" ? saved.draftContext : "" };
}

function saveMeeting(plan) {
  try {
    if (!plan.key) return false;
    localStorage.setItem(plan.key, JSON.stringify({ choices: plan.choices, packages: plan.packages,
      draft: plan.draft, draftStale: plan.draftStale, draftContext: plan.draftContext }));
    return true;
  } catch {
    return false;
  }
}

function programmeNote(program, source, day) {
  if (!program.title) return "Förderweg offen";
  if (!isOriginal(source, day)) return "Aktualität der Originalquelle prüfen";
  if (program.status === "closed" || (program.until && program.until < day)) return "Diese Runde ist geschlossen";
  if (program.until) return (program.status === "open" ? "Antrag bis " : "Frist laut Quelle ") + date(program.until);
  if (program.status === "rolling") return "Laufende Einreichung laut Quelle";
  return "Antragsfenster prüfen";
}

function sourceLink(source) {
  const href = sourceUrl(source?.url);
  return href ? `<a href="${escape(href)}" target="_blank" rel="noopener noreferrer">${escape(source.title)}</a>` : "";
}

function nextStep(entry) {
  return cleanLine(entry.item.followUp || entry.item.measure) || "Mit der zuständigen Vereinsstelle den Bedarf und die nächsten Unterlagen klären.";
}

export function meetingText(selected, plan, club, day) {
  const draft = [
    "Leitersitzung · Fördermöglichkeiten",
    club.name + " · Stand " + date(day),
    "",
    "Vorschlag für die Sitzung",
    "Ich möchte mit euch entscheiden, welche Projekte wir vorbereiten und wo uns noch Informationen fehlen.",
  ];
  const active = selected.filter(entry => plan.choices[entry.row.id].decision !== "defer");
  const groups = new Map();
  for (const entry of active) {
    const bundle = plan.choices[entry.row.id].bundle;
    if (!bundle) continue;
    if (!groups.has(bundle)) groups.set(bundle, []);
    groups.get(bundle).push(entry);
  }
  for (const [name, entries] of groups) {
    if (entries.length < 2) continue;
    draft.push("", "Gemeinsam vorbereiten · " + name, ...entries.map(({ item }) => "- " + cleanLine(item.title)));
  }
  if ([...groups.values()].some(entries => entries.length > 1)) {
    draft.push("", "Für die Pakete stimmen wir die Vorbereitung gemeinsam ab. Die Kosten und Antragsbedingungen prüfen wir je Förderweg.");
  }
  for (const [decision, label] of Object.entries(decisions)) {
    const entries = selected.filter(entry => plan.choices[entry.row.id].decision === decision);
    if (!entries.length) continue;
    draft.push("", "Beschlussvorschlag · " + label);
    for (const entry of entries) {
      const { item, report } = entry;
      const choice = plan.choices[entry.row.id];
      const source = item.sources.find(s => s.id === item.program.source);
      draft.push("", cleanLine(item.title));
      if (choice.bundle && (groups.get(choice.bundle)?.length || 0) > 1 && decision !== "defer") draft.push("Paket: " + choice.bundle);
      if (item.measure) draft.push("Idee: " + cleanLine(item.measure));
      if (item.program.title) draft.push("Förderweg: " + cleanLine(fundName(item.program)) + ". " + programmeNote(item.program, source, day) + ".");
      const alternatives = (item.fundingRoutes || []).filter(route => route.status === "clarify").map(route => cleanLine(route.title));
      if (alternatives.length) draft.push("Weitere zu prüfende Wege: " + alternatives.join(", ") + ".");
      if (report?.total != null) draft.push("Erfasste Projektkosten: " + euro(report.total) + ".");
      if (decision !== "defer") draft.push("Nächster Schritt: " + nextStep(entry));
      const href = sourceUrl(source?.url);
      if (href) draft.push("Originalquelle: " + href);
    }
  }
  const mine = active.filter(entry => plan.choices[entry.row.id].mine);
  draft.push("", "Meine Aufgaben", ...(mine.length
    ? mine.map(entry => "- " + cleanLine(entry.item.title) + " · " +
      (cleanLine(plan.choices[entry.row.id].task) || nextStep(entry)))
    : ["In der Sitzung festlegen, welche Aufgaben ich übernehme."]));
  return draft.join("\n").trim() + "\n";
}

function opportunities(entries, plan, day) {
  return entries.map(({ row, item, report }) => {
    if (!item) return `<article class="meeting-option"><h3>${escape(row.title)}</h3><p class="muted">Details konnten nicht geladen werden.</p></article>`;
    const source = item.sources.find(s => s.id === item.program.source);
    const hash = "#vorgang/" + row.id + "/entscheidung";
    const checked = plan.choices[row.id] ? " checked" : "";
    const type = categories[item.type] || categories.other;
    const search = [item.title, type, item.program.title, item.program.provider, item.measure,
      ...(item.fundingRoutes || []).map(route => route.title)].filter(Boolean).join(" ");
    const route = item.sources.find(s => s.id === item.applicationSource && s.id !== source?.id);
    const links = [sourceLink(source), sourceLink(route)].filter(Boolean).join(" · ");
    const figures = [
      report?.total != null && "Projektkosten " + euro(report.total),
      report?.funding != null && "Rechnerischer Zuschuss " + euro(report.funding),
      report?.own != null && "Rechnerischer Eigenanteil " + euro(report.own),
    ].filter(Boolean);
    const more = (item.fundingRoutes || []).map(alternative => {
      const original = item.sources.find(s => s.id === alternative.source);
      return `<li><strong>${escape(alternative.title)}</strong> · ${escape(alternative.status === "excluded" ? "Passt laut Prüfung nicht" : "Zu prüfen")}
        <p>${escape(alternative.finding)}</p>${sourceLink(original)}</li>`;
    }).join("");
    const checks = (report?.checks || []).filter(check => check.status !== "pass").slice(0, 4);
    return `<article class="meeting-option" data-meeting-search="${escape(search.toLocaleLowerCase("de-DE"))}" data-meeting-type="${escape(item.type)}">
      <label class="meeting-choice"><input type="checkbox" aria-label="${escape(item.title)} auswählen" data-meeting-pick="${escape(row.id)}"${checked}>
        <span><strong>${escape(item.title)}</strong><small>${escape([type, item.program.provider].filter(Boolean).join(" · "))}</small></span></label>
      <p class="meeting-idea">${escape(item.measure || item.need)}</p>
      <details class="detail"><summary>Förderweg und offene Punkte</summary><div class="meeting-details">
        <p><strong>Bedarf</strong><br>${escape(item.need)}</p>
        <p><strong>${escape(fundName(item.program) || "Förderweg offen")}</strong><br>
          ${escape([item.program.title && instruments[item.program.instrument], programmeNote(item.program, source, day)].filter(Boolean).join(" · "))}</p>
        ${item.program.route ? `<p>${escape(item.program.route)}</p>` : ""}
        ${links ? `<p>${links}</p>` : ""}
        ${source?.excerpt ? `<p>${escape(source.excerpt)}${source.checked ? ` <small>Geprüft am ${escape(date(source.checked))}</small>` : ""}</p>` : ""}
        ${figures.length ? `<p>${escape(figures.join(" · "))}</p>` : ""}
        ${more ? `<h3>Weitere Möglichkeiten</h3><ul class="list">${more}</ul>` : ""}
        ${checks.length ? `<h3>Vor einer Entscheidung klären</h3><ul class="list">${checks.map(check => `<li>${escape(check.name)} · ${escape(check.reason)}</li>`).join("")}</ul>` : ""}
        <p><strong>Nächster Schritt</strong><br>${escape(nextStep({item}))}</p>
        <a href="${escape(hash)}">Vollständige Förderakte öffnen</a>
      </div></details>
    </article>`;
  }).join("");
}

export function mountMeeting(host, { entries, cases, plan, club, day, notify, download, retry }) {
  if (cases.length && !entries?.length) {
    host.innerHTML = '<p class="card" role="status">Förderakten werden geladen …</p>';
    return;
  }
  if (!cases.length) {
    host.innerHTML = '<div class="card"><p>Lege zuerst unter Vorgänge mit „Projekt anlegen“ einen Vereinsbedarf an. Danach kannst du ihn hier für die Leitersitzung auswählen.</p><button type="button" data-action="page-cases">Zu den Vorgängen</button></div>';
    return;
  }
  const available = (entries || []).filter(entry => entry.item);
  const byId = new Map(available.map(entry => [entry.row.id, entry]));
  const selected = () => Object.keys(plan.choices).map(id => byId.get(id)).filter(Boolean);
  const context = () => JSON.stringify({ day, cases: selected().map(entry => [entry.row.id, entry.item.version, entry.report]) });
  if (plan.draft !== null && plan.draftContext !== context()) plan.draftStale = true;
  const suggestions = bundles.map(bundle => ({ ...bundle, ids: bundle.ids.filter(id => byId.has(id)) })).filter(bundle => bundle.ids.length > 1);
  const preferred = new Set(suggestions.flatMap(bundle => bundle.ids));
  const sorted = [...entries].sort((a, b) => Number(preferred.has(b.row.id)) - Number(preferred.has(a.row.id)) ||
    a.row.title.localeCompare(b.row.title, "de-DE"));
  const typeOptions = Object.entries(categories).filter(([key]) => entries.some(({row}) => row.type === key));
  const hadErrors = available.length !== entries.length;
  host.innerHTML = `
    ${suggestions.length ? `<details class="card meeting-suggestions"${matchMedia("(min-width: 691px)").matches ? " open" : ""}>
      <summary><h2>Vorschläge für die Sitzung <small>${suggestions.length}</small></h2></summary>
      <div class="meeting-bundles">${suggestions.map(({ title, idea, ids }, index) =>
        `<article><h3>${escape(title)}</h3><p>${escape(idea)}</p>
          <details class="detail"><summary>${ids.length} Vorhaben ansehen</summary><ul class="list">${ids.map(id => `<li>${escape(byId.get(id).row.title)}</li>`).join("")}</ul></details>
          <button type="button" data-meeting-suggest="${index}" aria-label="${escape(title)} übernehmen">Übernehmen</button></article>`).join("")}</div>
    </details>` : ""}
    <div class="meeting-layout">
      <section class="card">
        <div class="meeting-list-head"><h2>Förderchancen <small>${cases.length}</small></h2><button type="button" data-meeting-action="jump">Zur Auswahl <span data-meeting-count></span></button></div>
        <div class="meeting-filters">
          <label class="field">Vorhaben suchen<input type="search" data-meeting-query placeholder="Projekt oder Förderstelle"></label>
          <label class="field">Themenbereich<select data-meeting-filter><option value="">Alle Themen</option>
            ${typeOptions.map(([value, label]) => `<option value="${escape(value)}">${escape(label)}</option>`).join("")}</select></label>
        </div>
        ${hadErrors ? '<p class="record">Einige Akten konnten nicht geladen werden. <button type="button" data-meeting-action="retry">Erneut laden</button></p>' : ""}
        <div data-meeting-options>${opportunities(sorted, plan, day)}</div>
        <p hidden data-meeting-empty>Zu dieser Suche gibt es keine Treffer.</p>
      </section>
      <section class="card meeting-selection" data-meeting-plan></section>
    </div>
    <section class="card meeting-draft" data-meeting-draft hidden></section>`;

  const review = host.querySelector("[data-meeting-plan]");
  const draft = host.querySelector("[data-meeting-draft]");
  const list = host.querySelector("[data-meeting-options]");
  const query = host.querySelector("[data-meeting-query]");
  const filter = host.querySelector("[data-meeting-filter]");

  function renderDraft() {
    draft.hidden = plan.draft === null;
    draft.innerHTML = plan.draft === null ? "" : `<h2>Sitzungsvorlage</h2>
      <p class="record" data-meeting-stale${plan.draftStale ? "" : " hidden"}>Die Auswahl wurde geändert oder die zugrunde liegenden Angaben sind neuer. Du kannst die Vorlage neu erstellen oder deinen bisherigen Text weiterbearbeiten.</p>
      <label class="field">Text für die Leitersitzung<textarea rows="17" maxlength="50000" aria-label="Text für die Leitersitzung" data-meeting-text>${escape(plan.draft)}</textarea></label>
      <div class="record" data-meeting-replace hidden>Deine bisherige Textfassung ersetzen?
        <button type="button" data-meeting-action="replace">Neu aus Auswahl erstellen</button>
        <button type="button" data-meeting-action="keep">Bisherigen Text behalten</button></div>
      <div class="actions"><button type="button" data-meeting-action="copy">Text kopieren</button>
        <button type="button" data-meeting-action="download">Als Text herunterladen</button></div>`;
  }

  function renderSelection() {
    const chosen = selected();
    host.querySelector("[data-meeting-count]").textContent = chosen.length ? "(" + chosen.length + ")" : "";
    review.innerHTML = `<h2>Deine Auswahl <small>${chosen.length}</small></h2>
      ${chosen.length ? '<button type="button" class="primary meeting-generate" data-meeting-action="write">Sitzungsvorlage erstellen</button>' : ""}
      ${chosen.length ? chosen.map(({ row }) => {
        const choice = plan.choices[row.id];
        const options = (items, current) => items.map(([value, label]) =>
          `<option value="${escape(value)}"${value === current ? " selected" : ""}>${escape(label)}</option>`).join("");
        return `<fieldset class="meeting-chosen" data-meeting-id="${escape(row.id)}"><legend>${escape(row.title)}</legend>
          <label class="field">Vorschlag an die Leitung<select aria-label="Vorschlag an die Leitung" data-meeting-choice="decision">${options(Object.entries(decisions), choice.decision)}</select></label>
          <label class="field">Paket<select aria-label="Paket" data-meeting-choice="bundle">${options([["", "Einzeln"], ...plan.packages.map(name => [name, name])], choice.bundle)}</select></label>
          <label class="meeting-choice"><input type="checkbox" data-meeting-choice="mine"${choice.mine ? " checked" : ""}${choice.decision === "defer" ? " disabled" : ""}> Ich kümmere mich darum</label>
          <label class="field" data-meeting-task${choice.mine && choice.decision !== "defer" ? "" : " hidden"}>Mein nächster Schritt
            <input type="text" maxlength="320" data-meeting-choice="task" value="${escape(choice.task)}" placeholder="z. B. Verfügbare Angebote vergleichen">
          </label>
        </fieldset>`;
      }).join("") : '<p class="muted">Hake ein Vorhaben an oder übernimm einen der Vorschläge.</p>'}
      ${chosen.length ? `<form class="meeting-package"><label class="field">Neues Paket<input name="bundle" maxlength="80" required placeholder="Name des Pakets"></label>
        <label class="meeting-choice"><input type="checkbox" name="assign" checked> Einzeln ausgewählte Vorhaben diesem Paket zuordnen</label>
        <button type="submit">Paket anlegen</button></form>` : ""}`;
  }

  const storageWarning = document.createElement("p");
  storageWarning.className = "record";
  storageWarning.setAttribute("role", "status");
  storageWarning.dataset.meetingStorage = "";
  storageWarning.hidden = true;
  storageWarning.textContent = "Der Browserspeicher ist nicht verfügbar. Änderungen bleiben nur bis zum Schließen oder Neuladen erhalten. Lade deinen Sitzungstext herunter, bevor du die Seite verlässt.";
  host.prepend(storageWarning);
  function persist() {
    const saved = saveMeeting(plan);
    storageWarning.hidden = saved;
    return saved;
  }
  function changed() {
    if (plan.draft !== null) {
      plan.draftStale = true;
      draft.querySelector("[data-meeting-stale]").hidden = false;
    }
    return persist();
  }

  function addBundle(rawName) {
    const name = cleanLine(rawName).slice(0, 80);
    if (!name || plan.packages.includes(name)) return name;
    if (plan.packages.length >= 30) {
      notify("In dieser Auswahl sind bereits 30 Pakete angelegt.", true);
      return "";
    }
    plan.packages.push(name);
    return name;
  }

  function filterList() {
    const term = query.value.trim().toLocaleLowerCase("de-DE");
    let visible = 0;
    for (const element of list.querySelectorAll("[data-meeting-search]")) {
      element.hidden = Boolean((filter.value && element.dataset.meetingType !== filter.value) || !element.dataset.meetingSearch.includes(term));
      if (!element.hidden) visible++;
    }
    host.querySelector("[data-meeting-empty]").hidden = visible > 0;
  }

  host.addEventListener("input", event => {
    if (event.target === query) filterList();
    if (event.target.matches("[data-meeting-text]")) {
      plan.draft = event.target.value;
      persist();
    }
  });
  host.addEventListener("change", event => {
    const target = event.target;
    if (target === filter) filterList();
    const picked = target.dataset.meetingPick;
    if (picked && byId.has(picked)) {
      if (target.checked) plan.choices[picked] = { decision: "clarify", mine: false, bundle: "" };
      else delete plan.choices[picked];
      changed();
      renderSelection();
    }
    const key = target.dataset.meetingChoice;
    const id = target.closest("[data-meeting-id]")?.dataset.meetingId;
    if (key && plan.choices[id]) {
      plan.choices[id][key] = target.type === "checkbox" ? target.checked : target.value;
      if (key === "decision" || key === "mine") {
        const fields = target.closest("fieldset");
        const choice = plan.choices[id];
        fields.querySelector('[data-meeting-choice="mine"]').disabled = choice.decision === "defer";
        fields.querySelector("[data-meeting-task]").hidden = !choice.mine || choice.decision === "defer";
      }
      changed();
    }
  });
  host.addEventListener("submit", event => {
    if (!event.target.matches(".meeting-package")) return;
    event.preventDefault();
    const form = new FormData(event.target);
    const name = addBundle(form.get("bundle"));
    if (!name) return;
    if (form.has("assign")) {
      for (const { row } of selected()) {
        if (!plan.choices[row.id].bundle) plan.choices[row.id].bundle = name;
      }
    }
    changed();
    renderSelection();
    notify(form.has("assign") ? "Paket zur Auswahl hinzugefügt. Einzelne Zuordnungen kannst du ändern."
      : "Paket angelegt. Weise die passenden Vorhaben über das Feld „Paket“ zu.");
  });
  host.addEventListener("click", async event => {
    const button = event.target.closest("button");
    if (!button) return;
    const suggestion = suggestions[button.dataset.meetingSuggest];
    if (suggestion) {
      const name = addBundle(suggestion.title);
      if (!name) return;
      for (const id of suggestion.ids) {
        plan.choices[id] ??= { decision: "clarify", mine: false, bundle: "" };
        if (!plan.choices[id].bundle) plan.choices[id].bundle = name;
        list.querySelector(`[data-meeting-pick="${id}"]`).checked = true;
      }
      changed();
      renderSelection();
      notify("Vorschlag übernommen. Deine bisherigen Zuordnungen bleiben erhalten.");
    }
    const action = button.dataset.meetingAction;
    if (action === "retry") retry();
    if (action === "jump") review.scrollIntoView({ block: "start" });
    if (action === "write" && selected().length) {
      if (plan.draft !== null) {
        draft.querySelector("[data-meeting-replace]").hidden = false;
        draft.scrollIntoView({ block: "start" });
        draft.querySelector('[data-meeting-action="keep"]').focus({ preventScroll: true });
        return;
      }
    }
    if (action === "keep") draft.querySelector("[data-meeting-replace]").hidden = true;
    if ((action === "write" || action === "replace") && selected().length) {
      plan.draft = meetingText(selected(), plan, club, day);
      plan.draftStale = false;
      plan.draftContext = context();
      persist();
      renderDraft();
      draft.scrollIntoView({ block: "start" });
      draft.querySelector("textarea").focus({ preventScroll: true });
    }
    if (action === "download" && plan.draft !== null) download("\uFEFF" + plan.draft, "text/plain;charset=utf-8", "SVBSC-Leitersitzung-Foerderung.txt");
    if (action === "copy" && plan.draft !== null) {
      try { await navigator.clipboard.writeText(plan.draft); notify("Sitzungsvorlage kopiert."); }
      catch { draft.querySelector("textarea").select(); notify("Text ist markiert und kann kopiert werden."); }
    }
  });
  renderSelection();
  renderDraft();
  persist();
}
