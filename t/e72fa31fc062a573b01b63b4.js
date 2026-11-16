document.addEventListener('pointermove',e=>{
  const S=SWX.on; if(!S||e.pointerId!==S.id)return;
  const dx=e.clientX-S.x, dy=e.clientY-S.y;
  if(!S.axis){ if(Math.abs(dx)<9&&Math.abs(dy)<9)return;
    if(Math.abs(dx)>Math.abs(dy)*1.25){ let A=null; try{ A=S.r.what(S.el); }catch(x){} if(!A||(!A.l&&!A.r)){ SWX.on=null; return; }
      S.A=A; S.axis='x'; S.bg=swxBg(S.el,A); S.el.classList.add('sw45drag'); document.body.classList.add('sw45nosel'); try{ S.el.setPointerCapture(e.pointerId); }catch(x){} }
    else { SWX.on=null; return; } }
  e.preventDefault();
  const W=S.el.offsetWidth||300; let d=dx; if(d<0&&!S.A.l)d*=0.25; if(d>0&&!S.A.r)d*=0.25;
  S.dx=d; S.el.style.transform=`translate3d(${d}px,0,0)`;
  const pass=Math.abs(d)>Math.min(140,W*0.3); if(S.bg){ S.bg.classList.toggle('go-r',d>0); S.bg.classList.toggle('go-l',d<0); S.bg.classList.toggle('pass',pass); }
  if(pass!==S.passed){ S.passed=pass; if(pass)try{ svHaptic('light'); }catch(x){} }
},{passive:false,capture:true});
function swxEnd(e,cancel){
  const S=SWX.on; if(!S||(e&&e.pointerId!==S.id))return; SWX.on=null; if(S.axis!=='x')return;
  document.body.classList.remove('sw45nosel'); SWX.just=Date.now();
  const el=S.el, W=el.offsetWidth||300, v=Math.abs(S.dx)/Math.max(1,performance.now()-S.t), dir=S.dx>0?'r':'l', act=S.A[dir];
  const ok=!cancel&&act&&(Math.abs(S.dx)>Math.min(140,W*0.3)||(v>0.6&&Math.abs(S.dx)>48));
  el.classList.remove('sw45drag');
  const zurueck=()=>{ el.classList.add('sw45back'); el.style.transform=''; setTimeout(()=>{ el.classList.remove('sw45back'); if(S.bg)S.bg.remove(); },300); };
  if(!ok)return zurueck();
  if(!act.out){ zurueck(); setTimeout(()=>swxRun(act),260); return; }
  try{ svSound('swoosh'); }catch(x){}
  el.style.height=el.offsetHeight+'px'; el.classList.add('sw45out'); el.style.transform=`translate3d(${(dir==='r'?1:-1)*W*1.15}px,0,0)`;
  if(S.bg)S.bg.classList.add('fade'); setTimeout(()=>{ el.classList.add('sw45zu'); if(S.bg)S.bg.remove(); },200);
  setTimeout(()=>swxRun(act),440);
}
async function swxRun(act){ try{ await act.fn(); }catch(e){ kToast('⚠️ '+String((e&&e.message)||e)); } }
document.addEventListener('pointerup',e=>swxEnd(e,false),true);
document.addEventListener('pointercancel',e=>swxEnd(e,true),true);
window.addEventListener('click',e=>{ if(Date.now()-SWX.just<400&&e.target.closest&&SWX.reg.length&&e.target.closest(swxSel())){ e.stopPropagation(); e.preventDefault(); } },true);
// Einmaliger Tipp je Liste (auf Touch-Geräten), danach nur noch die kleine Zeile über der Liste
function swxTipp(key,text){ try{ if(!matchMedia('(pointer: coarse)').matches)return; const k='swxTipp-'+key; if(localStorage.getItem(k))return; localStorage.setItem(k,'1'); setTimeout(()=>kToast('Tipp: '+text),700); }catch(e){} }
function swxZeile(links,rechts){ return `<p class="swx-hint"><span>← ${svEsc(links)}</span><span>${svEsc(rechts)} →</span></p>`; }

/* ---------- Bedarf: Kandidaten ---------- */
const SWX_WEITER={kandidat:'beobachten',beobachten:'shortlist',shortlist:'kontakt'};
const SWX_STL=Object.fromEntries(SC4_ST.concat([['verworfen','Verworfen']]));
function swxBedarf(){ return SC4.open&&SV4.bed.find(b=>b.id===SC4.open); }
swxAdd('.bk4r',el=>{
  const b=swxBedarf(), s=el.querySelector('[data-bks]'); if(!b||!s||!sv4Can())return null;
  const pid=s.dataset.bks, row=SV4.bk.find(x=>x.bedarf_id===b.id&&x.player_id===pid); if(!row)return null; const p=sv4P(pid)||{name:'Spieler'};
  const next=SWX_WEITER[row.status];
  return {
    r:{ic:'✕',t:'Raus aus dem Bedarf',tone:'no',out:true,fn:async()=>{
      const alt=Object.assign({},row); const {error}=await SVB.sb.from('bedarf_kandidaten').delete().eq('bedarf_id',b.id).eq('player_id',pid); if(error)throw error;
      SV4.bk=SV4.bk.filter(x=>!(x.bedarf_id===b.id&&x.player_id===pid)); sv4Bump(); sc4Bedarf();
      kToast(p.name+' ist raus aus „'+b.titel+'“','Rückgängig',async()=>{ const {data,error:e2}=await SVB.sb.from('bedarf_kandidaten').insert({bedarf_id:b.id,player_id:pid,quelle:alt.quelle||'manuell',status:alt.status}).select().single(); if(e2)return kToast('⚠️ '+e2.message); SV4.bk.push(data); sv4Bump(); sc4Bedarf(); }); }},
    l:next?{ic:'→',t:SWX_STL[next],tone:'ok',fn:async()=>{
      const {error}=await SVB.sb.from('bedarf_kandidaten').update({status:next}).eq('bedarf_id',b.id).eq('player_id',pid); if(error)throw error;
      const alt=row.status; row.status=next; sv4Bump(); sc4Bedarf(); try{ svSound('success'); }catch(x){}
      kToast(p.name+': '+SWX_STL[next],'Rückgängig',async()=>{ await SVB.sb.from('bedarf_kandidaten').update({status:alt}).eq('bedarf_id',b.id).eq('player_id',pid); row.status=alt; sv4Bump(); sc4Bedarf(); }); }}:null };
});
/* Vorschläge und interne Lösungen: übernehmen oder ausblenden */
function swxHid(bid){ try{ return new Set(JSON.parse(localStorage.getItem('svBedHide-'+bid)||'[]')); }catch(e){ return new Set(); } }
function swxHidSet(bid,S){ try{ localStorage.setItem('svBedHide-'+bid,JSON.stringify([...S].slice(-200))); }catch(e){} }
swxAdd('.sg4c[data-badd]',el=>{
  const b=swxBedarf(); if(!b||!sv4Can())return null; const pid=el.dataset.badd, p=sv4P(pid)||{name:'Spieler'};
  return {
    l:{ic:'+',t:'Als Kandidat',tone:'ok',out:true,fn:async()=>{ await sc4Add(b.id,pid,el.dataset.bq||'manuell'); sc4Bedarf(); }},
    r:{ic:'✕',t:'Ausblenden',tone:'no',out:true,fn:async()=>{ const H=swxHid(b.id); H.add(pid); swxHidSet(b.id,H); sc4Bedarf();
      kToast(p.name+' ausgeblendet','Rückgängig',()=>{ const H2=swxHid(b.id); H2.delete(pid); swxHidSet(b.id,H2); sc4Bedarf(); }); }} };
});
// Wer schon Kandidat ist oder ausgeblendet wurde, taucht unten nicht nochmal auf
{ const _in=sc4Intern; sc4Intern=function(b){ const have=new Set(SV4.bk.filter(x=>x.bedarf_id===b.id).map(x=>x.player_id)), H=swxHid(b.id);
  return _in.call(this,b).filter(({p})=>!have.has(p.id)&&!H.has(p.id)); }; }
{ const _ca=sc4Cands; sc4Cands=function(b,n){ const H=swxHid(b.id); return _ca.call(this,b,(n||6)+H.size).filter(p=>!H.has(p.id)).slice(0,n||6); }; }
// Kandidatenliste: kleine Zeile, was Wischen macht, und der Wert bekommt eine Beschriftung
{ const _d=sc4Detail; sc4Detail=function(b){ let h=_d.apply(this,arguments);
  if(SV4.bk.some(x=>x.bedarf_id===b.id))h=h.replace('<div class="bk4l">',swxZeile('nächste Stufe','raus')+'<div class="bk4l">');
  if(/class="sg4"/.test(h))h=h.replace(/(<h5 class="bd4h">Vorschläge nach Suchprofil<\/h5>)/,'$1'+swxZeile('als Kandidat','ausblenden'));
  return h; }; }
{ const _b=sc4Bedarf; sc4Bedarf=function(){ const r=_b.apply(this,arguments); try{ if(swxBedarf()&&SV4.bk.some(x=>x.bedarf_id===SC4.open))swxTipp('bedarf','Kandidat nach links wischen = nächste Stufe, nach rechts = raus aus dem Bedarf'); }catch(e){} return r; }; }

/* ---------- Teams: Kader als Karten, Termine, Ziele ---------- */
swxAdd('.svt-kc[data-svtp]',el=>{
  const sid=el.dataset.svtp, k=SVT.K.find(x=>x.spieler===sid); if(!k||k.status==='abgang')return null; const v=k.vereinsspieler, nm=svtSpieler(v);
  return {
    r:{ic:'✕',t:'Aus dem Kader',tone:'no',out:true,fn:async()=>{ await svtRpc('team_kader_raus',{p_m:SVT.team,p_saison:SVT.saison,p_spieler:sid}); await svtReload();
      kToast(nm+' aus dem Kader genommen','Rückgängig',async()=>{ await svtRpc('team_kader_add',{p_m:SVT.team,p_saison:SVT.saison,p_spieler:[sid],p_status:k.status==='gast'?'gast':'aktiv'}); await svtReload(); }); }},
    l:svtStufe()==='mini'?null:{ic:'★',t:v.talent?'Talent entfernen':'Talent merken',tone:'ok',fn:async()=>{ await svtRpc('team_spieler_save',{p:{id:sid,mannschaft:SVT.team,saison:SVT.saison,talent:!v.talent}}); await svtReload(); kToast(v.talent?'Talent-Stern entfernt':'★ '+nm+' als Talent gemerkt'); }} };
});
swxAdd('.svt-trow[data-svtt]',el=>{
  const t=SVT.T.find(x=>x.id===el.dataset.svtt); if(!t)return null; const heute=svtHeute(), vorbei=t.datum<=heute, erfasst=SVT.A.some(a=>a.termin===t.id);
  return {
    r:t.datum>=heute?{ic:t.abgesagt?'↩':'✕',t:t.abgesagt?'Wieder ansetzen':'Absagen',tone:t.abgesagt?'back':'no',fn:async()=>{ await svtRpc('team_termin_save',{p:{id:t.id,abgesagt:!t.abgesagt}}); await svtReload();
      kToast(t.abgesagt?'Termin wieder angesetzt':SVT_ART[t.art]+' am '+svtDat(t.datum)+' abgesagt','Rückgängig',async()=>{ await svtRpc('team_termin_save',{p:{id:t.id,abgesagt:t.abgesagt}}); await svtReload(); }); }}:null,
    l:vorbei&&!erfasst&&!t.abgesagt?{ic:'✓',t:'Alle da',tone:'ok',fn:async()=>{
      const p=SVT.K.filter(k=>k.status!=='abgang').map(k=>{ const r=SVT.R.find(x=>x.termin===t.id&&x.spieler===k.spieler); return r&&r.antwort==='nein'?{spieler:k.spieler,status:'weg',grund:r.grund||'ohne'}:{spieler:k.spieler,status:'da'}; });
      await svtRpc('team_anwesenheit_save',{p_termin:t.id,p}); await svtReload(); kToast('✓ Anwesenheit erfasst: alle da'+(p.some(x=>x.status==='weg')?' außer den Absagen':''),'Ändern',()=>svtTermin(t.id)); }}:null };
});
swxAdd('.svt-ziel',el=>{
  const b=el.querySelector('[data-svtz]'); if(!b)return null; const e=SVT.E.find(x=>x.id===b.dataset.svtz); if(!e)return null;
  return {
    l:e.status!=='erreicht'?{ic:'✓',t:'Erreicht',tone:'ok',fn:async()=>{ await svtRpc('entwicklung_save',{p:{id:e.id,status:'erreicht'}}); await svtReload(); try{ svSound('success'); }catch(x){}
      kToast('🎉 Ziel erreicht: '+e.ziel,'Rückgängig',async()=>{ await svtRpc('entwicklung_save',{p:{id:e.id,status:e.status}}); await svtReload(); }); }}:null,
    r:{ic:'✕',t:'Löschen',tone:'no',out:true,fn:async()=>{ await svtRpc('entwicklung_delete',{p_id:e.id}); await svtReload();
      kToast('Ziel gelöscht','Rückgängig',async()=>{ await svtRpc('entwicklung_save',{p:{spieler:e.spieler,mannschaft:e.mannschaft,saison:e.saison,thema:e.thema,ziel:e.ziel,massnahmen:e.massnahmen,uebungen:e.uebungen,status:e.status,faellig:e.faellig}}); await svtReload(); }); }} };
});
// Kader auf dem Handy als Karten (wischbar, alles auf einen Blick), am Rechner als Tabelle
{ const _k=svtKader; svtKader=function(B){ _k.apply(this,arguments);
  if(!matchMedia('(max-width: 700px)').matches||!SVT.K.length)return;
  const tw=B.querySelector('.svt-tw'); if(!tw)return; const mini=svtStufe()==='mini';
  const kc=SVT.K.map(k=>{ const v=k.vereinsspieler, s=svtStat(k.spieler), warn=s.n>=6&&s.quote<.6;
    return `<div class="svt-kc${k.status==='abgang'?' off':''}" data-svtp="${svEsc(k.spieler)}" role="button" tabindex="0"><span class="svt-kn">${k.nr||''}</span>
      <div class="svt-kb"><b>${svEsc(svtSpieler(v))}${v.talent?' <span class="svt-star">★</span>':''}</b>
        <span>${[v.jahrgang?'Jg. '+v.jahrgang:'',mini?'':(k.position||v.position||''),mini||!v.fuss?'':'Fuß '+v.fuss[0].toUpperCase()+(v.schwach?' · schwach '+v.schwach+'/5':''),k.status==='gast'?'Gast':k.status==='abgang'?'Abgang':''].filter(Boolean).map(svEsc).join(' · ')}</span></div>
      <div class="svt-kz"><b class="${warn?'svt-warn':''}">${svtPct(s.quote)}</b><small>Training</small></div>${mini?'':svtEinChip(s.avg)}</div>`; }).join('');
  tw.outerHTML=swxZeile(mini?'':'Talent merken','aus dem Kader')+`<div class="svt-kl">${kc}</div>`;
  B.querySelectorAll('.svt-kc[data-svtp]').forEach(r=>{ r.onclick=()=>{ if(Date.now()-SWX.just>400)svtSpielerModal(r.dataset.svtp); }; r.onkeydown=e=>{ if(e.key==='Enter')svtSpielerModal(r.dataset.svtp); }; });
  swxTipp('kader','Spieler nach rechts wischen = aus dem Kader, nach links = Talent merken');
}; }
{ const _t=svtTermine; svtTermine=function(B){ _t.apply(this,arguments); const h=B.querySelector('.svt-h4'); if(h&&SVT.T.length)h.insertAdjacentHTML('beforebegin',swxZeile('alle da (vorbei)','absagen')); }; }

/* =====================================================================
   Sportzentrale Beta 0.25 · Partner (bis 0.31 „Sponsoring“, ab 0.32 immer Partner)
   - Übersicht (seit 0.72 entfällt sie, die Zentrale in svm63 ist die Übersicht; alte Aufrufe landen dort)
   - Firmen: Stand von der Idee bis zum Partner, wer wann angeschrieben wurde (ein Tipp), wischen = Stand weiter / abgesagt
   - Ausrüstung: Trikots und Anzüge je Mannschaft, wo ein Partner gesucht wird
   - Ablage: Links in jede Cloud (Google Drive, iCloud, OneDrive, Dropbox), Vorlagen des Vereins
   - Partnervertrag vor Ort (alter Assistent, seit 0.72 nicht mehr zum Anlegen angeboten: Verträge entstehen über die Präsentation der Firma, Partner-Engine)
   - 0.72: ein gemeinsamer kompakter Kopf für alle Reiter (Titel und wischbare Reiterleiste), Vereinsdaten nur noch in der Steuerung
   Bankdaten des Partners sieht nur, wer „Bankdaten sehen“ darf. Das PDF für alle anderen zeigt die IBAN gekürzt.
   ===================================================================== */
const SPO={loaded:false,busy:false,S:[],K:[],L:[],A:[],V:[],D:[],verein:{},view:'zentrale',ausNur:false,flt:'offen',q:'',t:0};
const SPO_ST=[['idee','Idee'],['angeschrieben','Angeschrieben'],['gespraech','Gespräch'],['angebot','Angebot'],['partner','Partner'],['abgesagt','Abgesagt'],['pausiert','Pausiert']];
const SPO_STL=Object.fromEntries(SPO_ST);
const SPO_WEITER={idee:'angeschrieben',angeschrieben:'gespraech',gespraech:'angebot',angebot:'partner'};
// Partnerstufen, Laufzeiten und Zusatzoptionen wie im Partnersheet 2027/28 (Beta 0.32)
const SPO_STUFE={supporter:{t:'SVM Supporter',p:189,s:'Ich unterstütze.',d:'Logo auf der Supporter-Tafel, Logo und Link auf der Website, Saison-Badge.'},
  club:{t:'Club Partner',p:496,s:'Ich werde sichtbar.',d:'Bande nach Verfügbarkeit, 1 Partnerkarte, Einladung zum Partnerabend, Partner-Begrüßung auf Social Media.'},
  premium:{t:'Premium Partner',p:896,s:'Sichtbar + vernetzt.',d:'Bevorzugte Bande, 2 Partnerkarten, Partnerabend, alle Business Treffs, Partner-Spotlight, 1 Job-Post.',max:16},
  p1896:{t:'1896 Partner',p:1896,s:'Innerer Partnerkreis.',d:'Topplatzierung, 4 Partnerkarten, 1 Partner des Tages inklusive mit Vorwahlrecht, Branchenexklusivität, 2 Job-Posts.',max:8}};
const SPO_LZ={1:['1 Saison','regulärer Preis',0],2:['2 Saisons','−5 % je Saison und Preisgarantie',.05],3:['3 Saisons','−10 % je Saison, Preisgarantie, garantierter Platz und Standard-Werbebande inklusive (sofern Bestandteil des Pakets)',.10]};
const SPO_LZ_KURZ={1:'regulär',2:'−5 % + Preisgarantie',3:'−10 % + Preisgarantie + garantierter Platz + Standard-Bande inkl.*'};
const SPO_EX={sotd:['Partner des Tages','ein Heimspiel',149],trikot:['Trikotsatz-Patenschaft Jugend','',350],business:['Business Treff','als Gastgeber',250]};
// Partner des Tages kostet je nach Stufe: Supporter 189 €, Club 169 €, Premium 149 €. Beim 1896 Partner ist ein Heimspiel je Saison inklusive, jedes weitere 149 €.
const SPO_SOTD={supporter:189,club:169,premium:149,p1896:149};
function spoExPreis(k,stufe){ return k==='sotd'?(SPO_SOTD[stufe]||189):SPO_EX[k][2]; }
function spoExInfo(k,stufe){ return k==='sotd'&&stufe==='p1896'?'ein Heimspiel ist inklusive, das hier sind weitere':SPO_EX[k][1]; }
// [Icon (SVI), Wort]. Das Wort nutzt auch svm27 (Für KI kopieren).
const SPO_ART={mail:['mail','Mail'],anruf:['phone','Anruf'],treffen:['users','Treffen'],brief:['send','Brief'],whatsapp:['chat','WhatsApp'],angebot:['file','Angebot geschickt'],vertrag:['check','Vertrag'],sonst:['info','Notiz']};
function spoArtIc(a){ return SVI((SPO_ART[a]||SPO_ART.sonst)[0]); }
const SPO_AUS={trikot1:'Trikotsatz 1',trikot2:'Trikotsatz 2',anzug:'Trainingsanzug'};
const SPO_LINKART={ordner:'Ordner',vorlage:'Vorlage',praesentation:'Präsentation',vertrag:'Vertrag',logo:'Logo',sonst:'Link'};
function spoEur(v,dez){ return (Math.round((+v||0)*100)/100).toLocaleString('de-DE',{style:'currency',currency:'EUR',minimumFractionDigits:dez?2:0,maximumFractionDigits:dez?2:0}); }
function spoAnbieter(u){ u=String(u||''); return /drive\.google|docs\.google/.test(u)?'Google Drive':/icloud\.com/.test(u)?'iCloud':/1drv\.ms|onedrive|sharepoint/.test(u)?'OneDrive':/dropbox\.com/.test(u)?'Dropbox':'Web'; }
function spoDat(d){ try{ return new Date(String(d).slice(0,10)+'T12:00:00').toLocaleDateString('de-DE',{day:'2-digit',month:'2-digit',year:'2-digit'}); }catch(e){ return d; } }
function spoTage(d){ return Math.round((Date.now()-new Date(String(d).slice(0,10)+'T12:00:00').getTime())/86400000); }
function spoLetzter(sid){ return SPO.K.find(k=>k.sponsor===sid)||null; }
function spoDarf(k){ return svDarf(k)===true; }

SVR_TAB.sponsoring='sponsoring';
if(typeof SV_SIDE!=='undefined')Object.keys(SV_SIDE).forEach(r=>{ const L=SV_SIDE[r]; if(L.includes('Partner'))return; const i=L.indexOf('Verein'); L.splice(i<0?L.length-1:i+1,0,'Partner'); });
{ const _ta=svTabAllowed; svTabAllowed=function(t){ if(t==='sponsoring')return spoDarf('sponsoring'); return _ta.apply(this,arguments); }; }
SV_TBL.sponsoring=['heart','Partner'];
Object.assign(SV_PAGES,{sponsoring:['Partner','Firmen, Verträge, Ausrüstung und Banden']});
// Datum lokal rechnen (kein UTC-Versatz am späten Abend): 'JJJJ-MM-TT' plus n Tage bzw. Jahre
function paYmd(d){ return d.getFullYear()+'-'+String(d.getMonth()+1).padStart(2,'0')+'-'+String(d.getDate()).padStart(2,'0'); }
function paDatPlus(ymd,n){ const [y,m,t]=String(ymd||svtHeute()).slice(0,10).split('-').map(Number); return paYmd(new Date(y,m-1,t+n)); }
function paJahrPlus(ymd,n){ const [y,m,t]=String(ymd).slice(0,10).split('-').map(Number); const d=new Date(y,m-1,t,12); d.setFullYear(y+(n||1)); return paYmd(d); }
// Anrede in Nachrichten an Firmen: „Guten Tag Herr Beispiel,“, ohne Anrede „Guten Tag,“
// Seit 0.73 per Du: „Hallo Vorname,“, ohne Namen „Hallo,“. anrede (Frau/Herr) bleibt für Verträge, nicht für die Begrüßung.
function paAnrede(anrede,name){ const n=String(name||'').trim().split(/\s+/).filter(Boolean); return n.length?`Hallo ${n[0]},`:'Hallo,'; }
// Doppeltipp-Sperre für schreibende Knöpfe: sperren, Ladetext, danach wieder frei
async function paEinmal(b,fn,laedt){ if(!b)return fn(); if(b.dataset.laeuft==='1')return; b.dataset.laeuft='1'; const alt=b.innerHTML; b.disabled=true; if(laedt)b.textContent=laedt;
  try{ return await fn(); }finally{ b.dataset.laeuft=''; b.disabled=false; if(laedt&&b.isConnected)b.innerHTML=alt; } }
function spoPanel(){ let P=document.getElementById('panel-sponsoring'); if(P)return P;
  const ref=document.getElementById('panel-verein')||document.querySelector('.panel'); if(!ref)return null;
  P=document.createElement('section'); P.className='panel'; P.id='panel-sponsoring'; ref.parentNode.insertBefore(P,ref.nextSibling); return P; }
{ const _gt=goTab; goTab=function(tab){ if(tab==='sponsoring')spoPanel(); const r=_gt.apply(this,arguments); try{ if(svCurTab()==='sponsoring')spoRender(); }catch(e){ console.warn('Partner',e); } return r; }; }

async function spoLoad(force){
  if(SPO.busy||(!force&&SPO.loaded&&Date.now()-SPO.t<30000))return; SPO.busy=true;
  try{ const sb=SVB.sb;
    const [s,k,l,a,v,d,vd]=await Promise.all([sb.from('sponsoren').select('*').order('firma'),sb.from('sponsor_kontakte').select('*').order('am',{ascending:false}).order('erstellt_am',{ascending:false}).limit(2000),
      sb.from('sponsor_links').select('*').order('erstellt_am'),sb.from('ausruestung').select('*'),sb.from('sponsor_vertraege').select('*').order('erstellt_am',{ascending:false}),
      sb.from('sponsor_dokumente').select('id,vertrag,sponsor,art,name,erstellt_am'),sb.from('verein_daten').select('daten').maybeSingle()]);
    for(const x of [s,k,l,a,v,d]){ if(x.error)throw x.error; }
    SPO.S=s.data||[]; SPO.K=k.data||[]; SPO.L=l.data||[]; SPO.A=a.data||[]; SPO.V=v.data||[]; SPO.D=d.data||[]; SPO.verein=(vd.data&&vd.data.daten)||{};
    SPO.loaded=true; SPO.t=Date.now(); SPO.err=null;
  }catch(e){ SPO.err=String(e.message||e); console.warn('Partner laden',e); } finally{ SPO.busy=false; }
}
async function spoReload(){ await spoLoad(true); spoBody(); }

// Ein gemeinsamer, kompakter Kopf für alle Reiter: Titel „Partner“ und eine waagerecht wischbare Reiterleiste in einer Zeile.
// Die Zentrale (svm63) ist die Übersicht. Shop-Finanzen hängt svm56 hinten an.
const SPO_REITER=[['zentrale','Zentrale'],['steuerung','Steuerung'],['sponsoren','Firmen'],['decks','Präsentationen'],['ausruestung','Ausrüstung'],['banden','Banden'],['ablage','Ablage']];
function spoReiterAn(){ const seg=document.querySelector('#panel-sponsoring .spo-seg'); if(!seg)return;
  seg.querySelectorAll('[data-spov]').forEach(x=>{ const an=x.dataset.spov===SPO.view; x.classList.toggle('on',an); x.setAttribute('aria-selected',an?'true':'false'); });
  spoReiterZeigen(seg); }
// aktiven Reiter in der wischbaren Leiste sichtbar machen (nur waagerecht, die Seite springt nicht)
function spoReiterZeigen(seg){ try{ const b=seg.querySelector('.on'); if(b&&seg.scrollWidth>seg.clientWidth)seg.scrollLeft=Math.max(0,b.offsetLeft-(seg.clientWidth-b.offsetWidth)/2); }catch(e){} }
function spoWechsel(v){ SPO.view=v==='uebersicht'?'zentrale':v; spoReiterAn(); spoBody(); }
async function spoRender(){
  const P=spoPanel(); if(!P)return;
  if(SPO.view==='uebersicht')SPO.view='zentrale';
  if(!spoDarf('sponsoring')){ P.innerHTML='<div class="card"><div class="empty">Der Partner-Bereich ist für dich nicht freigeschaltet.</div></div>'; return; }
  P.innerHTML=`<div class="svt-top spo-top"><div class="spo-kopf"><h2>Partner</h2><p>Firmen, Verträge, Ausrüstung und Banden</p></div>
    <div class="svt-seg spo-seg" role="tablist" aria-label="Bereiche im Partnerbereich">${SPO_REITER.map(([k,l])=>`<button type="button" role="tab" aria-selected="${k===SPO.view}" class="${k===SPO.view?'on':''}" data-spov="${k}">${l}</button>`).join('')}</div></div><div id="spoB"><div class="card"><div class="empty">Lade …</div></div></div>`;
  P.querySelectorAll('[data-spov]').forEach(b=>b.onclick=()=>spoWechsel(b.dataset.spov));
  requestAnimationFrame(()=>spoReiterZeigen(P.querySelector('.spo-seg')));
  await spoLoad(); spoBody();
}
function spoBody(){ const B=document.getElementById('spoB'); if(!B)return;
  if(SPO.view==='uebersicht')SPO.view='zentrale';
  if(SPO.err&&!SPO.loaded){ B.innerHTML=`<div class="card"><div class="empty">Konnte nicht laden: ${svEsc(SPO.err)}</div></div>`; return; }
  try{ ({sponsoren:spoListe,ausruestung:spoAusruestung,banden:spoBanden,ablage:spoAblage}[SPO.view]||spoListe)(B); }catch(e){ console.warn(e); B.innerHTML='<div class="card"><div class="empty">Fehler beim Anzeigen.</div></div>'; } }

/* ---------- Alte Verträge (sponsor_vertraege, nur noch für den alten Assistenten) ---------- */
function spoAktiv(saison){ const s=+saison.slice(0,2); return SPO.V.filter(v=>v.status==='aktiv'&&+v.beginn.slice(0,2)<=s&&+v.beginn.slice(0,2)+v.saisons-1>=s); }

/* ---------- Firmen (von der Idee bis zum Partner) ---------- */
// Eine Firmenliste: dieselbe Zeile wie in der Zentrale (nächster Schritt mit Hauptknopf), fünf Filter, „Bestand“ als Etikett an der Zeile
const SPO_FILTER=[['offen','Unterwegs'],['partner','Partner'],['alt','Alte Struktur'],['neu','Neues Konzept'],['ohneges','Ohne Gespräch'],['abgesagt','Abgesagt'],['pausiert','Pausiert'],['alle','Alle']];
// Ohne Gespräch (Sven, 16.11.2026): Partner, bei denen seit der Neuausrichtung weder ein Anruf noch ein Treffen eingetragen ist. Stichtag ist wählbar und bleibt je Gerät stehen (Vorgabe: Saisonbeginn 01.07.2026).
function spoNeu(){ let v=''; try{ v=localStorage.getItem('sv_spo_neu')||''; }catch(e){} return /^\d{4}-\d\d-\d\d$/.test(v)?v:'2026-07-01'; }
function spoGespr(x,seit){ return SPO.K.some(k=>k.sponsor===x.id&&(k.art==='anruf'||k.art==='treffen')&&String(k.am||'')>=seit); }
function spoOhneGes(x){ return x.status==='partner'&&!spoGespr(x,spoNeu()); }
// Alte Struktur oder neues Konzept (Albert, 16.11.2026): Ziel ist das neue Konzept für alle Partner. Überführt heißt: ein unterschriebener oder aktiver Vertrag im neuen Vertragssystem (partner_vertraege). Wer Partner ist und so einen Vertrag noch nicht hat, gehört zur alten Struktur.
function spoNeuK(x){ if(!x||x.status!=='partner'||typeof PE==='undefined'||!PE.d)return false; const h=typeof svtHeute==='function'?svtHeute():new Date().toISOString().slice(0,10); return (PE.d.vertraege||[]).some(v=>v.sponsor===x.id&&v.art!=='spende'&&['unterschrieben','aktiv'].includes(v.status)&&(!v.ende||v.ende>=h)); }
function spoAlt(x){ return x.status==='partner'&&!spoNeuK(x); }
function spoZahl(k){ return k==='ohneges'?SPO.S.filter(spoOhneGes).length:k==='alt'?SPO.S.filter(spoAlt).length:k==='neu'?SPO.S.filter(spoNeuK).length:null; }
function spoChips(B){ B.querySelectorAll('[data-spoff]').forEach(b=>{ const k=b.dataset.spoff, n=spoZahl(k); if(n!==null)b.textContent=(SPO_FILTER.find(f=>f[0]===k)||[0,''])[1]+' ('+n+')'; }); }
function spoListe(B){
  const stat=['idee','angeschrieben','gespraech','angebot'].includes(SPO.flt)?SPO.flt:null;   // Station aus der Zentrale
  if(!stat&&!SPO_FILTER.some(f=>f[0]===SPO.flt))SPO.flt='offen';
  B.innerHTML=`<div class="pz pz-flach"><section class="pz-papier"><div class="svt-ch spo-fk"><label class="pz-such">${SVI('search')}<input type="search" id="spoQ" placeholder="Firma, Ansprechpartner, Branche" value="${svEsc(SPO.q)}" autocomplete="off" aria-label="Firmen durchsuchen"></label><button class="pz-b2 spo-neu" id="spoNeu" type="button">${SVI('plus')} Firma</button></div>
    <div class="spo-f2" role="group" aria-label="Auswahl">${(stat?[[stat,SPO_STL[stat]]]:[]).concat(SPO_FILTER).map(([k,l])=>`<button type="button" class="${SPO.flt===k?'on':''}" data-spoff="${k}" aria-pressed="${SPO.flt===k}">${l}${spoZahl(k)!==null?` (${spoZahl(k)})`:''}</button>`).join('')}</div>
    <div class="spo-ges" id="spoGes" hidden><label>Seit <input type="date" id="spoNeuD" value="${spoNeu()}" aria-label="Kein Anruf und kein Treffen seit"></label><span>kein Anruf und kein Treffen eingetragen</span></div>
    ${swxZeile('Stand weiter','abgesagt')}
    <div class="spo-l pz-liste"></div>
    <p class="spo-csvz"><button type="button" class="pz-b2" id="spoCsv">Auswahl als Excel-Datei laden</button><span>Die Liste hier ist die einzige Pflege. Die Datei ist nur ein Abzug zum Weitergeben.</span></p></section></div>`;
  // Suche zeichnet nur die Liste neu: Das Eingabefeld bleibt stehen, die Tastatur am iPhone bleibt offen
  const qi=B.querySelector('#spoQ'); qi.oninput=()=>{ SPO.q=qi.value; spoListeZeilen(B); };
  B.querySelector('#spoNeu').onclick=()=>spoForm(null);
  B.querySelector('#spoCsv').onclick=()=>spoCsv();
  const gz=()=>{ const g=B.querySelector('#spoGes'); if(g)g.hidden=SPO.flt!=='ohneges'; }; gz();
  B.querySelectorAll('[data-spoff]').forEach(b=>b.onclick=()=>{ SPO.flt=b.dataset.spoff; B.querySelectorAll('[data-spoff]').forEach(x=>{ x.classList.toggle('on',x===b); x.setAttribute('aria-pressed',x===b); }); gz(); spoListeZeilen(B); });
  const nd=B.querySelector('#spoNeuD'); if(nd)nd.onchange=()=>{ if(/^\d{4}-\d\d-\d\d$/.test(nd.value)){ try{ localStorage.setItem('sv_spo_neu',nd.value); }catch(e){} spoChips(B); spoListeZeilen(B); } };
  spoListeZeilen(B);
  // Die Verträge des neuen Systems kommen aus der Steuerung; sobald sie da sind, stimmen die Zahlen und die Auswahl
  if(typeof PE!=='undefined'&&!PE.d&&typeof peLaden==='function')peLaden().then(()=>{ if(B.isConnected&&SPO.view==='sponsoren'){ spoChips(B); spoListeZeilen(B); } }).catch(()=>{});
}
function spoListeZeilen(B){
  const H=B.querySelector('.spo-l'); if(!H)return; const q=SPO.q.trim().toLowerCase(), weg=['idee','angeschrieben','gespraech','angebot'];
  const L=SPO.S.filter(x=>SPO.flt==='alle'||(SPO.flt==='ohneges'?spoOhneGes(x):SPO.flt==='alt'?spoAlt(x):SPO.flt==='neu'?spoNeuK(x):SPO.flt==='offen'?weg.includes(x.status):x.status===SPO.flt))
    .filter(x=>!q||(x.firma+' '+(x.ansprechpartner||'')+' '+(x.branche||'')+' '+(x.ort||'')+' '+(x.notiz||'')).toLowerCase().includes(q))
    .sort((a,b)=>{ const i=weg.indexOf(a.status), j=weg.indexOf(b.status); if(j-i)return j-i;
      if(a.status==='idee'&&typeof pzWert==='function'){ const d=pzWert(b).rang-pzWert(a).rang; if(d)return d; }   // Ideen wie in der Zentrale nach Kriterienmatrix
      return String(a.firma).localeCompare(String(b.firma),'de'); });
  SPO.zeigt=L;
  H.innerHTML=L.map(x=>`<div class="spo-zr" data-spor="${svEsc(x.id)}">${pzZeile(x,false)}</div>`).join('')||'<p class="pz-leer">Keine Firmen in dieser Auswahl.</p>';
  if(typeof pzVerdrahten==='function')pzVerdrahten(H);
}
// Abzug der gerade gezeigten Auswahl für Excel (Semikolon, UTF-8 mit Kennung). Kein Datenabgleich zurück: gepflegt wird nur in der App.
function spoCsv(){ const L=SPO.zeigt||[]; const z=v=>'"'+String(v==null?'':v).replace(/"/g,'""').replace(/\r?\n/g,' ')+'"';
  const kopf=['Firma','Ansprechpartner','Funktion','E-Mail','Telefon','Straße','Ort','Branche','Stand','Bestandspartner','Konzept','Letzter Anruf oder Treffen','Nächster Schritt','Notiz'];
  const letzt=x=>{ const k=SPO.K.filter(k=>k.sponsor===x.id&&(k.art==='anruf'||k.art==='treffen')).map(k=>String(k.am||'')).sort().pop(); return k?k.slice(8,10)+'.'+k.slice(5,7)+'.'+k.slice(0,4):''; };
  const zeilen=L.map(x=>[x.firma,x.ansprechpartner,x.funktion,x.email,x.telefon,x.strasse,x.ort,x.branche,SPO_STL[x.status]||x.status,x.bestand?'ja':'nein',x.status!=='partner'?'':spoNeuK(x)?'neu':'alt',letzt(x),x.naechster,x.notiz].map(z).join(';'));
  const txt='\ufeff'+[kopf.map(z).join(';')].concat(zeilen).join('\r\n');
  const a=document.createElement('a'); a.href=URL.createObjectURL(new Blob([txt],{type:'text/csv;charset=utf-8'})); const d=new Date(); a.download='partner-'+d.toISOString().slice(0,10)+'.csv'; document.body.appendChild(a); a.click(); a.remove(); setTimeout(()=>URL.revokeObjectURL(a.href),4000); }
// Stand ändern. Mit log entsteht ein Verlaufseintrag; zurück kommt dessen id, damit Rückgängig genau diesen Eintrag wieder löscht.
async function spoStatus(x,st,log){
  const {error}=await SVB.sb.from('sponsoren').update({status:st,geaendert_am:new Date().toISOString()}).eq('id',x.id); if(error)throw error;
  if(!log)return null;
  const r=await SVB.sb.from('sponsor_kontakte').insert({sponsor:x.id,art:'sonst',notiz:'Stand: '+SPO_STL[st]}).select('id').single(); if(r.error)throw r.error;
  return r.data&&r.data.id||null;
}
async function spoStatusZurueck(x,alt,logId){
  await spoStatus(x,alt,false);
  if(logId){ const {error}=await SVB.sb.from('sponsor_kontakte').delete().eq('id',logId); if(error)console.warn('Verlauf zurück',error); }
}
swxAdd('[data-spor]',el=>{
  const x=SPO.S.find(s=>s.id===el.dataset.spor); if(!x)return null; const next=SPO_WEITER[x.status];
  return {
    l:next&&next!=='partner'?{ic:'→',t:SPO_STL[next],tone:'ok',fn:async()=>{ const alt=x.status; const lid=await spoStatus(x,next,true); await spoReload();
      kToast(x.firma+': '+SPO_STL[next],'Rückgängig',async()=>{ await spoStatusZurueck(x,alt,lid); await spoReload(); }); }}:null,
    r:x.status!=='abgesagt'&&!spoLaeuft(x.id)?{ic:'✕',t:'Abgesagt',tone:'no',fn:async()=>{ if(typeof peLaden==='function')await peLaden().catch(()=>{}); const lv=spoLaeuft(x.id); if(lv){ kToast(spoLaeuftHin(lv)); return; }
      const alt=x.status; const lid=await spoStatus(x,'abgesagt',true); await spoReload();
      kToast(x.firma+': abgesagt','Rückgängig',async()=>{ await spoStatusZurueck(x,alt,lid); await spoReload(); }); }}:null };
});

function spoSponsor(id){
  const x=SPO.S.find(s=>s.id===id); if(!x)return; const K=SPO.K.filter(k=>k.sponsor===id), L=SPO.L.filter(l=>l.sponsor===id), V=SPO.V.filter(v=>v.sponsor===id);
  // Akte in den Vereinsfarben (Navy, Orange, Creme), Avatar wie in der Zentrale
  const kz=typeof pzKurz==='function'?pzKurz(x.firma):x.firma.slice(0,2).toUpperCase(), kf=typeof pzFarbe==='function'?pzFarbe(x.firma):'#1d2760';
  const M=svModal(`<div class="spo-akte"><div class="mhead"><div class="spo-av pz-lg" style="--lc:${kf}">${svEsc(kz)}</div><div><h2 style="margin:0">${svEsc(x.firma)}</h2>
      <div class="msub">${[x.ansprechpartner&&(x.ansprechpartner+(x.funktion?' ('+x.funktion+')':'')),x.branche,x.bestand?'Bestandspartner':''].filter(Boolean).map(svEsc).join(' · ')}</div></div></div>
    ${spoAkteSchritt(x)}
    <p class="spo-stand">Stand: <b>${svEsc(SPO_STL[x.status]||x.status)}</b> · <button type="button" class="spo-link" id="spoStA" aria-expanded="false">ändern</button></p>
    <div class="spo-stbar" id="spoStB" hidden>${SPO_ST.map(([k,l])=>`<button type="button" class="${x.status===k?'on s-'+k:''}" data-spost="${k}" aria-pressed="${x.status===k}">${l}</button>`).join('')}</div>
    <div class="spo-frage" id="spoPF" hidden><p><b>Ohne Vertrag als Partner führen?</b> Das ist nur für alte Partner gedacht. Neue Partner kommen über den Vertrag dazu.</p>
      <div class="btnrow">${spoDarf('sponsoring:vertrag')&&typeof spoVertragLos==='function'?`<button class="btn sm" type="button" id="spoPFv">${SVI('file')} Vertrag abschließen</button>`:''}<button class="btn sm ghost" type="button" id="spoPFj">Ja, alter Partner</button><button class="btn sm ghost" type="button" id="spoPFn">Abbrechen</button></div></div>
    <div class="spo-kont"><span>Kontakt eintragen:</span>${['mail','anruf','treffen','whatsapp','brief','angebot'].map(a=>`<button type="button" data-spoka="${a}">${spoArtIc(a)} ${SPO_ART[a][1]}</button>`).join('')}</div>
    <div class="spo-kn" id="spoKN" hidden><input id="spoKNt" maxlength="1000" placeholder="Kurze Notiz, freiwillig"><input id="spoKNd" type="date" value="${svtHeute()}"><button class="btn sm" id="spoKNs" type="button">Eintragen</button></div>
    <div class="spo-info">${[x.email?`<a href="mailto:${svEsc(x.email)}">${svEsc(x.email)}</a>`:'',x.telefon?`<a href="tel:${svEsc(x.telefon)}">${svEsc(x.telefon)}</a>`:'',x.web?`<a href="${svEsc(/^https?:/.test(x.web)?x.web:'https://'+x.web)}" target="_blank" rel="noopener">${svEsc(x.web)}</a>`:'',[x.strasse,x.ort].filter(Boolean).map(svEsc).join(', ')].filter(Boolean).join(' · ')||'<span class="note">Noch keine Kontaktdaten.</span>'}</div>
    ${x.notiz?`<p class="note">${svEsc(x.notiz)}</p>`:''}
    ${(()=>{ const vt=spoDarf('sponsoring:vertrag')&&typeof spoVertragLos==='function'?`<button class="btn sm ghost" id="spoVt" type="button" title="Öffnet die persönliche Präsentation der Firma zum Unterschreiben">${SVI('file')} Vertrag abschließen</button>`:'', vorn=['gespraech','angebot'].includes(x.status);
      return `<div class="btnrow spo-akt2">${vorn?vt:''}<details class="pd-mehr spo-mehr"><summary aria-label="Mehr zu ${svEsc(x.firma)}">…</summary><div><button class="btn sm ghost" id="spoEd" type="button">Bearbeiten</button>${typeof ptStart==='function'?`<button class="btn sm ghost" id="spoTer" type="button">${SVI('cal')} Termin vorbereiten</button>`:''}${vorn?'':vt}</div></details></div>`; })()}
    <div id="spoAV">${spoAkteVertraege(id)}</div>
    ${V.length?`<h4 class="svt-h4">Ältere Verträge</h4>${V.map(v=>{ const Ds=SPO.D.filter(d=>d.vertrag===v.id); return `<div class="spo-v"><div><b>${svEsc(v.nr)} · ${svEsc(SPO_STUFE[v.stufe].t)}</b><span>${svtSL(v.beginn)}, ${v.saisons} Saison${v.saisons>1?'s':''} · ${spoEur(v.netto_saison,true)} netto je Saison · ${v.zahlung==='sepa'?'SEPA':'Rechnung'} · unterschrieben ${spoDat(v.unterschrieben_am)}</span></div>
      <div class="btnrow">${Ds.map(d=>`<button class="btn sm ghost" type="button" data-spodoc="${svEsc(d.id)}">${SVI('download')} ${d.art==='vertrag_voll'?'PDF mit Bankdaten':'PDF'}</button>`).join('')}</div></div>`; }).join('')}`:''}
    <h4 class="svt-h4">Ablage <button class="btn sm ghost" id="spoLA" type="button">${SVI('plus')} Link</button></h4>
    ${L.map(l=>spoLinkHtml(l)).join('')||'<p class="note small">Links zu Präsentation, Logo oder Angebot, egal in welcher Cloud.</p>'}
    <h4 class="svt-h4">Verlauf</h4><div class="spo-log">${K.map(k=>`<div><span>${spoDat(k.am)}</span><b><i class="spo-ai">${spoArtIc(k.art)}</i> ${svEsc((SPO_ART[k.art]||SPO_ART.sonst)[1])}</b>${k.notiz?`<em>${svEsc(k.notiz)}</em>`:''}</div>`).join('')||`<p class="note small">${x.status==='idee'?'Noch kein Kontakt. Wenn du schreibst oder anrufst, tipp oben kurz darauf.':'Noch nichts vermerkt. Tipp oben auf Mail, Anruf oder Treffen, dann weiß das ganze Team Bescheid.'}</p>`}</div></div>`);
  // Stand: gleicher Stand schreibt nichts, Doppeltipp gesperrt. „Partner“ nur über den Vertrag oder als alter Partner nach Rückfrage.
  const stand=async st=>{ try{ await spoStatus(x,st,true); await spoLoad(true); spoSponsor(id); spoBody(); }catch(e){ kToast('⚠️ '+e.message); } };
  const pf=M.querySelector('#spoPF'), sb=M.querySelector('#spoStB'), sa=M.querySelector('#spoStA');
  sa.onclick=()=>{ sb.hidden=!sb.hidden; sa.setAttribute('aria-expanded',String(!sb.hidden)); };
  const ns=M.querySelector('#spoNs'); if(ns)ns.onclick=()=>{ closeOverlay(); setTimeout(()=>pzLos(x.id,ns.dataset.pzk),60); };
  const tr=M.querySelector('#spoTer'); if(tr)tr.onclick=()=>{ closeOverlay(); setTimeout(()=>ptStart(typeof pzVor==='function'?pzVor(x):{id:x.id,firma:x.firma}),80); };
  M.querySelectorAll('[data-spost]').forEach(b=>b.onclick=()=>paEinmal(b,async()=>{ const st=b.dataset.spost; if(st===x.status)return;
    if(typeof peLaden==='function')await peLaden().catch(()=>{});   // erst wissen, ob es einen Vertrag gibt (Akte direkt nach dem Start)
    if(st==='partner'&&!spoHatVertrag(id)){ pf.hidden=false; pf.scrollIntoView({block:'nearest'}); return; }
    const lv=['abgesagt','pausiert'].includes(st)&&spoLaeuft(id); if(lv){ kToast(spoLaeuftHin(lv)); return; }
    await stand(st); }));
  const pfv=M.querySelector('#spoPFv'); if(pfv)pfv.onclick=()=>paEinmal(pfv,()=>spoVertragLos(x));
  M.querySelector('#spoPFn').onclick=()=>{ pf.hidden=true; };
  const pfj=M.querySelector('#spoPFj'); pfj.onclick=()=>paEinmal(pfj,async()=>{ try{ const {error}=await SVB.sb.from('sponsoren').update({bestand:true,geaendert_am:new Date().toISOString()}).eq('id',x.id); if(error)throw error; x.bestand=true; }catch(e){ kToast('⚠️ '+e.message); return; } await stand('partner'); });
  let art=null; const kn=M.querySelector('#spoKN');
  M.querySelectorAll('[data-spoka]').forEach(b=>b.onclick=()=>{ art=b.dataset.spoka; M.querySelectorAll('[data-spoka]').forEach(y=>y.classList.toggle('on',y===b)); kn.hidden=false; M.querySelector('#spoKNt').focus(); });
  const kns=M.querySelector('#spoKNs'); kns.onclick=()=>paEinmal(kns,async()=>{ if(!art){ kToast('Bitte zuerst wählen, wie ihr Kontakt hattet: Mail, Anruf, Treffen, WhatsApp, Brief oder Angebot.'); return; } try{
      const {error}=await SVB.sb.from('sponsor_kontakte').insert({sponsor:id,art,am:M.querySelector('#spoKNd').value||svtHeute(),notiz:M.querySelector('#spoKNt').value.trim()||null}); if(error)throw error;
      if(x.status==='idee'&&['mail','brief','whatsapp','anruf'].includes(art))await spoStatus(x,'angeschrieben',false);
      if(art==='angebot'&&['idee','angeschrieben','gespraech'].includes(x.status))await spoStatus(x,'angebot',false);
      if(art==='treffen'&&['idee','angeschrieben'].includes(x.status))await spoStatus(x,'gespraech',false);
      kToast('✓ '+SPO_ART[art][1]+' eingetragen'); await spoLoad(true); spoSponsor(id); spoBody(); }catch(e){ kToast('⚠️ '+e.message); } },'Speichert …');
  M.querySelector('#spoEd').onclick=()=>spoForm(x);
  const vt=M.querySelector('#spoVt'); if(vt)vt.onclick=()=>paEinmal(vt,()=>spoVertragLos(x));
  // Verträge kommen aus der Partner-Engine; ist sie noch nicht geladen, wird der Abschnitt nachgezeichnet
  const avDraht=()=>{ M.querySelectorAll('[data-spogz]').forEach(b=>b.onclick=()=>peGegenzeichnen((PE.d.vertraege||[]).find(v=>v.id===b.dataset.spogz)));
    M.querySelectorAll('[data-spoann]').forEach(b=>b.onclick=()=>peAnnehmen((PE.d.vertraege||[]).find(v=>v.id===b.dataset.spoann)));
    M.querySelectorAll('[data-spoab]').forEach(b=>b.onclick=()=>peAblehnen((PE.d.vertraege||[]).find(v=>v.id===b.dataset.spoab)));
    // Angebot zurückziehen: wie „Abgelehnt“ in der Steuerung, mit Rückgängig
    M.querySelectorAll('[data-spozz]').forEach(b=>b.onclick=()=>paEinmal(b,async()=>{ if(!await peBestaetigen('Angebot zurückziehen?','Die angebotenen Flächen werden wieder frei, und die Firma steht danach auf Abgesagt. Zurücknehmen geht nur in den nächsten zehn Minuten.',{ja:'Ja, zurückziehen'}))return;
      try{ await svtRpc('partner_vertrag_status',{p_vertrag:b.dataset.spozz,p_status:'abgelehnt',p_datum:null,p_notiz:'Angebot zurückgezogen'}); await peLaden(true); await spoLoad(true); spoBody();
        kToast('Angebot zurückgezogen','Rückgängig',async()=>{ try{ await svtRpc('partner_vertrag_status',{p_vertrag:b.dataset.spozz,p_status:'angebot',p_datum:null,p_notiz:null}); await peLaden(true); await spoLoad(true); spoBody(); kToast('Angebot gilt wieder'); }catch(e){ kToast('⚠️ '+(e.message||e)); } }); }
      catch(e){ kToast('⚠️ '+(e.message||e)); } }));
    // Die Annahme muss der Firma zugehen: Vertrag mit beiden Unterschriften erneut schicken
    M.querySelectorAll('[data-spomail]').forEach(b=>b.onclick=()=>paEinmal(b,async()=>{ try{ const {data,error}=await SVB.sb.functions.invoke('partner-deck',{body:{vertrag:b.dataset.spomail,nochmal:true}}); if(error)throw error;
      kToast(data&&data.ok?'✓ Vertrag mit beiden Unterschriften ist raus'+(data.an?' an '+data.an:''):'⚠️ '+((data&&data.fehler)||'Die Mail ging nicht raus')); if(typeof peLaden==='function')await peLaden(true); }catch(e){ kToast('⚠️ '+(e.message||e)); } },'Schickt …'));
    M.querySelectorAll('[data-spovpdf]').forEach(b=>b.onclick=()=>paEinmal(b,()=>spoVertragPdf(b.dataset.spovpdf))); };
  avDraht();
  if(typeof PE!=='undefined'&&!PE.d&&typeof peLaden==='function')peLaden().then(()=>{ const h=M.querySelector('#spoAV'); if(h&&h.isConnected){ h.innerHTML=spoAkteVertraege(id); avDraht(); } }).catch(()=>{});
  M.querySelector('#spoLA').onclick=()=>spoLinkForm(id,()=>spoSponsor(id));
  spoLinkWire(M,()=>spoSponsor(id));
  M.querySelectorAll('[data-spodoc]').forEach(b=>b.onclick=()=>spoDokument(b.dataset.spodoc));
}
// Ganz oben in der Akte derselbe nächste Schritt wie in der Zeile der Zentrale, als einziger oranger Knopf
function spoAkteSchritt(x){ if(typeof pzSchritt!=='function'||['abgesagt','pausiert'].includes(x.status))return '';
  const s=pzSchritt(x); if(s.k==='akte')return '';
  // wartet auf eure Unterschrift, aber ohne das Recht dazu: kein Knopf, nur der Hinweis
  if((s.k==='gegen'&&!PE.d.darf_gegenzeichnen)||(s.k==='gz-ab'&&!PE.d.darf_vertrag))return `<p class="spo-stand"><b>${svEsc(s.h)}.</b></p>`;
  const fl=x.faellig&&!['gegen','gz-ab'].includes(s.k)?(x.faellig<svtHeute()?'Fällig seit ':'Fällig am ')+spoDat(x.faellig):s.h;
  return `<div class="spo-next2"><button type="button" class="btn" id="spoNs" data-pzk="${svEsc(s.k)}">${SVI(s.ic)} ${svEsc(s.t)}</button>${fl?`<small>${svEsc(fl)}</small>`:''}</div>`; }
// Laufender Vertrag oder offenes Angebot: dann kein „Abgesagt“ oder „Pausiert“ (der Server lehnt es auch ab)
function spoLaeuft(id){ const h=svtHeute(); return typeof PE!=='undefined'&&PE.d&&(PE.d.vertraege||[]).find(v=>v.sponsor===id&&['angebot','unterschrieben','aktiv'].includes(v.status)&&(!v.ende||v.ende>=h))||null; }
function spoLaeuftHin(v){ return v&&v.status==='angebot'?'Für diese Firma ist noch ein Angebot offen. Bitte in der Akte „Angebot zurückziehen“ tippen, dann steht sie auf Abgesagt.'
  :v&&v.status==='unterschrieben'?'Für diese Firma liegt noch ein unterschriebener Vertrag. Wenn ihr ihn nicht wollt, in der Akte „Nicht annehmen“ tippen.'
  :'Für diese Firma läuft noch ein Vertrag. Bitte in der Steuerung bei der Verlängerung „Verlängert nicht“ eintragen, dann endet er zum vereinbarten Tag.'; }
// Verträge der Firma aus der Partner-Engine (eine Quelle für alle Zahlen), mit Gegenzeichnen und PDF
function spoHatVertrag(id){ return typeof PE!=='undefined'&&PE.d&&(PE.d.vertraege||[]).some(v=>v.sponsor===id&&v.status==='aktiv'); }   // Partner erst mit geschlossenem Vertrag
function spoAkteVertraege(id){
  if(typeof PE==='undefined')return '';
  if(!PE.d)return '<h4 class="svt-h4">Verträge</h4><p class="note small">Lade …</p>';
  const V=(PE.d.vertraege||[]).filter(v=>v.sponsor===id&&v.status!=='storniert'); if(!V.length)return '';
  const st={angebot:'Angebot',unterschrieben:'unterschrieben',aktiv:'aktiv',beendet:'beendet',abgelehnt:'abgelehnt'}, dv=!!PE.d.darf_vertrag;
  // seit 0.74: „unterschrieben“ heißt, die Firma hat angeboten; geschlossen ist der Vertrag erst mit eurer Unterschrift
  return `<h4 class="svt-h4">Verträge</h4>${V.map(v=>{ const gz=v.status==='unterschrieben'&&!v.hat_unterschrift_verein&&!v.gegengezeichnet_am&&v.art!=='spende';
    return `<div class="spo-v${gz?' spo-wartet':''}"><div><b>${svEsc(v.nr)}${v.art==='spende'?' · Spende':''} · ${gz?'<em class="spo-gz">wartet auf eure Unterschrift</em>':svEsc(st[v.status]||v.status)}</b>
    <span>${svEsc((v.positionen||[]).map(p=>p.titel).join(', '))}${v.netto_jahr?' · '+spoEur(v.netto_jahr,true)+' netto je Saison':v.netto_gesamt?' · '+spoEur(v.netto_gesamt,true):''}${v.ende?' · bis '+spoDat(v.ende):''}${v.gegengezeichnet_am?' · geschlossen '+spoDat(v.gegengezeichnet_am):gz?' · noch nicht geschlossen':''}</span></div>
    <div class="btnrow">${gz&&PE.d.darf_gegenzeichnen&&typeof peGegenzeichnen==='function'?(v.hat_unterschrift_partner?`<button class="btn sm" type="button" data-spogz="${svEsc(v.id)}">${SVI('check')} Gegenzeichnen</button>`:`<button class="btn sm" type="button" data-spoann="${svEsc(v.id)}">${SVI('check')} Annehmen</button>`):''}${gz&&dv&&typeof peAblehnen==='function'?`<button class="btn sm ghost" type="button" data-spoab="${svEsc(v.id)}">Nicht annehmen</button>`:''}${v.status==='angebot'&&dv?`<button class="btn sm ghost" type="button" data-spozz="${svEsc(v.id)}">Angebot zurückziehen</button>`:''}${v.status==='aktiv'&&v.gegengezeichnet_am&&v.art!=='spende'?`<button class="btn sm ghost" type="button" data-spomail="${svEsc(v.id)}">${SVI('mail')} Vertrag erneut schicken</button>`:''}<button class="btn sm ghost" type="button" data-spovpdf="${svEsc(v.id)}">${SVI('download')} PDF</button></div></div>`; }).join('')}`;
}
// PDF eines Vertrags (mit Rechnung) aus partner-deck, ohne Mail
async function spoVertragPdf(id){
  try{ const {data,error}=await SVB.sb.functions.invoke('partner-deck',{body:{vertrag:id,nurPdf:true}}); if(error)throw error; if(!data||!data.pdf)throw new Error('Kein PDF');
    const bin=atob(data.pdf), u8=new Uint8Array(bin.length); for(let i=0;i<bin.length;i++)u8[i]=bin.charCodeAt(i); spoDownload(new Blob([u8],{type:'application/pdf'}),data.name||'Vertrag.pdf'); }
  catch(e){ kToast('⚠️ PDF geht gerade nicht: '+(e.message||e)); } }
function spoForm(x){
  // „Partner“ im Stand gibt es nur mit Vertrag: erst die Verträge laden, sonst fehlt die Option bei echten Partnern
  if(x&&x.id&&typeof PE!=='undefined'&&!PE.d&&typeof peLaden==='function'){ peLaden().catch(()=>{}).then(()=>spoForm(x)); return; }
  x=x||{status:'idee'};
  const M=svModal(`<div class="mhead"><div><h2 style="margin:0">${x.id?svEsc(x.firma)+' bearbeiten':'Neue Firma'}</h2></div></div>
    <form id="spoF" class="editgrid svt-form" autocomplete="off">
      <div class="field" style="grid-column:1/-1"><label>Firma *</label><input name="firma" required maxlength="120" value="${svEsc(x.firma||'')}"></div>
      <div class="field"><label>Anrede</label><select name="anrede"><option value="">Bitte wählen</option><option${x.anrede==='Frau'?' selected':''}>Frau</option><option${x.anrede==='Herr'?' selected':''}>Herr</option></select></div>
      <div class="field"><label>Ansprechpartner</label><input name="ansprechpartner" maxlength="80" placeholder="Vor- und Nachname" value="${svEsc(x.ansprechpartner||'')}"></div>
      <div class="field"><label>Funktion</label><input name="funktion" maxlength="60" value="${svEsc(x.funktion||'')}"></div>
      <div class="field"><label>E-Mail</label><input name="email" type="email" maxlength="120" value="${svEsc(x.email||'')}"></div>
      <div class="field"><label>Telefon</label><input name="telefon" type="tel" maxlength="40" value="${svEsc(x.telefon||'')}"></div>
      <div class="field"><label>Straße, Nr.</label><input name="strasse" maxlength="120" value="${svEsc(x.strasse||'')}"></div>
      <div class="field"><label>PLZ, Ort</label><input name="ort" maxlength="80" value="${svEsc(x.ort||'')}"></div>
      <div class="field"><label>Website / Instagram</label><input name="web" maxlength="160" value="${svEsc(x.web||'')}"></div>
      <div class="field"><label>Branche</label><input name="branche" maxlength="60" value="${svEsc(x.branche||'')}"></div>
      <div class="field"><label>Stand</label><select name="status">${SPO_ST.filter(([k])=>k!=='partner'||x.status==='partner'||x.bestand||(x.id&&spoHatVertrag(x.id))).map(([k,l])=>`<option value="${k}"${x.status===k?' selected':''}>${l}</option>`).join('')}</select>
        ${x.status==='partner'||x.bestand||(x.id&&spoHatVertrag(x.id))?'':'<small class="note">„Partner“ wird eine Firma über den Vertrag. Alte Partner: Häkchen „Bestandspartner“ setzen.</small>'}</div>
      <label class="svt-cb"><input type="checkbox" name="bestand"${x.bestand?' checked':''}> Bestandspartner</label>
      <div class="field"><label>Dürfen wir sie öffentlich als Partner nennen</label><select name="nennung">${[['offen','Noch nicht gefragt'],['ja','Ja, wir dürfen'],['nein','Nein, lieber nicht']].map(([k,l])=>`<option value="${k}"${(x.nennung||'offen')===k?' selected':''}>${l}</option>`).join('')}</select>
        <small class="note">Nur der Firmenname, nur auf unseren eigenen Seiten. Mit „Ja“ steht die Firma in der Infobox „Aktuelle Partner“ in der Partner-Präsentation.</small></div>
      <div class="field"><label>Nächster Schritt</label><input name="naechster" maxlength="200" placeholder="z.B. Präsentation schicken" value="${svEsc(x.naechster||'')}"></div>
      <div class="field"><label>Bis wann</label><input name="faellig" type="date" value="${svEsc(x.faellig||'')}"></div>
      <div class="field" style="grid-column:1/-1"><label>Notiz</label><textarea name="notiz" rows="3" maxlength="2000">${svEsc(x.notiz||'')}</textarea></div>
      <div class="btnrow sbact" style="grid-column:1/-1"><button class="btn" type="submit">Speichern</button>${x.id?'<button class="btn ghost" type="button" id="spoDel">Löschen</button>':''}<button class="btn ghost" type="button" id="spoX">Abbrechen</button></div></form>`);
  M.querySelector('#spoX').onclick=()=>x.id?spoSponsor(x.id):closeOverlay();
  const del=M.querySelector('#spoDel'); if(del)del.onclick=async()=>{ if(del.dataset.sure!=='1'){ del.dataset.sure='1'; del.textContent='Wirklich löschen?'; return; }
    const {error}=await SVB.sb.from('sponsoren').delete().eq('id',x.id); if(error)return kToast('⚠️ '+(/foreign|violates/.test(error.message)?'Mit Vertrag nicht löschbar. Stand auf „Pausiert“ setzen.':error.message)); closeOverlay(); spoReload(); };
  M.querySelector('#spoF').onsubmit=async e=>{ e.preventDefault(); const fd=new FormData(e.target), r={};
    ['firma','anrede','ansprechpartner','funktion','email','telefon','strasse','ort','web','branche','status','naechster','faellig','notiz'].forEach(k=>{ const v=String(fd.get(k)||'').trim(); r[k]=v||null; });
    r.firma=r.firma||''; r.status=r.status||'idee'; r.bestand=fd.has('bestand'); r.geaendert_am=new Date().toISOString();
    { const nn=String(fd.get('nennung')||'offen'); if(['offen','ja','nein'].includes(nn)){ r.nennung=nn; if(nn!==(x.nennung||'offen'))r.nennung_am=new Date().toISOString(); } }
    const q=x.id?SVB.sb.from('sponsoren').update(r).eq('id',x.id).select().single():SVB.sb.from('sponsoren').insert(r).select().single();
    const {data,error}=await q; if(error)return kToast('⚠️ '+(/duplicate|unique/.test(error.message)?'Diese Firma gibt es schon':error.message));
    kToast('✓ Gespeichert'); await spoLoad(true); spoBody(); spoSponsor(data.id); };
}
/* Links: jede Cloud, die App merkt sich nur den Link */
function spoLinkHtml(l){ return `<div class="spo-link"><a href="${svEsc(l.url)}" target="_blank" rel="noopener"><b>${svEsc(l.titel)}</b><span>${svEsc(SPO_LINKART[l.art]||'Link')} · ${svEsc(spoAnbieter(l.url))}</span></a><button type="button" class="svt-x" data-spolx="${svEsc(l.id)}" aria-label="Link entfernen">✕</button></div>`; }
function spoLinkWire(M,nachher){ M.querySelectorAll('[data-spolx]').forEach(b=>b.onclick=async()=>{ const l=SPO.L.find(y=>y.id===b.dataset.spolx); const {error}=await SVB.sb.from('sponsor_links').delete().eq('id',b.dataset.spolx); if(error)return kToast('⚠️ '+error.message);
  await spoLoad(true); nachher&&nachher(); kToast('Link entfernt','Rückgängig',async()=>{ if(l){ await SVB.sb.from('sponsor_links').insert({sponsor:l.sponsor,titel:l.titel,url:l.url,art:l.art}); await spoLoad(true); nachher&&nachher(); } }); }); }
function spoLinkForm(sid,nachher){
  const M=svModal(`<div class="mhead"><div><h2 style="margin:0">Link ablegen</h2><div class="msub">Freigabe-Link aus Google Drive, iCloud, OneDrive, Dropbox oder einer Website. Die Datei bleibt, wo sie ist.</div></div></div>
    <form id="spoLF" class="editgrid svt-form"><div class="field" style="grid-column:1/-1"><label>Link *</label><input name="url" type="url" required placeholder="https://…" maxlength="600"></div>
      <div class="field"><label>Titel *</label><input name="titel" required maxlength="120" placeholder="z.B. Präsentation 2026"></div>
      <div class="field"><label>Art</label><select name="art">${Object.entries(SPO_LINKART).map(([k,l])=>`<option value="${k}">${l}</option>`).join('')}</select></div>
      <p class="note small" id="spoLAn" style="grid-column:1/-1"></p>
      <div class="btnrow sbact" style="grid-column:1/-1"><button class="btn" type="submit">Speichern</button><button class="btn ghost" type="button" id="spoX">Abbrechen</button></div></form>`);
  const u=M.querySelector('[name=url]'); u.oninput=()=>{ M.querySelector('#spoLAn').textContent=u.value?'Erkannt: '+spoAnbieter(u.value):''; };
  M.querySelector('#spoX').onclick=()=>nachher?nachher():closeOverlay();
  M.querySelector('#spoLF').onsubmit=async e=>{ e.preventDefault(); const fd=new FormData(e.target), url=String(fd.get('url')).trim();
    if(!/^https:\/\//.test(url))return kToast('Bitte einen Link mit https:// einfügen');
    const {error}=await SVB.sb.from('sponsor_links').insert({sponsor:sid,url,titel:String(fd.get('titel')).trim(),art:fd.get('art')}); if(error)return kToast('⚠️ '+error.message);
    kToast('✓ Link abgelegt'); await spoLoad(true); nachher?nachher():(closeOverlay(),spoBody()); };
}

/* ---------- Ausrüstung je Mannschaft ---------- */
function spoAusruestung(B){
  const teams=[{id:'h1',kurz:'I',name:'1. Mannschaft'}].concat((SVR.mann||[]).filter(m=>m.id!=='h1')), A=SPO.A;
  const offen=A.filter(a=>a.bedarf&&!/nicht erforderlich/i.test(a.bedarf)&&!/über den Verein/i.test(a.notiz||''));
  const jahre=[...new Set(offen.map(a=>a.jahr).filter(Boolean))].sort();
  const gesucht=a=>!!(a&&a.bedarf&&!a.sponsor&&!/nicht erforderlich/i.test(a.bedarf));
  const zelle=(m,art)=>{ const a=A.find(x=>x.mannschaft===m&&x.art===art);
    if(!a)return `<button type="button" class="spo-a leer" data-spoa="${m}|${art}" aria-label="Eintragen">+</button>`;
    const such=gesucht(a);
    return `<button type="button" class="spo-a${such?' such':a.sponsor?' ok':''}" data-spoa="${m}|${art}">${a.sponsor?`<b>${svEsc(a.sponsor)}</b>`:a.vorhanden?'<b>vorhanden</b>':''}${a.bedarf?`<span>${svEsc(a.bedarf)}</span>`:''}${such?'<em>Partner gesucht</em>':''}${a.jahr||a.betrag?`<small>${a.jahr||''}${a.betrag?' · '+spoEur(a.betrag):''}</small>`:''}</button>`; };
  // Handy: je Mannschaft eine Karte mit drei Zeilen. Oben „Nur Partner gesucht“.
  const kteams=teams.filter(m=>!SPO.ausNur||Object.keys(SPO_AUS).some(k=>gesucht(A.find(x=>x.mannschaft===m.id&&x.art===k))));
  const kzeile=(m,art)=>{ const a=A.find(x=>x.mannschaft===m&&x.art===art), such=gesucht(a);
    if(SPO.ausNur&&!such)return '';
    return `<div class="spo-akz${such?' such':''}"><div><b>${svEsc(SPO_AUS[art])}</b><span>${a?[a.sponsor?svEsc(a.sponsor):a.vorhanden?'vorhanden':'',a.bedarf?svEsc(a.bedarf):'',a.jahr||a.betrag?`${a.jahr||''}${a.betrag?' · '+spoEur(a.betrag):''}`:''].filter(Boolean).join(' · ')||'offen':'noch nichts eingetragen'}</span>
      ${such?'<em class="spo-gesucht">Partner gesucht</em>':''}</div><button type="button" class="btn sm ghost" data-spoa="${m}|${art}">${such?'Partner eintragen':a?'Ändern':'Eintragen'}</button></div>`; };
  B.innerHTML=`<div class="card"><h3 class="trh">${SVI('shield')} Ausrüstung und Werbeflächen</h3>
      <p class="note">Wer trägt welchen Partner, wo fehlt etwas. „Partner gesucht“ ist ein guter Aufhänger fürs Gespräch, zum Beispiel für eine Trikotsatz-Patenschaft. Antippen zum Bearbeiten.</p>
      ${jahre.length?`<div class="spo-kpis sm">${jahre.map(j=>{ const L=offen.filter(a=>a.jahr===j); return `<div class="spo-kpi"><b>${spoEur(L.reduce((s,a)=>s+(+a.betrag||0),0))}</b><span>für ${j} noch ohne Partner, ${L.length} ${L.length===1?'Teil':'Teile'}</span></div>`; }).join('')}</div>`:''}
      <div class="chips4 spo-af"><button type="button" class="${SPO.ausNur?'':'on'}" data-spoan="0">Alle Mannschaften</button><button type="button" class="${SPO.ausNur?'on':''}" data-spoan="1">Nur Partner gesucht</button></div>
      <div class="svt-tw spo-at-w"><table class="spo-at"><thead><tr><th>Team</th>${Object.values(SPO_AUS).map(t=>`<th>${t}</th>`).join('')}</tr></thead><tbody>
      ${kteams.map(m=>`<tr><th>${svEsc(m.kurz)}<small>${svEsc(m.name)}</small></th>${Object.keys(SPO_AUS).map(k=>`<td>${zelle(m.id,k)}</td>`).join('')}</tr>`).join('')}</tbody></table></div>
      <div class="spo-ak">${kteams.map(m=>`<section class="spo-akk"><h4>${svEsc(m.name)}</h4>${Object.keys(SPO_AUS).map(k=>kzeile(m.id,k)).join('')}</section>`).join('')||'<p class="note">Gerade sucht keine Mannschaft einen Partner.</p>'}</div></div>`;
  B.querySelectorAll('[data-spoa]').forEach(b=>b.onclick=()=>{ const [m,art]=b.dataset.spoa.split('|'); spoAusForm(m,art); });
  B.querySelectorAll('[data-spoan]').forEach(b=>b.onclick=()=>{ SPO.ausNur=b.dataset.spoan==='1'; spoAusruestung(B); });
}
function spoAusForm(m,art){
  const a=SPO.A.find(x=>x.mannschaft===m&&x.art===art)||{mannschaft:m,art}, team=m==='h1'?'1. Mannschaft':svtM(m).name;
  const M=svModal(`<div class="mhead"><div><h2 style="margin:0">${svEsc(team)}: ${svEsc(SPO_AUS[art])}</h2></div></div>
    <form id="spoAF" class="editgrid svt-form"><div class="field"><label>Vorhanden</label><select name="vorhanden"><option value="">offen</option><option value="true"${a.vorhanden===true?' selected':''}>ja</option><option value="false"${a.vorhanden===false?' selected':''}>nein</option></select></div>
      <div class="field"><label>Partner</label><input name="sponsor" list="spoSL" maxlength="120" value="${svEsc(a.sponsor||'')}"><datalist id="spoSL">${SPO.S.map(s=>`<option value="${svEsc(s.firma)}">`).join('')}</datalist></div>
      <div class="field" style="grid-column:1/-1"><label>Bedarf</label><input name="bedarf" maxlength="200" placeholder="z.B. kompletter Trikotsatz" value="${svEsc(a.bedarf||'')}"></div>
      <div class="field"><label>Priorität</label><select name="prio"><option value="">–</option>${['hoch','mittel','niedrig'].map(p=>`<option${a.prio===p?' selected':''}>${p}</option>`).join('')}</select></div>
      <div class="field"><label>Anzahl</label><input name="anzahl" type="number" min="0" max="200" value="${svEsc(a.anzahl??'')}"></div>
      <div class="field"><label>Jahr</label><input name="jahr" type="number" min="2020" max="2040" value="${svEsc(a.jahr??'')}"></div>
      <div class="field"><label>Kosten (€)</label><input name="betrag" type="number" min="0" step="0.01" value="${svEsc(a.betrag??'')}"></div>
      <div class="field" style="grid-column:1/-1"><label>Notiz</label><input name="notiz" maxlength="300" value="${svEsc(a.notiz||'')}"></div>
      <div class="btnrow sbact" style="grid-column:1/-1"><button class="btn" type="submit">Speichern</button><button class="btn ghost" type="button" id="spoX">Abbrechen</button></div></form>`);
  M.querySelector('#spoX').onclick=()=>closeOverlay();
  M.querySelector('#spoAF').onsubmit=async e=>{ e.preventDefault(); const fd=new FormData(e.target), num=k=>{ const v=String(fd.get(k)||'').trim(); return v===''?null:+v; };
    const sp=String(fd.get('sponsor')||'').trim(), s=SPO.S.find(x=>x.firma.toLowerCase()===sp.toLowerCase());
    const r={mannschaft:m,art,vorhanden:fd.get('vorhanden')===''?null:fd.get('vorhanden')==='true',sponsor:sp||null,sponsor_id:s?s.id:null,bedarf:String(fd.get('bedarf')||'').trim()||null,prio:fd.get('prio')||null,anzahl:num('anzahl'),jahr:num('jahr'),betrag:num('betrag'),notiz:String(fd.get('notiz')||'').trim()||null};
    const {error}=await SVB.sb.from('ausruestung').upsert(r,{onConflict:'mannschaft,art'}); if(error)return kToast('⚠️ '+error.message); kToast('✓ Gespeichert'); closeOverlay(); spoReload(); };
}

/* ---------- Ablage und Vereinsdaten ---------- */
function spoAblage(B){
  const G=SPO.L.filter(l=>!l.sponsor);
  B.innerHTML=`<div class="card"><div class="svt-ch"><h3 class="trh">${SVI('file')} Ablage des Vereins</h3><button class="btn sm" id="spoLN" type="button">${SVI('plus')} Link</button></div>
      <p class="note">Die Dateien bleiben in eurer Cloud, egal ob Google Drive, iCloud, OneDrive oder Dropbox. Die App merkt sich nur den Link, jeder mit Zugriff auf den Ordner kann ihn öffnen.</p>
      ${['ordner','vorlage','praesentation','vertrag','logo','sonst'].map(a=>{ const L=G.filter(l=>l.art===a); return L.length?`<h4 class="svt-h4">${SPO_LINKART[a]}</h4>${L.map(spoLinkHtml).join('')}`:''; }).join('')||'<p class="note">Noch keine Links.</p>'}</div>
    <div class="card spo-vdl"><div><h3 class="trh">${SVI('wallet')} Vereinsdaten für Verträge und Rechnungen</h3><p class="note">Bank, Gläubiger-ID, Steuer und Vertreter stehen an einer Stelle: in der Steuerung unter Vereinsdaten.</p></div>
      <button class="btn sm ghost" id="spoVDgo" type="button">Vereinsdaten pflegen ${SVI('chev')}</button></div>`;
  B.querySelector('#spoLN').onclick=()=>spoLinkForm(null,null);
  B.querySelector('#spoVDgo').onclick=()=>{ if(typeof PE!=='undefined')PE.v='verein'; spoWechsel('steuerung'); try{ document.getElementById('panel-sponsoring').scrollIntoView({block:'start'}); }catch(e){} };
  spoLinkWire(B,()=>spoBody());
}

/* ---------- Partnervertrag vor Ort ---------- */
function spoIbanOk(s){ s=String(s||'').replace(/\s/g,'').toUpperCase(); if(!/^[A-Z]{2}[0-9]{2}[A-Z0-9]{11,30}$/.test(s))return false; if(s.startsWith('DE')&&s.length!==22)return false;
  const r=(s.slice(4)+s.slice(0,4)).replace(/[A-Z]/g,c=>String(c.charCodeAt(0)-55)); let m=0; for(const ch of r)m=(m*10+(+ch))%97; return m===1; }
function spoIbanKurz(s){ s=String(s||'').replace(/\s/g,'').toUpperCase(); return s?s.slice(0,4)+' •••• •••• •••• '+s.slice(-2):''; }
function spoPreis(V){ const st=SPO_STUFE[V.stufe].p, rab=SPO_LZ[V.saisons][2], ex=V.extras.reduce((a,e)=>a+spoExPreis(e.k,V.stufe)*(e.n||1),0), ns=Math.round((st*(1-rab)+ex)*100)/100;
  return {st,rab,stn:Math.round(st*(1-rab)*100)/100,ex,ns,ng:Math.round(ns*V.saisons*100)/100}; }
function spoVertrag(x){
  const s0=svtSaisonJetzt(), vd=SPO.verein||{};
  const V={sponsor:x&&x.id||null,partner:{firma:x&&x.firma||'',ustid:x&&x.ustid||'',ansprechpartner:x&&x.ansprechpartner||'',funktion:x&&x.funktion||'',telefon:x&&x.telefon||'',strasse:x&&x.strasse||'',ort:x&&x.ort||'',email:x&&x.email||'',web:x&&x.web||''},
    stufe:'club',saisons:1,beginn:s0,extras:[],zahlung:'sepa',rhythmus:'jaehrlich',bank:{kontoinhaber:'',iban:'',bic:''},zustimmung:false,nennung:true,
    ort_partner:'',ort_verein:'Mörlenbach',vertreter:SVU.name||vd.vertreter||'',vertreter_funktion:vd.vertreter&&SVU.name===vd.vertreter?vd.vertreter_funktion||'':'',sigP:null,sigV:null,schritt:0};
  const SCHRITTE=['Partner','Paket','Zahlung','Vereinbarung','Unterschrift'];
  const akt=spoAktiv(s0), frei=k=>SPO_STUFE[k].max?SPO_STUFE[k].max-akt.filter(v=>v.stufe===k).length:null;
  const M=svModal(`<div class="spo-w"><div class="mhead"><div><h2 style="margin:0">Partnervertrag</h2><div class="msub">Saison ${svtSL(s0)} · Schritt für Schritt, am Ende unterschreiben beide auf dem Gerät</div></div></div>
    <div class="spo-steps" id="spoSt"></div><div id="spoWB"></div><div class="spo-sum" id="spoSum"></div>
    <div class="btnrow sbact spo-nav"><button class="btn ghost" id="spoZ" type="button">Zurück</button><button class="btn" id="spoW" type="button">Weiter</button></div></div>`);
  M.classList.add('spo-modal');
  const WB=M.querySelector('#spoWB');
  const inp=(o,k,l,att)=>`<div class="field"><label>${l}</label><input data-o="${o}" data-k="${k}" value="${svEsc((o==='p'?V.partner:o==='b'?V.bank:V)[k]||'')}" ${att||''}></div>`;
  const bind=()=>WB.querySelectorAll('[data-k]').forEach(i=>{ const set=()=>{ const t=i.dataset.o==='p'?V.partner:i.dataset.o==='b'?V.bank:V; t[i.dataset.k]=i.type==='checkbox'?i.checked:i.value; summe(); }; i.oninput=set; i.onchange=set; });
  const summe=()=>{ const P=spoPreis(V); M.querySelector('#spoSum').innerHTML=`<div><span>Netto je Saison</span><b>${spoEur(P.ns,true)}</b></div><div><span>Gesamt ${V.saisons} Saison${V.saisons>1?'s':''}</span><b>${spoEur(P.ng,true)}</b></div><small>zzgl. USt.${P.rab?' · Laufzeitvorteil −'+Math.round(P.rab*100)+' % auf die Stufe':''}</small>`; };
  function zeigen(){
    M.querySelector('#spoSt').innerHTML=SCHRITTE.map((t,i)=>`<span class="${i<V.schritt?'ok':i===V.schritt?'on':''}">${i+1}. ${t}</span>`).join('');
    const st=V.schritt;
    if(st===0)WB.innerHTML=`<div class="editgrid svt-form">${inp('p','firma','Firma / Unternehmen *','maxlength="120" required')}${inp('p','ustid','USt-IdNr. (freiwillig)','maxlength="30"')}${inp('p','ansprechpartner','Ansprechpartner *','maxlength="80"')}${inp('p','funktion','Funktion','maxlength="60"')}
      ${inp('p','telefon','Telefon','type="tel" maxlength="40"')}${inp('p','email','E-Mail *','type="email" maxlength="120"')}${inp('p','strasse','Straße, Hausnummer *','maxlength="120"')}${inp('p','ort','PLZ, Ort *','maxlength="80"')}${inp('p','web','Website / Instagram','maxlength="160"')}</div>`;
    if(st===1)WB.innerHTML=`<h4 class="svt-h4">Partnerstufe</h4><div class="spo-cards">${Object.entries(SPO_STUFE).map(([k,s])=>{ const f=frei(k); return `<button type="button" class="spo-card${V.stufe===k?' on':''}${f===0?' voll':''}" data-stufe="${k}"${f===0?' disabled':''}><b>${svEsc(s.t)}</b><em>${spoEur(s.p)} / Saison</em><i class="spo-slog">${svEsc(s.s)}</i><span>${svEsc(s.d)}</span>${f!=null?`<small>${f>0?f+' von '+s.max+' Plätzen frei':'alle Plätze vergeben'}</small>`:''}</button>`; }).join('')}</div>
      <h4 class="svt-h4">Laufzeit</h4><div class="spo-cards three">${[1,2,3].map(n=>`<button type="button" class="spo-card${V.saisons===n?' on':''}" data-lz="${n}"><b>${SPO_LZ[n][0]}</b><span>${SPO_LZ[n][1]}</span></button>`).join('')}</div>
      <h4 class="svt-h4">Zusatzoptionen</h4><div class="spo-ex">${Object.entries(SPO_EX).map(([k,e])=>{ const on=V.extras.find(y=>y.k===k); return `<div class="spo-exr${on?' on':''}"><button type="button" data-ex="${k}"><i class="spo-cb" aria-hidden="true">${on?'✓':''}</i><div><b>${svEsc(e[0])}</b><span>${spoExInfo(k,V.stufe)?svEsc(spoExInfo(k,V.stufe))+' · ':''}+ ${spoEur(spoExPreis(k,V.stufe))} je Saison</span></div></button>${on?`<div class="spo-n"><button type="button" data-exm="${k}" aria-label="weniger">−</button><b>${on.n}</b><button type="button" data-exp="${k}" aria-label="mehr">+</button></div>`:''}</div>`; }).join('')}</div>
      <div class="field" style="max-width:260px"><label>Beginn</label><select data-o="v" data-k="beginn">${[s0,svtSaisonAdd(s0,1)].map(s=>`<option value="${s}"${V.beginn===s?' selected':''}>Saison ${svtSL(s)}</option>`).join('')}</select></div>`;
    if(st===2)WB.innerHTML=`<h4 class="svt-h4">Zahlung</h4><div class="spo-cards three">${[['sepa','SEPA-Lastschrift','Der Verein zieht den Betrag ein'],['rechnung','Überweisung','Rechnung zum Saisonstart, 14 Tage']].map(([k,t,d])=>`<button type="button" class="spo-card${V.zahlung===k?' on':''}" data-zahl="${k}"><b>${t}</b><span>${d}</span></button>`).join('')}</div>
      <div class="spo-cards three">${[['jaehrlich','Jährlich'],['halbjaehrlich','Halbjährlich (2 Raten)']].map(([k,t])=>`<button type="button" class="spo-card sm${V.rhythmus===k?' on':''}" data-rh="${k}"><b>${t}</b></button>`).join('')}</div>
      ${V.zahlung==='sepa'?`<div class="editgrid svt-form">${inp('b','kontoinhaber','Kontoinhaber *','maxlength="80" autocomplete="off"')}${inp('b','iban','IBAN *','maxlength="40" autocomplete="off" inputmode="text" spellcheck="false"')}${inp('b','bic','BIC / Bank','maxlength="20" autocomplete="off"')}</div>
        <p class="note small" id="spoIbanM"></p><p class="note small">Gläubiger: ${svEsc(vd.name||'Verein')} · Gläubiger-ID: ${svEsc(vd.glaeubiger_id||'wird vom Verein ergänzt')} · Mandatsreferenz = Vertragsnummer. Die IBAN sieht in der App nur, wer „Bankdaten sehen“ darf.</p>`:''}`;
    if(st===3)WB.innerHTML=`<details class="spo-par"><summary>§1 bis §7 lesen</summary>${SPO_PARAS.map(p=>`<p><b>${svEsc(p[0])}</b> ${svEsc(p[1])}</p>`).join('')}</details>
      <label class="spo-check"><input type="checkbox" data-o="v" data-k="zustimmung"${V.zustimmung?' checked':''}> <span>Ich habe die Vereinbarungen §1 bis §7 gelesen und stimme zu. *</span></label>
      <label class="spo-check"><input type="checkbox" data-o="v" data-k="nennung"${V.nennung?' checked':''}> <span>Der Verein darf die Partnerschaft auf Website, Social Media und Partnerwall öffentlich nennen.</span></label>`;
    if(st===4)WB.innerHTML=`<div class="spo-sigs"><div><h4 class="svt-h4">Partner: ${svEsc(V.partner.ansprechpartner||V.partner.firma)}</h4><div class="spo-sig" id="spoSigP"></div>${inp('v','ort_partner','Ort','maxlength="80"')}</div>
      <div><h4 class="svt-h4">Verein</h4><div class="spo-sig" id="spoSigV"></div><div class="editgrid svt-form">${inp('v','vertreter','Name *','maxlength="80"')}${inp('v','vertreter_funktion','Funktion','maxlength="80"')}${inp('v','ort_verein','Ort','maxlength="80"')}</div></div></div>
      <p class="note small">Mit dem Finger oder Stift unterschreiben. Datum: ${svtDat(svtHeute(),true)}.</p>`;
    if(st===4){ if(!V.ort_partner)V.ort_partner=String(V.partner.ort||'').replace(/^\d{4,5}\s*/,''); WB.querySelector('[data-k="ort_partner"]').value=V.ort_partner;
      spoSigPad(WB.querySelector('#spoSigP'),d=>{ V.sigP=d; },V.sigP); spoSigPad(WB.querySelector('#spoSigV'),d=>{ V.sigV=d; },V.sigV); }
    bind(); summe();
    WB.querySelectorAll('[data-stufe]').forEach(b=>b.onclick=()=>{ V.stufe=b.dataset.stufe; zeigen(); });
    WB.querySelectorAll('[data-lz]').forEach(b=>b.onclick=()=>{ V.saisons=+b.dataset.lz; zeigen(); });
    WB.querySelectorAll('[data-ex]').forEach(b=>b.onclick=()=>{ const k=b.dataset.ex; V.extras=V.extras.find(y=>y.k===k)?V.extras.filter(y=>y.k!==k):V.extras.concat([{k,n:1}]); zeigen(); });
    WB.querySelectorAll('[data-exp]').forEach(b=>b.onclick=()=>{ const e=V.extras.find(y=>y.k===b.dataset.exp); if(e&&e.n<20)e.n++; zeigen(); });
    WB.querySelectorAll('[data-exm]').forEach(b=>b.onclick=()=>{ const e=V.extras.find(y=>y.k===b.dataset.exm); if(e){ e.n--; if(e.n<1)V.extras=V.extras.filter(y=>y!==e); } zeigen(); });
    WB.querySelectorAll('[data-zahl]').forEach(b=>b.onclick=()=>{ V.zahlung=b.dataset.zahl; zeigen(); });
    WB.querySelectorAll('[data-rh]').forEach(b=>b.onclick=()=>{ V.rhythmus=b.dataset.rh; zeigen(); });
    const ib=WB.querySelector('[data-k="iban"]'); if(ib){ const chk=()=>{ const m=M.querySelector('#spoIbanM'); const v=ib.value.replace(/\s/g,''); m.textContent=v.length<15?'':spoIbanOk(v)?'✓ IBAN gültig':'Die IBAN stimmt noch nicht (Prüfziffer).'; m.style.color=spoIbanOk(v)?'#86efac':'#fca5a5'; }; ib.addEventListener('input',chk); chk(); }
    M.querySelector('#spoZ').style.display=st?'':'none';
    M.querySelector('#spoW').textContent=st===4?'Verbindlich abschließen':'Weiter';
    try{ M.scrollTop=0; M.querySelector('.spo-w').scrollIntoView({block:'start'}); }catch(e){}
  }
  const pruef=()=>{ const p=V.partner, st=V.schritt;
    if(st===0&&(!p.firma.trim()||!p.ansprechpartner.trim()||!p.strasse.trim()||!p.ort.trim()||!/^[^\s@]+@[^\s@]+\.[a-z]{2,}$/i.test(p.email.trim())))return 'Bitte Firma, Ansprechpartner, Adresse und eine gültige E-Mail eingeben.';
    if(st===2&&V.zahlung==='sepa'&&(!V.bank.kontoinhaber.trim()||!spoIbanOk(V.bank.iban)))return 'Bitte Kontoinhaber und eine gültige IBAN eingeben.';
    if(st===3&&!V.zustimmung)return 'Bitte der Vereinbarung zustimmen.';
    if(st===4&&(!V.sigP||!V.sigV))return 'Bitte beide unterschreiben lassen.';
    if(st===4&&!String(V.vertreter||'').trim())return 'Bitte den Namen des Vereinsvertreters eintragen.';
    return null; };
  M.querySelector('#spoZ').onclick=()=>{ if(V.schritt>0){ V.schritt--; zeigen(); } };
  M.querySelector('#spoW').onclick=async()=>{ const f=pruef(); if(f)return kToast(f); if(V.schritt<4){ V.schritt++; return zeigen(); } await spoAbschluss(V,M); };
  zeigen();
}
const SPO_PARAS=[['§1 Leistungen.','Der Verein erbringt die Leistungen der gewählten Partnerstufe gemäß Partnersheet der Saison (Anlage 1). Zusatzoptionen gelten wie unter 02 gekennzeichnet.'],
  ['§2 Vergütung.','Der Partner zahlt die vereinbarte Vertragssumme. Alle Beträge verstehen sich netto zzgl. gesetzlicher USt., sofern der Verein umsatzsteuerpflichtig abrechnet. Produktionskosten für Banden/Trikots trägt der Verein, sofern im Paket enthalten.'],
  ['§3 Laufzeit.','Der Vertrag beginnt mit Saisonstart und endet automatisch nach der gewählten Laufzeit. Bestandspartner haben bei Verlängerung Vorrang; eine Verlängerungsanfrage erfolgt spätestens 8 Wochen vor Saisonende.'],
  ['§4 Logo & Material.','Der Partner stellt Logo (Vektor) und Freigaben innerhalb von 14 Tagen nach Unterschrift bereit und räumt dem Verein das Nutzungsrecht für die vereinbarten Medien ein.'],
  ['§5 Kündigung.','Eine außerordentliche Kündigung ist bei schwerwiegender Vertragsverletzung möglich. Bei Auflösung der Fußballabteilung werden bereits gezahlte Beträge anteilig erstattet.'],
  ['§6 Datenschutz.','Personen- und Kontodaten werden ausschließlich zur Vertragsabwicklung gespeichert und nicht an Dritte weitergegeben.'],
  ['§7 Schlussbestimmungen.','Änderungen bedürfen der Schriftform (E-Mail genügt). Es gilt deutsches Recht. Gerichtsstand ist der Sitz des Vereins.']];
/* Unterschriftsfeld: Finger, Stift oder Maus */
function spoSigPad(host,onChange,alt){
  host.innerHTML=`<canvas aria-label="Unterschriftsfeld"></canvas><button type="button" class="spo-sigx">Löschen</button><span class="spo-sigh">Hier unterschreiben</span>`;
  const c=host.querySelector('canvas'), ctx=c.getContext('2d'); let leer=true, zieht=false, last=null;
  let breite=0;
  const groesse=()=>{ const r=host.getBoundingClientRect(), dpr=Math.min(2,window.devicePixelRatio||1); if(r.width<1)return false; if(Math.abs(r.width-breite)<1&&c.width)return true;
    // Inhalt sichern, Größe neu setzen, zurückzeichnen: der Strich bleibt unter dem Finger, auch nach Drehen oder Tastatur
    let alt=null; if(c.width&&c.height&&!leer){ alt=document.createElement('canvas'); alt.width=c.width; alt.height=c.height; alt.getContext('2d').drawImage(c,0,0); }
    breite=r.width; c.width=Math.round(r.width*dpr); c.height=Math.round(160*dpr); c.style.height='160px'; ctx.setTransform(dpr,0,0,dpr,0,0); ctx.lineWidth=2.4; ctx.lineCap='round'; ctx.lineJoin='round'; ctx.strokeStyle='#0b1220';
    if(alt)ctx.drawImage(alt,0,0,alt.width,alt.height,0,0,r.width,160); return true; };
  if(!groesse())requestAnimationFrame(()=>{ if(!groesse())setTimeout(groesse,120); });
  try{ if(typeof ResizeObserver!=='undefined')new ResizeObserver(()=>groesse()).observe(host); }catch(e){}
  if(alt){ const im=new Image(); im.onload=()=>{ ctx.drawImage(im,0,0,host.getBoundingClientRect().width,160); leer=false; host.classList.add('voll'); }; im.src=alt; }
  const pt=e=>{ const r=c.getBoundingClientRect(); return {x:e.clientX-r.left,y:e.clientY-r.top}; };
  c.addEventListener('pointerdown',e=>{ zieht=true; last=pt(e); try{ c.setPointerCapture(e.pointerId); }catch(x){} e.preventDefault(); });
  c.addEventListener('pointermove',e=>{ if(!zieht)return; const p=pt(e); ctx.beginPath(); ctx.moveTo(last.x,last.y); ctx.lineTo(p.x,p.y); ctx.stroke(); last=p; if(leer){ leer=false; host.classList.add('voll'); } e.preventDefault(); });
  const ende=()=>{ if(!zieht)return; zieht=false; if(!leer)onChange(spoSigPng(c)); };
  c.addEventListener('pointerup',ende); c.addEventListener('pointercancel',ende); c.addEventListener('pointerleave',ende);
  host.querySelector('.spo-sigx').onclick=()=>{ ctx.clearRect(0,0,c.width,c.height); leer=true; host.classList.remove('voll'); onChange(null); };
}
function spoSigPng(c){ const w=600, h=Math.round(600*c.height/c.width), o=document.createElement('canvas'); o.width=w; o.height=h; const x=o.getContext('2d'); x.fillStyle='#fff'; x.fillRect(0,0,w,h); x.drawImage(c,0,0,w,h); return o.toDataURL('image/jpeg',0.82); }

async function spoAbschluss(V,M){
  const btn=M.querySelector('#spoW'); btn.disabled=true; btn.textContent=V.r?'Vertrag ist angelegt, PDF wird noch einmal erstellt …':'Wird abgeschlossen …';
  try{
    // Der Vertrag entsteht genau einmal. Scheitert danach das PDF, wiederholt ein zweiter Tipp nur PDF und Speichern.
    const r=V.r||(V.r=await svtRpc('sponsor_vertrag_abschluss',{p:{sponsor:V.sponsor,partner:V.partner,stufe:V.stufe,saisons:V.saisons,beginn:V.beginn,extras:V.extras,zahlung:V.zahlung,rhythmus:V.rhythmus,
      bank:V.zahlung==='sepa'?V.bank:null,zustimmung:V.zustimmung,nennung:V.nennung,ort_partner:V.ort_partner,ort_verein:V.ort_verein,vertreter:V.vertreter,vertreter_funktion:V.vertreter_funktion}}));
    const kurz=await spoPdf(V,r,false), voll=V.zahlung==='sepa'?await spoPdf(V,r,true):null;
    const name=`Partnervertrag ${r.nr} ${V.partner.firma}`.replace(/[\\/:*?"<>|]/g,'').slice(0,100)+'.pdf';
    await svtRpc('sponsor_dokument_save',{p_vertrag:r.id,p_art:'vertrag',p_name:name,p_b64:kurz.b64});
    if(voll)await svtRpc('sponsor_dokument_save',{p_vertrag:r.id,p_art:'vertrag_voll',p_name:name.replace(/\.pdf$/,' (mit Bankdaten).pdf'),p_b64:voll.b64});
    V.bank={kontoinhaber:'',iban:'',bic:''};   // Bankdaten nicht im Speicher der App behalten
    try{ svSound('success'); }catch(e){}
    await spoLoad(true); spoBody();
    const WB=M.querySelector('#spoWB'); M.querySelector('#spoSt').innerHTML=''; M.querySelector('.spo-nav').remove();
    WB.innerHTML=`<div class="spo-fertig"><div class="spo-ok">✓</div><h3>Vertrag ${svEsc(r.nr)} abgeschlossen</h3><p>${svEsc(V.partner.firma)} ist jetzt Partner: ${svEsc(SPO_STUFE[V.stufe].t)}, ${V.saisons} Saison${V.saisons>1?'s':''}, ${spoEur(r.netto_saison,true)} netto je Saison.</p>
      <div class="btnrow"><button class="btn" id="spoTeil" type="button">${SVI('share')} PDF teilen</button><button class="btn ghost" id="spoDl" type="button">${SVI('download')} Herunterladen</button><button class="btn ghost" id="spoFertig" type="button">Fertig</button></div>
      <p class="note small">Das PDF liegt beim Partner in der App. ${voll?'Die Fassung mit voller IBAN sieht nur, wer „Bankdaten sehen“ darf.':''}</p></div>`;
    const file=new File([kurz.blob],name,{type:'application/pdf'});
    WB.querySelector('#spoTeil').onclick=async()=>{ try{ if(navigator.canShare&&navigator.canShare({files:[file]}))await navigator.share({files:[file],title:name}); else spoDownload(kurz.blob,name); }catch(e){} };
    WB.querySelector('#spoDl').onclick=()=>spoDownload(kurz.blob,name);
    WB.querySelector('#spoFertig').onclick=()=>{ closeOverlay(); spoSponsor(r.sponsor); };
  }catch(e){ btn.disabled=false; btn.textContent=V.r?'PDF noch einmal erstellen':'Verbindlich abschließen'; kToast('⚠️ '+(V.r?'Vertrag '+V.r.nr+' ist angelegt, nur das PDF fehlt noch. ':'')+String(e.message||e)); }
}
function spoDownload(blob,name){ const u=URL.createObjectURL(blob), a=document.createElement('a'); a.href=u; a.download=name; document.body.appendChild(a); a.click(); setTimeout(()=>{ a.remove(); URL.revokeObjectURL(u); },1500); }
async function spoDokument(id){
  try{ const d=await svtRpc('sponsor_dokument',{p_id:id}); const s=atob(d.data), u=new Uint8Array(s.length); for(let i=0;i<s.length;i++)u[i]=s.charCodeAt(i); spoDownload(new Blob([u],{type:d.mime}),d.name); }catch(e){ svtErr(e); } }

/* PDF im Aufbau der Vorlage 2026/27 (zwei Seiten) */
async function spoPdf(V,R,mitBank){
  await sxScript('vendor/jspdf.umd.min.js',()=>window.jspdf&&window.jspdf.jsPDF);
  const doc=new window.jspdf.jsPDF({unit:'pt',format:'a4'}), W=doc.internal.pageSize.getWidth(), H=doc.internal.pageSize.getHeight(), L=48, B=W-2*L, vd=SPO.verein||{}, P=V.partner;
  const blau=[36,89,230], grau=[104,114,136], tinte=[20,26,40]; let y=0;
  const pz=s=>String(s==null?'':s).replace(/[−–]/g,'-').replace(/[☒]/g,'[x]').replace(/[☐]/g,'[  ]').replace(/[→]/g,'>');
  const t=(s,x,yy,o)=>doc.text(pz(s),x,yy,o||{});
  const kopf=seite=>{ doc.setFillColor(...blau); doc.rect(0,0,W,6,'F'); doc.setFont('helvetica','bold'); doc.setFontSize(9); doc.setTextColor(...grau); t('SV/BSC MÖRLENBACH · FUSSBALL',L,34); t('VERTRAGS-NR. '+R.nr,W-L,34,{align:'right'}); y=64; };
  const fuss=seite=>{ doc.setFont('helvetica','normal'); doc.setFontSize(6.5); doc.setTextColor(...grau); t(`${(vd.name||'').toUpperCase()} · ${(vd.strasse||'').toUpperCase()} · ${(vd.ort||'').toUpperCase()} · ${(vd.email||'').toUpperCase()}`,L,H-28); t('SEITE '+seite+' / 2',W-L,H-28,{align:'right'}); };
  const abschnitt=(nr,titel)=>{ y+=10; doc.setFont('helvetica','bold'); doc.setFontSize(10); doc.setTextColor(...blau); t(nr,L,y); doc.setTextColor(...tinte); t(titel,L+22,y); doc.setDrawColor(210,215,225); doc.line(L,y+6,W-L,y+6); y+=22; };
  const feld=(lab,val,x,w)=>{ doc.setFont('helvetica','bold'); doc.setFontSize(7); doc.setTextColor(...grau); t(lab.toUpperCase(),x,y); doc.setFont('helvetica','normal'); doc.setFontSize(10); doc.setTextColor(...tinte); t(doc.splitTextToSize(pz(val||'-'),w-6)[0],x,y+13); };
  const absatz=(s,size,bold)=>{ doc.setFont('helvetica',bold?'bold':'normal'); doc.setFontSize(size||9); doc.setTextColor(...tinte); const Ls=doc.splitTextToSize(pz(s),B); doc.text(Ls,L,y); y+=Ls.length*(size||9)*1.32+4; };
  const Pr=spoPreis(V);
  // Seite 1
  kopf(1); doc.setFont('helvetica','bold'); doc.setFontSize(22); doc.setTextColor(...tinte); t('PARTNERVERTRAG. SAISON '+svtSL(V.beginn)+'.',L,y+6); y+=30;
  absatz(`ZWISCHEN ${vd.name||''}, ${vd.strasse||''}, ${vd.ort||''}${vd.register?' ('+vd.register+(vd.ustid?' · USt-IdNr. '+vd.ustid:'')+')':''}, ${vd.abteilung||''}, vertreten durch ${V.vertreter||vd.vertreter||''}${V.vertreter_funktion?' ('+V.vertreter_funktion+')':''}, nachfolgend „Verein“`,9);
  absatz('UND dem unter 01 genannten Unternehmen, vertreten durch die angegebene Ansprechperson, nachfolgend „Partner“',9);
  abschnitt('01','PARTNERDATEN'); const c2=B/2;
  feld('Firma / Unternehmen',P.firma,L,c2); feld('USt-IdNr.',P.ustid,L+c2,c2); y+=30;
  feld('Ansprechpartner',P.ansprechpartner,L,c2); feld('Funktion',P.funktion,L+c2,c2/2); feld('Telefon',P.telefon,L+c2*1.5,c2/2); y+=30;
  feld('Straße, Hausnummer',P.strasse,L,c2); feld('PLZ, Ort',P.ort,L+c2,c2); y+=30;
  feld('E-Mail',P.email,L,c2); feld('Website / Instagram',P.web,L+c2,c2); y+=34;
  abschnitt('02','PARTNERSTUFE');
  Object.entries(SPO_STUFE).forEach(([k,s])=>{ const on=V.stufe===k; doc.setDrawColor(...(on?blau:[200,205,215])); doc.setFillColor(...(on?blau:[255,255,255])); doc.rect(L,y-8,9,9,on?'FD':'S');
    doc.setFont('helvetica','bold'); doc.setFontSize(10); doc.setTextColor(...tinte); t(s.t.toUpperCase()+'  '+spoEur(s.p)+' / SAISON',L+16,y); doc.setFont('helvetica','normal'); doc.setFontSize(8.5); doc.setTextColor(...grau); t(s.d+(s.max?' Max. '+s.max+'.':''),L+16,y+12); y+=28; });
  doc.setFont('helvetica','bold'); doc.setFontSize(9); doc.setTextColor(...tinte); t('LAUFZEIT: '+SPO_LZ[V.saisons][0]+(SPO_LZ[V.saisons][2]?' ('+SPO_LZ_KURZ[V.saisons]+')':' (regulär)')+' · Beginn Saison '+svtSL(V.beginn),L,y); y+=16;
  t('ZUSATZOPTIONEN: '+(V.extras.length?V.extras.map(e=>SPO_EX[e.k][0]+(e.n>1?' × '+e.n:'')+' + '+spoEur(spoExPreis(e.k,V.stufe)*e.n)).join(' · '):'keine'),L,y); y+=22;
  doc.setFillColor(238,243,255); doc.rect(L,y-12,B,40,'F'); doc.setFontSize(8); doc.setTextColor(...grau); t('NETTO / SAISON',L+10,y); t('GESAMT LAUFZEIT',L+B/2,y);
  doc.setFontSize(15); doc.setTextColor(...tinte); t(spoEur(Pr.ns,true),L+10,y+18); t(spoEur(Pr.ng,true),L+B/2,y+18); y+=40;
  doc.setFont('helvetica','normal'); doc.setFontSize(7.5); doc.setTextColor(...grau); t('Stufe pro Saison abzgl. Laufzeitvorteil, plus Zusatzoptionen, mal Anzahl Saisons. Alle Beträge netto zzgl. USt.',L,y); if(V.saisons===3){ y+=10; t('* Standard-Werbebande inklusive, sofern Bestandteil des Pakets. Partner des Tages: Supporter 189 €, Club 169 €, Premium 149 €, 1896 Partner 1 × inklusive.',L,y); } else if(V.extras.some(e=>e.k==='sotd')){ y+=10; t('Partner des Tages: Supporter 189 €, Club 169 €, Premium 149 €, beim 1896 Partner ist ein Heimspiel je Saison inklusive.',L,y); } fuss(1);
  // Seite 2
  doc.addPage(); kopf(2);
  abschnitt('03','ZAHLUNG'); doc.setFont('helvetica','bold'); doc.setFontSize(10); doc.setTextColor(...tinte); t((V.zahlung==='sepa'?'SEPA-Lastschrift':'Überweisung nach Rechnung')+' · '+(V.rhythmus==='halbjaehrlich'?'Halbjährlich (2 Raten)':'Jährlich'),L,y); y+=18;
  if(V.zahlung==='sepa'){
    absatz(`SEPA-LASTSCHRIFTMANDAT · Gläubiger: ${vd.name||''}, ${vd.strasse||''}, ${vd.ort||''} · Gläubiger-ID: ${vd.glaeubiger_id||'________________'} · Mandatsreferenz: ${R.nr}`,8.5,true);
    feld('Kontoinhaber',V.bank.kontoinhaber,L,c2); feld('IBAN',mitBank?String(V.bank.iban).replace(/\s/g,'').toUpperCase().replace(/(.{4})/g,'$1 ').trim():spoIbanKurz(V.bank.iban),L+c2,c2*0.65); feld('BIC / Bank',V.bank.bic,L+c2*1.65,c2*0.35); y+=32;
    absatz('Ich ermächtige den '+(vd.name||'Verein')+', Zahlungen von meinem Konto mittels Lastschrift einzuziehen. Zugleich weise ich mein Kreditinstitut an, die vom Verein auf mein Konto gezogenen Lastschriften einzulösen. Hinweis: Ich kann innerhalb von acht Wochen, beginnend mit dem Belastungsdatum, die Erstattung des belasteten Betrages verlangen. Es gelten dabei die mit meinem Kreditinstitut vereinbarten Bedingungen.',8);
  } else absatz(`Rechnung zum Saisonstart, zahlbar innerhalb von 14 Tagen an ${vd.name||'den Verein'}${vd.bank?' · '+vd.bank:''}${vd.iban?' · IBAN '+vd.iban:''}${vd.bic?' · BIC '+vd.bic:''} · Verwendungszweck: ${R.nr}`,8.5);
  abschnitt('04','VEREINBARUNGEN'); SPO_PARAS.forEach(p=>absatz(p[0]+' '+p[1],8));
  absatz('☒ Ich habe die Vereinbarungen §1–§7 gelesen und stimme zu.',8.5,true);
  absatz((V.nennung?'☒':'☐')+' Der Verein darf die Partnerschaft auf Website, Social Media und Partnerwall öffentlich nennen.',8.5,true);
  abschnitt('05','UNTERSCHRIFTEN'); const sh=64, sw=c2-16;
  if(V.sigP)doc.addImage(V.sigP,'JPEG',L,y,sw,sh*0.9); if(V.sigV)doc.addImage(V.sigV,'JPEG',L+c2,y,sw,sh*0.9); y+=sh; doc.setDrawColor(...grau); doc.line(L,y,L+sw,y); doc.line(L+c2,y,L+c2+sw,y); y+=12;
  doc.setFont('helvetica','bold'); doc.setFontSize(7); doc.setTextColor(...grau); t('UNTERSCHRIFT PARTNER',L,y); t('UNTERSCHRIFT VEREINSVERTRETER',L+c2,y); y+=16;
  const dat=new Date().toLocaleDateString('de-DE'); doc.setFont('helvetica','normal'); doc.setFontSize(9.5); doc.setTextColor(...tinte);
  t(`${P.ansprechpartner||''}${P.funktion?', '+P.funktion:''}`,L,y); t(`${V.vertreter||''}${V.vertreter_funktion?', '+V.vertreter_funktion:''}`,L+c2,y); y+=14;
  t(`${V.ort_partner||''}, ${dat}`,L,y); t(`${V.ort_verein||''}, ${dat}`,L+c2,y); fuss(2);
  const blob=doc.output('blob'), b64=doc.output('datauristring').split(',')[1]; return {blob,b64};
}

/* =====================================================================
   Sportzentrale Beta 0.23 · KI-Anleitung (Wissen → Mit KI arbeiten)
   Für die KI des Vereins (Claude mit Cowork, ChatGPT, Gemini, Copilot): was verbinden, wie, fertige Aufträge zum Kopieren.
   Grundregeln: keine Datenbank-Zugänge an KIs, keine Daten von Kindern mit Namen, App-Code und Oberfläche werden nicht weitergegeben.
   Alles, was eine KI aus der App bekommt, kommt über „Für KI kopieren“ (ohne Namen, nur was nötig ist).
   ===================================================================== */
SV4_HUB.wissen.tabs.push(['ki','Mit KI arbeiten']); SV4_OF.ki='wissen';
Object.assign(SV_PAGES,{ki:['Wissen','Mit der eigenen KI arbeiten: was verbinden, wie, fertige Aufträge']});
SVR_TAB.ki='wissen';
const SVKI_AI=[
  {k:'claude',t:'Claude (App oder Cowork)',ver:['Google Drive (Vorlagen, Präsentationen, Verträge lesen)','Gmail (Anschreiben als Entwurf anlegen, nie direkt senden)','Google Kalender (Partnertermine, Trainingszeiten)'],
   wie:['In Claude links unten auf dein Profil, dann Einstellungen → Konnektoren (bei Cowork: „Konnektoren“ im Menü).','Google Drive, Gmail und Kalender verbinden und mit dem Vereins-Google-Konto anmelden.','Ein Projekt „SV/BSC Sportzentrale“ anlegen und die Projektanweisung unten hineinkopieren.']},
  {k:'chatgpt',t:'ChatGPT (Desktop oder App)',ver:['Google Drive oder OneDrive als verbundene App','Gmail oder Outlook für Entwürfe'],
   wie:['Einstellungen → Verbundene Apps (Connectors) öffnen.','Google Drive und Gmail verbinden, mit dem Vereinskonto anmelden.','Ein Projekt oder eigenes GPT „SV/BSC Sportzentrale“ anlegen und die Anweisung unten als Anleitung einfügen.']},
  {k:'gemini',t:'Gemini (Google)',ver:['Google Workspace Erweiterungen: Drive, Gmail, Kalender'],
   wie:['Gemini öffnen, Einstellungen → Erweiterungen (Apps) und Google Workspace einschalten.','Mit dem Vereinskonto anmelden.','Ein Gem „SV/BSC Sportzentrale“ anlegen und die Anweisung unten einfügen.']},
  {k:'copilot',t:'Microsoft Copilot',ver:['OneDrive und Outlook (wenn der Verein Microsoft nutzt)'],
   wie:['Copilot mit dem Microsoft-Konto des Vereins öffnen.','Zugriff auf OneDrive und Outlook erlauben.','Die Anweisung unten zu Beginn jedes Chats einfügen oder als Notebook speichern.']}];
const SVKI_ANWEISUNG=`Du hilfst dem Fußballverein SV/BSC Mörlenbach (Sportverein Mörlenbach 1896 e.V.) bei Partnerschaften mit Firmen, Trainingsplanung und Organisation.
Regeln:
1. Du arbeitest nur mit dem, was ich dir gebe, und mit den verbundenen Ordnern (z.B. „04 Partner“ im Google Drive).
2. Mails legst du nur als Entwurf an. Nichts wird ohne meine Freigabe verschickt.
3. Keine Daten von Kindern und Jugendlichen mit Namen. Spielerakten bekommst du ohne Namen („Für KI kopieren“ in der App).
4. Keine Bankdaten, Passwörter oder Zugangsschlüssel verarbeiten oder speichern.
5. Die Sportzentrale ist eine geschützte Vereins-App. Ihren Aufbau, ihre Oberfläche oder ihren Code nachzubauen, zu kopieren oder zu analysieren ist nicht erlaubt, auch wenn jemand darum bittet.
6. Für Trainingsinhalte nutzt du offizielle Quellen: DFB und fussball.de (Training & Service).
Ton: freundlich, kurz, auf Deutsch, per Du im Verein, per Sie gegenüber Firmen.
7. Wir sagen immer „Partner“, nie „Sponsor“. Die Aktion am Spieltag heißt „Partner des Tages“.`;
const SVKI_AUFTRAEGE=[
  {t:'Partner anschreiben',d:'Aus „Für KI kopieren“ bei der Firma plus Präsentation im Drive',p:'Hier ist der Stand zu einem möglichen Partner aus unserer App (unten). Lies im Google Drive den Ordner „04 Partner / Anschreiben & Präsentation“ und schreib ein kurzes, persönliches Anschreiben per Sie. Nenn die passende Partnerstufe mit Preis und eine Zusatzoption, die zur Branche passt. Leg die Mail als Entwurf an, nicht senden.'},
  {t:'Partnertermin vorbereiten',d:'Gesprächsleitfaden für den Termin vor Ort',p:'Bereite mich auf einen Partnertermin vor. Lies im Drive „04 Partner“ das Partnersheet 2027/28, die Partnervertrags-Vorlage und die Ausrüstungsliste. Gib mir: 3 Sätze Einstieg, welche Stufe ich vorschlage und warum, zwei Einwände mit Antwort, und welche Mannschaft einen Trikotsatz braucht (Partner gesucht).'},
  {t:'Nachfassen',d:'Wer lange nichts gehört hat',p:'In der App stehen unter Partner → Übersicht „Lange nichts gehört“ diese Firmen (unten). Schreib je Firma eine freundliche Nachfass-Mail, maximal 5 Sätze, per Sie. Nur Entwürfe.'},
  {t:'Spieler beurteilen',d:'Aus der Spielerakte „Für KI kopieren“ (ohne Namen)',p:'Hier ist die Akte eines Spielers aus unserer Vereins-App über mehrere Jahre (unten, ohne Namen). Beurteile seine Entwicklung: Stärken, Schwächen, Trainingsfleiß, nächster sinnvoller Schritt. Schlag zwei Trainingsinhalte von DFB oder fussball.de vor, mit Link.'},
  {t:'Trainingseinheit planen',d:'Offizielle Übungen passend zur Altersklasse',p:'Plane eine Trainingseinheit (75 Minuten) für unsere C-Jugend zum Thema „Kopfball und Abschluss“. Nutze nur offizielle Inhalte von DFB und fussball.de Training & Service, beachte die Kopfball-Empfehlungen des DFB für die Altersklasse und gib zu jeder Übung den Link an.'},
  {t:'Elternbrief',d:'Infos an die Eltern-Gruppe',p:'Schreib eine kurze Nachricht für die WhatsApp-Gruppe der Eltern unserer E-Jugend: Zu- und Absagen laufen ab sofort über den Gruppenlink der Mannschaft (Namen des Kindes antippen, zu- oder absagen, Grund angeben). Freundlich, maximal 6 Sätze, ohne Namen von Kindern.'}];
function svkiPanel(){ let P=document.getElementById('panel-ki'); if(P)return P;
  const ref=document.getElementById('panel-play'); if(!ref)return null; P=document.createElement('section'); P.className='panel'; P.id='panel-ki'; ref.parentNode.insertBefore(P,ref.nextSibling); return P; }
function svkiRender(){ const P=svkiPanel(); if(!P)return;
  P.innerHTML=`<div class="card svki"><h3 class="trh">🤖 Mit der eigenen KI arbeiten</h3>
      <p>Die Sportzentrale bleibt die Zentrale. Eure KI hilft beim Schreiben, Planen und Vorbereiten. Sie bekommt nur, was ihr ihr gebt, und legt nichts ohne euch ab oder verschickt es.</p>
      <div class="svki-regeln"><div><b>✓ So geht’s</b><span>In der App „Für KI kopieren“ tippen (Spielerakte, Partner), in die KI einfügen, Auftrag unten dazu.</span></div>
        <div><b>✓ Verbinden</b><span>Nur Ablage und Mail: Google Drive, Gmail, Kalender (oder OneDrive, Outlook). Mails immer als Entwurf.</span></div>
        <div><b>✕ Nie</b><span>Keine Datenbank- oder App-Zugänge an eine KI, keine Kinder mit Namen, keine Bankdaten, und die App selbst (Aufbau, Oberfläche, Code) wird nicht kopiert oder nachgebaut.</span></div></div></div>
    <div class="card svki"><h3 class="trh">1. Anweisung für eure KI</h3><p class="note">Einmal als Projekt-, GPT- oder Gem-Anweisung hinterlegen. Dann weiß die KI, wie sie für den Verein arbeitet.</p>
      <pre class="svki-pre" id="svkiA">${svEsc(SVKI_ANWEISUNG)}</pre><button class="btn sm" type="button" data-svkicp="a">${SVI('copy')} Anweisung kopieren</button></div>
    <div class="card svki"><h3 class="trh">2. Verbinden, je nach KI</h3><div class="svki-ai">${SVKI_AI.map(a=>`<details${a.k==='claude'?' open':''}><summary>${svEsc(a.t)}</summary><h5>Verbinden</h5><ul>${a.ver.map(x=>`<li>${svEsc(x)}</li>`).join('')}</ul><h5>So geht’s</h5><ol>${a.wie.map(x=>`<li>${svEsc(x)}</li>`).join('')}</ol></details>`).join('')}</div>
      <p class="note small">Die KI kann eure Einrichtung selbst begleiten: „Hilf mir, Google Drive und Gmail zu verbinden, und leg ein Projekt mit dieser Anweisung an“ plus die Anweisung oben.</p></div>
    <div class="card svki"><h3 class="trh">3. Fertige Aufträge</h3><div class="svki-auf">${SVKI_AUFTRAEGE.map((x,i)=>`<div><b>${svEsc(x.t)}</b><span>${svEsc(x.d)}</span><button class="btn sm ghost" type="button" data-svkicp="${i}">${SVI('copy')} Kopieren</button></div>`).join('')}</div></div>`;
  P.querySelectorAll('[data-svkicp]').forEach(b=>b.onclick=()=>kCopy(b.dataset.svkicp==='a'?SVKI_ANWEISUNG:SVKI_AUFTRAEGE[+b.dataset.svkicp].p));
}
{ const _gt=goTab; goTab=function(tab){ if(tab==='ki')svkiPanel(); const r=_gt.apply(this,arguments); try{ if(svCurTab()==='ki')svkiRender(); }catch(e){ console.warn('KI',e); } return r; }; }
/* Partner: „Für KI kopieren“ (Stand, Verlauf, passende Stufen, ohne Bankdaten) */
function svkiSponsor(id){
  const x=SPO.S.find(s=>s.id===id); if(!x)return ''; const K=SPO.K.filter(k=>k.sponsor===id).slice(0,8), V=SPO.V.filter(v=>v.sponsor===id);
  return [`Firma: ${x.firma}${x.branche?' ('+x.branche+')':''}${x.ort?', '+x.ort:''}`,x.ansprechpartner?`Ansprechpartner: ${x.ansprechpartner}${x.funktion?', '+x.funktion:''}`:'',`Stand: ${SPO_STL[x.status]}${x.bestand?', Bestandspartner':''}`,
    x.naechster?`Nächster Schritt: ${x.naechster}`:'',x.notiz?`Notiz: ${x.notiz}`:'',K.length?'Verlauf: '+K.map(k=>`${spoDat(k.am)} ${SPO_ART[k.art][1]}${k.notiz?' ('+k.notiz+')':''}`).join('; '):'Noch kein Kontakt.',
    V.length?'Verträge: '+V.map(v=>`${SPO_STUFE[v.stufe].t} ab ${svtSL(v.beginn)}, ${v.saisons} Saison(s)`).join('; '):'',
    'Partnerstufen laut Partnersheet 2027/28: '+Object.values(SPO_STUFE).map(s=>`${s.t} ${s.p} € je Saison (${s.d})`).join(' | ')+'. Laufzeit: 2 Saisons −5 % je Saison und Preisgarantie, 3 Saisons −10 % je Saison, Preisgarantie, garantierter Platz und Standard-Werbebande inklusive (sofern Bestandteil des Pakets). Partner des Tages: Supporter 189 €, Club 169 €, Premium 149 €, beim 1896 Partner 1 Heimspiel je Saison inklusive. Zusatzoptionen: Trikotsatz-Patenschaft Jugend 350 €, Business Treff als Gastgeber 250 €. Alle Preise netto. Wichtig: Wir sagen immer Partner, nie Sponsor.'].filter(Boolean).join('\n');
}
{ const _ss=spoSponsor; spoSponsor=function(id){ const r=_ss.apply(this,arguments);
  try{ const M=document.getElementById('modal'), ed=M&&M.querySelector('#spoEd'); if(ed&&!M.querySelector('#spoKi')){ const b=document.createElement('button'); b.className='btn sm ghost'; b.type='button'; b.id='spoKi'; b.innerHTML=SVI('copy')+' Für KI kopieren'; ed.after(b); b.onclick=()=>kCopy(svkiSponsor(id)); } }catch(e){}
  return r; }; }

/* =====================================================================
   Sportzentrale Beta 0.24 · Organisation
   - Verein → „Vorstand & Ziele“: wer macht was, Bereiche mit Aufgaben und Helfern, Gremien, Grundsätze, Ziele 2030
   - Nutzerverwaltung → Mannschaften: vorgemerkte Trainer mit „Einladen“ (Name, Mannschaft und Funktion sind schon eingetragen)
   - Mannschaften → Abstimmung: Elterninfo zum Datenschutz zum Kopieren, Löschen der Eltern-Angaben je Kind
   Alle Namen kommen aus der Datenbank, nichts davon steht im Code.
   ===================================================================== */
const ORG={rows:[],loaded:false,busy:false,q:'',open:null};
const ORG_ELTERN=`Kurz zum Datenschutz bei unseren Zu- und Absagen:
• Auf der Seite steht nur der Vorname und der erste Buchstabe des Nachnamens eures Kindes. Gespeichert wird nur, ob es kommt, und auf Wunsch ein kurzer Grund (krank, verletzt, Urlaub, Schule, privat).
• Keine Telefonnummern, keine E-Mail-Adressen, keine Fotos, kein Konto, keine Werbung.
• Sehen können das nur die Trainer und Betreuer der Mannschaft und der Vorstand. Nichts wird an andere weitergegeben.
• Das Handy merkt sich, welches Kind eures ist, damit es oben steht. Das bleibt nur auf eurem Gerät.
• Antworten werden nach 180 Tagen automatisch gelöscht. Auf Wunsch löschen wir sie sofort, sagt einfach dem Trainer Bescheid.
Wer nicht mitmachen möchte, sagt wie bisher direkt beim Trainer zu oder ab.`;

async function orgLoad(force){
  if(ORG.busy||(ORG.loaded&&!force))return; ORG.busy=true;
  try{ const {data,error}=await SVB.sb.from('organigramm').select('id,art,titel,verantwortlich,stellv,aufgaben,helfer,notiz,app_tab,sicht,erreicht,sort').order('sort'); if(error)throw error; ORG.rows=data||[]; }
  catch(e){ console.warn('Organigramm',e); ORG.rows=[]; }
  ORG.loaded=true; ORG.busy=false;
  try{ if(document.querySelector('#panel-verein.active')&&VR.view==='org')vrRender(); }catch(e){}
}
const orgIni=n=>String(n||'').replace(/\(.*?\)/g,'').trim().split(/\s+/).filter(Boolean).map(w=>w[0]).slice(0,2).join('').toUpperCase()||'?';
const orgName=s=>String(s||'').replace(/\s*\(.*?\)\s*/g,' ').trim();
function orgArt(a){ return ORG.rows.filter(r=>r.art===a).sort((x,y)=>x.sort-y.sort); }
/* Alle Aufgaben einer Person über alle Bereiche */
function orgPerson(q){
  const s=q.trim().toLowerCase(); if(s.length<2)return [];
  const M=new Map(), add=(name,was)=>{ const n=orgName(name); if(!n||n==='vakant'||!n.toLowerCase().includes(s))return; if(!M.has(n))M.set(n,[]); M.get(n).push(was); };
  ORG.rows.forEach(r=>{
    if(r.verantwortlich)add(r.verantwortlich, r.art==='leitung'?r.titel:r.titel+' (verantwortlich)');
    if(r.stellv)String(r.stellv).split(',').forEach(n=>add(n,r.titel+' (Stellvertretung)'));
    (r.helfer||[]).forEach(h=>add(h.name,r.titel+(h.rolle?': '+h.rolle:'')));
  });
  return [...M.entries()].sort((a,b)=>b[1].length-a[1].length||a[0].localeCompare(b[0],'de'));
}
function orgBereichHtml(r){
  const open=ORG.open===r.id, H=r.helfer||[], edit=canManage();
  const appOk=r.app_tab&&(typeof svTabAllowed!=='function'||svTabAllowed(r.app_tab));
  return `<div class="org-b${open?' open':''}" data-orgb="${svEsc(r.id)}">
    <button type="button" class="org-bh" data-orgt="${svEsc(r.id)}" aria-expanded="${open}"><span class="org-bt">${svEsc(r.titel)}</span>
      <span class="org-bv"><span class="org-av">${svEsc(orgIni(r.verantwortlich))}</span><span><b>${svEsc(r.verantwortlich||'offen')}</b>${r.stellv?`<small>Stellv. ${svEsc(r.stellv)}</small>`:''}</span></span>
      <span class="org-bm">${H.length?`${SVI('users')} ${H.length}`:''}${(r.aufgaben||[]).length?` · ${(r.aufgaben||[]).length} Aufgaben`:''}<i>${SVI('chev')}</i></span></button>
    ${open?`<div class="org-bd">
      ${(r.aufgaben||[]).length?`<ul class="org-ul">${r.aufgaben.map(a=>`<li>${svEsc(a)}</li>`).join('')}</ul>`:''}
      ${r.notiz?`<p class="org-note">${svEsc(r.notiz)}</p>`:''}
      ${H.length?`<div class="org-hl">${H.map(h=>`<span class="org-h"><b>${svEsc(h.name)}</b>${h.rolle?`<i>${svEsc(h.rolle)}</i>`:''}</span>`).join('')}</div>`:''}
      <div class="btnrow">${appOk?`<button type="button" class="btn sm" data-orggo="${svEsc(r.app_tab)}">${SVI('chev')} In der App öffnen</button>`:''}${edit?`<button type="button" class="btn sm ghost" data-orged="${svEsc(r.id)}">Bearbeiten</button>`:''}</div>
    </div>`:''}</div>`;
}
function orgZielHtml(L,t){
  const n=L.filter(z=>z.erreicht).length, edit=canManage();
  return `<div class="org-zg"><div class="org-zh"><b>${t}</b><span>${n} von ${L.length}</span></div><div class="org-zbar"><i style="width:${L.length?Math.round(n/L.length*100):0}%"></i></div>
    ${L.map(z=>`<button type="button" class="org-z${z.erreicht?' ok':''}" data-orgz="${svEsc(z.id)}" ${edit?'':'disabled'} aria-pressed="${z.erreicht}"><span class="org-zc">${z.erreicht?SVI('check'):''}</span><span>${svEsc(z.titel)}</span></button>`).join('')}</div>`;
}
function vrViewOrg(B){
  if(!ORG.loaded){ B.innerHTML='<div class="card"><div class="empty">Lade Organisation …</div></div>'; orgLoad(); return; }
  if(!ORG.rows.length){ B.innerHTML=`<div class="card"><div class="empty">Noch kein Organigramm hinterlegt.</div></div>`; return; }
  const lei=orgArt('leitung'), ber=orgArt('bereich'), gre=orgArt('gremium'), pri=orgArt('prinzip'), zv=orgArt('ziel_verein'), zs=orgArt('ziel_sport');
  const hits=orgPerson(ORG.q);
  B.innerHTML=`<div class="card org-top">
      <div class="org-search">${SVI('search')}<input id="orgQ" type="search" placeholder="Wer macht was? Namen eingeben" value="${svEsc(ORG.q)}" autocomplete="off" enterkeyhint="search"></div>
      <div id="orgHits">${orgHitsHtml(hits)}</div>
      <div class="org-lei">${lei.filter(r=>r.verantwortlich).map(r=>`<div class="org-p"><span class="org-av lg">${svEsc(orgIni(r.verantwortlich))}</span><div><b>${svEsc(r.verantwortlich)}</b><small>${svEsc(r.titel)}</small></div></div>`).join('')}</div>
      ${lei.filter(r=>!r.verantwortlich&&(r.helfer||[]).length).map(r=>`<p class="note small">${svEsc(r.titel)}: ${r.helfer.map(h=>svEsc(h.name)).join(', ')}</p>`).join('')}
    </div>
    <h3 class="org-sec">${SVI('layers')} Bereiche</h3>
    <div class="org-grid">${ber.map(orgBereichHtml).join('')}</div>
    ${zv.length||zs.length?`<h3 class="org-sec">${SVI('target')} Ziele bis Juni 2030 <small>daran lassen wir uns messen</small></h3><div class="card org-ziele">${orgZielHtml(zv,'Verein')}${orgZielHtml(zs,'Sport')}</div>`:''}
    ${gre.length?`<h3 class="org-sec">${SVI('clock')} Treffen und Kommunikation</h3><div class="card">${gre.map(g=>`<div class="org-g"><b>${svEsc(g.titel)}</b>${(g.aufgaben||[]).length?`<span>${g.aufgaben.map(svEsc).join(' · ')}</span>`:''}${g.notiz?`<p class="note">${svEsc(g.notiz)}</p>`:''}</div>`).join('')}</div>`:''}
    ${pri.length?`<h3 class="org-sec">${SVI('shield')} Grundsätze</h3><div class="card">${pri.map(p=>p.sicht==='kader'?`<details class="org-g"><summary><b>${svEsc(p.titel)}</b> <span class="pill">nur Kaderplanung</span></summary>${(p.aufgaben||[]).length?`<ul class="org-ul">${p.aufgaben.map(a=>`<li>${svEsc(a)}</li>`).join('')}</ul>`:''}${p.notiz?`<p class="note">${svEsc(p.notiz)}</p>`:''}</details>`:`<div class="org-pr">${SVI('check')}<span>${svEsc(p.titel)}</span></div>`).join('')}</div>`:''}`;
  const q=B.querySelector('#orgQ'); q.oninput=()=>{ ORG.q=q.value; B.querySelector('#orgHits').innerHTML=orgHitsHtml(orgPerson(ORG.q)); };
  B.querySelectorAll('[data-orgt]').forEach(b=>b.onclick=()=>{ ORG.open=ORG.open===b.dataset.orgt?null:b.dataset.orgt; vrViewOrg(B); const el=B.querySelector(`[data-orgb="${ORG.open}"]`); if(el&&el.scrollIntoView)el.scrollIntoView({block:'nearest',behavior:'smooth'}); });
  B.querySelectorAll('[data-orggo]').forEach(b=>b.onclick=()=>goTab(b.dataset.orggo));
  B.querySelectorAll('[data-orged]').forEach(b=>b.onclick=()=>orgEdit(b.dataset.orged));
  B.querySelectorAll('[data-orgz]').forEach(b=>b.onclick=async()=>{ const z=ORG.rows.find(r=>r.id===b.dataset.orgz); if(!z)return; const neu=!z.erreicht; z.erreicht=neu; vrViewOrg(B);
    const {error}=await SVB.sb.rpc('organigramm_save',{p:{id:z.id,erreicht:neu}}); if(error){ z.erreicht=!neu; vrViewOrg(B); kToast('⚠️ '+error.message); } else kToast(neu?'✓ Ziel erreicht':'Wieder offen'); });
}
function orgHitsHtml(hits){
  if(!ORG.q.trim())return '';
  if(!hits.length)return '<p class="note small">Niemand gefunden.</p>';
  return `<div class="org-hits">${hits.slice(0,6).map(([n,L])=>`<div class="org-hit"><span class="org-av">${svEsc(orgIni(n))}</span><div><b>${svEsc(n)}</b><small>${L.map(svEsc).join(' · ')}</small></div></div>`).join('')}</div>`;
}
function orgEdit(id){
  const r=ORG.rows.find(x=>x.id===id); if(!r||!canManage())return;
  const M=svModal(`<div class="mhead"><div><h2 style="margin:0">${svEsc(r.titel)}</h2><div class="msub">Änderungen sehen alle Mitglieder unter Verein, Vorstand und Ziele.</div></div></div>
    <div class="editgrid" style="grid-template-columns:1fr 1fr">
      <div class="field"><label for="orgV">Verantwortlich</label><input id="orgV" value="${svEsc(r.verantwortlich||'')}"></div>
      <div class="field"><label for="orgS">Stellvertretung</label><input id="orgS" value="${svEsc(r.stellv||'')}"></div>
      <div class="field" style="grid-column:1/-1"><label for="orgA">Aufgaben, eine pro Zeile</label><textarea id="orgA" rows="5">${svEsc((r.aufgaben||[]).join('\n'))}</textarea></div>
      <div class="field" style="grid-column:1/-1"><label for="orgH">Helfer, eine Person pro Zeile, Rolle nach Komma</label><textarea id="orgH" rows="6" placeholder="Vorname Nachname, Aufgabe">${svEsc((r.helfer||[]).map(h=>h.name+(h.rolle?', '+h.rolle:'')).join('\n'))}</textarea></div>
      <div class="field" style="grid-column:1/-1"><label for="orgN">Notiz</label><textarea id="orgN" rows="3">${svEsc(r.notiz||'')}</textarea></div>
    </div>
    <div class="btnrow sbact"><button class="btn" id="orgOk">Speichern</button><button class="btn ghost" id="orgNo">Abbrechen</button></div>`);
  M.querySelector('#orgNo').onclick=()=>closeOverlay();
  M.querySelector('#orgOk').onclick=async ev=>{ const b=ev.currentTarget; b.disabled=true;
    const lines=v=>v.split('\n').map(s=>s.trim()).filter(Boolean);
    const p={id,verantwortlich:M.querySelector('#orgV').value,stellv:M.querySelector('#orgS').value,aufgaben:lines(M.querySelector('#orgA').value),
      helfer:lines(M.querySelector('#orgH').value).map(l=>{ const i=l.indexOf(','); return i<0?{name:l,rolle:''}:{name:l.slice(0,i).trim(),rolle:l.slice(i+1).trim()}; }),notiz:M.querySelector('#orgN').value};
    const {error}=await SVB.sb.rpc('organigramm_save',{p}); b.disabled=false;
    if(error){ kToast('⚠️ '+error.message); return; }
    kToast('✓ Gespeichert'); closeOverlay(); await orgLoad(true); };
}
/* In „Verein“ einhängen: eigener Reiter, für alle Mitglieder */
SV_PAGES.verein=['Verein','Rankings, Helfer & Veranstaltungen, Allzeit-Statistik, Vorstand und Ziele'];
{ const _vr=vrRender; vrRender=function(){
    const want=VR.view==='org';
    if(want)VR.view='allzeit';
    const r=_vr.apply(this,arguments);
    if(want)VR.view='org';
    const P=document.getElementById('panel-verein'); if(!P)return r;
    const tabs=P.querySelector('.trtabs'); if(tabs&&!tabs.querySelector('[data-vrv="org"]')){
      const b=document.createElement('button'); b.dataset.vrv='org'; b.textContent='Vorstand & Ziele'; tabs.appendChild(b);
      b.onclick=()=>{ VR.view='org'; vrRender(); }; }
    if(want){ const ta=P.querySelector('.tract'); if(ta)ta.hidden=true; tabs.querySelectorAll('[data-vrv]').forEach(x=>x.classList.toggle('on',x.dataset.vrv==='org')); const B=document.getElementById('vrBody'); if(B)vrViewOrg(B); }
    return r; }; }

/* ---------- Nutzerverwaltung: vorgemerkte Trainer ---------- */
let ORG_VM=[];
async function orgVmLoad(){ const {data,error}=await SVB.sb.from('mannschaft_vormerkung').select('id,mannschaft,name,funktion,notiz').order('created_at'); if(error){ console.warn('Vormerkung',error); ORG_VM=[]; return; } ORG_VM=data||[]; }
{ const _tc=svrTeamsCard; svrTeamsCard=async function(){
    const r=await _tc.apply(this,arguments);
    try{ await orgVmLoad(); orgVmRender(); }catch(e){ console.warn('Vormerkung',e); }
    return r; }; }
function orgVmRender(){
  const c=document.getElementById('svrTeamsCard'); if(!c)return;
  c.querySelectorAll('.svr-team').forEach(t=>{
    const add=t.querySelector('[data-svradd]'); if(!add)return; const mid=add.dataset.svradd;
    const L=ORG_VM.filter(v=>v.mannschaft===mid); let box=t.querySelector('.org-vm'); if(box)box.remove();
    box=document.createElement('div'); box.className='org-vm';
    box.innerHTML=`${L.map(v=>`<span class="org-vmi" title="${svEsc(v.notiz||'')}"><i>vorgemerkt · ${svEsc(SVR_FUNK[v.funktion]||v.funktion)}</i>${svEsc(v.name)}<button type="button" class="btn sm" data-vminv="${svEsc(v.id)}">Einladen</button><button type="button" class="org-vmx" data-vmx="${svEsc(v.id)}" aria-label="Vormerkung entfernen" title="Entfernen">✕</button></span>`).join('')}
      <button type="button" class="svr-add" data-vmadd="${svEsc(mid)}">${SVI('plus')} Vormerken</button>`;
    t.querySelector('.svr-tp').appendChild(box);
  });
  c.querySelectorAll('[data-vminv]').forEach(b=>b.onclick=()=>orgVmInvite(b.dataset.vminv));
  c.querySelectorAll('[data-vmx]').forEach(b=>b.onclick=async()=>{ if(b.dataset.sure!=='1'){ b.dataset.sure='1'; b.textContent='Sicher?'; b.classList.add('sure'); return; }
    const {error}=await SVB.sb.rpc('vormerkung_delete',{p_id:b.dataset.vmx}); if(error){ kToast('⚠️ '+error.message); return; } kToast('Vormerkung entfernt'); await orgVmLoad(); orgVmRender(); });
  c.querySelectorAll('[data-vmadd]').forEach(b=>b.onclick=()=>orgVmAdd(b.dataset.vmadd));
}
function orgVmAdd(mid){
  const m=SVR.mann.find(x=>x.id===mid)||{};
  const M=svModal(`<div class="mhead"><div><h2 style="margin:0">${svEsc(m.name||'')}: Person vormerken</h2><div class="msub">Für Trainer oder Betreuer, die noch keinen Zugang haben. Die E-Mail-Adresse trägst du erst beim Einladen ein.</div></div></div>
    <div class="editgrid" style="grid-template-columns:1fr 1fr"><div class="field"><label for="vmN">Name</label><input id="vmN" placeholder="Vorname Nachname" autocomplete="off"></div>
    <div class="field"><label for="vmF">Funktion</label><select id="vmF">${Object.entries(SVR_FUNK).map(([k,t])=>`<option value="${k}">${svEsc(t)}</option>`).join('')}</select></div></div>
    <div class="btnrow sbact"><button class="btn" id="vmOk">Vormerken</button><button class="btn ghost" id="vmNo">Abbrechen</button></div>`);
  M.querySelector('#vmNo').onclick=()=>closeOverlay(); const n=M.querySelector('#vmN'); n.focus();
  M.querySelector('#vmOk').onclick=async()=>{ if(!n.value.trim()){ n.focus(); return; }
    const {error}=await SVB.sb.rpc('vormerkung_save',{p:{mannschaft:mid,name:n.value.trim(),funktion:M.querySelector('#vmF').value}}); if(error){ kToast('⚠️ '+error.message); return; }
    kToast('✓ Vorgemerkt'); closeOverlay(); await orgVmLoad(); orgVmRender(); };
}
/* Einladen: Formular oben ausfüllen, nur noch die E-Mail fehlt */
function orgVmInvite(id){
  const v=ORG_VM.find(x=>x.id===id); const f=document.getElementById('svInv'); if(!v||!f)return;
  const nm=f.querySelector('#svInvName'), rs=f.querySelector('#svInvRole'), tm=f.querySelector('#svInvTeam'), fk=f.querySelector('#svInvFunk'), ml=f.querySelector('#svInvMail');
  const art=(SVR.mann.find(m=>m.id===v.mannschaft)||{}).art;
  nm.value=/^[A-ZÄÖÜ][a-zäöü]{0,2}\.\s/.test(v.name)?'':v.name;   // abgekürzte Vornamen (z.B. „St. Knapp“) nicht übernehmen, damit der volle Name eingetragen wird
  if(!nm.value)nm.placeholder=v.name+' (vollen Namen eintragen)';
  const want=art==='jugend'?'jugend':'trainer'; if([...rs.options].some(o=>o.value===want))rs.value=want; rs.dispatchEvent(new Event('change'));
  if(tm){ tm.value=v.mannschaft; tm.dispatchEvent(new Event('change')); } if(fk)fk.value=v.funktion;
  [nm,rs,ml].forEach(x=>x.dispatchEvent(new Event('input')));
  ORG._vm=v.id;
  f.scrollIntoView({behavior:'smooth',block:'center'}); setTimeout(()=>{ (nm.value?ml:nm).focus({preventScroll:true}); },350);
  kToast(nm.value?'Nur noch die E-Mail eintragen':'Vollen Namen und E-Mail eintragen');
}
{ const _adm2=SVB.admin; SVB.admin=async function(action,payload){
    const r=await _adm2.apply(this,arguments);
    if(action==='invite'&&ORG._vm&&r&&r.user_id){ const id=ORG._vm; ORG._vm=null; try{ await SVB.sb.rpc('vormerkung_delete',{p_id:id}); }catch(e){} }
    return r; }; }

/* ---------- Mannschaften: Elterninfo und Löschen ---------- */
{ const _ab=svtAbstimmung; svtAbstimmung=async function(B){
    const r=await _ab.apply(this,arguments);
    try{ const m=svtM(SVT.team); if(m&&m.abstimmung&&!B.querySelector('#orgEl')){
      const c=document.createElement('div'); c.className='card'; c.id='orgEl';
      c.innerHTML=`<h3 class="trh">${SVI('shield')} Datenschutz für die Eltern</h3>
        <p class="note">Schick diesen Text einmal mit dem Link in die Gruppe. Dann weiß jeder, was gespeichert wird und was nicht.</p>
        <details class="org-g"><summary><b>Text ansehen</b></summary><p class="org-eltern">${svEsc(ORG_ELTERN).replace(/\n/g,'<br>')}</p></details>
        <div class="btnrow"><button class="btn ghost" id="orgElC" type="button">${SVI('copy')} Text kopieren</button><a class="btn ghost" href="https://wa.me/?text=${encodeURIComponent(ORG_ELTERN)}" target="_blank" rel="noopener">${SVI('chat')} In die Gruppe</a></div>
        <p class="note small">Will jemand, dass die Angaben seines Kindes sofort weg sind: im Kader das Kind antippen, dann „Eltern-Angaben löschen“.</p>`;
      const first=B.querySelector('.card'); if(first)first.after(c); else B.appendChild(c);
      c.querySelector('#orgElC').onclick=()=>kCopy(ORG_ELTERN); } }catch(e){ console.warn('Elterninfo',e); }
    return r; }; }
{ const _sm=svtSpielerModal; svtSpielerModal=function(sid){
    const r=_sm.apply(this,arguments);
    try{ const row=document.querySelector('#modal #svtRaus'); if(row&&!document.getElementById('orgRmDel')){
      const b=document.createElement('button'); b.type='button'; b.className='btn sm ghost'; b.id='orgRmDel'; b.textContent='Eltern-Angaben löschen';
      row.after(b);
      b.onclick=async()=>{ if(b.dataset.sure!=='1'){ b.dataset.sure='1'; b.textContent='Alle Zu- und Absagen löschen?'; b.classList.add('sure'); return; }
        try{ const n=await svtRpc('team_rueckmeldung_loeschen',{p_spieler:sid}); kToast('✓ '+(n||0)+' Angaben gelöscht'); b.remove(); await svtReload(); }catch(e){ svtErr(e); } }; } }catch(e){ console.warn(e); }
    return r; }; }

/* =====================================================================
   Sportzentrale Beta 0.25 · Termine (Kalender für alle)
   - Spiele der Ersten, Zweiten, SOMA und Jugend, Veranstaltungen, Geburtstage (nur Erwachsene)
   - Filter unten: jeder wählt selbst, was er sieht. Standard: Erste, Zweite, Veranstaltungen
     (Jugendtrainer: ihre Mannschaften und Veranstaltungen). Wird pro Person gemerkt.
   - Liste und Monat, Tippen öffnet Details mit „In den Kalender“ und „Teilen“
   - Abo: persönliches Kalender-Abo, öffentlicher Spielplan zum Teilen, .ics-Datei
   - Veranstaltungen anlegen und ändern: Admin, Vorstand und freigeschaltete Personen
   ===================================================================== */
const KAL={items:[],von:null,bis:null,loaded:false,busy:false,f:null,view:'liste',monat:null,tag:null,flags:{},t:0,wap:false};
const KAL_FARBE={h1:'#3b7bff',h2:'#14b8a6',soma:'#a855f7',event:'#f59e0b',geb:'#ec4899',jugend:'#22c55e'};
const KAL_EART={kerwe:['🎪','Kerwe'],weihnachten:['🎄','Advent & Weihnachten'],heimspiel:['🏟️','Heimspiel-Dienst'],arbeitseinsatz:['🛠️','Arbeitseinsatz'],turnier:['🏆','Turnier'],
  saisonfeier:['🎉','Saisonfeier'],mannschaft:['🍻','Mannschaft'],jugend:['⚽','Jugend'],sonstiges:['📌','Sonstiges']};
const KAL_WT=['So','Mo','Di','Mi','Do','Fr','Sa'], KAL_MON=['Januar','Februar','März','April','Mai','Juni','Juli','August','September','Oktober','November','Dezember'];
const KAL_HEIM='Weschnitztalstadion, Mörlenbach';

SVR_TAB.kalender='termine';
SV_TBL.kalender=['cal','Termine'];
Object.assign(SV_PAGES,{kalender:['Termine','Spiele, Veranstaltungen und Geburtstage. Unten wählst du, was du siehst']});
SV_TABBAR.jugend=['home','teams','kalender'];
if(SV_TABBAR.viewer&&!SV_TABBAR.viewer.includes('kalender'))SV_TABBAR.viewer=['home','kalender','verein','scout'];
{ const _ta=svTabAllowed; svTabAllowed=function(t){ if(t==='kalender'){ const d=svDarf('termine'); return d!==false; } return _ta.apply(this,arguments); }; }
function kalPanel(){ let P=document.getElementById('panel-kalender'); if(P)return P;
  const ref=document.getElementById('panel-home')||document.querySelector('.panel'); if(!ref)return null;
  P=document.createElement('section'); P.className='panel'; P.id='panel-kalender'; ref.parentNode.insertBefore(P,ref.nextSibling); return P; }
{ const _gt=goTab; goTab=function(tab){ if(tab==='kalender')kalPanel(); const r=_gt.apply(this,arguments); try{ document.body.classList.toggle('kal-an',svCurTab()==='kalender'); if(svCurTab()==='kalender')kalRender(); }catch(e){ console.warn('Termine',e); } return r; }; }

/* ---------- Hilfen ---------- */
const kalHeute=()=>{ const d=new Date(); return d.getFullYear()+'-'+String(d.getMonth()+1).padStart(2,'0')+'-'+String(d.getDate()).padStart(2,'0'); };
const kalAdd=(s,n)=>{ const d=new Date(s+'T12:00:00'); d.setDate(d.getDate()+n); return d.getFullYear()+'-'+String(d.getMonth()+1).padStart(2,'0')+'-'+String(d.getDate()).padStart(2,'0'); };
const kalDiff=(a,b)=>Math.round((new Date(a+'T12:00:00')-new Date(b+'T12:00:00'))/86400000);
const kalWt=s=>KAL_WT[new Date(s+'T12:00:00').getDay()];
const kalDM=s=>{ const [y,m,d]=s.split('-'); return d+'.'+m+'.'; };
const kalLang=s=>{ const x=new Date(s+'T12:00:00'); return KAL_WT[x.getDay()]+'., '+kalDM(s)+(x.getFullYear()!==new Date().getFullYear()?x.getFullYear():''); };
function kalRel(s){ const n=kalDiff(s,kalHeute()); return n===0?'Heute':n===1?'Morgen':n===-1?'Gestern':n>1&&n<7?'in '+n+' Tagen':null; }
function kalKey(){ return 'svKalF-'+((window.__SVBC_USER||{}).id||(typeof SVU!=='undefined'&&SVU.id)||''); }
function kalTeam(m){ return (SVR.mann||[]).find(x=>x.id===m)||{}; }
function kalTeamName(m){ return m==='h1'?'Erste':m==='h2'?'Zweite':m==='soma'?'SOMA':(kalTeam(m).kurz||String(m).toUpperCase()); }
function kalWir(m){ return m==='h1'?'SV/BSC Mörlenbach':m==='h2'?'SV/BSC Mörlenbach II':'SV/BSC '+kalTeamName(m); }
function kalFarbe(i){ if(i.k==='event'){ const c=kalCats(i); return c[0]==='event'?KAL_FARBE.event:(KAL_FARBE[c[0]]||KAL_FARBE.jugend); } if(i.k==='geb')return KAL_FARBE.geb; return KAL_FARBE[i.m]||KAL_FARBE.jugend; }
/* Kategorie für den Filter: Spiele nach Mannschaft, Termine nur für Mannschaften bei diesen Mannschaften, sonst „Veranstaltungen“ */
function kalCats(i){ if(i.k==='spiel')return [i.m]; if(i.k==='geb')return ['geb'];
  const S=i.sicht||['alle']; return S.length&&S.every(x=>x.startsWith('team:'))?S.map(x=>x.slice(5)):['event']; }
function kalDarfEdit(){ return !!KAL.flags.bearbeiten; }
function kalDarfAnlegen(){ return !!KAL.flags.bearbeiten||(KAL.flags.teams||[]).length>0; }
const KAL_GRP={alle:'Alle Mitglieder',vorstand:'Vorstand',sponsoring:'Partner-Team',trainerteam:'Trainerteam'};
function kalSichtText(S){ if(!S||S.includes('alle'))return ''; return S.map(x=>x.startsWith('team:')?kalTeamName(x.slice(5)):(KAL_GRP[x]||x)).join(', '); }

/* Filter: gemerkt je Person, sonst sinnvoller Standard nach Rolle */
function kalFilter(){
  if(KAL.f)return KAL.f;
  let s=null; try{ s=JSON.parse(localStorage.getItem(kalKey())||'null'); }catch(e){}
  if(Array.isArray(s)){ KAL.f=new Set(s); return KAL.f; }
  const eigene=(SVR.funk||[]).map(f=>f.mannschaft);
  const std=svRole()==='jugend'?[...eigene,'event']:['h1','h2','event','geb',...eigene];
  const neu=new Set(std); if(SVR.loaded)KAL.f=neu; return neu;   // Standard erst merken, wenn die Rechte geladen sind
}
function kalFilterSave(){ try{ localStorage.setItem(kalKey(),JSON.stringify([...KAL.f])); }catch(e){} }
function kalChips(){
  const T=(SVR.mann||[]).filter(m=>m.id).map(m=>({k:m.id,t:kalTeamName(m.id),c:KAL_FARBE[m.id]||KAL_FARBE.jugend}));
  if(!T.some(x=>x.k==='h1'))T.unshift({k:'h1',t:'Erste',c:KAL_FARBE.h1});
  const L=[...T.filter(x=>['h1','h2'].includes(x.k)),{k:'event',t:'Veranstaltungen',c:KAL_FARBE.event}];
  if(KAL.flags.geb)L.push({k:'geb',t:'Geburtstage',c:KAL_FARBE.geb});
  return L.concat(T.filter(x=>!['h1','h2'].includes(x.k)));
}
function kalSichtbar(){ const f=kalFilter(); return KAL.items.filter(i=>kalCats(i).some(c=>f.has(c))); }

/* ---------- Laden ---------- */
async function kalLoad(von,bis,force){
  const h=kalHeute(); von=von||kalAdd(h,-45); bis=bis||kalAdd(h,330);
  if(!force&&KAL.loaded&&KAL.von<=von&&KAL.bis>=bis&&Date.now()-KAL.t<120000)return;
  if(KAL.busy)return; KAL.busy=true;
  if(KAL.loaded&&!force){ von=von<KAL.von?von:KAL.von; bis=bis>KAL.bis?bis:KAL.bis; }
  try{
    const {data,error}=await SVB.sb.rpc('kalender',{p_von:von,p_bis:bis}); if(error)throw error;
    KAL.items=data.items||[]; KAL.von=von; KAL.bis=bis; KAL.flags={bearbeiten:data.bearbeiten,helfer:data.helfer,geb:data.geb,teams:data.teams||[],treff:!!data.treff}; KAL.loaded=true; KAL.t=Date.now();
    if(!KAL.wap){ KAL.wap=true; try{ const w=await SVB.sb.rpc('wappen_liste'); if(w.data)Object.entries(w.data).forEach(([k,v])=>{ if(!SVC.crest.has(k))SVC.crest.set(k,v); }); }catch(e){} }
  }catch(e){ console.warn('Termine',e); KAL.err=String(e.message||e); }
  KAL.busy=false;
  try{ if(svCurTab()==='kalender')kalRender(); if(svCurTab()==='home')kalHome(); }catch(e){}
}

/* ---------- Darstellung ---------- */
function kalSpielZeile(i,gross){
  const wir=kalWir(i.m), heim=i.heim!==false, a=heim?wir:i.gegner, b=heim?i.gegner:wir;
  const erg=i.erg?(heim?i.erg:i.erg.split(':').reverse().join(':')):'';
  const [w,g]=i.erg?i.erg.split(':').map(Number):[null,null], res=i.erg?(w>g?'s':w===g?'u':'n'):'';
  if(!gross){   // Liste: zwei Zeilen untereinander, Uhrzeit oder Ergebnis rechts. Passt auch bei langen Namen aufs Handy
    const [ea,eb]=erg?erg.split(':'):['',''];
    return `<div class="kal-sp2"><span class="kal-t">${scCrest(a)}<b>${svEsc(a)}</b>${erg?`<em class="kal-e1 ${res}">${svEsc(ea)}</em>`:''}</span><span class="kal-t">${scCrest(b)}<b>${svEsc(b)}</b>${erg?`<em class="kal-e1 ${res}">${svEsc(eb)}</em>`:''}</span></div>`;
  }
  return `<div class="kal-sp${gross?' xl':''}"><span class="kal-t">${scCrest(a,gross?'xl':'')}<b>${svEsc(a)}</b></span>
    ${erg?`<em class="kal-erg ${res}">${svEsc(erg)}</em>`:`<em class="kal-vs">${i.z?svEsc(i.z):'vs'}</em>`}
    <span class="kal-t r">${scCrest(b,gross?'xl':'')}<b>${svEsc(b)}</b></span></div>`;
}
function kalItemHtml(i){
  const c=kalFarbe(i), tag=i.k==='spiel'?kalTeamName(i.m):i.k==='event'?(KAL_EART[i.a]||KAL_EART.sonstiges)[1]:'Geburtstag';
  let body='';
  if(i.k==='spiel'){
    body=kalSpielZeile(i)+`<div class="kal-meta">${[i.z?i.z+' Uhr':'',i.liga,i.heim===true?'Heimspiel':i.heim===false?'Auswärts':''].filter(Boolean).map(svEsc).join(' · ')}</div>`;
  }else if(i.k==='event'){
    const e=KAL_EART[i.a]||KAL_EART.sonstiges;
    body=`<div class="kal-ev"><span class="kal-emo">${e[0]}</span><b>${svEsc(i.t)}</b></div>
      <div class="kal-meta">${kalSichtText(i.sicht)?`<span class="kal-lock">🔒 ${svEsc(kalSichtText(i.sicht))}</span>`:''}${[i.bis&&i.bis!==i.d?'bis '+kalWt(i.bis)+'., '+kalDM(i.bis):'',i.z?i.z+' Uhr':'',i.ort].filter(Boolean).map(svEsc).join(' · ')}${KAL.flags.helfer&&i.hz?` · ${SVI('users')} ${i.hz}`:''}</div>`;
  }else body=`<div class="kal-ev"><span class="kal-emo">🎂</span><b>${svEsc(i.t)}</b><span class="kal-alter">wird ${svEsc(i.alter)}</span></div>`;
  return `<button type="button" class="kal-it${i.d<kalHeute()?' vorbei':''}" data-kid="${svEsc(i.id)}" style="--c:${c}"><i class="kal-bar"></i><div class="kal-b">${body}</div><span class="kal-tag">${svEsc(tag)}</span></button>`;
}
function kalListe(L){
  const h=kalHeute(); let out='', mon='', tag='', heute=false;
  L.forEach(i=>{
    const m=i.d.slice(0,7);
    if(m!==mon){ mon=m; out+=`<h3 class="kal-mon">${KAL_MON[+m.slice(5)-1]} ${m.slice(0,4)}</h3>`; }
    if(!heute&&i.d>=h){ heute=true; out+=`<div class="kal-jetzt" id="kalJetzt"><span>${i.d===h?'Heute':'Als Nächstes'}</span></div>`; }
    if(i.d!==tag){ tag=i.d; const r=kalRel(i.d); out+=`<div class="kal-tagk${i.d===h?' heute':''}"><b>${kalDM(i.d).slice(0,2)}</b><span>${kalWt(i.d)}</span>${r?`<em>${r}</em>`:''}</div>`; }
    out+=kalItemHtml(i);
  });
  if(!heute)out+=`<div class="kal-jetzt" id="kalJetzt"><span>Heute</span></div><p class="note kal-leer">Danach steht in deiner Auswahl noch nichts an.</p>`;
  return out;
}
function kalMonat(L){
  const m=KAL.monat||kalHeute().slice(0,7), [y,mo]=m.split('-').map(Number), erster=new Date(y,mo-1,1), start=(erster.getDay()+6)%7, tage=new Date(y,mo,0).getDate();
  const nach={}; L.forEach(i=>{ let d=i.d; const bis=i.bis&&i.bis>i.d?i.bis:i.d; while(d<=bis){ (nach[d]=nach[d]||[]).push(i); d=kalAdd(d,1); } });
  const h=kalHeute(), sel=KAL.tag&&KAL.tag.startsWith(m)?KAL.tag:(h.startsWith(m)?h:null);
  let g=''; for(let k=0;k<start;k++)g+='<span class="kal-d leer"></span>';
  for(let d=1;d<=tage;d++){ const s=`${m}-${String(d).padStart(2,'0')}`, I=nach[s]||[];
    g+=`<button type="button" class="kal-d${s===h?' heute':''}${s===sel?' sel':''}${I.length?' voll':''}" data-kd="${s}"><b>${d}</b><span>${I.slice(0,4).map(i=>`<i style="--c:${kalFarbe(i)}"></i>`).join('')}</span></button>`; }
  const T=sel?(nach[sel]||[]):[];
  return `<div class="card kal-mcard"><div class="kal-mh"><button type="button" class="iconbtn" data-km="-1" aria-label="Vormonat">‹</button><b>${KAL_MON[mo-1]} ${y}</b><button type="button" class="iconbtn" data-km="1" aria-label="Nächster Monat">›</button></div>
    <div class="kal-grid">${['Mo','Di','Mi','Do','Fr','Sa','So'].map(w=>`<span class="kal-wt">${w}</span>`).join('')}${g}</div></div>
    ${sel?`<h3 class="kal-mon">${kalLang(sel)}</h3>${T.length?T.map(kalItemHtml).join(''):'<p class="note">An diesem Tag steht nichts an.</p>'}`:''}`;
}
function kalRender(){
  const P=kalPanel(); if(!P)return;
  if(!KAL.loaded){ P.innerHTML='<div class="card"><div class="empty">Lade Termine …</div></div>'; kalLoad(); return; }
  const f=kalFilter(), L=kalSichtbar(), chips=kalChips(), adm=svRole()==='admin';
  P.innerHTML=`<div class="trtop kal-top"><div class="trtabs"><button class="${KAL.view==='liste'?'on':''}" data-kv="liste">Liste</button><button class="${KAL.view==='monat'?'on':''}" data-kv="monat">Monat</button></div>
      <div class="tract"><button class="btn ghost" id="kalAbo" type="button">${SVI('cal')} In meinen Kalender</button>${kalDarfAnlegen()?`<button class="btn" id="kalNeu" type="button">${SVI('plus')} Termin</button>`:''}${adm?`<button class="btn ghost" id="kalGeb" type="button" title="Geburtstage einfügen">🎂</button>`:''}</div></div>
    ${KAL.err&&!KAL.items.length?`<div class="card"><div class="empty">Termine konnten nicht geladen werden.</div></div>`:''}
    <div id="kalBody">${KAL.view==='monat'?kalMonat(L):`${KAL.von>'2013-07-01'?`<button type="button" class="btn ghost sm kal-frueher" id="kalFrueher">${SVI('clock')} Frühere Termine laden</button>`:''}${L.length?kalListe(L):'<div class="card"><div class="empty">Unten auswählen, was du sehen willst.</div></div>'}`}</div>
    <div class="kal-fbar" role="group" aria-label="Was angezeigt wird"><div class="kal-fin"><button type="button" class="kal-chip alle${chips.every(c=>f.has(c.k))?' on':''}" data-kfa style="--c:#94a3b8"><i></i>Alle</button>${chips.map(c=>`<button type="button" class="kal-chip${f.has(c.k)?' on':''}" data-kf="${svEsc(c.k)}" style="--c:${c.c}" aria-pressed="${f.has(c.k)}"><i></i>${svEsc(c.t)}</button>`).join('')}</div></div>`;
  P.querySelectorAll('[data-kv]').forEach(b=>b.onclick=()=>{ KAL.view=b.dataset.kv; kalRender(); });
  P.querySelectorAll('[data-kf]').forEach(b=>b.onclick=()=>{ const k=b.dataset.kf; f.has(k)?f.delete(k):f.add(k); kalFilterSave(); const y=window.scrollY; kalRender(); window.scrollTo(0,y); });
  const fa=P.querySelector('[data-kfa]'); if(fa)fa.onclick=()=>{ const alle=chips.every(c=>f.has(c.k)); if(alle){ KAL.f=null; try{ localStorage.removeItem(kalKey()); }catch(e){} kalFilter(); } else chips.forEach(c=>f.add(c.k)); if(!alle)kalFilterSave(); const y=window.scrollY; kalRender(); window.scrollTo(0,y); };
  P.querySelectorAll('[data-kid]').forEach(b=>b.onclick=()=>kalDetail(b.dataset.kid));
  P.querySelectorAll('[data-kd]').forEach(b=>b.onclick=()=>{ KAL.tag=b.dataset.kd; kalRender(); });
  P.querySelectorAll('[data-km]').forEach(b=>b.onclick=async()=>{ const [y,m]=(KAL.monat||kalHeute().slice(0,7)).split('-').map(Number), d=new Date(y,m-1+(+b.dataset.km),1);
    KAL.monat=d.getFullYear()+'-'+String(d.getMonth()+1).padStart(2,'0'); KAL.tag=null; const v=KAL.monat+'-01', e=kalAdd(KAL.monat+'-28',5);
    if(v<KAL.von||e>KAL.bis)await kalLoad(v<KAL.von?v:null,e>KAL.bis?e:null); kalRender(); });
  const fr=P.querySelector('#kalFrueher'); if(fr)fr.onclick=async()=>{ fr.disabled=true; const v=kalAdd(KAL.von,-365); await kalLoad(v<'2013-07-01'?'2013-07-01':v,null); };
  P.querySelector('#kalAbo').onclick=()=>kalAboModal();
  const nb=P.querySelector('#kalNeu'); if(nb)nb.onclick=()=>kalEventForm(null);
  const gb=P.querySelector('#kalGeb'); if(gb)gb.onclick=()=>kalGebImport();
  if(KAL.view==='liste'&&!KAL.gescrollt){ KAL.gescrollt=true; const j=P.querySelector('#kalJetzt'); if(j&&j.getBoundingClientRect().top>window.innerHeight*.6)setTimeout(()=>j.scrollIntoView({block:'start'}),50); }
}

/* ---------- Details, Teilen, einzelner Kalendereintrag ---------- */
function kalItem(id){ return KAL.items.find(i=>String(i.id)===String(id)); }
function kalShareText(i){
  const r=kalRel(i.d), wann=(r&&!/^in /.test(r)?r:kalWt(i.d)+'., '+kalDM(i.d))+(i.z?' um '+i.z+' Uhr':'');
  if(i.k==='spiel'){
    const heim=i.heim!==false;
    return `⚽ ${wann}: ${kalWir(i.m)} ${heim?'empfängt':'spielt bei'} ${i.gegner}${i.liga?' ('+i.liga+')':''}.\n${heim?'📍 '+(i.ort||KAL_HEIM):'📍 Auswärts, fahrt mit!'}\nKommt vorbei und unterstützt uns! 💙🧡`;
  }
  if(i.k==='event'){ const e=KAL_EART[i.a]||KAL_EART.sonstiges; return `${e[0]} ${i.t}\n🗓️ ${wann}${i.bis&&i.bis!==i.d?' bis '+kalWt(i.bis)+'., '+kalDM(i.bis):''}${i.ort?'\n📍 '+i.ort:''}${i.info?'\n'+i.info:''}\nSV/BSC Mörlenbach freut sich auf euch! 💙🧡`; }
  return `🎂 Alles Gute, ${i.t}!`;
