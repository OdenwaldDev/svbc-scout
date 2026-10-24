/* SV/BSC Mörlenbach · Partner-Deck (…/partner.html#d=<code>)
   Persönliche Scroll-Präsentation für mögliche Partner, Gestaltung nach dem Entwurf aus Claude Design.
   Daten (Firma, Logo, warum es passt) kommen aus der App, die freien Plätze live vom Server.
   Angebot und unterschriebener Antrag gehen über den Server per Mail raus (PDF), Kopie an den Verein. */
(function(){
  'use strict';
  const C=window.PD_CFG||{}, app=document.getElementById('app');
  const esc=s=>String(s==null?'':s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const eur=n=>{ const r=Math.round(n*100)/100; return r.toLocaleString('de-DE',{minimumFractionDigits:Number.isInteger(r)?0:2,maximumFractionDigits:2})+' €'; };
  const code=(new URLSearchParams(location.hash.slice(1)).get('d')||'').toLowerCase();
  async function rpc(fn,body){ const r=await fetch(C.url+'/rest/v1/rpc/'+fn,{method:'POST',headers:{'Content-Type':'application/json',apikey:C.anon,Authorization:'Bearer '+C.anon},body:JSON.stringify(body||{})});
    const j=await r.json().catch(()=>null); if(!r.ok)throw new Error((j&&j.message)||('Fehler '+r.status)); return j; }
  const toast=t=>{ document.querySelectorAll('.toast').forEach(x=>x.remove()); const e=document.createElement('div'); e.className='toast'; e.textContent=t; document.body.appendChild(e); setTimeout(()=>e.remove(),3200); };

  const PK=[
    {id:'supporter',name:'SVM Supporter',price:189,tag:'Ich unterstütze.',sub:'Der einfache Einstieg',sotd:189,feat:['Logo auf der Supporter-Wall','Logo und Verlinkung in der digitalen Partnerwelt','Official Partner Badge']},
    {id:'club',name:'Club Partner',price:496,tag:'Ich werde sichtbar.',sub:'Präsenz am Platz und digital',sotd:169,feat:['Bandenwerbung (Standardplatz)','Größere Darstellung auf der Partner-Wall','1 Partnerkarte für alle Heimspiele','Einladung zum SVM Partnerabend','Partner-Begrüßung auf Social Media']},
    {id:'premium',name:'Premium Partner',price:896,tag:'Sichtbar + vernetzt.',sub:'Mehr Präsenz und Business-Netzwerk',sotd:149,badge:'Beliebt',feat:['Bevorzugte Bandenplatzierung','2 Partnerkarten für alle Heimspiele','Zugang zu allen 4 SVM Business-Treffs','1 Partner-Spotlight pro Saison','1 Job-Post pro Saison inklusive']},
    {id:'p1896',name:'1896 Partner',price:1896,tag:'Innerer Partnerkreis.',sub:'Exklusiv. Limitiert.',sotd:149,badge:'Limitiert',dunkel:true,feat:['Branchenexklusivität im 1896-Kreis','Topplatzierung Bande und Partner-Wall','4 Partnerkarten für alle Heimspiele','1 Heimspiel als Partner des Tages inklusive','Unternehmensportrait oder Reel und 2 Job-Posts','Vorrang als Gastgeber beim Business Treff']}];
  const BS=[
    {k:'sotd',t:'Partner des Tages',d:'Ein Heimspiel, ein Partner, volle Aufmerksamkeit: Durchsagen, Social Media und Präsenz am Platz.',max:5},
    {k:'business',t:'Business Treff als Gastgeber',d:'Sie laden die Partner zu sich ein. Ein Abend im eigenen Betrieb, mit Netzwerk und Austausch.',preis:250,max:4},
    {k:'trikot',t:'Trikotsatz-Patenschaft Jugend',d:'Ein Trikotsatz für eine unserer Jugendmannschaften, je Satz.',preis:350,max:5}];
  const LZ={1:['1 Saison','Regulär',0],2:['2 Saisons','−5 % + Preisgarantie',.05],3:['3 Saisons','−10 %, Preisgarantie, garantierter Platz',.10]};

  let D=null, K={}, S={tab:2,pkg:null,b:{sotd:0,business:0,trikot:0},rec:false,years:1,start:'sofort',zust:false,signed:false,sent:null,busy:false};
  const pk=id=>PK.find(p=>p.id===id);
  const frei=id=>{ const k=K[id]||{max:0,belegt:0}; return Math.max(0,k.max-k.belegt); };
  const freiTxt=(n,max)=>n===0?'Ausgebucht':n===1?`Nur noch 1 von ${max} Plätzen frei`:n<=3?`Nur noch ${n} von ${max} Plätzen frei`:`Noch ${n} von ${max} Plätzen frei`;
  function sotdPreis(id){ return (pk(id)||{}).sotd||149; }
  function calc(){ const P=pk(S.pkg); if(!P)return null; const rab=LZ[S.years][2];
    const ex=[['sotd',sotdPreis(P.id)],['business',250],['trikot',350]].reduce((a,[k,p])=>a+(S.b[k]||0)*p,0);
    const season=Math.round((P.price*(1-rab)+ex)*100)/100; return {P,rab,ex,season,total:Math.round(season*S.years*100)/100}; }

  async function laden(){
    if(!/^[a-f0-9]{32}$/.test(code)){ app.innerHTML=`<div class="leer-hinweis"><h2 class="g">Link fehlt</h2><p>Bitte den persönlichen Link aus der Nachricht öffnen.</p></div>`; return; }
    try{ D=await rpc('partner_deck_info',{p_code:code}); if(!D)throw new Error('Dieser Link ist nicht mehr aktiv.'); }
    catch(e){ app.innerHTML=`<div class="leer-hinweis"><h2 class="g">Link nicht verfügbar</h2><p>${esc(e.message)}</p></div>`; return; }
    K=D.kontingente||{}; if(D.empfehlung&&pk(D.empfehlung))S.tab=PK.findIndex(p=>p.id===D.empfehlung);
    document.title='Partner werden · '+D.firma+' · SV/BSC Mörlenbach';
    gerueste(); karten(); auswahl(); antragTeil();
    if(new URLSearchParams(location.hash.slice(1)).get('s')==='antrag')setTimeout(()=>zu('auswahl'),400);
    setInterval(async()=>{ if(document.visibilityState!=='visible')return; try{ K=await rpc('partner_kontingente'); karten(); auswahl(); }catch(e){} },20000);
  }

  function logoImg(cls){ return D.logo?`<img class="${(cls||'')+(D.logo_hell===false?' dk':'')}" src="${esc(D.logo)}" alt="${esc(D.firma)}">`:''; }
  function gerueste(){
    const P=D.passung||{}, kurz=D.kurzname||D.firma, nm=String(D.ansprech||'').trim().split(/\s+/), anr=D.ansprech?(D.anrede?`Hallo ${esc(D.anrede)} ${esc(nm[nm.length-1])},`:`Hallo ${esc(nm[0])},`):'Schön, dass Sie da sind.';
    const bande=[]; for(let i=0;i<2;i++)bande.push(`<div class="ba-t">${logoImg()||`<b class="c" style="font-size:22px;color:#1d2760">${esc(kurz)}</b>`}</div><div class="ba-t svm"><img src="partner/svbsc.png" alt=""></div><div class="ba-t leer">Ihr Platz</div><div class="ba-t">${logoImg()||''}</div><div class="ba-t svm"><img src="partner/svbsc.png" alt=""></div>`);
    app.innerHTML=`
<div class="top"><div class="w"><div class="top-l"><img src="partner/svbsc.png" alt="SV/BSC Mörlenbach">${D.logo?`<span class="top-x">×</span><span class="top-p${D.logo_hell===false?' dk':''}">${logoImg()}</span>`:''}</div>
  <button class="top-b" type="button" data-zu="auswahl">Paket wählen</button></div></div>
<section class="hero"><img src="partner/hero.jpg" alt=""><div class="w">
  <div class="hero-f"><span>Persönlich für ${esc(kurz)}</span></div>
  <div class="hand" style="margin-top:18px;font-size:30px">${anr}</div>
  <h1>Hier wächst Heimat.</h1>
  <p>${P.hero?esc(P.hero):`Bei uns stehen jede Woche 260 Kinder und Jugendliche auf dem Platz. Kinder, die hier aufwachsen und morgen bei ${esc(kurz)} arbeiten könnten.`}</p>
  <div class="k" style="margin-top:26px;color:var(--hb)">Scrollen ↓</div></div></section>
${P.titel||P.text||(P.punkte||[]).length?`<section class="sec hell"><div class="w">
  <div class="pa-kopf">${D.logo?logoImg('pl'):`<b class="c" style="font-size:34px;color:#1d2760">${esc(D.firma)}</b>`}<i>×</i><img class="sv" src="partner/svbsc.png" alt="SV/BSC Mörlenbach"></div>
  <div class="pa-t"><div class="hand" style="font-size:28px">Warum wir an Sie gedacht haben</div>
  ${P.titel?`<h2 class="g" style="color:var(--blau)">${esc(P.titel)}</h2>`:''}
  ${P.text?`<p class="pa-text">${esc(P.text)}</p>`:''}
  ${(P.punkte||[]).length?`<ul class="pa-p">${P.punkte.map(x=>`<li>${esc(x)}</li>`).join('')}</ul>`:''}
  ${(P.fakten||[]).length?`<div class="pa-f">${P.fakten.map(f=>`<div><b>${esc(f.z)}</b><span>${esc(f.t)}</span></div>`).join('')}</div>`:''}</div></div></section>`:''}
<section class="sec hell" style="padding-top:${P.titel?'8px':'64px'}"><div class="w"><div class="wa">
  <div class="wa-b"><img src="partner/jugend.jpg" alt="Jugendmannschaft des SV/BSC Mörlenbach"></div>
  <div style="display:flex;flex-direction:column;gap:16px"><div class="wa-z">260</div>
    <h2 class="g" style="font-size:40px;margin:0">Kinder &amp; Jugendliche. <span style="color:var(--or)">Jede Woche.</span></h2>
    <p style="margin:0;font-size:18px;line-height:1.5;color:var(--ink2)">Von den Bambini bis zur A-Jugend, betreut von Ehrenamtlichen. Beiträge allein decken nicht, was gute Jugendarbeit kostet. Partner aus der Region machen den Unterschied, direkt hier.</p></div></div>
  <div class="k" style="margin-top:48px;color:var(--grau)">So sieht das bei uns aus</div>
  <h2 class="g" style="color:var(--blau)">Ihr Name am Platz.</h2>
  <div class="ba" aria-hidden="true"><div class="ba-r">${bande.join('')}</div></div>
  <div class="ba-c">Beispiel: Bande am Sportplatz Mörlenbach, ab Club Partner.</div></div></section>
<section class="sec dunkel" style="padding-bottom:80px;overflow:hidden"><div class="w">
  <div class="k" style="color:var(--hb)">Die Partnerpakete</div>
  <h2 class="g">Finden Sie Ihren Platz.</h2>
  <div class="tabs" id="tabs"></div><div class="stapel" id="stapel"></div>
  <p class="hinweis">Preise netto je Saison. Die Zahl der freien Plätze ist live.</p></div></section>
<section class="sec hell" id="auswahl"><div class="w" id="auswahlIn"></div></section>
<section class="sec dunkel" id="antrag" style="padding-bottom:40px"><div class="w" id="antragIn"></div></section>
<footer><div class="w"><div class="f-l"><img src="partner/svbsc.png" alt=""><span class="hand" style="font-size:24px">Für Mörlenbach. Seit 1896.</span></div>
  <div>${esc(D.kontakt||'Partnerschaften')}<br><a href="mailto:${esc(D.mail_verein)}">${esc(D.mail_verein)}</a></div></div></footer>`;
    app.querySelectorAll('[data-zu]').forEach(b=>b.onclick=()=>zu(b.dataset.zu));
  }
  function zu(id){ const el=document.getElementById(id); if(el)window.scrollTo({top:el.getBoundingClientRect().top+window.scrollY-64,behavior:'smooth'}); }

  function karten(){
    const T=document.getElementById('tabs'), St=document.getElementById('stapel'); if(!T||!St)return; const n=PK.length;
    T.innerHTML=PK.map((p,i)=>`<button type="button" class="${i===S.tab?'on':''}${p.dunkel?' e':''}" data-tab="${i}">${esc(p.name)}</button>`).join('');
    St.innerHTML=PK.map((p,i)=>{ const off=(i-S.tab+n)%n, f=frei(p.id), max=(K[p.id]||{}).max||0, aktiv=i===S.tab;
      return `<div class="karte${p.dunkel?' e':''}" style="transform:translateY(${off*14}px) scale(${1-off*.04});opacity:${off>2?0:1-off*.25};z-index:${10-off};pointer-events:${aktiv?'auto':'none'}" ${aktiv?'':'aria-hidden="true"'}>
        <div class="karte-in"><div class="karte-k"><div><div class="karte-n">${esc(p.name)}</div><div class="karte-t">${esc(p.tag)}</div>${D.empfehlung===p.id?'<span class="empf">Unsere Empfehlung für Sie</span>':''}</div>${p.badge?`<div class="badge">${esc(p.badge)}</div>`:''}</div>
        <div class="preis"><b>${eur(p.price)}</b><span>pro Saison</span></div>
        <div class="feat">${p.feat.map(x=>`<div>${esc(x)}</div>`).join('')}</div>
        <div class="frei${f===0?' aus':f<=3?' eng':''}"><i></i><span>${freiTxt(f,max)}</span></div>
        <button class="waehl" type="button" data-wahl="${p.id}"${f===0?' disabled':''}>${f===0?'Ausgebucht':'Dieses Paket wählen'}</button></div></div>`; }).join('');
    T.querySelectorAll('[data-tab]').forEach(b=>b.onclick=()=>{ S.tab=+b.dataset.tab; karten(); });
    St.querySelectorAll('[data-wahl]').forEach(b=>b.onclick=()=>{ S.pkg=b.dataset.wahl; S.tab=PK.findIndex(p=>p.id===S.pkg); karten(); auswahl(); antragTeil(); setTimeout(()=>zu('auswahl'),40); });
    // Wischen zwischen den Karten
    if(!St._w){ St._w=1; let x0=null; St.addEventListener('touchstart',e=>{ x0=e.touches[0].clientX; },{passive:true});
      St.addEventListener('touchend',e=>{ if(x0==null)return; const dx=e.changedTouches[0].clientX-x0; x0=null; if(Math.abs(dx)<50)return; S.tab=(S.tab+(dx<0?1:n-1))%n; karten(); },{passive:true}); }
  }

  function auswahl(){
    const A=document.getElementById('auswahlIn'); if(!A)return; const c=calc(), P=c&&c.P;
    A.innerHTML=`<div class="k" style="color:var(--grau)">Schritt 1</div><h2 class="g" style="font-size:44px;margin-top:8px">Paket wählen.</h2>
      <div style="margin-top:22px;display:flex;flex-direction:column;gap:10px">${PK.map(p=>{ const on=S.pkg===p.id, k=K[p.id]||{max:0,belegt:0}, f0=frei(p.id), f=Math.max(0,f0-(on?1:0)), pct=k.max?Math.min(100,Math.round((k.belegt+(on?1:0))/k.max*100)):0, eng=f0<=3;
        return `<button type="button" class="zeile${on?' on':''}${f0===0?' voll':''}" data-pick="${p.id}"${f0===0?' disabled':''}><div class="zeile-k"><div class="punkt"></div><div class="zeile-n"><b>${esc(p.name)}</b><small>${esc(p.sub)}</small></div><div class="zeile-p">${eur(p.price)}</div></div>
          <div class="balken"><div><i class="${eng?'eng':''}" style="width:${pct}%"></i></div><span class="${eng?'eng':''}">${f0===0?'ausgebucht':`noch ${f0} von ${k.max} frei`}</span></div>
          ${f0>0&&f0<=3?`<div class="knapp">${f0===1?'Letzter Platz':'Nur noch '+f0+' Plätze'}</div>`:''}</button>`; }).join('')}</div>
      ${P?`<div class="k" style="color:var(--grau);margin-top:44px">Schritt 2</div><h2 class="g" style="font-size:44px;margin-top:8px">Bausteine dazu.</h2>
        <div style="margin-top:22px;display:flex;flex-direction:column;gap:10px">${BS.filter(b=>!(((D&&D.passung)||{}).ohne||[]).includes(b.k)).map(b=>{ const pr=b.k==='sotd'?sotdPreis(P.id):b.preis;
          return `<div class="bs"><div class="bs-t"><b>${esc(b.t)}</b><span>${esc(b.d)}</span></div>${b.k==='sotd'&&P.id==='p1896'?'<div class="inkl">1 × inklusive</div>':''}
            <div class="menge"><small>${b.k==='sotd'&&P.id==='p1896'?'weitere ':''}je ${eur(pr)}</small><button type="button" data-m="${b.k}" data-d="-1" aria-label="weniger">−</button><b>${S.b[b.k]||0}</b><button type="button" class="p" data-m="${b.k}" data-d="1" aria-label="mehr">+</button></div></div>`; }).join('')}
          <button type="button" class="bs" data-rec="1" style="cursor:pointer;text-align:left;font:inherit;color:inherit;width:100%"><div class="hak${S.rec?' on':''}">${S.rec?'✓':''}</div><div class="bs-t"><b>Recruiting &amp; Job-Posts</b><span>Fachkräfte und Azubis aus der Region erreichen. Wir machen Ihnen ein Angebot.</span></div>${P.id==='premium'||P.id==='p1896'?'<small style="font-size:13px;font-weight:700;color:var(--blau)">teils inklusive</small>':''}</button></div>
        <div class="k" style="color:var(--grau);margin-top:44px">Schritt 3</div><h2 class="g" style="font-size:44px;margin-top:8px">Laufzeit.</h2>
        <div class="opts">${[1,2,3].map(y=>`<button type="button" class="opt${S.years===y?' on':''}" data-y="${y}"><b>${LZ[y][0]}</b><small>${LZ[y][1]}</small></button>`).join('')}</div>
        <div class="opts" style="margin-top:10px">${[['sofort','Ab sofort','noch in dieser Saison'],['2728','Ab Saison 27/28','ab Sommer 2027']].map(([k,l,n])=>`<button type="button" class="opt${S.start===k?' on':''}" data-st="${k}"><b style="font-size:19px">${l}</b><small>${n}</small></button>`).join('')}</div>
        <div class="summe"><div><span>${esc(P.name)}</span><span>${eur(P.price)}${c.rab?' − '+Math.round(c.rab*100)+' %':''}</span></div>
          ${BS.filter(b=>S.b[b.k]).map(b=>`<div class="z"><span>${S.b[b.k]} × ${esc(b.t)}</span><span>${eur(S.b[b.k]*(b.k==='sotd'?sotdPreis(P.id):b.preis))}</span></div>`).join('')}
          ${S.rec?'<div class="z"><span>Recruiting &amp; Job-Posts</span><span>Angebot folgt</span></div>':''}
          <div class="s"><span style="font-size:15px;color:var(--hb2)">pro Saison${c.rab?', inkl. '+Math.round(c.rab*100)+' % Mehrjahresvorteil':''}</span><b>${eur(c.season)}</b></div>
          <div class="z"><span>Gesamt · ${LZ[S.years][0]}</span><span>${eur(c.total)}</span></div>
          <small>Alle Preise netto. Der Laufzeitvorteil gilt für das Paket, Bausteine zum regulären Preis.</small></div>
        <button type="button" class="knopf-o" data-zu="antrag" style="margin-top:18px">Weiter zu Angebot &amp; Antrag ↓</button>`:''}`;
    A.querySelectorAll('[data-pick]').forEach(b=>b.onclick=()=>{ S.pkg=b.dataset.pick; S.tab=PK.findIndex(p=>p.id===S.pkg); auswahl(); karten(); antragTeil(); });
    A.querySelectorAll('[data-m]').forEach(b=>b.onclick=()=>{ const k=b.dataset.m, m=(BS.find(x=>x.k===k)||{}).max||5; S.b[k]=Math.max(0,Math.min(m,(S.b[k]||0)+(+b.dataset.d))); auswahl(); antragSumme(); });
    A.querySelectorAll('[data-rec]').forEach(b=>b.onclick=()=>{ S.rec=!S.rec; auswahl(); antragSumme(); });
    A.querySelectorAll('[data-y]').forEach(b=>b.onclick=()=>{ S.years=+b.dataset.y; auswahl(); antragSumme(); });
    A.querySelectorAll('[data-st]').forEach(b=>b.onclick=()=>{ S.start=b.dataset.st; auswahl(); antragSumme(); });
    A.querySelectorAll('[data-zu]').forEach(b=>b.onclick=()=>zu(b.dataset.zu));
  }

  // Antrag: Felder und Unterschrift bleiben stehen, nur die Zusammenfassung wird neu gezeichnet
  let F=null;
  function antragTeil(){
    const A=document.getElementById('antragIn'); if(!A)return; const c=calc();
    if(S.sent==='antrag'){ A.innerHTML=`<div class="k" style="color:var(--hb)">Geschafft</div><div class="danke"><b>Danke, ${esc(F.firma||D.firma)}!</b><div class="hand">Willkommen in der Familie.</div>
      <p>Ihr Antrag ist bei uns. Eine Kopie mit Ihrer Unterschrift kommt per Mail an ${esc(F.email)}. Wir melden uns persönlich bei Ihnen.</p></div>`; return; }
    if(!c){ A.innerHTML=`<div class="k" style="color:var(--hb)">Schritt 4</div><h2 class="g" style="font-size:44px;margin-top:8px">Angebot &amp; Antrag.</h2>
      <p style="margin:18px 0 0;font-size:18px;line-height:1.5;color:var(--hb2)">Wählen Sie oben ein Paket, dann ist Ihr Antrag hier bereits ausgefüllt.</p>
      <button type="button" class="knopf-w" data-zu="auswahl">Zu den Paketen ↑</button>`; A.querySelector('[data-zu]').onclick=()=>zu('auswahl'); return; }
    if(A.querySelector('#pdForm')){ antragSumme(); return; }
    F=F||{firma:D.firma||'',anrede:D.anrede||'',ansprech:D.ansprech||'',email:D.email||'',adresse:D.adresse||''};
    A.innerHTML=`<div class="k" style="color:var(--hb)">Schritt 4</div><h2 class="g" style="font-size:44px;margin-top:8px">Angebot &amp; Antrag.</h2>
      <form id="pdForm" autocomplete="on" onsubmit="return false"><div class="felder">
        <label>Unternehmen<input name="firma" autocomplete="organization" maxlength="120" value="${esc(F.firma)}"></label>
        <label>Ansprechpartner<span style="display:flex;gap:6px"><select name="anrede" style="width:96px;flex:none"><option value=""${!F.anrede?' selected':''}>Anrede</option><option${F.anrede==='Frau'?' selected':''}>Frau</option><option${F.anrede==='Herr'?' selected':''}>Herr</option></select><input name="ansprech" autocomplete="name" maxlength="80" value="${esc(F.ansprech)}" placeholder="Vor- und Nachname"></span></label>
        <label>E-Mail<input name="email" type="email" autocomplete="email" inputmode="email" maxlength="120" value="${esc(F.email)}" placeholder="name@firma.de"></label>
        <label>Adresse<input name="adresse" autocomplete="street-address" maxlength="160" value="${esc(F.adresse)}" placeholder="Straße, PLZ Ort"></label></div></form>
      <button type="button" class="knopf-w" id="pdAngebot">Angebot als PDF an mich senden</button><div class="msg" id="pdMsgA"></div>
      <div class="antrag"><div class="antrag-k"><b>Partnerantrag</b><img src="partner/svbsc.png" alt=""></div><div class="antrag-g" id="pdSum"></div>
        <button type="button" class="zust" id="pdZust"><div class="hak${S.zust?' on':''}">${S.zust?'✓':''}</div><span>Ich beantrage die Partnerschaft verbindlich zu den genannten Konditionen. Rechnung folgt durch den Verein.</span></button>
        <div class="sig-l">Unterschrift · ${new Date().toLocaleDateString('de-DE')}</div><canvas id="pdSig" aria-label="Unterschriftenfeld"></canvas>
        <div class="sig-f"><span>Mit Finger oder Maus unterschreiben</span><button type="button" id="pdSigX">Löschen</button></div>
        <button type="button" class="knopf-o" id="pdAntrag">Unterschrieben absenden</button><div class="msg" id="pdMsg"></div></div>
      <p class="hinweis">Lieber auf Papier? Im Angebots-PDF können Sie alles ausfüllen und unterschreiben und einfach auf die Mail antworten.</p>`;
    const fm=A.querySelector('#pdForm'); fm.addEventListener('input',e=>{ if(e.target.name){ F[e.target.name]=e.target.value; antragSumme(); } }); fm.addEventListener('change',e=>{ if(e.target.name){ F[e.target.name]=e.target.value; antragSumme(); } });
    A.querySelector('#pdZust').onclick=()=>{ S.zust=!S.zust; const h=A.querySelector('#pdZust .hak'); h.classList.toggle('on',S.zust); h.textContent=S.zust?'✓':''; };
    sigSetup(A.querySelector('#pdSig')); A.querySelector('#pdSigX').onclick=()=>sigClear();
    A.querySelector('#pdAngebot').onclick=()=>senden('angebot'); A.querySelector('#pdAntrag').onclick=()=>senden('antrag');
    antragSumme();
  }
  function antragSumme(){ const el=document.getElementById('pdSum'), c=calc(); if(!el)return antragTeil(); if(!c)return;
    const bs=BS.filter(b=>S.b[b.k]).map(b=>S.b[b.k]+' × '+b.t).concat(S.rec?['Recruiting & Job-Posts (Angebot folgt)']:[]);
    el.innerHTML=`<span>Unternehmen</span><b>${esc(F.firma||'')}</b><span>Paket</span><b>${esc(c.P.name)}</b>${bs.length?`<span>Bausteine</span><b>${esc(bs.join(', '))}</b>`:''}
      <span>Laufzeit</span><b>${esc(LZ[S.years][0])}, ${S.start==='2728'?'ab Saison 27/28':'ab sofort'}</b><span>Pro Saison</span><b>${eur(c.season)} netto</b><span>Gesamt</span><b>${eur(c.total)} netto</b>`; }

  let sigCtx=null, sigCv=null;
  function sigSetup(cv){ sigCv=cv; const r=cv.getBoundingClientRect(), d=window.devicePixelRatio||1; cv.width=Math.max(1,r.width*d); cv.height=Math.max(1,r.height*d);
    const x=cv.getContext('2d'); x.scale(d,d); x.lineWidth=2.4; x.lineCap='round'; x.lineJoin='round'; x.strokeStyle='#1d2760'; sigCtx=x; let dr=false;
    const pos=e=>{ const b=cv.getBoundingClientRect(); return [e.clientX-b.left,e.clientY-b.top]; };
    cv.onpointerdown=e=>{ dr=true; try{ cv.setPointerCapture(e.pointerId); }catch(_){} const [a,b]=pos(e); x.beginPath(); x.moveTo(a,b); };
    cv.onpointermove=e=>{ if(!dr)return; const [a,b]=pos(e); x.lineTo(a,b); x.stroke(); S.signed=true; };
    cv.onpointerup=cv.onpointercancel=()=>{ dr=false; }; }
  function sigClear(){ if(!sigCv)return; sigCtx.save(); sigCtx.setTransform(1,0,0,1,0,0); sigCtx.clearRect(0,0,sigCv.width,sigCv.height); sigCtx.restore(); S.signed=false; }
  function sigPng(){ // auf weißem Grund, verkleinert (für PDF und Speicher)
    const o=document.createElement('canvas'), w=Math.min(900,sigCv.width), h=Math.round(sigCv.height*w/sigCv.width); o.width=w; o.height=h; const x=o.getContext('2d'); x.fillStyle='#fff'; x.fillRect(0,0,w,h); x.drawImage(sigCv,0,0,w,h); return o.toDataURL('image/png'); }

  async function senden(art){
    if(S.busy)return; const c=calc(), msg=document.getElementById(art==='antrag'?'pdMsg':'pdMsgA'); msg.classList.remove('err'); msg.textContent='';
    const fehl=t=>{ msg.textContent=t; msg.classList.add('err'); };
    if(!c)return fehl('Bitte oben ein Paket wählen.');
    if(!F.firma||F.firma.trim().length<2)return fehl('Bitte den Firmennamen eintragen.');
    if(!/^[^@\s]+@[^@\s]+\.[a-z]{2,}$/i.test((F.email||'').trim()))return fehl('Bitte eine gültige E-Mail eintragen.');
    if(art==='antrag'){ if(!(F.ansprech||'').trim())return fehl('Bitte den Ansprechpartner eintragen.'); if(!S.zust)return fehl('Bitte die Bestätigung ankreuzen.'); if(!S.signed)return fehl('Bitte unterschreiben.'); }
    S.busy=true; const btn=document.getElementById(art==='antrag'?'pdAntrag':'pdAngebot'); btn.disabled=true; const alt=btn.textContent; btn.textContent='Wird gesendet …';
    try{
      const body={art,stufe:c.P.id,saisons:S.years,start:S.start,recruiting:S.rec,bausteine:BS.filter(b=>S.b[b.k]).map(b=>({k:b.k,n:S.b[b.k]})),
        firma:F.firma.trim(),anrede:F.anrede||'',ansprech:(F.ansprech||'').trim(),email:F.email.trim(),adresse:(F.adresse||'').trim(),zustimmung:art==='antrag'&&S.zust,unterschrift:art==='antrag'?sigPng():null};
      const r=await rpc('partner_anfrage',{p_code:code,p:body}); if(r&&r.kontingente)K=r.kontingente;
      if(art==='antrag'){ S.sent='antrag'; karten(); auswahl(); antragTeil(); zu('antrag'); try{ navigator.vibrate&&navigator.vibrate([20,40,20]); }catch(e){} }
      else { msg.textContent='✓ Das Angebot ist unterwegs an '+F.email.trim()+'. Schauen Sie gleich ins Postfach.'; toast('✓ Angebot kommt per Mail'); }
    }catch(e){ fehl(e.message); }
    finally{ S.busy=false; if(btn.isConnected){ btn.disabled=false; btn.textContent=alt; } }
  }
  window.addEventListener('hashchange',()=>location.reload());
  laden();
})();
