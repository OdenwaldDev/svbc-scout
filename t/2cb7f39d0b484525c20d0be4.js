  training:['Mannschaft','Training, Spiele, Verletzungen, Abstimmungen und Kontakte'],kabine:['Mannschaft','Abstimmungen, Kontakte und Automatik'],kasse:['Mannschaftskasse','Strafen, Beiträge, Kassenstand'],
  gegner:['Spieltag','Gegnercheck: der nächste Gegner in Zahlen'],totw:['Spieltag','Elf der Woche: wer ist gerade in Form?'],ejugend:['Eigene Jugend','A- und B-Jugend: Statistik, Entwicklung, Einschätzungen der Trainer'],
  play:['Wissen','Playbook: wie datenbasierte Klubs Kader bauen'],model:['Wissen','Modell: so rechnet die App'],verein:['Verein','Rankings, Helfer & Veranstaltungen, Allzeit-Statistik und Legenden']});
Object.assign(SV_TBL,{kader:['pitch','Kader'],training:['activity','Mannschaft'],gegner:['target','Spieltag'],kasse:['wallet','Kasse'],ejugend:['sprout','Jugend'],play:['book','Wissen'],scout:['search','Scouting']});
Object.assign(SV_TABBAR,{trainer:['home','training','gegner','kader'],planer:['home','kader','scout','training'],vorstand:['home','kader','scout','verein'],admin:['home','kader','scout','training'],viewer:['home','scout','verein']});
Object.assign(SV_SIDE,{
  trainer:['Übersicht','Mannschaft','Kader','Scouting','Nachwuchs','Verein','Wissen','Verwaltung'],
  planer:['Übersicht','Kader','Scouting','Mannschaft','Nachwuchs','Verein','Wissen','Verwaltung'],
  vorstand:['Übersicht','Kader','Scouting','Mannschaft','Nachwuchs','Verein','Wissen','Verwaltung'],
  admin:['Übersicht','Kader','Scouting','Mannschaft','Nachwuchs','Verein','Wissen','Verwaltung'],
  viewer:['Übersicht','Scouting','Verein','Nachwuchs','Mannschaft','Kader','Wissen','Verwaltung']});
for(const k in SV_TAB_ORDER)delete SV_TAB_ORDER[k];
{ const _ta4=svTabAllowed; svTabAllowed=function(t){
  if(['kader','gespr','bedarf','sxi','kaderplan','elf'].includes(t))return sv4Can()||(t==='elf'&&!svGast());
  if(['training','kabine','kasse'].includes(t))return typeof canTraining==='function'&&canTraining()||(t==='kasse'&&!svGast());
  if(t==='ejugend')return sv4Jugend();
  return _ta4(t); }; }
function sv4Jugend(){ const r=svRole(); return ['admin','vorstand','planer','trainer'].includes(r)||(typeof svAufgaben==='function'&&svAufgaben().includes('jugend')); }
function sv4Sub(tab){ if(tab==='training')return 'training:'+((typeof TR!=='undefined'&&TR.view)||'home'); if(tab==='kabine')return 'kabine:'+((typeof KB!=='undefined'&&KB.view)||'abst'); if(tab==='db')return 'scout'; if(tab==='gems')return 'radar'; return tab; }
function sv4HubBar(tab){
  const bar=document.getElementById('hubbar'); if(!bar)return;
  const kasse=tab==='kabine'&&typeof KB!=='undefined'&&KB.view==='kasse';
  const hk=kasse?null:SV4_OF[tab], H=hk&&SV4_HUB[hk];
  document.body.classList.toggle('hub-on',!!H); document.body.classList.toggle('kasse-on',!!kasse);
  if(!H){ bar.innerHTML=''; bar.hidden=true; return; }
  const cur=sv4Sub(tab);
  const tabs=H.tabs.filter(([k])=>{ const t=k.split(':')[0]; if(!svTabAllowed(t))return false; if(k==='kabine:kontakte'||k==='kabine:link'||k==='kabine:abst')return canTraining(); return true; });
  bar.hidden=false;
  bar.innerHTML=`<div class="hub-in" role="tablist" aria-label="${sv4Esc(H.t)}">${tabs.map(([k,l])=>`<button type="button" role="tab" class="${k===cur?'on':''}" aria-selected="${k===cur}" data-hub="${k}">${sv4Esc(l)}${k==='kandidaten'?'<span class="cnt" data-cnt="kandidaten" style="display:none"></span>':''}${k==='radar'?'<span class="cnt" data-cnt="radar" style="display:none"></span>':''}</button>`).join('')}</div>`;
  bar.querySelectorAll('[data-hub]').forEach(b=>b.onclick=()=>sv4Go(b.dataset.hub));
  const on=bar.querySelector('.on'); if(on&&on.scrollIntoView)try{ on.scrollIntoView({inline:'center',block:'nearest'}); }catch(e){}
  try{ svBadges(); }catch(e){} try{ if(typeof vrBadge==='function')vrBadge(); }catch(e){}
}
function sv4Go(k){
  const [t,v]=k.split(':');
  if(t==='training'&&v&&typeof TR!=='undefined')TR.view=v;
  if(t==='kabine'&&v&&typeof KB!=='undefined')KB.view=v;
  goTab(t);
}
{ const _gt40=goTab; goTab=function(tab){
  if(tab==='kasse'){ if(typeof KB!=='undefined')KB.view='kasse'; tab='kabine'; }
  else if(tab==='mannschaft')tab='training'; else if(tab==='spieltag')tab='gegner'; else if(tab==='scouting')tab='scout'; else if(tab==='wissen')tab='play';
  const r=_gt40(tab);
  try{
    const cur=svCurTab(), kasse=cur==='kabine'&&typeof KB!=='undefined'&&KB.view==='kasse';
    const hk=SV4_OF[cur], side=kasse?'kasse':(hk?SV4_SIDEKEY[hk]:cur);
    document.querySelectorAll('.snav button[data-tab]').forEach(x=>x.classList.toggle('active',x.dataset.tab===side));
    document.querySelectorAll('.tabbar .ti').forEach(x=>x.classList.toggle('active',x.dataset.tab===side));
    document.querySelectorAll('.sgrid [data-sheet]').forEach(b=>b.classList.toggle('active',b.dataset.sheet===side));
    const mb=document.getElementById('tMore'); if(mb)mb.classList.toggle('on',!document.querySelector('.tabbar .ti.active'));
    const m=SV_PAGES[kasse?'kasse':cur]||['','']; const h=document.getElementById('pgTitle'), s=document.getElementById('pgSub');
    if(h)h.textContent=m[0]; if(s)s.textContent=m[1]; document.title=m[0]+' · '+SV4.name;
    sv4HubBar(cur);
    if(['kader','gespr','bedarf','kandidaten'].includes(cur)&&sv4Can())sv4Load(!SV4.loaded?false:Date.now()-(SV4._lt||0)>60000).then(()=>{ SV4._lt=Date.now(); });
  }catch(e){ console.warn('Navigation 4.0',e); }
  return r;
}; }
/* Kasse direkt öffnen, ohne dass die Kabine auf „Abstimmungen“ springt */
{ const _kr4=typeof kbRender==='function'?kbRender:null; if(_kr4)kbRender=function(){ const r=_kr4.apply(this,arguments); try{ sv4HubBar('kabine'); }catch(e){} return r; }; }
{ const _tr4=typeof trRender==='function'?trRender:null; if(_tr4)trRender=function(){ const r=_tr4.apply(this,arguments); try{ if(svCurTab()==='training')sv4HubBar('training'); }catch(e){} return r; }; }
/* Seitenleiste & Mehr-Menü: nur, was die Rolle auch öffnen darf; leere Gruppen ausblenden */
function sv4NavVis(){
  try{
    document.querySelectorAll('.snav button[data-tab],.sgrid [data-sheet]').forEach(b=>{ const t=b.dataset.tab||b.dataset.sheet; if(t==='admin')return; b.style.display=svTabAllowed(t==='kasse'?'kasse':t)?'':'none'; });
    document.querySelectorAll('.snav .sgrp').forEach(h=>{ let n=h.nextElementSibling, any=false; while(n&&!n.classList.contains('sgrp')){ if(n.style.display!=='none')any=true; n=n.nextElementSibling; } h.style.display=any?'':'none'; });
    document.querySelectorAll('#moreSheet h4').forEach(h=>{ const g=h.nextElementSibling; const any=g&&[...g.children].some(b=>b.style.display!=='none'); h.style.display=any?'':'none'; if(g)g.style.display=any?'':'none'; });
  }catch(e){ console.warn('Navigation',e); }
}
if(typeof svPrefsLoad==='function'){ const _pl4=svPrefsLoad; svPrefsLoad=async function(){ const r=await _pl4.apply(this,arguments); try{ sv4NavVis(); }catch(e){} return r; }; }

/* =====================================================================
   SV/BSC Sportzentrale 4.0 · Spielerprofil neu (Lukas' Punkte 2–5)
   - Oben nur, was ein Kaderplaner sofort braucht: Beziehung zum Verein, Karte mit Eye-Test, MScore, Einsätze (wann/wo/für wen), Zukunft
   - Alles andere eingeklappt; jeder Wert mit Info-i (Quelle, automatisch/manuell, Stand, Grundlage)
   - Eye-Test: 6 Kategorien, jeder bewertet selbst, Karte zeigt den Schnitt
   - Ein Bearbeiten-Weg statt drei; nach dem Speichern bleibt das Profil offen
   ===================================================================== */
const PF4={open:new Set(),eyeOpen:false,lastId:null};
const PF4_SEC={own:['kader','train','stat','score','bogen','kontakt','presse','edit'],ext:['kand','stat','score','wechsel','bogen','presse','kontakt','edit']};

/* ---------- Karte: Eye-Test statt Datenwerten, sobald bewertet ---------- */
{ const _sr4=scRate; scRate=function(p){ const R=_sr4(p); try{ if(!p.isJugend){ const E=sv4Eye(p.id); if(E){ R.st=SV4_EYE.map(([k,,ab])=>[ab,E.avg[k]==null?null:Math.min(99,Math.round(E.avg[k]*10))]); R.eye=E; } } }catch(e){} return R; }; }

{ const _om40=openModal; openModal=function(id){
  const M=document.getElementById('modal'); const same=!!(M&&M.dataset.pf4===id&&M.querySelector('.pf4')); const sc=same?M.scrollTop:0;
  if(!same&&PF4.lastId!==id){ PF4.open=new Set(); PF4.eyeOpen=false; }
  const r=_om40.apply(this,arguments);
  try{ pf4Build(id); if(same)M.scrollTop=sc; else M.scrollTop=0; }catch(e){ console.warn('Profil 4.0',e); }
  return r; }; }
function pf4Refresh(id){ try{ openModal(id); }catch(e){ console.warn(e); } }

function pf4Chip(t,cls,title){ return `<span class="c4 ${cls||''}"${title?` title="${sv4Esc(title)}"`:''}>${t}</span>`; }
function pf4Build(id){
  const M=document.getElementById('modal'), p=sv4P(id); if(!M||!p||M.querySelector('.pf4'))return;
  M.dataset.pf4=id; PF4.lastId=id;
  const s=scores(p), own=!!sv4Team(p), team=sv4Can(), B=sv4Bez(p), nx=sv4SAdd(sv4S(),1);
  const $q=sel=>M.querySelector(sel), take=sel=>{ const el=M.querySelector(sel); return el||null; };
  const oldHead=take('.mhead'), fut=take('.fut-hero'), sbside=take('.sbwrap .sbside'), sbwrap=take('.sbwrap');
  const trprof=take('.card.trprof'), vrprof=take('.card.vrprof'), sc2=take('.sc2prof'), crm=take('#crmbar'), lat=take('#latopts'), crmnote=take('.crmnote');
  const mgrid=take('.mgrid'), proj=take('.proj'), d2=take('.d2col'), edit=take('.editsec'), kx=take('#kxBox'), svposBox=take('.svpos-box');
  const seas=[...M.querySelectorAll('.d2col .seas')], find=re=>seas.find(x=>re.test((x.querySelector('h4')||{}).textContent||''));
  const sEin=find(/Einordnung/), sWV=find(/Digital-Scout/);
  const press=[...M.querySelectorAll('.pressbox')];
  const hints=[];
  if(p.risiko)hints.push(['⚠️',sv4Esc(p.risiko),'warn']);
  if(p.info)hints.push(['💡',sv4Esc(p.info)]);
  if(p.adjTo!=null)hints.push(['🎯',`Insider-Rating ${p.adjTo}${s.adjBase!=null?` (Modell: ${sv4Num(s.adjBase,1)})`:''}${p.adjWhy?' · '+sv4Esc(String(p.adjWhy).replace(/^Insider-Rating[^:]*:\s*/,'').replace(/\s*Rating manuell.*$/,'')):''}`]);
  try{ gemsOf(p).forEach(g=>hints.push(['💎',`<b>${sv4Esc(g.k)}</b>: ${sv4Esc(g.t)}`])); }catch(e){}

  // ---- Kopf ----
  const ava=oldHead&&oldHead.querySelector('#mAva');
  const E=s.E||sv4Einsatz(p), s0=E.seasons[0];
  const alter=p.alter!=null?`${p.alter}${p.geb?'':' <i>(geschätzt)</i>'}`:'Alter unbekannt';
  const pos2=(p.pos2||[]).filter(x=>x!==p.pos);
  const kxk=typeof kxOf==='function'?kxOf(p.id):null, ortKm=kxk&&kxk.lat!=null?sv4Km(kxk.lat,kxk.lon):null;
  const bezCls={intern:'ok',verpflichtet:'ok',kontaktiert:'info',shortlist:'info',kandidat:'info',beobachtet:'mut',nein:'bad',extern:'mut'}[B.k]||'mut';
  const jetzt=typeof svLigaJetzt==='function'?svLigaJetzt(p):null, club=(jetzt&&jetzt.club)||p.club, liga=p.isJugend?(p.kurz||p.staffel||'Jugend'):svLigaText(p);
  const root=document.createElement('div'); root.className='pf4';
  root.innerHTML=`<section class="pf4-head">
      <div class="pf4-ava"></div>
      <div class="pf4-hm"><h2>${sv4Esc(p.name)}</h2>
        <div class="pf4-l1">${pf4Chip(sv4Esc(B.t)+(B.k==='intern'&&B.zt&&B.z!=='bleibt'?` · ${sv4SL(nx)}: ${sv4Esc(B.zt)}`:''),bezCls)}<span>${sv4Esc(club)} · ${sv4Esc(liga)}</span></div>
        <div class="pf4-l2">
          <span class="pf4-pos"><b>${sv4Esc(p.pos||'–')}</b>${pos2.length?`<i>auch ${sv4Esc(pos2.join(', '))}</i>`:''}</span>
          <span>${alter}</span>${p.fuss?`<span>${sv4Esc(p.fuss)}</span>`:''}
          <span title="Entfernung">${ortKm!=null?`📍 ${sv4Esc(kxk.ort)} · ≈ ${ortKm} km`:p.km!=null&&!own?`📍 Verein ≈ ${p.km} km`:kxk&&kxk.ort?`📍 ${sv4Esc(kxk.ort)}`:''}</span></div>
        <div class="pf4-act">${team?`<button class="btn sm" data-pf4="edit">${SVI('sliders')} Bearbeiten</button><button class="btn sm ghost" data-pf4="eye">${SVI('eye')} Eye-Test</button>`:''}
          ${team&&own?`<button class="btn sm ghost" data-pf4="gespr">${SVI('chat')} Gespräch</button>`:''}
          ${kxk&&kxk.tel&&typeof kxWa==='function'?`<a class="btn sm ghost" href="${sv4Esc(kxWa(kxk.tel,'Hi '+svFirst(p.name)+', '))}" target="_blank" rel="noopener">WhatsApp</a>`:''}</div>
        <div class="pf4-sc2"></div>
      </div></section>
    <section class="pf4-top"><div class="pf4-card"></div><div class="pf4-glance"></div></section>
    ${hints.length?`<section class="pf4-hints${hints.length>1?' more':''}">${hints.map(([i,t,c],k)=>`<div class="h${c?' '+c:''}${k>0?' x':''}"><span>${i}</span><p>${t}</p></div>`).join('')}${hints.length>1?`<button type="button" class="pf4-hmore">+ ${hints.length-1} weitere Hinweis${hints.length>2?'e':''}</button>`:''}</section>`:''}
    <div class="pf4-secs"></div>`;
  if(ava)root.querySelector('.pf4-ava').appendChild(ava);
  if(sc2)root.querySelector('.pf4-sc2').appendChild(sc2);
  const svpos=oldHead&&oldHead.querySelector('.svpos'); if(svpos){ const mine=root.querySelector('.pf4-pos'); if(mine)mine.replaceWith(svpos); }
  if(oldHead){ oldHead.style.display='none'; root.querySelector('.pf4-head').after(oldHead); }
  if(svposBox)root.querySelector('.pf4-head').after(svposBox);

  // ---- Karte + Eye-Test ----
  const cardBox=root.querySelector('.pf4-card');
  if(fut){ cardBox.appendChild(fut); fut.classList.remove('in-sb'); }
  const EY=sv4Eye(p.id);
  const eyeLine=document.createElement('div'); eyeLine.className='pf4-eyel';
  eyeLine.innerHTML=EY?`<b>Eye-Test</b> Ø aus ${EY.n} Bewertung${EY.n>1?'en':''}${EY.alt?` (${sv4SL(EY.alt)})`:''} ${sv4I('Eye-Test',{art:'manuell',quelle:'Bewertungen von Trainern, Kaderplanern und Scouts',stand:sv4D(EY.last),
      txt:'Die Karte zeigt den Schnitt aller Bewertungen dieser Saison. Jede Person bewertet selbst und kann nur ihre eigene Bewertung ändern.',
      rows:EY.list.map(e=>[sv4Esc(e.rater_name||'?')+' · '+sv4D(e.updated_at),SV4_EYE.map(([k,,ab])=>e[k]!=null?ab+' '+sv4Num(e[k],e[k]%1?1:0):'').filter(Boolean).join(' · ')])})}`
    :`<span>Werte auf der Karte aus den Daten · ${team?'noch kein Eye-Test':'kein Eye-Test'}</span>`;
  cardBox.appendChild(eyeLine);
  const eyeBox=document.createElement('div'); eyeBox.className='pf4-eye'; eyeBox.hidden=!PF4.eyeOpen; cardBox.appendChild(eyeBox);
  if(PF4.eyeOpen)pf4EyeForm(eyeBox,p);

  // ---- Auf einen Blick ----
  const G=root.querySelector('.pf4-glance'); const tiles=[];
  tiles.push(`<div class="g4 big"><span>MScore ${sv4ScoreInfo(p)}</span><b style="color:${tierColor(s.total)}">${sv4Num(s.total,1)}</b><small>${s.eye!=null?'mit Eye-Test':'ohne Eye-Test'}${s.adjD?' · Insider-Rating':''}</small></div>`);
  E.seasons.slice(0,2).forEach((x,i)=>{
    const lig=LIGA_NAME[ligaBase(x.liga)]||x.liga||'';
    tiles.push(`<div class="g4"><span>Einsätze ${sv4Esc(x.y)} ${sv4I('Einsätze '+x.y,{art:'auto',quelle:x.src||'Tabelle FUSSBALL.DE',stand:i===0&&p.cur&&p.cur.stand?sv4D(p.cur.stand):DATA.generated,
        rows:[['Verein',sv4Esc(x.club||'–')],['Liga',sv4Esc(lig)],['Team-Spiele',x.teamSp||'–'],['Einsätze',x.sp!=null?x.sp:(x.doc?`${x.docS} Startelf in ${x.doc} dok. Spielen`:'unbekannt')],['Minuten',x.min?x.min.toLocaleString('de-DE'):'–'],['Tore',x.tore!=null?(x.belegt?'min. ':'')+x.tore:'–']],
        txt:x.sp==null&&!x.doc?'Für diesen Spieler sind keine Einsätze bekannt, nur die Spiele seiner Mannschaft.':''})}</span>
      <b>${x.sp!=null?x.sp:x.doc?x.docS:'?'}<i>/${x.teamSp||'–'}</i></b><small>${sv4Esc(x.club||'')} · ${sv4Esc(lig)}${x.min?' · '+x.min.toLocaleString('de-DE')+' Min.':''}</small></div>`); });
  if(p.pos==='TW'&&s.gaTxt)tiles.push(`<div class="g4"><span>Gegentore ${sv4I('Gegentore',{art:'auto',quelle:'Tabellen FUSSBALL.DE',txt:'Gegentore der Mannschaft pro Spiel. Wie viel davon auf ihn geht, hängt von seinen Einsätzen ab (siehe Einsatzquote).',rows:[['Einsatzquote',s.q==null?'unbekannt':Math.round(s.q*100)+' %']]})}</span><b>${sv4Esc(s.gaTxt.split(' ')[0])}</b><small>pro Spiel (Team) · Liga-Ø ${sv4Esc(s.gaTxt.split(' ').pop())}</small></div>`);
  else tiles.push(`<div class="g4"><span>Tore ${sv4I('Tore',{art:'auto',quelle:'Torjägerlisten FUSSBALL.DE, Vereinsheft, Spielberichte',stand:DATA.generated,rows:E.seasons.map(x=>[x.y,(x.belegt?'min. ':'')+(x.tore!=null?x.tore:'–')])})}</span><b>${E.seasons.map(x=>x.tore!=null?x.tore:'–').join(' <i>|</i> ')}</b><small>${E.seasons.map(x=>x.y).join(' | ')}</small></div>`);
  if(own&&team){
    const z=sv4Zuk(p,nx)||'bleibt'; const g=SV4.gs.filter(x=>x.player_id===p.id)[0];
    tiles.push(`<div class="g4 zk"><span>Zukunft ${sv4SL(nx)} ${sv4I('Zukunft',{art:'manuell',txt:'Standard: Spieler bleibt. Ändern, sobald es Signale gibt. Der Kaderplan rechnet damit weiter.',stand:(sv4SS(p.id,nx)||{}).updated_at?sv4D(sv4SS(p.id,nx).updated_at):'Standard (bleibt)'})}</span>
      <div class="zk4">${['bleibt','unsicher','geht',sv4Team(p)==='1'?'runter':'hoch'].map(k=>`<button type="button" class="${z===k?'on '+SV4_ZUK[k][1]:''}" data-zk="${k}">${SV4_ZUK[k][0]}</button>`).join('')}</div></div>`);
    tiles.push(`<div class="g4"><span>Letztes Gespräch</span><b>${g?sv4D(g.datum):'–'}</b><small>${g?sv4Esc(({bleibt:'will bleiben',unsicher:'unsicher',geht:'will gehen',offen:'offen',karriereende:'Karriereende'})[g.zukunft]||'')+(g.naechstes_am?' · nächstes '+sv4D(g.naechstes_am):''):'noch keins dokumentiert'}</small></div>`);
  } else if(!own&&!p.isJugend){
    const Wv=typeof wscoreSafe==='function'?wscoreSafe(p):null;
    if(Wv)tiles.push(`<div class="g4"><span>Wechsel-Index ${sv4I('Wechsel-Index',{art:'auto',quelle:'Digital-Scout (öffentliche Signale), Liga und Tabellenplatz der laufenden Saison',txt:'Heuristik, keine Wahrscheinlichkeit und nicht validiert: Start bei 50, Signale werden addiert oder abgezogen. Details unten unter „Wechsel-Index“. Kein FuPa-Wert.'})}</span><b style="color:${tierColor(Wv.w)}">${Wv.w}<i>/100</i></b><small>Heuristik, keine Wahrscheinlichkeit</small></div>`);
  }
  G.innerHTML=tiles.join('');
  G.querySelectorAll('[data-zk]').forEach(b=>b.onclick=async()=>{ try{ const z=b.dataset.zk; await sv4SSSet(p.id,nx,{zukunft:z,team:z==='geht'||z==='karriereende'?null:z==='hoch'?'1':z==='runter'?'2':sv4Team(p,sv4S())}); kToast('✓ '+svFirst(p.name)+' · '+sv4SL(nx)+': '+SV4_ZUK[z][0]); pf4Refresh(p.id); }catch(e){ kToast('⚠️ '+e.message); } });

  // ---- Abschnitte ----
  const secs=root.querySelector('.pf4-secs'); const add=(k,t,html,nodes,extra)=>{ const d=document.createElement('details'); d.className='pf4-sec'; d.dataset.k=k; if(PF4.open.has(k))d.open=true;
    d.innerHTML=`<summary><span>${t}</span>${extra||''}</summary><div class="pf4-b">${html||''}</div>`; const b=d.querySelector('.pf4-b'); (nodes||[]).filter(Boolean).forEach(n=>b.appendChild(n));
    d.addEventListener('toggle',()=>{ if(d.open)PF4.open.add(k); else PF4.open.delete(k); }); secs.appendChild(d); return d; };
  const order=own?PF4_SEC.own:PF4_SEC.ext;
  for(const k of order){
    if(k==='kader'&&team){ const gs=SV4.gs.filter(x=>x.player_id===p.id).slice(0,4);
      add('kader','Kaderplanung & Gespräche',`<div class="pf4-kp">${sv4Seasons().map(ss=>{ const t=sv4Team(p,ss), z=sv4Zuk(p,ss); return `<div><span>${sv4SL(ss)}</span><b>${t?SV4_TEAM[t]:'–'}</b><i class="${z&&SV4_ZUK[z]?SV4_ZUK[z][1]:''}">${z&&SV4_ZUK[z]?SV4_ZUK[z][0]:''}</i></div>`; }).join('')}</div>
        <div class="pf4-gl">${gs.length?gs.map(g=>`<div class="gs4"><b>${sv4D(g.datum)} · ${sv4Esc(({offiziell:'Offizielles Gespräch',kurz:'Kurzes Gespräch',telefon:'Telefonat',verhandlung:'Verhandlung'})[g.art]||g.art)}</b>${g.zukunft?pf4Chip(sv4Esc(({bleibt:'will bleiben',unsicher:'unsicher',geht:'will gehen',offen:'offen',karriereende:'Karriereende'})[g.zukunft]||''),g.zukunft==='bleibt'?'ok':g.zukunft==='geht'||g.zukunft==='karriereende'?'bad':'warn'):''}
          ${g.sicht?`<p><i>Sicht des Spielers:</i> ${sv4Esc(g.sicht)}</p>`:''}${g.themen?`<p><i>Offen:</i> ${sv4Esc(g.themen)}</p>`:''}${g.entscheidung?`<p><i>Entscheidung:</i> ${sv4Esc(g.entscheidung)}</p>`:''}</div>`).join(''):'<p class="note">Noch kein Gespräch dokumentiert.</p>'}
          <button class="btn sm ghost" data-pf4="gespr">${SVI('plus')} Gespräch festhalten</button></div>`,[],gs[0]?`<em>${sv4D(gs[0].datum)}</em>`:'');
    }
    if(k==='kand'&&team){ const bk=SV4.bk.filter(x=>x.player_id===p.id), bl=bk.map(x=>{ const b=SV4.bed.find(y=>y.id===x.bedarf_id); return b?`<div class="bk4"><b>${sv4Esc(b.titel)}</b> · ${sv4Esc(x.status)}</div>`:''; }).join('');
      add('kand','Kandidat & Kontakt',bl?`<div class="pf4-bk"><h5>In Bedarfen</h5>${bl}</div>`:'',[crm,lat,crmnote],B.k!=='extern'?`<em>${sv4Esc(B.t)}</em>`:''); }
    if(k==='train'&&(trprof||vrprof))add('train','Training & Fitness','',[trprof,vrprof]);
    if(k==='stat'){ add('stat','Statistik & Saison-Records',pf4SeasonsHtml(p,s),[sEin,!own?vrprof:null]); }
    if(k==='score'){ add('score','MScore, so entsteht der Wert',pf4ScoreHtml(p,s),[proj,mgrid&&mgrid.querySelector('.radarbox')],`<em>${sv4Num(s.total,1)}</em>`); }
    if(k==='wechsel'&&sWV)add('wechsel','Wechsel-Index (Heuristik, keine Wahrscheinlichkeit)','',[sWV]);
    if(k==='bogen'&&sbside)add('bogen','Spielerbogen: Rolle, Skills, Charakter','',[sbside]);
    if(k==='kontakt'&&kx)add('kontakt','Kontakt & Wohnort','',[kx]);
    if(k==='presse'&&press.length)add('presse','Presse & Quellen','',press,`<em>${press.length}</em>`);
    if(k==='edit'&&edit&&team){ const d=add('edit','Bearbeiten','',[edit]); pf4Edit(edit,p); }
  }
  // Reste (unbekannte Bausteine anderer Module) nicht verlieren
  const keep=new Set(['mback','mclose']);
  [...M.children].forEach(ch=>{ if(ch===root||keep.has(ch.id))return; if(ch===mgrid||ch===d2||ch===sbwrap||ch.classList.contains('infobox')||ch.classList.contains('gembox')||ch.classList.contains('riskbox')||ch.classList.contains('note')){ ch.remove(); return; }
    if(ch.id==='scEg'){ root.querySelector('.pf4-act').appendChild(ch); return; }
    const o=secs.querySelector('[data-k="mehr"]')||add('mehr','Weitere Infos','',[]); o.querySelector('.pf4-b').appendChild(ch); });
  M.appendChild(root);
  // Aktionen
  root.querySelectorAll('[data-pf4="edit"],[data-pf4="eye"],[data-pf4="gespr"]').forEach(b=>b.onclick=()=>{ const a=b.dataset.pf4;
    if(a==='edit'){ PF4.open.add('edit'); const d=root.querySelector('[data-k="edit"]'); if(d){ d.open=true; setTimeout(()=>d.scrollIntoView({behavior:'smooth',block:'start'}),30); } }
    if(a==='eye'){ PF4.eyeOpen=!PF4.eyeOpen; eyeBox.hidden=!PF4.eyeOpen; if(PF4.eyeOpen){ pf4EyeForm(eyeBox,p); setTimeout(()=>eyeBox.scrollIntoView({behavior:'smooth',block:'nearest'}),30); } }
    if(a==='gespr'&&typeof kd4GesprEditor==='function')kd4GesprEditor(p.id); });
  const hm=root.querySelector('.pf4-hmore'); if(hm)hm.onclick=()=>{ root.querySelector('.pf4-hints').classList.add('all'); hm.remove(); };
}

/* ---------- Statistik & Saison-Records ---------- */
function pf4SeasonsHtml(p,s){
  const E=s.E||sv4Einsatz(p), rows=[];
  const cl=typeof clubFor==='function'?clubFor(p.club):null;
  E.seasons.forEach((x,i)=>{ const lig=LIGA_NAME[ligaBase(x.liga)]||x.liga||'';
    const t=i===0&&p.cur&&p.cur.rank?` · Team Platz ${p.cur.rank}/${p.cur.teamCount}`:i===1&&cl&&cl.s2526?` · Team Platz ${cl.s2526.platz}`:'';
    rows.push(`<tr><th>${sv4Esc(x.y)}</th><td>${sv4Esc(x.club||'')}<small>${sv4Esc(lig)}${t}</small></td><td>${sv4EinsatzTxt(x)}</td><td><b>${x.tore!=null?(x.belegt?'≥':'')+x.tore:'–'}</b> T</td></tr>`); });
  if(p.prev){ const lig=LIGA_NAME[ligaBase(p.prev.liga)]||p.prev.liga; rows.push(`<tr><th>24/25</th><td>${sv4Esc(p.prev.verein)}<small>${sv4Esc(lig)}</small></td><td>${p.prevBelegt?'belegt aus Vereinsheft':`${p.prev.spiele} Sp.`}</td><td><b>${p.prev.tore}</b> T</td></tr>`); }
  const A=sv4Archiv(p); const by={};
  A.forEach(r=>{ const o=by[r.saison]||(by[r.saison]={sp:0,t:0,v:0,pk:0,st:null}); o.sp+=r.spiele||0; o.t+=r.tore||0; o.v+=r.vorlagen||0; if(r.wettbewerb==='pokal')o.pk+=r.spiele||0; if(r.startelf!=null)o.st=(o.st||0)+r.startelf; });
  const ys=Object.keys(by).sort().reverse();
  ys.forEach(y=>{ const o=by[y]; rows.push(`<tr class="arc"><th>${sv4Esc(y.slice(2,4)+'/'+y.slice(5))}</th><td>SV/BSC Mörlenbach<small>1. Mannschaft · Vereinsdaten</small></td><td><b>${o.sp}</b> Sp.${o.pk?` (davon ${o.pk} Pokal)`:''}${o.st!=null?` · ${o.st}× Startelf`:''}</td><td><b>${o.t}</b> T${o.v?` · ${o.v} V`:''}</td></tr>`); });
  const tot=ys.reduce((a,y)=>({sp:a.sp+by[y].sp,t:a.t+by[y].t}),{sp:0,t:0});
  const sds=p.sds?`<div class="pf4-sds">🏅 Elf der Woche (FuPa) 25/26: <b>${p.sds}×</b> ${sv4I('Elf der Woche',{art:(CRM[p.id]||{}).sds!=null?'manuell':'Datenbestand',quelle:'FuPa „Elf der Woche“. Übernommen in den Datenbestand',stand:DATA.generated,txt:'Diese Zahl wurde nicht automatisch geprüft. Stimmt sie nicht, unter „Bearbeiten“ korrigieren. Sie gibt +2 MScore je Nominierung (max. +6).'})}</div>`:'';
  return `<table class="pf4-st"><thead><tr><th>Saison</th><th>Verein · Liga</th><th>Einsätze</th><th>Tore</th></tr></thead><tbody>${rows.join('')}</tbody></table>
    ${ys.length?`<p class="note small">Archiv 13/14–22/23 aus den Vereinsdaten (Lukas): <b>${tot.sp}</b> Pflichtspiele, <b>${tot.t}</b> Tore für die Erste. 23/24 fehlt noch (FuPa-Daten folgen).</p>`:(p.own?'<p class="note small">Ältere Saisons: keine Vereinsdaten zu diesem Namen gefunden.</p>':'')}
    ${sds}`;
}
function pf4ScoreHtml(p,s){
  if(!s.comps)return '';
  return `<div class="pf4-sc">${s.comps.map(c=>`<div class="sc4r${c.w?'':' off'}"><span>${sv4Esc(c.t)} ${sv4I(c.t,{art:c.art,basis:c.basis,rows:[['Wert',c.v==null?'–':c.v+' / 100'],['Gewicht',c.w?Math.round(c.w/s.sum*100)+' %':'zählt nicht']]})}</span>
      <i><u style="width:${c.v||0}%;background:${tierColor(c.v||0)}"></u></i><b>${c.v==null?'–':c.v}</b><em>${c.w?Math.round(c.w/s.sum*100)+' %':'–'}</em></div>`).join('')}
    ${s.sdsB?`<div class="sc4r add"><span>Elf der Woche</span><i></i><b>+${s.sdsB}</b><em></em></div>`:''}
    ${s.adjD?`<div class="sc4r add"><span>Insider-Rating (manuell)</span><i></i><b>${s.adjD>0?'+':''}${s.adjD}</b><em></em></div>`:''}
    <div class="sc4r tot"><span>MScore</span><i></i><b>${sv4Num(s.total,1)}</b><em></em></div></div>
    <p class="note small">Gewichte anpassen: Wissen → Modell. Bausteine ohne Daten zählen nicht mit, ihr Gewicht wird auf die anderen verteilt.</p>`;
}

/* ---------- Eye-Test abgeben ---------- */
function pf4EyeForm(box,p){
  const E=sv4Eye(p.id), mine=E&&E.mine, own=!!sv4Team(p), tw=p.pos==='TW', me=SVB.user&&SVB.user.id, boss=['admin','vorstand'].includes(svRole());
  const v=k=>mine&&mine[k]!=null?+mine[k]:null;
  const st={}; SV4_EYE.forEach(([k])=>st[k]=v(k));
  box.innerHTML=`<div class="ey4">
    <div class="ey4-h"><b>${mine?'Deine Bewertung ändern':'Dein Eye-Test'} · ${sv4SL(sv4S())}</b><small>1 = schwach · 5 = Kreisliga-Durchschnitt · 10 = überragend für unsere Liga</small></div>
    <div class="ey4-g">${SV4_EYE.map(([k,l])=>`<label class="ey4-r"><span>${sv4Esc(tw&&SV4_EYE_TW[k]?SV4_EYE_TW[k]:l)}</span><input type="range" min="0" max="10" step="0.5" value="${st[k]==null?0:st[k]}" data-ey="${k}"><output>${st[k]==null?'–':sv4Num(st[k],st[k]%1?1:0)}</output></label>`).join('')}</div>
    <div class="ey4-m"><label>Anlass<select data-eyf="anlass">${[['training','Training'],['spiel','Spiel'],['scouting','Scouting vor Ort'],['video','Video'],['sonstiges','Sonstiges']].map(([k,t])=>`<option value="${k}"${(mine?mine.anlass:(own?'training':'spiel'))===k?' selected':''}>${t}</option>`).join('')}</select></label>
      <label>Gesehen am${own?'':' *'}<input type="date" data-eyf="gesehen_am" value="${sv4Esc(mine&&mine.gesehen_am||(own?'':sv4Today()))}"></label>
      <label class="w">Wo / gegen wen<input type="text" maxlength="120" data-eyf="gesehen_bei" placeholder="z. B. Heimspiel gegen Rimbach" value="${sv4Esc(mine&&mine.gesehen_bei||'')}"></label>
      <label class="w">Notiz<input type="text" maxlength="600" data-eyf="notiz" value="${sv4Esc(mine&&mine.notiz||'')}"></label></div>
    <div class="btnrow"><button class="btn sm" data-eys>${SVI('check')} Speichern</button><button class="btn sm ghost" data-eyc>Schließen</button></div>
    ${E&&E.all.length?`<div class="ey4-l"><h5>Alle Bewertungen</h5>${E.all.map(e=>`<div class="ey4-i"><b>${sv4Esc(e.rater_name||'?')}</b><span>${sv4SL(e.saison)} · ${sv4D(e.updated_at)}${e.gesehen_bei?' · '+sv4Esc(e.gesehen_bei):''}</span>
      <em>${SV4_EYE.map(([k,,ab])=>e[k]!=null?`${ab} ${sv4Num(e[k],e[k]%1?1:0)}`:'').filter(Boolean).join(' · ')}</em>${e.notiz?`<p>${sv4Esc(e.notiz)}</p>`:''}
      ${e.rater===me||boss?`<button class="kx-b ic del" data-eyd="${e.id}" title="Löschen">${SVI('trash')}</button>`:''}</div>`).join('')}</div>`:''}
    <p class="note small">Jeder bewertet selbst: die Karte zeigt den Schnitt. Fremde Bewertungen löschen nur Admin und Vorstand.${own?'':' Externe Spieler nur bewerten, wenn du ihn gesehen hast.'}</p></div>`;
  box.querySelectorAll('[data-ey]').forEach(i=>i.oninput=()=>{ const x=+i.value; i.nextElementSibling.textContent=x<1?'–':sv4Num(x,x%1?1:0); });
  box.querySelector('[data-eyc]').onclick=()=>{ PF4.eyeOpen=false; box.hidden=true; };
  box.querySelector('[data-eys]').onclick=async e=>{ const b=e.currentTarget; const o={player_id:p.id,saison:sv4S()}; let any=false;
    box.querySelectorAll('[data-ey]').forEach(i=>{ const x=+i.value; if(x>=1){ o[i.dataset.ey]=x; any=true; } else o[i.dataset.ey]=null; });
    box.querySelectorAll('[data-eyf]').forEach(i=>o[i.dataset.eyf]=i.value.trim()||null);
    if(!any)return kToast('Mindestens eine Kategorie bewerten');
    if(!own&&!o.gesehen_am)return kToast('Wann hast du ihn gesehen?');
    b.disabled=true; try{ await sv4EyeSave(o); kToast('✓ Eye-Test gespeichert: Karte & MScore aktualisiert'); PF4.eyeOpen=false; try{ renderAll(); }catch(x){} pf4Refresh(p.id); }catch(x){ kToast('⚠️ '+x.message); b.disabled=false; } };
  box.querySelectorAll('[data-eyd]').forEach(b=>b.onclick=async()=>{ if(!b.classList.contains('sure')){ b.classList.add('sure'); b.textContent='Löschen?'; return; }
    try{ await sv4EyeDel(+b.dataset.eyd); kToast('Bewertung gelöscht'); try{ renderAll(); }catch(x){} pf4Refresh(p.id); }catch(x){ kToast('⚠️ '+x.message); } });
}

/* ---------- Bearbeiten: ein Weg für alles ---------- */
function pf4Edit(edit,p){
  const h=edit.querySelector('h4'); if(h)h.remove();
  // alter Eye-Test (5 Regler) ist abgelöst – bleibt unsichtbar, damit das Speichern alte Werte nicht verändert
  [...edit.querySelectorAll('h4')].forEach(x=>{ if(/Eye-Test/.test(x.textContent))x.style.display='none'; });
  const sl=edit.querySelector('.sliders'); if(sl)sl.style.display='none';
  const grid=edit.querySelector('.editgrid');
  if(grid&&!edit.querySelector('.pf4-x')){
    const x=document.createElement('div'); x.className='pf4-x editgrid';
    const kxk=typeof kxOf==='function'?kxOf(p.id):{};
    x.innerHTML=`<div class="field"><label>Positionen (Haupt & Neben)</label><button type="button" class="btn sm ghost" data-pf4pos>${sv4Esc(p.pos||'–')}${(p.pos2||[]).length?' · '+sv4Esc(p.pos2.join(', ')):''} ändern</button></div>
      ${canTraining()&&!p.isJugend?`<div class="field"><label>Wohnort (für die Entfernung)</label><input type="text" id="pf4Ort" maxlength="60" placeholder="z. B. Rimbach" value="${sv4Esc((kxk&&kxk.ort)||'')}"></div>`:''}
      ${!p.isJugend?`<div class="field"><label>Elf der Woche 25/26 (Anzahl, FuPa)</label><input type="number" id="pf4Sds" min="0" max="34" inputmode="numeric" value="${p.sds??''}" placeholder="–"></div>`:''}
      ${typeof sbEditor==='function'&&!p.isJugend?`<div class="field"><label>Rolle, Special Skills, Charakter</label><button type="button" class="btn sm ghost" data-pf4sb>Spielerbogen bearbeiten</button></div>`:''}`;
    grid.after(x);
    const pb=x.querySelector('[data-pf4pos]'); if(pb)pb.onclick=()=>svPosEditor(p,pb);
    const sb=x.querySelector('[data-pf4sb]'); if(sb)sb.onclick=()=>sbEditor(p.id);
  }
  // Positionsauswahl im Grid heißt jetzt „Hauptposition“
  const lp=edit.querySelector('#e_pos'); if(lp&&lp.previousElementSibling)lp.previousElementSibling.textContent='Hauptposition';
  const ea=edit.querySelector('#e_alter'); if(ea&&ea.previousElementSibling)ea.previousElementSibling.textContent='Alter (nur ohne Geburtsdatum)';
  const save=edit.querySelector('#saveP'), star=edit.querySelector('#starP');
  if(save&&!save.dataset.pf4hook){ save.dataset.pf4hook='1'; save.addEventListener('click',()=>{
    const ort=document.getElementById('pf4Ort'), sds=document.getElementById('pf4Sds');
    const ortV=ort?ort.value.trim():null, sdsV=sds?sds.value.trim():null;
    setTimeout(async()=>{
      try{
        if(sds&&sdsV!==String(p.sds??'')){ const n=sdsV===''?null:Math.max(0,Math.min(34,Math.round(+sdsV))); crmSet(p.id,{sds:n==null?undefined:n}); p.sds=n; try{crmApply();}catch(e){} }
        const kxk=typeof kxOf==='function'?kxOf(p.id):{};
        if(ort&&ortV&&ortV!==((kxk&&kxk.ort)||'')){ const g=await sv4Geo(ortV); const {data,error}=await SVB.sb.rpc('kontakt_ort',{p_player:p.id,p_name:p.name,p_ort:g&&g.name?g.name:ortV,p_lat:g?g.lat:null,p_lon:g?g.lon:null});
          if(error)kToast('⚠️ Wohnort: '+error.message); else if(typeof KX!=='undefined'&&KX.map)KX.map.set(p.id,Object.assign({},kxOf(p.id),{id:p.id,ort:data.ort,lat:data.lat,lon:data.lon})); }
      }catch(e){ console.warn(e); }
      sv4Bump(); try{ renderAll(); }catch(e){} PF4.open.delete('edit'); openModal(p.id); kToast('✓ Gespeichert');
    },30); }); }
  if(star&&!star.dataset.pf4hook){ star.dataset.pf4hook='1'; star.addEventListener('click',()=>setTimeout(()=>openModal(p.id),30)); }
}

/* ---------- Kontaktbox: Wohnort mit anzeigen ---------- */
if(typeof kxBoxHtml==='function'){ const _kb4=kxBoxHtml; kxBoxHtml=function(p){ const h=_kb4.apply(this,arguments); try{ const k=kxOf(p.id); if(!k||!k.ort)return h; const km=k.lat!=null?sv4Km(k.lat,k.lon):null;
  return h.replace('<div id="kxHist">',`<div class="kx-row"><span class="kx-ic">📍</span><b class="kx-v">${sv4Esc(k.ort)}</b><span class="kx-go"><i class="note small">${km!=null?'≈ '+km+' km zum Sportplatz':''}</i></span></div><div id="kxHist">`); }catch(e){ return h; } }; }

/* ---------- Radar-Diagramm im Profil mit den neuen Bausteinen ---------- */
{ const _om43=openModal; openModal=function(id){ const r=_om43.apply(this,arguments); try{ const p=sv4P(id), s=p&&scores(p);
  if(s&&s.comps&&typeof radarChart!=='undefined'&&radarChart&&radarChart.data){ const C=s.comps; radarChart.data.labels=C.map(c=>c.t); radarChart.data.datasets[0].data=C.map(c=>c.v==null?0:c.v); radarChart.update(); } }catch(e){} return r; }; }

/* ---------- Wissen → Modell: MScore 2.0 verständlich erklärt ---------- */
const SV4_MODEL=[['prod','Produktion / Defensivwert','Tore pro Spiel, gewichtet mit der Liga (1,0 Tore/Spiel in der A-Liga = 100). Abwehr & Torwart: Gegentore der Mannschaft im Vergleich zur Liga, aber nur so viel, wie der Spieler selbst gespielt hat, und ligagewichtet.'],
  ['level','Einsatz & Liga','Wer in einer höheren Liga regelmäßig spielt, ist schon deshalb gut: Liga-Grundwert (GL 100 … D 27) × Einsatzquote (Minuten bzw. Einsätze je Team-Spiel).'],
  ['share','Teamrolle','Anteil an den Toren der Mannschaft (40 % = volle Punktzahl); bei Abwehrspielern ohne Tore die Einsatzquote.'],
  ['ctx','Teamstärke','Tabellenplatz der Mannschaft: bei Abwehrspielern neutral, weil er schon in den Gegentoren steckt.'],
  ['pot','Potenzial','Alter: ≤ 20 J. = 100 … ≥ 33 J. = 18. Ohne Geburtsdatum geschätzt (im Profil markiert).'],
  ['trend','Form','Quote der laufenden Saison gegen die Vorsaison (ab 3 Spielen).'],
  ['presse','Presse','Tenor der Presse-Nennungen (Tore, Lob, Kritik, Verletzungen), ohne Nennungen neutral 50.'],
  ['scout','Eye-Test','Schnitt aller Eye-Tests dieser Saison (Tempo, Schuss, Pass, Dribbling, Defensive, Physis), gewichtet nach Position. Ohne Eye-Test zählt der Baustein nicht. Sein Gewicht wird verteilt.']];
function sv4ModelCard(){
  const P=document.getElementById('panel-model'); if(!P)return; let c=P.querySelector('.m4'); if(!c){ c=document.createElement('div'); c.className='card m4'; P.prepend(c);
    const old=[...P.querySelectorAll('.card')].find(x=>/So rechnet das Modell/.test(x.textContent)); if(old&&!old.closest('details')){ const d=document.createElement('details'); d.className='pf4-sec'; d.innerHTML='<summary><span>Frühere Modell-Notizen (Versionen bis 3.5)</span></summary><div class="pf4-b"></div>'; old.before(d); d.querySelector('.pf4-b').appendChild(old); } }
  const sum=Object.values(W).reduce((a,b)=>a+(+b||0),0)||1;
  c.innerHTML=`<h3>MScore 2.0, so entsteht der Wert</h3><p class="note">Ein Gesamtwert ist nur so gut wie seine Nachvollziehbarkeit: Jeder Baustein steht im Spielerprofil mit ⓘ (Quelle, automatisch oder manuell, Stand, Grundlage). Die Gewichte stellst du unten live ein; mit mehr Daten wird das Modell besser.</p>
    <table class="pf4-st"><thead><tr><th>Baustein</th><th>Gewicht</th><th>So wird gerechnet</th></tr></thead><tbody>${SV4_MODEL.map(([k,t,d])=>`<tr><th>${sv4Esc(t)}</th><td><b>${Math.round((W[k]||0)/sum*100)} %</b></td><td>${sv4Esc(d)}</td></tr>`).join('')}</tbody></table>
    <p class="note small">Dazu (falls vorhanden): Elf der Woche +2 je Nominierung (max. +6) · Insider-Rating der Sportlichen Leitung überschreibt transparent.</p>`;
}
{ const _gt44=goTab; goTab=function(tab){ const r=_gt44.apply(this,arguments); try{ if(svCurTab()==='model')sv4ModelCard(); }catch(e){ console.warn(e); } return r; }; }

/* =====================================================================
   SV/BSC Sportzentrale 4.0 · Scouting (Lukas' Punkte 7, 10–16, 18)
   - Ein Bereich mit Tabs: Spielermarkt · Bedarf & Aufträge · Kandidaten · Radar (+ Rohdiamanten) · A-Jugend · Vergleich
   - Spielermarkt: Karten oder Tabelle; jede Zeile zeigt Einsätze (wann, wo, für wen), weniger Tags
   - Bedarf steht über dem Auftrag: Bedarf → Suchprofil → Kandidaten → Beobachtung → Shortlist → Kontakt → Entscheidung
   - Kandidaten = nur externe Spieler; eigene Spieler laufen über Kader & Gespräche
   ===================================================================== */
const SC4={open:null,flt:'offen'};
const SC4_ST=[['kandidat','Kandidat'],['beobachten','Beobachten'],['shortlist','Shortlist'],['kontakt','Kontakt'],['zusage','Zusage'],['absage','Absage']];
const SC4_FLOW=['Kaderanalyse','Bedarf','Suchprofil','Kandidaten','Beobachtung','Shortlist','Kontakt','Entscheidung'];
const SC4_GRUND={ersatz:'Ersatz',verstaerkung:'Verstärkung',abgang:'Abgang ersetzen',breite:'Kaderbreite',perspektive:'Perspektive'};
const SC4_ZP={sofort:'Sofort',winter:'Winter',sommer:'Sommer'};

/* ---------- Kandidaten: nur externe ---------- */
{ const _kl4=kandList; kandList=function(){ return _kl4.apply(this,arguments).filter(p=>svScoutInScope(p)&&!p.own&&!sv4Team(p)); }; }

/* ---------- Weniger Tags: Liga + wichtigster Status ---------- */
{ const _bd4=badges; badges=function(p){
  try{
    const C=crmOf(p); let h=`<span class="badge">${sv4Esc(p.isJugend?(p.sub||'Jugend'):svLigaText(p))}</span>`;
    const t=sv4Team(p); if(t)h+=`<span class="badge b-own">${t==='1'?'SV/BSC':t==='2'?'SV/BSC II':'SV/BSC Jgd.'}</span>`;
    else if(C.s==='lat'&&crmDue(p))h+=`<span class="badge b-crml">⏰ fällig</span>`;
    else if(C.c)h+=`<span class="badge b-crmc">📞 kontaktiert</span>`;
    else if(C.s==='att')h+=`<span class="badge b-crma">💚 attraktiv</span>`;
    else if(C.s==='no')h+=`<span class="badge b-crmn">🚫</span>`;
    else if(p.exSvbc||C.x)h+=`<span class="badge b-ex">Ex-SV/BSC</span>`;
    else if(p.risiko)h+=`<span class="badge b-risk">⚠</span>`;
    else if(gemsOf(p).length)h+=`<span class="badge b-gem">💎</span>`;
    return h;
  }catch(e){ return _bd4.apply(this,arguments); } }; }

/* ---------- Spielermarkt-Zeile: Einsätze, Liga, Verein statt Tag-Sammlung ---------- */
{ const _rh4=rowHtml; rowHtml=function(p,i,extra=''){
  try{
    const s=scores(p), E=s.E||sv4Einsatz(p), a=E.seasons[0]||{}, b=E.seasons[1]||null, tw=p.pos==='TW';
    const ein=x=>x?(x.sp!=null?`<b>${x.sp}</b>/${x.teamSp} Sp.`:x.doc?`<b>${x.docS}</b> Startelf`:`<i>? </i>/${x.teamSp||'–'} Sp.`):'';
    const W=!p.own&&!p.isJugend&&typeof wscoreSafe==='function'?wscoreSafe(p):null;
    return `<div class="row r4" data-id="${p.id}">
      <div class="rankn ${i<3?'top':''}">${i+1}</div>${avaHtml(p)}
      <div class="rmain"><div class="pname">${sv4Esc(p.name)} ${badges(p)}</div>
        <div class="pmeta"><span>${sv4Esc((svLigaJetzt(p)||{}).club||p.club)}</span><span class="pm4-pos">${sv4Esc(svPosTxt(p)||'?')}</span>${p.alter!=null?`<span><b>${p.alter}${p.alterCa||!p.geb?'~':''}</b> J.</span>`:''}
          ${a.y?`<span class="pm4-s">${sv4Esc(a.y)}: ${ein(a)}${tw?'':` · <b>${a.tore!=null?a.tore:'–'}</b> T`}</span>`:''}${b?`<span class="pm4-s">${sv4Esc(b.y)}: ${ein(b)}${tw?'':` · <b>${b.tore!=null?(b.belegt?'≥':'')+b.tore:'–'}</b> T`}</span>`:''}
          ${tw&&s.gaTxt?`<span class="pm4-s">GT/Sp. <b>${sv4Esc(s.gaTxt.split(' ')[0])}</b> (Team)</span>`:''}
          ${p.km!=null&&!sv4Team(p)?`<span>${p.km} km</span>`:''}${W?`<span title="Wechsel-Index: Heuristik aus öffentlichen Signalen, keine Wahrscheinlichkeit">🔁 <b>${W.w}</b></span>`:''}</div>${extra}</div>
      <div class="rside">${ring(s.total)}<button class="starbtn ${p.star?'on':''}" data-star="${p.id}">★</button></div></div>`;
  }catch(e){ return _rh4.apply(this,arguments); } }; }

/* Spielermarkt: Radar-Streifen und Aufträge wandern in eigene Tabs, Umschalter Karten/Tabelle */
svScoutStrip=function(){ const x=document.getElementById('rdStrip'); if(x)x.remove(); };
function sc4MarktBar(){
  ['panel-scout','panel-db'].forEach(id=>{ const P=document.getElementById(id); if(!P||P.querySelector('.mk4'))return;
    const d=document.createElement('div'); d.className='mk4';
    d.innerHTML=`<div class="seg4 sm"><button type="button" data-mk="scout">Karten</button><button type="button" data-mk="db">Tabelle</button></div><span class="note small">Einsätze: ${sv4Esc(sv4SL(sv4S()))} und 25/26 · „?“ = nur Team-Spiele bekannt · ~ = Alter geschätzt</span>`;
    P.prepend(d); d.querySelectorAll('[data-mk]').forEach(b=>b.onclick=()=>goTab(b.dataset.mk)); });
  document.querySelectorAll('.mk4 [data-mk]').forEach(b=>b.classList.toggle('on',b.dataset.mk===svCurTab()));
}

/* ---------- Radar: Rohdiamanten als Unterpunkt ---------- */
function sc4RadarTabs(){
  ['panel-radar','panel-gems'].forEach(id=>{ const P=document.getElementById(id); if(!P)return; let d=P.querySelector('.rd4'); if(!d){ d=document.createElement('div'); d.className='rd4'; P.prepend(d); }
    d.innerHTML=`<div class="seg4 sm"><button type="button" data-rd="radar" class="${id==='panel-radar'?'on':''}">Meldungen & Serien</button><button type="button" data-rd="gems" class="${id==='panel-gems'?'on':''}">💎 Rohdiamanten</button></div>`;
    d.querySelectorAll('[data-rd]').forEach(b=>b.onclick=()=>goTab(b.dataset.rd)); });
}
const SC4_RF=[['alle','Alle'],['serien','Serien & heiße Läufe'],['talente','Junge Talente'],['beob','Merkliste & beobachtet'],['chancen','Moneyball']];
if(typeof rdRender==='function'){ const _rr4=rdRender; rdRender=function(){
  const F=SC4_RF.some(x=>x[0]===VR.rf)?VR.rf:'alle', all=VR.radar||[];
  const scopePick=r=>!r.player_id||svScoutInScope(sv4P(r.player_id));
  const pick={serien:r=>['serie','lauf'].includes(r.typ),talente:r=>['jung','quote'].includes(r.typ),beob:r=>{ const p=r.player_id&&sv4P(r.player_id); return r.typ==='merk'||!!(p&&(p.star||(typeof SC2!=='undefined'&&SC2.follow.has(p.id)))); },alle:r=>r.typ!=='team'}[F];
  let res; if(F==='chancen'){ VR.rf='chancen'; VR.radar=all.filter(scopePick); try{res=_rr4.apply(this,arguments);}finally{VR.radar=all;} }
  else { VR.radar=all.filter(scopePick).filter(pick); VR.rf='alle'; try{ res=_rr4.apply(this,arguments); }finally{ VR.radar=all; } }
  VR.rf=F;
  try{ const P=document.getElementById('panel-radar'), t=P&&P.querySelector('.rdf');
    if(t){ t.innerHTML=SC4_RF.map(([k,l])=>`<button class="${F===k?'on':''}" data-rf4="${k}">${l}</button>`).join(''); t.querySelectorAll('[data-rf4]').forEach(b=>b.onclick=()=>{ VR.rf=b.dataset.rf4; rdRender(); }); }
    P.querySelectorAll('.rdit').forEach(it=>{ const id=(it.querySelector('[data-svp]')||{}).dataset?.svp; const p=id&&sv4P(id); if(!p||it.querySelector('.rd4p'))return;
      const s=scores(p), W=!p.own&&typeof wscoreSafe==='function'?wscoreSafe(p):null, E=sv4Einsatz(p).seasons[0];
      const d=document.createElement('div'); d.className='rd4p'; d.innerHTML=`<span>${sv4Esc((svLigaJetzt(p)||{}).club||p.club)} · ${sv4Esc(svPosTxt(p)||'?')}${p.alter!=null?' · '+p.alter+' J.':''}${E?' · '+sv4Esc(E.y)+': '+(E.sp!=null?E.sp+'/'+E.teamSp+' Sp.':E.teamSp+' Team-Sp.'):''}</span><b style="color:${tierColor(s.total)}">MScore ${Math.round(s.total)}</b>${W?`<b>🔁 ${W.w}</b>`:''}`;
      (it.querySelector('.tra-b')||it).appendChild(d);
      if(!p.own&&typeof sc2Btns==='function'&&!it.querySelector('.sc2b')){ const bb=document.createElement('div'); bb.innerHTML=sc2Btns(p,true); const x=bb.firstElementChild; if(x){ (it.querySelector('.tra-b')||it).appendChild(x); sc2Wire(it,()=>rdRender()); } const st=it.querySelector('.rdstar'); if(st)st.remove(); } });
  }catch(e){ console.warn('Radar 4.0',e); }
  try{ sc4RadarTabs(); }catch(e){} return res; }; }
/* Aktions-Knöpfe mit Text statt nur Symbolen */
if(typeof sc2Btns==='function'){ const _sb4=sc2Btns; sc2Btns=function(p,compact){ let h=_sb4.apply(this,arguments); if(!compact||!h)return h;
  return h.replace(/(data-sc2="star"[^>]*>)⭐/,'$1⭐ Merken').replace(/(data-sc2="follow"[^>]*>)🔔/,'$1🔔 Beobachten').replace(/(data-sc2="no"[^>]*>)🚫/,'$1🚫 Kein Interesse').replace(/(data-sc2="job"[^>]*>)🔎/,'$1🔎 KI-Bericht'); }; }

/* ---------- Bedarf & Aufträge ---------- */
function sc4Cands(b,n){
  const pr=b.profil||{}, pos=b.pos, lvl={GL:6,KOL:5,A:4,B:3,C:2,D:1};
  const have=new Set(SV4.bk.filter(x=>x.bedarf_id===b.id).map(x=>x.player_id));
  const fit=p=>p.pos===pos?1:(p.pos2||[]).includes(pos)?0.8:(pos==='Flügel'&&p.pos==='ST')||(pos==='ST'&&p.pos==='Flügel')?0.7:0;
  return players.filter(p=>{ if(!svScoutInScope(p)||have.has(p.id)||sv4Team(p)||p.verzicht)return false; const C=crmOf(p); if(C.s==='no')return false; if(!fit(p))return false;
      if(pr.alter_von&&p.alter!=null&&p.alter<+pr.alter_von)return false; if(pr.alter_bis&&p.alter!=null&&p.alter>+pr.alter_bis)return false;
      if(pr.km_max&&p.km!=null&&p.km>+pr.km_max)return false; if(pr.liga_min&&!p.isJugend&&(lvl[ligaBase((p.cur&&p.cur.sub)||p.liga)]||0)<lvl[pr.liga_min])return false;
      if(pr.fuss&&p.fuss&&p.fuss!==pr.fuss&&p.fuss!=='Beidfüßig')return false; if(p.isJugend&&!pr.jugend)return false; return true; })
    .map(p=>{ const W=typeof wscoreSafe==='function'?wscoreSafe(p):null; return {p,k:(W?W.k:scores(p).total)*fit(p)}; }).sort((a,b)=>b.k-a.k).slice(0,n||8).map(x=>x.p);
}
function sc4Intern(b){ const out=[]; const s=sv4S();
  players.forEach(p=>{ const t=sv4Team(p,s); if(!t||t===b.team)return; if(!(p.pos===b.pos||(p.pos2||[]).includes(b.pos)))return; if(b.team==='1'&&(t==='2'||t==='A'))out.push({p,q:t==='2'?'zweite':'jugend'}); if(b.team==='2'&&t==='A')out.push({p,q:'jugend'}); });
  return out.sort((a,b2)=>scores(b2.p).total-scores(a.p).total).slice(0,4); }
function sc4Stage(b){ const L=SV4.bk.filter(x=>x.bedarf_id===b.id); if(b.status==='entschieden'||b.status==='erledigt'||L.some(x=>x.status==='zusage'))return 7; if(L.some(x=>x.status==='kontakt'))return 6; if(L.some(x=>x.status==='shortlist'))return 5;
  if(L.some(x=>x.status==='beobachten')||L.some(x=>SV4.eyeBy.has(x.player_id)))return 4; if(L.length)return 3; if(b.profil&&Object.keys(b.profil).length)return 2; return 1; }
function sc4Bedarf(){
  const P=document.getElementById('panel-bedarf'); if(!P)return;
  if(!sv4Can()){ P.innerHTML='<div class="card"><div class="empty">Bedarf & Aufträge sehen Trainer, Kaderplanung und Vorstand.</div></div>'; return; }
  let host=document.getElementById('sc4Bed'); if(!host){ host=document.createElement('div'); host.id='sc4Bed'; P.prepend(host); }
  if(!SV4.loaded){ host.innerHTML='<div class="card"><div class="empty">Lade …</div></div>'; sv4Load(); return; }
  const f=SC4.flt, L=SV4.bed.filter(b=>f==='alle'||(f==='offen'?!['erledigt','verworfen'].includes(b.status):['erledigt','verworfen'].includes(b.status)));
  const open=SC4.open&&SV4.bed.find(b=>b.id===SC4.open);
  host.innerHTML=`<div class="card bd4-top"><div class="kd4-lh"><h3>${SVI('target')} Bedarfe <small>Ausgangspunkt fürs Scouting</small></h3><button class="btn sm" data-bnew>${SVI('plus')} Neuer Bedarf</button></div>
      <div class="flow4">${SC4_FLOW.map((t,i)=>`<span class="${i<=1?'on':''}">${t}</span>`).join('<i>›</i>')}</div>
      <div class="chips4">${[['offen','Offen'],['zu','Abgeschlossen'],['alle','Alle']].map(([k,t])=>`<button type="button" class="${f===k?'on':''}" data-bf="${k}">${t}</button>`).join('')}</div>
      ${L.length?`<div class="bd4g">${L.map(b=>{ const K=SV4.bk.filter(x=>x.bedarf_id===b.id&&svScoutInScope(sv4P(x.player_id))), st=sc4Stage(b), fp=b.fuer_player&&sv4P(b.fuer_player);
        return `<button type="button" class="bd4c${open&&open.id===b.id?' on':''} p-${b.prio}" data-bopen="${b.id}"><b>${sv4Esc(b.titel)}</b>
          <span>${sv4Esc(SV4_POSL[b.pos]||b.pos)} · ${SV4_TEAM[b.team]} · ${sv4SL(b.saison)} · ${SC4_ZP[b.zeitpunkt]||''}</span>
          <small>${sv4Esc(SC4_GRUND[b.grund]||'')}${fp?' für '+sv4Esc(fp.name):''} · ${K.length} Kandidaten${K.filter(x=>x.status==='shortlist').length?' · '+K.filter(x=>x.status==='shortlist').length+' Shortlist':''}</small>
          <i class="st4"><u style="width:${Math.round(st/7*100)}%"></u></i><em>${SC4_FLOW[st]}</em></button>`; }).join('')}</div>`
      :`<div class="empty">${f==='offen'?'Kein offener Bedarf. Im Kader unter „Bedarfsanalyse“ siehst du, wo etwas fehlt, oder lege hier einen an.':'Nichts in dieser Auswahl.'}</div>`}
    </div>${open?sc4Detail(open):''}`;
  host.querySelector('[data-bnew]').onclick=()=>sc4BedarfEditor(null,{});
  host.querySelectorAll('[data-bf]').forEach(b=>b.onclick=()=>{ SC4.flt=b.dataset.bf; sc4Bedarf(); });
  host.querySelectorAll('[data-bopen]').forEach(b=>b.onclick=()=>{ SC4.open=SC4.open===b.dataset.bopen?null:b.dataset.bopen; sc4Bedarf(); if(SC4.open)setTimeout(()=>{ const d=document.getElementById('bd4D'); if(d)d.scrollIntoView({behavior:'smooth',block:'start'}); },40); });
  if(open)sc4DetailWire(host,open);
  // KI-Aufträge, Beobachtet & Positions-Prioritäten gehören hierher
  try{ if(typeof sc2Load==='function'){ sc2Load(); sc2ScoutBox(); sc2PlanBox(); } }catch(e){ console.warn(e); }
}
function sc4Detail(b){
  const K=SV4.bk.filter(x=>x.bedarf_id===b.id&&svScoutInScope(sv4P(x.player_id))), pr=b.profil||{}, st=sc4Stage(b);
  const jobs=(typeof SC2!=='undefined'?SC2.jobs:[]).filter(j=>j.bedarf_id===b.id);
  const sug=sc4Cands(b,6), intern=sc4Intern(b);
  const prof=[pr.alter_von||pr.alter_bis?`Alter ${pr.alter_von||'?'}–${pr.alter_bis||'?'}`:'',pr.fuss?pr.fuss:'',pr.liga_min?`mind. ${LIGA_NAME[pr.liga_min]||pr.liga_min}`:'',pr.km_max?`bis ${pr.km_max} km`:'',pr.rolle?sv4Esc(pr.rolle):'',pr.jugend?'inkl. A-Jugend':''].filter(Boolean);
  const row=x=>{ const p=sv4P(x.player_id); if(!p)return ''; const s=scores(p), E=sv4Eye(p.id), W=typeof wscoreSafe==='function'&&!p.isJugend?wscoreSafe(p):null;
    return `<div class="bk4r s-${x.status}"><button type="button" class="kr4-n" data-svp="${sv4Esc(p.id)}"><b>${sv4Esc(p.name)}</b><small>${sv4Esc((svLigaJetzt(p)||{}).club||p.club)} · ${sv4Esc(svPosTxt(p)||'')}${p.alter!=null?' · '+p.alter+' J.':''}${x.quelle!=='manuell'?' · via '+sv4Esc(x.quelle):''}</small></button>
      <span class="kr4-o" style="color:${tierColor(s.total)}">${Math.round(s.total)}</span>${W?`<span class="bk4w" title="Wechsel-Index: Heuristik, keine Wahrscheinlichkeit">🔁 ${W.w}</span>`:'<span></span>'}<span class="bk4e" title="Eye-Tests">${E?'👁 '+E.n:'👁 –'}</span>
      <select data-bks="${sv4Esc(p.id)}" aria-label="Status">${SC4_ST.concat([['verworfen','Verworfen']]).map(([k,t])=>`<option value="${k}"${x.status===k?' selected':''}>${t}</option>`).join('')}</select></div>`; };
  return `<div class="card bd4d" id="bd4D"><div class="kd4-lh"><h3>${sv4Esc(b.titel)}</h3><div class="btnrow"><button class="btn sm ghost" data-bedit>${SVI('sliders')} Bearbeiten</button>${K.length>1?`<button class="btn sm ghost" data-bcmp>${SVI('chart')} Vergleichen</button>`:''}</div></div>
    <div class="flow4">${SC4_FLOW.map((t,i)=>`<span class="${i<=st?'on':''}${i===st?' now':''}">${t}</span>`).join('<i>›</i>')}</div>
    <div class="bd4-p"><span><b>${sv4Esc(SV4_POSL[b.pos]||b.pos)}</b> · ${SV4_TEAM[b.team]} · ${sv4SL(b.saison)} · ${SC4_ZP[b.zeitpunkt]}</span><span>Prio <b>${sv4Esc(b.prio)}</b> · ${sv4Esc(SC4_GRUND[b.grund]||'')}${b.fuer_player&&sv4P(b.fuer_player)?' für '+sv4Esc(sv4P(b.fuer_player).name):''}</span>
      <span>Suchprofil: ${prof.length?prof.join(' · '):'<i>noch offen: unter „Bearbeiten“ festlegen</i>'}</span>${b.notiz?`<span class="note small">${sv4Esc(b.notiz)}</span>`:''}</div>
    <h5 class="bd4h">Kandidaten <i>${K.length}</i></h5>
    ${K.length?`<div class="bk4l">${SC4_ST.concat([['verworfen','']]).map(([k])=>K.filter(x=>x.status===k).map(row).join('')).join('')}</div>`:'<p class="note">Noch keine Kandidaten: aus den Vorschlägen übernehmen, per KI-Auftrag suchen oder im Spielermarkt bei einem Spieler „+ Bedarf“ tippen.</p>'}
    ${intern.length?`<h5 class="bd4h">Interne Lösung prüfen</h5><div class="sg4">${intern.map(({p,q})=>`<button type="button" class="sg4c" data-badd="${sv4Esc(p.id)}" data-bq="${q}"><b>${sv4Esc(p.name)}</b><span>${q==='zweite'?'2. Mannschaft':'A-Jugend'} · ${sv4Esc(svPosTxt(p)||'')} · ${Math.round(scores(p).total)}</span><i>+ prüfen</i></button>`).join('')}</div>`:''}
    <h5 class="bd4h">Vorschläge nach Suchprofil</h5>${sug.length?`<div class="sg4">${sug.map(p=>{ const W=typeof wscoreSafe==='function'&&!p.isJugend?wscoreSafe(p):null; return `<button type="button" class="sg4c" data-badd="${sv4Esc(p.id)}" data-bq="manuell"><b>${sv4Esc(p.name)}</b><span>${sv4Esc((svLigaJetzt(p)||{}).club||p.club)} · ${p.alter!=null?p.alter+' J. · ':''}${Math.round(scores(p).total)}${W?' · 🔁 '+W.w:''}</span><i>+ Kandidat</i></button>`; }).join('')}</div>`:'<p class="note small">Keine weiteren Treffer mit diesem Profil.</p>'}
    <h5 class="bd4h">KI-Scouting-Aufträge</h5>
    <div class="bj4">${jobs.map(j=>`<button type="button" class="sc2j s-${j.status}" data-job4="${j.id}"><b>${sv4Esc(j.titel||'Auftrag')}</b><span>${{wartet:'⏳ wartet',laeuft:'⚙️ läuft …',fertig:'✓ fertig',fehler:'⚠️ Fehler'}[j.status]||j.status} · ${sv4D(j.created_at)}</span></button>${j.status==='fertig'&&j.ergebnis&&(j.ergebnis.kandidaten||[]).length?`<button type="button" class="lk4" data-jtake="${j.id}">⤵ ${(j.ergebnis.kandidaten||[]).length} Treffer als Kandidaten übernehmen</button>`:''}`).join('')}
      <button type="button" class="btn sm" data-bjob>${SVI('search')} Scouts losschicken (KI-Auftrag)</button></div>
    <div class="btnrow bd4-st">${['offen','suche','shortlist','entschieden','erledigt','verworfen'].map(k=>`<button type="button" class="pchip${b.status===k?' on':''}" data-bstat="${k}">${({offen:'Offen',suche:'Suche läuft',shortlist:'Shortlist',entschieden:'Entschieden',erledigt:'Erledigt',verworfen:'Verworfen'})[k]}</button>`).join('')}</div></div>`;
}
function sc4DetailWire(host,b){
  host.querySelectorAll('#bd4D [data-svp]').forEach(x=>x.onclick=()=>openModal(x.dataset.svp));
  const ed=host.querySelector('[data-bedit]'); if(ed)ed.onclick=()=>sc4BedarfEditor(b.id);
  const cm=host.querySelector('[data-bcmp]'); if(cm)cm.onclick=()=>sc4Compare(SV4.bk.filter(x=>x.bedarf_id===b.id&&!['absage','verworfen'].includes(x.status)).map(x=>x.player_id));
  host.querySelectorAll('[data-badd]').forEach(x=>x.onclick=async()=>{ try{ await sc4Add(b.id,x.dataset.badd,x.dataset.bq); sc4Bedarf(); }catch(e){ kToast('⚠️ '+e.message); } });
  host.querySelectorAll('[data-bks]').forEach(x=>x.onchange=async()=>{ try{ const {error}=await SVB.sb.from('bedarf_kandidaten').update({status:x.value}).eq('bedarf_id',b.id).eq('player_id',x.dataset.bks); if(error)throw new Error(error.message);
    const r=SV4.bk.find(y=>y.bedarf_id===b.id&&y.player_id===x.dataset.bks); if(r)r.status=x.value;
    if(x.value==='zusage'){ const p=sv4P(x.dataset.bks); await sv4SSSet(p.id,b.saison,{team:b.team,zukunft:'neu',pos:b.pos}); kToast('🎉 '+p.name+' steht jetzt im Kader '+sv4SL(b.saison)); }
    sv4Bump(); sc4Bedarf(); }catch(e){ kToast('⚠️ '+e.message); } });
  host.querySelectorAll('[data-bstat]').forEach(x=>x.onclick=async()=>{ const {error}=await SVB.sb.from('bedarfe').update({status:x.dataset.bstat}).eq('id',b.id); if(error)return kToast('⚠️ '+error.message); b.status=x.dataset.bstat; sc4Bedarf(); });
  host.querySelectorAll('[data-job4]').forEach(x=>x.onclick=()=>sc2JobView(x.dataset.job4));
  host.querySelectorAll('[data-jtake]').forEach(x=>x.onclick=async()=>{ const j=SC2.jobs.find(y=>y.id===x.dataset.jtake); let n=0; for(const k of (j.ergebnis.kandidaten||[])){ if(sv4P(k.id)&&!SV4.bk.some(y=>y.bedarf_id===b.id&&y.player_id===k.id)){ try{ await sc4Add(b.id,k.id,'auftrag',true); n++; }catch(e){} } } kToast(`✓ ${n} Kandidaten übernommen`); sc4Bedarf(); });
  const jb=host.querySelector('[data-bjob]'); if(jb)jb.onclick=()=>sc4Job(b);
}
async function sc4Add(bid,pid,q,silent){
  const row={bedarf_id:bid,player_id:pid,quelle:q||'manuell',status:'kandidat'};
  const {data,error}=await SVB.sb.from('bedarf_kandidaten').upsert(row,{onConflict:'bedarf_id,player_id'}).select().single(); if(error)throw new Error(error.message);
  SV4.bk=SV4.bk.filter(x=>!(x.bedarf_id===bid&&x.player_id===pid)).concat([data]); sv4Bump();
  const b=SV4.bed.find(x=>x.id===bid); if(b&&b.status==='offen'){ await SVB.sb.from('bedarfe').update({status:'suche'}).eq('id',bid); b.status='suche'; }
  if(!silent)kToast('✓ '+(sv4P(pid)||{}).name+' ist Kandidat für „'+(b?b.titel:'Bedarf')+'“');
}
async function sc4Job(b){
  const pr=b.profil||{}, fp=b.fuer_player&&sv4P(b.fuer_player);
  const frage=`Bedarf: ${SV4_POSL[b.pos]||b.pos} für ${SV4_TEAM[b.team]} ${sv4SL(b.saison)} (${SC4_ZP[b.zeitpunkt]}, ${SC4_GRUND[b.grund]}${fp?' für '+fp.name:''}). `+
    [pr.alter_von||pr.alter_bis?`Alter ${pr.alter_von||'?'}–${pr.alter_bis||'?'}`:'',pr.fuss?pr.fuss:'',pr.liga_min?'mind. '+(LIGA_NAME[pr.liga_min]||pr.liga_min):'',pr.km_max?'bis '+pr.km_max+' km':'',pr.rolle||'',b.notiz||''].filter(Boolean).join(', ');
  try{ const {data:id,error:e1}=await SVB.sb.rpc('scout_job_neu',{p_art:'position',p_player:null,p_pos:b.pos==='Flügel'?'ST':b.pos,p_saison:b.saison,p_frage:frage.slice(0,500)}); if(e1)throw new Error(e1.message);
    const {error}=await SVB.sb.rpc('scout_job_bedarf',{p_job:id,p_bedarf:b.id,p_profil:Object.keys(pr).length?pr:null}); if(error)console.warn(error);
    SVB.sb.functions.invoke('scout-auftrag',{body:{job:id}}).then(()=>setTimeout(()=>sc2Load(true).then(()=>{ if(svCurTab()==='bedarf')sc4Bedarf(); }),1500)).catch(()=>{});
    kToast('🔎 Scouts sind los. Meldung kommt, sobald der Bericht fertig ist');
    await sc2Load(true); const j=SC2.jobs.find(x=>x.id===id); if(j)j.bedarf_id=b.id; if(b.status==='offen'){ await SVB.sb.from('bedarfe').update({status:'suche'}).eq('id',b.id); b.status='suche'; } sc4Bedarf(); }
  catch(e){ kToast('⚠️ '+e.message); }
}
function sc4BedarfEditor(id,pre){
  const b=id?SV4.bed.find(x=>x.id===id):null, P=Object.assign({pos:'IV',team:'1',saison:sv4SAdd(sv4S(),1),zeitpunkt:'sommer',grund:'verstaerkung',prio:'mittel'},pre||{},b||{}), pr=(b&&b.profil)||{};
  const kad=players.filter(p=>sv4Team(p)===P.team||sv4Team(p)==='1').sort((a,c)=>a.name.localeCompare(c.name));
  const sel=(id2,opts,v)=>`<select id="${id2}">${opts.map(([k,t])=>`<option value="${k}"${String(v)===String(k)?' selected':''}>${t}</option>`).join('')}</select>`;
  const M=svModal(`<div class="mhead"><div class="rm-ic" style="width:46px;height:46px">${SVI('target')}</div><div><h2 style="margin:0">${b?'Bedarf bearbeiten':'Neuer Bedarf'}</h2><div class="msub">Erst der Bedarf, dann die Suche. Kandidaten und KI-Aufträge hängen darunter</div></div></div>
    <div class="editgrid bd4f">
      <div class="field w"><label>Titel</label><input id="b4t" maxlength="120" value="${sv4Esc(b?b.titel:'')}" placeholder="z. B. Neuer Innenverteidiger für ${sv4SL(P.saison)}"></div>
      <div class="field"><label>Position</label>${sel('b4p',SV4_POS.map(k=>[k,SV4_POSL[k]]),P.pos)}</div>
      <div class="field"><label>Mannschaft</label>${sel('b4m',[['1','1. Mannschaft'],['2','2. Mannschaft'],['A','A-Jugend']],P.team)}</div>
      <div class="field"><label>Saison</label>${sel('b4s',sv4Seasons().map(s=>[s,sv4SL(s)]),P.saison)}</div>
      <div class="field"><label>Wann</label>${sel('b4z',Object.entries(SC4_ZP),P.zeitpunkt)}</div>
      <div class="field"><label>Grund</label>${sel('b4g',Object.entries(SC4_GRUND),P.grund)}</div>
      <div class="field"><label>Ersatz für</label>${sel('b4f',[['','–']].concat(kad.map(p=>[p.id,p.name+' ('+(p.pos||'')+')'])),P.fuer_player||'')}</div>
      <div class="field"><label>Priorität</label>${sel('b4r',[['hoch','Hoch'],['mittel','Mittel'],['niedrig','Niedrig']],P.prio)}</div>
      <div class="field"><label>Alter von–bis</label><div class="two4"><input type="number" id="b4a1" min="15" max="45" value="${pr.alter_von??''}" placeholder="18"><input type="number" id="b4a2" min="15" max="45" value="${pr.alter_bis??''}" placeholder="30"></div></div>
      <div class="field"><label>Starker Fuß</label>${sel('b4fu',[['','egal'],['Links','Links'],['Rechts','Rechts']],pr.fuss||'')}</div>
      <div class="field"><label>Mindest-Liga</label>${sel('b4l',[['','egal'],['GL','Gruppenliga'],['KOL','Kreisoberliga'],['A','Kreisliga A'],['B','Kreisliga B'],['C','Kreisliga C']],pr.liga_min||'')}</div>
      <div class="field"><label>Max. Entfernung (km)</label><input type="number" id="b4k" min="0" max="200" value="${pr.km_max??''}" placeholder="25"></div>
      <div class="field w"><label>Rolle / worauf es ankommt</label><input id="b4ro" maxlength="160" value="${sv4Esc(pr.rolle||'')}" placeholder="z. B. kopfballstarker Abwehrchef, Linksfuß für die Dreierkette"></div>
      <div class="field w"><label class="jutog"><input type="checkbox" id="b4j"${pr.jugend?' checked':''}> A-Jugend-Spieler einbeziehen</label></div>
      <div class="field w"><label>Notiz</label><input id="b4n" maxlength="800" value="${sv4Esc(b?b.notiz||'':'')}"></div>
    </div>
    <div class="btnrow" style="margin-top:12px"><button class="btn" id="b4save">${SVI('check')} ${b?'Speichern':'Bedarf anlegen'}</button>${b?`<button class="btn ghost" id="b4del">${SVI('trash')} Löschen</button>`:''}<button class="btn ghost" id="b4x">Abbrechen</button></div>`);
  const upT=()=>{ const t=M.querySelector('#b4t'); if(!b&&!t.dataset.touched){ const p=M.querySelector('#b4p').value, s=M.querySelector('#b4s').value, f=M.querySelector('#b4f'), fn=f.value&&sv4P(f.value); t.value=(fn?'Ersatz für '+fn.name+' · ':'Neuer ')+(SV4_POSL[p]||p)+' '+sv4SL(s); } };
  M.querySelector('#b4t').oninput=e=>e.target.dataset.touched='1'; ['#b4p','#b4s','#b4f'].forEach(s=>M.querySelector(s).onchange=upT); upT();
  M.querySelector('#b4x').onclick=()=>closeOverlay();
  M.querySelector('#b4save').onclick=async e=>{ const v=s=>M.querySelector(s).value.trim();
    const prof={}; if(v('#b4a1'))prof.alter_von=+v('#b4a1'); if(v('#b4a2'))prof.alter_bis=+v('#b4a2'); if(v('#b4fu'))prof.fuss=v('#b4fu'); if(v('#b4l'))prof.liga_min=v('#b4l'); if(v('#b4k'))prof.km_max=+v('#b4k'); if(v('#b4ro'))prof.rolle=v('#b4ro'); if(M.querySelector('#b4j').checked)prof.jugend=true;
    const row={titel:v('#b4t')||'Bedarf',pos:v('#b4p'),team:v('#b4m'),saison:v('#b4s'),zeitpunkt:v('#b4z'),grund:v('#b4g'),fuer_player:v('#b4f')||null,prio:v('#b4r'),profil:prof,notiz:v('#b4n')||null};
    e.currentTarget.disabled=true;
    try{ const r=b?await SVB.sb.from('bedarfe').update(row).eq('id',b.id).select().single():await SVB.sb.from('bedarfe').insert(row).select().single(); if(r.error)throw new Error(r.error.message);
      SV4.bed=[r.data].concat(SV4.bed.filter(x=>x.id!==r.data.id)); SC4.open=r.data.id; SC4.flt='offen'; closeOverlay(); kToast(b?'✓ Gespeichert':'✓ Bedarf angelegt: jetzt Kandidaten sammeln');
      if(svCurTab()!=='bedarf')goTab('bedarf'); else sc4Bedarf(); }catch(x){ kToast('⚠️ '+x.message); e.currentTarget.disabled=false; } };
  const d=M.querySelector('#b4del'); if(d)d.onclick=async()=>{ if(!d.classList.contains('sure')){ d.classList.add('sure'); d.textContent='Wirklich löschen?'; return; }
    const {error}=await SVB.sb.from('bedarfe').delete().eq('id',b.id); if(error)return kToast('⚠️ '+error.message); SV4.bed=SV4.bed.filter(x=>x.id!==b.id); SV4.bk=SV4.bk.filter(x=>x.bedarf_id!==b.id); SC4.open=null; closeOverlay(); sc4Bedarf(); };
}

/* ---------- Vergleich: gezielt je Position oder Auftrag ---------- */
function sc4Compare(ids){ ids=(ids||[]).filter(Boolean).slice(0,3); goTab('cmp'); setTimeout(()=>{ ['cmp1','cmp2','cmp3'].forEach((k,i)=>{ const el=document.getElementById(k); if(el){ el.value=ids[i]||''; } }); try{ updateCompare(); }catch(e){} },60); }
function sc4CmpBar(){
  const P=document.getElementById('panel-cmp'); if(!P)return; let d=P.querySelector('.cm4'); if(!d){ d=document.createElement('div'); d.className='card cm4'; P.prepend(d); }
  const s=sv4S(), own=pos=>players.filter(p=>sv4Team(p,s)==='1'&&p.pos===pos).sort((a,b)=>scores(b).total-scores(a).total).map(p=>p.id);
  const bed=SV4.bed.filter(b=>!['erledigt','verworfen'].includes(b.status));
  d.innerHTML=`<b>Schnell vergleichen</b><div class="chips4">${['TW','IV','AV','ZM','OM','ST'].map(pos=>`<button type="button" data-cpos="${pos}">Unsere ${pos}</button>`).join('')}${bed.map(b=>`<button type="button" data-cbed="${b.id}">📋 ${sv4Esc(b.titel)}</button>`).join('')}</div>`;
  d.querySelectorAll('[data-cpos]').forEach(b=>b.onclick=()=>sc4Compare(own(b.dataset.cpos)));
  d.querySelectorAll('[data-cbed]').forEach(b=>b.onclick=()=>sc4Compare(SV4.bk.filter(x=>x.bedarf_id===b.dataset.cbed&&!['absage','verworfen'].includes(x.status)).map(x=>x.player_id)));
}

/* ---------- Spielerprofil: „+ Bedarf“ für externe Spieler ---------- */
{ const _om42=openModal; openModal=function(id){ const r=_om42.apply(this,arguments); try{ const M=document.getElementById('modal'), p=sv4P(id); const act=M&&M.querySelector('.pf4-act');
  if(act&&p&&!sv4Team(p)&&sv4Can()&&SV4.bed.some(b=>!['erledigt','verworfen'].includes(b.status))&&!act.querySelector('[data-pf4bed]')){
    const b=document.createElement('button'); b.className='btn sm ghost'; b.dataset.pf4bed='1'; b.innerHTML=SVI('target')+' Zu Bedarf'; act.appendChild(b);
    b.onclick=()=>{ const L=SV4.bed.filter(x=>!['erledigt','verworfen'].includes(x.status)); const m=document.createElement('div'); m.className='zm4';
      m.innerHTML=`<b>Kandidat für …</b>${L.map(x=>`<button type="button" data-bb="${x.id}" class="${SV4.bk.some(y=>y.bedarf_id===x.id&&y.player_id===p.id)?'on':''}">${sv4Esc(x.titel)}</button>`).join('')}`; document.body.appendChild(m);
      const r2=b.getBoundingClientRect(); m.style.top=Math.min(window.innerHeight-m.offsetHeight-10,r2.bottom+6)+'px'; m.style.left=Math.max(8,Math.min(window.innerWidth-m.offsetWidth-8,r2.left))+'px';
      const close=e=>{ if(!m.contains(e.target)){ m.remove(); document.removeEventListener('click',close,true); } }; setTimeout(()=>document.addEventListener('click',close,true),10);
      m.querySelectorAll('[data-bb]').forEach(x=>x.onclick=async()=>{ m.remove(); try{ await sc4Add(x.dataset.bb,p.id,'manuell'); openModal(p.id); }catch(e){ kToast('⚠️ '+e.message); } }); }; } }catch(e){ console.warn(e); } return r; }; }

/* ---------- Positions-Bedarf fürs Radar: berücksichtigt offene Bedarfe ---------- */
if(typeof sc2Need==='function'){ const _sn4=sc2Need; sc2Need=function(pos){ let n=_sn4.apply(this,arguments); try{ const w={hoch:3,mittel:2,niedrig:1}; SV4.bed.forEach(b=>{ if(['erledigt','verworfen'].includes(b.status))return; const bp=b.pos==='Flügel'?'ST':b.pos; if(bp===pos)n=Math.max(n,w[b.prio]||2); }); }catch(e){} return n; }; }
/* Positions-Prioritäten nur noch im Tab „Bedarf & Aufträge“ – die Saisonplanung steckt jetzt im Kaderplan */
if(typeof sc2PlanBox==='function'){ const _pb4=sc2PlanBox; sc2PlanBox=function(){ if(!document.getElementById('sc2Plan'))return; const r=_pb4.apply(this,arguments); try{ document.querySelectorAll('#sc2Plan .sc2sp').forEach(x=>x.remove()); }catch(e){} return r; }; }

{ const _gt42=goTab; goTab=function(tab){ const r=_gt42.apply(this,arguments); try{ const c=svCurTab();
  if(c==='scout'||c==='db')sc4MarktBar(); if(c==='bedarf')sc4Bedarf(); if(c==='radar'||c==='gems')sc4RadarTabs(); if(c==='cmp')sc4CmpBar();
  if(c==='kandidaten'){ const P=document.getElementById('panel-kandidaten'); if(P&&!P.querySelector('.kn4')){ const d=document.createElement('p'); d.className='note kn4'; d.innerHTML='Hier stehen nur <b>externe</b> Kandidaten. Eigene Spieler: Kader → Gespräche. Kandidaten für einen konkreten Bedarf: Scouting → Bedarf & Aufträge.'; P.prepend(d); } }
  }catch(e){ console.warn('Scouting 4.0',e); } return r; }; }

/* =====================================================================
   SV/BSC Sportzentrale 4.0 · Kader (Lukas' Punkte 18–21)
   - Ausgangspunkt: der aktuelle Kader je Mannschaft (1. · 2. · A-Jugend) und Saison (heute + 2 Jahre)
   - Zukunft je Spieler (Standard: bleibt) → daraus der Kader der nächsten Saisons
   - Links die Liste, rechts die Aufstellung im FIFA-Stil (Haupt- und Alternativ-Aufstellung, Bank, weitere Plätze)
   - Darunter die Bedarfsanalyse: was fehlt? jetzt (Winter, aus der Zweiten, aus der Jugend) · nächste Saison (Bedarf → Scouting)
   - Spielergespräche: letztes Gespräch, Sicht des Spielers, offene Themen, Entscheidung
   ===================================================================== */
const KD4={team:'1',saison:null,art:'haupt',gf:'alle'};
const KD4_LINES=[['Tor',['TW']],['Abwehr',['IV','AV']],['Mittelfeld',['ZM','OM','Flügel']],['Angriff',['ST']]];
const KD4_DEFSOLL={TW:2,IV:4,AV:3,ZM:4,OM:2,'Flügel':3,ST:3};

function kd4S(){ return KD4.saison||sv4S(); }
function kd4Members(team,s){
  const out=[]; const seen=new Set();
  players.forEach(p=>{ const t=sv4Team(p,s); const r=sv4SS(p.id,s);
    if(t===team||(r&&r.team===team&&(r.zukunft==='geht'||r.zukunft==='karriereende'))){ if(!seen.has(p.id)){ seen.add(p.id); out.push(p); } }
    else if(r&&r.zukunft==='ziel'&&r.team===team&&!seen.has(p.id)){ seen.add(p.id); out.push(p); } });
  // wer in der Vorsaison dabei war und jetzt geht, taucht als Abgang auf
  const prev=sv4SAdd(s,-1);
  if(s!==sv4S())players.forEach(p=>{ if(seen.has(p.id))return; const r=sv4SS(p.id,s); if(r&&(r.zukunft==='geht'||r.zukunft==='karriereende')&&sv4Team(p,prev)===team){ seen.add(p.id); out.push(p); } });
  return out;
}
function kd4Status(p,s,team){
  const t=sv4Team(p,s), r=sv4SS(p.id,s), prev=sv4SAdd(s,-1), pr=sv4SS(p.id,prev);
  if(r&&r.zukunft==='ziel')return 'ziel';
  if(!t)return 'weg';
  if(s!==sv4S()&&sv4Team(p,prev)!==team&&t===team)return 'neu';
  const nx=s===sv4S()&&typeof sv60Target==='function'?sv60Target(s):sv4SAdd(s,1);   /* 0.22: nächste Halbserie */
  return (sv4SS(p.id,nx)||{}).zukunft||'bleibt';
}
function kd4Pos(p,s){ const r=sv4SS(p.id,s); return (r&&r.pos)||p.pos||'ZM'; }
function kd4Ovr(p){ try{ return Math.round(scores(p).total); }catch(e){ return 0; } }

/* ---------- Aufstellung je Mannschaft & Saison ---------- */
function kd4Live(){ return KD4.team==='1'&&kd4S()===sv4S()&&KD4.art==='haupt'; }
function kd4Lineup(){
  if(kd4Live())return {formation:LINEUP.formation,slots:Object.assign({},LINEUP.slots),bank:(SV4.auf.get('1|'+kd4S()+'|haupt')||{}).bank||[],live:true};
  const r=SV4.auf.get(KD4.team+'|'+kd4S()+'|'+KD4.art);
  if(r)return {formation:r.formation,slots:Object.assign({},r.slots),bank:(r.bank||[]).slice()};
  // Vorschlag: aus der Hauptaufstellung übernehmen bzw. automatisch besetzen
  const base=KD4.art!=='haupt'?SV4.auf.get(KD4.team+'|'+kd4S()+'|haupt'):null;
  if(base)return {formation:base.formation,slots:Object.assign({},base.slots),bank:(base.bank||[]).slice(),auto:true};
  const form=KD4.team==='1'&&LINEUP.formation?LINEUP.formation:'4-4-2', F=FORMATIONS[form]||FORMATIONS['4-4-2'];
  const pool=kd4Members(KD4.team,kd4S()).filter(p=>['bleibt','neu','unsicher','hoch','runter','ziel'].includes(kd4Status(p,kd4S(),KD4.team))).sort((a,b)=>kd4Ovr(b)-kd4Ovr(a));
  const slots={}, used=new Set();
  F.forEach(([role],i)=>{ const want=ROLE2POS[role]; const p=pool.find(x=>!used.has(x.id)&&kd4Pos(x,kd4S())===want)||null; if(p){ slots[i]=p.id; used.add(p.id); } });
  F.forEach(([role],i)=>{ if(slots[i])return; const want=ROLE2POS[role]; const p=pool.find(x=>!used.has(x.id)&&(x.pos2||[]).includes(want)); if(p){ slots[i]=p.id; used.add(p.id); } });
  return {formation:form,slots,bank:pool.filter(p=>!used.has(p.id)).slice(0,7).map(p=>p.id),auto:true};
}
async function kd4LineupSave(L){
  if(kd4Live()){ LINEUP.formation=L.formation; LINEUP.slots=L.slots; try{ lineupSync(); }catch(e){} try{ renderLineup(); }catch(e){} }
  const row={team:KD4.team,saison:kd4S(),art:KD4.art,formation:L.formation,slots:L.slots,bank:L.bank||[]};
  const {data,error}=await SVB.sb.from('aufstellungen').upsert(row,{onConflict:'team,saison,art'}).select().single();
  if(error)throw new Error(error.message); SV4.auf.set(row.team+'|'+row.saison+'|'+row.art,data);
}

/* ---------- Seite ---------- */
function kd4Render(){
  const P=document.getElementById('panel-kader'); if(!P)return;
  if(!sv4Can()){ P.innerHTML='<div class="card"><div class="empty">Den Kader planen Trainer, Kaderplanung und Vorstand.</div></div>'; return; }
  if(!SV4.loaded){ P.innerHTML='<div class="card"><div class="empty">Lade Kader …</div></div>'; sv4Load(); return; }
  const s=kd4S(), team=KD4.team, all=kd4Members(team,s);
  const st=p=>kd4Status(p,s,team);
  const aktiv=all.filter(p=>!['weg','geht','karriereende','ziel'].includes(st(p))||st(p)==='geht'&&s===sv4S());
  const im=all.filter(p=>st(p)!=='weg'&&st(p)!=='ziel');
  const ages=im.map(p=>p.alter).filter(a=>a!=null);
  const cnt=k=>all.filter(p=>st(p)===k).length;
  P.innerHTML=`<div class="kd4">
    <div class="card kd4-top">
      <div class="seg4">${[['1','1. Mannschaft'],['2','2. Mannschaft'],['A','A-Jugend']].map(([k,t])=>`<button type="button" class="${team===k?'on':''}" data-kt="${k}">${t}</button>`).join('')}</div>
      <div class="seg4 sm">${sv4Seasons().map(x=>`<button type="button" class="${s===x?'on':''}" data-ks="${x}">${sv4SL(x)}${x===sv4S()?' <i>jetzt</i>':''}</button>`).join('')}</div>
      <div class="kd4-sum"><span><b>${im.length}</b> im Kader</span>${cnt('unsicher')?`<span class="warn"><b>${cnt('unsicher')}</b> unsicher</span>`:''}${cnt('geht')+cnt('karriereende')?`<span class="bad"><b>${cnt('geht')+cnt('karriereende')}</b> gehen</span>`:''}${cnt('neu')?`<span class="ok"><b>${cnt('neu')}</b> neu</span>`:''}${cnt('ziel')?`<span class="info"><b>${cnt('ziel')}</b> Wunsch</span>`:''}<span>Ø Alter <b>${ages.length?sv4Num(ages.reduce((a,b)=>a+b,0)/ages.length,1):'–'}</b></span></div>
      <p class="note small">${s===sv4S()?'Laufende Saison. Tippe beim Spieler auf die Zukunft für '+sv4SL(sv4SAdd(s,1))+' · Standard ist „bleibt“.':'Planung '+sv4SL(s)+': Grundlage ist die Zukunft aus '+sv4SL(sv4SAdd(s,-1))+'. Neuzugänge kommen über Bedarf & Scouting oder „+ Spieler“.'}</p>
    </div>
    <div class="kd4-main">
      <div class="card kd4-list">${kd4ListHtml(all,s,team)}</div>
      <div class="card kd4-pitch">${kd4PitchHtml()}</div>
    </div>
    <div class="card kd4-need" id="kd4Need">${kd4NeedHtml(all,s,team)}</div>
  </div>`;
  P.querySelectorAll('[data-kt]').forEach(b=>b.onclick=()=>{ KD4.team=b.dataset.kt; KD4.art='haupt'; kd4Render(); });
  P.querySelectorAll('[data-ks]').forEach(b=>b.onclick=()=>{ KD4.saison=b.dataset.ks; KD4.art='haupt'; kd4Render(); });
  kd4Wire(P);
}
function kd4Row(p,s,team){
  const k=kd4Status(p,s,team), z=SV4_ZUK[k==='weg'?'geht':k]||['',''], g=SV4.gs.find(x=>x.player_id===p.id), ov=kd4Ovr(p);
  const gd=g?Math.floor((Date.now()-new Date(g.datum))/86400000):null;
  const pos2=(p.pos2||[]).filter(x=>x!==p.pos);
  return `<div class="kr4${k==='geht'||k==='karriereende'||k==='weg'?' out':''}${k==='ziel'?' ziel':''}" data-kp="${sv4Esc(p.id)}">
    <span class="kr4-pos">${sv4Esc(kd4Pos(p,s))}</span>
    <button type="button" class="kr4-n" data-svp="${sv4Esc(p.id)}"><b>${sv4Esc(p.name)}</b><small>${p.alter!=null?p.alter+' J.':''}${pos2.length?' · auch '+sv4Esc(pos2.join(', ')):''}${k==='neu'&&p.club&&!p.own?' · von '+sv4Esc(p.club):''}</small></button>
    <span class="kr4-o" style="color:${tierColor(ov)}" title="Stärke">${ov}</span>
    ${g?`<span class="kr4-g${gd>150?' old':''}" title="Letztes Gespräch ${sv4D(g.datum)}">💬 ${sv4Ago(g.datum)}</span>`:`<span class="kr4-g none" title="Noch kein Gespräch">💬 –</span>`}
    <button type="button" class="kr4-z ${z[1]}" data-kz="${sv4Esc(p.id)}">${sv4Esc(k==='weg'?'weg':z[0]||k)}</button></div>`;
}
function kd4ListHtml(all,s,team){
  const st=p=>kd4Status(p,s,team);
  const now=s===sv4S(), out=all.filter(p=>now?st(p)==='weg':['geht','karriereende','weg'].includes(st(p))), zi=all.filter(p=>st(p)==='ziel'), inn=all.filter(p=>!out.includes(p)&&!zi.includes(p));
  const byL=KD4_LINES.map(([t,ps])=>[t,inn.filter(p=>ps.includes(kd4Pos(p,s))).sort((a,b)=>ps.indexOf(kd4Pos(a,s))-ps.indexOf(kd4Pos(b,s))||kd4Ovr(b)-kd4Ovr(a))]);
  return `<div class="kd4-lh"><h3>${SV4_TEAM[team]} · ${sv4SL(s)}</h3><button class="btn sm ghost" data-kadd>${SVI('plus')} Spieler</button></div>
    ${byL.map(([t,L])=>`<div class="kl4"><h5>${t}<i>${L.length}</i></h5>${L.map(p=>kd4Row(p,s,team)).join('')||'<p class="note small">niemand</p>'}</div>`).join('')}
    ${zi.length?`<div class="kl4"><h5>Wunschspieler<i>${zi.length}</i></h5>${zi.map(p=>kd4Row(p,s,team)).join('')}</div>`:''}
    ${out.length?`<details class="kl4 out"><summary>Abgänge<i>${out.length}</i></summary>${out.map(p=>kd4Row(p,s,team)).join('')}</details>`:''}`;
}
function kd4PitchHtml(){
  const L=kd4Lineup(), F=FORMATIONS[L.formation]||FORMATIONS['4-4-2'];
  const card=(id,role,i)=>{ const p=id&&sv4P(id); if(!p)return `<button type="button" class="ps4 empty" data-slot="${i}" style="left:${F[i][1]}%;top:${F[i][2]}%"><b>+</b><span>${sv4Esc(role)}</span></button>`;
    const ov=kd4Ovr(p), fit=ROLE2POS[role]===p.pos||(p.pos2||[]).includes(ROLE2POS[role]); const nm=p.name.split(' ');
    return `<button type="button" class="ps4${fit?'':' misfit'}" data-slot="${i}" style="left:${F[i][1]}%;top:${F[i][2]}%" title="${sv4Esc(p.name)} · ${sv4Esc(p.pos||'')}"><em style="--c:${tierColor(ov)}">${ov}</em><i>${(p.photo||p.photoUrl)?`<img src="${p.photo||p.photoUrl}" alt="" loading="lazy" onerror="this.remove()">`:sv4Esc(initials(p.name))}</i><b>${sv4Esc(nm.slice(-1)[0])}</b><span>${sv4Esc(role)}</span></button>`; };
  const used=new Set(Object.values(L.slots)), bank=(L.bank||[]).filter(id=>!used.has(id)&&sv4P(id));
  const rest=kd4Members(KD4.team,kd4S()).filter(p=>!used.has(p.id)&&!bank.includes(p.id)&&!['geht','karriereende','weg','ziel'].includes(kd4Status(p,kd4S(),KD4.team)));
  return `<div class="kd4-ph"><div class="seg4 sm">${[['haupt','Hauptaufstellung'],['alt1','Alternative']].map(([k,t])=>`<button type="button" class="${KD4.art===k?'on':''}" data-ka="${k}">${t}</button>`).join('')}</div>
      <select data-kf aria-label="Formation">${Object.keys(FORMATIONS).map(f=>`<option${f===L.formation?' selected':''}>${f}</option>`).join('')}</select></div>
    ${L.live?`<p class="note small">Das ist die aktuelle Startelf aus „Aufstellung“. Änderungen gelten für beide.</p>`:L.auto?`<p class="note small">Vorschlag nach Position und Stärke. Antippen und ändern, dann wird gespeichert.</p>`:''}
    <div class="pitch4 fut-noflip"><div class="pl4"></div>${F.map(([role],i)=>card(L.slots[i],role,i)).join('')}</div>
    <div class="bank4"><h5>Bank <i>${bank.length}/7</i></h5><div>${bank.map(id=>{ const p=sv4P(id); return `<button type="button" class="bk4c" data-bank="${sv4Esc(id)}"><em style="--c:${tierColor(kd4Ovr(p))}">${kd4Ovr(p)}</em>${sv4Esc(p.name.split(' ').slice(-1)[0])}<span>${sv4Esc(p.pos||'')}</span></button>`; }).join('')}${bank.length<7?`<button type="button" class="bk4c add" data-bank="">+</button>`:''}</div></div>
    ${rest.length?`<div class="bank4 rest"><h5>Weitere Kaderplätze <i>${rest.length}</i></h5><div>${rest.slice(0,24).map(p=>`<span class="rs4">${sv4Esc(p.name.split(' ').slice(-1)[0])} <i>${sv4Esc(p.pos||'')}</i></span>`).join('')}</div></div>`:''}`;
}

/* ---------- Bedarfsanalyse ---------- */
function kd4Soll(pos,L){
  const kb=(typeof SC2!=='undefined'&&SC2.bedarf)?SC2.bedarf.find&&SC2.bedarf.find(x=>x.pos===pos):null; if(kb&&kb.soll!=null)return kb.soll;
  const F=FORMATIONS[L.formation]||[]; const n=F.filter(([r])=>ROLE2POS[r]===pos).length;
  return pos==='TW'?2:Math.max(n*2,n?2:(KD4_DEFSOLL[pos]>=3?1:0));
}
function kd4Need(all,s,team){
  const L=kd4Lineup(); const st=p=>kd4Status(p,s,team);
  return SV4_POS.map(pos=>{
    const here=all.filter(p=>kd4Pos(p,s)===pos);
    const now=s===sv4S();
    const sicher=here.filter(p=>now?st(p)!=='ziel'&&st(p)!=='weg':['bleibt','neu','hoch','runter'].includes(st(p))), uns=now?[]:here.filter(p=>st(p)==='unsicher'), weg=now?[]:here.filter(p=>['geht','karriereende','weg'].includes(st(p)));
    const soll=kd4Soll(pos,L), gap=Math.max(0,soll-sicher.length), risk=Math.max(0,soll-sicher.length-uns.length);
    const bed=SV4.bed.filter(b=>b.pos===pos&&b.saison===s&&b.team===team&&!['erledigt','verworfen'].includes(b.status));
    return {pos,soll,sicher,uns,weg,gap,risk,bed};
  }).filter(x=>x.soll>0||x.sicher.length||x.weg.length);
}
function kd4NeedHtml(all,s,team){
  const N=kd4Need(all,s,team), now=s===sv4S(), nx=sv4SAdd(s,1);
  const own2=players.filter(p=>sv4Team(p,s)==='2'), ownA=players.filter(p=>sv4Team(p,s)==='A');
  const rows=N.map(n=>{
    const lvl=n.gap>0?'bad':n.uns.length&&n.gap===0&&n.sicher.length-n.soll<1?'warn':'ok';
    const cand2=team==='1'?own2.filter(p=>kd4Pos(p,s)===n.pos||(p.pos2||[]).includes(n.pos)).sort((a,b)=>kd4Ovr(b)-kd4Ovr(a)).slice(0,2):[];
    const candA=team!=='A'?ownA.filter(p=>kd4Pos(p,s)===n.pos||(p.pos2||[]).includes(n.pos)).sort((a,b)=>kd4Ovr(b)-kd4Ovr(a)).slice(0,2):[];
    const bedLink=n.bed.length?n.bed.map(b=>`<button type="button" class="lk4" data-bedopen="${b.id}">📋 ${sv4Esc(b.titel)} · ${SV4.bk.filter(x=>x.bedarf_id===b.id).length} Kandidaten</button>`).join(''):'';
    return `<div class="nd4 ${lvl}"><div class="nd4-h"><b>${sv4Esc(SV4_POSL[n.pos]||n.pos)}</b><span class="nd4-c">${n.sicher.length}<i>/${n.soll}</i></span>
        ${n.gap?`<em class="bad">fehlt ${n.gap}</em>`:n.uns.length?`<em class="warn">${n.uns.length} unsicher</em>`:`<em class="ok">besetzt</em>`}</div>
      <div class="nd4-d">${n.sicher.map(p=>sv4Esc(p.name.split(' ').slice(-1)[0])).join(', ')||'–'}${n.uns.length?` <span class="warn">· unsicher: ${n.uns.map(p=>sv4Esc(p.name.split(' ').slice(-1)[0])).join(', ')}</span>`:''}${n.weg.length?` <span class="bad">· weg: ${n.weg.map(p=>sv4Esc(p.name.split(' ').slice(-1)[0])).join(', ')}</span>`:''}</div>
      ${n.gap||n.uns.length||n.bed.length?`<div class="nd4-a">
        ${now?`${cand2.map(p=>`<button type="button" class="lk4" data-up="${sv4Esc(p.id)}" data-upt="1">⬆ ${sv4Esc(p.name)} aus der Zweiten (${kd4Ovr(p)})</button>`).join('')}${candA.map(p=>`<button type="button" class="lk4" data-up="${sv4Esc(p.id)}" data-upt="${team}">🌱 ${sv4Esc(p.name)} aus der Jugend</button>`).join('')}
             <button type="button" class="lk4" data-newbed="${n.pos}" data-zp="winter">❄️ Wintertransfer suchen</button>`
            :`${cand2.map(p=>`<button type="button" class="lk4" data-up="${sv4Esc(p.id)}" data-upt="1">⬆ ${sv4Esc(p.name)} hochziehen (${kd4Ovr(p)})</button>`).join('')}${candA.map(p=>`<button type="button" class="lk4" data-up="${sv4Esc(p.id)}" data-upt="${team}">🌱 ${sv4Esc(p.name)} aus der Jugend</button>`).join('')}`}
        ${bedLink||`<button type="button" class="btn sm" data-newbed="${n.pos}" data-zp="${now?'winter':'sommer'}">${SVI('plus')} Bedarf erstellen → Scouting</button>`}</div>`:''}
    </div>`; }).join('');
  return `<div class="kd4-nh"><h3>Bedarfsanalyse ${sv4SL(s)}</h3><span class="note small">${now?'Jetzt: Winter-Transfer, aus der Zweiten oder der Jugend hochziehen':'Nächste Saison: Bedarf erstellen und direkt ans Scouting geben'} · Soll aus Aufstellung (2 je Position) bzw. Positions-Bedarf</span></div>
    <div class="nd4g">${rows}</div>`;
}

function kd4Wire(P){
  P.querySelectorAll('[data-svp]').forEach(b=>b.onclick=()=>openModal(b.dataset.svp));
  P.querySelectorAll('[data-kz]').forEach(b=>b.onclick=e=>{ e.stopPropagation(); kd4ZukMenu(b,b.dataset.kz); });
  const add=P.querySelector('[data-kadd]'); if(add)add.onclick=()=>kd4AddPicker();
  P.querySelectorAll('[data-ka]').forEach(b=>b.onclick=()=>{ KD4.art=b.dataset.ka; kd4Render(); });
  const f=P.querySelector('[data-kf]'); if(f)f.onchange=async()=>{ const L=kd4Lineup(); const F=FORMATIONS[f.value]; const ids=Object.keys(L.slots).sort((a,b)=>a-b).map(k=>L.slots[k]).filter(Boolean); const sl={};
    F.forEach(([role],i)=>{ const want=ROLE2POS[role]; const j=ids.findIndex(id=>{ const p=sv4P(id); return p&&p.pos===want; }); if(j>=0){ sl[i]=ids[j]; ids.splice(j,1); } });
    F.forEach((x,i)=>{ if(!sl[i]&&ids.length)sl[i]=ids.shift(); });
    try{ await kd4LineupSave({formation:f.value,slots:sl,bank:L.bank}); kd4Render(); }catch(e){ kToast('⚠️ '+e.message); } };
  P.querySelectorAll('[data-slot]').forEach(b=>b.onclick=()=>kd4SlotPicker(+b.dataset.slot));
  P.querySelectorAll('[data-bank]').forEach(b=>b.onclick=()=>kd4SlotPicker('bank',b.dataset.bank));
  P.querySelectorAll('[data-up]').forEach(b=>b.onclick=async()=>{ const p=sv4P(b.dataset.up); const t=b.dataset.upt; const s=kd4S();
    try{ await sv4SSSet(p.id,s,{team:t,zukunft:'hoch'}); kToast('⬆ '+p.name+' '+sv4SL(s)+' in der '+SV4_TEAM[t]); kd4Render(); }catch(e){ kToast('⚠️ '+e.message); } });
  P.querySelectorAll('[data-newbed]').forEach(b=>b.onclick=()=>{ if(typeof sc4BedarfEditor==='function')sc4BedarfEditor(null,{pos:b.dataset.newbed,saison:b.dataset.zp==='winter'?kd4S():(kd4S()===sv4S()?sv4SAdd(kd4S(),1):kd4S()),team:KD4.team,zeitpunkt:b.dataset.zp}); });
  P.querySelectorAll('[data-bedopen]').forEach(b=>b.onclick=()=>{ SC4.open=b.dataset.bedopen; goTab('bedarf'); });
}
function kd4ZukMenu(btn,pid){
  document.querySelectorAll('.zm4').forEach(x=>x.remove());
  const p=sv4P(pid), s=kd4S(), cur=sv4S()===s; const target=cur?(typeof sv60Target==='function'?sv60Target(s):sv4SAdd(s,1)):s;   /* 0.22: „jetzt“ plant die nächste Halbserie */
  const opts=cur?['bleibt','unsicher','geht','karriereende',KD4.team==='1'?'runter':'hoch']:['bleibt','neu','unsicher','geht','karriereende','ziel'];
  const m=document.createElement('div'); m.className='zm4';
  m.innerHTML=`<b>${sv4Esc(svFirst(p.name))} · ${cur?'Zukunft '+sv4SL(target):sv4SL(target)}</b>${opts.map(k=>`<button type="button" data-z="${k}" class="${SV4_ZUK[k][1]}">${SV4_ZUK[k][0]}</button>`).join('')}<button type="button" data-z="gespr" class="mut">💬 Gespräch festhalten</button>`;
  document.body.appendChild(m); const r=btn.getBoundingClientRect(); m.style.top=Math.min(window.innerHeight-m.offsetHeight-10,r.bottom+6)+'px'; m.style.left=Math.max(8,Math.min(window.innerWidth-m.offsetWidth-8,r.right-m.offsetWidth))+'px';
  const close=e=>{ if(!m.contains(e.target)){ m.remove(); document.removeEventListener('click',close,true); } }; setTimeout(()=>document.addEventListener('click',close,true),10);
  m.querySelectorAll('[data-z]').forEach(b=>b.onclick=async()=>{ const z=b.dataset.z; m.remove(); if(z==='gespr')return kd4GesprEditor(pid);
    const team=z==='geht'||z==='karriereende'||z==='ziel'?(z==='ziel'?KD4.team:null):z==='hoch'?'1':z==='runter'?'2':(sv4Team(p,target)||KD4.team);
    try{ await sv4SSSet(pid,target,{zukunft:z,team}); kToast('✓ '+p.name+': '+SV4_ZUK[z][0]+' ('+sv4SL(target)+')'); kd4Render(); }catch(e){ kToast('⚠️ '+e.message); } });
}
function kd4AddPicker(){
  const s=kd4S(), team=KD4.team;
  const M=svModal(`<h2 style="margin:0 0 4px">Spieler für ${SV4_TEAM[team]} · ${sv4SL(s)}</h2><p class="note">Neuzugang, aus der Zweiten/Jugend oder Wunschspieler. Wird als Beziehung zum Verein gespeichert. Die Spielerdaten bleiben, wo sie sind.</p>
    <input class="kx-in" id="kd4Q" placeholder="Name oder Verein …" autocomplete="off"><div class="seg4 sm" style="margin:8px 0"><button type="button" class="on" data-am="neu">Neuzugang / fest</button><button type="button" data-am="ziel">Wunschspieler</button></div><div id="kd4R" class="pk4"></div>`);
  let mode='neu'; const q=M.querySelector('#kd4Q'), R=M.querySelector('#kd4R');
  M.querySelectorAll('[data-am]').forEach(b=>b.onclick=()=>{ mode=b.dataset.am; M.querySelectorAll('[data-am]').forEach(x=>x.classList.toggle('on',x===b)); });
  const draw=()=>{ const t=svNorm?svNorm(q.value):q.value.toLowerCase(); const L=players.filter(p=>sv4Team(p,s)!==team&&(!t||(svNorm?svNorm(p.name+' '+p.club):(p.name+' '+p.club).toLowerCase()).includes(t))).sort((a,b)=>kd4Ovr(b)-kd4Ovr(a)).slice(0,30);
    R.innerHTML=L.map(p=>`<button type="button" data-pick="${sv4Esc(p.id)}"><b>${sv4Esc(p.name)}</b><span>${sv4Esc(p.club)} · ${sv4Esc(p.pos||'')} · ${kd4Ovr(p)}</span><i>${sv4Esc(sv4Bez(p).t)}</i></button>`).join('')||'<p class="note">Niemand gefunden.</p>';
    R.querySelectorAll('[data-pick]').forEach(b=>b.onclick=async()=>{ const p=sv4P(b.dataset.pick); try{ await sv4SSSet(p.id,s,{team,zukunft:mode==='ziel'?'ziel':(p.own?'hoch':'neu')}); kToast('✓ '+p.name+(mode==='ziel'?' als Wunschspieler':' im Kader ')+sv4SL(s)); closeOverlay(); kd4Render(); }catch(e){ kToast('⚠️ '+e.message); } }); };
  q.oninput=draw; draw(); setTimeout(()=>q.focus(),50);
}
function kd4SlotPicker(slot,bankId){
  const s=kd4S(), L=kd4Lineup(), F=FORMATIONS[L.formation]; const role=slot==='bank'?null:F[slot][0], want=role?ROLE2POS[role]:null;
  const pool=kd4Members(KD4.team,s).filter(p=>!['geht','karriereende','weg'].includes(kd4Status(p,s,KD4.team)));
  const fit=p=>want?(p.pos===want?3:(p.pos2||[]).includes(want)?2:((POSSIM[want]||{})[p.pos]||0)):0;
  const L2=pool.sort((a,b)=>fit(b)-fit(a)||kd4Ovr(b)-kd4Ovr(a));
  const cur=slot==='bank'?bankId:L.slots[slot];
  const M=svModal(`<h2 style="margin:0 0 4px">${role?sv4Esc(role)+' besetzen':'Bank'}</h2><p class="note">${SV4_TEAM[KD4.team]} · ${sv4SL(s)} · ${KD4.art==='haupt'?'Hauptaufstellung':'Alternative'}</p>
    <div class="pk4">${cur?`<button type="button" data-pick="" class="rm"><b>Platz leeren</b></button>`:''}${L2.map(p=>`<button type="button" data-pick="${sv4Esc(p.id)}" class="${p.id===cur?'on':''}"><b>${sv4Esc(p.name)}</b><span>${sv4Esc(p.pos||'')}${(p.pos2||[]).length?' · '+sv4Esc(p.pos2.join(', ')):''} · ${kd4Ovr(p)}</span><i>${want&&fit(p)>=3?'✓ passt':want&&fit(p)>=2?'◐ Neben':want&&fit(p)>0?'~ möglich':''}${Object.values(L.slots).includes(p.id)?' · in der Elf':''}</i></button>`).join('')}</div>`);
  M.querySelectorAll('[data-pick]').forEach(b=>b.onclick=async()=>{ const id=b.dataset.pick||null; const N={formation:L.formation,slots:Object.assign({},L.slots),bank:(L.bank||[]).slice()};
    if(id){ for(const k in N.slots)if(N.slots[k]===id)delete N.slots[k]; N.bank=N.bank.filter(x=>x!==id); }
    if(slot==='bank'){ N.bank=N.bank.filter(x=>x!==bankId); if(id)N.bank.push(id); N.bank=N.bank.slice(0,7); }
    else { if(cur&&id&&Object.values(L.slots).includes(id)){ const from=Object.keys(L.slots).find(k=>L.slots[k]===id); N.slots[from]=cur; } if(id)N.slots[slot]=id; else delete N.slots[slot]; }
    try{ await kd4LineupSave(N); closeOverlay(); kd4Render(); }catch(e){ kToast('⚠️ '+e.message); } });
}

/* ---------- Spielergespräche ---------- */
function kd4GesprEditor(pid,gid){
  const p=sv4P(pid); if(!p)return; const g=gid?SV4.gs.find(x=>x.id===gid):null; const fromProfile=!!(document.getElementById('modal')||{}).querySelector?.('.pf4');
  const M=svModal(`<div class="mhead" style="gap:12px">${avaHtml(p)}<div><h2 style="margin:0">Spielergespräch</h2><div class="msub">${sv4Esc(p.name)} · ${sv4Esc(sv4Bez(p).t)}</div></div></div>
    <div class="editgrid gs4f">
      <div class="field"><label>Datum</label><input type="date" id="g4d" value="${sv4Esc(g?g.datum:sv4Today())}"></div>
      <div class="field"><label>Art</label><select id="g4a">${[['offiziell','Offizielles Gespräch'],['kurz','Kurz / zwischendurch'],['telefon','Telefonat'],['verhandlung','Verhandlung (Neuzugang)']].map(([k,t])=>`<option value="${k}"${(g?g.art:'offiziell')===k?' selected':''}>${t}</option>`).join('')}</select></div>
      <div class="field"><label>Geführt von</label><input id="g4w" maxlength="120" value="${sv4Esc(g?g.wer||'':SVU.name||'')}"></div>
      <div class="field"><label>Will er bleiben?</label><select id="g4z"><option value="">– noch offen –</option>${[['bleibt','Ja, bleibt'],['unsicher','Unsicher'],['geht','Will gehen'],['karriereende','Karriereende'],['offen','Offen']].map(([k,t])=>`<option value="${k}"${g&&g.zukunft===k?' selected':''}>${t}</option>`).join('')}</select></div>
      <div class="field w"><label>Wie sieht er seine Zukunft?</label><textarea id="g4s" maxlength="1500">${sv4Esc(g?g.sicht||'':'')}</textarea></div>
      <div class="field w"><label>Offene Themen</label><textarea id="g4t" maxlength="1500">${sv4Esc(g?g.themen||'':'')}</textarea></div>
      <div class="field w"><label>Entscheidung für ${sv4SL(sv4SAdd(sv4S(),1))}</label><input id="g4e" maxlength="600" value="${sv4Esc(g?g.entscheidung||'':'')}"></div>
      <div class="field"><label>Nächstes Gespräch</label><input type="date" id="g4n" value="${sv4Esc(g?g.naechstes_am||'':'')}"></div>
    </div>
    <label class="jutog"><input type="checkbox" id="g4sync" checked> Zukunft im Kaderplan ${sv4SL(typeof svmPerioden==="function"?svmPerioden()[1]:sv4SAdd(sv4S(),1))} übernehmen</label>
    <div class="btnrow" style="margin-top:12px"><button class="btn" id="g4save">${SVI('check')} Speichern</button>${g?`<button class="btn ghost" id="g4del">${SVI('trash')} Löschen</button>`:''}<button class="btn ghost" id="g4x">Abbrechen</button></div>
    <p class="note small">🔒 Nur fürs Team (Trainer, Kaderplanung, Vorstand) sichtbar.</p>`);
  const back=()=>{ if(fromProfile)openModal(pid); else { closeOverlay(); } try{ if(svCurTab()==='kader')kd4Render(); if(svCurTab()==='gespr')kd4Gespr(); }catch(e){} };
  M.querySelector('#g4x').onclick=back;
  M.querySelector('#g4save').onclick=async e=>{ const b=e.currentTarget; const v=id=>M.querySelector(id).value.trim()||null;
    const row={player_id:pid,datum:v('#g4d')||sv4Today(),art:v('#g4a'),wer:v('#g4w'),zukunft:v('#g4z'),sicht:v('#g4s'),themen:v('#g4t'),entscheidung:v('#g4e'),naechstes_am:v('#g4n')};
    b.disabled=true;
    try{ let r; if(g){ r=await SVB.sb.from('gespraeche').update(row).eq('id',g.id).select().single(); } else r=await SVB.sb.from('gespraeche').insert(row).select().single();
      if(r.error)throw new Error(r.error.message); SV4.gs=[r.data].concat(SV4.gs.filter(x=>x.id!==r.data.id)).sort((a,b)=>b.datum.localeCompare(a.datum));
      if(row.zukunft&&row.zukunft!=='offen'&&M.querySelector('#g4sync').checked){ const nx=typeof svmPerioden==='function'?svmPerioden()[1]:sv4SAdd(sv4S(),1); /* 0.22: nächste Halbserie */ await sv4SSSet(pid,nx,{zukunft:row.zukunft,team:row.zukunft==='geht'||row.zukunft==='karriereende'?null:sv4Team(p,nx)||sv4Team(p)}); }
      kToast('✓ Gespräch gespeichert'); back(); }catch(x){ kToast('⚠️ '+x.message); b.disabled=false; } };
  const d=M.querySelector('#g4del'); if(d)d.onclick=async()=>{ if(!d.classList.contains('sure')){ d.classList.add('sure'); d.textContent='Wirklich löschen?'; return; }
    const {error}=await SVB.sb.from('gespraeche').delete().eq('id',g.id); if(error)return kToast('⚠️ '+error.message); SV4.gs=SV4.gs.filter(x=>x.id!==g.id); kToast('Gelöscht'); back(); };
}
function kd4Gespr(){
  const P=document.getElementById('panel-gespr'); if(!P)return;
  if(!sv4Can()){ P.innerHTML='<div class="card"><div class="empty">Spielergespräche sieht nur das Team.</div></div>'; return; }
  if(!SV4.loaded){ P.innerHTML='<div class="card"><div class="empty">Lade …</div></div>'; sv4Load(); return; }
  const team=KD4.gt||'1', s=sv4S(), nx=sv4SAdd(s,1);
  const L=players.filter(p=>sv4Team(p,s)===team).map(p=>({p,g:SV4.gs.find(x=>x.player_id===p.id),z:sv4Zuk(p,nx)}));
  const f=KD4.gf, days=x=>x.g?Math.floor((Date.now()-new Date(x.g.datum))/86400000):9999;
  const flt=L.filter(x=>f==='alle'||f==='ohne'&&!x.g||f==='alt'&&days(x)>150||f==='unsicher'&&['unsicher','geht'].includes(x.z)||f==='faellig'&&x.g&&x.g.naechstes_am&&x.g.naechstes_am<=sv4Today()).sort((a,b)=>days(b)-days(a));
  const nOhne=L.filter(x=>!x.g).length, nUns=L.filter(x=>['unsicher','geht'].includes(x.z)).length, nF=L.filter(x=>x.g&&x.g.naechstes_am&&x.g.naechstes_am<=sv4Today()).length;
  P.innerHTML=`<div class="card"><div class="kd4-lh"><div class="seg4">${[['1','1. Mannschaft'],['2','2. Mannschaft'],['A','A-Jugend']].map(([k,t])=>`<button type="button" class="${team===k?'on':''}" data-gt="${k}">${t}</button>`).join('')}</div></div>
    <div class="chips4">${[['alle','Alle',L.length],['ohne','Noch kein Gespräch',nOhne],['alt','Länger als 5 Monate',L.filter(x=>x.g&&days(x)>150).length],['faellig','Nächstes fällig',nF],['unsicher','Unsicher / geht',nUns]].map(([k,t,n])=>`<button type="button" class="${f===k?'on':''}" data-gf="${k}">${t} <i>${n}</i></button>`).join('')}</div>
    <div class="gl4">${flt.map(({p,g,z})=>`<div class="gr4"><button type="button" class="kr4-n" data-svp="${sv4Esc(p.id)}"><b>${sv4Esc(p.name)}</b><small>${sv4Esc(p.pos||'')}${p.alter!=null?' · '+p.alter+' J.':''}</small></button>
        <span class="gr4-d">${g?`${sv4D(g.datum)} <i>${sv4Ago(g.datum)}</i>`:'<i>noch keins</i>'}</span>
        <span class="kr4-z ${z&&SV4_ZUK[z]?SV4_ZUK[z][1]:''}">${z&&SV4_ZUK[z]?SV4_ZUK[z][0]:'–'}</span>
        <span class="gr4-t">${g&&(g.themen||g.sicht)?sv4Esc((g.themen||g.sicht).slice(0,90)):''}${g&&g.naechstes_am?` <em>· nächstes ${sv4D(g.naechstes_am)}</em>`:''}</span>
        <button type="button" class="btn sm ghost" data-gnew="${sv4Esc(p.id)}">${SVI('plus')} Gespräch</button></div>`).join('')||'<p class="note">Niemand in dieser Auswahl.</p>'}</div></div>`;
  P.querySelectorAll('[data-gt]').forEach(b=>b.onclick=()=>{ KD4.gt=b.dataset.gt; kd4Gespr(); });
  P.querySelectorAll('[data-gf]').forEach(b=>b.onclick=()=>{ KD4.gf=b.dataset.gf; kd4Gespr(); });
  P.querySelectorAll('[data-svp]').forEach(b=>b.onclick=()=>openModal(b.dataset.svp));
  P.querySelectorAll('[data-gnew]').forEach(b=>b.onclick=()=>kd4GesprEditor(b.dataset.gnew));
}
{ const _gt41=goTab; goTab=function(tab){ const r=_gt41.apply(this,arguments); try{ const c=svCurTab(); if(c==='kader')kd4Render(); if(c==='gespr')kd4Gespr(); }catch(e){ console.warn('Kader 4.0',e); } return r; }; }

/* =====================================================================
   SV/BSC Sportzentrale 4.0 · Mannschaft, Spieltag, Eigene Jugend, Übersicht (Lukas' Punkte 6, 8, 9, 14, 17, 24)
   - „Training“ heißt jetzt Mannschaft: Training, Spiele, Spieler, Verletzungen + Abstimmungen, Kontakte, Automatik
   - Spiele und Einheiten je Saison (inkl. Archiv 13/14–22/23), Spieler nach dem Spiel bewerten (Noten 1–6, auch per Sprache)
   - Gegnercheck ohne KI-Matchplan, dafür Grundordnung des Gegners (vom Trainer notiert); auf der Übersicht nur noch eine Zeile
   - Eigene Jugend (A/B): Kader, Statistik, Entwicklung und Einschätzungen der Jugendtrainer, ohne Kontaktdaten und Fotos
   - Übersicht je Rolle: was heute zu tun ist statt Funktionsliste
   ===================================================================== */
const TM4={gs:null,ss:null,arch:null,archBusy:false};

/* ---------- Kader der Ersten = Beziehung „1. Mannschaft“ in der laufenden Saison ---------- */
{ const _ts4=trSquad; trSquad=function(){ try{
  const inAtt=new Set(); TR.st.sessions.forEach(s=>(s.a||[]).forEach(a=>inAtt.add(a[0])));
  return players.filter(p=>!p.isJugend&&!p.verzicht&&(sv4Team(p)==='1'||(p.own&&inAtt.has(p.id))))
    .sort((a,b)=>(TR_POS.indexOf(a.pos)-TR_POS.indexOf(b.pos))||(a.kader||1)-(b.kader||1)||a.name.localeCompare(b.name,'de')); }catch(e){ return _ts4.apply(this,arguments); } }; }

/* ---------- Saisonwechsel: Einheiten ---------- */
function tm4Range(s){ const y=2000+(+String(s).slice(0,2)); return [y+'-07-01',(y+1)+'-06-30']; }
function tm4Chips(list,cur,attr){ return `<div class="chips4 tm4s">${list.map(([k,t])=>`<button type="button" class="${k===cur?'on':''}" ${attr}="${k}">${t}</button>`).join('')}</div>`; }
{ const _vs4=trViewSessions; trViewSessions=function(B){
  const all=TR.st.sessions, now=sv4S(), prev=sv4SAdd(now,-1), s=TM4.ss||now, [a,b]=tm4Range(s);
  const has=x=>{ const [a2,b2]=tm4Range(x); return all.some(z=>z.d>=a2&&z.d<=b2); };
  TR.st.sessions=all.filter(z=>z.d>=a&&z.d<=b);
  try{ _vs4.call(this,B); }finally{ TR.st.sessions=all; }
  const seas=[[now,sv4SL(now)]].concat(has(prev)?[[prev,sv4SL(prev)]]:[]);
  B.insertAdjacentHTML('afterbegin',tm4Chips(seas,s,'data-tss')); B.querySelectorAll('[data-tss]').forEach(x=>x.onclick=()=>{ TM4.ss=x.dataset.tss; trViewSessions(B); }); }; }

/* ---------- Saisonwechsel: Spiele (laufend aus Spielberichten, früher aus dem Vereinsarchiv) ---------- */
async function tm4ArchLoad(){ if(TM4.arch||TM4.archBusy)return; TM4.archBusy=true;
  try{ const {data,error}=await SVB.sb.from('archiv_spiele').select('*').order('datum',{ascending:true}).limit(600); if(error)throw error; TM4.arch=data||[]; }catch(e){ console.warn('Archiv',e); TM4.arch=[]; }
  TM4.archBusy=false; if(!SV4.statLoaded)await sv4Load(true); }
{ const _vg4=trViewGames; trViewGames=function(B){
  const now=sv4S(), s=TM4.gs||now;
  const arch=tm4Seasons();
  const chips=[[now,sv4SL(now)]].concat(arch.map(y=>[y,y.slice(2,4)+'/'+y.slice(5)]));
  if(s===now){ _vg4.call(this,B); B.insertAdjacentHTML('afterbegin',tm4Chips(chips,s,'data-tgs')+(arch.length?'':'<p class="note small">Frühere Saisons laden …</p>')); }
  else tm4ArchView(B,s);
  B.querySelectorAll('[data-tgs]').forEach(x=>x.onclick=()=>{ TM4.gs=x.dataset.tgs; trViewGames(B); });
  if(!arch.length&&!SV4.statLoaded)sv4Load(true).then(()=>{ if(TR.view==='games')trViewGames(B); });
}; }
function tm4Seasons(){ const now=sv4S(), nl='20'+now.slice(0,2)+'/'+now.slice(2,4);
  return [...new Set(SV4.stat.map(r=>r.saison).concat(typeof SV41!=='undefined'?SV41.bet.map(r=>r.saison):[]))].filter(y=>y!==nl).sort().reverse(); }
function tm4ArchView(B,s){
  if(!TM4.arch){ B.innerHTML='<div class="card"><div class="empty">Lade Archiv …</div></div>'; tm4ArchLoad().then(()=>{ if(TR.view==='games')trViewGames(B); }); return; }
  const now=sv4S(), arch=tm4Seasons();
  const G=TM4.arch.filter(g=>g.saison===s), st=SV4.stat.filter(r=>r.saison===s);
  if(!G.length&&!st.length){ const bet=typeof SV41!=='undefined'?SV41.bet.filter(r=>r.saison===s):[];
    B.innerHTML=tm4Chips([[now,sv4SL(now)]].concat(arch.map(y=>[y,y.slice(2,4)+'/'+y.slice(5)])),s,'data-tgs')+`<div class="card"><div class="vrat-h"><h3 class="trh" style="margin:0">${SVI('ball')} Saison ${sv4Esc(s)} · 1. Mannschaft</h3></div>
      <p class="note">Für diese Saison liegen keine Einzelspiele im Archiv.${bet.length?` Aus Julians Liste: <b>${bet[0].spiele_max}</b> Spiele (Pflicht + Test) und <b>${bet[0].training_max}</b> Trainings: wer wie oft dabei war, steht unter <a href="#" data-tm4bet>Beteiligung</a>.`:''}</p></div>`;
    B.querySelectorAll('[data-tgs]').forEach(x=>x.onclick=()=>{ TM4.gs=x.dataset.tgs; trViewGames(B); });
    const a=B.querySelector('[data-tm4bet]'); if(a)a.onclick=e=>{ e.preventDefault(); SV41.bs=s; sv4Go('training:bet'); };
    return; }
  const by={}; st.forEach(r=>{ const o=by[r.name]||(by[r.name]={n:r.name,sp:0,t:0,v:0,pk:0,st:null}); o.sp+=r.spiele||0; o.t+=r.tore||0; o.v+=r.vorlagen||0; if(r.wettbewerb==='pokal')o.pk+=r.spiele||0; if(r.startelf!=null)o.st=(o.st||0)+r.startelf; });
  const rows=Object.values(by).sort((a,b)=>b.sp-a.sp||b.t-a.t);
  const w=G.filter(g=>g.tore>g.gegentore).length, d=G.filter(g=>g.tore===g.gegentore).length, l=G.filter(g=>g.tore<g.gegentore).length;
  const I=sv4StatIdx();
  B.innerHTML=tm4Chips([[now,sv4SL(now)]].concat(arch.map(y=>[y,y.slice(2,4)+'/'+y.slice(5)])),s,'data-tgs')+`<div class="card"><div class="vrat-h"><h3 class="trh" style="margin:0">${SVI('ball')} Saison ${sv4Esc(s)} · 1. Mannschaft <small>Vereinsarchiv</small></h3></div>
    <div class="kd4-sum"><span><b>${G.length}</b> Spiele</span><span class="ok"><b>${w}</b> S</span><span><b>${d}</b> U</span><span class="bad"><b>${l}</b> N</span><span><b>${G.reduce((a,g)=>a+(g.tore||0),0)}:${G.reduce((a,g)=>a+(g.gegentore||0),0)}</b> Tore</span></div>
    <div class="trtw"><table class="trtab"><thead><tr><th>Spieler</th><th>Spiele</th><th>Startelf</th><th>Tore</th><th>Vorl.</th></tr></thead><tbody>
    ${rows.map(r=>{ const pid=[...I.byP.entries()].find(([,L])=>L.some(x=>x.name===r.n)); return `<tr${pid?` data-svp="${sv4Esc(pid[0])}"`:''}><td><b>${sv4Esc(r.n)}</b>${r.pk?` <small>${r.pk} Pokal</small>`:''}</td><td>${r.sp}</td><td>${r.st!=null?r.st:'–'}</td><td>${r.t}</td><td>${r.v||'–'}</td></tr>`; }).join('')}</tbody></table></div>
    <details class="pf4-sec"><summary><span>Alle Spiele</span><em>${G.length}</em></summary><div class="pf4-b"><div class="ar4">${G.map(g=>`<div class="${g.tore>g.gegentore?'w':g.tore===g.gegentore?'d':'l'}"><span>${sv4D(g.datum)}</span><b>${g.heim?'vs':'@'} ${sv4Esc(g.gegner)}</b><i>${g.tore}:${g.gegentore}</i>${g.wettbewerb==='pokal'?'<em>Pokal</em>':''}</div>`).join('')}</div></div></details>
    <p class="note small">Quelle: Vereinsdaten von Lukas (Heim-/Auswärtstabellen, Pokal, Zeitungsberichte). Startelf nur, wo die Zeitung Aufstellungen gedruckt hat.</p></div>`;
  B.querySelectorAll('tr[data-svp]').forEach(r=>r.onclick=()=>openModal(r.dataset.svp));
}

/* ---------- Nach dem Spiel bewerten (Noten 1–6, auch per Sprache) ---------- */
const TM4_NOTE=[['1','sehr gut'],['2','gut'],['3','befriedigend'],['4','ausreichend'],['5','mangelhaft'],['6','ungenügend']];
function tm4Rate(){
  const sq=trSquad(); const last=(TR.st.sessions||[]).find(s=>s.t==='spiel');
  const fb=typeof FB!=='undefined'&&FB.loaded?FB.m.filter(g=>g.team==='A'&&g.bericht).sort((a,b)=>b.datum.localeCompare(a.datum))[0]:null;
  let played=null; if(fb&&typeof fbMap==='function'){ const M=fbMap(); played=new Set(fb.apps.map(a=>M.get(a.p)).filter(Boolean)); }
  const gegner=fb?(fb.gegner||fb.gast||''):(last&&last.g)||'', datum=fb?fb.datum:(last?last.d:sv4Today());
  const st={}; const list=sq.filter(p=>!played||played.has(p.id)).concat(played?[]:[]);
  const M=svModal(`<div class="mhead"><div class="rm-ic" style="width:46px;height:46px">${SVI('star')}</div><div><h2 style="margin:0">Spieler bewerten</h2><div class="msub">Noten wie im Kicker: 1 = sehr gut … 6 = ungenügend</div></div></div>
    <div class="editgrid"><div class="field"><label>Datum</label><input type="date" id="r4d" value="${sv4Esc(datum)}"></div><div class="field"><label>Spiel / Einheit</label><input id="r4g" maxlength="80" value="${sv4Esc(gegner)}" placeholder="Gegner oder „Training“"></div></div>
    <div class="r4sp"><textarea id="r4t" placeholder="Schnell per Sprache oder Text: „Müller 2 stark im Zweikampf, Schmidt 3, Wagner 2 …“"></textarea><button type="button" class="btn sm ghost" id="r4mic">🎤</button><button type="button" class="btn sm" id="r4parse">Übernehmen</button></div>
    <div class="r4l">${list.map(p=>`<div class="r4r" data-r4="${sv4Esc(p.id)}"><b>${sv4Esc(p.name)}</b><span class="r4n">${TM4_NOTE.map(([n,t])=>`<button type="button" data-n="${n}" title="${t}">${n}</button>`).join('')}</span><input maxlength="200" placeholder="Kommentar (optional)"></div>`).join('')}</div>
    <div class="btnrow" style="margin-top:12px"><button class="btn" id="r4save">${SVI('check')} Bewertungen speichern</button><button class="btn ghost" id="r4x">Abbrechen</button><button class="btn ghost" id="r4ki">${SVI('chat')} Mit dem Co-Trainer</button></div>
    <p class="note small">Wird als Einheit „Spiel“ gespeichert, mit Note und Kommentar je Spieler. Fließt in die Spielerliste und die Hinweise des Co-Trainers ein.</p>`);
  const setN=(pid,n)=>{ st[pid]=n; const r=M.querySelector(`[data-r4="${CSS.escape(pid)}"]`); if(r)r.querySelectorAll('[data-n]').forEach(b=>b.classList.toggle('on',b.dataset.n===String(n))); };
  M.querySelectorAll('[data-r4] [data-n]').forEach(b=>b.onclick=()=>setN(b.closest('[data-r4]').dataset.r4,+b.dataset.n));
  M.querySelector('#r4x').onclick=()=>closeOverlay();
  M.querySelector('#r4ki').onclick=()=>{ closeOverlay(); try{ trChatOpen(); setTimeout(()=>{ const i=document.querySelector('#trChat textarea, #trChat input'); if(i){ i.value='Lass uns die Spieler nach dem Spiel'+(gegner?' gegen '+gegner:'')+' bewerten. Wer war stark, wer schwach?'; i.focus(); } },200); }catch(e){} };
  M.querySelector('#r4parse').onclick=()=>{ const t=M.querySelector('#r4t').value; const N=s=>(typeof TRC!=='undefined'?TRC.N(s):s.toLowerCase());
    const cnt=a=>{ const c={}; a.forEach(x=>c[x]=(c[x]||0)+1); return c; }, ln=cnt(list.map(p=>N(p.name.split(' ').slice(-1)[0]))), fn=cnt(list.map(p=>N(p.name.split(' ')[0])));
    list.forEach(p=>{ const nm=p.name.split(' '), l=N(nm.slice(-1)[0]), f=N(nm[0]); const keys=[N(p.name),f+' '+l.charAt(0)].concat(ln[l]===1?[l]:[],fn[f]===1?[f]:[]).filter(k=>k.length>2); const tn=N(t);
      for(const k of keys){ const re=new RegExp(k.replace(/[.*+?^${}()|[\]\\]/g,'\\$&')+'\\D{0,12}([1-6])(?:[,.]([0-9]))?'); const m=tn.match(re); if(m){ setN(p.id,+m[1]);
        const rest=tn.slice(tn.indexOf(m[0])+m[0].length).split(/,|;|\n| und (?=[a-zäöü]+ [1-6])/)[0].trim(); const inp=M.querySelector(`[data-r4="${CSS.escape(p.id)}"] input`); if(inp&&rest&&!inp.value)inp.value=rest.slice(0,200); break; } } });
    kToast(`✓ ${Object.keys(st).length} Noten erkannt`); };
  sv4Mic(M.querySelector('#r4mic'),M.querySelector('#r4t'));
  M.querySelector('#r4save').onclick=async e=>{ const ids=Object.keys(st); if(!ids.length)return kToast('Noch keine Note vergeben'); e.currentTarget.disabled=true;
    const sp=ids.map(pid=>{ const n=st[pid], k=(M.querySelector(`[data-r4="${CSS.escape(pid)}"] input`)||{}).value||''; return {player_id:pid,status:'da',status_src:'manuell',note:n,note_src:'manuell',notiz:k?k.slice(0,500):null}; });
    try{ const gg=(M.querySelector('#r4g').value||'').trim().slice(0,80); await trSaveSession(Object.assign({datum:M.querySelector('#r4d').value||sv4Today(),typ:/^training$/i.test(gg)?'training':'spiel',spieler:sp},gg&&!/^training$/i.test(gg)?{gegner:gg}:{})); closeOverlay(); kToast('✓ '+ids.length+' Bewertungen gespeichert'); try{ trRender(); }catch(x){} }
    catch(x){ kToast('⚠️ '+x.message); e.currentTarget.disabled=false; } };
}
function sv4Mic(btn,inp){
  const SR=window.SpeechRecognition||window.webkitSpeechRecognition; if(!btn)return; if(!SR){ btn.hidden=true; return; }
  let rec=null; btn.onclick=()=>{ if(rec){ rec.stop(); return; } rec=new SR(); rec.lang='de-DE'; rec.interimResults=false; rec.continuous=true; btn.classList.add('on');
    rec.onresult=e=>{ for(let i=e.resultIndex;i<e.results.length;i++)if(e.results[i].isFinal)inp.value=(inp.value?inp.value+' ':'')+e.results[i][0].transcript; };
    rec.onend=()=>{ btn.classList.remove('on'); rec=null; }; rec.onerror=()=>{ btn.classList.remove('on'); rec=null; kToast('Spracheingabe nicht verfügbar'); }; try{ rec.start(); }catch(e){ rec=null; btn.classList.remove('on'); } };
}
{ const _vh4=trViewHome; trViewHome=function(B){ const r=_vh4.apply(this,arguments); try{
  const d=document.createElement('div'); d.className='card rt4';
  d.innerHTML=`<div class="svc-h"><h3>${SVI('star')} Bewerten</h3></div><div class="btnrow"><button class="btn sm" data-rt="tr">${SVI('activity')} Training bewerten</button><button class="btn sm" data-rt="sp">${SVI('ball')} Spieler nach dem Spiel</button><button class="btn sm ghost" data-rt="eye">${SVI('eye')} Eye-Test (im Spielerprofil)</button></div>
    <p class="note small">Einheit: Intensität, Stimmung, Anwesenheit · Spiel: Noten 1–6 je Spieler, auch per Sprache · Eye-Test: Tempo, Schuss, Pass, Dribbling, Defensive, Physis.</p>`;
  B.prepend(d);
  d.querySelector('[data-rt="tr"]').onclick=()=>trSessionEditor(trToday());
  d.querySelector('[data-rt="sp"]').onclick=()=>tm4Rate();
  d.querySelector('[data-rt="eye"]').onclick=()=>{ TR.view='players'; trRender(); kToast('Spieler antippen → Eye-Test'); };
  }catch(e){ console.warn(e); } return r; }; }

/* ---------- Gegnercheck: ohne KI-Matchplan, mit Grundordnung ---------- */
spAi=function(){ kToast('Der KI-Matchplan ist entfallen. Der Trainer macht den Plan.'); };
try{ const gp=document.getElementById('panel-gegner'); if(gp&&window.MutationObserver)new MutationObserver(()=>{ gp.querySelectorAll('.spai').forEach(x=>x.remove()); }).observe(gp,{childList:true,subtree:true}); }catch(e){}
{ const _sr40=spRender; spRender=async function(){ const r=await _sr40.apply(this,arguments); try{
  const P=document.getElementById('panel-gegner'); if(!P)return r; P.querySelectorAll('.spai').forEach(x=>x.remove());
  const nm=(P.querySelector('.sp-opp b, .spopp b, h2')||{}).textContent||'';
  const f=typeof spNext==='function'?spNext(SP.team||'A')[0]:null; const opp=f?(f.heim&&!/Mörlenbach/i.test(f.heim)?f.heim:f.gast):nm; if(!opp)return r;
  const key='club:'+String(opp).toLowerCase().replace(/ä/g,'ae').replace(/ö/g,'oe').replace(/ü/g,'ue').replace(/ß/g,'ss').replace(/[^a-z0-9]/g,'').slice(0,90);
  const C=(CRM[key]||{}); const fo=C.fo||'', dv=C.dv||'', nt=C.fn||'';
  let d=P.querySelector('.fo4'); if(!d){ d=document.createElement('div'); d.className='card fo4'; const first=P.querySelector('.card'); if(first)first.after(d); else P.appendChild(d); }
  d.innerHTML=`<div class="svc-h"><h3>${SVI('pitch')} Grundordnung ${sv4Esc(opp)}</h3>${canTraining()?'<button class="btn sm ghost" data-fo>Eintragen</button>':''}</div>
    ${fo||dv?`<div class="kd4-sum">${fo?`<span>System <b>${sv4Esc(fo)}</b></span>`:''}${dv?`<span><b>${sv4Esc(dv)}</b>er-Kette</span>`:''}</div>${nt?`<p>${sv4Esc(nt)}</p>`:''}<p class="note small">Von unserem Trainerteam notiert${C._t&&C._t.fo?' · '+sv4Ago(C._t.fo):''}.</p>`
      :`<p class="note">Aus den öffentlichen Daten lässt sich die Grundordnung nicht zuverlässig ablesen. Wer den Gegner gesehen hat (Spiel, Video, Hinspiel), trägt sie hier ein, dann steht sie beim Rückspiel wieder da.</p>`}`;
  const b=d.querySelector('[data-fo]'); if(b)b.onclick=()=>{ const M=svModal(`<h2 style="margin:0 0 8px">Grundordnung ${sv4Esc(opp)}</h2><div class="editgrid">
      <div class="field"><label>System</label><select id="fo4s"><option value="">–</option>${Object.keys(FORMATIONS).concat(['4-2-3-1','3-4-3','4-1-4-1','5-3-2']).filter((x,i,a)=>a.indexOf(x)===i).map(x=>`<option${x===fo?' selected':''}>${x}</option>`).join('')}</select></div>
      <div class="field"><label>Abwehr</label><select id="fo4d"><option value="">–</option>${['3','4','5'].map(x=>`<option value="${x}"${x===dv?' selected':''}>${x}er-Kette</option>`).join('')}</select></div>
      <div class="field w"><label>Beobachtung (Pressing, Standards, Schlüsselspieler …)</label><textarea id="fo4n" maxlength="600">${sv4Esc(nt)}</textarea></div></div>
      <div class="btnrow" style="margin-top:12px"><button class="btn" id="fo4ok">${SVI('check')} Speichern</button><button class="btn ghost" id="fo4x">Abbrechen</button></div>`);
    M.querySelector('#fo4x').onclick=()=>closeOverlay();
    M.querySelector('#fo4ok').onclick=()=>{ const v=s=>M.querySelector(s).value.trim(); crmSet(key,{fo:v('#fo4s')||undefined,dv:v('#fo4d')||undefined,fn:v('#fo4n')||undefined}); closeOverlay(); kToast('✓ Grundordnung gespeichert'); spRender(); }; };
  }catch(e){ console.warn('Gegnercheck 4.0',e); } return r; }; }
/* Übersicht: nächstes Spiel nur als kompakte Zeile */
{ const _sh4=spHome; spHome=function(){ const r=_sh4.apply(this,arguments); try{ const el=document.getElementById('spHome'); if(!el||!SP.loaded)return r;
  const f=spNext('A')[0]; if(!f){ el.innerHTML=''; return r; } const dd=spDays(f.datum);
  el.innerHTML=`<button type="button" class="nx4" data-sph="gegner">${SVI('target')}<span>Nächstes Spiel <b>${sv4Esc(f.heim)} · ${sv4Esc(f.gast)}</b> · ${spWd(f.datum)}${f.zeit?' '+sv4Esc(f.zeit):''} · ${dd===0?'heute':dd===1?'morgen':'in '+dd+' Tagen'}</span><i>Gegnercheck ›</i></button>`;
  el.querySelector('[data-sph]').onclick=()=>goTab('gegner');
  const P=document.getElementById('panel-home'); if(P&&el.parentNode&&el!==P.lastElementChild)P.appendChild(el); }catch(e){} return r; }; }
/* Elf der Woche: Zweck klarstellen – Formspieler finden, beobachten, als Kandidat übernehmen */
{ const _tw4=twRender; twRender=async function(){ const r=await _tw4.apply(this,arguments); try{ const P=document.getElementById('panel-totw'); if(P&&!P.querySelector('.tw4')){ const d=document.createElement('p'); d.className='note tw4';
  d.innerHTML='Wozu? <b>Wer ist gerade in Form?</b> Die Besten des Spieltags je Liga. Karte antippen, Profil öffnen und mit 🔔 beobachten oder über „Zu Bedarf“ als Kandidat übernehmen. Die Auswahl basiert auf Toren (Torjägerlisten); Abwehrspieler fehlen deshalb oft.'; P.prepend(d); } }catch(e){} return r; }; }

/* ---------- Eigene Jugend ---------- */
const JU4={team:'A',open:null,busy:false};
async function ju4Load(force){ if(!sv4Jugend()||JU4.busy)return; if(SV4.ju.loaded&&!force)return; JU4.busy=true;
  try{ const [k,e]=await Promise.all([SVB.sb.from('jugend_kader').select('*').order('name').limit(400),SVB.sb.from('jugend_eintraege').select('*').order('datum',{ascending:false}).limit(3000)]);
    if(k.error)throw k.error; if(e.error)throw e.error; SV4.ju={k:k.data||[],e:e.data||[],loaded:true}; }catch(x){ console.warn('Jugend',x); SV4.ju.loaded=true; }
  JU4.busy=false; if(svCurTab()==='ejugend')ju4Render(); }
function ju4Render(){
  const P=document.getElementById('panel-ejugend'); if(!P)return;
  if(!sv4Jugend()){ P.innerHTML='<div class="card"><div class="empty">Die eigene Jugend sehen Trainer, Kaderplanung, Vorstand und Jugendtrainer (Aufgabe „Jugend“).</div></div>'; return; }
  if(!SV4.ju.loaded){ P.innerHTML='<div class="card"><div class="empty">Lade …</div></div>'; ju4Load(); return; }
  const s=sv4S(), t=JU4.team, K=SV4.ju.k.filter(k=>k.team===t&&k.aktiv&&k.saison<=s).sort((a,b)=>(a.jahrgang||0)-(b.jahrgang||0)||a.name.localeCompare(b.name,'de'));
  const E=kid=>SV4.ju.e.filter(e=>e.kid===kid);
  const [a0,b0]=tm4Range(s);
  const stat=kid=>E(kid).filter(e=>e.datum>=a0&&e.datum<=b0).reduce((o,e)=>({sp:o.sp+(e.spiele||0),t:o.t+(e.tore||0)}),{sp:0,t:0});
  const pot=kid=>{ const x=E(kid).find(e=>e.potenzial); return x?x.potenzial:null; };
  const known=players.filter(p=>p.isJugend&&typeof juEigen==='function'&&juEigen(p)&&!SV4.ju.k.some(k=>k.player_id===p.id||k.name===p.name));
  const senior=K.filter(k=>k.jahrgang&&(2000+(+s.slice(0,2)))+1-k.jahrgang>=19);
  P.innerHTML=`<div class="card"><div class="kd4-lh"><div class="seg4">${[['A','A-Jugend (U19)'],['B','B-Jugend (U17)']].map(([k,l])=>`<button type="button" class="${t===k?'on':''}" data-jt="${k}">${l}</button>`).join('')}</div>
      <button class="btn sm" data-jadd>${SVI('plus')} Spieler</button></div>
      <p class="note small">Statistik, Entwicklung und Einschätzungen der Jugendtrainer. Direkt in der App oder per Sprache. 🔒 Keine Kontaktdaten, keine Fotos. Sichtbar für Trainer, Kaderplanung, Vorstand und Jugendtrainer.</p>
      ${senior.length&&t==='A'?`<div class="hint">${SVI('info')}<span><b>${senior.length}</b> werden zur Saison ${sv4SL(sv4SAdd(s,1))} Senioren: ${senior.map(k=>sv4Esc(k.name)).join(', ')} · im Kaderplan unter „Bedarfsanalyse“ als Option.</span></div>`:''}
      <div class="ju4l">${K.map(k=>{ const st=stat(k.id), pt=pot(k.id), last=E(k.id)[0]; return `<div class="ju4r${JU4.open===k.id?' on':''}"><button type="button" class="ju4h" data-jo="${k.id}"><b>${sv4Esc(k.name)}</b><span>${k.jahrgang||'?'} · ${sv4Esc(k.pos||'–')}</span>
          <span class="ju4s">${st.sp?`${st.sp} Sp. · ${st.t} T`:'–'}</span><span class="ju4p" title="Perspektive 1. Mannschaft">${pt?'★'.repeat(pt)+'☆'.repeat(5-pt):'<i>keine Einschätzung</i>'}</span><em>${last?sv4Ago(last.datum):''}</em></button>
        ${JU4.open===k.id?ju4Detail(k):''}</div>`; }).join('')||'<p class="note">Noch niemand angelegt.</p>'}</div>
      ${known.length?`<details class="pf4-sec"><summary><span>Aus dem Datenbestand übernehmen</span><em>${known.length}</em></summary><div class="pf4-b">${known.map(p=>`<button type="button" class="lk4" data-jimp="${sv4Esc(p.id)}">🌱 ${sv4Esc(p.name)} · ${sv4Esc(p.kurz||p.staffel||'')}</button>`).join('')}</div></details>`:''}</div>`;
  P.querySelectorAll('[data-jt]').forEach(b=>b.onclick=()=>{ JU4.team=b.dataset.jt; JU4.open=null; ju4Render(); });
  P.querySelectorAll('[data-jo]').forEach(b=>b.onclick=()=>{ JU4.open=JU4.open===b.dataset.jo?null:b.dataset.jo; ju4Render(); });
  P.querySelector('[data-jadd]').onclick=()=>ju4Editor(null);
  P.querySelectorAll('[data-jimp]').forEach(b=>b.onclick=async()=>{ const p=sv4P(b.dataset.jimp); const {data,error}=await SVB.sb.from('jugend_kader').insert({name:p.name,team:'A',pos:SV4_POS.includes(p.pos)?p.pos:null,saison:sv4S(),player_id:p.id,jahrgang:p.estAlter?(2000+(+sv4S().slice(0,2)))-p.estAlter:null}).select().single(); if(error)return kToast('⚠️ '+error.message); SV4.ju.k.push(data); kToast('✓ '+p.name+' übernommen'); ju4Render(); });
  if(JU4.open)ju4Wire(P,SV4.ju.k.find(k=>k.id===JU4.open));
}
function ju4Detail(k){
  const L=SV4.ju.e.filter(e=>e.kid===k.id);
  return `<div class="ju4d"><div class="ju4f"><select id="j4a">${[['einschaetzung','Einschätzung'],['spiel','Spiel'],['statistik','Statistik (Zeitraum)'],['entwicklung','Entwicklung']].map(([v,t])=>`<option value="${v}">${t}</option>`).join('')}</select>
      <input type="date" id="j4d" value="${sv4Today()}"><input type="number" id="j4s" min="0" max="60" placeholder="Spiele"><input type="number" id="j4t" min="0" max="100" placeholder="Tore">
      <span class="ju4pp" title="Perspektive 1. Mannschaft">${[1,2,3,4,5].map(n=>`<button type="button" data-jp="${n}">☆</button>`).join('')}</span>
      <div class="r4sp w"><textarea id="j4x" maxlength="1500" placeholder="Einschätzung, Entwicklung, Stärken/Schwächen … (🎤 für Sprache)"></textarea><button type="button" class="btn sm ghost" id="j4mic">🎤</button></div>
      <div class="btnrow"><button class="btn sm" id="j4save">${SVI('check')} Eintragen</button><button class="btn sm ghost" id="j4ed">${SVI('sliders')} Stammdaten</button>${k.player_id&&sv4Can()?`<button class="btn sm ghost" id="j4up">⬆ Für die Erste vormerken</button>`:''}</div></div>
    <div class="ju4t">${L.map(e=>`<div class="ju4e"><b>${sv4D(e.datum)} · ${sv4Esc(({einschaetzung:'Einschätzung',spiel:'Spiel',statistik:'Statistik',entwicklung:'Entwicklung'})[e.art]||e.art)}</b><span>${sv4Esc(e.von_name||'')}${e.spiele!=null?` · ${e.spiele} Sp.`:''}${e.tore!=null?` · ${e.tore} T`:''}${e.potenzial?' · '+'★'.repeat(e.potenzial):''}</span>${e.text?`<p>${sv4Esc(e.text)}</p>`:''}</div>`).join('')||'<p class="note small">Noch keine Einträge.</p>'}</div></div>`;
}
function ju4Wire(P,k){ if(!k)return; let pot=null;
  P.querySelectorAll('[data-jp]').forEach(b=>b.onclick=()=>{ pot=+b.dataset.jp; P.querySelectorAll('[data-jp]').forEach(x=>x.textContent=+x.dataset.jp<=pot?'★':'☆'); });
  sv4Mic(P.querySelector('#j4mic'),P.querySelector('#j4x'));
  P.querySelector('#j4save').onclick=async e=>{ const v=s=>P.querySelector(s).value.trim(); const row={kid:k.id,art:v('#j4a'),datum:v('#j4d')||sv4Today(),text:v('#j4x')||null,spiele:v('#j4s')?+v('#j4s'):null,tore:v('#j4t')?+v('#j4t'):null,potenzial:pot,von_name:(SVU.name||'').slice(0,60)};
    if(!row.text&&row.spiele==null&&row.tore==null&&!pot)return kToast('Bitte etwas eintragen'); e.currentTarget.disabled=true;
    const {data,error}=await SVB.sb.from('jugend_eintraege').insert(row).select().single(); if(error){ e.currentTarget.disabled=false; return kToast('⚠️ '+error.message); }
    SV4.ju.e.unshift(data); kToast('✓ Eingetragen'); ju4Render(); };
  P.querySelector('#j4ed').onclick=()=>ju4Editor(k);
  const up=P.querySelector('#j4up'); if(up)up.onclick=async()=>{ const s=sv4SAdd(sv4S(),1); try{ await sv4SSSet(k.player_id,s,{team:'1',zukunft:'hoch'}); kToast('⬆ '+k.name+' für '+sv4SL(s)+' in der Ersten vorgemerkt'); }catch(x){ kToast('⚠️ '+x.message); } };
}
function ju4Editor(k){
  const M=svModal(`<h2 style="margin:0 0 8px">${k?'Stammdaten':'Jugendspieler anlegen'}</h2><div class="editgrid">
      <div class="field"><label>Name</label><input id="j5n" maxlength="60" value="${sv4Esc(k?k.name:'')}"></div>
      <div class="field"><label>Mannschaft</label><select id="j5t"><option value="A"${(k?k.team:JU4.team)==='A'?' selected':''}>A-Jugend</option><option value="B"${(k?k.team:JU4.team)==='B'?' selected':''}>B-Jugend</option></select></div>
      <div class="field"><label>Jahrgang</label><input type="number" id="j5j" min="2000" max="2020" value="${k&&k.jahrgang||''}" placeholder="2008"></div>
      <div class="field"><label>Position</label><select id="j5p"><option value="">–</option>${SV4_POS.map(x=>`<option${k&&k.pos===x?' selected':''}>${x}</option>`).join('')}</select></div></div>
    <p class="note small">Nur Name, Jahrgang und Position, keine Kontaktdaten, keine Fotos.</p>
    <div class="btnrow" style="margin-top:12px"><button class="btn" id="j5ok">${SVI('check')} Speichern</button>${k?`<button class="btn ghost" id="j5off">Nicht mehr aktiv</button>`:''}<button class="btn ghost" id="j5x">Abbrechen</button></div>`);
  M.querySelector('#j5x').onclick=()=>closeOverlay();
  M.querySelector('#j5ok').onclick=async()=>{ const v=s=>M.querySelector(s).value.trim(); const row={name:v('#j5n'),team:v('#j5t'),jahrgang:v('#j5j')?+v('#j5j'):null,pos:v('#j5p')||null};
    if(row.name.length<2)return kToast('Name fehlt');
    const r=k?await SVB.sb.from('jugend_kader').update(row).eq('id',k.id).select().single():await SVB.sb.from('jugend_kader').insert(Object.assign(row,{saison:sv4S()})).select().single();
    if(r.error)return kToast('⚠️ '+r.error.message); SV4.ju.k=SV4.ju.k.filter(x=>x.id!==r.data.id).concat([r.data]); JU4.team=r.data.team; JU4.open=r.data.id; closeOverlay(); ju4Render(); };
  const off=M.querySelector('#j5off'); if(off)off.onclick=async()=>{ const {error}=await SVB.sb.from('jugend_kader').update({aktiv:false}).eq('id',k.id); if(error)return kToast('⚠️ '+error.message); k.aktiv=false; closeOverlay(); ju4Render(); };
}

/* ---------- Übersicht je Rolle: Arbeitsabläufe statt Funktionen ---------- */
SV_ACTIONS.trainer.splice(0,SV_ACTIONS.trainer.length,['activity','Training erfassen',()=>trSessionEditor(trToday())],['star','Spiel bewerten',()=>{ if(!TR.loaded)return goTab('training'); tm4Rate(); }],['users','Abstimmung',()=>{ KB.view='abst'; goTab('kabine'); setTimeout(()=>kbPollEditor(null,kbSuggest()[0]),80); }],['pitch','Aufstellung',()=>goTab('elf')]);
SV_ACTIONS.planer.splice(0,SV_ACTIONS.planer.length,['pitch','Kaderplan',()=>goTab('kader')],['target','Bedarf & Aufträge',()=>goTab('bedarf')],['chat','Gespräche',()=>goTab('gespr')],['search','Spielermarkt',()=>goTab('scout')]);
SV_ACTIONS.vorstand.splice(0,SV_ACTIONS.vorstand.length,['pitch','Kaderplan',()=>goTab('kader')],['chat','Gespräche',()=>goTab('gespr')],['target','Bedarfe',()=>goTab('bedarf')],['trophy','Verein',()=>goTab('verein')]);
SV_ACTIONS.admin.splice(0,SV_ACTIONS.admin.length,['user','Nutzung',()=>svUseOpen()],['pitch','Kaderplan',()=>goTab('kader')],['target','Bedarf & Aufträge',()=>goTab('bedarf')],['activity','Mannschaft',()=>goTab('training')]);
SV_ACTIONS.viewer.splice(0,SV_ACTIONS.viewer.length,['search','Spielermarkt',()=>goTab('scout')],['trophy','Allzeit & Legenden',()=>{ VR.view='allzeit'; goTab('verein'); }],['star','Elf der Woche',()=>goTab('totw')]);
{ const _si4=svInsights; svInsights=function(){ const base=_si4.apply(this,arguments), add=[]; try{
  if(sv4Can()&&SV4.loaded){ const r=svRole(), plan=['planer','vorstand','admin'].includes(r), today=sv4Today(), nx=sv4SAdd(sv4S(),1);
    const due=SV4.gs.filter((g,i,a)=>a.findIndex(x=>x.player_id===g.player_id)===i&&g.naechstes_am&&g.naechstes_am<=today);
    if(due.length)add.push({prio:plan?0.4:3,lvl:'mittel',t:`${due.length} Spielergespräch${due.length>1?'e':''} fällig`,d:due.slice(0,4).map(g=>(sv4P(g.player_id)||{name:'?'}).name.split(' ').pop()).join(', '),go:()=>{ KD4.gf='faellig'; goTab('gespr'); }});
    const uns=players.filter(p=>sv4Team(p)==='1'&&['unsicher','geht'].includes(sv4Zuk(p,nx)));
    if(uns.length)add.push({prio:plan?0.6:4,lvl:uns.some(p=>sv4Zuk(p,nx)==='geht')?'hoch':'mittel',t:`${uns.length} Spieler ${sv4SL(nx)} unsicher/weg`,d:uns.slice(0,5).map(p=>p.name.split(' ').pop()).join(', ')+' · Bedarf prüfen',go:()=>{ KD4.saison=nx; goTab('kader'); }});
    const leer=SV4.bed.filter(b=>['offen','suche'].includes(b.status)&&!SV4.bk.some(x=>x.bedarf_id===b.id));
    if(leer.length)add.push({prio:plan?0.8:5,lvl:'info',t:`${leer.length} Bedarf${leer.length>1?'e':''} ohne Kandidaten`,d:leer.map(b=>b.titel).slice(0,2).join(' · '),go:()=>{ SC4.open=leer[0].id; goTab('bedarf'); }});
  } }catch(e){} return add.concat(base).sort((a,b)=>a.prio-b.prio).slice(0,6); }; }

{ const _gt43=goTab; goTab=function(tab){ const r=_gt43.apply(this,arguments); try{ if(svCurTab()==='ejugend')ju4Render(); }catch(e){ console.warn('Jugend 4.0',e); } return r; }; }
/* Nach dem Login: 4.0-Daten laden (für Profil, Kader, Übersicht) */
{ const _si40=typeof svInit==='function'?svInit:null; if(_si40)svInit=function(){ const r=_si40.apply(this,arguments); try{ sv4NavVis(); setTimeout(()=>{ sv4Load().then(()=>{ try{ renderAll(); }catch(e){} sv4NavVis(); }); if(sv4Jugend())ju4Load(); },400); }catch(e){} return r; }; }
/* Nächstes Spiel nicht mehr direkt unter dem Cockpit, sondern als Zeile am Ende der Übersicht */
{ const _ho4=svHomeOrder; svHomeOrder=function(){ const r=_ho4.apply(this,arguments); try{ const el=document.getElementById('spHome'), P=document.getElementById('panel-home'); if(el&&P&&el.parentNode===P&&el!==P.lastElementChild)P.appendChild(el); }catch(e){} return r; }; }

/* =====================================================================
   SV/BSC Sportzentrale 4.1
   - Trainings- & Spielbeteiligung je Saison (Julians Listen 21/22–26/27): Mannschaft → Beteiligung, Profil, Kaderplan
   - Spielerfotos auf einen Schlag (Verwaltung): Dateiname → Spieler, vor dem Speichern prüfbar
   - Saison-Album: Spieltagsbilder je Saison (Mannschaft → Spiele)
   - n8n-Verbindung in der Verwaltung (nur Admin): Adressen eintragen, Schlüssel bleibt auf dem Server
   ===================================================================== */
const SV41={bet:[],betLoaded:false,betBusy:false,_idx:null,album:new Map(),albumBusy:new Set(),bs:null,relay:null};
const sv41N=s=>(typeof TRC!=='undefined'&&TRC.N?TRC.N(String(s||'')):String(s||'').toLowerCase()).replace(/[^a-z]/g,'');
const sv41Key=y=>String(y).length===7?y.slice(2,4)+y.slice(5,7):String(y);                 // '2023/24' → '2324'
const sv41Lbl=y=>String(y).length===7?y.slice(2,4)+'/'+y.slice(5,7):sv4SL(y);             // '2023/24' → '23/24'
const sv41Long=k=>'20'+String(k).slice(0,2)+'/'+String(k).slice(2,4);                    // '2627' → '2026/27'
const sv41Pct=(a,b)=>b?Math.round(a/b*100):null;

/* ---------- Beteiligung laden ---------- */
