// Ranglistenlogik ohne Netz oder Datenbank. Rechte werden im Server geprüft.
// compareRating ist weiterhin nur eine nicht aktivierte Modell-Simulation.
export const VERSION = 'veo-ranking-1';
const clamp = (x, lo, hi) => Math.max(lo, Math.min(hi, x));
const finite = x => typeof x === 'number' && Number.isFinite(x);
const number = x => finite(x) && x >= 0;
const day = s => typeof s === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(s) &&
  !isNaN(Date.parse(s)) && new Date(s).toISOString().slice(0, 10) === s;
const stamp = s => typeof s === 'string' && /T.*(?:Z|[+-]\d{2}:\d{2})$/.test(s) && Number.isFinite(Date.parse(s));
const key = r => JSON.stringify([r.teamId, r.matchId, r.playerId]);
const source = s => { try { const u = new URL(s); return u.protocol === 'https:' && u.hostname === 'app.veo.co' && !u.username && !u.password; } catch { return false; } };
const METRICS = Object.freeze({
  goals: { digits: 0 }, assists: { digits: 0 }, ga: { digits: 0 },
  distance_m: { physical: true, digits: 0 },
  top_speed_kmh: { physical: true, peak: true, digits: 1 },
  sprints: { physical: true, digits: 0 }, recoveries: { digits: 0 }, saves: { digits: 0 }
});

// Latest known revision wins. Conflicting equal revisions fail closed, even if
// an older revision looked valid. A correction may invalidate a former record.
export function latestRows(rows, asOf) {
  if (!stamp(asOf)) throw new Error('Stichtag mit Zeitzone erforderlich');
  const groups = new Map(); const errors = [];
  for (const r of rows) {
    if (!r || ![r.teamId, r.matchId, r.playerId].every(x => typeof x === 'string' && x.trim()) ||
        !day(r.date) || !stamp(r.knownAt) || !Number.isInteger(r.revision) || r.revision < 1) {
      errors.push('Ungültiger Datensatz'); continue;
    }
    if (Date.parse(r.knownAt) > Date.parse(asOf)) continue;
    const k = key(r); const old = groups.get(k);
    if (!old || r.revision > old.revision) groups.set(k, { revision: r.revision, rows: [r] });
    else if (r.revision === old.revision) old.rows.push(r);
  }
  const out = [];
  for (const group of groups.values()) {
    // Input must be canonical JSON from the adapter, not arbitrary object order.
    const signatures = new Set(group.rows.map(r => JSON.stringify(r)));
    if (signatures.size > 1) errors.push('Widersprüchliche Revision');
    else out.push(group.rows[0]);
  }
  return { rows: out, errors };
}

function checkedValue(r, metric) {
  const m = METRICS[metric]; const v = r.metrics || {};
  if (r.identityConfirmed !== true || r.periodsConfirmed !== true || !source(r.sourceUrl)) return { reason: 'Zuordnung oder Quelle ungeprüft' };
  if (m.physical) {
    if (!number(r.minutesPlayed) || r.minutesPlayed <= 0 || r.minutesPlayed > 150) return { reason: 'Einsatzzeit fehlt oder ist unplausibel' };
    if (r.units !== 'metric-v1') return { reason: 'Einheiten nicht bestätigt' };
    if (r.physicalReviewed !== true || r.reducedAccuracy !== false || r.physicalFlagged !== false) return { reason: 'Bewegungsdaten nicht freigegeben' };
    if (!number(r.minutesTracked) || r.minutesTracked <= 0 || r.minutesTracked > r.minutesPlayed || r.minutesTracked / r.minutesPlayed < .9) return { reason: 'Trackingabdeckung unzureichend' };
    if (m.peak && (r.minutesTracked < 15 || r.speedReviewed !== true)) return { reason: 'Tempo-Spitze noch nicht prüffähig' };
  } else if (r.eventsReviewed !== true) return { reason: 'Ereignisse ungeprüft' };
  const fields = metric === 'ga' ? ['goals', 'assists'] : [metric];
  if (fields.some(f => !number(v[f]))) return { reason: 'Wert fehlt' };
  if (!['distance_m', 'top_speed_kmh'].includes(metric) && fields.some(f => !Number.isInteger(v[f]))) return { reason: 'Zählwert ungültig' };
  const value = fields.reduce((s, f) => s + v[f], 0);
  // Review triggers, not claimed physiological boundaries or Veo accuracy.
  if (metric === 'top_speed_kmh' && value > 40) return { reason: 'Tempo-Ausreißer prüfen' };
  if (metric === 'distance_m' && value > r.minutesTracked * 400) return { reason: 'Distanz-Ausreißer prüfen' };
  return { value, minutes: m.physical ? r.minutesTracked : number(r.minutesPlayed) && r.minutesPlayed > 0 && r.minutesPlayed <= 150 ? r.minutesPlayed : null };
}

export function leaderboard(rows, { teamId, from, to, asOf, metric, mode = 'total', period = 'month' }) {
  if (!METRICS[metric] || !['total', 'per90'].includes(mode) || !['match', 'month', 'season', 'year'].includes(period) ||
      !teamId || !day(from) || !day(to) || from > to) throw new Error('Ungültiger Ranglistenfilter');
  if (METRICS[metric].peak && mode !== 'total') throw new Error('Höchsttempo wird nicht auf 90 Minuten gerechnet');
  const latest = latestRows(rows, asOf); const players = new Map();
  const asOfDay = new Intl.DateTimeFormat('sv-SE', { timeZone: 'Europe/Berlin' }).format(new Date(asOf));
  for (const r of latest.rows) {
    if (r.teamId !== teamId || r.scope !== 'own' || r.competition !== 'league' && r.competition !== 'cup' || r.date < from || r.date > to || r.date > asOfDay) continue;
    if (!players.has(r.playerId)) players.set(r.playerId, { playerId: r.playerId, values: [], matches: new Set(), minutes: 0, missing: 0, reasons: new Set() });
    const p = players.get(r.playerId); const v = checkedValue(r, metric);
    if (v.reason || mode === 'per90' && v.minutes === null) { p.missing++; p.reasons.add(v.reason || 'Einsatzzeit fehlt'); continue; }
    p.values.push(v.value); p.minutes += v.minutes; p.matches.add(r.matchId);
  }
  const ranked = []; const pending = [];
  for (const p of players.values()) {
    const games = p.matches.size; const minGames = period === 'match' ? 1 : period === 'month' ? 2 : 3;
    const minMinutes = period === 'match' ? 30 : period === 'month' ? 90 : 270;
    if (!games || mode === 'per90' && (games < minGames || p.minutes < minMinutes)) {
      pending.push({ playerId: p.playerId, reasons: [...p.reasons, ...(!games ? [] : ['Noch zu wenig Spielzeit'])] }); continue;
    }
    const sum = p.values.reduce((a, b) => a + b, 0);
    const value = METRICS[metric].peak ? Math.max(...p.values) : mode === 'per90' ? sum / p.minutes * 90 : sum;
    const digits = mode === 'per90' && !METRICS[metric].physical ? 2 : METRICS[metric].digits;
    ranked.push({ playerId: p.playerId, value: Number(value.toFixed(digits)), games, minutes: p.minutes, missing: p.missing, partial: p.missing > 0 });
  }
  ranked.sort((a, b) => b.value - a.value || a.playerId.localeCompare(b.playerId));
  ranked.forEach((p, i) => { p.rank = i && p.value === ranked[i - 1].value ? ranked[i - 1].rank : i + 1; });
  return { version: VERSION, metric, mode, from, to, asOf, ranked, pending, errors: latest.errors,
    // Missing recordings outside the supplied rows are not knowable here.
    finalAwardEligible: false, note: 'Zwischenstand. Vollständigkeit des Spielplans muss separat geprüft werden.' };
}

// A pre-calibrated role signal is required. This function DOES NOT compute or
// invent it from kilometers. Feature gates below are not server authorization.
export function compareRating(base, evidence = {}) {
  if (!base || !finite(base.ca_intern) || !finite(base.bewaehrt) || !base.korrektur) throw new Error('V1-Bewertung fehlt');
  const c = base.korrektur;
  if (!['leistung', 'rolle', 'eyetest', 'pause'].every(k => finite(c[k]))) throw new Error('V1-Korrekturen fehlen');
  const valid = evidence.approved === true && evidence.positionConfirmed === true &&
    typeof evidence.referenceVersion === 'string' && evidence.referenceVersion.trim().length > 0 &&
    number(evidence.minutes) && evidence.minutes >= 180 && Number.isInteger(evidence.games) && evidence.games >= 3 &&
    number(evidence.referencePlayers) && evidence.referencePlayers >= 20 &&
    number(evidence.referenceMatches) && evidence.referenceMatches >= 50 &&
    finite(evidence.roleSignal) && Math.abs(evidence.roleSignal) <= 1;
  if (!valid) return { version: VERSION, ca: base.ca, ca_intern: base.ca_intern, delta: 0, veo: 0, active: false, reason: 'Noch keine freigegebene Referenz und ausreichende Daten' };
  const confidence = evidence.minutes / (evidence.minutes + 900) * Math.min(1, evidence.games / 5);
  const veo = clamp(2 * confidence * evidence.roleSignal, -2, 2);
  const rawCorrection = c.leistung + c.rolle + c.eyetest;
  // Preserve V1's unrounded baseline rather than reconstructing it from rounded
  // reason components. Production V2 must move this addition inside bewerte().
  const effectiveDelta = clamp(rawCorrection + veo, -8, 8) - clamp(rawCorrection, -8, 8);
  const raw = clamp(base.ca_intern + effectiveDelta, 25, 99);
  const internal = Math.round(raw * 10) / 10;
  return { version: VERSION, ca: Math.round(internal), ca_intern: internal, delta: Math.round((internal - base.ca_intern) * 10) / 10,
    veo: Math.round(veo * 1000) / 1000, active: true, referenceVersion: evidence.referenceVersion,
    reason: 'Nur Simulation. V1 liefert gerundete Teilwerte; produktive V2 muss mit ungerundeten Komponenten rechnen.' };
}
