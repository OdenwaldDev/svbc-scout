async function rnVorschau(){ RN.v=await ogRpc('rundnachricht_vorschau',{p_rollen:RN.rollen}); return RN.v; }
async function rnOeffnen(){
  if(!rnDarf())return;
  svModal('<div class="og-form rn"><h2>📣 Rundnachricht</h2><div class="empty">Lade …</div></div>');
  RN.rollen=[]; try{ await rnVorschau(); }catch(e){ const x=document.querySelector('#modal .empty'); if(x)x.textContent='⚠️ '+e.message; return; }
  rnZeigen();
}
function rnZeigen(titel,text){
  const M=document.getElementById('modal'); if(!M||!RN.v)return; const V=RN.v, R=V.rollen||{};
  const alle=Object.values(R).reduce((a,b)=>a+b,0);
  M.innerHTML=`<button class="close" id="svClose" aria-label="Schließen">✕</button><div class="og-form rn"><h2>📣 Rundnachricht</h2>
    <p class="note">Geht als Meldung in die App. Wer Mitteilungen eingeschaltet hat, bekommt sie sofort aufs Handy.</p>
    <label class="og-fl">An</label><div class="chips4 rn-an"><button type="button" class="${RN.rollen.length?'':'on'}" data-rnr="">Alle ${alle}</button>
      ${E5_ROLLEN.filter(([k])=>R[k]).map(([k,l])=>`<button type="button" class="${RN.rollen.includes(k)?'on':''}" data-rnr="${k}">${l} ${R[k]}</button>`).join('')}</div>
    <label class="og-fl">Titel<input id="rnT" maxlength="120" placeholder="z.B. Arbeitseinsatz am Samstag" value="${ogE(titel||'')}"></label>
    <label class="og-fl">Nachricht<textarea id="rnX" maxlength="1000" rows="5" placeholder="Was alle wissen sollten">${ogE(text||'')}</textarea></label>
    <div class="rn-info" id="rnInfo">Erreicht <b>${V.an}</b> ${V.an===1?'Person':'Personen'}, davon ${V.push} sofort per Mitteilung aufs Handy. Die anderen sehen sie beim nächsten Öffnen der App.</div>
    <div class="btnrow sbact"><button type="button" class="btn" id="rnGo">${SVI('send')} Senden</button><button type="button" class="btn ghost" onclick="closeOverlay()">Abbrechen</button></div>
    ${(V.verlauf||[]).length?`<details class="rn-v"><summary>Zuletzt verschickt (${V.verlauf.length})</summary>${V.verlauf.map(x=>`<div class="rn-vr"><b>${ogE(x.titel)}</b><small>${ogE(new Date(x.am).toLocaleString('de-DE',{day:'2-digit',month:'2-digit',hour:'2-digit',minute:'2-digit'}))} · ${ogE(x.von||'')} · an ${x.an}${(x.rollen||[]).length?' ('+ogE(x.rollen.map(r=>(E5_ROLLEN.find(y=>y[0]===r)||[r,r])[1]).join(', '))+')':''}</small><p>${ogE(x.text)}</p></div>`).join('')}</details>`:''}</div>`;
  document.getElementById('svClose').onclick=()=>closeOverlay();
  const T=M.querySelector('#rnT'), X=M.querySelector('#rnX');
  M.querySelectorAll('[data-rnr]').forEach(b=>b.onclick=async()=>{ const k=b.dataset.rnr; RN.rollen=!k?[]:RN.rollen.includes(k)?RN.rollen.filter(x=>x!==k):RN.rollen.concat([k]);
    try{ await rnVorschau(); }catch(e){ kToast('⚠️ '+e.message); } rnZeigen(T.value,X.value); });
  const go=M.querySelector('#rnGo'); go.onclick=async()=>{
    if(T.value.trim().length<2||X.value.trim().length<2){ kToast('Bitte Titel und Nachricht eingeben'); return; }
    if(!go.dataset.sicher){ go.dataset.sicher='1'; go.innerHTML=`${SVI('send')} Wirklich an ${RN.v.an} senden?`; go.classList.add('warn'); setTimeout(()=>{ if(go.isConnected){ delete go.dataset.sicher; go.innerHTML=SVI('send')+' Senden'; go.classList.remove('warn'); } },4000); return; }
    go.disabled=true;
    try{ const r=await ogRpc('rundnachricht_senden',{p_titel:T.value,p_text:X.value,p_rollen:RN.rollen}); kToast(`✓ An ${r.an} verschickt, ${r.push} per Mitteilung`); try{ svHaptic('success'); }catch(e){} await rnVorschau(); rnZeigen(); }
    catch(e){ go.disabled=false; kToast('⚠️ '+e.message); } };
}

(function(){ try{ const s=document.createElement('style'); s.id='svm54css'; s.textContent="/* Sportzentrale Beta 0.56 · Helfer-Einsatzplan und Rundnachricht */\n.e5-box{display:flex;align-items:center;gap:12px;flex-wrap:wrap;margin:12px 0 4px;padding:12px 14px;border-radius:16px;border:1px dashed rgba(140,175,255,.35);background:rgba(47,107,255,.06);}\n.e5-box.an{border-style:solid;border-color:rgba(34,197,94,.45);background:rgba(34,197,94,.08);}\n.e5-sw{display:flex;align-items:flex-start;gap:10px;flex:1 1 240px;min-width:0;cursor:pointer;}\n.e5-sw input{margin-top:3px;width:18px;height:18px;flex:none;accent-color:#22c55e;}\n.e5-sw b{display:block;font-size:14.5px;}\n.e5-sw small{display:block;color:var(--ink3);font-size:12.5px;margin-top:2px;line-height:1.4;}\n.og-shn.e5-pool{box-shadow:inset 0 0 0 1px rgba(247,113,28,.55);}\n.og-shn.e5-pool::before{content:\"🙌\";margin-right:4px;font-size:12px;}\n.e5-kopf{display:flex;flex-direction:column;gap:3px;margin:2px 0 10px;}\n.e5-kopf b{font-size:16px;}\n.e5-kopf small{color:var(--ink3);font-size:12.5px;}\n.e5-bar{height:8px;border-radius:99px;background:rgba(148,163,196,.18);overflow:hidden;margin-top:6px;}\n.e5-bar i{display:block;height:100%;background:linear-gradient(90deg,#2f6bff,#22c55e);border-radius:99px;transition:width .5s;}\n.e5-warn{padding:10px 12px;border-radius:12px;background:rgba(247,113,28,.12);border:1px solid rgba(247,113,28,.35);font-size:13.5px;margin-bottom:10px;display:flex;gap:10px;align-items:center;flex-wrap:wrap;}\n.e5-f{margin:8px 0 10px;}\n.e5-l{display:flex;flex-direction:column;gap:8px;}\n.e5-r{display:flex;align-items:center;gap:10px;padding:10px 12px;border-radius:14px;border:1px solid var(--line2);background:rgba(148,163,196,.05);flex-wrap:wrap;}\n.e5-r.drin{border-color:rgba(34,197,94,.4);}\n.e5-w{flex:1 1 200px;min-width:0;}\n.e5-w b{font-size:14.5px;}\n.e5-w small{display:block;color:var(--ink3);font-size:12.5px;margin-top:2px;}\n.e5-w .e5-ok{color:var(--green,#22c55e);font-weight:600;}\n.e5-w .e5-ang{color:var(--gold,#f0a71f);}\n.e5-passt{display:inline-block;margin-left:6px;padding:1px 7px;border-radius:99px;background:rgba(47,107,255,.16);color:#9cc3ff;font-style:normal;font-size:11px;font-weight:700;vertical-align:2px;}\n.e5-k{display:flex;gap:6px;flex:none;}\n.e5-k a.btn{text-decoration:none;}\n.e5-hpl{border:1px solid var(--line2);background:none;color:var(--ink2);border-radius:999px;padding:4px 10px;font:600 12.5px var(--font);cursor:pointer;}\n.rn-an{margin:4px 0 10px;}\n.rn textarea{width:100%;min-height:110px;resize:vertical;}\n.rn-info{font-size:13.5px;color:var(--ink2);padding:10px 12px;border-radius:12px;background:rgba(47,107,255,.08);margin:8px 0;}\n.rn-v{margin-top:12px;}\n.rn-v summary{cursor:pointer;font-weight:700;font-size:13.5px;color:var(--ink2);}\n.rn-vr{padding:10px 0;border-top:1px solid var(--line2);}\n.rn-vr small{display:block;color:var(--ink3);font-size:12px;margin:2px 0 4px;}\n.rn-vr p{font-size:13.5px;white-space:pre-wrap;}\n#rnGo.warn{background:linear-gradient(180deg,#f7711c,#d9661a)!important;}\nhtml[data-theme=\"hell\"] body .e5-passt{color:#2552d0;}\n"; document.head.appendChild(s); }catch(e){} })();
/* =====================================================================
   Sportzentrale Beta 0.57 · Präsentationen für mögliche Partner (bis 0.71 „Pitch-Decks“)
   - Partner → „Präsentationen“: je Firma ein persönliches Scroll-Deck (Logo, Firmendaten, warum es passt, Empfehlung)
   - Link kopieren oder per WhatsApp schicken, sehen ob die Firma reingeschaut hat, Anfragen und unterschriebene Anträge
   - Live: wie viele Plätze je Paket belegt sind (nur neue Abschlüsse: Anträge plus aktive Verträge)
   - Logo hochladen: wird verkleinert, Ränder abgeschnitten, als PNG gespeichert
   ===================================================================== */
const PD={d:null,laedt:null,q:'',flt:'alle'};
// 0.99.86 (Albert, 18.11.2026): Links an Firmen laufen über Kaderwerk, kurz und nicht zu erraten: https://partner.kaderwerk.pro/#firma-k7m2xq9d.
// Der kurze Schlüssel kommt vom Server (partner_decks.kurz, 203). Fehlt er einmal, gilt der lange Link auf derselben Adresse.
const PD_HOST='https://partner.kaderwerk.pro/';
const PD_ST={supporter:'SVM Supporter',club:'Club Partner',premium:'Premium Partner',p1896:'1896 Partner'};
const PD_AST={neu:'neu',versendet:'per Mail raus',fehler:'Mail fehlgeschlagen',uebernommen:'übernommen',storniert:'storniert'};
function pdLink(code,kurz){ const d=!kurz&&typeof PD!=='undefined'&&PD.d?(PD.d.decks||[]).find(x=>x.code===code):null, k=kurz||(d&&d.kurz)||''; return k?PD_HOST+'#'+k:PD_HOST+'partner.html#d='+code; }
function pdDatum(ts){ try{ return new Date(ts).toLocaleString('de-DE',{day:'2-digit',month:'2-digit',hour:'2-digit',minute:'2-digit'}); }catch(e){ return ''; } }
async function pdLaden(){ if(PD.laedt)return PD.laedt; PD.laedt=svtRpc('partner_decks_liste',{}).then(d=>{ PD.d=d; return d; }).finally(()=>{ PD.laedt=null; }); return PD.laedt; }

/* Reiter „Präsentationen“ im Partner-Bereich (steht seit 0.72 fest in SPO_REITER, svm26) */
{ const _sb55=spoBody; spoBody=function(){ if(SPO.view==='decks'){ const B=document.getElementById('spoB'); if(B)pdListe(B); return; } return _sb55.apply(this,arguments); }; }

function pdStation(d){ const f=String(d.firma||'').trim().toLowerCase(), S=(typeof SPO!=='undefined'&&SPO.S)||[]; return (d.sponsor&&S.find(x=>x.id===d.sponsor))||S.find(x=>String(x.firma||'').trim().toLowerCase()===f)||null; }
async function pdListe(B){
  if(!PD.d)B.innerHTML='<div class="card"><div class="empty">Lade Präsentationen …</div></div>';
  try{ await pdLaden(); }catch(e){ B.innerHTML=`<div class="card"><div class="empty">${svEsc(e.message)}</div></div>`; return; }
  if(SPO.view!=='decks')return;
  const D=PD.d.decks||[], A=(PD.d.anfragen||[]).filter(a=>a.status!=='storniert'), K=PD.d.kontingente||{};
  B.innerHTML=`<div class="card pd-kopf"><div><h3 class="trh">${SVI('cards')} Präsentationen</h3><p class="note">Für jede Firma eine persönliche Präsentation zum Durchscrollen: Verein, Pakete mit freien Plätzen, Angebot und Vertrag mit Unterschrift. Mit „Termin vorbereiten“ anlegen, Link schicken oder im Termin auf dem Handy zeigen.</p></div>
      <button type="button" class="btn" id="pdNeu">${SVI('cal')} Termin vorbereiten</button></div>
    <div class="pd-k">${Object.keys(PD_ST).map(k=>{ const x=K[k]||{max:0,belegt:0}, f=Math.max(0,x.max-x.belegt); return `<div class="pd-kk${f<=3?' eng':''}"><b>${f}<small> / ${x.max}</small></b><span>${PD_ST[k]} frei</span><i style="width:${x.max?Math.round(x.belegt/x.max*100):0}%"></i></div>`; }).join('')}</div>
    ${A.length?`<div class="card"><h3 class="trh">${SVI('mail')} Anfragen aus älteren Links</h3>${A.slice(0,20).map(a=>`<div class="pd-a${a.art==='antrag'?' antrag':''}"><div><b>${a.art==='antrag'?SVI('check')+' Antrag':SVI('mail')+' Angebot'} · ${svEsc(a.firma)}</b>
        <small>${svEsc(PD_ST[a.stufe]||a.stufe)}, ${a.saisons} Saison${a.saisons>1?'s':''}, ${spoEur((a.preis||{}).netto_saison,true)} netto je Saison${(a.bausteine||[]).length?' · Bausteine: '+svEsc(a.bausteine.map(b=>b.n+'× '+({sotd:'Partner des Tages',business:'Business Treff',trikot:'Trikotsatz'}[b.k]||b.k)).join(', ')):''}${a.recruiting?' · Recruiting':''}</small>
        <small>${svEsc(a.ansprech||'')} ${svEsc(a.email)} · ${svEsc(pdDatum(a.am))} · <i class="pd-as s-${a.status}">${svEsc(PD_AST[a.status]||a.status)}</i>${a.mail&&a.mail.fehler?' '+svEsc(a.mail.fehler):''}</small></div>
      <div class="pd-ak"><button type="button" class="btn ghost sm" data-pdpdf="${svEsc(a.id)}">PDF</button><button type="button" class="btn ghost sm" data-pdmail="${svEsc(a.id)}" title="Mail erneut an die Firma" aria-label="Mail erneut an die Firma">${SVI('send')}</button>
        ${a.art==='antrag'&&a.status!=='uebernommen'?`<button type="button" class="btn sm" data-pdok="${svEsc(a.id)}">Übernommen</button>`:''}</div></div>`).join('')}</div>`:''}
    <div class="pd-such"><label class="pz-such">${SVI('search')}<input type="search" id="pdQ" placeholder="Firma suchen" value="${svEsc(PD.q||'')}" autocomplete="off" aria-label="Präsentationen durchsuchen"></label>
      <div class="spo-f2" role="group" aria-label="Auswahl">${[['weg','Unterwegs'],['partner','Partner'],['alle','Alle']].map(([k,l])=>`<button type="button" class="${(PD.flt||'alle')===k?'on':''}" data-pdf="${k}" aria-pressed="${(PD.flt||'alle')===k}">${l}</button>`).join('')}</div></div>
    <div class="pd-l"></div>`;
  B.querySelector('#pdNeu').onclick=()=>{ if(typeof ptStart==='function')ptStart(); else pdForm(null); };
  const qi=B.querySelector('#pdQ'); qi.oninput=()=>{ PD.q=qi.value; pdKarten(B,D); };   // nur die Liste neu, das Suchfeld bleibt
  B.querySelectorAll('[data-pdf]').forEach(b=>b.onclick=()=>{ PD.flt=b.dataset.pdf; B.querySelectorAll('[data-pdf]').forEach(x=>{ x.classList.toggle('on',x===b); x.setAttribute('aria-pressed',x===b); }); pdKarten(B,D); });
  pdKarten(B,D);
  B.querySelectorAll('[data-pdok]').forEach(b=>b.onclick=async()=>{ try{ await svtRpc('partner_anfrage_status',{p_id:b.dataset.pdok,p_status:'uebernommen'}); kToast('✓ Als übernommen markiert'); PD.d=null; pdListe(B); }catch(e){ kToast('⚠️ '+e.message); } });
  B.querySelectorAll('[data-pdmail]').forEach(b=>b.onclick=async()=>{ if(!b.dataset.sicher){ b.dataset.sicher='1'; b.textContent='Erneut senden?'; return; } b.disabled=true;
    try{ const {data,error}=await SVB.sb.functions.invoke('partner-deck',{body:{id:b.dataset.pdmail}}); if(error)throw error; kToast(data&&data.ok?'✓ Mail ist raus':'⚠️ '+((data&&data.fehler)||'Mail-Versand ist nicht eingerichtet')); PD.d=null; pdListe(B); }catch(e){ b.disabled=false; kToast('⚠️ '+(e.message||e)); } });
  B.querySelectorAll('[data-pdpdf]').forEach(b=>b.onclick=async()=>{ b.disabled=true;
    try{ const {data,error}=await SVB.sb.functions.invoke('partner-deck',{body:{id:b.dataset.pdpdf,nurPdf:true}}); if(error)throw error; if(!data||!data.pdf)throw new Error('Kein PDF');
      const bin=atob(data.pdf), u8=new Uint8Array(bin.length); for(let i=0;i<bin.length;i++)u8[i]=bin.charCodeAt(i); const url=URL.createObjectURL(new Blob([u8],{type:'application/pdf'}));
      const a=document.createElement('a'); a.href=url; a.download=data.name||'Partner.pdf'; document.body.appendChild(a); a.click(); a.remove(); setTimeout(()=>URL.revokeObjectURL(url),5000); }catch(e){ kToast('⚠️ '+(e.message||e)); } finally{ b.disabled=false; } });
}
// Karten der Präsentationen: oben rechts immer der Stand der Firma, die empfohlene Stufe als zweite Zeile.
// Bei Partnern ist der Hauptknopf die Akte (Vertrag, Rechnung), sonst „Per WhatsApp schicken“.
function pdKarten(B,D){ const H=B.querySelector('.pd-l'); if(!H)return; const q=String(PD.q||'').trim().toLowerCase(), flt=PD.flt||'alle';
  const L=D.filter(d=>{ const x=pdStation(d), st=x&&x.status; return (flt==='alle'||(flt==='partner'?st==='partner':st!=='partner'))&&(!q||(d.firma+' '+(d.ansprech||'')+' '+(d.branche||'')).toLowerCase().includes(q)); });
  H.innerHTML=L.map(d=>{ const x=pdStation(d), partner=x&&x.status==='partner', wa=`https://wa.me/?text=${encodeURIComponent(pdText(d))}`;
    return `<div class="card pd-d${d.aktiv?'':' aus'}"><div class="pd-dk"><div><b>${svEsc(d.firma)}</b><small>${[d.ansprech&&((d.anrede?d.anrede+' ':'')+d.ansprech),d.branche].filter(Boolean).map(svEsc).join(' · ')}</small>
        ${d.empfehlung?`<small class="pd-empf">Empfohlen: ${svEsc(PD_ST[d.empfehlung]||d.empfehlung)}</small>`:''}${d.passung&&d.passung.widmung?`<small class="pd-empf pd-wid">Widmung: ${svEsc(d.passung.widmung)}</small>`:''}
        <small class="pd-schau">${d.aufrufe?`${SVI('eye')} ${d.aufrufe} Linkaufrufe, auch vor Ort, zuletzt ${svEsc(pdDatum(d.zuletzt))}`:'Noch keine Linkaufrufe'}${d.anfragen?` · ${d.anfragen} Anfrage${d.anfragen>1?'n':''}`:''}${d.antrag?' · <b class="pd-ok">Antrag unterschrieben</b>':''}${d.aktiv?'':' · abgeschaltet'}</small></div>
      <div class="pd-tags">${x?`<i class="spo-st s-${svEsc(x.status)}">${svEsc(SPO_STL[x.status]||x.status)}</i>`:'<i class="spo-st pd-ohne">Nicht unter Firmen</i>'}</div></div>
      <div class="pd-akt">${x?'':`<button type="button" class="btn ghost sm" data-pdakteneu="${svEsc(d.id)}">${SVI('plus')} Zu Firmen hinzufügen</button>`}
        <a class="btn ghost" href="${svEsc(svBasis()+'partner.html?reise=1&intern=1#d='+d.code)}" target="_blank" rel="noopener" title="Mit deiner Anmeldung: Sonderpreis, Sonstiges, Unterschrift für den Verein">${SVI('eye')} Präsentation starten</a>
        <button type="button" class="btn ghost" data-pdnutzung="${svEsc(d.code)}">Spätere Nutzung</button>
        ${partner?`<button type="button" class="btn ghost" data-pdakte="${svEsc(x.id)}">${SVI('file')} Akte öffnen</button>`:x?`<button type="button" class="btn ghost" data-pdsend="${svEsc(d.id)}">${SVI('send')} Schicken</button>`:''}
        <details class="pd-mehr"><summary aria-label="Mehr zu ${svEsc(d.firma)}">…</summary><div>
          <button type="button" class="btn ghost sm" data-pdcp="${svEsc(d.code)}">${SVI('copy')} Link kopieren</button>
          <button type="button" class="btn ghost sm" data-pddeckpdf="${svEsc(d.id)}">${SVI('download')} Als PDF laden</button>
          ${x?'':`<a class="btn ghost sm pd-wa" href="${wa}" target="_blank" rel="noopener">${SVI('chat')} Per WhatsApp schicken</a>`}
          <a class="btn ghost sm" href="${svEsc(pdLink(d.code))}" target="_blank" rel="noopener">So sieht es die Firma</a>
          <button type="button" class="btn ghost sm" data-pded="${svEsc(d.id)}">${SVI('cards')} Bearbeiten</button></div></details></div></div>`; }).join('')||'<div class="card"><div class="empty">Keine Präsentation in dieser Auswahl. Neue entstehen über „Termin vorbereiten“.</div></div>';
  // Schicken läuft wie überall über das Nachrichtenblatt: Link drin, „Gesendet, in 7 Tagen erinnern“ landet im Verlauf
  H.querySelectorAll('[data-pdsend]').forEach(b=>b.onclick=()=>{ const d=D.find(y=>y.id===b.dataset.pdsend), x=d&&pdStation(d); if(x&&typeof pzNachricht==='function')pzNachricht(x,'praesentation'); });
  H.querySelectorAll('[data-pdakteneu]').forEach(b=>b.onclick=()=>paEinmal(b,async()=>{ try{ const sid=await svtRpc('partner_deck_akte_anlegen',{p_deck:b.dataset.pdakteneu}); kToast('✓ Steht jetzt unter Firmen.'); PD.d=null; await spoLoad(true); await pdLaden(); pdKarten(B,PD.d.decks||[]); if(sid)spoSponsor(sid); }catch(e){ kToast('⚠️ '+(e.message||e)); } }));
  // Links zur Präsentation erst, wenn das Impressum vollständig ist (Vorstand, Register, Anschrift)
  const impOk=()=>{ const f=typeof paImpressumFehlt==='function'?paImpressumFehlt():[]; if(!f.length)return true;
    kToast('Bevor ihr Links verschickt: Im Impressum fehlen noch '+f.join(', ')+'. Bitte in den Vereinsdaten eintragen.'); if(typeof PE!=='undefined')PE.v='verein'; spoWechsel('steuerung'); return false; };
  H.querySelectorAll('.pd-wa').forEach(a=>a.addEventListener('click',e=>{ if(!impOk())e.preventDefault(); }));
  H.querySelectorAll('[data-pdcp]').forEach(b=>b.onclick=async()=>{ if(!impOk())return; const u=pdLink(b.dataset.pdcp); try{ await navigator.clipboard.writeText(u); kToast('✓ Link kopiert'); }catch(e){ kToast(u); } });
  H.querySelectorAll('[data-pded]').forEach(b=>b.onclick=()=>pdForm(D.find(x=>x.id===b.dataset.pded)));
  H.querySelectorAll('[data-pdnutzung]').forEach(b=>b.onclick=()=>{if(!window.PD_TEILEN_APP){kToast('Die Nutzungsübersicht lässt sich gerade nicht laden. Bitte lade die App neu.');return;}window.PD_TEILEN_APP.oeffnen({code:b.dataset.pdnutzung,rpc:async(fn,p)=>{const {data,error}=await SVB.sb.rpc(fn,p);if(error)throw new Error(typeof svFehlerText==='function'?svFehlerText(error):error.message);return data;}});});
  // Seit 0.99.82: die Präsentation einer Firma als PDF zum Weitergeben (Text zur Firma, Widmung, Pakete und Bausteine mit Preisen, Link). Verschickt wird nichts.
  H.querySelectorAll('[data-pddeckpdf]').forEach(b=>b.onclick=()=>paEinmal(b,async()=>{
    try{ const {data,error}=await SVB.sb.functions.invoke('partner-deck',{body:{deck:b.dataset.pddeckpdf,nurPdf:true}}); if(error)throw error; if(!data||!data.pdf)throw new Error('Kein PDF');
      const bin=atob(data.pdf), u8=new Uint8Array(bin.length); for(let i=0;i<bin.length;i++)u8[i]=bin.charCodeAt(i);
      spoDownload(new Blob([u8],{type:'application/pdf'}),data.name||'Partnerschaft.pdf'); kToast('✓ PDF ist geladen'); }
    catch(e){ kToast('⚠️ PDF geht gerade nicht: '+(e.message||e)); } },'Baut PDF …'));
  H.querySelectorAll('[data-pdakte]').forEach(b=>b.onclick=()=>spoSponsor(b.dataset.pdakte));
}
function pdText(d){ const g=typeof paAnrede==='function'?paAnrede(d.anrede,d.ansprech):'Hallo,';
  return `${g} wie besprochen hier eure Übersicht zur Partnerschaft mit dem SV/BSC Mörlenbach. Pakete, freie Plätze und Vertrag stehen drin:\n${pdLink(d.code)}\n\nViele Grüße\n${(typeof SVU!=='undefined'&&SVU.name)||''}`.trim(); }

/* Logo: Datei → zugeschnitten, höchstens 900 × 360, PNG */
function pdLogo(file){ return new Promise((ok,no)=>{ if(!file)return ok(null); if(!/^image\//.test(file.type))return no(new Error('Bitte ein Bild wählen'));
  const r=new FileReader(); r.onerror=()=>no(new Error('Bild nicht lesbar')); r.onload=()=>{ const img=new Image(); img.onerror=()=>no(new Error('Bild nicht lesbar')); img.onload=()=>{
    const c=document.createElement('canvas'); c.width=img.naturalWidth; c.height=img.naturalHeight; const x=c.getContext('2d'); x.drawImage(img,0,0);
    let d; try{ d=x.getImageData(0,0,c.width,c.height).data; }catch(e){ return ok(r.result); }
    // leeren oder weißen Rand abschneiden
    const leer=(i)=>d[i+3]<12||(d[i]>245&&d[i+1]>245&&d[i+2]>245); let t=0,b=c.height-1,l=0,rr=c.width-1;
    const zeileLeer=y=>{ for(let xx=0;xx<c.width;xx+=2)if(!leer((y*c.width+xx)*4))return false; return true; }, spalteLeer=xx=>{ for(let y=t;y<=b;y+=2)if(!leer((y*c.width+xx)*4))return false; return true; };
    while(t<b&&zeileLeer(t))t++; while(b>t&&zeileLeer(b))b--; while(l<rr&&spalteLeer(l))l++; while(rr>l&&spalteLeer(rr))rr--;
    const w=rr-l+1, h=b-t+1, f=Math.min(1,900/w,360/h), o=document.createElement('canvas'); o.width=Math.max(1,Math.round(w*f)); o.height=Math.max(1,Math.round(h*f));
    const ox=o.getContext('2d'); ox.imageSmoothingQuality='high'; ox.drawImage(c,l,t,w,h,0,0,o.width,o.height); ok(o.toDataURL('image/png')); }; img.src=r.result; }; r.readAsDataURL(file); }); }

function pdForm(d,vor){
  const x=d||Object.assign({firma:'',kurzname:'',anrede:'',ansprech:'',email:'',adresse:'',branche:'',web:'',logo_hell:true,passung:{},empfehlung:'',notiz:'',aktiv:true},vor||{}); const P=x.passung||{};
  let logo=undefined, logoAuftrag=null, logoNr=0, logoFehler='';
  const M=svModal(`<div class="og-form pd-f"><h2>${d?'Präsentation bearbeiten':SVI('cards')+' Neue Präsentation'}</h2>
    <p class="note">Was hier steht, sieht die Firma. Sachlich, konkret, per Du. Keine Werbesprüche.</p>
    <div class="pd-g"><label class="og-fl">Firma (vollständig)<input id="pdFi" maxlength="120" value="${svEsc(x.firma)}" placeholder="Muster GmbH"></label>
      <label class="og-fl">Kurzname im Text<input id="pdKu" maxlength="60" value="${svEsc(x.kurzname||'')}" placeholder="z.B. Schreinerei Muster"></label>
      <label class="og-fl">Anrede<select id="pdAn"><option value="">ohne</option><option${x.anrede==='Frau'?' selected':''}>Frau</option><option${x.anrede==='Herr'?' selected':''}>Herr</option></select></label>
      <label class="og-fl">Ansprechpartner<input id="pdAp" maxlength="80" value="${svEsc(x.ansprech||'')}" placeholder="Vor- und Nachname"></label>
      <label class="og-fl">E-Mail<input id="pdEm" type="email" maxlength="120" value="${svEsc(x.email||'')}"></label>
      <label class="og-fl">Adresse<input id="pdAd" maxlength="160" value="${svEsc(x.adresse||'')}" placeholder="Straße, PLZ Ort"></label>
      <label class="og-fl">Branche<input id="pdBr" maxlength="80" value="${svEsc(x.branche||'')}"></label>
      <label class="og-fl">Website<input id="pdWe" maxlength="200" value="${svEsc(x.web||'')}" placeholder="https://"></label></div>
    <label class="og-fl">Weitere Namen für die Suche<input id="pdSu" maxlength="240" value="${svEsc(P.suchnamen||'')}" placeholder="Marken, Abkürzungen oder frühere Namen"></label>
    <label class="og-fl">Logo<input type="file" id="pdLo" accept="image/png,image/jpeg,image/webp"></label><label class="jutog"><input type="checkbox" id="pdLd"${x.logo_hell===false?' checked':''}> Logo ist weiß oder hell (auf dunklem Grund zeigen)</label><div class="pd-lv" id="pdLv">${d&&d.logo?'Logo ist hinterlegt. Neues Bild ersetzt es.':'Noch kein Logo. Am besten PNG mit transparentem Hintergrund.'}</div>
    <label class="og-fl">Empfehlung<select id="pdEmpf"><option value="">keine</option>${Object.keys(PD_ST).map(k=>`<option value="${k}"${x.empfehlung===k?' selected':''}>${PD_ST[k]}</option>`).join('')}</select></label>
    <h3 class="pd-h">Widmung am Paket</h3>
    <label class="og-fl">Unterüberschrift<input id="pdWi" maxlength="90" value="${svEsc(P.widmung||'')}" placeholder="z.B. Für sportliche Wettkämpfe in der Saisonvorbereitung"></label>
    <label class="og-fl">Absatz dazu<textarea id="pdWt" rows="3" maxlength="600" placeholder="Wofür der Beitrag der Firma gedacht ist, in zwei bis drei Sätzen.">${svEsc(P.widmung_text||'')}</textarea></label>
    <p class="note small">Steht in der Präsentation am empfohlenen Paket und im Vertrag unter dem Paket. Leer lassen, wenn es keine Widmung gibt.</p>
    <h3 class="pd-h">Warum es passt</h3>
    <label class="og-fl">Überschrift<input id="pdTi" maxlength="80" value="${svEsc(P.titel||'')}" placeholder="z.B. Handwerk mit Heimat."></label>
    <label class="og-fl">Einstieg oben (leer = Standardtext über die 260 Kinder)<textarea id="pdHe" rows="2" maxlength="300">${svEsc(P.hero||'')}</textarea></label>
    <label class="jutog"><input type="checkbox" id="pdOJ"${(P.ohne||[]).includes('trikot')?' checked':''}> Ohne Jugend-Trikotpatenschaft (z.B. bei Glücksspiel oder Alkohol)</label>
    <label class="og-fl">Text<textarea id="pdTx" rows="4" maxlength="700">${svEsc(P.text||'')}</textarea></label>
    <label class="og-fl">Punkte (eine Zeile je Punkt)<textarea id="pdPu" rows="4" maxlength="900">${svEsc((P.punkte||[]).join('\n'))}</textarea></label>
    <label class="og-fl">Zahlen (eine Zeile je Zahl: Zahl | Text)<textarea id="pdFa" rows="3" maxlength="400" placeholder="1865 | Gründung des Betriebs">${svEsc((P.fakten||[]).map(f=>f.z+' | '+f.t).join('\n'))}</textarea></label>
    <label class="og-fl">Notiz fürs Team (sieht die Firma nicht)<textarea id="pdNo" rows="2" maxlength="1000">${svEsc(x.notiz||'')}</textarea></label>
    ${d?`<label class="jutog"><input type="checkbox" id="pdAk"${x.aktiv?' checked':''}> Link ist aktiv</label>`:''}
    <div class="btnrow sbact"><button class="btn" type="button" id="pdSave">${SVI('check')} Speichern</button><button class="btn ghost" type="button" onclick="closeOverlay()">Abbrechen</button></div></div>`);
  const werk=typeof PD_LOGOWERK!=='undefined'?PD_LOGOWERK.einrichten(M,x):null;
  const offen=()=>M.isConnected&&(!document.getElementById('overlay')||document.getElementById('overlay').classList.contains('open'));
  M.querySelector('#pdLo').onchange=async e=>{ const f=e.target.files&&e.target.files[0]; if(!f)return;
    const nr=++logoNr, lv=M.querySelector('#pdLv'); logoFehler=''; lv.textContent='Bereite Logo vor …';
    const job=(async()=>{ try{ const neu=await (werk?werk.originalDatei(f):pdLogo(f)); if(nr!==logoNr||!offen())return;
        logo=neu; lv.innerHTML=`<img src="${svEsc(logo)}" alt="Logo-Vorschau"><span>${Math.round(logo.length*0.75/1024)} KB, als PNG vorbereitet</span>`;
      }catch(err){ if(nr!==logoNr||!offen())return; logoFehler=err.message||'Das Logo lässt sich nicht vorbereiten.'; lv.textContent=logoFehler; logo=undefined;
      }finally{ if(nr===logoNr)logoAuftrag=null; } })(); logoAuftrag=job; await job;
  };
  const sv=M.querySelector('#pdSave'); sv.onclick=()=>paEinmal(sv,async()=>{
    try{ while(logoAuftrag){ const laufend=logoAuftrag; await laufend; if(logoAuftrag===laufend)logoAuftrag=null; } if(!offen())return; if(logoFehler)throw new Error(logoFehler); }
    catch(e){ kToast(e.message||'Das Logo lässt sich nicht speichern.'); return; }
    const v=id=>(M.querySelector(id)||{}).value||'';
    const p={id:d?d.id:null,firma:v('#pdFi'),kurzname:v('#pdKu'),anrede:v('#pdAn'),ansprech:v('#pdAp'),email:v('#pdEm'),adresse:v('#pdAd'),branche:v('#pdBr'),web:v('#pdWe'),empfehlung:v('#pdEmpf'),notiz:v('#pdNo'),
      passung:{suchnamen:v('#pdSu').trim(),widmung:v('#pdWi').trim(),widmung_text:v('#pdWt').trim(),titel:v('#pdTi').trim(),hero:v('#pdHe').trim(),ohne:M.querySelector('#pdOJ').checked?['trikot']:[],text:v('#pdTx').trim(),punkte:v('#pdPu').split('\n').map(s=>s.trim()).filter(Boolean).slice(0,6),
        fakten:v('#pdFa').split('\n').map(s=>s.split('|')).filter(a=>a.length>=2&&a[0].trim()).map(a=>({z:a[0].trim().slice(0,12),t:a.slice(1).join('|').trim().slice(0,80)})).slice(0,4)}};
    p.logo_hell=!M.querySelector('#pdLd').checked; if(logo){ p.logo=logo; p.passung.marke=null; } if(d)p.aktiv=M.querySelector('#pdAk').checked;
    if(/[–—]/.test(JSON.stringify(p.passung))){ kToast('Bitte keine Gedankenstriche, lieber Komma oder Doppelpunkt'); return; }
    try{ if(werk)await werk.ergaenzen(p); if(!offen())return; const r=await svtRpc('partner_deck_speichern',{p}); PD.d=null; closeOverlay(); kToast('✓ Präsentation gespeichert');
      if(!d){ try{ await navigator.clipboard.writeText(pdLink(r.code,r.kurz)); kToast('✓ Gespeichert, Link ist kopiert'); }catch(e){} }
      SPO.view='decks'; if(svCurTab()!=='sponsoring')goTab('sponsoring'); else spoRender(); }
    catch(e){ kToast('⚠️ '+e.message); } },'Speichert …');
}

/* Bei einer Firma: Präsentation schon kennen (für „Vertrag abschließen“). „Termin vorbereiten“ steht seit 0.74 als eigener Knopf in der Akte (svm26). */
{ const _ss55=spoSponsor; spoSponsor=function(id){ const r=_ss55.apply(this,arguments);
  try{ if(!PD.d)pdLaden().catch(()=>{}); }catch(e){} return r; }; }

(function(){ try{ const s=document.createElement('style'); s.id='svm55css'; s.textContent="/* Sportzentrale Beta 0.57 · Pitch-Decks */\n.pd-kopf{display:flex;gap:14px;align-items:flex-start;justify-content:space-between;flex-wrap:wrap;}\n.pd-kopf>div{flex:1 1 260px;min-width:0;}\n.pd-k{display:grid;grid-template-columns:repeat(auto-fit,minmax(140px,1fr));gap:10px;margin-bottom:16px;}\n.pd-kk{position:relative;overflow:hidden;padding:12px 14px 16px;border-radius:16px;border:1px solid var(--line2);background:rgba(148,163,196,.06);}\n.pd-kk b{display:block;font-size:24px;font-weight:800;}\n.pd-kk b small{font-size:13px;color:var(--ink3);font-weight:600;}\n.pd-kk span{display:block;font-size:12.5px;color:var(--ink3);margin-top:2px;}\n.pd-kk i{position:absolute;left:0;bottom:0;height:4px;background:linear-gradient(90deg,#2f6bff,#18b1fc);}\n.pd-kk.eng{border-color:rgba(247,113,28,.5);}\n.pd-kk.eng b{color:#f7a35c;}\n.pd-kk.eng i{background:#f7711c;}\n.pd-a{display:flex;gap:12px;align-items:flex-start;flex-wrap:wrap;padding:10px 0;border-top:1px solid var(--line2);}\n.pd-a>div:first-child{flex:1 1 240px;min-width:0;}\n.pd-a b{font-size:14.5px;}\n.pd-a small{display:block;color:var(--ink3);font-size:12.5px;margin-top:2px;line-height:1.4;}\n.pd-a.antrag b{color:#4ade80;}\n.pd-ak{display:flex;gap:6px;flex:none;}\n.pd-as{font-style:normal;font-weight:700;}\n.pd-as.s-fehler{color:#f87171;}\n.pd-as.s-versendet,.pd-as.s-uebernommen{color:#4ade80;}\n.pd-l{display:flex;flex-direction:column;gap:0;}\n.pd-d.aus{opacity:.6;}\n.pd-dk{display:flex;justify-content:space-between;gap:10px;align-items:flex-start;}\n.pd-dk b{font-size:16px;}\n.pd-dk small{display:block;color:var(--ink3);font-size:12.5px;margin-top:3px;}\n.pd-ok{color:#4ade80;font-size:12.5px;}\n.pd-emp{flex:none;font-size:11.5px;font-weight:800;padding:3px 9px;border-radius:99px;background:rgba(247,113,28,.16);color:#f7a35c;}\n.pd-dl{display:flex;gap:8px;margin:10px 0;}\n.pd-dl input{flex:1;min-width:0;font-size:12.5px;}\n.pd-g{display:grid;grid-template-columns:repeat(auto-fit,minmax(200px,1fr));gap:0 12px;}\n.pd-f textarea{width:100%;resize:vertical;}\n.pd-h{margin:16px 0 4px;font-size:15px;}\n.pd-lv{font-size:12.5px;color:var(--ink3);margin:-4px 0 10px;display:flex;align-items:center;gap:10px;}\n.pd-lv img{max-height:56px;max-width:200px;background:#fff;padding:6px;border-radius:8px;}\n#pdBau{margin-left:4px;}\nhtml[data-theme=\"hell\"] body .pd-kk.eng b,html[data-theme=\"hell\"] body .pd-emp{color:#c2560f;}\nhtml[data-theme=\"hell\"] body .pd-a.antrag b,html[data-theme=\"hell\"] body .pd-ok{color:#15803d;}\n/* 0.72: Präsentationen. Kein rohes Linkfeld mehr, ein Hauptknopf (WhatsApp), Station der Firma als Etikett, Weiteres im Mehr-Menü */\n.pd-tags{display:flex;gap:6px;flex-wrap:wrap;justify-content:flex-end;align-items:flex-start;flex:none;}\n.pd-schau svg,.pd-a b svg{width:14px;height:14px;vertical-align:-2px;}\n.pd-akt{display:flex;flex-wrap:wrap;gap:8px;align-items:center;margin-top:12px;}\n.pd-akt>.btn{min-height:44px!important;}\n.pd-akt>.btn.sm{min-height:40px!important;}\n.pd-mehr{position:relative;margin-left:auto;}\n.pd-mehr summary{list-style:none;display:grid;place-items:center;min-width:44px;min-height:44px;border-radius:12px;border:1px solid var(--line);cursor:pointer;font-weight:800;color:var(--ink2);}\n.pd-mehr summary::-webkit-details-marker{display:none;}\n.pd-mehr[open]>div{position:absolute;right:0;top:calc(100% + 6px);z-index:8;display:grid;gap:6px;min-width:210px;padding:8px;border-radius:14px;background:var(--surface2,#182033);border:1px solid var(--line);box-shadow:0 14px 34px -14px rgba(0,0,0,.6);}\n.pd-mehr[open]>div .btn{justify-content:flex-start;min-height:44px!important;}\n@media (max-width:420px){ .pd-akt>.pd-wa{flex:1 1 100%;} }\n"; document.head.appendChild(s); }catch(e){} })();
/* =====================================================================
   Sportzentrale Beta 0.59 · Shop-Finanzen
   - Partner → „Shop-Finanzen“ (Admin, Vorstand, Recht „shop“): Umsatz, Wareneinsatz, Rohertrag, Marge, offene Zahlungen
   - Monate, Linien, Top-Produkte, Rückvergütung von 11teamsports nach Staffel
   - Hinweise: Positionen ohne Einkaufspreis, Preise nicht nach Hausregel (,96 bzw. ,59 bei BSC)
   - Export für die Buchhaltung als Excel (mehrere Blätter) oder CSV, Sicherungen jetzt anlegen und als Datei laden
   ===================================================================== */
const SF={von:null,bis:null,d:null,zr:'jahr',backups:null};
function sfDarf(){ const r=svRole(); return r==='admin'||r==='vorstand'||(typeof svDarf==='function'&&svDarf('shop')===true); }
function sfEur(c){ return ((Number(c)||0)/100).toLocaleString('de-DE',{style:'currency',currency:'EUR'}); }
function sfEur0(c){ return ((Number(c)||0)/100).toLocaleString('de-DE',{style:'currency',currency:'EUR',maximumFractionDigits:0}); }
function sfIso(d){ return d.getFullYear()+'-'+String(d.getMonth()+1).padStart(2,'0')+'-'+String(d.getDate()).padStart(2,'0'); }
function sfZeitraum(k){ const h=new Date(), y=h.getFullYear();
  if(k==='saison'){ const s=h.getMonth()>=6?y:y-1; return [sfIso(new Date(s,6,1)),sfIso(new Date(s+1,5,30))]; }
  if(k==='30')return [sfIso(new Date(h.getTime()-29*864e5)),sfIso(h)];
  if(k==='vorjahr')return [(y-1)+'-01-01',(y-1)+'-12-31'];
  return [y+'-01-01',sfIso(h)]; }
const SF_LINIE={mannschaft:'Mannschaft','1896':'1896',merch:'Merch'};
const SF_MON=['Jan','Feb','Mär','Apr','Mai','Jun','Jul','Aug','Sep','Okt','Nov','Dez'];

/* Reiter im Partner-Bereich */
{ const _sr56=spoRender; spoRender=async function(){ const r=await _sr56.apply(this,arguments);
  try{ const seg=document.querySelector('#panel-sponsoring .spo-seg'); if(seg&&sfDarf()&&!seg.querySelector('[data-spov="shopfin"]')){ const b=document.createElement('button'); b.type='button'; b.setAttribute('role','tab'); b.dataset.spov='shopfin'; b.textContent='Shop-Finanzen';
      if(SPO.view==='shopfin')b.classList.add('on'); seg.appendChild(b);
      b.onclick=()=>{ SPO.view='shopfin'; seg.querySelectorAll('[data-spov]').forEach(x=>x.classList.toggle('on',x===b)); spoBody(); }; } }catch(e){ console.warn('Shop-Finanzen',e); }
  return r; }; }
{ const _sb56=spoBody; spoBody=function(){ if(SPO.view==='shopfin'){ const B=document.getElementById('spoB'); if(B)sfRender(B); return; } return _sb56.apply(this,arguments); }; }

async function sfLaden(){ if(!SF.von){ [SF.von,SF.bis]=sfZeitraum(SF.zr); } SF.d=await svtRpc('shop_finanzen',{p_von:SF.von,p_bis:SF.bis}); return SF.d; }

async function sfRender(B){
  if(!sfDarf()){ B.innerHTML='<div class="card"><div class="empty">Die Shop-Finanzen sehen Admin, Vorstand und wer den Shop betreut.</div></div>'; return; }
  B.innerHTML='<div class="card"><div class="empty">Lade Shop-Finanzen …</div></div>';
  try{ await sfLaden(); }catch(e){ B.innerHTML=`<div class="card"><div class="empty">⚠️ ${svEsc(e.message||e)}</div></div>`; return; }
  if(SPO.view!=='shopfin')return;
  const D=SF.d, K=D.kpi||{}, P=D.partner||{};
  const zr=[['jahr','Dieses Jahr'],['saison','Saison'],['30','30 Tage'],['vorjahr','Vorjahr']];
  const tile=(t,v,s,cls)=>`<div class="sf-t${cls?' '+cls:''}"><span>${t}</span><b>${v}</b>${s?`<small>${s}</small>`:''}</div>`;
  const mon=D.monate||[], maxM=Math.max(1,...mon.map(m=>m.netto||0));
  const stufe=P.prozent?`${String(P.prozent).replace('.',',')} % Freiware`:'noch keine Stufe';
  const naechste=P.naechste?`noch ${sfEur0(P.fehlt)} bis ${String(P.naechste[1]).replace('.',',')} %`:'höchste Stufe erreicht';
  const hinweise=[];
  if(K.ohne_ek)hinweise.push(`<li>⚠️ ${K.ohne_ek} verkaufte Position${K.ohne_ek>1?'en':''} ohne Einkaufspreis. Der Rohertrag ist dort zu hoch. Einkauf im Shop beim Produkt eintragen.</li>`);
  if((D.preise_abweichend||[]).length)hinweise.push(`<li>🔢 ${D.preise_abweichend.length} Preis${D.preise_abweichend.length>1?'e':''} nicht nach Hausregel (SV/BSC endet auf ,96, BSC auf ,59): ${D.preise_abweichend.slice(0,6).map(p=>svEsc(p.titel)+' '+sfEur(p.preis)).join(', ')}${D.preise_abweichend.length>6?' …':''}</li>`);
  if(D.sammel&&D.sammel.ohne_rechnung)hinweise.push(`<li>🧾 ${D.sammel.ohne_rechnung} Sammelbestellung${D.sammel.ohne_rechnung>1?'en':''} bei 11teamsports noch ohne Rechnung.</li>`);
  if(K.offen)hinweise.push(`<li>⏳ ${sfEur(K.offen)} noch nicht bezahlt (Vorkasse offen).</li>`);
  B.innerHTML=`<div class="card sf"><div class="sf-kopf"><div><h3 class="trh">🛒 Shop-Finanzen</h3><p class="note">Was der 1896 Shop einbringt: Umsatz, Wareneinsatz und was für den Verein übrig bleibt. Stornos sind herausgerechnet.</p></div>
      <div class="sf-zr">${zr.map(([k,l])=>`<button type="button" class="chip${SF.zr===k?' on':''}" data-sfzr="${k}">${l}</button>`).join('')}
        <label class="sf-d"><input type="date" id="sfVon" value="${SF.von}"> bis <input type="date" id="sfBis" value="${SF.bis}"></label></div></div>
    <div class="sf-k">
      ${tile('Umsatz brutto',sfEur(K.brutto),`${K.bestellungen||0} Bestellung${K.bestellungen===1?'':'en'} · Ø ${sfEur(K.schnitt)}`)}
      ${tile('Umsatz netto',sfEur(K.netto),`MwSt ${sfEur(K.mwst)}`)}
      ${tile('Wareneinsatz',sfEur(K.einsatz),`${K.teile||0} Teile, Einkauf netto`)}
      ${tile('Rohertrag',sfEur(K.rohertrag),K.marge!=null?`Marge ${String(K.marge).replace('.',',')} %`:'noch keine Umsätze','gut')}
      ${tile('Bezahlt',sfEur(K.bezahlt),K.offen?`offen ${sfEur(K.offen)}`:'nichts offen')}
      ${tile('Rückvergütung 11teamsports',sfEur0(P.freiware||0),`Saison ${svEsc(P.saison||'')}: ${stufe}, ${naechste}`,'p')}
    </div>
    ${hinweise.length?`<ul class="sf-h">${hinweise.join('')}</ul>`:''}
    <div class="btnrow sf-x"><button type="button" class="btn" id="sfXlsx">${SVI('download')} Excel für die Buchhaltung</button><button type="button" class="btn ghost" id="sfCsv">${SVI('download')} CSV Bestellungen</button>
      <button type="button" class="btn ghost" id="sfBackup">💾 Sicherung</button></div>
    <div id="sfBk"></div></div>
  <div class="card"><h3 class="trh">Monate</h3>${mon.length?`<div class="sf-m">${mon.map(m=>{ const [y,mm]=m.monat.split('-'); const roh=(m.netto||0)-(m.einsatz||0);
      return `<div class="sf-mr"><span>${SF_MON[+mm-1]} ${y.slice(2)}</span><div class="sf-bar"><i style="width:${Math.max(2,Math.round((m.netto||0)/maxM*100))}%"></i><i class="r" style="width:${Math.max(0,Math.round(roh/maxM*100))}%"></i></div><b>${sfEur0(m.netto)}</b><small>${sfEur0(roh)} Rohertrag</small></div>`; }).join('')}</div>
      <p class="note">Blau: Umsatz netto, grün: Rohertrag.</p>`:'<div class="empty">Im Zeitraum noch keine Bestellungen.</div>'}</div>
  <div class="card"><h3 class="trh">Nach Linie</h3>${(D.linien||[]).length?`<div class="sf-tab"><table><thead><tr><th>Linie</th><th>Teile</th><th>Netto</th><th>Einsatz</th><th>Rohertrag</th></tr></thead><tbody>
      ${D.linien.map(l=>`<tr><td>${svEsc(SF_LINIE[l.linie]||l.linie)}</td><td>${l.teile}</td><td>${sfEur(l.netto)}</td><td>${sfEur(l.einsatz)}</td><td><b>${sfEur(l.netto-l.einsatz)}</b></td></tr>`).join('')}</tbody></table></div>`:'<div class="empty">Noch nichts verkauft.</div>'}</div>
  <div class="card"><h3 class="trh">Top-Produkte nach Rohertrag</h3>${(D.produkte||[]).length?`<div class="sf-tab"><table><thead><tr><th>Produkt</th><th>Teile</th><th>Netto</th><th>Rohertrag</th></tr></thead><tbody>
      ${D.produkte.map(p=>`<tr><td>${svEsc(p.titel)} <small>${svEsc(SF_LINIE[p.linie]||p.linie||'')}${p.ohne_ek?' · ohne EK':''}</small></td><td>${p.teile}</td><td>${sfEur(p.netto)}</td><td><b>${sfEur(p.netto-p.einsatz)}</b></td></tr>`).join('')}</tbody></table></div>`:'<div class="empty">Noch nichts verkauft.</div>'}</div>`;
  B.querySelectorAll('[data-sfzr]').forEach(b=>b.onclick=()=>{ SF.zr=b.dataset.sfzr; [SF.von,SF.bis]=sfZeitraum(SF.zr); sfRender(B); });
  const dat=()=>{ const v=B.querySelector('#sfVon').value, b=B.querySelector('#sfBis').value; if(v&&b){ SF.zr='frei'; SF.von=v; SF.bis=b; sfRender(B); } };
  B.querySelector('#sfVon').onchange=dat; B.querySelector('#sfBis').onchange=dat;
  B.querySelector('#sfXlsx').onclick=()=>sfExport('xlsx'); B.querySelector('#sfCsv').onclick=()=>sfExport('csv');
  B.querySelector('#sfBackup').onclick=()=>sfBackups(B.querySelector('#sfBk'));
}

const SF_COLS={
  bestellungen:[['nummer','Bestellnummer'],['datum','Datum'],['status','Status'],['zahlart','Zahlart'],['bezahlt_am','Bezahlt am'],['versandart','Versand'],['kunde','Kunde'],['plz','PLZ'],['ort','Ort'],
    ['waren','Waren €'],['versand','Versand €'],['rabatt','Rabatt €'],['summe','Summe brutto €'],['mwst19','MwSt 19 % €'],['mwst7','MwSt 7 % €'],['netto','Netto €'],['einsatz','Einkauf netto €'],['rabatt_code','Rabattcode'],['gutschein','Gutschein'],['sammel','Sammelbestellung']],
  positionen:[['nummer','Bestellnummer'],['datum','Datum'],['status','Status'],['artikel','Artikel'],['linie','Linie'],['groesse','Größe'],['farbe','Farbe'],['menge','Menge'],['einzelpreis','Einzelpreis €'],['aufpreis','Aufpreis €'],
    ['summe','Summe brutto €'],['mwst_satz','MwSt %'],['netto','Netto €'],['ek_stueck','EK netto Stück €'],['ek_summe','EK netto €'],['rohertrag','Rohertrag €'],['partner_artikel','Artikel 11teamsports']],
  sammelbestellungen:[['nummer','Sammelbestellung'],['datum','Datum'],['status','Status'],['bestellungen','Bestellungen'],['teile','Teile'],['summe_vk','Verkauf €'],['summe_ek','Einkauf €'],['rechnung_nr','Rechnung Nr.'],['rechnung_betrag','Rechnung €'],['bezahlt_am','Bezahlt am']]};
const SF_EURO=/€/;
function sfZeile(r,cols){ return cols.map(([k,l])=>{ const v=r[k]; if(v==null||v==='')return ''; return SF_EURO.test(l)&&typeof v==='number'?Math.round(v)/100:(k==='status'||k==='linie')&&SF_LINIE[v]?SF_LINIE[v]:v; }); }
async function sfExport(art){
  try{ kToast('Export wird erstellt …');
    const E=await svtRpc('shop_finanz_export',{p_von:SF.von,p_bis:SF.bis}), name=`Shop-Finanzen ${E.von} bis ${E.bis}`;
    if(art==='csv'){ const C=SF_COLS.bestellungen, q=v=>{ const s=typeof v==='number'?String(v).replace('.',','):String(v); return /[;"\n]/.test(s)?'"'+s.replace(/"/g,'""')+'"':s; };
      const txt='﻿'+[C.map(c=>c[1]).join(';'),...E.bestellungen.map(r=>sfZeile(r,C).map(q).join(';'))].join('\r\n');
      spoDownload(new Blob([txt],{type:'text/csv;charset=utf-8'}),name+'.csv'); kToast('✓ CSV geladen'); return; }
    const X=await vrXlsx(), wb=X.utils.book_new(), K=(SF.d&&SF.d.kpi)||{};
    const ueb=[['Shop-Finanzen SV/BSC Mörlenbach'],[`Zeitraum ${E.von} bis ${E.bis}`],[],['Kennzahl','Betrag €'],
      ['Umsatz brutto',(K.brutto||0)/100],['davon MwSt',(K.mwst||0)/100],['Umsatz netto',(K.netto||0)/100],['Wareneinsatz netto',(K.einsatz||0)/100],['Rohertrag',(K.rohertrag||0)/100],
      ['Versand eingenommen',(K.versand||0)/100],['Rabatte',(K.rabatt||0)/100],['Bezahlt',(K.bezahlt||0)/100],['Offen',(K.offen||0)/100],['Bestellungen (Anzahl)',K.bestellungen||0],['Stornos (Anzahl)',(K.storniert||{}).anzahl||0]];
    const add=(n,aoa,w)=>{ const ws=X.utils.aoa_to_sheet(aoa); ws['!cols']=w; X.utils.book_append_sheet(wb,ws,n); };
    add('Übersicht',ueb,[{wch:28},{wch:14}]);
    add('Monate',[['Monat','Bestellungen','Brutto €','Netto €','Einkauf €','Rohertrag €'],...(SF.d.monate||[]).map(m=>[m.monat,m.bestellungen,m.brutto/100,m.netto/100,m.einsatz/100,(m.netto-m.einsatz)/100])],[{wch:10},{wch:12},{wch:12},{wch:12},{wch:12},{wch:12}]);
    for(const t of ['bestellungen','positionen','sammelbestellungen']){ const C=SF_COLS[t]; add(t[0].toUpperCase()+t.slice(1),[C.map(c=>c[1]),...(E[t]||[]).map(r=>sfZeile(r,C))],C.map(c=>({wch:Math.max(10,c[1].length+2)}))); }
    const b64=X.write(wb,{type:'base64',bookType:'xlsx'}), s=atob(b64), u=new Uint8Array(s.length); for(let i=0;i<s.length;i++)u[i]=s.charCodeAt(i);
    spoDownload(new Blob([u],{type:'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'}),name+'.xlsx'); kToast('✓ Excel geladen');
  }catch(e){ kToast('⚠️ '+(e.message||e)); }
}

async function sfBackups(box){
  box.innerHTML='<p class="note">Lade Sicherungen …</p>';
  let L; try{ L=await svtRpc('shop_backups_liste',{}); }catch(e){ box.innerHTML=`<p class="note">⚠️ Sicherungen sehen nur Admins und wer die Shop-Einstellungen ändern darf.</p>`; return; }
  const zeit=t=>{ try{ return new Date(t).toLocaleString('de-DE',{day:'2-digit',month:'2-digit',year:'numeric',hour:'2-digit',minute:'2-digit'}); }catch(e){ return ''; } };
  box.innerHTML=`<div class="sf-bk"><p class="note">Jede Nacht um 2:23 Uhr sichert die Sportzentrale den ganzen Shop: Produkte, Größen, Bestellungen, Rabatte, Einstellungen. Nächtliche Sicherungen bleiben 35 Tage, eigene ein Jahr. Für den Notfall außerhalb der Datenbank: ab und zu eine Sicherung herunterladen und ablegen.</p>
    <div class="btnrow"><button type="button" class="btn sm" id="sfBkNeu">💾 Jetzt sichern</button></div>
    ${L.length?`<div class="sf-tab"><table><thead><tr><th>Wann</th><th>Art</th><th>Zeilen</th><th>Größe</th><th></th></tr></thead><tbody>${L.slice(0,12).map(b=>`<tr><td>${zeit(b.at)}</td><td>${b.art==='hand'?'von Hand':'nachts'}</td><td>${b.zeilen}</td><td>${Math.max(1,Math.round(b.bytes/1024))} KB</td><td><button type="button" class="btn ghost sm" data-sfbk="${b.id}">${SVI('download')} Laden</button></td></tr>`).join('')}</tbody></table></div>`:'<p class="note">Noch keine Sicherung vorhanden.</p>'}</div>`;
  box.querySelector('#sfBkNeu').onclick=async()=>{ try{ const r=await svtRpc('shop_backup_jetzt',{}); kToast(`✓ Gesichert: ${r.zeilen} Zeilen`); sfBackups(box); }catch(e){ kToast('⚠️ '+(e.message||e)); } };
  box.querySelectorAll('[data-sfbk]').forEach(b=>b.onclick=async()=>{ try{ const d=await svtRpc('shop_backup_holen',{p_id:+b.dataset.sfbk});
      spoDownload(new Blob([JSON.stringify(d)],{type:'application/json'}),`Shop-Sicherung ${String(d.erstellt||'').slice(0,10)}.json`); kToast('✓ Sicherung geladen'); }catch(e){ kToast('⚠️ '+(e.message||e)); } });
}

(function(){ try{ const s=document.createElement('style'); s.id='svm56css'; s.textContent="/* Sportzentrale Beta 0.59 · Shop-Finanzen */\n.sf-kopf{display:flex;gap:14px;align-items:flex-start;justify-content:space-between;flex-wrap:wrap;margin-bottom:12px;}\n.sf-kopf>div:first-child{flex:1 1 260px;min-width:0;}\n.sf-zr{display:flex;flex-wrap:wrap;gap:6px;align-items:center;}\n.sf-zr .chip.on{background:var(--blue,#2f6bff)!important;color:#fff!important;border-color:transparent!important;}\n.sf-d{display:flex;flex-wrap:wrap;gap:6px;align-items:center;font-size:12.5px;color:var(--ink3);}\n.sf-d input{font:inherit;color:var(--ink);background:rgba(148,163,196,.06);border:1px solid var(--line2);border-radius:10px;padding:5px 8px;max-width:150px;}\n.sf-k{display:grid;grid-template-columns:repeat(auto-fit,minmax(150px,1fr));gap:10px;margin:6px 0 14px;}\n.sf-t{padding:12px 14px;border-radius:16px;border:1px solid var(--line2);background:rgba(148,163,196,.06);min-width:0;}\n.sf-t span{display:block;font-size:12.5px;color:var(--ink3);}\n.sf-t b{display:block;font-size:22px;font-weight:800;margin-top:2px;font-variant-numeric:tabular-nums;}\n.sf-t small{display:block;font-size:12px;color:var(--ink3);margin-top:3px;line-height:1.35;}\n.sf-t.gut{border-color:rgba(74,222,128,.45);}\n.sf-t.gut b{color:#4ade80;}\n.sf-t.p{border-color:rgba(247,113,28,.5);}\n.sf-t.p b{color:#f7a35c;}\n.sf-h{list-style:none;margin:0 0 12px;padding:10px 12px;border-radius:12px;background:rgba(247,163,92,.08);border:1px solid rgba(247,163,92,.3);display:flex;flex-direction:column;gap:6px;font-size:13px;line-height:1.4;}\n.sf-x{flex-wrap:wrap;gap:8px;}\n.sf-bk{margin-top:12px;padding-top:10px;border-top:1px solid var(--line2);}\n.sf-m{display:flex;flex-direction:column;gap:8px;}\n.sf-mr{display:grid;grid-template-columns:56px 1fr auto;grid-template-rows:auto auto;column-gap:10px;align-items:center;font-variant-numeric:tabular-nums;}\n.sf-mr>span{font-size:12.5px;color:var(--ink3);grid-row:1/3;}\n.sf-mr>b{font-size:13.5px;text-align:right;}\n.sf-mr>small{grid-column:3;font-size:11.5px;color:var(--ink3);text-align:right;}\n.sf-bar{position:relative;height:14px;border-radius:7px;background:rgba(148,163,196,.08);overflow:hidden;grid-row:1/3;}\n.sf-bar i{position:absolute;left:0;top:0;bottom:0;border-radius:7px;background:linear-gradient(90deg,#2f6bff,#18b1fc);}\n.sf-bar i.r{top:auto;height:5px;background:#4ade80;}\n.sf-tab{overflow-x:auto;}\n.sf-tab table{width:100%;border-collapse:collapse;font-size:13px;font-variant-numeric:tabular-nums;}\n.sf-tab th{text-align:left;font-size:11.5px;font-weight:650;color:var(--ink3);text-transform:uppercase;letter-spacing:.04em;padding:6px 8px;border-bottom:1px solid var(--line2);white-space:nowrap;}\n.sf-tab td{padding:7px 8px;border-bottom:1px solid var(--line2);vertical-align:top;}\n.sf-tab td small{display:block;color:var(--ink3);font-size:11.5px;}\n.sf-tab th:not(:first-child),.sf-tab td:not(:first-child){text-align:right;}\nhtml[data-theme=\"hell\"] .sf-t.gut b{color:#15803d;}\nhtml[data-theme=\"hell\"] .sf-t.p b{color:#c2570c;}\n"; document.head.appendChild(s); }catch(e){} })();
/* =====================================================================
   Sportzentrale Beta 0.60 · Spieltagsstudio
   - Verein → „Spieltagsstudio“ (Admin, Vorstand, Planer, Recht „plakat“): Plakat zum nächsten Spiel in drei Formaten
   - Spielplan kommt aus der eigenen fixtures-Tabelle, nicht mehr von einem fremden Abruf. Spielort und Texte liegen
     in plakat_spiel, also sehen alle im Team denselben Stand statt jeder seinen eigenen Browser-Speicher.
   - Tageszeit und Jahreszeit entscheiden über das Motiv: Sonntagmittag bekommt kein Flutlicht.
   - Wappenbibliothek: 21 geprüfte Dateien unter plakat/wappen, Innenflächen unverändert, Fehlheim nur clean-v2.
   - Der Renderer ist eine eigene Funktion mit Zustand und Bildern als Übergabe (pkMalen), keine DOM-Globals.
   ===================================================================== */
const PK = {
  laedt:false, spiele:[], bib:null, gewaehlt:null, frei:false, serverStand:null,
  bilder:new Map(), eigene:{}, malen:0, format:'story', skala:1,
  s:{ heim:true, mannschaft:'Unsere Erste', gegner:'', datum:'', zeit:'', ort:'', sub:'A',
      absender:'SV/BSC MÖRLENBACH', claim:['UNSERE HEIMAT.','UNSER VEREIN.','UNSERE LEIDENSCHAFT.'],
      spruch:'GEMEINSAM. LAUTER. STÄRKER.', modus:'auto', foto:'', blau:'#0757cb', orange:'#ff891c',
      dunkel:18, patina:34, ton:'normal',
      ebenen:{ foto:true, verlauf:true, marke:true, titel:true, wappen:true, daten:true, spruch:true } },
  texte:{ post:'', whatsapp:'', story:'' }
};
const PK_FORMATE = { story:[1080,1920,'Story 9:16'], feed:[1080,1350,'Feed 4:5'], quer:[1920,1080,'Quer 16:9'] };
const PK_EBENEN = [['foto','Hintergrund und Atmosphäre'],['verlauf','Dunkler Verlauf'],['marke','Absender und Claim'],
  ['titel','Spieltag-Headline'],['wappen','Vereinswappen'],['daten','Datum, Anstoß und Spielort'],['spruch','Vereinsmotto']];
/* Hintergrund-Galerie (0.73): Nahaufnahmen statt Stadion, damit niemand sagt „ist ja gar nicht unser Platz“.
   Je Bild die Lichtstimmungen, zu denen es passt. „Automatisch“ nimmt je Spiel ein anderes passendes Bild, fest pro Spiel. */
const PK_FOTOS = [
  ['fruehling-tag','Frühling am Platz',['spring']], ['sommer-tag','Sommertag',['summer']],
  ['herbst-tag','Herbstnachmittag',['autumn']], ['winter-tag','Klarer Wintertag',['winter']],
  ['linie-abend','Linie am Abend',['night']], ['night','Flutlicht',['night']], ['ball-flutlicht','Ball unter Flutlicht',['night']],
  ['netz-nacht','Netz bei Nacht',['night']], ['regen-nacht','Regen bei Nacht',['night'],false], ['kunstrasen-flutlicht','Kunstrasen unter Flutlicht',['night']],
  ['mittelkreis-nebel','Mittelkreis im Nebel',['autumn'],false], ['autumn','Herbstlaub',['autumn']], ['elfmeter-herbst','Elfmeterpunkt',['autumn']],
  ['pfosten-nebel','Pfosten im Nebel',['autumn'],false], ['eckfahne-abend','Eckfahne am Abend',['night']], ['schuhe-abend','Schuhe am Abend',['night']],
  ['summer','Ball im Gras',['spring','summer']], ['ball-gegenlicht','Gegenlicht',['spring','summer']], ['winter','Raureif',['winter'],false],
  ['tau-linie','Tau an der Linie',['spring','autumn'],false], ['ball-frost','Ball im Frost',['winter'],false]
].map(([id, titel, st, auto = true]) => ({ id, titel, st, auto }));
function pkFotoAuswahl(S, stimmung){
  const st = stimmung === 'night' ? 'night' : stimmung;
  if(S.foto && PK_FOTOS.some(f => f.id === S.foto)) return S.foto;
  const L = PK_FOTOS.filter(f => f.auto && f.st.includes(st)); if(!L.length) return 'summer';
  let h = 0; for(const c of String(S.datum || '') + '|' + String(S.gegner || '')) h = (Math.imul(h, 31) + c.charCodeAt(0)) >>> 0;
  return L[h % L.length].id; }
/* Schriften liegen in der App (fonts/anton.woff2, fonts/barlowc-*.woff2), kein fremder Server */
let pkFontsBereit = null;
function pkFontsLaden(){ if(pkFontsBereit) return pkFontsBereit;
  pkFontsBereit = (async () => { try{
    await Promise.all([document.fonts.load('400 220px Anton'), document.fonts.load('600 40px BarlowC'),
      document.fonts.load('700 40px BarlowC'), document.fonts.load('800 40px BarlowC')]);
    await document.fonts.ready; }catch(e){} })();
  return pkFontsBereit; }

function pkDarf(){ const r = svRole(); if(r === 'admin') return true;
  const d = (typeof svDarf === 'function') ? svDarf('plakat') : null;
  return d === null ? (r === 'vorstand' || r === 'planer') : d === true; }
const pkEsc = s => svEsc(s == null ? '' : String(s));
const pkNorm = s => (typeof TRC !== 'undefined' && TRC.N ? TRC.N(String(s || '')) : String(s || '').toLowerCase()).replace(/[^a-z0-9]/g, '');

/* ---------- Licht: Jahreszeit und angenäherter Sonnenuntergang für Mörlenbach ---------- */
function pkLicht(datum, zeit, modus = 'auto'){
  const d = /^(\d{4})-(\d{2})-(\d{2})$/.exec(datum || ''), u = /^(\d{1,2}):(\d{2})$/.exec(zeit || '');
  if(!d || !u || +u[1]>23 || +u[2]>59 || +d[1]<1900 || +d[1]>2199 || new Date(Date.UTC(+d[1],+d[2]-1,+d[3])).toISOString().slice(0,10)!==datum) return { stimmung:'summer', zeitraum:'tag', automatisch:modus === 'auto', text:'Datum und Anstoßzeit ergänzen' };
  const jahr = +d[1], monat = +d[2], tag = +d[3], utc = Date.UTC(jahr, monat - 1, tag, 12);
  const n = Math.floor((utc - Date.UTC(jahr, 0, 0, 12)) / 86400000), rad = Math.PI / 180, g = 2 * Math.PI / 365 * (n - 1);
  const eq = 229.18 * (.000075 + .001868 * Math.cos(g) - .032077 * Math.sin(g) - .014615 * Math.cos(2 * g) - .040849 * Math.sin(2 * g));
  const dek = .006918 - .399912 * Math.cos(g) + .070257 * Math.sin(g) - .006758 * Math.cos(2 * g) + .000907 * Math.sin(2 * g) - .002697 * Math.cos(3 * g) + .00148 * Math.sin(3 * g);
  let vers = 60; try{ vers = (+new Intl.DateTimeFormat('en-GB', { timeZone:'Europe/Berlin', hour:'numeric', hour12:false }).format(new Date(utc)) - 12) * 60; }catch(e){}
  const mittag = 720 - 4 * 8.73 - eq + vers;
  const w = Math.acos((Math.cos(90.833 * rad) / (Math.cos(49.6 * rad) * Math.cos(dek))) - Math.tan(49.6 * rad) * Math.tan(dek)) / rad;
  const auf = mittag - 4 * w, unter = mittag + 4 * w, min = +u[1] * 60 + +u[2];
  const nacht = min < auf || min >= unter;
  const saison = (monat >= 9 && monat <= 11) ? 'autumn' : (monat === 12 || monat <= 2) ? 'winter' : monat <= 5 ? 'spring' : 'summer';
  const gewaehlt = modus === 'auto' ? (nacht ? 'night' : saison) : modus;
  const hhmm = m => String(Math.floor(m / 60)).padStart(2, '0') + ':' + String(Math.round(m % 60)).padStart(2, '0');
  return { stimmung:gewaehlt, zeitraum:gewaehlt === 'night' ? 'nacht' : 'tag', automatisch:modus === 'auto',
    sonnenuntergang:hhmm(unter), nacht,
    text: modus === 'auto' ? `${gewaehlt === 'night' ? 'Abend und Flutlicht' : 'Tageslicht'} am Spieltermin, Sonnenuntergang gegen ${hhmm(unter)} Uhr`
                           : 'Lichtstimmung von Hand gewählt' };
}
const PK_SAISON = { night:'Flutlichtabend', spring:'Frühlingsspieltag', autumn:'Herbstnachmittag', summer:'Fußball bei Tageslicht', winter:'Winterspieltag' };

/* ---------- Bibliothek und Bilder ---------- */
async function pkBib(){ if(PK.bib) return PK.bib;
  try{ const r = await fetch('plakat/wappen.json', { cache:'force-cache' }); PK.bib = r.ok ? await r.json() : { wappen:[] }; }
  catch(e){ PK.bib = { wappen:[] }; }
  /* Vereinsnamen aus dem Spielplan und aus der Bibliothek stimmen nicht immer wörtlich überein
     (Zweite Mannschaften, Schrägstriche, Zusätze). Darum mehrere Schreibweisen in den Index legen. */
  PK.bib.index = new Map();
  const legen = (k, w) => { if(k && !PK.bib.index.has(k)) PK.bib.index.set(k, w); };
  (PK.bib.wappen || []).forEach(w => { const k = pkNorm(w.name); legen(k, w); legen(k.replace(/(iii|ii|iv|[234])$/, ''), w); });
  return PK.bib; }
function pkBibEintrag(name){ if(!PK.bib || !name) return null;
  const k = pkNorm(name), ohne = k.replace(/(iii|ii|iv|[234])$/, '');
  return PK.bib.index.get(k) || PK.bib.index.get(ohne) || null; }
function pkBild(src){ if(!src) return Promise.resolve(null); if(PK.bilder.has(src)) return Promise.resolve(PK.bilder.get(src));
  return new Promise(ok => { const i = new Image(); if(/^https?:/i.test(src)) i.crossOrigin = 'anonymous';   // 0.99.21: Bilder aus dem Speicher, sonst sperrt der Browser das PNG
    i.onload = () => { PK.bilder.set(src, i); ok(i); }; i.onerror = () => ok(null); i.src = src; }); }
function pkWappenQuelle(name, eigenes){
  if(eigenes) return eigenes;
  const b = pkBibEintrag(name); if(b) return 'plakat/wappen/' + b.datei;
  const id = (typeof scCrestId === 'function') ? scCrestId(name) : null;
  return id ? 'wappen/' + encodeURIComponent(id) + '.webp' : null; }

/* ---------- Spielplan aus der eigenen Datenbank ---------- */
const PK_EIGEN = (typeof VEREIN !== 'undefined' && VEREIN.texte && VEREIN.texte.fde_schluessel) ? VEREIN.texte.fde_schluessel : 'svbscmoerlenbach';
const pkIstWir = k => pkNorm(k).startsWith(pkNorm(PK_EIGEN));
async function pkSpieleLaden(){
  const heute = new Date(new Intl.DateTimeFormat('en-CA', { timeZone:'Europe/Berlin', year:'numeric', month:'2-digit', day:'2-digit' }).format(new Date()));
  const iso = heute.toISOString().slice(0, 10);
  const { data } = await SVB.sb.from('fixtures').select('id,sub,datum,zeit,wettbewerb,heim,gast,heim_key,gast_key')
    .gte('datum', iso).order('datum', { ascending:true }).limit(60);
  PK.spiele = (data || []).filter(f => pkIstWir(f.heim_key) || pkIstWir(f.gast_key)).map(f => {
    const heim = pkIstWir(f.heim_key);
    return { id:f.id, sub:f.sub, datum:f.datum, zeit:(f.zeit || '').slice(0, 5), heim, gegner:heim ? f.gast : f.heim, wettbewerb:f.wettbewerb };
  });
  return PK.spiele; }
async function pkStandLaden(id){ if(!id) return null;
  try{ const { data } = await SVB.sb.from('plakat_spiel').select('*').eq('spiel', id).maybeSingle(); return data || null; }catch(e){ return null; } }
let pkMerkTimer = null;
function pkMerken(sofort){
  clearTimeout(pkMerkTimer);
  const tun = async () => { if(!PK.gewaehlt) return;
    try{ await svtRpc('plakat_merken', { p:{ spiel:PK.gewaehlt, sub:PK.s.sub, datum:PK.s.datum || null, zeit:PK.s.zeit || null,
      heim:PK.s.heim, gegner:PK.s.gegner, spielort:PK.s.ort, texte:PK.texte,
      einstell:{ format:PK.format, blau:PK.s.blau, orange:PK.s.orange, dunkel:PK.s.dunkel, patina:PK.s.patina,
        modus:PK.s.modus, ton:PK.s.ton, spruch:PK.s.spruch, ebenen:PK.s.ebenen, foto:PK.s.foto || '' } } });
    }catch(e){ console.warn('Spieltagsstudio speichern', e); } };
  if(sofort) return tun(); pkMerkTimer = setTimeout(tun, 1200); }

/* ---------- Zeichnen ---------- */
const pkRnd = (a, b) => { let n = Math.imul(a + 8191, 374761393) ^ Math.imul(b + 6553, 668265263); n = Math.imul(n ^ (n >>> 13), 1274126177); return ((n ^ (n >>> 16)) >>> 0) / 4294967295; };
function pkGesperrt(ctx, text, x, y, groesse, farbe, sperre, ausricht, maxBreite, gewicht){
  ctx.font = `${gewicht || 600} ${groesse}px 'BarlowC','Barlow Condensed',sans-serif`;
  const zeichen = [...String(text || '')];
  let breite = ctx.measureText(text).width + Math.max(0, zeichen.length - 1) * sperre;
  const f = Math.min(1, (maxBreite || Infinity) / breite);
  ctx.save(); ctx.translate(x, y); ctx.scale(f, f);
  let p = ausricht === 'center' ? -breite / 2 : ausricht === 'right' ? -breite : 0;
  ctx.fillStyle = farbe; ctx.textAlign = 'left';
  for(const z of zeichen){ ctx.fillText(z, p, 0); p += ctx.measureText(z).width + sperre; }
  ctx.restore(); return breite * f; }
function pkFett(ctx, text, x, y, groesse, farbe, maxBreite, ausricht){
  ctx.fillStyle = farbe; ctx.font = `700 ${groesse}px 'BarlowC','Barlow Condensed',sans-serif`; ctx.textAlign = ausricht || 'left';
  const b = ctx.measureText(text).width; ctx.save(); ctx.translate(x, y); ctx.scale(Math.min(1, (maxBreite || Infinity) / b), 1);
  ctx.fillText(text, 0, 0); ctx.restore(); }

/* Headline: schwere schmale Versalien, Patina als Oberflächenmodulation auf den Glyphen, nie als Loch.
   Die Zeilen werden auf eine gemeinsame Breite gebracht, aber nur behutsam gestaucht: liegt die nötige
   Stauchung über PK_STAUCH, wird die gemeinsame Breite kleiner statt die Buchstaben zu verzerren. */
const PK_STAUCH = 0.12;
const pkMessCv = typeof document !== 'undefined' ? document.createElement('canvas') : null;
function pkKopfVerhaeltnis(wort){
  if(!pkMessCv) return 3;
  const g = pkMessCv.getContext('2d'); g.font = "400 220px Anton,'BarlowC',sans-serif";
  const m = g.measureText(wort), hh = (m.actualBoundingBoxAscent + m.actualBoundingBoxDescent) || 220;
  return Math.max(.2, m.width / hh); }
/* Zwei Zeilen bündig: gemeinsame Breite und je Zeile die Höhe, ohne grobe Verzerrung */
function pkKopfSatz(w1, h1, w2, h2, maxBreite){
  const n1 = pkKopfVerhaeltnis(w1) * h1, n2 = pkKopfVerhaeltnis(w2) * h2;
  let b = Math.min(maxBreite, (n1 + n2) / 2);
  const grenze = 1 - PK_STAUCH;
  if(b / n1 < grenze) b = n1 * grenze;
  if(b / n2 < grenze) b = Math.min(b, n2 / grenze);
  b = Math.min(b, maxBreite, n1 / grenze, n2 / grenze);
  b = Math.max(b, n1 * grenze, n2 * grenze);
  return Math.min(b, maxBreite); }
const pkKopfCache = new Map();
function pkKopf(ctx, wort, x, y, w, h, farbe, patina, skala){
  const key = [wort, Math.round(w), Math.round(h), farbe, patina, skala].join('|');
  let L = pkKopfCache.get(key);
  if(!L){
    L = document.createElement('canvas'); L.width = Math.max(1, Math.ceil(w * skala)); L.height = Math.max(1, Math.ceil(h * skala));
    const g = L.getContext('2d', { willReadFrequently:true });
    g.font = "400 220px Anton,'BarlowC',sans-serif";
    const m = g.measureText(wort), gh = (m.actualBoundingBoxAscent + m.actualBoundingBoxDescent) || 220;
    g.save(); g.scale(L.width / Math.max(1, m.width), L.height / gh); g.fillStyle = farbe; g.fillText(wort, 0, m.actualBoundingBoxAscent); g.restore();
    if(patina > 0){
      const a = patina / 100;
      const weich = t => t * t * (3 - 2 * t);
      const rausch = (px, py, s) => { const i = Math.floor(px / s), j = Math.floor(py / s), u = weich(px / s - i), v = weich(py / s - j);
        return (pkRnd(i, j) * (1 - u) + pkRnd(i + 1, j) * u) * (1 - v) + (pkRnd(i, j + 1) * (1 - u) + pkRnd(i + 1, j + 1) * u) * v; };
      const bild = g.getImageData(0, 0, L.width, L.height), p = bild.data;
      for(let py = 0; py < L.height; py++) for(let px = 0; px < L.width; px++){
        const i = (py * L.width + px) * 4; if(!p[i + 3]) continue;
        const lx = px / skala, ly = py / skala;
        const grob = rausch(lx, ly, 52), mittel = rausch(lx + 237, ly + 139, 14), fein = rausch(lx + 51, ly + 19, 4.1);
        /* Abrieb sitzt in Inseln, etwas stärker in der unteren Buchstabenhälfte. Helligkeit wandert, Form bleibt. */
        const insel = Math.max(0, grob * .52 + mittel * .30 + fein * .18 - .62);
        const tief = insel * a * (.45 + .55 * py / L.height) * 1.5;
        const hell = Math.max(0, mittel - .70) * a * .55 + Math.max(0, fein - .80) * a * .35;
        for(let j = 0; j < 3; j++){ const v = p[i + j]; p[i + j] = Math.max(0, Math.min(255, v * (1 - tief * .22) + (232 - v) * hell * .30)); }
      }
      g.putImageData(bild, 0, 0);
      /* ein paar flache Abriebstellen mit feinem Korn, nur innerhalb der Glyphen */
      g.globalCompositeOperation = 'source-atop'; g.setTransform(skala, 0, 0, skala, 0, 0);
      const n = Math.round(w * h / 1400);
      for(let i = 0; i < n; i++){ const px = pkRnd(i, 11) * w, py = (.35 + .65 * pkRnd(i, 12)) * h, r = .6 + pkRnd(i, 13) * 2.4;
        g.fillStyle = `rgba(236,233,226,${a * (.05 + pkRnd(i, 14) * .10)})`;
        g.beginPath(); g.ellipse(px, py, r, r * (.45 + .6 * pkRnd(i, 15)), pkRnd(i, 16) * 3, 0, Math.PI * 2); g.fill(); }
      g.setTransform(1, 0, 0, 1, 0, 0); g.globalCompositeOperation = 'source-over';
    }
    if(pkKopfCache.size > 8) pkKopfCache.clear();
    pkKopfCache.set(key, L);
  }
  ctx.drawImage(L, x, y, w, h); }

function pkWappenMalen(ctx, img, x, y, bw, bh){
  if(!img) return;
  const nw = img.naturalWidth || img.width, nh = img.naturalHeight || img.height; if(!nw || !nh) return;
  const f = Math.min(bw / nw, bh / nh), dw = nw * f, dh = nh * f;
  ctx.save(); ctx.shadowColor = 'rgba(0,0,0,.42)'; ctx.shadowBlur = bh * .07; ctx.shadowOffsetY = bh * .025;
  ctx.drawImage(img, x + (bw - dw) / 2, y + (bh - dh) / 2, dw, dh); ctx.restore(); }

function pkIcon(ctx, art, x, y, s, farbe){
  ctx.save(); ctx.translate(x, y); ctx.scale(s / 48, s / 48);
  ctx.strokeStyle = farbe; ctx.fillStyle = farbe; ctx.lineWidth = 3.2; ctx.lineCap = 'round'; ctx.lineJoin = 'round';
  if(art === 'kalender'){ ctx.strokeRect(5, 8, 38, 35); ctx.beginPath(); ctx.moveTo(5, 19); ctx.lineTo(43, 19);
    ctx.moveTo(15, 2); ctx.lineTo(15, 13); ctx.moveTo(33, 2); ctx.lineTo(33, 13); ctx.stroke();
    for(let r = 0; r < 3; r++) for(let c = 0; c < 3; c++) ctx.fillRect(12 + c * 10, 24 + r * 6, 4.5, 3.5); }
  if(art === 'uhr'){ ctx.beginPath(); ctx.arc(24, 24, 20, 0, Math.PI * 2); ctx.moveTo(24, 10); ctx.lineTo(24, 24); ctx.lineTo(34, 30); ctx.stroke(); }
  if(art === 'ort'){ ctx.beginPath(); ctx.moveTo(24, 46); ctx.bezierCurveTo(17, 34, 5, 24, 6, 17); ctx.bezierCurveTo(6, -3, 42, -3, 42, 17);
    ctx.bezierCurveTo(43, 24, 31, 34, 24, 46); ctx.fill(); ctx.globalCompositeOperation = 'destination-out';
    ctx.beginPath(); ctx.arc(24, 17, 7, 0, 7); ctx.fill(); }
  ctx.restore(); }

function pkOrtKurz(ort){
  const teile = String(ort || '').split(',').map(x => x.trim());
