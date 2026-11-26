/* Personal presentation links, functional snapshots and voluntary later-use statistics.
   No third-party analytics, coordinates, device IDs, automatic mail or guessed probability. */
(function(root){
  'use strict';
  const FIELDS=['firma','anrede','ansprech','email','adresse','strasse','plz','ort','ustid','web','telefon'];
  const SCENES=['start','worum','verb','antrieb','buehne','groesse','platz','extras','bon','ja'];
  const ACTIONS=['sicht','weiter','zurueck','auswahl','preis','3d','angebot','vertrag','info','scroll'];
  const esc=s=>String(s==null?'':s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const str=(v,n=200)=>String(v==null?'':v).replace(/[\u0000-\u001f]/g,' ').slice(0,n);
  const tokenOK=s=>typeof s==='string'&&/^[a-zA-Z0-9_-]{20,128}$/.test(s);
  const own=(o,k)=>Object.prototype.hasOwnProperty.call(o||{},k);
  function cleanSnapshot(raw){
    raw=raw&&typeof raw==='object'?raw:{};const st=raw.stand&&typeof raw.stand==='object'?raw.stand:{},w=raw.wahl&&typeof raw.wahl==='object'?raw.wahl:{},f=raw.felder&&typeof raw.felder==='object'?raw.felder:{};
    const stand={};
    for(const k of ['name','verb','platz','jahr','ja','weg','wann','paket','aermel','eigen'])if(typeof st[k]==='string')stand[k]=str(st[k],k==='name'?120:90);
    if(['trikot','auswaerts','anzug'].includes(st.kleidung))stand.kleidung=st.kleidung;
    if(['aermel_l','aermel_r'].includes(st.anzug_seite))stand.anzug_seite=st.anzug_seite;
    if(['b','c1','c2','d1','d2','d3','e1','e2','f','g'].includes(st.anzug_team))stand.anzug_team=st.anzug_team;
    for(const k of ['i','groesse','pi','laufzeit'])if(Number.isFinite(+st[k])&&st[k]!==null)stand[k]=Math.max(-1,Math.min(20,+st[k]));
    for(const k of ['skeptisch','auto','verl'])if(typeof st[k]==='boolean')stand[k]=st[k];
    for(const k of ['antrieb','extras','info'])if(Array.isArray(st[k]))stand[k]=st[k].filter(x=>typeof x==='string'&&/^[a-z0-9_-]{1,60}$/.test(x)).slice(0,24);
    // 0.99.169: Mannschaft je Baustein vom Schwarzen Brett
    if(st.teams&&typeof st.teams==='object'&&!Array.isArray(st.teams)){const t={};for(const k of Object.keys(st.teams).slice(0,16))if(/^[a-z0-9_]{2,40}$/.test(k)&&typeof st.teams[k]==='string'&&/^[a-z0-9]{1,12}$/.test(st.teams[k]))t[k]=st.teams[k];stand.teams=t;}
    const positionen=(Array.isArray(w.positionen)?w.positionen:[]).slice(0,30).filter(x=>x&&typeof x.key==='string'&&/^[a-z0-9_-]{1,60}$/.test(x.key)).map(x=>({key:x.key,menge:Number.isFinite(+x.menge)?Math.max(1,Math.min(1000,+x.menge)):1,...(typeof x.mannschaft==='string'?{mannschaft:str(x.mannschaft,80)}:{})}));
    const wahl={positionen,saisons:[1,2,3,4,5].includes(+w.saisons)?+w.saisons:1,auto_verlaengerung:!!w.auto_verlaengerung};
    if(/^\d{4}-\d{2}-\d{2}$/.test(w.beginn||''))wahl.beginn=w.beginn;
    if(typeof w.konditionen_id==='string')wahl.konditionen_id=str(w.konditionen_id,80);
    if(typeof w.angebot_nr==='string')wahl.angebot_nr=str(w.angebot_nr,80);
    const felder={};for(const k of FIELDS)if(own(f,k)&&typeof f[k]==='string')felder[k]=str(f[k],k==='adresse'?400:120);
    return {stand,wahl,felder};
  }
  function shareURL(origin,code,token,qr,kurz=false,angebot=false){
    if(!/^[a-f0-9]{32}$/.test(code||''))throw Error('Der persönliche Präsentationslink fehlt.');
    const u=new URL('partner.html',origin+'/');u.search=angebot?'?angebot=1':'?reise=1';if(!angebot&&kurz&&tokenOK(token))u.searchParams.set('kurz','1');const h=new URLSearchParams({d:code});if(tokenOK(token))h.set('teilen',token);if(qr)h.set('qr','1');u.hash=h.toString();return u.href;
  }
  const RULES={cleanSnapshot,shareURL,tokenOK,SCENES,ACTIONS};
  if(typeof module!=='undefined'&&module.exports){module.exports=RULES;return;}
  const document=root.document;let cfg=null,frameReady=null,latestStand=null,resumeStand=null,legacySID=null,shareToken=null,visitor=null,loaded=null,sessionStarted=false,beginning=null,generation=0,started=false,internal=false,excluded=false,ownShare=false,modal=null,consent=null,heartbeat=null,saveTimer=null,lastSaved='',saveRunning=false,savePromise=null,saveAgain=false,active=0,lastTick=0,lastInteraction=0,seq=0,queue=[],sending=false,scene='start',lastActionKey='',lastActionAt=0,lastUseAt=Date.now(),hiddenAt=0,lastScrollIntent=0,renewing=false,sharePreparing=null;
  const uid=()=>{if(root.crypto?.randomUUID)return root.crypto.randomUUID();if(!root.crypto?.getRandomValues)throw Error('Dieser Browser kann noch keinen sicheren Link erzeugen. Bitte nutze einen aktuellen Browser.');const b=root.crypto.getRandomValues(new Uint8Array(16));b[6]=(b[6]&15)|64;b[8]=(b[8]&63)|128;const h=Array.from(b,x=>x.toString(16).padStart(2,'0')).join('');return h.slice(0,8)+'-'+h.slice(8,12)+'-'+h.slice(12,16)+'-'+h.slice(16,20)+'-'+h.slice(20);};
  const $=s=>document.querySelector(s);
  const frame=()=>$('#reiseRahmen');
  const hasFrame=()=>!!frame();
  const errorText=e=>e&&e.message&&!/fetch|network|failed|load|TypeError/i.test(e.message)?e.message:'Die Verbindung ist gerade weg. Deine Eingaben bleiben auf diesem Gerät. Bitte versuche es erneut.';
  const checked=r=>{if(!r||r.ok!==true)throw Error('Der geteilte Stand konnte nicht bestätigt werden. Bitte versuche es erneut oder lass einen neuen Link anlegen.');return r;};
  const notify=t=>{if(cfg?.toast)cfg.toast(t);else{let x=$('#pdShareStatus');if(!x){x=document.createElement('p');x.id='pdShareStatus';x.className='pd-share-status';x.setAttribute('role','status');document.body.appendChild(x);}x.textContent=t;}};
  const publicFields=()=>{if(!cfg)return cleanSnapshot({});const raw=cfg.snapshot(latestStand);return cleanSnapshot(Object.assign({},raw,{stand:latestStand||raw.stand||{}}));};
  function localRead(key){try{return localStorage.getItem(key);}catch(e){return null;}}
  function localWrite(key,value){try{localStorage.setItem(key,value);}catch(e){}}
  function internMarker(){if(!cfg)return false;const t=+localRead('pd-vorschau:'+cfg.code);return Number.isFinite(t)&&t>Date.now()-30*864e5;}
  function freshInternal(){return !!(cfg?.intern&&cfg.intern())||internMarker()||new URLSearchParams(location.search).get('intern')==='1';}
  function post(data){frame()?.contentWindow?.postMessage(data,location.origin);}
  // 0.99.169: Jeder Tipp liegt sofort auch auf dem Gerät. Bricht der Browser ab, bevor der Server geantwortet hat, zählt beim nächsten Öffnen der neuere Stand.
  function lokalMerken(){if(cfg&&latestStand)localWrite('reise-lok-'+cfg.code,JSON.stringify({t:Date.now(),stand:latestStand}));}
  function lokalLesen(am){try{const l=JSON.parse(localRead('reise-lok-'+cfg.code)||'null');if(!l||!l.stand||typeof l.stand!=='object'||!Number.isFinite(+l.t)||Date.now()-l.t>30*864e5)return null;if(am&&!(l.t>Date.parse(am)))return null;return {t:+l.t,stand:cleanSnapshot({stand:l.stand}).stand};}catch(e){return null;}}
  function context(){
    if(!cfg)return;internal=freshInternal();
    if(internal)localWrite('pd-vorschau:'+cfg.code,String(Date.now()));
    const snap=loaded?.snapshot||null;
    const kurz=!!snap&&new URLSearchParams(location.search).get('kurz')==='1'&&snap.stand?.paket==='club'&&snap.wahl?.positionen?.some(p=>['aermel_anzug_r','aermel_anzug_l'].includes(p.key));
    const am=loaded?.am||resumeStand?.am||null,lok=latestStand?null:lokalLesen(am);
    post({reise:'teilen-kontext',kurz,termin:!!cfg.intern(),merken:true,stand:latestStand||lok?.stand||snap?.stand||resumeStand?.stand||null,am:lok?new Date(lok.t).toISOString():am});
  }
  function rahmenBereit(f){if(f&&f===frame())frameReady=f;if(cfg)context();}
  function focusables(d){return [...d.querySelectorAll('button,a[href],input,select,textarea,[tabindex]')].filter(x=>!x.disabled&&x.tabIndex>=0&&x.getClientRects().length);}
  function closeModal(replacing=false){
    if(!modal)return;const m=modal;modal=null;document.removeEventListener('keydown',m.keys,true);m.node.remove();
    if(!replacing){let target=m.opener;if(!target?.isConnected){const code=target?.getAttribute?.('data-pdnutzung');target=target?.id?document.getElementById(target.id):/^[a-f0-9]{32}$/.test(code||'')?document.querySelector('[data-pdnutzung="'+code+'"]'):null;}if(target?.isConnected)target.focus({preventScroll:true});post({reise:'teilen-zu'});}
  }
  function dialog(title,body){
    const opener=modal?.opener?.isConnected?modal.opener:document.activeElement;closeModal(true);const d=document.createElement('div');d.className='pd-share-backdrop';
    d.innerHTML='<section class="pd-share-dialog" role="dialog" aria-modal="true" aria-labelledby="pdShareTitle"><header><div><p class="pd-share-kicker">SV/BSC Mörlenbach</p><h2 id="pdShareTitle" tabindex="-1">'+esc(title)+'</h2></div><button type="button" class="pd-share-x" aria-label="Schließen">×</button></header>'+body+'</section>';
    const keys=e=>{if(e.key==='Escape'){e.preventDefault();e.stopPropagation();closeModal();return;}if(e.key!=='Tab')return;const f=focusables(d),first=f[0],last=f[f.length-1];if(!first)return;if(e.shiftKey&&(document.activeElement===first||!f.includes(document.activeElement))){e.preventDefault();last.focus();}else if(!e.shiftKey&&(document.activeElement===last||!d.contains(document.activeElement))){e.preventDefault();first.focus();}};
    modal={node:d,keys,opener};(opener?.closest?.('dialog[open]')||document.body).appendChild(d);document.addEventListener('keydown',keys,true);d.querySelector('.pd-share-x').onclick=closeModal;d.querySelector('h2').focus({preventScroll:true});return d;
  }
  function shareButton(){
    if(!cfg||$('#pdTeilen'))return;
    const b=document.createElement('button');b.type='button';b.id='pdTeilen';b.className='pd-share-icon';b.setAttribute('aria-label','Diese Präsentation teilen');b.innerHTML='<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" aria-hidden="true"><path d="M12 15V3m-4 4 4-4 4 4M7 11H5a1 1 0 0 0-1 1v8h16v-8a1 1 0 0 0-1-1h-2"/></svg>';b.onclick=()=>openShare();document.body.appendChild(b);
    const observer=new MutationObserver(()=>{b.hidden=hasFrame();});observer.observe(document.body,{childList:true});b.hidden=hasFrame();
  }
  async function prepare(options){
    cfg=options;legacySID=uid();const h=new URLSearchParams(location.hash.slice(1));shareToken=h.get('teilen');if(h.has('teilen')&&!tokenOK(shareToken))throw Error('Dieser geteilte Link ist unvollständig. Bitte öffne den ganzen Link aus der Nachricht.');
    internal=freshInternal();if(internal)localWrite('pd-vorschau:'+cfg.code,String(Date.now()));
    if(shareToken){try{loaded=await cfg.rpc('partner_teilen_lesen',{p_token:shareToken});if(!loaded)throw Error('Dieser geteilte Stand ist nicht mehr aktiv. Bitte lass dir einen neuen Link geben.');if(loaded.code!==cfg.code)throw Error('Der geteilte Stand gehört nicht zu dieser Präsentation.');latestStand=cleanSnapshot(loaded.snapshot||{}).stand;}catch(e){loaded=null;shareToken=null;throw e;}}
    else{try{resumeStand=await cfg.rpc('partner_reise_stand',{p_code:cfg.code});if(resumeStand?.stand)latestStand=cleanSnapshot({stand:resumeStand.stand}).stand;}catch(e){resumeStand=null;}
      const lok=lokalLesen(resumeStand?.am||null);if(lok&&resumeStand!==null){latestStand=lok.stand;resumeStand=Object.assign({},resumeStand||{},{stand:lok.stand,am:new Date(lok.t).toISOString()});}}
    return loaded;
  }
  function start(){
    if(started)return;started=true;shareButton();context();
    document.addEventListener('input',()=>scheduleSave(),{passive:true});document.addEventListener('change',()=>scheduleSave(),{passive:true});
    document.addEventListener('click',e=>{if(!e.isTrusted||e.target.closest('.pd-share-backdrop,.pd-share-consent,.pd-share-icon'))return;interact(parentScene(),classify(e.target));},{passive:true});
    for(const type of ['wheel','touchmove','keydown'])document.addEventListener(type,e=>{if(e.isTrusted)lastScrollIntent=Date.now();},{passive:true});
    document.addEventListener('scroll',()=>{if(!hasFrame()&&Date.now()-lastScrollIntent<1500)interact(parentScene(),'scroll');},{passive:true});
    document.addEventListener('visibilitychange',()=>{if(document.hidden){tick();hiddenAt=Date.now();saveNow();flush();}else{lastTick=performance.now();if(hiddenAt&&Date.now()-hiddenAt>=30*60e3)renewSession();hiddenAt=0;}});
    root.addEventListener('pagehide',()=>{tick();saveNow();flush();});
    if(shareToken)beginSession();
  }
  function parentScene(){
    const map={start:'start',passung:'antrieb',verein:'worum',pakete:'groesse',bausteine:'extras',auftritt:'buehne',baukasten:'bon',abschluss:'ja'};let best='start',distance=Infinity;
    for(const [id,name]of Object.entries(map)){const e=document.getElementById(id);if(!e||e.hidden)continue;const r=e.getBoundingClientRect();if(r.bottom<60||r.top>innerHeight)continue;const dist=Math.abs(r.top-90);if(dist<distance){best=name;distance=dist;}}
    return best;
  }
  function classify(el){if(el.closest('[data-bdpaket],#bdPlatzwahl,[data-av],#avB'))return '3d';if(el.closest('[data-weg="angebot"]'))return 'angebot';if(el.closest('[data-weg="vertrag"]'))return 'vertrag';if(el.closest('[data-k],input,select,[aria-pressed],.knopf-o'))return 'auswahl';if(el.closest('summary,[aria-expanded]'))return 'info';return 'weiter';}
  function beginSession(){
    if(sessionStarted||!shareToken||!cfg)return beginning||Promise.resolve();sessionStarted=true;const current=++generation;
    beginning=(async()=>{try{
      const result=await cfg.rpc('partner_teilen_beginnen',{p_token:shareToken,p_client:uid(),p_intern:internal,p_qr:new URLSearchParams(location.hash.slice(1)).get('qr')==='1'});
      if(current!==generation)return;visitor=result;
      if(!visitor||!visitor.id||!visitor.besuch_token)throw Error('Die Sitzung lässt sich gerade nicht sichern.');
      if(visitor.internausschluss){excluded=true;return;}
      const remembered=localRead('pd-statistik:'+shareToken);if(remembered==='nein')await chooseConsent(false);else if(remembered==='ja')await chooseConsent(true);else consentBar();
    }catch(e){if(current!==generation)return;visitor=null;sessionStarted=false;notify('Der gespeicherte Stand bleibt erreichbar. Die Nutzung wird gerade nicht ausgewertet.');}
    finally{if(current===generation)beginning=null;}})();return beginning;
  }
  async function renewSession(){
    if(renewing||!shareToken||!visitor)return;renewing=true;
    // A genuine later visit can start in the same tab. Never reclassify the old QR session.
    generation++;beginning=null;consent=null;excluded=false;visitor=null;sessionStarted=false;queue=[];active=0;seq=0;lastTick=performance.now();lastInteraction=lastTick;lastUseAt=Date.now();
    if(heartbeat){clearInterval(heartbeat);heartbeat=null;}$('#pdStatToggle')?.remove();$('#pdStatConsent')?.remove();
    try{await beginSession();}finally{renewing=false;}
  }
  function consentBar(){
    if(internal||excluded||!visitor||$('#pdStatConsent'))return;const b=document.createElement('section');b.id='pdStatConsent';b.className='pd-share-consent';b.setAttribute('aria-label','Freiwillige Nutzungsstatistik');
    b.innerHTML='<p><strong>Dürfen wir eure spätere Nutzung sehen?</strong><span>Der Verein sieht dann, welche Bereiche über diesen Firmenlink angesehen werden. Keine Geräteerkennung. Ohne Statistik funktioniert alles genauso.</span></p><div><button type="button" data-consent="ja">Aktivität teilen</button><button type="button" data-consent="nein">Ohne Statistik weiter</button><button type="button" data-consent="intern" class="pd-share-plain">Ich zeige die Präsentation für den Verein</button></div>';
    b.querySelector('[data-consent="ja"]').onclick=()=>chooseConsent(true);b.querySelector('[data-consent="nein"]').onclick=()=>chooseConsent(false);b.querySelector('[data-consent="intern"]').onclick=()=>{localWrite('pd-vorschau:'+cfg.code,String(Date.now()));internal=true;chooseConsent(false);};document.body.appendChild(b);
  }
  async function chooseConsent(yes){
    if(!visitor)return;const v=visitor;consent=!!yes;localWrite('pd-statistik:'+shareToken,yes?'ja':'nein');$('#pdStatConsent')?.remove();
    active=0;lastTick=performance.now();lastInteraction=lastTick;queue=[];
    try{const result=checked(await cfg.rpc('partner_teilen_ereignis',{p_token:shareToken,p_besuch:v.id,p_besuch_token:v.besuch_token,p:{seq:++seq,einwilligung:!!yes,aktiv_delta:0,szene:scene,aktion:'sicht'}}));if(visitor===v&&result.internausschluss){excluded=true;consent=false;return;}}catch(e){if(visitor!==v)return;consent=false;notify('Die Wahl konnte nicht gespeichert werden. Es wird keine Nutzungsstatistik erfasst.');return;}
    if(visitor!==v)return;
    if(yes&&!internal&&!excluded){if(!heartbeat)heartbeat=setInterval(()=>{tick();queueEvent('sicht');flush();},10000);statToggle();}
    else{$('#pdStatToggle')?.remove();if(heartbeat){clearInterval(heartbeat);heartbeat=null;}}
  }
  function statToggle(){if($('#pdStatToggle'))return;const b=document.createElement('button');b.type='button';b.id='pdStatToggle';b.className='pd-stat-toggle';b.textContent='Aktivität teilen: an · Ausschalten';b.onclick=()=>chooseConsent(false);document.body.appendChild(b);}
  function tick(){const now=performance.now();if(lastTick&&consent===true&&!internal&&!excluded&&!document.hidden&&now-lastInteraction<=60000)active+=Math.max(0,Math.min(15,(now-lastTick)/1000));lastTick=now;}
  function interact(next,action){
    if(!SCENES.includes(next)||!ACTIONS.includes(action))return;const idle=Date.now()-lastUseAt;lastUseAt=Date.now();scene=next;if(idle>=30*60e3&&visitor){renewSession();return;}tick();lastInteraction=performance.now();
    if(consent!==true||internal||excluded)return;const key=next+'|'+action,now=Date.now();if(key===lastActionKey&&now-lastActionAt<1500)return;lastActionKey=key;lastActionAt=now;queueEvent(action);flush();
  }
  function queueEvent(action){if(!visitor||consent!==true||internal||excluded)return;const seconds=Math.min(30,Math.floor(active));if(action==='sicht'&&!seconds)return;active-=seconds;if(queue.length<80)queue.push({seq:++seq,aktiv_delta:seconds,szene:scene,aktion:action});}
  async function flush(){
    if(sending||!visitor||consent!==true||internal||excluded||!queue.length)return;const v=visitor;sending=true;
    try{while(queue.length&&consent===true&&!internal&&!excluded&&visitor===v){const p=queue[0],r=checked(await cfg.rpc('partner_teilen_ereignis',{p_token:shareToken,p_besuch:v.id,p_besuch_token:v.besuch_token,p}));if(visitor!==v)break;if(r.internausschluss){excluded=true;consent=false;queue=[];if(heartbeat){clearInterval(heartbeat);heartbeat=null;}$('#pdStatToggle')?.remove();break;}if(queue[0]===p)queue.shift();}}
    catch(e){/* Keep the same sequence for an idempotent retry. */}finally{sending=false;}
  }
  function scheduleSave(){if(!cfg||shareToken&&!visitor||!shareToken&&!latestStand)return;clearTimeout(saveTimer);saveTimer=setTimeout(saveNow,500);}
  async function saveNow(strict=false){
    clearTimeout(saveTimer);saveTimer=null;if(!cfg||shareToken&&!visitor||!shareToken&&!latestStand)return;if(saveRunning){saveAgain=true;if(strict){await savePromise;return saveNow(true);}return;}
    const p=shareToken?publicFields():{stand:latestStand,schritt:SCENES[Math.max(0,Math.min(SCENES.length-1,+latestStand.i||0))]},signature=(shareToken||'stand')+JSON.stringify(p);if(signature===lastSaved)return;saveRunning=true;
    // Since 219 the old RPC saves only the functional resume state, never telemetry.
    try{savePromise=shareToken?cfg.rpc('partner_teilen_fortsetzen',{p_token:shareToken,p_besuch:visitor.id,p_besuch_token:visitor.besuch_token,p}):cfg.rpc('partner_reise_merken',{p_code:cfg.code,p_sitzung:legacySID,p});checked(await savePromise);lastSaved=signature;}
    catch(e){if(strict)throw e;/* Parent keeps the same form on this device; retry at next interaction. */}finally{saveRunning=false;savePromise=null;if(saveAgain){saveAgain=false;scheduleSave();}}
  }
  async function ensureShare(){
    if(!cfg)throw Error('Die Präsentation wird noch geladen.');
    if(sharePreparing&&sharePreparing.cfg===cfg)return sharePreparing.promise;
    const requestCfg=cfg,code=cfg.code,row={cfg:requestCfg,promise:null};sharePreparing=row;
    row.promise=(async()=>{
      if(internal&&!ownShare){
        const result=await requestCfg.rpc('partner_teilen_anlegen',{p_code:code,p:Object.assign(publicFields(),{intern_sitzung:uid(),erinnern:false,erinnerung_tage:3})});
        if(cfg!==requestCfg)throw Error('Die Firma wurde inzwischen gewechselt. Öffne Teilen für die aktuelle Präsentation erneut.');
        if(!result||result.ok!==true||!tokenOK(result.token))throw Error('Der persönliche Link konnte nicht gespeichert werden.');
        shareToken=result.token;ownShare=true;loaded=result;generation++;beginning=null;visitor=null;sessionStarted=false;await beginSession();lastSaved=shareToken+JSON.stringify(publicFields());
      }else if(shareToken){if(!visitor)await beginSession();if(!visitor)throw Error('Die Eingaben lassen sich gerade nicht sichern. Bitte versuche es erneut.');await saveNow(true);}
      if(cfg!==requestCfg)throw Error('Die Firma wurde inzwischen gewechselt. Öffne Teilen für die aktuelle Präsentation erneut.');
      const st=latestStand||loaded?.snapshot?.stand;
      const kurz=st?.kleidung==='anzug'&&st.paket==='club'&&st.extras?.length===1&&['aermel_anzug_l','aermel_anzug_r'].includes(st.extras[0]);
      return {url:shareURL(location.origin,code,shareToken,false,kurz),qr:shareURL(location.origin,code,shareToken,true,kurz),gespeichert:!!shareToken,token:shareToken,code};
    })();
    try{return await row.promise;}finally{if(sharePreparing===row)sharePreparing=null;}
  }
  async function openShare(options={}){
    if(!cfg)return;const direkt=options.angebot===true,requestCfg=cfg,d=dialog(direkt?'Angebot teilen':'Präsentation teilen','<p class="pd-share-lead">Der persönliche Link wird vorbereitet.</p><p class="pd-share-feedback" role="status"></p>');
    try{const vorbereitet=await ensureShare();if(modal?.node!==d||cfg!==requestCfg)return;
      const links=direkt?Object.assign({},vorbereitet,{url:shareURL(location.origin,vorbereitet.code,vorbereitet.token,false,false,true),qr:shareURL(location.origin,vorbereitet.code,vorbereitet.token,true,false,true)}):vorbereitet;
      const firma=requestCfg.firma(),body=d.querySelector('.pd-share-dialog');
      const actions=`<div class="pd-share-ways"><button type="button" data-share="copy">Link kopieren</button><a data-share="whatsapp" target="_blank" rel="noopener noreferrer">WhatsApp</a><a data-share="email">E-Mail</a>${navigator.share?'<button type="button" data-share="system">Weitere Wege</button>':''}</div>`;
      body.insertAdjacentHTML('beforeend','<p class="pd-share-firma">'+esc(firma)+'</p><div class="pd-share-qr" aria-label="QR-Code nur für diese Präsentation"></div><p class="pd-share-explain">'+(links.gespeichert?'Der Link enthält die gesicherte Auswahl und Firmenangaben. Interne Notizen und Unterschriften sind nicht dabei.':'Der Link öffnet diese Präsentation. Für einen gemeinsamen gespeicherten Stand muss das Partner-Team den Link im Termin erstellen.')+'</p>'+actions+'<label class="pd-share-link-label">Persönlicher Link<input class="pd-share-link" readonly aria-label="Persönlicher Präsentationslink"></label><p class="pd-share-small">Wer diesen Link hat, kann die Präsentation und die mitgegebenen Angaben ansehen. Teile ihn mit den Zuständigen im Betrieb.</p>'+(ownShare?'<section class="pd-share-follow"><h3>Nach dem Termin</h3><p>Der erste QR-Aufruf und diese Vereinsvorschau zählen nicht. Aktiviere die spätere Auswertung erst, wenn du den Termin beendet hast.</p><label class="pd-share-check"><input type="checkbox" id="pdShareReminder"> Mich erinnern, wenn keine freigegebene spätere Nutzung erfasst wurde</label><label class="pd-share-days">Erinnerung nach <input type="number" min="1" max="30" value="3" id="pdShareDays"> Tagen</label><button type="button" class="pd-share-primary" data-share="end">Termin ist beendet, Nachverfolgung starten</button><button type="button" data-share="report">Aktivität ansehen</button><p class="pd-share-feedback" data-end-status role="status"></p></section>':internal?'<button type="button" data-share="report">Aktivität ansehen</button>':'')+'<p class="pd-share-feedback" data-feedback role="status"></p>');
      d.querySelector('.pd-share-lead').remove();const qr=d.querySelector('.pd-share-qr');qr.innerHTML=typeof PLIB!=='undefined'&&PLIB.qrSvg?PLIB.qrSvg(links.qr,480):'';const qrSvg=qr.querySelector('svg');if(qrSvg)qrSvg.setAttribute('aria-label','QR-Code für diese persönliche Präsentation');else qr.textContent='Der QR-Code ist gerade nicht verfügbar. Du kannst den Link kopieren.';
      const input=d.querySelector('.pd-share-link');input.value=links.url;input.onclick=()=>input.select();const txt='Unsere Partnerschaft mit dem SV/BSC Mörlenbach: '+firma+'\n'+links.url;
      d.querySelector('[data-share="whatsapp"]').href='https://wa.me/?text='+encodeURIComponent(txt);d.querySelector('[data-share="email"]').href='mailto:'+encodeURIComponent(requestCfg.email?.()||'')+'?subject='+encodeURIComponent('Partnerschaft mit dem SV/BSC Mörlenbach')+'&body='+encodeURIComponent(txt);
      d.querySelector('[data-share="copy"]').onclick=async()=>{try{await navigator.clipboard.writeText(links.url);d.querySelector('[data-feedback]').textContent='Link kopiert.';}catch(e){input.focus();input.select();d.querySelector('[data-feedback]').textContent='Der Link ist markiert. Du kannst ihn jetzt kopieren.';}};
      const system=d.querySelector('[data-share="system"]');if(system)system.onclick=()=>navigator.share({title:'Partnerschaft SV/BSC Mörlenbach',text:firma,url:links.url}).catch(e=>{if(e?.name!=='AbortError')d.querySelector('[data-feedback]').textContent='Teilen klappt gerade nicht. Kopiere den Link.';});
      const end=d.querySelector('[data-share="end"]');if(end)end.onclick=async()=>{end.disabled=true;try{checked(await requestCfg.rpc('partner_teilen_terminende',{p_token:links.token,p:{beendet:true,erinnern:d.querySelector('#pdShareReminder').checked,erinnerung_tage:Math.max(1,Math.min(30,+d.querySelector('#pdShareDays').value||3))}}));d.querySelector('[data-end-status]').textContent='Aktiv. Nur später neu begonnene, freiwillig freigegebene Nutzung wird gewertet.';end.textContent='Nachverfolgung ist aktiv';}catch(e){end.disabled=false;d.querySelector('[data-end-status]').textContent=errorText(e);}};
      const report=d.querySelector('[data-share="report"]');if(report)report.onclick=()=>openReport(links.code,requestCfg.rpc);
    }catch(e){if(modal?.node!==d)return;d.querySelector('.pd-share-lead').textContent=errorText(e);const retry=document.createElement('button');retry.type='button';retry.textContent='Noch einmal versuchen';retry.onclick=()=>openShare(options);d.querySelector('.pd-share-dialog').appendChild(retry);}
  }
  const SIGNAL={offen:'Noch kein belastbares Signal',orientiert:'Verein und Möglichkeiten angesehen',konkret:'Auswahl oder Preise betrachtet',vertieft:'Wiederholt mit dem Angebot beschäftigt',abgesagt:'Derzeit kein Interesse'};
  const SCENE_LABEL={start:'Start',worum:'Verein',verb:'Verbindung zum Verein',antrieb:'Ziele',buehne:'Auftritt',groesse:'Pakete',platz:'Platzwahl',extras:'Bausteine',bon:'Auswahl',ja:'Abschluss',pakete:'Pakete',bausteine:'Bausteine',baukasten:'Auswahl',abschluss:'Abschluss'};
  const date=t=>t?new Date(t).toLocaleString('de-DE',{timeZone:'Europe/Berlin',day:'2-digit',month:'2-digit',year:'numeric',hour:'2-digit',minute:'2-digit'}):'Noch keine';
  function reportCard(l){
    const signal=SIGNAL[l.interesse?.stufe]||'Noch kein belastbares Signal',visits=Array.isArray(l.sitzungen)?l.sitzungen:[];
    let html='<article class="pd-share-report"><h3>Link vom '+esc(date(l.am))+'</h3><dl><div><dt>Später angesehen</dt><dd>'+esc(+l.aufrufe||0)+' Sitzung'+(+l.aufrufe===1?'':'en')+'</dd></div><div><dt>Zuletzt</dt><dd>'+esc(date(l.zuletzt))+'</dd></div><div><dt>Auswertung ab</dt><dd>'+esc(l.aktiv_ab?date(l.aktiv_ab):'Termin noch nicht beendet')+'</dd></div></dl><h4>'+esc(signal)+'</h4>';
    if(Array.isArray(l.interesse?.gruende))html+='<ul>'+l.interesse.gruende.map(g=>'<li>'+esc(g)+'</li>').join('')+'</ul>';
    html+='<p>'+esc(l.interesse?.nachster_schritt||'Erst nachfragen, bevor du aus fehlender Statistik auf fehlendes Interesse schließt.')+'</p>';
    if(visits.length)html+='<details class="pd-share-visits"><summary>Einzelne spätere Sitzungen</summary><ul>'+visits.map(v=>'<li><strong>'+esc(date(v.am))+'</strong><span>'+esc(Math.round((+v.aktiv_s||0)/60*10)/10)+' Minuten aktiv</span><span>'+Object.keys(v.szenen||{}).map(k=>esc(SCENE_LABEL[k]||k)).join(', ')+'</span></li>').join('')+'</ul></details>';
    if(l.erinnern)html+='<p class="pd-share-small">Erinnerung '+esc(l.erinnerung_am?'gegeben am '+date(l.erinnerung_am):l.erinnern_am?'vorgemerkt für '+date(l.erinnern_am):'wird nach Terminende vorgemerkt')+'</p>';
    if(l.mein_link&&!l.aktiv_ab&&tokenOK(l.token))html+='<div class="pd-share-follow" data-pd-follow="'+esc(l.token)+'"><p>Du bist nicht mehr beim Betrieb? Starte jetzt die spätere Nachverfolgung. Frühere QR- und Vereinsansichten bleiben ausgeschlossen.</p><label class="pd-share-check"><input type="checkbox" data-follow-reminder> Mich erinnern, wenn keine freigegebene spätere Nutzung erfasst wurde</label><label class="pd-share-days">Erinnerung nach <input type="number" data-follow-days min="1" max="30" value="'+esc(+l.erinnerung_tage||3)+'"> Tagen</label><button type="button" class="pd-share-primary" data-follow-start>Termin ist beendet, Nachverfolgung starten</button><p class="pd-share-feedback" data-follow-status role="status"></p></div>';
    return html+'</article>';
  }
  async function openReport(code,rpc){
    const d=dialog('Spätere Nutzung','<p class="pd-share-lead">Aktivität wird geladen.</p>');
    try{
      const data=await rpc('partner_teilen_auswertung',{p_code:code});if(modal?.node!==d)return;d.querySelector('.pd-share-lead').remove();
      const links=Array.isArray(data?.links)?data.links:[];
      d.querySelector('.pd-share-dialog').insertAdjacentHTML('beforeend','<p class="pd-share-firma">'+esc(data?.firma||'Präsentation')+'</p><p class="pd-share-explain">'+esc(data?.hinweis||'Gezählt wird nur spätere Nutzung mit freiwilliger Statistik. Ein Aufruf über den Firmenlink beweist nicht, welche Person ihn geöffnet hat.')+'</p>'+(links.length?links.map(reportCard).join(''):'<p>Noch kein geteilter Link mit Nachverfolgung. Erstelle ihn über das Teilen-Symbol in der Präsentation.</p>'));
      d.querySelectorAll('[data-follow-start]').forEach(b=>b.onclick=async()=>{
        const card=b.closest('[data-pd-follow]'),status=card.querySelector('[data-follow-status]');b.disabled=true;
        try{await rpc('partner_teilen_terminende',{p_token:card.dataset.pdFollow,p:{beendet:true,erinnern:card.querySelector('[data-follow-reminder]').checked,erinnerung_tage:Math.max(1,Math.min(30,+card.querySelector('[data-follow-days]').value||3))}});status.textContent='Aktiv. Nur später neu begonnene, freiwillig freigegebene Nutzung wird gewertet.';b.textContent='Nachverfolgung ist aktiv';}
        catch(e){b.disabled=false;status.textContent=errorText(e);}
      });
    }catch(e){if(modal?.node===d)d.querySelector('.pd-share-lead').textContent=errorText(e);}
  }
  root.addEventListener('message',e=>{
    const f=frame();if(!f||e.source!==f.contentWindow||e.origin!==location.origin||!e.data||!cfg)return;
    if(e.data.reise==='bereit'){frameReady=f;context();return;}
    if(e.data.reise==='teilen-oeffnen'){openShare();return;}
    if(e.data.reise==='studio-oeffnen'){if(cfg.intern()&&typeof cfg.studio==='function')cfg.studio();return;}
    if(e.data.reise==='teilen-stat'&&e.data.vertraut===true){interact(str(e.data.szene,30),str(e.data.aktion,20));return;}
    if(e.data.reise==='teilen-szene'&&SCENES.includes(e.data.szene)){tick();scene=e.data.szene;return;}
    if(e.data.reise==='merken'&&e.data.daten?.stand){latestStand=cleanSnapshot({stand:e.data.daten.stand}).stand;lokalMerken();scheduleSave();}
    if((e.data.reise==='teilen-stand'||e.data.reise==='lokal')&&e.data.stand){latestStand=cleanSnapshot({stand:e.data.stand}).stand;lokalMerken();scheduleSave();}
  });
  root.PD_TEILEN={aktiv:true,vorbereiten:prepare,starten:start,rahmenBereit,oeffnen:openShare,auswertung:openReport,regeln:RULES};
  root.PD_TEILEN_APP={oeffnen:o=>openReport(o.code,o.rpc)};
})(typeof window!=='undefined'?window:globalThis);
