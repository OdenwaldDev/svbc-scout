}
function bcLoeschenDialog(id){
  const e = (BC.d.entwuerfe || []).find(x => x.id === id); if(!e) return;
  const M = svModal(`<div class="mhead"><div><h2 style="margin:0">Bande löschen?</h2><div class="msub">${bcE(e.firma)} · ${bcE(BC_STATUS[e.status])}</div></div></div><p class="note">Der Entwurf ist danach weg. Ein reservierter Platz bleibt reserviert.</p>
    <div class="pz-tc-dlgk"><button type="button" class="btn" id="bcDlgOk">Löschen</button><button type="button" class="btn ghost" id="bcDlgNein">Abbrechen</button></div>`);
  M.querySelector('#bcDlgNein').onclick = () => closeOverlay();
  M.querySelector('#bcDlgOk').onclick = () => paEinmal(M.querySelector('#bcDlgOk'), async () => {
    try{ await bcRpc('banden_entwurf_loeschen', { p_id:id }); if(BC.entwurf === id) BC.entwurf = null; closeOverlay(); await bcLaden(true); bcListe(); kToast('Gelöscht.'); }catch(x){ kToast(x.message); } }, 'Einen Moment …');
}

/* ---------- Bandenplan ---------- */
function bcPlan(I){
  const d = BC.d, admin = !!d.admin, P = d.plaetze || [], z = st => P.filter(p => p.status === st).length;
  I.innerHTML = `<div class="pz-bc-plan">
    ${bpPlanHtml()}
    ${(d.bereiche || []).map(b => { const L = P.filter(p => p.bereich === b.key);
      return `<section class="pz-tc-block" aria-label="${bcE(b.titel)}"><div class="pz-tc-bk"><h3>${bcE(b.titel)}</h3>${admin ? `<button type="button" class="pz-tc-k leise" data-bcplneu="${b.key}">${SVI('plus')} Platz</button>` : ''}</div>
        ${b.hinweis ? `<p class="pz-tc-tipp pz-bc-bh">${bcE(b.hinweis)}</p>` : ''}<div class="pz-tc-liste">${L.map(p => bcPlatzZeile(p, admin)).join('') || '<p class="pz-tc-tipp">Hier ist noch kein Platz angelegt.</p>'}</div></section>`; }).join('')}</div>`;
  void z; bpPlanBinden(I);
  I.querySelectorAll('[data-bcres]').forEach(b => b.onclick = () => bcPlatzDialog(b.dataset.bcres, 'reserviert'));
  I.querySelectorAll('[data-bcfest]').forEach(b => b.onclick = () => bcPlatzDialog(b.dataset.bcfest, 'belegt'));
  I.querySelectorAll('[data-bcfrei]').forEach(b => b.onclick = () => bcFreigebenDialog(b.dataset.bcfrei));
  I.querySelectorAll('[data-bcgest]').forEach(b => b.onclick = () => { const p = bcPlatz(b.dataset.bcgest); if(!p) return; BC.platz = p.id; BC.spec.format = p.format;
    if(p.firma){ const f = bcFirmen().find(x => x.firma.toLowerCase() === p.firma.toLowerCase()); if(f) bcFirmaWaehlen(f.key); else bcFirmaLeer(bpFirma(p.firma)); }
    BC.ansicht = 'gestalten'; BC.sicht = 'platz'; BP.sel = p.id; bcAnsichtZeigen(); kToast(`${bcPlatzName(p)}: so sieht es dort aus. Links und rechts stehen die Nachbarn.`); });
  I.querySelectorAll('[data-bcplneu]').forEach(b => b.onclick = () => bcPlatzNeuDialog(b.dataset.bcplneu));
  I.querySelectorAll('[data-bcplweg]').forEach(b => b.onclick = () => bcPlatzWegDialog(b.dataset.bcplweg));
}
function bcPlatzZeile(p, admin){
  let st, akt = '';
  if(p.status === 'belegt'){ st = `<span class="st belegt">${SVI('lock')}Belegt: ${bcE(p.firma)}</span>`; akt = `<button type="button" class="pz-tc-k leise" data-bcgest="${p.id}">Neue Bande für diesen Platz</button>` + (admin ? `<button type="button" class="pz-tc-k" data-bcfrei="${p.id}">Freigeben</button>` : ''); }
  else if(p.status === 'reserviert'){ st = `<span class="st res">Reserviert für ${bcE(p.firma)}</span>`; akt = `<button type="button" class="pz-tc-k" data-bcfest="${p.id}">Fest vergeben</button><button type="button" class="pz-tc-k leise" data-bcfrei="${p.id}">Lösen</button><button type="button" class="pz-tc-k leise" data-bcgest="${p.id}">Bande gestalten</button>`; }
  else { st = '<span class="st frei">Frei</span>'; akt = `<button type="button" class="pz-tc-k" data-bcres="${p.id}">Reservieren</button><button type="button" class="pz-tc-k leise" data-bcgest="${p.id}">Bande gestalten</button>${admin ? `<button type="button" class="pz-tc-k leise" data-bcplweg="${p.id}">Entfernen</button>` : ''}`; }
  return `<div class="pz-tc-pl ${p.status}" data-bcpl="${p.id}"><div class="pz-bc-pk">${p.bild ? `<img src="${bcE(p.bild)}" alt="">` : ''}<div><b>${p.nummer != null ? 'Bande ' + p.nummer : 'Platz ' + p.nr} · ${bcE(+p.laenge_cm > 0 ? (p.laenge_cm / 100).toFixed(2).replace('.', ',') + ' × 0,80 m' : bcFormatT(p.format))}</b>${st}${p.hinweis ? `<span class="pz-bc-meta">${bcE(p.hinweis)}</span>` : ''}</div></div>${akt ? `<div class="pz-tc-akt">${akt}</div>` : ''}</div>`;
}
// Die Draufsicht steht seit 0.99.24 in svm101.js (bpSvg): Stadionplan im Maßstab des Luftbilds mit laufenden Nummern.
function bcPlatzDialog(id, status){
  const p = bcPlatz(id); if(!p) return; const fest = status === 'belegt', vor = p.firma || BC.spec.firma || '';
  const M = svModal(`<div class="mhead"><div><h2 style="margin:0">${fest ? 'Platz fest vergeben' : 'Platz reservieren'}</h2><div class="msub">${bcE(bcPlatzName(p))} · ${bcE(bcFormatT(p.format))}</div></div></div>
    <label class="pz-tc-dlgf"><span>Für welche Firma?</span><input type="text" id="bcDlgFirma" maxlength="120" value="${bcE(vor)}" autocomplete="organization"></label>
    <p class="note">${fest ? 'Danach ist der Platz gesperrt. Freigeben kann ihn nur ein Admin.' : 'Der Platz bleibt für das Angebot vorgemerkt. Andere sehen ihn als reserviert und können ihn nicht belegen.'}</p>
    <div class="pz-tc-dlgk"><button type="button" class="btn" id="bcDlgOk">${fest ? 'Fest vergeben' : 'Reservieren'}</button><button type="button" class="btn ghost" id="bcDlgNein">Abbrechen</button></div>`);
  const inp = M.querySelector('#bcDlgFirma'); setTimeout(() => { try{ inp.focus(); inp.select(); }catch(e){} }, 60);
  M.querySelector('#bcDlgNein').onclick = () => closeOverlay();
  M.querySelector('#bcDlgOk').onclick = () => paEinmal(M.querySelector('#bcDlgOk'), async () => {
    const firma = inp.value.trim(); if(!firma){ kToast('Bitte die Firma eintragen.'); inp.focus(); return; }
    try{ await bcRpc('bandenplatz_setzen', { p:{ platz:p.id, status, firma } }); closeOverlay(); await bcLaden(true); bcAnsichtZeigen();
      kToast(fest ? `${bcPlatzName(p)} ist fest vergeben an ${firma}.` : `${bcPlatzName(p)} ist reserviert für ${firma}.`); }catch(e){ kToast(e.message); } }, 'Speichert …');
}
function bcFreigebenDialog(id){
  const p = bcPlatz(id); if(!p) return; const belegt = p.status === 'belegt';
  const M = svModal(`<div class="mhead"><div><h2 style="margin:0">${belegt ? 'Platz freigeben?' : 'Reservierung lösen?'}</h2><div class="msub">${bcE(bcPlatzName(p))} · ${bcE(p.firma || '')}</div></div></div>
    <p class="note">${belegt ? `${bcE(p.firma || 'Die Firma')} verliert damit diesen Platz im Bandenplan. Die Bande am Platz und der Vertrag bleiben davon unberührt.` : 'Der Platz ist danach wieder frei.'}</p>
    <div class="pz-tc-dlgk"><button type="button" class="btn" id="bcDlgOk">${belegt ? 'Freigeben' : 'Lösen'}</button><button type="button" class="btn ghost" id="bcDlgNein">Abbrechen</button></div>`);
  M.querySelector('#bcDlgNein').onclick = () => closeOverlay();
  M.querySelector('#bcDlgOk').onclick = () => paEinmal(M.querySelector('#bcDlgOk'), async () => {
    try{ await bcRpc('bandenplatz_freigeben', { p_platz:p.id }); closeOverlay(); await bcLaden(true); bcAnsichtZeigen(); kToast(`${bcPlatzName(p)} ist wieder frei.`); }catch(e){ kToast(e.message); } }, 'Einen Moment …');
}
function bcPlatzNeuDialog(bereich){
  const M = svModal(`<div class="mhead"><div><h2 style="margin:0">Platz anlegen</h2><div class="msub">${bcE(bcBereich(bereich).titel)}</div></div></div>
    <label class="pz-tc-dlgf"><span>Format</span><select id="bcDlgFormat" class="pz-bc-dlgsel">${Object.entries(BANDE.FORMATE).map(([k, f]) => `<option value="${k}"${k === '300x80' ? ' selected' : ''}>${f.t}</option>`).join('')}</select></label>
    <div class="pz-tc-dlgk"><button type="button" class="btn" id="bcDlgOk">Anlegen</button><button type="button" class="btn ghost" id="bcDlgNein">Abbrechen</button></div>`);
  M.querySelector('#bcDlgNein').onclick = () => closeOverlay();
  M.querySelector('#bcDlgOk').onclick = () => paEinmal(M.querySelector('#bcDlgOk'), async () => {
    try{ const r = await bcRpc('bandenplatz_anlegen', { p:{ bereich, format:M.querySelector('#bcDlgFormat').value } }); closeOverlay(); await bcLaden(true); bcAnsichtZeigen(); kToast(`Platz ${r.nr} ist angelegt.`); }catch(e){ kToast(e.message); } }, 'Einen Moment …');
}
function bcPlatzWegDialog(id){
  const p = bcPlatz(id); if(!p) return;
  const M = svModal(`<div class="mhead"><div><h2 style="margin:0">Platz entfernen?</h2><div class="msub">${bcE(bcPlatzName(p))}</div></div></div><p class="note">Der Platz verschwindet aus dem Bandenplan. Gespeicherte Banden bleiben.</p>
    <div class="pz-tc-dlgk"><button type="button" class="btn" id="bcDlgOk">Entfernen</button><button type="button" class="btn ghost" id="bcDlgNein">Abbrechen</button></div>`);
  M.querySelector('#bcDlgNein').onclick = () => closeOverlay();
  M.querySelector('#bcDlgOk').onclick = () => paEinmal(M.querySelector('#bcDlgOk'), async () => {
    try{ await bcRpc('bandenplatz_entfernen', { p_platz:p.id }); closeOverlay(); await bcLaden(true); bcAnsichtZeigen(); kToast('Platz entfernt.'); }catch(e){ kToast(e.message); } }, 'Einen Moment …');
}

(function(){ try{ const s=document.createElement('style'); s.id='svm79css'; s.textContent="/* Beta 0.80 · Bandencreator: gleiche Welt wie der Trikot-Creator (Papier, Marine, Orange, Barlow Condensed), in beiden Themen gleich */\n.pz-bc-sw{padding:4px 14px 0;}\n.pz-bc-sw .pz-tc-seg{max-width:420px;}\n.pz-bc-laden{margin:14px;}\n.pz-bc-buehne{position:relative;aspect-ratio:4/3;border-radius:20px;overflow:hidden;background:#dfe7ea;box-shadow:inset 0 0 0 1px rgba(20,27,71,.08);}\n.pz-bc-buehne canvas{position:absolute;inset:0;width:100%;height:100%;display:block;}\n.pz-bc-raster{flex:none;}\n.pz-bc-raster.on{background:var(--blau);color:#fff;}\n.pz-bc-raster[hidden]{display:none;}\n.pz-bc-warn{display:block;margin-top:6px;font-size:13.5px;font-weight:600;color:#8a4a0c;}\n\n/* Vorschläge: am Handy wischen */\n.pz-bc-vor{display:flex;gap:10px;overflow-x:auto;scroll-snap-type:x mandatory;padding:2px 2px 8px;margin:0 -2px;scrollbar-width:thin;}\n.pz-bc-vk{flex:none;scroll-snap-align:start;display:flex;flex-direction:column;align-items:stretch;gap:6px;width:min(72vw,260px);min-height:44px;padding:8px;border:1.5px solid var(--linie);border-radius:14px;background:#fff;cursor:pointer;font:inherit;color:var(--ink);transition:border-color .15s,box-shadow .15s;}\n.pz-bc-vk canvas{width:100%;height:auto;display:block;border-radius:4px;box-shadow:0 0 0 1px rgba(20,27,71,.1);}\n.pz-bc-vk span{font-size:13.5px;font-weight:700;color:var(--ink2);text-align:left;}\n.pz-bc-vk.on{border-color:var(--or);box-shadow:0 0 0 3px rgba(232,116,31,.22);}\n.pz-bc-vk.on span{color:var(--ink);}\n.pz-bc-vk:focus-visible{outline:2px solid var(--or);outline-offset:2px;}\n\n/* Formular */\n.pz-bc-felder{display:grid;gap:10px;margin-top:10px;}\n.pz-bc-felder label{min-width:0;}\n.pz-bc-felder input{width:100%;min-width:0;box-sizing:border-box;}\n.pz-bc{color-scheme:light;}\n.pz-bc-schalter{display:flex;flex-wrap:wrap;gap:6px 18px;margin-top:10px;}\n.pz-bc-cb{display:inline-flex;align-items:center;gap:10px;min-height:44px;font-size:15px;font-weight:600;color:var(--ink);cursor:pointer;}\n.pz-bc-cb input{width:22px;height:22px;accent-color:var(--blau);margin:0;}\n.pz-bc-fein{display:flex;flex-wrap:wrap;align-items:center;gap:8px 12px;margin:10px 0 4px;}\n.pz-bc-fein .pz-tc-seg{flex:1 1 200px;}\n.pz-bc #bcStil[hidden]{display:none;}\n.pz-bc-farben{display:flex;flex-wrap:wrap;gap:6px;}\n.pz-bc-farben button{display:inline-flex;align-items:center;justify-content:center;gap:6px;min-width:44px;min-height:44px;padding:0 10px;border:1.5px solid var(--linie);border-radius:999px;background:#fff;cursor:pointer;font:inherit;font-size:13px;font-weight:700;color:var(--ink2);}\n.pz-bc-farben button i{width:20px;height:20px;border-radius:50%;box-shadow:inset 0 0 0 1px rgba(0,0,0,.15);}\n.pz-bc-farben button.on{border-color:var(--or);box-shadow:0 0 0 3px rgba(232,116,31,.2);}\n.pz-bc-formate{display:grid;grid-template-columns:repeat(auto-fill,minmax(96px,1fr));gap:6px;margin-top:10px;}\n.pz-bc-formate button{display:flex;flex-direction:column;align-items:flex-start;gap:2px;min-height:52px;padding:6px 10px;border:1.5px solid var(--linie);border-radius:12px;background:#fff;cursor:pointer;font:inherit;color:var(--ink);text-align:left;}\n.pz-bc-formate b{font-family:var(--c);font-weight:800;font-size:19px;line-height:1;text-transform:uppercase;color:var(--blau);}\n.pz-bc-formate span{font-size:11.5px;font-weight:600;color:var(--ink2);}\n.pz-bc-formate button.on{border-color:var(--blau);background:var(--blau);}\n.pz-bc-formate button.on b,.pz-bc-formate button.on span{color:#fff;}\n.pz-bc-formate button:focus-visible,.pz-bc-farben button:focus-visible{outline:2px solid var(--or);outline-offset:2px;}\n.pz-bc-dlgsel{min-height:48px;border:1.5px solid var(--linie,#d8d2c4);border-radius:12px;padding:0 10px;font:inherit;font-size:16px;background:#fff;color:#1c1c22;}\n\n/* Gespeicherte Banden und Plätze */\n.pz-bc-e,.pz-tc-pl{overflow:hidden;}\n.pz-bc-ek,.pz-bc-pk{display:flex;gap:12px;align-items:flex-start;padding:10px 12px;}\n.pz-bc-ek img{flex:none;width:112px;height:auto;border-radius:4px;box-shadow:0 0 0 1px rgba(20,27,71,.12);}\n.pz-bc-pk img{flex:none;width:96px;height:auto;max-height:56px;object-fit:cover;border-radius:6px;box-shadow:0 0 0 1px rgba(20,27,71,.12);}\n.pz-bc-ek > div,.pz-bc-pk > div{min-width:0;display:flex;flex-direction:column;gap:3px;}\n.pz-bc-ek b,.pz-bc-pk b{font-size:15.5px;font-weight:700;color:var(--ink);}\n.pz-bc-ek .st,.pz-bc-pk .st{display:inline-flex;align-items:center;gap:6px;font-size:13.5px;line-height:1.3;color:var(--ink2);}\n.pz-bc-ek .st svg,.pz-bc-pk .st svg{width:14px;height:14px;flex:none;}\n.pz-bc-ek .st.belegt,.pz-bc-pk .st.belegt{color:var(--blau);font-weight:600;}\n.pz-bc-pk .st.res{color:#8a4a0c;font-weight:600;}\n.pz-bc-ek .st.vor{color:var(--knopf);font-weight:700;}\n.pz-bc-ek .st.frei,.pz-bc-pk .st.frei{color:var(--gruen);font-weight:600;}\n.pz-bc-meta{font-size:12.5px;line-height:1.35;color:var(--ink2);}\n.pz-bc-plan{display:flex;flex-direction:column;gap:12px;padding:10px 14px 0;}\n.pz-bc-schema{position:relative;}\n.pz-bc-schema svg{display:block;width:100%;height:auto;max-height:340px;}\n.pz-bc-legende{display:flex;flex-wrap:wrap;gap:6px 16px;margin:8px 0 2px;font-size:13.5px;font-weight:600;color:var(--ink2);}\n.pz-bc-legende i{display:inline-block;width:18px;height:10px;border-radius:2px;margin-right:6px;vertical-align:-1px;}\n.pz-bc-legende i.frei{background:#fff;border:1.5px dashed var(--blau);}\n.pz-bc-legende i.res{background:#fbe3cf;border:1.5px solid var(--or);}\n.pz-bc-legende i.bel{background:var(--blau);}\n.pz-bc-bh{margin:0 0 8px;}\n\n@media (min-width:980px){\n  .pz-bc-sw{padding:6px 22px 0;}\n  .pz-bc-buehne{aspect-ratio:16/10;}\n  .pz-bc-plan{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));padding:10px 22px 0;align-items:start;}\n  .pz-bc-plan > section:first-child{grid-column:1 / -1;}\n  .pz-bc-felder{grid-template-columns:1fr 1fr;}\n}\n\n/* ---------- 0.99.24: Bandenplan als Stadionplan (svm101.js) ---------- */\n.bp-plan{padding:6px 2px 0;}\n.bp-plan svg{display:block;width:100%;height:auto;touch-action:manipulation;cursor:pointer;-webkit-tap-highlight-color:transparent;}\n.bp-plan .bp-t{font:700 4.2px BandeT,Barlow,sans-serif;fill:#4a4a55;}\n.bp-s rect{fill:#1d2760;stroke:#1d2760;stroke-width:.45;}\n#bpPlan .bp-s.frei rect{fill:#ffffff;stroke:#1d2760;stroke-width:.4;stroke-dasharray:1 .7;}\n.bp-s.reserviert rect{fill:#fbe3cf;stroke:#e8741f;}\n/* 0.99.25: Bandenbeitrag, nur für Admins im Plan */\n.bp-s.b-nein rect{stroke:#d92d20;stroke-width:1.25;}\n.bp-s.b-unklar rect{stroke:#e0a100;stroke-width:1.25;}\n.pz-bc-legende .bp-lb i{background:#1d2760;border:2.5px solid #d92d20;}\n.pz-bc-legende .bp-lb i.bunklar{border-color:#e0a100;}\n.bp-k .bp-bt{font-style:normal;font-size:11px;font-weight:700;line-height:1.2;padding:2px 6px;border-radius:999px;background:#fde4e1;color:#a11b12;}\n.bp-k .bp-bt.unklar{background:#fdf0c8;color:#7a5600;}\n.bp-beitrag{display:flex;align-items:center;gap:10px;margin:8px 0 0;padding:10px 12px;border-radius:12px;border:1.5px solid var(--linie);border-left:5px solid #9aa0b5;background:var(--papier);}\n.bp-beitrag.ja{border-left-color:#1f8a4c;}.bp-beitrag.nein{border-left-color:#d92d20;}.bp-beitrag.unklar{border-left-color:#e0a100;}\n.bp-beitrag > div{flex:1;min-width:0;display:flex;flex-direction:column;gap:2px;}\n.bp-beitrag b{font-size:15px;}.bp-beitrag span{font-size:13.5px;line-height:1.35;color:var(--ink);}.bp-beitrag small{font-size:12px;color:var(--ink2);}\n.bp-beitrag .pz-tc-k{flex:none;min-height:44px;}\n.bp-bwahl{display:grid;grid-template-columns:1fr 1fr;gap:8px;margin:10px 0 12px;}\n.bp-bwahl label{display:flex;align-items:center;gap:8px;min-height:48px;padding:6px 12px;border:1.5px solid var(--linie);border-radius:12px;cursor:pointer;font-weight:600;}\n.bp-bwahl label:has(input:checked){border-color:#e8741f;box-shadow:0 0 0 3px rgba(232,116,31,.18);}\n.bp-bwahl input{width:20px;height:20px;accent-color:#e8741f;}\n#bpBwNotiz{width:100%;box-sizing:border-box;font:inherit;padding:10px 12px;border-radius:10px;border:1.5px solid var(--linie);background:var(--papier);color:var(--ink);resize:vertical;}\n.bp-s.an rect{stroke:#e8741f;stroke-width:1.5;stroke-dasharray:none;}\n.bp-nrn .bp-nr{font:700 2.9px BandeT,Barlow,sans-serif;fill:#3a3a44;pointer-events:none;}\n.bp-zeig line{stroke:#e8741f;stroke-width:.9;}\n.bp-zeig circle{fill:#e8741f;stroke:#fff;stroke-width:.9;}\n.bp-zeig text{font:800 5.4px BandeT,Barlow,sans-serif;fill:#fff;pointer-events:none;}\n@media (max-width:699px){.bp-nrn{display:none;}}\n.bp-leiste{display:flex;gap:8px;overflow-x:auto;padding:12px 2px 10px;scroll-snap-type:x proximity;-webkit-overflow-scrolling:touch;overscroll-behavior-x:contain;}\n.bp-k{flex:none;width:92px;min-height:76px;display:flex;flex-direction:column;align-items:flex-start;gap:2px;padding:8px 9px;border-radius:12px;border:1.5px solid var(--linie);background:var(--papier);\n  color:var(--ink);font:inherit;text-align:left;cursor:pointer;scroll-snap-align:start;border-top:5px solid #1d2760 !important;}\n.bp-k.frei{border-top-color:#b9bdd0 !important;background:#fff;}\n.bp-k.reserviert{border-top-color:#e8741f !important;}\n.bp-k.an{border-color:#e8741f;box-shadow:0 0 0 3px rgba(232,116,31,.18);}\n.bp-k b{font-size:19px;line-height:1.05;font-weight:800;font-variant-numeric:tabular-nums;}\n.bp-k span{font-size:12.5px;line-height:1.2;display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical;overflow:hidden;overflow-wrap:anywhere;}\n.bp-k small{font-size:11.5px;color:var(--ink2);margin-top:auto;}\n.bp-k:focus-visible{outline:3px solid #e8741f;outline-offset:2px;}\n.bp-detail{margin:2px 0 10px;}\n.bp-wo{margin:0 0 8px;font-size:15px;line-height:1.4;color:var(--ink);}\n.bp-wo b{font-weight:800;margin-right:4px;}\n/* 0.99.34: Foto der gewählten Bande, groß und ohne Verzerrung. Die kleine Vorschau in der Zeile darunter entfällt hier. */\n.bp-foto{margin:0 0 10px;}\n.bp-foto img{display:block;width:100%;height:auto;max-height:260px;object-fit:contain;border-radius:8px;background:#eceae3;box-shadow:0 0 0 1px rgba(20,27,71,.12);}\n.bp-foto figcaption{margin-top:6px;font-size:13px;line-height:1.4;color:var(--ink2);}\n.bp-detail .pz-bc-pk img{display:none;}\n/* Vorschau in den Listen der Plätze: ganzes Foto statt Anschnitt */\n.pz-bc-pk img{object-fit:contain;background:#eceae3;}\n.bp-kapl{display:grid;gap:8px;}\n.bp-kz{display:grid;grid-template-columns:1fr auto;gap:2px 12px;align-items:center;padding:10px 12px;border-radius:12px;background:rgba(29,39,96,.05);}\n.bp-kz b{font-size:15px;}\n.bp-kz span{grid-column:1;font-size:13px;color:var(--ink2);}\n.bp-kz strong{grid-column:2;grid-row:1 / span 2;font-size:24px;font-weight:800;font-variant-numeric:tabular-nums;color:#1d2760;}\n.pz-bc-wo{font-size:13.5px;}\n.pz-bc-wo b{font-weight:800;}\n.pz-bc-wok{font:inherit;font-weight:700;color:#1d2760;background:none;border:0;padding:10px 4px;margin:-8px 0;text-decoration:underline;cursor:pointer;min-height:44px;}\n\n/* ---------- 0.99.25: die Reihe in 3D ---------- */\n.bp-rund{margin:12px 0 4px;border-radius:14px;overflow:hidden;background:#a9cdee;border:1.5px solid var(--linie);}\n.bp-rund canvas{display:block;width:100%;aspect-ratio:16 / 10;touch-action:pan-y;cursor:grab;-webkit-tap-highlight-color:transparent;}\n.bp-rund canvas:active{cursor:grabbing;}\n.bp-rund canvas:focus-visible{outline:3px solid #e8741f;outline-offset:-3px;}\n@media (min-width:800px){.bp-rund canvas{aspect-ratio:21 / 8;}}\n.bp-rundk{display:flex;align-items:center;gap:8px;padding:6px 8px;background:var(--papier);}\n.bp-rundk span{flex:1;min-width:0;text-align:center;font-size:14px;font-weight:700;color:var(--ink);overflow-wrap:anywhere;}\n.bp-rb{flex:none;width:48px;height:44px;border-radius:12px;border:1.5px solid var(--linie);background:#fff;color:#1d2760;display:grid;place-items:center;cursor:pointer;}\n.bp-rb svg{width:20px;height:20px;}\n.bp-rb[data-bprund=\"-1\"] svg{transform:rotate(180deg);}\n.bp-rb:focus-visible{outline:3px solid #e8741f;outline-offset:2px;}\n\n/* ---------- 0.99.27: Laufzeit, Notizen und Vorschau (nur Leitung) ---------- */\n.bp-lz{margin:8px 0 0;padding:10px 12px;border-radius:12px;border:1.5px solid var(--linie);background:var(--papier);}\n.bp-lzk{display:flex;align-items:center;justify-content:space-between;gap:10px;margin:2px 0 4px;}\n.bp-lzk + ul + .bp-lzk,.bp-lzk + p + .bp-lzk{margin-top:10px;padding-top:10px;border-top:1px solid var(--linie);}\n.bp-lzk b{font-size:15px;}.bp-lzk .pz-tc-k{min-height:44px;flex:none;}\n.bp-lz ul{margin:0;padding:0 0 0 18px;font-size:14px;line-height:1.45;color:var(--ink);}\n.bp-nl{list-style:none;margin:0;padding:0;display:flex;flex-direction:column;gap:8px;}\n.bp-nl li{padding:8px 10px;border-radius:10px;background:rgba(29,39,96,.05);display:flex;flex-direction:column;gap:3px;}\n.bp-nl span{font-size:14px;line-height:1.4;color:var(--ink);white-space:pre-wrap;overflow-wrap:anywhere;}\n.bp-nl small{font-size:12px;color:var(--ink2);display:flex;align-items:center;gap:8px;flex-wrap:wrap;}\n.bp-nw{font:inherit;font-size:12px;font-weight:600;color:#a11b12;background:none;border:0;padding:8px 6px;margin:-8px 0;cursor:pointer;text-decoration:underline;}\n.bp-lzf{display:grid;grid-template-columns:1fr 1fr;gap:10px;}\n.bp-lzf input,.bp-lzf select,#bpLzNf,#bpNoText{width:100%;box-sizing:border-box;min-height:44px;font:inherit;padding:8px 10px;border-radius:10px;border:1.5px solid var(--linie);background:var(--papier);color:var(--ink);}\n.bp-lzt{margin:12px 0 0;font-size:14px;font-weight:600;color:var(--ink);}\n.bp-bwahl.drei{grid-template-columns:repeat(3,1fr);margin:6px 0 4px;}\n.bp-lzc{display:flex;align-items:center;gap:10px;min-height:44px;margin:10px 0 4px;font-size:14px;cursor:pointer;}\n.bp-lzc input{width:22px;height:22px;accent-color:#e8741f;flex:none;}\n@media (max-width:480px){.bp-lzf{grid-template-columns:1fr;}}\n.bp-vsl{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:8px;margin:4px 0 12px;}\n.bp-vs{display:flex;flex-direction:column;gap:2px;padding:10px 12px;border-radius:12px;border:1.5px solid var(--linie);background:var(--papier);min-width:0;}\n.bp-vs b{font-size:17px;font-weight:800;font-variant-numeric:tabular-nums;}\n.bp-vs span{font-size:12.5px;line-height:1.3;color:var(--ink2);}\n.bp-vs strong{font-size:15px;margin-top:4px;font-variant-numeric:tabular-nums;}\n.bp-vs small{font-size:11.5px;color:var(--ink2);}\n.bp-vkopf,.bp-vz{display:grid;grid-template-columns:34px minmax(0,1.4fr) repeat(3,minmax(0,1fr));gap:6px;align-items:center;}\n.bp-vkopf{padding:0 8px 4px;font-size:12px;font-weight:700;color:var(--ink2);}\n.bp-vl{display:flex;flex-direction:column;gap:4px;}\n.bp-vz{width:100%;min-height:48px;padding:6px 8px;border-radius:10px;border:1px solid var(--linie);background:var(--papier);color:var(--ink);font:inherit;text-align:left;cursor:pointer;}\n.bp-vz:focus-visible{outline:3px solid #e8741f;outline-offset:2px;}\n.bp-vz b{font-size:16px;font-weight:800;font-variant-numeric:tabular-nums;}\n.bp-vz span{font-size:13.5px;line-height:1.2;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;}\n.bp-vz i{font-style:normal;font-size:11.5px;font-weight:700;line-height:1.15;padding:5px 6px;border-radius:8px;text-align:center;overflow:hidden;text-overflow:ellipsis;display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical;}\n.bp-vz i.fest{background:#1d2760;color:#fff;}\n.bp-vz i.fest.ang{background:#fff;color:#1d2760;box-shadow:inset 0 0 0 1.5px #1d2760;}\n.bp-vz i.verl{background:#dfe6fb;color:#1d2760;}\n.bp-vz i.offen{background:#fdf0c8;color:#7a5600;}\n.bp-vz i.aus{background:#fde4e1;color:#a11b12;}\n.bp-vz i.vor{background:#fbe3cf;color:#8a3c05;}\n.bp-vz i.frei,.bp-vz i.res{background:#fff;color:#4a4a55;border:1px dashed #9aa0b5;}\n@media (max-width:560px){.bp-vsl{grid-template-columns:1fr;}.bp-vkopf,.bp-vz{grid-template-columns:30px repeat(3,minmax(0,1fr));gap:5px 6px;}\n  .bp-vkopf span:nth-child(2){display:none;}.bp-vz i{font-size:11px;padding:5px 2px;}.bp-vz b{grid-row:1 / span 2;align-self:start;padding-top:2px;}.bp-vz span{grid-column:2 / -1;white-space:normal;font-weight:600;}.bp-vz{padding:8px;}}\n"; document.head.appendChild(s); }catch(e){} })();
/* =====================================================================
   Beta 0.82 · Rollen passen wieder zu den Bereichen
   1. „Was darf wer?“ wird aus den Bereichen und ihren Vorgaben gebaut (Tabelle bereiche), nicht mehr aus festem Text.
      Ändert der Admin eine Vorgabe, stimmt die Übersicht sofort.
   2. Die Rollen beschreiben, für wen sie gedacht sind (Vorstand, Kaderplaner, Trainer, Jugendtrainer, Gast).
   3. Bereiche einer Person: nach den Gruppen der Navigation sortiert, dazu „Aufgaben im Verein“
      (Partner-Team, Social Media & Presse, Veranstaltungen & Helfer, Jugendleitung, Seniorenleitung): ein Tipp setzt alle passenden Bereiche.
   4. Trikots und Bandencreator hängen am Bereich „Trikots & Banden“.
   ===================================================================== */

// Gruppen wie in der Navigation (svm77, N77_GRP)
const R80_GRUPPEN = ['Übersicht', 'Mannschaften', 'Spieltag', 'Kader & Scouting', 'Verein', 'Werkzeuge', 'Verwaltung'];
const R80_GRUPPE = { planung:'Übersicht', termine:'Übersicht', mannschaft:'Mannschaften', mannschaften:'Mannschaften', spieltag:'Spieltag', plakat:'Spieltag',
  kader:'Kader & Scouting', scouting:'Kader & Scouting', verein:'Verein', sponsoring:'Verein', foerderung:'Verein', orga:'Verein', kasse:'Verein', shop:'Verein',
  studio:'Werkzeuge', wissen:'Werkzeuge', verwaltung:'Verwaltung', finanzen:'Verein' };
function r80Gruppe(k){ return R80_GRUPPE[k] || 'Weitere'; }

// Für wen die Rolle gedacht ist, und was nicht an einem Bereich hängt
const R80_ROLLE = {
  admin:{ d:'Für die App-Verantwortlichen', yes:['Alles sehen und bearbeiten', 'Leute einladen, Rollen vergeben, sperren', 'Bereiche je Person freischalten'], no:[] },
  vorstand:{ d:'Für Vorstand und Abteilungsleitung', yes:['Leute einladen (bis Kaderplaner)', 'Kontaktdaten'], no:['Rollen ändern, sperren, löschen'] },
  planer:{ d:'Für die sportliche Leitung: Kader, Scouting, Spielbetrieb', yes:['Kandidaten und Kontakte pflegen', 'Kaderplan und Aufstellung ändern'], no:['Nutzer & Rollen'] },
  trainer:{ d:'Für Trainer und Scouts der Ersten und Zweiten', yes:['Training, Spiele, Abstimmung', 'Spieler bewerten, Eye-Test'], no:['Kontaktdaten von Kandidaten', 'Kaderplan ändern'] },
  jugend:{ d:'Für Jugendtrainer: die eigene Mannschaft', yes:['Eigene Mannschaft: Kader, Training, Spiele, Abstimmung', 'Weitere Mannschaften: unten bei „Mannschaften“ eintragen'], no:['Erste Mannschaft, Scouting, Kaderplanung'] },
  viewer:{ d:'Für Gäste: nur lesen', yes:['Ansehen, nichts ändern'], no:['Kontaktdaten und Notizen'] }
};
const R80_REIHE = ['admin', 'vorstand', 'planer', 'trainer', 'jugend', 'viewer'];
// Texte auch dort, wo SV_ROLE_INFO sonst noch steht (Einladen, Rollenwahl)
R80_REIHE.forEach(r => { if(SV_ROLE_INFO[r]) Object.assign(SV_ROLE_INFO[r], { d:R80_ROLLE[r].d }); });

let R80_B = null;   // Bereiche mit Vorgaben (für Admin und Vorstand lesbar)
async function r80Bereiche(neu){
  if(R80_B && !neu) return R80_B;
  const { data, error } = await SVB.sb.from('bereiche').select('key,titel,parent,sort,vorgabe,hinweis').order('sort');
  if(error) throw error; R80_B = data || []; return R80_B;
}
// Was eine Rolle ohne Ausnahme sieht: oberste Bereiche mit Vorgabe, Unterbereiche nur, wenn sie davon abweichen
function r80Rolle(r, L){
  const top = L.filter(b => !b.parent);
  const hat = b => r === 'admin' || (b.vorgabe || []).includes(r);
  const G = {};
  top.forEach(t => {
    const kids = L.filter(b => b.parent === t.key && !/^team:/.test(b.key));
    const an = hat(t), anKids = kids.filter(hat);
    if(!an && !anKids.length) return;
    let text = t.titel;
    if(an && kids.length && anKids.length < kids.length && t.key !== 'mannschaften'){
      const ohne = kids.filter(k => !hat(k)).map(k => k.titel);
      text += ohne.length <= 2 ? ` (ohne ${ohne.join(', ')})` : ` (${anKids.length} von ${kids.length} Teilen)`;
    } else if(!an){ text = `${t.titel}: ${anKids.map(k => k.titel).join(', ')}`; }
    (G[r80Gruppe(t.key)] = G[r80Gruppe(t.key)] || []).push(text);
  });
  return G;
}
function r80Karte(r, L){
  const R = SV_ROLE_INFO[r] || { t:r }, X = R80_ROLLE[r] || { d:'', yes:[], no:[] }, G = r80Rolle(r, L);
  const gruppen = [...R80_GRUPPEN, 'Weitere'].filter(g => G[g]);
  return `<div class="rolecard r80" data-r80="${svEsc(r)}"><span class="rolechip r-${svEsc(r)}"><i></i>${svEsc(R.t || r)}</span><h4>${svEsc(X.d)}</h4>
    ${r === 'admin' ? '<p class="r80-alles">Alle Bereiche</p>' : gruppen.length ? `<dl class="r80-dl">${gruppen.map(g => `<dt>${svEsc(g)}</dt><dd>${G[g].map(svEsc).join(' · ')}</dd>`).join('')}</dl>` : '<p class="r80-alles">Keine Bereiche ohne Freischaltung</p>'}
    <ul>${X.yes.map(x => `<li>${svEsc(x)}</li>`).join('')}${X.no.map(x => `<li class="no">${svEsc(x)}</li>`).join('')}</ul>
    ${r !== 'admin' && typeof isAdmin === 'function' && isAdmin() ? `<button type="button" class="btn ghost r80-edit" data-r80e="${svEsc(r)}">Bereiche der Rolle anpassen</button>` : r === 'admin' ? '<p class="note small">Admins haben immer alles, auch jeden neuen Bereich nach einem Update.</p>' : ''}</div>`;
}
async function r80Rollenkarten(neu){
  const P = document.getElementById('panel-admin'); const grid = P && P.querySelector('.rolegrid'); if(!grid) return;
  let L; try{ L = await r80Bereiche(neu); }catch(e){ return; }
  const rollen = R80_REIHE.filter(r => SV_ROLES.includes(r) || r === 'admin');
  grid.classList.add('r80-grid'); grid.innerHTML = rollen.map(r => r80Karte(r, L)).join('');
  grid.querySelectorAll('[data-r80e]').forEach(b => b.onclick = () => r80RolleBearbeiten(b.dataset.r80e));
  const h = grid.previousElementSibling;
  if(h && h.classList.contains('sechead') && !P.querySelector('.r80-note')){ const n = document.createElement('p'); n.className = 'note small r80-note';
    n.textContent = 'So sieht jede Rolle die Bereiche, solange du keine Ausnahme setzt. Einzelne Bereiche schaltest du pro Person mit „Bereiche“ frei, die Vorgaben änderst du unten bei „Vorgaben je Rolle“.'; h.after(n); }
}
{ const _ar = svAdminRender; svAdminRender = async function(){ const r = await _ar.apply(this, arguments); try{ await r80Rollenkarten(true); }catch(e){ console.warn('Rollen', e); } return r; }; }

/* ---------- Rolle anpassen: je Bereich und Teil ein Schalter, gilt für alle mit dieser Rolle ohne eigene Ausnahme ---------- */
async function r80RolleBearbeiten(r){
  const R = SV_ROLE_INFO[r] || { t:r };
  const M = svModal(`<div class="mhead"><div><h2 style="margin:0">Rolle ${svEsc(R.t || r)} anpassen</h2><div class="msub">Was jede Person mit dieser Rolle sieht, solange sie keine eigene Funktion oder Ausnahme hat. Änderungen gelten sofort für alle mit dieser Rolle.</div></div></div><div id="r80RB"><div class="note">Lade …</div></div>`);
  const B = M.querySelector('#r80RB');
  const zeichnen = L => {
    const top = L.filter(b => !b.parent), kids = k => L.filter(b => b.parent === k && !/^team:/.test(b.key)), hat = b => (b.vorgabe || []).includes(r);
    const sw = (b, sub) => `<div class="svr-row${sub ? ' sub' : ''}"><div class="svr-rt"><b>${svEsc(b.titel)}</b>${!sub && b.hinweis ? `<span>${svEsc(b.hinweis)}</span>` : ''}</div>
      <button type="button" class="svr-sw${hat(b) ? ' on' : ''}" role="switch" aria-checked="${hat(b)}" aria-label="${svEsc(b.titel)}" data-r80v="${svEsc(b.key)}"><i></i></button></div>`;
    const gruppen = []; top.forEach(t => { const g = r80Gruppe(t.key); let e = gruppen.find(x => x.g === g); if(!e){ e = { g, L:[] }; gruppen.push(e); } e.L.push(t); });
    B.innerHTML = `<div class="r80-rl">${gruppen.map(e => `<h4 class="svr-gh">${svEsc(e.g)}</h4>${e.L.map(t => `<div class="svr-grp">${sw(t, false)}${kids(t.key).length ? `<details class="svr-kids"><summary>Einzeln anpassen: ${kids(t.key).length} ${kids(t.key).length === 1 ? 'Teil' : 'Teile'}</summary>${kids(t.key).map(k => sw(k, true)).join('')}</details>` : ''}</div>`).join('')}`).join('')}</div>`;
    B.querySelectorAll('[data-r80v]').forEach(x => x.onclick = async () => { const b = L.find(y => y.key === x.dataset.r80v); if(!b) return;
      // Ausschalten trifft alle mit dieser Rolle: erst nach einem zweiten Tipp
      if(hat(b) && x.dataset.sure !== '1'){ B.querySelectorAll('[data-sure="1"]').forEach(y => { y.dataset.sure = ''; y.classList.remove('sure'); }); x.dataset.sure = '1'; x.classList.add('sure'); kToast('Noch mal tippen: ' + b.titel + ' für alle mit der Rolle ' + (R.t || r) + ' ausschalten'); setTimeout(() => { if(x.isConnected){ x.dataset.sure = ''; x.classList.remove('sure'); } }, 4000); return; }
      x.disabled = true;
      const neu = hat(b) ? (b.vorgabe || []).filter(y => y !== r) : [...(b.vorgabe || []), r];
      const { error } = await SVB.sb.rpc('admin_bereich_vorgabe', { p_bereich:b.key, p_rollen:neu });
      if(error){ kToast('Das hat nicht geklappt. Prüf die Verbindung und versuch es noch mal.'); x.disabled = false; return; }
      kToast('✓ ' + b.titel + (neu.includes(r) ? ' an' : ' aus') + ' für alle mit der Rolle ' + (R.t || r)); b.vorgabe = neu; const offen = [...B.querySelectorAll('details[open] summary')].map(s => s.closest('.svr-grp').querySelector('[data-r80v]').dataset.r80v);
      zeichnen(L); offen.forEach(k => { const d = B.querySelector(`[data-r80v="${k}"]`); const g = d && d.closest('.svr-grp').querySelector('details'); if(g) g.open = true; });
      r80Rollenkarten(true); if(typeof svrVorgCard === 'function') svrVorgCard(); });
  };
  try{ zeichnen(await r80Bereiche(true)); }catch(e){ B.innerHTML = '<div class="empty">Die Bereiche konnten nicht geladen werden. Prüf die Verbindung und öffne das Fenster noch mal.</div>'; }
}

/* ---------- Aufgaben im Verein: ein Tipp setzt die passenden Bereiche ---------- */
const R80_AUFGABEN = [
  { k:'partner', t:'Partner-Team', d:'Partner-Bereich mit Verträgen, Trikots und Banden, Partnermappen im Studio', b:['sponsoring', 'sponsoring:vertrag', 'sponsoring:trikots', 'studio', 'studio:partner'] },
  { k:'social', t:'Social Media & Presse', d:'Spieltagsstudio und Social Media im Studio', b:['plakat', 'studio', 'studio:social', 'studio:social_bearbeiten'] },
  { k:'orga', t:'Veranstaltungen & Helfer', d:'Veranstaltungen, Helfer, Heimspieltag, Termine für alle', b:['orga', 'termine', 'termine:bearbeiten'] },
  { k:'jugend', t:'Jugendleitung', d:'Alle Jugendteams, Planung Jugend, Jugend im Studio', b:['mannschaften:leitung_jugend', 'planung', 'planung:jugend', 'studio', 'studio:jugend', 'studio:jugend_bearbeiten'] },
  { k:'senioren', t:'Seniorenleitung', d:'Erste, Zweite und SOMA planen', b:['mannschaften:leitung_senioren', 'planung', 'planung:senioren'] }
];

/* ---------- Trikots & Banden ---------- */
{ const _sr = spoRender; spoRender = async function(){
  const weg = svDarf('sponsoring:trikots') === false;
  if(weg && ['trikots', 'bandencreator'].includes(SPO.view)) SPO.view = 'zentrale';
  const r = await _sr.apply(this, arguments);
  if(weg){ const P = spoPanel(); if(P) P.querySelectorAll('[data-spov="trikots"],[data-spov="bandencreator"]').forEach(b => b.remove()); }
  return r; }; }

/* ---------- Einladen mit Funktionen: Bereich und Funktion (Leitung, Stellvertretung, Helfer) gleich mitgeben ---------- */
const R80_STUFE_T = { leitung:'Leitung', stellv:'Stellvertretung', helfer:'Helfer' };
// Eine zusätzliche Aufgabe schaltet nur ihren Schlüssel frei. Mannschaften werden im Teamfeld vergeben.
function r80Einzelrechte(box,bereiche,wahl) {
  const el=document.createElement('details'); el.className='r80-teilwahl';
  const summary=document.createElement('summary'); el.append(summary);
  const zaehlen=()=>{summary.textContent='Einzelne Aufgaben freischalten'+(wahl.size?' ('+wahl.size+')':'');};
  zaehlen();
  const intro=document.createElement('p');intro.className='r80-invh';
  intro.textContent='Zusätzlich zur Vereinsfunktion. Wähle genau die Aufgaben, die diese Person übernehmen soll.';el.append(intro);
  for(const b of bereiche.filter(x=>!x.parent)){
    const kinder=bereiche.filter(x=>x.parent===b.key&&!x.key.startsWith('team:'));
    if(!kinder.length)continue;
    const gruppe=document.createElement('details'),titel=document.createElement('summary');
    titel.textContent=b.titel;gruppe.append(titel);
    for(const k of kinder){
      const label=document.createElement('label'),input=document.createElement('input');
      input.type='checkbox';input.checked=wahl.has(k.key);input.dataset.einzelrecht=k.key;
      input.onchange=()=>{if(input.checked)wahl.add(k.key);else wahl.delete(k.key);zaehlen();};
      const hinweis=k.key==='sponsoring:bank'?' (setzt den Partnerbereich voraus)':k.key==='sponsoring:team'?' (für Vorstand und Administration)':'';
      label.append(input,document.createTextNode(k.titel+hinweis));gruppe.append(label);
    }
    el.append(gruppe);
  }
  box.append(el);return el;
}
async function r80InvFunktionen(){
  const P = document.getElementById('panel-admin'), f = P && P.querySelector('#svInv'); if(!f || !isAdmin() || f.querySelector('.r80-invf')) return;
  // Mannschaftsfunktion nur zeigen, wenn eine Mannschaft gewählt ist, und klar benennen
  const team = f.querySelector('#svInvTeam'), funk = f.querySelector('#svInvFunk');
  if(team && funk){ const l = f.querySelector('label[for="svInvFunk"]'); if(l) l.textContent = 'Funktion in der Mannschaft';
    const zeig = () => { funk.closest('div').hidden = !team.value; }; team.addEventListener('change', zeig); zeig(); }
  let L; try{ L = await r80Bereiche(); }catch(e){ return; }
  const top = L.filter(b => !b.parent), kids = k => L.filter(b => b.parent === k && !/^team:/.test(b.key)).length, titel = k => (top.find(t => t.key === k) || {}).titel || k;
  const box = document.createElement('div'); box.className = 'r80-invf';
  const teile = new Set(), zeilen = [];   // {b: Bereich oder '', s: Stufe oder ''}
  const bereichOpts = (z, i) => `<option value="">Bereich wählen</option>` + R80_GRUPPEN.concat(['Weitere']).map(g => { const T = top.filter(t => r80Gruppe(t.key) === g && (t.key === z.b || !zeilen.some((y, k) => k !== i && y.b === t.key))); return T.length ? `<optgroup label="${svEsc(g)}">${T.map(t => `<option value="${svEsc(t.key)}"${t.key === z.b ? ' selected' : ''}>${svEsc(t.titel)}</option>`).join('')}</optgroup>` : ''; }).join('');
  const stufeOpts = z => !z.b ? `<option value="">erst Bereich wählen</option>` : !kids(z.b) && z.b !== 'finanzen' ? `<option value="leitung" selected>Zugriff</option>`
    : `<option value=""${z.s ? '' : ' selected'}>Funktion wählen</option>` + ['leitung', 'stellv', 'helfer'].map(s => `<option value="${s}"${s === z.s ? ' selected' : ''}>${R80_STUFE_T[s]}</option>`).join('');
  const zeichnen = () => {
    const rv0 = (f.querySelector('#svInvRole') || {}).value || '';
    box.innerHTML = `<label>Funktionen</label><p class="r80-invh">${rv0.startsWith('f:') ? 'Mindestens ein Bereich. Je Bereich Leitung, Stellvertretung oder Helfer.' : 'Optional. Je Bereich Leitung, Stellvertretung oder Helfer, auch mehrere Bereiche.'}</p>
      ${zeilen.length ? `<div class="r80-invl">${zeilen.map((z, i) => `<div class="r80-invz"><div class="r80-invs"><select data-r80ib="${i}" aria-label="Bereich">${bereichOpts(z, i)}</select>
        <select data-r80is="${i}" aria-label="Funktion"${z.b ? '' : ' disabled'}>${stufeOpts(z)}</select></div>
        <button type="button" class="iconbtn" data-r80ix="${i}" aria-label="Funktion entfernen" title="Entfernen">✕</button></div>`).join('')}</div>` : ''}
      <button type="button" class="btn ghost r80-invadd">${SVI('plus')} Funktion hinzufügen</button>`;
    if(rv0!=='admin')r80Einzelrechte(box,L,teile);
    box.querySelectorAll('[data-r80ib]').forEach(s => s.onchange = () => { const z = zeilen[+s.dataset.r80ib]; z.b = s.value; z.s = z.b && !kids(z.b) && z.b !== 'finanzen' ? 'leitung' : (z.b ? (z.vor || (f.querySelector('#svInvRole').value.startsWith('f:') ? f.querySelector('#svInvRole').value.slice(2) : '')) : ''); zeichnen(); const n = box.querySelector(`[data-r80is="${s.dataset.r80ib}"]`); if(n && !n.disabled && !z.s) n.focus(); });
    box.querySelectorAll('[data-r80is]').forEach(s => s.onchange = () => { zeilen[+s.dataset.r80is].s = s.value; });
    box.querySelectorAll('[data-r80ix]').forEach(b => b.onclick = () => { zeilen.splice(+b.dataset.r80ix, 1); zeichnen(); });
    box.querySelector('.r80-invadd').onclick = () => { if(zeilen.length >= top.length) return; const rv = f.querySelector('#svInvRole').value; zeilen.push({ b:'', s:'', vor:rv.startsWith('f:') ? rv.slice(2) : '' }); zeichnen(); const n = box.querySelector(`[data-r80ib="${zeilen.length - 1}"]`); if(n) n.focus(); };
  };
  zeichnen(); box._zeilen = zeilen; box._zeichnen = zeichnen; box._kids = kids;
  const anker = f.querySelector('.svr-inv') || f.querySelector('#svInvRole').closest('div'); anker.after(box);
  const go = f.onsubmit; f.onsubmit = async e => {
    const rs = f.querySelector('#svInvRole'), fr = rs && rs.value.startsWith('f:') ? rs.value : null;
    if(fr && !zeilen.some(z => z.b)){ e && e.preventDefault && e.preventDefault(); kToast(R80_FROLLE[fr] + ': bitte mindestens einen Bereich wählen.'); const n = box.querySelector('[data-r80ib]'); if(n) n.focus(); else box.querySelector('.r80-invadd').click(); return false; }
    const offen = zeilen.find(z => z.b && !z.s);
    if(offen){ e && e.preventDefault && e.preventDefault(); kToast('Wähl bei „' + titel(offen.b) + '“ noch die Funktion.'); const n = box.querySelector(`[data-r80is="${zeilen.indexOf(offen)}"]`); if(n) n.focus(); return false; }
    const fk = zeilen.filter(z => z.b && z.s).map(z => ({ b:z.b, s:z.s, t:titel(z.b) }));
    const auftrag = {funktionen:Object.fromEntries(fk.map(z=>[z.b,z.s])),teile:Object.fromEntries([...teile].map(k=>[k,true]))};
    SVR._vereinsauftrag=rs.value!=='admin'&&(fk.length||teile.size)?auftrag:null;
    if(fr){ if(![...rs.options].some(o => o.value === 'viewer')) return false; rs.value = 'viewer'; R80_FR_LETZTE = R80_FROLLE[fr]; }   // technisch Gast plus Funktionen
    try{ return await go.call(f, e); } finally { SVR._vereinsauftrag=null; R80_FR_LETZTE = null; if(fr && rs.isConnected) rs.value = fr; } };
}
{ const _ar = svAdminRender; svAdminRender = async function(){ const r = await _ar.apply(this, arguments); try{ await r80InvFunktionen(); }catch(e){ console.warn('Einladen mit Funktionen', e); } return r; }; }
{ const _adm = SVB.admin; SVB.admin = async function(action, payload){
  if(action==='invite' && SVR._vereinsauftrag){
    payload={...payload,vereinsauftrag:SVR._vereinsauftrag};SVR._vereinsauftrag=null;
  }
  return _adm.call(this,action,payload); }; }

/* ---------- Team-Liste: Funktionen je Person sichtbar, deutlicher Knopf „Bereiche & Funktionen“ ---------- */
async function r80TeamFunktionen(){
  const P = document.getElementById('panel-admin'); if(!P || !isAdmin()) return;
  let L, B; try{ const [f, b] = await Promise.all([SVB.sb.from('person_funktionen').select('user_id,bereich,stufe'), r80Bereiche()]); if(!f || f.error || !Array.isArray(f.data)) return; L = f.data; B = b || []; }catch(e){ return; }   // bei Ladefehler alles stehen lassen
  const titel = k => (B.find(b => b.key === k) || {}).titel || k, hatTeile = k => B.some(b => b.parent === k && !/^team:/.test(b.key));
  P.querySelectorAll('.urow[data-u]').forEach(row => {
    const b = row.querySelector('[data-svrb]'); if(!b) return;   // Admins haben ohnehin alles
    b.setAttribute('aria-label', 'Bereiche & Funktionen'); b.title = 'Bereiche & Funktionen';
    let d = row.querySelector(':scope > .r80-uf');
    if(!d){ d = document.createElement('div'); d.className = 'r80-uf'; row.appendChild(d); b.classList.add('r80-hid'); }
    const F = L.filter(x => x.user_id === row.dataset.u && x.stufe !== 'aus');
    d.innerHTML = F.map(x => `<span>${svEsc(titel(x.bereich))} · ${svEsc((hatTeile(x.bereich)||x.bereich==='finanzen') ? R80_STUFE_T[x.stufe] || x.stufe : 'Zugriff')}</span>`).join('')
      + `<button type="button" class="btn ghost r80-fb">${SVI('layers')}${F.length ? 'Bereiche & Funktionen' : 'Funktionen vergeben'}</button>`;
    d.querySelector('.r80-fb').onclick = () => b.click();
  });
  try{ await r80TeamFRolle(L); }catch(e){ console.warn('Funktionsrollen Liste', e); }
}
{ const _ar = svAdminRender; svAdminRender = async function(){ const r = await _ar.apply(this, arguments); try{ await r80TeamFunktionen(); }catch(e){ console.warn('Funktionen in der Team-Liste', e); } return r; }; }
// Nach dem Schließen des Bereiche-Fensters die Chips in der Liste auffrischen
{ const _sp = svrPerson; svrPerson = async function(){ const r = await _sp.apply(this, arguments);
  try{ const o = document.getElementById('overlay'); if(o && !o._r80){ o._r80 = true; new MutationObserver(() => { if(!o.classList.contains('open') && svCurTab() === 'admin'){ if(R80_NACH_DLG){ R80_NACH_DLG = false; svAdminRender(true); } else r80TeamFunktionen(); } }).observe(o, { attributes:true, attributeFilter:['class'] }); } }catch(e){}
  return r; }; }

/* ---------- 0.85 · Leitung, Stellvertretung und Helfer als Rolle wählbar ----------
   Technisch Rolle „Gast“ plus Funktion je Bereich. In der Auswahl stehen sie wie eigene Rollen,
   beim Einladen und in der Team-Liste. Die Rechte kommen nur aus den gewählten Bereichen. */
// 0.99.23: Albert nennt sie Abteilungsleiter und Stellvertreter. Technisch bleibt es Gast plus Funktion im Bereich.
const R80_FROLLE = { 'f:leitung':'Abteilungsleiter', 'f:stellv':'Stellvertreter', 'f:helfer':'Helfer im Bereich' };
const r80FOpts = cur => `<optgroup label="Funktion in Bereichen">${Object.entries(R80_FROLLE).map(([k, t]) => `<option value="${k}"${k === cur ? ' selected' : ''}>${t}</option>`).join('')}</optgroup>`;
function r80HoechsteStufe(F){ return F.some(x => x.stufe === 'leitung') ? 'f:leitung' : F.some(x => x.stufe === 'stellv') ? 'f:stellv' : F.some(x => x.stufe === 'helfer') ? 'f:helfer' : null; }
// Einladen: Funktionsrollen in der Rollenauswahl, Stufe gleich in die Funktionszeilen übernehmen
function r80InvFRolle(){
  const f = document.querySelector('#panel-admin #svInv'), rs = f && f.querySelector('#svInvRole'), box = f && f.querySelector('.r80-invf');
  if(!rs || !box || !box._zeilen || !isAdmin() || rs.querySelector('optgroup')) return;   // ohne Funktionsliste keine Funktionsrollen
  const alt = rs.innerHTML, d0 = (document.getElementById('panel-admin')._draft || {}).role; rs.innerHTML = `<optgroup label="Rolle">${alt}</optgroup>${r80FOpts()}`;
  let hint = f.querySelector('.r80-invfr'); if(!hint){ hint = document.createElement('p'); hint.className = 'r80-invfr'; hint.hidden = true; box.before(hint); }
  const sync = e => { const s = rs.value.startsWith('f:') ? rs.value.slice(2) : null; hint.hidden = !s;
    const Z = box._zeilen;
    if(s){ hint.textContent = R80_FROLLE[rs.value] + ': wähl unten mindestens einen Bereich. Dazu sieht die Person, was jeder Gast sieht.';
      Z.forEach(z => { z.vor = s; if(z.b && (kidsN(z.b)||z.b==='finanzen')) z.s = s; }); if(!Z.length) Z.push({ b:'', s:'', vor:s }); }
    box._zeichnen();
    if(s && e && e.isTrusted){ const n = box.querySelector('[data-r80ib="0"]'); if(n && !n.value) n.focus(); } };
  const kidsN = k => (box._kids ? box._kids(k) : 1);
  rs.addEventListener('change', sync);
  if(d0 && R80_FROLLE[d0]){ rs.value = d0; rs.dispatchEvent(new Event('change')); } else sync();
}
{ const _ar = svAdminRender; svAdminRender = async function(){ const r = await _ar.apply(this, arguments); try{ r80InvFRolle(); }catch(e){ console.warn('Funktionsrollen', e); } return r; }; }
// Team-Liste: Rollenauswahl je Person mit den Funktionsrollen; Gast mit Funktionen zeigt die höchste Stufe
async function r80TeamFRolle(L){
  const P = document.getElementById('panel-admin'); if(!P || !isAdmin()) return; R80_LF = L || [];
  P.querySelectorAll('select[data-role]').forEach(s => {
    const u = (SV_USERS || []).find(x => x.id === s.dataset.role); if(!u) return;
    const F = (L || []).filter(x => x.user_id === u.id && x.stufe !== 'aus'), cur = u.role === 'viewer' ? r80HoechsteStufe(F) : null;
    if(!s.querySelector('optgroup')){ const alt = s.innerHTML;
      s.innerHTML = `<optgroup label="Rolle">${alt}</optgroup>${r80FOpts()}`;
      const orig = s.onchange; s.onchange = async function(){
        const wahl = s.value, nm = u.name || u.email || 'Die Person', F = (R80_LF || []).filter(x => x.user_id === u.id && x.stufe !== 'aus'), cur = u.role === 'viewer' ? r80HoechsteStufe(F) : null;
        if(!wahl.startsWith('f:')){
          // Gast mit Funktionen auf eine echte Rolle: Funktionen auf Wunsch mit entfernen
          if(F.length && !confirm(nm + ' hat Funktionen in ' + F.length + (F.length === 1 ? ' Bereich' : ' Bereichen') + '. Wenn du weitermachst, werden sie entfernt und es gilt nur die Rolle „' + ((SV_ROLE_INFO[wahl] || {}).t || wahl) + '“. Weiter?')){ s.value = cur || u.role; return; }
          if(F.length){ for(const x of F){ try{ await SVB.sb.rpc('admin_funktion_set', { p_user:u.id, p_bereich:x.bereich, p_stufe:null }); }catch(e){} } }
          if(wahl === u.role){ kToast('✓ ' + nm + ' ist jetzt ' + ((SV_ROLE_INFO[wahl] || {}).t || wahl)); return svAdminRender(true); }
          return orig && orig.apply(this, arguments); }
        if(u.role !== 'viewer' && !confirm(nm + ' verliert die Rolle „' + ((SV_ROLE_INFO[u.role] || {}).t || u.role) + '“ und bekommt nur noch die Bereiche, die du gleich wählst. Weiter?')){ s.value = cur || u.role; return; }
        try{ if(u.role !== 'viewer'){ const { error } = await SVB.sb.rpc('admin_update', { p_id:u.id, p_role:'viewer', p_active:null, p_name:null }); if(error) throw error; u.role = 'viewer'; }
          kToast(R80_FROLLE[wahl] + ': jetzt die Bereiche wählen und dort „' + R80_STUFE_T[wahl.slice(2)] + '“ einstellen');
          R80_NACH_DLG = true; await svrPerson(u.id);
        }catch(e){ kToast('⚠️ ' + String(e.message || e)); svAdminRender(true); } }; }
    if(cur) s.value = cur;
  });
}
// Einladungstext nennt die Funktionsrolle, nicht „Gast“
let R80_FR_LETZTE = null;
{ const _lb = svLinkBox; svLinkBox = function(link, name, role, kind){ const fr = R80_FR_LETZTE; R80_FR_LETZTE = null;
  if(!fr || role !== 'viewer') return _lb.apply(this, arguments);
  const I = SV_ROLE_INFO.viewer, t = I.t; I.t = fr; try{ return _lb.apply(this, arguments); } finally { I.t = t; } }; }
let R80_NACH_DLG = false;
let R80_LF = [];

/* =====================================================================
   Beta 0.83 · Verbesserungen von Julian für die Mannschaft
   1. Nachname: Spielerauswahl (Verletzung, Training, Abwesenheit, Material) aus der aktuellen Spielerliste, nach Nachname.
      Spielerliste lässt sich nach Nachname sortieren (Kopf „Spieler“ oder Knopf über der Liste).
   2. Spalte „Verfügbar“: nur das Stichwort der Verletzung, der ganze Text als Tooltip.
   3. Verletzungen und Abwesenheiten zeigen nur die gewählte Mannschaft (bei der Zweiten keine Spieler der Ersten).
   4. Reiter „Veranstaltungen“ für 1. und 2. Mannschaft: Weihnachtsfeier, Abschlussfahrt … als Termin der Mannschaft.
   ===================================================================== */

/* ---------- 1. Nachname ---------- */
function svNachname(n){ const t = String(n || '').trim().split(/\s+/).filter(Boolean); return t.length > 1 ? t[t.length - 1] : (t[0] || ''); }
function svNachCmp(a, b){ return svNachname(a && a.name).localeCompare(svNachname(b && b.name), 'de') || String(a && a.name || '').localeCompare(String(b && b.name || ''), 'de'); }

// Spielerliste: Sortierung über der Liste umschalten (auch am Handy, wo es keinen Tabellenkopf gibt)
{ const _ar81 = mnAfterRender; mnAfterRender = function(v){ const r = _ar81.apply(this, arguments);
  try{ if(v !== 'players') return r; const B = document.getElementById('trBody'); if(!B || B.querySelector('.s81-sort')) return r;
    const S = MN.sp || {}, nach = S.sort === '_nach';
    const d = document.createElement('div'); d.className = 's81-sort'; d.setAttribute('role', 'group'); d.setAttribute('aria-label', 'Sortieren');
    d.innerHTML = `<span>Sortieren</span><button type="button" data-s81="pos" aria-pressed="${!S.sort}" class="${!S.sort ? 'on' : ''}">Position</button><button type="button" data-s81="_nach" aria-pressed="${nach}" class="${nach ? 'on' : ''}">Nachname${nach && S.dir < 0 ? ' Z bis A' : ' A bis Z'}</button>`;
    const leiste = B.querySelector('.k1-leiste'); if(leiste) leiste.after(d); else B.prepend(d);
    d.querySelectorAll('[data-s81]').forEach(b => b.onclick = () => { const k = b.dataset.s81;
      if(k === 'pos'){ S.sort = null; S.dir = 1; } else if(S.sort === '_nach'){ S.dir *= -1; } else { S.sort = '_nach'; S.dir = 1; }
