.sk-chip small{font-weight:400;color:var(--ink2)}
.sk-tr{display:grid;grid-template-columns:auto 1fr;gap:18px;align-items:center}
.sk-ring{position:relative;width:112px;height:112px}.sk-ring svg{width:112px;height:112px;transform:rotate(-90deg)}
.sk-ring circle{fill:none;stroke-width:10}.sk-ring .bg{stroke:rgba(148,163,196,.22)}.sk-ring .fg{stroke:var(--green,#1a8f55);stroke-linecap:round;transition:stroke-dashoffset .9s cubic-bezier(.2,.7,.2,1)}
.sk-ring b{position:absolute;inset:0;display:grid;place-items:center;font-size:24px;font-variant-numeric:tabular-nums}
.sk-fakten{display:grid;gap:6px;font-size:14.5px}.sk-fakten span{color:var(--ink2)}.sk-fakten b{font-variant-numeric:tabular-nums}
.sk-l{display:grid;gap:8px}.sk-z{display:grid;grid-template-columns:auto 1fr auto;gap:4px 12px;align-items:center;padding:11px 14px;border-radius:14px;background:var(--surface2,rgba(148,163,196,.1))}
.sk-z .d{color:var(--ink2);font-size:13px;font-variant-numeric:tabular-nums;min-width:44px}.sk-z .t{min-width:0;overflow-wrap:anywhere}.sk-z .t small{display:block;color:var(--ink2);font-size:13px}
.sk-z .w{font-weight:650;font-variant-numeric:tabular-nums;text-align:right;white-space:nowrap}.sk-z .w.plus{color:var(--green,#1a8f55)}
.sk-z .u{grid-column:1/-1;display:flex;gap:8px;flex-wrap:wrap;align-items:center}
.sk-h4{margin:18px 0 10px;font-size:15px}.sk-sp .u{justify-content:space-between}.sk-z .btn.sk-spk{min-height:44px!important}
.sk-st{font-size:12.5px;font-weight:650;padding:3px 9px;border-radius:999px;background:rgba(148,163,196,.18);color:var(--ink2)}
.sk-st.ok{background:rgba(26,143,85,.16);color:var(--green,#1a8f55)}.sk-st.warn{background:rgba(234,179,8,.2);color:var(--ink)}
.sk-z textarea,.sk-z input[type=text]{flex:1;min-width:200px;min-height:44px;font:inherit;padding:10px 12px;border-radius:10px;border:1px solid var(--line,rgba(148,163,196,.4));background:var(--card,transparent);color:inherit}
.sk-z textarea{min-height:76px;flex-basis:100%;resize:vertical}
.sk-seg{display:inline-flex;padding:3px;border-radius:12px;background:var(--surface2,rgba(148,163,196,.14));gap:2px;flex-wrap:wrap}
.sk-seg button{border:0;background:none;color:var(--ink2);font:inherit;font-size:13.5px;font-weight:600;padding:9px 13px;border-radius:9px;cursor:pointer;min-height:40px}
.sk-seg button[aria-pressed=true]{background:var(--card,#fff);color:var(--ink);box-shadow:0 1px 3px rgba(15,23,42,.14)}
.sk-kopf{display:flex;gap:10px;justify-content:space-between;align-items:center;flex-wrap:wrap;margin-bottom:12px}.sk-kopf h3{margin:0}
.sk-pod{display:grid;grid-template-columns:repeat(3,1fr);gap:10px;align-items:end;margin:6px 0 14px;min-height:150px}
.sk-p{display:grid;gap:6px;text-align:center;justify-items:center;min-width:0}.sk-p .n{font-weight:650;font-size:14px;overflow-wrap:anywhere;line-height:1.2}
.sk-p .e{font-variant-numeric:tabular-nums;font-size:13px;color:var(--ink2)}
.sk-p .s{width:100%;border-radius:12px 12px 4px 4px;display:grid;place-items:center;font-size:22px;font-weight:800;color:#fff;height:var(--h);transform-origin:bottom}
.sk-p.r1 .s{background:linear-gradient(180deg,#f0b429,#d99a0b)}.sk-p.r2 .s{background:linear-gradient(180deg,#94a3b8,#7c8ba1)}.sk-p.r3 .s{background:linear-gradient(180deg,#c98a5a,#b0713f)}
.sk-p.ich .n{color:var(--accent,#2f6bff)}.sk-rest .sk-z.ich{box-shadow:inset 0 0 0 2px var(--accent,#2f6bff)}
.sk-arten{display:grid;grid-template-columns:repeat(auto-fit,minmax(210px,1fr));gap:10px;margin-top:6px}
.sk-a{padding:12px 14px;border-radius:14px;background:var(--surface2,rgba(148,163,196,.1));display:grid;gap:6px}.sk-a b{font-size:15px}.sk-a small{color:var(--ink2);font-size:12.5px}
.sk-a ol{margin:0;padding:0;list-style:none;display:grid;gap:3px;font-size:14px}.sk-a li{display:flex;justify-content:space-between;gap:8px}.sk-a li span:last-child{font-variant-numeric:tabular-nums;color:var(--ink2)}
.sk-a li:first-child{font-weight:650}.sk-leer{padding:16px;border-radius:14px;background:var(--surface2,rgba(148,163,196,.1));color:var(--ink2);font-size:14.5px}
.sk-sum{font-size:14px;color:var(--ink2);margin:0 0 10px}.sk-unter{margin:16px 0 8px;font-size:14px;color:var(--ink2);font-weight:650;letter-spacing:.03em;text-transform:uppercase}
#sk96Karte{margin-bottom:14px;cursor:pointer;text-align:left;width:100%;font:inherit;color:inherit;display:grid;gap:8px}
#sk96Karte .kz{display:flex;gap:18px;flex-wrap:wrap;align-items:baseline}#sk96Karte .kz b{font-size:24px;font-variant-numeric:tabular-nums}#sk96Karte .kz small{display:block;color:var(--ink2);font-size:12.5px}
#sk96Karte h3{margin:0;font-size:17px;display:flex;justify-content:space-between;gap:8px;align-items:center}#sk96Karte .rot{color:var(--red,#d14343);font-weight:650;font-size:14px}
@media (max-width:520px){.sk-kacheln{grid-template-columns:1fr 1fr}.sk-kacheln .sk-k:last-child:nth-child(odd){grid-column:1/-1}.sk-saldo b{font-size:38px}.sk-tr{grid-template-columns:1fr;justify-items:start}.sk-z{grid-template-columns:auto 1fr}.sk-z .w{grid-column:2;text-align:left}}
@media (prefers-reduced-motion:no-preference){.sk-p .s{animation:sk96hoch .7s cubic-bezier(.2,.7,.2,1) both}.sk-p.r2 .s{animation-delay:.08s}.sk-p.r1 .s{animation-delay:.16s}.sk-p.r3 .s{animation-delay:0s}
  @keyframes sk96hoch{from{transform:scaleY(.08);opacity:.4}to{transform:none;opacity:1}}.sk-wrap>section{animation:sk96rein .35s cubic-bezier(.2,.7,.2,1) both}
  @keyframes sk96rein{from{opacity:0;transform:translateY(8px)}to{opacity:1;transform:none}}}`;
  document.head.appendChild(s); }

async function sk96Laden(force){
  if(!force && SK96.d && Date.now() - SK96.geladen < 60000) return SK96.d;
  if(SK96.laeuft) return SK96.laeuft;
  SK96.laeuft = (async () => {
    try{ const { data, error } = await SVB.sb.rpc('spielerkonto'); if(error) throw error; SK96.d = data || null; }catch(e){ SK96.d = SK96.d || null; }
    SK96.geladen = Date.now(); SK96.laeuft = null;
    if(SK96.d && !SK96.team) SK96.team = (SK96.d.ich && SK96.d.ich.team) || (SK96.d.teams || [])[0] || null;
    return SK96.d; })();
  return SK96.laeuft;
}
function sk96Darf(){ const d = SK96.d; return !!(d && (d.ich || d.trainer || d.pruefer)); }
function sk96Saldo(d){ return (+((d.praemien || {}).offen) || 0) - (+((d.offen || {}).eur) || 0); }

// Zahlen zählen hoch, wenn Bewegung erwünscht ist
function sk96Zaehl(root){
  root.querySelectorAll('[data-zu]').forEach(el => { const ziel = +el.dataset.zu || 0, art = el.dataset.fmt;
    const zeig = v => { el.textContent = art === 'eur' ? sk96Eur(v) : art === 'saldo' ? (v > 0 ? '+' : '') + sk96Eur(v) : Math.round(v) + (art === 'pct' ? ' %' : ''); };
    if(sk96Ruhig() || !ziel){ zeig(ziel); return; }
    const t0 = performance.now(), dauer = 700; const schritt = t => { const p = Math.min(1, (t - t0) / dauer), e = 1 - Math.pow(1 - p, 3); zeig(ziel * e); if(p < 1) requestAnimationFrame(schritt); else zeig(ziel); };
    zeig(0); requestAnimationFrame(schritt); });
  root.querySelectorAll('.sk-ring .fg').forEach(c => { const u = +c.dataset.u || 0, q = Math.max(0, Math.min(100, +c.dataset.q || 0)); c.style.strokeDasharray = u; c.style.strokeDashoffset = sk96Ruhig() ? u * (1 - q / 100) : u;
    if(!sk96Ruhig()) requestAnimationFrame(() => requestAnimationFrame(() => { c.style.strokeDashoffset = u * (1 - q / 100); })); });
}

function sk96Held(d){
  const pr = d.praemien || {}, of = d.offen || {}, tr = (d.training || {}).saison, hatPr = pr.regel != null || (pr.liste || []).length, saldo = sk96Saldo(d);
  const kopf = hatPr
    ? `<div class="sk-saldo"><small>Dein Stand</small><b class="${saldo > 0 ? 'plus' : saldo < 0 ? 'minus' : ''}" data-zu="${saldo}" data-fmt="saldo">${(saldo > 0 ? '+' : '') + sk96Eur(saldo)}</b><span>Offene Siegprämien minus offene Strafen. Ausgezahlt und bezahlt wird wie gewohnt.</span></div>`
    : `<div class="sk-saldo"><small>Offen in der Mannschaftskasse</small><b data-zu="${+of.eur || 0}" data-fmt="eur">${sk96Eur(of.eur)}</b><span>${+of.eur ? 'Bezahlen kannst du wie gewohnt beim Kassenwart.' : 'Alles bezahlt. So soll es sein.'}</span></div>`;
  return `<section class="card sk-held" aria-label="Dein Stand">${kopf}
    <div class="sk-kacheln">${hatPr ? `<div class="sk-k"><small>Siegprämien offen</small><b data-zu="${+pr.offen || 0}" data-fmt="eur">${sk96Eur(pr.offen)}</b><i>${(pr.liste || []).length} ${(pr.liste || []).length === 1 ? 'Sieg' : 'Siege'} in dieser Saison</i></div>` : ''}
      <div class="sk-k"><small>Strafen offen</small><b data-zu="${+of.eur || 0}" data-fmt="eur">${sk96Eur(of.eur)}</b><i>${+of.kasten ? 'dazu ' + sk96Kst(of.kasten) : (+of.n ? of.n + (of.n === 1 ? ' Eintrag' : ' Einträge') : 'weiße Weste')}</i></div>
      <div class="sk-k"><small>Training in dieser Saison</small><b ${tr ? `data-zu="${tr.quote}" data-fmt="pct"` : ''}>${tr ? tr.quote + ' %' : 'noch offen'}</b><i>${tr ? tr.da + ' von ' + tr.einheiten + ' Einheiten' : 'sobald Einheiten erfasst sind'}</i></div></div>
    ${(d.titel || []).length ? `<div class="sk-titel">${d.titel.map(t => `<span class="sk-chip">👑 ${sk96E(t.titel)} <small>${sk96E(t.wert || '')}</small></span>`).join('')}</div>` : ''}</section>`;
}
function sk96Training(d){
  const T = d.training || {}, s = T.saison, w = T.wochen; if(!s) return '';
  const r = 46, u = Math.round(2 * Math.PI * r * 100) / 100;
  return `<section class="card" aria-label="Trainingsbeteiligung"><h3>Trainingsbeteiligung</h3><div class="sk-tr">
    <div class="sk-ring"><svg viewBox="0 0 112 112" aria-hidden="true"><circle class="bg" cx="56" cy="56" r="${r}"/><circle class="fg" cx="56" cy="56" r="${r}" data-u="${u}" data-q="${s.quote}"/></svg><b data-zu="${s.quote}" data-fmt="pct">${s.quote} %</b></div>
    <div class="sk-fakten"><div><b>${s.da} von ${s.einheiten}</b> <span>Einheiten in dieser Saison dabei</span></div>
      ${T.rang ? `<div><b>Platz ${T.rang}</b> <span>von ${T.von} in der Mannschaft</span></div>` : ''}
      <div><b>${s.serie}</b> <span>${s.serie === 1 ? 'Einheit' : 'Einheiten'} in Folge dabei</span></div>
      ${w ? `<div><b>${w.quote} %</b> <span>in den letzten acht Wochen</span></div>` : ''}
      ${s.spaet ? `<div><b>${s.spaet} Mal</b> <span>zu spät</span></div>` : ''}</div></div>
    <p class="note" style="margin-top:12px">Verletzt oder krank zählt nicht gegen dich.</p></section>`;
}
function sk96Strafen(d){
  const L = d.strafen || [];
  const st = b => b.status === 'bezahlt' ? ['ok', 'Bezahlt'] : b.status === 'erlassen' ? ['ok', 'Gestrichen'] : b.status === 'gemeldet' ? ['warn', 'Als bezahlt gemeldet'] : ['', 'Offen'];
  return `<section class="card" aria-label="Deine Strafen"><h3>Deine Strafen und Beiträge</h3>
    ${L.length ? `<div class="sk-l">${L.map(b => { const s = st(b), e = b.einspruch;
      return `<div class="sk-z" data-skb="${sk96E(b.id)}"><span class="d">${sk96E(sk96Tag(b.datum))}</span><span class="t"><b>${sk96E(b.titel)}</b></span><span class="w">${sk96E(sk96Wert(b))}</span>
        <div class="u"><span class="sk-st ${s[0]}">${s[1]}</span>${e ? `<span class="sk-st ${e.status === 'gestrichen' ? 'ok' : e.status === 'offen' ? 'warn' : ''}">${e.status === 'offen' ? 'Wird geprüft' : e.status === 'gestrichen' ? 'Einspruch berechtigt' : 'Geprüft: bleibt'}</span>${e.antwort ? `<small style="color:var(--ink2)">${sk96E(e.antwort)}</small>` : ''}` : ''}
        ${b.hinterfragbar ? `<button type="button" class="btn sm ghost" data-skh>Hinterfragen</button>` : ''}</div></div>`; }).join('')}</div>`
      : '<div class="sk-leer">Weiße Weste. Bei dir ist nichts eingetragen.</div>'}
    <p class="note" style="margin-top:12px">Stimmt etwas nicht? Tippe auf „Hinterfragen“. Der Kassenwart sieht sich die Strafe an und du bekommst Bescheid.</p></section>`;
}
function sk96Praemien(d){
  const P = d.praemien || {}, L = P.liste || []; if(P.regel == null && !L.length) return '';
  return `<section class="card" aria-label="Deine Siegprämien"><h3>Deine Siegprämien</h3>
    ${L.length ? `<div class="sk-l">${L.map(p => `<div class="sk-z"><span class="d">${sk96E(sk96Tag(p.datum))}</span><span class="t"><b>${sk96E(p.ergebnis || '')} gegen ${sk96E(p.gegner || '')}</b></span><span class="w plus">+${sk96E(sk96Eur(p.betrag))}</span>
        <div class="u"><span class="sk-st ${p.status === 'ausgezahlt' ? 'ok' : ''}">${p.status === 'ausgezahlt' ? 'Ausgezahlt' : 'Offen'}</span></div></div>`).join('')}</div>`
      : '<div class="sk-leer">Noch kein Sieg mit dir auf dem Platz in dieser Saison. Der nächste kommt.</div>'}
    <p class="note" style="margin-top:12px">${P.regel != null ? sk96E(sk96Eur(P.regel)) + ' je Sieg in der Liga für jeden, der eingesetzt wurde. Die Prämie kommt nach dem Spielbericht von selbst dazu.' : ''}</p></section>`;
}
function sk96Bestenliste(){
  const d = SK96.d, T = d.teams || [], L = SK96.liste; if(!T.length) return '';
  const seg = (name, werte, aktiv) => `<div class="sk-seg" role="group" aria-label="${name}">${werte.map(w => `<button type="button" data-sk${name}="${sk96E(w[0])}" aria-pressed="${w[0] === aktiv}">${sk96E(w[1])}</button>`).join('')}</div>`;
  let innen = '<div class="sk-leer">Lädt …</div>';
  if(L && L.team === SK96.team && L.zeit === SK96.zeit){
    const G = L.geld || [], ich = L.ich, top = G.slice(0, 3), max = Math.max(1, ...top.map(x => +x.eur || 0));
    const pod = [top[1], top[0], top[2]].map((x, i) => { if(!x) return '<div></div>'; const rang = [2, 1, 3][i], h = Math.round(46 + 74 * ((+x.eur || 0) / max));
      return `<div class="sk-p r${rang}${x.id === ich ? ' ich' : ''}"><span class="n">${sk96E(x.name)}</span><span class="e">${sk96E(sk96Eur(x.eur))} · ${x.n} Mal</span><span class="s" style="--h:${h}px">${rang}</span></div>`; }).join('');
    innen = G.length ? `<p class="sk-sum">${sk96E(sk96Eur((L.gesamt || {}).eur))} für die Mannschaftskasse aus ${(L.gesamt || {}).n} ${(L.gesamt || {}).n === 1 ? 'Strafe' : 'Strafen'}${+(L.gesamt || {}).kasten ? ', dazu ' + sk96Kst(L.gesamt.kasten) : ''}.</p>
      <div class="sk-pod" aria-label="Die ersten drei">${pod}</div>
      ${G.length > 3 ? `<div class="sk-l sk-rest">${G.slice(3).map((x, i) => `<div class="sk-z${x.id === ich ? ' ich' : ''}"><span class="d">${i + 4}.</span><span class="t"><b>${sk96E(x.name)}</b></span><span class="w">${sk96E(sk96Eur(x.eur))}</span></div>`).join('')}</div>` : ''}
      ${(L.arten || []).length ? `<p class="sk-unter">Wer führt wobei</p><div class="sk-arten">${L.arten.map(a => `<div class="sk-a"><b>${sk96E(a.titel || a.art)}</b><small>${sk96E(a.titel ? a.art + ', ' : '')}${a.n} Mal insgesamt</small>
        <ol>${(a.top || []).map(t => `<li${t.id === ich ? ' style="color:var(--accent,#2f6bff)"' : ''}><span>${sk96E(t.name)}</span><span>${t.n}</span></li>`).join('')}</ol></div>`).join('')}</div>` : ''}`
      : `<div class="sk-leer">${SK96.zeit === 'monat' ? 'In diesem Monat ist noch nichts eingetragen. Sauberer Start.' : 'Hier ist noch nichts eingetragen.'}</div>`;
    if((L.training || []).length) innen += `<p class="sk-unter">Trainingsfleißigste</p><div class="sk-l">${L.training.map((x, i) => `<div class="sk-z${x.id === ich ? ' ich' : ''}"><span class="d">${i + 1}.</span><span class="t"><b>${sk96E(x.name)}</b><small>${x.da} von ${x.einheiten} Einheiten</small></span><span class="w plus">${x.quote} %</span></div>`).join('')}</div>`;
  }
  return `<section class="card sk-best" aria-label="Bestenliste"><div class="sk-kopf"><h3>Bestenliste ${sk96E(sk96TeamT(SK96.team))}</h3>
    <div style="display:flex;gap:8px;flex-wrap:wrap">${T.length > 1 ? seg('team', T.map(t => [t, t === '2' ? 'Zweite' : 'Erste']), SK96.team) : ''}${seg('zeit', Object.entries(SK96_ZEIT), SK96.zeit)}</div></div>
    <div id="sk96Liste">${innen}</div>
    <p class="note" style="margin-top:12px">Diese Liste sieht nur die eigene Mannschaft. Jeder Euro landet in der Mannschaftskasse.</p></section>`;
}
function sk96Pruefung(){
  const d = SK96.d; if(!d.pruefer) return ''; const L = SK96.pruef;
  if(!L) return '<section class="card" aria-label="Hinterfragte Strafen"><h3>Hinterfragte Strafen</h3><div class="sk-leer">Lädt …</div></section>';
  const offen = L.filter(x => x.status === 'offen'), alt = L.filter(x => x.status !== 'offen').slice(0, 6);
  return `<section class="card" aria-label="Hinterfragte Strafen"><h3>Hinterfragte Strafen ${offen.length ? `<span class="sk-st warn">${offen.length} offen</span>` : ''}</h3>
    ${offen.length ? `<div class="sk-l">${offen.map(x => `<div class="sk-z" data-ske="${sk96E(x.id)}"><span class="d">${sk96E(sk96Tag(x.datum))}</span><span class="t"><b>${sk96E(x.name)}</b><small>${sk96E(x.titel)} · ${sk96E(sk96TeamT(x.team))}</small></span><span class="w">${sk96E(sk96Wert(x))}</span>
        <div class="u"><span style="flex-basis:100%">„${sk96E(x.grund)}“</span><input type="text" maxlength="300" placeholder="Kurze Antwort an den Spieler (freiwillig)" aria-label="Antwort an ${sk96E(x.name)}" data-skant>
          <button type="button" class="btn sm ghost" data-skent="bleibt">Strafe bleibt</button><button type="button" class="btn sm" data-skent="gestrichen">Streichen</button></div></div>`).join('')}</div>`
      : '<div class="sk-leer">Gerade wird nichts hinterfragt.</div>'}
    ${alt.length ? `<p class="sk-unter">Zuletzt entschieden</p><div class="sk-l">${alt.map(x => `<div class="sk-z"><span class="d">${sk96E(sk96Tag(x.datum))}</span><span class="t"><b>${sk96E(x.name)}</b><small>${sk96E(x.titel)}</small></span><span class="w">${sk96E(sk96Wert(x))}</span>
        <div class="u"><span class="sk-st ${x.status === 'gestrichen' ? 'ok' : ''}">${x.status === 'gestrichen' ? 'Gestrichen' : 'Bleibt'}</span></div></div>`).join('')}</div>` : ''}</section>`;
}
// 0.99.23: Auszahlung je Spiel. Der alte Knopf hakte alles auf einmal ab und ließ sich nicht zurücknehmen.
function sk96Spiele(L){ if(!L.length) return '';
  return `<h4 class="sk-h4">Auszahlung je Spiel</h4><div class="sk-l">${L.map(x => { const zu = +x.offen === 0, teil = !zu && +x.offen < +x.spieler;
    return `<div class="sk-z sk-sp" data-skm="${sk96E(x.match)}"><span class="d">${sk96E(sk96Tag(x.datum))}</span>
      <span class="t"><b>${sk96E(x.ergebnis || '')} gegen ${sk96E(x.gegner || 'Gegner')}</b><small>${+x.spieler} Spieler · ${sk96E(sk96Eur(x.summe))} · ${sk96E(sk96TeamT(x.team))}</small></span>
      <div class="u"><span class="sk-st ${zu ? 'ok' : ''}">${zu ? 'Ausgezahlt' + (x.ausgezahlt_am ? ' am ' + sk96E(sk96Tag(x.ausgezahlt_am)) : '') : teil ? +x.offen + ' von ' + +x.spieler + ' offen' : 'Offen'}</span>
        <button type="button" class="btn sm ${zu ? 'ghost' : ''} sk-spk" data-skspiel="${zu ? '0' : '1'}">${zu ? 'Zurück auf offen' : 'Als ausgezahlt abhaken'}</button></div></div>`; }).join('')}</div>`; }
function sk96Leitung(){
  const d = SK96.d; if(!d.leitung) return ''; const P = SK96.praem;
  if(!P) return '<section class="card" aria-label="Siegprämien der Mannschaft"><h3>Siegprämien der Mannschaft</h3><div class="sk-leer">Lädt …</div></section>';
  const S = P.spieler || [], R = (P.regeln || []).filter(r => r.aktiv);
  return `<section class="card" aria-label="Siegprämien der Mannschaft"><h3>Siegprämien der Mannschaft</h3>
    <p class="sk-sum">${R.length ? R.map(r => sk96E(sk96Eur(r.betrag)) + ' je Sieg, ' + sk96E(sk96TeamT(r.team)) + ', seit ' + sk96E(sk96Tag(r.ab))).join(' · ') : 'Keine Regel aktiv.'} Offen insgesamt: <b>${sk96E(sk96Eur(P.offen))}</b>. Diese Übersicht sehen nur Admin und Vorstand.</p>
    ${S.length ? `<div class="sk-l">${S.map(x => `<div class="sk-z"><span class="d">${x.siege}×</span><span class="t"><b>${sk96E(x.name)}</b>${+x.ausgezahlt ? `<small>${sk96E(sk96Eur(x.ausgezahlt))} schon ausgezahlt</small>` : ''}</span><span class="w plus">${sk96E(sk96Eur(x.offen))}</span></div>`).join('')}</div>
      ${sk96Spiele(P.spiele || [])}`
      : '<div class="sk-leer">Noch keine Prämie in dieser Saison.</div>'}
    <p class="note" style="margin-top:12px">Gezählt werden Siege in der Liga laut Spielbericht. Pokal und Freundschaftsspiele zählen nicht mit.</p></section>`;
}

function sk96Panel(){ let P = document.getElementById('panel-spielerkonto'); if(P) return P;
  const ref = document.getElementById('panel-home') || document.querySelector('.panel'); if(!ref) return null;
  P = document.createElement('section'); P.className = 'panel'; P.id = 'panel-spielerkonto'; ref.parentNode.insertBefore(P, ref.nextSibling); return P; }
function sk96Render(){
  const P = sk96Panel(); if(!P) return; sk96Css(); const d = SK96.d;
  if(!d){ P.innerHTML = '<div class="sk-wrap"><div class="card sk-leer">Lädt …</div></div>'; return; }
  const kopf = `<div class="vst-kopf"><div><h2>${d.ich ? sk96E(d.ich.name) : 'Die Mannschaften'}</h2><p>${d.ich ? sk96E(sk96TeamT(d.ich.team)) : 'Bestenlisten, hinterfragte Strafen und Prämien'}</p></div></div>`;
  const ohne = !d.ich && !d.trainer && !d.pruefer ? '<section class="card sk-leer"><b>Dein Konto ist noch keinem Spieler zugeordnet.</b><br>Sag kurz deinem Trainer Bescheid. Danach siehst du hier deine Strafen, deine Trainingsbeteiligung und die Bestenliste deiner Mannschaft.</section>' : '';
  P.innerHTML = `${kopf}<div class="sk-wrap">${ohne}${d.pruefer ? sk96Pruefung() : ''}${d.ich ? sk96Held(d) + sk96Training(d) + sk96Strafen(d) + sk96Praemien(d) : ''}${sk96Bestenliste()}${sk96Leitung()}</div>`;
  sk96Zaehl(P); sk96Binden(P);
}
function sk96Binden(P){
  P.querySelectorAll('[data-skteam]').forEach(b => b.onclick = () => { SK96.team = b.dataset.skteam; SK96.liste = null; sk96Render(); sk96ListeHolen(); });
  P.querySelectorAll('[data-skzeit]').forEach(b => b.onclick = () => { SK96.zeit = b.dataset.skzeit; SK96.liste = null; sk96Render(); sk96ListeHolen(); });
  P.querySelectorAll('[data-skh]').forEach(b => b.onclick = () => { const z = b.closest('[data-skb]'), u = z.querySelector('.u'); if(z.querySelector('textarea')) return;
    b.hidden = true; const box = document.createElement('div'); box.style.cssText = 'flex-basis:100%;display:flex;gap:8px;flex-wrap:wrap';
    box.innerHTML = `<textarea maxlength="500" placeholder="Was stimmt nicht? Zum Beispiel: Ich war entschuldigt." aria-label="Grund"></textarea><button type="button" class="btn sm" data-sksend>Absenden</button><button type="button" class="btn sm ghost" data-skab>Abbrechen</button>`;
    u.appendChild(box); const ta = box.querySelector('textarea'); try{ ta.focus(); }catch(e){}
    box.querySelector('[data-skab]').onclick = () => { box.remove(); b.hidden = false; };
    box.querySelector('[data-sksend]').onclick = async ev => { const k = ev.currentTarget, g = ta.value.trim(); if(g.length < 5){ kToast('Schreib bitte kurz dazu, was nicht stimmt'); try{ ta.focus(); }catch(e){} return; }
      k.disabled = true;
      try{ const { error } = await SVB.sb.rpc('sk_einspruch', { p_buchung:z.dataset.skb, p_grund:g }); if(error) throw error;
        kToast('✓ Ist beim Kassenwart. Du bekommst Bescheid.'); await sk96Laden(true); sk96Render(); sk96Karte(); }
      catch(e){ k.disabled = false; kToast('⚠️ ' + String((e && e.message) || e)); } }; });
  P.querySelectorAll('[data-skent]').forEach(b => b.onclick = async () => { const z = b.closest('[data-ske]'); z.querySelectorAll('button').forEach(x => x.disabled = true);
    try{ const { error } = await SVB.sb.rpc('sk_einspruch_entscheiden', { p_id:z.dataset.ske, p_status:b.dataset.skent, p_antwort:z.querySelector('[data-skant]').value.trim() || null }); if(error) throw error;
      kToast(b.dataset.skent === 'gestrichen' ? '✓ Gestrichen, der Spieler weiß Bescheid' : '✓ Bleibt, der Spieler weiß Bescheid'); SK96.pruef = null; SK96.liste = null; await sk96Laden(true); sk96Render(); sk96Nachladen(); sk96Karte(); }
    catch(e){ z.querySelectorAll('button').forEach(x => x.disabled = false); kToast('⚠️ ' + String((e && e.message) || e)); } });
  P.querySelectorAll('[data-skspiel]').forEach(b => b.onclick = async () => { const z = b.closest('[data-skm]'), m = z.dataset.skm, an = b.dataset.skspiel === '1';
    const setzen = async wert => { const { data, error } = await SVB.sb.rpc('praemien_spiel', { p_match:m, p_ausgezahlt:wert }); if(error) throw error;
      SK96.praem = null; await sk96Laden(true); sk96Render(); sk96Nachladen(); return (data && data.anzahl) || 0; };
    b.disabled = true;
    try{ const n = await setzen(an);
      kToast(an ? `✓ ${n} ${n === 1 ? 'Prämie' : 'Prämien'} als ausgezahlt abgehakt` : `✓ ${n} ${n === 1 ? 'Prämie steht' : 'Prämien stehen'} wieder auf offen`, 'Rückgängig',
        async () => { try{ await setzen(!an); kToast('✓ Zurückgenommen'); }catch(e){ kToast('⚠️ ' + String((e && e.message) || e)); } }); }
    catch(e){ b.disabled = false; kToast('⚠️ ' + String((e && e.message) || e)); } });
}
async function sk96ListeHolen(){ const d = SK96.d; if(!d || !SK96.team || !(d.teams || []).includes(SK96.team)) return; const t = SK96.team, z = SK96.zeit;
  try{ const { data, error } = await SVB.sb.rpc('sk_bestenliste', { p_team:t, p_zeit:z }); if(error) throw error; if(SK96.team !== t || SK96.zeit !== z) return; SK96.liste = data; }
  catch(e){ SK96.liste = { team:t, zeit:z, geld:[], arten:[], training:[], gesamt:{} }; }
  if(typeof svCurTab === 'function' && svCurTab() === 'spielerkonto') sk96Render(); }
async function sk96Nachladen(){ const d = SK96.d; if(!d) return; const auf = [];
  if(!SK96.liste) auf.push(sk96ListeHolen());
  if(d.pruefer && !SK96.pruef) auf.push(SVB.sb.rpc('sk_einsprueche').then(r => { SK96.pruef = r.error ? [] : (r.data || []); }));
  if(d.leitung && !SK96.praem) auf.push(SVB.sb.rpc('praemien_stand').then(r => { SK96.praem = r.error ? { spieler:[], regeln:[], offen:0 } : r.data; }));
  await Promise.all(auf).catch(() => {}); if(typeof svCurTab === 'function' && svCurTab() === 'spielerkonto') sk96Render(); }
async function sk96Oeffnen(){ sk96Render(); await sk96Laden(true); sk96Render(); await sk96Nachladen(); }

// Karte auf der Startseite: der eigene Stand auf einen Blick, ein Tipp öffnet das Konto
function sk96Karte(){
  const home = document.getElementById('panel-home'); if(!home) return; const d = SK96.d; let k = document.getElementById('sk96Karte');
  const zeig = d && (d.ich || (d.pruefer && +d.einsprueche_offen)); if(!zeig){ if(k) k.remove(); return; }
  sk96Css();
  if(!k){ k = document.createElement('button'); k.type = 'button'; k.id = 'sk96Karte'; k.className = 'card'; k.onclick = () => goTab('spielerkonto'); }
  const vor = ['e95Karte', 'frKarte', 'svHello'].map(i => document.getElementById(i)).find(x => x && x.parentNode === home), soll = vor ? vor.nextSibling : home.firstChild;
  if(soll !== k) home.insertBefore(k, soll);
  const pr = (d.praemien || {}), of = d.offen || {}, tr = d.ich ? (d.training || {}).saison : null, hatPr = d.ich && (pr.regel != null || (pr.liste || []).length), saldo = d.ich ? sk96Saldo(d) : 0;
  k.setAttribute('aria-label', 'Spielerkonto öffnen');
  k.innerHTML = `<h3><span>${d.ich ? 'Dein Spielerkonto' : 'Spielerkonto'}</span><span aria-hidden="true">${typeof SVI === 'function' ? SVI('chev') : '›'}</span></h3>
    ${d.ich ? `<div class="kz">${hatPr ? `<div><small>Dein Stand</small><b style="color:${saldo > 0 ? 'var(--green,#1a8f55)' : saldo < 0 ? 'var(--red,#d14343)' : 'inherit'}">${(saldo > 0 ? '+' : '') + sk96E(sk96Eur(saldo))}</b></div>` : ''}
      <div><small>Strafen offen</small><b>${sk96E(sk96Eur(of.eur))}</b></div>${tr ? `<div><small>Training</small><b>${tr.quote} %</b></div>` : ''}</div>
      ${(d.titel || []).length ? `<div class="sk-titel">${d.titel.map(t => `<span class="sk-chip">👑 ${sk96E(t.titel)}</span>`).join('')}</div>` : ''}` : ''}
    ${d.pruefer && +d.einsprueche_offen ? `<span class="rot">${d.einsprueche_offen === 1 ? 'Eine Strafe wird hinterfragt' : d.einsprueche_offen + ' Strafen werden hinterfragt'}. Bitte ansehen.</span>` : ''}`;
}

/* ---------- Einhängen: Bereich, Startseite, Navigation ---------- */
try{ SVR_TAB.spielerkonto = null; }catch(e){}
SV_TBL.spielerkonto = ['wallet', 'Spielerkonto'];
Object.assign(SV_PAGES, { spielerkonto:['Spielerkonto', 'Dein Stand, deine Strafen, die Bestenliste deiner Mannschaft'] });
{ const _ta96 = svTabAllowed; svTabAllowed = function(t){ if(t === 'spielerkonto') return sk96Darf(); return _ta96.apply(this, arguments); }; }
{ const _gt96 = goTab; goTab = function(tab){ if(tab === 'spielerkonto') sk96Panel(); const war = svCurTab(); const r = _gt96.apply(this, arguments);
    try{ if(svCurTab() === 'spielerkonto' && war !== 'spielerkonto') sk96Oeffnen(); }catch(e){ console.warn('Spielerkonto', e); } return r; }; }
try{ HT_ZIEL.spielerkonto = ['spielerkonto', 'wallet', 'Spielerkonto', '#16a34a']; HT_TEXT.spielerkonto = 'Stand, Strafen, Bestenliste';
  Object.keys(HT_ROLLE).forEach(r => { if(!HT_ROLLE[r].z.includes('spielerkonto')) HT_ROLLE[r].z = ['spielerkonto'].concat(HT_ROLLE[r].z); }); }catch(e){}
if(typeof svCockpit === 'function'){ const _ck96 = svCockpit; let erst = true; svCockpit = function(){ const r = _ck96.apply(this, arguments);
    try{ sk96Karte(); if(typeof SVU !== 'undefined' && SVU && SVU.id) sk96Laden(erst).then(() => { const neu = erst; erst = false; sk96Karte(); if(neu && sk96Darf() && typeof htRender === 'function' && svCurTab() === 'home') htRender(); }); }catch(e){}
    return r; }; }
// Die Startseite ordnet sich bei jedem Aufbau neu. Danach rückt die Karte wieder nach oben, direkt unter Begrüßung, Fragen und Einsätze.
if(typeof htRender === 'function'){ const _hr96 = htRender; htRender = function(){ const r = _hr96.apply(this, arguments); try{ sk96Karte(); }catch(e){} return r; }; }

/* =====================================================================
   Beta 0.99.18 · Hüte an einer Stelle (150_huete.sql, docs/ROLLENKATALOG.md)
   Albert, 13.11.2026: „Es ist super wichtig, dass jeder wirklich in den richtigen Rollen drin ist und dann nur seine Ansicht hat.“
   - Mein Konto zeigt „Deine Hüte“: was die App über die eigene Rolle im Verein weiß.
   - Nutzer & Rollen zeigt je Person ihre Hüte und oben, an wen welche Mitteilung geht.
   Hüte geben keine Rechte. Sie entscheiden, wer welche Mitteilung bekommt und (ab der nächsten Version) was auf der Startseite steht.
   ===================================================================== */
const HU = { ich:null, alle:null };
const huStufe = s => s === 'leitung' ? 'Leitung' : s === 'stellv' ? 'Stellvertretung' : '';
// Hüte, bei denen „Leitung“ nichts sagt: man trägt sie oder nicht
const HU_OHNE_STUFE = ['runde', 'bereich', 'abteilungsleitung', 'technik', 'strafenkatalog', 'helferplanung', 'spieler', 'helfer', 'gast', 'kapitaen', 'spielerrat'];
function huChip(h){
  const zusatz = [HU_OHNE_STUFE.includes(h.hut) && h.stufe !== 'stellv' ? '' : huStufe(h.stufe), h.detail && h.detail !== h.titel ? h.detail : ''].filter(Boolean).join(' · ');
  return `<span class="hu-chip hu-${svEsc(h.stufe || 'team')}" data-hut="${svEsc(h.hut)}"><b>${svEsc(h.hut === 'runde' && h.detail ? h.detail : h.titel)}</b>${zusatz && h.hut !== 'runde' ? `<small>${svEsc(zusatz)}</small>` : ''}</span>`;
}
async function huMeine(force){
  if(HU.ich && !force) return HU.ich;
  try{ const { data, error } = await SVB.sb.rpc('meine_huete'); if(error) throw error; HU.ich = Array.isArray(data) ? data : []; }catch(e){ HU.ich = null; }
  return HU.ich;
}
// Mein Konto: Abschnitt „Deine Hüte“ direkt unter dem Kopf
async function huKonto(){
  const M = document.getElementById('modal'); if(!M || M.querySelector('#huKonto')) return;
  const kopf = M.querySelector('.mhead'); if(!kopf) return;
  const H = await huMeine(true); if(!H || !document.getElementById('overlay').classList.contains('open') || M.querySelector('#huKonto') || !M.contains(kopf)) return;
  const sec = document.createElement('div'); sec.className = 'editsec hu-konto'; sec.id = 'huKonto';
  sec.innerHTML = `<h4>Deine Hüte</h4>${H.length ? `<div class="hu-liste">${H.map(huChip).join('')}</div>` : '<p class="note">Für dich ist noch kein Hut hinterlegt.</p>'}
    <p class="note">So kennt dich die App im Verein. Danach richtet sich, welche Mitteilungen du bekommst. Stimmt etwas nicht, sag der Abteilungsleitung Bescheid.</p>`;
  kopf.insertAdjacentElement('afterend', sec);
}
{ const _acc97 = svAccount; svAccount = function(){ const r = _acc97.apply(this, arguments); setTimeout(() => { huKonto().catch(() => {}); }, 0); return r; }; }

// Nutzer & Rollen: Hüte je Person und die Karte „Wer bekommt was“
async function huAdmin(){
  const P = document.getElementById('panel-admin'); if(!P || typeof canManage !== 'function' || !canManage()) return;
  let U; try{ const { data, error } = await SVB.sb.rpc('huete_uebersicht'); if(error) throw error; U = data; }catch(e){ return; }
  HU.alle = U; if(!U) return;
  (U.konten || []).forEach(k => { const r = P.querySelector(`.urow[data-u="${k.id}"] .nm`); if(!r || r.querySelector('.hu-zeile')) return;
    const H = (k.huete || []).filter(h => h.hut !== 'gast'); if(!H.length) return;
    r.insertAdjacentHTML('beforeend', `<div class="hu-zeile">${H.map(huChip).join('')}</div>`); });
  P.querySelectorAll('.hu-karte').forEach(x => x.remove());
  const post = U.post || []; if(!post.length) return;
  const k = document.createElement('div'); k.className = 'card hu-karte';
  k.innerHTML = `<div class="adm-head"><div><h3 style="margin:0">Wer bekommt was</h3>
      <p style="margin:6px 0 0;font-size:13.5px">Mitteilungen gehen an den zuständigen Hut statt an alle Admins. Wer einen Hut trägt, steht im Organigramm oder ist in der App so eingetragen.</p></div></div>
    <div class="hu-post">${post.map(p => `<div class="hu-p${p.ersatz ? ' offen' : ''}" data-hup="${svEsc(p.hut)}">
      <div class="hu-was"><b>${svEsc(p.post)}</b><span>${svEsc(p.ersatz && p.hut !== 'abteilungsleitung' ? 'Abteilungsleitung' : p.titel)}</span></div>
      <div class="hu-wer">${(p.konten || []).map(n => `<i>${svEsc(n)}</i>`).join('')}${p.ersatz && p.hut !== 'abteilungsleitung' ? '<em>Kein eigener Hut vergeben, das übernimmt die Abteilungsleitung.</em>' : ''}</div></div>`).join('')}</div>`;
  const nach = P.querySelector('.zg-karte');
  if(nach) nach.insertAdjacentElement('afterend', k); else P.insertBefore(k, P.firstChild);
}
{ const _ar97 = svAdminRender; svAdminRender = async function(){ const r = await _ar97.apply(this, arguments); try{ await huAdmin(); }catch(e){} return r; }; }

(function(){ try{ const s=document.createElement('style'); s.id='svm97css'; s.textContent="/* Beta 0.99.18 · Hüte */\n.hu-liste,.hu-zeile{display:flex;flex-wrap:wrap;gap:6px}\n.hu-zeile{margin-top:6px}\n.hu-chip{display:inline-flex;align-items:baseline;gap:6px;padding:5px 10px;border-radius:999px;font-size:12.5px;line-height:1.2;background:rgba(148,163,196,.14);color:var(--ink,#eef2fb);max-width:100%}\n.hu-chip b{font-weight:650}\n.hu-chip small{font-size:11.5px;color:var(--ink3);overflow-wrap:anywhere}\n.hu-chip.hu-leitung{background:rgba(47,107,255,.18)}\n.hu-chip.hu-stellv{background:rgba(47,107,255,.10)}\n.hu-konto .hu-liste{margin:2px 0 10px}\n.hu-konto .hu-chip{font-size:13.5px;padding:7px 12px}\n.hu-post{display:flex;flex-direction:column}\n.hu-p{display:grid;grid-template-columns:minmax(0,1fr) minmax(0,1.2fr);gap:6px 16px;align-items:center;padding:12px 0;border-top:1px solid var(--line,rgba(148,163,196,.18))}\n.hu-p:first-child{border-top:0;padding-top:0}\n.hu-was{display:flex;flex-direction:column;min-width:0}\n.hu-was b{font-size:14.5px}\n.hu-was span{font-size:12.5px;color:var(--ink3)}\n.hu-wer{display:flex;flex-wrap:wrap;gap:6px;min-width:0}\n.hu-wer i{font-style:normal;font-size:13px;padding:5px 10px;border-radius:999px;background:rgba(148,163,196,.14)}\n.hu-wer em{flex-basis:100%;font-style:normal;font-size:12.5px;color:var(--ink3)}\n@media (max-width:640px){.hu-p{grid-template-columns:1fr}}\n"; document.head.appendChild(s); }catch(e){} })();
/* =====================================================================
   Beta 0.99.21 · Spieltagsstudio: eine Bildbibliothek für Spielplakat, Ergebnis und Event
   Albert, 14.11.2026: „Die App braucht auf jeden Fall die Bilder und ich muss die Möglichkeit haben, da Bilder
   selbst nochmal hochzuladen, die dann auch gespeichert werden.“
   - Alle drei Bereiche lesen dieselbe Liste aus dem Bildpool des Studios (studio_medien, Speicher „studio“).
   - „Eigenes Foto hochladen“ legt das Bild im Bildpool ab (Ordner assets/spieltag, Kategorien Foto, Hintergrund,
     Spieltag, eigene Uploads). Es bleibt gespeichert, gehört zum Konto, das es hochgeladen hat (hochgeladen_von),
     und steht danach allen im Spieltagsstudio zur Auswahl. Wer im Studio nicht bearbeiten darf, behält das Foto
     wie früher nur auf dem eigenen Gerät.
   - Als Hintergrund taugt, was an der kurzen Seite mindestens 700 Pixel hat und kein Spielerfoto, Logo, Wappen,
     QR-Code oder Zierelement ist. Löschen und Umbenennen bleibt im Studio unter „Bildpool“.
   ===================================================================== */
const SB = { bib:null, klein:700, max:2400 };
const SB_NICHT = ['spieler','person','logo','wappen','qr','element','ticker','freigestellt'];
const sbPasst = m => !!m && +m.breite >= SB.klein && +m.hoehe >= SB.klein && /\.(jpe?g|png|webp)$/i.test(m.pfad || '') && !(m.tags || []).some(t => SB_NICHT.includes(t));

// Liste aus dem Bildpool: neueste zuerst. Ohne Leserecht im Studio bleibt sie leer, die festen Motive gehen trotzdem.
async function sbBibLaden(neu){ if(SB.bib && !neu) return SB.bib;
  try{ const { data, error } = await SVB.sb.from('studio_medien').select('pfad,name,tags,breite,hoehe').gte('breite', SB.klein).order('am', { ascending:false }).limit(400);
    if(error) throw error; SB.bib = (data || []).filter(sbPasst); await tkUrls(SB.bib.map(m => m.pfad)); }
  catch(e){ console.warn('Bildbibliothek', e); SB.bib = SB.bib || []; }
  return SB.bib; }
// Bilder mit Adresse, wie die Auswahl sie zeigt
const sbListe = (n = 48) => (SB.bib || []).filter(m => tkFotoUrl(m.pfad)).slice(0, n);
// Ein gespeicherter Stand kann ein Bild nennen, das nicht in der Liste steht: Adresse nachholen
async function sbUrl(pfad){ if(!pfad) return null; if(!tkFotoUrl(pfad)) await tkUrls([pfad]); return tkFotoUrl(pfad); }

const sbSlug = n => String(n).toLowerCase().replace(/ä/g, 'ae').replace(/ö/g, 'oe').replace(/ü/g, 'ue').replace(/ß/g, 'ss').replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '').slice(0, 60) || 'bild';
// Bild einlesen, auf höchstens 2400 Pixel an der langen Seite bringen, Maße mitgeben
function sbVorbereiten(file){ return new Promise(ok => { const u = URL.createObjectURL(file), im = new Image();
  im.onerror = () => { URL.revokeObjectURL(u); ok(null); };
  im.onload = () => { const s = Math.min(1, SB.max / Math.max(im.naturalWidth, im.naturalHeight)), w = Math.round(im.naturalWidth * s), h = Math.round(im.naturalHeight * s);
    const bleibt = s === 1 && /^image\/(jpeg|webp)$/.test(file.type) && file.size <= 2.5e6;
    if(bleibt){ URL.revokeObjectURL(u); return ok({ blob:file, ext:file.type === 'image/webp' ? 'webp' : 'jpg', w, h }); }
    const c = document.createElement('canvas'); c.width = w; c.height = h; const g = c.getContext('2d');
    g.fillStyle = '#0b1220'; g.fillRect(0, 0, w, h); g.drawImage(im, 0, 0, w, h); URL.revokeObjectURL(u);
    c.toBlob(b => ok(b ? { blob:b, ext:'jpg', w, h } : null), 'image/jpeg', .9); };
  im.src = u; }); }

/* Hochladen und speichern. Antwort: { ok:true, eintrag } oder { ok:false, grund, text }
   grund 'recht': die Person darf im Studio nicht bearbeiten, der Aufrufer nimmt das Foto dann nur für dieses Gerät. */
let sbLaeuft = false;
async function sbHochladen(file){
  if(!file || !/^image\//.test(file.type || '')) return { ok:false, grund:'art', text:'Bitte ein Bild wählen (JPG, PNG oder WebP).' };
  if(file.size > 25 * 1024 * 1024) return { ok:false, grund:'gross', text:'Das Bild ist größer als 25 MB.' };
  if(sbLaeuft) return { ok:false, grund:'laeuft', text:'Ein Bild wird gerade hochgeladen.' };
  sbLaeuft = true;
  try{
    const v = await sbVorbereiten(file); if(!v) return { ok:false, grund:'art', text:'Das Bild ließ sich nicht lesen.' };
    if(Math.min(v.w, v.h) < SB.klein) return { ok:false, grund:'klein', text:`Das Bild ist zu klein (${v.w} × ${v.h}). Die kurze Seite braucht mindestens ${SB.klein} Pixel.` };
    const name = (file.name || 'Foto').replace(/\.[^.]+$/, '').replace(/[_]+/g, ' ').trim().slice(0, 60) || 'Foto';
    const pfad = `assets/spieltag/${sbSlug(name)}-${Date.now().toString(36)}.${v.ext}`;
    const up = await SVB.sb.storage.from('studio').upload(pfad, v.blob, { contentType:v.blob.type || 'image/jpeg', upsert:false });
    if(up.error){ const m = String(up.error.message || up.error), recht = /row-level security|not authorized|unauthorized|403/i.test(m + ' ' + (up.error.statusCode || up.error.status || ''));
      return { ok:false, grund:recht ? 'recht' : 'fehler', text:recht ? 'Zum Speichern fehlt dir das Recht, im Studio zu bearbeiten.' : 'Hochladen hat nicht geklappt: ' + m }; }
    const eintrag = { pfad, name, tags:['foto','hintergrund','spieltag','eigene'], breite:v.w, hoehe:v.h };
    const ins = await SVB.sb.from('studio_medien').insert({ ...eintrag, bytes:v.blob.size });
    if(ins.error){ try{ await SVB.sb.storage.from('studio').remove([pfad]); }catch(e){}
      const recht = /row-level security|permission denied/i.test(ins.error.message || '');
      return { ok:false, grund:recht ? 'recht' : 'fehler', text:recht ? 'Zum Speichern fehlt dir das Recht, im Studio zu bearbeiten.' : 'Speichern hat nicht geklappt: ' + ins.error.message }; }
    await tkUrls([pfad]); SB.bib = [eintrag, ...(SB.bib || []).filter(m => m.pfad !== pfad)];
    if(typeof ST !== 'undefined' && ST) ST.medien = null;   // der Bildpool im Studio lädt beim nächsten Öffnen neu
    return { ok:true, eintrag };
  }catch(e){ return { ok:false, grund:'fehler', text:'Hochladen hat nicht geklappt: ' + (e.message || e) }; }
  finally{ sbLaeuft = false; } }

// Knopf während des Hochladens sperren und beschriften
function sbKnopf(input, an){ const l = input && input.closest('label'); if(!l) return; l.classList.toggle('sb-laedt', !!an); l.setAttribute('aria-busy', an ? 'true' : 'false'); input.disabled = !!an;
  const t = l.querySelector('[data-sbt]'); if(t){ if(an){ t.dataset.alt = t.textContent; t.textContent = 'Lädt hoch …'; } else if(t.dataset.alt){ t.textContent = t.dataset.alt; } } }
const SB_GESPEICHERT = 'Bild gespeichert. Es steht jetzt allen im Spieltagsstudio zur Auswahl.';

(function(){ try{ const s=document.createElement('style'); s.id='svm98css'; s.textContent="/* Beta 0.99.21 · Spieltagsstudio: Bildbibliothek und eigene Fotos */\nlabel.btn.sb-up{cursor:pointer;min-height:44px!important;display:inline-flex;align-items:center;gap:6px;align-self:flex-start;margin:2px 0 8px}\n.sb-up.sb-laedt{opacity:.6;cursor:progress}\n.sb-up:focus-within{outline:2px solid var(--accent);outline-offset:2px}\n.pk-galerie{max-height:420px;overflow-y:auto;padding:2px}\n.er-bgs:not(.ev-bgs){max-height:330px;overflow-y:auto;padding:2px}\n"; document.head.appendChild(s); }catch(e){} })();
/* =====================================================================
   Beta 0.99.22 · Store-App: Dateien wirklich aufs Handy bringen
   Albert, 14.11.2026: „PNG wird gebaut und dann Plakat als PNG geladen. Aber ich habe es dann nicht auf meinem Handy.“
   In der Store-App (Capacitor) läuft die Oberfläche in einem WebView. Ein Download-Link auf eine Datei, die erst im
   Browser entsteht (blob:, data:), tut dort nichts, und Dateien teilen kann der WebView auch nicht. Betroffen waren
   alle Downloads der App: Plakate, Excel, Kalender, PDF. Die Meldung „geladen“ kam trotzdem.
   - In der Store-App fängt svm99 jeden solchen Download ab (a.click() und echte Klicks auf a[download]).
   - Weg 1, sobald ein Store-Build @capacitor/filesystem mitbringt: Datei in den Zwischenspeicher der App schreiben und
     das Teilen-Menü des Telefons öffnen (in der Galerie sichern, WhatsApp und so weiter).
   - Weg 2, heutige Builds: Datei in den eigenen Ordner im privaten Speicher app-download legen (153_app_download.sql),
     eine Adresse für zehn Minuten ausstellen und sie über einen Knopf im Browser des Telefons öffnen. Der lädt die
     Datei in „Downloads“. Den Knopf tippt die Person selbst: Fremde Adressen öffnet die Hülle nur nach einem Tipp
     zuverlässig im Browser. Alte Dateien im eigenen Ordner räumt die App beim Start und bei jeder Nutzung weg.
   Im Web bleibt alles, wie es ist.
   ===================================================================== */
// Eigene Erkennung der Hülle: svm99 steht im Bündel vor svm60, SVN gibt es beim Laden noch nicht
const SVD = { stumm:0, nr:0, alt:30 * 60000, nativ:(() => { try{ const C = window.Capacitor; return !!(C && C.isNativePlatform && C.isNativePlatform()); }catch(e){ return false; } })() };
const svdPlug = () => { try{ return (window.Capacitor && window.Capacitor.Plugins) || {}; }catch(e){ return {}; } };
const SVD_MIME = { png:'image/png', jpg:'image/jpeg', jpeg:'image/jpeg', webp:'image/webp', pdf:'application/pdf', csv:'text/csv', ics:'text/calendar', zip:'application/zip',
  json:'application/json', txt:'text/plain', html:'text/html', xlsx:'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  pptx:'application/vnd.openxmlformats-officedocument.presentationml.presentation', docx:'application/vnd.openxmlformats-officedocument.wordprocessingml.document' };
const svdE = s => svEsc(s == null ? '' : String(s));
// Dateiname für Speicher und Telefon: nur einfache Zeichen, Endung bleibt
function svdName(n){ let s = String(n || 'datei').replace(/ä/g, 'ae').replace(/ö/g, 'oe').replace(/ü/g, 'ue').replace(/Ä/g, 'Ae').replace(/Ö/g, 'Oe').replace(/Ü/g, 'Ue').replace(/ß/g, 'ss');
  try{ s = s.normalize('NFKD'); }catch(e){} s = s.replace(/[^A-Za-z0-9._ -]+/g, '').replace(/\s+/g, '-').replace(/-{2,}/g, '-').replace(/^[-.]+/, '');
  return s.slice(-90) || 'datei'; }
const svdEndung = n => (/\.([A-Za-z0-9]{1,5})$/.exec(n) || [])[1]?.toLowerCase() || '';
const svdGroesse = b => b >= 1048576 ? (b / 1048576).toFixed(1).replace('.', ',') + ' MB' : Math.max(1, Math.round(b / 1024)) + ' KB';
const svdIstDatei = a => !!a && a.hasAttribute && a.hasAttribute('download') && /^(blob:|data:)/i.test(a.getAttribute('href') || '');
async function svdKonto(){ try{ const { data } = await SVB.sb.auth.getSession(); return (data && data.session && data.session.user && data.session.user.id) || null; }catch(e){ return null; } }

// Eigene alte Dateien im Zwischenspeicher wegräumen
async function svdAufraeumen(){ try{ const uid = await svdKonto(); if(!uid) return 0;
    const { data } = await SVB.sb.storage.from('app-download').list(uid, { limit:100 });
    const alt = (data || []).filter(f => f && f.name && (!f.created_at || Date.now() - new Date(f.created_at).getTime() > SVD.alt)).map(f => uid + '/' + f.name);
    if(alt.length) await SVB.sb.storage.from('app-download').remove(alt); return alt.length; }catch(e){ return 0; } }

function svdBlatt(name){ let w = document.getElementById('svdBlatt'); if(w) w.remove();
  w = document.createElement('div'); w.id = 'svdBlatt'; w.className = 'svd-w'; w.setAttribute('role', 'dialog'); w.setAttribute('aria-modal', 'true'); w.setAttribute('aria-labelledby', 'svdTitel');
  w.innerHTML = `<div class="svd-b"><div class="svd-bild" id="svdBild" hidden></div>
    <h2 id="svdTitel">Datei wird vorbereitet</h2><p class="svd-n" id="svdName">${svdE(name)}</p>
    <div class="bar ind svd-bar" id="svdBar"><i></i></div><p class="note" id="svdText" role="status">Einen Moment …</p>
    <div class="svd-kn"><a class="btn" id="svdLaden" target="_blank" rel="noopener" hidden>${SVI('download')} Aufs Handy laden</a><button type="button" class="btn ghost" id="svdZu">Schließen</button></div></div>`;
  document.body.appendChild(w);
  const zu = () => { try{ const u = w.dataset.vorschau; if(u) URL.revokeObjectURL(u); }catch(e){} w.remove(); };
  w.querySelector('#svdZu').onclick = zu; w.addEventListener('click', e => { if(e.target === w) zu(); });
  setTimeout(() => { try{ w.querySelector('#svdZu').focus(); }catch(e){} }, 30);
  return w; }

/* Datei sichern. Antwort: 'geteilt' (Teilen-Menü), 'bereit' (Knopf zum Laden steht), 'abgebrochen' oder 'fehler'. */
async function svdSichern(quelle, name){
  const nr = ++SVD.nr; name = svdName(name); const w = svdBlatt(name);
  const q = s => w.querySelector(s), da = () => document.body.contains(w) && nr === SVD.nr;
  const fehler = t => { if(!da()) return 'fehler'; q('#svdTitel').textContent = 'Das hat nicht geklappt'; q('#svdBar').hidden = true; q('#svdText').textContent = t; return 'fehler'; };
  try{
    const blob = await quelle; if(!blob || !blob.size) return fehler('Die Datei ist leer. Bitte nochmal versuchen.');
    if(!da()) return 'abgebrochen';
    if(/^image\//.test(blob.type || SVD_MIME[svdEndung(name)] || '')){ const u = URL.createObjectURL(blob); w.dataset.vorschau = u; const b = q('#svdBild'); b.hidden = false; b.innerHTML = `<img src="${svdE(u)}" alt="Vorschau">`; }
    q('#svdName').textContent = `${name} · ${svdGroesse(blob.size)}`;
    // Weg 1: Teilen-Menü des Telefons, wenn der Store-Build das Dateisystem mitbringt
    const FS = svdPlug().Filesystem, SH = svdPlug().Share;
    if(FS && FS.writeFile && SH && SH.share){ try{
        const b64 = await new Promise((ok, nein) => { const r = new FileReader(); r.onload = () => ok(String(r.result).split(',')[1] || ''); r.onerror = () => nein(new Error('Lesen fehlgeschlagen')); r.readAsDataURL(blob); });
        const r = await FS.writeFile({ path:'teilen/' + name, data:b64, directory:'CACHE', recursive:true });
        if(r && r.uri){ try{ await SH.share({ files:[r.uri], dialogTitle:'Sichern oder teilen' }); }catch(e){ if(!/cancel|abgebrochen/i.test(String(e && e.message))) throw e; }
          if(da()) w.remove(); return 'geteilt'; } }catch(e){ console.warn('Teilen über das Dateisystem', e); } }
    // Weg 2: eigener Ordner im privaten Speicher, Adresse für zehn Minuten
    const uid = await svdKonto(); if(!uid) return fehler('Bitte neu anmelden und nochmal versuchen.');
    svdAufraeumen();
    const pfad = `${uid}/${Date.now().toString(36)}-${name}`;
    const up = await SVB.sb.storage.from('app-download').upload(pfad, blob, { contentType:blob.type || SVD_MIME[svdEndung(name)] || 'application/octet-stream', upsert:true });
    if(up.error) return fehler('Die Datei ließ sich nicht bereitstellen. Bitte nochmal versuchen. (' + String(up.error.message || up.error).slice(0, 80) + ')');
    const s = await SVB.sb.storage.from('app-download').createSignedUrl(pfad, 600, { download:name });
    const url = s.data && s.data.signedUrl; if(!url) return fehler('Die Adresse zum Laden fehlt. Bitte nochmal versuchen.');
    if(!da()) return 'abgebrochen';
    q('#svdTitel').textContent = 'Deine Datei ist fertig'; q('#svdBar').hidden = true;
    q('#svdText').textContent = 'Der Knopf öffnet den Browser deines Handys. Die Datei liegt danach unter Downloads, Bilder findest du auch in der Galerie. Der Knopf gilt zehn Minuten.';
    const a = q('#svdLaden'); a.href = url; a.hidden = false; a.onclick = () => { setTimeout(() => { if(da()) q('#svdText').textContent = 'Geöffnet. Wenn nichts passiert ist, tippe den Knopf noch einmal.'; }, 1200); };
    try{ a.focus(); }catch(e){}
    return 'bereit';
  }catch(e){ return fehler('Bitte nochmal versuchen. (' + String(e && e.message || e).slice(0, 80) + ')'); } }

if(SVD.nativ){
  const ausLink = a => { const href = a.href, name = a.getAttribute('download') || 'datei'; SVD.stumm = Date.now() + 2500;
    return svdSichern(fetch(href).then(r => r.blob()), name); };   // sofort lesen: viele Stellen geben die Adresse gleich wieder frei
  const _klick = HTMLAnchorElement.prototype.click;
  HTMLAnchorElement.prototype.click = function(){ if(svdIstDatei(this)){ ausLink(this); return; } return _klick.apply(this, arguments); };
  document.addEventListener('click', e => { const a = e.target && e.target.closest ? e.target.closest('a[download]') : null; if(a && svdIstDatei(a)){ e.preventDefault(); ausLink(a); } }, true);
  // Die alte Meldung „… geladen“ stimmt hier nicht, solange die Datei erst bereitgestellt wird
  { const _kt = kToast; kToast = function(m){ if(Date.now() < SVD.stumm && /geladen|heruntergeladen|download/i.test(String(m || ''))) return; return _kt.apply(this, arguments); }; }
  setTimeout(svdAufraeumen, 20000);
}

(function(){ try{ const s=document.createElement('style'); s.id='svm99css'; s.textContent="/* Beta 0.99.22 · Store-App: Blatt „Deine Datei ist fertig“ */\n.svd-w{position:fixed;inset:0;z-index:4000;display:flex;align-items:flex-end;justify-content:center;background:rgba(4,6,11,.62);padding:12px;padding-bottom:calc(12px + env(safe-area-inset-bottom,0px))}\n.svd-b{width:100%;max-width:440px;max-height:calc(100vh - 40px);overflow:auto;background:var(--card);color:var(--ink);border:1px solid var(--line);border-radius:22px;padding:18px;display:flex;flex-direction:column;gap:10px;box-shadow:0 24px 60px rgba(0,0,0,.4)}\n.svd-b h2{margin:0;font-size:18px;line-height:1.25}\n.svd-n{margin:0;font-size:12.5px;color:var(--ink2);overflow-wrap:anywhere}\n.svd-bild{align-self:center;max-width:100%}\n.svd-bild img{display:block;max-width:100%;max-height:34vh;border-radius:12px;border:1px solid var(--line)}\n.svd-bar{width:100%;height:4px;border-radius:9px;background:rgba(148,163,196,.2);overflow:hidden}\n.svd-bar i{display:block;height:100%;width:35%;background:var(--accent);border-radius:9px;animation:gind 1.1s ease-in-out infinite}\n.svd-b .note{margin:0}\n.svd-kn{display:flex;flex-direction:column;gap:8px;margin-top:4px}\n.svd-kn .btn{min-height:48px!important;justify-content:center;text-align:center;text-decoration:none}\n@media (min-width:700px){.svd-w{align-items:center}}\n@media (prefers-reduced-motion:reduce){.svd-bar i{animation:none;width:100%}}\n"; document.head.appendChild(s); }catch(e){} })();
/* =====================================================================
   Beta 0.99.23 · Rollen Spieler und Helfer, „Meine Mannschaft“, Prämien vorläufig (154_rollen_spieler_helfer.sql)
   Albert, 14.11.2026: „Es muss ja auch die Rolle Spieler geben, sonst sind alles nur Gäste. Die Rolle Spieler und Helfer,
   die muss es schon auch geben. Wenn es ein Spieler der ersten Mannschaft ist, soll der auch Einblick in die erste
   Mannschaft haben.“
   - Zwei neue Rollen. Beide dürfen weniger als ein Gast: kein Scouting, kein Kader, keine Bewertungen. Der Datenbestand
     wird für sie gar nicht geladen (boot.js, sieht_erste in der Datenbank).
   - Spieler: Termine, Spielerkonto und „Meine Mannschaft“ (Kader mit Name und Position, nächste Spiele, Ergebnisse,
     Tabelle). Alles nur zum Ansehen. Was am Spieler hängt, hängt an der Verknüpfung des Kontos (profiles.spieler_id),
     darum sehen es auch Spieler mit einer anderen Rolle.
   - Helfer: Termine und die eigenen Einsätze (Karte auf der Startseite, svm95).
   - Spielerkonto: Siege mit Einsatz als eigene Zahl und der Hinweis, dass die Beträge noch vorläufig sind.
   Der Trainerbereich „1. Mannschaft“ bleibt, was er war: Schreibrechte, Verletzungen, Kontaktdaten. Für Spieler nie.
   ===================================================================== */
const MT100 = { d:null, laeuft:null, am:0, zusatz:null };
const mt100E = v => svEsc(v == null ? '' : String(v));
const mt100Tag = d => { const m = /^(\d{4})-(\d{2})-(\d{2})/.exec(String(d || '')); if(!m) return String(d || '');
  const t = new Date(+m[1], +m[2] - 1, +m[3]); return ['So', 'Mo', 'Di', 'Mi', 'Do', 'Fr', 'Sa'][t.getDay()] + ', ' + m[3] + '.' + m[2] + '.'; };

/* ---------- Die beiden Rollen überall bekannt machen ---------- */
try{
  SVB.ROLE_T.spieler = 'Spieler'; SVB.ROLE_T.helfer = 'Helfer';
  SV_ROLE_INFO.spieler = { t:'Spieler', d:'Für Spieler der Ersten und Zweiten', yes:['Termine und Zusagen', 'Eigenes Spielerkonto', 'Meine Mannschaft: Kader, Spiele, Tabelle (nur ansehen)'], no:['Scouting, Kaderplanung, Bewertungen', 'Trainerbereich, Verletzungen, Kontaktdaten'] };
  SV_ROLE_INFO.helfer = { t:'Helfer', d:'Für Helferinnen und Helfer', yes:['Termine', 'Eigene Einsätze'], no:['Scouting, Kader, Mannschaften', 'Verwaltung'] };
  ['spieler', 'helfer'].forEach(r => { if(!SV_ROLES.includes(r)) SV_ROLES.push(r); if(!SV_VORSTAND_INVITE.includes(r)) SV_VORSTAND_INVITE.push(r); });
}catch(e){ console.warn('Rollen', e); }
try{ R80_ROLLE.spieler = { d:SV_ROLE_INFO.spieler.d, yes:SV_ROLE_INFO.spieler.yes, no:SV_ROLE_INFO.spieler.no }; R80_ROLLE.helfer = { d:SV_ROLE_INFO.helfer.d, yes:SV_ROLE_INFO.helfer.yes, no:SV_ROLE_INFO.helfer.no };
  ['spieler', 'helfer'].forEach(r => { if(!R80_REIHE.includes(r)) R80_REIHE.splice(Math.max(0, R80_REIHE.indexOf('viewer')), 0, r); }); }catch(e){}
try{ ST_ROLLEN.spieler = 'Spieler'; ST_ROLLEN.helfer = 'Helfer'; }catch(e){}
try{ if(!E5_ROLLEN.some(x => x[0] === 'spieler')) E5_ROLLEN.push(['spieler', 'Spieler'], ['helfer', 'Helfer']); }catch(e){}

/* ---------- Startseite und Tab-Leiste je Rolle ---------- */
try{
  HT_ZIEL.meinteam = ['meinteam', 'users', 'Meine Mannschaft', '#2563eb']; HT_TEXT.meinteam = 'Kader, Spiele, Tabelle';
  HT_ROLLE.spieler = { h:'Für dich', z:['spielerkonto', 'meinteam', 'kalender'] };
  HT_ROLLE.helfer = { h:'Für dich', z:['kalender'] };
  SV_TABBAR.spieler = ['home', 'kalender', 'meinteam', 'spielerkonto'];
  SV_TABBAR.helfer = ['home', 'kalender'];
}catch(e){ console.warn('Startseite je Rolle', e); }

/* ---------- Meine Mannschaft ---------- */
function mt100Css(){ if(document.getElementById('svm100css')) return; const s = document.createElement('style'); s.id = 'svm100css';
  s.textContent = `#panel-meinteam{display:none}#panel-meinteam.active{display:block}
.mt-wrap{display:grid;gap:14px;max-width:860px}.mt-wrap h3{margin:0 0 10px;font-size:17px}.mt-wrap .note{margin:0;color:var(--ink2);font-size:13.5px;line-height:1.5}
.mt-l{display:grid;gap:8px}.mt-z{display:grid;grid-template-columns:auto 1fr auto;gap:4px 12px;align-items:center;padding:11px 14px;border-radius:14px;background:var(--surface2,rgba(148,163,196,.1))}
.mt-z .d{color:var(--ink2);font-size:13px;font-variant-numeric:tabular-nums;min-width:74px}.mt-z .t{min-width:0;overflow-wrap:anywhere}.mt-z .t small{display:block;color:var(--ink2);font-size:13px}
.mt-z .w{font-weight:700;font-variant-numeric:tabular-nums;white-space:nowrap}.mt-z .w.s{color:var(--green,#1a8f55)}.mt-z .w.n{color:var(--red,#d14343)}
.mt-kader{display:grid;grid-template-columns:repeat(auto-fill,minmax(190px,1fr));gap:8px}
.mt-sp{display:flex;gap:10px;align-items:center;padding:9px 12px;border-radius:12px;background:var(--surface2,rgba(148,163,196,.1));min-height:44px}
.mt-nr{min-width:26px;text-align:right;font-variant-numeric:tabular-nums;font-weight:800;color:var(--brand2)}.mt-z .t small.mt-treff{color:var(--ink);margin-top:2px}.mt-z .t small.mt-treff b{font-weight:700}
.mt-sp i{font-style:normal;font-size:12px;font-weight:700;color:var(--ink2);min-width:28px}.mt-sp.ich{outline:2px solid var(--accent);outline-offset:-2px}
.mt-tab{width:100%;border-collapse:collapse;font-size:14px;font-variant-numeric:tabular-nums}.mt-tab th{font-size:12px;color:var(--ink2);font-weight:600;text-align:right;padding:6px 8px}
.mt-tab th:nth-child(2){text-align:left}.mt-tab td{padding:9px 8px;text-align:right;border-top:1px solid var(--line)}.mt-tab td:nth-child(2){text-align:left;overflow-wrap:anywhere}
.mt-tab tr.wir td{font-weight:700;background:color-mix(in srgb,var(--accent) 10%,transparent)}
.mt-scroll{overflow-x:auto}.sk-vorl{border-left:3px solid #eab308;padding:10px 14px;border-radius:12px;background:rgba(234,179,8,.12);font-size:13.5px;line-height:1.5}
@media (max-width:520px){.mt-z{grid-template-columns:1fr auto}.mt-z .d{grid-column:1/-1;min-width:0}.mt-tab .mt-weg{display:none}}`;
  document.head.appendChild(s); }
async function mt100Laden(neu){ if(MT100.laeuft) return MT100.laeuft; if(MT100.d && !neu && Date.now() - MT100.am < 60000) return MT100.d;
  MT100.laeuft = (async () => { try{ const { data, error } = await SVB.sb.rpc('meine_mannschaft'); if(error) throw error; MT100.d = data || { ok:false }; }
      catch(e){ MT100.d = MT100.d || { ok:false, grund:'fehler' }; } MT100.am = Date.now(); MT100.laeuft = null; return MT100.d; })();
  return MT100.laeuft; }
const mt100Darf = () => !!(MT100.d && MT100.d.ok);
function mt100Panel(){ let P = document.getElementById('panel-meinteam'); if(P) return P;
  const ref = document.getElementById('panel-home') || document.querySelector('.panel'); if(!ref) return null;
  P = document.createElement('section'); P.className = 'panel'; P.id = 'panel-meinteam'; ref.parentNode.insertBefore(P, ref.nextSibling); return P; }
// Treffpunkt am Spiel (165): Zeit, Ort und Hinweis vom Trainerteam
function mt100Treff(t){ if(!t || !(t.z || t.ort || t.info)) return '';
  return `<small class="mt-treff"><b>Treffpunkt${t.z ? ' ' + mt100E(t.z) + ' Uhr' : ''}</b>${t.ort ? (t.z ? ', ' : ': ') + mt100E(t.ort) : ''}${t.info ? '. ' + mt100E(t.info) : ''}</small>`; }
function mt100Render(){ const P = mt100Panel(); if(!P) return; mt100Css(); const d = MT100.d;
  if(!d){ P.innerHTML = '<div class="mt-wrap"><div class="card">Lädt …</div></div>'; return; }
  if(!d.ok){ P.innerHTML = `<div class="mt-wrap"><div class="card"><h3>Meine Mannschaft</h3><p class="note">${d.grund === 'kein_spieler' ? 'Dein Konto ist noch keinem Spieler zugeordnet. Das macht die Abteilungsleitung, danach siehst du hier deine Mannschaft.'
      : d.grund === 'keine_mannschaft' ? 'Du stehst gerade in keiner Mannschaft. Sprich die Abteilungsleitung an, wenn das nicht stimmt.' : 'Die Mannschaft lässt sich gerade nicht laden. Bitte später nochmal.'}</p></div></div>`; return; }
  const name = d.team === '2' ? '2. Mannschaft' : '1. Mannschaft';
  const spiele = (d.spiele || []).map(s => `<div class="mt-z"><span class="d">${mt100E(mt100Tag(s.datum))}${s.zeit ? ' · ' + mt100E(s.zeit) : ''}</span><span class="t">${s.heim ? 'Heim gegen ' : 'Auswärts bei '}${mt100E(s.gegner)}${s.wettbewerb ? `<small>${mt100E(s.wettbewerb)}</small>` : ''}${mt100Treff(s.treff)}</span><span></span></div>`).join('');
  const erg = (d.ergebnisse || []).map(s => { const k = s.wir > s.die ? 's' : s.wir < s.die ? 'n' : '';
    return `<div class="mt-z"><span class="d">${mt100E(mt100Tag(s.datum))}</span><span class="t">${s.heim ? 'Heim gegen ' : 'Auswärts bei '}${mt100E(s.gegner)}</span><span class="w ${k}" aria-label="${k === 's' ? 'Sieg' : k === 'n' ? 'Niederlage' : 'Unentschieden'} ${s.wir} zu ${s.die}">${s.wir}:${s.die}</span></div>`; }).join('');
  const kader = (d.kader || []).map(p => `<div class="mt-sp${p.ich ? ' ich' : ''}"><b class="mt-nr"${p.nr ? ` aria-label="Rückennummer ${p.nr}"` : ' aria-hidden="true"'}>${p.nr || ''}</b><i>${mt100E(p.pos || '')}</i><span>${mt100E(p.name)}${p.ich ? ' (du)' : ''}</span></div>`).join('');
  const tab = (d.tabelle || []).map(x => `<tr class="${x.wir ? 'wir' : ''}"><td>${x.platz}</td><td>${mt100E(x.club)}</td><td>${x.spiele ?? ''}</td><td class="mt-weg">${x.tore ?? ''}:${x.gegentore ?? ''}</td><td>${x.punkte ?? ''}</td></tr>`).join('');
  P.innerHTML = `<div class="mt-wrap">
    <div class="card"><h3>Nächste Spiele · ${mt100E(name)}</h3>${spiele ? `<div class="mt-l">${spiele}</div>` : '<p class="note">Gerade steht kein Spiel im Plan.</p>'}
      <p class="note" style="margin-top:10px">Training und deine Zusagen findest du unter Termine und oben auf der Startseite.</p></div>
    <div class="card"><h3>Letzte Ergebnisse</h3>${erg ? `<div class="mt-l">${erg}</div>` : '<p class="note">Noch keine Ergebnisse in dieser Saison.</p>'}</div>
    <div class="card"><h3>Tabelle</h3>${tab ? `<div class="mt-scroll"><table class="mt-tab"><thead><tr><th>#</th><th>Verein</th><th>Sp.</th><th class="mt-weg">Tore</th><th>Pkt.</th></tr></thead><tbody>${tab}</tbody></table></div>
      ${d.tabelle_stand ? `<p class="note" style="margin-top:8px">Stand ${mt100E(mt100Tag(d.tabelle_stand))}</p>` : ''}` : '<p class="note">Die Tabelle ist noch nicht da.</p>'}</div>
    <div class="card"><h3>Kader · ${(d.kader || []).length} Spieler</h3>${kader ? `<div class="mt-kader">${kader}</div>` : '<p class="note">Der Kader ist noch leer.</p>'}</div>
    <p class="note">Du siehst hier, was die Mannschaft betrifft. Verletzungen, Kontaktdaten und Bewertungen stehen nur dem Trainerteam offen.</p></div>`; }
async function mt100Oeffnen(){ mt100Render(); await mt100Laden(true); if(typeof svCurTab === 'function' && svCurTab() === 'meinteam') mt100Render(); }

try{ SVR_TAB.meinteam = null; }catch(e){}
SV_TBL.meinteam = ['users', 'Mannschaft'];
Object.assign(SV_PAGES, { meinteam:['Meine Mannschaft', 'Kader, nächste Spiele, Ergebnisse und Tabelle'] });
// Spieler und Helfer: nur was zu ihrer Rolle gehört. Ein Bereich darüber hinaus erscheint nur, wenn die Leitung ihn dieser Person ausdrücklich gegeben hat.
const MT100_TABS = { spieler:['home', 'kalender', 'meinteam', 'spielerkonto'], helfer:['home', 'kalender'] };
{ const _ta100 = svTabAllowed; svTabAllowed = function(t){ const r = svRole(), L = MT100_TABS[r];
    if(t === 'meinteam') return mt100Darf() || r === 'spieler';
    if(L && !L.includes(t)){ let dazu = false; try{ dazu = typeof svDarf === 'function' && svDarf(t) === true; }catch(e){} if(!dazu) return false; }
    return _ta100.apply(this, arguments); }; }
{ const _gt100 = goTab; goTab = function(tab){ if(tab === 'meinteam') mt100Panel(); const war = svCurTab(); const r = _gt100.apply(this, arguments);
    try{ if(svCurTab() === 'meinteam' && war !== 'meinteam') mt100Oeffnen(); }catch(e){ console.warn('Meine Mannschaft', e); } return r; }; }

/* ---------- Spielerkonto: Siege mit Einsatz und Hinweis auf vorläufige Beträge ---------- */
async function sk100Laden(){ try{ const { data, error } = await SVB.sb.rpc('sk_zusatz'); if(error) throw error; MT100.zusatz = data || null; }catch(e){ MT100.zusatz = MT100.zusatz || null; } return MT100.zusatz; }
function sk100Zeigen(){ const z = MT100.zusatz, W = document.querySelector('#panel-spielerkonto .sk-wrap'); if(!z || !z.ok || !W) return; mt100Css();
  if(z.regel && z.vorlaeufig && !W.querySelector('.sk-vorl')){ const n = document.createElement('p'); n.className = 'sk-vorl'; n.setAttribute('role', 'note');
    n.textContent = 'Die Beträge sind noch vorläufig. Siege und Einsätze werden schon gezählt, die genauen Werte für Prämien und Strafen legt der Verein noch fest.';
    W.insertBefore(n, W.firstChild); }
  if(z.regel && z.vorlaeufig){ const r = [...W.querySelectorAll('p.note')].find(x => /je Sieg in der Liga/.test(x.textContent) && !x.dataset.sk100);
    if(r){ r.dataset.sk100 = '1'; r.textContent = 'Vorläufig gerechnet mit ' + r.textContent.replace(/\. Die Prämie kommt/, '. Der Verein legt den Betrag noch fest. Die Prämie kommt'); } }
  const K = W.querySelector('.sk-kacheln'); if(K && z.regel && !K.querySelector('[data-sk100]')){ const k = document.createElement('div'); k.className = 'sk-k'; k.dataset.sk100 = '1';
    k.innerHTML = `<small>Siege mit Einsatz</small><b>${+z.siege || 0}</b><i>in dieser Saison</i>`; K.appendChild(k); } }
try{ const _r100 = sk96Render; sk96Render = function(){ const r = _r100.apply(this, arguments); try{ sk100Zeigen(); if(!MT100.zusatz) sk100Laden().then(sk100Zeigen); }catch(e){} return r; }; }catch(e){}

/* ---------- Funktionsrollen statt „Gast“ ----------
   Albert, 14.11.2026: „Tim Stellvertreter, Sven Abteilungsleiter. Gast ist Quatsch.“ Wer einen Bereich leitet oder vertritt, hat technisch die
   Rolle Gast plus eine Funktion im Bereich (person_funktionen, 118_funktionen.sql). Die Rechte stimmten, nur stand überall „Gast“.
   Jetzt heißt die Person überall nach ihrer Funktion: „Abteilungsleiter Partner“, „Stellvertreter Partner“. An den Rechten ändert sich nichts. */
const FR100 = { T:{ leitung:'Abteilungsleiter', stellv:'Stellvertreter', helfer:'Helfer' }, alle:null, laedt:null, ich:null };
function fr100Titel(F){ F = (F || []).filter(x => x && x.stufe && x.stufe !== 'aus'); if(!F.length) return '';
  const s = ['leitung', 'stellv', 'helfer'].find(k => F.some(x => x.stufe === k)); if(!s) return '';
  const B = F.filter(x => x.stufe === s).map(x => { try{ return SVR.titel[x.bereich] || ''; }catch(e){ return ''; } }).filter(Boolean);
  return B.length ? FR100.T[s] + ' ' + B.slice(0, 2).join(', ') + (B.length > 2 ? ' und mehr' : '') : (s === 'helfer' ? 'Helfer im Bereich' : FR100.T[s]); }
const fr100Key = () => 'sv_frolle:' + ((SVU && SVU.id) || '');
function fr100Setzen(t){ t = t || ''; const alt = window.__SV_ROLLE_T || ''; window.__SV_ROLLE_T = t;
  try{ if(t) localStorage.setItem(fr100Key(), t); else localStorage.removeItem(fr100Key()); }catch(e){}
  if(alt !== t){ try{ svHello(); }catch(e){} try{ document.querySelectorAll('[data-me-role]').forEach(el => { el.textContent = svRolleT(); }); }catch(e){} } }
// Eigene Funktionen: die eigene Zeile darf jede Person lesen. Die Titel der Bereiche kommen mit den Rechten, darum nach svrApply noch einmal.
async function fr100Ich(neu){ if(svRole() !== 'viewer' || !SVU || !SVU.id) return;
  try{ if(neu || !FR100.ich){ const { data, error } = await SVB.sb.from('person_funktionen').select('bereich,stufe').eq('user_id', SVU.id); if(error) throw error; FR100.ich = data || []; }
    fr100Setzen(fr100Titel(FR100.ich)); }catch(e){} }
// Alle Funktionen, für die Listen der Admins (Nutzung, Export). Andere Rollen dürfen fremde Zeilen nicht lesen und sehen dort weiter die Rolle.
function fr100Alle(){ if(!isAdmin()) return Promise.resolve(); if(FR100.laedt) return FR100.laedt;
  FR100.laedt = (async () => { try{ const { data, error } = await SVB.sb.from('person_funktionen').select('user_id,bereich,stufe'); if(error) throw error; FR100.alle = data || []; }catch(e){ FR100.laedt = null; } })();
  return FR100.laedt; }
function svRolleVon(u){ if(!u) return ''; const r = u.role || u.rolle || '';
  if(r === 'viewer' && u.id){ let L = []; try{ L = (typeof R80_LF !== 'undefined' && R80_LF.length ? R80_LF : FR100.alle) || []; }catch(e){}
    const t = fr100Titel(L.filter(x => x.user_id === u.id)); if(t) return t; }
  return (SVB.ROLE_T && SVB.ROLE_T[r]) || (typeof SV_ROLE_INFO !== 'undefined' && SV_ROLE_INFO[r] && SV_ROLE_INFO[r].t) || r; }
try{ if(svRole() === 'viewer') window.__SV_ROLLE_T = localStorage.getItem(fr100Key()) || ''; }catch(e){}
{ const _sa100 = svrApply; svrApply = function(){ const r = _sa100.apply(this, arguments); try{ fr100Ich(); }catch(e){} return r; }; }
function fr100Start(){ try{ fr100Ich(true); }catch(e){} try{ fr100Alle(); }catch(e){} }
try{ if(document.readyState === 'loading') document.addEventListener('DOMContentLoaded', () => setTimeout(fr100Start, 900)); else setTimeout(fr100Start, 900); }catch(e){}

/* ---------- Beim Start: wer Spieler ist, bekommt Mannschaft in Navigation und Startseite ---------- */
async function mt100Start(){ try{ await mt100Laden(); if(!mt100Darf()) return;
    Object.keys(HT_ROLLE).forEach(r => { const z = HT_ROLLE[r].z; if(!z.includes('meinteam')){ const i = z.indexOf('spielerkonto'); z.splice(i < 0 ? 0 : i + 1, 0, 'meinteam'); } });
    try{ if(typeof svBuildTabbar === 'function') svBuildTabbar(); }catch(e){}
    try{ if(typeof svCurTab === 'function' && svCurTab() === 'home' && typeof htRender === 'function') htRender(); }catch(e){}
  }catch(e){} }
try{ if(document.readyState === 'loading') document.addEventListener('DOMContentLoaded', () => setTimeout(mt100Start, 1500)); else setTimeout(mt100Start, 1500); }catch(e){}

/* =====================================================================
   Beta 0.99.24 · Bandenplan als Stadionplan (gehört zum Bandencreator, svm79.js)
   Albert, 14.11.2026, mit Fotos vom Hauptplatz: „Ich würde den Banden-Creator gern interaktiv machen, dass man wirklich sieht,
   wo seine Bande ist und welche Banden wie belegt sind. Vielleicht kann man die Banden durchnummerieren. Und es stand immer
   derselbe fremde Name mit drauf, das ist ein Fehler.“
   - Plan im Maßstab des Luftbilds (gemessen am 14.11.2026, etwa ±5 %): 400-m-Bahn, Geraden 84 m, außen rund 174 mal 89 m.
     Die Bandenreihe gegenüber vom Clubhaus ist rund 105 m lang, das passt zu 21 Banden je 5 m aus der Begehung.
   - Jede Bande hat eine laufende Nummer (155_bandenplan_stadion.sql), die für immer bei ihrem Platz bleibt.
   - Antippen im Plan oder in der Leiste darunter zeigt die Bande: wo sie hängt, wer daneben hängt, was man tun kann.
   - Je Seite steht, wie lang sie ist und wie viele Banden im neuen Maß 3 m dort passen.
   - Am Platz (Gestalten): Wer einen Platz gewählt hat, sieht links und rechts die wirklichen Nachbarn. Ohne Platz stehen neutrale
     Banden daneben. Vorher standen dort immer die ersten fünf Logos der Logoliste, also immer dieselben fremden Namen.
   ===================================================================== */
const BP = { G:84.4, RA:44.6, RI:36.5, NORD:50, SUED:48.6, RB:48.6, DICK:3.6, sel:null, NEU:3, OST:52.5, BRUCH:3, kam:null, bilder:new Map(), boxen:[], pxm:40 };
const bpE = s => svEsc(s == null ? '' : String(s));
// Länge einer Bande in Metern: wie sie heute hängt (laenge_cm, 156), sonst nach ihrem Format
const bpLaenge = p => { if(p && +p.laenge_cm > 0) return p.laenge_cm / 100; const n = parseInt(String((p && p.format) || ''), 10); return n > 0 ? n / 100 : 3; };
// Punkt an der Linie gegenüber vom Clubhaus: s in Metern, 0 ist die Mitte der Geraden, links und rechts läuft die Linie in den Bogen
function bpNordPunkt(s){ const G2 = BP.G / 2, R = BP.NORD;
  if(s < -G2){ const f = (-G2 - s) / R; return { x:-G2 - R * Math.sin(f), y:-R * Math.cos(f), w:-f * 180 / Math.PI, nx:-Math.sin(f), ny:-Math.cos(f) }; }
  if(s > G2){ const f = (s - G2) / R; return { x:G2 + R * Math.sin(f), y:-R * Math.cos(f), w:f * 180 / Math.PI, nx:Math.sin(f), ny:-Math.cos(f) }; }
  return { x:s, y:-R, w:0, nx:0, ny:-1 }; }
const bpMeter = m => String(Math.round(m * 10) / 10).replace('.', ',') + ' m';
const bpNr = p => (p && p.nummer != null ? p.nummer : (p ? p.nr : ''));
// Bandenbeitrag (0.99.25): kommt vom Server nur für Admin, Vorstand und die Leitung im Bereich Partner mit (beitrag_sicht, seit 0.99.26 auch Leitung und Stellvertretung). ja, nein, unklar oder leer (keine Angabe)
const BP_BEITRAG = { ja:'Beitrag: ja', nein:'Kein Beitrag', unklar:'Beitrag unklar' };
const bpBeitrag = p => (BC.d && BC.d.beitrag_sicht && p && p.status !== 'frei' && BP_BEITRAG[p.beitrag]) ? p.beitrag : '';
// Name für die Anzeige: Zusätze in Klammern gehören nicht auf eine Bande
const bpFirma = f => String(f || '').replace(/\s*\([^)]*\)\s*$/, '').replace(/[„“"]/g, '').trim();

/* Alle Plätze mit ihrer Lage im Plan (Meter, Mitte des Platzes ist 0/0, Norden oben), in der Reihenfolge an der Linie entlang.
   Wer vom Rasen auf eine Bande schaut, hat den Vorgänger der Linie links und den Nachfolger rechts. */
function bpReihe(){
  const P = ((BC.d && BC.d.plaetze) || []), von = k => P.filter(p => p.bereich === k).sort((a, b) => a.nr - b.nr), out = [], G2 = BP.G / 2, sum = L => L.reduce((s, p) => s + bpLaenge(p), 0);
  // Norden: das rechte Ende der Reihe liegt fest (gemessen), von dort wird nach links abgetragen: Längen und Lücken wie am Platz (156)
  const nord = von('spielplatz').concat(von('laengsseite')), lk = (p, i) => i ? Math.max(0, (+p.luecke_cm || 0) / 100) : 0; let x = BP.OST - nord.reduce((t, p, i) => t + lk(p, i) + bpLaenge(p), 0);
  nord.forEach((p, i) => { const l = bpLaenge(p); x += lk(p, i); out.push(Object.assign({ p, linie:'nord', l, s0:x, vor:lk(p, i) }, bpNordPunkt(x + l / 2))); x += l; });
  const tor = von('tor'), h = Math.ceil(tor.length / 2);
  const bogen = (L, cx, mitte, linie) => { let a = mitte - sum(L) / BP.RB / 2;
    L.forEach(p => { const l = bpLaenge(p), am = a + l / BP.RB / 2; out.push({ p, linie, x:cx + BP.RB * Math.cos(am), y:BP.RB * Math.sin(am), w:am * 180 / Math.PI + 90, nx:Math.cos(am), ny:Math.sin(am), l }); a += l / BP.RB; }); };
  bogen(tor.slice(0, h), G2, 0, 'ost');
  const sued = von('gegenseite'); let xs = sum(sued) / 2;
  sued.forEach(p => { const l = bpLaenge(p); out.push({ p, linie:'sued', x:xs - l / 2, y:BP.SUED, w:0, nx:0, ny:1, l }); xs -= l; });
  bogen(tor.slice(h), -G2, Math.PI, 'west');
  return out;
}
// Nachbarn an derselben Linie: { links, rechts } vom Rasen aus gesehen
function bpNeben(id){ const R = bpReihe(), i = R.findIndex(s => s.p.id === id); if(i < 0) return { links:null, rechts:null, linie:[], i:-1 };
  // Wer mehr als drei Meter weg hängt, ist kein Nachbar: dort beginnt ein neues Stück der Reihe
  const A = R.filter(s => s.linie === R[i].linie), k0 = A.findIndex(s => s.p.id === id); let a = k0, b = k0; while(a > 0 && (A[a].vor || 0) <= BP.BRUCH) a--; while(b < A.length - 1 && (A[b + 1].vor || 0) <= BP.BRUCH) b++;
  const L = A.slice(a, b + 1), k = k0 - a; return { links:L[k - 1] || null, rechts:L[k + 1] || null, linie:L, i:k }; }
function bpWo(p){ const b = bcBereich(p.bereich).titel, n = bpNeben(p.id), t = s => s ? (s.p.status === 'frei' ? 'Bande ' + bpNr(s.p) + ' (frei)' : bpFirma(s.p.firma) || 'Bande ' + bpNr(s.p)) : '';
  if(n.i < 0) return b;
  return b + (n.links && n.rechts ? `, zwischen ${t(n.links)} und ${t(n.rechts)}` : n.links ? `, rechts neben ${t(n.links)}, am Ende der Reihe` : n.rechts ? `, links neben ${t(n.rechts)}, am Anfang der Reihe` : ''); }
// Wie viele Banden im neuen Maß passen auf eine Seite
function bpKap(b){ const P = ((BC.d && BC.d.plaetze) || []).filter(p => p.bereich === b.key), l = +b.laenge_m || 0;
  return { l, heute:P.filter(p => p.status !== 'frei').length, plaetze:P.length, neu:l ? Math.floor(l / BP.NEU + 1e-6) : null }; }

/* ---------- Der Plan ---------- */
function bpSvg(){
  const R = bpReihe(), G2 = BP.G / 2, D = BP.DICK, sel = BP.sel, f = n => (+n).toFixed(2);
  const oval = r => `M${-G2},${-r} L${G2},${-r} A${r},${r} 0 0 1 ${G2},${r} L${-G2},${r} A${r},${r} 0 0 1 ${-G2},${-r} Z`;
  const tx = (x, y, t, o) => `<text x="${x}" y="${y}" class="bp-t" text-anchor="${(o && o.a) || 'middle'}"${o && o.r ? ` transform="rotate(${o.r} ${x} ${y})"` : ''}>${bpE(t)}</text>`;
  const slots = R.map(s => `<g class="bp-s ${s.p.status}${bpBeitrag(s.p) ? ' b-' + bpBeitrag(s.p) : ''}${sel === s.p.id ? ' an' : ''}" data-bp="${s.p.id}" transform="translate(${f(s.x)} ${f(s.y)}) rotate(${(+s.w).toFixed(1)})"><title>Bande ${bpNr(s.p)}: ${bpE(s.p.status === 'frei' ? 'frei' : bpFirma(s.p.firma))}</title><rect x="${f(-s.l / 2 + .22)}" y="${f(-D / 2)}" width="${f(s.l - .44)}" height="${D}" rx=".7"/></g>`).join('');
  const nummern = R.map(s => (s.l >= 4 || bpNr(s.p) % 2 === 1) ? `<text class="bp-nr" x="${f(s.x + s.nx * 4.6)}" y="${f(s.y + s.ny * 4.6)}" text-anchor="middle" dominant-baseline="central">${bpNr(s.p)}</text>` : '').join('');
  const a = R.find(s => s.p.id === sel), zeig = a ? `<g class="bp-zeig"><line x1="${f(a.x + a.nx * 2)}" y1="${f(a.y + a.ny * 2)}" x2="${f(a.x + a.nx * 7)}" y2="${f(a.y + a.ny * 7)}"/><circle cx="${f(a.x + a.nx * 11.2)}" cy="${f(a.y + a.ny * 11.2)}" r="5.4"/><text x="${f(a.x + a.nx * 11.2)}" y="${f(a.y + a.ny * 11.2)}" text-anchor="middle" dominant-baseline="central">${bpNr(a.p)}</text></g>` : '';
  return `<svg viewBox="-106 -70 212 140" role="img" aria-label="Plan vom Hauptplatz mit allen Banden. Die Leiste darunter nennt jede Bande einzeln.">
    <path d="${oval(BP.RA)}" fill="#b56a45"/><path d="${oval(BP.RI)}" fill="#5c9443"/>
    <g fill="none" stroke="rgba(255,255,255,.82)" stroke-width=".55"><rect x="-50" y="-32" width="100" height="64"/><line x1="0" y1="-32" x2="0" y2="32"/><circle cx="0" cy="0" r="9.15"/>
      <rect x="-50" y="-20.15" width="16.5" height="40.3"/><rect x="33.5" y="-20.15" width="16.5" height="40.3"/><rect x="-50" y="-9.15" width="5.5" height="18.3"/><rect x="44.5" y="-9.15" width="5.5" height="18.3"/></g>
    <rect x="-6" y="55" width="60" height="11" rx="1.2" fill="#d9d2c3" stroke="#8a8377" stroke-width=".4"/>
    ${tx(24, 62.2, 'Clubhaus')}${tx(-62, -61, 'Spielplatz')}${tx(-101, 0, 'Kunstrasen', { r:-90 })}${tx(101, 0, 'Schulstraße', { r:90 })}
    ${slots}<g class="bp-nrn" aria-hidden="true">${nummern}</g>${zeig}</svg>`;
}
function bpKarte(s){ const p = s.p, frei = p.status === 'frei';
  return `<button type="button" role="option" aria-selected="${BP.sel === p.id}" class="bp-k ${p.status}${BP.sel === p.id ? ' an' : ''}" data-bp="${p.id}"><b>${bpNr(p)}</b><span>${frei ? 'Frei' : bpE(bpFirma(p.firma))}</span><small>${bpE(bpMeter(s.l))}${p.status === 'reserviert' ? ' · reserviert' : ''}</small>${bpBeitrag(p) && bpBeitrag(p) !== 'ja' ? `<em class="bp-bt ${bpBeitrag(p)}">${bpBeitrag(p) === 'nein' ? 'kein Beitrag' : 'unklar'}</em>` : ''}</button>`; }
// Beitrag in der Einzelansicht: nur für die, die ihn sehen dürfen, mit Notiz und Knopf zum Ändern
function bpBeitragZeile(p){ if(!(BC.d && BC.d.beitrag_sicht) || !p || p.status === 'frei') return ''; const b = BP_BEITRAG[p.beitrag] ? p.beitrag : '';
  return `<div class="bp-beitrag ${b || 'leer'}"><div><b>${b ? BP_BEITRAG[b] : 'Beitrag: keine Angabe'}</b>${p.beitrag_notiz ? `<span>${bpE(p.beitrag_notiz)}</span>` : ''}<small>Das sehen nur Admin, Vorstand und die Leitung im Bereich Partner.</small></div><button type="button" class="pz-tc-k leise" data-bpbeitrag="${p.id}">Ändern</button></div>`; }
function bpBeitragDialog(id, I){ const p = bcPlatz(id); if(!p) return; const akt = BP_BEITRAG[p.beitrag] ? p.beitrag : '';
  const M = svModal(`<div class="mhead"><div><h2 style="margin:0">Bandenbeitrag</h2><div class="msub">${bpE('Bande ' + bpNr(p) + (p.firma ? ' · ' + bpFirma(p.firma) : ''))}</div></div></div>
    <div class="bp-bwahl" role="radiogroup" aria-label="Zahlt der Partner für diese Bande?">${[['ja', 'Ja, zahlt'], ['nein', 'Kein Beitrag'], ['unklar', 'Unklar'], ['', 'Keine Angabe']].map(([k, t]) => `<label><input type="radio" name="bpBw" value="${k}"${k === akt ? ' checked' : ''}><span>${t}</span></label>`).join('')}</div>
    <label class="pz-tc-dlgf"><span>Notiz (nur intern)</span><textarea id="bpBwNotiz" maxlength="300" rows="3">${bpE(p.beitrag_notiz || '')}</textarea></label>
    <div class="pz-tc-dlgk"><button type="button" class="btn" id="bpBwOk">Speichern</button><button type="button" class="btn ghost" id="bpBwNein">Abbrechen</button></div>`);
  M.querySelector('#bpBwNein').onclick = () => closeOverlay();
  M.querySelector('#bpBwOk').onclick = () => paEinmal(M.querySelector('#bpBwOk'), async () => { const w = M.querySelector('input[name="bpBw"]:checked');
    try{ await bcRpc('bandenplatz_beitrag', { p:{ platz:p.id, beitrag:w ? w.value : '', notiz:M.querySelector('#bpBwNotiz').value } }); closeOverlay(); await bcLaden(true); bcAnsichtZeigen(); kToast('Beitrag für Bande ' + bpNr(p) + ' ist gespeichert.'); }catch(e){ kToast(e.message); } }, 'Speichert …'); }
function bpPlanHtml(){
  const d = BC.d, P = d.plaetze || [], z = st => P.filter(p => p.status === st).length, R = bpReihe().slice().sort((a, b) => (a.p.nummer || 999) - (b.p.nummer || 999));
  const K = (d.bereiche || []).map(b => ({ b, k:bpKap(b) })), neuSumme = K.reduce((s, x) => s + (x.k.neu || 0), 0), heute = z('belegt') + z('reserviert');
  const p = BP.sel ? bcPlatz(BP.sel) : null;
  return `<section class="pz-tc-block bp" aria-label="Plan vom Hauptplatz"><div class="pz-tc-bk"><h3>Rund um den Platz</h3><span class="pz-tc-zahl">${z('frei')} frei</span></div>
      <div class="pz-bc-schema bp-plan" id="bpPlan">${bpSvg()}</div>
      <div class="pz-bc-legende"><span><i class="frei"></i>Frei ${z('frei')}</span><span><i class="res"></i>Reserviert ${z('reserviert')}</span><span><i class="bel"></i>Belegt ${z('belegt')}</span>${d.beitrag_sicht && P.some(x => bpBeitrag(x)) ? `<span class="bp-lb"><i class="bnein"></i>Kein Beitrag ${P.filter(x => bpBeitrag(x) === 'nein').length}</span><span class="bp-lb"><i class="bunklar"></i>Unklar ${P.filter(x => bpBeitrag(x) === 'unklar').length}</span>` : ''}</div>
      ${bpRundHtml()}
      <div class="bp-leiste" id="bpLeiste" role="listbox" aria-label="Alle Banden der Reihe nach">${R.map(bpKarte).join('')}</div>
      <div class="bp-detail" id="bpDetail" aria-live="polite">${p ? `<p class="bp-wo"><b>Bande ${bpNr(p)}</b> ${bpE(bpWo(p))}</p>${bpFotoHtml(p)}${bcPlatzZeile(p, !!d.admin)}${bpBeitragZeile(p)}${bpLaufzeitZeile(p)}` : '<p class="pz-tc-tipp">Tipp im Plan oder in der Leiste auf eine Bande. Dann siehst du, wo sie hängt, wer daneben hängt und was frei ist.</p>'}</div>
      <p class="pz-tc-tipp">Plan nach dem Luftbild, gemessen am 14.11.2026, etwa auf 5 Prozent genau. Die Lage der Linien am Spielfeld ist geschätzt.</p></section>
    ${bpVorschauHtml()}<section class="pz-tc-block bp-kap" aria-label="Wie viele Banden passen"><div class="pz-tc-bk"><h3>Wie viele Banden passen</h3><span class="pz-tc-zahl">bis zu ${neuSumme}</span></div>
      <div class="bp-kapl">${K.map(x => `<div class="bp-kz"><b>${bpE(x.b.titel)}</b><span>${x.k.l ? bpE(bpMeter(x.k.l)) + ' lang' : 'noch nicht gemessen'} · heute ${x.k.heute} ${x.k.heute === 1 ? 'Bande' : 'Banden'}</span><strong>${x.k.neu != null ? x.k.neu : '?'}</strong></div>`).join('')}</div>
      <p class="pz-tc-tipp">Heute ${heute === 1 ? 'hängt eine Bande' : 'hängen ' + heute + ' Banden'}, die meisten 5 m lang. Die Zahl rechts sagt, wie viele Banden im neuen Maß ${BP.NEU} m auf die Seite passen, wenn sie ohne Lücke stehen. Vor dem Clubhaus und hinter den Toren ist das die Obergrenze: Zugänge, Tore und die Sicht von der Terrasse gehen davon ab.</p></section>`;
}
function bpWaehlen(id, I, ausRund){ BP.sel = BP.sel === id && !ausRund ? null : id; const L = I.querySelector('#bpLeiste'), sl = L ? L.scrollLeft : 0;
  if(BP.sel && !ausRund){ const t = bpRundTafeln().find(x => x.id === BP.sel); if(t) BP.kam = t.x0 + t.l / 2; }
  bcPlan(I);
  const L2 = I.querySelector('#bpLeiste'); if(L2){ L2.scrollLeft = sl; const k = L2.querySelector('.bp-k.an'); if(k){ try{ const a = k.offsetLeft, b = a + k.offsetWidth; if(a < L2.scrollLeft + 8 || b > L2.scrollLeft + L2.clientWidth - 8) L2.scrollLeft = Math.max(0, a - (L2.clientWidth - k.offsetWidth) / 2); }catch(e){} } } }
function bpPlanBinden(I){
  bpRundBinden(I);
  I.querySelectorAll('#bpLeiste [data-bp]').forEach(b => b.onclick = () => bpWaehlen(b.dataset.bp, I));
  I.querySelectorAll('[data-bpbeitrag]').forEach(b => b.onclick = () => bpBeitragDialog(b.dataset.bpbeitrag, I));
  bpLaufzeitBinden(I);
  const svg = I.querySelector('#bpPlan svg'); if(!svg) return;
  svg.addEventListener('click', e => { const g = e.target.closest && e.target.closest('[data-bp]'); if(g){ bpWaehlen(g.dataset.bp, I); return; }
    // daneben getippt: die nächste Bande nehmen, wenn sie nah genug ist (auf dem Handy sind die Banden schmal)
    try{ const m = svg.getScreenCTM().inverse(), pt = svg.createSVGPoint(); pt.x = e.clientX; pt.y = e.clientY; const q = pt.matrixTransform(m); let best = null, bd = 1e9;
      bpReihe().forEach(s => { const dd = Math.hypot(s.x - q.x, s.y - q.y); if(dd < bd){ bd = dd; best = s; } }); if(best && bd < 12) bpWaehlen(best.p.id, I); }catch(x){} });
}

/* ---------- Am Platz: die wirklichen Nachbarn ---------- */
// Logo zu einer Firma am Platz: nur wenn genau ein Logo passt, sonst steht der Name als Schrift da
function bpLogoZu(firma){ const n = s => String(s || '').toLowerCase().replace(/ä/g, 'ae').replace(/ö/g, 'oe').replace(/ü/g, 'ue').replace(/ß/g, 'ss').replace(/[^a-z0-9]/g, ''), f = n(bpFirma(firma)); if(f.length < 4) return null;
  const L = ((BC.d && BC.d.logos) || []).filter(l => l.bild), genau = L.filter(l => n(l.firma) === f); if(genau.length) return genau[0];
  const T = L.filter(l => { const g = n(l.firma); return g.length >= 4 && (f.includes(g) || g.includes(f)); }); return T.length === 1 ? T[0] : null; }
// Für die Szene: Platz i neben der eigenen Bande. false = hier endet die Reihe, { frei } = freier Platz, { spec } = belegt
function bpNachbarPlan(id){ const n = bpNeben(id); if(n.i < 0) return null; const out = {};
  for(let i = -2; i <= 9; i++){ if(i === 0) continue; const s = n.linie[n.i + i]; if(!s){ out[i] = false; continue; }
    const p = s.p, name = bpFirma(p.firma); if(p.status === 'frei' || !name || /pr[üu]fen/i.test(p.firma || '')){ out[i] = { frei:p.status === 'frei', nr:bpNr(p) }; continue; }
    const l = bpLogoZu(p.firma); out[i] = { nr:bpNr(p), spec:{ stil:'ci', layout:'links', firma:name, name, logo:l ? l.bild : null, kontakt:false, nameAn:!l } }; }
  return out; }

// Das Foto der gewählten Bande, groß und unverzerrt (0.99.34). Hat der Platz eine Grundfarbe, zeigt der Rundgang ein Schild mit dem Namen,
// weil das Foto nur einen Ausschnitt der Tafel zeigt: Dann steht das hier dabei.
function bpFotoHtml(p){ if(!p || !p.bild) return '';
  return `<figure class="bp-foto"><img src="${bpE(p.bild)}" alt="Foto der Bande ${bpNr(p)}${p.firma ? ', ' + bpE(bpFirma(p.firma)) : ''}" loading="lazy" decoding="async">${p.farbe ? '<figcaption>Das Foto zeigt nur einen Ausschnitt der Tafel. Im Rundgang steht deshalb ein Schild mit dem Namen.</figcaption>' : ''}</figure>`; }

/* ---------- So hängt es heute: die Reihe in 3D (0.99.25) ---------- */
// Die Tafeln der Reihe gegenüber vom Clubhaus, mit Lage, Länge, Foto und Nummer
function bpRundTafeln(){ return bpReihe().filter(s => s.linie === 'nord').map(s => ({ id:s.p.id, x0:s.s0, l:s.l, h:.8, frei:s.p.status === 'frei', nr:bpNr(s.p), name:bpFirma(s.p.firma), farbe:s.p.farbe || null, bild:s.p.bild || null, an:BP.sel === s.p.id, ring:bpBeitrag(s.p) === 'nein' ? '#d92d20' : bpBeitrag(s.p) === 'unklar' ? '#e0a100' : null })); }
function bpRundBild(url, neu){ if(!url) return null; let i = BP.bilder.get(url); if(!i){ i = new Image(); i.onload = () => { try{ neu(); }catch(e){} }; i.onerror = () => {}; i.src = url; BP.bilder.set(url, i); } return i; }
function bpRundHtml(){ const T = bpRundTafeln(); if(!T.length) return '';
  return `<div class="bp-rund" id="bpRund"><canvas id="bpRundCv" role="img" aria-label="Die Bandenreihe gegenüber vom Clubhaus in 3D, so wie sie heute hängt. Die Leiste darunter nennt jede Bande einzeln."></canvas>
      <div class="bp-rundk"><button type="button" class="bp-rb" data-bprund="-1" aria-label="Eine Bande nach links">${SVI('chev')}</button><span id="bpRundWo" aria-live="polite"></span><button type="button" class="bp-rb" data-bprund="1" aria-label="Eine Bande nach rechts">${SVI('chev')}</button></div></div>
      <p class="pz-tc-tipp">So hängen die Banden heute, vom Rasen aus gesehen: in ihrer wirklichen Länge, mit Lücken und mit ihrem Foto, wo es eines gibt. Zieh das Bild zur Seite oder nimm die Pfeile.${BC.d && BC.d.beitrag_sicht && T.some(t => t.ring) ? ' Roter Ring um die Nummer: kein Bandenbeitrag in der Übersicht. Gelber Ring: unklar.' : ''}</p>`; }
function bpRundMalen(){ const cv = document.getElementById('bpRundCv'); if(!cv || typeof BANDE === 'undefined' || !BANDE.reihe) return; const T = bpRundTafeln(); if(!T.length) return;
  const a = Math.min(...T.map(t => t.x0)), b = Math.max(...T.map(t => t.x0 + t.l));
  if(BP.kam == null){ const sel = T.find(t => t.an), haupt = bpReihe().find(s => s.linie === 'nord' && s.p.bereich === 'laengsseite'); BP.kam = sel ? sel.x0 + sel.l / 2 : haupt ? haupt.s0 + 7.5 : (a + b) / 2; }
  BP.kam = Math.max(a - 2, Math.min(b + 2, BP.kam));
  T.forEach(t => { t.img = bpRundBild(t.bild, bpRundMalen); });
  const r = BANDE.reihe(cv, { tafeln:T, kamX:BP.kam }); BP.boxen = r.boxen; BP.pxm = r.pxm || 40;
  const wo = document.getElementById('bpRundWo'), nah = T.slice().sort((x, y) => Math.abs(x.x0 + x.l / 2 - BP.kam) - Math.abs(y.x0 + y.l / 2 - BP.kam))[0];
  if(wo && nah) wo.textContent = `Bande ${nah.nr}: ${nah.frei ? 'frei' : nah.name} · ${bpMeter(nah.l)}`; }
function bpRundBinden(I){ const cv = I.querySelector('#bpRundCv'); if(!cv) return;
  let roh = null; const mal = () => { if(roh) return; roh = requestAnimationFrame(() => { roh = null; bpRundMalen(); }); };
  bpRundMalen();
  const T = () => bpRundTafeln(), mitte = t => t.x0 + t.l / 2;
  I.querySelectorAll('[data-bprund]').forEach(b => b.onclick = () => { const L = T(), d = +b.dataset.bprund, i = L.map(mitte).reduce((bi, m, k, A) => Math.abs(m - BP.kam) < Math.abs(A[bi] - BP.kam) ? k : bi, 0), z = L[Math.max(0, Math.min(L.length - 1, i + d))]; if(z){ BP.kam = mitte(z); mal(); } });
  let st = null;
  cv.addEventListener('pointerdown', e => { st = { x:e.clientX, k:BP.kam, weg:0 }; try{ cv.setPointerCapture(e.pointerId); }catch(x){} });
  cv.addEventListener('pointermove', e => { if(!st) return; const dx = e.clientX - st.x; st.weg = Math.max(st.weg, Math.abs(dx)); BP.kam = st.k - dx / Math.max(8, BP.pxm); mal(); });
  const ende = e => { if(!st) return; const tipp = st.weg < 7; st = null; if(!tipp) return;
    const r = cv.getBoundingClientRect(), px = e.clientX - r.left, py = e.clientY - r.top, t = (BP.boxen || []).filter(b => px >= b.x - 4 && px <= b.x + b.w + 4 && py >= b.y - 30 && py <= b.y + b.h + 14).sort((a, b) => a.w - b.w).pop();
    if(t) bpWaehlen(t.id, I, true); };
  cv.addEventListener('pointerup', ende); cv.addEventListener('pointercancel', () => { st = null; });
  cv.addEventListener('keydown', e => { if(e.key === 'ArrowLeft' || e.key === 'ArrowRight'){ BP.kam += e.key === 'ArrowLeft' ? -2.5 : 2.5; mal(); e.preventDefault(); } }); cv.tabIndex = 0;
  if(!BP.rundGroesse){ BP.rundGroesse = true; window.addEventListener('resize', () => { if(document.getElementById('bpRundCv')) bpRundMalen(); }); }
}

/* ---------- Laufzeit, Verlängerung, Notizen und Vorschau (0.99.27) ----------
   Albert, 14.11.2026: „Dass wir sehen, wie lange eine Bande bezahlt und gebucht ist, ob automatisch verlängern drin ist, dass man Notizen
   machen kann, und eine Voraussicht: welche Banden sind belegt, welche nächste und übernächste Saison.“
   Nur für Admin, Vorstand und die Leitung im Bereich Partner (beitrag_sicht). Grundlage: Werbevertrag 2024 (ein Jahr, verlängert sich von
   selbst, kündbar bis einen Monat vor Ablauf). Eine Saison zählt als belegt, wenn die Laufzeit über ihren 1. Januar reicht. */
const bpSicht = () => !!(BC.d && BC.d.beitrag_sicht);
const bpDatum = d => { const m = /^(\d{4})-(\d{2})-(\d{2})/.exec(String(d || '')); return m ? `${m[3]}.${m[2]}.${m[1]}` : ''; };
const bpEuro = v => (Math.round((+v || 0) * 100) / 100).toLocaleString('de-DE', { minimumFractionDigits:(+v || 0) % 1 ? 2 : 0, maximumFractionDigits:2 }) + ' €';
// Die laufende Saison beginnt am 1. Juli. Rückgabe: Startjahre von dieser, nächster und übernächster Saison
function bpSaisons(heute){ const d = heute || new Date(), y = d.getMonth() >= 6 ? d.getFullYear() : d.getFullYear() - 1; return [y, y + 1, y + 2]; }
const bpSaisonT = y => y + '/' + String((y + 1) % 100).padStart(2, '0');
