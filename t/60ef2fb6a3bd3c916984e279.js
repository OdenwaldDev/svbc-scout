  const sds=s.k==='base'&&p.sds>0?Math.min(4,p.sds*0.8)*K:0;
  const E=L+role+prod+team+dom+mvpOff+sds;
  let w=n>0?s.rec*n/(n+5):s.rec*0.1; if(qEst)w*=0.6; if(mvp!=null)w*=1.25;
  return Object.assign({},s,{L,lv,q,qEst,n,role,t,pct,raw,lei,prod,team,dom,mvp,mvpOff,sds,E,w,w0:w,gpg});
};
sv94Score=function(p,r,opt){
  const K=SV40_K; opt=opt||{}; const grp=typeof svmGrp==='function'?svmGrp(p):SV94_GRUPPE(p.pos);
  const M=opt.mvp!==undefined?(opt.mvp==null?null:{v:opt.mvp}):(typeof mvpOf==='function'?mvpOf(p):null), mvp=M?M.v:null;
  const S=sv94Seasons(p,r); const mvpK=S.some(s=>s.k==='cur')?'cur':'base';
  const ev=S.map(s=>sv94Eval(p,s,grp,s.k===mvpK?mvp:null)).filter(Boolean);
  if(!ev.length)return null;
  ev.forEach(s=>{ s.alt=sv94Alterung(p.alter,p.pos,s.jahre); s.Eh=s.E+s.alt; });
  ev.forEach(s=>{ const hi=ev.filter(o=>o!==s&&SV94_NIVEAU[o.lv]>SV94_NIVEAU[s.lv]&&o.w0>0.1); if(!hi.length)return;
    const hw=hi.reduce((a,o)=>a+o.w0,0), Po=hi.reduce((a,o)=>a+o.Eh*o.w0,0)/hw; if(s.Eh>=Po)return;
    const perf=0.5*Math.min(1,s.q/0.75)+0.5*s.lei, d=sv94C((perf-0.5)/0.35,0,1)*Math.min(1,hw/0.6); if(d>0.05){ s.w=s.w0*(1-0.85*d); s.decke=d; s.Po=Po; } });
  const Wd=ev.reduce((a,s)=>a+s.w,0), P=Wd>0?ev.reduce((a,s)=>a+s.Eh*s.w,0)/Wd:null;
  const c=p.cur&&p.cur.spiele>=3?p.cur:null, lvNow=sv94Lv(c?(c.sub||c.liga):(p.sub||p.liga))||ev[0].lv;
  const prior=SV94_NIVEAU[lvNow]-6*K, Wp=Math.max(0,0.5-Wd);
  const eye=r&&r.eye!=null?r.eye:null, en=eye!=null&&r.eyeE?r.eyeE.n:0, We=eye==null?0:en>=3?2:en===2?1.5:1;
  const Wall=Wd+Wp+We, base=((P==null?0:P*Wd)+prior*Wp+(eye==null?0:eye*We))/Wall;
  const adj=[]; let T=base;
  try{ const Q=typeof svmEindruecke==='function'?svmEindruecke(p):null; if(Q)[['trn','Trainingsleistung',Q.trn,2.5],['spl','Spielleistung',Q.spl,2]].forEach(([k,t,x,f])=>{ if(!x||x.avg==null)return; const b=sv94C((3-x.avg)*f*K*Math.min(1,x.n/6),-5*K,5*K); if(Math.abs(b)>=0.5){ T+=b; adj.push([k,t,b,`${x.n} Eindrücke: ${x.pos} positiv, ${x.neu} neutral, ${x.neg} negativ`]); } }); }catch(e){}
  const reg=ev.filter(s=>s.n>=12&&s.q>=0.5&&!s.qEst); let ex=0; const exT=[];
  if(reg.length>=2){ ex+=Math.min(1.6,0.8*(reg.length-1))*K; exT.push(`${reg.length} Saisons als Stammkraft`); }
  if(p.alter!=null&&p.alter>=26&&p.alter<=33&&reg.length){ ex+=1*K; exT.push('im besten Fußballeralter, Routine'); }
  if(p.alter!=null&&p.alter<=20&&!reg.length){ ex-=1.5*K; exT.push('jung und noch ohne Stammplatz'); }
  if(Math.abs(ex)>=0.8){ T+=ex; adj.push(['exp','Erfahrung',ex,exT.join(', ')]); }
  const APP=(ev.find(x=>x.app)||{}).app; if(APP&&APP.mit>=5&&APP.ohne>=3&&APP.ppgMit!=null&&APP.ppgOhne!=null){ const b=sv94C((APP.ppgMit-APP.ppgOhne)*1.5*K*Math.min(1,APP.ohne/6),-2*K,2*K); if(Math.abs(b)>=0.8){ T+=b; adj.push(['onoff','Mit ihm auf dem Platz',b,`${sv94N(APP.ppgMit,2)} Punkte je Spiel mit ihm, ${sv94N(APP.ppgOhne,2)} ohne ihn`]); } }
  if(p.pressIdx!=null){ const b=sv94C((p.pressIdx-50)/50*1.5*K,-1.5*K,1.5*K); if(Math.abs(b)>=0.8){ T+=b; adj.push(['presse','Presse',b,'Tenor der Nennungen']); } }
  T=sv94C(T,5,SV40_MAX);
  let total=Math.round(T*10)/10, man=null; if(p.adjTo!=null&&!opt.ohneManuell){ man=Math.round((p.adjTo-total)*10)/10; total=p.adjTo; }
  ev.forEach(s=>{ s.anteil=s.w/Wall; });
  const main=ev.slice().sort((a,b)=>b.w0-a.w0)[0];
  return {grp,ev,main,P,Wd,prior,Wp,priorAnteil:Wp/Wall,lvNow,eye,en,We,eyeAnteil:We/Wall,base,adj,total,man,mvp,mvpK,
    pot:sv94Pot(T,p.alter,p.pos),rate:sv94Rate(p.alter,p.pos),prog:p.alter!=null?Math.round(sv94C(T+sv94Alterung(p.alter+sv94Jahre(sv94Mitte(2),true),p.pos,sv94Jahre(sv94Mitte(2),true)),5,SV40_MAX)*10)/10:null};
};
sv94Jugend=function(p,r){
  const K=SV40_K, jw=p.jw!=null?p.jw:p.w, L=Math.round(sv94JNiveau(jw)*10)/10, grp=SV94_GRUPPE(p.pos||'ST');
  const n=p.einsaetze||p.teamSp||0, tore=p.tore||0, gpg=tore/Math.max(1,n);
  const prod=grp==='def'?0:sv94C((gpg-0.35)*10,-4,6)*K*(n/(n+4));
  const dom=grp!=='def'&&gpg>1&&n>=6?Math.min(20,(gpg-1)*10)*K:0;
  const E=L+prod+dom, w=n>0?0.9*n/(n+5):0.05;
  const ev=[{k:'jug',y:/Vorsaison/.test(p.staffel||'')?'25/26':sv4SL(sv4S()),lv:p.kurz||p.sub||'Jugend',L,role:0,prod,team:0,dom,mvp:null,sds:0,n,qEst:!p.einsaetze,tore,rank:p.rank!=null?p.rank:null,E,Eh:E,alt:0,w,w0:w,q:0.75,lei:0.5,t:0.5,pct:null,raw:gpg}];
  const prior=L-4*K, Wp=0.5;
  const eye=r&&r.eye!=null?r.eye:null, en=eye!=null&&r.eyeE?r.eyeE.n:0, We=eye==null?0:en>=3?2:en===2?1.5:1;
  const Wall=w+Wp+We, base=(E*w+prior*Wp+(eye==null?0:eye*We))/Wall;
  const T=sv94C(base,5,SV40_MAX); ev[0].anteil=w/Wall;
  let total=Math.round(T*10)/10, man=null; if(p.adjTo!=null){ man=Math.round((p.adjTo-total)*10)/10; total=p.adjTo; }
  return {grp,ev,main:ev[0],P:E,Wd:w,prior,Wp,priorAnteil:Wp/Wall,lvNow:ev[0].lv,eye,en,We,eyeAnteil:We/Wall,base,adj:[],total,man,mvp:null,mvpK:'cur',jugend:true,
    pot:sv94Pot(T,p.alter!=null?p.alter:(p.estAlter!=null?p.estAlter:18),p.pos),rate:sv94Rate(p.alter!=null?p.alter:18,p.pos),prog:null};
};
if(typeof sv93Niveau==='function')sv93Niveau=function(v){ const L=[['GL','Stammspieler der Gruppenliga'],['KOL','Stammspieler der Kreisoberliga'],['A','Stammspieler der Kreisliga A'],['B','Stammspieler der Kreisliga B'],['C','Stammspieler der Kreisliga C'],['D','Stammspieler der Kreisliga D']];
  if(v>=SV94_NIVEAU.GL+8)return 'Spitze der Region, über dem Niveau eines Gruppenliga-Stammspielers'; for(const [l,t] of L){ if(v>=SV94_NIVEAU[l]-5)return 'etwa auf dem Niveau eines '+t.replace('Stammspieler','Stammspielers'); } return 'unter dem Niveau eines Stammspielers der Kreisliga D'; };
try{ if(typeof SV94!=='undefined'){ SV94.cache.clear(); SV94.dist=null; } }catch(e){}
// Überall dieselbe Beschreibung der Skala
const SV40_SKALA='1 bis 10 in halben Schritten, mal zehn = Spielstärke: <b>4</b> Kreisliga C · <b>5,5</b> B · <b>7</b> A · <b>8,5</b> Kreisoberliga · <b>10</b> Gruppenliga';
const SV40_SKALA_T='1 bis 10 in halben Schritten, mal zehn = Spielstärke: 4 Kreisliga C, 5,5 B, 7 A, 8,5 Kreisoberliga, 10 Gruppenliga.';
document.addEventListener('DOMContentLoaded',()=>{});
{ const mo=new MutationObserver(()=>{ clearTimeout(SV40._sk); SV40._sk=setTimeout(()=>{ try{
    document.querySelectorAll('.ey4-h small').forEach(s=>{ if(!s.dataset.sv40){ s.dataset.sv40=1; s.innerHTML=SV40_SKALA; } });
    document.querySelectorAll('.mp18 > p.note.small').forEach(n=>{ if(/^Deine eigene Bewertung dieser Saison, 1 bis 10 \(5 = /.test(n.textContent))n.textContent='Deine eigene Bewertung dieser Saison, '+SV40_SKALA_T+' Die Karte zeigt den Schnitt aller Bewerter.'; });
    document.querySelectorAll('#homeWechsel .note').forEach(n=>{ if(/ab Stärke 45/.test(n.innerHTML))n.innerHTML=n.innerHTML.replace('ab Stärke 45','ab Stärke 55'); });
  }catch(e){} },120); });
  const st=()=>{ const m=document.querySelector('main')||document.body; if(m)mo.observe(m,{childList:true,subtree:true}); const md=document.getElementById('modal'); if(md)mo.observe(md,{childList:true,subtree:true}); };
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',st); else st(); }
if(typeof MN31_STUFEN!=='undefined')MN31_STUFEN.splice(0,MN31_STUFEN.length,[3,'unter Kreisliga C (Kreisliga D)'],[4,'Kreisliga C'],[5.5,'Kreisliga B'],[7,'Kreisliga A'],[8.5,'Kreisoberliga'],[10,'Gruppenliga']);

/* =====================================================================
   8. Wissen: Datenquellen und MScore
   ===================================================================== */
SV4_HUB.wissen.tabs.splice(1,0,['quellen','Datenquellen']); SV4_OF.quellen='wissen';
Object.assign(SV_PAGES,{quellen:['Wissen','Datenquellen: woher die Spielerdaten kommen und welche Angabe gilt'],model:['Wissen','Modell: so rechnet der MScore, Baustein für Baustein']});
function sv40QPanel(){ let P=document.getElementById('panel-quellen'); if(P)return P; const ref=document.getElementById('panel-play'); if(!ref)return null;
  P=document.createElement('section'); P.className='panel'; P.id='panel-quellen'; ref.parentNode.insertBefore(P,ref.nextSibling); return P; }
function sv40QRender(){ const P=sv40QPanel(); if(!P)return;
  P.innerHTML=`<div class="card sv40-doc"><h3 class="trh">${SVI('db')} Woher die Spielerdaten kommen</h3>
    <p>Jeder Spieler steht einmal in der App. Seine Angaben kommen aus mehreren Quellen. Damit sich nichts widerspricht, gilt für jede Angabe eine feste Reihenfolge. Die erste Quelle, die etwas liefert, zählt.</p>
    <div class="trtw"><table class="trtab"><thead><tr><th>Angabe</th><th>Es gilt</th><th>Warum</th></tr></thead><tbody>
      <tr><td>Name, Geburtsdatum, Position, Fuß, Größe</td><td><b>App</b> (Massenpflege), sonst FuPa, sonst fussball.de</td><td>Was der Verein selbst pflegt, ist am genauesten.</td></tr>
      <tr><td>Mannschaft in dieser Saison</td><td><b>App</b> (Kaderplanung)</td><td>Nur der Verein weiß, wer wo planmäßig spielt.</td></tr>
      <tr><td>Rückennummer, Mannschaftsteil</td><td><b>FuPa</b></td><td>FuPa führt den Kader mit Nummern.</td></tr>
      <tr><td>Tore, Vorlagen, Minuten je Spiel</td><td><b>FuPa</b>, sonst fussball.de</td><td>FuPa wird nachgetragen und kennt Vorlagen. Gilt auch, wenn in der App schon etwas steht.</td></tr>
      <tr><td>Startelf, Einwechslung, Bank</td><td><b>App</b>, sonst FuPa, sonst fussball.de</td><td>Einträge des Trainerteams bleiben.</td></tr>
      <tr><td>Training: Anwesenheit, Eindruck</td><td><b>App</b>, sonst Anwesenheitsliste, sonst Abstimmung</td><td>Der Trainer war dabei.</td></tr>
      <tr><td>Torjäger- und Tabellenstände der Region</td><td><b>fussball.de</b></td><td>Amtliche Listen, zweimal pro Woche abgerufen.</td></tr>
      <tr><td>Kontakt (Handy, E-Mail)</td><td><b>App</b></td><td>Nur intern, nur für Erwachsene.</td></tr></tbody></table></div>
    <h4>Wie ein Spieler aus FuPa oder fussball.de erkannt wird</h4>
    <ol><li><b>Profil-Link:</b> Ist beim Spieler der Link zum fussball.de-Profil oder die FuPa-Verbindung hinterlegt, gilt nur dieser. Das ist der sicherste Weg.</li>
      <li><b>Voller Name</b> (auch frühere Schreibweisen), wenn genau ein Spieler passt.</li>
      <li><b>Vor- und Nachname ohne Zwischennamen</b>, wenn genau ein Spieler passt. So wird „Max Peter Muster“ zu „Max Muster“.</li>
      <li>FuPa zusätzlich mit Verein, Liga und Toren als Beleg. Ist etwas unsicher, landet es in der Prüfliste unter Verwaltung → Datenabgleich und wird von Hand bestätigt.</li></ol>
    <h4>Regeln für Änderungen von Hand</h4>
    <ul><li>Was in der App von Hand eingetragen oder bestätigt wurde, überschreibt keine automatische Quelle still. Ausnahme sind Tore, Vorlagen und Minuten: Hier hat FuPa Vorrang.</li>
      <li>Eine von Hand bestätigte FuPa-Zuordnung gilt dauerhaft, auch wenn sich der Name ändert.</li>
      <li>Widersprechen sich zwei Quellen, wird nichts gelöscht. Der Eintrag bekommt einen roten Hinweis, im Detail steht, was wo steht.</li>
      <li>Jede Änderung an Spielerdaten steht im Verlauf und lässt sich zurückholen.</li></ul>
    <h4>Doppelte Spieler</h4>
    <p>Kommt ein Spieler über zwei Wege in die App (zum Beispiel einmal mit und einmal ohne Zwischennamen), steht er doppelt da. Das Zusammenführen hängt alle Einträge (Training, Spiele, Eye-Test, Kontakt, Planung) an den bleibenden Spieler, merkt sich den anderen Namen als frühere Schreibweise und entfernt den doppelten Eintrag. Danach erkennt die App ihn in allen Quellen unter beiden Namen.</p>
    ${isAdmin()?`<div id="sv40dup"><div class="empty">Suche doppelte Spieler …</div></div>`:'<p class="note small">Zusammenführen kann der Admin.</p>'}</div>`;
  if(isAdmin())sv40DupLaden(P.querySelector('#sv40dup'));
}
async function sv40DupLaden(box,force){ if(!box)return; if(!SV40.dup||force){ try{ const {data,error}=await SVB.sb.rpc('spieler_dubletten'); if(error)throw error; SV40.dup=data||[]; }catch(e){ box.innerHTML=`<p class="note">Prüfung nicht möglich: ${sv40E(e.message||e)}</p>`; return; } }
  const D=SV40.dup; if(!box.isConnected)return;
  if(!D.length){ box.innerHTML='<p class="note"><b>✓ Keine doppelten Spieler gefunden.</b></p>'; return; }
  box.innerHTML=`<p class="note"><b>${D.length} mögliche Doppelung${D.length>1?'en':''}.</b> Wähle, welcher Eintrag bleibt. Vorausgewählt ist der mit den meisten Einträgen.</p><div class="sv40-dup">${D.map((g,i)=>`<div class="sv40-dupg" data-dg="${i}">${g.spieler.map((s,j)=>`<label><input type="radio" name="sv40d${i}" value="${sv40E(s.id)}" ${j===0?'checked':''}> <b>${sv40E(s.name)}</b> <small>${sv40E(s.verein||'')} · ${s.eintraege} Einträge${s.neu?' · neu aus fussball.de':''}${s.link?' · mit Profil-Link':''}</small></label>`).join('')}
      <div class="btnrow"><button type="button" class="btn sm" data-dgo="${i}">Zusammenführen</button></div></div>`).join('')}</div>`;
  box.querySelectorAll('[data-dgo]').forEach(b=>b.onclick=async()=>{ const i=+b.dataset.dgo, g=D[i], neu=box.querySelector(`input[name="sv40d${i}"]:checked`).value, alt=g.spieler.filter(s=>s.id!==neu);
    if(!b.classList.contains('sure')){ b.classList.add('sure'); b.textContent=`Ja, ${alt.map(s=>s.name).join(', ')} in ${g.spieler.find(s=>s.id===neu).name} überführen`; return; }
    b.disabled=true; try{ for(const a of alt){ const {error}=await SVB.sb.rpc('spieler_zusammenfuehren',{p_alt:a.id,p_neu:neu}); if(error)throw error; }
      kToast('✓ Zusammengeführt. Die Daten werden neu geladen.'); SV40.dup=null; try{ if(typeof svDatenNeuLaden==='function')await svDatenNeuLaden(); }catch(e){} sv40DupLaden(box,true); }
    catch(e){ b.disabled=false; kToast('⚠️ '+(e.message||e)); } }); }

function sv40ModellRender(){ const P=document.getElementById('panel-model'); if(!P)return; let c=P.querySelector('.sv40-m'); if(!c){ c=document.createElement('div'); c.className='card sv40-doc sv40-m'; P.prepend(c); }
  const niv=[['D','Kreisliga D'],['C','Kreisliga C'],['B','Kreisliga B'],['A','Kreisliga A'],['KOL','Kreisoberliga'],['GL','Gruppenliga'],['VL','Verbandsliga']];
  c.innerHTML=`<h3 class="trh">${SVI('chart')} MScore: eine Skala für alles</h3>
    <p>Der MScore ist die <b>Spielstärke</b> eines Spielers. Er beschreibt, wie gut er ist, nicht in welcher Liga er gerade spielt. Er nutzt dieselbe Skala wie der Eye-Test: <b>Eye-Test mal zehn = Spielstärke</b>. Ein Stammspieler der Kreisliga A liegt bei 70, wer im Eye-Test eine 7 bekommt, ebenso.</p>
    <div class="sv40-skala">${niv.map(([k,t])=>`<div><b>${SV94_NIVEAU[k]}</b><span>${t}${k!=='VL'?` · Eye-Test ${sv40N(SV94_NIVEAU[k]/10)}`:''}</span></div>`).join('')}</div>
    <p class="note small">Über 100 liegt, wer besser ist als ein typischer Stammspieler der Gruppenliga (Verbandsliga und höher). Farben: ab 85 lila (Elite), ab 70 grün, ab 55 gelb, darunter rot.</p>
    <h4>1. Saisons als Belege</h4>
    <p>Jede Spielzeit ergibt einen eigenen Wert: das <b>Liga-Niveau</b> (Tabelle oben), dazu die <b>Rolle</b> (Einsatzquote: Stammspieler liegen am Niveau ihrer Liga, Ergänzungsspieler bis zu rund 12 Punkte darunter, Dauerspieler etwas darüber) und die <b>Leistung</b> im Vergleich zu Spielern derselben Liga und desselben Mannschaftsteils (bis etwa ±10). Vorne zählen Tore und halbe Vorlagen je Spiel, hinten die Gegentore der Mannschaft im Verhältnis zur Liga. Dazu kommen <b>Ausnahmeleistung</b> (mehr als ein Tor je Spiel), <b>FuPa-MVP</b> und <b>Elf der Woche</b>. Der Tabellenplatz der Mannschaft zählt nicht.</p>
    <h4>2. Gewichtung und Alter</h4>
    <p>Gezählt werden die laufende Saison und die drei Spielzeiten davor, jüngere mehr als ältere, Saisons mit vielen Spielen mehr als solche mit wenigen. Ältere Belege werden mit der <b>Alterskurve</b> auf heute gerechnet: bis 24 legt man zu (bis gut 6 Punkte je Jahr bei 18-Jährigen), 25 bis 28 bleibt es, ab 29 geht es bergab, ab 33 deutlich. Flügel, Außenverteidiger und Stürmer bauen schneller ab, Innenverteidiger und Torhüter langsamer.</p>
    <h4>3. Deckeneffekt</h4>
    <p>Wer in eine tiefere Liga wechselt und dort vorne mitspielt, kann nach oben nichts mehr zeigen. Solche Saisons ziehen ihn kaum nach unten. Wer dort nur Ergänzung ist, zählt voll.</p>
    <h4>4. Eye-Test</h4>
    <p>Eigene Messung der Planer und Trainer in sechs Kategorien (Torhüter fünf), ${SV40_SKALA}. Der Wert mal zehn geht direkt in den MScore. Eine Bewertung zählt etwa so viel wie eine volle Saison, zwei das Anderthalbfache, ab drei Bewertern doppelt.</p>
    <h4>5. Wenig Daten</h4>
    <p>Gibt es kaum Spiele, rechnet die App mit einer Annahme: Ergänzungsspieler der aktuellen Liga (Liga-Niveau minus rund 10). Sie verschwindet, sobald echte Daten da sind. Wie sicher der Wert ist, zeigt die <b>Datenbasis</b> im Profil.</p>
    <h4>6. Zu- und Abschläge</h4>
    <ul><li><b>Trainingsleistung</b> und <b>Spielleistung</b> (nur eigene Spieler): Eindrücke Positiv, Neutral, Negativ, ab drei echten Bewertungen, bis ±8.</li>
      <li><b>Erfahrung</b>: mehrere Saisons als Stammkraft, bestes Fußballeralter, bis etwa +4; sehr junge Spieler ohne Stammplatz −2,4.</li>
      <li><b>Mit ihm auf dem Platz</b>: Punkte je Spiel mit und ohne ihn, bis ±3,2.</li>
      <li><b>Presse</b>: Tenor der Nennungen, bis ±2,4.</li>
      <li><b>Insider-Rating</b>: Die Sportliche Leitung kann den Wert festlegen. Das steht dann sichtbar im Profil.</li></ul>
    <h4>7. Potenzial und Prognose</h4>
    <p>Potenzial ist, was mit normaler Entwicklung bis Mitte 20 noch drin ist. Die Prognose zeigt den erwarteten Wert zur nächsten Saison. Vereinstreue zählt bewusst nicht in den MScore.</p>
    <p class="note small">Jeder Wert ist im Spielerprofil Schritt für Schritt erklärt: welche Saison wie viel zählt und warum.</p>`;
  P.querySelectorAll('.m4 h3').forEach(h=>{ if(/MScore 4/.test(h.textContent))h.textContent='Liga-Niveau und Alterskurve'; });
  P.querySelectorAll('.m94r .note.small').forEach(n=>{ n.textContent='Beispiele: Wer aus der Gruppenliga in die Kreisliga A wechselt und dort Stammspieler ist und trifft, bleibt nahe an seinem Gruppenliga-Wert. Ein Stammspieler der Kreisoberliga liegt um 85, ein Ergänzungsspieler dort spürbar darunter. Wer in der Kreisliga D drei Tore je Spiel schießt, landet deutlich über dem Niveau seiner Liga.'; });
}
{ const _gt40w=goTab; goTab=function(tab){ if(tab==='quellen')sv40QPanel(); const r=_gt40w.apply(this,arguments);
  try{ const c=svCurTab(); if(c==='quellen')sv40QRender(); if(c==='model')setTimeout(sv40ModellRender,0); }catch(e){ console.warn('Wissen 0.38',e); } return r; }; }
if(typeof SV50_INFO!=='undefined'&&SV50_INFO.gegner)SV50_INFO.gegner.h='Gehört zu Mannschaft → Spiele → Bevorstehende. Dort steht das Wichtigste zum nächsten Gegner, ein Tipp auf ein Spiel öffnet diese ganze Analyse mit Historie.';

(function(){ try{ const s=document.createElement('style'); s.id='svm41css'; s.textContent="/* Beta 0.74 · Ruhige Oberfläche. Liegt als letzte Schicht über design.css und ersetzt den Verlaufs-Look aus 0.39.\n   Prinzip: flache Flächen, eine Kante, eine Akzentfarbe. Kein Verlauf auf Text und Knöpfen, kein Leuchten, keine Deko hinter dem Inhalt.\n   Dunkle Regeln stehen unter html:not([data-theme=\"hell\"]), helle unter html[data-theme=\"hell\"] body (wie in svm53.css),\n   damit hellcss.py sie nicht übersetzt und svhell.css sie nicht überschreibt. */\n:root{\n  --grad-brand:var(--brand);\n  --grad-brand-soft:var(--brandSoft);\n  --grad-gold:var(--gold);\n  --grad-surface:var(--surface);\n  --grad-surface-2:var(--surface2);\n  --kante:transparent;\n  --glow:transparent; --glow-2:none;\n  --r-xl:16px; --r-lg:14px; --r-md:11px; --r-sm:9px;\n}\n/* Hintergrund: eine Farbe */\nhtml:not([data-theme=\"hell\"]) body,html:not([data-theme=\"hell\"]) body:not(#_){background:var(--bg)!important;background-image:none!important;}\nhtml[data-theme=\"hell\"] body,html[data-theme=\"hell\"] body:not(#_){background:var(--bg)!important;background-image:none!important;}\n#svWelt{display:none!important;}\n.hello h2::after{display:none!important;}\n\n/* Karten: flach, eine Kante, kaum Schatten, kein Glas */\nhtml:not([data-theme=\"hell\"]) .card,html:not([data-theme=\"hell\"]) .chartcard,html:not([data-theme=\"hell\"]) .pbcard,html:not([data-theme=\"hell\"]) .fcard,html:not([data-theme=\"hell\"]) .tile{\n  background:var(--surface)!important;border:1px solid var(--line)!important;box-shadow:0 1px 2px rgba(0,0,0,.25)!important;}\nhtml[data-theme=\"hell\"] body .card,html[data-theme=\"hell\"] body .chartcard,html[data-theme=\"hell\"] body .pbcard,html[data-theme=\"hell\"] body .fcard,html[data-theme=\"hell\"] body .tile{\n  background:var(--surface)!important;border:1px solid var(--line)!important;box-shadow:0 1px 2px rgba(60,45,20,.06)!important;}\n.card,.chartcard,.pbcard{backdrop-filter:none!important;-webkit-backdrop-filter:none!important;}\n.card::before,.chartcard::before,.pbcard::before,.sheet::before{display:none!important;}\n.card{border-radius:16px!important;}\n@media (max-width:760px){ .card{border-radius:14px!important;} }\nhtml:not([data-theme=\"hell\"]) .card.svcock{background:var(--surface2)!important;border-color:var(--line)!important;box-shadow:none!important;}\nhtml[data-theme=\"hell\"] body .card.svcock{background:var(--surface2)!important;border-color:var(--line)!important;box-shadow:none!important;}\n.card.svcock .svc-h h3{background:none!important;-webkit-background-clip:unset!important;background-clip:unset!important;color:var(--ink)!important;}\n.svc-a{background:var(--surface2)!important;border:1px solid var(--line)!important;box-shadow:none!important;}\n.svc-a svg{width:22px!important;height:22px!important;padding:0!important;border-radius:0!important;background:none!important;color:var(--brand2)!important;box-shadow:none!important;}\nhtml[data-theme=\"hell\"] body .svc-a svg{color:var(--brand)!important;}\n\n/* Text: kein Verlauf, keine durchsichtige Schrift */\n.hello h2 span,html:not([data-theme=\"hell\"]) .hello h2 span,html[data-theme=\"hell\"] body .hello h2 span,\n.kpi,.stat,.tile b,.spt-kopf h2 span,.g-copy h1 span{\n  background:none!important;-webkit-background-clip:unset!important;background-clip:unset!important;color:var(--ink)!important;-webkit-text-fill-color:currentColor;}\n.hello h2 span{color:var(--brand2)!important;}\nhtml[data-theme=\"hell\"] body .hello h2 span{color:var(--brand)!important;}\n\n/* Rollen-Chip und Avatar: eine Farbe */\n.rolechip.r-admin,.rolechip.r-vorstand,.rolechip.r-trainer,.rolechip.r-planer{background:var(--brandSoft)!important;border-color:var(--line)!important;box-shadow:none!important;}\n.uav,.uav.r-admin{background:var(--brand)!important;color:#fff!important;box-shadow:none!important;border:0!important;}\n\n/* Kopfleiste: deckend, Haarlinie unten */\nhtml:not([data-theme=\"hell\"]) .topbar{background:var(--bg)!important;border-bottom:1px solid var(--line)!important;}\nhtml[data-theme=\"hell\"] body .topbar{background:var(--bg)!important;border-bottom:1px solid var(--line)!important;}\n.topbar{backdrop-filter:none!important;-webkit-backdrop-filter:none!important;}\n.topbar::after{display:none!important;}\n.tb-icon{width:44px!important;height:44px!important;border-radius:12px!important;}\n.tb-me{min-width:44px;min-height:44px;display:none;place-items:center;}\n@media (max-width:760px){ .tb-me{display:grid;} }\n.tb-crest{filter:none!important;}\n\n/* Knöpfe: Vereinsblau, flach. Dunkler als bisher, damit weiße Schrift 4,5:1 erreicht */\nhtml:not([data-theme=\"hell\"]){--brand:#2a5fe6;}\n.btn{background:var(--brand)!important;border:1px solid transparent!important;box-shadow:none!important;color:#fff!important;}\n.btn:hover{filter:brightness(1.08);}\nhtml:not([data-theme=\"hell\"]) .btn.ghost{background:var(--surface2)!important;border:1px solid var(--line)!important;box-shadow:none!important;color:var(--ink)!important;}\nhtml[data-theme=\"hell\"] body .btn.ghost{background:var(--surface2)!important;border:1px solid var(--line)!important;box-shadow:none!important;color:var(--ink)!important;}\n.btn.ghost:hover{border-color:var(--brand2)!important;filter:none;}\n.btn.sm{min-height:36px!important;}\n.rm-ic,.rm-ic.co{background:var(--brandSoft)!important;color:var(--brand2)!important;border:1px solid var(--line)!important;box-shadow:none!important;}\nhtml[data-theme=\"hell\"] body .rm-ic,html[data-theme=\"hell\"] body .rm-ic.co{color:var(--brand)!important;}\n\n/* Untere Leiste: angedockt, deckend, Haarlinie oben, Mindesthöhe 48 je Reiter. body:not(#_) schlägt die älteren Schichten (svm53) */\n@media (max-width:760px){\n  html body:not(#_) .tabbar{left:0!important;right:0!important;bottom:0!important;border-radius:0!important;padding:6px 4px calc(6px + env(safe-area-inset-bottom))!important;\n    border:0!important;border-top:1px solid var(--line)!important;box-shadow:none!important;backdrop-filter:none!important;-webkit-backdrop-filter:none!important;background:var(--surface)!important;}\n  html body:not(#_) .tabbar .ti,html body:not(#_) .tabbar .tmore{border-radius:10px!important;min-height:48px;padding:6px 2px 4px!important;font-size:11px!important;background:none!important;box-shadow:none!important;}\n  html body:not(#_) .tabbar .ti.active{color:var(--brand2)!important;}\n  html[data-theme=\"hell\"] body:not(#_) .tabbar .ti.active{color:var(--brand)!important;}\n  html body:not(#_) .tabbar .ti.active svg{color:currentColor!important;}\n  html body:not(#_) .tabbar .ti.active::after{display:none!important;}\n  html body:not(#_) main{padding-bottom:calc(84px + env(safe-area-inset-bottom))!important;}\n}\n\n/* Listen und Leisten: flach */\nhtml:not([data-theme=\"hell\"]) .kal-it,html:not([data-theme=\"hell\"]) .og-p,html:not([data-theme=\"hell\"]) .og-karte,html:not([data-theme=\"hell\"]) .row{background:var(--surface2)!important;border:1px solid var(--line)!important;box-shadow:none!important;}\nhtml[data-theme=\"hell\"] body .kal-it,html[data-theme=\"hell\"] body .og-p,html[data-theme=\"hell\"] body .og-karte,html[data-theme=\"hell\"] body .row{background:var(--surface2)!important;border:1px solid var(--line)!important;box-shadow:none!important;}\n.kal-bar{background:var(--c,var(--brand2))!important;box-shadow:none!important;}\n.card h3.trh::before,.kal-hh h3::before{background:var(--brand2)!important;}\n.svc-ins .note{background:var(--surface2)!important;border:1px solid var(--line)!important;}\n.online .lbl,.gsearch input,.fbar,.og-filter{background:var(--surface2)!important;border:1px solid var(--line)!important;box-shadow:none!important;}\n.og-filter button.on,.fbar .on{background:var(--brand)!important;color:#fff!important;box-shadow:none!important;}\n.og-ring .fg{stroke:var(--brand2);}\n\n/* Blätter und Dialoge: flach */\nhtml:not([data-theme=\"hell\"]) .sheet{background:var(--surface)!important;border-top:1px solid var(--line)!important;box-shadow:0 -8px 30px rgba(0,0,0,.4)!important;border-radius:18px 18px 0 0!important;}\nhtml[data-theme=\"hell\"] body .sheet{background:var(--surface)!important;border-top:1px solid var(--line)!important;box-shadow:0 -8px 30px rgba(60,45,20,.12)!important;border-radius:18px 18px 0 0!important;}\n.sheet h4::before{display:none!important;}\n.sheet h4{margin:12px 4px 6px!important;font-size:11.5px!important;letter-spacing:.06em;text-transform:uppercase;color:var(--ink3)!important;}\n.sgrid button{border-radius:12px!important;}\n.w5-gruss{display:none!important;}\n\n\n/* Keine Leuchtschatten mehr, egal wo */\n.g-orb,.g-art::before,.g-art::after{display:none!important;}\n.spt-mic,.spt-av,.spt-home-mic,.spt-iv-mic{background:var(--brand)!important;box-shadow:none!important;border:0!important;}\n\n/* Erklärkästen: flach, eine Zeile wenn zu */\n.info50{background:var(--surface2)!important;border:1px solid var(--line)!important;border-radius:12px!important;}\n.info50-h{color:var(--ink2)!important;}\n\n/* Suche am Handy: eigener, deckender Bildschirm statt durchsichtiger Ebene über der Seite */\n@media (max-width:760px){\n  .gsearch.mopen{position:fixed!important;inset:0!important;width:auto!important;z-index:80!important;display:flex!important;flex-direction:column;\n    padding:calc(12px + env(safe-area-inset-top)) 14px calc(12px + env(safe-area-inset-bottom));background:var(--bg)!important;}\n  .gsearch.mopen::before{display:none!important;}\n  .gsearch.mopen>svg{left:28px!important;top:calc(12px + env(safe-area-inset-top) + 25px)!important;}\n  .gsearch.mopen input{background:var(--surface2)!important;box-shadow:none!important;min-height:50px;padding-left:42px!important;}\n  .gsearch.mopen .gres{display:block!important;position:static!important;flex:1;max-height:none!important;margin-top:10px;padding:0!important;\n    background:transparent!important;border:0!important;box-shadow:none!important;overflow:auto;}\n  .gsearch.mopen .gres>*{min-width:0;}\n}\n.su-ber .su-ber-ic{width:36px;height:36px;border-radius:10px;display:grid;place-items:center;background:var(--brandSoft);color:var(--brand2);flex:none;}\n.su-ber .su-ber-ic svg{width:18px;height:18px;}\n\n/* „Nur du bist gerade online“: Anwesenheit nur zeigen, wenn wirklich jemand da ist (svm41.js setzt .allein) */\n.online.allein,.online-chip.allein{display:none!important;}\n\n/* Kopfzeile am Handy: drei Knöpfe rechts, der Titel darf kleiner werden statt abgeschnitten */\n@media (max-width:760px){\n  #pgTitle{font-size:clamp(17px,5.2vw,21px)!important;letter-spacing:-.02em;}\n  /* Wie bei Apple: am Handy Titel statt Wappen in der Kopfzeile, damit „Mannschaftskasse“ oder „Spieltagsstudio“ ganz passt */\n  html body:not(#_) .topbar .tb-crest{display:none!important;}\n  html body:not(#_) .topbar{gap:8px!important;}\n  body:has(.gsearch.mopen) .tabbar{display:none!important;}\n}\n\n/* Offline-Hinweis oben, deckend, ruhig */\n#sv68off{position:fixed;left:0;right:0;top:0;z-index:90;padding:calc(8px + env(safe-area-inset-top)) 16px 8px;background:#3a2a06;color:#fde68a;font-size:13.5px;line-height:1.4;\n  transform:translateY(-100%);transition:transform .25s var(--ease);border-bottom:1px solid rgba(251,191,36,.3);}\n#sv68off.an{transform:none;}\nhtml[data-theme=\"hell\"] body #sv68off{background:#fff4d6;color:#6b4a00;border-bottom-color:rgba(201,138,4,.35);}\n\n/* Knöpfe auch im hellen Modus flach (svhell.css setzt dort einen Verlauf) */\nhtml body:not(#_) .btn:not(.ghost){background:var(--brand)!important;background-image:none!important;box-shadow:none!important;}\nhtml body:not(#_) .trfab{display:none!important;}\n\n/* Kontrast (4,5:1): Stellen, die der Test im hellen und dunklen Modus findet */\n.tk-modus button.on{background:var(--brand)!important;color:#fff!important;box-shadow:none!important;}\nhtml[data-theme=\"hell\"] body .ht-tx small.ht-heute,html[data-theme=\"hell\"] body .mn-views .mn-add{color:#9a4508!important;}\nhtml[data-theme=\"hell\"] body .kal-tag{color:color-mix(in srgb,var(--c) 40%,#1b2235)!important;}\nhtml[data-theme=\"hell\"] body .rolechip{color:#1f45b5!important;}\n.kbhome small{color:var(--ink2)!important;}\n.kbhome.kbinv{background:var(--surface2)!important;border-color:var(--line)!important;box-shadow:none!important;}\n/* Hell: Status-Knöpfe in der Firmenakte behalten ihre Vereinsfarben (die automatische Übersetzung machte sie weiß auf weiß) */\nhtml[data-theme=\"hell\"] body .spo-akte .spo-stbar button.on{background:#1d2760!important;color:#fff!important;}\nhtml[data-theme=\"hell\"] body .spo-akte .spo-stbar button.on.s-partner{background:#e8741f!important;color:#1c1c22!important;}\n\n/* Tipp-Ziele am Touchscreen mindestens 44 x 44 (Apple) */\n@media (pointer:coarse){ .iconbtn{min-width:44px!important;min-height:44px!important;} }\n/* Kontrast hell und dunkel: Akzent als Schrift dunkler, aktive Umschalter mit Vereinsblau statt Hellblau */\nhtml[data-theme=\"hell\"] body{--accent:#a34a0c;--orange:#a34a0c;}\n.hub-in .mn31-sw button.act,.hf-filter button.on{background:var(--brand)!important;border-color:var(--brand)!important;color:#fff!important;}\n.hf-filter button.on i{color:#fff!important;}\nhtml[data-theme=\"hell\"] body .svt-chips button.on{background:var(--brand)!important;color:#fff!important;border-color:var(--brand)!important;}\nhtml[data-theme=\"hell\"] body .pbcard .what{color:var(--accent)!important;}\n.hf-filter button:not(.on) i{color:var(--ink2)!important;}\nhtml[data-theme=\"hell\"] .imp-okt{color:#15803d}\n"; document.head.appendChild(s); }catch(e){} })();
/* =====================================================================
   Sportzentrale Beta 0.40 · Mein Spieltag
   Ein eigener Bereich für die Spieltag-Verantwortung (Rolle „spieltag“, zurzeit Jürgen Möhler):
   - Großer Mikrofon-Knopf: „Hallo Jürgen, was hast du alles erledigt? Was muss noch gemacht werden?“ Sprechen, fertig.
     Sprache zu Text läuft im Browser (SpeechRecognition), die KI auf dem Server sortiert das Gesagte in die Checkliste
     (abgehakt, neu, Notizen) und merkt sich Erfahrungswissen für Nachfolger. Gespeichert wird erst nach einem Tipp auf „Passt“.
   - Nächstes Heimspiel mit Fortschritt, offene Punkte nach Vorher / Am Tag / Danach, Nachbereitung des letzten Spiels.
   - Push: zwei Tage vorher am späten Nachmittag und gut zwei Stunden nach Anpfiff, beide öffnen direkt die Ansage.
   - Wissen: Merksätze je Thema, von Hand oder aus Ansagen, mit „Übergabe“ als Text für Nachfolger.
   - Kein Mikrofon (alter Browser, keine Freigabe): Tastatur-Diktat im Textfeld, gleicher Weg.
   ===================================================================== */
/* Beta 0.41 · Jürgens Teilbereich: sein ganzes Aufgabenpaket aus dem Konzept 2030 (Heimspiel, Sportplatzkasse, Schiedsrichter,
   Spielbetrieb, Sportgelände, Kontakte) mit Übergabe-Stand je Aufgabe und einem Interview: die App stellt eine Frage nach der anderen,
   er antwortet ins Mikrofon, daraus werden Merksätze für den Nachfolger. Eigener Eintrag in der Seitenleiste. */
const SPT={alle:{},C:null,darf:null,eigen:false,laedt:false,rec:null,an:false,text:'',zwischen:'',erg:null,liste:null,start:0,vorlesen:true,tts:null,busy:false,sicht:'alle',modus:null};
try{ SPT.eigen=localStorage.getItem('svbc-spt-eigen')==='1'; }catch(e){}
// Aufgabenpaket „Spieltag & Spielbetrieb“ (Abteilungskonzept 2030). t = Thema der Merksätze, a = ältere Themen, die mitzählen, f = Interview-Fragen
const SPT_AUFG=[
  ['Heimspiel',[
    {k:'heimspiel',ic:'🏟️',t:'Heimspiel organisieren',d:'Ablauf, Helfer, Zeiten, wer was macht',a:['Helfer','Heimspiel','Ablauf'],
      f:['Wann fängst du vor einem Heimspiel an, und was machst du als Erstes?','Wie bekommst du die Helfer für Kasse, Ausschank und Grill zusammen, und wen fragst du zuerst?','Was geht am Spieltag am häufigsten schief, und wie fängst du es ab?']},
    {k:'kasse',ic:'💶',t:'Sportplatzkasse & Wechselgeld',d:'Eintritt, Wechselgeld, Abrechnung',a:['Kasse','Wechselgeld','Eintritt'],
      f:['Woher kommt das Wechselgeld, und wie viel brauchst du an einem normalen Spieltag?','Wer zählt nach dem Spiel ab, und wo kommt das Geld dann hin?','Was kostet der Eintritt, und wer kommt umsonst rein?']},
    {k:'schiri',ic:'🟨',t:'Schiedsrichter betreuen',d:'Begrüßung, Kabine, Getränke, Spesen',a:['Schiri','Schiedsrichter','Spesen'],
      f:['Was bekommt der Schiedsrichter von uns, von der Ankunft bis zur Abfahrt?','Wie zahlst du die Spesen aus, und wo kommt die Quittung hin?']},
    {k:'bewirtung',ic:'🍺',t:'Bewirtung',d:'Ausschank, Grill, Kiosk, Einkauf',a:['Gastro','Bewirtung','Grill','Einkauf'],
      f:['Wer kauft für den Spieltag ein, und wo?','Wie ist das mit Ausschank und Grill geregelt, wer macht was?']}]],
  ['Spielbetrieb',[
    {k:'meldung',ic:'📋',t:'Mannschaften melden & Spielplan',d:'Meldung, Spielplan, Anstoßzeiten',a:['Spielplan','Meldung'],
      f:['Wann und wo meldest du die Mannschaften für die neue Saison?','Wer legt die Anstoßzeiten fest, und worauf muss man dabei achten?']},
    {k:'verlegung',ic:'📅',t:'Spiele verlegen',d:'Antrag, Fristen, Absprache mit dem Gegner',a:['Spielverlegung','Verlegung'],
      f:['Wie läuft eine Spielverlegung ab, Schritt für Schritt?','Welche Fristen gibt es, und wen musst du fragen?']},
    {k:'schiriwesen',ic:'🧑‍⚖️',t:'Schiedsrichterwesen',d:'Schiri-Soll, Ansetzungen, Ansprechpartner',a:['Schiedsrichterwesen','Ansetzung'],
      f:['Wie viele Schiedsrichter muss der Verein stellen, und wer kümmert sich darum?','Was machst du, wenn kein Schiedsrichter kommt?']},
    {k:'dfbnet',ic:'💻',t:'DFBnet & Spielbericht',d:'Aufstellung, Freigabe, Passwesen',a:['DFBnet','Spielbericht','Pässe'],
      f:['Wer trägt den Spielbericht im DFBnet ein und gibt ihn frei?','Was tust du, wenn am Platz das Internet nicht geht?']}]],
  ['Sportgelände',[
    {k:'platz',ic:'🥅',t:'Platz, Tore & Netze',d:'Mähen, Markieren, Instandhaltung',a:['Platz','Netze','Tore'],
      f:['Was muss regelmäßig am Platz gemacht werden, und wer macht es?','Wo bekommt man Ersatz für Netze, Eckfahnen und Bälle?']},
    {k:'gelaende',ic:'🧹',t:'Sauberkeit & Arbeitseinsätze',d:'Kabinen, Gelände, Aufräumen',a:['Kabinen','Gelände','Sauberkeit','Arbeitseinsatz'],
      f:['Wer putzt die Kabinen, und wie oft?','Wann lohnt sich ein Arbeitseinsatz, und wie trommelst du die Leute zusammen?']},
    {k:'schluessel',ic:'🔑',t:'Schlüssel, Flutlicht & Technik',d:'Wer hat welchen Schlüssel, wie geht was an',a:['Schlüssel','Flutlicht','Technik'],
      f:['Wer hat welche Schlüssel, und wo liegen die Ersatzschlüssel?','Wie schaltet man Flutlicht, Anzeigetafel und Lautsprecher an?']}]],
  ['Kontakte',[
    {k:'kontakte',ic:'📞',t:'Wichtige Kontakte',d:'Gemeinde, Kreis, Verband, Lieferanten, Notfall',a:['Kontakte','Notfall'],
      f:['Wen rufst du an, wenn am Platz etwas kaputt ist?','Welche Ansprechpartner bei Gemeinde, Kreis und Verband sollte dein Nachfolger kennen?']}]]];
const SPT_ALLE=SPT_AUFG.flatMap(g=>g[1]);
const sptAufgWissen=(a,W)=>(W||[]).filter(w=>w.thema===a.t||(a.a||[]).some(x=>x.toLowerCase()===String(w.thema||'').toLowerCase()));
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
    // Annahme: zwei amtliche Quellen einig > Trainereintrag > eine Quelle > Startelf-Zahl > FuPa (am genauesten; fussball.de kennt keine Auswechslungen)
    let st=null, t=null, warum='';
    if(fP&&bP&&f.st===b.st){ st=f.st; warum='FuPa und fussball.de einig'; }
    else if(aP&&trainer(a.src)){ st=a.st; warum='Eintrag des Trainerteams'; }
    else if(fP&&!bP){ st=f.st; warum=fbL?'nur FuPa kennt ihn':'nur FuPa'; }
    else if(bP&&!fP){ st=b.st; warum=fuL?'nur fussball.de kennt ihn':'nur fussball.de'; }
    else if(fP&&bP){ if(S.fu===11&&S.fb!==11){ st=f.st; warum='FuPa hat eine vollständige Startelf'; } else if(S.fb===11&&S.fu!==11){ st=b.st; warum='fussball.de hat eine vollständige Startelf'; } else { st=f.st; warum='FuPa (am genauesten)'; } }
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
