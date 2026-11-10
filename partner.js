/* SV/BSC Mörlenbach · Partner-Präsentation v3 (…/partner.html#d=<code>)
   0.77 Neuaufbau: kein Brief und keine Begrüßung vorab. Einstieg mit Jugendfoto und direktem Weg zu den Paketen.
   Oben laufen fünf Stationen mit (Verein, Was es bewirkt, Pakete, Bausteine, Abschluss), jede frei anspringbar, die Markierung zeigt den Stand.
   Bereiche des Vereins und die vier Pakete als wischbare Karten, ein Tipp nimmt das Paket. Bausteine dazu mit Summe, die unten mitläuft.
   Die drei Fragen sind freiwillig und markieren nur das passende Paket. Abschluss, Vertrag, Unterschrift und Danke unverändert.
   Die Unterschrift des Partners ist sein Angebot; geschlossen ist der Vertrag mit der Gegenzeichnung des Vereins, erst dann kommt die Rechnung mit Girocode.
   Im Termin (geöffnet aus der App, mit Anmeldung im Partner-Team) zusätzlich: Sonderpreis, Sonstiges; mit Vertretungsrecht (Vorstand) die Unterschrift für den Verein.
   Daten und Preise rechnet der Server (partner_praesi, partner_praesi_abschluss), die Anzeige rechnet mit PLIB gleich.
   0.71: Stand bleibt beim Neuladen erhalten, Abschluss mit Schlüssel gegen doppelte Verträge, Warteliste ohne Paket,
   Unterschrift mit glatter Linie, Verfügbarkeit wird still nachgeladen ohne Eingaben zu stören.
   0.72: rechtliche Umstellung (Gegenzeichnung, Impressum, Datenschutz), Runde 12: Datum in deutscher Zeit, Branche der Stufe 1896 vom Server, Rückgängig beim Entfernen. */
(function(){
  'use strict';
  const C=window.PD_CFG||{}, app=document.getElementById('app');
  const esc=s=>String(s==null?'':s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const eur=(n,d)=>PLIB.eur(n,d);
  const hp=new URLSearchParams(location.hash.slice(1)), code=(hp.get('d')||'').toLowerCase();
  const $=s=>document.querySelector(s);
  const WAPPEN='partner/wappen.png';
  const tipp=(m)=>{ try{ navigator.vibrate&&navigator.vibrate(m||8); }catch(e){} };   // kurzes Antippen spüren (Android; iPhone ignoriert es)
  // iPhone ab iOS 18: Umlegen eines Systemschalters löst die Haptik aus. Nur für drei Momente (Ins Paket, Kopiert, Unterschrieben), sonst stumpft es ab
  let hapt=null;
  const tippStark=(m)=>{ tipp(m||14); try{ if(!hapt){ hapt=document.createElement('label'); hapt.setAttribute('aria-hidden','true'); hapt.style.display='none'; const i=document.createElement('input'); i.type='checkbox'; i.setAttribute('switch',''); i.tabIndex=-1; hapt.appendChild(i); document.head.appendChild(hapt); } hapt.click(); }catch(e){} };
  const demo=()=>!!(((D||{}).deck||{}).passung||{}).demo;   // Probeansicht: nichts wird gespeichert oder verschickt
  const sanft=()=>matchMedia('(prefers-reduced-motion: reduce)').matches?'auto':'smooth';
  const fein=()=>matchMedia('(pointer:coarse)').matches;   // Handy oder Tablet

  // Im Termin: Anmeldung aus der App mitnehmen (gleiche Adresse, Supabase speichert die Sitzung im Browser)
  function token(){
    try{ for(let i=0;i<localStorage.length;i++){ const k=localStorage.key(i); if(k!=='svbc-auth'&&!/^sb-.+-auth-token$/.test(k))continue;
      const j=JSON.parse(localStorage.getItem(k)||'null'), s=j&&(j.currentSession||j); if(s&&s.access_token&&(!s.expires_at||s.expires_at*1000>Date.now()+20000))return s.access_token; } }catch(e){}
    return null; }
  let ohneToken=false;
  async function rpc(fn,body,ms,nochmal){ const t=ohneToken?null:token(), ac=('AbortController' in window)?new AbortController():null, to=ac?setTimeout(()=>ac.abort(),ms||20000):0; let r;
    try{ r=await fetch(C.url+'/rest/v1/rpc/'+fn,{method:'POST',headers:{'Content-Type':'application/json',apikey:C.anon,Authorization:'Bearer '+(t||C.anon)},body:JSON.stringify(body||{}),signal:ac?ac.signal:undefined}); }
    catch(e){ const x=new Error('Die Verbindung ist gerade weg. Deine Angaben bleiben stehen. Versuch es gleich noch einmal.'); x.netz=true; throw x; }
    finally{ clearTimeout(to); }
    if(r.status===401&&t&&!nochmal&&!T){ ohneToken=true; return rpc(fn,body,ms,true); }   // Sitzung aus der App ungültig: der Link gilt auch ohne
    const j=await r.json().catch(()=>null);
    // Gateway 5xx oder kaputte Antwort: Der Server kann trotzdem fertig geworden sein. Wie ein Netzabbruch behandeln, damit beim nächsten Tipp derselbe Schlüssel gilt
    if(r.status>=500||r.status===0||(r.ok&&j===null&&r.status!==204)){ const x=new Error('Wir können gerade nicht erkennen, ob deine Angaben angekommen sind. Bitte ändere nichts und drück in einer Minute noch einmal denselben Knopf. Doppelt wird dabei nichts angelegt.'); x.netz=true; x.unklar=true; x.status=r.status; throw x; }
    if(!r.ok){ const eigen=j&&['P0001','42501'].includes(j.code)&&j.message, x=new Error(eigen||'Das hat gerade nicht geklappt. Deine Angaben bleiben stehen. Versuch es gleich noch einmal oder schreib uns kurz.'); x.status=r.status; throw x; } return j; }
  // Kurze Meldung unten; vorgelesen wird sie über eine feste Live-Region (frisch eingefügte werden auf iOS oft verschluckt)
  let toastT=0;
  const toast=t=>{ document.querySelectorAll('.toast').forEach(x=>x.remove()); clearTimeout(toastT); const e=document.createElement('div'); e.className='toast'; e.setAttribute('aria-hidden','true'); e.textContent=t; document.body.appendChild(e);
    const lv=$('#live'); if(lv){ lv.textContent=''; setTimeout(()=>{ lv.textContent=t; },40); }
    e.onclick=()=>e.remove(); toastT=setTimeout(()=>{ e.classList.add('weg'); setTimeout(()=>e.remove(),200); },Math.min(7000,Math.max(2600,1400+t.length*45))); };
  // Hinweis mit „Rückgängig“: sechs Sekunden lang lässt sich ein Tipp zurücknehmen
  const toastZurueck=(t,fn)=>{ document.querySelectorAll('.toast').forEach(x=>x.remove()); clearTimeout(toastT); const e=document.createElement('div'); e.className='toast mit-knopf'; e.setAttribute('role','status');
    e.innerHTML=`<span>${esc(t)}</span><button type="button">Rückgängig</button>`; document.body.appendChild(e);
    // 12 Sekunden; solange Finger, Maus oder Fokus auf dem Knopf sind, läuft keine Zeit ab; Escape schließt
    const zu=()=>{ e.classList.add('weg'); setTimeout(()=>e.remove(),200); }, starten=()=>{ clearTimeout(toastT); toastT=setTimeout(zu,12000); }, kb=e.querySelector('button');
    kb.onclick=()=>{ clearTimeout(toastT); e.remove(); fn(); };
    ['pointerenter','focus'].forEach(t=>kb.addEventListener(t,()=>clearTimeout(toastT))); ['pointerleave','blur'].forEach(t=>kb.addEventListener(t,starten));
    e.addEventListener('keydown',ev=>{ if(ev.key==='Escape'){ clearTimeout(toastT); e.remove(); } }); starten(); };
  const ansage=t=>{ const lv=$('#live'); if(lv){ lv.textContent=''; setTimeout(()=>{ lv.textContent=t; },40); } };
  document.addEventListener('focusin',e=>{ if(/^(INPUT|SELECT|TEXTAREA)$/.test(e.target.tagName))document.querySelectorAll('.toast:not(.mit-knopf)').forEach(x=>x.remove()); });
  document.addEventListener('touchstart',()=>{},{passive:true});   // damit iOS :active zeigt
  // Beträge wie auf der deutschen Tastatur: 25,50 oder 1.250 oder 50 €
  const betrag=v=>{ let t=String(v==null?'':v).replace(/[^\d,.]/g,''); if(!t)return 0; if(t.includes(','))t=t.replace(/\./g,'').replace(',','.'); else if(/^\d{1,3}(\.\d{3})+$/.test(t))t=t.replace(/\./g,''); const n=+t; return isFinite(n)?Math.round(n*100)/100:NaN; };
  const kurzHash=t=>{ let h=5381; for(let i=0;i<t.length;i++)h=((h<<5)+h+t.charCodeAt(i))|0; return (h>>>0).toString(36); };
  const nbsp=t=>String(t||'').replace(/-/g,'\u2011');
  // Zeitstempel (z. B. unterschrieben_am) in deutscher Zeit lesen, reine Datumsfelder wie sie sind
  const datum=d=>{ if(!d)return ''; const t=String(d), tag=t.length>10&&/T\d/.test(t)?iso(t):t.slice(0,10); const x=new Date(tag+'T12:00:00'); return x.toLocaleDateString('de-DE',{day:'2-digit',month:'2-digit',year:'numeric'}); };
  const saisonTxt=d=>{ const y=+String(d).slice(0,4); return String(y%100).padStart(2,'0')+'/'+String((y+1)%100).padStart(2,'0'); };
  // Kalendertag in deutscher Zeit, egal in welcher Zeitzone das Gerät steht (der Server rechnet ebenso mit Europe/Berlin)
  const BERLIN=(()=>{ try{ return new Intl.DateTimeFormat('en-CA',{timeZone:'Europe/Berlin',year:'numeric',month:'2-digit',day:'2-digit'}); }catch(e){ return null; } })();
  function iso(d){ const z=new Date(d); if(BERLIN){ try{ const p={}; BERLIN.formatToParts(z).forEach(x=>{ p[x.type]=x.value; }); if(p.year&&p.month&&p.day)return p.year+'-'+p.month+'-'+p.day; }catch(e){} }
    return z.getFullYear()+'-'+String(z.getMonth()+1).padStart(2,'0')+'-'+String(z.getDate()).padStart(2,'0'); }
  const neuId=()=>{ try{ if(crypto.randomUUID)return crypto.randomUUID(); }catch(e){} return Date.now().toString(36)+'-'+Math.random().toString(36).slice(2,12); };

  // ---------- Welten ----------
  const WELT={
    jugend:{k:'Jugend',titel:'Unsere Jugend',text:'Von den Minikickern bis zur A-Jugend trainiert jede Mannschaft unter der Woche und spielt am Wochenende. Euer Beitrag kommt direkt bei den Kindern an, zum Beispiel als neuer Trikotsatz für eine Mannschaft.',teaser:'Trikots, Bälle und Trainer für die Kinder.'},
    erste:{k:'Die Erste',titel:'Erste Mannschaft',text:'Die Erste ist die Mannschaft, über die im Ort gesprochen wird. Euer Name ist bei jedem Heimspiel dabei, auf dem Trikot oder an der Bande, und später auf den Fotos.',bild:'partner/hero.jpg',pos:'center 40%',alt:'Die Erste des SV/BSC Mörlenbach',teaser:'Trikot und Bande bei jedem Heimspiel.'},
    zweite:{k:'Die Zweite',titel:'Zweite Mannschaft',text:'In der Zweiten spielen Männer, die tagsüber arbeiten und abends zum Training kommen. Dazu kommen Spieler aus der A-Jugend, die hier ihre ersten Spiele bei den Herren machen.',teaser:'Trikot und Ärmel der Zweiten.'},
    events:{k:'Zeltlager und Turniere',titel:'Zeltlager und Turniere',text:'Zeltlager, Ferienspiele und Turniere der Jugend. Euer Banner hängt dort, wo an diesen Tagen alle zusammenkommen: Kinder, Eltern und Trainer.',teaser:'Zeltlager, Ferienspiele und Turniere.'},
    verein:{k:'Der ganze Verein',titel:'Der ganze Verein',text:'Mit einem Paket steht ihr hinter dem ganzen Verein, von den Minikickern bis zur Ersten. Je nach Paket gehören die Partnerwand, eine eigene Bande, Karten für die Heimspiele und die Treffen unserer Partner dazu.',teaser:'Vier Pakete, dazu eure Stellenanzeige bei uns.'}};
  const ZWECK_PARTNER={Jugend:'die Jugend des SV/BSC',Zeltlager:'das Zeltlager der Jugend',Ferienspiele:'die Ferienspiele',Erste:'die Erste','Erste Mannschaft':'die Erste','Zweite Mannschaft':'die Zweite',Verein:'den Verein'};
  const ZWECK_VERTRAG={Jugend:'seine Jugendabteilung',Zeltlager:'das Zeltlager seiner Jugend',Ferienspiele:'seine Ferienspiele','Erste Mannschaft':'seine erste Mannschaft','Zweite Mannschaft':'seine zweite Mannschaft',Verein:'seine Fußballabteilung'};
  const ZWECK_TXT={Jugend:'unsere Jugend',Zeltlager:'das Zeltlager',Ferienspiele:'die Ferienspiele','Erste Mannschaft':'die Erste','Zweite Mannschaft':'die Zweite',Verein:'den Verein'}, zweckTxt=z=>ZWECK_TXT[z]||'den Verein';
  const BUDGET=[['bis250','bis 250 €',250],['bis1000','250 bis 1.000 €',1000],['bis2500','1.000 bis 2.500 €',2500],['mehr','über 2.500 €',6000],['offen','noch offen',1500]];
  const ZIELE_PRAESI=['jugend','sichtbarkeit','mitarbeiter','netzwerk','events','spende'];
  const ZIEL_TEXT={jugend:'Jugend fördern',sichtbarkeit:'Im Ort sichtbar sein',mitarbeiter:'Azubis und Fachkräfte finden',netzwerk:'Andere Betriebe kennenlernen',events:'Bei Festen dabei sein',spende:'Einfach helfen'};
  const STUFE=['supporter','club','premium','p1896'];

  let D=null, L=[], M=[], T=false;
  // Termin mit Recht für Verträge: nur dann Sonderpreis, Sonstiges und Unterschrift für den Verein (der Server prüft dasselbe Recht)
  const TV=()=>T&&!!D&&D.vertrag_darf!==false;
  // Im Termin unterschreibt der Verein nur mit, wer ihn vertreten darf (Vorstand); sonst zeichnet er später gegen
  const VS=()=>TV()&&D.gegenzeichnen_darf===true;
  // Geschlossen ist der Vertrag erst mit der Unterschrift des Vereins (gegengezeichnet), vorher ist die Unterschrift des Partners sein Angebot
  const fest=R=>!!R&&(R.status==='aktiv'||!!R.gegengezeichnet_am);
  const S={alle:new Set(),ziele:new Set(),herz:new Set(),budget:'',team:null,offen:new Set(),korb:[],saisons:1,start:[2,3,4,5].includes(new Date().getMonth())?'naechste':'jetzt',startWahl:[2,3,4,5].includes(new Date().getMonth()),auto:false,wl:[],
    weg:null,bf:'alle',F:{},zust:false,nenn:true,befugt:false,sig:{p:false,v:false},unterzeichner:'',ergebnis:null,busy:false,spende:{betrag:0,zweck:'Jugend'},idem:null,vsig:null,vmodus:null,neuHinweis:false,neu:null,trotz:false};
  const lk=k=>L.find(x=>x.key===k);
  // Bei Glücksspiel, Alkohol und Ähnlichem: keine Werbung auf Jugendkleidung (im Deck „ohne Jugend-Trikot“)
  const JUGEND_KLEIDUNG=['trikot_jugend','aufwaerm_jugend'];
  function filtern(ls){ const ohne=((D&&D.deck&&D.deck.passung)||{}).ohne||[]; return ohne.includes('trikot')?ls.filter(l=>!JUGEND_KLEIDUNG.includes(l.key)):ls; }
  let uid=0;

  // ---------- Stand merken (Neuladen, Wechsel in die Banking-App, Link später nochmal öffnen) ----------
  const SKEY='pd-'+code;
  const ablage=()=>{ try{ return T?sessionStorage:localStorage; }catch(e){ return null; } };
  // Oberster sichtbarer Abschnitt und Versatz, damit man nach dem Neuladen an derselben Stelle weiterliest
  function stelle(){ if(!S.posBereit)return S.pos||null; const k=$('.top'), oben=(k?k.offsetHeight:60)+2; let best=null;
    document.querySelectorAll('#app > section[id]').forEach(el=>{ if(el.hidden||!el.offsetHeight)return; const t=el.getBoundingClientRect().top; if(t<=oben+1&&(!best||t>best.t))best={id:el.id,t}; });
    return best?{id:best.id,off:Math.round(oben-best.t)}:null; }
  function merken(){ const st=ablage(); if(!st||!D)return;
    const fe=fertig(), F0=fe?{firma:S.F.firma,anrede:S.F.anrede,ansprech:S.F.ansprech,email:S.F.email}:S.F;
    try{ st.setItem(SKEY,JSON.stringify({t:Date.now(),korb:S.korb,wl:S.wl,saisons:S.saisons,start:S.start,auto:S.auto,F:F0,herz:[...S.herz],ziele:[...S.ziele],budget:S.budget,team:S.team,ergebnis:demo()||!S.ergebnis?null:Object.assign({},S.ergebnis,{spendeBody:undefined}),angebot:S.angebot||null,pos:stelle(),antw:!!S.antw,idem:S.idem,bankZeit:S.bankZeit||0,idemOffen:S.idemOffen||null,nenn:S.nennStand||null,nennOffen:!!S.nennOffen,uid})); }catch(e){} }
  function vergessen(){ const st=ablage(); try{ st&&st.removeItem(SKEY); }catch(e){} }
  function zurueckholen(){ const st=ablage(); if(!st)return false; let j=null; try{ j=JSON.parse(st.getItem(SKEY)||'null'); }catch(e){}
    if(!j||!(Date.now()-j.t<14*864e5))return false;
    if(j.ergebnis)delete j.ergebnis.spendeBody;
    const ang=j.angebot&&j.angebot.nr&&D.angebot&&D.angebot.nr===j.angebot.nr?j.angebot:null;
    const ok=e=>e&&lk(e.key)&&(e.key==='spende'||e.key==='sonstiges'?T||e.key==='spende'||!!(ang&&e.ang):true);
    const mOk=e=>!lk(e.key).je_mannschaft||M.some(m=>m.id===e.mannschaft), vorher=(j.korb||[]).filter(ok).length+(j.wl||[]).filter(w=>lk(w.key)).length;
    S.korb=(j.korb||[]).filter(ok).filter(mOk); S.wl=(j.wl||[]).filter(w=>lk(w.key)).filter(mOk);
    if(S.korb.length+S.wl.length<vorher)setTimeout(()=>toast('Eine Mannschaft aus eurer Auswahl spielt in dieser Saison nicht mehr. Bitte wähl eine andere.'),900); S.saisons=[1,2,3].includes(j.saisons)||(ang&&j.saisons>=1&&j.saisons<=5)?j.saisons:1; S.angebot=ang; S.standZeit=+j.t||0; if(j.antw)S.antw=true; S.pos=j.pos&&/^[a-z0-9-]+$/.test(j.pos.id||'')?j.pos:null;
    if(!ang)S.korb.forEach(e=>{ if(e.ang){ delete e.ang; if(!T&&lk(e.key).preis!=null)e.preis=null; } }); S.start=j.start==='naechste'?'naechste':'jetzt'; S.auto=!!j.auto;
    Object.keys(j.F||{}).forEach(k=>{ if(j.F[k])S.F[k]=String(j.F[k]).slice(0,120); });
    (j.herz||[]).forEach(z=>WELT[z]&&S.herz.add(z)); (j.ziele||[]).forEach(z=>S.ziele.add(z)); if(j.budget)S.budget=j.budget; if(j.team&&M.some(m=>m.id===j.team))S.team=j.team;
    S.ergebnis=j.ergebnis||null; S.idem=j.idem||null; S.bankZeit=+j.bankZeit||0; if(j.nenn==='ja'||j.nenn==='nein'){ S.nennStand=j.nenn; S.nenn=j.nenn==='ja'; } S.nennOffen=!!j.nennOffen;
    if(S.ergebnis&&['angebot','warteliste'].includes(S.ergebnis.art)&&Date.now()-j.t>30*60e3){ if(S.ergebnis.art==='angebot')S.weg='vertrag'; S.ergebnis=null; S.idem=null; } S.idemOffen=j.idemOffen&&j.idemOffen.idem&&Date.now()-(+j.idemOffen.zeit||j.t)<30*60e3?j.idemOffen:null; uid=Math.max(+j.uid||0,...S.korb.map(e=>+e.id||0),0);
    return S.korb.length>0||S.wl.length>0; }

  try{ if('scrollRestoration' in history)history.scrollRestoration='manual'; }catch(e){}   // die Stelle stellen wir selbst wieder her
  async function laden(){
    if(!/^[a-f0-9]{32}$/.test(code)){ app.innerHTML=`<div class="leer-hinweis"><h2 class="g">Link fehlt</h2><p>Bitte den persönlichen Link aus der Nachricht öffnen.</p>${kontaktHtml('Du findest ihn nicht mehr? Melde dich, dann schicken wir ihn dir gleich noch einmal.')}</div>`; return; }
    // Die Hülle aus dem HTML bleibt stehen, bis die Daten da sind: kein weißes Nichts im ersten Moment
    if(!$('#startHuelle'))app.innerHTML='<div class="leer-hinweis">Einen Moment …</div>';
    try{ D=await rpc('partner_praesi',{p_code:code}); if(!D)throw new Error('Dieser Link ist nicht mehr aktiv.'); }
    catch(e){
      if(e.netz){ app.innerHTML=`<div class="leer-hinweis"><h2 class="g">Gerade keine Verbindung</h2><p>Dein persönlicher Link gilt weiter. Prüf bitte die Verbindung und versuch es noch einmal.</p><button type="button" class="knopf-w" id="nochmal" style="max-width:320px;margin-top:22px">Noch einmal versuchen</button></div>`; $('#nochmal').onclick=laden; }
      else app.innerHTML=`<div class="leer-hinweis"><h2 class="g">Link nicht mehr aktiv</h2><p>${esc(e.message)}</p>${kontaktHtml('Melde dich kurz, dann schicken wir dir einen neuen Link.')}</div>`;
      return; }
    L=filtern(D.leistungen||[]); M=D.mannschaften||[]; T=!!D.team; exklusivSperre();
    const dk=D.deck||{}, pt=D.partner||{};
    const pp=dk.passung||{}; ((pt.ziele||[]).length?pt.ziele:pp.ziele||[]).forEach(z=>S.ziele.add(z)); ((pt.interessen||[]).length?pt.interessen:pp.herz||[]).forEach(z=>{ if(WELT[z])S.herz.add(z); }); if(pt.budget)S.budget=pt.budget; if((pt.ziele||[]).length||(pt.interessen||[]).length||pt.budget)S.antw=true;   // früher schon beantwortet
    S.F={firma:dk.firma||'',anrede:dk.anrede||'',ansprech:dk.ansprech||'',email:dk.email||'',telefon:'',strasse:'',plz:'',ort:'',ustid:''};
    const adr=String(dk.adresse||'').split(',').map(x=>x.trim()); if(adr.length>=2){ S.F.strasse=adr[0]; S.F.ort=adr.slice(1).join(', '); } else S.F.strasse=adr[0]||'';
    plzTrennen();
    S.unterzeichner=S.unterzeichner||''; S.funktionV=S.funktionV||D.gegenzeichnen_funktion||'';
    S.team=standardTeam();
    // Angebot mit Positionen, die es öffentlich nicht gibt (im Termin vereinbart): damit sie im Paket stehen können
    const A0=D.angebot&&Array.isArray(D.angebot.positionen)?D.angebot:null;
    if(A0&&!lk('sonstiges')&&A0.positionen.some(p=>p.key==='sonstiges'))L.push({key:'sonstiges',titel:'Sonstiges',art:'sonstiges',einheit:'einmalig',preis:null,bereich:'verein',je_mannschaft:false,ziele:[]});
    const wieder=zurueckholen(); plzTrennen();
    // Gespeichertes Ergebnis mit dem Server abgleichen: storniert oder ersetzt, dann nicht mehr als Danke zeigen
    if(S.ergebnis&&fertig()&&!demo()&&!(D.abschluss&&(D.abschluss.nrn||[D.abschluss.nr]).includes(S.ergebnis.nr))){ S.ergebnis=null; S.idem=null; vergessen(); }
    if(S.ergebnis&&fertig()&&!demo()&&D.abschluss)abgleichen();
    // Schon Partner, aber kein Ergebnis auf diesem Gerät: alte Schlüssel gelten nicht für einen Nachtrag
    if(D.abschluss&&!S.ergebnis){ S.idemOffen=null; S.idem=null; }
    // Angebot (auch von einem anderen Gerät): Paket genau aus dem Angebot, mit Preisen und Laufzeit, gleich zum Unterschreiben.
    // Gilt nicht mehr, wenn danach schon unterschrieben wurde; ein neueres Angebot schlägt einen älteren Stand auf dem Gerät.
    let ausAngebot=null;
    const angNeuer=A0&&(!wieder||new Date(A0.erstellt_am||0).getTime()>(S.standZeit||0));
    if(A0&&!S.ergebnis&&!S.angebot&&angNeuer&&!(D.abschluss&&D.abschluss.art==='vertrag'&&String(D.abschluss.am||'')>String(A0.erstellt_am||''))){
      const korb0=A0.positionen.filter(p=>p.key!=='spende'&&lk(p.key)).map(p=>{ const l=lk(p.key), ein=p.einzel!=null?+p.einzel:null;
        return {id:++uid,key:p.key,mannschaft:p.mannschaft||null,menge:+p.menge||1,preis:l.preis==null||(ein!=null&&ein!==+l.preis)?ein:null,text:p.text||'',naechste:false,ang:true}; });
      const ab0=String(A0.beginn||'').slice(0,10);
      if(korb0.length){ const sp0=S.korb.filter(e=>e.key==='spende'); S.korb=korb0.concat(sp0); S.saisons=+A0.saisons>=1&&+A0.saisons<=5?+A0.saisons:1; S.auto=!!A0.auto; S.start=ab0>iso(new Date())&&ab0===String(D.naechste_saison).slice(0,10)?'naechste':'jetzt'; S.startWahl=true; S.weg='vertrag';
        S.angebot={nr:A0.nr,beginn:ab0}; S.angebot.sig=angebotSig(); S.trotz=true; ausAngebot=A0; } }
    if(S.angebot)S.trotz=true;   // offenes Angebot: der Vertrag steht im Abschluss, auch wenn über den Link schon eine Spende kam
    document.title='Partner werden · '+(dk.kurzname||dk.firma)+' · SV/BSC Mörlenbach';
    geruest(); fragen(); bereiche(); katalog(); korb(); abschluss(); kopfZahl();
    auftrittStart();
    if(S.nennOffen&&S.ergebnis&&!demo())nennungSenden();
    partnerWand();
    // Nach dem Neuladen (Tab vom Browser verworfen) an derselben Stelle weiter, dann erst der Hinweis
    const zuS=hp.get('s'), hinStelle=wieder&&!S.ergebnis&&!ausAngebot&&!(zuS&&/^[a-z]+$/.test(zuS))&&S.pos&&document.getElementById(S.pos.id);
    const hinDort=()=>{ const el=document.getElementById(S.pos.id), k=$('.top'); if(el)window.scrollTo({top:Math.max(0,el.getBoundingClientRect().top+scrollY-((k&&k.offsetHeight)||60)-2+(+S.pos.off||0)),behavior:'instant'}); };
    if(hinStelle){ hinDort(); S.posBereit=false; const fr=document.fonts&&document.fonts.ready; Promise.race([fr||Promise.resolve(),new Promise(z=>setTimeout(z,400))]).then(()=>{ if(scrollY>0)hinDort(); S.posBereit=true; }); }
    else S.posBereit=true;
    if(!korbPruefen()&&wieder&&!S.ergebnis)setTimeout(()=>toast('Eure Auswahl von neulich ist wieder da.'),600);
    if(ausAngebot){ const sonder=S.korb.some(e=>e.ang&&e.preis!=null)||S.saisons>3; setTimeout(()=>{ toast(sonder?'In deinem Angebot stehen die Preise aus unserem Gespräch. Du kannst es hier genau so unterschreiben. Willst du etwas ändern, schreib uns kurz.':'Hier ist dein Angebot '+ausAngebot.nr+' mit Preisen und Laufzeit wie besprochen. Du kannst es gleich unterschreiben.'); zu('abschluss',true); },400); }
    { const zu0=hp.get('s'); if(zu0&&/^[a-z]+$/.test(zu0))setTimeout(()=>zu(zu0,true),350); else if(S.ergebnis)setTimeout(()=>{ const z=Date.now()-(S.bankZeit||0)<15*60e3&&$('.zahlen'); if(z){ const k=$('.top'); window.scrollTo({top:z.getBoundingClientRect().top+scrollY-((k&&k.offsetHeight)||60)-8,behavior:'instant'}); } else zu('abschluss',true); },350); }   // aus der Partner-Zentrale direkt zum Abschluss
    let rafS=0; window.addEventListener('scroll',()=>{ if(rafS)return; rafS=requestAnimationFrame(()=>{ rafS=0; fortschritt(); leisteZeigen(); }); },{passive:true}); fortschritt(); beobachten(); leiste();
    addEventListener('resize',()=>{ const p=$('#prog'); if(p)p.dataset.w=''; fortschritt(); },{passive:true});
    ['pointerdown','keydown'].forEach(t=>addEventListener(t,()=>{ beruehrt=Date.now(); },{passive:true,capture:true}));
    setInterval(()=>{ if(document.visibilityState==='visible'&&!S.busy&&!S.ergebnis&&ruhig()&&katalogImBlick())freiHolen(); },180000);
    // Wechsel in Mail- oder Banking-App: Eingaben sofort sichern (iOS friert Timer ein); beim Zurückkommen die Plätze nachholen
    addEventListener('pagehide',()=>{ clearTimeout(mT); merken(); });
    document.addEventListener('visibilitychange',()=>{ if(document.visibilityState==='hidden'){ clearTimeout(mT); merken(); } else if(!S.busy&&!S.ergebnis&&ruhig())freiHolen(); });
  }
  // Stufe 1896: Ist die Branche dieses Betriebs schon vergeben, gilt die Stufe als belegt (der Server prüft es beim Abschluss noch einmal)
  function exklusivSperre(){ const l=D&&D.exklusiv_vergeben?lk('p1896'):null; if(l){ l.frei=0; l.frei_naechste=0; } }
  function abgleichen(){ const R=S.ergebnis, A0=D.abschluss, rs=A0.rechnungen||[];
    const eig=(A0.vertraege||[]).find(x=>x.nr===R.nr)||(A0.nr===R.nr?A0:null);
    if(eig){ if(eig.am)R.unterschrieben_am=R.unterschrieben_am||eig.am; R.gegengezeichnet_am=eig.gegengezeichnet_am||null; if(eig.status)R.status=eig.status; }
    if(A0.nr===R.nr&&!R.klauseln&&A0.klauseln)R.klauseln=A0.klauseln;
    const eigen=rs.filter(x=>x.vertrag===R.nr&&x.art!=='spende'), off=eigen.find(x=>x.status==='offen'), bez=eigen.find(x=>x.status==='bezahlt');
    if(off)R.rechnung=Object.assign({},R.rechnung||{},off); else if(bez)R.rechnung=Object.assign({},R.rechnung||{},bez);
    if(R.rechnung&&!R.bank&&A0.bank)R.bank=A0.bank; if(A0.nr===R.nr){ if(!R.beginn&&A0.beginn)R.beginn=A0.beginn; if(!R.ende&&A0.ende)R.ende=A0.ende; }
    if(R.spende&&R.spende.nr){ const sx=rs.find(x=>x.vertrag===R.spende.nr); if(sx)R.spende.rechnung=Object.assign({},R.spende.rechnung||{},sx); } }
  // PLZ und Ort getrennt (Autofill füllt sonst nur den Ort)
  function plzTrennen(){ const m=/^(\d{5})\s+(.+)$/.exec(String(S.F.ort||'').trim()); if(m){ S.F.plz=m[1]; S.F.ort=m[2]; } }
  // Standard-Mannschaft: die mit den meisten freien Plätzen, nie eine ganz vergebene
  function standardTeam(){ let best=null, bp=-1; M.forEach(m=>{ const t=teamFrei('jugend',m.id), p=t?t.frei:0; if(p>bp){ bp=p; best=m.id; } }); return best||(M[0]||{}).id||null; }
  function teamFrei(w,id){ const js=L.filter(l=>l.bereich===w&&l.je_mannschaft&&l.frei_je); if(!js.length)return null; let frei=0, bekannt=0;
    js.forEach(l=>{ const f=l.frei_je[id]; if(f!=null){ bekannt++; if(f>0)frei++; } }); return bekannt?{frei,von:bekannt}:null; }

  // Verfügbarkeit still nachladen: nur wenn niemand gerade tippt, nichts neu aufbauen außer den Welten
  let beruehrt=0;
  function ruhig(){ const a=document.activeElement; if(a&&/^(INPUT|SELECT|TEXTAREA|CANVAS)$/.test(a.tagName))return false; if(Date.now()-beruehrt<8000)return false;
    const imBlick=id=>{ const e=document.getElementById(id); if(!e)return false; const r=e.getBoundingClientRect(); return r.top<innerHeight&&r.bottom>0; };
    return !imBlick('baukasten')&&!imBlick('abschluss'); }
  const katalogImBlick=()=>['pakete','bausteine'].some(id=>{ const w=document.getElementById(id); if(!w||w.hidden)return false; const r=w.getBoundingClientRect(); return r.top<innerHeight&&r.bottom>0; });
  const freiSig=()=>JSON.stringify(L.map(l=>[l.key,l.frei,l.frei_naechste,l.frei_je,l.frei_je_naechste]));
  async function freiHolen(){ try{ const n=await rpc('partner_praesi_frei',{p_code:code},10000); if(!Array.isArray(n))return; const vor=freiSig();
      n.forEach(f=>{ const l=lk(f.key); if(l){ l.frei=f.frei; l.frei_naechste=f.frei_naechste; l.frei_je=f.frei_je; l.frei_je_naechste=f.frei_je_naechste; } }); exklusivSperre();
      if(freiSig()!==vor){ mitAnker(()=>{ korbPruefen(); katalog(); },ersteSichtbare()); } }catch(e){} }
  function ersteSichtbare(){ const k=$('.top'), oben=(k?k.offsetHeight:60)+4; return [...document.querySelectorAll('#pakete [data-add],#bausteine [data-add],#bausteine [data-tm]')].find(b=>{ const r=b.getBoundingClientRect(); return r.top>=oben&&r.top<innerHeight; })||null; }
  // Ist ein Baustein aus dem Paket inzwischen vergeben, kommt er auf die Vormerkliste statt erst beim Unterschreiben zu scheitern
  function korbPruefen(){ if(S.ergebnis)return false; const weg=S.korb.filter(e=>{ const l=lk(e.key); if(!l||e.naechste||['spende','sonstiges'].includes(l.art))return false; return frei(l,e.mannschaft)===0; });
    if(!weg.length)return false; S.korb=S.korb.filter(e=>!weg.includes(e)); weg.forEach(e=>{ if(!S.wl.some(w=>w.key===e.key&&(w.mannschaft||null)===(e.mannschaft||null)))S.wl.push({key:e.key,mannschaft:e.mannschaft||null}); });
    korb(); kopfZahl(); setTimeout(()=>toast(weg.length===1?'Eine Leistung aus eurer Auswahl ist inzwischen vergeben. Wir haben sie für dich vorgemerkt.':'Einige Leistungen aus eurer Auswahl sind inzwischen vergeben. Wir haben sie für dich vorgemerkt.'),600); return true; }

  // ---------- Grundgerüst ----------
  function logoImg(cls){ const dk=D.deck; return dk.logo?`<img class="${(cls||'')+(dk.logo_hell===false?' dk':'')}" src="${esc(dk.logo)}" alt="${esc(dk.firma)}">`:''; }
  // Schon dabei? Nach der Unterschrift hier oder auf einem anderen Gerät (dann meldet es der Server)
  function dabeiArt(){ if(fertig())return S.ergebnis.art; return D&&D.abschluss&&!T?D.abschluss.art:null; }
  function dabeiFest(){ return fertig()?fest(S.ergebnis):!!(D&&D.abschluss&&fest(D.abschluss)); }
  // Einstieg: vor der Unterschrift der Satz aus dem Termin oder unser Satz, danach, wo alles steht
  function heroText(){ const P=((D||{}).deck||{}).passung||{};
    const da=dabeiArt(); if(da==='spende')return 'Danke für deine Spende. Die Angaben zum Überweisen stehen weiter unten.';
    if(da)return dabeiFest()?'Euer Betrieb ist Partner des SV/BSC. Was ihr gebucht habt und die Rechnung stehen weiter unten.':'Deine Unterschrift ist bei uns. Was ihr gebucht habt und die Vertragsbedingungen stehen weiter unten.';
    return P.hero?esc(P.hero):'Bei uns lernen Kinder aus dem Ort Fußball. Vielleicht kennst du manche schon, aus der Nachbarschaft oder weil ihre Eltern bei euch arbeiten.'; }
  const STUFEN=()=>L.filter(l=>l.art==='paket'&&l.preis!=null).sort((a,b)=>(STUFE.indexOf(a.key)+1||9)-(STUFE.indexOf(b.key)+1||9)||+a.preis-+b.preis);
  const bausteinListe=w=>L.filter(l=>l.bereich===w&&l.art!=='paket'&&!['spende','sonstiges'].includes(l.art)&&l.preis!=null);
  const hatPaket=()=>S.korb.some(e=>(lk(e.key)||{}).art==='paket');
  const oder=a=>a.length>1?a.slice(0,-1).join(', ')+' oder '+a[a.length-1]:(a[0]||'');
  // Worum es geht, in einem Satz aus den Daten: wie viele Pakete, ab welchem Preis, welche Bausteine es gibt
  function worumText(){ const st=STUFEN(); if(!st.length)return ''; const bs=['bande_erste','matchball','trikot_jugend'].map(lk).filter(l=>l&&l.preis!=null).slice(0,2).map(l=>l.titel);
    const zahl=['','Ein Paket','Zwei Pakete','Drei Pakete','Vier Pakete','Fünf Pakete'][st.length]||st.length+' Pakete';
    return `${zahl} für je eine Saison, ab ${eur(Math.min(...st.map(l=>+l.preis)))} netto.${bs.length?` Dazu Bausteine wie ${esc(oder(bs))}.`:''}`; }
  function heroTitel(){ const da=dabeiArt(); return da==='spende'?'Deine Spende für den SV/BSC Mörlenbach':da?'Eure Partnerschaft mit dem SV/BSC Mörlenbach':'Partner werden beim SV/BSC Mörlenbach'; }
  function heroNeu(){ const hp0=$('#heroP'); if(hp0)hp0.innerHTML=heroText(); const h1=$('#heroH'); if(h1)h1.textContent=heroTitel(); const s=$('#heroS'), da=!!dabeiArt(); if(s)s.hidden=da; const hk=$('#heroPk'); if(hk)hk.hidden=da;
    const bw=$('#bewegtW'); if(bw)bw.innerHTML=bewegtHtml(); heroKnoepfe(); stationenNeu(); }
  // Was eine gebuchte Position im Verein bewirkt (statt die Leistung noch einmal aufzuzählen)
  function wirkung(p,spZw){ if(p.key==='spende'||p.art==='spende')return 'Das Geld setzen wir für '+zweckTxt(p.zweck||spZw)+' ein.';
    if(['supporter','club','premium','p1896'].includes(p.key))return (p.key==='supporter'?'':'Eure Bande steht bei jedem Heimspiel am Platz. ')+'Euer Beitrag kommt dem ganzen Verein zugute, von den Minikickern bis zur Ersten.';
    const l=lk(p.key)||{}; return (String(l.text||p.beschreibung||'').match(/[^.]+\.?/g)||[]).slice(0,1).join('').trim(); }
  function bedingungenHtml(kl){ return `<details class="vt-kl-fertig"><summary>Vertragsbedingungen</summary>${kl.map((k,i)=>`<div class="kl-z"><b>§ ${i+1} ${esc(k.titel||'')}</b><p>${esc(k.text||'')}</p></div>`).join('')}</details>`; }
  // Was ein Beitrag bewirkt: echte Leistungen der Jugend mit Preis. Nach der Unterschrift keine Preisliste mehr.
  function bewegtHtml(){ const keys=['baelle_jugend','trainer_jugend','trikot_jugend','zeltlager'], ls=keys.map(lk).filter(l=>l&&l.preis!=null).slice(0,4);
    if(dabeiArt()||!ls.length)return '';
    return `<ul class="bewegt">${ls.map(l=>`<li><em>${eur(l.preis)}</em><div><b>${esc(l.titel)}</b><small>${esc((String(l.text||'').match(/[^.]+\.?/g)||[]).slice(0,2).join('').trim())}</small></div></li>`).join('')}</ul>
      <p class="bewegt-f">Was ihr für die Jugend gebt, bleibt bei der Jugend.</p>`; }
  // Stationen oben: wenige Ziele, frei anspringbar, zeigen den Stand
  const STN=[['auftritt','Auftritt','Euer Auftritt'],['verein','Verein','Verein'],['wirkung','Wirkung','Was es bewirkt'],['pakete','Pakete','Pakete'],['bausteine','Bausteine','Bausteine'],['baukasten','Abschluss','Abschluss']];
  function geruest(){
    const dk=D.deck, P=dk.passung||{}, kurz=dk.kurzname||dk.firma, nJ=M.length, hatPassung=P.titel||P.text||(P.punkte||[]).length, V=D.verein||{};
    const st=STUFEN();
    app.innerHTML=`
<header class="top"><div class="top-in">
  <a class="top-w" href="#start" data-zu="start"><img src="${WAPPEN}" width="320" height="182" alt=""><b>SV/BSC Mörlenbach</b></a>
  <nav class="stn" aria-label="Stationen"><ol>${STN.map(([id,k,lang])=>`<li data-stn="${id}"><a class="stn-a" href="#${id}" data-zu="${id}"><span class="stn-t"${id==='baukasten'?' id="kopfT"':''}><span class="stn-s">${k}</span><span class="stn-l">${lang}</span></span>${id==='baukasten'?'<i id="kopfN" hidden>0</i>':'<b class="stn-ok" hidden><span class="nur-sr">, erledigt</span></b>'}</a></li>`).join('')}</ol><span id="prog" aria-hidden="true"></span></nav>
  ${T?'<span class="top-t" title="Angemeldet im Partner-Team">Termin</span>':''}</div></header>
<div id="live" class="nur-sr" aria-live="polite"></div>
${demo()?'<div class="demo">Probeansicht zum Durchklicken. Hier wird nichts gespeichert und nichts verschickt. <button type="button" id="probeNeu">Probe neu starten</button></div>':''}
<section class="hero" id="start">
  <figure class="hero-b"><picture><source srcset="partner/jugend.webp" type="image/webp"><img src="partner/jugend.jpg" alt="Jugendspieler des SV/BSC Mörlenbach im Kreis" fetchpriority="high" width="800" height="1200"></picture></figure>
  <div class="hero-in"><div class="hero-t">
    <div class="hero-f">${dk.logo?`<img class="hero-w" src="${WAPPEN}" width="320" height="182" alt="SV/BSC Mörlenbach"><span class="und">und</span><span class="top-p${dk.logo_hell===false?' dk':''}">${logoImg()}</span>`:`<span>Für ${esc(dk.firma||kurz)}</span>`}</div>
    <h1 id="heroH">${heroTitel()}</h1>
    <p id="heroP">${heroText()}</p>
    <div class="runter-z"><button class="runter" type="button" data-zu="pakete">Pakete ansehen</button><button class="textknopf" type="button" data-zu="verein" id="heroVerein">Erst den Verein kennenlernen</button></div></div>
    <div class="hp" id="heroPk"${dabeiArt()?' hidden':''}><p class="hero-s" id="heroS">${worumText()}</p>${st.length?`<ul>${st.map(l=>`<li><button type="button" data-pk="${l.key}"><b>${esc(l.titel)}</b><span>${eur(l.preis)} ${esc(PLIB.EINHEIT[l.einheit]||'')}</span></button></li>`).join('')}</ul>`:''}</div></div></section>
<section class="sec grau" id="auftritt"><div class="ww">
  <div class="sk"><h2 class="g">Euer Auftritt</h2><p class="lead">So sieht ${esc(kurz)} bei uns aus. Die Bande steht am Platz, euer Logo kann auch auf die Trikots.</p></div>
  <div class="tk-seg auf-seg" id="aufSeg" role="group" aria-label="Ansicht"><button type="button" data-auf="bande" class="on" aria-pressed="true">Bande am Platz</button><button type="button" data-auf="trikot" aria-pressed="false">Logo auf dem Trikot</button></div></div>
<div class="sec bd" id="bande" role="region" aria-labelledby="bdH" hidden><div class="ww bd-raster">
  <div class="bd-kopf"><h3 class="nur-sr" id="bdH">So sieht deine Bande aus</h3>
    <p class="lead">${esc(kurz)} am Rand unseres Platzes, im selben ruhigen Look wie alle Banden bei uns. So sieht euch jeder bei jedem Heimspiel.</p></div>
  <div class="bd-bw"><div class="bd-buehne" id="bdB"><canvas id="bdCv" role="img" aria-label="Eure Bande am Spielfeldrand"></canvas><div class="bd-laden" id="bdLaden">Eure Bande wird gestaltet …</div></div></div>
  <div class="bd-text"><div class="tk-seg" id="bdLay" role="group" aria-label="Gestaltung"><button type="button" data-bdl="mitte">Logo groß</button><button type="button" data-bdl="claim">${esc((D.deck||{}).branche?'Logo und Branche':'Logo und Name')}</button></div>
    <div class="tk-seg" id="bdFmt" role="group" aria-label="Format"><button type="button" data-bdf="300x80">Bande</button><button type="button" data-bdf="200x100">Partnerwand</button></div>
    <p class="bd-mass" id="bdMass"></p><p class="bd-frei" id="bdFrei"></p><div class="tk-passt" id="bdPasst" aria-live="polite"></div></div>
</div></div>
<div class="sec tk" id="trikots" role="region" aria-labelledby="tkH"><div class="ww tk-raster">
  <div class="tk-kopf"><h3 class="nur-sr" id="tkH">Dein Logo auf unseren Trikots</h3>
    <p class="lead">Dreh das Trikot und such dir einen freien Platz aus. Mannschaft und Satz kannst du dabei wechseln.</p></div>
  <div class="tk-text"><div class="tk-wahl"><label class="tk-feld"><span>Mannschaft</span><select id="tkTeam" aria-label="Mannschaft"></select></label>
      <div class="tk-seg" id="tkArt" role="group" aria-label="Satz"><button type="button" data-tka="heim">Heim</button><button type="button" data-tka="auswaerts">Auswärts</button><button type="button" data-tka="anzug">Anzug</button></div></div>
    <h3 class="tk-h">Freie Plätze</h3><div class="tk-pl" id="tkPl" role="group" aria-label="Freie Plätze"></div>
    <p class="tk-belegt" id="tkBelegt"></p><div class="tk-passt" id="tkPasst" aria-live="polite"></div></div>
  <div class="tk-bw"><div class="tk-buehne" id="tkB"><div class="tk-laden" id="tkLaden">Das Trikot wird aufgebaut …</div></div>
    <div class="tk-seg tk-sicht" id="tkSicht" role="group" aria-label="Ansicht"><button type="button" data-tks="vorn">Vorn</button><button type="button" data-tks="seite">Seite</button><button type="button" data-tks="hinten">Hinten</button></div></div>
</div></div>
</section>
<section class="sec" id="verein"><div class="ww">
  <div class="v-kopf rv"><div><h2 class="g">Unser Verein</h2>
    <p class="lead">Fußball in Mörlenbach seit 1896. Die Kinder spielen meist samstags, die Herren sonntags, und am Rand stehen die Familien. Ohne Ehrenamt ginge das nicht, und ohne die Betriebe, die uns unterstützen, auch nicht.</p></div>
    <div class="vz">${V.jugend?`<div class="zahl"><b>${esc(V.jugend)}</b><span>Kinder und Jugendliche,<br>jede Woche auf dem Platz</span></div>`:''}${V.heimspiele?`<div class="zahl zahl2"><b>${esc(V.heimspiele)}</b><span>Heimspiele der Ersten<br>in der ${esc(V.liga||'Kreisliga A')}${V.zuschauer?`, im Schnitt rund ${esc(V.zuschauer)} Zuschauer`:''}</span></div>`:''}
    <p class="zahl-n">${nJ?nJ+' ':''}Jugendmannschaften von den Minikickern bis zur A-Jugend · eine Erste und eine Zweite${V.zuschauer?' · Die Zuschauerzahl ist unsere Schätzung.':''}</p></div></div>
  <div class="bc-kopf"><h3>Wo ihr dabei sein könnt</h3><div class="pf" aria-hidden="true"><button type="button" data-pf="-1" tabindex="-1">‹</button><button type="button" data-pf="1" tabindex="-1">›</button></div></div>
  <div class="karus" id="bereiche" role="list" aria-label="Bereiche des Vereins"></div><div class="punkte" id="bcDots" aria-hidden="true"></div>
  <div class="apa rv" id="apartner" hidden><h3>Aktuelle Partner</h3><p class="apa-l">Diese Betriebe sind gerade beim SV/BSC Mörlenbach dabei und haben uns erlaubt, sie zu nennen.</p>
    <ul id="apaL"></ul></div></div></section>
<section class="sec grau" id="wirkung"><div class="ww w-raster">
  <div class="rv"><h2 class="g">Was es bewirkt</h2><p class="lead">Ein paar Beispiele aus der Jugend, so wie man sie bei uns buchen kann. Die Preise sind netto.</p><div id="bewegtW">${bewegtHtml()}</div></div>
  ${hatPassung?`<div id="passung" class="pa rv"><div class="pa-kopf">${dk.logo?logoImg('pl'):`<b>${esc(kurz)}</b>`}<i>und</i><img class="sv" src="${WAPPEN}" width="320" height="182" alt="SV/BSC Mörlenbach"></div>
    <div class="pa-in">${P.titel?`<h2 class="g">${esc(P.titel)}</h2>`:''}
    ${P.text?`<p class="pa-text">${esc(P.text)}</p>`:''}
    ${(P.punkte||[]).length?`<ul class="pa-p">${P.punkte.map(x=>`<li>${esc(x)}</li>`).join('')}</ul>`:''}</div></div>`:''}</div></section>
<section class="sec" id="pakete"><div class="ww">
  <div class="sk"><h2 class="g">${st.length===4?'Die vier Pakete':'Die Pakete'}</h2><p class="lead" id="pkLead">Jedes Paket gilt für eine Saison und kommt dem ganzen Verein zugute. Die Preise stehen auf den Karten, alle netto.</p></div>
  <div class="pk-liste" id="pkListe" role="list" aria-label="Pakete"></div><div class="punkte" id="pkDots" aria-hidden="true"></div>
  <div class="pk-nach" id="pkNach" aria-live="polite"></div>
  <div class="fr-box" id="wunsch"><button type="button" class="fr-auf" id="frAuf" aria-expanded="false" aria-controls="frIn"><b>Unsicher, welches passt?</b><span>Drei kurze Fragen, freiwillig. Danach markieren wir das passende Paket.</span></button>
    <div id="frIn" hidden><div class="fr" id="fragen"></div><div class="fr-n" id="frN" aria-live="polite"></div></div></div></div></section>
<section class="sec grau" id="bausteine"><div class="ww bs-raster"><div class="bs-main">
  <h2 class="g">Bausteine zum Dazubuchen</h2><p class="lead">Zusätzlich zum Paket oder einzeln. Was ihr wählt, läuft in der Summe gleich mit.</p>
  <div class="bs-filter" id="bsFilter" role="group" aria-label="Bausteine filtern"></div><div id="bsIn"></div></div>
  <aside class="bs-seite" id="bsSeite" aria-label="Eure Auswahl"></aside></div></section>
<section class="sec" id="baukasten"><div class="w bk"><div id="korbIn"></div><aside class="bk-r"><div class="summe" id="summe"></div><div class="bk-leer" id="bkLeer" hidden><h3>Summe</h3><p>Hier steht gleich die Summe, netto und mit Umsatzsteuer.</p></div><div id="korbWeiter"></div></aside></div></section>
<section class="sec" id="abschluss"><div class="ab-raster"><div class="w" id="abIn"></div><aside id="abSeite" aria-label="Eure Auswahl im Überblick"></aside></div></section>
<footer><div class="ww"><div class="f-l"><img src="${WAPPEN}" width="320" height="182" alt=""><span>SV/BSC Mörlenbach</span></div>
  <div>${esc(V.name||'SV/BSC Mörlenbach')}, Partnerschaften${V.email?`<br><a href="mailto:${esc(V.email)}">${esc(V.email)}</a>`:''}${rechtHtml()}</div></div></footer>`;
    app.addEventListener('click',e=>{ const z=e.target.closest('[data-zu]'); if(z){ e.preventDefault(); zu(z.dataset.zu); return; }
      const pk=e.target.closest('[data-pk]'); if(pk){ tipp(); zuPaket(pk.dataset.pk); } });
    const pn=$('#probeNeu'); if(pn)pn.onclick=()=>{ vergessen(); location.reload(); };
    const rv=$('#rechtWeg'); if(rv)rv.onclick=()=>{ vergessen(); toast('Erledigt. Dieses Gerät hat deine Eingaben vergessen.'); setTimeout(()=>location.reload(),1200); };
    const fa=$('#frAuf'); if(fa)fa.onclick=()=>{ const auf=fa.getAttribute('aria-expanded')!=='true'; fa.setAttribute('aria-expanded',String(auf)); $('#frIn').hidden=!auf; tipp(); if(auf){ const c=$('#fragen .chip'); if(c)setTimeout(()=>c.focus({preventScroll:true}),60); } };
    if(S.antw&&(S.herz.size||S.ziele.size||S.budget)&&fa){ fa.setAttribute('aria-expanded','true'); $('#frIn').hidden=false; }
    document.querySelectorAll('[data-pf]').forEach(b=>b.onclick=()=>{ const k=$('#bereiche'), c=k&&k.firstElementChild; if(c)k.scrollBy({left:(+b.dataset.pf)*(c.offsetWidth+12),behavior:sanft()}); });
    karussell($('#bereiche'),$('#bcDots')); karussell($('#pkListe'),$('#pkDots'));
  }
  // ---------- 0.80: Station „Dein Logo auf unseren Trikots“ ----------
  // Das Logo aus der Präsentation sitzt gleich auf einem freien Platz (Ärmel zuerst), 3D drehbar, Mannschaft und Platz frei wählbar.
  // Daten nur aus trikot_oeffentlich (Mannschaften, Plätze frei/belegt, Logos der belegten Plätze), keine Kontaktdaten.
  const TK={d:null,v:null,team:null,art:'heim',platz:null,an:false,sicht:'vorn'};
  const TK_REIHE=['aermel_l','aermel_r','brust','jacke_brust'];   // 0.81: nur Brust und die beiden Ärmel
  const TK_ART={heim:'Heim',auswaerts:'Auswärts',anzug:'Anzug'};
  function tkOhneJugend(){ return ((((D||{}).deck||{}).passung||{}).ohne||[]).includes('trikot'); }
  function tkTeams(){ const L=((TK.d&&TK.d.mannschaften)||[]).filter(m=>!tkOhneJugend()||m.art==='herren'); return L; }
  function tkSatz(team,art){ return ((TK.d&&TK.d.saetze)||[]).find(x=>x.mannschaft===(team||TK.team)&&x.art===(art||TK.art))||null; }
  function tkPlaetze(team,art){ const s=tkSatz(team,art); return s?TK.d.plaetze.filter(p=>p.satz===s.id):[]; }
  function tkFrei(team,art){ return tkPlaetze(team,art).filter(p=>p.status==='frei').sort((a,b)=>TK_REIHE.indexOf(a.platz)-TK_REIHE.indexOf(b.platz)); }
  const TK_NAME={brust:'Brust',aermel_l:'Ärmel links',aermel_r:'Ärmel rechts',jacke_brust:'Jacke Brust',ruecken:'Rücken',nacken:'Nacken',hose_vorn:'Hose',hose_hinten:'Hose',jacke_ruecken:'Jacke Rücken',anzug_aermel:'Ärmel',anzug_hose:'Hose'};
  function tkName(k){ return TK_NAME[k]||k; }
  // Passende Mannschaft: die im Baukasten gewählte Jugend (S.team), sonst die Erste, sonst die erste mit freiem Ärmel
  function tkWahl(){ const T=tkTeams(), hatAermel=id=>tkFrei(id,'heim').some(p=>/^aermel/.test(p.platz));
    const kand=[S.team,'h1','h2'].concat(T.map(t=>t.id)).filter((id,i,a)=>id&&a.indexOf(id)===i&&T.some(t=>t.id===id));
    TK.team=kand.find(hatAermel)||kand.find(id=>tkFrei(id,'heim').length)||(T[0]||{}).id||null; TK.art='heim'; TK.platz=(tkFrei()[0]||{}).platz||null; }
  function tkBelegung(){ const B={}, lg=id=>((TK.d.logos||[]).find(l=>l.id===id)||{}).bild||null, dk=D.deck||{};
    tkPlaetze().forEach(p=>{ if(p.status!=='frei')B[p.platz]={status:'belegt',firma:p.firma,bild:p.logo?lg(p.logo):null,variante:p.variante||'weiss',groesse:+p.groesse||1};
      else if(p.platz===TK.platz)B[p.platz]={status:'belegt',vorschau:true,firma:dk.kurzname||dk.firma,bild:dk.logo||null,variante:TK.art==='anzug'&&/^aermel/.test(p.platz)?'schwarz':'weiss',groesse:1};
      else B[p.platz]={status:'frei'}; }); return B; }
  function tkZeigen(){ const sel=$('#tkTeam'); if(!sel||!TK.d)return; const s=tkSatz();
    document.querySelectorAll('[data-tka]').forEach(b=>{ const an=b.dataset.tka===TK.art; b.classList.toggle('on',an); b.setAttribute('aria-pressed',String(an)); });
    document.querySelectorAll('[data-tks]').forEach(b=>{ const an=b.dataset.tks===TK.sicht; b.classList.toggle('on',an); b.setAttribute('aria-pressed',String(an)); });
    const fr=tkFrei(), bel=tkPlaetze().filter(p=>p.status!=='frei'), mn=(M.find(m=>m.id===TK.team)||tkTeams().find(m=>m.id===TK.team)||{}).name||'';
    $('#tkPl').innerHTML=fr.length?fr.map(p=>`<button type="button" class="tk-p${p.platz===TK.platz?' on':''}" data-tkp="${p.platz}" aria-pressed="${p.platz===TK.platz}">${esc(tkName(p.platz))}</button>`).join(''):'<p class="tk-leer">Bei diesem Satz ist gerade alles vergeben. Nimm eine andere Mannschaft oder den anderen Satz.</p>';
    $('#tkBelegt').textContent=bel.length?'Schon vergeben: '+bel.map(p=>tkName(p.platz)+(p.firma?' ('+p.firma+')':'')).join(', ')+'.':'';
    // Passt zu: Ärmel der Ersten und Zweiten als Fläche, in der Jugend die Trikotpatenschaft
    const P=$('#tkPasst'), herren=TK.team==='h1'||TK.team==='h2', key=!TK.platz?null:herren?(/^aermel/.test(TK.platz)?(TK.team==='h1'?'aermel_erste':'aermel_zweite'):TK.platz==='brust'?(TK.team==='h1'?'brust_erste':'brust_zweite'):null):(TK.art==='anzug'?null:'trikot_jugend'), l=key&&lk(key);
    if(l&&!fertig()){ const drin=imKorb(key,l.je_mannschaft?TK.team:null);
      P.innerHTML=`<p><b>${esc(l.titel)}</b>${l.je_mannschaft?' für die '+esc(mn):''}${l.preis!=null?' · '+eur(l.preis)+' '+esc(PLIB.EINHEIT[l.einheit]||''):''}${s&&!s.vorhanden?'. Diesen Satz gibt es noch nicht, mit eurer Patenschaft wird er möglich.':'.'}</p>
        <button type="button" class="knopf-w tk-dazu" data-tkdazu="${key}"${drin?' disabled':''}>${drin?'Ist in eurer Auswahl':'In die Auswahl'}</button>`;
      const b=P.querySelector('[data-tkdazu]'); if(b&&!drin)b.onclick=()=>{ if(l.je_mannschaft)S.team=TK.team; klickLeistung(key,l.je_mannschaft?TK.team:null); toast(l.titel+' ist in eurer Auswahl.'); tkZeigen(); }; }
    else P.innerHTML='';
    $('#tkPl').querySelectorAll('[data-tkp]').forEach(b=>b.onclick=()=>tkPlatz(b.dataset.tkp));
    if(TK.v&&s)TK.v.setzen({art:TK.art,grund:s.grundfarbe,akzent:s.akzentfarbe,nummer:'10',belegung:tkBelegung()});
    void mn; }
  function tkPlatz(k){ const p=tkPlaetze().find(x=>x.platz===k); if(!p)return;
    if(p.status!=='frei'){ toast(tkName(k)+' ist schon vergeben'+(p.firma?' an '+p.firma:'')+'. Nimm einen freien Platz.'); return; }
    TK.platz=k; tipp(); tkZeigen(); if(TK.v){ const i=TRIKOT3D.platzInfo(TK.art,k), w=i.teil==='aermel'?(i.seite>0?.95:'vorn'):i.vorn===false?'hinten':'vorn'; TK.v.drehen(w); TK.sicht=typeof w==='number'?'seite':w; TK.v.fokus(i.fokus==='unten'?'unten':'oben'); tkZeigen(); }
    ansage('Euer Logo sitzt jetzt auf '+tkName(k)+'.'); }
  // Daten und Auswahl sofort (die Höhe der Station steht damit fest, nichts verrutscht später), die 3D-Bühne erst im Blick
  async function tkDaten(){ if(TK.daten)return TK.daten;
    TK.daten=(async()=>{ try{ TK.d=await rpc('trikot_oeffentlich',{},15000); }catch(e){ TK.daten=null; const L=$('#tkLaden'); if(L)L.textContent='Das Trikot lässt sich gerade nicht laden.'; return false; }
    if(!tkTeams().length){ const sec=$('#trikots'); if(sec)sec.hidden=true; return false; }
    tkWahl(); const sel=$('#tkTeam'); sel.innerHTML=tkTeams().map(m=>`<option value="${esc(m.id)}">${esc(m.name)}</option>`).join(''); sel.value=TK.team;
    sel.onchange=()=>{ TK.team=sel.value; TK.platz=(tkFrei()[0]||{}).platz||null; tkZeigen(); if(TK.platz)tkPlatz(TK.platz); };
    document.querySelectorAll('[data-tka]').forEach(b=>b.onclick=()=>{ TK.art=b.dataset.tka; TK.platz=(tkFrei()[0]||{}).platz||null; tkZeigen(); if(TK.platz)tkPlatz(TK.platz); });
    document.querySelectorAll('[data-tks]').forEach(b=>b.onclick=()=>{ TK.sicht=b.dataset.tks; if(TK.v)TK.v.drehen(TK.sicht); tkZeigen(); });
    tkZeigen(); return true; })(); return TK.daten; }
  async function tkAufbauen(){ if(TK.an)return; TK.an=true;
    if(!(await tkDaten())){ TK.an=false; return; }
    try{ await new Promise((ok,nein)=>{ if(window.TRIKOT3D)return ok(); const sc=document.createElement('script'); sc.src='trikot3d.js?v='+encodeURIComponent(C.build||''); sc.onload=ok; sc.onerror=nein; document.head.appendChild(sc); });
      TK.v=TRIKOT3D.buehne($('#tkB'),{three:'vendor/three.min.js?v='+encodeURIComponent(C.build||''),kit:'kit/',schrift:"'Barlow Condensed'",rahmen:true,name:tkName,
        onPlatz:k=>tkPlatz(k),onDreh:w=>{ TK.sicht=w; document.querySelectorAll('[data-tks]').forEach(b=>{ const an=b.dataset.tks===w; b.classList.toggle('on',an); b.setAttribute('aria-pressed',String(an)); }); }});
      await TK.v.bereit; const L=$('#tkLaden'); if(L)L.remove(); tkZeigen(); if(TK.platz){ const i=TRIKOT3D.platzInfo(TK.art,TK.platz); if(i&&i.teil==='aermel'&&i.seite>0){ TK.v.drehen(.95,true); TK.sicht='seite'; tkZeigen(); } }
      
    }catch(e){ const L=$('#tkLaden'); if(L)L.textContent='Das Trikot lässt sich auf diesem Gerät nicht zeigen.'; } }
  // 3D kostet Daten und Rechenzeit: das Trikot wird erst aufgebaut, wenn jemand es antippt
  function trikotMoeglich(){ return !fertig(); }
  // ---------- 0.80: Station „So sieht deine Bande aus“ ----------
  // Das Logo aus der Präsentation im Partner-CI (weiße Bande, Logo in Marine, Vereinsabsender), live am Spielfeldrand.
  // Daten nur aus banden_oeffentlich (Zahl freier Plätze je Bereich), keine Namen anderer Partner, keine Kontaktdaten.
  const BD={d:null,an:false,beob:false,laden:null,layout:'mitte',format:'300x80',L:null,res:null};
  function bdSpec(){ const dk=D.deck||{}, nm=dk.kurzname||dk.firma||''; return {format:BD.format,stil:'ci',layout:BD.layout,firma:nm,name:nm,branche:dk.branche||'',web:dk.web||'',kontakt:true,nameAn:!dk.logo,logo:dk.logo||null}; }
  async function bdZeichnen(){ const cv=$('#bdCv'); if(!cv||typeof BANDE==='undefined')return; const sp=bdSpec();
    try{ BD.res=await BANDE.vorbereiten(sp,{basis:'partner/',wappen:'partner/svbsc.png'}); BD.L=BANDE.layout(sp,BD.res); BANDE.szene(cv,{haupt:{L:BD.L,res:BD.res}}); const L0=$('#bdLaden'); if(L0)L0.remove();
      Object.assign(cv.dataset,{stil:BD.L.stil,layout:BD.L.layout,format:BD.L.format,logo:BD.res.logoBild?'1':'0',wappen:BD.L.ops.some(o=>o.rolle==='wappen')?'1':'0',name:BD.L.ops.some(o=>o.rolle==='name')?'1':'0'}); }
    catch(e){ const L0=$('#bdLaden'); if(L0)L0.textContent='Die Bande lässt sich auf diesem Gerät nicht zeigen.'; return; }
    document.querySelectorAll('[data-bdl]').forEach(b=>{ const an=b.dataset.bdl===BD.layout; b.classList.toggle('on',an); b.setAttribute('aria-pressed',String(an)); });
    document.querySelectorAll('[data-bdf]').forEach(b=>{ const an=b.dataset.bdf===BD.format; b.classList.toggle('on',an); b.setAttribute('aria-pressed',String(an)); });
    bdMass(); const F=BANDE.FORMATE[BD.format];
    cv.setAttribute('aria-label','Eure Bande am Spielfeldrand: '+(sp.name||'')+', '+(F?F.lang:'')); }
  function bdFrei(){ const d=BD.d, el=$('#bdFrei'); if(!d||!el)return; const fr=(d.bereiche||[]).filter(b=>b.frei>0), n=fr.reduce((s,b)=>s+b.frei,0);
    el.innerHTML=n?`<b>${n===1?'1 Platz':n+' Plätze'} frei:</b> ${fr.map(b=>`${esc(b.titel)} ${b.frei}`).join(', ')}.`:'Gerade sind alle Plätze vergeben. Wir setzen euch gern auf die Liste.'; }
  // Maße und Paket-Hinweis stehen sofort, damit die Station nicht nachwächst, während jemand weiterscrollt
  function bdMass(){ const F=typeof BANDE!=='undefined'&&BANDE.FORMATE[BD.format], el=$('#bdMass'); if(!el)return;
    el.textContent=F?F.lang+'. Druck auf Aluminiumverbund, Herstellung und Montage übernimmt der Verein, wenn sie im Paket stecken.':''; }
  function bdText(){ bdFrei(); bdMass();
    const l=lk('bande_erste'), P=$('#bdPasst'); if(!P)return;
    if(l&&!fertig()){ const drin=imKorb('bande_erste',null);
      P.innerHTML=`<p><b>${esc(l.titel)}</b>${l.preis!=null?' · '+eur(l.preis)+' '+esc(PLIB.EINHEIT[l.einheit]||''):''}. Ab dem Club Partner ist eine Bande im Paket.</p>
        <button type="button" class="knopf-w tk-dazu" data-bddazu${drin?' disabled':''}>${drin?'Ist in eurer Auswahl':'In die Auswahl'}</button>`;
      const b=P.querySelector('[data-bddazu]'); if(b&&!drin)b.onclick=()=>{ klickLeistung('bande_erste',null); toast(l.titel+' ist in eurer Auswahl.'); bdText(); }; }
    else P.innerHTML=''; }
  // Zahl der freien Plätze gleich beim Start holen, damit die Station nicht nachwächst, während jemand liest
  function bdHolen(){ if(BD.laden)return BD.laden;
    BD.laden=rpc('banden_oeffentlich',{},15000).then(d=>{ BD.d=d; bdFrei(); return d; },()=>{ BD.d=null; return null; }); return BD.laden; }
  async function bandeAufbauen(){ if(BD.an)return; BD.an=true;
    await bdHolen();
    bdText(); await bdZeichnen();
    document.querySelectorAll('[data-bdl]').forEach(b=>b.onclick=()=>{ if(BD.layout===b.dataset.bdl)return; BD.layout=b.dataset.bdl; tipp(); bdZeichnen(); });
    document.querySelectorAll('[data-bdf]').forEach(b=>b.onclick=()=>{ if(BD.format===b.dataset.bdf)return; BD.format=b.dataset.bdf; tipp(); bdZeichnen(); });
    if(window.ResizeObserver){ let w0=0, t=0; new ResizeObserver(es=>{ const w=Math.round(es[0].contentRect.width); if(Math.abs(w-w0)>4){ w0=w; clearTimeout(t); t=setTimeout(()=>{ if(BD.L)BANDE.szene($('#bdCv'),{haupt:{L:BD.L,res:BD.res}}); },150); } }).observe($('#bdB')); } }
  function bandeMoeglich(){ const dk=D.deck||{}; return !fertig()&&!!(dk.kurzname||dk.firma)&&typeof BANDE!=='undefined'; }
  function bandeStart(){ const sec=$('#bande'); if(!sec||sec.hidden)return; bdText(); if(BD.beob)return; BD.beob=true;
    if('IntersectionObserver' in window){ let t=0; const io=new IntersectionObserver(es=>{ const da=es.some(e=>e.isIntersecting); clearTimeout(t); if(da)t=setTimeout(()=>{ io.disconnect(); bandeAufbauen(); },300); },{rootMargin:'200px 0px',threshold:.05}); io.observe(sec); }
    else bandeAufbauen(); }
  // ---------- 0.96: Station „Euer Auftritt“ ----------
  // Bande und Trikot liegen zusammen in einer Station, noch vor den Preisen. Die Bande steht gleich da,
  // das Trikot baut sich erst auf, wenn jemand darauf tippt.
  const AUF={an:'bande',tk:false};
  function aufZeigen(w,tippen){ const bd=$('#bande'), tk=$('#trikots'); if(!bd&&!tk)return;
    AUF.an=w;
    if(bd)bd.hidden=w!=='bande'||!AUF.bd;
    if(tk)tk.hidden=w!=='trikot'||!AUF.tkDa;
    document.querySelectorAll('[data-auf]').forEach(b=>{ const an=b.dataset.auf===w; b.classList.toggle('on',an); b.setAttribute('aria-pressed',String(an)); });
    if(w==='trikot'&&!AUF.tk){ AUF.tk=true; tkAufbauen().then(()=>{ if(tk&&tk.hidden&&AUF.an==='trikot'){ AUF.tkDa=false; const b=document.querySelector('[data-auf="trikot"]'); if(b)b.hidden=true; aufSeg(); aufZeigen('bande'); stationenNeu(); } }); }
    if(w==='bande')bandeStart();
    if(tippen)tipp(); }
  function aufSeg(){ const seg=$('#aufSeg'); if(!seg)return; seg.hidden=!(AUF.bd&&AUF.tkDa); }
  function auftrittStart(){ const sec=$('#auftritt'); if(!sec)return;
    AUF.bd=bandeMoeglich(); AUF.tkDa=trikotMoeglich();
    sec.hidden=!AUF.bd&&!AUF.tkDa; if(sec.hidden){ const bd=$('#bande'), tk=$('#trikots'); if(bd)bd.hidden=true; if(tk)tk.hidden=true; return; }
    const bT=document.querySelector('[data-auf="bande"]'), tT=document.querySelector('[data-auf="trikot"]');
    if(bT)bT.hidden=!AUF.bd; if(tT)tT.hidden=!AUF.tkDa; aufSeg();
    document.querySelectorAll('[data-auf]').forEach(b=>b.onclick=()=>{ if(AUF.an===b.dataset.auf)return; aufZeigen(b.dataset.auf,true); });
    if(AUF.bd)bdHolen();
    aufZeigen(AUF.bd?'bande':'trikot'); }
  // ---------- 0.96: Infobox „Aktuelle Partner“ ----------
  // Nur Firmennamen, nur von Betrieben, die ausdrücklich ja gesagt haben (public.partner_nennung_liste).
  // Unter drei Namen zeigen wir die Box gar nicht, dann wirkt sie leer statt stark.
  async function partnerWand(){ const box=$('#apartner'), ul=$('#apaL'); if(!box||!ul)return;
    let l=null; try{ l=await rpc('partner_nennung_liste',{},10000); }catch(e){ return; }
    const n=(Array.isArray(l)?l:[]).filter(x=>x&&x.firma).slice(0,120); if(n.length<3)return;
    const eig=String((D.deck||{}).firma||'').trim().toLowerCase();
    ul.innerHTML=n.map(x=>{ const ich=String(x.firma).trim().toLowerCase()===eig;
      return `<li${ich?' class="ich"':''}>${esc(x.firma)}${ich?'<b>Ihr seid dabei</b>':''}</li>`; }).join('');
    box.hidden=false; beobachten(box); }
  // Impressum (§ 5 DDG) und Datenschutzhinweise (Art. 13 DSGVO), alles aus den Vereinsdaten, nichts erfunden
  function rechtHtml(){ const V=D.verein||{}, nm=esc(V.name||'SV/BSC Mörlenbach'), mail=V.email?esc(V.email):'';
    const zeilen=[`<b>${nm}</b>${V.abteilung?', '+esc(V.abteilung):''}`,V.strasse?esc(V.strasse):'',V.ort?esc(V.ort):'',
      'Vertreten durch den Vorstand nach § 26 BGB'+(V.vorstand?': '+esc(V.vorstand):''),V.register?'Registereintrag: '+esc(V.register):'',
      mail?'E-Mail: '+mail:'',V.telefon?'Telefon: '+esc(V.telefon):'',V.ustid?'USt-IdNr.: '+esc(V.ustid):''].filter(Boolean);
    const verantw=V.vertreter?esc(V.vertreter)+(V.vertreter_funktion?', '+esc(V.vertreter_funktion):''):'der Vorstand';
    return `<details class="recht"><summary>Impressum und Datenschutz</summary>
      <h3>Impressum</h3>
      <p>${zeilen.join('<br>')}</p>
      <p>Verantwortlich für den Inhalt dieser Seite: ${verantw}, Anschrift wie oben.</p>
      <h3>Datenschutzhinweise</h3>
      <p><b>Verantwortlich</b> ist der ${nm}, Anschrift wie oben${mail?', E-Mail '+mail:''}.</p>
      <p><b>Wozu wir deine Angaben nutzen.</b> Was du hier einträgst (Firma, Name, Anschrift, E-Mail, Telefon und Unterschrift), nutzen wir für Angebot, Vertrag, Rechnung und die Betreuung der Partnerschaft. Deine Antworten auf die drei Fragen speichern wir dazu, damit wir dich passend beraten können. Grundlage ist der Vertrag oder seine Anbahnung (Art. 6 Abs. 1 lit. b DSGVO). Verträge und Rechnungen bewahren wir auf, weil das Gesetz es verlangt (Art. 6 Abs. 1 lit. c DSGVO). Ohne Name, Anschrift und E-Mail können wir keinen Vertrag schließen. Telefon und USt-IdNr. sind freiwillig.</p>
      <p><b>Woher wir deine Angaben haben.</b> Firma, Name und Mail in deinem persönlichen Link haben wir aus unserem Gespräch mit dir oder aus öffentlichen Angaben eures Unternehmens, etwa eurer Website. Grundlage ist die Anbahnung einer Partnerschaft (Art. 6 Abs. 1 lit. b DSGVO) und unser berechtigtes Interesse, Betriebe aus dem Ort anzusprechen (Art. 6 Abs. 1 lit. f DSGVO).</p>
      <p><b>Öffentlich nennen.</b> Vor der Unterschrift fragen wir, ob wir öffentlich sagen dürfen, dass euer Betrieb Partner des Vereins ist. Sagst du ja, nennen wir den Firmennamen auf unseren eigenen Seiten, im Stadionheft und am Platz, sonst nichts. Grundlage ist deine Einwilligung (Art. 6 Abs. 1 lit. a DSGVO), du kannst sie jederzeit widerrufen, auf dieser Seite mit einem Klick oder mit einer kurzen Nachricht an uns.</p>
      <p><b>Aufrufe.</b> Wir sehen, ob und wann dieser Link geöffnet wurde (Zahl und Zeitpunkt der Aufrufe), damit wir wissen, wann wir nachfragen können. Grundlage ist unser berechtigtes Interesse, dich gut zu betreuen (Art. 6 Abs. 1 lit. f DSGVO).</p>
      <p><b>Wer Daten für uns verarbeitet.</b> GitHub Pages (GitHub Inc., USA) liefert diese Seite aus und verarbeitet dabei technische Daten wie deine IP-Adresse. Deine Angaben speichern wir bei Supabase (Supabase Inc., Server in Frankfurt am Main). Die Mails mit Angebot, Vertrag und Rechnung verschickt Resend (Resend Inc., USA) für uns. Daten gehen in die USA auf Grundlage des EU-US Data Privacy Framework oder von Standardvertragsklauseln.</p>
      <p><b>Wie lange.</b> Rechnungen bewahren wir 8 Jahre auf, Verträge und geschäftliche Mails 6 Jahre, jeweils ab Ende des Jahres. Angaben ohne Abschluss löschen wir nach spätestens 12 Monaten.</p>
      <p><b>Auf deinem Gerät.</b> Dein Browser merkt sich deine Auswahl und deine Eingaben bis zu 14 Tage, damit nichts verloren geht. Das ist für die Funktion der Seite nötig. Nach der Unterschrift bleiben davon nur Firma, Name, E-Mail und dein Paket. Wir setzen keine Cookies und kein Tracking ein. Die Schriften kommen von dieser Seite selbst, nicht von fremden Servern.</p>
      <p><b>Deine Rechte.</b> Du kannst Auskunft verlangen und deine Angaben berichtigen, löschen oder einschränken lassen, soweit wir sie nicht von Gesetzes wegen aufbewahren müssen. Du kannst deine Daten in einem gängigen Format bekommen (Datenübertragbarkeit). Der Verarbeitung aus berechtigtem Interesse, etwa dem Zählen der Aufrufe, kannst du jederzeit widersprechen (Art. 21 DSGVO). Schreib uns dazu${mail?' an '+mail:''}. Beschweren kannst du dich beim Hessischen Beauftragten für Datenschutz und Informationsfreiheit.</p>
      <button type="button" id="rechtWeg">Eingaben auf diesem Gerät löschen</button></details>`; }
  // Weite Wege (über mehrere Bildschirme) nicht als Schnelldurchlauf: erst ohne Animation nah heran, dann das letzte Stück weich
  const ALT_ZIEL={welten:'pakete',wunsch:'pakete',vorschlag:'pakete'};
  function zu(id,sofort){ id=ALT_ZIEL[id]||id; let el=document.getElementById(id); if(el&&el.hidden&&id==='baukasten')el=$('#abschluss'); if(!el||el.hidden)return; const kopf=(($('.top')||{}).offsetHeight)||60;
    const ziel=id==='start'?0:Math.max(0,el.getBoundingClientRect().top+window.scrollY-kopf+2), weg=ziel-window.scrollY;
    if(sofort||sanft()==='auto')window.scrollTo({top:ziel,behavior:'instant'});
    else if(Math.abs(weg)>innerHeight*1.5){ window.scrollTo({top:Math.max(0,ziel-(weg>0?1:-1)*innerHeight*.6),behavior:'instant'}); requestAnimationFrame(()=>window.scrollTo({top:ziel,behavior:'smooth'})); }
    else window.scrollTo({top:ziel,behavior:'smooth'});
    const h=el.querySelector('h2,h1'); if(h){ if(!h.hasAttribute('tabindex'))h.setAttribute('tabindex','-1'); setTimeout(()=>{ try{ h.focus({preventScroll:true}); }catch(e){} },sofort?0:450); } }
  // Zu einem Paket: Abschnitt anspringen und die Karte in die Mitte des Karussells holen
  function zuPaket(key,still){ const l=$('#pkListe'), k=document.getElementById('pk-'+key); if(!still)zu('pakete'); if(!l||!k)return;
    const z=()=>karteZeigen(l,k,still?'smooth':'auto'); if(still)z(); else setTimeout(z,60); }
  function karteZeigen(l,k,wie){ if(l.scrollWidth<=l.clientWidth+2)return; const pad=parseFloat(getComputedStyle(l).paddingLeft)||0; l.scrollTo({left:Math.max(0,k.offsetLeft-pad),behavior:wie==='smooth'&&sanft()==='smooth'?'smooth':'instant'}); }
  // Wischbare Reihe mit Punkten darunter: Punkt zeigt die Karte im Blick, Tipp auf einen Punkt holt die Karte
  function karussell(liste,dots){ if(!liste||liste.dataset.k)return; liste.dataset.k='1'; let raf=0;
    const akt=()=>{ const ks=[...liste.children], pad=parseFloat(getComputedStyle(liste).paddingLeft)||0; let best=0, bd=1e9; ks.forEach((k,i)=>{ const d=Math.abs(k.offsetLeft-pad-liste.scrollLeft); if(d<bd){ bd=d; best=i; } });
      if(liste.scrollLeft>4&&liste.scrollLeft+liste.clientWidth>=liste.scrollWidth-4)best=ks.length-1;
      if(dots)[...dots.children].forEach((b,i)=>b.classList.toggle('on',i===best)); };
    liste.punkte=()=>{ if(!dots)return; const ks=[...liste.children], scroll=liste.scrollWidth>liste.clientWidth+2; dots.hidden=!scroll||ks.length<2;
      if(dots.children.length!==ks.length){ dots.innerHTML=ks.map((k,i)=>`<button type="button" tabindex="-1" data-i="${i}"></button>`).join(''); [...dots.children].forEach(b=>b.onclick=()=>{ const k=liste.children[+b.dataset.i]; if(k){ tipp(6); karteZeigen(liste,k,'smooth'); } }); }
      akt(); };
    liste.addEventListener('scroll',()=>{ if(raf)return; raf=requestAnimationFrame(()=>{ raf=0; akt(); }); },{passive:true});
    addEventListener('resize',()=>liste.punkte(),{passive:true}); }
  // Nach einem Tipp baut sich die Seite neu auf; der angetippte Knopf bleibt dabei unter dem Finger
  let angetippt=null;
  function mitAnker(fn,knopf){ const a=knopf||angetippt||document.activeElement, q=v=>(window.CSS&&CSS.escape)?CSS.escape(v):String(v).replace(/"/g,'');
    const sel=a&&a.dataset?(a.dataset.add?`[data-add="${q(a.dataset.add)}"][data-m="${q(a.dataset.m||'')}"]`:a.dataset.tm?`[data-tm="${q(a.dataset.tm)}"]`:a.dataset.k&&a.dataset.g?`[data-g="${q(a.dataset.g)}"][data-k="${q(a.dataset.k)}"]`:a.dataset.bf?`[data-bf="${q(a.dataset.bf)}"]`:null):null;
    const vor=sel?a.getBoundingClientRect().top:null; fn();
    if(sel){ const n=document.querySelector(sel); if(n){ const d=n.getBoundingClientRect().top-vor; if(Math.abs(d)>1)window.scrollTo({top:window.scrollY+d,behavior:'instant'}); } } }
  // Untere Leiste: die Summe läuft mit, sobald etwas gewählt ist (außer im Abschluss selbst und neben der Seitenspalte am großen Bildschirm)
  function leiste(){ let L0=$('#leiste'); if(!L0){ L0=document.createElement('div'); L0.id='leiste'; L0.className='leiste'; L0.setAttribute('role','region'); L0.setAttribute('aria-label','Eure Auswahl');
      L0.innerHTML='<div class="lz"><b id="lzS"></b><small id="lzN"></small></div><button type="button">Zum Abschluss</button>'; document.body.appendChild(L0); L0.querySelector('button').onclick=()=>zu('baukasten'); }
    const c=S.korb.length?rechnung():null;
    if(c){ const lz=$('#lzS'), txt=c.netto_jahr+c.einmalig>0?eur(c.netto_jahr+c.einmalig)+(S.start==='naechste'||spaeterBeginn()?' netto in der ersten Saison':' netto in dieser Saison'):'Deine Spende: '+eur(c.spende);
      if(lz.textContent&&lz.textContent!==txt){ L0.classList.remove('neu'); void L0.offsetWidth; L0.classList.add('neu'); }
      lz.textContent=txt; $('#lzN').textContent=auswahlText(c); }
    leisteZeigen(); }
  // „Club Partner und 2 Bausteine“, dazu einmalige Beträge und die Spende
  function auswahlText(c){ const pk=S.korb.map(e=>lk(e.key)).find(l=>l&&l.art==='paket'), nB=S.korb.filter(e=>e.key!=='spende'&&(lk(e.key)||{}).art!=='paket').length;
    const teil=[pk?pk.titel:'',nB?(nB===1?'1 Baustein':nB+' Bausteine'):''].filter(Boolean).join(' und ');
    return [teil+(c.netto_jahr>0&&c.einmalig>0?', davon '+eur(c.einmalig)+' einmalig':''),c.spende&&(pk||nB)?'dazu '+eur(c.spende)+' Spende':''].filter(Boolean).join(', '); }
  function leisteZeigen(){ const L0=$('#leiste'); if(!L0)return; const r=x=>x&&!x.hidden?x.getBoundingClientRect():null, rb=r($('#baukasten')), ra=r($('#abschluss')), rs=r($('#bausteine'));
    const imBereich=(rb&&rb.top<innerHeight*.7&&rb.bottom>0)||(ra&&ra.top<innerHeight*.7)||(innerWidth>=1100&&rs&&rs.top<innerHeight*.5&&rs.bottom>innerHeight*.4), da=S.korb.length>0&&!imBereich&&!S.ergebnis; L0.classList.toggle('da',da); document.body.classList.toggle('leiste-da',da); }
  // Sanftes Einblenden beim Scrollen. Alles, was beim Laden schon im Bild ist, bleibt sofort sichtbar.
  let io=null;
  function beobachten(wo){ if(!('IntersectionObserver' in window)||matchMedia('(prefers-reduced-motion: reduce)').matches)return;
    if(!io){ document.body.classList.add('rv-an'); io=new IntersectionObserver(es=>es.forEach(e=>{ if(e.isIntersecting){ e.target.classList.add('da'); io.unobserve(e.target); } }),{rootMargin:'0px 0px -8% 0px'}); }
    (wo||document).querySelectorAll('.rv:not(.da)').forEach(el=>{
      const r=el.getBoundingClientRect(); if(r.top<innerHeight&&r.bottom>0){ el.classList.add('da'); } else io.observe(el); }); }
  // Welche Station gerade im Blick ist: Markierung gleitet unter den Namen, die Leiste scrollt mit, wenn sie breiter ist als das Handy
  let stnAkt='';
  function fortschritt(){ const p=$('#prog'); if(!p)return; const kopf=(($('.top')||{}).offsetHeight)||52, linie=kopf+Math.min(innerHeight*.35,260);
    let akt=''; STN.forEach(([id])=>{ const el=document.getElementById(id); if(!el||el.hidden)return; if(el.getBoundingClientRect().top<=linie)akt=id; });
    const ab=$('#abschluss'); if(ab&&!ab.hidden&&ab.getBoundingClientRect().top<=linie)akt='baukasten';
    if(innerHeight+scrollY>=document.documentElement.scrollHeight-4&&akt)akt='baukasten';
    if(akt===stnAkt&&p.dataset.w)return; stnAkt=akt;
    document.querySelectorAll('.stn-a').forEach(a=>{ const on=a.dataset.zu===akt; if(on)a.setAttribute('aria-current','true'); else a.removeAttribute('aria-current'); });
    const a=akt&&document.querySelector(`.stn-a[data-zu="${akt}"]`);
    if(!a||!a.offsetWidth){ p.style.transform='translateX(0) scaleX(0)'; p.dataset.w=''; return; }
    p.dataset.w='1'; p.style.transform=`translateX(${a.offsetLeft+10}px) scaleX(${Math.max(1,a.offsetWidth-20)})`;
    const nav=a.closest('.stn'); if(nav&&nav.scrollWidth>nav.clientWidth+2){ const l=a.offsetLeft-(nav.clientWidth-a.offsetWidth)/2; nav.scrollTo({left:Math.max(0,l),behavior:sanft()}); } }
  // Stand an den Stationen: Paket gewählt, Bausteine dabei, Zahl im Abschluss; nach der Unterschrift nur noch, was zählt
  function stationenNeu(){ const aufS=$('#auftritt');
    if(aufS&&!aufS.hidden&&fertig()){ aufS.hidden=true; const bd0=$('#bande'), tk0=$('#trikots'); if(bd0)bd0.hidden=true; if(tk0)tk0.hidden=true; }
    const sicht={auftritt:!($('#auftritt')||{}).hidden,verein:true,wirkung:!($('#wirkung')||{}).hidden,pakete:!($('#pakete')||{}).hidden,bausteine:!($('#bausteine')||{}).hidden,baukasten:true};
    STN.forEach(([id])=>{ const li=document.querySelector(`.stn li[data-stn="${id}"]`); if(li)li.hidden=!sicht[id]; }); const nv=$('.stn'); if(nv)nv.classList.toggle('wenig',Object.values(sicht).filter(Boolean).length<4);
    const ok=(id,an)=>{ const b=document.querySelector(`.stn li[data-stn="${id}"] .stn-ok`); if(b)b.hidden=!an; };
    ok('auftritt',false); ok('pakete',hatPaket()); ok('bausteine',S.korb.some(e=>e.key!=='spende'&&(lk(e.key)||{}).art!=='paket')); ok('verein',false); ok('wirkung',false);
    const p=$('#prog'); if(p)p.dataset.w=''; fortschritt(); }
  function kopfZahl(plopp){ leiste(); merken(); seiteBs(); const n=$('#kopfN'); if(!n)return; const fertig=S.ergebnis&&S.ergebnis.art!=='angebot'&&S.ergebnis.art!=='warteliste';
    const nL=S.korb.filter(e=>e.key!=='spende').length, sp=fertig&&S.ergebnis.art==='spende'; n.textContent=nL||(S.korb.length?'♥':'0'); n.hidden=!!fertig||!S.korb.length;
    const t=$('#kopfT'), txt=fertig?(sp?'✓ Danke':fest(S.ergebnis)?'✓ Partner':'✓ Unterschrift da'):'';
    if(t){ const a=t.closest('.stn-a'); if(txt){ t.textContent=txt; a.setAttribute('aria-label',sp?'Zur Spende':'Zum Vertrag'); } else if(!t.querySelector('.stn-s')){ t.innerHTML='<span class="stn-s">Abschluss</span><span class="stn-l">Abschluss</span>'; a.removeAttribute('aria-label'); }
      else a.setAttribute('aria-label',S.korb.length?'Abschluss, '+(nL===1?'1 Leistung gewählt':nL+' Leistungen gewählt'):'Abschluss'); }
    stationenNeu();
    if(plopp){ n.classList.remove('plopp'); void n.offsetWidth; n.classList.add('plopp'); } }

  // ---------- Fragen (freiwillig, nur für die Empfehlung) ----------
  function frText(){ if(fertig())return ''; const e=paketEmpfehlung(); return e&&e.aus==='antw'?`${e.titel} passt am besten zu euren Antworten.`:S.antw&&(S.herz.size||S.ziele.size||S.budget)?'Danke. Passende Bausteine haben wir unten markiert.':''; }
  function frNeu(){ const n=$('#frN'); if(!n)return; const t=frText(), e=paketEmpfehlung(), k=e&&e.aus==='antw'?e.key:'', sig=t+'|'+k; if(n.dataset.sig===sig)return; n.dataset.sig=sig;
    n.innerHTML=t?`<span>${esc(t)}</span>${k?`<button type="button" class="textknopf fr-z" data-pk="${k}">Zum Paket</button>`:''}`:''; }
  // Ein Knopf im Einstieg: vorher zu den Paketen, nach der Unterschrift zu dem, was gebucht ist
  function heroKnoepfe(){ const a=$('.runter'); if(!a)return; const da=dabeiArt(), set=(t,z)=>{ if(a.textContent!==t)a.textContent=t; a.dataset.zu=z; };
    const v=$('#heroVerein'); if(v)v.hidden=!!da;
    if(da)return set(da==='spende'?'Zur Spende':dabeiFest()?'Paket und Bankdaten':'Paket und Vertrag','abschluss');
    set('Pakete ansehen','pakete'); }
  function fragenFertig(){ const wu=$('#wunsch'); if(wu)wu.hidden=fertig(); const pa=$('#passung'); if(pa)pa.hidden=fertig(); const wi=$('#wirkung'), bw=$('#bewegtW'); if(wi)wi.hidden=fertig()||(!(bw&&bw.innerHTML.trim())&&!(pa&&!pa.hidden));
    heroKnoepfe(); const F=$('#fragen'); if(F){ F.inert=fertig(); F.classList.toggle('eingefroren',fertig()); } frNeu(); stationenNeu(); }
  function fragen(){
    const F=$('#fragen'); if(!F)return;
    const chip=(g,k,t,on)=>`<button type="button" class="chip${on?' on':''}" data-g="${g}" data-k="${k}" ${g==='budget'?`role="radio" aria-checked="${on}" tabindex="${on||(!S.budget&&k===BUDGET[0][0])?0:-1}"`:`aria-pressed="${on}"`}>${esc(t)}</button>`;
    F.innerHTML=`
      <div><div class="fr-k"><b>Wen möchtest du unterstützen?</b><small>Mehrere möglich</small></div>
        <div class="chips">${Object.keys(WELT).map(k=>chip('herz',k,WELT[k].k,S.herz.has(k))).join('')}</div></div>
      <div><div class="fr-k"><b>Was soll die Partnerschaft euch bringen?</b><small>Mehrere möglich</small></div>
        <div class="chips">${ZIELE_PRAESI.map(k=>chip('ziel',k,ZIEL_TEXT[k],S.ziele.has(k))).join('')}</div></div>
      <div><div class="fr-k"><b id="frBudget">Mit welchem Betrag je Saison planst du ungefähr?</b><small>Ein grober Nettobetrag reicht.</small></div>
        <div class="chips eins" role="radiogroup" aria-labelledby="frBudget">${BUDGET.map(([k,t])=>chip('budget',k,t,S.budget===k)).join('')}</div></div>`;
    fragenFertig();
    F.querySelectorAll('.chip').forEach(b=>b.onclick=()=>{ const g=b.dataset.g, k=b.dataset.k, vorE=(paketEmpfehlung()||{}).key;
      if(g==='herz'){ S.herz.has(k)?S.herz.delete(k):S.herz.add(k); }
      else if(g==='ziel'){ S.ziele.has(k)?S.ziele.delete(k):S.ziele.add(k); }
      else S.budget=S.budget===k?'':k;
      S.antw=true;
      F.querySelectorAll('.chip').forEach(x=>{ const on=x.dataset.g==='herz'?S.herz.has(x.dataset.k):x.dataset.g==='ziel'?S.ziele.has(x.dataset.k):S.budget===x.dataset.k; x.classList.toggle('on',on); x.setAttribute(x.dataset.g==='budget'?'aria-checked':'aria-pressed',String(on));
        if(x.dataset.g==='budget')x.tabIndex=on||(!S.budget&&x.dataset.k===BUDGET[0][0])?0:-1; });
      tipp(); mitAnker(()=>{ katalog(); if(g==='herz')bereiche(); },b); frNeu(); merken();
      // Die markierte Karte gleitet seitlich ins Bild, die Seite selbst bleibt stehen
      const e=paketEmpfehlung(); if(e&&e.key!==vorE)zuPaket(e.key,true); });
    radioPfeile(F.querySelector('[role="radiogroup"]'));
  }

  // ---------- Bewertung und Empfehlung ----------
  function frei(l,team){ if(l.je_mannschaft){ const f=l.frei_je&&team?l.frei_je[team]:null, n=l.frei_je_naechste&&team?l.frei_je_naechste[team]:null; if(S.start==='naechste'&&n!=null)return n; if((S.saisons>1||S.auto)&&n!=null&&f!=null)return Math.min(f,n); return f==null?null:f; } if(S.start==='naechste'&&l.frei_naechste!=null)return l.frei_naechste; if((S.saisons>1||S.auto)&&l.frei_naechste!=null&&l.frei!=null)return Math.min(l.frei,l.frei_naechste); return l.frei; }
  function score(l){ let s=0; (l.ziele||[]).forEach(z=>{ if(S.ziele.has(z))s+=3; }); if(S.herz.has(l.bereich))s+=4; if((D.deck||{}).empfehlung===l.key)s+=5; return s; }
  function rahmenCap(){ return (BUDGET.find(b=>b[0]===S.budget)||[0,0,1500])[2]; }
  const antwort=()=>!!(S.antw&&(S.herz.size||S.ziele.size||S.budget));
  // Welches Paket passt: aus den Antworten (Ziele und Rahmen), sonst unsere Empfehlung aus dem Termin. Vergebene Pakete nie.
  function paketEmpfehlung(){ const dkE=(D.deck||{}).empfehlung, st=STUFEN().filter(l=>frei(l,null)!==0);
    if(antwort()&&(S.ziele.size||S.budget)&&st.length){ const cap=S.budget&&S.budget!=='offen'?rahmenCap():null;
      let k=st.filter(l=>cap==null||+l.preis<=cap*1.15); if(!k.length)k=[st.slice().sort((a,b)=>+a.preis-+b.preis)[0]];
      const pkt=l=>(l.ziele||[]).filter(z=>S.ziele.has(z)).length*3+(dkE===l.key?1:0)+(cap?(+l.preis/cap)*2:0);
      const b=k.slice().sort((a,b)=>pkt(b)-pkt(a)||+a.preis-+b.preis)[0]; return {key:b.key,titel:b.titel,aus:'antw'}; }
    const e=dkE&&lk(dkE); return e&&e.art==='paket'&&e.preis!=null?{key:e.key,titel:e.titel,aus:'deck'}:null; }
  // Bausteine, die zu den Antworten passen: je gewähltem Bereich der beste freie im Rahmen; dazu unsere Empfehlung aus dem Termin
  function bausteinEmpfehlung(){ const m={}, dkE=(D.deck||{}).empfehlung, e=dkE&&lk(dkE); if(e&&e.art!=='paket')m[e.key]='Unsere Empfehlung';
    if(!antwort())return m; const cap=rahmenCap();
    [...S.herz].forEach(w=>{ const b=bausteinListe(w).filter(l=>(l.je_mannschaft?M.some(x=>l.frei_je&&l.frei_je[x.id]>0):l.frei!==0)&&+l.preis<=cap*1.15).sort((a,b)=>score(b)-score(a)||+b.preis-+a.preis)[0]; if(b)m[b.key]='Passt zu euch'; });
    return m; }
  const imKorb=(key,m)=>S.korb.some(e=>e.key===key&&(e.mannschaft||null)===(m||null));

  // ---------- Bereiche: wischbare Karten im Verein ----------
  const FOTO={jugend:{bild:'partner/jugend.jpg',pos:'center 78%',alt:'Jugendspieler des SV/BSC Mörlenbach'},erste:{bild:'partner/hero.jpg',pos:'center 40%',alt:'Die Erste des SV/BSC Mörlenbach'}};
  function weltReihenfolge(){ const alle=Object.keys(WELT).filter(w=>L.some(l=>l.bereich===w&&!['spende','sonstiges'].includes(l.art)));
    const punkte=w=>(S.herz.has(w)?100:0)+L.filter(l=>l.bereich===w).reduce((a,l)=>a+(l.ziele||[]).filter(z=>S.ziele.has(z)).length*3+((D.deck||{}).empfehlung===l.key?5:0),0)+(w==='jugend'?0.5:0);
    return alle.sort((a,b)=>punkte(b)-punkte(a)); }
  function bereiche(){ const B=$('#bereiche'); if(!B)return; const reihe=weltReihenfolge(), st=STUFEN();
    B.innerHTML=reihe.map(w=>{ const X=WELT[w], f=FOTO[w], ls=w==='verein'?st:bausteinListe(w), ab=ls.length?Math.min(...ls.map(l=>+l.preis)):null;
      const fuss=w==='verein'?`${ls.length} Pakete${ab!=null?', ab '+eur(ab)+' je Saison':''}`:`${ls.length===1?'1 Baustein':ls.length+' Bausteine'}${ab!=null?', ab '+eur(ab):''}`;
      return `<article class="bc${f?'':' n'}" role="listitem" data-bereich="${w}">${f?`<img src="${f.bild}" alt="${esc(f.alt)}" loading="lazy" decoding="async" width="1600" height="1067" style="object-position:${f.pos}">`:''}
        <div class="bc-t"><h4>${esc(X.titel)}</h4><p>${esc(w==='erste'?X.text+sichtSatz():X.text)}</p>
        <div class="bc-f"><span>${esc(fuss)}</span><button type="button" class="bc-b" ${w==='verein'?'data-zu="pakete"':`data-bf="${w}"`}>${w==='verein'?'Pakete ansehen':'Ansehen'}</button></div></div></article>`; }).join('');
    B.scrollLeft=0; B.querySelectorAll('[data-bf]').forEach(b=>b.onclick=()=>{ S.bf=b.dataset.bf; tipp(); bausteine(); zu('bausteine'); });
    if(B.punkte)B.punkte(); }
  function sichtSatz(){ const V=D.verein||{}; return V.heimspiele?` In einer Saison hat die Erste ${V.heimspiele} Heimspiele in der ${V.liga||'Kreisliga A'}.${V.zuschauer?` Zu jedem kommen nach unserer Schätzung rund ${V.zuschauer} Zuschauer.`:''}`:''; }
  function radioPfeile(rg){ if(!rg)return; rg.addEventListener('keydown',e=>{ const d={ArrowRight:1,ArrowDown:1,ArrowLeft:-1,ArrowUp:-1}[e.key]; if(!d)return; e.preventDefault();
      const bs=[...rg.querySelectorAll('[role="radio"]:not([disabled])')], i=bs.indexOf(document.activeElement), n=bs[(Math.max(0,i)+d+bs.length)%bs.length]; if(n){ n.focus(); if(n.getAttribute('aria-checked')!=='true')n.click(); } }); }

  // ---------- Katalog: Pakete und Bausteine ----------
  function katalog(){ pakete(); bausteine(); seiteBs(); }
  // Verfügbarkeit in Worten (für Paket und Baustein gleich)
  function standText(l,f,tm){ const naechst=!l.je_mannschaft&&f===0&&l.frei_naechste>0;
    if(f===0&&l.key==='p1896'&&D.exklusiv_vergeben)return ['aus','Für eure Branche schon vergeben'];
    if(f===0)return naechst?['eng',`Ab Saison ${saisonTxt(D.naechste_saison)} frei`]:['aus',l.je_mannschaft?'Für '+(tm?tm.kurz:'dieses Team')+' vergeben':'Derzeit vergeben'];
    if(f!=null&&l.plaetze>1&&(f<=3||f<l.plaetze/2))return [f<=2?'eng':'',f===1?'Nur noch ein Platz frei':`Noch ${f} von ${l.plaetze} frei`];
    return null; }
  function knopfHtml(l,team,cls,wort){ const f=frei(l,team), drin=imKorb(l.key,team), wl=S.wl.some(e=>e.key===l.key&&(e.mannschaft||null)===(team||null)), naechst=!l.je_mannschaft&&f===0&&l.frei_naechste>0, m=esc(team||''), t=esc(l.titel);
    if(drin)return `<button type="button" class="${cls}" data-add="${l.key}" data-m="${m}" data-wie="weg" aria-pressed="true" aria-label="${t}: gewählt, zum Entfernen tippen">${wort[1]}</button>`;
    if(f===0&&naechst)return `<button type="button" class="${cls}" data-add="${l.key}" data-m="" data-wie="naechste" aria-label="${t} ab Saison ${saisonTxt(D.naechste_saison)} sichern">Ab ${saisonTxt(D.naechste_saison)} sichern</button>`;
    if(f===0)return `<button type="button" class="${cls}" data-add="${l.key}" data-m="${m}" data-wie="wl" aria-pressed="${wl}" aria-label="${t} vormerken">${wl?'✓ Vorgemerkt':'Vormerken'}</button>`;
    return `<button type="button" class="${cls}" data-add="${l.key}" data-m="${m}" data-wie="dazu" aria-pressed="false" aria-label="${t} ${wort[2]}">${wort[0]}</button>`; }
  function paketKarte(l,emp){ const f=frei(l,null), drin=imKorb(l.key,null), st=standText(l,f,null), istE=emp&&emp.key===l.key;
    const marke=st?`<span class="max ${st[0]}">${esc(st[1])}</span>`:l.plaetze>1?`<span class="max">Höchstens ${l.plaetze} Partner</span>`:'';
    const tag=istE?`<span class="pk-tag">${emp.aus==='antw'?'Passt zu euch':'Unsere Empfehlung'}</span>`:'';
    const punkte=(String(l.text||'').match(/[^.]+\.?/g)||[]).map(s=>s.trim()).filter(Boolean);
    const orange=istE&&!hatPaket()&&f!==0;
    return `<article class="pk-k ${l.key}${drin?' drin':''}${drin&&S.neu===l.key+'|'?' neu':''}${f===0?' voll':''}${istE?' empf':''}" id="pk-${l.key}" role="listitem">
      <div class="pk-o">${tag}</div>
      <h3 class="pk-n">${esc(l.titel)}</h3>${l.kurz?`<p class="pk-h">${esc(l.kurz)}</p>`:''}
      <div class="pk-p"><b>${eur(l.preis)}</b><span>${esc(PLIB.EINHEIT[l.einheit]||'')}, netto</span></div>
      <ul class="pk-l">${punkte.map(t=>`<li>${esc(t)}</li>`).join('')}</ul>
      ${marke||l.key==='p1896'?`<div class="pk-v">${marke}${l.key==='p1896'?'<span class="stp">Branchenexklusiv</span>':''}</div>`:''}
      ${knopfHtml(l,null,'pk-b'+(orange?' p':''),['Dieses Paket nehmen','✓ Gewählt','nehmen'])}</article>`; }
  function pakete(){ const S0=$('#pakete'), Lp=$('#pkListe'); if(!S0||!Lp)return; const st=STUFEN();
    S0.hidden=!st.length||(fertig()&&!S.alleAuf); if(S0.hidden){ stationenNeu(); return; }
    const emp=fertig()?null:paketEmpfehlung(), sl=Lp.scrollLeft, erst=!Lp.firstElementChild;
    Lp.innerHTML=st.map(l=>paketKarte(l,emp)).join(''); Lp.scrollLeft=sl;
    Lp.querySelectorAll('[data-add]').forEach(b=>b.onclick=()=>{ angetippt=b; klickLeistung(b.dataset.add,null,b.dataset.wie); angetippt=null; });
    if(Lp.punkte)Lp.punkte();
    if(erst){ const z=(emp&&document.getElementById('pk-'+emp.key))||Lp.querySelector('.drin'); if(z)requestAnimationFrame(()=>{ karteZeigen(Lp,z,'auto'); if(Lp.punkte)Lp.punkte(); }); }
    const pk=S.korb.map(e=>lk(e.key)).find(l=>l&&l.art==='paket'), N=$('#pkNach');
    if(N){ const sig=(pk?pk.key:'')+'|'+fertig(); if(N.dataset.sig!==sig){ N.dataset.sig=sig;
      N.innerHTML=fertig()?'':pk?`<p class="pk-ok"><b>✓ ${esc(pk.titel)}</b> ist gewählt. Wollt ihr noch etwas dazunehmen?</p><div class="pk-w"><button type="button" class="knopf-w" data-zu="bausteine">Bausteine ansehen</button><button type="button" class="textknopf" data-zu="baukasten">Gleich zum Abschluss</button></div>`
        :`<p class="pk-ok leise">Ihr könnt auch ohne Paket einzelne Bausteine nehmen. <button type="button" class="textknopf" data-zu="bausteine">Zu den Bausteinen</button></p>`; } }
    stationenNeu(); }
  function bsZeile(l,empB){ const team=l.je_mannschaft?S.team:null, tm=M.find(m=>m.id===S.team), f=frei(l,team), drin=imKorb(l.key,team), st=standText(l,f,tm), offen=S.offen.has(l.key), tag=empB[l.key];
    const zusatz=st?`<span class="lk-f ${st[0]}">${esc(st[1])}${!st[0].includes('aus')&&l.je_mannschaft&&tm?' für '+esc(tm.kurz):''}</span>`:l.je_mannschaft&&tm?`<span class="lk-f">Frei für die ${nbsp(esc(tm.name))}</span>`:'';
    return `<article class="bs${drin?' drin':''}${f===0?' voll':''}${S.neu===l.key+'|'+(team||'')?' neu':''}" data-bs="${l.key}">
      <div class="bs-z"><button type="button" class="bs-kopf" data-mehr="${l.key}" aria-expanded="${offen}" aria-controls="bsx-${l.key}">${tag?`<span class="lk-tag">${tag}</span>`:''}<span class="bs-n">${esc(l.titel)}</span><span class="bs-k">${esc(l.kurz||'')}</span>${zusatz}<span class="bs-m">${offen?'Weniger':'Mehr dazu'}</span></button>
        <div class="bs-r"><div class="bs-p"><b>${eur(l.preis)}</b><small>${esc(PLIB.EINHEIT[l.einheit]||'')}</small></div>${knopfHtml(l,team,'bs-b',['Dazu','✓ Dabei','dazunehmen'])}</div></div>
      <div class="bs-x" id="bsx-${l.key}"${offen?'':' hidden'}><p>${esc(l.text||'')}</p><p class="bs-net">${eur(l.preis)} ${esc(PLIB.EINHEIT[l.einheit]||'')}, netto${l.je_mannschaft&&tm?', '+esc(tm.name):''}</p></div></article>`; }
  const BER_K={jugend:'Jugend',erste:'Erste',zweite:'Zweite',events:'Zeltlager und Turniere',verein:'Verein'};
  const BER_T={jugend:'Jugend',erste:'Erste Mannschaft',zweite:'Zweite Mannschaft',events:'Zeltlager und Turniere',verein:'Für den ganzen Verein'};
  function bausteine(){ const S0=$('#bausteine'), B=$('#bsIn'), Fi=$('#bsFilter'); if(!S0||!B)return;
    const reihe=weltReihenfolge().filter(w=>bausteinListe(w).length); S0.hidden=!reihe.length||(fertig()&&!S.alleAuf); if(S0.hidden){ stationenNeu(); return; }
    if(S.bf!=='alle'&&!reihe.includes(S.bf))S.bf='alle';
    const a=document.activeElement; let merk=null; if(a&&S0.contains(a)){ const q=v=>(window.CSS&&CSS.escape)?CSS.escape(v):v.replace(/"/g,'');
      if(a.dataset.add)merk=`[data-add="${q(a.dataset.add)}"][data-m="${q(a.dataset.m||'')}"]`; else if(a.dataset.tm)merk=`[data-tm="${q(a.dataset.tm)}"]`; else if(a.dataset.mehr)merk=`[data-mehr="${q(a.dataset.mehr)}"]`; else if(a.dataset.bf)merk=`[data-bf="${q(a.dataset.bf)}"]`; }
    Fi.innerHTML=[['alle','Alle'],...reihe.map(w=>[w,BER_K[w]])].map(([k,t])=>`<button type="button" data-bf="${k}" aria-pressed="${S.bf===k}">${esc(t)}</button>`).join('');
    const empB=fertig()?{}:bausteinEmpfehlung(), tm=M.find(m=>m.id===S.team);
    B.innerHTML=reihe.filter(w=>S.bf==='alle'||S.bf===w).map(w=>{ const ls=bausteinListe(w), hatJe=ls.some(l=>l.je_mannschaft);
      return `<div class="bs-g" id="bs-${w}"><h3>${esc(BER_T[w])}</h3>
        ${hatJe&&M.length?`<div class="teams"><div class="teams-k"><b>Für welche Mannschaft?</b><small>Am besten die, zu der ihr einen Bezug habt, etwa über Familie oder Mitarbeiter. Durchgestrichen heißt: schon vergeben.</small></div>
          <div class="tms" role="group" aria-label="Mannschaft wählen">${M.map(m=>{ const t=teamFrei(w,m.id), voll=t&&t.frei===0;
            return `<button type="button" class="tm${m.id===S.team?' on':''}${voll?' voll':''}" data-tm="${esc(m.id)}" aria-pressed="${m.id===S.team}" aria-label="${esc(m.name)}${voll?', vergeben':''}">${esc(m.kurz||m.id)}${voll?'<small>vergeben</small>':''}</button>`; }).join('')}</div></div>`:''}
        <div class="bs-l">${ls.map(l=>bsZeile(l,empB)).join('')}</div></div>`; }).join('');
    Fi.querySelectorAll('[data-bf]').forEach(b=>b.onclick=()=>{ if(S.bf===b.dataset.bf)return; S.bf=b.dataset.bf; tipp(); const k=$('.top'), y0=Fi.getBoundingClientRect().top; bausteine();
      // Filter bleibt, wo er war; liegt die Liste schon über dem Kopf, an ihren Anfang
      const kh=(k&&k.offsetHeight)||52; if(y0<kh)window.scrollTo({top:Fi.getBoundingClientRect().top+scrollY-kh-8,behavior:'instant'}); const n=Fi.querySelector(`[data-bf="${b.dataset.bf}"]`); if(n)n.focus({preventScroll:true}); });
    B.querySelectorAll('[data-tm]').forEach(b=>b.onclick=()=>{ S.team=b.dataset.tm; tipp(); mitAnker(bausteine,b); merken(); });
    B.querySelectorAll('[data-mehr]').forEach(b=>b.onclick=()=>{ const k=b.dataset.mehr, auf=!S.offen.has(k); auf?S.offen.add(k):S.offen.delete(k); b.setAttribute('aria-expanded',String(auf)); const x=document.getElementById('bsx-'+k); if(x)x.hidden=!auf; const m=b.querySelector('.bs-m'); if(m)m.textContent=auf?'Weniger':'Mehr dazu'; });
    B.querySelectorAll('[data-add]').forEach(b=>b.onclick=()=>{ angetippt=b; klickLeistung(b.dataset.add,b.dataset.m||null,b.dataset.wie); angetippt=null; });
    beobachten(B); [S0].forEach(x=>{ x.inert=fertig(); });
    if(merk){ const n=S0.querySelector(merk); if(n)n.focus({preventScroll:true}); }
    stationenNeu(); }
  // Am großen Bildschirm: die Auswahl läuft neben den Bausteinen mit
  function seiteBs(){ const X=$('#bsSeite'); if(!X)return; if(S.ergebnis&&fertig()){ X.innerHTML=''; return; } const mn=id=>(M.find(m=>m.id===id)||{}).name||id;
    if(!S.korb.length){ X.innerHTML='<h3>Eure Auswahl</h3><p class="bs-leer">Noch nichts gewählt. Nehmt ein Paket oder einzelne Bausteine, die Summe steht dann hier.</p>'; return; }
    const c=rechnung();
    X.innerHTML=`<h3>Eure Auswahl</h3><ul>${c.positionen.map(p=>`<li><span>${esc(p.key==='spende'?'Spende':p.titel)}${p.mannschaft?`<small>${esc(mn(p.mannschaft))}</small>`:''}</span><b>${eur(p.summe,true)}</b></li>`).join('')}</ul>
      ${c.netto_jahr>0?`<p class="s"><span>Je Saison</span><b>${eur(c.netto_jahr,true)}</b></p>`:''}${c.einmalig>0?`<p class="s"><span>Einmalig</span><b>${eur(c.einmalig,true)}</b></p>`:''}
      <p class="bs-n2">Alle Preise netto. Laufzeit und Start legt ihr im Abschluss fest.</p><button type="button" class="knopf-o" data-zu="baukasten">Weiter zum Abschluss</button>`; }
  function dazu(key,mannschaft,still,naechste){ const l=lk(key); if(!l)return;
    if(l.art==='paket')S.korb=S.korb.filter(e=>{ const x=lk(e.key); const raus=x&&x.art==='paket'; if(raus&&!still)toast('Es geht immer nur ein Paket. Statt '+x.titel+' habt ihr jetzt '+l.titel+' gewählt.'); return !raus; });
    const m=l.je_mannschaft?(mannschaft||S.team):null; if(imKorb(key,m))return;
    S.korb.push({id:++uid,key,mannschaft:m,menge:1,preis:null,text:'',naechste:!!naechste}); }
  function klickLeistung(key,m,wie){ m=m||null; const l=lk(key)||{};
    if(wie==='weg'){ S.korb=S.korb.filter(e=>!(e.key===key&&(e.mannschaft||null)===m)); if(S.start==='naechste'&&!S.startWahl&&!S.korb.some(e=>e.naechste)){ S.start='jetzt'; } ansage(l.titel+' ist nicht mehr gewählt.'); }
    else if(wie==='wl'){ const i=S.wl.findIndex(e=>e.key===key&&(e.mannschaft||null)===m); if(i>=0)S.wl.splice(i,1); else { S.wl.push({key,mannschaft:m}); tipp(12); toast('Vorgemerkt. Damit wir dich erreichen, brauchen wir unten nur deinen Namen und deine Mail.'); } }
    else if(wie==='naechste'){ dazu(key,null,false,true); tipp(12); if(S.start!=='naechste'){ S.start='naechste'; toast('Eure ganze Auswahl startet damit zur Saison '+saisonTxt(D.naechste_saison)+'.'); } }
    else { dazu(key,m); tippStark(12); S.neu=key+'|'+(l.je_mannschaft?(m||S.team||''):''); ansage(l.titel+' ist gewählt.'); }
    mitAnker(()=>{ katalog(); S.neu=null; korb(); }); kopfZahl(wie!=='weg'&&wie!=='wl'); }

  // ---------- Baukasten ----------
  function posFuerServer(){ return S.korb.map(e=>{ const l=lk(e.key), o={key:e.key,menge:e.menge}; if(e.mannschaft)o.mannschaft=e.mannschaft;
      if(l&&(l.art==='spende'||l.art==='sonstiges'||l.preis==null))o.preis=e.preis; else if((TV()||e.ang)&&e.preis!=null&&e.preis!=='')o.preis=+e.preis;
      if(e.text)o.text=e.text; if(e.zweck)o.zweck=e.zweck; return o; }); }
  function rechnung(){ return PLIB.rechnen(posFuerServer(),L,S.saisons); }
  function faelligAm(){ return [beginn(),iso(new Date(Date.now()+14*864e5))].sort()[1]; }
  const spaeterBeginn=()=>beginn()>iso(new Date());
  const rgSofort=()=>{ const V=D.verein||{}; return !(ust()>0)||!!(V.steuernr||V.ustid); };   // ohne Steuernummer legt der Server die Rechnung erst später an
  function beginn(){ if(S.angebot&&S.angebot.beginn&&S.start!=='naechste'){ const h=iso(new Date()); return S.angebot.beginn>h?S.angebot.beginn:h; } return S.start==='naechste'?String(D.naechste_saison).slice(0,10):iso(new Date()); }
  function ende(c){ if(!(c.netto_jahr>0))return null; return endeNach(S.saisons); }
  function endeNach(n){ const b=new Date(beginn()+'T12:00:00'), y=b.getMonth()>=6?b.getFullYear():b.getFullYear()-1; return iso(new Date(y+n,5,30,12)); }
  const saisonJahr=()=>{ const b=new Date(beginn()+'T12:00:00'); return b.getMonth()>=6?b.getFullYear():b.getFullYear()-1; };
  // Angebot: solange das Paket genau so bleibt, gelten Preise und Laufzeit aus dem Angebot
  const angebotSig=()=>JSON.stringify([S.korb.filter(e=>e.key!=='spende').map(e=>[e.key,e.mannschaft||null,+e.menge||1,e.preis==null||e.preis===''?null:+e.preis]),S.saisons,S.start,!!S.auto]);
  function angebotPruefen(){ if(!S.angebot||angebotSig()===S.angebot.sig)return;
    const sonder=S.korb.some(e=>e.ang&&(e.preis!=null||e.key==='sonstiges')); S.korb=S.korb.filter(e=>!(e.ang&&e.key==='sonstiges'&&!T));
    S.korb.forEach(e=>{ if(e.ang){ const l=lk(e.key); if(!T&&l&&l.preis!=null)e.preis=null; delete e.ang; } }); S.angebot=null; if(S.saisons>3)S.saisons=3;
    if(sonder)setTimeout(()=>toast('Eure Auswahl weicht jetzt vom Angebot ab. Es gelten die Preise von dieser Seite.'),300); }
  const nurSpende=()=>S.korb.length>0&&S.korb.every(e=>e.key==='spende');
  const fertig=()=>!!(S.ergebnis&&(S.ergebnis.art==='vertrag'||S.ergebnis.art==='spende'));
  const ust=()=>+((D.verein||{}).ust_satz)||0;
  function ersteRechnung(c){ const n=c.erste_rechnung||0, u=Math.round(n*ust())/100; return {netto:n,ust:u,brutto:Math.round((n+u)*100)/100,spende:c.spende||0}; }
  // Kündigungsfrist als echtes Datum: drei Monate vor Ablauf
  function fristDatum(c){ const e=ende(c); if(!e)return null; const d=new Date(e+'T12:00:00'); d.setMonth(d.getMonth()-3); d.setDate(d.getDate()+1); return iso(d); }
  // Spende und Leistungen gehören nicht auf einen Beleg: der Vertrag rechnet ohne Spende, die Spende bekommt ihre eigene Zusage
  const posOhneSpende=()=>posFuerServer().filter(o=>o.key!=='spende');
  function rechnungVertrag(){ return PLIB.rechnen(posOhneSpende(),L,S.saisons); }
  // Eine Saison ohne Verlängerung oder nur Einmaliges: es gibt genau eine Rechnung, also nicht „erste“
  const eineRg=c=>!(c.netto_jahr>0)||(S.saisons===1&&!S.auto);
  function summeNeu(){
    const Z=$('#summe'); if(!Z)return; const c=rechnung(), hatSaison=c.netto_jahr>0, R=ersteRechnung(c);
    Z.hidden=!S.korb.length; Z.classList.remove('abr');
    Z.innerHTML=`${hatSaison?`<div><span>Je Saison</span><span>${eur(c.netto_jahr,true)}</span></div>`:''}
        ${c.einmalig?`<div class="z"><span>Einmalig</span><span>${eur(c.einmalig,true)}</span></div>`:''}
        <div class="s"><span class="s-l">${hatSaison?`Gesamt über die Laufzeit${S.saisons>1?` (${S.saisons} Saisons${c.rabatt?', mit '+Math.round(c.rabatt*100)+' % Vorteil':''})`:''}`:'Gesamt'}, netto</span><b>${eur(c.netto_gesamt,true)}</b></div>
        ${hatSaison?`<div class="z"><span>Laufzeit</span><span>${datum(beginn())} bis ${datum(ende(c))}</span></div>`:''}
        ${R.netto>0?`<div class="er"><span class="er-k">${eineRg(rechnungVertrag())?'Rechnungsbetrag':'Erste Rechnung'}</span><div><span>Netto</span><span>${eur(R.netto,true)}</span></div>${ust()>0?`<div><span>Umsatzsteuer ${ust()} %</span><span>${eur(R.ust,true)}</span></div>`:''}<div class="b"><span>Brutto</span><span>${eur(R.brutto,true)}</span></div></div>`:''}
        ${c.spende?`<div class="sp-z2"><span>Deine Spende, getrennt abgerechnet und ohne Umsatzsteuer</span><b>${eur(c.spende,true)}</b></div>`:''}
        ${wirkungHtml(c)}
        <small>Preise netto${ust()>0?', zuzüglich '+ust()+' % Umsatzsteuer':''}. Den Laufzeitvorteil gibt es auf Partnerstufen, Banden und Patenschaften, die je Saison berechnet werden.</small>`;
    const wb=$('#weiterBtn'); if(wb)wb.disabled=!S.korb.length;
    leiste(); }
  // Aus Geld wird etwas, das man sich vorstellen kann. Die Sachen und ihre Preise stehen in der Vereinsdatei.
  // Formuliert als Vergleich, nicht als Versprechen: euer Beitrag geht in den ganzen Verein, nicht genau in diese Bälle.
  function wirkung(betrag){ const W=(C.wirkung||[]).filter(x=>x&&x.titel&&+x.preis>0); if(!W.length||!(betrag>0))return null;
    // Eine Zahl, die man sich vorstellen kann: am liebsten zwischen 3 und 15, sonst die nächstbeste
    const kand=W.map(w=>({w,n:Math.floor(betrag/+w.preis)})).filter(x=>x.n>=1);
    if(!kand.length)return null;
    const note=n=>n>=3&&n<=15?0:n<3?3-n:n-15;
    kand.sort((a,b)=>note(a.n)-note(b.n)||+b.w.preis-+a.w.preis);
    const b=kand[0]; return {n:Math.min(b.n,99), titel:b.n===1?(b.w.eins||b.w.titel):b.w.titel}; }
  function wirkungHtml(c){ const w=wirkung(c&&c.netto_gesamt); if(!w)return '';
    return `<div class="wirk"><b>${w.n}</b><span>So viel wie ${w.n} ${esc(w.titel)}. Euer Beitrag geht in den ganzen Verein, das hier ist nur zum Vorstellen.</span></div>`; }
  function korb(){
    const K=$('#korbIn'); if(!K)return; if(S.auto&&!fertig()){ const f0=fristDatum(rechnung()); if(f0&&f0<iso(new Date()))S.auto=false; } if(!fertig())angebotPruefen(); const c=rechnung(), mn=id=>(M.find(m=>m.id===id)||{}).name||id, V=D.verein||{};
    const bk=K.closest('.bk'); if(bk)bk.classList.toggle('fertig',fertig()); const bl=$('#bkLeer'); if(bl)bl.hidden=fertig()||S.korb.length>0;
    if(fertig()){ const R=S.ergebnis, ps=(R.positionen||[]).concat(R.spende?R.spende.positionen||[]:[]);
      const spP=ps.filter(p=>p.art==='spende'||p.key==='spende'), vP=ps.filter(p=>!spP.includes(p)), bis=(()=>{ try{ const e=ende(rechnungVertrag()); return e?datum(e):''; }catch(_){ return ''; } })(), spZw=(S.korb.find(e=>e.key==='spende')||{}).zweck,
        zeileP=p=>{ const sp=p.art==='spende'||p.key==='spende', w=wirkung(p, spZw); return `<div class="kp"><div class="kp-n"><b>${esc(sp?'Für '+zweckTxt(p.zweck||spZw):p.titel)}</b><small>${esc(sp?'einmalig':[p.mannschaft?mn(p.mannschaft):'',PLIB.EINHEIT[p.einheit]||'',p.einheit==='saison'&&bis?'bis '+bis:''].filter(Boolean).join(' · '))}</small>${w?`<span class="kp-w">${esc(w)}</span>`:''}</div><div class="kp-p">${eur(p.summe||0,true)}</div></div>`; };
      const kl=R.art!=='spende'&&Array.isArray(R.klauseln)?R.klauseln:[];
      const amU=datum(R.unterschrieben_am||R.am||(R.rechnung||{}).datum||iso(new Date()));
      K.innerHTML=`<h2 class="g">${R.art==='spende'?'Deine Spende':'Was ihr gebucht habt'}</h2><p class="lead">${R.art==='spende'?`Zugesagt am ${amU}. Freiwillig und unverbindlich, die Bankdaten stehen weiter unten.`:`Am ${amU} unterschrieben, Vertrag ${esc(R.nr||'')}, alle Preise netto.`}</p>
        ${vP.length?`<div class="korb">${vP.map(zeileP).join('')}</div>`:R.art==='spende'&&spP.length?`<div class="korb">${spP.map(zeileP).join('')}</div>`:''}
        ${kl.length?bedingungenHtml(kl):''}
        ${spP.length&&R.art!=='spende'?`<div class="sp-block"><h3 class="sp-h">Deine Spende</h3><div class="korb">${spP.map(zeileP).join('')}</div><p class="kp-summe">Freiwillig und unverbindlich, getrennt vom Vertrag. Danke.</p></div>`:''}
        <p class="frage-k">Fragen? ${V.email?`Schreib uns an <span class="sel">${esc(V.email)}</span>. Wollt ihr später etwas dazunehmen, schicken wir euch einen Nachtrag.`:'Schreib uns. Wollt ihr später etwas dazunehmen, schicken wir euch einen Nachtrag.'}</p>
        <button type="button" class="textknopf" id="alleAuf" aria-expanded="${!!S.alleAuf}" aria-controls="pakete bausteine">${S.alleAuf?'Übersicht zuklappen':'Alles ansehen, was es bei uns gibt'}</button>`;
      const aa=K.querySelector('#alleAuf'); if(aa)aa.onclick=()=>{ S.alleAuf=!S.alleAuf; aa.setAttribute('aria-expanded',String(S.alleAuf)); aa.textContent=S.alleAuf?'Übersicht zuklappen':'Alles ansehen, was es bei uns gibt'; katalog(); stationenNeu(); if(S.alleAuf)setTimeout(()=>zu('pakete'),60); };
      // Abrechnung als ruhige Karte (am Desktop rechts daneben), ohne Knopf
      const Z=$('#summe'); if(Z){ const rg=R.rechnung, ein=vP.filter(p=>p.einheit!=='saison').reduce((a,p)=>a+(+p.summe||0),0), nj=R.netto_jahr!=null?+R.netto_jahr:vP.filter(p=>p.einheit==='saison').reduce((a,p)=>a+(+p.summe||0),0), u=R.ust_satz!=null?+R.ust_satz:ust();
        const zl=(a,b,cl)=>`<div${cl?` class="${cl}"`:''}><span>${a}</span><span>${b}</span></div>`;
        Z.hidden=false; Z.classList.add('abr');
        Z.innerHTML=R.art==='spende'?`${zl('Spendenzusage',esc(R.nr||''),'z')}<div class="s"><span class="s-l">Deine Spende</span><b>${eur(rg?rg.brutto:c.spende,true)}</b></div><small>Ohne Umsatzsteuer. Die Bankdaten stehen weiter unten.</small>`
          :`${zl('Vertrag',esc(R.nr||''))}${nj>0&&(R.ende||ende(rechnungVertrag()))?zl('Laufzeit',datum(R.beginn||beginn())+' bis '+datum(R.ende||ende(rechnungVertrag()))):''}
          <small>${rg?(rg.status==='bezahlt'?'Die Rechnung ist bezahlt. Danke.':'Rechnung und Bankdaten stehen gleich darunter.'):fest(R)?'Die erste Rechnung kommt in den nächsten Tagen per Mail.':'Die Bankdaten stehen auf der Rechnung, die mit dem gegengezeichneten Vertrag kommt.'}</small>`;
        // Das Foto passt zur Buchung: Stufe, Bande oder Erste zeigt die Erste, sonst die Jugend
        const jugB=vP.some(p=>p.mannschaft||/^(trikot_jugend|aufwaerm_jugend|baelle_jugend|trainer_jugend|team_jugend|zeltlager|ferienspiele|turnier)/.test(p.key)), ersteB=!jugB&&vP.some(p=>/^(supporter|club|premium|p1896|bande_|brust_|aermel_|matchball|sotd|tor_monat)/.test(p.key)), alt0=Z.parentNode.querySelector('.bk-foto');
        const pol=ersteB?'<figure class="bk-foto"><img src="partner/hero.jpg" alt="Die Erste des SV/BSC Mörlenbach" loading="lazy" decoding="async" style="object-position:center 40%"><figcaption>Die Erste des SV/BSC Mörlenbach</figcaption></figure>'
          :'<figure class="bk-foto"><img src="partner/jugend.jpg" alt="Jugendspieler des SV/BSC Mörlenbach" loading="lazy" decoding="async" style="object-position:center 80%"><figcaption>Jugend des SV/BSC Mörlenbach</figcaption></figure>';
        if(!alt0)Z.insertAdjacentHTML('afterend',pol); else if(alt0.querySelector('img').getAttribute('src')!==(ersteB?'partner/hero.jpg':'partner/jugend.jpg'))alt0.outerHTML=pol; }
      const W0=$('#korbWeiter'); if(W0)W0.hidden=true; return; }
    { const W0=$('#korbWeiter'); if(W0)W0.hidden=!S.korb.length; const pf=$('.bk-r .bk-foto'); if(pf)pf.remove(); }
    const fokus=document.activeElement&&K.contains(document.activeElement)?document.activeElement:null, fSel=fokus?(fokus.id?'#'+fokus.id:fokus.dataset.sa?`[data-sa="${fokus.dataset.sa}"]`:fokus.dataset.st?`[data-st="${fokus.dataset.st}"]`:fokus.dataset.sp?`[data-sp="${fokus.dataset.sp}"]`:null):null;
    const zeile=e=>{ const l=lk(e.key)||{}, p=c.positionen.find(x=>x.key===e.key&&(x.mannschaft||null)===(e.mannschaft||null))||{}, menge=['stueck','spieltag'].includes(l.einheit);
      return `<div class="kp" data-id="${e.id}"><div class="kp-n"><b>${esc(l.art==='sonstiges'&&e.text?e.text:l.titel)}</b><small>${esc([l.je_mannschaft?mn(e.mannschaft):'',e.naechste?'ab Saison '+saisonTxt(D.naechste_saison):'',PLIB.EINHEIT[l.einheit]||''].filter(Boolean).join(' · '))}</small></div>
        <div class="kp-p">${eur(p.summe||0)}${p.rabatt?`<small>mit ${Math.round(p.rabatt*100)} % Laufzeitvorteil</small>`:''}</div>
        <div class="kp-z">${l.je_mannschaft?`<select data-f="mannschaft" aria-label="Mannschaft">${M.map(m=>{ const f=l.frei_je?l.frei_je[m.id]:null, doppelt=m.id!==e.mannschaft&&imKorb(e.key,m.id), aus=m.id!==e.mannschaft&&(f===0||doppelt);
            return `<option value="${esc(m.id)}"${m.id===e.mannschaft?' selected':''}${aus?' disabled':''}>${esc(m.name)}${f===0&&m.id!==e.mannschaft?', vergeben':doppelt?', schon im Paket':''}</option>`; }).join('')}</select>`:''}
          ${menge?`<div class="menge"><button type="button" data-d="-1" aria-label="weniger">−</button><b aria-live="polite">${e.menge}</b><button type="button" data-d="1" aria-label="mehr">+</button></div>`:''}
          ${TV()&&l.preis!=null?`<label>Sonderpreis <input type="text" inputmode="decimal" data-f="preis" value="${e.preis==null?'':esc(String(e.preis).replace('.',','))}" placeholder="${esc(l.preis)}" enterkeyhint="done"></label>`:''}
          <button type="button" class="kp-x" data-weg="1" aria-label="${esc(l.titel)} entfernen">Entfernen</button></div></div>`; };
    const sp=S.korb.find(e=>e.key==='spende'), naechsteDrin=S.korb.some(e=>e.naechste);
    const leer=!S.korb.filter(e=>e.key!=='spende').length;
    const basis=PLIB.rechnen(posOhneSpende(),L,1).netto_jahr, spar=n=>basis>0?' Das spart '+eur(Math.round(basis*n*(n>=3?.10:.05)*100)/100).replace(' ','\u00a0')+'.':'', fd=fristDatum(c), fristVorbei=!!(fd&&fd<iso(new Date())), en=ende(c), endeTxt=datum(en||endeNach(S.saisons));
    const spOffen=!!sp||leer||S.spendeAuf;
    K.innerHTML=`<h2 class="g">Eure Auswahl</h2>
      <p class="lead">${leer&&!sp?'Noch leer. Nehmt oben ein Paket, Bausteine kommen nach Wunsch dazu.':'Legt noch die Laufzeit fest, dann geht es zum Abschluss.'}</p>${leer&&!sp?'<button type="button" class="knopf-w kurz" data-zu="pakete">Zu den Paketen</button>':''}
      ${leer?'':`<div class="korb">${S.korb.filter(e=>e.key!=='spende').map(zeile).join('')}</div>`}
      ${S.wl.length?`<p class="wl-n">Vorgemerkt: ${esc(S.wl.map(w=>(lk(w.key)||{}).titel+(w.mannschaft?' ('+mn(w.mannschaft)+')':'')).join(', '))}</p>`:''}
      ${TV()?`<div class="sonst" id="sonst"><label>Sonstiges, im Termin vereinbart<input id="soT" maxlength="80" placeholder="z. B. Vereinsheim-Abend" enterkeyhint="next"></label><label>Preis netto<input id="soP" type="text" inputmode="decimal" enterkeyhint="done"></label><button type="button" id="soAdd">Dazu</button></div>`:''}
      ${c.netto_jahr>0?`<div class="unter" id="laufzeit"><h3 id="lzK">Laufzeit</h3><div class="opts drei" role="radiogroup" aria-labelledby="lzK">${[[1,'1 Saison',S.auto?'Bis '+datum(endeNach(1))+', danach jedes Jahr neu.':'Endet am '+datum(endeNach(1))+' von selbst.'],[2,'2 Saisons','Preis fest bis '+datum(endeNach(2))+'.'+spar(2)],[3,'3 Saisons','Platz und Preis drei Saisons sicher.'+spar(3)]].map(([n,t,s])=>`<button type="button" class="opt${S.saisons===n?' on':''}" data-sa="${n}" role="radio" aria-checked="${S.saisons===n}" tabindex="${S.saisons===n?0:-1}"><b>${t}</b><small>${s}</small></button>`).join('')}</div>
        <div class="opts" role="radiogroup" aria-label="Start">${[['jetzt','Ab sofort','Gleich los, bis zum '+datum((+String(D.saison).slice(0,4)+S.saisons)+'-06-30')+'.'],['naechste','Ab Saison '+saisonTxt(D.naechste_saison),'Los geht es am '+datum(String(D.naechste_saison).slice(0,10))+'. Zahlen müsst ihr erst zum Start.']].map(([k,t,s])=>{ const aus=k==='jetzt'&&naechsteDrin;
          return `<button type="button" class="opt${S.start===k?' on':''}" data-st="${k}" role="radio" aria-checked="${S.start===k}" tabindex="${S.start===k?0:-1}"${aus?' disabled':''}><b>${t}</b><small>${aus?'Ein Baustein ist erst ab '+saisonTxt(D.naechste_saison)+' frei':s}</small></button>`; }).join('')}</div>
        ${S.start==='jetzt'&&iso(new Date())>String(D.saison).slice(0,10)?`<p class="einmal lz-notiz">Berechnet wird die ganze Saison ${saisonTxt(D.saison)}, auch wenn sie schon läuft. Lieber mit einer neuen Saison anfangen? Dann oben „Ab Saison ${saisonTxt(D.naechste_saison)}“ wählen. Zahlen müsst ihr dann erst zum Start.${S.saisons===1&&basis>0?` Nehmt ihr zwei Saisons, seid ihr bis zum ${datum(endeNach(2))} dabei und spart ${eur(Math.round(basis*2*.05*100)/100).replace(' ','\u00a0')}.`:''}</p>`:''}
        <button type="button" class="sw${S.auto?' on':''}${fristVorbei?' aus':''}" id="swAuto" role="switch" aria-checked="${S.auto}"${fristVorbei?' aria-disabled="true"':''}><span>Automatisch verlängern<small>${fristVorbei?`Bei diesem Start ist die Kündigungsfrist dieser Saison schon vorbei. Mit zwei Saisons oder dem Start zur nächsten Saison lässt sich die Verlängerung einschalten.`:S.auto?`An. ${S.saisons>1?'Danach verlängert sich der Vertrag um je eine Saison, dann zum Preis ohne Laufzeitvorteil.':'Verlängert sich um je eine Saison.'} Kündigen geht bis zum ${fd?datum(fd):'31.03.'}, ${V.email?'eine Mail an '+esc(V.email)+' genügt':'eine kurze Mail genügt'}.`:`Aus. Der Vertrag endet am ${endeTxt} von selbst.`}</small></span><span class="schalter" aria-hidden="true"><i></i></span></button></div>`:leer?'':`<div class="unter"><h3>Laufzeit</h3><p class="einmal">Einmalige Leistung. Es gibt keine Laufzeit und nichts zu kündigen.</p></div>`}
      ${spOffen?'':`<div class="unter"><button type="button" class="textknopf" id="spAuf">Zusätzlich etwas ohne Gegenleistung geben? Spende hinzufügen</button></div>`}
      <div class="unter"${spOffen?'':' hidden'}><h3>Spende</h3><div class="sp"><div style="font-size:16px;line-height:1.5">Für eine Spende gibt es keine Gegenleistung. Du bestimmst, wofür wir das Geld einsetzen.</div>
        <div class="sp-b">${[50,100,250,500].map(b=>`<button type="button" data-sp="${b}" class="${sp&&+sp.preis===b?'on':''}" aria-pressed="${!!(sp&&+sp.preis===b)}">${b}\u00a0€</button>`).join('')}</div>
        <div class="sp-z"><input id="spBetrag" type="text" inputmode="decimal" enterkeyhint="done" placeholder="Eigener Betrag" value="${sp&&![50,100,250,500].includes(+sp.preis)?esc(String(sp.preis).replace('.',',')):''}" aria-label="Eigener Betrag in Euro">
          <select id="spZweck" aria-label="Zweck">${['Jugend','Zeltlager','Ferienspiele','Erste Mannschaft','Zweite Mannschaft','Verein'].map(z=>`<option${(sp?sp.zweck:S.spende.zweck)===z?' selected':''}>${z}</option>`).join('')}</select>
          ${sp?'<button type="button" class="kp-x" id="spWeg" style="margin-left:0">Spende entfernen</button>':''}</div></div></div>
      <details class="gut"><summary>Gut zu wissen: Steuern</summary><p>Eine Partnerschaft mit Gegenleistung ist für euren Betrieb in der Regel eine Betriebsausgabe. Die Umsatzsteuer auf unserer Rechnung könnt ihr in der Regel als Vorsteuer abziehen.${V.gemeinnuetzig?' Für eine Spende stellen wir eine Zuwendungsbestätigung aus.':''} Was im Einzelfall gilt, sagt euch euer Steuerberater.</p></details>`;
    const W=$('#korbWeiter'); if(W&&!W.firstChild&&S.korb.length){ W.innerHTML=`<button type="button" class="knopf-o" id="weiterBtn" style="margin-top:18px" data-zu="abschluss">Weiter zum Abschluss</button>`; }
    K.querySelectorAll('.kp').forEach(z=>{ const e=S.korb.find(x=>x.id===+z.dataset.id); if(!e)return;
      z.querySelectorAll('[data-d]').forEach(b=>b.onclick=()=>{ e.menge=Math.max(1,Math.min(99,e.menge+(+b.dataset.d))); nachKorb(); });
      z.querySelector('[data-weg]').onclick=()=>{ const idx=S.korb.indexOf(e), st0=S.start, l0=lk(e.key)||{}; S.korb=S.korb.filter(x=>x!==e); if(S.start==='naechste'&&!S.startWahl&&!S.korb.some(x=>x.naechste))S.start='jetzt'; nachKorb(true);
        toastZurueck((l0.art==='sonstiges'&&e.text?e.text:l0.titel||'Die Leistung')+' ist aus eurer Auswahl raus.',()=>{ if(S.ergebnis||S.korb.includes(e)||imKorb(e.key,e.mannschaft)||(l0.art==='paket'&&S.korb.some(x=>(lk(x.key)||{}).art==='paket')))return; S.korb.splice(Math.min(idx,S.korb.length),0,e); S.start=st0; merken(); nachKorb(true); kopfZahl(); }); };
      const se=z.querySelector('[data-f="mannschaft"]'); if(se)se.onchange=()=>{ if(imKorb(e.key,se.value)){ se.value=e.mannschaft; return toast('Das ist für diese Mannschaft schon in deinem Paket.'); } e.mannschaft=se.value; nachKorb(true); };
      const pr=z.querySelector('[data-f="preis"]'); if(pr){ const setz=()=>{ const v=betrag(pr.value); if(pr.value.trim()==='')e.preis=null; else if(isFinite(v))e.preis=Math.max(0,v); };
        pr.oninput=()=>{ setz(); summeNeu(); }; pr.onchange=()=>{ setz(); nachKorb(); }; pr.onkeydown=ev=>{ if(ev.key==='Enter'){ ev.preventDefault(); pr.blur(); } }; } });
    const gruppe=(sel,b)=>K.querySelectorAll(sel).forEach(x=>{ const on=x===b; x.classList.toggle('on',on); x.setAttribute('aria-checked',String(on)); x.tabIndex=on?0:-1; });
    // iOS Safari verankert beim Neuaufbau nicht: die angetippte Kachel bleibt unter dem Finger
    const geankert=(sel,fn)=>{ const a=document.querySelector(sel), vor=a?a.getBoundingClientRect().top:null; fn(); const n=document.querySelector(sel); if(n&&vor!=null){ const d=n.getBoundingClientRect().top-vor; if(Math.abs(d)>1)window.scrollTo({top:window.scrollY+d,behavior:'instant'}); } if(n&&a&&document.activeElement===document.body)n.focus({preventScroll:true}); };
    K.querySelectorAll('[data-sa]').forEach(b=>b.onclick=()=>{ if(S.saisons===+b.dataset.sa)return; S.saisons=+b.dataset.sa; gruppe('[data-sa]',b); tipp(); const sel=`[data-sa="${b.dataset.sa}"]`; setTimeout(()=>geankert(sel,()=>nachKorb()),180); });
    K.querySelectorAll('[data-st]').forEach(b=>b.onclick=()=>{ if(S.start===b.dataset.st)return; S.start=b.dataset.st; S.startWahl=true; gruppe('[data-st]',b); tipp(); const sel=`[data-st="${b.dataset.st}"]`; setTimeout(()=>geankert(sel,()=>{ korbPruefen(); nachKorb(true); }),180); });
    K.querySelectorAll('#laufzeit [role="radiogroup"]').forEach(radioPfeile);
    const swA=K.querySelector('#swAuto'); if(swA)swA.onclick=()=>{ if(swA.getAttribute('aria-disabled')==='true')return toast('Für diesen Start ist die Kündigungsfrist dieser Saison schon vorbei. Mit zwei Saisons oder dem Start zur nächsten Saison lässt sich die Verlängerung einschalten.'); S.auto=!S.auto; swA.classList.toggle('on',S.auto); swA.setAttribute('aria-checked',String(S.auto)); tipp(); setTimeout(()=>geankert('#swAuto',()=>nachKorb()),220); };
    const sa0=K.querySelector('#spAuf'); if(sa0)sa0.onclick=()=>{ S.spendeAuf=true; korb(); const b=$('[data-sp="50"]'); if(b)b.focus(); };
    const setSp=(v,still)=>{ v=betrag(v); if(!isFinite(v)){ toast('Bitte nur einen Betrag in Euro eintragen, zum Beispiel 50 oder 25,50.'); return; } v=Math.max(0,v);
      if(v>100000){ toast('Für Beträge über 100.000 € sprich uns bitte direkt an.'); return; } const z=K.querySelector('#spZweck').value; S.spende.zweck=z; const e=S.korb.find(x=>x.key==='spende');
      if(!v){ if(e)S.korb=S.korb.filter(x=>x!==e); } else if(e){ e.preis=v; e.zweck=z; } else S.korb.push({id:++uid,key:'spende',mannschaft:null,menge:1,preis:v,zweck:z,text:''});
      if(still){ summeNeu(); kopfZahl(); K.querySelectorAll('[data-sp]').forEach(b=>{ const on=+b.dataset.sp===v; b.classList.toggle('on',on); b.setAttribute('aria-pressed',String(on)); }); }
      else { nachKorb(); kopfZahl(true); } };
    K.querySelectorAll('[data-sp]').forEach(b=>b.onclick=()=>{ const v=b.classList.contains('on')?0:+b.dataset.sp, hatte=S.korb.some(x=>x.key==='spende');
      K.querySelectorAll('[data-sp]').forEach(x=>{ const on=+x.dataset.sp===v; x.classList.toggle('on',on); x.setAttribute('aria-pressed',String(on)); }); tipp();
      if(v&&hatte){ const sb0=K.querySelector('#spBetrag'); if(sb0)sb0.value=''; setSp(v,true); if(!S.ergebnis)abschluss(); } else setTimeout(()=>setSp(v),180); });
    let spT=0; const sb=K.querySelector('#spBetrag'); sb.oninput=()=>{ clearTimeout(spT); spT=setTimeout(()=>setSp(sb.value,true),400); }; sb.onchange=()=>{ clearTimeout(spT); setSp(sb.value,true); abschluss(); }; sb.onkeydown=e=>{ if(e.key==='Enter'){ e.preventDefault(); sb.blur(); } };
    K.querySelector('#spZweck').onchange=e=>{ S.spende.zweck=e.target.value; const s=S.korb.find(x=>x.key==='spende'); if(s){ s.zweck=e.target.value; merken(); abschluss(); } };
    const sw=K.querySelector('#spWeg'); if(sw)sw.onclick=()=>setSp(0);
    const soT=K.querySelector('#soT'), soP=K.querySelector('#soP'); if(soT&&soP){ soT.onkeydown=e=>{ if(e.key==='Enter'){ e.preventDefault(); soP.focus(); } }; soP.onkeydown=e=>{ if(e.key==='Enter'){ e.preventDefault(); const a=K.querySelector('#soAdd'); if(a)a.click(); } }; }
    const sa=K.querySelector('#soAdd'); if(sa)sa.onclick=()=>{ const t=K.querySelector('#soT').value.trim(), p=betrag(K.querySelector('#soP').value);
      if(t.length<3||!(p>0))return toast('Bitte Text und Preis eintragen.'); S.korb.push({id:++uid,key:'sonstiges',mannschaft:null,menge:1,preis:p,text:t}); nachKorb(); kopfZahl(true); };
    summeNeu();
    if(fSel){ const n=K.querySelector(fSel); if(n)n.focus({preventScroll:true}); }
    if(!S.ergebnis)abschluss();
  }
  function nachKorb(weltenAuch){ const k=$('#baukasten'), y0=k?k.getBoundingClientRect().top:0; korb(); if(weltenAuch){ katalog(); } kopfZahl();
    if(weltenAuch&&k){ const d=k.getBoundingClientRect().top-y0; if(Math.abs(d)>1)window.scrollTo({top:window.scrollY+d,behavior:'instant'}); } }

  // ---------- Abschluss ----------
  function klauseln(c){ const keys=PLIB.klauselnFuer(c.positionen,L,{auto:S.auto,saisons:S.saisons}), e=ende(c), fd=fristDatum(c);
    const w={zweck:ZWECK_VERTRAG[(S.korb.find(x=>x.key==='spende')||{}).zweck]||'seine Fußballabteilung',beginn:datum(beginn()),ende:e?datum(e):'Ende der Leistung',frist:3,frist_datum:fd?datum(fd):'drei Monate vor Ablauf',branche:(D.deck||{}).branche||'',mail:(D.verein||{}).email||'den Verein'};
    return keys.map(k=>{ const kk=k==='spende'&&(D.verein||{}).gemeinnuetzig===false?'spende_ohne':k, [titel,text]=PLIB.klauselText(kk,w); return {key:kk,titel,text}; }); }
  // Ansprechpartner mit Gesicht: Menschen folgen Menschen, und aus WhatsApp heraus ist eine Mail ein Bruch.
  // Wer zu sehen ist, steht in der Vereinsdatei (Bild, Name, Funktion). Nummer und Mail kommen aus den Vereinsdaten
  // der App, damit sie nur an einer Stelle gepflegt werden. Fehlt ein Wert, fehlt einfach der Knopf.
  function kontaktDaten(){ const V=(D&&D.verein)||{}, K=(C.kontakt||{});
    let P=Array.isArray(K.personen)?K.personen.filter(x=>x&&x.name):[];
    if(!P.length&&(V.vertreter||K.name))P=[{name:V.vertreter||K.name,funktion:V.vertreter_funktion||K.funktion||'',bild:K.bild||''}];
    return {personen:P.slice(0,3), telefon:V.telefon||K.telefon||'', whatsapp:V.whatsapp||K.whatsapp||'', mail:V.email||K.mail||''}; }
  const telLink=n=>'tel:'+String(n||'').replace(/[^+0-9]/g,'');
  // +49 ohne Leerzeichen und ohne führende Null, so will es wa.me
  function waLink(n){ let x=String(n||'').replace(/[^+0-9]/g,''); if(!x)return ''; if(x.startsWith('+'))x=x.slice(1); else if(x.startsWith('00'))x=x.slice(2); else if(x.startsWith('0'))x='49'+x.slice(1); return 'https://wa.me/'+x; }
  function mailHref(){ const K=kontaktDaten(); if(!K.mail)return ''; const c=(L&&L.length&&S.korb.length)?rechnung():null;
    const pos=c&&c.positionen.length?'\n\nMein Paket bisher:\n'+c.positionen.map(p=>'· '+p.titel+(p.mannschaft?' ('+((M.find(m=>m.id===p.mannschaft)||{}).name||p.mannschaft)+')':'')).join('\n'):'';
    const body='Hallo,\n\nich würde gern kurz über eine Partnerschaft sprechen.'+pos+'\n\nMeine Nummer: \nAm besten erreichbar: \n\nViele Grüße\n'+((S.F&&S.F.ansprech)||'');
    return 'mailto:'+K.mail+'?subject='+encodeURIComponent('Partnerschaft: '+((S.F&&S.F.firma)||(D&&D.deck||{}).firma||''))+'&body='+encodeURIComponent(body); }
  function kontaktHtml(satz){ const K=kontaktDaten(); if(!K.personen.length&&!K.mail&&!K.telefon)return '';
    const mh=mailHref(), wa=waLink(K.whatsapp), P=K.personen;
    // Mehrere Namen: „A, B und C“. Gleiche Funktionen stehen nur einmal da.
    const nam=P.map(x=>x.name), namen=nam.length>1?nam.slice(0,-1).join(', ')+' und '+nam[nam.length-1]:nam[0]||'';
    const fkt=[...new Set(P.map(x=>x.funktion).filter(Boolean))];
    const kopf=P.length?`<b>${esc(namen)}</b>${fkt.length?`<small>${esc(fkt.join(' · '))}</small>`:''}`:'';
    return `<div class="kontakt${P.length>2?' zwei drei':P.length>1?' zwei':''}">
      ${P.length?`<div class="kt-bilder">${P.map(x=>x.bild?`<img src="${esc(x.bild)}" alt="${esc(x.name)}" width="74" height="74" loading="lazy" decoding="async">`:'').join('')}</div>`:''}
      <div class="kt-t">${kopf}
        <p>${esc(satz||'Lieber erst kurz sprechen? Melde dich, dann klären wir das in fünf Minuten.')}</p>
        <div class="kt-knoepfe">${K.telefon?`<a href="${esc(telLink(K.telefon))}">Anrufen</a>`:''}${wa?`<a href="${esc(wa)}" target="_blank" rel="noopener">WhatsApp</a>`:''}${mh?`<a href="${esc(mh)}">Mail schreiben</a>`:''}</div>
      </div></div>`; }
  function sprechenHtml(){ return kontaktHtml(); }
  function feldHtml(n,t,typ,ac,o){ o=o||{}; const F=S.F;
    return `<label${o.cls?` class="${o.cls}"`:''}>${t}<input name="${n}" ${typ?`type="${typ}"`:''} autocomplete="${ac||'off'}" maxlength="${o.max||120}" value="${esc(F[n]||'')}"${o.ph?` placeholder="${esc(o.ph)}"`:''}${o.im?` inputmode="${o.im}"`:''} enterkeyhint="${o.ek||'next'}"${o.cap?` autocapitalize="${o.cap}"`:''}${o.aus?' autocorrect="off" spellcheck="false"':''}></label>`; }
  // Weiter auf der iPhone-Tastatur springt ins nächste Feld, Fertig schließt die Tastatur
  function formTasten(fm){ fm.addEventListener('keydown',e=>{ if(e.key!=='Enter'||e.target.tagName!=='INPUT')return; e.preventDefault();
    const fs=[...fm.querySelectorAll('input,select')].filter(x=>x.offsetParent!==null), i=fs.indexOf(e.target); let n=fs[i+1];
    while(n&&n.tagName==='SELECT')n=fs[fs.indexOf(n)+1];
    if(n)n.focus(); else { e.target.blur(); const z=$('#abWeiter'); if(z&&z.firstElementChild)nachTastatur(()=>z.firstElementChild.scrollIntoView({block:'start',behavior:sanft()})); } }); }
  function nachTastatur(fn){ const vv=window.visualViewport; let los=false; const go=()=>{ if(los)return; los=true; if(vv)vv.removeEventListener('resize',go); fn(); };
    if(vv)vv.addEventListener('resize',go); setTimeout(go,350); }
  // Derselbe Link auf einem zweiten Gerät (typisch: unterschrieben am Handy, bezahlt am Rechner): alles zum Überweisen
  function schonPartnerHtml(){ const a=D.abschluss, rs=a.rechnungen||[], offen=rs.filter(r=>r.status==='offen'), sp=a.art==='spende', beleg=offen.length&&offen.every(r=>r.art==='spende')?'die Spendenzusage':'die Rechnung';
    const fe=fest(a), satz=sp?`Über diesen Link hast du am ${datum(a.am)} eine Spende zugesagt (${esc(a.nr)}). Danke dafür.`:`Über diesen Link hast du am ${datum(a.am)} den Vertrag ${esc(a.nr)} unterschrieben.${fe?' Der Verein hat gegengezeichnet, der Vertrag ist geschlossen.':' Wir unterschreiben in den nächsten Tagen für den Verein, dann kommt alles per Mail.'}`;
    const weiter=offen.length?(a.bank?` Hier findest du alles zum Überweisen, ${beleg} liegt auch in deiner Mail.`:` ${beleg==='die Rechnung'?'Die Rechnung':'Die Spendenzusage'} mit den Bankdaten liegt in deiner Mail.`):rs.length?' Alles ist bezahlt. Danke.':sp||fe?' Die Unterlagen haben wir dir per Mail geschickt.':'';
    return `<h2 class="g">${sp?'Spende zugesagt':fe?'Schon Partner':'Deine Unterschrift ist bei uns'}</h2>
      <p class="lead">${satz}${weiter}</p>
      ${offen.length&&a.bank?`<div class="schon-zahl">${zahlBlock(offen.map(rg=>({titel:rg.art==='spende'?'Spende':'Rechnung',rg})),a.bank)}</div>`:''}
      <p class="lead" style="font-size:16px;margin-top:22px">${sp?'Partner werden geht zusätzlich. Dafür oben das Paket zusammenstellen.':'Wollt ihr noch etwas ergänzen? Stell es oben zusammen oder schreib uns kurz.'}</p>
      ${a.art!=='spende'&&Array.isArray(a.klauseln)&&a.klauseln.length?bedingungenHtml(a.klauseln):''}
      ${sprechenHtml()}<button type="button" class="textknopf" id="trotz">Noch etwas dazunehmen</button>`; }
  function abschluss(){
    const A=$('#abIn'); if(!A)return; seite();
    if(S.ergebnis)return danke();
    if(D.abschluss&&!T&&!S.trotz){ A.dataset.weg=''; A.innerHTML=schonPartnerHtml(); A.querySelector('#trotz').onclick=()=>{ S.trotz=true; S.idem=null; S.idemOffen=null; abschluss(); }; kopierBinden(A); return; }
    if(!S.korb.length&&S.wl.length)return vormerkenForm();
    if(!S.korb.length){ A.dataset.weg=''; A.innerHTML=`<h2 class="g">Abschluss</h2><p class="lead">Sobald eure Auswahl steht, kannst du sie dir hier als Angebot per Mail schicken lassen oder gleich unterschreiben.</p>
      <button type="button" class="knopf-w" style="margin-top:22px" data-zu="pakete">Zu den Paketen</button>${sprechenHtml()}`; return; }
    const sp=nurSpende(), mitAdresse=sp||S.weg==='vertrag';
    if(A.querySelector('#abForm')&&A.dataset.weg===String(S.weg)&&A.dataset.sp===String(sp)){ vertragNeu(); const sp0=A.querySelector('.sprechen'); if(sp0)sp0.outerHTML=sprechenHtml(); return; }
    A.dataset.weg=String(S.weg); A.dataset.sp=String(sp);
    const wahl=sp?'':`<div class="wahl2" role="group" aria-label="Wie möchtest du weitermachen?"><button type="button" data-weg="angebot" class="${S.weg==='angebot'?'on':''}" aria-pressed="${S.weg==='angebot'}"><b>Angebot per Mail</b><span>Ein unverbindliches Angebot als PDF. Die Preise halten wir 14 Tage für euch fest. Freie Plätze gehen nach der Reihenfolge der Unterschriften.</span></button>
        <button type="button" data-weg="vertrag" class="haupt${S.weg==='vertrag'?' on':''}" aria-pressed="${S.weg==='vertrag'}"><b>Gleich unterschreiben</b><span>Du unterschreibst direkt hier. ${VS()?'Wir unterschreiben gleich mit, die Rechnung kommt per Mail.':'Nach unserer Unterschrift kommen Vertrag und Rechnung per Mail.'}</span></button></div>`;
    const form=(sp||S.weg)?`<form id="abForm" autocomplete="on" onsubmit="return false"><div class="felder">
        ${feldHtml('firma',sp?'Firma oder Name':'Unternehmen','text','organization',{cap:'words'})}${sp?'':'<p class="feld-tipp">Online unterschreiben ist für Unternehmen gedacht. Willst du als Privatperson Partner werden, sprich uns direkt an.</p>'}
        <div class="feld-name"><label for="fAnsprech">Dein Name</label><span style="display:flex;gap:6px"><select name="anrede" style="width:100px;flex:none" aria-label="Anrede"><option value="">Anrede</option>${['Frau','Herr'].map(a=>`<option${S.F.anrede===a?' selected':''}>${a}</option>`).join('')}</select><input name="ansprech" autocomplete="name" autocapitalize="words" autocorrect="off" spellcheck="false" enterkeyhint="next" maxlength="80" value="${esc(S.F.ansprech||'')}" placeholder="Vor- und Nachname" id="fAnsprech"></span></div>
        ${feldHtml('email','E-Mail','email','email',{ph:'name@firma.de',im:'email',cap:'off',aus:1,ek:mitAdresse?'next':'done'})}
        ${mitAdresse?`${feldHtml('telefon','Telefon (freiwillig)','tel','tel',{im:'tel'})}
        ${feldHtml('strasse','Straße und Hausnummer','text','address-line1',{cap:'words'})}
        <div class="plz-ort">${feldHtml('plz','PLZ','text','postal-code',{im:'numeric',max:5})}${feldHtml('ort','Ort','text','address-level2',{cap:'words',ek:sp?'done':'next'})}</div>
        ${sp?'':feldHtml('ustid','USt-IdNr. (freiwillig)','text','off',{cap:'characters',ek:'done',aus:1})}`:''}</div>
        <p class="ds">Deine Angaben nutzen wir für Angebot, Vertrag, Rechnung und die Betreuung der Partnerschaft. Mehr dazu unter „Impressum und Datenschutz“ ganz unten.</p></form>`:'';
    A.innerHTML=`<h2 class="g">${sp?'Spende zusagen':'Abschluss'}</h2>
      <p class="lead">${sp?'Trag kurz deine Daten ein. Danach bekommst du sofort die Zusage mit den Bankdaten zum Überweisen.':(S.F.email&&S.F.ansprech?(S.weg?'Deine Angaben haben wir schon eingetragen, bitte prüf sie kurz.':'Wie möchtest du weitermachen? Deine Angaben haben wir schon eingetragen, du siehst sie nach deiner Wahl.'):'Wie möchtest du weitermachen? Für ein Angebot brauchen wir nur deinen Namen und deine Mail. Zum Unterschreiben kommt die Anschrift dazu.')}</p>
      ${wahl}${form}<div id="abWeiter"></div><div class="msg" id="abMsg" role="alert"></div>${sprechenHtml()}`;
    const fm=A.querySelector('#abForm');
    if(fm){ const upd=e=>{ if(e.target.name){ S.F[e.target.name]=e.target.value; if(e.target.name==='ort'&&e.type==='change'&&/^\d{5}\s/.test(S.F.ort||'')){ plzTrennen(); if(fm.elements.plz){ fm.elements.plz.value=S.F.plz; fm.elements.ort.value=S.F.ort; } } if(S.weg==='vertrag'||sp)vertragKopf();
        if(e.type==='input'&&S.zust&&['firma','strasse','plz','ort'].includes(e.target.name)){ S.zust=false; const z=$('#zust'); if(z){ const h=z.querySelector('.hak'); h.classList.remove('on'); h.textContent=''; z.setAttribute('aria-checked','false'); }
          const m=$('#abMsg2'); if(m){ m.classList.remove('err'); m.textContent='Du hast die Angaben zum Unternehmen geändert. Bitte bestätige den Haken noch einmal.'; } }
        merkenSpaeter(); } };
      fm.addEventListener('input',upd); fm.addEventListener('change',upd); formTasten(fm); }
    A.querySelectorAll('[data-weg]').forEach(b=>b.onclick=()=>{ const war=S.weg; S.weg=b.dataset.weg; abschluss(); tipp(); if(!war){ const fm0=$('#abForm'), f=fm0&&([...fm0.querySelectorAll('input[name=firma],input[name=ansprech],input[name=email],input[name=strasse],input[name=plz],input[name=ort]')].find(i=>!i.value.trim())||$('#vertrag')||fm0.querySelector('input')); if(f)setTimeout(()=>{ if(f.id==='vertrag'){ const k=$('.top'); let y=0, el=f; while(el){ y+=el.offsetTop; el=el.offsetParent; }   // ohne die Einblend-Bewegung des Blatts
          window.scrollTo({top:y-((k&&k.offsetHeight)||60)-12,behavior:sanft()}); } else (f.closest('label')||f).scrollIntoView({block:'center',behavior:sanft()}); },60); } });
    S.vmodus=null; vertragNeu();
  }
  let mT=0; const merkenSpaeter=()=>{ clearTimeout(mT); mT=setTimeout(merken,500); };
  function vormerkenForm(){ const A=$('#abIn'), mn=id=>(M.find(m=>m.id===id)||{}).name||id;
    A.dataset.weg='wl'; A.innerHTML=`<h2 class="g">Vormerken</h2>
      <p class="lead">Wir melden uns, wenn es frei wird. Vorgemerkt hast du: ${esc(S.wl.map(w=>(lk(w.key)||{}).titel+(w.mannschaft?' ('+mn(w.mannschaft)+')':'')).join(', '))}. Damit wir dich erreichen, brauchen wir nur deinen Namen und deine Mail.</p>
      <form id="abForm" autocomplete="on" onsubmit="return false"><div class="felder">${feldHtml('firma','Firma oder Name','text','organization',{cap:'words'})}${feldHtml('ansprech','Dein Name','text','name',{cap:'words'})}${feldHtml('email','E-Mail','email','email',{ph:'name@firma.de',im:'email',cap:'off',ek:'done',aus:1})}</div>
      <p class="ds">Deine Angaben nutzen wir nur, um dich zu benachrichtigen. Mehr dazu unter „Impressum und Datenschutz“ ganz unten.</p></form>
      <button type="button" class="knopf-o" id="abGo" style="margin-top:22px">Vormerken lassen</button><div class="msg" id="abMsg" role="alert"></div>${sprechenHtml()}`;
    const fm=A.querySelector('#abForm'), upd=e=>{ if(e.target.name){ S.F[e.target.name]=e.target.value; merkenSpaeter(); } }; fm.addEventListener('input',upd); fm.addEventListener('change',upd); formTasten(fm);
    A.querySelector('#abGo').onclick=()=>senden('warteliste'); }
  // Einstieg mitten in der Saison: was berechnet wird und ab wann man etwas sieht (Bande und Logo erst nach Freigabe und Druck)
  function mittenSatz(c){ if(!(c.netto_jahr>0)||S.start==='naechste'||!(iso(new Date())>String(D.saison).slice(0,10)))return '';
    if(spaeterBeginn())return `Der Vertrag beginnt am ${datum(beginn())}. Berechnet wird die ganze Saison ${saisonTxt(D.saison)}.`;
    const bande=c.positionen.some(p=>/^(club|premium|p1896|bande_)/.test(p.key)), logo=c.positionen.some(p=>/^(supporter|brust_|aermel_|trikot_|aufwaerm_)/.test(p.key));
    const sicht=bande?' Die Bande hängt nach eurer Freigabe und dem Druck.':logo?' Das Logo erscheint nach eurer Freigabe.':'';
    return S.saisons>1?`Die erste Saison wird ganz berechnet. Euer Platz ist ab deiner Unterschrift reserviert.${sicht}`
      :`Berechnet wird die ganze Saison ${saisonTxt(D.saison)}. Euer Platz ist ab deiner Unterschrift reserviert.${sicht}${S.angebot?'':' Lieber zur neuen Saison starten? Im Paket unter Laufzeit.'}`; }
  function vertragNeu(){
    const W=$('#abWeiter'); if(!W)return; const sp=nurSpende(), V=D.verein||{}, cAlle=rechnung(), c=sp?cAlle:rechnungVertrag();
    if(!sp&&S.weg==='angebot'){ if(S.vmodus!=='angebot'){ S.vmodus='angebot'; W.innerHTML=`<button type="button" class="knopf-o" id="abGo" style="margin-top:22px">Angebot an mich senden</button><p class="hinweis">Das unverbindliche Angebot kommt als PDF. Mit dem Link in der Mail kommst du hierher zurück und kannst unterschreiben, solange die Preise gelten.</p>`; W.querySelector('#abGo').onclick=()=>senden('angebot'); } return; }
    if(!sp&&S.weg!=='vertrag'){ S.vmodus=null; W.innerHTML=''; return; }
    const kl=sp?[]:klauseln(c), e=ende(c), vsig=JSON.stringify([sp,kl.map(k=>k.text),sp?posFuerServer():posOhneSpende(),S.saisons,S.start,S.auto]);
    // Nichts geändert: Unterschrift und Häkchen bleiben, wie sie sind
    if(S.vmodus==='vertrag'&&S.vsig===vsig&&W.querySelector('#vertrag')){ if(!sp)spendeHakenNeu(W); return; }
    const warSchon=S.vmodus==='vertrag'&&S.vsig&&S.vsig!==vsig&&(S.zust||S.befugt||S.sig.p);
    if(S.vsig!==vsig){ S.zust=false; S.befugt=false; S.spZust=false; } S.vsig=vsig; S.vmodus='vertrag'; S.neuHinweis=warSchon;
    const R=ersteRechnung(c), firma=S.F.firma||'mein Unternehmen', spBetrag=cAlle.spende;
    const mname=id=>nbsp((M.find(m=>m.id===id)||{}).name||id), fd=fristDatum(c);
    // Grundpreis ohne Laufzeitvorteil: gilt für jede Verlängerung (§ Laufzeit und Verlängerung)
    const b1=PLIB.rechnen(posOhneSpende(),L,1).netto_jahr, mailG=V.email?'eine Mail an '+V.email+' genügt':'eine Mail genügt', sj=saisonJahr();
    const folge=['','','Für die zweite Saison kommt Anfang Juli '+(sj+1)+' eine Rechnung','Für die zweite und dritte Saison kommt jeweils Anfang Juli eine Rechnung','Für die zweite bis vierte Saison kommt jeweils Anfang Juli eine Rechnung','Für die zweite bis fünfte Saison kommt jeweils Anfang Juli eine Rechnung'][Math.min(5,S.saisons)]||'';
    const kurzP=sp?[]:[VS()?'':'Mit deiner Unterschrift macht ihr uns ein verbindliches Angebot. Daran seid ihr vier Wochen gebunden. Meist unterschreiben wir in wenigen Tagen, dann gilt der Vertrag.',c.netto_jahr>0?(S.auto?`Der Vertrag läuft vom ${datum(beginn())} bis zum ${datum(e)}. Danach verlängert er sich um je eine Saison zu ${eur(b1,true)} netto. Kündigen geht bis zum ${fd?datum(fd):'31.03.'}, ${mailG}.`:`Der Vertrag läuft vom ${datum(beginn())} bis zum ${datum(e)} und endet dann von selbst.`):'Einmalige Leistung. Es gibt keine Laufzeit und nichts zu kündigen.',
      mittenSatz(c),
      R.netto>0?(eineRg(c)?'Die Rechnung':'Die erste Rechnung')+(VS()&&rgSofort()?` über ${eur(R.brutto,true)} kommt gleich per Mail und ist zahlbar bis zum ${datum(faelligAm())}.`:VS()?` über ${eur(R.brutto,true)} schicken wir in den nächsten Tagen per Mail. Zahlbar ist sie 14 Tage nach Rechnungsdatum.`:` über ${eur(R.brutto,true)} kommt mit dem gegengezeichneten Vertrag per Mail und ist 14 Tage nach Rechnungsdatum zahlbar${spaeterBeginn()?', frühestens zum Beginn':''}.`)+(eineRg(c)?' Weitere Rechnungen gibt es nicht.':''):'',
      'Bevor etwas mit eurem Logo gedruckt wird, zeigen wir es euch.'].filter(Boolean);
    const kurzHtml=kurzP.length?`<div class="vt-kurz"><b>Das Wichtigste in Kürze</b><ul>${kurzP.map(t=>`<li>${esc(t)}</li>`).join('')}</ul></div>`:'';
    const tab=c.positionen.map(p=>{ const l=lk(p.key)||{}; return `<div><span>${esc(p.titel)}${p.mannschaft?', '+esc(mname(p.mannschaft)):''}${p.menge>1?', Menge '+p.menge:''}${p.rabatt?', '+Math.round(p.rabatt*100)+' % Vorteil':''}${l.text&&!sp?`<small>${esc(l.text)}</small>`:''}</span><span>${eur(p.summe,true)}${p.einheit==='saison'?' / Saison':p.einheit==='einmalig'?' einmalig':''}</span></div>`; }).join('');
    W.innerHTML=`<div class="vertrag" id="vertrag"><div class="vt-k"><div><b>${sp?'Spendenzusage':'Partnervertrag'}</b><small>${sp?'':(e?`Laufzeit ${datum(beginn())} bis ${datum(e)}${S.auto?', verlängert sich automatisch':''}`:'Einmalige Leistungen')}</small></div><img src="${WAPPEN}" width="320" height="182" alt=""></div>
      ${warSchon?'<div class="vt-neu" role="status">Du hast das Paket geändert. Bitte sieh dir den Vertrag noch einmal an und unterschreib neu.</div>':''}
      <div class="vt-p" id="vtKopf"></div>
      <div class="vt-tab">${tab}${c.netto_jahr>0&&!eineRg(c)?`<div class="s"><span>Je Saison netto</span><span>${eur(c.netto_jahr,true)}</span></div>`:''}<div class="s"><span>${sp?'Gesamt':c.netto_jahr>0?'Gesamt über die Laufzeit':'Gesamt'}</span><span>${eur(c.netto_gesamt+(sp?c.spende:0),true)}${!sp&&c.netto_gesamt&&ust()>0?' zuzüglich Umsatzsteuer':''}</span></div>
        ${!sp&&spBetrag?`<div class="sp-x"><span>${spXText(spBetrag)}</span></div>`:''}</div>
      ${kurzHtml}${kl.length?`<div class="vt-kl" aria-label="Vertragsbedingungen"><div class="vt-kl-k"><span>Bedingungen im Klartext</span><button type="button" id="klAlle">Alle aufklappen</button></div>${kl.map((k,i)=>`<details><summary><span class="h4">§ ${i+1} ${esc(k.titel)}</span></summary><p>${esc(k.text)}</p></details>`).join('')}</div>`:''}
      <div class="vt-u">
        ${sp?'':`${R.netto>0?`<p class="vt-brutto">${VS()?(eineRg(c)?'Die Rechnung':'Die erste Rechnung')+':':(eineRg(c)?'Nach unserer Unterschrift stellen wir euch in Rechnung:':'Die erste Rechnung nach unserer Unterschrift:')} ${ust()>0?`${eur(R.netto,true)} netto und ${eur(R.ust,true)} Umsatzsteuer, zusammen <b>${eur(R.brutto,true)}</b>`:`<b>${eur(R.brutto,true)}</b>`}.${c.netto_jahr>0&&S.saisons>1?` ${folge} über ${eur(c.netto_jahr,true)} netto.`:''}${c.netto_jahr>0&&S.auto?(S.saisons>1?` Verlängert sich der Vertrag danach, gilt der Preis ohne Laufzeitvorteil, derzeit ${eur(b1,true)} netto je Saison.`:` Verlängert sich der Vertrag, kommt jeweils Anfang Juli eine Rechnung über ${eur(b1,true)} netto.`):''}</p>`:''}`}
        <button type="button" class="zust" id="zust" role="checkbox" aria-checked="${S.zust}"><span class="hak${S.zust?' on':''}" aria-hidden="true">${S.zust?'✓':''}</span><span id="zustT">${sp?'Ich sage diese Spende zu. Die Zusage ist freiwillig und unverbindlich.':`Ich schließe für ${esc(firma)} ab, darf dafür unterschreiben, habe den Vertrag gelesen und gebe dieses Angebot verbindlich ab.`}</span></button>
        ${!sp&&spBetrag?`<button type="button" class="zust" id="spZust" role="checkbox" aria-checked="${!!S.spZust}"><span class="hak${S.spZust?' on':''}" aria-hidden="true">${S.spZust?'✓':''}</span><span>Zusätzlich sage ich eine Spende über ${eur(spBetrag,true)} für ${esc(ZWECK_PARTNER[(S.korb.find(e=>e.key==='spende')||{}).zweck]||'den Verein')} zu, freiwillig und unverbindlich.</span></button><p class="sp-ohne"${S.spZust?' hidden':''}>Ohne diesen Haken unterschreibst du nur den Vertrag, die Spende lassen wir weg.</p>`:''}
        ${sp?'':`<button type="button" class="zust nenn" id="nennZ" role="checkbox" aria-checked="${S.nenn}"><span class="hak${S.nenn?' on':''}" aria-hidden="true">${S.nenn?'✓':''}</span><span>Ihr dürft öffentlich sagen, dass ${esc(firma)} Partner des SV/BSC Mörlenbach ist, zum Beispiel auf eurer Seite, im Stadionheft und am Platz. Wie wir selbst werben, bleibt unsere Sache.</span></button><p class="sp-ohne nenn-ohne"${S.nenn?' hidden':''}>Ohne diesen Haken nennen wir euch nirgends öffentlich. Am Vertrag ändert das nichts.</p>`}
        ${sp?'':`<div class="sigs"><div><div class="sig-l" id="sigLP"></div><div class="sig-w"><canvas class="sig" id="sigP" role="img" tabindex="-1" aria-label="Feld für deine Unterschrift. Ohne Finger oder Maus: Lieber den Namen tippen."></canvas></div>
            <div class="sig-f"><span id="sigHP">${fein()?'Mit dem Finger auf der Linie unterschreiben.':'Mit der Maus auf der Linie unterschreiben.'}</span><button type="button" data-sx="P">Löschen</button></div>
            <button type="button" class="textknopf klein" id="tippP">Lieber den Namen tippen</button><input class="sig-n" id="tippN" hidden maxlength="60" placeholder="Vor- und Nachname" aria-label="Name statt Unterschrift" autocapitalize="words" autocomplete="name" autocorrect="off" spellcheck="false" enterkeyhint="done"></div>
          ${VS()?`<div><div class="sig-l">Für den Verein, vertretungsberechtigt</div><div class="sig-w"><canvas class="sig" id="sigV" role="img" aria-label="Feld für die Unterschrift des Vereins"></canvas></div>
            <div class="sig-f"><span>${esc(V.name||'SV/BSC Mörlenbach')}</span><button type="button" data-sx="V">Löschen</button></div>
            <div class="sig-nf"><input class="sig-n" id="unterz" maxlength="120" value="${esc(S.unterzeichner)}" placeholder="Vor- und Nachname" aria-label="Name der Person, die für den Verein unterschreibt" autocapitalize="words" autocomplete="off" autocorrect="off" spellcheck="false" enterkeyhint="next">
            <input class="sig-n" id="unterzF" maxlength="120" value="${esc(S.funktionV)}" placeholder="Funktion, z. B. Vorsitzender" aria-label="Funktion der Person, die für den Verein unterschreibt" autocapitalize="sentences" autocomplete="off" autocorrect="off" spellcheck="false" enterkeyhint="done"></div></div>`:''}</div>`}
        ${sp||VS()?'':`<p class="vt-weiter">So geht es weiter: Wir unterschreiben in den nächsten Tagen für den Verein, dann ist der Vertrag geschlossen${c.positionen.some(p=>p.mannschaft)?', und die Mannschaft erfährt es beim nächsten Training':''}.</p>`}
        <button type="button" class="knopf-o" id="abGo" style="margin-top:16px">${sp?'Spende zusagen':VS()?'Vertrag schließen':'Verbindlich unterschreiben'}</button><div class="msg" id="abMsg2" role="alert"></div></div></div>
      ${sp||!VS()?'':'<p class="hinweis">Den Vertrag mit beiden Unterschriften bekommst du per Mail.</p>'}`;
    vertragKopf(); S.sig={p:false,v:false};
    const hak=(id,key)=>{ const b=W.querySelector(id); if(!b)return; b.onclick=()=>{ S[key]=!S[key]; const h=b.querySelector('.hak'); h.classList.toggle('on',S[key]); h.textContent=S[key]?'✓':''; b.setAttribute('aria-checked',String(S[key])); b.removeAttribute('aria-invalid'); if(key==='spZust'){ const o=W.querySelector('.sp-ohne:not(.nenn-ohne)'); if(o)o.hidden=!!S.spZust; } if(key==='nenn'){ const o=W.querySelector('.nenn-ohne'); if(o)o.hidden=!!S.nenn; } tipp(); }; };
    hak('#zust','zust'); hak('#spZust','spZust'); hak('#nennZ','nenn');
    const ka=W.querySelector('#klAlle'); if(ka)ka.onclick=()=>{ const ds=[...W.querySelectorAll('.vt-kl details')], auf=!ds.every(d=>d.open); ds.forEach(d=>d.open=auf); ka.textContent=auf?'Alle zuklappen':'Alle aufklappen'; };
    if(!sp){ pad(W.querySelector('#sigP'),'p'); if(VS()){ pad(W.querySelector('#sigV'),'v'); const u1=W.querySelector('#unterz'), u2=W.querySelector('#unterzF'); u1.oninput=e=>{ S.unterzeichner=e.target.value; }; u2.oninput=e=>{ S.funktionV=e.target.value; };
      u1.onkeydown=e=>{ if(e.key==='Enter'){ e.preventDefault(); u2.focus(); } }; u2.onkeydown=e=>{ if(e.key==='Enter'){ e.preventDefault(); u2.blur(); } }; }
      W.querySelectorAll('[data-sx]').forEach(b=>b.onclick=()=>{ const k=b.dataset.sx.toLowerCase(), P=pads[k]; if(!P)return; const alt={striche:P.striche.slice(),name:P.name}; if(!alt.striche.length&&!alt.name)return padLeeren(b.dataset.sx);
        const v0=S.vsig; padLeeren(b.dataset.sx); toastZurueck('Unterschrift gelöscht.',()=>{ const Q=pads[k]; if(!Q||Q!==P||!Q.cv.isConnected||S.vsig!==v0||Q.striche.length||Q.name)return; Q.striche=alt.striche; Q.name=alt.name; neuMalen(Q); sigPruefen(k); }); });
      const tp=W.querySelector('#tippP'), tn=W.querySelector('#tippN'); tp.onclick=()=>{ tn.hidden=false; tp.hidden=true; tn.value=S.F.ansprech||''; tn.focus(); namensZug('p',tn.value); };
      tn.oninput=()=>namensZug('p',tn.value); tn.onkeydown=e=>{ if(e.key==='Enter'){ e.preventDefault(); tn.blur(); } }; }
    W.querySelector('#abGo').onclick=()=>senden(sp?'spende':'vertrag');
    if(!warSchon&&!matchMedia('(prefers-reduced-motion: reduce)').matches){ const v=W.querySelector('#vertrag'); v.classList.add('rein'); }
  }
  // Nur die Spende hat sich geändert: Häkchen und Satz zur Spende neu, Unterschrift bleibt
  function spendeHakenNeu(W){ const b=cAlleSpende(), alt=W.querySelector('#spZust'), sig=String(b)+':'+((S.korb.find(e=>e.key==='spende')||{}).zweck||'');
    if(S.spSig===sig&&(!!alt===!!b))return; S.spSig=sig; S.spZust=false;
    const html=b?`<button type="button" class="zust" id="spZust" role="checkbox" aria-checked="false"><span class="hak" aria-hidden="true"></span><span>Zusätzlich sage ich eine Spende über ${eur(b,true)} für ${esc(ZWECK_PARTNER[(S.korb.find(e=>e.key==='spende')||{}).zweck]||'den Verein')} zu, freiwillig und unverbindlich.</span></button>`:'';
    if(alt)alt.outerHTML=html; else if(html){ const z=W.querySelector('#zust'); if(z)z.insertAdjacentHTML('afterend',html); }
    const n=W.querySelector('#spZust'); if(n)n.onclick=()=>{ S.spZust=!S.spZust; const h=n.querySelector('.hak'); h.classList.toggle('on',S.spZust); h.textContent=S.spZust?'✓':''; n.setAttribute('aria-checked',String(S.spZust)); const o=W.querySelector('.sp-ohne:not(.nenn-ohne)'); if(o)o.hidden=!!S.spZust; tipp(); };
    const x=W.querySelector('.sp-x'); if(x){ x.hidden=!b; if(b)x.querySelector('span').textContent=spXText(b); } }
  const cAlleSpende=()=>rechnung().spende;
  // Desktop: das Paket läuft neben dem Vertrag mit
  function seite(){ const X=$('#abSeite'); if(!X)return; if(S.ergebnis||!S.korb.length){ X.innerHTML=''; X.hidden=true; return; } X.hidden=false;
    const c=rechnungVertrag(), R=ersteRechnung(c), sp=rechnung().spende, mn=id=>(M.find(m=>m.id===id)||{}).name||id, e=ende(c);
    X.innerHTML=`<h3>Eure Auswahl</h3><ul>${c.positionen.map(p=>`<li><span>${esc(p.titel)}${p.mannschaft?`<small>${esc(mn(p.mannschaft))}</small>`:''}</span><b>${eur(p.summe,true)}</b></li>`).join('')}${sp?`<li><span>Spende<small>getrennt vom Vertrag</small></span><b>${eur(sp,true)}</b></li>`:''}</ul>
      ${c.netto_jahr>0?`<p>Laufzeit ${datum(beginn())} bis ${datum(e)}${S.auto?', verlängert sich':''}</p>`:''}${R.netto>0?`<p class="s"><span>${eineRg(c)?'Rechnungsbetrag':'Erste Rechnung'}, netto</span><b>${eur(R.netto,true)}</b>${ust()>0?`<small>Mit Umsatzsteuer ${eur(R.brutto,true)}. Die ${eur(R.ust,true)} Umsatzsteuer könnt ihr in der Regel als Vorsteuer abziehen.</small>`:''}</p>`:''}
      <button type="button" class="textknopf" data-zu="baukasten">Auswahl ändern</button>`; }
  function spXText(b){ const g=(D.verein||{}).gemeinnuetzig; return `Dazu sagst du uns eine Spende über ${eur(b,true)} zu. Die Spende gehört nicht zu diesem Vertrag, ist freiwillig und unverbindlich und bekommt eine eigene Bestätigung.${g===true?' Die Zuwendungsbestätigung schicken wir, sobald der Betrag da ist.':g===false?' Eine Zuwendungsbestätigung können wir dafür nicht ausstellen.':''}`; }
  function vertragKopf(){ const el=$('#vtKopf'); if(!el)return; const V=D.verein||{}, F=S.F;
    el.innerHTML=`<div><span>Verein</span>${esc(V.name||'SV/BSC Mörlenbach')}<br>${esc([V.strasse,V.ort].filter(Boolean).join(', '))}<br>vertreten durch den Vorstand${V.vorstand?' ('+esc(V.vorstand)+')':''}${V.vertreter?`<br>Ansprechpartner: ${esc(V.vertreter)}${V.vertreter_funktion?', '+esc(V.vertreter_funktion):''}`:''}</div>
      <div><span>${nurSpende()?'Spender':'Partner'}</span>${esc(F.firma||'…')}<br>${esc([nurSpende()?[F.anrede,F.ansprech].filter(Boolean).join(' '):'',F.strasse,/^\d{5}\s/.test(String(F.ort||'').trim())?String(F.ort).trim():[F.plz,F.ort].filter(Boolean).join(' ')].filter(Boolean).join(', '))}${(F.ansprech||'').trim()&&!nurSpende()?'<br>vertreten durch '+esc([F.anrede,F.ansprech.trim()].filter(Boolean).join(' ')):''}</div>`;
    const zt=$('#zustT'); if(zt&&!nurSpende())zt.textContent=`Ich schließe für ${F.firma||'mein Unternehmen'} ab, darf dafür unterschreiben, habe den Vertrag gelesen und gebe dieses Angebot verbindlich ab.`;
    const sl=$('#sigLP'); if(sl)sl.textContent=[(F.ansprech||'').trim()?(F.ansprech||'').trim()+' für '+(F.firma||'das Unternehmen'):'Unterschrift für '+(F.firma||'das Unternehmen'),datum(iso(new Date()))].join(', '); }

  // ---------- Unterschrift: glatte Linie, Strichstärke nach Tempo oder Stiftdruck, bleibt beim Drehen erhalten ----------
  // Punkte in CSS-Pixeln der ersten Breite (w0); beim Drehen gleichmäßig skaliert, nie verzerrt. Nur ein Finger zählt.
  const pads={};
  function pad(cv,k){ if(!cv)return; const alt=pads[k]; if(alt&&alt.ro){ try{ alt.ro.disconnect(); }catch(e){} if(alt.cv!==cv)alt.cv.width=0; }   // alten Beobachter lösen, Bitmap freigeben
    const P={cv,x:cv.getContext('2d'),striche:[],w:0,h:0,w0:0,name:''}; pads[k]=P; let akt=null, letzt=null, bb=2.6, id=null;
    const groesse=()=>{ const r=cv.getBoundingClientRect(), d=window.devicePixelRatio||1; if(!r.width||(Math.abs(r.width-P.w)<1&&Math.abs(r.height-P.h)<1))return;
      P.w=r.width; P.h=r.height; if(!P.w0)P.w0=r.width; cv.width=Math.round(r.width*d); cv.height=Math.round(r.height*d); P.x.setTransform(d,0,0,d,0,0); neuMalen(P); };
    groesse(); if('ResizeObserver' in window){ P.ro=new ResizeObserver(groesse); P.ro.observe(cv); } else addEventListener('resize',groesse);
    const punkt=(e)=>{ const b=cv.getBoundingClientRect(), s=massstab(P); return {x:(e.clientX-b.left)/s,y:(e.clientY-b.top)/s,t:e.timeStamp||performance.now(),dr:e.pointerType==='pen'&&e.pressure>0?e.pressure:0}; };
    const breite=(p)=>{ if(p.dr)return 1+p.dr*2.8; if(!letzt)return 2.6; const dx=p.x-letzt.x, dy=p.y-letzt.y, dt=Math.max(1,p.t-letzt.t), v=Math.sqrt(dx*dx+dy*dy)/dt;
      bb=bb*.7+Math.max(1.3,Math.min(3.4,3.6-v*1.4))*.3; return bb; };
    cv.onpointerdown=e=>{ if(id!==null&&id!==e.pointerId)return; e.preventDefault(); id=e.pointerId; try{ cv.setPointerCapture(e.pointerId); }catch(_){}
      if(P.name){ P.name=''; P.striche=[]; neuMalen(P); if(k==='p'){ const tn=$('#tippN'), tp=$('#tippP'); if(tn){ tn.value=''; tn.hidden=true; } if(tp)tp.hidden=false; } }
      letzt=null; bb=2.6; const p=punkt(e); p.b=breite(p); akt=[p]; letzt=p; P.striche.push(akt); punktMalen(P,p); };
    cv.onpointermove=e=>{ if(!akt||e.pointerId!==id)return; const evs=(e.getCoalescedEvents&&e.getCoalescedEvents())||[e]; (evs.length?evs:[e]).forEach(ev=>{ const p=punkt(ev); const dx=p.x-letzt.x, dy=p.y-letzt.y; if(dx*dx+dy*dy<1.2)return; p.b=breite(p); akt.push(p); letzt=p; stueckMalen(P,akt,akt.length-1); });
      if(!P.raf)P.raf=requestAnimationFrame(()=>{ P.raf=0; sigPruefen(k); }); };
    cv.onpointerup=cv.onpointercancel=e=>{ if(e.pointerId!==id)return; id=null;
      // Schnell und senkrecht gewischt: das war Scrollen, kein Strich
      if(akt&&akt.length>1){ const xs=akt.map(p=>p.x), ys=akt.map(p=>p.y), bw=Math.max(...xs)-Math.min(...xs), bh=Math.max(...ys)-Math.min(...ys), dt=akt[akt.length-1].t-akt[0].t;
        if(P.striche.length===1&&bw<24&&bh>Math.max(90,P.h*.6)&&dt<250){ P.striche.pop(); neuMalen(P); toast('Zum Scrollen bitte neben dem Feld wischen.'); } else endeMalen(P,akt); }
      akt=null; sigPruefen(k);
      // Der Moment, in dem die Unterschrift zählt: Haptik genau beim Loslassen (eine Geste, die iOS gelten lässt), zusammen mit dem blauen Rahmen
      if(S.sig[k]&&!P.gespuert&&e.type==='pointerup'){ P.gespuert=true; tippStark(); } }; }
  const massstab=P=>P.w0?Math.min(1,P.w/P.w0):1;
  // Als Unterschrift zählt erst ein richtiger Zug (mindestens 120 px Linie, 60 × 20 px groß), kein versehentliches Wischen
  function sigPruefen(k){ const P=pads[k]; if(!P)return; let lang=0, x0=1e9, x1=-1e9, y0=1e9, y1=-1e9;
    P.striche.forEach(s=>s.forEach((p,i)=>{ if(i)lang+=Math.hypot(p.x-s[i-1].x,p.y-s[i-1].y); x0=Math.min(x0,p.x); x1=Math.max(x1,p.x); y0=Math.min(y0,p.y); y1=Math.max(y1,p.y); }));
    const ok=!!P.name||(lang>=120&&x1-x0>=60&&y1-y0>=20); S.sig[k]=ok; if(!ok)P.gespuert=false;
    if(P.ok===ok)return; P.ok=ok;   // DOM nur beim Wechsel anfassen
    const sw=P.cv.parentNode; if(sw&&sw.classList)sw.classList.toggle('ok',ok);
    if(k==='p'){ const h=$('#sigHP'); if(h)h.textContent=ok?(fein()?'✓ Deine Unterschrift ist da. Zum Ändern auf Löschen tippen.':'✓ Deine Unterschrift ist da. Zum Ändern auf Löschen klicken.'):fein()?'Mit dem Finger auf der Linie unterschreiben.':'Mit der Maus auf der Linie unterschreiben.'; const cv=P.cv; if(ok)cv.removeAttribute('aria-invalid'); } }
  const px=(P,p)=>{ const s=massstab(P); return [p.x*s,p.y*s]; };
  function punktMalen(P,p){ const X=P.x, [a,b]=px(P,p); X.fillStyle='#1d2760'; X.beginPath(); X.arc(a,b,p.b/2,0,Math.PI*2); X.fill(); }
  function stueckMalen(P,s,i){ const X=P.x; X.strokeStyle='#1d2760'; X.lineCap='round'; X.lineJoin='round';
    if(i===1){ const [a,b]=px(P,s[0]), [c,d]=px(P,s[1]); X.lineWidth=(s[0].b+s[1].b)/2; X.beginPath(); X.moveTo(a,b); X.lineTo((a+c)/2,(b+d)/2); X.stroke(); return; }
    const [x0,y0]=px(P,s[i-2]), [x1,y1]=px(P,s[i-1]), [x2,y2]=px(P,s[i]); X.lineWidth=s[i-1].b; X.beginPath(); X.moveTo((x0+x1)/2,(y0+y1)/2); X.quadraticCurveTo(x1,y1,(x1+x2)/2,(y1+y2)/2); X.stroke(); }
  function endeMalen(P,s){ const X=P.x, n=s.length, [a,b]=px(P,s[n-2]), [c,d]=px(P,s[n-1]); X.lineWidth=s[n-1].b; X.beginPath(); X.moveTo((a+c)/2,(b+d)/2); X.lineTo(c,d); X.stroke(); }
  function neuMalen(P){ P.x.clearRect(0,0,P.w,P.h);
    if(P.name){ const X=P.x, gr=Math.min(52,Math.max(30,P.w/Math.max(6,P.name.length)*1.5)); X.fillStyle='#1d2760'; X.font=`700 ${gr}px Caveat, cursive`; X.textBaseline='alphabetic'; X.save(); X.translate(22,P.h-46); X.rotate(-.03); X.fillText(P.name,0,0,P.w-44); X.restore(); return; }
    P.striche.forEach(s=>{ punktMalen(P,s[0]); for(let i=1;i<s.length;i++)stueckMalen(P,s,i); if(s.length>1)endeMalen(P,s); }); }
  // Barrierearm: Name tippen statt zeichnen, er erscheint in Handschrift im Feld
  function namensZug(k,t){ const P=pads[k]; if(!P)return; P.striche=[]; P.name=String(t||'').trim().length>=3?String(t).trim().slice(0,60):''; neuMalen(P); sigPruefen(k); }
  function padLeeren(K){ const k=K.toLowerCase(), p=pads[k]; if(!p)return; p.striche=[]; p.name=''; p.x.save(); p.x.setTransform(1,0,0,1,0,0); p.x.clearRect(0,0,p.cv.width,p.cv.height); p.x.restore(); S.sig[k]=false; sigPruefen(k);
    if(k==='p'){ const tn=$('#tippN'), tp=$('#tippP'); if(tn){ tn.value=''; tn.hidden=true; } if(tp)tp.hidden=false; } }
  function padPng(k){ const p=pads[k]; if(!p)return null; const o=document.createElement('canvas'), w=Math.min(900,p.cv.width), h=Math.round(p.cv.height*w/p.cv.width); o.width=w; o.height=h;
    const x=o.getContext('2d'); x.fillStyle='#fff'; x.fillRect(0,0,w,h); x.drawImage(p.cv,0,0,w,h); return o.toDataURL('image/png'); }

  // ---------- Senden ----------
  async function senden(art){
    if(S.busy)return; const msg=$(art==='vertrag'||art==='spende'?'#abMsg2':'#abMsg')||$('#abMsg'); msg.textContent=''; msg.classList.remove('err');
    document.querySelectorAll('.feld-f').forEach(x=>x.remove());
    // Fehler stehen direkt am Feld (dort springt die Seite hin) und zusätzlich unten am Knopf
    const fehl=(t,feld)=>{ msg.textContent=t; msg.classList.add('err'); const el=feld&&document.querySelector(feld);
      if(el){ el.setAttribute('aria-invalid','true'); const p=document.createElement('p'); p.className='feld-f'; p.id='ff-'+Math.random().toString(36).slice(2,8); p.textContent=t;
        const ziel=el.closest('.feld-name')||el.closest('label')||el.closest('.sig-w')||el; ziel.insertAdjacentElement('afterend',p); el.setAttribute('aria-describedby',p.id);
        if(/^(INPUT|SELECT)$/.test(el.tagName)){ try{ el.focus(); el.scrollIntoView({block:'center',behavior:'instant'}); }catch(e){} } else { el.scrollIntoView({block:'center',behavior:sanft()}); setTimeout(()=>{ const z=el.tagName==='CANVAS'?($('#tippP')||el):el; try{ z.focus({preventScroll:true}); }catch(e){} },350); }
        const weg=()=>{ el.removeAttribute('aria-invalid'); p.remove(); }; el.addEventListener('input',weg,{once:true}); el.addEventListener('click',weg,{once:true}); } };
    plzTrennen(); const F=S.F, fe=n=>`#abForm [name=${n}]`;
    if(T&&!token())return fehl('Deine Anmeldung im Partner-Team ist abgelaufen. Bitte öffne kurz die App und tippe dann hier noch einmal.');
    if(art!=='warteliste'&&!S.korb.length)return fehl('Bitte oben etwas auswählen.');
    if((F.firma||'').trim().length<2)return fehl('Bitte trag noch Firma oder Namen ein.',fe('firma'));
    if((art==='warteliste'||art==='vertrag')&&!(F.ansprech||'').trim())return fehl('Bitte trag noch deinen Namen ein.',fe('ansprech'));
    if(!/^[^@\s]+@[^@\s]+\.[a-z]{2,}$/i.test((F.email||'').trim()))return fehl('Bitte prüf die E-Mail-Adresse.',fe('email'));
    if(art!=='warteliste'&&S.korb.some(e=>{ const l=lk(e.key); return l&&(l.art==='spende'||l.art==='sonstiges'||l.preis==null)&&!(+e.preis>0); }))return fehl('Bitte einen Betrag für die Spende eintragen.','#spBetrag');
    if(art==='vertrag'||art==='spende'){
      if((F.strasse||'').trim().length<3)return fehl('Für Vertrag und Rechnung brauchen wir noch Straße und Hausnummer.',fe('strasse'));
      if(!/^\d{5}$/.test((F.plz||'').trim()))return fehl('Bitte trag die Postleitzahl ein (fünf Ziffern).',fe('plz'));
      if((F.ort||'').trim().length<2)return fehl('Bitte trag noch den Ort ein.',fe('ort'));
      if(!S.zust)return fehl(art==='spende'?'Bitte bestätige noch kurz deine Spende.':'Bitte bestätige noch kurz, dass du unterschreiben darfst und den Vertrag gelesen hast.','#zust'); }
    if(art==='vertrag'){ if(!S.sig.p)return fehl('Es fehlt noch deine Unterschrift im Feld darüber.','#sigP'); if(VS()&&!S.sig.v)return fehl('Bitte auch für den Verein unterschreiben.','#sigV'); if(VS()&&String(S.unterzeichner||'').trim().length<3)return fehl('Bitte den Namen eintragen, wer für den Verein unterschreibt.','#unterz'); if(VS()&&String(S.funktionV||'').trim().length<3)return fehl('Bitte die Funktion eintragen, in der du für den Verein unterschreibst.','#unterzF'); }
    if(art==='vertrag'||art==='spende')tippStark();   // Haptik genau auf dem Tipp, der zählt (nach dem Warten auf den Server gilt die Geste nicht mehr)
    S.busy=true; const btn=$('#abGo'), alt=btn.textContent; btn.classList.add('laeuft'); btn.setAttribute('aria-busy','true'); btn.textContent=art==='angebot'?'Wird verschickt …':art==='warteliste'?'Wird vorgemerkt …':art==='spende'?'Spende wird zugesagt …':'Vertrag wird angelegt …';
    // Ein Schlüssel je Abschluss: bleibt bei Wiederholung nach Netzabbruch gleich, damit nichts doppelt entsteht
    if(!S.idem){ S.idem=neuId(); } merken();
    const ortVoll=[(F.plz||'').trim(),(F.ort||'').trim()].filter(Boolean).join(' ');
    const partner={firma:F.firma.trim(),anrede:F.anrede||'',ansprech:(F.ansprech||'').trim(),email:F.email.trim(),telefon:(F.telefon||'').trim(),strasse:(F.strasse||'').trim(),ort:ortVoll,ustid:(F.ustid||'').trim()};
    const spendeBody=spendeBodyNeu;
    try{
      let r;
      if(art==='warteliste'){ const body={partner,warteliste:S.wl,idem:S.idem+':wl'}; r=demo()?await probe({ok:true,n:S.wl.length}):await rpc('partner_praesi_warteliste',{p_code:code,p:body}); }
      else if(art==='spende'){ const body=spendeBody(), hash=body.idem, offen=S.idemOffen&&S.idemOffen.art==='spende'?S.idemOffen:null;
        // Nach einem unklaren Abbruch denselben Schlüssel nehmen, auch wenn der Betrag inzwischen geändert wurde: sonst entstehen zwei Zusagen
        if(offen)body.idem=offen.idem; S.idemJetzt={art:'spende',idem:body.idem,hash:offen?offen.hash:hash};
        r=demo()?await probeErgebnis('spende',PLIB.rechnen(body.positionen,L,1)):await rpc('partner_praesi_abschluss',{p_code:code,p:body},30000);
        if(r&&r.wiederholt&&offen&&offen.hash!==hash)r.geaendert=true; S.idemOffen=null; }
      else {
        // Im Vertrag steht keine Spende; sie bekommt danach ihre eigene Zusage mit eigenem Beleg, nur wenn eigens zugesagt
        const pos=art==='vertrag'?posOhneSpende():posFuerServer(), c=PLIB.rechnen(pos,L,S.saisons);
        const hash=kurzHash(JSON.stringify([pos,S.saisons,S.start,S.auto])), offen=S.idemOffen&&S.idemOffen.art===art?S.idemOffen:null, idemX=offen?offen.idem:(S.idem+':'+art+':'+hash).slice(0,80);
        S.idemJetzt={art,idem:idemX,hash:offen?offen.hash:hash};
        const body={art,positionen:pos,saisons:S.saisons,beginn:beginn(),auto_verlaengerung:S.auto,idem:idemX,klauseln:art==='vertrag'?klauseln(c):[],angebot_nr:art==='vertrag'&&S.angebot?S.angebot.nr:undefined,
          partner:Object.assign({},partner,art==='vertrag'?{befugt:true,unterschrift_art:pads.p&&pads.p.name?'getippt':'gezeichnet'}:{}),zustimmung:art!=='angebot'&&S.zust,interessen:[...S.herz],ziele:[...S.ziele],fragebogen:{budget:S.budget||null,quelle:'praesentation'},warteliste:S.wl};
        if(art==='vertrag'){ body.unterschrift_partner=padPng('p'); if(VS()){ body.unterschrift_verein=padPng('v'); body.unterzeichner=String(S.unterzeichner).trim(); body.unterzeichner_funktion=String(S.funktionV).trim(); } }
        r=demo()?await probeErgebnis(art,c):await rpc('partner_praesi_abschluss',{p_code:code,p:body},30000);
        if(r&&r.wiederholt&&offen&&offen.hash!==hash)r.geaendert=true; S.idemOffen=null;
        if(art==='vertrag'&&S.korb.some(e=>e.key==='spende')&&S.spZust){
          try{ const sb=spendeBody(); r.spende=demo()?await probeErgebnis('spende',PLIB.rechnen(sb.positionen,L,1)):await rpc('partner_praesi_abschluss',{p_code:code,p:sb},30000); }
          catch(e){ r.spendeFehler=e.message; r.spendeNetz=!!e.netz; } } }
      if(art==='vertrag'||art==='spende'){ btn.classList.remove('laeuft'); btn.classList.add('geschafft'); btn.textContent=art==='spende'?'✓ Zugesagt':'✓ Unterschrieben'; await new Promise(z=>setTimeout(z,matchMedia('(prefers-reduced-motion: reduce)').matches?0:700)); }
      S.ergebnis=Object.assign({art},r,{email:partner.email,tel:!!String(S.F.telefon||'').trim()}); if(art==='vertrag')S.angebot=null; merken();
      if(art==='vertrag')nennungSenden();
      const ruhigM=matchMedia('(prefers-reduced-motion: reduce)').matches, A0=$('#abIn'); if(A0){ A0.classList.add('weg'); await new Promise(z=>setTimeout(z,ruhigM?140:160)); }
      danke(true); kopfZahl(); katalog(); korb(); fragenFertig(); heroNeu(); zuDanke(); setTimeout(()=>{ if(Math.abs(window.scrollY-(S.dankeY||0))<4)zuDanke(); },160); if(A0)requestAnimationFrame(()=>A0.classList.remove('weg'));
      if(!demo())freiHolen().catch(()=>{});
    }catch(e){
      if(e.netz&&S.idemJetzt&&S.idemJetzt.art===art){ S.idemOffen=Object.assign({zeit:Date.now()},S.idemJetzt); merken(); }
      if(e.netz)fehl(e.unklar?(art==='vertrag'?'Wir können gerade nicht erkennen, ob deine Unterschrift angekommen ist. Bitte ändere nichts und drück in einer Minute noch einmal denselben Knopf. Es entsteht dabei kein zweiter Vertrag.':e.message):'Wir haben gerade keine Antwort bekommen. Deine Angaben bleiben stehen. Versuch es gleich noch einmal mit demselben Knopf, dann entsteht nichts doppelt.');
      else if(/vergeben/.test(e.message)){ await freiHolen(); const war=korbPruefen(); S.vmodus=null; abschluss(); const m2=$(art==='vertrag'?'#abMsg2':'#abMsg')||$('#abMsg'); if(m2){ m2.textContent=war?'Eine Leistung aus eurer Auswahl ist inzwischen vergeben. Wir haben sie für dich vorgemerkt. Der Rest steht, du kannst gleich unterschreiben.':e.message; m2.classList.add('err'); } }
      else fehl(e.message); }
    finally{ S.busy=false; if(btn.isConnected){ btn.classList.remove('laeuft','geschafft'); btn.removeAttribute('aria-busy'); btn.textContent=alt; } }
  }

  // Die Antwort auf „Dürfen wir euch nennen?“ geht nach dem Abschluss eigenständig raus. Geht sie nicht durch,
  // bleibt es beim Stand „offen“, und der Verein fragt beim nächsten Gespräch nach. Am Vertrag hängt das nicht.
  function nennungSenden(){ const w=S.nenn?'ja':'nein'; S.nennStand=w; if(demo()){ S.nennOffen=false; return Promise.resolve(); }
    S.nennOffen=true;
    return rpc('partner_praesi_nennung',{p_code:code,p_wert:w},10000).then(()=>{ S.nennOffen=false; merken(); },()=>{ merken(); }); }
  // Direkt auf die Danke-Karte (nicht an den Abschnittsanfang), dann sitzt der Stempel im oberen Drittel
  function zuDanke(){ const d=$('#abIn .danke'), k=$('.top'); if(!d)return zu('abschluss',true); window.scrollTo({top:Math.max(0,d.getBoundingClientRect().top+scrollY-((k&&k.offsetHeight)||60)-12),behavior:'instant'}); S.dankeY=window.scrollY; }
  function spendeBodyNeu(){ const F=S.F, pos=posFuerServer().filter(o=>o.key==='spende'), cs=PLIB.rechnen(pos,L,1); if(!S.idem)S.idem=neuId();
    return {art:'spende',positionen:pos,saisons:1,beginn:iso(new Date()),auto_verlaengerung:false,idem:(S.idem+':spende:'+kurzHash(JSON.stringify(pos))).slice(0,80),klauseln:klauseln(cs).filter(k=>['spende','spende_ohne','datenschutz','schluss'].includes(k.key)),
      partner:{firma:String(F.firma||'').trim(),anrede:F.anrede||'',ansprech:String(F.ansprech||'').trim(),email:String(F.email||'').trim(),telefon:String(F.telefon||'').trim(),strasse:String(F.strasse||'').trim(),ort:[String(F.plz||'').trim(),String(F.ort||'').trim()].filter(Boolean).join(' '),ustid:String(F.ustid||'').trim()},
      zustimmung:true,interessen:[...S.herz],ziele:[...S.ziele],fragebogen:{budget:S.budget||null,quelle:'praesentation'}}; }
  // Probeansicht: so sähe das Ergebnis aus, ohne dass etwas gespeichert oder verschickt wird. Bankdaten als XX, kein scannbarer Code.
  const probe=x=>new Promise(r=>setTimeout(()=>r(x),700));
  const PROBE_BANK={name:'Sportverein Mörlenbach 1896 e.V.',iban:'DE00 XXXX XXXX XXXX XXXX XX',bic:'XXXXXXXX',probe:true};
  async function probeErgebnis(art,c){ const R=ersteRechnung(c);
    const zu=art==='vertrag'&&VS();   // über den Link: erst die Gegenzeichnung schließt den Vertrag, dann kommt die Rechnung
    return probe({nr:(art==='angebot'?'AN':art==='spende'?'SP':'PV')+'-PROBE',positionen:c.positionen,ust_satz:ust(),status:art==='angebot'?'angebot':zu?'aktiv':'unterschrieben',klauseln:art==='vertrag'?klauseln(c):undefined,unterschrieben_am:new Date().toISOString(),gegengezeichnet_am:zu?new Date().toISOString():null,
      rechnung:art==='angebot'||(art==='vertrag'&&!zu)?null:{nr:art==='spende'?'SP-PROBE':'RE-PROBE',art:art==='spende'?'spende':'rechnung',brutto:art==='spende'?c.spende:R.brutto,netto:R.netto,zweck:(art==='spende'?'Spende '+((S.korb.find(e=>e.key==='spende')||{}).zweck||'')+' SP-PROBE ':'RE-PROBE PV-PROBE ')+String(S.F.firma||'').trim(),faellig:S.start==='naechste'&&art!=='spende'?beginn():iso(new Date(Date.now()+14*864e5))},bank:art==='angebot'?null:PROBE_BANK}); }
  // ---------- Danke, Rechnung, Girocode ----------
  function kopierZeile(t,wert,anzeige,probe,cls){ return `<div class="kz${cls?' '+cls:''}"><span>${t}</span><b>${esc(anzeige||wert)}</b><button type="button" ${probe?'data-probe="1"':`data-kopie="${esc(wert)}"`}>Kopieren</button></div>`; }
  // Ein ruhiger Bankblock: Empfänger und IBAN einmal, darunter je Zahlung Betrag, Zweck und Girocode
  function zahlBlock(teile,bank,fuss){ teile=teile.filter(t=>t&&t.rg&&t.rg.status!=='bezahlt'); if(!teile.length)return '';
    if(!bank)return teile.map(t=>`<p class="hinweis" style="font-size:16px">${t.titel} ${esc(t.rg.nr)} über ${eur(t.rg.brutto,true)} kommt mit den Bankdaten per Mail.</p>`).join('');
    const pr=!!bank.probe, handy=fein(), rgs=teile.filter(t=>t.rg.art!=='spende'), frist=rgs.map(t=>String(t.rg.faellig||'').slice(0,10)).filter(Boolean).sort()[0];
    return `<div class="zahlen"><div class="zahl-k"><b>${teile.length>1?'Überweisen':teile[0].rg.art==='spende'?'Spende überweisen':'Rechnung bezahlen'}</b>
        <p>${frist?`Bitte bis zum ${datum(frist)} überweisen.`:'Überweisen kannst du, wann es passt.'} ${handy?'Tipp auf Kopieren und füg die Angaben in der Banking-App ein.':'Scann den Girocode mit der Banking-App, Betrag und Zweck sind schon eingetragen.'}${rgs.length?' Oder gib die Rechnung aus der Mail an eure Buchhaltung weiter.':''}</p>
        <div class="kzs">${kopierZeile('Empfänger',bank.name,'',pr)}${kopierZeile('IBAN',String(bank.iban).replace(/\s/g,''),pr?bank.iban:PLIB.ibanSchoen(bank.iban),pr,'iban')}</div></div>
      ${teile.map(t=>{ const rg=t.rg, sp=rg.art==='spende', gc=pr?null:PLIB.girocode({name:bank.name,iban:bank.iban,bic:bank.bic,betrag:rg.brutto,zweck:rg.zweck});
        return `<div class="zahl-t"><div class="zahl-l"><div class="zahl-tt">${teile.length>1?t.titel:''} <small>${sp?'Spendenzusage '+esc(rg.nr):'Nr. '+esc(rg.nr)} vom ${datum(rg.datum||iso(new Date()))}</small></div>
          <div class="kzs">${kopierZeile('Betrag',(+rg.brutto).toFixed(2).replace('.',','),eur(rg.brutto,true),pr,'betrag')}${kopierZeile('Zweck',rg.zweck,'',pr)}</div>
          <p class="zahl-f">${sp?(teile.length>1?'Am einfachsten gleich nach der Rechnung, als zweite Überweisung.':'Freiwillig und unverbindlich.')+((D.verein||{}).gemeinnuetzig===true?' Die Zuwendungsbestätigung schicken wir, sobald der Betrag da ist.':''):(rg.netto!=null&&+rg.brutto>+rg.netto?`${eur(rg.netto,true)} netto und ${eur(Math.round((rg.brutto-rg.netto)*100)/100,true)} Umsatzsteuer.`:'')+(rgs.length>1?' Zahlbar bis '+datum(rg.faellig)+'.':'')}</p></div>
          ${handy?`<details class="gc-d"><summary>Girocode für ein zweites Gerät zeigen</summary><div class="gc-q">${gc?PLIB.qrSvg(gc,160):'<div class="gc-leer">Girocode<br>(Probe)</div>'}</div></details>`:`<div class="gc-q">${gc?PLIB.qrSvg(gc,160)+'<small>Girocode</small>':'<div class="gc-leer">Girocode<br>(Probe)</div>'}</div>`}</div>`; }).join('')}${fuss?`<div class="zahl-fuss">${fuss}</div>`:''}</div>`; }
  // Was jetzt passiert, in Sätzen statt Produktnamen. Nur, was die Leistung wirklich ist.
  const DANK={trikot_jugend:'die {t} bekommt neue Trikots mit eurem Logo',team_jugend:'die {t} hat euch eine Saison lang als Partner',aufwaerm_jugend:'die {t} wärmt sich in Shirts mit eurem Logo auf',
    baelle_jugend:'{T}trainiert mit Bällen von euch',trainer_jugend:'ein Trainer aus der Jugend macht mit eurer Hilfe seine Lizenz',supporter:'euer Logo kommt an unsere Partnerwand',club:'den Platz für eure Bande suchen wir gemeinsam mit euch aus',
    premium:'eure Bande bekommt einen bevorzugten Platz',p1896:'ihr seid in der höchsten Stufe dabei, als einziger Betrieb eurer Branche',bande_erste:'den Platz für eure Bande suchen wir gemeinsam mit euch aus',brust_erste:'die Erste läuft mit eurem Namen auf der Brust auf',
    brust_zweite:'die Zweite läuft mit eurem Namen auf der Brust auf',aermel_erste:'euer Logo kommt auf den Ärmel der Ersten',aermel_zweite:'euer Logo kommt auf den Ärmel der Zweiten',zeltlager:'beim Zeltlager seid ihr als Partner dabei',
    ferienspiele:'bei den Ferienspielen seid ihr als Partner dabei',turnier:'bei einem unserer Turniere seid ihr Partner',matchball:'ein Heimspiel wird mit eurem Matchball angepfiffen',sotd:'ein Heimspiel gehört euch als Partner des Tages',
    tor_monat:'das Tor des Monats trägt euren Namen',jobpost:'wir veröffentlichen eure Stellenanzeige',business_treff:'ein Partnertreffen findet bei euch statt'};
  const undListe=a=>a.length>1?a.slice(0,-1).join(', ')+' und '+a[a.length-1]:(a[0]||'');
  function dankSaetze(ps){ const mn=id=>nbsp((M.find(m=>m.id===id)||{}).name||id), s=[];
    ps.forEach(p=>{ let t=DANK[p.key]; if(!t){ t='zu eurem Paket gehört '+p.titel; }
      t=t.replace('{t}',p.mannschaft?mn(p.mannschaft):'Mannschaft').replace('{T}',p.mannschaft?'die '+mn(p.mannschaft)+' ':'eine Jugendmannschaft '); if(!s.includes(t))s.push(t); });
    // Komma vor „und“ nur bei genau zwei Hauptsätzen, bei drei Gliedern nicht (kein Serienkomma)
    const t3=s.slice(0,3), x=t3.length>2?t3.slice(0,-1).join(', ')+' und '+t3[t3.length-1]:t3.length===2?t3[0]+', und '+t3[1]:(t3[0]||''); return x?x.charAt(0).toUpperCase()+x.slice(1)+'.':''; }
  function danke(los){
    seite(); const A=$('#abIn'), R=S.ergebnis, F=S.F, V=D.verein||{}; if(!A||!R)return; const mail=esc(R.email||F.email), probeHinweis=demo()?'<p class="probe-n">Probeansicht: Es wurde nichts gespeichert und nichts verschickt.</p>':'';
    const neu=T?`<button type="button" class="knopf-w" id="neuTermin" style="margin-top:12px">Nächster Abschluss im Termin</button>`:'';
    if(R.art==='angebot'||R.art==='warteliste'){
      const wl=R.art==='warteliste';
      A.innerHTML=`<div class="danke${los?' los':''}"><h2 class="danke-h" tabindex="-1">${wl?'Vorgemerkt':'Das Angebot ist unterwegs'}</h2>
      <p>${wl?`Sobald ein Platz frei wird, melden wir uns unter ${mail}. Bis dahin musst du nichts tun.`:`Dein unverbindliches Angebot ${esc(R.nr)} kommt gleich als PDF an ${mail}. Die Preise halten wir bis zum ${datum(iso(new Date(Date.now()+14*864e5)))} für euch fest. Reserviert ist damit noch nichts, freie Plätze vergeben wir nach der Reihenfolge der Unterschriften. Solange die Preise gelten, kannst du mit dem Link aus der Mail auch hier unterschreiben. Der Vertrag kommt zustande, wenn du unterschreibst und wir für den Verein gegenzeichnen. In ein paar Tagen melden wir uns.`}</p>${probeHinweis}
      <button type="button" class="textknopf" id="nochmal">${wl?'Doch lieber ein Paket zusammenstellen':'Paket ändern oder gleich unterschreiben'}</button></div>${neu}`;
      A.querySelector('#nochmal').onclick=async()=>{ S.ergebnis=null; S.idem=null; S.weg=wl?null:'vertrag'; S.vmodus=null; merken(); if(!demo())await freiHolen(); korbPruefen(); abschluss(); kopfZahl(); zu(wl?'pakete':'abschluss',true); };
      nachDanke(A); if(los){ const h=A.querySelector('.danke-h'); if(h)h.focus({preventScroll:true}); } return; }
    const spende=R.art==='spende', rg=R.rechnung, sp2=R.spende||null, mn=id=>nbsp((M.find(m=>m.id===id)||{}).name||id);
    const gekauft=spende?'':dankSaetze(R.positionen||[]), tel=!!(R.tel||String(F.telefon||'').trim()), stufe=(R.positionen||[]).some(p=>['club','premium','p1896'].includes(p.key));
    // Wann unterschrieben wurde (vom Server), ob schon gegengezeichnet: der Text stimmt auch, wenn man die Seite Tage später öffnet
    const tagU=R.unterschrieben_am?iso(new Date(R.unterschrieben_am)):(R.am?iso(new Date(R.am)):iso(new Date())), heuteU=tagU===iso(new Date()), gegen=!!R.gegengezeichnet_am, fe=fest(R);
    const keineRg=!rg&&(R.positionen||[]).some(p=>p.key!=='spende');
    // Eine Saison ohne Verlängerung oder nur Einmaliges: genau eine Rechnung
    const eRg=R.saisons!=null?(!(+R.netto_jahr>0)||(+R.saisons===1&&!R.auto_verlaengerung)):eineRg(rechnungVertrag()), rgW=eRg?'die Rechnung':'die erste Rechnung';
    const wer=String(V.vertreter||'').trim(), teamN=spende?[]:[...new Set((R.positionen||[]).filter(p=>p.mannschaft).map(p=>(M.find(m=>m.id===p.mannschaft)||{}).name||p.mannschaft))];
    const weg=spende?[['Zusage per Mail','Die Spendenzusage kommt gleich per Mail.'+(V.gemeinnuetzig===true?' Die Zuwendungsbestätigung folgt, sobald der Betrag da ist.':'')],['Wir sagen es weiter','Kinder und Trainer erfahren, wer ihnen geholfen hat. Willst du lieber nicht genannt werden, schreib uns kurz.'],['Am Platz','Schau gern bei einem Heimspiel oder samstags bei der Jugend vorbei.']]
      :[[fe?(gegen&&!heuteU?'Der Vertrag ist fest':'Kopie per Mail'):'Gegenzeichnung',(fe?esc(gegen&&!heuteU?'Der Vertrag ist von beiden Seiten unterschrieben. Die Fassung mit beiden Unterschriften haben wir dir per Mail geschickt. ':'Der Vertrag mit beiden Unterschriften'+(rg?' und '+rgW+' kommen':' kommt')+' per Mail.'+(rg?' ':' '+(eRg?'Die Rechnung':'Die erste Rechnung')+' folgt in den nächsten Tagen. ')):esc('Wir unterschreiben für den Verein, meist in wenigen Tagen. Ohne unsere Unterschrift nach vier Wochen seid ihr nicht mehr gebunden.')).trim(),1],
        ...(teamN.length?[['Die Mannschaft erfährt es',`${fe?`Beim nächsten Training sagen wir ${undListe(teamN.map(n=>'der '+n))}, wer jetzt hinter ${teamN.length>1?'ihnen':'ihr'} steht.`:`Sobald der Vertrag gilt, sagen wir es ${undListe(teamN.map(n=>'der '+n))} beim nächsten Training.`} Gern machen wir ein gemeinsames Foto. Online nur mit Einverständnis der Eltern, ab 14 auch der Jugendlichen.`]]:[]),
        ['Logo',`Schickt uns euer Logo${V.email?' an <span class="mail">'+esc(V.email)+'</span>':''}, am besten die Datei eurer Druckerei. Vor dem Druck zeigen wir euch den Entwurf.`,1],
        ['Am Platz',esc((stufe?'Zum nächsten Partnerabend laden wir euch ein. Den Termin schicken wir, sobald er feststeht. ':'')+'Schaut gern bei einem Heimspiel oder samstags bei der Jugend vorbei. ')+(tel?esc('Außerdem rufen wir dich kurz an.'):esc('Lieber vorher sprechen? ')+(V.email?`<a href="${esc('mailto:'+V.email+'?subject='+encodeURIComponent('Rückruf: '+(F.firma||''))+'&body='+encodeURIComponent('Meine Nummer: '))}">Schick uns deine Nummer</a>, dann rufen wir an.`:'Schick uns deine Nummer, dann rufen wir an.')),1]];
    const spZeile=sp2&&!R.spendeFehler?', die Spendenzusage in einer zweiten Mail':'', spOffen=!spende&&!sp2&&!R.spendeFehler&&!R.spendeVerzicht&&S.korb.some(e=>e.key==='spende'), spaet=String(R.beginn||beginn()).slice(0,10)>(tagU||iso(new Date()))&&(R.netto_jahr!=null?+R.netto_jahr>0:rechnungVertrag().netto_jahr>0);
    const text=spende?`Deine Spende ist zugesagt. ${rg?`Die Spendenzusage mit den Bankdaten kommt per Mail an ${mail}.`:`Die Spendenzusage kommt per Mail an ${mail}.`}`
      :fe&&heuteU?`Vertrag ${esc(R.nr)} ist von beiden Seiten unterschrieben. Eine Kopie${rg?' und '+rgW:''} schicken wir per Mail an ${mail}${spZeile}.`
      :fe?`Du hast am ${datum(tagU)} unterschrieben, und der Verein hat gegengezeichnet. Den Vertrag mit beiden Unterschriften${rg?' und '+rgW:''} haben wir an ${mail} geschickt${spZeile}.${keineRg?' '+(eRg?'Die Rechnung':'Die erste Rechnung')+' kommt in den nächsten Tagen per Mail.':''}${rg&&rg.status==='bezahlt'?' Die Rechnung ist bezahlt. Danke.':''}`
      :`${heuteU?'':`Du hast am ${datum(tagU)} unterschrieben. `}Wir unterschreiben in den nächsten Tagen für den Verein, dann kommt alles per Mail an ${mail}.`;
    const freu=spende||!gekauft?'':`${fe?'Wie es weitergeht: ':'Sobald alles fest ist: '}${esc(gekauft)}${!fe&&spaet?` Beginn ist am ${datum(R.beginn||beginn())}.`:''}`;
    const fuss=(spende||rg?'':`${sp2?'Zum Vertrag: ':''}${fe?(eRg?'Die Rechnung':'Die erste Rechnung')+' kommt in den nächsten Tagen per Mail, die Bankdaten stehen darauf.':'Die Bankdaten stehen auf der Rechnung, die mit dem gegengezeichneten Vertrag kommt.'}`);
    const keineMail=`${rg&&R.bank&&!R.bank.probe?'Vertrag und Rechnung liegen der Mail auch als PDF bei. ':''}Keine Mail da? Schau bitte im Spam-Ordner nach${V.email?' oder schreib uns an <span class="mail">'+esc(V.email)+'</span>':''}.`;
    const zb0=zahlBlock([{titel:spende?'Spende':'Rechnung',rg},sp2?{titel:'Spende',rg:sp2.rechnung}:null],R.bank||(sp2&&sp2.bank),(fuss?`<p class="hinweis bank-spaeter">${fuss}</p>`:'')+`<p class="hinweis">${keineMail}</p>`);
    A.innerHTML=`<div class="danke-raster"><div class="danke${los?' los':''}"><h2 class="danke-h" tabindex="-1">${spende?'Danke für deine Spende':fe?'Der Vertrag ist geschlossen':'Danke für deine Unterschrift'}</h2>
      <p>${text}</p>${freu?`<p class="freu">${freu}</p>`:''}${R.fehlt_zweite&&!fe?'<p class="hinweis" style="color:var(--ink)">Für den Verein unterschreiben laut Satzung zwei Personen. Die zweite Unterschrift fehlt noch.</p>':''}<button type="button" class="textknopf" id="linkSichern">Diesen Link sichern</button>${R.geaendert?`<p class="hinweis" style="color:var(--ink)">${spende?`Deine erste Zusage war schon bei uns angekommen, bevor die Verbindung abbrach. Bei uns steht deshalb die Zusage ${esc(R.nr)} mit dem ersten Betrag. Willst du den Betrag ändern, schreib uns kurz.`:`Deine erste Unterschrift war schon bei uns angekommen, bevor die Verbindung abbrach. Bei uns liegt deshalb der Vertrag ${esc(R.nr)} in der ersten Fassung. Schick uns deine Änderung bitte kurz per Mail, dann passen wir den Vertrag an.`}</p>`:''}${probeHinweis}${((rg&&rg.status!=='bezahlt')||sp2)&&fein()?`<button type="button" class="textknopf" id="zurBank">${!rg?'Spende überweisen':spaet?'Bankdaten ansehen':'Rechnung und Bankdaten'}</button>`:''}
      <ol class="weg">${weg.map(x=>`<li><strong>${esc(x[0])}</strong><span>${x[2]?x[1]:esc(x[1])}</span></li>`).join('')}</ol></div>
      <div class="danke-r">${zb0||`<div class="danke-fuss">${fuss?`<p class="hinweis bank-spaeter">${fuss}</p>`:''}<p class="hinweis">${keineMail}</p></div>`}</div></div>
      ${spOffen?`<p class="sp-leise">Die Spende über ${eur(rechnung().spende,true)} haben wir weggelassen. Wenn du sie doch geben willst, geht das hier jederzeit. <button type="button" class="textknopf" id="spNochmal">Spende zusagen</button></p>`:''}
      ${R.spendeFehler?`<div class="msg err">${R.spendeNetz?'Dein Vertrag ist da. Bei der Spende ist die Verbindung abgebrochen. Tipp bitte gleich noch einmal auf „Spende jetzt zusagen“. Doppelt wird sie dabei nicht angelegt.':`Dein Vertrag ist da. Die Spende konnten wir gerade nicht anlegen (${esc(R.spendeFehler)}).`} <button type="button" class="textknopf" id="spNochmal">Spende jetzt zusagen</button></div>`:''}
      ${spende||demo()?'':nennungHtml()}
      ${neu}`;
    nennungBinden(A);
    kopierBinden(A);
    const sn=A.querySelector('#spNochmal'); if(sn)sn.onclick=async()=>{ sn.disabled=true; tippStark(); try{ const sb=spendeBodyNeu();
        S.ergebnis.spende=demo()?await probeErgebnis('spende',PLIB.rechnen(sb.positionen,L,1)):await rpc('partner_praesi_abschluss',{p_code:code,p:sb},30000); delete S.ergebnis.spendeFehler; delete S.ergebnis.spendeBody; merken(); danke(); }
      catch(e){ sn.disabled=false; toast(e.message); } };
    const ls=A.querySelector('#linkSichern'); if(ls)ls.onclick=()=>{ const u=location.href;
      if(navigator.share){ navigator.share({title:'Partnerschaft SV/BSC Mörlenbach',url:u}).catch(()=>{}); return; }
      try{ navigator.clipboard.writeText(u).then(()=>toast('Link kopiert. Leg ihn am besten in deine Notizen.'),()=>toast('Bitte kopier die Adresse oben im Browser.')); }catch(e){ toast('Bitte kopier die Adresse oben im Browser.'); } };
    const zb=A.querySelector('#zurBank'); if(zb)zb.onclick=()=>{ const z=A.querySelector('.zahlen'); if(z){ const k=$('.top'); window.scrollTo({top:z.getBoundingClientRect().top+scrollY-((k&&k.offsetHeight)||60)-8,behavior:sanft()}); } };
    nachDanke(A);
    if(los){ const h=A.querySelector('.danke-h'); if(h)h.focus({preventScroll:true}); }
  }
  // Nach dem Abschluss: Der Partner sieht, was er geantwortet hat, und kann es hier jederzeit ändern.
  function nennungHtml(){ const ja=S.nennStand!=='nein', kurz2=esc((D.deck||{}).kurzname||(D.deck||{}).firma||'euch');
    return `<p class="nenn-stand" id="nennStand">${ja?`Wir dürfen öffentlich sagen, dass ${kurz2} Partner ist. Danke dafür.`:`Wir nennen ${kurz2} nirgends öffentlich.`}
      <button type="button" class="textknopf" id="nennUm">${ja?'Lieber doch nicht':'Doch, ihr dürft'}</button></p>`; }
  function nennungBinden(A){ const b=A.querySelector('#nennUm'); if(!b)return;
    b.onclick=async()=>{ b.disabled=true; const w=S.nennStand==='nein'?'ja':'nein';
      try{ if(!demo())await rpc('partner_praesi_nennung',{p_code:code,p_wert:w},10000); S.nennStand=w; S.nenn=w==='ja'; merken();
        const P=A.querySelector('#nennStand'); if(P)P.outerHTML=nennungHtml(); nennungBinden(A); toast(w==='ja'?'Danke, wir nennen euch gern.':'Alles klar, wir nennen euch nicht.'); }
      catch(e){ b.disabled=false; toast(e.message); } }; }
  // Kopierzeilen im Bankblock (Danke und zweites Gerät)
  function kopierBinden(A){
    A.querySelectorAll('[data-probe]').forEach(b=>b.onclick=()=>{ tipp(); toast('In der Probe wird nichts kopiert. In der echten Ansicht landet die Angabe in deiner Zwischenablage.'); });
    A.querySelectorAll('[data-kopie]').forEach(b=>b.onclick=()=>{ const w=b.dataset.kopie; tippStark(); b.textContent='✓ Kopiert'; b.classList.add('ok'); S.bankZeit=Date.now();
      const markieren=()=>{ const s0=b.previousElementSibling, rg0=document.createRange(); rg0.selectNodeContents(s0); const g=getSelection(); g.removeAllRanges(); g.addRange(rg0); b.textContent='Markiert'; };
      try{ navigator.clipboard.writeText(w).catch(markieren); }catch(e){ markieren(); }
      setTimeout(()=>{ b.textContent='Kopieren'; b.classList.remove('ok'); },1800); merken(); }); }
  function nachDanke(A){ leisteZeigen(); const nt=A.querySelector('#neuTermin'); if(nt)nt.onclick=()=>{ S.ergebnis=null; S.korb=[]; S.wl=[]; S.weg=null; S.zust=false; S.befugt=false; S.vsig=null; S.vmodus=null; S.idem=null; vergessen(); korb(); katalog(); kopfZahl(); zu('pakete'); }; }

  window.addEventListener('hashchange',()=>location.reload());
  laden();
})();
