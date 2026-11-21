async function v1ModellKarte(){
  const P=document.getElementById('panel-model'); if(!P||!['admin','vorstand'].includes(svRole()))return;
  let c=P.querySelector('.v1-modell'); if(!c){ c=document.createElement('div'); c.className='card v1-modell'; } P.prepend(c);
  c.innerHTML='<p class="note">Bewertungsmodell V1 wird geladen …</p>';
  let D; try{ D=V1.modell=await v1Rpc('rating_v1_modell'); }catch(e){ c.innerHTML=`<p class="note">Modell V1 lässt sich gerade nicht laden: ${v1E(e.message)}</p>`; return; }
  const m=D.modell||{}, pa=m.parameter||{}, v=D.verteilung||{}, f=D.schalter||{}, admin=svRole()==='admin', n=Math.max(1,v.spieler||0);
  const anker=pa.liga_anker||{}, vorl=pa.liga_anker_vorlaeufig||[];
  const name=id=>{ const p=typeof sv4P==='function'?sv4P(id):null; return p?p.name:id; };
  c.innerHTML=`<h3>Bewertungsmodell V1</h3>
    <p class="note">Version <b>${v1E(m.version||'?')}</b>${m.aktiv_seit?` · aktiv seit ${v1E(v1D(m.aktiv_seit))}`:''} · ${v.spieler||0} Spieler bewertet · letzter Lauf ${v1E(v1D(v.stichtag))} · ${v.staende||0} gespeicherte Stände</p>
    <div class="v1-vert">${['hoch','mittel','niedrig'].map(s=>`<div class="s-${s}"><b>${v[s]||0}</b><span>Sicherheit ${s}</span><i style="width:${Math.round((v[s]||0)/n*100)}%"></i></div>`).join('')}</div>
    <h5>Ligaanker (typischer etablierter Stammspieler)</h5>
    <div class="v1-anker">${Object.entries(anker).sort((x,y)=>x[1]-y[1]).map(([k,w])=>`<span><b>${w}</b>${v1E(V1_LIGA[k]||k)}${vorl.includes(k)?' <i>vorläufig</i>':''}</span>`).join('')}</div>
    <p class="note small">Rolle: Stamm 0 · Rotation −${Math.abs(pa.rolle?pa.rolle.rotation:3)} · meist Ersatz −${Math.abs(pa.rolle?pa.rolle.ersatz:5)} · ungenutzte Bank −${Math.abs(pa.rolle?pa.rolle.bank_unbenutzt:7)}. Korrekturen zusammen höchstens ±${pa.korrektur_gesamt_max||8}. Eye-Test je nach Kenntnis ±2 bis ±5. Ligen anderer Verbände werden nach Spielklasse eingeordnet und senken die Sicherheit etwas.</p>
    <h5>Offene Hinweise „Bewertung prüfen“ (${(D.pruefungen||[]).length})</h5>
    ${(D.pruefungen||[]).length?`<div class="v1-pr">${D.pruefungen.map(x=>`<div class="v1-pri"><div><b><a href="#" data-v1open="${v1E(x.player_id)}">${v1E(name(x.player_id))}</a></b> · ${v1E(v1PrTitel(x))} · ${v1E(x.von_name||'')} · ${v1E(v1D(x.erstellt_am))}<p>${v1E(x.notiz)}</p></div>
      <div class="v1-pra"><button class="btn sm" type="button" data-v1erl="${v1E(x.id)}" data-st="geprueft">Geprüft</button><button class="btn sm ghost" type="button" data-v1erl="${v1E(x.id)}" data-st="uebernommen">Übernommen</button><button class="btn sm ghost" type="button" data-v1erl="${v1E(x.id)}" data-st="abgelehnt">Ablehnen</button></div></div>`).join('')}</div>`:'<p class="note">Keine offenen Hinweise.</p>'}
    <div class="btnrow"><button class="btn sm ghost" type="button" data-v1neu>${SVI('refresh')} Jetzt neu berechnen</button></div>
    ${admin?`<h5>Wer sieht die neue Ansicht?</h5><div class="v1-schalter">${[['aus','Niemand'],['admin','Nur Admin'],['personen','Ausgewählte Personen'],['alle','Alle mit Scouting-Recht']].map(([k,t])=>`<label><input type="radio" name="v1modus" value="${k}"${f.modus===k?' checked':''}> ${t}</label>`).join('')}</div>
      <div class="v1-leute"${f.modus==='personen'?'':' hidden'}>${(D.leute||[]).map(l=>`<label><input type="checkbox" value="${v1E(l.id)}"${(f.personen||[]).includes(l.id)?' checked':''}> ${v1E(l.name)}</label>`).join('')}</div>
      <div class="btnrow"><button class="btn sm" type="button" data-v1sch>${SVI('check')} Speichern</button></div>`:''}`;
  c.querySelectorAll('[data-v1open]').forEach(a=>a.onclick=ev=>{ ev.preventDefault(); try{ openModal(a.dataset.v1open); }catch(e){} });
  c.querySelectorAll('[data-v1erl]').forEach(b=>b.onclick=async()=>{ try{ await v1Rpc('rating_pruefung_erledigen',{p_id:b.dataset.v1erl,p_status:b.dataset.st,p_antwort:null}); v1Toast('✓ Erledigt'); v1ModellKarte(); }catch(e){ v1Toast('⚠️ '+e.message); } });
  const nb=c.querySelector('[data-v1neu]'); if(nb)nb.onclick=async()=>{ nb.disabled=true; try{ await v1Rpc('rating_neu_berechnen'); v1Toast('✓ Neuberechnung gestartet, dauert etwa eine Minute'); }catch(e){ v1Toast('⚠️ '+e.message); nb.disabled=false; } };
  c.querySelectorAll('[name="v1modus"]').forEach(r=>r.onchange=()=>{ const l=c.querySelector('.v1-leute'); if(l)l.hidden=r.value!=='personen'||!r.checked; });
  const sb=c.querySelector('[data-v1sch]'); if(sb)sb.onclick=async()=>{ const mo=(c.querySelector('[name="v1modus"]:checked')||{}).value; const ps=[...c.querySelectorAll('.v1-leute input:checked')].map(i=>i.value);
    try{ await v1Rpc('funktion_setzen',{p_key:'ui_v1',p_modus:mo,p_personen:ps}); v1Toast('✓ Gespeichert'); }catch(e){ v1Toast('⚠️ '+e.message); } };
}

(function(){ try{ const s=document.createElement('style'); s.id='svm45css'; s.textContent="/* Umbau V1, Paket C · Stärke V1 im Profil, Eye-Test V1, Modellansicht */\n:root{--v1-hoch:#22c55e;--v1-mittel:#f59e0b;--v1-niedrig:#94a3c4;--v1-auf:#22c55e;--v1-ab:#f05252;}\n.v1box{display:flex;flex-direction:column;gap:12px;margin:12px 0;padding:14px;border:1px solid var(--line);border-radius:16px;background:var(--surface);}\n.v1-lade{color:var(--ink3);font-size:13px;}\n.v1-kopf{display:flex;gap:14px;align-items:center;}\n.v1-zahl{flex:0 0 auto;width:74px;height:74px;border-radius:50%;display:flex;flex-direction:column;align-items:center;justify-content:center;border:3px solid var(--v1-niedrig);background:var(--surface2);}\n.v1-zahl b{font-family:var(--disp);font-size:30px;font-weight:800;line-height:1;color:var(--ink);}\n.v1-zahl small{font-size:11px;font-weight:700;color:var(--ink3);text-transform:uppercase;letter-spacing:.06em;margin-top:2px;}\n.v1-zahl.leer{font-size:28px;font-weight:800;color:var(--ink3);}\n.v1-zahl.s-hoch{border-color:var(--v1-hoch);} .v1-zahl.s-mittel{border-color:var(--v1-mittel);} .v1-zahl.s-niedrig{border-style:dashed;}\n.v1-mitte{min-width:0;display:flex;flex-direction:column;gap:6px;}\n.v1-ein{font-weight:700;color:var(--ink);font-size:15px;line-height:1.3;}\n.v1-chips{display:flex;flex-wrap:wrap;gap:6px;}\n.v1-c{display:inline-flex;align-items:center;gap:4px;font-size:12px;font-weight:700;padding:3px 9px;border-radius:999px;border:1px solid var(--line);background:var(--surface2);color:var(--ink2);white-space:nowrap;}\n.v1-c.s-hoch{border-color:color-mix(in srgb,var(--v1-hoch) 55%,transparent);color:var(--v1-hoch);}\n.v1-c.s-mittel{border-color:color-mix(in srgb,var(--v1-mittel) 55%,transparent);color:var(--v1-mittel);}\n.v1-c.auf{color:var(--v1-auf);} .v1-c.ab{color:var(--v1-ab);}\n.v1-warn{margin:0;font-size:12.5px;color:var(--ink2);line-height:1.45;}\n.v1-warum{border-top:1px solid var(--line);padding-top:8px;}\n.v1-warum summary{cursor:pointer;font-weight:800;color:var(--ink);padding:4px 0;}\n.v1-gr{list-style:none;margin:8px 0;padding:0;display:flex;flex-direction:column;gap:6px;}\n.v1-gr li{display:flex;justify-content:space-between;gap:10px;font-size:13.5px;color:var(--ink2);line-height:1.4;}\n.v1-gr li b{flex:0 0 auto;color:var(--ink);font-variant-numeric:tabular-nums;}\n.v1-gr li b.auf{color:var(--v1-auf);} .v1-gr li b.ab{color:var(--v1-ab);}\n.v1-korr{display:flex;flex-wrap:wrap;gap:6px 14px;font-size:12.5px;color:var(--ink3);margin:6px 0;}\n.v1-korr b{color:var(--ink);font-variant-numeric:tabular-nums;}\n.v1-hin p{margin:4px 0;font-size:12.5px;color:var(--ink2);}\n.v1-ph{width:100%;border-collapse:collapse;font-size:12.5px;margin:6px 0;font-variant-numeric:tabular-nums;}\n.v1-ph th,.v1-ph td{text-align:left;padding:4px 6px;border-bottom:1px solid var(--line);white-space:nowrap;}\n.v1-ph th{color:var(--ink3);font-weight:700;font-size:11.5px;}\n.v1-bar{display:block;width:60px;height:6px;border-radius:99px;background:var(--line);overflow:hidden;}\n.v1-bar i{display:block;height:100%;background:var(--brand2);border-radius:99px;}\n.v1-eyes h5,.v1-pr h5,.v1-form h5,.v1-modell h5{margin:6px 0;font-size:12px;font-weight:800;text-transform:uppercase;letter-spacing:.06em;color:var(--ink3);}\n.v1-ey,.v1-pri{display:flex;gap:10px;align-items:flex-start;padding:8px 0;border-bottom:1px solid var(--line);}\n.v1-ey>b{flex:0 0 auto;width:30px;height:30px;border-radius:9px;display:flex;align-items:center;justify-content:center;background:var(--brandSoft);color:var(--ink);font-weight:800;}\n.v1-ey>div,.v1-pri>div:first-of-type{flex:1;min-width:0;font-size:12.5px;color:var(--ink2);}\n.v1-ey em{display:block;font-style:normal;color:var(--ink3);margin-top:2px;}\n.v1-ey p,.v1-pri p{margin:3px 0 0;color:var(--ink);}\n.v1-ant{color:var(--ink2)!important;}\n.v1-pra{display:flex;gap:6px;flex-wrap:wrap;}\n.v1-knoepfe{display:flex;gap:8px;flex-wrap:wrap;}\n.v1-form{display:flex;flex-direction:column;gap:10px;padding:12px;border:1px dashed var(--line2);border-radius:12px;background:var(--surface2);}\n.v1-gs{display:flex;flex-wrap:wrap;gap:6px;align-items:stretch;}\n.v1-gs>span{width:100%;font-size:12.5px;font-weight:700;color:var(--ink2);}\n.v1-g{flex:1 1 90px;display:flex;flex-direction:column;align-items:center;gap:2px;padding:8px 6px;border:1px solid var(--line);border-radius:10px;cursor:pointer;background:var(--surface);text-align:center;}\n.v1-g input{position:absolute;opacity:0;pointer-events:none;}\n.v1-g b{font-size:18px;color:var(--ink);} .v1-g small{font-size:11px;color:var(--ink3);line-height:1.25;}\n.v1-g:has(input:checked){border-color:var(--brand2);background:var(--brandSoft);box-shadow:0 0 0 3px rgba(47,107,255,.12);}\n.v1-kat{display:grid;grid-template-columns:repeat(auto-fit,minmax(96px,1fr));gap:6px;}\n.v1-kat label,.v1-zeile label{display:flex;flex-direction:column;gap:3px;font-size:12px;font-weight:700;color:var(--ink2);}\n.v1-zeile{display:grid;grid-template-columns:repeat(auto-fit,minmax(150px,1fr));gap:8px;}\n.v1-zeile label.w{grid-column:1/-1;}\n.v1-form select,.v1-form input[type=\"text\"],.v1-form input[type=\"date\"]{font:inherit;font-size:14px;padding:7px 9px;border-radius:9px;border:1px solid var(--line);background:var(--surface);color:var(--ink);min-width:0;}\n.v1-vert{display:grid;grid-template-columns:repeat(3,1fr);gap:8px;margin:8px 0;}\n.v1-vert>div{position:relative;overflow:hidden;padding:10px;border:1px solid var(--line);border-radius:12px;background:var(--surface2);}\n.v1-vert b{display:block;font-size:22px;font-family:var(--disp);color:var(--ink);} .v1-vert span{font-size:12px;color:var(--ink3);}\n.v1-vert i{position:absolute;left:0;bottom:0;height:3px;background:var(--v1-niedrig);}\n.v1-vert .s-hoch i{background:var(--v1-hoch);} .v1-vert .s-mittel i{background:var(--v1-mittel);}\n.v1-anker{display:flex;flex-wrap:wrap;gap:6px;}\n.v1-anker span{display:inline-flex;gap:6px;align-items:baseline;padding:5px 10px;border:1px solid var(--line);border-radius:10px;font-size:12.5px;color:var(--ink2);background:var(--surface2);}\n.v1-anker b{color:var(--ink);} .v1-anker i{font-style:normal;font-size:11px;color:var(--v1-mittel);}\n.v1-schalter{display:flex;flex-wrap:wrap;gap:6px 14px;font-size:13.5px;color:var(--ink2);}\n.v1-leute{display:grid;grid-template-columns:repeat(auto-fill,minmax(170px,1fr));gap:4px 12px;font-size:13px;color:var(--ink2);margin:6px 0;}\n@media (max-width:520px){ .v1-kopf{align-items:flex-start;} .v1-zahl{width:62px;height:62px;} .v1-zahl b{font-size:25px;} .v1-ph{display:block;overflow-x:auto;} }\n\n/* 0.99: „Was bedeuten die Zahlen?“ direkt im Profil */\n.v1-was{border-top:1px solid var(--line);padding-top:8px;}\n.v1-was summary{display:flex;align-items:center;gap:8px;min-height:44px;cursor:pointer;font-weight:800;color:var(--ink);padding:4px 0;list-style:none;}\n.v1-was summary::-webkit-details-marker{display:none;}\n.v1-was summary svg{width:17px;height:17px;flex:none;color:var(--ink3);}\n.v1-was-g{display:grid;gap:12px;margin-top:10px;}\n@media (min-width:900px){.v1-was-g{grid-template-columns:repeat(3,minmax(0,1fr));}}\n.v1-was-k{padding:13px 14px;border:1px solid var(--line);border-radius:12px;background:var(--surface2);}\n.v1-was-k h5{display:flex;align-items:center;gap:9px;margin:0 0 8px;font-size:14.5px;font-weight:800;line-height:1.25;color:var(--ink);}\n.v1-was-k p{margin:0 0 8px;font-size:13.5px;line-height:1.5;color:var(--ink2);}\n.v1-was-k p:last-child{margin-bottom:0;}\n.v1-pk{flex:none;width:20px;height:20px;border-radius:50%;border:3px solid var(--v1-hoch);background:var(--surface);}\n.v1-pk.rand{border-color:var(--v1-mittel);border-style:dashed;}\n.v1-pk.karte{border-radius:4px 4px 7px 7px;border-color:var(--ink3);width:16px;height:21px;}\n.v1-leiter{display:flex;flex-wrap:wrap;gap:6px;margin:0 0 8px;}\n.v1-leiter span{display:inline-flex;align-items:baseline;gap:6px;padding:4px 9px;border:1px solid var(--line);border-radius:999px;background:var(--surface);font-size:12.5px;color:var(--ink2);}\n.v1-leiter b{font-family:var(--disp);font-size:15px;font-weight:800;color:var(--ink);}\n.v1-farben{margin:0 0 8px;padding:0;list-style:none;display:grid;gap:7px;}\n.v1-farben li{display:flex;align-items:flex-start;gap:9px;font-size:13.5px;line-height:1.45;color:var(--ink2);}\n.v1-farben i{flex:none;width:18px;height:18px;margin-top:1px;border-radius:50%;border:3px solid var(--v1-niedrig);background:var(--surface);}\n.v1-farben i.s-hoch{border-color:var(--v1-hoch);} .v1-farben i.s-mittel{border-color:var(--v1-mittel);} .v1-farben i.s-niedrig{border-style:dashed;}\n.v1-was-f{margin:10px 0 0;font-size:13px;line-height:1.5;color:var(--ink3);}\n.v1-kh{display:block;width:100%;margin-top:8px;padding:6px 4px;border:0;background:none;font:inherit;font-size:12.5px;line-height:1.45;color:var(--ink3);text-align:center;cursor:pointer;min-height:44px;}\n.v1-kh svg{width:13px;height:13px;vertical-align:-2px;}\n.v1-kh u{text-underline-offset:3px;color:var(--ink2);}\n"; document.head.appendChild(s); }catch(e){} })();
/* =====================================================================
   Sportzentrale · Umbau V1 · Fachkern für Kader und Scouting (reine Funktionen, kein DOM, keine Datenbank)
   Masterprompt §4 (Planung, Top-Elf, Bedarf, interne Reihenfolge), §5 (Vergleich), §9 (Fit, Transferchance,
   Empfehlung, Einordnung). Unit-Tests: testenv/unit_v1kern.mjs. Gleiche Eingabe = gleiches Ergebnis.
   Grundsatz: Planungsdaten, Fit, Transferchance und Empfehlung ändern NIE die Stärke (Current Ability).
   ===================================================================== */
const V1K=(function(){
  const ANKER={KLD:53,KLC:57,KLB:61,KLA:65,KOL:73,GL:81,VL:87,HL:92};
  const LIGA={KLD:'Kreisliga D',KLC:'Kreisliga C',KLB:'Kreisliga B',KLA:'Kreisliga A',KOL:'Kreisoberliga',GL:'Gruppenliga',VL:'Verbandsliga',HL:'Hessenliga'};
  const POS=['TW','IV','AV','DM','OM','FL','ST'];
  const POSL={TW:'Torwart',IV:'Innenverteidiger',AV:'Außenverteidiger',DM:'Defensives Mittelfeld',OM:'Offensives Mittelfeld',FL:'Flügel',ST:'Sturm'};
  // Systeme: Spielfeldkoordinaten (x, y in %) und V1-Position je Slot
  const SYSTEME={
    '4-2-3-1':[['TW',50,90],['AV',17,74],['IV',39,77],['IV',61,77],['AV',83,74],['DM',38,58],['DM',62,58],['FL',20,38],['OM',50,35],['FL',80,38],['ST',50,18]],
    '4-4-2':[['TW',50,90],['AV',17,72],['IV',39,75],['IV',61,75],['AV',83,72],['FL',17,48],['DM',39,53],['OM',61,49],['FL',83,48],['ST',38,22],['ST',62,22]],
    '4-3-3':[['TW',50,90],['AV',17,72],['IV',39,75],['IV',61,75],['AV',83,72],['OM',30,50],['DM',50,58],['OM',70,50],['FL',18,28],['ST',50,20],['FL',82,28]],
    '3-5-2':[['TW',50,90],['IV',30,75],['IV',50,77],['IV',70,75],['FL',12,52],['OM',35,48],['DM',50,58],['OM',65,48],['FL',88,52],['ST',38,22],['ST',62,22]],
    '4-1-4-1':[['TW',50,90],['AV',17,72],['IV',39,75],['IV',61,75],['AV',83,72],['DM',50,62],['FL',15,44],['OM',37,46],['OM',63,46],['FL',85,44],['ST',50,20]],
    '5-4-1':[['TW',50,91],['AV',11,64],['IV',31,74],['IV',50,76],['IV',69,74],['AV',89,64],['FL',17,44],['DM',39,50],['OM',61,47],['FL',83,44],['ST',50,21]],
    // 0.99.74 (Sportliche Leitung, 17.11.2026: „Unser System 5-1-2-2 fehlt“): Fünferkette, ein Sechser, zwei Achter, zwei Spitzen. In der Aufstellung (FORMATIONS) gab es das System schon, hier fehlte es. Neues System: hier eintragen und in der Prüfung der Tabelle kader_plan_v1 (192_system_5122.sql).
    '5-1-2-2':[['TW',50,91],['AV',11,62],['IV',31,74],['IV',50,76],['IV',69,74],['AV',89,62],['DM',50,57],['OM',34,42],['OM',66,42],['ST',38,21],['ST',62,21]]
  };
  const NAEHE={IV:{AV:.55,DM:.5},AV:{IV:.55,FL:.55,DM:.35},DM:{IV:.5,OM:.65,AV:.35},OM:{DM:.65,FL:.6,ST:.5},FL:{AV:.55,OM:.6,ST:.55},ST:{OM:.5,FL:.55},TW:{}};
  const clamp=(v,a,b)=>Math.max(a,Math.min(b,v));

  // ---------- Positionen ----------
  function posV1(x){
    const s=String(x||'').trim().toUpperCase().replace('Ü','UE');
    if(POS.includes(s))return s;
    if(/^(FLUEGEL|FLÜGEL|LM|RM|LA|RA|LF|RF|W)$/.test(s))return 'FL';
    if(/^(LV|RV|AV|LIB)$/.test(s))return 'AV';
    if(/^(ZM|MF|M|MITTELFELD)$/.test(s))return 'MF';      // nicht genauer bekannt: zählt für DM und OM mit Unsicherheit
    if(/^(ZDM|6ER|6)$/.test(s))return 'DM';
    if(/^(ZOM|10ER|10)$/.test(s))return 'OM';
    return null;
  }
  // Wie gut deckt ein Spieler eine Slot-Position ab? 1 = Hauptposition, 0,85 Mittelfeld unbestimmt, 0,8 Nebenposition, sonst Nähe
  function passung(sp,slotPos){
    const h=posV1(sp.pos), neben=(sp.pos2||[]).map(posV1).filter(Boolean);
    if(h===slotPos)return 1;
    if(h==='MF'&&(slotPos==='DM'||slotPos==='OM'))return .85;
    if(neben.includes(slotPos))return .8;
    if(neben.includes('MF')&&(slotPos==='DM'||slotPos==='OM'))return .7;
    if(slotPos==='TW'||h==='TW')return 0;
    const basis=h==='MF'?Math.max((NAEHE.DM||{})[slotPos]||0,(NAEHE.OM||{})[slotPos]||0)*.9:((NAEHE[h]||{})[slotPos]||0);
    return basis;
  }
  const deckt=(sp,pos)=>passung(sp,pos)>=.8;

  // ---------- Elf zusammenstellen (jeder Spieler höchstens einmal, feste Plätze bleiben) ----------
  // spieler: [{id, ca, pos, pos2}], fix: {slotIndex: id}. Wert eines Spielers im Slot = Stärke × Passung (Passung < 0,5 = nicht positionsgerecht)
  function elf(system,spieler,fix){
    const S=(SYSTEME[system]||SYSTEME['4-2-3-1']).map(([pos,x,y],i)=>({i,pos,x,y,id:null,fix:false}));
    const frei=new Map(spieler.filter(s=>s&&s.id!=null).map(s=>[s.id,s])), wert=(s,pos)=>{ const p=passung(s,pos), c=s.ca==null?50:s.ca; return p<.5?-1:p>=.8?c-(1-p)*10:c-15; };   // Nebenposition kostet wenig, Aushilfe viel
    for(const [k,id] of Object.entries(fix||{})){ const sl=S[+k]; if(sl&&frei.has(id)){ sl.id=id; sl.fix=true; frei.delete(id); } }
    // knappe Positionen zuerst (wenig passende Spieler), dann jeweils den besten
    const offen=S.filter(s=>!s.id).map(s=>({s,n:[...frei.values()].filter(p=>wert(p,s.pos)>0).length})).sort((a,b)=>a.n-b.n||a.s.i-b.s.i);
    for(const {s} of offen){ let best=null,bw=0; for(const p of frei.values()){ const w=wert(p,s.pos); if(w>bw||(w===bw&&best&&String(p.id)<String(best.id))){ best=p; bw=w; } } if(best){ s.id=best.id; frei.delete(best.id); } }
    // Tausch-Verbesserung (zwei nicht feste Slots tauschen, wenn die Summe steigt)
    const by=id=>spieler.find(p=>p.id===id);
    for(let r=0;r<3;r++){ let besser=false;
      for(const a of S)for(const b of S){ if(a.i>=b.i||a.fix||b.fix||!a.id||!b.id)continue; const pa=by(a.id),pb=by(b.id);
        const vor=wert(pa,a.pos)+wert(pb,b.pos), nach=wert(pa,b.pos)+wert(pb,a.pos); if(nach>vor+1e-9&&wert(pa,b.pos)>0&&wert(pb,a.pos)>0){ const t=a.id; a.id=b.id; b.id=t; besser=true; } }
      // freier Spieler ersetzt schwächeren Slot
      for(const s of S){ if(s.fix)continue; const cur=s.id?wert(by(s.id),s.pos):0; let best=null,bw=cur; for(const p of frei.values()){ const w=wert(p,s.pos); if(w>bw+1e-9){ best=p; bw=w; } }
        if(best){ if(s.id)frei.set(s.id,by(s.id)); s.id=best.id; frei.delete(best.id); besser=true; } }
      if(!besser)break; }
    return S.map(s=>{ const p=s.id!=null?by(s.id):null; return Object.assign(s,{ca:p?p.ca:null,passung:p?passung(p,s.pos):null,
      positionsgerecht:p?passung(p,s.pos)>=.8:null}); });
  }

  // ---------- Kaderplan nächste Saison (aus spieler_saison, sonst vorläufige Annahme) ----------
  // zeile: spieler_saison der nächsten Saison oder null; jetzt: {team, rolleAktuell (stamm/rotation/ersatz/bank_unbenutzt), alter}
  const ROLLE_V1={stamm:'stamm',rotation:'breite',ergaenzung:'breite',perspektive:'entwicklung',neu:null};
  function planStatus(zeile,jetzt){
    jetzt=jetzt||{};
    if(zeile){
      const z=zeile.zukunft||'bleibt';
      const status=z==='geht'||z==='karriereende'?'abgang':z==='unsicher'?'offen':z==='ziel'?'ziel':'eingeplant';
      const team=status==='eingeplant'?(zeile.team||(z==='hoch'?'1':z==='runter'?'2':jetzt.team)||null):null;
      const rolle=zeile.rolle?(ROLLE_V1[zeile.rolle]||null):null;
      return {status,team,rolle:rolle||rolleVorschlag(jetzt),rolleAnnahme:!rolle,annahme:zeile.sicherheit==='annahme',quelle:'plan'};
    }
    if(!jetzt.team)return {status:null,team:null,rolle:null,annahme:true,quelle:'keine'};
    return {status:'eingeplant',team:jetzt.team,rolle:rolleVorschlag(jetzt),rolleAnnahme:true,annahme:true,quelle:'annahme'};
  }
  function rolleVorschlag(j){ const r=j.rolleAktuell; if(r==='stamm')return 'stamm'; if((j.alter||99)<=21)return 'entwicklung'; if(r==='rotation'||r==='ersatz'||r==='bank_unbenutzt')return 'breite'; return 'offen'; }
  // Zurück in spieler_saison: Status und Rolle als Zeile der nächsten Saison
  function planZeile(status,rolle,team){
    const z={eingeplant:'bleibt',offen:'unsicher',abgang:'geht'}[status]||'bleibt';
    const r={stamm:'stamm',breite:'rotation',entwicklung:'perspektive',offen:null}[rolle];
    return {zukunft:z,rolle:r===undefined?null:r,team:status==='eingeplant'?team:null,sicherheit:'planung'};
  }

  // ---------- Zielniveau aus sportlichem Ziel und Rolle ----------
  function zielNiveau(ziel,rolle){ const a=ANKER[ziel]||ANKER.KLA; return rolle==='stamm'?a-2:rolle==='breite'?a-6:a-4; }

  // ---------- Bedarfsmotor mit interner Reihenfolge (§4.5, §4.6) ----------
  // in: {saison, team, system, ziel, kader:[{id,name,pos,pos2,ca,p24,alter,sicherheit,status,rolle,team}], zweite:[…], jugend:[{id,name,pos,pos2,persp,zeitfenster,entwicklung}], vorgemerkt:[{id,…,bedarf_schluessel}]}
  function bedarfe(inp){
    const team=inp.team||'1', ziel=inp.ziel||(team==='1'?'KLA':'KLD'), sys=SYSTEME[inp.system]?inp.system:'4-2-3-1';
    const plan=(inp.kader||[]).filter(s=>s.status==='eingeplant'&&s.team===team);
    const E=elf(sys,plan.map(s=>({id:s.id,ca:s.ca,pos:s.pos,pos2:s.pos2})),inp.fix||{});
    const byId=new Map(plan.map(s=>[s.id,s]));
    const out=[]; const zaehl={};
    const key=(pos,art)=>{ zaehl[pos+art]=(zaehl[pos+art]||0)+1; return [inp.saison,team,pos,art,zaehl[pos+art]].join('|'); };
    const zweite=(inp.zweite||[]).filter(s=>s.status==='eingeplant'&&s.team==='2');
    // Zweite: wer ist dort Stamm? (Hochstufung reißt dort eine Lücke)
    const elf2=team==='1'?elf((inp.system2&&SYSTEME[inp.system2])?inp.system2:'4-2-3-1',zweite.map(s=>({id:s.id,ca:s.ca,pos:s.pos,pos2:s.pos2})),{}):[];
    const stamm2=new Set(elf2.map(s=>s.id).filter(Boolean));
    const intern=(pos,niveau,ausser)=>{
      const L=[];
      plan.filter(s=>!ausser.has(s.id)&&deckt(s,pos)).forEach(s=>L.push({id:s.id,name:s.name,stufe:'team',ca:s.ca,p24:s.p24,
        hinweis:s.ca!=null&&s.ca>=niveau?'erreicht das Zielniveau':'unter dem Zielniveau'}));
      if(team==='1')zweite.filter(s=>deckt(s,pos)&&s.ca!=null&&s.ca>=niveau-4).forEach(s=>L.push({id:s.id,name:s.name,stufe:'zweite',ca:s.ca,p24:s.p24,
        hinweis:stamm2.has(s.id)?'Stammspieler der Zweiten: Hochstufung reißt dort eine Lücke':'aus der Zweiten hochstufen'}));
      (inp.jugend||[]).filter(j=>deckt(j,pos)&&(j.persp===(team==='1'?'erste':'zweite')||j.persp==='offen')).forEach(j=>L.push({id:j.id,name:j.name,stufe:'jugend',ca:null,
        zeitfenster:j.zeitfenster,hinweis:'eigene Jugend, Herrenreife '+({sofort:'sofort',['12m']:'in etwa 12 Monaten',['24m']:'in etwa 24 Monaten',spaeter:'später'}[j.zeitfenster]||'offen')}));
      return L;
    };
    const kriterien=(pos,art)=>({must:[{typ:'pos',wert:pos}],wichtig:ATTR_POS[pos].slice(0,2).map(k=>({typ:'attr',k,min:3})),
      wunsch:art==='entwicklung'?[{typ:'alter',max:23}]:ATTR_POS[pos].slice(2,3).map(k=>({typ:'attr',k,min:4}))});
    const ext=(L,niveau,brauchtStamm)=>{ const sofort=L.filter(x=>x.stufe!=='jugend'&&x.ca!=null&&x.ca>=niveau&&!(x.stufe==='zweite'&&/Lücke/.test(x.hinweis)));
      if(sofort.length)return 'gedeckt'; if(L.length)return brauchtStamm?'teilweise':'teilweise'; return 'offen'; };
    // 1) Stammqualität je Slot
    E.forEach(sl=>{
      const z=zielNiveau(ziel,'stamm');
      if(!sl.id){ const L=intern(sl.pos,z,new Set(E.map(x=>x.id).filter(Boolean)));
        out.push({schluessel:key(sl.pos,'zahl'),art:'zahl',pos:sl.pos,rolle:'stamm',slot:sl.i,ref:null,ziel:z,
          grund:`Für ${POSL[sl.pos]} ist in der Plan-Elf niemand eingeplant.`,intern:L,extern:ext(L,z,true),kriterien:kriterien(sl.pos,'stamm')}); return; }
      const s=byId.get(sl.id);
      if(!sl.positionsgerecht){ const L=intern(sl.pos,z,new Set([sl.id]));
        out.push({schluessel:key(sl.pos,'polyvalent'),art:'polyvalent',pos:sl.pos,rolle:'stamm',slot:sl.i,ref:{id:s.id,name:s.name,ca:s.ca},ziel:z,
          grund:`${s.name} spielt ${POSL[sl.pos]} nur aushilfsweise, die Position hängt an ihm.`,intern:L,extern:ext(L,z,true),kriterien:kriterien(sl.pos,'stamm')}); return; }
      if(s.ca!=null&&s.ca<=z-3){ const L=intern(sl.pos,z,new Set([sl.id]));
        out.push({schluessel:key(sl.pos,'stamm'),art:'stamm',pos:sl.pos,rolle:'stamm',slot:sl.i,ref:{id:s.id,name:s.name,ca:s.ca},ziel:z,
          grund:`${s.name} (${s.ca}) liegt ${z-s.ca} unter dem Zielniveau ${z} für einen Stammspieler (${LIGA[ziel]||ziel}).`,intern:L,extern:ext(L,z,true),kriterien:kriterien(sl.pos,'stamm')}); }
    });
    // 2) Kaderbreite je Position: je Slot ein positionsgerechter Vertreter (ohne Doppelzählung der Elf)
    const inElf=new Set(E.map(s=>s.id).filter(Boolean));
    const proPos={}; E.forEach(s=>{ proPos[s.pos]=(proPos[s.pos]||0)+1; });
    for(const pos of Object.keys(proPos)){
      const soll=pos==='TW'?1:Math.max(1,Math.ceil(proPos[pos]/2));
      const vertreter=plan.filter(s=>!inElf.has(s.id)&&deckt(s,pos));
      const benutzt=new Set(); const ist=[];
      vertreter.sort((a,b)=>(b.ca||0)-(a.ca||0)).forEach(s=>{ if(ist.length<soll&&!benutzt.has(s.id)){ ist.push(s); benutzt.add(s.id); } });
      for(let k=ist.length;k<soll;k++){ const z=zielNiveau(ziel,'breite'); const L=intern(pos,z,new Set([...inElf,...vertreter.map(v=>v.id)]));
        out.push({schluessel:key(pos,'breite'),art:'breite',pos,rolle:'breite',slot:null,ref:null,ziel:z,
          grund:`Hinter der Elf gibt es für ${POSL[pos]} ${ist.length?'nur '+ist.length:'keinen'} positionsgerechten Vertreter.`,intern:L,extern:ext(L,z,false),kriterien:kriterien(pos,'breite')}); }
    }
    // 3) Entwicklungsperspektive je Mannschaftsteil (Abwehr, Mittelfeld, Angriff)
    const TEIL={Abwehr:['IV','AV'],Mittelfeld:['DM','OM'],Angriff:['FL','ST']};
    for(const [teil,ps] of Object.entries(TEIL)){
      const ok=plan.some(s=>(s.alter||99)<=21&&ps.some(p=>deckt(s,p)))||(inp.jugend||[]).some(j=>ps.some(p=>deckt(j,p))&&(j.zeitfenster==='sofort'||j.zeitfenster==='12m'));
      if(!ok){ const pos=ps[0], z=zielNiveau(ziel,'entwicklung'); const L=intern(pos,z,inElf).filter(x=>x.stufe==='jugend');
        out.push({schluessel:key(pos,'entwicklung'),art:'entwicklung',pos,rolle:'entwicklung',slot:null,ref:null,ziel:z,
          grund:`Im Bereich ${teil} gibt es keinen jungen Spieler (bis 21) mit Perspektive.`,intern:L,extern:L.length?'teilweise':'offen',kriterien:kriterien(pos,'entwicklung')}); }
    }
    // externe vorgemerkte Kandidaten mit bestätigter Verpflichtung decken den Bedarf (werden dann als eingeplant geführt)
    return out;
  }
  // Positionsrelevante Eye-Test-Kategorien (für Suchprofile, nicht für die Stärke)
  const ATTR_POS={TW:['def','phy','pas'],IV:['def','phy','pas'],AV:['tem','def','pas'],DM:['pas','def','phy'],OM:['pas','dri','sch'],FL:['tem','dri','sch'],ST:['sch','phy','tem']};
  const ATTR_L={tem:'Tempo',sch:'Schießen',pas:'Passen',dri:'Dribbling',def:'Defensive',phy:'Physis'};

  // ---------- Fit (nur für eine konkrete Zielrolle, §9.1) ----------
  // sp: {pos, pos2, alter, fuss, attr:{tem,…} (1–5, Eye-Test-Schnitt)}; k: {must:[…], wichtig:[…], wunsch:[…]}
  function kriteriumPruefen(sp,c){
    if(c.typ==='pos')return passung(sp,c.wert)>=.8?true:passung(sp,c.wert)>=.5?false:false;
    if(c.typ==='attr'){ const v=sp.attr&&sp.attr[c.k]; return v==null?null:v>=c.min; }
    if(c.typ==='alter'){ return sp.alter==null?null:(c.max==null||sp.alter<=c.max)&&(c.min==null||sp.alter>=c.min); }
    if(c.typ==='fuss'){ const f=String(sp.fuss||'').toLowerCase(); if(!f||f==='unbekannt')return null; return f.startsWith(c.wert.slice(0,3))||f.startsWith('beid'); }
    return null;
  }
  function kriteriumText(c){ return c.typ==='pos'?'Position '+(POSL[c.wert]||c.wert):c.typ==='attr'?(ATTR_L[c.k]||c.k)+' mindestens '+c.min:c.typ==='alter'?(c.max!=null?'höchstens '+c.max+' Jahre':'mindestens '+c.min+' Jahre'):c.typ==='fuss'?'Fuß '+c.wert:''; }
  function fit(sp,k){
    k=k||{}; const must=(k.must||[]).map(c=>[c,kriteriumPruefen(sp,c)]), wich=(k.wichtig||[]).map(c=>[c,kriteriumPruefen(sp,c)]), wun=(k.wunsch||[]).map(c=>[c,kriteriumPruefen(sp,c)]);
    const unbekannt=[...must,...wich].filter(x=>x[1]===null).length, alle=must.length+wich.length;
    const sicherheit=!alle?'niedrig':unbekannt===0?'hoch':unbekannt/alle<=.34?'mittel':'niedrig';
    const gruende=[];
    if(must.some(x=>x[1]===false)){ must.filter(x=>x[1]===false).forEach(x=>gruende.push('Muss nicht erfüllt: '+kriteriumText(x[0])));
      return {stufe:'niedrig',sicherheit,gruende,score:0}; }
    const wk=wich.filter(x=>x[1]!==null), wOk=wk.filter(x=>x[1]).length;
    const anteil=wk.length?wOk/wk.length:null;
    const stufe=anteil===null?'mittel':anteil>=.66?'hoch':anteil>0?'mittel':'mittel';
    wich.forEach(([c,v])=>gruende.push((v===true?'erfüllt: ':v===false?'nicht erfüllt: ':'unbekannt: ')+kriteriumText(c)));
    const wunOk=wun.filter(x=>x[1]===true).length;
    if(wunOk)gruende.push('Wunsch erfüllt: '+wun.filter(x=>x[1]===true).map(x=>kriteriumText(x[0])).join(', '));
    return {stufe,sicherheit,gruende,score:(stufe==='hoch'?2:1)+wunOk*.1};
  }

  // ---------- Sportliche Einordnung für eine Zielrolle (§9.4) ----------
  function unterschied(a,b,sa,sb){ if(a==null||b==null)return ''; const d=Math.abs(Math.round(a)-Math.round(b));
    let t=d<=1?'praktisch gleich':d<=3?'leichter Vorteil':d<=6?'klarer Unterschied':'deutlicher Unterschied';
    if(d>=2&&(sa==='niedrig'||sb==='niedrig'))t+=', aber noch unsicher'; return t; }
  function einordnung(sp,b){
    const ca=sp.ca, ref=b&&b.ref&&b.ref.ca!=null?b.ref.ca:null, ziel=b?b.ziel:null;
    if(ca==null)return {k:'unbekannt',t:'Noch keine Stärke',text:'Für diesen Spieler gibt es noch keine Stärke.'};
    const vs=ref!=null?ref:ziel;
    let k;
    if(ca>=Math.max(ziel!=null?ziel-1:0,ref!=null?ref+2:0))k='sofort';
    else if((ref!=null&&ca>=ref-2)||(ziel!=null&&ca>=ziel-5))k='breite';
    else if(sp.p24!=null&&ziel!=null&&sp.p24>=ziel-2&&(sp.alter||99)<=23)k='entwicklung';
    else k='keine';
    const T={sofort:'Sofortverstärkung',breite:'Konkurrenz/Kaderbreite',entwicklung:'Entwicklungsspieler',keine:'aktuell keine Verstärkung'}[k];
    const d=vs!=null?Math.round(ca)-Math.round(vs):null;
    const gegen=ref!=null?`gegenüber ${b.ref.name||'dem internen Maßstab'} (${ref})`:ziel!=null?`gegenüber dem Zielniveau ${ziel}`:'';
    const text=d==null?T:`${T}: ${d>0?'+':''}${d} ${gegen}, ${unterschied(ca,vs,sp.sicherheit)}${k==='entwicklung'?`, in 24 Monaten ${sp.p24}`:''}.`;
    return {k,t:T,text};
  }

  // ---------- Transferchance (§9.2): nur Wechselinfos, nie Stärke, Potenzial, Fit, Alter oder Bedarf ----------
  // in: {aussage:'kein'|'offen'|'signalisiert'|null, aussage_am, heute, ehemalig, verbindung, rolle:'stamm'|'rotation'|'ersatz'|'bank_unbenutzt'|null, wechsel:Anzahl Vereinswechsel 5 Jahre, km}
  function transferchance(x){
    x=x||{}; const g=[]; const heute=x.heute||'2100-01-01';
    const alt=x.aussage_am?(Date.parse(heute)-Date.parse(x.aussage_am))/864e5>183:false;
    if(x.aussage&&!alt){ const m={kein:'niedrig',offen:'offen',signalisiert:'hoch'}[x.aussage]; if(m){ g.push(x.aussage==='kein'?'hat kein Interesse an einem Wechsel gesagt':x.aussage==='signalisiert'?'hat Interesse signalisiert':'Wechsel ist für ihn offen'); return {stufe:m,gruende:g}; } }
    let s=0;
    if(x.aussage&&alt){ g.push('letzte Aussage älter als sechs Monate'); s+=x.aussage==='signalisiert'?1:x.aussage==='kein'?-1:0; }
    if(x.verbindung){ s+=1.5; g.push('persönliche Verbindung zum Verein'); }
    if(x.ehemalig){ s+=1; g.push('früher bei uns'); }
    if(x.rolle==='ersatz'||x.rolle==='bank_unbenutzt'){ s+=1; g.push('spielt bei seinem Verein wenig'); }
    else if(x.rolle==='stamm'){ s-=.5; g.push('ist bei seinem Verein Stammspieler'); }
    if(x.wechsel>=3){ s+=.5; g.push('wechselt häufiger den Verein'); }
    if(x.km!=null&&x.km>40){ s-=.5; g.push('weite Anfahrt'); }
    const stufe=s>=2.5?'hoch':s<=-1?'niedrig':'offen';
    if(!g.length)g.push('keine Wechselinfo: offen');
    return {stufe,gruende:g};
  }

  // ---------- Handlungsempfehlung (§9.3): regelbasiert, kein Mischscore ----------
  // in: {einordnung:k, fit:{stufe,sicherheit}, transfer:stufe, sicherheit, kontakt:'kein'|'kontakt'|'gespraech', entscheidung}
  function empfehlung(x){
    const E=x.einordnung, F=x.fit||{}, T=x.transfer, S=x.sicherheit, K=x.kontakt||'kein';
    const r=(a,t)=>({aktion:a,text:t});
    if(x.entscheidung==='abgelehnt')return r('aktuell nicht priorisieren','Die Entscheidung ist gegen ihn gefallen.');
    if(x.entscheidung==='verpflichtet')return r('eingeplant','Zusage ist da: er wird in der Planung als eingeplant geführt.');
    if(E==='keine')return r('aktuell nicht priorisieren','Er wäre für diese Rolle aktuell keine Verstärkung.');
    if(F.stufe==='niedrig')return r('aktuell nicht priorisieren','Er passt nicht zum Suchprofil dieser Rolle, auch wenn die Stärke stimmt.');
    if(F.sicherheit==='niedrig')return r('Daten vervollständigen','Für den Fit fehlen Angaben (Position oder Eye-Test). Erst einschätzen, dann entscheiden.');
    if(S==='niedrig'||E==='unbekannt')return r('weiter beobachten','Die Stärke ist noch unsicher. Ein Eye-Test oder weitere Spiele schaffen Klarheit.');
    if(T==='niedrig')return r('im Blick behalten','Sportlich interessant, aber ein Wechsel ist gerade unwahrscheinlich.');
    if(E==='entwicklung')return T==='hoch'?r('Kontakt aufnehmen','Junger Spieler mit Perspektive und Wechselbereitschaft.'):r('weiter beobachten','Entwicklungsspieler: Verlauf beobachten.');
    if(K==='kein')return r('Kontakt aufnehmen',`${E==='sofort'?'Sofortverstärkung':'Kaderbreite'} mit passendem Profil, Wechsel ist ${T==='hoch'?'wahrscheinlich':'offen'}.`);
    if(K==='kontakt')return r('Gespräch führen','Kontakt steht, jetzt das Gespräch führen.');
    return r('Entscheidung treffen','Gespräch ist geführt: sportliche Entscheidung treffen.');
  }

  return {ANKER,LIGA,POS,POSL,SYSTEME,ATTR_POS,ATTR_L,posV1,passung,deckt,elf,planStatus,planZeile,rolleVorschlag,zielNiveau,bedarfe,fit,kriteriumText,unterschied,einordnung,transferchance,empfehlung};
})();
if(typeof module!=='undefined')module.exports=V1K;

/* =====================================================================
   Sportzentrale · Umbau V1, Paket D: Kader = MORGEN PLANEN (hinter dem Schalter ui_v1)
   Kader: Planung | Kaderübersicht | Top-Elf
   - Planung: nächste Saison (dynamisch), 1./2. Mannschaft, System, Alternativsystem, Ziel, Plan-Elf, Handlungsbedarfe,
     offene Entscheidungen, Gespräche und Wiedervorlagen, schlanke Herren-Jugendpipeline
   - Bedarfe werden aus dem Plan berechnet (V1K.bedarfe, interne Reihenfolge Team → Zweite → Jugend → extern)
     und als eindeutige Objekte gespeichert (bedarf_v1_sync), Scouting arbeitet mit genau diesen Bedarfen
   - Planungsdaten liegen in spieler_saison (wie bisher) und kader_plan_v1; sie ändern nie die Stärke
   Dazu: Navigation für alle drei Bereiche (Kader, Scouting, Mannschaft) unter V1, alte Reiter leiten um.
   ===================================================================== */
const K1={team:'1',plan:{},planGeladen:false,ju:null,juP:null,planP:null,top:'heute',topTeam:'1',sort:{k:'ca',d:-1},f:{team:'beide',pos:'',status:''},
  syncT:null,syncBusy:false,syncSig:{},juOffen:false};
const K1_STATUS={eingeplant:'eingeplant',offen:'offen',abgang:'Abgang'};
const K1_ROLLE={stamm:'Stamm',breite:'Konkurrenz/Kaderbreite',entwicklung:'Entwicklung',offen:'offen'};
const K1_ART={zahl:'Position unbesetzt',stamm:'Stammqualität fehlt',breite:'Kaderbreite fehlt',entwicklung:'Entwicklungsperspektive fehlt',polyvalent:'Hängt an einem Aushilfsspieler',niveau:'Niveau unter Ziel'};
const K1_EXT={offen:'extern offen',teilweise:'intern teilweise',gedeckt:'intern gedeckt'};
const K1_STUFE={team:'eigene Mannschaft',zweite:'2. Mannschaft',jugend:'eigene Jugend'};
const K1_SYS=Object.keys(V1K.SYSTEME);
const k1E=s=>svEsc(s==null?'':String(s));
function k1S(){ return sv4S(); }
function k1Nx(){ return sv4SAdd(sv4S(),1); }
function k1SL(s){ return sv4SL(s); }
function k1Alter(p){ if(p&&Number.isFinite(+p.alter)&&+p.alter>0)return +p.alter; const m=String(p&&p.geb||'').match(/^(\d{4})-(\d{2})-(\d{2})/); if(!m)return null;
  const d=new Date(), a=d.getFullYear()-+m[1]-((d.getMonth()+1<+m[2]||(d.getMonth()+1===+m[2]&&d.getDate()<+m[3]))?1:0); return a>0&&a<70?a:null; }
function k1W(id){ const w=V1.werte&&V1.werte[id]; return w?{ca:w[0],sicherheit:w[1],form:w[2],p24:w[3],rolle:w[4],signale:w[5]||[]}:{}; }
function k1Darf(){ return typeof sv4Can==='function'&&sv4Can(); }
function k1Schreib(){ return ['admin','vorstand','planer','trainer'].includes(svRole()); }

/* ---------- Spieler im Plan ---------- */
function k1Pool(){
  const s=k1S(), nx=k1Nx();
  return players.filter(p=>{ if(!p||p.isJugend)return false; const t=sv4Team(p,s), r=sv4SS(p.id,nx); return t==='1'||t==='2'||(r&&(r.team==='1'||r.team==='2'));});
}
function k1Sp(p){
  const s=k1S(), nx=k1Nx(), w=k1W(p.id), jetzt=sv4Team(p,s), alter=k1Alter(p);
  const st=V1K.planStatus(sv4SS(p.id,nx),{team:jetzt==='1'||jetzt==='2'?jetzt:null,rolleAktuell:w.rolle,alter});
  return {id:p.id,name:p.name,pos:p.pos,pos2:p.pos2||[],fuss:p.fuss,alter,ca:w.ca??null,p24:w.p24??null,sicherheit:w.sicherheit||null,form:w.form,
    jetzt,status:st.status,team:st.team,rolle:st.rolle,rolleAnnahme:st.rolleAnnahme,annahme:st.annahme,quelle:st.quelle,p};
}
function k1Alle(){ return k1Pool().map(k1Sp); }
async function k1Speichern(id,status,rolle,team){
  const p=sv4P(id); if(!p)return; const nx=k1Nx(), jetzt=sv4Team(p,k1S());
  const z=V1K.planZeile(status,rolle,team);
  if(status==='eingeplant'&&team&&jetzt&&team!==jetzt)z.zukunft=team==='1'?'hoch':'runter';
  if(status==='eingeplant'&&!jetzt)z.zukunft='neu';
  await sv4SSSet(id,nx,z);
  k1SyncBald();
}
/* ---------- Plan je Mannschaft (System, Ziel, Plätze) ---------- */
function k1PlanLaden(force){
  if(K1.planP)return K1.planP; if(K1.planGeladen&&!force)return Promise.resolve();
  K1.planP=(async()=>{ try{ const {data,error}=await SVB.sb.from('kader_plan_v1').select('*'); if(error)throw error;
    K1.plan={}; (data||[]).forEach(r=>{ K1.plan[r.saison+'|'+r.team]=r; }); }catch(e){ console.warn('Kaderplan',e); } K1.planGeladen=true; K1.planP=null; })();
  return K1.planP;
}
function k1Plan(s,t){ return K1.plan[s+'|'+t]||{saison:s,team:t,system:'4-2-3-1',system_alt:null,ziel:t==='1'?'KLA':'KLD',plan_slots:{},top_slots:{}}; }
async function k1PlanSet(s,t,upd){ const {data,error}=await SVB.sb.rpc('kader_plan_v1_set',{p:Object.assign({saison:s,team:t},upd)}); if(error)throw new Error(error.message); K1.plan[s+'|'+t]=data; return data; }

/* ---------- Jugendpipeline ---------- */
function k1JuLaden(force){
  if(K1.juP)return K1.juP; if(K1.ju&&!force)return Promise.resolve();
  K1.juP=(async()=>{ try{ const {data,error}=await SVB.sb.from('jugend_kader').select('*').order('jahrgang').limit(400); if(error)throw error; K1.ju=data||[]; }catch(e){ K1.ju=[]; }
    K1.juP=null; })();
  return K1.juP;
}
function k1Jugend(){ return (K1.ju||[]).filter(j=>j.aktiv!==false&&(j.team==='A'||j.herren_relevant)); }
function k1JuSp(j){ return {id:'ju:'+j.id,name:j.name,pos:j.pos,pos2:String(j.pos2||'').split(',').filter(Boolean),persp:j.persp_herren||j.persp_jugend||'offen',zeitfenster:j.zeitfenster,entwicklung:j.entwicklung}; }

/* ---------- Bedarfe berechnen und speichern (eine Wahrheit für Kader und Scouting) ---------- */
function k1BedarfeBerechnen(team){
  const nx=k1Nx(), alle=k1Alle(), pl=k1Plan(nx,team), pl2=k1Plan(nx,'2');
  const fix={}; Object.entries(pl.plan_slots||{}).forEach(([k,v])=>{ if(v&&!String(v).startsWith('kand:'))fix[k]=v; });
  return V1K.bedarfe({saison:nx,team,system:pl.system,system2:pl2.system,ziel:pl.ziel,kader:alle,zweite:team==='1'?alle:[],jugend:k1Jugend().map(k1JuSp),fix})
    .map(b=>Object.assign(b,{titel:`${V1K.POSL[b.pos]}: ${K1_ART[b.art]}`}));
}
function k1SyncBald(){ clearTimeout(K1.syncT); K1.syncT=setTimeout(()=>k1Sync().catch(e=>console.warn('Bedarf',e)),900); }
async function k1Sync(){
  if(!k1Darf()||K1.syncBusy||!V1.werte)return; K1.syncBusy=true;
  try{ const nx=k1Nx();
    for(const t of ['1','2']){ const L=k1BedarfeBerechnen(t).map(b=>({schluessel:b.schluessel,titel:b.titel,pos:b.pos,rolle:b.rolle,art:b.art,ref:b.ref,ziel:b.ziel,grund:b.grund,
        intern:b.intern.map(x=>({id:x.id,name:x.name,stufe:x.stufe,ca:x.ca,hinweis:x.hinweis})),kriterien:b.kriterien,extern:b.extern}));
      const sig=JSON.stringify(L); if(K1.syncSig[nx+t]===sig)continue;
      const {error}=await SVB.sb.rpc('bedarf_v1_sync',{p_saison:nx,p_team:t,p_liste:L}); if(error)throw new Error(error.message); K1.syncSig[nx+t]=sig; }
    const {data}=await SVB.sb.from('bedarfe').select('*').order('created_at',{ascending:false}).limit(400); if(data)SV4.bed=data;
  }finally{ K1.syncBusy=false; }
}
function k1BedarfObj(schluessel){ return (SV4.bed||[]).find(b=>b.schluessel===schluessel)||null; }

/* ---------- Spielfeld (Plan-Elf, Top-Elf) ---------- */
function k1Pitch(slots,opt){
  opt=opt||{};
  return `<div class="k1-pitch${opt.klein?' klein':''}"><i class="k1-l mid"></i><i class="k1-l kreis"></i><i class="k1-l box o"></i><i class="k1-l box u"></i>
    ${slots.map(s=>{ const p=s.id?sv4P(s.id):null, k=s.kand, w=p?k1W(p.id):{};
      const name=p?p.name.split(' ').slice(-1)[0]:k?k.name.split(' ').slice(-1)[0]:'offen';
      const ca=p?w.ca:k?k.ca:null;
      return `<button type="button" class="k1-slot${p?'':k?' kand':' leer'}${s.fix?' fix':''}${p&&s.positionsgerecht===false?' aus':''}" style="left:${s.x}%;top:${s.y}%" data-slot="${s.i}" title="${k1E(V1K.POSL[s.pos])}">
        <b>${ca!=null?ca:'?'}</b><span>${k1E(name)}</span><small>${s.pos}${k?' · unbestätigt':''}${p&&s.positionsgerecht===false?' · Aushilfe':''}</small></button>`; }).join('')}</div>`;
}
function k1ElfSchnitt(slots){ const v=slots.map(s=>s.id?k1W(s.id).ca:null).filter(x=>x!=null); return v.length?Math.round(v.reduce((a,b)=>a+b,0)/v.length):null; }
function k1Kandidaten(nx,team){   // vorgemerkte externe Kandidaten (Entscheidung „vormerken“), noch nicht verpflichtet
  const bed=new Map((SV4.bed||[]).filter(b=>b.saison===nx&&b.team===team).map(b=>[b.id,b]));
  return (SV4.bk||[]).filter(k=>bed.has(k.bedarf_id)&&k.entscheidung==='vormerken').map(k=>{ const p=sv4P(k.player_id), b=bed.get(k.bedarf_id);
    return p?{id:p.id,name:p.name,pos:p.pos,pos2:p.pos2||[],ca:k1W(p.id).ca,bpos:b.pos_v1,bedarf:b.id}:null; }).filter(Boolean);
}

/* ---------- Planung ---------- */
function k1Panel(id){ let P=document.getElementById('panel-'+id); if(P)return P; const ref=document.getElementById('panel-kader')||document.querySelector('main .panel');
  if(!ref)return null; P=document.createElement('section'); P.className='panel'; P.id='panel-'+id; ref.parentNode.insertBefore(P,ref.nextSibling); return P; }
function k1Kopf(t,sub){ return `<div class="k1-kopf"><div><h2>${k1E(t)}</h2>${sub?`<p>${sub}</p>`:''}</div></div>`; }
function k1TeamUm(cur,attr){ return `<div class="k1-seg" role="tablist">${['1','2'].map(t=>`<button type="button" class="${cur===t?'on':''}" ${attr}="${t}">${t}. Mannschaft</button>`).join('')}</div>`; }
function k1Lade(P,txt){ P.innerHTML=`<div class="card"><div class="empty">${k1E(txt||'Lade …')}</div></div>`; }
// Stärken fehlen: nicht endlos „wird geladen“ zeigen, sondern nachladen und beim zweiten Fehlversuch sagen, was los ist
function k1Fehler(P,again){
  P.innerHTML=`<div class="card"><div class="empty"><p><b>Die Stärken konnten nicht geladen werden.</b></p>
    <p class="note">Die Kaderübersicht braucht die Werte aus der Bewertung. Meist hilft ein neuer Versuch.</p>
    <p><button type="button" class="btn" id="k1Neu">Nochmal versuchen</button></p></div></div>`;
  const b=P.querySelector('#k1Neu'); if(b)b.onclick=()=>{ K1.werteVersuch=0; k1Lade(P,'Stärken werden geladen …'); v1Laden().then(()=>setTimeout(again,0)); };
}
function k1Bereit(P,again){
  if(!V1.werte){
    K1.werteVersuch=(K1.werteVersuch||0)+1;
    if(K1.werteVersuch===8||K1.werteVersuch===24){ k1Lade(P,'Stärken werden geladen …'); v1Laden().then(()=>setTimeout(again,400)); return false; }
    if(K1.werteVersuch>40){ k1Fehler(P,again); return false; }
    k1Lade(P,'Stärken werden geladen …'); setTimeout(again,800); return false; }
  K1.werteVersuch=0;
  if(typeof SV4!=='undefined'&&!SV4.loaded){ k1Lade(P); if(SV4.loading)setTimeout(again,400); else sv4Load().then(()=>setTimeout(again,0)); return false; }
  if(!K1.planGeladen){ k1Lade(P); k1PlanLaden().then(again); return false; }
  if(K1.ju===null){ k1JuLaden().then(again); }
  return true;
}
function k1Planung(){
  const P=k1Panel('kplan'); if(!P||!k1Bereit(P,k1Planung))return;
  const nx=k1Nx(), t=K1.team, pl=k1Plan(nx,t), alle=k1Alle(), mein=alle.filter(s=>(s.status==='eingeplant'&&s.team===t)||(s.status!=='eingeplant'&&s.jetzt===t));
  const ein=mein.filter(s=>s.status==='eingeplant'), offen=mein.filter(s=>s.status==='offen'), weg=mein.filter(s=>s.status==='abgang');
  const fix={}; Object.entries(pl.plan_slots||{}).forEach(([k,v])=>{ if(v&&!String(v).startsWith('kand:'))fix[k]=v; });
  const E=V1K.elf(pl.system,ein.map(s=>({id:s.id,ca:s.ca,pos:s.pos,pos2:s.pos2})),fix);
  const kand=k1Kandidaten(nx,t); E.forEach(s=>{ if(!s.id){ const k=kand.find(c=>c.bpos===s.pos); if(k)s.kand=k; } });
  const B=k1BedarfeBerechnen(t), annahmen=ein.filter(s=>s.annahme||s.rolleAnnahme).length;
  const gs=k1Gespraeche(mein);
  const sel=(id,cur,opts,ph)=>`<select data-k1="${id}">${ph?`<option value="">${ph}</option>`:''}${opts.map(([k,l])=>`<option value="${k}"${k===cur?' selected':''}>${k1E(l)}</option>`).join('')}</select>`;
  P.innerHTML=`${k1Kopf('Planung',`Saison ${k1SL(nx)} · laufend ${k1SL(k1S())}`)}
    <div class="k1-leiste">${k1TeamUm(t,'data-k1t')}
      <label>System ${sel('system',pl.system,K1_SYS.map(x=>[x,x]))}</label>
      <label>Alternativ ${sel('system_alt',pl.system_alt||'',K1_SYS.map(x=>[x,x]),'keins')}</label>
      <label>Ziel ${sel('ziel',pl.ziel||'',Object.keys(V1K.LIGA).filter(k=>V1K.ANKER[k]<=81).map(k=>[k,V1K.LIGA[k]]))}</label></div>
    <div class="k1-zeile"><b>${ein.length}</b> eingeplant <i>|</i> <b>${offen.length}</b> offen <i>|</i> <b>${B.filter(b=>b.extern!=='gedeckt').length}</b> Bedarfe${weg.length?` <i>|</i> <b>${weg.length}</b> Abgänge`:''}${annahmen?` <i>|</i> <span class="k1-ann">${annahmen} vorläufige Annahmen</span>`:''}</div>
    <div class="k1-grid">
      <div class="card k1-pl"><h3 class="trh">${SVI('pitch')} Plan-Elf ${k1SL(nx)} <small>Ø ${k1ElfSchnitt(E)??'?'}</small></h3>${k1Pitch(E,{})}
        <p class="note small">Tippen zum Umstellen (Planungsentscheidung, ändert keine Stärke). Gestrichelt: vorgemerkter externer Kandidat, noch nicht verpflichtet.</p></div>
      <div class="k1-seite">
        <div class="card"><h3 class="trh">${SVI('target')} Handlungsbedarf <small>${B.length}</small></h3>${B.length?B.map(b=>k1BedarfHtml(b)).join(''):'<p class="note">Kein Bedarf: alle Positionen und Rollen sind abgedeckt.</p>'}</div>
        ${offen.length||annahmen?`<div class="card"><h3 class="trh">${SVI('help')} Offene Entscheidungen</h3>
          ${offen.map(s=>`<div class="k1-oe"><span class="lnk" data-svp="${k1E(s.id)}">${k1E(s.name)}</span><small>Zukunft offen</small><button class="btn sm ghost" type="button" data-k1g="${k1E(s.id)}">Gespräch</button></div>`).join('')}
          ${annahmen?`<div class="k1-oe"><span>${annahmen} Spieler nur als Annahme eingeplant</span><button class="btn sm" type="button" data-k1best>${SVI('check')} Alle bestätigen</button></div>`:''}</div>`:''}
        ${gs.length?`<div class="card"><h3 class="trh">${SVI('chat')} Gespräche und Wiedervorlagen</h3>${gs.map(g=>`<div class="k1-oe"><span class="lnk" data-svp="${k1E(g.pid)}">${k1E(g.name)}</span><small>${k1E(g.text)}</small><button class="btn sm ghost" type="button" data-k1g="${k1E(g.pid)}">${g.gid?'Öffnen':'Gespräch'}</button></div>`).join('')}</div>`:''}
      </div></div>
    <div class="card"><h3 class="trh">${SVI('users')} Spieler im Plan <small>${mein.length}</small></h3>${k1Liste(mein)}</div>
    ${k1JugendHtml(t)}`;
  k1BindPlanung(P,E,pl,nx,t);
  k1SyncBald();
}
function k1BedarfHtml(b){
  const o=k1BedarfObj(b.schluessel);
  return `<div class="k1-b ext-${b.extern}"><div class="k1-bh"><b>${k1E(b.titel)}</b><span class="k1-c">${k1E(K1_EXT[b.extern])}</span></div>
    <p>${k1E(b.grund)} Zielniveau ${b.ziel}.</p>
    ${b.intern.length?`<ol class="k1-int">${b.intern.slice(0,4).map(x=>`<li><span class="k1-st ${x.stufe}">${k1E(K1_STUFE[x.stufe])}</span> <span class="lnk" data-svp="${k1E(x.id)}">${k1E(x.name)}</span>${x.ca!=null?` <b>${x.ca}</b>`:''} <small>${k1E(x.hinweis)}</small></li>`).join('')}</ol>`:'<p class="note small">Intern keine Option: Lösung extern.</p>'}
    ${b.extern!=='gedeckt'?`<button class="btn sm ghost" type="button" data-k1scout="${k1E(b.schluessel)}"${o?'':' disabled title="wird gerade gespeichert"'}>${SVI('search')} Im Scouting öffnen</button>`:''}</div>`;
}
function k1Liste(L){
  const ord={TW:0,IV:1,AV:2,DM:3,MF:3,OM:4,FL:5,ST:6};
  L=L.slice().sort((a,b)=>(ord[V1K.posV1(a.pos)]??9)-(ord[V1K.posV1(b.pos)]??9)||(b.ca||0)-(a.ca||0));
  const opt=(o,cur)=>Object.entries(o).map(([k,l])=>`<option value="${k}"${k===cur?' selected':''}>${k1E(l)}</option>`).join('');
  return `<div class="k1-tw"><table class="k1-t"><thead><tr><th>Spieler</th><th>Pos</th><th>Stärke</th><th>24M</th><th>Status</th><th>Rolle</th><th>Team</th></tr></thead><tbody>
    ${L.map(s=>`<tr data-id="${k1E(s.id)}"><td><span class="lnk" data-svp="${k1E(s.id)}">${k1E(s.name)}</span>${s.annahme?' <i class="k1-ann" title="vorläufige Annahme, noch nicht bestätigt">Annahme</i>':''}</td>
      <td>${k1E(s.pos||'?')}${s.pos2.length?`<small> / ${k1E(s.pos2.join(', '))}</small>`:''}</td><td><b>${s.ca??'?'}</b>${s.sicherheit==='niedrig'?' <small title="Sicherheit niedrig">?</small>':''}</td><td>${s.p24??''}</td>
      <td><select data-k1s="status"${k1Schreib()?'':' disabled'}>${opt(K1_STATUS,s.status||'offen')}</select></td>
      <td><select data-k1s="rolle"${k1Schreib()?'':' disabled'}>${opt(K1_ROLLE,s.rolle||'offen')}</select>${s.rolleAnnahme?' <i class="k1-ann" title="Vorschlag aus der aktuellen Rolle">Vorschlag</i>':''}</td>
      <td><select data-k1s="team"${k1Schreib()&&s.status==='eingeplant'?'':' disabled'}><option value="1"${s.team==='1'?' selected':''}>1.</option><option value="2"${s.team==='2'?' selected':''}>2.</option></select></td></tr>`).join('')}</tbody></table></div>`;
}
function k1BindListe(P,again){
  P.querySelectorAll('tr[data-id] select[data-k1s]').forEach(sel=>sel.onchange=async()=>{ const tr=sel.closest('tr'), id=tr.dataset.id, s=k1Sp(sv4P(id));
    const st=tr.querySelector('[data-k1s="status"]').value, ro=tr.querySelector('[data-k1s="rolle"]').value, tm=tr.querySelector('[data-k1s="team"]').value||s.team||s.jetzt;
    sel.disabled=true; try{ await k1Speichern(id,st,ro,tm); kToast('✓ Plan gespeichert'); }catch(e){ kToast('⚠️ '+e.message); } again(); }); }
function k1BindPlanung(P,E,pl,nx,t){
  P.querySelectorAll('[data-svp]').forEach(x=>x.onclick=()=>openModal(x.dataset.svp));
  P.querySelectorAll('[data-k1t]').forEach(b=>b.onclick=()=>{ K1.team=b.dataset.k1t; k1Planung(); });
  P.querySelectorAll('.k1-leiste select[data-k1]').forEach(s=>s.onchange=async()=>{ try{ await k1PlanSet(nx,t,{[s.dataset.k1]:s.value}); kToast('✓ Gespeichert'); }catch(e){ kToast('⚠️ '+e.message); } k1Planung(); });
  k1BindListe(P,k1Planung);
  P.querySelectorAll('[data-k1g]').forEach(b=>b.onclick=()=>{ const g=k1LetztesGespraech(b.dataset.k1g); kd4GesprEditor(b.dataset.k1g,g&&g.naechstes_am?g.id:null); });
  const best=P.querySelector('[data-k1best]'); if(best)best.onclick=async()=>{ best.disabled=true; const L=k1Alle().filter(s=>s.status==='eingeplant'&&(s.team===t)&&(s.annahme||s.rolleAnnahme));
    try{ for(const s of L)await k1Speichern(s.id,'eingeplant',s.rolle||'offen',s.team); kToast(`✓ ${L.length} bestätigt`); }catch(e){ kToast('⚠️ '+e.message); } k1Planung(); };
  P.querySelectorAll('[data-k1scout]').forEach(b=>b.onclick=()=>{ const o=k1BedarfObj(b.dataset.k1scout); if(o){ S1.bedarf=o.id; goTab('sbedarf'); } });
  P.querySelectorAll('.k1-pl [data-slot]').forEach(b=>b.onclick=()=>k1SlotWahl(E[+b.dataset.slot],nx,t,'plan_slots',k1Alle().filter(s=>s.status==='eingeplant'&&s.team===t),k1Planung));
  k1JugendBind(P);
}
function k1LetztesGespraech(pid){ return (SV4.gs||[]).filter(g=>g.player_id===pid).sort((a,b)=>b.datum.localeCompare(a.datum))[0]||null; }
function k1Gespraeche(mein){
  const heute=sv4Today(), bald=sv4SAdd?null:null; const L=[];
  mein.forEach(s=>{ const g=k1LetztesGespraech(s.id);
    if(g&&g.naechstes_am){ const d=(Date.parse(g.naechstes_am)-Date.parse(heute))/864e5; if(d<=21)L.push({pid:s.id,name:s.name,gid:g.id,d,text:(d<0?'überfällig seit ':'Wiedervorlage ')+sv4D(g.naechstes_am)+(g.entscheidung?' · '+g.entscheidung:'')}); }
    else if(s.status==='offen'&&!g)L.push({pid:s.id,name:s.name,d:0,text:'noch kein Gespräch geführt'}); });
  return L.sort((a,b)=>a.d-b.d).slice(0,12);
}
function k1SlotWahl(slot,saison,team,feld,kandidaten,again){
  if(!slot||!k1Schreib())return;
  const L=kandidaten.map(s=>({s,pa:V1K.passung(s,slot.pos)})).filter(x=>x.pa>=.5).sort((a,b)=>(b.pa>=.8)-(a.pa>=.8)||(b.s.ca||0)-(a.s.ca||0)).slice(0,20);
  const M=svModal(`<h2 style="margin:0 0 4px">${k1E(V1K.POSL[slot.pos])}</h2><p class="note">Wer soll hier spielen? Das ist eine Planungsentscheidung, die Stärke ändert sich nicht.</p>
    <div class="k1-wahl">${L.map(x=>`<button type="button" class="k1-w${x.s.id===slot.id?' on':''}" data-w="${k1E(x.s.id)}"><b>${x.s.ca??'?'}</b><span>${k1E(x.s.name)}</span><small>${k1E(svPosVon(x.s)||'')}${x.pa<.8?' · Aushilfe':''}</small></button>`).join('')||'<p class="note">Kein passender Spieler.</p>'}</div>
    <div class="btnrow"><button class="btn ghost" type="button" data-w="">Automatisch</button><button class="btn ghost" type="button" data-x>Schließen</button></div>`);
  M.querySelector('[data-x]').onclick=()=>closeOverlay();
  M.querySelectorAll('[data-w]').forEach(b=>b.onclick=async()=>{ const pl=k1Plan(saison,team), slots=Object.assign({},pl[feld]||{});
    Object.keys(slots).forEach(k=>{ if(slots[k]===b.dataset.w)delete slots[k]; }); if(b.dataset.w)slots[slot.i]=b.dataset.w; else delete slots[slot.i];
    try{ await k1PlanSet(saison,team,{[feld]:slots}); closeOverlay(); again(); }catch(e){ kToast('⚠️ '+e.message); } });
}
/* ---------- Herren-Jugendpipeline (§4.8) ---------- */
const K1_ZF={sofort:'sofort',['12m']:'~12 Monate',['24m']:'~24 Monate',spaeter:'später'};
const K1_PE={erste:'Erste',zweite:'Zweite',offen:'offen'};
function k1JugendHtml(t){
  if(!(typeof sv4Jugend==='function'&&sv4Jugend()))return '';
  const J=k1Jugend(), weitere=(K1.ju||[]).filter(j=>j.aktiv!==false&&j.team==='B'&&!j.herren_relevant);
  const konflikt=j=>j.persp_jugend&&j.persp_herren&&j.persp_jugend!==j.persp_herren;
  return `<details class="card k1-ju"${K1.juOffen?' open':''}><summary><h3 class="trh">${SVI('sprout')} Jugend für die Herren <small>${J.length}</small></h3></summary>
    <p class="note small">Nur A-Jugend und ausgewählte ältere B-Jugendliche. Zweimal im Jahr kurz bestätigen genügt. Keine Senior-Stärke für Jugendliche.</p>
    ${J.length?`<div class="k1-tw"><table class="k1-t"><thead><tr><th>Name</th><th>Jg.</th><th>Team</th><th>Pos</th><th>Herren</th><th>Zeitfenster</th><th>Entwicklung</th><th>Stand</th></tr></thead><tbody>
      ${J.map(j=>`<tr><td><button type="button" class="lnk" data-k1j="${k1E(j.id)}">${k1E(j.name)}</button>${konflikt(j)?' <i class="k1-ann" title="Jugendtrainer und Herren sehen es unterschiedlich">abstimmen</i>':''}</td><td>${j.jahrgang||''}</td><td>${k1E(j.team)}</td>
        <td>${k1E(j.pos||'?')}${j.pos2?`<small> / ${k1E(j.pos2)}</small>`:''}</td><td>${k1E(K1_PE[j.persp_herren||j.persp_jugend]||'offen')}</td><td>${k1E(K1_ZF[j.zeitfenster]||'offen')}</td><td>${k1E(j.entwicklung||'')}</td>
        <td><small>${j.einschaetzung_am?sv4D(j.einschaetzung_am)+(j.einschaetzung_von?' · '+k1E(j.einschaetzung_von):''):'nicht bestätigt'}</small></td></tr>`).join('')}</tbody></table></div>`:'<p class="note">Noch niemand in der Pipeline.</p>'}
    ${weitere.length?`<p class="note small">B-Jugend aufnehmen: ${weitere.slice(0,30).map(j=>`<button type="button" class="k1-chip" data-k1jadd="${k1E(j.id)}">+ ${k1E(j.name)}</button>`).join(' ')}</p>`:''}
    ${J.length?`<div class="btnrow"><button class="btn sm ghost" type="button" data-k1jall>${SVI('check')} Alle Einschätzungen bestätigen</button></div>`:''}</details>`;
}
async function k1JuSet(id,upd){ const {error}=await SVB.sb.from('jugend_kader').update(upd).eq('id',id); if(error)throw new Error(error.message); const j=(K1.ju||[]).find(x=>x.id===id); if(j)Object.assign(j,upd); k1SyncBald(); }
function k1JugendBind(P){
  const d=P.querySelector('.k1-ju'); if(!d)return; d.addEventListener('toggle',()=>{ K1.juOffen=d.open; });
  P.querySelectorAll('[data-k1jadd]').forEach(b=>b.onclick=async()=>{ try{ await k1JuSet(b.dataset.k1jadd,{herren_relevant:true}); }catch(e){ kToast('⚠️ '+e.message); } k1Planung(); });
  const all=P.querySelector('[data-k1jall]'); if(all)all.onclick=async()=>{ all.disabled=true; try{ for(const j of k1Jugend())await k1JuSet(j.id,{einschaetzung_am:sv4Today(),einschaetzung_von:(SVU&&SVU.name)||null}); kToast('✓ Bestätigt'); }catch(e){ kToast('⚠️ '+e.message); } k1Planung(); };
  P.querySelectorAll('[data-k1j]').forEach(b=>b.onclick=()=>k1JuForm(b.dataset.k1j));
}
function k1JuForm(id){
  const j=(K1.ju||[]).find(x=>x.id===id); if(!j)return;
  const s=(n,cur,o)=>`<select id="${n}"><option value="">offen</option>${Object.entries(o).map(([k,l])=>`<option value="${k}"${cur===k?' selected':''}>${k1E(l)}</option>`).join('')}</select>`;
  const M=svModal(`<h2 style="margin:0 0 6px">${k1E(j.name)}</h2><p class="note">Jahrgang ${j.jahrgang||'?'} · ${k1E(j.team)}-Jugend</p>
    <div class="editgrid"><div class="field"><label>Position</label>${s('kjp',j.pos,{TW:'TW',IV:'IV',AV:'AV',ZM:'ZM',OM:'OM','Flügel':'Flügel',ST:'ST'})}</div>
      <div class="field"><label>Nebenposition</label><input id="kjp2" maxlength="40" value="${k1E(j.pos2||'')}"></div>
      <div class="field"><label>Herrenperspektive (Jugendtrainer)</label>${s('kjj',j.persp_jugend,K1_PE)}</div>
      <div class="field"><label>Herrenperspektive (Herren)</label>${s('kjh',j.persp_herren,K1_PE)}</div>
      <div class="field"><label>Zeitfenster</label>${s('kjz',j.zeitfenster,K1_ZF)}</div>
      <div class="field"><label>Entwicklungsperspektive</label>${s('kje',j.entwicklung,{gering:'gering',normal:'normal',hoch:'hoch'})}</div></div>
    <label class="jutog"><input type="checkbox" id="kjr"${j.herren_relevant||j.team==='A'?' checked':''}${j.team==='A'?' disabled':''}> In der Herren-Pipeline</label>
    <div class="btnrow"><button class="btn" type="button" id="kjok">${SVI('check')} Speichern</button><button class="btn ghost" type="button" id="kjx">Abbrechen</button></div>`);
  M.querySelector('#kjx').onclick=()=>closeOverlay();
  M.querySelector('#kjok').onclick=async()=>{ const v=x=>M.querySelector(x).value||null;
    try{ await k1JuSet(id,{pos:v('#kjp'),pos2:v('#kjp2'),persp_jugend:v('#kjj'),persp_herren:v('#kjh'),zeitfenster:v('#kjz'),entwicklung:v('#kje'),herren_relevant:j.team==='A'||M.querySelector('#kjr').checked,
      einschaetzung_am:sv4Today(),einschaetzung_von:(SVU&&SVU.name)||null}); closeOverlay(); kToast('✓ Gespeichert'); k1Planung(); }catch(e){ kToast('⚠️ '+e.message); } };
}

/* ---------- Kaderübersicht ---------- */
function k1Uebersicht(){
  const P=k1Panel('kueber'); if(!P||!k1Bereit(P,k1Uebersicht))return;
  const f=K1.f, alle=k1Alle().filter(s=>f.team==='beide'||s.team===f.team||(!s.team&&s.jetzt===f.team))
    .filter(s=>!f.pos||V1K.posV1(s.pos)===f.pos||(f.pos!=='MF'&&V1K.passung(s,f.pos)>=.8)).filter(s=>!f.status||s.status===f.status);
  const k=K1.sort.k, d=K1.sort.d, val=s=>k==='name'?s.name:k==='team'?(s.team||s.jetzt||'9'):k==='pos'?String(s.pos||''):k==='sicherheit'?({hoch:3,mittel:2,niedrig:1}[s.sicherheit]||0):s[k]??-1;
  alle.sort((a,b)=>{ const x=val(a),y=val(b); return (x<y?-1:x>y?1:0)*d||a.name.localeCompare(b.name,'de'); });
  const th=(key,l)=>`<th><button type="button" class="k1-sort${k===key?' on':''}" data-k1o="${key}">${l}${k===key?(d<0?' ↓':' ↑'):''}</button></th>`;
  const opt=(o,cur)=>Object.entries(o).map(([x,l])=>`<option value="${x}"${x===cur?' selected':''}>${k1E(l)}</option>`).join('');
  P.innerHTML=`${k1Kopf('Kaderübersicht',`Erste und Zweite in einer sportlichen Sicht · Planung ${k1SL(k1Nx())}`)}
    <div class="k1-leiste"><div class="k1-seg">${[['beide','Beide'],['1','1. Mannschaft'],['2','2. Mannschaft']].map(([x,l])=>`<button type="button" class="${f.team===x?'on':''}" data-k1f="team" data-v="${x}">${l}</button>`).join('')}</div>
      <label>Position <select data-k1fs="pos"><option value="">alle</option>${V1K.POS.map(x=>`<option${f.pos===x?' selected':''}>${x}</option>`).join('')}</select></label>
      <label>Status <select data-k1fs="status"><option value="">alle</option>${opt(K1_STATUS,f.status)}</select></label></div>
    <div class="card"><div class="k1-tw"><table class="k1-t k1-ue"><thead><tr>${th('name','Spieler')}${th('team','Mannschaft')}${th('pos','Position')}${th('ca','Stärke')}${th('p24','24M')}${th('sicherheit','Sicherheit')}<th>Rolle</th><th>Status</th></tr></thead><tbody>
      ${alle.map(s=>`<tr data-id="${k1E(s.id)}"><td><span class="lnk" data-svp="${k1E(s.id)}">${k1E(s.name)}</span></td><td>${s.jetzt?s.jetzt+'.':'neu'}${s.team&&s.team!==s.jetzt?` → ${s.team}.`:''}</td>
        <td>${k1E(s.pos||'?')}${s.pos2.length?`<small> / ${k1E(s.pos2.join(', '))}</small>`:''}</td><td><b>${s.ca??'?'}</b></td><td>${s.p24??''}</td><td><span class="v1-c s-${k1E(s.sicherheit)}">${k1E(s.sicherheit||'?')}</span></td>
        <td><select data-k1s="rolle"${k1Schreib()?'':' disabled'}>${opt(K1_ROLLE,s.rolle||'offen')}</select></td><td><select data-k1s="status"${k1Schreib()?'':' disabled'}>${opt(K1_STATUS,s.status||'offen')}</select>
        <select data-k1s="team" hidden><option value="${k1E(s.team||s.jetzt||'1')}" selected></option></select></td></tr>`).join('')}</tbody></table></div>
      <p class="note small">${alle.length} Spieler. Stärke ändert sich durch Planung nie.</p>
      <details class="k1-leg"><summary>${SVI('info')} Was bedeuten Stärke, 24M und Sicherheit?</summary>
        <p><b>Stärke</b> sagt, in welcher Liga der Spieler ein typischer Stammspieler wäre: ${V1_ANKER.slice(0,6).map(([n,l])=>n+' '+l).join(', ')}.</p>
        <p><b>24M</b> ist unsere vorsichtige Erwartung, wo er in 24 Monaten steht, aus Verlauf, Alter und Perspektive.</p>
        <p><b>Sicherheit</b> sagt, wie belastbar die Zahl ist: hoch bei vielen Einsätzen und stimmigem Bild, niedrig bei wenig Daten. Sie sagt nichts darüber, ob ein Spieler gut ist.</p>
        <p>Im Spielerprofil steht daneben noch der MScore auf der Karte. Das ist der ältere Wert mit anderer Skala, deshalb weichen die Zahlen ab. Für Kaderplanung und Top-Elf zählt die Stärke.</p></details></div>`;
  P.querySelectorAll('[data-svp]').forEach(x=>x.onclick=()=>openModal(x.dataset.svp));
  P.querySelectorAll('[data-k1o]').forEach(b=>b.onclick=()=>{ const key=b.dataset.k1o; if(K1.sort.k===key)K1.sort.d*=-1; else { K1.sort.k=key; K1.sort.d=key==='name'||key==='team'||key==='pos'?1:-1; } k1Uebersicht(); });
  P.querySelectorAll('[data-k1f]').forEach(b=>b.onclick=()=>{ K1.f[b.dataset.k1f]=b.dataset.v; k1Uebersicht(); });
  P.querySelectorAll('[data-k1fs]').forEach(s=>s.onchange=()=>{ K1.f[s.dataset.k1fs]=s.value; k1Uebersicht(); });
  k1BindListe(P,k1Uebersicht);
}

/* ---------- Top-Elf ---------- */
function k1TopElf(){
  const P=k1Panel('topelf'); if(!P||!k1Bereit(P,k1TopElf))return;
  const heute=K1.top==='heute', t=K1.topTeam, s=heute?k1S():k1Nx(), pl=k1Plan(heute?k1Nx():s,t), plHeute=k1Plan(k1S(),t);
  const sys=pl.system, feld=heute?'top_slots':'plan_slots', quelleS=heute?k1S():k1Nx();
  const kader=heute?players.filter(p=>!p.isJugend&&sv4Team(p,k1S())===t).map(k1Sp):k1Alle().filter(x=>x.status==='eingeplant'&&x.team===t);
  const fixRoh=(heute?plHeute.top_slots:pl.plan_slots)||{}, fix={}; Object.entries(fixRoh).forEach(([k,v])=>{ if(v&&!String(v).startsWith('kand:'))fix[k]=v; });
  const E=V1K.elf(sys,kader.map(x=>({id:x.id,ca:x.ca,pos:x.pos,pos2:x.pos2})),fix);
  if(!heute){ const kand=k1Kandidaten(s,t); E.forEach(sl=>{ if(!sl.id){ const k=kand.find(c=>c.bpos===sl.pos); if(k)sl.kand=k; } }); }
  const inElf=new Set(E.map(x=>x.id).filter(Boolean)), bank=kader.filter(x=>!inElf.has(x.id)).sort((a,b)=>(b.ca||0)-(a.ca||0)).slice(0,9);
  P.innerHTML=`${k1Kopf('Top-Elf',heute?`Stärkste positionsgerechte Elf heute (${k1SL(k1S())}), ohne Abzug für Urlaub oder Verletzung`:`Plan-Elf ${k1SL(s)} aus dem Kaderplan, dieselben Daten wie in der Planung`)}
    <div class="k1-leiste"><div class="k1-seg">${[['heute','Heute'],['naechste','Nächste Saison']].map(([x,l])=>`<button type="button" class="${K1.top===x?'on':''}" data-k1top="${x}">${l}</button>`).join('')}</div>${k1TeamUm(t,'data-k1tt')}<span class="k1-sys">${k1E(sys)}</span></div>
    <div class="k1-grid"><div class="card k1-pl"><h3 class="trh">${SVI('pitch')} ${heute?'Heute':'Nächste Saison'} <small>Ø ${k1ElfSchnitt(E)??'?'}</small></h3>${k1Pitch(E,{})}
      <p class="note small">Tippen zum Umstellen. ${heute?'':'Leere Plätze sind offene Zielrollen, gestrichelt sind vorgemerkte Kandidaten (unbestätigt). '}Verschieben ändert keine Stärke.</p>
      ${Object.keys(fix).length?`<button class="btn sm ghost" type="button" data-k1reset>${SVI('refresh')} Automatisch aufstellen</button>`:''}</div>
      <div class="card"><h3 class="trh">${SVI('users')} Dahinter</h3>${bank.length?bank.map(x=>`<div class="k1-oe"><span class="lnk" data-svp="${k1E(x.id)}">${k1E(x.name)}</span><small>${k1E(x.pos||'')}</small><b>${x.ca??'?'}</b></div>`).join(''):'<p class="note">Niemand.</p>'}</div></div>`;
  P.querySelectorAll('[data-svp]').forEach(x=>x.onclick=()=>openModal(x.dataset.svp));
  P.querySelectorAll('[data-k1top]').forEach(b=>b.onclick=()=>{ K1.top=b.dataset.k1top; k1TopElf(); });
  P.querySelectorAll('[data-k1tt]').forEach(b=>b.onclick=()=>{ K1.topTeam=b.dataset.k1tt; k1TopElf(); });
  const r=P.querySelector('[data-k1reset]'); if(r)r.onclick=async()=>{ try{ await k1PlanSet(heute?k1S():s,t,{[feld]:{}}); }catch(e){ kToast('⚠️ '+e.message); } k1TopElf(); };
  P.querySelectorAll('[data-slot]').forEach(b=>b.onclick=()=>k1SlotWahl(E[+b.dataset.slot],heute?k1S():s,t,feld,kader,k1TopElf));
}

/* =====================================================================
   Navigation V1 (Kader, Scouting, Mannschaft): neue Reiter, alte leiten um, Rückweg über den Schalter
   ===================================================================== */
const V1NAV={alt:null,an:false,klassisch:false};
const V1_UMLEITUNG={kader:'kueber',gespr:'kplan',ejugend:'kplan',sxi:'topelf',elf:'topelf',kaderplan:'kueber',
  bedarf:'sbedarf',kandidaten:'skand',best:'entdecken',radar:'entdecken',eye:'entdecken',totw:'entdecken',jugend:'entdecken',cmp:'entdecken',scout:'entdecken'};
const V1_ENT_UNTER={best:'markt',radar:'radar',totw:'radar',jugend:'talente',cmp:'markt',scout:'markt',eye:'markt'};
function v1NavAn(){
  if(V1NAV.an)return; V1NAV.an=true;
  V1NAV.alt={kader:SV4_HUB.kader.tabs,scouting:SV4_HUB.scouting.tabs,mannschaft:SV4_HUB.mannschaft.tabs,spieltag:SV4_HUB.spieltag?SV4_HUB.spieltag.tabs:null,side:Object.assign({},SV4_SIDEKEY)};
  // Kader beginnt mit unserer Mannschaft (Liste mit den Stärken), die Planung der nächsten Saison kommt danach
  SV4_HUB.kader.tabs=[['kueber','Kaderübersicht'],['kplan','Planung'],['topelf','Top-Elf']];
  SV4_HUB.scouting.tabs=[['sbedarf','Bedarfe'],['skand','Kandidaten'],['blick','Beobachtung'],['entdecken','Entdecken']];
  SV4_HUB.mannschaft.tabs=[['training:uebersicht','Übersicht'],['training:players','Spieler'],['training:sessions','Training'],['training:games','Spiele'],['training:verf','Verfügbarkeit'],['training:orga','Organisation']];
  if(SV4_HUB.spieltag)SV4_HUB.spieltag.tabs=SV4_HUB.spieltag.tabs.filter(([k])=>k!=='totw');
  Object.assign(SV4_OF,{kplan:'kader',kueber:'kader',topelf:'kader',sbedarf:'scouting',skand:'scouting',entdecken:'scouting'});
  SV4_SIDEKEY.scouting='sbedarf'; SV4_SIDEKEY.kader='kueber';
  Object.assign(SV_PAGES,{kplan:['Kader','Planung der nächsten Saison: Plan-Elf, Bedarfe, offene Entscheidungen'],kueber:['Kader','Kaderübersicht: Erste und Zweite sportlich'],
    topelf:['Kader','Top-Elf heute und Plan-Elf nächste Saison'],sbedarf:['Scouting','Bedarfe aus dem Kaderplan'],skand:['Scouting','Kandidaten: Kontakt, Gespräch, Entscheidung'],
    entdecken:['Scouting','Entdecken: Markt, Radar, Rückkehrer, Talente']});
  if(SV_PAGES.blick)SV_PAGES.blick=['Scouting','Beobachtung: deine Spieler, jede Woche auf dem neuesten Stand'];
  try{ if(typeof TR!=='undefined'&&(!TR.view||TR.view==='home'))TR.view='uebersicht'; }catch(e){}
  // Alte Einträge, die unter V1 nur umleiten (Jugend-Einschätzung, Elf der Woche), aus Seitenleiste und Mehr-Menü nehmen
  try{ document.querySelectorAll('[data-tab="ejugend"],[data-sheet="ejugend"],[data-tab="totw"],[data-sheet="totw"]').forEach(b=>b.style.display='none'); }catch(e){}
  try{ const t=svCurTab(); if(V1_UMLEITUNG[t])goTab(t); else sv4HubBar(t); }catch(e){}
}
function v1NavAus(){ if(!V1NAV.an||!V1NAV.alt)return; V1NAV.an=false; SV4_HUB.kader.tabs=V1NAV.alt.kader; SV4_HUB.scouting.tabs=V1NAV.alt.scouting; SV4_HUB.mannschaft.tabs=V1NAV.alt.mannschaft;
  if(V1NAV.alt.spieltag)SV4_HUB.spieltag.tabs=V1NAV.alt.spieltag; Object.assign(SV4_SIDEKEY,V1NAV.alt.side); }
{ const _ta46=svTabAllowed; svTabAllowed=function(t){ if(['kplan','kueber','topelf','sbedarf','skand','entdecken'].includes(t))return V1.an&&k1Darf(); return _ta46.apply(this,arguments); }; }
// Mannschaft: Unterseiten gehören zu den neuen Reitern
{ const _sub46=sv4Sub; sv4Sub=function(tab){ const k=_sub46.apply(this,arguments); if(!V1NAV.an)return k;
  if(k==='training:injuries'||k==='training:urlaub')return 'training:verf';
  if(k==='training:material'||k==='kabine:abst'||k==='kabine:link'||k==='kabine:kontakte')return 'training:orga';
  if(k==='training:pflege'||k==='training:bet')return 'training:players';
  if(k==='training:home')return 'training:uebersicht';
  if(k==='gegner')return 'training:games';
  if(['scout','db','best','radar','gems','jugend','cmp','eye','totw'].includes(tab))return 'entdecken';
  return k; }; }
{ const _gt46=goTab; goTab=function(tab){
  if(V1NAV.an&&!V1NAV.klassisch&&V1_UMLEITUNG[tab]&&svTabAllowed(V1_UMLEITUNG[tab])){ if(V1_ENT_UNTER[tab])S1.ent=V1_ENT_UNTER[tab]; tab=V1_UMLEITUNG[tab]; }
  V1NAV.klassisch=false;
  if(['kplan','kueber','topelf','sbedarf','skand','entdecken'].includes(tab))k1Panel(tab);
  const r=_gt46.call(this,tab);
  try{ const c=svCurTab();
    if(c==='kplan')k1Planung(); else if(c==='kueber')k1Uebersicht(); else if(c==='topelf')k1TopElf();
    if(['kplan','kueber','topelf','sbedarf','skand','entdecken'].includes(c)){ sv4HubBar(c); const side=document.querySelector(`.snav button[data-tab="${SV4_OF[c]==='kader'?'kader':'scout'}"]`);
      if(side)document.querySelectorAll('.snav button[data-tab]').forEach(b=>b.classList.toggle('active',b===side)); }
  }catch(e){ console.warn('V1 Navigation',e); }
  return r; }; }
// Nach Schließen eines Fensters (z. B. Gespräch) die offene V1-Seite auffrischen
{ const _co46=closeOverlay; closeOverlay=function(){ const r=_co46.apply(this,arguments); try{ const c=svCurTab(); if(c==='kplan')setTimeout(k1Planung,60); }catch(e){} return r; }; }
// Schalter laden → Navigation umstellen
{ const _vl46=v1Laden; v1Laden=async function(){ const r=await _vl46.apply(this,arguments); try{ if(V1.an)v1NavAn(); else v1NavAus(); }catch(e){ console.warn(e); } return r; }; }

/* =====================================================================
   Sportzentrale · Umbau V1, Paket E: Scouting = BEDARFE LÖSEN (hinter dem Schalter ui_v1)
   Scouting: Bedarfe | Kandidaten | Beobachtung | Entdecken
   - Bedarfe: dieselben Objekte wie in der Kaderplanung (automatisch) plus manuelle. Interner Kontext, Suchprofil
     (Must, Wichtig, Wunsch), externe Treffer nach Fit, dann sportliche Einordnung, Transferchance und Empfehlung.
   - Kandidaten: Kandidat → Kontakt → Gespräch → Entscheidung. Fakten (Interesse, Machbarkeit) bleiben getrennt vom Modell.
   - Entdecken: Markt (V1-Tabelle), Radar (Signale), Rückkehrer, Talente. Klassische Ansichten bleiben erreichbar.
   - Vergleich als Aktion mit verbalen Unterschieden. Fit, Transferchance und Empfehlung ändern nie die Stärke.
   ===================================================================== */
const S1={bedarf:null,ent:'markt',attr:null,attrP:null,bf:'offen',kb:'',mehr:false,mf:{pos:'',liga:'',alter:'',q:''},msort:{k:'ca',d:-1},
  kAbg:false,ehSig:'',eh:new Set(),hin:null};
const S1_STUFE={kandidat:'Kandidat',kontakt:'Kontakt',gespraech:'Gespräch',entscheidung:'Entscheidung'};
const S1_ENT={offen:'offen',vormerken:'vormerken',abgelehnt:'abgelehnt',verpflichtet:'verpflichtet'};
const S1_INT={kein:'kein Interesse',offen:'offen',signalisiert:'Interesse signalisiert'};
const S1_MACH={passend:'passend',zu_klaeren:'zu klären',problematisch:'problematisch'};
const S1_TC={hoch:'Wechsel wahrscheinlich',offen:'Wechsel offen',niedrig:'Wechsel unwahrscheinlich'};
const S1_FIT={hoch:'Fit hoch',mittel:'Fit mittel',niedrig:'Fit niedrig'};
const S1_EIN_R={sofort:3,breite:2,entwicklung:1,keine:0,unbekannt:0};
const S1_LKEY={A:'KLA',B:'KLB',C:'KLC',D:'KLD',D1:'KLD',D2:'KLD',KOL:'KOL',GL:'GL',VL:'VL',HL:'HL'};
const S1_BSTAT={offen:'offen',suche:'in Suche',shortlist:'Shortlist',entschieden:'entschieden',erledigt:'erledigt',verworfen:'verworfen'};
const S1_AKTIV=['offen','suche','shortlist'];

function s1LigaKeys(p){ const L=typeof svLigaJetzt==='function'?svLigaJetzt(p):null; const l=String((L&&L.liga)||(p&&p.liga)||''); return [...new Set(l.split('/').filter(x=>svScoutLigaErlaubt(p,x)).map(x=>S1_LKEY[x]||(V1K.LIGA[x]?x:null)).filter(Boolean))]; }
function s1LigaKey(p){ return s1LigaKeys(p)[0]||null; }
function s1Liga(p){ const K=s1LigaKeys(p); return typeof svLigaText==='function'?svLigaText(p):(K.length?K.map(k=>V1K.LIGA[k]).join(' / '):'Liga unbekannt'); }
function s1Club(p){ const L=typeof svLigaJetzt==='function'?svLigaJetzt(p):null; return (L&&L.club)||(p&&p.club)||''; }
function s1Extern(p){ return p&&svScoutInScope(p)&&!p.own&&!sv4Team(p)&&!p.verzicht; }
function s1AttrLaden(){ if(S1.attr)return Promise.resolve(); if(S1.attrP)return S1.attrP;
  S1.attrP=(async()=>{ try{ S1.attr=(await v1Rpc('rating_v1_attribute'))||{}; }catch(e){ S1.attr={}; } S1.attrP=null; })(); return S1.attrP; }
function s1Ehemalig(){
  try{ if(typeof VR==='undefined'||!VR.atLoaded||typeof vrRanks!=='function')return S1.eh;
    const {L}=vrRanks(); const sig=String(L.length); if(sig===S1.ehSig)return S1.eh;
    S1.eh=new Set(L.filter(x=>x.pid&&x.tot&&x.tot.sp>=1).map(x=>x.pid)); S1.ehSig=sig; }catch(e){}
  return S1.eh;
}
function s1Pos(b){ if(b.pos_v1)return b.pos_v1; const x=V1K.posV1(b.pos); return x==='MF'?'DM':x||'IV'; }
function s1TeamB(b){ return b.team==='2'?'2':'1'; }
function s1Ziel(b){ if(b.ziel_niveau!=null)return b.ziel_niveau; const t=s1TeamB(b), pl=k1Plan(b.saison,t); return V1K.zielNiveau(pl.ziel||(t==='1'?'KLA':'KLD'),b.rolle||'stamm'); }
function s1Krit(b){
  if(b.kriterien&&Array.isArray(b.kriterien.must))return b.kriterien;
  const pos=s1Pos(b), A=V1K.ATTR_POS[pos]||[], pr=b.profil||{};
  const k={must:[{typ:'pos',wert:pos}],wichtig:A.slice(0,2).map(x=>({typ:'attr',k:x,min:3})),wunsch:[]};
  if(pr.fuss)k.wichtig.push({typ:'fuss',wert:String(pr.fuss).toLowerCase()});
  if(pr.alter_bis)k.wunsch.push({typ:'alter',max:+pr.alter_bis}); else if(b.rolle==='entwicklung'||b.grund==='perspektive')k.wunsch.push({typ:'alter',max:23});
  if(!k.wunsch.length&&A[2])k.wunsch.push({typ:'attr',k:A[2],min:4});
  return k;
}
function s1Sp(p){ const w=k1W(p.id), a=(S1.attr&&S1.attr[p.id])||null;
  return {id:p.id,name:p.name,pos:p.pos,pos2:p.pos2||[],alter:k1Alter(p),fuss:p.fuss,ca:w.ca??null,p24:w.p24??null,sicherheit:w.sicherheit||null,form:w.form??null,
    rolle:w.rolle||null,signale:w.signale||[],attr:a,club:s1Club(p),liga:s1Liga(p),km:p.km??null,p}; }
function s1Transfer(p,k){
  const C=(typeof crmOf==='function'&&crmOf(p))||{}, w=k1W(p.id);
  let aussage=(k&&k.interesse)||null, am=(k&&k.aussage_am)||null;
  if(!aussage&&C.s==='no'){ aussage='kein'; am=C.lc||null; }
  return V1K.transferchance({aussage,aussage_am:am,heute:sv4Today(),ehemalig:s1Ehemalig().has(p.id),verbindung:!!(k&&k.verbindung),rolle:w.rolle||null,km:p.km??null});
}
function s1Bewerten(p,b,k){
  const sp=s1Sp(p), fit=V1K.fit(sp,s1Krit(b)), ein=V1K.einordnung(sp,{ref:b.ref||null,ziel:s1Ziel(b)}), tc=s1Transfer(p,k);
  const emp=V1K.empfehlung({einordnung:ein.k,fit,transfer:tc.stufe,sicherheit:sp.sicherheit,kontakt:k?k.kontakt:'kein',entscheidung:k?k.entscheidung:null});
  return {sp,fit,ein,tc,emp};
}
function s1Treffer(b){
  const pos=s1Pos(b), have=new Set((SV4.bk||[]).filter(x=>x.bedarf_id===b.id).map(x=>x.player_id)), jung=b.rolle==='entwicklung'||b.grund==='perspektive';
  return players.filter(p=>s1Extern(p)&&!have.has(p.id)&&(!p.isJugend||jung)&&!(typeof crmOf==='function'&&crmOf(p).s==='no')&&V1K.passung({pos:p.pos,pos2:p.pos2||[]},pos)>=.5&&k1W(p.id).ca!=null)
    .map(p=>Object.assign({p},s1Bewerten(p,b,null)))
    .sort((x,y)=>(y.fit.stufe==='niedrig'?0:y.fit.score)-(x.fit.stufe==='niedrig'?0:x.fit.score)||S1_EIN_R[y.ein.k]-S1_EIN_R[x.ein.k]||(y.sp.ca||0)-(x.sp.ca||0)||x.p.name.localeCompare(y.p.name,'de'))
    .slice(0,60);
}
function s1BedarfFuer(p){ return (SV4.bed||[]).filter(b=>S1_AKTIV.includes(b.status)).find(b=>V1K.passung({pos:p.pos,pos2:p.pos2||[]},s1Pos(b))>=.8)||null; }
async function s1KandSet(p){
  const {data,error}=await SVB.sb.rpc('kandidat_v1_set',{p}); if(error)throw new Error(error.message);
  SV4.bk=(SV4.bk||[]).filter(x=>!(x.bedarf_id===data.bedarf_id&&x.player_id===data.player_id)).concat([data]);
  try{ const r=await SVB.sb.from('bedarfe').select('*').eq('id',data.bedarf_id); if(r.data&&r.data[0])SV4.bed=[r.data[0]].concat((SV4.bed||[]).filter(x=>x.id!==data.bedarf_id)); }catch(e){}
  if(data.entscheidung==='verpflichtet'){ try{ await sv4Load(true); }catch(e){} k1SyncBald(); }
  try{ sv4Bump(); }catch(e){}
  return data;
}
function s1Bereit(P,again){
  if(!k1Bereit(P,again))return false;
  if(!S1.attr){ k1Lade(P,'Eye-Test-Werte werden geladen …'); s1AttrLaden().then(again); return false; }
  return true;
}
function s1Ca(sp){ return `<span class="s1-ca s-${k1E(sp.sicherheit||'niedrig')}" title="Stärke, Sicherheit ${k1E(sp.sicherheit||'?')}">${sp.ca??'?'}</span>`; }
function s1Unter(sp){ return [svPosVon(sp),sp.club,sp.liga,sp.alter?sp.alter+' J.':''].filter(Boolean).map(k1E).join(' · '); }

/* ---------- Bedarfe ---------- */
function s1Bedarfe(){
  const P=k1Panel('sbedarf'); if(!P||!s1Bereit(P,s1Bedarfe))return;
  const ord={offen:0,teilweise:1,gedeckt:2}, pr={hoch:0,mittel:1,niedrig:2};
  const L=(SV4.bed||[]).filter(b=>S1.bf==='alle'||S1_AKTIV.includes(b.status))
    .sort((a,b)=>String(a.saison).localeCompare(String(b.saison))||String(a.team).localeCompare(String(b.team))||(ord[a.extern]??1)-(ord[b.extern]??1)||(pr[a.prio]??1)-(pr[b.prio]??1));
  if(!S1.bedarf||!L.some(b=>b.id===S1.bedarf))S1.bedarf=(L[0]||{}).id||null;
  const b=L.find(x=>x.id===S1.bedarf)||null;
  let gruppe='';
  const liste=L.map(x=>{ const g=`${k1SL(x.saison)} · ${x.team==='A'?'A-Jugend':x.team+'. Mannschaft'}`; const kopf=g!==gruppe?`<div class="s1-gruppe">${k1E(g)}</div>`:''; gruppe=g;
    const n=(SV4.bk||[]).filter(k=>k.bedarf_id===x.id).length;
    return kopf+`<button type="button" class="s1-bl${x.id===S1.bedarf?' on':''} ext-${k1E(x.extern||'offen')}" data-s1b="${k1E(x.id)}"><b>${k1E(x.titel)}</b>
      <small>${x.quelle==='auto'?'aus dem Kaderplan':'manuell'} · ${k1E(S1_BSTAT[x.status]||x.status)}${n?` · ${n} Kandidat${n>1?'en':''}`:''}${x.extern?' · '+k1E(K1_EXT[x.extern]):''}</small></button>`; }).join('');
  P.innerHTML=`${k1Kopf('Bedarfe','Was der Kader braucht und wer dafür passt. Gleiche Bedarfe wie in der Planung.')}
    <div class="k1-leiste"><div class="k1-seg">${[['offen','Offen'],['alle','Alle']].map(([k,l])=>`<button type="button" class="${S1.bf===k?'on':''}" data-s1bf="${k}">${l}</button>`).join('')}</div>
      <button class="btn sm ghost" type="button" data-s1neu>${SVI('target')} Neuer Bedarf</button>
      <button class="btn sm ghost" type="button" data-s1plan>${SVI('pitch')} Zur Planung</button></div>
    <div class="s1-grid"><div class="card"><div class="s1-liste">${liste||'<p class="note">Keine offenen Bedarfe. Die Planung legt sie automatisch an, sobald etwas fehlt.</p>'}</div></div>
      <div>${b?s1BedarfDetail(b):''}</div></div>`;
  P.querySelectorAll('[data-s1b]').forEach(x=>x.onclick=()=>{ S1.bedarf=x.dataset.s1b; S1.mehr=false; s1Bedarfe(); });
  P.querySelectorAll('[data-s1bf]').forEach(x=>x.onclick=()=>{ S1.bf=x.dataset.s1bf; s1Bedarfe(); });
  P.querySelector('[data-s1neu]').onclick=()=>{ if(typeof sc4BedarfEditor==='function')sc4BedarfEditor(); };
  P.querySelector('[data-s1plan]').onclick=()=>goTab('kplan');
  if(b)s1BindDetail(P,b);
}
function s1BedarfDetail(b){
  const k=s1Krit(b), z=s1Ziel(b), T=s1Treffer(b), zeig=S1.mehr?T:T.slice(0,12), kand=(SV4.bk||[]).filter(x=>x.bedarf_id===b.id);
  const intern=Array.isArray(b.intern)?b.intern:[];
  const krit=(t,L)=>L.length?`<span><b>${t}:</b> ${L.map(c=>k1E(V1K.kriteriumText(c))).join(', ')}</span>`:'';
  return `<div class="card"><h3 class="trh">${SVI('target')} ${k1E(b.titel)}</h3>
    <div class="s1-kv"><span class="v1-c">${k1E(V1K.POSL[s1Pos(b)]||b.pos)}</span>${b.rolle?`<span class="v1-c">${k1E(K1_ROLLE[b.rolle]||b.rolle)}</span>`:''}<span class="v1-c">Zielniveau ${z}</span>
      <span class="v1-c">${k1E(S1_BSTAT[b.status]||b.status)}</span>${b.ref&&b.ref.name?`<span class="v1-c">Maßstab ${k1E(b.ref.name)}${b.ref.ca!=null?' '+b.ref.ca:''}</span>`:''}</div>
    ${b.notiz?`<p class="note">${k1E(b.notiz)}</p>`:''}
    <h4 class="s1-gruppe">Intern geprüft</h4>
    ${b.quelle!=='auto'?'<p class="note small">Manueller Bedarf: interne Optionen in der Planung prüfen.</p>':intern.length?`<ol class="k1-int">${intern.slice(0,5).map(x=>`<li><span class="k1-st ${k1E(x.stufe)}">${k1E(K1_STUFE[x.stufe]||x.stufe)}</span> ${String(x.id).startsWith('ju:')?k1E(x.name):`<span class="lnk" data-svp="${k1E(x.id)}">${k1E(x.name)}</span>`}${x.ca!=null?` <b>${x.ca}</b>`:''} <small>${k1E(x.hinweis||'')}</small></li>`).join('')}</ol>`:'<p class="note small">Intern keine Option (eigene Mannschaft, Zweite, Jugend geprüft): Lösung extern.</p>'}
    <h4 class="s1-gruppe">Suchprofil</h4>
    <div class="s1-krit">${krit('Muss',k.must||[])}${krit('Wichtig',k.wichtig||[])}${krit('Wunsch',k.wunsch||[])}</div>
    <div class="btnrow"><button class="btn sm ghost" type="button" data-s1krit>${SVI('check')} Suchprofil anpassen</button>
      <button class="btn sm ghost" type="button" data-s1kand>${SVI('users')} Kandidaten (${kand.length})</button></div></div>
  <div class="card"><h3 class="trh">${SVI('search')} Passende Spieler <small>${T.length}</small></h3>
    <p class="note small">Sortiert nach Fit zum Suchprofil, dann nach sportlicher Einordnung. Transferchance beruht nur auf Wechselinfos.</p>
    ${zeig.map(x=>s1TrefferHtml(x,b)).join('')||'<p class="note">Kein externer Spieler passt zur Position.</p>'}
    ${T.length>12?`<button class="btn sm ghost" type="button" data-s1mehr>${S1.mehr?'Weniger':'Alle '+T.length+' zeigen'}</button>`:''}</div>`;
}
function s1TrefferHtml(x,b){
  const sp=x.sp;
  return `<div class="s1-m">${s1Ca(sp)}<div class="s1-mt"><b class="lnk" data-svp="${k1E(sp.id)}">${k1E(sp.name)}</b><small>${s1Unter(sp)}</small>
      <p>${k1E(x.ein.text)}</p><p><b>${k1E(S1_FIT[x.fit.stufe])}</b>${x.fit.sicherheit!=='hoch'?` (Sicherheit ${k1E(x.fit.sicherheit)})`:''} · ${k1E(S1_TC[x.tc.stufe])}: ${k1E(x.tc.gruende.slice(0,2).join(', '))}</p></div>
    <div class="s1-ma"><span class="s1-emp">${k1E(x.emp.aktion)}</span><button class="btn sm" type="button" data-s1add="${k1E(sp.id)}">+ Kandidat</button>
      <button class="btn sm ghost" type="button" data-s1vgl="${k1E(sp.id)}">Vergleich</button></div></div>`;
}
function s1BindDetail(P,b){
  P.querySelectorAll('[data-svp]').forEach(x=>x.onclick=()=>openModal(x.dataset.svp));
  const m=P.querySelector('[data-s1mehr]'); if(m)m.onclick=()=>{ S1.mehr=!S1.mehr; s1Bedarfe(); };
  P.querySelector('[data-s1krit]').onclick=()=>s1KritForm(b);
  P.querySelector('[data-s1kand]').onclick=()=>{ S1.kb=b.id; goTab('skand'); };
  P.querySelectorAll('[data-s1add]').forEach(x=>x.onclick=async()=>{ x.disabled=true; try{ await s1KandSet({bedarf_id:b.id,player_id:x.dataset.s1add,quelle:'manuell'}); kToast('✓ Als Kandidat aufgenommen'); }catch(e){ kToast('⚠️ '+e.message); } s1Bedarfe(); });
  P.querySelectorAll('[data-s1vgl]').forEach(x=>x.onclick=()=>{ const ids=[x.dataset.s1vgl]; const ref=b.ref&&b.ref.id; if(ref)ids.push(ref);
    else { const i=(b.intern||[]).find(y=>!String(y.id).startsWith('ju:')); if(i)ids.push(i.id); } s1Vergleich(ids,b); });
}
function s1KritForm(b){
  const k=s1Krit(b), pos=s1Pos(b);
  const grp=c=>(k.must||[]).includes(c)?'must':(k.wichtig||[]).includes(c)?'wichtig':'wunsch';
  const attrW={}; [...(k.wichtig||[]),...(k.wunsch||[]),...(k.must||[])].filter(c=>c.typ==='attr').forEach(c=>{ attrW[c.k]=grp(c)+':'+c.min; });
  const alt=[...(k.wichtig||[]),...(k.wunsch||[]),...(k.must||[])].find(c=>c.typ==='alter'), fu=[...(k.wichtig||[]),...(k.wunsch||[]),...(k.must||[])].find(c=>c.typ==='fuss');
  const gsel=(id,cur)=>`<select id="${id}"><option value="">nicht nötig</option>${[['must','Muss'],['wichtig','Wichtig'],['wunsch','Wunsch']].map(([v,l])=>`<option value="${v}"${cur===v?' selected':''}>${l}</option>`).join('')}</select>`;
  const M=svModal(`<h2 style="margin:0 0 4px">Suchprofil</h2><p class="note">${k1E(b.titel)}. Muss: ${k1E(V1K.POSL[pos])}. Höchstens sechs Kriterien. Unbekannte Werte senken die Sicherheit des Fits, nicht den Fit.</p>
    <div class="s1-fm">${Object.entries(V1K.ATTR_L).map(([a,l])=>`<label>${k1E(l)}<select data-a="${a}"><option value="">nicht nötig</option>
      ${[['wichtig:3','Wichtig, mindestens 3'],['wichtig:4','Wichtig, mindestens 4'],['wunsch:4','Wunsch, mindestens 4'],['must:3','Muss, mindestens 3']].map(([v,t])=>`<option value="${v}"${attrW[a]===v?' selected':''}>${t}</option>`).join('')}</select></label>`).join('')}
      <label>Höchstalter<input type="number" id="s1ka" min="16" max="45" value="${alt&&alt.max!=null?alt.max:''}"></label><label>Gewicht Alter${gsel('s1kag',alt?grp(alt):'wunsch')}</label>
      <label>Starker Fuß<select id="s1kf"><option value="">egal</option>${['links','rechts'].map(f=>`<option${fu&&fu.wert===f?' selected':''}>${f}</option>`).join('')}</select></label><label>Gewicht Fuß${gsel('s1kfg',fu?grp(fu):'wichtig')}</label></div>
    <div class="btnrow"><button class="btn" type="button" id="s1kok">${SVI('check')} Speichern</button><button class="btn ghost" type="button" id="s1kx">Abbrechen</button></div>`);
  M.querySelector('#s1kx').onclick=()=>closeOverlay();
  M.querySelector('#s1kok').onclick=async()=>{
    const n={must:[{typ:'pos',wert:pos}],wichtig:[],wunsch:[]};
    M.querySelectorAll('[data-a]').forEach(s=>{ if(!s.value)return; const [g,min]=s.value.split(':'); n[g].push({typ:'attr',k:s.dataset.a,min:+min}); });
    const a=+M.querySelector('#s1ka').value, ag=M.querySelector('#s1kag').value||'wunsch'; if(a)n[ag].push({typ:'alter',max:a});
    const f=M.querySelector('#s1kf').value, fg=M.querySelector('#s1kfg').value||'wichtig'; if(f)n[fg].push({typ:'fuss',wert:f});
    if(n.must.length+n.wichtig.length+n.wunsch.length>6)return kToast('⚠️ Höchstens sechs Kriterien');
    try{ const {data,error}=await SVB.sb.rpc('bedarf_v1_kriterien',{p_id:b.id,p_k:n}); if(error)throw new Error(error.message);
      SV4.bed=[data].concat(SV4.bed.filter(x=>x.id!==b.id)); closeOverlay(); kToast('✓ Suchprofil gespeichert'); s1Bedarfe(); }catch(e){ kToast('⚠️ '+e.message); } };
}

/* ---------- Kandidaten ---------- */
function s1KAktiv(k){ return (k.entscheidung==='offen'||k.entscheidung==='vormerken')&&!['verworfen','absage','zusage'].includes(k.status); }
function s1Kandidaten(){
  const P=k1Panel('skand'); if(!P||!s1Bereit(P,s1Kandidaten))return;
  const bed=new Map((SV4.bed||[]).map(b=>[b.id,b])), heute=sv4Today();
  if(S1.kb&&!bed.has(S1.kb))S1.kb='';
  const alle=(SV4.bk||[]).filter(k=>bed.has(k.bedarf_id)&&(!S1.kb||k.bedarf_id===S1.kb)&&svScoutInScope(sv4P(k.player_id)));
  const akt=alle.filter(k=>s1KAktiv(k)&&S1_AKTIV.concat(['entschieden']).includes(bed.get(k.bedarf_id).status)), abg=alle.filter(k=>!akt.includes(k));
  const card=k=>{ const p=sv4P(k.player_id), b=bed.get(k.bedarf_id), x=s1Bewerten(p,b,k), f=k.wiedervorlage&&k.wiedervorlage<=heute;
    return `<button type="button" class="s1-k${f?' faellig':''}" data-s1k="${k1E(k.bedarf_id)}|${k1E(k.player_id)}"><b>${k1E(p.name)} <span style="float:right">${x.sp.ca??'?'}</span></b>
      <small>${k1E(b.titel)}</small><small>${k1E(S1_TC[x.tc.stufe])}${k.interesse?' · '+k1E(S1_INT[k.interesse]):''}${k.machbarkeit?' · '+k1E(S1_MACH[k.machbarkeit]):''}${k.entscheidung==='vormerken'?' · vorgemerkt':''}</small>
      ${k.naechster_schritt?`<small>Nächster Schritt: ${k1E(k.naechster_schritt)}</small>`:''}${k.wiedervorlage?`<small>${f?'Fällig':'Wiedervorlage'} ${sv4D(k.wiedervorlage)}</small>`:''}
      <span class="s1-emp">${k1E(x.emp.aktion)}</span></button>`; };
  const imBk=new Set((SV4.bk||[]).filter(k=>bed.has(k.bedarf_id)).map(k=>k.player_id));
  let ohne=[]; try{ ohne=(typeof kandList==='function'?kandList():[]).filter(p=>!imBk.has(p.id)).slice(0,40); }catch(e){}
  const offenB=(SV4.bed||[]).filter(b=>S1_AKTIV.includes(b.status));
  const bOpt=p=>{ const pass=offenB.filter(b=>V1K.passung({pos:p.pos,pos2:p.pos2||[]},s1Pos(b))>=.5); return (pass.length?pass:offenB).map(b=>`<option value="${k1E(b.id)}">${k1E(b.titel)}</option>`).join(''); };
  P.innerHTML=`${k1Kopf('Kandidaten','Vom Kandidaten über Kontakt und Gespräch zur Entscheidung. Interesse und Machbarkeit sind Fakten, keine Stärke.')}
    <div class="k1-leiste"><label>Bedarf <select data-s1kb><option value="">alle</option>${(SV4.bed||[]).filter(b=>S1_AKTIV.includes(b.status)||b.id===S1.kb).map(b=>`<option value="${k1E(b.id)}"${b.id===S1.kb?' selected':''}>${k1E(b.titel)}</option>`).join('')}</select></label></div>
    ${!alle.length?'<p class="note">Keine Kandidaten in dieser Auswahl. In der Gruppenliga zeigen wir nur Vereine aus Bergstraße und Odenwald. Bisherige Notizen bleiben gespeichert. Neue Kandidaten findest du in der Spielersuche.</p>':''}
    <div class="s1-pipe">${Object.entries(S1_STUFE).map(([st,l])=>{ const L=akt.filter(k=>(k.stufe||'kandidat')===st); return `<div class="s1-sp"><h4><span>${l}</span><span>${L.length}</span></h4>${L.map(card).join('')}</div>`; }).join('')}</div>
    ${ohne.length&&offenB.length?`<div class="card"><h3 class="trh">${SVI('users')} Kandidaten ohne Bedarf <small>${ohne.length}</small></h3><p class="note small">Aus der bisherigen Kandidatenliste. Einem Bedarf zuordnen, damit Fit und Empfehlung greifen.</p>
      ${ohne.map(p=>`<div class="k1-oe"><span class="lnk" data-svp="${k1E(p.id)}">${k1E(p.name)}</span><small>${k1E(svPosTxt(p)||'')}</small><select data-s1zu="${k1E(p.id)}">${bOpt(p)}</select><button class="btn sm ghost" type="button" data-s1zuok="${k1E(p.id)}">Zuordnen</button></div>`).join('')}</div>`:''}
    ${abg.length?`<details class="card"${S1.kAbg?' open':''} data-s1abg><summary><h3 class="trh">${SVI('check')} Abgeschlossen <small>${abg.length}</small></h3></summary>${abg.map(card).join('')}</details>`:''}`;
  P.querySelectorAll('[data-svp]').forEach(x=>x.onclick=()=>openModal(x.dataset.svp));
  P.querySelector('[data-s1kb]').onchange=e=>{ S1.kb=e.target.value; s1Kandidaten(); };
  P.querySelectorAll('[data-s1k]').forEach(x=>x.onclick=()=>{ const [bid,pid]=x.dataset.s1k.split('|'); s1KandForm(bid,pid); });
  P.querySelectorAll('[data-s1zuok]').forEach(x=>x.onclick=async()=>{ const pid=x.dataset.s1zuok, sel=P.querySelector(`[data-s1zu="${CSS.escape(pid)}"]`); x.disabled=true;
    try{ await s1KandSet({bedarf_id:sel.value,player_id:pid,quelle:'manuell'}); kToast('✓ Zugeordnet'); }catch(e){ kToast('⚠️ '+e.message); } s1Kandidaten(); });
  const d=P.querySelector('[data-s1abg]'); if(d)d.addEventListener('toggle',()=>{ S1.kAbg=d.open; });
}
function s1KandForm(bid,pid){
  const k=(SV4.bk||[]).find(x=>x.bedarf_id===bid&&x.player_id===pid), b=(SV4.bed||[]).find(x=>x.id===bid), p=sv4P(pid); if(!k||!b||!p)return;
  const x=s1Bewerten(p,b,k);
  const sel=(id,o,cur,leer)=>`<select id="${id}">${leer?`<option value="">${leer}</option>`:''}${Object.entries(o).map(([v,l])=>`<option value="${v}"${cur===v?' selected':''}>${k1E(l)}</option>`).join('')}</select>`;
  const M=svModal(`<h2 style="margin:0 0 4px">${k1E(p.name)}</h2><p class="note">${k1E(b.titel)} · ${s1Unter(x.sp)}</p>
    <div class="s1-kv"><span class="v1-c">Stärke ${x.sp.ca??'?'}</span><span class="v1-c">${k1E(x.ein.t)}</span><span class="v1-c">${k1E(S1_FIT[x.fit.stufe])}</span><span class="v1-c">${k1E(S1_TC[x.tc.stufe])}</span></div>
    <p class="note"><b>Empfehlung: ${k1E(x.emp.aktion)}.</b> ${k1E(x.emp.text)}</p>
    <div class="s1-fm"><label>Stufe${sel('s1fs',S1_STUFE,k.stufe||'kandidat')}</label><label>Kontakt${sel('s1fk',{kein:'noch kein Kontakt',kontakt:'Kontakt steht',gespraech:'Gespräch geführt'},k.kontakt||'kein')}</label>
      <label>Interesse (seine Aussage)${sel('s1fi',S1_INT,k.interesse||'','unbekannt')}</label><label>Machbarkeit${sel('s1fm',S1_MACH,k.machbarkeit||'','offen')}</label>
      <label>Entscheidung${sel('s1fe',S1_ENT,k.entscheidung||'offen')}</label><label>Verantwortlich<input id="s1fv" maxlength="60" value="${k1E(k.verantwortlich||'')}"></label>
      <label>Nächster Schritt<input id="s1fn" maxlength="200" value="${k1E(k.naechster_schritt||'')}"></label><label>Wiedervorlage<input id="s1fw" type="date" value="${k1E(k.wiedervorlage||'')}"></label>
      <label class="w"><span><input type="checkbox" id="s1fb"${k.verbindung?' checked':''}> Persönliche Verbindung zum Verein</span></label>
      <label class="w">Gesprächsnotiz<textarea id="s1fg" maxlength="600">${k1E(k.gespraech||'')}</textarea></label></div>
    <p class="note small">„verpflichtet“ plant ihn in der Saison ${k1SL(b.saison)} für die ${s1TeamB(b)}. Mannschaft ein, der Bedarf rechnet dann neu.</p>
    <div class="btnrow"><button class="btn" type="button" id="s1fok">${SVI('check')} Speichern</button><button class="btn ghost" type="button" id="s1fvgl">Vergleich</button><button class="btn ghost" type="button" id="s1fx">Schließen</button></div>`);
  M.querySelector('#s1fx').onclick=()=>closeOverlay();
