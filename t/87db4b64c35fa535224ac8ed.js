  if(!x){ if(k) k.remove(); return; }
  if(!k){ k = document.createElement('section'); k.id = 'shHome'; k.className = 'card sh-home'; k.setAttribute('aria-label', 'Stadionheft'); }
  const fr = document.getElementById('frKarte'), hello = document.getElementById('svHello'), nach = (fr && fr.parentNode === home) ? fr : (hello && hello.parentNode === home ? hello : null);
  if(k.parentNode !== home || k.previousElementSibling !== nach) home.insertBefore(k, nach ? nach.nextSibling : home.firstChild);
  const wann = x.tage < 0 ? 'Die Abgabe war am ' + shDatum(x.abgabe) : x.tage === 0 ? 'Abgabe an die Druckerei ist heute' : x.tage === 1 ? 'Abgabe an die Druckerei ist morgen' : 'Abgabe an die Druckerei ist in ' + x.tage + ' Tagen, am ' + shDatum(x.abgabe);
  k.innerHTML = `<h3 class="sh-k">Stadionheft</h3><p class="sh-hot"><b>${shE(x.titel)}</b> ${x.ruhig ? 'ist in Arbeit. Texte und Fotos kannst du schon setzen' + (x.abgabe ? ', Abgabe an die Druckerei ist am ' + shE(shDatum(x.abgabe)) : '') : 'ist noch nicht freigegeben. ' + shE(wann)}.</p>
    <div class="sh-akt">${x.freigeben && !x.ruhig ? '<button type="button" class="btn" data-sh-hf="ja">Freigeben</button><button type="button" class="btn ghost" data-sh-hf="nein">Noch nicht</button>' : ''}${x.redaktion ? `<button type="button" class="btn${x.ruhig ? '' : ' ghost'}" id="shHomeHeft">Heft öffnen</button>` : '<button type="button" class="btn ghost" id="shHomeAuf">Ansehen</button>'}</div>`;
  const heft = k.querySelector('#shHomeHeft'); if(heft) heft.onclick = () => { shVoll(typeof hvOeffnen === 'function' ? () => hvOeffnen(x.id) : null); };
  k.querySelectorAll('[data-sh-hf]').forEach(b => b.onclick = () => shFreigabeDialog({ id:x.id, titel:x.titel, abgabe:x.abgabe }, b.dataset.shHf === 'ja'));
  const auf = k.querySelector('#shHomeAuf'); if(auf) auf.onclick = () => { SPO.view = 'stadionheft'; goTab('sponsoring'); };
}
if(typeof htRender === 'function'){ const _h = htRender; htRender = function(){ const r = _h.apply(this, arguments); try{ shHomeKarte(false); }catch(e){} return r; }; }

(function(){ try{ const s=document.createElement('style'); s.id='svm103css'; s.textContent="/* 0.99.29: Stadionheft im Partnerbereich (svm103.js) */\n.sh{display:flex;flex-direction:column;gap:0;}\n.sh h2{margin:0 0 2px;font-size:20px;font-weight:800;letter-spacing:-.02em;color:var(--ink);}\n.sh-sub{margin:0!important;font-size:14px;}\n.sh-kopf{display:flex;justify-content:space-between;align-items:flex-start;gap:10px;flex-wrap:wrap;margin-bottom:6px;}\n.sh-kopf h3{margin-bottom:4px!important;}\n.sh-leer{margin:0 0 12px!important;}\n.sh-pill{display:inline-flex;align-items:center;border-radius:999px;padding:4px 11px;font-size:12.5px;font-weight:700;white-space:nowrap;line-height:1.3;}\n.sh-pill.ok{background:rgba(34,197,94,.16);color:var(--ok);}\n.sh-pill.warn{background:rgba(245,158,11,.18);color:var(--warn);}\n.sh-pill.bad{background:rgba(240,82,82,.16);color:var(--bad);}\n.sh-pill.gr{background:rgba(148,163,196,.14);color:var(--ink2);}\n.sh-st{display:grid;grid-template-columns:28px 1fr auto;gap:12px;align-items:center;padding:11px 0;border-top:1px solid var(--line);}\n.sh-st b{display:block;font-size:15px;color:var(--ink);}\n.sh-st small{display:block;font-size:13px;color:var(--ink2);line-height:1.4;}\n.sh-pk{width:26px;height:26px;border-radius:50%;display:grid;place-items:center;font-size:13px;font-weight:800;}\n.sh-pk.ok{background:var(--ok);color:#fff;}\n.sh-pk.jetzt{background:var(--brand);color:#fff;}\n.sh-pk.offen{border:2px solid var(--line);color:var(--ink3);}\n.sh-akt{display:flex;flex-wrap:wrap;gap:8px;margin-top:12px;}\n.sh-akt .btn{min-height:46px;flex:1 1 150px;}\n.sh-notiz{margin:8px 0 0!important;}\n.sh-stufe{margin:12px 0 0!important;font-size:12.5px;}\n.sh-zs{position:relative;padding-left:26px;margin-top:4px;}\n.sh-zs:before{content:\"\";position:absolute;left:9px;top:6px;bottom:10px;width:2px;background:var(--line);}\n.sh-e{position:relative;padding:0 0 14px;}\n.sh-e:before{content:\"\";position:absolute;left:-23px;top:3px;width:14px;height:14px;border-radius:50%;background:var(--card);border:3px solid var(--brand);box-sizing:border-box;}\n.sh-e.rot:before{border-color:var(--bad);}\n.sh-e.gr:before{border-color:var(--ok);}\n.sh-e em{display:block;font-style:normal;font-size:12px;font-weight:700;color:var(--ink3);letter-spacing:.02em;}\n.sh-e b{display:block;font-size:15px;color:var(--ink);}\n.sh-e span{display:block;font-size:13.5px;color:var(--ink2);line-height:1.45;}\n.sh-aus{font-weight:600;}\n.sh-zahlen{display:grid;grid-template-columns:repeat(4,1fr);gap:8px;margin:4px 0 10px;}\n.sh-zahlen div{border:1px solid var(--line);border-radius:14px;padding:10px 4px;text-align:center;background:rgba(148,163,196,.06);}\n.sh-zahlen b{display:block;font-size:22px;font-weight:800;color:var(--ink);font-variant-numeric:tabular-nums;}\n.sh-zahlen span{display:block;font-size:11.5px;color:var(--ink2);line-height:1.2;}\n.sh-zahlen .ok b{color:var(--ok);}.sh-zahlen .warn b{color:var(--warn);}.sh-zahlen .bad b{color:var(--bad);}\n.sh-sum{margin:0 0 10px!important;font-size:14px;}\n.sh-chips,.sh-vor{display:flex;gap:6px;flex-wrap:wrap;margin:0 0 8px;}\n.sh-vor{grid-column:1/-1;}\n.sh-chip{font:inherit;font-size:13px;font-weight:700;border:1.5px solid var(--line);border-radius:999px;padding:9px 13px;min-height:40px;background:transparent;color:var(--ink2);cursor:pointer;}\n.sh-chip.on{background:var(--brand);border-color:var(--brand);color:#fff;}\n.sh-az{display:grid;grid-template-columns:42px 1fr auto;gap:11px;align-items:center;width:100%;padding:10px 0;border:0;border-top:1px solid var(--line);background:none;color:inherit;font:inherit;text-align:left;min-height:60px;}\nbutton.sh-az{cursor:pointer;}\n.sh-liste .sh-az:first-child{border-top:0;}\n.sh-logo{width:42px;height:42px;border-radius:11px;border:1px solid var(--line);background:rgba(148,163,196,.1);display:grid;place-items:center;font-weight:800;font-size:13px;color:var(--ink2);}\n.sh-azt{min-width:0;}\n.sh-azt b{display:block;font-size:14.5px;color:var(--ink);overflow-wrap:anywhere;}\n.sh-azt small{display:block;font-size:12.5px;color:var(--ink2);line-height:1.35;overflow-wrap:anywhere;}\n.sh-azr{display:flex;flex-direction:column;align-items:flex-end;gap:3px;}\n.sh-azr small{font-size:12px;color:var(--ink2);font-variant-numeric:tabular-nums;}\n.sh-azr .sh-kl{color:var(--warn);font-weight:700;}\n.sh-ar{display:flex;justify-content:space-between;align-items:center;gap:10px;padding:10px 0;border-top:1px solid var(--line);}\n.sh-ar:first-of-type{border-top:0;}\n.sh-ar b{display:block;font-size:14.5px;color:var(--ink);}\n.sh-ar small{display:block;font-size:12.5px;color:var(--ink2);}\n.sh-arr{display:flex;gap:6px;flex:none;}\n.sh-arr .btn{min-height:40px!important;display:inline-flex;align-items:center;}\n.sh-cfg summary{cursor:pointer;font-weight:750;font-size:16px;min-height:32px;color:var(--ink);}\n.sh-cfg[open] summary{margin-bottom:12px;}\n.sh-form{display:grid;grid-template-columns:repeat(auto-fit,minmax(220px,1fr));gap:10px 14px;margin-bottom:12px;}\n.sh-form .field{display:flex;flex-direction:column;gap:5px;margin:0;}\n.sh-form .field > span{font-size:13px;font-weight:650;color:var(--ink2);}\n.sh-form .field > span small{font-weight:400;color:var(--ink3);}\n.sh-form .field input,.sh-form .field select,.sh-form .field textarea{width:100%;min-height:46px;box-sizing:border-box;}\n.sh-breit{grid-column:1/-1;}\n.sh-schalter{display:flex;gap:12px;align-items:flex-start;padding:9px 0;cursor:pointer;}\n.sh-schalter input{width:22px;height:22px;flex:none;margin:1px 0 0;accent-color:var(--brand);}\n.sh-schalter b{display:block;font-size:14.5px;color:var(--ink);}\n.sh-schalter small{display:block;font-size:12.5px;color:var(--ink2);line-height:1.4;}\n.sh-home .sh-hot{margin:0!important;font-size:15px;}\n.sh-home{border-left:4px solid var(--warn)!important;}\n@media (max-width:420px){ .sh-st{grid-template-columns:28px 1fr;} .sh-st .sh-pill{grid-column:2;justify-self:start;} }\n.sh-kn{min-height:44px!important;padding:8px 14px!important;font-size:13.5px!important;display:inline-flex;align-items:center;}\n"; document.head.appendChild(s); }catch(e){} })();
/* =====================================================================
   Beta 0.99.30 · Stadionheft, Stufe 2 (161_stadionheft_plan.sql): der Heftplaner
   Albert, 14.11.2026: „Eine Engine mit Drag and Drop. Wenn ich eine Seite an den Rand ziehe, blättert es weiter. Anzeigen gleicher
   Themen zusammen.“
   - Das Heft als Doppelseiten wie im gedruckten Heft: Seite 1 liegt rechts allein, die Rückseite links allein.
   - Seite halten und ziehen (Maus sofort, Finger nach kurzem Halten). Am oberen und unteren Rand läuft das Heft weiter.
   - „Von selbst ordnen“ verteilt die Anzeigen gleichmäßig, legt halbe Anzeigen gleicher Themen zusammen und füllt auf volle Lagen (durch vier).
   - Feste Plätze: Titel vorn, Anzeige mit Platz „Seite 2“, Impressum vor der Rückseite, Anzeige mit Platz „Rückseite“ hinten.
   - Jede Änderung geht als ganzer Plan an den Server (stadionheft_plan_setzen), nie halb.
   Den Satz der Seiten und die Druckdatei bringt Stufe 3 (svm105.js, svm106.js).
   ===================================================================== */
const SHP = { heft:null, d:null, S:[], A:[], darf:false, laeuft:false };
const SHP_TYP = { titel:['Titel', 'ti'], inhalt:['Inhalt', ''], erste:['Erste', 'be'], zweite:['Zweite', 'be'], jugend:['Jugend', 'ju'], soma:['SOMA', 'ju'], tabelle:['Tabelle', ''], termine:['Termine', ''],
  training:['Trainingszeiten', ''], rueckblick:['Rückblick', ''], eigen:['Eigenwerbung', ''], frei:['Freie Seite', 'fr'], impressum:['Impressum', ''], anzeige:['Anzeige, ganze Seite', 'az'], anzeigen:['Zwei halbe Anzeigen', 'az'] };
const SHP_TEXT = ['erste', 'zweite', 'jugend', 'soma', 'rueckblick', 'eigen', 'frei'];   // hier passt unten eine halbe Anzeige hin
const SHP_THEMEN = ['Auto und Verkehr', 'Bau und Handwerk', 'Essen und Trinken', 'Handel', 'Geld und Versicherung', 'Dienstleistung', 'Sonstiges'];
const SHP_GERUEST = [['inhalt'], ['erste'], ['erste'], ['erste'], ['erste'], ['zweite'], ['zweite'], ['jugend'], ['jugend'], ['tabelle'], ['termine'], ['soma'], ['rueckblick']];
const shpA = id => SHP.A.find(a => a.id === id) || null;
const shpKurz = n => String(n || '').replace(/\s*\(.*\)\s*$/, '').replace(/\s+(GmbH|KG|OHG|GbR|e\.K\.).*$/, '');

/* ---------- Einstieg aus dem Reiter Stadionheft ---------- */
function shpOeffnen(id){ SHP.heft = id; SHP.d = null; const B = shOrt(); if(B) shpRender(B); try{ window.scrollTo(0, 0); }catch(e){} }
function shpZu(){ SHP.heft = null; SHP.d = null; const B = shOrt(); if(B) shRender(B); }
if(typeof shRender === 'function'){ const _r = shRender; shRender = function(B){ if(SHP.heft && shAn()) return shpRender(B); return _r.apply(this, arguments); }; }
if(typeof shBinden === 'function'){ const _b = shBinden; shBinden = function(B){ const r = _b.apply(this, arguments); B.querySelectorAll('[data-sh-plan]').forEach(b => b.onclick = () => shpOeffnen(b.dataset.shPlan)); return r; }; }

/* ---------- Regeln: feste Plätze, Zählen ---------- */
function shpAnker(s){ if(!s.fest) return null; const a = shpA(s.a);
  return s.typ === 'titel' ? 'vorn' : s.typ === 'impressum' ? 'impr' : s.typ === 'anzeige' && a && /seite\s*2/i.test(a.platz || '') ? 's2' : s.typ === 'anzeige' && a && /r(ü|ue)ckseite/i.test(a.platz || '') ? 'rueck' : 'abs'; }
// Bringt feste Seiten an ihren Platz zurück. alt = Reihenfolge vorher (für Seiten, die an ihrer Nummer hängen)
function shpPin(L, alt){ const k = s => shpAnker(s), frei = L.filter(s => !k(s)), f = x => L.filter(s => k(s) === x);
  const out = [...f('vorn'), ...f('s2'), ...frei, ...f('impr'), ...f('rueck')];
  f('abs').map(s => [s, Math.max(0, (alt || L).indexOf(s))]).sort((a, b) => a[1] - b[1]).forEach(([s, i]) => out.splice(Math.min(i, out.length), 0, s));
  return out; }
function shpStand(){ const S = SHP.S, n = S.length, gesetzt = new Set(S.flatMap(s => [s.a, s.b]).filter(Boolean)), offen = SHP.A.filter(a => !gesetzt.has(a.id));
  return { n, rest:(4 - n % 4) % 4, anz:S.filter(s => s.typ === 'anzeige' || s.typ === 'anzeigen').length, gesetzt:gesetzt.size, offen }; }

/* ---------- Von selbst ordnen ---------- */
function shpAuto(){ const S = SHP.S, A = SHP.A, neu = (typ, x) => Object.assign({ id:null, typ, titel:null, a:null, b:null, fest:false }, x || {});
  const unter = new Set(S.filter(s => SHP_TEXT.includes(s.typ) && s.a).map(s => s.a));          // halbe Anzeigen unter Text bleiben, wo sie sind
  let inhalt = S.filter(s => !['titel', 'impressum', 'anzeige', 'anzeigen'].includes(s.typ) && !(s.typ === 'frei' && !s.titel && !s.a));
  if(!inhalt.length) inhalt = SHP_GERUEST.map(g => neu(g[0]));
  const alt = S.filter(s => s.typ === 'anzeige' || s.typ === 'anzeigen'), nimm = (typ, a, b) => { const i = alt.findIndex(s => s.typ === typ && s.a === a); const s = i >= 0 ? alt.splice(i, 1)[0] : neu(typ); return Object.assign(s, { typ, a, b:b || null, fest:false }); };
  const ganz = A.filter(a => a.groesse === '1/1' && !unter.has(a.id)), halb = A.filter(a => a.groesse !== '1/1' && !unter.has(a.id));
  const s2 = ganz.find(a => /seite\s*2/i.test(a.platz || '')), rueck = ganz.find(a => /r(ü|ue)ckseite/i.test(a.platz || '')), mitte = ganz.filter(a => a !== s2 && a !== rueck);
  // halbe Anzeigen: gleiche Themen nebeneinander, ohne Thema ans Ende; je zwei auf eine Seite
  const th = a => a.thema || '￿'; const H = halb.slice().sort((x, y) => th(x) < th(y) ? -1 : th(x) > th(y) ? 1 : 0), paare = [];
  for(let i = 0; i < H.length; i += 2) paare.push(nimm('anzeigen', H[i].id, H[i + 1] ? H[i + 1].id : null));
  const ganze = mitte.map(a => nimm('anzeige', a.id));
  // ganze Seiten gleichmäßig zwischen die Paare
  const werb = paare.slice(); ganze.forEach((g, i) => werb.splice(Math.min(werb.length, Math.round((i + 1) * (paare.length + ganze.length) / (ganze.length + 1)) - 1 + 0), 0, g));
  // Anzeigenseiten gleichmäßig zwischen den Inhalt
  const mix = inhalt.slice(); werb.forEach((w, i) => { const ziel = Math.round((i + 1) * inhalt.length / (werb.length + 1)) + i; mix.splice(Math.min(mix.length, ziel), 0, w); });
  const titel = Object.assign(S.find(s => s.typ === 'titel') || neu('titel'), { fest:true }), impr = Object.assign(S.find(s => s.typ === 'impressum') || neu('impressum'), { fest:true });
  const vorn = [titel].concat(s2 ? [Object.assign(nimm('anzeige', s2.id), { fest:true })] : []), hinten = [impr].concat(rueck ? [Object.assign(nimm('anzeige', rueck.id), { fest:true })] : []);
  while((vorn.length + mix.length + hinten.length) % 4) mix.push(neu('frei'));
  return vorn.concat(mix, hinten); }

/* ---------- Laden und Speichern ---------- */
async function shpLaden(){ const d = await shRpc('stadionheft_plan', { p_heft:SHP.heft }); shpNimm(d); return d; }
function shpNimm(d){ SHP.d = d; SHP.A = d.anzeigen || []; SHP.S = (d.seiten || []).map(s => ({ id:s.id, typ:s.typ, titel:s.titel, a:s.a, b:s.b, fest:!!s.fest })); SHP.darf = !!d.planen; }
async function shpSichern(L, text){ const B = shOrt(), vor = SHP.S; SHP.S = L; if(B) shpMalen(B);
  try{ SHP.laeuft = true; const d = await shRpc('stadionheft_plan_setzen', { p_heft:SHP.heft, p_seiten:L.map(s => ({ id:s.id || '', typ:s.typ, titel:s.titel || '', a:s.a || '', b:s.b || '', fest:!!s.fest })) });
    shpNimm(d); if(text) kToast(text); }
  catch(e){ SHP.S = vor; kToast(e.message); try{ await shpLaden(); }catch(_){} }
  finally{ SHP.laeuft = false; if(B && B.isConnected && SHP.heft) shpMalen(B); } }

/* ---------- Ansicht ---------- */
async function shpRender(B){
  if(!SHP.d) B.innerHTML = '<div class="card"><div class="empty">Lade den Plan …</div></div>';
  try{ if(!SHP.d) await shpLaden(); }catch(e){ B.innerHTML = `<div class="card"><div class="empty">${shE(e.message)}</div><button type="button" class="btn ghost" id="shpZu">Zurück</button></div>`; const z = B.querySelector('#shpZu'); if(z) z.onclick = shpZu; return; }
  if(!B.isConnected || !SHP.heft) return;
  shpMalen(B);
}
function shpSeiteHtml(s, i){ const T = SHP_TYP[s.typ] || SHP_TYP.frei, a = shpA(s.a), b = shpA(s.b), ziehbar = SHP.darf && !s.fest;
  let innen;
  if(s.typ === 'anzeigen') innen = `<span class="shp-h${a ? '' : ' leer'}">${a ? shE(shpKurz(a.firma)) : 'frei'}</span><span class="shp-h${b ? '' : ' leer'}">${b ? shE(shpKurz(b.firma)) : 'frei'}</span>`;
  else if(s.typ === 'anzeige') innen = `<b>${a ? shE(shpKurz(a.firma)) : 'Anzeige'}</b><small>${a ? 'ganze Seite' : 'noch keine gewählt'}</small>`;
  else innen = `<b>${shE(T[0])}</b>${s.titel ? `<small>${shE(s.titel)}</small>` : ''}${a ? `<span class="shp-u">${shE(shpKurz(a.firma))}</span>` : ''}`;
  return `<button type="button" class="shp-s ${T[1]}${s.typ === 'anzeigen' ? ' zwei' : ''}${ziehbar ? ' zieh' : ''}" data-i="${i}" data-fest="${s.fest ? 1 : 0}" aria-label="Seite ${i + 1}: ${shE(s.typ === 'anzeigen' ? 'Anzeigen ' + [a, b].filter(Boolean).map(x => x.firma).join(' und ') : s.typ === 'anzeige' ? 'Anzeige ' + (a ? a.firma : '') : T[0] + (s.titel ? ', ' + s.titel : ''))}${s.fest ? ', fester Platz' : ''}"><i>${i + 1}</i>${s.fest ? '<u aria-hidden="true">fest</u>' : ''}${innen}</button>`; }
function shpMalen(B){ const d = SHP.d, h = d.heft, S = SHP.S, Z = shpStand();
  // Doppelseiten wie im Heft: 1 rechts allein, dann 2|3, 4|5 …, die letzte links allein
  const dop = []; if(S.length){ dop.push([null, 0]); for(let i = 1; i < S.length; i += 2) dop.push([i, i + 1 < S.length ? i + 1 : null]); }
  const zelle = i => i == null ? '<span class="shp-leer" aria-hidden="true"></span>' : shpSeiteHtml(S[i], i);
  B.innerHTML = `<div class="shp" id="shp"><div class="card shp-kopf"><div class="shp-kz"><button type="button" class="btn ghost shp-zu" id="shpZu">Zurück</button><div><h2>${shE(h.titel)}</h2><p class="sh-sub">${SHP.darf ? 'Seite halten und ziehen. Am Rand läuft das Heft weiter.' : h.status === 'gedruckt' ? 'Gedruckt. Der Plan lässt sich nur noch ansehen.' : 'Planen können die Leitung im Bereich Partner und die Redaktion.'}</p></div></div>
      <div class="shp-pills"><span class="sh-pill ${!Z.n ? 'gr' : Z.rest ? 'warn' : 'ok'}" id="shpSeiten">${!Z.n ? 'noch leer' : Z.rest ? Z.n + ' Seiten, ' + Z.rest + (Z.rest === 1 ? ' fehlt' : ' fehlen') + ' zur vollen Lage' : Z.n + ' Seiten, passt'}</span>
        <span class="sh-pill ${Z.offen.length ? 'warn' : 'ok'}" id="shpAnz">${Z.gesetzt} von ${SHP.A.length} Anzeigen gesetzt</span><span class="sh-pill gr">${Z.anz} Seiten mit Anzeigen</span></div>
      ${Z.offen.length && SHP.darf ? `<div class="shp-offen"><b>Noch nicht im Plan:</b> ${Z.offen.map(a => `<button type="button" class="sh-chip" data-shp-setz="${a.id}">${shE(shpKurz(a.firma))} <small>${a.groesse === '1/1' ? 'ganz' : 'halb'}</small></button>`).join('')}</div>` : ''}
      <div class="sh-akt">${SHP.darf ? `<button type="button" class="btn" id="shpAuto">Von selbst ordnen</button><button type="button" class="btn ghost" id="shpNeu">Seite dazu</button><button type="button" class="btn ghost" id="shpThemen">Themen der Anzeigen</button>` : ''}${S.length ? '<button type="button" class="btn ghost" id="shpVor">Vorschau und Texte</button>' : ''}</div></div>
    ${S.length ? `<div class="shp-raster" id="shpRaster">${dop.map(p => `<div class="shp-dop">${zelle(p[0])}${zelle(p[1])}</div>`).join('')}</div>` : `<div class="card"><p class="sh-leer">Der Plan ist noch leer.${SHP.darf ? ' „Von selbst ordnen“ baut das Heft aus den Anzeigen und einem üblichen Aufbau. Danach ziehst du die Seiten zurecht.' : ''}</p></div>`}</div>`;
  B.querySelector('#shpZu').onclick = shpZu;
  const vs = B.querySelector('#shpVor'); if(vs) vs.onclick = () => { if(typeof hvOeffnen === 'function') hvOeffnen(SHP.heft); };
  if(!SHP.darf){ B.querySelectorAll('.shp-s[data-i]').forEach(x => x.onclick = () => shpSeiteDialog(+x.dataset.i)); return; }
  B.querySelector('#shpAuto').onclick = () => shpAutoDialog();
  B.querySelector('#shpNeu').onclick = () => shpSeiteDialog(null);
  B.querySelector('#shpThemen').onclick = () => shpThemenDialog();
  B.querySelectorAll('[data-shp-setz]').forEach(b => b.onclick = () => shpSetzen(b.dataset.shpSetz));
  const R = B.querySelector('#shpRaster'); if(R) shpZiehen(R);
}

/* ---------- Ziehen ---------- */
function shpRoller(el){ for(let p = el.parentElement; p; p = p.parentElement){ const o = getComputedStyle(p).overflowY; if((o === 'auto' || o === 'scroll') && p.scrollHeight > p.clientHeight + 4) return p; } return null; }
let shpZ = null, shpGezogen = false;
function shpZEnde(fallen){ const z = shpZ; if(!z) return; shpZ = null; clearTimeout(z.t); cancelAnimationFrame(z.raf);
  if(z.geist) z.geist.remove(); z.R.querySelectorAll('.shp-vor,.shp-nach,.shp-weg').forEach(x => x.classList.remove('shp-vor', 'shp-nach', 'shp-weg')); z.R.classList.remove('shp-aktiv');
  if(z.aktiv){ shpGezogen = true; setTimeout(() => { shpGezogen = false; }, 350); }
  if(fallen && z.aktiv && z.ziel != null && z.ziel !== z.i && z.ziel !== z.i + 1) shpSchieben(z.i, z.ziel); }
function shpZSetz(){ const z = shpZ; if(z && z.geist) z.geist.style.transform = `translate(${z.x - z.dx}px,${z.y - z.dy}px) rotate(-3deg)`; }
function shpZTreffer(){ const z = shpZ; if(!z || !z.aktiv) return; z.R.querySelectorAll('.shp-vor,.shp-nach').forEach(x => x.classList.remove('shp-vor', 'shp-nach'));
  const u = document.elementFromPoint(z.x, z.y), el = u && u.closest ? u.closest('.shp-s[data-i]') : null; if(!el || !z.R.contains(el)){ z.ziel = null; return; }
  const r = el.getBoundingClientRect(), nach = z.x > r.left + r.width / 2, i = +el.dataset.i; z.ziel = nach ? i + 1 : i; el.classList.add(nach ? 'shp-nach' : 'shp-vor'); }
// am oberen und unteren Rand weiterlaufen: so blättert das Heft beim Ziehen
function shpZLauf(){ const z = shpZ; if(!z || !z.aktiv) return; const rand = 96, v = z.y < rand ? -Math.ceil((rand - z.y) / 6) : z.y > innerHeight - rand ? Math.ceil((z.y - (innerHeight - rand)) / 6) : 0;
  if(v){ const p = shpRoller(z.R); if(p) p.scrollTop += v; else window.scrollBy(0, v); shpZTreffer(); } z.raf = requestAnimationFrame(shpZLauf); }
function shpZLos(){ const z = shpZ; if(!z || z.aktiv) return; z.aktiv = true; z.R.classList.add('shp-aktiv'); const r = z.el.getBoundingClientRect(); z.el.classList.add('shp-weg');
  z.geist = z.el.cloneNode(true); z.geist.classList.add('shp-geist'); z.geist.style.width = r.width + 'px'; z.geist.style.height = r.height + 'px'; document.body.appendChild(z.geist); z.dx = z.x - r.left; z.dy = z.y - r.top;
  shpZSetz(); try{ if(navigator.vibrate) navigator.vibrate(12); }catch(e){} shpZLauf(); }
function shpZBewegt(e){ const z = shpZ; if(!z) return; z.x = e.clientX; z.y = e.clientY; const weit = Math.hypot(z.x - z.x0, z.y - z.y0);
  if(!z.aktiv){ if(z.touch){ if(weit > 10) shpZEnde(false); return; } if(weit < 6) return; shpZLos(); }
  if(e.cancelable) e.preventDefault(); shpZSetz(); shpZTreffer(); }
if(typeof document !== 'undefined' && !window._shpDoc){ window._shpDoc = 1;
  document.addEventListener('pointermove', shpZBewegt, { passive:false });
  document.addEventListener('pointerup', () => shpZEnde(true));
  document.addEventListener('pointercancel', () => { if(shpZ && !shpZ.aktiv) shpZEnde(false); });
  document.addEventListener('touchmove', e => { if(shpZ && shpZ.aktiv && e.cancelable) e.preventDefault(); }, { passive:false }); }
function shpZiehen(R){
  R.addEventListener('pointerdown', e => { const el = e.target.closest('.shp-s[data-i]'); if(!el || SHP.laeuft || el.dataset.fest === '1' || (e.button != null && e.button > 0)) return;
    shpZ = { R, el, i:+el.dataset.i, x:e.clientX, y:e.clientY, x0:e.clientX, y0:e.clientY, touch:e.pointerType !== 'mouse', aktiv:false, ziel:null };
    if(shpZ.touch) shpZ.t = setTimeout(shpZLos, 260); });
  R.addEventListener('contextmenu', e => { if(shpZ) e.preventDefault(); });
  // Tippen öffnet die Seite, außer es wurde gerade gezogen
  R.addEventListener('click', e => { const el = e.target.closest('.shp-s[data-i]'); if(!el) return; if(shpGezogen){ shpGezogen = false; return; } shpSeiteDialog(+el.dataset.i); });
}
// Seite von Platz i vor Platz ziel schieben (ziel zählt in der alten Reihenfolge)
function shpSchieben(i, ziel){ const alt = SHP.S, L = alt.slice(), s = L.splice(i, 1)[0]; L.splice(ziel > i ? ziel - 1 : ziel, 0, s); return shpSichern(shpPin(L, alt)); }

/* ---------- Anzeige aus der Liste in den Plan nehmen ---------- */
function shpSetzen(id){ const a = shpA(id); if(!a) return; const L = SHP.S.slice();
  if(a.groesse !== '1/1'){ const halb = L.find(s => s.typ === 'anzeigen' && (!s.a || !s.b)); if(halb){ if(!halb.a) halb.a = id; else halb.b = id; return shpSichern(L, 'Anzeige ist gesetzt.'); } }
  const neu = { id:null, typ:a.groesse === '1/1' ? 'anzeige' : 'anzeigen', titel:null, a:id, b:null, fest:false }, vor = L.findIndex(s => shpAnker(s) === 'impr' || shpAnker(s) === 'rueck');
  L.splice(vor < 0 ? L.length : vor, 0, neu); return shpSichern(shpPin(L, SHP.S), 'Anzeige ist gesetzt.'); }

/* ---------- Dialoge ---------- */
function shpAutoDialog(){ const hat = SHP.S.length > 0;
  const M = svModal(`<div class="mhead"><div><h2 style="margin:0">Heft von selbst ordnen?</h2><div class="msub">${shE(SHP.d.heft.titel)}</div></div></div>
    <p class="note">${hat ? 'Deine Inhaltsseiten bleiben in ihrer Reihenfolge. Die Anzeigen werden neu verteilt: gleichmäßig durchs Heft, halbe Anzeigen gleicher Themen zusammen.' : 'Die App baut ein Heft aus allen Anzeigen und einem üblichen Aufbau: Inhalt, Berichte der Ersten und Zweiten, Jugend, Tabelle, Termine, SOMA, Rückblick.'} Der Titel steht vorn, das Impressum vor der Rückseite, und die Seitenzahl wird durch vier teilbar.</p>
    <div class="pz-tc-dlgk"><button type="button" class="btn" id="shpAOk">Ordnen</button><button type="button" class="btn ghost" id="shpAAb">Abbrechen</button></div>`);
  M.querySelector('#shpAAb').onclick = () => closeOverlay();
  M.querySelector('#shpAOk').onclick = () => { closeOverlay(); shpSichern(shpAuto(), 'Das Heft ist geordnet.'); }; }

function shpSeiteDialog(i){ const neu = i == null, s = neu ? { typ:'frei', titel:null, a:null, b:null, fest:false } : SHP.S[i]; if(!s) return;
  const belegt = new Set(SHP.S.filter(x => x !== s).flatMap(x => [x.a, x.b]).filter(Boolean));
  const wahl = (id, wert, nur) => `<select id="${id}"><option value="">keine</option>${SHP.A.filter(a => (!belegt.has(a.id) || a.id === wert) && (!nur || (nur === 'ganz' ? a.groesse === '1/1' : a.groesse !== '1/1'))).map(a => `<option value="${a.id}"${a.id === wert ? ' selected' : ''}>${shE(a.firma)}${a.thema ? ' · ' + shE(a.thema) : ''}</option>`).join('')}</select>`;
  if(!SHP.darf){ const T = SHP_TYP[s.typ] || SHP_TYP.frei, a = shpA(s.a), b = shpA(s.b);
    svModal(`<div class="mhead"><div><h2 style="margin:0">Seite ${i + 1}</h2><div class="msub">${shE(T[0])}</div></div></div><p class="note">${[s.titel, a && a.firma, b && b.firma, s.fest ? 'fester Platz' : null].filter(Boolean).map(shE).join(' · ') || 'Noch ohne Angaben.'}</p>`); return; }
  const M = svModal(`<div class="mhead"><div><h2 style="margin:0">${neu ? 'Seite dazu' : 'Seite ' + (i + 1)}</h2><div class="msub">${neu ? 'Kommt vor das Impressum' : shE((SHP_TYP[s.typ] || SHP_TYP.frei)[0])}</div></div></div>
    <div class="sh-form"><label class="field"><span>Sorte</span><select id="shpS_t">${Object.keys(SHP_TYP).map(k => `<option value="${k}"${k === s.typ ? ' selected' : ''}>${SHP_TYP[k][0]}</option>`).join('')}</select></label>
      <label class="field"><span>Titel <small>zum Beispiel 18. Spiel oder B-Junioren</small></span><input id="shpS_ti" maxlength="80" value="${shE(s.titel || '')}" autocomplete="off"></label>
      <label class="field" id="shpS_fa"><span id="shpS_la">Anzeige</span><span id="shpS_wa"></span></label>
      <label class="field" id="shpS_fb"><span>Zweite halbe Anzeige</span><span id="shpS_wb"></span></label></div>
    <label class="sh-schalter"><input type="checkbox" id="shpS_f"${s.fest ? ' checked' : ''}><span><b>Fester Platz</b><small>bleibt beim Ziehen und beim Ordnen stehen</small></span></label>
    <div class="pz-tc-dlgk"><button type="button" class="btn" id="shpS_ok">${neu ? 'Dazunehmen' : 'Übernehmen'}</button>${neu ? '' : `<button type="button" class="btn ghost" id="shpS_v"${i <= 0 || s.fest ? ' disabled' : ''}>Nach vorn</button><button type="button" class="btn ghost" id="shpS_h"${i >= SHP.S.length - 1 || s.fest ? ' disabled' : ''}>Nach hinten</button><button type="button" class="btn ghost" id="shpS_w">Seite entfernen</button>`}<button type="button" class="btn ghost" id="shpS_ab">Abbrechen</button></div>`);
  const g = id => M.querySelector('#' + id);
  const felder = () => { const t = g('shpS_t').value, text = SHP_TEXT.includes(t), wa = (g('shpS_a') || {}).value !== undefined ? g('shpS_a').value : (s.a || ''), wb = (g('shpS_b') || {}).value !== undefined ? g('shpS_b').value : (s.b || '');
    g('shpS_fa').hidden = !(t === 'anzeige' || t === 'anzeigen' || text); g('shpS_fb').hidden = t !== 'anzeigen';
    g('shpS_la').textContent = t === 'anzeige' ? 'Anzeige, ganze Seite' : t === 'anzeigen' ? 'Erste halbe Anzeige' : 'Halbe Anzeige unten auf der Seite';
    g('shpS_wa').innerHTML = wahl('shpS_a', wa, t === 'anzeige' ? 'ganz' : 'halb'); g('shpS_wb').innerHTML = wahl('shpS_b', wb, 'halb'); };
  felder(); g('shpS_t').onchange = felder;
  g('shpS_ab').onclick = () => closeOverlay();
  const lesen = () => { const t = g('shpS_t').value; return { typ:t, titel:g('shpS_ti').value.trim() || null, a:g('shpS_fa').hidden ? null : (g('shpS_a').value || null), b:g('shpS_fb').hidden ? null : (g('shpS_b').value || null), fest:g('shpS_f').checked }; };
  g('shpS_ok').onclick = () => { const w = lesen(); if(w.a && w.a === w.b){ kToast('Bitte zwei verschiedene Anzeigen wählen.'); return; } closeOverlay(); const alt = SHP.S, L = alt.slice();
    if(neu){ const vor = L.findIndex(x => shpAnker(x) === 'impr' || shpAnker(x) === 'rueck'); L.splice(vor < 0 ? L.length : vor, 0, Object.assign({ id:null }, w)); } else Object.assign(s, w);
    shpSichern(shpPin(L, alt), neu ? 'Seite ist dazu.' : 'Seite ist geändert.'); };
  if(!neu){ g('shpS_v').onclick = () => { closeOverlay(); shpSchieben(i, i - 1); }; g('shpS_h').onclick = () => { closeOverlay(); shpSchieben(i, i + 2); };
    g('shpS_w').onclick = () => { const b = g('shpS_w'); if(b.dataset.sicher !== '1'){ b.dataset.sicher = '1'; b.textContent = 'Wirklich entfernen?'; return; } closeOverlay(); shpSichern(SHP.S.filter(x => x !== s), 'Seite ist entfernt.'); }; }
}

function shpThemenDialog(){
  const M = svModal(`<div class="mhead"><div><h2 style="margin:0">Themen der Anzeigen</h2><div class="msub">Gleiche Themen stehen beim Ordnen zusammen</div></div></div>
    <div class="shp-themen">${SHP.A.map(a => `<label class="shp-th"><span>${shE(a.firma)}<small>${a.groesse === '1/1' ? 'ganze Seite' : 'halbe Seite'}</small></span><select data-shp-th="${a.id}"><option value="">ohne Thema</option>${SHP_THEMEN.concat(a.thema && !SHP_THEMEN.includes(a.thema) ? [a.thema] : []).map(t => `<option${t === a.thema ? ' selected' : ''}>${shE(t)}</option>`).join('')}</select></label>`).join('') || '<p class="sh-leer">Noch keine Anzeigen im Heft.</p>'}</div>
    <div class="pz-tc-dlgk"><button type="button" class="btn" id="shpThOk">Fertig</button></div>`);
  M.querySelectorAll('[data-shp-th]').forEach(sel => sel.onchange = async () => { const a = shpA(sel.dataset.shpTh); sel.disabled = true;
    try{ await shRpc('stadionheft_anzeige_thema', { p_id:a.id, p_thema:sel.value }); a.thema = sel.value || null; }catch(e){ kToast(e.message); sel.value = a.thema || ''; } sel.disabled = false; });
  M.querySelector('#shpThOk').onclick = () => { closeOverlay(); const B = shOrt(); if(B && SHP.heft) shpMalen(B); }; }

(function(){ try{ const s=document.createElement('style'); s.id='svm104css'; s.textContent="/* 0.99.30: Heftplaner (svm104.js) */\n.shp-kz{display:flex;gap:12px;align-items:flex-start;margin-bottom:10px;}\n.shp-zu{min-height:44px!important;flex:none;}\n.shp-kopf h2{margin:0 0 2px;font-size:20px;font-weight:800;letter-spacing:-.02em;color:var(--ink);}\n.shp-pills{display:flex;flex-wrap:wrap;gap:6px;margin-bottom:10px;}\n.shp-offen{display:flex;flex-wrap:wrap;gap:6px;align-items:center;margin-bottom:10px;font-size:13.5px;color:var(--ink2);}\n.shp-offen b{color:var(--ink);margin-right:2px;}\n.shp-offen .sh-chip small{font-weight:500;opacity:.75;}\n.shp-raster{display:grid;grid-template-columns:repeat(auto-fill,minmax(150px,1fr));gap:14px;padding:2px 0 24px;touch-action:pan-y;}\n.shp-dop{display:grid;grid-template-columns:1fr 1fr;gap:3px;padding:6px;border-radius:12px;border:1px solid var(--line);background:rgba(148,163,196,.08);}\n.shp-leer{display:block;aspect-ratio:210/297;}\n.shp-s{position:relative;display:flex;flex-direction:column;gap:3px;aspect-ratio:210/297;min-width:0;padding:19px 6px 5px;border-radius:5px;border:1.5px solid #cfd3dc;background:#fff;color:#2a3146;\n  font:inherit;font-size:11px;line-height:1.2;text-align:left;cursor:pointer;overflow:hidden;-webkit-user-select:none;user-select:none;-webkit-touch-callout:none;}\n.shp-s.zieh{cursor:grab;}\n.shp-s i{position:absolute;left:5px;top:4px;font-style:normal;font-weight:800;font-size:11px;color:#6b7284;font-variant-numeric:tabular-nums;}\n.shp-s u{position:absolute;right:4px;top:4px;text-decoration:none;font-size:11px;font-weight:800;letter-spacing:.02em;text-transform:uppercase;color:#6b7284;background:#eceef3;border-radius:4px;padding:1px 4px;}\n.shp-s b{display:block;font-size:11.5px;font-weight:800;color:#1b2235;overflow-wrap:anywhere;}\n.shp-s small{display:block;font-size:11px;color:#566078;overflow-wrap:anywhere;}\n.shp-s.ti{background:#1b2235;border-color:#1b2235;color:#cfd6e6;}\n.shp-s.ti b{color:#fff;}.shp-s.ti i{color:#aab3c8;}.shp-s.ti u{background:#2c3550;color:#cfd6e6;}\n.shp-s.be{background:#eaf0fd;border-color:#a9bdf0;}\n.shp-s.ju{background:#e4f5ea;border-color:#9fd3b0;}\n.shp-s.fr{background:#f6f6f8;border-style:dashed;}\n.shp-s.az{background:#fdeede;border-color:#e3a36c;}\n.shp-s.az b{color:#a9480c;}\n.shp-h{flex:1;display:grid;place-items:center;text-align:center;border-radius:3px;border:1px solid #e3a36c;background:#fff;color:#a9480c;font-weight:800;font-size:11px;line-height:1.1;padding:2px;overflow-wrap:anywhere;min-height:0;}\n.shp-h.leer{border-style:dashed;color:#8a8f9c;font-weight:600;}\n.shp-u{margin-top:auto;display:grid;place-items:center;text-align:center;min-height:30%;border-radius:3px;border:1px dashed #e3a36c;background:#fdeede;color:#a9480c;font-weight:800;font-size:11px;line-height:1.1;padding:2px;overflow-wrap:anywhere;}\n.shp-s:focus-visible{outline:3px solid var(--brand);outline-offset:2px;}\n.shp-weg{opacity:.28;}\n.shp-vor{box-shadow:-5px 0 0 -1px var(--brand);}\n.shp-nach{box-shadow:5px 0 0 -1px var(--brand);}\n.shp-geist{position:fixed!important;left:0;top:0;z-index:9999;pointer-events:none;margin:0;box-shadow:0 22px 40px -12px rgba(15,20,45,.55);border-color:var(--brand)!important;opacity:.96;}\n.shp-aktiv{cursor:grabbing;}\n.shp-themen{display:flex;flex-direction:column;gap:8px;max-height:55vh;overflow-y:auto;margin-bottom:12px;}\n.shp-th{display:grid;grid-template-columns:1fr minmax(140px,44%);gap:10px;align-items:center;}\n.shp-th span{font-size:14px;font-weight:650;color:var(--ink);overflow-wrap:anywhere;}\n.shp-th small{display:block;font-size:12px;font-weight:400;color:var(--ink2);}\n.shp-th select{min-height:44px;width:100%;}\n#shpS_wa select,#shpS_wb select{width:100%;min-height:46px;}\n@media (min-width:900px){ .shp-raster{grid-template-columns:repeat(auto-fill,minmax(190px,1fr));} .shp-s{font-size:12px;} }\n@media (prefers-reduced-motion:no-preference){ .shp-s{transition:opacity .12s, box-shadow .12s;} }\n"; document.head.appendChild(s); }catch(e){} })();
/* =====================================================================
   Beta 0.99.31 · Stadionheft, Stufe 3 (162_stadionheft_satz.sql): der Heftsatz
   Albert, 14.11.2026: „Automatischer Satz, es soll hochwertig aussehen, nicht mehr die Word-Vorlage.“
   Eine kleine Satzmaschine: Aus jeder Seite des Plans entsteht eine Liste von Bausteinen in Millimetern (Fläche, Linie, Text, Bild).
   Dieselbe Liste wird einmal als Vorschau gezeichnet (SVG) und einmal als Druckdatei geschrieben (PDF). So stimmt, was man sieht,
   mit dem überein, was gedruckt wird: gleiche Schrift, gleiche Zeilen, gleiche Plätze.
   - Schrift: Barlow Condensed für Überschriften, Barlow für den Text (liegen als Datei bei, auch in der Druckdatei eingebettet).
   - Umbruch mit deutscher Silbentrennung (vendor/hyph-de.json). Text läuft in zwei Spalten und, wenn er länger ist, auf die
     nächste leere Seite derselben Sorte weiter.
   - Was von selbst kommt (stadionheft_inhalt): Spiele mit Toren und Aufstellung, Tabellen, nächste Spiele, Termine.
   Die Bedienung (Blättern, Texte, Druckdatei) steht in svm106.js.
   ===================================================================== */
const HS = { W:210, H:297, B:{}, lade:null, doc:null, tr:null, wc:new Map(), ttf:null };
const HS_FONT = { h:['heft-bc800', 'HeftBC8'], k:['heft-bc600', 'HeftBC6'], t:['heft-b400', 'HeftB4'], f:['heft-b600', 'HeftB6'], i:['heft-b400i', 'HeftB4I'] };
const HS_C = { blau:'#263d8f', nacht:'#131d45', hell:'#00a3da', or:'#e57029', ink:'#15171c', grau:'#5b6170', lin:'#d3d8e3', flaeche:'#eef1f7', weiss:'#ffffff' };
const HS_MON = ['Januar', 'Februar', 'März', 'April', 'Mai', 'Juni', 'Juli', 'August', 'September', 'Oktober', 'November', 'Dezember'];
const HS_TAG = ['Sonntag', 'Montag', 'Dienstag', 'Mittwoch', 'Donnerstag', 'Freitag', 'Samstag'];
const HS_LIGA = { A:'Kreisliga A', D2:'Kreisliga D' };
const HS_RUBRIK = { inhalt:'In diesem Heft', erste:'1. Mannschaft', zweite:'2. Mannschaft', jugend:'Jugend', soma:'SOMA', tabelle:'Tabellen', termine:'Termine', training:'Trainingszeiten',
  rueckblick:'Rückblick', eigen:'Verein', frei:'Verein', impressum:'Impressum' };
const HS_TEXT = ['jugend', 'soma', 'rueckblick', 'eigen', 'frei'];
const HS_MM = 25.4 / 72;                                   // ein Punkt in Millimetern

/* ---------- Laden: PDF-Werkzeug, Schriften, Trennmuster ---------- */
function hsB64(buf){ const u = new Uint8Array(buf); let s = ''; for(let i = 0; i < u.length; i += 0x8000) s += String.fromCharCode.apply(null, u.subarray(i, i + 0x8000)); return btoa(s); }
function hsNeuDoc(o){ const J = window.jspdf.jsPDF, d = new J(Object.assign({ unit:'mm', format:'a4', compress:true, putOnlyUsedFonts:true }, o || {}));
  for(const k in HS_FONT){ d.addFileToVFS(HS_FONT[k][0] + '.ttf', HS.ttf[k]); d.addFont(HS_FONT[k][0] + '.ttf', HS_FONT[k][1], 'normal'); } return d; }
function hsBereit(){ if(HS.lade) return HS.lade;
  HS.lade = (async () => { const v = '?v=' + encodeURIComponent((window.SVBC_CFG && SVBC_CFG.build) || '');
    await sxScript('vendor/jspdf.umd.min.js', () => window.jspdf && window.jspdf.jsPDF);
    const K = Object.keys(HS_FONT), bufs = await Promise.all(K.map(k => fetch('fonts/' + HS_FONT[k][0] + '.ttf' + v).then(r => { if(!r.ok) throw new Error('Die Schrift für das Heft fehlt.'); return r.arrayBuffer(); })));
    HS.ttf = {}; const warte = []; K.forEach((k, i) => { HS.ttf[k] = hsB64(bufs[i]); try{ const ff = new FontFace(HS_FONT[k][1], bufs[i]); document.fonts.add(ff); warte.push(ff.load()); }catch(e){} });
    await Promise.all(warte).catch(() => {});
    HS.doc = hsNeuDoc(); HS.wc.clear();
    try{ const r = await fetch('vendor/hyph-de.json' + v); if(r.ok) HS.tr = hsTrie(await r.json()); }catch(e){ HS.tr = null; }
  })().catch(e => { HS.lade = null; throw e; });
  return HS.lade; }

/* ---------- Messen, Trennen, Umbrechen ---------- */
function hsW(t, f, pt){ if(!t) return 0; const key = f + t; let w = HS.wc.get(key);
  if(w == null){ if(HS.wc.size > 40000) HS.wc.clear(); HS.doc.setFont(HS_FONT[f][1], 'normal'); HS.doc.setFontSize(100); w = HS.doc.getTextWidth(t); HS.wc.set(key, w); }
  return w * pt / 100; }
function hsBreite(t, f, pt, ls){ return hsW(t, f, pt) + (ls ? ls * pt * HS_MM * String(t).length : 0); }
function hsTrie(l){ const T = {}; for(const n in l.patterns){ const s = l.patterns[n], k = +n;
    for(let i = 0; i < s.length; i += k){ const p = s.slice(i, i + k), pts = p.split(/\D/).map(x => +x || 0); let t = T; for(const c of p.replace(/[0-9]/g, '')) t = t[c] || (t[c] = {}); t._ = pts; } }
  return { T, l:Math.max(3, l.leftmin || 2), r:Math.max(3, l.rightmin || 2) }; }
// Silben eines Wortes nach den Trennmustern (Verfahren von Liang, wie in TeX)
function hsSilben(w){ const tr = HS.tr; if(!tr || w.length < 7 || /[^A-Za-zÄÖÜäöüß]/.test(w)) return [w];
  const s = '_' + w.toLowerCase() + '_', n = s.length, P = new Array(n + 1).fill(0);
  for(let i = 0; i < n; i++){ let t = tr.T; for(let j = i; j < n; j++){ t = t[s[j]]; if(!t) break; if(t._) for(let k = 0; k < t._.length; k++) if(t._[k] > P[i + k]) P[i + k] = t._[k]; } }
  const out = ['']; for(let i = 1; i < n - 1; i++){ if(i > tr.l && i < n - tr.r && P[i] % 2) out.push(w[i - 1]); else out[out.length - 1] += w[i - 1]; }
  return out; }
function hsTeile(w){ const m = /^([^A-Za-zÄÖÜäöüß0-9]*)(.*?)([^A-Za-zÄÖÜäöüß0-9]*)$/.exec(w) || [w, '', w, ''];
  const T = /[-\/]/.test(m[2]) ? m[2].split(/(?<=[-\/])/).filter(Boolean) : hsSilben(m[2]);
  if(!T.length) return [w]; T[0] = m[1] + T[0]; T[T.length - 1] += m[3]; return T; }
// Ein Absatz wird zu Zeilen. Passt ein Wort nicht mehr, wird es an einer Silbe getrennt, wenn die Zeile sonst zu kurz bliebe.
function hsUmbruch(text, f, pt, breite, ganz){ const out = [], sp = hsW(' ', f, pt);
  const W = String(text == null ? '' : text).trim().split(/\s+/).filter(Boolean); let z = '', zw = 0;
  const neu = () => { out.push({ t:z, w:zw }); z = ''; zw = 0; };
  for(let w of W){ for(let lauf = 0; lauf < 40; lauf++){ const ww = hsW(w, f, pt), vor = z ? sp : 0;
      if(zw + vor + ww <= breite){ z += (z ? ' ' : '') + w; zw += vor + ww; break; }
      if(!ganz && (breite - zw - vor > breite * .14 || !z)){ const T = hsTeile(w); let k = T.length - 1, kopf = '';
        for(; k >= 1; k--){ const a = T.slice(0, k).join(''); kopf = /[-\/]$/.test(a) ? a : a + '-'; if(zw + vor + hsW(kopf, f, pt) <= breite) break; }
        if(k >= 1){ z += (z ? ' ' : '') + kopf; zw += vor + hsW(kopf, f, pt); neu(); w = T.slice(k).join(''); continue; } }
      if(z){ neu(); continue; }
      z = w; zw = ww; break; } }
  if(z) neu(); return out; }
// Fließtext: jede Zeile im Feld ist ein Absatz, „## “ davor macht eine Zwischenüberschrift
function hsTextZeilen(text, breite, pt){ const Z = [], lh = pt * HS_MM * 1.37; let erster = true;
  for(const roh of String(text || '').replace(/\r/g, '').split('\n')){ const a = roh.trim(); if(!a) continue;
    const zw = /^##\s*/.test(a), f = zw ? 'k' : 't', p = zw ? pt + 1.6 : pt, L = hsUmbruch(zw ? a.replace(/^##\s*/, '').toUpperCase() : a, f, p, breite);
    L.forEach((l, i) => Z.push({ t:l.t, f, pt:p, c:zw ? HS_C.blau : HS_C.ink, ls:zw ? .03 : 0, h:lh, vor:i === 0 && !erster ? (zw ? lh * .75 : lh * .42) : 0, halt:zw })); erster = false; }
  return Z; }

/* ---------- Ein Blatt: Bausteine sammeln ---------- */
function hsBlatt(){ const o = [], warn = [];
  return { o, warn,
    r(x, y, w, h, f, opt){ o.push(Object.assign({ o:'r', x, y, w, h, f }, opt || {})); },
    p(pts, f, opt){ o.push(Object.assign({ o:'p', pts, f }, opt || {})); },
    l(x1, y1, x2, y2, s, b){ o.push({ o:'l', x1, y1, x2, y2, s, b:b || .25 }); },
    // Text. opt.a: 'r' rechtsbündig an x, 'c' mittig um x. opt.ls: Laufweite in Geviert. Gibt die Breite zurück.
    t(t, x, y, f, pt, c, opt){ opt = opt || {}; t = String(t == null ? '' : t); if(!t) return 0; const w = hsBreite(t, f, pt, opt.ls) - (opt.ls ? opt.ls * pt * HS_MM : 0);
      o.push({ o:'t', t, x:opt.a === 'r' ? x - w : opt.a === 'c' ? x - w / 2 : x, y, f, pt, c, ls:opt.ls || 0, op:opt.op }); return w; },
    // Text, der in die Breite passen muss: wird kleiner, bis er passt
    tp(t, x, y, f, pt, c, max, opt){ let p = pt; while(p > pt * .45 && hsBreite(t, f, p, opt && opt.ls) > max) p -= .5; this.t(t, x, y, f, p, c, opt); return p; },
    b(k, x, y, w, h, opt){ o.push(Object.assign({ o:'b', k, x, y, w, h }, opt || {})); },
    // nur in der Vorschau: ein Platzhalter mit Hinweis
    hin(x, y, w, h, text){ o.push({ o:'h', x, y, w, h, t:text }); },
    // mehrere Zeilen mit Umbruch, gibt die Grundlinie der letzten Zeile + Zeilenhöhe zurück
    abs(text, x, y, breite, f, pt, c, opt){ opt = opt || {}; const lh = opt.lh || pt * HS_MM * 1.32, L = hsUmbruch(text, f, pt, breite).slice(0, opt.max || 99);
      L.forEach((l, i) => this.t(l.t, opt.a === 'c' ? x + breite / 2 : opt.a === 'r' ? x + breite : x, y + i * lh, f, pt, c, { a:opt.a, ls:opt.ls })); return y + L.length * lh; } }; }
// Zeilen in Spalten gießen. Gibt die Zeilen zurück, die nicht mehr gepasst haben.
function hsGiessen(B, Z, spalten){ let i = 0;
  for(const sp of spalten){ let y = sp.y, oben = true;
    while(i < Z.length){ const z = Z[i], vor = oben ? 0 : z.vor;
      if(y + vor + z.h > sp.y + sp.h + .01) break;
      if(z.halt && i + 2 < Z.length && y + vor + z.h * 3 > sp.y + sp.h) break;          // Zwischenüberschrift nicht allein ans Spaltenende
      y += vor + z.h; B.t(z.t, sp.x, y - z.h * .27, z.f, z.pt, z.c, { ls:z.ls }); oben = false; i++; } }
  return Z.slice(i); }

/* ---------- Kleine Helfer für Inhalte ---------- */
function hsDat(d){ const m = /^(\d{4})-(\d{2})-(\d{2})/.exec(d || ''); return m ? new Date(+m[1], +m[2] - 1, +m[3]) : null; }
function hsTagKurz(d){ const x = hsDat(d); return x ? HS_TAG[x.getDay()].slice(0, 2) + ' ' + String(x.getDate()).padStart(2, '0') + '.' + String(x.getMonth() + 1).padStart(2, '0') + '.' : ''; }
function hsTagLang(d){ const x = hsDat(d); return x ? HS_TAG[x.getDay()] + ', ' + x.getDate() + '. ' + HS_MON[x.getMonth()] + ' ' + x.getFullYear() : ''; }
function hsDatum(d){ const x = hsDat(d); return x ? String(x.getDate()).padStart(2, '0') + '.' + String(x.getMonth() + 1).padStart(2, '0') + '.' + x.getFullYear() : ''; }
function hsHeftMonat(h){ const x = hsDat(h.monat || h.erscheint); return x ? HS_MON[x.getMonth()] + ' ' + x.getFullYear() : ''; }
function hsNorm(n){ return String(n || '').toLowerCase().replace(/ä/g, 'ae').replace(/ö/g, 'oe').replace(/ü/g, 'ue').replace(/ß/g, 'ss').replace(/\s+(ii|iii|2|3)$/, '').replace(/[^a-z0-9]/g, ''); }
function hsWappenKey(name){ return /m(ö|oe)rlenbach/i.test(name || '') ? 'wappen' : 'w:' + hsNorm(name); }
// Tore, Halbzeit und Karten aus dem Verlauf eines Spiels
function hsSpielInfo(g){ let h = 0, a = 0, hh = 0, ha = 0; const tore = [], rot = [];
  for(const e of g.v || []){ const min = e.m + (e.x ? '+' + e.x : '') + '.';
    if(e.t === 'tor' || e.t === 'elf' || e.t === 'et'){ if(e.s === 'h') h++; else a++; if(e.m <= 45){ hh = h; ha = a; }
      tore.push({ stand:h + ':' + a, n:e.t === 'et' ? 'Eigentor' : (e.n || '?'), min, zus:e.t === 'elf' ? 'Elfmeter' : '', wir:(e.s === 'h') === !!g.wh }); }
    else rot.push((e.n || '?') + ' (' + min + (e.t === 'gelbrot' ? ', Gelb-Rot' : '') + ')'); }
  const passt = h === g.th && a === g.tg;
  return { tore:passt ? tore : [], hz:passt ? hh + ':' + ha : null, rot, erg:g.th + ':' + g.tg,
    elf:[(g.start || []).join(', '), (g.ein || []).filter(e => e.n).length ? 'Eingewechselt: ' + g.ein.filter(e => e.n).map(e => e.n + ' (' + e.m + '.)').join(', ') : ''].filter(Boolean) }; }
function hsSeitenTitel(s, V){ const d = s.daten || {}, v = V || {};
  if(v.art === 'bericht' && v.g) return v.g.heim + ' - ' + v.g.gast + ' ' + v.g.th + ':' + v.g.tg;
  if(v.art === 'ergebnisse') return 'Ergebnisse der ' + (s.typ === 'erste' ? 'Ersten' : 'Zweiten');
  if(v.art === 'vorschau') return d.kopf || 'Die nächsten Spiele der ' + (s.typ === 'erste' ? 'Ersten' : 'Zweiten');
  return d.kopf || s.titel || ({ tabelle:'Tabellen', termine:'Termine und Heimspiele', training:'Trainingszeiten', impressum:'Impressum' })[s.typ] || ''; }

/* ---------- Was zeigt welche Berichtsseite? ---------- */
// Seiten der Ersten und Zweiten bekommen der Reihe nach die Spiele seit dem letzten Heft. Wer es anders will, stellt es an der Seite ein.
function hsVerteilen(S, auto, belegt){ const V = new Array(S.length).fill(null); belegt = belegt || new Set();
  for(const typ of ['erste', 'zweite']){ const sub = typ === 'erste' ? 'A' : 'D2', G = ((auto.spiele || {})[sub] || []), idx = S.map((s, i) => s.typ === typ ? i : -1).filter(i => i >= 0);
    const fest = new Set(idx.map(i => (S[i].daten || {}).art === 'bericht' ? (S[i].daten || {}).spiel : null).filter(Boolean)), frei = G.filter(g => !fest.has(g.id));
    const offen = idx.filter(i => !(S[i].daten || {}).art && !hsHatText(S[i]) && !belegt.has(i)); let vorschau = idx.some(i => (S[i].daten || {}).art === 'vorschau');
    idx.forEach(i => { const d = S[i].daten || {};
      if(d.art === 'bericht') V[i] = { art:'bericht', g:G.find(g => g.id === d.spiel) || null, sub };
      else if(d.art) V[i] = { art:d.art, sub };
      else if(hsHatText(S[i])) V[i] = { art:'text', sub };
      else if(belegt.has(i)) V[i] = { art:'fort', sub };
      else { const rest = offen.length - offen.indexOf(i) - 1;
        if(frei.length > 1 && rest === 0) V[i] = { art:'ergebnisse', sub, auto:true, liste:frei.splice(0) };
        else if(frei.length) V[i] = { art:'bericht', g:frei.shift(), sub, auto:true };
        else if(!vorschau){ V[i] = { art:'vorschau', sub, auto:true }; vorschau = true; }
        else V[i] = { art:'text', sub, auto:true, leer:true }; } }); }
  return V; }
function hsHatText(s){ const d = s.daten || {}; return !!(d.kopf || d.text || d.vorspann || d.foto); }

/* ---------- Rahmen jeder Inhaltsseite ---------- */
function hsRahmen(B, i, C, rubrik){ const nr = i + 1, re = nr % 2 === 1, X0 = 15, X1 = 195;
  const mx = re ? X1 - 11.5 : X0, slash = (x, f) => B.p([[x + 2.2, 13.2], [x + 6.4, 13.2], [x + 4.2, 20.2], [x, 20.2]], f);
  slash(mx, HS_C.blau); slash(mx + 5.1, HS_C.or);
  B.t(String(rubrik || '').toUpperCase(), re ? mx - 2.4 : mx + 13.6, 18.9, 'k', 10.5, HS_C.blau, { ls:.11, a:re ? 'r' : 'l' });
  B.t(('Doppelpass · ' + hsHeftMonat(C.heft)).toUpperCase(), re ? X0 : X1, 18.9, 'k', 7.4, HS_C.grau, { ls:.14, a:re ? 'l' : 'r' });
  B.l(X0, 23.6, X1, 23.6, HS_C.lin, .25);
  B.l(X0, 282.4, X1, 282.4, HS_C.lin, .25);
  B.t(String(nr), re ? X1 : X0, 289.4, 'h', 14, HS_C.blau, { a:re ? 'r' : 'l' });
  B.t('SV/BSC MÖRLENBACH', re ? X0 : X1, 288.6, 'k', 7.4, HS_C.grau, { ls:.14, a:re ? 'l' : 'r' }); }
// Überschrift mit Dachzeile und Vorspann. Gibt die nächste freie Höhe zurück.
function hsKopf(B, y, d, opt){ opt = opt || {}; const x = opt.x || 15, w = opt.w || 180;
  if(d.dach){ B.t(String(d.dach).toUpperCase(), x, y + 3.2, 'k', 9.5, HS_C.or, { ls:.12 }); y += 7.2; }
  if(d.kopf){ const t = String(d.kopf).toUpperCase(); let pt = opt.pt || 30, L = hsUmbruch(t, 'h', pt, w, true);
    while((L.length > 3 || L.some(l => l.w > w)) && pt > 17){ pt -= 2; L = hsUmbruch(t, 'h', pt, w, true); }
    const lh = pt * HS_MM * 1.0; L.slice(0, 5).forEach((l, i) => B.t(l.t, x, y + pt * HS_MM * .78 + i * lh, 'h', pt, HS_C.ink)); y += L.length * lh + 3.4; }
  if(d.vorspann){ y = B.abs(d.vorspann, x, y + 3.6, Math.min(w, 164), 'f', 10.6, HS_C.ink, { lh:5.1, max:6 }) + .6; }
  return y; }
function hsFoto(B, k, x, y, w, h, bu){ if(HS.B[k] && HS.B[k].url) B.b(k, x, y, w, h, { fit:'cover' }); else { B.r(x, y, w, h, HS_C.flaeche); B.hin(x, y, w, h, HS.B[k] === 'x' ? 'Das Foto ließ sich nicht laden' : 'Foto wird geladen'); }
  if(bu){ B.abs(bu, x, y + h + 4, w, 'i', 8, HS_C.grau, { max:2, lh:3.5 }); return y + h + 4 + 3.5 * Math.min(2, hsUmbruch(bu, 'i', 8, w).length) + 1; } return y + h + 4; }
// halbe Anzeige oder ganze Anzeige in ein Feld
function hsAnzeige(B, a, x, y, w, h, C){ if(!a){ B.hin(x, y, w, h, 'Hier ist noch Platz für eine Anzeige'); return; }
  const k = 'az:' + a.id; if(a.bild && HS.B[k] && HS.B[k].url){ B.b(k, x, y, w, h, { fit:'contain' }); return; }
  B.hin(x, y, w, h, shpKurz(a.firma) + (a.bild ? (HS.B[k] === 'x' ? ': Die Druckvorlage ließ sich nicht laden' : ': Druckvorlage wird geladen') : ': Druckvorlage fehlt'));
  if(!a.bild) B.warn.push('Die Druckvorlage von ' + shpKurz(a.firma) + ' fehlt.'); }

/* ---------- Die Seiten ---------- */
function hsTitel(B, s, i, C){ const d = s.daten || {}, h = C.heft, N = (C.auto.naechste || []);
  const heim = N.find(g => g.sub === 'A' && g.wh) || N.find(g => g.wh), vor = heim ? N.find(g => g !== heim && g.wh && g.d === heim.d) : null;
  B.r(-3, -3, 216, 303, HS_C.nacht);
  const fk = d.foto ? 'f:' + d.foto : null;
  if(fk && HS.B[fk] && HS.B[fk].url) B.b(fk, -3, 104, 216, 134, { fit:'cover', clip:[[-3, 118], [213, 104], [213, 224], [-3, 238]] });
  else { const yo = x => 118 - (x + 3) * 14 / 216, yu = x => 238 - (x + 3) * 14 / 216;
    B.p([[-3, 118], [213, 104], [213, 224], [-3, 238]], HS_C.blau);
    B.p([[104, yu(104)], [176, yo(176)], [204, yo(204)], [132, yu(132)]], HS_C.hell);
    B.p([[-3, 206], [44, yo(44)], [58, yo(58)], [-3, 228]], HS_C.weiss, { op:.1 });
    B.b('wappen', 46, 137, 118, 67, { fit:'contain' });
    if(fk) B.hin(20, 124, 170, 96, HS.B[fk] === 'x' ? 'Das Titelbild ließ sich nicht laden' : 'Titelbild wird geladen'); }
  // Kopf: Wappen links, Monat rechts
  if(fk && HS.B[fk] && HS.B[fk].url) B.b('wappen', 15, 13, 40, 22.7, { fit:'contain' });
  const mon = hsHeftMonat(h).toUpperCase(), mw = hsBreite(mon, 'h', 14, .06) + 12;
  B.p([[195 - mw + 3, 14], [195, 14], [195 - 3, 26], [195 - mw, 26]], HS_C.or); B.t(mon, 195 - mw / 2, 22.2, 'h', 14, HS_C.weiss, { ls:.06, a:'c' });
  // Wortmarke über die ganze Breite
  let pt = 120; const wa = t => hsBreite(t, 'h', pt, -.01); while(pt > 60 && wa('DOPPEL') + wa('PASS') > 180) pt -= 1;
  const yb = 44 + pt * HS_MM * .74; B.t('DOPPEL', 15, yb, 'h', pt, HS_C.weiss, { ls:-.01 }); B.t('PASS', 15 + wa('DOPPEL'), yb, 'h', pt, HS_C.or, { ls:-.01 });
  B.t('DAS STADIONHEFT DES SV/BSC MÖRLENBACH', 15.6, yb + 9.4, 'k', 11, HS_C.hell, { ls:.21 });
  // unten: das Spiel des Tages oder die eigene Zeile
  let y = 252;
  if(d.kopf){ B.t(String(d.dach || 'In diesem Heft').toUpperCase(), 15, y, 'k', 10.5, HS_C.hell, { ls:.16 }); y += 11.5;
    const L = hsUmbruch(String(d.kopf).toUpperCase(), 'h', 27, 180, true).slice(0, 2); L.forEach((l, j) => B.t(l.t, 15, y + j * 10, 'h', 27, HS_C.weiss)); y += L.length * 10 - 2; }
  else if(heim){ B.t(('Heimspiel · ' + hsTagLang(heim.d) + (heim.z ? ' · ' + heim.z + ' Uhr' : '')).toUpperCase(), 15, y, 'k', 10.5, HS_C.hell, { ls:.16 }); y += 11.5;
    B.tp((heim.heim + ' - ' + heim.gast).toUpperCase(), 15, y, 'h', 27, HS_C.weiss, 180); y += 8; }
  if(d.vorspann) B.abs(d.vorspann, 15, y, 180, 't', 10.5, HS_C.weiss, { max:2, lh:5 });
  else if(!d.kopf && vor) B.t('Vorspiel' + (vor.z ? ' um ' + vor.z + ' Uhr' : '') + ': ' + vor.heim + ' - ' + vor.gast, 15, y, 't', 10.5, HS_C.weiss, { op:.86 });
  B.l(15, 283, 195, 283, HS_C.weiss, .2); B.t('WESCHNITZTALSTADION', 15, 289, 'k', 7.6, HS_C.weiss, { ls:.18, op:.75 }); B.t('SV 1896 · BSC 1959', 195, 289, 'k', 7.6, HS_C.weiss, { ls:.18, a:'r', op:.75 }); }

function hsInhalt(B, s, i, C){ const d = s.daten || {}; hsRahmen(B, i, C, HS_RUBRIK.inhalt);
  let y = hsKopf(B, 31, { dach:d.dach || hsHeftMonat(C.heft), kopf:d.kopf || 'In diesem Heft', vorspann:d.vorspann }, { pt:40 }) + 4;
  const E = []; C.S.forEach((p, j) => { if(j === i || ['titel', 'anzeige', 'anzeigen', 'inhalt'].includes(p.typ) || (C.fort[j] != null)) return; const t = hsSeitenTitel(p, C.V[j]); if(t) E.push({ nr:j + 1, t, r:HS_RUBRIK[p.typ] || '' }); });
  const hatText = !!d.text, wL = hatText ? 104 : 180;
  E.slice(0, 22).forEach(e => { if(y > 268) return; B.t(String(e.nr).padStart(2, '0'), 15, y + 5.2, 'h', 19, HS_C.or);
    B.t(e.r.toUpperCase(), 29, y + 1.3, 'k', 7.4, HS_C.grau, { ls:.14 }); const L = hsUmbruch(e.t, 'f', 11.2, wL - 14).slice(0, 2); L.forEach((l, k) => B.t(l.t, 29, y + 6 + k * 4.9, 'f', 11.2, HS_C.ink));
    y += 9.4 + (L.length - 1) * 4.9; B.l(15, y, 15 + wL, y, HS_C.lin, .2); y += 3.6; });
  if(!E.length) B.hin(15, y, wL, 40, 'Das Verzeichnis füllt sich, sobald Seiten Überschriften haben');
  if(hatText){ B.r(127, 78, 68, 196, HS_C.flaeche); const Z = hsTextZeilen(d.text, 58, 9.2), rest = hsGiessen(B, Z, [{ x:132, y:84, w:58, h:184 }]);
    if(rest.length) B.warn.push('Der Text ist zu lang: ' + rest.length + ' Zeilen passen nicht mehr.'); } }

// Kasten mit Wappen und Ergebnis
function hsSpielKopf(B, y, g, sub, C){ const I = hsSpielInfo(g), H = 52; B.r(15, y, 180, H, HS_C.nacht); B.p([[15, y + H], [15, y + H - 9], [42, y + H]], HS_C.or); B.p([[195, y], [195, y + 9], [168, y]], HS_C.hell);
  B.t(((g.nr ? g.nr + '. Spiel · ' : '') + HS_LIGA[sub] + ' · ' + hsTagLang(g.d) + (g.z ? ' · ' + g.z + ' Uhr' : '')).toUpperCase(), 105, y + 8.4, 'k', 8, HS_C.hell, { ls:.15, a:'c' });
  const team = (name, cx) => { const k = hsWappenKey(name); if(HS.B[k] && HS.B[k].url) B.b(k, cx - 14, y + 13, 28, 19, { fit:'contain' }); else B.t(String(name).replace(/[^A-Za-zÄÖÜ]/g, '').slice(0, 1).toUpperCase(), cx, y + 28.4, 'h', 30, HS_C.weiss, { a:'c', op:.35 });
    const L = hsUmbruch(String(name).toUpperCase(), 'h', 11.5, 56).slice(0, 2); L.forEach((l, j) => B.t(l.t, cx, y + 39.6 + j * 4.7, 'h', 11.5, HS_C.weiss, { a:'c', ls:.02 })); };
  team(g.heim, 47); team(g.gast, 163);
  B.t(I.erg, 105, y + 33.6, 'h', 58, HS_C.weiss, { a:'c' });
  if(I.hz) B.t('HALBZEIT ' + I.hz, 105, y + 41.6, 'k', 8.6, HS_C.hell, { ls:.14, a:'c' });
  return { y:y + H, I }; }
function hsToreZeile(I){ return I.tore.map(t => t.stand + ' ' + t.n + ' (' + t.min + (t.zus ? ', ' + t.zus : '') + ')').join('  ·  '); }

function hsBericht(B, s, i, C, v){ const d = s.daten || {}, g = v.g; hsRahmen(B, i, C, HS_RUBRIK[s.typ]);
  if(!g){ B.hin(15, 31, 180, 60, 'Das gewählte Spiel gibt es in den Daten nicht mehr'); B.warn.push('Das gewählte Spiel fehlt in den Daten.'); return null; }
  const K = hsSpielKopf(B, 30, g, v.sub, C), I = K.I, hatText = !!(d.text || d.kopf || d.vorspann || d.foto); let y = K.y + 6.6;
  if(hatText){ // mit Text: Tore und Karten als knappe Zeilen
    if(I.tore.length){ B.t('TORE', 15, y, 'k', 8.4, HS_C.or, { ls:.14 }); y = B.abs(hsToreZeile(I), 29, y, 166, 't', 9, HS_C.ink, { lh:4.3, max:4 }) + .4; }
    if(I.rot.length){ B.t('ROT', 15, y, 'k', 8.4, HS_C.or, { ls:.14 }); y = B.abs(I.rot.join('  ·  '), 29, y, 166, 't', 9, HS_C.ink, { lh:4.3, max:2 }) + .4; }
    if(I.tore.length || I.rot.length){ y += 1.2; B.l(15, y, 195, y, HS_C.lin, .25); y += 5; } }
  else { // ohne Text: der Spielverlauf als Liste, damit die Seite trotzdem etwas erzählt
    B.t('SPIELVERLAUF', 15, y + 1, 'k', 9.5, HS_C.or, { ls:.12 }); y += 7;
    if(!I.tore.length && !I.rot.length){ y = B.abs(g.th + g.tg === 0 ? 'Keine Tore.' : 'Zu diesem Spiel liegt kein Verlauf vor.', 15, y + 3, 180, 't', 10, HS_C.grau) + 2; }
    const zwei = I.tore.length > 7, je = zwei ? Math.ceil(I.tore.length / 2) : I.tore.length, y0 = y;
    I.tore.forEach((t, k) => { const x = zwei && k >= je ? 109 : 15, yy = y0 + (zwei && k >= je ? k - je : k) * 9.2, w = zwei ? 86 : 180;
      B.r(x, yy, 13, 7, t.wir ? HS_C.blau : HS_C.flaeche); B.t(t.min.replace('.', '') + "'", x + 6.5, yy + 5, 'k', 9, t.wir ? HS_C.weiss : HS_C.grau, { a:'c' });
      B.t(t.stand, x + 17, yy + 5.3, 'h', 13, HS_C.ink); B.tp(t.n + (t.zus ? ' (' + t.zus + ')' : ''), x + 31, yy + 5.1, t.wir ? 'f' : 't', 10, HS_C.ink, w - 33); B.l(x, yy + 8.1, x + w, yy + 8.1, HS_C.lin, .2); });
    y = y0 + je * 9.2 + 2;
    if(I.rot.length){ B.t('ROT', 15, y + 3.4, 'k', 8.4, HS_C.or, { ls:.14 }); y = B.abs(I.rot.join('  ·  '), 29, y + 3.4, 166, 't', 9, HS_C.ink, { lh:4.3, max:2 }) + 2; } }
  // Aufstellung: steht hinter dem Text, bei langem Text unten auf der Seite
  const zeig = d.zeigen !== 'ohne' && I.elf.length, L = zeig ? I.elf.flatMap(t => hsUmbruch(t, 't', 8.4, 170)) : [], hh = zeig ? 9.4 + L.length * 3.9 : 0;
  const kasten = yk => { B.r(15, yk, 180, hh, HS_C.flaeche); B.t((/m(ö|oe)rlenbach/i.test(g.heim) ? g.heim : g.gast).toUpperCase(), 20, yk + 5.6, 'k', 7.8, HS_C.blau, { ls:.14 }); L.forEach((l, j) => B.t(l.t, 20, yk + 10.2 + j * 3.9, 't', 8.4, HS_C.ink)); };
  if(!hatText){ if(zeig) kasten(y + 4); B.hin(15, y + (zeig ? hh + 10 : 4), 180, 26, 'Zum Spiel fehlt noch der Text. Antippen und schreiben.'); B.warn.push('Zum Spiel fehlt noch der Text.'); return null; }
  const o = {}, rest = hsTextTeil(B, s, i, C, d, y, 278 - (zeig ? hh + 5 : 0), { ohneKopf:!d.kopf && !d.vorspann, ende:o });
  if(zeig) kasten(rest || o.y == null ? 278 - hh : Math.min(278 - hh, o.y + 6));
  return rest; }

// Überschrift, Foto und zweispaltiger Text zwischen zwei Höhen. Gibt die Zeilen zurück, die nicht mehr gepasst haben.
function hsTextTeil(B, s, i, C, d, y, unten, opt){ opt = opt || {};
  if(!opt.ohneKopf) y = hsKopf(B, y, d) + 2;
  if(d.foto){ const fh = Math.min(84, Math.max(46, (unten - y) * .42)); y = hsFoto(B, 'f:' + d.foto, 15, y, 180, fh, d.bu) + 2.4; }
  const Z = opt.zeilen || hsTextZeilen(d.text, 86, 9.4);
  if(!Z.length){ if(opt.ende) opt.ende.y = y - 4; return null; }
  const h = unten - y; if(h < 12){ B.warn.push('Für den Text ist kein Platz mehr auf der Seite.'); return Z; }
  // kurze Texte gleichmäßig auf beide Spalten verteilen
  const ges = Z.reduce((a, z) => a + z.h + z.vor, 0), hh = ges < h * 1.7 ? Math.min(h, Math.max(ges / 2 + 6, 24)) : h;
  const rest = hsGiessen(B, Z, [{ x:15, y, w:86, h:hh }, { x:109, y, w:86, h:hh }]); if(opt.ende) opt.ende.y = y + hh;
  return rest.length ? rest : null; }

function hsTextSeite(B, s, i, C, v){ const d = s.daten || {}, a = s.a ? C.A[s.a] : null; hsRahmen(B, i, C, HS_RUBRIK[s.typ] || 'Verein');
  let unten = 278; if(a || (s.a && !a)){ unten = 164; B.l(15, 169, 195, 169, HS_C.lin, .25); hsAnzeige(B, a, 15, 174, 180, 104, C); }
  const fort = C.fort[i];
  if(fort != null){ B.t(('Fortsetzung von Seite ' + (fort.von + 1)).toUpperCase(), 15, 34.2, 'k', 8.6, HS_C.or, { ls:.14 });
    return hsTextTeil(B, s, i, C, {}, 39, unten, { ohneKopf:true, zeilen:fort.zeilen }); }
  if(!hsHatText(s) && !d.dach){ B.hin(15, 31, 180, Math.min(120, unten - 31), 'Diese Seite ist noch leer. Antippen und Überschrift, Text und Foto setzen.'); B.warn.push('Die Seite ist noch leer.'); return null; }
  return hsTextTeil(B, s, i, C, d, 31, unten, {}); }

function hsSpielZeile(B, y, g, sub){ const I = hsSpielInfo(g), wir = n => /m(ö|oe)rlenbach/i.test(n);
  B.t(((g.nr ? g.nr + '. Spiel · ' : '') + hsTagKurz(g.d) + hsDat(g.d).getFullYear()).toUpperCase(), 15, y + 3.4, 'k', 7.6, HS_C.grau, { ls:.14 });
  B.tp(g.heim.toUpperCase(), 92, y + 11.4, 'h', 15, wir(g.heim) ? HS_C.blau : HS_C.ink, 76, { a:'r' }); B.tp(g.gast.toUpperCase(), 118, y + 11.4, 'h', 15, wir(g.gast) ? HS_C.blau : HS_C.ink, 76);
  B.r(94.5, y + 5, 21, 8.6, HS_C.nacht); B.t(I.erg, 105, y + 11.5, 'h', 15, HS_C.weiss, { a:'c' });
  let yy = y + 17.6; if(I.tore.length) yy = B.abs('Tore: ' + hsToreZeile(I), 15, yy, 180, 't', 8.4, HS_C.grau, { lh:3.9, max:3, a:'c' });
  B.l(15, yy + .6, 195, yy + .6, HS_C.lin, .2); return yy + 5.4; }
function hsErgebnisse(B, s, i, C, v){ const d = s.daten || {}, G = v.liste || (C.auto.spiele || {})[v.sub] || []; hsRahmen(B, i, C, HS_RUBRIK[s.typ]);
  let y = hsKopf(B, 31, { dach:d.dach || HS_LIGA[v.sub], kopf:d.kopf || 'Die letzten Spiele', vorspann:d.vorspann }) + 4;
  if(!G.length){ B.hin(15, y, 180, 50, 'Seit dem letzten Heft gibt es noch keine Ergebnisse'); return null; }
  let n = 0; for(const g of G){ if(y > 250) break; y = hsSpielZeile(B, y, g, v.sub); n++; }
  if(n < G.length) B.warn.push((G.length - n) + ' Spiele passen nicht mehr auf die Seite.');
  if(d.text && y < 250) return hsTextTeil(B, s, i, C, { text:d.text }, y + 2, 278, { ohneKopf:true }); return null; }
function hsTerminZeile(B, y, tag, titel, unter, opt){ const x = hsDat(tag); opt = opt || {};
  B.r(15, y, 17, 14.4, opt.heim ? HS_C.blau : HS_C.flaeche); B.t(String(x.getDate()).padStart(2, '0'), 23.5, y + 8.4, 'h', 17, opt.heim ? HS_C.weiss : HS_C.blau, { a:'c' });
  B.t(HS_MON[x.getMonth()].slice(0, 3).toUpperCase(), 23.5, y + 12.5, 'k', 6.8, opt.heim ? HS_C.weiss : HS_C.grau, { ls:.14, a:'c' });
  B.tp(titel, 37, y + 6.4, 'f', 11.4, HS_C.ink, 158); B.tp(unter, 37, y + 11.6, 't', 8.8, HS_C.grau, 158); return y + 17.6; }
function hsVorschau(B, s, i, C, v){ const d = s.daten || {}, N = (C.auto.naechste || []).filter(g => g.sub === v.sub); hsRahmen(B, i, C, HS_RUBRIK[s.typ]);
  let y = hsKopf(B, 31, { dach:d.dach || HS_LIGA[v.sub], kopf:d.kopf || 'Die nächsten Spiele', vorspann:d.vorspann }) + 4;
  if(!N.length) B.hin(15, y, 180, 40, 'Es sind noch keine weiteren Spiele angesetzt');
  N.slice(0, d.text ? 6 : 12).forEach(g => { y = hsTerminZeile(B, y, g.d, g.heim + ' - ' + g.gast, HS_TAG[hsDat(g.d).getDay()] + (g.z ? ', ' + g.z + ' Uhr' : '') + ' · ' + (g.wh ? 'Heimspiel im Weschnitztalstadion' : 'auswärts'), { heim:g.wh }); });
  if(d.text) return hsTextTeil(B, s, i, C, { text:d.text }, y + 3, 278, { ohneKopf:true }); return null; }

function hsTabelle(B, s, i, C){ const d = s.daten || {}, T = C.auto.tabelle || {}, subs = (d.welche && d.welche !== 'beide' ? [d.welche] : ['A', 'D2']).filter(k => (T[k] || []).length); hsRahmen(B, i, C, HS_RUBRIK.tabelle);
  let y = 31; if(!subs.length){ B.hin(15, y, 180, 60, 'Es liegt noch keine Tabelle vor'); B.warn.push('Es liegt noch keine Tabelle vor.'); return; }
  const SP = [['SP', 121], ['S', 131], ['U', 140], ['N', 149], ['TORE', 166], ['DIFF', 179], ['PKT', 193]], zh = subs.length > 1 ? 6.05 : 7.4;
  subs.forEach((k, n) => { B.t(HS_LIGA[k].toUpperCase(), 15, y + 8.2, 'h', 24, HS_C.ink); if(C.auto.tabelle_stand) B.t(('Stand ' + hsDatum(C.auto.tabelle_stand)).toUpperCase(), 195, y + 8.2, 'k', 7.6, HS_C.grau, { ls:.14, a:'r' });
    y += 14; B.t('PL', 20, y, 'k', 7, HS_C.grau, { ls:.12, a:'c' }); B.t('VEREIN', 27, y, 'k', 7, HS_C.grau, { ls:.12 }); SP.forEach(c => B.t(c[0], c[1], y, 'k', 7, HS_C.grau, { ls:.12, a:'r' })); y += 2;
    T[k].forEach((z, j) => { const wir = z.wir, c = wir ? HS_C.weiss : HS_C.ink; if(wir) B.r(15, y, 180, zh, HS_C.blau); else if(j % 2 === 0) B.r(15, y, 180, zh, HS_C.flaeche);
      const yb = y + zh * .7; B.t(String(z.pl), 20, yb, 'h', 10.5, wir ? HS_C.weiss : HS_C.blau, { a:'c' }); B.tp(z.club, 27, yb, wir ? 'f' : 't', 9.4, c, 84);
      [z.sp, z.s, z.u, z.n, z.t + ':' + z.gt, (z.t - z.gt > 0 ? '+' : '') + (z.t - z.gt)].forEach((w, q) => B.t(String(w), SP[q][1], yb, 't', 9.2, c, { a:'r' })); B.t(String(z.pkt), 193, yb, 'h', 10.5, c, { a:'r' }); y += zh; });
    y += n < subs.length - 1 ? 9 : 4; });
  if(d.text) B.abs(d.text, 15, y + 4, 180, 't', 9, HS_C.grau, { lh:4.3, max:5 }); }

function hsTermine(B, s, i, C){ const d = s.daten || {}, weg = new Set(d.weg || []); hsRahmen(B, i, C, HS_RUBRIK.termine);
  let y = hsKopf(B, 31, { dach:d.dach || 'Was ansteht', kopf:d.kopf || 'Termine', vorspann:d.vorspann }) + 4;
  const L = (C.auto.naechste || []).filter(g => g.wh).slice(0, 6).map(g => ({ d:g.d, t:g.heim + ' - ' + g.gast, u:HS_TAG[hsDat(g.d).getDay()] + (g.z ? ', ' + g.z + ' Uhr' : '') + ' · ' + HS_LIGA[g.sub] + ' · Weschnitztalstadion', heim:true }))
    .concat((C.auto.termine || []).filter(e => !weg.has(e.id)).map(e => ({ d:e.d, t:e.titel, u:[HS_TAG[hsDat(e.d).getDay()] + (e.z ? ', ' + e.z + (e.zb ? ' bis ' + e.zb : '') + ' Uhr' : ''), e.ende && e.ende !== e.d ? 'bis ' + hsTagKurz(e.ende) : '', e.ort].filter(Boolean).join(' · ') })))
    .concat((d.extra || []).filter(e => e && hsDat(e.d) && e.t).map(e => ({ d:e.d, t:e.t, u:e.u || HS_TAG[hsDat(e.d).getDay()] })))
    .sort((a, b) => a.d < b.d ? -1 : a.d > b.d ? 1 : 0);
  if(!L.length){ B.hin(15, y, 180, 50, 'Für die nächsten Wochen steht noch nichts im Kalender'); return; }
  let n = 0; for(const e of L){ if(y > 262) break; y = hsTerminZeile(B, y, e.d, e.t, e.u, { heim:e.heim }); n++; }
  if(n < L.length) B.warn.push((L.length - n) + ' Termine passen nicht mehr auf die Seite.'); }

function hsTraining(B, s, i, C){ const d = Object.keys(s.daten || {}).length ? s.daten : ((C.auto.vorlage || {}).training || {}), Z = (d.zeilen || []).filter(z => z && z.m); hsRahmen(B, i, C, HS_RUBRIK.training);
  let y = hsKopf(B, 31, { dach:d.dach || 'Komm vorbei', kopf:d.kopf || 'Trainingszeiten', vorspann:d.vorspann }) + 5;
  if(!Z.length){ B.hin(15, y, 180, 60, 'Die Trainingszeiten sind noch nicht eingetragen'); B.warn.push('Die Trainingszeiten fehlen.'); return; }
  const X = [15, 62, 116, 152], Wd = [44, 51, 33, 43]; ['MANNSCHAFT', 'ZEITEN', 'ORT', 'TRAINER'].forEach((t, k) => B.t(t, X[k] + (k ? 0 : 3), y, 'k', 7, HS_C.grau, { ls:.12 })); y += 2.2;
  const pt = Z.length > 16 ? 8 : 8.8, lh = pt * HS_MM * 1.28; let n = 0;
  for(const z of Z){ const L = [z.m, z.z, z.o, z.t].map((t, k) => hsUmbruch(String(t || '').replace(/\s*\n\s*/g, ' · '), k ? 't' : 'f', pt, Wd[k] - (k ? 0 : 3))), hh = Math.max(1, ...L.map(l => l.length)) * lh + 3.4;
    if(y + hh > 278){ B.warn.push((Z.length - n) + ' Zeilen der Trainingszeiten passen nicht mehr auf die Seite.'); break; }
    if(n % 2 === 0) B.r(15, y, 180, hh, HS_C.flaeche); L.forEach((l, k) => l.forEach((q, j) => B.t(q.t, X[k] + (k ? 0 : 3), y + 1.4 + lh * .8 + j * lh, k ? 't' : 'f', pt, k ? HS_C.ink : HS_C.blau))); y += hh; n++; }
  if(d.text && y < 262) B.abs(d.text, 15, y + 7, 180, 't', 9, HS_C.grau, { lh:4.3, max:4 }); }

function hsImpressum(B, s, i, C){ const d = Object.keys(s.daten || {}).length ? s.daten : ((C.auto.vorlage || {}).impressum || {}); hsRahmen(B, i, C, HS_RUBRIK.impressum);
  let y = hsKopf(B, 31, { dach:d.dach || 'Doppelpass', kopf:d.kopf || 'Impressum' }) + 4;
  if(d.text){ const rest = hsGiessen(B, hsTextZeilen(d.text, 86, 9.4), [{ x:15, y, w:86, h:236 - y }]); if(rest.length) B.warn.push('Der Text ist zu lang: ' + rest.length + ' Zeilen passen nicht mehr.'); }
  else { B.hin(15, y, 86, 60, 'Der Text fürs Impressum fehlt noch'); B.warn.push('Der Text fürs Impressum fehlt.'); }
  const P = Object.values(C.A).map(a => shpKurz(a.firma)).sort((a, b) => a.localeCompare(b, 'de'));
  if(P.length){ const pt = P.length > 34 ? 8 : 8.8, lh = pt * HS_MM * 1.42, hh = Math.min(236 - y, 15 + P.length * lh + 5); B.r(109, y, 86, hh, HS_C.flaeche); B.t('UNSERE PARTNER IN DIESEM HEFT', 115, y + 8, 'k', 8, HS_C.blau, { ls:.14 });
    P.forEach((n, j) => { if(15 + j * lh < hh - 3) B.tp(n, 115, y + 15 + j * lh, 't', pt, HS_C.ink, 74); }); }
  B.b('wappen', 15, 244, 52, 29.6, { fit:'contain' }); B.abs('Der SV/BSC dankt allen Partnern. Wer sie bei der nächsten Entscheidung berücksichtigt, hilft dem Verein.', 74, 255, 121, 'i', 9.4, HS_C.grau, { lh:4.5, max:3 }); }

function hsAnzeigenSeite(B, s, i, C){ const a = s.a ? C.A[s.a] : null, b = s.b ? C.A[s.b] : null;
  if(s.typ === 'anzeige'){ if(!a){ B.hin(12, 12, 186, 273, 'Für diese Seite ist noch keine Anzeige gewählt'); B.warn.push('Für die Seite ist noch keine Anzeige gewählt.'); } else hsAnzeige(B, a, 10, 10, 190, 277, C); return; }
  hsAnzeige(B, a, 12, 13, 186, 129, C); B.l(30, 148.5, 180, 148.5, HS_C.lin, .25); hsAnzeige(B, b, 12, 155, 186, 129, C);
  if(!a && !b) B.warn.push('Auf der Seite steht noch keine Anzeige.'); }

/* ---------- Das ganze Heft ---------- */
// C: { heft, S (Seiten), A (Anzeigen nach id), auto }. Gibt je Seite { o (Bausteine), warn } zurück.
// Text, der nicht passt, läuft auf die nächste Seite derselben Sorte weiter, wenn die nichts Eigenes hat. Die Spiele rücken dann eine Seite nach hinten,
// deshalb wird das Heft so oft gesetzt, bis sich an den Fortsetzungen nichts mehr ändert (höchstens viermal).
function hsHeft(C){ C.auto = C.auto || {}; let belegt = new Set(), out = [];
  for(let runde = 0; runde < 4; runde++){ C.V = hsVerteilen(C.S, C.auto, belegt); C.fort = {}; out = []; const neu = new Set();
    C.S.forEach((s, i) => { const B = hsBlatt(), v = C.V[i]; let rest = null;
      try{
        if(s.typ === 'titel') hsTitel(B, s, i, C); else if(s.typ === 'inhalt') hsInhalt(B, s, i, C); else if(s.typ === 'tabelle') hsTabelle(B, s, i, C); else if(s.typ === 'termine') hsTermine(B, s, i, C);
        else if(s.typ === 'training') hsTraining(B, s, i, C); else if(s.typ === 'impressum') hsImpressum(B, s, i, C); else if(s.typ === 'anzeige' || s.typ === 'anzeigen') hsAnzeigenSeite(B, s, i, C);
        else if(C.fort[i] != null) rest = hsTextSeite(B, s, i, C, v);
        else if(v && v.art === 'bericht') rest = hsBericht(B, s, i, C, v); else if(v && v.art === 'ergebnisse') rest = hsErgebnisse(B, s, i, C, v); else if(v && v.art === 'vorschau') rest = hsVorschau(B, s, i, C, v);
        else rest = hsTextSeite(B, s, i, C, v);
      }catch(e){ B.o.length = 0; B.hin(15, 30, 180, 60, 'Diese Seite ließ sich nicht setzen'); B.warn.push('Die Seite ließ sich nicht setzen: ' + (e && e.message || e)); }
      if(rest && rest.length){ const n = C.S[i + 1];
        if(n && n.typ === s.typ && !hsHatText(n) && !(n.daten || {}).art){ C.fort[i + 1] = { von:C.fort[i] != null ? C.fort[i].von : i, zeilen:rest }; neu.add(i + 1); }
        else B.warn.push('Der Text ist zu lang: ' + rest.length + ' Zeilen passen nicht mehr. Kürzen oder dahinter eine leere Seite derselben Sorte einfügen.'); }
      out.push({ o:B.o, warn:B.warn }); });
    if(neu.size === belegt.size && [...neu].every(x => belegt.has(x))) break; belegt = neu; }
  return out; }

/* ---------- Zeichnen: Vorschau (SVG) ---------- */
function hsX(t){ return String(t).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;'); }
function hsLage(q, bild){ const m = q.fit === 'contain' ? Math.min(q.w / bild.w, q.h / bild.h) : Math.max(q.w / bild.w, q.h / bild.h), w = bild.w * m, h = bild.h * m; return { x:q.x + (q.w - w) / 2, y:q.y + (q.h - h) / 2, w, h }; }
let hsSvgNr = 0;
function hsSvg(ops, titel){ let s = ''; const n2 = v => +(+v).toFixed(3);
  for(const q of ops){ const op = q.op != null ? ` opacity="${q.op}"` : '';
    if(q.o === 'r') s += `<rect x="${n2(q.x)}" y="${n2(q.y)}" width="${n2(q.w)}" height="${n2(q.h)}" fill="${q.f || 'none'}"${op}/>`;
    else if(q.o === 'p') s += `<polygon points="${q.pts.map(p => n2(p[0]) + ',' + n2(p[1])).join(' ')}" fill="${q.f}"${op}/>`;
    else if(q.o === 'l') s += `<line x1="${n2(q.x1)}" y1="${n2(q.y1)}" x2="${n2(q.x2)}" y2="${n2(q.y2)}" stroke="${q.s}" stroke-width="${q.b}"/>`;
    else if(q.o === 't') s += `<text x="${n2(q.x)}" y="${n2(q.y)}" font-family="${HS_FONT[q.f][1]}" font-size="${n2(q.pt * HS_MM)}" fill="${q.c}"${q.ls ? ` letter-spacing="${n2(q.ls * q.pt * HS_MM)}"` : ''}${op} xml:space="preserve">${hsX(q.t)}</text>`;
    else if(q.o === 'b'){ const bild = HS.B[q.k]; if(!bild || !bild.url) continue; const L = hsLage(q, bild), id = 'hsc' + (++hsSvgNr);
      s += `<clipPath id="${id}">${q.clip ? `<polygon points="${q.clip.map(p => n2(p[0]) + ',' + n2(p[1])).join(' ')}"/>` : `<rect x="${n2(q.x)}" y="${n2(q.y)}" width="${n2(q.w)}" height="${n2(q.h)}"/>`}</clipPath><image href="${hsX(bild.url)}" x="${n2(L.x)}" y="${n2(L.y)}" width="${n2(L.w)}" height="${n2(L.h)}" preserveAspectRatio="none" clip-path="url(#${id})"/>`; }
    else if(q.o === 'h'){ s += `<rect class="hs-hin" x="${n2(q.x + .4)}" y="${n2(q.y + .4)}" width="${n2(q.w - .8)}" height="${n2(q.h - .8)}" fill="#f6f1e6" stroke="#b9892f" stroke-width=".35" stroke-dasharray="1.6 1.4"/>`;
      hsUmbruch(q.t, 'f', 9.5, Math.max(20, q.w - 12)).slice(0, 4).forEach((l, j, L) => { s += `<text class="hs-hin" x="${n2(q.x + q.w / 2 - l.w / 2)}" y="${n2(q.y + q.h / 2 + (j - (L.length - 1) / 2) * 4.6 + 1.2)}" font-family="${HS_FONT.f[1]}" font-size="${n2(9.5 * HS_MM)}" fill="#7a5a14">${hsX(l.t)}</text>`; }); } }
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${HS.W} ${HS.H}" class="hs-svg" role="img" aria-label="${hsX(titel || 'Seite')}"><rect width="${HS.W}" height="${HS.H}" fill="#fff"/>${s}</svg>`; }

/* ---------- Schreiben: Druckdatei (PDF) ---------- */
// rand: Beschnitt in Millimetern (0 oder 3). Flächen, die über den Seitenrand hinausgehen, füllen dann den Beschnitt.
function hsPdfSeite(doc, ops, rand){ const dx = rand || 0, rgb = c => [parseInt(c.slice(1, 3), 16), parseInt(c.slice(3, 5), 16), parseInt(c.slice(5, 7), 16)];
  const gs = op => { if(doc.GState) doc.setGState(new doc.GState({ opacity:op, 'stroke-opacity':op })); }, weg = pts => pts.slice(1).map((p, k) => [p[0] - pts[k][0], p[1] - pts[k][1]]);
  for(const q of ops){ if(q.o === 'h') continue; if(q.op != null) gs(q.op);
    if(q.o === 'r'){ doc.setFillColor(...rgb(q.f)); doc.rect(q.x + dx, q.y + dx, q.w, q.h, 'F'); }
    else if(q.o === 'p'){ doc.setFillColor(...rgb(q.f)); doc.lines(weg(q.pts), q.pts[0][0] + dx, q.pts[0][1] + dx, [1, 1], 'F', true); }
    else if(q.o === 'l'){ doc.setDrawColor(...rgb(q.s)); doc.setLineWidth(q.b); doc.line(q.x1 + dx, q.y1 + dx, q.x2 + dx, q.y2 + dx); }
    else if(q.o === 't'){ doc.setFont(HS_FONT[q.f][1], 'normal'); doc.setFontSize(q.pt); doc.setTextColor(...rgb(q.c)); doc.text(q.t, q.x + dx, q.y + dx, q.ls ? { charSpace:q.ls * q.pt * HS_MM } : undefined); }
    else if(q.o === 'b'){ const bild = HS.B[q.k]; if(!bild || !bild.daten) continue; const L = hsLage(q, bild);
      doc.saveGraphicsState(); if(q.clip) doc.lines(weg(q.clip), q.clip[0][0] + dx, q.clip[0][1] + dx, [1, 1], null, true); else doc.rect(q.x + dx, q.y + dx, q.w, q.h, null); doc.clip(); doc.discardPath();
      doc.addImage(bild.daten, bild.art, L.x + dx, L.y + dx, L.w, L.h, 'b' + bild.nr, 'FAST'); doc.restoreGraphicsState(); }
    if(q.op != null) gs(1); } }
async function hsPdf(seiten, opt){ opt = opt || {}; const rand = opt.beschnitt ? 3 : 0, doc = hsNeuDoc({ format:[HS.W + 2 * rand, HS.H + 2 * rand] });
  doc.setProperties({ title:opt.titel || 'Doppelpass', creator:'SV/BSC Sportzentrale' });
  for(let i = 0; i < seiten.length; i++){ if(i) doc.addPage([HS.W + 2 * rand, HS.H + 2 * rand]); hsPdfSeite(doc, seiten[i].o, rand); if(opt.schritt){ opt.schritt(i + 1, seiten.length); await new Promise(r => setTimeout(r, 0)); } }
  return doc.output('blob'); }

/* ---------- Bilder: einlesen, verkleinern, merken ---------- */
let hsBildNr = 0;
// Quelle: Blob oder Adresse. JPEG bleibt, wie es ist. Alles andere wird zu PNG (wegen durchsichtiger Flächen bei Wappen).
async function hsBildLaden(key, quelle){ try{ const blob = quelle instanceof Blob ? quelle : await fetch(quelle).then(r => { if(!r.ok) throw new Error('fehlt'); return r.blob(); });
    const url = URL.createObjectURL(blob), img = await new Promise((ok, nein) => { const im = new Image(); im.onload = () => ok(im); im.onerror = () => nein(new Error('kein Bild')); im.src = url; });
    const w = img.naturalWidth || 300, h = img.naturalHeight || 150, jpg = /jpe?g/i.test(blob.type); let daten;
    if(jpg) daten = new Uint8Array(await blob.arrayBuffer());
    else { const m = Math.min(1, 1600 / Math.max(w, h)), c = document.createElement('canvas'); c.width = Math.max(1, Math.round(w * m)); c.height = Math.max(1, Math.round(h * m)); c.getContext('2d').drawImage(img, 0, 0, c.width, c.height); daten = c.toDataURL('image/png'); }
    HS.B[key] = { url, w, h, daten, art:jpg ? 'JPEG' : 'PNG', nr:++hsBildNr }; return HS.B[key]; }
  catch(e){ HS.B[key] = 'x'; return null; } }
// Foto fürs Hochladen: längste Seite höchstens 2600 Pixel, als JPEG
async function hsBildKlein(file, max){ const url = URL.createObjectURL(file); try{ const img = await new Promise((ok, nein) => { const im = new Image(); im.onload = () => ok(im); im.onerror = () => nein(new Error('Das Bild ließ sich nicht lesen.')); im.src = url; });
    const w = img.naturalWidth, h = img.naturalHeight, m = Math.min(1, (max || 2600) / Math.max(w, h));
    if(m === 1 && /jpe?g/i.test(file.type) && file.size < 3.5e6) return { blob:file, w, h };
    const c = document.createElement('canvas'); c.width = Math.round(w * m); c.height = Math.round(h * m); const x = c.getContext('2d'); x.fillStyle = '#fff'; x.fillRect(0, 0, c.width, c.height); x.drawImage(img, 0, 0, c.width, c.height);
    const blob = await new Promise(ok => c.toBlob(ok, 'image/jpeg', .9)); if(!blob) throw new Error('Das Bild ließ sich nicht verkleinern.'); return { blob, w:c.width, h:c.height }; }
  finally{ URL.revokeObjectURL(url); } }

/* =====================================================================
   Beta 0.99.31 · Stadionheft, Stufe 3: Vorschau zum Blättern, Texte und Fotos an der Seite, Druckdatei
   Albert, 14.11.2026: „Hochwertig, nicht mehr die Word-Vorlage. Druck bei Reproplan.“
   - Das Heft liegt als Doppelseite da und lässt sich blättern (Pfeile, Wischen, Pfeiltasten). Auf dem Handy eine Seite.
   - Seite antippen: Überschrift, Text, Foto setzen. Die Seite zeigt beim Tippen sofort, wie es gedruckt aussieht.
   - Was von selbst kommt (Spiele, Tabellen, Termine), steht schon da. Die Redaktion schreibt nur, was fehlt.
   - „Druckdatei“ schreibt das PDF für die Druckerei. Vorher zeigt die Liste, was noch fehlt.
   Gesetzt wird in svm105.js. Speichern geht über stadionheft_seite_inhalt (162).
   Seit 0.99.32: „Text vorschlagen“. Die KI (Edge Function heft-ki) schreibt aus den Daten der App und den Stichworten der Redaktion
   einen Spielbericht, eine Vorschau oder die Begrüßung, oder glättet einen eigenen Text. Angenommene Vorschläge gelten als ungeprüft
   (daten.ki = 'offen'), bis jemand „Text geprüft“ abhakt; solange steht die Seite in der Liste „Vor dem Druck“.
   ===================================================================== */
const HV = { heft:null, d:null, auto:null, P:null, C:null, i:0, ed:null, entwurf:null, neu:false, pf:{}, laedt:new Set(), wappen:null, zeit:null, blaettert:false, stich:{} };
const hvE = t => shE(t == null ? '' : String(t));

/* ---------- Einstieg ---------- */
function hvOeffnen(id, seite){ HV.heft = id; HV.d = null; HV.auto = null; HV.P = null; HV.i = seite || 0; HV.ed = null; HV.entwurf = null; HV.neu = false; if(typeof SHP !== 'undefined') SHP.heft = null;
  const B = shOrt(); if(B) hvRender(B); try{ window.scrollTo(0, 0); }catch(e){} }
function hvZu(){ HV.heft = null; HV.d = null; HV.ed = null; const B = shOrt(); if(B) shRender(B); }
if(typeof shRender === 'function'){ const _r = shRender; shRender = function(B){ if(HV.heft && shAn()) return hvRender(B); return _r.apply(this, arguments); }; }
if(typeof shBinden === 'function'){ const _b = shBinden; shBinden = function(B){ const r = _b.apply(this, arguments); B.querySelectorAll('[data-sh-satz]').forEach(b => b.onclick = () => hvOeffnen(b.dataset.shSatz)); return r; }; }

/* ---------- Laden und Setzen ---------- */
async function hvLaden(){ const [d, auto] = await Promise.all([shRpc('stadionheft_plan', { p_heft:HV.heft }), shRpc('stadionheft_inhalt', { p_heft:HV.heft }), hsBereit()]); HV.d = d; HV.auto = auto || {};
  HV.d.seiten.forEach(s => { s.daten = s.daten || {}; }); if(HV.i >= d.seiten.length) HV.i = Math.max(0, d.seiten.length - 1); hvSetzen(); hvBilder(); }
function hvSeiten(){ return HV.d.seiten.map((s, i) => HV.ed === i && HV.entwurf ? Object.assign({}, s, { daten:hvSauber(HV.entwurf) }) : s); }
function hvSetzen(){ const A = {}; (HV.d.anzeigen || []).forEach(a => { A[a.id] = a; }); HV.C = { heft:HV.d.heft, S:hvSeiten(), A, auto:HV.auto }; HV.P = hsHeft(HV.C); return HV.P; }
function hvSauber(d){ const o = {}; for(const k in d){ const v = d[k]; if(v == null || v === '' || (Array.isArray(v) && !v.length)) continue; o[k] = typeof v === 'string' ? v.replace(/\r/g, '').replace(/[ \t]+\n/g, '\n').trim() : v; if(o[k] === '') delete o[k]; } return o; }

/* ---------- Bilder: Wappen, Druckvorlagen, Fotos ---------- */
async function hvWappenListe(){ if(HV.wappen) return HV.wappen; try{ const r = await fetch('plakat/wappen.json'); const j = await r.json(); HV.wappen = {}; (j.wappen || []).forEach(w => { HV.wappen[hsNorm(w.name)] = w.datei; }); }catch(e){ HV.wappen = {}; } return HV.wappen; }
async function hvHolen(key, pfad){ if(HV.laedt.has(key) || (HV.pf[key] === pfad && HV.B_ok(key))) return false; HV.laedt.add(key);
  try{ const { data, error } = await SVB.sb.storage.from('stadionheft').download(pfad); if(error || !data) throw new Error('fehlt'); await hsBildLaden(key, data); HV.pf[key] = pfad; }
  catch(e){ HS.B[key] = 'x'; HV.pf[key] = pfad; } finally{ HV.laedt.delete(key); } return true; }
HV.B_ok = key => !!HS.B[key];
// lädt, was das Heft braucht: zuerst die Seiten, die gerade zu sehen sind. Nach jedem Schwung wird neu gezeichnet.
async function hvBilder(){ const d = HV.d, heft = HV.heft; if(!d) return; const auf = [], W = await hvWappenListe(); if(HV.heft !== heft) return;
  if(!HS.B.wappen) auf.push(['wappen', null, 'plakat/wappen/svbsc-moerlenbach.webp']);
  const namen = new Set(); [...((HV.auto.spiele || {}).A || []), ...((HV.auto.spiele || {}).D2 || []), ...(HV.auto.naechste || [])].forEach(g => { namen.add(g.heim); namen.add(g.gast); });
  namen.forEach(n => { const k = hsWappenKey(n); if(k !== 'wappen' && !HS.B[k] && W[hsNorm(n)]) auf.push([k, null, 'plakat/wappen/' + W[hsNorm(n)]]); });
  const sicht = new Set(hvPaar().filter(x => x != null)), vorn = [], hinten = [];
  d.seiten.forEach((s, i) => { const L = sicht.has(i) ? vorn : hinten; [s.a, s.b].forEach(id => { const a = id && (d.anzeigen || []).find(x => x.id === id); if(a && a.bild) L.push(['az:' + a.id, a.bild]); });
    const f = (HV.ed === i && HV.entwurf ? HV.entwurf : s.daten || {}).foto; if(f) L.push(['f:' + f, f]); });
  const tun = [...auf, ...vorn, ...hinten].filter(x => x[2] ? !HS.B[x[0]] : !(HS.B[x[0]] && HV.pf[x[0]] === x[1])); if(!tun.length) return;
  let n = 0; const einer = async () => { while(tun.length){ const x = tun.shift(); if(HV.heft !== heft) return; const neu = x[2] ? !!(await hsBildLaden(x[0], x[2])) : await hvHolen(x[0], x[1]); if(neu && ++n % 3 === 0) hvNeuZeichnen(); } };
  await Promise.all([einer(), einer(), einer(), einer()]); if(HV.heft === heft) hvNeuZeichnen(); }
function hvNeuZeichnen(){ if(!HV.heft || !HV.d || HV.blaettert) return; hvSetzen(); const B = shOrt(); if(B && B.querySelector('#hvBuch')){ hvBuch(B); hvHinweise(B); } }

/* ---------- Ansicht ---------- */
function hvBreit(){ const B = shOrt(); return (B && B.clientWidth ? B.clientWidth : innerWidth) >= 760 && HV.ed == null; }
// Die Seiten, die gerade aufgeschlagen sind: [links, rechts] oder [eine]
function hvPaar(i){ i = i == null ? HV.i : i; const n = HV.d ? HV.d.seiten.length : 0; if(!n) return []; if(!hvBreit()) return [i];
  if(i === 0) return [null, 0]; const li = i % 2 === 1 ? i : i - 1; return [li, li + 1 < n ? li + 1 : null]; }
async function hvRender(B){
  if(!HV.d) B.innerHTML = '<div class="card"><div class="empty">Setze das Heft …</div></div>';
  try{ if(!HV.d) await hvLaden(); }catch(e){ B.innerHTML = `<div class="card"><div class="empty">${hvE(e.message)}</div><button type="button" class="btn ghost" id="hvZu">Zurück</button></div>`; const z = B.querySelector('#hvZu'); if(z) z.onclick = hvZu; return; }
  if(!B.isConnected || !HV.heft) return; hvMalen(B); }
function hvMalen(B){ const d = HV.d, h = d.heft, n = d.seiten.length, darf = !!d.planen;
  B.innerHTML = `<div class="hv" id="hv"><div class="card hv-kopf"><div class="shp-kz"><button type="button" class="btn ghost shp-zu" id="hvZu">Zurück</button><div><h2>${hvE(h.titel)}</h2>
        <p class="sh-sub">${!n ? 'Für dieses Heft gibt es noch keinen Seitenplan.' : darf ? 'Blättern mit den Pfeilen oder durch Wischen. Seite antippen, um Text und Foto zu setzen.' : 'Blättern mit den Pfeilen oder durch Wischen.'}</p></div></div>
      <div class="sh-akt">${n ? '<button type="button" class="btn" id="hvDruck">Druckdatei</button>' : ''}<button type="button" class="btn ghost" id="hvPlan">Seiten planen</button></div></div>
    ${n ? `<div class="hv-haupt" id="hvHaupt"><div class="hv-links"><div class="hv-buehne"><button type="button" class="hv-nav" id="hvVor" aria-label="Zurückblättern">‹</button><div class="hv-buch" id="hvBuch"></div><button type="button" class="hv-nav" id="hvWeiter" aria-label="Weiterblättern">›</button></div>
        <div class="hv-wo" id="hvWo" aria-live="polite"></div><div class="hv-leiste" id="hvLeiste" role="group" aria-label="Seiten"></div></div><div class="hv-ed" id="hvEd" hidden></div></div><div id="hvHin"></div>`
      : `<div class="card"><p class="sh-leer">${h.status === 'gedruckt' ? 'Dieses Heft ist vor dem Heftplaner entstanden. Das gedruckte Heft findest du in der Liste der bisherigen Hefte.' : 'Unter „Seiten planen“ baut „Von selbst ordnen“ das Heft aus den Anzeigen und einem üblichen Aufbau. Danach steht hier die Vorschau.'}</p></div>`}</div>`;
  B.querySelector('#hvZu').onclick = () => hvVerlassen().then(ok => { if(ok) hvZu(); });
  B.querySelector('#hvPlan').onclick = () => hvVerlassen().then(ok => { if(!ok) return; const id = HV.heft; HV.heft = null; HV.d = null; shpOeffnen(id); });
  if(!n) return;
  B.querySelector('#hvDruck').onclick = () => hvVerlassen().then(ok => { if(ok) hvDruckDialog(); });
  B.querySelector('#hvVor').onclick = () => hvBlaettern(-1); B.querySelector('#hvWeiter').onclick = () => hvBlaettern(1);
  const buch = B.querySelector('#hvBuch'); let px = null;
  buch.addEventListener('pointerdown', e => { px = { x:e.clientX, y:e.clientY }; });
  buch.addEventListener('pointerup', e => { if(!px) return; const dx = e.clientX - px.x, dy = e.clientY - px.y; px = null;
    if(Math.abs(dx) > 46 && Math.abs(dx) > Math.abs(dy) * 1.4){ hvBlaettern(dx < 0 ? 1 : -1); return; }
    if(Math.abs(dx) < 8 && Math.abs(dy) < 8){ const el = e.target.closest('.hv-seite[data-i]'); if(el) hvWaehlen(+el.dataset.i); } });
  buch.addEventListener('keydown', e => { if(e.key === 'Enter' || e.key === ' '){ const el = e.target.closest('.hv-seite[data-i]'); if(el){ e.preventDefault(); hvWaehlen(+el.dataset.i); } } });
  hvBuch(B); hvLeiste(B); hvHinweise(B); if(HV.ed != null) hvEditor(B); }
if(typeof document !== 'undefined' && !window._hvDoc){ window._hvDoc = 1;
  document.addEventListener('keydown', e => { if(!HV.heft || !document.getElementById('hvBuch') || e.altKey || e.ctrlKey || e.metaKey) return; const a = document.activeElement;
    if(a && /^(INPUT|TEXTAREA|SELECT)$/.test(a.tagName)) return; const O = document.getElementById('overlay'); if(O && O.classList.contains('open')) return;
    if(e.key === 'ArrowRight'){ e.preventDefault(); hvBlaettern(1); } else if(e.key === 'ArrowLeft'){ e.preventDefault(); hvBlaettern(-1); } });
  let rt = null; window.addEventListener('resize', () => { clearTimeout(rt); rt = setTimeout(() => { const B = shOrt(); if(HV.heft && B && B.querySelector('#hvBuch')) hvBuch(B); }, 180); }); }

function hvSeiteHtml(i, seite){ if(i == null) return `<div class="hv-seite leer ${seite}" aria-hidden="true"></div>`; const s = HV.d.seiten[i], T = SHP_TYP[s.typ] || SHP_TYP.frei, w = hvWarn(i);
  return `<div class="hv-seite ${seite}${HV.ed === i ? ' wahl' : ''}" data-i="${i}"${HV.d.planen ? ` tabindex="0" role="button" aria-label="Seite ${i + 1}, ${hvE(T[0])}${w.length ? ', ' + w.length + (w.length === 1 ? ' Hinweis' : ' Hinweise') : ''}. Bearbeiten"` : ''}>${hsSvg(HV.P[i].o, 'Seite ' + (i + 1) + ', ' + T[0])}</div>`; }
function hvBuch(B){ const buch = B.querySelector('#hvBuch'); if(!buch) return; const P = hvPaar(), n = HV.d.seiten.length, breit = P.length === 2;
  buch.className = 'hv-buch' + (breit ? '' : ' einzel'); buch.innerHTML = breit ? hvSeiteHtml(P[0], 'li') + hvSeiteHtml(P[1], 're') : hvSeiteHtml(P[0], 're');
  const da = P.filter(x => x != null), wo = B.querySelector('#hvWo'); if(wo) wo.textContent = da.length > 1 ? `Seiten ${da[0] + 1} und ${da[1] + 1} von ${n}` : `Seite ${da[0] + 1} von ${n}`;
  const v = B.querySelector('#hvVor'), w = B.querySelector('#hvWeiter'); if(v) v.disabled = Math.min(...da) <= 0; if(w) w.disabled = Math.max(...da) >= n - 1;
  B.querySelectorAll('#hvLeiste [data-hv-geh]').forEach(b => b.classList.toggle('on', da.includes(+b.dataset.hvGeh))); }
function hvLeiste(B){ const L = B.querySelector('#hvLeiste'); if(!L) return;
  L.innerHTML = HV.d.seiten.map((s, i) => `<button type="button" class="hv-ch ${(SHP_TYP[s.typ] || SHP_TYP.frei)[1]}${hvWarn(i).length ? ' hin' : ''}" data-hv-geh="${i}" aria-label="Zu Seite ${i + 1}, ${hvE((SHP_TYP[s.typ] || SHP_TYP.frei)[0])}">${i + 1}</button>`).join('');
  L.querySelectorAll('[data-hv-geh]').forEach(b => b.onclick = () => hvGeh(+b.dataset.hvGeh)); hvBuch(B); }

/* ---------- Blättern ---------- */
async function hvGeh(i, ohne){ if(HV.blaettert || !HV.d) return; const n = HV.d.seiten.length; i = Math.max(0, Math.min(n - 1, i)); if(HV.ed != null && HV.ed !== i){ if(!(await hvVerlassen())) return; }
  const B = shOrt(), alt = hvPaar(); HV.i = i; const neu = hvPaar();
  if(!B || !B.querySelector('#hvBuch')) return; if(alt.join() === neu.join()){ hvBuch(B); return; }
  const vor = (neu.find(x => x != null) || 0) > (alt.find(x => x != null) || 0), ruhig = ohne || (window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches) || !document.body.animate;
  if(ruhig){ hvBuch(B); hvBilder(); return; }
  HV.blaettert = true; const buch = B.querySelector('#hvBuch');
  try{ if(neu.length === 2 && alt.length === 2){ // ein Blatt wendet sich um den Bund
      const altS = vor ? buch.querySelector('.hv-seite.re') : buch.querySelector('.hv-seite.li'), blatt = document.createElement('div'); blatt.className = 'hv-blatt ' + (vor ? 'vor' : 'rueck');
      blatt.innerHTML = `<div class="hv-bv">${altS ? altS.innerHTML : ''}</div><div class="hv-bh">${(vor ? neu[0] : neu[1]) != null ? hsSvg(HV.P[vor ? neu[0] : neu[1]].o) : ''}</div>`;
      const bleibt = vor ? hvSeiteHtml(alt[0], 'li') + hvSeiteHtml(neu[1], 're') : hvSeiteHtml(neu[0], 'li') + hvSeiteHtml(alt[1], 're'); buch.innerHTML = bleibt; buch.appendChild(blatt);
      await blatt.animate([{ transform:'rotateY(0deg)' }, { transform:`rotateY(${vor ? -180 : 180}deg)` }], { duration:560, easing:'cubic-bezier(.45,.05,.25,1)', fill:'forwards' }).finished.catch(() => {}); }
    else { const s = buch.querySelector('.hv-seite'); if(s) await s.animate([{ transform:'translateX(0)', opacity:1 }, { transform:`translateX(${vor ? -9 : 9}%)`, opacity:0 }], { duration:140, easing:'ease-in' }).finished.catch(() => {});
      hvBuch(B); const t = buch.querySelector('.hv-seite'); if(t) await t.animate([{ transform:`translateX(${vor ? 9 : -9}%)`, opacity:0 }, { transform:'translateX(0)', opacity:1 }], { duration:190, easing:'ease-out' }).finished.catch(() => {}); } }
  finally{ HV.blaettert = false; hvBuch(B); hvBilder(); } }
function hvBlaettern(r){ const P = hvPaar().filter(x => x != null), n = HV.d.seiten.length; if(!P.length) return; const ziel = r > 0 ? Math.max(...P) + 1 : Math.min(...P) - 1; if(ziel < 0 || ziel > n - 1) return;
  if(HV.ed != null) return hvWaehlen(ziel); return hvGeh(ziel); }

/* ---------- Hinweise: was noch fehlt ---------- */
// Hinweise einer Seite: was der Satz meldet, dazu ein angenommener, noch nicht geprüfter Vorschlag der KI
function hvWarn(i){ const w = ((HV.P || [])[i] || {}).warn || [], s = HV.d.seiten[i], d = (HV.ed === i && HV.entwurf) ? HV.entwurf : (s.daten || {});
  return d.ki === 'offen' && d.text ? w.concat(['Der Text ist ein Vorschlag der KI und noch nicht geprüft.']) : w; }
function hvOffeneAnzeigen(){ const drin = new Set(HV.d.seiten.flatMap(s => [s.a, s.b]).filter(Boolean)); return (HV.d.anzeigen || []).filter(a => !drin.has(a.id)); }
function hvHinweisListe(){ const L = [], n = HV.d.seiten.length; (HV.P || []).forEach((p, i) => hvWarn(i).forEach(w => L.push({ i, t:w })));
  if(n % 4) L.push({ i:null, t:`Das Heft hat ${n} Seiten. Zur vollen Lage ${(4 - n % 4) === 1 ? 'fehlt 1 Seite' : 'fehlen ' + (4 - n % 4) + ' Seiten'}.` });
