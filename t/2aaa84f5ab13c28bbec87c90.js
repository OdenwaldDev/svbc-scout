
wie besprochen hier eure Übersicht zur Partnerschaft mit dem SV/BSC Mörlenbach. Pakete, freie Plätze und Vertrag stehen drin:
${link||'(Link folgt)'}

Wenn Fragen offen sind, meld dich einfach.

${gruss}`};
  if(k==='warteliste')return {betreff:'Ein Platz ist frei geworden',text:`${anrede}

${x._platz?`ein Platz als ${x._platz} ist frei geworden.`:'ein Platz ist frei geworden.'} Ihr steht bei uns auf der Warteliste ganz oben. Habt ihr noch Interesse? Dann meld dich, wir halten den Platz ein paar Tage für euch frei.${link?`

Hier ist eure Übersicht noch einmal: ${link}`:''}

${gruss}`};
  if(k==='verlaengerung'){ const ende=x._ende&&typeof peDat==='function'?peDat(x._ende):'';
    return {betreff:'Unsere Partnerschaft: wie geht es weiter?',text:`${anrede}

${ende?`unser Partnervertrag läuft am ${ende} aus.`:'unser Partnervertrag läuft bald aus.'} Wir würden gern weitermachen. Hast du in den nächsten Wochen kurz Zeit, darüber zu sprechen? Ich komme gern vorbei.${link?`

Hier ist eure Übersicht noch einmal: ${link}`:''}

${gruss}`}; }
  if(k==='nachfassen')return {betreff:(link?'Euer Angebot':'Unser Angebot')+' für '+x.firma,text:`${anrede}

${link?`ich wollte kurz fragen, ob du schon in euer Angebot schauen konntest. Hier ist es noch einmal: ${link}`:'ich wollte kurz fragen, ob du schon in unser Angebot schauen konntest.'}

Wenn Fragen offen sind oder etwas anders passen soll, sag einfach Bescheid.

${gruss}`};
  return {betreff:x.firma+' und der SV/BSC Mörlenbach',text:`${anrede}

ich bin ${ich||'…'} von der Fußballabteilung des SV/BSC Mörlenbach. Wir suchen Partner aus ${ort} und Umgebung, die unsere Jugend und unsere Mannschaften unterstützen, und haben dabei an ${x.firma} gedacht.

Hast du Zeit für ein kurzes Treffen, gern bei euch vor Ort? In 20 Minuten zeige ich dir, was wir vorhaben und wie eine Partnerschaft aussehen kann.${link?`

Eine Übersicht für euch haben wir schon vorbereitet: ${link}`:''}

${gruss}`};
}
function pzNachricht(x,k){
  const T=pzText(x,k), tel=String(x.telefon||'').replace(/[^\d+]/g,''), wa=tel?tel.replace(/^00/,'+').replace(/^0/,'+49'):'';
  const d=pzDeck(x), name=x.ansprechpartner||(d&&d.ansprech)||'', ohneAnrede=false; // per Du braucht es Frau/Herr nicht mehr
  // Werbung per Mail oder WhatsApp nur mit vorheriger ausdrücklicher Zustimmung der Firma (UWG § 7 Abs. 2 Nr. 2), Anrufe bei Firmen gehen.
  // Solange keine Zustimmung vermerkt ist, steht der Hinweis im Blatt, mit „Anruf notieren“ und „Zustimmung notieren“.
  const erstK=!x.einwilligung, ew=x.einwilligung;
  // Links zur Präsentation erst, wenn das Impressum vollständig ist (Vorstand, Register, Anschrift)
  const plink=d&&typeof pdLink==='function'?pdLink(d.code):'', mitLink=!!plink&&T.text.includes(plink), imp=mitLink?paImpressumFehlt():[];
  const titel={nachfassen:'Nachfassen',nachhaken:'Nachhaken',verlaengerung:'Verlängerung ansprechen',praesentation:'Präsentation schicken',warteliste:'Platz anbieten'}[k]||'Anschreiben';
  const M=svModal(`<div class="pz-msg pa-blatt"><div class="pz-mk pa-bk"><span class="pz-lg" style="--lc:${pzFarbe(x.firma)}" aria-hidden="true">${pzE(pzKurz(x.firma))}</span><div><h2>${titel}</h2><small>${pzE(x.firma)}</small></div><button type="button" class="pa-bx" onclick="closeOverlay()">Später</button></div>
    ${erstK?`<div class="pz-uwg" role="note"><p>${SVI('info')} Erster Kontakt persönlich oder per Telefon. Den Link per Mail oder WhatsApp schickt ihr erst, wenn die Firma zugestimmt hat, zum Beispiel im Gespräch. Notiert die Zustimmung kurz.</p>
      <div class="pz-uwg-k">${tel?`<a class="btn ghost" id="pzTel" href="tel:${pzE(tel)}">${SVI('phone')} Anrufen</a>`:''}<button type="button" class="btn" id="pzAnruf">${SVI('phone')} Anruf notieren</button><button type="button" class="btn ghost" id="pzZust">${SVI('check')} Zustimmung notieren</button></div></div>`
      :`<p class="note small pz-zust">Zustimmung zu Mail und WhatsApp: ${pzE(ew.wer||'')}, ${pzE(ew.wie||'')}, am ${pzE(spoDat(ew.am))}.</p>`}
    ${imp.length?`<div class="pz-imp" role="alert"><p>${SVI('info')} Bevor ihr Links zur Präsentation verschickt: Im Impressum fehlen noch ${pzE(imp.join(', '))}.</p><button type="button" class="btn" id="pzImp">Vereinsdaten öffnen</button></div>`:''}
    ${ohneAnrede?`<div class="pz-anr" id="pzAnr"><span>Wie sprechen wir ${pzE(name)} an?</span><button type="button" data-pzan="Frau">Frau</button><button type="button" data-pzan="Herr">Herr</button></div>`:''}
    <label class="og-fl">Betreff<input id="pzMB" value="${pzE(T.betreff)}" maxlength="120"></label>
    <label class="og-fl">Nachricht<textarea id="pzMT" rows="11" maxlength="2000">${pzE(T.text)}</textarea></label>
    <div class="pz-wege"${imp.length?' hidden':''}>
      <button type="button" class="pz-b2" id="pzKop">${SVI('copy')} Kopieren</button>
      ${x.email?`<a class="pz-b2" id="pzMail" href="#">${SVI('mail')} Mail</a>`:''}
      ${wa?`<a class="pz-b2" id="pzWA" href="#" target="_blank" rel="noopener">${SVI('chat')} WhatsApp</a>`:''}
    </div>
    <p class="note small">${x.email||wa?'Die Nachricht geht von deinem eigenen Postfach oder Handy raus.':'Für diese Firma ist noch keine Mail oder Nummer hinterlegt. Kopieren und über das Kontaktformular der Firma schicken, oder in der Akte ergänzen.'}</p>
    <p class="pz-ohne" id="pzOhne" role="alert" hidden>Für diese Firma ist keine Zustimmung zu Mail oder WhatsApp vermerkt. Werbung auf diesem Weg nur, wenn die Firma vorher zugestimmt hat. Sonst lieber anrufen.</p>
    <div class="btnrow sbact"${imp.length?' hidden':''}><button type="button" class="btn ghost" id="pzErl">Schon anders geschickt? Als gesendet merken</button></div></div>`);
  const ib=M.querySelector('#pzImp'); if(ib)ib.onclick=()=>{ closeOverlay(); if(typeof PE!=='undefined')PE.v='verein'; pzWechsel('steuerung'); };
  const zb=M.querySelector('#pzZust'); if(zb)zb.onclick=()=>pzZustimmung(x,k);
  // Fehlt die Anrede, fragt das Blatt danach: ein Tipp schreibt die erste Zeile neu und merkt sich die Anrede bei der Firma
  M.querySelectorAll('[data-pzan]').forEach(b=>b.onclick=()=>paEinmal(b,async()=>{ const an=b.dataset.pzan, ta=M.querySelector('#pzMT'), alt=paAnrede('',name), neu=paAnrede(an,name);
    ta.value=ta.value.replace(/^(Guten Tag|Hallo)[^\n]*,/,neu); x.anrede=an;
    try{ const {error}=await SVB.sb.from('sponsoren').update({anrede:an,geaendert_am:new Date().toISOString()}).eq('id',x.id); if(error)throw error; const y=SPO.S.find(s=>s.id===x.id); if(y)y.anrede=an; }
    catch(e){ kToast('Anrede nicht gespeichert: '+(e.message||e)); }
    const h=M.querySelector('#pzAnr'); if(h)h.remove(); }));
  const anr=M.querySelector('#pzAnruf'); if(anr)anr.onclick=()=>paEinmal(anr,async()=>{
    try{ await svtRpc('partner_kontakt_raus',{p_sponsor:x.id,p_art:'anruf',p_notiz:'Angerufen',p_status:'angeschrieben',p_naechster:'Nach dem Anruf nachhaken',p_faellig:paDatPlus(svtHeute(),7)});
      closeOverlay(); kToast('✓ Anruf notiert. In 7 Tagen erinnert dich die App.'); if(typeof spoReload==='function')await spoReload(); }catch(e){ kToast('⚠️ '+(e.message||e)); } },'Speichert …');
  // welcher Weg tatsächlich genutzt wurde, landet im Verlauf (WhatsApp bleibt WhatsApp)
  let weg=null;
  // Erst wenn Mail, WhatsApp oder Kopieren benutzt wurde, wird „Gesendet“ zum Hauptknopf (kein Kontakt im Verlauf, der nie rausging)
  const raus=()=>{ const e=M.querySelector('#pzErl'); if(!e||!e.classList.contains('ghost'))return; e.classList.remove('ghost'); e.innerHTML=SVI('check')+' Gesendet, in 7 Tagen erinnern'; };
  const wert=()=>({b:M.querySelector('#pzMB').value,t:M.querySelector('#pzMT').value});
  M.querySelector('#pzKop').onclick=async()=>{ weg='sonst'; raus(); const v=wert(); try{ await navigator.clipboard.writeText(v.t); kToast('✓ Kopiert'); }catch(e){ const a=M.querySelector('#pzMT'); a.focus(); a.select(); } };
  // ohne vermerkte Zustimmung: deutlicher Hinweis im Blatt, senden bleibt möglich (z. B. Antwort auf eine Anfrage der Firma)
  const ohne=()=>{ if(!x.einwilligung){ const o=M.querySelector('#pzOhne'); if(o)o.hidden=false; } };
  const ml=M.querySelector('#pzMail'); if(ml)ml.onclick=e=>{ e.preventDefault(); weg='mail'; raus(); ohne(); const v=wert(); location.href='mailto:'+encodeURIComponent(x.email)+'?subject='+encodeURIComponent(v.b)+'&body='+encodeURIComponent(v.t); };
  const wl=M.querySelector('#pzWA'); if(wl)wl.onclick=e=>{ e.preventDefault(); weg='whatsapp'; raus(); ohne(); const v=wert(); window.open('https://wa.me/'+wa.replace('+','')+'?text='+encodeURIComponent(v.t),'_blank'); };
  // „Gesendet“: Kontakt, Stand und Wiedervorlage in einem Schritt auf dem Server (partner_kontakt_raus), Doppeltipp legt nichts doppelt an
  const erl=M.querySelector('#pzErl'); erl.onclick=()=>paEinmal(erl,async()=>{
    try{ const art=weg||(x.email?'mail':(wa?'whatsapp':'sonst'));
      await svtRpc('partner_kontakt_raus',{p_sponsor:x.id,p_art:art,p_notiz:{schreiben:'Angeschrieben',nachhaken:'Nachgehakt',nachfassen:'Nachgefasst',verlaengerung:'Verlängerung angesprochen',praesentation:'Präsentation geschickt',warteliste:'Freien Platz angeboten'}[k]||'Angeschrieben',
        p_status:k==='schreiben'||k==='praesentation'?'angeschrieben':null,p_naechster:k==='nachfassen'?'Auf Antwort zum Angebot warten, sonst nachfassen':k==='verlaengerung'?'Auf Antwort zur Verlängerung warten':k==='praesentation'?'Auf Rückmeldung zur Präsentation warten':k==='warteliste'?'Antwort zum freien Platz abwarten':'Auf Antwort warten, sonst nachhaken',p_faellig:paDatPlus(svtHeute(),7)});
      // kam die Nachricht aus einer Frage der Steuerung, rückt diese 7 Tage nach hinten (Verlängerung) bzw. ist erledigt (Warteliste)
      if(x._aufgabe){ for(const id of (x._aufgaben&&x._aufgaben.length?x._aufgaben:[x._aufgabe])){ try{ await svtRpc('partner_aufgabe_erledigen',{p_id:id,p_antwort:'angeschrieben',p_status:'erledigt',p_neu:k==='warteliste'?null:paDatPlus(svtHeute(),7)}); }catch(_){} } if(typeof PE!=='undefined')PE.t=0; }
      closeOverlay(); await spoReload(); kToast('Notiert. In 7 Tagen schauen wir wieder drauf.');
    }catch(e){ kToast('⚠️ '+(e.message||e)); } },'Speichert …');
}

(function(){ try{ const s=document.createElement('style'); s.id='svm63css'; s.textContent="/* Sportzentrale Beta 0.66 · Partner-Zentrale\n   Gleiche Welt wie die Präsentation beim Kunden (partner.html): Vereinsnavy, Orange, Papier,\n   Barlow Condensed für Überschriften, Caveat für die Handschrift. Bewusst eine Welt, in beiden App-Themen gleich. */\n@font-face{font-family:'PZC';font-weight:800;font-display:swap;src:url(partner/barlowc-800.woff2) format('woff2');}\n@font-face{font-family:'PZC';font-weight:900;font-display:swap;src:url(partner/barlowc-900.woff2) format('woff2');}\n@font-face{font-family:'PZHand';font-weight:700;font-display:swap;src:url(partner/caveat-700.woff2) format('woff2');}\n.pz{--navy:#141b47;--blau:#1d2760;--or:#e8741f;--or2:#c95f10;--hb:#8fc9ec;--papier:#f7f4ee;--papier2:#efe9dd;--ink:#1c1c22;--ink2:#4a4a55;--linie:#d8d2c4;--gruen:#2c6b3a;--knopf:#b8540c;\n  --c:'PZC','BarlowC','Arial Narrow',sans-serif;--h:'PZHand','Bradley Hand',cursive;\n  border-radius:22px;overflow:hidden;background:var(--papier);color:var(--ink);box-shadow:0 18px 50px -24px rgba(10,14,40,.55);margin-bottom:18px;}\n.pz ::selection{background:rgba(232,116,31,.35);color:inherit;}\n/* seit 0.73 steht die Reiterleiste auch über der Zentrale (Halt auf dem Startreiter) */\n\n/* Kopf: Nacht über dem Platz */\n.pz-hero{position:relative;background:var(--navy);color:#fff;isolation:isolate;}\n.pz-bild{position:absolute;inset:0;width:100%;height:100%;object-fit:cover;opacity:.42;z-index:-2;}\n.pz-hero:after{content:\"\";position:absolute;inset:0;z-index:-1;background:linear-gradient(180deg,rgba(20,27,71,.35) 0%,rgba(20,27,71,.78) 55%,#141b47 100%);}\n.pz-in{padding:30px 20px 22px;}\n.pz-hand{font-family:var(--h);font-weight:700;color:var(--or);font-size:26px;line-height:1;display:inline-block;transform:rotate(-2deg);}\n.pz-hand.dk{font-size:22px;}\n.pz-h1{margin:6px 0 0;font-family:var(--c);font-weight:900;font-size:clamp(44px,12vw,76px);line-height:.88;letter-spacing:-.01em;text-transform:uppercase;text-wrap:balance;color:#fff;}\n.pz-satz{margin:14px 0 0;max-width:46ch;font-size:16.5px;line-height:1.5;color:#dbe4f2;text-wrap:pretty;}\n.pz-satz b{color:#fff;font-weight:800;font-variant-numeric:tabular-nums;}\n\n/* Der Weg: fünf Stationen auf einer Linie */\n.pz-weg{position:relative;display:grid;grid-template-columns:repeat(5,minmax(0,1fr));margin:24px -4px 0;}\n.pz-weg:before{content:\"\";position:absolute;left:10%;right:10%;top:15px;height:2px;background:repeating-linear-gradient(90deg,#6d7bab 0 6px,transparent 6px 11px);}\n.pz-st{position:relative;min-width:0;display:flex;flex-direction:column;align-items:center;gap:4px;padding:6px 1px 8px;background:none;border:0;color:#b9c6e4;font:inherit;cursor:pointer;border-radius:12px;-webkit-tap-highlight-color:transparent;transition:background .2s ease;}\n.pz-st:hover{background:rgba(255,255,255,.06);}\n.pz-st b{font-family:var(--c);font-weight:900;font-size:26px;line-height:1;color:#fff;font-variant-numeric:tabular-nums;}\n.pz-st span{max-width:100%;font-size:clamp(10.5px,2.9vw,13px);font-weight:600;line-height:1.15;text-align:center;white-space:nowrap;letter-spacing:-.01em;}\n.pz-dot{width:16px;height:16px;border-radius:50%;border:2px solid #6d7bab;background:var(--navy);margin-bottom:4px;transition:transform .25s cubic-bezier(.2,.8,.2,1),box-shadow .25s ease;}\n.pz-st.voll .pz-dot{border-color:var(--hb);background:var(--hb);}\n.pz-st:last-child.voll .pz-dot{border-color:var(--or);background:var(--or);}\n.pz-st.on{background:rgba(255,255,255,.1);color:#fff;}\n.pz-st.on .pz-dot{transform:scale(1.25);box-shadow:0 0 0 5px rgba(232,116,31,.28);border-color:var(--or);background:var(--or);}\n.pz-akt{display:flex;flex-wrap:wrap;gap:10px;margin-top:20px;}\n.pz-b{display:inline-flex;align-items:center;gap:8px;min-height:48px;padding:0 18px;border-radius:999px;border:1.5px solid rgba(255,255,255,.35);background:rgba(255,255,255,.06);color:#fff;font-family:var(--c);font-weight:800;font-size:17px;letter-spacing:.05em;text-transform:uppercase;cursor:pointer;}\n.pz-b svg{width:18px;height:18px;}\n.pz-b.or{background:var(--knopf);border-color:var(--knopf);box-shadow:0 10px 24px -10px rgba(232,116,31,.8);}\n.pz-b:hover{filter:brightness(1.07);}\n.pz-b:focus-visible,.pz-st:focus-visible,.pz-go:focus-visible,.pz-weiter:focus-visible,.pz-z:focus-visible{outline:3px solid var(--or);outline-offset:2px;}\n\n/* Papier: was zu tun ist */\n.pz-papier{padding:22px 16px 20px;background:var(--papier);background-image:radial-gradient(rgba(28,28,34,.07) 1px,transparent 1.2px);background-size:16px 16px;}\n.pz-kopf{display:flex;align-items:baseline;justify-content:space-between;flex-wrap:wrap;gap:4px 12px;margin:4px 2px 12px;}\n.pz-k2{margin-top:30px;align-items:center;}\n.pz-h2{margin:0;font-family:var(--c);font-weight:900;font-size:30px;line-height:.95;text-transform:uppercase;color:var(--navy);text-wrap:balance;}\n.pz-h2 i{font-style:normal;font-size:18px;color:var(--or2);margin-left:4px;font-variant-numeric:tabular-nums;}\n.pz-h3{margin:0 0 10px;font-family:var(--c);font-weight:800;font-size:16px;letter-spacing:.12em;text-transform:uppercase;color:var(--ink2);}\n.pz-leer{margin:8px 2px;color:var(--ink2);font-size:15px;}\n\n.pz-waechter{display:flex;align-items:center;gap:12px;width:100%;margin:0 0 18px;padding:14px 14px;border-radius:16px;border:0;background:var(--navy);color:#fff;font:inherit;text-align:left;cursor:pointer;box-shadow:0 10px 26px -16px rgba(20,27,71,.9);}\n.pz-waechter>span:nth-child(2){flex:1;display:flex;flex-direction:column;gap:2px;}\n.pz-waechter b{font-size:15.5px;} .pz-waechter small{color:#b9c6e4;font-size:13px;}\n.pz-wi{width:38px;height:38px;border-radius:50%;display:grid;place-items:center;background:var(--or);flex:none;}\n.pz-wi svg{width:20px;height:20px;}\n\n/* Eine Firma = eine Zeile mit genau einem nächsten Schritt */\n.pz-heute,.pz-liste{display:flex;flex-direction:column;gap:10px;}\n.pz-z{display:grid;grid-template-columns:auto 1fr;gap:10px 12px;padding:14px;border-radius:16px;background:#fff;border:1px solid var(--linie);cursor:pointer;transition:transform .2s cubic-bezier(.2,.8,.2,1),box-shadow .2s ease;}\n.pz-z:hover{box-shadow:0 10px 24px -18px rgba(20,27,71,.6);}\n.pz-z:active{transform:scale(.995);}\n.pz-z.gr{padding:16px;border-color:#e3d9c6;box-shadow:0 12px 28px -22px rgba(20,27,71,.7);}\n.pz-lg{width:46px;height:46px;border-radius:12px;display:grid;place-items:center;background:var(--lc,#1d2760);color:#fff;font-family:'PZC','BarlowC',sans-serif;font-weight:900;font-size:19px;letter-spacing:.02em;flex:none;}\n.pz-zt{min-width:0;display:flex;flex-direction:column;gap:3px;}\n.pz-zt>b{font-size:16px;line-height:1.25;color:var(--ink);overflow-wrap:anywhere;}\n.pz-zt small{font-size:13px;color:var(--ink2);line-height:1.35;}\n.pz-prio{font-style:normal;font-weight:800;font-size:11.5px;padding:1px 6px;border-radius:6px;margin-left:4px;font-variant-numeric:tabular-nums;white-space:nowrap;}\n.pz-prio.pA{background:#fde6d3;color:#8a3f08;} .pz-prio.pB{background:#e3eef9;color:#1d4b7a;} .pz-prio.pC{background:#eee9df;color:#5b5b66;}\n.pz-tipp{display:inline-flex;align-items:center;gap:5px;align-self:flex-start;margin-top:2px;font-family:var(--h);font-weight:700;font-size:19px;line-height:1.05;color:var(--or2);}\n.pz-tipp svg{width:14px;height:14px;}\n.pz-tipp.rot{color:#b42318;}\n.pz-spur{display:flex;gap:4px;margin-top:6px;}\n.pz-spur i{width:18px;height:4px;border-radius:2px;background:#e5dece;}\n.pz-spur i.d{background:var(--hb);} .pz-spur i.a{background:var(--or);}\n.pz-zb{grid-column:1/-1;display:flex;align-items:center;gap:8px;}\n.pz-go{flex:1;display:inline-flex;align-items:center;justify-content:center;gap:8px;min-height:46px;padding:0 14px;border-radius:12px;border:0;background:var(--navy);color:#fff;font-family:var(--c);font-weight:800;font-size:17px;letter-spacing:.05em;text-transform:uppercase;cursor:pointer;}\n.pz-z.gr .pz-go{background:var(--knopf);}   /* Weiß auf Orange braucht das dunklere Orange (4,9:1) */\n.pz-go svg{width:18px;height:18px;}\n.pz-go:hover{filter:brightness(1.1);}\n.pz-weiter{flex:none;display:inline-flex;align-items:center;gap:2px;min-height:46px;padding:0 10px 0 12px;border-radius:12px;border:1.5px solid var(--linie);background:transparent;color:var(--ink2);font:inherit;font-size:13px;font-weight:700;cursor:pointer;}\n.pz-weiter svg{width:15px;height:15px;}\n.pz-weiter:hover{border-color:var(--navy);color:var(--navy);}\n\n.pz-such{display:flex;align-items:center;gap:6px;min-height:42px;padding:0 12px;border-radius:999px;background:#fff;border:1px solid var(--linie);color:var(--ink2);flex:1 1 180px;max-width:280px;}\n.pz-such svg{width:16px;height:16px;flex:none;}\n.pz-such input{border:0;background:transparent;outline:none;font:inherit;font-size:15px;color:var(--ink);width:100%;min-width:0;}\n.pz-such input::placeholder{color:#8a8a94;}\n.pz-alle,.pz-mehr{display:block;margin:0 auto 12px;min-height:42px;padding:0 16px;border-radius:999px;border:1.5px solid var(--linie);background:#fff;color:var(--navy);font:inherit;font-size:14px;font-weight:700;cursor:pointer;}\n.pz-mehr{margin-top:14px;}\n\n.pz-werk{margin-top:30px;padding-top:18px;border-top:1px dashed var(--linie);}\n.pz-werk>div{display:flex;flex-wrap:wrap;gap:8px;}\n.pz-werk button{min-height:40px;padding:0 14px;border-radius:999px;border:1px solid var(--linie);background:var(--papier2);color:var(--ink);font:inherit;font-size:14px;font-weight:600;cursor:pointer;}\n.pz-werk button:hover{background:#fff;}\n\n/* Nachricht vorbereiten */\n.pz-msg{--or:#e8741f;}\n.pz-mk{display:flex;align-items:center;gap:12px;margin-bottom:12px;}\n.pz-mk h2{margin:0;} .pz-mk small{color:var(--ink2,#a2acbf);}\n.pz-mk .pz-lg{background:var(--lc,#1d2760);}\n.pz-wege{display:flex;flex-wrap:wrap;gap:8px;margin:6px 0 8px;}\n.pz-msg textarea{width:100%;font:inherit;font-size:15.5px;line-height:1.55;color:inherit;background:var(--surface2,#121826);border:1px solid var(--line,rgba(148,163,196,.2));border-radius:14px;padding:12px 14px;resize:vertical;}\n.pz-b2{display:inline-flex;align-items:center;gap:6px;min-height:44px;padding:0 16px;border-radius:12px;border:1px solid var(--line,rgba(148,163,196,.2));background:var(--surface3,#182033);color:inherit;font:inherit;font-weight:700;text-decoration:none;cursor:pointer;}\n.pz-b2 svg{width:17px;height:17px;}\n\n@media (max-width:420px){\n  .pz-go{font-size:15.5px;letter-spacing:.03em;padding:0 10px;gap:6px;}\n  .pz-go svg{display:none;}\n  .pz-weiter{padding:0 8px 0 10px;font-size:12.5px;}\n}\n@media (min-width:720px){\n  .pz-in{padding:44px 36px 30px;}\n  .pz-papier{padding:28px 28px 26px;}\n  .pz-st span{font-size:13px;}\n  .pz-z{grid-template-columns:auto 1fr auto;align-items:center;}\n  .pz-zb{grid-column:auto;}\n  .pz-go{flex:none;min-width:210px;}\n}\n@media (prefers-reduced-motion:reduce){ .pz-z,.pz-dot,.pz-st{transition:none;} }\n\n/* ---------- 0.72 · Gemeinsamer kompakter Kopf für alle Reiter im Partnerbereich ----------\n   Titel „Partner“ in Barlow Condensed, darunter eine waagerecht wischbare Reiterleiste in einer Zeile (44 px Tap-Ziel).\n   CI-Farben wie in der Zentrale: Navy #1d2760, Orange #e8741f (Knöpfe mit Weiß im dunkleren Orange #b8540c, Kontrast 4,9:1). */\n#panel-sponsoring{--pa-navy:#1d2760;--pa-or:#e8741f;--pa-knopf:#b8540c;--pa-c:'PZC','BarlowC','Arial Narrow',sans-serif;}\n#panel-sponsoring .spo-top{gap:8px;margin-bottom:12px;}\n#panel-sponsoring .spo-kopf{display:flex;align-items:baseline;gap:4px 12px;flex-wrap:wrap;}\n#panel-sponsoring .spo-kopf h2{margin:0;font-family:var(--pa-c);font-weight:900;font-size:32px;line-height:1;text-transform:uppercase;letter-spacing:.01em;}\n#panel-sponsoring .spo-kopf p{margin:0;font-size:13px;color:var(--ink3);}\n#panel-sponsoring .svt-seg.spo-seg{position:relative;display:flex!important;grid-template-columns:none!important;flex-wrap:nowrap;gap:6px;padding:2px 0;border:0;border-radius:0;background:none;overflow-x:auto;overscroll-behavior-x:contain;scroll-snap-type:x proximity;-webkit-overflow-scrolling:touch;scrollbar-width:none;}\n#panel-sponsoring .spo-seg::-webkit-scrollbar{display:none;}\n#panel-sponsoring .spo-seg button{flex:none;min-height:44px;padding:0 16px!important;border-radius:999px;border:1px solid var(--line);background:rgba(148,163,196,.07);color:var(--ink2);font-weight:700;font-size:14.5px!important;white-space:nowrap;scroll-snap-align:start;}\n#panel-sponsoring .spo-seg button.on{background:var(--pa-knopf);border-color:var(--pa-knopf);color:#fff;}\n#panel-sponsoring .spo-seg button:focus-visible{outline:3px solid var(--pa-or);outline-offset:2px;}\n/* Überschriften und Hauptknöpfe in der Vereinswelt (nicht Shop-Finanzen) */\n#panel-sponsoring .trh:not(.sf .trh),#panel-sponsoring .pe-h,.pa-blatt h2,.pe-form h2,.pe-form h3,.pd-f h2,.pt-f h2{font-family:'PZC','BarlowC','Arial Narrow',sans-serif;font-weight:800;text-transform:uppercase;letter-spacing:.03em;}\n#panel-sponsoring .trh:not(.sf .trh){font-size:19px;} #panel-sponsoring .pe-h{font-size:20px;}\n#panel-sponsoring .trh:not(.sf .trh) svg{color:var(--pa-or);}\n#panel-sponsoring .card h3.trh:not(.sf .trh)::before{background:var(--pa-or);}\n#panel-sponsoring .btn:not(.ghost):not(.sf .btn),.pa-blatt .btn:not(.ghost),.pe-form .btn:not(.ghost),.pd-f .btn:not(.ghost),.pt-f .btn:not(.ghost),.spo-w .btn:not(.ghost),#modal .og-form:has(#peDf) .btn:not(.ghost),#modal .og-form:has(#peBj) .btn:not(.ghost){background:#b8540c!important;border-color:#b8540c!important;color:#fff!important;box-shadow:none!important;}\n#panel-sponsoring .svt-chips button.on,#panel-sponsoring .chips4 button.on:not(.sf button){background:#b8540c!important;border-color:#b8540c!important;color:#fff!important;}\n#panel-sponsoring .pd-kk i{background:linear-gradient(90deg,#1d2760,#e8741f);}\n#panel-sponsoring .pe-bar::after{background:linear-gradient(90deg,#8fc9ec,#e8741f);}\n/* Shop-Finanzen (.sf) bleibt, wie es ist: die Regeln oben schließen es aus */\n\n/* ---------- Blätter (Termin, Formulare, Nachricht): fester Kopf, unten Platz für die Knopfleiste ---------- */\n#modal:has(.pa-blatt)>.close{display:none;}\n/* Das Overlay hat oben max(28px, Notch) und unten 90px Innenabstand; sticky zählt ab diesem Rand. Kopf und Knopfleiste sollen aber am echten Rand kleben. */\n.pa-bk{position:sticky;top:calc(env(safe-area-inset-top, 0px) - max(28px, env(safe-area-inset-top, 0px)));z-index:6;display:flex;align-items:center;gap:12px;margin:-6px -28px 12px;padding:10px 28px 10px;background:#131a29;border-bottom:1px solid var(--line);}\n.pa-bk h2{margin:0!important;flex:1;min-width:0;font-size:22px!important;}\n.pa-bx{flex:none;margin-left:auto;min-height:44px;padding:0 14px;border-radius:12px;border:1px solid var(--line);background:rgba(148,163,196,.07);color:var(--ink);font:inherit;font-weight:700;cursor:pointer;}\n.pa-blatt{padding-bottom:calc(6px + env(safe-area-inset-bottom));}\n.pa-blatt .sbact{z-index:5;bottom:-90px;padding-bottom:calc(12px + env(safe-area-inset-bottom));background:linear-gradient(180deg,transparent,#0f1420 26%);}\n.pa-blatt textarea{width:100%;font:inherit;font-weight:400;font-size:15px;line-height:1.5;color:var(--ink);background:var(--surface2,#121826);border:1.5px solid var(--line);border-radius:12px;padding:10px 12px;resize:vertical;-webkit-appearance:none;appearance:none;}\n.pz-msg .pa-bk{margin-top:-6px;}\nhtml[data-theme=\"hell\"] .pa-bk{background:var(--surface);}\nhtml[data-theme=\"hell\"] .pa-blatt .sbact{background:linear-gradient(180deg,transparent,var(--surface) 26%);}\n@media (max-width:640px){ .pa-bk{margin:-4px -18px 12px;padding:10px 18px;} .pa-bk h2{font-size:20px!important;} }\n.spo-w .spo-nav{justify-content:flex-end;}\n\n/* ---------- Firmen, Akte, Ausrüstung, Ablage (svm26) ---------- */\n.spo-ai{font-style:normal;display:inline-flex;vertical-align:-2px;} .spo-ai svg{width:14px;height:14px;}\n.spo-kont button svg{width:15px;height:15px;vertical-align:-2px;}\n#panel-sponsoring .spo-af{margin:4px 0 12px;}\n#panel-sponsoring .spo-af button{min-height:40px;}\n.spo-ak{display:none;}\n@media (max-width:640px){ #panel-sponsoring .spo-at-w{display:none;} .spo-ak{display:grid;gap:10px;} }\n.spo-akk{border:1px solid var(--line);border-radius:16px;padding:12px 14px 4px;background:rgba(148,163,196,.05);}\n.spo-akk h4{margin:0 0 4px;font-family:'PZC','BarlowC','Arial Narrow',sans-serif;font-weight:800;font-size:18px;text-transform:uppercase;letter-spacing:.03em;}\n.spo-akk h4 b{color:var(--pa-or,#e8741f);margin-right:4px;}\n.spo-akz{display:flex;align-items:center;justify-content:space-between;gap:10px;padding:10px 0;border-top:1px solid var(--line);}\n.spo-akz>div{min-width:0;} .spo-akz b{display:block;font-size:14.5px;} .spo-akz span{display:block;font-size:13px;color:var(--ink2);overflow-wrap:anywhere;}\n.spo-akz .btn{flex:none;min-height:44px!important;}\n.spo-gesucht{display:inline-block;margin-top:5px;font-style:normal;font-size:12px;font-weight:800;padding:3px 9px;border-radius:999px;background:rgba(232,116,31,.2);color:#f59b52;}\nhtml[data-theme=\"hell\"] .spo-gesucht{color:#8a3f08;}\n.spo-vdl{display:flex;align-items:center;justify-content:space-between;gap:12px;flex-wrap:wrap;}\n.spo-vdl>div{flex:1 1 240px;} .spo-vdl p{margin:0;}\n.spo-vdl .btn{min-height:44px!important;}\n\n/* ---------- Zentrale: Feinschliff 0.72 ---------- */\n.pz-st span{white-space:normal;hyphens:manual;overflow-wrap:normal;letter-spacing:-.02em;}\n.pz-prio{font-weight:700;}\n.pz-ruhe{font-size:12.5px;font-weight:600;color:#8a3f08;}\n\n/* ---------- 0.73 · Runde 10 ---------- */\n/* Kein doppelter Kopf: der App-Kopf sagt schon „Partner“. Der Titel bleibt für Screenreader. */\n#panel-sponsoring .spo-kopf{position:absolute!important;width:1px;height:1px;overflow:hidden;clip:rect(0 0 0 0);clip-path:inset(50%);white-space:nowrap;}\n#panel-sponsoring .spo-top{margin-bottom:10px;}\n/* Filter als ruhige Chips (Firmen, Präsentationen) */\n.spo-f2{display:flex;flex-wrap:wrap;gap:6px;margin:10px 0 12px;}\n.spo-f2 button{min-height:40px;padding:0 14px;border-radius:999px;border:1px solid var(--linie,var(--line));background:#fff;color:var(--ink,#1c1c22);font:inherit;font-size:14px;font-weight:700;cursor:pointer;}\n.spo-f2 button.on{background:#1d2760;border-color:#1d2760;color:#fff;}\n#panel-sponsoring .pd-such .spo-f2 button{background:rgba(148,163,196,.07);color:var(--ink2);border-color:var(--line);}\n#panel-sponsoring .pd-such .spo-f2 button.on{background:#b8540c;border-color:#b8540c;color:#fff;}\n.pd-such{display:flex;flex-wrap:wrap;align-items:center;gap:8px 12px;margin:4px 0 10px;}\n.pd-such .pz-such{background:var(--surface2,#121826);border-color:var(--line);color:var(--ink2);max-width:none;}\n.pd-such .pz-such input{color:var(--ink);}\n.pd-empf{color:#f59b52!important;font-weight:700;}\nhtml[data-theme=\"hell\"] .pd-empf{color:#8a3f08!important;}\n/* Firmenliste im Stil der Zentrale */\n.pz.pz-flach{box-shadow:none;}\n.pz-flach .pz-papier{padding:14px 12px 16px;}\n.spo-fk{display:flex;gap:8px;align-items:center;}\n.spo-fk .pz-such{max-width:none;flex:1 1 auto;}\n.spo-fk .spo-neu{flex:none;min-height:42px;background:#1d2760;color:#fff;border-color:#1d2760;}\n.pz-best{display:inline-block;margin-left:6px;padding:1px 7px;border-radius:6px;background:#e3eef9;color:#1d4b7a;font-size:11.5px;font-weight:800;vertical-align:2px;}\n/* Anrede fehlt: kurz fragen */\n.pz-anr{display:flex;flex-wrap:wrap;align-items:center;gap:8px;margin:0 0 12px;padding:10px 12px;border-radius:12px;background:rgba(232,116,31,.14);border:1px solid rgba(232,116,31,.4);}\n.pz-anr span{flex:1 1 200px;font-weight:700;}\n.pz-anr button{min-height:44px;min-width:72px;border-radius:999px;border:1.5px solid #e8741f;background:transparent;color:inherit;font:inherit;font-weight:800;cursor:pointer;}\n/* ---------- Firmenakte in den Vereinsfarben ---------- */\n.spo-akte .spo-av.pz-lg{width:48px;height:48px;border-radius:12px;background:var(--lc,#1d2760)!important;color:#fff;font-family:'PZC','BarlowC',sans-serif;font-weight:900;font-size:19px;display:grid;place-items:center;flex:none;}\n.spo-akte h2{font-family:'PZC','BarlowC','Arial Narrow',sans-serif;font-weight:800;text-transform:uppercase;letter-spacing:.02em;}\n.spo-akte .spo-stbar button.on{background:#1d2760!important;color:#fff!important;border-color:#8fc9ec!important;box-shadow:inset 0 0 0 1px #8fc9ec;}\n.spo-akte .spo-stbar button.on.s-partner{background:#e8741f!important;border-color:#e8741f!important;color:#1c1c22!important;box-shadow:none;}\n.spo-akte .btn:not(.ghost){background:#b8540c!important;border-color:#b8540c!important;color:#fff!important;box-shadow:none!important;}\n.spo-akte .spo-kont button.on{background:#1d2760;color:#fff;border-color:#8fc9ec;}\n.spo-kn[hidden]{display:none!important;}\n.spo-akte .spo-kn input{flex:1 1 180px;min-height:44px;padding:10px 12px;border-radius:12px;border:1.5px solid var(--line);background:var(--surface2,#121826);color:var(--ink);font:inherit;font-size:16px;}\n.spo-akte .spo-kn input::placeholder{color:var(--ink3);}\n.spo-frage{margin:10px 0;padding:12px 14px;border-radius:14px;background:rgba(232,116,31,.12);border:1px solid rgba(232,116,31,.45);}\n.spo-frage p{margin:0 0 8px;}\n.spo-gz{font-style:normal;font-weight:800;color:#f59b52;}\nhtml[data-theme=\"hell\"] .spo-gz{color:#8a3f08;}\n/* Steuerung: Hinweise, Mehr-Menü, Gegenzeichnen */\n.pe-hinw{margin:0;font-size:13px;color:var(--ink2);}\n.pe-auf-b .pe-mehr{margin-left:auto;}\n.pe-auf.art-gegen{border-color:rgba(232,116,31,.55);}\n.pe-auf.art-gegen .pe-ic{background:rgba(232,116,31,.18);color:#f59b52;}\n#panel-sponsoring .pe-n{background:#b8540c;}\n.pe-sig{position:relative;border:1.5px dashed var(--line);border-radius:12px;background:#fff;min-height:160px;}\n.pz-flach .spo-zr{display:block;touch-action:pan-y;}\n.pz-flach .spo-l{gap:10px;}\n\n/* ---------- 0.74 · Runde 11: eine Farblogik für alle Reiter ----------\n   Orange nur für die eine Hauptaktion. Gewählte Reiter, Filter und Chips: Hellblau #8fc9ec mit Navy-Schrift auf dunklem Grund, Navy mit Weiß auf hellem Grund. */\n#panel-sponsoring .spo-seg button.on,\n#panel-sponsoring .svt-chips button.on,#panel-sponsoring .chips4 button.on:not(.sf button),\n#panel-sponsoring .pd-such .spo-f2 button.on{background:#8fc9ec!important;border-color:#8fc9ec!important;color:#141b47!important;}\nhtml[data-theme=\"hell\"] #panel-sponsoring .spo-seg button.on,\nhtml[data-theme=\"hell\"] #panel-sponsoring .svt-chips button.on,html[data-theme=\"hell\"] #panel-sponsoring .chips4 button.on:not(.sf button),\nhtml[data-theme=\"hell\"] #panel-sponsoring .pd-such .spo-f2 button.on{background:#1d2760!important;border-color:#1d2760!important;color:#fff!important;}\n#panel-sponsoring .trh:not(.sf .trh) svg{color:#8fc9ec;}\n#panel-sponsoring .card h3.trh:not(.sf .trh)::before{background:#8fc9ec;}\nhtml[data-theme=\"hell\"] #panel-sponsoring .trh:not(.sf .trh) svg{color:#1d2760;}\nhtml[data-theme=\"hell\"] #panel-sponsoring .card h3.trh:not(.sf .trh)::before{background:#1d2760;}\n#panel-sponsoring .pe-n{background:#8fc9ec;color:#141b47;}\nhtml[data-theme=\"hell\"] #panel-sponsoring .pe-n{background:#1d2760;color:#fff;}\n/* Anrede-Frage: Frage über die volle Breite, Frau und Herr darunter nebeneinander */\n.pz-anr span{flex-basis:100%;}\n/* Zentrale: Sprung zu Firmen */\n.pz-zuf{display:inline-flex;align-items:center;justify-content:center;gap:6px;}\n.pz-zuf svg{width:16px;height:16px;}\n.pz-waechter small{display:block;}\n/* Firmenakte: Kopf mit Platz für ✕, Stand als eine Zeile, ein Hauptknopf */\n.spo-akte .mhead{padding-right:48px;}\n.spo-stand{margin:8px 0 10px;font-size:14px;color:var(--ink2);}\n.spo-stand b{color:var(--ink);}\n.spo-link{min-height:44px;padding:0 4px;border:0;background:none;color:#8fc9ec;font:inherit;font-weight:700;text-decoration:underline;text-underline-offset:3px;cursor:pointer;}\nhtml[data-theme=\"hell\"] .spo-link{color:#1d2760;}\n.spo-link:focus-visible{outline:3px solid #8fc9ec;outline-offset:2px;border-radius:6px;}\n.spo-next2{display:grid;gap:6px;margin:6px 0 12px;}\n.spo-next2 .btn{width:100%;min-height:48px!important;justify-content:center;}\n.spo-next2 small{font-size:12.5px;color:var(--ink2);}\n.spo-akt2{flex-wrap:wrap;gap:8px;margin:0 0 12px;}\n.spo-akt2 .btn{min-height:44px!important;}\n/* Präsentationen: alte Präsentationen ohne Firma */\n.pd-ohne{background:rgba(148,163,196,.16)!important;color:var(--ink2)!important;}\n/* Termin vorbereiten: Fertig-Blatt */\n.pt-wege{display:grid;gap:10px;margin:8px 0 4px;}\n.pt-wege .btn{width:100%;min-height:48px!important;justify-content:center;}\n/* Steuerung: Gegenzeichnen gebündelt, „Später“ zugeklappt, Geldkachel über die volle Breite */\n.pe-kpi.voll{grid-column:1/-1;}\n.pe-auf.art-gegen{border-color:rgba(143,201,236,.55);}\n.pe-auf.art-gegen .pe-ic{background:rgba(143,201,236,.16);color:#8fc9ec;}\nhtml[data-theme=\"hell\"] .pe-auf.art-gegen{border-color:#1d2760;}\n.pe-gz{margin-top:4px;}\n.pe-gz .pe-bdz small{font-variant-numeric:tabular-nums;}\n.pe-spaet{margin-top:18px;}\n.pe-spaet>summary{display:flex;align-items:center;flex-wrap:wrap;gap:4px 8px;min-height:48px;padding:6px 0;cursor:pointer;list-style:none;color:var(--ink2);font-weight:600;}\n.pe-spaet>summary::-webkit-details-marker{display:none;}\n.pe-spaet>summary span{font-family:'PZC','BarlowC','Arial Narrow',sans-serif;font-weight:800;font-size:20px;text-transform:uppercase;letter-spacing:.03em;color:var(--ink);}\n.pe-spaet>summary u{color:#8fc9ec;text-underline-offset:3px;}\nhtml[data-theme=\"hell\"] .pe-spaet>summary u{color:#1d2760;}\n.pe-spaet>summary:focus-visible{outline:3px solid #8fc9ec;outline-offset:2px;border-radius:8px;}\n.spo-stbar[hidden]{display:none!important;}\n.spo-stand .spo-link{display:inline-block;width:auto;min-height:0;padding:12px 4px;margin:-12px 0;vertical-align:baseline;}\n/* ---------- 0.74 · Rechtliche Absicherung ---------- */\n.pe-recht{margin:10px 0 0;padding:10px 12px;border-radius:12px;border:1px solid rgba(143,201,236,.45);background:rgba(143,201,236,.1);font-size:13.5px;line-height:1.45;color:var(--ink);}\nhtml[data-theme=\"hell\"] .pe-recht{border-color:#1d2760;background:#eef3fa;}\n.pe-vst.v-wartet{background:rgba(143,201,236,.18);color:#8fc9ec;}\nhtml[data-theme=\"hell\"] .pe-vst.v-wartet{color:#1d2760;}\n.spo-v.spo-wartet{border-left:3px solid #8fc9ec;padding-left:10px;}\n.pz-uwg{margin:0 0 12px;padding:12px 14px;border-radius:12px;background:rgba(143,201,236,.12);border:1px solid rgba(143,201,236,.45);}\n.pz-uwg p{margin:0 0 10px;font-size:14px;line-height:1.45;display:flex;gap:8px;align-items:flex-start;}\n.pz-uwg p svg{flex:none;width:16px;height:16px;margin-top:2px;}\n.pz-uwg .btn{min-height:44px!important;}\nhtml[data-theme=\"hell\"] .pz-uwg{background:#eef3fa;border-color:#1d2760;}\n\n/* ---------- 0.75 · Runde 12 ----------\n   Zentrale am Handy: Hero verdichtet, damit die erste Aufgabe vor dem ersten Wischen sichtbar ist */\n@media (max-width:600px){\n  .pz-in{padding:16px 16px 14px;}\n  .pz-hand{font-size:20px;}\n  .pz-h1{display:inline;margin:0 0 0 8px;font-size:30px;line-height:1;vertical-align:-2px;}\n  .pz-satz{margin:8px 0 0;font-size:15px;line-height:1.4;}\n  .pz-mehrsatz{display:none;}\n  .pz-weg{margin:10px -4px 0;}\n  .pz-st{padding:4px 1px 4px;gap:2px;}\n  .pz-st b{font-size:21px;}\n  .pz-dot{width:13px;height:13px;margin-bottom:2px;}\n  .pz-weg:before{top:12px;}\n  .pz-akt{flex-wrap:nowrap;gap:8px;margin-top:10px;}\n  .pz-b{min-height:44px;font-size:15.5px;padding:0 14px;}\n  .pz-ter{width:44px;padding:0;justify-content:center;flex:none;}\n  .pz-ter span{position:absolute;width:1px;height:1px;overflow:hidden;clip:rect(0 0 0 0);clip-path:inset(50%);white-space:nowrap;}\n  .pz-papier{padding-top:14px;}\n  .pz-waechter{margin-bottom:12px;}\n}\n/* Zentrale: „Als Nächstes“ kleiner, Grundzeile in Handschrift */\n.pz-h3{font-size:22px!important;margin:18px 2px 10px;}\n.pz-naechst{display:grid;gap:10px;}\n.pz-naechst .pz-z{padding:12px;}\n.pz-grund{color:#4a4a55!important;}\n.pz-nichts{margin:0 2px 10px;font-weight:700;color:var(--ink2,#4a4a55);}\n/* Akte: weitere Aktionen im Menü */\n.spo-mehr{position:relative;}\n.spo-mehr>summary{display:inline-flex;align-items:center;justify-content:center;min-width:44px;min-height:44px;border-radius:12px;border:1px solid var(--line);cursor:pointer;list-style:none;font-weight:800;}\n.spo-mehr>summary::-webkit-details-marker{display:none;}\n.spo-mehr>div{display:flex;flex-wrap:wrap;gap:8px;margin-top:8px;}\n.pe-ab{font-style:normal;font-weight:800;color:#f87171;}\nhtml[data-theme=\"hell\"] .pe-ab{color:#b91c1c;}\n/* Eine Farbsprache in den Partner-Reitern: Hinweis Orange, Info Hellblau, überfällig Rot, erledigt Grün */\n#panel-sponsoring .pe-kpi.warn b{color:#e8741f;} #panel-sponsoring .pe-kpi.rot b{color:#f87171;}\nhtml[data-theme=\"hell\"] #panel-sponsoring .pe-kpi.warn b{color:#b8540c;} html[data-theme=\"hell\"] #panel-sponsoring .pe-kpi.rot b{color:#b91c1c;}\n#panel-sponsoring .pe-auf .pe-ic{color:#8fc9ec!important;background:rgba(143,201,236,.14)!important;}\nhtml[data-theme=\"hell\"] #panel-sponsoring .pe-auf .pe-ic{color:#1d2760!important;background:#eef3fa!important;}\n#panel-sponsoring .pe-hin{border-left-color:#e8741f;}\n#panel-sponsoring .pe-w{background:rgba(143,201,236,.16);color:#8fc9ec;} #panel-sponsoring .pe-b{background:rgba(232,116,31,.16);color:#f59b52;}\n#panel-sponsoring .pe-lz.gelb{border-left-color:#e8741f;} #panel-sponsoring .pe-lz.ang{border-left-color:#8fc9ec;}\n#panel-sponsoring .pe-vst.v-ueberlegt{background:rgba(232,116,31,.16);color:#f59b52;}\n#panel-sponsoring .pe-zelle i{background:#8fc9ec;color:#141b47;}\n\n/* ---------- 0.76 · Runde 13 ---------- */\n/* Im Partnerbereich verdeckt der schwebende Co-Trainer-Knopf am Handy die Hauptknöpfe der Listen: dort ausblenden */\nbody:has(#panel-sponsoring.active) .trfab{display:none!important;}\n/* Erster Kontakt und Zustimmung (UWG), Impressum fehlt */\n.pz-uwg-k{display:flex;flex-wrap:wrap;gap:8px;}\n.pz-uwg-k .btn{min-height:44px!important;}\n.pz-zust{margin:0 0 10px;}\n.pz-imp{margin:0 0 12px;padding:12px 14px;border-radius:12px;background:rgba(239,68,68,.1);border:1px solid rgba(239,68,68,.45);}\n.pz-imp p{margin:0 0 10px;font-size:14px;line-height:1.45;display:flex;gap:8px;}\n.pz-imp p svg{flex:none;width:16px;height:16px;margin-top:2px;}\n.pz-ohne{margin:8px 0 0;padding:10px 12px;border-radius:12px;background:rgba(232,116,31,.12);border:1px solid rgba(232,116,31,.45);font-size:13.5px;line-height:1.45;}\n.pe-rot{margin:4px 0 10px;padding:10px 12px;border-radius:12px;border:1px solid rgba(239,68,68,.5);background:rgba(239,68,68,.1);color:#fca5a5;font-weight:700;font-size:14px;}\nhtml[data-theme=\"hell\"] .pe-rot{color:#b91c1c;background:#fdecec;}\n.pe-recht-h{margin:6px 0;}\n/* Gegenzeichnen: Frist je Zeile */\n.pe-bald{font-style:normal;font-weight:800;color:#f59b52;}\nhtml[data-theme=\"hell\"] .pe-bald{color:#b8540c;}\n.pe-zweite{font-size:12.5px;color:var(--ink2);max-width:150px;text-align:right;}\n.pe-spz{display:block;margin-top:3px;font-size:12px;color:var(--ink2);}\n.spo-ges{display:flex;flex-wrap:wrap;align-items:center;gap:8px;margin:-4px 0 12px;font-size:13px;color:var(--muted,#5b6070);}\n.spo-ges[hidden]{display:none;}\n.spo-ges input[type=date]{min-height:44px;padding:0 10px;border-radius:10px;border:1px solid var(--linie,var(--line));background:#fff;color:var(--ink,#1c1c22);font:inherit;font-size:15px;}\n.spo-csvz{display:flex;flex-wrap:wrap;align-items:center;gap:8px 12px;margin:14px 0 0;font-size:13px;color:var(--muted,#5b6070);}\n.spo-csvz .pz-b2{min-height:44px;}\n.pz-neuk{background:#dcf3e3;color:#1c6b3a;}\n.pz-vip{color:#d98a00;font-size:1.05em;vertical-align:baseline;}\n.spo-vipz{margin:2px 0 8px;font-size:13px;}\n.spo-vipz .spo-link{min-height:36px;}\n"; document.head.appendChild(s); }catch(e){} })();
/* =====================================================================
   Sportzentrale Beta 0.68 · Spieltagsstudio: Live-Ticker-Grafiken
   - Im Spieltagsstudio oben umschalten: „Spielplakat“ oder „Live-Ticker“
   - Ereignis wählen (Tor, Gelb, Rot, Wechsel), Spieler antippen, Minute und Spielstand, fertig: PNG oder Teilen
   - Ebenen wie im Plakat: Hintergrund, Licht, Schriftzug, Spieler, Wappen, Name, Info. Jede einzeln abschaltbar.
   - Kader je Mannschaft liegt in plakat_spiel (spiel = 'ticker-kader-A' / 'ticker-kader-D2', einstell.spieler),
     Fotos (freigestellt) im privaten Studio-Speicher unter assets/spieler/. Keine Namen im Code.
   - Schriften aus dem CI: Barlow Condensed (Schriftzug, Nummer, Nachname) und Barlow (Vorname), aus partner/.
   ===================================================================== */
const TKR = {
  modus:'plakat', sub:'A', art:'tor', profi:false, format:'quadrat', kader:{}, roh:{}, wahl:null, wahl2:null, schritt:'rein',
  minute:'', stand:'', suche:'', bilder:new Map(), urls:new Map(), laedt:false, pflege:false,
  ebenen:{ bg:true, licht:true, wort:true, spieler:true, wappen:true, name:true, info:true }
};
const TK_ART = {
  tor:{ wort:'TOR', titel:'Tor', akzent:'#1f8bff' },
  gelb:{ wort:'GELB', titel:'Gelbe Karte', akzent:'#ffd21f', karte:'#ffd21f' },
  rot:{ wort:'ROT', titel:'Rote Karte', akzent:'#ff3b3b', karte:'#e5262c' },
  wechsel:{ wort:'WECHSEL', titel:'Wechsel', akzent:'#1f8bff' }
};
// Gelb, Rot und Wechsel sind fertig in der Engine, sichtbar aber erst mit „Mehr Ereignisse“ (für Tickerer). Standard: nur Tore.
try{ TKR.profi = localStorage.getItem('sv_tk_profi') === '1'; }catch(e){}
const TK_FORMATE = { quadrat:[1080,1080,'Feed 1:1'], hoch:[1080,1350,'Feed 4:5'], story:[1080,1920,'Story 9:16'] };
const TK_EBENEN = [['bg','Hintergrund'],['licht','Licht und Linien'],['wort','Schriftzug'],['spieler','Spieler'],['wappen','Wappen'],['name','Nummer und Name'],['info','Minute und Spielstand']];
const TK_POS = { TW:'Tor', AB:'Abwehr', MF:'Mittelfeld', ST:'Angriff' };
const tkE = s => svEsc(s == null ? '' : String(s));

/* ---------- Schriften aus dem CI (Barlow, Barlow Condensed) ---------- */
let tkFontsBereit = null;
function tkFonts(){ if(tkFontsBereit) return tkFontsBereit;
  tkFontsBereit = (async () => { try{
    const L = [['TKC','partner/barlowc-900.woff2','900'],['TKC','partner/barlowc-800.woff2','800'],['TKC','partner/barlowc-700.woff2','700'],
               ['TKB','partner/barlow-500.woff2','500'],['TKB','partner/barlow-600.woff2','600']];
    await Promise.all(L.map(async ([f, u, w]) => { const ff = new FontFace(f, `url(${u})`, { weight:w }); await ff.load(); document.fonts.add(ff); }));
  }catch(e){ console.warn('Ticker-Schriften', e); } })();
  return tkFontsBereit; }

/* ---------- Bilder ---------- */
function tkBild(src){ if(!src) return Promise.resolve(null); if(TKR.bilder.has(src)) return TKR.bilder.get(src);
  const p = new Promise(ok => { const i = new Image(); i.crossOrigin = 'anonymous'; i.onload = () => ok(i); i.onerror = () => ok(null); i.src = src; });
  TKR.bilder.set(src, p); return p; }
async function tkUrls(pfade){ const neu = pfade.filter(p => p && !TKR.urls.has(p)); if(!neu.length) return;
  try{ for(let i = 0; i < neu.length; i += 80){ const { data, error } = await SVB.sb.storage.from('studio').createSignedUrls(neu.slice(i, i + 80), 6 * 3600);
      if(error) throw error; (data || []).forEach(d => { if(d.signedUrl) TKR.urls.set(d.path, d.signedUrl); }); } }
  catch(e){ console.warn('Spielerfotos', e); TKR.fotoFehler = e.message || String(e); } }
const tkFotoUrl = p => p ? TKR.urls.get(p) || null : null;

// Freigestelltes Foto: sichtbaren Bereich einmal ausmessen (Kopf oben, Breite), damit jede Grafik gleich sitzt
const tkMass = new WeakMap();
function tkUmriss(img){ if(tkMass.has(img)) return tkMass.get(img);
  const w = 120, h = Math.round(120 * img.naturalHeight / img.naturalWidth), c = document.createElement('canvas'); c.width = w; c.height = h;
  const x = c.getContext('2d', { willReadFrequently:true }); x.drawImage(img, 0, 0, w, h); const d = x.getImageData(0, 0, w, h).data;
  let t = h, b = 0, l = w, r = 0, frei = false;
  for(let y = 0; y < h; y++) for(let xx = 0; xx < w; xx++){ const a = d[(y * w + xx) * 4 + 3]; if(a > 40){ if(y < t) t = y; if(y > b) b = y; if(xx < l) l = xx; if(xx > r) r = xx; } else frei = true; }
  const f = img.naturalWidth / w, m = frei && b > t ? { x:l * f, y:t * f, w:(r - l + 1) * f, h:(b - t + 1) * f, frei:true } : { x:0, y:0, w:img.naturalWidth, h:img.naturalHeight, frei:false };
  tkMass.set(img, m); return m; }

/* ---------- Kader laden und speichern ---------- */
async function tkKaderLaden(){
  const { data, error } = await SVB.sb.from('plakat_spiel').select('spiel,einstell').in('spiel', ['ticker-kader-A', 'ticker-kader-D2']);
  if(error) throw error;
  TKR.kader = { A:[], D2:[] };
  (data || []).forEach(r => { const s = r.spiel.replace('ticker-kader-', ''); TKR.kader[s] = ((r.einstell || {}).spieler || []).map(p => Object.assign({ aktiv:true }, p)); });
  await tkUrls([...TKR.kader.A, ...TKR.kader.D2].map(p => p.bild).filter(Boolean));
}
async function tkKaderSpeichern(sub){
  const L = (TKR.kader[sub] || []).map(p => ({ id:p.id, vorname:String(p.vorname || '').trim(), nachname:String(p.nachname || '').trim(),
    nr:p.nr === '' || p.nr == null ? '' : +p.nr, pos:p.pos || '', bild:p.bild || '', quelle:p.quelle || '', aktiv:p.aktiv !== false }));
  await svtRpc('plakat_merken', { p:{ spiel:'ticker-kader-' + sub, sub, einstell:{ spieler:L, stand:new Date().toISOString() } } });
}
const tkSpieler = () => (TKR.kader[TKR.sub] || []).filter(p => p.aktiv !== false)
  .sort((a, b) => (a.nr === '' ? 999 : +a.nr) - (b.nr === '' ? 999 : +b.nr) || String(a.nachname).localeCompare(String(b.nachname), 'de'));
const tkFinde = id => (TKR.kader[TKR.sub] || []).find(p => p.id === id) || null;

/* ---------- Malen ---------- */
let tkKorn = null;
function tkKornMuster(ctx){ if(tkKorn) return ctx.createPattern(tkKorn, 'repeat');
  const c = document.createElement('canvas'); c.width = c.height = 220; const x = c.getContext('2d'); let s = 1896;
  const r = () => (s = (s * 16807) % 2147483647) / 2147483647;
  for(let i = 0; i < 2600; i++){ const a = r(); x.fillStyle = a < .5 ? `rgba(120,170,255,${.12 + r() * .25})` : `rgba(255,255,255,${.08 + r() * .2})`;
    const w = 1 + r() * 2.4; x.fillRect(r() * 220, r() * 220, w, w * (0.4 + r())); }
  tkKorn = c; return ctx.createPattern(c, 'repeat'); }

function tkLayout(W, H){
  const dy = H - 1080, k = dy > 400;   // Story bekommt mehr Luft oben
  return { W, H,
    wortY: 640 + dy * (k ? .52 : .55), wortMax: 0.9 * W,
    spielerTop: 150 + dy * (k ? .40 : .45), spielerX: 0.64 * W,
    nrY: 870 + dy, vorY: 915 + dy, nachY: 990 + dy, textX: 112,
    infoY: 695 + dy, wappen:{ x:W - 290, y:k ? 140 : 80, w:230 },
    linieL:{ x:80, y1:560 + dy, y2:H }, linieR:{ x:W - 175, y1:0, y2:(k ? 140 : 80) - 8 } };
}

function tkMalen(cv, S, A, skala = 1){
  const [W, H] = TK_FORMATE[S.format] || TK_FORMATE.quadrat;
  cv.width = W * skala; cv.height = H * skala;
  const ctx = cv.getContext('2d'); ctx.setTransform(skala, 0, 0, skala, 0, 0); ctx.imageSmoothingQuality = 'high';
  const L = tkLayout(W, H), E = S.ebenen, art = TK_ART[S.art] || TK_ART.tor, p = S.spieler, p2 = S.spieler2;
  const wx = S.art === 'wechsel' && p2;   // Wechsel: Block etwas höher, Platz für die Zeile „raus“
  if(wx){ L.nrY -= 52; L.vorY -= 52; L.nachY -= 52; L.infoY = L.wortY + 36; }

  // 1 Hintergrund: Flutlichtabend, blau getönt, Ränder dunkel
  ctx.fillStyle = '#050c1f'; ctx.fillRect(0, 0, W, H);
  if(E.bg && A.bg){ const b = A.bg, sc = Math.max(W / b.width, H / b.height) * 1.04, bw = b.width * sc, bh = b.height * sc;
    ctx.save(); ctx.filter = 'saturate(.55) brightness(.9)'; ctx.drawImage(b, (W - bw) * .5 - W * .06, 0, bw, bh); ctx.restore();
    ctx.fillStyle = 'rgba(6,22,64,.55)'; ctx.globalCompositeOperation = 'multiply'; ctx.fillRect(0, 0, W, H); ctx.globalCompositeOperation = 'source-over'; }
  { const g = ctx.createRadialGradient(W * .5, H * .45, W * .1, W * .5, H * .5, Math.max(W, H) * .8);
    g.addColorStop(0, 'rgba(12,40,110,0)'); g.addColorStop(1, 'rgba(2,6,20,.82)'); ctx.fillStyle = g; ctx.fillRect(0, 0, W, H); }
  if(E.wappen && A.logo){ ctx.save(); ctx.globalAlpha = .07; ctx.filter = 'blur(2px) grayscale(.3)';
    const w = W * .42, h = w * A.logo.height / A.logo.width; ctx.drawImage(A.logo, W - w * .62, H * .66 - h / 2, w, h); ctx.restore(); }

  // 2 Licht: blaue Schlieren, feine Linien
  if(E.licht){ ctx.save(); ctx.globalCompositeOperation = 'screen';
    const streif = (y, a, dicke) => { const g = ctx.createLinearGradient(0, 0, W, 0); g.addColorStop(0, 'rgba(40,120,255,0)'); g.addColorStop(.35, `rgba(60,140,255,${a})`); g.addColorStop(.7, `rgba(90,170,255,${a * .6})`); g.addColorStop(1, 'rgba(40,120,255,0)');
      ctx.fillStyle = g; ctx.shadowColor = 'rgba(40,130,255,.9)'; ctx.shadowBlur = 18; ctx.fillRect(0, y, W, dicke); };
    streif(L.wortY - 330, .28, 2); streif(L.wortY + 175, .36, 2.5); streif(L.wortY + 190, .14, 1);
    const glow = ctx.createRadialGradient(W * .5, L.wortY - 120, 10, W * .5, L.wortY - 120, W * .55); glow.addColorStop(0, 'rgba(30,110,255,.30)'); glow.addColorStop(1, 'rgba(30,110,255,0)');
    ctx.shadowBlur = 0; ctx.fillStyle = glow; ctx.fillRect(0, 0, W, H); ctx.restore();
    ctx.fillStyle = art.akzent; ctx.globalAlpha = .9; ctx.fillRect(L.linieL.x, L.linieL.y1, 3, L.linieL.y2 - L.linieL.y1); ctx.fillRect(L.linieR.x, L.linieR.y1, 3, L.linieR.y2 - L.linieR.y1); ctx.globalAlpha = 1; }

  // 3 Schriftzug: Barlow Condensed Black, hell nach blau, mit Korn
  if(E.wort){ const wort = art.wort; let fs = 520; ctx.font = `900 ${fs}px TKC`; try{ ctx.letterSpacing = '6px'; }catch(e){}
    let mw = ctx.measureText(wort).width; const ziel = wort.length > 4 ? W * .94 : L.wortMax; fs = Math.min(560, fs * ziel / mw);
    const c = document.createElement('canvas'); c.width = W; c.height = H; const x = c.getContext('2d');
    x.font = `900 ${fs}px TKC`; try{ x.letterSpacing = Math.round(fs * .012) + 'px'; }catch(e){} x.textAlign = 'center'; x.textBaseline = 'alphabetic';
    const top = L.wortY - fs * .72, g = x.createLinearGradient(0, top, 0, L.wortY);
    g.addColorStop(0, '#ffffff'); g.addColorStop(.55, '#e8f1ff'); g.addColorStop(1, S.art === 'tor' || S.art === 'wechsel' ? '#7db4ff' : art.akzent);
    x.fillStyle = g; x.fillText(wort, W / 2, L.wortY);
    x.globalCompositeOperation = 'source-atop'; x.fillStyle = tkKornMuster(x); x.globalAlpha = .55; x.fillRect(0, 0, W, H);
    ctx.save(); ctx.shadowColor = 'rgba(30,120,255,.35)'; ctx.shadowBlur = 40; ctx.drawImage(c, 0, 0); ctx.restore(); try{ ctx.letterSpacing = '0px'; }catch(e){} }

  // 4 Spieler: freigestellt vor dem Schriftzug, mit blauem Randlicht und Schatten. Ohne Foto: große Rückennummer.
  if(E.spieler && p){ const img = A.foto;
    if(img){ const m = tkUmriss(img), hoch = H - L.spielerTop, kopfFoto = m.h / m.w < 1.05, unten = m.y + m.h >= img.naturalHeight * .97;
      // Fotos, die unten angeschnitten sind (Brustbild), stehen immer auf der Unterkante, damit keine harte Kante im Bild bleibt
      let sc = Math.min(hoch / m.h, (W * (kopfFoto ? .62 : unten ? .98 : .78)) / m.w); const dw = img.naturalWidth * sc, dh = img.naturalHeight * sc;
      const x0 = L.spielerX - (m.x + m.w / 2) * sc, y0 = unten ? H + 2 - (m.y + m.h) * sc : L.spielerTop - m.y * sc;
      ctx.save(); ctx.shadowColor = 'rgba(50,130,255,.55)'; ctx.shadowBlur = 34; ctx.drawImage(img, x0, y0, dw, dh); ctx.restore();
      ctx.save(); ctx.shadowColor = 'rgba(0,6,24,.65)'; ctx.shadowBlur = 60; ctx.shadowOffsetY = 18; ctx.drawImage(img, x0, y0, dw, dh); ctx.restore();
      if(!m.frei){ const g = ctx.createLinearGradient(0, y0 + dh * .7, 0, y0 + dh); g.addColorStop(0, 'rgba(5,12,31,0)'); g.addColorStop(1, 'rgba(5,12,31,1)'); ctx.fillStyle = g; ctx.fillRect(x0, y0 + dh * .7, dw, dh * .3 + 2); }
    } else if(p.nr !== '' && p.nr != null){ ctx.save(); ctx.font = `900 ${H * .62}px TKC`; ctx.textAlign = 'center';
      const g = ctx.createLinearGradient(0, H * .25, 0, H); g.addColorStop(0, 'rgba(70,150,255,.85)'); g.addColorStop(1, 'rgba(20,70,190,.2)');
      ctx.strokeStyle = g; ctx.lineWidth = 8; ctx.strokeText(String(p.nr), L.spielerX + 40, H * .9); ctx.restore(); }
    // Untere Kante weich ausblenden, damit Name und Nummer sauber stehen
    const g = ctx.createLinearGradient(0, H - 260, 0, H); g.addColorStop(0, 'rgba(4,10,28,0)'); g.addColorStop(1, 'rgba(4,10,28,.55)'); ctx.fillStyle = g; ctx.fillRect(0, H - 260, W, 260); }

  // 5 Wappen oben rechts
  if(E.wappen && A.logo){ const w = L.wappen.w, h = w * A.logo.height / A.logo.width; ctx.save(); ctx.shadowColor = 'rgba(0,0,0,.45)'; ctx.shadowBlur = 24; ctx.shadowOffsetY = 6; ctx.drawImage(A.logo, L.wappen.x, L.wappen.y, w, h); ctx.restore(); }

  // 6 Nummer, Vorname gesperrt, Nachname fett
  if(E.name && p){ ctx.textAlign = 'left'; ctx.textBaseline = 'alphabetic';
    // Weicher dunkler Grund hinter Nummer und Name, ohne Kante
    { ctx.save(); ctx.translate(L.textX + 170, L.vorY - 10); ctx.scale(1.7, 1); const g = ctx.createRadialGradient(0, 0, 0, 0, 0, 230);
      g.addColorStop(0, 'rgba(3,8,24,.62)'); g.addColorStop(.6, 'rgba(3,8,24,.32)'); g.addColorStop(1, 'rgba(3,8,24,0)'); ctx.fillStyle = g; ctx.fillRect(-240, -240, 480, 480); ctx.restore(); }
    if(p.nr !== '' && p.nr != null){ ctx.font = `900 ${wx ? 160 : 190}px TKC`; ctx.fillStyle = TK_ART.tor.akzent; ctx.save(); ctx.shadowColor = 'rgba(0,0,0,.35)'; ctx.shadowBlur = 20; ctx.fillText(String(p.nr), L.textX - 6, L.nrY); ctx.restore(); }
    ctx.save(); ctx.shadowColor = 'rgba(0,0,0,.55)'; ctx.shadowBlur = 16;
    ctx.font = '500 36px TKB'; ctx.fillStyle = '#ffffff'; try{ ctx.letterSpacing = '11px'; }catch(e){} if(wx){ ctx.save(); ctx.shadowBlur = 0; ctx.fillStyle = '#13a35a'; ctx.beginPath(); ctx.roundRect ? ctx.roundRect(L.textX, L.vorY - 30, 92, 38, 5) : ctx.rect(L.textX, L.vorY - 30, 92, 38); ctx.fill();
      ctx.font = '700 26px TKC'; ctx.fillStyle = '#ffffff'; try{ ctx.letterSpacing = '4px'; }catch(e){} ctx.fillText('REIN', L.textX + 15, L.vorY - 2); ctx.restore(); ctx.font = '500 36px TKB'; try{ ctx.letterSpacing = '11px'; }catch(e){} }
    ctx.fillText(String(p.vorname || '').toUpperCase(), L.textX + (wx ? 112 : 0), L.vorY); try{ ctx.letterSpacing = '1px'; }catch(e){}
    let fs = 84; ctx.font = `800 ${fs}px TKC`; const nn = String(p.nachname || '').toUpperCase(); const mw = W * .44; let w = ctx.measureText(nn).width;
    if(w > mw){ fs = Math.max(46, fs * mw / w); ctx.font = `800 ${fs}px TKC`; } ctx.fillText(nn, L.textX - 2, L.nachY); try{ ctx.letterSpacing = '0px'; }catch(e){} ctx.restore();
    if(S.art === 'wechsel' && p2){ const y = Math.min(H - 26, L.nachY + 64); ctx.save(); ctx.textAlign = 'left';
      ctx.fillStyle = '#e5262c'; ctx.beginPath(); ctx.roundRect ? ctx.roundRect(L.textX, y - 30, 92, 38, 5) : ctx.rect(L.textX, y - 30, 92, 38); ctx.fill();
      ctx.font = '700 26px TKC'; ctx.fillStyle = '#ffffff'; try{ ctx.letterSpacing = '4px'; }catch(e){} ctx.fillText('RAUS', L.textX + 12, y - 2); try{ ctx.letterSpacing = '1px'; }catch(e){}
      ctx.font = '700 38px TKC'; ctx.shadowColor = 'rgba(0,0,0,.6)'; ctx.shadowBlur = 12;
      const t = `${p2.nr !== '' && p2.nr != null ? p2.nr + '  ' : ''}${String(p2.vorname || '').toUpperCase()} ${String(p2.nachname || '').toUpperCase()}`.trim(); ctx.fillText(t, L.textX + 108, y); try{ ctx.letterSpacing = '0px'; }catch(e){} ctx.restore();
    } }

  // 7 Minute und Spielstand, bei Karten die Karte
  if(E.info){ const teile = [S.minute ? String(S.minute).replace(/'$/, '') + '\'' : '', S.stand || ''].filter(Boolean);
    let x = L.textX; const y = L.infoY;
    if(art.karte){ ctx.save(); ctx.translate(x + 22, y - 14); ctx.rotate(-.14); ctx.fillStyle = art.karte; ctx.shadowColor = 'rgba(0,0,0,.45)'; ctx.shadowBlur = 16;
      ctx.beginPath(); ctx.roundRect ? ctx.roundRect(-20, -29, 40, 58, 5) : ctx.rect(-20, -29, 40, 58); ctx.fill(); ctx.restore(); x += 66; }
    if(teile.length){ ctx.save(); ctx.font = '700 40px TKC'; ctx.fillStyle = '#a9ccff'; try{ ctx.letterSpacing = '4px'; }catch(e){} ctx.fillText(teile.join('  |  '), x, y); ctx.restore(); } }
  return cv;
}

/* ---------- Oberfläche ---------- */
{ const _po = pkOberflaeche; pkOberflaeche = function(P){ const r = _po.apply(this, arguments); tkSchalter(P); return r; }; }
function tkSchalter(P){ if(!P || P.querySelector('.tk-modus')) return;
  const d = document.createElement('div'); d.className = 'tk-modus'; d.setAttribute('role', 'tablist');
  d.innerHTML = `<button type="button" role="tab" data-tkm="plakat" class="${TKR.modus === 'plakat' ? 'on' : ''}">${SVI('cal')} Spielplakat</button>
    <button type="button" role="tab" data-tkm="ticker" class="${TKR.modus === 'ticker' ? 'on' : ''}">${SVI('activity')} Live-Ticker</button>
    <button type="button" role="tab" data-tkm="ergebnis" class="${TKR.modus === 'ergebnis' ? 'on' : ''}">${SVI('trophy')} Ergebnis</button>`;
  P.insertBefore(d, P.firstChild);
  d.querySelectorAll('[data-tkm]').forEach(b => b.onclick = () => tkModus(b.dataset.tkm));
  if(TKR.modus === 'ticker') tkStart(P); else if(TKR.modus === 'ergebnis' && typeof erStart === 'function') erStart(P); }
async function tkModus(m){ const P = document.getElementById('panel-plakat'); if(!P || TKR.modus === m) return; TKR.modus = m;
  if(m === 'plakat'){ pkOberflaeche(P); if(PK.spiele.length) await pkSpielWaehlen(PK.gewaehltIdx || 0); else { pkTexteBauen(); pkZeichnen(); pkTexteZeigen(); } return; }
  P.querySelectorAll(':scope > :not(.tk-modus)').forEach(e => e.remove()); P.querySelectorAll('.tk-modus [data-tkm]').forEach(b => b.classList.toggle('on', b.dataset.tkm === m));
  if(m === 'ergebnis' && typeof erStart === 'function') return erStart(P);
  tkStart(P); }

async function tkStart(P){
  P.querySelectorAll(':scope > :not(.tk-modus)').forEach(e => e.remove());
  const h = document.createElement('div'); h.className = 'tk-wrap'; h.innerHTML = '<div class="card"><div class="empty">Lade Kader und Fotos …</div></div>'; P.appendChild(h);
  try{ await Promise.all([tkFonts(), tkKaderLaden()]); }catch(e){ h.innerHTML = `<div class="card"><div class="empty">Kader konnte nicht geladen werden: ${tkE(e.message || e)}</div></div>`; return; }
  if(PK.s && PK.s.sub && TKR.kader[PK.s.sub] && TKR.kader[PK.s.sub].length) TKR.sub = PK.s.sub;
  const L = tkSpieler(); if(!TKR.wahl || !tkFinde(TKR.wahl)) TKR.wahl = (L.find(p => p.bild) || L[0] || {}).id || null;
  if(!TKR.profi) TKR.art = 'tor';
  tkOberflaeche(h); tkZeichnen(); }

function tkOberflaeche(h){
  const fm = Object.entries(TK_FORMATE).map(([k, v]) => `<button type="button" class="btn sm ghost tk-fmt${TKR.format === k ? ' on' : ''}" data-tkf="${k}">${tkE(v[2])}</button>`).join('');
  const arten = Object.entries(TK_ART).map(([k, a]) => `<button type="button" class="tk-art${TKR.art === k ? ' on' : ''}" data-tka="${k}" style="--ak:${a.akzent}" aria-label="${tkE(a.titel)}">${tkE(a.wort)}</button>`).join('');
  h.innerHTML = `
    <div class="card pk-vorschau tk-vorschau">
      <div class="pk-buehne tk-buehne"><canvas id="tkCanvas" aria-label="Vorschau der Ticker-Grafik"></canvas></div>
      <div class="pk-unten"><div class="pk-fmts">${fm}</div>
        <div class="pk-aktion"><button type="button" class="btn sm ghost" id="tkTeilen">${SVI('share')} Teilen</button><button type="button" class="btn sm" id="tkExport">${SVI('download')} PNG laden</button></div></div>
    </div>
    <div class="card pk-steuer tk-steuer">
      <div class="tk-arten" role="tablist"${TKR.profi ? '' : ' hidden'}>${arten}</div>
      <div class="tk-zeile">
        <div class="pk-seg tk-team" role="tablist"><button type="button" data-tks="A" class="${TKR.sub === 'A' ? 'on' : ''}">Erste</button><button type="button" data-tks="D2" class="${TKR.sub === 'D2' ? 'on' : ''}">Zweite</button></div>
        <label class="tk-feld"><span>Minute</span><input id="tkMin" inputmode="numeric" maxlength="5" placeholder="23" value="${tkE(TKR.minute)}"></label>
        <label class="tk-feld"><span>Spielstand</span><input id="tkStand" maxlength="9" placeholder="1:0" value="${tkE(TKR.stand)}"></label>
      </div>
      <p class="tk-hinweis" id="tkHinweis"></p>
      <input type="search" class="tk-suche" id="tkSuche" placeholder="Spieler oder Nummer suchen" value="${tkE(TKR.suche)}">
      <div class="tk-raster" id="tkRaster"></div>
      <label class="tk-profi"><input type="checkbox" id="tkProfi"${TKR.profi ? ' checked' : ''}><span><b>Mehr Ereignisse</b> Gelbe und Rote Karte, Wechsel (für Tickerer)</span></label>
      <details class="tk-eb"><summary>Ebenen</summary><div>${TK_EBENEN.map(([k, t]) => `<label class="pk-eb"><input type="checkbox" data-tke="${k}"${TKR.ebenen[k] ? ' checked' : ''}><span>${tkE(t)}</span></label>`).join('')}</div></details>
      <button type="button" class="btn ghost sm tk-pflege-b" id="tkPflege">${SVI('users')} Kader pflegen: Nummern, Namen, Fotos</button>
    </div>`;
  h.querySelectorAll('[data-tkf]').forEach(b => b.onclick = () => { TKR.format = b.dataset.tkf; h.querySelectorAll('[data-tkf]').forEach(x => x.classList.toggle('on', x === b)); tkZeichnen(); });
  h.querySelectorAll('[data-tka]').forEach(b => b.onclick = () => { TKR.art = b.dataset.tka; h.querySelectorAll('[data-tka]').forEach(x => x.classList.toggle('on', x === b)); TKR.wahl2 = null; TKR.schritt = 'rein'; tkRaster(); tkZeichnen(); });
  h.querySelectorAll('[data-tks]').forEach(b => b.onclick = () => { TKR.sub = b.dataset.tks; h.querySelectorAll('[data-tks]').forEach(x => x.classList.toggle('on', x === b));
    const L = tkSpieler(); TKR.wahl = (L.find(p => p.bild) || L[0] || {}).id || null; TKR.wahl2 = null; TKR.schritt = 'rein'; tkRaster(); tkZeichnen(); });
  h.querySelector('#tkMin').oninput = e => { TKR.minute = e.target.value.replace(/[^\d+]/g, ''); tkZeichnenBald(); };
  h.querySelector('#tkStand').oninput = e => { TKR.stand = e.target.value.replace(/[^\d: ]/g, '').trim(); tkZeichnenBald(); };
  h.querySelector('#tkSuche').oninput = e => { TKR.suche = e.target.value; tkRaster(); };
  h.querySelectorAll('[data-tke]').forEach(c => c.onchange = () => { TKR.ebenen[c.dataset.tke] = c.checked; tkZeichnen(); });
  h.querySelector('#tkExport').onclick = () => tkExport(false);
  h.querySelector('#tkTeilen').onclick = () => tkExport(true);
  h.querySelector('#tkPflege').onclick = tkPflege;
  h.querySelector('#tkProfi').onchange = e => { TKR.profi = e.target.checked; try{ localStorage.setItem('sv_tk_profi', TKR.profi ? '1' : '0'); }catch(x){}
    h.querySelector('.tk-arten').hidden = !TKR.profi;
    if(!TKR.profi && TKR.art !== 'tor'){ TKR.art = 'tor'; TKR.wahl2 = null; h.querySelectorAll('[data-tka]').forEach(x => x.classList.toggle('on', x.dataset.tka === 'tor')); tkRaster(); tkZeichnen(); } };
  tkRaster(); }

function tkRaster(){ const R = document.getElementById('tkRaster'); if(!R) return;
  const q = TKR.suche.trim().toLowerCase(), L = tkSpieler().filter(p => !q || `${p.nr} ${p.vorname} ${p.nachname}`.toLowerCase().includes(q));
  const H = document.getElementById('tkHinweis');
  if(H) H.textContent = TKR.art !== 'wechsel' ? '' : TKR.schritt === 'raus' ? 'Jetzt den Spieler antippen, der rausgeht.' : TKR.schritt === 'fertig' ? 'Wechsel steht. Einen der beiden nochmal antippen tauscht rein und raus.' : 'Erst den Spieler antippen, der reinkommt, dann den, der rausgeht.';
  if(!L.length){ R.innerHTML = `<div class="empty">${(TKR.kader[TKR.sub] || []).length ? 'Kein Treffer.' : 'Für diese Mannschaft ist noch kein Kader angelegt. Unten „Kader pflegen“.'}</div>`; return; }
  R.innerHTML = L.map(p => { const u = tkFotoUrl(p.bild), an = p.id === TKR.wahl, raus = p.id === TKR.wahl2;
    return `<button type="button" class="tk-sp${an ? ' on' : ''}${raus ? ' raus' : ''}" data-tkp="${tkE(p.id)}" aria-pressed="${an}">
      <span class="tk-bild">${u ? `<img src="${tkE(u)}" alt="" loading="lazy">` : `<i>${tkE(p.nr === '' ? '?' : p.nr)}</i>`}</span>
      <b>${p.nr !== '' && p.nr != null ? `<em>${tkE(p.nr)}</em> ` : ''}${tkE(p.nachname)}</b><small>${tkE(p.vorname)}</small>${raus ? '<span class="tk-tag">raus</span>' : an && TKR.art === 'wechsel' && TKR.schritt !== 'rein' ? '<span class="tk-tag rein">rein</span>' : ''}</button>`; }).join('');
  R.querySelectorAll('[data-tkp]').forEach(b => b.onclick = () => { const id = b.dataset.tkp;
    if(TKR.art !== 'wechsel'){ TKR.wahl = id; }
    else if(TKR.schritt === 'raus'){ if(id !== TKR.wahl){ TKR.wahl2 = id; TKR.schritt = 'fertig'; } }
    else if(TKR.schritt === 'fertig' && (id === TKR.wahl || id === TKR.wahl2)){ [TKR.wahl, TKR.wahl2] = [TKR.wahl2, TKR.wahl]; }
    else { TKR.wahl = id; TKR.wahl2 = null; TKR.schritt = 'raus'; }
    tkRaster(); tkZeichnen(); }); }

let tkZeit = 0;
function tkZeichnenBald(){ clearTimeout(tkZeit); tkZeit = setTimeout(tkZeichnen, 120); }
async function tkAssets(){ const p = tkFinde(TKR.wahl);
  const [bg, logo, foto] = await Promise.all([tkBild('plakat/foto/night.webp'), tkBild('logo.png'), tkBild(p && tkFotoUrl(p.bild))]); return { bg, logo, foto }; }
function tkStand(){ return { art:TKR.art, format:TKR.format, minute:TKR.minute, stand:TKR.stand, ebenen:{ ...TKR.ebenen }, spieler:tkFinde(TKR.wahl), spieler2:TKR.art === 'wechsel' ? tkFinde(TKR.wahl2) : null }; }
async function tkZeichnen(){ const cv = document.getElementById('tkCanvas'); if(!cv) return; const n = ++TKR.malen;
  await tkFonts(); const A = await tkAssets(); if(n !== TKR.malen) return; tkMalen(cv, tkStand(), A, 1); }
TKR.malen = 0;

let tkLaeuft = false;
async function tkExport(teilen){ if(tkLaeuft) return; const p = tkFinde(TKR.wahl); if(!p){ kToast('Bitte zuerst einen Spieler antippen'); return; }
  if(TKR.art === 'wechsel' && !TKR.wahl2){ kToast('Bitte noch den Spieler wählen, der rausgeht'); return; }
  tkLaeuft = true;
  try{ await tkFonts(); const cv = document.createElement('canvas'); tkMalen(cv, tkStand(), await tkAssets(), 1);
    const blob = await new Promise(ok => cv.toBlob(ok, 'image/png')); if(!blob) throw new Error('PNG konnte nicht erzeugt werden');
    const name = `SVBSC-${(TK_ART[TKR.art] || {}).wort || 'TICKER'}-${TKR.minute ? TKR.minute + 'min-' : ''}${String(p.nachname || '').replace(/[^\wäöüÄÖÜß-]/g, '')}-${TKR.format}.png`;
    const file = new File([blob], name, { type:'image/png' });
    if(teilen && navigator.canShare && navigator.canShare({ files:[file] })){ try{ await navigator.share({ files:[file], title:(TK_ART[TKR.art] || {}).titel }); return; }catch(e){ if(e && e.name === 'AbortError') return; } }
    const a = document.createElement('a'); a.href = URL.createObjectURL(blob); a.download = name; document.body.appendChild(a); a.click(); a.remove(); setTimeout(() => URL.revokeObjectURL(a.href), 8000);
    kToast('Grafik als PNG geladen');
  }catch(e){ console.warn('Ticker-Export', e); kToast('Export hat nicht geklappt, bitte nochmal'); }
  finally{ tkLaeuft = false; } }

/* ---------- Kader pflegen ---------- */
function tkPflege(){ const sub = TKR.sub, L = (TKR.kader[sub] = TKR.kader[sub] || []);
  const zeile = (p, i) => { const u = tkFotoUrl(p.bild);
    return `<div class="tk-kz${p.aktiv === false ? ' aus' : ''}" data-i="${i}">
      <span class="tk-bild sm">${u ? `<img src="${tkE(u)}" alt="">` : '<i>?</i>'}</span>
      <input class="tk-nr" data-f="nr" inputmode="numeric" maxlength="2" value="${tkE(p.nr)}" aria-label="Rückennummer">
      <input data-f="vorname" value="${tkE(p.vorname)}" aria-label="Vorname" placeholder="Vorname">
      <input data-f="nachname" value="${tkE(p.nachname)}" aria-label="Nachname" placeholder="Nachname">
      <label class="tk-foto" title="Foto hochladen (am besten freigestellt als PNG)">${SVI('camera')}<input type="file" accept="image/png,image/webp,image/jpeg" hidden data-up></label>
      <label class="tk-akt"><input type="checkbox" data-f="aktiv"${p.aktiv === false ? '' : ' checked'}> dabei</label></div>`; };
  const doppelt = () => { const z = {}; L.filter(p => p.aktiv !== false && p.nr !== '' && p.nr != null).forEach(p => z[p.nr] = (z[p.nr] || 0) + 1); return Object.keys(z).filter(k => z[k] > 1); };
  const M = svModal(`<div class="tk-pflege"><h2>Kader ${sub === 'A' ? 'Erste' : 'Zweite'}</h2>
    <p class="note">Rückennummern und Namen so, wie sie auf der Grafik stehen sollen. Fotos am besten freigestellt (PNG ohne Hintergrund), sonst wird unten weich ausgeblendet.</p>
    <p class="tk-warn" id="tkDoppelt"></p>
    <div class="tk-kl">${L.map(zeile).join('')}</div>
    <div class="btnrow"><button type="button" class="btn ghost sm" id="tkNeu">${SVI('plus')} Spieler</button></div>
    <div class="btnrow sbact"><button type="button" class="btn" id="tkSpeichern">${SVI('check')} Speichern</button><button type="button" class="btn ghost" onclick="closeOverlay()">Abbrechen</button></div></div>`);
  const warn = () => { const d = doppelt(); M.querySelector('#tkDoppelt').textContent = d.length ? `Doppelte Rückennummer: ${d.join(', ')}. Bitte prüfen.` : ''; };
  const binden = () => { M.querySelectorAll('.tk-kz').forEach(r => { const p = L[+r.dataset.i];
    r.querySelectorAll('[data-f]').forEach(f => f.oninput = f.onchange = () => { p[f.dataset.f] = f.type === 'checkbox' ? f.checked : f.dataset.f === 'nr' ? f.value.replace(/\D/g, '') : f.value; if(f.dataset.f === 'aktiv') r.classList.toggle('aus', !f.checked); warn(); });
    const up = r.querySelector('[data-up]'); up.onchange = async () => { const file = up.files && up.files[0]; if(!file) return;
      try{ const pfad = `assets/spieler/${p.id}-${Date.now()}.${file.type === 'image/png' ? 'png' : file.type === 'image/webp' ? 'webp' : 'jpg'}`;
        const { error } = await SVB.sb.storage.from('studio').upload(pfad, file, { contentType:file.type, upsert:false }); if(error) throw error;
        p.bild = pfad; p.quelle = 'Upload'; await tkUrls([pfad]); r.querySelector('.tk-bild').innerHTML = `<img src="${tkE(tkFotoUrl(pfad))}" alt="">`; kToast('Foto hochgeladen, bitte speichern');
      }catch(e){ kToast('⚠️ ' + (e.message || e)); } }; }); };
  binden(); warn();
  M.querySelector('#tkNeu').onclick = () => { L.push({ id:'n' + Date.now().toString(36), vorname:'', nachname:'', nr:'', pos:'', bild:'', aktiv:true });
    const box = M.querySelector('.tk-kl'); box.insertAdjacentHTML('beforeend', zeile(L[L.length - 1], L.length - 1)); binden(); box.lastElementChild.querySelector('[data-f="nachname"]').focus(); };
  M.querySelector('#tkSpeichern').onclick = async () => { const b = M.querySelector('#tkSpeichern'); b.disabled = true;
    try{ await tkKaderSpeichern(sub); closeOverlay(); kToast('Kader gespeichert'); tkRaster(); tkZeichnen(); }
    catch(e){ b.disabled = false; kToast('⚠️ ' + (e.message || e)); } }; }

(function(){ try{ const s=document.createElement('style'); s.id='svm64css'; s.textContent="/* 0.68 Live-Ticker im Spieltagsstudio */\n.tk-modus{display:inline-flex;gap:4px;padding:4px;margin:0 0 14px;border-radius:12px;background:#0b1430;box-shadow:inset 0 0 0 1px rgba(255,255,255,.06)}\n.tk-modus button{display:inline-flex;align-items:center;gap:8px;min-height:40px;padding:0 16px;border:0;border-radius:9px;background:none;color:#a9b8dc;font:inherit;font-size:14px;font-weight:700;letter-spacing:.01em;cursor:pointer}\n.tk-modus button svg{width:17px;height:17px}\n.tk-modus button.on{background:#1f8bff;color:#fff;box-shadow:0 6px 18px rgba(31,139,255,.35)}\n.tk-modus button:focus-visible{outline:2px solid #7db4ff;outline-offset:2px}\n.tk-modus button{white-space:nowrap}\n@media (max-width:520px){.tk-modus{display:flex;width:100%}.tk-modus button{flex:1;justify-content:center;padding:0 8px;gap:6px;font-size:13px}.tk-modus button svg{width:15px;height:15px}}\n\n.tk-wrap{display:grid;grid-template-columns:minmax(0,1fr) minmax(320px,440px);gap:16px;align-items:start}\n@media (max-width:980px){.tk-wrap{grid-template-columns:minmax(0,1fr)}}\n.tk-buehne{background:radial-gradient(120% 90% at 20% 0%,#16285a 0%,#070d1f 70%);min-height:300px}\n.tk-buehne canvas{box-shadow:0 18px 50px rgba(0,0,0,.5)}\n.tk-fmt.on{background:#1f8bff;color:#fff;border-color:transparent}\n\n.tk-steuer{padding:14px;display:grid;gap:12px}\n.tk-arten{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:6px}\n.tk-art{--ak:#1f8bff;position:relative;min-height:52px;border:1.5px solid var(--line,rgba(29,39,96,.14));border-radius:10px;background:var(--surface2,#fff);color:var(--ink,#0b1430);font-family:'Barlow Condensed','Anton',system-ui,sans-serif;font-size:19px;font-weight:800;letter-spacing:.06em;cursor:pointer;overflow:hidden}\n.tk-art::before{content:\"\";position:absolute;left:0;right:0;bottom:0;height:4px;background:var(--ak)}\n.tk-art.on{background:#0b1430;color:#fff;border-color:var(--ak);box-shadow:0 8px 20px rgba(11,20,48,.3)}\n.tk-art.on::before{height:100%;opacity:.22}\n.tk-art:focus-visible{outline:2px solid var(--ak);outline-offset:2px}\n@media (max-width:420px){.tk-art{font-size:16px;letter-spacing:.03em}}\n\n.tk-zeile{display:grid;grid-template-columns:minmax(0,1.3fr) minmax(0,.7fr) minmax(0,.8fr);gap:8px;align-items:end}\n.tk-zeile .pk-seg{margin:0}\n@media (max-width:420px){.tk-zeile{grid-template-columns:1fr 1fr}.tk-zeile .pk-seg{grid-column:1/-1}}\n.tk-feld{display:grid;gap:4px;font-size:12px;font-weight:650}\n.tk-feld>span{opacity:.75}\n.tk-feld input{min-height:46px;padding:6px 10px;border:1.5px solid var(--line,rgba(29,39,96,.16));border-radius:9px;font:inherit;font-size:17px;font-weight:700;font-variant-numeric:tabular-nums;background:var(--surface2,#fff);color:inherit;width:100%}\n.tk-hinweis{margin:0;font-size:12.5px;line-height:1.5;color:#1f8bff;font-weight:600}\n.tk-hinweis:empty{display:none}\n.tk-suche{min-height:42px;padding:8px 12px;border:1.5px solid var(--line,rgba(29,39,96,.16));border-radius:9px;font:inherit;background:var(--surface2,#fff);color:inherit;width:100%}\n\n.tk-raster{display:grid;grid-template-columns:repeat(auto-fill,minmax(96px,1fr));gap:8px;max-height:min(52vh,520px);overflow-y:auto;padding:2px;overscroll-behavior:contain}\n.tk-raster .empty{grid-column:1/-1}\n.tk-sp{position:relative;display:grid;justify-items:center;gap:2px;padding:8px 6px 9px;border:1.5px solid var(--line,rgba(29,39,96,.12));border-radius:12px;background:var(--surface2,#fff);color:inherit;font:inherit;text-align:center;cursor:pointer;min-width:0}\n.tk-sp b{display:block;max-width:100%;font-size:13px;line-height:1.2;font-weight:750;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}\n.tk-sp b em{font-style:normal;color:#1f8bff;font-variant-numeric:tabular-nums}\n.tk-sp small{display:block;max-width:100%;font-size:11px;opacity:.65;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}\n.tk-sp.on{border-color:#1f8bff;box-shadow:0 0 0 2px #1f8bff inset,0 6px 16px rgba(31,139,255,.22)}\n.tk-sp.raus{border-color:#e5262c;box-shadow:0 0 0 2px #e5262c inset}\n.tk-sp:focus-visible{outline:2px solid #1f8bff;outline-offset:2px}\n.tk-bild{display:grid;place-items:end center;width:64px;height:64px;border-radius:50%;overflow:hidden;background:radial-gradient(circle at 50% 30%,#1d3b86,#0b1430);margin-bottom:4px}\n.tk-bild img{width:100%;height:100%;object-fit:cover;object-position:50% 12%}\n.tk-bild i{align-self:center;font-style:normal;font-family:'Barlow Condensed','Anton',sans-serif;font-weight:800;font-size:26px;color:#7db4ff}\n.tk-bild.sm{width:42px;height:42px;margin:0;flex:none}\n.tk-bild.sm i{font-size:18px}\n.tk-tag{position:absolute;top:6px;right:6px;padding:2px 6px;border-radius:6px;background:#e5262c;color:#fff;font-size:11px;font-weight:800;letter-spacing:.06em;text-transform:uppercase}\n.tk-tag.rein{background:#13a35a}\n\n.tk-eb{border:1px solid var(--line,rgba(29,39,96,.12));border-radius:10px;padding:0 10px}\n.tk-eb summary{min-height:42px;display:flex;align-items:center;font-size:13.5px;font-weight:700;cursor:pointer}\n.tk-eb>div{display:grid;grid-template-columns:1fr 1fr;gap:2px 10px;padding:0 0 10px}\n.tk-pflege-b{justify-self:start}\n.tk-profi{display:flex;align-items:flex-start;gap:10px;font-size:13px;line-height:1.4;cursor:pointer;padding:2px 0}\n.tk-profi input{width:20px;height:20px;flex:none;margin:0;accent-color:#1f8bff}\n.tk-profi b{display:block;font-size:13.5px}\n.tk-profi span{opacity:.85}\n\n.tk-pflege{display:grid;gap:10px;min-width:min(640px,86vw)}\n.tk-pflege h2{margin:0}\n.tk-warn{margin:0;color:#b42318;font-size:13px;font-weight:650}\n.tk-warn:empty{display:none}\n.tk-kl{display:grid;gap:6px;max-height:56vh;overflow-y:auto;padding-right:2px}\n.tk-kz{display:grid;grid-template-columns:42px 54px minmax(0,1fr) minmax(0,1.2fr) 40px auto;gap:6px;align-items:center}\n.tk-kz input:not([type]),.tk-kz input[type=text],.tk-kz input[inputmode]{min-height:40px;padding:6px 8px;border:1.5px solid var(--line,rgba(29,39,96,.16));border-radius:8px;font:inherit;font-size:14px;background:var(--surface2,#fff);color:inherit;width:100%;min-width:0}\n.tk-kz .tk-nr{text-align:center;font-weight:800;font-variant-numeric:tabular-nums}\n.tk-kz.aus{opacity:.45}\n.tk-foto{display:grid;place-items:center;width:40px;height:40px;border-radius:8px;border:1.5px dashed rgba(29,39,96,.25);cursor:pointer}\n.tk-foto svg{width:18px;height:18px}\n.tk-akt{display:flex;align-items:center;gap:5px;font-size:12.5px;font-weight:650;white-space:nowrap}\n.tk-akt input{width:18px;height:18px;accent-color:#1f8bff}\n@media (max-width:560px){.tk-kz{grid-template-columns:42px 50px minmax(0,1fr) 40px;row-gap:4px}.tk-kz .tk-bild{grid-column:1;grid-row:1/3}.tk-kz .tk-nr{grid-column:2;grid-row:1/3;align-self:stretch}.tk-kz [data-f=nachname]{grid-column:3;grid-row:1}.tk-kz [data-f=vorname]{grid-column:3;grid-row:2}.tk-kz .tk-foto{grid-column:4;grid-row:1}.tk-kz .tk-akt{grid-column:4;grid-row:2}}\n"; document.head.appendChild(s); }catch(e){} })();
/* =====================================================================
   Sportzentrale Beta 0.69 · Spieltagsstudio: Ergebnis-Grafiken nach dem Spieltag
   - Dritter Bereich im Spieltagsstudio: „Ergebnis“ (neben Spielplakat und Live-Ticker)
   - Zieht automatisch die letzten Ergebnisse der Ersten und Zweiten (match_results, Torschützen aus den
     Spielberichten fde_matches, sonst aus der Torjägerliste). Neuestes Spiel ist vorgewählt.
   - Stimmung je Ausgang: Sieg warm und golden mit Lichtfunken, Remis neutral blau, Niederlage kühl und ruhig.
     Hintergründe aus dem Vereinsfundus (Flutlicht, Herbst, Ball, Frost) oder aus der Studio-Bibliothek.
   - Matchwinner: freigestelltes Foto des Torschützen aus dem Ticker-Kader, wenn vorhanden.
   - Begleittexte je Ausgang (Heimsieg, Auswärtssieg, Remis, Niederlage) mit Torschützen und nächstem Spiel,
     zum Kopieren. Stand je Spiel in plakat_spiel (spiel = 'ergebnis-<id>'), damit alle im Team dasselbe sehen.
   - Keine Namen im Code. Schriften aus dem CI (TKC = Barlow Condensed, TKB = Barlow, aus svm64).
   ===================================================================== */
const ERG = { spiele:[], idx:0, format:'quadrat', wort:'', bg:'', spieler:'', zeigeSpieler:true, text:'', variante:0, bib:[], neu:false,
  hand:{ gegner:'', heim:true, wir:'', ihr:'', sub:'A' },
  ebenen:{ bg:true, stimmung:true, wort:true, spieler:true, tafel:true, info:true } };
const ER_EBENEN = [['bg','Hintergrund'],['stimmung','Leseschutz'],['wort','Schriftzug'],['spieler','Matchwinner'],['tafel','Ergebnistafel'],['info','Mannschaft, Datum, Torschützen']];
const ER_BG = { night:['plakat/foto/night.webp','Flutlicht'], summer:['plakat/foto/summer.webp','Ball'], autumn:['plakat/foto/autumn.webp','Herbst'], winter:['plakat/foto/winter.webp','Frost'] };
const ER_STIL = {
  sieg:{ akzent:'#ffc23d', wortVon:'#ffffff', wortBis:'#ffd36b', bg:'night' },
  remis:{ akzent:'#7db4ff', wortVon:'#ffffff', wortBis:'#9cc6ff', bg:'summer' },
  niederlage:{ akzent:'#9fb3d1', wortVon:'#eef3fb', wortBis:'#8fa3c4', bg:'autumn' } };
const erE = s => svEsc(s == null ? '' : String(s));
const erWir = k => pkIstWir(k || '');
const erNameKurz = n => { n = String(n || '').replace(/\s*\([^)]*\)\s*$/, ''); const t = String(n || '').trim().split(/\s+/); return t.length > 1 ? t[t.length - 1] : t[0] || ''; };
const erNorm = s => pkNorm(s);

/* ---------- Daten ---------- */
async function erLaden(){
  const [mr, fde, fx] = await Promise.all([
    SVB.sb.from('match_results').select('id,sub,datum,bis,heim,gast,heim_key,gast_key,tore_heim,tore_gast,scorers').or('heim_key.ilike.svbsc*,gast_key.ilike.svbsc*').order('bis', { ascending:false }).limit(24),
    SVB.sb.from('fde_matches').select('id,team,datum,heim,gast,wir_heim,apps').order('datum', { ascending:false }).limit(30),
    SVB.sb.from('fixtures').select('id,sub,datum,zeit,heim,gast,heim_key,gast_key').gte('datum', new Date(Date.now() - 864e5 * 1).toISOString().slice(0, 10)).order('datum', { ascending:true }).limit(40)
  ]);
  if(mr.error) throw mr.error;
  const F = (fde.data || []), keys = new Set(); F.forEach(m => (m.apps || []).forEach(a => { if(a.t) keys.add(a.p); }));
  let namen = new Map();
  if(keys.size){ const { data } = await SVB.sb.from('fde_players').select('key,name').in('key', [...keys]); (data || []).forEach(r => namen.set(r.key, String(r.name || '').replace(/\s*\([^)]*\)\s*$/, '').trim())); }   // „Name (SV Mörlenbach)“ → „Name“
  ERG.naechste = (fx.data || []).filter(f => erWir(f.heim_key) || erWir(f.gast_key));
  ERG.spiele = (mr.data || []).filter(r => erWir(r.heim_key) || erWir(r.gast_key)).map(r => {
    const heim = erWir(r.heim_key), datum = r.datum || r.bis, wir = heim ? r.tore_heim : r.tore_gast, ihr = heim ? r.tore_gast : r.tore_heim;
    const sub = r.sub === 'D2' || /ii$/.test(erNorm(heim ? r.heim_key : r.gast_key)) ? 'D2' : 'A';
    // Torschützen: erst aus dem Spielbericht (genau dieses Spiel), sonst aus der Torjägerliste (Zeitraum)
    const m = F.find(x => x.team === sub && Math.abs(new Date(x.datum) - new Date(datum)) <= 2 * 864e5 && erNorm(heim ? x.gast : x.heim) === erNorm(heim ? r.gast : r.heim));
    let tore = [];
    if(m) tore = (m.apps || []).filter(a => a.t > 0).map(a => ({ name:namen.get(a.p) || '', tore:a.t })).filter(x => x.name);
    if(!tore.length) tore = (r.scorers || []).filter(x => erWir(x.club_key)).map(x => ({ name:x.name, tore:x.tore || 1 }));
    tore.sort((a, b) => b.tore - a.tore);
    return { id:r.id, sub, datum, heim, gegner:heim ? r.gast : r.heim, wir, ihr, tore, ausgang:wir > ihr ? 'sieg' : wir < ihr ? 'niederlage' : 'remis' };
  }).sort((a, b) => String(b.datum).localeCompare(String(a.datum)));
  const j = ERG.spiele[0]; ERG.neu = !!(j && (Date.now() - new Date(j.datum)) < 4 * 864e5);
}
function erSpiel(){ if(ERG.idx === -1){ const h = ERG.hand, wir = h.wir === '' ? 0 : +h.wir, ihr = h.ihr === '' ? 0 : +h.ihr;
    return { id:'hand', sub:h.sub, datum:new Date().toISOString().slice(0, 10), heim:h.heim, gegner:h.gegner || 'Gegner', wir, ihr, tore:[], ausgang:wir > ihr ? 'sieg' : wir < ihr ? 'niederlage' : 'remis', hand:true }; }
  return ERG.spiele[ERG.idx] || null; }
function erNaechstes(s){ if(!s) return null; return ERG.naechste.find(f => f.sub === s.sub && f.datum > s.datum) || ERG.naechste.find(f => f.datum > s.datum) || null; }
function erWortStandard(s){ if(!s) return 'ENDSTAND'; return s.ausgang === 'sieg' ? (s.heim ? 'HEIMSIEG' : 'AUSWÄRTSSIEG') : s.ausgang === 'remis' ? 'REMIS' : 'ENDSTAND'; }
function erKaderSpieler(s){ if(!s || !TKR.kader) return [];
  const L = [...(TKR.kader[s.sub] || []), ...(TKR.kader[s.sub === 'A' ? 'D2' : 'A'] || [])];
  return s.tore.map(t => { const n = erNorm(t.name), k = L.find(p => erNorm(p.vorname + ' ' + p.nachname) === n || erNorm(p.nachname + ' ' + p.vorname) === n); return k ? { ...k, tore:t.tore } : null; }).filter(Boolean); }
function erMatchwinner(s){ if(!s || s.ausgang === 'niederlage') return null; const K = erKaderSpieler(s);
  if(ERG.spieler) return [...(TKR.kader.A || []), ...(TKR.kader.D2 || [])].find(p => p.id === ERG.spieler) || null;
  return K.find(p => p.bild) || null; }

/* ---------- Texte ---------- */
const ER_WT = ['So.', 'Mo.', 'Di.', 'Mi.', 'Do.', 'Fr.', 'Sa.'];
function erDatum(d){ const x = new Date(d + 'T12:00:00'); return `${ER_WT[x.getDay()]} ${String(x.getDate()).padStart(2, '0')}.${String(x.getMonth() + 1).padStart(2, '0')}.`; }
// Nachnamen reichen, außer zwei Torschützen heißen gleich (Brüder): dann mit Anfangsbuchstaben, z. B. „S. Muster, J. Muster“
function erTorText(s){ if(!s.tore.length) return ''; const nn = s.tore.map(t => erNameKurz(t.name)), doppelt = n => nn.filter(x => x === n).length > 1;
  return s.tore.map((t, i) => { const v = String(t.name || '').trim().split(/\s+/)[0] || ''; return (doppelt(nn[i]) && v !== nn[i] ? v[0] + '. ' : '') + nn[i] + (t.tore > 1 ? ` (${t.tore})` : ''); }).join(', '); }
function erTexte(s){
  if(!s) return [''];
  const team = s.sub === 'D2' ? 'Unsere Zweite' : 'Unsere Erste', erg = `${s.wir}:${s.ihr}`, g = s.gegner, n = erNaechstes(s);
  const tore = erTorText(s) ? `\n⚽ ${erTorText(s)}` : '';
  const weiter = n ? `\n\nWeiter geht es ${erDatum(n.datum)}${n.zeit ? ' um ' + n.zeit.slice(0, 5) + ' Uhr' : ''} ${erWir(n.heim_key) ? 'zuhause gegen ' + n.gast : 'auswärts bei ' + n.heim}.` : '';
  const tag = '\n\n#svbsc #mörlenbach #' + (s.sub === 'D2' ? 'zweite' : 'erste');
  const V = {
    sieg_heim:[
      `Heimsieg! ${team} gewinnt ${erg} gegen ${g}.${tore}\n\nDanke an alle, die am Platz waren und uns nach vorne gepeitscht haben.${weiter}${tag}`,
      `Drei Punkte bleiben in Mörlenbach! ${erg} gegen ${g}.${tore}\n\nStarke Leistung, Jungs. So darf es weitergehen.${weiter}${tag}`,
      `Zuhause ist bei uns! ${team} schlägt ${g} mit ${erg}.${tore}${weiter}${tag}` ],
    sieg_ausw:[
      `Auswärtssieg! ${team} gewinnt ${erg} bei ${g}.${tore}\n\nDanke an alle, die mitgefahren sind.${weiter}${tag}`,
      `Dreier aus der Fremde! ${erg} bei ${g}.${tore}\n\nGeschlossene Mannschaftsleistung, so nehmen wir die Punkte mit.${weiter}${tag}`,
      `Mit drei Punkten im Gepäck nach Hause: ${team} gewinnt ${erg} bei ${g}.${tore}${weiter}${tag}` ],
    remis:[
      `Punkteteilung. ${team} spielt ${erg} ${s.heim ? 'gegen' : 'bei'} ${g}.${tore}\n\nEin Punkt, auf dem wir aufbauen.${weiter}${tag}`,
      `${erg} ${s.heim ? 'gegen' : 'bei'} ${g}. Ein Punkt zum Mitnehmen.${tore}\n\nDanke für eure Unterstützung!${weiter}${tag}`,
      `Unentschieden ${s.heim ? 'zuhause gegen' : 'bei'} ${g}: ${erg}.${tore}\n\nWir bleiben dran.${weiter}${tag}` ],
    niederlage:[
      `Heute hat es nicht gereicht. ${team} verliert ${erg} ${s.heim ? 'gegen' : 'bei'} ${g}.${tore}\n\nMund abwischen, Mannschaft, wir greifen wieder an.${weiter}${tag}`,
      `Endstand ${erg} ${s.heim ? 'gegen' : 'bei'} ${g}.${tore}\n\nKein guter Tag für uns, aber wir stehen zusammen. Danke an alle, die da waren.${weiter}${tag}`,
      `${erg} ${s.heim ? 'gegen' : 'bei'} ${g}. Nicht unser Tag.${tore}\n\nKopf hoch, Jungs. Nächste Woche zeigen wir eine Reaktion.${weiter}${tag}` ] };
  return V[s.ausgang === 'sieg' ? (s.heim ? 'sieg_heim' : 'sieg_ausw') : s.ausgang]; }

/* ---------- Malen ---------- */
function erFunken(ctx, W, H, farbe, n, saat){ let r = saat; const z = () => (r = (r * 16807) % 2147483647) / 2147483647;
  ctx.save(); ctx.globalCompositeOperation = 'screen';
  for(let i = 0; i < n; i++){ const x = z() * W, y = z() * H * .62, g = 1 + z() * 4.5, a = .25 + z() * .7;
    ctx.fillStyle = i % 3 ? farbe : '#ffffff'; ctx.globalAlpha = a; ctx.shadowColor = farbe; ctx.shadowBlur = 10 + g * 3;
    ctx.beginPath(); ctx.arc(x, y, g, 0, Math.PI * 2); ctx.fill(); }
  ctx.restore(); }
function erRegen(ctx, W, H){ ctx.save(); ctx.strokeStyle = 'rgba(190,210,240,.10)'; ctx.lineWidth = 1.4; let r = 1896; const z = () => (r = (r * 16807) % 2147483647) / 2147483647;
  for(let i = 0; i < 260; i++){ const x = z() * W * 1.2, y = z() * H, l = 30 + z() * 60; ctx.beginPath(); ctx.moveTo(x, y); ctx.lineTo(x - l * .28, y + l); ctx.stroke(); } ctx.restore(); }
function erTextPasst(ctx, t, schrift, max, groesse, min){ let fs = groesse; ctx.font = schrift.replace('#', fs); let w = ctx.measureText(t).width;
  if(w > max){ fs = Math.max(min, fs * max / w); ctx.font = schrift.replace('#', fs); } return fs; }

function erWappenKlar(ctx, img, x, y, bw, bh){
  if(!img) return; const nw = img.naturalWidth || img.width, nh = img.naturalHeight || img.height;
  if(!nw || !nh) return; const f = Math.min(bw / nw, bh / nh), w = nw * f, h = nh * f;
  ctx.drawImage(img, x + (bw - w) / 2, y + (bh - h) / 2, w, h);
}

function erMalen(cv, S, A){
  const [W, H] = TK_FORMATE[S.format] || TK_FORMATE.quadrat; cv.width = W; cv.height = H;
  const ctx = cv.getContext('2d'); ctx.imageSmoothingQuality = 'high';
  const s = S.spiel, E = S.ebenen, st = { akzent:s && s.ausgang === 'sieg' ? CI.orange : CI.blau }, dy = H - 1080, story = dy > 400, mw = S.matchwinner && A.foto && E.spieler;
  // Originalfoto mit ruhigem Leseschutz, ohne künstliche Unschärfe.
  ctx.fillStyle = CI.navy; ctx.fillRect(0, 0, W, H);
  if(E.bg && A.bg){ const b = A.bg, bw0 = b.naturalWidth || b.width, bh0 = b.naturalHeight || b.height, sc = Math.max(W / bw0, H / bh0), bw = bw0 * sc, bh = bh0 * sc;
    ctx.drawImage(b, (W - bw) / 2, (H - bh) / 2, bw, bh); }
  if(E.stimmung){ ctx.fillStyle = 'rgba(4,17,39,.44)'; ctx.fillRect(0, 0, W, H); }
  // Kopfzeile: Mannschaft links, Datum rechts
  if(E.info && s){ ctx.save(); ctx.font = '600 28px TKB'; try{ ctx.letterSpacing = '6px'; }catch(e){} ctx.fillStyle = st.akzent; ctx.textBaseline = 'alphabetic';
    const oben = story ? 130 : 78; ctx.fillText(s.sub === 'D2' ? 'ZWEITE MANNSCHAFT' : 'ERSTE MANNSCHAFT', 80, oben); ctx.textAlign = 'right'; ctx.fillStyle = 'rgba(255,255,255,.8)';
    ctx.fillText(erDatum(s.datum).toUpperCase().replace(/\.$/, ''), W - 80, oben); try{ ctx.letterSpacing = '0px'; }catch(e){} ctx.restore();
    ctx.fillStyle = st.akzent; ctx.globalAlpha = .9; ctx.fillRect(80, (story ? 130 : 78) + 16, 64, 4); ctx.globalAlpha = 1; }
  // 3 Schriftzug
  // Schriftgröße zuerst, dann die Grundlinie so, dass der Schriftzug nie in die Kopfzeile ragt
  let wfs = 300; if(S.wort){ ctx.save(); ctx.font = `900 300px TKC`; wfs = Math.min(270, 300 * (W * .9) / Math.max(1, ctx.measureText(S.wort).width)); ctx.restore(); }
  const wortY = Math.max((mw ? 330 : 300) + dy * (story ? .28 : .3), (story ? 200 : 132) + wfs * .74);
  if(E.wort && S.wort){ ctx.save(); ctx.font = `900 ${wfs}px TKC`; ctx.textAlign = 'center';
    ctx.fillStyle = s && s.ausgang === 'sieg' ? CI.orange : CI.weiss; ctx.fillText(S.wort, W / 2, wortY); ctx.restore(); }
  // 4 Matchwinner (freigestellt, steht auf der Unterkante hinter der Tafel)
  if(mw){ const img = A.foto, m = tkUmriss(img), top = wortY - 150, hoch = H - top, unten = m.y + m.h >= img.naturalHeight * .97;
    const sc = Math.min(hoch / m.h, (W * (unten ? .9 : .7)) / m.w), dw = img.naturalWidth * sc, dh = img.naturalHeight * sc;
    const x0 = W * .5 - (m.x + m.w / 2) * sc, y0 = unten ? H + 2 - (m.y + m.h) * sc : top - m.y * sc;
    ctx.drawImage(img, x0, y0, dw, dh);
    if(!m.frei){ const g = ctx.createLinearGradient(0, y0 + dh * .7, 0, y0 + dh); g.addColorStop(0, 'rgba(5,12,31,0)'); g.addColorStop(1, 'rgba(5,12,31,1)'); ctx.fillStyle = g; ctx.fillRect(x0, y0 + dh * .7, dw, dh * .3 + 2); } }
  // 5 Ergebnistafel
  if(E.tafel && s){ const wirName = s.sub === 'D2' ? 'SV/BSC II' : 'SV/BSC', gName = String(s.gegner || '').toUpperCase();
    const links = { bild:A.logo, name:wirName }, rechts = { bild:A.gegner, name:gName }, [L, R] = s.heim ? [links, rechts] : [rechts, links];
    const tl = s.heim ? s.wir : s.ihr, tr = s.heim ? s.ihr : s.wir;
    if(mw){ const y = H - 330, h = 250, x = 56, w = W - 112;
      ctx.save(); ctx.fillStyle = CI.navy;
      ctx.beginPath(); ctx.roundRect ? ctx.roundRect(x, y, w, h, 18) : ctx.rect(x, y, w, h); ctx.fill(); ctx.restore();
      ctx.fillStyle = st.akzent; ctx.fillRect(x + 40, y, w - 80, 4);
      erWappenKlar(ctx, L.bild, x + 30, y + 34, 200, 128); erWappenKlar(ctx, R.bild, x + w - 230, y + 34, 200, 128);
      ctx.save(); ctx.textAlign = 'center'; ctx.fillStyle = '#fff'; ctx.font = '900 150px TKC'; ctx.fillText(`${tl}:${tr}`, W / 2, y + 160); ctx.restore();
      ctx.save(); ctx.textAlign = 'center'; ctx.fillStyle = 'rgba(255,255,255,.88)'; erTextPasst(ctx, L.name, '700 #px TKC', 220, 30, 18); ctx.fillText(L.name, x + 130, y + 206); erTextPasst(ctx, R.name, '700 #px TKC', 220, 30, 18); ctx.fillText(R.name, x + w - 130, y + 206); ctx.restore(); }
    else { const cy = 560 + dy * .5, gw = 250, gh = 250;
      erWappenKlar(ctx, L.bild, W * .2 - gw / 2, cy - gh / 2, gw, gh); erWappenKlar(ctx, R.bild, W * .8 - gw / 2, cy - gh / 2, gw, gh);
      ctx.save(); ctx.textAlign = 'center'; ctx.font = '900 230px TKC'; ctx.fillStyle = '#ffffff'; ctx.fillText(`${tl}:${tr}`, W / 2, cy + 80); ctx.restore();
      ctx.save(); ctx.textAlign = 'center'; ctx.fillStyle = 'rgba(255,255,255,.9)'; erTextPasst(ctx, L.name, '700 #px TKC', 300, 38, 20); ctx.fillText(L.name, W * .2, cy + gh / 2 + 52); erTextPasst(ctx, R.name, '700 #px TKC', 300, 38, 20); ctx.fillText(R.name, W * .8, cy + gh / 2 + 52); ctx.restore(); } }
  // 6 Torschützen und nächstes Spiel
  if(E.info && s){ const tore = erTorText(s), y = mw ? H - 50 : H - (story ? 260 : 150);
    if(tore){ ctx.save(); ctx.textAlign = 'center'; ctx.fillStyle = 'rgba(255,255,255,.92)'; const t = '⚽  ' + tore.toUpperCase(); try{ ctx.letterSpacing = '2px'; }catch(e){}
      erTextPasst(ctx, t, '600 #px TKB', W - 160, mw ? 28 : 34, 18); ctx.fillText(t, W / 2, y); try{ ctx.letterSpacing = '0px'; }catch(e){} ctx.restore(); }
    const n = erNaechstes(s);
    if(n && !mw){ ctx.save(); ctx.textAlign = 'center'; ctx.font = '600 26px TKB'; try{ ctx.letterSpacing = '4px'; }catch(e){} ctx.fillStyle = st.akzent;
      ctx.fillText(`NÄCHSTES SPIEL  ${erDatum(n.datum).toUpperCase().replace(/\.$/, '')}  ${erWir(n.heim_key) ? 'GEGEN ' + n.gast : 'BEI ' + n.heim}`.toUpperCase(), W / 2, y + (story ? 90 : 62)); try{ ctx.letterSpacing = '0px'; }catch(e){} ctx.restore(); } }
  return cv; }

/* ---------- Oberfläche ---------- */
// Standard-Hintergrund je Ausgang: Vereinsfotos aus der Bibliothek mit Schlagwort „ergebnis-sieg“, „ergebnis-remis“, „ergebnis-niederlage“,
// sonst die Grundbilder. Bei mehreren Fotos wechselt es von Spiel zu Spiel (fest je Spiel).
function erBgStandard(s){ const a = s ? s.ausgang : 'remis', L = ERG.bib.filter(m => (m.tags || []).includes('ergebnis-' + a));
  if(L.length){ const k = String(s && s.id || '').split('').reduce((x, c) => x + c.charCodeAt(0), 0); return L[k % L.length].pfad; }
  return ER_STIL[a].bg; }
async function erAssets(s){ const bgKey = ERG.bg || erBgStandard(s);
  const bgSrc = ER_BG[bgKey] ? ER_BG[bgKey][0] : await sbUrl(bgKey);
  const mwP = ERG.zeigeSpieler ? erMatchwinner(s) : null;
  await pkBib();
  const [bg, logo, gegner, foto] = await Promise.all([tkBild(bgSrc), tkBild(pkWappenQuelle('SV/BSC Mörlenbach') || 'logo.png'), tkBild(s ? pkWappenQuelle(s.gegner) : null), tkBild(mwP && tkFotoUrl(mwP.bild))]);
  return { bg, logo, gegner, foto, mwP }; }
let erNr = 0;
async function erZeichnen(){ const cv = document.getElementById('erCanvas'); if(!cv) return; const n = ++erNr, s = erSpiel();
  await tkFonts(); const A = await erAssets(s); if(n !== erNr) return;
  erMalen(cv, { spiel:s, format:ERG.format, wort:ERG.wort || erWortStandard(s), ebenen:ERG.ebenen, matchwinner:!!A.mwP }, A);
  const mi = document.getElementById('erMwInfo'); if(mi) mi.textContent = A.mwP ? `Im Bild: ${A.mwP.vorname} ${A.mwP.nachname}` : !ERG.zeigeSpieler ? 'Aus: Wappen und Ergebnis stehen groß.' : (s && s.ausgang === 'niederlage' ? 'Bei Niederlagen ohne Spielerfoto.' : 'Kein Torschütze mit Foto, darum Wappen und Ergebnis groß.'); }
let erZeit = 0; const erBald = () => { clearTimeout(erZeit); erZeit = setTimeout(erZeichnen, 140); };

async function erStart(P){
  P.querySelectorAll(':scope > :not(.tk-modus)').forEach(e => e.remove());
  const h = document.createElement('div'); h.className = 'tk-wrap er-wrap'; h.innerHTML = '<div class="card"><div class="empty">Lade Ergebnisse …</div></div>'; P.appendChild(h);
  try{ await Promise.all([tkFonts(), erLaden(), tkKaderLaden().catch(() => {}), erBibLaden()]); }
  catch(e){ h.innerHTML = `<div class="card"><div class="empty">Ergebnisse konnten nicht geladen werden: ${erE(e.message || e)}</div></div>`; return; }
  if(!ERG.spiele.length) ERG.idx = -1; else if(ERG.idx >= ERG.spiele.length) ERG.idx = 0;
  await erStandLaden(); erOberflaeche(h); erZeichnen(); }

// 0.99.21: dieselbe Bibliothek wie Spielplakat und Event (svm98.js). Eigene Fotos zuerst, dann die Stimmungsbilder je Ausgang.
const erRang = m => (m.tags || []).includes('spieltag') ? 0 : (m.tags || []).some(t => /^ergebnis-/.test(t)) ? 1 : 2;
async function erBibLaden(neu){ try{ ERG.bib = [...await sbBibLaden(neu)].sort((a, b) => erRang(a) - erRang(b)); }catch(e){ ERG.bib = []; } }

async function erStandLaden(){ const s = erSpiel(); ERG.wort = ''; ERG.bg = ''; ERG.spieler = ''; ERG.variante = 0; ERG.text = ''; ERG.zeigeSpieler = true;
  if(!s || s.hand) return;
  try{ const { data } = await SVB.sb.from('plakat_spiel').select('texte,einstell').eq('spiel', 'ergebnis-' + s.id).maybeSingle();
    if(data){ const e = data.einstell || {}; ERG.wort = e.wort || ''; ERG.bg = e.bg || ''; ERG.spieler = e.spieler || ''; ERG.zeigeSpieler = e.zeigeSpieler !== false; ERG.variante = e.variante || 0; ERG.text = (data.texte || {}).post || ''; } }catch(e){} }
let erMerkT = 0;
function erMerken(){ clearTimeout(erMerkT); erMerkT = setTimeout(async () => { const s = erSpiel(); if(!s || s.hand) return;
  try{ await svtRpc('plakat_merken', { p:{ spiel:'ergebnis-' + s.id, sub:s.sub, datum:s.datum, heim:s.heim, gegner:s.gegner, texte:{ post:ERG.text }, einstell:{ wort:ERG.wort, bg:ERG.bg, spieler:ERG.spieler, zeigeSpieler:ERG.zeigeSpieler, variante:ERG.variante } } }); }
  catch(e){ console.warn('Ergebnis merken', e); } }, 700); }

function erAusgangText(s){ if(!s) return ''; return s.ausgang === 'sieg' ? (s.heim ? 'Heimsieg' : 'Auswärtssieg') : s.ausgang === 'remis' ? 'Remis' : (s.heim ? 'Heimniederlage' : 'Auswärtsniederlage'); }
function erOberflaeche(h){
  const s = erSpiel(), opt = (v, t, an) => `<option value="${erE(v)}"${an ? ' selected' : ''}>${erE(t)}</option>`;
  const spiele = ERG.spiele.map((g, i) => opt(i, `${erDatum(g.datum)} · ${g.sub === 'D2' ? 'Zweite' : 'Erste'} · ${g.heim ? 'H' : 'A'} · ${g.wir}:${g.ihr} ${g.gegner}`, i === ERG.idx)).join('') + opt(-1, 'Ergebnis von Hand eintragen', ERG.idx === -1);
  const fm = Object.entries(TK_FORMATE).map(([k, v]) => `<button type="button" class="btn sm ghost tk-fmt${ERG.format === k ? ' on' : ''}" data-erf="${k}">${erE(v[2])}</button>`).join('');
  const bgAkt = ERG.bg || erBgStandard(s);
  const bgs = Object.entries(ER_BG).map(([k, v]) => `<button type="button" class="er-bg${bgAkt === k ? ' on' : ''}" data-erb="${k}" title="${erE(v[1])}"><img src="${erE(v[0])}" alt="" loading="lazy"><span>${erE(v[1])}</span></button>`).join('')
    + ERG.bib.slice(0, 48).map(m => { const u = tkFotoUrl(m.pfad); return u ? `<button type="button" class="er-bg${bgAkt === m.pfad ? ' on' : ''}" data-erb="${erE(m.pfad)}" title="${erE(m.name)}"><img src="${erE(u)}" alt="" loading="lazy"><span>${erE(m.name || 'Bibliothek')}</span></button>` : ''; }).join('');
  const kandidaten = s ? [...erKaderSpieler(s), ...[...(TKR.kader[s.sub] || [])].filter(p => p.bild && p.aktiv !== false)] : [];
  const gesehen = new Set(), mwOpt = kandidaten.filter(p => p.bild && !gesehen.has(p.id) && gesehen.add(p.id)).map(p => opt(p.id, `${p.nr !== '' && p.nr != null ? p.nr + ' ' : ''}${p.vorname} ${p.nachname}${p.tore ? ' (Tor)' : ''}`, ERG.spieler === p.id)).join('');
  const texte = erTexte(s), text = ERG.text || texte[ERG.variante % texte.length] || '';
  h.innerHTML = `
    <div class="card pk-vorschau tk-vorschau">
      <div class="pk-buehne tk-buehne"><canvas id="erCanvas" aria-label="Vorschau der Ergebnis-Grafik"></canvas></div>
      <div class="pk-unten"><div class="pk-fmts">${fm}</div>
        <div class="pk-aktion"><button type="button" class="btn sm ghost" id="erTeilen">${SVI('share')} Teilen</button><button type="button" class="btn sm" id="erExport">${SVI('download')} PNG laden</button></div></div>
    </div>
    <div class="card pk-steuer tk-steuer">
      <label class="tk-feld er-spiel"><span>Spiel ${ERG.neu ? '<em class="er-neu">neu</em>' : ''}</span><select id="erSpiel">${spiele}</select></label>
      ${ERG.idx === -1 ? `<div class="er-hand">
        <div class="pk-seg tk-team"><button type="button" data-erh="A" class="${ERG.hand.sub === 'A' ? 'on' : ''}">Erste</button><button type="button" data-erh="D2" class="${ERG.hand.sub === 'D2' ? 'on' : ''}">Zweite</button></div>
        <div class="pk-seg tk-team"><button type="button" data-erhh="1" class="${ERG.hand.heim ? 'on' : ''}">Heim</button><button type="button" data-erhh="0" class="${ERG.hand.heim ? '' : 'on'}">Auswärts</button></div>
        <label class="tk-feld"><span>Gegner</span><input id="erGegner" maxlength="40" value="${erE(ERG.hand.gegner)}" placeholder="Name des Gegners"></label>
        <div class="tk-zeile er-tore"><label class="tk-feld"><span>Tore wir</span><input id="erWir" inputmode="numeric" maxlength="2" value="${erE(ERG.hand.wir)}"></label><label class="tk-feld"><span>Tore Gegner</span><input id="erIhr" inputmode="numeric" maxlength="2" value="${erE(ERG.hand.ihr)}"></label></div></div>` : ''}
      <div class="er-ausgang er-${s ? s.ausgang : 'remis'}">${erE(erAusgangText(s))}${s && s.tore.length ? ` · Tore: ${erE(erTorText(s))}` : ''}</div>
      <label class="tk-feld"><span>Schriftzug</span><input id="erWort" maxlength="14" value="${erE(ERG.wort || erWortStandard(s))}"></label>
      <div class="er-bgs" role="list" aria-label="Hintergrund">${bgs}</div>
      <label class="btn sm ghost sb-up">${SVI('upload')} <span data-sbt>Eigenes Foto hochladen</span><input type="file" id="erDatei" accept="image/*" hidden></label>
      <label class="tk-profi"><input type="checkbox" id="erMw"${ERG.zeigeSpieler ? ' checked' : ''}><span><b>Matchwinner zeigen</b> <span id="erMwInfo"></span></span></label>
      ${mwOpt ? `<label class="tk-feld"><span>Spieler im Bild</span><select id="erMwWahl">${opt('', 'Automatisch: Torschütze mit Foto', !ERG.spieler)}${mwOpt}</select></label>` : ''}
      <div class="er-text"><div class="er-text-k"><b>Text zum Posten</b><span><button type="button" class="btn sm ghost" id="erAnders">${SVI('refresh')} Anderer Text</button><button type="button" class="btn sm" id="erKopie">${SVI('copy')} Kopieren</button></span></div>
        <textarea id="erText" rows="8">${erE(text)}</textarea></div>
      <details class="tk-eb"><summary>Ebenen</summary><div>${ER_EBENEN.map(([k, t]) => `<label class="pk-eb"><input type="checkbox" data-ere="${k}"${ERG.ebenen[k] ? ' checked' : ''}><span>${erE(t)}</span></label>`).join('')}</div></details>
    </div>`;
  const neu = () => { erOberflaeche(h); erZeichnen(); };
  h.querySelector('#erSpiel').onchange = async e => { ERG.idx = +e.target.value; await erStandLaden(); neu(); };
  h.querySelectorAll('[data-erf]').forEach(b => b.onclick = () => { ERG.format = b.dataset.erf; h.querySelectorAll('[data-erf]').forEach(x => x.classList.toggle('on', x === b)); erZeichnen(); });
  h.querySelectorAll('[data-erb]').forEach(b => b.onclick = () => { ERG.bg = b.dataset.erb; h.querySelectorAll('[data-erb]').forEach(x => x.classList.toggle('on', x === b)); erZeichnen(); erMerken(); });
  h.querySelector('#erDatei').onchange = async e => { const inp = e.target, f = inp.files && inp.files[0]; if(!f) return;
    sbKnopf(inp, true); const erg = await sbHochladen(f); sbKnopf(inp, false); inp.value = '';
    if(!erg.ok){ kToast(erg.text); return; }
    await erBibLaden(); ERG.bg = erg.eintrag.pfad; neu(); erMerken(); kToast(SB_GESPEICHERT); };
  h.querySelector('#erWort').oninput = e => { ERG.wort = e.target.value.toUpperCase().trim(); erBald(); erMerken(); };
  h.querySelector('#erMw').onchange = e => { ERG.zeigeSpieler = e.target.checked; erZeichnen(); erMerken(); };
  const mwW = h.querySelector('#erMwWahl'); if(mwW) mwW.onchange = e => { ERG.spieler = e.target.value; erZeichnen(); erMerken(); };
  h.querySelector('#erText').oninput = e => { ERG.text = e.target.value; erMerken(); };
  h.querySelector('#erAnders').onclick = () => { ERG.variante = (ERG.variante + 1) % 3; ERG.text = ''; const t = erTexte(erSpiel()); h.querySelector('#erText').value = t[ERG.variante % t.length] || ''; erMerken(); };
  h.querySelector('#erKopie').onclick = async () => { const ta = h.querySelector('#erText'); try{ await navigator.clipboard.writeText(ta.value); kToast('Text kopiert'); }catch(e){ ta.select(); kToast('Text markiert, jetzt kopieren'); } };
  h.querySelectorAll('[data-ere]').forEach(c => c.onchange = () => { ERG.ebenen[c.dataset.ere] = c.checked; erZeichnen(); });
  h.querySelector('#erExport').onclick = () => erExport(false); h.querySelector('#erTeilen').onclick = () => erExport(true);
  if(ERG.idx === -1){
    h.querySelectorAll('[data-erh]').forEach(b => b.onclick = () => { ERG.hand.sub = b.dataset.erh; neu(); });
    h.querySelectorAll('[data-erhh]').forEach(b => b.onclick = () => { ERG.hand.heim = b.dataset.erhh === '1'; neu(); });
    const fl = (id, k, re) => { const i = h.querySelector(id); i.oninput = () => { ERG.hand[k] = re ? i.value.replace(re, '') : i.value; if(re) i.value = ERG.hand[k]; erBald(); clearTimeout(i._t); i._t = setTimeout(() => { const pos = i.selectionStart; neu(); const j = h.querySelector(id); j.focus(); try{ j.setSelectionRange(pos, pos); }catch(e){} }, 900); }; };
    fl('#erGegner', 'gegner'); fl('#erWir', 'wir', /\D/g); fl('#erIhr', 'ihr', /\D/g); } }

let erLaeuft = false;
async function erExport(teilen){ if(erLaeuft) return; const s = erSpiel(); if(!s){ kToast('Bitte zuerst ein Spiel wählen'); return; } erLaeuft = true;
  try{ await tkFonts(); const A = await erAssets(s), cv = document.createElement('canvas');
    erMalen(cv, { spiel:s, format:ERG.format, wort:ERG.wort || erWortStandard(s), ebenen:ERG.ebenen, matchwinner:!!A.mwP }, A);
    const blob = await new Promise(ok => cv.toBlob(ok, 'image/png')); if(!blob) throw new Error('PNG konnte nicht erzeugt werden');
    const name = `SVBSC-${s.sub === 'D2' ? 'Zweite' : 'Erste'}-${s.wir}-${s.ihr}-${String(s.gegner).replace(/[^\wäöüÄÖÜß]+/g, '-').replace(/^-|-$/g, '')}-${ERG.format}.png`;
    const file = new File([blob], name, { type:'image/png' });
    if(teilen && navigator.canShare && navigator.canShare({ files:[file] })){ try{ await navigator.share({ files:[file], text:document.getElementById('erText')?.value || '' }); return; }catch(e){ if(e && e.name === 'AbortError') return; } }
    const a = document.createElement('a'); a.href = URL.createObjectURL(blob); a.download = name; document.body.appendChild(a); a.click(); a.remove(); setTimeout(() => URL.revokeObjectURL(a.href), 8000);
    kToast('Grafik als PNG geladen'); erMerken();
  }catch(e){ console.warn('Ergebnis-Export', e); kToast('Export hat nicht geklappt, bitte nochmal'); }
  finally{ erLaeuft = false; } }

/* ---------- Heute: frisches Ergebnis meldet sich beim Spieltagsstudio ---------- */
const ER_HEUTE = { geholt:false, spiel:null };
async function erHeuteHolen(){ if(ER_HEUTE.geholt) return; ER_HEUTE.geholt = true;
  try{ const ab = new Date(Date.now() - 3 * 864e5).toISOString().slice(0, 10);
    const { data } = await SVB.sb.from('match_results').select('id,sub,datum,bis,heim,gast,heim_key,gast_key,tore_heim,tore_gast').or('heim_key.ilike.svbsc*,gast_key.ilike.svbsc*').gte('bis', ab).order('bis', { ascending:false }).limit(4);
    const r = (data || []).find(x => erWir(x.heim_key) || erWir(x.gast_key)); if(!r) return;
    const { data:g } = await SVB.sb.from('plakat_spiel').select('spiel').eq('spiel', 'ergebnis-' + r.id).maybeSingle(); if(g) return;
    const heim = erWir(r.heim_key); ER_HEUTE.spiel = { wir:heim ? r.tore_heim : r.tore_gast, ihr:heim ? r.tore_gast : r.tore_heim, gegner:heim ? r.gast : r.heim, zweite:/ii$/.test(erNorm(heim ? r.heim_key : r.gast_key)) };
    if(typeof htRender === 'function') htRender(); }catch(e){} }
if(typeof htStand === 'function'){ const _hs = htStand; htStand = function(k){ if(k === 'plakat'){ if(!ER_HEUTE.geholt) setTimeout(erHeuteHolen, 1500);
    const s = ER_HEUTE.spiel; if(s) return { t:`Ergebnisgrafik bereit: ${s.zweite ? 'Zweite ' : ''}${s.wir}:${s.ihr} gegen ${s.gegner}`, n:0, heute:true }; }
  return _hs.apply(this, arguments); }; }
if(typeof htGehe === 'function'){ const _hg = htGehe; htGehe = function(k){ if(k === 'plakat' && ER_HEUTE.spiel && typeof TKR !== 'undefined'){ TKR.modus = 'ergebnis'; ER_HEUTE.spiel = null; } return _hg.apply(this, arguments); }; }

(function(){ try{ const s=document.createElement('style'); s.id='svm65css'; s.textContent="/* 0.69 Ergebnis-Grafiken im Spieltagsstudio */\n.er-spiel select,.er-wrap .tk-feld select{min-height:44px;padding:6px 10px;border:1.5px solid var(--line,rgba(29,39,96,.16));border-radius:9px;font:inherit;font-size:14px;font-weight:600;background:var(--surface2,#fff);color:inherit;width:100%}\n.er-neu{display:inline-block;margin-left:6px;padding:1px 7px;border-radius:6px;background:#1f8bff;color:#fff;font-style:normal;font-size:11px;font-weight:800;letter-spacing:.06em;text-transform:uppercase;vertical-align:1px}\n.er-hand{display:grid;gap:8px;padding:10px;border:1px dashed var(--line,rgba(29,39,96,.2));border-radius:10px}\n.er-hand .pk-seg{margin:0}\n.er-tore{grid-template-columns:1fr 1fr}\n.er-ausgang{display:flex;align-items:center;gap:8px;min-height:40px;padding:8px 12px;border-radius:10px;font-weight:700;font-size:14px;line-height:1.35;background:rgba(125,180,255,.12);border-left:4px solid #7db4ff}\n.er-ausgang.er-sieg{background:rgba(255,194,61,.14);border-left-color:#ffc23d}\n.er-ausgang.er-niederlage{background:rgba(159,179,209,.12);border-left-color:#9fb3d1}\n.er-bgs{display:grid;grid-template-columns:repeat(auto-fill,minmax(74px,1fr));gap:6px}\n.er-bg{position:relative;display:block;padding:0;aspect-ratio:3/4;border:2px solid transparent;border-radius:10px;overflow:hidden;background:#0b1430;cursor:pointer;max-width:100%}\n.er-bg img{width:100%;height:100%;object-fit:cover;display:block}\n.er-bg span{position:absolute;left:0;right:0;bottom:0;padding:14px 4px 4px;background:linear-gradient(transparent,rgba(0,0,0,.75));color:#fff;font-size:11px;font-weight:700;text-align:center;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}\n.er-bg.on{border-color:#1f8bff;box-shadow:0 0 0 2px rgba(31,139,255,.35)}\n.er-bg:focus-visible{outline:2px solid #1f8bff;outline-offset:2px}\n.er-text{display:grid;gap:6px}\n.er-text-k{display:flex;justify-content:space-between;align-items:center;gap:8px;flex-wrap:wrap;font-size:13.5px}\n.er-text-k span{display:flex;gap:6px;flex-wrap:wrap}\n.er-text textarea{width:100%;min-height:170px;padding:10px 12px;border:1.5px solid var(--line,rgba(29,39,96,.16));border-radius:9px;font:inherit;font-size:14px;line-height:1.55;resize:vertical;background:var(--surface2,#fff);color:inherit}\n#erMwInfo{display:block;font-size:12px;opacity:.75;font-weight:500}\n"; document.head.appendChild(s); }catch(e){} })();
(function(){ try{ const s=document.createElement('style'); s.id='svstcss'; s.textContent="/* SV/BSC Studio */\nbody.st-voll main{max-width:none!important;padding:10px 14px 10px!important}\nbody.st-voll .ptitle,body.st-voll #hubbar{display:none!important}\n.st-warn{margin-bottom:12px}\n.st-lk{display:flex;flex-wrap:wrap;gap:12px;align-items:center;justify-content:space-between;margin-bottom:14px}\n.st-such input{min-width:260px;background:var(--surface);color:var(--ink);border:1px solid var(--line);border-radius:10px;padding:9px 12px;font:inherit}\n.st-imp{cursor:pointer}\n.st-pks{display:grid;grid-template-columns:repeat(auto-fill,minmax(260px,1fr));gap:16px}\n.st-pk{display:flex;flex-direction:column;gap:10px;text-align:left;background:var(--surface);border:1px solid var(--line);border-radius:14px;padding:10px;cursor:pointer;color:var(--ink);font:inherit}\n.st-pk:hover{border-color:var(--accent,#3d7bff)}\n.st-pk-bild{display:block;width:100%;aspect-ratio:16/9;background:#0e1330;border-radius:8px;overflow:hidden;position:relative}\n.st-pk-bild .st-host,.st-ft .st-host,.st-kivf .st-host{position:absolute;left:0;top:0;transform-origin:0 0;pointer-events:none}\n.st-pk-t{display:grid;gap:2px}.st-pk-t b{font-size:15px;line-height:1.25}.st-pk-t small{color:var(--ink3);font-size:12px}\n.st-arch{margin-top:18px}\n/* Editor */\n.st-ed{display:flex;flex-direction:column;height:calc(100vh - 92px);min-height:560px}\n.st-top{display:flex;align-items:center;gap:8px;flex-wrap:wrap;padding:4px 2px 10px;border-bottom:1px solid var(--line)}\n.st-top #stZur svg{transform:rotate(180deg)}\n.st-titel{font:800 20px/1.2 'Barlow Condensed',var(--font,sans-serif);text-transform:uppercase;letter-spacing:.02em;background:transparent;border:1px solid transparent;border-radius:8px;color:var(--ink);padding:4px 8px;min-width:280px}\n.st-titel:hover,.st-titel:focus{border-color:var(--line);outline:none}\n.st-stat{font-size:12px;color:var(--ink3);white-space:nowrap}.st-stat.speichert,.st-stat.ungespeichert{color:var(--warn,#f5b44a)}.st-stat.fehler{color:var(--red,#ff6b6b)}\n.st-live{display:flex;gap:4px}.st-av{width:28px;height:28px;border-radius:50%;display:inline-flex;align-items:center;justify-content:center;font:700 11px sans-serif;color:#fff;cursor:pointer;border:2px solid var(--surface)}\n.st-main{flex:1;display:flex;min-height:0;gap:10px;padding-top:10px}\n.st-side{width:212px;flex:0 0 auto;display:flex;flex-direction:column;min-height:0}\n.st-fl{flex:1;overflow:auto;display:flex;flex-direction:column;gap:8px;padding-right:4px}\n.st-fi{position:relative;display:grid;grid-template-columns:20px 1fr;gap:4px 6px;padding:6px;border-radius:10px;border:2px solid transparent;cursor:pointer}\n.st-fi.on{border-color:var(--accent,#3d7bff);background:var(--surface2)}.st-fi.skip .st-ft{opacity:.45}.st-fi.drag{opacity:.4}.st-fi.ziel{border-top:3px solid #e8741f}\n.st-fn{font-size:11px;color:var(--ink3);text-align:right;padding-top:2px}\n.st-ft{position:relative;overflow:hidden;border-radius:4px;background:#0e1330;box-shadow:0 1px 3px rgba(0,0,0,.25)}\n.st-fl-l{grid-column:2;font-size:11px;color:var(--ink2);white-space:nowrap;overflow:hidden;text-overflow:ellipsis}.st-fl-l i{font-style:normal;color:var(--warn,#f5b44a)}\n.st-fa{position:absolute;right:8px;top:8px;display:none;gap:3px}.st-fi:hover .st-fa{display:flex}\n.st-fa button{background:rgba(14,19,48,.85);color:#fff;border:0;border-radius:6px;font-size:12px;padding:3px 6px;cursor:pointer}.st-fa button.sure{background:#c0392b}\n.st-neuf{margin-top:8px}\n.st-mitte{flex:1;min-width:0;display:flex;flex-direction:column;gap:8px}\n.st-tools{min-height:44px;display:flex;flex-wrap:wrap;align-items:center;gap:6px;background:var(--surface);border:1px solid var(--line);border-radius:12px;padding:6px 10px;font-size:13px}\n.st-tools .sp{flex:1}\n.st-tl{font-size:11px;text-transform:uppercase;letter-spacing:.06em;color:var(--ink3);margin-left:6px}\n.st-tip{color:var(--ink3);font-size:12px}\n.st-in{background:var(--bg,#0b0f24);color:var(--ink);border:1px solid var(--line);border-radius:8px;padding:5px 8px;font:inherit;font-size:13px}\n.st-num{width:64px}.st-lbl{min-width:200px}\n.st-tb{min-width:30px;height:30px;border-radius:8px;border:1px solid var(--line);background:var(--surface2);color:var(--ink);cursor:pointer;font-size:13px;padding:0 6px}\n.st-tb.on{background:var(--accent,#3d7bff);border-color:var(--accent,#3d7bff);color:#fff}.st-tb.st-rot:hover{background:#c0392b;color:#fff}\n.st-sw{width:22px;height:22px;border-radius:50%;border:2px solid var(--line);cursor:pointer;padding:0}.st-sw0{background:transparent;color:var(--ink3);font-size:12px}\n.st-col{width:30px;height:28px;border:0;background:none;padding:0;cursor:pointer}\n.st-warnb{font-size:11px;font-weight:700;color:#1c1c22;background:#f5b44a;border-radius:6px;padding:2px 6px}.st-okb{font-size:11px;font-weight:700;color:#0e3d24;background:#7ee2a8;border-radius:6px;padding:2px 6px}\n.st-bc{display:flex;gap:2px;align-items:center;color:var(--ink3)}.st-bc button{background:none;border:0;color:var(--ink2);cursor:pointer;font:inherit;font-size:12px;padding:2px 4px;border-radius:6px}.st-bc button.on{color:var(--ink);font-weight:700;background:var(--surface2)}\n.st-canvas{flex:1;min-height:0;display:flex;align-items:center;justify-content:center;background:repeating-conic-gradient(rgba(127,127,127,.06) 0 25%,transparent 0 50%) 0 0/24px 24px;border-radius:12px;overflow:auto;padding:20px}\n.st-buehne{position:relative;flex:0 0 auto;box-shadow:0 10px 40px rgba(0,0,0,.35)}\n.st-buehne>.st-host{position:absolute;left:0;top:0;transform-origin:0 0}\n.st-ov{position:absolute;inset:0;pointer-events:none}\n.st-box{position:absolute;border:1.5px solid #3d7bff;pointer-events:none}.st-box.zwei{border-style:dashed}\n.st-h{position:absolute;width:10px;height:10px;background:#fff;border:1.5px solid #3d7bff;border-radius:2px;pointer-events:auto}\n.st-h-nw{left:-6px;top:-6px;cursor:nwse-resize}.st-h-n{left:calc(50% - 5px);top:-6px;cursor:ns-resize}.st-h-ne{right:-6px;top:-6px;cursor:nesw-resize}.st-h-e{right:-6px;top:calc(50% - 5px);cursor:ew-resize}\n.st-h-se{right:-6px;bottom:-6px;cursor:nwse-resize}.st-h-s{left:calc(50% - 5px);bottom:-6px;cursor:ns-resize}.st-h-sw{left:-6px;bottom:-6px;cursor:nesw-resize}.st-h-w{left:-6px;top:calc(50% - 5px);cursor:ew-resize}\n.st-rot{position:absolute;left:calc(50% - 7px);top:-30px;width:14px;height:14px;border-radius:50%;background:#fff;border:1.5px solid #3d7bff;pointer-events:auto;cursor:grab}\n.st-lab{position:absolute;left:-1px;top:-20px;background:#3d7bff;color:#fff;font:600 10px sans-serif;padding:2px 6px;border-radius:4px 4px 4px 0;white-space:nowrap}\n.st-hl{position:absolute;background:#e8741f}.st-hl.x{top:0;bottom:0;width:1px}.st-hl.y{left:0;right:0;height:1px}\n.st-rm{position:absolute;border:2px solid;pointer-events:none}.st-rm span{position:absolute;left:-2px;top:-18px;color:#fff;font:600 10px sans-serif;padding:1px 5px;border-radius:3px;white-space:nowrap}\n.st-rz{position:absolute;pointer-events:none;transition:left .08s linear,top .08s linear}.st-rz span{position:absolute;left:14px;top:14px;color:#fff;font:600 10px sans-serif;padding:1px 5px;border-radius:3px;white-space:nowrap}\n.st-kp{position:absolute;pointer-events:auto;width:24px;height:24px;border-radius:50% 50% 50% 0;border:0;background:#e8741f;color:#fff;font-size:12px;cursor:pointer;box-shadow:0 2px 6px rgba(0,0,0,.3)}\n.st-notiz{display:flex;flex-direction:column;gap:4px}.st-notiz label{font-size:11px;text-transform:uppercase;letter-spacing:.06em;color:var(--ink3)}\n.st-notiz textarea{background:var(--surface);color:var(--ink);border:1px solid var(--line);border-radius:10px;padding:8px 10px;font:inherit;font-size:14px;resize:vertical}\n.st-rechts{width:320px;flex:0 0 auto;overflow:auto;background:var(--surface);border:1px solid var(--line);border-radius:12px;padding:12px 14px}\n.st-rechts h4{margin:6px 0 8px;font-size:13px;text-transform:uppercase;letter-spacing:.06em;color:var(--ink2)}.st-rechts h5{margin:10px 0 6px}\n.st-baul{display:grid;grid-template-columns:1fr 1fr;gap:6px;margin-bottom:12px}\n.st-bau{background:var(--surface2);border:1px solid var(--line);color:var(--ink);border-radius:9px;padding:9px 8px;font:inherit;font-size:12.5px;text-align:left;cursor:pointer}.st-bau:hover{border-color:#e8741f}\n.st-mf{display:flex;flex-wrap:wrap;gap:4px;margin-bottom:8px}.st-mf button{background:var(--surface2);border:1px solid var(--line);color:var(--ink2);border-radius:999px;padding:4px 10px;font:inherit;font-size:12px;cursor:pointer}.st-mf button.on{background:var(--accent,#3d7bff);border-color:var(--accent,#3d7bff);color:#fff}.st-mf button:disabled{opacity:.4}\n.st-drop{display:flex;align-items:center;gap:8px;justify-content:center;border:2px dashed var(--line);border-radius:10px;padding:12px;font-size:13px;color:var(--ink2);cursor:pointer;margin-bottom:10px}.st-drop.over{border-color:#e8741f;color:var(--ink)}\n.st-mg{display:grid;grid-template-columns:repeat(auto-fill,minmax(88px,1fr));gap:8px}\n.st-m{display:flex;flex-direction:column;gap:4px;background:var(--surface2);border:1px solid var(--line);border-radius:8px;padding:4px;cursor:pointer;color:var(--ink2);font:inherit;font-size:11px}\n.st-m img{width:100%;aspect-ratio:1;object-fit:cover;border-radius:5px;background:repeating-conic-gradient(#ddd 0 25%,#fff 0 50%) 0 0/12px 12px}.st-m span{white-space:nowrap;overflow:hidden;text-overflow:ellipsis}\n#modal.st-modal{max-width:920px}\n.st-kn{display:flex;flex-direction:column;gap:6px;margin-bottom:12px}.st-kn textarea{background:var(--bg,#0b0f24);color:var(--ink);border:1px solid var(--line);border-radius:8px;padding:8px;font:inherit;font-size:13px}\n.st-kz{font-size:12px;color:var(--ink3);display:flex;align-items:center;justify-content:space-between}\n.st-ksug{display:flex;flex-wrap:wrap;gap:4px}.st-ksug button{background:var(--surface2);border:1px solid var(--line);color:var(--ink);border-radius:999px;padding:3px 9px;font-size:12px;cursor:pointer}\n.st-k{border-top:1px solid var(--line2);padding:10px 0}.st-k.erl{opacity:.55}.st-kh{display:flex;justify-content:space-between;font-size:12px}.st-kh small{color:var(--ink3)}\n.st-k p{margin:4px 0;font-size:13px;line-height:1.45}.st-at{color:#e8741f}.st-ka{margin:4px 0 0 10px;padding-left:8px;border-left:2px solid var(--line);font-size:12.5px}\n.st-kb{display:flex;gap:8px}.st-kb button{background:none;border:0;color:var(--accent,#3d7bff);cursor:pointer;font-size:12px;padding:0}\n.st-vn{display:flex;gap:6px;margin-bottom:12px}.st-vn .st-in{flex:1}\n.st-v{display:grid;grid-template-columns:1fr auto;gap:2px 8px;align-items:center;border-top:1px solid var(--line2);padding:8px 0}.st-v small{color:var(--ink3);font-size:11px}.st-v button{grid-row:1/3;grid-column:2}\n.st-exp{display:grid;gap:8px;margin:12px 0}.st-ex{display:grid;grid-template-columns:auto 1fr;gap:2px 10px;align-items:center;background:var(--surface2);border:1px solid var(--line);border-radius:10px;padding:10px 12px;cursor:pointer}.st-ex small{grid-column:2;color:var(--ink3)}\n.st-chk{display:flex;gap:6px;align-items:center;font-size:13px}\n.st-kim{margin:8px 0}.st-rechts textarea#stKiP{width:100%;box-sizing:border-box;background:var(--bg,#0b0f24);color:var(--ink);border:1px solid var(--line);border-radius:8px;padding:8px;font:inherit;font-size:13px;margin-bottom:8px}\n.st-kiv{display:flex;flex-direction:column;gap:8px;margin:8px 0}.st-kivf{position:relative;overflow:hidden;border-radius:6px;background:#0e1330}\n.st-diff{display:flex;flex-direction:column;gap:8px;margin:8px 0;font-size:13px}.st-diff del{display:block;color:#ff8a8a;text-decoration:line-through}.st-diff ins{display:block;color:#7ee2a8;text-decoration:none}\n.st-pl{display:flex;flex-direction:column;gap:8px;margin:12px 0}.st-pe{display:grid;grid-template-columns:48px 1fr 1fr auto auto auto;gap:8px;align-items:center}\n.st-pf{width:44px;height:44px;border-radius:50%;overflow:hidden;background:var(--surface2)}.st-pf img{width:100%;height:100%;object-fit:cover}\n.st-nur .st-tools .st-tb,.st-nur .st-tools .st-sw{display:none}\n/* Präsentieren */\n.st-praes{position:fixed;inset:0;z-index:10000;background:#000;display:flex;align-items:center;justify-content:center}\n.st-pb{position:relative;overflow:hidden;cursor:pointer}.st-pb .st-host{position:absolute;left:0;top:0;transform-origin:0 0}\n.st-pz{position:fixed;right:18px;bottom:14px;color:rgba(255,255,255,.55);font:600 13px sans-serif}\n.st-px,.st-pr{position:fixed;top:14px;background:rgba(255,255,255,.12);color:#fff;border:0;border-radius:8px;padding:8px 12px;cursor:pointer;opacity:.25;transition:opacity .2s}.st-px{right:14px}.st-pr{right:60px}\n.st-praes:hover .st-px,.st-praes:hover .st-pr{opacity:.9}\n@media(max-width:1100px){.st-rechts{position:fixed;right:10px;top:120px;bottom:20px;z-index:50;box-shadow:0 10px 40px rgba(0,0,0,.4)}.st-side{width:150px}}\n@media(max-width:760px){.st-side{display:none}.st-ed{height:auto}.st-canvas{min-height:50vh}}\n/* studio.kaderwerk.pro: nur das Studio */\nhtml.st-app .side,html.st-app .tabbar,html.st-app #hubbar,html.st-app .gsearch,html.st-app #trFab{display:none!important}\nhtml.st-app .mainwrap{margin-left:0!important}\nhtml.st-app body{padding-left:0!important}\nhtml.st-app main{margin-left:0!important;max-width:none!important}\n/* Beta 0.44: Kontextmenü wie in Canva */\n.st-ctx{position:fixed;z-index:20000;min-width:250px;max-width:340px;background:#14193a;color:#eef1fb;border:1px solid rgba(255,255,255,.12);border-radius:12px;padding:6px;box-shadow:0 18px 50px rgba(0,0,0,.45);font-size:13.5px}\n.st-ci{position:relative;display:flex;align-items:center;gap:10px;width:100%;background:none;border:0;color:inherit;font:inherit;text-align:left;padding:8px 10px;border-radius:8px;cursor:pointer}\n.st-ci:hover,.st-ci.offen{background:rgba(255,255,255,.08)}.st-ci:disabled{opacity:.38;cursor:default;background:none}\n.st-ci.rot .st-cit{color:#ff9a8a}\n.st-cic{width:20px;text-align:center;flex:0 0 auto;opacity:.85}.st-cit{flex:1}\n.st-ci kbd{font:11px ui-monospace,monospace;color:rgba(238,241,251,.5);background:none;border:0}\n.st-cpf{opacity:.6}\n.st-cs{height:1px;background:rgba(255,255,255,.1);margin:5px 4px}\n.st-ck{font-size:11px;text-transform:uppercase;letter-spacing:.08em;color:rgba(238,241,251,.5);padding:6px 10px 2px}\n.st-csub{display:none;position:absolute;top:0;left:100%;margin-left:4px}\n.st-ci.offen>.st-csub{display:block}\n.st-cg{display:grid;grid-template-columns:repeat(3,96px);gap:6px;padding:6px}.st-cg button{padding:0;border:2px solid transparent;border-radius:6px;overflow:hidden;background:#0b0f24;cursor:pointer;aspect-ratio:16/10}\n.st-cg button:hover{border-color:#e8741f}.st-cg img{width:100%;height:100%;object-fit:cover;display:block}.st-cg small{grid-column:1/-1;color:rgba(238,241,251,.6);padding:4px}\n.st-cdot{display:inline-block;width:14px;height:14px;border-radius:50%;border:1px solid rgba(255,255,255,.3);vertical-align:middle}\n/* Master-Modus */\n.st-mhin{display:flex;flex-direction:column;gap:3px;padding:10px;margin:0 0 8px;border-radius:10px;background:rgba(232,116,31,.12);border:1px solid rgba(232,116,31,.35);font-size:12px}.st-mhin b{color:#e8741f}.st-mhin small{color:var(--ink2);line-height:1.35}\n.st-ed.st-mmod .st-canvas{background-image:repeating-linear-gradient(45deg,rgba(232,116,31,.06) 0 14px,transparent 14px 28px)}\n#stMaster.on{border-color:#e8741f;color:#e8741f}\n.st-mtag{display:inline-block;font-style:normal;font-size:11px;font-weight:700;line-height:1;padding:2px 4px;border-radius:4px;background:rgba(143,201,236,.18);color:#8fc9ec;vertical-align:middle}\n/* Bildpool */\n.st-mk{display:flex;gap:8px;align-items:center;margin-bottom:8px}.st-mk .st-in{flex:1}.st-mz{font-size:12px;color:var(--ink3);white-space:nowrap}\n.st-mf small{opacity:.6;font-size:11px}\n.st-mw{position:relative}.st-mw .st-m{width:100%}\n.st-mi{position:absolute;right:4px;top:4px;width:24px;height:24px;border-radius:6px;border:0;background:rgba(11,15,36,.75);color:#fff;cursor:pointer;opacity:0;transition:opacity .15s}\n.st-mw:hover .st-mi,.st-mi:focus{opacity:1}\n#modal.st-pool{max-width:1100px}#modal.st-pool .st-mg{max-height:62vh;overflow:auto}\n.st-md{display:grid;grid-template-columns:minmax(0,1.3fr) minmax(0,1fr);gap:18px;align-items:start}.st-md img{width:100%;border-radius:10px;background:#0b0f24}.st-md .st-in{width:100%;box-sizing:border-box;margin-bottom:10px}\n.st-md .st-tl{display:block;margin:4px 0}\n@media(max-width:700px){.st-md{grid-template-columns:1fr}}\n/* Export und Teilen */\n#modal.st-expm{max-width:860px}\n.st-el{font-size:12px;font-weight:700;letter-spacing:.06em;text-transform:uppercase;color:var(--ink3);margin:14px 0 8px}.st-el small{text-transform:none;letter-spacing:0;font-weight:400;margin-left:6px}\n.st-ef{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:10px}\n.st-eo{display:grid;grid-template-columns:auto 1fr;gap:2px 10px;text-align:left;background:var(--surface2);border:1.5px solid var(--line);border-radius:12px;padding:12px;color:var(--ink);font:inherit;cursor:pointer;align-items:start}\n.st-eo .st-ei{grid-row:1/3;font-size:24px;line-height:1}.st-eo b{font-size:14px}.st-eo small{color:var(--ink3);font-size:12px;line-height:1.35}\n.st-eo:hover{border-color:rgba(232,116,31,.6)}.st-eo.on{border-color:#e8741f;background:rgba(232,116,31,.1)}\n.st-eg{display:grid;grid-template-columns:1fr 1fr;gap:18px}\n.st-seg{display:flex;gap:6px;flex-wrap:wrap}.st-seg button{flex:1;min-width:110px;display:flex;flex-direction:column;gap:2px;background:var(--surface2);border:1.5px solid var(--line);border-radius:10px;padding:9px 10px;color:var(--ink);font:inherit;font-weight:600;font-size:13px;cursor:pointer;text-align:left}\n.st-seg button small{font-weight:400;font-size:11.5px;color:var(--ink3)}.st-seg button.on{border-color:#e8741f;background:rgba(232,116,31,.1)}\n.st-ew .st-in{margin-top:8px;width:100%;box-sizing:border-box}.st-ew .st-chk{margin-top:10px}.st-ew .btnrow{margin-top:18px;align-items:center}\n.st-ep{padding:30px 6px;text-align:center}.st-epb{height:8px;border-radius:99px;background:var(--surface2);overflow:hidden;margin:0 auto 14px;max-width:420px}.st-epb i{display:block;height:100%;background:linear-gradient(90deg,#e8741f,#f5a35c);transition:width .6s}\n.st-ed1{display:flex;gap:14px;align-items:center;padding:14px;border-radius:12px;background:rgba(126,226,168,.08);border:1px solid rgba(126,226,168,.3)}.st-edi{font-size:28px}.st-ed1 b{display:block}.st-ed1 small{color:var(--ink3)}\n.st-eaz{display:flex;gap:10px;flex-wrap:wrap;margin:14px 0 4px}\n.st-esl{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:10px}\n.st-eb{display:flex;flex-direction:column;align-items:center;gap:6px;padding:14px 8px;border-radius:12px;background:var(--surface2);border:1px solid var(--line);color:var(--ink);font:inherit;font-size:13px;font-size:22px;text-decoration:none;cursor:pointer}.st-eb span{font-size:12.5px}.st-eb:hover{border-color:#e8741f}\n@media(max-width:700px){.st-ef{grid-template-columns:1fr 1fr}.st-eg{grid-template-columns:1fr}.st-esl{grid-template-columns:1fr 1fr}}\n/* Beta 0.45: Bereiche und Sichtbarkeit */\n.st-bb{display:inline-flex;align-items:center;gap:4px;align-self:flex-start;font-size:11px;font-weight:700;letter-spacing:.04em;text-transform:uppercase;padding:2px 7px;border-radius:999px;background:color-mix(in srgb,var(--bc) 22%,transparent);color:color-mix(in srgb,var(--bc) 55%,#fff);border:1px solid color-mix(in srgb,var(--bc) 50%,transparent);margin-bottom:4px;white-space:nowrap}\n.st-bb.gross{font-size:11px;margin:0}\n.st-bdot{display:inline-block;width:9px;height:9px;border-radius:50%;background:var(--bc,#5b5b66);margin-right:5px;vertical-align:middle}\n.st-bf{margin-top:10px}.st-bf button small{opacity:.6}\n.st-bw{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:8px;margin:10px 0}\n.st-bo{display:flex;flex-direction:column;gap:3px;text-align:left;background:var(--surface2);border:1.5px solid var(--line);border-radius:10px;padding:10px 12px;color:var(--ink);font:inherit;cursor:pointer}\n.st-bo small{color:var(--ink3);font-size:11.5px;line-height:1.3}.st-bo.on{border-color:var(--bc);background:color-mix(in srgb,var(--bc) 14%,transparent)}\n.st-sicht{display:inline-flex;align-items:center;gap:6px;background:none;border:1px solid var(--line);border-radius:999px;padding:3px 10px 3px 4px;color:var(--ink2);font:inherit;font-size:12px;cursor:pointer}.st-sicht:hover{border-color:var(--ink3)}\n.st-swh{display:grid;grid-template-columns:1fr 1fr;gap:12px;background:var(--surface2);border-radius:10px;padding:10px 12px}.st-swh p{margin:2px 0 0;font-size:13px}\n@media(max-width:600px){.st-bw,.st-swh{grid-template-columns:1fr}}\n/* Beta 0.46 · Sperre und Verlauf */\n.st-lock{font-size:12px;font-weight:700;padding:3px 9px;border-radius:999px;white-space:nowrap}.st-lock.mine{background:color-mix(in srgb,#22c55e 18%,transparent);color:var(--ink)}\n.st-sperre{display:flex;align-items:center;gap:10px;flex-wrap:wrap;padding:9px 14px;font-size:13.5px;line-height:1.4;border-bottom:1px solid var(--line2)}\n.st-sperre>span:nth-child(2){flex:1 1 260px}.st-sperre.zu{background:color-mix(in srgb,#e8741f 16%,var(--surface))}.st-sperre.frei{background:color-mix(in srgb,#22c55e 12%,var(--surface))}\n.st-sp-i{font-size:16px}\n.st-pk-lock{display:inline-block;justify-self:start;margin-top:3px;font-size:11.5px;font-weight:700;color:#e8741f}\n.st-verl{display:flex;flex-direction:column}.st-vt{margin:12px 0 2px;font-size:11px;font-weight:800;letter-spacing:.08em;text-transform:uppercase;color:var(--ink3)}\n.st-ve{border-top:1px solid var(--line2);padding:8px 0;font-size:13px;line-height:1.4}.st-vk{display:grid;grid-template-columns:42px 1fr;gap:6px}\n.st-vz{color:var(--ink3);font-variant-numeric:tabular-nums}.st-ve small{color:var(--ink3)}.st-vd{margin:3px 0 0 48px;color:var(--ink2);font-size:12px}\n.st-vb{display:flex;gap:6px;flex-wrap:wrap;margin:6px 0 0 48px}.st-vp{display:flex;gap:10px;margin:8px 0 0;flex-wrap:wrap}.st-vp:not([hidden]){display:flex}\n.st-vf{margin:0;display:flex;flex-direction:column;gap:4px}.st-vf figcaption{font-size:11px;color:var(--ink3)}.st-vbild{position:relative;overflow:hidden;border:1px solid var(--line);border-radius:6px;background:#fff}\n.st-vbild .st-host{transform-origin:0 0;position:absolute;left:0;top:0}\n.st-v.auto b{font-weight:600;color:var(--ink2)}\n"; document.head.appendChild(s); }catch(e){} })();
(function(){ try{ const s=document.createElement('style'); s.id='svm43css'; s.textContent="/* Beta 0.42 */\n.pf43-sep{margin:18px 2px 6px;font-size:11px;font-weight:700;letter-spacing:.08em;text-transform:uppercase;color:var(--ink3)}\n.pf4-sec .pf43-treue{margin:0 0 12px;max-width:360px}\n.pf4-sec .card.pf43-vr{background:none;border:0;box-shadow:none;padding:0;margin:0}\n.pf4-sec .pf43-ts{margin:10px 0 0}\n.pf4-sec h5.pf41h{margin-top:16px}\n.rk43 .rk43mehr{margin-top:8px}\n.pf4-sec[data-k=\"train\"] .trprof .trprof-h{justify-content:flex-end}\n.pf4-sec[data-k=\"train\"] .trprof .trprof-h h3.trh{display:none}\n.pf4-sec .card.trprof{background:none;border:0;box-shadow:none;padding:0;margin:0}\n/* Datenprüfung */\n.dp .dp-seg{margin:0 0 14px}\n.dp .dp-seg em,.dp .dp-team em{font-style:normal;font-weight:800;margin-left:4px;color:var(--warn,#f5b44a)}\n.dp .dp-team{margin:0 0 12px}\n.dp-intro{margin:0 0 12px}\n.dp-warn{margin:0 0 12px}\n.dp-d,.dp-v,.dp-s{margin-bottom:12px}\n.dp-dh{display:flex;gap:10px;align-items:center;flex-wrap:wrap;font-size:13px;color:var(--ink2);margin-bottom:10px}\n.dp-sc{font-weight:800;font-size:13px;min-width:34px;text-align:center;padding:3px 8px;border-radius:999px;background:var(--line2);color:var(--ink)}\n.dp-q{font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:.06em;color:var(--ink3)}\n.dp-pp,.dp-vv{display:grid;grid-template-columns:repeat(auto-fit,minmax(240px,1fr));gap:8px;margin-bottom:10px}\n.dp-p{display:flex;gap:10px;align-items:flex-start;border:1px solid var(--line);border-radius:12px;padding:10px 12px;cursor:pointer}\n.dp-p.on{border-color:var(--accent,#3d7bff)}\n.dp-p input{margin-top:3px}\n.dp-pn{display:grid;gap:2px;min-width:0}\n.dp-pn b{cursor:pointer;overflow-wrap:anywhere}\n.dp-pn small{color:var(--ink3);font-size:12px}\n.dp-pn em{font-style:normal;font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:.05em;color:var(--ink3)}\n.dp-p.on .dp-pn em{color:var(--accent,#3d7bff)}\n.dp-tw{overflow-x:auto;margin:0 0 8px}\n.dp-t{width:100%;border-collapse:collapse;font-size:13px}\n.dp-t th,.dp-t td{padding:6px 8px;border-bottom:1px solid var(--line2);text-align:left;vertical-align:top}\n.dp-t thead th{font-size:11px;color:var(--ink3);text-transform:uppercase;letter-spacing:.04em;font-weight:700}\n.dp-t tbody th{font-weight:600;color:var(--ink2);white-space:nowrap}\n.dp-t tbody th small{display:block;font-weight:500;color:var(--warn,#f5b44a);font-size:11px;white-space:normal}\n.dp-t tr.dp-wid td,.dp-t tr.dp-wid th{background:rgba(245,180,74,.06)}\n.dp-t td.dp-leer{color:var(--bad,#ff8a8a);font-weight:600}\n.dp-t td.dp-na{color:var(--ink3)}\n.dp-t td small{color:var(--ink3);font-size:11px}\n.dp-t td.dp-ann small{display:block;font-weight:500}\n.dp-sp tbody th b{cursor:pointer}\n.dp-sh{display:flex;gap:10px;align-items:center;flex-wrap:wrap;margin-bottom:8px}\n.dp-sh .dp-src{margin-left:auto;display:flex;gap:4px}\n.dp-sh .src50.off{opacity:.35;text-decoration:line-through}\n.dp-hw{margin:0 0 10px;padding-left:18px;font-size:13px;color:var(--ink2)}\n.dp-ok{color:var(--good,#5fe09b)}\n.dp-erl{margin-top:8px}\n.dp-mv{margin-top:10px}\n"; document.head.appendChild(s); }catch(e){} })();

/* Veranstaltungsstudio: private Fotoserien, unabhängig vom Spielplan. */
const FOST = { epoche:0, operationNr:0, ansichtNr:0, uid:'', host:null, weg:'studio', d:null, id:null, version:0, frei:null, dirty:false, revision:0,
  format:'feed', index:0, phase:'fotos', busy:false, speichern:null, timer:null, module:null,
  thumbs:new Map(), blobs:new Map(), bilder:new Map(), ladeBlobs:new Map(), ladeThumbs:new Map(), ladeBilder:new Map(), urls:new Map(), renderNr:0, meldung:'', konflikt:null, paket:null };
const fostE = v => svEsc(String(v == null ? '' : v));
const fostKlon = d => JSON.parse(JSON.stringify(d));
const fostQ = s => FOST.host && FOST.host.querySelector(s);
const fostRecht = () => typeof pkDarf === 'function' && pkDarf();
const fostSchluessel = () => 'sv_fotoserie_entwurf_' + FOST.uid;
// Jeder asynchrone Auftrag gehört einem Konto und einer geöffneten Datenfassung.
// Der tatsächliche Anmeldestand wird ebenfalls geprüft, auch vor dem nächsten Studio-Aufruf.
const fostKonto = () => SVB.user && SVB.user.id || '';
function fostKontext(){ return {uid:FOST.uid,epoche:FOST.epoche}; }
function fostGueltig(k){ return !!k && !!k.uid && k.uid===FOST.uid && k.uid===fostKonto() && k.epoche===FOST.epoche && (k.operation===undefined || k.operation===FOST.operationNr); }
function fostPruefKontext(k){ if(!fostGueltig(k)){ const e=Error('Der frühere Vorgang wurde beendet.');e.name='VstVeraltet';throw e; } }
async function fostWarten(p,k){ try{const r=await p;fostPruefKontext(k);return r;}catch(e){fostPruefKontext(k);throw e;} }
function fostEigenerStand(k){ k.epoche=FOST.epoche; }
function fostMeldung(t){ FOST.meldung = String(t || ''); const e=fostQ('[data-fost-status]'); if(e)e.textContent=FOST.meldung; }
function fostFehlerSichtbar(){const e=fostQ('[data-fost-status]');if(e){e.tabIndex=-1;e.scrollIntoView({block:'center',behavior:'auto'});e.focus({preventScroll:true});}}
function fostFehler(e){ return String(e && e.message || e || 'Bitte erneut versuchen.').slice(0,700); }
async function fostModule(){
  if(!FOST.module) FOST.module=Promise.all(['core','bilder','render','export'].map(n=>import('./studio-serien/veranstaltung_'+n+'.mjs?v='+encodeURIComponent(APP_BUILD)))).then(([core,bilder,render,ex])=>({core,bilder,render,ex})).catch(e=>{ FOST.module=null; throw e; });
  return FOST.module;
}
async function fostRpc(name,args={}){
  if(!SVB.sb || !SVB.user)throw Error('Bitte zuerst anmelden.');
  const {data,error}=await SVB.sb.rpc(name,args); if(error)throw Error(error.message || 'Speichern ist gerade nicht möglich.');
  if(data && data.ok===false && !data.konflikt)throw Error(data.error || 'Die Änderung konnte nicht gespeichert werden.');
  return data;
}
function fostEntwurfMerken(){
  if(!FOST.d || !FOST.dirty || !FOST.uid)return;
  try{ sessionStorage.setItem(fostSchluessel(),JSON.stringify({id:FOST.id,version:FOST.version,daten:FOST.d})); }catch(e){}
}
function fostAendern(zeichnen=true){
  if(FOST.busy)return; FOST.dirty=true; FOST.revision++; FOST.frei=null; FOST.paket=null;
  fostEntwurfMerken(); clearTimeout(FOST.timer); FOST.timer=setTimeout(()=>fostSpeichern().catch(()=>{}),1000);
  fostMeldung('Änderungen werden gespeichert …');
  const cb=fostQ('#fostGeprueft'); if(cb)cb.checked=false;
  const teilen=fostQ('#fostBilderTeilen'); if(teilen)teilen.hidden=true;
  if(zeichnen)fostZeichnen();
}
function fostUebernehmen(r){ FOST.epoche++;FOST.id=r.id; FOST.version=r.version; FOST.d=fostKlon(r.daten); FOST.frei=r.frei; FOST.dirty=false; FOST.konflikt=null; FOST.revision++; }
async function fostSpeichern(){
  clearTimeout(FOST.timer);const eintritt=fostKontext();
  if(!fostGueltig(eintritt))return false;
  if(FOST.speichern){ await FOST.speichern;if(!fostGueltig(eintritt))return false;if(FOST.dirty && !FOST.konflikt)return fostSpeichern();return !FOST.dirty; }
  if(!FOST.dirty || !FOST.d)return true;if(FOST.konflikt)return false;
  const rev=FOST.revision,uid=FOST.uid,epoche=FOST.epoche,id=FOST.id,daten=fostKlon(FOST.d),version=FOST.version;
  const lauf=(async()=>{
    try{
      const r=await fostRpc('fotoserie_merken',{p_id:id,p_version:version,p_daten:daten});
      if(FOST.uid!==uid || fostKonto()!==uid || FOST.epoche!==epoche || (FOST.id!==id && id!==null))return false;
      if(r.konflikt){FOST.konflikt=r;fostEntwurfMerken();fostKonfliktZeigen();return false;}
      FOST.id=r.id;FOST.version=r.version;FOST.frei=r.frei;
      if(FOST.revision===rev){FOST.dirty=false;try{sessionStorage.removeItem(fostSchluessel());}catch(e){}fostMeldung('Gespeichert');}
      else{fostEntwurfMerken();clearTimeout(FOST.timer);FOST.timer=setTimeout(()=>fostSpeichern().catch(()=>{}),500);}
      return !FOST.dirty;
    }catch(e){if(FOST.uid!==uid || fostKonto()!==uid || FOST.epoche!==epoche)return false;fostEntwurfMerken();fostMeldung('Noch nicht gespeichert. '+fostFehler(e));return false;}
  })();
  FOST.speichern=lauf;try{return await lauf;}finally{if(FOST.speichern===lauf)FOST.speichern=null;}
}
function fostKonfliktZeigen(){
  const box=fostQ('#fostKonflikt'); if(!box)return;
  box.hidden=false; box.innerHTML='<b>Jemand hat diese Serie inzwischen geändert.</b><p>Deine Änderungen bleiben hier erhalten. Lade den aktuellen Stand oder sichere deine Fassung als eigene Serie.</p><div class="fost-row"><button type="button" class="fost-btn" id="fostServer">Aktuellen Stand laden</button><button type="button" class="fost-btn fost-secondary" id="fostKopie">Meine Fassung als Kopie sichern</button></div>';
  fostQ('#fostServer').onclick=()=>{const r=FOST.konflikt; if(!r)return; fostUebernehmen(r); try{sessionStorage.removeItem(fostSchluessel());}catch(e){} fostEditor();};
  fostQ('#fostKopie').onclick=()=>fostArbeit(async k=>{
    const {core}=await fostWarten(fostModule(),k),alt=fostKlon(FOST.d),leer=core.neu();leer.titel=(alt.titel+' Kopie').slice(0,160);leer.fakten=alt.fakten;
    const neu=await fostWarten(fostRpc('fotoserie_merken',{p_id:null,p_version:0,p_daten:leer}),k);
    for(const p of alt.fotos){const pfad=neu.id+'/'+p.id+'.'+p.pfad.split('.').pop();const r=await fostWarten(SVB.sb.storage.from('studio-fotoserien').copy(p.pfad,pfad),k);if(r.error)throw Error('Die Kopie eines Fotos ist fehlgeschlagen. Deine bisherige Fassung bleibt erhalten.');p.pfad=pfad;}
    alt.titel=leer.titel;const r=await fostWarten(fostRpc('fotoserie_merken',{p_id:neu.id,p_version:neu.version,p_daten:alt}),k);
    if(r.konflikt)throw Error('Die neue Kopie wurde gleichzeitig geändert. Bitte erneut versuchen.');fostRessourcenFrei();fostUebernehmen(r);fostEigenerStand(k);try{sessionStorage.removeItem(fostSchluessel());}catch(e){}fostEditor();fostMeldung('Als eigene Serie gespeichert.');
  });
  fostMeldung('Speicherkonflikt. Bitte eine der beiden Möglichkeiten wählen.');
}
function fostRessourcenFrei(){
  FOST.renderNr++;for(const b of FOST.bilder.values())b.close?.();FOST.bilder.clear();FOST.blobs.clear();
  FOST.ladeBlobs.clear();FOST.ladeThumbs.clear();FOST.ladeBilder.clear();
  for(const u of FOST.thumbs.values())URL.revokeObjectURL(u);FOST.thumbs.clear();FOST.urls.clear();FOST.paket=null;
}
function fostSitzungWechseln(uid=''){
  fostEntwurfMerken();clearTimeout(FOST.timer);FOST.epoche++;FOST.operationNr++;FOST.ansichtNr++;
  fostRessourcenFrei();FOST.d=null;FOST.id=null;FOST.version=0;FOST.dirty=false;FOST.frei=null;FOST.konflikt=null;FOST.entfernt=null;FOST.meldung='';FOST.busy=false;FOST.speichern=null;FOST.uid=uid;
  if(FOST.host?.querySelector('.fost'))FOST.host.replaceChildren();
  if(FOST.nativeBlatt){try{FOST.nativeBlatt.remove();}catch(e){}FOST.nativeBlatt=null;}
}
async function fostStart(P,weg='studio'){
  const uid=fostKonto();if(FOST.uid!==uid)fostSitzungWechseln(uid);
  if(!P || !fostRecht() || !uid)return;
  FOST.host=P;FOST.weg=weg;const k=fostKontext(),ansicht=++FOST.ansichtNr;document.body.classList.remove('st-voll');
  try{await fostWarten(fostModule(),k);if(ansicht!==FOST.ansichtNr || P!==FOST.host)return;if(FOST.d)fosteOderListe();else await fostListe();}
  catch(e){if(!fostGueltig(k) || ansicht!==FOST.ansichtNr || P!==FOST.host || e.name==='VstVeraltet')return;P.innerHTML='<div class="card"><h2>Veranstaltungen</h2><p>'+fostE(fostFehler(e))+'</p><button type="button" class="btn" id="fostNochmal">Erneut versuchen</button></div>';P.querySelector('#fostNochmal').onclick=()=>fostStart(P,weg);}
}
function fosteOderListe(){fostEditor();}
function fostKopf(untertitel){return '<header class="fost-head"><div><span class="fost-eyebrow">SV/BSC STUDIO</span><h2>Veranstaltungen</h2><p>'+fostE(untertitel)+'</p></div><button type="button" class="fost-btn fost-secondary" id="fostZurueck">'+(FOST.d?'Alle Fotoserien':'Zurück zum Studio')+'</button></header>';}
function fostZurueckBinden(){ const b=fostQ('#fostZurueck'); if(b)b.onclick=async()=>{
  if(FOST.busy)return;const k=fostKontext();if(FOST.d){if(!await fostSpeichern() || !fostGueltig(k))return;FOST.epoche++;FOST.d=null; FOST.id=null; fostRessourcenFrei(); return fostListe();}
  FOST.host=null; if(FOST.weg==='studio'){ST.ansicht='liste';stListe();}else tkModus('spieltag');
};}
async function fostListe(){
  const P=FOST.host,k=fostKontext(),ansicht=++FOST.ansichtNr;if(!P || !fostGueltig(k))return;
  P.innerHTML='<div class="fost">'+fostKopf('Aus euren Fotos wird eine zusammenhängende Serie für Instagram.')+'<div class="fost-intro"><div><h3>Fotos von eurer Veranstaltung</h3><p>Fotos auswählen, Reihenfolge und Ausschnitte prüfen. Feed und Story bekommen jeweils einen eigenen Satz im Vereinsdesign.</p><p class="fost-meta">Bis zu 40 Ausgangsfotos. Höchstens 20 Folien je Serie.</p></div><button type="button" class="fost-btn" id="fostNeu">Neue Fotoserie</button></div><p data-fost-status role="status" aria-live="polite">Lade Fotoserien …</p><div id="fostProjekte" class="fost-projekte"></div></div>';
  fostZurueckBinden(); fostQ('#fostNeu').onclick=()=>fostArbeit(fostNeu);
  let entwurf;try{entwurf=JSON.parse(sessionStorage.getItem(fostSchluessel())||'null');}catch(e){}
  if(entwurf?.id && entwurf.daten){const b=document.createElement('button');b.type='button';b.className='fost-btn fost-secondary';b.textContent='Ungespeicherte Änderungen wiederherstellen';b.onclick=()=>fostOeffnen(entwurf.id,entwurf);fostQ('.fost-intro').appendChild(b);}
  try{const liste=await fostWarten(fostRpc('fotoserie_liste'),k);if(ansicht!==FOST.ansichtNr || P!==FOST.host || FOST.d || !P.contains(fostQ('#fostProjekte')))return;
    const aktiv=liste.filter(p=>!p.archiviert),archiv=liste.filter(p=>p.archiviert);
    const karte=p=>'<button type="button" class="fost-projekt" data-fost-id="'+fostE(p.id)+'"><b>'+fostE(p.titel)+'</b><span>'+p.anzahl_fotos+' Fotos · '+p.anzahl_feed+' Feed · '+p.anzahl_story+' Story</span><small>'+(p.archiviert?'Archiv':p.frei?'Geprüft':'Entwurf')+'</small></button>';
    fostQ('#fostProjekte').innerHTML=(aktiv.length?aktiv.map(karte).join(''):'<p>Noch keine Fotoserie. Lege eine Serie an und wähle eure Fotos aus.</p>')+(archiv.length?'<details><summary>Archiv ('+archiv.length+')</summary>'+archiv.map(karte).join('')+'</details>':'');
    fostQ('#fostProjekte').querySelectorAll('[data-fost-id]').forEach(b=>b.onclick=()=>fostOeffnen(b.dataset.fostId));fostMeldung('');
  }catch(e){if(fostGueltig(k) && ansicht===FOST.ansichtNr && P===FOST.host && e.name!=='VstVeraltet')fostMeldung('Die Fotoserien konnten nicht geladen werden. '+fostFehler(e));}
}
async function fostNeu(k=fostKontext()){
  const {core}=await fostWarten(fostModule(),k);FOST.epoche++;fostEigenerStand(k);FOST.entfernt=null;FOST.d=core.neu();FOST.d.titel='Neue Fotoserie';FOST.id=null;FOST.version=0;FOST.frei=null;FOST.konflikt=null;FOST.phase='fotos';FOST.index=0;FOST.dirty=true;FOST.revision++;
  const ok=await fostWarten(fostSpeichern(),k);if(!ok){FOST.d=null;return;}fostEditor();fostQ('#fostTitel')?.focus();
}
async function fostOeffnen(id,entwurf){await fostArbeit(async k=>{
  if(FOST.dirty && !await fostWarten(fostSpeichern(),k))return;
  const r=await fostWarten(fostRpc('fotoserie_laden',{p_id:id}),k);
  if(r.archiviert){fostMeldung('Diese Serie liegt im Archiv.');const box=fostQ('#fostProjekte');if(box){const b=document.createElement('button');b.type='button';b.className='fost-btn';b.textContent='Serie aus dem Archiv holen';b.onclick=()=>fostArbeit(async neuK=>{const n=await fostWarten(fostRpc('fotoserie_archivieren',{p_id:id,p_version:r.version,p_an:false}),neuK);if(n.konflikt)throw Error('Der Archifostand wurde inzwischen geändert. Bitte die Liste neu laden.');fostRessourcenFrei();fostUebernehmen(n);fostEigenerStand(neuK);fostEditor();});box.prepend(b);}return;}
  fostRessourcenFrei();fostUebernehmen(r);fostEigenerStand(k);FOST.phase='fotos';FOST.index=0;
  if(entwurf){const {core}=await fostWarten(fostModule(),k);FOST.d=core.normalisieren(entwurf.daten);FOST.dirty=true;FOST.revision++;if(entwurf.version!==r.version)FOST.konflikt=r;}
  fostEditor();if(entwurf){fostEntwurfMerken();if(FOST.konflikt)fostKonfliktZeigen();else fostMeldung('Ungespeicherte Änderungen wiederhergestellt. Bitte speichern.');}
});}
async function fostArbeit(tun){
  if(FOST.busy || !FOST.uid || FOST.uid!==fostKonto())return;const k=fostKontext();k.operation=++FOST.operationNr;FOST.busy=true;fostBusy();
  try{return await tun(k);}catch(e){if(fostGueltig(k) && e.name!=='VstVeraltet'){fostMeldung(fostFehler(e));fostFehlerSichtbar();}}
  finally{if(k.uid===FOST.uid && k.uid===fostKonto() && k.operation===FOST.operationNr){FOST.busy=false;fostBusy();}}
}
function fostBusy(){if(!FOST.host)return;FOST.host.querySelectorAll('.fost input,.fost textarea,.fost select,.fost button').forEach(e=>{if(FOST.busy){e.dataset.fostWarDisabled=e.disabled?'1':'0';e.disabled=true;}else if(e.dataset.fostWarDisabled!==undefined){e.disabled=e.dataset.fostWarDisabled==='1';delete e.dataset.fostWarDisabled;}});FOST.host.querySelector('.fost')?.setAttribute('aria-busy',FOST.busy?'true':'false');}
function fostFeld(label,id,wert,max=240){return '<label class="fost-feld" for="'+id+'"><span>'+label+'</span><input id="'+id+'" value="'+fostE(wert)+'" maxlength="'+max+'"></label>';}
function fostEditor(){
  const d=FOST.d,P=FOST.host;if(!P||!d)return;
  P.innerHTML='<div class="fost">'+fostKopf(d.titel)+'<div class="fost-toolbar"><nav aria-label="Fotoserie bearbeiten">'+[['fotos','1. Fotos'],['serie','2. Serie'],['download','3. Download']].map(([k,t])=>'<button type="button" class="fost-tab '+(FOST.phase===k?'on':'')+'" data-fost-phase="'+k+'" aria-current="'+(FOST.phase===k?'step':'false')+'">'+t+'</button>').join('')+'</nav><button type="button" class="fost-btn fost-secondary" id="fostSpeichern">Speichern</button></div><p class="fost-status" data-fost-status role="status" aria-live="polite">'+fostE(FOST.meldung||'Gespeichert')+'</p><div class="fost-warn" id="fostKonflikt" role="alert" hidden></div><div id="fostInhalt"></div></div>';
  fostZurueckBinden();fostQ('#fostSpeichern').onclick=()=>fostSpeichern();
  P.querySelectorAll('[data-fost-phase]').forEach(b=>b.onclick=()=>{FOST.phase=b.dataset.fostPhase;fostEditor();fostQ('#fostInhalt h3')?.focus();});
  if(FOST.phase==='fotos')fostFotos();else if(FOST.phase==='serie')fostSerie();else fostDownload();
  if(FOST.konflikt)fostKonfliktZeigen();if(FOST.busy)fostBusy();
}
function fostFotos(){
  const d=FOST.d,f=d.fakten,h=fostQ('#fostInhalt');
  h.innerHTML='<div class="fost-fakten"><h3 tabindex="-1">Was war los?</h3><div class="fost-grid">'+fostFeld('Name der Fotoserie','fostTitel',d.titel,160)+fostFeld('Veranstaltung','fostAnlass',f.anlass)+fostFeld('Datum','fostDatum',f.datum,80)+fostFeld('Ort','fostOrt',f.ort)+'</div>'+fostFeld('Unsere Aufgabe, zum Beispiel Bewirtung','fostRolle',f.rolle)+'<label class="fost-feld"><span>Was soll der Beitrag erzählen?</span><textarea id="fostFakten" rows="3" maxlength="6000" placeholder="Nur Angaben, die ihr sicher wisst.">'+fostE(f.text)+'</textarea></label></div><section class="fost-fotobereich"><div class="fost-row"><div><h3>Fotos auswählen <span id="fostFotoAnzahl">'+d.fotos.length+'/40</span></h3><p>JPEG, PNG oder WebP. HEIC, wenn dein Browser es lesen kann. Je Eingabefoto höchstens 25 MiB.</p></div><label class="fost-btn fost-upload">Fotos hochladen<input type="file" id="fostDateien" accept="image/jpeg,image/png,image/webp,image/heic,image/heif,image/avif,.heic,.heif" multiple></label></div><p class="fost-meta">Die Kameradateien auf deinem Gerät bleiben unverändert. Im privaten Studio speichern wir neu berechnete Bilder mit bis zu 3200 Pixeln an der langen Seite, ohne Kamerametadaten.</p><div id="fostGalerie" class="fost-galerie"></div></section><div class="fost-vorschlag"><h3>Eine Serie zusammenstellen</h3><p>Ein gemeinsames Raster verbindet die Folien. Du kannst danach jedes Foto, jeden Ausschnitt und jeden Text ändern.</p><div class="fost-row"><label class="fost-feld"><span>Feed, bis zu</span><input id="fostFeedAnzahl" type="number" min="1" max="20" value="'+(d.feed.length||8)+'"></label><label class="fost-feld"><span>Story, bis zu</span><input id="fostStoryAnzahl" type="number" min="1" max="20" value="'+(d.story.length||3)+'"></label><button type="button" class="fost-btn" id="fostVorschlag">Serie zusammenstellen</button><button type="button" class="fost-btn fost-secondary" id="fostKi">Mit KI kuratieren</button></div><p class="fost-meta">Die KI erhält kleine Bildkopien und deine Veranstaltungsangaben für einen Vorschlag zu Auswahl, Reihenfolge und Texten. Sie veröffentlicht nichts. Ohne KI kannst du die Serie vollständig selbst bearbeiten.</p><div id="fostNeuHinweis" class="fost-warn" hidden></div></div>';
  for(const [id,key] of [['fostAnlass','anlass'],['fostDatum','datum'],['fostOrt','ort'],['fostRolle','rolle']])fostQ('#'+id).oninput=e=>{f[key]=e.target.value;fostAendern(false);};
  fostQ('#fostTitel').oninput=e=>{d.titel=e.target.value;fostAendern(false);};fostQ('#fostFakten').oninput=e=>{f.text=e.target.value;fostAendern(false);};
  fostQ('#fostDateien').onchange=e=>{const files=[...e.target.files];e.target.value='';fostHochladen(files);};
  fostQ('#fostVorschlag').onclick=()=>fostVorschlagFragen(false);fostQ('#fostKi').onclick=()=>fostVorschlagFragen(true);fostGalerie();
}
function fostGalerie(){const h=fostQ('#fostGalerie');if(!h)return;const d=FOST.d;
  h.innerHTML=d.fotos.map((p,i)=>'<article class="fost-foto '+(p.ausgeschlossen?'aus':'')+'"><div class="fost-thumb" data-fost-thumb="'+fostE(p.id)+'"></div><b>'+String(i+1).padStart(2,'0')+' '+fostE(p.name)+'</b><label><input type="checkbox" data-fost-nehmen="'+fostE(p.id)+'" '+(!p.ausgeschlossen?'checked':'')+'> Im Vorschlag verwenden</label><label class="fost-feld"><span>Bildinhalt</span><select data-fost-rolle="'+fostE(p.id)+'">'+[['','Automatisch / offen'],['auftakt','Überblick'],['aktion','Aktion'],['detail','Detail'],['gruppe','Gruppe / Team'],['helfer','Helfer'],['abschluss','Abschluss']].map(([v,t])=>'<option value="'+v+'"'+(p.rolle===v?' selected':'')+'>'+t+'</option>').join('')+'</select></label>'+(p.analyse?.grund?'<small>'+fostE(p.analyse.grund)+'</small>':'')+'</article>').join('')||'<div class="fost-leer">Wähle eure Fotos aus. Danach kannst du die Serie zusammenstellen.</div>';
  h.querySelectorAll('[data-fost-nehmen]').forEach(e=>e.onchange=()=>{d.fotos.find(p=>p.id===e.dataset.fostNehmen).ausgeschlossen=!e.checked;fostAendern(false);});
  h.querySelectorAll('[data-fost-rolle]').forEach(e=>e.onchange=()=>{d.fotos.find(p=>p.id===e.dataset.fostRolle).rolle=e.value;fostAendern(false);});
  fostMiniaturen(h);
}
async function fostBlob(p){
  const k=fostKontext();fostPruefKontext(k);
  if(!FOST.d?.fotos.some(f=>f.id===p.id && f.pfad===p.pfad)){const e=Error('Die frühere Fotoauswahl wurde beendet.');e.name='VstVeraltet';throw e;}
  if(FOST.blobs.has(p.id)){const b=FOST.blobs.get(p.id);FOST.blobs.delete(p.id);FOST.blobs.set(p.id,b);return b;}
  if(FOST.ladeBlobs.has(p.id))return fostWarten(FOST.ladeBlobs.get(p.id),k);
  const lauf=(async()=>{const r=await fostWarten(SVB.sb.storage.from('studio-fotoserien').download(p.pfad),k);if(r.error || !r.data)throw Error('„'+p.name+'“ konnte nicht geladen werden. Bitte erneut versuchen.');
    FOST.blobs.set(p.id,r.data);while(FOST.blobs.size>4)FOST.blobs.delete(FOST.blobs.keys().next().value);return r.data;})();
  FOST.ladeBlobs.set(p.id,lauf);try{return await lauf;}finally{if(FOST.ladeBlobs.get(p.id)===lauf)FOST.ladeBlobs.delete(p.id);}
}
async function fostThumb(p){
  const k=fostKontext();fostPruefKontext(k);if(FOST.thumbs.has(p.id))return FOST.thumbs.get(p.id);if(FOST.ladeThumbs.has(p.id))return fostWarten(FOST.ladeThumbs.get(p.id),k);
  const lauf=(async()=>{const {bilder}=await fostWarten(fostModule(),k),blob=await fostWarten(fostBlob(p),k),mini=await fostWarten(bilder.miniatur(blob),k);
    const url=URL.createObjectURL(mini.blob);FOST.thumbs.set(p.id,url);return url;})();
  FOST.ladeThumbs.set(p.id,lauf);try{return await lauf;}finally{if(FOST.ladeThumbs.get(p.id)===lauf)FOST.ladeThumbs.delete(p.id);}
}
async function fostMiniaturen(h){
  if(!h)return;const k=fostKontext(),id=FOST.id;
  for(const el of h.querySelectorAll('[data-fost-thumb]')){
    if(!fostGueltig(k) || !h.isConnected || id!==FOST.id)return;
    try{const p=FOST.d.fotos.find(p=>p.id===el.dataset.fostThumb);if(!p)continue;const url=await fostWarten(fostThumb(p),k);if(!h.isConnected || id!==FOST.id)return;
      const im=document.createElement('img');im.src=url;im.alt=p.name;im.loading='lazy';el.replaceChildren(im);
    }catch(e){if(!fostGueltig(k) || !h.isConnected || e.name==='VstVeraltet')return;el.textContent='Vorschau nicht geladen';}
  }
}
async function fostBild(id){
  const k=fostKontext();fostPruefKontext(k);const p=FOST.d?.fotos.find(p=>p.id===id);if(!p)throw Error('Ein Foto fehlt. Bitte die Bildauswahl prüfen.');
  if(FOST.bilder.has(id)){const b=FOST.bilder.get(id);FOST.bilder.delete(id);FOST.bilder.set(id,b);return b;}
  if(FOST.ladeBilder.has(id))return fostWarten(FOST.ladeBilder.get(id),k);
  const lauf=(async()=>{
    const blob=await fostWarten(fostBlob(p),k);let bild;
    try{
      if(typeof createImageBitmap==='function'){try{bild=await createImageBitmap(blob);fostPruefKontext(k);}catch(e){if(e.name==='VstVeraltet')throw e;}}
      if(!bild){fostPruefKontext(k);const u=URL.createObjectURL(blob);try{bild=await new Promise((ok,nein)=>{const im=new Image();im.onload=()=>ok(im);im.onerror=()=>nein(Error('Das Foto lässt sich nicht anzeigen.'));im.src=u;});}finally{URL.revokeObjectURL(u);}fostPruefKontext(k);}
      FOST.bilder.set(id,bild);while(FOST.bilder.size>3){const key=FOST.bilder.keys().next().value;FOST.bilder.get(key).close?.();FOST.bilder.delete(key);}return bild;
    }catch(e){bild?.close?.();throw e;}
  })();
  FOST.ladeBilder.set(id,lauf);try{return await lauf;}finally{if(FOST.ladeBilder.get(id)===lauf)FOST.ladeBilder.delete(id);}
}
async function fostHochladen(files){await fostArbeit(async k=>{
  const {bilder}=await fostWarten(fostModule(),k),fehler=[];
  if(!files.length)return;if(FOST.d.fotos.length+files.length>40)throw Error('Es passen noch '+(40-FOST.d.fotos.length)+' Fotos in diese Serie. Bitte entsprechend weniger auswählen.');
  if(!await fostWarten(fostSpeichern(),k))return;const serieId=FOST.id;
  for(let i=0;i<files.length;i++){
    fostPruefKontext(k);fostMeldung('Foto '+(i+1)+'/'+files.length+' wird vorbereitet …');
