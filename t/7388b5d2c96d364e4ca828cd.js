function sptStand(W){ const n=SPT_ALLE.map(a=>Math.min(2,sptAufgWissen(a,W).length)); return Math.round(100*n.reduce((x,y)=>x+y,0)/(2*SPT_ALLE.length)); }
// Nächste Interview-Frage: Aufgabe mit dem wenigsten Wissen, dort die nächste noch nicht gestellte Frage
function sptNaechsteFrage(k){ const W=(SPT.C&&SPT.C.wissen)||[]; let gef=[]; try{ gef=JSON.parse(localStorage.getItem('svbc-spt-gefragt')||'[]'); }catch(e){}
  const kand=(k?SPT_ALLE.filter(a=>a.k===k):SPT_ALLE.slice().sort((x,y)=>sptAufgWissen(x,W).length-sptAufgWissen(y,W).length));
  for(const a of kand){ const i=a.f.findIndex((_,j)=>!gef.includes(a.k+':'+j)); if(i>=0)return {k:a.k,t:a.t,i,frage:a.f[i]}; }
  const a=kand[0]; return a?{k:a.k,t:a.t,i:0,frage:a.f[0]}:null; }
function sptGefragt(m){ try{ const g=JSON.parse(localStorage.getItem('svbc-spt-gefragt')||'[]'); const key=m.k+':'+m.i; if(!g.includes(key)){ g.push(key); localStorage.setItem('svbc-spt-gefragt',JSON.stringify(g.slice(-200))); } }catch(e){} }
try{ SPT.vorlesen=localStorage.getItem('svbc-spt-vorlesen')!=='aus'; }catch(e){}
SV_TBL.sptag=['mic','Mein Spieltag'];
Object.assign(SV_PAGES,{sptag:['Mein Spieltag','Ansage per Mikrofon, Checkliste des nächsten Heimspiels und dein Wissen für Nachfolger']});
if(typeof SV4_HUB!=='undefined'&&SV4_HUB.steuerung){ SV4_HUB.steuerung.tabs.push(['sptag','Mein Spieltag']); SV4_OF.sptag='steuerung'; }
// 0.74: Solange der Server noch nicht bestätigt hat (SPT.darf unbekannt), nur wer laut Rolle oder Bereich „orga“ darf.
// Gast und Jugend sehen „Mein Spieltag“ erst, wenn der Server sie als Spieltag-Verantwortliche bestätigt (SPT.darf===true).
{ const _ta=svTabAllowed; svTabAllowed=function(t){ if(t==='sptag'){ if(SPT.darf===false)return false; if(SPT.darf===true)return true;
    const r=svRole(); if(['admin','vorstand','planer','trainer'].includes(r))return true; return typeof svDarf==='function'&&svDarf('orga')===true; }
  return _ta.apply(this,arguments); }; }
// Seitenleiste und Mehr-Menü: „Mein Spieltag“ nur für die Spieltag-Verantwortung und den Admin (alle anderen finden es in der Aufgabensteuerung)
if(typeof sv4NavVis==='function'){ const _nv=sv4NavVis; sv4NavVis=function(){ const r=_nv.apply(this,arguments);
  try{ document.querySelectorAll('.snav button[data-tab="sptag"],.sgrid [data-sheet="sptag"]').forEach(b=>b.style.display=SPT.eigen&&SPT.darf!==false?'':'none'); }catch(e){} return r; }; }
function sptEigen(an){ SPT.eigen=!!an; try{ localStorage.setItem('svbc-spt-eigen',an?'1':'0'); }catch(e){} try{ sv4NavVis(); }catch(e){} }
function sptPanel(){ let P=document.getElementById('panel-sptag'); if(P)return P;
  const ref=document.getElementById('panel-home')||document.querySelector('.panel'); if(!ref)return null;
  P=document.createElement('section'); P.className='panel'; P.id='panel-sptag'; ref.parentNode.insertBefore(P,ref.nextSibling); return P; }
{ const _gt=goTab; goTab=function(tab){ if(tab==='sptag')sptPanel(); const was=svCurTab(); const r=_gt.apply(this,arguments);
    try{ const jetzt=svCurTab(); if(jetzt==='sptag'&&was!=='sptag')sptRender(true); if(jetzt!=='sptag'&&SPT.an)sptStopp(); if(jetzt==='sptag'&&typeof sv4HubBar==='function')sv4HubBar('sptag');
      const side=document.querySelector('.snav button[data-tab="sptag"]:not([style*="none"])')||document.querySelector('.snav button[data-tab="kalender"]'); if(side&&jetzt==='sptag')document.querySelectorAll('.snav button[data-tab]').forEach(b=>b.classList.toggle('active',b===side));
      if(jetzt==='sptag'&&document.querySelector('.tabbar .ti[data-tab="sptag"]'))document.querySelectorAll('.tabbar .ti').forEach(b=>b.classList.toggle('active',b.dataset.tab==='sptag')); }catch(e){ console.warn('Mein Spieltag',e); } return r; }; }

/* ---------- Hilfen ---------- */
const sptE=s=>svEsc(s==null?'':String(s));
const sptSVG=n=>{ try{ return SVI(n); }catch(e){ return ''; } };
const SPT_MIC='<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M12 3a3 3 0 0 0-3 3v6a3 3 0 0 0 6 0V6a3 3 0 0 0-3-3z"/><path d="M19 11a7 7 0 0 1-14 0"/><path d="M12 18v3"/><path d="M8 21h8"/></svg>';
async function sptRpc(fn,args){ const {data,error}=await SVB.sb.rpc(fn,args||{}); if(error)throw new Error(/42501|Berechtigung/.test(error.message+error.code)?'Dafür fehlt dir die Berechtigung.':error.message); return data; }
function sptTag(d){ try{ const x=new Date(d+'T12:00:00'), h=new Date(), n=Math.round((x-new Date(h.getFullYear(),h.getMonth(),h.getDate(),12))/864e5);
  const rel=n===0?'Heute':n===1?'Morgen':n===-1?'Gestern':n>1&&n<7?'in '+n+' Tagen':n<-1&&n>-7?'vor '+(-n)+' Tagen':null;
  return (rel?rel+', ':'')+x.toLocaleDateString('de-DE',{weekday:'long',day:'2-digit',month:'2-digit'}); }catch(e){ return d; } }
function sptUhr(ts){ try{ return new Date(ts).toLocaleTimeString('de-DE',{hour:'2-digit',minute:'2-digit'}); }catch(e){ return ''; } }
const sptSR=()=>window.SpeechRecognition||window.webkitSpeechRecognition||null;
function sptGruss(){ const h=new Date().getHours(); return h<10?'Guten Morgen':h<18?'Hallo':'Guten Abend'; }
function sptFrage(vn){ return `Hallo ${vn}, was hast du alles erledigt? Was muss noch gemacht werden?`; }
function sptMicTitel(){ return SPT.modus?(SPT.an?'Ich höre zu · ':'Interview: ')+SPT.modus.t:SPT.an?'Ich höre zu …':'Ansage'; }
function sptMicUnter(vn){ return SPT.modus?SPT.modus.frage+(SPT.an?' Tippen, wenn du fertig bist.':''):SPT.an?'Tippen, wenn du fertig bist.':sptFrage(vn); }

/* ---------- Laden ---------- */
async function sptLaden(still){
  if(SPT.laedt)return SPT.C; SPT.laedt=true;
  try{ const C=await sptRpc('spieltag_cockpit'); SPT.C=C; const war=SPT.darf; SPT.darf=true; try{ localStorage.setItem('svbc-spt-darf','1'); }catch(e){}
    if(war===false){ try{ sv4NavVis(); }catch(e){} }
    sptEigen(C.ich&&(C.ich.spieltag||C.ich.admin)); if(C.ich&&(C.ich.spieltag||C.ich.admin))sptTabbar(); return C; }
  catch(e){ if(/Berechtigung|Could not find the function|schema cache|PGRST202/i.test(e.message)){ SPT.darf=false; SPT.eigen=false; try{ localStorage.setItem('svbc-spt-darf','0'); }catch(x){} try{ sv4NavVis(); }catch(x){} } if(!still)throw e; return null; }
  finally{ SPT.laedt=false; }
}
try{ if(localStorage.getItem('svbc-spt-darf')==='0')SPT.darf=false; }catch(e){}
// Für die Spieltag-Verantwortung steht „Mein Spieltag“ unten in der Leiste
function sptTabbar(){ try{ const r=svRole(), L=SV_TABBAR[r]; if(!Array.isArray(L)||L.includes('sptag'))return; L.splice(1,0,'sptag'); if(L.length>4)L.length=4; svBuildTabbar(); }catch(e){} }

/* ---------- Seite ---------- */
async function sptRender(neu){
  const P=sptPanel(); if(!P)return;
  if(!SPT.C||neu){ if(!SPT.C)P.innerHTML='<div class="card"><div class="empty">Lade deinen Spieltag …</div></div>';
    try{ await sptLaden(); }catch(e){ P.innerHTML=`<div class="card"><div class="empty">${/Could not find the function|schema cache|PGRST202/i.test(e.message)?'Dieser Bereich ist auf dem Server noch nicht freigeschaltet. Bitte etwas später nochmal.':sptE(e.message)}</div></div>`; try{ sv4NavVis(); svBuildTabbar(); }catch(x){} return; } }
  if(svCurTab()!=='sptag')return;
  const C=SPT.C, vn=C.ich.vorname||'du', N=C.naechste, L=C.letzte, W=C.wissen||[], K=(C.kommende||[]).filter(k=>!N||k.liste!==N.id).slice(0,4);
  const offen=N?N.punkte.filter(p=>!p.e):[], fertig=N?N.punkte.length-offen.length:0;
  const kopf=`<div class="spt-kopf"><div><h2>${sptE(sptGruss())}, <span>${sptE(vn)}</span>.</h2>
      <p>${N?`${sptE(sptTag(N.datum))}${N.zeit?' um '+sptE(N.zeit)+' Uhr':''}: ${sptE(N.titel.replace(/^Heimspiel /,'Heimspiel '))}. ${offen.length?`<b>${offen.length} ${offen.length===1?'Punkt':'Punkte'}</b> noch offen.`:'Alles abgehakt.'}`
        :K.length?`Nächstes Heimspiel ${sptE(sptTag(K[0].d))}${K[0].z?' um '+sptE(K[0].z)+' Uhr':''} gegen ${sptE(K[0].gegner||'?')}. Die Checkliste kommt zwei Wochen vorher von selbst.`:'Gerade steht kein Heimspiel an.'}</p></div>
      ${C.ich.spieltag?'':`<span class="spt-wer">${sptE(C.rolle&&C.rolle.titel||'Spieltag')}: ${sptE(C.rolle&&C.rolle.namen||'offen')}</span>`}</div>`;
  const hinweis=C.ich.admin&&C.rolle&&!C.rolle.konto?`<div class="card spt-hinweis"><b>Noch kein Konto für „${sptE(C.rolle.namen||'die Spieltag-Verantwortung')}“.</b> Sobald ein Nutzer mit genau diesem Namen angelegt ist (Verwaltung → Nutzer einladen), sieht er diesen Bereich auf seiner Übersicht und bekommt die Erinnerungen. Den Namen der Zuständigkeit änderst du unter Aufgaben → Zuständigkeiten.</div>`:'';
  const mic=`<div class="card spt-mic-karte${SPT.an?' an':''}" id="sptMicKarte">
      <button type="button" class="spt-mic" id="sptMic" aria-label="${SPT.an?'Ansage beenden':'Ansage starten'}"><span class="spt-puls"></span>${SPT_MIC}</button>
      <div class="spt-mic-txt"><b id="sptMicT">${sptE(sptMicTitel())}</b><small id="sptMicS">${sptE(sptMicUnter(vn))}</small></div>
      <div class="spt-live" id="sptLive"${SPT.an?'':' hidden'}><p id="sptLiveT">${sptE(SPT.text)}<i>${sptE(SPT.zwischen)}</i></p></div>
      <div class="spt-tipp" id="sptTipp"${sptSR()?' hidden':''}><textarea id="sptTextIn" rows="3" placeholder="Hier tippen oder die Mikrofon-Taste deiner Tastatur nutzen: Was ist erledigt, was fehlt noch?"></textarea>
        <button type="button" class="btn" id="sptTextGo">${sptSVG('send')} Auswerten</button></div>
      <div class="spt-mic-fuss"><label class="spt-schalter"><input type="checkbox" id="sptVor"${SPT.vorlesen?' checked':''}> Antwort vorlesen</label>
        ${sptSR()?`<button type="button" class="spt-link" id="sptTippen">Lieber tippen</button>`:''}</div></div>`;
  const grp={vorher:'Vorher',spieltag:'Am Spieltag',danach:'Danach'};
  const punkt=p=>`<button type="button" class="spt-p${p.e?' ok':''}" data-sptp="${sptE(p.id)}"><span class="spt-kreis">${p.e?'✓':''}</span><span class="spt-pt"><b>${sptE(p.t)}</b><small>${p.f?sptE(sptUhr(p.f))+' Uhr':''}${p.wn?(p.f?' · ':'')+sptE(p.wn):''}${p.n?' · '+sptE(p.n):''}</small></span></button>`;
  const liste=(Lx,titel,hint)=>{ if(!Lx)return ''; const of=Lx.punkte.filter(p=>!p.e), ok=Lx.punkte.filter(p=>p.e);
    // Lange Listen: erst die nächsten offenen Punkte, der Rest auf Tipp (das Aufgabenpaket soll nicht weit unten verschwinden)
    const kurz=!SPT.alle[Lx.id]&&of.length>8, zeig=kurz?new Set(of.slice(0,6).map(p=>p.id)):null;
    const gr=['vorher','spieltag','danach'].map(g=>{ const all=of.filter(p=>p.g===g), xs=zeig?all.filter(p=>zeig.has(p.id)):all; return xs.length?`<h4>${grp[g]} <em>${all.length}</em></h4>${xs.map(punkt).join('')}`:''; }).join('')
      +(kurz?`<button type="button" class="spt-mehr" data-sptalle="${sptE(Lx.id)}">Alle ${of.length} offenen Punkte zeigen ${sptSVG('down')}</button>`:'');
    return `<div class="card spt-liste"><div class="spt-lh"><div><h3 class="trh">${sptE(titel)}</h3><p class="note">${sptE(hint)}</p></div>${typeof ogRing==='function'?ogRing(ok.length,Lx.punkte.length,true):''}</div>
      ${gr||'<p class="spt-fertig">✅ Alles erledigt. Stark.</p>'}
      ${ok.length?`<details class="spt-ok"><summary>Erledigt (${ok.length})</summary>${ok.map(punkt).join('')}</details>`:''}
      <div class="btnrow"><button type="button" class="btn ghost sm" data-sptliste="${sptE(Lx.id)}">${sptSVG('check')} Ganze Checkliste mit Chat und Helfern</button></div></div>`; };
  const kommende=K.length?`<div class="card spt-kommend"><h3 class="trh">Weitere Heimspiele</h3>${K.map(k=>`<div class="spt-k"><b>${sptE(sptTag(k.d))}${k.z?', '+sptE(k.z)+' Uhr':''}</b><span>${k.m==='h2'?'Zweite':'Erste'} gegen ${sptE(k.gegner||'?')}</span></div>`).join('')}</div>`:'';
  const S=C.saison||{}, A=C.ansagen||{};
  const zahlen=`<div class="spt-zahlen"><div><b>${S.spiele||0}</b><span>Heimspiele diese Saison</span></div><div><b>${S.punkte?Math.round(100*S.fertig/S.punkte):0} %</b><span>davon abgehakt</span></div><div><b>${A.n||0}</b><span>Ansagen</span></div><div><b>${A.erledigt||0}</b><span>Punkte per Stimme erledigt</span></div></div>`;
  P.innerHTML=kopf+hinweis+mic+`<div id="sptErg"></div>`+(N?liste(N,N.titel,'Tippe auf einen Kreis zum Abhaken. Oder sag es einfach ins Mikrofon.'):'')
    +(L&&L.punkte.some(p=>!p.e)?liste(L,'Nachbereitung: '+L.titel,'Vom letzten Heimspiel ist noch etwas offen.'):'')
    +sptPaketHtml(W)+kommende+sptWissenHtml(W)+zahlen;
  P.querySelector('#sptMic').onclick=()=>SPT.an?sptStopp(true):sptStart(N?N.id:(L?L.id:null),SPT.modus);
  P.querySelector('#sptVor').onchange=e=>{ SPT.vorlesen=e.target.checked; try{ localStorage.setItem('svbc-spt-vorlesen',SPT.vorlesen?'an':'aus'); }catch(x){} if(!SPT.vorlesen)sptStill(); };
  const tp=P.querySelector('#sptTippen'); if(tp)tp.onclick=()=>{ const t=P.querySelector('#sptTipp'); t.hidden=!t.hidden; if(!t.hidden)P.querySelector('#sptTextIn').focus(); };
  P.querySelector('#sptTextGo').onclick=()=>{ const t=P.querySelector('#sptTextIn').value.trim(); if(t.length<3){ kToast('Bitte erst etwas sagen oder tippen.'); return; } SPT.text=t; sptAuswerten(N?N.id:(L?L.id:null)); };
  P.querySelectorAll('[data-sptp]').forEach(b=>b.onclick=()=>sptHaken(b.dataset.sptp,b));
  P.querySelectorAll('[data-sptliste]').forEach(b=>b.onclick=()=>{ if(typeof ogOeffnen==='function')ogOeffnen(b.dataset.sptliste); });
  P.querySelectorAll('[data-sptalle]').forEach(b=>b.onclick=()=>{ SPT.alle[b.dataset.sptalle]=true; sptRender(); });
  sptWissenBind(P); sptPaketBind(P);
  if(SPT.erg)sptErgebnisZeigen(); else if(SPT.weiter)sptWeiterZeigen();
}
async function sptHaken(id,btn){
  const C=SPT.C; const Lx=[C.naechste,C.letzte].find(l=>l&&l.punkte.some(p=>p.id===id)); if(!Lx)return; const p=Lx.punkte.find(x=>x.id===id), an=!p.e;
  btn.classList.toggle('ok',an); btn.querySelector('.spt-kreis').textContent=an?'✓':''; try{ svHaptic(an?'success':'light'); svSound(an?'success':'tick'); }catch(e){}
  try{ const R=await sptRpc('orga_punkt_haken',{p_id:id,p_erledigt:an}); Object.assign(Lx,R); await new Promise(r=>setTimeout(r,an?420:120)); sptRender();
    if(an&&Lx.punkte.every(x=>x.e)){ try{ ogFeier(document.querySelector('.spt-liste')); }catch(e){} kToast('🎉 Alles erledigt, danke!'); } }
  catch(e){ btn.classList.toggle('ok',!an); kToast('⚠️ '+e.message); } }

/* ---------- Ansage: Begrüßung, Mikrofon, Transkript ---------- */
function sptSprich(text,cb){
  if(!SPT.vorlesen||!('speechSynthesis'in window)){ if(cb)cb(); return; }
  try{ sptStill(); const u=new SpeechSynthesisUtterance(text); u.lang='de-DE'; u.rate=1; let fertig=false; const done=()=>{ if(fertig)return; fertig=true; if(cb)cb(); };
    const V=speechSynthesis.getVoices().filter(v=>/^de/i.test(v.lang)); const w=V.find(v=>/Anna|Petra|Markus|Google Deutsch|Helena/i.test(v.name))||V[0]; if(w)u.voice=w;
    u.onend=done; u.onerror=done; SPT.tts=u; speechSynthesis.speak(u); setTimeout(done,Math.min(9000,1200+text.length*75)); }
  catch(e){ if(cb)cb(); }
}
function sptStill(){ try{ if('speechSynthesis'in window)speechSynthesis.cancel(); }catch(e){} }
function sptStart(listeId,modus){
  if(SPT.busy)return; SPT.liste=listeId||null; SPT.modus=modus||null; SPT.weiter=null; SPT.text=''; SPT.zwischen=''; SPT.erg=null; const E=document.getElementById('sptErg'); if(E)E.innerHTML='';
  const vn=(SPT.C&&SPT.C.ich.vorname)||'du', SR=sptSR();
  const ansage=SPT.modus?`${vn}, ${SPT.modus.frage}`:sptFrage(vn);
  if(!SR){ sptMicUI(); const t=document.getElementById('sptTipp'); if(t){ t.hidden=false; t.querySelector('textarea').focus(); } sptSprich(ansage); return; }
  SPT.an=true; sptMicUI(); try{ svHaptic('light'); }catch(e){}
  const los=()=>{ if(!SPT.an||SPT.rec)return;
    try{ const r=new SR(); r.lang='de-DE'; r.continuous=true; r.interimResults=true; r.maxAlternatives=1; SPT.rec=r; SPT.start=Date.now();
      r.onresult=ev=>{ let fin='', zw=''; for(let i=ev.resultIndex;i<ev.results.length;i++){ const t=ev.results[i][0].transcript; if(ev.results[i].isFinal)fin+=t+' '; else zw+=t; }
        if(fin)SPT.text=(SPT.text+' '+fin).replace(/\s+/g,' ').trim(); SPT.zwischen=zw; sptLiveUI(); };
      r.onerror=ev=>{ const k=ev.error||''; if(k==='no-speech'||k==='aborted')return;
        console.warn('Spracherkennung',k); SPT.an=false; sptMicUI(); const t=document.getElementById('sptTipp'); if(t){ t.hidden=false; }
        kToast(k==='not-allowed'||k==='service-not-allowed'?'Das Mikrofon ist nicht freigegeben. Du kannst stattdessen tippen oder das Mikrofon deiner Tastatur nutzen.':'Die Spracherkennung klappt gerade nicht. Tippen geht immer.'); };
      r.onend=()=>{ if(SPT.an&&SPT.rec===r){ try{ r.start(); }catch(e){ /* iOS beendet nach Pausen: einfach weiter */ } } };
      r.start(); }
    catch(e){ console.warn('Spracherkennung',e); SPT.an=false; sptMicUI(); const t=document.getElementById('sptTipp'); if(t)t.hidden=false; } };
  sptSprich(ansage,los);
}
function sptStopp(auswerten){
  SPT.an=false; const r=SPT.rec; SPT.rec=null; try{ if(r){ r.onend=null; r.stop(); } }catch(e){}
  if(SPT.zwischen){ SPT.text=(SPT.text+' '+SPT.zwischen).trim(); SPT.zwischen=''; }
  sptMicUI();
  if(auswerten){ if(SPT.text.trim().length<3){ kToast('Ich habe nichts verstanden. Versuch es nochmal, ruhig etwas näher ans Handy.'); const t=document.getElementById('sptTipp'); if(t)t.hidden=false; return; } sptAuswerten(SPT.liste); }
}
function sptMicUI(){ const K=document.getElementById('sptMicKarte'); if(!K)return; K.classList.toggle('an',SPT.an);
  const b=K.querySelector('#sptMic'), t=K.querySelector('#sptMicT'), s=K.querySelector('#sptMicS'), l=K.querySelector('#sptLive'); const vn=(SPT.C&&SPT.C.ich.vorname)||'du';
  if(b)b.setAttribute('aria-label',SPT.an?'Ansage beenden':'Ansage starten'); if(t)t.textContent=sptMicTitel(); if(s)s.textContent=sptMicUnter(vn); if(l)l.hidden=!SPT.an&&!SPT.text; K.classList.toggle('interview',!!SPT.modus); sptLiveUI(); }
function sptLiveUI(){ const p=document.getElementById('sptLiveT'); if(!p)return; p.innerHTML=sptE(SPT.text)+(SPT.zwischen?' <i>'+sptE(SPT.zwischen)+'</i>':'')+(SPT.an&&!SPT.text&&!SPT.zwischen?'<span class="spt-warte">Sprich einfach los. Zum Beispiel: „Helferplan steht, Wechselgeld fehlt noch, der Grill muss repariert werden.“</span>':''); }

/* ---------- Auswerten (Server) und bestätigen ---------- */
async function sptAuswerten(listeId){
  if(SPT.busy)return; SPT.busy=true; const E=document.getElementById('sptErg'); if(E)E.innerHTML=`<div class="card spt-erg"><div class="spt-denkt"><span></span><span></span><span></span></div><p>${SPT.modus?'Ich schreibe das für deinen Nachfolger auf …':'Ich sortiere das in die Checkliste …'}</p></div>`;
  try{ const M=SPT.modus; const {data,error}=await SVB.sb.functions.invoke('spieltag-ki',{body:M?{modus:'interview',thema:M.t,frage:M.frage,text:SPT.text}:{liste:listeId||null,text:SPT.text}});
    if(error)throw new Error((error.context&&error.context.status===401)?'Bitte neu anmelden.':(error.message||'Server nicht erreichbar'));
    if(!data||!data.ok){ const k=data&&data.error; throw new Error(k==='kein-schluessel'?'Die KI ist noch nicht eingerichtet (Admin: Schlüssel hinterlegen).':k==='ki-weg'?'Die KI antwortet gerade nicht. Deine Ansage ist nicht verloren, tippe gleich nochmal auf Auswerten.':k==='schluessel'?'Der KI-Schlüssel passt nicht (Admin).':(k||'Unbekannter Fehler')); }
    SPT.erg=data; sptErgebnisZeigen(); sptSprich(data.antwort+(data.rueckfrage?' '+data.rueckfrage:''));
  }catch(e){ if(E)E.innerHTML=`<div class="card spt-erg fehler"><p>⚠️ ${sptE(e.message)}</p><div class="btnrow"><button type="button" class="btn sm" id="sptNochmal">Nochmal auswerten</button><button type="button" class="btn ghost sm" id="sptTippenJetzt">Text ansehen</button></div></div>`;
    const b=document.getElementById('sptNochmal'); if(b)b.onclick=()=>sptAuswerten(listeId); const t=document.getElementById('sptTippenJetzt'); if(t)t.onclick=()=>{ const x=document.getElementById('sptTipp'); if(x){ x.hidden=false; x.querySelector('textarea').value=SPT.text; } }; }
  finally{ SPT.busy=false; }
}
function sptErgebnisZeigen(){
  const E=document.getElementById('sptErg'), R=SPT.erg; if(!E||!R)return;
  const n=R.erledigt.length+R.offen.length+R.neu.length+R.notizen.length+R.wissen.length;
  const zeile=(k,i,ic,h,s)=>`<label class="spt-z"><input type="checkbox" checked data-sptz="${k}:${i}"><span class="spt-zi">${ic}</span><span><b>${sptE(h)}</b>${s?`<small>${sptE(s)}</small>`:''}</span></label>`;
  E.innerHTML=`<div class="card spt-erg"><div class="spt-antwort"><span class="spt-av">${SPT_MIC}</span><p>${sptE(R.antwort)}${R.rueckfrage?`<br><em>${sptE(R.rueckfrage)}</em>`:''}</p></div>
    ${n?`<div class="spt-zeilen">
      ${R.erledigt.map((p,i)=>zeile('e',i,'✓','Erledigt: '+p.t,'')).join('')}
      ${R.offen.map((p,i)=>zeile('o',i,'○','Noch offen: '+p.t,p.war?'war schon abgehakt, wird wieder geöffnet':'')).join('')}
      ${R.neu.map((p,i)=>zeile('n',i,'+','Neu: '+p.t,({vorher:'Vorher',spieltag:'Am Spieltag',danach:'Danach'})[p.g]+(p.merken?' · bei jedem Heimspiel':''))).join('')}
      ${R.notizen.map((p,i)=>zeile('z',i,'✎','Notiz zu „'+p.t+'“',p.n)).join('')}
      ${R.wissen.map((p,i)=>zeile('w',i,'💡',SPT.modus?p.text:'Merken für Nachfolger: '+p.thema,SPT.modus?'':p.text)).join('')}</div>
      <p class="note small">Haken weg, was nicht stimmt. Gespeichert wird erst mit „Passt“.</p>
      <div class="btnrow"><button type="button" class="btn spt-passt" id="sptPasst">${sptSVG('check')} Passt, übernehmen</button><button type="button" class="btn ghost" id="sptNochmal2">${SPT_MIC} Nochmal sprechen</button><button type="button" class="btn ghost" id="sptWeg">Verwerfen</button></div>`
    :`<p class="note">${SPT.modus?'Daraus konnte ich nichts für den Nachfolger festhalten. Erzähl ruhig etwas ausführlicher.':'Da war nichts, was auf die Liste gehört. Du kannst es gleich nochmal sagen.'}</p><div class="btnrow"><button type="button" class="btn ghost" id="sptNochmal2">${SPT_MIC} Nochmal sprechen</button><button type="button" class="btn ghost" id="sptWeg">Schließen</button></div>`}
    <details class="spt-trans"><summary>Was ich verstanden habe</summary><p>${sptE(SPT.text)}</p></details></div>`;
  const p=E.querySelector('#sptPasst'); if(p)p.onclick=()=>sptUebernehmen();
  E.querySelector('#sptNochmal2').onclick=()=>{ SPT.erg=null; sptStart(SPT.liste,SPT.modus); };
  E.querySelector('#sptWeg').onclick=()=>{ SPT.erg=null; SPT.text=''; SPT.modus=null; E.innerHTML=''; sptMicUI(); };
  try{ E.scrollIntoView({behavior:'smooth',block:'start'}); }catch(e){}
}
async function sptUebernehmen(){
  const E=document.getElementById('sptErg'), R=SPT.erg; if(!E||!R||SPT.busy)return;
  const an=k=>[...E.querySelectorAll(`[data-sptz^="${k}:"]`)].filter(x=>x.checked).map(x=>+x.dataset.sptz.split(':')[1]);
  const p={erledigt:an('e').map(i=>R.erledigt[i].id),offen:an('o').map(i=>R.offen[i].id),neu:an('n').map(i=>R.neu[i]),notizen:an('z').map(i=>({id:R.notizen[i].id,n:R.notizen[i].n})),wissen:an('w').map(i=>R.wissen[i]),transkript:SPT.text,antwort:R.antwort};
  SPT.busy=true; const b=E.querySelector('#sptPasst'); if(b)b.disabled=true;
  try{ const X=await sptRpc('spieltag_ansage_anwenden',{p_liste:R.liste||null,p});
    if(SPT.C){ if(X.liste&&SPT.C.naechste&&SPT.C.naechste.id===X.liste.id)Object.assign(SPT.C.naechste,X.liste); if(X.liste&&SPT.C.letzte&&SPT.C.letzte.id===X.liste.id)Object.assign(SPT.C.letzte,X.liste); SPT.C.wissen=X.wissen_alle||SPT.C.wissen; SPT.C.ansagen=SPT.C.ansagen||{}; SPT.C.ansagen.n=(SPT.C.ansagen.n||0)+1; SPT.C.ansagen.erledigt=(SPT.C.ansagen.erledigt||0)+(X.erledigt||0); }
    const M=SPT.modus; if(M){ sptGefragt(M); SPT.weiter={t:M.t,n:X.wissen||0}; SPT.modus=null; }
    SPT.erg=null; SPT.text=''; try{ svHaptic('success'); svSound('success'); }catch(e){}
    const teile=[]; if(X.erledigt)teile.push(X.erledigt+' abgehakt'); if(X.neu)teile.push(X.neu+' neu'); if(X.wissen)teile.push(X.wissen+' gemerkt');
    kToast('✓ '+(teile.join(', ')||'Übernommen'));
    sptRender(); const Lx=SPT.C&&SPT.C.naechste; if(Lx&&Lx.punkte.length&&Lx.punkte.every(x=>x.e)){ try{ ogFeier(document.querySelector('.spt-liste')); }catch(e){} }
  }catch(e){ kToast('⚠️ '+e.message); if(b)b.disabled=false; }
  finally{ SPT.busy=false; }
}

/* ---------- Aufgabenpaket & Interview (0.41) ---------- */
function sptPaketHtml(W){
  const st=sptStand(W), nf=sptNaechsteFrage();
  const kachel=a=>{ const n=sptAufgWissen(a,W).length, z=n>=2?'ok':n?'halb':'';
    return `<button type="button" class="spt-a ${z}" data-spta="${a.k}"><span class="spt-a-ic">${a.ic}</span><span class="spt-a-t"><b>${sptE(a.t)}</b><small>${n?n+(n===1?' Merksatz':' Merksätze'):'noch nichts festgehalten'}</small></span><span class="spt-a-dot" aria-hidden="true"></span></button>`; };
  return `<div class="card spt-paket" id="sptPaket"><div class="spt-lh"><div><h3 class="trh">Dein Aufgabenpaket</h3><p class="note">Spieltag &amp; Spielbetrieb laut Konzept 2030. Je mehr du erzählst, desto leichter wird es für jeden, der dir mal hilft oder das später übernimmt.</p></div>
      <div class="spt-stand" title="Übergabe-Stand"><b>${st} %</b><span>Übergabe-Stand</span></div></div>
    <div class="spt-bar" aria-hidden="true"><i style="width:${st}%"></i></div>
    ${nf?`<button type="button" class="spt-iv" id="sptIv"><span class="spt-iv-mic">${SPT_MIC}</span><span><b>Interview starten</b><small>Ich stelle dir eine Frage nach der anderen. Nächste: „${sptE(nf.frage)}“</small></span><i>${sptSVG('chev')}</i></button>`:''}
    ${SPT_AUFG.map(([g,L])=>`<h4>${sptE(g)}</h4><div class="spt-as">${L.map(kachel).join('')}</div>`).join('')}</div>`;
}
function sptPaketBind(P){
  const iv=P.querySelector('#sptIv'); if(iv)iv.onclick=()=>sptInterview();
  P.querySelectorAll('[data-spta]').forEach(b=>b.onclick=()=>sptAufgabe(b.dataset.spta));
}
function sptInterview(k,i){
  let m=sptNaechsteFrage(k); if(!m)return;
  if(k&&i!=null){ const a=SPT_ALLE.find(x=>x.k===k); if(a&&a.f[i])m={k,t:a.t,i,frage:a.f[i]}; }
  if(svCurTab()!=='sptag'){ goTab('sptag'); setTimeout(()=>sptInterview(k,i),500); return; }
  SPT.modus=m; sptMicUI(); try{ document.getElementById('sptMicKarte').scrollIntoView({behavior:'smooth',block:'start'}); }catch(e){}
  sptStart(null,m);
}
function sptAufgabe(k){
  const a=SPT_ALLE.find(x=>x.k===k); if(!a)return; const W=sptAufgWissen(a,(SPT.C&&SPT.C.wissen)||[]);
  const M=svModal(`<div class="og-form spt-aufg"><h2>${a.ic} ${sptE(a.t)}</h2><p class="note">${sptE(a.d)}</p>
    <h4>Festgehalten</h4>${W.length?W.map(w=>`<div class="spt-w"><p>${sptE(w.text)}</p><small>${w.quelle==='ansage'?'🎙️ gesprochen':'✎ von Hand'}${w.von?' · '+sptE(w.von):''}</small></div>`).join(''):'<p class="spt-leer">Noch nichts. Eine Frage beantworten reicht für den Anfang.</p>'}
    <h4>Fragen dazu</h4>${a.f.map((f,i)=>`<button type="button" class="spt-fr" data-sptfr="${i}">${SPT_MIC}<span>${sptE(f)}</span></button>`).join('')}
    <div class="btnrow sbact"><button class="btn ghost" type="button" id="sptAH">${sptSVG('plus')} Von Hand eintragen</button><button class="btn ghost" type="button" onclick="closeOverlay()">Schließen</button></div></div>`);
  M.querySelectorAll('[data-sptfr]').forEach(b=>b.onclick=()=>{ closeOverlay(); setTimeout(()=>sptInterview(k,+b.dataset.sptfr),80); });
  M.querySelector('#sptAH').onclick=()=>{ closeOverlay(); setTimeout(()=>{ sptWissenForm(null); const t=document.getElementById('sptWT'); if(t)t.value=a.t; },80); };
}
function sptWeiterZeigen(){
  const E=document.getElementById('sptErg'), w=SPT.weiter; if(!E||!w)return; const nf=sptNaechsteFrage();
  E.innerHTML=`<div class="card spt-erg spt-weiter"><p>✓ ${w.n?`${w.n} ${w.n===1?'Merksatz':'Merksätze'} zu „${sptE(w.t)}“ festgehalten. Danke!`:'Gespeichert.'}</p>
    ${nf?`<p class="note">Nächste Frage: „${sptE(nf.frage)}“</p>`:''}
    <div class="btnrow">${nf?`<button type="button" class="btn" id="sptWeiterJa">${SPT_MIC} Nächste Frage</button>`:''}<button type="button" class="btn ghost" id="sptWeiterNein">Für heute reicht's</button></div></div>`;
  const j=E.querySelector('#sptWeiterJa'); if(j)j.onclick=()=>sptInterview();
  E.querySelector('#sptWeiterNein').onclick=()=>{ SPT.weiter=null; E.innerHTML=''; kToast('Danke dir! Morgen geht es mit der nächsten Frage weiter.'); };
}

/* ---------- Wissen ---------- */
function sptWissenHtml(W){
  const T={}; (W||[]).forEach(w=>{ (T[w.thema]=T[w.thema]||[]).push(w); });
  const themen=Object.keys(T).sort((a,b)=>a.localeCompare(b,'de'));
  return `<div class="card spt-wissen" id="sptWissen"><div class="spt-lh"><div><h3 class="trh">💡 Wissen für Nachfolger</h3><p class="note">Was man wissen muss, wenn man den Spieltag mal übernimmt: wo etwas liegt, wen man anruft, was schiefgehen kann. Kommt aus deinen Ansagen oder von Hand.</p></div></div>
    ${themen.length?themen.map(t=>`<div class="spt-wt"><h4>${sptE(t)} <em>${T[t].length}</em></h4>${T[t].map(w=>`<div class="spt-w" data-sptw="${sptE(w.id)}"><p>${sptE(w.text)}</p><small>${w.quelle==='ansage'?'🎙️ aus einer Ansage':'✎ von Hand'}${w.liste?' · '+sptE(w.liste):''}</small></div>`).join('')}</div>`).join('')
      :'<p class="spt-leer">Noch nichts gemerkt. Sag bei der nächsten Ansage einfach, was du gelernt hast („Der Grill braucht 45 Minuten Vorlauf“), oder trage es hier ein.</p>'}
    <div class="btnrow"><button type="button" class="btn ghost sm" id="sptWNeu">${sptSVG('plus')} Eintragen</button><button type="button" class="btn ghost sm" id="sptWExp">${sptSVG('file')} Übergabe als Text</button></div></div>`;
}
function sptWissenBind(P){
  const n=P.querySelector('#sptWNeu'); if(n)n.onclick=()=>sptWissenForm(null);
  const x=P.querySelector('#sptWExp'); if(x)x.onclick=()=>sptUebergabe();
  P.querySelectorAll('[data-sptw]').forEach(d=>d.onclick=()=>sptWissenForm(d.dataset.sptw));
}
function sptWissenForm(id){
  const w=id?(SPT.C.wissen||[]).find(x=>x.id===id):null; const themen=[...new Set((SPT.C.wissen||[]).map(x=>x.thema))];
  const M=svModal(`<div class="og-form"><h2>💡 ${w?'Eintrag ändern':'Wissen eintragen'}</h2>
    <label>Thema<input id="sptWT" maxlength="80" list="sptThemen" value="${sptE(w?w.thema:'')}" placeholder="z. B. Sportplatzkasse &amp; Wechselgeld"><datalist id="sptThemen">${SPT_ALLE.map(a=>a.t).concat(['Allgemein']).concat(themen).filter((v,i,a)=>a.indexOf(v)===i).map(t=>`<option value="${sptE(t)}">`).join('')}</datalist></label>
    <label>Merksatz<textarea id="sptWX" rows="4" maxlength="2000" placeholder="So, dass es jemand versteht, der das zum ersten Mal macht.">${sptE(w?w.text:'')}</textarea></label>
    <div class="btnrow sbact"><button class="btn" type="button" id="sptWS">${sptSVG('check')} Speichern</button>${w?`<button class="btn ghost" type="button" id="sptWL">${sptSVG('trash')} Löschen</button>`:''}<button class="btn ghost" type="button" onclick="closeOverlay()">Abbrechen</button></div></div>`);
  M.querySelector('#sptWS').onclick=async()=>{ try{ const W=await sptRpc('spieltag_wissen_speichern',{p_id:id||null,p_thema:M.querySelector('#sptWT').value,p_text:M.querySelector('#sptWX').value}); SPT.C.wissen=W; closeOverlay(); kToast('✓ Gemerkt'); sptRender(); }catch(e){ kToast('⚠️ '+e.message); } };
  const l=M.querySelector('#sptWL'); if(l)l.onclick=async()=>{ try{ const W=await sptRpc('spieltag_wissen_loeschen',{p_id:id}); SPT.C.wissen=W; closeOverlay(); kToast('Gelöscht'); sptRender(); }catch(e){ kToast('⚠️ '+e.message); } };
  setTimeout(()=>M.querySelector(w?'#sptWX':'#sptWT').focus(),50);
}
async function sptUebergabe(){
  let t; try{ t=await sptRpc('spieltag_uebergabe'); }catch(e){ kToast('⚠️ '+e.message); return; }
  try{ const W=(SPT.C&&SPT.C.wissen)||[]; let p='## Aufgabenpaket Spieltag & Spielbetrieb (Konzept 2030)\n\nÜbergabe-Stand: '+sptStand(W)+' %\n';
    SPT_AUFG.forEach(([g,L])=>{ p+='\n### '+g+'\n\n'; L.forEach(a=>{ const n=sptAufgWissen(a,W).length; p+='- '+a.t+' ('+a.d+'): '+(n?n+(n===1?' Merksatz':' Merksätze'):'noch nichts festgehalten')+'\n'; if(n<2)p+='  Offene Fragen: '+a.f.join(' ')+'\n'; }); });
    t=t.replace('\n## Was man wissen muss','\n'+p+'\n## Was man wissen muss'); }catch(e){}
  const M=svModal(`<div class="og-form spt-ueb"><h2>📄 Übergabe Spieltag</h2><p class="note">Alles auf einer Seite: wer was macht, dein Wissen je Thema und der Ablauf eines Heimspiels. Zum Weitergeben an die Nachfolge, zum Ausdrucken oder für den Vereins-Drive.</p>
    <textarea id="sptUebT" rows="14" readonly>${sptE(t)}</textarea>
    <div class="btnrow sbact"><button class="btn" type="button" id="sptUebC">${sptSVG('copy')} Kopieren</button>${navigator.share?`<button class="btn ghost" type="button" id="sptUebS">${sptSVG('share')} Teilen</button>`:''}<button class="btn ghost" type="button" id="sptUebD">${sptSVG('download')} Als Datei</button></div></div>`);
  M.querySelector('#sptUebC').onclick=async()=>{ try{ await navigator.clipboard.writeText(t); kToast('✓ Kopiert'); }catch(e){ const a=M.querySelector('#sptUebT'); a.focus(); a.select(); kToast('Markiert, jetzt kopieren'); } };
  const s=M.querySelector('#sptUebS'); if(s)s.onclick=()=>{ navigator.share({title:'Übergabe Spieltag SV/BSC',text:t}).catch(()=>{}); };
  M.querySelector('#sptUebD').onclick=()=>{ try{ const b=new Blob([t],{type:'text/markdown;charset=utf-8'}), a=document.createElement('a'); a.href=URL.createObjectURL(b); a.download='Uebergabe-Spieltag-'+new Date().toISOString().slice(0,10)+'.md'; document.body.appendChild(a); a.click(); setTimeout(()=>{ URL.revokeObjectURL(a.href); a.remove(); },500); }catch(e){ kToast('⚠️ '+e.message); } };
}

/* ---------- Start: Karte auf der Übersicht ---------- */
async function sptHome(){
  const home=document.getElementById('panel-home'); if(!home)return;
  // auch wenn zuletzt gesperrt: der Server entscheidet (Freischaltung kommt so von selbst an)
  const C=await sptLaden(true); if(!C||!(C.ich.spieltag||C.ich.admin)){ const b=document.getElementById('sptHome'); if(b)b.remove(); return; }
  let box=document.getElementById('sptHome');
  if(!box){ box=document.createElement('div'); box.id='sptHome'; box.className='card spt-home'; const k=document.getElementById('svCockpit')||document.getElementById('svrMeine'); if(k)k.after(box); else home.prepend(box); }
  const N=C.naechste, K=(C.kommende||[])[0], offen=N?N.punkte.filter(p=>!p.e).length:0;
  box.innerHTML=`<button type="button" class="spt-home-mic" id="sptHomeMic" aria-label="Ansage starten">${SPT_MIC}</button>
    <div class="spt-home-t"><h3>Mein Spieltag <em class="spt-home-st">Übergabe ${sptStand(C.wissen||[])} %</em></h3><p>${N?`${sptE(sptTag(N.datum))}${N.zeit?', '+sptE(N.zeit)+' Uhr':''}: ${sptE(N.titel.replace(/^Heimspiel /,''))}. ${offen?`<b>${offen} offen</b>.`:'Alles abgehakt.'}`:K?`Nächstes Heimspiel ${sptE(sptTag(K.d))} gegen ${sptE(K.gegner||'?')}.`:'Gerade kein Heimspiel.'}</p></div>
    ${N&&typeof ogRing==='function'?ogRing(N.punkte.length-offen,N.punkte.length):''}<button type="button" class="btn ghost sm" id="sptHomeGo">Öffnen ${sptSVG('chev')}</button>`;
  box.querySelector('#sptHomeGo').onclick=()=>goTab('sptag');
  box.querySelector('#sptHomeMic').onclick=()=>{ goTab('sptag'); setTimeout(()=>{ if(!SPT.an)sptStart(N?N.id:null); },400); };
}
{ const _rh=renderHome; renderHome=function(){ const r=_rh.apply(this,arguments); try{ setTimeout(sptHome,500); }catch(e){} return r; }; }

/* ---------- Push „Sag mir, was erledigt ist“ öffnet direkt die Ansage ---------- */
{ const _zi=svzInhalt; svzInhalt=async function(m){ const x=await _zi.apply(this,arguments);
    if(m&&m.art==='orga'&&(m.data||{}).ansage)x.knopf=`<button class="btn sv32-go" type="button" data-svzspt="${sptE(m.data.liste||'')}">${SPT_MIC} <span>Ansage starten</span></button>`;
    return x; }; }
{ const _mz=svMeldungZeigen; svMeldungZeigen=async function(){ const r=await _mz.apply(this,arguments);
    try{ document.querySelectorAll('#modal [data-svzspt]').forEach(b=>b.onclick=()=>{ closeOverlay(); const id=b.dataset.svzspt; goTab('sptag'); const warte=()=>{ if(SPT.C){ if(!SPT.an)sptStart(id||(SPT.C.naechste?SPT.C.naechste.id:null)); } else setTimeout(warte,300); }; setTimeout(warte,300); }); }catch(e){} return r; }; }

(function(){ try{ const s=document.createElement('style'); s.id='svm42css'; s.textContent="/* Beta 0.40 · Mein Spieltag: große Knöpfe, ein Mikrofon, wenig Text. Für Leute, die nicht jeden Tag Apps bedienen. */\n.spt-kopf{display:flex;justify-content:space-between;align-items:flex-start;gap:14px;flex-wrap:wrap;margin:4px 0 14px;}\n.spt-kopf h2{margin:0 0 6px;font-size:30px;letter-spacing:-.02em;line-height:1.1;text-wrap:balance;}\n.spt-kopf h2 span{background:linear-gradient(90deg,#9cc3ff 0%,#5b9bff 45%,#b9adff 100%);-webkit-background-clip:text;background-clip:text;color:transparent;}\n.spt-kopf p{margin:0;font-size:16px;color:var(--ink2);max-width:62ch;line-height:1.45;}\n.spt-kopf p b{color:var(--ink);}\n.spt-wer{font-size:12.5px;color:var(--ink3);background:rgba(255,255,255,.06);border:1px solid rgba(255,255,255,.1);border-radius:999px;padding:6px 11px;white-space:nowrap;}\n/* Hinweis für den Admin */\n.spt-hinweis{font-size:14.5px;line-height:1.45;color:var(--ink2);border-color:rgba(251,191,36,.35)!important;}\n.spt-hinweis b{color:var(--ink);}\n/* Mikrofon-Karte */\n.spt-mic-karte{display:grid;grid-template-columns:auto 1fr;gap:16px 18px;align-items:center;padding:20px 18px;overflow:hidden;}\n.spt-mic{position:relative;width:96px;height:96px;border-radius:50%;border:1px solid rgba(255,255,255,.22);background:var(--grad-brand,linear-gradient(135deg,#3b7bff,#7c6cf6));color:#fff;cursor:pointer;display:grid;place-items:center;\n  box-shadow:inset 0 1px 0 rgba(255,255,255,.35),0 18px 40px -12px rgba(59,123,255,.7),0 2px 6px -2px rgba(0,0,0,.6);transition:transform .15s var(--ease),box-shadow .2s;-webkit-tap-highlight-color:transparent;}\n.spt-mic svg{width:44px;height:44px;position:relative;z-index:1;}\n.spt-mic:active{transform:scale(.96);}\n.spt-puls{position:absolute;inset:-6px;border-radius:50%;border:3px solid rgba(255,255,255,.0);pointer-events:none;}\n.spt-mic-karte.an .spt-mic{background:linear-gradient(135deg,#ff5f6d,#e0245e 60%,#b4175a);box-shadow:inset 0 1px 0 rgba(255,255,255,.35),0 18px 44px -10px rgba(224,36,94,.75);}\n.spt-mic-karte.an .spt-puls{border-color:rgba(255,95,109,.7);animation:sptPuls 1.4s ease-out infinite;}\n@keyframes sptPuls{0%{transform:scale(.92);opacity:.9}100%{transform:scale(1.45);opacity:0}}\n.spt-mic-txt b{display:block;font-size:22px;letter-spacing:-.01em;line-height:1.1;margin-bottom:4px;}\n.spt-mic-txt small{display:block;font-size:15px;color:var(--ink2);line-height:1.4;}\n.spt-live{grid-column:1/-1;background:linear-gradient(160deg,rgba(255,255,255,.07),rgba(255,255,255,.02));border:1px solid rgba(255,255,255,.1);border-radius:14px;padding:12px 14px;min-height:54px;}\n.spt-live p{margin:0;font-size:17px;line-height:1.45;color:var(--ink);}\n.spt-live i{color:var(--ink3);font-style:normal;}\n.spt-warte{color:var(--ink3);font-size:14.5px;}\n.spt-tipp{grid-column:1/-1;display:grid;gap:10px;} .spt-tipp[hidden],.spt-live[hidden]{display:none;}\n.spt-tipp textarea{width:100%;font:inherit;font-size:16px;padding:12px;border-radius:12px;border:1px solid rgba(255,255,255,.14);background:rgba(255,255,255,.05);color:var(--ink);resize:vertical;}\n.spt-mic-fuss{grid-column:1/-1;display:flex;justify-content:space-between;align-items:center;gap:12px;flex-wrap:wrap;color:var(--ink3);font-size:13.5px;}\n.spt-schalter{display:flex;align-items:center;gap:8px;cursor:pointer;}\n.spt-schalter input{width:18px;height:18px;accent-color:#5b9bff;}\n.spt-link{background:none;border:0;color:var(--brand2,#5b9bff);font:inherit;font-size:13.5px;cursor:pointer;padding:4px 0;text-decoration:underline;text-underline-offset:3px;}\n/* Ergebnis der Ansage */\n.spt-erg{border-color:rgba(91,155,255,.35)!important;}\n.spt-erg.fehler{border-color:rgba(245,158,11,.4)!important;}\n.spt-antwort{display:flex;gap:12px;align-items:flex-start;margin-bottom:12px;}\n.spt-av{flex:none;width:36px;height:36px;border-radius:10px;display:grid;place-items:center;background:var(--grad-brand,#3b7bff);color:#fff;box-shadow:inset 0 1px 0 rgba(255,255,255,.3);}\n.spt-av svg{width:20px;height:20px;}\n.spt-antwort p{margin:0;font-size:17px;line-height:1.45;}\n.spt-antwort em{color:var(--ink2);font-style:normal;}\n.spt-zeilen{display:grid;gap:6px;margin:6px 0 10px;}\n.spt-z{display:grid;grid-template-columns:auto auto 1fr;gap:10px;align-items:center;padding:10px 12px;border-radius:12px;background:linear-gradient(160deg,rgba(255,255,255,.07),rgba(255,255,255,.02));border:1px solid rgba(255,255,255,.09);cursor:pointer;}\n.spt-z input{width:20px;height:20px;accent-color:#22c55e;}\n.spt-z:has(input:not(:checked)){opacity:.45;text-decoration:line-through;}\n.spt-zi{width:26px;height:26px;border-radius:8px;display:grid;place-items:center;font-weight:900;font-size:14px;background:rgba(255,255,255,.1);}\n.spt-z b{display:block;font-size:15px;}\n.spt-z small{display:block;color:var(--ink3);font-size:13px;margin-top:2px;}\n.spt-passt{font-size:16px;}\n.spt-trans{margin-top:10px;color:var(--ink3);font-size:13.5px;}\n.spt-trans p{margin:6px 0 0;color:var(--ink2);}\n.spt-denkt{display:flex;gap:6px;margin-bottom:8px;}\n.spt-denkt span{width:9px;height:9px;border-radius:50%;background:#5b9bff;animation:sptDenkt 1.1s infinite ease-in-out;}\n.spt-denkt span:nth-child(2){animation-delay:.18s} .spt-denkt span:nth-child(3){animation-delay:.36s}\n@keyframes sptDenkt{0%,80%,100%{transform:scale(.6);opacity:.4}40%{transform:scale(1);opacity:1}}\n/* Checkliste mit großen Kreisen */\n.spt-lh{display:flex;justify-content:space-between;align-items:flex-start;gap:12px;margin-bottom:6px;}\n.spt-lh h3{margin:0 0 4px;font-size:19px;}\n.spt-lh .note{margin:0;}\n.spt-liste h4{margin:14px 0 6px;font-size:13px;text-transform:uppercase;letter-spacing:.06em;color:var(--ink3);display:flex;gap:8px;align-items:center;}\n.spt-liste h4 em,.spt-wt h4 em{font-style:normal;background:rgba(255,255,255,.1);border-radius:999px;padding:1px 8px;font-size:12px;color:var(--ink2);}\n.spt-p{display:grid;grid-template-columns:auto 1fr;gap:12px;align-items:center;width:100%;text-align:left;padding:10px 12px;margin:0 0 6px;border-radius:14px;border:1px solid rgba(255,255,255,.09);background:linear-gradient(160deg,rgba(255,255,255,.07),rgba(255,255,255,.02));color:var(--ink);cursor:pointer;font:inherit;-webkit-tap-highlight-color:transparent;transition:transform .12s var(--ease),opacity .2s;}\n.spt-p:active{transform:scale(.985);}\n.spt-kreis{width:38px;height:38px;border-radius:50%;border:2.5px solid rgba(255,255,255,.35);display:grid;place-items:center;font-weight:900;font-size:19px;color:#fff;transition:background .2s,border-color .2s;}\n.spt-p.ok .spt-kreis{background:linear-gradient(135deg,#22c55e,#15803d);border-color:transparent;box-shadow:0 6px 16px -6px rgba(34,197,94,.7);}\n.spt-p.ok .spt-pt b{text-decoration:line-through;color:var(--ink3);}\n.spt-pt b{display:block;font-size:16px;line-height:1.3;}\n.spt-pt small{display:block;color:var(--ink3);font-size:13px;margin-top:2px;}\n.spt-fertig{font-size:17px;margin:10px 0;}\n.spt-ok{margin-top:8px;color:var(--ink3);font-size:14px;}\n.spt-ok summary{cursor:pointer;padding:6px 0;}\n.spt-ok .spt-p{opacity:.7;}\n/* Weitere Heimspiele */\n.spt-k{display:flex;justify-content:space-between;gap:10px;padding:10px 0;border-bottom:1px solid rgba(255,255,255,.07);font-size:15px;}\n.spt-k:last-child{border-bottom:0;}\n.spt-k span{color:var(--ink2);text-align:right;}\n/* Wissen */\n.spt-wt{margin-top:12px;}\n.spt-wt h4{margin:0 0 6px;font-size:15px;display:flex;gap:8px;align-items:center;}\n.spt-w{padding:10px 12px;margin-bottom:6px;border-radius:12px;background:linear-gradient(160deg,rgba(251,213,106,.1),rgba(251,213,106,.02));border:1px solid rgba(251,191,36,.18);cursor:pointer;}\n.spt-w p{margin:0;font-size:15.5px;line-height:1.4;}\n.spt-w small{display:block;color:var(--ink3);font-size:12.5px;margin-top:4px;}\n.spt-leer{color:var(--ink2);font-size:15px;}\n.spt-ueb textarea{width:100%;font-family:ui-monospace,Menlo,monospace;font-size:13px;padding:12px;border-radius:12px;border:1px solid rgba(255,255,255,.14);background:rgba(255,255,255,.05);color:var(--ink);}\n/* Zahlen */\n.spt-zahlen{display:grid;grid-template-columns:repeat(4,1fr);gap:10px;margin:4px 0 20px;}\n.spt-zahlen div{padding:12px;border-radius:14px;background:linear-gradient(160deg,rgba(255,255,255,.07),rgba(255,255,255,.02));border:1px solid rgba(255,255,255,.09);text-align:center;}\n.spt-zahlen b{display:block;font-size:24px;letter-spacing:-.02em;background:linear-gradient(90deg,#fff,#cfe0ff);-webkit-background-clip:text;background-clip:text;color:transparent;}\n.spt-zahlen span{display:block;font-size:12px;color:var(--ink3);margin-top:2px;line-height:1.3;}\n/* Übersicht-Karte */\n.spt-home{display:grid;grid-template-columns:auto 1fr auto auto;gap:12px;align-items:center;}\n.spt-home-mic{width:56px;height:56px;border-radius:50%;border:1px solid rgba(255,255,255,.2);background:var(--grad-brand,#3b7bff);color:#fff;display:grid;place-items:center;cursor:pointer;box-shadow:inset 0 1px 0 rgba(255,255,255,.3),0 12px 26px -10px rgba(59,123,255,.7);}\n.spt-home-mic svg{width:26px;height:26px;}\n.spt-home-t h3{margin:0 0 3px;font-size:17px;}\n.spt-home-t p{margin:0;font-size:14px;color:var(--ink2);line-height:1.35;}\n.spt-home-t p b{color:var(--ink);}\n@media (max-width:620px){\n  .spt-kopf h2{font-size:26px;}\n  .spt-mic-karte{grid-template-columns:1fr;justify-items:center;text-align:center;}\n  .spt-mic{width:112px;height:112px;} .spt-mic svg{width:52px;height:52px;}\n  .spt-zahlen{grid-template-columns:1fr 1fr;}\n  .spt-home{grid-template-columns:auto 1fr;} .spt-home .og-ring{display:none;} .spt-home #sptHomeGo{grid-column:1/-1;justify-self:start;}\n}\n@media (prefers-reduced-motion:reduce){ .spt-puls,.spt-denkt span{animation:none!important;} }\n/* 0.41 · Aufgabenpaket & Interview */\n.spt-stand{text-align:right;flex:none;}\n.spt-stand b{display:block;font-size:26px;letter-spacing:-.02em;line-height:1;background:linear-gradient(90deg,#fff,#cfe0ff);-webkit-background-clip:text;background-clip:text;color:transparent;}\n.spt-stand span{font-size:11.5px;color:var(--ink3);text-transform:uppercase;letter-spacing:.06em;}\n.spt-bar{height:8px;border-radius:999px;background:rgba(255,255,255,.08);overflow:hidden;margin:10px 0 14px;}\n.spt-bar i{display:block;height:100%;border-radius:inherit;background:linear-gradient(90deg,#22c55e,#5b9bff 70%,#7c6cf6);transition:width .6s var(--ease);}\n.spt-iv{display:grid;grid-template-columns:auto 1fr auto;gap:12px;align-items:center;width:100%;text-align:left;padding:12px 14px;margin-bottom:8px;border-radius:16px;cursor:pointer;font:inherit;color:var(--ink);\n  border:1px solid rgba(91,155,255,.4);background:radial-gradient(400px 120px at 0% 0%,rgba(59,123,255,.25),transparent 70%),linear-gradient(160deg,rgba(255,255,255,.08),rgba(255,255,255,.02));box-shadow:inset 0 1px 0 rgba(255,255,255,.1);}\n.spt-iv-mic{width:44px;height:44px;border-radius:50%;display:grid;place-items:center;background:var(--grad-brand,#3b7bff);color:#fff;box-shadow:0 8px 20px -8px rgba(59,123,255,.7);}\n.spt-iv-mic svg{width:22px;height:22px;}\n.spt-iv b{display:block;font-size:16px;}\n.spt-iv small{display:block;color:var(--ink2);font-size:13.5px;margin-top:2px;line-height:1.35;}\n.spt-iv i{color:var(--ink3);}\n.spt-paket h4{margin:14px 0 6px;font-size:13px;text-transform:uppercase;letter-spacing:.06em;color:var(--ink3);}\n.spt-as{display:grid;grid-template-columns:repeat(auto-fill,minmax(230px,1fr));gap:8px;}\n.spt-a{position:relative;display:grid;grid-template-columns:auto 1fr auto;gap:10px;align-items:center;text-align:left;padding:10px 12px;border-radius:14px;cursor:pointer;font:inherit;color:var(--ink);\n  border:1px solid rgba(255,255,255,.09);background:linear-gradient(160deg,rgba(255,255,255,.07),rgba(255,255,255,.02));transition:border-color .15s,transform .12s;}\n.spt-a:hover{border-color:rgba(91,155,255,.45);} .spt-a:active{transform:scale(.985);}\n.spt-a-ic{font-size:22px;width:36px;height:36px;display:grid;place-items:center;border-radius:10px;background:rgba(255,255,255,.07);}\n.spt-a-t b{display:block;font-size:14.5px;line-height:1.25;}\n.spt-a-t small{display:block;color:var(--ink3);font-size:12.5px;margin-top:2px;}\n.spt-a-dot{width:12px;height:12px;border-radius:50%;border:2px solid rgba(255,255,255,.3);}\n.spt-a.halb .spt-a-dot{background:#f59e0b;border-color:#f59e0b;box-shadow:0 0 10px -2px #f59e0b;}\n.spt-a.ok .spt-a-dot{background:#22c55e;border-color:#22c55e;box-shadow:0 0 10px -2px #22c55e;}\n.spt-mic-karte.interview{border-color:rgba(124,108,246,.45)!important;}\n.spt-mic-karte.interview .spt-mic-txt small{color:var(--ink);font-size:17px;}\n.spt-aufg h4{margin:16px 0 6px;font-size:13px;text-transform:uppercase;letter-spacing:.06em;color:var(--ink3);}\n.spt-fr{display:grid;grid-template-columns:auto 1fr;gap:10px;align-items:center;width:100%;text-align:left;padding:10px 12px;margin-bottom:6px;border-radius:12px;cursor:pointer;font:inherit;font-size:15px;color:var(--ink);\n  border:1px solid rgba(91,155,255,.3);background:linear-gradient(160deg,rgba(59,123,255,.12),rgba(255,255,255,.02));}\n.spt-fr svg{width:20px;height:20px;color:#9cc3ff;}\n.spt-weiter p{font-size:16px;margin:0 0 8px;}\n.spt-home-st{font-style:normal;font-size:11.5px;font-weight:700;color:#bbf7d0;background:rgba(34,197,94,.14);border:1px solid rgba(34,197,94,.3);border-radius:999px;padding:2px 8px;margin-left:6px;vertical-align:middle;}\n@media (max-width:620px){ .spt-as{grid-template-columns:1fr;} .spt-stand b{font-size:22px;} }\n.spt-mehr{display:flex;align-items:center;justify-content:center;gap:6px;width:100%;padding:10px;margin:2px 0 6px;border-radius:12px;border:1px dashed rgba(255,255,255,.18);background:none;color:var(--ink2);font:inherit;font-size:14px;cursor:pointer;}\n.spt-mehr:hover{border-color:rgba(91,155,255,.5);color:var(--ink);} .spt-mehr svg{width:16px;height:16px;}\n"; document.head.appendChild(s); }catch(e){} })();
/* =====================================================================
   Sportzentrale Beta 0.42
   - FuPa-MVP ist raus: kein Wert mehr im MScore, im Wechsel-Index, im Profil, in Tabellen oder in der Datenbank-Pflege.
   - Rückkehrer-Radar wohnt jetzt im Scouting (Radar), nicht mehr unter Rankings & Verein.
   ===================================================================== */

/* ---------- FuPa-MVP: überall abgeschaltet. Alle Stellen fragen mvpOf, also liefert es nichts mehr. ---------- */
try{ mvpOf=function(){ return null; }; }catch(e){}
try{ if(typeof renderMvpCard==='function')renderMvpCard=function(){ const el=document.getElementById('mvpCard'); if(el)el.remove(); }; }catch(e){}
try{ if(typeof players!=='undefined'&&Array.isArray(players))players.forEach(p=>{ if(p&&'mvp' in p)delete p.mvp; }); }catch(e){}
try{ if(typeof applyMvpSeed==='function')applyMvpSeed=function(){}; }catch(e){}
try{ if(typeof SV4_CL!=='undefined'&&SV4_CL)delete SV4_CL.mvp; }catch(e){}

/* ---------- Rückkehrer-Radar im Scouting ---------- */
const RK43={offen:false};
function rk43Liste(){
  if(typeof VR==='undefined'||!VR.atLoaded||typeof vrRanks!=='function')return null;
  const {L}=vrRanks();
  return L.filter(x=>{ const p=x.pid&&trP(x.pid); return p&&!p.own&&x.tot.sp>=25&&!(typeof crmOf==='function'&&crmOf(p).s==='no'); })
    .sort((a,b)=>b.tot.sp-a.tot.sp).slice(0,12);
}
function rk43Html(){
  const back=rk43Liste();
  if(back==null)return `<div class="card rk43"><h3 class="trh">${SVI('refresh')} Rückkehrer-Radar</h3><div class="empty">Lade Vereinsstatistik …</div></div>`;
  if(!back.length)return '';
  const zeig=RK43.offen?back:back.slice(0,5);
  return `<div class="card rk43"><h3 class="trh">${SVI('refresh')} Rückkehrer-Radar <small>${back.length} Ehemalige</small></h3>
    <div class="note" style="margin-top:0">Ehemalige mit vielen Spielen für uns, die laut Datenbestand jetzt woanders spielen. Nach rechts wischen: kein Interesse, nach links: interessiert (Merkliste).</div>
    <div class="vrbackl">${zeig.map(x=>{ const p=trP(x.pid); return `<div class="tra vrback${p.star?' vrfav':''}"><span class="tra-av" data-svp="${svEsc(x.pid)}">${avaHtml(p)}</span><div class="tra-b"><b data-svp="${svEsc(x.pid)}">${svEsc(typeof vrAtName==='function'?vrAtName(x):p.name)}${p.star?' ⭐':''}</b><span>${x.tot.sp} Spiele für uns · jetzt ${svEsc(p.club||'?')}${p.cur&&p.cur.tore?' · '+p.cur.tore+' Tore in dieser Saison':''}</span></div></div>`; }).join('')}</div>
    ${back.length>5?`<button class="btn ghost sm rk43mehr" type="button">${RK43.offen?'Weniger zeigen':'Alle '+back.length+' zeigen'}</button>`:''}</div>`;
}
{ const _rr43=rdRender; rdRender=function(){ const r=_rr43.apply(this,arguments);
  try{
    const P=document.getElementById('panel-radar'); if(!P||!canScout()||!VR.radarLoaded)return r;
    if(VR.rf&&VR.rf!=='alle')return r;
    if(!VR.atLoaded&&!RK43.lade){ RK43.lade=1; vrLoadAllTime(); }
    P.querySelector('.rk43')?.remove();
    const h=rk43Html(); if(!h)return r;
    const t=document.createElement('div'); t.innerHTML=h; const card=t.firstElementChild;
    const tabs=P.querySelector('.trtabs.rdf'); if(tabs)tabs.after(card); else P.prepend(card);
    card.querySelectorAll('[data-svp]').forEach(x=>x.onclick=()=>openModal(x.dataset.svp));
    const m=card.querySelector('.rk43mehr'); if(m)m.onclick=()=>{ RK43.offen=!RK43.offen; rdRender(); };
  }catch(e){ console.warn('Rückkehrer',e); }
  return r; }; }

/* ---------- Spielerprofil aufgeräumt: Wichtiges zuerst, jede Info an ihrem Platz ----------
   Eigene Spieler: Statistik, Vereinswerte (All-Time), Training & Fitness, Kaderplanung. Darunter, abgesetzt: Hintergrund & Daten.
   All-Time-Werte, Vereinstreue und Mit/Ohne stehen jetzt unter „Vereinswerte“, nicht mehr unter Training.
   Die Beteiligungstabelle (Training je Saison) wandert von der Statistik ins Training. Oben bleiben vier Kacheln. */
function pf43Sec(secs,k,t){
  let d=secs.querySelector(`:scope > .pf4-sec[data-k="${k}"]`); if(d)return d;
  d=document.createElement('details'); d.className='pf4-sec'; d.dataset.k=k; if(typeof PF4!=='undefined'&&PF4.open.has(k))d.open=true;
  d.innerHTML=`<summary><span>${t}</span></summary><div class="pf4-b"></div>`;
  d.addEventListener('toggle',()=>{ try{ if(d.open)PF4.open.add(k); else PF4.open.delete(k); }catch(e){} });
  secs.appendChild(d); return d;
}
function pf43Ordnen(id){
  const M=document.getElementById('modal'), root=M&&M.querySelector('.pf4'), secs=root&&root.querySelector('.pf4-secs'); if(!secs)return;
  const p=typeof sv4P==='function'?sv4P(id):trP(id); if(!p)return;
  const own=!!(typeof sv4Team==='function'?sv4Team(p):p.own);
  const G=root.querySelector('.pf4-glance');
  if(G){ let ein=0;
    [...G.querySelectorAll(':scope > .g4')].forEach(t=>{ const l=((t.querySelector('span')||{}).textContent||'').trim();
      if(/^Letztes Gespräch/.test(l))t.remove();
      else if(/^Einsätze/.test(l)){ ein++; if(ein>1)t.remove(); } }); }
  if(own){
    const treue=G&&G.querySelector('.g4.tr70'), vr=M.querySelector('.card.vrprof');
    if(treue||vr){
      const b=pf43Sec(secs,'verein','Vereinswerte (All-Time)').querySelector('.pf4-b');
      if(treue){ treue.classList.add('pf43-treue'); b.prepend(treue); }
      if(vr){ const h=vr.querySelector(':scope > h3.trh'); if(h)h.remove(); vr.classList.add('pf43-vr'); b.appendChild(vr);
        const ts=[...vr.querySelectorAll('.vrsc3 > button')].find(x=>/Trainings-Score/.test(x.textContent));
        const trb=secs.querySelector(':scope > [data-k="train"] .pf4-b');
        if(ts&&trb){ const w=document.createElement('div'); w.className='vrsc3 pf43-ts'; w.appendChild(ts); trb.appendChild(w); }
        if(treue){ const lo=[...vr.querySelectorAll('.vrsc3 > button')].find(x=>/^\s*Loyalität/.test(x.textContent)); if(lo)lo.remove(); }
        const rest=vr.querySelector('.vrsc3'); if(rest&&!rest.children.length)rest.remove(); }
    }
    const st=secs.querySelector(':scope > [data-k="stat"] .pf4-b'), h5=st&&st.querySelector('h5.pf41h'), tb=st&&st.querySelector('table.pf41');
    if(h5&&tb){ const trb=pf43Sec(secs,'train','Training & Fitness').querySelector('.pf4-b'); trb.appendChild(h5); trb.appendChild(tb); }
    const tr=secs.querySelector(':scope > [data-k="train"]'); if(tr&&!tr.querySelector('.pf4-b').textContent.trim())tr.remove();
  }
  const vorn=own?['stat','verein','train','kader']:['kand','stat','score','wechsel'];
  const hinten=own?['score','fupa','bogen','kontakt','presse','mehr']:['fupa','bogen','presse','kontakt','mehr'];
  const alle=[...secs.children].filter(x=>x.matches('details.pf4-sec'));
  const by=k=>alle.find(x=>x.dataset.k===k);
  secs.querySelector(':scope > .pf43-sep')?.remove();
  const A=vorn.map(by).filter(Boolean), Bh=hinten.map(by).filter(Boolean), E=by('edit');
  const sonst=alle.filter(x=>!A.includes(x)&&!Bh.includes(x)&&x!==E);
  A.forEach(x=>secs.appendChild(x));
  if(Bh.length||sonst.length){ const s=document.createElement('div'); s.className='pf43-sep'; s.textContent='Hintergrund & Daten'; secs.appendChild(s); }
  Bh.forEach(x=>secs.appendChild(x)); sonst.forEach(x=>secs.appendChild(x)); if(E)secs.appendChild(E);
}
{ const _om43b=openModal; openModal=function(id){ const r=_om43b.apply(this,arguments); try{ pf43Ordnen(id); }catch(e){ console.warn('Profil 0.42',e); } return r; }; }

/* =====================================================================
   Sportzentrale Beta 0.42 · Datenprüfung (nur Admin, Verwaltung → Datenprüfung)
   1. Doppelte Spieler: erkennt Zwischennamen, Schreibweisen (ü/ue, Tippfehler), Kurzformen und vertauschte Namen.
      Zeigt, worin sich die Einträge widersprechen. Der Admin bestätigt, dann wird dauerhaft zu einem Spieler zusammengeführt
      (Server: spieler_zusammenfuehren, hängt alle Einträge um und merkt sich den anderen Namen als frühere Schreibweise).
   2. Namensvarianten: Namen aus fussball.de-Spielberichten und der Vereinsstatistik, die keinem Spieler zugeordnet sind,
      aber einem eigenen Spieler sehr ähnlich sehen. Bestätigen hinterlegt die Schreibweise dauerhaft.
   3. Spieldaten: je Spiel App, FuPa und fussball.de nebeneinander. Lücken werden aus der anderen Quelle gefüllt,
      Widersprüche offen gezeigt, mit der plausibelsten Annahme. Der Admin bestätigt oder übernimmt die Annahme.
   Entscheidungen liegen in daten_entscheide (Migration 080). Fehlt die Migration noch, merkt sich das Gerät sie vorläufig.
   ===================================================================== */
const DP={sicht:'dub',team:'1',ent:null,entLade:false,ohneDb:false,alle:{},sure:{},busy:false,zeigAlle:{}};
const dpE=s=>svEsc(s==null?'':String(s));

/* ---------- Entscheidungen ---------- */
function dpEntLokal(){ try{ return JSON.parse(localStorage.getItem('sv_dp_ent')||'{}')||{}; }catch(e){ return {}; } }
async function dpEntLaden(force){
  if(DP.entLade||(DP.ent&&!force))return; DP.entLade=true;
  try{ const {data,error}=await SVB.sb.rpc('daten_entscheide_liste'); if(error)throw error;
    DP.ent=new Map((data||[]).map(x=>[x.art+'§'+x.s,x])); DP.ohneDb=false; }
  catch(e){ DP.ohneDb=true; const L=dpEntLokal(); DP.ent=new Map(Object.entries(L)); }
  DP.entLade=false; dpRender();
}
function dpEnt(art,s){ return DP.ent?DP.ent.get(art+'§'+s)||null:null; }
async function dpEntscheiden(art,s,e,d){
  const x={art,s,e,d:d||{},am:new Date().toISOString(),wer:(typeof SVU!=='undefined'&&SVU.name)||''};
  if(!DP.ohneDb){ try{ const {error}=await SVB.sb.rpc('daten_entscheiden',{p_art:art,p_schluessel:s,p_entscheid:e||'',p_details:d||{}}); if(error)throw error; }
    catch(err){ if(/daten_entscheiden|function|schema cache/i.test(err.message||''))DP.ohneDb=true; else throw err; } }
  if(DP.ohneDb){ const L=dpEntLokal(); if(e)L[art+'§'+s]=x; else delete L[art+'§'+s]; try{ localStorage.setItem('sv_dp_ent',JSON.stringify(L)); }catch(err){} }
  if(!DP.ent)DP.ent=new Map(); if(e)DP.ent.set(art+'§'+s,x); else DP.ent.delete(art+'§'+s);
}

/* ---------- Namen vergleichen ---------- */
function dpN(s){ return String(s||'').replace(/\s*\([^)]*\)\s*$/,'').toLowerCase().replace(/ß/g,'ss').replace(/ä/g,'ae').replace(/ö/g,'oe').replace(/ü/g,'ue')
  .normalize('NFD').replace(/[̀-ͯ]/g,'').replace(/[^a-z\s-]/g,' ').replace(/-/g,' ').replace(/\s+/g,' ').trim(); }
function dpLoose(s){ return dpN(s).replace(/ae/g,'a').replace(/oe/g,'o').replace(/ue/g,'u').replace(/ss/g,'s').replace(/ph/g,'f').replace(/th/g,'t').replace(/(.)\1+/g,'$1').replace(/\s/g,''); }
function dpTeile(name){ const w=dpN(name).split(' ').filter(Boolean); return {w,f:w[0]||'',l:w[w.length-1]||'',mid:w.slice(1,-1)}; }
function dpLev(a,b){ if(a===b)return 0; if(Math.abs(a.length-b.length)>2)return 9; const m=a.length,n=b.length; let p=Array.from({length:n+1},(_,j)=>j);
  for(let i=1;i<=m;i++){ const c=[i]; for(let j=1;j<=n;j++)c[j]=Math.min(p[j]+1,c[j-1]+1,p[j-1]+(a[i-1]===b[j-1]?0:1)); p=c; } return p[n]; }
const DP_KURZ={alex:'alexander',sascha:'alexander',max:'maximilian',maxi:'maximilian',flo:'florian',tobi:'tobias',basti:'sebastian',sebi:'sebastian',chris:'christian',
  christoph:'christopher',dani:'daniel',domi:'dominik',hannes:'johannes',jojo:'johannes',jo:'johannes',nico:'nicolas',niko:'nikolas',nick:'nicolas',tim:'timo',tom:'thomas',tommy:'thomas',
  mike:'michael',micha:'michael',michi:'michael',matze:'matthias',matti:'matthias',ben:'benjamin',benni:'benjamin',fabi:'fabian',luki:'lukas',luke:'lukas',olli:'oliver',
  phil:'philipp',pippo:'philipp',steffi:'stefan',stef:'stefan',kevin:'kevin',dennis:'dennis',manu:'manuel',jan:'jannik',jannick:'jannik',yannick:'jannik',
  joe:'josef',sepp:'josef',willi:'wilhelm',rudi:'rudolf',andi:'andreas',andy:'andreas',tobias:'tobias',robin:'robin',patte:'patrick',paddy:'patrick',pat:'patrick',
  marc:'marcel',marco:'marcel',mo:'mohammed',mohamed:'mohammed',muhammed:'mohammed',mehmet:'mehmet',leo:'leon',lenny:'leonard',noah:'noah',jonny:'jonathan',johnny:'jonathan'};
function dpVorname(a,b){ // gleicher Vorname in Kurz- oder Langform?
  if(!a||!b)return false; if(a===b)return true; const la=dpLoose(a), lb=dpLoose(b); if(la===lb)return true;
  const ka=DP_KURZ[a]||a, kb=DP_KURZ[b]||b; if(ka===kb)return true;
  if(Math.min(a.length,b.length)>=3&&(a.startsWith(b)||b.startsWith(a)))return true; return false; }
function dpRegel(a,b){ // a,b: dpTeile; liefert Regel oder null
  if(!a.f||!b.f||!a.l||!b.l)return null;
  const lastGleich=a.l===b.l, lastLoose=dpLoose(a.l)===dpLoose(b.l), lastTipp=a.l.length>=5&&b.l.length>=5&&dpLev(a.l,b.l)<=1;
  if(a.f===b.f&&lastGleich&&a.mid.join(' ')!==b.mid.join(' '))return {k:'zwischen',t:'Zwischenname',p:62};
  if(a.f===b.f&&lastGleich)return {k:'gleich',t:'Gleicher Name',p:70};
  if(dpLoose(a.f)===dpLoose(b.f)&&(lastLoose||lastTipp))return {k:'schreib',t:'Schreibweise',p:58};
  if(lastGleich&&a.f.length>=4&&b.f.length>=4&&dpLev(a.f,b.f)===1)return {k:'schreib',t:'Schreibweise',p:52};
  if((lastGleich||lastLoose)&&dpVorname(a.f,b.f))return {k:'kurz',t:'Kurzform',p:48};
  if(a.f===b.l&&a.l===b.f)return {k:'tausch',t:'Vor- und Nachname vertauscht',p:50};
  return null;
}
function dpAlter(p){ if(p.geb){ const g=new Date(p.geb); if(!isNaN(g))return (Date.now()-g)/31557600000; } return typeof p.alter==='number'?p.alter:null; }
function dpClub(p){ return dpLoose((p.club||'').replace(/\b(sv|fc|tsv|sg|spvgg|fv|tv|sc|vfr|vfb|vfl|ssv|jsg|fsv|e\.?v\.?|ii|iii|1\.)\b/gi,' ')); }
function dpFde(p){ const m=String(p.fdeUrl||'').match(/(player-id|userid)\/([0-9A-Z]{20,40})/); return m?m[2]:null; }
function dpDaten(p){ // grobe Menge an Einträgen in der App, für den Vorschlag „bleibt“
  let n=0; try{ n+=Object.keys((typeof CRM!=='undefined'&&CRM[p.id])||{}).length; }catch(e){}
  try{ (TR.st.sessions||[]).forEach(s=>{ if((s.a||[]).some(a=>a[0]===p.id))n++; }); }catch(e){}
  try{ if(typeof KLAW!=='undefined'&&KLAW.by&&KLAW.by[p.id])n+=3; }catch(e){}
  if(p.fdeUrl)n+=2; return n; }
function dpTyp(p){ const id=String(p.id); return p.own?'Eigener Spieler':p.exSvbc?'Ehemaliger':id.startsWith('fupa-')?'FuPa':id.startsWith('m')?'Von Hand angelegt':id.startsWith('n')?'Neu aus Datenupdate':'Datenbestand'; }

/* ---------- 1) Doppelte Spieler ---------- */
function dpDubletten(){
  const L=players.filter(p=>p&&p.name&&!p.isJugend&&String(p.name).trim().length>=5).map(p=>({p,t:dpTeile(p.name)}));
  const byL=new Map(), byF=new Map(), add=(m,k,x)=>{ if(!k)return; if(!m.has(k))m.set(k,[]); m.get(k).push(x); };
  L.forEach(x=>{ add(byL,dpLoose(x.t.l),x); add(byF,dpLoose(x.t.f),x); });
  const seen=new Set(), out=[];
  const pruef=(x,y)=>{ if(x.p.id===y.p.id)return; const key=[x.p.id,y.p.id].sort().join('|'); if(seen.has(key))return; seen.add(key);
    const r=dpRegel(x.t,y.t); if(!r)return;
    const a=x.p, b=y.p, eig=a.own||b.own||a.exSvbc||b.exSvbc, gleichClub=dpClub(a)&&dpClub(a)===dpClub(b);
    if(!eig&&!gleichClub)return;   // Namensvettern in fremden Vereinen sind meist zwei Menschen
    let p=r.p; const bel=[r.t];
    if(gleichClub){ p+=20; bel.push('gleicher Verein'); }
    if(a.own&&b.own){ p+=15; bel.push('beide eigene Spieler'); }
    const aa=dpAlter(a), ab=dpAlter(b); if(aa!=null&&ab!=null){ if(Math.abs(aa-ab)<=1.1){ p+=12; bel.push('gleiches Alter'); } else p-=45; }
    if(a.pos&&b.pos&&a.pos===b.pos){ p+=5; bel.push('gleiche Position'); }
    const fa=dpFde(a), fb=dpFde(b); if(fa&&fb){ if(fa===fb){ p+=40; bel.push('gleiches fussball.de-Profil'); } else p-=60; }
    if(p<55)return;
    out.push({key,a,b,r,p:Math.min(99,p),bel}); };
  byL.forEach(G=>{ if(G.length>60)return; for(let i=0;i<G.length;i++)for(let j=i+1;j<G.length;j++)pruef(G[i],G[j]); });
  byF.forEach(G=>{ if(G.length>400)return; for(let i=0;i<G.length;i++){ const x=G[i]; if(x.t.l.length<5)continue; for(let j=i+1;j<G.length;j++){ const y=G[j];
    if(y.t.l.length>=5&&Math.abs(x.t.l.length-y.t.l.length)<=1&&x.t.l!==y.t.l&&dpLev(x.t.l,y.t.l)<=1)pruef(x,y); } } });
  L.forEach(x=>{ const G=byL.get(dpLoose(x.t.f))||[]; G.forEach(y=>{ if(y.t.f===x.t.l)pruef(x,y); }); });
  const eig=d=>d.a.own||d.b.own?2:d.a.exSvbc||d.b.exSvbc?1:0;
  return out.filter(d=>{ const e=dpEnt('dublette',d.key); return !e; }).sort((x,y)=>eig(y)-eig(x)||y.p-x.p||String(x.a.name).localeCompare(String(y.a.name),'de'));
}
function dpBleibt(d){ const s=p=>(p.own?100:0)+(p.exSvbc?20:0)+(p.fdeUrl?15:0)+dpDaten(p)*2+(String(p.id).startsWith('svbc-')?5:0)+Math.min(10,String(p.name).length/3);
  return s(d.a)>=s(d.b)?d.a.id:d.b.id; }
function dpFelder(a,b){ const F=[['Alter',p=>{ const x=dpAlter(p); return x==null?'':String(Math.floor(x)); }],['Geburtsdatum',p=>p.geb?TRC.fmt(p.geb)+String(p.geb).slice(2,4):''],
    ['Verein',p=>p.club||''],['Mannschaft',p=>p.kader?p.kader+'. Mannschaft':''],['Position',p=>[p.pos,p.pos2].filter(Boolean).join(', ')],['Fuß',p=>p.fuss||''],['fussball.de-Profil',p=>dpFde(p)?'verknüpft':'']];
  return F.map(([l,f])=>({l,a:f(a),b:f(b)})).filter(x=>x.a||x.b); }
function dpDubHtml(D){
  if(!D.length)return `<div class="card"><p class="note"><b>✓ Keine doppelten Spieler gefunden.</b> Geprüft werden Zwischennamen, Schreibweisen (ü und ue, Tippfehler), Kurzformen wie Flo und Florian und vertauschte Namen.</p></div>`;
  return `<p class="note dp-intro">${D.length} mögliche Doppelung${D.length>1?'en':''}. Wähle, welcher Eintrag bleibt. Vorgeschlagen ist der eigene Spieler mit den meisten Daten. Zusammenführen ist dauerhaft: alle Einträge wandern zum bleibenden Spieler, der andere Name bleibt als frühere Schreibweise erhalten.</p>
    ${(()=>{ const karte=(d,i)=>{ const keep=DP.alle['k'+d.key]||dpBleibt(d), F=dpFelder(d.a,d.b), wid=F.filter(x=>x.a&&x.b&&x.a!==x.b);
      const col=p=>`<label class="dp-p${p.id===keep?' on':''}"><input type="radio" name="dpk${i}" value="${dpE(p.id)}" ${p.id===keep?'checked':''}>
          <span class="dp-pn"><b data-svp="${dpE(p.id)}">${dpE(p.name)}</b><small>${dpE(dpTyp(p))}${p.club?' · '+dpE(p.club):''}</small><em>${p.id===keep?'bleibt':'wird übernommen'}</em></span></label>`;
      return `<div class="card dp-d" data-dk="${dpE(d.key)}"><div class="dp-dh"><span class="dp-sc">${d.p}</span><span>${d.bel.map(dpE).join(' · ')}</span></div>
        <div class="dp-pp">${col(d.a)}${col(d.b)}</div>
        ${F.length?`<div class="dp-tw"><table class="dp-t"><thead><tr><th></th><th>${dpE(d.a.name)}</th><th>${dpE(d.b.name)}</th></tr></thead><tbody>${F.map(x=>`<tr class="${x.a&&x.b&&x.a!==x.b?'dp-wid':''}"><th>${dpE(x.l)}</th><td>${dpE(x.a)||'–'}</td><td>${dpE(x.b)||'–'}</td></tr>`).join('')}</tbody></table></div>`:''}
        ${wid.length?`<p class="note small dp-w">${SVI('info')} Widerspruch bei ${wid.map(x=>x.l).join(', ')}. Es gilt der Wert des bleibenden Spielers, Lücken werden aus dem anderen ergänzt.</p>`:''}
        <div class="btnrow"><button type="button" class="btn sm${DP.sure[d.key]?' sure':''}" data-dgo="${dpE(d.key)}">${DP.sure[d.key]?'Ja, endgültig zusammenführen':'Zusammenführen'}</button><button type="button" class="btn sm ghost" data-dno="${dpE(d.key)}">Kein Duplikat</button></div></div>`; };
      const E=D.filter(d=>d.a.own||d.b.own||d.a.exSvbc||d.b.exSvbc), X=D.filter(d=>!E.includes(d));
      return (E.length?E.map(d=>karte(d,D.indexOf(d))).join(''):'<div class="card"><p class="note"><b>✓ Bei eigenen und ehemaligen Spielern keine Doppelung.</b></p></div>')
        +(X.length?`<details class="pf4-sec dp-erl"${DP.xOffen?' open':''} data-dpx><summary><span>Spielermarkt (andere Vereine)</span><em>${X.length}</em></summary><div class="pf4-b">${X.map(d=>karte(d,D.indexOf(d))).join('')}</div></details>`:''); })()}`;
}

/* ---------- 2) Namensvarianten ---------- */
function dpAehnlich(name,kand){ const t=dpTeile(name); const out=[];
  kand.forEach(p=>{ const r=dpRegel(t,dpTeile(p.name)); if(r&&r.k!=='gleich')out.push({p,r}); });
  return out.sort((x,y)=>y.r.p-x.r.p).slice(0,3); }
function dpVarianten(){
  const out=[], eigen=players.filter(p=>p.own&&!p.isJugend);
  // a) fussball.de-Spielberichte: Spieler ohne Zuordnung
  try{ if(typeof FB!=='undefined'&&FB.loaded&&FB.pl){ const M=fbMap(), keys=new Map();
      mn31FbAlle().forEach(g=>{ const tm=g.team; g.apps.concat(g.bank.map(k=>({p:k}))).forEach(a=>{ if(!a.p||M.has(a.p))return; const x=keys.get(a.p)||{n:0,tm}; x.n++; keys.set(a.p,x); }); });
      keys.forEach((x,k)=>{ const nm=FB.pl.get(k); if(!nm)return; const e=dpEnt('variante','fde:'+k); if(e)return;
        const vor=dpAehnlich(nm,eigen); if(vor.length)out.push({art:'fde',key:'fde:'+k,name:nm,quelle:'fussball.de-Spielbericht',info:`${x.n} Spiel${x.n>1?'e':''} ${x.tm==='D2'?'der 2. Mannschaft':''}`.trim(),vor}); }); } }catch(e){ console.warn('Varianten fussball.de',e); }
  // b) Vereinsstatistik (Allzeit): Zeilen ohne Spieler
  try{ if(typeof VR!=='undefined'&&VR.atLoaded&&(VR.at||[]).length){ const idx=vrIdx(), frei=eigen.filter(p=>!idx.byPlayer.has(p.id));
      VR.at.filter(r=>!idx.used.has(r.key)&&(r.spiele||0)>=3).forEach(r=>{ const e=dpEnt('variante','at:'+r.key); if(e)return;
        const vor=dpAehnlich(r.name,frei); if(vor.length)out.push({art:'at',key:'at:'+r.key,atKey:r.key,name:r.name,quelle:'Vereinsstatistik',info:`${r.spiele} Spiele, ${r.tore||0} Tore`,vor}); }); } }catch(e){ console.warn('Varianten Allzeit',e); }
  // c) Kader-Abgleich des Servers (139): spielt für uns, ist keinem Spieler zugeordnet, ein eigener Spieler heißt ähnlich
  try{ (DP.fehl||[]).forEach(f=>{ if(f.art!=='aehnlich'||!f.name)return; const key='fde:'+f.k; if(out.some(v=>v.key===key)||dpEnt('variante',key))return;
      const vor=(f.aehnlich||[]).map(a=>({p:trP(a.id)||{id:a.id,name:a.name},r:{t:'Ähnlicher Name',p:40}})); if(!vor.length)return;
      const n=f.einsaetze||0; out.push({art:'fde',key,name:f.name,quelle:'fussball.de-Spielbericht',info:`${n?n+' Einsatz'+(n>1?'e':''):(f.bank||0)+' Mal im Aufgebot'} ${f.zweite?'der 2. Mannschaft':''}`.trim(),vor}); }); }catch(e){ console.warn('Varianten Kader-Abgleich',e); }
  return out;
}
async function dpFehlLaden(){ if(DP.fehlLade)return; DP.fehlLade=true;
  try{ const {data,error}=await SVB.sb.rpc('kader_fehlende_liste'); if(error)throw error; DP.fehl=data||[]; }catch(e){ DP.fehl=[]; }
  dpRender(); }
function dpVarHtml(V){
  const lade=(typeof FB!=='undefined'&&!FB.loaded)||(typeof VR!=='undefined'&&!VR.atLoaded);
  if(!V.length)return `<div class="card"><p class="note">${lade?'Lade Spielberichte und Vereinsstatistik …':'<b>✓ Keine offenen Namensvarianten.</b> Alle Namen aus den fussball.de-Spielberichten und der Vereinsstatistik sind einem Spieler zugeordnet oder geprüft.'}</p></div>`;
  return `<p class="note dp-intro">Diese Namen stehen in einer Quelle, passen aber zu keinem Spieler genau. Ist es derselbe Mensch, merkt sich die App die Schreibweise dauerhaft und ordnet ihn ab dann überall richtig zu. Ist es jemand anderes und er spielt für uns, legt die App ihn als neuen Spieler an. Die Zuordnung zu FuPa läuft weiter über den Spieler-Abgleich.</p>
    ${V.map(v=>`<div class="card dp-v" data-vk="${dpE(v.key)}"><div class="dp-dh"><span class="dp-q">${dpE(v.quelle)}</span><span><b>„${dpE(v.name)}“</b> ${dpE(v.info)}</span></div>
      <div class="dp-vv">${v.vor.map((x,i)=>`<label class="dp-p${i===0?' on':''}"><input type="radio" name="dpv${dpE(v.key)}" value="${dpE(x.p.id)}" ${i===0?'checked':''}><span class="dp-pn"><b data-svp="${dpE(x.p.id)}">${dpE(x.p.name)}</b><small>${dpE(x.r.t)}${x.p.kader?' · '+x.p.kader+'. Mannschaft':''}</small></span></label>`).join('')}</div>
      <div class="btnrow"><button type="button" class="btn sm" data-vgo="${dpE(v.key)}">Ist derselbe Spieler</button><button type="button" class="btn sm ghost" data-vno="${dpE(v.key)}">Ist jemand anderes</button></div></div>`).join('')}`;
}

/* ---------- 3) Spieldaten aus allen Quellen ---------- */
const DP_ST={da:'Startelf',spaet:'Eingewechselt',bank:'Bank',zuschauer:'Zugeschaut',weg:'Nicht da'};
const dpPlay=s=>s==='da'||s==='spaet';
function dpHash(s){ let h=5381; for(let i=0;i<s.length;i++)h=((h<<5)+h+s.charCodeAt(i))|0; return (h>>>0).toString(36); }
function dpSpiel(g){
  const trainer=src=>['manuell','ki'].includes(src||'manuell');
  const app=new Map(); ((g.app&&g.app.a)||[]).forEach(x=>app.set(x[0],{st:x[1],t:x[6]!=null?+x[6]:null,src:x[10]||'manuell'}));
  const fuL=!!(g.fq&&g.fq.aufstellung), fu=new Map(), fuOhne=[];
  if(fuL)(g.fq.spieler||[]).forEach(x=>{ const st=x.start?'da':(x.min||0)>0?'spaet':'bank'; if(!x.app_id||!trP(x.app_id)){ if(dpPlay(st))fuOhne.push(x.name||'?'); return; } fu.set(x.app_id,{st,t:x.tore!=null?+x.tore:0}); });
  let fbR=null; try{ fbR=g.fb&&g.fb.bericht?fbSpielAm(g.d):null; }catch(e){}
  const fbL=!!fbR, fb=new Map(); if(fbL)Object.entries(fbR.rows).forEach(([id,r])=>fb.set(id,{st:r.status,t:r.tore!=null?+r.tore:0}));
  const fbOhne=[]; if(fbL&&fbR.fehlt){ try{ const M=fbMap(); g.fb.apps.forEach(a=>{ if(!M.has(a.p))fbOhne.push((FB.pl&&FB.pl.get(a.p))||'?'); }); }catch(e){} }
  const anz=m=>[...m.values()].filter(x=>x.st==='da').length, sum=m=>[...m.values()].reduce((s,x)=>s+(dpPlay(x.st)?(x.t||0):0),0);
  const S={app:anz(app),fu:fuL?anz(fu):null,fb:fbL?anz(fb):null}, T={fu:fuL?sum(fu):null,fb:fbL?sum(fb):null};
  const ids=new Set(); [app,fu,fb].forEach(m=>m.forEach((v,k)=>{ if(dpPlay(v.st))ids.add(k); }));
  const rows=[];
  ids.forEach(id=>{ const a=app.get(id)||null, f=fuL?(fu.get(id)||null):undefined, b=fbL?(fb.get(id)||null):undefined, fl=[];
    const fP=f&&dpPlay(f.st), bP=b&&dpPlay(b.st), aP=a&&dpPlay(a.st);
    if(fuL&&fbL){ if(fP&&!bP)fl.push('fehlt bei fussball.de'); if(bP&&!fP)fl.push('fehlt bei FuPa');
      if(fP&&bP&&f.st!==b.st)fl.push('Startelf oder Wechsel uneinig'); if(fP&&bP&&(f.t||0)!==(b.t||0))fl.push('Tore uneinig'); }
    if(g.app&&!aP&&(fP||bP))fl.push('fehlt in der App');
    if(aP&&!fP&&!bP&&(fuL||fbL)&&trainer(a.src))fl.push('nur in der App');
    if(aP&&trainer(a.src)&&(fP||bP)){ const off=fP?f:b; if(off.st!==a.st)fl.push('App weicht ab'); }
    // Annahme: zwei amtliche Quellen einig > Trainereintrag > eine Quelle > Startelf-Zahl > fussball.de (amtlicher Spielbericht)
    let st=null, t=null, warum='';
    if(fP&&bP&&f.st===b.st){ st=f.st; warum='FuPa und fussball.de einig'; }
    else if(aP&&trainer(a.src)){ st=a.st; warum='Eintrag des Trainerteams'; }
    else if(fP&&!bP){ st=f.st; warum=fbL?'nur FuPa kennt ihn':'nur FuPa'; }
    else if(bP&&!fP){ st=b.st; warum=fuL?'nur fussball.de kennt ihn':'nur fussball.de'; }
    else if(fP&&bP){ if(S.fu===11&&S.fb!==11){ st=f.st; warum='FuPa hat eine vollständige Startelf'; } else if(S.fb===11&&S.fu!==11){ st=b.st; warum='fussball.de hat eine vollständige Startelf'; } else { st=b.st; warum='amtlicher Spielbericht'; } }
    else if(aP){ st=a.st; warum='nur in der App'; }
    const tF=fP?(f.t||0):null, tB=bP?(b.t||0):null;
    if(tF!=null&&tB!=null&&tF!==tB){ const fbPasst=g.tw!=null&&T.fb===g.tw&&T.fu!==g.tw; t=fbPasst?tB:tF; warum+=fbPasst?', Tore laut fussball.de (passt zum Ergebnis)':', Tore laut FuPa'; }
    else t=tF!=null?tF:tB!=null?tB:(a&&a.t!=null?a.t:null);
    if(aP&&trainer(a.src)&&a.t!=null&&!(tF!=null&&tB!=null&&tF===tB))t=a.t;
    const sicher=!fl.length;
    rows.push({id,name:(trP(id)||{}).name||id,a,f,b,ann:{st,t,warum},fl,sicher}); });
  rows.sort((x,y)=>(y.fl.length?1:0)-(x.fl.length?1:0)||['da','spaet'].indexOf(x.ann.st)-['da','spaet'].indexOf(y.ann.st)||String(x.name).localeCompare(String(y.name),'de'));
  const hw=[];
  if(!g.app&&(fuL||fbL))hw.push('Spiel fehlt in der App');
  const voll=Math.max(S.fu||0,S.fb||0,S.app||0);
  if(voll>=11){ if(fuL&&S.fu<11)hw.push(`FuPa nennt nur ${S.fu} Spieler in der Startelf`); if(fbL&&S.fb<11)hw.push(`fussball.de nennt nur ${S.fb} Spieler in der Startelf`); if(g.app&&S.app<11&&S.app>0)hw.push(`In der App stehen nur ${S.app} Spieler in der Startelf`); }
  if(T.fu!=null&&T.fb!=null&&T.fu!==T.fb)hw.push(`Tore: FuPa ${T.fu}, fussball.de ${T.fb}${g.tw!=null?', Ergebnis '+g.tw+':'+g.tg:''}`);
  if(fuOhne.length)hw.push(`FuPa: ${fuOhne.length} ohne Zuordnung (${fuOhne.slice(0,3).join(', ')}${fuOhne.length>3?' …':''})`);
  if(fbOhne.length)hw.push(`fussball.de: ${fbOhne.length} ohne Zuordnung (${fbOhne.slice(0,3).join(', ')}${fbOhne.length>3?' …':''})`);
  (g.hw||[]).forEach(h=>{ if(h.k==='erg')hw.push(h.t); });
  const offen=rows.filter(r=>r.fl.length);
  const fp=dpHash(JSON.stringify([hw,offen.map(r=>[r.id,r.fl,r.ann.st,r.ann.t])]));
  return {g,rows,offen,hw,S,T,fuL,fbL,fp,n:offen.length+hw.length};
}
function dpSpielStatus(r){ const e=dpEnt('spiel',DP.team+'|'+r.g.d); if(!e)return null; return (e.d&&e.d.fp)===r.fp?e:{alt:true,e}; }
function dpZelle(x,lad){ if(x===undefined)return `<td class="dp-na">${lad?'kein Bericht':'–'}</td>`; if(!x)return '<td class="dp-leer">fehlt</td>';
  return `<td>${dpE(DP_ST[x.st]||x.st)}${x.t?` <b>${x.t} T</b>`:''}${x.src&&!['import','default'].includes(x.src)?' <small>Trainer</small>':''}</td>`; }
function dpSpielTabelle(r,alle){
  const L=alle?r.rows:r.offen;
  return L.length?`<div class="dp-tw"><table class="dp-t dp-sp"><thead><tr><th>Spieler</th><th>App</th><th>FuPa</th><th>fussball.de</th><th>Annahme</th></tr></thead><tbody>
    ${L.map(x=>`<tr class="${x.fl.length?'dp-wid':''}"><th><b data-svp="${dpE(x.id)}">${dpE(x.name)}</b>${x.fl.length?`<small>${x.fl.map(dpE).join(' · ')}</small>`:''}</th>${dpZelle(x.a||(r.g.app?null:undefined))}${dpZelle(x.f)}${dpZelle(x.b)}
      <td class="dp-ann"><b>${dpE(DP_ST[x.ann.st]||'–')}${x.ann.t?' · '+x.ann.t+' T':''}</b><small>${dpE(x.ann.warum)}</small></td></tr>`).join('')}</tbody></table></div>`:'';
}
function dpSpieleHtml(R){
  const team=`<div class="trtabs dp-team">${[['1','1. Mannschaft'],['2','2. Mannschaft']].map(([k,t])=>`<button type="button" class="${DP.team===k?'on':''}" data-dpt="${k}">${t}</button>`).join('')}</div>`;
  const lade=!TR.loaded||(typeof FB!=='undefined'&&!FB.loaded)||(DP.team==='1'&&!SVM.q31);
  const offen=R.filter(r=>r.n&&!(dpSpielStatus(r)&&!dpSpielStatus(r).alt)), erledigt=R.filter(r=>r.n&&dpSpielStatus(r)&&!dpSpielStatus(r).alt);
  const karte=r=>{ const st=dpSpielStatus(r), g=r.g, alle=!!DP.zeigAlle[g.d];
    return `<div class="card dp-s" data-sd="${dpE(g.d)}"><div class="dp-sh"><span class="gm50-d">${TRC.fmt(g.d)}</span><b>${g.heim===false?'@':'vs'} ${dpE(g.gegner)}</b>${g.tw!=null?`<i class="res ${g.tw>g.tg?'w':g.tw===g.tg?'d':'l'}">${g.tw}:${g.tg}</i>`:''}
        <span class="dp-src">${['App','FuPa','fussball.de'].map((q,i)=>`<i class="src50 ${[!!g.app,r.fuL,r.fbL][i]?'i':'off'}">${q}</i>`).join('')}</span></div>
      ${r.hw.length?`<ul class="dp-hw">${r.hw.map(h=>`<li>${dpE(h)}</li>`).join('')}</ul>`:''}
      ${dpSpielTabelle(r,alle)}
      ${st&&st.alt?`<p class="note small">Früher geprüft (${dpE(st.e.e==='annahme'?'Annahme übernommen':'passt so')}), seitdem hat sich etwas geändert.</p>`:st?`<p class="note small dp-ok">✓ ${st.e==='annahme'?'Annahme übernommen':'Bestätigt'}${st.wer?' von '+dpE(st.wer):''} am ${dpE(String(st.am||'').slice(0,10).split('-').reverse().join('.'))}</p>`:''}
      ${st&&!st.alt?`<div class="btnrow"><button type="button" class="btn sm ghost" data-sback="${dpE(g.d)}">Wieder öffnen</button></div>`
