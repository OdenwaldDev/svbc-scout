  c.querySelectorAll('[data-svradd]').forEach(b=>b.onclick=()=>svrMpAdd(b.dataset.svradd));
}
async function svrMpSet(user,team,funk){
  const {error}=await SVB.sb.rpc('admin_mannschaft_person',{p_user:user,p_mannschaft:team,p_funktion:funk});
  if(error){ kToast('⚠️ '+String(error.message||error)); return false; }
  kToast(funk?'✓ Eingetragen':'Ausgetragen'); await svrTeamsCard(); if(user===SVU.id)svrLoad(true); return true;
}
function svrMpAdd(team){
  const m=SVR.mann.find(x=>x.id===team)||{}; const leute=(SV_USERS||[]).filter(u=>u.active);
  const M=svModal(`<div class="mhead"><div><h2 style="margin:0">${svEsc(m.name||'')}: Person eintragen</h2><div class="msub">Die Person sieht danach den Bereich dieser Mannschaft. Wer noch keinen Zugang hat, wird oben mit der Rolle „Jugendtrainer“ eingeladen.</div></div></div>
    <div class="editgrid" style="grid-template-columns:1fr 1fr"><div class="field"><label>Person</label><select id="svrP">${leute.map(u=>`<option value="${svEsc(u.id)}">${svEsc(u.name||u.email)}</option>`).join('')}</select></div>
    <div class="field"><label>Funktion</label><select id="svrF">${Object.entries(SVR_FUNK).map(([k,t])=>`<option value="${k}">${svEsc(t)}</option>`).join('')}</select></div></div>
    <div class="btnrow sbact"><button class="btn" id="svrOk">Eintragen</button><button class="btn ghost" id="svrNo">Abbrechen</button></div>`);
  M.querySelector('#svrNo').onclick=()=>closeOverlay();
  M.querySelector('#svrOk').onclick=async()=>{ if(await svrMpSet(M.querySelector('#svrP').value,team,M.querySelector('#svrF').value))closeOverlay(); };
}

/* Bereiche einer Person: ein Schalter je Bereich. Grau hinterlegt = wie die Rolle, farbig = Ausnahme */
async function svrPerson(id){
  const u=(SV_USERS||[]).find(x=>x.id===id)||{};
  const M=svModal(`<div class="mhead"><div class="uav r-${svEsc(u.role||'')}" style="width:46px;height:46px;border-radius:14px">${svEsc(svIni(u.name||u.email||''))}</div><div><h2 style="margin:0">Bereiche von ${svEsc(svFirst(u.name)||u.email||'')}</h2><div class="msub">Rolle: ${svEsc((SV_ROLE_INFO[u.role]||{}).t||u.role||'')}. Je Bereich eine Funktion: Leitung, Stellvertretung oder Helfer. Einzelne Teile schaltest du darunter an oder aus.</div></div></div><div id="svrPB"><div class="note">Lade …</div></div>`);
  const B=M.querySelector('#svrPB'); let D=null, F={}, ST={};
  const laden=async()=>{ const [a,f,st]=await Promise.all([SVB.sb.rpc('admin_rechte',{p_user:id}), SVB.sb.rpc('admin_funktionen',{p_user:id}), SVB.sb.from('bereiche').select('key,stufe')]);
    if(a.error){ B.innerHTML='<div class="empty">'+svEsc(a.error.message)+'</div>'; return; } D=a.data;
    F=Object.fromEntries(((f&&f.data)||[]).map(x=>[x.bereich,x.stufe])); ST=Object.fromEntries(((st&&st.data)||[]).map(x=>[x.key,x.stufe])); zeichnen(); };
  const RANG={helfer:1,stellv:2,leitung:3}, STUFE_T={helfer:'Helfer',stellv:'Stellvertretung',leitung:'Leitung',aus:'Kein Zugriff'}, AB_T={helfer:'ab Helfer',stellv:'ab Stellvertretung',leitung:'nur Leitung'};
  const by=()=>Object.fromEntries((D.bereiche||[]).map(b=>[b.key,b]));
  const ohneEigene=(k)=>{ const X=by(); let p=X[k]&&X[k].parent; while(p){ if(X[p]&&X[p].ausnahme!==null&&X[p].ausnahme!==undefined)return X[p].ausnahme; p=X[p]&&X[p].parent; } return X[k].team?true:!!X[k].vorgabe; };
  const eff=(k)=>{ const X=by(); return X[k].ausnahme!==null&&X[k].ausnahme!==undefined?X[k].ausnahme:ohneEigene(k); };
  function zeile(b,sub){ const e=eff(b.key), aus=b.ausnahme!==null&&b.ausnahme!==undefined;
    return `<div class="svr-row${sub?' sub':''}${aus?' abw':''}"><div class="svr-rt"><b>${svEsc(b.titel)}</b>${b.hinweis&&!sub?`<span>${svEsc(b.hinweis)}</span>`:''}${b.team?'<span class="svr-tag">in der Mannschaft eingetragen</span>':''}${sub&&ST[b.key]&&!/^team:/.test(b.key)?`<em class="svr-ab">${svEsc(AB_T[ST[b.key]]||'')}</em>`:''}${aus?`<button type="button" class="svr-reset" data-svrr="${svEsc(b.key)}">wie Rolle</button>`:''}</div>
      <button type="button" class="svr-sw${e?' on':''}" role="switch" aria-checked="${e}" aria-label="${svEsc(b.titel)}" data-svrs="${svEsc(b.key)}"><i></i></button></div>`; }
  // Kopf eines Bereichs: Funktion wählen (wie Rolle, Leitung, Stellvertretung, Helfer, kein Zugriff), darunter der Stand
  function kopf(t,kids){ const teile=kids.filter(k=>!/^team:/.test(k.key)), f=F[t.key]||'', e=eff(t.key), anK=teile.filter(k=>eff(k.key)).length;
    let angepasst=false; if(f&&f!=='aus'){ const r=RANG[f]||3; angepasst=!e||teile.some(k=>eff(k.key)!==((RANG[ST[k.key]||'stellv']||2)<=r)); } else if(f==='aus') angepasst=e;
    const stand=!e?'kein Zugriff':teile.length?(anK===teile.length?'alles':anK?`${anK} von ${teile.length} Teilen`:'nur das Grundlegende'):'Zugriff';
    const opts=teile.length?[['','Wie die Rolle'],['leitung','Leitung'],['stellv','Stellvertretung'],['helfer','Helfer'],['aus','Kein Zugriff']]:[['','Wie die Rolle'],['leitung','Zugriff'],['aus','Kein Zugriff']];
    return `<div class="svr-row svr-kopf${f?' abw':''}"><div class="svr-rt"><b>${svEsc(t.titel)}</b>${t.hinweis?`<span>${svEsc(t.hinweis)}</span>`:''}
      <span class="svr-stand${e?' an':''}">${f?svEsc(teile.length||f==='aus'?STUFE_T[f]:'Zugriff')+(angepasst?' (angepasst)':'')+': ':'Wie die Rolle: '}${svEsc(stand)}</span></div>
      <select class="svr-fk" data-svrf="${svEsc(t.key)}" aria-label="Funktion für ${svEsc(t.titel)}">${opts.map(([v,l])=>`<option value="${v}"${v===f?' selected':''}>${svEsc(l)}</option>`).join('')}</select></div>`; }
  function zeichnen(){
    const L=(D.bereiche||[]).slice().sort((a,b)=>(a.sort||0)-(b.sort||0)), top=L.filter(b=>!b.parent);
    const X=by(), AUF=(typeof R80_AUFGABEN!=='undefined'?R80_AUFGABEN:[]).map(a=>Object.assign({},a,{b:a.b.filter(k=>X[k])})).filter(a=>a.b.length);
    const GR=typeof r80Gruppe==='function'?r80Gruppe:()=>'';
    const grp=t=>{ const kids=L.filter(b=>b.parent===t.key);
      return `<div class="svr-grp">${kopf(t,kids)}${kids.length?`<details class="svr-kids" data-k="${svEsc(t.key)}"><summary>${t.key==='mannschaften'?kids.filter(k=>/^team:/.test(k.key)).length+' Mannschaften, Leitungen':'Einzeln anpassen: '+kids.length+(kids.length===1?' Teil':' Teile')}</summary>${kids.map(k=>zeile(k,true)).join('')}</details>`:''}</div>`; };
    const gruppen=[]; top.forEach(t=>{ const g=GR(t.key); let e=gruppen.find(x=>x.g===g); if(!e){ e={g,L:[]}; gruppen.push(e); } e.L.push(t); });
    // aufgeklappte Teile nach dem Neuzeichnen offen lassen
    const aufOffen=!!(B.querySelector('details.svr-auf')||{}).open, kidsOffen=new Set([...B.querySelectorAll('details.svr-kids[open]')].map(d=>d.dataset.k));
    const fz=Object.entries(F).filter(([,v])=>v&&v!=='aus').map(([k,v])=>{ const t=X[k]; return t?`<span class="svr-fchip"><b>${svEsc(t.titel)}</b> ${svEsc(STUFE_T[v]||v)}</span>`:''; }).join('');
    B.innerHTML=`<div class="svr-fs"><h3>Funktionen</h3>${fz?`<div class="svr-fl">${fz}</div>`:'<p class="note small">Noch keine eigene Funktion, alles wie die Rolle. Wähle unten je Bereich Leitung, Stellvertretung oder Helfer, beliebig viele Bereiche.</p>'}</div>
      <div class="svr-list">${gruppen.map(e=>`${e.g?`<h4 class="svr-gh">${svEsc(e.g)}</h4>`:''}${e.L.map(grp).join('')}`).join('')}</div>
      ${AUF.length?`<details class="svr-auf"${aufOffen?' open':''}><summary><h3>Schnellwahl für typische Aufgaben</h3></summary><p class="note small">Ein Tipp schaltet frei, was zu dieser Aufgabe gehört, und nur das. Noch ein Tipp setzt es wieder auf die Rolle zurück.</p>
      <div class="svr-auf-l">${AUF.map(a=>{ const an=a.b.every(eff); return `<button type="button" class="svr-auf-b${an?' on':''}" aria-pressed="${an}" data-svra="${svEsc(a.k)}"><b>${svEsc(a.t)}</b><span>${svEsc(a.d)}</span></button>`; }).join('')}</div></details>`:''}
      <p class="note small">Änderungen gelten sofort. Die Person sieht sie spätestens nach 5 Minuten oder beim nächsten Öffnen der App.</p>`;
    // Aufgabe an: was fehlt, wird freigeschaltet. Braucht sie dafür einen ganzen Oberbereich (z. B. Studio), bekommen dessen übrige
    // Unterbereiche, die die Person vorher nicht hatte, eine Ausnahme „aus“: die Aufgabe öffnet nie mehr, als auf dem Knopf steht.
    // Aufgabe aus: nur ihre eigenen Ausnahmen zurück auf die Rolle, nichts, was eine andere aktive Aufgabe noch braucht.
    B.querySelectorAll('details.svr-kids').forEach(d=>{ if(kidsOffen.has(d.dataset.k))d.open=true; });
    B.querySelectorAll('[data-svra]').forEach(s=>s.onclick=async()=>{ const a=AUF.find(x=>x.k===s.dataset.svra); if(!a)return;
      const alleAn=a.b.every(eff), X0=by(), vorher=Object.fromEntries(Object.keys(X0).map(k=>[k,eff(k)]));
      if(alleAn&&!a.b.some(k=>X0[k].ausnahme===true)){ kToast(a.t+' kommt schon von der Rolle'); return; }
      B.querySelectorAll('[data-svra],[data-svrs],[data-svrr]').forEach(x=>x.disabled=true);
      const setz=async(k,an)=>{ const {error}=await SVB.sb.rpc('admin_zugriff_set',{p_user:id,p_bereich:k,p_an:an}); if(error)throw error;
        const r=await SVB.sb.rpc('admin_rechte',{p_user:id}); if(r.error)throw r.error; D=r.data; };
      try{
        if(alleAn){ const brauchen=new Set(AUF.filter(o=>o.k!==a.k&&o.b.every(eff)).flatMap(o=>o.b));
          for(const k of a.b){ const Y=by()[k]; if(Y&&Y.ausnahme===true&&!brauchen.has(k))await setz(k,null); }
          // was nur über einen Oberbereich offen bleibt, den eine andere Aufgabe noch braucht (z. B. Studio Jugend unter Studio), gezielt zu
          for(const k of a.b){ const Y=by()[k]; if(!Y||brauchen.has(k)||Y.ausnahme===true||Y.ausnahme===false||Y.team||Y.vorgabe)continue; if(eff(k))await setz(k,false); }
          // „aus“-Ausnahmen, die nur wegen dieser Aufgabe nötig waren, aufräumen (ohne sie bliebe der Bereich ohnehin zu)
          for(const k of a.b){ for(const c of (D.bereiche||[]).filter(b=>b.parent===k)){ const Y=by()[c.key]; if(Y&&Y.ausnahme===false&&!ohneEigene(c.key))await setz(c.key,null); } }
          kToast(a.t+': zurück auf die Rolle'); }
        else { for(const k of a.b){ if(!by()[k]||eff(k))continue; const oben=!ohneEigene(k); await setz(k,oben?true:null);
            if(oben) for(const c of (D.bereiche||[]).filter(b=>b.parent===k)){ const Y=by()[c.key]; if(!Y||a.b.includes(c.key)||vorher[c.key]||Y.ausnahme!==null&&Y.ausnahme!==undefined)continue; if(eff(c.key))await setz(c.key,false); } }
          kToast('✓ '+a.t+' freigeschaltet'); } }
      catch(e){ kToast('Das hat nicht ganz geklappt. Prüf die Verbindung und tipp noch einmal.'); try{ const r=await SVB.sb.rpc('admin_rechte',{p_user:id}); if(!r.error)D=r.data; }catch(_){} }
      zeichnen(); });
    B.querySelectorAll('[data-svrf]').forEach(s=>s.onchange=async()=>{ const k=s.dataset.svrf, v=s.value||null, warAngepasst=/angepasst/.test((s.closest('.svr-row').querySelector('.svr-stand')||{}).textContent||''); B.querySelectorAll('select,button').forEach(x=>x.disabled=true);
      const {error}=await SVB.sb.rpc('admin_funktion_set',{p_user:id,p_bereich:k,p_stufe:v});
      if(error)kToast('Das hat nicht geklappt. Prüf die Verbindung und versuch es noch mal.'); else kToast((v?'✓ '+(X[k]||{}).titel+': '+(v==='aus'?'kein Zugriff':(L.some(b=>b.parent===k&&!/^team:/.test(b.key))?STUFE_T[v]:'Zugriff')):(X[k]||{}).titel+': wie die Rolle')+(warAngepasst?'. Die einzelnen Anpassungen in diesem Bereich sind ersetzt.':''));
      await laden(); });
    B.querySelectorAll('[data-svrs]').forEach(s=>s.onclick=async()=>{ const k=s.dataset.svrs, neu=!eff(k), wieRolle=neu===ohneEigene(k);
      s.disabled=true; const {error}=await SVB.sb.rpc('admin_zugriff_set',{p_user:id,p_bereich:k,p_an:wieRolle?null:neu});
      if(error){ kToast('⚠️ '+error.message); s.disabled=false; return; } await laden(); });
    B.querySelectorAll('[data-svrr]').forEach(s=>s.onclick=async()=>{ const {error}=await SVB.sb.rpc('admin_zugriff_set',{p_user:id,p_bereich:s.dataset.svrr,p_an:null}); if(error)kToast('⚠️ '+error.message); await laden(); });
  }
  laden();
}

/* Vorgaben: welche Rollen einen Bereich ohne Ausnahme haben. Neue Bereiche starten mit Vorstand (Admin hat immer alles) */
async function svrVorgCard(){
  const c=document.getElementById('svrVorgCard'); if(!c)return;
  const {data,error}=await SVB.sb.from('bereiche').select('key,titel,parent,sort,vorgabe').order('sort');
  if(error){ c.innerHTML='<div class="empty">Bereiche konnten nicht geladen werden.</div>'; return; }
  const R=[['vorstand','Vorstand'],['planer','Planer'],['trainer','Trainer'],['viewer','Gast'],['jugend','Jugend'],['spieler','Spieler'],['helfer','Helfer']];
  const top=(data||[]).filter(b=>!b.parent&&b.key!=='mannschaften'), kids=k=>(data||[]).filter(b=>b.parent===k);
  const row=(b,sub)=>`<tr class="${sub?'sub':''}"><th>${svEsc(b.titel)}</th>${R.map(([r])=>`<td><input type="checkbox" aria-label="${svEsc(b.titel)}: ${r}" data-svrv="${svEsc(b.key)}|${r}"${(b.vorgabe||[]).includes(r)?' checked':''}></td>`).join('')}</tr>`;
  c.innerHTML=`<details class="svr-vorg"><summary><h3 style="margin:0;display:inline">Vorgaben je Rolle</h3> <span class="note small">Was jede Rolle ohne Ausnahme sieht. Neue Bereiche bekommen automatisch nur Admin und Vorstand.</span></summary>
    <div class="svr-tw"><table class="svr-vt"><thead><tr><th>Bereich</th>${R.map(([,t])=>`<th>${t}</th>`).join('')}</tr></thead><tbody>${top.map((b,i)=>{ const g=typeof r80Gruppe==='function'?r80Gruppe(b.key):''; const neu=g&&(i===0||r80Gruppe(top[i-1].key)!==g); return (neu?`<tr class="svr-vg"><th colspan="${R.length+1}">${svEsc(g)}</th></tr>`:'')+row(b,false)+kids(b.key).map(k=>row(k,true)).join(''); }).join('')}</tbody></table></div></details>`;
  c.querySelectorAll('[data-svrv]').forEach(x=>x.onchange=async()=>{ const [k]=x.dataset.svrv.split('|');
    const rollen=[...c.querySelectorAll(`[data-svrv^="${k}|"]`)].filter(y=>y.checked).map(y=>y.dataset.svrv.split('|')[1]);
    const {error}=await SVB.sb.rpc('admin_bereich_vorgabe',{p_bereich:k,p_rollen:rollen}); if(error){ kToast('⚠️ '+error.message); x.checked=!x.checked; return; } kToast('✓ Vorgabe gespeichert'); if(typeof r80Rollenkarten==='function')r80Rollenkarten(true); });
}

/* =====================================================================
   Sportzentrale Beta 0.24 · Teambereich für die Zweite und alle Jugendmannschaften
   - Je Mannschaft: Kader je Saison, Termine mit Anwesenheit und Eindruck, Aufstellung, Statistik, Entwicklung, Abstimmung
   - Stufen: volle Ausstattung (Zweite, A bis C), Basis (D, E: Aufstellung für 7er und 9er), Leicht (F, G, Minikicker)
   - Akte je Spieler über alle Jahre, Ehemalige wiederfinden, „Für KI kopieren“ ohne Namen
   - Abstimmung per Gruppenlink: Eltern tippen den Namen des Kindes. Keine Nummern oder Mails von Kindern.
   ===================================================================== */
const SVT={team:null,saison:null,view:null,K:[],T:[],A:[],R:[],E:[],busy:false,t:0,sel:null};
const SVT_V={
  voll:[['kader','Kader'],['termine','Termine'],['aufstellung','Aufstellung'],['statistik','Statistik'],['entwicklung','Entwicklung'],['abstimmung','Abstimmung']],
  basis:[['kader','Kader'],['termine','Termine'],['aufstellung','Aufstellung'],['statistik','Statistik'],['entwicklung','Entwicklung'],['abstimmung','Abstimmung']],
  mini:[['kader','Kinder'],['termine','Termine'],['abstimmung','Abstimmung'],['entwicklung','Übungen']]};
SVT_V.jugend=SVT_V.voll;
const SVT_GRUND={krank:'krank',verletzt:'verletzt',urlaub:'Urlaub',schule:'Schule',privat:'privat',ohne:'ohne Grund'};
const SVT_ART={training:'Training',spiel:'Spiel',turnier:'Turnier',sonst:'Termin'};
const SVT_THEMA={technik:'Technik',taktik:'Taktik',athletik:'Athletik & Koordination',mental:'Kopf & Einstellung',torwart:'Torwart',sozial:'Team & Verhalten'};
const SVT_WERTE=[['technik','Technik'],['taktik','Spielverständnis'],['athletik','Athletik'],['einsatz','Trainingsfleiß'],['sozial','Teamverhalten'],['potenzial','Potenzial']];
const SVT_FORM={11:['4-4-2','4-3-3','4-2-3-1','3-5-2','5-3-2'],9:['3-3-2','3-2-3','2-4-2'],7:['2-3-1','3-2-1','2-2-2']};

/* Übungskatalog: offizielle Quellen (DFB, fussball.de Training & Service), passend zur Altersklasse */
const SVT_ORD={h:'aktiver-ue-20',a:'a-juniorin',b:'b-juniorin',c:'c-juniorin',d:'d-juniorin',e:'e-juniorin',f:'f-juniorin',g:'bambini',m:'bambini'};
const SVT_TS='https://training-service.fussball.de/trainer/';
const SVT_KAT=[
  {k:'passen-f',t:'technik',n:'Die Grundlagen des Passspiels erlernen',ak:'fgm',u:SVT_TS+'f-juniorin/training-online/trainingseinheiten-detail/die-grundlagen-des-passspiels-erlernen-727/'},
  {k:'passen-e',t:'technik',n:'Präzise passen, sicher kombinieren',ak:'ed',u:SVT_TS+'e-juniorin/training-online/trainingseinheiten-detail/praezise-passen-sicher-kombinieren-2263/'},
  {k:'passen-b',t:'technik',n:'Passspiel auf engem Raum, aus Drucksituationen lösen',ak:'cbah',u:SVT_TS+'b-juniorin/training-online/trainingseinheiten-detail/spielerisch-aus-drucksituation-loesen-passspiel-auf-engem-raum-2388/'},
  {k:'dribbling-e',t:'technik',n:'Dribbling im 1 gegen 1',ak:'fed',u:SVT_TS+'e-juniorin/training-online/trainingseinheiten-detail/dribbling-im-1-gegen-1-69/'},
  {k:'technik-a',t:'technik',n:'Technik für jedermann',ak:'bah',u:SVT_TS+'a-juniorin/artikel/dfb-training-online-technik-fuer-jedermann-3134/'},
  {k:'torschuss-e',t:'technik',n:'Mit Torschuss-Wettbewerben Lust aufs Toreschießen wecken',ak:'fedc',u:'https://www.dfb.de/trainer/e-juniorin/training-online/trainingseinheiten-detail/mit-torschuss-wettbewerben-lust-auf-die-saison-wecken-87/'},
  {k:'kopfball-d',t:'technik',n:'Erlernen des Kopfballspiels (altersgerecht, mit leichtem Ball)',ak:'dcb',u:SVT_TS+'d-juniorin/training-online/trainingseinheiten-detail/erlernen-des-kopfballspiels-172/'},
  {k:'kopfball-regeln',t:'technik',n:'Kopfball: Empfehlungen der DFB-Kommission je Altersklasse',ak:'mgfedcbah',u:'https://www.fussball.de/newsdetail/kopfball-empfehlungen-der-dfb-kommission/-/article-id/264587'},
  {k:'kopfball-dfb',t:'technik',n:'Kopfballspiel: Infos, Tipps und Übungen (DFB)',ak:'dcbah',u:'https://www.dfb.de/content/kopfballspiel'},
  {k:'doppeln-c',t:'taktik',n:'Den Gegner stellen und richtig doppeln',ak:'cbah',u:SVT_TS+'c-juniorin/training-online/trainingseinheiten-detail/den-gegner-stellen-und-richtig-doppeln-2503/'},
  {k:'koordination-d',t:'athletik',n:'Koordination und Schnelligkeit schulen',ak:'ed',u:SVT_TS+'d-juniorin/training-online/trainingseinheiten-detail/koordination-und-schnelligkeit-schulen-2372/'},
  {k:'koordination-c',t:'athletik',n:'Koordination im Mannschaftstraining',ak:'cb',u:SVT_TS+'c-juniorin/training-online/trainingseinheiten-detail/die-koordination-im-mannschaftstraining-schulen-2546/'},
  {k:'kraft-a',t:'athletik',n:'Kleine Spiele mit Koordination und Kraft verbinden',ak:'ah',u:SVT_TS+'a-juniorin/training-online/trainingseinheiten-detail/kleine-spiele-mit-koordination-und-kraft-verbinden-321/'},
  {k:'schnell-h',t:'athletik',n:'Schnelligkeit mit Ball',ak:'h',u:SVT_TS+'aktiver-ue-20/training-online/trainingseinheiten-detail/schnelligkeit-mit-ball-2419/'},
  {k:'tw-f',t:'torwart',n:'In Turnieren das Torwartspiel ausprobieren',ak:'fgm',u:SVT_TS+'f-juniorin/training-online/trainingseinheiten-detail/in-turnieren-das-torwartspiel-ausprobieren-2478/'},
  {k:'tw-d',t:'torwart',n:'Technisch-taktisches Torhütertraining beginnen',ak:'dcbah',u:SVT_TS+'d-juniorin/artikel/technisch-taktisches-torhuetertraining-beginnen-2298/'},
  {k:'kinder-spielformen',t:'sozial',n:'Die neuen Spielformen im Kinderfußball (Funino, 3 gegen 3)',ak:'mgfe',u:SVT_TS+'f-juniorin/artikel/die-neuen-spielformen-im-kinderfussball-3484/'},
  {k:'kinder-dfb',t:'sozial',n:'Kinderfußball: Spielformen in G-, F- und E-Jugend (DFB)',ak:'mgfe',u:'https://www.dfb.de/mehr-fussball/kinderfussball'}
];
function svtAk(m){ return m==='mini'?'m':String(m||'')[0]; }
function svtKat(m){ const a=svtAk(m); return SVT_KAT.filter(x=>x.ak.includes(a)); }
function svtEinheiten(m){ return SVT_TS+(SVT_ORD[svtAk(m)]||'c-juniorin')+'/training-online/'; }

/* ---------- Grundlagen ---------- */
function svtSaisonJetzt(){ const d=new Date(), y=d.getFullYear()%100, s=d.getMonth()+1>=7?y:y-1; return String(s).padStart(2,'0')+String((s+1)%100).padStart(2,'0'); }
function svtSaisonAdd(s,n){ const a=(+s.slice(0,2)+n+100)%100; return String(a).padStart(2,'0')+String((a+1)%100).padStart(2,'0'); }
function svtSL(s){ return '20'+s.slice(0,2)+'/'+s.slice(2); }
function svtM(id){ return (SVR.mann||[]).find(m=>m.id===id)||{id,name:id,kurz:id,stufe:'voll'}; }
function svtStufe(){ const s=svtM(SVT.team).stufe; return s==='mini'?'mini':s==='basis'?'basis':'voll'; }
function svtSpieler(n){ return n?(n.vorname+' '+n.nachname):''; }
function svtHeute(){ const d=new Date(); return d.getFullYear()+'-'+String(d.getMonth()+1).padStart(2,'0')+'-'+String(d.getDate()).padStart(2,'0'); }
function svtAddD(iso,n){ const d=new Date(iso+'T12:00:00'); d.setDate(d.getDate()+n); return d.toISOString().slice(0,10); }
function svtDat(iso,lang){ try{ return new Date(iso+'T12:00:00').toLocaleDateString('de-DE',lang?{weekday:'long',day:'numeric',month:'long'}:{weekday:'short',day:'2-digit',month:'2-digit'}); }catch(e){ return iso; } }
function svtErr(e){ kToast('⚠️ '+String((e&&e.message)||e)); }
async function svtRpc(fn,args){ const {data,error}=await SVB.sb.rpc(fn,args); if(error)throw error; return data; }
function svtPanel(){ let P=document.getElementById('panel-teams'); if(P)return P;
  const ref=document.getElementById('panel-training')||document.querySelector('.panel'); if(!ref)return null;
  P=document.createElement('section'); P.className='panel'; P.id='panel-teams'; ref.parentNode.insertBefore(P,ref.nextSibling); return P; }
{ const _gt=goTab; goTab=function(tab){ if(tab==='teams')svtPanel(); const r=_gt.apply(this,arguments); try{ if(svCurTab()==='teams')svtRender(); }catch(e){ console.warn('Teams',e); } return r; }; }
function svtOpen(id){ SVT.team=id; SVT.view=null; SVT.t=0; goTab('teams'); }

async function svtLoad(force){
  if(!SVT.team)return; if(SVT.busy)return; if(!force&&SVT.t&&Date.now()-SVT.t<30000&&SVT._k===SVT.team+SVT.saison)return;
  SVT.busy=true;
  try{
    const sb=SVB.sb, m=SVT.team, s=SVT.saison;
    const [k,t]=await Promise.all([sb.from('team_kader').select('*,vereinsspieler(*)').eq('mannschaft',m).eq('saison',s),
      sb.from('team_termine').select('*').eq('mannschaft',m).eq('saison',s).order('datum').order('zeit')]);
    if(k.error)throw k.error; if(t.error)throw t.error;
    SVT.K=(k.data||[]).filter(x=>x.vereinsspieler).sort((a,b)=>(a.status==='abgang')-(b.status==='abgang')||(a.nr||99)-(b.nr||99)||svtSpieler(a.vereinsspieler).localeCompare(svtSpieler(b.vereinsspieler),'de'));
    SVT.T=t.data||[];
    const ids=SVT.T.map(x=>x.id), A=[], R=[];
    for(let i=0;i<ids.length;i+=60){ const part=ids.slice(i,i+60);
      const [a,r]=await Promise.all([sb.from('team_anwesenheit').select('*').in('termin',part),sb.from('team_rueckmeldung').select('*').in('termin',part)]);
      if(a.error)throw a.error; if(r.error)throw r.error; A.push(...(a.data||[])); R.push(...(r.data||[])); }
    SVT.A=A; SVT.R=R;
    const sp=SVT.K.map(x=>x.spieler); if(sp.length){ const e=await sb.from('entwicklung').select('*').in('spieler',sp).order('erstellt_am',{ascending:false}); SVT.E=e.error?[]:(e.data||[]); } else SVT.E=[];
    SVT.t=Date.now(); SVT._k=m+s;
  }catch(e){ console.warn('Teams laden',e); SVT.err=String(e.message||e); }
  finally{ SVT.busy=false; }
}

/* Kennzahlen je Spieler für die Saison */
function svtStat(sid){
  const heute=svtHeute(), tr=SVT.T.filter(t=>t.art==='training'&&!t.abgesagt&&t.datum<=heute), trIds=new Set(tr.map(t=>t.id));
  const erfasst=new Set(SVT.A.filter(a=>trIds.has(a.termin)).map(a=>a.termin));
  const my=SVT.A.filter(a=>a.spieler===sid), inTr=my.filter(a=>erfasst.has(a.termin));
  const da=inTr.filter(a=>a.status!=='weg').length, spaet=inTr.filter(a=>a.status==='spaet').length, ohne=inTr.filter(a=>a.status==='weg'&&a.grund==='ohne').length;
  const sp=new Set(SVT.T.filter(t=>t.art!=='training').map(t=>t.id)), einsatz=my.filter(a=>sp.has(a.termin)&&['start','ein'].includes(a.einsatz)).length;
  const tore=my.reduce((s,a)=>s+(a.tore||0),0), ein=my.filter(a=>a.eindruck), avg=ein.length?ein.reduce((s,a)=>s+a.eindruck,0)/ein.length:null;
  // Trend: letzte 6 erfassten Trainings
  const letzte=[...erfasst].map(id=>SVT.T.find(t=>t.id===id)).sort((a,b)=>b.datum.localeCompare(a.datum)).slice(0,6).map(t=>t.id);
  const l6=letzte.length?letzte.filter(id=>my.some(a=>a.termin===id&&a.status!=='weg')).length/letzte.length:null;
  return {n:erfasst.size,da,spaet,ohne,quote:erfasst.size?da/erfasst.size:null,einsatz,tore,avg,nEin:ein.length,l6};
}
function svtEinChip(avg){ if(avg==null)return '<span class="svt-e n">–</span>'; const c=avg<=2.4?'p':avg>=4.5?'m':'o'; return `<span class="svt-e ${c}" title="Ø Eindruck ${avg.toFixed(1)}">${c==='p'?'+':c==='m'?'−':'○'}</span>`; }
function svtPct(x){ return x==null?'–':Math.round(x*100)+' %'; }

/* ---------- Rahmen ---------- */
async function svtRender(){
  const P=svtPanel(); if(!P)return;
  const teams=svrTeams();
  if(!SVR.loaded){ P.innerHTML='<div class="card"><div class="empty">Lade …</div></div>'; await svrLoad(true); return svtRender(); }
  if(!teams.length){ P.innerHTML='<div class="card"><div class="empty">Für dich ist noch keine Mannschaft freigeschaltet. Der Admin trägt dich unter Verwaltung, Mannschaften ein.</div></div>'; return; }
  if(!SVT.team||!teams.some(t=>t.id===SVT.team)){ const eig=SVR.funk.map(f=>f.mannschaft).find(id=>teams.some(t=>t.id===id)); SVT.team=eig||teams[0].id; }
  if(!SVT.saison)SVT.saison=svtSaisonJetzt();
  const st=svtStufe(), V=SVT_V[st]; if(!SVT.view||!V.some(([k])=>k===SVT.view))SVT.view=V[0][0];
  const m=svtM(SVT.team), f=svrFunk(SVT.team), jetzt=svtSaisonJetzt();
  const saisons=[svtSaisonAdd(jetzt,1),jetzt,svtSaisonAdd(jetzt,-1),svtSaisonAdd(jetzt,-2),svtSaisonAdd(jetzt,-3)];
  P.innerHTML=`<div class="svt-top">
      ${teams.length>1?`<div class="svt-chips" role="tablist" aria-label="Mannschaft">${teams.map(t=>`<button type="button" role="tab" class="${t.id===SVT.team?'on':''}" data-svtm="${svEsc(t.id)}">${svEsc(t.kurz)}</button>`).join('')}</div>`:''}
      <div class="svt-head"><div><h2>${svEsc(m.name)}</h2><p>${f?`<span class="svt-f">${svEsc(SVR_FUNK[f])}</span> `:''}${svEsc(SVR_STUFE[m.stufe]||'')}</p></div>
        <select id="svtS" aria-label="Saison">${saisons.map(s=>`<option value="${s}"${s===SVT.saison?' selected':''}>Saison ${svtSL(s)}</option>`).join('')}</select></div>
      <div class="svt-seg" role="tablist">${V.map(([k,l])=>`<button type="button" role="tab" class="${k===SVT.view?'on':''}" data-svtv="${k}">${svEsc(l)}</button>`).join('')}</div></div>
    <div id="svtB"><div class="card"><div class="empty">Lade …</div></div></div>`;
  P.querySelectorAll('[data-svtm]').forEach(b=>b.onclick=()=>{ SVT.team=b.dataset.svtm; SVT.view=null; SVT.t=0; svtRender(); });
  P.querySelectorAll('[data-svtv]').forEach(b=>b.onclick=()=>{ SVT.view=b.dataset.svtv; svtRender(); });
  P.querySelector('#svtS').onchange=e=>{ SVT.saison=e.target.value; SVT.t=0; svtRender(); };
  await svtLoad(); svtBody();
}
function svtBody(){
  const B=document.getElementById('svtB'); if(!B)return;
  if(SVT.err&&!SVT.t){ B.innerHTML=`<div class="card"><div class="empty">Konnte nicht laden: ${svEsc(SVT.err)}</div></div>`; return; }
  const f={kader:svtKader,termine:svtTermine,aufstellung:svtAufstellung,statistik:svtStatistik,entwicklung:svtEntwicklung,abstimmung:svtAbstimmung,ehemalige:svtEhemalige}[SVT.view]||svtKader;
  try{ f(B); }catch(e){ console.warn(e); B.innerHTML='<div class="card"><div class="empty">Fehler beim Anzeigen.</div></div>'; }
}
async function svtReload(){ SVT.t=0; await svtLoad(true); svtBody(); }

/* ---------- Kader ---------- */
function svtKader(B){
  const mini=svtStufe()==='mini', h=SVT.team.startsWith('h'), aktiv=SVT.K.filter(k=>k.status!=='abgang');
  B.innerHTML=`<div class="card"><div class="svt-ch"><h3 class="trh">${SVI('users')} ${mini?'Kinder':'Kader'} ${svtSL(SVT.saison)} <small>${aktiv.length}</small></h3>
      <div class="btnrow"><button class="btn sm" id="svtNeu" type="button">${SVI('plus')} ${mini?'Kind':'Spieler'}</button>
      <button class="btn sm ghost" id="svtAuf" type="button">${SVI('move')} ${h?'Aus der A-Jugend':'Aufrücken'}</button>
      <button class="btn sm ghost" id="svtVor" type="button">${SVI('refresh')} Aus ${svtSL(svtSaisonAdd(SVT.saison,-1))}</button>
      ${h&&canScout()?`<button class="btn sm ghost" id="svtDs" type="button">${SVI('db')} Aus dem Datenbestand</button>`:''}
      ${mini?'':`<button class="btn sm ghost" id="svtEhem" type="button">${SVI('eye')} Ehemalige</button>`}</div></div>
    ${SVT.K.length?`<div class="svt-tw"><table class="svt-t"><thead><tr><th>#</th><th>Name</th><th>Jg.</th>${mini?'':'<th>Pos.</th><th>Fuß</th>'}<th title="Trainingsbeteiligung">Training</th>${mini?'':'<th title="Einsätze">Sp.</th><th>Tore</th><th title="Ø Eindruck">Ein.</th>'}</tr></thead><tbody>
      ${SVT.K.map(k=>{ const v=k.vereinsspieler, s=svtStat(k.spieler), warn=s.n>=6&&s.quote<.6;
        return `<tr data-svtp="${svEsc(k.spieler)}" class="${k.status==='abgang'?'off':''}"><td>${k.nr||''}</td><td><b>${svEsc(svtSpieler(v))}</b>${v.talent?' <span class="svt-star" title="Talent">★</span>':''}${k.status==='gast'?' <span class="svt-tag">Gast</span>':''}${k.status==='abgang'?' <span class="svt-tag">Abgang</span>':''}</td>
          <td>${v.jahrgang||''}</td>${mini?'':`<td>${svEsc(k.position||v.position||'')}</td><td>${v.fuss?svEsc(v.fuss[0].toUpperCase()):''}${v.schwach?`<span class="svt-wf" title="Schwacher Fuß ${v.schwach} von 5">${'•'.repeat(v.schwach)}</span>`:''}</td>`}
          <td class="${warn?'svt-warn':''}">${svtPct(s.quote)}${s.ohne>=3?` <span class="svt-tag r" title="unentschuldigt">${s.ohne}× o.G.</span>`:''}</td>
          ${mini?'':`<td>${s.einsatz||''}</td><td>${s.tore||''}</td><td>${svtEinChip(s.avg)}</td>`}</tr>`; }).join('')}</tbody></table></div>`
      :`<div class="empty">Noch niemand im Kader. Leg ${mini?'die Kinder':'die Spieler'} an oder übernimm sie aus der Vorsaison.</div>`}
    <p class="note small">Nur Namen, Jahrgang und Sportliches. Keine Telefonnummern oder Mails von Kindern.</p></div>`;
  B.querySelectorAll('[data-svtp]').forEach(r=>r.onclick=()=>svtSpielerModal(r.dataset.svtp));
  B.querySelector('#svtNeu').onclick=()=>svtSpielerForm(null);
  B.querySelector('#svtAuf').onclick=svtAufruecken;
  B.querySelector('#svtVor').onclick=svtVorsaison;
  const ds=B.querySelector('#svtDs'); if(ds)ds.onclick=svtDatenbestand;
  const eh=B.querySelector('#svtEhem'); if(eh)eh.onclick=()=>{ SVT.view='ehemalige'; svtBody(); };
}
function svtSpielerForm(sid){
  const k=sid?SVT.K.find(x=>x.spieler===sid):null, v=k?k.vereinsspieler:{}, mini=svtStufe()==='mini';
  const M=svModal(`<div class="mhead"><div><h2 style="margin:0">${sid?svEsc(svtSpieler(v))+' bearbeiten':mini?'Kind anlegen':'Spieler anlegen'}</h2><div class="msub">${svEsc(svtM(SVT.team).name)} · Saison ${svtSL(SVT.saison)}</div></div></div>
    <form id="svtF" class="editgrid svt-form" autocomplete="off">
      <div class="field"><label>Vorname</label><input name="vorname" required maxlength="30" value="${svEsc(v.vorname||'')}"></div>
      <div class="field"><label>Nachname</label><input name="nachname" required maxlength="40" value="${svEsc(v.nachname||'')}"></div>
      <div class="field"><label>Jahrgang</label><input name="jahrgang" type="number" inputmode="numeric" min="1950" max="2030" value="${svEsc(v.jahrgang||'')}"></div>
      <div class="field"><label>Rückennummer</label><input name="nr" type="number" inputmode="numeric" min="1" max="99" value="${svEsc((k&&k.nr)||'')}"></div>
      ${mini?'':`<div class="field"><label>Position</label><input name="position" maxlength="24" placeholder="z.B. IV, ZM, ST, TW" value="${svEsc((k&&k.position)||v.position||'')}"></div>
      <div class="field"><label>Starker Fuß</label><select name="fuss"><option value="">offen</option>${['rechts','links','beide'].map(x=>`<option${v.fuss===x?' selected':''}>${x}</option>`).join('')}</select></div>
      <div class="field"><label>Schwacher Fuß</label><select name="schwach"><option value="">offen</option>${[1,2,3,4,5].map(x=>`<option value="${x}"${v.schwach===x?' selected':''}>${x} ${['kaum','schwach','ordentlich','gut','beidfüßig'][x-1]}</option>`).join('')}</select></div>`}
      <div class="field" style="grid-column:1/-1"><label>Notiz (sportlich)</label><textarea name="notiz" maxlength="1000" rows="2">${svEsc(v.notiz||'')}</textarea></div>
      ${mini?'':`<label class="svt-cb"><input type="checkbox" name="talent"${v.talent?' checked':''}> Talent merken (taucht auch bei Ehemaligen oben auf)</label>`}
      <div class="btnrow sbact" style="grid-column:1/-1"><button class="btn" type="submit">Speichern</button><button class="btn ghost" type="button" id="svtX">Abbrechen</button></div></form>`);
  M.querySelector('#svtX').onclick=()=>closeOverlay();
  M.querySelector('#svtF').onsubmit=async e=>{ e.preventDefault(); const fd=new FormData(e.target), p={mannschaft:SVT.team,saison:SVT.saison};
    ['vorname','nachname','jahrgang','nr','fuss','schwach','notiz'].forEach(x=>{ if(fd.has(x))p[x]=String(fd.get(x)).trim(); });
    if(fd.has('position'))p.kposition=p.position=String(fd.get('position')).trim();
    if(!mini)p.talent=fd.has('talent'); if(sid)p.id=sid;
    try{ await svtRpc('team_spieler_save',{p}); kToast('✓ Gespeichert'); closeOverlay(); await svtReload(); }catch(err){ svtErr(err); } };
}
async function svtAufruecken(){
  let L=[]; try{ L=await svtRpc('team_aufruecken',{p_m:SVT.team,p_saison:SVT.saison})||[]; }catch(e){ return svtErr(e); }
  const M=svModal(`<div class="mhead"><div><h2 style="margin:0">Aufrücken in die ${svEsc(svtM(SVT.team).kurz)}</h2><div class="msub">Passende Jahrgänge aus den Mannschaften darunter (letzte und laufende Saison), die noch nicht im Kader stehen.</div></div></div>
    ${L.length?`<div class="svt-pick">${L.map(x=>`<label><input type="checkbox" value="${svEsc(x.id)}" checked> <b>${svEsc(x.name)}</b> <span>Jg. ${svEsc(x.jahrgang||'?')} · zuletzt ${svEsc(x.von||'')}</span></label>`).join('')}</div>
      <div class="btnrow sbact"><button class="btn" id="svtOk">Übernehmen</button><button class="btn ghost" id="svtX">Abbrechen</button></div>`:'<div class="empty">Niemand gefunden. Jahrgänge fehlen vielleicht bei den Spielern der unteren Mannschaft.</div>'}`);
  const ok=M.querySelector('#svtOk'); if(!ok)return; M.querySelector('#svtX').onclick=()=>closeOverlay();
  ok.onclick=async()=>{ const ids=[...M.querySelectorAll('input:checked')].map(i=>i.value); if(!ids.length)return closeOverlay();
    try{ const n=await svtRpc('team_kader_add',{p_m:SVT.team,p_saison:SVT.saison,p_spieler:ids,p_status:'aktiv'}); kToast('✓ '+n+' übernommen'); closeOverlay(); await svtReload(); }catch(e){ svtErr(e); } };
}
async function svtVorsaison(){
  const vs=svtSaisonAdd(SVT.saison,-1);
  const {data,error}=await SVB.sb.from('team_kader').select('spieler,status,vereinsspieler(vorname,nachname,jahrgang,abgang_am)').eq('mannschaft',SVT.team).eq('saison',vs);
  if(error)return svtErr(error); const schon=new Set(SVT.K.map(k=>k.spieler)), jg=svtJgOk();
  const L=(data||[]).filter(x=>x.vereinsspieler&&!x.vereinsspieler.abgang_am&&x.status!=='abgang'&&!schon.has(x.spieler));
  const M=svModal(`<div class="mhead"><div><h2 style="margin:0">Kader aus ${svtSL(vs)} übernehmen</h2><div class="msub">Wer altersmäßig weiter passt, ist vorausgewählt.</div></div></div>
    ${L.length?`<div class="svt-pick">${L.map(x=>{ const v=x.vereinsspieler, passt=!v.jahrgang||jg.includes(v.jahrgang); return `<label><input type="checkbox" value="${svEsc(x.spieler)}"${passt?' checked':''}> <b>${svEsc(svtSpieler(v))}</b> <span>Jg. ${svEsc(v.jahrgang||'?')}${passt?'':' · rückt eigentlich auf'}</span></label>`; }).join('')}</div>
      <div class="btnrow sbact"><button class="btn" id="svtOk">Übernehmen</button><button class="btn ghost" id="svtX">Abbrechen</button></div>`:'<div class="empty">In der Vorsaison ist niemand (mehr) offen.</div>'}`);
  const ok=M.querySelector('#svtOk'); if(!ok)return; M.querySelector('#svtX').onclick=()=>closeOverlay();
  ok.onclick=async()=>{ const ids=[...M.querySelectorAll('input:checked')].map(i=>i.value); if(!ids.length)return closeOverlay();
    try{ const n=await svtRpc('team_kader_add',{p_m:SVT.team,p_saison:SVT.saison,p_spieler:ids,p_status:'aktiv'}); kToast('✓ '+n+' übernommen'); closeOverlay(); await svtReload(); }catch(e){ svtErr(e); } };
}
function svtJgOk(){ const y=2000+(+SVT.saison.slice(0,2)), m=SVT.team, a=svtAk(m);
  const off={a:[18,17],b:[16,15],c:[14,13],d:[12,11],e:[10,9],f:[8,7],g:[6,5],m:[4,3,2]}[a]; if(!off)return Array.from({length:60},(_,i)=>y-19-i); return off.map(o=>y-o); }
/* Zweite: Spieler aus dem Datenbestand der Ersten (eigene Spieler der Zweiten) übernehmen, nur mit Scouting-Recht */
function svtDatenbestand(){
  const P=(typeof players!=='undefined'?players:[]).filter(p=>p.own&&p.kader===2&&!p.isJugend);
  const schon=new Set(SVT.K.map(k=>k.vereinsspieler.extern_id).filter(Boolean));
  const L=P.filter(p=>!schon.has(p.id)).sort((a,b)=>a.name.localeCompare(b.name,'de'));
  const M=svModal(`<div class="mhead"><div><h2 style="margin:0">Spieler der Zweiten aus dem Datenbestand</h2><div class="msub">Name, Jahrgang, Position und Fuß werden übernommen und bleiben mit dem Profil verknüpft.</div></div></div>
    ${L.length?`<div class="svt-pick">${L.map(p=>`<label><input type="checkbox" value="${svEsc(p.id)}" checked> <b>${svEsc(p.name)}</b> <span>${svEsc(p.pos||'')}${p.geb?' · Jg. '+svEsc(String(p.geb).slice(0,4)):''}</span></label>`).join('')}</div>
      <div class="btnrow sbact"><button class="btn" id="svtOk">Übernehmen</button><button class="btn ghost" id="svtX">Abbrechen</button></div>`:'<div class="empty">Alle Spieler der Zweiten stehen schon im Kader.</div>'}`);
  const ok=M.querySelector('#svtOk'); if(!ok)return; M.querySelector('#svtX').onclick=()=>closeOverlay();
  ok.onclick=async()=>{ ok.disabled=true; let n=0; for(const i of [...M.querySelectorAll('input:checked')]){ const p=L.find(x=>x.id===i.value); if(!p)continue; const t=p.name.trim().split(/\s+/);
      const fuss=/links/i.test(p.fuss||'')?'links':/beid/i.test(p.fuss||'')?'beide':/rechts/i.test(p.fuss||'')?'rechts':'';
      try{ await svtRpc('team_spieler_save',{p:{mannschaft:SVT.team,saison:SVT.saison,vorname:t.slice(0,-1).join(' ')||t[0],nachname:t.length>1?t[t.length-1]:'?',jahrgang:p.geb?String(p.geb).slice(0,4):'',position:p.pos||'',kposition:p.pos||'',fuss,extern_id:p.id}}); n++; }catch(e){ svtErr(e); break; } }
    kToast('✓ '+n+' übernommen'); closeOverlay(); await svtReload(); };
}

/* Spieler: Akte über alle Jahre, Entwicklung, Saisonbericht */
async function svtSpielerModal(sid){
  const k=SVT.K.find(x=>x.spieler===sid); if(!k)return; const v=k.vereinsspieler, mini=svtStufe()==='mini';
  const M=svModal(`<div class="mhead"><div class="uav" style="width:46px;height:46px;border-radius:14px">${svEsc(svIni(svtSpieler(v)))}</div><div><h2 style="margin:0">${svEsc(svtSpieler(v))}${v.talent?' <span class="svt-star">★</span>':''}</h2>
      <div class="msub">${[v.jahrgang?'Jg. '+v.jahrgang:'',k.position||v.position,v.fuss?'Fuß '+v.fuss+(v.schwach?' · schwacher Fuß '+v.schwach+'/5':''):''].filter(Boolean).map(svEsc).join(' · ')}</div></div></div>
    <div class="btnrow"><button class="btn sm ghost" id="svtEd" type="button">Bearbeiten</button>${mini?'':`<button class="btn sm ghost" id="svtKi" type="button">${SVI('copy')} Für KI kopieren</button>`}
      <button class="btn sm ghost" id="svtAb" type="button">Abgang</button><button class="btn sm ghost" id="svtRaus" type="button">Aus dem Kader</button></div>
    ${v.notiz?`<p class="note">${svEsc(v.notiz)}</p>`:''}
    <div id="svtAkte"><div class="note">Lade Akte …</div></div>`);
  M.querySelector('#svtEd').onclick=()=>svtSpielerForm(sid);
  M.querySelector('#svtAb').onclick=()=>svtAbgang(sid);
  M.querySelector('#svtRaus').onclick=async()=>{ try{ await svtRpc('team_kader_raus',{p_m:SVT.team,p_saison:SVT.saison,p_spieler:sid}); kToast('Aus dem Kader genommen. Die Akte bleibt erhalten.'); closeOverlay(); await svtReload(); }catch(e){ svtErr(e); } };
  let akte=null; try{ akte=await svtRpc('spieler_akte',{p_spieler:sid}); }catch(e){ M.querySelector('#svtAkte').innerHTML='<div class="empty">'+svEsc(e.message)+'</div>'; return; }
  const ki=M.querySelector('#svtKi'); if(ki)ki.onclick=()=>kCopy(svtKiText(akte));
  const A=M.querySelector('#svtAkte'), S=akte.saisons||[];
  A.innerHTML=`<h4 class="svt-h4">Laufbahn im Verein</h4>
    <div class="svt-tw"><table class="svt-t"><thead><tr><th>Saison</th><th>Team</th><th>Training</th><th>o.G.</th>${mini?'':'<th>Sp.</th><th>Tore</th><th>Ein.</th>'}</tr></thead><tbody>
    ${S.map(s=>`<tr><td>${svtSL(s.saison)}</td><td>${svEsc(s.kurz)}${s.status==='gast'?' (Gast)':''}</td><td>${s.trainings?Math.round(s.da/s.trainings*100)+' % <small>'+s.da+'/'+s.trainings+'</small>':'–'}</td><td>${s.ohne||''}</td>
      ${mini?'':`<td>${s.spiele||''}</td><td>${s.tore||''}</td><td>${s.eindruecke?svtEinChip(+s.eindruck):'–'}</td>`}</tr>`).join('')}</tbody></table></div>
    ${mini?'':`<h4 class="svt-h4">Entwicklungsziele <button class="btn sm ghost" id="svtZ" type="button">${SVI('plus')} Ziel</button></h4>
    ${(akte.entwicklung||[]).map(e=>svtZielHtml(e)).join('')||'<p class="note">Noch keine Ziele.</p>'}
    <h4 class="svt-h4">Saisonbericht ${svtSL(SVT.saison)}</h4><div id="svtBer"></div>
    ${(akte.berichte||[]).filter(b=>!(b.saison===SVT.saison&&b.mannschaft===SVT.team)).map(b=>`<details class="svt-alt"><summary>Bericht ${svtSL(b.saison)} · ${svEsc(svtM(b.mannschaft).kurz)}</summary>${SVT_WERTE.map(([w,l])=>b.werte&&b.werte[w]?`<span class="svt-wv">${svEsc(l)} <b>${b.werte[w]}</b></span>`:'').join('')}<p>${svEsc(b.text||'')}</p></details>`).join('')}`}`;
  if(mini)return;
  M.querySelector('#svtZ').onclick=()=>svtZielForm(sid,null,()=>svtSpielerModal(sid));
  A.querySelectorAll('[data-svtz]').forEach(b=>b.onclick=()=>svtZielForm(sid,(akte.entwicklung||[]).find(e=>e.id===b.dataset.svtz),()=>svtSpielerModal(sid)));
  const ber=(akte.berichte||[]).find(b=>b.saison===SVT.saison&&b.mannschaft===SVT.team)||{werte:{},text:''}, W=Object.assign({},ber.werte||{});
  const bb=A.querySelector('#svtBer');
  bb.innerHTML=`<div class="svt-werte">${SVT_WERTE.map(([w,l])=>`<div><span>${svEsc(l)}</span><div class="svt-5" data-w="${w}">${[1,2,3,4,5].map(n=>`<button type="button" class="${W[w]>=n?'on':''}" data-n="${n}" aria-label="${svEsc(l)} ${n}">${n}</button>`).join('')}</div></div>`).join('')}</div>
    <textarea id="svtBT" rows="3" maxlength="1500" placeholder="Wie hat sich der Spieler entwickelt? Stärken, woran er arbeiten sollte.">${svEsc(ber.text||'')}</textarea>
    <div class="btnrow"><button class="btn sm" id="svtBS" type="button">Bericht speichern</button></div>`;
  bb.querySelectorAll('.svt-5').forEach(g=>g.querySelectorAll('button').forEach(b=>b.onclick=()=>{ const n=+b.dataset.n; W[g.dataset.w]=W[g.dataset.w]===n?undefined:n; g.querySelectorAll('button').forEach(x=>x.classList.toggle('on',W[g.dataset.w]>=+x.dataset.n)); }));
  bb.querySelector('#svtBS').onclick=async()=>{ const w={}; Object.entries(W).forEach(([a,b])=>{ if(b)w[a]=b; });
    try{ await svtRpc('team_bericht_save',{p_spieler:sid,p_saison:SVT.saison,p_m:SVT.team,p_werte:w,p_text:bb.querySelector('#svtBT').value}); kToast('✓ Bericht gespeichert'); }catch(e){ svtErr(e); } };
}
function svtZielHtml(e){ const kat=(e.uebungen||[]).map(k=>SVT_KAT.find(x=>x.k===k)).filter(Boolean);
  return `<div class="svt-ziel s-${svEsc(e.status)}"><div><b>${svEsc(e.ziel)}</b><span>${svEsc(SVT_THEMA[e.thema]||e.thema)} · ${{offen:'offen',laeuft:'läuft',erreicht:'erreicht',abgebrochen:'abgebrochen'}[e.status]||''}${e.faellig?' · bis '+svtDat(e.faellig):''}${e.saison?' · '+svtSL(e.saison):''}</span>
    ${e.massnahmen?`<p>${svEsc(e.massnahmen)}</p>`:''}${kat.length?`<div class="svt-links">${kat.map(x=>`<a href="${svEsc(x.u)}" target="_blank" rel="noopener">${svEsc(x.n)}</a>`).join('')}</div>`:''}</div>
    <button type="button" class="btn sm ghost" data-svtz="${svEsc(e.id)}">Bearbeiten</button></div>`; }
function svtZielForm(sid,e,nachher){
  e=e||{thema:'technik',status:'offen',uebungen:[]}; const kat=svtKat(SVT.team), sel=new Set(e.uebungen||[]);
  const spOpts=sid?'':`<div class="field" style="grid-column:1/-1"><label>Spieler</label><select name="spieler">${SVT.K.filter(k=>k.status!=='abgang').map(k=>`<option value="${svEsc(k.spieler)}">${svEsc(svtSpieler(k.vereinsspieler))}</option>`).join('')}</select></div>`;
  const M=svModal(`<div class="mhead"><div><h2 style="margin:0">${e.id?'Ziel bearbeiten':'Neues Entwicklungsziel'}</h2><div class="msub">Übungen aus offiziellen Quellen (DFB, fussball.de) passend zur Altersklasse.</div></div></div>
    <form id="svtZF" class="editgrid svt-form">${spOpts}
      <div class="field"><label>Bereich</label><select name="thema">${Object.entries(SVT_THEMA).map(([k,t])=>`<option value="${k}"${e.thema===k?' selected':''}>${svEsc(t)}</option>`).join('')}</select></div>
      <div class="field"><label>Status</label><select name="status">${[['offen','offen'],['laeuft','läuft'],['erreicht','erreicht'],['abgebrochen','abgebrochen']].map(([k,t])=>`<option value="${k}"${e.status===k?' selected':''}>${t}</option>`).join('')}</select></div>
      <div class="field" style="grid-column:1/-1"><label>Ziel</label><input name="ziel" required maxlength="200" placeholder="z.B. Mit links sicher passen" value="${svEsc(e.ziel||'')}"></div>
      <div class="field" style="grid-column:1/-1"><label>Was wir dafür tun</label><textarea name="massnahmen" rows="2" maxlength="800" placeholder="z.B. 10 Minuten Extra-Passen links nach jedem Training">${svEsc(e.massnahmen||'')}</textarea></div>
      <div class="field"><label>Bis wann</label><input name="faellig" type="date" value="${svEsc(e.faellig||'')}"></div>
      <div class="field" style="grid-column:1/-1"><label>Übungen</label><div class="svt-pick sm">${kat.map(x=>`<label><input type="checkbox" name="u" value="${x.k}"${sel.has(x.k)?' checked':''}> ${svEsc(x.n)} <span>${svEsc(SVT_THEMA[x.t])}</span></label>`).join('')}</div></div>
      <div class="btnrow sbact" style="grid-column:1/-1"><button class="btn" type="submit">Speichern</button>${e.id?'<button class="btn ghost" type="button" id="svtZD">Löschen</button>':''}<button class="btn ghost" type="button" id="svtX">Abbrechen</button></div></form>`);
  M.querySelector('#svtX').onclick=()=>nachher?nachher():closeOverlay();
  const del=M.querySelector('#svtZD'); if(del)del.onclick=async()=>{ try{ await svtRpc('entwicklung_delete',{p_id:e.id}); kToast('Ziel gelöscht'); await svtReload(); nachher?nachher():closeOverlay(); }catch(x){ svtErr(x); } };
  M.querySelector('#svtZF').onsubmit=async ev=>{ ev.preventDefault(); const fd=new FormData(ev.target);
    const p={id:e.id||'',spieler:sid||fd.get('spieler'),mannschaft:SVT.team,saison:SVT.saison,thema:fd.get('thema'),status:fd.get('status'),ziel:fd.get('ziel'),massnahmen:fd.get('massnahmen'),faellig:fd.get('faellig'),uebungen:fd.getAll('u')};
    try{ await svtRpc('entwicklung_save',{p}); kToast('✓ Ziel gespeichert'); await svtReload(); nachher?nachher():closeOverlay(); }catch(x){ svtErr(x); } };
}
function svtAbgang(sid){
  const k=SVT.K.find(x=>x.spieler===sid), v=k.vereinsspieler;
  const M=svModal(`<div class="mhead"><div><h2 style="margin:0">Abgang: ${svEsc(svtSpieler(v))}</h2><div class="msub">Der Spieler bleibt mit seiner ganzen Akte erhalten und steht danach unter „Ehemalige“.</div></div></div>
    <form id="svtAF" class="editgrid svt-form"><div class="field"><label>Seit</label><input name="d" type="date" required value="${svEsc(v.abgang_am||svtHeute())}"></div>
      <div class="field"><label>Neuer Verein (falls bekannt)</label><input name="v" maxlength="80" value="${svEsc(v.abgang_verein||'')}"></div>
      <div class="field" style="grid-column:1/-1"><label>Grund</label><input name="g" maxlength="120" placeholder="z.B. Wechsel zu einem NLZ, Umzug, hört auf" value="${svEsc(v.abgang_grund||'')}"></div>
      <div class="btnrow sbact" style="grid-column:1/-1"><button class="btn" type="submit">Speichern</button>${v.abgang_am?'<button class="btn ghost" type="button" id="svtAZ">Abgang zurücknehmen</button>':''}<button class="btn ghost" type="button" id="svtX">Abbrechen</button></div></form>`);
  M.querySelector('#svtX').onclick=()=>closeOverlay();
  const z=M.querySelector('#svtAZ'); if(z)z.onclick=async()=>{ try{ await svtRpc('team_spieler_abgang',{p_spieler:sid,p_datum:null,p_grund:null,p_verein:null}); closeOverlay(); await svtReload(); }catch(e){ svtErr(e); } };
  M.querySelector('#svtAF').onsubmit=async e=>{ e.preventDefault(); const fd=new FormData(e.target);
    try{ await svtRpc('team_spieler_abgang',{p_spieler:sid,p_datum:fd.get('d'),p_grund:fd.get('g'),p_verein:fd.get('v')}); kToast('✓ Abgang eingetragen'); closeOverlay(); await svtReload(); }catch(err){ svtErr(err); } };
}
/* Text für die eigene KI des Vereins: ohne Namen, nur Sportliches */
function svtKiText(a){
  const v=a.spieler||{}, L=[];
  L.push('Bitte beurteile die Entwicklung eines Jugendspielers unseres Vereins über die Jahre. Name weggelassen. Was fällt auf, wo liegen Stärken, woran sollte er arbeiten, wie ist sein Trainingsfleiß?');
  L.push(`Jahrgang ${v.jahrgang||'?'}, Position ${v.position||'?'}, starker Fuß ${v.fuss||'?'}${v.schwach?', schwacher Fuß '+v.schwach+' von 5':''}${v.talent?', vom Trainer als Talent markiert':''}.`);
  (a.saisons||[]).forEach(s=>L.push(`Saison ${svtSL(s.saison)}, ${s.name}: Training ${s.trainings?Math.round(s.da/s.trainings*100)+' % ('+s.da+' von '+s.trainings+', '+(s.ohne||0)+'x ohne Grund, '+(s.spaet||0)+'x zu spät)':'nicht erfasst'}, ${s.spiele||0} Einsätze, ${s.tore||0} Tore${s.eindruecke?', Eindruck der Trainer im Schnitt '+(+s.eindruck<=2.4?'positiv':+s.eindruck>=4.5?'negativ':'neutral')+' ('+s.eindruecke+' Bewertungen)':''}.`));
  (a.berichte||[]).forEach(b=>L.push(`Saisonbericht ${svtSL(b.saison)}: ${SVT_WERTE.filter(([w])=>b.werte&&b.werte[w]).map(([w,l])=>l+' '+b.werte[w]+'/5').join(', ')}${b.text?'. '+b.text:''}`));
  (a.entwicklung||[]).forEach(e=>L.push(`Ziel (${SVT_THEMA[e.thema]||e.thema}, ${e.status}): ${e.ziel}${e.massnahmen?'. Maßnahme: '+e.massnahmen:''}`));
  return L.join('\n');
}

/* ---------- Ehemalige ---------- */
async function svtEhemalige(B){
  B.innerHTML='<div class="card"><div class="empty">Lade …</div></div>';
  let L=[]; try{ L=await svtRpc('team_ehemalige',{})||[]; }catch(e){ B.innerHTML='<div class="card"><div class="empty">'+svEsc(e.message)+'</div></div>'; return; }
  const J=new Date().getFullYear(), P=typeof players!=='undefined'&&canScout()?players:[];
  const norm=s=>String(s||'').toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g,'').replace(/[^a-z]/g,'');
  const treffer=x=>{ if(!P.length||!x.jahrgang||J-x.jahrgang<18)return null; const n=norm(x.vorname+x.nachname);
    return P.find(p=>!p.own&&norm(p.name)===n&&(!p.geb||String(p.geb).slice(0,4)==String(x.jahrgang)))||null; };
  B.innerHTML=`<div class="card"><div class="svt-ch"><h3 class="trh">${SVI('eye')} Ehemalige <small>${L.length}</small></h3><button class="btn sm ghost" id="svtZur" type="button">Zurück zum Kader</button></div>
    <p class="note">Spieler, die den Verein verlassen haben. Talente stehen oben. Bei Erwachsenen zeigt die App, wo sie laut Datenbestand heute spielen (nur fürs Scouting-Team).</p>
    ${L.length?`<div class="svt-ehem">${L.map(x=>{ const t=treffer(x); return `<div class="svt-eh"><div><b>${svEsc(x.vorname+' '+x.nachname)}</b>${x.talent?' <span class="svt-star">★</span>':''}<span>Jg. ${svEsc(x.jahrgang||'?')} · zuletzt ${svEsc(x.zuletzt||'')} · weg seit ${svEsc(x.abgang_am?svtDat(x.abgang_am):'')}${x.abgang_verein?' · zu '+svEsc(x.abgang_verein):''}</span>${x.abgang_grund?`<em>${svEsc(x.abgang_grund)}</em>`:''}
      ${t?`<button type="button" class="svt-heute" data-svto="${svEsc(t.id)}">Heute: ${svEsc(t.club)}${t.liga?' ('+svEsc(t.liga)+')':''}${t.tore!=null?', '+t.tore+' Tore':''}</button>`:''}</div></div>`; }).join('')}</div>`:'<div class="empty">Noch keine Abgänge eingetragen.</div>'}</div>`;
  B.querySelector('#svtZur').onclick=()=>{ SVT.view='kader'; svtBody(); };
  B.querySelectorAll('[data-svto]').forEach(b=>b.onclick=()=>{ try{ openModal(b.dataset.svto); }catch(e){} });
}

/* ---------- Termine und Anwesenheit ---------- */
function svtTermine(B){
  const heute=svtHeute(), kommend=SVT.T.filter(t=>t.datum>=heute), vorbei=SVT.T.filter(t=>t.datum<heute).reverse();
  const row=t=>{ const a=SVT.A.filter(x=>x.termin===t.id), r=SVT.R.filter(x=>x.termin===t.id), da=a.filter(x=>x.status!=='weg').length;
    const info=a.length?`<span class="svt-cnt">${da}/${a.length} da</span>`:r.length?`<span class="svt-cnt">${r.filter(x=>x.antwort==='ja').length} ✓ · ${r.filter(x=>x.antwort==='nein').length} ✗</span>`:(t.datum<heute&&!t.abgesagt?'<span class="svt-cnt warn">nicht erfasst</span>':'');
    return `<button type="button" class="svt-trow a-${t.art}${t.abgesagt?' off':''}" data-svtt="${svEsc(t.id)}"><span class="svt-d">${svEsc(svtDat(t.datum))}${t.zeit?' · '+svEsc(t.zeit.slice(0,5)):''}</span>
      <b>${svEsc(SVT_ART[t.art])}${t.gegner?' gegen '+svEsc(t.gegner):''}${t.titel?' · '+svEsc(t.titel):''}${t.abgesagt?' (abgesagt)':''}</b>${t.tore_wir!=null&&t.tore_gegner!=null?`<span class="svt-erg">${t.tore_wir}:${t.tore_gegner}</span>`:''}${info}</button>`; };
  B.innerHTML=`<div class="card"><div class="svt-ch"><h3 class="trh">${SVI('clock')} Termine</h3><div class="btnrow">
      <button class="btn sm" id="svtNT" type="button">${SVI('plus')} Training</button><button class="btn sm ghost" id="svtNS" type="button">${SVI('plus')} Spiel</button>
      <button class="btn sm ghost" id="svtSer" type="button">${SVI('refresh')} Trainingszeiten</button></div></div>
    <h4 class="svt-h4">Demnächst</h4>${kommend.slice(0,20).map(row).join('')||'<p class="note">Keine Termine geplant. Leg die Trainingszeiten einmal als Serie an.</p>'}
    ${vorbei.length?`<h4 class="svt-h4">Vergangen</h4>${vorbei.slice(0,40).map(row).join('')}`:''}</div>`;
  B.querySelectorAll('[data-svtt]').forEach(b=>b.onclick=()=>svtTermin(b.dataset.svtt));
  B.querySelector('#svtNT').onclick=()=>svtTerminForm({art:'training'});
  B.querySelector('#svtNS').onclick=()=>svtTerminForm({art:'spiel'});
  B.querySelector('#svtSer').onclick=svtSerie;
}
function svtTerminForm(t){
  const neu=!t.id;
  const M=svModal(`<div class="mhead"><div><h2 style="margin:0">${neu?'Neuer Termin':'Termin bearbeiten'}</h2></div></div>
    <form id="svtTF" class="editgrid svt-form"><div class="field"><label>Art</label><select name="art">${Object.entries(SVT_ART).map(([k,l])=>`<option value="${k}"${t.art===k?' selected':''}>${l}</option>`).join('')}</select></div>
      <div class="field"><label>Datum</label><input name="datum" type="date" required value="${svEsc(t.datum||svtHeute())}"></div>
      <div class="field"><label>Uhrzeit</label><input name="zeit" type="time" value="${svEsc((t.zeit||'').slice(0,5))}"></div>
      <div class="field"><label>Gegner</label><input name="gegner" maxlength="80" value="${svEsc(t.gegner||'')}"></div>
      <div class="field"><label>Heim/Auswärts</label><select name="heim"><option value="">–</option><option value="true"${t.heim===true?' selected':''}>Heim</option><option value="false"${t.heim===false?' selected':''}>Auswärts</option></select></div>
      <div class="field"><label>Ort</label><input name="ort" maxlength="80" value="${svEsc(t.ort||'')}"></div>
      <div class="field" style="grid-column:1/-1"><label>Titel oder Hinweis</label><input name="titel" maxlength="80" placeholder="z.B. Hallenturnier, Treffpunkt 9:15" value="${svEsc(t.titel||'')}"></div>
      ${neu?'':`<div class="field"><label>Tore wir</label><input name="tore_wir" type="number" min="0" max="99" value="${svEsc(t.tore_wir??'')}"></div><div class="field"><label>Tore Gegner</label><input name="tore_gegner" type="number" min="0" max="99" value="${svEsc(t.tore_gegner??'')}"></div>`}
      <div class="btnrow sbact" style="grid-column:1/-1"><button class="btn" type="submit">Speichern</button>${neu?'':`<button class="btn ghost" type="button" id="svtTA">${t.abgesagt?'Wieder ansetzen':'Absagen'}</button><button class="btn ghost" type="button" id="svtTD">Löschen</button>`}<button class="btn ghost" type="button" id="svtX">Abbrechen</button></div></form>`);
  M.querySelector('#svtX').onclick=()=>closeOverlay();
  const ab=M.querySelector('#svtTA'); if(ab)ab.onclick=async()=>{ try{ await svtRpc('team_termin_save',{p:{id:t.id,abgesagt:!t.abgesagt}}); closeOverlay(); await svtReload(); }catch(e){ svtErr(e); } };
  const del=M.querySelector('#svtTD'); if(del)del.onclick=async()=>{ if(del.dataset.sure!=='1'){ del.dataset.sure='1'; del.textContent='Wirklich löschen?'; return; } try{ await svtRpc('team_termin_delete',{p_id:t.id}); closeOverlay(); await svtReload(); }catch(e){ svtErr(e); } };
  M.querySelector('#svtTF').onsubmit=async e=>{ e.preventDefault(); const fd=new FormData(e.target), p={mannschaft:SVT.team,saison:SVT.saison};
    for(const [k,v] of fd.entries())p[k]=String(v); if(p.heim==='')delete p.heim; if(t.id)p.id=t.id;
    try{ await svtRpc('team_termin_save',{p}); kToast('✓ Gespeichert'); closeOverlay(); await svtReload(); }catch(err){ svtErr(err); } };
}
function svtSerie(){
  const heute=svtHeute(), ende='20'+SVT.saison.slice(2)+'-06-30';
  const M=svModal(`<div class="mhead"><div><h2 style="margin:0">Trainingszeiten</h2><div class="msub">Legt die Trainings als Serie an. Tage, an denen schon ein Training steht, bleiben unberührt.</div></div></div>
    <form id="svtSF" class="editgrid svt-form"><div class="field" style="grid-column:1/-1"><label>Wochentage</label><div class="chips">${['Mo','Di','Mi','Do','Fr','Sa','So'].map((d,i)=>`<label class="svt-day"><input type="checkbox" name="tag" value="${i+1}"> ${d}</label>`).join('')}</div></div>
      <div class="field"><label>Uhrzeit</label><input name="zeit" type="time" required value="17:30"></div>
      <div class="field"><label>Ab</label><input name="von" type="date" required value="${heute}"></div>
      <div class="field"><label>Bis</label><input name="bis" type="date" required value="${svtAddD(heute,56)<ende?svtAddD(heute,56):ende}"></div>
      <div class="btnrow sbact" style="grid-column:1/-1"><button class="btn" type="submit">Anlegen</button><button class="btn ghost" type="button" id="svtX">Abbrechen</button></div></form>`);
  M.querySelector('#svtX').onclick=()=>closeOverlay();
  M.querySelector('#svtSF').onsubmit=async e=>{ e.preventDefault(); const fd=new FormData(e.target), tage=fd.getAll('tag').map(Number); if(!tage.length){ kToast('Bitte mindestens einen Tag wählen'); return; }
    try{ const n=await svtRpc('team_termin_serie',{p_m:SVT.team,p_saison:SVT.saison,p_tage:tage,p_zeit:fd.get('zeit'),p_von:fd.get('von'),p_bis:fd.get('bis')}); kToast('✓ '+n+' Trainings angelegt'); closeOverlay(); await svtReload(); }catch(err){ svtErr(err); } };
}
/* Anwesenheit eines Termins: vorbelegt aus den Rückmeldungen der Eltern */
function svtTermin(tid){
  const t=SVT.T.find(x=>x.id===tid); if(!t)return; const mini=svtStufe()==='mini', spiel=t.art!=='training';
  const K=SVT.K.filter(k=>k.status!=='abgang'), st={};
  K.forEach(k=>{ const a=SVT.A.find(x=>x.termin===tid&&x.spieler===k.spieler), r=SVT.R.find(x=>x.termin===tid&&x.spieler===k.spieler);
    st[k.spieler]=a?{status:a.status,grund:a.grund,eindruck:a.eindruck,einsatz:a.einsatz,tore:a.tore}:{status:r?(r.antwort==='nein'?'weg':r.antwort==='ja'?'da':''):'',grund:r&&r.grund||null,vor:!!r}; });
  const rm=k=>{ const r=SVT.R.find(x=>x.termin===tid&&x.spieler===k); return r?`<span class="svt-rm ${r.antwort}" title="Rückmeldung ${r.via==='link'?'über den Link':'vom Trainer'}">${r.antwort==='ja'?'✓ zugesagt':r.antwort==='nein'?'✗ '+svEsc(SVT_GRUND[r.grund]||'abgesagt'):'? vielleicht'}</span>`:''; };
  const M=svModal(`<div class="mhead"><div><h2 style="margin:0">${svEsc(SVT_ART[t.art])}${t.gegner?' gegen '+svEsc(t.gegner):''}</h2><div class="msub">${svEsc(svtDat(t.datum,true))}${t.zeit?' · '+svEsc(t.zeit.slice(0,5))+' Uhr':''}${t.ort?' · '+svEsc(t.ort):''}</div></div></div>
    <div class="btnrow"><button class="btn sm ghost" id="svtTE" type="button">Termin bearbeiten</button><button class="btn sm ghost" id="svtAlle" type="button">Alle da</button></div>
    <div class="svt-anw" id="svtAW"></div>
    <div class="btnrow sbact"><button class="btn" id="svtAS" type="button">${SVI('check')} Speichern</button><button class="btn ghost" id="svtX" type="button">Schließen</button></div>`);
  const W=M.querySelector('#svtAW');
  const draw=()=>{ W.innerHTML=K.map(k=>{ const s=st[k.spieler], id=svEsc(k.spieler);
    return `<div class="svt-ar${s.vor?' vor':''}"><div class="svt-an"><b>${svEsc(svtSpieler(k.vereinsspieler))}</b>${rm(k.spieler)}</div>
      <div class="svt-seg3" data-p="${id}">${[['da','da'],['spaet','spät'],['weg','fehlt']].filter(([x])=>!(mini&&x==='spaet')).map(([x,l])=>`<button type="button" class="${s.status===x?'on '+x:''}" data-s="${x}">${l}</button>`).join('')}</div>
      ${s.status==='weg'?`<select data-g="${id}" aria-label="Grund">${Object.entries(SVT_GRUND).map(([g,l])=>`<option value="${g}"${(s.grund||'ohne')===g?' selected':''}>${l}</option>`).join('')}</select>`:''}
      ${!mini&&s.status&&s.status!=='weg'?`<div class="svt-ei" data-p="${id}">${[[2,'+'],[3,'○'],[5,'−']].map(([n,l])=>`<button type="button" class="${s.eindruck===n?'on e'+n:''}" data-e="${n}" aria-label="Eindruck ${l}">${l}</button>`).join('')}</div>`:''}
      ${spiel&&!mini&&s.status&&s.status!=='weg'?`<select data-x="${id}" aria-label="Einsatz"><option value="">Einsatz</option>${[['start','Startelf'],['ein','eingewechselt'],['bank','Bank'],['nicht','nicht gespielt']].map(([x,l])=>`<option value="${x}"${s.einsatz===x?' selected':''}>${l}</option>`).join('')}</select><input data-t="${id}" type="number" min="0" max="30" inputmode="numeric" placeholder="Tore" value="${svEsc(s.tore??'')}" aria-label="Tore">`:''}</div>`; }).join('')||'<div class="empty">Noch niemand im Kader.</div>';
    W.querySelectorAll('.svt-seg3 [data-s]').forEach(b=>b.onclick=()=>{ const p=b.parentNode.dataset.p; st[p].status=st[p].status===b.dataset.s?'':b.dataset.s; st[p].vor=false; draw(); });
    W.querySelectorAll('.svt-ei [data-e]').forEach(b=>b.onclick=()=>{ const p=b.parentNode.dataset.p, n=+b.dataset.e; st[p].eindruck=st[p].eindruck===n?null:n; draw(); });
    W.querySelectorAll('[data-g]').forEach(s=>s.onchange=()=>{ st[s.dataset.g].grund=s.value; });
    W.querySelectorAll('[data-x]').forEach(s=>s.onchange=()=>{ st[s.dataset.x].einsatz=s.value||null; });
    W.querySelectorAll('[data-t]').forEach(s=>s.oninput=()=>{ st[s.dataset.t].tore=s.value===''?null:+s.value; }); };
  draw();
  M.querySelector('#svtX').onclick=()=>closeOverlay();
  M.querySelector('#svtTE').onclick=()=>svtTerminForm(t);
  M.querySelector('#svtAlle').onclick=()=>{ K.forEach(k=>{ if(!st[k.spieler].status){ st[k.spieler].status='da'; st[k.spieler].vor=false; } }); draw(); };
  M.querySelector('#svtAS').onclick=async()=>{
    const hatte=new Set(SVT.A.filter(a=>a.termin===tid).map(a=>a.spieler));
    const p=K.filter(k=>st[k.spieler].status||hatte.has(k.spieler)).map(k=>{ const s=st[k.spieler]; return {spieler:k.spieler,status:s.status||null,grund:s.status==='weg'?(s.grund||'ohne'):null,eindruck:s.status&&s.status!=='weg'?s.eindruck:null,einsatz:spiel?s.einsatz:null,tore:spiel?s.tore:null}; });
    try{ await svtRpc('team_anwesenheit_save',{p_termin:tid,p}); kToast('✓ Anwesenheit gespeichert'); closeOverlay(); await svtReload(); }catch(e){ svtErr(e); } };
}

/* ---------- Aufstellung (volle Ausstattung und Basis) ---------- */
function svtSpielerZahl(){ const a=svtAk(SVT.team); return a==='e'?7:a==='d'?9:11; }
async function svtAufstellung(B){
  const heute=svtHeute(), spiele=SVT.T.filter(t=>t.art!=='training'&&!t.abgesagt), naechstes=spiele.find(t=>t.datum>=heute)||spiele[spiele.length-1];
  if(!spiele.length){ B.innerHTML='<div class="card"><div class="empty">Noch kein Spiel eingetragen. Unter Termine ein Spiel anlegen, dann hier die Aufstellung planen.</div></div>'; return; }
  if(!SVT.sel||!spiele.some(t=>t.id===SVT.sel))SVT.sel=naechstes.id;
  const t=spiele.find(x=>x.id===SVT.sel), n=svtSpielerZahl();
  const {data}=await SVB.sb.from('team_aufstellung').select('*').eq('termin',t.id).maybeSingle();
  const A=data||{formation:SVT_FORM[n][0],slots:{},bank:[]}; let form=SVT_FORM[n].includes(A.formation)?A.formation:SVT_FORM[n][0]; const slots=Object.assign({},A.slots||{}), bank=new Set(A.bank||[]);
  const K=SVT.K.filter(k=>k.status!=='abgang'), rm=id=>{ const r=SVT.R.find(x=>x.termin===t.id&&x.spieler===id); return r?r.antwort:''; };
  const draw=()=>{
    const reihen=[1,...form.split('-').map(Number)], used=new Set(Object.values(slots).filter(Boolean)); let i=0;
    const opt=cur=>`<option value="">–</option>`+K.map(k=>{ const a=rm(k.spieler); return `<option value="${svEsc(k.spieler)}"${cur===k.spieler?' selected':''}${used.has(k.spieler)&&cur!==k.spieler?' disabled':''}>${svEsc(svtSpieler(k.vereinsspieler))}${a==='ja'?' ✓':a==='nein'?' ✗':''}</option>`; }).join('');
    const rows=reihen.map(z=>{ const cells=[]; for(let j=0;j<z;j++){ const key=String(i++); cells.push(`<select class="svt-slot" data-svts="${key}" aria-label="Position ${key}">${opt(slots[key]||'')}</select>`); } return `<div class="svt-reihe">${cells.join('')}</div>`; });
    B.innerHTML=`<div class="card"><div class="svt-ch"><h3 class="trh">${SVI('pitch')} Aufstellung</h3>
        <select id="svtSp" aria-label="Spiel">${spiele.map(s=>`<option value="${svEsc(s.id)}"${s.id===t.id?' selected':''}>${svEsc(svtDat(s.datum))}${s.gegner?' · '+svEsc(s.gegner):''}</option>`).join('')}</select>
        <select id="svtFo" aria-label="Formation">${SVT_FORM[n].map(f=>`<option${f===form?' selected':''}>${f}</option>`).join('')}</select></div>
      <p class="note small">${n}er-Feld. ✓ zugesagt, ✗ abgesagt (aus den Rückmeldungen). Sturm oben, Torwart unten.</p>
      <div class="svt-feld">${rows.reverse().join('')}</div>
      <h4 class="svt-h4">Bank</h4><div class="svt-bank">${K.filter(k=>!used.has(k.spieler)).map(k=>`<button type="button" class="${bank.has(k.spieler)?'on':''}" data-b="${svEsc(k.spieler)}">${svEsc(svtSpieler(k.vereinsspieler))}${rm(k.spieler)==='nein'?' ✗':''}</button>`).join('')}</div>
      <div class="btnrow sbact"><button class="btn" id="svtAufS" type="button">${SVI('check')} Speichern</button></div></div>`;
    B.querySelector('#svtSp').onchange=e=>{ SVT.sel=e.target.value; svtAufstellung(B); };
    B.querySelector('#svtFo').onchange=e=>{ form=e.target.value; draw(); };
    B.querySelectorAll('[data-svts]').forEach(s=>s.onchange=()=>{ if(s.value)bank.delete(s.value); slots[s.dataset.svts]=s.value||undefined; draw(); });
    B.querySelectorAll('[data-b]').forEach(b=>b.onclick=()=>{ const id=b.dataset.b; bank.has(id)?bank.delete(id):bank.add(id); b.classList.toggle('on'); });
    B.querySelector('#svtAufS').onclick=async()=>{ const s={}; const max=reihen.reduce((a,b)=>a+b,0); Object.entries(slots).forEach(([k,v])=>{ if(v&&+k<max)s[k]=v; });
      try{ await svtRpc('team_aufstellung_save',{p_termin:t.id,p_formation:form,p_slots:s,p_bank:[...bank].filter(x=>!Object.values(s).includes(x)),p_notiz:null}); kToast('✓ Aufstellung gespeichert'); }catch(e){ svtErr(e); } };
  };
  draw();
}

/* ---------- Statistik ---------- */
function svtStatistik(B){
  const R=SVT.K.filter(k=>k.status!=='abgang').map(k=>({k,s:svtStat(k.spieler)}));
  const sort=SVT.statSort||'quote'; R.sort((a,b)=>sort==='name'?svtSpieler(a.k.vereinsspieler).localeCompare(svtSpieler(b.k.vereinsspieler),'de'):sort==='ein'?((a.s.avg??9)-(b.s.avg??9)):sort==='tore'?(b.s.tore-a.s.tore):((b.s.quote??-1)-(a.s.quote??-1)));
  const tr=SVT.T.filter(t=>t.art==='training'&&t.datum<=svtHeute()&&!t.abgesagt), erf=new Set(SVT.A.map(a=>a.termin)), nErf=tr.filter(t=>erf.has(t.id)).length;
  const auff=R.filter(x=>x.s.n>=6&&(x.s.quote<.6||x.s.ohne>=3||(x.s.l6!=null&&x.s.quote!=null&&x.s.l6<x.s.quote-.25)));
  B.innerHTML=`<div class="card"><h3 class="trh">${SVI('chart')} Statistik ${svtSL(SVT.saison)} <small>${nErf} von ${tr.length} Trainings erfasst</small></h3>
    ${auff.length?`<div class="svt-hint"><b>Auffällig:</b> ${auff.map(x=>`${svEsc(svtSpieler(x.k.vereinsspieler))} (${x.s.quote<.6?'nur '+svtPct(x.s.quote)+' Training':x.s.ohne>=3?x.s.ohne+'× ohne Grund':'zuletzt deutlich seltener da'})`).join(', ')}</div>`:''}
    <div class="svt-tw"><table class="svt-t"><thead><tr><th data-so="name">Name</th><th data-so="quote">Training</th><th>letzte 6</th><th>spät</th><th>o.G.</th><th>Sp.</th><th data-so="tore">Tore</th><th data-so="ein">Ein.</th></tr></thead><tbody>
    ${R.map(({k,s})=>`<tr data-svtp="${svEsc(k.spieler)}"><td><b>${svEsc(svtSpieler(k.vereinsspieler))}</b></td><td class="${s.n>=6&&s.quote<.6?'svt-warn':''}">${svtPct(s.quote)} <small>${s.da}/${s.n}</small></td><td>${svtPct(s.l6)}</td><td>${s.spaet||''}</td><td>${s.ohne||''}</td><td>${s.einsatz||''}</td><td>${s.tore||''}</td><td>${svtEinChip(s.avg)}</td></tr>`).join('')}</tbody></table></div>
    <p class="note small">Training zählt nur Einheiten, bei denen die Anwesenheit erfasst ist. Die Akte eines Spielers zeigt alle Jahre im Verein.</p></div>`;
  B.querySelectorAll('[data-so]').forEach(th=>{ th.style.cursor='pointer'; th.onclick=()=>{ SVT.statSort=th.dataset.so; svtStatistik(B); }; });
  B.querySelectorAll('[data-svtp]').forEach(r=>r.onclick=()=>svtSpielerModal(r.dataset.svtp));
}

/* ---------- Entwicklung und Übungen ---------- */
function svtEntwicklung(B){
  const mini=svtStufe()==='mini', kat=svtKat(SVT.team), E=SVT.E, nm=id=>{ const k=SVT.K.find(x=>x.spieler===id); return k?svtSpieler(k.vereinsspieler):''; };
  const offen=E.filter(e=>e.status==='offen'||e.status==='laeuft');
  B.innerHTML=`${mini?'':`<div class="card"><div class="svt-ch"><h3 class="trh">${SVI('sprout')} Entwicklungsziele <small>${offen.length} offen</small></h3><button class="btn sm" id="svtZN" type="button">${SVI('plus')} Ziel</button></div>
      ${offen.map(e=>`<div class="svt-zw"><span class="svt-zn">${svEsc(nm(e.spieler))}</span>${svtZielHtml(e)}</div>`).join('')||'<p class="note">Noch keine offenen Ziele. Ein Ziel je Spieler reicht für den Anfang, z.B. „schwacher Fuß“ oder „Kopfball“.</p>'}</div>`}
    <div class="card"><h3 class="trh">${SVI('book')} Übungen für die ${svEsc(svtM(SVT.team).kurz)}</h3>
      <p class="note">Offizielle Trainingseinheiten und Empfehlungen von DFB und fussball.de, passend zur Altersklasse. Öffnet in einem neuen Fenster.</p>
      ${Object.entries(SVT_THEMA).map(([t,l])=>{ const L=kat.filter(x=>x.t===t); return L.length?`<h4 class="svt-h4">${svEsc(l)}</h4><div class="svt-links">${L.map(x=>`<a href="${svEsc(x.u)}" target="_blank" rel="noopener">${svEsc(x.n)}</a>`).join('')}</div>`:''; }).join('')}
      <h4 class="svt-h4">Alle Einheiten der Altersklasse</h4><div class="svt-links"><a href="${svEsc(svtEinheiten(SVT.team))}" target="_blank" rel="noopener">DFB Training online: ${svEsc(svtM(SVT.team).kurz)}</a></div></div>`;
  const zn=B.querySelector('#svtZN'); if(zn)zn.onclick=()=>svtZielForm(null,null,null);
  B.querySelectorAll('[data-svtz]').forEach(b=>b.onclick=()=>svtZielForm(null,E.find(e=>e.id===b.dataset.svtz),null));
}

/* ---------- Abstimmung per Gruppenlink ---------- */
async function svtAbstimmung(B){
  const m=svtM(SVT.team), an=!!m.abstimmung, heute=svtHeute(), bis=svtAddD(heute,14);
  const T=SVT.T.filter(t=>t.datum>=heute&&t.datum<=bis&&!t.abgesagt), K=SVT.K.filter(k=>k.status!=='abgang');
  let link=''; if(an){ try{ const tok=await svtRpc('team_gruppenlink',{p_m:SVT.team,p_neu:false}); link=svtLinkUrl(tok); }catch(e){ svtErr(e); } }
  const txt=`Zu- und Absagen für die ${m.name}: Link öffnen, Namen des Kindes antippen, fertig.\n${link}`;
  B.innerHTML=`<div class="card"><div class="svt-ch"><h3 class="trh">${SVI('send')} Abstimmung per Gruppenlink</h3>
      <button type="button" class="svr-sw${an?' on':''}" role="switch" aria-checked="${an}" aria-label="Abstimmung" id="svtAb"><i></i></button></div>
    <p class="note">Ein Link für die Eltern-Gruppe. Eltern tippen den Namen ihres Kindes und sagen zu oder ab, mit Grund (krank, verletzt, Urlaub). Es werden keine Nummern oder Mails gespeichert. ${m.stufe==='voll'?'':'Für jüngere Jahrgänge ist das freiwillig.'}</p>
    ${an&&link?`<div class="linkbox"><code>${svEsc(link)}</code><div class="btnrow"><a class="btn" href="https://wa.me/?text=${encodeURIComponent(txt)}" target="_blank" rel="noopener">${SVI('chat')} In die Gruppe</a><button class="btn ghost" id="svtLC" type="button">${SVI('copy')} Kopieren</button><button class="btn ghost" id="svtLN" type="button">${SVI('refresh')} Neuer Link</button></div>
      <p class="note small">„Neuer Link“ macht den alten sofort ungültig, z.B. wenn er in falsche Hände geraten ist.</p></div>`:''}</div>
    ${an?`<div class="card"><h3 class="trh">${SVI('clock')} Die nächsten 14 Tage</h3>${T.map(t=>{ const R=SVT.R.filter(r=>r.termin===t.id), ja=R.filter(r=>r.antwort==='ja'), nein=R.filter(r=>r.antwort==='nein'), offen=K.filter(k=>!R.some(r=>r.spieler===k.spieler));
      const nm=id=>{ const k=K.find(x=>x.spieler===id); return k?svtSpieler(k.vereinsspieler):'?'; };
      return `<details class="svt-abst"><summary><b>${svEsc(svtDat(t.datum))} · ${svEsc(SVT_ART[t.art])}${t.gegner?' gegen '+svEsc(t.gegner):''}</b><span><i class="ja">${ja.length} ✓</i><i class="nein">${nein.length} ✗</i><i>${offen.length} offen</i></span></summary>
        <p><b>Dabei:</b> ${ja.map(r=>svEsc(nm(r.spieler))).join(', ')||'–'}</p><p><b>Abgesagt:</b> ${nein.map(r=>svEsc(nm(r.spieler))+' ('+svEsc(SVT_GRUND[r.grund]||'')+')').join(', ')||'–'}</p><p><b>Offen:</b> ${offen.map(k=>svEsc(svtSpieler(k.vereinsspieler))).join(', ')||'–'}</p>
        <button type="button" class="btn sm ghost" data-svtt="${svEsc(t.id)}">Anwesenheit öffnen</button></details>`; }).join('')||'<p class="note">Keine Termine in den nächsten 14 Tagen.</p>'}</div>`:''}`;
  B.querySelector('#svtAb').onclick=async()=>{ try{ await svtRpc('team_abstimmung_set',{p_m:SVT.team,p_an:!an}); await svrLoad(true); svtAbstimmung(B); }catch(e){ svtErr(e); } };
  const lc=B.querySelector('#svtLC'); if(lc)lc.onclick=()=>kCopy(txt);
  const ln=B.querySelector('#svtLN'); if(ln)ln.onclick=async()=>{ if(ln.dataset.sure!=='1'){ ln.dataset.sure='1'; ln.textContent='Alten Link wirklich ungültig machen?'; return; } try{ await svtRpc('team_gruppenlink',{p_m:SVT.team,p_neu:true}); kToast('✓ Neuer Link erstellt'); svtAbstimmung(B); }catch(e){ svtErr(e); } };
  B.querySelectorAll('[data-svtt]').forEach(b=>b.onclick=()=>svtTermin(b.dataset.svtt));
}
function svtLinkUrl(tok){ return svBasis()+'team.html#m='+tok; }

/* =====================================================================
   Sportzentrale Beta 0.23 · Wischen überall, wo es sich anbietet
   Gleiche Regel wie in den Spielerlisten: nach RECHTS wischen = raus / weg, nach LINKS = weiter / ja.
   Beim Ziehen steht immer dran, was passiert. Alles lässt sich rückgängig machen.
   - Bedarf: Kandidat rechts = raus aus dem Bedarf, links = nächste Stufe (Beobachten, Shortlist, Kontakt)
   - Bedarf: Vorschlag oder interne Lösung links = als Kandidat übernehmen, rechts = ausblenden
   - Teams: Spieler rechts = aus dem Kader, links = Talent merken
   - Teams: Termin rechts = absagen (oder wieder ansetzen), links = alle da (vergangene Einheit)
   - Teams: Entwicklungsziel links = erreicht, rechts = löschen
   ===================================================================== */
const SWX={on:null,just:0,reg:[]};
function swxAdd(sel,what){ SWX.reg.push({sel,what}); }
function swxFind(t){ for(const r of SWX.reg){ const el=t.closest&&t.closest(r.sel); if(el)return {el,r}; } return null; }
const swxSel=()=>SWX.reg.map(r=>r.sel).join(',');
// Diese Einträge regelt ab jetzt dieses Modul (nicht mehr die Spielerlisten-Regel)
{ const _w=sw45What; sw45What=function(el){ if(el.matches('.bk4r,.sg4c'))return null; return _w.apply(this,arguments); }; }

function swxBg(el,A){
  const par=el.parentElement; if(!par)return null;
  if(getComputedStyle(par).position==='static')par.style.position='relative';
  const bg=document.createElement('div'); bg.className='sw45bg swxbg';
  bg.style.cssText=`top:${el.offsetTop}px;left:${el.offsetLeft}px;width:${el.offsetWidth}px;height:${el.offsetHeight}px;border-radius:${getComputedStyle(el).borderRadius}`;
  bg.innerHTML=`${A.r?`<span class="sw45r t-${A.r.tone||'no'}"><b>${A.r.ic||''}</b>${svEsc(A.r.t)}</span>`:''}${A.l?`<span class="sw45l t-${A.l.tone||'ok'}">${svEsc(A.l.t)}<b>${A.l.ic||''}</b></span>`:''}`;
  par.insertBefore(bg,el); return bg;
}
document.addEventListener('pointerdown',e=>{
  if(e.button>0||SWX.on)return;
  const f=swxFind(e.target); if(!f)return;
  if(e.target.closest('input,select,textarea,[contenteditable],.noswipe'))return;
  SWX.on={el:f.el,r:f.r,x:e.clientX,y:e.clientY,t:performance.now(),dx:0,axis:null,id:e.pointerId,bg:null,A:null,passed:false};
},true);
