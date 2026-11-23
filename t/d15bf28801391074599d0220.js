    return c;
  }
  const zeichnen=(o={})=>motiv(o,null);
  async function trikotDetail(o={}){
    const trikot=TRIKOT[o.art||'heim'];
    if(!trikot)throw Error('Bitte ein Heim- oder Auswärtstrikot wählen.');
    return motiv(o,trikot);
  }
  async function bilder(firma,logo,kit='kit/'){const key=JSON.stringify([firma,logo||null,kit]);if(zuletzt?.key===key)return zuletzt.p;const job={key,p:null};zuletzt=job;job.p=(async()=>{const b={gesamt_foto:true};for(const seite of Object.keys(SEITEN)){const c=await zeichnen({firma,logo,seite,kit,breite:1200});b[seite]=c.toDataURL('image/webp',.94);b[seite==='aermel_l'?'gesamt_l':'gesamt_r']=b[seite];c.width=c.height=1;}return b;})().catch(e=>{if(zuletzt===job)zuletzt=null;throw e;});return job.p;}
  const api={zeichnen,trikotDetail,trikotFeld,bilder,feld,punkt};if(typeof module!=='undefined'&&module.exports)module.exports=api;else root.TRAININGSANZUG=api;
})(typeof window!=='undefined'?window:globalThis);

/* =====================================================================
   Beta 0.80 · Trikot-Creator im Partner-Bereich (Reiter „Trikots“)
   Ein möglicher Partner sieht sofort, wie sein Logo LIVE auf unseren Trikots aussieht.
   - Mannschaft (alle Teams und das Musterteam) und Satz (Heim, Auswärts, Anzug) wählen
   - 3D-Bühne (trikot3d.js, three.js wird erst hier geladen) mit Vorn, Seite, Hinten; Foto-Ansicht mit den echten Produktfotos
   - Logo hochladen oder aus den vorhandenen Partnerlogos wählen, per Drag & Drop auf einen freien Platz ziehen
     (am Handy: Logo antippen, dann den Platz antippen), Größe und Variante (Weiß, Original, Schwarz)
   - Logo-Analyse: Originalfarben als Farbpunkte, Weiß-Variante auf Vereinsblau
   - Platz als „reserviert für <Firma>“ vormerken oder fest vergeben. Belegte Plätze sind gesperrt, nur ein Admin gibt sie frei.
   - Bild speichern oder teilen: „So sieht dein Logo bei uns aus“
   Daten: trikot_laden, trikot_platz_setzen, trikot_platz_anpassen, trikot_platz_freigeben, trikot_logo_speichern (114_trikot_creator.sql)
   ===================================================================== */
const TC = { d:null, laedt:null, team:'h1', art:'heim', logo:null, eigen:null, vor:{}, v:null, platz:null, sicht:'vorn', modus:'3d', err:null };
const TC_ARTEN = [['heim', 'Heim'], ['auswaerts', 'Auswärts'], ['anzug', 'Anzug']];
const TC_VAR = [['weiss', 'Weiß'], ['original', 'Original'], ['schwarz', 'Schwarz']];
const TC_MUSTER = 'muster';

/* ---------- Reiter einhängen (nach „Präsentationen“) ---------- */
{ const i = SPO_REITER.findIndex(r => r[0] === 'decks'); if(!SPO_REITER.some(r => r[0] === 'trikots')) SPO_REITER.splice(i < 0 ? SPO_REITER.length : i + 1, 0, ['trikots', 'Trikots']); }
{ const _b = spoBody; spoBody = function(){ if(SPO.view === 'trikots'){ const B = document.getElementById('spoB'); if(B) tcRender(B); return; } if(TC.v && SPO.view !== 'trikots') tcAufraeumen(); return _b.apply(this, arguments); }; }
{ const _w = spoWechsel; spoWechsel = function(v){ if(v !== 'trikots') tcAufraeumen(); return _w.apply(this, arguments); }; }
{ const _gt = goTab; goTab = function(t){ if(t !== 'sponsoring') tcAufraeumen(); return _gt.apply(this, arguments); }; }
function tcAufraeumen(){ try{ TC.v && TC.v.zerstoeren(); }catch(e){} TC.v = null; }

const tcE = s => svEsc(s);
async function tcRpc(fn, args){ const { data, error } = await SVB.sb.rpc(fn, args || {}); if(error) throw new Error(typeof svFehlerText === 'function' ? svFehlerText(error) : error.message); return data; }
async function tcLaden(neu){ if(TC.laedt && !neu) return TC.laedt;
  TC.laedt = tcRpc('trikot_laden').then(d => { TC.d = d; TC.err = null; return d; }).catch(e => { TC.err = e.message; TC.laedt = null; throw e; }); return TC.laedt; }
function tcSkript(src){ return new Promise((ok, nein) => { if(window.TRIKOT3D) return ok(); const s = document.createElement('script'); s.src = src; s.onload = ok; s.onerror = () => nein(new Error('Der Trikot-Creator lässt sich gerade nicht laden.')); document.head.appendChild(s); }); }
const tcBuild = () => { try{ return typeof APP_BUILD !== 'undefined' ? APP_BUILD : ''; }catch(e){ return ''; } };

/* ---------- Daten ---------- */
function tcTeams(){ const L = ((TC.d && TC.d.mannschaften) || []).slice(); return L.concat([{ id:TC_MUSTER, name:'Musterteam (alles frei)', art:'muster' }]); }
function tcSatz(){ return ((TC.d && TC.d.saetze) || []).find(s => s.mannschaft === TC.team && s.art === TC.art) || null; }
function tcPlaetze(){ const s = tcSatz(); return s ? (TC.d.plaetze || []).filter(p => p.satz === s.id) : []; }
function tcPlatz(k){ return tcPlaetze().find(p => p.platz === k) || null; }
function tcLogo(id){ return ((TC.d && TC.d.logos) || []).find(l => l.id === id) || null; }
function tcVorKey(k){ const s = tcSatz(); return s ? s.id + '|' + k : k; }
function tcName(k){ const i = TRIKOT3D_INFO(k); return i ? i.n : k; }
function TRIKOT3D_INFO(k){ return window.TRIKOT3D ? TRIKOT3D.platzInfo(TC.art, k) : null; }
function tcRegelVariante(firma, k){ return /^basakci/i.test(firma || '') && TC.art === 'auswaerts' && k === 'brust' ? 'original' : TC.art === 'anzug' && /^aermel/.test(k) ? 'schwarz' : 'weiss'; }
function tcBelegung(){ const B = {};
  tcPlaetze().forEach(p => { const l = p.logo ? tcLogo(p.logo) : null;
    if(p.status !== 'frei') B[p.platz] = { status:p.status, firma:p.firma, bild:l && l.bild, variante:p.variante, groesse:+p.groesse || 1 };
    else { const v = TC.vor[tcVorKey(p.platz)]; B[p.platz] = v ? { status:'belegt', vorschau:true, firma:v.logo.firma, bild:v.logo.bild, variante:v.variante, groesse:v.groesse } : { status:'frei' }; } });
  return B; }

/* ---------- Oberfläche ---------- */
async function tcRender(B){
  if(B.querySelector('.pz-tc') && TC.v){ tcStand(); return; }
  tcAufraeumen();
  B.innerHTML = `<div class="pz pz-tc"><div class="pz-tc-kopf"><span class="pz-hand">Live auf unseren Trikots</span><h2>Trikot-Creator</h2>
    <p>Zieh ein Logo auf einen freien Platz und dreh das Trikot. So sieht ein Partner sofort, wie sein Logo bei uns aussieht.</p></div>
    <div class="pz-tc-raster"><div class="pz-tc-links">
      <div class="pz-tc-wahl"><label class="pz-tc-team"><span>Mannschaft</span><select id="tcTeam" aria-label="Mannschaft"></select></label>
        <div class="pz-tc-seg" id="tcArt" role="group" aria-label="Satz">${TC_ARTEN.map(([k, t]) => `<button type="button" data-tcart="${k}">${t}</button>`).join('')}</div></div>
      <div class="pz-tc-seg" id="tcAermel" role="group" aria-label="Ärmel aus Sicht des Trägers"><button type="button" data-tcaermel="aermel_r">Rechter Ärmel</button><button type="button" data-tcaermel="aermel_l">Linker Ärmel</button><button type="button" data-tcaermel="gesamt">Ganzes Trikot</button></div><p class="pz-tc-tipp">Links und rechts aus Sicht des Trikotträgers.</p>
      <div class="pz-tc-buehne" id="tcBuehne"><div class="pz-tc-laden" id="tcLaden"><i></i>Trikots werden aufgebaut …</div></div>
      <div class="pz-tc-leiste"><div class="pz-tc-seg klein" id="tcSicht" role="group" aria-label="Ansicht">${[['vorn', 'Vorn'], ['seite', 'Seite'], ['hinten', 'Hinten']].map(([k, t]) => `<button type="button" data-tcsicht="${k}">${t}</button>`).join('')}</div>
        <div class="pz-tc-seg klein" id="tcModus" role="group" aria-label="Darstellung"><button type="button" data-tcmodus="3d">3D</button><button type="button" data-tcmodus="foto">Foto</button></div></div>
      <p class="pz-tc-info" id="tcInfo" aria-live="polite"></p></div>
    <div class="pz-tc-rechts">
      <section class="pz-tc-block" aria-labelledby="tcLh"><div class="pz-tc-bk"><h3 id="tcLh">Logo</h3>
        <label class="pz-tc-hoch"><input type="file" id="tcDatei" accept="image/png,image/jpeg,image/webp,image/svg+xml">${SVI('plus')}<span>Logo hochladen</span></label></div>
        <div class="pz-tc-logos" id="tcLogos" role="list" aria-label="Vorhandene Partnerlogos"></div><div id="tcAnalyse"></div></section>
      <section class="pz-tc-block" aria-labelledby="tcPh"><div class="pz-tc-bk"><h3 id="tcPh">Plätze</h3><span class="pz-tc-zahl" id="tcZahl"></span></div><div id="tcListe" class="pz-tc-liste"></div></section><section class="pz-tc-block" id="tcAnzugStand" aria-label="Trainingsanzüge, Belegung"></section>
      <section class="pz-tc-block pz-tc-teilen"><button type="button" class="pz-tc-b or" id="tcTeilen">${SVI('share')}<span>Bild teilen</span></button>
        <button type="button" class="pz-tc-b" id="tcSpeichern">${SVI('download')}<span>Bild speichern</span></button>
        <p>Ein Bild mit der Überschrift „So sieht dein Logo bei uns aus“, für WhatsApp oder Mail.</p></section>
    </div></div></div>`;
  const P = B.querySelector('.pz-tc');
  P.querySelector('#tcArt').onclick = e => { const b = e.target.closest('[data-tcart]'); if(b){ TC.art = b.dataset.tcart; TC.platz = null; tcStand(true); } };
  P.querySelector('#tcSicht').onclick = e => { const b = e.target.closest('[data-tcsicht]'); if(b && TC.v){ TC.v.fokus('oben'); TC.v.drehen(b.dataset.tcsicht); TC.sicht = b.dataset.tcsicht; tcKnoepfe(); } };
  P.querySelector('#tcAermel').onclick = e => { const b=e.target.closest('[data-tcaermel]'); if(b&&TC.v){ TC.v.detail(b.dataset.tcaermel); tcKnoepfe(); } };
  P.querySelector('#tcModus').onclick = async e => { const b = e.target.closest('[data-tcmodus]'); if(!b || !TC.v) return; const ok = await TC.v.modus(b.dataset.tcmodus); if(ok) TC.modus = b.dataset.tcmodus; else kToast(TC.art === 'anzug' ? 'Die Fotoansicht lässt sich gerade nicht öffnen.' : 'Die 3D-Ansicht geht auf diesem Gerät nicht.'); tcKnoepfe(); };
  P.querySelector('#tcDatei').onchange = tcHochladen;
  P.querySelector('#tcTeilen').onclick = e => tcBild(true, e.currentTarget);
  P.querySelector('#tcSpeichern').onclick = e => tcBild(false, e.currentTarget);
  if(!(navigator.canShare && navigator.share)) P.querySelector('#tcTeilen').hidden = true;
  try{ await tcLaden(); }catch(e){ const L = P.querySelector('#tcLaden'); if(L) L.textContent = 'Konnte nicht laden: ' + e.message; return; }
  if(!tcTeams().some(t => t.id === TC.team)) TC.team = (tcTeams()[0] || {}).id;
  const sel = P.querySelector('#tcTeam'); sel.innerHTML = tcTeams().map(t => `<option value="${tcE(t.id)}">${tcE(t.name)}</option>`).join('');
  sel.value = TC.team; sel.onchange = () => { TC.team = sel.value; TC.platz = null; tcStand(true); };
  try{ await tcSkript('trikot3d.js?v=' + encodeURIComponent(tcBuild())); }catch(e){ const L = P.querySelector('#tcLaden'); if(L) L.textContent = e.message; return; }
  if(!P.isConnected || SPO.view !== 'trikots') return;
  const host = P.querySelector('#tcBuehne');
  TC.v = TRIKOT3D.buehne(host, { three:'vendor/three.min.js?v=' + encodeURIComponent(tcBuild()), kit:'kit/', schrift:'BarlowC', name:tcName,
    onPlatz:tcPlatzTipp, onDreh:s => { TC.sicht = s; tcKnoepfe(); } });
  await TC.v.bereit; const L = P.querySelector('#tcLaden'); if(L) L.remove();
  // 0.81: ohne Hose und Stutzen gibt es kein „Ganzes Set“ mehr, die Bühne zeigt immer das ganze Oberteil
  TC.modus = TC.v.modusJetzt; tcStand(true); tcZiehenBinden(P);
}
function tcZoomText(){ const zb = document.getElementById('tcZoom'); if(!zb || !TC.v) return; const ganz = TC.v.fokusJetzt === 'gesamt'; zb.textContent = ganz ? 'Trikot nah' : 'Ganzes Set'; zb.setAttribute('aria-pressed', String(ganz)); zb.hidden = !TC.v.webgl || TC.modus === 'foto'; }
function tcKnoepfe(){ const P = document.querySelector('.pz-tc'); if(!P) return; if(TC.v) TC.modus=TC.v.modusJetzt; tcZoomText();
  P.classList.toggle('anzug-foto',TC.art==='anzug'&&TC.modus==='foto');
  P.querySelectorAll('[data-tcaermel]').forEach(b=>{const an=b.dataset.tcaermel === (TC.v&&/^aermel_/.test(TC.v.fokusJetzt)?TC.v.fokusJetzt:'gesamt');b.setAttribute('aria-pressed',String(an));b.classList.toggle('on',an);b.disabled=TC.art==='anzug'&&TC.modus==='foto'&&b.dataset.tcaermel==='gesamt';});
  P.querySelectorAll('[data-tcart]').forEach(b => { const an = b.dataset.tcart === TC.art; b.classList.toggle('on', an); b.setAttribute('aria-pressed', an); });
  P.querySelectorAll('[data-tcsicht]').forEach(b => { const an = b.dataset.tcsicht === TC.sicht; b.classList.toggle('on', an); b.setAttribute('aria-pressed', an); b.disabled = TC.modus === 'foto' && (TC.art==='anzug'||b.dataset.tcsicht === 'seite'); });
  P.querySelectorAll('[data-tcmodus]').forEach(b => { const an = b.dataset.tcmodus === TC.modus; b.classList.toggle('on', an); b.setAttribute('aria-pressed', an); b.disabled = (b.dataset.tcmodus === '3d' && TC.v && !TC.v.webgl);if(b.dataset.tcmodus==='foto')b.textContent=TC.art==='anzug'?'Ärmelfoto':'Foto'; });
}
function tcAnzugStand(){const h=document.getElementById('tcAnzugStand');if(!h||!TC.d?.anzug_aermel)return;const plaetze=TC.d.anzug_aermel.plaetze||[];h.innerHTML='<h3>Trainingsanzüge</h3><p>Linker und rechter Ärmel werden getrennt vergeben. Logos immer schwarz.</p><ul class="pz-anzug-stand">'+plaetze.map(t=>'<li><button type="button" data-tcanzug="'+tcE(t.team)+'" data-seite="'+tcE(t.seite)+'"><span>'+tcE(t.name)+' · '+(t.seite==='aermel_l'?'links':'rechts')+'</span><strong>'+tcE(t.status==='frei'?'Offen':t.status==='angefragt'?'Angefragt':t.status==='spaeter'?'Erst ab '+t.ab_jahr:'Vergeben')+'</strong>'+(t.firma?'<small>'+tcE(t.firma)+'</small>':'')+'</button></li>').join('')+'</ul>';h.querySelectorAll('[data-tcanzug]').forEach(b=>b.onclick=()=>{TC.team=b.dataset.tcanzug;TC.art='anzug';TC.platz=b.dataset.seite;tcStand(true);TC.v?.detail(TC.platz,true);tcKnoepfe();});}
function tcStand(neuBauen){tcAnzugStand();
  const P = document.querySelector('.pz-tc'); if(!P || !TC.d) return; const s = tcSatz();
  P.querySelector('#tcTeam').value=TC.team;
  tcKnoepfe();
  const info = P.querySelector('#tcInfo'), team = tcTeams().find(t => t.id === TC.team) || {};
  const pl = tcPlaetze(), frei = pl.filter(p => p.status === 'frei').length;
  info.innerHTML = !s ? 'Für diese Mannschaft gibt es diesen Satz nicht.'
    : TC.team === TC_MUSTER ? 'Musterteam: Hier ist alles frei. Zum Ausprobieren, wenn bei den Mannschaften alles vergeben ist.'
    : TC.art==='anzug' ? `<b>${tcE(team.name)}</b> · Trainingsanzug · ${pl.filter(p=>/^aermel_/.test(p.platz)&&p.status==='frei').length} von ${pl.filter(p=>/^aermel_/.test(p.platz)).length} Ärmeln frei`
    : !s.vorhanden ? `<b>${tcE(team.name)}</b> hat diesen Satz noch nicht. Mit einer Trikotsatz-Patenschaft wird er möglich, alle Plätze sind frei.`
    : `<b>${tcE(team.name)}</b> · ${tcE(s.modell || (TC.art === 'anzug' ? 'Trainingsanzug' : 'Trikotsatz'))} · ${frei} von ${pl.length} Plätzen frei`;
  P.querySelector('#tcZahl').textContent = pl.length ? `${frei} frei` : '';
  if(TC.v && s) TC.v.setzen({ art:TC.art, grund:s.grundfarbe, akzent:s.akzentfarbe, nummer:'10', belegung:tcBelegung() });
  if(neuBauen && TC.v){ TC.v.fokus('oben', true); tcKnoepfe(); }
  tcLogosZeigen(); tcListe();
}

/* ---------- Logos ---------- */
function tcAlleLogos(){ const L = ((TC.d && TC.d.logos) || []).filter(l => l.bild || l.firma); return (TC.eigen ? [TC.eigen] : []).concat(L.filter(l => !TC.eigen || l.id !== TC.eigen.id)); }
function tcLogoKey(l){ return l.id || 'eigen'; }
function tcLogosZeigen(){
  const H = document.getElementById('tcLogos'); if(!H) return;
  H.innerHTML = tcAlleLogos().map(l => { const an = TC.logo && tcLogoKey(TC.logo) === tcLogoKey(l);
    return `<div role="listitem"><button type="button" class="pz-tc-lg${an ? ' an' : ''}${l.bild ? '' : ' ohne'}" data-tclogo="${tcE(tcLogoKey(l))}" aria-pressed="${an}" title="${tcE(l.firma)}" aria-label="Logo ${tcE(l.firma)}${an ? ', gewählt' : ''}">
      ${l.bild ? `<img src="${tcE(l.bild)}" alt="" draggable="false">` : `<b>${tcE(l.firma)}</b>`}<span>${tcE(l.firma)}</span></button></div>`; }).join('');
  H.querySelectorAll('[data-tclogo]').forEach(b => b.addEventListener('click', () => { if(b.dataset.gezogen){ delete b.dataset.gezogen; return; } tcLogoWaehlen(b.dataset.tclogo); }));
  tcAlleLogos().forEach(l => { if(!l.bild) return; LOGO.aufbereiten(l.bild).then(a => { if(!a.hell) return; const b = H.querySelector(`[data-tclogo="${CSS.escape(tcLogoKey(l))}"]`); if(b) b.classList.add('dunkel'); }).catch(() => {}); });
  tcAnalyse();
}
function tcLogoWaehlen(key){ const l = tcAlleLogos().find(x => tcLogoKey(x) === key); if(!l) return;
  TC.logo = TC.logo && tcLogoKey(TC.logo) === key ? null : l; tcLogosZeigen();
  if(TC.logo) kToast(innerWidth <= 760 ? 'Jetzt einen freien Platz antippen.' : 'Logo auf einen freien Platz ziehen oder den Platz anklicken.'); }
async function tcAnalyse(){
  const A = document.getElementById('tcAnalyse'); if(!A) return; const l = TC.logo;
  if(!l){ A.innerHTML = `<p class="pz-tc-tipp">Wähl ein Logo aus oder lade eins hoch. ${innerWidth <= 760 ? 'Dann tippst du auf einen freien Platz.' : 'Dann ziehst du es auf einen freien Platz.'}</p>`; return; }
  const sig = tcLogoKey(l) + '|' + (l.bild || '').length; A.dataset.sig = sig;
  A.innerHTML = `<div class="pz-tc-an"><div class="pz-tc-an-k"><b>${tcE(l.firma || 'Neues Logo')}</b>${l.sicher === false ? '<span class="pz-tc-warn">Vorschlag, bitte beim Partner prüfen</span>' : ''}</div>
    <div class="pz-tc-vor"><figure class="blau"><div id="tcAnW"></div><figcaption>Weiß auf Vereinsblau</figcaption></figure><figure class="weiss"><div id="tcAnO"></div><figcaption>Original</figcaption></figure></div>
    <div class="pz-tc-farben" id="tcFarben"></div>
    ${TC.eigen && l === TC.eigen ? `<label class="pz-tc-firma"><span>Firma</span><input type="text" id="tcFirma" maxlength="120" value="${tcE(l.firma || '')}" placeholder="Name der Firma" autocomplete="organization"></label>` : ''}</div>`;
  const fi = A.querySelector('#tcFirma'); if(fi) fi.oninput = () => { TC.eigen.firma = fi.value.trim(); Object.values(TC.vor).forEach(v => { if(v.logo === TC.eigen) v.logo.firma = TC.eigen.firma; }); };
  if(!l.bild){ A.querySelector('#tcAnW').innerHTML = `<b class="pz-tc-sz">${tcE(l.firma)}</b>`; A.querySelector('#tcAnO').innerHTML = `<b class="pz-tc-sz dk">${tcE(l.firma)}</b>`;
    A.querySelector('#tcFarben').innerHTML = '<span class="pz-tc-leise">Noch kein Logo. Auf dem Trikot steht bis dahin der Firmenname.</span>'; return; }
  try{ const a = await LOGO.aufbereiten(l.bild); if(A.dataset.sig !== sig) return;
    const w = await LOGO.variante(l.bild, 'weiss'), ia = document.createElement('img'), ib = document.createElement('img'); ia.src = w.toDataURL('image/png'); ib.src = a.c.toDataURL('image/png'); ia.alt = ''; ib.alt = '';
    A.querySelector('#tcAnW').appendChild(ia); A.querySelector('#tcAnO').appendChild(ib);
    A.querySelector('#tcFarben').innerHTML = `<span class="pz-tc-leise">Originalfarben</span>${a.farben.map(f => `<i style="background:${f.hex}" title="${f.hex}, ${f.anteil} Prozent" aria-label="${f.hex}, ${f.anteil} Prozent"></i>`).join('')}<span class="pz-tc-leise">Auf dem Trikot in Weiß</span>`;
  }catch(e){ A.querySelector('#tcFarben').textContent = 'Das Logo lässt sich nicht auswerten.'; }
}
async function tcHochladen(e){
  const f = e.target.files && e.target.files[0]; e.target.value = ''; if(!f) return;
  try{ const roh = await LOGO.dateiLesen(f); const a = await LOGO.aufbereiten(roh);
    let bild = await LOGO.alsDataUrl(roh, 'original', 900); if(bild.length > 690000) bild = await LOGO.alsDataUrl(roh, 'original', 600);
    const name = f.name.replace(/\.[a-z0-9]+$/i, '').replace(/[-_]+/g, ' ').replace(/\b(logo|final|neu|rgb|cmyk)\b/gi, '').replace(/\s+/g, ' ').trim();
    TC.eigen = { id:null, firma:name ? name.charAt(0).toUpperCase() + name.slice(1) : '', bild, farben:a.farben, neu:true }; TC.logo = TC.eigen; tcLogosZeigen();
    kToast(a.hintergrundEntfernt ? 'Hintergrund entfernt. Jetzt auf einen freien Platz damit.' : 'Logo ist da. Jetzt auf einen freien Platz damit.');
    const fi = document.getElementById('tcFirma'); if(fi && !fi.value) fi.focus();
  }catch(x){ kToast(x.message || 'Das Logo lässt sich nicht lesen.'); }
}

/* ---------- Plätze ---------- */
function tcListe(){
  const H = document.getElementById('tcListe'); if(!H) return; const s = tcSatz(); if(!s){ H.innerHTML = ''; return; }
  const admin = !!(TC.d && TC.d.admin), muster = TC.team === TC_MUSTER;
  H.innerHTML = TRIKOT3D_LISTE().map(k => { const p = tcPlatz(k); if(!p) return ''; const v = TC.vor[tcVorKey(k)], an = TC.platz === k, name = tcName(k);
    let st, akt = '';
    if(p.gesperrt_bis_jahr){st='<span class="st res">Erst ab '+tcE(p.gesperrt_bis_jahr)+'</span>';}
    else if(p.status === 'belegt'){ st = `<span class="st belegt">${SVI('lock')}Belegt: ${tcE(p.firma)}</span>`; if(admin) akt = `<button type="button" class="pz-tc-k" data-tcfrei="${k}">Freigeben</button>`; }
    else if(p.status === 'reserviert'){ st = `<span class="st res">${p.angefragt?'Angefragt bei':'Reserviert für'} ${tcE(p.firma)}</span>`; akt = `<button type="button" class="pz-tc-k" data-tcfest="${k}">Fest vergeben</button><button type="button" class="pz-tc-k leise" data-tcfrei="${k}">Lösen</button>`; }
    else if(v){ st = `<span class="st vor">Vorschau: ${tcE(v.logo.firma || 'neues Logo')}</span>`;
      akt = `<div class="pz-tc-fein"><div class="pz-tc-seg mini" role="group" aria-label="Variante">${TC_VAR.filter(([q])=>TC.art!=='anzug'||!/^aermel_/.test(k)||q==='schwarz').map(([q, t]) => `<button type="button" data-tcvar="${k}:${q}" class="${v.variante === q ? 'on' : ''}" aria-pressed="${v.variante === q}">${t}</button>`).join('')}</div>
        <label class="pz-tc-gr"><span>Größe</span><input type="range" min="50" max="150" step="5" value="${Math.round(v.groesse * 100)}" data-tcgr="${k}" aria-label="Größe des Logos"></label></div>
        ${muster ? '' : `<button type="button" class="pz-tc-k" data-tcres="${k}">Reservieren</button><button type="button" class="pz-tc-k" data-tcfest="${k}">Fest vergeben</button>`}<button type="button" class="pz-tc-k leise" data-tcweg="${k}">Entfernen</button>`; }
    else { st = `<span class="st frei">Frei · ${innerWidth <= 760 ? 'Logo wählen, Platz antippen' : 'Logo hierher ziehen'}</span>`; if(TC.logo) akt = `<button type="button" class="pz-tc-k" data-tcsetz="${k}">${tcE(TC.logo.firma || 'Logo')} hier einsetzen</button>`; }
    return `<div class="pz-tc-pl${an ? ' an' : ''} ${p.status}${v ? ' hatvor' : ''}" data-tcpl="${k}"><button type="button" class="pz-tc-plk" data-tczeig="${k}" aria-label="${tcE(name)} zeigen"><b>${tcE(name)}</b>${st}</button>${akt ? `<div class="pz-tc-akt">${akt}</div>` : ''}</div>`; }).join('');
  H.querySelectorAll('[data-tczeig]').forEach(b => b.onclick = () => tcPlatzTipp(b.dataset.tczeig, true));
  H.querySelectorAll('[data-tcsetz]').forEach(b => b.onclick = () => tcEinsetzen(b.dataset.tcsetz));
  H.querySelectorAll('[data-tcweg]').forEach(b => b.onclick = () => { delete TC.vor[tcVorKey(b.dataset.tcweg)]; tcStand(); });
  H.querySelectorAll('[data-tcvar]').forEach(b => b.onclick = () => { const [k, q] = b.dataset.tcvar.split(':'); const v = TC.vor[tcVorKey(k)]; if(v){ v.variante = q; tcStand(); } });
  H.querySelectorAll('[data-tcgr]').forEach(r => { r.oninput = () => { const v = TC.vor[tcVorKey(r.dataset.tcgr)]; if(v){ v.groesse = +r.value / 100; TC.v && TC.v.setzen({ art:TC.art, grund:tcSatz().grundfarbe, akzent:tcSatz().akzentfarbe, nummer:'10', belegung:tcBelegung() }); } }; });
  H.querySelectorAll('[data-tcres]').forEach(b => b.onclick = () => tcVergeben(b.dataset.tcres, 'reserviert'));
  H.querySelectorAll('[data-tcfest]').forEach(b => b.onclick = () => tcVergeben(b.dataset.tcfest, 'belegt'));
  H.querySelectorAll('[data-tcfrei]').forEach(b => b.onclick = () => tcFreigeben(b.dataset.tcfrei));
}
function TRIKOT3D_LISTE(){ return window.TRIKOT3D ? TRIKOT3D.platzListe(TC.art) : []; }
// Platz zeigen: Trikot dahin drehen, Hose nah heranholen
function tcHinsehen(k){ const i = TRIKOT3D_INFO(k); if(!i || !TC.v) return;
  if(k==='aermel_l'||k==='aermel_r'){TC.v.detail(k);TC.sicht='seite';tcKnoepfe();return;}
  const w = i.teil === 'aermel' ? (i.seite > 0 ? .95 : 'vorn') : i.vorn === false ? 'hinten' : 'vorn';
  TC.v.drehen(w); TC.sicht = typeof w === 'number' ? 'seite' : w; TC.v.fokus(i.fokus === 'unten' ? 'unten' : 'oben'); tcKnoepfe(); }
function tcPlatzTipp(k, ausListe){
  const p = tcPlatz(k); if(!p) return; TC.platz = k;
  if(!ausListe && TC.logo && p.status === 'frei'){ tcEinsetzen(k); return; }
  if(!ausListe && p.status === 'belegt'){ kToast(`${tcName(k)} ist belegt${p.firma ? ' von ' + p.firma : ''}.`); }
  tcHinsehen(k); tcListe();
  const z = document.querySelector(`.pz-tc-pl[data-tcpl="${k}"]`); if(z && ausListe !== true && innerWidth >= 980) z.scrollIntoView({ block:'nearest', behavior:matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth' });
}
function tcEinsetzen(k, logo){
  const p = tcPlatz(k), l = logo || TC.logo; if(!p || !l) return false;
  if(p.status !== 'frei'){ kToast(p.status === 'belegt' ? 'Dieser Platz ist belegt. Nimm einen freien.' : `Dieser Platz ist für ${p.firma} reserviert.`); return false; }
  TC.vor[tcVorKey(k)] = { logo:l, variante:tcRegelVariante(l.firma, k), groesse:1 }; TC.platz = k;
  tcHinsehen(k); tcStand(); try{ navigator.vibrate && navigator.vibrate(8); }catch(e){}
  return true;
}
async function tcLogoSichern(l){
  if(l.id) return l.id;
  const firma = (l.firma || '').trim(); if(!firma) throw new Error('Bitte zuerst die Firma zum Logo eintragen.');
  const r = await tcRpc('trikot_logo_speichern', { p:{ firma, bild:l.bild, farben:(l.farben || []).slice(0, 8) } });
  l.id = r.id; l.neu = false; TC.d.logos = (TC.d.logos || []).filter(x => x.id !== r.id).concat([r]); return r.id;
}
function tcVergeben(k, status){
  const p = tcPlatz(k); if(!p) return; const v = TC.vor[tcVorKey(k)], l = v ? v.logo : (p.logo ? tcLogo(p.logo) : null), fest = status === 'belegt';
  const M = svModal(`<div class="mhead"><div><h2 style="margin:0">${fest ? 'Platz fest vergeben' : 'Platz reservieren'}</h2><div class="msub">${tcE(tcName(k))} · ${tcE((tcTeams().find(t => t.id === TC.team) || {}).name || '')} · ${tcE((TC_ARTEN.find(a => a[0] === TC.art) || [])[1] || '')}</div></div></div>
    <label class="pz-tc-dlgf"><span>Für welche Firma?</span><input type="text" id="tcDlgFirma" maxlength="120" value="${tcE((l && l.firma) || p.firma || '')}" autocomplete="organization"></label>
    <p class="note">${fest ? 'Danach ist der Platz gesperrt. Freigeben kann ihn nur ein Admin.' : 'Der Platz bleibt für das Angebot vorgemerkt. Andere sehen ihn als reserviert und können ihn nicht belegen.'}</p>
    <div class="pz-tc-dlgk"><button type="button" class="btn" id="tcDlgOk">${fest ? 'Fest vergeben' : 'Reservieren'}</button><button type="button" class="btn ghost" id="tcDlgNein">Abbrechen</button></div>`);
  const inp = M.querySelector('#tcDlgFirma'); setTimeout(() => { try{ inp.focus(); inp.select(); }catch(e){} }, 60);
  M.querySelector('#tcDlgNein').onclick = () => closeOverlay();
  M.querySelector('#tcDlgOk').onclick = () => paEinmal(M.querySelector('#tcDlgOk'), async () => {
    const firma = inp.value.trim(); if(!firma){ kToast('Bitte die Firma eintragen.'); inp.focus(); return; }
    try{ if(l && !l.id){ l.firma = l.firma || firma; } const logoId = l ? await tcLogoSichern(l) : null;
      await tcRpc('trikot_platz_setzen', { p:{ platz:p.id, status, logo:logoId, firma, variante:v ? v.variante : p.variante, groesse:v ? v.groesse : +p.groesse || 1 } });
      delete TC.vor[tcVorKey(k)]; closeOverlay(); await tcLaden(true); tcStand();
      kToast(fest ? `${tcName(k)} ist jetzt fest vergeben an ${firma}.` : `${tcName(k)} ist reserviert für ${firma}.`);
    }catch(e){ kToast(e.message); } }, 'Speichert …');
}
function tcFreigeben(k){
  const p = tcPlatz(k); if(!p) return; const belegt = p.status === 'belegt';
  const M = svModal(`<div class="mhead"><div><h2 style="margin:0">${belegt ? 'Platz freigeben?' : 'Reservierung lösen?'}</h2><div class="msub">${tcE(tcName(k))} · ${tcE(p.firma || '')}</div></div></div>
    <p class="note">${belegt ? `${tcE(p.firma || 'Die Firma')} verliert damit diesen Platz im Trikot-Creator. Der Vertrag bleibt davon unberührt.` : 'Der Platz ist danach wieder frei.'}</p>
    <div class="pz-tc-dlgk"><button type="button" class="btn" id="tcDlgOk">${belegt ? 'Freigeben' : 'Lösen'}</button><button type="button" class="btn ghost" id="tcDlgNein">Abbrechen</button></div>`);
  M.querySelector('#tcDlgNein').onclick = () => closeOverlay();
  M.querySelector('#tcDlgOk').onclick = () => paEinmal(M.querySelector('#tcDlgOk'), async () => {
    try{ await tcRpc('trikot_platz_freigeben', { p_platz:p.id }); closeOverlay(); await tcLaden(true); tcStand(); kToast(`${tcName(k)} ist wieder frei.`); }catch(e){ kToast(e.message); } }, 'Einen Moment …');
}

/* ---------- Ziehen und Ablegen ---------- */
// Maus und Stift: sofort ziehen. Finger: kurz halten, dann ziehen (sonst scrollt die Logoleiste). Tippen wählt das Logo.
function tcZiehenBinden(P){
  const H = P.querySelector('#tcLogos'); if(!H || H.dataset.dnd) return; H.dataset.dnd = '1';
  let z = null;
  const ende = (e, abbruch) => { if(!z) return; const zz = z; z = null; clearTimeout(zz.halt); if(!zz.geist) return;
    const k = abbruch ? null : tcZiel(e.clientX, e.clientY);
    zz.geist.remove(); zz.btn.dataset.gezogen = '1'; setTimeout(() => { delete zz.btn.dataset.gezogen; }, 400); document.body.classList.remove('pz-tc-zieht'); TC.v && TC.v.hervorheben(null);
    P.querySelectorAll('.pz-tc-pl.ziel,.pz-tc-pl.nein').forEach(x => x.classList.remove('ziel', 'nein'));
    if(k){ const l = tcAlleLogos().find(x => tcLogoKey(x) === zz.key); if(l){ TC.logo = l; if(tcEinsetzen(k, l)) kToast(`${l.firma || 'Logo'} sitzt jetzt auf ${tcName(k)}.`); } } };
  H.addEventListener('pointerdown', e => { const b = e.target.closest('[data-tclogo]'); if(!b || e.button > 0) return;
    z = { btn:b, key:b.dataset.tclogo, x:e.clientX, y:e.clientY, id:e.pointerId, typ:e.pointerType, geist:null, bereit:e.pointerType !== 'touch' };
    if(e.pointerType === 'touch') z.halt = setTimeout(() => { if(z){ z.bereit = true; try{ navigator.vibrate && navigator.vibrate(10); }catch(_){} tcGeist(z, z.x, z.y); } }, 320); });
  addEventListener('pointermove', e => { if(!z || e.pointerId !== z.id) return;
    if(!z.geist){ const d = Math.hypot(e.clientX - z.x, e.clientY - z.y); if(z.typ === 'touch' && !z.bereit){ if(d > 10){ clearTimeout(z.halt); z = null; } return; } if(d < 6) return; tcGeist(z, e.clientX, e.clientY); }
    e.preventDefault(); z.geist.style.transform = `translate(${e.clientX}px,${e.clientY}px)`;
    const k = tcZiel(e.clientX, e.clientY), p = k ? tcPlatz(k) : null, ok = p && p.status === 'frei';
    TC.v && TC.v.hervorheben(k, ok ? 'an' : 'nein'); z.geist.classList.toggle('nein', !!k && !ok); z.geist.classList.toggle('ok', !!ok);
    P.querySelectorAll('.pz-tc-pl').forEach(x => { x.classList.toggle('ziel', x.dataset.tcpl === k && ok); x.classList.toggle('nein', x.dataset.tcpl === k && !ok); }); }, { passive:false });
  addEventListener('pointerup', e => { if(z && e.pointerId === z.id) ende(e); });
  addEventListener('pointercancel', e => { if(z && e.pointerId === z.id) ende(e, true); });
  H.addEventListener('contextmenu', e => { if(e.target.closest('[data-tclogo]')) e.preventDefault(); });
}
function tcGeist(z, x, y){ const l = tcAlleLogos().find(q => tcLogoKey(q) === z.key); const g = document.createElement('div'); g.className = 'pz-tc-geist';
  g.innerHTML = l && l.bild ? `<img src="${tcE(l.bild)}" alt="">` : `<b>${tcE(l ? l.firma : '')}</b>`; g.style.transform = `translate(${x}px,${y}px)`; document.body.appendChild(g); z.geist = g; document.body.classList.add('pz-tc-zieht');
  try{ z.btn.releasePointerCapture && z.btn.releasePointerCapture(z.id); }catch(e){} }
// Ziel unter dem Finger: Platz auf der Bühne (nächste sichtbare Marke) oder Zeile in der Liste
function tcZiel(x, y){ const el = document.elementFromPoint(x, y), row = el && el.closest && el.closest('.pz-tc-pl'); if(row) return row.dataset.tcpl;
  const b = document.getElementById('tcBuehne'); if(!b || !TC.v) return null; const r = b.getBoundingClientRect(); if(x < r.left || x > r.right || y < r.top || y > r.bottom) return null;
  return TC.v.platzBei(x, y, 70); }

/* ---------- Bild speichern und teilen ---------- */
async function tcBild(teilen, btn){
  if(!TC.v) return; await paEinmal(btn, async () => {
    try{ const team = tcTeams().find(t => t.id === TC.team) || {}, art = (TC_ARTEN.find(a => a[0] === TC.art) || [])[1] || '';
      const c = await TC.v.png({ zeile:`${team.id === TC_MUSTER ? 'SV/BSC Mörlenbach' : team.name} · ${art}` });
      const blob = await new Promise(ok => c.toBlob(ok, 'image/png')); const name = `trikot-${TC.team}-${TC.art}.png`;
      if(teilen && navigator.canShare){ const f = new File([blob], name, { type:'image/png' }); if(navigator.canShare({ files:[f] })){ await navigator.share({ files:[f], title:'So sieht dein Logo bei uns aus' }); return; } }
      const a = document.createElement('a'); a.href = URL.createObjectURL(blob); a.download = name; document.body.appendChild(a); a.click(); setTimeout(() => { URL.revokeObjectURL(a.href); a.remove(); }, 1500); kToast('Bild gespeichert.');
    }catch(e){ if(e && e.name === 'AbortError') return; kToast('Das Bild ließ sich nicht erstellen.'); } }, 'Einen Moment …');
}

(function(){ try{ const s=document.createElement('style'); s.id='svm78css'; s.textContent="/* Beta 0.80 · Trikot-Creator: Welt der Partner-Zentrale (Papier, Vereinsnavy, Orange, Barlow Condensed), in beiden Themen gleich */\n.pz.pz-tc{padding:0 0 18px;overflow:visible;}\n.pz-tc-kopf{padding:22px 20px 8px;}\n.pz-tc-kopf h2{margin:2px 0 0;font-family:var(--c);font-weight:900;font-size:clamp(34px,9vw,52px);line-height:.92;letter-spacing:-.005em;text-transform:uppercase;color:var(--blau);}\n.pz-tc-kopf p{margin:10px 0 0;max-width:52ch;font-size:15.5px;line-height:1.5;color:var(--ink2);text-wrap:pretty;}\n.pz-tc-raster{display:grid;gap:16px;padding:10px 14px 0;}\n.pz-tc-links,.pz-tc-rechts{min-width:0;display:flex;flex-direction:column;gap:12px;}\n\n/* Auswahl: Mannschaft und Satz */\n.pz-tc-wahl{display:flex;flex-direction:column;gap:10px;}\n.pz-tc-team{display:flex;align-items:center;gap:10px;min-height:48px;padding:0 6px 0 14px;border:1.5px solid var(--linie);border-radius:14px;background:#fff;}\n.pz-tc-team span{font-size:13px;font-weight:700;color:var(--ink2);letter-spacing:.02em;flex:none;}\n.pz-tc-team select{flex:1;min-width:0;min-height:44px;border:0;background:transparent;color:var(--ink);font:inherit;font-size:16px;font-weight:700;padding:0 6px;cursor:pointer;-webkit-appearance:menulist;appearance:auto;}\n.pz-tc-team select:focus-visible{outline:2px solid var(--or);outline-offset:2px;border-radius:8px;}\n.pz-tc-seg{display:flex;gap:4px;padding:4px;border-radius:14px;background:var(--papier2);border:1px solid var(--linie);}\n.pz-tc-seg button{flex:1 1 0;min-width:0;min-height:44px;border:0;border-radius:10px;background:none;color:var(--ink2);font-family:var(--c);font-weight:800;font-size:17px;letter-spacing:.04em;text-transform:uppercase;cursor:pointer;transition:background .15s,color .15s;-webkit-tap-highlight-color:transparent;}\n.pz-tc-seg button.on{background:var(--blau);color:#fff;box-shadow:0 6px 16px -10px rgba(20,27,71,.9);}\n.pz-tc-seg button:disabled{opacity:.38;cursor:not-allowed;}\n.pz-tc-seg button:focus-visible{outline:2px solid var(--or);outline-offset:1px;}\n.pz-tc-seg.klein button{font-size:15px;}\n.pz-tc-seg.mini{padding:3px;border-radius:11px;}\n.pz-tc-seg.mini button{min-height:44px;font-size:14px;border-radius:8px;}\n\n/* Bühne: helles Fotostudio, damit Blau, Orange und Navy leuchten */\n.pz-tc-buehne{position:relative;height:min(64vh,500px);min-height:380px;border-radius:20px;overflow:hidden;\n  background:radial-gradient(120% 80% at 50% 28%,#ffffff 0%,#f1f2f5 48%,#dfe2e9 100%);box-shadow:inset 0 0 0 1px rgba(20,27,71,.08);}\n.pz-tc-laden{position:absolute;inset:0;display:grid;place-content:center;justify-items:center;gap:12px;color:var(--ink2);font-size:15px;font-weight:600;text-align:center;padding:20px;}\n.pz-tc-laden i{width:34px;height:34px;border-radius:50%;border:3px solid rgba(29,39,96,.15);border-top-color:var(--blau);animation:pz-tc-dreh 1s linear infinite;}\n@keyframes pz-tc-dreh{to{transform:rotate(360deg);}}\n@media (prefers-reduced-motion:reduce){.pz-tc-laden i{animation:none;}}\n.pz-tc-leiste{display:flex;gap:10px;}\n.pz-tc-zoom{position:absolute;top:10px;right:10px;z-index:2;min-height:44px;padding:0 14px;border-radius:999px;border:1px solid rgba(29,39,96,.16);background:rgba(255,255,255,.88);color:var(--blau);font:inherit;font-size:13.5px;font-weight:700;cursor:pointer;box-shadow:0 6px 18px -10px rgba(10,14,40,.45);-webkit-backdrop-filter:blur(6px);backdrop-filter:blur(6px);}\n.pz-tc-zoom:focus-visible{outline:2px solid var(--or);outline-offset:2px;}\n.pz-tc-zoom[hidden]{display:none;}\n.pz-tc-leiste .pz-tc-seg:first-child{flex:3;}\n.pz-tc-leiste .pz-tc-seg:last-child{flex:2;}\n.pz-tc-info{margin:0;padding:0 4px;font-size:14.5px;line-height:1.45;color:var(--ink2);}\n.pz-tc-info b{color:var(--ink);}\n\n/* Blöcke rechts */\n.pz-tc-block{background:#fff;border:1px solid var(--linie);border-radius:18px;padding:14px;}\n.pz-tc-bk{display:flex;align-items:center;justify-content:space-between;gap:10px;margin-bottom:10px;}\n.pz-tc-bk h3{margin:0;font-family:var(--c);font-weight:900;font-size:24px;line-height:1;text-transform:uppercase;letter-spacing:.01em;color:var(--blau);}\n.pz-tc-zahl{font-size:13px;font-weight:700;color:var(--gruen);background:rgba(44,107,58,.1);border-radius:999px;padding:4px 10px;}\n.pz-tc-hoch{position:relative;display:inline-flex;align-items:center;gap:8px;min-height:44px;padding:0 16px;border-radius:999px;background:var(--knopf);color:#fff;font-family:var(--c);font-weight:800;font-size:16px;letter-spacing:.04em;text-transform:uppercase;cursor:pointer;}\n.pz-tc-hoch svg{width:17px;height:17px;}\n.pz-tc-hoch input{position:absolute;inset:0;opacity:0;cursor:pointer;width:100%;}\n.pz-tc-hoch:focus-within{outline:2px solid var(--blau);outline-offset:2px;}\n\n/* Logoleiste: am Handy wischen, am Rechner als Raster */\n.pz-tc-logos{display:flex;gap:8px;overflow-x:auto;scroll-snap-type:x proximity;padding:2px 2px 8px;margin:0 -2px;scrollbar-width:thin;}\n.pz-tc-logos > div{flex:none;scroll-snap-align:start;}\n.pz-tc-lg{position:relative;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:4px;width:104px;height:84px;padding:8px;border:1.5px solid var(--linie);border-radius:14px;background:#fff;cursor:grab;touch-action:pan-x;-webkit-touch-callout:none;-webkit-user-select:none;user-select:none;transition:border-color .15s,box-shadow .15s,transform .15s;}\n.pz-tc-lg img{max-width:84px;max-height:40px;object-fit:contain;pointer-events:none;}\n.pz-tc-lg b{font-family:var(--c);font-weight:800;font-size:17px;line-height:1.05;text-transform:uppercase;color:var(--blau);text-align:center;}\n.pz-tc-lg span{max-width:100%;font-size:11.5px;font-weight:600;color:var(--ink2);white-space:nowrap;overflow:hidden;text-overflow:ellipsis;}\n.pz-tc-lg.ohne span{display:none;}\n.pz-tc-lg.dunkel{background:linear-gradient(160deg,#2a3a86,#1d2760);border-color:#1d2760;}\n.pz-tc-lg.dunkel span{color:#dbe4f2;}\n.pz-tc-lg:hover{border-color:var(--ink2);}\n.pz-tc-lg.an{border-color:var(--or);box-shadow:0 0 0 3px rgba(232,116,31,.22);}\n.pz-tc-lg:focus-visible{outline:2px solid var(--or);outline-offset:2px;}\n.pz-tc-tipp{margin:6px 2px 0;font-size:14px;line-height:1.45;color:var(--ink2);}\n\n/* Logo-Analyse */\n.pz-tc-an{margin-top:8px;display:flex;flex-direction:column;gap:10px;}\n.pz-tc-an-k{display:flex;flex-wrap:wrap;align-items:baseline;gap:6px 10px;}\n.pz-tc-an-k b{font-size:16px;}\n.pz-tc-warn{font-size:12.5px;font-weight:700;color:#8a4a0c;background:rgba(232,116,31,.14);border-radius:999px;padding:3px 9px;}\n.pz-tc-vor{display:grid;grid-template-columns:1fr 1fr;gap:8px;}\n.pz-tc-vor figure{margin:0;display:flex;flex-direction:column;gap:5px;}\n.pz-tc-vor figure > div{height:76px;border-radius:12px;display:grid;place-items:center;padding:10px;}\n.pz-tc-vor .blau > div{background:linear-gradient(160deg,#3a68d8,#2f5fd0 60%,#2853bb);}\n.pz-tc-vor .weiss > div{background:#fff;border:1px solid var(--linie);}\n.pz-tc-vor img{max-width:100%;max-height:54px;object-fit:contain;}\n.pz-tc-vor figcaption{font-size:12px;font-weight:600;color:var(--ink2);}\n.pz-tc-sz{font-family:var(--c);font-weight:800;font-size:22px;text-transform:uppercase;color:#fff;}\n.pz-tc-sz.dk{color:var(--blau);}\n.pz-tc-farben{display:flex;flex-wrap:wrap;align-items:center;gap:6px;}\n.pz-tc-farben i{width:22px;height:22px;border-radius:50%;box-shadow:inset 0 0 0 1px rgba(0,0,0,.14);}\n.pz-tc-farben .pz-tc-leise:last-child{margin-left:auto;}\n.pz-tc-leise{font-size:12.5px;font-weight:600;color:var(--ink2);}\n.pz-tc-firma,.pz-tc-dlgf{display:flex;flex-direction:column;gap:5px;}\n.pz-tc-firma span,.pz-tc-dlgf span{font-size:13px;font-weight:700;color:var(--ink2);}\n.pz-tc-firma input{min-height:46px;border:1.5px solid var(--linie);border-radius:12px;padding:0 12px;font:inherit;font-size:16px;background:#fff;color:var(--ink);}\n.pz-tc-firma input:focus{outline:2px solid var(--or);outline-offset:1px;border-color:transparent;}\n\n/* Platzliste */\n.pz-tc-liste{display:flex;flex-direction:column;gap:6px;}\n.pz-tc-pl{border:1.5px solid var(--linie);border-radius:14px;background:var(--papier);transition:border-color .15s,background .15s,box-shadow .15s;}\n.pz-tc-pl.frei{background:#fff;border-style:dashed;}\n.pz-tc-pl.an{border-color:var(--blau);box-shadow:0 0 0 3px rgba(29,39,96,.12);}\n.pz-tc-pl.ziel{border-color:var(--or);border-style:solid;background:rgba(232,116,31,.08);}\n.pz-tc-pl.nein{border-color:var(--rot,#b0281a);background:rgba(176,40,26,.07);}\n.pz-tc-plk{all:unset;box-sizing:border-box;display:flex;flex-direction:column;gap:2px;width:100%;min-height:52px;padding:8px 12px;cursor:pointer;border-radius:13px;}\n.pz-tc-plk:focus-visible{outline:2px solid var(--or);outline-offset:-2px;}\n.pz-tc-plk b{font-size:15.5px;font-weight:700;color:var(--ink);}\n.pz-tc-plk .st{display:inline-flex;align-items:center;gap:6px;font-size:13.5px;line-height:1.3;color:var(--ink2);}\n.pz-tc-plk .st svg{width:14px;height:14px;flex:none;}\n.pz-tc-plk .st.belegt{color:var(--blau);font-weight:600;}\n.pz-tc-plk .st.res{color:#8a4a0c;font-weight:600;}\n.pz-tc-plk .st.vor{color:var(--knopf);font-weight:700;}\n.pz-tc-plk .st.frei{color:var(--gruen);}\n.pz-tc-akt{display:flex;flex-wrap:wrap;gap:6px;padding:0 10px 10px;}\n.pz-tc-k{display:inline-flex;align-items:center;justify-content:center;min-height:44px;padding:0 14px;border-radius:999px;border:1.5px solid var(--blau);background:var(--blau);color:#fff;font:inherit;font-size:14px;font-weight:700;cursor:pointer;}\n.pz-tc-k.leise{background:transparent;color:var(--blau);}\n.pz-tc-k:focus-visible{outline:2px solid var(--or);outline-offset:2px;}\n.pz-tc-k:disabled{opacity:.5;}\n.pz-tc-fein{flex:1 1 100%;display:flex;flex-wrap:wrap;align-items:center;gap:8px 14px;margin-bottom:4px;}\n.pz-tc-fein .pz-tc-seg{flex:1 1 220px;}\n.pz-tc-gr{flex:1 1 160px;display:flex;align-items:center;gap:10px;min-height:44px;}\n.pz-tc-gr span{font-size:13px;font-weight:700;color:var(--ink2);}\n.pz-tc-gr input{flex:1;min-width:0;accent-color:var(--or);height:44px;}\n\n/* Teilen */\n.pz-tc-teilen{display:flex;flex-wrap:wrap;gap:8px;align-items:center;}\n.pz-tc-teilen p{flex:1 1 100%;margin:2px 2px 0;font-size:13px;line-height:1.4;color:var(--ink2);}\n.pz-tc-b{flex:1 1 140px;display:inline-flex;align-items:center;justify-content:center;gap:8px;min-height:48px;padding:0 16px;border-radius:999px;border:1.5px solid var(--blau);background:#fff;color:var(--blau);font-family:var(--c);font-weight:800;font-size:17px;letter-spacing:.04em;text-transform:uppercase;cursor:pointer;}\n.pz-tc-b.or{background:var(--knopf);border-color:var(--knopf);color:#fff;}\n.pz-tc-b svg{width:18px;height:18px;}\n.pz-tc-b:focus-visible{outline:2px solid var(--or);outline-offset:2px;}\n.pz-tc-b[hidden]{display:none;}\n\n/* Dialog */\n.pz-tc-dlgf{margin:14px 0 6px;}\n.pz-tc-dlgf input{min-height:48px;font-size:16px!important;}\n.pz-tc-dlgk{display:flex;flex-wrap:wrap;gap:8px;margin-top:14px;}\n.pz-tc-dlgk .btn{min-height:46px;flex:1 1 140px;}\n\n/* Ziehen */\n.pz-tc-geist{position:fixed;left:0;top:0;z-index:9999;pointer-events:none;margin:-34px 0 0 -48px;width:96px;height:68px;border-radius:14px;background:#fff;display:grid;place-items:center;padding:8px;box-shadow:0 18px 40px -12px rgba(10,14,40,.5);border:2px solid #fff;transition:border-color .12s;}\n.pz-tc-geist img{max-width:100%;max-height:48px;object-fit:contain;}\n.pz-tc-geist b{font-family:var(--c,'BarlowC'),sans-serif;font-weight:800;font-size:16px;text-transform:uppercase;color:#1d2760;}\n.pz-tc-geist.ok{border-color:#e8741f;}\n.pz-tc-geist.nein{border-color:#b0281a;opacity:.85;}\nbody.pz-tc-zieht{cursor:grabbing;-webkit-user-select:none;user-select:none;}\n\n/* Rechner: zwei Spalten, die Bühne bleibt stehen */\n@media (min-width:980px){\n  .pz-tc-kopf{padding:28px 28px 10px;}\n  .pz-tc-raster{grid-template-columns:minmax(0,1.15fr) minmax(0,.85fr);gap:22px;padding:10px 22px 0;align-items:start;}\n  .pz-tc-links{position:sticky;top:12px;}\n  .pz-tc-buehne{height:min(74vh,660px);}\n  .pz-tc-wahl{flex-direction:row;}\n  .pz-tc-wahl .pz-tc-team{flex:1;}\n  .pz-tc-wahl .pz-tc-seg{flex:1.2;}\n  .pz-tc-logos{display:grid;grid-template-columns:repeat(auto-fill,minmax(96px,1fr));overflow:visible;max-height:none;}\n  .pz-tc-logos .pz-tc-lg{width:100%;}\n}\n\n.pz-anzug-stand{padding:0;margin:14px 0 0;list-style:none;display:grid;gap:6px}.pz-anzug-stand button{display:grid;grid-template-columns:1fr auto;gap:4px 12px;width:100%;min-height:48px;text-align:left;padding:10px 12px;border:1px solid var(--sv-line,#aab4c8);border-radius:6px;background:var(--sv-card,#fff);color:var(--sv-ink,#1d2760);font-size:14px}.pz-anzug-stand small{grid-column:1/-1;font-size:12px}.pz-anzug-stand strong{font-size:13px}\n\n@media(min-width:980px){.pz-tc-wahl{flex-wrap:wrap}.pz-tc-wahl .pz-tc-team{flex:1 1 280px;min-width:0}.pz-tc-wahl #tcArt{flex:1 0 220px}}\n.pz-tc.anzug-foto .pz-tc-buehne{height:auto;aspect-ratio:3/2}\n"; document.head.appendChild(s); }catch(e){} })();
/* =====================================================================
   Beta 0.80 · Bandencreator: Gestaltung, Druckdaten und Platzszene
   Gemeinsam für die App (svm79.js) und die Partner-Präsentation (partner.js), braucht LOGO (logolib.js).
   - Feste Regeln, damit alle Banden zusammenpassen: Sicherheitsabstand, großes Logo, bei Bedarf ein ausdrücklich bestätigter Symbolname,
     Partner-CI heißt: weiße Bande, Marine, Logo einfarbig. Seit 0.99.38 steht KEIN Vereinsabsender mehr auf der Bande (kein Wappen,
     kein „SV/BSC“, keine Handschrift): Auf die Bande gehört nur der Partner. Schriften und Farben aus dem Corporate Design Manual.
   - Alles in Millimetern. layout() liefert eine Liste von Bausteinen (Fläche, Linie, Bild, Text, Strich) mit ihren Kästen,
     daraus malen (Canvas), svg (Vektor mit eingebetteten Schriften), pdf (Originalgröße mit 2 cm Beschnitt und Schnittmarken).
   - Text passt immer: Schrift wird kleiner (auch zweizeilig), nie abgeschnitten. Lesbar heißt: Versalhöhe ≥ Abstand / 250.
   - szene(): die Bande am Spielfeldrand in Perspektive mit Nachbarbanden im Einheitslook, Rasen und Tageslicht.
   Nichts verlässt das Gerät.
   ===================================================================== */
const BANDE = (() => {
  const C = { marine:'#1d2760', orange:'#e8741f', tinte:'#1c1c22', grau:'#3a3a44', himmel:'#8fc9ec', weiss:'#ffffff' };
  const FORMATE = {
    '250x80':  { w:2500, h:800,  t:'2,50 × 0,80 m', k:'2,5 m', lang:'2,5 m lang, 80 cm hoch', paket:'Einzelbande', hinweis:'Einzelbande: eine Platte, 2,50 × 0,80 m (Pakete Club und Premium)' },
    '300x80':  { w:3000, h:800,  t:'3,00 × 0,80 m', k:'3 m', lang:'3 m lang, 80 cm hoch', std:true },
    '400x80':  { w:4000, h:800,  t:'4,00 × 0,80 m', k:'4 m', lang:'4 m lang, 80 cm hoch' },
    '500x80':  { w:5000, h:800,  t:'5,00 × 0,80 m', k:'5 m', lang:'5 m lang, 80 cm hoch', paket:'Doppelbande', hinweis:'Doppelbande: zwei Platten zu je 2,50 m, zusammen 5,00 × 0,80 m (Paket 1896 Partner, Maß der heutigen Banden)' },
    '600x80':  { w:6000, h:800,  t:'6,00 × 0,80 m', k:'6 m', lang:'6 m lang, 80 cm hoch' },
    '200x100': { w:2000, h:1000, t:'2,00 × 1,00 m', k:'Partnerwand', lang:'Feld der Partnerwand, 2 m breit, 1 m hoch', wand:true } };
  // Welche Bande zu welchem Paket gehört (Albert, 16.11.2026): Einzelbande 2500 × 800 mm für Club und Premium, Doppelbande 5000 × 800 mm
  // nur für 1896 Partner, Supporter hat keine Bande. Die Reihenfolge ist die der Pakete.
  const PAKETE = [
    { key:'supporter', t:'Supporter', format:null },
    { key:'club', t:'Club', format:'250x80' },
    { key:'premium', t:'Premium', format:'250x80' },
    { key:'p1896', t:'1896 Partner', format:'500x80' } ];
  const BESCHNITT = 20;           // mm je Seite
  const LAYOUTS = [['links', 'Logo links'], ['mitte', 'Logo groß']];
  const FAM = { c:"'BandeC','Barlow Condensed','PZC','BarlowC','Arial Narrow',sans-serif", t:"'BandeT','Barlow','InterV',Arial,sans-serif", h:"'BandeH','Caveat','PZHand',cursive" };
  const SCHRIFTEN = [['BandeC', 'barlowc-900.woff2', '900'], ['BandeT', 'barlow-500.woff2', '500'], ['BandeT', 'barlow-600.woff2', '600'], ['BandeT', 'barlow-700.woff2', '700'], ['BandeH', 'caveat-700.woff2', '700']];

  /* ---------- Farben ---------- */
  const rgb = h => { h = String(h || '').replace('#', ''); if(h.length === 3) h = h.split('').map(x => x + x).join(''); const n = parseInt(h, 16) || 0; return [n >> 16 & 255, n >> 8 & 255, n & 255]; };
  const lum = h => { const f = v => { v /= 255; return v <= .03928 ? v / 12.92 : Math.pow((v + .055) / 1.055, 2.4); }; const [r, g, b] = rgb(h); return .2126 * f(r) + .7152 * f(g) + .0722 * f(b); };
  const kontrast = (a, b) => { const x = lum(a), y = lum(b); return (Math.max(x, y) + .05) / (Math.min(x, y) + .05); };
  const sl = h => { const [r, g, b] = rgb(h).map(v => v / 255), mx = Math.max(r, g, b), mn = Math.min(r, g, b), l = (mx + mn) / 2, d = mx - mn; return { s:d === 0 ? 0 : d / (1 - Math.abs(2 * l - 1)), l }; };
  const textAuf = bg => kontrast(bg, C.weiss) >= kontrast(bg, C.tinte) ? C.weiss : C.tinte;
  // Firmenfarbe aus dem Logo: die häufigste kräftige Farbe, sonst die dunkelste, sonst Marine
  function akzent(farben){
    const L = (farben || []).map(f => Object.assign({}, f, sl(f.hex))).filter(f => f.s > .3 && f.l > .12 && f.l < .82);
    if(L.length) return L.sort((a, b) => b.anteil - a.anteil)[0].hex;
    const d = (farben || []).filter(f => lum(f.hex) < .2).sort((a, b) => b.anteil - a.anteil)[0];
    return d ? d.hex : C.marine;
  }

  /* ---------- Schriften und Messen ---------- */
  let schriftP = null, basisJetzt = 'partner/';
  function schriften(basis){
    if(basis) basisJetzt = basis; if(schriftP) return schriftP;
    if(typeof FontFace === 'undefined' || !document.fonts) return (schriftP = Promise.resolve());
    schriftP = Promise.all(SCHRIFTEN.map(([fam, f, w]) => new FontFace(fam, `url(${basisJetzt}${f})`, { weight:w }).load().then(x => { document.fonts.add(x); }).catch(() => {})))
      .then(() => { MESS.clear(); });
    return schriftP;
  }
  const MESS = new Map(); let MC = null;
  const font = (f, fs) => `${f.w} ${fs}px ${FAM[f.fam]}`;
  // Maße bei 100 px Schriftgröße; Laufweite (ls, in em) zählt mit
  function mess(text, f){
    const k = f.fam + f.w + '|' + (f.ls || 0) + '|' + text; if(MESS.has(k)) return MESS.get(k);
    if(!MC) MC = document.createElement('canvas').getContext('2d');
    MC.font = font(f, 100); const m = MC.measureText(text), n = [...text].length;
    const r = { w:m.width + (f.ls || 0) * 100 * Math.max(0, n - 1), a:m.actualBoundingBoxAscent || 72, d:m.actualBoundingBoxDescent || 0, l:m.actualBoundingBoxLeft || 0 };
    MESS.set(k, r); return r;
  }
  const versal = f => mess('H', f).a / 100;     // Versalhöhe je mm Schriftgröße
  const lesbarAus = (f, fs) => Math.round(versal(f) * fs / 4) ;   // Meter: Versalhöhe (mm) mal 250 / 1000
  const sauber = t => String(t == null ? '' : t).replace(/\s*[–—]\s*/g, ' · ').replace(/\s+/g, ' ').trim();

  // Text in einen Kasten einpassen: eine oder zwei Zeilen, die größere Schrift gewinnt (zwei Zeilen erst ab 15 % Gewinn).
  function einpassen(text, f, maxW, maxH, maxFs, zeilen = 2, lh = .92){
    text = sauber(text); if(!text || maxW <= 0 || maxH <= 0) return null;
    const opts = [[text]], w = text.split(' ');
    if(zeilen >= 2 && w.length > 1){ let best = null;
      for(let i = 1; i < w.length; i++){ const a = w.slice(0, i).join(' '), b = w.slice(i).join(' '), m = Math.max(mess(a, f).w, mess(b, f).w); if(!best || m < best.m) best = { m, L:[a, b] }; }
      opts.push(best.L); }
    let best = null;
    opts.forEach(L => {
      const wMax = Math.max(...L.map(z => mess(z, f).w)) / 100, a = Math.max(...L.map(z => mess(z, f).a)) / 100, d = Math.max(...L.map(z => mess(z, f).d)) / 100;
      const hPer = (L.length - 1) * lh + a + d, fs = Math.max(1, Math.min(maxFs, maxW / wMax, maxH / hPer));
      if(!best || fs > best.fs * (L.length > 1 ? 1.06 : 1)) best = { L, fs, wMax, a, d, hPer, lh, f };
    });
    best.w = best.wMax * best.fs; best.h = best.hPer * best.fs; return best;
  }
  // Textbaustein an Position (x je nach Ausrichtung, y = Oberkante)
  function textOp(p, x, y, align, fill, rolle, extra){
    const box = { x:align === 'c' ? x - p.w / 2 : align === 'r' ? x - p.w : x, y, w:p.w, h:p.h };
    return Object.assign({ t:'text', lines:p.L, f:p.f, fs:p.fs, lh:p.lh, a:p.a, x, y, align, fill, rolle, box }, extra || {});
  }

  /* ---------- Layout ---------- */
  const firmenKey = value => sauber(value).normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().replace(/[^a-z0-9]/g, '');
  function muster(spec){
    spec = spec || {}; if(['normal', 'bb', 'moerlens'].includes(spec.pattern)) return spec.pattern;
    const firma = firmenKey(spec.firma || spec.name);
    return firma === 'bbbernsbaltz' ? 'bb' : ['morlens', 'moerlens','bbbernsbaltzmorlens','bbbernsbaltzmoerlens'].includes(firma) ? 'moerlens' : 'normal';
  }
  // The legacy page also runs without BD_CORE. Keep recognition limited to complete contact lines.
  function kontaktZeile(value){
    if(typeof BD_CORE !== 'undefined' && BD_CORE.isContactText) return BD_CORE.isContactText(value);
    const t = String(value == null ? '' : value).trim(); if(!t) return false;
    if(/[\r\n]/.test(t)) return t.split(/\r?\n/).some(kontaktZeile);
    const label = t.match(/^(telefon|tel\.?|telefax|fax|mobil|handy|phone|e[ -]?mail|mail|internet|website|homepage|web|url)\s*(?::\s*|\s+)(.+)$/i), v = (label ? label[2] : t).trim();
    if(/^(?:https?:\/\/|www\.)[^\s<>]+$/i.test(v) || /^(?:mailto:)?[^\s@<>]+@(?:[\p{L}\p{N}-]+\.)+[\p{L}]{2,63}$/iu.test(v) || /^(?:[\p{L}\p{N}](?:[\p{L}\p{N}-]*[\p{L}\p{N}])?\.)+[\p{L}]{2,63}(?::\d{1,5})?(?:[/?#][^\s<>]*)?$/iu.test(v)) return true;
    const phone = v.replace(/^tel:/i, '').trim(), digits = phone.replace(/\D/g, ''), named = /^tel:/i.test(v) || !!(label && /^(?:telefon|tel\.?|telefax|fax|mobil|handy|phone)$/i.test(label[1]));
    if(/^[+\d().\s/-]+$/.test(phone) && digits.length >= (named ? 3 : 7) && digits.length <= 18 && (named || /^(?:\+|0)/.test(phone))) return true;
    const parts = t.split(/\s*[;|·•]\s*/); return parts.length > 1 && parts.every(kontaktZeile);
  }
  const ohneKontakt = value => String(value == null ? '' : value).split(/\r?\n/).filter(line => !kontaktZeile(line)).join(' ');
  function druckOps(L){
    return L.ops.flatMap(o => {
      if(['kontakt', 'web', 'telefon', 'fax', 'leiste'].includes(o.rolle)) return [];
      if(o.rolle === 'claim' && (L.pattern !== 'moerlens' || o.lines.join(' ') !== 'Restobar & Patisserie')) return [];
      if(o.t !== 'text') return [o]; const lines = o.lines.filter(line => !kontaktZeile(line));
      return lines.some(line => String(line).trim()) ? [lines.length === o.lines.length ? o : Object.assign({}, o, { lines })] : [];
    });
  }
  // A logo occupies the safe area. Only confirmed symbols get a separate company name.
  function layout(spec, res){
    spec = spec || {}; res = res || {};
    const F = FORMATE[spec.format] || FORMATE['300x80'], W = F.w, H = F.h, ci = spec.stil !== 'original';
    const ops = [], info = { warn:[], kontrast:[], lesbar:{} }, m = Math.round(Math.min(W, H) * .08), Hu = H - 2 * m, aw = W - 2 * m, x0 = m, cx = W / 2;
    const logo = res.logo && res.logo.w > 0 && res.logo.h > 0 ? res.logo : null, pattern = muster(spec), name = sauber(ohneKontakt(spec.name || spec.firma)), nameAn = spec.nameAn === true && pattern === 'normal';
    const lay = spec.layout === 'mitte' || spec.layout === 'claim' ? 'mitte' : 'links', nF = { fam:'c', w:900 }, cF = { fam:'t', w:600 };
    const ak = ci ? null : (/^#[0-9a-fA-F]{6}$/.test(spec.akzent || '') ? spec.akzent : null) || akzent(logo && logo.farben);
    const bg = !ci && logo && logo.hell ? (lum(ak) < .16 ? ak : C.tinte) : C.weiss, nameF = ci ? C.marine : textAuf(bg), claimF = nameF;
    ops.push({ t:'rect', x:-BESCHNITT, y:-BESCHNITT, w:W + 2 * BESCHNITT, h:H + 2 * BESCHNITT, fill:bg, rolle:'grund' });
    const logoBox = (mw, mh) => { if(!logo) return null; const scale = Math.min(mw / logo.w, mh / logo.h); return { w:logo.w * scale, h:logo.h * scale }; };
    const img = (b, x, y) => ops.push({ t:'img', key:'logo', x, y, w:b.w, h:b.h, rolle:'logo', box:{ x, y, w:b.w, h:b.h } });
    const txt = (p, x, y, rolle, fill = nameF) => { if(p) ops.push(textOp(p, x, y, 'c', fill, rolle)); };
    if(!logo){
      const p = einpassen(name.toUpperCase(), nF, aw, Hu, Hu / .7, 2); if(p) txt(p, cx, m + (Hu - p.h) / 2, 'name');
    } else if(pattern === 'bb'){
      const lw = Math.min(aw * .32, Hu * 1.45), gap = Math.min(H * .10, aw * .04), sw = (aw - lw - 2 * gap) / 2, b = logoBox(lw, Hu);
      img(b, cx - b.w / 2, m + (Hu - b.h) / 2);
      const fs = Math.min(Hu * .85, sw / (Math.max(mess('EVENT', nF).w, mess('KREATIV', nF).w) / 100));
      const left = einpassen('EVENT', nF, sw, Hu, fs, 1), right = einpassen('KREATIV', nF, sw, Hu, fs, 1);
      txt(left, x0 + sw / 2, (H - left.h) / 2, 'event'); txt(right, W - m - sw / 2, (H - right.h) / 2, 'kreativ');
    } else if(pattern === 'moerlens'){
      const claim = einpassen('Restobar & Patisserie', cF, aw, Hu * .22, H * .19, 1), gap = H * .05, b = logoBox(aw, Hu - claim.h - gap), y = m + (Hu - b.h - claim.h - gap) / 2;
      img(b, cx - b.w / 2, y); txt(claim, cx, y + b.h + gap, 'claim', claimF);
    } else if(nameAn && name){
      if(lay === 'mitte'){
        const p = einpassen(name.toUpperCase(), nF, aw, Hu * .22, Hu * .3, 1), gap = H * .05, b = logoBox(aw, Hu - p.h - gap), y = m + (Hu - b.h - p.h - gap) / 2;
        img(b, cx - b.w / 2, y); txt(p, cx, y + b.h + gap, 'name');
      } else {
        const b = logoBox(Math.min(aw * .35, Hu * 1.45), Hu), gap = Math.min(H * .1, aw * .06), tx = x0 + b.w + gap, tw = W - m - tx, p = einpassen(name.toUpperCase(), nF, tw, Hu, Hu / .7, 2);
        img(b, x0, m + (Hu - b.h) / 2); if(p) txt(p, tx + tw / 2, m + (Hu - p.h) / 2, 'name');
      }
    } else { const b = logoBox(aw, Hu); img(b, cx - b.w / 2, m + (Hu - b.h) / 2); }
    ops.filter(o => o.t === 'text').forEach(o => {
      info.kontrast.push({ rolle:o.rolle, text:o.fill, grund:bg, wert:Math.round(kontrast(o.fill, bg) * 10) / 10 });
      const distance = lesbarAus(o.f, o.fs); if(!info.lesbar[o.rolle] || distance < info.lesbar[o.rolle]) info.lesbar[o.rolle] = distance;
    });
    if(info.lesbar.name && info.lesbar.name < 30) info.warn.push('Der große Text ist nur aus ' + info.lesbar.name + ' m lesbar. Kürzer wird er größer.');
    if(!logo && spec.logoGewollt) info.warn.push('Das Logo fehlt noch. Bis dahin steht der Name als Schriftzug.');
    return { W, H, B:BESCHNITT, rand:m, leiste:0, kontakt:false, pattern, format:spec.format in FORMATE ? spec.format : '300x80', stil:ci ? 'ci' : 'original', layout:lay, ops, info, farben:{ grund:bg, leiste:ak, akzent:ak } };
  }

  /* ---------- Malen (Canvas, 1 Einheit = 1 mm, Ursprung = Endformat oben links) ---------- */
  function malen(x, L, res){
    res = res || {};
    druckOps(L).forEach(o => {
      if(o.t === 'rect'){ x.fillStyle = o.fill; x.fillRect(o.x, o.y, o.w, o.h); }
      else if(o.t === 'linie'){ x.strokeStyle = o.stroke; x.lineWidth = o.w; x.lineCap = 'round'; x.beginPath(); x.moveTo(o.x1, o.y1); x.lineTo(o.x2, o.y2); x.stroke(); }
      else if(o.t === 'strich'){ const [a, b, c] = o.pts; x.strokeStyle = o.stroke; x.lineWidth = o.w; x.lineCap = 'round'; x.beginPath(); x.moveTo(a[0], a[1]); x.quadraticCurveTo(b[0], b[1], c[0], c[1]); x.stroke(); }
      else if(o.t === 'img'){ const im = o.key === 'logo' ? res.logoBild : res.wappenBild; if(im) try{ x.drawImage(im, o.x, o.y, o.w, o.h); }catch(e){} }
      else if(o.t === 'text'){
        x.save(); x.fillStyle = o.fill; x.font = font(o.f, o.fs); x.textBaseline = 'alphabetic';
        if(o.rot){ const cx = o.box.x + o.box.w / 2, cy = o.box.y + o.box.h / 2; x.translate(cx, cy); x.rotate(o.rot * Math.PI / 180); x.translate(-cx, -cy); }
        o.lines.forEach((z, i) => { const lw = mess(z, o.f).w / 100 * o.fs, sx = o.align === 'c' ? o.x - lw / 2 : o.align === 'r' ? o.x - lw : o.x, by = o.y + o.a * o.fs + i * o.lh * o.fs;
          if(o.f.ls){ let xx = sx; [...z].forEach(ch => { x.fillText(ch, xx, by); xx += mess(ch, o.f).w / 100 * o.fs + o.f.ls * o.fs; }); }
          else x.fillText(z, sx, by); });
        x.restore(); }
    });
  }
  // Fertiges Bild der Bande; mitBeschnitt: mit 2 cm Rand
  function bild(L, res, pxProMm, mitBeschnitt){
    const b = mitBeschnitt ? L.B : 0, c = document.createElement('canvas');
    c.width = Math.max(1, Math.round((L.W + 2 * b) * pxProMm)); c.height = Math.max(1, Math.round((L.H + 2 * b) * pxProMm));
    const x = c.getContext('2d'); x.setTransform(pxProMm, 0, 0, pxProMm, b * pxProMm, b * pxProMm); malen(x, L, res); return c;
  }

  /* ---------- Vorbereiten: Schriften, Logo (Variante je Stil) und Doppel-Logo ---------- */
  const bilder = new Map();
  function laden(src){ if(bilder.has(src)) return bilder.get(src);
    const p = new Promise((ok, nein) => { const i = new Image(); i.decoding = 'async'; i.onload = () => ok(i); i.onerror = () => nein(new Error('Bild fehlt')); i.src = src; });
    bilder.set(src, p); p.catch(() => bilder.delete(src)); return p; }
  async function vorbereiten(spec, o){
    o = o || {}; await schriften(o.basis);
    const res = {}, ci = spec.stil !== 'original';
    if(spec.logo && typeof LOGO !== 'undefined'){
      try{ const a = await LOGO.aufbereiten(spec.logo); const art = ci ? 'farbe:' + (muster(spec)==='bb' ? C.orange : spec.logoFarbe === 'schwarz' ? C.tinte : C.marine) : 'original';
        const c = await LOGO.variante(spec.logo, art); res.logo = { w:c.width, h:c.height, hell:a.hell, farben:a.farben }; res.logoBild = c; res.analyse = a; }
      catch(e){ res.logoFehler = e.message || 'Logo lässt sich nicht laden'; } }
    return res;
  }

  /* ---------- Druckansicht: flach, mit Beschnitt, Schnittmarken und Maßen ---------- */
  function flach(cv, L, res, o){
    o = o || {}; const dpr = Math.min(2, window.devicePixelRatio || 1), r = cv.getBoundingClientRect();
    const Wc = Math.max(10, Math.round(r.width * dpr)), Hc = Math.max(10, Math.round(r.height * dpr)); cv.width = Wc; cv.height = Hc;
    const x = cv.getContext('2d'), pad = 46 * dpr, B = L.B;
    x.fillStyle = '#efe9dd'; x.fillRect(0, 0, Wc, Hc);
    const s = Math.min((Wc - 2 * pad) / (L.W + 2 * B), (Hc - 2 * pad - 22 * dpr) / (L.H + 2 * B)), ox = (Wc - (L.W + 2 * B) * s) / 2 + B * s, oy = (Hc - (L.H + 2 * B) * s) / 2 - 8 * dpr + B * s;
    x.save(); x.shadowColor = 'rgba(20,27,71,.25)'; x.shadowBlur = 18 * dpr; x.shadowOffsetY = 6 * dpr; x.fillStyle = '#fff'; x.fillRect(ox - B * s, oy - B * s, (L.W + 2 * B) * s, (L.H + 2 * B) * s); x.restore();
    x.save(); x.setTransform(s, 0, 0, s, ox, oy); x.beginPath(); x.rect(-B, -B, L.W + 2 * B, L.H + 2 * B); x.clip(); malen(x, L, res); x.restore();
    // Beschnitt aufhellen, Endformat als Linie
    x.fillStyle = 'rgba(239,233,221,.62)';
    x.fillRect(ox - B * s, oy - B * s, (L.W + 2 * B) * s, B * s); x.fillRect(ox - B * s, oy + L.H * s, (L.W + 2 * B) * s, B * s);
    x.fillRect(ox - B * s, oy, B * s, L.H * s); x.fillRect(ox + L.W * s, oy, B * s, L.H * s);
    x.strokeStyle = 'rgba(28,28,34,.55)'; x.lineWidth = 1 * dpr; x.strokeRect(ox, oy, L.W * s, L.H * s);
    if(o.raster){ x.save(); x.setLineDash([6 * dpr, 5 * dpr]); x.strokeStyle = '#e8741f'; x.lineWidth = 1.2 * dpr; x.strokeRect(ox + L.rand * s, oy + L.rand * s, (L.W - 2 * L.rand) * s, (L.H - 2 * L.rand) * s); x.restore(); }
    // Schnittmarken
    x.strokeStyle = '#1c1c22'; x.lineWidth = 1 * dpr; const mk = 14 * dpr, ab = B * s + 3 * dpr;
    [[ox, oy, -1, -1], [ox + L.W * s, oy, 1, -1], [ox, oy + L.H * s, -1, 1], [ox + L.W * s, oy + L.H * s, 1, 1]].forEach(([px, py, sx, sy]) => {
      x.beginPath(); x.moveTo(px + sx * ab, py); x.lineTo(px + sx * (ab + mk), py); x.moveTo(px, py + sy * ab); x.lineTo(px, py + sy * (ab + mk)); x.stroke(); });
    // Maße
    const F = FORMATE[L.format]; x.fillStyle = '#3a3a44'; x.strokeStyle = '#3a3a44'; x.font = `600 ${12 * dpr}px ${FAM.t}`; x.textAlign = 'center'; x.textBaseline = 'middle';
    const yM = oy + (L.H + B) * s + 16 * dpr, pf = (x1, y1, x2, y2) => { x.beginPath(); x.moveTo(x1, y1); x.lineTo(x2, y2); x.stroke(); };
    pf(ox, yM, ox + L.W * s, yM); pf(ox, yM - 5 * dpr, ox, yM + 5 * dpr); pf(ox + L.W * s, yM - 5 * dpr, ox + L.W * s, yM + 5 * dpr);
    const tB = (L.W / 10) + ' cm', tw = x.measureText(tB).width + 14 * dpr; x.fillStyle = '#efe9dd'; x.fillRect(ox + L.W * s / 2 - tw / 2, yM - 9 * dpr, tw, 18 * dpr); x.fillStyle = '#3a3a44'; x.fillText(tB, ox + L.W * s / 2, yM);
    const xM = ox + (L.W + B) * s + 16 * dpr; pf(xM, oy, xM, oy + L.H * s); pf(xM - 5 * dpr, oy, xM + 5 * dpr, oy); pf(xM - 5 * dpr, oy + L.H * s, xM + 5 * dpr, oy + L.H * s);
    x.save(); x.translate(xM, oy + L.H * s / 2); x.rotate(-Math.PI / 2); const tH = (L.H / 10) + ' cm', th = x.measureText(tH).width + 12 * dpr; x.fillStyle = '#efe9dd'; x.fillRect(-th / 2, -9 * dpr, th, 18 * dpr); x.fillStyle = '#3a3a44'; x.fillText(tH, 0, 0); x.restore();
    x.textAlign = 'left'; x.textBaseline = 'alphabetic'; x.font = `600 ${11 * dpr}px ${FAM.t}`; x.fillStyle = '#5b5b66';
    const fz = [`Endformat ${F ? F.t : ''}`, 'Beschnitt 2 cm je Seite', o.raster ? 'gestrichelt: Sicherheitsabstand' : ''].filter(Boolean);
    while(fz.length > 1 && x.measureText(fz.join(' · ')).width > Wc - 24 * dpr) fz.pop();
    x.fillText(fz.join(' · '), 12 * dpr, Hc - 10 * dpr);
  }

  /* ---------- Platzszene: Bandenreihe am Spielfeldrand, Tageslicht ---------- */
  // o: { haupt:{L,res}, nachbarn:[{L,res}] (optional), unscharf:true }. Gibt die Kamera zurück (für Tests).
  // o.nachbarFest (0.99.24): die wirklichen Nachbarn je Platz neben der eigenen Bande, { '-1':{L,res}, '1':{frei:true,nr:7}, '2':false … }.
  //   {L,res} = Bande, {frei,nr} = freier Platz mit Nummer, null = neutrale Bande, false = hier endet die Reihe.
  function szene(cv, o){
    const dpr = Math.min(2, window.devicePixelRatio || 1), r = cv.getBoundingClientRect();
    const Wc = Math.max(10, Math.round(r.width * dpr)), Hc = Math.max(10, Math.round(r.height * dpr)); cv.width = Wc; cv.height = Hc;
    const x = cv.getContext('2d'), L = o.haupt.L, wB = L.W / 1000, hB = L.H / 1000, lift = L.H > 900 ? .25 : .07, luecke = .07;
    // Kamera: schräg vor der Bandenreihe, Augenhöhe, Blick auf die Mitte der Bande
    const yaw = .44, d = Math.max(3.4, wB * 1.08 + .9), P = [-Math.sin(yaw) * d, 1.25, -Math.cos(yaw) * d], T = [wB * .02, lift + hB * .5, 0];
    const sub = (a, b) => [a[0] - b[0], a[1] - b[1], a[2] - b[2]], dot = (a, b) => a[0] * b[0] + a[1] * b[1] + a[2] * b[2], norm = a => { const l = Math.hypot(...a); return a.map(v => v / l); };
    const cross = (a, b) => [a[1] * b[2] - a[2] * b[1], a[2] * b[0] - a[0] * b[2], a[0] * b[1] - a[1] * b[0]];
    const f = norm(sub(T, P)), ri = norm(cross([0, 1, 0], f)), up = cross(f, ri);
    const cam = Q => { const v = sub(Q, P); return [dot(v, ri), dot(v, up), dot(v, f)]; };
    const schmal = Wc / Hc < 1.25; let foc = 1; const cx = Wc * .5, cy = Hc * (schmal ? .53 : .57);
    { const a = cam([-wB / 2, lift, 0]), b = cam([wB / 2, lift, 0]); const span = Math.abs(b[0] / b[2] - a[0] / a[2]); foc = Wc * (schmal ? .9 : .64) / span; }
    const pr = Q => { const c = cam(Q); return [cx + foc * c[0] / c[2], cy - foc * c[1] / c[2], c[2]]; };
    const NAH = .25;
    // Polygon am Boden zeichnen, vorher an der Nahebene abschneiden
    const poly = (pts, fill) => { let C = pts.map(cam), out = [];
      for(let i = 0; i < C.length; i++){ const a = C[i], b = C[(i + 1) % C.length], ia = a[2] > NAH, ib = b[2] > NAH; if(ia) out.push(a);
        if(ia !== ib){ const t = (NAH - a[2]) / (b[2] - a[2]); out.push([a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t, NAH]); } }
      if(out.length < 3) return; x.beginPath(); out.forEach((c, i) => { const sx = cx + foc * c[0] / c[2], sy = cy - foc * c[1] / c[2]; i ? x.lineTo(sx, sy) : x.moveTo(sx, sy); }); x.closePath(); x.fillStyle = fill; x.fill(); };
    const horizont = cy - foc * dot(norm([f[0], 0, f[2]]), up) / dot(norm([f[0], 0, f[2]]), f);
    let seed = 7; const zuf = () => { seed = (seed * 16807) % 2147483647; return seed / 2147483647; };
    // Himmel
    x.setTransform(1, 0, 0, 1, 0, 0); x.fillStyle = '#86a05e'; x.fillRect(0, 0, Wc, Hc);   // nichts vom letzten Bild darf stehen bleiben
    let g = x.createLinearGradient(0, 0, 0, horizont); g.addColorStop(0, '#8fbfe2'); g.addColorStop(.7, '#cfe3f0'); g.addColorStop(1, '#eef3f3'); x.fillStyle = g; x.fillRect(0, 0, Wc, horizont + 2);
    x.save(); x.globalAlpha = .55; x.fillStyle = '#ffffff'; for(let i = 0; i < 6; i++){ const wx = zuf() * Wc, wy = horizont * (.12 + zuf() * .45), rw = Wc * (.08 + zuf() * .1);
      for(let k = 0; k < 5; k++){ x.beginPath(); x.ellipse(wx + (k - 2) * rw * .35, wy + Math.sin(k) * rw * .05, rw * (.32 + zuf() * .2), rw * (.12 + zuf() * .06), 0, 0, Math.PI * 2); x.fill(); } } x.restore();
    // Odenwald: zwei Hügelketten am Horizont
    [['#b4c7c0', .12, 0], ['#9bb3a6', .07, 1.3]].forEach(([farbe, hoch, ph]) => { x.fillStyle = farbe; x.beginPath(); x.moveTo(0, horizont + 2);
      for(let i = 0; i <= 80; i++){ const t = i / 80; x.lineTo(t * Wc, horizont - Hc * hoch * (.62 + .25 * Math.sin(t * 5.1 + ph) + .13 * Math.sin(t * 11.3 + ph * 2))); }
      x.lineTo(Wc, horizont + 2); x.closePath(); x.fill(); });
    // Gelände hinter den Banden und Baumreihe
    poly([[-80, 0, .2], [120, 0, .2], [120, 0, 60], [-80, 0, 60]], '#7a9a57');
    // Baumreihe weit hinter dem Platz: viele überlappende Kronen, kurze Stämme
    const baeume = []; for(let i = 0; i < 130; i++) baeume.push({ bx:-90 + i * 2.1 + zuf() * 1.6, bz:72 + zuf() * 18, bh:3.2 + zuf() * 2.4, br:2.2 + zuf() * 1.3, gr:['#7d9d70', '#728f66', '#86a479', '#6c8a60', '#8aa87e'][i % 5] });
    baeume.sort((a, b) => b.bz - a.bz).forEach(t => { const fu = pr([t.bx, 0, t.bz]), ko = pr([t.bx, t.bh, t.bz]), rr = foc * t.br / Math.max(.1, fu[2]); if(fu[2] < NAH || fu[0] < -rr * 2 || fu[0] > Wc + rr * 2) return;
      x.fillStyle = '#4e5a40'; x.fillRect(fu[0] - rr * .07, ko[1], rr * .14, fu[1] - ko[1]);
      x.fillStyle = t.gr; [[0, 0, 1, 1.15], [-.55, .35, .7, .75], [.6, .3, .7, .8]].forEach(([dx, dy, a, b]) => { x.beginPath(); x.ellipse(ko[0] + dx * rr, ko[1] + dy * rr, rr * a, rr * b, 0, 0, Math.PI * 2); x.fill(); });
      x.fillStyle = 'rgba(255,248,220,.08)'; x.beginPath(); x.ellipse(ko[0] - rr * .35, ko[1] - rr * .3, rr * .5, rr * .55, 0, 0, Math.PI * 2); x.fill(); });
    g = x.createLinearGradient(0, horizont - Hc * .2, 0, horizont + Hc * .03); g.addColorStop(0, 'rgba(232,240,242,0)'); g.addColorStop(1, 'rgba(232,240,242,.45)'); x.fillStyle = g; x.fillRect(0, horizont - Hc * .2, Wc, Hc * .23);   // Dunst
    // Weg hinter den Banden und eine Hecke, damit die Fläche nicht leer wirkt
    poly([[-80, 0, .9], [120, 0, .9], [120, 0, 2.6], [-80, 0, 2.6]], '#c9c0a8');
    poly([[-80, 0, 2.6], [120, 0, 2.6], [120, 0, 3.1], [-80, 0, 3.1]], 'rgba(90,110,60,.35)');
    { const hz = 15, hh = 1.1, A = pr([-12, 0, hz]), Bp = pr([90, 0, hz]), A2 = pr([-12, hh, hz]), B2 = pr([90, hh, hz]);
      if(A[2] > NAH && Bp[2] > NAH){ x.fillStyle = "#5a7d47"; x.beginPath(); x.moveTo(A[0], A[1]); x.lineTo(Bp[0], Bp[1]); x.lineTo(B2[0], B2[1]); x.lineTo(A2[0], A2[1]); x.closePath(); x.fill();
        x.fillStyle = "#66894f"; for(let i = 0; i < 120; i++){ const hx = -12 + i * .85, q = pr([hx, hh * (.85 + zuf() * .2), hz]); if(q[2] < NAH || q[0] < -40 || q[0] > Wc + 40) continue; const rr = foc * (.32 + zuf() * .18) / q[2]; x.beginPath(); x.ellipse(q[0], q[1], rr, rr * .8, 0, 0, Math.PI * 2); x.fill(); } } }
    // Spielfeld vor den Banden: Grundfarbe, Mähstreifen, Seitenlinie
    poly([[-80, 0, -60], [120, 0, -60], [120, 0, 0], [-80, 0, 0]], '#5c9443');
    for(let i = -16; i < 24; i += 2) poly([[i * 5, 0, -60], [i * 5 + 5, 0, -60], [i * 5 + 5, 0, 0], [i * 5, 0, 0]], 'rgba(255,255,255,.055)');
    poly([[-80, 0, -1.9], [120, 0, -1.9], [120, 0, -1.78], [-80, 0, -1.78]], 'rgba(250,250,245,.9)');
    poly([[-80, 0, -.02], [120, 0, -.02], [120, 0, .25], [-80, 0, .25]], '#6c8a4c');
    // Banden: Haupt in der Mitte, links eine, rechts mehrere Nachbarn (gleiches Format, Einheitslook)
    const nb = o.nachbarn || [], reihe = [];
    const nLinks = 2, nRechts = Math.max(4, Math.ceil(26 / (wB + luecke)));
    const fest = o.nachbarFest || null;
    for(let i = -nLinks; i <= nRechts; i++){ const x0 = -wB / 2 + i * (wB + luecke); if(fest && i !== 0 && fest[i] === false) continue;
      reihe.push({ i, x0, x1:x0 + wB, haupt:i === 0, q:i === 0 ? o.haupt : fest ? (fest[i] || null) : nb.length ? nb[(i + nLinks + nb.length * 4) % nb.length] : null }); }
    reihe.sort((a, b) => cam([b.x0 + wB / 2, 0, 0])[2] - cam([a.x0 + wB / 2, 0, 0])[2]);
    const tex = new Map(), texFuer = (q, ppm, unscharf) => { const k = q; if(tex.has(k)) return tex.get(k);
      let c; if(q){ c = bild(q.L, q.res, ppm, false); if(unscharf && 'filter' in x){ const u = document.createElement('canvas'); u.width = c.width; u.height = c.height; const ux = u.getContext('2d'); ux.filter = `blur(${Math.max(1, c.width / 520)}px)`; ux.drawImage(c, 0, 0); c = u; } }
      else c = platzhalter(L, ppm); tex.set(k, c); return c; };
    // freier Platz: leere Tafel mit Nummer, damit man sieht, was neben der eigenen Bande noch zu haben ist
    const texFrei = (q, ppm) => { const k = 'frei:' + q.nr + ':' + (q.frei ? 1 : 0); if(tex.has(k)) return tex.get(k); const c = freiTafel(L, ppm, q); tex.set(k, c); return c; };
    let hauptBox = null;
    reihe.forEach(b => {
      const a0 = cam([b.x0, 0, 0]), a1 = cam([b.x1, 0, 0]); if(a0[2] < NAH && a1[2] < NAH) return;
      // Kontaktschatten auf dem Rasen (Sonne von links hinten)
      poly([[b.x0 - .05, 0, -.02], [b.x1 + .05, 0, -.02], [b.x1 + .25, 0, -.42], [b.x0 + .1, 0, -.42]], 'rgba(28,46,20,.2)');
      poly([[b.x0, 0, -.01], [b.x1, 0, -.01], [b.x1, 0, -.12], [b.x0, 0, -.12]], 'rgba(20,32,14,.22)');
      // Pfosten unter der Platte
      [b.x0 + wB * .08, b.x1 - wB * .08].forEach(px => { const u = pr([px, 0, .02]), v = pr([px, lift + .02, .02]); x.strokeStyle = '#4b4f55'; x.lineWidth = Math.max(1, foc * .035 / u[2]); x.beginPath(); x.moveTo(u[0], u[1]); x.lineTo(v[0], v[1]); x.stroke(); });
      const breitPx = Math.abs(pr([b.x1, lift, 0])[0] - pr([b.x0, lift, 0])[0]);
      const ppm = b.haupt ? Math.min(1.2, Math.max(.25, breitPx * 1.4 / L.W)) : Math.min(.35, Math.max(.08, breitPx * 1.2 / L.W));
      const t = b.q && !b.q.L ? texFrei(b.q, ppm) : texFuer(b.q, ppm, !b.haupt && o.unscharf !== false);
      // Perspektivisch in senkrechten Streifen
      const n = Math.max(8, Math.ceil(breitPx / (2 * dpr)));
      for(let k = 0; k < n; k++){ const u0 = k / n, u1 = (k + 1) / n, X0 = b.x0 + u0 * wB, X1 = b.x0 + u1 * wB;
        const p0 = pr([X0, lift + hB, 0]), p1 = pr([X1, lift + hB, 0]), q0 = pr([X0, lift, 0]); if(p0[2] < NAH || p1[2] < NAH) continue;
        const sx = u0 * t.width, sw = Math.max(1, (u1 - u0) * t.width), dw = p1[0] - p0[0] + .6;
        x.drawImage(t, sx, 0, sw, t.height, p0[0], p0[1], dw, q0[1] - p0[1]); }
      const ol = pr([b.x0, lift + hB, 0]), or = pr([b.x1, lift + hB, 0]), ul = pr([b.x0, lift, 0]), ur = pr([b.x1, lift, 0]);
      // Licht: links etwas heller, Dunst nach hinten, feine Oberkante
      x.save(); x.beginPath(); x.moveTo(ol[0], ol[1]); x.lineTo(or[0], or[1]); x.lineTo(ur[0], ur[1]); x.lineTo(ul[0], ul[1]); x.closePath(); x.clip();
      g = x.createLinearGradient(ol[0], 0, or[0], 0); g.addColorStop(0, 'rgba(255,250,235,.06)'); g.addColorStop(1, 'rgba(30,40,60,.045)'); x.fillStyle = g; x.fillRect(Math.min(ol[0], ul[0]) - 2, Math.min(ol[1], or[1]) - 2, Math.abs(or[0] - ol[0]) + 4, Math.max(ul[1], ur[1]) - Math.min(ol[1], or[1]) + 4);
      const dist = cam([b.x0 + wB / 2, 0, 0])[2], dunst = Math.min(.32, Math.max(0, (dist - d) / 60));
      if(dunst > 0){ x.fillStyle = `rgba(226,236,240,${dunst})`; x.fillRect(Math.min(ol[0], ul[0]) - 2, Math.min(ol[1], or[1]) - 2, Math.abs(or[0] - ol[0]) + 4, Math.max(ul[1], ur[1]) - Math.min(ol[1], or[1]) + 4); }
      x.restore();
      x.strokeStyle = 'rgba(255,255,255,.55)'; x.lineWidth = Math.max(1, dpr * .8); x.beginPath(); x.moveTo(ol[0], ol[1]); x.lineTo(or[0], or[1]); x.stroke();
      x.strokeStyle = 'rgba(0,0,0,.18)'; x.beginPath(); x.moveTo(ul[0], ul[1]); x.lineTo(ur[0], ur[1]); x.stroke();
      if(b.haupt) hauptBox = { x:Math.min(ol[0], ul[0]) / dpr, y:Math.min(ol[1], or[1]) / dpr, w:(Math.max(or[0], ur[0]) - Math.min(ol[0], ul[0])) / dpr, h:(Math.max(ul[1], ur[1]) - Math.min(ol[1], or[1])) / dpr };
    });
    // leichte Vignette, damit der Blick auf der Bande bleibt
    g = x.createRadialGradient(Wc * .5, Hc * .55, Math.min(Wc, Hc) * .35, Wc * .5, Hc * .55, Math.max(Wc, Hc) * .75); g.addColorStop(0, 'rgba(0,0,0,0)'); g.addColorStop(1, 'rgba(10,20,30,.16)'); x.fillStyle = g; x.fillRect(0, 0, Wc, Hc);
    return { hauptBox, horizont:horizont / dpr };
  }
  // Freier oder namenloser Platz neben der eigenen Bande: helle Tafel mit der laufenden Nummer und „frei“
  function freiTafel(L, ppm, q){
    const c = document.createElement('canvas'); c.width = Math.max(4, Math.round(L.W * ppm)); c.height = Math.max(2, Math.round(L.H * ppm)); const x = c.getContext('2d'); x.scale(ppm, ppm);
    const H = L.H, W = L.W, m = H * .09; x.fillStyle = q.frei ? '#f6f3ec' : '#fff'; x.fillRect(0, 0, W, H);
    x.strokeStyle = 'rgba(29,39,96,.55)'; x.lineWidth = H * .022; x.setLineDash([H * .12, H * .08]); x.strokeRect(m, m, W - 2 * m, H - 2 * m); x.setLineDash([]);
    x.fillStyle = 'rgba(29,39,96,.8)'; x.textAlign = 'center'; x.textBaseline = 'middle'; x.font = `700 ${Math.round(H * .34)}px BandeT,Barlow,sans-serif`;
    x.fillText(q.frei ? `Bande ${q.nr} · frei` : `Bande ${q.nr}`, W / 2, H / 2, W - 4 * m);
    return c;
  }
  // Nachbarbande ohne Daten: Einheitslook mit ruhigen Formen statt fremder Namen
  function platzhalter(L, ppm){
    const c = document.createElement('canvas'); c.width = Math.max(4, Math.round(L.W * ppm)); c.height = Math.max(2, Math.round(L.H * ppm)); const x = c.getContext('2d'); x.scale(ppm, ppm);
    const H = L.H, W = L.W, band = H * .19, m = H * .075; x.fillStyle = '#fff'; x.fillRect(0, 0, W, H); x.fillStyle = C.marine; x.fillRect(0, H - band, W, band);
    const aw = Math.min(720, Math.max(460, W * .2)); x.fillStyle = 'rgba(29,39,96,.85)'; x.fillRect(W - m - aw * .75, H * .2, aw * .5, H * .26); x.fillStyle = 'rgba(232,116,31,.8)'; x.fillRect(W - m - aw * .7, H * .62, aw * .4, H * .02);
    x.fillStyle = 'rgba(28,28,34,.72)'; x.beginPath(); x.ellipse(m + H * .28, H * .37, H * .22, H * .22, 0, 0, Math.PI * 2); x.fill();
    x.fillRect(m + H * .65, H * .24, (W - aw - m * 3 - H * .65) * .7, H * .15); x.fillStyle = 'rgba(28,28,34,.35)'; x.fillRect(m + H * .65, H * .47, (W - aw - m * 3 - H * .65) * .5, H * .07);
    x.fillStyle = 'rgba(255,255,255,.7)'; x.fillRect(m, H - band * .62, W * .3, band * .24);
    if('filter' in x){ const u = document.createElement('canvas'); u.width = c.width; u.height = c.height; const ux = u.getContext('2d'); ux.filter = `blur(${Math.max(1, c.width / 300)}px)`; ux.drawImage(c, 0, 0); return u; }
    return c;
  }

  /* ---------- Druckdaten ---------- */
  const dateiName = (L, spec, endung) => 'bande-' + (sauber(spec.firma || spec.name || 'partner').toLowerCase().replace(/ä/g, 'ae').replace(/ö/g, 'oe').replace(/ü/g, 'ue').replace(/ß/g, 'ss').replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '') || 'partner') + '-' + L.format + '.' + endung;
  // PDF in Originalgröße: Seite = Endformat + 2 × 2 cm Beschnitt + 2 × 1,2 cm für die Schnittmarken.
  // TrimBox = Endformat, BleedBox = mit Beschnitt. Über 5 m Seitenlänge mit UserUnit 2 (PDF erlaubt höchstens 5,08 m je Einheit).
  async function pdf(L, res, spec, o){
    o = o || {}; const J = (window.jspdf && window.jspdf.jsPDF) || window.jsPDF; if(!J) throw new Error('Das PDF-Werkzeug fehlt.');
    const B = L.B, M = 12, pw = L.W + 2 * B + 2 * M, ph = L.H + 2 * B + 2 * M, uu = Math.max(pw, ph) / 25.4 * 72 > 14400 ? 2 : 1, dpi = o.dpi || 100, ppm = dpi / 25.4;
    const doc = new J({ orientation:pw >= ph ? 'l' : 'p', unit:'mm', format:[pw / uu, ph / uu], userUnit:uu, compress:true });
    doc.setProperties({ title:'Bande ' + sauber(spec.firma || spec.name) + ' ' + (FORMATE[L.format] || {}).t, subject:'Druckdaten Bande, SV/BSC Mörlenbach', creator:'Sportzentrale SV/BSC Mörlenbach' });
    const gw = Math.round((L.W + 2 * B) * ppm), gh = Math.round((L.H + 2 * B) * ppm), T = 2048;
    for(let k = 0; k * T < gw; k++){ const tw = Math.min(T, gw - k * T), c = document.createElement('canvas'); c.width = tw; c.height = gh;
      const x = c.getContext('2d'); x.setTransform(ppm, 0, 0, ppm, B * ppm - k * T, B * ppm); malen(x, L, res);
      doc.addImage(c.toDataURL('image/jpeg', .93), 'JPEG', (M + k * T / ppm) / uu, M / uu, (tw / ppm) / uu, (gh / ppm) / uu, 'k' + k, 'FAST');
      c.width = c.height = 1; if(o.fortschritt) o.fortschritt((k + 1) * T / gw); await new Promise(z => setTimeout(z, 0)); }
    // Schnittmarken (außerhalb des Beschnitts) und Angaben im Rand
    doc.setDrawColor(0, 0, 0); doc.setLineWidth(.25 / uu);
    const tx = [M + B, M + B + L.W], ty = [M + B, M + B + L.H];
    tx.forEach(xx => ty.forEach(yy => { const sx = xx < pw / 2 ? -1 : 1, sy = yy < ph / 2 ? -1 : 1;
      doc.line((xx + sx * (B + 1)) / uu, yy / uu, (xx + sx * (B + M - 1)) / uu, yy / uu); doc.line(xx / uu, (yy + sy * (B + 1)) / uu, xx / uu, (yy + sy * (B + M - 1)) / uu); }));
    doc.setFont('helvetica', 'normal'); doc.setFontSize(9 / uu); doc.setTextColor(60, 60, 68);
    doc.text(`SV/BSC Mörlenbach · Bande ${sauber(spec.firma || spec.name)} · Endformat ${(FORMATE[L.format] || {}).t} · Beschnitt 2 cm je Seite · ${dpi} dpi bei 1:1 · RGB · Marine Pantone 2758 C, Orange Pantone 158 C`, (M + B) / uu, (M * .55) / uu);
    const k = 72 / 25.4 / uu, pc = doc.internal.getCurrentPageInfo().pageContext;
    pc.trimBox = { bottomLeftX:(M + B) * k, bottomLeftY:(M + B) * k, topRightX:(M + B + L.W) * k, topRightY:(M + B + L.H) * k };
    pc.bleedBox = { bottomLeftX:M * k, bottomLeftY:M * k, topRightX:(M + 2 * B + L.W) * k, topRightY:(M + 2 * B + L.H) * k };
    return { blob:doc.output('blob'), name:dateiName(L, spec, 'pdf'), seite:{ breite:pw, hoehe:ph, userUnit:uu } };
  }
  // PNG mit Beschnitt; die Auflösung bleibt unter 16 Mio. Pixeln (auch für iPhone), höchstens 100 dpi
  function png(L, res, spec){
    const B = L.B, ppm = Math.min(100 / 25.4, Math.sqrt(15.5e6 / ((L.W + 2 * B) * (L.H + 2 * B)))), c = bild(L, res, ppm, true);
    return new Promise(ok => c.toBlob(b => ok({ blob:b, name:dateiName(L, spec, 'png'), breite:c.width, hoehe:c.height, dpi:Math.round(ppm * 25.4) }), 'image/png'));
  }
  // SVG: Flächen und Schrift als Vektor, Schriften eingebettet, Logo und Doppel-Logo als Bild
  const fontCache = new Map();
