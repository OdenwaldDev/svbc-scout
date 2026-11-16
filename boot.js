/* =====================================================================
   SV/BSC Scout · Zugang: Anmeldung, Einladung, Laden der geschützten Daten
   Die öffentliche Seite enthält KEINE Spielerdaten. Erst nach erfolgreicher
   Anmeldung werden Datenbestand + App-Code geladen.
   ===================================================================== */
// Öffentliche Adresse der App: in der Store-App (Capacitor) immer die echte Webadresse, sonst der aktuelle Ort
function svBasis(){ try{ const C=window.Capacitor; if(C&&C.isNativePlatform&&C.isNativePlatform())return 'https://svbsc.kaderwerk.pro/'; }catch(e){} return location.origin+location.pathname.replace(/[^/]*$/,''); }

// Installieren (Android/Chrome): das Angebot des Browsers früh aufheben, die App fragt später dezent (svm50.js)
window.addEventListener('beforeinstallprompt',function(e){ e.preventDefault(); window.__svBip=e; });
(function(){
'use strict';
const CFG0=window.SVBC_CFG||{}, I=window.SVI;
// Demo-Zugang (Beta 0.66): eigene Demo-Datenbank mit erfundenen Daten (App-Prüfung, Screenshots, Vorführen).
// Wer sich mit einer Demo-Adresse anmeldet, arbeitet danach nur noch mit der Demo-Datenbank, bis zum Abmelden.
let CFG=CFG0;
try{ if(CFG0.demo&&CFG0.demo.url&&localStorage.getItem('svbc-backend')==='demo'){ CFG=Object.assign({},CFG0,{url:CFG0.demo.url,anon:CFG0.demo.anon,istDemo:true}); window.SVBC_CFG=CFG; document.documentElement.classList.add('demo-zugang'); } }catch(e){}
const istDemoMail=m=>!!(CFG0.demo&&(CFG0.demo.mails||[]).includes(String(m||'').trim().toLowerCase()));
const gate=document.getElementById('gate'), card=document.getElementById('gcard'), load=document.getElementById('gload');
const esc=s=>String(s==null?'':s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const ls={get(k){try{return localStorage.getItem(k);}catch(e){return null;}},set(k,v){try{v==null?localStorage.removeItem(k):localStorage.setItem(k,v);}catch(e){}}};
const ROLE_T={admin:'Admin',vorstand:'Vorstand',planer:'Kaderplaner',trainer:'Trainer',viewer:'Gast',jugend:'Jugendtrainer',spieler:'Spieler',helfer:'Helfer'};
const initials=n=>String(n||'?').trim().split(/\s+/).map(w=>w[0]).slice(0,2).join('').toUpperCase()||'?';
document.body.classList.add('gated');

if(!CFG.url||!CFG.anon||!window.supabase){
  card.innerHTML='<h2>Noch nicht eingerichtet</h2><p class="sub">Die Datenbank ist noch nicht verbunden. Bitte später erneut versuchen.</p>';
  showCard(); return;
}
// Speicher mit Rückfallebene: Klappt localStorage nicht (privater Modus, In-App-Browser) oder wird er von außen geleert, bleibt die Anmeldung im Speicher erhalten
const MEM={}, store={getItem:k=>{ try{ const v=localStorage.getItem(k); return v!=null?v:(k in MEM?MEM[k]:null); }catch(e){ return k in MEM?MEM[k]:null; } },
  setItem:(k,v)=>{ MEM[k]=v; try{ localStorage.setItem(k,v); }catch(e){} }, removeItem:k=>{ delete MEM[k]; try{ localStorage.removeItem(k); }catch(e){} }};
// Passkeys (Beta 0.77): Supabase Auth bietet sie als Beta, nur mit ausdrücklichem Einschalten im Client
const sb=window.supabase.createClient(CFG.url,CFG.anon,{auth:{persistSession:true,autoRefreshToken:true,detectSessionInUrl:false,storageKey:'svbc-auth',flowType:'implicit',storage:store,experimental:{passkey:true}}});
const SV=window.SVBC={sb,cfg:CFG,profile:null,offline:false,ROLE_T,initials,esc};
// Sitzung aus dem Einladungs-/Anmeldelink zusätzlich im Speicher halten: Wird der Browser-Speicher zwischendurch geleert
// (zweiter Tab mit demselben Link, In-App-Browser von WhatsApp …), lässt sie sich wiederherstellen statt „Auth session missing“.
let KEEP=null; const keepS=s=>{ if(s&&s.access_token&&s.refresh_token)KEEP={access_token:s.access_token,refresh_token:s.refresh_token}; };
async function keepNow(){ try{ const {data:{session}}=await sb.auth.getSession(); keepS(session); }catch(e){} }
async function ensureSession(){ const {data:{session}}=await sb.auth.getSession(); if(session)return true; if(!KEEP)return false; const {error}=await sb.auth.setSession(KEEP); return !error; }

/* ---------- kleine Helfer ---------- */
function showCard(){ gwClose(); load.classList.add('hide'); card.style.display=''; }
function loading(txt,pct){
  gwClose(); load.classList.remove('hide'); card.style.display='none';
  load.querySelector('p').textContent=txt||'';
  const bar=load.querySelector('.bar');
  if(pct==null){ bar.classList.add('ind'); } else { bar.classList.remove('ind'); bar.querySelector('i').style.width=Math.max(4,Math.min(100,pct))+'%'; }
}
function msg(el,kind,text){ if(!el)return; el.className='g-msg '+kind+(text?' show':''); el.textContent=text||''; }
function busy(btn,on,label){ if(!btn)return; if(on){btn.dataset.l=btn.innerHTML;btn.disabled=true;btn.innerHTML='<span class="spin"></span>'+(label||'');} else {btn.disabled=false;if(btn.dataset.l)btn.innerHTML=btn.dataset.l;} }
function isNet(e){ const m=String((e&&(e.message||e.name))||e||''); return /fetch|network|Failed|Load failed|NetworkError|timeout|ERR_/i.test(m)||!navigator.onLine; }
function errText(e){
  const m=String((e&&e.message)||e||'');
  if(isNet(e))return 'Keine Verbindung. Bitte Internet prüfen und nochmal versuchen.';
  if(/Invalid login credentials/i.test(m))return 'E-Mail oder Passwort stimmt nicht. Noch keinen Zugang? Unten auf „Zugang anfragen“ tippen.';
  if(/Email not confirmed/i.test(m))return 'Dein Zugang ist noch nicht bestätigt. Nutze den Einladungslink.';
  if(/expired|invalid|otp/i.test(m)&&/token|otp|link|expired/i.test(m))return 'Der Link bzw. Code ist abgelaufen oder wurde schon benutzt. Frag deinen Admin nach einem neuen.';
  if(/Signups not allowed|not found|User not found/i.test(m))return 'Diese Adresse kennen wir noch nicht. Tipp unten auf „Neu hier? Zugang anfragen“, das dauert eine Minute.';
  if(/rate|too many|security purposes/i.test(m))return 'Zu viele Versuche. Bitte einen Moment warten.';
  if(/should be different/i.test(m))return 'Das neue Passwort muss sich vom alten unterscheiden.';
  if(/Password should be/i.test(m))return 'Das Passwort ist zu schwach.';
  if(/session missing|not authenticated|JWT expired|invalid JWT/i.test(m))return 'Deine Anmeldung ist auf diesem Gerät verloren gegangen (z. B. weil der Link zweimal geöffnet wurde).';
  return 'Das hat nicht geklappt ('+m.slice(0,120)+').';
}
/* ---------- Passkeys (Beta 0.77): Face ID, Touch ID, Windows Hello ----------
   Nur Anmeldung: Rolle, Rechte und Sperre kommen danach wie immer aus touch_me (enter). Es wird nichts geloggt. */
function pkNativ(){ try{ const C=window.Capacitor; return !!(C&&C.isNativePlatform&&C.isNativePlatform()); }catch(e){ return false; } }
// Store-App (Capacitor) läuft nicht unter der Vereinsadresse, dort gehen Passkeys nicht
function pkGeht(){ try{ return !!(window.PublicKeyCredential&&navigator.credentials&&typeof navigator.credentials.get==='function'&&typeof navigator.credentials.create==='function')&&!pkNativ()&&typeof sb.auth.signInWithPasskey==='function'; }catch(e){ return false; } }
function pkGeraet(){ const u=navigator.userAgent||'';
  if(/iPhone|iPod/.test(u))return 'Face ID'; if(/iPad/.test(u)||(/Macintosh/.test(u)&&navigator.maxTouchPoints>1))return 'Face ID oder Touch ID';
  if(/Android/.test(u))return 'Fingerabdruck oder Displaysperre'; if(/Macintosh|Mac OS X/.test(u))return 'Touch ID'; if(/Windows/.test(u))return 'Windows Hello';
  return 'Face ID, Touch ID oder Windows Hello'; }
// Fehler verständlich machen. still: abgebrochen, nichts anzeigen. art: aus | fehlt | doppelt | sonst
function pkFehler(e,wo){
  const m=String((e&&e.message)||e||''), c=String((e&&e.code)||''), n=String((e&&e.name)||(e&&e.cause&&e.cause.name)||''), st=e&&e.status;
  const login=wo==='login', hatPk=ls.get('svbcPasskey')==='1';
  if(c==='ERROR_CEREMONY_ABORTED'||n==='AbortError'||n==='NotAllowedError'){
    // Abgebrochen. Auf einem Gerät ohne bekannten Passkey ist das meist „keiner da“: dann freundlich erklären
    return (login&&!hatPk)?{still:false,kind:'info',art:'fehlt',text:'Noch keinen Passkey auf diesem Gerät? Melde dich einmal mit Passwort an und richte unter Mein Konto einen Passkey ein.'}:{still:true};
  }
  if(isNet(e)&&!c)return {kind:'err',art:'sonst',text:'Keine Verbindung. Bitte Internet prüfen und nochmal versuchen.'};
  if(c==='passkey_disabled'||st===404||/passkey.*(disabled|not enabled)/i.test(m))
    return {kind:'info',art:'aus',text:login?'Anmelden mit Passkey ist im Verein noch nicht freigeschaltet. Melde dich bitte mit Passwort an.':'Passkeys sind im Verein noch nicht freigeschaltet. Sobald der Admin sie einschaltet, kannst du hier einen einrichten.'};
  if(c==='webauthn_credential_not_found')return {kind:'info',art:'fehlt',text:'Dieser Passkey ist bei uns nicht (mehr) hinterlegt. Melde dich einmal mit Passwort an und richte unter Mein Konto einen Passkey ein.'};
  if(c==='webauthn_credential_exists'||c==='ERROR_AUTHENTICATOR_PREVIOUSLY_REGISTERED'||n==='InvalidStateError')return {kind:'info',art:'doppelt',text:'Auf diesem Gerät ist schon ein Passkey für dich eingerichtet.'};
  if(c==='too_many_passkeys')return {kind:'err',art:'sonst',text:'Du hast schon die höchste Zahl an Passkeys. Entferne einen alten, dann klappt es.'};
  if(c==='webauthn_challenge_expired'||c==='webauthn_challenge_not_found')return {kind:'err',art:'sonst',text:'Das hat zu lange gedauert. Bitte nochmal versuchen.'};
  if(c==='webauthn_verification_failed')return {kind:'err',art:'sonst',text:'Der Passkey ließ sich nicht bestätigen. Bitte nochmal versuchen'+(login?' oder mit Passwort anmelden.':'.')};
  if(c==='user_banned')return {kind:'err',art:'sonst',text:'Dein Zugang ist gesperrt. Wenn das ein Versehen ist, sprich bitte den Admin an.'};
  if(c==='ERROR_INVALID_RP_ID'||c==='ERROR_INVALID_DOMAIN'||n==='SecurityError')return {kind:'info',art:'aus',text:'Passkeys gehen nur unter der Vereinsadresse svbsc.kaderwerk.pro.'+(login?' Hier bitte mit Passwort anmelden.':'')};
  if(/does not support WebAuthn/i.test(m))return {kind:'info',art:'aus',text:'Dieser Browser kann keine Passkeys.'+(login?' Melde dich bitte mit Passwort an.':'')};
  if(/email.not.confirmed/i.test(c+m))return {kind:'err',art:'sonst',text:errText(e)};
  return {kind:'err',art:'sonst',text:'Das hat nicht geklappt. Bitte nochmal versuchen'+(login?' oder mit Passwort anmelden.':'.')};
}
function pwScore(p){ let s=0; if(p.length>=10)s++; if(p.length>=14)s++; if(/[a-z]/.test(p)&&/[A-Z]/.test(p))s++; if(/\d/.test(p))s++; if(/[^A-Za-z0-9]/.test(p))s++; return Math.min(4,s); }
function eyeWire(root){ root.querySelectorAll('.eye').forEach(b=>b.onclick=()=>{ const i=b.previousElementSibling; const sh=i.type==='password'; i.type=sh?'text':'password'; b.innerHTML=I(sh?'eyeoff':'eye'); }); }

/* ---------- IndexedDB: Datenbestand auf dem Gerät (nur für Angemeldete) ---------- */
const IDB={
  open(ver){ return new Promise((res,rej)=>{ const r=ver?indexedDB.open('svbc',ver):indexedDB.open('svbc');
    r.onupgradeneeded=()=>{ if(!r.result.objectStoreNames.contains('kv'))r.result.createObjectStore('kv'); };
    r.onsuccess=()=>{ const db=r.result; db.onversionchange=()=>db.close();
      if(!db.objectStoreNames.contains('kv')){ const v=db.version+1; db.close(); this.open(v).then(res,rej); return; }   /* Speicher reparieren */
      res(db); };
    r.onerror=()=>rej(r.error); r.onblocked=()=>rej(new Error('blocked')); }); },
  async get(k){ let db; try{ db=await this.open(); return await new Promise(res=>{ const t=db.transaction('kv').objectStore('kv').get(k); t.onsuccess=()=>res(t.result); t.onerror=()=>res(null); }); }catch(e){ return null; } finally{ try{db&&db.close();}catch(e){} } },
  async set(k,v){ let db; try{ db=await this.open(); await new Promise(res=>{ const t=db.transaction('kv','readwrite'); t.objectStore('kv').put(v,k); t.oncomplete=res; t.onerror=res; t.onabort=res; }); }catch(e){} finally{ try{db&&db.close();}catch(e){} } },
  async clear(){ try{ await new Promise(res=>{ const r=indexedDB.deleteDatabase('svbc'); r.onsuccess=r.onerror=()=>res(); r.onblocked=()=>setTimeout(res,1500); }); }catch(e){} }
};

/* ---------- Ansichten ---------- */
function viewLogin(note,kind){
  card.innerHTML=`<h2>Willkommen</h2>
    <p class="sub">Melde dich an. Neu hier? Dein Zugang dauert eine Minute.</p>
    <div class="g-oauth" id="gOauth"></div>
    <form class="g-form" id="gLogin" autocomplete="on">
      <div class="g-msg" id="gMsg"></div>
      <div class="g-field"><label for="gEmail">E-Mail</label><div class="g-in"><input id="gEmail" type="email" autocomplete="username" inputmode="email" placeholder="name@beispiel.de" required value="${esc(ls.get('svbcLastEmail')||'')}"></div></div>
      <div class="g-field"><label for="gPw">Passwort <a id="gForgot">Vergessen?</a></label><div class="g-in"><input id="gPw" type="password" autocomplete="current-password" placeholder="••••••••••" required><button type="button" class="eye" aria-label="Passwort zeigen">${I('eye')}</button></div></div>
      <button class="g-btn" id="gGo" type="submit">Anmelden ${I('chev')}</button>
      <div class="g-or">oder</div>
      ${pkGeht()?`<button class="g-btn alt g-pk" id="gPk" type="button">${I('key')}<span class="g-pkt"><b>Mit Passkey anmelden</b><small>${esc(pkGeraet())}, ohne Passwort</small></span></button>`:''}
      <button class="g-btn alt" id="gCodeBtn" type="button">${I('mail')} Code per E-Mail, ohne Passwort</button>
    </form>
    <div class="g-neu"><b>Neu hier?</b><span>Spieler, Eltern, Helfer oder Trainer: E-Mail eintragen, Passwort festlegen, fertig.</span>
      <button class="g-btn" id="gNeu" type="button">Zugang anfragen ${I('chev')}</button></div>
    <div class="g-foot">${I('lock')}<span>Nur für Mitglieder des Vereins. Neue Zugänge schaltet die Leitung frei. Alle Daten sind verschlüsselt übertragen.</span></div>`;
  showCard(); eyeWire(card);
  const m=document.getElementById('gMsg'); if(note)msg(m,kind||'info',note);
  const em=document.getElementById('gEmail'), pw=document.getElementById('gPw');
  (em.value?pw:em).focus({preventScroll:true});
  document.getElementById('gLogin').onsubmit=async e=>{
    e.preventDefault(); const b=document.getElementById('gGo'); msg(m,'',''); busy(b,true,'Anmelden …');
    try{
      // Wechsel zwischen Vereins- und Demo-Datenbank: dort anmelden, Speicher leeren, neu starten
      const mail=em.value.trim(), demo=istDemoMail(mail);
      if(demo!==!!CFG.istDemo){ const Z=demo?CFG0.demo:CFG0;
        const zsb=window.supabase.createClient(Z.url,Z.anon,{auth:{persistSession:true,autoRefreshToken:false,detectSessionInUrl:false,storageKey:'svbc-auth',flowType:'implicit',storage:store}});
        const {error:ze}=await zsb.auth.signInWithPassword({email:mail,password:pw.value}); if(ze)throw ze;
        ls.set('svbc-backend',demo?'demo':null); ls.set('svbcLastEmail',mail); ls.set('svbcProfile',null); await IDB.clear();
        location.replace(location.pathname); return; }
      const {error}=await sb.auth.signInWithPassword({email:em.value.trim(),password:pw.value}); if(error)throw error;
      ls.set('svbcLastEmail',em.value.trim()); window.__svbcPwLogin=true; await enter({}); }   // __svbcPwLogin: die App bietet danach einmal an, einen Passkey einzurichten (svm74p.js)
    catch(err){ busy(b,false); msg(m,'err',errText(err)); pw.select(); }
  };
  const pkB=document.getElementById('gPk');
  if(pkB)pkB.onclick=async()=>{
    if(pkB.disabled)return; msg(m,'',''); busy(pkB,true,'Warte auf Bestätigung …');
    try{
      const {data,error}=await sb.auth.signInWithPasskey(); if(error)throw error;
      if(!data||!data.session)throw new Error('Keine Sitzung');
      ls.set('svbcPasskey','1'); if(data.user&&data.user.email)ls.set('svbcLastEmail',data.user.email);
      await enter({}); }   // wie nach dem Passwort: touch_me prüft Rolle und Sperre
    catch(err){ busy(pkB,false); const f=pkFehler(err,'login'); if(!f.still)msg(m,f.kind,f.text); }
  };
  document.getElementById('gCodeBtn').onclick=()=>viewCode(em.value.trim());
  document.getElementById('gForgot').onclick=()=>viewForgot(em.value.trim());
  document.getElementById('gNeu').onclick=()=>{ GWD.email=em.value.trim(); viewHallo(); };   // 0.99.45: animiertes Willkommen statt Formular
  oauthKnoepfe(document.getElementById('gOauth'),m);
}
/* ---------- 137: Weiter mit Google oder Apple (nur wenn im Supabase-Projekt eingeschaltet; in der Store-App erst mit nativer Anmeldung) ---------- */
let OAUTH=null;
async function oauthAn(){ if(OAUTH)return OAUTH;
  try{ const r=await fetch(CFG.url+'/auth/v1/settings',{headers:{apikey:CFG.anon},signal:AbortSignal.timeout?AbortSignal.timeout(4000):undefined}); const j=r.ok?await r.json():{}; OAUTH={google:!!(j.external&&j.external.google),apple:!!(j.external&&j.external.apple)}; }
  catch(e){ OAUTH={google:false,apple:false}; }
  try{ const C=window.Capacitor; if(C&&C.isNativePlatform&&C.isNativePlatform())OAUTH={google:false,apple:false}; }catch(e){}
  return OAUTH; }
const OAUTH_LOGO={
  google:'<svg viewBox="0 0 48 48" width="20" height="20" aria-hidden="true"><path fill="#FFC107" d="M43.6 20.5H42V20H24v8h11.3C33.7 32.7 29.2 36 24 36c-6.6 0-12-5.4-12-12s5.4-12 12-12c3.1 0 5.8 1.2 7.9 3.1l5.7-5.7C34 6.1 29.3 4 24 4 12.9 4 4 12.9 4 24s8.9 20 20 20 20-8.9 20-20c0-1.3-.1-2.4-.4-3.5z"/><path fill="#FF3D00" d="M6.3 14.7l6.6 4.8C14.7 15.1 19 12 24 12c3.1 0 5.8 1.2 7.9 3.1l5.7-5.7C34 6.1 29.3 4 24 4 16.3 4 9.7 8.3 6.3 14.7z"/><path fill="#4CAF50" d="M24 44c5.2 0 9.9-2 13.4-5.2l-6.2-5.2C29.2 35.1 26.7 36 24 36c-5.2 0-9.6-3.3-11.3-8l-6.5 5C9.5 39.6 16.2 44 24 44z"/><path fill="#1976D2" d="M43.6 20.5H42V20H24v8h11.3c-.8 2.2-2.2 4.2-4.1 5.6l6.2 5.2C37 39.2 44 34 44 24c0-1.3-.1-2.4-.4-3.5z"/></svg>',
  apple:'<svg viewBox="0 0 24 24" width="20" height="20" aria-hidden="true"><path fill="currentColor" d="M16.4 12.6c0-2.6 2.1-3.8 2.2-3.9-1.2-1.8-3.1-2-3.7-2-1.6-.2-3.1.9-3.9.9-.8 0-2-.9-3.4-.9-1.7 0-3.3 1-4.2 2.6-1.8 3.1-.5 7.7 1.3 10.2.9 1.2 1.9 2.6 3.2 2.6 1.3-.1 1.8-.8 3.3-.8 1.5 0 2 .8 3.4.8 1.4 0 2.3-1.3 3.1-2.5 1-1.4 1.4-2.8 1.4-2.9-.1 0-2.7-1-2.7-4.1zM13.9 4.9c.7-.9 1.2-2.1 1.1-3.3-1 0-2.3.7-3 1.6-.7.8-1.3 2-1.1 3.2 1.1.1 2.3-.6 3-1.5z"/></svg>'};
async function oauthKnoepfe(box,m){ if(!box)return; const O=await oauthAn(); const L=[]; if(O.google)L.push(['google','Weiter mit Google']); if(O.apple)L.push(['apple','Weiter mit Apple']);
  if(!L.length){ box.remove(); return; }
  box.innerHTML=L.map(([k,t])=>`<button type="button" class="g-btn alt g-oa g-oa-${k}" data-oa="${k}">${OAUTH_LOGO[k]}<span>${esc(t)}</span></button>`).join('')+'<div class="g-or">oder mit E-Mail</div>';
  box.querySelectorAll('[data-oa]').forEach(b=>b.onclick=async()=>{ busy(b,true,'Weiterleiten …');
    try{ const {error}=await sb.auth.signInWithOAuth({provider:b.dataset.oa,options:{redirectTo:svBasis()}}); if(error)throw error; }
    catch(err){ busy(b,false); msg(m,'err',errText(err)); } }); }

/* ---------- 137: Zugang anfragen ---------- */
const ZG_ARTEN=[['spieler','Spieler/in'],['eltern','Eltern'],['helfer','Helfer/in'],['trainer','Trainer/in'],['sonstiges','Sonstiges']];
function viewAnfrage(email){
  card.innerHTML=`<h2>Zugang anfragen</h2>
    <p class="sub">Ein paar Angaben, dann bekommst du eine Mail. Darin legst du dein Passwort fest, und die Leitung schaltet dich frei.</p>
    <div class="g-oauth" id="gOauth"></div>
    <form class="g-form" id="gAnf" autocomplete="on">
      <div class="g-msg" id="gMsg"></div>
      <div class="g-field"><label for="gName">Vor- und Nachname</label><div class="g-in"><input id="gName" autocomplete="name" placeholder="z. B. Max Muster" required maxlength="80"></div></div>
      <div class="g-field"><label for="gEmail">E-Mail</label><div class="g-in"><input id="gEmail" type="email" autocomplete="email" inputmode="email" placeholder="name@beispiel.de" required value="${esc(email||'')}"></div></div>
      <div class="g-field"><label for="gTel">Handynummer</label><div class="g-in"><input id="gTel" type="tel" autocomplete="tel" inputmode="tel" placeholder="z. B. 0171 2345678" required minlength="6" maxlength="25" pattern="\\+?[0-9][0-9 /()\\-]{5,24}"></div></div>
      <div class="g-field"><span class="g-lab">Ich bin</span><div class="g-chips" role="radiogroup" aria-label="Ich bin">${ZG_ARTEN.map(([k,t],i)=>`<label class="g-chip"><input type="radio" name="gArt" value="${k}"${i===0?' required':''}><span>${t}</span></label>`).join('')}</div></div>
      <div class="g-field"><label for="gTeam">Mannschaft (wenn passend)</label><div class="g-in"><input id="gTeam" placeholder="z. B. Zweite, D1, Helferpool" maxlength="40"></div></div>
      <input id="gWeb" name="website" tabindex="-1" autocomplete="off" class="g-falle" aria-hidden="true">
      <button class="g-btn" id="gGo" type="submit">Mail schicken ${I('chev')}</button>
      <p class="g-klein">Wir nutzen deine Angaben nur für den Zugang zur App des Vereins. <a href="datenschutz.html" target="_blank" rel="noopener">Datenschutz</a></p>
      <button class="g-link" type="button" id="gBack">← Ich habe schon einen Zugang</button>
    </form>`;
  showCard();
  const m=document.getElementById('gMsg'); document.getElementById('gName').focus({preventScroll:true});
  document.getElementById('gBack').onclick=()=>viewLogin();
  oauthKnoepfe(document.getElementById('gOauth'),m);
  document.getElementById('gAnf').onsubmit=async e=>{
    e.preventDefault(); const b=document.getElementById('gGo'); msg(m,'',''); busy(b,true,'Senden …');
    const art=(card.querySelector('input[name=gArt]:checked')||{}).value||'';
    const body={action:'anfrage',app_url:svBasis(),name:document.getElementById('gName').value.trim(),email:document.getElementById('gEmail').value.trim(),art,team:document.getElementById('gTeam').value.trim(),tel:document.getElementById('gTel').value.trim(),website:document.getElementById('gWeb').value};
    try{ const {data,error}=await sb.functions.invoke('admin-users',{body});
      if(error){ let t=error.message; try{ const j=await error.context.json(); if(j&&j.error)t=j.error; }catch(_){} throw new Error(t); }
      if(data&&data.error)throw new Error(data.error);
      ls.set('svbcLastEmail',body.email); window.__svbcAnfrage=data; viewPostfach(body.email); }
    catch(err){ busy(b,false); msg(m,'err',/Zu viele|Bitte/.test(err.message)?err.message:errText(err)); }
  };
}
/* ---------- 0.99.45: Willkommen, Name, Kontakt, Danke (Albert, 16.11.2026) ----------
   „Ein wunderschönes Willkommen, mit einer geschwungenen Handschrift. Name, dann Kontaktdaten, dann Danke.“
   Wer neu ist, schreibt weder eine Rolle noch eine Mannschaft: Das ordnet der Server beim Eingang der Anfrage zu
   (Abgleich mit Kader, Organigramm, Helferpool, siehe zugang_korb). Die Person sieht davon nichts. */
const HAND={"willkommen":{"w":4283,"h":978,"g":["M518 958Q488 958 468.5 936Q449 914 453 853Q457 790 492 691Q527 592 583 458Q601 415 619.5 362Q638 309 651 255.5Q664 202 664 159Q664 129 656.5 106.5Q649 84 630 73Q608 59 583 53Q558 47 530 47Q467 47 397.5 76Q328 105 263.5 155.5Q199 206 148.5 270Q98 334 72 403Q57 444 50 480Q43 516 43 545Q43 600 63.5 636.5Q84 673 117.5 690.5Q151 708 190 708Q227 708 260 695Q303 679 337 641Q371 603 391 556.5Q411 510 411 471Q411 437 393.5 414Q376 391 336 391Q330 391 324.5 391Q319 391 312 393Q308 394 305 394Q302 394 300 394Q291 394 291 390Q291 384 310 377Q341 367 368 367Q415 367 438 394.5Q461 422 461 464Q461 506 438 554.5Q415 603 370.5 647Q326 691 259 719Q223 734 185 734Q133 734 87 707Q41 680 12 630Q-17 580 -17 512Q-17 479 -9 443Q-1 407 16 367Q49 290 106 226.5Q163 163 233.5 116.5Q304 70 378 45Q452 20 519 20Q578 20 626 41Q679 64 700.5 106.5Q722 149 722 202Q722 260 702.5 325.5Q683 391 655 454Q624 525 594 602Q564 679 542 748Q520 817 511 863Q509 874 508 882.5Q507 891 507 897Q507 932 530 932Q544 932 563 920Q600 898 638 854Q676 810 713.5 753.5Q751 697 786 637.5Q821 578 853 525Q885 472 911 435Q927 413 941 402.5Q955 392 965 392Q986 392 986 424Q986 443 977 470Q964 508 942 556.5Q920 605 901 654.5Q882 704 876 747Q875 758 874.5 766.5Q874 775 874 784Q874 836 895 858.5Q916 881 950 881Q989 881 1038.5 856Q1088 831 1138 789.5Q1188 748 1228.5 698Q1269 648 1290 598Q1313 543 1325 491Q1337 439 1337 396Q1337 327 1307 283.5Q1277 240 1213 240Q1208 240 1202 240.5Q1196 241 1189 242Q1165 248 1154 248Q1141 248 1141 242Q1141 234 1161 224Q1181 214 1203 218Q1251 214 1293.5 239.5Q1336 265 1362 315.5Q1388 366 1388 438Q1388 475 1380 518Q1372 561 1353 608Q1328 671 1283 725Q1238 779 1182.5 820Q1127 861 1069.5 883.5Q1012 906 962 906Q905 906 866.5 870.5Q828 835 828 756Q828 723 834 689Q840 655 848 629Q831 657 803 698.5Q775 740 739.5 785Q704 830 666 869.5Q628 909 590 933.5Q552 958 518 958Z","M1438 833Q1401 833 1386 811.5Q1371 790 1371 762Q1371 747 1374.5 731.5Q1378 716 1383 703L1450 532Q1453 524 1453 518Q1453 508 1448 500.5Q1443 493 1441 490L1496 488Q1511 487 1517.5 491.5Q1524 496 1524 502Q1524 508 1517 524Q1507 548 1490 584Q1473 620 1456.5 658Q1440 696 1428.5 729Q1417 762 1417 780Q1417 793 1423.5 802Q1430 811 1446 811Q1467 811 1487.5 794.5Q1508 778 1526 752Q1544 726 1559.5 696Q1575 666 1586 640Q1598 640 1598 649Q1588 674 1572 706Q1556 738 1535.5 766.5Q1515 795 1490.5 814Q1466 833 1438 833ZM1527 426Q1514 426 1504.5 416Q1495 406 1495 392Q1495 375 1509 361.5Q1523 348 1540 348Q1554 348 1564 357Q1574 366 1574 380Q1574 398 1560 412Q1546 426 1527 426Z","M1633 836Q1596 836 1578.5 813.5Q1561 791 1561 760Q1561 728 1570 694Q1579 660 1586 637Q1602 581 1626.5 517.5Q1651 454 1680.5 392.5Q1710 331 1739 282Q1762 243 1788.5 223.5Q1815 204 1835 204Q1851 204 1860.5 215.5Q1870 227 1870 250Q1870 266 1864.5 288Q1859 310 1846 338Q1811 416 1762.5 494Q1714 572 1640 640Q1628 668 1620 700Q1612 732 1612 752Q1612 814 1654 814Q1686 814 1725 767.5Q1764 721 1799 640Q1803 640 1807 641.5Q1811 643 1811 649Q1800 676 1783.5 708.5Q1767 741 1745.5 770Q1724 799 1696 817.5Q1668 836 1633 836ZM1648 608Q1684 571 1718 522.5Q1752 474 1781.5 421.5Q1811 369 1831 322Q1838 307 1842.5 289Q1847 271 1847 259Q1847 245 1840 245Q1836 245 1828 252.5Q1820 260 1807 278Q1788 303 1765.5 346Q1743 389 1720 438Q1697 487 1678 532.5Q1659 578 1648 608Z","M1846 836Q1809 836 1791.5 813.5Q1774 791 1774 760Q1774 728 1783 694Q1792 660 1799 637Q1815 581 1839.5 517.5Q1864 454 1893.5 392.5Q1923 331 1952 282Q1975 243 2001.5 223.5Q2028 204 2048 204Q2064 204 2073.5 215.5Q2083 227 2083 250Q2083 266 2077.5 288Q2072 310 2059 338Q2024 416 1975.5 494Q1927 572 1853 640Q1841 668 1833 700Q1825 732 1825 752Q1825 814 1867 814Q1899 814 1938 767.5Q1977 721 2012 640Q2016 640 2020 641.5Q2024 643 2024 649Q2013 676 1996.5 708.5Q1980 741 1958.5 770Q1937 799 1909 817.5Q1881 836 1846 836ZM1861 608Q1897 571 1931 522.5Q1965 474 1994.5 421.5Q2024 369 2044 322Q2051 307 2055.5 289Q2060 271 2060 259Q2060 245 2053 245Q2049 245 2041 252.5Q2033 260 2020 278Q2001 303 1978.5 346Q1956 389 1933 438Q1910 487 1891 532.5Q1872 578 1861 608Z","M2186 840Q2158 837 2140 818.5Q2122 800 2114 775Q2106 750 2106 729Q2106 689 2124 664.5Q2142 640 2157 639Q2173 640 2196 631.5Q2219 623 2236 608Q2265 585 2265 561Q2265 536 2236 536Q2220 536 2195.5 547Q2171 558 2139 585Q2099 619 2056 676Q2050 689 2042 714.5Q2034 740 2028.5 767Q2023 794 2023 813Q2023 828 2028 833H1965Q1954 833 1954 824Q1954 821 1955 819Q1956 817 1957 811Q1971 759 1990.5 719Q2010 679 2023 649Q2014 652 2013 647.5Q2012 643 2012 640Q2019 624 2035.5 588.5Q2052 553 2074.5 506.5Q2097 460 2123 409Q2149 358 2175 311Q2201 263 2217.5 243Q2234 223 2258 223Q2267 223 2279.5 226Q2292 229 2302 227Q2280 246 2247 296.5Q2214 347 2177 414Q2140 481 2106 551Q2096 571 2087 593Q2078 615 2070 637Q2091 611 2118 583Q2145 555 2174.5 531.5Q2204 508 2233 497Q2266 485 2288 485Q2311 485 2321.5 496Q2332 507 2332 524Q2332 543 2317 569.5Q2302 596 2276 615Q2254 630 2230 641Q2206 652 2173 655Q2167 669 2164.5 683.5Q2162 698 2162 712Q2162 751 2180 780.5Q2198 810 2227 810Q2241 810 2257.5 802Q2274 794 2292 775Q2312 755 2332 719.5Q2352 684 2372 640Q2384 640 2384 649Q2348 736 2314 778Q2280 820 2248.5 831.5Q2217 843 2186 840Z","M2432 833Q2391 833 2371.5 803.5Q2352 774 2352 732Q2352 693 2367 651Q2383 605 2411.5 567Q2440 529 2474.5 505.5Q2509 482 2543 482Q2584 482 2603.5 510Q2623 538 2623 581Q2623 611 2613 644Q2603 677 2586 709Q2599 722 2623 722Q2651 722 2671 704Q2691 686 2710 640Q2722 640 2722 649Q2703 695 2678.5 716.5Q2654 738 2616 737Q2593 737 2578 724Q2550 770 2511.5 801.5Q2473 833 2432 833ZM2446 811Q2469 811 2492 791.5Q2515 772 2534 747Q2553 722 2561 704Q2545 675 2542.5 660.5Q2540 646 2540 639Q2540 620 2550 610Q2560 600 2570 600Q2584 600 2594 612Q2596 601 2597 591.5Q2598 582 2598 573Q2598 547 2588.5 530.5Q2579 514 2559 514Q2538 514 2515 532Q2492 550 2471.5 580Q2451 610 2436 647Q2423 678 2416 705.5Q2409 733 2409 756Q2409 781 2418 796Q2427 811 2446 811Z","M2613 838Q2650 767 2683 695.5Q2716 624 2750 560Q2770 524 2783.5 509.5Q2797 495 2820 495Q2828 495 2837 497.5Q2846 500 2855 500Q2861 500 2864 499Q2850 507 2828 538.5Q2806 570 2783 611Q2760 652 2742 688Q2761 665 2781.5 642Q2802 619 2827 598Q2849 579 2873.5 556.5Q2898 534 2922 518Q2946 502 2964 502Q2971 502 2973 503Q2992 511 2992 529Q2992 535 2987 547Q2974 581 2953.5 616.5Q2933 652 2915 688Q2930 670 2952.5 644Q2975 618 2998 598Q3020 578 3054 556Q3088 534 3121 518Q3154 502 3174 502Q3181 502 3184 503Q3184 503 3173 522.5Q3162 542 3145.5 573.5Q3129 605 3112 640.5Q3095 676 3081.5 708.5Q3068 741 3064 763Q3061 776 3061 787Q3061 803 3067 808Q3073 813 3080 813Q3100 813 3119.5 796Q3139 779 3158 752.5Q3177 726 3192.5 696Q3208 666 3219 640Q3231 640 3231 649Q3220 676 3203.5 708.5Q3187 741 3166 770Q3145 799 3120 818Q3095 837 3066 837Q3045 837 3026.5 823Q3008 809 3008 771Q3008 730 3027.5 689Q3047 648 3068 614Q3078 597 3078 587Q3078 575 3066 575Q3056 575 3038.5 585Q3021 595 2995 620Q2979 635 2957.5 661.5Q2936 688 2914 719Q2892 750 2876 780Q2860 810 2855 833Q2840 833 2831 820.5Q2822 808 2822 791Q2822 788 2822 785Q2822 782 2823 778Q2828 747 2839 725.5Q2850 704 2864 675Q2871 662 2880 644.5Q2889 627 2896 610.5Q2903 594 2903 583Q2903 573 2895 573Q2886 573 2871.5 582Q2857 591 2844 602.5Q2831 614 2824 620Q2799 644 2763.5 689Q2728 734 2686 817Q2680 828 2672 830.5Q2664 833 2647 833Q2636 833 2628.5 833.5Q2621 834 2613 838Z","M3122 838Q3159 767 3192 695.5Q3225 624 3259 560Q3279 524 3292.5 509.5Q3306 495 3329 495Q3337 495 3346 497.5Q3355 500 3364 500Q3370 500 3373 499Q3359 507 3337 538.5Q3315 570 3292 611Q3269 652 3251 688Q3270 665 3290.5 642Q3311 619 3336 598Q3358 579 3382.5 556.5Q3407 534 3431 518Q3455 502 3473 502Q3480 502 3482 503Q3501 511 3501 529Q3501 535 3496 547Q3483 581 3462.5 616.5Q3442 652 3424 688Q3439 670 3461.5 644Q3484 618 3507 598Q3529 578 3563 556Q3597 534 3630 518Q3663 502 3683 502Q3690 502 3693 503Q3693 503 3682 522.5Q3671 542 3654.5 573.5Q3638 605 3621 640.5Q3604 676 3590.5 708.5Q3577 741 3573 763Q3570 776 3570 787Q3570 803 3576 808Q3582 813 3589 813Q3609 813 3628.5 796Q3648 779 3667 752.5Q3686 726 3701.5 696Q3717 666 3728 640Q3740 640 3740 649Q3729 676 3712.5 708.5Q3696 741 3675 770Q3654 799 3629 818Q3604 837 3575 837Q3554 837 3535.5 823Q3517 809 3517 771Q3517 730 3536.5 689Q3556 648 3577 614Q3587 597 3587 587Q3587 575 3575 575Q3565 575 3547.5 585Q3530 595 3504 620Q3488 635 3466.5 661.5Q3445 688 3423 719Q3401 750 3385 780Q3369 810 3364 833Q3349 833 3340 820.5Q3331 808 3331 791Q3331 788 3331 785Q3331 782 3332 778Q3337 747 3348 725.5Q3359 704 3373 675Q3380 662 3389 644.5Q3398 627 3405 610.5Q3412 594 3412 583Q3412 573 3404 573Q3395 573 3380.5 582Q3366 591 3353 602.5Q3340 614 3333 620Q3308 644 3272.5 689Q3237 734 3195 817Q3189 828 3181 830.5Q3173 833 3156 833Q3145 833 3137.5 833.5Q3130 834 3122 838Z","M3800 837Q3763 837 3733.5 813Q3704 789 3704 740Q3704 699 3722.5 653Q3741 607 3771.5 566.5Q3802 526 3839.5 500.5Q3877 475 3915 475Q3934 475 3952 486Q3970 497 3970 524Q3970 549 3951 579Q3932 609 3897 635Q3882 646 3859 656Q3836 666 3813 672.5Q3790 679 3775 679Q3770 691 3765.5 711Q3761 731 3761 752Q3761 777 3771 797Q3781 817 3808 817Q3841 817 3869.5 798Q3898 779 3920.5 750Q3943 721 3959 691Q3975 661 3984 640Q3996 640 3996 649Q3983 677 3966.5 710Q3950 743 3927.5 771.5Q3905 800 3873.5 818.5Q3842 837 3800 837ZM3782 661Q3796 661 3829 650.5Q3862 640 3889 617Q3915 594 3929 566.5Q3943 539 3943 520Q3943 498 3927 498Q3915 498 3894 514Q3873 530 3842 568Q3823 592 3806 620Q3789 648 3782 661Z","M3888 841Q3924 768 3957 696.5Q3990 625 4025 560Q4045 524 4059 509.5Q4073 495 4096 495Q4104 495 4113 497.5Q4122 500 4131 500Q4137 500 4140 499Q4126 507 4103.5 538.5Q4081 570 4058 611Q4035 652 4017 688Q4036 665 4057 642Q4078 619 4103 598Q4127 577 4160.5 554.5Q4194 532 4226 517Q4258 502 4277 502Q4284 502 4287 503Q4287 503 4276 522.5Q4265 542 4248.5 573.5Q4232 605 4215 640.5Q4198 676 4184.5 708.5Q4171 741 4167 763Q4164 776 4164 787Q4164 803 4170 808Q4176 813 4183 813Q4202 813 4222 796Q4242 779 4260.5 752.5Q4279 726 4295 696Q4311 666 4322 640Q4334 640 4334 649Q4323 676 4306.5 708.5Q4290 741 4269.5 770Q4249 799 4224 818Q4199 837 4170 837Q4150 837 4128.5 823Q4107 809 4107 771Q4107 760 4109 747.5Q4111 735 4116 720Q4124 700 4135 677Q4146 654 4171 614Q4178 603 4179.5 597Q4181 591 4181 587Q4181 575 4170 575Q4161 575 4143.5 585Q4126 595 4100 620Q4075 644 4040.5 688Q4006 732 3961 818Q3954 831 3945.5 832Q3937 833 3922 834Q3912 835 3903 835.5Q3894 836 3888 841Z"]},"danke":{"w":2382,"h":871,"g":["M196 851Q155 851 118 839Q81 827 57.5 803Q34 779 34 743Q34 706 66.5 676Q99 646 159 646Q222 646 278.5 674.5Q335 703 398 736Q451 685 492.5 617.5Q534 550 572.5 475Q611 400 652 325.5Q693 251 744 187Q753 176 762 164.5Q771 153 781 142Q727 110 665 92.5Q603 75 537 75Q455 75 385 96Q315 117 263.5 152.5Q212 188 183 232.5Q154 277 154 324Q154 366 171.5 393.5Q189 421 216 434Q243 447 269 447Q304 447 329 433.5Q354 420 370 400Q386 380 394 361Q402 342 403 330Q403 323 412 323Q426 323 423 340Q418 380 393 409.5Q368 439 333 455.5Q298 472 261 472Q217 472 181 455.5Q145 439 123.5 405.5Q102 372 102 323Q102 258 137 206.5Q172 155 233 119Q294 83 373 64Q452 45 540 45Q608 45 677 61.5Q746 78 808 111Q834 82 861.5 59.5Q889 37 918 25Q931 20 939 20Q945 20 945 23Q945 28 922 48Q909 60 891 84.5Q873 109 854 138Q914 177 960.5 232.5Q1007 288 1034 358.5Q1061 429 1061 515Q1061 599 1032 661.5Q1003 724 953 765Q903 806 838 826.5Q773 847 701 847Q616 847 543.5 824Q471 801 409 772Q360 811 307.5 831Q255 851 196 851ZM786 245Q765 278 735 328.5Q705 379 668 438Q631 497 591 556Q551 615 510.5 666.5Q470 718 432 753Q485 779 549 798Q613 817 694 817Q786 817 854 778.5Q922 740 960 673.5Q998 607 998 523Q998 414 952 324.5Q906 235 829 175Q816 196 805 214.5Q794 233 786 245ZM196 820Q247 823 295.5 801.5Q344 780 376 755Q316 726 265.5 702Q215 678 172 678Q137 678 118 698.5Q99 719 99 744Q99 776 124.5 797Q150 818 196 820Z","M1326 811Q1303 811 1285.5 798Q1268 785 1268 745Q1268 728 1270.5 713Q1273 698 1277 681Q1268 696 1252 718Q1236 740 1216.5 761Q1197 782 1176.5 796Q1156 810 1138 810Q1112 810 1096 786.5Q1080 763 1080 725Q1080 684 1099 637Q1118 590 1151 547Q1184 504 1227 477Q1270 450 1317 450Q1340 450 1361 457.5Q1382 465 1398 482Q1405 489 1405 498Q1405 504 1400 508Q1395 512 1387 510Q1376 475 1340 475Q1323 475 1301 486Q1274 500 1243.5 530.5Q1213 561 1186.5 599.5Q1160 638 1143 677Q1126 716 1126 748Q1126 781 1151 781Q1173 781 1196.5 760Q1220 739 1241.5 707.5Q1263 676 1281 645Q1299 614 1309 595Q1324 568 1337 550Q1350 532 1374 532Q1385 532 1396 535Q1407 538 1419 536Q1389 566 1366.5 607Q1344 648 1332 687.5Q1320 727 1320 754Q1320 784 1340 784Q1356 784 1374.5 766Q1393 748 1410.5 720.5Q1428 693 1443 664.5Q1458 636 1467 615Q1472 615 1475.5 616Q1479 617 1479 624Q1478 628 1475.5 632.5Q1473 637 1468 648Q1460 664 1446 691Q1432 718 1413 745.5Q1394 773 1372 792Q1350 811 1326 811Z","M1371 816Q1407 743 1440 671.5Q1473 600 1508 535Q1528 499 1542 484.5Q1556 470 1579 470Q1587 470 1596 472.5Q1605 475 1614 475Q1620 475 1623 474Q1609 482 1586.5 513.5Q1564 545 1541 586Q1518 627 1500 663Q1519 640 1540 617Q1561 594 1586 573Q1610 552 1643.5 529.5Q1677 507 1709 492Q1741 477 1760 477Q1767 477 1770 478Q1770 478 1759 497.5Q1748 517 1731.5 548.5Q1715 580 1698 615.5Q1681 651 1667.5 683.5Q1654 716 1650 738Q1647 751 1647 762Q1647 778 1653 783Q1659 788 1666 788Q1685 788 1705 771Q1725 754 1743.5 727.5Q1762 701 1778 671Q1794 641 1805 615Q1817 615 1817 624Q1806 651 1789.5 683.5Q1773 716 1752.5 745Q1732 774 1707 793Q1682 812 1653 812Q1633 812 1611.5 798Q1590 784 1590 746Q1590 735 1592 722.5Q1594 710 1599 695Q1607 675 1618 652Q1629 629 1654 589Q1661 578 1662.5 572Q1664 566 1664 562Q1664 550 1653 550Q1644 550 1626.5 560Q1609 570 1583 595Q1558 619 1523.5 663Q1489 707 1444 793Q1437 806 1428.5 807Q1420 808 1405 809Q1395 810 1386 810.5Q1377 811 1371 816Z","M1979 815Q1951 812 1933 793.5Q1915 775 1907 750Q1899 725 1899 704Q1899 664 1917 639.5Q1935 615 1950 614Q1966 615 1989 606.5Q2012 598 2029 583Q2058 560 2058 536Q2058 511 2029 511Q2013 511 1988.5 522Q1964 533 1932 560Q1892 594 1849 651Q1843 664 1835 689.5Q1827 715 1821.5 742Q1816 769 1816 788Q1816 803 1821 808H1758Q1747 808 1747 799Q1747 796 1748 794Q1749 792 1750 786Q1764 734 1783.5 694Q1803 654 1816 624Q1807 627 1806 622.5Q1805 618 1805 615Q1812 599 1828.5 563.5Q1845 528 1867.5 481.5Q1890 435 1916 384Q1942 333 1968 286Q1994 238 2010.5 218Q2027 198 2051 198Q2060 198 2072.5 201Q2085 204 2095 202Q2073 221 2040 271.5Q2007 322 1970 389Q1933 456 1899 526Q1889 546 1880 568Q1871 590 1863 612Q1884 586 1911 558Q1938 530 1967.5 506.5Q1997 483 2026 472Q2059 460 2081 460Q2104 460 2114.5 471Q2125 482 2125 499Q2125 518 2110 544.5Q2095 571 2069 590Q2047 605 2023 616Q1999 627 1966 630Q1960 644 1957.5 658.5Q1955 673 1955 687Q1955 726 1973 755.5Q1991 785 2020 785Q2034 785 2050.5 777Q2067 769 2085 750Q2105 730 2125 694.5Q2145 659 2165 615Q2177 615 2177 624Q2141 711 2107 753Q2073 795 2041.5 806.5Q2010 818 1979 815Z","M2237 812Q2200 812 2170.5 788Q2141 764 2141 715Q2141 674 2159.5 628Q2178 582 2208.5 541.5Q2239 501 2276.5 475.5Q2314 450 2352 450Q2371 450 2389 461Q2407 472 2407 499Q2407 524 2388 554Q2369 584 2334 610Q2319 621 2296 631Q2273 641 2250 647.5Q2227 654 2212 654Q2207 666 2202.5 686Q2198 706 2198 727Q2198 752 2208 772Q2218 792 2245 792Q2278 792 2306.5 773Q2335 754 2357.5 725Q2380 696 2396 666Q2412 636 2421 615Q2433 615 2433 624Q2420 652 2403.5 685Q2387 718 2364.5 746.5Q2342 775 2310.5 793.5Q2279 812 2237 812ZM2219 636Q2233 636 2266 625.5Q2299 615 2326 592Q2352 569 2366 541.5Q2380 514 2380 495Q2380 473 2364 473Q2352 473 2331 489Q2310 505 2279 543Q2260 567 2243 595Q2226 623 2219 636Z"]}};
// Schriftzug als Pfade, Buchstabe für Buchstabe gezeichnet. Wer die Bewegung reduziert haben will, sieht ihn sofort fertig.
function handSvg(k,o){ const h=HAND[k]; o=o||{}; const d0=o.delay||0, dur=o.dauer||1.1, step=o.schritt||0.19;
  return `<svg class="gw-hand" viewBox="-30 0 ${h.w+60} ${h.h}" role="img" aria-label="${esc(o.label||'')}">`+h.g.map((d,i)=>`<path d="${d}" pathLength="1" style="--d:${(d0+i*step).toFixed(2)}s;--t:${dur}s"/>`).join('')+'</svg>'; }
SV.hand=handSvg;
var GW=null; const GWD={vor:'',nach:'',email:'',tel:''};
function gwOpen(){ if(!GW){ GW=document.createElement('div'); GW.id='gw'; GW.innerHTML='<div class="gw-glow" aria-hidden="true"></div><div class="gw-in" id="gwIn"></div>'; gate.appendChild(GW); card.innerHTML=''; }   // Karte leeren: sonst gäbe es #gGo und #gMsg doppelt
  load.classList.add('hide'); card.style.display='none'; gate.classList.add('gw-an'); const R=document.getElementById('gwIn'); R.className='gw-in'; return R; }
function gwClose(){ if(GW){ GW.remove(); GW=null; } gate.classList.remove('gw-an'); }
const GW_PUNKTE=n=>`<div class="gw-dots" aria-label="Schritt ${n} von 3">${[1,2,3].map(i=>`<i class="${i<=n?'an':''}"></i>`).join('')}</div>`;
function viewHallo(){
  const R=gwOpen(); R.classList.add('gw-hallo');
  R.innerHTML=`<img class="gw-logo" src="logo.png" alt="SV/BSC Mörlenbach">${handSvg('willkommen',{delay:.9,label:'Willkommen'})}
    <p class="gw-sub">Schön, dass du da bist. In einer Minute bist du angemeldet.</p>
    <div class="gw-akt"><button class="g-btn" id="gwLos" type="button">Los geht’s ${I('chev')}</button><button class="g-link" id="gwAlt" type="button">Ich habe schon einen Zugang</button></div>`;
  // Antippen überspringt das Schreiben
  R.querySelector('.gw-hand').onclick=()=>R.classList.add('fertig');
  document.getElementById('gwLos').onclick=()=>viewName();
  document.getElementById('gwAlt').onclick=()=>{ const e=GWD.email; gwClose(); viewLogin(); try{ if(e)document.getElementById('gEmail').value=e; }catch(_){} };
}
function viewName(){
  const R=gwOpen(); R.classList.add('gw-seite');
  R.innerHTML=`${GW_PUNKTE(1)}<h2>Wie heißt du?</h2><p class="gw-t">Damit die Leitung weiß, wer du bist.</p>
    <form class="g-form" id="gwF" autocomplete="on"><div class="g-msg" id="gMsg"></div>
      <div class="g-field"><label for="gwVor">Vorname</label><div class="g-in"><input id="gwVor" autocomplete="given-name" placeholder="z. B. Max" required maxlength="40" value="${esc(GWD.vor)}"></div></div>
      <div class="g-field"><label for="gwNach">Nachname</label><div class="g-in"><input id="gwNach" autocomplete="family-name" placeholder="z. B. Muster" required maxlength="40" value="${esc(GWD.nach)}"></div></div>
      <button class="g-btn" id="gwWeiter" type="submit">Weiter ${I('chev')}</button>
      <button class="g-link" type="button" id="gwZu">← Zurück</button></form>`;
  const v=document.getElementById('gwVor'); (v.value?document.getElementById('gwNach'):v).focus({preventScroll:true});
  document.getElementById('gwZu').onclick=()=>viewHallo();
  document.getElementById('gwF').onsubmit=e=>{ e.preventDefault(); GWD.vor=v.value.trim(); GWD.nach=document.getElementById('gwNach').value.trim();
    if((GWD.vor+GWD.nach).length<2){ msg(document.getElementById('gMsg'),'err','Bitte Vor- und Nachname eintragen.'); return; } viewKontakt(); };
}
function viewKontakt(){
  const R=gwOpen(); R.classList.add('gw-seite');
  R.innerHTML=`${GW_PUNKTE(2)}<h2>Wie erreichen wir dich${GWD.vor?', '+esc(GWD.vor):''}?</h2><p class="gw-t">Die Mail brauchst du, um dein Passwort festzulegen. Mit der Handynummer erkennt die Leitung dich schneller.</p>
    <form class="g-form" id="gwF" autocomplete="on"><div class="g-msg" id="gMsg"></div>
      <div class="g-field"><label for="gwMail">E-Mail</label><div class="g-in"><input id="gwMail" type="email" autocomplete="email" inputmode="email" placeholder="name@beispiel.de" required value="${esc(GWD.email)}"></div></div>
      <div class="g-field"><label for="gwTel">Handynummer</label><div class="g-in"><input id="gwTel" type="tel" autocomplete="tel" inputmode="tel" placeholder="z. B. 0171 2345678" required minlength="6" maxlength="25" pattern="\\+?[0-9][0-9 /()\\-]{5,24}" value="${esc(GWD.tel)}"></div></div>
      <input id="gWeb" name="website" tabindex="-1" autocomplete="off" class="g-falle" aria-hidden="true">
      <button class="g-btn" id="gGo" type="submit">Weiter ${I('chev')}</button>
      <p class="g-klein">Wir nutzen deine Angaben nur für den Zugang zur App des Vereins. <a href="datenschutz.html" target="_blank" rel="noopener">Datenschutz</a></p>
      <div class="g-oauth" id="gOauth"></div>
      <button class="g-link" type="button" id="gwZu">← Zurück</button></form>`;
  const m=document.getElementById('gMsg'); (document.getElementById('gwMail').value?document.getElementById('gwTel'):document.getElementById('gwMail')).focus({preventScroll:true});
  document.getElementById('gwZu').onclick=()=>{ GWD.email=document.getElementById('gwMail').value.trim(); GWD.tel=document.getElementById('gwTel').value.trim(); viewName(); };
  oauthKnoepfe(document.getElementById('gOauth'),m);
  document.getElementById('gwF').onsubmit=async e=>{ e.preventDefault(); const b=document.getElementById('gGo'); msg(m,'',''); busy(b,true,'Einen Moment …');
    GWD.email=document.getElementById('gwMail').value.trim(); GWD.tel=document.getElementById('gwTel').value.trim();
    // Rolle und Mannschaft fragt die App nicht: 'sonstiges' ist nur der Platzhalter, die Zuordnung macht der Server
    const body={action:'anfrage',app_url:svBasis(),name:(GWD.vor+' '+GWD.nach).trim(),email:GWD.email,art:'sonstiges',team:'',tel:GWD.tel,website:document.getElementById('gWeb').value};
    try{ const {data,error}=await sb.functions.invoke('admin-users',{body});
      if(error){ let t=error.message; try{ const j=await error.context.json(); if(j&&j.error)t=j.error; }catch(_){} throw new Error(t); }
      if(data&&data.error)throw new Error(data.error);
      ls.set('svbcLastEmail',GWD.email); window.__svbcAnfrage=data; viewDanke(); }
    catch(err){ busy(b,false); msg(m,'err',/Zu viele|Bitte/.test(err.message)?err.message:errText(err)); } };
}
function viewDanke(){
  const R=gwOpen(); R.classList.add('gw-seite','gw-danke');
  R.innerHTML=`${GW_PUNKTE(3)}<svg class="gw-haken" viewBox="0 0 52 52" aria-hidden="true"><circle cx="26" cy="26" r="23"/><path d="M15 27l8 8 15-17"/></svg>
    ${handSvg('danke',{delay:.5,dauer:1,schritt:.16,label:'Danke'})}
    <p class="gw-gross">Vielen Dank für deine Angaben${GWD.vor?', '+esc(GWD.vor):''}.</p>
    <p class="gw-t">Deine Anfrage wird jetzt überprüft. Das dauert meistens nicht lange.</p>
    <div class="g-msg info show">Wir haben dir eine Mail an <b>${esc(GWD.email)}</b> geschickt. Tipp darin auf den Knopf und lege dein Passwort fest. Keine Mail da? Schau auch im Spam-Ordner nach, sie kommt von svbsc@kaderwerk.pro.</div>
    <div class="g-form"><button class="g-btn alt" id="gCode2" type="button">${I('mail')} Lieber einen Code eingeben</button><button class="g-link" type="button" id="gBack">Zur Anmeldung</button></div>`;
  document.getElementById('gCode2').onclick=()=>{ const e=GWD.email; gwClose(); viewCode(e); };
  document.getElementById('gBack').onclick=()=>{ gwClose(); viewLogin(); };
}

function viewPostfach(email){
  card.innerHTML=`<h2>Schau in dein Postfach</h2>
    <p class="sub">Wir haben dir eine Mail an <b style="color:#dbe3f0">${esc(email)}</b> geschickt. Tipp auf den Knopf darin, dann legst du dein Passwort fest.</p>
    <div class="g-form"><div class="g-msg info show">Keine Mail da? Bitte auch im Spam-Ordner nachsehen. Sie kommt von svbsc@kaderwerk.pro.</div>
      <button class="g-btn alt" id="gCode2" type="button">${I('mail')} Lieber einen Code eingeben</button>
      <button class="g-link" type="button" id="gBack">← Zurück zur Anmeldung</button></div>`;
  showCard();
  document.getElementById('gBack').onclick=()=>viewLogin();
  document.getElementById('gCode2').onclick=()=>viewCode(email);
}
function viewWartet(prof){
  const vn=String((prof&&prof.name)||'').split(' ')[0];
  const R=gwOpen(); R.classList.add('gw-seite','gw-danke');
  R.innerHTML=`${GW_PUNKTE(3)}<svg class="gw-haken" viewBox="0 0 52 52" aria-hidden="true"><circle cx="26" cy="26" r="23"/><path d="M15 27l8 8 15-17"/></svg>
    ${handSvg('danke',{delay:.4,dauer:1,schritt:.16,label:'Danke'})}
    <p class="gw-gross">Fast geschafft${vn?', '+esc(vn):''}!</p>
    <p class="gw-t">Deine Anfrage wird überprüft. Die Leitung schaltet dich frei, meistens noch am selben Tag. Du bekommst dann eine Mail und bist mit einem Tipp drin.</p>
    <div class="g-form"><button class="g-btn" id="gNochmal" type="button">Bin ich schon frei? ${I('chev')}</button>
      <button class="g-btn alt" id="gOut" type="button">${I('logout')} Abmelden</button></div>`;
  document.getElementById('gNochmal').onclick=async ev=>{ busy(ev.currentTarget,true,'Prüfen …'); await enter({}); };
  document.getElementById('gOut').onclick=()=>SV.signOut();
}
function viewAngaben(prof){
  card.innerHTML=`<h2>Wer bist du?</h2>
    <p class="sub">Damit die Leitung dich richtig freischaltet.</p>
    <form class="g-form" id="gAng">
      <div class="g-msg" id="gMsg"></div>
      <div class="g-field"><label for="gName">Vor- und Nachname</label><div class="g-in"><input id="gName" autocomplete="name" required maxlength="80" value="${esc((prof&&prof.name)||'')}"></div></div>
      <div class="g-field"><span class="g-lab">Ich bin</span><div class="g-chips" role="radiogroup" aria-label="Ich bin">${ZG_ARTEN.map(([k,t],i)=>`<label class="g-chip"><input type="radio" name="gArt" value="${k}"${i===0?' required':''}><span>${t}</span></label>`).join('')}</div></div>
      <div class="g-field"><label for="gTel">Handynummer</label><div class="g-in"><input id="gTel" type="tel" autocomplete="tel" inputmode="tel" placeholder="z. B. 0171 2345678" required minlength="6" maxlength="25" pattern="\\+?[0-9][0-9 /()\\-]{5,24}"></div></div>
      <div class="g-field"><label for="gTeam">Mannschaft (wenn passend)</label><div class="g-in"><input id="gTeam" maxlength="40"></div></div>
      <button class="g-btn" id="gGo" type="submit">Anfrage abschicken ${I('chev')}</button>
    </form>`;
  showCard();
  const m=document.getElementById('gMsg');
  document.getElementById('gAng').onsubmit=async e=>{ e.preventDefault(); const b=document.getElementById('gGo'); busy(b,true,'Senden …');
    try{ try{ await sb.rpc('zugang_tel_selbst',{p_tel:document.getElementById('gTel').value}); }catch(_){}   // 149: Handynummer zuerst, damit sie in der Mitteilung an die Leitung steht
      const {error}=await sb.rpc('zugang_angaben',{p_name:document.getElementById('gName').value,p_art:(card.querySelector('input[name=gArt]:checked')||{}).value||'',p_team:document.getElementById('gTeam').value});
      if(error)throw error;
      await enter({}); }
    catch(err){ busy(b,false); msg(m,'err',String(err.message||err).replace(/^.*?: /,'')); } };
}
function viewCode(email,sent,reset){
  card.innerHTML=`<h2>${sent?'Code eingeben':'Anmelden mit Code'}</h2>
    <p class="sub">${sent?'Wir haben dir einen Code an <b style="color:#dbe3f0">'+esc(email)+'</b> geschickt.':'Du bekommst einen Einmal-Code per E-Mail. Ganz ohne Passwort.'}</p>
    <form class="g-form" id="gCodeF">
      <div class="g-msg" id="gMsg"></div>
      ${sent?`<div class="g-field"><label for="gCode">Code aus der E-Mail</label><div class="g-code"><input id="gCode" inputmode="numeric" autocomplete="one-time-code" maxlength="8" placeholder="––––––" required></div></div>`
            :`<div class="g-field"><label for="gEmail">E-Mail</label><div class="g-in"><input id="gEmail" type="email" autocomplete="username" inputmode="email" placeholder="name@beispiel.de" required value="${esc(email||'')}"></div></div>`}
      <button class="g-btn" id="gGo" type="submit">${sent?'Bestätigen':'Code senden'}</button>
      <button class="g-link" type="button" id="gBack">← Zurück zur Anmeldung</button>
    </form>`;
  showCard();
  const m=document.getElementById('gMsg');
  const f=document.getElementById(sent?'gCode':'gEmail'); f.focus({preventScroll:true});
  document.getElementById('gBack').onclick=()=>viewLogin();
  document.getElementById('gCodeF').onsubmit=async e=>{
    e.preventDefault(); const b=document.getElementById('gGo'); msg(m,'',''); busy(b,true);
    try{
      if(!sent){ const em=f.value.trim(); const {error}=await sb.auth.signInWithOtp({email:em,options:{shouldCreateUser:false}}); if(error)throw error; ls.set('svbcLastEmail',em); viewCode(em,true,reset); }
      else{ const {error}=await sb.auth.verifyOtp({email,token:f.value.replace(/\D/g,''),type:'email'}); if(error)throw error; await enter(reset?{mode:'recovery'}:{}); }
    }catch(err){ busy(b,false); msg(m,'err',errText(err)); }
  };
}
function viewForgot(email){
  /* Neues Passwort per Code: funktioniert unabhängig von Weiterleitungs-Einstellungen, weil die App den Code selbst prüft */
  card.innerHTML=`<h2>Passwort vergessen?</h2>
    <p class="sub">Kein Problem. Wir schicken dir einen Code per E-Mail, danach legst du ein neues Passwort fest.</p>
    <form class="g-form" id="gFg">
      <div class="g-msg" id="gMsg"></div>
      <div class="g-field"><label for="gEmail">E-Mail</label><div class="g-in"><input id="gEmail" type="email" autocomplete="username" inputmode="email" required value="${esc(email||'')}"></div></div>
      <button class="g-btn" id="gGo" type="submit">${I('mail')} Code senden</button>
      <button class="g-link" type="button" id="gFgLink">Lieber einen Link per E-Mail</button>
      <div class="g-msg info show">Klappt beides nicht? Dein Admin kann dir in der Nutzerverwaltung jederzeit einen neuen Anmelde-Link erstellen.</div>
      <button class="g-link" type="button" id="gBack">← Zurück zur Anmeldung</button>
    </form>`;
  showCard();
  const m=document.getElementById('gMsg'), em=document.getElementById('gEmail');
  document.getElementById('gBack').onclick=()=>viewLogin();
  document.getElementById('gFg').onsubmit=async e=>{
    e.preventDefault(); const b=document.getElementById('gGo'); msg(m,'',''); busy(b,true);
    try{ const v=em.value.trim(); const {error}=await sb.auth.signInWithOtp({email:v,options:{shouldCreateUser:false}}); if(error)throw error;
      ls.set('svbcLastEmail',v); viewCode(v,true,true); }
    catch(err){ busy(b,false); msg(m,'err',errText(err)); }
  };
  document.getElementById('gFgLink').onclick=async ev=>{
    const b=ev.currentTarget; if(!em.value.trim()||!em.checkValidity()){ em.reportValidity(); return; } busy(b,true,'Senden …');
    try{ const {error}=await sb.auth.resetPasswordForEmail(em.value.trim(),{redirectTo:svBasis()}); if(error)throw error;
      busy(b,false); msg(m,'ok','Wenn die Adresse freigeschaltet ist, ist die E-Mail unterwegs. Bitte auch im Spam-Ordner nachsehen.'); }
    catch(err){ busy(b,false); msg(m,'err',errText(err)); }
  };
}
function viewSetPassword(mode,prof){
  const inv=mode==='invite'||mode==='anfrage';
  card.innerHTML=`<h2>${mode==='anfrage'?'E-Mail bestätigt!':inv?'Willkommen im Team!':'Neues Passwort'}</h2>
    <p class="sub">${mode==='anfrage'?'Leg jetzt dein Passwort fest. Zweimal eintippen, damit kein Tippfehler drin ist.':inv?'Leg jetzt dein persönliches Passwort fest, damit meldest du dich künftig an.':'Vergib ein neues Passwort für deinen Zugang.'}</p>
    ${prof?`<div class="g-welcome"><div class="uav">${esc(initials(prof.name||prof.email))}</div><div><b>${esc(prof.name||prof.email)}</b><span>${esc((prof.role==='viewer'&&(()=>{ try{ return localStorage.getItem('sv_frolle:'+prof.id); }catch(e){ return ''; } })())||ROLE_T[prof.role]||'')} · ${esc(prof.email)}</span></div></div>`:''}
    <form class="g-form" id="gSet">
      <div class="g-msg" id="gMsg"></div>
      <input type="email" autocomplete="username" value="${esc(prof&&prof.email||'')}" style="display:none">
      <div class="g-field"><label for="gPw1">Passwort</label><div class="g-in"><input id="gPw1" type="password" autocomplete="new-password" minlength="10" required placeholder="mindestens 10 Zeichen"><button type="button" class="eye" aria-label="Passwort zeigen">${I('eye')}</button></div>
        <div class="g-strength"><i id="gStr"></i></div><div class="g-hint" id="gStrT">Tipp: ein Satz aus mehreren Wörtern ist sicher und gut zu merken.</div></div>
      <div class="g-field"><label for="gPw2">Wiederholen</label><div class="g-in"><input id="gPw2" type="password" autocomplete="new-password" required></div></div>
      <button class="g-btn" id="gGo" type="submit">${inv?'Loslegen':'Passwort speichern'} ${I('chev')}</button>
    </form>`;
  showCard(); eyeWire(card);
  const m=document.getElementById('gMsg'), p1=document.getElementById('gPw1'), p2=document.getElementById('gPw2');
  p1.focus({preventScroll:true});
  p1.oninput=()=>{ const s=pwScore(p1.value), c=['#f05252','#f59e0b','#eab308','#22c55e','#16a34a'][s]; const i=document.getElementById('gStr'); i.style.width=(p1.value?20+s*20:0)+'%'; i.style.background=c;
    document.getElementById('gStrT').textContent=p1.value.length<10?'Noch '+(10-p1.value.length)+' Zeichen':['Schwach','Geht so','Ordentlich','Stark','Sehr stark'][s]; };
  document.getElementById('gSet').onsubmit=async e=>{
    e.preventDefault(); msg(m,'','');
    if(p1.value.length<10)return msg(m,'err','Bitte mindestens 10 Zeichen.');
    if(p1.value!==p2.value)return msg(m,'err','Die beiden Passwörter sind nicht gleich.');
    const b=document.getElementById('gGo'); busy(b,true,'Speichern …');
    try{ await ensureSession();
      let {error}=await sb.auth.updateUser({password:p1.value});
      if(error&&/session missing/i.test(error.message)&&KEEP){ await sb.auth.setSession(KEEP).catch(()=>{}); ({error}=await sb.auth.updateUser({password:p1.value})); }
      if(error&&!/should be different/i.test(error.message))throw error;
      await sb.rpc('me_update',{p_name:null,p_pw_set:true}); if(SV.profile)SV.profile.pw_set=true;
      if(mode==='anfrage'){ await enter({mode:'angaben'}); return; }
      await loadAndStart(); }
    catch(err){ busy(b,false); msg(m,'err',errText(err));
      if(/session missing|not authenticated|JWT/i.test(String(err&&err.message))&&prof&&prof.email&&!document.getElementById('gNewLink')){   // Selbsthilfe: neuen Link per E-Mail
        m.insertAdjacentHTML('afterend',`<div class="g-msg show" id="gNewLinkBox">Kein Problem: Hol dir einfach einen Code per E-Mail an ${esc(prof.email)}, danach legst du dein Passwort fest.<br><button type="button" class="g-btn alt" id="gNewLink" style="margin-top:10px">${I('mail')} Code per E-Mail</button></div>`);
        document.getElementById('gNewLink').onclick=async ev=>{ const nb=ev.currentTarget; busy(nb,true,'Senden …');
          try{ const {error}=await sb.auth.signInWithOtp({email:prof.email,options:{shouldCreateUser:false}}); if(error)throw error; viewCode(prof.email,true,true); }
          catch(e2){ busy(nb,false); msg(m,'err',errText(e2)); } }; } }
  };
}
function viewBlocked(kind){
  const locked=kind==='locked';
  card.innerHTML=`<h2>${locked?'Zugang gesperrt':'Kein Zugang'}</h2>
    <p class="sub">${locked?'Dein Zugang wurde vom Admin deaktiviert. Wenn das ein Versehen ist, sprich ihn bitte direkt an.':'Für dieses Konto ist (noch) keine Rolle freigeschaltet. Zugang gibt es nur mit Einladung durch den Admin.'}</p>
    <div class="g-form"><button class="g-btn alt" id="gOut">${I('logout')} Abmelden</button></div>`;
  showCard(); document.getElementById('gOut').onclick=()=>SV.signOut();
}

/* ---------- Immer die neueste Version, noch vor dem Start (Beta 0.99.44) ----------
   Albert, 15.11.2026: „Das Allererste muss sein: Ist die App noch aktuell? Keiner soll mit der alten App rumrennen.“
   Bisher prüfte erst die fertig gestartete App (svm35.js) und lud dann neu: Die alte Fassung lief also erst einmal an.
   Jetzt läuft die Prüfung gleich mit der Anmeldung los, und gewartet wird direkt vor dem Laden der App:
   1) version.json sagt, welcher Stand der neueste ist. Ist diese Seite älter (sie kam nach 4 s Wartezeit aus dem
      Speicher), wird einmal neu geladen.
   2) Der Service Worker der neuen Version setzt app.js aus den geänderten Stücken zusammen (sw.js, tools/teile.py).
      Darauf wird gewartet, sonst holte die Seite die ganze Datei doch wieder aus dem Netz.
   Ohne Netz oder wenn das Netz zu langsam ist, startet die App mit dem gespeicherten Stand: Am Sportplatz im Funkloch
   muss sie laufen. svm35.js prüft danach weiter und lädt neu, sobald es geht. */
let _svAkt=null;
function svAktuellStart(){
  if(_svAkt)return _svAkt;
  _svAkt=(async()=>{
    if(!/^https?:$/.test(location.protocol)||navigator.onLine===false)return 'ohne-netz';
    // In der Store-App holt der Updater der Hülle die neue Fassung (app-ota): keine eigene Abfrage, kein Service Worker
    try{ const C=window.Capacitor; if(C&&C.isNativePlatform&&C.isNativePlatform())return 'huelle'; }catch(e){}
    const zeit=(p,ms)=>Promise.race([p,new Promise(r=>setTimeout(()=>r(null),ms))]);
    let reg=null; try{ reg=navigator.serviceWorker?await zeit(navigator.serviceWorker.getRegistration(),1500):null; }catch(e){ reg=null; }
    const sw=reg?zeit(reg.update().then(()=>1).catch(()=>null),6000):Promise.resolve(null);   // läuft schon, während version.json geholt wird
    const v=await zeit(fetch('version.json?t='+Date.now(),{cache:'no-store'}).then(r=>r.ok?r.json():null).catch(()=>null),3000);
    const neu=v&&typeof v.build==='string'&&v.build&&CFG.build&&v.build!==CFG.build?v.build:'';
    if(neu){
      let s={}; try{ s=JSON.parse(sessionStorage.getItem('svbcUpd')||'{}')||{}; }catch(e){ s={}; }
      const n=s.build===neu?(s.n||0)+1:1;
      if(n<=2){   // höchstens zweimal, dann lieber mit dem alten Stand starten als im Kreis laden
        try{ sessionStorage.setItem('svbcUpd',JSON.stringify({build:neu,n,von:CFG.build})); sessionStorage.setItem('svbcReloadFor',neu); }catch(e){}
        loading('Neue Version wird geladen …'); await sw;
        location.replace(location.pathname+'?v='+encodeURIComponent(neu)+location.hash);
        return new Promise(()=>{});   // der Start hält hier an, die Seite lädt neu
      }
    }
    await sw;
    try{
      const w=reg&&(reg.installing||reg.waiting);
      if(w&&w.state!=='activated'&&w.state!=='redundant'){
        loading('Neue Version wird geladen …');
        await zeit(new Promise(r=>{ w.addEventListener('statechange',()=>{ if(w.state==='activated'||w.state==='redundant')r(1); }); }),25000);
        if(navigator.serviceWorker.controller&&navigator.serviceWorker.controller!==reg.active)
          await zeit(new Promise(r=>navigator.serviceWorker.addEventListener('controllerchange',()=>r(1),{once:true})),3000);
      }
    }catch(e){}
    return neu?'alt':'aktuell';
  })().catch(()=>'fehler');
  return _svAkt;
}

/* ---------- Ablauf ---------- */
async function enter(opts){
  svAktuellStart();
  loading('Anmelden …');
  let prof=null;
  try{ const {data,error}=await sb.rpc('touch_me'); if(error)throw error; prof=Array.isArray(data)?data[0]:data; SV.offline=false; }
  catch(e){
    if(isNet(e)){ try{ prof=JSON.parse(ls.get('svbcProfile')||'null'); }catch(_){ prof=null; } SV.offline=true;
      if(!prof){ viewLogin('Keine Verbindung. Für die erste Anmeldung auf diesem Gerät wird Internet gebraucht.','err'); return; } }
    else { viewLogin(errText(e),'err'); return; }
  }
  if(!prof){ viewBlocked('none'); return; }
  if(!prof.active){ ls.set('svbcProfile',null);
    let z=null; try{ const {data}=await sb.rpc('zugang_stand'); z=data; }catch(e){}
    if(z&&z.anfrage){ await keepNow();   // 137: Zugang angefragt: erst Passwort, dann Angaben (nach Google/Apple), dann warten
      if(!prof.pw_set&&opts.mode!=='angaben'){ viewSetPassword('anfrage',prof); return; }
      if(!z.art){ viewAngaben(z); return; }
      viewWartet(z); return; }
    viewBlocked('locked'); return; }
  SV.profile=prof; ls.set('svbcProfile',JSON.stringify(prof)); await keepNow();
  if(opts.mode==='recovery'){ viewSetPassword('recovery',prof); return; }
  if(!prof.pw_set&&!SV.offline){ viewSetPassword('invite',prof); return; }   // noch kein eigenes Passwort → erst festlegen (egal ob per Link, Code oder gespeicherter Anmeldung)
  await loadAndStart();
}
async function fetchDataset(token){
  const r=await fetch(CFG.url+'/rest/v1/dataset?id=eq.1&select=version,body',{headers:{apikey:CFG.anon,Authorization:'Bearer '+token,Accept:'application/vnd.pgrst.object+json'}});
  if(r.status===406)throw new Error('kein-datenbestand');
  if(!r.ok)throw new Error('Datenbestand: HTTP '+r.status);
  const total=+r.headers.get('content-length')||+(CFG.dataBytes||0)||3200000;
  if(!r.body||!r.body.getReader){ loading('Spielerdaten werden geladen …',60); return await r.json(); }
  const rd=r.body.getReader(), parts=[]; let got=0;
  for(;;){ const {done,value}=await rd.read(); if(done)break; parts.push(value); got+=value.length; loading('Spielerdaten werden geladen … '+Math.round(got/1048576*10)/10+' MB',Math.min(96,got/total*100)); }
  const buf=new Uint8Array(got); let o=0; for(const p of parts){ buf.set(p,o); o+=p.length; }
  return JSON.parse(new TextDecoder().decode(buf));
}
function SV_LEER(){ return {version:'leer',body:{generated:'',players:[],jugend:[],clubs:{},ligaGA:{},startelf:{formation:'4-4-2',slots:{}},startelfLast:{formation:'4-4-2',slots:{}},startelfNow:{formation:'4-4-2',slots:{}}}}; }
async function loadAndStart(){
  loading('Daten werden vorbereitet …');
  const {data:{session}}=await sb.auth.getSession();
  let cached=await IDB.get('dataset'), ver=null, ds=null;
  if(!SV.offline){ try{ const {data,error}=await sb.rpc('dataset_version'); if(error)throw error; ver=data; }catch(e){ if(!isNet(e))throw e; SV.offline=true; } }
  // 0.99.23: Spieler und Helfer bekommen den Datenbestand (Kader, Scouting, Bewertungen) nicht. Ein früher gespeicherter Stand wird verworfen.
  const ohneBestand=['spieler','helfer'].includes((SV.profile&&SV.profile.role)||'');
  if(ohneBestand&&cached){ try{ await IDB.clear(); }catch(e){} cached=null; }
  if(cached&&cached.version&&(SV.offline||cached.version===ver)){ ds=cached; }
  else if(!SV.offline&&session){
    try{ ds=await fetchDataset(session.access_token); await IDB.set('dataset',ds); }
    catch(e){ if(String(e.message)==='kein-datenbestand'&&(SV.profile.role==='jugend'||ohneBestand)){ ds=SV_LEER(); }   // Jugendtrainer ohne Freigabe für die Erste: App startet mit leerem Datenbestand
    else{ if(String(e.message)==='kein-datenbestand'){ card.innerHTML='<h2>Noch keine Daten</h2><p class="sub">Der Spieler-Datenbestand wurde noch nicht hochgeladen.</p>'; showCard(); return; } if(cached){ ds=cached; SV.offline=true; } else throw e; } }
  }
  if(!ds){ viewLogin('Keine Verbindung. Für den ersten Start auf diesem Gerät wird Internet gebraucht.','err'); return; }
  window.__SVBC_DATA=ds.body; window.__SVBC_USER=SV.profile; window.__SVBC_DSVER=ds.version;
  if(!SV.offline){ try{ await svAktuellStart(); }catch(e){} }
  loading('App wird gestartet …',100);
  document.body.classList.add('role-'+SV.profile.role);
  if(!(SV.profile.role==='admin'||SV.profile.role==='vorstand'||SV.profile.role==='planer'||SV.profile.role==='trainer'))document.body.classList.add('ro');
  const s=document.createElement('script'); s.src='app.js?v='+encodeURIComponent(CFG.build||'');
  s.onload=()=>{ document.body.classList.remove('gated'); gate.classList.add('done'); setTimeout(()=>{ gate.style.display='none'; },600); };
  s.onerror=()=>{ viewLogin('Die App konnte nicht geladen werden. Bitte neu laden.','err'); };
  document.body.appendChild(s);
}

/* ---------- Öffentliche Funktionen für die App ---------- */
SV.signOut=async function(){
  window.__svbcOut=true;
  try{ await sb.auth.signOut({scope:'local'}); }catch(e){}
  ['svbcOutbox','svbcProfile','svbcReloadFor','svbc-backend'].forEach(k=>ls.set(k,null));
  try{ sessionStorage.clear(); }catch(e){}
  await IDB.clear();
  location.replace(location.pathname);
};
SV.changePassword=async function(pw){
  const {error}=await sb.auth.updateUser({password:pw}); if(error)throw new Error(errText(error));
  await sb.rpc('me_update',{p_name:null,p_pw_set:true});
};
SV.admin=async function(action,payload){
  const {data,error}=await sb.functions.invoke('admin-users',{body:Object.assign({app_url:svBasis()},payload||{},{action})});
  if(error){ let t=error.message; try{ const j=await error.context.json(); if(j&&j.error)t=j.error; }catch(e){} throw new Error(t); }
  if(data&&data.error)throw new Error(data.error);
  return data;
};
SV.errText=errText; SV.isNet=isNet; SV.pwScore=pwScore;
SV.passkey={geht:pkGeht,geraet:pkGeraet,fehler:pkFehler,merken:on=>ls.set('svbcPasskey',on?'1':null)};
sb.auth.onAuthStateChange((ev,s)=>{ if(s)keepS(s); if(ev==='SIGNED_OUT'&&window.__SVBC_USER){ location.replace(location.pathname); } });

/* ---------- Start: Links aus Einladungen / E-Mails auswerten ---------- */
(async function start(){
  const h=new URLSearchParams(location.hash.slice(1)), q=new URLSearchParams(location.search);
  const clean=()=>{ try{ history.replaceState(null,'',location.pathname); }catch(e){} };
  try{
    for(const [tag,type] of [['invite','invite'],['login','magiclink'],['recovery','recovery']]){
      if(h.get(tag)){
        const token_hash=h.get(tag); clean(); loading('Einladung wird geprüft …');
        const {data:vd,error}=await sb.auth.verifyOtp({token_hash,type});
        if(error){   // Link schon benutzt (z. B. zweimal geöffnet)? Wenn hier schon angemeldet: einfach weitermachen
          const {data:{session}}=await sb.auth.getSession();
          if(session&&type!=='recovery'){ keepS(session); await enter({viaLink:true,mode:'invite'}); return; }
          viewLogin(errText(error)+(type==='invite'?' Falls du dein Passwort noch nicht festgelegt hast: „Passwort vergessen“ antippen, dann kommt ein neuer Link per E-Mail.':''),'err'); return; }
        keepS(vd&&vd.session);
        await enter({viaLink:true,mode:type==='recovery'?'recovery':'invite'}); return;
      }
    }
    if(h.get('access_token')&&h.get('refresh_token')){          /* Link aus Supabase-E-Mail (z.B. Passwort zurücksetzen) */
      const type=h.get('type'); clean(); loading('Anmelden …');
      const {error}=await sb.auth.setSession({access_token:h.get('access_token'),refresh_token:h.get('refresh_token')});
      if(error){ viewLogin(errText(error),'err'); return; }
      await enter({viaLink:true,mode:type==='recovery'?'recovery':'invite'}); return;
    }
    if(h.get('error_description')){ clean(); viewLogin(errText(new Error(h.get('error_description'))),'err'); return; }
    if(q.get('code')){ clean(); loading('Anmelden …'); const {error}=await sb.auth.exchangeCodeForSession(q.get('code')); if(error){ viewLogin(errText(error),'err'); return; } await enter({viaLink:true}); return; }
    const {data:{session}}=await sb.auth.getSession();
    if(session){ await enter({}); return; }
    if(!navigator.onLine&&ls.get('svbcProfile')){ SV.offline=true; await enter({}); return; }
    viewLogin();
  }catch(e){ viewLogin(errText(e),'err'); }
})();
})();
