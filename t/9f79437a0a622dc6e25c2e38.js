  return r; }; }

/* ---------- Rankings & Verein: Beteiligung über mehrere Saisons ---------- */
{ const _vr50=vrRender; vrRender=function(){
  const bet=VR.view==='bet'; if(bet)VR.view='rank';
  const r=_vr50.apply(this,arguments);
  try{ if(!canTraining()){ return r; }
    const P=document.getElementById('panel-verein'), tabs=P&&P.querySelector('.trtabs'); if(!tabs)return r;
    const rk=tabs.querySelector('[data-vrv="rank"]'); const b=document.createElement('button'); b.dataset.vrv='bet'; b.textContent='Beteiligung'; if(rk)rk.after(b); else tabs.appendChild(b);
    b.onclick=()=>{ VR.view='bet'; vrRender(); };
    if(bet){ VR.view='bet'; tabs.querySelectorAll('button').forEach(x=>x.classList.toggle('on',x===b));
      const B=document.getElementById('vrBody'); if(B){ if(typeof SV41!=='undefined'&&!SV41.betLoaded&&!SV41.betBusy&&typeof sv41LoadBet==='function')sv41LoadBet().then(()=>{ if(SV41.betLoaded&&VR.view==='bet'&&svCurTab()==='verein')vrRender(); });
        tm41Bet(B); } }
  }catch(e){ console.warn('Beteiligung',e); }
  return r; }; }

/* ---------- Erklärkasten je Ansicht ---------- */
// w: was, f: wofür, h: warum hier, s: so geht's, b: Beispiele
const SV50_INFO={
  'training:players':{w:'Alle Spieler der laufenden Saison, getrennt nach 1. und 2. Mannschaft, mit den wichtigsten Angaben auf einen Blick.',
    f:'Du siehst sofort, wer verfügbar ist, wie es um Training und Form steht und wo noch Angaben fehlen.',
    h:'Hier geht es um die Mannschaft von heute. Die Planung für die nächsten Jahre steht unter Kader, alles Saisonübergreifende unter Rankings & Verein.',
    s:'Oben eine Ansicht wählen, auf eine Spalte tippen zum Sortieren, auf einen Namen für das Profil.',
    b:['Vor dem Spieltag nach Beteiligung sortieren und sehen, wer zuletzt gefehlt hat.','Filter „Lücken“: wer hat noch keinen starken Fuß oder keine Handynummer hinterlegt?']},
  'training:sessions':{w:'Die einzelnen Trainingseinheiten: wer da war, wie die Einheit lief, Noten und Notizen je Spieler.',
    f:'Beteiligung und Eindrücke laufen mit, ganz ohne Excel-Liste.',
    h:'Hier wird erfasst. Die Auswertung der laufenden Saison liegt direkt daneben unter Statistik, alles Saisonübergreifende unter Rankings & Verein.',
    s:'Nach dem Training dem Co-Trainer kurz erzählen, wie es war. Die Anwesenheit kommt aus der Abstimmung, du korrigierst nur Abweichungen.',
    b:['„Gutes Training, Tim und Ben fehlten wegen Arbeit, Max war richtig stark.“','Wer nicht erwähnt wird, bekommt automatisch eine 3 und ist als Annahme markiert.']},
  'training:home':{w:'Die Auswertung der laufenden Saison: Beteiligung, Durchschnittsnoten, Entwicklungen und Auffälligkeiten.',
    f:'Früh sehen, wer nachlässt oder durchstartet, bevor es auf dem Platz auffällt.',
    h:'Nur diese Saison, weil das für die tägliche Arbeit zählt. Mehrjährige Vergleiche findest du unter Rankings & Verein.',
    s:'Hinweise antippen, um direkt zu reagieren. In der Tabelle auf eine Spalte tippen zum Sortieren.',
    b:['Einer rutscht in vier Wochen von 90 auf 60 Prozent Beteiligung: Gespräch suchen.','Durchschnittsnote 2 bei hoher Beteiligung: Kandidat für mehr Einsatzzeit.']},
  'training:games':{w:'Die Pflichtspiele der Saison mit Startelf, Einwechslungen, Minuten, Toren und Vorlagen.',
    f:'Einsätze sauber festhalten und mit FuPa und fussball.de abgleichen.',
    h:'Wie beim Training geht es um die laufende Saison. Ewige Tabellen und Allzeit-Statistiken stehen unter Rankings & Verein.',
    s:'FuPa-Datei übernehmen oder den Spielbericht vom Co-Trainer auslesen lassen. Du prüfst die Vorschau, dann wird gespeichert.',
    b:['Nach dem Wochenende die FuPa-Datei hochladen: Minuten und Vorlagen sind in einer Minute drin.','Weicht das Ergebnis von fussball.de ab, markiert die App das Spiel zum Prüfen.']},
  'training:injuries':{w:'Wer gerade verletzt ist, seit wann, und wann er voraussichtlich zurückkommt.',
    f:'Ausfälle fließen automatisch in Planung, Aufstellung und die Hinweise des Co-Trainers ein.',
    h:'Verletzungen betreffen die Mannschaft von heute, deshalb stehen sie hier und nicht im Kader.',
    s:'Am einfachsten dem Co-Trainer erzählen. Er fragt nach, wenn Diagnose oder Prognose fehlen.',
    b:['„Jonas hat sich am Sonntag das Sprunggelenk verdreht, der Arzt sagt drei Wochen.“']},
  'kabine:abst':{w:'Wer kommt zum Training oder Spiel? Die Abstimmungen per Link und die Automatik, die sie verschickt.',
    f:'Die Zusagen landen direkt als Anwesenheit im Training, du änderst nur noch Abweichungen.',
    h:'Abstimmung und Automatik gehören zusammen, deshalb stehen sie auf einer Seite.',
    s:'Oben die laufenden Abstimmungen, darunter Automatik und Kabinen-Link.',
    b:['Dienstag und Donnerstag wird automatisch abgestimmt, der Link geht am Vortag raus.']},
  kader:{w:'Welche Spieler dir heute und in den nächsten beiden Saisons auf jeder Position zur Verfügung stehen.',
    f:'Daraus erkennt die App offene Kaderplätze und macht daraus Bedarfe fürs Scouting.',
    h:'Hier wird geplant, nicht erfasst. Was heute auf dem Platz passiert, steht unter Mannschaft.',
    s:'Saison wählen, Spieler antippen und die Zukunft festlegen. Leere Plätze zeigen, wo etwas fehlt.',
    b:['Ein Spieler ist nächste Saison für die Zweite geplant. Auf seiner Position in der Ersten entsteht ein Bedarf.']},
  gespr:{w:'Die Gespräche mit den eigenen Spielern: letzter Stand, offene Themen, Tendenz für die Zukunft.',
    f:'Die Kaderplanung beruht so auf echten Aussagen und nicht nur auf Annahmen.',
    h:'Gespräche entscheiden über die Zukunft im Kader, deshalb gehören sie hierher.',
    s:'Nach dem Training oder Spiel dem Co-Trainer erzählen, was besprochen wurde. Er hält das Wesentliche fest.',
    b:['„Mit Tim gesprochen, er will bleiben, möchte aber mehr Spielzeit.“']},
  ejugend:{w:'Unsere A- und B-Jugend mit Statistik, Entwicklung und Einschätzungen der Trainer.',
    f:'Früh sehen, wer den Sprung zu den Aktiven schaffen kann.',
    h:'Die eigene Jugend ist Teil unserer Kaderplanung. Fremde Jugendspieler stehen im Scouting.',
    s:'Spieler antippen für Details und Einschätzung.',
    b:['Ein A-Jugendlicher trifft regelmäßig: im Kaderplan für die nächste Saison einplanen.']},
  sxi:{w:'Deine Wunschelf für Rückrunde, nächste und übernächste Saison, auch mit Spielern, die noch nicht zugesagt haben.',
    f:'Frei planen, ohne den verbindlichen Kaderplan zu verfälschen.',
    h:'Wunschspieler gehören hierhin. Im Kaderplan stehen nur Spieler, mit denen es wirklich Gespräche gibt.',
    s:'Zeitraum wählen, Position antippen und einen Spieler setzen.',
    b:['Für die nächste Saison einen Wunsch-Sechser eintragen und mit dem aktuellen Kader vergleichen.']},
  kaderplan:{w:'Rollen, Stärken und starker Fuß im aktuellen Kader.',
    f:'Nicht nur zählen, wer da ist, sondern sehen, was fehlt: Tempo, Kopfball, Linksfüße.',
    h:'Das ist die qualitative Seite der Kaderplanung und gehört deshalb zum Kader.',
    s:'Spieler antippen und Rollen oder Skills zuordnen.',
    b:['Nur ein Linksfuß in der Abwehr: Bedarf für einen linken Innenverteidiger anlegen.']},
  scout:{w:'Alle Spieler der Region mit den wichtigsten Kennzahlen, filterbar und sortierbar.',
    f:'Den passenden Spieler für einen Bedarf finden.',
    h:'Hier beginnt die Suche. Wer interessant ist, kommt auf die Merkliste oder zu den Kandidaten.',
    s:'Filter setzen und sortieren. Nach rechts wischen heißt kein Interesse, nach links Merkliste.',
    b:['Stürmer unter 23 im Umkreis von 15 Kilometern mit mindestens zehn Toren.']},
  bedarf:{w:'Die offenen Bedarfe aus dem Kaderplan und die Suchaufträge dazu.',
    f:'Vom Loch im Kader direkt zu passenden Spielern.',
    h:'Der Bedarf entsteht im Kader, gesucht wird im Scouting. Hier treffen sich beide.',
    s:'Bedarf öffnen, Vorschläge prüfen und bei Bedarf einen KI-Auftrag starten.',
    b:['Linker Verteidiger für die nächste Saison: die App schlägt passende Spieler vor, die KI prüft die besten.']},
  kandidaten:{w:'Externe Spieler, bei denen es konkret wird: Kontakt, Wechselchance und wer sich kümmert.',
    f:'Keiner geht verloren und jeder weiß, wer dran ist.',
    h:'Kandidaten sind der Schritt zwischen Spielermarkt und Kaderplan.',
    s:'Letzten Kontakt eintragen, Wechselchance einschätzen, Zuständigkeit festlegen.',
    b:['Seit vier Wochen kein Kontakt: die App erinnert den Zuständigen.']},
  radar:{w:'Automatische Meldungen: Torserien, heiße Läufe und Rohdiamanten.',
    f:'Auffälligkeiten sehen, die in keiner Liste stehen.',
    h:'Das Radar sucht von selbst und liefert Hinweise, bevor andere Vereine sie haben.',
    s:'Meldung antippen. Nach rechts wischen heißt erledigt, bei Spielern kein Interesse.',
    b:['Ein Stürmer aus der B-Klasse trifft fünfmal in Folge: nach links auf die Merkliste.']},
  totw:{w:'Die auffälligsten Spieler eines Spieltags in der Region.',
    f:'Formstarke Spieler schnell entdecken.',
    h:'Es geht um fremde Spieler, deshalb steht die Elf der Woche im Scouting.',
    s:'Spieltag wählen und Spieler antippen.',
    b:['Wer zweimal hintereinander drin ist, lohnt einen zweiten Blick.']},
  jugend:{w:'A-Jugendliche anderer Vereine aus der Region.',
    f:'Talente früh auf dem Schirm haben.',
    h:'Unsere eigene Jugend steht im Kader, hier erscheinen nur fremde Spieler.',
    s:'Filtern und antippen. Angesprochen wird immer über Eltern oder Jugendtrainer.',b:[]},
  cmp:{w:'Spieler einer Position oder eines Auftrags nebeneinander.',
    f:'Entscheidungen zwischen zwei oder drei Kandidaten treffen.',
    h:'Der Vergleich ist der letzte Schritt im Scouting, bevor ein Spieler Kandidat wird.',
    s:'Bis zu drei Spieler wählen.',b:[]},
  verein:{w:'Rankings, Beteiligung über mehrere Saisons, Helfer und Veranstaltungen, Allzeit-Statistik und Legenden.',
    f:'Das große Bild über mehrere Jahre.',
    h:'Alles Saisonübergreifende ist hier gebündelt, damit Mannschaft, Kader und Scouting schlank bleiben.',
    s:'Oben den Bereich wählen.',
    b:['Die Trainingsbeteiligung der letzten Saisons vergleichen.']},
  gegner:{w:'Der nächste Gegner in Zahlen: Saisonverlauf, Spielberichte, Tore, Karten und Startelf.',
    f:'Gezielt auf den Spieltag vorbereiten.',
    h:'Ein eigener Bereich, weil er nur rund um den Spieltag gebraucht wird.',
    s:'Spiel wählen, in der Kurve ein Wappen antippen und den Spielbericht lesen.',b:[]}
};
function sv50Key(){
  const t=svCurTab();
  if(t==='training')return 'training:'+(TR.view==='bet'?'players':TR.view);
  if(t==='kabine')return KB.view==='kasse'?'kasse':'kabine:abst';
  return t;
}
const sv50Closed=()=>{ try{ return JSON.parse(localStorage.getItem('svInfo50')||'{}'); }catch(e){ return {}; } };
function sv50InfoBox(P){
  if(!P||!P.classList.contains('active'))return;
  const team=(typeof canTraining==='function'&&canTraining())||(typeof canScout==='function'&&canScout());   // Gäste sehen nur Ausschnitte, der Kasten würde mehr versprechen
  const k=sv50Key(), I=team?SV50_INFO[k]:null; let box=P.querySelector(':scope > .info50');
  if(!I){ if(box)box.remove(); return; }
  if(box&&box.dataset.k===k)return;
  if(box)box.remove();
  const closed=sv50Closed()[k]!==0;   // 0.74: standardmäßig zu, nur offen, wenn jemand sie aufgeklappt hat
  box=document.createElement('div'); box.className='info50'+(closed?' zu':''); box.dataset.k=k;
  box.innerHTML=`<button type="button" class="info50-h" aria-expanded="${!closed}">${SVI('info')}<span>${closed?'Worum geht es hier?':'So funktioniert diese Ansicht'}</span><i>${closed?'anzeigen':'einklappen'}</i></button>
    <div class="info50-b"><p><b>${svEsc(I.w)}</b> ${svEsc(I.f)}</p><p class="info50-h2">${svEsc(I.h)}</p><p><b>So geht's:</b> ${svEsc(I.s)}</p>${(I.b||[]).length?`<ul>${I.b.map(x=>`<li>${svEsc(x)}</li>`).join('')}</ul>`:''}</div>`;
  box.querySelector('.info50-h').onclick=()=>{ const c=sv50Closed(); if(box.classList.contains('zu'))c[k]=0; else c[k]=1; try{ localStorage.setItem('svInfo50',JSON.stringify(c)); }catch(e){} box.remove(); sv50InfoBox(P); };
  P.prepend(box);
}
{ const seen=new WeakSet(); const hook=()=>{ document.querySelectorAll('main .panel').forEach(P=>{ if(seen.has(P))return; seen.add(P);
    new MutationObserver(()=>{ if(P.classList.contains('active'))sv50InfoBox(P); }).observe(P,{childList:true,attributes:true,attributeFilter:['class']}); }); };
  const t=setInterval(()=>{ if(document.querySelector('main .panel')){ hook(); clearInterval(t); const a=document.querySelector('main .panel.active'); if(a)sv50InfoBox(a); } },300); }
// „Eigene Jugend“ ist jetzt ein Reiter im Kader. Eigener Eintrag in der Seitenleiste nur noch für Jugendtrainer ohne Kaderzugang.
{ const _nv50=sv4NavVis; sv4NavVis=function(){ const r=_nv50.apply(this,arguments);
  try{ if(svTabAllowed('kader'))document.querySelectorAll('.snav [data-tab="ejugend"],.sgrid [data-sheet="ejugend"]').forEach(b=>b.style.display='none'); }catch(e){}
  return r; }; }

/* ---------- Mannschaft → Spieler: die zentrale Liste der laufenden Saison ---------- */
const SV50={preset:'trainer',team:'alle',q:'',luecken:false,sort:null,dir:1};
function sv50Start(){ return typeof VR_SEASON_START!=='undefined'?VR_SEASON_START:(trToday().slice(0,4)+'-07-01'); }
function sv50Stat(p){
  const start=sv50Start(), today=trToday(), R=TRC.rows(TR.st,p.id).filter(r=>r.d>=start), s=TRC.playerStats(TR.st,p.id,today);
  const cnt=R.filter(r=>!(r.st==='weg'&&TRC.EXCUSE_NEUTRAL[r.g])), bet=cnt.length?cnt.filter(r=>r.st!=='weg').length/cnt.length:null;
  const echt=R.filter(r=>r.no!=null&&r.ns!=='default'), noten=R.filter(r=>r.no!=null);
  const avgN=L=>L.length?L.reduce((a,r)=>a+r.no,0)/L.length:null;
  const G=TR.st.sessions.filter(x=>x.t==='spiel'&&x.d>=start); let ein=0,start11=0,min=0,tore=0,vor=0,minKnown=false;
  G.forEach(g=>{ const a=(g.a||[]).find(x=>x[0]===p.id); if(!a)return; if(a[1]==='da'||a[1]==='spaet'){ ein++; if(a[1]==='da')start11++; if(a[11]!=null){ min+=a[11]; minKnown=true; } } tore+=a[6]||0; vor+=a[7]||0; });
  return {bet,n:cnt.length,rate28:s.rate28,last:s.lastSeen,inj:s.injury,note:avgN(echt),noteN:echt.length,noteAll:avgN(noten),ein,start11,min:minKnown?min:null,tore,vor,spiele:G.length};
}
function sv50Luecken(p){
  const k=typeof kxOf==='function'?kxOf(p.id):{}, L=[];
  if(!p.pos)L.push('Position'); if(!p.fuss)L.push('Fuß'); if(p.alter==null&&!p.geb)L.push('Alter');
  if(typeof KX!=='undefined'&&KX.loaded&&!k.tel)L.push('Handy');
  return L;
}
const SV50_PRESETS={
  trainer:{t:'Trainer',cols:['pos','alter','bet','r28','note','ein','min','tore','last','status']},
  planung:{t:'Kaderplanung',cols:['pos','pos2','alter','fuss','mscore','zuk','status']},
  kontakte:{t:'Kontakte',cols:['pos','tel','mail','luecken']},
  tw:{t:'Torhüter',cols:['alter','bet','note','ein','min','last','status'],only:p=>p.pos==='TW'}
};
const SV50_COLS={
  pos:{t:'Pos',v:(p)=>TR_POS.indexOf(p.pos)<0?99:TR_POS.indexOf(p.pos),h:(p)=>svEsc(p.pos||'–')},
  pos2:{t:'Auch',v:(p)=>(p.pos2||[]).length?0:1,h:(p)=>svEsc((p.pos2||[]).join(', ')||'–')},
  alter:{t:'Alter',v:(p)=>p.alter==null?999:p.alter,h:(p)=>p.alter!=null?p.alter+(p.alterCa||!p.geb?'~':''):'<i class="miss50">?</i>'},
  fuss:{t:'Fuß',v:(p)=>p.fuss||'~',h:(p)=>p.fuss?svEsc(p.fuss):'<i class="miss50">?</i>'},
  bet:{t:'Beteiligung',v:(p,s)=>s.bet==null?-1:s.bet,h:(p,s)=>s.bet==null?'–':`<span class="trpill ${trRateCls(s.bet)}">${Math.round(s.bet*100)} %</span> <small>${s.n}×</small>`,d:-1},
  r28:{t:'4 Wochen',v:(p,s)=>s.rate28==null?-1:s.rate28,h:(p,s)=>s.rate28==null?'–':Math.round(s.rate28*100)+' %',d:-1},
  note:{t:'Ø Note',v:(p,s)=>s.note==null?9:s.note,h:(p,s)=>s.note!=null?`<b class="note50 n${Math.round(s.note)}">${s.note.toFixed(1).replace('.',',')}</b> <small>${s.noteN}×</small>`:s.noteAll!=null?'<small title="Nur Standardwerte, noch keine echte Bewertung">3 · Annahme</small>':'–'},
  ein:{t:'Einsätze',v:(p,s)=>-s.ein,h:(p,s)=>s.ein?`${s.ein} <small>(${s.start11} S11)</small>`:'–'},
  min:{t:'Min.',v:(p,s)=>-(s.min||0),h:(p,s)=>s.min!=null?s.min:'–'},
  tore:{t:'T / V',v:(p,s)=>-(s.tore*10+s.vor),h:(p,s)=>s.tore||s.vor?`${s.tore} / ${s.vor}`:'–'},
  last:{t:'Zuletzt da',v:(p,s)=>s.last?-Number(s.last.replace(/-/g,'')):0,h:(p,s)=>s.last?TRC.fmt(s.last):'–'},
  status:{t:'Status',v:(p,s)=>s.inj?0:1,h:(p,s)=>s.inj?`<span class="trpill bad">🩹 ${svEsc(s.inj.dg)}</span>`:(p.kader===2&&SV50.team==='alle'?'<small>II</small>':'<span class="ok50">verfügbar</span>')},
  mscore:{t:'MScore',v:(p)=>{ try{ return -scores(p).total; }catch(e){ return 0; } },h:(p)=>{ try{ const t=Math.round(scores(p).total); return `<b style="color:${tierColor(t)}">${t}</b>`; }catch(e){ return '–'; } }},
  zuk:{t:'Nächste Saison',v:(p)=>{ const z=sv50Zuk(p); return z?z[0]:'~'; },h:(p)=>{ const z=sv50Zuk(p); return z?`<span class="z50 ${z[1]}">${svEsc(z[0])}</span>`:'<small>offen</small>'; }},
  tel:{t:'Handy',v:(p)=>(kxOf(p.id).tel?0:1),h:(p)=>{ const k=kxOf(p.id); return k.tel?`<a href="${svEsc(kxWa(k.tel))}" target="_blank" rel="noopener" data-stop50>${svEsc(kxTelFmt(k.tel))}</a>${k.optout?' <small>abgemeldet</small>':''}`:'<i class="miss50">fehlt</i>'; }},
  mail:{t:'E-Mail',v:(p)=>(kxOf(p.id).email?0:1),h:(p)=>{ const k=kxOf(p.id); return k.email?`<a href="mailto:${svEsc(k.email)}" data-stop50>${svEsc(k.email)}</a>`:'<i class="miss50">fehlt</i>'; }},
  luecken:{t:'Lücken',v:(p)=>-sv50Luecken(p).length,h:(p)=>{ const L=sv50Luecken(p); return L.length?`<span class="miss50">${L.map(svEsc).join(', ')}</span>`:'<span class="ok50">vollständig</span>'; }}
};
function sv50Zuk(p){ try{ if(typeof SV4==='undefined'||!SV4.loaded)return null; const z=sv4Zuk(p,sv4SAdd(sv4S(),1)); return z&&SV4_ZUK[z]?SV4_ZUK[z]:null; }catch(e){ return null; } }
function sv50Squad(){
  return players.filter(p=>p.own&&!p.isJugend&&!p.verzicht).map(p=>({p,team:p.kader===2||/ II$/.test(p.club||'')?'2':'1'}));
}
// 0.74: am Handy Karten statt Querscroll-Tabelle. Name, Position und Alter vorn, dazu zwei Werte der gewählten Ansicht.
function sv50Karten(L,cols,luecken){
  const kc=cols.filter(c=>SV50_COLS[c]&&!['pos','pos2','alter','fuss'].includes(c)).slice(0,2);
  return `<div class="sp50-karten" role="list">${L.map(({p,s})=>{ const lk=luecken?sv50Luecken(p):[]; return `<button type="button" class="sp50-k" role="listitem" data-svp="${svEsc(p.id)}">
      <span class="sp50-kn"><b>${svEsc(p.name)}</b><small>${svEsc(p.pos||'')}${p.alter!=null?' · '+p.alter+' J.':''}${lk.length?` · <i class="gap50">${lk.length} fehlt</i>`:''}</small></span>
      <span class="sp50-kw">${kc.map(c=>{ let h=''; try{ h=SV50_COLS[c].h(p,s); }catch(e){} return `<span><small>${SV50_COLS[c].t}</small>${h}</span>`; }).join('')}</span>${SVI('chev')}</button>`; }).join('')}</div>`;
}
trViewPlayers=function(B){
  // Kontakte und Kaderplan je Sitzung nur einmal nachladen (sonst Endlosschleife, wenn es keine Rechte gibt oder das Laden schon läuft)
  const again=()=>{ if(svCurTab()==='training'&&TR.view==='players')trRender(); };
  if(typeof kxLoad==='function'&&!KX.loaded&&!SV50.kxTry&&typeof kxOk==='function'&&kxOk()){ SV50.kxTry=1; kxLoad().then(()=>{ if(KX.loaded)again(); }); }
  if(typeof SV4!=='undefined'&&!SV4.loaded&&!SV4.loading&&!SV50.sv4Try&&typeof sv4Load==='function'&&typeof sv4Can==='function'&&sv4Can()){ SV50.sv4Try=1; sv4Load().then(()=>{ if(SV4.loaded)again(); }); }
  const P=SV50_PRESETS[SV50.preset]||SV50_PRESETS.trainer, cols=P.cols;
  const q=TRC.N(SV50.q||'');
  let rows=sv50Squad().filter(x=>(!P.only||P.only(x.p))&&(SV50.team==='alle'||x.team===SV50.team)&&(!q||TRC.N(x.p.name).includes(q))).map(x=>Object.assign(x,{s:sv50Stat(x.p)}));
  if(SV50.luecken)rows=rows.filter(x=>sv50Luecken(x.p).length);
  const sk=SV50.sort&&cols.includes(SV50.sort)?SV50.sort:null;
  rows.sort((a,b)=>{ if(sk){ const va=SV50_COLS[sk].v(a.p,a.s), vb=SV50_COLS[sk].v(b.p,b.s); if(va!==vb)return (va<vb?-1:1)*SV50.dir; }
    const pi=p=>{ const i=TR_POS.indexOf(p.pos); return i<0?99:i; }; return (pi(a.p)-pi(b.p))||a.p.name.localeCompare(b.p.name,'de'); });
  const table=L=>`<div class="trtw"><table class="trtab t50"><thead><tr><th class="nm50"><button data-s50="">Spieler</button></th>${cols.map(c=>`<th><button data-s50="${c}" class="${sk===c?'on':''}">${SV50_COLS[c].t}${sk===c?(SV50.dir>0?' ▲':' ▼'):''}</button></th>`).join('')}</tr></thead>
    <tbody>${L.map(({p,s})=>{ const lk=sv50Luecken(p); return `<tr data-svp="${svEsc(p.id)}"><td class="nm50"><b>${svEsc(p.name)}</b>${lk.length&&SV50.preset!=='kontakte'?` <i class="gap50" title="Es fehlt: ${svEsc(lk.join(', '))}">${lk.length}</i>`:''}</td>${cols.map(c=>`<td>${SV50_COLS[c].h(p,s)}</td>`).join('')}</tr>`; }).join('')}</tbody></table></div>`;
  const karten=L=>sv50Karten(L,cols,SV50.preset!=='kontakte');
  const groups=SV50.team==='alle'?[['1','1. Mannschaft'],['2','2. Mannschaft']]:[[SV50.team,SV50.team==='1'?'1. Mannschaft':'2. Mannschaft']];
  const total=rows.length, gaps=sv50Squad().filter(x=>sv50Luecken(x.p).length).length;
  B.innerHTML=`<div class="card sp50">
      <div class="sp50-bar"><div class="chips4 sp50-pre">${Object.entries(SV50_PRESETS).map(([k,v])=>`<button type="button" class="${SV50.preset===k?'on':''}" data-pre50="${k}">${v.t}</button>`).join('')}</div>
        <div class="sp50-f"><input type="search" id="sp50q" placeholder="Name suchen" value="${svEsc(SV50.q)}"><div class="chips4">${[['alle','Alle'],['1','Erste'],['2','Zweite']].map(([k,t])=>`<button type="button" class="${SV50.team===k?'on':''}" data-team50="${k}">${t}</button>`).join('')}
          <button type="button" class="${SV50.luecken?'on':''}" data-gap50>Lücken${gaps?' ('+gaps+')':''}</button></div></div></div>
      ${groups.map(([t,l])=>{ const L=rows.filter(x=>x.team===t); return L.length?`<h3 class="trh sp50-h">${l} <small>${L.length}</small></h3>${table(L)}${karten(L)}`:''; }).join('')||'<div class="empty">Keine Spieler für diese Auswahl.</div>'}
      <div class="note">${total} Spieler. Beteiligung und Noten zählen ab ${TRC.fmt(sv50Start())}${sv50Start().slice(0,4)}. „Annahme“ heißt: automatisch vergebene 3, weil nichts gesagt wurde. Die Zahl am Namen zeigt fehlende Angaben.</div>
      ${SV50.preset==='kontakte'?`<div class="btnrow"><button type="button" class="btn ghost sm" data-kx50>${SVI('phone')} Kontakte bearbeiten und importieren</button></div>`:''}
    </div>`;
  B.querySelectorAll('[data-pre50]').forEach(b=>b.onclick=()=>{ SV50.preset=b.dataset.pre50; SV50.sort=null; trViewPlayers(B); });
  B.querySelectorAll('[data-team50]').forEach(b=>b.onclick=()=>{ SV50.team=b.dataset.team50; trViewPlayers(B); });
  B.querySelector('[data-gap50]').onclick=()=>{ SV50.luecken=!SV50.luecken; trViewPlayers(B); };
  const qi=B.querySelector('#sp50q'); qi.oninput=()=>{ SV50.q=qi.value; clearTimeout(SV50._t); SV50._t=setTimeout(()=>{ trViewPlayers(B); const n=B.querySelector('#sp50q'); if(n){ n.focus(); n.setSelectionRange(n.value.length,n.value.length); } },220); };
  B.querySelectorAll('[data-s50]').forEach(b=>b.onclick=e=>{ e.stopPropagation(); const k=b.dataset.s50||null; if(SV50.sort===k)SV50.dir*=-1; else { SV50.sort=k; SV50.dir=1; } trViewPlayers(B); });
  B.querySelectorAll('tr[data-svp],.sp50-k[data-svp]').forEach(r=>r.onclick=e=>{ if(e.target.closest('[data-stop50]'))return; openModal(r.dataset.svp); });
  const kb=B.querySelector('[data-kx50]'); if(kb)kb.onclick=()=>sv4Go('kabine:kontakte');
};

/* ---------- Mannschaft → Training: Einheiten | Statistik, Schnell-Erfassung mit Noten 1–6 ---------- */
// Herkunft jeder Angabe: manuell (du), ki (Co-Trainer), abstimmung (Link), default (Annahme), import (Datei)
const SV50_SRC={manuell:['bestätigt','m'],ki:['Co-Trainer','k'],abstimmung:['Abstimmung','a'],default:['Annahme','d'],import:['Import','i']};
const SV50_NOTE=['','sehr gut','gut','befriedigend','ausreichend','mangelhaft','ungenügend'];
function sv50Src(s){ const x=SV50_SRC[s]; return x?`<i class="src50 ${x[1]}">${x[0]}</i>`:''; }
function sv50Poll(datum){ try{ return typeof KB!=='undefined'&&KB.loaded?KB.polls.find(p=>p.datum===datum&&p.art==='training')||null:null; }catch(e){ return null; } }
// Standardannahmen für einen Trainingstag: Abstimmung → Anwesenheit, sonst alle da; Verletzte fehlen; Anwesende bekommen eine 3
function sv50Defaults(datum){
  const out={}, poll=sv50Poll(datum), V=new Map(poll?kbVotes(poll).map(v=>[v.player_id,v]):[]), inPoll=new Set(poll?(poll.teilnehmer||[]).map(t=>t.id):[]);
  trSquad().forEach(p=>{
    let r;
    if(trInjury(p.id))r={status:'weg',grund:'verletzt',status_src:'default'};
    else if(poll&&inPoll.has(p.id)){ const v=V.get(p.id);
      if(v&&v.antwort==='zu')r={status:'da',status_src:'abstimmung'};
      else if(v&&v.antwort==='ab')r={status:'weg',grund:v.grund||'ohne',status_src:'abstimmung'};
      else r={status:'weg',grund:'keine_antwort',status_src:'default'}; }
    else r={status:'da',status_src:'default'};
    if(r.status!=='weg')Object.assign(r,{note:3,note_src:'default'});
    out[p.id]=r; });
  return {rows:out,poll};
}
function sv50Seg(B){
  const v=TR.view==='home'?'home':'sessions';
  B.insertAdjacentHTML('afterbegin',`<div class="seg50" role="tablist"><button type="button" class="${v==='sessions'?'on':''}" data-seg50="sessions">Einheiten</button><button type="button" class="${v==='home'?'on':''}" data-seg50="home">Statistik</button></div>`);
  B.querySelectorAll('[data-seg50]').forEach(b=>b.onclick=()=>{ TR.view=b.dataset.seg50; trRender(); });
}
function sv50Tell(datum){
  closeOverlay(); trChatOpen();
  setTimeout(()=>{ const ta=document.getElementById('trcTxt'); if(ta&&!ta.value){ ta.value=(datum&&datum!==trToday()?'Training am '+TRC.fmt(datum)+': ':'Training heute: '); ta.focus(); ta.setSelectionRange(ta.value.length,ta.value.length); ta.dispatchEvent(new Event('input')); } },260);
}
{ const _vs50=trViewSessions; trViewSessions=function(B){
  const r=_vs50.apply(this,arguments);
  try{
    const today=trToday(), s0=trSessionOn(today), poll=sv50Poll(today);
    const hero=document.createElement('div'); hero.className='card hero50';
    hero.innerHTML=`<div class="hero50-t"><h3>${s0?'Heutiges Training ist erfasst':'Training erfassen'}</h3>
        <p>${s0?`${(s0.a||[]).filter(a=>a[1]!=='weg').length} da, ${(s0.a||[]).filter(a=>a[1]==='weg').length} fehlen${s0.no?', Gesamteindruck '+s0.no:''}. Du kannst jederzeit nachbessern.`:poll?'Die Anwesenheit kommt aus der Abstimmung. Erzähl dem Co-Trainer kurz, wie es lief, oder trag selbst ein.':'Erzähl dem Co-Trainer kurz, wie es lief. Wer nicht erwähnt wird, gilt als da und bekommt eine 3 als Annahme.'}</p></div>
      <div class="btnrow"><button type="button" class="btn" data-tell50>🎙️ Dem Co-Trainer erzählen</button><button type="button" class="btn ghost" data-quick50>${SVI('check')} ${s0?'Heute bearbeiten':'Selbst eintragen'}</button></div>`;
    B.prepend(hero);
    hero.querySelector('[data-tell50]').onclick=()=>sv50Tell(today);
    hero.querySelector('[data-quick50]').onclick=()=>sv50Quick(today);
    // Trainings öffnen die Schnell-Erfassung, Spiele den bisherigen Editor
    B.querySelectorAll('.trs[data-edit-s]').forEach(b=>{ const s=TR.st.sessions.find(x=>x.id===b.dataset.editS); if(!s)return;
      if(s.no){ const f=b.querySelector('.trs-f'); if(f)f.insertAdjacentHTML('afterbegin',`<i class="note50 n${s.no}">Note ${s.no}</i>`); }
      const rated=(s.a||[]).filter(a=>a[8]!=null&&a[9]!=='default').length, ki=(s.a||[]).some(a=>a[9]==='ki'||a[10]==='ki');
      if(rated||ki){ const f=b.querySelector('.trs-f'); if(f)f.insertAdjacentHTML('beforeend',`${rated?`<i>${rated} bewertet</i>`:''}${ki?'<i class="src50 k">Co-Trainer</i>':''}`); }
      if(s.t==='training')b.onclick=()=>sv50Quick(s.d,s.id); });
    sv50Seg(B);
  }catch(e){ console.warn('Training 5.0',e); }
  return r; }; }
{ const _vh50=trViewHome; trViewHome=function(B){
  const r=_vh50.apply(this,arguments);
  try{
    const rt=B.querySelector('.rt4 [data-rt="tr"]'); if(rt)rt.onclick=()=>sv50Quick(trToday());
    B.querySelectorAll('[data-tr-new2]').forEach(b=>b.onclick=()=>sv50Quick(trToday()));
    const rows=trSquad().map(p=>({p,s:sv50Stat(p),R:TRC.rows(TR.st,p.id).filter(x=>x.d>=sv50Start()&&x.no!=null&&x.ns!=='default').slice(0,5)}))
      .sort((a,b)=>(a.s.note==null?9:a.s.note)-(b.s.note==null?9:b.s.note)||(b.s.bet||0)-(a.s.bet||0));
    const c=document.createElement('div'); c.className='card';
    c.innerHTML=`<h3 class="trh">${SVI('star')} Saison im Training <small>ab ${TRC.fmt(sv50Start())}${sv50Start().slice(2,4)}</small></h3>
      <div class="trtw"><table class="trtab t50"><thead><tr><th class="nm50">Spieler</th><th>Beteiligung</th><th>4 Wochen</th><th>Ø Note</th><th>Letzte Noten</th><th>Ohne Grund</th></tr></thead><tbody>
      ${rows.map(({p,s,R})=>{ const oh=TRC.rows(TR.st,p.id).filter(x=>x.d>=sv50Start()&&x.st==='weg'&&(x.g==='ohne'||x.g==='keine_antwort')).length;
        return `<tr data-svp="${svEsc(p.id)}"><td class="nm50"><b>${svEsc(p.name)}</b></td><td>${SV50_COLS.bet.h(p,s)}</td><td>${SV50_COLS.r28.h(p,s)}</td><td>${SV50_COLS.note.h(p,s)}</td>
          <td>${R.length?R.slice().reverse().map(x=>`<i class="note50 n${x.no}" title="${TRC.fmt(x.d)}">${x.no}</i>`).join(' '):'–'}</td><td>${oh?`<b class="bad">${oh}</b>`:'0'}</td></tr>`; }).join('')}</tbody></table></div>
      <div class="note">Nur echte Bewertungen zählen in die Durchschnittsnote. Automatisch vergebene 3er stehen als Annahme in den Einheiten, fließen aber nicht in den Schnitt ein. „Ohne Grund“ zählt auch fehlende Rückmeldungen.</div>`;
    const anchor=B.querySelector('.trtiles'); if(anchor)anchor.after(c); else B.appendChild(c);
    c.querySelectorAll('tr[data-svp]').forEach(x=>x.onclick=()=>openModal(x.dataset.svp));
    sv50Seg(B);
  }catch(e){ console.warn('Statistik 5.0',e); }
  return r; }; }
{ const _tr50=trRender; trRender=function(){ const r=_tr50.apply(this,arguments);
  try{ const P=document.getElementById('panel-training'), b=P&&P.querySelector('[data-tr-new]'); if(b)b.onclick=()=>sv50Quick(trToday());
    // Die große Aktionsleiste weicht den Aktionen in der jeweiligen Ansicht; Export sitzt direkt an der Liste
    if(P){ P.dataset.v50=TR.view||''; const sx=P.querySelector('.tract [data-sx]');
      const host=P.querySelector('.sp50-bar .sp50-f, .gm50 .vrat-h .btnrow'), seg=P.querySelector('#trBody > .seg50');
      if(sx&&host&&!host.querySelector('[data-sx50]')){ host.insertAdjacentHTML('beforeend',`<button type="button" class="btn ghost sm" data-sx50>${SVI('download')} Export</button>`); host.querySelector('[data-sx50]').onclick=()=>sx.click(); }
      else if(sx&&!host&&seg&&!P.querySelector('[data-sx50]')){ seg.insertAdjacentHTML('afterend',`<button type="button" class="btn ghost sm sx50" data-sx50>${SVI('download')} Export</button>`); P.querySelector('[data-sx50]').onclick=()=>sx.click(); } }
  }catch(e){}
  return r; }; }

// Schnell-Erfassung: Gesamteindruck, Anwesenheit aus der Abstimmung, Noten 1–6, alles mit Herkunft
function sv50Quick(datum,sid,ki){
  const s0=sid?TR.st.sessions.find(s=>s.id===sid):trSessionOn(datum||trToday(),'training');
  const st={datum:s0?s0.d:(datum||trToday()),no:s0&&s0.no!=null?s0.no:null,ns:s0?s0.ns:null,n:s0?s0.n||'':'',rows:{},orig:new Set(),open:null,ki:!!ki};
  const fill=()=>{
    st.rows={}; st.orig=new Set();
    const cur=trSessionOn(st.datum,'training'), D=sv50Defaults(st.datum); st.poll=D.poll;
    const have=new Map(((cur&&cur.a)||[]).map(a=>[a[0],a]));
    new Set([...trSquad().map(p=>p.id),...have.keys()]).forEach(id=>{
      const a=have.get(id);
      if(a){ st.orig.add(id); st.rows[id]={status:a[1],grund:a[2],notiz:a[5]||'',note:a[8],note_src:a[9]||null,status_src:a[10]||'manuell',saved:true}; }
      else if(D.rows[id])st.rows[id]=Object.assign({notiz:''},D.rows[id]); });
    if(cur){ st.no=cur.no!=null?cur.no:st.no; st.ns=cur.ns||st.ns; st.n=cur.n||st.n; }
  };
  fill();
  // Vorschlag des Co-Trainers darüberlegen
  if(ki){ const i=ki.input||ki; if(i.datum&&i.datum!==st.datum){ st.datum=i.datum; fill(); }
    (i.spieler||[]).forEach(x=>{ if(!x.player_id||!trP(x.player_id))return; const r=st.rows[x.player_id]=st.rows[x.player_id]||{notiz:''};
      if(x.status){ r.status=x.status; r.status_src='ki'; r.grund=x.status==='weg'?(x.grund||r.grund||'ohne'):null; }
      if(x.note){ r.note=x.note; r.note_src='ki'; } else if(r.status!=='weg'&&r.note==null){ r.note=3; r.note_src='default'; }
      if(x.notiz)r.notiz=x.notiz; if(x.motivation)r.motivation=x.motivation; if(x.fitness)r.fitness=x.fitness; });
    if(i.note){ st.no=i.note; st.ns='ki'; } if(i.notiz&&!st.n)st.n=i.notiz; }
  const M=svModal(`<div class="mhead"><div class="rm-ic" style="width:46px;height:46px">${SVI('activity')}</div><div><h2 style="margin:0">Training ${s0?'bearbeiten':'erfassen'}</h2><div class="msub">Anwesenheit und Noten 1 bis 6. Die Herkunft jeder Angabe steht daneben.</div></div></div><div id="q50"></div>`);
  const draw=()=>{
    const E=document.getElementById('q50'); if(!E)return;
    const pi=p=>{ const i=TR_POS.indexOf(p.pos); return i<0?99:i; };
    const list=Object.keys(st.rows).map(trP).filter(Boolean).sort((a,b)=>(pi(a)-pi(b))||a.name.localeCompare(b.name,'de'));
    const c={da:0,spaet:0,weg:0}; list.forEach(p=>{ const r=st.rows[p.id]; if(r.status)c[r.status]++; });
    const ann=list.filter(p=>{ const r=st.rows[p.id]; return r.status_src==='default'||(r.status!=='weg'&&r.note_src==='default'); }).length;
    E.innerHTML=`<div class="q50-top"><div class="field"><label>Datum</label><input type="date" id="q50d" value="${svEsc(st.datum)}" max="${TRC.addDays(trToday(),14)}"></div>
        <div class="q50-ges"><span>Gesamteindruck ${st.ns?sv50Src(st.ns):''}</span><div class="n50row">${[1,2,3,4,5,6].map(n=>`<button type="button" class="n50 n${n}${st.no===n?' on':''}" data-ges="${n}" title="${SV50_NOTE[n]}">${n}</button>`).join('')}</div></div></div>
      <div class="field q50-note"><label>Notiz zur Einheit</label><input id="q50n" maxlength="2000" value="${svEsc(st.n)}" placeholder="z.B. laufintensiv, gute Stimmung, Standards geübt"></div>
      <div class="q50-info">${st.poll?`${SVI('check')} Anwesenheit aus der Abstimmung „${svEsc(st.poll.titel||'Training')}“ übernommen.`:'Keine Abstimmung für diesen Tag, deshalb gelten erst einmal alle als da.'} ${ann?`<b>${ann} Annahmen</b> sind gelb markiert, tippe nur an, was anders war.`:''}</div>
      <div class="q50-sum"><span><b>${c.da+c.spaet}</b> da</span><span class="${c.weg?'bad':''}"><b>${c.weg}</b> fehlen</span>
        <button type="button" class="btn ghost sm" data-all3>Alle Annahmen bestätigen</button></div>
      <div class="q50l">${list.map(p=>{ const r=st.rows[p.id], o=st.open===p.id, weg=r.status==='weg', annS=r.status_src==='default', annN=!weg&&r.note_src==='default';
        return `<div class="q50r${weg?' weg':''}${annS||annN?' ann':''}" data-q50="${svEsc(p.id)}">
          <div class="q50-h"><span class="q50-n" data-q50open><b>${svEsc(p.name)}</b><em>${svEsc(p.pos||'')}${trInjury(p.id)?' · 🩹':''} ${sv50Src(r.status_src)}</em></span>
            <div class="trseg">${[['da','Da'],['weg','Fehlt']].map(([k,t])=>`<button type="button" data-q50s="${k}" class="${r.status===k||(k==='da'&&r.status==='spaet')?'on':''}">${t}</button>`).join('')}</div></div>
          ${weg?`<div class="trg">${Object.entries(TRC.REASONS).map(([k,t])=>`<button type="button" data-q50g="${k}" class="${r.grund===k?'on'+(k==='ohne'||k==='keine_antwort'?' warn':''):''}">${t}</button>`).join('')}</div>`
            :`<div class="q50-no"><div class="n50row sm">${[1,2,3,4,5,6].map(n=>`<button type="button" class="n50 n${n}${r.note===n?' on':''}" data-q50n="${n}" title="${SV50_NOTE[n]}">${n}</button>`).join('')}</div>${r.note!=null?sv50Src(r.note_src):''}</div>`}
          ${o?`<input class="q50-in" data-q50t maxlength="500" value="${svEsc(r.notiz||'')}" placeholder="Notiz, z.B. „stark im Abschlussspiel“">`:`<button type="button" class="trr-more" data-q50open>${r.notiz?'„'+svEsc(r.notiz.slice(0,60))+'“':'+ Notiz'}</button>`}
        </div>`; }).join('')}</div>
      <div class="btnrow sbact"><button class="btn" type="button" id="q50save">${SVI('check')} Speichern</button><button class="btn ghost" type="button" id="q50tell">🎙️ Erzählen</button><button class="btn ghost" type="button" id="q50more" title="Fokus, Intensität, Spieler aus der Zweiten">Details</button></div>`;
    const keep=()=>{ const n=E.querySelector('#q50n'); if(n)st.n=n.value; E.querySelectorAll('[data-q50t]').forEach(i=>{ const r=st.rows[i.closest('[data-q50]').dataset.q50]; if(r)r.notiz=i.value; }); };
    E.querySelector('#q50d').onchange=e=>{ keep(); if(!e.target.value)return; st.datum=e.target.value; const ex=trSessionOn(st.datum,'training'); st.no=ex&&ex.no!=null?ex.no:null; st.ns=ex?ex.ns:null; st.n=ex?ex.n||'':''; fill(); draw(); };
    E.querySelectorAll('[data-ges]').forEach(b=>b.onclick=()=>{ keep(); const n=+b.dataset.ges; if(st.no===n&&st.ns==='manuell'){ st.no=null; st.ns=null; } else { st.no=n; st.ns='manuell'; } draw(); });
    E.querySelectorAll('[data-q50]').forEach(row=>{ const id=row.dataset.q50, r=st.rows[id];
      row.querySelectorAll('[data-q50s]').forEach(b=>b.onclick=()=>{ keep(); const v=b.dataset.q50s; r.status=v; r.status_src='manuell';
        if(v==='weg'){ r.grund=trInjury(id)?'verletzt':(r.grund&&r.grund!=='keine_antwort'?r.grund:'ohne'); } else { r.grund=null; if(r.note==null){ r.note=3; r.note_src='default'; } }
        svSound('tick'); draw(); });
      row.querySelectorAll('[data-q50g]').forEach(b=>b.onclick=()=>{ keep(); r.grund=b.dataset.q50g; r.status_src='manuell'; draw(); });
      row.querySelectorAll('[data-q50n]').forEach(b=>b.onclick=()=>{ keep(); const n=+b.dataset.q50n; if(r.note===n&&r.note_src==='manuell'){ r.note=3; r.note_src='default'; } else { r.note=n; r.note_src='manuell'; } if(r.status_src==='default')r.status_src='manuell'; draw(); });
      row.querySelectorAll('[data-q50open]').forEach(b=>b.onclick=()=>{ keep(); st.open=st.open===id?null:id; draw(); const i=document.querySelector(`[data-q50="${CSS.escape(id)}"] [data-q50t]`); if(i)i.focus(); }); });
    E.querySelector('[data-all3]').onclick=()=>{ keep(); let n=0; Object.values(st.rows).forEach(r=>{ if(r.status_src==='default'){ r.status_src='manuell'; n++; } if(r.status!=='weg'&&r.note_src==='default'){ r.note_src='manuell'; n++; } }); draw(); kToast(n?'✓ Annahmen bestätigt':'Keine offenen Annahmen'); };
    E.querySelector('#q50tell').onclick=()=>sv50Tell(st.datum);
    E.querySelector('#q50more').onclick=()=>{ const ex=trSessionOn(st.datum,'training'); closeOverlay(); setTimeout(()=>trSessionEditor(st.datum,ex&&ex.id,'training'),40); };
    E.querySelector('#q50save').onclick=async e=>{ keep(); const b=e.currentTarget;
      const sp=[]; Object.entries(st.rows).forEach(([id,r])=>{ if(!r.status){ if(st.orig.has(id))sp.push({player_id:id,status:''}); return; }
        const weg=r.status==='weg';
        if(r.status==='spaet'){ r.status='da'; if(!/zu sp(ä|ae)t/i.test(r.notiz||''))r.notiz=('zu spät '+(r.notiz||'')).trim(); }
        sp.push(Object.assign({player_id:id,status:r.status,grund:weg?(r.grund||'ohne'):null,status_src:r.status_src||'manuell',notiz:(r.notiz||'').trim()||null,
          note:weg?null:(r.note||null),note_src:weg||r.note==null?null:(r.note_src||'manuell')},r.motivation?{motivation:r.motivation}:{},r.fitness?{fitness:r.fitness}:{})); });
      b.disabled=true; b.textContent='Speichert …';
      try{ await trSaveSession({datum:st.datum,typ:'training',note:st.no,note_src:st.no?(st.ns||'manuell'):null,notiz:(st.n||'').trim()||null,quelle:st.ki?'ki':'manuell',spieler:sp});
        closeOverlay(); svSound('success'); kToast('✓ Training vom '+TRC.fmt(st.datum)+' gespeichert · '+sp.filter(x=>x.status==='weg').length+' fehlten');
        if(ki&&typeof ki==='object'&&!ki.done){ ki.done='Training '+TRC.fmt(st.datum)+' eingetragen'; }
      }catch(x){ b.disabled=false; b.innerHTML=SVI('check')+' Speichern'; kToast('⚠️ '+x.message); } };
  };
  draw();
  if(typeof KB!=='undefined'&&!KB.loaded&&typeof kbLoad==='function')kbLoad().then(()=>{ if(!document.getElementById('q50'))return; const touched=Object.values(st.rows).some(r=>r.status_src==='manuell'&&!r.saved); if(!touched&&!st.ki&&!st.orig.size){ fill(); draw(); } });
}

/* ---------- Co-Trainer: Noten mit Herkunft „KI“, der Rest aus Abstimmung und Annahmen ---------- */
{ const _as50=trActSummary; trActSummary=function(a){
  const h=_as50.apply(this,arguments); if(a.type!=='training')return h;
  const i=a.input||{}, sp=i.spieler||[], no=sp.filter(x=>x.note);
  return h.replace(/<label class="trc-rest">[\s\S]*<\/label>\s*$/,'')
    +(i.note?`<div>Gesamteindruck: <b class="note50 n${i.note}">${i.note}</b></div>`:'')
    +(no.length?`<div>Noten: ${no.map(x=>`${svEsc(trShort(x.player_id))} <b class="note50 n${x.note}">${x.note}</b>`).join(', ')}</div>`:'')
    +`<label class="trc-rest"><input type="checkbox" data-rest ${i.rest_da!==false?'checked':''}> Alle anderen nach Abstimmung eintragen (sonst da, mit einer 3 als Annahme)</label>`
    +(a.done||a.skip?'':`<div class="btnrow"><button type="button" class="btn ghost sm" data-form50>Im Formular prüfen</button></div>`);
}; }
{ const _ex50=trExec; trExec=async function(a,rest){
  if(a.type!=='training')return _ex50.apply(this,arguments);
  const i=a.input||{}, datum=i.datum||trToday();
  const sp=(i.spieler||[]).filter(x=>x.player_id&&trP(x.player_id)).map(x=>{ const st=x.status||'da', weg=st==='weg';
    return Object.assign({player_id:x.player_id,status:st,status_src:'ki'},weg?{grund:x.grund||'ohne'}:{},x.motivation?{motivation:x.motivation}:{},x.fitness?{fitness:x.fitness}:{},x.notiz?{notiz:x.notiz}:{},
      !weg&&x.note?{note:x.note,note_src:'ki'}:{}); });
  const ex=trSessionOn(datum), have=new Set([...sp.map(x=>x.player_id),...((ex&&ex.a)||[]).map(x=>x[0])]);
  // Genannte Anwesende ohne Note bekommen die Annahme 3
  sp.forEach(x=>{ if(x.status!=='weg'&&!x.note){ const old=((ex&&ex.a)||[]).find(z=>z[0]===x.player_id); if(!old||old[8]==null){ x.note=3; x.note_src='default'; } } });
  if(rest){ const D=sv50Defaults(datum).rows; Object.entries(D).forEach(([id,r])=>{ if(!have.has(id))sp.push(Object.assign({player_id:id},r)); }); }
  const p={datum,typ:'training',quelle:'ki',spieler:sp}; ['fokus','intensitaet','stimmung','notiz'].forEach(k=>{ if(i[k]!=null&&!(Array.isArray(i[k])&&!i[k].length))p[k]=i[k]; });
  if(i.note){ p.note=i.note; p.note_src='ki'; }
  await trSaveSession(p); return 'Training '+TRC.fmt(datum)+' eingetragen';
}; }
document.addEventListener('click',e=>{ const b=e.target.closest&&e.target.closest('[data-form50]'); if(!b)return;
  const box=b.closest('[data-ai]'); if(!box)return; const [mi,ai]=box.dataset.ai.split(':').map(Number), a=TR.chat[mi]&&TR.chat[mi].actions[ai]; if(!a)return;
  e.preventDefault(); e.stopPropagation(); closeOverlay(); setTimeout(()=>sv50Quick((a.input||{}).datum||trToday(),null,a),40); },true);

/* ---------- Mannschaft → Spiele: FuPa-Datei übernehmen, mit Vorschau, Namenszuordnung und Abgleich ---------- */
// Liest die Ausgabe des eigenen FuPa-Auswerters (season.json, result.json, saison_statistik.csv). Die App ruft FuPa selbst nie ab.
const SV50_DS={vorlaeufig:['vorläufig','d'],bestaetigt:['bestätigt','m'],widerspruch:['Widerspruch','bad'],korrigiert:['korrigiert','a']};
const SV50_Q={fupa:'FuPa',fussballde:'fussball.de',ki:'Co-Trainer',manuell:'App'};
const sv50Own=s=>/m(ö|oe|o)rlenbach/i.test(String(s||''));
const sv50Nk=s=>TRC.N(String(s||'')).replace(/ß/g,'ss').replace(/ä/g,'ae').replace(/ö/g,'oe').replace(/ü/g,'ue').replace(/[^a-z0-9 ]/g,' ').replace(/\s+/g,' ').trim();
function sv50Club(s){ const w=sv50Nk(s).split(' ').filter(x=>x&&!/^(sv|tsv|fc|sg|spvgg|fv|vfl|vfr|tv|tsg|ssv|sc|fsv|jsg|ksv|dsg|djk|sgm|ev|e|v|1|19\d\d|20\d\d|bsc|kickers|germania|eintracht|viktoria|olympia|alemannia|union|borussia|rot|weiss|blau)$/.test(x));
  const two=w.some(x=>x==='ii'||x==='2'); return {k:w.filter(x=>x!=='ii'&&x!=='2'&&x!=='iii').join(' '),two}; }
function sv50SameClub(a,b){ const A=sv50Club(a), B=sv50Club(b); if(!A.k||!B.k||A.two!==B.two)return false; return A.k===B.k||(A.k.length>=4&&B.k.includes(A.k))||(B.k.length>=4&&A.k.includes(B.k)); }
function sv50SamePerson(a,b){ const A=sv50Nk(a).split(' '), B=sv50Nk(b).split(' '); if(!A[0]||!B[0])return false; if(A.join(' ')===B.join(' '))return true;
  const la=A[A.length-1], lb=B[B.length-1]; return la===lb&&A[0][0]===B[0][0]; }
// FuPa-Name → Spieler im Bestand (sicher nur bei eindeutigem Treffer)
function sv50PMatch(name){
  const own=players.filter(p=>p.own&&!p.isJugend), n=sv50Nk(name), W=n.split(' '), last=W[W.length-1], fi=(W[0]||'')[0];
  const hit=L=>L.length===1?L[0]:null;
  let p=hit(own.filter(x=>sv50Nk(x.name)===n)); if(p)return {id:p.id,sicher:true};
  p=hit(own.filter(x=>{ const V=sv50Nk(x.name).split(' '); return V[V.length-1]===last&&V[0]&&V[0][0]===fi; })); if(p)return {id:p.id,sicher:W.length>1&&W[0].length>2};
  p=hit(own.filter(x=>{ const V=sv50Nk(x.name).split(' '); return V[V.length-1]===last; })); if(p)return {id:p.id,sicher:false};
  return {id:null,sicher:false};
}
function sv50Csv(text){
  const L=String(text).replace(/^﻿/,'').split(/\r?\n/).filter(x=>x.trim()); if(!L.length)return [];
  const d=(L[0].match(/;/g)||[]).length>=(L[0].match(/,/g)||[]).length?';':',', H=L[0].split(d).map(x=>x.trim().replace(/^"|"$/g,''));
  return L.slice(1).map(l=>{ const c=l.split(d).map(x=>x.trim().replace(/^"|"$/g,'')), o={}; H.forEach((h,i)=>o[h]=c[i]); return o; });
}
function sv50FupaMatch(m){
  const side=m.team_side||(sv50Own(m.home)?'home':sv50Own(m.away)?'away':''); if(!side)return null;
  const heim=side==='home', opp=heim?m.away:m.home, tw=heim?m.home_goals:m.away_goals, tg=heim?m.away_goals:m.home_goals;
  const ref=String(m.url||'').split('?')[0].replace(/\/+$/,'').split('/').pop()||'';
  const subs=(m.substitutions||[]).filter(s=>sv50Own(s.team)).sort((a,b)=>(a.minute||0)-(b.minute||0));
  const lineup=(m.starters||[]).map(p=>({name:p.name,role:'starter'})).concat((m.bench||[]).map(p=>({name:p.name,role:'bench',entered:!!p.entered})));
  const rows=lineup.map(p=>{
    const inSub=subs.some(s=>sv50SamePerson(s.player_in,p.name)), played=p.role==='starter'||p.entered||inSub;
    let min=null;
    if(played){ let start=p.role==='starter'?0:null, tot=0, known=true;
      subs.forEach(s=>{ if(start==null&&sv50SamePerson(s.player_in,p.name)){ if(s.minute==null)known=false; start=s.minute||0; }
        else if(start!=null&&sv50SamePerson(s.player_out,p.name)){ if(s.minute==null)known=false; tot+=Math.max(0,(s.minute||0)-start); start=null; } });
      if(start!=null)tot+=Math.max(0,90-start); else if(p.role!=='starter'&&!inSub)known=false;
      min=known?Math.min(130,tot):null; }
    return {name:p.name,status:p.role==='starter'?'da':played?'spaet':'bank',min,tore:0,vor:0};
  });
  (m.goals||[]).filter(g=>sv50Own(g.team)&&!g.own_goal).forEach(g=>{ const s=rows.find(r=>sv50SamePerson(r.name,g.scorer)); if(s)s.tore++; if(g.assist){ const a=rows.find(r=>sv50SamePerson(r.name,g.assist)); if(a)a.vor++; } });
  return {ref:ref.slice(0,120),url:m.url||'',wett:m.competition||'',heim,opp:opp||'?',tw,tg,status:m.status||'CHECK',warn:(m.warnings||[]).slice(),rows};
}
// Mögliche Spieltage: Spielberichte (fussball.de), Spielplan, bereits erfasste Spiele
function sv50Dates(g){
  const out=new Map(), today=trToday(), add=(d,src,x)=>{ if(!d||d>today)return; const o=out.get(d)||{d,src:[],score:null}; if(!o.src.includes(src))o.src.push(src); if(x!=null)o.score=x; out.set(d,o); };
  try{ (typeof FB!=='undefined'?FB.m:[]).filter(x=>x.team==='A'&&x.wir_heim===g.heim&&sv50SameClub(g.heim?x.gast:x.heim,g.opp)).forEach(x=>add(x.datum,'fussball.de')); }catch(e){}
  try{ if(typeof SP!=='undefined'){ const k=SP_OWN.A;
    SP.fx.filter(f=>f.datum&&((g.heim&&f.heim_key===k&&sv50SameClub(f.gast,g.opp))||(!g.heim&&f.gast_key===k&&sv50SameClub(f.heim,g.opp)))).forEach(f=>add(f.datum,'Spielplan'));
    SP.res.filter(r=>((g.heim&&r.heim_key===k&&sv50SameClub(r.gast,g.opp))||(!g.heim&&r.gast_key===k&&sv50SameClub(r.heim,g.opp)))&&(r.datum||r.bis)).forEach(r=>{ const f=g.heim?r.tore_heim:r.tore_gast, a=g.heim?r.tore_gast:r.tore_heim; add(r.datum||r.bis,'Ergebnis',f+':'+a); }); } }catch(e){}
  TR.st.sessions.filter(s=>s.t==='spiel'&&s.g&&sv50SameClub(s.g,g.opp)).forEach(s=>add(s.d,'App',s.tw!=null?s.tw+':'+s.tg:null));
  const want=g.tw!=null?g.tw+':'+g.tg:null;
  return [...out.values()].sort((a,b)=>((b.score===want)-(a.score===want))||b.src.length-a.src.length||b.d.localeCompare(a.d));
}
// Abgleich mit fussball.de (Spielbericht und Ergebnis) für einen Tag
function sv50Check(g,datum,map){
  const H=[]; let quelle2=false;
  try{ const k=SP_OWN.A, L=typeof SP!=='undefined'?SP.res.filter(x=>(x.datum===datum||x.bis===datum)&&(x.heim_key===k||x.gast_key===k)):[];
    const r=L.find(x=>sv50SameClub(x.heim_key===k?x.gast:x.heim,g.opp));
    if(r){ quelle2=true; const f=r.heim_key===k?r.tore_heim:r.tore_gast, a=r.heim_key===k?r.tore_gast:r.tore_heim; if(g.tw!=null&&(f!==g.tw||a!==g.tg))H.push(`Ergebnis laut fussball.de ${f}:${a}, laut FuPa ${g.tw}:${g.tg}.`); }
    else if(L.length){ const o=L[0]; H.push(`Laut fussball.de war an diesem Tag das Spiel gegen ${o.heim_key===k?o.gast:o.heim}. Datum prüfen.`); } }catch(e){}
  try{ const D=typeof FB!=='undefined'?FB.m.filter(y=>y.team==='A'&&y.datum===datum):[], x=D.find(y=>y.bericht&&sv50SameClub(y.wir_heim?y.gast:y.heim,g.opp));
    if(!x&&D.length&&!H.some(h=>/Datum prüfen/.test(h))){ const o=D[0]; H.push(`Laut fussball.de war an diesem Tag das Spiel gegen ${o.wir_heim?o.gast:o.heim}. Datum prüfen.`); }
    if(x){ quelle2=true; const M=fbMap(), S1=new Set(x.apps.filter(a=>a.s).map(a=>M.get(a.p)).filter(Boolean)), T1={}; x.apps.forEach(a=>{ const id=M.get(a.p); if(id&&a.t)T1[id]=a.t; });
      const S2=new Set(), T2={}; g.rows.forEach(r=>{ const id=map[r.name]; if(!id)return; if(r.status==='da')S2.add(id); if(r.tore)T2[id]=r.tore; });
      const nur1=[...S1].filter(i=>!S2.has(i)), nur2=[...S2].filter(i=>!S1.has(i));
      if(S1.size>=7&&S2.size>=7&&(nur1.length||nur2.length))H.push(`Startelf weicht ab: ${nur2.length?'nur FuPa '+nur2.map(trShort).join(', '):''}${nur1.length&&nur2.length?'; ':''}${nur1.length?'nur fussball.de '+nur1.map(trShort).join(', '):''}.`);
      const ids=new Set([...Object.keys(T1),...Object.keys(T2)]); const td=[...ids].filter(i=>(T1[i]||0)!==(T2[i]||0));
      if(td.length)H.push(`Torschützen weichen ab: ${td.map(i=>`${trShort(i)} ${T2[i]||0} statt ${T1[i]||0}`).join(', ')}.`); } }catch(e){}
  return {H,ds:H.length?'widerspruch':quelle2?'bestaetigt':'vorlaeufig'};
}
function sv50Fupa(){
  svModal(`<div class="mhead"><div class="rm-ic" style="width:46px;height:46px">${SVI('ball')}</div><div><h2 style="margin:0">Spiele übernehmen</h2><div class="msub">FuPa-Auswertung oder Screenshot, du prüfst alles vor dem Speichern</div></div></div>
    <div class="fu50-opts">
      <label class="fu50-o"><input type="file" id="fu50f" accept=".json,.csv,application/json,text/csv" multiple hidden><b>${SVI('upload')} FuPa-Datei wählen</b><span>season.json für die ganze Saison, result.json für ein Spiel oder saison_statistik.csv zum Abgleich</span></label>
      <button type="button" class="fu50-o" id="fu50shot"><b>📷 Screenshot auslesen</b><span>Aufstellung oder Spielbericht als Bild: der Co-Trainer liest es und bereitet das Spiel vor</span></button>
    </div>
    <p class="note small">Die App ruft FuPa nicht selbst ab. Du lädst nur die Dateien hoch, die dein Auswerter erzeugt hat. Spiele ohne Datum ordnet die App über Gegner und Ergebnis dem Spielplan zu.</p>`);
  const f=document.getElementById('fu50f');
  document.getElementById('fu50shot').onclick=()=>{ closeOverlay(); trChatOpen(); setTimeout(()=>{ const ta=document.getElementById('trcTxt'); if(ta){ ta.value='Werte den Screenshot vom Spiel aus: Ergebnis, Startelf, Wechsel mit Minuten, Tore und Vorlagen. Bereite das Spiel vor.'; ta.dispatchEvent(new Event('input')); } const c=document.getElementById('trcClip'); if(c)c.click(); },260); };
  f.onchange=async()=>{ const files=[...f.files]; f.value=''; const M=[], C=[];
    for(const x of files){ try{ if(x.size>25e6){ kToast('Datei zu groß: '+x.name); continue; } const t=await x.text();
      if(/\.csv$/i.test(x.name)||/^﻿?Spieler;/.test(t))C.push(...sv50Csv(t));
      else { const j=JSON.parse(t); (Array.isArray(j.matches)?j.matches:j.starters||j.url?[j]:[]).forEach(m=>M.push(m)); if(Array.isArray(j.season_stats_ready_only)&&!M.length)C.push(...j.season_stats_ready_only); } }
      catch(e){ kToast('⚠️ '+x.name+' konnte nicht gelesen werden'); } }
    if(M.length)return sv50FupaPreview(M.map(sv50FupaMatch).filter(Boolean));
    if(C.length)return sv50FupaCsv(C);
    kToast('In der Datei stehen keine Spiele'); };
}
function sv50FupaPreview(G,warte){
  // Spielplan und Spielberichte für den Abgleich: einmal anstoßen, höchstens ein paar Sekunden warten
  const fehlt=()=>(typeof FB!=='undefined'&&!FB.loaded)||(typeof SP!=='undefined'&&typeof spLoad==='function'&&typeof canScout==='function'&&canScout()&&!SP.loaded);
  if(fehlt()&&(warte||0)<16){
    if(!warte){ try{ if(!FB.loaded)fbLoad(); }catch(e){} try{ if(!SP.loaded&&typeof spLoad==='function')spLoad(); }catch(e){} svModal('<div class="empty">Lade Spielplan und Spielberichte zum Abgleich …</div>'); }
    setTimeout(()=>sv50FupaPreview(G,(warte||0)+1),500); return; }
  const names=[...new Set(G.flatMap(g=>g.rows.map(r=>r.name)))], map={}, sure={};
  names.forEach(n=>{ const m=sv50PMatch(n); map[n]=m.id; sure[n]=m.sicher; });
  const used=new Set();
  G.forEach(g=>{ g.dates=sv50Dates(g); const d=g.dates.find(x=>!used.has(x.d)); g.datum=d?d.d:''; if(g.datum)used.add(g.datum); g.on=g.status!=='BLOCK'&&!!g.datum; g.open=false;
    // Erneuter Import: unveränderte oder von Hand korrigierte Spiele nicht automatisch überschreiben
    const D=g.datum?sv50Diff(g,trSessionOn(g.datum,'spiel'),map):null; if(D&&(D.same||D.korr))g.on=false; });
  G.sort((a,b)=>(b.datum||'').localeCompare(a.datum||''));
  const own=players.filter(p=>p.own&&!p.isJugend).sort((a,b)=>a.name.localeCompare(b.name,'de'));
  const M=svModal(`<div class="mhead"><div class="rm-ic" style="width:46px;height:46px">${SVI('ball')}</div><div><h2 style="margin:0">Vorschau: ${G.length} Spiel${G.length>1?'e':''} aus FuPa</h2><div class="msub">Datum, Namen und Abweichungen prüfen, dann übernehmen</div></div></div><div id="fu50"></div>`);
  const draw=()=>{
    const E=document.getElementById('fu50'); if(!E)return;
    const open=names.filter(n=>!map[n]||!sure[n]);
    E.innerHTML=`${open.length?`<div class="card fu50-map"><h3 class="trh">Namen zuordnen <small>${open.filter(n=>!map[n]).length} offen, ${open.filter(n=>map[n]).length} unsicher</small></h3>
        ${open.map(n=>`<div class="fu50-mr${map[n]?'':' miss'}"><span>${svEsc(n)}</span><select data-map50="${svEsc(n)}"><option value="">nicht übernehmen</option>${own.map(p=>`<option value="${svEsc(p.id)}"${map[n]===p.id?' selected':''}>${svEsc(p.name)}</option>`).join('')}</select></div>`).join('')}</div>`:''}
      ${G.map((g,i)=>{ const chk=g.datum?sv50Check(g,g.datum,map):{H:[],ds:'vorlaeufig'}; g.chk=chk; const ex=g.datum&&trSessionOn(g.datum,'spiel');
        const fu=g.status==='READY'?['vollständig','m']:g.status==='BLOCK'?['unsicher','bad']:['prüfen','d'];
        return `<div class="fu50-g${g.on?' on':''}" data-g50="${i}"><div class="fu50-gh"><label class="fu50-chk"><input type="checkbox" data-on50 ${g.on?'checked':''}></label>
          <div class="fu50-gt"><b>${g.heim?'vs':'@'} ${svEsc(g.opp)} <span class="fu50-res">${g.tw!=null?g.tw+':'+g.tg:'?'}</span></b>
            <span>${svEsc(g.wett||'')} ${sv50Src2('FuPa '+fu[0],fu[1])} ${sv50Src2(SV50_DS[chk.ds][0],SV50_DS[chk.ds][1])}</span></div></div>
          <div class="fu50-d"><label>Datum</label><select data-d50>${g.dates.map(d=>`<option value="${d.d}"${g.datum===d.d?' selected':''}>${TRC.fmt(d.d)}${d.d.slice(2,4)} · ${svEsc(d.src.join(', '))}${d.score?' '+d.score:''}</option>`).join('')}<option value="x"${g.datum&&!g.dates.some(d=>d.d===g.datum)?' selected':''}>anderes Datum …</option></select>
            ${!g.dates.some(d=>d.d===g.datum)?`<input type="date" data-dx50 value="${svEsc(g.datum)}" max="${trToday()}">`:''}</div>
          ${ex?(()=>{ const D=sv50Diff(g,ex,map); return `<div class="note small">In der App steht für diesen Tag schon ein Spiel${ex.tw!=null?' ('+ex.tw+':'+ex.tg+')':''}${ex.q?', Quelle '+svEsc(SV50_Q[ex.q]||ex.q):''}. ${D.same?'<b class="ok50">Unverändert, nichts zu tun.</b>':`<b>Abgleich: ${D.changes.length} Änderung${D.changes.length>1?'en':''}</b>`}${D.korr?' <b class="miss50">Von Hand korrigiert: nur übernehmen, wenn FuPa sicher stimmt.</b>':''} Eingetragene Gründe fürs Fehlen bleiben.</div>
            ${D.changes.length?`<ul class="fu50-w fu50-dif">${D.changes.slice(0,10).map(c=>`<li>${svEsc(c)}</li>`).join('')}${D.changes.length>10?`<li>… und ${D.changes.length-10} weitere</li>`:''}</ul>`:''}`; })():''}
          ${g.warn.length||chk.H.length?`<ul class="fu50-w">${chk.H.map(h=>`<li class="bad">${svEsc(h)}</li>`).join('')}${g.warn.map(w=>`<li>${svEsc(w)}</li>`).join('')}</ul>`:''}
          <button type="button" class="trr-more" data-open50>${g.open?'Spieler ausblenden':(()=>{ const t=g.rows.reduce((a,r)=>a+r.tore,0), v=g.rows.reduce((a,r)=>a+r.vor,0); return `${g.rows.filter(r=>r.status!=='bank').length} Spieler, ${t} ${t===1?'Tor':'Tore'}, ${v} ${v===1?'Vorlage':'Vorlagen'} anzeigen`; })()}</button>
          ${g.open?`<div class="trtw"><table class="trtab fu50-t"><thead><tr><th>FuPa</th><th>Spieler</th><th>Status</th><th>Min.</th><th>T</th><th>V</th></tr></thead><tbody>${g.rows.map(r=>`<tr class="${map[r.name]?'':'miss'}"><td>${svEsc(r.name)}</td><td>${map[r.name]?svEsc(trName(map[r.name])):'<i class="miss50">nicht zugeordnet</i>'}</td><td>${r.status==='da'?'Startelf':r.status==='spaet'?'eingewechselt':'Bank'}</td><td>${r.min!=null?r.min:'–'}</td><td>${r.tore||''}</td><td>${r.vor||''}</td></tr>`).join('')}</tbody></table></div>`:''}
        </div>`; }).join('')}
      <div class="btnrow sbact"><button class="btn" type="button" id="fu50save">${SVI('check')} ${G.filter(g=>g.on&&g.datum).length} Spiele übernehmen</button><button class="btn ghost" type="button" id="fu50x">Abbrechen</button></div>
      <p class="note small">Gespeichert wird mit Quelle FuPa. Stimmt fussball.de überein, gilt das Spiel als bestätigt, sonst als vorläufig oder mit Widerspruch zum Prüfen.</p>`;
    E.querySelectorAll('[data-map50]').forEach(s=>s.onchange=()=>{ map[s.dataset.map50]=s.value||null; sure[s.dataset.map50]=true; draw(); });
    E.querySelectorAll('[data-g50]').forEach(box=>{ const g=G[+box.dataset.g50];
      box.querySelector('[data-on50]').onchange=e=>{ g.on=e.target.checked; draw(); };
      box.querySelector('[data-d50]').onchange=e=>{ g.datum=e.target.value==='x'?'':e.target.value; draw(); };
      const dx=box.querySelector('[data-dx50]'); if(dx)dx.onchange=()=>{ g.datum=dx.value; g.dates.push({d:dx.value,src:['manuell'],score:null}); draw(); };
      box.querySelector('[data-open50]').onclick=()=>{ g.open=!g.open; draw(); }; });
    E.querySelector('#fu50x').onclick=()=>closeOverlay();
    E.querySelector('#fu50save').onclick=async e=>{ const L=G.filter(g=>g.on&&g.datum); if(!L.length)return kToast('Kein Spiel ausgewählt oder Datum fehlt');
      const days=L.map(g=>g.datum); if(new Set(days).size!==days.length)return kToast('Zwei Spiele haben dasselbe Datum. Bitte prüfen.');
      const b=e.currentTarget; b.disabled=true; let ok=0; const err=[];
      for(const g of L){ b.textContent=`Speichert ${ok+1} von ${L.length} …`;
        const seen=new Set(), sp=[]; g.rows.forEach(r=>{ const id=map[r.name]; if(!id||seen.has(id))return; seen.add(id);
          sp.push({player_id:id,status:r.status,status_src:'import',minuten:r.min,tore:r.tore||null,vorlagen:r.vor||null}); });
        const ex=trSessionOn(g.datum,'spiel'); (ex&&ex.a||[]).forEach(a=>{ if(a[10]==='import'&&!seen.has(a[0])&&a[1]!=='weg')sp.push({player_id:a[0],status:''}); });   // beim Abgleich: wer nicht mehr in FuPa steht, fliegt raus
        const chk=sv50Check(g,g.datum,map), hw=chk.H.concat(g.warn).join(' ').slice(0,1000);
        const p={datum:g.datum,typ:'spiel',gegner:String(g.opp).slice(0,80),heim:g.heim,quelle:'fupa',quelle_ref:g.ref||null,daten_status:chk.ds,hinweise:hw||null,spieler:sp};
        if(g.tw!=null&&g.tg!=null){ p.tore_wir=g.tw; p.tore_gegner=g.tg; }
        try{ const {error}=await SVB.sb.rpc('training_save',{p}); if(error)throw new Error(error.message); ok++; }catch(x){ err.push(TRC.fmt(g.datum)+': '+x.message); } }
      await trLoad(true); closeOverlay(); svSound(err.length?'warn':'success');
      kToast(err.length?`⚠️ ${ok} übernommen, ${err.length} mit Fehler: ${err[0]}`:`✓ ${ok} Spiel${ok>1?'e':''} aus FuPa übernommen`);
      if(svCurTab()==='training')trRender(); };
  };
  draw();
}
// Was würde sich gegenüber dem gespeicherten Spiel ändern?
function sv50Diff(g,ex,map){
  if(!ex)return null;
  const ch=[], ST={da:'Startelf',spaet:'eingewechselt',bank:'Bank'};
  if(g.tw!=null&&(ex.tw!==g.tw||ex.tg!==g.tg))ch.push(`Ergebnis ${ex.tw!=null?ex.tw+':'+ex.tg:'offen'} wird ${g.tw}:${g.tg}`);
  const old=new Map((ex.a||[]).filter(a=>a[1]!=='weg'&&a[1]!=='zuschauer').map(a=>[a[0],a])), neu=new Map();
  g.rows.forEach(r=>{ const id=map[r.name]; if(id&&!neu.has(id))neu.set(id,r); });
  neu.forEach((r,id)=>{ const a=old.get(id), n=trShort(id);
    if(!a){ ch.push(`${n} kommt dazu (${ST[r.status]||r.status})`); return; }
    if(a[1]!==r.status)ch.push(`${n}: ${ST[a[1]]||a[1]} wird ${ST[r.status]||r.status}`);
    if(r.min!=null&&a[11]!==r.min)ch.push(`${n}: ${a[11]!=null?a[11]:'?'} wird ${r.min} Minuten`);
    if((a[6]||0)!==(r.tore||0))ch.push(`${n}: Tore ${a[6]||0} wird ${r.tore||0}`);
    if((a[7]||0)!==(r.vor||0))ch.push(`${n}: Vorlagen ${a[7]||0} wird ${r.vor||0}`); });
  old.forEach((a,id)=>{ if(!neu.has(id)&&a[10]==='import')ch.push(`${trShort(id)} steht nicht mehr im FuPa-Bericht und wird entfernt`); });
  return {changes:ch,same:!ch.length,korr:ex.ds==='korrigiert'};
}
function sv50Src2(t,c){ return `<i class="src50 ${c}">${svEsc(t)}</i>`; }
// saison_statistik.csv: nur Abgleich der Summen, es wird nichts gespeichert
function sv50FupaCsv(R){
  const rows=R.filter(r=>r.Spieler).map(r=>{ const m=sv50PMatch(r.Spieler), p=m.id&&trP(m.id), s=p?sv50Stat(p):null;
    const f={sp:+r.Spiele||0,t:+r.Tore||0,v:+r.Vorlagen||0,s11:+r.Startelf||0};
    return {n:r.Spieler,p,f,s,diff:s?(f.sp!==s.ein||f.t!==s.tore||f.v!==s.vor||f.s11!==s.start11):true}; });
  const d=rows.filter(r=>r.diff).length;
  svModal(`<div class="mhead"><div class="rm-ic" style="width:46px;height:46px">${SVI('chart')}</div><div><h2 style="margin:0">Abgleich mit FuPa</h2><div class="msub">Saison-Summen aus saison_statistik.csv neben den Zahlen der App</div></div></div>
    <p class="note">${d?`<b>${d} Spieler</b> weichen ab.`:'Alles stimmt überein.'} Die Summen enthalten nur Spiele, die dein Auswerter als vollständig markiert hat. Für einzelne Spiele lade bitte season.json hoch, dann kann die App sie übernehmen.</p>
    <div class="trtw"><table class="trtab t50"><thead><tr><th class="nm50">Spieler</th><th>Spiele</th><th>Startelf</th><th>Tore</th><th>Vorlagen</th></tr></thead><tbody>
    ${rows.map(r=>{ const c=(a,b)=>b==null?`${a} <small>/ –</small>`:a===b?`${a}`:`<b class="bad">${a}</b> <small>App ${b}</small>`;
      return `<tr${r.p?` data-svp="${svEsc(r.p.id)}"`:''}><td class="nm50">${r.p?`<b>${svEsc(r.p.name)}</b>`:`${svEsc(r.n)} <i class="miss50">nicht zugeordnet</i>`}</td><td>${c(r.f.sp,r.s&&r.s.ein)}</td><td>${c(r.f.s11,r.s&&r.s.start11)}</td><td>${c(r.f.t,r.s&&r.s.tore)}</td><td>${c(r.f.v,r.s&&r.s.vor)}</td></tr>`; }).join('')}</tbody></table></div>
    <div class="btnrow sbact"><button class="btn ghost" type="button" onclick="closeOverlay()">Schließen</button></div>`);
  document.querySelectorAll('#modal tr[data-svp]').forEach(x=>x.onclick=()=>openModal(x.dataset.svp));
}
// Spiele-Ansicht: Import oben, darunter die erfassten Spiele mit Quelle und Datenstatus
{ const _vg50=trViewGames; trViewGames=function(B){
  const r=_vg50.apply(this,arguments);
  try{ if(typeof TM4!=='undefined'&&TM4.gs&&TM4.gs!==sv4S())return r; if(!B.querySelector('.card'))return r;
    const G=TR.st.sessions.filter(s=>s.t==='spiel'&&s.d>=sv50Start()).sort((a,b)=>b.d.localeCompare(a.d)), wid=G.filter(s=>s.ds==='widerspruch').length;
    const c=document.createElement('div'); c.className='card gm50';
    c.innerHTML=`<div class="vrat-h"><h3 class="trh" style="margin:0">${SVI('ball')} Erfasste Spiele <small>${G.length}${wid?` · <b class="bad">${wid} zum Prüfen</b>`:''}</small></h3>
        <div class="btnrow"><button type="button" class="btn sm" data-fu50>${SVI('upload')} FuPa übernehmen</button><button type="button" class="btn ghost sm" data-g50new>${SVI('plus')} Spiel</button></div></div>
      ${G.length?`<div class="gm50-l">${G.map(s=>{ const da=(s.a||[]).filter(a=>a[1]==='da'||a[1]==='spaet').length;
        return `<button type="button" class="gm50-r${s.ds==='widerspruch'?' bad':''}" data-gs50="${s.id}"><span class="gm50-d">${TRC.fmt(s.d)}</span>
          <span class="gm50-t"><b>${s.h===false?'@':'vs'} ${svEsc(s.g||'?')}</b>${s.hw?`<small>${svEsc(s.hw.slice(0,140))}${s.hw.length>140?' …':''}</small>`:''}</span>
          <span class="gm50-s">${s.tw!=null?`<i class="res ${s.tw>s.tg?'w':s.tw===s.tg?'d':'l'}">${s.tw}:${s.tg}</i>`:''}${s.q?sv50Src2(SV50_Q[s.q]||s.q,s.q==='fupa'?'i':s.q==='ki'?'k':'m'):''}${s.ds?sv50Src2(SV50_DS[s.ds][0],SV50_DS[s.ds][1]):''}<small>${da} eingesetzt</small></span></button>`; }).join('')}</div>`
        :'<p class="note">Noch keine Spiele erfasst. Am schnellsten mit der FuPa-Datei: Startelf, Wechsel, Minuten, Tore und Vorlagen in einem Schritt.</p>'}`;
    B.prepend(c);
    c.querySelector('[data-fu50]').onclick=()=>sv50Fupa();
    c.querySelector('[data-g50new]').onclick=()=>trSessionEditor(trToday(),null,'spiel');
    c.querySelectorAll('[data-gs50]').forEach(b=>b.onclick=()=>sv50Game(b.dataset.gs50));
    const chips=B.querySelector('.tm4s'); if(chips)B.prepend(chips);
  }catch(e){ console.warn('Spiele 5.0',e); }
  return r; }; }
// Spiel öffnen: Hinweise sichtbar, Datenstatus setzen, dann der gewohnte Editor
function sv50Game(id){
  const s=TR.st.sessions.find(x=>x.id===id); if(!s)return;
  if(!s.q&&!s.ds&&!s.hw)return trSessionEditor(null,id);
  const M=svModal(`<div class="mhead"><div class="rm-ic" style="width:46px;height:46px">${SVI('ball')}</div><div><h2 style="margin:0">${s.h===false?'@':'vs'} ${svEsc(s.g||'?')} ${s.tw!=null?s.tw+':'+s.tg:''}</h2><div class="msub">${TRC.fmt(s.d)}${s.d.slice(2,4)} · Quelle ${svEsc(SV50_Q[s.q]||s.q||'App')}${s.qr?' · '+svEsc(s.qr):''}</div></div></div>
    ${s.hw?`<div class="q50-info">${svEsc(s.hw)}</div>`:''}
    <div class="field"><label>Datenstatus</label><div class="chips4">${Object.entries(SV50_DS).map(([k,[t]])=>`<button type="button" data-ds50="${k}" class="${s.ds===k?'on':''}">${t}</button>`).join('')}</div></div>
    <div class="trtw"><table class="trtab"><thead><tr><th>Spieler</th><th>Status</th><th>Min.</th><th>T</th><th>V</th><th></th></tr></thead><tbody>
    ${(s.a||[]).filter(a=>a[1]!=='weg').sort((a,b)=>['da','spaet','bank','zuschauer'].indexOf(a[1])-['da','spaet','bank','zuschauer'].indexOf(b[1])).map(a=>`<tr><td>${svEsc(trName(a[0]))}</td><td>${({da:'Startelf',spaet:'eingewechselt',bank:'Kader',zuschauer:'zugeschaut'})[a[1]]||a[1]}</td><td>${a[11]!=null?a[11]:'–'}</td><td>${a[6]||''}</td><td>${a[7]||''}</td><td>${sv50Src(a[10])}</td></tr>`).join('')}</tbody></table></div>
    <div class="btnrow sbact"><button class="btn" type="button" id="gm50e">Bearbeiten</button><button class="btn ghost" type="button" id="gm50x">Schließen</button></div>`);
  M.querySelectorAll('[data-ds50]').forEach(b=>b.onclick=async()=>{ try{ await trSaveSession({datum:s.d,typ:'spiel',daten_status:b.dataset.ds50}); kToast('✓ Datenstatus: '+SV50_DS[b.dataset.ds50][0]); sv50Game(id); if(svCurTab()==='training')trRender(); }catch(e){ kToast('⚠️ '+e.message); } });
  M.querySelector('#gm50e').onclick=()=>{ closeOverlay(); setTimeout(()=>trSessionEditor(null,id),40); };
  M.querySelector('#gm50x').onclick=()=>closeOverlay();
}
// Co-Trainer: Spiele mit Minuten und Herkunft
{ const _ex50b=trExec; trExec=async function(a,rest){
  if(a.type!=='spiel')return _ex50b.apply(this,arguments);
  const i=a.input||{}, sp=(i.spieler||[]).filter(x=>x.player_id&&trP(x.player_id)).map(x=>Object.assign({player_id:x.player_id,status:x.status||'da',status_src:'ki'},x.status==='weg'?{grund:x.grund||'ohne'}:{},x.tore?{tore:x.tore}:{},x.vorlagen?{vorlagen:x.vorlagen}:{},x.minuten!=null?{minuten:Math.max(0,Math.min(130,x.minuten))}:{},x.note?{note:x.note,note_src:'ki'}:{}));
  const p={datum:i.datum||trToday(),typ:'spiel',quelle:'ki',daten_status:'vorlaeufig',spieler:sp}; ['gegner','heim','tore_wir','tore_gegner'].forEach(k=>{ if(i[k]!=null&&i[k]!=='')p[k]=i[k]; });
  await trSaveSession(p); return 'Spiel '+TRC.fmt(p.datum)+' eingetragen'; }; }

/* =====================================================================
   Sportzentrale Beta 0.6 · Stufe 2: Kaderplanung
   - Jede Planung hat eine Sicherheit: Fakt · Zusage · Planung · Annahme (Standard, wenn nichts besprochen ist)
   - Hauptmannschaft (primär) und zweite Mannschaft (sekundär), dazu wo er faktisch spielt
   - Inaktive Spieler (Ausland, lange Pause) zählen nicht mit
   - Abdeckung je Position: Soll = 2 × Startplätze der Formation, Nebenposition zählt halb (einstellbar)
   - Freie Kaderplätze, Bedarf aus Formation und aus Qualität (Linksfuß, Kopfball, Tempo, Führung, Alter)
   - Backup-Ansicht, Übergang aus der A-Jugend, Transferperioden, Plausibilitäts-Check
   - Neuzugänge kommen erst nach einem Gespräch in den Kaderplan, sonst sind es Wunschspieler (Traumelf)
   ===================================================================== */
const SV60={cfg:null,cfgLoaded:false,view:'liste',plOpen:false};
const SV60_DEF={kader:{'1':24,'2':22,'A':22},faktor:2,neben:0.5,
  sommer:{von:'07-01',bis:'08-31',abm:'06-30'},winter:{von:'01-01',bis:'01-31',abm:'12-31'},
  qual:{links:1,kopf:2,tempo:2,leader:2,standard:1,alt:4,jung:3}};
const SV60_SI={fakt:['Fakt','f','Steht fest, zum Beispiel unterschrieben, abgemeldet oder schon passiert'],zusage:['Zusage','z','Der Spieler hat es im Gespräch so gesagt'],
  planung:['Planung','p','So plant das Trainerteam, ohne Zusage des Spielers'],annahme:['Annahme','a','Noch nichts besprochen. Die App nimmt an, dass er bleibt']};

/* ---------- Standards laden und speichern ---------- */
function sv60C(){ const c=SV60.cfg||{}, D=SV60_DEF;
  return {kader:Object.assign({},D.kader,c.kader||{}),faktor:c.faktor!=null?+c.faktor:D.faktor,neben:c.neben!=null?+c.neben:D.neben,
    sommer:Object.assign({},D.sommer,c.sommer||{}),winter:Object.assign({},D.winter,c.winter||{}),qual:Object.assign({},D.qual,c.qual||{})}; }
async function sv60CfgLoad(){
  if(SV60.cfgLoaded||!sv4Can()||!SVB||!SVB.sb)return;
  SV60.cfgLoaded=true;
  try{ const {data,error}=await SVB.sb.from('kader_cfg').select('cfg').eq('id',1).maybeSingle(); if(!error&&data)SV60.cfg=data.cfg||{}; }catch(e){}
}
async function sv60CfgSave(cfg){
  const {error}=await SVB.sb.from('kader_cfg').update({cfg}).eq('id',1); if(error)throw new Error(error.message); SV60.cfg=cfg;
}
{ const _l60=sv4Load; sv4Load=async function(){ const r=await _l60.apply(this,arguments); try{ if(!SV60.cfgLoaded){ await sv60CfgLoad(); try{ if(svCurTab()==='kader')kd4Render(); }catch(e){} } }catch(e){} return r; }; }

/* ---------- Sicherheit, Zweitmannschaft, inaktiv, faktisch ---------- */
function sv60Target(s){ return s===sv4S()?sv4SAdd(s,1):s; }
function sv60LastG(pid){ return SV4.gs.find(x=>x.player_id===pid)||null; }
function sv60Si(p,s){
  if(s===sv4S())return 'fakt';
  const r=sv4SS(p.id,s); if(r&&r.sicherheit)return r.sicherheit;
  const g=sv60LastG(p.id); if(g&&g.zukunft&&g.zukunft!=='offen'&&(Date.now()-new Date(g.datum))/864e5<=240)return 'zusage';
  return r?'planung':'annahme';
}
function sv60Inaktiv(p,s){ const r=sv4SS(p.id,s); return r&&r.inaktiv?r.inaktiv:null; }
function sv60Team2(p,s){ const r=sv4SS(p.id,s); return r&&r.team2?r.team2:null; }
// Wo spielt er diese Saison tatsächlich? (Spiele der Ersten aus Spielberichten und App, der Zweiten aus Spielberichten)
function sv60Fakt(p){
  let a1=0,a2=0;
  try{ if(typeof FB!=='undefined'&&FB.loaded){ a1=fbStats(p.id,fbSeasonStart(),'A').sp; a2=fbStats(p.id,fbSeasonStart(),'D2').sp; } }catch(e){}
  try{ const st=typeof sv50Start==='function'?sv50Start():'2026-07-01'; const n=TR.st.sessions.filter(s=>s.t==='spiel'&&s.d>=st&&(s.a||[]).some(a=>a[0]===p.id&&(a[1]==='da'||a[1]==='spaet'))).length; a1=Math.max(a1,n); }catch(e){}
  if(!a1&&!a2)return null;
  return {a1,a2,team:a1&&a2?(a1>=a2?'1':'2'):a1?'1':'2',beide:!!(a1&&a2)};
}
// Zählt er im Kader dieser Saison? (aktiv und eingeplant)
function sv60Aktiv(p,s,team){
  if(sv60Inaktiv(p,s))return false;
  const k=kd4Status(p,s,team);
  if(s===sv4S())return !['weg','ziel'].includes(k);
  return ['bleibt','neu','hoch','runter','unsicher'].includes(k);
}

// In Planungs-Saisons zählt der Plan für genau diese Saison (vorher wurde die Folgesaison angezeigt)
{ const _st60=kd4Status; kd4Status=function(p,s,team){
  if(s===sv4S())return _st60.apply(this,arguments);
  const r=sv4SS(p.id,s), t=sv4Team(p,s);
  if(r&&r.zukunft==='ziel')return 'ziel';
  if(!t)return 'weg';
  if(r&&r.zukunft&&r.zukunft!=='bleibt')return r.zukunft;
  return sv4Team(p,sv4SAdd(s,-1))!==team?'neu':'bleibt'; }; }

/* ---------- Kaderliste: Sicherheit, inaktiv, Zweitmannschaft, faktisch ---------- */
{ const _row60=kd4Row; kd4Row=function(p,s,team){
  let h=_row60.apply(this,arguments);
  try{
    const t=sv60Target(s), si=sv60Si(p,t), S=SV60_SI[si], ina=sv60Inaktiv(p,s)||sv60Inaktiv(p,t), t2=sv60Team2(p,s===sv4S()?s:t), k=kd4Status(p,s,team);
    const tags=[];
    if(!['weg'].includes(k)&&S)tags.push(`<i class="si60 ${S[1]}" title="${svEsc(S[2])}">${S[0]}</i>`);
    if(ina)tags.push(`<i class="si60 in" title="Zählt nicht im Kader">inaktiv: ${svEsc(ina)}</i>`);
    if(t2)tags.push(`<i class="si60 t2" title="Zweite Mannschaft">auch ${svEsc(SV4_TEAM[t2]||t2)}</i>`);
    if(s===sv4S()&&(team==='1'||team==='2')){ const f=sv60Fakt(p); if(f&&!f.beide&&f.team!==team)tags.push(`<i class="si60 fx" title="Einsätze diese Saison: Erste ${f.a1}, Zweite ${f.a2}">spielt in der ${f.team==='1'?'Ersten':'Zweiten'}</i>`); else if(f&&f.beide&&!t2)tags.push(`<i class="si60 t2" title="Einsätze diese Saison: Erste ${f.a1}, Zweite ${f.a2}">spielt in beiden</i>`); }
    if(tags.length)h=h.replace(/(<button type="button" class="kr4-n"[^>]*><b>[^<]*<\/b><small>)/,'$1'+tags.join('')+' ');
    if(ina)h=h.replace('class="kr4','class="kr4 ina60');
  }catch(e){}
  return h; }; }

/* ---------- Zukunfts-Menü: Sicherheit, zweite Mannschaft, inaktiv ---------- */
{ const _zm60=kd4ZukMenu; kd4ZukMenu=function(btn,pid){
  const r=_zm60.apply(this,arguments);
  try{
    const m=document.querySelector('.zm4'); if(!m)return r;
    const p=sv4P(pid), s=kd4S(), t=sv60Target(s), row=sv4SS(pid,t)||{}, cur=sv60Si(p,t), team=sv4Team(p,t)||KD4.team;
    const sec=document.createElement('div'); sec.className='zm60';
    sec.innerHTML=`<b>Wie sicher ist das?</b><div class="zm60-si">${Object.entries(SV60_SI).map(([k,[l,c,d]])=>`<button type="button" data-si="${k}" class="si60 ${c}${cur===k?' on':''}" title="${svEsc(d)}">${l}</button>`).join('')}</div>
      <button type="button" data-t2 class="mut">${row.team2?'✓ ':''}Auch in der ${team==='2'?'Ersten':'Zweiten'} einplanen</button>
      <button type="button" data-ina class="mut">${row.inaktiv?'✓ Inaktiv ('+svEsc(row.inaktiv)+'), wieder aktiv setzen':'Inaktiv setzen (zählt nicht)'}</button>`;
    const gsp=m.querySelector('[data-z="gespr"]'); if(gsp)gsp.before(sec); else m.appendChild(sec);
    const done=async(upd,msg)=>{ m.remove(); try{ await sv4SSSet(pid,t,upd); kToast('✓ '+p.name+': '+msg); kd4Render(); }catch(e){ kToast('⚠️ '+e.message); } };
    sec.querySelectorAll('[data-si]').forEach(b=>b.onclick=e=>{ e.stopPropagation(); const k=b.dataset.si; done({sicherheit:k==='annahme'?null:k},SV60_SI[k][0]+' ('+sv4SL(t)+')'); });
    sec.querySelector('[data-t2]').onclick=e=>{ e.stopPropagation(); const want=team==='2'?'1':'2'; done({team2:row.team2?null:want},row.team2?'nur noch '+SV4_TEAM[team]:'auch '+SV4_TEAM[want]); };
    sec.querySelector('[data-ina]').onclick=e=>{ e.stopPropagation(); if(row.inaktiv)return done({inaktiv:null},'wieder aktiv');
      const g=prompt('Warum inaktiv? (z. B. Auslandssemester, Kreuzband, Pause)',''); if(g===null){ m.remove(); return; } done({inaktiv:(g.trim()||'Pause').slice(0,80)},'inaktiv'); };
    const r2=btn.getBoundingClientRect(); m.style.top=Math.max(8,Math.min(window.innerHeight-m.offsetHeight-10,r2.bottom+6))+'px';
  }catch(e){ console.warn('Zukunft 0.6',e); }
  return r; }; }

/* ---------- Abdeckung je Position ---------- */
function sv60Starts(){ const L=kd4Lineup(), F=FORMATIONS[L.formation]||FORMATIONS['4-4-2'], st={}; F.forEach(([r])=>{ const pos=ROLE2POS[r]; st[pos]=(st[pos]||0)+1; }); return {st,form:L.formation}; }
function sv60Cov(all,s,team){
  const C=sv60C(), {st,form}=sv60Starts(), aktiv=all.filter(p=>sv60Aktiv(p,s,team));
  const uns=s===sv4S()?[]:aktiv.filter(p=>kd4Status(p,s,team)==='unsicher');
  const rows=SV4_POS.map(pos=>{
    const haupt=aktiv.filter(p=>kd4Pos(p,s)===pos), neben=aktiv.filter(p=>kd4Pos(p,s)!==pos&&(p.pos2||[]).includes(pos));
    const cov=haupt.length+neben.length*C.neben, covSicher=cov-uns.filter(p=>kd4Pos(p,s)===pos).length-uns.filter(p=>kd4Pos(p,s)!==pos&&(p.pos2||[]).includes(pos)).length*C.neben;
    const kb=(typeof SC2!=='undefined'&&SC2.bedarf&&SC2.bedarf.find)?SC2.bedarf.find(x=>x.pos===pos):null;
    const soll=kb&&kb.soll!=null?+kb.soll:C.faktor*(st[pos]||0), sollSrc=kb&&kb.soll!=null?'Positions-Bedarf':`${C.faktor} × ${st[pos]||0} Startplätze (${form})`;
    const gap=Math.max(0,Math.ceil(soll-cov-1e-9)), risk=Math.max(0,Math.ceil(soll-covSicher-1e-9));
    return {pos,soll,sollSrc,cov,covSicher,haupt,neben,gap,risk,starts:st[pos]||0};
  }).filter(x=>x.soll>0||x.cov>0);
  const groesse=C.kader[team]||24, frei=groesse-aktiv.length;
  return {rows,aktiv,uns,groesse,frei,C};
}

/* ---------- Qualitativer Bedarf ---------- */
function sv60Qual(all,s,team){
  const C=sv60C().qual, A=all.filter(p=>sv60Aktiv(p,s,team)&&!p.isJugend||sv60Aktiv(p,s,team)&&team==='A');
  const B=A.map(p=>({p,b:typeof sbOf==='function'?sbOf(p):{sk:[],tg:[],ch:{}}}));
  const hatBogen=B.filter(x=>typeof sbHas==='function'&&sbHas(x.b)).length;
  const sk=(x,k)=>x.b.sk.some(z=>z.k===k), foot=x=>x.p.fuss||x.b.foot||'';
  const Y=2000+(+String(s).slice(0,2)), alter=p=>p.alter!=null?p.alter+(Y-2026):null;
  const R=[
    {k:'links',t:'Linksfuß in der Abwehr',ist:B.filter(x=>['IV','AV'].includes(kd4Pos(x.p,s))&&/Links|Beid/.test(foot(x))).length,soll:C.links,pos:'IV',fuss:'Links',rolle:'Linksfuß für die Abwehr',daten:B.filter(x=>foot(x)).length},
    {k:'kopf',t:'Kopfballstärke',ist:B.filter(x=>sk(x,'kopfball')||sk(x,'luftduell')).length,soll:C.kopf,pos:'IV',rolle:'kopfballstark, gewinnt Luftduelle',daten:hatBogen},
    {k:'tempo',t:'Tempo',ist:B.filter(x=>sk(x,'tempo')).length,soll:C.tempo,pos:'Flügel',rolle:'Tempo, Antritt',daten:hatBogen},
    {k:'leader',t:'Führungsspieler',ist:B.filter(x=>x.b.tg.includes('leader')||x.b.tg.includes('coach')||(x.b.ch&&x.b.ch.fuehr>=4)).length,soll:C.leader,pos:'ZM',rolle:'Führungsspieler, Coach auf dem Platz',daten:hatBogen},
    {k:'standard',t:'Standardschütze',ist:B.filter(x=>sk(x,'standard')).length,soll:C.standard,pos:'OM',rolle:'Standardspezialist',daten:hatBogen},
    {k:'alt',t:'Nicht zu alt (32 und älter)',ist:A.filter(p=>alter(p)!=null&&alter(p)>=32).length,max:C.alt,pos:'ZM',rolle:'jünger, entlastet die Altersstruktur',daten:A.filter(p=>p.alter!=null).length},
    {k:'jung',t:'Perspektive (21 und jünger)',ist:A.filter(p=>alter(p)!=null&&alter(p)<=21).length,soll:C.jung,pos:'ZM',rolle:'junger Perspektivspieler',alter_bis:21,daten:A.filter(p=>p.alter!=null).length}];
  R.forEach(r=>{ r.ok=r.max!=null?r.ist<=r.max:r.ist>=r.soll; r.wenig=r.daten<Math.max(3,Math.round(A.length*0.4)); });
  return {R,n:A.length,hatBogen};
}

/* ---------- Bedarf: Abdeckung + Qualität + freie Plätze ---------- */
kd4NeedHtml=function(all,s,team){
  const V=sv60Cov(all,s,team), now=s===sv4S(), Q=sv60Qual(all,s,team), C=V.C;
  const own2=players.filter(p=>sv4Team(p,s)==='2'), ownA=players.filter(p=>sv4Team(p,s)==='A');
  const nm=p=>svEsc(p.name.split(' ').slice(-1)[0]);
  const rows=V.rows.map(n=>{
    const lvl=n.gap>0?'bad':n.risk>0?'warn':'ok';
    const bed=SV4.bed.filter(b=>b.pos===n.pos&&b.saison===s&&b.team===team&&!['erledigt','verworfen'].includes(b.status));
    const cand2=team==='1'?own2.filter(p=>kd4Pos(p,s)===n.pos||(p.pos2||[]).includes(n.pos)).sort((a,b)=>kd4Ovr(b)-kd4Ovr(a)).slice(0,2):[];
    const candA=team!=='A'?ownA.filter(p=>kd4Pos(p,s)===n.pos||(p.pos2||[]).includes(n.pos)).sort((a,b)=>kd4Ovr(b)-kd4Ovr(a)).slice(0,2):[];
    const bedLink=bed.map(b=>`<button type="button" class="lk4" data-bedopen="${b.id}">📋 ${svEsc(b.titel)} · ${SV4.bk.filter(x=>x.bedarf_id===b.id).length} Kandidaten</button>`).join('');
    const unsN=V.uns.filter(p=>kd4Pos(p,s)===n.pos);
    return `<div class="nd4 ${lvl}" data-cov60="${n.pos}"><div class="nd4-h"><b>${svEsc(SV4_POSL[n.pos]||n.pos)}</b><span class="nd4-c">${sv4Num(n.cov,n.cov%1?1:0)}<i>/${sv4Num(n.soll,n.soll%1?1:0)}</i></span>
        ${n.gap?`<em class="bad">fehlt ${n.gap}</em>`:n.risk?`<em class="warn">wackelt</em>`:`<em class="ok">abgedeckt</em>`}${sv4I('Abdeckung '+(SV4_POSL[n.pos]||n.pos),{art:'auto',txt:`Soll: ${svEsc(n.sollSrc)}. Hauptposition zählt 1, Nebenposition ${sv4Num(C.neben,1)}. Nur aktive, eingeplante Spieler zählen.`,rows:[['Hauptposition',n.haupt.length],['Nebenposition',n.neben.length+' × '+sv4Num(C.neben,1)],['Unsicher',unsN.length]]})}</div>
      <div class="nd4-d">${n.haupt.map(nm).join(', ')||'–'}${n.neben.length?` <span class="neb60">· neben: ${n.neben.map(nm).join(', ')}</span>`:''}${unsN.length?` <span class="warn">· unsicher: ${unsN.map(nm).join(', ')}</span>`:''}</div>
      ${n.gap||n.risk||bed.length?`<div class="nd4-a">
        ${cand2.map(p=>`<button type="button" class="lk4" data-up="${svEsc(p.id)}" data-upt="1">⬆ ${svEsc(p.name)} aus der Zweiten (${kd4Ovr(p)})</button>`).join('')}${candA.map(p=>`<button type="button" class="lk4" data-up="${svEsc(p.id)}" data-upt="${team}">🌱 ${svEsc(p.name)} aus der Jugend</button>`).join('')}
        ${bedLink||`<button type="button" class="btn sm" data-newbed="${n.pos}" data-zp="${now?'winter':'sommer'}">${SVI('plus')} Bedarf erstellen → Scouting</button>`}</div>`:''}
    </div>`; }).join('');
  const qual=Q.R.map(r=>`<div class="q60 ${r.ok?'ok':r.wenig?'na':'fehlt'}${r.wenig?' wenig':''}"><b>${svEsc(r.t)}</b><span>${r.ist}${r.max!=null?` <i>höchstens ${r.max}</i>`:` <i>von ${r.soll}</i>`}</span>
      ${r.wenig?`<small>Noch wenig Daten: ${r.daten} von ${Q.n} erfasst. Spielerbogen ergänzen</small>`:''}
      ${!r.ok?`<button type="button" class="lk4" data-qbed="${r.k}">${SVI('plus')} Bedarf anlegen</button>`:''}</div>`).join('');
  const freiCls=V.frei<0?'bad':V.frei<=2?'warn':'ok';
  return `<div class="kd4-nh"><h3>Bedarf ${sv4SL(s)}</h3><span class="note small">${now?'Jetzt: Winterfenster, aus der Zweiten oder der Jugend hochziehen':'Nächste Saison: Bedarf erstellen und direkt ans Scouting geben'} · Soll ${sv4Num(C.faktor,C.faktor%1?1:0)} × Startplätze, Nebenposition zählt ${sv4Num(C.neben,1)}</span>
      <button type="button" class="btn ghost sm" data-cfg60>${SVI('sliders')} Standards</button></div>
    <div class="fr60"><div class="fr60-n ${freiCls}"><b>${V.frei}</b><span>freie Kaderplätze</span></div><div class="fr60-t">${V.aktiv.length} aktive Spieler eingeplant bei ${V.groesse} Plätzen${V.uns.length?`, davon ${V.uns.length} unsicher`:''}.${V.frei<0?' Der Kader ist zu groß: Wer bekommt zu wenig Spielzeit?':V.frei===0?' Neue Spieler nur, wenn jemand geht.':''}</div></div>
    <div class="nd4g">${rows}</div>
    <h4 class="sec60">Was fehlt an Qualität? <small>aus Spielerbogen, Fuß und Alter</small></h4>
    <div class="q60g">${qual}</div>`;
};
async function sv60QualBedarf(k){
  const s=kd4S(), all=kd4Members(KD4.team,s), r=sv60Qual(all,s,KD4.team).R.find(x=>x.k===k); if(!r||typeof sc4BedarfEditor!=='function')return;
  sc4BedarfEditor(null,{pos:r.pos,saison:s===sv4S()?s:s,team:KD4.team,zeitpunkt:s===sv4S()?'winter':'sommer',grund:'verstaerkung'});
  setTimeout(()=>{ const M=document.getElementById('modal'); if(!M)return; const set=(sel,v)=>{ const e=M.querySelector(sel); if(e&&v!=null)e.value=v; };
    set('#b4fu',r.fuss||''); set('#b4ro',r.rolle); if(r.alter_bis)set('#b4a2',r.alter_bis); const t=M.querySelector('#b4t'); if(t){ t.value=r.t+' '+sv4SL(s); t.dataset.touched='1'; } },30);
}

/* ---------- Backup-Ansicht ---------- */
function sv60BackupHtml(all,s,team){
  const L=kd4Lineup(), xi=new Set(Object.values(L.slots)), C=sv60C(), {st}=sv60Starts();
  const aktiv=all.filter(p=>sv60Aktiv(p,s,team));
  const fit=(p,pos)=>kd4Pos(p,s)===pos?3:(p.pos2||[]).includes(pos)?2:((POSSIM[pos]||{})[kd4Pos(p,s)]||0);
  const cell=p=>`<button type="button" class="bk60" data-svp="${svEsc(p.id)}"><em style="--c:${tierColor(kd4Ovr(p))}">${kd4Ovr(p)}</em><b>${svEsc(p.name)}</b><small>${svEsc(kd4Pos(p,s))}${kd4Pos(p,s)!==p._bp?' · Neben':''}${kd4Status(p,s,team)==='unsicher'?' · unsicher':''}</small></button>`;
  const lines=SV4_POS.filter(pos=>st[pos]).map(pos=>{
    const need=Math.max(1,Math.round((C.faktor-1)*st[pos]));
    const start=Object.entries(L.slots).filter(([i,id])=>{ const F=FORMATIONS[L.formation]||[]; return F[i]&&ROLE2POS[F[i][0]]===pos; }).map(([,id])=>sv4P(id)).filter(Boolean);
    const back=aktiv.filter(p=>!xi.has(p.id)&&fit(p,pos)>=2).sort((a,b)=>fit(b,pos)-fit(a,pos)||kd4Ovr(b)-kd4Ovr(a)).slice(0,need+1).map(p=>Object.assign(p,{_bp:pos}));
    const fehlt=Math.max(0,need-back.length);
    return `<div class="bu60${fehlt?' bad':''}"><div class="bu60-h"><b>${svEsc(SV4_POSL[pos])}</b><span>${st[pos]} in der Elf · ${need} Backup${need>1?'s':''} nötig</span>${fehlt?`<em class="bad">fehlt ${fehlt}</em>`:'<em class="ok">gesichert</em>'}</div>
      <div class="bu60-c"><div><h6>Startelf</h6>${start.map(p=>{ p._bp=pos; return cell(p); }).join('')||'<p class="note small">nicht besetzt</p>'}</div><div><h6>Backup</h6>${back.map(cell).join('')||'<p class="note small bad">niemand</p>'}</div></div></div>`; }).join('');
  return `<div class="kd4-lh"><h3>${SV4_TEAM[team]} · ${sv4SL(s)} <small>Backup je Position</small></h3></div>
    <p class="note small">Wer springt ein, wenn einer aus der Startelf (${svEsc(L.formation)}) ausfällt? Nebenpositionen zählen mit, inaktive Spieler nicht.</p>${lines}`;
}

/* ---------- Übergang aus der A-Jugend ---------- */
function sv60Jahrgang(p){
  const k=(SV4.ju&&SV4.ju.k||[]).find(x=>x.player_id===p.id||x.name===p.name);
  if(k&&k.jahrgang)return {j:k.jahrgang,est:false};
  if(p.geb)return {j:+String(p.geb).slice(0,4),est:false};
  const a=p.alter!=null?p.alter:p.estAlter; if(a!=null)return {j:2026-a,est:true};
  return null;
}
function sv60UebergangHtml(s,team){
  if(s===sv4S()||team==='A')return '';
  const Y=2000+(+String(s).slice(0,2)), grenze=Y-19;
  const L=players.filter(p=>sv4Team(p,sv4S())==='A').map(p=>({p,j:sv60Jahrgang(p)})).filter(x=>x.j&&x.j.j<=grenze);
  if(!L.length)return '';
  return `<div class="card ue60"><div class="kd4-lh"><h3>Übergang aus der A-Jugend <small>Jahrgang ${grenze} und älter</small></h3></div>
    <p class="note small">Diese Spieler sind ${sv4SL(s)} zu alt für die A-Jugend. Wo planen wir sie ein?</p>
    ${L.map(({p,j})=>{ const t=sv4Team(p,s), r=sv4SS(p.id,s);
      return `<div class="ue60-r"><button type="button" class="kr4-n" data-svp="${svEsc(p.id)}"><b>${svEsc(p.name)}</b><small>${svEsc(p.pos||'')} · Jahrgang ${j.j}${j.est?' (geschätzt)':''}</small></button>
        <div class="seg4 sm">${[['1','Erste'],['2','Zweite'],['x','Hört auf / geht']].map(([k,l])=>`<button type="button" data-ue="${svEsc(p.id)}" data-uet="${k}" class="${(k==='x'&&r&&(r.zukunft==='geht'||r.zukunft==='karriereende'))||(t===k&&r)?'on':''}">${l}</button>`).join('')}</div></div>`; }).join('')}</div>`;
}

/* ---------- Transferperioden ---------- */
function sv60Fenster(){
  const C=sv60C(), today=sv4Today(), y=+today.slice(0,4), d=(yy,md)=>yy+'-'+md;
  const F=[];
  for(const yy of [y-1,y,y+1]){ F.push({k:'sommer',t:'Sommer',von:d(yy,C.sommer.von),bis:d(yy,C.sommer.bis),abm:d(yy,C.sommer.abm)}); F.push({k:'winter',t:'Winter',von:d(yy,C.winter.von),bis:d(yy,C.winter.bis),abm:d(yy-1,C.winter.abm)}); }
  F.sort((a,b)=>a.von.localeCompare(b.von));
  const offen=F.find(f=>f.von<=today&&today<=f.bis), next=F.find(f=>f.von>today);
  const tage=(a,b)=>Math.round((new Date(b+'T12:00:00')-new Date(a+'T12:00:00'))/864e5);
  return {offen,next,tage:x=>tage(today,x)};
}
function sv60FensterHtml(){
  const W=sv60Fenster(), o=W.offen, n=W.next;
  return `<div class="tf60${o?' open':''}"><span class="tf60-i">${o?'🔓':'🔒'}</span><div>${o?`<b>Wechselfenster ${o.t} ist offen</b><span>noch ${W.tage(o.bis)} Tage bis ${sv4D(o.bis)}</span>`:`<b>Kein Wechselfenster offen</b><span>${n?`${n.t}: ${sv4D(n.von)} bis ${sv4D(n.bis)} · in ${W.tage(n.von)} Tagen · Abmeldung beim alten Verein bis ${sv4D(n.abm)}`:''}</span>`}</div></div>`;
}

/* ---------- Plausibilität ---------- */
function sv60Plausi(s,team){
  const t=sv60Target(s), all=kd4Members(team,s), out=[], nm=p=>p.name;
  const inj=p=>{ try{ return typeof trInjury==='function'?trInjury(p.id):null; }catch(e){ return null; } };
  const plan=all.filter(p=>['bleibt','neu','hoch','runter','unsicher'].includes(kd4Status(p,t===s?s:s,team))||s===sv4S());
  const ann=all.filter(p=>!['geht','karriereende','weg','ziel'].includes(kd4Status(p,s,team))&&sv60Si(p,t)==='annahme');
  if(ann.length)out.push({lvl:ann.length>5?'hoch':'mittel',t:`${ann.length} Spieler nur angenommen`,d:`Für ${sv4SL(t)} gibt es kein Gespräch und keine Planung: ${ann.slice(0,8).map(nm).join(', ')}${ann.length>8?' …':''}. Gespräch führen oder als Planung markieren.`});
  all.forEach(p=>{ const g=sv60LastG(p.id), z=sv4Zuk(p,t);
    if(g&&g.zukunft&&['geht','karriereende','unsicher'].includes(g.zukunft)&&z==='bleibt')out.push({lvl:'hoch',pid:p.id,t:`${nm(p)}: Plan und Gespräch passen nicht`,d:`Im Gespräch vom ${sv4D(g.datum)} hieß es „${SV4_ZUK[g.zukunft][0]}“, geplant ist „bleibt“.`});
    if(g&&(Date.now()-new Date(g.datum))/864e5>150&&z==='unsicher')out.push({lvl:'mittel',pid:p.id,t:`${nm(p)} ist seit Monaten unsicher`,d:`Letztes Gespräch ${sv4Ago(g.datum)}. Nachfassen.`});
    const a=p.alter!=null?p.alter+(+String(t).slice(0,2)-+sv4S().slice(0,2)):null;
    if(a!=null&&a>=34&&z==='bleibt'&&sv60Si(p,t)==='annahme')out.push({lvl:'mittel',pid:p.id,t:`${nm(p)} (${a}) ohne Zusage eingeplant`,d:'Bei erfahrenen Spielern lieber früh nachfragen, ob es noch eine Saison wird.'});
    const i=inj(p); if(i&&i.pr&&i.pr>sv4Today()&&(new Date(i.pr)-new Date(i.b))/864e5>=56&&!sv60Inaktiv(p,s))out.push({lvl:'info',pid:p.id,t:`${nm(p)} fällt lange aus`,d:`${i.dg}, Prognose ${sv4D(i.pr)}. Als inaktiv setzen, damit die Abdeckung stimmt?`});
    if(kd4Status(p,s,team)==='neu'&&!p.own&&!SV4.gs.some(x=>x.player_id===p.id))out.push({lvl:'hoch',pid:p.id,t:`${nm(p)}: Neuzugang ohne Gespräch`,d:'Als Neuzugang zählt nur, mit wem gesprochen wurde. Sonst gehört er in die Traumelf.'});
  });
  if(s===sv4S()&&(team==='1'||team==='2'))all.forEach(p=>{ const f=sv60Fakt(p); if(f&&!f.beide&&f.team!==team&&f[f.team==='1'?'a1':'a2']>=3)out.push({lvl:'info',pid:p.id,t:`${nm(p)} spielt faktisch in der ${f.team==='1'?'Ersten':'Zweiten'}`,d:`Einsätze: Erste ${f.a1}, Zweite ${f.a2}. Geplant ist die ${team==='1'?'Erste':'Zweite'}.`}); });
  try{ if(typeof TR!=='undefined'&&TR.loaded&&s===sv4S())all.filter(p=>sv60Aktiv(p,s,team)).forEach(p=>{ const st=TRC.playerStats(TR.st,p.id,trToday()); if(st.rateSeason!=null&&st.rateSeason<0.5&&st.n28>=0&&TRC.rows(TR.st,p.id).length>=6)out.push({lvl:'info',pid:p.id,t:`${nm(p)}: wenig im Training`,d:`Beteiligung ${Math.round(st.rateSeason*100)} %. Passt das zur Planung?`}); }); }catch(e){}
  const V=sv60Cov(all,s,team); if(V.frei<0)out.push({lvl:'mittel',t:`Kader ${-V.frei} Spieler zu groß`,d:`${V.aktiv.length} aktive Spieler bei ${V.groesse} Plätzen.`});
  V.rows.filter(r=>r.gap>0).forEach(r=>out.push({lvl:r.pos==='TW'?'hoch':'mittel',t:`${SV4_POSL[r.pos]}: fehlt ${r.gap}`,d:`Abdeckung ${sv4Num(r.cov,1)} von ${r.soll}.`}));
  if(s!==sv4S()&&team!=='A'){ const Y=2000+(+String(s).slice(0,2)); const offen=players.filter(p=>sv4Team(p,sv4S())==='A'&&!sv4SS(p.id,s)).filter(p=>{ const j=sv60Jahrgang(p); return j&&j.j<=Y-19; });
    if(offen.length)out.push({lvl:'mittel',t:`${offen.length} A-Jugendliche ohne Entscheidung`,d:`${offen.map(nm).join(', ')} sind ${sv4SL(s)} zu alt für die A-Jugend.`}); }
  const ord={hoch:0,mittel:1,info:2}; return out.sort((a,b)=>ord[a.lvl]-ord[b.lvl]);
}
function sv60PlausiHtml(s,team){
  const L=sv60Plausi(s,team);
  return `<div class="card pl60"><button type="button" class="pl60-h" data-pl60 aria-expanded="${SV60.plOpen}"><span>🧭 Plausibilität ${sv4SL(s)}</span><em class="${L.some(x=>x.lvl==='hoch')?'bad':L.length?'warn':'ok'}">${L.length?L.length+' Hinweis'+(L.length>1?'e':''):'alles stimmig'}</em><i>${SV60.plOpen?'ausblenden':'anzeigen'}</i></button>
    ${SV60.plOpen?`<div class="pl60-b">${L.map(x=>`<div class="tra l-${x.lvl}"><div class="tra-b"><b ${x.pid?`data-svp="${svEsc(x.pid)}"`:''}>${svEsc(x.t)}</b><span>${svEsc(x.d)}</span></div></div>`).join('')||'<p class="note">Keine Widersprüche gefunden.</p>'}
      <div class="btnrow"><button type="button" class="btn ghost sm" data-plki>🎙️ Co-Trainer drüberschauen lassen</button></div></div>`:''}</div>`;
}

/* ---------- Einstellungen (Standards) ---------- */
function sv60CfgEditor(){
  const C=sv60C();
  const n=(id,v,st,mi,ma)=>`<input type="number" id="${id}" value="${v}" step="${st||1}" min="${mi??0}" max="${ma??60}">`;
  const M=svModal(`<div class="mhead"><div class="rm-ic" style="width:46px;height:46px">${SVI('sliders')}</div><div><h2 style="margin:0">Standards der Kaderplanung</h2><div class="msub">Gelten für alle im Team. Jederzeit änderbar</div></div></div>
    <div class="editgrid">
      <div class="field"><label>Kadergröße Erste</label>${n('c6k1',C.kader['1'],1,11,40)}</div>
      <div class="field"><label>Kadergröße Zweite</label>${n('c6k2',C.kader['2'],1,11,40)}</div>
      <div class="field"><label>Kadergröße A-Jugend</label>${n('c6kA',C.kader['A'],1,11,40)}</div>
      <div class="field"><label>Soll je Position (× Startplätze)</label>${n('c6f',C.faktor,0.5,1,4)}</div>
      <div class="field"><label>Nebenposition zählt</label>${n('c6n',C.neben,0.1,0,1)}</div>
      <div class="field w"><h4 class="sec60" style="margin:6px 0 0">Qualität: Mindestens …</h4></div>
      <div class="field"><label>Linksfüße in der Abwehr</label>${n('c6q1',C.qual.links)}</div>
      <div class="field"><label>Kopfballstarke</label>${n('c6q2',C.qual.kopf)}</div>
      <div class="field"><label>Tempospieler</label>${n('c6q3',C.qual.tempo)}</div>
      <div class="field"><label>Führungsspieler</label>${n('c6q4',C.qual.leader)}</div>
      <div class="field"><label>Standardschützen</label>${n('c6q5',C.qual.standard)}</div>
      <div class="field"><label>Junge (bis 21)</label>${n('c6q7',C.qual.jung)}</div>
      <div class="field"><label>Höchstens Spieler ab 32</label>${n('c6q6',C.qual.alt)}</div>
      <div class="field w"><h4 class="sec60" style="margin:6px 0 0">Wechselfenster (Tag-Monat)</h4></div>
      <div class="field"><label>Sommer von / bis</label><div class="two4"><input id="c6sv" value="${svEsc(C.sommer.von)}" maxlength="5"><input id="c6sb" value="${svEsc(C.sommer.bis)}" maxlength="5"></div></div>
      <div class="field"><label>Winter von / bis</label><div class="two4"><input id="c6wv" value="${svEsc(C.winter.von)}" maxlength="5"><input id="c6wb" value="${svEsc(C.winter.bis)}" maxlength="5"></div></div>
    </div>
    <p class="note small">Standard nach DFB-Spielordnung für Amateure: Sommer 1.7. bis 31.8. (Abmeldung bis 30.6.), Winter 1.1. bis 31.1. (Abmeldung bis 31.12.). Datum als MM-TT, also 07-01 für den 1. Juli.</p>
    <div class="btnrow sbact"><button class="btn" id="c6s">${SVI('check')} Speichern</button><button class="btn ghost" id="c6r">Auf Standard zurück</button><button class="btn ghost" id="c6x">Abbrechen</button></div>`);
  const v=id=>M.querySelector('#'+id).value, num=(id,d)=>{ const x=parseFloat(String(v(id)).replace(',','.')); return isFinite(x)?x:d; }, md=(id,d)=>/^(0[1-9]|1[0-2])-(0[1-9]|[12]\d|3[01])$/.test(v(id))?v(id):d;
  M.querySelector('#c6x').onclick=()=>closeOverlay();
  M.querySelector('#c6r').onclick=async()=>{ try{ await sv60CfgSave({}); closeOverlay(); kToast('✓ Standards zurückgesetzt'); kd4Render(); }catch(e){ kToast('⚠️ '+e.message); } };
  M.querySelector('#c6s').onclick=async()=>{ const D=SV60_DEF;
    const cfg={kader:{'1':num('c6k1',24),'2':num('c6k2',22),'A':num('c6kA',22)},faktor:Math.max(1,Math.min(4,num('c6f',2))),neben:Math.max(0,Math.min(1,num('c6n',0.5))),
      qual:{links:num('c6q1',1),kopf:num('c6q2',2),tempo:num('c6q3',2),leader:num('c6q4',2),standard:num('c6q5',1),alt:num('c6q6',4),jung:num('c6q7',3)},
      sommer:{von:md('c6sv',D.sommer.von),bis:md('c6sb',D.sommer.bis),abm:D.sommer.abm},winter:{von:md('c6wv',D.winter.von),bis:md('c6wb',D.winter.bis),abm:D.winter.abm}};
    try{ await sv60CfgSave(cfg); closeOverlay(); svSound('success'); kToast('✓ Standards gespeichert'); kd4Render(); }catch(e){ kToast('⚠️ '+e.message); } };
}

/* ---------- Kaderplan-Seite erweitern ---------- */
{ const _kr60=kd4Render; kd4Render=function(){
  const r=_kr60.apply(this,arguments);
  try{
    const P=document.getElementById('panel-kader'); if(!P||!P.querySelector('.kd4'))return r;
    if(!SV60.cfgLoaded)sv60CfgLoad().then(()=>{ if(svCurTab()==='kader')kd4Render(); });
    const s=kd4S(), team=KD4.team, t=sv60Target(s), all=kd4Members(team,s);
    // Kopf: Sicherheit der Planung, freie Plätze, Wechselfenster
    const top=P.querySelector('.kd4-top'), sum=top&&top.querySelector('.kd4-sum');
    if(sum){ const L=all.filter(p=>!['geht','karriereende','weg','ziel'].includes(kd4Status(p,s,team))), c={}; L.forEach(p=>{ const k=sv60Si(p,t); c[k]=(c[k]||0)+1; });
      const V=sv60Cov(all,s,team); const ina=all.filter(p=>sv60Inaktiv(p,s)).length;
      sum.insertAdjacentHTML('beforeend',`<span class="${V.frei<0?'bad':V.frei<=2?'warn':'ok'}"><b>${V.frei}</b> frei</span>${ina?`<span><b>${ina}</b> inaktiv</span>`:''}`);
      top.insertAdjacentHTML('beforeend',`<div class="si60bar" title="Wie sicher ist die Planung für ${sv4SL(t)}?"><span>Planung ${sv4SL(t)}:</span>${Object.entries(SV60_SI).map(([k,[l,cl]])=>`<i class="si60 ${cl}">${l} ${c[k]||0}</i>`).join('')}</div>${sv60FensterHtml()}`); }
    // Liste | Backup
    const list=P.querySelector('.kd4-list');
    if(list){ const h=list.querySelector('.kd4-lh'); if(h)h.insertAdjacentHTML('beforeend',`<div class="seg4 sm vw60">${[['liste','Liste'],['backup','Backup']].map(([k,l])=>`<button type="button" data-vw60="${k}" class="${SV60.view===k?'on':''}">${l}</button>`).join('')}</div>`);
      if(SV60.view==='backup'){ list.innerHTML=sv60BackupHtml(all,s,team).replace('</h3></div>',`</h3><div class="seg4 sm vw60">${[['liste','Liste'],['backup','Backup']].map(([k,l])=>`<button type="button" data-vw60="${k}" class="${SV60.view===k?'on':''}">${l}</button>`).join('')}</div></div>`); list.querySelectorAll('[data-svp]').forEach(b=>b.onclick=()=>openModal(b.dataset.svp)); }
      list.querySelectorAll('[data-vw60]').forEach(b=>b.onclick=()=>{ SV60.view=b.dataset.vw60; kd4Render(); });
      // Wunschspieler: zählen nicht, gehören in die Traumelf
      list.querySelectorAll('.kl4 h5').forEach(h5=>{ if(/^Wunschspieler/.test(h5.textContent))h5.insertAdjacentHTML('beforeend',' <small class="ws60">zählen nicht · <a href="#" data-gosxi>Traumelf</a></small>'); });
      const gx=list.querySelector('[data-gosxi]'); if(gx)gx.onclick=e=>{ e.preventDefault(); sv4Go('sxi'); }; }
    // A-Jugend-Übergang und Plausibilität
    const need=P.querySelector('#kd4Need');
    if(need){ need.insertAdjacentHTML('beforebegin',sv60UebergangHtml(s,team)); need.insertAdjacentHTML('afterend',sv60PlausiHtml(s,team)); }
    P.querySelectorAll('.ue60 [data-svp],.pl60 [data-svp]').forEach(b=>b.onclick=()=>openModal(b.dataset.svp));
    P.querySelectorAll('[data-ue]').forEach(b=>b.onclick=async()=>{ const p=sv4P(b.dataset.ue), k=b.dataset.uet;
      try{ await sv4SSSet(p.id,s,k==='x'?{team:null,zukunft:'geht',sicherheit:'planung'}:{team:k,zukunft:'hoch',sicherheit:'planung'}); kToast('✓ '+p.name+': '+(k==='x'?'hört auf':(k==='1'?'Erste':'Zweite'))+' '+sv4SL(s)); kd4Render(); }catch(e){ kToast('⚠️ '+e.message); } });
    const pl=P.querySelector('[data-pl60]'); if(pl)pl.onclick=()=>{ SV60.plOpen=!SV60.plOpen; kd4Render(); };
    const ki=P.querySelector('[data-plki]'); if(ki)ki.onclick=()=>{ const L=sv60Plausi(s,team); trChatOpen(); setTimeout(()=>{ const ta=document.getElementById('trcTxt'); if(ta){ ta.value=`Schau bitte über unsere Kaderplanung ${SV4_TEAM[team]} ${sv4SL(s)}. Die App hat das gefunden: ${L.slice(0,8).map(x=>x.t).join('; ')||'keine Widersprüche'}. Was fällt dir noch auf, und was sollten wir zuerst klären?`; ta.dispatchEvent(new Event('input')); ta.focus(); } },260); };
    P.querySelectorAll('[data-qbed]').forEach(b=>b.onclick=()=>sv60QualBedarf(b.dataset.qbed));
    const cf=P.querySelector('[data-cfg60]'); if(cf)cf.onclick=()=>sv60CfgEditor();
  }catch(e){ console.warn('Kaderplan 0.6',e); }
  return r; }; }

/* ---------- Neuzugang erst nach Gespräch ---------- */
kd4AddPicker=function(){
  const s=kd4S(), team=KD4.team;
  const M=svModal(`<h2 style="margin:0 0 4px">Spieler für ${SV4_TEAM[team]} · ${sv4SL(s)}</h2><p class="note">Neuzugang zählt erst, wenn es ein Gespräch gab. Ohne Gespräch ist es ein Wunschspieler für die Traumelf.</p>
    <input class="kx-in" id="kd4Q" placeholder="Name oder Verein …" autocomplete="off"><div class="seg4 sm" style="margin:8px 0"><button type="button" class="on" data-am="neu">Neuzugang / fest</button><button type="button" data-am="ziel">Wunschspieler</button></div><div id="kd4R" class="pk4"></div>`);
  let mode='neu'; const q=M.querySelector('#kd4Q'), R=M.querySelector('#kd4R');
  M.querySelectorAll('[data-am]').forEach(b=>b.onclick=()=>{ mode=b.dataset.am; M.querySelectorAll('[data-am]').forEach(x=>x.classList.toggle('on',x===b)); draw(); });
  const hatG=p=>SV4.gs.some(x=>x.player_id===p.id);
  const draw=()=>{ const t=svNorm?svNorm(q.value):q.value.toLowerCase(); const L=players.filter(p=>sv4Team(p,s)!==team&&(!t||(svNorm?svNorm(p.name+' '+p.club):(p.name+' '+p.club).toLowerCase()).includes(t))).sort((a,b)=>kd4Ovr(b)-kd4Ovr(a)).slice(0,30);
    R.innerHTML=L.map(p=>`<button type="button" data-pick="${svEsc(p.id)}"><b>${svEsc(p.name)}</b><span>${svEsc(p.club)} · ${svEsc(p.pos||'')} · ${kd4Ovr(p)}</span><i>${svEsc(sv4Bez(p).t)}${mode==='neu'&&!p.own?(hatG(p)?' · Gespräch ✓':' · noch kein Gespräch'):''}</i></button>`).join('')||'<p class="note">Niemand gefunden.</p>';
    R.querySelectorAll('[data-pick]').forEach(b=>b.onclick=async()=>{ const p=sv4P(b.dataset.pick);
      if(mode==='neu'&&!p.own&&!hatG(p)){
        R.innerHTML=`<div class="gate60"><b>${svEsc(p.name)}: erst das Gespräch</b><p>Als Neuzugang zählt nur, mit wem schon gesprochen wurde. Halte kurz fest, was besprochen ist, dann kommt er in den Kaderplan. Bis dahin kannst du ihn als Wunschspieler in der Traumelf planen.</p>
          <div class="btnrow"><button type="button" class="btn sm" data-g60>💬 Gespräch festhalten</button><button type="button" class="btn ghost sm" data-w60>Als Wunschspieler</button><button type="button" class="btn ghost sm" data-b60>Zurück</button></div></div>`;
        R.querySelector('[data-g60]').onclick=()=>{ kd4GesprEditor(p.id); setTimeout(()=>{ const a=document.getElementById('g4a'); if(a)a.value='verhandlung'; const sy=document.getElementById('g4sync'); if(sy)sy.checked=false; },30); };
        R.querySelector('[data-w60]').onclick=async()=>{ try{ await sv4SSSet(p.id,s,{team,zukunft:'ziel'}); kToast('✓ '+p.name+' als Wunschspieler'); closeOverlay(); kd4Render(); }catch(e){ kToast('⚠️ '+e.message); } };
        R.querySelector('[data-b60]').onclick=()=>draw(); return; }
      try{ await sv4SSSet(p.id,s,{team,zukunft:mode==='ziel'?'ziel':(p.own?'hoch':'neu'),sicherheit:mode==='ziel'?null:(p.own?'planung':'zusage')}); kToast('✓ '+p.name+(mode==='ziel'?' als Wunschspieler':' im Kader ')+sv4SL(s)); closeOverlay(); kd4Render(); }catch(e){ kToast('⚠️ '+e.message); } }); };
  q.oninput=draw; draw(); setTimeout(()=>q.focus(),50);
};

/* =====================================================================
   Sportzentrale Beta 0.6 · Stufe 3: Scouting & MScore
   - Eye-Test mit regionaler Skala (Anker 50, 70, 90), Schnitt aller Planer, Streuung und eigener Bereich
   - MScore neu gewichtet: Einsatz & Liga am stärksten, Presse nur noch rund 5 %, Teamstärke kaum (keine Doppelzählung),
     interne Trainerbewertung (Noten aus Training und Spiel) für eigene Spieler, Datenbasis je Spieler sichtbar
   - Vereinstreue (Loyalität) bleibt außerhalb des MScore und erscheint als eigenes Abzeichen
   - Elf der Woche: Torschützen vorne, Abwehr und Torwart aus den Mannschaften mit den wenigsten Gegentoren
   - Mehr Filter im Spielermarkt und im KI-Auftrag
   ===================================================================== */
const SV70={eyeF:'offen',f:{fuss:'',stamm:false,min:0,basis:false},cache:new Map()};
const SV70_ANK=[[90,'Top der Region','Verbandsliga und höher'],[70,'Stark','Kreisoberliga bis Gruppenliga'],[50,'Solide','Stammspieler Kreisliga A'],[30,'Ausbaufähig','Kreisliga B/C oder Ergänzung'],[0,'Noch weit weg','']];
function sv70Anker(v){ if(v==null)return null; return SV70_ANK.find(a=>v>=a[0])||SV70_ANK[SV70_ANK.length-1]; }

/* ---------- MScore: neue Gewichte, Trainerbewertung, Datenbasis ---------- */
Object.assign(DEF_WEIGHTS,{level:22,prod:20,share:8,ctx:3,pot:10,trend:8,presse:5,scout:14,trainer:10}); W={...DEF_WEIGHTS};
Object.assign(WLBL,{trainer:'Trainerbewertung (Noten aus Training und Spiel, nur eigene Spieler)'});
if(typeof SV4_CL!=='undefined')SV4_CL.trainer='Trainer';
function sv70TrainerNoten(p){
  if(!p||!p.own||typeof TR==='undefined'||!TR.loaded)return null;
  const st=typeof sv50Start==='function'?sv50Start():'2026-07-01', L=[];
  for(const s of TR.st.sessions){ if(s.d<st)continue; const a=(s.a||[]).find(x=>x[0]===p.id); if(a&&a[8]!=null&&a[9]&&a[9]!=='default'&&a[1]!=='weg')L.push({n:+a[8],t:s.t}); }
  if(L.length<3)return {n:L.length,avg:null};
  const avg=L.reduce((x,y)=>x+y.n,0)/L.length;
  return {n:L.length,avg,sp:L.filter(x=>x.t==='spiel').length};
}
{ const _sc70=scores; scores=function(p){
  const r=_sc70.apply(this,arguments);
  if(!p||!r||!r.comps||p.isJugend)return r;
  const k=p.id+'|'+SV4.gen+'|'+(typeof TR!=='undefined'&&TR.loaded?TR.st.sessions.length:0); const hit=SV70.cache.get(k); if(hit)return hit;
  if(SV70.cache.size>6000)SV70.cache.clear();
  const o=Object.assign({},r,{comps:r.comps.slice()});
  const wT=W.trainer||0, N=sv70TrainerNoten(p);
  const v=N&&N.avg!=null?Math.round(Math.max(0,Math.min(100,(6-N.avg)/5*100))):null;
  if(p.own)o.comps.push({k:'trainer',t:'Trainerbewertung',v,w:v!=null?wT:0,art:'manuell',basis:N&&N.avg!=null?`Ø Note ${sv4Num(N.avg,1)} aus ${N.n} Bewertungen der Saison (${N.sp||0} davon im Spiel). Note 1 = 100, Note 3 = 60, Note 6 = 0. Automatisch vergebene 3er zählen nicht.`:`Noch zu wenige echte Noten (${N?N.n:0} von mindestens 3). Zählt erst dann mit.`});
  if(v!=null&&wT>0&&p.adjTo==null){ o.total=Math.round(((r.total*r.sum+v*wT)/(r.sum+wT))*10)/10; o.sum=r.sum+wT; o.trainer=v; }
  // Datenbasis: welcher Anteil des Gewichts beruht auf echten Daten statt auf neutralen Annahmen?
  const known={prod:!!(r.E&&r.E.seasons&&r.E.seasons.length),level:r.q!=null&&!(r.E&&r.E.est),share:r.shareRaw!=null||!!r.defMode,ctx:!!((r.cur&&r.cur.rank)||p.rank),
    pot:p.alter!=null,trend:r.tratio!=null,presse:p.pressIdx!=null,scout:r.eye!=null,trainer:v!=null};
  let wa=0,wk=0; Object.keys(known).forEach(c=>{ if(c==='trainer'&&!p.own)return; const w=W[c]||0; wa+=w; if(known[c])wk+=w; });
  o.basis=wa?Math.round(wk/wa*100):0; o.basisK=known;
  SV70.cache.set(k,o); return o;
}; }
{ const _rb70=renderAll; renderAll=function(){ SV70.cache.clear(); return _rb70.apply(this,arguments); }; }
function sv70BasisTxt(b){ return b>=75?'gut':b>=50?'mittel':'dünn'; }
{ const _ph70=pf4ScoreHtml; pf4ScoreHtml=function(p,s){ let h=_ph70.apply(this,arguments); try{ const o=scores(p); if(o&&o.basis!=null){
    h=h.replace('<p class="note small">Gewichte anpassen',`<p class="bs70 b-${sv70BasisTxt(o.basis)}"><b>Datenbasis ${o.basis} %</b> · ${sv70BasisTxt(o.basis)}. Fehlt: ${Object.entries(o.basisK).filter(([k,v])=>!v&&(k!=='trainer'||p.own)).map(([k])=>SV4_CL[k]||k).join(', ')||'nichts'}.</p><p class="note small">Loyalität zählt bewusst nicht in den MScore, sie steht als eigenes Abzeichen im Profil. Gewichte anpassen`); } }catch(e){} return h; }; }

/* ---------- Vereinstreue als Abzeichen ---------- */
function sv70Treue(p){
  try{ if(!p||!p.own||typeof VR==='undefined'||!VR.evLoaded||!VR.atLoaded||typeof vrScores!=='function')return null; return vrScores(p).ls; }catch(e){ return null; }
}
{ const _om70=openModal; openModal=function(){ const r=_om70.apply(this,arguments); try{
    const p=sv4P(arguments[0]), M=document.getElementById('modal'); if(!p||!M)return r;
    const G=M.querySelector('.pf4-glance'); if(!G||G.querySelector('.tr70'))return r;
    const s=scores(p);
    if(s&&s.basis!=null){ const big=G.querySelector('.g4.big small'); if(big)big.insertAdjacentHTML('beforeend',` · Datenbasis ${s.basis} %`); }
    const L=sv70Treue(p);
    if(L){ G.insertAdjacentHTML('beforeend',`<div class="g4 tr70"><span>Vereinstreue ${sv4I('Vereinstreue',{art:'auto',quelle:'Helfereinsätze, Pflichtspiele seit 2013/14, Teamgeist',txt:'Zählt bewusst nicht in den MScore. Der MScore bewertet die sportliche Stärke, die Treue steht daneben.',rows:(L.why||[]).slice(0,4).map((w,i)=>['•',svEsc(w)])})}</span><b style="color:${L.score>=75?'#5fe09b':L.score>=55?'#fcd34d':'#ff8a8a'}">❤️ ${L.score}</b><small>${L.n} Helfereinsätze · ${L.spiele} Pflichtspiele laut Vereinsseite (seit 13/14) und App</small></div>`); }
    else if(p.own&&typeof VR!=='undefined'&&!VR._tr70&&canTraining()){ VR._tr70=1; try{ if(!VR.evLoaded)vrLoadEvents(); if(!VR.atLoaded)vrLoadAllTime(); }catch(e){} }
  }catch(e){ console.warn('Treue',e); } return r; }; }
if(typeof SV50_COLS!=='undefined'){
  SV50_COLS.treue={t:'Treue',v:p=>{ const L=sv70Treue(p); return L?-L.score:1; },h:p=>{ const L=sv70Treue(p); return L?`<span title="Vereinstreue">❤️ ${L.score}</span>`:'–'; }};
  SV50_COLS.basis={t:'Datenbasis',v:p=>{ try{ return -scores(p).basis; }catch(e){ return 0; } },h:p=>{ try{ const b=scores(p).basis; return `<span class="bs70 b-${sv70BasisTxt(b)}">${b} %</span>`; }catch(e){ return '–'; } }};
  if(SV50_PRESETS.planung&&!SV50_PRESETS.planung.cols.includes('treue'))SV50_PRESETS.planung.cols.push('basis','treue');
}

/* ---------- Eye-Test: Anker, Team-Schnitt, Gesamtwert ---------- */
function sv70EyeTotal(e,pos){ const w=SV4_EYE_W[pos]||SV4_EYE_W.ZM; let s=0,ws=0; for(const k in w){ const v=e[k]; if(v!=null&&w[k]>0){ s+=+v*w[k]; ws+=w[k]; } } return ws?s/ws*10:null; }
{ const _ef70=pf4EyeForm; pf4EyeForm=function(box,p){
  const r=_ef70.apply(this,arguments);
  try{
    const E=sv4Eye(p.id), hs=box.querySelector('.ey4-h small');
    if(hs)hs.innerHTML='Regionale Skala: <b>5</b> solider Stammspieler Kreisliga A · <b>7</b> stark, Kreisoberliga bis Gruppenliga · <b>9</b> Top der Region, Verbandsliga und höher';
    const others=E?E.list.filter(e=>!(E.mine&&e.id===E.mine.id)):[];
    box.querySelectorAll('.ey4-r').forEach(l=>{ const i=l.querySelector('[data-ey]'), k=i.dataset.ey;
      const vals=others.map(e=>e[k]).filter(v=>v!=null).map(Number);
      if(vals.length){ const a=vals.reduce((x,y)=>x+y,0)/vals.length; l.insertAdjacentHTML('beforeend',`<small class="ey70-avg" title="Schnitt der anderen (${vals.length})">Ø ${sv4Num(a,1)}</small>`); } });
    const g=box.querySelector('.ey4-g');
    if(g){ g.insertAdjacentHTML('afterend',`<div class="ey70-sum"><span>Gesamt für ${svEsc(p.pos||'ZM')}</span><b id="ey70t">–</b><em id="ey70a"></em>${E&&E.n?`<i>Team-Schnitt ${sv4Num(sv4EyeVal(p.id,p.pos)?sv4EyeVal(p.id,p.pos).v:null,0)} aus ${E.n} Bewertung${E.n>1?'en':''}</i>`:''}</div>
`);
      const upd=()=>{ const o={}; box.querySelectorAll('[data-ey]').forEach(i=>{ const x=+i.value; if(x>=1)o[i.dataset.ey]=x; }); const t=sv70EyeTotal(o,p.pos); const A=sv70Anker(t);
        box.querySelector('#ey70t').textContent=t==null?'–':Math.round(t); box.querySelector('#ey70a').textContent=A&&t!=null?A[1]+(A[2]?' · '+A[2]:''):''; };
      box.querySelectorAll('[data-ey]').forEach(i=>i.addEventListener('input',upd)); upd(); }
  }catch(e){ console.warn('Eye-Test 0.6',e); }
  return r; }; }

/* ---------- Scouting → Eye-Test: alle Bewertungen im Überblick ---------- */
SV4_HUB.scouting.tabs.splice(Math.max(0,SV4_HUB.scouting.tabs.findIndex(([k])=>k==='totw')),0,['eye','Eye-Test']);
SV4_OF.eye='scouting';
SV_PAGES.eye=['Scouting','Eye-Test: Bewertungen aller Planer, Schnitt und Streuung'];
{ const _ta70=svTabAllowed; svTabAllowed=function(t){ if(t==='eye')return sv4Can(); return _ta70.apply(this,arguments); }; }
if(typeof SV50_INFO!=='undefined')SV50_INFO.eye={w:'Alle Eye-Tests auf einen Blick: Schnitt aller Planer, wie einig sie sich sind, und wo deine Bewertung noch fehlt.',
  f:'Ein Wert, auf den sich mehrere einigen, ist belastbarer als ein Einzelurteil. Große Abweichungen zeigen, wo ihr reden solltet.',
  h:'Der Eye-Test ist Teil des Scoutings und fließt mit 14 % in den MScore ein.',
  s:'Filter wählen, Spieler antippen und bewerten. 50 heißt solider Stammspieler in der Kreisliga A, 70 stark bis Gruppenliga, 90 Top der Region.',
  b:['Zwei Planer liegen 20 Punkte auseinander: gemeinsam noch einmal hinschauen.','Neuer Kandidat ohne deine Bewertung: beim nächsten Spiel gezielt ansehen.']};
function sv70EyeRows(){
  const me=SVB&&SVB.user&&SVB.user.id, s=sv4S();
  const ids=new Set([...SV4.eyeBy.keys()]);
  players.filter(p=>!p.isJugend&&(sv4Team(p)==='1'||(typeof crmOf==='function'&&(crmOf(p).s==='att'||crmOf(p).f))||SV4.bk.some(x=>x.player_id===p.id&&!['absage','verworfen'].includes(x.status)))).forEach(p=>ids.add(p.id));
  return [...ids].map(id=>{ const p=sv4P(id); if(!p||p.isJugend)return null; const E=sv4Eye(id), L=E?E.list:[];
    const tot=L.map(e=>({e,v:sv70EyeTotal(e,p.pos)})).filter(x=>x.v!=null);
    const avg=tot.length?tot.reduce((a,x)=>a+x.v,0)/tot.length:null, spread=tot.length>1?Math.max(...tot.map(x=>x.v))-Math.min(...tot.map(x=>x.v)):0;
    const mine=L.find(e=>e.rater===me&&e.saison===s)||null;
    return {p,E,n:tot.length,avg,spread,mine,mv:mine?sv70EyeTotal(mine,p.pos):null,own:sv4Team(p)==='1'};
  }).filter(Boolean);
}
function sv70Eye(){
  const P=document.getElementById('panel-eye'); if(!P)return;
  if(!sv4Can()){ P.innerHTML='<div class="card"><div class="empty">Eye-Tests sieht das Trainerteam.</div></div>'; return; }
  if(!SV4.loaded){ P.innerHTML='<div class="card"><div class="empty">Lade Eye-Tests …</div></div>'; if(!SV4.loading)sv4Load(); return; }
  const R=sv70EyeRows(), f=SV70.eyeF;
  const F={offen:x=>!x.mine,uneinig:x=>x.n>1&&x.spread>=15,eigen:x=>x.own,extern:x=>!x.own,alle:()=>true};
  const L=R.filter(F[f]||F.alle).sort((a,b)=>f==='uneinig'?b.spread-a.spread:(b.avg??-1)-(a.avg??-1)||a.p.name.localeCompare(b.p.name,'de'));
  const cnt=k=>R.filter(F[k]).length;
  // Wer bewertet wie? (strenger oder großzügiger als der Schnitt)
  const by=new Map(); R.forEach(x=>{ if(x.n<2||x.avg==null)return; x.E.list.forEach(e=>{ const v=sv70EyeTotal(e,x.p.pos); if(v==null)return; const o=by.get(e.rater)||{name:e.rater_name||'?',n:0,d:0}; o.n++; o.d+=v-x.avg; by.set(e.rater,o); }); });
  const raters=[...by.values()].filter(o=>o.n>=2).sort((a,b)=>b.n-a.n);
  P.innerHTML=`<div class="card ey70-top"><h3 class="trh">${SVI('eye')} Eye-Test <small>regionale Skala</small></h3>
      <div class="ey70-scale"><div class="ey70-bar"></div>${SV70_ANK.slice(0,3).map(a=>`<span style="left:${a[0]}%"><b>${a[0]}</b></span>`).join('')}</div>
      <div class="ey70-leg">${SV70_ANK.slice(0,3).reverse().map(a=>`<div><b>${a[0]}</b><span><i>${svEsc(a[1])}</i><small>${svEsc(a[2])}</small></span></div>`).join('')}</div>
      <div class="chips4">${[['offen','Deine Bewertung fehlt'],['uneinig','Uneinig'],['eigen','Eigene'],['extern','Externe'],['alle','Alle']].map(([k,t])=>`<button type="button" class="${f===k?'on':''}" data-eyf70="${k}">${t} <i>${cnt(k)}</i></button>`).join('')}</div></div>
    <div class="card"><div class="ey70-l">${L.slice(0,150).map(x=>{ const A=sv70Anker(x.avg);
      return `<button type="button" class="ey70-r" data-eyp="${svEsc(x.p.id)}"><span class="kr4-pos">${svEsc(x.p.pos||'–')}</span>
        <span class="ey70-n"><b>${svEsc(x.p.name)}</b><small>${svEsc((x.p.cur&&x.p.cur.club)||x.p.club||'')}${x.own?' · eigener Spieler':''}</small></span>
        <span class="ey70-v"><b style="color:${x.avg!=null?tierColor(x.avg):'var(--ink3)'}">${x.avg!=null?Math.round(x.avg):'–'}</b><small>${A&&x.avg!=null?svEsc(A[1]):'noch keine'}</small></span>
        <span class="ey70-m"><i>${x.n} Bewertung${x.n===1?'':'en'}</i>${x.n>1?`<i class="${x.spread>=15?'bad':''}">± ${Math.round(x.spread/2)}</i>`:''}<i class="${x.mine?'ok':'warn'}">${x.mine?'du: '+Math.round(x.mv):'du fehlst'}</i></span></button>`; }).join('')||'<p class="note">Niemand in dieser Auswahl.</p>'}</div></div>
    ${raters.length?`<div class="card"><h3 class="trh">Wer bewertet wie?</h3><div class="ey70-rt">${raters.map(o=>{ const d=o.d/o.n; return `<div><b>${svEsc(o.name)}</b><span>${o.n} Bewertungen</span><em class="${Math.abs(d)<4?'ok':'warn'}">${d>=0?'+':''}${sv4Num(d,1)} ggü. Schnitt</em></div>`; }).join('')}</div>
      <p class="note small">Positiv heißt großzügiger als die anderen, negativ strenger. Hilft, die Skala gemeinsam gleich zu benutzen.</p></div>`:''}`;
  P.querySelectorAll('[data-eyf70]').forEach(b=>b.onclick=()=>{ SV70.eyeF=b.dataset.eyf70; sv70Eye(); });
  P.querySelectorAll('[data-eyp]').forEach(b=>b.onclick=()=>{ try{ PF4.eyeOpen=true; }catch(e){} openModal(b.dataset.eyp); setTimeout(()=>{ const M=document.getElementById('modal'), bt=M&&M.querySelector('[data-pf4="eye"]'); const box=M&&M.querySelector('.ey4'); if(bt&&!box)bt.click(); const e2=M&&M.querySelector('.ey4'); if(e2)e2.scrollIntoView({behavior:'smooth',block:'nearest'}); },120); });
}
{ const _gt70=goTab; goTab=function(tab){ const r=_gt70.apply(this,arguments); try{ if(svCurTab()==='eye')sv70Eye(); }catch(e){ console.warn('Eye-Test',e); } return r; }; }
{ const _af70=sv4After; sv4After=function(){ const r=_af70.apply(this,arguments); try{ if(svCurTab()==='eye')sv70Eye(); }catch(e){} return r; }; }

/* ---------- Spielermarkt: mehr Filter ---------- */
{ const _vis70=visible; visible=function(){ let L=_vis70.apply(this,arguments); const f=SV70.f;
  if(f.fuss)L=L.filter(p=>(p.fuss||'')===f.fuss||(f.fuss==='Links'&&p.fuss==='Beidfüßig'));
  if(f.stamm)L=L.filter(p=>{ try{ const q=scores(p).q; return q!=null&&q>=0.6; }catch(e){ return false; } });
  if(f.min)L=L.filter(p=>{ try{ return scores(p).total>=f.min; }catch(e){ return false; } });
  if(f.basis)L=L.filter(p=>{ try{ return scores(p).basis>=50; }catch(e){ return false; } });
  return L; }; }
function sv70MarktFilter(){
  const bar=document.querySelector('#panel-scout .fbar'); if(!bar||bar.querySelector('.f70'))return;
  const f=SV70.f, row=document.createElement('div'); row.className='frow f70';
  row.innerHTML=`<span class="lbl">Fuß</span><select id="f70fuss"><option value="">egal</option><option value="Links"${f.fuss==='Links'?' selected':''}>Links</option><option value="Rechts"${f.fuss==='Rechts'?' selected':''}>Rechts</option></select>
    <span class="chip${f.stamm?' on':''}" data-f70="stamm" title="Mindestens 60 % der Spiele">Stammspieler</span>
    <span class="chip${f.basis?' on':''}" data-f70="basis" title="MScore beruht zu mindestens 50 % auf echten Daten">Gute Datenbasis</span>
    <span class="lbl">MScore ab</span><input class="numin" id="f70min" type="number" min="0" max="100" placeholder="0" value="${f.min||''}">`;
  bar.appendChild(row);
  row.querySelector('#f70fuss').onchange=e=>{ f.fuss=e.target.value; renderList(); };
  row.querySelector('#f70min').oninput=e=>{ f.min=+e.target.value||0; renderList(); };
  row.querySelectorAll('[data-f70]').forEach(c=>c.onclick=()=>{ const k=c.dataset.f70; f[k]=!f[k]; c.classList.toggle('on',f[k]); renderList(); });
}
{ const _gt70b=goTab; goTab=function(tab){ const r=_gt70b.apply(this,arguments); try{ if(svCurTab()==='scout')sv70MarktFilter(); }catch(e){} return r; }; }
setTimeout(()=>{ try{ sv70MarktFilter(); }catch(e){} },1500);
document.addEventListener('click',e=>{ const b=e.target.closest&&e.target.closest('[data-preset="reset"]'); if(!b)return; Object.assign(SV70.f,{fuss:'',stamm:false,min:0,basis:false}); const r=document.querySelector('.f70'); if(r){ r.remove(); sv70MarktFilter(); } },true);

/* ---------- KI-Auftrag: Filter wie im Spielermarkt ---------- */
{ const _jn70=sc2JobNew; sc2JobNew=function(pre){
  const r=_jn70.apply(this,arguments);
  const hook=()=>{ const F=document.getElementById('sc2Form'), go=document.getElementById('sc2Go'); if(!F||!go||!F.querySelector('#sc2Pos')||F.querySelector('.kf70'))return;
    const P=(pre&&pre.profil)||{};
    go.closest('.btnrow').insertAdjacentHTML('beforebegin',`<div class="kf70 editgrid">
      <div class="field"><label>Alter von–bis</label><div class="two4"><input type="number" id="kf70a1" min="15" max="45" placeholder="18" value="${P.alter_von??''}"><input type="number" id="kf70a2" min="15" max="45" placeholder="30" value="${P.alter_bis??''}"></div></div>
      <div class="field"><label>Starker Fuß</label><select id="kf70fu"><option value="">egal</option><option${P.fuss==='Links'?' selected':''}>Links</option><option${P.fuss==='Rechts'?' selected':''}>Rechts</option></select></div>
      <div class="field"><label>Mindest-Liga</label><select id="kf70l"><option value="">egal</option>${[['GL','Gruppenliga'],['KOL','Kreisoberliga'],['A','Kreisliga A'],['B','Kreisliga B']].map(([k,t])=>`<option value="${k}"${P.liga_min===k?' selected':''}>${t}</option>`).join('')}</select></div>
      <div class="field"><label>Max. Entfernung (km)</label><input type="number" id="kf70k" min="0" max="200" placeholder="25" value="${P.km_max??''}"></div>
      <div class="field w"><label class="jutog"><input type="checkbox" id="kf70s"> Nur Stammspieler (mindestens 60 % der Spiele)</label></div></div>`);
    const old=go.onclick; go.onclick=async ev=>{ const v=id=>{ const x=document.getElementById(id); return x?String(x.value||'').trim():''; };
      const parts=[v('kf70a1')||v('kf70a2')?`Alter ${v('kf70a1')||'?'} bis ${v('kf70a2')||'?'}`:'',v('kf70fu')?'starker Fuß '+v('kf70fu'):'',v('kf70l')?'mindestens '+(LIGA_NAME[v('kf70l')]||v('kf70l')):'',v('kf70k')?'höchstens '+v('kf70k')+' km entfernt':'',document.getElementById('kf70s')&&document.getElementById('kf70s').checked?'nur Stammspieler':''].filter(Boolean);
      const fr=document.getElementById('sc2Fr'); if(fr&&parts.length){ fr.value=((fr.value?fr.value+'. ':'')+'Filter: '+parts.join(', ')).slice(0,300); }
      return old.call(go,ev); }; };
  hook(); document.querySelectorAll('#sc2Art [data-a]').forEach(b=>b.addEventListener('click',()=>setTimeout(hook,0)));
  return r; }; }

/* ---------- Elf der Woche: Tore vorne, Abwehr und Torwart hinten ---------- */
const sv70K=s=>String(s||'').toLowerCase().replace(/ä/g,'ae').replace(/ö/g,'oe').replace(/ü/g,'ue').replace(/ß/g,'ss').replace(/[^a-z0-9]/g,'');
function sv70Abwehr(sub,mode,win){
  const tabs=SP.tabs.filter(r=>r.sub===sub); const L=[...new Set(tabs.map(r=>r.stand))].sort(); if(!L.length)return [];
  if(mode==='tag'&&win){ const a=new Map(tabs.filter(r=>r.stand===win[0]).map(r=>[r.club_key,r]));
    return tabs.filter(r=>r.stand===win[1]).map(r=>{ const o=a.get(r.club_key); if(!o||r.spiele<=o.spiele)return null; return {club:r.club,key:r.club_key,ga:r.gegentore-o.gegentore,sp:r.spiele-o.spiele,ges:r.gegentore/Math.max(1,r.spiele)}; }).filter(Boolean).sort((x,y)=>x.ga/x.sp-y.ga/y.sp||x.ges-y.ges); }
  return tabs.filter(r=>r.stand===L[L.length-1]&&r.spiele>=3).map(r=>({club:r.club,key:r.club_key,ga:r.gegentore,sp:r.spiele,ges:r.gegentore/r.spiele})).sort((x,y)=>x.ges-y.ges);
}
function sv70ClubPlayers(key){ return players.filter(p=>!p.isJugend&&(sv70K((p.cur&&p.cur.club)||p.club)===key||sv70K(p.club)===key)); }
twRender=async function(){
  const P=document.getElementById('panel-totw'); if(!P)return;
  if(!canScout()){ P.innerHTML='<div class="card"><div class="empty">Die Elf der Woche sieht das Trainerteam.</div></div>'; return; }
  if(!SP.loaded){ P.innerHTML='<div class="card"><div class="empty">Lade Torjägerlisten …</div></div>'; spLoad(); return; }
  const sub=SP.tw.sub; const S=await spSnaps(sub); const st=[...new Set(S.map(r=>r.stand))].sort();
  let mode=SP.tw.mode, win=null, cand=[];
  const byPid=r=>trP(r.player_id||r.pkey);
  if(mode==='tag'&&st.length>=2){
    for(let i=st.length-1;i>0&&!cand.length;i--){ const A=new Map(S.filter(r=>r.stand===st[i-1]).map(r=>[r.pkey,r.tore]));
      cand=S.filter(r=>r.stand===st[i]).map(r=>({r,g:r.tore-(A.get(r.pkey)??0),known:A.has(r.pkey)})).filter(x=>x.g>0&&(x.known||x.r.tore<=3)); if(cand.length)win=[st[i-1],st[i]]; }
  }
  if(!cand.length){ mode='saison'; const L=st[st.length-1]; cand=S.filter(r=>r.stand===L&&r.tore>0).map(r=>({r,g:r.tore})); }
  cand=cand.map(x=>({...x,p:byPid(x.r)})).filter(x=>x.p).map(x=>({...x,sc:mode==='tag'?x.g*10+(x.r.team_sp?x.r.tore/x.r.team_sp:0):x.r.tore/Math.max(1,x.r.team_sp||1)*4+x.r.tore*0.3})).sort((a,b)=>b.sc-a.sc);
  const used=new Set(), slots=TW_SLOTS.map(()=>null);
  // Vorne: Torschützen nach Position
  TW_SLOTS.forEach((s,i)=>{ const g=TW_GRP[s[0]]; if(g==='TW'||g==='DEF')return; const x=cand.find(c=>!used.has(c.p.id)&&twGroup(c.p)===g); if(x){ slots[i]=x; used.add(x.p.id); } });
  TW_SLOTS.forEach((s,i)=>{ const g=TW_GRP[s[0]]; if(slots[i]||g==='TW'||g==='DEF')return; const x=cand.find(c=>!used.has(c.p.id)&&twGroup(c.p)!=='DEF'&&twGroup(c.p)!=='TW'); if(x){ slots[i]=x; used.add(x.p.id); } });
  // Hinten: die Mannschaften mit den wenigsten Gegentoren
  const D=SP_LIGA[sub]&&!sub.startsWith('AJ')?sv70Abwehr(sub,mode,win):[];
  const defTxt=d=>mode==='tag'?(d.ga===0?'Zu Null':d.ga+' Gegentor'+(d.ga>1?'e':'')):`${spNum(d.ges)} Gegentore/Spiel`;
  const clubCards=[]; let di=0;
  const takeClubPlayer=(want)=>{ for(const d of D.slice(0,4)){ const L=sv70ClubPlayers(d.key).filter(p=>!used.has(p.id)&&(want==='TW'?p.pos==='TW':want==='AV'?p.pos==='AV':want==='IV'?p.pos==='IV':['IV','AV'].includes(p.pos))).sort((a,b)=>scores(b).total-scores(a).total); if(L.length)return {p:L[0],d}; } return null; };
  TW_SLOTS.forEach((s,i)=>{ if(TW_GRP[s[0]]!=='DEF')return; const want=s[0]==='IV'?'IV':'AV'; const hit=takeClubPlayer(want)||takeClubPlayer('DEF');
    if(hit){ slots[i]={p:hit.p,def:hit.d}; used.add(hit.p.id); return; }
    const x=cand.find(c=>!used.has(c.p.id)&&twGroup(c.p)==='DEF'); if(x){ slots[i]=x; used.add(x.p.id); return; }
    const d=D[di++]; if(d){ slots[i]={club:d}; return; }
    const y=cand.find(c=>!used.has(c.p.id)); if(y){ slots[i]=y; used.add(y.p.id); } });   // ohne Tabellen (z. B. A-Jugend): mit Torschützen auffüllen
  let keeper=null; const kp=takeClubPlayer('TW');
  if(kp){ keeper={p:kp.p,d:kp.d}; used.add(kp.p.id); } else if(D[0])keeper={club:D[0]};
  const motm=cand[0];
  const seenKey='svbc-totw-'+sub+'-'+(win?win[1]:'s'); let fresh=false; try{ fresh=!localStorage.getItem(seenKey); localStorage.setItem(seenKey,'1'); }catch(e){}
  const subs=['A','KOL','B','C','D1','D2','GL','AJ-BS','AJ-GL','AJ-VL'];
  const clubCard=(d,role)=>`<div class="fut xs totw keeper fut-noflip"><div class="fut-in"><div class="fut-f"><div class="fut-sh"></div><div class="fut-ov"><b>${role==='TW'?'🧤':'🧱'}</b><span>${svEsc(role)}</span></div><div class="fut-pic kp">${scCrest(d.club,'xl')}</div><div class="fut-nm"><b>${svEsc(d.club)}</b><i>${svEsc(defTxt(d))}</i></div></div></div></div>`;
  const card=(x,i,role)=>{ if(!x)return `<div class="fut xs empty"><div class="fut-in"><div class="fut-f"><em>${role}</em></div></div></div>`;
    if(x.club)return clubCard(x.club,role);
    if(x.def)return fcCard(x.p,{size:'xs',tier:'totw',badge:'🧱 '+defTxt(x.def),sub:role,anim:fresh,delay:i*110});
    return fcCard(x.p,{size:'xs',tier:x===motm?'motm':'totw',badge:mode==='tag'?`⚽ ${x.g}`:`${x.r.tore} T`,sub:role,anim:fresh,delay:i*110}); };
  const keeperHtml=keeper?(keeper.p?fcCard(keeper.p,{size:'xs',tier:'totw',badge:'🧤 '+defTxt(keeper.d),sub:'TW',anim:fresh}):clubCard(keeper.club,'TW')):card(null,0,'TW');
  const rest=cand.filter(c=>!used.has(c.p.id)).slice(0,24);
  const ownIn=cand.filter(c=>c.p.own);
  P.innerHTML=`<div class="trtop"><div class="trtabs twsubs">${subs.map(s=>`<button class="${sub===s?'on':''}" data-twsub="${s}">${svEsc(SP_LIGA[s]||s)}</button>`).join('')}</div>
      <div class="trtabs"><button class="${SP.tw.mode==='tag'?'on':''}" data-twm="tag">Spieltag</button><button class="${SP.tw.mode==='saison'?'on':''}" data-twm="saison">Saison</button></div></div>
    <div class="card twcard"><div class="svc-h"><h3>${SVI('star')} ${mode==='tag'?'Elf der Woche':'Elf der Saison'} · ${svEsc(SP_LIGA[sub]||sub)}</h3><small class="note">${mode==='tag'&&win?`Spiele zwischen ${TRC.fmt(win[0])} und ${TRC.fmt(win[1])}`:SP.tw.mode==='tag'?'Für den Spieltag braucht es zwei Daten-Stände, bis dahin die Saison-Elf':'Nach Toren pro Spiel und Gegentoren'}</small></div>
      ${cand.length||D.length?`<div class="twpitch"><div class="twlines"></div>${TW_SLOTS.map((s,i)=>`<div class="twslot" style="left:${s[1]}%;top:${s[2]}%">${s[0]==='TW'?keeperHtml:card(slots[i],i,s[0])}</div>`).join('')}</div>`
        :'<div class="empty">Noch keine Daten in dieser Liga.</div>'}
      ${motm?`<div class="twmotm">${SVI('star')} <b>Spieler des ${mode==='tag'?'Spieltags':'Saison'}:</b> <a data-svp="${svEsc(motm.p.id)}">${svEsc(motm.p.name)}</a> (${svEsc(motm.r.club||'')}) · ${mode==='tag'?motm.g+' Tor'+(motm.g>1?'e':''):motm.r.tore+' Tore in '+(motm.r.team_sp||'?')+' Spielen'}</div>`:''}
      ${D.length?`<div class="note tw70">🧱 Beste Abwehr: ${D.slice(0,3).map(d=>`${svEsc(d.club)} (${svEsc(defTxt(d))})`).join(' · ')}</div>`:''}
      ${ownIn.length?`<div class="note">🟢 Von uns dabei: ${ownIn.map(c=>`<a data-svp="${svEsc(c.p.id)}">${svEsc(c.p.name)}</a> (${mode==='tag'?c.g:c.r.tore})`).join(', ')}</div>`:''}
    </div>
    ${rest.length?`<div class="card"><h3 class="trh">Weitere Torschützen</h3><div class="twrest">${rest.map(c=>`<button class="twr" data-svp="${svEsc(c.p.id)}">${avaHtml(c.p)}<b>${svEsc(c.p.name)}</b><span>${svEsc(c.r.club||'')}</span><em>${mode==='tag'?'⚽ '+c.g:c.r.tore+' T'}</em></button>`).join('')}</div></div>`:''}
    <div class="note">Vorne die Torschützen aus den Torjägerlisten von FUSSBALL.DE, hinten Abwehr und Torwart der Mannschaften mit den wenigsten Gegentoren. Wo die Position eines Spielers nicht bekannt ist, steht die Mannschaft.</div>`;
  P.querySelectorAll('[data-twsub]').forEach(b=>b.onclick=()=>{ SP.tw.sub=b.dataset.twsub; twRender(); });
  P.querySelectorAll('[data-twm]').forEach(b=>b.onclick=()=>{ SP.tw.mode=b.dataset.twm; twRender(); });
  P.querySelectorAll('[data-svp]').forEach(a=>a.onclick=()=>openModal(a.dataset.svp));
};

/* =====================================================================
   Sportzentrale Beta 0.6 · Stufe 4: Erzählen statt tippen
   - Spielergespräche per Co-Trainer: „Mit Tim gesprochen, er will bleiben, möchte mehr Spielzeit“
   - Verletzungen: prominent „Dem Co-Trainer erzählen“
   - (Der FuPa-Abgleich beim erneuten Import steckt in sv50.js)
   ===================================================================== */
const SV80_ART={offiziell:'Offizielles Gespräch',kurz:'Kurzes Gespräch',telefon:'Telefonat',verhandlung:'Verhandlung'};
const SV80_Z={bleibt:'will bleiben',unsicher:'unsicher',geht:'will gehen',karriereende:'Karriereende',offen:'offen'};
function sv80Tell(text){
  closeOverlay(); trChatOpen();
  setTimeout(()=>{ const ta=document.getElementById('trcTxt'); if(ta&&!ta.value){ ta.value=text; ta.focus(); ta.setSelectionRange(ta.value.length,ta.value.length); ta.dispatchEvent(new Event('input')); } },260);
}
{ const _as80=trActSummary; trActSummary=function(a){
  if(a.type!=='gespraech')return _as80.apply(this,arguments);
  const i=a.input||{}, nx=typeof sv4SAdd==='function'?sv4SAdd(sv4S(),1):'';
  return `<b>💬 Gespräch mit ${svEsc(trName(i.player_id))} · ${TRC.fmt(i.datum||trToday())}</b>
    <div>${svEsc(SV80_ART[i.art]||SV80_ART.offiziell)}${i.zukunft?` · <em class="${i.zukunft==='bleibt'?'':'bad'}">${svEsc(SV80_Z[i.zukunft]||i.zukunft)}</em>`:''}</div>
    ${i.sicht?`<div>Seine Sicht: ${svEsc(i.sicht)}</div>`:''}${i.themen?`<div>Offen: ${svEsc(i.themen)}</div>`:''}${i.entscheidung?`<div>Entscheidung: ${svEsc(i.entscheidung)}</div>`:''}${i.naechstes_am?`<div>Nächstes Gespräch: ${TRC.fmt(i.naechstes_am)}</div>`:''}
    ${i.zukunft&&i.zukunft!=='offen'&&nx?`<label class="trc-rest"><input type="checkbox" data-rest checked> Zukunft im Kaderplan ${sv4SL(nx)} übernehmen</label>`:''}`;
}; }
{ const _ex80=trExec; trExec=async function(a,rest){
  if(a.type!=='gespraech')return _ex80.apply(this,arguments);
  const i=a.input||{}; if(!i.player_id||!trP(i.player_id))throw new Error('Spieler unbekannt');
  const row={player_id:i.player_id,datum:i.datum||trToday(),art:SV80_ART[i.art]?i.art:'offiziell',wer:SVU.name||null,zukunft:SV80_Z[i.zukunft]?i.zukunft:null,
    sicht:i.sicht?String(i.sicht).slice(0,1500):null,themen:i.themen?String(i.themen).slice(0,1500):null,entscheidung:i.entscheidung?String(i.entscheidung).slice(0,600):null,naechstes_am:i.naechstes_am||null};
  const {data,error}=await SVB.sb.from('gespraeche').insert(row).select().single(); if(error)throw new Error(error.message);
  if(typeof SV4!=='undefined'){ SV4.gs=[data].concat(SV4.gs||[]).sort((x,y)=>y.datum.localeCompare(x.datum)); try{ sv4Bump(); }catch(e){} }
  if(rest&&row.zukunft&&row.zukunft!=='offen'&&typeof sv4SSSet==='function'){ const p=trP(i.player_id), nx=sv4SAdd(sv4S(),1);
    await sv4SSSet(i.player_id,nx,{zukunft:row.zukunft,team:row.zukunft==='geht'||row.zukunft==='karriereende'?null:(sv4Team(p,nx)||sv4Team(p)),sicherheit:'zusage'}); }
  try{ if(svCurTab()==='gespr')kd4Gespr(); if(svCurTab()==='kader')kd4Render(); }catch(e){}
  return 'Gespräch mit '+trShort(i.player_id)+' festgehalten';
}; }

/* ---------- Gespräche: erzählen statt Formular ---------- */
{ const _g80=kd4Gespr; kd4Gespr=function(){
  const r=_g80.apply(this,arguments);
  try{ const P=document.getElementById('panel-gespr'); if(!P||P.querySelector('.hero50')||!P.querySelector('.gl4'))return r;
    const h=document.createElement('div'); h.className='card hero50';
    h.innerHTML=`<div class="hero50-t"><h3>Gespräch festhalten</h3><p>Erzähl dem Co-Trainer kurz, was besprochen wurde. Er hält Zukunft, Sicht des Spielers und offene Themen fest und trägt auf Wunsch die Zukunft in den Kaderplan ein.</p></div>
      <div class="btnrow"><button type="button" class="btn" data-tell80>🎙️ Dem Co-Trainer erzählen</button></div>`;
    P.prepend(h); h.querySelector('[data-tell80]').onclick=()=>sv80Tell('Gespräch mit ');
  }catch(e){ console.warn('Gespräche 0.6',e); }
  return r; }; }

/* ---------- Verletzungen: erzählen ---------- */
{ const _vi80=trViewInjuries; trViewInjuries=function(B){
  const r=_vi80.apply(this,arguments);
  try{ const h=document.createElement('div'); h.className='card hero50';
    h.innerHTML=`<div class="hero50-t"><h3>Verletzung melden</h3><p>Sag dem Co-Trainer, wer sich was getan hat und was der Arzt sagt. Er fragt nach, wenn Diagnose oder Prognose fehlen.</p></div>
      <div class="btnrow"><button type="button" class="btn" data-tell80i>🎙️ Dem Co-Trainer erzählen</button><button type="button" class="btn ghost" data-inj80>${SVI('plus')} Selbst eintragen</button></div>`;
    B.prepend(h);
    h.querySelector('[data-tell80i]').onclick=()=>sv80Tell('Verletzung: ');
    h.querySelector('[data-inj80]').onclick=()=>trInjuryEditor(null);
  }catch(e){ console.warn('Verletzungen 0.6',e); }
  return r; }; }

/* ---------- Vorschläge im Co-Trainer ---------- */
{ const _cm80=trChatMode; trChatMode=function(){ const r=_cm80.apply(this,arguments);
  try{ const sug=document.getElementById('trcSug'); if(sug&&TR.ai&&TR.ai.ready&&!sug.querySelector('[data-g80]')){
    sug.insertAdjacentHTML('afterbegin','<button type="button" data-g80>Gespräch mit …</button>');
    sug.querySelector('[data-g80]').onclick=()=>{ const ta=document.getElementById('trcTxt'); ta.value='Gespräch mit '; ta.focus(); }; } }catch(e){}
  return r; }; }

/* =====================================================================
   Sportzentrale Beta 0.7 · Lukas' Liste vollständig
   - Änderungsverlauf (wer hat wann was geändert) bei Spielen und in der Kaderplanung
   - Spielerliste: Ansicht „Scouting“, Spalten Mannschaft (Primär und Sekundär) und Eye-Test
   - Spiele: Hinweis zum erneuten FuPa-Abgleich, Noten im Spiel-Detail
   - Eye-Test: Vergleich je Kategorie (Höchster, Niedrigster, Schnitt, direkt eintragen), Review fällig, Einzelwerte eingeklappt
   - Kader: Verfügbarkeit je Zeitraum, Sekundärspieler ausgegraut, Reserve, freie Plätze als Zeilen, offener Platz,
     Stand der Planung (Annahme, Planung, Gespräch, Zusage), Trainer-Anforderungen, Backup mit Zweiter und Jugend
   - Traumelf je Zeitraum (Rückrunde, nächste, übernächste Saison)
   - MScore: Historie in „Einsatz & Liga“, Vorlagen als Zusatz, Form für Abwehr und Torwart, Begründung je Baustein
   - Vereinstreue in fünf Stufen, als Abzeichen auf der Karte
   ===================================================================== */
// Wer bin ich? Einige Stellen fragen SVB.user.id (eigene Eye-Tests, eigene Bewertung vorbefüllen). Das Profil kennt die ID.
try{ if(typeof SVB!=='undefined'&&SVB&&!('user' in SVB))Object.defineProperty(SVB,'user',{configurable:true,get(){ const p=SVB.profile||window.__SVBC_USER; return p&&p.id?{id:p.id}:null; }}); }catch(e){}
const SV90={eyeMode:'liste',eyeCat:'tem',eyeScope:'alle',traum:{team:'1',s:null},wBusy:false};

/* ---------- Erklärkästen: fehlende Ansichten, Elf der Woche klarer ---------- */
if(typeof SV50_INFO!=='undefined'){
  Object.assign(SV50_INFO,{
    kasse:{w:'Strafen, Beiträge und der Kassenstand der Mannschaft.',f:'Jeder sieht, was offen ist, und du musst niemandem hinterherlaufen.',
      h:'Die Kasse gehört zum Spieltag, nicht zur sportlichen Planung. Deshalb steht sie weiter unten.',s:'Buchung anlegen oder Strafe aus dem Katalog wählen. Spieler melden „bezahlt“ über ihren Link.',
      b:['Nach dem Spiel die Strafen für Gelb-Rot und Zuspätkommen eintragen.']},
    play:{w:'Das Playbook: Abläufe, Regeln und Standards des Trainerteams.',f:'Neue im Team finden schnell, wie es bei uns läuft.',
      h:'Wissen, das nicht an eine Saison gebunden ist, steht gesammelt hier.',s:'Abschnitt antippen zum Lesen.',b:[]},
    model:{w:'Wie der MScore entsteht: jeder Baustein, sein Gewicht und warum er eigenständig ist.',f:'Nachvollziehen, warum ein Spieler vorne oder hinten liegt.',
      h:'Die Rechenregeln gelten für Mannschaft, Kader und Scouting gleich, deshalb stehen sie einmal zentral.',s:'Gewichte unten einstellen. Die Änderung wirkt sofort in allen Listen.',
      b:['Mehr Gewicht auf den Eye-Test, wenn ihr viele Spieler selbst gesehen habt.']}});
  SV50_INFO.totw={w:'Die Spieler eines Spieltags, die in der Region herausstechen. Vorne nach Toren, hinten nach Gegentoren.',
    f:'Formstarke Spieler entdecken, die in keiner Liste auffallen, auch Abwehrspieler und Torhüter.',
    h:'Es geht um fremde Spieler, deshalb steht die Elf der Woche im Scouting.',
    s:'Sturm und Mittelfeld kommen aus den Torjägerlisten des Spieltags. Abwehr und Torwart kommen aus den Mannschaften, die am wenigsten Gegentore bekommen haben. Vorlagen fehlen in den Torjägerlisten, deshalb zählen hier nur Tore.',
    b:['Wer zweimal hintereinander drin ist, lohnt einen zweiten Blick.','Ein Innenverteidiger aus der Mannschaft mit drei Spielen zu null: im Eye-Test ansehen.']};
  if(SV50_INFO.eye){ SV50_INFO.eye.h='Der Eye-Test ist Teil des Scoutings und fließt als eigener Baustein in den MScore ein.';
    SV50_INFO.eye.s='Unter „Spieler“ filtern, antippen und bewerten. Unter „Je Kategorie“ alle Spieler einer Kategorie untereinander sehen und mit dem Regler direkt eintragen. 50 heißt solider Stammspieler in der Kreisliga A, 70 stark bis Gruppenliga, 90 Top der Region.';
    SV50_INFO.eye.b=['Zwei Planer liegen 20 Punkte auseinander: gemeinsam noch einmal hinschauen.','Einmal im Halbjahr den Filter „Review fällig“ durchgehen, damit alle die Skala gleich benutzen.']; }
  if(SV50_INFO.kader)SV50_INFO.kader.s='Oben den Zeitraum wählen (Rückrunde, nächste oder übernächste Saison), Spieler antippen und Zukunft, Sicherheit und Verfügbarkeit festlegen. Leere Plätze zeigen, wo etwas fehlt.';
  if(SV50_INFO.sxi){ SV50_INFO.sxi.s='Zeitraum und Formation wählen, dann einen Platz antippen und irgendeinen Spieler setzen, eigene wie fremde.'; SV50_INFO.sxi.b=['Für die nächste Saison einen Wunsch-Sechser eintragen und mit dem Kaderplan vergleichen.','Kommt ein Wunschspieler ins Gespräch, direkt von hier ein Gespräch festhalten.']; }
}

/* ---------- Änderungsverlauf ---------- */
const SV90_FELD={status:'Status',grund:'Grund',note:'Note',minuten:'Minuten',tore:'Tore',vorlagen:'Vorlagen',notiz:'Notiz',datum:'Datum',gegner:'Gegner',heim:'Heimspiel',
  tore_wir:'Tore',tore_gegner:'Gegentore',daten_status:'Datenstatus',quelle:'Quelle',team:'Mannschaft',team2:'Auch in',zukunft:'Zukunft',sicherheit:'Sicherheit',pos:'Position',
  inaktiv:'Inaktiv',verfuegbar:'Verfügbarkeit',verf_grund:'Grund',rolle:'Rolle'};
function sv90Wert(f,v){
  if(v==null||v==='')return '–';
  try{
    if(f==='status')return ({da:'da',spaet:'spät / eingewechselt',weg:'fehlt',bank:'im Kader',zuschauer:'zugeschaut'})[v]||v;
    if(f==='daten_status'&&typeof SV50_DS!=='undefined'&&SV50_DS[v])return SV50_DS[v][0];
    if(f==='quelle'&&typeof SV50_Q!=='undefined'&&SV50_Q[v])return SV50_Q[v];
    if(f==='zukunft'&&SV4_ZUK[v])return SV4_ZUK[v][0];
    if(f==='sicherheit'&&typeof SV60_SI!=='undefined'&&SV60_SI[v])return SV60_SI[v][0];
    if((f==='team'||f==='team2')&&SV4_TEAM[v])return SV4_TEAM[v];
    if(f==='verfuegbar')return ({eingeschraenkt:'eingeschränkt',nein:'nicht verfügbar'})[v]||v;
    if(f==='heim')return v==='true'?'ja':'nein';
    if(f==='datum')return sv4D(v);
    if(f==='grund'&&typeof TRC!=='undefined'&&TRC.REASONS&&TRC.REASONS[v])return TRC.REASONS[v];
  }catch(e){}
  return String(v);
}
async function sv90Verlauf(q){
  const {data,error}=await q(SVB.sb.from('aenderungen').select('at,tabelle,player_id,feld,alt,neu,quelle,wer_name')).order('at',{ascending:false}).limit(120);
  if(error)throw new Error(error.message); return data||[];
}
function sv90VerlaufHtml(L,mitSpieler){
  if(!L.length)return '<p class="note small">Noch keine Änderungen. Die erste Erfassung zählt nicht als Änderung.</p>';
  return `<div class="vl90">${L.map(r=>`<div class="vl90-r"><span class="vl90-d">${sv4D(r.at)} ${String(r.at).slice(11,16)}</span>
    <span class="vl90-t">${mitSpieler&&r.player_id?`<b>${svEsc(typeof trName==='function'?trName(r.player_id):r.player_id)}</b> · `:''}${svEsc(SV90_FELD[r.feld]||r.feld)}: <s>${svEsc(sv90Wert(r.feld,r.alt))}</s> → <b>${svEsc(sv90Wert(r.feld,r.neu))}</b></span>
    <span class="vl90-w">${svEsc(r.wer_name||'System')}${r.quelle?' · '+svEsc((typeof SV50_Q!=='undefined'&&SV50_Q[r.quelle])||r.quelle):''}</span></div>`).join('')}</div>`;
}
function sv90VerlaufBox(host,q,mitSpieler){
  const d=document.createElement('details'); d.className='vl90-box'; d.innerHTML='<summary>🕘 Änderungsverlauf</summary><div class="vl90-b"><p class="note small">Lade …</p></div>';
  host.appendChild(d);
  d.addEventListener('toggle',async()=>{ if(!d.open||d.dataset.done)return; d.dataset.done=1; const B=d.querySelector('.vl90-b');
    try{ B.innerHTML=sv90VerlaufHtml(await sv90Verlauf(q),mitSpieler); }catch(e){ B.innerHTML=`<p class="note small bad">${svEsc(e.message)}</p>`; } });
  return d;
}

/* ---------- Spielerliste: Ansicht „Scouting“, Mannschaft und Eye-Test als Spalten ---------- */
function sv90Teams(p){
  const s=typeof sv4S==='function'?sv4S():null; let t1=null,t2=null;
  try{ if(typeof SV4!=='undefined'&&SV4.loaded){ t1=sv4Team(p,s); t2=typeof sv60Team2==='function'?sv60Team2(p,s):null; } }catch(e){}
  if(!t1)t1=p.kader===2||/ II$/.test(p.club||'')?'2':'1';
  let fx=null; try{ fx=typeof sv60Fakt==='function'?sv60Fakt(p):null; }catch(e){}
  return {t1,t2,fx};
}
if(typeof SV50_COLS!=='undefined'){
  const R={'1':'I','2':'II',A:'A',B:'B'};
  SV50_COLS.team={t:'Mannschaft',v:p=>{ const T=sv90Teams(p); return (T.t1||'9')+(T.t2||''); },
    h:p=>{ const T=sv90Teams(p); return `<b>${R[T.t1]||'–'}</b>${T.t2?` <small class="sek90" title="Sekundärmannschaft">auch ${R[T.t2]||T.t2}</small>`:''}${T.fx&&!T.fx.beide&&T.fx.team!==T.t1?` <small class="warn" title="Einsätze: Erste ${T.fx.a1}, Zweite ${T.fx.a2}">spielt ${R[T.fx.team]}</small>`:''}`; }};
  SV50_COLS.eye={t:'Eye-Test',v:p=>{ try{ const e=sv4EyeVal(p.id,p.pos); return e?-e.v:1; }catch(x){ return 1; } },
    h:p=>{ try{ const e=sv4EyeVal(p.id,p.pos); return e?`<b style="color:${tierColor(e.v)}">${Math.round(e.v)}</b> <small>${e.E.n}×</small>`:'<i class="miss50">fehlt</i>'; }catch(x){ return '–'; } }};
  if(typeof SV50_PRESETS!=='undefined'){
    SV50_PRESETS.scouting={t:'Scouting',cols:['pos','team','alter','fuss','mscore','eye','basis','zuk']};
    if(SV50_PRESETS.planung&&!SV50_PRESETS.planung.cols.includes('team'))SV50_PRESETS.planung.cols.splice(1,0,'team');
    const o={}; ['trainer','planung','scouting','kontakte','tw'].forEach(k=>{ if(SV50_PRESETS[k])o[k]=SV50_PRESETS[k]; });
    Object.keys(SV50_PRESETS).forEach(k=>delete SV50_PRESETS[k]); Object.assign(SV50_PRESETS,o);
  }
}

/* ---------- Spiele: erneut abgleichen, Noten, Verlauf ---------- */
{ const _vg90=trViewGames; trViewGames=function(B){
  const r=_vg90.apply(this,arguments);
  try{ const c=B.querySelector('.gm50'); if(!c||c.querySelector('.rs90'))return r;
    const lim=TRC.addDays(trToday(),-14), L=TR.st.sessions.filter(s=>s.t==='spiel'&&s.d>=lim&&s.d<=trToday()&&(s.ds==='vorlaeufig'||!s.ds)&&s.q==='fupa');
    if(L.length){ const h=document.createElement('div'); h.className='q50-info rs90';
      h.innerHTML=`🔁 <b>${L.length} Spiel${L.length>1?'e':''} noch vorläufig</b> (${L.map(s=>TRC.fmt(s.d)).join(', ')}). FuPa wird oft erst ein paar Tage nach dem Spiel vollständig gepflegt. Lade die Datei dann noch einmal hoch: die App zeigt nur, was sich geändert hat, und fragt bei Widersprüchen nach. <button type="button" class="lk4" data-rs90>Jetzt abgleichen</button>`;
      const l=c.querySelector('.gm50-l'); if(l)l.before(h); else c.appendChild(h);
      h.querySelector('[data-rs90]').onclick=()=>sv50Fupa(); }
  }catch(e){ console.warn('Spiele 0.7',e); }
  return r; }; }
{ const _g90=sv50Game; sv50Game=function(id){
  const r=_g90.apply(this,arguments);
  try{ const s=TR.st.sessions.find(x=>x.id===id), M=document.getElementById('modal'); if(!s||!M||!(s.q||s.ds||s.hw))return r;
    const tb=M.querySelector('.trtab tbody'), th=M.querySelector('.trtab thead tr');
    if(tb&&th&&!th.querySelector('.no90')){
      th.insertAdjacentHTML('beforeend','<th class="no90">Note</th>');
      const ord=['da','spaet','bank','zuschauer'], A=(s.a||[]).filter(a=>a[1]!=='weg').sort((a,b)=>ord.indexOf(a[1])-ord.indexOf(b[1]));
      [...tb.rows].forEach((tr,i)=>{ const a=A[i]; tr.insertAdjacentHTML('beforeend',`<td>${a&&a[8]!=null?`<b class="note50 n${a[8]}">${a[8]}</b> ${typeof sv50Src==='function'?sv50Src(a[9]):''}`:'–'}</td>`); }); }
    const act=M.querySelector('.sbact'); if(act&&!M.querySelector('.vl90-box')){ const w=document.createElement('div'); act.before(w);
      sv90VerlaufBox(w,q=>q.in('tabelle',['training_sessions','training_attendance']).eq('ref',String(id)),true); }
  }catch(e){ console.warn('Spiel 0.7',e); }
  return r; }; }

/* ---------- Eye-Test: Liste mit „Review fällig“ und Vergleich je Kategorie ---------- */
function sv90EyeRev(x){
  const me=SVB&&SVB.user&&SVB.user.id; if(!x.E||!me)return false;
  const my=x.E.all.filter(e=>e.rater===me).sort((a,b)=>String(b.updated_at).localeCompare(String(a.updated_at)))[0];
  if(!my)return false; if(!x.mine)return true;
  return (Date.now()-new Date(x.mine.updated_at))/864e5>180;
}
sv70Eye=function(){
  const P=document.getElementById('panel-eye'); if(!P)return;
  if(!sv4Can()){ P.innerHTML='<div class="card"><div class="empty">Eye-Tests sieht das Trainerteam.</div></div>'; return; }
  if(!SV4.loaded){ P.innerHTML='<div class="card"><div class="empty">Lade Eye-Tests …</div></div>'; if(!SV4.loading)sv4Load(); return; }
  const R=sv70EyeRows(); R.forEach(x=>x.rev=sv90EyeRev(x));
  const mode=`<div class="seg4 sm ey90-mode">${[['liste','Spieler'],['kat','Je Kategorie']].map(([k,t])=>`<button type="button" data-ey90m="${k}" class="${SV90.eyeMode===k?'on':''}">${t}</button>`).join('')}</div>`;
  const legend=`<div class="ey70-scale"><div class="ey70-bar"></div>${SV70_ANK.slice(0,3).map(a=>`<span style="left:${a[0]}%"><b>${a[0]}</b></span>`).join('')}</div>
      <div class="ey70-leg">${SV70_ANK.slice(0,3).reverse().map(a=>`<div><b>${a[0]}</b><span><i>${svEsc(a[1])}</i><small>${svEsc(a[2])}</small></span></div>`).join('')}</div>`;
  if(SV90.eyeMode==='kat'){ P.innerHTML=`<div class="card ey70-top"><h3 class="trh">${SVI('eye')} Eye-Test <small>regionale Skala</small></h3>${mode}${legend}</div><div id="ey90k"></div>`; sv90EyeKat(P.querySelector('#ey90k')); }
  else {
    const f=SV70.eyeF;
    const F={offen:x=>!x.mine,review:x=>x.rev,uneinig:x=>x.n>1&&x.spread>=15,eigen:x=>x.own,extern:x=>!x.own,alle:()=>true};
    const L=R.filter(F[f]||F.alle).sort((a,b)=>f==='uneinig'?b.spread-a.spread:(b.avg??-1)-(a.avg??-1)||a.p.name.localeCompare(b.p.name,'de'));
    const cnt=k=>R.filter(F[k]).length;
    const by=new Map(); R.forEach(x=>{ if(x.n<2||x.avg==null)return; x.E.list.forEach(e=>{ const v=sv70EyeTotal(e,x.p.pos); if(v==null)return; const o=by.get(e.rater)||{name:e.rater_name||'?',n:0,d:0}; o.n++; o.d+=v-x.avg; by.set(e.rater,o); }); });
    const raters=[...by.values()].filter(o=>o.n>=2).sort((a,b)=>b.n-a.n);
    P.innerHTML=`<div class="card ey70-top"><h3 class="trh">${SVI('eye')} Eye-Test <small>regionale Skala</small></h3>${mode}${legend}
        <div class="chips4">${[['offen','Deine Bewertung fehlt'],['review','Review fällig'],['uneinig','Uneinig'],['eigen','Intern'],['extern','Extern'],['alle','Alle']].map(([k,t])=>`<button type="button" class="${f===k?'on':''}" data-eyf70="${k}">${t} <i>${cnt(k)}</i></button>`).join('')}</div>
        ${f==='review'?'<p class="note small">Deine Bewertung ist älter als ein halbes Jahr oder stammt aus der Vorsaison. Einmal im Halbjahr drüberschauen hält die Skala gemeinsam gleich.</p>':''}</div>
      <div class="card"><div class="ey70-l">${L.slice(0,150).map(x=>{ const A=sv70Anker(x.avg);
        return `<button type="button" class="ey70-r" data-eyp="${svEsc(x.p.id)}"><span class="kr4-pos">${svEsc(x.p.pos||'–')}</span>
          <span class="ey70-n"><b>${svEsc(x.p.name)}</b><small><i class="io90 ${x.own?'in':'ex'}">${x.own?'intern':'extern'}</i> ${svEsc((x.p.cur&&x.p.cur.club)||x.p.club||'')}</small></span>
          <span class="ey70-v"><b style="color:${x.avg!=null?tierColor(x.avg):'var(--ink3)'}">${x.avg!=null?Math.round(x.avg):'–'}</b><small>${A&&x.avg!=null?svEsc(A[1]):'noch keine'}</small></span>
          <span class="ey70-m"><i>${x.n} Bewertung${x.n===1?'':'en'}</i>${x.n>1?`<i class="${x.spread>=15?'bad':''}">± ${Math.round(x.spread/2)}</i>`:''}<i class="${x.mine?(x.rev?'warn':'ok'):'warn'}">${x.mine?'du: '+Math.round(x.mv)+(x.rev?' · alt':''):x.rev?'Review':'du fehlst'}</i></span></button>`; }).join('')||'<p class="note">Niemand in dieser Auswahl.</p>'}</div></div>
      ${raters.length?`<div class="card"><h3 class="trh">Wer bewertet wie?</h3><div class="ey70-rt">${raters.map(o=>{ const d=o.d/o.n; return `<div><b>${svEsc(o.name)}</b><span>${o.n} Bewertungen</span><em class="${Math.abs(d)<4?'ok':'warn'}">${d>=0?'+':''}${sv4Num(d,1)} ggü. Schnitt</em></div>`; }).join('')}</div>
        <p class="note small">Positiv heißt großzügiger als die anderen, negativ strenger. Hilft, die Skala gemeinsam gleich zu benutzen.</p></div>`:''}`;
    P.querySelectorAll('[data-eyf70]').forEach(b=>b.onclick=()=>{ SV70.eyeF=b.dataset.eyf70; sv70Eye(); });
    P.querySelectorAll('[data-eyp]').forEach(b=>b.onclick=()=>sv90EyeOpen(b.dataset.eyp));
  }
  P.querySelectorAll('[data-ey90m]').forEach(b=>b.onclick=()=>{ SV90.eyeMode=b.dataset.ey90m; sv70Eye(); });
};
function sv90EyeOpen(pid){ try{ PF4.eyeOpen=true; }catch(e){} openModal(pid); setTimeout(()=>{ const M=document.getElementById('modal'), bt=M&&M.querySelector('[data-pf4="eye"]'); const box=M&&M.querySelector('.ey4'); if(bt&&!box)bt.click(); const e2=M&&M.querySelector('.ey4'); if(e2)e2.scrollIntoView({behavior:'smooth',block:'nearest'}); },120); }
// Je Kategorie: Höchster und Niedrigster mit Namen, Schnitt, alle Spieler untereinander zum direkten Eintragen
function sv90EyeKat(B){
  const k=SV90.eyeCat, sc=SV90.eyeScope, s=sv4S(), me=SVB&&SVB.user&&SVB.user.id;
  const lbl=(key,p)=>{ const d=SV4_EYE.find(x=>x[0]===key); return p&&p.pos==='TW'&&SV4_EYE_TW[key]?SV4_EYE_TW[key]:(d?d[1]:key); };
  const rows=sv70EyeRows().filter(x=>sc==='alle'||(sc==='eigen'?x.own:!x.own)).map(x=>{
    const vals=(x.E?x.E.list:[]).map(e=>e[k]).filter(v=>v!=null).map(Number), avg=vals.length?vals.reduce((a,b)=>a+b,0)/vals.length*10:null;
    const mv=x.mine&&x.mine[k]!=null?+x.mine[k]*10:null; return Object.assign({},x,{ka:avg,kn:vals.length,km:mv}); });
