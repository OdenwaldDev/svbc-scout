  const vorschau=()=>{ const vorl=seiten.map(s=>Object.assign({},s,{bloecke:s.bloecke.map(b=>b.t==='bild'?Object.assign({},b,{pfad:b.vorschau||(b.vorschau=URL.createObjectURL(b.blob))}):b)}));
    const F=S.art==='deck'?simpFolienBauen(vorl,dok):simpSeitenBauen(vorl,dok); S.anzahl=F.length; const W=S.art==='deck'?1920:794, H=S.art==='deck'?1080:1123, b=S.art==='deck'?260:170, sc=b/W;
    box.innerHTML=`<p class="note">Aus ${stE(name)}${files.length>1?` und ${files.length-1} weiteren`:''}: ${seiten.length} ${seiten.length===1?'Abschnitt':'Abschnitte'}${bilderZahl?`, ${bilderZahl} ${bilderZahl===1?'Bild':'Bilder'}`:''}. Texte und Reihenfolge bleiben so, wie sie in deiner Datei stehen, das Aussehen kommt aus unserem CI.</p>
      <div class="simp-art" role="radiogroup" aria-label="Format"><button type="button" role="radio" aria-checked="${S.art==='deck'}" class="${S.art==='deck'?'on':''}" data-sa="deck">Präsentation 16:9</button><button type="button" role="radio" aria-checked="${S.art==='doc'}" class="${S.art==='doc'?'on':''}" data-sa="doc">Dokument A4</button></div>
      <div class="simp-vs">${F.map((f,i)=>`<div class="simp-v" style="width:${b}px;height:${Math.round(H*sc)}px"><div class="simp-vh" data-vi="${i}" style="width:${W}px;height:${H}px;transform:scale(${sc})"></div><small>${i+1}${f.label?' · '+stE(f.label.slice(0,28)):''}</small></div>`).join('')}</div>
      <label class="simp-tl">Titel <input type="text" id="simpTi" value="${stE(dok.slice(0,160))}" maxlength="160" enterkeyhint="done"></label>
      <div class="btnrow simp-los"><button type="button" class="btn" id="simpGo">${S.art==='deck'?F.length+' Folien':F.length+' Seiten'} anlegen</button><button type="button" class="btn ghost" id="simpZu">Abbrechen</button></div>`;
    box.querySelectorAll('[data-vi]').forEach(el=>{ const sr=el.attachShadow({mode:'open'}); sr.innerHTML=`<link rel="stylesheet" href="${ST_FONTS}"><div class="st-root" style="width:${W}px;height:${H}px">${F[+el.dataset.vi].html}</div>`; const sec=sr.querySelector('section'); if(sec){ sec.style.width=W+'px'; sec.style.height=H+'px'; } const lg=sr.querySelectorAll('img[src^="assets/"]'); lg.forEach(im=>{ try{ im.src=stUrl(im.getAttribute('src'))||im.src; }catch(e){} }); });
    box.querySelectorAll('[data-sa]').forEach(x=>x.onclick=()=>{ S.art=x.dataset.sa; vorschau(); });
    box.querySelector('#simpZu').onclick=()=>closeOverlay();
    box.querySelector('#simpGo').onclick=()=>anlegen(box.querySelector('#simpTi').value.trim()||dok); };
  const anlegen=async(titel)=>{ const go=box.querySelector('#simpGo'); go.disabled=true; box.querySelector('#simpZu').disabled=true; const fs=t=>{ go.textContent=t; };
    try{ fs('Bilder vorbereiten …'); const fehl=await simpBilderHochladen(seiten,stamm,fs);
      fs('Folien bauen …'); const F=S.art==='deck'?simpFolienBauen(seiten,titel):simpSeitenBauen(seiten,titel);
      const W=S.art==='deck'?1920:794, H=S.art==='deck'?1080:1123;
      const {data:p,error}=await SVB.sb.from('studio_projekte').insert({titel:titel.slice(0,160),art:S.art,breite:W,hoehe:H,css:'',quelle:'import',bereich:stStdBereich()}).select('id').single(); if(error)throw error;
      const rows=F.map((f,i)=>{ const d=document.createElement('div'); d.innerHTML=f.html; let k=0; d.querySelectorAll('*').forEach(e=>e.setAttribute('data-st-id','m'+(k++).toString(36))); return {projekt_id:p.id,pos:i+1,html:d.innerHTML,label:(f.label||'').slice(0,120),notiz:(f.notiz||'').slice(0,4000),skip:false}; });
      for(let i=0;i<rows.length;i+=10){ fs(`Speichern ${Math.min(rows.length,i+10)} von ${rows.length} …`); const {error:e2}=await SVB.sb.from('studio_folien').insert(rows.slice(i,i+10)); if(e2)throw e2; }
      seiten.forEach(s=>s.bloecke.forEach(b=>{ if(b.vorschau)URL.revokeObjectURL(b.vorschau); }));
      closeOverlay(); kToast(`✓ ${rows.length} ${S.art==='deck'?'Folien':'Seiten'} im Vereinsdesign angelegt${fehl?`, ${fehl} ${fehl===1?'Bild':'Bilder'} ließ${fehl===1?'':'en'} sich nicht laden`:''}`);
      await stProjekteLaden(); await stOeffnen(p.id); }
    catch(e){ go.disabled=false; box.querySelector('#simpZu').disabled=false; go.textContent='Nochmal versuchen'; kToast('⚠️ Anlegen ging nicht: '+(e.message||e)); } };
  vorschau(); }

// Einstieg: der Import-Knopf in der Projektliste nimmt jetzt alle Formate. Claude-Design-Dateien (.dc.html) gehen wie bisher.
{ const _imp=stImportDateien;
  stImportDateien=async function(files){ files=[...files];
    const dc=[]; const rest=[];
    for(const f of files){ if(/\.dc\.html?$/i.test(f.name))dc.push(f);
      else if(/\.html?$/i.test(f.name)){ const t=await f.text(); (/<(deck-stage|doc-page)\b|component-from-global-scope="deck-stage"/i.test(t)?dc:rest).push(new File([t],f.name,{type:'text/html'})); }
      else rest.push(f); }
    if(dc.length)await _imp(dc);
    // Nur Bilder ohne andere Datei: wie bisher in die Mediathek, außer der Import wurde ausdrücklich gewählt
    if(rest.length&&rest.every(f=>/^image\//.test(f.type))&&!SIMP.bilderAlsFolien){ await _imp(rest); return; }
    if(rest.length)await simpImport(rest); };
}
{ const _l=stListe;
  stListe=function(){ _l.apply(this,arguments); const P=document.querySelector('.st-liste'); if(!P)return;
    const lab=P.querySelector('.st-imp'); if(lab){ const inp=lab.querySelector('input'); lab.childNodes.forEach(n=>{ if(n.nodeType===3&&/importieren/.test(n.textContent))n.textContent=' Datei importieren'; });
      if(inp){ inp.accept='.pptx,.pdf,.docx,.html,.htm,.md,.txt,.odp,.odt,.rtf,image/*'; lab.title='PowerPoint, PDF, Word, HTML, Text oder Bilder: wird im Vereinsdesign angelegt'; } }
    if(!P.dataset.simpDrop&&stKann()){ P.dataset.simpDrop='1';
      P.addEventListener('dragover',e=>{ if([...(e.dataTransfer&&e.dataTransfer.types||[])].includes('Files')){ e.preventDefault(); P.classList.add('simp-ueber'); } });
      P.addEventListener('dragleave',e=>{ if(e.target===P)P.classList.remove('simp-ueber'); });
      P.addEventListener('drop',e=>{ const f=[...(e.dataTransfer&&e.dataTransfer.files||[])]; if(!f.length)return; e.preventDefault(); P.classList.remove('simp-ueber'); SIMP.bilderAlsFolien=true; stImportDateien(f).finally(()=>{ SIMP.bilderAlsFolien=false; }); }); } };
}

(function(){ try{ const s=document.createElement('style'); s.id='svm66css'; s.textContent="/* Studio: Datei importieren (Beta 0.72) */\n.simp-modal{max-width:min(1100px,96vw)}\n.simp .note{margin:0 0 12px}\n.simp-art{display:inline-flex;border:1px solid var(--line,#2a335f);border-radius:12px;overflow:hidden;margin:0 0 14px}\n.simp-art button{min-height:44px;padding:0 16px;background:transparent;color:inherit;border:0;font:inherit;font-weight:600;cursor:pointer}\n.simp-art button.on{background:#8fc9ec;color:#1d2760}\n.simp-vs{display:flex;flex-wrap:wrap;gap:12px;max-height:52vh;overflow:auto;padding:4px 2px 10px;-webkit-overflow-scrolling:touch}\n.simp-v{position:relative;flex:0 0 auto;display:flex;flex-direction:column;gap:6px}\n.simp-v .simp-vh{transform-origin:0 0;border-radius:2px;box-shadow:0 1px 0 rgba(0,0,0,.25),0 6px 18px rgba(0,0,0,.25);pointer-events:none}\n.simp-v>div:first-child{position:absolute;left:0;top:0}\n.simp-v small{position:absolute;left:0;right:0;top:100%;margin-top:4px;font-size:12px;opacity:.75;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}\n.simp-v{margin-bottom:22px}\n.simp-tl{display:flex;flex-direction:column;gap:6px;margin:6px 0 14px;font-weight:600}\n.simp-tl input{min-height:44px;font-size:16px}\n.simp-los .btn{min-height:44px}\n.st-liste.simp-ueber{outline:3px dashed #e8741f;outline-offset:6px;border-radius:12px}\n@media (max-width:600px){ .simp-vs{max-height:46vh} }\n"; document.head.appendChild(s); }catch(e){} })();
/* =====================================================================
   Beta 0.73 · Helfer: eigener Bereich (Seitenleiste „Helfer“, Adresse /helfer oder #helfer)
   - Vorne die Übersicht: Zahlen, Bereiche als Karten, „Als Nächstes“, darunter alle mit Suche und Filter
   - Bereich öffnen: WhatsApp-Gruppe hinterlegen, der Reihe nach per WhatsApp einladen, alle per Mail (BCC), Nummern kopieren
   - Person öffnen: alles, was sie eingetragen hat, Notiz, „in der Gruppe“, wer wann eingeladen hat
   - Excel (echte .xlsx) und Kontakte (vCard) für alle oder je Bereich
   Daten wie bisher aus helferpool_liste (Recht „orga“). Nachrichten gehen vom eigenen Handy raus, die App merkt sich nur, wer eingeladen ist.
   ===================================================================== */
const HF = { v:'start', b:null, q:'', f:'alle', mailOffen:null };
const HF_STATUS = [['alle','Alle'],['dabei','Dabei'],['unsicher','Noch unsicher'],['ohne','Ohne Bereich'],['nicht','Möchte nicht']];
SVR_TAB.helfer = 'orga';
SV_TBL.helfer = ['users','Helfer'];
Object.assign(SV_PAGES, { helfer:['Helfer','Wer mitmachen will, was jeder angekreuzt hat, direkt einladen'] });
{ const _ta = svTabAllowed; svTabAllowed = function(t){ if(t === 'helfer') return svRole() === 'admin' || svDarf('orga') === true; return _ta.apply(this, arguments); }; }
function hfPanel(){ let P = document.getElementById('panel-helfer'); if(P) return P;
  const ref = document.getElementById('panel-home') || document.querySelector('.panel'); if(!ref) return null;
  P = document.createElement('section'); P.className = 'panel'; P.id = 'panel-helfer'; ref.parentNode.insertBefore(P, ref.nextSibling); return P; }
{ const _gt = goTab; goTab = function(tab){ if(tab === 'helfer') hfPanel(); const war = svCurTab(); const r = _gt.apply(this, arguments);
  try{ if(svCurTab() === 'helfer' && war !== 'helfer'){ HF.v = 'start'; hfStart(); } }catch(e){ console.warn('Helfer', e); } return r; }; }
// Der alte Knopf bei den Aufgaben führt jetzt hierher; die Verwaltung der Anmeldung bleibt im alten Blatt
const hpOeffnenAlt = hpOeffnen;
hpOeffnen = function(){ try{ closeOverlay(); }catch(e){} goTab('helfer'); };
// Einladungstext ruhig und per Du (auch für das alte Blatt)
hpText = function(h, b){ return hfText(h, b); };

function hfE(s){ return svEsc(s == null ? '' : String(s)); }
function hfName(h){ return (h.vorname + ' ' + h.nachname).trim(); }
function hfStatus(h){ const b = h.bereiche || [];
  if(b.includes('nicht')) return 'nicht'; if(!b.length) return 'ohne';
  if(b.every(x => x === 'unsicher')) return 'unsicher'; return 'dabei'; }
function hfStatusText(h){ const s = hfStatus(h), b = h.bereiche || [];
  return s === 'dabei' ? (b.includes('unsicher') ? 'Dabei, teils unsicher' : 'Dabei') : s === 'unsicher' ? 'Noch unsicher' : s === 'ohne' ? 'Ohne Bereich' : 'Möchte nicht mithelfen'; }
function hfBereiche(h){ return (h.bereiche || []).filter(b => b !== 'unsicher' && b !== 'nicht'); }
function hfEingeladen(h){ return (h.einladungen || []).length > 0; }
function hfDatum(d){ try{ return new Date(d).toLocaleDateString('de-DE', { day:'2-digit', month:'2-digit' }); }catch(e){ return ''; } }
function hfText(h, b, alle){
  const link = ((HP.d && HP.d.gruppen) || {})[b], n = hpMeinName(), was = HP_B[b] || b, an = alle ? 'Hallo zusammen,' : `Hallo ${h.vorname},`;
  const gruss = n ? `\n\nViele Grüße\n${n}` : '';
  if(b === 'unsicher') return `${an}\n\ndu hattest angekreuzt, dass du noch nicht sicher bist, wo du beim SV/BSC mithelfen willst. Hast du in den nächsten Tagen kurz Zeit zum Telefonieren? Dann schauen wir zusammen, was zu dir passt.${gruss}`;
  const ihr = alle ? ['ihr', 'Ihr habt', 'euch'] : ['du', 'Du hast', 'dir'];
  return `${an}\n\ndanke, dass ${ihr[0]} beim SV/BSC mitmachen ${alle ? 'wollt' : 'willst'}. ${ihr[1]} „${was}“ angekreuzt. `
    + (link ? `Hier ist die WhatsApp-Gruppe dafür:\n${link}` : `Ich melde mich in den nächsten Tagen bei ${ihr[2]}, dann besprechen wir, wie es losgeht.`) + gruss; }
function hfWa(h, text){ return h.handy ? `https://wa.me/${h.handy.replace('+', '')}?text=${encodeURIComponent(text)}` : ''; }

async function hfStart(){
  const P = hfPanel(); if(!P) return;
  if(!svTabAllowed('helfer')){ P.innerHTML = '<div class="card"><div class="empty">Den Helferpool sieht das Orga-Team.</div></div>'; return; }
  if(!HP.d) P.innerHTML = '<div class="card"><div class="empty">Lade die Helfer …</div></div>';
  try{ await hpLaden(); }catch(e){ P.innerHTML = `<div class="card"><div class="empty">${hfE(e.message || e)}</div></div>`; return; }
  hfRender(); }
function hfRender(){ const P = hfPanel(); if(!P || !HP.d) return;
  if(HF.v === 'bereich' && HF.b) return hfBereichZeigen(P);
  hfUebersicht(P); }

/* ---------- Übersicht ---------- */
function hfAufgaben(H){ const A = [];
  H.forEach(h => { const s = hfStatus(h); if(s === 'nicht') return;
    if((h.bemerkung || '').match(/schwer lesbar|prüfen/i)) A.push([h, 'Nummer prüfen', h.bemerkung]);
    if(s === 'ohne') A.push([h, 'Bereich nachfragen', h.idee ? 'Nichts angekreuzt, Idee: ' + h.idee : 'Nichts angekreuzt']);
    if((h.bereiche || []).includes('unsicher')) A.push([h, 'Kurz anrufen', '„Noch unsicher“ angekreuzt']);
    else if(s === 'dabei' && !hfEingeladen(h)) A.push([h, 'Einladen', 'Noch in keine Gruppe eingeladen: ' + hfBereiche(h).map(b => HP_B[b] || b).join(', ')]);
  });
  const rang = { 'Nummer prüfen':0, 'Kurz anrufen':1, 'Bereich nachfragen':2, 'Einladen':3 };
  A.sort((a, b) => rang[a[1]] - rang[b[1]]);
  // Eine Zeile je Person: mehrere Gründe zusammen
  const je = new Map(); A.forEach(([h, was, warum]) => { const x = je.get(h.id); if(x){ x[1] += ', ' + was.toLowerCase(); x[2] += ' · ' + warum; } else je.set(h.id, [h, was, warum]); });
  return [...je.values()]; }
function hfUebersicht(P){
  const H = HP.d.helfer || [], G = HP.d.gruppen || {};
  const n = s => H.filter(h => hfStatus(h) === s).length;
  const wollen = n('dabei'), offen = n('unsicher') + n('ohne'), nichtEingeladen = H.filter(h => hfStatus(h) === 'dabei' && !hfEingeladen(h)).length;
  const inGruppe = H.filter(h => h.in_gruppe).length;
  const karte = b => { const L = H.filter(h => (h.bereiche || []).includes(b)), ne = L.filter(h => !hpEingeladen(h, b)).length;
    return `<button type="button" class="hf-bk${L.length ? '' : ' leer'}" data-hfb="${b}">
      <span class="hf-bk-t">${hfE(HP_B[b])}</span><b>${L.length}</b>
      <span class="hf-bk-s">${!L.length ? 'noch niemand' : ne ? ne + ' noch nicht eingeladen' : 'alle eingeladen'}</span>
      ${b !== 'unsicher' ? `<span class="hf-bk-g${G[b] ? ' an' : ''}">${G[b] ? 'WhatsApp-Gruppe hinterlegt' : 'Keine Gruppe hinterlegt'}</span>` : '<span class="hf-bk-g">am besten anrufen</span>'}</button>`; };
  const A = hfAufgaben(H);
  const q = HF.q.trim().toLowerCase(), ziff = HF.q.replace(/[^0-9]/g, '');
  const L = H.filter(h => (HF.f === 'alle' || hfStatus(h) === HF.f) && (!q || (hfName(h) + ' ' + (h.email || '') + ' ' + (h.idee || '') + ' ' + (h.mitgeben || '')).toLowerCase().includes(q)
    || (ziff.length >= 4 && (h.handy || '').replace(/^\+49/, '0').includes(ziff))));
  P.innerHTML = `<div class="hf">
    <div class="hf-zahlen">
      <div class="hf-z"><b>${H.length}</b><span>eingetragen</span></div>
      <div class="hf-z"><b>${wollen}</b><span>wollen mithelfen</span></div>
      <div class="hf-z${offen ? ' warn' : ''}"><b>${offen}</b><span>noch offen (unsicher oder ohne Bereich)</span></div>
      <div class="hf-z${nichtEingeladen ? ' warn' : ''}"><b>${nichtEingeladen}</b><span>noch nicht eingeladen</span></div>
      <div class="hf-z"><b>${inGruppe}</b><span>in einer Gruppe abgehakt</span></div>
    </div>
    <h3 class="hf-h">Bereiche</h3>
    <div class="hf-bereiche">${HP_REIHE.map(karte).join('')}</div>
    ${A.length ? `<h3 class="hf-h">Als Nächstes <i>${A.length}</i></h3>
    <div class="hf-liste hf-auf">${A.slice(0, 8).map(([h, was, warum]) => `<div class="hf-r">
      <button type="button" class="hf-r-k" data-hfp="${hfE(h.id)}"><b>${hfE(hfName(h))}</b><small><em>${hfE(was)}</em> · ${hfE(String(warum).slice(0, 120))}</small></button>
      <div class="hf-r-b">${hfKnoepfe(h, /^Einladen/.test(was) ? hfBereiche(h)[0] : (h.bereiche || []).includes('unsicher') ? 'unsicher' : null, !/^Einladen/.test(was))}</div></div>`).join('')}
      ${A.length > 8 ? `<p class="hf-mehr">${A.length - 8} weitere stehen unten in der Liste.</p>` : ''}</div>` : ''}
    <h3 class="hf-h">Alle <i>${L.length}</i></h3>
    <div class="hf-such"><input type="search" id="hfQ" placeholder="Name, Handynummer oder Stichwort" value="${hfE(HF.q)}" aria-label="Helfer suchen"></div>
    <div class="hf-filter" role="group" aria-label="Filter">${HF_STATUS.map(([k, t]) => `<button type="button" class="${HF.f === k ? 'on' : ''}" data-hff="${k}">${hfE(t)} <i>${k === 'alle' ? H.length : n(k)}</i></button>`).join('')}</div>
    <div class="hf-liste">${L.map(h => `<div class="hf-r">
      <button type="button" class="hf-r-k" data-hfp="${hfE(h.id)}"><b>${hfE(hfName(h))}</b>
        <small><span class="hf-st st-${hfStatus(h)}">${hfE(hfStatusText(h))}</span>${hfBereiche(h).length ? ' · ' + hfE(hfBereiche(h).map(b => HP_B[b] || b).join(', ')) : ''}${h.idee && !/^nein$/i.test(h.idee) ? ' · hat eine Idee' : ''}</small></button>
      <div class="hf-r-b">${hfKnoepfe(h, null, true)}</div></div>`).join('') || '<div class="empty">Niemand gefunden.</div>'}</div>
    <div class="hf-fuss">
      <button type="button" class="btn ghost sm" id="hfXlsx">${SVI('download')} Excel</button>
      <button type="button" class="btn ghost sm" id="hfVcf">${SVI('users')} Kontakte (vCard)</button>
      <button type="button" class="btn ghost sm" id="hfLink">${SVI('link')} Anmeldelink kopieren</button>
      ${svRole() === 'admin' ? `<button type="button" class="btn ghost sm" id="hfAdm">Anmeldung und Aushang</button>` : ''}
    </div></div>`;
  P.querySelectorAll('[data-hfb]').forEach(b => b.onclick = () => { HF.v = 'bereich'; HF.b = b.dataset.hfb; HF.mailOffen = null; hfRender(); window.scrollTo(0, 0); });
  P.querySelectorAll('[data-hff]').forEach(b => b.onclick = () => { HF.f = b.dataset.hff; hfRender(); });
  P.querySelectorAll('[data-hfp]').forEach(b => b.onclick = () => hfPerson(b.dataset.hfp));
  const s = P.querySelector('#hfQ'); if(s) s.oninput = () => { HF.q = s.value; const pos = s.selectionStart; hfRender(); const n2 = document.getElementById('hfQ'); if(n2){ n2.focus(); try{ n2.setSelectionRange(pos, pos); }catch(e){} } };
  hfKnoepfeBinden(P);
  P.querySelector('#hfXlsx').onclick = () => hfExcel(H, 'Helferpool-SV-BSC');
  P.querySelector('#hfVcf').onclick = () => hpDatei('vcf');
  P.querySelector('#hfLink').onclick = async () => { const u = HP_LINK + 'jhv26'; try{ await navigator.clipboard.writeText(u); kToast('✓ Link kopiert'); }catch(e){ kToast(u); } };
  const adm = P.querySelector('#hfAdm'); if(adm) adm.onclick = () => hpOeffnenAlt();
}
// Kontaktknöpfe: WhatsApp (mit Einladung, wenn ein Bereich mitgegeben ist), Anrufen, Mail
function hfKnoepfe(h, b, klein){
  const text = b ? hfText(h, b) : `Hallo ${h.vorname},\n\n`;
  const wa = hfWa(h, text), mail = h.email ? `mailto:${encodeURIComponent(h.email)}?subject=${encodeURIComponent(b ? 'Mitmachen beim SV/BSC: ' + (HP_B[b] || b) : 'SV/BSC Mörlenbach')}&body=${encodeURIComponent(text)}` : '';
  return `${wa ? `<a class="btn sm${klein ? ' ghost' : ''}" href="${hfE(wa)}" target="_blank" rel="noopener" data-hfe="${hfE(h.id)}" data-b="${hfE(b || '')}" data-art="whatsapp">${SVI('chat')}${b && b !== 'unsicher' ? ' Einladen' : ' WhatsApp'}</a>` : ''}
    ${h.handy ? `<a class="btn ghost sm" href="tel:${hfE(h.handy)}" data-hfe="${hfE(h.id)}" data-b="${hfE(b || '')}" data-art="anruf" aria-label="${hfE(hfName(h))} anrufen" title="Anrufen">${SVI('phone')}</a>` : ''}
    ${mail ? `<a class="btn ghost sm" href="${hfE(mail)}" data-hfe="${hfE(h.id)}" data-b="${hfE(b || '')}" data-art="mail" aria-label="Mail an ${hfE(hfName(h))}" title="Mail">${SVI('mail')}</a>` : ''}`; }
function hfKnoepfeBinden(R){
  R.querySelectorAll('[data-hfe]').forEach(a => a.addEventListener('click', () => { const b = a.dataset.b; if(!b) return;
    const id = a.dataset.hfe, art = a.dataset.art;
    ogRpc('helfer_einladung_merken', { p_helfer:id, p_bereich:b, p_art:art }).then(() => {
      const h = (HP.d.helfer || []).find(x => x.id === id); if(h) h.einladungen = (h.einladungen || []).concat([{ bereich:b, art, am:new Date().toISOString(), von:hpMeinName() }]);
      setTimeout(() => { if(svCurTab() === 'helfer') hfRender(); }, 500); }).catch(e => kToast('⚠️ ' + (e.message || e))); })); }

/* ---------- Ein Bereich ---------- */
function hfBereichZeigen(P){
  const b = HF.b, H = HP.d.helfer || [], link = (HP.d.gruppen || {})[b], L = H.filter(h => (h.bereiche || []).includes(b));
  const ne = L.filter(h => !hpEingeladen(h, b)), mails = L.filter(h => h.email), nurMail = ne.filter(h => !h.handy && h.email);
  P.innerHTML = `<div class="hf">
    <button type="button" class="hf-zur" id="hfZur">${SVI('chev')} Alle Bereiche</button>
    <div class="hf-bkopf"><h2>${hfE(HP_B[b] || b)}</h2><span>${L.length} ${L.length === 1 ? 'Person' : 'Personen'} · ${ne.length ? ne.length + ' noch nicht eingeladen' : 'alle eingeladen'}</span></div>
    ${b === 'unsicher' ? '<p class="note">Hier hilft ein kurzer Anruf am meisten: herausfinden, was passt. „WhatsApp“ schickt eine Bitte um ein Telefonat.</p>' : `
    <div class="card hf-gruppe">
      <label for="hfGl">WhatsApp-Gruppe für „${hfE(HP_B[b])}“</label>
      <div class="hf-gl"><input id="hfGl" inputmode="url" placeholder="https://chat.whatsapp.com/…" value="${hfE(link || '')}"><button type="button" class="btn sm" id="hfGs">Speichern</button></div>
      <small>${link ? 'Der Link geht bei jeder Einladung mit.' : 'Ohne Link schreibt die Einladung, dass du dich meldest. Link in WhatsApp unter Gruppeninfo, „Per Link einladen“.'}</small>
    </div>`}
    <div class="hf-aktion">
      ${mails.length ? `<a class="btn ghost sm" id="hfMailAlle" href="mailto:?bcc=${hfE(mails.map(h => encodeURIComponent(h.email)).join(','))}&subject=${encodeURIComponent('Mitmachen beim SV/BSC: ' + (HP_B[b] || b))}&body=${encodeURIComponent(hfText({ vorname:'' }, b, true))}">${SVI('mail')} Mail an alle (${mails.length}, BCC)</a>` : ''}
      <button type="button" class="btn ghost sm" id="hfNr">${SVI('copy')} Nummern kopieren</button>
      <button type="button" class="btn ghost sm" id="hfBX">${SVI('download')} Excel</button>
      <button type="button" class="btn ghost sm" id="hfBV">${SVI('users')} Kontakte</button>
    </div>
    ${HF.mailOffen === b ? `<div class="card hf-merk"><span>Mail an alle verschickt?</span><button type="button" class="btn sm" id="hfMailJa">Alle mit Mail als eingeladen merken</button><button type="button" class="btn ghost sm" id="hfMailNein">Nein</button></div>` : ''}
    ${ne.filter(h => h.handy).length > 1 ? `<p class="note small">WhatsApp lädt immer eine Person ein. Einfach der Reihe nach „Einladen“ tippen, die Liste merkt sich, wer schon dran war.</p>` : ''}
    ${nurMail.length ? `<p class="note small">${nurMail.map(hfName).join(', ')} ${nurMail.length === 1 ? 'hat' : 'haben'} keine Handynummer, nur Mail.</p>` : ''}
    <div class="hf-liste">${L.map(h => { const e = hpEingeladen(h, b);
      return `<div class="hf-r${e ? ' erledigt' : ''}"><button type="button" class="hf-r-k" data-hfp="${hfE(h.id)}"><b>${hfE(hfName(h))}</b>
        <small>${h.handy ? hfE(hpZeigeNr(h.handy)) : hfE(h.email || 'kein Kontakt')}${(h.bereiche || []).length > 1 ? ' · auch: ' + hfE(h.bereiche.filter(x => x !== b).map(x => HP_B[x] || x).join(', ')) : ''}</small>
        ${e ? `<small class="hf-ok">${SVI('check')} eingeladen am ${hfE(hfDatum(e.am))}${e.von ? ' von ' + hfE(e.von) : ''} (${hfE({ whatsapp:'WhatsApp', mail:'Mail', anruf:'Anruf', gruppe:'Gruppe' }[e.art] || e.art)})</small>` : ''}</button>
        <div class="hf-r-b">${hfKnoepfe(h, b, !!e)}</div></div>`; }).join('') || '<div class="empty">Noch niemand hat diesen Bereich angekreuzt.</div>'}</div></div>`;
  P.querySelector('#hfZur').onclick = () => { HF.v = 'start'; hfRender(); };
  const gs = P.querySelector('#hfGs'); if(gs) gs.onclick = async () => { const v = P.querySelector('#hfGl').value.trim();
    if(v && !/^https:\/\/chat\.whatsapp\.com\//.test(v)) return kToast('Bitte einen Gruppenlink von WhatsApp einfügen (https://chat.whatsapp.com/…)');
    try{ await ogRpc('helfer_bereich_gruppe', { p_bereich:b, p_wa:v }); HP.d.gruppen = HP.d.gruppen || {}; if(v) HP.d.gruppen[b] = v; else delete HP.d.gruppen[b];
      kToast(v ? '✓ Gruppenlink gespeichert' : 'Gruppenlink entfernt'); hfRender(); }catch(e){ kToast('⚠️ ' + (e.message || e)); } };
  const ma = P.querySelector('#hfMailAlle'); if(ma) ma.addEventListener('click', () => { HF.mailOffen = b; setTimeout(hfRender, 300); });
  const mj = P.querySelector('#hfMailJa'); if(mj) mj.onclick = () => paEinmalSicher(mj, async () => {
    for(const h of mails) if(!hpEingeladen(h, b)){ try{ await ogRpc('helfer_einladung_merken', { p_helfer:h.id, p_bereich:b, p_art:'mail' }); h.einladungen = (h.einladungen || []).concat([{ bereich:b, art:'mail', am:new Date().toISOString(), von:hpMeinName() }]); }catch(e){ kToast('⚠️ ' + (e.message || e)); break; } }
    HF.mailOffen = null; kToast('✓ Als eingeladen gemerkt'); hfRender(); });
  const mn = P.querySelector('#hfMailNein'); if(mn) mn.onclick = () => { HF.mailOffen = null; hfRender(); };
  P.querySelector('#hfNr').onclick = async () => { const t = L.filter(h => h.handy).map(h => hfName(h) + ': ' + hpZeigeNr(h.handy)).join('\n'); if(!t) return kToast('Keine Nummern');
    try{ await navigator.clipboard.writeText(t); kToast('✓ Nummern kopiert'); }catch(e){ kToast(t); } };
  P.querySelector('#hfBX').onclick = () => hfExcel(L, 'Helfer-' + (HP_B[b] || b).replace(/[^A-Za-zÄÖÜäöüß]+/g, '-'));
  P.querySelector('#hfBV').onclick = () => { const alt = HP.d.helfer; HP.d.helfer = L; try{ hpDatei('vcf'); }finally{ HP.d.helfer = alt; } };
  P.querySelectorAll('[data-hfp]').forEach(x => x.onclick = () => hfPerson(x.dataset.hfp));
  hfKnoepfeBinden(P);
}
function paEinmalSicher(b, fn){ return typeof paEinmal === 'function' ? paEinmal(b, fn, 'Speichert …') : fn(); }

/* ---------- Eine Person ---------- */
function hfPerson(id){
  const h = (HP.d.helfer || []).find(x => x.id === id); if(!h) return;
  const reihe = (k, v) => v ? `<div class="hf-pz"><span>${hfE(k)}</span><div>${v}</div></div>` : '';
  const absatz = t => hfE(t).replace(/\n/g, '<br>');
  const M = svModal(`<div class="og-form hf-person">
    <div class="hf-pk"><h2>${hfE(hfName(h))}</h2><span class="hf-st st-${hfStatus(h)}">${hfE(hfStatusText(h))}</span></div>
    <div class="hf-r-b hf-pb">${hfKnoepfe(h, null, false)}</div>
    ${reihe('Handy', h.handy ? hfE(hpZeigeNr(h.handy)) : '')}${reihe('E-Mail', h.email ? hfE(h.email) : '')}${reihe('Alter', h.alter != null ? hfE(h.alter) + ' Jahre' : '')}
    ${reihe('Bereiche', (h.bereiche || []).length ? (h.bereiche || []).map(b => `<span class="hf-chip">${hfE(HP_B[b] || b)}</span>`).join(' ') : 'nichts angekreuzt')}
    ${reihe('Idee', h.idee && !/^nein$/i.test(h.idee) ? absatz(h.idee) : '')}
    ${reihe('Nachricht an uns', h.mitgeben && !/^nein$/i.test(h.mitgeben) ? absatz(h.mitgeben) : '')}
    ${reihe('Gruppenlink', h.geklickt ? `getippt am ${hfE(hfDatum(h.geklickt))}${h.klicks > 1 ? ` (${hfE(h.klicks)} Mal)` : ''}` : 'noch nicht getippt')}
    ${reihe('Eingeladen', (h.einladungen || []).length ? h.einladungen.map(e => `${hfE(HP_B[e.bereich] || e.bereich)}: ${hfE(hfDatum(e.am))}${e.von ? ' von ' + hfE(e.von) : ''}`).join('<br>') : '')}
    ${reihe('Angemeldet', `${hfE(hfDatum(h.am))}${h.quelle ? ' · ' + hfE(h.quelle) : ''}`)}
    <label class="hf-drin"><input type="checkbox" id="hfIg"${h.in_gruppe ? ' checked' : ''}> In einer WhatsApp-Gruppe</label>
    <label class="pk-f hf-notiz"><span>Notiz fürs Team</span><textarea id="hfNo" rows="3" maxlength="300">${hfE(h.bemerkung || '')}</textarea></label>
    <div class="btnrow"><button type="button" class="btn" id="hfPs">Speichern</button></div></div>`);
  hfKnoepfeBinden(M);
  const s = M.querySelector('#hfPs'); s.onclick = () => paEinmalSicher(s, async () => {
    const p = { in_gruppe:M.querySelector('#hfIg').checked, bemerkung:M.querySelector('#hfNo').value };
    try{ await ogRpc('helferpool_aendern', { p_id:h.id, p }); h.in_gruppe = p.in_gruppe; h.bemerkung = p.bemerkung.trim() || null; kToast('✓ Gespeichert'); closeOverlay(); hfRender(); }
    catch(e){ kToast('⚠️ ' + (e.message || e)); } }); }

/* ---------- Excel (.xlsx) mit JSZip aus der App, ohne fremden Dienst ---------- */
async function hfExcel(L, name){
  if(!L.length) return kToast('Noch niemand eingetragen');
  try{
    await sxScript('vendor/jszip.min.js', () => window.JSZip); const zip = new window.JSZip();
    const kopf = ['Vorname','Nachname','Status','Bereiche','Handy','E-Mail','Alter','Idee','Nachricht an uns','Notiz','Gruppenlink getippt','In der Gruppe','Eingeladen','Angemeldet'];
    const zeilen = L.slice().sort((a, b) => (a.nachname + a.vorname).localeCompare(b.nachname + b.vorname, 'de')).map(h => [h.vorname, h.nachname, hfStatusText(h),
      hfBereiche(h).map(b => HP_B[b] || b).join(', '), h.handy ? hpZeigeNr(h.handy) : '', h.email || '', h.alter != null ? h.alter : '',
      /^nein$/i.test(h.idee || '') ? '' : h.idee || '', /^nein$/i.test(h.mitgeben || '') ? '' : h.mitgeben || '', h.bemerkung || '',
      h.geklickt ? hfDatum(h.geklickt) + (h.klicks > 1 ? ` (${h.klicks}×)` : '') : 'nein', h.in_gruppe ? 'ja' : 'nein',
      (h.einladungen || []).map(e => (HP_B[e.bereich] || e.bereich) + ' ' + hfDatum(e.am)).join(', '), hfDatum(h.am)]);
    const x = s => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/[\u0000-\u0008\u000b\u000c\u000e-\u001f]/g, '');
    const sp = i => { let s = ''; i++; while(i){ const m = (i - 1) % 26; s = String.fromCharCode(65 + m) + s; i = Math.floor((i - 1) / 26); } return s; };
    const zelle = (v, r, c, st) => typeof v === 'number' ? `<c r="${sp(c)}${r}"${st ? ' s="1"' : ''}><v>${v}</v></c>` : `<c r="${sp(c)}${r}" t="inlineStr"${st ? ' s="1"' : ''}><is><t xml:space="preserve">${x(v)}</t></is></c>`;
    const rows = [kopf, ...zeilen].map((z, r) => `<row r="${r + 1}">${z.map((v, c) => zelle(v, r + 1, c, r === 0)).join('')}</row>`).join('');
    const breiten = [12,14,20,34,15,30,7,50,44,30,16,12,30,12].map((w, i) => `<col min="${i + 1}" max="${i + 1}" width="${w}" customWidth="1"/>`).join('');
    const ende = sp(kopf.length - 1) + (zeilen.length + 1);
    zip.file('[Content_Types].xml', '<?xml version="1.0" encoding="UTF-8" standalone="yes"?><Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types"><Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/><Default Extension="xml" ContentType="application/xml"/><Override PartName="/xl/workbook.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet.main+xml"/><Override PartName="/xl/worksheets/sheet1.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.worksheet+xml"/><Override PartName="/xl/styles.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.styles+xml"/></Types>');
    zip.file('_rels/.rels', '<?xml version="1.0" encoding="UTF-8" standalone="yes"?><Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships"><Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="xl/workbook.xml"/></Relationships>');
    zip.file('xl/workbook.xml', '<?xml version="1.0" encoding="UTF-8" standalone="yes"?><workbook xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main" xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships"><sheets><sheet name="Helfer" sheetId="1" r:id="rId1"/></sheets></workbook>');
    zip.file('xl/_rels/workbook.xml.rels', '<?xml version="1.0" encoding="UTF-8" standalone="yes"?><Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships"><Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/worksheet" Target="worksheets/sheet1.xml"/><Relationship Id="rId2" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/styles" Target="styles.xml"/></Relationships>');
    zip.file('xl/styles.xml', '<?xml version="1.0" encoding="UTF-8" standalone="yes"?><styleSheet xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main"><fonts count="2"><font><sz val="10"/><name val="Arial"/></font><font><b/><sz val="10"/><color rgb="FFFFFFFF"/><name val="Arial"/></font></fonts><fills count="3"><fill><patternFill patternType="none"/></fill><fill><patternFill patternType="gray125"/></fill><fill><patternFill patternType="solid"><fgColor rgb="FF1D2760"/></patternFill></fill></fills><borders count="1"><border/></borders><cellStyleXfs count="1"><xf/></cellStyleXfs><cellXfs count="2"><xf fontId="0" fillId="0" applyAlignment="1"><alignment vertical="top" wrapText="1"/></xf><xf fontId="1" fillId="2" applyFont="1" applyFill="1"/></cellXfs></styleSheet>');
    zip.file('xl/worksheets/sheet1.xml', `<?xml version="1.0" encoding="UTF-8" standalone="yes"?><worksheet xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main"><sheetViews><sheetView workbookViewId="0"><pane ySplit="1" topLeftCell="A2" activePane="bottomLeft" state="frozen"/></sheetView></sheetViews><cols>${breiten}</cols><sheetData>${rows}</sheetData><autoFilter ref="A1:${ende}"/></worksheet>`);
    const blob = await zip.generateAsync({ type:'blob', mimeType:'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
    const a = document.createElement('a'); a.href = URL.createObjectURL(blob); a.download = name + '.xlsx'; document.body.appendChild(a); a.click();
    setTimeout(() => { URL.revokeObjectURL(a.href); a.remove(); }, 1500); kToast('✓ Excel gespeichert');
  }catch(e){ kToast('Excel ging nicht, nimm die Kontakte oder versuch es noch einmal'); console.warn('Helfer Excel', e); } }

(function(){ try{ const s=document.createElement('style'); s.id='svm67css'; s.textContent="/* Helfer (Beta 0.73): Übersicht, Bereiche, Liste. Ruhig, gleiche Bausteine wie Partner. */\n.hf{display:grid;gap:12px;max-width:1080px}\n.hf-zahlen{display:grid;grid-template-columns:repeat(auto-fit,minmax(150px,1fr));gap:10px}\n.hf-z{display:grid;gap:3px;padding:14px 16px;border-radius:var(--r-lg);border:1px solid var(--line);background:var(--card);min-height:76px}\n.hf-z b{font-size:24px;font-weight:800;letter-spacing:-.02em;font-variant-numeric:tabular-nums}\n.hf-z span{font-size:12.5px;color:var(--ink2);line-height:1.3}\n.hf-z.warn b{color:#f59e0b} html[data-theme=\"hell\"] .hf-z.warn b{color:#a35a00}\n.hf-h{display:flex;align-items:center;gap:8px;font-size:17px;font-weight:750;margin:14px 2px 0;letter-spacing:-.01em}\n.hf-h i{font-style:normal;font-size:12px;font-weight:700;color:var(--ink2);background:var(--card2);padding:2px 8px;border-radius:10px}\n.hf-bereiche{display:grid;grid-template-columns:repeat(auto-fill,minmax(220px,1fr));gap:10px}\n.hf-bk{display:grid;grid-template-columns:1fr auto;gap:4px 10px;align-items:baseline;text-align:left;padding:14px 16px;border-radius:var(--r-lg);border:1px solid var(--line);background:var(--card);color:inherit;font:inherit;cursor:pointer;min-height:96px}\n.hf-bk:hover{border-color:color-mix(in srgb,var(--accent) 50%,var(--line))}\n.hf-bk-t{font-size:15px;font-weight:700;line-height:1.3}\n.hf-bk b{font-size:24px;font-weight:800;font-variant-numeric:tabular-nums}\n.hf-bk-s,.hf-bk-g{grid-column:1/-1;font-size:12.5px;color:var(--ink2)}\n.hf-bk-g{display:flex;align-items:center;gap:6px}\n.hf-bk-g::before{content:\"\";width:7px;height:7px;border-radius:50%;background:var(--line)}\n.hf-bk-g.an::before{background:#22c55e}\n.hf-bk.leer{opacity:.6}\n.hf-liste{display:grid;gap:8px}\n.hf-r{display:flex;align-items:center;justify-content:space-between;gap:12px;padding:10px 12px 10px 14px;border-radius:var(--r-lg);border:1px solid var(--line);background:var(--card)}\n.hf-r.erledigt{opacity:.78}\n.hf-r-k{display:grid;gap:3px;min-width:0;flex:1;text-align:left;background:none;border:0;padding:4px 0;color:inherit;font:inherit;cursor:pointer}\n.hf-r-k b{font-size:15px}\n.hf-r-k small{font-size:12.5px;color:var(--ink2);line-height:1.4}\n.hf-r-k em{font-style:normal;font-weight:700;color:var(--ink)}\n.hf-r-b{display:flex;gap:6px;flex:none;align-items:center}\n.hf-r-b .btn{min-height:40px;display:inline-flex;align-items:center;gap:6px}\n.hf-r-b .btn svg{width:18px;height:18px}\n.hf-ok{display:flex;align-items:center;gap:4px;color:#16a34a!important} .hf-ok svg{width:14px;height:14px}\n.hf-st{font-weight:700}\n.hf-st.st-dabei{color:#16a34a} .hf-st.st-unsicher,.hf-st.st-ohne{color:#d97706} .hf-st.st-nicht{color:var(--ink2)}\nhtml[data-theme=\"hell\"] .hf-st.st-dabei{color:#15803d} html[data-theme=\"hell\"] .hf-st.st-unsicher,html[data-theme=\"hell\"] .hf-st.st-ohne{color:#a35a00}\n.hf-mehr{margin:2px 4px;font-size:12.5px;color:var(--ink2)}\n.hf-such input{width:100%;min-height:46px;padding:0 14px;font-size:16px;border-radius:12px;border:1px solid var(--line);background:var(--card);color:var(--ink)}\n.hf-filter{display:flex;gap:6px;flex-wrap:wrap}\n.hf-filter button{min-height:36px;padding:0 12px;border-radius:18px;border:1px solid var(--line);background:var(--card);color:var(--ink);font:inherit;font-size:13px;font-weight:600;cursor:pointer}\n.hf-filter button i{font-style:normal;color:var(--ink2);margin-left:2px}\n.hf-filter button.on{background:var(--accent);border-color:var(--accent);color:#fff} .hf-filter button.on i{color:rgba(255,255,255,.8)}\n.hf-fuss{display:flex;gap:8px;flex-wrap:wrap;margin-top:6px}\n.hf-zur{display:inline-flex;align-items:center;gap:4px;justify-self:start;background:none;border:0;padding:6px 0;color:var(--accent);font:inherit;font-weight:650;cursor:pointer}\n.hf-zur svg{width:16px;height:16px;transform:rotate(180deg)}\n.hf-bkopf h2{margin:0;font-size:22px;letter-spacing:-.01em} .hf-bkopf span{font-size:13px;color:var(--ink2)}\n.hf-gruppe{display:grid;gap:8px;padding:14px 16px}\n.hf-gruppe label{font-weight:700;font-size:14px} .hf-gruppe small{font-size:12.5px;color:var(--ink2)}\n.hf-gl{display:flex;gap:8px} .hf-gl input{flex:1;min-width:0;min-height:42px;padding:0 12px;border-radius:10px;border:1px solid var(--line);background:var(--surface);color:var(--ink);font-size:15px}\n.hf-aktion{display:flex;gap:8px;flex-wrap:wrap}\n.hf-aktion .btn{display:inline-flex;align-items:center;gap:6px} .hf-aktion svg,.hf-fuss svg{width:16px;height:16px}\n.hf-merk{display:flex;gap:8px;flex-wrap:wrap;align-items:center;padding:12px 14px} .hf-merk span{font-weight:650;margin-right:auto}\n.hf-person{display:grid;gap:10px}\n.hf-pk{display:flex;align-items:baseline;gap:10px;flex-wrap:wrap} .hf-pk h2{margin:0}\n.hf-pb{justify-content:flex-start;margin-bottom:4px}\n.hf-pz{display:grid;grid-template-columns:130px 1fr;gap:10px;padding:8px 0;border-top:1px solid var(--line);font-size:14px;line-height:1.45}\n.hf-pz>span{color:var(--ink2);font-size:13px}\n.hf-chip{display:inline-block;padding:2px 9px;border-radius:12px;background:var(--card2);font-size:12.5px;margin:0 4px 4px 0}\n.hf-drin{display:flex;align-items:center;gap:10px;min-height:40px;font-weight:600}\n@media (max-width:620px){\n  .hf-r{flex-direction:column;align-items:stretch;gap:6px}\n  .hf-r-b{justify-content:flex-start}\n  .hf-pz{grid-template-columns:1fr;gap:2px}\n  .hf-zahlen{grid-template-columns:repeat(2,1fr)}\n  .hf-z:last-child:nth-child(odd){grid-column:1/-1;min-height:0}\n  .hf-bk{min-height:0;padding:12px 14px}\n}\n.hf-pk{padding-right:44px}\n.hf-notiz textarea{width:100%;min-height:80px;padding:10px 12px;border-radius:10px;border:1px solid var(--line);background:var(--surface);color:var(--ink);font:inherit;font-size:15px;line-height:1.45;resize:vertical}\n"; document.head.appendChild(s); }catch(e){} })();
/* =====================================================================
   Sportzentrale Beta 0.61 · Heute: jede Rolle sieht zuerst, was sie am häufigsten braucht
   Nach Apples Human Interface Guidelines (Tab Bars, Navigation, Design Principles):
   - Tab-Leiste: höchstens vier Ziele plus Mehr, nur Navigation, klare Namen. „Home“ heißt jetzt „Heute“.
   - Startseite: oben eine kurze Liste der häufigsten Bereiche je Rolle, im Stil einer iPhone-Einstellungsliste
     (farbiges Symbol, Titel, eine Zeile Stand, Pfeil). Ein Zähler erscheint nur, wenn etwas wirklich ansteht.
   - Progressive Disclosure: Die langen Scouting-Listen stehen weiter auf der Startseite, aber zugeklappt
     (außer für Planer, die damit arbeiten). Ein Tipp klappt sie auf, die Wahl bleibt gespeichert.
   - Schnellknöpfe im Cockpit entfallen, weil die neue Liste dasselbe besser zeigt. Hinweise und Lagebild bleiben.
   ===================================================================== */
const HT={plan:null,planAm:0,planLaedt:false};
const htE=s=>svEsc(s==null?'':String(s));

// Tab-Leiste je Rolle: vier Ziele plus Mehr
// Trainer und Planer behalten ihre Leiste (Mannschaft, Kader, Scouting), die Kabine wohnt in der Mannschaft
Object.assign(SV_TABBAR,{vorstand:['home','planung','training','scout'],admin:['home','planung','training','scout']});
SV_TBL.home=['home','Heute']; SV_PAGES.home=['Heute','Was du am häufigsten brauchst'];

// Je Rolle die häufigsten Ziele, in dieser Reihenfolge. [Tab, Symbol, Titel, Farbe, Zusatz]
const HT_ZIEL={
  leitung:  ['planung','check','Abteilungsleitung','#5b6cff'],
  planung:  ['planung','check','Planung','#5b6cff'],
  kalender: ['kalender','cal','Termine','#f0524f'],
  training: ['training','activity','Mannschaft','#22a85a'],
  sptag:    ['sptag','mic','Mein Spieltag','#f59e0b'],
  elf:      ['elf','pitch','Aufstellung','#14a3a3'],
  kabine:   ['kabine','users','Kabine','#0ea5e9'],
  kader:    ['kader','pitch','Kader','#14a3a3'],
  scout:    ['scout','search','Scouting','#3b82f6'],
  kandidaten:['kandidaten','kand','Kandidaten','#8b5cf6'],
  sponsoring:['sponsoring','heart','Partner','#ec4899'],
  plakat:   ['plakat','camera','Spieltagsstudio','#f97316'],
  orga:     ['orga','check','Checklisten','#64748b'],
  kasse:    ['kasse','wallet','Kasse','#16a34a'],
  teams:    ['teams','sprout','Eigene Jugend','#22a85a'],
  verein:   ['verein','trophy','Verein','#eab308']
};
const HT_ROLLE={
  vorstand:{h:'Für den Vorstand',z:['leitung','kalender','training','sponsoring','plakat','orga']},
  admin:   {h:'Für den Vorstand',z:['leitung','kalender','training','sponsoring','plakat','orga']},
  planer:  {h:'Für die Kaderplanung',z:['training','kader','scout','kandidaten','sptag','kalender']},
  trainer: {h:'Für dein Team',z:['training','sptag','elf','kabine','kalender','kasse']},
  jugend:  {h:'Für die Jugend',z:['teams','kalender','planung','orga']},
  viewer:  {h:'Für dich',z:['kalender','verein','scout']}
};
// Eine Zeile Stand unter dem Titel, ohne Laden: was man dort tut
const HT_TEXT={leitung:'Themen für die Runde, To-dos, Beschlüsse',planung:'Projekte und Aufgaben',kalender:'Spiele, Veranstaltungen, Geburtstage',
  training:'Training, Spiele, Spieler',sptag:'Dein Einsatz am Spieltag',elf:'Startelf und Bank',kabine:'Was im Team gerade los ist',kader:'Wer spielt wo, Bedarf',
  scout:'Spieler der Region',kandidaten:'Wen wir gerade ansprechen',sponsoring:'Partner betreuen und gewinnen',plakat:'Plakat und Texte zum nächsten Spiel',
  orga:'Heimspiele und Veranstaltungen abhaken',kasse:'Mannschaftskasse',teams:'Mannschaften und Trainer',verein:'Rankings, Helfer, Allzeit'};

function htHeute(){ const d=new Date(); return d.getFullYear()+'-'+String(d.getMonth()+1).padStart(2,'0')+'-'+String(d.getDate()).padStart(2,'0'); }
function htDarfLeitung(){ try{ return svRole()==='admin'||(typeof svDarf==='function'&&svDarf('planung:leitung')===true); }catch(e){ return false; } }

// Planung still nachladen (höchstens einmal pro Minute), damit die Zahlen stimmen
async function htPlanHolen(){
  if(HT.planLaedt||Date.now()-HT.planAm<60000)return; if(typeof plDarf!=='function'||!plDarf())return;
  HT.planLaedt=true;
  try{ const d=(typeof PL!=='undefined'&&PL.d&&Date.now()-HT.planAm<5000)?PL.d:await ogRpc('plan_laden'); HT.plan=d; HT.planAm=Date.now(); if(typeof PL!=='undefined'&&!PL.d)PL.d=d; }
  catch(e){ HT.planAm=Date.now(); }
  finally{ HT.planLaedt=false; }
  if(svCurTab()==='home')htRender();
}

// Zahlen und Stand je Ziel: {t: Text, n: Zähler (nur wenn etwas ansteht), dringend}
function htStand(k){
  const h=htHeute();
  if((k==='leitung'||k==='planung')&&HT.plan){ const A=(HT.plan.aufgaben||[]).filter(a=>a.status!=='erledigt'&&a.status!=='idee');
    const ich=HT.plan.ich, meine=A.filter(a=>a.wer===ich), faellig=meine.filter(a=>a.faellig&&a.faellig<=h).length;
    if(k==='leitung'){ const L=A.filter(a=>a.bereich==='leitung'), runde=L.filter(a=>a.sitzung).length, wartet=L.filter(a=>a.status==='wartet').length;
      const teile=[runde?runde+(runde===1?' Thema':' Themen')+' für die Runde':'',wartet?wartet+(wartet===1?' wartet':' warten'):''].filter(Boolean);
      return {t:teile.join(', ')||'Nichts offen',n:faellig,dringend:faellig>0}; }
    return {t:meine.length?meine.length+(meine.length===1?' Aufgabe':' Aufgaben')+' bei dir':'Nichts offen bei dir',n:faellig,dringend:faellig>0}; }
  if(k==='kalender'){ try{ if(typeof KAL!=='undefined'&&KAL.loaded){ const i=kalSichtbar().find(x=>(x.bis||x.d)>=h);
      if(i){ const wann=kalRel(i.d)||(kalWt(i.d)+'., '+kalDM(i.d)), was=i.k==='spiel'?(kalTeamName(i.m)+(i.heim===false?' bei ':' gegen ')+(i.gegner||'')+(i.z?', '+i.z+' Uhr':'')+(i.treff&&i.treff.z?', Treffpunkt '+i.treff.z+' Uhr':'')).trim():(i.k==='event'||i.k==='training')?((i.t||'Termin')+(i.k==='training'&&i.z?', '+i.z+' Uhr':'')):('Geburtstag '+(i.t||'')).trim();
        return {t:wann+': '+was,n:0,heute:i.d===h}; } return {t:'Gerade steht nichts an',n:0}; } }catch(e){} }
  return {t:HT_TEXT[k]||'',n:0};
}

function htZiele(){
  const r=svRole(), R=HT_ROLLE[r]||HT_ROLLE.viewer;
  return R.z.filter(k=>{ const z=HT_ZIEL[k]; if(!z)return false;
    if(k==='leitung')return htDarfLeitung()&&svTabAllowed('planung');
    if(k==='planung'&&R.z.includes('leitung')&&htDarfLeitung())return false;
    try{ return svTabAllowed(z[0]); }catch(e){ return false; } });
}

function htRender(){
  const home=document.getElementById('panel-home'), hello=document.getElementById('svHello'); if(!home||!hello)return;
  let el=document.getElementById('svHeute');
  if(!el){ el=document.createElement('section'); el.id='svHeute'; el.className='ht'; el.setAttribute('aria-label','Häufig genutzt'); }
  const r=svRole(), R=HT_ROLLE[r]||HT_ROLLE.viewer, Z=htZiele();
  // Jugendtrainer ohne zugeordnete Mannschaft: sagen, woran es liegt, statt einer leeren Startseite
  const ohneTeam=r==='jugend'&&typeof SVR!=='undefined'&&SVR.loaded&&typeof svrTeams==='function'&&!svrTeams().length;
  const leer=ohneTeam?`<div class="ht-leer"><b>Du bist noch keiner Mannschaft zugeordnet.</b><p>Sobald die Jugendleitung oder ein Admin dich bei deiner Mannschaft einträgt, siehst du hier Kader, Termine und Aufgaben deines Teams.</p></div>`:'';
  if(!Z.length&&!leer){ el.remove(); return; }
  el.innerHTML=`<h2 class="ht-h">${htE(R.h)}</h2>${leer}<div class="ht-liste" role="list"${Z.length?'':' hidden'}>${Z.map(k=>{ const z=HT_ZIEL[k], s=htStand(k);
    return `<button type="button" class="ht-z" role="listitem" data-ht="${htE(k)}"><span class="ht-ic" style="--c:${z[3]}">${SVI(z[1])}</span>
      <span class="ht-tx"><b>${htE(z[2])}</b><small${s.heute?' class="ht-heute"':''}>${htE(s.t)}</small></span>
      ${s.n?`<span class="ht-n${s.dringend?' rot':''}" aria-label="${s.n} fällig">${s.n}</span>`:''}<span class="ht-pf" aria-hidden="true">${SVI('chev')}</span></button>`; }).join('')}</div>`;
  el.querySelectorAll('[data-ht]').forEach(b=>b.onclick=()=>htGehe(b.dataset.ht));
  htOrdnen(el);
  if(Z.includes('leitung')||Z.includes('planung'))htPlanHolen();
}
function htGehe(k){ const z=HT_ZIEL[k]; if(!z)return;
  if(k==='leitung'&&typeof PL!=='undefined'){ PL.b='leitung'; }
  goTab(z[0]); }

// Reihenfolge: Begrüßung, Heute, dann das Cockpit mit Hinweisen. „Erste Schritte“ rückt hinter die Termine.
function htOrdnen(el){
  const hello=document.getElementById('svHello'); if(!hello)return; el=el||document.getElementById('svHeute'); if(!el)return;
  if(hello.nextElementSibling!==el)hello.after(el);
  const o1=document.getElementById('o1karte');
  // 0.74: Wer noch keinen Schritt erledigt hat, sieht die ersten Schritte direkt nach der Begrüßung
  if(o1&&o1.parentNode===hello.parentNode&&typeof o1Stand==='function'&&o1Stand().fertig===0){ if(el.nextElementSibling!==o1)el.after(o1); htKlappe(); return; }
  if(o1&&o1.parentNode===hello.parentNode){ const ziel=['kalHome','ogHome','sptHome','svrMeine','trHome','vrHome','svCockpit'].map(i=>document.getElementById(i)).find(x=>x&&x.parentNode===hello.parentNode&&x.offsetParent!==null);
    if(ziel&&ziel.nextElementSibling!==o1&&(o1.compareDocumentPosition(ziel)&Node.DOCUMENT_POSITION_FOLLOWING))ziel.after(o1); }
  htKlappe();
}

// Lange Scouting-Listen zugeklappt, außer für Planer (die arbeiten damit)
const HT_FEED=['vrHome','homeTiles','homeKand','svAct','homeCrm','homeFocus','homeWechsel','homeGems','homePress'];
function htOffen(){ try{ const v=localStorage.getItem('sv_ht_feed'); if(v!=null)return v==='1'; }catch(e){} return svRole()==='planer'; }
function htKlappe(){
  const home=document.getElementById('panel-home'); if(!home)return;
  // 0.99.23: Spieler und Helfer haben mit Scouting, Radar und Kaderplanung nichts zu tun, die Listen gibt es für sie nicht
  if(['spieler','helfer'].includes(svRole())){ HT_FEED.forEach(i=>{ const x=document.getElementById(i); if(!x)return; x.style.display='none'; const p=x.previousElementSibling; if(p&&p.classList.contains('sechead'))p.style.display='none'; });
    // Auch das Cockpit (Scouting-Kacheln) und die feste Schnellsuche der Kaderplanung fallen weg. „Für dich“ oben trägt die Seite.
    const ck=document.getElementById('svCockpit'); if(ck)ck.style.display='none';
    [...home.children].forEach(x=>{ if(!x.id&&(x.classList.contains('sechead')||x.classList.contains('frow')))x.style.display='none'; });
    const alt=document.getElementById('htFeedBtn'); if(alt)alt.remove(); return; }
  const offen=htOffen(); home.classList.add('ht-kompakt'); home.classList.toggle('ht-offen',offen);
  const erstes=HT_FEED.slice(1).map(i=>document.getElementById(i)).find(x=>x&&x.parentNode===home); if(!erstes)return;
  let b=document.getElementById('htFeedBtn');
  if(!b){ b=document.createElement('button'); b.type='button'; b.id='htFeedBtn'; b.className='ht-mehr';
    b.onclick=()=>{ const neu=!home.classList.contains('ht-offen'); try{ localStorage.setItem('sv_ht_feed',neu?'1':'0'); }catch(e){} htKlappe(); if(neu)setTimeout(()=>{ try{ b.scrollIntoView({behavior:'smooth',block:'start'}); }catch(e){} },60); }; }
  // Knopf direkt vor die erste Scouting-Liste (deren Überschrift steht ggf. davor)
  let vor=erstes; const p=erstes.previousElementSibling; if(p&&p.classList.contains('sechead'))vor=p;
  if(b.nextElementSibling!==vor)vor.before(b);
  // Radar & Verein gehört zum Scouting: steht direkt hinter dem Knopf, außer bei Planern (dort bleibt es oben)
  const vr=document.getElementById('vrHome'); if(vr&&vr.parentNode===home&&svRole()!=='planer'&&b.nextElementSibling!==vr)b.after(vr);
  b.setAttribute('aria-expanded',offen?'true':'false');
  b.innerHTML=`<span><b>Scouting, Radar und Kader</b><small>${offen?'Zuklappen':'Radar, Pipeline, Wechselkandidaten, Presse'}</small></span><span class="ht-pf${offen?' auf':''}" aria-hidden="true">${SVI('chev')}</span>`;
}

// Einhängen: bei jedem Aufbau der Startseite und wenn Rechte oder Cockpit neu kommen
{ const _rh=renderHome; renderHome=function(){ const r=_rh.apply(this,arguments); try{ htRender(); }catch(e){ console.warn('Heute',e); } return r; }; }
{ const _ho=svHomeOrder; svHomeOrder=function(){ const r=_ho.apply(this,arguments); try{ htOrdnen(); }catch(e){} return r; }; }
{ const _sa=svrApply; svrApply=function(){ const r=_sa.apply(this,arguments); try{ if(svCurTab()==='home')htRender(); }catch(e){} return r; }; }
if(typeof kalHome==='function'){ const _kh=kalHome; kalHome=function(){ const r=_kh.apply(this,arguments); try{ if(svCurTab()==='home'&&document.getElementById('svHeute'))htRender(); }catch(e){} return r; }; }
{ const _gt=goTab; goTab=function(tab){ const r=_gt.apply(this,arguments); try{ if(svCurTab()==='home')htRender(); }catch(e){} return r; }; }
// Das Cockpit und die Karte „Erste Schritte“ setzen sich beim Aufbau selbst hinter die Begrüßung. Danach neu ordnen.
{ const _ck=svCockpit; svCockpit=function(){ const r=_ck.apply(this,arguments); try{ htOrdnen(); }catch(e){} return r; }; }
if(typeof o1Karte==='function'){ const _o1=o1Karte; o1Karte=function(){ const r=_o1.apply(this,arguments); try{ htOrdnen(); }catch(e){} return r; }; }
// Tab-Leiste zeigt immer den Bereich als aktiv, in dem man gerade ist (auch Unterseiten wie Planung in der Aufgabensteuerung)
function htLeisteAktiv(){ const bar=document.getElementById('tabbar'); if(!bar)return; const cur=svCurTab();
  const b=bar.querySelector(`.ti[data-tab="${cur}"]`); if(!b)return;
  bar.querySelectorAll('.ti').forEach(x=>x.classList.toggle('active',x===b)); const mb=document.getElementById('tMore'); if(mb)mb.classList.remove('on'); }
{ const _gt2=goTab; goTab=function(){ const r=_gt2.apply(this,arguments); try{ htLeisteAktiv(); setTimeout(htLeisteAktiv,0); }catch(e){} return r; }; }

/* =====================================================================
   Beta 0.75 · Veranstaltungen planen (Wunsch Albert, 04.11.2026)
   Eine Veranstaltung (Konzert, Adventsmarkt, Weihnachtsfeier …) mit
   - Unterveranstaltungen (Aufbau Freitag, Stand Samstag, Abbau)
   - Bereichen mit Leitung (Theke, Kasse, Küche) und Schichten mit Aufgabe, Hinweis und Plätzen
   - Helfern aus dem Pool (persönlicher Link, per WhatsApp oder Mail anfragen) und Leuten aus der App
   - Team aus anderen Bereichen mit Rolle: Leitung, Team oder nur ein Bereich
   - Checkliste wie bisher (Aufgaben & Checklisten), Export als PDF zum Aushängen, Excel, Kalender, Text
   Daten nur über die Funktionen vst_* (109). Der Server prüft jede Aktion; die Oberfläche blendet nur aus, was eh nicht ginge.
   ===================================================================== */
const VST = { v:'liste', id:null, d:null, L:null, seg:'plan', vergangen:false, helfer:null, laedt:false, mitglied:false };
const VST_STATUS = { idee:'Idee', planung:'In Planung', laeuft:'Läuft', fertig:'Fertig', abgesagt:'Abgesagt' };
const VST_LINK = 'https://svbsc.albertklee.de/#einsatz=';
SVR_TAB.veranstaltungen = 'orga';
SV_TBL.veranstaltungen = ['cal','Veranstaltungen'];
Object.assign(SV_PAGES, { veranstaltungen:['Veranstaltungen','Planen, Schichten besetzen, Helfer einladen'] });
// Sichtbar mit Orga-Recht oder wenn man in einer Veranstaltung mitarbeitet (Team, Bereich). Der Server entscheidet bei jedem Aufruf neu.
{ const _ta = svTabAllowed; svTabAllowed = function(t){ if(t === 'veranstaltungen') return svRole() === 'admin' || svDarf('orga') === true || VST.mitglied; return _ta.apply(this, arguments); }; }
function vstPanel(){ let P = document.getElementById('panel-veranstaltungen'); if(P) return P;
  const ref = document.getElementById('panel-home') || document.querySelector('.panel'); if(!ref) return null;
  P = document.createElement('section'); P.className = 'panel'; P.id = 'panel-veranstaltungen'; ref.parentNode.insertBefore(P, ref.nextSibling); return P; }
{ const _gt = goTab; goTab = function(tab){ if(tab === 'veranstaltungen') vstPanel(); const war = svCurTab(); const r = _gt.apply(this, arguments);
  try{ if(svCurTab() === 'veranstaltungen' && war !== 'veranstaltungen'){ if(!VST.id) VST.v = 'liste'; vstStart(); } }catch(e){ console.warn('Veranstaltungen', e); } return r; }; }

const vstE = s => svEsc(s == null ? '' : String(s));
function svFehlerText(error){ const m = (error && error.message) || ''; if(/42501|Berechtigung/.test(m + (error && error.code))) return 'Dafür fehlt dir die Berechtigung.';
  if(!m || /schema cache|PGRST|Failed to fetch|NetworkError|Load failed|function public\.|relation |violates|syntax error|invalid input|null value|duplicate key/i.test(m)) return 'Das hat gerade nicht geklappt. Bitte gleich nochmal versuchen.'; return m; }
async function vstRpc(fn, args){ const { data, error } = await SVB.sb.rpc(fn, args || {}); if(error) throw new Error(svFehlerText(error)); return data; }
function vstTag(d, mitJahr){ if(!d) return ''; try{ return new Date(String(d).slice(0, 10) + 'T12:00:00').toLocaleDateString('de-DE', { weekday:'short', day:'2-digit', month:'2-digit', year: mitJahr ? 'numeric' : undefined }); }catch(e){ return d; } }
function vstUhr(ts){ if(!ts) return ''; try{ return new Date(ts).toLocaleTimeString('de-DE', { hour:'2-digit', minute:'2-digit', timeZone:'Europe/Berlin' }); }catch(e){ return ''; } }
function vstTagIso(ts){ try{ return new Date(ts).toLocaleDateString('sv-SE', { timeZone:'Europe/Berlin' }); }catch(e){ return ''; } }
function vstWann(x){ return [vstTag(x.datum), x.bis && x.bis !== x.datum ? 'bis ' + vstTag(x.bis) : '', x.zeit ? x.zeit + ' Uhr' : ''].filter(Boolean).join(', '); }
function vstBalken(z){ const p = z && z.plaetze ? Math.round(z.belegt / z.plaetze * 100) : 0;
  return z && z.plaetze ? `<div class="vst-bal" role="img" aria-label="${z.belegt} von ${z.plaetze} Plätzen besetzt"><i style="width:${p}%"></i></div><small class="vst-bz">${z.belegt} von ${z.plaetze} Plätzen besetzt</small>` : '<small class="vst-bz">Noch keine Schichten</small>'; }
function vstHeute(){ return new Date().toLocaleDateString('sv-SE', { timeZone:'Europe/Berlin' }); }

// Beim Start einmal still fragen, ob man irgendwo mitarbeitet (für die Seitenleiste)
async function vstMitgliedPruefen(){ try{ if(svRole() === 'admin' || svDarf('orga') === true) return; const d = await vstRpc('vst_uebersicht'); VST.L = d; VST.mitglied = (d.liste || []).length > 0;
  if(VST.mitglied){ try{ sv4NavVis(); svBuildTabbar(); }catch(e){} } }catch(e){} }
setTimeout(() => { try{ if(typeof SVU !== 'undefined' && SVU && SVU.id) vstMitgliedPruefen(); }catch(e){} }, 6000);

async function vstStart(){
  const P = vstPanel(); if(!P) return;
  if(VST.v === 'detail' && VST.id) return vstDetail(VST.id);
  if(!VST.L) P.innerHTML = '<div class="card"><div class="empty">Lade die Veranstaltungen …</div></div>';
  try{ VST.L = await vstRpc('vst_uebersicht'); }catch(e){ P.innerHTML = `<div class="card"><div class="empty">${vstE(e.message)}</div></div>`; return; }
