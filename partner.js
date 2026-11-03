/* SV/BSC Mörlenbach · Partner-Präsentation v3 (…/partner.html#d=<code>)
   Ein durchgehender Scroll, der sich an den Partner anpasst:
   Brief vom Verein, wer wir sind, Passung, „Was ist Ihnen wichtig?“, unser Vorschlag, die Welten (Jugend, Erste, Zweite, Events, ganzer Verein)
   in der Reihenfolge, die zum Partner passt, Paket, Vertrag aus Bausteinen, Unterschrift.
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
    catch(e){ const x=new Error('Die Verbindung ist gerade weg. Ihre Angaben bleiben hier stehen. Versuchen Sie es einfach gleich noch einmal.'); x.netz=true; throw x; }
    finally{ clearTimeout(to); }
    if(r.status===401&&t&&!nochmal&&!T){ ohneToken=true; return rpc(fn,body,ms,true); }   // Sitzung aus der App ungültig: der Link gilt auch ohne
    const j=await r.json().catch(()=>null);
    // Gateway 5xx oder kaputte Antwort: Der Server kann trotzdem fertig geworden sein. Wie ein Netzabbruch behandeln, damit beim nächsten Tipp derselbe Schlüssel gilt
    if(r.status>=500||r.status===0||(r.ok&&j===null&&r.status!==204)){ const x=new Error('Wir können gerade nicht erkennen, ob Ihre Angaben angekommen sind. Bitte ändern Sie nichts und versuchen Sie es in einer Minute mit demselben Knopf. Doppelt wird dabei nichts angelegt.'); x.netz=true; x.unklar=true; x.status=r.status; throw x; }
    if(!r.ok){ const eigen=j&&['P0001','42501'].includes(j.code)&&j.message, x=new Error(eigen||'Das hat gerade nicht geklappt. Ihre Angaben bleiben stehen. Bitte versuchen Sie es gleich noch einmal, oder schreiben Sie uns kurz.'); x.status=r.status; throw x; } return j; }
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
    jugend:{k:'Jugend',titel:'Für die Kinder von Mörlenbach.',hand:'',etikett:'Jugend',text:'Von den Minikickern bis zur A-Jugend trainiert jede Mannschaft unter der Woche und spielt am Wochenende. Was Sie geben, kommt direkt bei den Kindern an, zum Beispiel als neuer Trikotsatz für eine Mannschaft.',fz:'Unsere Jugend',teaser:'Trikots, Bälle und Trainer für die Kinder.'},
    erste:{k:'Die Erste',titel:'Sonntags am Platz. Ihr Name spielt mit.',hand:'Unsere Erste.',text:'Über die Erste wird im Ort gesprochen, beim Bäcker und am Stammtisch. Ihr Name ist bei jedem Heimspiel dabei, auf dem Trikot oder an der Bande, und später auf den Fotos.',bild:'partner/hero.jpg',pos:'center 40%',teaser:'Trikot und Bande bei jedem Heimspiel.'},
    zweite:{k:'Die Zweite',titel:'Fußball nach Feierabend.',hand:'Unsere Zweite.',text:'In der Zweiten spielen Männer, die tagsüber arbeiten und abends zum Training kommen. Und es gibt die Jungs aus der A-Jugend, die hier ihre ersten Spiele bei den Herren machen.',art:'platz',teaser:'Trikot und Ärmel der Zweiten.'},
    events:{k:'Zeltlager und Turniere',titel:'Die Tage, von denen Kinder noch lange erzählen.',hand:'Zeltlager und Turniere.',text:'Ihr Banner hängt dort, wo an diesen Tagen alle zusammenkommen: Kinder, Eltern und Trainer.',art:'zelt',teaser:'Zeltlager, Ferienfußball und Turniere.'},
    verein:{k:'Der ganze Verein',titel:'Ein Paket für den ganzen Verein.',hand:'Am Platz und im Netzwerk.',text:'Vier Stufen, vom Einstieg bis zur Stufe 1896. Je nach Stufe gehören die Partnerwand, eine eigene Bande, Karten für die Heimspiele und die Treffen unserer Partner dazu.',art:'bande',teaser:'Vier Partnerstufen, dazu Ihre Stellenanzeige bei uns.'}};
  const ART={
    zelt:()=>`<svg class="welt-art" viewBox="0 0 520 300" aria-hidden="true"><path d="M60 280 L210 70 L360 280 Z" fill="#141b47"/><path d="M210 70 L250 280 L170 280 Z" fill="#e8741f"/><path d="M210 70 L210 40" stroke="#141b47" stroke-width="6"/><path d="M210 40 L250 52 L210 64 Z" fill="#fff"/><path d="M300 280 L420 120 L520 280 Z" fill="#1d2760"/><path d="M420 120 L450 280 L392 280 Z" fill="#f7f4ee"/><circle cx="470" cy="60" r="26" fill="#fff" opacity=".9"/><path d="M0 284 H520" stroke="#141b47" stroke-width="8"/></svg>`,
    platz:()=>`<svg class="welt-art" viewBox="0 0 520 300" aria-hidden="true" fill="none" stroke="#1d2760" stroke-width="5" opacity=".9"><rect x="20" y="30" width="480" height="260"/><path d="M260 30 V290"/><circle cx="260" cy="160" r="58"/><rect x="20" y="95" width="70" height="130"/><rect x="430" y="95" width="70" height="130"/><circle cx="260" cy="160" r="5" fill="#e8741f" stroke="none"/></svg>`,
    bande:()=>{ const dk=(D&&D.deck)||{}, nm=String(dk.kurzname||dk.firma||'Ihr Name').slice(0,18);
      const mitte=dk.logo?`<image href="${esc(dk.logo)}" x="182" y="116" width="126" height="48" preserveAspectRatio="xMidYMid meet"/>`:`<text x="245" y="150" font-family="Barlow Condensed,Arial Narrow,sans-serif" font-weight="900" font-size="${nm.length>14?20:nm.length>10?25:30}" fill="#141b47" text-anchor="middle" ${nm.length>10?'textLength="118" lengthAdjust="spacingAndGlyphs"':''}>${esc(nm.toUpperCase())}</text>`;
      return `<svg class="welt-art" viewBox="0 0 520 300" role="img" aria-label="So sähe Ihr Name an unserer Bande aus"><rect x="0" y="170" width="520" height="130" fill="#1d2760"/><g fill="#fff" stroke="#8fc9ec" stroke-width="2"><rect x="10" y="110" width="150" height="60"/><rect x="330" y="110" width="150" height="60"/></g><image href="partner/wappen.png" x="45" y="118" width="80" height="45" preserveAspectRatio="xMidYMid meet"/><text x="405" y="152" font-family="Barlow Condensed,Arial Narrow,sans-serif" font-weight="900" font-size="30" fill="#1d2760" text-anchor="middle" opacity=".85">1896</text><rect x="170" y="110" width="150" height="60" fill="#fff"/><rect x="170" y="110" width="150" height="60" fill="none" stroke="#e8741f" stroke-width="4"/>${mitte}<path d="M0 230 H520" stroke="#fff" stroke-width="3" opacity=".6"/><text x="245" y="208" font-family="Barlow Condensed,Arial Narrow,sans-serif" font-weight="800" font-size="17" letter-spacing="2.5" fill="#fff" text-anchor="middle">SO SÄHE IHRE BANDE AUS</text></svg>`; }};
  const WELT_AKK={jugend:'die Jugend',erste:'die Erste',zweite:'die Zweite',events:'Zeltlager und Turniere',verein:'den ganzen Verein'};
  const ZWECK_PARTNER={Jugend:'die Jugend des SV/BSC',Zeltlager:'das Zeltlager der Jugend',Ferienspiele:'die Ferienspiele',Erste:'die Erste','Erste Mannschaft':'die Erste','Zweite Mannschaft':'die Zweite',Verein:'den Verein'};
  const ZWECK_VERTRAG={Jugend:'seine Jugendabteilung',Zeltlager:'das Zeltlager seiner Jugend',Ferienspiele:'seine Ferienspiele','Erste Mannschaft':'seine erste Mannschaft','Zweite Mannschaft':'seine zweite Mannschaft',Verein:'seine Fußballabteilung'};
  const ZWECK_TXT={Jugend:'unsere Jugend',Zeltlager:'das Zeltlager',Ferienspiele:'die Ferienspiele','Erste Mannschaft':'die Erste','Zweite Mannschaft':'die Zweite',Verein:'den Verein'}, zweckTxt=z=>ZWECK_TXT[z]||'den Verein';
  const BUDGET=[['bis250','bis 250 €',250],['bis1000','250 bis 1.000 €',1000],['bis2500','1.000 bis 2.500 €',2500],['mehr','über 2.500 €',6000],['offen','noch offen',1500]];
  const ZIELE_PRAESI=['jugend','sichtbarkeit','mitarbeiter','netzwerk','events','spende'];
  const ZIEL_TEXT={jugend:'Den Kindern etwas mitgeben',sichtbarkeit:'Im Ort gesehen werden',mitarbeiter:'Leute für meinen Betrieb finden',netzwerk:'Andere Unternehmer kennenlernen',events:'Dabei sein, wenn was los ist',spende:'Einfach helfen'};
  const STUFE=['supporter','club','premium','p1896'];

  let D=null, L=[], M=[], T=false;
  // Termin mit Recht für Verträge: nur dann Sonderpreis, Sonstiges und Unterschrift für den Verein (der Server prüft dasselbe Recht)
  const TV=()=>T&&!!D&&D.vertrag_darf!==false;
  // Im Termin unterschreibt der Verein nur mit, wer ihn vertreten darf (Vorstand); sonst zeichnet er später gegen
  const VS=()=>TV()&&D.gegenzeichnen_darf===true;
  // Geschlossen ist der Vertrag erst mit der Unterschrift des Vereins (gegengezeichnet), vorher ist die Unterschrift des Partners sein Angebot
  const fest=R=>!!R&&(R.status==='aktiv'||!!R.gegengezeichnet_am);
  const S={alle:new Set(),ziele:new Set(),herz:new Set(),budget:'',team:null,offen:new Set(),korb:[],saisons:1,start:[2,3,4,5].includes(new Date().getMonth())?'naechste':'jetzt',startWahl:[2,3,4,5].includes(new Date().getMonth()),auto:false,wl:[],
    weg:null,F:{},zust:false,befugt:false,sig:{p:false,v:false},unterzeichner:'',ergebnis:null,busy:false,spende:{betrag:0,zweck:'Jugend'},idem:null,vsig:null,vmodus:null,neuHinweis:false,neu:null,trotz:false};
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
    document.querySelectorAll('#app > section[id], #app > div[id="welten"] > section[id]').forEach(el=>{ if(el.hidden||!el.offsetHeight)return; const t=el.getBoundingClientRect().top; if(t<=oben+1&&(!best||t>best.t))best={id:el.id,t}; });
    return best?{id:best.id,off:Math.round(oben-best.t)}:null; }
  function merken(){ const st=ablage(); if(!st||!D)return;
    const fe=fertig(), F0=fe?{firma:S.F.firma,anrede:S.F.anrede,ansprech:S.F.ansprech,email:S.F.email}:S.F;
    try{ st.setItem(SKEY,JSON.stringify({t:Date.now(),korb:S.korb,wl:S.wl,saisons:S.saisons,start:S.start,auto:S.auto,F:F0,herz:[...S.herz],ziele:[...S.ziele],budget:S.budget,team:S.team,ergebnis:demo()||!S.ergebnis?null:Object.assign({},S.ergebnis,{spendeBody:undefined}),angebot:S.angebot||null,pos:stelle(),antw:!!S.antw,idem:S.idem,bankZeit:S.bankZeit||0,idemOffen:S.idemOffen||null,uid})); }catch(e){} }
  function vergessen(){ const st=ablage(); try{ st&&st.removeItem(SKEY); }catch(e){} }
  function zurueckholen(){ const st=ablage(); if(!st)return false; let j=null; try{ j=JSON.parse(st.getItem(SKEY)||'null'); }catch(e){}
    if(!j||!(Date.now()-j.t<14*864e5))return false;
    if(j.ergebnis)delete j.ergebnis.spendeBody;
    const ang=j.angebot&&j.angebot.nr&&D.angebot&&D.angebot.nr===j.angebot.nr?j.angebot:null;
    const ok=e=>e&&lk(e.key)&&(e.key==='spende'||e.key==='sonstiges'?T||e.key==='spende'||!!(ang&&e.ang):true);
    const mOk=e=>!lk(e.key).je_mannschaft||M.some(m=>m.id===e.mannschaft), vorher=(j.korb||[]).filter(ok).length+(j.wl||[]).filter(w=>lk(w.key)).length;
    S.korb=(j.korb||[]).filter(ok).filter(mOk); S.wl=(j.wl||[]).filter(w=>lk(w.key)).filter(mOk);
    if(S.korb.length+S.wl.length<vorher)setTimeout(()=>toast('Eine Mannschaft aus Ihrem Paket spielt in dieser Saison nicht mehr. Wählen Sie bitte eine andere.'),900); S.saisons=[1,2,3].includes(j.saisons)||(ang&&j.saisons>=1&&j.saisons<=5)?j.saisons:1; S.angebot=ang; S.standZeit=+j.t||0; if(j.antw)S.antw=true; S.pos=j.pos&&/^[a-z0-9-]+$/.test(j.pos.id||'')?j.pos:null;
    if(!ang)S.korb.forEach(e=>{ if(e.ang){ delete e.ang; if(!T&&lk(e.key).preis!=null)e.preis=null; } }); S.start=j.start==='naechste'?'naechste':'jetzt'; S.auto=!!j.auto;
    Object.keys(j.F||{}).forEach(k=>{ if(j.F[k])S.F[k]=String(j.F[k]).slice(0,120); });
    (j.herz||[]).forEach(z=>WELT[z]&&S.herz.add(z)); (j.ziele||[]).forEach(z=>S.ziele.add(z)); if(j.budget)S.budget=j.budget; if(j.team&&M.some(m=>m.id===j.team))S.team=j.team;
    S.ergebnis=j.ergebnis||null; S.idem=j.idem||null; S.bankZeit=+j.bankZeit||0;
    if(S.ergebnis&&['angebot','warteliste'].includes(S.ergebnis.art)&&Date.now()-j.t>30*60e3){ if(S.ergebnis.art==='angebot')S.weg='vertrag'; S.ergebnis=null; S.idem=null; } S.idemOffen=j.idemOffen&&j.idemOffen.idem&&Date.now()-(+j.idemOffen.zeit||j.t)<30*60e3?j.idemOffen:null; uid=Math.max(+j.uid||0,...S.korb.map(e=>+e.id||0),0);
    return S.korb.length>0||S.wl.length>0; }

  try{ if('scrollRestoration' in history)history.scrollRestoration='manual'; }catch(e){}   // die Stelle stellen wir selbst wieder her
  async function laden(){
    if(!/^[a-f0-9]{32}$/.test(code)){ app.innerHTML=`<div class="leer-hinweis"><h2 class="g">Link fehlt</h2><p>Bitte den persönlichen Link aus der Nachricht öffnen.</p></div>`; return; }
    app.innerHTML='<div class="leer-hinweis">Einen Moment …</div>';
    try{ D=await rpc('partner_praesi',{p_code:code}); if(!D)throw new Error('Dieser Link ist nicht mehr aktiv.'); }
    catch(e){
      if(e.netz){ app.innerHTML=`<div class="leer-hinweis"><h2 class="g">Gerade keine Verbindung</h2><p>Ihr persönlicher Link ist weiter gültig. Bitte prüfen Sie Ihr Netz und versuchen Sie es noch einmal.</p><button type="button" class="knopf-w" id="nochmal" style="max-width:320px;margin-top:22px">Noch einmal versuchen</button></div>`; $('#nochmal').onclick=laden; }
      else app.innerHTML=`<div class="leer-hinweis"><h2 class="g">Link nicht mehr aktiv</h2><p>${esc(e.message)}</p><p>Schreiben Sie uns einfach, dann schicken wir Ihnen einen neuen.</p></div>`;
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
    geruest(); fragen(); vorschlag(); welten(); korb(); abschluss(); kopfZahl();
    // Nach dem Neuladen (Tab vom Browser verworfen) an derselben Stelle weiter, dann erst der Hinweis
    const zuS=hp.get('s'), hinStelle=wieder&&!S.ergebnis&&!ausAngebot&&!(zuS&&/^[a-z]+$/.test(zuS))&&S.pos&&document.getElementById(S.pos.id);
    const hinDort=()=>{ const el=document.getElementById(S.pos.id), k=$('.top'); if(el)window.scrollTo({top:Math.max(0,el.getBoundingClientRect().top+scrollY-((k&&k.offsetHeight)||60)-2+(+S.pos.off||0)),behavior:'instant'}); };
    if(hinStelle){ hinDort(); S.posBereit=false; const fr=document.fonts&&document.fonts.ready; Promise.race([fr||Promise.resolve(),new Promise(z=>setTimeout(z,400))]).then(()=>{ if(scrollY>0)hinDort(); S.posBereit=true; }); }
    else S.posBereit=true;
    if(!korbPruefen()&&wieder&&!S.ergebnis)setTimeout(()=>toast('Schön, dass Sie wieder da sind. Ihr Paket haben wir aufgehoben.'),600);
    if(ausAngebot){ const sonder=S.korb.some(e=>e.ang&&e.preis!=null)||S.saisons>3; setTimeout(()=>{ toast(sonder?'In Ihrem Angebot stehen die Preise aus unserem Gespräch. Sie können es hier genau so unterschreiben. Möchten Sie etwas ändern, schreiben Sie uns kurz.':'Hier ist Ihr Angebot '+ausAngebot.nr+', mit Preisen und Laufzeit genau wie besprochen. Sie können es gleich unterschreiben.'); zu('abschluss',true); },400); }
    { const zu0=hp.get('s'); if(zu0&&/^[a-z]+$/.test(zu0))setTimeout(()=>zu(zu0,true),350); else if(S.ergebnis)setTimeout(()=>{ const z=Date.now()-(S.bankZeit||0)<15*60e3&&$('.zahlen'); if(z){ const k=$('.top'); window.scrollTo({top:z.getBoundingClientRect().top+scrollY-((k&&k.offsetHeight)||60)-8,behavior:'instant'}); } else zu('abschluss',true); },350); }   // aus der Partner-Zentrale direkt zum Abschluss
    let rafS=0; window.addEventListener('scroll',()=>{ if(rafS)return; rafS=requestAnimationFrame(()=>{ rafS=0; fortschritt(); leisteZeigen(); }); },{passive:true}); fortschritt(); beobachten(); leiste();
    ['pointerdown','keydown'].forEach(t=>addEventListener(t,()=>{ beruehrt=Date.now(); },{passive:true,capture:true}));
    setInterval(()=>{ if(document.visibilityState==='visible'&&!S.busy&&!S.ergebnis&&ruhig()&&weltenImBlick())freiHolen(); },180000);
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
  const weltenImBlick=()=>{ const w=$('#welten'); if(!w)return false; const r=w.getBoundingClientRect(); return r.top<innerHeight&&r.bottom>0; };
  const freiSig=()=>JSON.stringify(L.map(l=>[l.key,l.frei,l.frei_naechste,l.frei_je,l.frei_je_naechste]));
  async function freiHolen(){ try{ const n=await rpc('partner_praesi_frei',{p_code:code},10000); if(!Array.isArray(n))return; const vor=freiSig();
      n.forEach(f=>{ const l=lk(f.key); if(l){ l.frei=f.frei; l.frei_naechste=f.frei_naechste; l.frei_je=f.frei_je; l.frei_je_naechste=f.frei_je_naechste; } }); exklusivSperre();
      if(freiSig()!==vor){ mitAnker(()=>{ korbPruefen(); welten(); vorschlag(); },ersteSichtbare()); } }catch(e){} }
  function ersteSichtbare(){ const k=$('.top'), oben=(k?k.offsetHeight:60)+4; return [...document.querySelectorAll('#welten [data-add],#welten [data-tm]')].find(b=>{ const r=b.getBoundingClientRect(); return r.top>=oben&&r.top<innerHeight; })||null; }
  // Ist ein Baustein aus dem Paket inzwischen vergeben, kommt er auf die Vormerkliste statt erst beim Unterschreiben zu scheitern
  function korbPruefen(){ if(S.ergebnis)return false; const weg=S.korb.filter(e=>{ const l=lk(e.key); if(!l||e.naechste||['spende','sonstiges'].includes(l.art))return false; return frei(l,e.mannschaft)===0; });
    if(!weg.length)return false; S.korb=S.korb.filter(e=>!weg.includes(e)); weg.forEach(e=>{ if(!S.wl.some(w=>w.key===e.key&&(w.mannschaft||null)===(e.mannschaft||null)))S.wl.push({key:e.key,mannschaft:e.mannschaft||null}); });
    korb(); kopfZahl(); setTimeout(()=>toast(weg.length===1?'Eine Leistung aus Ihrem Paket ist inzwischen vergeben. Wir haben sie für Sie vorgemerkt.':'Einige Leistungen aus Ihrem Paket sind inzwischen vergeben. Wir haben sie für Sie vorgemerkt.'),600); return true; }

  // ---------- Grundgerüst ----------
  function logoImg(cls){ const dk=D.deck; return dk.logo?`<img class="${(cls||'')+(dk.logo_hell===false?' dk':'')}" src="${esc(dk.logo)}" alt="${esc(dk.firma)}">`:''; }
  function nachname(){ const nm=String(S.F.ansprech||(D.deck||{}).ansprech||'').trim().split(/\s+/).filter(Boolean); return nm.length?nm[nm.length-1]:''; }
  // Vor der Gegenzeichnung kein zweites Danke unter der Überschrift, sondern Vorfreude
  function freuName(){ const a=S.F.anrede||(D.deck||{}).anrede, n=nachname(); return a&&n?`Wir freuen uns, ${a} ${n}!`:'Wir freuen uns!'; }
  function dankeName(){ const a=S.F.anrede||(D.deck||{}).anrede, n=nachname(); return a&&n?`Danke, ${a} ${n}!`:`Danke, ${S.F.firma||(D.deck||{}).firma||''}!`; }
  // Schon dabei? Nach der Unterschrift hier oder auf einem anderen Gerät (dann meldet es der Server)
  function dabeiArt(){ if(fertig())return S.ergebnis.art; return D&&D.abschluss&&!T?D.abschluss.art:null; }
  function dabeiFest(){ return fertig()?fest(S.ergebnis):!!(D&&D.abschluss&&fest(D.abschluss)); }
  let ANR='Guten Tag,';
  // Hero-Satz: vor der Unterschrift der Satz aus dem Termin oder unser Satz, danach ein Willkommen
  function heroText(){ const P=((D||{}).deck||{}).passung||{};
    const da=dabeiArt(); if(da==='spende')return 'Danke für Ihre Hilfe. Die Angaben zum Überweisen finden Sie weiter unten.';
    if(da)return dabeiFest()?'Schön, Sie an unserer Seite zu haben. Ihr Paket und alles zur Rechnung finden Sie weiter unten.':'Schön, dass Sie dabei sein möchten. Ihr Paket und die Vertragsbedingungen finden Sie weiter unten.';
    return P.hero?esc(P.hero):'Bei uns lernen Kinder aus dem Ort Fußball. Vielleicht kennen Sie manche schon, aus der Nachbarschaft oder weil ihre Eltern bei Ihnen arbeiten.'; }
  function briefHtml(anr){ const V=D.verein||{}, wer=String(V.vertreter||'').trim(), da=dabeiArt();
    const p1='wir sind der SV/BSC, seit 1896 Fußball in Mörlenbach. Dass bei uns jede Woche rund 260 Kinder und Jugendliche auf dem Platz stehen, verdanken wir Trainern, Eltern und Helfern, die dafür ihre Abende und Wochenenden hergeben. '
      +(da==='vertrag'?'Damit es so bleibt, brauchen wir Betriebe aus dem Ort, die das mittragen. '+(dabeiFest()?'Schön, dass Ihr Betrieb jetzt einer davon ist.':'Dass Ihr Betrieb einer davon werden will, freut uns sehr.'):da==='spende'?'Damit es so bleibt, brauchen wir Menschen und Betriebe aus dem Ort, die das mittragen. Danke, dass Sie uns dabei helfen.':'Damit es so bleibt, suchen wir Betriebe aus dem Ort, die das mittragen. Wir würden uns sehr freuen, wenn Sie dabei wären.');
    const p2=da==='vertrag'?'Heben Sie diesen Link gut auf. Hier sehen Sie jederzeit, was Sie gebucht haben, die Vertragsbedingungen und, sobald die Rechnung da ist, alles zum Überweisen. Wenn Ihnen etwas fehlt, sagen Sie es uns.'
      :da==='spende'?'Heben Sie diesen Link gut auf. Hier finden Sie jederzeit die Angaben zum Überweisen. Wenn Ihnen etwas fehlt, sagen Sie es uns.'
      :'Diese Seite haben wir nur für Sie zusammengestellt. Schauen Sie in Ruhe hinein. Sie müssen heute nichts entscheiden, und wenn Ihnen etwas fehlt, sagen Sie es uns.';
    return `<section class="sec brief-sec" id="brief"><div class="w"><article class="brief">
      <div class="anr">${anr}</div>
      <p>${p1}</p>
      <p>${p2}</p>
      <div class="gruss">Herzliche Grüße aus dem Weschnitztal</div>
      ${wer?`<div class="sig">${esc(wer)}</div><span class="fkt">${esc(V.vertreter_funktion||'SV/BSC Mörlenbach')}</span>`:`<div class="sig">Ihr SV/BSC</div>`}
      <img class="stempel" src="${WAPPEN}" width="320" height="182" alt="SV/BSC Mörlenbach"></article></div></section>`; }
  // Was eine gebuchte Position im Verein bewirkt (statt die Leistung noch einmal aufzuzählen)
  function wirkung(p,spZw){ if(p.key==='spende'||p.art==='spende')return 'Das Geld setzen wir für '+zweckTxt(p.zweck||spZw)+' ein.';
    if(['supporter','club','premium','p1896'].includes(p.key))return (p.key==='supporter'?'':'Ihre Bande steht bei jedem Heimspiel am Platz. ')+'Ihr Beitrag kommt dem ganzen Verein zugute, von den Minikickern bis zur Ersten.';
    const l=lk(p.key)||{}; return (String(l.text||p.beschreibung||'').match(/[^.]+\.?/g)||[]).slice(0,1).join('').trim(); }
  function bedingungenHtml(kl){ return `<details class="vt-kl-fertig"><summary>Ihre Vertragsbedingungen</summary>${kl.map((k,i)=>`<div class="kl-z"><b>§ ${i+1} ${esc(k.titel||'')}</b><p>${esc(k.text||'')}</p></div>`).join('')}</details>`; }
  function bewegtHtml(sofort){ const keys=['baelle_jugend','trainer_jugend','trikot_jugend','zeltlager'], ls=keys.map(lk).filter(l=>l&&l.preis!=null).slice(0,4), da=!!dabeiArt();
    if(da)return '';
    if(!ls.length)return '';
    // Nach der Unterschrift ohne Preise: im Moment des Dankes keine Preisliste
    return `<div class="bewegt rv${sofort?' da':''}${da?' ohne-preis':''}" aria-label="Wohin Ihr Geld geht"><div class="bewegt-k"><span>Wohin Ihr Geld geht</span>${da?'':`<span>${['','Ein Beispiel','Zwei Beispiele','Drei Beispiele','Vier Beispiele'][ls.length]}</span>`}</div>
      <ul>${ls.map(l=>`<li><b>${esc(l.kurz||l.titel)}</b><small>${esc((String(l.text||'').match(/[^.]+\.?/g)||[]).slice(0,2).join('').trim())}</small>${da?'':`<em>${eur(l.preis)}</em>`}</li>`).join('')}</ul>
      <div class="fuss">Was Sie für die Jugend geben, bleibt bei der Jugend.</div></div>`; }
  function briefUndBewegtNeu(){ const hp0=$('#heroP'); if(hp0)hp0.innerHTML=heroText(); const b=$('#brief'); if(b)b.outerHTML=briefHtml(ANR); const w=$('.bewegt'); if(w)w.outerHTML=bewegtHtml(true); const v=$('#verein'); if(v)v.classList.toggle('kurz',!!dabeiArt()); }
  function geruest(){
    const dk=D.deck, P=dk.passung||{}, kurz=dk.kurzname||dk.firma, nm=String(dk.ansprech||'').trim().split(/\s+/);
    const anr=ANR=dk.ansprech?(dk.anrede?`${dk.anrede==='Frau'?'Liebe':'Lieber'} ${esc(dk.anrede)} ${esc(nm[nm.length-1])},`:`Hallo ${esc(nm[0])},`):'Guten Tag,';
    const nJ=M.length, hatPassung=P.titel||P.text||(P.punkte||[]).length, V=D.verein||{};
    app.innerHTML=`
<div class="top"><div class="ww"><div class="top-l"><img src="${WAPPEN}" width="320" height="182" alt="SV/BSC Mörlenbach"><span class="abs"><b>SV/BSC</b><small>Mörlenbach · Fußball</small></span>${dk.logo?`<span class="top-x">und</span><span class="top-p${dk.logo_hell===false?' dk':''}">${logoImg()}</span>`:''}</div>
  <div class="top-r">${T?'<span class="top-t" title="Angemeldet im Partner-Team">Termin</span>':''}<button class="top-b" type="button" data-zu="baukasten" aria-label="Zu Ihrem Paket" hidden><span id="kopfT">Ihr Paket</span><i id="kopfN">0</i></button></div></div><div class="prog" id="prog"></div></div>
<div id="live" class="nur-sr" aria-live="polite"></div>
${demo()?'<div class="demo">Probeansicht zum Durchklicken. Hier wird nichts gespeichert und nichts verschickt. <button type="button" id="probeNeu">Probe neu starten</button></div>':''}
<section class="hero"><img src="partner/jugend.jpg" alt="Jugendspieler des SV/BSC Mörlenbach im Kreis" fetchpriority="high" style="object-position:center 32%"><div class="ww">
  <div class="hero-f"><span>Für ${esc(kurz)}</span></div>
  <h1>Hier wächst Heimat.</h1>
  <p id="heroP">${heroText()}</p>
  <div class="runter-z"><button class="runter k" type="button" data-zu="brief">Lernen Sie uns kennen ↓</button><button class="runter k leise" type="button" data-zu="wunsch">Gleich zur Auswahl ↓</button></div></div></section>
${briefHtml(anr)}
<section class="sec hell papier${dabeiArt()?' kurz':''}" id="verein"><div class="ww verein-2"><div>
  <div class="k ok">Das sind wir</div>
  <h2 class="g zwei">Seit 1896<br><span>im Weschnitztal zu&nbsp;Hause.</span></h2>
  <p class="lead">Mörlenbach liegt mitten im Odenwald. Bei uns spielen die Kleinen meist samstags, die Herren sonntags, und am Rand stehen die Familien. Ohne Ehrenamt ginge das nicht, und ohne die Betriebe, die uns unterstützen, auch nicht.</p>
  <div class="zahl"><b>260</b><span>Kinder und Jugendliche,<br>jede Woche auf dem Platz</span></div>${V.heimspiele?`<div class="zahl zahl2"><b>${esc(V.heimspiele)}</b><span>Heimspiele der Ersten<br>in der ${esc(V.liga||'Kreisliga A')}${V.zuschauer?`, im Schnitt rund ${esc(V.zuschauer)} Zuschauer`:''}</span></div>`:''}
  <p class="zahl-n">${nJ?nJ+' ':''}Jugendmannschaften von den Minikickern bis zur A-Jugend · eine Erste und eine Zweite${V.zuschauer?' · Die Zuschauerzahl ist unsere Schätzung.':''}</p>
  <div class="saeulen">
    <div><h3>Jugend</h3><p>Der größte Teil des Vereins. Hier stehen Minikicker, die sich die Schuhe noch nicht allein zubinden, und Jugendliche kurz vor dem Sprung zu den Herren.</p></div>
    <div><h3>Erste und Zweite</h3><p>Zum Heimspiel gehört bei uns mehr als die 90 Minuten. Nach dem Abpfiff bleibt man gern noch eine Weile am Platz stehen.</p></div>
    <div><h3>Gemeinschaft</h3><p>Im Sommer fährt die Jugend ins Zeltlager, im Winter spielen wir Hallenturniere. Und immer sind Eltern da, die zu Auswärtsspielen fahren und die Trikots waschen.</p></div></div></div>
  <div>${bewegtHtml()}</div></div></section>
${hatPassung?`<section class="sec hell papier" id="passung" style="padding-top:0"><div class="w">
  <div class="pa-kopf">${dk.logo?logoImg('pl'):`<b style="font-family:var(--c);font-weight:900;font-size:34px;color:#1d2760;text-transform:uppercase">${esc(kurz)}</b>`}<i>und</i><img class="sv" src="${WAPPEN}" width="320" height="182" alt="SV/BSC Mörlenbach"></div>
  <div style="margin-top:30px"><div class="hand" style="font-size:30px">Warum wir an Sie gedacht haben</div>
  ${P.titel?`<h2 class="g" style="color:var(--blau)">${esc(P.titel)}</h2>`:''}
  ${P.text?`<p class="pa-text">${esc(P.text)}</p>`:''}
  ${(P.punkte||[]).length?`<ul class="pa-p">${P.punkte.map(x=>`<li>${esc(x)}</li>`).join('')}</ul>`:''}</div></div></section>`:''}
<section class="sec dunkel" id="wunsch"><div class="ww">
  <div class="k" style="color:var(--hb)">Ihre Partnerschaft</div>
  <h2 class="g">Was ist Ihnen wichtig?</h2>
  <p class="lead">Wählen Sie aus, was für Sie zählt. Danach ordnen wir die Seite für Sie und machen einen Vorschlag.</p>
  <div class="fr" id="fragen"></div><div class="fr-n" id="frN" aria-live="polite"></div></div></section>
<section class="sec dunkel" id="vorschlag"></section>
<div id="welten"></div>
<section class="sec hell papier" id="baukasten"><div class="w bk"><div id="korbIn"></div><aside class="bk-r"><div class="summe" id="summe"></div><div class="bk-leer" id="bkLeer" hidden><div class="k">Ihr Paket</div><p>Hier steht gleich Ihre Summe, netto und mit Umsatzsteuer.</p><p hidden>was auswählen, steht hier die Summe.</p></div><div id="korbWeiter"></div></aside></div></section>
<section class="sec dunkel geist" id="abschluss"><div class="ab-raster"><div class="w" id="abIn"></div><aside id="abSeite" aria-label="Ihr Paket im Überblick"></aside></div></section>
<footer><div class="ww"><div class="f-l"><img src="${WAPPEN}" width="320" height="182" alt=""><span class="hand" style="font-size:24px">Aus Mörlenbach, für Mörlenbach.</span></div>
  <div>${esc(V.name||'SV/BSC Mörlenbach')}, Partnerschaften${V.email?`<br><a href="mailto:${esc(V.email)}">${esc(V.email)}</a>`:''}${rechtHtml()}</div></div></footer>`;
    app.addEventListener('click',e=>{ const z=e.target.closest('[data-zu]'); if(z){ e.preventDefault(); zu(z.dataset.zu); } });
    const pn=$('#probeNeu'); if(pn)pn.onclick=()=>{ vergessen(); location.reload(); };
    const rv=$('#rechtWeg'); if(rv)rv.onclick=()=>{ vergessen(); toast('Erledigt. Dieses Gerät hat Ihre Eingaben vergessen.'); setTimeout(()=>location.reload(),1200); };
  }
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
      <p><b>Wozu wir Ihre Angaben nutzen.</b> Was Sie hier eintragen (Firma, Name, Anschrift, E-Mail, Telefon und Unterschrift), nutzen wir für Angebot, Vertrag, Rechnung und die Betreuung Ihrer Partnerschaft. Ihre Antworten bei „Was ist Ihnen wichtig?“ speichern wir dazu, damit wir Sie passend beraten können. Grundlage ist der Vertrag mit Ihnen oder seine Anbahnung (Art. 6 Abs. 1 lit. b DSGVO). Verträge und Rechnungen bewahren wir auf, weil das Gesetz es verlangt (Art. 6 Abs. 1 lit. c DSGVO). Ohne Name, Anschrift und E-Mail können wir keinen Vertrag schließen. Telefon und USt-IdNr. sind freiwillig.</p>
      <p><b>Woher wir Ihre Angaben haben.</b> Firma, Name und Mail in Ihrem persönlichen Link haben wir aus unserem Gespräch mit Ihnen oder aus öffentlichen Angaben Ihres Unternehmens, etwa Ihrer Website. Grundlage ist die Anbahnung einer Partnerschaft (Art. 6 Abs. 1 lit. b DSGVO) und unser berechtigtes Interesse, Betriebe aus dem Ort anzusprechen (Art. 6 Abs. 1 lit. f DSGVO).</p>
      <p><b>Aufrufe.</b> Wir sehen, ob und wann dieser Link geöffnet wurde (Zahl und Zeitpunkt der Aufrufe), damit wir wissen, wann wir nachfragen können. Grundlage ist unser berechtigtes Interesse, Sie gut zu betreuen (Art. 6 Abs. 1 lit. f DSGVO).</p>
      <p><b>Wer Daten für uns verarbeitet.</b> GitHub Pages (GitHub Inc., USA) liefert diese Seite aus und verarbeitet dabei technische Daten wie Ihre IP-Adresse. Ihre Angaben speichern wir bei Supabase (Supabase Inc., Server in Frankfurt am Main). Die Mails mit Angebot, Vertrag und Rechnung verschickt Resend (Resend Inc., USA) für uns. Daten gehen in die USA auf Grundlage des EU-US Data Privacy Framework oder von Standardvertragsklauseln.</p>
      <p><b>Wie lange.</b> Rechnungen bewahren wir 8 Jahre auf, Verträge und geschäftliche Mails 6 Jahre, jeweils ab Ende des Jahres. Angaben ohne Abschluss löschen wir nach spätestens 12 Monaten.</p>
      <p><b>Auf Ihrem Gerät.</b> Ihr Browser merkt sich Ihre Auswahl und Ihre Eingaben bis zu 14 Tage, damit nichts verloren geht. Das ist für die Funktion der Seite nötig. Nach der Unterschrift bleiben davon nur Firma, Name, E-Mail und Ihr Paket. Wir setzen keine Cookies und kein Tracking ein. Die Schriften kommen von dieser Seite selbst, nicht von fremden Servern.</p>
      <p><b>Ihre Rechte.</b> Sie können Auskunft verlangen und Ihre Angaben berichtigen, löschen oder einschränken lassen, soweit wir sie nicht von Gesetzes wegen aufbewahren müssen. Sie können Ihre Daten in einem gängigen Format bekommen (Datenübertragbarkeit). Der Verarbeitung aus berechtigtem Interesse, etwa dem Zählen der Aufrufe, können Sie jederzeit widersprechen (Art. 21 DSGVO). Schreiben Sie uns dazu${mail?' an '+mail:''}. Beschweren können Sie sich beim Hessischen Beauftragten für Datenschutz und Informationsfreiheit.</p>
      <button type="button" id="rechtWeg">Eingaben auf diesem Gerät löschen</button></details>`; }
  // Weite Wege (über mehrere Bildschirme) nicht als Schnelldurchlauf: erst ohne Animation nah heran, dann das letzte Stück weich
  function zu(id,sofort){ const el=document.getElementById(id); if(!el)return; const kopf=(($('.top')||{}).offsetHeight)||60;
    const ziel=Math.max(0,el.getBoundingClientRect().top+window.scrollY-kopf+2), weg=ziel-window.scrollY;
    if(sofort||sanft()==='auto')window.scrollTo({top:ziel,behavior:'instant'});
    else if(Math.abs(weg)>innerHeight*1.5){ window.scrollTo({top:Math.max(0,ziel-(weg>0?1:-1)*innerHeight*.6),behavior:'instant'}); requestAnimationFrame(()=>window.scrollTo({top:ziel,behavior:'smooth'})); }
    else window.scrollTo({top:ziel,behavior:'smooth'});
    const h=el.querySelector('h2'); if(h){ if(!h.hasAttribute('tabindex'))h.setAttribute('tabindex','-1'); setTimeout(()=>{ try{ h.focus({preventScroll:true}); }catch(e){} },sofort?0:450); } }
  // Nach einem Tipp baut sich die Seite neu auf; der angetippte Knopf bleibt dabei unter dem Finger
  let angetippt=null;
  function mitAnker(fn,knopf){ const a=knopf||angetippt||document.activeElement, q=v=>(window.CSS&&CSS.escape)?CSS.escape(v):String(v).replace(/"/g,'');
    const sel=a&&a.dataset?(a.dataset.add?`[data-add="${q(a.dataset.add)}"][data-m="${q(a.dataset.m||'')}"]`:a.dataset.tm?`[data-tm="${q(a.dataset.tm)}"]`:null):null;
    const vor=sel?a.getBoundingClientRect().top:null; fn();
    if(sel){ const n=document.querySelector(sel); if(n){ const d=n.getBoundingClientRect().top-vor; if(Math.abs(d)>1)window.scrollTo({top:window.scrollY+d,behavior:'instant'}); } } }
  // Untere Leiste: Paket immer im Blick, sobald etwas drin ist (außer im Baukasten und Abschluss selbst)
  function leiste(){ let L0=$('#leiste'); if(!L0){ L0=document.createElement('div'); L0.id='leiste'; L0.className='leiste'; L0.setAttribute('role','region'); L0.setAttribute('aria-label','Ihr Paket');
      L0.innerHTML='<div class="lz"><b id="lzS"></b><small id="lzN"></small></div><button type="button">Zum Paket</button>'; document.body.appendChild(L0); L0.querySelector('button').onclick=()=>zu('baukasten'); }
    const c=S.korb.length?rechnung():null;
    if(c){ const n=S.korb.filter(e=>e.key!=='spende').length, txt=c.netto_jahr+c.einmalig>0?eur(c.netto_jahr+c.einmalig)+(S.start==='naechste'||spaeterBeginn()?' netto in der ersten Saison':' netto in dieser Saison'):'Ihre Spende: '+eur(c.spende), lz=$('#lzS');
      if(lz.textContent&&lz.textContent!==txt){ L0.classList.remove('neu'); void L0.offsetWidth; L0.classList.add('neu'); }
      lz.textContent=txt; $('#lzN').textContent=[n?n+(n===1?' Leistung':' Leistungen')+(c.netto_jahr>0&&c.einmalig>0?', davon '+eur(c.einmalig)+' einmalig':''):'',c.spende&&n?'dazu '+eur(c.spende)+' Spende':''].filter(Boolean).join(', '); }
    leisteZeigen(); }
  function leisteZeigen(){ const L0=$('#leiste'); if(!L0)return; const r=x=>x?x.getBoundingClientRect():null, rb=r($('#baukasten')), ra=r($('#abschluss'));
    const imBereich=(rb&&rb.top<innerHeight*.7&&rb.bottom>0)||(ra&&ra.top<innerHeight*.7), da=S.korb.length>0&&!imBereich&&!S.ergebnis; L0.classList.toggle('da',da); document.body.classList.toggle('leiste-da',da); }
  // Sanftes Einblenden beim Scrollen. Alles, was beim Laden schon im Bild ist, bleibt sofort sichtbar.
  let io=null;
  function beobachten(wo){ if(!('IntersectionObserver' in window)||matchMedia('(prefers-reduced-motion: reduce)').matches)return;
    if(!io){ document.body.classList.add('rv-an'); io=new IntersectionObserver(es=>es.forEach(e=>{ if(e.isIntersecting){ e.target.classList.add('da'); io.unobserve(e.target); } }),{rootMargin:'0px 0px -8% 0px'}); }
    (wo||document).querySelectorAll('.rv:not(.da)').forEach(el=>{
      const r=el.getBoundingClientRect(); if(r.top<innerHeight&&r.bottom>0){ el.classList.add('da'); } else io.observe(el); }); }
  function fortschritt(){ const p=$('#prog'); if(!p)return; if(fertig()){ p.style.transform='scaleX(1)'; if(!p.dataset.weg){ p.dataset.weg='1'; setTimeout(()=>{ p.hidden=true; },700); } return; } p.hidden=false; delete p.dataset.weg; const h=document.documentElement.scrollHeight-innerHeight; p.style.transform='scaleX('+(h>0?Math.min(1,scrollY/h):0)+')'; }
  function kopfZahl(plopp){ leiste(); merken(); const n=$('#kopfN'); if(!n)return; const b=n.closest('.top-b'), fertig=S.ergebnis&&S.ergebnis.art!=='angebot'&&S.ergebnis.art!=='warteliste';
    const nL=S.korb.filter(e=>e.key!=='spende').length, sp=fertig&&S.ergebnis.art==='spende'; n.textContent=nL||(S.korb.length?'♥':'0'); b.hidden=!S.korb.length&&!fertig; $('#kopfT').innerHTML=fertig?(sp?'✓ Danke':fest(S.ergebnis)?'✓ Partner':'✓ Unterschrift da'):'<span class="ihr">Ihr </span>Paket'; n.hidden=!!fertig; b.dataset.zu=fertig?'abschluss':'baukasten';
    b.setAttribute('aria-label',fertig?(sp?'Danke, zu Ihrer Spende':'Partner, zu Ihrem Vertrag'):'Ihr Paket, '+(nL===1?'1 Leistung':nL+' Leistungen'));
    if(plopp){ b.classList.remove('plopp'); void b.offsetWidth; b.classList.add('plopp'); } }

  // ---------- Fragen ----------
  const frText=()=>fertig()?'Danke. Ihr Paket steht weiter unten.':S.antw&&(S.herz.size||S.ziele.size||S.budget)?(vorschlagListe().length?'Danke. Ihr Vorschlag steht direkt darunter.':'Danke. Unten finden Sie alles, was dazu passt.'):'';
  // Nach der letzten Frage (Betrag) gibt es einen Knopf zum nächsten Schritt
  function frNeu(){ const n=$('#frN'); if(!n)return; const t=frText(), vs=vorschlagListe().length>0, k=!fertig()&&S.budget?(vs?'vorschlag':'welten'):'', sig=t+'|'+k; if(n.dataset.sig===sig)return; n.dataset.sig=sig;
    n.innerHTML=t?`<span>${esc(t)}</span>${k?`<button type="button" class="textknopf fr-z" data-zu="${k}">${k==='vorschlag'?'Zum Vorschlag ↓':'Zu den Möglichkeiten ↓'}</button>`:''}`:''; }
  // Hero: vor der Unterschrift kennenlernen oder gleich zum Vorschlag, danach zuerst Vertrag und Überweisen
  function heroKnoepfe(){ const a=$('.runter:not(.leise)'), b=$('.runter.leise'); if(!a||!b)return; const da=dabeiArt(), set=(x,t,z)=>{ if(x.textContent!==t)x.textContent=t; x.dataset.zu=z; };
    // Nach der Unterschrift steht der gerahmte Knopf (Vertrag und Überweisen) vorn
    if(da){ if(a.previousElementSibling!==b)a.parentNode.insertBefore(b,a); set(b,da==='spende'?'Zu Ihrer Spende ↓':dabeiFest()?'Ihr Paket und Bankdaten ↓':'Ihr Paket und Vertrag ↓','abschluss'); set(a,'Unser Brief an Sie ↓','brief'); return; }
    if(b.previousElementSibling===a||a.nextElementSibling!==b)a.parentNode.insertBefore(a,b);
    const vs=!$('#vorschlag')||!$('#vorschlag').hidden; set(a,'Lernen Sie uns kennen ↓','brief'); set(b,vs?'Gleich zu Ihrem Vorschlag ↓':'Gleich zur Auswahl ↓',vs?'vorschlag':'wunsch'); }
  function fragenFertig(){ const wu=$('#wunsch'); if(wu)wu.hidden=fertig(); const pa=$('#passung'); if(pa)pa.hidden=fertig(); heroKnoepfe(); const F=$('#fragen'); if(F){ F.inert=fertig(); F.classList.toggle('eingefroren',fertig()); } frNeu(); }
  function fragen(){
    const F=$('#fragen'); if(!F)return;
    const chip=(g,k,t,on)=>`<button type="button" class="chip${on?' on':''}" data-g="${g}" data-k="${k}" ${g==='budget'?`role="radio" aria-checked="${on}" tabindex="${on||(!S.budget&&k===BUDGET[0][0])?0:-1}"`:`aria-pressed="${on}"`}>${esc(t)}</button>`;
    F.innerHTML=`
      <div><div class="fr-k"><b>Wen möchten Sie unterstützen?</b><small>Mehrere möglich</small></div>
        <div class="chips">${Object.keys(WELT).map(k=>chip('herz',k,WELT[k].k,S.herz.has(k))).join('')}</div></div>
      <div><div class="fr-k"><b>Was soll die Partnerschaft Ihnen bringen?</b><small>Mehrere möglich</small></div>
        <div class="chips">${ZIELE_PRAESI.map(k=>chip('ziel',k,ZIEL_TEXT[k],S.ziele.has(k))).join('')}</div></div>
      <div><div class="fr-k"><b id="frBudget">Mit welchem Betrag je Saison planen Sie ungefähr?</b><small>Ein grober Nettobetrag reicht. Daran richten wir unseren Vorschlag aus.</small></div>
        <div class="chips eins" role="radiogroup" aria-labelledby="frBudget">${BUDGET.map(([k,t])=>chip('budget',k,t,S.budget===k)).join('')}</div></div>`;
    fragenFertig();
    F.querySelectorAll('.chip').forEach(b=>b.onclick=()=>{ const g=b.dataset.g, k=b.dataset.k;
      if(g==='herz'){ S.herz.has(k)?S.herz.delete(k):S.herz.add(k); }
      else if(g==='ziel'){ S.ziele.has(k)?S.ziele.delete(k):S.ziele.add(k); }
      else S.budget=S.budget===k?'':k;
      S.antw=true;
      F.querySelectorAll('.chip').forEach(x=>{ const on=x.dataset.g==='herz'?S.herz.has(x.dataset.k):x.dataset.g==='ziel'?S.ziele.has(x.dataset.k):S.budget===x.dataset.k; x.classList.toggle('on',on); x.setAttribute(x.dataset.g==='budget'?'aria-checked':'aria-pressed',String(on));
        if(x.dataset.g==='budget')x.tabIndex=on||(!S.budget&&x.dataset.k===BUDGET[0][0])?0:-1; });
      tipp(); vorschlag(); welten(); frNeu(); merken(); });
    radioPfeile(F.querySelector('[role="radiogroup"]'));
  }

  // ---------- Bewertung und Vorschlag ----------
  function frei(l,team){ if(l.je_mannschaft){ const f=l.frei_je&&team?l.frei_je[team]:null, n=l.frei_je_naechste&&team?l.frei_je_naechste[team]:null; if(S.start==='naechste'&&n!=null)return n; if((S.saisons>1||S.auto)&&n!=null&&f!=null)return Math.min(f,n); return f==null?null:f; } if(S.start==='naechste'&&l.frei_naechste!=null)return l.frei_naechste; if((S.saisons>1||S.auto)&&l.frei_naechste!=null&&l.frei!=null)return Math.min(l.frei,l.frei_naechste); return l.frei; }
  function score(l){ let s=0; (l.ziele||[]).forEach(z=>{ if(S.ziele.has(z))s+=3; }); if(S.herz.has(l.bereich))s+=4; if((D.deck||{}).empfehlung===l.key)s+=5; if(l.art==='paket')s+=1; return s; }
  function rahmenCap(){ return (BUDGET.find(b=>b[0]===S.budget)||[0,0,1500])[2]; }
  function jahrespreis(l){ if(l.preis==null)return 0; return +l.preis; }
  function vorschlagListe(){
    if(!S.herz.size&&!S.ziele.size&&!S.budget&&!(D.deck||{}).empfehlung)return [];
    const cap=(BUDGET.find(b=>b[0]===S.budget)||[0,0,1500])[2];
    const kand=L.filter(l=>!['spende','sonstiges'].includes(l.art)&&l.preis!=null).map(l=>{ let team=null;
        if(l.je_mannschaft){ team=(l.frei_je&&l.frei_je[S.team]>0)?S.team:(M.find(m=>l.frei_je&&l.frei_je[m.id]>0)||{}).id; if(!team)return null; }
        else if(l.frei===0)return null;
        return {l,team,s:score(l)}; }).filter(x=>x&&x.s>0).sort((a,b)=>b.s-a.s||jahrespreis(b.l)-jahrespreis(a.l));
    const aus=[]; let summe=0, paket=false;
    // erst das Beste je Herzensbereich, dann nach Punkten auffüllen
    // Unsere Empfehlung aus dem Deck zuerst, dann je Herzensbereich das Beste, das in den Rahmen passt, dann nach Punkten
    const emp=kand.find(k=>k.l.key===(D.deck||{}).empfehlung&&jahrespreis(k.l)<=cap*1.15);
    const reihe=[...[...S.herz].map(w=>kand.find(k=>k.l.bereich===w&&jahrespreis(k.l)<=cap*1.15)),emp].filter(Boolean).filter((k,i,a)=>a.indexOf(k)===i); kand.forEach(k=>{ if(!reihe.includes(k))reihe.push(k); });
    const ziel=cap*0.75;
    for(const k of reihe){ if(aus.length>=3)break; if(k.l.art==='paket'&&paket)continue; const p=jahrespreis(k.l); if(aus.length&&summe>=ziel)break; if(summe+p>cap&&aus.length)continue; if(p>cap*1.15)continue;
      aus.push(k); summe+=p; if(k.l.art==='paket')paket=true; }
    return aus;
  }
  const imKorb=(key,m)=>S.korb.some(e=>e.key===key&&(e.mannschaft||null)===(m||null));
  function vorschlag(){
    const V=$('#vorschlag'); if(!V)return; const vl=fertig()?[]:vorschlagListe();
    if(!vl.length){ V.innerHTML=''; V.hidden=true; heroKnoepfe(); return; } V.hidden=false;
    const c=PLIB.rechnen(vl.map(k=>({key:k.l.key,menge:1,mannschaft:k.team||undefined})),L,S.saisons), mn=id=>(M.find(m=>m.id===id)||{}).name||'';
    const eigenesPaket=S.korb.some(e=>{ const x=lk(e.key); return x&&x.art==='paket'; });
    const alleDrin=vl.every(k=>imKorb(k.l.key,k.team)||(k.l.art==='paket'&&eigenesPaket))||(S.korb.some(e=>e.key!=='spende')&&vl.some(k=>imKorb(k.l.key,k.team))&&S.klein);
    const b=BUDGET.find(x=>x[0]===S.budget), rahmen=b&&!['offen','mehr'].includes(b[0])&&c.netto_jahr+c.einmalig<=b[2]?` Das passt netto in Ihren Rahmen von ${b[1]}.`:'';
    const teams=[...new Set(vl.filter(k=>k.team).map(k=>mn(k.team)))];
    const tid=(vl.find(k=>k.team)||{}).team, tri=lk('trikot_jugend'), trikotFrei=!!(tid&&tri&&tri.frei_je&&tri.frei_je[tid]>0);
    const trikotDrin=vl.some(k=>k.l.key==='trikot_jugend');
    const bezug=teams.length===1?`Damit stehen Sie hinter der ${nbsp(teams[0])}.${trikotFrei?(trikotDrin?' Sie sucht gerade einen Trikotpaten. Mit diesem Vorschlag wären Sie es. Ein Trikotsatz hält meist zwei bis drei Saisons, und so lange läuft Ihr Logo mit.':' Für sie suchen wir gerade noch einen Trikotpaten.'):''} `:'';
    const Vz=D.verein||{}, bande=(S.herz.has('erste')||S.herz.has('zweite'))&&vl.some(k=>['club','premium','p1896','bande_erste'].includes(k.l.key))?(Vz.heimspiele&&Vz.zuschauer?`Ihre Bande hängt bei allen ${Vz.heimspiele} Heimspielen der Ersten. Nach unserer Schätzung kommen im Schnitt rund ${Vz.zuschauer} Zuschauer.`:'Ihre Bande sieht jeder, der zu unseren Heimspielen kommt.'):'';
    // Bei einer Saison ohne Verlängerung kein „danach“, das nach stiller Verlängerung klingt. Bei einem Baustein steht der Preis schon in der Zeile.
    const einm=vl.filter(k=>!(k.l.einheit==='saison'&&['paket','flaeche','patenschaft'].includes(k.l.art))), nurTrikot=einm.length>0&&einm.every(k=>['trikot_jugend','aufwaerm_jugend'].includes(k.l.key));
    const B=n=>'<b>'+eur(n)+'</b>';   // Beträge kräftig, der Satz in Barlow
    const geld=vl.length===1?'':c.netto_jahr>0&&c.einmalig>0?(S.saisons>1||S.auto?`Im ersten Jahr ${B(c.netto_jahr+c.einmalig)} netto, danach ${B(c.netto_jahr)} je Saison.`
        :`${B(c.netto_jahr+c.einmalig)} netto für diese Saison, davon ${B(c.einmalig)} einmalig${nurTrikot?' für die Trikots':''}. Bleiben Sie danach dabei, sind es ${B(c.netto_jahr)} je Saison.`)
      :c.netto_jahr>0?`Zusammen ${B(c.netto_jahr)} netto je Saison.`:`Zusammen einmalig ${B(c.einmalig)} netto.`;
    const satz=(bezug+bande).trim();
    const leerHerz=[...S.herz].filter(w=>!vl.some(k=>k.l.bereich===w)&&!L.some(l=>l.bereich===w&&!['spende','sonstiges'].includes(l.art)&&l.preis!=null&&jahrespreis(l)<=((BUDGET.find(b=>b[0]===S.budget)||[0,0,1500])[2])*1.15&&(l.je_mannschaft?M.some(m=>l.frei_je&&l.frei_je[m.id]>0):l.frei!==0)));
    const klein=vl.length>1?vl.slice().sort((a,b)=>jahrespreis(a.l)-jahrespreis(b.l))[0]:null;
    V.innerHTML=`<div class="ww"><div class="notiz"><div class="k">Unser Vorschlag</div><h2 class="g">${S.antw?'Das würde<br><span>zu Ihnen passen.</span>':'Damit würden<br><span>wir anfangen.</span>'}</h2>
      <p class="lead">${S.antw&&(S.herz.size||S.ziele.size||S.budget)?'Das haben wir aus Ihren Antworten zusammengestellt. Übernehmen Sie es so, oder ändern Sie es weiter unten.':'Das empfehlen wir Ihnen für den Anfang. Sagen Sie uns oben, was Ihnen wichtig ist, dann passen wir den Vorschlag an.'}</p>
      <div class="vs">${vl.map(k=>`<div><b>${esc(k.l.titel)}</b><small>${esc(k.team?mn(k.team):k.l.kurz||'')}</small><em>${eur(k.l.preis)} <small>${esc(PLIB.EINHEIT[k.l.einheit]||'')}${vl.length===1?', netto':''}</small></em></div>`).join('')}</div>
      ${geld?`<p class="vs-geld">${geld}</p>`:''}${satz||rahmen?`<p class="vs-s">${(satz+rahmen).trim()}</p>`:''}${teams.length===1?`<p class="vs-n">Liegt Ihnen eine andere Mannschaft näher? <button type="button" class="textknopf" id="vsTeam">Andere Mannschaft wählen</button></p>`:''}${leerHerz.length?`<p class="vs-n">Für ${esc(leerHerz.map(w=>WELT_AKK[w]||WELT[w].k).join(' und '))} haben wir in Ihrem Rahmen gerade nichts Passendes. Eine Spende geht immer, Sie finden sie ganz unten im Paket.</p>`:''}
      ${alleDrin?`<button type="button" class="knopf-o" id="vsWeiter" style="margin-top:18px">Passt so. Weiter zum Abschluss</button>
        <button type="button" class="textknopf" id="vsUm">Erst noch umschauen</button><p class="vs-n">✓ Im Paket. Ändern können Sie alles bis zur Unterschrift.</p>${(()=>{ const b0=PLIB.rechnen(posOhneSpende(),L,1).netto_jahr; return b0>0?`<p class="vs-n">Laufzeit: ${S.saisons>1?S.saisons+' Saisons':'eine Saison'}. Bei 2 Saisons sparen Sie ${eur(Math.round(b0*2*.05*100)/100)}, bei 3 Saisons ${eur(Math.round(b0*3*.10*100)/100)}. <button type="button" class="textknopf" id="vsLz">Laufzeit ändern</button></p>`:''; })()}`
      :`<button type="button" class="knopf-o" id="vsUeb" style="margin-top:18px">Vorschlag übernehmen</button>${klein?`<p class="vs-klein">Lieber klein anfangen? ${esc(klein.l.titel)}${klein.team?', '+esc(mn(klein.team)):''}, ${eur(klein.l.preis)} ${esc(PLIB.EINHEIT[klein.l.einheit]||'')}. <button type="button" class="textknopf" id="vsKlein">Nur das übernehmen</button></p>`:''}`}</div></div>`;
    const ub=V.querySelector('#vsUeb'); if(ub)ub.onclick=()=>{ let behalten=false; vl.forEach(k=>{ if(k.l.art==='paket'&&eigenesPaket){ behalten=!S.korb.some(e=>e.key===k.l.key); return; } if(!imKorb(k.l.key,k.team))dazu(k.l.key,k.team,true); });
      tippStark(); if(behalten)toast('Ihr gewähltes Paket haben wir behalten. Den Rest des Vorschlags haben wir dazugelegt.'); else ansage('Im Paket. Sie können alles noch ändern.');
      ub.classList.add('geschafft'); ub.textContent='✓ Im Paket'; ub.style.pointerEvents='none'; kopfZahl(true);
      // Kurz ausblenden, neu aufbauen, wieder einblenden: kein harter Schnitt in der Karte
      setTimeout(()=>{ const nz=V.querySelector('.notiz'); if(nz){ nz.style.transition='opacity .16s'; nz.style.opacity='0'; }
        setTimeout(()=>{ welten(); korb(); kopfZahl(); vorschlag(); const n2=$('#vorschlag .notiz'); if(n2){ n2.style.opacity='0'; requestAnimationFrame(()=>{ n2.style.transition='opacity .16s'; n2.style.opacity='1'; }); } const w=$('#vsWeiter'); if(w)w.focus({preventScroll:true}); },160); },matchMedia('(prefers-reduced-motion: reduce)').matches?200:500); };
    const vk0=V.querySelector('#vsKlein'); if(vk0)vk0.onclick=()=>{ S.klein=true; if(!imKorb(klein.l.key,klein.team))dazu(klein.l.key,klein.team,true); tipp(14); toast('Im Paket. Sie können jederzeit mehr dazunehmen.'); welten(); korb(); kopfZahl(true); vorschlag(); };
    const vw=V.querySelector('#vsWeiter'); if(vw)vw.onclick=()=>zu('abschluss');
    const vz=V.querySelector('#vsLz'); if(vz)vz.onclick=()=>{ zu('laufzeit'); const o=$('#laufzeit .opt.on'); if(o)setTimeout(()=>o.focus({preventScroll:true}),450); };
    const vt=V.querySelector('#vsTeam'); if(vt)vt.onclick=()=>{ const t=$('.teams'); if(t){ const k=$('.top'); window.scrollTo({top:t.getBoundingClientRect().top+scrollY-((k&&k.offsetHeight)||60)-8,behavior:sanft()}); const on=t.querySelector('.tm.on'); if(on)setTimeout(()=>on.focus({preventScroll:true}),450); } };
    const vu=V.querySelector('#vsUm'); if(vu)vu.onclick=()=>zu('welten');
    heroKnoepfe(); frNeu();
  }

  // ---------- Welten ----------
  function weltReihenfolge(){ const alle=Object.keys(WELT).filter(w=>L.some(l=>l.bereich===w&&!['spende','sonstiges'].includes(l.art)));
    const punkte=w=>(S.herz.has(w)?100:0)+L.filter(l=>l.bereich===w).reduce((a,l)=>a+(l.ziele||[]).filter(z=>S.ziele.has(z)).length*3+((D.deck||{}).empfehlung===l.key?5:0),0)+(w==='jugend'?0.5:0);
    return alle.sort((a,b)=>punkte(b)-punkte(a)); }
  function welten(){
    const W=$('#welten'); if(!W)return; const reihe=weltReihenfolge(), haupt=S.herz.size?reihe.filter(w=>S.herz.has(w)||S.offen.has(w)):reihe, rest=reihe.filter(w=>!haupt.includes(w));
    const vk=new Set(vorschlagListe().map(k=>k.l.key));
    // Fokus merken, damit Tastatur und VoiceOver nach dem Neuaufbau an derselben Stelle bleiben
    const a=document.activeElement; let merk=null;
    if(a&&W.contains(a)){ const q=v=>(window.CSS&&CSS.escape)?CSS.escape(v):v.replace(/"/g,'');
      if(a.dataset.add)merk=`[data-add="${q(a.dataset.add)}"][data-m="${q(a.dataset.m||'')}"]`; else if(a.dataset.tm)merk=`[data-tm="${q(a.dataset.tm)}"]`; else if(a.dataset.auf)merk=`#welt-${q(a.dataset.auf)} h2`; }
    if(io)W.querySelectorAll('.rv').forEach(el=>io.unobserve(el));
    // Fotos und Bilder der Welten beim Neuaufbau nicht neu laden: alte Elemente wieder einsetzen (sonst blitzt Safari kurz leer)
    const altB={}; W.querySelectorAll('.welt-bild img,svg.welt-art').forEach(el=>{ const k=el.tagName==='IMG'?el.getAttribute('src'):el.outerHTML; if(!altB[k])altB[k]=el; });
    W.innerHTML=haupt.map(w=>weltHtml(w,vk)).join('')+(rest.length?`<section class="sec blau"><div class="ww"><div class="k" style="color:var(--hb)">Weitere Bereiche</div>
      <h2 class="g" style="font-size:clamp(32px,6vw,48px)">Auch hier können Sie helfen.</h2>
      <div class="mehr">${rest.map(w=>{ const ps=L.filter(l=>l.bereich===w&&l.preis!=null&&!['spende','sonstiges'].includes(l.art)); return `<button type="button" class="mz" data-auf="${w}"><b>${esc(WELT[w].k)}</b><span>${esc(WELT[w].teaser||WELT[w].hand)} ${ps.length===1?'1 Möglichkeit':ps.length+' Möglichkeiten'}${ps.length?', ab '+eur(Math.min(...ps.map(l=>+l.preis))):''}</span></button>`; }).join('')}</div></div></section>`:'');
    W.querySelectorAll('.welt-bild img,svg.welt-art').forEach(el=>{ const k=el.tagName==='IMG'?el.getAttribute('src'):el.outerHTML, o=altB[k]; if(o&&o!==el&&(o.tagName!=='IMG'||o.complete)){ if(o.tagName==='IMG')o.setAttribute('style',el.getAttribute('style')||''); el.replaceWith(o); delete altB[k]; } });
    W.querySelectorAll('[data-auf]').forEach(b=>b.onclick=()=>{ const w=b.dataset.auf; S.offen.add(w); welten(); zu('welt-'+w,true); const s=$('#welt-'+w); if(s&&!matchMedia('(prefers-reduced-motion: reduce)').matches)s.classList.add('auf'); });
    W.querySelectorAll('[data-tm]').forEach(b=>b.onclick=()=>{ S.team=b.dataset.tm; tipp(); mitAnker(welten,b); merken(); });
    W.querySelectorAll('[data-alle]').forEach(b=>b.onclick=()=>{ S.alle.add(b.dataset.alle); welten(); const n=W.querySelector(`#welt-${b.dataset.alle} .zeilen .lk:nth-child(5) [data-add]`); if(n)n.focus({preventScroll:true}); });
    W.querySelectorAll('[data-add]').forEach(b=>b.onclick=()=>{ angetippt=b; klickLeistung(b.dataset.add,b.dataset.m||null,b.dataset.wie); angetippt=null; });
    beobachten(W); W.classList.toggle('eingefroren',fertig()); W.classList.toggle('zu',fertig()&&!S.alleAuf);
    [...W.children].forEach(x=>{ x.inert=fertig(); });
    if(merk){ const n=W.querySelector(merk); if(n){ if(n.tagName==='H2')n.setAttribute('tabindex','-1'); n.focus({preventScroll:true}); } }
  }
  function weltHtml(w,vk){
    const X=WELT[w], ls=L.filter(l=>l.bereich===w&&!['spende','sonstiges'].includes(l.art)&&l.preis!=null), tm=M.find(m=>m.id===S.team);
    const bild=X.bild?`<div class="welt-bild"><img src="${X.bild}" alt="" loading="lazy" decoding="async" width="1600" height="1067" style="object-position:${X.pos||'center'}"></div>`:'';
    const foto=X.foto?`<figure class="foto-k welt-foto"><img src="${X.foto}" alt="Kinder unserer Jugend beim Training" loading="lazy" style="object-position:${X.fpos||'center'}"><figcaption>${esc(X.fz||'')}</figcaption></figure>`:'';
    const hatJe=ls.some(l=>l.je_mannschaft);
    const sortiert=ls.slice().sort((a,b)=>(vk.has(b.key)?50:0)+score(b)-((vk.has(a.key)?50:0)+score(a))||ls.indexOf(a)-ls.indexOf(b));
    let inhalt;
    if(w==='verein'&&ls.some(l=>l.art==='paket')){
      // Die vier Partnerstufen als Treppe in den Farben aus dem Vereinsauftritt, darunter die übrigen Bausteine als ruhige Zeilen
      const st=ls.filter(l=>l.art==='paket').sort((a,b)=>(STUFE.indexOf(a.key)+1||9)-(STUFE.indexOf(b.key)+1||9)||+a.preis-+b.preis), uebrig=sortiert.filter(l=>l.art!=='paket');
      inhalt=`<div class="treppe">${st.map((l,i)=>karte(l,vk,tm,'stufe',i)).join('')}</div>${uebrig.length?`<div class="zeilen">${uebrig.map(l=>karte(l,vk,tm,'zeile')).join('')}</div>`:''}`;
    } else {
      const max=S.alle.has(w)||ls.length<=6?ls.length:5, zeigen=sortiert.slice(0,max), rest=ls.length-zeigen.length;
      inhalt=`<div class="lks">${zeigen.length?karte(zeigen[0],vk,tm,'gross'):''}${zeigen.length>1?`<div class="zeilen">${zeigen.slice(1).map(l=>karte(l,vk,tm,'zeile')).join('')}</div>`:''}</div>${rest>0?`<button type="button" class="zeig" data-alle="${w}">Alle ${ls.length} Möglichkeiten zeigen</button>`:''}`;
    }
    return `<section class="welt ${w}${X.foto?' mit-foto':''}" id="welt-${w}"><div class="welt-k">${bild}${X.art?ART[X.art]():''}<div class="welt-t ww" style="width:100%">
        ${X.etikett?`<div class="k etikett">${esc(X.etikett)}</div>`:`<div class="hand">${esc(X.hand)}</div>`}<h2>${esc(X.titel)}</h2><p>${esc(w==='verein'?vereinText():w==='erste'?X.text+sichtSatz():X.text)}</p></div>${foto}</div>
      <div class="welt-in"><div class="ww">
        ${hatJe&&M.length?`<div class="teams"><div class="teams-k"><b>Für welche Mannschaft?</b><small>Gern die Mannschaft, zu der Sie einen Bezug haben, etwa über Familie oder Mitarbeiter. Durchgestrichen heißt: schon vergeben.</small></div>
          <div class="tms" role="group" aria-label="Mannschaft wählen">${M.map(m=>{ const t=teamFrei(w,m.id), voll=t&&t.frei===0;
            return `<button type="button" class="tm${m.id===S.team?' on':''}${voll?' voll':''}" data-tm="${esc(m.id)}" aria-pressed="${m.id===S.team}" aria-label="${esc(m.name)}${voll?', vergeben':''}">${esc(m.kurz||m.id)}${voll?'<small>vergeben</small>':''}</button>`; }).join('')}</div></div>`:''}
        ${inhalt}</div></div></section>`;
  }
  function sichtSatz(){ const V=D.verein||{}; return V.heimspiele?` In einer Saison hat die Erste ${V.heimspiele} Heimspiele in der ${V.liga||'Kreisliga A'}.${V.zuschauer?` Zu jedem kommen nach unserer Schätzung rund ${V.zuschauer} Zuschauer.`:''}`:''; }
  function radioPfeile(rg){ if(!rg)return; rg.addEventListener('keydown',e=>{ const d={ArrowRight:1,ArrowDown:1,ArrowLeft:-1,ArrowUp:-1}[e.key]; if(!d)return; e.preventDefault();
      const bs=[...rg.querySelectorAll('[role="radio"]:not([disabled])')], i=bs.indexOf(document.activeElement), n=bs[(Math.max(0,i)+d+bs.length)%bs.length]; if(n){ n.focus(); if(n.getAttribute('aria-checked')!=='true')n.click(); } }); }
  function vereinText(){ const ps=STUFE.map(lk).filter(l=>l&&l.preis!=null&&l.einheit==='saison');
    if(ps.length!==4)return WELT.verein.text; const pr=ps.map(l=>eur(l.preis));
    return 'Vier Stufen, vom Einstieg bis zur Stufe 1896. Je nach Stufe gehören die Partnerwand, eine eigene Bande, Karten für die Heimspiele und die Treffen unserer Partner dazu. Die Preise stehen auf den Karten darunter, alle netto.'; }
  function karte(l,vk,tm,art,i){
    const team=l.je_mannschaft?S.team:null, f=frei(l,team), drin=imKorb(l.key,team), wl=S.wl.some(e=>e.key===l.key&&(e.mannschaft||null)===(team||null));
    const naechst=!l.je_mannschaft&&f===0&&l.frei_naechste>0, fuer=l.je_mannschaft&&tm?' für '+esc(tm.kurz):'';
    let fz=''; const maxMarke=art==='stufe'&&l.plaetze>1&&l.key==='premium'&&f!==0;
    if(f===0&&l.key==='p1896'&&D.exklusiv_vergeben)fz='<div class="lk-f aus"><i></i>Für Ihre Branche schon vergeben</div>';
    else if(f===0)fz=naechst?`<div class="lk-f eng"><i></i>Ab Saison ${saisonTxt(D.naechste_saison)} frei</div>`:`<div class="lk-f aus"><i></i>${l.je_mannschaft?'Für '+esc(tm?tm.kurz:'dieses Team')+' vergeben':'Derzeit vergeben'}</div>`;
    else if(maxMarke)fz='';   // der Stand steht schon in der Marke oben
    else if(f!=null&&l.plaetze>1&&(f<=3||f<l.plaetze/2))fz=`<div class="lk-f${f<=2?' eng':''}"><i></i>${f===1?'Nur noch ein Platz frei':`Noch ${f} von ${l.plaetze} frei`}${fuer}</div>`;
    else fz=l.je_mannschaft&&tm?`<div class="lk-f">Frei für die ${nbsp(esc(tm.name))}</div>`:'';
    const haupt=art==='gross'||art==='stufe';
    let knopf;
    if(drin)knopf=`<button type="button" class="lk-b" data-add="${l.key}" data-m="${esc(team||'')}" data-wie="weg" aria-pressed="true">✓ Im Paket</button>`;
    else if(f===0&&naechst)knopf=`<button type="button" class="lk-b" data-add="${l.key}" data-m="" data-wie="naechste">Ab ${saisonTxt(D.naechste_saison)} sichern</button>`;
    else if(f===0)knopf=`<button type="button" class="lk-b" data-add="${l.key}" data-m="${esc(team||'')}" data-wie="wl" aria-pressed="${wl}">${wl?'✓ Vorgemerkt':'Vormerken'}</button>`;
    else knopf=`<button type="button" class="lk-b${art==='gross'&&!S.korb.length&&(vk.has(l.key)||l.preis==null||+l.preis<=rahmenCap()*1.15)?' p':''}" data-add="${l.key}" data-m="${esc(team||'')}" data-wie="dazu" aria-pressed="false">Ins Paket</button>`;
    const antw=S.antw&&(S.herz.size||S.ziele.size||S.budget);   // vorbelegte Interessen aus dem Termin sind noch keine Antwort
    const tag=vk.has(l.key)&&antw?'<span class="lk-tag">Passt zu Ihnen</span>':vk.has(l.key)||(D.deck||{}).empfehlung===l.key?'<span class="lk-tag b">Unsere Empfehlung</span>':'';
    const preis=`<div class="lk-p"><b>${eur(l.preis)}</b><span>${esc(PLIB.EINHEIT[l.einheit]||'')}${l.preis!=null?', netto':''}${l.je_mannschaft&&tm?', '+esc(tm.name):''}</span></div>`;
    const kl=['lk',art,art==='stufe'?l.key:'',drin?'drin':'',drin&&S.neu===l.key+'|'+(team||'')?'neu':'',f===0?'voll':''].filter(Boolean).join(' ');
    if(art==='zeile')return `<article class="${kl}"><div class="lk-z1"><div class="lk-n">${esc(l.titel)}</div>${preis}</div>${tag}<p class="lk-x">${esc(l.text||'')}</p><div class="lk-z2">${fz}${knopf}</div></article>`;
    return `<article class="${kl}">${art==='stufe'?`<span class="gz" aria-hidden="true">0${(i||0)+1}</span>${maxMarke?(()=>{ const eng=f!=null&&(f<=3||f<l.plaetze/2); return `<span class="max${eng&&f<4?' eng':''}">${eng?(f===1?'Nur noch ein Platz frei':`Noch ${f} von ${l.plaetze} frei`):`Höchstens ${l.plaetze} Partner`}</span>`; })():''}${l.key==='p1896'?'<span class="stp">Branchenexklusiv</span>':''}`:''}${tag}<div class="lk-n">${esc(l.titel)}</div>${l.kurz&&haupt?`<div class="lk-h">${esc(l.kurz)}</div>`:''}
      <p class="lk-x">${esc(l.text||'')}</p>${preis}${fz}${knopf}</article>`;
  }
  function dazu(key,mannschaft,still,naechste){ const l=lk(key); if(!l)return;
    if(l.art==='paket')S.korb=S.korb.filter(e=>{ const x=lk(e.key); const raus=x&&x.art==='paket'; if(raus&&!still)toast('Es geht immer nur eine Partnerstufe. Statt '+x.titel+' ist jetzt '+l.titel+' in Ihrem Paket.'); return !raus; });
    const m=l.je_mannschaft?(mannschaft||S.team):null; if(imKorb(key,m))return;
    S.korb.push({id:++uid,key,mannschaft:m,menge:1,preis:null,text:'',naechste:!!naechste}); }
  function klickLeistung(key,m,wie){ m=m||null;
    if(wie==='weg'){ S.korb=S.korb.filter(e=>!(e.key===key&&(e.mannschaft||null)===m)); if(S.start==='naechste'&&!S.startWahl&&!S.korb.some(e=>e.naechste)){ S.start='jetzt'; } }
    else if(wie==='wl'){ const i=S.wl.findIndex(e=>e.key===key&&(e.mannschaft||null)===m); if(i>=0)S.wl.splice(i,1); else { S.wl.push({key,mannschaft:m}); tipp(12); toast('Vorgemerkt. Damit wir Sie erreichen, brauchen wir unten nur Ihren Namen und Ihre Mail.'); } }
    else if(wie==='naechste'){ dazu(key,null,false,true); tipp(12); if(S.start!=='naechste'){ S.start='naechste'; toast('Ihr ganzes Paket startet damit zur Saison '+saisonTxt(D.naechste_saison)+'.'); } }
    else { dazu(key,m); tippStark(12); S.neu=key+'|'+(lk(key)&&lk(key).je_mannschaft?(m||S.team||''):''); }
    mitAnker(()=>{ welten(); S.neu=null; vorschlag(); korb(); }); kopfZahl(wie!=='weg'&&wie!=='wl'); }

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
    if(sonder)setTimeout(()=>toast('Ihr Paket weicht jetzt vom Angebot ab. Es gelten die Preise von dieser Seite.'),300); }
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
        ${c.spende?`<div class="sp-z2"><span>Ihre Spende, getrennt abgerechnet und ohne Umsatzsteuer</span><b>${eur(c.spende,true)}</b></div>`:''}
        <small>Preise netto${ust()>0?', zuzüglich '+ust()+' % Umsatzsteuer':''}. Den Laufzeitvorteil gibt es auf Partnerstufen, Banden und Patenschaften, die je Saison berechnet werden.</small>`;
    const wb=$('#weiterBtn'); if(wb)wb.disabled=!S.korb.length;
    leiste(); }
  function korb(){
    const K=$('#korbIn'); if(!K)return; if(S.auto&&!fertig()){ const f0=fristDatum(rechnung()); if(f0&&f0<iso(new Date()))S.auto=false; } if(!fertig())angebotPruefen(); const c=rechnung(), mn=id=>(M.find(m=>m.id===id)||{}).name||id, V=D.verein||{};
    const bk=K.closest('.bk'); if(bk)bk.classList.toggle('fertig',fertig()); const bl=$('#bkLeer'); if(bl)bl.hidden=fertig()||S.korb.length>0;
    if(fertig()){ const R=S.ergebnis, ps=(R.positionen||[]).concat(R.spende?R.spende.positionen||[]:[]);
      const spP=ps.filter(p=>p.art==='spende'||p.key==='spende'), vP=ps.filter(p=>!spP.includes(p)), bis=(()=>{ try{ const e=ende(rechnungVertrag()); return e?datum(e):''; }catch(_){ return ''; } })(), spZw=(S.korb.find(e=>e.key==='spende')||{}).zweck,
        zeileP=p=>{ const sp=p.art==='spende'||p.key==='spende', w=wirkung(p, spZw); return `<div class="kp"><div class="kp-n"><b>${esc(sp?'Für '+zweckTxt(p.zweck||spZw):p.titel)}</b><small>${esc(sp?'einmalig':[p.mannschaft?mn(p.mannschaft):'',PLIB.EINHEIT[p.einheit]||'',p.einheit==='saison'&&bis?'bis '+bis:''].filter(Boolean).join(' · '))}</small>${w?`<span class="kp-w">${esc(w)}</span>`:''}</div><div class="kp-p">${eur(p.summe||0,true)}</div></div>`; };
      const kl=R.art!=='spende'&&Array.isArray(R.klauseln)?R.klauseln:[];
      const amU=datum(R.unterschrieben_am||R.am||(R.rechnung||{}).datum||iso(new Date()));
      K.innerHTML=`<div class="k ok">${R.art==='spende'?'Zugesagt am '+amU:'Ihr Paket'}</div><h2 class="g zwei">${R.art==='spende'?'Ihre Spende<br><span>ist zugesagt.</span>':fest(R)?'Damit sind<br><span>Sie dabei.</span>':'Das haben Sie<br><span>unterschrieben.</span>'}</h2><p class="lead">${R.art==='spende'?'Danke. Freiwillig und unverbindlich, die Bankdaten finden Sie weiter unten.':`Am ${amU} unterschrieben, Vertrag ${esc(R.nr||'')}, alle Preise netto.`}</p>
        ${vP.length?`<div class="korb">${vP.map(zeileP).join('')}</div>`:R.art==='spende'&&spP.length?`<div class="korb">${spP.map(zeileP).join('')}</div>`:''}
        ${kl.length?bedingungenHtml(kl):''}
        ${spP.length&&R.art!=='spende'?`<div class="sp-block"><h3 class="sp-h">Und Ihre Spende</h3><div class="korb">${spP.map(zeileP).join('')}</div><p class="kp-summe" style="font-weight:500">Freiwillig und unverbindlich, getrennt vom Vertrag. Danke!</p></div>`:''}
        <p class="frage-k">Haben Sie Fragen? ${V.email?`Schreiben Sie uns an <span class="sel">${esc(V.email)}</span>. Möchten Sie später etwas dazunehmen, schicken wir Ihnen gern einen Nachtrag.`:'Schreiben Sie uns. Möchten Sie später etwas dazunehmen, schicken wir Ihnen gern einen Nachtrag.'}</p>
        <button type="button" class="textknopf" id="alleAuf" aria-expanded="${!!S.alleAuf}" aria-controls="welten">${S.alleAuf?'Übersicht zuklappen':'Alles ansehen, was es bei uns gibt'}</button>`;
      const aa=K.querySelector('#alleAuf'); if(aa)aa.onclick=()=>{ S.alleAuf=!S.alleAuf; aa.setAttribute('aria-expanded',String(S.alleAuf)); aa.textContent=S.alleAuf?'Übersicht zuklappen':'Alles ansehen, was es bei uns gibt'; welten(); if(S.alleAuf)setTimeout(()=>zu('welten'),60); };
      // Abrechnung als ruhige Karte (am Desktop rechts daneben), ohne Knopf
      const Z=$('#summe'); if(Z){ const rg=R.rechnung, ein=vP.filter(p=>p.einheit!=='saison').reduce((a,p)=>a+(+p.summe||0),0), nj=R.netto_jahr!=null?+R.netto_jahr:vP.filter(p=>p.einheit==='saison').reduce((a,p)=>a+(+p.summe||0),0), u=R.ust_satz!=null?+R.ust_satz:ust();
        const zl=(a,b,cl)=>`<div${cl?` class="${cl}"`:''}><span>${a}</span><span>${b}</span></div>`;
        Z.hidden=false; Z.classList.add('abr');
        Z.innerHTML=R.art==='spende'?`${zl('Spendenzusage',esc(R.nr||''),'z')}<div class="s"><span class="s-l">Ihre Spende</span><b>${eur(rg?rg.brutto:c.spende,true)}</b></div><small>Ohne Umsatzsteuer. Die Bankdaten finden Sie weiter unten.</small>`
          :`${zl('Vertrag',esc(R.nr||''))}${nj>0&&(R.ende||ende(rechnungVertrag()))?zl('Laufzeit',datum(R.beginn||beginn())+' bis '+datum(R.ende||ende(rechnungVertrag()))):''}
          <small>${rg?(rg.status==='bezahlt'?'Ihre Rechnung ist bezahlt. Danke.':'Rechnung und Bankdaten stehen gleich darunter.'):fest(R)?'Die erste Rechnung kommt in den nächsten Tagen per Mail.':'Die Bankdaten stehen auf der Rechnung, die mit dem gegengezeichneten Vertrag kommt.'}</small>`;
        // Das Foto passt zur Buchung: Stufe, Bande oder Erste zeigt die Erste, sonst die Jugend (anderer Ausschnitt als oben im Hero)
        const jugB=vP.some(p=>p.mannschaft||/^(trikot_jugend|aufwaerm_jugend|baelle_jugend|trainer_jugend|team_jugend|zeltlager|ferienspiele|turnier)/.test(p.key)), ersteB=!jugB&&vP.some(p=>/^(supporter|club|premium|p1896|bande_|brust_|aermel_|matchball|sotd|tor_monat)/.test(p.key)), alt0=Z.parentNode.querySelector('.polaroid');
        const pol=ersteB?'<figure class="polaroid"><img src="partner/hero.jpg" alt="Die Erste des SV/BSC Mörlenbach" loading="lazy" decoding="async" style="object-position:center 40%"><figcaption>Unsere Erste.</figcaption></figure>'
          :'<figure class="polaroid"><img src="partner/jugend.jpg" alt="Jugendspieler des SV/BSC Mörlenbach" loading="lazy" decoding="async" style="object-position:center 80%"><figcaption>Unsere Jugend.</figcaption></figure>';
        if(!alt0)Z.insertAdjacentHTML('afterend',pol); else if(alt0.querySelector('img').getAttribute('src')!==(ersteB?'partner/hero.jpg':'partner/jugend.jpg'))alt0.outerHTML=pol; }
      const W0=$('#korbWeiter'); if(W0)W0.hidden=true; return; }
    { const W0=$('#korbWeiter'); if(W0)W0.hidden=!S.korb.length; const pf=$('.bk-r .polaroid'); if(pf)pf.remove(); }
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
    const basis=PLIB.rechnen(posOhneSpende(),L,1).netto_jahr, spar=n=>basis>0?' Sie sparen '+eur(Math.round(basis*n*(n>=3?.10:.05)*100)/100).replace(' ','\u00a0')+'.':'', fd=fristDatum(c), fristVorbei=!!(fd&&fd<iso(new Date())), en=ende(c), endeTxt=datum(en||endeNach(S.saisons));
    const spOffen=!!sp||leer||S.spendeAuf;
    K.innerHTML=`<div class="k ok">Zusammenstellen</div><h2 class="g zwei">${leer&&!sp?'Noch ist Ihr<br><span>Paket leer.</span>':'Ihre<br><span>Auswahl.</span>'}</h2>
      <p class="lead">${leer&&!sp?(fein()?'Tippen':'Klicken')+' Sie oben bei einer Leistung auf „Ins Paket“'+(vorschlagListe().length?' oder übernehmen Sie unseren Vorschlag':'')+'. Oder helfen Sie einfach mit einer Spende, ganz unten.':'Hier steht alles, was Sie oben ausgewählt haben. Legen Sie noch die Laufzeit fest. Wenn Sie mögen, kommt eine Spende dazu.'}</p>
      ${leer?'':`<div class="korb">${S.korb.filter(e=>e.key!=='spende').map(zeile).join('')}</div>`}
      ${S.wl.length?`<p class="wl-n">Vorgemerkt: ${esc(S.wl.map(w=>(lk(w.key)||{}).titel+(w.mannschaft?' ('+mn(w.mannschaft)+')':'')).join(', '))}</p>`:''}
      ${TV()?`<div class="sonst" id="sonst"><label>Sonstiges, im Termin vereinbart<input id="soT" maxlength="80" placeholder="z. B. Vereinsheim-Abend" enterkeyhint="next"></label><label>Preis netto<input id="soP" type="text" inputmode="decimal" enterkeyhint="done"></label><button type="button" id="soAdd">Dazu</button></div>`:''}
      ${c.netto_jahr>0?`<div class="unter" id="laufzeit"><div class="k" id="lzK">Laufzeit</div><div class="opts drei" role="radiogroup" aria-labelledby="lzK">${[[1,'1 Saison',S.auto?'Bis '+datum(endeNach(1))+', danach jedes Jahr neu.':'Endet am '+datum(endeNach(1))+' von selbst.'],[2,'2 Saisons','Preis fest bis '+datum(endeNach(2))+'.'+spar(2)],[3,'3 Saisons','Platz und Preis drei Saisons sicher.'+spar(3)]].map(([n,t,s])=>`<button type="button" class="opt${S.saisons===n?' on':''}" data-sa="${n}" role="radio" aria-checked="${S.saisons===n}" tabindex="${S.saisons===n?0:-1}"><b>${t}</b><small>${s}</small></button>`).join('')}</div>
        <div class="opts" role="radiogroup" aria-label="Start">${[['jetzt','Ab sofort','Gleich los, bis zum '+datum((+String(D.saison).slice(0,4)+S.saisons)+'-06-30')+'.'],['naechste','Ab Saison '+saisonTxt(D.naechste_saison),'Los geht es am '+datum(String(D.naechste_saison).slice(0,10))+'. Zahlen müssen Sie erst zum Start.']].map(([k,t,s])=>{ const aus=k==='jetzt'&&naechsteDrin;
          return `<button type="button" class="opt${S.start===k?' on':''}" data-st="${k}" role="radio" aria-checked="${S.start===k}" tabindex="${S.start===k?0:-1}"${aus?' disabled':''}><b>${t}</b><small>${aus?'Ein Baustein ist erst ab '+saisonTxt(D.naechste_saison)+' frei':s}</small></button>`; }).join('')}</div>
        ${S.start==='jetzt'&&iso(new Date())>String(D.saison).slice(0,10)?`<p class="einmal lz-notiz">Sie zahlen die ganze Saison ${saisonTxt(D.saison)}, auch wenn sie schon läuft. Möchten Sie lieber mit einer neuen Saison anfangen? Dann wählen Sie oben „Ab Saison ${saisonTxt(D.naechste_saison)}“. Zahlen müssen Sie dann erst zum Start.${S.saisons===1&&basis>0?` Nehmen Sie zwei Saisons, sind Sie bis zum ${datum(endeNach(2))} dabei und sparen ${eur(Math.round(basis*2*.05*100)/100).replace(' ','\u00a0')}.`:''}</p>`:''}
        <button type="button" class="sw${S.auto?' on':''}${fristVorbei?' aus':''}" id="swAuto" role="switch" aria-checked="${S.auto}"${fristVorbei?' aria-disabled="true"':''}><span>Automatisch verlängern<small>${fristVorbei?`Bei diesem Start ist die Kündigungsfrist dieser Saison schon vorbei. Mit zwei Saisons oder dem Start zur nächsten Saison lässt sich die Verlängerung einschalten.`:S.auto?`An. ${S.saisons>1?'Danach verlängert sich der Vertrag um je eine Saison, dann zum Preis ohne Laufzeitvorteil.':'Verlängert sich um je eine Saison.'} Kündigen geht bis zum ${fd?datum(fd):'31.03.'}, ${V.email?'eine Mail an '+esc(V.email)+' genügt':'eine kurze Mail genügt'}.`:`Aus. Der Vertrag endet am ${endeTxt} von selbst.`}</small></span><span class="schalter" aria-hidden="true"><i></i></span></button></div>`:leer?'':`<div class="unter"><div class="k">Laufzeit</div><p class="einmal">Einmalige Leistung. Es gibt keine Laufzeit und nichts zu kündigen.</p></div>`}
      ${spOffen?'':`<div class="unter"><button type="button" class="textknopf" id="spAuf">Möchten Sie zusätzlich etwas ohne Gegenleistung geben? Spende hinzufügen</button></div>`}
      <div class="unter"${spOffen?'':' hidden'}><div class="k">Einfach helfen</div><div class="sp"><div style="font-size:16px;line-height:1.5">Für eine Spende gibt es keine Gegenleistung. Sie bestimmen, wofür wir das Geld einsetzen.</div>
        <div class="sp-b">${[50,100,250,500].map(b=>`<button type="button" data-sp="${b}" class="${sp&&+sp.preis===b?'on':''}" aria-pressed="${!!(sp&&+sp.preis===b)}">${b}\u00a0€</button>`).join('')}</div>
        <div class="sp-z"><input id="spBetrag" type="text" inputmode="decimal" enterkeyhint="done" placeholder="Eigener Betrag" value="${sp&&![50,100,250,500].includes(+sp.preis)?esc(String(sp.preis).replace('.',',')):''}" aria-label="Eigener Betrag in Euro">
          <select id="spZweck" aria-label="Zweck">${['Jugend','Zeltlager','Ferienspiele','Erste Mannschaft','Zweite Mannschaft','Verein'].map(z=>`<option${(sp?sp.zweck:S.spende.zweck)===z?' selected':''}>${z}</option>`).join('')}</select>
          ${sp?'<button type="button" class="kp-x" id="spWeg" style="margin-left:0">Spende entfernen</button>':''}</div></div></div>
      <details class="gut"><summary>Gut zu wissen: Steuern</summary><p>Eine Partnerschaft mit Gegenleistung ist für Ihren Betrieb in der Regel eine Betriebsausgabe. Die Umsatzsteuer auf unserer Rechnung können Sie in der Regel als Vorsteuer abziehen.${V.gemeinnuetzig?' Für eine Spende stellen wir Ihnen eine Zuwendungsbestätigung aus.':''} Was im Einzelfall gilt, sagt Ihnen Ihr Steuerberater.</p></details>`;
    const W=$('#korbWeiter'); if(W&&!W.firstChild&&S.korb.length){ W.innerHTML=`<button type="button" class="knopf-o" id="weiterBtn" style="margin-top:18px" data-zu="abschluss">Weiter zum Abschluss ↓</button>`; }
    K.querySelectorAll('.kp').forEach(z=>{ const e=S.korb.find(x=>x.id===+z.dataset.id); if(!e)return;
      z.querySelectorAll('[data-d]').forEach(b=>b.onclick=()=>{ e.menge=Math.max(1,Math.min(99,e.menge+(+b.dataset.d))); nachKorb(); });
      z.querySelector('[data-weg]').onclick=()=>{ const idx=S.korb.indexOf(e), st0=S.start, l0=lk(e.key)||{}; S.korb=S.korb.filter(x=>x!==e); if(S.start==='naechste'&&!S.startWahl&&!S.korb.some(x=>x.naechste))S.start='jetzt'; nachKorb(true);
        toastZurueck((l0.art==='sonstiges'&&e.text?e.text:l0.titel||'Die Leistung')+' ist aus Ihrem Paket raus.',()=>{ if(S.ergebnis||S.korb.includes(e)||imKorb(e.key,e.mannschaft)||(l0.art==='paket'&&S.korb.some(x=>(lk(x.key)||{}).art==='paket')))return; S.korb.splice(Math.min(idx,S.korb.length),0,e); S.start=st0; merken(); nachKorb(true); kopfZahl(); }); };
      const se=z.querySelector('[data-f="mannschaft"]'); if(se)se.onchange=()=>{ if(imKorb(e.key,se.value)){ se.value=e.mannschaft; return toast('Das ist für diese Mannschaft schon in Ihrem Paket.'); } e.mannschaft=se.value; nachKorb(true); };
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
      if(v>100000){ toast('Für Beträge über 100.000 € sprechen Sie uns bitte direkt an. Wir melden uns gern bei Ihnen.'); return; } const z=K.querySelector('#spZweck').value; S.spende.zweck=z; const e=S.korb.find(x=>x.key==='spende');
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
  function nachKorb(weltenAuch){ const k=$('#baukasten'), y0=k?k.getBoundingClientRect().top:0; korb(); if(weltenAuch){ welten(); vorschlag(); } kopfZahl();
    if(weltenAuch&&k){ const d=k.getBoundingClientRect().top-y0; if(Math.abs(d)>1)window.scrollTo({top:window.scrollY+d,behavior:'instant'}); } }

  // ---------- Abschluss ----------
  function klauseln(c){ const keys=PLIB.klauselnFuer(c.positionen,L,{auto:S.auto,saisons:S.saisons}), e=ende(c), fd=fristDatum(c);
    const w={zweck:ZWECK_VERTRAG[(S.korb.find(x=>x.key==='spende')||{}).zweck]||'seine Fußballabteilung',beginn:datum(beginn()),ende:e?datum(e):'Ende der Leistung',frist:3,frist_datum:fd?datum(fd):'drei Monate vor Ablauf',branche:(D.deck||{}).branche||'',mail:(D.verein||{}).email||'den Verein'};
    return keys.map(k=>{ const kk=k==='spende'&&(D.verein||{}).gemeinnuetzig===false?'spende_ohne':k, [titel,text]=PLIB.klauselText(kk,w); return {key:kk,titel,text}; }); }
  function sprechenHtml(){ const V=D.verein||{}; if(!V.email)return ''; const c=rechnung();
    const body='Guten Tag,\n\nich würde gern kurz über eine Partnerschaft sprechen.'+(c.positionen.length?'\n\nMein Paket bisher:\n'+c.positionen.map(p=>'· '+p.titel+(p.mannschaft?' ('+((M.find(m=>m.id===p.mannschaft)||{}).name||p.mannschaft)+')':'')).join('\n'):'')+'\n\nSie erreichen mich unter: \nAm besten erreichbar: \n\nViele Grüße\n'+(S.F.ansprech||'');
    const href='mailto:'+V.email+'?subject='+encodeURIComponent('Partnerschaft: '+(S.F.firma||(D.deck||{}).firma||''))+'&body='+encodeURIComponent(body);
    return `<p class="sprechen">Lieber erst kurz sprechen? <a href="${esc(href)}">Schicken Sie uns Ihre Nummer</a>, wir rufen Sie an. Oder schreiben Sie direkt an <span class="sel">${esc(V.email)}</span>.</p>`; }
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
    const fe=fest(a), satz=sp?`Über diesen Link haben Sie am ${datum(a.am)} eine Spende zugesagt (${esc(a.nr)}). Danke dafür.`:`Über diesen Link haben Sie am ${datum(a.am)} den Vertrag ${esc(a.nr)} unterschrieben.${fe?' Der Verein hat gegengezeichnet, der Vertrag ist geschlossen.':' Wir unterschreiben in den nächsten Tagen für den Verein, dann ist alles fest. Sie bekommen den Vertrag mit beiden Unterschriften und die erste Rechnung per Mail.'}`;
    const weiter=offen.length?(a.bank?` Hier finden Sie alles zum Überweisen, ${beleg} liegt auch in Ihrer Mail.`:` ${beleg==='die Rechnung'?'Die Rechnung':'Die Spendenzusage'} mit den Bankdaten liegt in Ihrer Mail.`):rs.length?' Alles ist bezahlt. Danke.':sp||fe?' Die Unterlagen haben wir Ihnen per Mail geschickt.':'';
    return `<div class="k" style="color:var(--hb)">Abschluss</div><h2 class="g">${sp?'Sie haben<br><span>schon geholfen.</span>':fe?'Sie sind<br><span>schon Partner.</span>':'Ihre Unterschrift<br><span>ist bei uns.</span>'}</h2>
      <p class="lead">${satz}${weiter}</p>
      ${offen.length&&a.bank?`<div class="schon-zahl">${zahlBlock(offen.map(rg=>({titel:rg.art==='spende'?'Spende':'Rechnung',rg})),a.bank)}</div>`:''}
      <p class="lead" style="font-size:16px;margin-top:22px">${sp?'Möchten Sie zusätzlich Partner werden? Dann stellen Sie hier Ihr Paket zusammen.':'Möchten Sie noch etwas ergänzen? Stellen Sie es hier zusammen, oder schreiben Sie uns kurz.'}</p>
      ${a.art!=='spende'&&Array.isArray(a.klauseln)&&a.klauseln.length?bedingungenHtml(a.klauseln):''}
      ${sprechenHtml()}<button type="button" class="textknopf" id="trotz">Noch etwas dazunehmen</button>`; }
  function abschluss(){
    const A=$('#abIn'); if(!A)return; seite();
    if(S.ergebnis)return danke();
    if(D.abschluss&&!T&&!S.trotz){ A.dataset.weg=''; A.innerHTML=schonPartnerHtml(); A.querySelector('#trotz').onclick=()=>{ S.trotz=true; S.idem=null; S.idemOffen=null; abschluss(); }; kopierBinden(A); return; }
    if(!S.korb.length&&S.wl.length)return vormerkenForm();
    if(!S.korb.length){ A.dataset.weg=''; A.innerHTML=`<div class="k" style="color:var(--hb)">Abschluss</div><h2 class="g">Erst das Paket,<br><span>dann die Unterschrift.</span></h2><p class="lead">Sobald Ihr Paket steht, können Sie es sich hier als Angebot per Mail schicken lassen oder gleich unterschreiben.</p>
      <button type="button" class="knopf-w" style="margin-top:22px" data-zu="welten">Paket zusammenstellen ↑</button>${sprechenHtml()}`; return; }
    const sp=nurSpende(), mitAdresse=sp||S.weg==='vertrag';
    if(A.querySelector('#abForm')&&A.dataset.weg===String(S.weg)&&A.dataset.sp===String(sp)){ vertragNeu(); const sp0=A.querySelector('.sprechen'); if(sp0)sp0.outerHTML=sprechenHtml(); return; }
    A.dataset.weg=String(S.weg); A.dataset.sp=String(sp);
    const wahl=sp?'':`<div class="wahl2" role="group" aria-label="Wie möchten Sie weitermachen?"><button type="button" data-weg="angebot" class="${S.weg==='angebot'?'on':''}" aria-pressed="${S.weg==='angebot'}"><b>Angebot per Mail</b><span>Ein unverbindliches Angebot als PDF mit allen Leistungen. Die Preise halten wir 14 Tage für Sie fest. Freie Plätze vergeben wir nach der Reihenfolge der Unterschriften. Nach ein paar Tagen melden wir uns kurz bei Ihnen.</span></button>
        <button type="button" data-weg="vertrag" class="haupt${S.weg==='vertrag'?' on':''}" aria-pressed="${S.weg==='vertrag'}"><b>Gleich unterschreiben</b><span>Der Vertrag ist fertig vorbereitet. Sie unterschreiben direkt hier. ${VS()?'Wir unterschreiben gleich mit, die Rechnung kommt per Mail.':'Sobald wir für den Verein auch unterschrieben haben, kommen Vertrag und erste Rechnung per Mail.'}</span></button></div>`;
    const form=(sp||S.weg)?`<form id="abForm" autocomplete="on" onsubmit="return false"><div class="felder">
        ${feldHtml('firma',sp?'Firma oder Name':'Unternehmen','text','organization',{cap:'words'})}${sp?'':'<p class="feld-tipp">Online unterschreiben ist für Unternehmen gedacht. Möchten Sie als Privatperson Partner werden, sprechen Sie uns gern direkt an.</p>'}
        <div class="feld-name"><label for="fAnsprech">Ihr Name</label><span style="display:flex;gap:6px"><select name="anrede" style="width:100px;flex:none" aria-label="Anrede"><option value="">Anrede</option>${['Frau','Herr'].map(a=>`<option${S.F.anrede===a?' selected':''}>${a}</option>`).join('')}</select><input name="ansprech" autocomplete="name" autocapitalize="words" autocorrect="off" spellcheck="false" enterkeyhint="next" maxlength="80" value="${esc(S.F.ansprech||'')}" placeholder="Vor- und Nachname" id="fAnsprech"></span></div>
        ${feldHtml('email','E-Mail','email','email',{ph:'name@firma.de',im:'email',cap:'off',aus:1,ek:mitAdresse?'next':'done'})}
        ${mitAdresse?`${feldHtml('telefon','Telefon (freiwillig)','tel','tel',{im:'tel'})}
        ${feldHtml('strasse','Straße und Hausnummer','text','address-line1',{cap:'words'})}
        <div class="plz-ort">${feldHtml('plz','PLZ','text','postal-code',{im:'numeric',max:5})}${feldHtml('ort','Ort','text','address-level2',{cap:'words',ek:sp?'done':'next'})}</div>
        ${sp?'':feldHtml('ustid','USt-IdNr. (freiwillig)','text','off',{cap:'characters',ek:'done',aus:1})}`:''}</div>
        <p class="ds">Ihre Angaben nutzen wir für Angebot, Vertrag, Rechnung und die Betreuung Ihrer Partnerschaft. Mehr dazu unter „Impressum und Datenschutz“ ganz unten.</p></form>`:'';
    A.innerHTML=`<div class="k" style="color:var(--hb)">Abschluss</div><h2 class="g">${sp?'Spende<br><span>zusagen.</span>':'Jetzt Partner<br><span>werden.</span>'}</h2>
      <p class="lead">${sp?'Tragen Sie kurz Ihre Daten ein. Danach bekommen Sie sofort die Zusage mit den Bankdaten zum Überweisen.':(S.F.email&&S.F.ansprech?(S.weg?'Ihre Angaben haben wir schon eingetragen, bitte prüfen Sie sie kurz.':'Wie möchten Sie weitermachen? Ihre Angaben haben wir schon eingetragen, Sie sehen sie gleich nach Ihrer Wahl.'):'Wie möchten Sie weitermachen? Für ein Angebot brauchen wir nur Ihren Namen und Ihre Mail. Zum Unterschreiben kommt noch Ihre Anschrift dazu.')}</p>
      ${wahl}${form}<div id="abWeiter"></div><div class="msg" id="abMsg" role="alert"></div>${sprechenHtml()}`;
    const fm=A.querySelector('#abForm');
    if(fm){ const upd=e=>{ if(e.target.name){ S.F[e.target.name]=e.target.value; if(e.target.name==='ort'&&e.type==='change'&&/^\d{5}\s/.test(S.F.ort||'')){ plzTrennen(); if(fm.elements.plz){ fm.elements.plz.value=S.F.plz; fm.elements.ort.value=S.F.ort; } } if(S.weg==='vertrag'||sp)vertragKopf();
        if(e.type==='input'&&S.zust&&['firma','strasse','plz','ort'].includes(e.target.name)){ S.zust=false; const z=$('#zust'); if(z){ const h=z.querySelector('.hak'); h.classList.remove('on'); h.textContent=''; z.setAttribute('aria-checked','false'); }
          const m=$('#abMsg2'); if(m){ m.classList.remove('err'); m.textContent='Sie haben die Angaben zu Ihrem Unternehmen geändert. Bitte bestätigen Sie den Haken noch einmal.'; } }
        merkenSpaeter(); } };
      fm.addEventListener('input',upd); fm.addEventListener('change',upd); formTasten(fm); }
    A.querySelectorAll('[data-weg]').forEach(b=>b.onclick=()=>{ const war=S.weg; S.weg=b.dataset.weg; abschluss(); tipp(); if(!war){ const fm0=$('#abForm'), f=fm0&&([...fm0.querySelectorAll('input[name=firma],input[name=ansprech],input[name=email],input[name=strasse],input[name=plz],input[name=ort]')].find(i=>!i.value.trim())||$('#vertrag')||fm0.querySelector('input')); if(f)setTimeout(()=>{ if(f.id==='vertrag'){ const k=$('.top'); let y=0, el=f; while(el){ y+=el.offsetTop; el=el.offsetParent; }   // ohne die Einblend-Bewegung des Blatts
          window.scrollTo({top:y-((k&&k.offsetHeight)||60)-12,behavior:sanft()}); } else (f.closest('label')||f).scrollIntoView({block:'center',behavior:sanft()}); },60); } });
    S.vmodus=null; vertragNeu();
  }
  let mT=0; const merkenSpaeter=()=>{ clearTimeout(mT); mT=setTimeout(merken,500); };
  function vormerkenForm(){ const A=$('#abIn'), mn=id=>(M.find(m=>m.id===id)||{}).name||id;
    A.dataset.weg='wl'; A.innerHTML=`<div class="k" style="color:var(--hb)">Vormerken</div><h2 class="g">Wir melden uns,<br><span>wenn es frei wird.</span></h2>
      <p class="lead">Vorgemerkt haben Sie: ${esc(S.wl.map(w=>(lk(w.key)||{}).titel+(w.mannschaft?' ('+mn(w.mannschaft)+')':'')).join(', '))}. Damit wir Sie erreichen, brauchen wir nur Ihren Namen und Ihre Mail.</p>
      <form id="abForm" autocomplete="on" onsubmit="return false"><div class="felder">${feldHtml('firma','Firma oder Name','text','organization',{cap:'words'})}${feldHtml('ansprech','Ihr Name','text','name',{cap:'words'})}${feldHtml('email','E-Mail','email','email',{ph:'name@firma.de',im:'email',cap:'off',ek:'done',aus:1})}</div>
      <p class="ds">Ihre Angaben nutzen wir nur, um Sie zu benachrichtigen. Mehr dazu unter „Impressum und Datenschutz“ ganz unten.</p></form>
      <button type="button" class="knopf-o" id="abGo" style="margin-top:22px">Vormerken lassen</button><div class="msg" id="abMsg" role="alert"></div>${sprechenHtml()}`;
    const fm=A.querySelector('#abForm'), upd=e=>{ if(e.target.name){ S.F[e.target.name]=e.target.value; merkenSpaeter(); } }; fm.addEventListener('input',upd); fm.addEventListener('change',upd); formTasten(fm);
    A.querySelector('#abGo').onclick=()=>senden('warteliste'); }
  // Einstieg mitten in der Saison: was berechnet wird und ab wann man etwas sieht (Bande und Logo erst nach Freigabe und Druck)
  function mittenSatz(c){ if(!(c.netto_jahr>0)||S.start==='naechste'||!(iso(new Date())>String(D.saison).slice(0,10)))return '';
    if(spaeterBeginn())return `Der Vertrag beginnt am ${datum(beginn())}. Berechnet wird die ganze Saison ${saisonTxt(D.saison)}.`;
    const bande=c.positionen.some(p=>/^(club|premium|p1896|bande_)/.test(p.key)), logo=c.positionen.some(p=>/^(supporter|brust_|aermel_|trikot_|aufwaerm_)/.test(p.key));
    const sicht=bande?' Ihre Bande hängt, sobald Sie den Entwurf freigegeben haben und sie gedruckt ist.':logo?' Ihr Logo erscheint, sobald Sie den Entwurf freigegeben haben.':'';
    return S.saisons>1?`Die erste Saison wird ganz berechnet, auch wenn sie schon läuft. Ihren Platz halten wir ab Ihrer Unterschrift für Sie frei.${sicht}`
      :`Sie steigen mitten in der Saison ein, berechnet wird die ganze Saison ${saisonTxt(D.saison)}. Ihren Platz halten wir ab Ihrer Unterschrift für Sie frei.${sicht}${S.angebot?'':' Lieber erst zur neuen Saison starten? Das stellen Sie im Paket unter Laufzeit um.'}`; }
  function vertragNeu(){
    const W=$('#abWeiter'); if(!W)return; const sp=nurSpende(), V=D.verein||{}, cAlle=rechnung(), c=sp?cAlle:rechnungVertrag();
    if(!sp&&S.weg==='angebot'){ if(S.vmodus!=='angebot'){ S.vmodus='angebot'; W.innerHTML=`<button type="button" class="knopf-o" id="abGo" style="margin-top:22px">Angebot an mich senden</button><p class="hinweis">Das unverbindliche Angebot kommt als PDF. Mit dem Link in der Mail kommen Sie hierher zurück und können unterschreiben, solange die Preise gelten.</p>`; W.querySelector('#abGo').onclick=()=>senden('angebot'); } return; }
    if(!sp&&S.weg!=='vertrag'){ S.vmodus=null; W.innerHTML=''; return; }
    const kl=sp?[]:klauseln(c), e=ende(c), vsig=JSON.stringify([sp,kl.map(k=>k.text),sp?posFuerServer():posOhneSpende(),S.saisons,S.start,S.auto]);
    // Nichts geändert: Unterschrift und Häkchen bleiben, wie sie sind
    if(S.vmodus==='vertrag'&&S.vsig===vsig&&W.querySelector('#vertrag')){ if(!sp)spendeHakenNeu(W); return; }
    const warSchon=S.vmodus==='vertrag'&&S.vsig&&S.vsig!==vsig&&(S.zust||S.befugt||S.sig.p);
    if(S.vsig!==vsig){ S.zust=false; S.befugt=false; S.spZust=false; } S.vsig=vsig; S.vmodus='vertrag'; S.neuHinweis=warSchon;
    const R=ersteRechnung(c), firma=S.F.firma||'Ihr Unternehmen', spBetrag=cAlle.spende;
    const mname=id=>nbsp((M.find(m=>m.id===id)||{}).name||id), fd=fristDatum(c);
    // Grundpreis ohne Laufzeitvorteil: gilt für jede Verlängerung (§ Laufzeit und Verlängerung)
    const b1=PLIB.rechnen(posOhneSpende(),L,1).netto_jahr, mailG=V.email?'eine Mail an '+V.email+' genügt':'eine Mail genügt', sj=saisonJahr();
    const folge=['','','Für die zweite Saison kommt Anfang Juli '+(sj+1)+' eine Rechnung','Für die zweite und dritte Saison kommt jeweils Anfang Juli eine Rechnung','Für die zweite bis vierte Saison kommt jeweils Anfang Juli eine Rechnung','Für die zweite bis fünfte Saison kommt jeweils Anfang Juli eine Rechnung'][Math.min(5,S.saisons)]||'';
    const kurzP=sp?[]:[VS()?'':'Mit Ihrer Unterschrift machen Sie uns ein verbindliches Angebot. Daran sind Sie vier Wochen gebunden. Meist unterschreiben wir für den Verein in wenigen Tagen, dann gilt der Vertrag. Haben wir nach vier Wochen nicht unterschrieben, sind Sie nicht mehr gebunden.',c.netto_jahr>0?(S.auto?`Der Vertrag läuft vom ${datum(beginn())} bis zum ${datum(e)}. Danach verlängert er sich um je eine Saison zu ${eur(b1,true)} netto. Kündigen geht bis zum ${fd?datum(fd):'31.03.'}, ${mailG}.`:`Der Vertrag läuft vom ${datum(beginn())} bis zum ${datum(e)} und endet dann von selbst.`):'Einmalige Leistung. Es gibt keine Laufzeit und nichts zu kündigen.',
      mittenSatz(c),
      R.netto>0?(eineRg(c)?'Ihre Rechnung':'Die erste Rechnung')+(VS()&&rgSofort()?` über ${eur(R.brutto,true)} kommt gleich per Mail und ist zahlbar bis zum ${datum(faelligAm())}.`:VS()?` über ${eur(R.brutto,true)} schicken wir Ihnen in den nächsten Tagen per Mail. Zahlbar ist sie 14 Tage nach Rechnungsdatum.`:` über ${eur(R.brutto,true)} kommt mit dem gegengezeichneten Vertrag per Mail und ist 14 Tage nach Rechnungsdatum zahlbar${spaeterBeginn()?', frühestens zum Beginn':''}.`)+(eineRg(c)?' Weitere Rechnungen gibt es nicht.':''):'',
      'Bevor etwas mit Ihrem Logo gedruckt wird, zeigen wir es Ihnen.'].filter(Boolean);
    const kurzHtml=kurzP.length?`<div class="vt-kurz"><b>Das Wichtigste in Kürze</b><ul>${kurzP.map(t=>`<li>${esc(t)}</li>`).join('')}</ul></div>`:'';
    const tab=c.positionen.map(p=>{ const l=lk(p.key)||{}; return `<div><span>${esc(p.titel)}${p.mannschaft?', '+esc(mname(p.mannschaft)):''}${p.menge>1?', Menge '+p.menge:''}${p.rabatt?', '+Math.round(p.rabatt*100)+' % Vorteil':''}${l.text&&!sp?`<small>${esc(l.text)}</small>`:''}</span><span>${eur(p.summe,true)}${p.einheit==='saison'?' / Saison':p.einheit==='einmalig'?' einmalig':''}</span></div>`; }).join('');
    W.innerHTML=`<div class="vertrag" id="vertrag"><div class="vt-k"><div><b>${sp?'Spendenzusage':'Partnervertrag'}</b><small>${sp?'':(e?`Laufzeit ${datum(beginn())} bis ${datum(e)}${S.auto?', verlängert sich automatisch':''}`:'Einmalige Leistungen')}</small></div><img src="${WAPPEN}" width="320" height="182" alt=""></div>
      ${warSchon?'<div class="vt-neu" role="status">Sie haben Ihr Paket geändert. Bitte sehen Sie sich den Vertrag noch einmal an und unterschreiben Sie neu.</div>':''}
      <div class="vt-p" id="vtKopf"></div>
      <div class="vt-tab">${tab}${c.netto_jahr>0&&!eineRg(c)?`<div class="s"><span>Je Saison netto</span><span>${eur(c.netto_jahr,true)}</span></div>`:''}<div class="s"><span>${sp?'Gesamt':c.netto_jahr>0?'Gesamt über die Laufzeit':'Gesamt'}</span><span>${eur(c.netto_gesamt+(sp?c.spende:0),true)}${!sp&&c.netto_gesamt&&ust()>0?' zuzüglich Umsatzsteuer':''}</span></div>
        ${!sp&&spBetrag?`<div class="sp-x"><span>${spXText(spBetrag)}</span></div>`:''}</div>
      ${kurzHtml}${kl.length?`<div class="vt-kl" aria-label="Vertragsbedingungen"><div class="vt-kl-k"><span>Bedingungen im Klartext</span><button type="button" id="klAlle">Alle aufklappen</button></div>${kl.map((k,i)=>`<details><summary><span class="h4">§ ${i+1} ${esc(k.titel)}</span></summary><p>${esc(k.text)}</p></details>`).join('')}</div>`:''}
      <div class="vt-u">
        ${sp?'':`${R.netto>0?`<p class="vt-brutto">${VS()?(eineRg(c)?'Ihre Rechnung':'Die erste Rechnung')+':':(eineRg(c)?'Nach unserer Unterschrift stellen wir Ihnen in Rechnung:':'Die erste Rechnung nach unserer Unterschrift:')} ${ust()>0?`${eur(R.netto,true)} netto und ${eur(R.ust,true)} Umsatzsteuer, zusammen <b>${eur(R.brutto,true)}</b>`:`<b>${eur(R.brutto,true)}</b>`}.${c.netto_jahr>0&&S.saisons>1?` ${folge} über ${eur(c.netto_jahr,true)} netto.`:''}${c.netto_jahr>0&&S.auto?(S.saisons>1?` Verlängert sich der Vertrag danach, gilt der Preis ohne Laufzeitvorteil, derzeit ${eur(b1,true)} netto je Saison.`:` Verlängert sich der Vertrag, kommt jeweils Anfang Juli eine Rechnung über ${eur(b1,true)} netto.`):''}</p>`:''}`}
        <button type="button" class="zust" id="zust" role="checkbox" aria-checked="${S.zust}"><span class="hak${S.zust?' on':''}" aria-hidden="true">${S.zust?'✓':''}</span><span id="zustT">${sp?'Ich sage diese Spende zu. Die Zusage ist freiwillig und unverbindlich.':`Ich schließe für ${esc(firma)} ab, darf dafür unterschreiben, habe den Vertrag gelesen und gebe dieses Angebot verbindlich ab.`}</span></button>
        ${!sp&&spBetrag?`<button type="button" class="zust" id="spZust" role="checkbox" aria-checked="${!!S.spZust}"><span class="hak${S.spZust?' on':''}" aria-hidden="true">${S.spZust?'✓':''}</span><span>Zusätzlich sage ich eine Spende über ${eur(spBetrag,true)} für ${esc(ZWECK_PARTNER[(S.korb.find(e=>e.key==='spende')||{}).zweck]||'den Verein')} zu, freiwillig und unverbindlich.</span></button><p class="sp-ohne"${S.spZust?' hidden':''}>Ohne diesen Haken unterschreiben Sie nur den Vertrag, die Spende lassen wir weg.</p>`:''}
        ${sp?'':`<div class="sigs"><div><div class="sig-l" id="sigLP"></div><div class="sig-w"><canvas class="sig" id="sigP" role="img" tabindex="-1" aria-label="Feld für Ihre Unterschrift. Ohne Finger oder Maus: Lieber den Namen tippen."></canvas></div>
            <div class="sig-f"><span id="sigHP">${fein()?'Mit dem Finger auf der Linie unterschreiben.':'Mit der Maus auf der Linie unterschreiben.'}</span><button type="button" data-sx="P">Löschen</button></div>
            <button type="button" class="textknopf klein" id="tippP">Lieber den Namen tippen</button><input class="sig-n" id="tippN" hidden maxlength="60" placeholder="Vor- und Nachname" aria-label="Name statt Unterschrift" autocapitalize="words" autocomplete="name" autocorrect="off" spellcheck="false" enterkeyhint="done"></div>
          ${VS()?`<div><div class="sig-l">Für den Verein, vertretungsberechtigt</div><div class="sig-w"><canvas class="sig" id="sigV" role="img" aria-label="Feld für die Unterschrift des Vereins"></canvas></div>
            <div class="sig-f"><span>${esc(V.name||'SV/BSC Mörlenbach')}</span><button type="button" data-sx="V">Löschen</button></div>
            <div class="sig-nf"><input class="sig-n" id="unterz" maxlength="120" value="${esc(S.unterzeichner)}" placeholder="Vor- und Nachname" aria-label="Name der Person, die für den Verein unterschreibt" autocapitalize="words" autocomplete="off" autocorrect="off" spellcheck="false" enterkeyhint="next">
            <input class="sig-n" id="unterzF" maxlength="120" value="${esc(S.funktionV)}" placeholder="Funktion, z. B. Vorsitzender" aria-label="Funktion der Person, die für den Verein unterschreibt" autocapitalize="sentences" autocomplete="off" autocorrect="off" spellcheck="false" enterkeyhint="done"></div></div>`:''}</div>`}
        ${sp||VS()?'':`<p class="vt-weiter">So geht es weiter: Wir unterschreiben in den nächsten Tagen für den Verein, dann ist der Vertrag geschlossen${c.positionen.some(p=>p.mannschaft)?', und die Mannschaft erfährt es beim nächsten Training':''}.</p>`}
        <button type="button" class="knopf-o" id="abGo" style="margin-top:16px">${sp?'Spende zusagen':VS()?'Vertrag schließen':'Verbindlich unterschreiben'}</button><div class="msg" id="abMsg2" role="alert"></div></div></div>
      ${sp||!VS()?'':'<p class="hinweis">Den Vertrag mit beiden Unterschriften bekommen Sie per Mail.</p>'}`;
    vertragKopf(); S.sig={p:false,v:false};
    const hak=(id,key)=>{ const b=W.querySelector(id); if(!b)return; b.onclick=()=>{ S[key]=!S[key]; const h=b.querySelector('.hak'); h.classList.toggle('on',S[key]); h.textContent=S[key]?'✓':''; b.setAttribute('aria-checked',String(S[key])); b.removeAttribute('aria-invalid'); if(key==='spZust'){ const o=W.querySelector('.sp-ohne'); if(o)o.hidden=!!S.spZust; } tipp(); }; };
    hak('#zust','zust'); hak('#spZust','spZust');
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
    const n=W.querySelector('#spZust'); if(n)n.onclick=()=>{ S.spZust=!S.spZust; const h=n.querySelector('.hak'); h.classList.toggle('on',S.spZust); h.textContent=S.spZust?'✓':''; n.setAttribute('aria-checked',String(S.spZust)); const o=W.querySelector('.sp-ohne'); if(o)o.hidden=!!S.spZust; tipp(); };
    const x=W.querySelector('.sp-x'); if(x){ x.hidden=!b; if(b)x.querySelector('span').textContent=spXText(b); } }
  const cAlleSpende=()=>rechnung().spende;
  // Desktop: das Paket läuft neben dem Vertrag mit
  function seite(){ const X=$('#abSeite'); if(!X)return; if(S.ergebnis||!S.korb.length){ X.innerHTML=''; X.hidden=true; return; } X.hidden=false;
    const c=rechnungVertrag(), R=ersteRechnung(c), sp=rechnung().spende, mn=id=>(M.find(m=>m.id===id)||{}).name||id, e=ende(c);
    X.innerHTML=`<div class="k">Ihr Paket</div><ul>${c.positionen.map(p=>`<li><span>${esc(p.titel)}${p.mannschaft?`<small>${esc(mn(p.mannschaft))}</small>`:''}</span><b>${eur(p.summe,true)}</b></li>`).join('')}${sp?`<li><span>Spende<small>getrennt vom Vertrag</small></span><b>${eur(sp,true)}</b></li>`:''}</ul>
      ${c.netto_jahr>0?`<p>Laufzeit ${datum(beginn())} bis ${datum(e)}${S.auto?', verlängert sich':''}</p>`:''}${R.netto>0?`<p class="s"><span>${eineRg(c)?'Rechnungsbetrag':'Erste Rechnung'}, netto</span><b>${eur(R.netto,true)}</b>${ust()>0?`<small>Mit Umsatzsteuer ${eur(R.brutto,true)}. Die ${eur(R.ust,true)} Umsatzsteuer können Sie in der Regel als Vorsteuer abziehen.</small>`:''}</p>`:''}
      <button type="button" class="textknopf" data-zu="baukasten">Paket ändern</button>`; }
  function spXText(b){ const g=(D.verein||{}).gemeinnuetzig; return `Dazu sagen Sie uns eine Spende über ${eur(b,true)} zu. Sie gehört nicht zu diesem Vertrag, ist freiwillig und unverbindlich und bekommt eine eigene Bestätigung.${g===true?' Die Zuwendungsbestätigung schicken wir Ihnen, sobald der Betrag da ist.':g===false?' Eine Zuwendungsbestätigung können wir dafür nicht ausstellen.':''}`; }
  function vertragKopf(){ const el=$('#vtKopf'); if(!el)return; const V=D.verein||{}, F=S.F;
    el.innerHTML=`<div><span>Verein</span>${esc(V.name||'SV/BSC Mörlenbach')}<br>${esc([V.strasse,V.ort].filter(Boolean).join(', '))}<br>vertreten durch den Vorstand${V.vorstand?' ('+esc(V.vorstand)+')':''}${V.vertreter?`<br>Ansprechpartner: ${esc(V.vertreter)}${V.vertreter_funktion?', '+esc(V.vertreter_funktion):''}`:''}</div>
      <div><span>${nurSpende()?'Spender':'Partner'}</span>${esc(F.firma||'…')}<br>${esc([nurSpende()?[F.anrede,F.ansprech].filter(Boolean).join(' '):'',F.strasse,/^\d{5}\s/.test(String(F.ort||'').trim())?String(F.ort).trim():[F.plz,F.ort].filter(Boolean).join(' ')].filter(Boolean).join(', '))}${(F.ansprech||'').trim()&&!nurSpende()?'<br>vertreten durch '+esc([F.anrede,F.ansprech.trim()].filter(Boolean).join(' ')):''}</div>`;
    const zt=$('#zustT'); if(zt&&!nurSpende())zt.textContent=`Ich schließe für ${F.firma||'Ihr Unternehmen'} ab, darf dafür unterschreiben, habe den Vertrag gelesen und gebe dieses Angebot verbindlich ab.`;
    const sl=$('#sigLP'); if(sl)sl.textContent=[(F.ansprech||'').trim()?(F.ansprech||'').trim()+' für '+(F.firma||'Ihr Unternehmen'):'Unterschrift für '+(F.firma||'Ihr Unternehmen'),datum(iso(new Date()))].join(', '); }

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
    if(k==='p'){ const h=$('#sigHP'); if(h)h.textContent=ok?(fein()?'✓ Ihre Unterschrift ist da. Zum Ändern auf Löschen tippen.':'✓ Ihre Unterschrift ist da. Zum Ändern auf Löschen klicken.'):fein()?'Mit dem Finger auf der Linie unterschreiben.':'Mit der Maus auf der Linie unterschreiben.'; const cv=P.cv; if(ok)cv.removeAttribute('aria-invalid'); } }
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
    if(T&&!token())return fehl('Ihre Anmeldung im Partner-Team ist abgelaufen. Bitte öffnen Sie kurz die App und tippen Sie dann hier noch einmal.');
    if(art!=='warteliste'&&!S.korb.length)return fehl('Bitte oben etwas auswählen.');
    if((F.firma||'').trim().length<2)return fehl('Bitte tragen Sie noch Firma oder Namen ein.',fe('firma'));
    if((art==='warteliste'||art==='vertrag')&&!(F.ansprech||'').trim())return fehl('Bitte tragen Sie noch Ihren Namen ein.',fe('ansprech'));
    if(!/^[^@\s]+@[^@\s]+\.[a-z]{2,}$/i.test((F.email||'').trim()))return fehl('Bitte prüfen Sie Ihre E-Mail-Adresse.',fe('email'));
    if(art!=='warteliste'&&S.korb.some(e=>{ const l=lk(e.key); return l&&(l.art==='spende'||l.art==='sonstiges'||l.preis==null)&&!(+e.preis>0); }))return fehl('Bitte einen Betrag für die Spende eintragen.','#spBetrag');
    if(art==='vertrag'||art==='spende'){
      if((F.strasse||'').trim().length<3)return fehl('Für Vertrag und Rechnung brauchen wir noch Ihre Straße und Hausnummer.',fe('strasse'));
      if(!/^\d{5}$/.test((F.plz||'').trim()))return fehl('Bitte tragen Sie Ihre Postleitzahl ein (fünf Ziffern).',fe('plz'));
      if((F.ort||'').trim().length<2)return fehl('Bitte tragen Sie noch Ihren Ort ein.',fe('ort'));
      if(!S.zust)return fehl(art==='spende'?'Bitte bestätigen Sie noch kurz Ihre Spende.':'Bitte bestätigen Sie noch kurz, dass Sie unterschreiben dürfen und den Vertrag gelesen haben.','#zust'); }
    if(art==='vertrag'){ if(!S.sig.p)return fehl('Es fehlt noch Ihre Unterschrift im Feld darüber.','#sigP'); if(VS()&&!S.sig.v)return fehl('Bitte auch für den Verein unterschreiben.','#sigV'); if(VS()&&String(S.unterzeichner||'').trim().length<3)return fehl('Bitte den Namen eintragen, wer für den Verein unterschreibt.','#unterz'); if(VS()&&String(S.funktionV||'').trim().length<3)return fehl('Bitte die Funktion eintragen, in der Sie für den Verein unterschreiben.','#unterzF'); }
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
      const ruhigM=matchMedia('(prefers-reduced-motion: reduce)').matches, A0=$('#abIn'); if(A0){ A0.classList.add('weg'); await new Promise(z=>setTimeout(z,ruhigM?140:160)); }
      danke(true); kopfZahl(); welten(); vorschlag(); korb(); fragenFertig(); briefUndBewegtNeu(); zuDanke(); setTimeout(()=>{ if(Math.abs(window.scrollY-(S.dankeY||0))<4)zuDanke(); },160); if(A0)requestAnimationFrame(()=>A0.classList.remove('weg'));
      if(!demo())freiHolen().catch(()=>{});
    }catch(e){
      if(e.netz&&S.idemJetzt&&S.idemJetzt.art===art){ S.idemOffen=Object.assign({zeit:Date.now()},S.idemJetzt); merken(); }
      if(e.netz)fehl(e.unklar?(art==='vertrag'?'Wir können gerade nicht erkennen, ob Ihre Unterschrift angekommen ist. Bitte ändern Sie nichts und tippen Sie in einer Minute noch einmal auf denselben Knopf. Es entsteht dabei kein zweiter Vertrag.':e.message):'Wir haben gerade keine Antwort bekommen. Ihre Angaben bleiben stehen. Bitte versuchen Sie es gleich noch einmal mit demselben Knopf, dann entsteht sicher nichts doppelt.');
      else if(/vergeben/.test(e.message)){ await freiHolen(); const war=korbPruefen(); S.vmodus=null; abschluss(); const m2=$(art==='vertrag'?'#abMsg2':'#abMsg')||$('#abMsg'); if(m2){ m2.textContent=war?'Eine Leistung aus Ihrem Paket ist inzwischen vergeben. Wir haben sie für Sie vorgemerkt. Der Rest Ihres Pakets steht, Sie können gleich unterschreiben.':e.message; m2.classList.add('err'); } }
      else fehl(e.message); }
    finally{ S.busy=false; if(btn.isConnected){ btn.classList.remove('laeuft','geschafft'); btn.removeAttribute('aria-busy'); btn.textContent=alt; } }
  }

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
        <p>${frist?`Bitte überweisen Sie bis zum ${datum(frist)}.`:'Überweisen Sie, wann es Ihnen passt.'} ${handy?'Tippen Sie auf Kopieren und fügen Sie die Angaben in Ihrer Banking-App ein.':'Scannen Sie den Girocode mit Ihrer Banking-App, Betrag und Zweck sind schon eingetragen.'}${rgs.length?' Oder geben Sie die Rechnung aus der Mail einfach an Ihre Buchhaltung weiter.':''}</p>
        <div class="kzs">${kopierZeile('Empfänger',bank.name,'',pr)}${kopierZeile('IBAN',String(bank.iban).replace(/\s/g,''),pr?bank.iban:PLIB.ibanSchoen(bank.iban),pr,'iban')}</div></div>
      ${teile.map(t=>{ const rg=t.rg, sp=rg.art==='spende', gc=pr?null:PLIB.girocode({name:bank.name,iban:bank.iban,bic:bank.bic,betrag:rg.brutto,zweck:rg.zweck});
        return `<div class="zahl-t"><div class="zahl-l"><div class="zahl-tt">${teile.length>1?t.titel:''} <small>${sp?'Spendenzusage '+esc(rg.nr):'Nr. '+esc(rg.nr)} vom ${datum(rg.datum||iso(new Date()))}</small></div>
          <div class="kzs">${kopierZeile('Betrag',(+rg.brutto).toFixed(2).replace('.',','),eur(rg.brutto,true),pr,'betrag')}${kopierZeile('Zweck',rg.zweck,'',pr)}</div>
          <p class="zahl-f">${sp?(teile.length>1?'Am einfachsten gleich nach der Rechnung, als zweite Überweisung.':'Freiwillig und unverbindlich.')+((D.verein||{}).gemeinnuetzig===true?' Die Zuwendungsbestätigung schicken wir, sobald der Betrag da ist.':''):(rg.netto!=null&&+rg.brutto>+rg.netto?`${eur(rg.netto,true)} netto und ${eur(Math.round((rg.brutto-rg.netto)*100)/100,true)} Umsatzsteuer.`:'')+(rgs.length>1?' Zahlbar bis '+datum(rg.faellig)+'.':'')}</p></div>
          ${handy?`<details class="gc-d"><summary>Girocode für ein zweites Gerät zeigen</summary><div class="gc-q">${gc?PLIB.qrSvg(gc,160):'<div class="gc-leer">Girocode<br>(Probe)</div>'}</div></details>`:`<div class="gc-q">${gc?PLIB.qrSvg(gc,160)+'<small>Girocode</small>':'<div class="gc-leer">Girocode<br>(Probe)</div>'}</div>`}</div>`; }).join('')}${fuss?`<div class="zahl-fuss">${fuss}</div>`:''}</div>`; }
  // Was jetzt passiert, in Sätzen statt Produktnamen. Nur, was die Leistung wirklich ist.
  const DANK={trikot_jugend:'die {t} bekommt neue Trikots mit Ihrem Logo',team_jugend:'die {t} hat Sie eine Saison lang an ihrer Seite',aufwaerm_jugend:'die {t} wärmt sich in Shirts mit Ihrem Logo auf',
    baelle_jugend:'{T}trainiert mit Bällen von Ihnen',trainer_jugend:'ein Trainer aus der Jugend macht mit Ihrer Hilfe seine Lizenz',supporter:'Ihr Logo kommt an unsere Partnerwand',club:'den Platz für Ihre Bande suchen wir gemeinsam mit Ihnen aus',
    premium:'Ihre Bande bekommt einen bevorzugten Platz',p1896:'Sie sind in der höchsten Stufe dabei, als einziger Betrieb Ihrer Branche',bande_erste:'den Platz für Ihre Bande suchen wir gemeinsam mit Ihnen aus',brust_erste:'die Erste läuft mit Ihrem Namen auf der Brust auf',
    brust_zweite:'die Zweite läuft mit Ihrem Namen auf der Brust auf',aermel_erste:'Ihr Logo kommt auf den Ärmel der Ersten',aermel_zweite:'Ihr Logo kommt auf den Ärmel der Zweiten',zeltlager:'beim Zeltlager sind Sie mit dabei',
    ferienspiele:'bei den Ferienspielen sind Sie mit dabei',turnier:'bei einem unserer Turniere sind Sie Partner',matchball:'ein Heimspiel wird mit Ihrem Matchball angepfiffen',sotd:'ein Heimspiel gehört Ihnen als Partner des Tages',
    tor_monat:'das Tor des Monats trägt Ihren Namen',jobpost:'wir veröffentlichen Ihre Stellenanzeige',business_treff:'ein Partnertreffen findet bei Ihnen statt'};
  const undListe=a=>a.length>1?a.slice(0,-1).join(', ')+' und '+a[a.length-1]:(a[0]||'');
  function dankSaetze(ps){ const mn=id=>nbsp((M.find(m=>m.id===id)||{}).name||id), s=[];
    ps.forEach(p=>{ let t=DANK[p.key]; if(!t){ t='zu Ihrem Paket gehört '+p.titel; }
      t=t.replace('{t}',p.mannschaft?mn(p.mannschaft):'Mannschaft').replace('{T}',p.mannschaft?'die '+mn(p.mannschaft)+' ':'eine Jugendmannschaft '); if(!s.includes(t))s.push(t); });
    // Komma vor „und“ nur bei genau zwei Hauptsätzen, bei drei Gliedern nicht (kein Serienkomma)
    const t3=s.slice(0,3), x=t3.length>2?t3.slice(0,-1).join(', ')+' und '+t3[t3.length-1]:t3.length===2?t3[0]+', und '+t3[1]:(t3[0]||''); return x?x.charAt(0).toUpperCase()+x.slice(1)+'.':''; }
  function danke(los){
    seite(); const A=$('#abIn'), R=S.ergebnis, F=S.F, V=D.verein||{}; if(!A||!R)return; const mail=esc(R.email||F.email), probeHinweis=demo()?'<p class="probe-n">Probeansicht: Es wurde nichts gespeichert und nichts verschickt.</p>':'';
    const neu=T?`<button type="button" class="knopf-w" id="neuTermin" style="margin-top:12px">Nächster Abschluss im Termin</button>`:'';
    // Stempel aus dem Vertrag (nicht aus dem Stand des Geräts): Partner der Saison des Beginns, vorher ein Eingangsstempel mit Datum
    const sjV=d=>{ const y=+String(d).slice(0,4), m=+String(d).slice(5,7); return saisonTxt((m&&m<7?y-1:y)+'-07-01'); };
    const stempel=fest(R)?`<span class="stp-d">Partner ${sjV(R.beginn||beginn())}</span>`:`<span class="stp-d">Eingegangen ${datum(R.unterschrieben_am||R.am||iso(new Date()))}</span>`;
    if(R.art==='angebot'||R.art==='warteliste'){
      const wl=R.art==='warteliste';
      A.innerHTML=`<div class="danke${los?' los':''}"><img class="wappen" src="${WAPPEN}" width="320" height="182" alt=""><h2 class="danke-h" tabindex="-1">${wl?'Vorgemerkt.':'Das Angebot<br><span>ist unterwegs.</span>'}</h2><div class="hand">${esc(dankeName())}</div>
      <p>${wl?`Sobald ein Platz frei wird, melden wir uns bei Ihnen unter ${mail}. Bis dahin müssen Sie nichts tun.`:`Ihr unverbindliches Angebot ${esc(R.nr)} kommt gleich als PDF an ${mail}. Die Preise halten wir bis zum ${datum(iso(new Date(Date.now()+14*864e5)))} für Sie fest. Reserviert ist damit noch nichts, freie Plätze vergeben wir nach der Reihenfolge der Unterschriften. Solange die Preise gelten, können Sie mit dem Link aus der Mail auch hier unterschreiben. Der Vertrag kommt zustande, wenn Sie unterschreiben und wir für den Verein gegenzeichnen. In ein paar Tagen melden wir uns.`}</p>${probeHinweis}
      <button type="button" class="textknopf" id="nochmal">${wl?'Doch lieber ein Paket zusammenstellen':'Paket ändern oder gleich unterschreiben'}</button></div>${neu}`;
      A.querySelector('#nochmal').onclick=async()=>{ S.ergebnis=null; S.idem=null; S.weg=wl?null:'vertrag'; S.vmodus=null; merken(); if(!demo())await freiHolen(); korbPruefen(); abschluss(); kopfZahl(); zu(wl?'welten':'abschluss',true); };
      nachDanke(A); if(los){ const h=A.querySelector('.danke-h'); if(h)h.focus({preventScroll:true}); } return; }
    const spende=R.art==='spende', rg=R.rechnung, sp2=R.spende||null, mn=id=>nbsp((M.find(m=>m.id===id)||{}).name||id);
    const gekauft=spende?'':dankSaetze(R.positionen||[]), tel=!!(R.tel||String(F.telefon||'').trim()), stufe=(R.positionen||[]).some(p=>['club','premium','p1896'].includes(p.key));
    // Wann unterschrieben wurde (vom Server), ob schon gegengezeichnet: der Text stimmt auch, wenn man die Seite Tage später öffnet
    const tagU=R.unterschrieben_am?iso(new Date(R.unterschrieben_am)):(R.am?iso(new Date(R.am)):iso(new Date())), heuteU=tagU===iso(new Date()), gegen=!!R.gegengezeichnet_am, fe=fest(R);
    const keineRg=!rg&&(R.positionen||[]).some(p=>p.key!=='spende');
    // Eine Saison ohne Verlängerung oder nur Einmaliges: genau eine Rechnung
    const eRg=R.saisons!=null?(!(+R.netto_jahr>0)||(+R.saisons===1&&!R.auto_verlaengerung)):eineRg(rechnungVertrag()), rgW=eRg?'die Rechnung':'die erste Rechnung';
    const wer=String(V.vertreter||'').trim(), teamN=spende?[]:[...new Set((R.positionen||[]).filter(p=>p.mannschaft).map(p=>(M.find(m=>m.id===p.mannschaft)||{}).name||p.mannschaft))];
    const weg=spende?[['Zusage per Mail','Sie bekommen Ihre Spendenzusage gleich per Mail.'+(V.gemeinnuetzig===true?' Die Zuwendungsbestätigung folgt, sobald der Betrag da ist.':'')],['Wir sagen es weiter','Die Kinder und Trainer erfahren, wer ihnen geholfen hat. Wenn Sie lieber nicht genannt werden möchten, schreiben Sie uns kurz.'],['Kommen Sie vorbei','Schauen Sie gern bei einem Heimspiel oder samstags bei der Jugend vorbei. Wir freuen uns, wenn wir uns am Platz sehen.']]
      :[[fe?(gegen&&!heuteU?'Alles ist fest':'Ihre Kopie'):'Wir unterschreiben auch',(fe?esc(gegen&&!heuteU?'Der Vertrag ist von beiden Seiten unterschrieben. Die Fassung mit beiden Unterschriften haben wir Ihnen per Mail geschickt. ':'Der Vertrag mit beiden Unterschriften'+(rg?' und '+rgW+' kommen':' kommt')+' per Mail.'+(rg?' ':' '+(eRg?'Die Rechnung':'Die erste Rechnung')+' folgt in den nächsten Tagen. ')):esc('Wir sehen alles noch einmal durch und unterschreiben für den Verein, meist in wenigen Tagen. Haben wir nach vier Wochen nicht unterschrieben, sind Sie nicht mehr gebunden. Sollte etwas nicht klappen, etwa weil ein Platz doch schon vergeben ist, sagen wir es Ihnen mit Grund.')).trim(),1],
        ...(teamN.length?[['Die Mannschaft erfährt es',`${fe?`Beim nächsten Training sagen wir ${undListe(teamN.map(n=>'der '+n))}, wer jetzt hinter ${teamN.length>1?'ihnen':'ihr'} steht.`:`Sobald der Vertrag gilt, sagen wir es ${undListe(teamN.map(n=>'der '+n))} beim nächsten Training.`} Wenn Sie mögen, machen wir ein gemeinsames Foto am Platz. Ins Netz kommt es nur, wenn die Eltern und ab 14 Jahren auch die Jugendlichen selbst einverstanden sind.`]]:[]),
        ['Ihr Logo',`Schicken Sie uns Ihr Logo${V.email?' an <span class="mail">'+esc(V.email)+'</span>':''}. Am besten die Datei, die auch Ihre Druckerei hat. Wenn Sie unsicher sind, schicken Sie einfach, was Sie haben, wir kümmern uns darum. Bevor etwas gedruckt wird, zeigen wir Ihnen, wo und wie es erscheint.`,1],
        ['Wir sehen uns',esc((stufe?'Zum nächsten Partnerabend laden wir Sie persönlich ein. Den Termin schicken wir, sobald er feststeht. ':'')+(stufe?'Und schauen':'Schauen')+' Sie gern bei einem Heimspiel oder samstags bei der Jugend vorbei. ')+(tel?esc('Außerdem rufen wir Sie an und besprechen, wie es losgeht.'):esc('Möchten Sie vorher kurz sprechen? ')+(V.email?`<a href="${esc('mailto:'+V.email+'?subject='+encodeURIComponent('Rückruf: '+(F.firma||''))+'&body='+encodeURIComponent('Sie erreichen mich unter: '))}">Schicken Sie uns Ihre Nummer</a>, dann rufen wir an.`:'Schicken Sie uns Ihre Nummer, dann rufen wir an.')),1]];
    const spZeile=sp2&&!R.spendeFehler?', die Spendenzusage in einer zweiten Mail':'', spOffen=!spende&&!sp2&&!R.spendeFehler&&!R.spendeVerzicht&&S.korb.some(e=>e.key==='spende'), spaet=String(R.beginn||beginn()).slice(0,10)>(tagU||iso(new Date()))&&(R.netto_jahr!=null?+R.netto_jahr>0:rechnungVertrag().netto_jahr>0);
    const text=spende?`Ihre Spende ist zugesagt. ${rg?`Ihre Spendenzusage mit den Bankdaten kommt per Mail an ${mail}.`:`Ihre Spendenzusage kommt per Mail an ${mail}.`}`
      :fe&&heuteU?`Vertrag ${esc(R.nr)} ist von beiden Seiten unterschrieben. Eine Kopie${rg?' und '+rgW:''} schicken wir per Mail an ${mail}${spZeile}.`
      :fe?`Sie haben am ${datum(tagU)} unterschrieben, und der Verein hat gegengezeichnet. Den Vertrag mit beiden Unterschriften${rg?' und '+rgW:''} haben wir an ${mail} geschickt${spZeile}.${keineRg?' '+(eRg?'Die Rechnung':'Die erste Rechnung')+' kommt in den nächsten Tagen per Mail.':''}${rg&&rg.status==='bezahlt'?' Ihre Rechnung ist bezahlt. Danke.':''}`
      :`${heuteU?'Ihre Unterschrift ist bei uns.':`Sie haben am ${datum(tagU)} unterschrieben.`} Wir unterschreiben in den nächsten Tagen für den Verein, dann ist alles fest. Sie bekommen den Vertrag mit beiden Unterschriften und ${rgW} per Mail an ${mail}.${heuteU?' Eine Kopie mit Ihrer Unterschrift ist schon unterwegs.':''}${sp2&&!R.spendeFehler?' Ihre Spendenzusage kommt in einer eigenen Mail.':''}`;
    const freu=spende||!gekauft?'':`${fe?'Und jetzt geht es los: ':'Sobald alles fest ist, geht es los: '}${esc(gekauft)}${!fe&&spaet?` Beginn ist am ${datum(R.beginn||beginn())}.`:''}`;
    const fuss=(spende||rg?'':`${sp2?'Zum Vertrag: ':''}${fe?(eRg?'Die Rechnung':'Die erste Rechnung')+' kommt in den nächsten Tagen per Mail, die Bankdaten stehen darauf.':'Die Bankdaten stehen auf der Rechnung, die mit dem gegengezeichneten Vertrag kommt.'}`);
    const keineMail=`${rg&&R.bank&&!R.bank.probe?'Vertrag und Rechnung liegen Ihrer Mail auch als PDF bei. ':''}Keine Mail da? Schauen Sie bitte kurz im Spam-Ordner nach${V.email?' oder schreiben Sie uns an <span class="mail">'+esc(V.email)+'</span>':''}.`;
    const zb0=zahlBlock([{titel:spende?'Spende':'Rechnung',rg},sp2?{titel:'Spende',rg:sp2.rechnung}:null],R.bank||(sp2&&sp2.bank),(fuss?`<p class="hinweis bank-spaeter">${fuss}</p>`:'')+`<p class="hinweis">${keineMail}</p>`);
    A.innerHTML=`<div class="danke-raster"><div class="danke${los?' los':''}"><div class="danke-k"><img class="wappen" src="${WAPPEN}" width="320" height="182" alt="">${spende?'':stempel}</div><h2 class="danke-h" tabindex="-1">${spende?'Danke für<br><span>Ihre Hilfe.</span>':fe?'Jetzt spielen<br><span>Sie mit.</span>':'Danke für Ihre<br><span>Unterschrift.</span>'}</h2><div class="hand">${esc(spende||fe?dankeName():freuName())}</div>
      <p>${text}</p>${freu?`<p class="freu">${freu}</p>`:''}${R.fehlt_zweite&&!fe?'<p class="hinweis" style="color:var(--ink)">Laut Satzung unterschreiben zwei Personen gemeinsam für den Verein. Die zweite Unterschrift fehlt noch, erst dann ist der Vertrag geschlossen.</p>':''}<button type="button" class="textknopf" id="linkSichern">Diesen Link sichern</button>${R.geaendert?`<p class="hinweis" style="color:var(--ink)">${spende?`Ihre erste Zusage war schon bei uns angekommen, bevor die Verbindung abbrach. Bei uns steht deshalb die Zusage ${esc(R.nr)} mit dem ersten Betrag. Möchten Sie den Betrag ändern, schreiben Sie uns kurz.`:`Ihre erste Unterschrift war schon bei uns angekommen, bevor die Verbindung abbrach. Bei uns liegt deshalb der Vertrag ${esc(R.nr)} in der ersten Fassung. Ihre Änderung schicken Sie uns bitte kurz per Mail, dann passen wir den Vertrag an.`}</p>`:''}${probeHinweis}${((rg&&rg.status!=='bezahlt')||sp2)&&fein()?`<button type="button" class="textknopf" id="zurBank">${!rg?'Spende überweisen ↓':spaet?'Bankdaten ansehen ↓':'Rechnung und Bankdaten ↓'}</button>`:''}
      <ol class="weg">${weg.map((x,i)=>`<li><b>0${i+1}</b><div><strong>${esc(x[0])}</strong><span>${x[2]?x[1]:esc(x[1])}</span></div></li>`).join('')}</ol></div>
      <div class="danke-r">${zb0||`<div class="danke-fuss">${fuss?`<p class="hinweis bank-spaeter">${fuss}</p>`:''}<p class="hinweis">${keineMail}</p></div>`}</div></div>
      ${spOffen?`<p class="sp-leise">Die Spende über ${eur(rechnung().spende,true)} haben wir weggelassen. Wenn Sie sie doch geben möchten, geht das hier jederzeit. <button type="button" class="textknopf" id="spNochmal">Spende zusagen</button></p>`:''}
      ${R.spendeFehler?`<div class="msg err">${R.spendeNetz?'Ihr Vertrag ist da. Bei der Spende ist die Verbindung abgebrochen. Tippen Sie bitte gleich noch einmal auf „Spende jetzt zusagen“. Doppelt wird sie dabei nicht angelegt.':`Ihr Vertrag ist da. Die Spende konnten wir gerade nicht anlegen (${esc(R.spendeFehler)}).`} <button type="button" class="textknopf" id="spNochmal">Spende jetzt zusagen</button></div>`:''}
      ${neu}`;
    kopierBinden(A);
    const sn=A.querySelector('#spNochmal'); if(sn)sn.onclick=async()=>{ sn.disabled=true; tippStark(); try{ const sb=spendeBodyNeu();
        S.ergebnis.spende=demo()?await probeErgebnis('spende',PLIB.rechnen(sb.positionen,L,1)):await rpc('partner_praesi_abschluss',{p_code:code,p:sb},30000); delete S.ergebnis.spendeFehler; delete S.ergebnis.spendeBody; merken(); danke(); }
      catch(e){ sn.disabled=false; toast(e.message); } };
    const ls=A.querySelector('#linkSichern'); if(ls)ls.onclick=()=>{ const u=location.href;
      if(navigator.share){ navigator.share({title:'Partnerschaft SV/BSC Mörlenbach',url:u}).catch(()=>{}); return; }
      try{ navigator.clipboard.writeText(u).then(()=>toast('Link kopiert. Legen Sie ihn am besten in Ihre Notizen.'),()=>toast('Bitte kopieren Sie die Adresse oben im Browser.')); }catch(e){ toast('Bitte kopieren Sie die Adresse oben im Browser.'); } };
    const zb=A.querySelector('#zurBank'); if(zb)zb.onclick=()=>{ const z=A.querySelector('.zahlen'); if(z){ const k=$('.top'); window.scrollTo({top:z.getBoundingClientRect().top+scrollY-((k&&k.offsetHeight)||60)-8,behavior:sanft()}); } };
    nachDanke(A);
    if(los){ const h=A.querySelector('.danke-h'); if(h)h.focus({preventScroll:true}); }
  }
  // Kopierzeilen im Bankblock (Danke und zweites Gerät)
  function kopierBinden(A){
    A.querySelectorAll('[data-probe]').forEach(b=>b.onclick=()=>{ tipp(); toast('In der Probe wird nichts kopiert. In der echten Ansicht landet hier die Angabe in Ihrer Zwischenablage.'); });
    A.querySelectorAll('[data-kopie]').forEach(b=>b.onclick=()=>{ const w=b.dataset.kopie; tippStark(); b.textContent='✓ Kopiert'; b.classList.add('ok'); S.bankZeit=Date.now();
      const markieren=()=>{ const s0=b.previousElementSibling, rg0=document.createRange(); rg0.selectNodeContents(s0); const g=getSelection(); g.removeAllRanges(); g.addRange(rg0); b.textContent='Markiert'; };
      try{ navigator.clipboard.writeText(w).catch(markieren); }catch(e){ markieren(); }
      setTimeout(()=>{ b.textContent='Kopieren'; b.classList.remove('ok'); },1800); merken(); }); }
  function nachDanke(A){ leisteZeigen(); const nt=A.querySelector('#neuTermin'); if(nt)nt.onclick=()=>{ S.ergebnis=null; S.korb=[]; S.wl=[]; S.weg=null; S.zust=false; S.befugt=false; S.vsig=null; S.vmodus=null; S.idem=null; vergessen(); korb(); welten(); vorschlag(); kopfZahl(); zu('welten'); }; }

  window.addEventListener('hashchange',()=>location.reload());
  laden();
})();
