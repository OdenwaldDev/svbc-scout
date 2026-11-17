        :`<div class="btnrow"><button type="button" class="btn sm" data-sann="${dpE(g.d)}">Annahme übernehmen</button><button type="button" class="btn sm ghost" data-sok="${dpE(g.d)}">Passt so</button><button type="button" class="btn sm ghost" data-sall="${dpE(g.d)}">${alle?'Nur Abweichungen':'Alle Spieler'}</button></div>`}</div>`; };
  return team+`<p class="note dp-intro">Je Spiel stehen App, FuPa und der amtliche Spielbericht von fussball.de nebeneinander. Fehlt ein Spieler in einer Quelle, füllt die andere die Lücke (das passiert inzwischen auch automatisch, ohne etwas zu überschreiben). Widersprechen sich die Quellen, steht rechts die plausibelste Annahme. „Annahme übernehmen“ schreibt sie ins Spiel, „Passt so“ lässt alles, wie es ist.</p>
    ${lade?'<div class="card"><div class="empty">Lade Spiele aus App, FuPa und fussball.de …</div></div>':offen.length?offen.map(karte).join(''):`<div class="card"><p class="note"><b>✓ Keine offenen Abweichungen</b> in ${R.length===1?'einem Spiel':R.length+' Spielen'} dieser Saison.</p></div>`}
    ${erledigt.length?`<details class="pf4-sec dp-erl"><summary><span>Geprüfte Spiele</span><em>${erledigt.length}</em></summary><div class="pf4-b">${erledigt.map(karte).join('')}</div></details>`:''}`;
}
function dpSpieleLaden(){
  if(mnCtx()!==DP.team){ try{ mnCtxSet(DP.team); }catch(e){} }
  const nach=()=>{ if(svCurTab()==='pruefung')dpRender(); };
  try{ if(!TR.loaded&&!TR.loading){ const r=trLoad(); if(r&&r.then)r.then(nach,nach); } else if(TR.loading&&TR.loading.then)TR.loading.then(nach,nach); }catch(e){}
  try{ if(typeof FB!=='undefined'&&!FB.loaded&&!FB.loading){ const r=fbLoad(); if(r&&r.then)r.then(nach,nach); } }catch(e){}
  try{ if(DP.team==='1'){ if(!SVM.plan&&typeof svmPlanLoad==='function')svmPlanLoad(nach); if(!SVM.q31)mn31QLoad(nach); } }catch(e){}
  try{ if(!SVM.q31&&DP.team==='1')setTimeout(nach,2500); }catch(e){}
}
function dpSpiele(){ if(!TR.loaded)return []; try{ return mn31Spiele().map(dpSpiel); }catch(e){ console.warn('Datenprüfung Spiele',e); return []; } }
async function dpAnnahme(r){
  const g=r.g, sp=[];
  r.rows.forEach(x=>{ if(!x.ann.st)return; const a=x.a; if(a&&a.st===x.ann.st&&(x.ann.t==null||a.t===x.ann.t))return;
    const o={player_id:x.id,status:x.ann.st,status_src:'manuell'}; if(x.ann.t!=null)o.tore=x.ann.t; sp.push(o); });
  const hinw=String((g.app&&g.app.hw)||'').replace(/\s*Abgleich geprüft am [0-9.]+\./g,'');
  const p={datum:g.d,typ:'spiel',team:DP.team,daten_status:'korrigiert',hinweise:(hinw+' Abgleich geprüft am '+TRC.fmt(trToday())+trToday().slice(2,4)+'.').trim().slice(0,1000),spieler:sp.slice(0,80)};
  if(!g.app){ Object.assign(p,{gegner:String(g.gegner||'').slice(0,80),heim:g.heim}); if(g.tw!=null){ p.tore_wir=g.tw; p.tore_gegner=g.tg; } }
  const {error}=await SVB.sb.rpc('training_save',{p}); if(error)throw new Error(error.message);
  await dpEntscheiden('spiel',DP.team+'|'+g.d,'annahme',{fp:null,n:sp.length,gegner:g.gegner});
  await trLoad(true);
  // nach dem Speichern neu vergleichen und den neuen Stand als geprüft merken
  const n=mn31Spiele().find(x=>x.d===g.d); if(n){ const r2=dpSpiel(n); await dpEntscheiden('spiel',DP.team+'|'+g.d,'annahme',{fp:r2.fp,n:sp.length,gegner:g.gegner}); }
  return sp.length;
}
async function dpPasst(r){
  const g=r.g;
  if(g.app){ try{ await SVB.sb.rpc('training_save',{p:{datum:g.d,typ:'spiel',team:DP.team,daten_status:'bestaetigt',spieler:[]}}); }catch(e){} }
  await dpEntscheiden('spiel',DP.team+'|'+g.d,'passt',{fp:r.fp,gegner:g.gegner});
}

/* ---------- Bereich ---------- */
SV_TBL.pruefung=['check','Datenprüfung'];
Object.assign(SV_PAGES,{pruefung:['Datenprüfung','Doppelte Spieler, Namensvarianten und Spieldaten aus allen Quellen prüfen']});
{ const _ta=svTabAllowed; svTabAllowed=function(t){ if(t==='pruefung')return isAdmin(); return _ta.apply(this,arguments); }; }
function dpNavVis(){ try{ document.querySelectorAll('.snav button[data-tab="pruefung"],.sgrid [data-sheet="pruefung"]').forEach(b=>b.style.display=isAdmin()?'':'none'); }catch(e){} }
if(typeof sv4NavVis==='function'){ const _nv=sv4NavVis; sv4NavVis=function(){ const r=_nv.apply(this,arguments); dpNavVis(); return r; }; }
function dpPanel(){ let P=document.getElementById('panel-pruefung'); if(P)return P;
  const ref=document.getElementById('panel-home')||document.querySelector('.panel'); if(!ref)return null;
  P=document.createElement('section'); P.className='panel'; P.id='panel-pruefung'; ref.parentNode.insertBefore(P,ref.nextSibling); return P; }
{ const _gt=goTab; goTab=function(tab){ if(tab==='pruefung')dpPanel(); const r=_gt.apply(this,arguments);
  try{ if(svCurTab()==='pruefung')dpRender(); }catch(e){ console.warn('Datenprüfung',e); } return r; }; }

function dpRender(){
  const P=document.getElementById('panel-pruefung'); if(!P||svCurTab()!=='pruefung')return;
  if(!isAdmin()){ P.innerHTML='<div class="card"><div class="empty">Die Datenprüfung ist nur für den Admin.</div></div>'; return; }
  if(!DP.ent){ P.innerHTML='<div class="card"><div class="empty">Lade …</div></div>'; dpEntLaden(); return; }
  if(typeof FB!=='undefined'&&!FB.loaded&&!FB.loading){ try{ const r=fbLoad(); if(r&&r.then)r.then(()=>dpRender(),()=>{}); }catch(e){} }
  if(typeof VR!=='undefined'&&!VR.atLoaded&&!DP.atLade){ DP.atLade=1; try{ vrLoadAllTime().then(()=>dpRender(),()=>{}); }catch(e){} }
  if(!DP.fehl&&!DP.fehlLade)dpFehlLaden();
  const D=dpDubletten(), V=dpVarianten(); let R=[];
  if(DP.sicht==='spiel'){ dpSpieleLaden(); R=dpSpiele(); }
  const nSp=DP.sicht==='spiel'?R.filter(r=>r.n&&!(dpSpielStatus(r)&&!dpSpielStatus(r).alt)).length:null;
  const seg=[['dub','Doppelte Spieler',D.length],['var','Namensvarianten',V.length],['spiel','Spieldaten',nSp]];
  P.innerHTML=`<div class="dp">
    ${DP.ohneDb?`<div class="note dp-warn">${SVI('info')} Die Datenbank-Erweiterung 080 fehlt noch. Prüfen und Zusammenführen geht trotzdem, Entscheidungen wie „Kein Duplikat“ merkt sich bis dahin nur dieses Gerät.</div>`:''}
    <div class="trtabs dp-seg">${seg.map(([k,t,n])=>`<button type="button" class="${DP.sicht===k?'on':''}" data-dps="${k}">${t}${n?` <em>${n}</em>`:''}</button>`).join('')}</div>
    <div class="dp-b">${DP.sicht==='dub'?dpDubHtml(D):DP.sicht==='var'?dpVarHtml(V):dpSpieleHtml(R)}</div></div>`;
  P.querySelectorAll('[data-dps]').forEach(b=>b.onclick=()=>{ DP.sicht=b.dataset.dps; dpRender(); });
  const dx=P.querySelector('[data-dpx]'); if(dx)dx.addEventListener('toggle',()=>{ DP.xOffen=dx.open; });
  P.querySelectorAll('[data-svp]').forEach(x=>x.onclick=e=>{ e.preventDefault(); e.stopPropagation(); openModal(x.dataset.svp); });
  // Doppelte
  P.querySelectorAll('.dp-d input[type=radio]').forEach(i=>i.onchange=()=>{ const k=i.closest('.dp-d').dataset.dk; DP.alle['k'+k]=i.value; DP.sure[k]=false; dpRender(); });
  P.querySelectorAll('[data-dgo]').forEach(b=>b.onclick=async()=>{ const k=b.dataset.dgo, d=D.find(x=>x.key===k); if(!d)return;
    if(!DP.sure[k]){ DP.sure[k]=true; dpRender(); return; }
    const neu=DP.alle['k'+k]||dpBleibt(d), alt=neu===d.a.id?d.b:d.a; b.disabled=true; b.textContent='Führt zusammen …';
    try{ const {data,error}=await SVB.sb.rpc('spieler_zusammenfuehren',{p_alt:alt.id,p_neu:neu}); if(error)throw error;
      if(DP.ohneDb)await dpEntscheiden('dublette',k,'zusammengefuehrt',{bleibt:neu});
      else if(DP.ent)DP.ent.set('dublette§'+k,{art:'dublette',s:k,e:'zusammengefuehrt',d:{bleibt:neu}});
      const n=data&&data.umgehaengt?Object.values(data.umgehaengt).reduce((s,x)=>s+x,0):0;
      const nu=data&&Array.isArray(data.nicht_uebernommen)?data.nicht_uebernommen.length:0;   // 0.99.19: Saisonplanung, die den bleibenden Spieler aus seiner Mannschaft genommen hätte
      kToast(`✓ ${alt.name} ist jetzt Teil von ${trP(neu)?trP(neu).name:'dem Spieler'}${n?` · ${n} Einträge umgehängt`:''}${nu?' · Mannschaft bleibt, die Saisonplanung des doppelten Eintrags wurde nicht übernommen':''}`);
      try{ if(typeof svDatenNeuLaden==='function')await svDatenNeuLaden(); }catch(e){}
      delete DP.sure[k]; dpRender(); }
    catch(e){ b.disabled=false; b.textContent='Zusammenführen'; DP.sure[k]=false; kToast('⚠️ '+(e.message||e)); } });
  P.querySelectorAll('[data-dno]').forEach(b=>b.onclick=async()=>{ const k=b.dataset.dno, d=D.find(x=>x.key===k); b.disabled=true;
    try{ await dpEntscheiden('dublette',k,'kein_duplikat',{a:d&&d.a.name,b:d&&d.b.name}); kToast('Gemerkt: zwei verschiedene Spieler'); dpRender(); }catch(e){ b.disabled=false; kToast('⚠️ '+(e.message||e)); } });
  // Varianten
  P.querySelectorAll('[data-vgo]').forEach(b=>b.onclick=async()=>{ const k=b.dataset.vgo, v=V.find(x=>x.key===k); if(!v)return; const sel=P.querySelector(`.dp-v[data-vk="${CSS.escape(k)}"] input:checked`), pid=sel&&sel.value; if(!pid)return;
    b.disabled=true;
    try{ if(v.art==='fde'){ const {error}=await SVB.sb.rpc('spieler_alias',{p_id:pid,p_name:String(v.name).replace(/\s*\([^)]*\)\s*$/,'')}); if(error)throw error; const p=trP(pid); if(p){ p.alias=(p.alias||[]).concat([v.name]); } try{ FB.map=null; }catch(e){} }
      else if(v.art==='at'){ crmSet(pid,{at:v.atKey}); try{ crmApply(); }catch(e){} VR._idx=null; VR._rk=null; }
      await dpEntscheiden('variante',k,'bestaetigt',{pid,name:v.name}); kToast('✓ '+v.name+' gehört jetzt zu '+((trP(pid)||{}).name||'dem Spieler')); dpRender(); }
    catch(e){ b.disabled=false; kToast('⚠️ '+(/spieler_alias|function|schema cache/i.test(e.message||'')?'Dafür fehlt noch die Datenbank-Erweiterung 080.':(e.message||e))); } });
  P.querySelectorAll('[data-vno]').forEach(b=>b.onclick=async()=>{ const k=b.dataset.vno, v=V.find(x=>x.key===k); b.disabled=true;
    try{ await dpEntscheiden('variante',k,'abgelehnt',{name:v&&v.name});
      let neu=0; if(v&&v.art==='fde'&&!DP.ohneDb){ try{ const {data,error}=await SVB.sb.rpc('kader_abgleich_jetzt'); if(!error&&data)neu=(data.angelegt||0)+(data.uebernommen||0); }catch(e){}
        if(neu){ DP.fehl=null; DP.fehlLade=false; try{ FB.map=null; }catch(e){} try{ if(typeof svDatenNeuLaden==='function')await svDatenNeuLaden(); }catch(e){} } }
      kToast(neu?'✓ '+(v.name||'Der Spieler')+' ist jetzt als eigener Spieler angelegt':'Gemerkt'); dpRender(); }catch(e){ b.disabled=false; kToast('⚠️ '+(e.message||e)); } });
  // Spiele
  P.querySelectorAll('[data-dpt]').forEach(b=>b.onclick=()=>{ DP.team=b.dataset.dpt; dpRender(); });
  const rOf=d=>R.find(r=>r.g.d===d);
  P.querySelectorAll('[data-sall]').forEach(b=>b.onclick=()=>{ DP.zeigAlle[b.dataset.sall]=!DP.zeigAlle[b.dataset.sall]; dpRender(); });
  P.querySelectorAll('[data-sann]').forEach(b=>b.onclick=async()=>{ const r=rOf(b.dataset.sann); if(!r||DP.busy)return; DP.busy=true; b.disabled=true; b.textContent='Speichert …';
    try{ const n=await dpAnnahme(r); kToast(`✓ Annahme übernommen${n?` · ${n} Spieler angepasst`:''}`); }catch(e){ kToast('⚠️ '+(e.message||e)); } DP.busy=false; dpRender(); });
  P.querySelectorAll('[data-sok]').forEach(b=>b.onclick=async()=>{ const r=rOf(b.dataset.sok); if(!r)return; b.disabled=true;
    try{ await dpPasst(r); kToast('✓ Als geprüft gemerkt'); }catch(e){ kToast('⚠️ '+(e.message||e)); } dpRender(); });
  P.querySelectorAll('[data-sback]').forEach(b=>b.onclick=async()=>{ try{ await dpEntscheiden('spiel',DP.team+'|'+b.dataset.sback,''); }catch(e){} dpRender(); });
}

/* ---------- Im geöffneten Spiel: Quellenvergleich für alle sichtbar ---------- */
if(typeof mn31SpielInfo==='function'){ const _si=mn31SpielInfo; mn31SpielInfo=function(E,d){ const r0=_si.apply(this,arguments);
  const zeig=()=>{ try{ if(!E||!E.isConnected)return; const g=mn31Spiele().find(x=>x.d===d); let box=E.parentNode&&E.parentNode.querySelector(':scope > .dp-mv'); if(!g){ if(box)box.remove(); return; }
      const r=dpSpiel(g); if(!r.n){ if(box)box.remove(); return; }
      if(!box){ box=document.createElement('details'); box.className='dp-mv pf4-sec'; E.after(box); }
      const st=DP.ent&&DP.team===mnCtx()?dpSpielStatus(r):null;
      box.innerHTML=`<summary><span>Quellenvergleich</span><em>${r.n} Abweichung${r.n>1?'en':''}</em></summary><div class="pf4-b">
        ${r.hw.length?`<ul class="dp-hw">${r.hw.map(h=>`<li>${dpE(h)}</li>`).join('')}</ul>`:''}${dpSpielTabelle(r,false)}
        <p class="note small">${st&&!st.alt?'✓ Vom Admin geprüft.':'Die Annahme rechts ist der plausibelste Stand aus allen Quellen. Sie wird vom Admin unter Verwaltung → Datenprüfung bestätigt.'}</p></div>`; }catch(e){ console.warn('Quellenvergleich',e); } };
  zeig(); setTimeout(zeig,1800); return r0; }; }

/* ---------- fussball.de-Zuordnung wie auf dem Server: auch frühere Schreibweisen und Vor- plus Nachname ---------- */
if(typeof fbMap==='function'){ const _fm=fbMap; fbMap=function(){ const M=_fm.apply(this,arguments);
  try{ if(M.__dp43===FB.mapK)return M; M.__dp43=FB.mapK;
    const own=players.filter(p=>p.own&&!p.isJugend), used=new Set(M.values()), byA=new Map(), byFL=new Map(), put=(m,k,id)=>{ if(!k)return; m.set(k,m.has(k)&&m.get(k)!==id?null:id); };
    own.forEach(p=>{ [p.name].concat(p.alias||[]).forEach(n=>{ put(byA,dpN(n).replace(/\s/g,''),p.id); const t=dpTeile(n); if(t.f&&t.l&&(t.f+t.l).length>=6)put(byFL,t.f+'|'+t.l,p.id); }); });
    const keys=new Set(); mn31FbAlle().forEach(g=>{ g.apps.forEach(a=>keys.add(a.p)); g.bank.forEach(k=>keys.add(k)); });
    keys.forEach(k=>{ if(M.has(k))return; const nm=FB.pl&&FB.pl.get(k); if(!nm)return; const t=dpTeile(nm);
      const id=byA.get(dpN(nm).replace(/\s/g,''))||byFL.get(t.f+'|'+t.l); if(id&&!used.has(id)){ M.set(k,id); used.add(id); } });
  }catch(e){ console.warn('fbMap 0.42',e); }
  return M; }; }

/* =====================================================================
   Sportzentrale Beta 0.48 · Planung
   Ein Ort für Projekte, Aufgaben und Beschlüsse aller Bereiche, zugeschnitten je Bereich:
   - Meine: alles, was mir gehört, nach Fälligkeit, über alle Bereiche
   - Überblick: alle Bereiche auf einen Blick, zuletzt passiert
   - Abteilungsleitung: To-dos je Person, Themen für die nächste Runde, Beschlüsse
   - Projektsteuerung: alle Projekte mit Ampel, Fortschritt, Meilensteinen, was Aufmerksamkeit braucht, Zeitplan
   - Vereinsentwicklung: Ziele 2030 mit Live-Zahlen, Ideen aus dem Helferpool, Ideenspeicher
   - Jeder Bereich: Board, Liste, Projekte, Zeitplan, Vorlagen, Schnelleingabe („@Lukas bis Freitag !“)
   Daten nur über die Funktionen aus 089_planung.sql (Tabellen sind für den Browser gesperrt).
   ===================================================================== */
const PL={d:null,b:'meine',v:{},f:{wer:'',q:'',erl:false},t:null,busy:false};
const plE=s=>svEsc(s==null?'':String(s));
const PL_ST={idee:'Ideenspeicher',offen:'Offen',arbeit:'In Arbeit',wartet:'Wartet auf',erledigt:'Erledigt'};
const PL_PST={idee:'Idee',geplant:'Geplant',laeuft:'Läuft',pausiert:'Pausiert',fertig:'Fertig',verworfen:'Verworfen'};
const PL_AMP={gruen:'Grün',gelb:'Gelb',rot:'Rot'};
// Vorlagen: [Titel, Tage relativ zum Zieldatum, Meilenstein]
const PL_B={
  leitung:{t:'Abteilungsleitung',ic:'🧭',kurz:'Unsere To-dos, Themen für die nächste Runde und was wir beschlossen haben.',org:null,
    links:[['vorstand','Vorstand & Ziele'],['kalender','Termine']],
    vorl:[{t:'Sitzung vorbereiten',d:'Sitzung',a:[['Themen sammeln',-7],['Einladung verschicken',-5],['Unterlagen vorbereiten',-2],['Sitzung',0,1],['Protokoll und Beschlüsse festhalten',2],['Aufgaben verteilen',3]]}]},
  projekte:{t:'Projektsteuerung',ic:'🎯',kurz:'Alle Projekte aller Bereiche: Stand, Ampel, Meilensteine und was gerade Aufmerksamkeit braucht.',org:null,links:[],
    vorl:[{t:'Projekt aufsetzen',d:'Abschluss',a:[['Ziel und Umfang festlegen',-90],['Team und Verantwortung klären',-80,1],['Zeitplan mit Meilensteinen',-75],['Kosten und Finanzierung klären',-60],['Umsetzung',-30],['Abschluss',0,1],['Rückblick: was lief gut, was machen wir besser',14]]}]},
  entwicklung:{t:'Vereinsentwicklung',ic:'🌱',kurz:'Ziele 2030 im Blick, Ideen sammeln und daraus Projekte machen.',org:null,links:[['vorstand','Ziele 2030']],
    vorl:[{t:'Projekt aus einer Idee starten',d:'Umsetzung',a:[['Ziel und Nutzen klären',-60],['Verantwortlichen finden',-50,1],['Helfer aus dem Helferpool ansprechen',-40],['Kosten und Finanzierung klären',-30],['Umsetzung',0,1],['Rückblick',14]]}]},
  finanzen:{t:'Finanzen',ic:'💶',kurz:'Zuschüsse, Haushalt, Fristen und alles rund ums Geld.',org:/^Finanzen/,links:[['sponsoring','Partner']],
    vorl:[{t:'Zuschuss beantragen',d:'Antragsfrist',a:[['Fördertopf und Fristen klären',-42],['Unterlagen sammeln',-28],['Kostenplan erstellen',-21],['Antrag einreichen',0,1],['Bewilligung prüfen',30],['Verwendungsnachweis einreichen',120,1]]},
          {t:'Haushalt nächste Saison',d:'Beschluss',a:[['Kosten je Bereich abfragen',-42],['Einnahmen planen',-30],['Entwurf an die Abteilungsleitung',-14],['Haushalt beschließen',0,1]]}]},
  partner:{t:'Partner',ic:'🤝',kurz:'Partner gewinnen, betreuen und sichtbar machen.',org:/^Partner/,links:[['sponsoring','Partner-Übersicht'],['studio','Studio']],
    vorl:[{t:'Neuen Partner gewinnen',d:'Vorstellung',a:[['Erstkontakt',-30],['Termin vor Ort',-21],['Angebot schicken',-14],['Vertrag abschließen',-7,1],['Logo und Daten einholen',-3],['Vorstellung auf Social Media',0,1],['Partnertafel und Website ergänzen',7]]}]},
  spieltag:{t:'Spieltag & Spielbetrieb',ic:'🏟️',kurz:'Heimspieltag, Spielbetrieb, Sportgelände und Schiedsrichter.',org:/^Spieltag/,links:[['orga','Checklisten'],['kalender','Termine']],
    vorl:[{t:'Saisonstart Spielbetrieb',d:'Erster Heimspieltag',a:[['Spielerpässe prüfen',-30],['Schiedsrichter-Soll prüfen',-28],['Platz und Ausstattung prüfen',-21],['Heimspiel-Checkliste aktualisieren',-14],['Ordner und Kasse besetzen',-7],['Erster Heimspieltag',0,1]]}]},
  veranstaltungen:{t:'Veranstaltungen',ic:'🎉',kurz:'Kerwe, Weihnachtsfeier und neue Formate von der Idee bis zur Abrechnung.',org:/^Veranstaltungen/,links:[['orga','Checklisten'],['kalender','Termine']],
    vorl:[{t:'Veranstaltung planen',d:'Veranstaltung',a:[['Termin und Ort festlegen',-56,1],['Genehmigungen bei der Gemeinde prüfen',-42],['Getränke und Essen bestellen',-21],['Helfer einteilen und Checkliste anlegen',-14],['Werbung: Plakat, Social Media, Presse',-14],['Kasse und Wechselgeld vorbereiten',-2],['Aufbau',-1],['Veranstaltung',0,1],['Abbau und Abrechnung',3],['Rückblick: was lief gut, was machen wir besser',10]]}]},
  kommunikation:{t:'Kommunikation',ic:'📣',kurz:'Social Media, Presse, Website und Schriftführung.',org:/^Kommunikation/,links:[['studio','Studio']],
    vorl:[{t:'Kampagne oder Serie',d:'Veröffentlichung',a:[['Ziel und Botschaft festlegen',-21],['Redaktionsplan',-14],['Fotos und Videos',-10],['Texte und Grafiken im Studio',-7],['Freigabe',-3],['Veröffentlichung',0,1],['Auswertung',14]]}]},
  senioren:{t:'Senioren & Sportentwicklung',ic:'⚽',kurz:'Erste, Zweite und Sportentwicklung: Umfeld, Kader und Übergänge.',org:/^Seniorenleitung$/,links:[['training','Mannschaft'],['kader','Kader']],
    vorl:[{t:'Trainingslager planen',d:'Trainingslager',a:[['Ort und Termin festlegen',-90,1],['Angebot einholen',-75],['Kosten und Zuschuss klären',-60],['Anmeldung der Spieler',-45],['Programm erstellen',-14],['Fahrten organisieren',-7],['Trainingslager',0,1]]}]},
  jugend:{t:'Jugend',ic:'🌟',kurz:'Jugendleitung, Turniere und Übergänge zu den Senioren.',org:/^Jugendleitung/,links:[['teams','Mannschaften']],
    vorl:[{t:'Turnier ausrichten',d:'Turnier',a:[['Termin und Platz oder Halle belegen',-60,1],['Einladungen an Vereine',-45],['Spielplan',-14],['Helfer und Verpflegung',-10],['Preise und Urkunden',-7],['Turnier',0,1],['Ergebnisse veröffentlichen',2]]}]},
  soma:{t:'SOMA',ic:'🧢',kurz:'Soma-Mannschaft und ihre Aktionen.',org:/^SOMA/,links:[['teams','Mannschaften']],
    vorl:[{t:'Aktion planen',d:'Aktion',a:[['Idee und Termin',-30,1],['Wer macht mit',-21],['Material und Kosten',-14],['Aktion',0,1]]}]}
};
const PL_ORD=['leitung','projekte','entwicklung','finanzen','partner','spieltag','veranstaltungen','kommunikation','senioren','jugend','soma'];

/* ---------- Datum ---------- */
function plIso(d){ const x=new Date(d); return x.getFullYear()+'-'+String(x.getMonth()+1).padStart(2,'0')+'-'+String(x.getDate()).padStart(2,'0'); }
function plHeute(){ return plIso(new Date()); }
function plPlus(iso,n){ const d=new Date(iso+'T12:00:00'); d.setDate(d.getDate()+n); return plIso(d); }
function plTage(iso){ if(!iso)return null; return Math.round((new Date(iso+'T12:00:00')-new Date(plHeute()+'T12:00:00'))/864e5); }
function plDat(iso,lang){ if(!iso)return ''; const t=plTage(iso); if(t===0)return 'heute'; if(t===1)return 'morgen'; if(t===-1)return 'gestern';
  const d=new Date(iso+'T12:00:00'); if(t>1&&t<7)return d.toLocaleDateString('de-DE',{weekday:lang?'long':'short'});
  return d.toLocaleDateString('de-DE',{day:'2-digit',month:'2-digit',...(d.getFullYear()!==new Date().getFullYear()?{year:'2-digit'}:{})}); }
function plZeit(ts){ const d=new Date(ts), m=Math.round((Date.now()-d)/6e4); if(m<1)return 'gerade eben'; if(m<60)return 'vor '+m+' Min.'; const h=Math.round(m/60); if(h<24)return 'vor '+h+' Std.';
  return d.toLocaleDateString('de-DE',{day:'2-digit',month:'2-digit'})+' '+d.toLocaleTimeString('de-DE',{hour:'2-digit',minute:'2-digit'}); }
const PL_WT=['sonntag','montag','dienstag','mittwoch','donnerstag','freitag','samstag'];

/* ---------- Laden ---------- */
async function plLaden(still){
  if(PL.busy)return PL.d; PL.busy=true;
  try{ PL.d=await ogRpc('plan_laden'); }catch(e){ if(!still)throw e; } finally{ PL.busy=false; }
  return PL.d; }
function plDarf(){ if(typeof svDarf!=='function')return false; if(svRole()==='admin')return true; return PL_ORD.some(k=>svDarf('planung:'+k)===true); }
function plBer(){ return ((PL.d&&PL.d.bereiche)||[]).filter(k=>PL_B[k]); }
function plAuf(){ return (PL.d&&PL.d.aufgaben)||[]; }
function plPro(){ return (PL.d&&PL.d.projekte)||[]; }
function plProj(id){ return plPro().find(p=>p.id===id)||null; }
function plOffen(a){ return a.status!=='erledigt'&&a.status!=='idee'; }
function plUeber(a){ return plOffen(a)&&a.faellig&&plTage(a.faellig)<0; }
function plWerName(a){ return a.wer_name||a.wer_text||''; }
function plIch(a){ return PL.d&&a.wer===PL.d.ich; }
function plKuerzel(n){ const t=String(n||'').trim().split(/\s+/); return ((t[0]||'')[0]||'')+((t.length>1?t[t.length-1]:'')[0]||''); }
function plFort(pid){ const A=plAuf().filter(a=>a.projekt===pid&&a.status!=='idee'); const e=A.filter(a=>a.status==='erledigt').length; return {n:A.length,e,p:A.length?Math.round(e/A.length*100):0}; }
function plKomm(art,id){ return ((PL.d&&PL.d.kommentare)||[]).filter(k=>art==='a'?k.aufgabe===id:k.projekt===id); }
function plErsetzen(liste,obj){ const L=PL.d[liste], i=L.findIndex(x=>x.id===obj.id); if(i>=0)L[i]=obj; else L.push(obj); }

/* ---------- Panel ---------- */
function plPanel(){ let P=document.getElementById('panel-planung'); if(P)return P;
  const ref=document.getElementById('panel-home')||document.querySelector('.panel'); if(!ref)return null;
  P=document.createElement('section'); P.className='panel'; P.id='panel-planung'; ref.parentNode.insertBefore(P,ref.nextSibling); return P; }
async function plRender(){
  const P=plPanel(); if(!P)return;
  if(!PL.d){ P.innerHTML='<div class="card"><div class="empty">Planung wird geladen …</div></div>';
    try{ await plLaden(); }catch(e){ P.innerHTML=`<div class="card"><div class="empty">${plE(e.message)}</div></div>`; return; } }
  const B=plBer(); if(PL.b!=='meine'&&PL.b!=='ueber'&&!B.includes(PL.b))PL.b='meine';
  const ich=plAuf().filter(a=>plIch(a)&&plOffen(a)), ue=ich.filter(plUeber).length;
  const cnt=k=>plAuf().filter(a=>a.bereich===k&&plOffen(a)).length, ucnt=k=>plAuf().filter(a=>a.bereich===k&&plUeber(a)).length;
  const fokus=document.activeElement&&P.contains(document.activeElement)&&document.activeElement.id==='plQuick'?document.activeElement.value:null;
  P.innerHTML=`<div class="pl">
    <div class="pl-nav" role="tablist">
      <button type="button" data-plb="meine" class="${PL.b==='meine'?'on':''}">👤 Meine<i>${ich.length}</i>${ue?`<b class="pl-rot">${ue}</b>`:''}</button>
      <button type="button" data-plb="ueber" class="${PL.b==='ueber'?'on':''}">🗂️ Überblick</button>
      ${B.map(k=>`<button type="button" data-plb="${k}" class="${PL.b===k?'on':''}">${PL_B[k].ic} ${plE(PL_B[k].t)}<i>${cnt(k)}</i>${ucnt(k)?`<b class="pl-rot">${ucnt(k)}</b>`:''}</button>`).join('')}
    </div>
    <div id="plBody"></div></div>`;
  P.querySelectorAll('[data-plb]').forEach(b=>b.onclick=()=>{ PL.b=b.dataset.plb; PL.f.wer=''; PL.f.q=''; plRender(); });
  const on=P.querySelector('.pl-nav .on'); if(on&&on.scrollIntoView)try{ on.scrollIntoView({inline:'center',block:'nearest'}); }catch(e){}
  const Bd=P.querySelector('#plBody');
  if(PL.b==='meine')plMeine(Bd); else if(PL.b==='ueber')plUeberblick(Bd); else plBereich(Bd,PL.b);
  if(fokus!==null){ const q=document.getElementById('plQuick'); if(q){ q.value=fokus; q.focus(); } }
}

/* ---------- Aufgaben-Karte ---------- */
function plKarte(a,opt={}){
  const p=a.projekt?plProj(a.projekt):null, t=plTage(a.faellig), k=plKomm('a',a.id).length;
  const fcl=a.status==='erledigt'?'':t==null?'':t<0?'rot':t===0?'heute':t<=2?'bald':'';
  return `<div class="pl-k ${a.status==='erledigt'?'erl':''} ${a.prio===1?'p1':''}" data-pla="${plE(a.id)}" ${opt.drag?'draggable="true"':''}>
    <button type="button" class="pl-chk" data-plchk="${plE(a.id)}" aria-label="${a.status==='erledigt'?'Wieder öffnen':'Erledigt'}">${a.status==='erledigt'?'✓':''}</button>
    <div class="pl-kb"><div class="pl-kt">${a.meilenstein?'<span class="pl-ms" title="Meilenstein">◆</span> ':''}${a.prio===1?'<span class="pl-pr" title="Wichtig">!</span> ':''}${plE(a.titel)}</div>
      <div class="pl-km">${opt.bereich?`<span class="pl-tag">${PL_B[a.bereich]?PL_B[a.bereich].ic+' '+plE(PL_B[a.bereich].t):''}</span>`:''}${p&&!opt.ohneProjekt?`<span class="pl-tag pj">${plE(p.titel)}</span>`:''}
        ${a.faellig?`<span class="pl-f ${fcl}">📅 ${plE(plDat(a.faellig))}</span>`:''}${a.status==='wartet'?`<span class="pl-w">⏳ ${plE(a.wartet_auf||'wartet')}</span>`:''}
        ${a.sitzung?'<span class="pl-tag rd">Runde</span>':''}${k?`<span class="pl-c">💬 ${k}</span>`:''}${a.helfer?'<span class="pl-tag hp">Helferpool</span>':''}</div></div>
    ${plWerName(a)?`<span class="pl-av ${plIch(a)?'ich':''}" title="${plE(plWerName(a))}">${plE(plKuerzel(plWerName(a)).toUpperCase())}</span>`:''}</div>`; }
function plKartenBinden(R){
  R.querySelectorAll('[data-pla]').forEach(el=>el.onclick=e=>{ if(e.target.closest('[data-plchk]'))return; plAufgabeOeffnen(el.dataset.pla); });
  R.querySelectorAll('[data-plchk]').forEach(b=>b.onclick=async e=>{ e.stopPropagation(); const a=plAuf().find(x=>x.id===b.dataset.plchk); if(!a)return;
    const ziel=a.status==='erledigt'?'offen':'erledigt'; b.disabled=true;
    try{ const n=await ogRpc('plan_aufgabe_speichern',{p:{id:a.id,status:ziel}}); plErsetzen('aufgaben',n); try{ navigator.vibrate&&navigator.vibrate(12); }catch(x){}
      kToast(ziel==='erledigt'?'✓ Erledigt':'Wieder offen'); plRender(); }catch(x){ b.disabled=false; kToast('⚠️ '+x.message); } });
}

/* ---------- Meine ---------- */
function plMeine(R){
  const A=plAuf().filter(a=>plIch(a)&&plOffen(a)), h=plHeute();
  const gr=[['Überfällig',A.filter(a=>a.faellig&&a.faellig<h)],['Heute',A.filter(a=>a.faellig===h)],['Diese Woche',A.filter(a=>a.faellig>h&&plTage(a.faellig)<=7)],
    ['Später',A.filter(a=>a.faellig&&plTage(a.faellig)>7)],['Ohne Datum',A.filter(a=>!a.faellig)]];
  const vergeben=plAuf().filter(a=>a.von_id===PL.d.ich&&a.wer&&a.wer!==PL.d.ich&&plOffen(a)||a.von_id===PL.d.ich&&!a.wer&&a.wer_text&&plOffen(a));
  const erl=plAuf().filter(a=>plIch(a)&&a.status==='erledigt'&&a.erledigt_am&&(Date.now()-new Date(a.erledigt_am))<7*864e5);
  const proj=plPro().filter(p=>p.verantwortlich===PL.d.ich&&!['fertig','verworfen'].includes(p.status));
  const vor=plBer()[0]||'leitung';
  R.innerHTML=`<div class="pl-kopf"><div><h2>Hallo ${plE(String(PL.d.ich_name||'').split(' ')[0])}</h2><p>${A.length?`Du hast ${A.length} offene Aufgabe${A.length===1?'':'n'}${gr[0][1].length?`, ${gr[0][1].length} davon überfällig`:''}.`:'Nichts offen. Stark!'}</p></div>
      <div class="pl-akt"><button class="btn sm" type="button" id="plNeuA">${SVI('plus')} Aufgabe</button></div></div>
    ${plQuickHtml('Neue Aufgabe für mich, z. B. „Angebot Getränke holen bis Freitag !“')}
    <div class="pl-meine">${gr.filter(g=>g[1].length).map(([t,L])=>`<div class="pl-gr"><h3 class="${t==='Überfällig'?'rot':''}">${t}<i>${L.length}</i></h3>${L.sort((x,y)=>(x.faellig||'9')>(y.faellig||'9')?1:-1).map(a=>plKarte(a,{bereich:true})).join('')}</div>`).join('')
      ||'<div class="card pl-leer"><div class="pl-leer-ic">🌤️</div><b>Alles erledigt.</b><p>Neue Aufgaben legst du oben an oder in einem Bereich.</p></div>'}</div>
    ${proj.length?`<h3 class="pl-h3">Deine Projekte</h3><div class="pl-pgrid">${proj.map(plProjektKarte).join('')}</div>`:''}
    ${vergeben.length?`<details class="pl-det"><summary>Von dir vergeben, noch offen <i>${vergeben.length}</i></summary>${vergeben.map(a=>plKarte(a,{bereich:true})).join('')}</details>`:''}
    ${erl.length?`<details class="pl-det"><summary>Diese Woche erledigt <i>${erl.length}</i></summary>${erl.map(a=>plKarte(a,{bereich:true})).join('')}</details>`:''}`;
  plKartenBinden(R); plProjektKartenBinden(R);
  R.querySelector('#plNeuA').onclick=()=>plAufgabeOeffnen(null,{bereich:vor,wer:PL.d.ich});
  plQuickBinden(R,{bereich:vor,wer:PL.d.ich});
}

/* ---------- Überblick ---------- */
function plUeberblick(R){
  const B=plBer(), V=(PL.d.verlauf||[]).slice(0,25);
  R.innerHTML=`<div class="pl-kopf"><div><h2>Überblick</h2><p>Alle Bereiche, die du siehst. Tippe auf einen Bereich, um hineinzugehen.</p></div>
      <div class="pl-akt"><button class="btn ghost sm" type="button" id="plKorb">${SVI('trash')} Papierkorb</button></div></div>
    <div class="pl-bgrid">${B.map(k=>{ const A=plAuf().filter(a=>a.bereich===k), o=A.filter(plOffen), u=o.filter(plUeber), P=plPro().filter(p=>p.bereich===k&&!['fertig','verworfen'].includes(p.status));
      const n=o.filter(a=>a.faellig).sort((x,y)=>x.faellig>y.faellig?1:-1)[0];
      return `<button type="button" class="pl-bk" data-plb2="${k}"><div class="pl-bk-t"><span>${PL_B[k].ic}</span><b>${plE(PL_B[k].t)}</b></div>
        <div class="pl-bk-z"><span><b>${o.length}</b> offen</span>${u.length?`<span class="rot"><b>${u.length}</b> überfällig</span>`:''}<span><b>${P.length}</b> Projekt${P.length===1?'':'e'}</span></div>
        ${P.length?`<div class="pl-amp">${P.map(p=>`<i class="a-${p.ampel}" title="${plE(p.titel)}"></i>`).join('')}</div>`:''}
        ${n?`<div class="pl-bk-n">Als Nächstes: ${plE(n.titel)} · ${plE(plDat(n.faellig))}</div>`:''}</button>`; }).join('')}</div>
    <h3 class="pl-h3">Zuletzt passiert</h3>
    <div class="card pl-feed">${V.map(v=>`<div><b>${plE(v.wer||'Jemand')}</b> ${plE(v.was)} <small>${PL_B[v.bereich]?PL_B[v.bereich].ic:''} ${plE(plZeit(v.am))}</small></div>`).join('')||'<div class="empty">Noch nichts passiert.</div>'}</div>`;
  R.querySelectorAll('[data-plb2]').forEach(b=>b.onclick=()=>{ PL.b=b.dataset.plb2; plRender(); window.scrollTo&&window.scrollTo({top:0,behavior:'smooth'}); });
  R.querySelector('#plKorb').onclick=plPapierkorb;
}

/* ---------- Bereich ---------- */
function plBereich(R,k){
  const C=PL_B[k], v=PL.v[k]||(k==='projekte'?'projekte':'board');
  const org=plOrg(k), leute=plLeute();
  R.innerHTML=`<div class="pl-kopf"><div><h2>${C.ic} ${plE(C.t)}</h2><p>${plE(C.kurz)}</p>
        ${org?`<div class="pl-org">${org.verantwortlich?`<span>Verantwortlich: <b>${plE(org.verantwortlich)}</b></span>`:''}${org.stellv?`<span>Stellvertretung: <b>${plE(org.stellv)}</b></span>`:''}</div>`:''}</div>
      <div class="pl-akt"><button class="btn sm" type="button" id="plNeuA">${SVI('plus')} Aufgabe</button><button class="btn ghost sm" type="button" id="plNeuP">${SVI('plus')} Projekt</button>
        <button class="btn ghost sm" type="button" id="plVorl">📋 Vorlage</button><button class="btn ghost sm" type="button" id="plText" title="Offene Aufgaben als Text kopieren">${SVI('copy')}</button></div></div>
    <div id="plTool"></div>
    <div class="pl-leiste"><div class="seg4 sm pl-views">${[['board','Board'],['liste','Liste'],['projekte','Projekte'],['zeit','Zeitplan']].map(([x,l])=>`<button type="button" data-plv="${x}" class="${v===x?'on':''}">${l}</button>`).join('')}</div>
      <div class="pl-filter"><select id="plFw" aria-label="Person"><option value="">Alle Personen</option><option value="ich"${PL.f.wer==='ich'?' selected':''}>Nur meine</option><option value="-"${PL.f.wer==='-'?' selected':''}>Noch niemand</option>
        ${leute.map(l=>`<option value="${plE(l.k)}"${PL.f.wer===l.k?' selected':''}>${plE(l.n)}</option>`).join('')}</select>
        <input type="search" id="plFq" placeholder="Suchen" value="${plE(PL.f.q)}"></div></div>
    ${v==='board'||v==='liste'?plQuickHtml('Schnell anlegen: „Plakat drucken @Lukas bis 15.11. !“'):''}
    <div id="plView"></div>`;
  const T=R.querySelector('#plTool');
  try{ if(k==='leitung')plToolLeitung(T); else if(k==='projekte')plToolSteuerung(T); else if(k==='entwicklung')plToolEntwicklung(T); else plToolStandard(T,k); }catch(e){ console.warn('Planung Werkzeug',e); }
  const VV=R.querySelector('#plView');
  if(v==='board')plBoard(VV,k); else if(v==='liste')plListe(VV,k); else if(v==='projekte')plProjekte(VV,k); else plZeitplan(VV,k);
  R.querySelectorAll('[data-plv]').forEach(b=>b.onclick=()=>{ PL.v[k]=b.dataset.plv; plRender(); });
  R.querySelector('#plFw').onchange=e=>{ PL.f.wer=e.target.value; plRender(); };
  const q=R.querySelector('#plFq'); q.oninput=()=>{ PL.f.q=q.value; clearTimeout(PL.qt); PL.qt=setTimeout(()=>{ const pos=q.selectionStart; plRender(); const n=document.getElementById('plFq'); if(n){ n.focus(); try{ n.setSelectionRange(pos,pos); }catch(e){} } },220); };
  R.querySelector('#plNeuA').onclick=()=>plAufgabeOeffnen(null,{bereich:k});
  R.querySelector('#plNeuP').onclick=()=>plProjektOeffnen(null,{bereich:k});
  R.querySelector('#plVorl').onclick=()=>plVorlage(k);
  R.querySelector('#plText').onclick=()=>plAlsText(k);
  plQuickBinden(R,{bereich:k});
}
function plOrg(k){ const O=(PL.d&&PL.d.org)||[], C=PL_B[k]; if(!C||!C.org)return null; return O.find(o=>o.art==='bereich'&&C.org.test(o.titel))||null; }
// Personen für Filter: Konten und Freitext-Namen aus den Aufgaben
function plLeute(){ const L=[], seen=new Set(); ((PL.d&&PL.d.leute)||[]).forEach(p=>{ L.push({k:p.id,n:p.name}); seen.add(String(p.name).toLowerCase()); });
  plAuf().forEach(a=>{ if(a.wer_text&&!seen.has(a.wer_text.toLowerCase())){ seen.add(a.wer_text.toLowerCase()); L.push({k:'t:'+a.wer_text,n:a.wer_text}); } }); return L; }
function plFilter(A){ const f=PL.f, q=f.q.trim().toLowerCase();
  return A.filter(a=>(!f.wer||(f.wer==='ich'?plIch(a):f.wer==='-'?!a.wer&&!a.wer_text:f.wer.startsWith('t:')?a.wer_text===f.wer.slice(2):a.wer===f.wer))
    &&(!q||(a.titel+' '+(a.notiz||'')+' '+plWerName(a)+' '+((plProj(a.projekt)||{}).titel||'')).toLowerCase().includes(q))); }
function plSort(A){ return A.slice().sort((x,y)=>(x.prio-y.prio)||((x.faellig||'9999')>(y.faellig||'9999')?1:(x.faellig||'9999')<(y.faellig||'9999')?-1:0)||(x.sort-y.sort)); }

/* ---------- Board ---------- */
function plBoard(R,k){
  const A=plFilter(plAuf().filter(a=>a.bereich===k)), mitIdee=k==='entwicklung'||A.some(a=>a.status==='idee');
  const sp=(mitIdee?['idee']:[]).concat(['offen','arbeit','wartet','erledigt']);
  R.innerHTML=`<div class="pl-board">${sp.map(s=>{ let L=plSort(A.filter(a=>a.status===s)); let mehr=0;
      if(s==='erledigt'){ L=A.filter(a=>a.status==='erledigt').sort((x,y)=>(y.erledigt_am||'')>(x.erledigt_am||'')?1:-1); if(L.length>8&&!PL.f.erl){ mehr=L.length-8; L=L.slice(0,8); } }
      return `<div class="pl-sp s-${s}" data-plsp="${s}"><div class="pl-sph"><b>${PL_ST[s]}</b><i>${A.filter(a=>a.status===s).length}</i></div>
        <div class="pl-spl">${L.map(a=>plKarte(a,{drag:true})).join('')}${mehr?`<button type="button" class="pl-mehr" id="plErlMehr">+ ${mehr} weitere</button>`:''}</div>
        ${s!=='erledigt'?`<button type="button" class="pl-add" data-pladd="${s}">${SVI('plus')} Aufgabe</button>`:''}</div>`; }).join('')}</div>`;
  plKartenBinden(R);
  R.querySelectorAll('[data-pladd]').forEach(b=>b.onclick=()=>plAufgabeOeffnen(null,{bereich:k,status:b.dataset.pladd}));
  const m=R.querySelector('#plErlMehr'); if(m)m.onclick=()=>{ PL.f.erl=true; plRender(); };
  // Ziehen und Ablegen (Maus); am Handy über den Status in der Aufgabe
  R.querySelectorAll('.pl-k[draggable]').forEach(c=>{ c.addEventListener('dragstart',e=>{ e.dataTransfer.setData('text/plain',c.dataset.pla); e.dataTransfer.effectAllowed='move'; c.classList.add('zieh'); });
    c.addEventListener('dragend',()=>c.classList.remove('zieh')); });
  R.querySelectorAll('[data-plsp]').forEach(sp=>{ sp.addEventListener('dragover',e=>{ e.preventDefault(); sp.classList.add('drop'); });
    sp.addEventListener('dragleave',()=>sp.classList.remove('drop'));
    sp.addEventListener('drop',async e=>{ e.preventDefault(); sp.classList.remove('drop'); const id=e.dataTransfer.getData('text/plain'), a=plAuf().find(x=>x.id===id); if(!a||a.status===sp.dataset.plsp)return;
      const alt=a.status; a.status=sp.dataset.plsp; plRender();
      try{ const p={id,status:sp.dataset.plsp}; if(p.status==='wartet'&&!a.wartet_auf){ const w=await plFrage('Worauf wartet „'+a.titel+'“?','z. B. Rückmeldung der Gemeinde'); if(w)p.wartet_auf=w; }
        plErsetzen('aufgaben',await ogRpc('plan_aufgabe_speichern',{p})); plRender(); }catch(x){ a.status=alt; plRender(); kToast('⚠️ '+x.message); } }); });
}

/* ---------- Liste (nach Projekt gruppiert) ---------- */
function plListe(R,k){
  const A=plFilter(plAuf().filter(a=>a.bereich===k&&(PL.f.erl||a.status!=='erledigt')));
  const gruppen=[[null,'Ohne Projekt']].concat(plPro().filter(p=>p.bereich===k).map(p=>[p.id,p.titel]));
  const erl=plAuf().filter(a=>a.bereich===k&&a.status==='erledigt').length;
  R.innerHTML=gruppen.map(([pid,t])=>{ const L=plSort(A.filter(a=>(a.projekt||null)===pid)); if(!L.length)return '';
      const ideen=L.filter(a=>a.status==='idee'), rest=L.filter(a=>a.status!=='idee');
      return `<div class="pl-lg"><h3 class="pl-h3">${pid?`<button type="button" class="pl-lnk" data-plp="${plE(pid)}">${plE(t)}</button>`:plE(t)}<i>${rest.length}</i></h3>
        ${rest.map(a=>plKarte(a,{ohneProjekt:true})).join('')}
        ${ideen.length?`<details class="pl-det"><summary>💡 Ideen <i>${ideen.length}</i></summary>${ideen.map(a=>plKarte(a,{ohneProjekt:true})).join('')}</details>`:''}</div>`; }).join('')
    +(A.length?'':'<div class="card pl-leer"><div class="pl-leer-ic">📝</div><b>Hier ist noch nichts.</b><p>Lege oben die erste Aufgabe an oder starte mit einer Vorlage.</p></div>')
    +(erl?`<button type="button" class="pl-mehr" id="plErlT">${PL.f.erl?'Erledigte ausblenden':'Erledigte zeigen ('+erl+')'}</button>`:'');
  plKartenBinden(R); plLnkBinden(R);
  const b=R.querySelector('#plErlT'); if(b)b.onclick=()=>{ PL.f.erl=!PL.f.erl; plRender(); };
}
function plLnkBinden(R){ R.querySelectorAll('[data-plp]').forEach(b=>b.onclick=e=>{ e.stopPropagation(); plProjektOeffnen(b.dataset.plp); }); }

/* ---------- Projekte ---------- */
function plProjektKarte(p){
  const f=plFort(p.id), A=plAuf().filter(a=>a.projekt===p.id), ms=A.filter(a=>a.meilenstein&&a.status!=='erledigt'&&a.faellig).sort((x,y)=>x.faellig>y.faellig?1:-1)[0];
  const ue=A.filter(plUeber).length, ideen=A.filter(a=>a.status==='idee').length;
  return `<button type="button" class="pl-pk a-${p.ampel} st-${p.status}" data-plp="${plE(p.id)}">
    <div class="pl-pk-k">${p.status==='idee'?'<span class="pl-pk-i">💡</span>':`<span class="pl-dot a-${p.ampel}" title="Ampel ${PL_AMP[p.ampel]}"></span>`}<b>${plE(p.titel)}</b><span class="pl-pst">${PL_PST[p.status]}</span></div>
    <div class="pl-pk-m">${PL.b==='projekte'||PL.b==='meine'?`<span>${PL_B[p.bereich].ic} ${plE(PL_B[p.bereich].t)}</span>`:''}${p.verantwortlich_name||p.verantwortlich_text?`<span>👤 ${plE(p.verantwortlich_name||p.verantwortlich_text)}</span>`:'<span class="gelb">Noch ohne Verantwortlichen</span>'}
      ${p.ende?`<span>🏁 ${plE(plDat(p.ende))}</span>`:''}</div>
    ${p.status==='idee'&&!f.n?'':`<div class="pl-bar"><i style="width:${f.p}%"></i></div>`}
    <div class="pl-pk-m">${p.status==='idee'&&!f.n?'':`<span>${f.e} von ${f.n} erledigt</span>`}${ideen?`<span>💡 ${ideen} Idee${ideen===1?'':'n'}</span>`:''}${ue?`<span class="rot">${ue} überfällig</span>`:''}${ms?`<span>◆ ${plE(ms.titel)} · ${plE(plDat(ms.faellig))}</span>`:''}</div>
    ${p.ampel!=='gruen'&&p.ampel_grund?`<div class="pl-grund">${plE(p.ampel_grund)}</div>`:''}</button>`; }
function plProjektKartenBinden(R){ R.querySelectorAll('button.pl-pk[data-plp]').forEach(b=>b.onclick=()=>plProjektOeffnen(b.dataset.plp)); }
function plProjekte(R,k){
  const alle=k==='projekte', P=plPro().filter(p=>alle||p.bereich===k);
  const akt=P.filter(p=>!['fertig','verworfen'].includes(p.status)), zu=P.filter(p=>['fertig','verworfen'].includes(p.status));
  const ord={laeuft:0,geplant:1,pausiert:2,idee:3};
  R.innerHTML=(akt.length?`<div class="pl-pgrid">${akt.sort((x,y)=>(ord[x.status]-ord[y.status])||(x.prio-y.prio)).map(plProjektKarte).join('')}</div>`
      :'<div class="card pl-leer"><div class="pl-leer-ic">🎯</div><b>Noch keine Projekte.</b><p>Ein Projekt bündelt Aufgaben mit Ziel, Verantwortlichem und Zeitraum.</p></div>')
    +(zu.length?`<details class="pl-det"><summary>Abgeschlossen und verworfen <i>${zu.length}</i></summary><div class="pl-pgrid">${zu.map(plProjektKarte).join('')}</div></details>`:'');
  plProjektKartenBinden(R);
}

/* ---------- Zeitplan ---------- */
function plZeitplan(R,k){
  const alle=k==='projekte', P=plPro().filter(p=>(alle||p.bereich===k)&&!['verworfen'].includes(p.status));
  const mit=P.filter(p=>p.start||p.ende), ohne=P.filter(p=>!p.start&&!p.ende);
  const MS=plAuf().filter(a=>a.meilenstein&&a.faellig&&(alle?a.projekt:a.bereich===k));
  const h=plHeute(), d0=new Date(h.slice(0,7)+'-01T12:00:00'); d0.setMonth(d0.getMonth()-1);
  let ende=new Date(d0); ende.setMonth(ende.getMonth()+7);
  mit.concat(MS.map(a=>({ende:a.faellig}))).forEach(p=>{ const e=p.ende||p.start; if(e){ const x=new Date(e+'T12:00:00'); if(x>ende&&x<new Date(d0.getTime()+3*365*864e5)){ ende=new Date(x.getFullYear(),x.getMonth()+1,1,12); } } });
  const mon=[]; for(let d=new Date(d0); d<ende; d.setMonth(d.getMonth()+1))mon.push(new Date(d));
  const t0=d0.getTime(), t1=ende.getTime(), pos=iso=>Math.max(0,Math.min(100,(new Date(iso+'T12:00:00').getTime()-t0)/(t1-t0)*100));
  const heute=pos(h);
  R.innerHTML=`<div class="card pl-zeit"><div class="pl-zt"><div class="pl-zm">${mon.map(m=>`<span style="width:${100/mon.length}%">${m.toLocaleDateString('de-DE',{month:'short'})}${m.getMonth()===0?' '+String(m.getFullYear()).slice(2):''}</span>`).join('')}</div>
      ${mit.length?mit.sort((x,y)=>(x.start||x.ende)>(y.start||y.ende)?1:-1).map(p=>{ const s=pos(p.start||p.ende), e=pos(p.ende||plPlus(p.start,14)), ms=MS.filter(a=>a.projekt===p.id);
        return `<div class="pl-zr"><button type="button" class="pl-zn" data-plp="${plE(p.id)}">${alle?PL_B[p.bereich].ic+' ':''}${plE(p.titel)}</button><div class="pl-zb">
          <i class="pl-zbar a-${p.ampel} st-${p.status}" style="left:${s}%;width:${Math.max(1.5,e-s)}%"></i>${ms.map(a=>`<b class="pl-zms" style="left:${pos(a.faellig)}%" title="${plE(a.titel+' · '+plDat(a.faellig))}">◆</b>`).join('')}
          <u style="left:${heute}%"></u></div></div>`; }).join(''):'<div class="empty">Noch kein Projekt mit Zeitraum. Trage im Projekt Start und Ende ein.</div>'}
    </div></div>
    ${ohne.length?`<details class="pl-det"><summary>Noch ohne Zeitraum <i>${ohne.length}</i></summary><div class="pl-pgrid">${ohne.map(plProjektKarte).join('')}</div></details>`:''}`;
  plLnkBinden(R); plProjektKartenBinden(R);
}

/* ---------- Werkzeuge je Bereich ---------- */
function plToolLeitung(T){
  const runde=plSort(plAuf().filter(a=>a.sitzung&&a.status!=='erledigt'));
  const B=(PL.d.beschluesse||[]).filter(b=>b.bereich==='leitung');
  const LT=((PL.d.org)||[]).filter(o=>o.art==='leitung'&&o.verantwortlich);
  const leute=(PL.d.leute||[]);
  const spalten=LT.map(o=>{ const p=leute.find(l=>String(l.name).toLowerCase()===String(o.verantwortlich).toLowerCase());
    const A=plAuf().filter(a=>a.bereich==='leitung'&&plOffen(a)&&(p?a.wer===p.id:(a.wer_text||'').toLowerCase()===String(o.verantwortlich).toLowerCase()));
    return {n:o.verantwortlich,r:o.titel,A}; });
  T.innerHTML=`<div class="pl-tool">
    ${spalten.length?`<div class="pl-tk"><h3>Wer hat was</h3><div class="pl-wer">${spalten.map(s=>`<div class="pl-wer-k"><div class="pl-wer-n"><span class="pl-av">${plE(plKuerzel(s.n).toUpperCase())}</span><div><b>${plE(s.n)}</b><small>${plE(s.r)}</small></div><i>${s.A.length}</i></div>
        ${plSort(s.A).slice(0,4).map(a=>`<button type="button" class="pl-mini ${plUeber(a)?'rot':''}" data-pla2="${plE(a.id)}">${plE(a.titel)}${a.faellig?` <small>${plE(plDat(a.faellig))}</small>`:''}</button>`).join('')||'<small class="pl-nix">Nichts offen</small>'}</div>`).join('')}</div></div>`:''}
    <div class="pl-tk"><h3>Für die nächste Runde<i>${runde.length}</i></h3>
      ${runde.map(a=>`<button type="button" class="pl-mini" data-pla2="${plE(a.id)}">${PL_B[a.bereich]?PL_B[a.bereich].ic:''} ${plE(a.titel)}${plWerName(a)?` <small>${plE(plWerName(a))}</small>`:''}</button>`).join('')||'<small class="pl-nix">Markiere Aufgaben mit „Für die nächste Runde“ oder schreibe #runde in die Schnelleingabe.</small>'}
      <div class="pl-tk-a">${runde.length?`<button type="button" class="btn ghost sm" id="plTo">${SVI('copy')} Als Tagesordnung kopieren</button>`:''}<button type="button" class="btn ghost sm" id="plTh">${SVI('plus')} Thema</button></div></div>
    <div class="pl-tk"><h3>Beschlüsse<i>${B.length}</i></h3>
      ${B.slice(0,5).map(b=>`<button type="button" class="pl-bs" data-plbs="${plE(b.id)}"><small>${plE(new Date(b.datum+'T12:00:00').toLocaleDateString('de-DE'))}${b.gremium?' · '+plE(b.gremium):''}${b.abstimmung?' · '+plE(b.abstimmung):''}</small><b>${plE(b.titel)}</b>${b.ergebnis?`<span>${plE(b.ergebnis)}</span>`:''}</button>`).join('')||'<small class="pl-nix">Entscheidung, Ergebnis und Begründung werden hier festgehalten.</small>'}
      <div class="pl-tk-a"><button type="button" class="btn ghost sm" id="plBsN">${SVI('plus')} Beschluss festhalten</button>${B.length>5?`<button type="button" class="btn ghost sm" id="plBsA">Alle ${B.length}</button>`:''}</div></div>
  </div>`;
  T.querySelectorAll('[data-pla2]').forEach(b=>b.onclick=()=>plAufgabeOeffnen(b.dataset.pla2));
  T.querySelectorAll('[data-plbs]').forEach(b=>b.onclick=()=>plBeschluss(b.dataset.plbs));
  T.querySelector('#plBsN').onclick=()=>plBeschluss(null);
  const ba=T.querySelector('#plBsA'); if(ba)ba.onclick=plBeschlussListe;
  T.querySelector('#plTh').onclick=()=>plAufgabeOeffnen(null,{bereich:'leitung',sitzung:true});
  const to=T.querySelector('#plTo'); if(to)to.onclick=()=>plKopieren('Tagesordnung Abteilungsleitung '+new Date().toLocaleDateString('de-DE')+'\n\n'+runde.map((a,i)=>(i+1)+'. '+a.titel+(plWerName(a)?' ('+plWerName(a)+')':'')).join('\n'));
}
function plToolSteuerung(T){
  const P=plPro().filter(p=>!['fertig','verworfen','idee'].includes(p.status)), h=plHeute();
  const auf=[];
  P.filter(p=>p.ampel==='rot').forEach(p=>auf.push([3,p,'Ampel rot'+(p.ampel_grund?': '+p.ampel_grund:'')]));
  P.filter(p=>p.ampel==='gelb').forEach(p=>auf.push([2,p,'Ampel gelb'+(p.ampel_grund?': '+p.ampel_grund:'')]));
  P.filter(p=>!p.verantwortlich&&!p.verantwortlich_text).forEach(p=>auf.push([2,p,'Niemand verantwortlich']));
  P.filter(p=>p.status==='laeuft'&&!p.ende).forEach(p=>auf.push([1,p,'Läuft ohne Enddatum']));
  P.filter(p=>p.ende&&p.ende<h).forEach(p=>auf.push([3,p,'Enddatum überschritten']));
  P.forEach(p=>{ const u=plAuf().filter(a=>a.projekt===p.id&&plUeber(a)).length; if(u)auf.push([2,p,u+' Aufgabe'+(u===1?'':'n')+' überfällig']); });
  const alle=plPro(), z={laeuft:0,geplant:0,pausiert:0,idee:0}; alle.forEach(p=>{ if(p.status in z)z[p.status]++; });
  const amp={gruen:0,gelb:0,rot:0}; P.forEach(p=>amp[p.ampel]++);
  const ms=plAuf().filter(a=>a.meilenstein&&a.projekt&&a.status!=='erledigt'&&a.faellig&&plTage(a.faellig)<=30).sort((x,y)=>x.faellig>y.faellig?1:-1);
  T.innerHTML=`<div class="pl-tool">
    <div class="pl-tk pl-kpis"><div><b>${z.laeuft}</b><span>laufen</span></div><div><b>${z.geplant}</b><span>geplant</span></div><div><b>${z.idee}</b><span>Ideen</span></div><div><b>${z.pausiert}</b><span>pausiert</span></div>
      <div class="pl-ampk"><i class="a-gruen"></i>${amp.gruen}<i class="a-gelb"></i>${amp.gelb}<i class="a-rot"></i>${amp.rot}</div></div>
    <div class="pl-tk"><h3>Braucht Aufmerksamkeit<i>${auf.length}</i></h3>${auf.sort((x,y)=>y[0]-x[0]).slice(0,8).map(([s,p,t])=>`<button type="button" class="pl-mini s${s}" data-plp="${plE(p.id)}">${PL_B[p.bereich].ic} <b>${plE(p.titel)}</b> <small>${plE(t)}</small></button>`).join('')||'<small class="pl-nix">Alles im grünen Bereich.</small>'}</div>
    <div class="pl-tk"><h3>Meilensteine der nächsten 30 Tage<i>${ms.length}</i></h3>${ms.slice(0,8).map(a=>`<button type="button" class="pl-mini ${plUeber(a)?'rot':''}" data-pla2="${plE(a.id)}">◆ ${plE(a.titel)} <small>${plE((plProj(a.projekt)||{}).titel||'')} · ${plE(plDat(a.faellig))}</small></button>`).join('')||'<small class="pl-nix">Keine Meilensteine in den nächsten 30 Tagen.</small>'}</div>
  </div>`;
  plLnkBinden(T); T.querySelectorAll('[data-pla2]').forEach(b=>b.onclick=()=>plAufgabeOeffnen(b.dataset.pla2));
}
// Ziele 2030 mit Live-Zahlen, wo die App sie kennt
function plZielKpi(z){ const K=PL.d.kpi||{}, t=z.titel, n=(t.match(/(\d+)/)||[])[1];
  if(/Helfer/i.test(t)&&K.helfer!=null)return {ist:K.helfer,soll:+n||30,was:'im Helferpool'};
  if(/Partner/i.test(t)&&K.partner!=null)return {ist:K.partner,soll:+n||10,was:'aktive Partner'};
  if(/Veranstaltungen/i.test(t)&&K.veranstaltungen!=null)return {ist:K.veranstaltungen,soll:(+n||5)+(/Kerwe/.test(t)?1:0),was:'Veranstaltungen '+K.jahr};
  return null; }
function plToolEntwicklung(T){
  const Z=(PL.d.ziele||[]), I=(PL.d.ideen||[]).filter(x=>!x.uebernommen);
  T.innerHTML=`<div class="pl-tool">
    <div class="pl-tk pl-ziele"><h3>Ziele 2030</h3>${Z.map(z=>{ const k=plZielKpi(z), P=plPro().filter(p=>p.ziel===z.id);
        return `<div class="pl-ziel ${z.erreicht?'ok':''}"><div class="pl-ziel-t"><span>${z.art==='ziel_sport'?'⚽':'🏛️'}</span><b>${plE(z.titel)}</b>${z.erreicht?'<em>erreicht</em>':''}</div>
          ${k?`<div class="pl-bar"><i style="width:${Math.min(100,Math.round(k.ist/k.soll*100))}%"></i></div><small><b>${k.ist}</b> von ${k.soll} ${plE(k.was)}</small>`:''}
          ${P.length?`<div class="pl-ziel-p">${P.map(p=>`<button type="button" class="pl-chip" data-plp="${plE(p.id)}"><i class="pl-dot a-${p.ampel}"></i>${plE(p.titel)}</button>`).join('')}</div>`:'<small class="pl-nix">Noch kein Projekt zu diesem Ziel.</small>'}</div>`; }).join('')||'<small class="pl-nix">Die Ziele 2030 pflegst du unter Vorstand & Ziele.</small>'}</div>
    ${PL.d.ideen?`<div class="pl-tk"><h3>Ideen aus dem Helferpool<i>${I.length}</i></h3>${I.slice(0,6).map(x=>`<div class="pl-idee"><p>„${plE(x.idee)}“</p><small>${plE(x.name)} · ${plE(new Date(x.am).toLocaleDateString('de-DE'))}</small>
        <button type="button" class="btn ghost sm" data-plid="${plE(x.id)}">💡 In den Ideenspeicher</button></div>`).join('')||'<small class="pl-nix">Alle Ideen sind übernommen. Neue kommen über den Mitmach-Zettel und die Mitmach-Seite.</small>'}
      ${I.length>6?`<small class="pl-nix">und ${I.length-6} weitere</small>`:''}</div>`:''}
  </div>`;
  plLnkBinden(T);
  T.querySelectorAll('[data-plid]').forEach(b=>b.onclick=async()=>{ b.disabled=true; try{ const a=await ogRpc('plan_idee_uebernehmen',{p_helfer:b.dataset.plid,p_bereich:'entwicklung'}); PL.d.aufgaben.push(a);
      const x=PL.d.ideen.find(i=>i.id===b.dataset.plid); if(x)x.uebernommen=true; kToast('💡 Im Ideenspeicher'); PL.v.entwicklung='board'; plRender(); }catch(e){ b.disabled=false; kToast('⚠️ '+e.message); } });
}
function plToolStandard(T,k){
  const C=PL_B[k], org=plOrg(k), dauer=org&&Array.isArray(org.aufgaben)?org.aufgaben:[];
  const links=(C.links||[]).filter(([t])=>{ try{ return svTabAllowed(t); }catch(e){ return false; } });
  if(!dauer.length&&!links.length){ T.innerHTML=''; return; }
  T.innerHTML=`<div class="pl-tool">${dauer.length?`<div class="pl-tk"><h3>Daueraufgaben laut Konzept</h3><ul class="pl-dauer">${dauer.map(d=>`<li>${plE(d)}</li>`).join('')}</ul></div>`:''}
    ${links.length?`<div class="pl-tk"><h3>Passend dazu in der App</h3><div class="pl-links">${links.map(([t,l])=>`<button type="button" class="lk4" data-plgo="${plE(t)}">${plE(l)} →</button>`).join('')}</div></div>`:''}</div>`;
  T.querySelectorAll('[data-plgo]').forEach(b=>b.onclick=()=>goTab(b.dataset.plgo));
}

/* ---------- Schnelleingabe ---------- */
function plQuickHtml(ph){ return `<form class="pl-quick" id="plQuickF" autocomplete="off"><span>${SVI('plus')}</span><input id="plQuick" maxlength="240" placeholder="${plE(ph)}" enterkeyhint="done"><button class="btn sm" type="submit">Anlegen</button></form>`; }
function plQuickBinden(R,vor){ const f=R.querySelector('#plQuickF'); if(!f)return;
  f.onsubmit=async e=>{ e.preventDefault(); const i=f.querySelector('#plQuick'); const p=plParse(i.value); if(!p.titel)return;
    if(p.mehrdeutig){ kToast('Mehrere Personen heißen „'+p.mehrdeutig+'“. Bitte mit Nachnamen schreiben, z. B. @'+p.mehrdeutig+' Klee'); return; }
    const neu=Object.assign({bereich:vor.bereich},vor.wer&&!p.wer&&!p.wer_text?{wer:vor.wer}:{},p);
    f.querySelector('button').disabled=true;
    try{ const a=await ogRpc('plan_aufgabe_speichern',{p:neu}); PL.d.aufgaben.push(a); i.value=''; kToast('✓ Angelegt'+(a.wer_name&&a.wer!==PL.d.ich?' für '+a.wer_name.split(' ')[0]:'')+(a.faellig?', fällig '+plDat(a.faellig):''));
      plRender(); const n=document.getElementById('plQuick'); if(n)n.focus(); }catch(x){ kToast('⚠️ '+x.message); f.querySelector('button').disabled=false; } }; }
// „Plakat drucken @Lukas bis Freitag ! #runde“ → Titel, Person, Datum, wichtig, für die nächste Runde
function plParse(txt){
  let t=' '+String(txt||'').trim()+' '; const r={};
  t=t.replace(/\s#runde\b/i,()=>{ r.sitzung=true; return ' '; });
  t=t.replace(/\s!+(?=\s)/,()=>{ r.prio=1; return ' '; });
  t=t.replace(/\s@([A-Za-zÄÖÜäöüß][\wÄÖÜäöüß.-]*)(?:\s+([A-Za-zÄÖÜäöüß0-9][\wÄÖÜäöüß.-]*))?/,(m,n,n2)=>{ const L=(PL.d&&PL.d.leute)||[], k=n.toLowerCase(), nm=l=>String(l.name).toLowerCase();
    // Erst Vor- und Nachname („@Vera Klee“), dann nur Vorname; mehrdeutig: niemand, Hinweis
    if(n2){ const z=L.filter(l=>nm(l).startsWith(k+' '+n2.toLowerCase())); if(z.length===1){ r.wer=z[0].id; return ' '; } }
    let z=L.filter(l=>nm(l).split(/\s+/)[0]===k); if(!z.length)z=L.filter(l=>nm(l).startsWith(k)); if(!z.length)z=L.filter(l=>nm(l).includes(k));
    const rest=n2?' '+n2:'';
    if(z.length===1)r.wer=z[0].id; else if(z.length>1){ r.mehrdeutig=n; return rest+' '; } else r.wer_text=n.charAt(0).toUpperCase()+n.slice(1);
    return rest+' '; });
  const h=plHeute(), setz=d=>{ r.faellig=d; return ' '; };
  t=t.replace(/\s(?:bis\s+)?(?:zum\s+|am\s+)?(\d{1,2})\.(\d{1,2})\.(\d{2,4})?(?=\s)/i,(m,d,mo,y)=>{ let J=y?(+y<100?2000+ +y:+y):new Date().getFullYear(); let iso=J+'-'+String(mo).padStart(2,'0')+'-'+String(d).padStart(2,'0');
    if(!y&&iso<h)iso=(J+1)+iso.slice(4); return isNaN(new Date(iso))?m:setz(iso); });
  t=t.replace(/\s(?:bis\s+)?(heute|morgen|übermorgen)(?=\s)/i,(m,w)=>setz(plPlus(h,{heute:0,morgen:1,'übermorgen':2}[w.toLowerCase()])));
  t=t.replace(/\s(?:bis\s+)?(?:nächste|naechste)\s+woche(?=\s)/i,()=>{ const d=new Date(h+'T12:00:00'), n=((8-d.getDay())%7)||7; return setz(plPlus(h,n)); });
  t=t.replace(/\s(?:bis\s+)?(?:zum\s+|am\s+)?(montag|dienstag|mittwoch|donnerstag|freitag|samstag|sonntag)(?=\s)/i,(m,w)=>{ const z=PL_WT.indexOf(w.toLowerCase()), d=new Date(h+'T12:00:00').getDay(); return setz(plPlus(h,((z-d+7)%7)||7)); });
  r.titel=t.replace(/\s+/g,' ').trim(); return r; }

/* ---------- Aufgabe öffnen und bearbeiten ---------- */
function plPersonFeld(id,wer,text,label){
  const L=(PL.d.leute||[]), frei=!wer&&!!text;
  return `<div class="field"><label for="${id}">${plE(label)}</label><select id="${id}"><option value="">Noch niemand</option>
    ${L.map(l=>`<option value="${plE(l.id)}"${l.id===wer?' selected':''}>${plE(l.name)}${l.id===PL.d.ich?' (ich)':''}</option>`).join('')}<option value="__frei"${frei?' selected':''}>Andere Person ohne Konto …</option></select>
    <input id="${id}T" maxlength="80" placeholder="Name" value="${plE(text||'')}" ${frei?'':'hidden'} style="margin-top:6px"></div>`; }
function plPersonLesen(M,id){ const s=M.querySelector('#'+id).value, t=M.querySelector('#'+id+'T').value.trim(); return s==='__frei'?{id:'',text:t}:{id:s,text:''}; }
function plPersonBinden(M,id){ const s=M.querySelector('#'+id), t=M.querySelector('#'+id+'T'); s.onchange=()=>{ t.hidden=s.value!=='__frei'; if(!t.hidden)t.focus(); }; }
function plBereichFeld(id,wert,nurProjekt){ return `<div class="field"><label for="${id}">Bereich</label><select id="${id}"${nurProjekt?' disabled':''}>${plBer().map(k=>`<option value="${k}"${k===wert?' selected':''}>${PL_B[k].ic} ${plE(PL_B[k].t)}</option>`).join('')}</select></div>`; }
function plKommHtml(art,id){ const K=plKomm(art,id);
  return `<div class="pl-komm"><h3>Kommentare<i>${K.length}</i></h3>${K.map(k=>`<div class="pl-km1"><b>${plE(k.von||'')}</b><small>${plE(plZeit(k.am))}</small>${k.meins?`<button type="button" class="svt-x" data-plkx="${plE(k.id)}" aria-label="Kommentar entfernen">✕</button>`:''}<p>${plE(k.text)}</p></div>`).join('')}
    <div class="pl-kin"><input id="plKt" maxlength="2000" placeholder="Kommentar schreiben"><button type="button" class="btn sm" id="plKs">${SVI('send')}</button></div></div>`; }
function plKommBinden(M,art,id,neu){
  const s=M.querySelector('#plKs'); if(!s)return; const i=M.querySelector('#plKt');
  const go=async()=>{ const t=i.value.trim(); if(!t)return; s.disabled=true;
    try{ const kid=await ogRpc('plan_kommentar',{p_art:art==='a'?'aufgabe':'projekt',p_id:id,p_text:t});
      PL.d.kommentare.push({id:kid,aufgabe:art==='a'?id:null,projekt:art==='p'?id:null,text:t,von:PL.d.ich_name,meins:true,am:new Date().toISOString()}); neu(); }catch(e){ s.disabled=false; kToast('⚠️ '+e.message); } };
  s.onclick=go; i.onkeydown=e=>{ if(e.key==='Enter'){ e.preventDefault(); go(); } };
  M.querySelectorAll('[data-plkx]').forEach(b=>b.onclick=async()=>{ try{ await ogRpc('plan_papierkorb',{p_art:'kommentar',p_id:b.dataset.plkx,p_zurueck:false}); PL.d.kommentare=PL.d.kommentare.filter(k=>k.id!==b.dataset.plkx); neu(); }catch(e){ kToast('⚠️ '+e.message); } });
}
function plAufgabeOeffnen(id,vor={}){
  if(!PL.d)return;
  const a=id?plAuf().find(x=>x.id===id):null; if(id&&!a){ kToast('Diese Aufgabe gibt es nicht mehr oder du siehst sie nicht.'); return; }
  const x=a||Object.assign({titel:'',status:'offen',prio:2,bereich:vor.bereich||plBer()[0],projekt:vor.projekt||null,wer:vor.wer||null,sitzung:!!vor.sitzung},vor);
  const projekte=plPro().filter(p=>!['fertig','verworfen'].includes(p.status)||p.id===x.projekt);
  const M=svModal(`<div class="og-form pl-form"><h2>${a?'Aufgabe':'Neue Aufgabe'}${a?`<small>${PL_B[a.bereich]?PL_B[a.bereich].ic+' '+plE(PL_B[a.bereich].t):''}</small>`:''}</h2>
    <div class="field w"><label for="plT">Was ist zu tun?</label><input id="plT" maxlength="200" value="${plE(x.titel)}" placeholder="z. B. Angebot für Getränke einholen"></div>
    <div class="pl-st">${Object.keys(PL_ST).map(s=>`<button type="button" data-plst="${s}" class="s-${s} ${x.status===s?'on':''}">${PL_ST[s]}</button>`).join('')}</div>
    <div class="field w" id="plWaF" ${x.status==='wartet'?'':'hidden'}><label for="plWa">Worauf wird gewartet?</label><input id="plWa" maxlength="120" value="${plE(x.wartet_auf||'')}" placeholder="z. B. Rückmeldung der Gemeinde"></div>
    <div class="pl-fg">${plPersonFeld('plWer',x.wer,x.wer_text,'Wer macht es?')}
      <div class="field"><label for="plF">Fällig am</label><input id="plF" type="date" value="${plE(x.faellig||'')}"><div class="pl-schnell">${[['heute',0],['morgen',1],['in 1 Woche',7]].map(([l,n])=>`<button type="button" data-plfd="${n}">${l}</button>`).join('')}<button type="button" data-plfd="x">ohne</button></div></div>
      <div class="field"><label for="plPj">Projekt</label><select id="plPj"><option value="">Kein Projekt</option>${projekte.map(p=>`<option value="${plE(p.id)}"${p.id===x.projekt?' selected':''}>${plE(PL_B[p.bereich].ic+' '+p.titel)}</option>`).join('')}</select></div>
      ${plBereichFeld('plB',x.bereich,!!x.projekt)}</div>
    <div class="pl-sw"><label><input type="checkbox" id="plPr"${x.prio===1?' checked':''}> ❗ Wichtig</label><label><input type="checkbox" id="plMs"${x.meilenstein?' checked':''}> ◆ Meilenstein</label><label><input type="checkbox" id="plSi"${x.sitzung?' checked':''}> 🗣️ Für die nächste Runde</label></div>
    <div class="field w"><label for="plN">Notiz</label><textarea id="plN" rows="4" maxlength="4000" placeholder="Details, Links, Ansprechpartner">${plE(x.notiz||'')}</textarea></div>
    <div class="btnrow sbact"><button class="btn" type="button" id="plSave">${a?'Speichern':'Anlegen'}</button>${a?`<button class="btn ghost" type="button" id="plDel">${SVI('trash')} Papierkorb</button>`:''}</div>
    ${a?`<p class="note small pl-meta">Angelegt von ${plE(a.von||'?')} ${plE(plZeit(a.am))}${a.erledigt_am?` · erledigt von ${plE(a.erledigt_von||'?')} ${plE(plZeit(a.erledigt_am))}`:''}</p>${plKommHtml('a',a.id)}`:''}</div>`);
  let st=x.status;
  M.querySelectorAll('[data-plst]').forEach(b=>b.onclick=()=>{ st=b.dataset.plst; M.querySelectorAll('[data-plst]').forEach(y=>y.classList.toggle('on',y===b)); M.querySelector('#plWaF').hidden=st!=='wartet'; });
  M.querySelectorAll('[data-plfd]').forEach(b=>b.onclick=()=>{ M.querySelector('#plF').value=b.dataset.plfd==='x'?'':plPlus(plHeute(),+b.dataset.plfd); });
  M.querySelector('#plPj').onchange=e=>{ const p=plProj(e.target.value), s=M.querySelector('#plB'); s.disabled=!!p; if(p)s.value=p.bereich; };
  plPersonBinden(M,'plWer');
  if(!a)setTimeout(()=>{ const t=M.querySelector('#plT'); t&&t.focus(); },60);
  M.querySelector('#plSave').onclick=async()=>{ const per=plPersonLesen(M,'plWer');
    const p={titel:M.querySelector('#plT').value.trim(),status:st,wartet_auf:M.querySelector('#plWa').value,wer:per.id,wer_text:per.text,faellig:M.querySelector('#plF').value,
      projekt:M.querySelector('#plPj').value,bereich:M.querySelector('#plB').value,prio:M.querySelector('#plPr').checked?1:2,meilenstein:M.querySelector('#plMs').checked,sitzung:M.querySelector('#plSi').checked,notiz:M.querySelector('#plN').value};
    if(!p.titel){ kToast('Bitte eintragen, was zu tun ist'); M.querySelector('#plT').focus(); return; }
    if(a)p.id=a.id; const b=M.querySelector('#plSave'); b.disabled=true;
    try{ const n=await ogRpc('plan_aufgabe_speichern',{p}); plErsetzen('aufgaben',n); closeOverlay(); kToast(a?'✓ Gespeichert':'✓ Angelegt'); plRender(); }catch(e){ b.disabled=false; kToast('⚠️ '+e.message); } };
  const d=M.querySelector('#plDel'); if(d)d.onclick=()=>plWeg('aufgabe',a.id,a.titel);
  if(a)plKommBinden(M,'a',a.id,()=>plAufgabeOeffnen(a.id));
}
// In den Papierkorb, mit Rückgängig
async function plWeg(art,id,titel){
  try{ await ogRpc('plan_papierkorb',{p_art:art,p_id:id,p_zurueck:false}); closeOverlay();
    if(art==='aufgabe')PL.d.aufgaben=PL.d.aufgaben.filter(a=>a.id!==id);
    if(art==='projekt'){ PL.d.projekte=PL.d.projekte.filter(p=>p.id!==id); }
    if(art==='beschluss')PL.d.beschluesse=PL.d.beschluesse.filter(b=>b.id!==id);
    plRender(); plRueckgaengig(art,id,titel); }catch(e){ kToast('⚠️ '+e.message); } }
function plRueckgaengig(art,id,titel){
  document.getElementById('plUndo')&&document.getElementById('plUndo').remove();
  const d=document.createElement('div'); d.id='plUndo'; d.className='pl-undo'; d.innerHTML=`<span>„${plE(String(titel).slice(0,40))}“ liegt im Papierkorb</span><button type="button">Rückgängig</button>`;
  document.body.appendChild(d); const t=setTimeout(()=>d.remove(),7000);
  d.querySelector('button').onclick=async()=>{ clearTimeout(t); d.remove(); try{ await ogRpc('plan_papierkorb',{p_art:art,p_id:id,p_zurueck:true}); await plLaden(); plRender(); kToast('✓ Zurückgeholt'); }catch(e){ kToast('⚠️ '+e.message); } }; }
async function plPapierkorb(){
  const M=svModal('<div class="og-form"><h2>🗑️ Papierkorb</h2><div class="empty">Lade …</div></div>');
  let L=[]; try{ L=await ogRpc('plan_papierkorb_liste'); }catch(e){ M.querySelector('.empty').textContent='⚠️ '+e.message; return; }
  const name={aufgabe:'Aufgabe',projekt:'Projekt',beschluss:'Beschluss'};
  M.innerHTML=`<button class="close" id="svClose" aria-label="Schließen">✕</button><div class="og-form"><h2>🗑️ Papierkorb <small>letzte 60 Tage</small></h2>
    <p class="note">Hier wird nichts endgültig gelöscht. Alles lässt sich zurückholen.</p>
    ${L.map(x=>`<div class="pl-korb"><div><b>${plE(x.titel)}</b><small>${name[x.art]} · ${PL_B[x.bereich]?plE(PL_B[x.bereich].t):''} · ${plE(plZeit(x.weg))}${x.von?' · '+plE(x.von):''}</small></div><button type="button" class="btn ghost sm" data-plzu="${plE(x.art)}|${plE(x.id)}">Zurückholen</button></div>`).join('')||'<div class="empty">Der Papierkorb ist leer.</div>'}</div>`;
  M.querySelector('#svClose').onclick=()=>closeOverlay();
  M.querySelectorAll('[data-plzu]').forEach(b=>b.onclick=async()=>{ const [art,id]=b.dataset.plzu.split('|'); b.disabled=true;
    try{ await ogRpc('plan_papierkorb',{p_art:art,p_id:id,p_zurueck:true}); await plLaden(); plRender(); kToast('✓ Zurückgeholt'); b.closest('.pl-korb').remove(); }catch(e){ b.disabled=false; kToast('⚠️ '+e.message); } });
}

/* ---------- Projekt öffnen und bearbeiten ---------- */
function plProjektOeffnen(id,vor={}){
  if(!PL.d)return;
  const p=id?plProj(id):null; if(id&&!p){ kToast('Dieses Projekt gibt es nicht mehr oder du siehst es nicht.'); return; }
  const x=p||Object.assign({titel:'',status:'geplant',ampel:'gruen',prio:2,bereich:vor.bereich||plBer()[0]},vor);
  const A=p?plSort(plAuf().filter(a=>a.projekt===p.id)):[], f=p?plFort(p.id):null, Z=(PL.d.ziele||[]);
  const M=svModal(`<div class="og-form pl-form"><h2>${p?plE(p.titel):'Neues Projekt'}${p?`<small>${plE(PL_B[p.bereich].ic+' '+PL_B[p.bereich].t)}</small>`:''}</h2>
    ${p?`<div class="pl-pfort"><div class="pl-bar"><i style="width:${f.p}%"></i></div><small>${f.e} von ${f.n} Aufgaben erledigt (${f.p} %)</small></div>`:''}
    <div class="field w"><label for="ppT">Projekt</label><input id="ppT" maxlength="120" value="${plE(x.titel)}" placeholder="z. B. Hallencup 2027"></div>
    <div class="field w"><label for="ppD">Worum geht es, was ist das Ziel?</label><textarea id="ppD" rows="3" maxlength="4000">${plE(x.beschreibung||'')}</textarea></div>
    <div class="pl-st pp">${Object.keys(PL_PST).map(s=>`<button type="button" data-ppst="${s}" class="${x.status===s?'on':''}">${PL_PST[s]}</button>`).join('')}</div>
    <div class="pl-ampw"><span>Ampel</span>${Object.keys(PL_AMP).map(a=>`<button type="button" data-ppa="${a}" class="a-${a} ${x.ampel===a?'on':''}">${PL_AMP[a]}</button>`).join('')}<input id="ppG" maxlength="300" placeholder="Warum? z. B. Halle noch nicht bestätigt" value="${plE(x.ampel_grund||'')}" ${x.ampel==='gruen'?'hidden':''}></div>
    <div class="pl-fg">${plPersonFeld('ppV',x.verantwortlich,x.verantwortlich_text,'Verantwortlich')}${plBereichFeld('ppB',x.bereich,false)}
      <div class="field"><label for="ppS">Start</label><input id="ppS" type="date" value="${plE(x.start||'')}"></div><div class="field"><label for="ppE">Ende oder Termin</label><input id="ppE" type="date" value="${plE(x.ende||'')}"></div>
      <div class="field w"><label for="ppZ">Zahlt ein auf Ziel 2030</label><select id="ppZ"><option value="">Kein bestimmtes Ziel</option>${Z.map(z=>`<option value="${plE(z.id)}"${z.id===x.ziel?' selected':''}>${plE(z.titel)}</option>`).join('')}</select></div></div>
    <div class="pl-sw"><label><input type="checkbox" id="ppPr"${x.prio===1?' checked':''}> ❗ Hohe Priorität</label></div>
    <div class="btnrow sbact"><button class="btn" type="button" id="ppSave">${p?'Speichern':'Projekt anlegen'}</button>${p?`<button class="btn ghost" type="button" id="ppDel">${SVI('trash')} Papierkorb</button>`:''}</div>
    ${p?`<div class="pl-pa"><h3>Aufgaben<i>${A.filter(a=>a.status!=='erledigt').length} offen</i></h3><div id="ppA">${A.map(a=>plKarte(a,{ohneProjekt:true})).join('')||'<small class="pl-nix">Noch keine Aufgaben.</small>'}</div>
      <form class="pl-quick" id="ppQ" autocomplete="off"><span>${SVI('plus')}</span><input id="ppQi" maxlength="240" placeholder="Aufgabe hinzufügen, z. B. „Halle anfragen @Jürgen bis 15.11.“"><button class="btn sm" type="submit">Hinzufügen</button></form></div>
      ${plKommHtml('p',p.id)}`:''}</div>`);
  let st=x.status, amp=x.ampel;
  M.querySelectorAll('[data-ppst]').forEach(b=>b.onclick=()=>{ st=b.dataset.ppst; M.querySelectorAll('[data-ppst]').forEach(y=>y.classList.toggle('on',y===b)); });
  M.querySelectorAll('[data-ppa]').forEach(b=>b.onclick=()=>{ amp=b.dataset.ppa; M.querySelectorAll('[data-ppa]').forEach(y=>y.classList.toggle('on',y===b)); const g=M.querySelector('#ppG'); g.hidden=amp==='gruen'; if(!g.hidden)g.focus(); });
  plPersonBinden(M,'ppV');
  if(!p)setTimeout(()=>{ const t=M.querySelector('#ppT'); t&&t.focus(); },60);
  M.querySelector('#ppSave').onclick=async()=>{ const per=plPersonLesen(M,'ppV');
    const d={titel:M.querySelector('#ppT').value.trim(),beschreibung:M.querySelector('#ppD').value,status:st,ampel:amp,ampel_grund:amp==='gruen'?'':M.querySelector('#ppG').value,verantwortlich:per.id,verantwortlich_text:per.text,
      bereich:M.querySelector('#ppB').value,start:M.querySelector('#ppS').value,ende:M.querySelector('#ppE').value,ziel:M.querySelector('#ppZ').value,prio:M.querySelector('#ppPr').checked?1:2};
    if(!d.titel){ kToast('Bitte einen Namen für das Projekt eingeben'); return; }
    if(p)d.id=p.id; const b=M.querySelector('#ppSave'); b.disabled=true;
    try{ const n=await ogRpc('plan_projekt_speichern',{p:d}); plErsetzen('projekte',n); if(p&&n.bereich!==p.bereich)plAuf().forEach(a=>{ if(a.projekt===n.id)a.bereich=n.bereich; });
      closeOverlay(); kToast(p?'✓ Gespeichert':'✓ Projekt angelegt'); if(!p)plProjektOeffnen(n.id); plRender(); }catch(e){ b.disabled=false; kToast('⚠️ '+e.message); } };
  const del=M.querySelector('#ppDel'); if(del)del.onclick=()=>plWeg('projekt',p.id,p.titel);
  if(p){ plKartenBinden(M.querySelector('#ppA'));
    M.querySelector('#ppQ').onsubmit=async e=>{ e.preventDefault(); const i=M.querySelector('#ppQi'), q=plParse(i.value); if(!q.titel)return; if(q.mehrdeutig){ kToast('Mehrere Personen heißen „'+q.mehrdeutig+'“. Bitte mit Nachnamen schreiben'); return; }
      try{ const a=await ogRpc('plan_aufgabe_speichern',{p:Object.assign({projekt:p.id},q)}); PL.d.aufgaben.push(a); plProjektOeffnen(p.id); plRender(); setTimeout(()=>{ const n=document.getElementById('ppQi'); n&&n.focus(); },60); }catch(x){ kToast('⚠️ '+x.message); } };
    plKommBinden(M,'p',p.id,()=>plProjektOeffnen(p.id)); }
}

/* ---------- Vorlagen ---------- */
function plVorlage(k){
  const V=PL_B[k].vorl||[]; let w=0;
  const M=svModal(`<div class="og-form pl-form"><h2>📋 Aus Vorlage starten</h2><p class="note">Legt ein Projekt mit den typischen Schritten an. Die Fälligkeiten richten sich nach dem Termin. Alles lässt sich danach anpassen.</p>
    <div class="pl-vl">${V.map((v,i)=>`<button type="button" data-plvl="${i}" class="${i===0?'on':''}"><b>${plE(v.t)}</b><small>${v.a.length} Schritte</small></button>`).join('')}</div>
    <div class="field w"><label for="pvT">Name des Projekts</label><input id="pvT" maxlength="120" value="${plE(V[0]?V[0].t:'')}"></div>
    <div class="pl-fg"><div class="field"><label for="pvD" id="pvDl">${plE(V[0]?V[0].d:'Termin')}</label><input id="pvD" type="date" value="${plPlus(plHeute(),60)}"></div>${plPersonFeld('pvV',PL.d.ich,'','Verantwortlich')}</div>
    <div id="pvL" class="pl-vprev"></div>
    <div class="btnrow sbact"><button class="btn" type="button" id="pvGo">Projekt anlegen</button></div></div>`);
  const zeig=()=>{ const v=V[w], d=M.querySelector('#pvD').value; M.querySelector('#pvL').innerHTML=v.a.map(([t,n,ms])=>`<div>${ms?'◆':'·'} ${plE(t)}<small>${d?plE(new Date(plPlus(d,n)+'T12:00:00').toLocaleDateString('de-DE',{day:'2-digit',month:'2-digit'})):''}</small></div>`).join(''); };
  M.querySelectorAll('[data-plvl]').forEach(b=>b.onclick=()=>{ w=+b.dataset.plvl; M.querySelectorAll('[data-plvl]').forEach(y=>y.classList.toggle('on',y===b)); M.querySelector('#pvT').value=V[w].t; M.querySelector('#pvDl').textContent=V[w].d; zeig(); });
  M.querySelector('#pvD').onchange=zeig; plPersonBinden(M,'pvV'); zeig();
  M.querySelector('#pvGo').onclick=async()=>{ const v=V[w], d=M.querySelector('#pvD').value, per=plPersonLesen(M,'pvV'), t=M.querySelector('#pvT').value.trim();
    if(!t||!d){ kToast('Bitte Name und Datum eintragen'); return; } const b=M.querySelector('#pvGo'); b.disabled=true; b.textContent='Lege an …';
    try{ const offs=v.a.map(a=>a[1]), st=plPlus(d,Math.min(0,...offs)), en=plPlus(d,Math.max(0,...offs));
      const p=await ogRpc('plan_projekt_speichern',{p:{bereich:k,titel:t,status:'geplant',start:st,ende:en,verantwortlich:per.id,verantwortlich_text:per.text}}); PL.d.projekte.push(p);
      for(const [i,[at,n,ms]] of v.a.entries()){ const a=await ogRpc('plan_aufgabe_speichern',{p:{projekt:p.id,titel:at,faellig:plPlus(d,n),meilenstein:!!ms,sort:i}}); PL.d.aufgaben.push(a); }
      closeOverlay(); kToast('✓ '+t+' angelegt'); plRender(); plProjektOeffnen(p.id); }catch(e){ b.disabled=false; b.textContent='Projekt anlegen'; kToast('⚠️ '+e.message); } };
}

/* ---------- Beschlüsse ---------- */
function plBeschluss(id){
  const b=id?(PL.d.beschluesse||[]).find(x=>x.id===id):null;
  const x=b||{titel:'',gremium:'Abteilungsleitung',datum:plHeute(),bereich:'leitung'};
  const M=svModal(`<div class="og-form pl-form"><h2>${b?'Beschluss':'Beschluss festhalten'}</h2><p class="note">Entscheidung, Ergebnis und Begründung werden festgehalten. So steht es in unseren Grundsätzen.</p>
    <div class="field w"><label for="pbT">Worum ging es?</label><input id="pbT" maxlength="200" value="${plE(x.titel)}" placeholder="z. B. Neue Trainingsanzüge für die Jugend"></div>
    <div class="pl-fg"><div class="field"><label for="pbD">Datum</label><input id="pbD" type="date" value="${plE(x.datum)}"></div><div class="field"><label for="pbG">Gremium</label><input id="pbG" maxlength="80" value="${plE(x.gremium||'')}"></div>
      <div class="field"><label for="pbA">Abstimmung</label><input id="pbA" maxlength="60" value="${plE(x.abstimmung||'')}" placeholder="z. B. 3 dafür, 0 dagegen"></div>${plBereichFeld('pbB',x.bereich,false)}</div>
    <div class="field w"><label for="pbE">Ergebnis</label><textarea id="pbE" rows="2" maxlength="2000">${plE(x.ergebnis||'')}</textarea></div>
    <div class="field w"><label for="pbW">Begründung</label><textarea id="pbW" rows="3" maxlength="2000">${plE(x.begruendung||'')}</textarea></div>
    <div class="btnrow sbact"><button class="btn" type="button" id="pbS">Speichern</button>${b?`<button class="btn ghost" type="button" id="pbX">${SVI('trash')} Papierkorb</button>`:''}</div>${b?`<p class="note small">Festgehalten von ${plE(b.von||'?')}</p>`:''}</div>`);
  M.querySelector('#pbS').onclick=async()=>{ const d={titel:M.querySelector('#pbT').value.trim(),datum:M.querySelector('#pbD').value,gremium:M.querySelector('#pbG').value,abstimmung:M.querySelector('#pbA').value,
      bereich:M.querySelector('#pbB').value,ergebnis:M.querySelector('#pbE').value,begruendung:M.querySelector('#pbW').value}; if(b)d.id=b.id;
    if(!d.titel){ kToast('Bitte eintragen, worum es ging'); return; }
    try{ await ogRpc('plan_beschluss_speichern',{p:d}); await plLaden(); closeOverlay(); kToast('✓ Festgehalten'); plRender(); }catch(e){ kToast('⚠️ '+e.message); } };
  const xx=M.querySelector('#pbX'); if(xx)xx.onclick=()=>plWeg('beschluss',b.id,b.titel);
}
function plBeschlussListe(){
  const B=(PL.d.beschluesse||[]).filter(b=>b.bereich==='leitung');
  const M=svModal(`<div class="og-form"><h2>Beschlüsse der Abteilungsleitung <small>${B.length}</small></h2>${B.map(b=>`<button type="button" class="pl-bs" data-plbs="${plE(b.id)}"><small>${plE(new Date(b.datum+'T12:00:00').toLocaleDateString('de-DE'))}${b.gremium?' · '+plE(b.gremium):''}${b.abstimmung?' · '+plE(b.abstimmung):''}</small><b>${plE(b.titel)}</b>${b.ergebnis?`<span>${plE(b.ergebnis)}</span>`:''}${b.begruendung?`<span class="pl-bw">${plE(b.begruendung)}</span>`:''}</button>`).join('')}
    <div class="btnrow sbact"><button type="button" class="btn ghost" id="plBsK">${SVI('copy')} Als Text kopieren</button></div></div>`);
  M.querySelectorAll('[data-plbs]').forEach(b=>b.onclick=()=>plBeschluss(b.dataset.plbs));
  M.querySelector('#plBsK').onclick=()=>plKopieren('Beschlüsse der Abteilungsleitung\n\n'+B.map(b=>new Date(b.datum+'T12:00:00').toLocaleDateString('de-DE')+': '+b.titel+(b.abstimmung?' ('+b.abstimmung+')':'')+(b.ergebnis?'\nErgebnis: '+b.ergebnis:'')+(b.begruendung?'\nBegründung: '+b.begruendung:'')).join('\n\n'));
}

/* ---------- Kleinkram ---------- */
async function plKopieren(t){ try{ await navigator.clipboard.writeText(t); kToast('✓ Kopiert, zum Beispiel für WhatsApp'); }catch(e){ const M=svModal(`<div class="og-form"><h2>Zum Kopieren</h2><textarea rows="12" style="width:100%">${plE(t)}</textarea></div>`); const ta=M.querySelector('textarea'); ta.focus(); ta.select(); } }
function plAlsText(k){ const A=plSort(plAuf().filter(a=>a.bereich===k&&plOffen(a)));
  const g={}; A.forEach(a=>{ const n=plWerName(a)||'Noch niemand'; (g[n]=g[n]||[]).push(a); });
  plKopieren(PL_B[k].t+': offene Aufgaben ('+new Date().toLocaleDateString('de-DE')+')\n'+Object.keys(g).map(n=>'\n'+n+'\n'+g[n].map(a=>'• '+a.titel+(a.faellig?' (bis '+new Date(a.faellig+'T12:00:00').toLocaleDateString('de-DE',{day:'2-digit',month:'2-digit'})+')':'')).join('\n')).join('\n')); }
function plFrage(titel,ph){ return new Promise(res=>{ const M=svModal(`<div class="og-form"><h2>${plE(titel)}</h2><input id="plFi" maxlength="120" placeholder="${plE(ph||'')}" style="width:100%"><div class="btnrow sbact"><button class="btn" type="button" id="plFok">Übernehmen</button><button class="btn ghost" type="button" id="plFno">Überspringen</button></div></div>`);
  const i=M.querySelector('#plFi'); setTimeout(()=>i.focus(),50); const fertig=v=>{ closeOverlay(); res(v); };
  M.querySelector('#plFok').onclick=()=>fertig(i.value.trim()); M.querySelector('#plFno').onclick=()=>fertig(''); i.onkeydown=e=>{ if(e.key==='Enter')fertig(i.value.trim()); }; }); }

/* ---------- Einbindung: Aufgabensteuerung → Planung ---------- */
SV4_HUB.steuerung.tabs.unshift(['planung','Planung']);
SV4_OF.planung='steuerung';
SV_TBL.planung=['target','Planung'];
SV_PAGES.planung=['Aufgabensteuerung','Planung: Projekte, Aufgaben und Beschlüsse aller Bereiche'];
{ const _ta=svTabAllowed; svTabAllowed=function(t){ if(t==='planung')return typeof SVR!=='undefined'&&SVR.loaded&&plDarf(); return _ta.apply(this,arguments); }; }
{ const _gt=goTab; goTab=function(tab){
  if(tab==='planung')plPanel();
  const r=_gt.apply(this,arguments);
  try{ if(svCurTab()==='planung'){ sv4HubBar('planung'); plRender(); plStart();
      const side=document.querySelector('.snav button[data-tab="kalender"]'); if(side)document.querySelectorAll('.snav button[data-tab]').forEach(b=>b.classList.toggle('active',b===side)); } else plStop(); }catch(e){ console.warn('Planung',e); }
  return r; }; }
// Still nachladen, solange die Planung offen ist und niemand tippt
function plStart(){ plStop(); PL.t=setInterval(async()=>{ if(document.hidden||svCurTab()!=='planung')return; const o=document.getElementById('overlay');
  if(o&&o.classList.contains('open'))return; const a=document.activeElement; if(a&&/^(INPUT|TEXTAREA|SELECT)$/.test(a.tagName))return;
  const vorher=JSON.stringify(PL.d); await plLaden(true); if(JSON.stringify(PL.d)!==vorher&&svCurTab()==='planung')plRender(); },30000); }
function plStop(){ if(PL.t){ clearInterval(PL.t); PL.t=null; } }
// Push-Nachricht „Neue Aufgabe …“ / „Heute fällig …“ öffnet die Aufgabe
{ const _zi=svzInhalt; svzInhalt=async function(m){ const x=await _zi.apply(this,arguments);
    const d=(m&&m.data)||{};
    if(m&&m.art==='orga'&&(d.plan||d.plan_projekt||d.plan_meine))x.knopf=`<button class="btn sv32-go" type="button" data-svzplan="${plE(d.plan?'a:'+d.plan:d.plan_projekt?'p:'+d.plan_projekt:'m:')}">${SVI('check')} <span>${d.plan?'Aufgabe öffnen':d.plan_projekt?'Projekt öffnen':'Meine Aufgaben'}</span></button>`;
    return x; }; }
{ const _mz=svMeldungZeigen; svMeldungZeigen=async function(){ const r=await _mz.apply(this,arguments);
    try{ document.querySelectorAll('#modal [data-svzplan]').forEach(b=>b.onclick=async()=>{ const [art,id]=b.dataset.svzplan.split(':'); closeOverlay(); PL.b='meine'; goTab('planung');
      try{ await plLaden(); plRender(); if(art==='a')plAufgabeOeffnen(id); else if(art==='p')plProjektOeffnen(id); }catch(e){ kToast('⚠️ '+e.message); } }); }catch(e){} return r; }; }

(function(){ try{ const s=document.createElement('style'); s.id='svm44css'; s.textContent="/* Beta 0.48 · Planung */\n:root{--pl-or:#f28c28;--pl-gr:#22c55e;--pl-ge:#f59e0b;--pl-ro:#f05252;}\n.pl{display:flex;flex-direction:column;gap:14px;}\n#plBody{display:flex;flex-direction:column;gap:14px;min-width:0;}\n.pl-nav{display:flex;gap:6px;overflow-x:auto;scrollbar-width:none;padding:2px 2px 6px;margin:0 -2px;position:sticky;top:0;z-index:5;}\n.pl-nav::-webkit-scrollbar{display:none;}\n.pl-nav button{flex:0 0 auto;display:inline-flex;align-items:center;gap:6px;font:inherit;font-size:13px;font-weight:700;padding:8px 13px;border-radius:999px;border:1px solid var(--line);background:var(--surface);color:var(--ink2);cursor:pointer;white-space:nowrap;}\n.pl-nav button i{font-style:normal;font-size:11.5px;font-weight:800;opacity:.75;background:rgba(148,163,196,.12);border-radius:99px;padding:1px 7px;}\n.pl-nav button.on{border-color:var(--brand2);color:var(--ink);background:var(--brandSoft);box-shadow:0 0 0 3px rgba(47,107,255,.12);}\n.pl-rot{font-size:11px;font-weight:800;color:#fff;background:var(--pl-ro);border-radius:99px;padding:1px 6px;}\n.pl-kopf{display:flex;gap:14px;justify-content:space-between;align-items:flex-start;flex-wrap:wrap;}\n.pl-kopf h2{margin:0;font-family:var(--disp);font-size:27px;font-weight:800;letter-spacing:.005em;line-height:1.1;}\n.pl-kopf p{margin:4px 0 0;color:var(--ink2);max-width:62ch;line-height:1.5;}\n.pl-org{display:flex;flex-wrap:wrap;gap:6px 16px;margin-top:8px;font-size:12.5px;color:var(--ink3);}\n.pl-org b{color:var(--ink2);font-weight:650;}\n.pl-akt{display:flex;flex-wrap:wrap;gap:6px;}\n.pl-h3{display:flex;align-items:center;gap:8px;font-size:13px;font-weight:800;text-transform:uppercase;letter-spacing:.06em;color:var(--ink3);margin:6px 0 2px;}\n.pl-h3 i,.pl-tk h3 i,.pl-gr h3 i,.pl-det summary i,.pl-komm h3 i,.pl-pa h3 i{font-style:normal;font-size:11px;font-weight:800;color:var(--ink2);background:rgba(148,163,196,.12);border-radius:99px;padding:1px 7px;letter-spacing:0;text-transform:none;}\n.pl-lnk{all:unset;cursor:pointer;color:var(--ink2);}\n.pl-lnk:hover{color:var(--brand2);text-decoration:underline;}\n\n/* Schnelleingabe */\n.pl-quick{display:flex;align-items:center;gap:8px;background:var(--surface);border:1.5px dashed var(--line);border-radius:14px;padding:6px 6px 6px 12px;}\n.pl-quick:focus-within{border-style:solid;border-color:rgba(91,155,255,.6);box-shadow:0 0 0 4px rgba(47,107,255,.12);}\n.pl-quick>span svg{width:17px;height:17px;color:var(--ink3);display:block;}\n.pl-quick input{flex:1;min-width:0;border:0;background:transparent;color:var(--ink);font:inherit;font-size:14.5px;padding:8px 0;outline:none;}\n.pl-quick input::placeholder{color:var(--ink3);}\n\n/* Karte */\n.pl-k{position:relative;display:flex;gap:10px;align-items:flex-start;background:var(--surface2);border:1px solid var(--line);border-radius:13px;padding:10px 11px;cursor:pointer;transition:transform .12s var(--ease),border-color .12s,box-shadow .12s;}\n.pl-k:hover{border-color:rgba(91,155,255,.4);box-shadow:var(--sh-1);}\n.pl-k.p1{box-shadow:inset 3px 0 0 var(--pl-or);}\n.pl-k.erl{opacity:.6;}\n.pl-k.erl .pl-kt{text-decoration:line-through;text-decoration-color:var(--ink3);}\n.pl-k.zieh{opacity:.4;transform:rotate(1.5deg);}\n.pl-chk{flex:0 0 auto;width:22px;height:22px;margin-top:1px;border-radius:7px;border:1.8px solid var(--ink3);background:transparent;color:#fff;font-size:13px;font-weight:900;line-height:1;cursor:pointer;display:grid;place-items:center;padding:0;}\n.pl-chk:hover{border-color:var(--pl-gr);background:rgba(34,197,94,.12);}\n.pl-k.erl .pl-chk{background:var(--pl-gr);border-color:var(--pl-gr);}\n.pl-kb{flex:1;min-width:0;}\n.pl-kt{font-weight:650;line-height:1.35;word-break:break-word;}\n.pl-ms{color:var(--brand2);} .pl-pr{color:var(--pl-or);font-weight:900;}\n.pl-km{display:flex;flex-wrap:wrap;gap:5px 8px;margin-top:5px;font-size:11.5px;color:var(--ink3);align-items:center;}\n.pl-km:empty{display:none;}\n.pl-tag{border-radius:6px;padding:1px 6px;background:rgba(148,163,196,.1);color:var(--ink2);font-weight:600;max-width:200px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;}\n.pl-tag.pj{background:rgba(91,155,255,.12);color:#9cc3ff;}\n.pl-tag.rd{background:rgba(139,124,246,.16);color:#c4b5fd;}\n.pl-tag.hp{background:rgba(242,140,40,.14);color:#fdba74;}\n.pl-f{font-weight:650;} .pl-f.rot{color:var(--pl-ro);} .pl-f.heute{color:var(--pl-or);} .pl-f.bald{color:var(--pl-ge);}\n.pl-w{color:var(--pl-ge);font-weight:600;}\n.pl-av{flex:0 0 auto;width:28px;height:28px;border-radius:50%;display:grid;place-items:center;font-size:11px;font-weight:800;color:#fff;background:linear-gradient(135deg,#3b78ff,#7c5cff);letter-spacing:.02em;}\n.pl-av.ich{background:linear-gradient(135deg,var(--pl-or),#f2542d);}\n\n/* Meine */\n.pl-meine{display:flex;flex-direction:column;gap:16px;}\n.pl-gr{display:flex;flex-direction:column;gap:7px;}\n.pl-gr h3{display:flex;align-items:center;gap:8px;margin:0;font-size:14px;font-weight:800;}\n.pl-gr h3.rot{color:var(--pl-ro);}\n.pl-det{border:1px solid var(--line2);border-radius:14px;padding:10px 12px;background:rgba(148,163,196,.03);}\n.pl-det>summary{cursor:pointer;font-weight:700;color:var(--ink2);display:flex;align-items:center;gap:8px;list-style:none;}\n.pl-det>summary::-webkit-details-marker{display:none;}\n.pl-det>summary::before{content:'▸';color:var(--ink3);transition:transform .15s;}\n.pl-det[open]>summary::before{transform:rotate(90deg);}\n.pl-det[open]>summary{margin-bottom:8px;}\n.pl-det .pl-k{margin-top:6px;}\n.pl-leer{text-align:center;padding:30px 20px!important;}\n.pl-leer-ic{font-size:34px;margin-bottom:6px;}\n.pl-leer p{margin:4px 0 0;}\n\n/* Überblick */\n.pl-bgrid{display:grid;grid-template-columns:repeat(auto-fill,minmax(230px,1fr));gap:10px;}\n.pl-bk{all:unset;box-sizing:border-box;cursor:pointer;display:flex;flex-direction:column;gap:8px;padding:14px;border-radius:16px;background:var(--surface);border:1px solid var(--line);transition:border-color .15s,transform .15s var(--ease);}\n.pl-bk:hover{border-color:rgba(91,155,255,.45);transform:translateY(-1px);}\n.pl-bk-t{display:flex;gap:8px;align-items:center;font-size:15px;} .pl-bk-t span{font-size:19px;}\n.pl-bk-z{display:flex;flex-wrap:wrap;gap:4px 12px;font-size:12.5px;color:var(--ink3);} .pl-bk-z b{color:var(--ink);font-size:15px;} .pl-bk-z .rot,.pl-bk-z .rot b{color:var(--pl-ro);}\n.pl-bk-n{font-size:12px;color:var(--ink2);border-top:1px solid var(--line2);padding-top:7px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;}\n.pl-amp{display:flex;gap:4px;flex-wrap:wrap;} .pl-amp i{width:10px;height:10px;border-radius:50%;}\n.a-gruen.pl-dot,.pl-amp i.a-gruen,.pl-ampk i.a-gruen{background:var(--pl-gr);} .a-gelb.pl-dot,.pl-amp i.a-gelb,.pl-ampk i.a-gelb{background:var(--pl-ge);} .a-rot.pl-dot,.pl-amp i.a-rot,.pl-ampk i.a-rot{background:var(--pl-ro);}\n.pl-feed{display:flex;flex-direction:column;gap:8px;padding:16px!important;font-size:13.5px;}\n.pl-feed>div{line-height:1.45;color:var(--ink2);} .pl-feed b{color:var(--ink);} .pl-feed small{color:var(--ink3);margin-left:4px;white-space:nowrap;}\n\n/* Leiste mit Ansichten und Filter */\n.pl-leiste{display:flex;gap:8px;flex-wrap:wrap;align-items:center;justify-content:space-between;}\n.pl-views{margin:0!important;}\n.pl-filter{display:flex;gap:6px;flex:1 1 260px;justify-content:flex-end;min-width:0;}\n.pl-filter select,.pl-filter input{min-height:36px;border-radius:10px;border:1px solid var(--line);background:var(--surface);color:var(--ink);font:inherit;font-size:13px;padding:0 10px;min-width:0;}\n.pl-filter input{flex:0 1 180px;}\n\n/* Board */\n.pl-board{display:grid;grid-auto-flow:column;grid-auto-columns:minmax(205px,1fr);gap:10px;overflow-x:auto;padding-bottom:6px;scroll-snap-type:x proximity;align-items:start;}\n.pl-sp{display:flex;flex-direction:column;gap:7px;background:rgba(148,163,196,.04);border:1px solid var(--line2);border-radius:16px;padding:10px;scroll-snap-align:start;min-height:120px;transition:background .12s,border-color .12s;}\n.pl-sp.drop{background:var(--brandSoft);border-color:var(--brand2);}\n.pl-sph{display:flex;justify-content:space-between;align-items:center;padding:2px 4px 4px;font-size:12.5px;text-transform:uppercase;letter-spacing:.06em;}\n.pl-sph i{font-style:normal;font-weight:800;color:var(--ink3);}\n.s-idee .pl-sph b{color:#fdba74;} .s-offen .pl-sph b{color:var(--ink2);} .s-arbeit .pl-sph b{color:#9cc3ff;} .s-wartet .pl-sph b{color:#fcd34d;} .s-erledigt .pl-sph b{color:#86efac;}\n.pl-spl{display:flex;flex-direction:column;gap:7px;}\n.pl-add,.pl-mehr{all:unset;box-sizing:border-box;cursor:pointer;display:flex;align-items:center;gap:6px;justify-content:center;font-size:12.5px;font-weight:700;color:var(--ink3);padding:8px;border-radius:10px;border:1px dashed var(--line);}\n.pl-add svg{width:14px;height:14px;} .pl-add:hover,.pl-mehr:hover{color:var(--brand2);border-color:var(--brand2);}\n.pl-mehr{border-style:solid;margin-top:4px;}\n.pl-lg{display:flex;flex-direction:column;gap:7px;margin-bottom:10px;}\n\n/* Projekte */\n.pl-pgrid{display:grid;grid-template-columns:repeat(auto-fill,minmax(280px,1fr));gap:10px;}\n.pl-pk{all:unset;box-sizing:border-box;cursor:pointer;display:flex;flex-direction:column;gap:8px;padding:14px;border-radius:16px;background:var(--surface);border:1px solid var(--line);border-top:3px solid var(--pl-gr);transition:transform .15s var(--ease),border-color .15s;}\n.pl-pk.a-gelb{border-top-color:var(--pl-ge);} .pl-pk.a-rot{border-top-color:var(--pl-ro);}\n.pl-pk.st-idee{border-top:1px dashed var(--line);border-style:dashed;}\n.pl-pk-i{font-size:14px;line-height:1;} .pl-pk.st-fertig,.pl-pk.st-verworfen{opacity:.6;}\n.pl-pk:hover{transform:translateY(-1px);border-color:rgba(91,155,255,.45);}\n.pl-pk-k{display:flex;gap:8px;align-items:center;} .pl-pk-k b{flex:1;font-size:15px;line-height:1.3;}\n.pl-dot{display:inline-block;width:10px;height:10px;border-radius:50%;flex:0 0 auto;}\n.pl-pst{font-size:11px;font-weight:800;text-transform:uppercase;letter-spacing:.05em;color:var(--ink3);background:rgba(148,163,196,.1);border-radius:6px;padding:2px 6px;}\n.pl-pk-m{display:flex;flex-wrap:wrap;gap:4px 10px;font-size:12px;color:var(--ink3);} .pl-pk-m .rot{color:var(--pl-ro);font-weight:700;} .pl-pk-m .gelb{color:var(--pl-ge);}\n.pl-bar{height:6px;border-radius:99px;background:rgba(148,163,196,.14);overflow:hidden;}\n.pl-bar i{display:block;height:100%;border-radius:99px;background:linear-gradient(90deg,var(--brand),var(--pl-or));transition:width .4s var(--ease);}\n.pl-grund{font-size:12px;color:var(--ink2);background:rgba(245,158,11,.08);border-radius:8px;padding:6px 8px;}\n\n/* Zeitplan */\n.pl-zeit{padding:14px!important;overflow-x:auto;}\n.pl-zt{min-width:640px;display:flex;flex-direction:column;gap:6px;}\n.pl-zm{display:flex;margin-left:190px;font-size:11px;font-weight:700;color:var(--ink3);text-transform:uppercase;letter-spacing:.05em;}\n.pl-zm span{border-left:1px solid var(--line2);padding-left:5px;}\n.pl-zr{display:flex;align-items:center;gap:10px;min-height:30px;}\n.pl-zn{all:unset;cursor:pointer;width:180px;flex:0 0 180px;font-size:12.5px;font-weight:650;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;color:var(--ink2);}\n.pl-zn:hover{color:var(--brand2);}\n.pl-zb{position:relative;flex:1;height:22px;background:repeating-linear-gradient(90deg,transparent 0 calc(100%/7 - 1px),var(--line2) calc(100%/7 - 1px) calc(100%/7));border-radius:6px;}\n.pl-zbar{position:absolute;top:4px;height:14px;border-radius:7px;background:var(--pl-gr);opacity:.85;}\n.pl-zbar.a-gelb{background:var(--pl-ge);} .pl-zbar.a-rot{background:var(--pl-ro);} .pl-zbar.st-idee{opacity:.35;} .pl-zbar.st-fertig{opacity:.35;}\n.pl-zms{position:absolute;top:1px;transform:translateX(-50%);font-size:14px;color:var(--ink);text-shadow:0 0 6px var(--bg);}\n.pl-zb u{position:absolute;top:-4px;bottom:-4px;width:2px;background:var(--pl-or);border-radius:2px;}\n\n/* Werkzeuge */\n.pl-tool{display:grid;grid-template-columns:repeat(auto-fit,minmax(280px,1fr));gap:10px;}\n.pl-tk{background:var(--surface);border:1px solid var(--line);border-radius:16px;padding:14px;display:flex;flex-direction:column;gap:7px;min-width:0;}\n.pl-tk h3{display:flex;align-items:center;gap:8px;margin:0 0 4px;font-size:14px;font-weight:800;}\n.pl-tk-a{display:flex;flex-wrap:wrap;gap:6px;margin-top:4px;}\n.pl-mini{all:unset;box-sizing:border-box;cursor:pointer;display:block;font-size:13px;line-height:1.35;padding:7px 9px;border-radius:9px;background:rgba(148,163,196,.06);border:1px solid var(--line2);color:var(--ink);overflow:hidden;text-overflow:ellipsis;}\n.pl-mini small{color:var(--ink3);margin-left:4px;} .pl-mini:hover{border-color:rgba(91,155,255,.45);}\n.pl-mini.rot{border-color:rgba(240,82,82,.35);} .pl-mini.s3{box-shadow:inset 3px 0 0 var(--pl-ro);} .pl-mini.s2{box-shadow:inset 3px 0 0 var(--pl-ge);} .pl-mini.s1{box-shadow:inset 3px 0 0 var(--ink3);}\n.pl-nix{color:var(--ink3);font-size:12.5px;line-height:1.45;}\n.pl-wer{display:grid;grid-template-columns:repeat(auto-fit,minmax(170px,1fr));gap:8px;}\n.pl-wer-k{display:flex;flex-direction:column;gap:5px;}\n.pl-wer-n{display:flex;gap:8px;align-items:center;margin-bottom:2px;} .pl-wer-n div{flex:1;min-width:0;display:flex;flex-direction:column;} .pl-wer-n small{color:var(--ink3);font-size:11px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;}\n.pl-wer-n>i{font-style:normal;font-weight:800;font-size:13px;color:var(--ink2);}\n.pl-tool .pl-tk:has(.pl-wer){grid-column:1/-1;}\n.pl-bs{all:unset;box-sizing:border-box;cursor:pointer;display:flex;flex-direction:column;gap:2px;padding:8px 10px;border-radius:10px;border-left:3px solid var(--brand2);background:rgba(91,155,255,.06);margin-bottom:6px;width:100%;}\n.pl-bs small{color:var(--ink3);font-size:11.5px;} .pl-bs span{color:var(--ink2);font-size:12.5px;} .pl-bs .pl-bw{font-style:italic;}\n.pl-kpis{flex-direction:row;flex-wrap:wrap;gap:14px;align-items:center;}\n.pl-kpis>div{display:flex;flex-direction:column;} .pl-kpis b{font-family:var(--disp);font-size:28px;line-height:1;} .pl-kpis span{font-size:11.5px;color:var(--ink3);text-transform:uppercase;letter-spacing:.05em;}\n.pl-ampk{flex-direction:row!important;align-items:center;gap:5px;font-weight:800;margin-left:auto;} .pl-ampk i{width:12px;height:12px;border-radius:50%;margin-left:6px;}\n.pl-ziele{grid-column:1/-1;}\n.pl-ziel{padding:10px 12px;border-radius:12px;background:rgba(148,163,196,.05);border:1px solid var(--line2);display:flex;flex-direction:column;gap:6px;}\n.pl-ziel.ok{border-color:rgba(34,197,94,.35);}\n.pl-ziel-t{display:flex;gap:8px;align-items:flex-start;} .pl-ziel-t b{flex:1;font-weight:650;line-height:1.35;} .pl-ziel-t em{font-style:normal;font-size:11px;font-weight:800;color:#86efac;}\n.pl-ziel small{color:var(--ink3);} .pl-ziel small b{color:var(--ink);}\n.pl-ziel-p{display:flex;flex-wrap:wrap;gap:5px;}\n.pl-chip{all:unset;cursor:pointer;display:inline-flex;align-items:center;gap:5px;font-size:12px;font-weight:650;padding:3px 9px;border-radius:99px;border:1px solid var(--line);background:var(--surface2);}\n.pl-chip .pl-dot{width:8px;height:8px;}\n.pl-idee{padding:9px 11px;border-radius:12px;background:rgba(242,140,40,.06);border:1px solid rgba(242,140,40,.2);display:flex;flex-direction:column;gap:5px;}\n.pl-idee p{margin:0;line-height:1.45;white-space:pre-wrap;max-height:7.3em;overflow:hidden;} .pl-idee small{color:var(--ink3);} .pl-idee .btn{align-self:flex-start;}\n.pl-dauer{margin:0;padding-left:18px;color:var(--ink2);line-height:1.55;font-size:13px;}\n.pl-links{display:flex;flex-wrap:wrap;gap:6px;}\n\n/* Formulare */\n.pl-form h2 small{display:block;font-size:12.5px;font-weight:600;color:var(--ink3);margin-top:3px;}\n.pl-form .field{display:flex;flex-direction:column;gap:5px;margin-bottom:10px;}\n.pl-form .field label{font-size:12.5px;font-weight:700;color:var(--ink2);}\n.pl-form .field input,.pl-form .field select,.pl-form .field textarea{width:100%;box-sizing:border-box;}\n.pl-fg{display:grid;grid-template-columns:1fr 1fr;gap:0 12px;} .pl-fg .field.w{grid-column:1/-1;}\n@media (max-width:560px){ .pl-fg{grid-template-columns:1fr;} }\n.pl-st{display:flex;flex-wrap:wrap;gap:6px;margin:2px 0 12px;}\n.pl-st button{font:inherit;font-size:12.5px;font-weight:700;padding:7px 11px;border-radius:999px;border:1px solid var(--line);background:rgba(148,163,196,.06);color:var(--ink2);cursor:pointer;}\n.pl-st button.on{color:#fff;border-color:transparent;background:var(--brand);}\n.pl-st button.s-erledigt.on{background:#16a34a;} .pl-st button.s-wartet.on{background:#d97706;} .pl-st button.s-idee.on{background:#ea7a1a;}\n.pl-schnell{display:flex;gap:4px;flex-wrap:wrap;} .pl-schnell button{font:inherit;font-size:11.5px;font-weight:700;padding:3px 8px;border-radius:7px;border:1px solid var(--line);background:transparent;color:var(--ink3);cursor:pointer;}\n.pl-sw{display:flex;flex-wrap:wrap;gap:8px 16px;margin:2px 0 12px;font-size:13.5px;} .pl-sw label{display:flex;gap:6px;align-items:center;cursor:pointer;}\n.pl-ampw{display:flex;flex-wrap:wrap;gap:6px;align-items:center;margin-bottom:12px;} .pl-ampw>span{font-size:12.5px;font-weight:700;color:var(--ink2);margin-right:4px;}\n.pl-ampw button{font:inherit;font-size:12.5px;font-weight:700;padding:6px 12px;border-radius:999px;border:1px solid var(--line);background:transparent;color:var(--ink2);cursor:pointer;}\n.pl-ampw button.a-gruen.on{background:var(--pl-gr);color:#062b12;border-color:transparent;} .pl-ampw button.a-gelb.on{background:var(--pl-ge);color:#3a2300;border-color:transparent;} .pl-ampw button.a-rot.on{background:var(--pl-ro);color:#fff;border-color:transparent;}\n.pl-ampw input{flex:1 1 220px;min-height:36px;}\n.pl-pfort{display:flex;flex-direction:column;gap:5px;margin-bottom:12px;} .pl-pfort small{color:var(--ink3);}\n.pl-pa{margin-top:16px;display:flex;flex-direction:column;gap:7px;} .pl-pa h3,.pl-komm h3{display:flex;align-items:center;gap:8px;font-size:14px;margin:0;}\n.pl-pa #ppA{display:flex;flex-direction:column;gap:6px;}\n.pl-komm{margin-top:16px;display:flex;flex-direction:column;gap:8px;border-top:1px solid var(--line2);padding-top:12px;}\n.pl-km1{position:relative;background:rgba(148,163,196,.06);border-radius:12px;padding:8px 34px 8px 10px;} .pl-km1 small{color:var(--ink3);margin-left:6px;font-size:11.5px;} .pl-km1 p{margin:3px 0 0;white-space:pre-wrap;line-height:1.45;}\n.pl-km1 .svt-x{position:absolute;top:6px;right:6px;}\n.pl-kin{display:flex;gap:6px;} .pl-kin input{flex:1;min-width:0;min-height:40px;border-radius:10px;border:1px solid var(--line);background:var(--surface);color:var(--ink);padding:0 10px;font:inherit;}\n.pl-meta{margin-top:8px!important;}\n.pl-vl{display:grid;grid-template-columns:repeat(auto-fill,minmax(160px,1fr));gap:6px;margin:6px 0 12px;}\n.pl-vl button{font:inherit;text-align:left;padding:10px;border-radius:12px;border:1px solid var(--line);background:rgba(148,163,196,.05);color:var(--ink);cursor:pointer;display:flex;flex-direction:column;gap:2px;}\n.pl-vl button small{color:var(--ink3);} .pl-vl button.on{border-color:var(--brand2);background:var(--brandSoft);}\n.pl-vprev{display:flex;flex-direction:column;gap:3px;font-size:13px;margin-bottom:12px;padding:10px 12px;border-radius:12px;background:rgba(148,163,196,.05);}\n.pl-vprev div{display:flex;justify-content:space-between;gap:10px;} .pl-vprev small{color:var(--ink3);}\n.pl-korb{display:flex;gap:10px;align-items:center;justify-content:space-between;padding:9px 0;border-bottom:1px solid var(--line2);} .pl-korb div{display:flex;flex-direction:column;min-width:0;} .pl-korb small{color:var(--ink3);}\n.pl-undo{position:fixed;left:50%;bottom:calc(84px + env(safe-area-inset-bottom));transform:translateX(-50%);z-index:300;display:flex;gap:12px;align-items:center;background:var(--surfaceHi);color:var(--ink);border:1px solid var(--line);border-radius:14px;padding:10px 12px 10px 16px;box-shadow:var(--sh-3);font-size:13.5px;max-width:calc(100vw - 32px);}\n.pl-undo button{font:inherit;font-weight:800;color:var(--pl-or);background:none;border:0;cursor:pointer;white-space:nowrap;}\n@media (max-width:700px){\n  .pl-kopf h2{font-size:23px;}\n  .pl-board{grid-auto-columns:82%;}\n  .pl-filter{justify-content:stretch;} .pl-filter select,.pl-filter input{flex:1 1 50%;}\n  .pl-zm{margin-left:130px;} .pl-zn{width:120px;flex-basis:120px;}\n}\n"; document.head.appendChild(s); }catch(e){} })();
/* =====================================================================
   Sportzentrale · Umbau V1, Paket C: Stärke V1 im Spielerprofil (hinter dem Schalter ui_v1)
   - Oben im Profil: Stärke, Sicherheit, Form, 24 Monate, Einordnung in Worten („wie ein Stammspieler der Kreisliga A“)
   - „Warum diese Stärke?“: Gründe, Hinweise, Grundlage je Saison
   - Eye-Test V1 (1 bis 5, Gesamturteil, Beobachtungstiefe, Perspektive) und „Bewertung prüfen“
   - Wissen → Modell: Bewertungsmodell V1 für Admin und Sportliche Leitung (Version, Verteilung, Prüfhinweise, Schalter)
   Gerechnet wird nur auf dem Server (Edge Function „rating“). Die bisherige Stärke bleibt bis zur Abnahme unverändert.
   ===================================================================== */
const V1={an:false,geladen:false,werte:null,profil:{},offen:null,modell:null};
const V1_ANKER=[[53,'Kreisliga D'],[57,'Kreisliga C'],[61,'Kreisliga B'],[65,'Kreisliga A'],[73,'Kreisoberliga'],[81,'Gruppenliga'],[87,'Verbandsliga'],[92,'Hessenliga']];
const V1_SICH={hoch:['hoch','Viele Einsätze und ein stimmiges Bild: die Zahl ist belastbar.'],mittel:['mittel','Gute Grundlage, aber noch nicht ganz stabil.'],
  niedrig:['niedrig','Noch wenig Daten: eine vorsichtige Schätzung, die sich mit jedem Spiel deutlich bewegen kann.']};
const V1_FORM={hoch:['↑','Form steigend'],gleich:['→','Form normal'],runter:['↓','Form fallend'],unbekannt:['·','Form unbekannt']};
const V1_EYE=[['tem','Tempo'],['sch','Schuss'],['pas','Pass'],['dri','Dribbling'],['def','Defensive'],['phy','Physis']];
const V1_GESAMT=[[1,'unter Kreisliga D'],[2,'Kreisliga D bis B'],[3,'Kreisliga B bis A'],[4,'Kreisliga A bis KOL'],[5,'Gruppenliga und höher']];
const V1_TIEFE=[['einmal','Einmal gesehen'],['mehrfach','Mehrfach gesehen'],['gut','Kenne ihn gut'],['intern','Regelmäßig intern (Training)']];
const V1_PERSP=[['','Keine Angabe'],['gering','Eher ausgereizt'],['normal','Normal'],['hoch','Kann noch deutlich wachsen']];
const V1_ART=[['zu_hoch','Wert ist zu hoch'],['zu_niedrig','Wert ist zu niedrig'],['passt','Wert passt'],['position','Position stimmt nicht'],['daten','Daten fehlen oder sind falsch'],['sonstiges','Etwas anderes']];
const V1_VGL={groesser:'stärker als',aehnlich:'ähnlich wie',kleiner:'schwächer als'};
function v1PrTitel(x){ const a=(V1_ART.find(y=>y[0]===(x.urteil||x.art))||[,x.art])[1]; let v=''; if(x.vergleich&&x.vergleich_player){ const p=typeof sv4P==='function'?sv4P(x.vergleich_player):null; v=` · ${V1_VGL[x.vergleich]||''} ${p?p.name:'?'}`; } return a+v; }
const V1_STATUS={offen:'offen',geprueft:'geprüft',uebernommen:'übernommen',abgelehnt:'abgelehnt'};
const V1_LIGA={KLD:'Kreisliga D',KLC:'Kreisliga C',KLB:'Kreisliga B',KLA:'Kreisliga A',KOL:'Kreisoberliga',GL:'Gruppenliga',VL:'Verbandsliga',HL:'Hessenliga'};
const V1_ROLLE={stamm:'Stamm',rotation:'Rotation',ersatz:'meist Ersatz',bank_unbenutzt:'oft ungenutzt auf der Bank'};
const v1E=s=>String(s==null?'':s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const v1D=d=>{ const m=String(d||'').match(/^(\d{4})-(\d{2})-(\d{2})/); return m?`${+m[3]}.${+m[2]}.${m[1]}`:''; };
const v1Saison=s=>/^\d{4}$/.test(s||'')?s.slice(0,2)+'/'+s.slice(2):(s||'');
const v1Heute=()=>{ try{ return new Intl.DateTimeFormat('sv-SE',{timeZone:'Europe/Berlin'}).format(new Date()); }catch(e){ return new Date().toISOString().slice(0,10); } };
function v1Toast(t){ try{ kToast(t); }catch(e){ console.log(t); } }

// Einordnung in Worten: wo liegt die Zahl zwischen den Ligaankern (Stammspieler)?
function v1Einordnung(ca){
  if(ca==null)return '';
  if(ca<V1_ANKER[0][0]-1)return 'unter dem Niveau eines Stammspielers der Kreisliga D';
  if(ca>=V1_ANKER[V1_ANKER.length-1][0]-1)return 'Hessenliga-Niveau oder höher';
  for(let i=0;i<V1_ANKER.length-1;i++){ const [a,la]=V1_ANKER[i],[b,lb]=V1_ANKER[i+1];
    if(ca<b){ if(ca-a<=1)return 'wie ein typischer Stammspieler der '+la; if(b-ca<=1)return 'fast wie ein Stammspieler der '+lb; return 'zwischen Stammspieler der '+la+' und der '+lb; } }
  return '';
}
// Unterschied in Worten (Masterprompt §9.4), bei niedriger Sicherheit vorsichtiger
function v1Vergleich(a,sa,b,sb){
  if(a==null||b==null)return '';
  const d=Math.abs(Math.round(a)-Math.round(b)); let t=d<=1?'praktisch gleich':d<=3?'leichter Vorteil':d<=6?'klarer Unterschied':'deutlicher Unterschied';
  if(d>=2&&(sa==='niedrig'||sb==='niedrig'))t+=', aber noch unsicher'; return t;
}

async function v1Rpc(fn,args){ const {data,error}=await SVB.sb.rpc(fn,args||{}); if(error)throw new Error(error.message||'Fehler'); return data; }
async function v1Laden(){
  try{ const f=await v1Rpc('funktionen_meine'); V1.an=!!(f&&f.ui_v1); }catch(e){ V1.an=false; }
  V1.geladen=true; if(V1.an){ document.documentElement.classList.add('ui-v1'); try{ V1.werte=await v1Rpc('rating_v1_werte'); }catch(e){ V1.werte=null; } }
  try{ const M=document.getElementById('modal'); if(V1.an&&M&&M.dataset.pf4&&!M.querySelector('.v1box'))v1Profil(M.dataset.pf4); }catch(e){}
  try{ if(V1.an&&typeof svCurTab==='function'&&svCurTab()==='model')v1ModellKarte(); }catch(e){}
}
{ const _si45=svInit; svInit=function(){ const r=_si45.apply(this,arguments); setTimeout(()=>{ v1Laden(); },900); return r; }; }
function v1Wert(id){ const w=V1.werte&&V1.werte[id]; return w?{ca:w[0],sicherheit:w[1],form:w[2],p24:w[3]}:null; }

/* ---------- Spielerprofil ---------- */
{ const _om45=openModal; openModal=function(id){ const r=_om45.apply(this,arguments);
  try{ if(V1.an){ const p=typeof sv4P==='function'?sv4P(id):null; if(p&&!p.isJugend)v1Profil(id); } }catch(e){ console.warn('Stärke V1',e); }
  return r; }; }

async function v1Profil(id){
  const M=document.getElementById('modal'); if(!M||M.dataset.pf4!==id)return;
  let box=M.querySelector('.v1box'); if(!box){ box=document.createElement('section'); box.className='v1box'; box.dataset.id=id;
    const top=M.querySelector('.pf4-top'); if(top)top.after(box); else (M.querySelector('.pf4')||M).prepend(box); }
  // Eye-Test-Knopf im Kopf öffnet ab jetzt den neuen Eye-Test
  M.querySelectorAll('[data-pf4="eye"], .pf4-eyel .mn-lnk').forEach(eb=>{ if(eb.dataset.v1)return; eb.dataset.v1='1'; eb.innerHTML=`${SVI('eye')} Eye-Test abgeben`;
    eb.onclick=ev=>{ ev.preventDefault(); ev.stopImmediatePropagation(); V1.offen='eye'; v1Zeichnen(box,id); box.scrollIntoView({block:'start',behavior:'smooth'}); }; });
  if(V1.profil[id])v1Zeichnen(box,id); else box.innerHTML='<div class="v1-lade">Stärke V1 wird geladen …</div>';
  try{ v1KartenHinweis(M,box,id); }catch(e){}
  try{ V1.profil[id]=await v1Rpc('rating_v1_profil',{p_id:id}); }catch(e){ box.innerHTML=`<p class="note">Stärke V1 lässt sich gerade nicht laden: ${v1E(e.message)}</p>`; return; }
  if(M.dataset.pf4===id&&box.isConnected)v1Zeichnen(box,id);
}

/* ---------- 0.99: „Was bedeuten die Zahlen?“ ----------
   Die Erklärung steht direkt im Profil. Seit 0.99.63 zeigt auch die Karte die Stärke, der MScore ist aus der Anzeige raus. */
function v1Erklaerung(){
  const leiter=V1_ANKER.slice(0,6).map(([n,l])=>`<span><b>${n}</b>${v1E(l)}</span>`).join('');
  return `<details class="v1-was"${V1.offen==='was'?' open':''}><summary>${SVI('info')} Was bedeuten die Zahlen?</summary>
    <div class="v1-was-g">
      <div class="v1-was-k"><h5><i class="v1-pk kreis"></i>Die Zahl im Kreis: Stärke</h5>
        <p>So stark ist der Spieler heute. Die Zahl hängt an den Ligen: Sie sagt, in welcher Liga er ein typischer Stammspieler wäre.</p>
        <div class="v1-leiter">${leiter}</div>
        <p>Sie entsteht aus der Liga und der Rolle der letzten Jahre. Aktuelle Leistung und Eye-Test verschieben sie nur ein Stück, zusammen höchstens 8 Punkte.</p></div>
      <div class="v1-was-k"><h5><i class="v1-pk rand"></i>Die Farbe des Kreises: wie sicher die Zahl ist</h5>
        <ul class="v1-farben"><li><i class="s-hoch"></i><span><b>Grün</b> heißt sicher: viele Einsätze, ein stimmiges Bild.</span></li>
          <li><i class="s-mittel"></i><span><b>Orange</b> heißt mittel: gute Grundlage, aber noch nicht stabil.</span></li>
          <li><i class="s-niedrig"></i><span><b>Grau gestrichelt</b> heißt unsicher: wenig Daten, die Zahl kann sich noch deutlich bewegen.</span></li></ul>
        <p>Die Farbe sagt also nichts darüber, ob ein Spieler gut ist. Ein grüner Kreis mit 55 ist eine sichere 55.</p></div>
      <div class="v1-was-k"><h5><i class="v1-pk karte"></i>Die Zahl auf der Karte: dieselbe Stärke</h5>
        <p>Auf der Karte steht dieselbe Zahl wie im Kreis. Der Pfeil daneben ist die Form: steigend, normal oder fallend. Ohne Pfeil kennen wir die Form noch nicht.</p>
        <p>Die kleinen Werte darunter: <b>FORM</b> die Form der letzten Spiele, <b>24 M</b> die vorsichtige Erwartung in 24 Monaten, <b>SICHER</b> wie belastbar die Zahl ist.</p>
        <p>Der frühere MScore wird nicht mehr gezeigt. Überall in der App zählt die Stärke.</p></div>
    </div>
    <p class="v1-was-f">Für Kaderplanung, Top-Elf, Listen und Karte zählt die Stärke. Passt eine Zahl nicht, sag es über „Bewertung prüfen“.</p></details>`; }
// Seit 0.99.63 steht auf der Karte die Stärke selbst, der Hinweis auf den MScore entfällt
function v1KartenHinweis(M,box,id){ const c=M.querySelector('.pf4-card .v1-kh'); if(c)c.remove(); }

function v1Zeichnen(box,id){
  const D=V1.profil[id]||{}, S=D.stand, p=typeof sv4P==='function'?sv4P(id):null;
  if(!S){ box.innerHTML=`<div class="v1-kopf"><div class="v1-zahl leer">?</div><div><b>Stärke V1</b><p class="note">Für diesen Spieler gibt es noch keinen Stand. Gerechnet wird einmal in der Woche, am Montag nach dem Spieltag.</p></div></div>${v1Erklaerung()}${v1Knoepfe(D)}${v1Formulare(box,id,D)}`; v1Binden(box,id); return; }
  const si=V1_SICH[S.sicherheit]||['?',''], fo=V1_FORM[S.form]||V1_FORM.unbekannt, k=S.korrektur||{};
  const vorher=D.vorher&&D.vorher.ca!=null?S.ca-D.vorher.ca:null;
  const gr=(S.gruende||[]).map(g=>typeof g==='string'?{text:g}:g);
  const ph=(S.phasen||[]).filter(x=>x.einheiten>0||x.gewicht>0);
  const maxW=Math.max(0.01,...ph.map(x=>x.gewicht||0));
  box.innerHTML=`<div class="v1-kopf">
      <div class="v1-zahl s-${v1E(S.sicherheit)}" title="Stärke V1 (0 bis 100)"><b>${S.ca}</b><small>Stärke</small></div>
      <div class="v1-mitte">
        <div class="v1-ein">${v1E(v1Einordnung(S.ca))}</div>
        <div class="v1-chips"><span class="v1-c s-${v1E(S.sicherheit)}" title="${v1E(si[1])}">Sicherheit ${v1E(si[0])}</span>
          <span class="v1-c f-${v1E(S.form)}" title="Form verändert die Stärke nicht">${fo[0]} ${v1E(fo[1])}</span>
          ${S.p24!=null?`<span class="v1-c" title="Vorsichtige Projektion aus Verlauf, Alter und Perspektive">In 24 Monaten: <b>${S.p24}</b>${S.p24_sicherheit==='niedrig'?' (unsicher)':''}</span>`:''}
          ${vorher?`<span class="v1-c ${vorher>0?'auf':'ab'}" title="Gegenüber dem Stand vom ${v1E(v1D(D.vorher.stichtag))}">${vorher>0?'+':''}${vorher} seit ${v1E(v1D(D.vorher.stichtag))}</span>`:''}</div>
        ${S.sicherheit==='niedrig'?`<p class="v1-warn">${v1E(si[1])}</p>`:''}
      </div></div>
    <details class="v1-warum"${V1.offen==='warum'?' open':''}><summary>Warum diese Stärke?</summary>
      <ul class="v1-gr">${gr.map(g=>`<li><span>${v1E(g.text)}</span>${g.wert!=null&&g.art!=='niveau'?`<b class="${g.wert>0?'auf':g.wert<0?'ab':''}">${g.wert>0?'+':''}${String(g.wert).replace('.',',')}</b>`:g.art==='niveau'&&g.wert!=null?`<b>${String(g.wert).replace('.',',')}</b>`:''}</li>`).join('')}</ul>
      <div class="v1-korr"><span>Bewährtes Niveau <b>${String(S.bewaehrt).replace('.',',')}</b></span><span>Leistung <b>${v1Zahl(k.leistung)}</b></span><span>Rolle <b>${v1Zahl(k.rolle)}</b></span><span>Eye-Test <b>${v1Zahl(k.eyetest)}</b></span>${k.pause?`<span>Pause <b>${v1Zahl(k.pause)}</b></span>`:''}</div>
      ${(S.hinweise||[]).length?`<div class="v1-hin">${S.hinweise.map(h=>`<p>ⓘ ${v1E(h)}</p>`).join('')}</div>`:''}
      ${ph.length?`<table class="v1-ph"><thead><tr><th>Saison</th><th>Liga</th><th>Team</th><th>Spiele (90′)</th><th>Rolle</th><th>Gewicht</th></tr></thead><tbody>
        ${ph.map(x=>`<tr><td>${v1E(v1Saison(x.saison))}</td><td>${v1E(V1_LIGA[x.liga]||x.liga)}</td><td>${v1E(x.team||'')}</td><td>${String(x.einheiten).replace('.',',')}</td><td>${v1E(V1_ROLLE[x.rolle]||'unbekannt')}</td>
          <td><i class="v1-bar"><i style="width:${Math.round((x.gewicht||0)/maxW*100)}%"></i></i></td></tr>`).join('')}</tbody></table>`:'<p class="note">Keine Spielzeiten in Ligen mit Anker: die Zahl ist eine vorsichtige Schätzung aus der Liga der Mannschaft.</p>'}
      <p class="note small">Stärke = bewährtes Niveau (Liga und Rolle der letzten Jahre) + begrenzte Korrekturen aus aktueller Leistung, Rolle und Eye-Test (zusammen höchstens ±8). Fehlende Daten zählen als unbekannt, nicht als schlecht. Modell ${v1E(S.modell)} · Stand ${v1E(v1D(S.stichtag))}</p>
    </details>
    ${v1Erklaerung()}${v1EyeListe(D)}${v1PruefListe(D)}${v1Knoepfe(D)}${v1Formulare(box,id,D)}`;
  v1Binden(box,id);
}
const v1Zahl=v=>v==null?'0':(v>0?'+':'')+String(v).replace('.',',');

function v1EyeListe(D){
  const L=(D.eyes||[]).filter(e=>!e.zurueck); if(!L.length)return '';
  return `<div class="v1-eyes"><h5>Eye-Tests (neue Skala)</h5>${L.map(e=>`<div class="v1-ey"><b>${e.gesamt}</b><div><span>${v1E(e.rater_name||'?')} · ${v1E(v1D(e.datum))} · ${v1E((V1_TIEFE.find(t=>t[0]===e.tiefe)||[,''])[1])}${e.perspektive?' · Perspektive '+v1E((V1_PERSP.find(t=>t[0]===e.perspektive)||[,''])[1].toLowerCase()):''}</span>
    <em>${V1_EYE.map(([k,l])=>e[k]!=null?`${l} ${e[k]}`:'').filter(Boolean).join(' · ')}${e.gesehen_bei?' · '+v1E(e.gesehen_bei):''}</em>${e.notiz?`<p>${v1E(e.notiz)}</p>`:''}</div>
    ${e.darf?`<button class="btn sm ghost" type="button" data-v1zur="${v1E(e.id)}">Zurückziehen</button>`:''}</div>`).join('')}</div>`;
}
function v1PruefListe(D){
  const L=D.pruefungen||[]; if(!L.length)return '';
  return `<div class="v1-pr"><h5>Bewertung prüfen</h5>${L.map(x=>`<div class="v1-pri st-${v1E(x.status)}"><span class="v1-c">${v1E(V1_STATUS[x.status]||x.status)}</span><div><b>${v1E(v1PrTitel(x))}</b> · ${v1E(x.von_name||'')} · ${v1E(v1D(x.erstellt_am))}<p>${v1E(x.notiz)}</p>${x.antwort?`<p class="v1-ant">Antwort: ${v1E(x.antwort)}</p>`:''}</div>
    ${D.chef&&x.status==='offen'?`<div class="v1-pra"><button class="btn sm" type="button" data-v1erl="${v1E(x.id)}" data-st="geprueft">Geprüft</button><button class="btn sm ghost" type="button" data-v1erl="${v1E(x.id)}" data-st="abgelehnt">Ablehnen</button></div>`:''}</div>`).join('')}</div>`;
}
function v1VglSpieler(id){ try{ const s=sv4S(); return players.filter(p=>p.id!==id&&!p.isJugend&&['1','2'].includes(sv4Team(p,s))).sort((a,b)=>a.name.localeCompare(b.name,'de'))
  .map(p=>`<option value="${v1E(p.id)}">${v1E(p.name)} (${sv4Team(p,s)}.)</option>`).join(''); }catch(e){ return ''; } }
function v1Knoepfe(D){ return `<div class="v1-knoepfe"><button class="btn sm" type="button" data-v1="eye">${SVI('eye')} Eye-Test abgeben</button><button class="btn sm ghost" type="button" data-v1="pruef">${SVI('info')} Bewertung prüfen</button></div>`; }
function v1Formulare(box,id,D){
  if(V1.offen==='eye'){ const own=typeof sv4Team==='function'&&!!sv4Team(sv4P(id));
    return `<form class="v1-form" data-f="eye"><h5>Eye-Test (neue Skala 1 bis 5)</h5>
      <div class="v1-gs"><span>Gesamturteil *</span>${V1_GESAMT.map(([n,t])=>`<label class="v1-g"><input type="radio" name="gesamt" value="${n}"><b>${n}</b><small>${v1E(t)}</small></label>`).join('')}</div>
      <div class="v1-kat">${V1_EYE.map(([k,l])=>`<label><span>${l}</span><select name="${k}"><option value="">·</option>${[1,2,3,4,5].map(n=>`<option>${n}</option>`).join('')}</select></label>`).join('')}</div>
      <div class="v1-zeile"><label>Wie gut kennst du ihn?<select name="tiefe">${V1_TIEFE.map(([k,t])=>`<option value="${k}"${(own?'intern':'einmal')===k?' selected':''}>${v1E(t)}</option>`).join('')}</select></label>
        <label>Perspektive<select name="perspektive">${V1_PERSP.map(([k,t])=>`<option value="${k}">${v1E(t)}</option>`).join('')}</select></label>
        <label>Gesehen am<input type="date" name="datum" value="${v1Heute()}" max="${v1Heute()}"></label>
        <label>Anlass<select name="anlass">${[['spiel','Spiel'],['training','Training'],['scouting','Scouting vor Ort'],['video','Video'],['sonstiges','Sonstiges']].map(([k,t])=>`<option value="${k}"${(own?'training':'spiel')===k?' selected':''}>${t}</option>`).join('')}</select></label>
        <label class="w">Wo / gegen wen${own?'':' *'}<input type="text" name="gesehen_bei" maxlength="120" placeholder="z. B. Heimspiel gegen Rimbach"></label>
        <label class="w">Notiz<input type="text" name="notiz" maxlength="600"></label></div>
      <p class="note small">Das Gesamturteil zählt nur, wenn es vom Modell abweicht, und höchstens so stark, wie du ihn kennst (einmal gesehen ±2 bis regelmäßig intern ±5). Mehrere Tests derselben Sicht zählen nicht doppelt.</p>
      <div class="btnrow"><button class="btn sm" type="submit">${SVI('check')} Speichern</button><button class="btn sm ghost" type="button" data-v1="zu">Abbrechen</button></div></form>`; }
  if(V1.offen==='pruef')return `<form class="v1-form" data-f="pruef"><h5>Bewertung prüfen</h5><p class="note small">Dein Hinweis geht an die Sportliche Leitung. Der Wert ändert sich dadurch nicht automatisch.</p>
      <div class="v1-zeile"><label>Was passt nicht?<select name="art">${V1_ART.map(([k,t])=>`<option value="${k}">${v1E(t)}</option>`).join('')}</select></label>
      <label>Vergleich (freiwillig)<select name="vergleich"><option value="">kein Vergleich</option>${Object.entries(V1_VGL).map(([k,t])=>`<option value="${k}">Er ist ${t}</option>`).join('')}</select></label>
      <label>Vergleichsspieler<select name="vergleich_player"><option value="">wählen</option>${v1VglSpieler(id)}</select></label>
      <label class="w">Begründung *<input type="text" name="notiz" maxlength="600" placeholder="z. B. Spielt seit drei Wochen Innenverteidiger, stark im Training"></label></div>
      <div class="btnrow"><button class="btn sm" type="submit">${SVI('check')} Abschicken</button><button class="btn sm ghost" type="button" data-v1="zu">Abbrechen</button></div></form>`;
  return '';
}
function v1Binden(box,id){
  box.querySelectorAll('[data-v1]').forEach(b=>b.onclick=()=>{ const k=b.dataset.v1; V1.offen=k==='zu'?null:k; v1Zeichnen(box,id); const f=box.querySelector('.v1-form'); if(f)f.scrollIntoView({block:'nearest',behavior:'smooth'}); });
  const d=box.querySelector('.v1-warum'); if(d)d.addEventListener('toggle',()=>{ V1.offen=d.open?'warum':(V1.offen==='warum'?null:V1.offen); });
  const w=box.querySelector('.v1-was'); if(w)w.addEventListener('toggle',()=>{ V1.offen=w.open?'was':(V1.offen==='was'?null:V1.offen); });
  const f=box.querySelector('.v1-form');
  if(f)f.onsubmit=async ev=>{ ev.preventDefault(); const fd=new FormData(f), o={player_id:id}; fd.forEach((v,k)=>{ v=String(v).trim(); if(v)o[k]=v; });
    const btn=f.querySelector('[type="submit"]');
    if(f.dataset.f==='eye'){ if(!o.gesamt)return v1Toast('Bitte ein Gesamturteil 1 bis 5 wählen');
      const own=typeof sv4Team==='function'&&!!sv4Team(sv4P(id)); if(!own&&!o.gesehen_bei&&o.anlass!=='video')return v1Toast('Wo hast du ihn gesehen?'); }
    else if((o.notiz||'').length<3)return v1Toast('Bitte kurz begründen');
    if(f.dataset.f==='pruef'&&!!o.vergleich!==!!o.vergleich_player)return v1Toast('Für den Vergleich beides wählen: wie und mit wem');
    btn.disabled=true;
    try{ await v1Rpc(f.dataset.f==='eye'?'eye_v1_speichern':'rating_pruefung_neu',{p:o});
      v1Toast(f.dataset.f==='eye'?'✓ Eye-Test gespeichert. Die Stärke rechnet am Montag neu.':'✓ Hinweis an die Sportliche Leitung geschickt');
      V1.offen=null; delete V1.profil[id]; v1Profil(id); }
    catch(e){ v1Toast('⚠️ '+e.message); btn.disabled=false; } };
  box.querySelectorAll('[data-v1zur]').forEach(b=>b.onclick=async()=>{ if(!b.classList.contains('sure')){ b.classList.add('sure'); b.textContent='Wirklich zurückziehen?'; return; }
    try{ await v1Rpc('eye_v1_zurueckziehen',{p_id:b.dataset.v1zur}); v1Toast('Eye-Test zurückgezogen'); delete V1.profil[id]; v1Profil(id); }catch(e){ v1Toast('⚠️ '+e.message); } });
  box.querySelectorAll('[data-v1erl]').forEach(b=>b.onclick=async()=>{ try{ await v1Rpc('rating_pruefung_erledigen',{p_id:b.dataset.v1erl,p_status:b.dataset.st,p_antwort:null}); v1Toast('✓ Erledigt'); delete V1.profil[id]; v1Profil(id); }catch(e){ v1Toast('⚠️ '+e.message); } });
}

/* ---------- Wissen → Modell: Bewertungsmodell V1 ---------- */
{ const _gt45=goTab; goTab=function(tab){ const r=_gt45.apply(this,arguments); try{ if(V1.an&&svCurTab()==='model')v1ModellKarte(); }catch(e){ console.warn(e); } return r; }; }
