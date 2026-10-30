/* SV/BSC Mörlenbach · Partner-Präsentation v2 (…/partner.html#d=<code>)
   Ein durchgehender Scroll, der sich an den Partner anpasst:
   Verein vorstellen, Passung, „Was ist Ihnen wichtig?“, dann die Welten (Jugend, Erste, Zweite, Events, ganzer Verein)
   in der Reihenfolge, die zum Partner passt, unser Vorschlag, Baukasten, Vertrag aus Bausteinen, Unterschrift, Rechnung mit Girocode.
   Im Termin (geöffnet aus der App, mit Anmeldung im Partner-Team) zusätzlich: Sonderpreis, Sonstiges, Unterschrift für den Verein.
   Daten und Preise rechnet der Server (partner_praesi, partner_praesi_abschluss), die Anzeige rechnet mit PLIB gleich. */
(function(){
  'use strict';
  const C=window.PD_CFG||{}, app=document.getElementById('app');
  const esc=s=>String(s==null?'':s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const eur=(n,d)=>PLIB.eur(n,d);
  const hp=new URLSearchParams(location.hash.slice(1)), code=(hp.get('d')||'').toLowerCase();
  const $=s=>document.querySelector(s);

  // Im Termin: Anmeldung aus der App mitnehmen (gleiche Adresse, Supabase speichert die Sitzung im Browser)
  function token(){
    try{ for(let i=0;i<localStorage.length;i++){ const k=localStorage.key(i); if(k!=='svbc-auth'&&!/^sb-.+-auth-token$/.test(k))continue;
      const j=JSON.parse(localStorage.getItem(k)||'null'), s=j&&(j.currentSession||j); if(s&&s.access_token&&(!s.expires_at||s.expires_at*1000>Date.now()+20000))return s.access_token; } }catch(e){}
    return null; }
  async function rpc(fn,body){ const t=token();
    const r=await fetch(C.url+'/rest/v1/rpc/'+fn,{method:'POST',headers:{'Content-Type':'application/json',apikey:C.anon,Authorization:'Bearer '+(t||C.anon)},body:JSON.stringify(body||{})});
    const j=await r.json().catch(()=>null); if(!r.ok)throw new Error((j&&j.message)||('Fehler '+r.status)); return j; }
  const toast=t=>{ document.querySelectorAll('.toast').forEach(x=>x.remove()); const e=document.createElement('div'); e.className='toast'; e.setAttribute('role','status'); e.textContent=t; document.body.appendChild(e); setTimeout(()=>e.remove(),3200); };
  const datum=d=>{ if(!d)return ''; const x=new Date(String(d).slice(0,10)+'T12:00:00'); return x.toLocaleDateString('de-DE',{day:'2-digit',month:'2-digit',year:'numeric'}); };
  const saisonTxt=d=>{ const y=+String(d).slice(0,4); return String(y%100).padStart(2,'0')+'/'+String((y+1)%100).padStart(2,'0'); };
  const iso=d=>{ const z=new Date(d); return z.getFullYear()+'-'+String(z.getMonth()+1).padStart(2,'0')+'-'+String(z.getDate()).padStart(2,'0'); };

  // ---------- Welten ----------
  const WELT={
    jugend:{k:'Jugend',titel:'Für die Kinder von Mörlenbach.',hand:'Hier fängt alles an.',text:'Von den Bambini bis zur A-Jugend. Jede Woche Training, jedes Wochenende Spiele, betreut von Ehrenamtlichen. Ihr Beitrag landet direkt bei den Kindern: Trikots, Bälle, gute Trainer.',bild:'partner/jugend.jpg',pos:'center 30%'},
    erste:{k:'1. Mannschaft',titel:'Sonntag, 15 Uhr. Ihr Name spielt mit.',hand:'Das Aushängeschild.',text:'Die Erste ist das, worüber man im Ort spricht. Auf dem Trikot, auf dem Ärmel, an der Bande: Sie sind bei jedem Heimspiel und auf jedem Foto dabei.',bild:'partner/hero.jpg',pos:'center 40%'},
    zweite:{k:'2. Mannschaft',titel:'Die Zweite. Herz und Kampf.',hand:'Ehrlicher Fußball.',text:'Hier spielen die, die nie aufhören wollen. Junge Talente auf dem Weg nach oben und Alte Hasen mit Erfahrung. Ein Partner, der genau dazu passt.',art:'platz'},
    events:{k:'Events',titel:'Zeltlager, Ferienspiele, Turniere.',hand:'Erinnerungen, die bleiben.',text:'Die Momente, an die sich Kinder noch Jahre später erinnern. Schon kleine Beträge machen hier viel möglich, und Ihr Name ist mittendrin.',art:'zelt'},
    verein:{k:'Der ganze Verein',titel:'Ein Paket. Alles drin.',hand:'Sichtbar und vernetzt.',text:'Unsere Partnerpakete bündeln Bande, Partner-Wall, Heimspielkarten und das Netzwerk der Partner. Vom einfachen Einstieg bis zum inneren Kreis.',art:'bande'}};
  const ART={
    zelt:`<svg class="welt-art" viewBox="0 0 520 300" aria-hidden="true"><path d="M60 280 L210 70 L360 280 Z" fill="#141b47"/><path d="M210 70 L250 280 L170 280 Z" fill="#e8741f"/><path d="M210 70 L210 40" stroke="#141b47" stroke-width="6"/><path d="M210 40 L250 52 L210 64 Z" fill="#fff"/><path d="M300 280 L420 120 L520 280 Z" fill="#1d2760"/><path d="M420 120 L450 280 L392 280 Z" fill="#f7f4ee"/><circle cx="470" cy="60" r="26" fill="#fff" opacity=".9"/><path d="M0 284 H520" stroke="#141b47" stroke-width="8"/></svg>`,
    platz:`<svg class="welt-art" viewBox="0 0 520 300" aria-hidden="true" fill="none" stroke="#1d2760" stroke-width="5" opacity=".9"><rect x="20" y="30" width="480" height="260"/><path d="M260 30 V290"/><circle cx="260" cy="160" r="58"/><rect x="20" y="95" width="70" height="130"/><rect x="430" y="95" width="70" height="130"/><circle cx="260" cy="160" r="5" fill="#e8741f" stroke="none"/></svg>`,
    bande:`<svg class="welt-art" viewBox="0 0 520 300" aria-hidden="true"><rect x="0" y="170" width="520" height="130" fill="#2c6b3a"/><g><rect x="10" y="110" width="150" height="60" fill="#fff"/><rect x="170" y="110" width="150" height="60" fill="#e8741f"/><rect x="330" y="110" width="150" height="60" fill="#fff"/></g><path d="M0 230 H520" stroke="#fff" stroke-width="3" opacity=".6"/><text x="245" y="150" font-family="Barlow Condensed,Arial Narrow,sans-serif" font-weight="900" font-size="30" fill="#fff" text-anchor="middle">IHR NAME</text></svg>`};
  const BUDGET=[['bis250','bis 250 €',250],['bis1000','250 bis 1.000 €',1000],['bis2500','1.000 bis 2.500 €',2500],['mehr','über 2.500 €',6000],['offen','noch offen',1500]];
  const ZIELE_PRAESI=['jugend','sichtbarkeit','region','netzwerk','mitarbeiter','events','gemeinschaft','exklusiv','digital','spende'];

  let D=null, L=[], M=[], T=false;
  const S={ziele:new Set(),herz:new Set(),budget:'',team:null,offen:new Set(),korb:[],saisons:1,start:'jetzt',auto:false,wl:[],
    weg:null,F:{},zust:false,sig:{p:false,v:false},unterzeichner:'',ergebnis:null,busy:false,spende:{betrag:0,zweck:'Jugend'}};
  const lk=k=>L.find(x=>x.key===k);
  // Bei Glücksspiel, Alkohol und Ähnlichem: keine Werbung auf Jugendkleidung (im Deck „ohne Jugend-Trikot“)
  const JUGEND_KLEIDUNG=['trikot_jugend','aufwaerm_jugend'];
  function filtern(ls){ const ohne=((D&&D.deck&&D.deck.passung)||{}).ohne||[]; return ohne.includes('trikot')?ls.filter(l=>!JUGEND_KLEIDUNG.includes(l.key)):ls; }
  let uid=0;

  async function laden(){
    if(!/^[a-f0-9]{32}$/.test(code)){ app.innerHTML=`<div class="leer-hinweis"><h2 class="g">Link fehlt</h2><p>Bitte den persönlichen Link aus der Nachricht öffnen.</p></div>`; return; }
    try{ D=await rpc('partner_praesi',{p_code:code}); if(!D)throw new Error('Dieser Link ist nicht mehr aktiv.'); }
    catch(e){ app.innerHTML=`<div class="leer-hinweis"><h2 class="g">Link nicht verfügbar</h2><p>${esc(e.message)}</p></div>`; return; }
    L=filtern(D.leistungen||[]); M=D.mannschaften||[]; T=!!D.team;
    const dk=D.deck||{}, pt=D.partner||{};
    const pp=dk.passung||{}; ((pt.ziele||[]).length?pt.ziele:pp.ziele||[]).forEach(z=>S.ziele.add(z)); ((pt.interessen||[]).length?pt.interessen:pp.herz||[]).forEach(z=>{ if(WELT[z])S.herz.add(z); }); if(pt.budget)S.budget=pt.budget;
    S.F={firma:dk.firma||'',anrede:dk.anrede||'',ansprech:dk.ansprech||'',email:dk.email||'',telefon:'',strasse:'',ort:'',ustid:''};
    const adr=String(dk.adresse||'').split(',').map(x=>x.trim()); if(adr.length>=2){ S.F.strasse=adr[0]; S.F.ort=adr.slice(1).join(', '); } else S.F.strasse=adr[0]||'';
    S.unterzeichner=(D.verein||{}).vertreter||'';
    S.team=(M.find(m=>{ const t=lk('team_jugend'); return t&&t.frei_je&&t.frei_je[m.id]>0; })||M[0]||{}).id||null;
    document.title='Partner werden · '+(dk.kurzname||dk.firma)+' · SV/BSC Mörlenbach';
    geruest(); fragen(); welten(); vorschlag(); korb(); abschluss(); kopfZahl();
    { const zu=hp.get('s'); if(zu&&/^[a-z]+$/.test(zu))setTimeout(()=>{ const e=document.getElementById(zu); if(e)e.scrollIntoView({block:'start'}); },350); }   // aus der Partner-Zentrale direkt zum Abschluss
    window.addEventListener('scroll',fortschritt,{passive:true}); fortschritt();
    setInterval(async()=>{ if(document.visibilityState!=='visible'||S.busy||S.ergebnis||S.sig.p||S.sig.v)return;
      try{ const n=await rpc('partner_praesi',{p_code:code}); L=filtern(n.leistungen||L); welten(); vorschlag(); korb(); }catch(e){} },45000);
  }

  // ---------- Grundgerüst ----------
  function logoImg(cls){ const dk=D.deck; return dk.logo?`<img class="${(cls||'')+(dk.logo_hell===false?' dk':'')}" src="${esc(dk.logo)}" alt="${esc(dk.firma)}">`:''; }
  function geruest(){
    const dk=D.deck, P=dk.passung||{}, kurz=dk.kurzname||dk.firma, nm=String(dk.ansprech||'').trim().split(/\s+/);
    const anr=dk.ansprech?(dk.anrede?`Hallo ${esc(dk.anrede)} ${esc(nm[nm.length-1])},`:`Hallo ${esc(nm[0])},`):'Schön, dass Sie da sind.';
    const nJ=M.length||12, hatPassung=P.titel||P.text||(P.punkte||[]).length;
    app.innerHTML=`
<div class="top"><div class="ww"><div class="top-l"><img src="partner/svbsc.png" alt="SV/BSC Mörlenbach">${dk.logo?`<span class="top-x">×</span><span class="top-p${dk.logo_hell===false?' dk':''}">${logoImg()}</span>`:''}</div>
  <div class="top-r">${T?'<span class="top-t" title="Angemeldet im Partner-Team">Termin</span>':''}<button class="top-b" type="button" data-zu="baukasten" aria-label="Zu Ihrem Paket"><span>Ihr Paket</span><i id="kopfN">0</i></button></div></div><div class="prog" id="prog"></div></div>
<section class="hero"><img src="partner/hero.jpg" alt="Die Mannschaft des SV/BSC Mörlenbach im Kreis vor dem Spiel"><div class="ww">
  <div class="hero-f"><span>Persönlich für ${esc(kurz)}</span></div>
  <div class="hand" style="margin-top:18px;font-size:32px">${anr}</div>
  <h1>Hier wächst Heimat.</h1>
  <p>${P.hero?esc(P.hero):`Bei uns stehen jede Woche 260 Kinder und Jugendliche auf dem Platz. Kinder, die hier aufwachsen und morgen bei ${esc(kurz)} arbeiten könnten.`}</p>
  <button class="runter k" type="button" data-zu="verein">Lernen Sie uns kennen ↓</button></div></section>
<section class="sec hell" id="verein"><div class="ww">
  <div class="k" style="color:var(--or)">Das sind wir</div>
  <h2 class="g" style="color:var(--blau)">Ein Ort. Ein Verein. Seit 1896.</h2>
  <p class="lead">Der SV/BSC Mörlenbach ist Fußball im Weschnitztal: zwei Herrenmannschaften, eine große Jugend und ein Sportplatz, auf dem sich jedes Wochenende der halbe Ort trifft. Getragen von Menschen, die ihre Freizeit geben, und von Partnern aus der Region.</p>
  <div class="fakten"><div><b>1896</b><span>gegründet, seitdem in Mörlenbach zu Hause</span></div><div><b>260</b><span>Kinder und Jugendliche, jede Woche</span></div><div><b>${nJ}</b><span>Jugendmannschaften, von G bis A</span></div><div><b>2</b><span>Herrenmannschaften im Spielbetrieb</span></div></div>
  <div class="saeulen">
    <div><div class="n">01</div><h3>Jugend</h3><p>Der größte Teil des Vereins. Hier lernen Kinder Teamgeist, Verlässlichkeit und wie man nach einer Niederlage wieder aufsteht.</p></div>
    <div><div class="n">02</div><h3>Erste und Zweite</h3><p>Fußball für den Ort. Heimspiele mit Zuschauern, Bratwurst und Gesprächen am Rand, mitten in der Region.</p></div>
    <div><div class="n">03</div><h3>Gemeinschaft</h3><p>Zeltlager, Ferienspiele, Turniere und Feste. Der Verein ist ein Treffpunkt für Familien und Generationen.</p></div></div></div></section>
${hatPassung?`<section class="sec hell" style="padding-top:0"><div class="w">
  <div class="pa-kopf">${dk.logo?logoImg('pl'):`<b style="font-family:var(--c);font-weight:900;font-size:34px;color:#1d2760;text-transform:uppercase">${esc(kurz)}</b>`}<i>×</i><img class="sv" src="partner/svbsc.png" alt="SV/BSC Mörlenbach"></div>
  <div style="margin-top:30px"><div class="hand" style="font-size:30px">Warum wir an Sie gedacht haben</div>
  ${P.titel?`<h2 class="g" style="color:var(--blau)">${esc(P.titel)}</h2>`:''}
  ${P.text?`<p class="pa-text">${esc(P.text)}</p>`:''}
  ${(P.punkte||[]).length?`<ul class="pa-p">${P.punkte.map(x=>`<li>${esc(x)}</li>`).join('')}</ul>`:''}</div></div></section>`:''}
<section class="sec dunkel" id="wunsch"><div class="ww">
  <div class="k" style="color:var(--hb)">Ihre Partnerschaft</div>
  <h2 class="g">Was ist Ihnen wichtig?</h2>
  <p class="lead">Tippen Sie an, was passt. Die Seite sortiert sich danach, und wir machen Ihnen einen Vorschlag.</p>
  <div class="fr" id="fragen"></div></div></section>
<div id="welten"></div>
<section class="sec dunkel" id="vorschlag"></section>
<section class="sec hell" id="baukasten"><div class="w" id="korbIn"></div></section>
<section class="sec dunkel" id="abschluss"><div class="w" id="abIn"></div></section>
<footer><div class="ww"><div class="f-l"><img src="partner/svbsc.png" alt=""><span class="hand" style="font-size:24px">Für Mörlenbach. Seit 1896.</span></div>
  <div>${esc((D.verein||{}).name||'SV/BSC Mörlenbach')}, Partnerschaften${(D.verein||{}).email?`<br><a href="mailto:${esc(D.verein.email)}">${esc(D.verein.email)}</a>`:''}</div></div></footer>`;
    app.addEventListener('click',e=>{ const z=e.target.closest('[data-zu]'); if(z){ e.preventDefault(); zu(z.dataset.zu); } });
  }
  function zu(id){ const el=document.getElementById(id); if(el)window.scrollTo({top:el.getBoundingClientRect().top+window.scrollY-60,behavior:'smooth'}); }
  function fortschritt(){ const p=$('#prog'); if(!p)return; const h=document.documentElement.scrollHeight-innerHeight; p.style.width=(h>0?Math.min(100,scrollY/h*100):0)+'%'; }
  function kopfZahl(plopp){ const n=$('#kopfN'); if(!n)return; n.textContent=S.korb.length; if(plopp){ const b=n.closest('.top-b'); b.classList.remove('plopp'); void b.offsetWidth; b.classList.add('plopp'); } }

  // ---------- Fragen ----------
  function fragen(){
    const F=$('#fragen'); if(!F)return;
    const chip=(g,k,t,on)=>`<button type="button" class="chip${on?' on':''}" data-g="${g}" data-k="${k}" aria-pressed="${on}">${esc(t)}</button>`;
    F.innerHTML=`
      <div><div class="fr-k"><b>Wofür schlägt Ihr Herz?</b><small>Mehrere möglich</small></div>
        <div class="chips">${Object.keys(WELT).map(k=>chip('herz',k,WELT[k].k,S.herz.has(k))).join('')}</div></div>
      <div><div class="fr-k"><b>Was soll die Partnerschaft bringen?</b><small>Mehrere möglich</small></div>
        <div class="chips">${ZIELE_PRAESI.map(k=>chip('ziel',k,PLIB.ZIELE[k],S.ziele.has(k))).join('')}</div></div>
      <div><div class="fr-k"><b>Welcher Rahmen passt im Jahr?</b><small>Netto, ganz grob</small></div>
        <div class="chips">${BUDGET.map(([k,t])=>chip('budget',k,t,S.budget===k)).join('')}</div></div>
      <div class="fr-n" id="frN" aria-live="polite">${S.herz.size||S.ziele.size||S.budget?'Danke. Wir haben die Seite für Sie sortiert.':''}</div>`;
    F.querySelectorAll('.chip').forEach(b=>b.onclick=()=>{ const g=b.dataset.g, k=b.dataset.k;
      if(g==='herz'){ S.herz.has(k)?S.herz.delete(k):S.herz.add(k); }
      else if(g==='ziel'){ S.ziele.has(k)?S.ziele.delete(k):S.ziele.add(k); }
      else S.budget=S.budget===k?'':k;
      fragen(); welten(); vorschlag(); });
  }

  // ---------- Bewertung und Vorschlag ----------
  function frei(l,team){ if(l.je_mannschaft){ const f=l.frei_je&&team?l.frei_je[team]:null; return f==null?null:f; } return l.frei; }
  function score(l){ let s=0; (l.ziele||[]).forEach(z=>{ if(S.ziele.has(z))s+=3; }); if(S.herz.has(l.bereich))s+=4; if((D.deck||{}).empfehlung===l.key)s+=5; if(l.art==='paket')s+=1; return s; }
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
    const reihe=[...S.herz].map(w=>kand.find(k=>k.l.bereich===w)).filter(Boolean); kand.forEach(k=>{ if(!reihe.includes(k))reihe.push(k); });
    for(const k of reihe){ if(aus.length>=3)break; if(k.l.art==='paket'&&paket)continue; const p=jahrespreis(k.l); if(summe+p>cap&&aus.length)continue; if(p>cap*1.15)continue;
      aus.push(k); summe+=p; if(k.l.art==='paket')paket=true; }
    return aus;
  }
  function vorschlag(){
    const V=$('#vorschlag'); if(!V)return; const vl=vorschlagListe();
    if(!vl.length){ V.innerHTML=''; V.hidden=true; return; } V.hidden=false;
    const summe=vl.reduce((a,k)=>a+jahrespreis(k.l),0), mn=id=>(M.find(m=>m.id===id)||{}).name||'';
    V.innerHTML=`<div class="ww"><div class="k" style="color:var(--hb)">Unser Vorschlag</div><h2 class="g">Das würde zu Ihnen passen.</h2>
      <p class="lead">Aus Ihren Antworten zusammengestellt. Übernehmen, anpassen oder ganz anders machen: alles geht.</p>
      <div class="vs">${vl.map(k=>`<div><b>${esc(k.l.titel)}</b><small>${esc(k.team?mn(k.team):k.l.kurz||'')}</small><em>${eur(k.l.preis)} <small style="display:inline;font-family:Barlow,sans-serif;font-weight:500">${esc(PLIB.EINHEIT[k.l.einheit]||'')}</small></em></div>`).join('')}</div>
      <div class="vs-s"><span>Zusammen, netto</span><b>${eur(summe)}</b></div>
      <button type="button" class="knopf-o" id="vsUeb" style="margin-top:18px">Vorschlag übernehmen</button></div>`;
    V.querySelector('#vsUeb').onclick=()=>{ let n=0; vl.forEach(k=>{ if(!S.korb.some(e=>e.key===k.l.key&&(e.mannschaft||null)===(k.team||null))){ dazu(k.l.key,k.team,true); n++; } });
      toast(n?'✓ Im Paket. Unten können Sie alles anpassen.':'Ist schon alles in Ihrem Paket.'); welten(); korb(); kopfZahl(true); setTimeout(()=>zu('baukasten'),200); };
  }

  // ---------- Welten ----------
  function weltReihenfolge(){ const alle=Object.keys(WELT).filter(w=>L.some(l=>l.bereich===w&&!['spende','sonstiges'].includes(l.art)));
    const punkte=w=>(S.herz.has(w)?100:0)+L.filter(l=>l.bereich===w).reduce((a,l)=>a+(l.ziele||[]).filter(z=>S.ziele.has(z)).length*3+((D.deck||{}).empfehlung===l.key?5:0),0)+(w==='jugend'?0.5:0);
    return alle.sort((a,b)=>punkte(b)-punkte(a)); }
  function welten(){
    const W=$('#welten'); if(!W)return; const reihe=weltReihenfolge(), haupt=S.herz.size?reihe.filter(w=>S.herz.has(w)||S.offen.has(w)):reihe, rest=reihe.filter(w=>!haupt.includes(w));
    const vk=new Set(vorschlagListe().map(k=>k.l.key));
    W.innerHTML=haupt.map(w=>weltHtml(w,vk)).join('')+(rest.length?`<section class="sec blau"><div class="ww"><div class="k" style="color:var(--hb)">Auch spannend</div>
      <h2 class="g" style="font-size:clamp(32px,6vw,48px)">Noch mehr Möglichkeiten.</h2>
      <div class="mehr">${rest.map(w=>`<button type="button" class="mz" data-auf="${w}"><b>${esc(WELT[w].k)}</b><span>${esc(WELT[w].hand)} ${L.filter(l=>l.bereich===w&&l.preis!=null).length} Möglichkeiten, ab ${eur(Math.min(...L.filter(l=>l.bereich===w&&l.preis!=null).map(l=>+l.preis)))}</span></button>`).join('')}</div></div></section>`:'');
    W.querySelectorAll('[data-auf]').forEach(b=>b.onclick=()=>{ S.offen.add(b.dataset.auf); welten(); setTimeout(()=>zu('welt-'+b.dataset.auf),60); });
    W.querySelectorAll('[data-tm]').forEach(b=>b.onclick=()=>{ S.team=b.dataset.tm; welten(); });
    W.querySelectorAll('[data-add]').forEach(b=>b.onclick=()=>klickLeistung(b.dataset.add,b.dataset.m||null,b.dataset.wie));
  }
  function weltHtml(w,vk){
    const X=WELT[w], ls=L.filter(l=>l.bereich===w&&!['spende','sonstiges'].includes(l.art)), tm=M.find(m=>m.id===S.team);
    const bild=X.bild?`<div class="welt-bild"><img src="${X.bild}" alt="" style="object-position:${X.pos||'center'}"></div>`:'';
    const hatJe=ls.some(l=>l.je_mannschaft);
    return `<section class="welt ${w}" id="welt-${w}"><div class="welt-k">${bild}${X.art?ART[X.art]:''}<div class="welt-t ww" style="width:100%">
        <div class="hand">${esc(X.hand)}</div><h2>${esc(X.titel)}</h2><p>${esc(X.text)}</p></div></div>
      <div class="welt-in"><div class="ww">
        ${hatJe&&M.length?`<div class="teams"><div class="teams-k"><b>Für welche Mannschaft?</b><small>Freie Plätze je Team, live</small></div>
          <div class="tms" role="group" aria-label="Mannschaft wählen">${M.map(m=>{ const f=(lk('team_jugend')||{}).frei_je; const fr=f?f[m.id]:null;
            return `<button type="button" class="tm${m.id===S.team?' on':''}${fr===0?' voll':''}" data-tm="${esc(m.id)}" aria-pressed="${m.id===S.team}">${esc(m.kurz||m.id)}<small>${fr===0?'vergeben':fr==null?'':'frei'}</small></button>`; }).join('')}</div></div>`:''}
        <div class="lks">${ls.map(l=>karte(l,vk,tm)).join('')}</div></div></div></section>`;
  }
  function karte(l,vk,tm){
    const team=l.je_mannschaft?S.team:null, f=frei(l,team), drin=S.korb.some(e=>e.key===l.key&&(e.mannschaft||null)===(team||null)), wl=S.wl.some(e=>e.key===l.key&&(e.mannschaft||null)===(team||null));
    const naechst=!l.je_mannschaft&&f===0&&l.frei_naechste>0;
    let fz='';
    if(f===0)fz=naechst?`<div class="lk-f eng"><i></i>Ab Saison ${saisonTxt(D.naechste_saison)} frei</div>`:`<div class="lk-f aus"><i></i>${l.je_mannschaft?'Für '+esc(tm?tm.kurz:'dieses Team')+' vergeben':'Derzeit vergeben'}</div>`;
    else if(f!=null&&l.plaetze>1)fz=`<div class="lk-f${f<=2?' eng':''}"><i></i>${f===1?'Nur noch 1 Platz frei':`Noch ${f} von ${l.plaetze} frei`}${l.je_mannschaft&&tm?' für '+esc(tm.kurz):''}</div>`;
    else fz=`<div class="lk-f"><i></i>Verfügbar${l.je_mannschaft&&tm?' für '+esc(tm.kurz):''}</div>`;
    let knopf;
    if(drin)knopf=`<button type="button" class="lk-b" data-add="${l.key}" data-m="${esc(team||'')}" data-wie="weg" aria-pressed="true">✓ Im Paket</button>`;
    else if(f===0&&naechst)knopf=`<button type="button" class="lk-b p" data-add="${l.key}" data-wie="naechste">Ab ${saisonTxt(D.naechste_saison)} sichern</button>`;
    else if(f===0)knopf=`<button type="button" class="lk-b" data-add="${l.key}" data-m="${esc(team||'')}" data-wie="wl" aria-pressed="${wl}">${wl?'✓ Auf der Warteliste':'Auf die Warteliste'}</button>`;
    else knopf=`<button type="button" class="lk-b p" data-add="${l.key}" data-m="${esc(team||'')}" data-wie="dazu">Hinzufügen</button>`;
    const tag=vk.has(l.key)?'<span class="lk-tag">Passt zu Ihnen</span>':(D.deck||{}).empfehlung===l.key?'<span class="lk-tag b">Unsere Empfehlung</span>':'';
    return `<article class="lk${drin?' drin':''}${f===0?' voll':''}">${tag}<div class="lk-n">${esc(l.titel)}</div>${l.kurz?`<div class="lk-h">${esc(l.kurz)}</div>`:''}
      <p class="lk-x">${esc(l.text||'')}</p><div class="lk-p"><b>${l.preis!=null?eur(l.preis):'Ihr Betrag'}</b><span>${esc(PLIB.EINHEIT[l.einheit]||'')}${l.je_mannschaft&&tm?', '+esc(tm.name):''}</span></div>${fz}${knopf}</article>`;
  }
  function dazu(key,mannschaft,still){ const l=lk(key); if(!l)return;
    if(l.art==='paket')S.korb=S.korb.filter(e=>{ const x=lk(e.key); const raus=x&&x.art==='paket'; if(raus&&!still)toast('Ein Paket pro Partner. '+x.titel+' wurde ersetzt.'); return !raus; });
    S.korb.push({id:++uid,key,mannschaft:l.je_mannschaft?(mannschaft||S.team):null,menge:1,preis:null,text:''}); }
  function klickLeistung(key,m,wie){ m=m||null;
    if(wie==='weg')S.korb=S.korb.filter(e=>!(e.key===key&&(e.mannschaft||null)===m));
    else if(wie==='wl'){ const i=S.wl.findIndex(e=>e.key===key&&(e.mannschaft||null)===m); if(i>=0)S.wl.splice(i,1); else { S.wl.push({key,mannschaft:m}); toast('Notiert. Sobald der Platz frei wird, melden wir uns.'); } }
    else if(wie==='naechste'){ dazu(key,null); if(S.start!=='naechste'){ S.start='naechste'; toast('Start ab Saison '+saisonTxt(D.naechste_saison)+' gesetzt.'); } }
    else { dazu(key,m); }
    welten(); korb(); kopfZahl(wie!=='weg'&&wie!=='wl'); }

  // ---------- Baukasten ----------
  function posFuerServer(){ return S.korb.map(e=>{ const l=lk(e.key), o={key:e.key,menge:e.menge}; if(e.mannschaft)o.mannschaft=e.mannschaft;
      if(l&&(l.art==='spende'||l.art==='sonstiges'||l.preis==null))o.preis=e.preis; else if(T&&e.preis!=null&&e.preis!=='')o.preis=+e.preis;
      if(e.text)o.text=e.text; if(e.zweck)o.zweck=e.zweck; return o; }); }
  function rechnung(){ return PLIB.rechnen(posFuerServer(),L,S.saisons); }
  function beginn(){ return S.start==='naechste'?String(D.naechste_saison).slice(0,10):iso(new Date()); }
  function ende(c){ if(!(c.netto_jahr>0))return null; const b=new Date(beginn()+'T12:00:00'), y=b.getMonth()>=6?b.getFullYear():b.getFullYear()-1; return iso(new Date(y+S.saisons,5,30,12)); }
  const nurSpende=()=>S.korb.length>0&&S.korb.every(e=>e.key==='spende');
  function korb(){
    const K=$('#korbIn'); if(!K)return; const c=rechnung(), mn=id=>(M.find(m=>m.id===id)||{}).name||id, hatSaison=c.netto_jahr>0;
    const zeile=e=>{ const l=lk(e.key)||{}, p=c.positionen.find(x=>x.key===e.key&&(x.mannschaft||null)===(e.mannschaft||null))||{}, menge=['stueck','spieltag'].includes(l.einheit);
      return `<div class="kp" data-id="${e.id}"><div class="kp-n"><b>${esc(l.art==='sonstiges'&&e.text?e.text:l.titel)}</b><small>${esc([l.je_mannschaft?mn(e.mannschaft):'',e.key==='spende'?'Zweck: '+(e.zweck||'Verein'):'',PLIB.EINHEIT[l.einheit]||''].filter(Boolean).join(' · '))}</small></div>
        <div class="kp-p">${eur(p.summe||0)}${p.rabatt?`<small>inkl. ${Math.round(p.rabatt*100)} % Laufzeitvorteil</small>`:''}</div>
        <div class="kp-z">${l.je_mannschaft?`<select data-f="mannschaft" aria-label="Mannschaft">${M.map(m=>`<option value="${esc(m.id)}"${m.id===e.mannschaft?' selected':''}>${esc(m.name)}</option>`).join('')}</select>`:''}
          ${menge?`<div class="menge"><button type="button" data-d="-1" aria-label="weniger">−</button><b>${e.menge}</b><button type="button" data-d="1" aria-label="mehr">+</button></div>`:''}
          ${T&&l.preis!=null?`<label>Sonderpreis <input type="number" inputmode="decimal" min="0" step="1" data-f="preis" value="${e.preis==null?'':esc(e.preis)}" placeholder="${esc(l.preis)}"></label>`:''}
          <button type="button" class="kp-x" data-weg="1">Entfernen</button></div></div>`; };
    const sp=S.korb.find(e=>e.key==='spende');
    K.innerHTML=`<div class="k" style="color:var(--or)">Ihr Paket</div><h2 class="g" style="color:var(--blau)">Zusammenstellen.</h2>
      <p class="lead">Alles, was Sie oben gewählt haben. Laufzeit festlegen, auf Wunsch eine Spende dazu, fertig.</p>
      <div class="korb">${S.korb.filter(e=>e.key!=='spende').map(zeile).join('')||`<div class="leer">Noch leer. Tippen Sie oben bei einer Leistung auf „Hinzufügen“${vorschlagListe().length?' oder übernehmen Sie unseren Vorschlag':''}.</div>`}</div>
      ${S.wl.length?`<p style="margin:10px 0 0;font-size:15px;color:var(--grau)">Warteliste: ${esc(S.wl.map(w=>(lk(w.key)||{}).titel+(w.mannschaft?' ('+mn(w.mannschaft)+')':'')).join(', '))}</p>`:''}
      ${T?`<div class="sonst" id="sonst"><label>Sonstiges, im Termin vereinbart<input id="soT" maxlength="80" placeholder="z. B. Vereinsheim-Abend"></label><label>Preis netto<input id="soP" type="number" inputmode="decimal" min="1" step="1"></label><button type="button" id="soAdd">Dazu</button></div>`:''}
      <div class="unter"><div class="k">Laufzeit</div><div class="opts">${[[1,'1 Saison','regulär'],[2,'2 Saisons','5 % Vorteil, Preisgarantie'],[3,'3 Saisons','10 % Vorteil, Platz gesichert']].map(([n,t,s])=>`<button type="button" class="opt${S.saisons===n?' on':''}" data-sa="${n}" aria-pressed="${S.saisons===n}"><b>${t}</b><small>${s}</small></button>`).join('')}</div>
        <div class="opts">${[['jetzt','Ab sofort','in dieser Saison '+saisonTxt(D.saison)],['naechste','Ab Saison '+saisonTxt(D.naechste_saison),'ab 1. Juli']].map(([k,t,s])=>`<button type="button" class="opt${S.start===k?' on':''}" data-st="${k}" aria-pressed="${S.start===k}"><b style="font-size:19px">${t}</b><small>${s}</small></button>`).join('')}</div>
        <button type="button" class="sw${S.auto?' on':''}" id="swAuto" aria-pressed="${S.auto}"><span class="hak">${S.auto?'✓':''}</span><span>Verlängert sich automatisch um eine Saison<small>Kündigung bis 3 Monate vor Ablauf, ganz ohne Aufwand</small></span></button></div>
      <div class="unter"><div class="k">Einfach helfen</div><div class="sp"><div style="font-size:16px;line-height:1.45">Eine Spende ohne Gegenleistung, zusätzlich oder ganz für sich. Sie geht zu 100 % in den Zweck Ihrer Wahl.</div>
        <div class="sp-b">${[50,100,250,500].map(b=>`<button type="button" data-sp="${b}" class="${sp&&+sp.preis===b?'on':''}">${b} €</button>`).join('')}</div>
        <div class="sp-z"><input id="spBetrag" type="number" inputmode="decimal" min="1" step="1" placeholder="Eigener Betrag" value="${sp&&![50,100,250,500].includes(+sp.preis)?esc(sp.preis):''}" aria-label="Eigener Betrag in Euro">
          <select id="spZweck" aria-label="Zweck">${['Jugend','Zeltlager','Ferienspiele','Erste Mannschaft','Zweite Mannschaft','Verein'].map(z=>`<option${(sp?sp.zweck:S.spende.zweck)===z?' selected':''}>${z}</option>`).join('')}</select>
          ${sp?'<button type="button" class="kp-x" id="spWeg" style="margin-left:0">Spende entfernen</button>':''}</div></div></div>
      <div class="summe" aria-live="polite">
        ${hatSaison?`<div><span>Je Saison</span><span>${eur(c.netto_jahr,true)}</span></div>`:''}
        ${c.einmalig?`<div class="z"><span>Einmalig</span><span>${eur(c.einmalig,true)}</span></div>`:''}
        ${c.spende?`<div class="z"><span>Spende</span><span>${eur(c.spende,true)}</span></div>`:''}
        <div class="s"><span style="font-size:15px;color:var(--hb2)">${hatSaison?`Gesamt für ${S.saisons} Saison${S.saisons>1?'s':''}${c.rabatt?', inkl. '+Math.round(c.rabatt*100)+' % Vorteil':''}`:'Gesamt'}</span><b>${eur(c.netto_gesamt+c.spende)}</b></div>
        ${hatSaison?`<div class="z"><span>Laufzeit</span><span>${datum(beginn())} bis ${datum(ende(c))}</span></div>`:''}
        <small>Preise netto${(D.verein||{}).ust_satz>0?', zuzüglich '+(+D.verein.ust_satz)+' % Umsatzsteuer':''}. Spenden ohne Umsatzsteuer. Der Laufzeitvorteil gilt für Pakete, Flächen und Patenschaften je Saison.</small></div>
      <button type="button" class="knopf-o" style="margin-top:18px" data-zu="abschluss"${S.korb.length?'':' disabled'}>Weiter zum Abschluss ↓</button>`;
    K.querySelectorAll('.kp').forEach(z=>{ const e=S.korb.find(x=>x.id===+z.dataset.id); if(!e)return;
      z.querySelectorAll('[data-d]').forEach(b=>b.onclick=()=>{ e.menge=Math.max(1,Math.min(99,e.menge+(+b.dataset.d))); korb(); });
      z.querySelector('[data-weg]').onclick=()=>{ S.korb=S.korb.filter(x=>x!==e); korb(); welten(); kopfZahl(); };
      const se=z.querySelector('[data-f="mannschaft"]'); if(se)se.onchange=()=>{ e.mannschaft=se.value; korb(); welten(); };
      const pr=z.querySelector('[data-f="preis"]'); if(pr)pr.onchange=()=>{ e.preis=pr.value===''?null:Math.max(0,+pr.value); korb(); }; });
    K.querySelectorAll('[data-sa]').forEach(b=>b.onclick=()=>{ S.saisons=+b.dataset.sa; korb(); abschluss(); });
    K.querySelectorAll('[data-st]').forEach(b=>b.onclick=()=>{ S.start=b.dataset.st; korb(); abschluss(); });
    K.querySelector('#swAuto').onclick=()=>{ S.auto=!S.auto; korb(); abschluss(); };
    const setSp=v=>{ v=Math.round(Math.max(0,+v||0)*100)/100; const z=K.querySelector('#spZweck').value; S.spende.zweck=z; const e=S.korb.find(x=>x.key==='spende');
      if(!v){ if(e)S.korb=S.korb.filter(x=>x!==e); } else if(e){ e.preis=v; e.zweck=z; } else S.korb.push({id:++uid,key:'spende',mannschaft:null,menge:1,preis:v,zweck:z,text:''});
      korb(); kopfZahl(true); abschluss(); };
    K.querySelectorAll('[data-sp]').forEach(b=>b.onclick=()=>setSp(b.classList.contains('on')?0:b.dataset.sp));
    K.querySelector('#spBetrag').onchange=e=>setSp(e.target.value);
    K.querySelector('#spZweck').onchange=e=>{ S.spende.zweck=e.target.value; const s=S.korb.find(x=>x.key==='spende'); if(s){ s.zweck=e.target.value; korb(); } };
    const sw=K.querySelector('#spWeg'); if(sw)sw.onclick=()=>setSp(0);
    const sa=K.querySelector('#soAdd'); if(sa)sa.onclick=()=>{ const t=K.querySelector('#soT').value.trim(), p=+K.querySelector('#soP').value;
      if(t.length<3||!(p>0))return toast('Bitte Text und Preis eintragen.'); S.korb.push({id:++uid,key:'sonstiges',mannschaft:null,menge:1,preis:p,text:t}); korb(); kopfZahl(true); abschluss(); };
    if(!S.ergebnis)abschluss();
  }

  // ---------- Abschluss ----------
  function klauseln(c){ const keys=PLIB.klauselnFuer(c.positionen,L,{auto:S.auto}), e=ende(c);
    const w={beginn:datum(beginn()),ende:e?datum(e):'Ende der Leistung',frist:3,branche:(D.deck||{}).branche||'des Partners'};
    return keys.map(k=>{ const [titel,text]=PLIB.klauselText(k,w); return {key:k,titel,text}; }); }
  function abschluss(){
    const A=$('#abIn'); if(!A)return;
    if(S.ergebnis)return danke();
    if(!S.korb.length){ A.innerHTML=`<div class="k" style="color:var(--hb)">Abschluss</div><h2 class="g">Fast geschafft.</h2><p class="lead">Stellen Sie oben Ihr Paket zusammen. Dann ist hier alles fertig ausgefüllt: als Angebot per Mail oder direkt zum Unterschreiben.</p>
      <button type="button" class="knopf-w" style="margin-top:22px" data-zu="welten">Zu den Möglichkeiten ↑</button>`; return; }
    const c=rechnung(), sp=nurSpende(), F=S.F, V=D.verein||{};
    if(A.querySelector('#abForm')&&A.dataset.weg===String(S.weg)&&A.dataset.sp===String(sp)){ vertragNeu(); return; }
    A.dataset.weg=String(S.weg); A.dataset.sp=String(sp);
    const feld=(n,t,typ,ac,ph)=>`<label>${t}<input name="${n}" ${typ?`type="${typ}"`:''} autocomplete="${ac||'off'}" maxlength="120" value="${esc(F[n]||'')}"${ph?` placeholder="${esc(ph)}"`:''}></label>`;
    A.innerHTML=`<div class="k" style="color:var(--hb)">Abschluss</div><h2 class="g">${sp?'Spende zusagen.':'Jetzt Partner werden.'}</h2>
      <p class="lead">${sp?'Ihre Angaben, dann bekommen Sie sofort die Zusage mit Girocode zum Überweisen.':'Ihre Angaben, dann wählen Sie: Angebot in Ruhe per Mail, oder direkt hier unterschreiben.'}</p>
      <form id="abForm" autocomplete="on" onsubmit="return false"><div class="felder">
        ${feld('firma',sp?'Firma oder Name':'Unternehmen','text','organization')}
        <label>Ansprechpartner<span style="display:flex;gap:6px"><select name="anrede" style="width:100px;flex:none" aria-label="Anrede"><option value="">Anrede</option>${['Frau','Herr'].map(a=>`<option${F.anrede===a?' selected':''}>${a}</option>`).join('')}</select><input name="ansprech" autocomplete="name" maxlength="80" value="${esc(F.ansprech||'')}" placeholder="Vor- und Nachname"></span></label>
        ${feld('email','E-Mail','email','email','name@firma.de')}${feld('telefon','Telefon (optional)','tel','tel')}
        ${feld('strasse','Straße und Nr.','text','street-address')}${feld('ort','PLZ und Ort','text','address-level2')}
        ${sp?'':feld('ustid','USt-IdNr. (optional)','text','off')}</div></form>
      ${sp?'':`<div class="wahl2"><button type="button" data-weg="angebot" class="${S.weg==='angebot'?'on':''}" aria-pressed="${S.weg==='angebot'}"><b>Angebot per Mail</b><span>PDF mit allen Leistungen, 14 Tage gültig. Wir fragen nach ein paar Tagen freundlich nach.</span></button>
        <button type="button" data-weg="vertrag" class="haupt${S.weg==='vertrag'?' on':''}" aria-pressed="${S.weg==='vertrag'}"><b>Direkt unterschreiben</b><span>Vertrag aus Ihren Bausteinen, hier mit Finger oder Stift unterschreiben. Rechnung mit Girocode kommt sofort.</span></button></div>`}
      <div id="abWeiter"></div><div class="msg" id="abMsg" role="alert"></div>`;
    const fm=A.querySelector('#abForm'); const upd=e=>{ if(e.target.name){ S.F[e.target.name]=e.target.value; if(S.weg==='vertrag'||sp)vertragKopf(); } };
    fm.addEventListener('input',upd); fm.addEventListener('change',upd);
    A.querySelectorAll('[data-weg]').forEach(b=>b.onclick=()=>{ S.weg=b.dataset.weg; abschluss(); });
    vertragNeu();
  }
  function vertragNeu(){
    const W=$('#abWeiter'); if(!W)return; const sp=nurSpende(), c=rechnung(), V=D.verein||{};
    if(!sp&&S.weg==='angebot'){ W.innerHTML=`<button type="button" class="knopf-o" id="abGo" style="margin-top:22px">Angebot an mich senden</button><p class="hinweis">Das Angebot kommt als PDF. Unterschreiben geht später mit einem Klick aus der Mail.</p>`; W.querySelector('#abGo').onclick=()=>senden('angebot'); return; }
    if(!sp&&S.weg!=='vertrag'){ W.innerHTML=''; return; }
    const kl=sp?[]:klauseln(c), e=ende(c);
    const tab=c.positionen.map(p=>`<div><span>${esc(p.titel)}${p.mannschaft?', '+esc((M.find(m=>m.id===p.mannschaft)||{}).name||p.mannschaft):''}${p.menge>1?', '+p.menge+' ×':''}${p.rabatt?', '+Math.round(p.rabatt*100)+' % Vorteil':''}</span><span>${eur(p.summe,true)}${p.einheit==='saison'?' / Saison':''}</span></div>`).join('');
    W.innerHTML=`<div class="vertrag" id="vertrag"><div class="vt-k"><div><b>${sp?'Spendenzusage':'Partnervertrag'}</b><small>${sp?'':(e?`Laufzeit ${datum(beginn())} bis ${datum(e)}${S.auto?', verlängert sich automatisch':''}`:'Einmalige Leistungen')}</small></div><img src="partner/svbsc.png" alt=""></div>
      <div class="vt-p" id="vtKopf"></div>
      <div class="vt-tab">${tab}${c.netto_jahr>0?`<div class="s"><span>Je Saison netto</span><span>${eur(c.netto_jahr,true)}</span></div>`:''}<div class="s"><span>Gesamt${c.spende&&!sp?' inkl. Spende':''}</span><span>${eur(c.netto_gesamt+c.spende,true)}${c.netto_gesamt&&(V.ust_satz>0)?' zzgl. USt.':''}</span></div></div>
      ${kl.length?`<div class="vt-kl" tabindex="0" aria-label="Vertragsbedingungen">${kl.map((k,i)=>`<h4>§ ${i+1} ${esc(k.titel)}</h4><p>${esc(k.text)}</p>`).join('')}</div>`:''}
      <div class="vt-u"><button type="button" class="zust" id="zust"><span class="hak${S.zust?' on':''}">${S.zust?'✓':''}</span><span>${sp?'Ich sage die Spende verbindlich zu und überweise den Betrag.':'Ich habe die Bedingungen gelesen und schließe den Vertrag verbindlich ab.'}</span></button>
        ${sp?'':`<div class="sigs"><div><div class="sig-l">Unterschrift ${esc(S.F.firma||'Partner')} · ${new Date().toLocaleDateString('de-DE')}</div><canvas class="sig" id="sigP" aria-label="Unterschrift Partner"></canvas>
            <div class="sig-f"><span>Mit Finger, Stift oder Maus</span><button type="button" data-sx="P">Löschen</button></div></div>
          ${T?`<div><div class="sig-l">Für ${esc(V.name||'den Verein')}</div><canvas class="sig" id="sigV" aria-label="Unterschrift Verein"></canvas>
            <div class="sig-f"><span>Partner-Team im Termin</span><button type="button" data-sx="V">Löschen</button></div>
            <input class="sig-n" id="unterz" maxlength="120" value="${esc(S.unterzeichner)}" placeholder="Name, Funktion" aria-label="Name der unterschreibenden Person"></div>`:''}</div>`}
        <button type="button" class="knopf-o" id="abGo" style="margin-top:16px">${sp?'Spende zusagen':'Unterschreiben und abschließen'}</button><div class="msg" id="abMsg2" role="alert"></div></div></div>
      ${sp?'':'<p class="hinweis">Die Vertragstexte sind Bausteine passend zu Ihren Leistungen. Eine Kopie mit beiden Unterschriften kommt per Mail.</p>'}`;
    vertragKopf(); S.sig={p:false,v:false};
    W.querySelector('#zust').onclick=()=>{ S.zust=!S.zust; const h=W.querySelector('#zust .hak'); h.classList.toggle('on',S.zust); h.textContent=S.zust?'✓':''; };
    if(!sp){ pad(W.querySelector('#sigP'),'p'); if(T){ pad(W.querySelector('#sigV'),'v'); W.querySelector('#unterz').oninput=e=>{ S.unterzeichner=e.target.value; }; }
      W.querySelectorAll('[data-sx]').forEach(b=>b.onclick=()=>padLeeren(b.dataset.sx)); }
    W.querySelector('#abGo').onclick=()=>senden(sp?'spende':'vertrag');
  }
  function vertragKopf(){ const el=$('#vtKopf'); if(!el)return; const V=D.verein||{}, F=S.F;
    el.innerHTML=`<div><span>Verein</span>${esc(V.name||'SV/BSC Mörlenbach')}<br>${esc([V.strasse,V.ort].filter(Boolean).join(', '))}${V.vertreter?`<br>vertreten durch ${esc(V.vertreter)}${V.vertreter_funktion?', '+esc(V.vertreter_funktion):''}`:''}</div>
      <div><span>${nurSpende()?'Spender':'Partner'}</span>${esc(F.firma||'…')}<br>${esc([[F.anrede,F.ansprech].filter(Boolean).join(' '),F.strasse,F.ort].filter(Boolean).join(', '))}</div>`; }

  // ---------- Unterschrift ----------
  const pads={};
  function pad(cv,k){ if(!cv)return; const r=cv.getBoundingClientRect(), d=window.devicePixelRatio||1; cv.width=Math.max(1,r.width*d); cv.height=Math.max(1,r.height*d);
    const x=cv.getContext('2d'); x.scale(d,d); x.lineWidth=2.4; x.lineCap='round'; x.lineJoin='round'; x.strokeStyle='#1d2760'; pads[k]={cv,x}; let dr=false;
    const pos=e=>{ const b=cv.getBoundingClientRect(); return [e.clientX-b.left,e.clientY-b.top]; };
    cv.onpointerdown=e=>{ dr=true; try{ cv.setPointerCapture(e.pointerId); }catch(_){} const [a,b]=pos(e); x.beginPath(); x.moveTo(a,b); };
    cv.onpointermove=e=>{ if(!dr)return; const [a,b]=pos(e); x.lineTo(a,b); x.stroke(); S.sig[k]=true; };
    cv.onpointerup=cv.onpointercancel=()=>{ dr=false; }; }
  function padLeeren(K){ const k=K.toLowerCase(), p=pads[k]; if(!p)return; p.x.save(); p.x.setTransform(1,0,0,1,0,0); p.x.clearRect(0,0,p.cv.width,p.cv.height); p.x.restore(); S.sig[k]=false; }
  function padPng(k){ const p=pads[k]; if(!p)return null; const o=document.createElement('canvas'), w=Math.min(900,p.cv.width), h=Math.round(p.cv.height*w/p.cv.width); o.width=w; o.height=h;
    const x=o.getContext('2d'); x.fillStyle='#fff'; x.fillRect(0,0,w,h); x.drawImage(p.cv,0,0,w,h); return o.toDataURL('image/png'); }

  // ---------- Senden ----------
  async function senden(art){
    if(S.busy)return; const msg=$(art==='angebot'?'#abMsg':'#abMsg2')||$('#abMsg'); msg.textContent=''; msg.classList.remove('err');
    const fehl=t=>{ msg.textContent=t; msg.classList.add('err'); }, F=S.F, c=rechnung();
    if(!S.korb.length)return fehl('Bitte oben etwas auswählen.');
    if((F.firma||'').trim().length<2)return fehl('Bitte Firma oder Namen eintragen.');
    if(!/^[^@\s]+@[^@\s]+\.[a-z]{2,}$/i.test((F.email||'').trim()))return fehl('Bitte eine gültige E-Mail eintragen.');
    if(S.korb.some(e=>{ const l=lk(e.key); return l&&(l.art==='spende'||l.art==='sonstiges')&&!(+e.preis>0); }))return fehl('Bitte einen Betrag für die Spende eintragen.');
    if(art!=='angebot'){ if(art==='vertrag'&&!(F.ansprech||'').trim())return fehl('Bitte den Ansprechpartner eintragen.'); if(!S.zust)return fehl('Bitte die Bestätigung ankreuzen.'); }
    if(art==='vertrag'){ if(!S.sig.p)return fehl('Bitte unterschreiben.'); if(T&&!S.sig.v)return fehl('Bitte auch für den Verein unterschreiben.'); }
    S.busy=true; const btn=$('#abGo'), alt=btn.textContent; btn.disabled=true; btn.textContent='Einen Moment …';
    try{
      const body={art,positionen:posFuerServer(),saisons:S.saisons,beginn:beginn(),auto_verlaengerung:S.auto,
        klauseln:art==='vertrag'?klauseln(c):art==='spende'?klauseln({positionen:c.positionen}).filter(k=>['spende','datenschutz','schluss'].includes(k.key)):[],
        partner:{firma:F.firma.trim(),anrede:F.anrede||'',ansprech:(F.ansprech||'').trim(),email:F.email.trim(),telefon:(F.telefon||'').trim(),strasse:(F.strasse||'').trim(),ort:(F.ort||'').trim(),ustid:(F.ustid||'').trim()},
        zustimmung:art!=='angebot'&&S.zust,interessen:[...S.herz],ziele:[...S.ziele],fragebogen:{budget:S.budget||null,quelle:'praesentation'},warteliste:S.wl};
      if(art==='vertrag'){ body.unterschrift_partner=padPng('p'); if(T){ body.unterschrift_verein=padPng('v'); body.unterzeichner=S.unterzeichner; } }
      const r=await rpc('partner_praesi_abschluss',{p_code:code,p:body});
      S.ergebnis=Object.assign({art},r); danke(); zu('abschluss'); try{ navigator.vibrate&&navigator.vibrate([20,40,20]); }catch(e){}
      rpc('partner_praesi',{p_code:code}).then(n=>{ L=filtern(n.leistungen||L); welten(); }).catch(()=>{});
    }catch(e){ fehl(e.message); }
    finally{ S.busy=false; if(btn.isConnected){ btn.disabled=false; btn.textContent=alt; } }
  }

  // ---------- Danke, Rechnung, Girocode ----------
  function danke(){
    const A=$('#abIn'), R=S.ergebnis, F=S.F, V=D.verein||{}; if(!A||!R)return;
    if(R.art==='angebot'){ A.innerHTML=`<div class="danke"><b>Ist unterwegs.</b><div class="hand">Danke, ${esc(F.firma)}!</div>
      <p>Ihr Angebot ${esc(R.nr)} kommt gleich als PDF an ${esc(F.email)}. Nehmen Sie sich Zeit. Wir melden uns in ein paar Tagen, und Unterschreiben geht jederzeit direkt aus der Mail.</p></div>`; return; }
    const rg=R.rechnung, bank=R.bank, gc=rg&&bank?PLIB.girocode({name:bank.name,iban:bank.iban,bic:bank.bic,betrag:rg.brutto,zweck:rg.zweck}):null;
    A.innerHTML=`<div class="danke"><b>${R.art==='spende'?'Danke für Ihre Hilfe.':'Willkommen in der Familie.'}</b><div class="hand">${esc(F.firma)} × SV/BSC Mörlenbach</div>
      <p>${R.art==='spende'?'Ihre Spende ist zugesagt.':`Vertrag ${esc(R.nr)} ist unterschrieben.`} Eine Kopie${rg?' und die '+(rg.art==='spende'?'Spendenzusage':'Rechnung'):''} kommt per Mail an ${esc(F.email)}.</p></div>
      ${gc?`<div class="gc">${PLIB.qrSvg(gc,180)}<div class="gc-t"><b>Gleich überweisen</b><div style="font-size:15px;color:var(--grau);margin-top:4px">Banking-App öffnen, Girocode scannen, fertig. Betrag und Zweck sind schon drin.</div>
        <dl><dt>Empfänger</dt><dd>${esc(bank.name)}</dd><dt>IBAN</dt><dd>${esc(PLIB.ibanSchoen(bank.iban))}</dd>${bank.bic?`<dt>BIC</dt><dd>${esc(bank.bic)}</dd>`:''}<dt>Betrag</dt><dd>${eur(rg.brutto,true)}</dd><dt>Zweck</dt><dd>${esc(rg.zweck)}</dd><dt>Fällig</dt><dd>${datum(rg.faellig)}</dd></dl></div></div>
        <button type="button" class="knopf-w" id="rePdf" style="margin-top:12px">${rg.art==='spende'?'Spendenzusage':'Rechnung'} als PDF</button>`
      :rg?`<p class="hinweis" style="font-size:16px">Die ${rg.art==='spende'?'Spendenzusage':'Rechnung'} ${esc(rg.nr)} über ${eur(rg.brutto,true)} kommt mit den Bankdaten per Mail.</p>`:''}
      ${T?`<button type="button" class="knopf-w" id="neuTermin" style="margin-top:12px">Nächster Abschluss im Termin</button>`:''}`;
    const rp=A.querySelector('#rePdf'); if(rp)rp.onclick=()=>pdfLaden().then(jsPDF=>{
      const doc=PLIB.rechnungPdf(jsPDF,{nr:rg.nr,art:rg.art,datum:iso(new Date()),faellig:rg.faellig,positionen:(R.positionen||[]).map(p=>Object.assign({},p,{mannschaft:p.mannschaft?((M.find(m=>m.id===p.mannschaft)||{}).name||p.mannschaft):null})),netto:rg.netto,ust_satz:R.ust_satz,brutto:rg.brutto,zweck:rg.zweck,
        empfaenger:{firma:F.firma,ansprech:[F.anrede,F.ansprech].filter(Boolean).join(' '),strasse:F.strasse,ort:F.ort}},Object.assign({},V,{kontoinhaber:bank.name,iban:bank.iban,bic:bank.bic,bank:bank.bank}));
      doc.save((rg.art==='spende'?'Spendenzusage ':'Rechnung ')+rg.nr+'.pdf'); }).catch(()=>toast('PDF gerade nicht möglich. Es kommt per Mail.'));
    const nt=A.querySelector('#neuTermin'); if(nt)nt.onclick=()=>{ S.ergebnis=null; S.korb=[]; S.wl=[]; S.weg=null; S.zust=false; korb(); welten(); kopfZahl(); zu('welten'); };
  }
  let jsp=null;
  function pdfLaden(){ if(window.jspdf)return Promise.resolve(window.jspdf.jsPDF); if(jsp)return jsp;
    jsp=new Promise((ok,nein)=>{ const s=document.createElement('script'); s.src='partner/jspdf.umd.min.js'; s.onload=()=>window.jspdf?ok(window.jspdf.jsPDF):nein(); s.onerror=nein; document.head.appendChild(s); }); return jsp; }

  window.addEventListener('hashchange',()=>location.reload());
  laden();
})();
