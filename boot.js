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
function showCard(){ load.classList.add('hide'); card.style.display=''; }
function loading(txt,pct){
  load.classList.remove('hide'); card.style.display='none';
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
  document.getElementById('gNeu').onclick=()=>viewAnfrage(em.value.trim());
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
  card.innerHTML=`<h2>Fast geschafft${vn?', '+esc(vn):''}!</h2>
    <p class="sub">Dein Zugang ist angefragt. Die Leitung schaltet dich frei, meistens noch am selben Tag. Du bekommst dann eine Mail und bist mit einem Tipp drin.</p>
    <div class="g-form"><button class="g-btn" id="gNochmal" type="button">Bin ich schon frei? ${I('chev')}</button>
      <button class="g-btn alt" id="gOut" type="button">${I('logout')} Abmelden</button></div>`;
  showCard();
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

/* ---------- Ablauf ---------- */
async function enter(opts){
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
