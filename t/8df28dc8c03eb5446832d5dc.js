    o.comps=[{k:'prod',t:'Leistung',v:Math.round(sv94C(50+J.ev[0].prod*8,0,100)),w:0,art:'auto',basis:`${J.ev[0].tore} Tore in ${J.ev[0].n||'–'} Spielen (${svEsc(J.ev[0].lv)}), Jugend-Niveau ${sv94N(J.ev[0].L)} auf der Skala der Aktiven`,warum:'Die Jugendliga wird über ihr Liga-Gewicht auf die Skala der Aktiven umgerechnet.'},
      {k:'pot',t:'Potenzial',v:J.pot==null?r.pot:Math.round(J.pot),w:0,art:'auto',basis:'erwarteter Höchstwert mit normaler Entwicklung',warum:'Junge Spieler legen bis Mitte 20 deutlich zu.'}];
    SV94.cache.set(ckj,o); return o; }
  const mo=typeof mvpOf==='function'?mvpOf(p):null;
  const ck=p.id+'|'+SV4.gen+'|'+r.total+'|'+(r.eye==null?'':r.eye)+'|'+(mo?mo.v:''); const hit=SV94.cache.get(ck); if(hit)return hit;
  if(SV94.cache.size>8000)SV94.cache.clear();
  let S=null; try{ S=sv94Score(p,r); }catch(e){ console.warn('MScore 4',p.id,e); }
  if(!S)return r;
  const o=Object.assign({},r), m=S.main;
  o.alt=r.total; o.total=S.total; o.m4=S; o.mvp=S.mvp; o.mvpAdj=0;
  o.share=Math.round(m.q*100); o.prod=Math.round(m.lei*100); o.ctx=Math.round(m.t*100);
  const pctTxt=m.pct!=null?`besser als ${Math.round(m.pct*100)} % der ${SV94_GRUPPE_T[S.grp]} in der ${sv94LN(m.lv)}`:'zu wenig Vergleichsdaten, neutral';
  const mtT=typeof svmMt==='function'&&p.pos?SVM_MT[svmMt(p)]:null, Q=typeof svmEindruecke==='function'?svmEindruecke(p):null;
  const qv=x=>x&&x.avg!=null?Math.round(sv94C(50+(3-x.avg)*25,0,100)):null;
  const ew=S.ev.map(s=>`${s.y} ${Math.round(s.anteil*100)} %`).join(', ');
  o.comps=[
    {k:'level',t:'Einsatz',v:o.share,w:0,art:'auto',basis:m.qEst?'Einsatzquote geschätzt':`Einsatzquote ${o.share} % in ${m.y}. Saisons zählen: ${ew}`,warum:'Laufende Saison und die drei Spielzeiten davor, jüngere zählen mehr. Stammspieler liegen am Niveau ihrer Liga, Ergänzungsspieler darunter.'},
    {k:'prod',t:'Leistung'+(mtT?' ('+mtT+')':''),v:o.prod,w:0,art:'auto',basis:(S.grp==='def'?'Gegentore der Mannschaft im Verhältnis zur Liga, ':`${sv94N(m.raw||0,2)} Tore je Spiel (Vorlagen halb), `)+pctTxt,warum:'Verglichen wird nur mit Spielern derselben Liga und desselben Mannschaftsteils, über dieselben vier Spielzeiten wie beim Einsatz.'},
    {k:'pot',t:'Potenzial',v:S.pot==null?r.pot:Math.round(S.pot),w:0,art:'auto',basis:p.alter!=null?`Alter ${p.alter}, erwarteter Höchstwert`:'Alter unbekannt',warum:'Was mit normaler Entwicklung bis Mitte 20 noch drin ist.'},
    {k:'scout',t:'Eye-Test',v:r.eye==null?null:Math.round(r.eye),w:0,art:'manuell',basis:r.eyeE?`Ø aus ${r.eyeE.n} Bewertung${r.eyeE.n>1?'en':''}`:'noch kein Eye-Test',warum:'Eigene Messung auf derselben Skala, zählt bei mehreren Planern stärker.'}];
  if(p.own&&!p.isJugend&&(typeof mnIsIntern!=='function'||mnIsIntern(p)))o.comps.push(
    {k:'trn',t:'Trainingsleistung',v:qv(Q&&Q.trn),w:0,art:'manuell',basis:Q&&Q.trn&&Q.trn.n?`${Q.trn.n} Eindrücke im Training: ${Q.trn.pos} positiv, ${Q.trn.neu} neutral, ${Q.trn.neg} negativ`:'noch keine Eindrücke aus dem Training',warum:'Eindruck des Trainers je Einheit. Zählt ab drei echten Bewertungen, angenommene Werte zählen nicht.'},
    {k:'spl',t:'Spielleistung',v:qv(Q&&Q.spl),w:0,art:'manuell',basis:Q&&Q.spl&&Q.spl.n?`${Q.spl.n} Eindrücke im Spiel: ${Q.spl.pos} positiv, ${Q.spl.neu} neutral, ${Q.spl.neg} negativ`:'noch keine Eindrücke aus Spielen',warum:'Eindruck des Trainers je Spiel, nur wenn er gespielt hat.'});
  o.sum=100;
  const known={liga:true,level:!m.qEst,prod:m.pct!=null&&m.n>=6,scout:r.eye!=null};
  const wk={liga:25,level:25,prod:25,scout:25}; let a=0,k=0; Object.keys(wk).forEach(x=>{ a+=wk[x]; if(known[x])k+=wk[x]; });
  o.basis=Math.round(k/a*100); o.basisK=known;
  SV94.cache.set(ck,o); return o;
}; }
{ const _rb94=renderAll; renderAll=function(){ SV94.cache.clear(); SV94.dist=null; return _rb94.apply(this,arguments); }; }
if(typeof SV4_CL!=='undefined')Object.assign(SV4_CL,{liga:'Liga',level:'Einsatz',prod:'Leistung',scout:'Eye-Test',mvp:'FuPa-MVP'});

/* ---------- Profil: so entsteht die Spielstärke ---------- */
function sv94SeasonHtml(s){
  const teile=[`Liga-Niveau ${s.L}`,`Rolle ${sv94Pm(s.role)}`,`Leistung ${sv94Pm(s.prod)}`];
  if(s.dom)teile.push(`Ausnahmeleistung ${sv94Pm(s.dom)}`); if(s.mvp!=null)teile.push(`MVP ${s.mvp}: ${sv94Pm(s.mvpOff)}`); if(s.sds)teile.push(`Elf der Woche ${sv94Pm(s.sds)}`);
  const kopf=[s.n?`${s.n}${s.app?' von '+s.app.G:''} Spiele${s.qEst?' (geschätzt)':''}`:'keine Einsätze bekannt', s.app&&s.app.min!=null?`${s.app.min.toLocaleString('de-DE')} Min.`:null, `${s.tore||0} Tore`, s.ast?`${s.ast} Vorlagen`:null, s.rank!=null?`Platz ${s.rank}`:null, s.app?'aus euren Spielen':null].filter(Boolean).join(', ');
  return `<div class="m94-s${s.decke?' decke':''}"><div class="m94-sh"><b>${svEsc(s.y)} · ${svEsc(sv94LN(s.lv))}</b><span>${svEsc(kopf)}</span></div>
    <div class="m94-sv"><b style="color:${tierColor(s.Eh)}">${sv94N(s.Eh)}</b><small>zählt ${Math.round(s.anteil*100)} %</small></div>
    <p>${svEsc(teile.join(', '))}${Math.abs(s.alt)>=0.1?`, auf heute gealtert ${sv94Pm(s.alt)}`:''}</p>
    ${s.decke?`<p class="m94-note">${s.decke>=0.8?'Zählt kaum':'Zählt weniger'}: In der ${svEsc(sv94LN(s.lv))} spielt er vorne mit, nach oben kann er dort nicht mehr zeigen. Maßgeblich ist die höhere Liga (${sv94N(s.Po)}).</p>`:''}</div>`;
}
function sv94AltTxt(S,p){ if(p.alter==null)return 'Alter unbekannt'; const r=S.rate; return r>0?`${p.alter} Jahre, legt noch zu (${sv94Pm(r)} je Jahr)`:r<0?`${p.alter} Jahre, baut ab (${sv94Pm(r)} je Jahr, Tempo lässt nach)`:`${p.alter} Jahre, beste Jahre`; }
{ const _ph94=pf4ScoreHtml; pf4ScoreHtml=function(p,s){
  const o=scores(p), S=o&&o.m4; if(!S)return _ph94.apply(this,arguments);
  const tc=tierColor(o.total), pot=S.pot!=null&&S.pot-S.total>=1?S.pot:null;
  const mvpCan=false;   // 0.42: FuPa-MVP ist raus
  return `<div class="pf4-sc m94">
    <div class="m94-top"><div><small>Spielstärke</small><b style="color:${tc}">${sv94N(o.total)}</b></div>${pot?`<div><small>Potenzial</small><b style="color:${tierColor(pot)}">${sv94N(pot)}</b></div>`:''}${S.prog!=null&&Math.abs(S.prog-S.total)>=0.5&&S.man==null?`<div><small>Prognose ${sv94Next()}</small><b style="color:${tierColor(S.prog)}">${sv94N(S.prog)}</b></div>`:''}<div class="m94-age"><small>Alter</small><span>${svEsc(sv94AltTxt(S,p))}</span></div></div>
    <div class="m94-h">Woraus sich der Wert ergibt</div>
    ${S.jugend?`<p class="m94-hint">Jugendspieler: Die Jugendliga ist auf die Skala der Aktiven umgerechnet. Aussagekräftiger ist hier oft das Potenzial.</p>`:''}
    ${S.ev.map(sv94SeasonHtml).join('')}
    ${S.Wp>0.01?`<div class="m94-s"><div class="m94-sh"><b>Wenig Daten</b><span>Annahme: Ergänzungsspieler der ${svEsc(sv94LN(S.lvNow))}</span></div><div class="m94-sv"><b>${sv94N(S.prior)}</b><small>zählt ${Math.round(S.priorAnteil*100)} %</small></div></div>`:''}
    ${S.eye!=null?`<div class="m94-s eye"><div class="m94-sh"><b>Eye-Test</b><span>${S.en} Bewertung${S.en>1?'en':''} eurer Planer</span></div><div class="m94-sv"><b style="color:${tierColor(S.eye)}">${sv94N(S.eye)}</b><small>zählt ${Math.round(S.eyeAnteil*100)} %</small></div></div>`:`<p class="m94-hint">Noch kein Eye-Test. Eine Bewertung zählt hier sofort rund ein Drittel bis die Hälfte.</p>`}
    <div class="m94-line"><span>Gewichteter Schnitt</span><b>${sv94N(S.base)}</b></div>
    ${S.adj.map(([k,t,v,d])=>`<div class="m94-line add"><span>${svEsc(t)} <small>${svEsc(d)}</small></span><b class="${v>0?'ok':'bad'}">${sv94Pm(v)}</b></div>`).join('')}
    ${S.man!=null?`<div class="m94-line add"><span>Insider-Rating <small>von der Sportlichen Leitung festgelegt</small></span><b>${sv94Pm(S.man)}</b></div>`:''}
    <div class="m94-line tot"><span>MScore</span><b style="color:${tc}">${sv94N(o.total)}</b></div>
    ${mvpCan?`<div class="m94-mvp"><label for="m94mvp">MVP von Hand ${svEsc(S.mvpK==='cur'?sv4SL(sv4S()):'25/26')} <small>Eigener Eintrag (z. B. von FuPa → Team → Spielerstatistik abgeschrieben), hat Vorrang vor dem MVP der Quelle. Leer lassen, wenn die Quelle den Wert liefert.</small></label><div><input type="number" min="0" max="100" step="1" inputmode="numeric" id="m94mvp" value="${S.mvp==null?'':S.mvp}" placeholder="leer"><button class="btn sm" id="m94mvpGo" data-pid="${svEsc(p.id)}">Speichern</button></div></div>`:''}
    </div>
    <p class="bs70 b-${typeof sv70BasisTxt==='function'?sv70BasisTxt(o.basis):'mittel'}"><b>Datenbasis ${o.basis} %</b>${!o.basisK.scout?' · noch kein Eye-Test':''}${!o.basisK.level?' · Einsatzzeit geschätzt':''}</p>
    <p class="note small">Wie bei FIFA beschreibt der Wert, wie gut ein Spieler ist, nicht wo er gerade spielt. Jede Saison ist ein Beleg, ältere zählen weniger und werden mit der Alterskurve auf heute gerechnet. Vereinstreue zählt nicht in den MScore.</p>`;
}; }
document.addEventListener('click',e=>{ const b=e.target.closest&&e.target.closest('#m94mvpGo'); if(!b)return;
  const i=document.getElementById('m94mvp'), pid=b.dataset.pid; if(!pid||!i)return;
  const raw=i.value.trim();
  if(raw===''){ crmSet(pid,{mv:undefined,mvd:undefined}); }
  else { const v=Math.round(+raw); if(isNaN(v)||v<0||v>100){ kToast('Bitte 0 bis 100 eintragen'); return; } crmSet(pid,{mv:v,mvd:new Date().toISOString().slice(0,10)}); }
  SV94.cache.clear(); kToast('FuPa-MVP gespeichert, Wert neu berechnet'); try{ openModal(pid); }catch(err){}
});
// Karte: die kleinen Werte heißen jetzt wie die Bausteine
{ const _sr94=scRate; scRate=function(p){ const R=_sr94.apply(this,arguments); try{ if(R&&R.st&&!p.isJugend){ const M={ABS:'LEI',ANT:'EIN'}; R.st=R.st.map(([k,v])=>[M[k]||k,v]); } }catch(e){} return R; }; }

/* ---------- FuPa-MVP-Pflege (Datenbank): Vorschau mit dem neuen Modell ---------- */
if(typeof mvpPreviewCell==='function'){ mvpPreviewCell=function(p,raw){ const s=scores(p);
  if(p.adjTo!=null)return '<span class="kand-sub">Insider-Rating '+sv94N(s.total)+' (fix)</span>';
  const v=String(raw==null?'':raw).trim(); let nt=s.total;
  try{ const r=_sv94prev(p); const S=sv94Score(p,r,{mvp:v===''||isNaN(+v)?null:sv94C(Math.round(+v),0,100)}); if(S)nt=S.total; }catch(e){}
  const d=Math.round((nt-s.total)*10)/10; return sv94N(s.total)+(Math.abs(d)>=0.1?' → <b>'+sv94N(nt)+'</b> <span class="'+(d>0?'up':'dn')+'">'+sv94Pm(d)+'</span>':''); }; }
if(typeof renderMvpCard==='function'){ const _rm94=renderMvpCard; renderMvpCard=function(){ const r=_rm94.apply(this,arguments);
  try{ const el=document.getElementById('mvpCard'); if(el)el.querySelectorAll('summary .kand-sub').forEach(x=>{ x.innerHTML=x.innerHTML.replace(/fließt mit max\. ±6 % ins MScore/,'zählt im MScore als Beleg für die Rolle im Team'); }); }catch(e){}
  return r; }; }

/* ---------- Startseite: groß steht die Stärke, die Wechselchance daneben ---------- */
{ const _rh94=renderHome; renderHome=function(){ const r=_rh94.apply(this,arguments);
  try{ document.querySelectorAll('#homeCrm .rankrow[data-id], #homeWechsel .rankrow[data-id]').forEach(row=>{ const p=players.find(x=>x.id===row.dataset.id); if(!p)return; const s=scores(p), W=typeof wscoreSafe==='function'?wscoreSafe(p):null;
      const rk=row.querySelector('.rk'); if(rk){ rk.textContent=Math.round(s.total); rk.style.color=tierColor(s.total); rk.title='Stärke'; }
      row.querySelectorAll('.rn i').forEach(i=>{ i.innerHTML=i.innerHTML.replace(/Stärke \d+ · /,'').replace(/Transfer-Chance [\d.]+/g,W?`Wechsel-Index ${W.w} (Heuristik)`:'').replace(/ · Wechsel-Index \d+/,'').replace(/^ · /,''); }); });
    const n=document.querySelector('#homeWechsel .note'); if(n)n.innerHTML='Große Zahl = <b>Stärke</b>. Sortiert nach Wechsel-Index (Heuristik aus öffentlichen Signalen, keine Wahrscheinlichkeit), nur Spieler ab Stärke 45. Zeile antippen öffnet das Profil mit Begründung.';
  }catch(e){ console.warn('Home 0.9',e); }
  return r; }; }

/* ---------- Wissen → Modell ---------- */
if(typeof SV4_MODEL!=='undefined'){
  SV4_MODEL.length=0;
  SV4_MODEL.push(['level','Saisons als Belege','Jede Saison ergibt einen Wert: Liga-Niveau, dazu Rolle (Einsatzzeit), Leistung im Vergleich zu Spielern derselben Liga und Position, Tabellenplatz, Ausnahmeleistung, FuPa-MVP und Elf der Woche.'],
    ['prod','Gewichtung','Laufende Saison zählt am meisten, 25/26 etwas weniger, 24/25 halb. Wenige Spiele zählen weniger. Ältere Belege werden mit der Alterskurve auf heute gerechnet.'],
    ['ctx','Deckeneffekt','Wer in eine tiefere Liga wechselt und dort vorne mitspielt, verliert nicht automatisch. Nur wer dort Ergänzung ist, rutscht ab.'],
    ['scout','Eye-Test','Eigene Messung auf derselben Skala. Eine Bewertung zählt ungefähr so viel wie eine volle Saison, ab drei Planern mehr als die Daten.'],
    ['trainer','Trainernoten und Erfahrung','Trainernoten bis ±5, Erfahrung bis +2,6, sehr junge Spieler ohne Stammplatz −1,5.'],
    ['trend','Alter','Bis 24 legt man zu, 25 bis 28 bleibt es, ab 29 geht es bergab, ab 33 deutlich. Flügel, Außenverteidiger und Stürmer bauen schneller ab, Innenverteidiger und Torhüter langsamer.']);
}
{ const _mc94=sv4ModelCard; sv4ModelCard=function(){ const r=_mc94.apply(this,arguments);
  try{ const P=document.getElementById('panel-model'), c=P&&P.querySelector('.m4'); if(!c||c.querySelector('.m94r'))return r;
    const t=c.querySelector('table'); if(t){ const th=t.querySelectorAll('thead th'); if(th[1])th[1].textContent=''; [...t.querySelectorAll('tbody tr')].forEach(tr=>{ const td=tr.querySelectorAll('td'); if(td[0])td[0].innerHTML=''; }); }
    const h=c.querySelector('h3'); if(h)h.textContent='MScore 4: Spielstärke wie bei FIFA';
    const note=c.querySelector('p.note'); if(note)note.textContent='Der Wert beschreibt, wie gut ein Spieler ist, nicht in welcher Liga er gerade spielt. Jeder Wert ist im Spielerprofil Schritt für Schritt erklärt.';
    const alt=[18,20,22,24,27,30,32,34,36];
    c.insertAdjacentHTML('beforeend',`<div class="m94r"><h4>Liga-Niveau (typischer Stammspieler)</h4><div class="m94-g">${Object.entries(SV94_NIVEAU).filter(([l])=>LIGA_NAME[l]).map(([l,m])=>`<div><span>${svEsc(sv94LN(l))}</span><b>${m}</b></div>`).join('')}</div>
      <h4>Alterskurve (Punkte je Jahr)</h4><div class="m94-g">${alt.map(a=>`<div><span>${a} Jahre</span><b>${sv94Pm(sv94Rate(a,'ZM'))}</b><small>Flügel ${sv94Pm(sv94Rate(a,'Flügel'))}, IV ${sv94Pm(sv94Rate(a,'IV'))}</small></div>`).join('')}</div>
      <p class="note small">Beispiele: Ein 80er aus der Gruppenliga, der in die A-Liga wechselt und dort Stammspieler ist und trifft, bleibt nahe 80. Ein Stürmer der Kreisliga D mit drei Toren je Spiel landet um 60. Ein Ergänzungsspieler der Kreisoberliga liegt um 54, ein Stammspieler dort um 63.</p></div>`);
    c.querySelectorAll('.m90,.m90w,.m92r').forEach(x=>x.remove()); const thw=[...c.querySelectorAll('thead th')].find(x=>/Warum eigenständig/.test(x.textContent)); if(thw)thw.remove();
    document.querySelectorAll('#panel-model [data-w]').forEach(i=>{ const box=i.closest('.card'); if(box&&!box.classList.contains('m4'))box.hidden=true; });
  }catch(e){ console.warn('Modell 0.9',e); }
  return r; }; }
// Neue oder geänderte Spiele (z. B. FuPa-Import): Werte neu rechnen
if(typeof trLoad==='function'){ const _tl94=trLoad; trLoad=async function(){ const r=await _tl94.apply(this,arguments); try{ SV94.cache.clear(); }catch(e){} return r; }; }

/* =====================================================================
   Sportzentrale Beta 0.10 · Scouting → Bestenliste
   Die besten Spieler je Position, mit den Zahlen, die für diese Position zählen.
   Torwart und Abwehr: Gegentore der Mannschaft im Vergleich zur Liga, gewichtet mit der eigenen Spielzeit.
   Mittelfeld: Tore, Vorlagen und die Stärke der Mannschaft. Angriff: Tore, Tore je Spiel und Anteil an den Teamtoren.
   Jede Zeile sagt in einem Satz, warum der Spieler dort steht.
   ===================================================================== */
const BL93_POS={tw:{t:'Torwart',p:['TW'],grp:'def'},ab:{t:'Abwehr',p:['IV','AV'],grp:'def'},mf:{t:'Mittelfeld',p:['ZM','OM'],grp:'mid'},an:{t:'Angriff',p:['ST','Flügel'],grp:'off'}};
const BL93_LIGEN=[['alle','Alle Ligen'],['GL','Gruppenliga'],['KOL','Kreisoberliga'],['A','Kreisliga A'],['B','Kreisliga B'],['C','Kreisliga C'],['D','Kreisliga D']];
const BL93_ALTER=[['alle','Jedes Alter'],['u23','bis 23'],['u27','bis 27'],['a28','ab 28']];
// Sortierungen je Position: [Schlüssel, Bezeichnung, absteigend?]
const BL93_SORT={
  tw:[['ga','Gegentore',false],['st','Stärke',true],['q','Einsatz',true],['eye','Eye-Test',true],['note','Note',false]],
  ab:[['st','Stärke',true],['ga','Gegentore',false],['tore','Tore',true],['q','Einsatz',true],['eye','Eye-Test',true],['note','Note',false]],
  mf:[['st','Stärke',true],['sc','Scorer',true],['tore','Tore',true],['tps','Tore je Spiel',true],['eye','Eye-Test',true],['note','Note',false]],
  an:[['tore','Tore',true],['tps','Tore je Spiel',true],['anteil','Anteil Teamtore',true],['sc','Scorer',true],['st','Stärke',true],['eye','Eye-Test',true],['note','Note',false]]};
const BL93_WIE={
  tw:'Torhüter messen wir an den Gegentoren ihrer Mannschaft im Vergleich zum Schnitt ihrer Liga. Das zählt nur, wenn er auch regelmäßig im Tor stand, deshalb steht die Einsatzquote daneben. Wer weniger als die Hälfte der Spiele macht, gilt als Ersatz.',
  ab:'Abwehrspieler messen wir wie Torhüter an den Gegentoren der Mannschaft im Vergleich zur Liga, gewichtet mit ihrer Spielzeit. Tore und Vorlagen sind ein Zusatz, keine Hauptsache.',
  mf:'Mittelfeldspieler vergleichen wir mit Mittelfeldspielern derselben Liga, nicht mit Stürmern. Tore und Vorlagen zählen, dazu die Stärke der Mannschaft, weil das Mittelfeld das Spiel eines Teams trägt.',
  an:'Stürmer und Flügelspieler messen wir an Toren, Toren je Spiel und ihrem Anteil an den Toren der Mannschaft. Mit „ligabereinigt“ werden Tore je Spiel auf den Maßstab der Kreisliga A umgerechnet, damit man Ligen vergleichen kann.'};
const BL93={pos:'tw',liga:'alle',saison:'cur',alter:'alle',sort:null,eigene:true,berein:true,n:40};
const bl93N=(v,d=1)=>v==null||!isFinite(v)?'–':sv4Num(v,d);
function bl93GA(club,sk,liga){
  if(typeof clubFor!=='function'||!DATA.ligaGA)return null; const cl=clubFor(club), s=cl&&cl['s'+sk], lg=DATA.ligaGA[sk];
  if(!s||!s.spiele||s.gegentore==null||!lg)return null; const avg=lg[s.liga]||lg[liga]; if(!avg)return null;
  const ga=s.gegentore/s.spiele; return {ga,avg,ratio:ga/avg,spiele:s.spiele};
}
function bl93Row(p,cfg){
  if(!svScoutInScope(p))return null;
  const c=p.cur&&p.cur.spiele>0?p.cur:null, cur=BL93.saison==='cur';
  if(cur&&!c)return null;
  const jetzt=cur?svLigaJetzt(p):null, liga=cur?((jetzt&&jetzt.liga)||'unbekannt'):(p.sub||p.liga), codes=liga.split('/').map(ligaBase).filter(l=>!cur||svScoutLigaErlaubt(p,l)), lv=(BL93.liga!=='alle'?codes.find(x=>x===BL93.liga):codes[0]); if(!LIGA_NAME[lv])return null;
  if(BL93.liga!=='alle'&&lv!==BL93.liga)return null;
  const club=cur?((jetzt&&jetzt.club)||c.club||p.club):p.club, sk=cur?sv4S():'2526';
  let teamSp=cur?c.spiele:p.teamSp, sp=null, q=null, min=null, tore=cur?(c.tore||0):(p.tore||0), vor=null, tT=cur?(c.tT||null):(p.tT||null), est=false, quelle='';
  if(cur){ const A=typeof sv94AppSpiele==='function'?sv94AppSpiele(p):null;
    if(A){ teamSp=A.G; sp=A.sp; min=A.min; q=min!=null?Math.min(1,min/(A.G*90)):Math.min(1,A.sp/A.G)*0.92; tore=A.tore; vor=A.ast; quelle='eure Spiele'; }
    else if(p.club&&c.club===p.club&&(p.min||p.einsaetze)&&p.teamSp){ q=p.min?Math.min(1,p.min/(p.teamSp*90)):Math.min(1,p.einsaetze/p.teamSp)*0.92; est=true; } }
  else { sp=p.einsaetze||null; min=p.min||null; if(min&&teamSp)q=Math.min(1,min/(teamSp*90)); else if(sp&&teamSp)q=Math.min(1,sp/teamSp)*0.92; if(p.assists)vor=p.assists; }
  // Mindestdaten
  if(cur){ if(!teamSp||teamSp<3)return null; if(cfg.grp!=='off'&&q==null&&!tore)return null; }
  else { if(!sp||sp<8)return null; }
  const games=sp!=null?sp:(q!=null?Math.max(1,Math.round(teamSp*q)):teamSp);
  const tps=tore/Math.max(1,games), lw=LIGA_W[lv]||1;
  const G=cfg.grp==='def'?bl93GA(club,sk,liga):null;
  const s=scores(p), S=s.m4, ev=S&&S.ev?S.ev.find(e=>e.k===(cur?'cur':'base')):null;
  let note=null; try{ const N=p.own&&typeof sv70TrainerNoten==='function'?sv70TrainerNoten(p):null; if(N&&N.avg!=null)note={v:N.avg,n:N.n}; }catch(e){}
  const rank=cur?c.rank:p.rank, tc=cur?c.teamCount:p.teamCount;
  return {p,lv,club,teamSp,sp,games,q,est,quelle,min,tore,vor,sc:tore+(vor||0),tps,tpsB:tps*lw,anteil:tT?tore/tT:null,G,rank,tc,st:s.total,eye:s.eye!=null?s.eye:null,note,pct:ev&&ev.pct!=null?ev.pct:null,ersatz:q!=null&&q<0.5};
}
function bl93Val(r,k){
  switch(k){ case 'ga': return r.G?r.G.ratio+(r.ersatz?1:0):null; case 'st': return r.st; case 'q': return r.q; case 'eye': return r.eye; case 'note': return r.note?r.note.v:null;
    case 'tore': return r.tore; case 'tps': return BL93.berein?r.tpsB:r.tps; case 'anteil': return r.anteil; case 'sc': return r.sc; }
  return null;
}
function bl93Warum(r,cfg){
  const t=[], Ln=LIGA_NAME[r.lv]||r.lv;
  const ein=r.sp!=null?`${r.sp} von ${r.teamSp} Spielen${r.min?`, ${r.min.toLocaleString('de-DE')} Min.`:''}`:r.q!=null?`Einsatzquote ${Math.round(r.q*100)} %${r.est?' laut 25/26':''}`:`${r.teamSp} Spiele der Mannschaft, Einsätze unbekannt`;
  if(cfg.grp==='def'){
    t.push(ein);
    if(r.G){ const d=Math.round((1-r.G.ratio)*100); t.push(`Team ${bl93N(r.G.ga,2)} Gegentore je Spiel, ${Ln} ${bl93N(r.G.avg,2)} (${d>=0?d+' % weniger':(-d)+' % mehr'})`); }
    if(r.tore)t.push(`${r.tore} Tor${r.tore>1?'e':''}`);
  } else if(cfg.grp==='mid'){
    t.push(`${r.tore} Tor${r.tore===1?'':'e'}${r.vor!=null?`, ${r.vor} Vorlage${r.vor===1?'':'n'}`:''} in ${r.games} ${r.sp==null&&r.q==null?'Teamspielen':'Spielen'}`); t.push(ein);
  } else {
    t.push(`${r.tore} Tor${r.tore===1?'':'e'} in ${r.games} ${r.sp==null&&r.q==null?'Teamspielen':'Spielen'} (${bl93N(r.tps,2)} je Spiel${BL93.berein&&r.lv!=='A'?`, A-Liga-Maßstab ${bl93N(r.tpsB,2)}`:''})`);
    if(r.anteil!=null)t.push(`${Math.round(r.anteil*100)} % der Teamtore`);
  }
  if(r.rank!=null)t.push(`Platz ${r.rank}${r.tc?' von '+r.tc:''}`);
  if(r.pct!=null&&cfg.grp!=='def')t.push(`besser als ${Math.round(r.pct*100)} % der ${cfg.grp==='def'?'Abwehrspieler und Torhüter':cfg.grp==='mid'?'Mittelfeldspieler':'Offensivspieler'} der ${Ln}`);
  if(r.quelle)t.push('aus '+r.quelle);
  return t.join(' · ');
}
function bl93Render(){
  const P=document.getElementById('panel-best'); if(!P)return;
  const cfg=BL93_POS[BL93.pos], SO=BL93_SORT[BL93.pos]; if(!SO.some(x=>x[0]===BL93.sort))BL93.sort=SO[0][0];
  const sd=SO.find(x=>x[0]===BL93.sort), desc=sd[2];
  const alt=a=>BL93.alter==='alle'||(a!=null&&(BL93.alter==='u23'?a<=23:BL93.alter==='u27'?a<=27:a>=28));
  let R=players.filter(p=>svScoutInScope(p)&&!p.isJugend&&cfg.p.includes(p.pos)&&(BL93.eigene||!p.own)&&alt(p.alter)).map(p=>bl93Row(p,cfg)).filter(Boolean);
  const mitV=R.some(r=>r.vor!=null);
  const vK=r=>bl93Val(r,BL93.sort);
  R.sort((a,b)=>{ const x=vK(a),y=vK(b); if(x==null&&y==null)return b.st-a.st; if(x==null)return 1; if(y==null)return -1; return (desc?y-x:x-y)||(b.st-a.st); });
  const L=R.slice(0,BL93.n);
  const chip=(attr,cur,list)=>list.map(([k,t])=>`<button type="button" class="${cur===k?'on':''}" data-${attr}="${k}">${t}</button>`).join('');
  const colH=[]; const col=(t,f,k)=>colH.push([t,f,k]);
  if(cfg.grp==='def'){ col('Einsatz',r=>r.q!=null?`${Math.round(r.q*100)} %${r.est?'*':''}${r.ersatz?' <b class="bl93-e">Ersatz</b>':''}`:'–','q'); col('Gegentore je Spiel',r=>r.G?`${bl93N(r.G.ga,2)} (Liga ${bl93N(r.G.avg,2)})`:'–','ga'); if(BL93.pos==='ab')col('Tore',r=>r.tore||'0','tore'); }
  else if(cfg.grp==='mid'){ col('Tore',r=>r.tore,'tore'); if(mitV){ col('Vorlagen',r=>r.vor!=null?r.vor:'–'); col('Scorer',r=>r.vor!=null?r.sc:'–','sc'); } col('Tore je Spiel',r=>bl93N(BL93.berein?r.tpsB:r.tps,2),'tps'); col('Einsatz',r=>r.q!=null?Math.round(r.q*100)+' %'+(r.est?'*':''):'–','q'); }
  else { col('Tore',r=>r.tore,'tore'); col('Tore je Spiel',r=>bl93N(BL93.berein?r.tpsB:r.tps,2),'tps'); col('Anteil Teamtore',r=>r.anteil!=null?Math.round(r.anteil*100)+' %':'–','anteil'); if(mitV){ col('Vorlagen',r=>r.vor!=null?r.vor:'–'); col('Scorer',r=>r.vor!=null?r.sc:'–','sc'); } }
  col('Eye-Test',r=>r.eye!=null?`<b style="color:${tierColor(r.eye)}">${Math.round(r.eye)}</b>`:'–','eye');
  if(BL93.eigene&&R.some(r=>r.note))col('Note',r=>r.note?`Ø ${bl93N(r.note.v,1)}`:'–','note');
  col('Stärke',r=>'','st');
  P.innerHTML=`<div class="card bl93-top">
      <h3 class="trh">${SVI('trophy')} Bestenliste <small>${BL93.saison==='cur'?sv4SL(sv4S())+' bisher':'Saison 25/26'}</small></h3>
      <div class="seg4 bl93-pos">${Object.entries(BL93_POS).map(([k,v])=>`<button type="button" class="${BL93.pos===k?'on':''}" data-bl93p="${k}">${v.t}</button>`).join('')}</div>
      <p class="bl93-wie">${svEsc(BL93_WIE[BL93.pos])}</p>
      <div class="bl93-f">
        <div class="chips4">${chip('bl93s',BL93.saison,[['cur',sv4SL(sv4S())+' bisher'],['2526','25/26 komplett']])}</div>
        <div class="chips4">${chip('bl93l',BL93.liga,BL93_LIGEN)}</div>
        <div class="chips4">${chip('bl93a',BL93.alter,BL93_ALTER)}</div>
        <div class="chips4"><button type="button" class="${BL93.eigene?'on':''}" data-bl93t="eigene">Eigene Spieler zeigen</button>${cfg.grp!=='def'?`<button type="button" class="${BL93.berein?'on':''}" data-bl93t="berein">Tore je Spiel ligabereinigt</button>`:''}</div>
      </div>
      <div class="bl93-sort"><span>Sortiert nach</span><div class="chips4">${SO.map(([k,t])=>`<button type="button" class="${BL93.sort===k?'on':''}" data-bl93o="${k}">${t}</button>`).join('')}</div></div>
    </div>
    <div class="card">${L.length?`<div class="bl93-l">${L.map((r,i)=>`<button type="button" class="bl93-r${r.p.own?' own':''}" data-bl93id="${svEsc(r.p.id)}">
        <span class="bl93-i">${i+1}</span>
        <span class="bl93-m"><b>${svEsc(r.p.name)}${r.p.own?' <i class="bl93-own">eigener Spieler</i>':''}</b><small>${svEsc(r.club||'')} · ${svEsc(LIGA_NAME[r.lv]||r.lv)}${r.p.alter!=null?' · '+r.p.alter+' J.':''}</small>
          <span class="bl93-k">${colH.filter(([t])=>t!=='Stärke').map(([t,f,k])=>{ const v=f(r); return v==='–'&&k!==BL93.sort?'':`<i class="${k===BL93.sort?'on':''}"><em>${t}</em> ${v}</i>`; }).join('')}</span>
          <span class="bl93-w">${svEsc(bl93Warum(r,cfg))}</span></span>
        <span class="bl93-s"><b style="color:${tierColor(r.st)}">${bl93N(r.st)}</b><small>Stärke</small></span></button>`).join('')}</div>
      ${R.length>BL93.n?`<button type="button" class="btn ghost sm bl93-more" data-bl93more>Weitere ${Math.min(40,R.length-BL93.n)} von ${R.length-BL93.n} zeigen</button>`:''}`:`<div class="empty">Für diese Auswahl gibt es keine Spieler mit genug Daten.</div>`}
      <p class="note small">${R.length} Spieler mit genug Daten.${BL93.saison==='cur'?' In der laufenden Saison kennen wir bei externen Spielern nur Tore und Teamspiele, keine Einsätze. Ein * heißt: Einsatzquote aus 25/26 beim selben Verein.':' Mindestens 8 Einsätze.'}${mitV?'':' Vorlagen gibt es bisher nur aus euren eigenen Spielen, deshalb fehlt die Spalte.'} „Stärke“ ist der MScore, er vergleicht über alle Ligen hinweg. Zeile antippen öffnet das Profil mit der ganzen Rechnung.</p></div>`;
  P.querySelectorAll('[data-bl93p]').forEach(b=>b.onclick=()=>{ BL93.pos=b.dataset.bl93p; BL93.sort=null; BL93.n=40; bl93Render(); });
  P.querySelectorAll('[data-bl93s]').forEach(b=>b.onclick=()=>{ BL93.saison=b.dataset.bl93s; BL93.n=40; bl93Render(); });
  P.querySelectorAll('[data-bl93l]').forEach(b=>b.onclick=()=>{ BL93.liga=b.dataset.bl93l; BL93.n=40; bl93Render(); });
  P.querySelectorAll('[data-bl93a]').forEach(b=>b.onclick=()=>{ BL93.alter=b.dataset.bl93a; BL93.n=40; bl93Render(); });
  P.querySelectorAll('[data-bl93o]').forEach(b=>b.onclick=()=>{ BL93.sort=b.dataset.bl93o; bl93Render(); });
  P.querySelectorAll('[data-bl93t]').forEach(b=>b.onclick=()=>{ const k=b.dataset.bl93t; BL93[k]=!BL93[k]; bl93Render(); });
  const m=P.querySelector('[data-bl93more]'); if(m)m.onclick=()=>{ BL93.n+=40; bl93Render(); };
  P.querySelectorAll('[data-bl93id]').forEach(b=>b.onclick=()=>openModal(b.dataset.bl93id));
}
SV4_HUB.scouting.tabs.splice(1,0,['best','Bestenliste']);
SV4_OF.best='scouting';
SV_PAGES.best=['Scouting','Bestenliste: die Besten je Position, nachvollziehbar'];
if(typeof SV50_INFO!=='undefined')SV50_INFO.best={w:'Die besten Spieler je Position: Torwart, Abwehr, Mittelfeld, Angriff. Jede Position wird mit den Zahlen gemessen, die für sie zählen.',
  f:'Ein Torwart schießt keine Tore. Deshalb zählen hinten die Gegentore der Mannschaft im Vergleich zur Liga und die eigene Spielzeit, vorne Tore und Tore je Spiel.',
  h:'Für die Kaderplanung: Wer ist in unserer Liga der beste Torwart? Welcher junge Stürmer trifft in der Kreisliga B am meisten?',
  s:'Position wählen, Liga und Alter eingrenzen, nach der passenden Zahl sortieren. Unter jedem Namen steht in einem Satz, warum er dort steht.',
  b:['Torwart, Kreisliga A, bis 27: wer hat mit seiner Mannschaft die wenigsten Gegentore bei voller Spielzeit?','Angriff, alle Ligen, Tore je Spiel ligabereinigt: wer würde auch eine Liga höher treffen?']};
{ const _gt93=goTab; goTab=function(tab){ const r=_gt93.apply(this,arguments); try{ if(svCurTab()==='best')bl93Render(); }catch(e){ console.warn('Bestenliste',e); } return r; }; }
{ const _ta93=svTabAllowed; svTabAllowed=function(t){ if(t==='best')return _ta93.call(this,'scout'); return _ta93.apply(this,arguments); }; }

/* ---------- Co-Trainer-Knopf: je weiter man scrollt, desto durchsichtiger, bis 20 %. Bleibt immer antippbar ---------- */
function bl93FabO(){ const b=document.getElementById('trFab'); if(!b)return; const y=window.scrollY||0, o=Math.max(0.2,1-Math.max(0,y-80)/900*0.8); b.style.setProperty('--fab-o',o.toFixed(2)); }
window.addEventListener('scroll',bl93FabO,{passive:true});
{ const _gt93f=goTab; goTab=function(){ const r=_gt93f.apply(this,arguments); try{ bl93FabO(); }catch(e){} return r; }; }

/* ---------- Co-Trainer ohne KI: „Wie gut ist …?“ direkt aus den Daten beantworten ---------- */
function svKiFehler(code){ if(code==='ki-weg')return 'Die KI ist gerade kurz nicht erreichbar.'; if(code==='schluessel')return 'Der KI-Schlüssel wird nicht akzeptiert. Der Admin prüft ihn unter Verwaltung.'; return code; }
function sv93Norm(s){ return String(s||'').toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g,'').replace(/ß/g,'ss'); }
function sv93Niveau(v){ const L=[['GL','Stammspieler der Gruppenliga'],['KOL','Stammspieler der Kreisoberliga'],['A','Stammspieler der Kreisliga A'],['B','Stammspieler der Kreisliga B'],['C','Stammspieler der Kreisliga C'],['D','Stammspieler der Kreisliga D']];
  if(v>=SV94_NIVEAU.GL+6)return 'Spitze der Region, über dem Niveau eines Gruppenliga-Stammspielers'; for(const [l,t] of L){ if(v>=SV94_NIVEAU[l]-3)return 'etwa auf dem Niveau eines '+t.replace('Stammspieler','Stammspielers'); } return 'unter dem Niveau eines Stammspielers der Kreisliga D'; }
function svSpielerAntwort(text){
  const t=sv93Norm(text);
  if(!/(wie gut|wie stark|starke|staerke|rating|mscore|bewert|was haltst|was haeltst|was taugt|einschatz|einschaetz|potenzial|potential|was kann|wie ist .* (drauf|einzuschatzen)|niveau)/.test(t))return null;
  if(typeof players==='undefined')return null;
  let hits=players.filter(p=>p.name&&p.name.length>4&&t.includes(sv93Norm(p.name)));
  if(!hits.length){ const W=new Set(t.match(/[a-z\-]{3,}/g)||[]); hits=players.filter(p=>p.name&&W.has(sv93Norm(p.name.split(' ').pop()))); }
  if(!hits.length)return null;
  const own=hits.filter(p=>p.own); if(own.length)hits=own;
  if(hits.length>1){ const L=hits.slice(0,5).map(p=>`${p.name} (${(p.cur&&p.cur.club)||p.club||'?'})`); return `Meinst du ${L.slice(0,-1).join(', ')} oder ${L[L.length-1]}? Schreib bitte den vollen Namen.`; }
  const p=hits[0], s=scores(p), S=s&&s.m4; if(!s)return null;
  const n=v=>sv4Num(v,1), club=(p.cur&&p.cur.club)||p.club||'', kopf=[svPosTxt(p),p.alter!=null?p.alter+' J.':null,club].filter(Boolean).join(', ');
  if(s.v1){ const w=v1Wert(p.id)||{}, si=(V1_SICH[w.sicherheit]||[])[0], fo=V1_FORM[w.form];   // seit 0.99.63 zählt nur noch die Stärke
    const zz=[`${p.name}${kopf?' ('+kopf+')':''}: Stärke ${Math.round(s.total)}, ${v1Einordnung(s.total)}.`];
    if(si)zz.push(`Sicherheit ${si}.`); if(fo&&w.form&&w.form!=='unbekannt')zz.push(fo[1]+'.'); if(w.p24!=null)zz.push(`In 24 Monaten erwartet: ${w.p24}.`);
    zz.push('Die Gründe stehen im Profil unter „Warum diese Stärke?“.'); return zz.join(' '); }
  const z=[`${p.name}${kopf?' ('+kopf+')':''}: Spielstärke ${n(s.total)}, ${sv93Niveau(s.total)}.`];
  if(S&&S.pot!=null&&S.pot-s.total>=1)z.push(`Potenzial ${n(S.pot)}.`);
  if(S&&S.prog!=null&&Math.abs(S.prog-s.total)>=0.5&&S.man==null)z.push(`Prognose ${sv94Next()}: ${n(S.prog)}${S.rate<0?', das Alter kostet langsam Tempo':''}.`);
  if(S&&S.ev&&S.ev.length){ z.push('Grundlage: '+S.ev.map(e=>`${e.y} ${sv94LN(e.lv)}${e.n?', '+e.n+' Spiele':''}${e.tore?', '+e.tore+' Tore':''} (Wert ${n(e.Eh)}, zählt ${Math.round((e.anteil||0)*100)} %)`).join('; ')+'.'); }
  if(S&&S.eye!=null)z.push(`Eye-Test ${Math.round(S.eye)} aus ${S.en} Bewertung${S.en>1?'en':''}.`); else z.push('Noch kein Eye-Test, der würde den Wert deutlich schärfen.');
  if(S&&S.man!=null)z.push('Der Wert ist von der Sportlichen Leitung festgelegt (Insider-Rating).');
  z.push(`Datenbasis ${s.basis} %. Die ganze Rechnung steht im Profil unter MScore.`);
  return z.join(' ');
}

/* =====================================================================
   Sportzentrale Beta 0.12 · Importstatus und KLA-Datenquelle (nur Admin, Verwaltung)
   Je Datenquelle: Datenstand, Stand der Quelle selbst, Datensätze je Art, fehlende Werte, letzte Läufe
   mit verständlichen Fehlern, Liste mit Filtern und Datensatzdetail mit Herkunft.
   Abgleich läuft auf dem Server (Edge Function import-sync, stündlich). Die App liest nur.
   ===================================================================== */
const IMP={st:null,offen:null,busy:false,filter:{liga:'',saison:'',suche:''},seite:0};
const IMP_ART={verbindung:['Verbindung','Die Quelle war nicht erreichbar. Meist ist das vorübergehend, der nächste Abgleich versucht es wieder.'],
  berechtigung:['Berechtigung','Die Quelle hat den Zugang abgelehnt. Den Schlüssel der Quelle in Supabase unter Edge Functions, Secrets prüfen.'],
  nicht_verfuegbar:['Nicht verfügbar','Die Quelle bietet diese Funktion nicht an. Adresse oder Adapter prüfen.'],
  inhalt:['Inhalt','Die Daten passten nicht zum erwarteten Aufbau. Von dieser Seite wurde nichts übernommen.'],
  begrenzt:['Begrenzt','Die Quelle bremst gerade wegen zu vieler Abrufe. Später klappt es wieder.'],
  abbruch:['Abgebrochen','Der Lauf wurde unterbrochen. Der nächste Abgleich macht an derselben Stelle weiter.'],
  konflikt:['Konflikt','Ein anderer Abgleich war gleichzeitig dran. Es ist nichts verloren gegangen, der nächste Abgleich lädt den gespeicherten Stand neu.']};
const IMP_KIND={team_firstRound:'Hinrundentabelle',team_secondRound:'Rückrundentabelle',match_summary:'Spiele (eigene und Gegner)',match_lineup:'Aufstellungen mit Einzelwerten',match_events:'Spiel-Highlights',match_coverage:'Abdeckung Spielplan',player_stats:'Spielerstatistik',team_total:'Tabelle gesamt',team_home:'Heimtabelle',team_away:'Auswärtstabelle',team_form:'Form',
  league_history:'Saisonchronik der Ligen',stats_coverage:'Abdeckung der Statistik',team_table:'Tabelle',team_stats:'Mannschaftsstatistik',screenshot:'Screenshot'};
const IMP_LIGA={'herren-gruppenliga-darmstadt':'Gruppenliga Darmstadt','herren-kreisoberliga-bergstrasse':'Kreisoberliga Bergstraße','kla-bergstrasse':'Kreisliga A Bergstraße',
  'klb-bergstrasse':'Kreisliga B Bergstraße','klc-bergstrasse':'Kreisliga C Bergstraße','kreisliga-d-1-bergstrasse':'Kreisliga D Bergstraße 1','kld2-bergstrasse':'Kreisliga D Bergstraße 2'};
const IMP_FELD={name:'Name',team:'Mannschaft',position:'Position',einsaetze:'Einsätze',minuten:'Minuten',tore:'Tore',vorlagen:'Vorlagen',gelb:'Gelbe Karten',rot:'Rote Karten',platz:'Platz',spiele:'Spiele',punkte:'Punkte',gegentore:'Gegentore',synthetisch:'Synthetisch',
  firstName:'Vorname',lastName:'Nachname',club_name:'Verein',team_name:'Mannschaft',squad:'Mannschaft Nr.',age_group:'Altersklasse',goals:'Tore',assists:'Vorlagen',minutesPlayed:'Minuten',
  starts_derived:'Startelf (abgeleitet)',substitutesIn:'Eingewechselt',substitutesOut:'Ausgewechselt',yellowCards:'Gelbe Karten',yellowRedCards:'Gelb-Rote Karten',redCards:'Rote Karten',
  topEleven:'Elf der Woche',penaltiesHit:'Elfmetertore',points:'Punkte',rank:'Platz',wins:'Siege',draws:'Unentschieden',defeats:'Niederlagen',ownGoals:'Tore',againstGoals:'Gegentore',
  goalDifference:'Tordifferenz',team_count:'Mannschaften in der Liga',league_name:'Liga',penaltyPoints:'Strafpunkte',split:'Tabelle',mvp_updated_at:'MVP berechnet am',seasons:'Saisons',age:'Altersklasse',
  player_rows:'Spielerzeilen',state:'Stand der Statistik',
  complete_timeline_verified:'Zeitleiste vollständig bestätigt',coverage:'Umfang',completeness:'Umfang',round:'Spieltag',status:'Status',kickoff:'Anstoß',spectators:'Zuschauer',
  competition_name:'Wettbewerb',competition_category:'Art des Wettbewerbs',own_side:'Eigene Mannschaft',home_goals:'Tore Heim',away_goals:'Tore Gast',visible_matches:'Sichtbare Spiele',
  next_page_present:'Weitere Seite vorhanden',form_points:'Formindex (keine Ligapunkte)',rank_week_before:'Platz Vorwoche',last_results_source_order:'Letzte Ergebnisse',
  penaltiesMissed:'Elfmeter verschossen',penaltiesTotal:'Elfmeter gesamt',penalties_total_derived:'Elfmeter gesamt abgeleitet',source_statistics:'Weitere Werte der Quelle',
  is_captain:'Kapitän',is_vice_captain:'Vizekapitän',jerseyNumber:'Rückennummer'};
const IMP_WERT={published_highlights_only:'nur veröffentlichte Highlights',visible_public_page_only:'nur öffentlich sichtbare Seite',PRE:'angesetzt',POST:'gespielt',LIVE:'läuft',
  home:'Heim',away:'Auswärts',league:'Liga',cup:'Pokal',win:'S',loss:'N',draw:'U',firstRound:'Hinrunde',secondRound:'Rückrunde',form:'Form'};
const IMP_ORD=['name','firstName','lastName','club_name','team_name','team','squad','league_name','position','age_group','rank','platz','matches','spiele','einsaetze','minutesPlayed','minuten','starts_derived','substitutesIn','substitutesOut',
  'goals','tore','assists','vorlagen','penaltiesHit','yellowCards','gelb','yellowRedCards','redCards','rot','topEleven','wins','draws','defeats','ownGoals','againstGoals','gegentore','goalDifference','points','punkte','penaltyPoints','team_count'];
function impTech(k){ return /(^|_)(id|slug)$/i.test(k)||/_id$|_slug$/.test(k)||k==='slug'||k==='source_field'; }
function impE(s){ return String(s==null?'':s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c])); }
function impN(n){ return Number(n||0).toLocaleString('de-DE'); }
function impKind(k){ return IMP_KIND[k]||k; }
function impSaison(s){ return String(s||'').replace(/^20(\d\d)-(\d\d)$/,'$1/$2'); }
function impLiga(l){ return IMP_LIGA[l]||String(l||'').replace(/-/g,' ').replace(/\b\w/g,c=>c.toUpperCase()); }
function impIstSim(k){ return /^simulated_mvp|mvp_(schaetzung|model|estimate)/i.test(k); }
function impIstMvp(k){ return !impIstSim(k)&&(/mvp$/i.test(k)||k==='fupa_mvp'||k==='mvp'); }
function impFeld(k,kind){ if(impIstSim(k))return 'MVP-Schätzung (experimentell)'; if(impIstMvp(k))return 'MVP der Quelle'; if(k==='matches')return /^team_/.test(kind||'')?'Spiele':'Einsätze'; return IMP_FELD[k]||k; }
function impDatum(t){ if(t==null||t==='')return null; const s=String(t); if(/^\d{9,11}$/.test(s))return new Date(+s*1000); if(/^\d{12,14}$/.test(s))return new Date(+s); const d=new Date(s); return isNaN(d)?null:d; }
function impZeit(t,kurz){ const d=impDatum(t); if(!d)return t?impE(t):'';
  return d.toLocaleString('de-DE',kurz?{day:'2-digit',month:'2-digit',hour:'2-digit',minute:'2-digit'}:{day:'2-digit',month:'2-digit',year:'numeric',hour:'2-digit',minute:'2-digit'}); }
function impQuelleZeit(t){ if(t==null||t==='')return '<i class="imp-fehlt">fehlt</i>'; const d=impDatum(t);
  return (d?impZeit(t)+' ':'')+`<small class="imp-roh" title="Wortgleich aus der Quelle">${impE(t)}</small>`; }
function impWert(v,k){ if(v===null||v===undefined||v==='')return '<i class="imp-fehlt">fehlt</i>';
  if(k==='mvp_updated_at')return impQuelleZeit(v);
  if(k==='kickoff')return impE(impZeit(v));
  if(k==='average_age'&&typeof v==='number')return impE(v.toFixed(1).replace('.',','));
  if(Array.isArray(v)&&v.every(x=>typeof x!=='object'))return impE(v.map(x=>IMP_WERT[x]||x).join(k==='last_results_source_order'?' ':', '));
  if(v&&typeof v==='object'&&!Array.isArray(v)&&k==='source_statistics')return impE(Object.entries(v).map(([a,b])=>(IMP_FELD[a]||a)+' '+b).join(' · '));
  if(typeof v==='string'&&IMP_WERT[v])return impE(IMP_WERT[v]);
  if(Array.isArray(v))return impE(v.join(', '));
  if(typeof v==='object')return impE(v.team_name||v.name||JSON.stringify(v));
  if(typeof v==='boolean')return v?'ja':'nein'; if(k==='age_group'&&v==='m')return 'Herren';
  if(k==='split')return ({total:'Gesamt',home:'Heim',away:'Auswärts'})[v]||impE(v); if(k==='state')return ({available:'vorhanden',missing:'fehlt',empty:'leer'})[v]||impE(v); return impE(v); }
function impSpiel(d){ const h=d.home_team&&d.home_team.team_name, a=d.away_team&&d.away_team.team_name; if(!h&&!a)return '';
  const erg=d.home_goals!=null&&d.away_goals!=null?' '+d.home_goals+':'+d.away_goals:''; const dt=d.kickoff?' · '+impZeit(d.kickoff).split(',')[0]:''; return (h||'?')+' gegen '+(a||'?')+erg+dt; }
function impTitel(r){ const d=r.data||{}; if(d.home_team||d.away_team)return impSpiel(d); if(d._spiel)return d._spiel+(r.kind==='match_lineup'?' · Aufstellung':r.kind==='match_events'?' · Highlights':'');
  if(r.kind==='match_lineup'||r.kind==='match_events')return 'Spiel '+(d.match_id||r.entity||'');
  if(d.firstName||d.lastName)return [d.firstName,d.lastName].filter(Boolean).join(' ');
  if(d._name)return d._name;
  if(d.team_name)return d.team_name; if(d.team&&typeof d.team==='object')return d.team.team_name||d.team.club_name||r.record_key;
  if(d.name)return d.name; if(d.team)return d.team; if(d.player_id)return 'Spieler '+d.player_id; return r.record_key; }
function impGruende(g){ const e=Object.entries(g||{}); return e.length?' ('+e.map(([k,n])=>impN(n)+' '+k).join(', ')+')':''; }
function impLaufZeile(l){
  const ok=l.status==='ok', tl=l.status==='teilweise', zw=ok&&l.komplett===false;
  const zahl=[impN(l.neu)+' neu',impN(l.geaendert)+' geändert',impN(l.unveraendert)+' unverändert'].concat(l.ausgelassen?[impN(l.ausgelassen)+' ausgelassen'+impGruende(l.ausgelassen_gruende)]:[]).join(' · ');
  const f=(l.fehler||[]).map(x=>{ const a=IMP_ART[x.art]||[x.art,'']; return `<div class="imp-err"><b>${impE(a[0])}${x.status?' · HTTP '+impE(x.status):''}</b> ${impE(x.meldung)}<span>${impE(a[1])}</span></div>`; }).join('');
  const titel=l.laeuft?'Läuft gerade':zw?'Zwischenstand':ok?'Erfolgreich':tl?'Teilweise':'Fehlgeschlagen';
  return `<li class="imp-lauf ${l.laeuft||zw?'teil':ok?'ok':tl?'teil':'bad'}"><div><b>${titel}</b> <span class="imp-mute">${impZeit(l.start,true)}${l.ausloeser==='test'?' · Testlauf':l.ausloeser==='zeitplan'?' · automatisch':' · von Hand'}</span></div>
    <div class="imp-mute">${impN(l.seiten)} ${l.seiten===1?'Seite':'Seiten'} · ${zahl} · Cursor ${impN(l.cursor_von)} → ${impN(l.cursor_bis)}</div>${l.hinweis?`<div class="imp-hinw">${impE(l.hinweis)}</div>`:''}${zw?'<div class="imp-mute">Es gibt noch mehr Änderungen. Der nächste Abgleich macht genau hier weiter.</div>':''}${f}</li>`;
}
function impQuellstatus(q){ const s=q.quellstatus; if(!s)return '';
  const z=s.zeitplan, tage={Monday:'Mo',Tuesday:'Di',Wednesday:'Mi',Thursday:'Do',Friday:'Fr',Saturday:'Sa',Sunday:'So'};
  const rest=s.head_seq!=null?Math.max(0,s.head_seq-q.cursor):null;
  return `<div class="imp-qs"><b>Stand der Quelle</b> <span class="imp-mute">(abgefragt ${impZeit(s.abgerufen,true)})</span>
    <div>Letzter Quellenabgleich: ${s.letzter_quellenabgleich?impZeit(s.letzter_quellenabgleich):'unbekannt'}${z&&z.tage?' · Quellenläufe '+impE((z.tage||[]).map(t=>tage[t]||t).join(' und '))+' ab '+impE(z.uhrzeit)+' Uhr':''}${s.gesperrt?' · <span class="imp-warn">Quelle pausiert</span>':''}</div>
    ${rest!=null?`<div>${rest===0?'<span class="imp-okt">Alles übernommen</span>, was die Quelle bisher hat.':`Noch <b>${impN(rest)}</b> Änderungen offen, die nächsten Abgleiche holen sie.`}</div>`:''}
    ${s.anbieter||s.dataset_epoch?`<div class="imp-mute">Datenbasis: ${impE(s.anbieter==='supabase'?'Supabase':s.anbieter||'unbekannt')}${s.dataset_epoch?' · Epoche '+impE(String(s.dataset_epoch).slice(0,8)):''}</div>`:''}
    ${s.helfer&&s.helfer.zugeordnet!=null?`<div>Automatisch zugeordnet: <b>${impN(s.helfer.zugeordnet)}</b> Spieler der App${s.helfer.eigene?`, davon ${impN(s.helfer.eigene_zugeordnet)} von ${impN(s.helfer.eigene)} eigenen`:''}. Ihre Werte stehen im Profil, im MScore und in der Bestenliste.</div>`:''}
    ${s.helfer&&s.helfer.pruefen!=null?`<div class="imp-abg">${s.helfer.von_hand?`Davon ${impN(s.helfer.von_hand)} von Hand bestätigt. `:''}${s.helfer.pruefen?`<b>${impN(s.helfer.pruefen)}</b> Spieler warten auf eine Entscheidung.`:'Nichts offen im Abgleich.'} <button type="button" class="btn sm ghost" id="impAbg">Spieler-Abgleich öffnen</button></div>`:''}
    ${impCheckerZeile()}
    ${impSaisonZeile(s.saison)}
    ${impApiZeile(s.api)}
    ${impNachladen(s.nachladen)}
    ${impAbdeckung(s.abdeckung)}</div>${impModell(s.modell)}`; }
function impCheckerZeile(){ const c=IMP.stand&&IMP.stand.checker; if(!c)return '';
  const n=Object.keys(c.probleme||{}).length, z=c.geprueft?impZeit(c.geprueft,true):'';
  return `<div>${c.ok?'<span class="imp-okt">✓ Server-Checker: alles aktuell</span>':`<span class="imp-warn">⚠ Server-Checker: ${n} Problem${n>1?'e':''}</span>`} <span class="imp-mute">(prüft alle 10 Minuten, zuletzt ${z}; meldet sich bei dir, wenn etwas länger als 15 Minuten hängt)</span></div>`; }
function impSaisonZeile(z){ if(!z||!z.saison)return '';
  const g={spielplan:'aus dem Spielplan der Ersten',einsaetze:'aus den Einsätzen',kalender:'nach dem Kalender'}[z.grund]||'';
  return `<div>Laufende Saison laut FuPa: <b>${impE(impSaison(z.saison))}</b> <span class="imp-mute">(${impE(g)}${z.erstes_spiel?', erstes Spiel '+impZeit(z.erstes_spiel,true).split(',')[0]:''}). Stellt nach der Sommerpause von selbst um, sobald das erste Spiel der neuen Saison höchstens 14 Tage entfernt ist.</span></div>`; }
function impApiZeile(a){ if(!a)return '';
  if(!a.ok)return `<div class="imp-warn">Gegenprobe über die KLA-API mit dem Leseschlüssel fehlgeschlagen: ${impE(a.meldung||'unbekannt')}</div>`;
  const r=a.rueckstand, gleich=a.epoche_gleich!==false;
  return `<div>${gleich?'<span class="imp-okt">✓ Gegenprobe über die KLA-API mit dem Leseschlüssel</span>':'<span class="imp-warn">KLA-API meldet eine andere Datenbasis</span>'} <span class="imp-mute">(${impZeit(a.geprueft,true)}${a.head_seq!=null?', Stand '+impN(a.head_seq):''}${r?', Abstand '+impN(Math.abs(r))+' Änderungen, das holt der nächste Lauf':''})</span></div>`; }
function impNachladen(n){ if(!n)return ''; const rel=['stats','standing','matches','match'];
  const off=Object.entries(n.offen||{}).filter(([k,v])=>rel.includes(k)&&v>0);
  if(!n.laeuft&&!off.length)return '';
  return `<div>${n.laeuft?'Die Quelle lädt gerade nach':'Bei der Quelle noch offen'}${off.length?': '+off.map(([k,v])=>impN(v)+' '+impE(IMP_QKIND[k]||k)).join(', '):''}. <span class="imp-mute">Neues kommt automatisch mit dem nächsten stündlichen Abgleich.</span></div>`; }
const IMP_QKIND={profile:'Profile',roster:'Kader',stats:'Statistik',standing:'Tabellen',matches:'Spielpläne',match:'Spielberichte',history:'Ligachronik'};
function impAbdeckung(a){ if(!a)return '';
  const off=Object.entries(a.offen||{}).filter(([,n])=>n>0), feh=Object.entries(a.fehler||{}).filter(([,n])=>n>0);
  return `<details class="imp-abd"><summary>${a.vollstaendig?'<span class="imp-okt">Datenbestand der Quelle vollständig</span>':'<span class="imp-warn">Datenbestand der Quelle noch unvollständig</span>'}${a.stand?' <span class="imp-mute">(Stand '+impZeit(a.stand,true)+')</span>':''}</summary>
    ${off.length?`<div>Noch offen bei der Quelle: ${off.map(([k,n])=>impN(n)+' '+impE(IMP_QKIND[k]||k)).join(', ')}</div>`:''}
    ${feh.length?`<div class="imp-warn">Fehler bei der Quelle: ${feh.map(([k,n])=>impN(n)+' '+impE(IMP_QKIND[k]||k)).join(', ')}</div>`:''}
    ${(a.grenzen||[]).length?`<ul>${a.grenzen.map(g=>`<li>${impE(g)}</li>`).join('')}</ul>`:''}</details>`; }
function impModell(m){ return ''; if(!m)return '';
  return `<details class="imp-modell"><summary><b>Experimentelle MVP-Näherung</b> <span class="badge imp-syn">kein FuPa-Wert</span></summary>
    <p>${impE(m.bezeichnung)}. Status: ${impE(m.status==='experimental_only'?'nur experimentell':m.status)}. Stichprobe ${impN(m.stichprobe)} Spieler-Saisons aus ${impN(m.mannschaften)} Mannschaften${m.mittlerer_fehler!=null?', mittlere Abweichung '+String(m.mittlerer_fehler).replace('.',',')+' MVP-Punkte':''}.</p>
    <p class="imp-mute">Der Originalwert heißt überall „MVP der Quelle“ und bleibt unverändert. Die Näherung ersetzt ihn nicht und ist kein Stärke-Rating.</p>
    ${(m.grenzen||[]).length?`<ul>${m.grenzen.map(g=>`<li>${impE(g)}</li>`).join('')}</ul>`:''}</details>`; }
function impQuelleHtml(q){
  const l0=(q.laeufe||[])[0];
  const arten=(q.arten||[]).filter(a=>!/mvp/i.test(a.kind||'')).map(a=>{ const fe=(a.fehlend||[]).filter(x=>!impTech(x.feld)); const ftxt=fe.length?fe.slice(0,4).map(x=>`${impE(impFeld(x.feld,a.kind))} <b>${impN(x.fehlt)}×</b>`).join(', ')+(fe.length>4?' …':''):'<span class="imp-okt">vollständig</span>';
    const auf=IMP.offen&&IMP.offen.q===q.id&&IMP.offen.k===a.kind;
    return `<button class="imp-art${auf?' auf':''}" data-q="${impE(q.id)}" data-k="${impE(a.kind)}"><span class="imp-an">${impE(impKind(a.kind))}</span><span class="imp-num">${impN(a.anzahl)}</span><span class="imp-fe">Fehlende Werte: ${ftxt}</span></button>${auf?`<div class="imp-liste" id="impListe">${impFilterHtml(q)}<div id="impTreffer"><p class="note">Lädt …</p></div></div>`:''}`; }).join('');
  return `<div class="imp-q" data-q="${impE(q.id)}">
    <div class="imp-qh"><h4>${impE(q.name)}</h4>${q.synthetisch?'<span class="badge imp-syn">synthetisch</span>':`<span class="badge ${q.aktiv?'imp-on':'imp-off'}">${q.aktiv?'aktiv':'nicht aktiv'}</span>`}
      ${q.synthetisch?'':`<button class="btn sm ghost imp-sync" data-q="${impE(q.id)}">${SVI('refresh')} Jetzt abgleichen</button>`}</div>
    ${q.hinweis?`<p class="note" style="margin:4px 0 8px">${impE(q.hinweis)}</p>`:''}
    ${q.freigabe?`<details class="imp-frei"><summary>${SVI('check')} Nutzung freigegeben</summary><p>${impE(q.freigabe)}</p></details>`:''}
    <div class="adm-stats imp-stats"><div class="adm-stat"><b>${impN(q.anzahl)}</b><span>Datensätze</span></div>
      <div class="adm-stat"><b>${q.datenstand?impZeit(q.datenstand).split(',')[0]:'offen'}</b><span>Datenstand der Quelle</span></div>
      <div class="adm-stat"><b>${q.letzter_lauf?impZeit(q.letzter_lauf,true):'nie'}</b><span>Letzter Abgleich</span></div>
      <div class="adm-stat"><b>${impN(q.cursor)}</b><span>Cursor</span></div></div>
    ${q.geprueft?`<p class="imp-mute" style="margin:8px 0 0">Zuletzt von der Quelle geprüft: ${impZeit(q.geprueft)}${q.letzter_erfolg?' · letzter erfolgreicher Abgleich: '+impZeit(q.letzter_erfolg):''}</p>`:''}
    ${q.id==='kla'&&(!q.aktiv||(IMP.key||{}).kla)?impKeyHtml('kla'):''}
    ${impQuellstatus(q)}
    ${arten?`<div class="imp-arten">${arten}</div>`:'<p class="note">Noch keine Datensätze.</p>'}
    ${(q.laeufe||[]).length?`<details class="imp-laeufe"${l0&&l0.status!=='ok'?' open':''}><summary>Letzte Läufe</summary><ul>${q.laeufe.map(impLaufZeile).join('')}</ul></details>`:''}
  </div>`;
}
function impFilterHtml(q){ const f=IMP.filter, lg=(q.ligen||[]).slice().sort((a,b)=>impLiga(a).localeCompare(impLiga(b))), ss=(q.saisons||[]).slice().sort().reverse();
  if(q.synthetisch&&lg.length<2&&ss.length<2)return '';
  return `<div class="imp-filter"><select id="impFL" aria-label="Liga"><option value="">Alle Ligen</option>${lg.map(l=>`<option value="${impE(l)}"${f.liga===l?' selected':''}>${impE(impLiga(l))}</option>`).join('')}</select>
    <select id="impFS" aria-label="Saison"><option value="">Alle Saisons</option>${ss.map(s=>`<option value="${impE(s)}"${f.saison===s?' selected':''}>${impE(impSaison(s))}</option>`).join('')}</select>
    <input id="impFQ" type="search" placeholder="Name, Verein, Mannschaft" value="${impE(f.suche)}" aria-label="Suche"></div>`; }
async function impLaden(){ const {data,error}=await SVB.sb.rpc('import_status'); if(error)throw error; IMP.st=data;
  try{ const k=await SVB.sb.rpc('import_schluessel_status'); IMP.key=k.error?{}:(k.data||{}); }catch(e){ IMP.key={}; }
  try{ const w=await SVB.sb.rpc('import_hinweise_liste'); IMP.hinw=w.error?[]:(w.data||[]); }catch(e){ IMP.hinw=[]; }
  try{ const s=await SVB.sb.rpc('kla_stand'); IMP.stand=s.error?null:s.data; }catch(e){ IMP.stand=null; }
  return data; }
function impKeyHtml(id){ if(id!=='kla')return ''; const k=(IMP.key||{})[id];
  return `<div class="imp-key">${k?`<span class="imp-okt">✓ Leseschlüssel hinterlegt</span> <span class="imp-mute">seit ${impZeit(k)}</span> <button type="button" class="btn sm ghost imp-key-neu">Ersetzen</button>`:'<b>Leseschlüssel hinterlegen</b>'}
    <form class="imp-keyf" data-q="${impE(id)}"${k?' hidden':''}><input type="password" name="k" autocomplete="off" autocapitalize="off" spellcheck="false" placeholder="kla_read_…" aria-label="Leseschlüssel der KLA-Datenquelle">
      <button class="btn sm" type="submit">Speichern und abgleichen</button></form>
    <span class="imp-mute imp-key-h">Der Schlüssel liegt danach nur auf dem Server. Die App zeigt ihn nie wieder an.</span></div>`; }
async function impAufruf(body){
  const {data,error}=await SVB.sb.functions.invoke('import-sync',{body});
  if(error){ let t=error.message; try{ const j=await error.context.json(); if(j&&j.error)t=j.error; }catch(_){} throw new Error(t==='Nicht angemeldet'?'Bitte neu anmelden.':'Der Abgleich konnte nicht starten. Bitte später noch einmal versuchen.'); }
  if(!data||!data.ok)throw new Error(data&&data.error||'Abgleich nicht möglich');
  return data.ergebnis; }
function impErgebnisText(r,test){
  if(r.status!=='ok')return '⚠ '+((r.fehler[0]||{}).meldung||'Abgleich mit Fehler');
  const aus=r.ausgelassen?`, ${impN(r.ausgelassen)} ausgelassen${impGruende(r.gruende)}`:'';
  return `✓ ${test?'Testlauf':'Abgleich'} fertig: ${impN(r.neu)} neu, ${impN(r.geaendert)} geändert, ${impN(r.unveraendert)} unverändert${aus}.`
    +(r.neu+r.geaendert+r.unveraendert+r.ausgelassen===0?' Alles war schon da, der Cursor steht am Ende.':'')
    +(r.komplett===false?' Das war ein Zwischenstand, der nächste Abgleich macht weiter (automatisch jede Stunde).':''); }
function impCard(P){
  let el=P.querySelector('#svImport'); if(!el){ el=document.createElement('div'); el.className='card'; el.id='svImport'; P.appendChild(el); }
  const qs=(IMP.st&&IMP.st.quellen)||[], hatTest=qs.some(q=>q.synthetisch), echte=qs.filter(q=>!q.synthetisch), hatKla=qs.some(q=>q.id==='kla');
  el.innerHTML=`<div class="adm-head" style="margin-bottom:10px"><div><h3 style="margin:0;display:flex;gap:8px;align-items:center">${SVI('db')} Importstatus</h3>
      <p style="margin:6px 0 0;font-size:13.5px;max-width:62ch">Hier siehst du jede angebundene Datenquelle: Datenstand, was fehlt und ob der letzte Abgleich geklappt hat. Eine Seite wird ganz oder gar nicht übernommen, fehlende Werte bleiben fehlend und bei jedem Datensatz steht, woher er kommt.</p></div>
      <div class="imp-btns"><button class="btn sm ghost" id="impTest">${SVI('refresh')} Testlauf mit Beispieldaten</button>${hatTest?`<button class="btn sm ghost" id="impDel">${SVI('trash')} Beispieldaten löschen</button>`:''}</div></div>
    ${echte.length?'':'<p class="note imp-leer">Noch keine echte Datenquelle angebunden. Der Testlauf schickt erfundene Beispieldaten durch denselben Ablauf, damit du siehst, wie ein Import aussieht. Sie fließen in keine Bewertung ein.</p>'}
    ${hatKla?'':`<div class="imp-q imp-neu"><div class="imp-qh"><h4>KLA-Datenquelle (FuPa)</h4><span class="badge imp-off">noch kein Abgleich</span><button class="btn sm ghost imp-sync" data-q="kla">${SVI('refresh')} Jetzt abgleichen</button></div>
      <p class="note" style="margin:4px 0 8px">Trag unten den Leseschlüssel ein. Danach gleicht der Server jede Stunde automatisch ab.</p>${impKeyHtml('kla')}</div>`}
    ${(IMP.hinw||[]).length?`<div class="imp-waechter">${IMP.hinw.map(h=>`<div class="${impE(h.stufe)}">${impE(h.text)}</div>`).join('')}</div>`:''}
    <p class="note" id="impMsg" style="margin:0 0 6px"></p>
    ${qs.map(impQuelleHtml).join('')}`;
  const msg=t=>{ const m=el.querySelector('#impMsg'); if(m)m.innerHTML=t; };
  el.querySelector('#impTest').onclick=async e=>{ if(IMP.busy)return; IMP.busy=true; const b=e.currentTarget; b.disabled=true; b.textContent='Testlauf läuft …';
    try{ const r=await impAufruf({aktion:'testlauf'}); await impLaden(); impCard(P); const m=P.querySelector('#impMsg'); if(m)m.textContent=impErgebnisText(r,true); }
    catch(x){ b.disabled=false; b.innerHTML=SVI('refresh')+' Testlauf mit Beispieldaten'; msg('⚠ '+impE(x.message||x)); }
    IMP.busy=false; };
  { const ab=el.querySelector('#impAbg'); if(ab)ab.onclick=()=>{ if(typeof svAbgleich==='function')svAbgleich(); }; }
  el.querySelectorAll('.imp-waechter .info').forEach(d=>{ if(/Spieler-Abgleich/.test(d.textContent)){ d.classList.add('imp-klick'); d.onclick=()=>{ if(typeof svAbgleich==='function')svAbgleich(); }; } });
  el.querySelectorAll('.imp-sync').forEach(b=>b.onclick=async()=>{ if(IMP.busy)return; IMP.busy=true; b.disabled=true; b.textContent='Gleicht ab …'; msg('Der Abgleich läuft, das kann bis zu zwei Minuten dauern.');
    try{ const r=await impAufruf({aktion:'abgleich',quelle:b.dataset.q}); await impLaden(); impCard(P); const m=P.querySelector('#impMsg'); if(m)m.textContent=impErgebnisText(r,false); }
    catch(x){ try{ await impLaden(); impCard(P); }catch(_){} const m=P.querySelector('#impMsg'); if(m)m.textContent='⚠ '+(x.message||x); }
    IMP.busy=false; });
  el.querySelectorAll('.imp-key-neu').forEach(b=>b.onclick=()=>{ const f=b.parentNode.querySelector('.imp-keyf'); if(f){ f.hidden=false; f.querySelector('input').focus(); } });
  el.querySelectorAll('.imp-keyf').forEach(f=>f.onsubmit=async ev=>{ ev.preventDefault(); if(IMP.busy)return;
    const inp=f.querySelector('input'), wert=inp.value.trim(); inp.value='';
    if(!wert){ msg('Bitte den Schlüssel einfügen.'); return; }
    IMP.busy=true; const b=f.querySelector('button'); b.disabled=true; b.textContent='Speichert …'; msg('Schlüssel wird gespeichert …');
    try{ const {error}=await SVB.sb.rpc('import_schluessel_setzen',{p_quelle:f.dataset.q,p_schluessel:wert});
      if(error)throw new Error(/kla_read_|Leseschlüssel/.test(error.message)?error.message:'Der Schlüssel konnte nicht gespeichert werden.');
      msg('✓ Schlüssel gespeichert. Der erste Abgleich läuft, das kann bis zu zwei Minuten dauern.');
      let r=null, fe=null; try{ r=await impAufruf({aktion:'abgleich',quelle:f.dataset.q}); }catch(x){ fe=x; }
      await impLaden(); IMP.busy=false; impCard(P); const m=P.querySelector('#impMsg'); if(m)m.textContent=fe?'⚠ '+(fe.message||fe):impErgebnisText(r,false);
    }catch(x){ IMP.busy=false; b.disabled=false; b.textContent='Speichern und abgleichen'; msg('⚠ '+impE(x.message||x)); }
    IMP.busy=false; });
  const del=el.querySelector('#impDel'); if(del)del.onclick=async()=>{
    if(del.dataset.sicher!=='1'){ del.dataset.sicher='1'; del.innerHTML=SVI('trash')+' Wirklich löschen?'; return; }
    del.disabled=true; try{ const {error}=await SVB.sb.rpc('import_testdaten_loeschen'); if(error)throw error; IMP.offen=null; await impLaden(); impCard(P); const m=P.querySelector('#impMsg'); if(m)m.textContent='✓ Beispieldaten gelöscht.'; }
    catch(x){ del.disabled=false; msg('⚠ '+impE(x.message||x)); } };
  el.querySelectorAll('.imp-art').forEach(b=>b.onclick=()=>{ const q=b.dataset.q,k=b.dataset.k; const neu=!(IMP.offen&&IMP.offen.q===q&&IMP.offen.k===k);
    if(neu)IMP.filter={liga:'',saison:'',suche:''}; IMP.offen=neu?{q,k}:null; IMP.seite=0; impCard(P); });
  if(IMP.offen&&el.querySelector('#impListe')){
    const fl=el.querySelector('#impFL'), fs=el.querySelector('#impFS'), fq=el.querySelector('#impFQ'); let tmo=null;
    if(fl)fl.onchange=()=>{ IMP.filter.liga=fl.value; IMP.seite=0; impListe(P); };
    if(fs)fs.onchange=()=>{ IMP.filter.saison=fs.value; IMP.seite=0; impListe(P); };
    if(fq)fq.oninput=()=>{ clearTimeout(tmo); tmo=setTimeout(()=>{ IMP.filter.suche=fq.value.trim(); IMP.seite=0; impListe(P); },350); };
    impListe(P);
  }
}
const IMP_SEITE=40;
async function impListe(P){
  const box=P.querySelector('#impTreffer'); if(!box||!IMP.offen)return;
  const {q,k}=IMP.offen, f=IMP.filter, von=IMP.seite*IMP_SEITE;
  let qu=SVB.sb.from('import_datensaetze').select('record_key,kind,entity,season,league,data,source_url,source_updated_at,checked_at,erstmals,geaendert_am',{count:'exact'}).eq('quelle',q).eq('kind',k);
  if(f.liga)qu=qu.eq('league',f.liga); if(f.saison)qu=qu.eq('season',f.saison);
  if(f.suche){ const s=f.suche.replace(/[,*()%\\]/g,' ').trim(); if(s)qu=qu.or(['lastName','firstName','team_name','club_name','name'].map(x=>`data->>${x}.ilike.*${s}*`).join(',')); }
  const SORT={player_stats:['data->goals',false],player_mvp:['data->fupa_mvp',false],team_total:['data->rank',true],team_home:['data->rank',true],team_away:['data->rank',true],team_form:['data->rank',true]}[k];
  qu=qu.order('season',{ascending:false}).order('league'); if(SORT)qu=qu.order(SORT[0],{ascending:SORT[1],nullsFirst:false});
  const {data,error,count}=await qu.order('record_key').range(von,von+IMP_SEITE-1);
  if(error){ box.innerHTML=`<p class="note">⚠ ${impE(error.message)}</p>`; return; }
  const rows=data||[];
  // MVP-Datensätze tragen nur die Spieler-ID: Namen aus der Spielerstatistik derselben Quelle dazuholen (über die ID, nie über den Namen)
  const ids=[...new Set(rows.filter(r=>r.data&&r.data.player_id&&!r.data.firstName&&!r.data.lastName).map(r=>String(r.data.player_id)))];
  if(ids.length){ try{ const {data:nm}=await SVB.sb.from('import_datensaetze').select('data').eq('quelle',q).eq('kind','player_stats').in('data->>player_id',ids).limit(400);
    const m={}; (nm||[]).forEach(x=>{ const d=x.data||{}; if(d.player_id!=null)m[String(d.player_id)]=[d.firstName,d.lastName].filter(Boolean).join(' '); });
    rows.forEach(r=>{ const n=r.data&&m[String(r.data.player_id)]; if(n)r.data=Object.assign({_name:n},r.data); }); }catch(e){} }
  const mids=[...new Set(rows.filter(r=>(r.kind==='match_lineup'||r.kind==='match_events')&&r.data&&r.data.match_id).map(r=>String(r.data.match_id)))];
  if(mids.length){ try{ const {data:ms}=await SVB.sb.from('import_datensaetze').select('data').eq('quelle',q).eq('kind','match_summary').in('data->>match_id',mids).limit(100);
    const m={}; (ms||[]).forEach(x=>{ const d=x.data||{}; if(d.match_id!=null)m[String(d.match_id)]=impSpiel(d); });
    rows.forEach(r=>{ const t=r.data&&m[String(r.data.match_id)]; if(t)r.data=Object.assign({_spiel:t},r.data); }); }catch(e){} }
  const n=count||0, bis=Math.min(n,von+rows.length);
  // Felder, die die Quelle bei dieser Art nie liefert, zählen je Datensatz nicht als „fehlt“ (sie stehen oben bei „Fehlende Werte“)
  const qa=(((IMP.st&&IMP.st.quellen)||[]).find(x=>x.id===q)||{}).arten||[], art=qa.find(a=>a.kind===k)||{}, nie=new Set((art.fehlend||[]).filter(x=>x.fehlt===art.anzahl).map(x=>x.feld));
  box.innerHTML=rows.length?`<p class="imp-mute" style="margin:4px 0 6px">${impN(n)} ${n===1?'Datensatz':'Datensätze'}${n>IMP_SEITE?`, zeige ${impN(von+1)} bis ${impN(bis)}`:''}</p>
    <ul class="imp-recs">${rows.map((r,i)=>{ const d=r.data||{}, nk=Object.keys(d).filter(x=>x!=='synthetisch'&&x!=='_name'&&x!=='_spiel'&&!impTech(x)&&!nie.has(x)), fehlt=nk.filter(x=>d[x]===null).length;
      const kurz=d.goals!=null||d.assists!=null?` · ${d.goals??'?'} T, ${d.assists??'?'} V`:d.points!=null?` · Platz ${d.rank??'?'}, ${d.points} Pkt`:'';
      const team=d.team_name&&(d.firstName||d.lastName||d._name)?d.team_name+' · ':'';
      return `<li><button class="imp-rec" data-i="${i}"><span class="imp-rn">${impE(impTitel(r))}</span><span class="imp-mute">${impE(team+[r.league?impLiga(r.league):'',impSaison(r.season)].filter(Boolean).join(' · ')+kurz)}${fehlt?` · <span class="imp-warn">${fehlt} fehlt</span>`:''}</span></button></li>`; }).join('')}</ul>
    ${n>IMP_SEITE?`<div class="imp-blaettern"><button class="btn sm ghost" id="impZur"${IMP.seite?'':' disabled'}>Zurück</button><button class="btn sm ghost" id="impVor"${bis<n?'':' disabled'}>Weiter</button></div>`:''}`:'<p class="note">Keine Datensätze für diese Auswahl.</p>';
  box.querySelectorAll('.imp-rec').forEach(b=>b.onclick=()=>impDetail(P,rows[+b.dataset.i]));
  const z=box.querySelector('#impZur'), v=box.querySelector('#impVor');
  if(z)z.onclick=()=>{ IMP.seite=Math.max(0,IMP.seite-1); impListe(P); }; if(v)v.onclick=()=>{ IMP.seite++; impListe(P); };
}
function impDetail(P,r){
  const box=P.querySelector('#impTreffer'); if(!box||!r)return;
  const q=((IMP.st&&IMP.st.quellen)||[]).find(x=>x.id===IMP.offen.q)||{};
  const d=r.data||{};
  const rang=k=>{ const i=IMP_ORD.indexOf(k); return impIstMvp(k)?90:k==='mvp_updated_at'?91:i<0?60:i; };
  const keys=Object.keys(d).filter(x=>x!=='synthetisch'&&x!=='_name'&&x!=='_spiel'&&!['homeTeam','awayTeam','events','home_team','away_team'].includes(x)&&!impTech(x)&&!impIstMvp(x)&&!impIstSim(x)&&x!=='mvp_updated_at').sort((x,y)=>rang(x)-rang(y)||x.localeCompare(y));
  const tech=Object.keys(d).filter(impTech).sort();
  const url=r.source_url||'', http=/^https?:\/\//i.test(url);
  box.querySelector('.imp-det')?.remove();
  const el=document.createElement('div'); el.className='imp-det';
  el.innerHTML=`<div class="imp-det-h"><b>${impE(impTitel(r))}</b>${d.synthetisch===true?'<span class="badge imp-syn">synthetisch</span>':''}<button class="btn sm ghost imp-zu" aria-label="Schließen">${SVI('x')}</button></div>
    <p class="imp-mute" style="margin:0 0 6px">${impE(impKind(r.kind))}${r.league?' · '+impE(impLiga(r.league)):''}${r.season?' · Saison '+impE(impSaison(r.season)):''}</p>
    <table class="imp-kv"><tbody>${keys.map(x=>`<tr><th>${impE(impFeld(x,r.kind))}${impIstSim(x)?'<small>Eigene Näherung aus der KLA-Datenbank, kein Wert von FuPa</small>':''}${impIstMvp(x)?`<small>Wert von ${impE(q.name||'der Quelle')}, eigene Formel der Quelle, nicht bestätigt${d[x]===0?'. 0 kann auch „kein Wert“ bedeuten':''}</small>`:''}</th><td>${impWert(d[x],x)}</td></tr>`).join('')||'<tr><td>Keine Werte</td></tr>'}</tbody></table>
    ${impVerschachtelt(d)}
    <h5>Herkunft</h5>
    <table class="imp-kv"><tbody>
      <tr><th>Quelle</th><td>${impE(q.name||r.quelle||'')}</td></tr>
      <tr><th>Adresse</th><td>${url?(http?`<a href="${impE(url)}" target="_blank" rel="noopener noreferrer">${impE(url)}</a>`:impE(url)):'<i class="imp-fehlt">fehlt</i>'}</td></tr>
      <tr><th>Stand laut Quelle</th><td>${impQuelleZeit(r.source_updated_at)}</td></tr>
      <tr><th>Geprüft von der Quelle</th><td>${impQuelleZeit(r.checked_at)}</td></tr>
      <tr><th>Bei uns seit</th><td>${impZeit(r.erstmals)}${r.geaendert_am&&r.geaendert_am!==r.erstmals?' · zuletzt geändert '+impZeit(r.geaendert_am):''}</td></tr>
      <tr><th>Schlüssel</th><td><code>${impE(r.record_key)}</code>${r.entity?' · '+impE(r.entity):''}${tech.length?'<br><span class="imp-mute">'+tech.map(x=>impE(x)+' '+impE(d[x])).join(' · ')+'</span>':''}</td></tr>
    </tbody></table>`;
  box.prepend(el);
  el.querySelector('.imp-zu').onclick=()=>el.remove();
  el.scrollIntoView({block:'nearest',behavior:'smooth'});
}
function impVerschachtelt(d){ let h='';
  const sp=(t,team)=>{ const ps=(team&&team.players)||[]; if(!ps.length)return '';
    return `<h5>${impE(t)}${team.average_age!=null?' <span class="imp-mute">(Schnitt '+impE(team.average_age)+' Jahre)</span>':''}</h5><div class="imp-tab"><table class="imp-kv imp-aufst"><thead><tr><th>Spieler</th><th>Pos.</th><th>Min.</th><th>T</th><th>V</th></tr></thead><tbody>${ps.filter(p=>!p.coach).map(p=>{ const pl=p.player||{}, st=p.statistics||{};
      return `<tr><td>${impE([pl.firstName,pl.lastName].filter(Boolean).join(' '))}${p.captain?' (C)':''}${p.starting?'':' <span class="imp-mute">Bank</span>'}</td><td>${impE(p.position||'')}</td><td>${st.minutes??''}</td><td>${st.goals??''}</td><td>${st.assists??''}</td></tr>`; }).join('')}</tbody></table></div>`; };
  if(d.homeTeam||d.awayTeam)h+=sp('Heim',d.homeTeam)+sp('Gast',d.awayTeam);
  if(Array.isArray(d.events)&&d.events.length){ const art={goal:'Tor',card:'Karte',substitution:'Wechsel'};
    h+=`<h5>Highlights${d.complete_timeline_verified===false?' <span class="imp-mute">(veröffentlichte Auswahl, nicht vollständig)</span>':''}</h5><ul class="imp-ev">${d.events.map(e=>{ const p=e.primary_role||{};
      return `<li><b>${impE(e.minute!=null?e.minute+(e.additionalMinute?'+'+e.additionalMinute:'')+'.':'')}</b> ${impE(art[e.type]||e.type||'')}${e.homeGoal!=null?' '+impE(e.homeGoal+':'+e.awayGoal):''} ${impE([p.firstName,p.lastName].filter(Boolean).join(' '))}</li>`; }).join('')}</ul>`; }
  return h; }
async function svImportCard(P){ if(!P||typeof isAdmin!=='function'||!isAdmin())return;
  try{ await impLaden(); }catch(e){ IMP.st={quellen:[],fehler:e.message}; }
  impCard(P);
  if(IMP.st&&IMP.st.fehler){ const m=P.querySelector('#impMsg'); if(m)m.textContent='⚠ Importstatus nicht lesbar: '+IMP.st.fehler; }
}
{ const _ar1=svAdminRender; svAdminRender=async function(){ const r=await _ar1.apply(this,arguments); try{ await svImportCard(document.getElementById('panel-admin')); }catch(e){} return r; }; }

/* =====================================================================
   Sportzentrale Beta 0.14 · FuPa-Werte (über die KLA-Datenquelle) in der App
   Der Server ordnet nach jedem Abgleich automatisch FuPa-Spieler den App-Spielern zu (Name UND Verein plus Liga/Tore)
   und legt je Saison Einsätze, Minuten, Startelf, Tore, Vorlagen, Karten, Elf der Woche und den MVP der Quelle ab.
   Hier werden sie geladen und genutzt:
     · MScore: echte Einsatzquote aus Minuten, Vorlagen und MVP der Quelle (manuell eingetragener MVP hat Vorrang)
     · Bestenliste: Einsätze, Minuten und Vorlagen der laufenden Saison
     · Profil: Tabelle „Zahlen von FuPa“ mit Herkunft
   Eigene übernommene Spiele (Training → Spiele) haben weiterhin Vorrang vor FuPa.
   ===================================================================== */
const KLAW={geladen:false,by:{},stand:null,n:0,saison:null};
// Saisonkürzel der App ('2526') ↔ FuPa-Saison ('2025-26'). 'cur' ist die laufende Saison der App-Daten (DATA.season), damit alles zusammenpasst.
function klaSk(sk){ if(sk==='cur')sk=(typeof DATA!=='undefined'&&DATA&&DATA.season)||'2627'; sk=String(sk||''); return /^\d{4}$/.test(sk)?'20'+sk.slice(0,2)+'-'+sk.slice(2):sk; }
function klaVor(s){ const m=/^(\d{4})-\d{2}$/.exec(s||''); if(!m)return null; const y=+m[1]-1; return y+'-'+String((y+1)%100).padStart(2,'0'); }
function klaSaisonKurz(s){ return String(s||'').replace(/^20(\d\d)-(\d\d)$/,'$1/$2'); }
// Mehrere Mannschaften in einer Saison (Wechsel): Werte addieren (null bleibt null). Verein/Liga aus belegter Zugehörigkeit
// (Kader, sonst Einsätze), nie „die mit den meisten Minuten“ allein; mehrere belegte Mannschaften werden alle genannt.
function klaZusammen(rows){ const n=v=>v==null?null:Number(v);
  const s=(k)=>{ let t=null; rows.forEach(r=>{ if(r[k]!=null)t=(t||0)+n(r[k]); }); return t; };
  const bel=rows.filter(r=>r.kader), ein=rows.filter(r=>(n(r.einsaetze)||0)>0), basis=bel.length?bel:ein.length?ein:rows;
  const haupt=basis.slice().sort((a,b)=>(n(b.minuten)||n(b.einsaetze)||0)-(n(a.minuten)||n(a.einsaetze)||0))[0];
  const namen=[...new Set(basis.map(r=>(r.verein||r.mannschaft||'')+(r.squad>1?' '+'I'.repeat(Math.min(3,r.squad)):'')).filter(Boolean))];
  return {season:haupt.season,league:haupt.league,mannschaft:namen.join(' / ')||haupt.mannschaft,teams:rows.length,basis,belegt:bel.length>0||ein.length>0,kaderBelegt:bel.length>0,einsaetze:s('einsaetze'),minuten:s('minuten'),startelf:s('startelf'),
    tore:s('tore'),vorlagen:s('vorlagen'),gelb:s('gelb'),gelbrot:s('gelbrot'),rot:s('rot'),elf:s('elf_der_woche'),mvp:haupt.mvp,mvpStand:haupt.mvp_stand,
    url:haupt.source_url,geprueft:haupt.checked_at,zeilen:rows}; }
async function svKlaLaden(){
  if(typeof canScout!=='function'||!canScout())return;
  try{ const r=await SVB.sb.rpc('kla_saison'); if(!r.error&&r.data)KLAW.saison=r.data; }catch(e){}
  // die letzten Saisons bis zur neuesten (FuPa oder App, je nachdem, was weiter ist)
  const neu=[klaSk('cur'),KLAW.saison&&KLAW.saison.saison].filter(Boolean).sort().pop(), ss=[neu]; while(ss.length<4)ss.push(klaVor(ss[ss.length-1]));
  let all=[], von=0;
  for(let i=0;i<20;i++){ const {data,error}=await SVB.sb.from('import_spielerwerte').select('app_id,season,league,team_season_id,mannschaft,einsaetze,minuten,startelf,tore,vorlagen,gelb,gelbrot,rot,elf_der_woche,mvp,mvp_stand,source_url,checked_at,squad,kader,verein')
      .in('season',ss.filter(Boolean)).order('app_id').order('season').order('team_season_id').range(von,von+999);
    if(error)return; all=all.concat(data||[]); if(!data||data.length<1000)break; von+=1000; }
  const g={}; all.forEach(r=>{ (g[r.app_id]=g[r.app_id]||{}); (g[r.app_id][r.season]=g[r.app_id][r.season]||[]).push(r); });
  const by={}; Object.keys(g).forEach(id=>{ by[id]={}; Object.keys(g[id]).forEach(s=>{ by[id][s]=klaZusammen(g[id][s]); }); });
  KLAW.by=by; KLAW.n=Object.keys(by).length; KLAW.geladen=true; KLAW.stand=all.reduce((m,r)=>r.checked_at&&r.checked_at>m?r.checked_at:m,'');
  if(!KLAW.n)return;   // nichts zugeordnet: nichts neu zeichnen
  klaAnwenden();
  try{ if(typeof sv4Bump==='function')sv4Bump(); if(typeof SV94!=='undefined'){ SV94.cache.clear(); SV94.dist=null; } if(typeof renderAll==='function')renderAll(); }catch(e){}
}
// 25/26 und 24/25 an den Spieler hängen, aber nur wo die App selbst nichts hat (fussball.de-Werte bleiben)
function klaAnwenden(){
  if(typeof players==='undefined')return;
  players.forEach(p=>{ const K=KLAW.by[p.id]; if(!K||p.isJugend)return;
    const b=K[klaSk('2526')];
    if(b){ p.klaB=b; if(p.einsaetze==null&&b.einsaetze!=null)p.einsaetze=b.einsaetze; if(p.min==null&&b.minuten!=null)p.min=b.minuten; if(p.assists==null&&b.vorlagen!=null)p.assists=b.vorlagen; }
    const v=K[klaSk('2425')]; if(v&&p.prev){ p.klaP=v; if(p.prev.spiele==null&&v.einsaetze!=null)p.prev.spiele=v.einsaetze; }
    const c=K[klaSk('cur')]; if(c)p.klaC=c; });
}
// MScore: laufende Saison (ohne eigene übernommene Spiele) mit echten FuPa-Einsätzen, Minuten und Vorlagen
{ const _s=sv94Seasons; sv94Seasons=function(p,r){ const S=_s.apply(this,arguments); const K=KLAW.by[p&&p.id]; if(!K)return S;
  S.forEach(s=>{ const k=K[klaSk(s.k==='cur'?'cur':s.sk)]; if(!k||s.app)return;
    const tsp=s.teamSp||null;
    if(k.einsaetze!=null)s.sp=k.einsaetze;
    if(k.minuten!=null&&tsp){ s.q=Math.min(1,k.minuten/(tsp*90)); s.qF=null; }
    else if(k.einsaetze!=null&&tsp){ s.q=Math.min(1,k.einsaetze/tsp)*0.92; s.qF=null; }
    if(k.tore!=null&&(s.tore==null||k.tore>=s.tore))s.tore=k.tore;
    if(k.vorlagen!=null)s.ast=k.vorlagen;
    s.kla=k; });
  return S; }; }
// MVP: manuell in der App eingetragen hat Vorrang, sonst der Wert von FuPa (0 zählt nicht, zu wenig Minuten auch nicht)
{ const _m=mvpOf; mvpOf=function(p){ const m=_m(p); if(m&&m.src==='app')return m; const K=p&&KLAW.by[p.id]; if(!K)return m;
  const cur=p.cur&&p.cur.spiele>0, pick=[cur?K[klaSk('cur')]:null,K[klaVor(klaSk('cur'))]].find(k=>k&&k.mvp>0&&(k.minuten==null||k.minuten>=270));
  if(!pick)return m; return {v:pick.mvp,d:pick.mvpStand||pick.geprueft||null,src:'fupa',saison:pick.season}; }; }
// Bestenliste: laufende Saison mit FuPa-Einsätzen, falls keine eigenen Spiele übernommen sind
{ const _b=bl93Row; bl93Row=function(p,cfg){ const r=_b.apply(this,arguments); if(!r)return r;
  const k=KLAW.by[p.id]&&KLAW.by[p.id][klaSk(BL93.saison==='cur'?'cur':BL93.saison)]; if(!k||r.quelle==='eure Spiele')return r;
  if(k.einsaetze!=null)r.sp=k.einsaetze; if(k.minuten!=null)r.min=k.minuten;
  if(r.teamSp){ if(k.minuten!=null)r.q=Math.min(1,k.minuten/(r.teamSp*90)); else if(k.einsaetze!=null)r.q=Math.min(1,k.einsaetze/r.teamSp)*0.92; }
  if(k.vorlagen!=null)r.vor=k.vorlagen; r.est=false; r.quelle='FuPa';
  r.games=r.sp!=null?r.sp:r.games; r.tps=r.tore/Math.max(1,r.games); r.tpsB=r.tps*(LIGA_W[r.lv]||1); r.sc=r.tore+(r.vor||0); r.ersatz=r.q!=null&&r.q<0.5;
  return r; }; }
// Profil: Zahlen von FuPa mit Herkunft
function klaProfilHtml(p){ const K=KLAW.by[p.id]; if(!K)return '';
  const rows=Object.keys(K).sort().reverse().map(s=>K[s]);
  const z=v=>v==null?'<i class="imp-fehlt">fehlt</i>':v;
  return `<div class="kla-pf"><div class="m94-h">Zahlen von FuPa</div>
    <div class="imp-tab"><table class="kla-t"><thead><tr><th>Saison</th><th>Einsätze</th><th>Min.</th><th>Startelf</th><th>Tore</th><th>Vorl.</th><th>Karten</th><th>Elf d. W.</th></tr></thead><tbody>
    ${rows.map(k=>`<tr><td>${klaSaisonKurz(k.season)}<small>${svEsc(k.mannschaft||'')}${k.teams>1?' + '+(k.teams-1)+' weitere':''}</small></td><td>${z(k.einsaetze)}</td><td>${k.minuten==null?z(null):k.minuten.toLocaleString('de-DE')}</td><td>${z(k.startelf)}</td><td>${z(k.tore)}</td><td>${z(k.vorlagen)}</td>
      <td>${k.gelb==null&&k.rot==null?z(null):`${k.gelb||0}/${k.gelbrot||0}/${k.rot||0}`}</td><td>${z(k.elf)}</td></tr>`).join('')}
    </tbody></table></div>
    <p class="note small">Quelle: FuPa über die KLA-Datenquelle${KLAW.stand?', geprüft bis '+new Date(KLAW.stand).toLocaleDateString('de-DE'):''}. Automatisch zugeordnet über Name, Verein und Liga. Karten: gelb/gelb-rot/rot.${rows[0]&&rows[0].url?` <a href="${svEsc(rows[0].url)}" target="_blank" rel="noopener noreferrer">Seite bei FuPa</a>`:''}</p></div>`; }
{ const _ph=pf4ScoreHtml; pf4ScoreHtml=function(p,s){ let h=_ph.apply(this,arguments); try{ h+=klaProfilHtml(p); }catch(e){} return h; }; }
// Saison-Zeile im MScore: Herkunft der Einsatzzahlen nennen
{ const _sh=sv94SeasonHtml; sv94SeasonHtml=function(s){ let h=_sh.apply(this,arguments); if(s&&s.kla&&!s.app)h=h.replace(/<\/div>\s*$/,'')+`<p class="m94-note kla-hk">${s.kla.minuten!=null?s.kla.minuten.toLocaleString('de-DE')+' Minuten. ':''}Einsätze, Minuten und Vorlagen laut FuPa.</p></div>`; return h; }; }
// Laden, sobald Anmeldung und Daten da sind
{ let t=0; const iv=setInterval(()=>{ if(++t>240)return clearInterval(iv); if(typeof SVU!=='undefined'&&SVU&&SVU.role&&typeof _remoteDone!=='undefined'&&_remoteDone&&typeof players!=='undefined'&&players.length){ clearInterval(iv); svKlaLaden().catch(()=>{}); } },500); }

/* ---------- Gegner-Vorschau (nächstes Spiel laut FuPa) ---------- */
const KLAG={v:undefined,t:0};
async function klaGegnerLaden(){ if(KLAG.v!==undefined&&Date.now()-KLAG.t<600000)return KLAG.v;
  try{ const {data,error}=await SVB.sb.rpc('kla_gegner_vorschau'); KLAG.v=error?null:data; }catch(e){ KLAG.v=null; } KLAG.t=Date.now(); return KLAG.v; }
function klaErg(x){ return ({win:'S',loss:'N',draw:'U'})[x]||'?'; }
function klaGegnerHtml(v){ if(!v||!v.gegner)return '';
  const t=v.tabelle||{}, f=v.form||{}, d=v.anstoss?new Date(v.anstoss):null;
  const wann=d?d.toLocaleDateString('de-DE',{weekday:'short',day:'2-digit',month:'2-digit',timeZone:'Europe/Berlin'})+', '+d.toLocaleTimeString('de-DE',{hour:'2-digit',minute:'2-digit',timeZone:'Europe/Berlin'})+' Uhr':'';
  return `<div class="card kla-gv" id="klaGegner"><div class="kla-gv-h"><div><small>Nächstes Spiel laut FuPa${v.spieltag?' · '+svEsc(v.spieltag)+'. Spieltag':''}</small><h3>${v.heim?'gegen':'bei'} ${svEsc(v.gegner)}</h3><span class="imp-mute">${svEsc(wann)}${v.wettbewerb?' · '+svEsc(v.wettbewerb):''}</span></div></div>
    <div class="adm-stats">${t.platz!=null?`<div class="adm-stat"><b>${t.platz}.</b><span>Platz${t.mannschaften?' von '+t.mannschaften:''}</span></div>`:''}${t.punkte!=null?`<div class="adm-stat"><b>${t.punkte}</b><span>Punkte aus ${t.spiele??'?'} Spielen</span></div>`:''}${t.tore!=null?`<div class="adm-stat"><b>${t.tore}:${t.gegentore}</b><span>Tore</span></div>`:''}${Array.isArray(f.letzte)&&f.letzte.length?`<div class="adm-stat"><b class="kla-form">${f.letzte.map(x=>`<i class="${x}">${klaErg(x)}</i>`).join('')}</b><span>Form, letzte Spiele</span></div>`:''}</div>
    ${(v.spieler||[]).length?`<div class="m94-h" style="margin-top:12px">Auffällige Spieler beim Gegner</div><ul class="kla-gv-l">${v.spieler.map(s=>`<li${s.app_id&&typeof players!=='undefined'&&players.some(p=>p.id===s.app_id)?` data-pid="${svEsc(s.app_id)}"`:''}><b>${svEsc(s.name.trim())}</b><span>${s.tore} Tor${s.tore===1?'':'e'}${s.vorlagen!=null?', '+s.vorlagen+' Vorl.':''}${s.einsaetze!=null?' · '+s.einsaetze+' Einsätze':''}${s.minuten!=null?', '+s.minuten.toLocaleString('de-DE')+' Min.':''}${s.mvp?' · MVP '+s.mvp:''}</span></li>`).join('')}</ul>`:''}
    <p class="note small">${svEsc(v.hinweis||'')}</p></div>`; }
if(typeof spRender==='function'){ const _sp=spRender; spRender=async function(){ const r=await _sp.apply(this,arguments);
  try{ const P=document.getElementById('panel-gegner'); if(!P||!canScout())return r; const v=await klaGegnerLaden(); const h=klaGegnerHtml(v); if(!h)return r;
    P.querySelector('#klaGegner')?.remove(); const box=document.createElement('div'); box.innerHTML=h; const el=box.firstElementChild;
    const top=P.querySelector('.trtop'); if(top)top.after(el); else P.prepend(el);
    el.querySelectorAll('li[data-pid]').forEach(li=>li.onclick=()=>{ try{ openModal(li.dataset.pid); }catch(e){} }); }catch(e){}
  return r; }; }

/* ---------- Radar: diese Woche laut FuPa ---------- */
const KLAR={v:null,t:0};
async function klaWocheLaden(){ if(KLAR.v&&Date.now()-KLAR.t<600000)return KLAR.v;
  try{ const {data,error}=await SVB.sb.rpc('kla_woche'); KLAR.v=error?[]:(data||[]); }catch(e){ KLAR.v=[]; } KLAR.t=Date.now(); return KLAR.v; }
function klaWocheHtml(L){ const byId=new Map((typeof players!=='undefined'?players:[]).map(p=>[p.id,p]));
  const rows=(L||[]).map(x=>Object.assign({p:byId.get(x.app_id)},x)).filter(x=>x.p&&!x.p.own).slice(0,8); if(!rows.length)return '';
  return `<div class="card kla-wo" id="klaWoche"><div class="m94-h">Diese Woche laut FuPa</div><ul class="kla-gv-l">${rows.map(x=>`<li data-pid="${svEsc(x.p.id)}"><b>${svEsc(x.p.name)}</b><span>${svEsc(x.p.cur&&x.p.cur.club||x.p.club||'')} · ${[x.tore>0?'+'+x.tore+' Tor'+(x.tore>1?'e':''):'',x.vorlagen>0?'+'+x.vorlagen+' Vorl.':'',x.minuten>0?x.minuten+' Min.':''].filter(Boolean).join(', ')}${x.mvp?' · MVP '+x.mvp:''}</span></li>`).join('')}</ul>
    <p class="note small">Vergleich mit dem Stand zu Wochenbeginn, automatisch nach jedem Abgleich. Eigene Spieler sind ausgeblendet.</p></div>`; }
if(typeof rdRender==='function'){ const _rd=rdRender; rdRender=function(){ const r=_rd.apply(this,arguments);
  (async()=>{ try{ const P=document.getElementById('panel-radar'); if(!P||!canScout())return; const h=klaWocheHtml(await klaWocheLaden()); P.querySelector('#klaWoche')?.remove(); if(!h)return;
    const box=document.createElement('div'); box.innerHTML=h; const el=box.firstElementChild; const rd=P.querySelector('.rd4'); if(rd)rd.after(el); else P.prepend(el);
    el.querySelectorAll('li[data-pid]').forEach(li=>li.onclick=()=>{ try{ openModal(li.dataset.pid); }catch(e){} }); }catch(e){} })();
  return r; }; }

/* =====================================================================
   Sportzentrale Beta 0.16 · Liga jetzt statt Liga der Vorsaison
   p.liga ist in der App die Liga der Vorsaison 25/26 (dazu gehören Tore, Platz und Einsätze 25/26) und bleibt so für den MScore.
   Seit der Saisonkorrektur im Datenbestand können Hauptfelder (liga, sub) schon die aktuelle Liga tragen; die alte Einordnung
   steht dann in historical_classification_before_fix. Die App liest beides saisonrichtig:
     Vorsaison  = historical_classification_before_fix (Saison 2025-26), sonst liga/sub
     laufend    = 1) eigene Spieldaten der laufenden Saison (p.cur)  2) Tabelle seines Vereins  3) FuPa, laufende Saison
   Gibt es nichts davon, steht „Stand 25/26“ dran, bei Platz 1 oder 2 der Vorsaison „vermutlich aufgestiegen“.
   Verbandsliga (VL) ist eine eigene Liga. Der Ligafilter der Suche nutzt die aktuelle Liga, damit niemand über den Filter
   eine alte Liga behält.
   ===================================================================== */
try{ if(typeof LIGA_NAME!=='undefined'&&!LIGA_NAME.VL)LIGA_NAME.VL='Verbandsliga'; if(typeof LIGA_W!=='undefined'&&LIGA_W.VL==null)LIGA_W.VL=1.9; if(typeof SV4_LVL!=='undefined'&&SV4_LVL.VL==null)SV4_LVL.VL=115; }catch(e){}
const SVL_FUPA={'herren-gruppenliga-darmstadt':'GL','herren-kreisoberliga-bergstrasse':'KOL','kla-bergstrasse':'A','klb-bergstrasse':'B','klc-bergstrasse':'C','kreisliga-d-1-bergstrasse':'D','kld2-bergstrasse':'D'};
function svLigaCode(l){ l=String(l||''); return /^D\d$/.test(l)?'D':l; }
// Ligakürzel aus dem Quellen-Slug, auch für Ligen außerhalb der Suchauswahl (z. B. Verbandsliga Hessen Süd)
function svlCode(l){ l=String(l||''); if(SVL_FUPA[l])return SVL_FUPA[l]; return (/^kla-/.test(l)||/(^|-)kreisliga-a(-|$)/.test(l))?'A':(/^klb-/.test(l)||/(^|-)kreisliga-b(-|$)/.test(l))?'B':(/^klc-/.test(l)||/(^|-)kreisliga-c(-|$)/.test(l))?'C':/^kld\d?-|^kreisliga-d/.test(l)?'D':/kreisoberliga/.test(l)?'KOL':/gruppenliga/.test(l)?'GL':/verbandsliga/.test(l)?'VL':/hessenliga/.test(l)?'HL':null; }
// cur gilt nur für die laufende Saison: mit Saisonangabe genau diese, ohne Angabe nur mit Datenstand ab Saisonbeginn (1. Juli)
function svCurGilt(c){ if(!c||!c.liga)return false; const s=svSaisonCur(); if(c.season)return c.season===s; return !!(c.stand&&c.stand>=s.slice(0,4)+'-07-01'); }
function svSaisonCur(){ const s=(typeof DATA!=='undefined'&&DATA&&DATA.season)||'2627'; return '20'+s.slice(0,2)+'-'+s.slice(2); }

// Datenbestand saisonrichtig lesen: stehen in liga/sub schon aktuelle Werte, zurück auf die Vorsaison, die aktuelle Liga nach cur
function svLigaNorm(p){
  const h=p&&p.historical_classification_before_fix; if(!h||h.season!=='2025-26'||!h.liga)return;
  if(p.__vs&&p.liga===p.__vs.liga&&p.sub===p.__vs.sub)return;   // schon saisonrichtig
  const jetzt=p.liga, sjetzt=p.sub, cjetzt=p.club, quelle=p.currentClassificationSource||{};
  if(jetzt&&jetzt!==h.liga&&(!quelle.season||quelle.season===svSaisonCur())){
    p.cur=Object.assign({}, p.cur||{});
    if(!p.cur.liga){ p.cur.liga=jetzt; if(sjetzt&&!p.cur.sub)p.cur.sub=sjetzt; }
    if(!p.cur.club)p.cur.club=cjetzt;
  }
  p.liga=h.liga; p.sub=h.sub!=null?h.sub:null; if(h.club)p.club=h.club;
  p.__vs={liga:p.liga,sub:p.sub};
}
function svLigaNormAlle(){ try{ if(typeof players!=='undefined')players.forEach(svLigaNorm); }catch(e){} }
svLigaNormAlle();

function svLigaJetzt(p){
  if(!p)return null;
  const alt=svLigaCode(p.liga);
  if(p.isJugend)return {liga:alt,jetzt:true,quelle:'app',club:p.club};
  // FuPa, laufende Saison: nur belegte Mannschaftszugehörigkeit (Kader oder Einsätze), mehrere Mannschaften bleiben mehrere
  const K=typeof KLAW!=='undefined'&&KLAW.by&&KLAW.by[p.id], k=K&&typeof klaSk==='function'&&K[klaSk('cur')];
  if(k&&k.belegt){ const codes=[...new Set((k.basis||[]).map(r=>svlCode(r.league)||r.league||'unbekannt'))];
    return {liga:codes.join('/')||'unbekannt',jetzt:true,quelle:'FuPa '+(k.kaderBelegt?'Kader':'Einsätze'),club:k.mannschaft||p.club,mehrere:codes.length>1||(k.basis||[]).length>1}; }
  if(svCurGilt(p.cur))return {liga:svLigaCode(p.cur.liga),jetzt:true,quelle:p.cur.season?'Datenbestand '+p.cur.season:'Spieldaten',club:p.cur.club||p.club,rank:p.cur.rank,teamCount:p.cur.teamCount};
  const cs=(typeof DATA!=='undefined'&&DATA&&DATA.season)||'2627';
  const cl=typeof clubFor==='function'?clubFor(p.club):null, s=cl&&cl['s'+cs];
  if(s&&s.liga)return {liga:svLigaCode(s.liga),jetzt:true,quelle:'verein',club:p.club,rank:s.platz};
  const s0=cl&&cl.s2526;
  return {liga:alt,jetzt:false,quelle:'alt',club:p.club,auf:!!(s0&&s0.platz!=null&&s0.platz<=2&&alt!=='D')}; }
function svLigaHinweis(L){ return L&&!L.jetzt?'Stand 25/26'+(L.auf?', vermutlich aufgestiegen':''):''; }
function svLigaName(l){ const extra={'landesliga-rhein-neckar':'Landesliga Rhein-Neckar','herren-landesliga-ost-suedwest':'Landesliga Ost Südwest','unbekannt':'Liga unbekannt'}; return (typeof LIGA_NAME!=='undefined'&&LIGA_NAME[l])||extra[l]||(l?String(l).replace(/^herren-/, '').split('-').map(w=>w.charAt(0).toUpperCase()+w.slice(1)).join(' '):'Liga unbekannt'); }
function svLigaText(p){ const L=svLigaJetzt(p); if(!L)return ''; const h=svLigaHinweis(L); return h?L.liga.split('/').map(svLigaName).join(' / ')+' ('+h+')':L.liga.split('/').map(svLigaName).join(' / '); }
function svLigaZeile(p){ const L=svLigaJetzt(p); return (L&&L.club||p.club||'')+' · '+svLigaText(p); }

// Wechselchance: Liga und Tabellenplatz der laufenden Saison; Gründe aus der Vorsaison sind als 25/26 gekennzeichnet. MScore bleibt unverändert.
const SVL_VS=/Spielzeit|Teamspielen|Teamtore|Torschützenkönig/;
{ const _w=wscore; wscore=function(p){
  if(!p||p.own)return _w.apply(this,arguments);
  const L=svLigaJetzt(p);
  if(!L||!L.jetzt){ const r=_w.apply(this,arguments);
    if(r&&L)r.f.forEach(x=>{ if(/Gruppenliga|Kreisoberliga|\(KOL\)|Kreisliga [BCD]/.test(x[1]))x[1]+=' ('+svLigaHinweis(L)+')'; });
    return r; }
  const q=Object.create(p); q.liga=L.liga; q.rank=L.rank!=null?L.rank:null; q.teamCount=L.rank!=null?(L.teamCount||p.teamCount):null;
  const s=scores(p), _s=scores; scores=function(x){ return x===q?s:_s.apply(this,arguments); };
  let r; try{ r=_w.call(this,q); } finally{ scores=_s; }
  if(!r)return r;
