window.VEREIN=Object.freeze({"id":"svbsc","marke":"Kaderwerk","texte":{"name":"SV/BSC Mörlenbach","kurz":"SV/BSC","ort":"Mörlenbach","ort_adjektiv":"Mörlenbacher","ort_ascii":"Moerlenbach","schluessel":"moerlenbach","fde_schluessel":"svbscmoerlenbach","website":"sv-moerlenbach.de","vereinsfarben":"Blau-Weiß","kabine_host":"svbsc.albertklee.de","kasse_host":"mannschaftskasse.albertklee.de","app_url":"https://svbsc.kaderwerk.pro/","mail":"svbsc@albertklee.de","mail_alt":"sportzentrale@albertklee.de","fupa_slug":"svbsc-moerlenbach"},"farben":{"brand":"#2f6bff","brand2":"#5b9bff"},"mannschaften":[{"sub":"A","name":"1. Mannschaft","fde":"svbscmoerlenbach"},{"sub":"D2","name":"2. Mannschaft","fde":"svbscmoerlenbachii"}],"personen":{"planer":["Dome","Nico","Ervin"],"planer_start":["Dome","Nico"]},"sportplatz":{"lat":49.5989,"lon":8.7353,"name":"Weschnitztalstadion"},"patch_ab":null});
/* ================= DATEN ================= */
const DATA = window.__SVBC_DATA;
const LIGA_W = {GL:1.55, KOL:1.25, A:1.00, B:0.78, C:0.60, D:0.42};
const LIGA_NAME = {GL:'Gruppenliga', KOL:'Kreisoberliga', A:'Kreisliga A', B:'Kreisliga B', C:'Kreisliga C', D:'Kreisliga D', JUG:'Jugend'};
const POS_W = {
  'ST':{tempo:.25,technik:.2,zweikampf:.15,spielint:.15,mentalitaet:.25},
  'Flügel':{tempo:.35,technik:.25,zweikampf:.05,spielint:.15,mentalitaet:.2},
  'OM':{tempo:.15,technik:.3,zweikampf:.1,spielint:.3,mentalitaet:.15},
  'ZM':{tempo:.1,technik:.2,zweikampf:.25,spielint:.3,mentalitaet:.15},
  'IV':{tempo:.1,technik:.1,zweikampf:.35,spielint:.25,mentalitaet:.2},
  'AV':{tempo:.3,technik:.15,zweikampf:.25,spielint:.15,mentalitaet:.15},
  'TW':{tempo:.05,technik:.15,zweikampf:.2,spielint:.35,mentalitaet:.25},
};
const DEF_WEIGHTS = {prod:28, share:14, ctx:8, pot:13, trend:14, presse:10, scout:13};
let W = {...DEF_WEIGHTS};

const V6DEF = {photo:null, status:'Neu', geb:null, fuss:null, groesse:null};
let players = DATA.players.map(p=>({...V6DEF, ...p, isJugend:false}));
DATA.jugend.forEach(j=>{
  players.push({
    id:j.id, name:j.name, club:j.club, liga:'JUG', sub:j.kurz, staffel:j.staffel,
    tore:j.tore, teamSp:j.teamSp, tT:j.tT, rank:null, teamCount:null,
    km:j.km, own:j.own, exSvbc:false, zweit:false, kanone:false, manual:false,
    risiko:null, info:null, press:[],
    alter:j.estAlter, alterCa:true, jw:j.w,
    pos:'ST', einsaetze:null, assists:null,
    scout:{tempo:5,technik:5,zweikampf:5,spielint:5,mentalitaet:5}, scouted:true,
    note:'', star:false, prev:null, isJugend:true, ...{photo:null,status:'Neu',geb:null,fuss:null,groesse:null},
  });
});

const activeLigen = new Set(['KOL','A','B','C','D','JUG']);
let maxKm=999, query='', sortBy='score', fPos='', ageMin=null, ageMax=null;

/* ================= SCORING ================= */
const clamp=(v,a,b)=>Math.min(b,Math.max(a,v));
function ligaBase(l){return (l==='D1'||l==='D2')?'D':l;}
function wOf(p){return p.isJugend ? p.jw : LIGA_W[p.liga];}
function scores(p){
  const sp=p.einsaetze||((p.toreBelegt&&p.kaderDoc&&p.kaderStarts)?Math.max(6,p.kaderStarts):p.teamSp); /* dok.-Spiele-Basis NUR bei Untergrenzen-Toren aus den Heften, offizielle Saisontore rechnen über Team-Spiele */
  const gpg=(p.min&&p.min>=90)?p.tore/(p.min/90):p.tore/Math.max(1,sp);
  const wnow=gpg*wOf(p);
  let prod=clamp(wnow/1.0*100,0,100);
  let share=(p.tT&&p.tT>0)?clamp((p.tore/p.tT)/0.40*100,0,100):50;
  let ctx=50;
  if(p.rank!=null&&p.teamCount>1){const pct=(p.rank-1)/(p.teamCount-1);ctx=clamp(30+pct*70,0,100);}
  let pot=50;
  if(p.alter!=null){const a=p.alter;pot=a<=20?100:a<=23?88:a<=26?70:a<=29?50:a<=32?32:18;}
  let trend=50,tratio=null;
  if(p.prev){
    const wPrevLiga=LIGA_W[ligaBase(p.prev.liga)];
    const wprev=(p.prev.tore/Math.max(1,p.prev.spiele))*wPrevLiga;
    tratio=wnow/Math.max(0.05,wprev);
    trend=clamp(50+(tratio-1)*40,0,100);
    if(wOf(p)<wPrevLiga)trend=Math.min(trend,85);
    if(wOf(p)>wPrevLiga&&tratio>=0.7)trend=Math.max(trend,55);
  }
  if(p.toreBelegt)trend=Math.max(trend,40); /* belegte Tore sind Untergrenzen - fehlende Daten nicht als Formverlust werten */
  let scout=50;
  if(p.scouted&&Object.values(p.scout).some(v=>v!==5)){
    const w=POS_W[p.pos]||POS_W['ST'];let s=0;
    for(const k in w)s+=(p.scout[k]||5)*w[k];
    scout=clamp(s*10,0,100);
  }
  const presse=(p.pressIdx!=null)?p.pressIdx:50;
  let defMode=false, gaTxt=null;
  if(p.pos==='TW'||p.pos==='IV'||p.pos==='AV'){
    defMode=true;
    ctx=50; /* Team-Kontext neutral: der Teamstärke-Effekt steckt bereits im Gegentore-Vergleich */
    const c=(typeof clubFor==='function')?clubFor(p.club):null;
    const s26=c&&c.s2526;
    const lg=(DATA.ligaGA&&DATA.ligaGA['2526']&&s26)?DATA.ligaGA['2526'][s26.liga]:null;
    let defv=50;
    if(s26&&s26.gegentore&&s26.spiele&&lg){
      const ratio=(s26.gegentore/s26.spiele)/lg;
      defv=clamp((1.45-ratio)/0.9*100,0,100);
      gaTxt=(s26.gegentore/s26.spiele).toFixed(2)+' Gegentore/Spiel vs. Liga-Schnitt '+lg.toFixed(2);
      const s25=c.s2425;
      const lgp=(DATA.ligaGA&&DATA.ligaGA['2425']&&s25)?DATA.ligaGA['2425'][s25.liga]:null;
      if(s25&&s25.gegentore&&s25.spiele&&lgp&&!p.prev){
        const rp=(s25.gegentore/s25.spiele)/lgp;
        trend=clamp(50+(rp-ratio)*60,0,100);
      }
    }
    if(p.pos==='AV'&&p.assists)defv=clamp(defv+Math.min(10,p.assists*3),0,100);
    if(p.tore>0)defv=clamp(defv+Math.min(15,p.tore*5),0,100); /* Torgefahr-Bonus: Abwehrspieler mit (Standard-)Toren aufwerten */
    prod=Math.max(prod,defv);
    if(!(p.tore>0))share=defv;
  }
  const sum=W.prod+W.share+W.ctx+W.pot+W.trend+W.presse+W.scout;
  let total=(prod*W.prod+share*W.share+ctx*W.ctx+pot*W.pot+trend*W.trend+presse*W.presse+scout*W.scout)/sum;
  let sdsB=0;
  if(p.sds>0){sdsB=Math.min(6,p.sds*2);total=Math.min(100,total+sdsB);} /* FuPa Elf der Woche/Spieler des Spieltags: +2 je Nominierung, max +6 */
  const _mo=mvpOf(p); let mvpAdj=0, mvpVal=_mo?_mo.v:null, mvpD=_mo?_mo.d:null, mvpBase=total;
  if(mvpVal!=null&&p.adjTo==null){const _b=total;total=Math.min(100,total*mvpFactor(mvpVal));mvpAdj=Math.round((total-_b)*10)/10;} /* FuPa-MVP: team-relativer Leistungswert als ±6 %-Modifikator (50 % = neutral); Insider-Rating hat Vorrang */
  let adjD=0, adjBase=null;
  if(p.adjTo!=null){adjBase=Math.round(total*10)/10;adjD=Math.round((p.adjTo-total)*10)/10;total=p.adjTo;} /* Insider-Rating: Modellwert wird transparent überschrieben */
  const spTeam=(p.toreBelegt&&p.kaderDoc&&p.kaderStarts)?Math.max(6,p.kaderStarts):(p.teamSp||sp);
  const proj=Math.round((p.tore/Math.max(1,spTeam))*wOf(p)*30); /* xT über Team-Spiele: reale Einsatzquote eingerechnet, keine Vollzeit-Hochrechnung */
  return {prod:Math.round(prod),share:Math.round(share),ctx:Math.round(ctx),pot:Math.round(pot),
    trend:Math.round(trend),presse:Math.round(presse),scout:Math.round(scout),total:Math.round(total*10)/10,
    mvp:mvpVal,mvpAdj,mvpD,mvpBase:Math.round(mvpBase*10)/10,gpg,proj,tratio,defMode,gaTxt,sdsB,adjD,adjBase,shareRaw:(p.tT&&p.tT>0)?p.tore/p.tT:null};
}

/* ================= GEMS ================= */
function gemsOf(p){
  const s=scores(p);const out=[];
  if(p.exSvbc)out.push({k:'Rückholer',t:'Kennt den Verein: Ex-SV/BSC mit '+p.tore+' Toren höherklassig'});
  if(p.isJugend&&s.gpg>=0.8)out.push({k:'U19-Sprung',t:'Jugend-Quote '+fmt(s.gpg)+'/Spiel: bereit für Senioren-Minuten'});
  if(!p.isJugend&&p.zweit&&(p.liga==='C'||p.liga==='D')&&s.gpg>=0.65)out.push({k:'Zweite Reihe',t:'Top-Quote im II.-Team: kickt nur so tief, weil das Erstteam höher spielt'});
  if(!p.isJugend&&s.shareRaw!=null&&s.shareRaw>=0.35&&p.rank!=null&&p.rank>p.teamCount/2)out.push({k:'Einsamer Torjäger',t:Math.round(s.shareRaw*100)+'% aller Teamtore in schwachem Team'});
  if(s.tratio!=null&&s.tratio>=1.3&&p.liga!=='KOL')out.push({k:'Formexplosion',t:'Quote +'+Math.round((s.tratio-1)*100)+'% vs. Vorsaison (ligagewichtet)'});
  return out;
}
function gemScore(p){const g=gemsOf(p);return g.length?scores(p).total+6*g.length:null;}

/* ================= HELPERS ================= */
const $=s=>document.querySelector(s);
function fmt(x,d=2){return x==null?'–':x.toLocaleString('de-DE',{maximumFractionDigits:d});}
function tierColor(t){return t>=72?'#b39df7':t>=60?'#2fd27a':t>=48?'#ffd60a':'#ff6b6b';}
function tierName(t){return t>=72?'Elite':t>=60?'Gut':t>=48?'Mittel':'Schwach';}
const STATUS_LIST=['Neu','Beobachten','Kontaktiert','In Gesprächen','Zusage','Absage'];
function statusBadge(p){
  if(!p.status||p.status==='Neu')return '';
  const i=STATUS_LIST.indexOf(p.status)+1;
  return `<span class="badge b-status s${i}">${p.status}</span>`;
}
function avaHtml(p){
  const src=p.photo||p.photoUrl;
  return `<div class="ava l-${p.liga}">${src?`<img src="${src}" alt="" loading="lazy" onerror="this.remove()">`:''}${src?'':initials(p.name)}</div>`;
}
function dash(v,suffix=''){return (v===null||v===undefined||v==='')?'–':v+suffix;}
function clubFor(name){
  if(!name)return null;
  const n=name.toLowerCase().replace(/[^a-zäöüß0-9]/g,'');
  if(!n)return null;
  const cl=DATA.clubs||{};
  if(cl[n])return cl[n];
  for(const k in cl){ if(k.includes(n)||n.includes(k)) return cl[k]; }
  return null;
}
const LIGA_LONG={'GL':'Gruppenliga Darmstadt','KOL':'Kreisoberliga','A':'Kreisliga A','B':'Kreisliga B','C':'Kreisliga C','D':'Kreisliga D','D1':'Kreisliga D','D2':'Kreisliga D','JUG':'Jugend'};
function seasonsOf(p){
  const out=[];const c=clubFor(p.club);
  const t26=c&&c.s2526?` · Team: Platz ${c.s2526.platz} (${c.s2526.punkte} Pkt.)`:'';
  out.push({y:'25/26',type:'player',liga:p.isJugend?(p.sub||'Jugend'):LIGA_NAME[p.liga],verein:p.club,tore:p.tore,sp:p.einsaetze||p.teamSp,extra:t26});
  if(p.prev){
    const pc=clubFor(p.prev.verein);
    const t25=pc&&pc.s2425?` · Team: Platz ${pc.s2425.platz} (${pc.s2425.punkte} Pkt.)`:'';
    out.push({y:'24/25',type:'player',liga:LIGA_NAME[ligaBase(p.prev.liga)]||p.prev.liga,verein:p.prev.verein,tore:p.prev.tore,sp:p.prev.spiele,extra:t25});
  } else if(c&&c.s2425){
    out.push({y:'24/25',type:'team',club:c.name,d:c.s2425,note:'Spieler nicht in den Top-30-Torschützen'});
  } else {
    out.push({y:'24/25',type:'none',note:'keine öffentlichen Daten'});
  }
  for(const [y,key] of [['23/24','s2324'],['22/23','s2223']]){
    if(c&&c[key])out.push({y,type:'team',club:c.name,d:c[key],note:'Spielerdaten älterer Saisons nicht öffentlich'});
    else out.push({y,type:'none',note:'keine öffentlichen Daten (fussball.de-Archiv)'});
  }
  return out;
}
function initials(name){const p=name.split(' ').filter(Boolean);return ((p[0]||'')[0]||'')+((p[p.length-1]||'')[0]||'');}
function ring(t,big=false){return `<div class="ring ${big?'big':''}" style="--v:${t};--c:${tierColor(t)}"><span>${fmt(t,0)}</span></div>`;}
function visible(){
  return players.filter(p=>{
    if(!activeLigen.has(p.liga))return false;
    if(p.km>maxKm)return false;
    if(fPos&&p.pos!==fPos)return false;
    if(ageMin!=null||ageMax!=null){
      if(p.alter==null)return false;
      if(ageMin!=null&&p.alter<ageMin)return false;
      if(ageMax!=null&&p.alter>ageMax)return false;
    }
    if(query&&!(p.name+' '+p.club).toLowerCase().includes(query))return false;
    return true;
  });
}
function sorted(arr){
  const key={score:p=>scores(p).total,tore:p=>p.tore,gpg:p=>scores(p).gpg,
    share:p=>scores(p).shareRaw??-1,trend:p=>scores(p).trend,proj:p=>scores(p).proj,
    alter:p=>p.alter!=null?-p.alter:-99,km:p=>-p.km}[sortBy];
  return [...arr].sort((a,b)=>key(b)-key(a));
}
function trendArrow(p){
  const s=scores(p);
  if(s.tratio==null)return '';
  if(s.tratio>=1.15)return '<span class="tr-up">▲</span>';
  if(s.tratio<=0.85)return '<span class="tr-dn">▼</span>';
  return '<span class="tr-eq">≈</span>';
}
function badges(p){
  let h=`<span class="badge b-${p.liga}">${p.liga==='JUG'?(p.sub||'Jugend'):(p.liga==='KOL'?'KOL':p.liga+'-Klasse')}</span>`;
  if(p.own)h+=`<span class="badge b-own">SV/BSC</span>`;
  if(p.exSvbc)h+=`<span class="badge b-ex">Ex-SV/BSC</span>`;
  if(p.kanone)h+=`<span class="badge b-kan">Kanone</span>`;
  if(p.risiko)h+=`<span class="badge b-risk">⚠</span>`;
  if(!p.isJugend&&p.zweit)h+=`<span class="badge b-zweit">II/III</span>`;
  if(p.manual)h+=`<span class="badge b-man">Sichtung</span>`;
  h+=statusBadge(p);
  {const C=crmOf(p);
   if(C.c)h+=`<span class="badge b-crmc">📞 kontaktiert</span>`;
   if(C.s==='att')h+=`<span class="badge b-crma">💚 attraktiv</span>`;
   if(C.s==='no')h+=`<span class="badge b-crmn">🚫 kein Interesse</span>`;
   if(C.s==='lat')h+=`<span class="badge b-crml">⏰ ${crmDue(p)?'Wiedervorlage FÄLLIG':'später · '+fmtD(C.u)}</span>`;
   if(C.x&&!p.exSvbc)h+=`<span class="badge b-crmx">↩️ Ex-SV/BSC</span>`;}
  if(gemsOf(p).length)h+=`<span class="badge b-gem">💎</span>`;
  if(p.press&&p.press.length)h+=`<span title="Presse">📰</span>`;
  return h;
}
function rowHtml(p,i,extra=''){
  const s=scores(p);
  return `<div class="row" data-id="${p.id}">
    <div class="rankn ${i<3?'top':''}">${i+1}</div>
    ${avaHtml(p)}
    <div class="rmain">
      <div class="pname">${p.name} ${badges(p)}</div>
      <div class="pmeta">
        <span>${p.club}</span>
        <span><b>${p.tore}</b> Tore</span>
        <span><b>${fmt(s.gpg)}</b>/Sp.</span>
        ${s.shareRaw!=null?`<span><b>${Math.round(s.shareRaw*100)}%</b> Teamtore</span>`:''}
        ${p.alter!=null?`<span><b>${p.alter}${p.alterCa?'~':''}</b> J.</span>`:''}
        ${trendArrow(p)}
        <span>${p.km} km</span>
        <span>KLA: <b>${s.proj}</b></span>
      </div>
      ${extra}
    </div>
    <div class="rside">
      ${ring(s.total)}
      <button class="starbtn ${p.star?'on':''}" data-star="${p.id}">★</button>
    </div>
  </div>`;
}

/* ================= RENDER ================= */
function renderHome(){ if(typeof lzHomeZu==='function'&&lzHomeZu())return;
  const sen=players.filter(p=>!p.isJugend);
  $('#homeTiles').innerHTML=`
    <div class="tile"><div class="v">${sen.length}</div><div class="l">Senioren · 6 Ligen</div></div>
    <div class="tile"><div class="v">${players.filter(p=>p.isJugend).length}</div><div class="l">Jugend-Talente</div></div>
    <div class="tile"><div class="v">${players.filter(p=>gemsOf(p).length).length}</div><div class="l">💎 Rohdiamanten</div></div>
    <div class="tile"><div class="v">${players.filter(p=>p.star).length}</div><div class="l">⭐ Shortlist</div></div>`;
  $('#homeFocus').innerHTML=sorted(players.filter(p=>!crmHidden(p))).slice(0,6).map(p=>{
    const s=scores(p);
    return `<div class="fcard" data-id="${p.id}">
      <div class="shine"></div>
      <div class="top">${avaHtml(p)}${ring(s.total,true)}</div>
      <div class="fname">${p.name}</div>
      <div class="fclub">${p.club}</div>
      <div class="fmeta">${badges(p)}</div>
      <div class="fmeta"><span><b style="color:var(--ink)">${p.tore}</b>&nbsp;Tore</span><span>KLA-Prognose&nbsp;<b style="color:var(--ink)">${s.proj}</b></span></div>
    </div>`;}).join('');
  const gems=players.filter(p=>!crmHidden(p)).map(p=>({p,g:gemsOf(p),gs:gemScore(p)})).filter(x=>x.gs).sort((a,b)=>b.gs-a.gs).slice(0,6);
  {const wk=players.filter(p=>!p.own&&!p.isJugend&&!crmHidden(p)).map(p=>({p,W:wscore(p),s:scores(p)}))
    .filter(x=>x.W&&x.s.total>=55).sort((a,b)=>b.W.w-a.W.w||b.W.k-a.W.k).slice(0,10);
  const el=$('#homeWechsel');
  if(el)el.innerHTML=wk.map(x=>{const p=x.p;const src=p.photo||p.photoUrl;
    return `<div class="rankrow row" data-id="${p.id}">
      <span class="rk" style="color:${tierColor(x.W.w)}" title="Wechsel-Index (Wechselwahrscheinlichkeit)">${x.W.w}</span>
      <div class="ava l-${p.liga}" style="width:30px;height:30px;font-size:11px;border-radius:9px">${src?`<img src="${src}" onerror="this.remove()">`:initials(p.name)}</div>
      <span class="rn">${p.name}${p.club==='SG Wald-Michelbach'?` <b style="color:#4da3ff">●</b>`:``} <i style="color:var(--ink3)">${p.club} · ${LIGA_NAME[p.liga]||p.liga}</i><br><i style="color:#8fa3c7;font-size:11px">Stärke ${Math.round(x.s.total)} · Transfer-Chance ${x.W.k} · ${wreason(x.W,1)}</i></span>
      <span class="rv">${p.km!=null?p.km+' km':''}</span></div>`;}).join('')+
    `<p class="note">Zahl = <b>Wechsel-Index</b> (Wechselwahrscheinlichkeit aus öffentlichen Signalen), nur Spieler mit Stärke ≥ 45. Zeile antippen → Profil mit kompletter Begründung.</p>`;}
  $('#homeGems').innerHTML=gems.map(({p,g})=>{
    const s=scores(p);
    return `<div class="fcard gemcard" data-id="${p.id}">
      <div class="shine"></div>
      <div class="top">${avaHtml(p)}${ring(s.total,true)}</div>
      <div class="fname">${p.name}</div>
      <div class="fclub">${p.club}</div>
      <div class="gemtag">💎 ${g[0].k}</div>
      <div class="fmeta">${g[0].t}</div>
    </div>`;}).join('');
  {const el=$('#homeCrm');
   if(el){
    const T=todayISO();
    const due=players.filter(p=>crmDue(p));
    const att=players.filter(p=>crmOf(p).s==='att').map(p=>({p,W:p.own?null:wscore(p)})).sort((a,b)=>((b.W?b.W.k:0)-(a.W?a.W.k:0)));
    const exs=players.filter(p=>!p.own&&!p.isJugend&&(p.exSvbc||crmOf(p).x)).map(p=>({p,W:wscore(p)})).filter(x=>x.W).sort((a,b)=>b.W.k-a.W.k);
    const hidNo=players.filter(p=>crmOf(p).s==='no');
    const hidLat=players.filter(p=>{const C=crmOf(p);return C.s==='lat'&&C.u&&C.u>T;}).sort((a,b)=>(crmOf(a).u||'').localeCompare(crmOf(b).u||''));
    const cont=players.filter(p=>crmOf(p).c);
    const mini=(p,sub)=>{const src=p.photo||p.photoUrl;const C=crmOf(p);const W=wscoreSafe(p);
      return `<div class="rankrow row" data-id="${p.id}">
        <span class="rk" style="color:${W?tierColor(W.k):'var(--ink3)'}" title="${W?'Transfer-Chance':''}">${W?Math.round(W.k):'–'}</span>
        <div class="ava l-${p.liga}" style="width:30px;height:30px;font-size:11px;border-radius:9px">${src?`<img src="${src}" onerror="this.remove()">`:initials(p.name)}</div>
        <span class="rn">${p.name}${C.c?' <span class="badge b-crmc">📞</span>':''} <i style="color:var(--ink3)">${p.club} · ${LIGA_NAME[p.liga]||p.liga}</i>${sub?`<br><i style="color:#8fa3c7;font-size:11px">${sub}</i>`:''}${C.n?`<div class="crmnote">📝 ${kEsc(C.n.length>90?C.n.slice(0,90)+'…':C.n)}</div>`:''}</span>
        <span class="rv">${p.km!=null?p.km+' km':''}</span></div>`;};
    let out='<div class="sechead">🗂 Scouting-Zentrale <small style="color:var(--ink3)">Kontakte · Merkliste · Wiedervorlagen</small></div><div class="card" style="padding:10px 12px">';
    if(due.length)out+=`<div class="duebox"><b style="color:#ffb347">⏰ Wiedervorlage fällig (${due.length})</b> · die wolltet ihr euch jetzt wieder anschauen:</div>`+
      due.map(p=>mini(p,'Wiedervorlage seit '+fmtD(crmOf(p).u||T)+(wscoreSafe(p)?' · Transfer-Chance '+wscoreSafe(p).k:''))).join('');
    if(att.length)out+=`<div class="sechead" style="margin:10px 0 4px">💚 Unsere Kandidaten (${att.length})</div>`+
      att.map(x=>mini(x.p,x.W?('Transfer-Chance '+x.W.k+' · Wechsel-Index '+x.W.w):'' )).join('');
    if(exs.length)out+=`<div class="sechead" style="margin:10px 0 4px">↩️ Ehemalige im Blick (${exs.length}) <small style="color:var(--ink3)">Rückkehr gibt +15 im Wechsel-Index</small></div>`+
      exs.slice(0,8).map(x=>mini(x.p,'Transfer-Chance '+x.W.k+' · '+wreason(x.W,1))).join('');
    if(!due.length&&!att.length&&!exs.length&&!cont.length)out+=`<p class="note" style="margin:4px 0">So funktioniert's: Im Spielerprofil markierst du <b>📞 kontaktiert</b>, <b>💚 attraktiv</b>, <b>🚫 kein Interesse</b> oder <b>⏰ später</b> (mit Wiedervorlage-Datum). Alles landet hier: geräteübergreifend, auch für Tobi. Kennst du einen, der früher beim SV/BSC gespielt hat? <b>↩️ markieren</b> → er bekommt automatisch den Rückkehr-Bonus im Wechsel-Index.</p>`;
    if(hidNo.length||hidLat.length)out+=`<details class="hidbox"><summary>🚫 Ausgeblendet: ${hidNo.length} kein Interesse · ⏰ ${hidLat.length} auf Wiedervorlage: anzeigen</summary>`+
      hidLat.map(p=>mini(p,'wieder ab '+fmtD(crmOf(p).u))).join('')+
      hidNo.map(p=>mini(p,'kein Interesse: im Profil jederzeit änderbar')).join('')+`</details>`;
    out+='</div>';
    el.innerHTML=out;
   }}
  const pressP=players.filter(p=>p.press&&p.press.length).slice(0,3);
  $('#homePress').innerHTML=pressP.map((p,i)=>`
    <div class="row" data-id="${p.id}">
      ${avaHtml(p)}
      <div class="rmain"><div class="pname">${p.name} ${badges(p)}</div>
      <div class="pmeta"><span>${p.press[0].t.slice(0,150)}${p.press[0].t.length>150?'…':''}</span></div></div>
    </div>`).join('');
}
function renderList(){
  const arr=sorted(visible());
  const hid=(ageMin!=null||ageMax!=null)?players.filter(p=>activeLigen.has(p.liga)&&p.alter==null).length:0;
  $('#filterHint').textContent=`${arr.length} Spieler${hid?` · ${hid} ohne Altersangabe ausgeblendet`:''}${fPos?` · Position ${fPos} (Standard: ST)`:''}`;
  $('#list').innerHTML=arr.length?arr.map((p,i)=>rowHtml(p,i)).join(''):'<div class="empty">Keine Treffer: Filter lockern.</div>';
}
function renderGems(){
  const gems=players.filter(p=>!crmHidden(p)).map(p=>({p,g:gemsOf(p),gs:gemScore(p)})).filter(x=>x.gs).sort((a,b)=>b.gs-a.gs);
  $('#gemlist').innerHTML=gems.map(({p,g},i)=>
    rowHtml(p,i,`<div class="gemreason">${g.map(x=>`💎 <b>${x.k}</b>: ${x.t}`).join(' · ')}</div>`)
  ).join('');
}
function renderJugend(){
  const groups={};
  players.filter(p=>p.isJugend).forEach(j=>{(groups[j.staffel]=groups[j.staffel]||[]).push(j);});
  $('#jugendlist').innerHTML=Object.entries(groups).map(([st,list])=>
    `<div class="jhead">${st}</div>`+sorted(list).map((p,i)=>rowHtml(p,i)).join('')
  ).join('');
}
function renderShortlist(){
  const arr=sorted(players.filter(p=>p.star));
  $('#shortlist').innerHTML=arr.length
    ?arr.map((p,i)=>rowHtml(p,i)).join('')
    :'<div class="empty">Noch keine ⭐-Markierungen.</div>';
}
let dbSort={k:'score',dir:-1};
const DB_COLS=[
  {k:'name',l:'Spieler',get:p=>p.name},
  {k:'club',l:'Verein',get:p=>p.club},
  {k:'liga',l:'Liga',get:p=>p.isJugend?'JUG':p.liga},
  {k:'alter',l:'Alter',num:1,get:p=>p.alter},
  {k:'tore',l:'Tore',num:1,get:p=>p.tore},
  {k:'gpg',l:'T/Sp',num:1,get:p=>scores(p).gpg},
  {k:'share',l:'Anteil',num:1,get:p=>scores(p).shareRaw},
  {k:'trend',l:'Trend',num:1,get:p=>scores(p).tratio},
  {k:'proj',l:'KLA-Prog.',num:1,get:p=>scores(p).proj},
  {k:'km',l:'km',num:1,get:p=>p.km},
  {k:'status',l:'Status',get:p=>p.status||'Neu'},
  {k:'score',l:'MScore',num:1,get:p=>scores(p).total},
];
function renderDB(){
  const head=document.getElementById('dbhead');
  if(!head)return;
  {const dc=document.getElementById('dbCount'); if(dc)dc.textContent=players.length.toLocaleString('de-DE');}
  head.innerHTML='<tr>'+DB_COLS.map(c=>`<th class="${c.num?'num':''} ${dbSort.k===c.k?'on':''}" data-k="${c.k}">${c.l}${dbSort.k===c.k?(dbSort.dir<0?' ↓':' ↑'):''}</th>`).join('')+'</tr>';
  head.querySelectorAll('th').forEach(th=>{th.onclick=()=>{
    const k=th.dataset.k;
    if(dbSort.k===k)dbSort.dir*=-1;else dbSort={k,dir:-1};
    renderDB();
  };});
  const col=DB_COLS.find(c=>c.k===dbSort.k);
  const arr=[...players].sort((a,b)=>{
    let va=col.get(a),vb=col.get(b);
    if(va==null)va=dbSort.dir<0?-Infinity:Infinity;
    if(vb==null)vb=dbSort.dir<0?-Infinity:Infinity;
    if(typeof va==='string'&&typeof vb==='string')return dbSort.dir<0?vb.localeCompare(va,'de'):va.localeCompare(vb,'de');
    return dbSort.dir<0?(vb-va):(va-vb);
  });
  document.getElementById('dbbody').innerHTML=arr.map(p=>{
    const s=scores(p);
    return `<tr data-id="${p.id}">
      <td><b>${p.name}</b>${p.own?' 🟢':''}${p.exSvbc?' ↩️':''}${gemsOf(p).length?' 💎':''}</td>
      <td>${p.club}</td>
      <td>${p.isJugend?(p.sub||'JUG'):p.liga}</td>
      <td class="num">${p.alter!=null?p.alter+(p.alterCa?'~':''):'–'}</td>
      <td class="num">${p.tore}</td>
      <td class="num">${fmt(s.gpg)}</td>
      <td class="num">${s.shareRaw!=null?Math.round(s.shareRaw*100)+'%':'–'}</td>
      <td class="num">${s.tratio!=null?(s.tratio>=1.15?'▲':s.tratio<=0.85?'▼':'≈'):'–'}</td>
      <td class="num">${s.proj}</td>
      <td class="num">${p.km}</td>
      <td>${p.status||'Neu'}</td>
      <td class="num">${s.mvp!=null?s.mvp:'–'}</td>
      <td class="num"><b>${fmt(s.total,1)}</b></td>
    </tr>`;
  }).join('');
  document.getElementById('dbbody').querySelectorAll('tr').forEach(tr=>{tr.onclick=()=>startPlayer(tr.dataset.id);});
}
let deferredPrompt=null;
window.addEventListener('beforeinstallprompt',e=>{
  e.preventDefault();deferredPrompt=e;
  const b=document.getElementById('installBtn');
  if(b){b.style.display='inline-block';b.onclick=()=>{deferredPrompt.prompt();};}
});
/* ===== Kaderplaner-Pipeline (Kandidaten-CRM-Sicht) · v2 =====
   Felder je Spieler in CRM[pid]: k=Kontaktdaten (im Browser verschlüsselt, 'enc1:…'), lc=letzter Kontakt (ISO),
   w=Wechselwahrscheinlichkeit 1-4, rl=Zielrolle, tp=Zielposition, pl=verantw. Kaderplaner, mv/mvd=FuPa-MVP + Stand.
   CRM['__meta'] = {pl:[zusätzliche Planer], kv:Prüfwert des Team-Schlüssels}. Sync feldweise (siehe crmMerge). */
const KAND_DUE_DAYS=21;
const META_ID='__meta';
const PLANNERS_DEFAULT=(((window.VEREIN||{}).personen||{}).planer_start||[]).slice();
const WPROB={1:{t:'gering',c:'#8fa3c7'},2:{t:'mittel',c:'#ffd60a'},3:{t:'hoch',c:'#ffb347'},4:{t:'sehr hoch',c:'#5fe09b'}};
const KPOS=['TW','IV','AV','ZM','OM','Flügel','ST'];
let kandFP='',kandDue=false,kandQ='',kandPanel='',kandAddQ='',kandKeyMsg='',kandDigestContacts=false,kandDigestCache=[],kandPlDraft='',kandKeyDraft='';
function kEsc(s){return String(s==null?'':s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');}
function daysSince(iso){if(!iso)return null;const d=new Date(iso+'T00:00:00'),n=new Date(todayISO()+'T00:00:00');return Math.round((n-d)/86400000);}
function metaOf(){try{return CRM[META_ID]||{};}catch(e){return {};}}
function kandOut(C){ /* aus der Pipeline genommen. Gilt, bis danach wieder markiert/zugewiesen/eingeschätzt wird */
  if(!C.px)return false; const T=C._t||{}; return (T.px||0)>=Math.max(T.f||0,T.pl||0,T.w||0,T.s||0);}
function kandList(){return players.filter(p=>{const C=crmOf(p);return (C.f||C.pl||C.w||C.lc||C.s==='att')&&C.s!=='no'&&!kandOut(C);});}
function kandIsDue(p){const ds=daysSince(crmOf(p).lc);return ds===null||ds>KAND_DUE_DAYS;}
function metaPlanners(){const M=metaOf();return Object.keys(M).filter(k=>k.slice(0,3)==='pl:'&&M[k]).map(k=>k.slice(3));}
function kandPlanners(){const s=new Set(PLANNERS_DEFAULT);metaPlanners().forEach(x=>{if(x)s.add(x);});kandList().forEach(p=>{const q=crmOf(p).pl;if(q)s.add(q);});return [...s];}
function kandSoftRender(){ setTimeout(()=>{ if(crmIsTyping())_pendingRefresh=true; else renderKandidaten(); },0); } /* nicht neu zeichnen, solange jemand tippt (sonst schließt die Handy-Tastatur) */
function kToast(msg,actLabel,actFn){
  let t=document.getElementById('kToast');
  if(!t){t=document.createElement('div');t.id='kToast';t.className='ktoast';document.body.appendChild(t);}
  t.innerHTML='<span>'+kEsc(msg)+'</span>'+(actLabel?'<button type="button">'+kEsc(actLabel)+'</button>':'');
  if(actLabel){t.querySelector('button').onclick=()=>{t.classList.remove('on');try{actFn();}catch(e){}};}
  t.classList.add('on');clearTimeout(t._h);t._h=setTimeout(()=>t.classList.remove('on'),actLabel?6000:2600);
}
async function kCopy(txt){
  try{await navigator.clipboard.writeText(txt);kToast('📋 In die Zwischenablage kopiert');}
  catch(e){const ta=document.createElement('textarea');ta.value=txt;ta.style.position='fixed';ta.style.opacity='0';document.body.appendChild(ta);ta.select();
    try{document.execCommand('copy');kToast('📋 In die Zwischenablage kopiert');}catch(e2){kToast('Kopieren nicht möglich: Text bitte markieren');}ta.remove();}
}

/* ---------- Team-Schlüssel: Kontaktdaten Ende-zu-Ende verschlüsselt (AES-GCM 256, Schlüssel per PBKDF2 aus einem Satz) ---------- */
const TK_LS='svbcTeamKey';
let TK=null, tkVerified=false, tkBusy=false;
const KDEC={}, KSRC={};
function tkCan(){try{return !!(window.crypto&&crypto.subtle&&window.isSecureContext!==false);}catch(e){return false;}}
function lsGet(k){try{return localStorage.getItem(k);}catch(e){return null;}}
function lsSet(k,v){try{if(v==null)localStorage.removeItem(k);else localStorage.setItem(k,v);}catch(e){}}
function b64e(u){let s='';for(let i=0;i<u.length;i++)s+=String.fromCharCode(u[i]);return btoa(s);}
function b64d(s){const b=atob(s),u=new Uint8Array(b.length);for(let i=0;i<b.length;i++)u[i]=b.charCodeAt(i);return u;}
function isEnc(v){return typeof v==='string'&&v.slice(0,5)==='enc1:';}
async function tkDerive(pass){
  const e=new TextEncoder();
  const base=await crypto.subtle.importKey('raw',e.encode(pass),'PBKDF2',false,['deriveKey']);
  return crypto.subtle.deriveKey({name:'PBKDF2',salt:e.encode('svbc-scout/kontakt/v1'),iterations:600000,hash:'SHA-256'},base,{name:'AES-GCM',length:256},false,['encrypt','decrypt']);
}
async function tkEncWith(key,plain,aad){
  const iv=crypto.getRandomValues(new Uint8Array(12));
  const ct=new Uint8Array(await crypto.subtle.encrypt({name:'AES-GCM',iv,additionalData:new TextEncoder().encode('svbc:'+aad)},key,new TextEncoder().encode(plain)));
  const o=new Uint8Array(12+ct.length);o.set(iv,0);o.set(ct,12);return 'enc1:'+b64e(o);
}
async function tkDecWith(key,s,aad){const u=b64d(String(s).slice(5));const pt=await crypto.subtle.decrypt({name:'AES-GCM',iv:u.slice(0,12),additionalData:new TextEncoder().encode('svbc:'+aad)},key,u.slice(12));return new TextDecoder().decode(pt);}
function tkGenerate(){const A='abcdefghjkmnpqrstuvwxyzABCDEFGHJKLMNPQRSTUVWXYZ23456789',r=crypto.getRandomValues(new Uint32Array(16));let o='';for(let i=0;i<16;i++){if(i&&i%4===0)o+='-';o+=A[r[i]%A.length];}return o;} /* ~90 Bit Zufall */
async function tkInit(){ if(!tkCan())return; const pass=lsGet(TK_LS); if(!pass)return; try{TK=await tkDerive(pass);}catch(e){TK=null;return;} kandCryptoTick(true); }
async function tkSetPass(pass){
  pass=(pass||'').trim();
  const fail=m=>{kandKeyMsg=m;renderKandidaten();setTimeout(()=>{const i=document.getElementById('kKeyIn');if(i)i.focus();},0);};
  if(pass.length<12)return fail('Bitte mindestens 12 Zeichen. Am sichersten: „🎲 Schlüssel erzeugen“ nutzen.');
  if(!tkCan())return fail('Dieser Browser kann nicht verschlüsseln, bitte aktuellen Chrome/Safari/Firefox nutzen.');
  if(!_remoteDone)return fail('Daten werden noch geladen, bitte in ein paar Sekunden erneut versuchen.');
  kandKeyMsg='⏳ Prüfe …'; try{const m=document.querySelector('#panel-kandidaten .kmsg');if(m)m.textContent=kandKeyMsg;}catch(e){}
  let key; try{key=await tkDerive(pass);}catch(e){return fail('Schlüssel konnte nicht erzeugt werden.');}
  if(!metaOf().kv){ try{ const d=await syncFetch(); if(syncAdoptRemote(d))crmAfterRemote(); }catch(e){ return fail('Keine Verbindung zum Speicher, bitte gleich noch einmal versuchen.'); } }
  const kv=metaOf().kv;
  if(kv){ try{ if(await tkDecWith(key,kv,'kv')!=='svbc-ok')throw 0; }catch(e){ return fail('❌ Das ist nicht der Team-Schlüssel.'); } }
  else { crmSet(META_ID,{kv:await tkEncWith(key,'svbc-ok','kv')}); kToast('🔐 Team-Schlüssel festgelegt: teile ihn mit den anderen Kaderplanern'); }
  TK=key; tkVerified=true; lsSet(TK_LS,pass); kandKeyMsg=''; kandKeyDraft=''; kandPanel='';
  await kandCryptoTick(true);
}
function tkForget(){ TK=null; tkVerified=false; lsSet(TK_LS,null); for(const k in KDEC)delete KDEC[k]; for(const k in KSRC)delete KSRC[k]; kandPanel=''; renderKandidaten(); kToast('Schlüssel auf diesem Gerät entfernt'); }
async function kandCryptoTick(force){
  if(!TK||tkBusy){ if(force)try{renderKandidaten();}catch(e){} return; }
  tkBusy=true; let changed=!!force;
  try{
    const kv=metaOf().kv;
    if(!tkVerified&&kv){
      let ok=false; try{ ok=(await tkDecWith(TK,kv,'kv'))==='svbc-ok'; }catch(e){ ok=false; }
      if(!ok){ TK=null; kandKeyMsg='Der gespeicherte Schlüssel passt nicht zum Team-Schlüssel, bitte neu eingeben.'; tkBusy=false; try{renderKandidaten();}catch(e){} return; }
      tkVerified=true; changed=true;
    }
    if(!tkVerified&&!kv){ tkBusy=false; return; } /* ohne Prüfwert nichts ver-/entschlüsseln */
    for(const id in CRM){
      if(id===META_ID)continue; const C=CRM[id]; if(!C||!C.k)continue;
      if(isEnc(C.k)){ if(KSRC[id]!==C.k){ const src=C.k; try{KDEC[id]=await tkDecWith(TK,src,id);}catch(e){KDEC[id]=null;} KSRC[id]=src; changed=true; } }
      else if(tkVerified){ const plain=String(C.k); const ct=await tkEncWith(TK,plain,id); if(CRM[id]&&CRM[id].k===plain){ KDEC[id]=plain; KSRC[id]=ct; crmSet(id,{k:ct}); changed=true; } } /* Altbestand im Klartext → verschlüsseln (nur wenn zwischenzeitlich unverändert) */
    }
  }catch(e){}
  tkBusy=false;
  if(changed){ if(!force&&crmIsTyping())_pendingRefresh=true; else try{renderKandidaten();}catch(e){} }
}
async function kandSaveContact(id,val){
  val=(val||'').trim();
  if(!val){ crmSet(id,{k:undefined}); delete KDEC[id]; delete KSRC[id]; kandSoftRender(); return; }
  if(!TK||!tkVerified){ kToast('🔒 Erst den Team-Schlüssel eingeben'); renderKandidaten(); return; }
  const ct=await tkEncWith(TK,val,id); KDEC[id]=val; KSRC[id]=ct; crmSet(id,{k:ct}); kandSoftRender();
}
function kandContactPlain(p){const C=crmOf(p);if(!C.k)return '';if(isEnc(C.k))return (TK&&tkVerified&&KDEC[p.id])?KDEC[p.id]:'';return String(C.k);}
function kandPhone(v){const m=String(v||'').match(/\+?\d[\d \/().-]{4,}\d/);if(!m)return null;let d=m[0].replace(/[^\d+]/g,'');
  let intl=d.startsWith('+')?d.slice(1):d.startsWith('00')?d.slice(2):d.startsWith('0')?'49'+d.slice(1):d; return {tel:d,wa:intl};}
function kandMail(v){const m=String(v||'').match(/[^\s,;<>]+@[^\s,;<>]+\.[a-z]{2,}/i);return m?m[0]:null;}
function kandContactCell(p,C){
  if(TK&&tkVerified){
    const bad=C.k&&isEnc(C.k)&&KDEC[p.id]===null;
    const v=kandContactPlain(p);
    const ph=kandPhone(v), ml=kandMail(v);
    return '<input class="kand-in" data-kc="'+p.id+'" value="'+kEsc(v)+'" placeholder="'+(bad?'⚠ nicht lesbar':'Handy / E-Mail')+'" autocomplete="off">'
      +((ph||ml)?'<div class="kacts">'+(ph?'<a class="kbtn klink" href="tel:'+kEsc(ph.tel)+'" title="Anrufen">📞</a><a class="kbtn klink" href="https://wa.me/'+kEsc(ph.wa)+'" target="_blank" rel="noopener" title="WhatsApp-Chat öffnen">💬</a>':'')+(ml?'<a class="kbtn klink" href="mailto:'+kEsc(ml)+'" title="E-Mail">✉️</a>':'')+'</div>':'');
  }
  if(C.k&&!isEnc(C.k))return '<span class="kand-lock" style="color:#ffb347" title="Wird verschlüsselt, sobald ein Planer mit Schlüssel die Seite öffnet">⚠ unverschlüsselt</span>';
  if(C.k)return '<span class="kand-lock" title="Verschlüsselt gespeichert: Team-Schlüssel eingeben zum Anzeigen">🔒 hinterlegt</span>';
  return '<span class="kand-lock" title="Kontaktdaten werden verschlüsselt gespeichert. Dazu Team-Schlüssel eingeben">🔒 –</span>';
}

/* ---------- Wochen-Digest je Kaderplaner (zum Kopieren / Teilen per WhatsApp) ---------- */
function kandLine(p){
  const C=crmOf(p),ds=daysSince(C.lc),b=[];
  b.push(p.name+' ('+[p.club,(C.tp||p.pos)].filter(Boolean).join(' · ')+')');
  b.push(ds===null?'noch nie kontaktiert':'letzter Kontakt vor '+ds+' T');
  if(C.w)b.push('Wechsel '+WPROB[C.w].t);
  if(C.rl)b.push('Rolle: '+C.rl);
  if(kandDigestContacts){const kd=kandContactPlain(p);if(kd)b.push('☎ '+kd);}
  return '• '+b.join(' · ');
}
function kandDigestText(pl){
  const d=new Date(),ds=String(d.getDate()).padStart(2,'0')+'.'+String(d.getMonth()+1).padStart(2,'0')+'.'+d.getFullYear();
  const all=kandList();
  const sec=(name,L)=>{
    const due=L.filter(kandIsDue).sort((a,b)=>(daysSince(crmOf(b).lc)??1e9)-(daysSince(crmOf(a).lc)??1e9)), ok=L.filter(p=>!kandIsDue(p));
    let t=(name?'👤 '+name:'👤 ohne Verantwortlichen')+' · '+(due.length?due.length+' von '+L.length+' fällig':'alle '+L.length+' im Plan ✓')+'\n';
    if(due.length)t+='⏰ Jetzt melden:\n'+due.map(kandLine).join('\n')+'\n';
    if(ok.length)t+='✅ Im Plan: '+ok.map(p=>p.name+' ('+daysSince(crmOf(p).lc)+' T)').join(', ')+'\n';
    return t;
  };
  let t='⚽ SV/BSC Kaderplanung · Digest '+ds+'\n(überfällig = Erinnerung je Kandidat überschritten, Standard '+KAND_DUE_DAYS+' Tage)\n\n';
  if(pl!=null){ t+=sec(pl,all.filter(p=>(crmOf(p).pl||'')===pl)); return t.trim(); }
  const groups={}; all.forEach(p=>{const k=crmOf(p).pl||'';(groups[k]=groups[k]||[]).push(p);});
  Object.keys(groups).sort((a,b)=>(a===''?1:0)-(b===''?1:0)||a.localeCompare(b,'de')).forEach(k=>{t+=sec(k||null,groups[k])+'\n';});
  return t.trim();
}
function kandDigestPanel(){
  const planners=kandPlanners(), metaPl=metaPlanners(), all=kandList();
  const chips=planners.map(n=>'<span class="kplchip">'+kEsc(n)+(metaPl.includes(n)&&!PLANNERS_DEFAULT.includes(n)?'<button class="kx" data-plrm="'+kEsc(n)+'" title="Planer entfernen">×</button>':'<span style="width:6px"></span>')+'</span>').join(' ');
  kandDigestCache=[];
  let cards='';
  if(!all.length){ cards='<div class="kand-sub" style="padding:8px 0">Noch keine Kandidaten in der Pipeline, dann gibt es auch nichts zu erinnern.</div>'; }
  else{
    const items=[{t:'👥 Alle Planer',pl:null,n:all.filter(kandIsDue).length}];
    planners.forEach(n=>{const L=all.filter(p=>(crmOf(p).pl||'')===n);if(L.length)items.push({t:'👤 '+n,pl:n,n:L.filter(kandIsDue).length});});
    cards='<div class="kdgrid">'+items.map((it,i)=>{const txt=kandDigestText(it.pl);kandDigestCache[i]=txt;
      return '<div class="kdcard"><div class="kdh"><b>'+kEsc(it.t)+'</b> <span class="kchip" style="background:'+(it.n?'rgba(255,70,70,.15);color:#ff8a8a':'rgba(47,210,122,.15);color:#5fe09b')+'">'+(it.n?it.n+' fällig':'alles im Plan')+'</span></div>'
        +'<textarea readonly>'+kEsc(txt)+'</textarea><div class="btnrow" style="margin-top:6px;display:flex;gap:6px"><button class="kbtn" data-kdcopy="'+i+'">📋 Kopieren</button><a class="kbtn kbtn-go" href="https://wa.me/?text='+encodeURIComponent(txt)+'" target="_blank" rel="noopener">💬 Per WhatsApp teilen</a></div></div>';}).join('')+'</div>';
  }
  return '<div class="card kpanel"><div class="kpanel-h"><b>📨 Wochen-Digest &amp; Kaderplaner</b><span style="flex:1"></span><button class="kx" id="kpClose" title="Schließen">✕</button></div>'
    +'<div class="kand-sub" style="margin-bottom:8px">Pro Planer eine fertige Erinnerung: wer ist fällig, wer ist im Plan. Kopieren oder direkt in WhatsApp teilen. Z.B. jeden Montag.</div>'
    +'<div class="kctrl"><span class="kand-sub">Kaderplaner:</span> '+chips+' <input id="kplNew" class="kand-in" style="max-width:150px" placeholder="＋ Name" autocomplete="off" value="'+kEsc(kandPlDraft)+'"><button class="kbtn" id="kplAdd">Hinzufügen</button></div>'
    +'<label style="display:flex;align-items:center;gap:6px;font-size:12px;margin-top:8px"><input type="checkbox" id="kdContacts"'+(kandDigestContacts?' checked':'')+'> Kontaktdaten mit in den Text nehmen'+(canContacts()?'':' <i class="kand-sub">(nur für Kaderplaner)</i>')+'</label>'
    +cards+'</div>';
}
function kandKeyPanel(){
  const kv=metaOf().kv;
  let body;
  if(!tkCan()) body='<p class="kand-sub">Dieser Browser unterstützt keine Verschlüsselung. Bitte einen aktuellen Browser verwenden.</p>';
  else if(TK&&tkVerified) body='<p style="font-size:13px;margin:0 0 8px">✅ Auf diesem Gerät entsperrt. Kontaktdaten werden <b>im Browser verschlüsselt</b>, bevor sie gespeichert werden. Online (GitHub, Make-Speicher) liegen sie nur als unlesbarer Code.</p><button class="kbtn" id="kKeyForget">Schlüssel auf diesem Gerät entfernen</button>';
  else body='<p style="font-size:13px;margin:0 0 8px">'+(kv?'Gib den <b>Team-Schlüssel</b> ein, den ihr unter euch Kaderplanern geteilt habt. Er wird nur auf diesem Gerät gespeichert.':'<b>Noch kein Team-Schlüssel festgelegt.</b> Am sichersten: <b>🎲 erzeugen</b> lassen, kopieren und den anderen Kaderplanern schicken. Eigener Schlüssel geht auch (mind. 12 Zeichen). Ohne Schlüssel sind die Kontaktdaten für niemanden lesbar, auch nicht für GitHub oder den Make-Speicher.')+'</p>'
    +'<div class="kctrl"><input type="'+(kv?'password':'text')+'" id="kKeyIn" class="kand-in" style="max-width:280px" placeholder="Team-Schlüssel" autocomplete="off" autocapitalize="off" spellcheck="false" value="'+kEsc(kandKeyDraft)+'">'+(kv?'':'<button class="kbtn" id="kKeyGen">🎲 Schlüssel erzeugen</button><button class="kbtn" id="kKeyCopy" title="Kopieren">📋</button>')+'<button class="kbtn kbtn-go" id="kKeyOk">'+(kv?'🔓 Entsperren':'🔐 Festlegen')+'</button></div>'
    +'<div class="kmsg">'+kEsc(kandKeyMsg)+'</div><p class="kand-sub" style="margin-top:4px">Der Schlüssel lässt sich nicht wiederherstellen. Wer ihn vergisst, fragt einfach einen anderen Planer.</p>';
  return '<div class="card kpanel"><div class="kpanel-h"><b>🔐 Team-Schlüssel für Kontaktdaten</b><span style="flex:1"></span><button class="kx" id="kpClose" title="Schließen">✕</button></div>'+body+'</div>';
}

/* ---------- Ansicht ---------- */
function renderHomeKand(){
  const el=document.getElementById('homeKand'); if(!el)return;
  const L=kandList(); if(!L.length){el.innerHTML='';return;}
  const due=L.filter(kandIsDue).length;
  el.innerHTML='<div class="card homekand" role="button" tabindex="0"><div><b>🗂️ Kaderplaner-Pipeline</b><div class="kand-sub" style="font-size:12.5px;margin-top:2px">'+L.length+' Kandidat'+(L.length>1?'en':'')+(due?' · <span style="color:#ff8a8a;font-weight:700">'+due+' Kontakt'+(due>1?'e':'')+' überfällig</span>':' · alle Kontakte im Plan ✓')+'</div></div><span style="font-weight:800;font-size:20px;color:var(--accent)">›</span></div>';
  el.firstChild.onclick=()=>goTab('kandidaten');
}
function renderKandidaten(){
  try{renderHomeKand();}catch(e){}
  const wrap=document.getElementById('kandWrap'); if(!wrap)return;
  if(TK)kandCryptoTick();
  const planners=kandPlanners();
  const all=kandList();
  let list=all;
  if(kandFP)list=list.filter(p=>kandFP==='__me'?svIsMine(crmOf(p).pl):(crmOf(p).pl||'')===kandFP);
  if(kandDue)list=list.filter(kandIsDue);
  if(kandQ){const q=_mvpNorm(kandQ);list=list.filter(p=>_mvpNorm(p.name+' '+(p.club||'')).includes(q));}
  list=list.slice().sort((a,b)=>{
    const da=kandIsDue(a)?1:0,db=kandIsDue(b)?1:0; if(da!==db)return db-da;
    const sa=daysSince(crmOf(a).lc),sb=daysSince(crmOf(b).lc);
    const va=sa===null?1e9:sa,vb=sb===null?1e9:sb; if(va!==vb)return vb-va;
    const wa=crmOf(a).w||0,wb=crmOf(b).w||0; if(wa!==wb)return wb-wa;
    return (a.name||'').localeCompare(b.name||'');
  });
  const opt=(arr,cur,ph)=>'<option value="">'+ph+'</option>'+arr.map(o=>'<option value="'+kEsc(o)+'"'+(String(cur)===String(o)?' selected':'')+'>'+kEsc(o)+'</option>').join('');
  const dueCount=all.filter(kandIsDue).length;
  const keyBtn='';
  const stT={pending:'⏳ speichert…',ok:'☁️ gespeichert',err:'⚠️ offline, wird nachgeholt'}[SYNC_ST]||'';
  let html='<div class="card" style="padding:10px 12px;margin-bottom:8px">'
    +'<div class="kctrl">'
    +'<input id="kandSearch" class="kand-in" style="max-width:190px" placeholder="🔎 In Pipeline suchen…" value="'+kEsc(kandQ)+'" autocomplete="off">'
    +'<select id="kandPl" class="kand-in" style="max-width:160px">'+svPlOpts(opt(planners,kandFP,'Alle Planer'))+'</select>'
    +'<label style="display:flex;align-items:center;gap:5px;font-size:12px;color:var(--ink)"><input type="checkbox" id="kandDueChk"'+(kandDue?' checked':'')+'> nur überfällig</label>'
    +'<span style="flex:1"></span>'
    +'<span class="kchip" style="background:rgba(255,70,70,.15);color:#ff8a8a">'+dueCount+' überfällig</span>'
    +'<span class="kchip" style="background:var(--card2);color:var(--ink3)">'+all.length+' Kandidaten</span>'
    +'</div><div class="kctrl">'
    +'<div class="kadd"><input id="kandAdd" class="kand-in" placeholder="＋ Spieler aufnehmen (Name tippen)…" value="'+kEsc(kandAddQ)+'" autocomplete="off"><div id="kandAddRes" class="kaddres"></div></div>'
    +'<button class="kbtn" id="kDigBtn">📨 Digest &amp; Planer</button>'+keyBtn
    +'<span class="kchip ksync" style="background:var(--card2);color:var(--ink3)'+(stT?'':';display:none')+'">'+stT+'</span>'
    +'</div></div>';
  if(kandPanel==='digest')html+=kandDigestPanel();
  if(kandPanel==='key')html+=kandKeyPanel();
  if(!list.length){
    html+='<div class="card" style="padding:18px;text-align:center;color:var(--ink3,#8fa3c7)">'+(all.length?'Keine Kandidaten für diesen Filter.':'Noch keine Kandidaten. Oben bei <b>„＋ Spieler aufnehmen"</b> einen Namen tippen, oder im Spielerprofil ☆ „Auf die Shortlist".')+'</div>';
    wrap.innerHTML=html; wireKand(); return;
  }
  const rows=list.map(p=>{
    const C=crmOf(p),ds=daysSince(C.lc),due=kandIsDue(p),s=scores(p),W=p.own?null:wscoreSafe(p);
    const wsel='<select class="kand-in" data-kf="w" data-id="'+p.id+'"><option value="">–</option>'+[1,2,3,4].map(n=>'<option value="'+n+'"'+(C.w==n?' selected':'')+'>'+WPROB[n].t+'</option>').join('')+'</select>'
      +(W?'<div class="kand-sub" style="margin-top:2px" title="Modell-Wechselbereitschaft: '+kEsc(wreason(W,3))+'">Modell: '+W.w+'/100</div>':'');
    const posSel='<select class="kand-in" data-kf="tp" data-id="'+p.id+'">'+opt(KPOS,C.tp,(p.pos?p.pos+' (akt.)':'Pos'))+'</select>';
    const plSel='<select class="kand-in" data-kf="pl" data-id="'+p.id+'">'+opt(planners,C.pl,'—')+'</select>';
    const badge=due?(ds===null?'<span class="kchip" style="background:#ff5b5b22;color:#ff8a8a">nie kontaktiert</span>':'<span class="kchip" style="background:#ff5b5b22;color:#ff8a8a">überfällig · '+ds+' T</span>'):'<span class="kand-sub">vor '+ds+' T · fällig in '+(kandIv(p)-ds+1)+' T</span>';
    const mv=s.mvp!=null?' <span class="kchip" style="background:rgba(47,210,122,.14);color:#5fe09b" title="FuPa-MVP (team-relativ)">MVP '+s.mvp+'</span>':'';
    return '<tr class="'+(due?'due':'')+'">'
      +'<td class="kfull" data-l="Kandidat"><div style="display:flex;align-items:flex-start;gap:6px"><div style="flex:1;min-width:0"><span class="kand-name" data-open="'+p.id+'">'+kEsc(p.name)+'</span>'+mv
        +'<div class="kand-sub">'+kEsc(p.club||'')+(p.pos?' · '+kEsc(p.pos):'')+(p.alter?' · '+p.alter+' J':'')+' · MScore '+fmt(s.total,1)+'</div></div><button class="kx" data-krm="'+p.id+'" title="Aus der Pipeline nehmen">✕</button></div></td>'
      +'<td data-l="Wechsel-W.">'+wsel+'</td>'
      +'<td data-l="Rolle"><input class="kand-in" data-kf="rl" data-id="'+p.id+'" value="'+kEsc(C.rl||'')+'" placeholder="z.B. Stammspieler" list="kRoleList"></td>'
      +'<td data-l="Zielposition">'+posSel+'</td>'
      +'<td class="kfull" data-l="Kontakt 🔒">'+kandContactCell(p,C)+'</td>'
      +'<td class="kfull" data-l="Letzter Kontakt" style="white-space:nowrap"><input type="date" class="kand-in" style="width:128px;display:inline-block" data-kf="lc" data-id="'+p.id+'" value="'+kEsc(C.lc||'')+'"> <button class="kbtn" data-today="'+p.id+'">heute</button><div style="margin-top:3px">'+badge+'</div>'+kandIvSel(p,C)+'</td>'
      +'<td data-l="Verantwortlich">'+plSel+'</td>'
      +'<td class="kfull" data-l="Notiz"><input class="kand-in" data-kf="n" data-id="'+p.id+'" value="'+kEsc(C.n||'')+'" placeholder="Notiz"></td>'
      +'</tr>';
  }).join('');
  html+='<div class="kwrap"><table class="kand-table"><thead><tr><th>Kandidat</th><th>Wechsel-W.</th><th>Rolle</th><th>Zielposition</th><th>Kontakt 🔒</th><th>Letzter Kontakt</th><th>Verantw.</th><th>Notiz</th></tr></thead><tbody>'+rows+'</tbody></table></div>';
  wrap.innerHTML=html; wireKand();
}
function kandAddResults(){
  const box=document.getElementById('kandAddRes'); if(!box)return;
  const q=_mvpNorm(kandAddQ); if(q.length<2){box.innerHTML='';box.style.display='none';return;}
  const inPipe=new Set(kandList().map(p=>p.id));
  const res=players.filter(p=>!inPipe.has(p.id)&&_mvpNorm(p.name).includes(q))
    .map(p=>({p,t:scores(p).total,st:_mvpNorm(p.name).startsWith(q)||_mvpNorm(p.name.split(' ').slice(-1)[0]).startsWith(q)?1:0}))
    .sort((a,b)=>b.st-a.st||b.t-a.t).slice(0,8);
  box.innerHTML=res.length?res.map(({p,t})=>'<button type="button" class="kaddit" data-addid="'+p.id+'"><b>'+kEsc(p.name)+'</b>'+(p.own?' 🟢':'')+'<div class="kand-sub">'+kEsc(p.club||'')+' · '+kEsc(p.pos||'–')+' · '+(p.isJugend?'Jugend':kEsc(p.liga||''))+' · MScore '+fmt(t,1)+'</div></button>').join('')
    :'<div class="kand-sub" style="padding:10px">Kein Treffer (oder schon in der Pipeline).</div>';
  box.style.display='block';
  box.querySelectorAll('[data-addid]').forEach(b=>b.onclick=()=>{
    const id=b.dataset.addid,p=players.find(x=>x.id===id);
    if(p)p.star=true; crmSet(id,{f:1,px:undefined}); kandAddQ=''; renderKandidaten();
    kToast('✓ '+(p?p.name:'Spieler')+' in die Pipeline aufgenommen');
  });
}
function kandRemove(id){
  const p=players.find(x=>x.id===id), C=crmOf({id}), prev={f:C.f,pl:C.pl,w:C.w,s:C.s,px:C.px};
  const upd={f:undefined,pl:undefined,w:undefined,px:1}; if(C.s==='att')upd.s=undefined;
  if(p)p.star=false; crmSet(id,upd); const tRem=(CRM[id]&&CRM[id]._t&&CRM[id]._t.px)||0; renderKandidaten();
  kToast((p?p.name:'Spieler')+' aus der Pipeline genommen','Rückgängig',()=>{ const T=(CRM[id]&&CRM[id]._t)||{}, back={}; Object.keys(prev).forEach(k=>{ if((T[k]||0)===tRem)back[k]=prev[k]; }); if(p&&('f' in back))p.star=!!prev.f; crmSet(id,back); renderKandidaten(); });
}
function wireKand(){
  const w=document.getElementById('kandWrap'); if(!w)return;
  const s=document.getElementById('kandSearch'); if(s){s.oninput=e=>{kandQ=e.target.value;};s.onchange=e=>{kandQ=e.target.value;renderKandidaten();};s.onkeydown=e=>{if(e.key==='Enter'){kandQ=e.target.value;renderKandidaten();}};}
  const pl=document.getElementById('kandPl'); if(pl)pl.onchange=e=>{kandFP=e.target.value;renderKandidaten();};
  const dc=document.getElementById('kandDueChk'); if(dc)dc.onchange=e=>{kandDue=e.target.checked;renderKandidaten();};
  const ad=document.getElementById('kandAdd');
  if(ad){ ad.oninput=e=>{kandAddQ=e.target.value;kandAddResults();}; ad.onfocus=()=>kandAddResults();
    ad.onkeydown=e=>{ if(e.key==='Escape'){kandAddQ='';ad.value='';kandAddResults();} if(e.key==='Enter'){const f=document.querySelector('#kandAddRes [data-addid]');if(f)f.click();} };
    if(kandAddQ){kandAddResults();} }
  const db=document.getElementById('kDigBtn'); if(db)db.onclick=()=>{kandPanel=kandPanel==='digest'?'':'digest';renderKandidaten();};
  const kb=document.getElementById('kKeyBtn'); if(kb)kb.onclick=()=>{kandPanel=kandPanel==='key'?'':'key';kandKeyMsg='';renderKandidaten();setTimeout(()=>{const i=document.getElementById('kKeyIn');if(i)i.focus();},0);};
  const pc=document.getElementById('kpClose'); if(pc)pc.onclick=()=>{kandPanel='';renderKandidaten();};
  const ko=document.getElementById('kKeyOk'), ki=document.getElementById('kKeyIn');
  if(ko&&ki){ko.onclick=()=>tkSetPass(ki.value);ki.onkeydown=e=>{if(e.key==='Enter')tkSetPass(ki.value);};ki.oninput=e=>{if(ki.type==='text')kandKeyDraft=e.target.value;};}
  const kg=document.getElementById('kKeyGen'); if(kg&&ki)kg.onclick=()=>{ki.value=tkGenerate();kandKeyDraft=ki.value;ki.focus();ki.select();};
  const kc=document.getElementById('kKeyCopy'); if(kc&&ki)kc.onclick=()=>{if(ki.value)kCopy(ki.value);};
  const kf=document.getElementById('kKeyForget'); if(kf)kf.onclick=tkForget;
  const pa=document.getElementById('kplAdd'), pn=document.getElementById('kplNew');
  const addPl=()=>{const n=(pn.value||'').replace(/[^\p{L}\p{N} .\-]/gu,'').trim().replace(/\s+/g,' ').slice(0,30); if(!n)return; if(!PLANNERS_DEFAULT.includes(n)&&!metaPlanners().includes(n)){const u={};u['pl:'+n]=1;crmSet(META_ID,u);} kandPlDraft=''; renderKandidaten(); kToast('✓ '+n+' als Kaderplaner ergänzt');};
  if(pa&&pn){pa.onclick=addPl;pn.onkeydown=e=>{if(e.key==='Enter')addPl();};pn.oninput=e=>{kandPlDraft=e.target.value;};}
  w.querySelectorAll('[data-plrm]').forEach(b=>b.onclick=()=>{const u={};u['pl:'+b.dataset.plrm]=undefined;crmSet(META_ID,u);renderKandidaten();});
  const dcx=document.getElementById('kdContacts'); if(dcx)dcx.onchange=e=>{kandDigestContacts=e.target.checked;renderKandidaten();};
  w.querySelectorAll('[data-kdcopy]').forEach(b=>b.onclick=()=>kCopy(kandDigestCache[+b.dataset.kdcopy]||''));
  w.querySelectorAll('[data-kf]').forEach(el=>{el.onchange=()=>{
    const id=el.dataset.id,kf=el.dataset.kf;let v=el.value;
    if(kf==='w'||kf==='ri')v=v?+v:'';
    const upd={};upd[kf]=(v===''||v==null)?undefined:(typeof v==='string'?v.trim():v);
    if(kf==='lc'&&v)upd.c=1;
    crmSet(id,upd);kandSoftRender();
  };});
  w.querySelectorAll('[data-kc]').forEach(el=>{el.onchange=()=>kandSaveContact(el.dataset.kc,el.value);});
  w.querySelectorAll('[data-today]').forEach(b=>{b.onclick=()=>{crmSet(b.dataset.today,{lc:todayISO(),c:1});renderKandidaten();kToast('✓ Kontakt heute eingetragen');};});
  w.querySelectorAll('[data-krm]').forEach(b=>{b.onclick=()=>kandRemove(b.dataset.krm);});
  w.querySelectorAll('[data-open]').forEach(el=>{el.onclick=()=>{try{startPlayer(el.dataset.open);}catch(e){}};});
}

/* ===== Kaderplan-Board: druckbare Kaderplanung (Stamm/Backup/Ziel je Position) auf LINEUP+SHADOW ===== */
let kpShowZiel=true;
function kpCellOwn(p,want){
  if(!p)return '<span class="kp-none">—</span>';
  const s=scores(p),tag=want?posFit(p,want):null;
  return '<span class="kp-ov" style="background:'+tierColor(s.total)+'">'+Math.round(s.total)+'</span> <span class="kp-name" data-open="'+p.id+'">'+kEsc(p.name)+'</span>'+(tag?' <span class="kp-fit" style="color:'+tag.col+'">'+kEsc(tag.tag)+'</span>':'');
}
function kpCellExt(p,want){
  if(!p)return '<span class="kp-none">—</span>';
  const W=p.own?null:wscore(p),v=W?W.k:scores(p).total,tag=want?posFit(p,want):null;
  return '<span class="kp-ov" style="background:'+tierColor(v)+'">'+Math.round(v)+'</span> <span class="kp-name" data-open="'+p.id+'">'+kEsc(p.name)+'</span> <i class="kp-club">'+kEsc(p.own?'eigen':(p.club||''))+'</i>'+(tag?' <span class="kp-fit" style="color:'+tag.col+'">'+kEsc(tag.tag)+'</span>':'');
}
function renderKaderplan(){
  const wrap=document.getElementById('kaderplanWrap'); if(!wrap)return;
  if(!Object.keys(LINEUP.slots).length){ try{initLineupSeed();}catch(e){} }
  const form=FORMATIONS[LINEUP.formation];
  const P=id=>id&&players.find(z=>z.id===id);
  const groups={TOR:[],ABWEHR:[],MITTELFELD:[],ANGRIFF:[]};
  form.forEach((sl,i)=>{const role=sl[0],y=sl[2];const g=role==='TW'?'TOR':(y>=66?'ABWEHR':(y>=40?'MITTELFELD':'ANGRIFF'));groups[g].push({i,role,x:sl[1]});});
  Object.values(groups).forEach(a=>a.sort((p,q)=>p.x-q.x));
  let open=0,thin=0,ok=0,body='';
  ['TOR','ABWEHR','MITTELFELD','ANGRIFF'].forEach(g=>{
    if(!groups[g].length)return;
    body+='<tr class="kp-grp"><td colspan="'+(kpShowZiel?5:4)+'">'+g+'</td></tr>';
    groups[g].forEach(o=>{
      const i=o.i,role=o.role,want=ROLE2POS[role];
      const st=P(LINEUP.slots[i]),b=P((SHADOW[i]||{}).b),z=P((SHADOW[i]||{}).z);
      let status;
      if(!st){status='<span class="kp-st off">✕ offen</span>';open++;}
      else if(!b){status='<span class="kp-st thin">⚠ kein Backup</span>';thin++;}
      else{status='<span class="kp-st ok">✓ besetzt</span>';ok++;}
      body+='<tr'+(!st?' class="kp-open"':'')+'><td class="kp-pos" data-l="Pos">'+role+'</td>'
        +'<td data-l="Stammspieler">'+kpCellOwn(st,null)+'</td>'
        +'<td class="kp-sub" data-l="Backup">'+kpCellOwn(b,want)+'</td>'
        +(kpShowZiel?'<td class="kp-sub" data-l="🎯 Ziel">'+kpCellExt(z,want)+'</td>':'')
        +'<td class="kp-stc" data-l="Status">'+status+'</td></tr>';
    });
  });
  const d=new Date(),dstr=String(d.getDate()).padStart(2,'0')+'.'+String(d.getMonth()+1).padStart(2,'0')+'.'+d.getFullYear();
  let html='<div class="kp-print-only"><div style="font-size:20px;font-weight:800">SV/BSC Mörlenbach: Kaderplanung</div><div style="font-size:11px;color:#555;margin-top:2px">Formation '+LINEUP.formation+' · Stand '+dstr+' · Stammspieler + Backup = aktueller Kader · 🎯 Ziel = Wunsch/Transferziel nächste Saison</div></div>';
  html+='<div class="sechead">📋 Kaderplan <small style="color:var(--ink3)">Formation '+LINEUP.formation+' · Stand '+dstr+'</small></div>';
  html+='<div class="card" style="padding:8px 10px;margin-bottom:8px"><div class="kp-head">'
    +'<div class="kp-sum"><span class="kchip" style="background:rgba(47,210,122,.15);color:#5fe09b">'+ok+' besetzt</span>'
    +'<span class="kchip" style="background:rgba(255,179,71,.15);color:#ffb347">'+thin+' ohne Backup</span>'
    +'<span class="kchip" style="background:rgba(255,70,70,.18);color:#ff8a8a">'+open+' offen</span></div>'
    +'<span style="flex:1"></span>'
    +'<label class="kp-noprint" style="display:flex;align-items:center;gap:5px;font-size:12px"><input type="checkbox" id="kpZiel"'+(kpShowZiel?' checked':'')+'> 🎯 Zielbild nächste Saison</label>'
    +'<button class="kbtn kp-noprint" id="kpFill">⚡ Backups &amp; Ziele auto-füllen</button>'
    +'<button class="kbtn kp-noprint" id="kpPrint">🖨️ Als PDF / drucken</button></div>'
    +'<div class="kp-noprint" style="font-size:11px;color:var(--ink3);margin-top:4px">„Stammspieler" + „Backup" = so sieht der Kader jetzt aus · „🎯 Ziel" = Wunsch/Transferziel nächste Saison. Formation &amp; Startelf im Tab ⚽ Aufstellung setzen; Backup/Ziel je Position dort in der Schattenelf editierbar. Positions-Tags (✓/◐/~) zeigen Mehrfachpositionen.</div></div>';
  html+='<div class="kwrap"><table class="kp-table"><thead><tr><th>Pos</th><th>Stammspieler (jetzt)</th><th>Backup (jetzt)</th>'+(kpShowZiel?'<th>🎯 Ziel nächste Saison</th>':'')+'<th>Status</th></tr></thead><tbody>'+body+'</tbody></table></div>'
    +'<div class="kand-sub" style="margin-top:8px">Zahl = MScore (0–100) · Positions-Tags: ✓ Hauptposition · ◐ Nebenposition · ~ möglich · Ziel-Spieler mit Verein.</div>';
  wrap.innerHTML=html; wireKaderplan();
}
function wireKaderplan(){
  const w=document.getElementById('kaderplanWrap'); if(!w)return;
  const z=document.getElementById('kpZiel'); if(z)z.onchange=e=>{kpShowZiel=e.target.checked;renderKaderplan();};
  const f=document.getElementById('kpFill'); if(f)f.onclick=()=>{try{shadowAutoFill();}catch(e){}renderKaderplan();};
  const pr=document.getElementById('kpPrint'); if(pr)pr.onclick=()=>{try{window.print();}catch(e){}};
  w.querySelectorAll('[data-open]').forEach(el=>{el.onclick=()=>{try{startPlayer(el.dataset.open);}catch(e){}};});
}
/* ===== FuPa-MVP (Saison 26/27): team-relativer Leistungswert 0–100 aus der FuPa-Spielerstatistik =====
   Fließt als ±6 %-Modifikator in den MScore (50 % = neutral), siehe scores(). Quelle: CRM[pid].mv/.mvd
   (in der App gepflegt, geräteübergreifend), sonst der Start-Datensatz MVP_SEED (Stand 22.09.2026). */
function _mvpNorm(s){s=(s||'').toLowerCase();s=s.split('ä').join('ae').split('ö').join('oe').split('ü').join('ue').split('ß').join('ss');try{s=s.normalize('NFKD').replace(/[\u0300-\u036f]/g,'');}catch(e){}return s.replace(/[^a-z]/g,'');}
const MVP_SEED={
 'juliusfries':82,'florianseltenreich':78,'simongoderbauer':100,'paulbartmann':76,
 'andrewalter':78,'nicogarotti':78,'svenschill':66,'lukasgoderbauer':70,'juliangoderbauer':71
};
const MVP_SEED_DATE='2026-09-22';
let _mvpSeeded=false, mvpSeedHits=0;
function applyMvpSeed(){ if(_mvpSeeded)return; _mvpSeeded=true; mvpSeedHits=0;
  players.forEach(p=>{ if(!p.own)return; const k=_mvpNorm(p.name); if(MVP_SEED[k]!=null){ p.mvp=MVP_SEED[k]; mvpSeedHits++; } });
}
function mvpOf(p){
  let C=null; try{C=CRM[p.id];}catch(e){C=null;}
  if(C&&typeof C.mv==='number')return {v:C.mv,d:C.mvd||null,src:'app'};
  if(typeof p.mvp==='number')return {v:p.mvp,d:MVP_SEED_DATE,src:'seed'};
  return null;
}
function mvpFactor(v){return 0.94+0.12*(v/100);}

/* ---------- Pflege-Maske (Tab Datenbank): Team wählen → Werte von der FuPa-Spielerstatistik eintragen ---------- */
let mvpTeam=null, mvpDraft={}, mvpDirty=false, mvpOpen=false, mvpMsg='', mvpDate=null, mvpPasteOpen=false, mvpPasteText='';
const MVP_POS_ORDER={TW:0,IV:1,AV:2,ZM:3,OM:4,'Flügel':5,ST:6};
function mvpClubs(){
  const cnt={}; players.forEach(p=>{if(p.isJugend||!p.club)return;cnt[p.club]=(cnt[p.club]||0)+1;});
  const own=[...new Set(players.filter(p=>p.own&&!p.isJugend&&p.club).map(p=>p.club))];
  const rest=Object.keys(cnt).filter(c=>!own.includes(c)).sort((a,b)=>a.localeCompare(b,'de'));
  return {own,rest,cnt};
}
function mvpTeamPlayers(){return players.filter(p=>p.club===mvpTeam&&!p.isJugend).sort((a,b)=>((MVP_POS_ORDER[a.pos]??9)-(MVP_POS_ORDER[b.pos]??9))||(a.name||'').localeCompare(b.name||'','de'));}
function mvpPreviewCell(p,raw){
  const s=scores(p);
  if(p.adjTo!=null)return '<span class="kand-sub">Insider-Rating '+fmt(s.total,1)+' (fix)</span>';
  const v=String(raw==null?'':raw).trim();
  const nt=v===''||isNaN(+v)?s.mvpBase:Math.min(100,s.mvpBase*mvpFactor(clamp(+v,0,100)));
  const d=Math.round((nt-s.total)*10)/10;
  return fmt(s.total,1)+(Math.abs(d)>=0.1?' → <b>'+fmt(nt,1)+'</b> <span class="'+(d>0?'up':'dn')+'">'+(d>0?'+':'')+fmt(d,1)+'</span>':'');
}
function renderMvpCard(force){
  const el=document.getElementById('mvpCard'); if(!el)return;
  if(mvpDirty&&!force)return; /* nicht mitten in der Eingabe neu zeichnen */
  const {own,rest,cnt}=mvpClubs();
  if(!mvpTeam||(!own.includes(mvpTeam)&&!rest.includes(mvpTeam)))mvpTeam=own[0]||rest[0];
  if(!mvpDate)mvpDate=todayISO();
  const team=mvpTeamPlayers();
  const withMvp=players.filter(p=>!p.isJugend&&mvpOf(p)).length;
  const lastD=team.map(p=>{const m=mvpOf(p);return m&&m.d;}).filter(Boolean).sort().pop();
  const opt=c=>'<option value="'+kEsc(c)+'"'+(c===mvpTeam?' selected':'')+'>'+kEsc(c)+' ('+cnt[c]+')</option>';
  const rows=team.map(p=>{
    const m=mvpOf(p), raw=(p.id in mvpDraft)?mvpDraft[p.id]:(m?m.v:'');
    return '<tr><td><b>'+kEsc(p.name)+'</b>'+(p.own?' 🟢':'')+'<div class="kand-sub">'+kEsc(p.pos||'–')+(m?' · jetzt '+m.v+' % ('+kEsc(fmtD(m.d))+')':'')+'</div></td>'
      +'<td><input class="mvin" type="number" min="0" max="100" step="1" inputmode="numeric" data-mv="'+p.id+'" value="'+kEsc(raw)+'" placeholder="–"></td>'
      +'<td class="mvprev" data-mvprev="'+p.id+'">'+mvpPreviewCell(p,raw)+'</td></tr>';
  }).join('');
  el.innerHTML='<details id="mvpDet"'+(mvpOpen?' open':'')+'><summary>📥 FuPa-MVP nach dem Spieltag eintragen <span class="kand-sub" style="font-weight:600">· '+withMvp+' Spieler mit MVP-Wert · fließt mit max. ±6 % ins MScore</span></summary>'
    +'<p class="kand-sub" style="margin:8px 0">So geht\'s: In der FuPa-App das Team öffnen → <b>Spielerstatistik</b> → Spalte <b>MVP</b>. Werte hier eintippen (0–100) und speichern: alle Ratings rechnen sofort neu, auf allen Geräten. Leeres Feld = kein MVP-Wert.</p>'
    +'<div class="kctrl"><label class="kand-sub">Team</label><select id="mvpTeamSel">'+(own.length?'<optgroup label="Eigene Teams">'+own.map(opt).join('')+'</optgroup>':'')+'<optgroup label="Alle Teams">'+rest.map(opt).join('')+'</optgroup></select>'
    +'<label class="kand-sub">Stand</label><input type="date" id="mvpDateIn" value="'+kEsc(mvpDate)+'">'
    +(lastD?'<span class="kand-sub">zuletzt gepflegt: '+kEsc(fmtD(lastD))+'</span>':'')+'</div>'
    +'<details id="mvpPasteDet" style="margin-top:8px"'+(mvpPasteOpen?' open':'')+'><summary class="kand-sub" style="font-size:12.5px">📋 Oder: Text von der FuPa-Seite einfügen und Werte automatisch erkennen</summary>'
    +'<textarea id="mvpPaste" placeholder="Auf fupa.net die Spielerstatistik des Teams markieren, kopieren und hier einfügen…">'+kEsc(mvpPasteText)+'</textarea>'
    +'<div class="kctrl" style="margin-top:6px"><button class="kbtn" id="mvpParseBtn">Werte erkennen</button><span class="kand-sub">Erkannte Werte erscheinen unten zum Prüfen. Gespeichert wird erst mit „Speichern".</span></div></details>'
    +'<div style="overflow-x:auto"><table class="mvtbl"><thead><tr><th>Spieler</th><th>MVP %</th><th>MScore → neu</th></tr></thead><tbody>'+(rows||'<tr><td colspan="3" class="kand-sub">Keine Spieler für dieses Team erfasst.</td></tr>')+'</tbody></table></div>'
    +'<div class="kctrl" style="margin-top:10px"><button class="btn" id="mvpSaveBtn">💾 Speichern &amp; neu bewerten</button>'+(mvpDirty?'<button class="kbtn" id="mvpResetBtn">Verwerfen</button>':'')+'<span class="kand-sub" id="mvpMsgEl" style="color:'+(/^✓/.test(mvpMsg)?'#5fe09b':'var(--ink3)')+'">'+kEsc(mvpMsg)+'</span></div>'
    +'</details>';
  const det=document.getElementById('mvpDet'); det.ontoggle=()=>{mvpOpen=det.open;};
  const pdet=document.getElementById('mvpPasteDet'); pdet.ontoggle=()=>{mvpPasteOpen=pdet.open;};
  document.getElementById('mvpTeamSel').onchange=e=>{ if(mvpDirty&&!confirmDiscard())return renderMvpCard(true); mvpTeam=e.target.value; mvpDraft={}; mvpDirty=false; mvpMsg=''; renderMvpCard(true); };
  document.getElementById('mvpDateIn').onchange=e=>{mvpDate=e.target.value||todayISO();};
  el.querySelectorAll('[data-mv]').forEach(inp=>{inp.oninput=()=>{
    mvpDraft[inp.dataset.mv]=inp.value; mvpDirty=true;
    const p=players.find(x=>x.id===inp.dataset.mv), c=el.querySelector('[data-mvprev="'+inp.dataset.mv+'"]'); if(p&&c)c.innerHTML=mvpPreviewCell(p,inp.value);
  };});
  document.getElementById('mvpPaste').oninput=e=>{mvpPasteText=e.target.value;};
  document.getElementById('mvpParseBtn').onclick=()=>{ const n=mvpParse(document.getElementById('mvpPaste').value); mvpMsg=n?(n+' Wert'+(n>1?'e':'')+' erkannt, bitte kurz prüfen und speichern.'):'Keine Werte erkannt, bitte Namen/Zahlen prüfen oder direkt eintippen.'; mvpPasteOpen=!n; if(n)mvpPasteText=''; renderMvpCard(true); };
  document.getElementById('mvpSaveBtn').onclick=mvpSave;
  const rb=document.getElementById('mvpResetBtn'); if(rb)rb.onclick=()=>{mvpDraft={};mvpDirty=false;mvpMsg='';renderMvpCard(true);};
}
function confirmDiscard(){try{return window.confirm('Nicht gespeicherte MVP-Eingaben verwerfen?');}catch(e){return true;}}
function mvpParse(text){
  /* Erkennt je Spieler den MVP-Wert in kopiertem FuPa-Text: vollständiger Name (mind. Vor- + Nachname),
     danach die erste Zahl 0–100 · "2/2" (Elfmeter) wird übersprungen, "2." (nächster Platz) oder "–" beendet die Zeile. */
  const toks=String(text||'').split(/\s+/).filter(Boolean), nt=toks.map(_mvpNorm); let found=0;
  const team=mvpTeamPlayers(), cnt={};
  team.forEach(p=>{const f=_mvpNorm(p.name);cnt[f]=(cnt[f]||0)+1;});
  team.forEach(p=>{
    const parts=String(p.name||'').split(/\s+/).map(_mvpNorm).filter(Boolean);
    if(parts.length<2||cnt[_mvpNorm(p.name)]>1)return;          /* Einzelnamen / doppelte Namen: lieber von Hand */
    for(let i=0;i<=nt.length-parts.length;i++){
      let ok=true; for(let j=0;j<parts.length;j++){ if(nt[i+j]!==parts[j]){ok=false;break;} } if(!ok)continue;
      let val=null;
      for(let k=i+parts.length;k<Math.min(toks.length,i+parts.length+8);k++){
        const raw=toks[k];
        if(/^\d+\.$/.test(raw)||/^[–—-]$/.test(raw))break;       /* nächster Platz oder "kein Wert" */
        if(/[\/:]/.test(raw))continue;                             /* 2/2, 90:00 */
        const m=raw.replace(/%$/,'').match(/^(\d{1,3})(?:[.,](\d+))?$/);
        if(m){ const v=Math.round(parseFloat(m[1]+(m[2]?'.'+m[2]:''))); if(v>=0&&v<=100)val=v; break; }
        if(/[a-zäöüß]{2,}/i.test(raw))break;                        /* Text → nächster Name */
      }
      if(val!=null){ mvpDraft[p.id]=String(val); found++; break; }   /* sonst nächstes Vorkommen prüfen */
    }
  });
  if(found)mvpDirty=true;
  return found;
}
function mvpSave(){
  const date=mvpDate||todayISO(); let n=0;
  for(const id in mvpDraft){
    const p=players.find(x=>x.id===id); if(!p)continue;
    const raw=String(mvpDraft[id]).trim(), cur=mvpOf(p);
    if(raw===''){ if(cur&&cur.src==='app'){crmSet(id,{mv:undefined,mvd:undefined});n++;} continue; }
    const v=clamp(Math.round(+raw),0,100); if(isNaN(v))continue;
    if(cur&&cur.src==='app'&&cur.v===v&&cur.d===date)continue;
    crmSet(id,{mv:v,mvd:date}); n++;
  }
  mvpDraft={}; mvpDirty=false;
  mvpMsg=n?('✓ '+n+' MVP-Wert'+(n>1?'e':'')+' gespeichert: alle Ratings sind neu berechnet.'):'Keine Änderungen zu speichern.';
  renderAll(); renderMvpCard(true);
}

function renderAll(){try{applyMvpSeed();}catch(e){}renderHome();renderList();renderGems();renderJugend();renderShortlist();renderDB();fillCompareSelects();updateCompare();try{renderLineup();}catch(e){}try{renderKandidaten();}catch(e){}try{renderKaderplan();}catch(e){}try{renderMvpCard();}catch(e){}}

/* ================= MODAL ================= */
function nrm(s){return (s||'').toLowerCase().replace(/ä/g,'ae').replace(/ö/g,'oe').replace(/ü/g,'ue').replace(/ß/g,'ss').replace(/\s+/g,' ').trim();}
function wscore(p){
  if(p.own)return null;
  const f=[]; let w=50;
  const add=(v,t)=>{w+=v;f.push([v,t]);};
  if(p.exSvbc)add(15,'Ex-SV/BSC: Rückkehr hat Anknüpfungspunkte');
  else if(crmOf(p).x)add(15,'Ex-SV/BSC (von euch markiert): Rückkehr hat Anknüpfungspunkte');
  if(p.isJugend)add(15,'Jugendspieler: Sprung in den Seniorenbereich steht ohnehin an');
  if(p.zweit)add(14,'Spielt in einer Zweitvertretung. Bei uns winkt 1.-Mannschafts-Fußball');
  const lowPlay=(p.min&&p.teamSp&&p.min/(p.teamSp*90)<0.45)||(!p.min&&p.einsaetze&&p.teamSp&&p.einsaetze/p.teamSp<0.6);
  if(p.min&&p.teamSp&&p.min/(p.teamSp*90)<0.45)add(12,'Wenig Spielzeit ('+p.min.toLocaleString('de-DE')+' Min.): sitzt offenbar oft draußen');
  else if(p.einsaetze&&p.teamSp&&p.einsaetze/p.teamSp<0.6)add(7,'Nur '+p.einsaetze+' von '+p.teamSp+' Teamspielen absolviert');
  if(p.liga==='KOL'){
    if(lowPlay)add(-5,'Kickt eine Liga höher (KOL), dort aber ohne Stammplatz. Schritt runter für Spielzeit ist ein Klassiker');
    else add(-18,'Kickt eine Liga über uns (KOL): müsste sportlich absteigen');
  }
  if(p.liga==='GL'){
    if(lowPlay)add(-8,'Kickt zwei Ligen höher (Gruppenliga), dort aber meist draußen. Für garantierte Spielzeit ansprechbar');
    else add(-26,'Gruppenliga-Stammspieler (2 Ligen über uns). Wechsel in die A-Klasse sehr unwahrscheinlich');
  }
  if(p.liga==='B')add(8,'Kreisliga B: Schritt in die A-Klasse wäre attraktiv');
  if(p.liga==='C')add(11,'Kreisliga C: deutlicher sportlicher Aufstieg möglich');
  if(p.liga==='D'&&!p.isJugend)add(13,'Kreisliga D: A-Klasse wäre ein großer Schritt nach oben');
  if(p.km!=null){
    if(p.km<=5)add(10,'Nur '+p.km+' km entfernt: quasi Nachbarschaft');
    else if(p.km<=10)add(6,p.km+' km: gut erreichbar');
    else if(p.km<=15)add(2,p.km+' km: machbar');
    else if(p.km<=25)add(-6,p.km+' km, schon ein Stück Fahrt');
    else add(-14,p.km+' km: unrealistische Distanz für die A-Klasse');
  }
  if(p.rank!=null&&p.teamCount>1){
    const q=(p.rank-1)/(p.teamCount-1);
    if(q>=0.7)add(8,'Sein Team steckt im Tabellenkeller (Platz '+p.rank+'): Frust möglich');
    else if(q<=0.2)add(-10,'Sein Team spielt oben mit (Platz '+p.rank+'): wenig Wechselgrund');
  }
  if(p.kanone)add(-12,'Torschützenkönig: steht auf jeder Wunschliste, schwer zu bekommen');
  const sh=(p.tT&&p.tT>0)?p.tore/p.tT:0;
  if(sh>=0.35&&!p.zweit)add(-7,'Trägt '+Math.round(sh*100)+' % der Teamtore: sein Verein wird um ihn kämpfen');
  if(p.alter!=null&&p.alter<=19&&!p.isJugend)add(5,'U20: sucht den nächsten Entwicklungsschritt');
  if(p.pressStats&&p.pressStats.wechsel)add(7,'Wechsel-Historie in der Presse. Grundsätzlich mobil');
  if(p.status&&/verletzt/i.test(p.status))add(-8,'Aktuell verletzt gemeldet');
  const _sc=scores(p);
  if(_sc.mvp!=null){ if(_sc.mvp>=90)add(-6,'FuPa-MVP '+_sc.mvp+' %: Schlüsselspieler seines Teams, der Verein wird ihn halten wollen'); else if(_sc.mvp<=55)add(5,'FuPa-MVP nur '+_sc.mvp+' %: eher Randfigur, bei uns winkt mehr Verantwortung'); }
  w=clamp(Math.round(w),3,97);
  const k=Math.round((_sc.total*0.55+w*0.45)*10)/10;
  f.sort((a,b)=>Math.abs(b[0])-Math.abs(a[0]));
  return {w,k,f};
}
function wscoreSafe(p){try{return p.own?null:wscore(p);}catch(e){return null;}}
function wreason(W,n){return W.f.slice(0,n||2).map(x=>x[1]).join(' · ');}
let radarChart=null;
let NAV=[], CURVIEW=null;
function closeOverlay(){document.getElementById('overlay').classList.remove('open');NAV=[];CURVIEW=null;}
function renderView(d){ if(d.t==='player'){CURVIEW=d;openModal(d.id);} else if(d.t==='rank'){openRanking(d.cfg);} }
function nav(d){ if(CURVIEW)NAV.push(CURVIEW); renderView(d); }
function navBack(){ const d=NAV.pop(); if(!d)return closeOverlay(); renderView(d); }
function startPlayer(id){ NAV=[]; CURVIEW=null; renderView({t:'player',id}); }
function avaMini(r){ const p=players.find(x=>x.id===r.id); const src=p&&(p.photo||p.photoUrl); return `<div class="ava l-${p?p.liga:'A'}" style="width:30px;height:30px;font-size:11px;border-radius:9px">${src?`<img src="${src}" alt="" onerror="this.remove()">`:(p?initials(p.name):'?')}</div>`; }
function buildRanking(liga,isJugend,metric,hid){
  const pool=players.filter(x=>x.liga===liga && x.isJugend===isJugend);
  const gv=(x)=> metric==='score'?scores(x).total : metric==='gpg'?scores(x).gpg : x.tore;
  const arr=[...pool].sort((a,b)=>gv(b)-gv(a));
  const fv=(x)=> metric==='score'?fmt(scores(x).total,1) : metric==='gpg'?fmt(scores(x).gpg)+'/Sp.' : x.tore+' Tore';
  const ligaName=isJugend?'Jugend':LIGA_NAME[liga];
  const tmap={tore:'⚽ Torjäger',score:'⭐ MScore-Rangliste',gpg:'📊 Tore pro Spiel'};
  return {liga, isJugend, metric, hid,
    title:`${tmap[metric]} · ${ligaName}`,
    subtitle:`${arr.length} erfasste Spieler`,
    tabs:[['tore','Tore'],['score','MScore'],['gpg','Tore/Sp.']],
    rows:arr.map(x=>({id:x.id,name:x.name,club:x.club,val:fv(x),me:x.id===hid})),
    note:'Zeile antippen → Profil. Oben umschalten: Tore · MScore · Quote.'};
}
function buildClubView(clubName,hid){
  const c=(typeof clubFor==='function')?clubFor(clubName):null;
  const pool=players.filter(x=>x.club===clubName).sort((a,b)=>scores(b).total-scores(a).total);
  let hist='';
  if(c){ hist=[['s2526','25/26'],['s2425','24/25'],['s2324','23/24'],['s2223','22/23']].filter(k=>c[k[0]]).map(k=>`${k[1]}: ${(LIGA_LONG[c[k[0]].liga]||c[k[0]].liga)} Platz ${c[k[0]].platz}`).join(' · '); }
  return {liga:null,isJugend:false,metric:'score',hid,
    title:`🏟 ${clubName}`,
    subtitle: hist||'Vereins-Historie nicht öffentlich verfügbar',
    tabs:null,
    rows:pool.map(x=>({id:x.id,name:x.name,club:LIGA_NAME[x.liga]||'',val:fmt(scores(x).total,1),me:x.id===hid})),
    note:'Erfasste Spieler dieses Vereins nach MScore. Zeile antippen → Profil.'};
}
function openRanking(cfg){
  CURVIEW={t:'rank',cfg};
  const back = NAV.length?`<button class="close" id="mback" style="right:56px" title="Zurück">‹</button>`:'';
  const tabs = cfg.tabs?`<div style="display:flex;gap:6px;flex-wrap:wrap;margin:10px 0 2px">${cfg.tabs.map(t=>`<button class="rtab ${t[0]===cfg.metric?'on':''}" data-m="${t[0]}">${t[1]}</button>`).join('')}</div>`:'';
  document.getElementById('modal').innerHTML=`${back}<button class="close" id="mclose">✕</button>
    <h2 style="font-size:19px">${cfg.title}</h2>
    <div class="msub">${cfg.subtitle||''}</div>
    ${tabs}
    <div style="margin-top:10px;max-height:62vh;overflow:auto">
      ${cfg.rows.map((r,i)=>`<div class="rankrow ${r.me?'me':''}" ${r.id?`data-goid="${r.id}"`:''}>
        <span class="rk">${i+1}</span>${r.id?avaMini(r):'<span></span>'}
        <span class="rn">${r.name}${r.me?' <b style="color:var(--accent)">· hier</b>':''}<br><i>${r.club||''}</i></span>
        <span class="rv">${r.val}</span></div>`).join('')}
    </div>
    ${cfg.note?`<p class="note">${cfg.note}</p>`:''}`;
  document.getElementById('overlay').classList.add('open');
  document.getElementById('mclose').onclick=closeOverlay;
  {const b=document.getElementById('mback'); if(b)b.onclick=navBack;}
  document.querySelectorAll('#modal .rtab').forEach(bt=>bt.onclick=()=>openRanking(buildRanking(cfg.liga,cfg.isJugend,bt.dataset.m,cfg.hid)));
  document.querySelectorAll('#modal [data-goid]').forEach(el=>el.onclick=()=>nav({t:'player',id:el.dataset.goid}));
}
function openLegend(){
  const ring=(v)=>`<span style="display:inline-grid;place-items:center;width:40px;height:40px;border-radius:50%;background:conic-gradient(${tierColor(v)} ${v}%, rgba(255,255,255,.09) 0);vertical-align:middle;margin-right:8px"><span style="width:32px;height:32px;border-radius:50%;background:var(--card);display:grid;place-items:center;font-size:11px;font-weight:900">${v}</span></span>`;
  document.getElementById('modal').innerHTML=`
    <button class="close" id="mclose">✕</button>
    <h2>ⓘ Legende &amp; Erklärungen</h2>
    <div class="seas"><h4>Score-Farben (MScore 0–100)</h4>
      <div class="srow"><span class="sy">${ring(85)}</span><span class="sm"><b style="color:#b39df7">Lila = Supergut</b> · 72–100 · sofort anschauen, Top-Priorität</span><span></span></div>
      <div class="srow"><span class="sy">${ring(65)}</span><span class="sm"><b style="color:#2fd27a">Grün = Gut</b> · 60–71 · starker Kandidat</span><span></span></div>
      <div class="srow"><span class="sy">${ring(53)}</span><span class="sm"><b style="color:#ffd60a">Gelb = Mittel</b> · 48–59 · beobachten</span><span></span></div>
      <div class="srow"><span class="sy">${ring(40)}</span><span class="sm"><b style="color:#ff6b6b">Rot = (noch) schwach</b> · unter 48 · aktuell keine Verstärkung</span><span></span></div>
    </div>
    <div class="seas"><h4>💎 Rohdiamant: wer bekommt den Diamanten?</h4>
      <div class="srow"><span class="sy">💎</span><span class="sm"><b>Zweite Reihe:</b> II./III.-Team in C/D-Klasse + mind. 0,65 Tore/Spiel: kickt nur so tief, weil das Erstteam höher spielt</span><span></span></div>
      <div class="srow"><span class="sy">💎</span><span class="sm"><b>Einsamer Torjäger:</b> mind. 35 % aller Teamtore + Team in unterer Tabellenhälfte</span><span></span></div>
      <div class="srow"><span class="sy">💎</span><span class="sm"><b>U19-Sprung:</b> Jugendspieler mit mind. 0,8 Toren/Spiel</span><span></span></div>
      <div class="srow"><span class="sy">💎</span><span class="sm"><b>Formexplosion:</b> ligagewichtete Quote mind. +30 % vs. Vorsaison</span><span></span></div>
      <div class="srow"><span class="sy">💎</span><span class="sm"><b>Rückholer:</b> Ex-SV/BSC-Spieler, der woanders höherklassig trifft</span><span></span></div>
    </div>
    <div class="seas"><h4>Badges &amp; Symbole</h4>
      <div class="srow"><span class="sy"><span class="badge b-KOL">KOL</span></span><span class="sm">Liga des Spielers (KOL = Kreisoberliga, eine Liga über euch)</span><span></span></div>
      <div class="srow"><span class="sy"><span class="badge b-own">SV/BSC</span></span><span class="sm">Eigener Spieler / eigenes Talent</span><span></span></div>
      <div class="srow"><span class="sy"><span class="badge b-ex">Ex-SV/BSC</span></span><span class="sm">Früherer SV/BSC-Spieler: Rückhol-Kandidat</span><span></span></div>
      <div class="srow"><span class="sy"><span class="badge b-kan">Kanone</span></span><span class="sm">Torschützenkönig seiner Liga 25/26</span><span></span></div>
      <div class="srow"><span class="sy"><span class="badge b-risk">⚠</span></span><span class="sm">Risiko laut Presse (z. B. Spielertrainer, Karriereende): im Profil nachlesen</span><span></span></div>
      <div class="srow"><span class="sy"><span class="badge b-zweit">II/III</span></span><span class="sm">Spielt in einer Zweit-/Drittmannschaft (evtl. ans Erstteam gebunden)</span><span></span></div>
      <div class="srow"><span class="sy">📰</span><span class="sm">Presse-Dossier im Profil vorhanden</span><span></span></div>
      <div class="srow"><span class="sy">📞💚🚫⏰</span><span class="sm"><b>Scouting-Status</b> (im Profil setzen): kontaktiert · attraktiv · kein Interesse (wird nicht mehr vorgeschlagen) · später mit Wiedervorlage-Datum: synchronisiert über alle Geräte</span><span></span></div>
      <div class="srow"><span class="sy">↩️</span><span class="sm"><b>Ex-SV/BSC-Markierung:</b> „hat früher bei uns gespielt" · gibt +15 auf den Wechsel-Index (Rückkehr-Bonus)</span><span></span></div>
      <div class="srow"><span class="sy">▲ ≈ ▼</span><span class="sm">Formtrend vs. Vorsaison (ligagewichtet, steigend/stabil/fallend)</span><span></span></div>
      <div class="srow"><span class="sy">~</span><span class="sm">ca.-Wert, aus datierter Quelle hochgerechnet (Beleg im Profil)</span><span></span></div>
      <div class="srow"><span class="sy">📰</span><span class="sm"><b>Presse-Index (0–100):</b> aus 194 analysierten Regionalartikeln (WNOZ, fussball.de, Vereinsseiten). Tore/Vorlagen/Paraden/Lob im Artikel = Pluspunkte, Kritik/Verletzung = Minus, neuere Artikel zählen mehr. Fairness-Bremse: Wenige Nennungen bewegen den Wert kaum (kein Spieler wird wegen 1 Artikel hochgejubelt). Ohne Nennungen = neutral 50. Alle Belege im Profil verlinkt.</span><span></span></div>
      <div class="srow"><span class="sy">KLA</span><span class="sm">„KLA-Prognose“: erwartete Tore über 30 Spiele in der Kreisliga A</span><span></span></div>
    </div>
    <p class="note">Tipp: Jeden farbigen Score-Ring antippen öffnet diese Legende. Das Rechenmodell im Detail steht im Tab „Modell".</p>`;
  document.getElementById('overlay').classList.add('open');
  document.getElementById('mclose').onclick=()=>document.getElementById('overlay').classList.remove('open');
}
function openModal(id){
  const p=players.find(x=>x.id===id);if(!p)return;
  const s=scores(p);
  const WV=p.own?null:wscore(p);
  const g=gemsOf(p);
  const prevLine=p.prev?`<div><span>Vorsaison 24/25</span><b>${p.prevBelegt?'min. ':''}${p.prev.tore} T · ${LIGA_NAME[ligaBase(p.prev.liga)]||p.prev.liga} · ${p.prev.verein}${p.prevBelegt?' <i style="color:var(--ink3);font-weight:600">(belegt, Vereinsheft)</i>':''}</b></div>`:'';
  $('#modal').innerHTML=`
    ${NAV.length?`<button class="close" id="mback" style="right:56px" title="Zurück">‹</button>`:''}
    <button class="close" id="mclose">✕</button>
    <div class="mhead">
      <div class="ava l-${p.liga} ${p.photo?'':'avaCam'}" id="mAva" title="Foto hinzufügen" style="width:56px;height:56px;font-size:19px;border-radius:16px">${(p.photo||p.photoUrl)?`<img src="${p.photo||p.photoUrl}" alt="" onerror="this.remove()">`:initials(p.name)}</div>
      <div>
        <h2>${p.name}</h2>
        <div class="msub">${p.club} · ${p.isJugend?p.staffel:LIGA_NAME[p.liga]+(p.rank!=null?' · Platz '+p.rank+'/'+p.teamCount:'')} · ${p.km} km</div>
        <div style="margin-top:5px;display:flex;gap:5px;flex-wrap:wrap">${badges(p)}</div>
      </div>
    </div>
    ${p.photoUrl&&!p.photo?`<div class="note" style="margin-top:6px">Foto & Profildaten: öffentliches fussball.de-Spielerprofil</div>`:''}
    ${p.risiko?`<div class="riskbox">⚠ ${p.risiko}</div>`:''}
    ${p.own?'':(()=>{const C=crmOf(p);return `
    <div class="crmbar" id="crmbar">
      <button class="crmb ${C.c?'on-c':''}" data-crm="c">📞 ${C.c?'Kontaktiert ✓':'Kontaktiert?'}</button>
      <button class="crmb ${C.s==='att'?'on-att':''}" data-crm="att">💚 Attraktiv</button>
      <button class="crmb ${C.s==='no'?'on-no':''}" data-crm="no">🚫 Kein Interesse</button>
      <button class="crmb ${C.s==='lat'?'on-lat':''}" data-crm="lat">⏰ Später${C.s==='lat'&&C.u?' · '+fmtD(C.u):''}</button>
      ${p.exSvbc?'':`<button class="crmb ${C.x?'on-x':''}" data-crm="x">↩️ Hat früher bei uns gespielt</button>`}
    </div>
    ${C.s==='lat'?`<div class="latopts" id="latopts"><span style="font-size:12px;color:var(--ink3);font-weight:800">Wiedervorlage:</span>
      <button class="crmb" data-lat="w">Winterpause (Jan. 27)</button>
      <button class="crmb" data-lat="s">Sommer 27 (nächste Saison)</button>
      <button class="crmb" data-lat="2">Sommer 28 (in 2 Jahren)</button>
      <input type="date" id="latdate" value="${kEsc(C.u||'')}" title="individuelles Datum"></div>
      <p class="note" style="margin:2px 0 0">Bis dahin taucht er in keinen Vorschlägen auf, am Stichtag ploppt er auf der Startseite als Wiedervorlage wieder hoch.</p>`:''}
    ${C.s==='no'?`<p class="note" style="margin:2px 0 0">Ausgeblendet: taucht in keinen Vorschlägen mehr auf (Datenbank &amp; Suche zeigen ihn weiter, Startseite listet ihn unter „Ausgeblendet").</p>`:''}
    ${C.n?`<div class="crmnote">📝 ${kEsc(C.n)}</div>`:''}`;})()}
    ${p.info?`<div class="infobox">💡 ${p.info}</div>`:''}
    ${p.adjWhy?`<div class="infobox" style="border-color:rgba(77,163,255,.4)">🎯 ${p.adjWhy}<br><b>Rating manuell auf ${p.adjTo} gesetzt</b>${s.adjBase!=null?` <i style="color:var(--ink3)">(reines Daten-Modell: ${s.adjBase})</i>`:``}</div>`:''}
    ${g.length?`<div class="gembox">${g.map(x=>`💎 <b>${x.k}</b>: ${x.t}`).join('<br>')}</div>`:''}
    <div class="mgrid">
      <div class="radarbox"><canvas id="pradar" height="240"></canvas></div>
      <div class="statlist">
        <div><span>MScore</span><b>${fmt(s.total,1)} / 100</b></div>
        <div><span>Tore 25/26</span><b>${p.toreBelegt?('min. '+p.tore+' (belegt)'):p.tore}</b></div>
        <div><span>Tore/Spiel${p.einsaetze?'':' (Team-Sp.)'}</span><b>${fmt(s.gpg)}</b></div>
        ${s.shareRaw!=null?`<div><span>Anteil Teamtore</span><b>${Math.round(s.shareRaw*100)} %</b></div>`:''}
        ${p.min?`<div><span>Minuten 25/26</span><b>${p.min.toLocaleString('de-DE')} (${p.einsaetze||'–'} Einsätze)</b></div>`:''}
        ${p.kaderDoc?`<div><span>Startelf 25/26 (dok.)</span><b>${p.kaderStarts} von ${p.kaderDoc} Spielen</b></div>`:''}
        ${p.starts2425!=null?`<div><span>Startelf 24/25 (dok.)</span><b>${p.starts2425} von ${p.docPrev||8} Spielen</b></div>`:''}
        ${p.sds?`<div><span>Elf der Woche (FuPa)</span><b>${p.sds}× nominiert</b></div>`:''}
        ${s.mvp!=null?`<div><span>FuPa-MVP 26/27</span><b>${s.mvp} % <i style="color:var(--ink3);font-weight:600">(team-relativ${s.mvpD?' · Stand '+fmtD(s.mvpD):''})</i></b></div>`:''}
        ${prevLine}
        <div><span>Formtrend</span><b>${s.tratio!=null?(s.tratio>=1.15?'▲ steigend':s.tratio<=0.85?'▼ fallend':'≈ stabil'):'–'}</b></div>
        <div><span>Liga-Gewicht</span><b>× ${wOf(p).toFixed(2)}</b></div>
        <div><span>Geburtsdatum</span><b>${dash(p.geb)}</b></div>
        <div><span>Alter</span><b>${p.alter!=null?(p.alter+(p.alterCa?' (ca.)':'')):'–'}</b></div>
        <div><span>Position</span><b>${p.pos||'–'}${p.pos2&&p.pos2.length?` <i style="color:var(--ink3);font-weight:600">· Neben: ${p.pos2.join(', ')}</i>`:``}</b></div>
        <div><span>Starker Fuß</span><b>${dash(p.fuss)}</b></div>
        <div><span>Größe</span><b>${dash(p.groesse,' cm')}</b></div>
        <div><span>Gewicht</span><b>${dash(p.gewicht,' kg')}</b></div>
        <div><span>Status</span><b>${p.status||'Neu'}</b></div>
        ${p.fdeUrl?`<div><span>Offizielles Profil</span><b><a href="${p.fdeUrl}" target="_blank" rel="noopener">fussball.de ↗</a></b></div>`:''}
      </div>
    </div>
    ${s.defMode?`<div class="proj">🛡 Defensiv-Profil: Bewertung über <b>Team-Gegentore</b>${s.gaTxt?` (${s.gaTxt})`:``} + Presse${p.pos===`AV`?` + Vorlagen (wo belegt)`:``}${p.tore>0?` + <b>Torgefahr-Bonus</b> (${p.toreBelegt?`min. `:``}${p.tore} Tore)`:``}. Individuelle Defensivdaten sind für die Kreisligen öffentlich nicht verfügbar.</div>`:`<div class="proj">📈 <b>${s.proj} Tore</b> · erwartete Ausbeute über 30 Spiele in der <b>Kreisliga A</b></div>`}
    <div class="d2col">
    <div class="seas"><h4>Saison-Record (Spieler + Vereins-Kontext)</h4>
      ${seasonsOf(p).map(x=>{
        if(x.type==='player')return `<div class="srow"><span class="sy">${x.y}</span><span class="sm">${x.liga} · ${x.verein} · <b>${x.tore}</b> Tore in ${x.sp} Sp. (<b>${fmt(x.tore/Math.max(1,x.sp))}</b>/Sp.)${x.extra||''}</span><span class="sbar"><i style="width:${Math.min(100,Math.round(x.tore/Math.max(1,x.sp)*50))}%"></i></span></div>`;
        if(x.type==='team')return `<div class="srow"><span class="sy">${x.y}</span><span class="sm">🏟 ${x.club}: ${LIGA_LONG[x.d.liga]||x.d.liga} · Platz <b>${x.d.platz}</b> · ${x.d.tore} Teamtore · ${x.d.punkte} Pkt. <i style="color:var(--ink3)">(${x.note})</i></span><span></span></div>`;
        return `<div class="srow nodata"><span class="sy">${x.y}</span><span class="sm">– ${x.note}</span><span></span></div>`;
      }).join('')}
    </div>
    <div>
    <div class="seas"><h4>MScore-Zerlegung (${fmt(s.total,1)} gesamt)</h4>
      ${(s.defMode?[['Defensivstärke',s.prod,W.prod],['Dominanz/Def.',s.share,W.share],['Kontext',s.ctx,W.ctx],['Potenzial',s.pot,W.pot],['GT-Trend',s.trend,W.trend],['Presse',s.presse,W.presse],['Scout-Note',s.scout,W.scout]]:[['Produktion',s.prod,W.prod],['Dominanz',s.share,W.share],['Kontext',s.ctx,W.ctx],['Potenzial',s.pot,W.pot],['Formtrend',s.trend,W.trend],['Presse',s.presse,W.presse],['Scout-Note',s.scout,W.scout]]).map(([l,v,w])=>`
        <div class="srow"><span class="sy" style="font-size:11px">${l}</span><span class="sbar" style="width:100%;max-width:none"><i style="width:${v}%;background:${tierColor(v)}"></i></span><b style="font-variant-numeric:tabular-nums">${v} <i style="color:var(--ink3);font-style:normal;font-weight:600">· ${w}%</i></b></div>`).join('')}
      ${s.adjD?`<div class="srow"><span class="sy" style="font-size:11px">🎯 Insider</span><span class="sbar" style="width:100%;max-width:none"><i style="width:${Math.min(100,Math.abs(s.adjD)*4)}%;background:#4da3ff"></i></span><b>${s.adjD>0?'+':''}${s.adjD}</b></div>`:''}
      ${s.sdsB?`<div class="srow"><span class="sy" style="font-size:11px">🏅 Elf d. Woche</span><span class="sbar" style="width:100%;max-width:none"><i style="width:${s.sdsB*10}%;background:#b39df7"></i></span><b>+${s.sdsB}</b></div>`:''}
      ${s.mvpAdj?`<div class="srow"><span class="sy" style="font-size:11px">🔵 FuPa-MVP ${s.mvp}%</span><span class="sbar" style="width:100%;max-width:none"><i style="width:${Math.min(100,Math.abs(s.mvpAdj)*8)}%;background:#2fd27a"></i></span><b>${s.mvpAdj>0?'+':''}${s.mvpAdj}</b></div>`:''}
    </div>
    <div class="seas"><h4>Einordnung: antippen ›</h4>
      ${(!s.defMode||p.tore>0)?`<div class="srow clk" data-rank="tore"><span class="sy">🏅</span><span class="sm">Torjäger-Rang: <b>#${(()=>{const pool=players.filter(x=>x.liga===p.liga&&x.isJugend===p.isJugend).sort((a,b)=>b.tore-a.tore);return pool.findIndex(x=>x.id===p.id)+1;})()}</b> von ${players.filter(x=>x.liga===p.liga&&x.isJugend===p.isJugend).length} erfassten Spielern (${p.isJugend?'Jugend':LIGA_NAME[p.liga]})</span><span></span></div>`:``}
      ${(!s.defMode||p.tore>0)?`<div class="srow clk" data-rank="gpg"><span class="sy">📊</span><span class="sm">Tore/Spiel: besser als <b>${(()=>{const pool=players.filter(x=>x.liga===p.liga&&x.isJugend===p.isJugend);const me=s.gpg;return Math.round(pool.filter(x=>scores(x).gpg<me).length/Math.max(1,pool.length)*100);})()} %</b> der Liga-Konkurrenz</span></div>`:``}
      <div class="srow clk" data-rank="score"><span class="sy">⭐</span><span class="sm">MScore-Rang: <b>#${(()=>{const pool=players.filter(x=>x.liga===p.liga&&x.isJugend===p.isJugend).sort((a,b)=>scores(b).total-scores(a).total);return pool.findIndex(x=>x.id===p.id)+1;})()}</b> von ${players.filter(x=>x.liga===p.liga&&x.isJugend===p.isJugend).length}</span></div>
      <div class="srow clk" data-clubview="1"><span class="sy">🏟</span><span class="sm">Kader &amp; Vereins-Historie: <b>${p.club}</b></span></div>
    </div>
    ${WV?`<div class="seas"><h4>🕵️ Digital-Scout: Wechsel-Index <b style="color:${tierColor(WV.w)}">${WV.w}</b> · Transfer-Chance <b style="color:${tierColor(WV.k)}">${WV.k}</b></h4>
      ${WV.f.map(x=>`<div class="srow"><span class="sy">${x[0]>0?'🟢':'🔴'}</span><span class="sm">${x[1]}</span><b style="color:${x[0]>0?'#5fe09b':'#ff8a8a'};font-variant-numeric:tabular-nums">${x[0]>0?'+':''}${x[0]}</b></div>`).join('')}
      ${WV.f.length?'':'<div class="srow"><span class="sy">·</span><span class="sm">Keine besonderen Signale: neutraler Basiswert 50</span><span></span></div>'}
      <p class="note">Start bei 50, öffentliche Signale werden addiert/abgezogen. <b>Transfer-Chance</b> = 55 % MScore + 45 % Wechsel-Index, die Kennzahl für „stark UND realistisch holbar“.</p></div>`:''}
    ${p.pressNews&&p.pressNews.length?`<div class="pressbox"><h4>📰 Presse-Engine · Index ${p.pressIdx} · ${p.pressNews.length} Nennungen</h4>
      <div style="display:flex;gap:6px;flex-wrap:wrap;margin-bottom:9px">${Object.entries(p.pressStats||{}).map(([t,n])=>`<span class="badge b-zweit" style="text-transform:none">${({tor:'⚽',vorlage:'🅰️',parade:'🧤',lob:'👍',kritik:'⚠️',verletzung:'🚑',wechsel:'🔁',neutral:'📄'})[t]||'📄'} ${t}: ${n}</span>`).join('')}</div>
      ${p.pressNews.map(m=>`<div class="pressitem" style="padding-left:20px"><b>${({tor:'⚽',vorlage:'🅰️',parade:'🧤',lob:'👍',kritik:'⚠️',verletzung:'🚑',wechsel:'🔁',neutral:'📄'})[m.typ]||'📄'} ${m.h||'(ohne Überschrift)'}</b>${m.d?` <i style="color:var(--ink3);font-style:normal">· ${m.d}</i>`:''}<br>${m.x||''} <a href="${m.u}" target="_blank" rel="noopener">Artikel ↗</a></div>`).join('')}
    </div>`:''}
    ${p.quellen&&p.quellen.length?`<div class="pressbox"><h4>📚 Kader-Belege (Vereinsheft)</h4>${p.quellen.map(q=>`<div class="pressitem">${q.t} <a href="${q.u}" target="_blank" rel="noopener">PDF ↗</a></div>`).join('')}${p.kaderDoc?`<div class="pressitem" style="color:var(--ink2)">Startelf-Zählung basiert auf ${p.kaderDoc} im Vereinsheft dokumentierten Spielen (Sep./Okt. 2025 + März/April 2026), nicht auf allen 28 Saisonspielen. Belegte Tore sind Untergrenzen.</div>`:''}</div>`:''}
    ${p.press&&p.press.length?`<div class="pressbox"><h4>Presse &amp; Recherche</h4>${p.press.map(x=>`<div class="pressitem">${x.t} <a href="${x.u}" target="_blank" rel="noopener">Quelle ↗</a></div>`).join('')}</div>`:''}
    </div></div>
    <div class="editsec">
      <h4>Scouting-Daten pflegen</h4>
      <div class="editgrid">
        <div class="field"><label>Geburtsdatum</label><input type="date" id="e_geb" value="${p.geb??''}"></div>
        <div class="field"><label>Alter (falls Datum unbekannt)</label><input type="number" id="e_alter" min="14" max="45" value="${p.alter??''}"></div>
        <div class="field"><label>Position</label><select id="e_pos">${Object.keys(POS_W).map(x=>`<option ${x===p.pos?'selected':''}>${x}</option>`).join('')}</select></div>
        <div class="field"><label>Status</label><select id="e_status">${STATUS_LIST.map(x=>`<option ${x===(p.status||'Neu')?'selected':''}>${x}</option>`).join('')}</select></div>
        <div class="field"><label>Einsätze 25/26</label><input type="number" id="e_eins" min="1" max="40" value="${p.einsaetze??''}" placeholder="${p.teamSp} (Team)"></div>
        <div class="field"><label>Assists</label><input type="number" id="e_ass" min="0" value="${p.assists??''}"></div>
        <div class="field"><label>Starker Fuß</label><select id="e_fuss"><option value="">–</option>${['Rechts','Links','Beidfüßig'].map(x=>`<option ${x===p.fuss?'selected':''}>${x}</option>`).join('')}</select></div>
        <div class="field"><label>Größe (cm)</label><input type="number" id="e_gro" min="150" max="210" value="${p.groesse??''}"></div>
      </div>
      <div class="btnrow" style="margin-top:10px">
        <label class="photobtn">📷 ${p.photo?'Foto ändern':'Foto hinzufügen'} <input type="file" id="e_photo" accept="image/*" style="display:none"></label>
        ${p.photo?'<button class="photobtn" id="delPhoto">🗑 Foto entfernen</button>':''}
      </div>
      <h4 style="margin-top:14px">Eye-Test (1–10)</h4>
      <div class="sliders">
        ${['tempo','technik','zweikampf','spielint','mentalitaet'].map(k=>`
          <div class="sl"><label>${{tempo:'Tempo',technik:'Technik',zweikampf:'Zweikampf',spielint:'Spielintelligenz',mentalitaet:'Mentalität'}[k]}</label>
          <input type="range" min="1" max="10" value="${p.scout[k]}" data-sc="${k}"><output>${p.scout[k]}</output></div>`).join('')}
      </div>
      <div class="field" style="margin-top:12px"><label>Notizen</label><textarea id="e_note">${kEsc(p.note||'')}</textarea></div>
      <div class="btnrow" style="margin-top:12px">
        <button class="btn" id="saveP">Speichern</button>
        <button class="btn ghost" id="starP">${p.star?'★ Von Shortlist entfernen':'☆ Auf die Shortlist'}</button>
      </div>
    </div>`;
  $('#overlay').classList.add('open');
  $('#mclose').onclick=closeOverlay;
  {const _b=document.getElementById('mback'); if(_b)_b.onclick=navBack;}
  $('#modal').querySelectorAll('[data-rank]').forEach(el=>el.onclick=()=>nav({t:'rank',cfg:buildRanking(p.liga,p.isJugend,el.dataset.rank,p.id)}));
  {const _cv=$('#modal').querySelector('[data-clubview]'); if(_cv)_cv.onclick=()=>nav({t:'rank',cfg:buildClubView(p.club,p.id)});}
  $('#modal').querySelectorAll('[data-crm]').forEach(b=>b.onclick=()=>{
    const C=crmOf(p),k=b.dataset.crm;
    if(k==='c')crmSet(p.id,{c:C.c?undefined:1});
    else if(k==='x')crmSet(p.id,{x:C.x?undefined:1});
    else if(C.s===k)crmSet(p.id,{s:undefined,u:undefined});
    else if(k==='lat'){const d=new Date();d.setMonth(d.getMonth()+6);crmSet(p.id,{s:'lat',u:d.toISOString().slice(0,10)});}
    else crmSet(p.id,{s:k,u:undefined});
    renderAll();openModal(p.id);});
  $('#modal').querySelectorAll('[data-lat]').forEach(b=>b.onclick=()=>{
    const m={w:'2027-01-15',s:'2027-06-01','2':'2028-06-01'};
    crmSet(p.id,{s:'lat',u:m[b.dataset.lat]});renderAll();openModal(p.id);});
  {const ld=$('#modal').querySelector('#latdate');
   if(ld)ld.onchange=()=>{if(ld.value){crmSet(p.id,{s:'lat',u:ld.value});renderAll();openModal(p.id);}};}
  document.querySelectorAll('[data-sc]').forEach(inp=>{inp.oninput=e=>{e.target.nextElementSibling.value=e.target.value;};});
  const photoInp=document.getElementById('e_photo');
  if(photoInp)photoInp.onchange=e=>{
    const f=e.target.files[0];if(!f)return;
    const rd=new FileReader();
    rd.onload=()=>{const img=new Image();img.onload=()=>{
      const c=document.createElement('canvas');const m=256;
      const sc=Math.max(m/img.width,m/img.height);
      c.width=Math.round(img.width*sc);c.height=Math.round(img.height*sc);
      c.getContext('2d').drawImage(img,0,0,c.width,c.height);
      p.photo=c.toDataURL('image/jpeg',0.82);renderAll();openModal(p.id);
    };img.src=rd.result;};
    rd.readAsDataURL(f);
  };
  const mAva=document.getElementById('mAva');
  if(mAva&&photoInp)mAva.onclick=()=>photoInp.click();
  const delP=document.getElementById('delPhoto');
  if(delP)delP.onclick=()=>{p.photo=null;renderAll();openModal(p.id);};
  $('#saveP').onclick=()=>{
    p.geb=$('#e_geb').value||null;
    if(p.geb){const d=new Date(p.geb);const now=new Date();
      p.alter=Math.floor((now-d)/31557600000);p.alterCa=false;}
    else p.alter=$('#e_alter').value?+$('#e_alter').value:null;
    if($('#e_alter').value&&!p.isJugend&&!p.geb)p.alterCa=false;
    p.status=$('#e_status').value;
    p.fuss=$('#e_fuss').value||null;
    p.groesse=$('#e_gro').value?+$('#e_gro').value:null;
    p.pos=$('#e_pos').value;
    p.einsaetze=$('#e_eins').value?+$('#e_eins').value:null;
    p.assists=$('#e_ass').value?+$('#e_ass').value:null;
    {const _nn=$('#e_note').value.trim(); if(_nn!==(p.note||'')){p.note=_nn;p._noteLocal=true;crmSet(p.id,{n:_nn||undefined});}}
    {const _mvIn=document.getElementById('e_mvp'); if(_mvIn){const raw=_mvIn.value.trim(), cur=mvpOf(p);
      if(raw===''){ if(cur&&cur.src==='app')crmSet(p.id,{mv:undefined,mvd:undefined}); }
      else { const nv=clamp(Math.round(+raw),0,100); if(!isNaN(nv)&&!(cur&&cur.v===nv))crmSet(p.id,{mv:nv,mvd:todayISO()}); } }}
    document.querySelectorAll('[data-sc]').forEach(inp=>{p.scout[inp.dataset.sc]=+inp.value;});
    p.scouted=true;
    $('#overlay').classList.remove('open');renderAll();
  };
  $('#starP').onclick=()=>{p.star=!p.star;crmSet(p.id,{f:p.star?1:undefined});$('#overlay').classList.remove('open');renderAll();};
  try{
    if(radarChart)radarChart.destroy();
    radarChart=new Chart($('#pradar'),{type:'radar',
      data:{labels:s.defMode?['Defensiv','Dom./Def.','Kontext','Potenzial','GT-Trend','Presse','Scout']:['Produktion','Dominanz','Kontext','Potenzial','Trend','Presse','Scout'],
        datasets:[{label:p.name,data:[s.prod,s.share,s.ctx,s.pot,s.trend,s.presse,s.scout],
          borderColor:'#4da3ff',backgroundColor:'rgba(77,163,255,0.18)',borderWidth:2,pointRadius:4,pointBackgroundColor:'#4da3ff'}]},
      options:{responsive:true,plugins:{legend:{display:false}},
        scales:{r:{min:0,max:100,ticks:{display:false,stepSize:25},grid:{color:'#262d3d'},angleLines:{color:'#262d3d'},pointLabels:{color:'#9aa3b5',font:{size:11}}}}}});
  }catch(err){console.warn('Radar:',err);}
}
$('#overlay').addEventListener('click',e=>{if(e.target.id==='overlay')closeOverlay();});

/* ================= VERGLEICH ================= */
let cmpRadar=null,cmpBar=null;
const CMP_COLORS=['#4da3ff','#ff7ab8','#ffb547'];
function fillCompareSelects(){
  const opts=sorted(players).map(p=>`<option value="${p.id}">${p.name} (${p.club})</option>`).join('');
  ['cmp1','cmp2','cmp3'].forEach((id,i)=>{
    const el=$('#'+id);const cur=el.value;
    el.innerHTML=`<option value="">– Spieler ${i+1} –</option>`+opts;
    if(cur&&players.find(p=>p.id===cur))el.value=cur;
    else if(i<2){const def=sorted(players)[i];if(def)el.value=def.id;}
  });
}
function updateCompare(){
  const sel=['cmp1','cmp2','cmp3'].map(id=>$('#'+id).value).filter(Boolean)
    .map(id=>players.find(p=>p.id===id)).filter(Boolean);
  if(cmpRadar)cmpRadar.destroy();if(cmpBar)cmpBar.destroy();
  if(!sel.length)return;
  try{
    cmpRadar=new Chart($('#cmpRadar'),{type:'radar',
      data:{labels:['Produktion','Dominanz','Kontext','Potenzial','Trend','Presse','Scout'],
        datasets:sel.map((p,i)=>{const s=scores(p);return{label:p.name,
          data:[s.prod,s.share,s.ctx,s.pot,s.trend,s.presse,s.scout],
          borderColor:CMP_COLORS[i],backgroundColor:CMP_COLORS[i]+'26',borderWidth:2,pointRadius:3,pointBackgroundColor:CMP_COLORS[i]};})},
      options:{responsive:true,plugins:{legend:{labels:{color:'#9aa3b5',boxWidth:14}}},
        scales:{r:{min:0,max:100,ticks:{display:false},grid:{color:'#262d3d'},angleLines:{color:'#262d3d'},pointLabels:{color:'#9aa3b5',font:{size:11}}}}}});
    cmpBar=new Chart($('#cmpBar'),{type:'bar',
      data:{labels:['MScore','Prognose Tore (KLA)'],
        datasets:sel.map((p,i)=>{const s=scores(p);return{label:p.name,data:[s.total,s.proj],
          backgroundColor:CMP_COLORS[i],borderRadius:5,maxBarThickness:38};})},
      options:{responsive:true,plugins:{legend:{labels:{color:'#9aa3b5',boxWidth:14}}},
        scales:{x:{ticks:{color:'#9aa3b5'},grid:{display:false}},
          y:{beginAtZero:true,ticks:{color:'#8b93a7'},grid:{color:'#262d3d'}}}}});
  }catch(err){console.warn('Charts:',err);}
}
['cmp1','cmp2','cmp3'].forEach(id=>$('#'+id).addEventListener('change',updateCompare));

/* ================= GEWICHTE ================= */
const WLBL={prod:'Produktion (ligagewichtet)',share:'Dominanz / Tor-Anteil',ctx:'Kontext (Teamstärke)',pot:'Potenzial (Alter)',trend:'Formtrend (vs. 24/25)',presse:'Presse-Index (Engine)',scout:'Scout-Note (Eye-Test)'};
function renderWeights(){
  $('#weights').innerHTML=Object.keys(W).map(k=>`
    <div class="wrow"><label>${WLBL[k]}</label>
    <input type="range" min="0" max="60" value="${W[k]}" data-w="${k}">
    <output>${W[k]} %</output></div>`).join('');
  document.querySelectorAll('[data-w]').forEach(inp=>{
    inp.oninput=e=>{W[e.target.dataset.w]=+e.target.value;
      e.target.nextElementSibling.value=e.target.value+' %';renderAll();};
  });
}
$('#resetW').onclick=()=>{W={...DEF_WEIGHTS};renderWeights();renderAll();};

/* ================= EXPORT / IMPORT / ADD ================= */
function download(name,text,type){
  const b=new Blob([text],{type});const a=document.createElement('a');
  a.href=URL.createObjectURL(b);a.download=name;a.click();URL.revokeObjectURL(a.href);
}
$('#exportBtn').onclick=()=>download('svbc-scout-daten.json',JSON.stringify({weights:W,players,lineup:LINEUP},null,2),'application/json');
$('#exportCsv').onclick=()=>{
  const arr=sorted(players.filter(p=>p.star));
  const rows=[['Name','Verein','Liga','Tore','MScore','PrognoseKLA','Alter','km','Notiz']]
    .concat(arr.map(p=>{const s=scores(p);
      return[p.name,p.club,p.liga,p.tore,s.total,s.proj,p.alter??'',p.km,(p.note||'').replace(/[\n;]/g,' ')];}));
  download('svbc-shortlist.csv',rows.map(r=>r.join(';')).join('\n'),'text/csv');
};
$('#importFile').onchange=e=>{
  const f=e.target.files[0];if(!f)return;
  const rd=new FileReader();
  rd.onload=()=>{try{
    const d=JSON.parse(rd.result);
    if(d.weights)W=d.weights;
    if(Array.isArray(d.players))players=d.players;
    if(d.lineup)LINEUP=d.lineup;
    renderWeights();renderAll();
  }catch(err){alert('Import fehlgeschlagen: '+err.message);}};
  rd.readAsText(f);
};
$('#addBtn').onclick=()=>{
  const n=$('#an').value.trim(),c=$('#ac').value.trim();
  if(!n||!c){$('#addMsg').textContent='Bitte mindestens Name und Verein angeben.';return;}
  const tore=+$('#at').value||0;
  players.push({id:'m'+players.length,name:n,club:c,liga:$('#al').value,sub:$('#al').value,
    tore,teamSp:+$('#ae').value||25,tT:Math.max(1,tore*3),rank:8,teamCount:15,km:+$('#akm').value||10,
    own:false,exSvbc:false,zweit:false,kanone:false,manual:true,risiko:null,info:null,press:[],
    alter:$('#aa').value?+$('#aa').value:null,alterCa:false,pos:$('#ap').value,
    einsaetze:+$('#ae').value||null,assists:null,
    scout:{tempo:5,technik:5,zweikampf:5,spielint:5,mentalitaet:5},scouted:!!$('#aa').value,
    note:'Manuell erfasst',star:true,prev:null,isJugend:false});
  $('#addMsg').textContent='✅ '+n+' hinzugefügt (direkt auf der Shortlist).';
  ['an','ac','aa'].forEach(id=>$('#'+id).value='');
  renderAll();
};

/* ================= NAV / FILTER / PRESETS ================= */
function goTab(tab){
  document.querySelectorAll('nav button').forEach(x=>x.classList.toggle('active',x.dataset.tab===tab));
  document.querySelectorAll('.tabbar .ti').forEach(x=>x.classList.toggle('active',x.dataset.tab===tab));
  document.querySelectorAll('.panel').forEach(x=>x.classList.remove('active'));
  const el=document.getElementById('panel-'+tab);
  if(el)el.classList.add('active');
  if(tab==='cmp')updateCompare();
  if(tab==='kandidaten')renderKandidaten();
  if(tab==='kaderplan')renderKaderplan();
  try{const _a=document.querySelector('.tabbar .ti.active');if(_a&&_a.scrollIntoView)_a.scrollIntoView({inline:'center',block:'nearest'});}catch(e){}
  if(tab==='sxi'){try{renderLineup();}catch(e){}}
  try{window.scrollTo({top:0});}catch(e){}
}
document.querySelectorAll('nav button,.tabbar .ti').forEach(b=>{b.addEventListener('click',()=>goTab(b.dataset.tab));});
document.querySelectorAll('[data-goto]').forEach(el=>{el.addEventListener('click',()=>goTab(el.dataset.goto));});
document.querySelectorAll('.chip[data-liga]').forEach(ch=>{
  ch.addEventListener('click',()=>{
    const l=ch.dataset.liga;
    if(activeLigen.has(l)){activeLigen.delete(l);ch.classList.remove('on');}
    else{activeLigen.add(l);ch.classList.add('on');}
    renderList();
  });
});
$('#q').oninput=e=>{query=e.target.value.toLowerCase();renderList();};
$('#km').oninput=e=>{
  maxKm=+e.target.value>=30?999:+e.target.value;
  $('#kmv').textContent=maxKm>900?'alle':'≤ '+maxKm+' km';
  renderList();
};
$('#sort').onchange=e=>{sortBy=e.target.value;renderList();};
$('#fpos').onchange=e=>{fPos=e.target.value;renderList();};
$('#ageMin').oninput=e=>{ageMin=e.target.value?+e.target.value:null;renderList();};
$('#ageMax').oninput=e=>{ageMax=e.target.value?+e.target.value:null;renderList();};
function setLigen(list){
  activeLigen.clear();list.forEach(l=>activeLigen.add(l));
  document.querySelectorAll('.chip[data-liga]').forEach(ch=>ch.classList.toggle('on',activeLigen.has(ch.dataset.liga)));
}
function applyPreset(name){
  query='';$('#q').value='';
  setLigen(['KOL','A','B','C','D','JUG']);
  fPos='';$('#fpos').value='';ageMin=null;ageMax=null;$('#ageMin').value='';$('#ageMax').value='';
  maxKm=999;$('#km').value=30;$('#kmv').textContent='alle';sortBy='score';$('#sort').value='score';
  if(name==='st1619'){fPos='ST';$('#fpos').value='ST';ageMin=16;ageMax=19;$('#ageMin').value=16;$('#ageMax').value=19;}
  if(name==='u23'){ageMax=23;$('#ageMax').value=23;}
  if(name==='nah'){maxKm=10;$('#km').value=10;$('#kmv').textContent='≤ 10 km';}
  goTab('scout');renderList();
  if(name==='rueck'){
    const arr=sorted(players.filter(p=>p.exSvbc||p.own));
    $('#filterHint').textContent=arr.length+' Rückhol-Kandidaten & Eigengewächse';
    $('#list').innerHTML=arr.map((p,i)=>rowHtml(p,i)).join('');
  }
}
document.querySelectorAll('.preset').forEach(b=>{b.addEventListener('click',()=>{ if(b.dataset.goto){goTab(b.dataset.goto);} else {applyPreset(b.dataset.preset);} });});
document.addEventListener('click',e=>{
  const rg=e.target.closest('.ring');
  if(rg){e.stopPropagation();openLegend();return;}
  const lg=e.target.closest('[data-legend]');
  if(lg){e.stopPropagation();openLegend();return;}
  const star=e.target.closest('[data-star]');
  if(star){e.stopPropagation();
    const p=players.find(x=>x.id===star.dataset.star);
    if(p){p.star=!p.star;crmSet(p.id,{f:p.star?1:undefined});renderAll();}
    return;}
  const row=e.target.closest('.row[data-id],.fcard[data-id]');
  if(row)startPlayer(row.dataset.id);
});

/* ================= AUFSTELLUNG (FIFA-Style) ================= */
const FORMATIONS={
 '4-4-2':[['TW',50,90],['LV',17,72],['IV',39,75],['IV',61,75],['RV',83,72],['LM',17,48],['ZM',39,51],['ZM',61,51],['RM',83,48],['ST',38,25],['ST',62,25]],
 '4-3-3':[['TW',50,90],['LV',17,72],['IV',39,75],['IV',61,75],['RV',83,72],['ZM',30,53],['ZM',50,56],['ZM',70,53],['LA',18,28],['ST',50,22],['RA',82,28]],
 '3-5-2':[['TW',50,90],['IV',30,75],['IV',50,77],['IV',70,75],['LM',12,53],['ZM',35,55],['ZM',50,50],['ZM',65,55],['RM',88,53],['ST',38,25],['ST',62,25]],
 '4-2-3-1':[['TW',50,90],['LV',17,74],['IV',39,77],['IV',61,77],['RV',83,74],['ZM',38,58],['ZM',62,58],['LM',20,38],['OM',50,35],['RM',80,38],['ST',50,20]],
 '4-5-1':[['TW',50,90],['LV',17,72],['IV',39,75],['IV',61,75],['RV',83,72],['LM',13,48],['ZM',33,53],['ZM',50,57],['ZM',67,53],['RM',87,48],['ST',50,22]],
 '4-1-4-1':[['TW',50,90],['LV',17,72],['IV',39,75],['IV',61,75],['RV',83,72],['ZM',50,63],['LM',15,44],['ZM',37,45],['ZM',63,45],['RM',85,44],['ST',50,20]],
 '5-1-2-2':[['TW',50,91],['LV',11,62],['IV',31,74],['IV',50,76],['IV',69,74],['RV',89,62],['ZM',50,57],['OM',32,40],['OM',68,40],['ST',38,21],['ST',62,21]],
 '5-4-1':[['TW',50,91],['LV',11,64],['IV',31,74],['IV',50,76],['IV',69,74],['RV',89,64],['LM',17,44],['ZM',39,48],['ZM',61,48],['RM',83,44],['ST',50,21]],
};
const ROLE2POS={TW:'TW',IV:'IV',LV:'AV',RV:'AV',ZM:'ZM',LM:'Flügel',RM:'Flügel',LA:'Flügel',RA:'Flügel',OM:'OM',ST:'ST'};
const POSSIM={ /* welche Positionen eine Rolle realistisch vertreten können (Kreisliga-Polyvalenz) */
 'TW':{},
 'IV':{'AV':1,'ZM':0.5},
 'AV':{'IV':1,'Flügel':1,'ZM':0.5},
 'ZM':{'OM':1,'AV':0.5,'IV':0.5},
 'OM':{'ZM':1,'Flügel':1,'ST':0.5},
 'Flügel':{'OM':1,'ST':1,'AV':1,'ZM':0.5},
 'ST':{'OM':1,'Flügel':1},
};
function posFit(p,want){
  if(!want)return null;
  if(p.pos===want)return {lvl:2,tag:'✓ '+want,col:'#5fe09b'};
  if(p.pos2&&p.pos2.includes(want))return {lvl:1.5,tag:'◐ '+want+' (Neben)',col:'#ffd60a'};
  const s=(POSSIM[want]||{})[p.pos];
  if(s===1)return {lvl:1,tag:'~ '+want+' möglich (spielt '+p.pos+')',col:'#ffb347'};
  if(s===0.5)return {lvl:0.5,tag:'~ zur Not (spielt '+p.pos+')',col:'#8fa3c7'};
  if(!p.pos)return {lvl:0.2,tag:'Position unbekannt',col:'#8fa3c7'};
  return null;
}
let LINEUP={formation:'4-4-2',slots:{}};
/* ===== Aufstellungs-Sync: die zuletzt gesetzte Elf liegt zentral im Make-Datastore ===== */
const SYNCU='https://hook.eu1.make.com/hjm7vhk0hrgcg50f816k74klrpbbiszf';
let SHADOW={};
let _lastSync=null,_syncT=null,_remoteLoaded=false;
/* ===== Scouting-CRM: Status je Spieler, geräteübergreifend im selben Datastore-Record =====
   CRM[pid] = {c:1 kontaktiert, s:'att'|'no'|'lat', u:'JJJJ-MM-TT' Wiedervorlage, x:1 Ex-SV/BSC (markiert), f:1 Shortlist-Stern, n:'Notiz'} */
let CRM={}, _remoteDone=false, _crmDirty=false;
function todayISO(){const d=new Date();return d.getFullYear()+'-'+String(d.getMonth()+1).padStart(2,'0')+'-'+String(d.getDate()).padStart(2,'0');}
function crmOf(p){return CRM[p.id]||{};}
function crmHidden(p){const C=crmOf(p);if(C.s==='no')return true;if(C.s==='lat'&&C.u&&C.u>todayISO())return true;return false;}
function crmDue(p){const C=crmOf(p);return C.s==='lat'&&(!C.u||C.u<=todayISO());}
function fmtD(iso){if(!iso)return '';const [y,m,d]=iso.split('-');return d+'.'+m+'.'+y.slice(2);}
/* ===== Sync v2: feldweises Zusammenführen statt Überschreiben =====
   - Jeder CRM-Eintrag trägt _t = {feld: Zeitstempel}; Aufstellung/Schattenelf tragen gemeinsam "lt".
   - Vor jedem Speichern wird der Online-Stand geholt und pro Feld der jüngere Wert übernommen.
     OHNE gültigen Online-Stand wird NIE geschrieben (sonst könnte ein Handy mit Funkloch alles überschreiben).
   - Nach dem Speichern wird nachgeprüft, ob der Server alles hat; sonst wird erneut gesendet.
   - Zeitstempel als "hybride Uhr": nie kleiner als alles schon Gesehene → falsch gehende Handy-Uhren schaden nicht.
   - Eingehende Werte werden geprüft (Datumsformat, Zahlenbereiche, Längen): Schutz vor eingeschleustem Code. */
let SYNC_ST='idle', _pendingRefresh=false, _hlc=0, _lineupT=0, _lastLineupSer=null, _pushTries=0, _verifyT=null, _kvChanged=false, _lineupAdopted=false;
const SYNC_BAD_KEYS={'__proto__':1,'constructor':1,'prototype':1};
const SYNC_DATE=/^\d{4}-\d{2}-\d{2}$/;
function hlcNow(){ _hlc=Math.max(Date.now(),_hlc+1); return _hlc; }
function hlcSeen(t){ if(typeof t==='number'&&isFinite(t)&&t<=Date.now()+86400000&&t>_hlc)_hlc=t; }
function syncTime(t){ t=+t||0; return (isFinite(t)&&t>0&&t<=Date.now()+86400000)?t:0; } /* Stempel aus der Zukunft ignorieren */
function crmValid(id,k,v){
  if(SYNC_BAD_KEYS[k]||v===null||v===undefined)return false;
  switch(k){
    case 'lc': case 'u': case 'mvd': return typeof v==='string'&&SYNC_DATE.test(v);
    case 'mv': return typeof v==='number'&&isFinite(v)&&v>=0&&v<=100;
    case 'w': return v===1||v===2||v===3||v===4;
    case 's': return v==='att'||v==='no'||v==='lat';
    case 'f': case 'c': case 'x': case 'px': return v===1||v===true;
    case 'tp': return typeof v==='string'&&v.length<=12;
    case 'k': case 'n': case 'rl': case 'pl': case 'kv': return typeof v==='string'&&v.length<=4000;
    default:
      if(id===META_ID&&k.slice(0,3)==='pl:')return v===1;
      return (typeof v==='string'&&v.length<=4000)||(typeof v==='number'&&isFinite(v))||typeof v==='boolean';
  }
}
function crmSet(id,upd){
  if(SYNC_BAD_KEYS[id])return;
  const C=Object.prototype.hasOwnProperty.call(CRM,id)?CRM[id]:{}; const T=(C._t&&typeof C._t==='object')?C._t:{}; const now=hlcNow();
  for(const k in upd){ if(k==='_t'||SYNC_BAD_KEYS[k])continue;
    if(upd[k]===undefined||upd[k]===null||upd[k]===false||upd[k]==='')delete C[k]; else C[k]=upd[k];
    T[k]=now; }
  C._t=T; CRM[id]=C;
  if(_remoteDone)lineupSync(); else _crmDirty=true;
}
function crmApply(){ /* synchronisierte Sterne & Notizen auf die Spieler-Objekte spiegeln */
  players.forEach(p=>{const C=CRM[p.id];if(!C)return;
    if(C._t&&Object.prototype.hasOwnProperty.call(C._t,'f'))p.star=!!C.f; else if(C.f)p.star=true;
    if(C.n!=null&&!p._noteLocal)p.note=C.n;});
}
function crmMerge(remote){
  let changed=false;
  if(!remote||typeof remote!=='object'||Array.isArray(remote))return false;
  for(const id of Object.keys(remote)){
    if(SYNC_BAD_KEYS[id])continue;
    const R=remote[id]; if(!R||typeof R!=='object'||Array.isArray(R))continue;
    const RT=(R._t&&typeof R._t==='object'&&!Array.isArray(R._t))?R._t:{};
    const had=Object.prototype.hasOwnProperty.call(CRM,id);
    const L=had?CRM[id]:{};
    const LT=(L._t&&typeof L._t==='object')?L._t:{};
    const keys=new Set([...Object.keys(R),...Object.keys(L),...Object.keys(RT)]); keys.delete('_t');
    keys.forEach(k=>{
      if(SYNC_BAD_KEYS[k])return;
      const rHas=Object.prototype.hasOwnProperty.call(R,k), lHas=Object.prototype.hasOwnProperty.call(L,k);
      if(rHas&&!crmValid(id,k,R[k]))return;                       /* ungültiger/manipulierter Wert: ignorieren */
      const rt=syncTime(RT[k]), lt=+LT[k]||0;
      if(id===META_ID&&k==='kv'){                                 /* Prüfwert des Team-Schlüssels: der ERSTE gewinnt, Löschen zählt nicht */
        if(!rHas)return;
        if(!lHas||(L.kv!==R.kv&&rt>0&&(lt===0||rt<lt))){ L.kv=R.kv; LT.kv=rt; changed=true; _kvChanged=true; }
        return;
      }
      hlcSeen(rt);
      const same=rHas&&lHas&&JSON.stringify(R[k])===JSON.stringify(L[k]);
      const differ=(rHas!==lHas)||(rHas&&!same);
      if(rt>lt||(rt===lt&&differ)){                                /* jüngerer Stand gewinnt; Gleichstand mit Unterschied → Server */
        if(!differ){ if(rt>lt)LT[k]=rt; return; }
        if(rHas)L[k]=R[k]; else delete L[k];
        LT[k]=Math.max(rt,lt); changed=true;
      }
    });
    if(Object.keys(LT).length)L._t=LT;
    if(!had&&Object.keys(L).length)CRM[id]=L;
  }
  return changed;
}
function lineupSer(){ try{return JSON.stringify({formation:LINEUP.formation,slots:LINEUP.slots,shadow:SHADOW});}catch(e){return null;} }
function syncSer(){ return JSON.stringify({formation:LINEUP.formation,slots:LINEUP.slots,shadow:SHADOW,crm:CRM,lt:_lineupT}); }
async function syncFetch(){
  const r=await fetch(SYNCU+'?getl=1',{cache:'no-store'}); const d=await r.json();
  if(!d||typeof d!=='object'||Array.isArray(d))throw new Error('ungültiger Online-Stand');
  return d;
}
function syncAdoptRemote(d){ /* Online-Stand einarbeiten; true = lokal hat sich etwas geändert */
  let ch=false;
  if(d.crm&&crmMerge(d.crm))ch=true;
  const rlt=syncTime(d.lt);
  if(d.formation&&FORMATIONS[d.formation]&&d.slots&&typeof d.slots==='object'&&rlt>=_lineupT){
    const slots={}; for(const k in d.slots){ if(players.some(p=>p.id===d.slots[k]))slots[+k]=d.slots[k]; }
    const shadow=(d.shadow&&typeof d.shadow==='object'&&!Array.isArray(d.shadow))?d.shadow:SHADOW;
    const ser=JSON.stringify({formation:d.formation,slots,shadow});
    if(ser!==lineupSer()){ LINEUP={formation:d.formation,slots}; SHADOW=shadow; ch=true; _lineupAdopted=true; }
    _lineupT=rlt; hlcSeen(rlt); _lastLineupSer=lineupSer();
  }
  return ch;
}
function syncState(st){
  SYNC_ST=st;
  const t={idle:'',pending:'⏳ speichert…',ok:'☁️ gespeichert',err:'⚠️ offline, wird nachgeholt'}[st]||'';
  document.querySelectorAll('.ksync').forEach(el=>{el.textContent=t;el.style.display=t?'':'none';});
}
function lineupSync(){
  const ls=lineupSer(); if(ls===null)return;
  if(_lastLineupSer===null)_lastLineupSer=ls; else if(ls!==_lastLineupSer){ _lastLineupSer=ls; _lineupT=hlcNow(); }
  let s; try{s=syncSer();}catch(e){return;}
  if(_lastSync===null){_lastSync=s;return;} /* erster Render: nur Stand merken, nicht speichern */
  if(s===_lastSync)return;
  _lastSync=s; outboxSave();
