    sel=Math.min(sel,Math.max(0,list.length-1));
    res.innerHTML=list.length?'<div class="gh">Spieler</div>'+list.map((x,i)=>`<div class="gi${i===sel?' sel':''}" data-i="${i}">${avaHtml(x.p)}<div style="min-width:0"><b>${svEsc(x.p.name)}</b><span>${svEsc(x.p.club||'')} · ${svEsc((typeof LIGA_NAME!=='undefined'&&LIGA_NAME[x.p.liga])||x.p.liga||'')}${x.p.pos?' · '+svEsc(x.p.pos):''}</span></div><div class="sc">${Math.round(x.s)}</div></div>`).join('')
      :'<div class="ge">Kein Spieler gefunden</div>';
    res.classList.add('open');
    res.querySelectorAll('.gi').forEach(g=>g.onmousedown=e=>{ e.preventDefault(); go(+g.dataset.i); });
  };
  const go=i=>{ const x=list[i]; if(!x)return; inp.value=''; res.classList.remove('open'); inp.blur(); box.classList.remove('mopen'); openModal(x.p.id); };
  inp.addEventListener('input',()=>{ sel=0; draw(); });
  inp.addEventListener('keydown',e=>{
    if(e.key==='ArrowDown'){ e.preventDefault(); sel=Math.min(sel+1,list.length-1); draw(); }
    else if(e.key==='ArrowUp'){ e.preventDefault(); sel=Math.max(sel-1,0); draw(); }
    else if(e.key==='Enter'){ e.preventDefault(); go(sel); }
    else if(e.key==='Escape'){ inp.value=''; res.classList.remove('open'); inp.blur(); box.classList.remove('mopen'); }
  });
  inp.addEventListener('blur',()=>setTimeout(()=>{ res.classList.remove('open'); box.classList.remove('mopen'); },150));
  document.addEventListener('keydown',e=>{
    if((e.metaKey||e.ctrlKey)&&e.key.toLowerCase()==='k'){ e.preventDefault(); svSearchOpen(); }
    else if(e.key==='/'&&!crmIsTyping()&&!document.getElementById('overlay').classList.contains('open')){ e.preventDefault(); svSearchOpen(); }
  });
}
function svSearchOpen(){ const box=document.getElementById('gSearchBox'), inp=document.getElementById('gSearch'); if(!inp)return; if(innerWidth<=760)box.classList.add('mopen'); inp.focus(); inp.select(); }

/* ---------- Mein Konto ---------- */
function svModal(html){ const M=document.getElementById('modal'); M.innerHTML='<button class="close" id="svClose" aria-label="Schließen">✕</button>'+html; document.getElementById('overlay').classList.add('open'); document.getElementById('svClose').onclick=()=>closeOverlay(); return M; }
function svAccount(){
  const R=svRolleT();
  const M=svModal(`<div class="mhead" style="gap:16px"><div class="uav r-${svEsc(svRole())}" style="width:58px;height:58px;border-radius:18px;font-size:20px">${svEsc(svIni(SVU.name||SVU.email))}</div>
      <div><h2 style="margin:0">${svEsc(SVU.name||'Mein Konto')}</h2><div class="msub">${svEsc(SVU.email||'')}</div><div style="margin-top:8px"><span class="rolechip r-${svEsc(svRole())}"><i></i>${svEsc(R)}</span></div></div></div>
    <div class="editsec" style="margin-top:22px"><h4>Passwort ändern</h4>
      <div class="editgrid" style="grid-template-columns:1fr 1fr auto;align-items:end">
        <div class="field"><label>Neues Passwort</label><input id="svPw1" type="password" autocomplete="new-password" placeholder="mind. 10 Zeichen"></div>
        <div class="field"><label>Wiederholen</label><input id="svPw2" type="password" autocomplete="new-password"></div>
        <button class="btn" id="svPwGo">Speichern</button></div>
      <div class="note" id="svPwMsg"></div></div>
    <div class="editsec"><h4>App</h4><div class="btnrow">
      <button class="btn ghost" id="svShare">${SVI('share')} App-Link teilen</button>
      <button class="btn ghost" id="svReload">${SVI('refresh')} Neu laden</button>
      <button class="btn ghost" id="svOut" style="color:#fca5a5">${SVI('logout')} Abmelden</button></div>
      <p class="note">Version ${svEsc((window.SVBC_CFG||{}).build||'')} · Datenstand ${svEsc(window.__SVBC_DSVER||'')}${SVB.offline?' · offline':''}</p></div>`);
  M.querySelectorAll('.btn svg').forEach(s=>{ s.style.cssText='width:16px;height:16px;vertical-align:-3px;margin-right:4px'; });
  document.getElementById('svOut').onclick=()=>SVB.signOut();
  document.getElementById('svReload').onclick=()=>{ try{appReload();}catch(e){ location.reload(); } };
  document.getElementById('svShare').onclick=()=>{ try{appShare();}catch(e){} };
  document.getElementById('svPwGo').onclick=async()=>{
    const a=document.getElementById('svPw1').value, b=document.getElementById('svPw2').value, m=document.getElementById('svPwMsg');
    if(a.length<10){ m.textContent='Bitte mindestens 10 Zeichen.'; m.style.color='#fca5a5'; return; }
    if(a!==b){ m.textContent='Die Passwörter sind nicht gleich.'; m.style.color='#fca5a5'; return; }
    try{ await SVB.changePassword(a); m.textContent='✓ Passwort geändert.'; m.style.color='#86efac'; document.getElementById('svPw1').value=document.getElementById('svPw2').value=''; }
    catch(e){ m.textContent=e.message; m.style.color='#fca5a5'; }
  };
}

/* ---------- Admin: Nutzer & Rollen ---------- */
const SV_ROLE_INFO={
  admin:{t:'Admin',d:'Voller Zugriff und Nutzerverwaltung',yes:['Alles sehen & bearbeiten','Kontaktdaten','Leute einladen & Rollen vergeben'],no:[]},
  vorstand:{t:'Vorstand',d:'Alles wie die Kaderplaner. Plus einladen',yes:['Alles sehen & bearbeiten','Kandidaten, Kontakte & Aufstellung','Leute einladen (bis Kaderplaner)'],no:['Rollen ändern, sperren, löschen']},
  planer:{t:'Kaderplaner',d:'Die operative Kaderplanung',yes:['Kandidaten & Kontakte pflegen','Kaderplan & Aufstellung','Positionen & Spielerdaten','Notizen, MVP, Merkliste'],no:['Nutzerverwaltung']},
  trainer:{t:'Trainer / Scout',d:'Bewerten und einschätzen',yes:['Alles ansehen','Positionen & Spielerdaten ändern','Notizen, Eye-Test & MVP','Merkliste'],no:['Kontaktdaten','Kaderplanung ändern']},
  viewer:{t:'Gast',d:'Nur lesen: z.B. für Gäste und Partner',yes:['Kaderplan & Aufstellung ansehen','Scouting & Datenbank'],no:['Kontaktdaten & Notizen','Änderungen']}
};
let SV_USERS=[], _svDel=null;
async function svAdminLoad(){ const {data,error}=await SVB.sb.rpc('admin_list'); if(error)throw error; SV_USERS=data||[]; }
const SV_ROLES=['admin','vorstand','planer','trainer','viewer'], SV_VORSTAND_INVITE=['planer','trainer','viewer'];
function svRoleOpts(cur,list){ return (list||SV_ROLES).map(r=>`<option value="${r}"${r===cur?' selected':''}>${svEsc(SV_ROLE_INFO[r].t)}</option>`).join(''); }
async function svAdminRender(reload){
  const P=document.getElementById('panel-admin'); if(!P||!canManage())return; const ADM=isAdmin();
  if(!P.dataset.init){ P.dataset.init='1'; P.innerHTML='<div class="card"><div class="empty">Lade Nutzer …</div></div>'; reload=true; }
  if(reload){ try{ await svAdminLoad(); }catch(e){ P.innerHTML='<div class="card"><div class="empty">Nutzer konnten nicht geladen werden: '+svEsc(SVB.errText(e))+'</div></div>'; return; } }
  const act=SV_USERS.filter(u=>u.active), wait=SV_USERS.filter(u=>u.active&&!u.pw_set&&!u.last_sign_in_at), off=SV_USERS.filter(u=>!u.active);
  const cnt=r=>act.filter(u=>u.role===r).length;
  const draft=P._draft||{name:'',email:'',role:'planer'};
  P.innerHTML=`
  <div class="card">
    <div class="adm-head"><div><h3 style="margin:0">Person einladen</h3><p style="margin:6px 0 0;font-size:13.5px">Du bekommst einen persönlichen Link. Den schickst du per WhatsApp oder Mail. Wer ihn öffnet, legt sein Passwort fest und ist drin.${ADM?'':' Als Vorstand kannst du Kaderplaner, Trainer, Jugendtrainer und Gäste einladen. Rollen ändern, sperren und löschen macht der Admin.'}</p></div></div>
    <form class="invite" id="svInv" autocomplete="off">
      <div><label for="svInvName">Name</label><input id="svInvName" class="search" placeholder="z.B. Erwin Müller" value="${svEsc(draft.name)}" required></div>
      <div><label for="svInvMail">E-Mail</label><input id="svInvMail" class="search" type="email" placeholder="name@beispiel.de" value="${svEsc(draft.email)}" required></div>
      <div><label for="svInvRole">Rolle</label><select id="svInvRole">${svRoleOpts(draft.role,ADM?SV_ROLES:SV_VORSTAND_INVITE)}</select></div>
      <button class="btn" id="svInvGo" type="submit" style="height:46px">${SVI('plus')} Einladen</button>
    </form>
    <div id="svInvOut"></div>
  </div>
  <div class="card">
    <div class="adm-head"><h3 style="margin:0">Team</h3>
      <div class="adm-stats"><div class="adm-stat"><b>${act.length}</b><span>aktiv</span></div><div class="adm-stat"><b>${cnt('planer')+cnt('admin')+cnt('vorstand')}</b><span>mit Schreibrechten</span></div><div class="adm-stat"><b>${wait.length}</b><span>Einladung offen</span></div>${off.length?`<div class="adm-stat"><b>${off.length}</b><span>gesperrt</span></div>`:''}</div></div>
    <div class="ulist">${SV_USERS.map(u=>{
      const me=u.id===SVU.id, pend=!u.pw_set&&!u.last_sign_in_at, canLink=ADM||(pend&&u.active&&SV_VORSTAND_INVITE.includes(u.role));
      const st=!u.active?'<span class="pill off">gesperrt</span>':pend?'<span class="pill wait">Einladung offen</span>':'<span class="pill on">aktiv</span>';
      const seen=u.last_seen?'zuletzt aktiv '+svAgo(u.last_seen):pend?'eingeladen '+svAgo(u.created_at):'noch nicht aktiv';
      return `<div class="urow${u.active?'':' off'}" data-u="${svEsc(u.id)}">
        <div class="uav r-${svEsc(u.role)}">${svEsc(svIni(u.name||u.email))}</div>
        <div class="nm"><b>${svEsc(u.name||'–')}${me?' <span style="color:var(--ink3);font-weight:600">(du)</span>':''}</b><span>${svEsc(u.email)}</span></div>
        <div class="st">${st}<br>${svEsc(seen)}${u.invited_by_name?' · von '+svEsc(u.invited_by_name):''}</div>
        ${ADM?`<select data-role="${svEsc(u.id)}"${me?' disabled title="Deine eigene Rolle kannst du nicht ändern"':''}>${svRoleOpts(u.role)}</select>`:`<span class="rolechip r-${svEsc(u.role)}" style="justify-self:start"><i></i>${svEsc(svRolleVon(u))}</span>`}
        <div class="acts">${me?'':`
          ${canLink?`<button class="iconbtn" data-link="${svEsc(u.id)}" title="${pend?'Neuen Einladungslink erstellen':'Neuen Anmelde-Link erstellen'}">${SVI('link')}</button>`:''}
          ${ADM?`<button class="iconbtn" data-act="${svEsc(u.id)}" title="${u.active?'Zugang sperren':'Zugang wieder freigeben'}">${SVI(u.active?'ban':'check')}</button>
          <button class="iconbtn danger" data-del="${svEsc(u.id)}" title="Zugang löschen">${SVI('trash')}</button>`:''}`}</div>
      </div>`; }).join('')}</div>
  </div>
  <div class="sechead">Was darf wer?</div>
  <div class="rolegrid">${SV_ROLES.map(r=>{ const R=SV_ROLE_INFO[r]; return `<div class="rolecard"><span class="rolechip r-${r}"><i></i>${svEsc(R.t)}</span><h4>${svEsc(R.d)}</h4><ul>${R.yes.map(x=>`<li>${svEsc(x)}</li>`).join('')}${R.no.map(x=>`<li class="no">${svEsc(x)}</li>`).join('')}</ul></div>`; }).join('')}</div>`;
  const $$=s=>P.querySelector(s);
  ['svInvName','svInvMail','svInvRole'].forEach(id=>$$('#'+id).addEventListener('input',()=>{ P._draft={name:$$('#svInvName').value,email:$$('#svInvMail').value,role:$$('#svInvRole').value}; }));
  $$('#svInv').onsubmit=async e=>{
    e.preventDefault(); const b=$$('#svInvGo'); b.disabled=true; b.textContent='Einladen …';
    const name=$$('#svInvName').value.trim(), email=$$('#svInvMail').value.trim(), role=$$('#svInvRole').value;
    try{ const r=await SVB.admin('invite',{name,email,role}); P._draft=null; await svAdminRender(true); svLinkBox(r.link,name,role,'invite'); }
    catch(err){ b.disabled=false; b.innerHTML=SVI('plus')+' Einladen'; kToast('⚠️ '+err.message); }
  };
  P.querySelectorAll('[data-role]').forEach(s=>s.onchange=async()=>{
    const u=SV_USERS.find(x=>x.id===s.dataset.role);
    try{ const {error}=await SVB.sb.rpc('admin_update',{p_id:s.dataset.role,p_role:s.value,p_active:null,p_name:null}); if(error)throw error; kToast('✓ '+(u&&u.name||'')+' ist jetzt '+SV_ROLE_INFO[s.value].t); svAdminRender(true); }
    catch(e){ kToast('⚠️ '+String(e.message||e)); svAdminRender(true); }
  });
  P.querySelectorAll('[data-act]').forEach(b=>b.onclick=async()=>{
    const u=SV_USERS.find(x=>x.id===b.dataset.act); if(!u)return;
    try{ const {error}=await SVB.sb.rpc('admin_update',{p_id:u.id,p_role:null,p_active:!u.active,p_name:null}); if(error)throw error; kToast(u.active?'🔒 '+u.name+' gesperrt':'✓ '+u.name+' wieder freigegeben'); svAdminRender(true); }
    catch(e){ kToast('⚠️ '+String(e.message||e)); }
  });
  P.querySelectorAll('[data-link]').forEach(b=>b.onclick=async()=>{
    const u=SV_USERS.find(x=>x.id===b.dataset.link); if(!u)return; b.disabled=true;
    try{ const r=await SVB.admin('link',{user_id:u.id,kind:'magiclink'}); svLinkBox(r.link,u.name,u.role,u.pw_set?'login':'invite'); }
    catch(e){ kToast('⚠️ '+e.message); } b.disabled=false;
  });
  P.querySelectorAll('[data-del]').forEach(b=>b.onclick=async()=>{
    const u=SV_USERS.find(x=>x.id===b.dataset.del); if(!u)return;
    if(_svDel!==u.id){ _svDel=u.id; b.style.cssText='width:auto;padding:0 10px;background:rgba(240,82,82,.18);color:#fecaca;border-color:rgba(240,82,82,.5);font-size:12px;font-weight:700'; b.textContent='Wirklich löschen?'; setTimeout(()=>{ if(_svDel===u.id){ _svDel=null; svAdminRender(); } },4000); return; }
    _svDel=null; b.disabled=true;
    try{ await SVB.admin('delete',{user_id:u.id}); kToast('🗑️ Zugang von '+u.name+' gelöscht'); svAdminRender(true); }
    catch(e){ kToast('⚠️ '+e.message); svAdminRender(); }
  });
}
function svLinkBox(link,name,role,kind){
  const out=document.getElementById('svInvOut'); if(!out)return;
  const fn=svFirst(name)||'du', R=(SV_ROLE_INFO[role]||{}).t||'';
  const txt=kind==='invite'
    ?`Hallo ${fn}! Du bist zur SV/BSC Sportzentrale eingeladen. Unserer App für Kader, Scouting und Mannschaft (Rolle: ${R}).\n\nTipp auf den Link, leg dein Passwort fest, fertig:\n${link}\n\nDer Link ist nur für dich und nur begrenzt gültig. Danach kannst du die App auch aufs Handy legen.`
    :`Hallo ${fn}! Hier dein neuer Anmelde-Link für die SV/BSC Sportzentrale:\n${link}\n\nNur für dich und nur begrenzt gültig.`;
  out.innerHTML=`<div class="linkbox"><b style="display:flex;align-items:center;gap:8px">${SVI('check')} ${kind==='invite'?'Einladung für '+svEsc(name)+' ist bereit':'Neuer Link für '+svEsc(name)}</b>
    <code>${svEsc(link)}</code>
    <div class="btnrow">
      <a class="btn" href="https://wa.me/?text=${encodeURIComponent(txt)}" target="_blank" rel="noopener">${SVI('chat')} Per WhatsApp</a>
      <a class="btn ghost" href="mailto:?subject=${encodeURIComponent('Dein Zugang zur SV/BSC Sportzentrale')}&body=${encodeURIComponent(txt)}">${SVI('mail')} Per Mail</a>
      <button class="btn ghost" id="svLinkCopy">${SVI('copy')} Text kopieren</button>
    </div><p class="note" style="margin-top:10px">Der Link ist einmalig und nur begrenzt gültig. Abgelaufen? Einfach über ${SVI('link').replace('<svg','<svg style="width:13px;height:13px;vertical-align:-2px"')} einen neuen erzeugen.</p></div>`;
  out.querySelectorAll('.btn svg').forEach(s=>{ s.style.cssText='width:16px;height:16px;vertical-align:-3px;margin-right:4px'; });
  document.getElementById('svLinkCopy').onclick=()=>kCopy(txt);
  out.scrollIntoView({behavior:'smooth',block:'nearest'});
}

/* ---------- Start ---------- */
function svInit(){
  document.body.classList.add('role-'+svRole()); if(!canEdit())document.body.classList.add('ro');
  document.querySelectorAll('[data-tab="kandidaten"],[data-sheet="kandidaten"]').forEach(b=>{ if(svGast())b.style.display='none'; });
  document.querySelectorAll('[data-tab="admin"],[data-sheet="admin"],.adm-only').forEach(b=>{ if(!canManage())b.style.display='none'; });
  document.querySelectorAll('.tabbar .ti[data-tab="elf"]').forEach(b=>{ b.style.display=svRole()==='viewer'?'':'none'; });
  const R=svRolleT(), nm=SVU.name||SVU.email||'';
  document.querySelectorAll('[data-me-name]').forEach(el=>el.textContent=nm);
  document.querySelectorAll('[data-me-role]').forEach(el=>el.textContent=R);
  document.querySelectorAll('[data-me-ini]').forEach(el=>{ el.textContent=svIni(nm); el.className='uav r-'+svRole(); });
  document.querySelectorAll('[data-me]').forEach(b=>b.onclick=()=>{ svSheet(false); svAccount(); });
  document.querySelectorAll('.sgrid [data-sheet]').forEach(b=>b.onclick=()=>goTab(b.dataset.sheet));
  const mb=document.getElementById('tMore'); if(mb)mb.onclick=()=>svSheet(!document.getElementById('moreSheet').classList.contains('open'));
  const bg=document.getElementById('sheetBg'); if(bg)bg.onclick=()=>svSheet(false);
  const ms=document.getElementById('tbSearch'); if(ms)ms.onclick=svSearchOpen;
  svSearchWire(); svHello(); svRealtime(); svActivity(); svBadges();
  const h=(location.hash||'').slice(1); goTab(/^[a-z]+$/.test(h)?h:(svStartBereich()||'home'));
  { const _rh=renderHome; renderHome=function(){ const r=_rh.apply(this,arguments); svHello(); svTiles(); svActivitySoon(); svBadges(); return r; }; }
  svTiles();
  { const _ar=crmAfterRemote; crmAfterRemote=function(){ const r=_ar.apply(this,arguments); svActivitySoon(); return r; }; }
  if(SVB.offline)syncState('err');
}

/* =====================================================================
   SV/BSC Scout · Saison 26/27 live: Bewertung aus Vorsaison + laufender Saison
   - Produktion/Teamanteil: gleitend über 25/26 + 26/27 (ligagewichtet) → aktuell, aber stabil
   - Formtrend: laufende Saison gegen Vorsaison (ab 3 Spielen)
   - Tabellenkontext/Gegentore: ab 3 Spielen aus der aktuellen Tabelle
   ===================================================================== */
const SV_SEASON_MIN=3;
function svCurOk(p){ return !!(p&&p.cur&&p.cur.spiele>0&&!p.isJugend); }
function svSeasonLabel(){ const s=(DATA&&DATA.season)||'2526'; return s.slice(0,2)+'/'+s.slice(2); }
{ const _sc0=scores; scores=function(p){
  if(!svCurOk(p))return _sc0(p);
  const c=p.cur, w25=wOf(p), w26=LIGA_W[ligaBase(c.sub||c.liga)]||LIGA_W[ligaBase(c.liga)]||w25;
  const sp25=p.einsaetze||((p.toreBelegt&&p.kaderDoc&&p.kaderStarts)?Math.max(6,p.kaderStarts):p.teamSp)||0;
  const t25=p.tore||0, t26=c.tore||0, sp26=c.spiele||0, spAll=Math.max(1,sp25+sp26);
  const gw=(t25*w25+t26*w26)/spAll;                       /* ligagewichtete Tore/Spiel über beide Saisons */
  const gpg=(t25+t26)/spAll;
  let prod=clamp(gw/1.0*100,0,100);
  const tTall=(p.tT||0)+(c.tT||0);
  let share=tTall>0?clamp(((t25+t26)/tTall)/0.40*100,0,100):50;
  const useCur=sp26>=SV_SEASON_MIN;
  const rank=useCur?c.rank:p.rank, tc=useCur?c.teamCount:p.teamCount;
  let ctx=50; if(rank!=null&&tc>1){const pct=(rank-1)/(tc-1);ctx=clamp(30+pct*70,0,100);}
  let pot=50; if(p.alter!=null){const a=p.alter;pot=a<=20?100:a<=23?88:a<=26?70:a<=29?50:a<=32?32:18;}
  let trend=50,tratio=null;
  if(useCur&&sp25>0){                                       /* Form: laufende Saison vs. Vorsaison */
    const r26=(t26/sp26)*w26, r25=(t25/sp25)*w25;
    if(r25>0.02||r26>0.02){ tratio=r26/Math.max(0.05,r25); trend=clamp(50+(tratio-1)*40,0,100); if(w26<w25)trend=Math.min(trend,85); if(w26>w25&&tratio>=0.7)trend=Math.max(trend,55); }
  } else if(p.prev){
    const wPrevLiga=LIGA_W[ligaBase(p.prev.liga)]; const wprev=(p.prev.tore/Math.max(1,p.prev.spiele))*wPrevLiga;
    tratio=((t25/Math.max(1,sp25))*w25)/Math.max(0.05,wprev); trend=clamp(50+(tratio-1)*40,0,100);
  }
  let scout=50;
  if(p.scouted&&Object.values(p.scout).some(v=>v!==5)){const w=POS_W[p.pos]||POS_W['ST'];let s=0;for(const k in w)s+=(p.scout[k]||5)*w[k];scout=clamp(s*10,0,100);}
  const presse=(p.pressIdx!=null)?p.pressIdx:50;
  let defMode=false,gaTxt=null;
  if(p.pos==='TW'||p.pos==='IV'||p.pos==='AV'){
    defMode=true; ctx=50;
    const cl=(typeof clubFor==='function')?clubFor(p.club):null;
    const s26=cl&&cl.s2526, s27=cl&&cl['s'+(DATA.season||'2627')];
    const lg25=(DATA.ligaGA&&DATA.ligaGA['2526']&&s26)?DATA.ligaGA['2526'][s26.liga]:null;
    const lg27=(DATA.ligaGA&&DATA.ligaGA[DATA.season]&&s27)?DATA.ligaGA[DATA.season][s27.liga]:null;
    let ga=0,sp=0,exp=0;
    if(s26&&s26.spiele&&lg25){ga+=s26.gegentore;sp+=s26.spiele;exp+=lg25*s26.spiele;}
    if(s27&&s27.spiele&&lg27){ga+=s27.gegentore;sp+=s27.spiele;exp+=lg27*s27.spiele;}
    let defv=50;
    if(sp>0&&exp>0){ const ratio=ga/exp; defv=clamp((1.45-ratio)/0.9*100,0,100); gaTxt=(ga/sp).toFixed(2)+' Gegentore/Spiel (25/26 + '+svSeasonLabel()+') vs. Liga-Schnitt '+(exp/sp).toFixed(2);
      if(s27&&s27.spiele>=SV_SEASON_MIN&&lg27&&s26&&s26.spiele&&lg25){ const r27=(s27.gegentore/s27.spiele)/lg27, r26=(s26.gegentore/s26.spiele)/lg25; trend=clamp(50+(r26-r27)*60,0,100); } }
    if(p.pos==='AV'&&p.assists)defv=clamp(defv+Math.min(10,p.assists*3),0,100);
    if(t25+t26>0)defv=clamp(defv+Math.min(15,(t25+t26)*5),0,100);
    prod=Math.max(prod,defv); if(!(t25+t26>0))share=defv;
  }
  const sum=W.prod+W.share+W.ctx+W.pot+W.trend+W.presse+W.scout;
  let total=(prod*W.prod+share*W.share+ctx*W.ctx+pot*W.pot+trend*W.trend+presse*W.presse+scout*W.scout)/sum;
  let sdsB=0; if(p.sds>0){sdsB=Math.min(6,p.sds*2);total=Math.min(100,total+sdsB);}
  const _mo=mvpOf(p); let mvpAdj=0,mvpVal=_mo?_mo.v:null,mvpD=_mo?_mo.d:null,mvpBase=total;
  if(mvpVal!=null&&p.adjTo==null){const _b=total;total=Math.min(100,total*mvpFactor(mvpVal));mvpAdj=Math.round((total-_b)*10)/10;}
  let adjD=0,adjBase=null; if(p.adjTo!=null){adjBase=Math.round(total*10)/10;adjD=Math.round((p.adjTo-total)*10)/10;total=p.adjTo;}
  const proj=Math.round(gw*30);
  return {prod:Math.round(prod),share:Math.round(share),ctx:Math.round(ctx),pot:Math.round(pot),trend:Math.round(trend),presse:Math.round(presse),scout:Math.round(scout),total:Math.round(total*10)/10,
    mvp:mvpVal,mvpAdj,mvpD,mvpBase:Math.round(mvpBase*10)/10,gpg,proj,tratio,defMode,gaTxt,sdsB,adjD,adjBase,shareRaw:tTall>0?(t25+t26)/tTall:null,cur:c};
}; }

/* Liste: aktuelle Saison zuerst zeigen */
{ const _rh0=rowHtml; rowHtml=function(p,i,extra){
  let h=_rh0(p,i,extra);
  if(svCurOk(p)){ const c=p.cur; h=h.replace(`<span><b>${p.tore}</b> Tore</span>`,`<span><b>${c.tore}</b> Tore ${svSeasonLabel()}</span><span>${p.tore} T 25/26</span>`);
    if(c.wechsel)h=h.replace(`<span>${p.club}</span>`,`<span>${svEsc(c.club)} <i style="color:var(--gold);font-style:normal" title="Vereinswechsel: vorher ${svEsc(p.club)}">⇄</i></span>`); }
  if(p.neu27)h=h.replace('<div class="pname">','<div class="pname"><span class="badge" style="background:rgba(34,197,94,.15);color:#86efac">neu</span> ');
  return h; }; }
/* Profil: Zeile für die laufende Saison */
function svSeasonProfile(pid){
  const M=document.getElementById('modal'); if(!M)return;
  const p=players.find(x=>x.id===pid); if(!p||!svCurOk(p))return;
  const c=p.cur, sl=M.querySelector('.statlist'); if(!sl||sl.querySelector('.sv-cur'))return;
  const row=document.createElement('div'); row.className='sv-cur';
  row.innerHTML=`<span>Saison ${svSeasonLabel()} <i style="font-size:11px;color:var(--ink3);font-style:normal">Stand ${new Date(c.stand).toLocaleDateString('de-DE')}</i></span><b>${c.tore} Tore · ${c.spiele} Sp.${c.rank?' · Platz '+c.rank+'/'+c.teamCount:''}</b>`;
  sl.insertBefore(row,sl.firstChild.nextSibling);
  if(c.wechsel){ const w=document.createElement('div'); w.className='sv-cur'; w.innerHTML=`<span>Neuer Verein</span><b>${svEsc(c.club)}</b>`; sl.insertBefore(w,row.nextSibling); }
}
{ const _om1=openModal; openModal=function(){ const r=_om1.apply(this,arguments); try{svSeasonProfile(arguments[0]);}catch(e){} return r; }; }

/* ---------- Datenstand & Update (Admin) ---------- */
function svFmtDate(s){ try{ return new Date(s).toLocaleDateString('de-DE',{day:'2-digit',month:'2-digit',year:'numeric'}); }catch(e){ return s||''; } }
async function svDataCard(P){
  if(!P||!canManage())return;
  let rows=[]; try{ const {data}=await SVB.sb.from('data_updates').select('at,ok,source,version,summary').order('at',{ascending:false}).limit(6); rows=data||[]; }catch(e){}
  const last=rows.find(r=>r.ok), lastSt=last&&last.summary||{};
  const el=document.createElement('div'); el.className='card'; el.id='svData';
  const lg=(lastSt.leagues||[]).map(l=>`<tr><td>${svEsc(l.name)}</td><td class="num">${l.spieltag}</td><td class="num">${l.teams}</td><td class="num">${l.scorers}</td><td class="num">${l.added}</td></tr>`).join('');
  el.innerHTML=`<div class="adm-head"><div><h3 style="margin:0;display:flex;gap:8px;align-items:center">${SVI('refresh')} Datenstand</h3>
      <p style="margin:6px 0 0;font-size:13.5px">Tore, Spiele und Tabellen aller 7 Ligen kommen automatisch von FUSSBALL.DE · <b>jeden Montag und Donnerstag um 6 Uhr</b>. Die Bewertungen rechnen die laufende Saison 26/27 mit der Vorsaison zusammen.</p></div>
      <button class="btn" id="svDataGo">${SVI('refresh')} Jetzt aktualisieren</button></div>
    <div class="adm-stats" style="margin-bottom:12px"><div class="adm-stat"><b>${svEsc(svFmtDate((DATA&&DATA.updated)||last&&last.at))}</b><span>Stand der Daten</span></div>
      ${last?`<div class="adm-stat"><b>${lastSt.matched||0}</b><span>Torschützen zugeordnet</span></div><div class="adm-stat"><b>${lastSt.added||0}</b><span>neu im Radar</span></div><div class="adm-stat"><b>${lastSt.transfers||0}</b><span>Vereinswechsel erkannt</span></div>`:''}</div>
    ${lg?`<div class="dbwrap" style="max-height:none"><table class="db" style="min-width:0"><thead><tr><th>Liga</th><th class="num">Spieltag</th><th class="num">Teams</th><th class="num">Torschützen</th><th class="num">neu</th></tr></thead><tbody>${lg}</tbody></table></div>`:''}
    <p class="note" id="svDataMsg">${rows.length?'Letzte Läufe: '+rows.slice(0,4).map(r=>(r.ok?'✓ ':'⚠ ')+new Date(r.at).toLocaleString('de-DE',{day:'2-digit',month:'2-digit',hour:'2-digit',minute:'2-digit'})+' ('+svEsc(r.source||'')+')').join(' · '):'Noch kein automatischer Lauf.'}</p>`;
  const old=P.querySelector('#svData'); if(old)old.replaceWith(el); else P.appendChild(el);
  el.querySelector('#svDataGo').onclick=async()=>{
    const b=el.querySelector('#svDataGo'), m=el.querySelector('#svDataMsg'); b.disabled=true; b.textContent='Lädt von FUSSBALL.DE …';
    try{ const {data,error}=await SVB.sb.functions.invoke('data-update',{body:{}}); if(error){ let t=error.message; try{ const j=await error.context.json(); if(j&&j.error)t=j.error; }catch(_){} throw new Error(t); }
      m.innerHTML='✓ Aktualisiert: '+(data.stats.matched||0)+' Torschützen, '+(data.stats.added||0)+' neu. <b>Die App lädt die neuen Daten jetzt …</b>'; setTimeout(()=>{ try{appReload();}catch(e){location.reload();} },1800); }
    catch(e){ b.disabled=false; b.innerHTML=SVI('refresh')+' Jetzt aktualisieren'; m.textContent='⚠ '+e.message; }
  };
}
{ const _ar0=svAdminRender; svAdminRender=async function(){ const r=await _ar0.apply(this,arguments); try{ await svDataCard(document.getElementById('panel-admin')); }catch(e){} return r; }; }

/* =====================================================================
   SV/BSC Scout · Runde 5
   - Positionen & Spielerdaten fürs ganze Team (auch Trainer), statt nur auf einem Gerät
   - „Meine Kandidaten“: wer bin ich in der Spalte „Verantwortlich“?
   - Erinnerungs-Intervall je Kandidat, Erinnerungskarte auf der Übersicht, App-Symbol-Zähler
   - Push-Erinnerungen aufs Handy (Web Push)
   ===================================================================== */
Object.assign(SV_FIELD,{ps:'Position',ps2:'Nebenposition',ph:'Position',gb:'Geburtsdatum',al:'Alter',fu:'Starker Fuß',gr:'Größe',sc:'Eye-Test',ri:'Erinnerung'});

/* ---------- Wer bin ich in der Spalte „Verantwortlich“? (gleiche Regeln wie der Erinnerungs-Dienst) ---------- */
const SV_ALIAS={dome:['dominik','dome'],nico:['nico','nicolas','nicola'],ervin:['ervin','erwin'],tobi:['tobias','tobi'],lukas:['lukas','luke']};
const SV_PLANNERS=(((window.VEREIN||{}).personen||{}).planer||[]).slice();   // Kaderplaner des Vereins (verein/<id>.json)
let SV_TEAM=[];
function svK(s){ return String(s||'').toLowerCase().replace(/ä/g,'ae').replace(/ö/g,'oe').replace(/ü/g,'ue').replace(/ß/g,'ss').normalize('NFD').replace(/[\u0300-\u036f]/g,'').replace(/[^a-z0-9]/g,''); }
function svKeysOf(u){ if(u&&u.pl_name)return [svK(u.pl_name)]; const nm=String((u&&u.name)||'').trim(), first=svK(nm.split(/\s+/)[0]), full=svK(nm);
  const k=new Set([full,first].filter(Boolean)); for(const a in SV_ALIAS) if(first&&SV_ALIAS[a].includes(first))k.add(a); return [...k]; }
function svPlOf(u,pl){ const p=svK(pl); if(!p)return false; if(svKeysOf(u).includes(p))return true; if(u&&u.pl_name)return false;
  const first=svK(String((u&&u.name)||'').trim().split(/\s+/)[0]); return p.length>=4&&first.length>p.length&&first.startsWith(p); }
function svIsMine(pl){ return svPlOf(SVU,pl); }
function kandPlanners(){
  const m=new Map(); const add=n=>{ n=String(n||'').trim(); const k=svK(n); if(k&&!m.has(k))m.set(k,n); };
  SV_PLANNERS.forEach(add); try{ PLANNERS_DEFAULT.forEach(add); metaPlanners().forEach(add); }catch(e){}
  SV_TEAM.forEach(u=>{ if(u.pl_name)add(u.pl_name); });
  try{ kandList().forEach(p=>add(crmOf(p).pl)); }catch(e){}
  if(canEdit()&&![...m.values()].some(svIsMine))add(SVU.pl_name||svFirst(SVU.name));
  return [...m.values()];
}
function svMyPlName(){ return kandPlanners().find(svIsMine)||SVU.pl_name||svFirst(SVU.name)||''; }
function svPlOpts(html){ const me='<option value="__me"'+(kandFP==='__me'?' selected':'')+'>Meine Kandidaten</option>'; const i=html.indexOf('</option>'); return i<0?me+html:html.slice(0,i+9)+me+html.slice(i+9); }

/* ---------- Erinnerungs-Intervall je Kandidat ---------- */
const SV_IV=[7,14,21,30,45,60];
function kandIv(p){ const v=+crmOf(p).ri; return v>=3&&v<=120?v:KAND_DUE_DAYS; }
function kandIsDue(p){ const ds=daysSince(crmOf(p).lc); return ds===null||ds>kandIv(p); }
function kandIvSel(p,C){
  return '<select class="kand-in kiv" data-kf="ri" data-id="'+p.id+'" title="Erinnern, wenn der letzte Kontakt länger her ist als …">'
    +'<option value="">⏰ nach '+KAND_DUE_DAYS+' T (Standard)</option>'
    +SV_IV.filter(n=>n!==KAND_DUE_DAYS).map(n=>'<option value="'+n+'"'+(+C.ri===n?' selected':'')+'>⏰ nach '+n+' Tagen</option>').join('')+'</select>';
}
function svMyCands(){ try{ return kandList().filter(p=>svIsMine(crmOf(p).pl)); }catch(e){ return []; } }
function svMyDue(){ return svMyCands().filter(kandIsDue); }
function svBadges(){
  try{
    const all=kandList(), mine=svMyCands(), myDue=mine.filter(kandIsDue).length, due=all.filter(kandIsDue).length;
    const n=mine.length?myDue:due;
    document.querySelectorAll('[data-cnt="kandidaten"]').forEach(el=>{ el.textContent=n; el.style.display=n&&!svGast()?'':'none'; el.title=mine.length?'deine fälligen Kontakte':'fällige Kontakte'; });
    if('setAppBadge' in navigator){ if(myDue)navigator.setAppBadge(myDue).catch(()=>{}); else navigator.clearAppBadge().catch(()=>{}); }
  }catch(e){}
}

/* ---------- Erinnerungskarte auf der Übersicht ---------- */
function svRemindRender(){
  const host=document.getElementById('svHello'); if(!host)return;
  let el=document.getElementById('svRemind'); if(!el){ el=document.createElement('div'); el.id='svRemind'; host.after(el); }
  if(svGast()){ el.innerHTML=''; return; }
  const mine=svMyCands(); if(!mine.length){ el.innerHTML=''; return; }
  const due=mine.filter(kandIsDue).sort((a,b)=>(daysSince(crmOf(b).lc)??1e9)-(daysSince(crmOf(a).lc)??1e9)||(crmOf(b).w||0)-(crmOf(a).w||0));
  const row=p=>{ const C=crmOf(p), ds=daysSince(C.lc), v=canContacts()?kandContactPlain(p):'', ph=v?kandPhone(v):null;
    const w=C.w&&WPROB[C.w]?' · Wechsel <b style="color:'+WPROB[C.w].c+'">'+WPROB[C.w].t+'</b>':'';
    return `<div class="rm-row">${avaHtml(p)}<div class="rm-n"><b data-svp="${svEsc(p.id)}">${svEsc(p.name)}</b><span>${svEsc(p.club||'')} · <em>${ds===null?'noch nie kontaktiert':'letzter Kontakt vor '+ds+' Tagen'}</em>${w}</span></div>
      <div class="rm-a">${ph?`<a class="iconbtn" href="tel:${svEsc(ph.tel)}" title="Anrufen">${SVI('phone')}</a><a class="iconbtn" href="https://wa.me/${svEsc(ph.wa)}" target="_blank" rel="noopener" title="WhatsApp">${SVI('chat')}</a>`:''}
      ${canEdit()?`<button class="btn sm" data-done="${svEsc(p.id)}">${SVI('check')} Kontakt heute</button>`:''}</div></div>`; };
  el.innerHTML=`<div class="card remind${due.length?' hot':''}">
    <div class="rm-h"><div class="rm-ic">${SVI(due.length?'bell':'check')}</div>
      <div class="rm-t"><h3>${due.length?(due.length===1?'1 Kontakt ist fällig':due.length+' Kontakte sind fällig'):'Alle deine Kontakte sind im Plan'}</h3>
      <p>Deine Kandidaten als „${svEsc(svMyPlName())}“ · ${mine.length} in der Pipeline</p></div>
      <span class="rm-push" id="svPushHome"></span></div>
    ${due.slice(0,5).map(row).join('')}
    ${due.length>5?`<p class="rm-more">… und ${due.length-5} weitere</p>`:''}
    <div class="rm-f"><button class="btn ghost" data-go-me>Meine Kandidaten öffnen →</button></div></div>`;
  el.querySelectorAll('[data-svp]').forEach(a=>a.onclick=()=>openModal(a.dataset.svp));
  el.querySelectorAll('[data-done]').forEach(b=>b.onclick=()=>{ const p=players.find(x=>x.id===b.dataset.done); crmSet(b.dataset.done,{lc:todayISO(),c:1}); kToast('✓ Kontakt mit '+(p?p.name:'Spieler')+' eingetragen'); svAfterKand(); });
  el.querySelector('[data-go-me]').onclick=()=>{ kandFP='__me'; kandDue=false; goTab('kandidaten'); try{renderKandidaten();}catch(e){} };
  svPushChip(document.getElementById('svPushHome'));
}
function svAfterKand(){ try{renderKandidaten();}catch(e){} svRemindRender(); try{svTiles();}catch(e){} svBadges(); }

/* ---------- Push-Erinnerungen ---------- */
function svPushSupported(){ return 'serviceWorker' in navigator&&'PushManager' in window&&'Notification' in window; }
function svIsIOS(){ return /iPad|iPhone|iPod/.test(navigator.userAgent)||(navigator.platform==='MacIntel'&&navigator.maxTouchPoints>1); }
function svStandalone(){ try{ return navigator.standalone===true||matchMedia('(display-mode: standalone)').matches; }catch(e){ return false; } }
function svB64ToU8(s){ s=s.replace(/-/g,'+').replace(/_/g,'/'); s+='='.repeat((4-s.length%4)%4); const b=atob(s), u=new Uint8Array(b.length); for(let i=0;i<b.length;i++)u[i]=b.charCodeAt(i); return u; }
function svU8ToB64(u){ let s=''; new Uint8Array(u).forEach(c=>s+=String.fromCharCode(c)); return btoa(s).replace(/\+/g,'-').replace(/\//g,'_').replace(/=+$/,''); }
function svDeviceName(){ const u=navigator.userAgent; const d=/iPhone/.test(u)?'iPhone':/iPad/.test(u)||svIsIOS()&&/Mac/.test(u)?'iPad':/Android/.test(u)?'Android':/Mac/.test(u)?'Mac':/Windows/.test(u)?'Windows':'Gerät';
  const b=/Edg\//.test(u)?'Edge':/Firefox\//.test(u)?'Firefox':/Chrome\//.test(u)?'Chrome':/Safari\//.test(u)?'Safari':''; return (d+(b?' · '+b:'')).slice(0,60); }
async function svPushState(){
  if(svIsIOS()&&!svStandalone())return 'ios-install';
  if(!svPushSupported())return 'unsupported';
  if(Notification.permission==='denied')return 'denied';
  try{ const reg=await navigator.serviceWorker.getRegistration(); const sub=reg&&await reg.pushManager.getSubscription(); if(!sub)return 'off';
    const {data}=await SVB.sb.from('push_subs').select('endpoint').eq('endpoint',sub.endpoint).maybeSingle(); return data?'on':'off'; }catch(e){ return 'off'; }
}
async function svPushTest(){
  const {data,error}=await SVB.sb.functions.invoke('reminders',{body:{action:'test'}});
  if(error)throw new Error('Test-Mitteilung ging nicht raus');
  if(data&&data.ok===false)throw new Error(data.error||'Test-Mitteilung ging nicht raus');
  return data;
}
async function svPushOn(){
  const st=await svPushState();
  if(st==='ios-install'){ svPushHelp('ios'); return false; }
  if(st==='unsupported'){ kToast('Dieser Browser kann leider keine Mitteilungen empfangen.'); return false; }
  if(st==='denied'){ svPushHelp('denied'); return false; }
  const perm=await Notification.requestPermission();
  if(perm!=='granted'){ svPushHelp('denied'); return false; }
  const {data:pub,error:e1}=await SVB.sb.rpc('push_public_key'); if(e1||!pub)throw new Error('Erinnerungen sind noch nicht eingerichtet');
  const reg=await navigator.serviceWorker.ready;
  let sub=await reg.pushManager.getSubscription();
  if(sub){ try{ const k=sub.options&&sub.options.applicationServerKey; if(k&&svU8ToB64(k)!==pub){ await sub.unsubscribe(); sub=null; } }catch(e){} }
  if(!sub)sub=await reg.pushManager.subscribe({userVisibleOnly:true,applicationServerKey:svB64ToU8(pub)});
  const j=sub.toJSON();
  const {error}=await SVB.sb.rpc('push_sub',{p_endpoint:j.endpoint,p_p256dh:j.keys.p256dh,p_auth:j.keys.auth,p_ua:svDeviceName()});
  if(error){ try{await sub.unsubscribe();}catch(e){} throw new Error(/check/.test(error.message||'')?'Dieser Browser nutzt einen unbekannten Mitteilungsdienst':'Anmelden fehlgeschlagen'); }
  try{ await svPushTest(); kToast('🔔 Erinnerungen sind an. Gleich kommt eine Test-Mitteilung'); }catch(e){ kToast('🔔 Erinnerungen sind an'); }
  return true;
}
async function svPushOff(){
  try{ const reg=await navigator.serviceWorker.getRegistration(); const sub=reg&&await reg.pushManager.getSubscription();
    if(sub){ await SVB.sb.rpc('push_unsub',{p_endpoint:sub.endpoint}); await sub.unsubscribe(); } }catch(e){}
  kToast('🔕 Erinnerungen auf diesem Gerät ausgeschaltet');
}
function svPushHelp(kind){
  const ios=`<ol class="svsteps"><li>Unten in Safari auf <b>Teilen</b> tippen (Quadrat mit Pfeil).</li><li><b>„Zum Home-Bildschirm“</b> wählen und bestätigen.</li><li>Die App <b>vom Home-Bildschirm</b> öffnen und hier nochmal auf „Erinnerungen aufs Handy“ tippen.</li></ol><p class="note">Apple erlaubt Mitteilungen nur für Apps auf dem Home-Bildschirm (ab iOS 16.4).</p>`;
  const den=`<p>Mitteilungen sind für diese App gerade <b>blockiert</b>.</p><ol class="svsteps"><li><b>iPhone:</b> Einstellungen → Mitteilungen → Sportzentrale → Mitteilungen erlauben.</li><li><b>Android/Chrome:</b> Schloss-Symbol neben der Adresse bzw. App-Info → Benachrichtigungen → erlauben.</li><li>Danach hier nochmal einschalten.</li></ol>`;
  svModal(`<div class="mhead" style="gap:14px"><div class="rm-ic" style="width:48px;height:48px">${SVI('bell')}</div><div><h2 style="margin:0">Erinnerungen aufs Handy</h2><div class="msub">${kind==='ios'?'So geht’s auf dem iPhone':'Mitteilungen erlauben'}</div></div></div><div style="margin-top:16px">${kind==='ios'?ios:den}</div>`);
}
async function svPushChip(host,big){
  if(!host)return; if(!canEdit()&&!svMyCands().length){ host.innerHTML=''; return; }
  const st=await svPushState(); if(st==='unsupported'){ host.innerHTML=''; return; }
  if(st==='on'){ host.innerHTML=big?'':`<span class="pushchip on" title="Du bekommst Erinnerungen auf dieses Gerät">${SVI('bell')} Erinnerungen an</span>`; if(!big)return; }
  const lbl=st==='denied'?'Mitteilungen blockiert':'Erinnerungen aufs Handy';
  if(big){
    host.innerHTML=st==='on'?`<div class="pushrow"><span class="pushchip on">${SVI('bell')} Auf diesem Gerät an</span><button class="btn ghost sm" data-ptest>Test senden</button><button class="btn ghost sm" data-poff>Ausschalten</button></div>`
      :`<div class="pushrow"><button class="btn sm" data-pon>${SVI('bell')} ${lbl}</button></div>`;
    host.insertAdjacentHTML('beforeend','<p class="note">Du bekommst eine Mitteilung, sobald bei einem deiner Kandidaten der letzte Kontakt zu lange her ist, und montags eine kurze Übersicht. Jedes Gerät einzeln einschalten.</p>');
  } else host.innerHTML=`<button class="pushchip" data-pon>${SVI('bell')} ${lbl}</button>`;
  const on=host.querySelector('[data-pon]'); if(on)on.onclick=async()=>{ on.disabled=true; try{ await svPushOn(); }catch(e){ kToast('⚠️ '+e.message); } on.disabled=false; svPushChip(host,big); svPushRefreshAll(host); };
  const te=host.querySelector('[data-ptest]'); if(te)te.onclick=async()=>{ te.disabled=true; try{ const r=await svPushTest(); kToast('📨 Test verschickt'+(r&&r.devices>1?' an '+r.devices+' Geräte':'')); }catch(e){ kToast('⚠️ '+e.message); } te.disabled=false; };
  const of=host.querySelector('[data-poff]'); if(of)of.onclick=async()=>{ await svPushOff(); svPushChip(host,big); svPushRefreshAll(host); };
}
function svPushRefreshAll(except){ ['svPushHome','svPushKand'].forEach(id=>{ const h=document.getElementById(id); if(h&&h!==except)svPushChip(h); }); }

/* ---------- Kandidaten-Ansicht: Push-Schalter + Hinweis bei „Meine“ ---------- */
{ const _rk2=renderKandidaten; renderKandidaten=function(){
    const r=_rk2.apply(this,arguments);
    const db=document.getElementById('kDigBtn');
    if(db&&!document.getElementById('svPushKand')){ const s=document.createElement('span'); s.id='svPushKand'; db.after(s); svPushChip(s); }
    if(kandFP==='__me'){ const w=document.getElementById('kandWrap'), empty=w&&w.querySelector('.card:last-child');
      if(empty&&!w.querySelector('.kand-table')&&!svMyCands().length)empty.innerHTML='Dir sind noch keine Kandidaten zugeordnet. In der Spalte <b>„Verantwortlich“</b> einfach <b>'+svEsc(svMyPlName())+'</b> auswählen.'; }
    try{svRemindRender();}catch(e){}
    return r; }; }

/* ---------- Positionen & Spielerdaten: fürs ganze Team statt nur auf diesem Gerät ---------- */
const SV_PD_KEYS=['ps','ps2','ph','gb','al','fu','gr','sc'], SV_SC_KEYS=['tempo','technik','zweikampf','spielint','mentalitaet'];
function svAge(geb){ const d=new Date(geb); if(isNaN(d))return null; return Math.floor((Date.now()-d)/31557600000); }
function svApplyPlayerData(){
  players.forEach(p=>{
    const C=CRM[p.id], has=C&&SV_PD_KEYS.some(k=>C[k]!=null);
    if(!has&&!p._o)return;
    if(!p._o)p._o={pos:p.pos,pos2:p.pos2,geb:p.geb,alter:p.alter,alterCa:p.alterCa,fuss:p.fuss,groesse:p.groesse,scout:{...(p.scout||{})},scouted:p.scouted};
    const O=p._o, X=C||{};
    p.pos=(X.ps&&POS_W[X.ps])?X.ps:O.pos;
    p.pos2=X.ps2!=null?String(X.ps2).split(',').filter(x=>POS_W[x]&&x!==p.pos):O.pos2;
    p.posAlt=(X.ph&&POS_W[X.ph]&&X.ph!==p.pos)?X.ph:null;
    if(typeof X.gb==='string'&&/^\d{4}-\d{2}-\d{2}$/.test(X.gb)){ p.geb=X.gb; p.alter=svAge(X.gb); p.alterCa=false; }
    else if(+X.al>=14&&+X.al<=50){ p.geb=O.geb; p.alter=+X.al; p.alterCa=false; }
    else { p.geb=O.geb; p.alter=O.alter; p.alterCa=O.alterCa; }
    p.fuss=['Rechts','Links','Beidfüßig'].includes(X.fu)?X.fu:O.fuss;
    p.groesse=(+X.gr>=140&&+X.gr<=215)?+X.gr:O.groesse;
    const sc=typeof X.sc==='string'?X.sc.split(',').map(Number):null;
    if(sc&&sc.length===5&&sc.every(v=>v>=1&&v<=10)){ p.scout={...(p.scout||{})}; SV_SC_KEYS.forEach((k,i)=>{ p.scout[k]=sc[i]; }); p.scouted=true; }
    else { p.scout={...O.scout}; p.scouted=O.scouted; }
  });
}
{ const _ca=crmApply; crmApply=function(){ const r=_ca.apply(this,arguments); try{svApplyPlayerData();}catch(e){ console.warn('Spielerdaten',e); } return r; }; }
function svCanPD(){ return canWriteField('ps'); }
function svPosLine(pid){
  const M=document.getElementById('modal'); const p=players.find(x=>x.id===pid); if(!M||!p)return;
  const sub=M.querySelector('.mhead .msub'); if(!sub||M.querySelector('.svpos'))return;
  const alt=(p.pos2||[]).filter(x=>x!==p.pos);
  const el=document.createElement('div'); el.className='svpos';
  el.innerHTML=`<span class="pp" title="Position">${SVI('move')}<b>${svEsc(p.pos||'–')}</b></span>${alt.length?`<span class="pa">kann auch ${svEsc(alt.join(', '))}</span>`:''}${p.posAlt?`<span class="pa">früher ${svEsc(p.posAlt)}</span>`:''}${svCanPD()?'<button class="svpos-ed" type="button">Position ändern</button>':''}`;
  sub.after(el);
  const b=el.querySelector('.svpos-ed'); if(b)b.onclick=()=>svPosEditor(p,el);
}
function svPosEditor(p,host){
  const keys=Object.keys(POS_W), cur=p.pos; let sel=cur; const alt=new Set((p.pos2||[]).filter(x=>x!==cur));
  const M=document.getElementById('modal'), old=M.querySelector('.svpos-box'); if(old){ old.remove(); return; }
  const box=document.createElement('div'); box.className='svpos-box'; (M.querySelector('.mhead')||host).after(box);
  setTimeout(()=>{ try{ box.scrollIntoView({behavior:'smooth',block:'nearest'}); }catch(e){} },30);
  const draw=()=>{
    box.innerHTML=`<div class="lbl">Position von ${svEsc(svFirst(p.name))} · Hauptposition</div><div class="chips">${keys.map(k=>`<button type="button" class="pchip${k===sel?' on':''}" data-m="${k}">${k}</button>`).join('')}</div>
      <div class="lbl">Kann auch spielen</div><div class="chips">${keys.filter(k=>k!==sel).map(k=>`<button type="button" class="pchip alt${alt.has(k)?' on':''}" data-a="${k}">${k}</button>`).join('')}</div>
      ${sel!==cur?`<div class="hint">${SVI('info')}<span>Neu: <b>${svEsc(cur||'–')} → ${svEsc(sel)}</b>. Die alte Position bleibt als „früher ${svEsc(cur||'–')}“ sichtbar.</span></div>`:''}
      <div class="btnrow"><button type="button" class="btn" data-save>Für alle speichern</button><button type="button" class="btn ghost" data-cancel>Abbrechen</button></div>`;
    box.querySelectorAll('[data-m]').forEach(b=>b.onclick=()=>{ sel=b.dataset.m; alt.delete(sel); draw(); });
    box.querySelectorAll('[data-a]').forEach(b=>b.onclick=()=>{ const k=b.dataset.a; if(alt.has(k))alt.delete(k); else alt.add(k); draw(); });
    box.querySelector('[data-cancel]').onclick=()=>box.remove();
    box.querySelector('[data-save]').onclick=()=>svSavePos(p,sel,[...alt]);
  };
  draw();
}
function svSavePos(p,sel,alt){
  const upd={}, before=p.pos;
  const a=keysSorted(alt.filter(k=>k!==sel)).join(',')||'-';
  const curA=keysSorted((p.pos2||[]).filter(x=>x!==p.pos)).join(',')||'-';
  if(sel!==p.pos){ upd.ps=sel; upd.ph=p.pos||undefined; }
  if(a!==curA||upd.ps)upd.ps2=a;
  if(!Object.keys(upd).length){ kToast('Keine Änderung'); return; }
  crmSet(p.id,upd); try{crmApply();}catch(e){}
  try{renderAll();}catch(e){} openModal(p.id);
  kToast(upd.ps?'✓ '+p.name+': '+(before||'–')+' → '+sel+' · für alle gespeichert':'✓ Nebenpositionen gespeichert');
}
function keysSorted(arr){ const o=Object.keys(POS_W); return arr.slice().sort((x,y)=>o.indexOf(x)-o.indexOf(y)); }
function svHookSave(pid){
  const p=players.find(x=>x.id===pid), b=document.getElementById('saveP'); if(!p||!b||!svCanPD()||b.dataset.sv)return; b.dataset.sv='1';
  const snap={pos:p.pos,geb:p.geb||null,alter:p.alter??null,fuss:p.fuss||null,groesse:p.groesse??null,sc:SV_SC_KEYS.map(k=>(p.scout||{})[k]).join(',')};
  b.addEventListener('click',()=>{
    const u={};
    if(p.pos!==snap.pos){ u.ps=p.pos; u.ph=snap.pos||undefined; }
    if((p.geb||null)!==snap.geb){ u.gb=p.geb||undefined; if(!p.geb)u.al=p.alter||undefined; }
    else if(!p.geb&&(p.alter??null)!==snap.alter)u.al=p.alter||undefined;
    if((p.fuss||null)!==snap.fuss)u.fu=p.fuss||undefined;
    if((p.groesse??null)!==snap.groesse)u.gr=p.groesse||undefined;
    const sc=SV_SC_KEYS.map(k=>(p.scout||{})[k]).join(','); if(sc!==snap.sc)u.sc=sc;
    if(Object.keys(u).length){ crmSet(p.id,u); try{crmApply();}catch(e){} try{renderAll();}catch(e){} kToast('✓ Für das ganze Team gespeichert'); }
  });
  const sec=b.closest('.editsec'); const h=sec&&sec.querySelector('h4');
  if(h&&!sec.querySelector('.sv-shared'))h.insertAdjacentHTML('afterend','<p class="note sv-shared" style="margin:-4px 0 10px">Position, Geburtsdatum, Fuß, Größe und Eye-Test sieht nach dem Speichern das ganze Team. Foto, Status, Einsätze und Assists bleiben auf diesem Gerät.</p>');
}
{ const _om2=openModal; openModal=function(){ const r=_om2.apply(this,arguments); try{ svPosLine(arguments[0]); svHookSave(arguments[0]); }catch(e){ console.warn(e); } return r; }; }

/* ---------- Mein Konto: Zuordnung + Erinnerungen ---------- */
{ const _acc=svAccount; svAccount=function(){
    const r=_acc.apply(this,arguments);
    const M=document.getElementById('modal'), app=M&&[...M.querySelectorAll('.editsec')].pop(); if(!app||svGast())return r;
    const auto=kandPlanners().find(n=>svPlOf({name:SVU.name},n));
    const sec=document.createElement('div'); sec.className='editsec';
    sec.innerHTML=`<h4>Kandidaten &amp; Erinnerungen</h4>
      <div class="field"><label for="svMyPl">In der Spalte „Verantwortlich“ bin ich</label><select id="svMyPl"><option value="">Automatisch${auto?' · '+svEsc(auto):''}</option>${kandPlanners().map(n=>`<option${SVU.pl_name===n?' selected':''}>${svEsc(n)}</option>`).join('')}</select></div>
      <div id="svPushAcc" style="margin-top:12px"></div>`;
    app.before(sec);
    document.getElementById('svMyPl').onchange=async e=>{
      const v=e.target.value;
      try{ const {error}=await SVB.sb.rpc('me_update',{p_name:null,p_pw_set:null,p_pl:v}); if(error)throw error;
        SVU.pl_name=v||null; try{ const c=JSON.parse(localStorage.getItem('svbcProfile')||'null'); if(c){ c.pl_name=SVU.pl_name; localStorage.setItem('svbcProfile',JSON.stringify(c)); } }catch(x){}
        kToast('✓ Gespeichert: „Meine Kandidaten“ zeigt jetzt '+(v||auto||'deine')); svAfterKand(); }
      catch(err){ kToast('⚠️ '+(err.message||err)); }
    };
    svPushChip(document.getElementById('svPushAcc'),true);
    return r; }; }

/* ---------- Start ---------- */
async function svTeamLoad(){ try{ const {data}=await SVB.sb.rpc('team_names'); if(Array.isArray(data)){ SV_TEAM=data; const me=data.find(u=>u.id===SVU.id); if(me&&me.pl_name!==undefined)SVU.pl_name=me.pl_name; } }catch(e){} }
{ const _si=svInit; svInit=function(){
    const r=_si.apply(this,arguments);
    try{svApplyPlayerData();}catch(e){}
    if(!document.getElementById('kRoleList'))document.body.insertAdjacentHTML('beforeend','<datalist id="kRoleList"><option value="Stammspieler"><option value="Führungsspieler"><option value="Rotation"><option value="Backup"><option value="Perspektivspieler"><option value="Torjäger"><option value="Ersatz-TW"><option value="Zweite Mannschaft"></datalist>');
    if(navigator.serviceWorker)navigator.serviceWorker.addEventListener('message',e=>{ const t=e.data&&e.data.svbcGo; if(typeof t==='string'&&/^[a-z]+$/.test(t)){ if(t==='kandidaten'&&svMyCands().length)kandFP='__me'; goTab(t); } });
    { const _rh2=renderHome; renderHome=function(){ const x=_rh2.apply(this,arguments); try{svRemindRender();}catch(e){} return x; }; }
    svRemindRender(); svBadges();
    svTeamLoad().then(()=>{ svRemindRender(); svBadges(); if(document.querySelector('#panel-kandidaten.active'))try{renderKandidaten();}catch(e){} });
    if(/(^|&)kandidaten/.test((location.hash||'').slice(1))&&svMyCands().length){ kandFP='__me'; try{renderKandidaten();}catch(e){} }
    return r; }; }

/* =====================================================================
   SV/BSC Scout · Runde 6: Spielerbogen wie in EA FC
   - Spielerrolle je Position, Special Skills (mit „+“ für herausragend), starker & schwacher Fuß
   - Charakter & Training (1–5), Charakter-Tags, Stärken/Schwächen
   - Spielerkarte im Profil, Positions-Check + Auto-Sortieren in der Aufstellung
   - Kader-Profil: Was haben wir, was fehlt, und Suche nach Rollen/Skills/Fuß
   ===================================================================== */
Object.assign(SV_FIELD,{wf:'Schwacher Fuß',rol:'Spielerrolle',sk:'Special Skills',ch:'Charakter & Training',tg:'Charakter-Tags',sts:'Stärken',sws:'Schwächen'});
Object.assign(SV_TRAINER_FIELDS,{wf:1,rol:1,sk:1,ch:1,tg:1,sts:1,sws:1});

/* ---------- Kataloge (angelehnt an EA SPORTS FC: PlayStyles & Player Roles) ---------- */
const SB_IC={
  abschluss:'<circle cx="12" cy="12" r="8"/><circle cx="12" cy="12" r="4"/><circle cx="12" cy="12" r=".6" fill="currentColor"/>',
  wucht:'<path d="M3 12h9"/><path d="m9 8 4 4-4 4"/><path d="M16 5l2 3 3-1-1 3 2 2-3 1v3l-3-1-2 2"/>',
  kopfball:'<circle cx="10" cy="9" r="4"/><path d="M5 21v-2a5 5 0 0 1 10 0v2"/><circle cx="18" cy="5" r="2.2"/>',
  standard:'<path d="M5 21V4"/><path d="M5 4h10l-2 3.5 2 3.5H5"/><circle cx="17" cy="18" r="2.5"/>',
  elfer:'<rect x="3" y="4" width="18" height="10" rx="1"/><circle cx="12" cy="19" r="2"/><path d="M12 14v3"/>',
  steilpass:'<path d="M4 20 20 4"/><path d="M13 4h7v7"/><path d="M4 12l3 3M10 18l-3-3"/>',
  flanke:'<path d="M4 20c2-10 9-15 16-15"/><path d="m16 3 4 2-2 4"/>',
  langball:'<path d="M3 18c4-12 14-12 18 0"/><path d="m18 14 3 4-5 1"/>',
  kurzpass:'<circle cx="5" cy="17" r="2"/><circle cx="12" cy="6" r="2"/><circle cx="19" cy="17" r="2"/><path d="M6.5 15 10.5 8M13.5 8l4 7M7 17h10"/>',
  dribbling:'<path d="M4 18c3 0 3-4 6-4s3 4 6 4 3-4 4-4"/><circle cx="12" cy="7" r="3"/>',
  tempo:'<path d="M13 2 4 14h7l-1 8 9-12h-7z"/>',
  erstkontakt:'<path d="M6 3v7a6 6 0 0 0 12 0V3"/><path d="M6 7h3M15 7h3"/>',
  pressresistent:'<path d="M12 3 4 6v6c0 4.5 3.4 8 8 9 4.6-1 8-4.5 8-9V6z"/><circle cx="12" cy="12" r="3"/>',
  zweikampf:'<path d="M12 3 4 6v6c0 4.5 3.4 8 8 9 4.6-1 8-4.5 8-9V6z"/><path d="m9 12 2 2 4-4"/>',
  antizipation:'<path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7S2 12 2 12z"/><circle cx="12" cy="12" r="3"/>',
  luftduell:'<path d="M12 21V9"/><path d="m7 13 5-5 5 5"/><path d="m7 7 5-5 5 5"/>',
  block:'<rect x="3" y="4" width="18" height="16" rx="1"/><path d="M3 9h18M3 15h18M9 4v5M15 9v6M9 15v5"/>',
  graetsche:'<path d="M3 17h14l4-4"/><circle cx="7" cy="9" r="3"/><path d="M10 11l5 3"/>',
  motor:'<path d="M3 12h4l2-5 4 10 2-5h6"/>',
  robust:'<path d="M12 21V3"/><circle cx="12" cy="5" r="2"/><path d="M5 12a7 7 0 0 0 14 0"/><path d="M3 12h4M17 12h4"/>',
  einwurf:'<path d="M7 20V9a3 3 0 0 1 6 0v11"/><circle cx="10" cy="4" r="2"/><path d="M13 12c3-4 6-5 8-5"/>',
  reflexe:'<path d="M8 13V5a2 2 0 0 1 4 0v6-8a2 2 0 0 1 4 0v8-5a2 2 0 0 1 4 0v8a8 8 0 0 1-16 0v-3a2 2 0 0 1 4 0"/>',
  strafraum:'<rect x="3" y="6" width="18" height="14" rx="1"/><path d="M7 20v-6h10v6"/><path d="M12 2v6"/>',
  fussarbeit:'<path d="M5 20c0-5 2-9 4-12 1-2 4-2 4 1 0 2-1 4 1 5 2 1 6 1 6 4 0 2-3 2-6 2z"/>',
  einsgegeneins:'<circle cx="7" cy="7" r="3"/><circle cx="17" cy="17" r="3"/><path d="M10 10l4 4"/>',
  abwurf:'<path d="M4 18c5-10 11-12 16-12"/><path d="M4 18h4"/><path d="m17 3 3 3-3 3"/>'
};
const SB_SKILLS=[
  {k:'abschluss',t:'Knipser',g:'Abschluss',fc:'Finesse Shot',d:'Eiskalt vor dem Tor, platziert sicher'},
  {k:'wucht',t:'Wuchtiger Schuss',g:'Abschluss',fc:'Power Shot',d:'Harter Schuss, auch aus der Distanz'},
  {k:'kopfball',t:'Kopfballstark',g:'Abschluss',fc:'Precision Header',d:'Trifft mit dem Kopf, stark bei Flanken'},
  {k:'standard',t:'Standardspezialist',g:'Abschluss',fc:'Dead Ball',d:'Freistöße und Ecken mit Qualität'},
  {k:'elfer',t:'Elfmeterschütze',g:'Abschluss',fc:'—',d:'Nervenstark vom Punkt'},
  {k:'steilpass',t:'Tödlicher Pass',g:'Passspiel',fc:'Incisive Pass',d:'Sieht und spielt den Pass in die Tiefe'},
  {k:'flanke',t:'Flankengott',g:'Passspiel',fc:'Whipped Pass',d:'Scharfe, präzise Flanken'},
  {k:'langball',t:'Spielverlagerung',g:'Passspiel',fc:'Long Ball Pass',d:'Lange Bälle kommen an'},
  {k:'kurzpass',t:'Ballsicher im Kurzpass',g:'Passspiel',fc:'Tiki Taka',d:'Verliert kaum einen Ball, hält das Spiel am Laufen'},
  {k:'dribbling',t:'Dribbler',g:'Ballkontrolle',fc:'Technical / Trickster',d:'Geht ins Eins-gegen-eins und kommt vorbei'},
  {k:'tempo',t:'Tempo',g:'Ballkontrolle',fc:'Rapid / Quick Step',d:'Antritt und Endgeschwindigkeit'},
  {k:'erstkontakt',t:'Erster Kontakt',g:'Ballkontrolle',fc:'First Touch',d:'Saubere Ballannahme auch unter Druck'},
  {k:'pressresistent',t:'Pressingresistent',g:'Ballkontrolle',fc:'Press Proven',d:'Behauptet den Ball gegen Druck'},
  {k:'zweikampf',t:'Zweikampfmonster',g:'Defensive',fc:'Bruiser / Anticipate',d:'Gewinnt die Duelle am Boden'},
  {k:'antizipation',t:'Antizipation',g:'Defensive',fc:'Intercept',d:'Liest das Spiel, fängt Bälle ab'},
  {k:'luftduell',t:'Lufthoheit',g:'Defensive',fc:'Aerial Fortress',d:'Gewinnt Kopfballduelle'},
  {k:'block',t:'Blockt alles',g:'Defensive',fc:'Block',d:'Wirft sich in jeden Schuss'},
  {k:'graetsche',t:'Grätsche',g:'Defensive',fc:'Slide Tackle',d:'Saubere Tacklings im richtigen Moment'},
  {k:'motor',t:'Laufmaschine',g:'Physis',fc:'Relentless',d:'Läuft 90 Minuten durch'},
  {k:'robust',t:'Robust',g:'Physis',fc:'Enforcer',d:'Körperlich präsent, schwer wegzuschieben'},
  {k:'einwurf',t:'Weiter Einwurf',g:'Physis',fc:'Long Throw',d:'Einwurf als Standard-Waffe'},
  {k:'reflexe',t:'Reflexe',g:'Torwart',fc:'Far Reach',d:'Hält die Unhaltbaren',tw:1},
  {k:'strafraum',t:'Strafraumbeherrschung',g:'Torwart',fc:'Cross Claimer',d:'Kommt raus, pflückt Flanken',tw:1},
  {k:'fussarbeit',t:'Mitspielender Torwart',g:'Torwart',fc:'Footwork',d:'Sicher mit dem Ball am Fuß',tw:1},
  {k:'einsgegeneins',t:'Stark im 1 gegen 1',g:'Torwart',fc:'Rush Out',d:'Verkürzt den Winkel, gewinnt Duelle',tw:1},
  {k:'abwurf',t:'Weiter Abwurf',g:'Torwart',fc:'Far Throw',d:'Schnelles Umschalten per Abwurf/Abstoß',tw:1}
];
const SB_SK={}; SB_SKILLS.forEach(s=>SB_SK[s.k]=s);
const SB_GROUPS=['Abschluss','Passspiel','Ballkontrolle','Defensive','Physis','Torwart'];
const SB_ROLES={
  TW:[{k:'tw-linie',t:'Linienkeeper',fc:'Goalkeeper',d:'Bleibt im Tor, stark auf der Linie'},{k:'tw-sweeper',t:'Mitspielender Keeper',fc:'Sweeper Keeper',d:'Verteidigt den Raum hinter der Kette'},{k:'tw-aufbau',t:'Spieleröffnender Keeper',fc:'Ball-Playing Keeper',d:'Rückt im Ballbesitz mit auf, eröffnet das Spiel'}],
  IV:[{k:'iv-klassisch',t:'Verteidiger',fc:'Defender',d:'Hält die Position, sichert ab'},{k:'iv-stopper',t:'Stopper',fc:'Stopper',d:'Rückt heraus, attackiert früh'},{k:'iv-spiel',t:'Spieleröffner',fc:'Ball-Playing Defender',d:'Eröffnet mit guten Pässen'},{k:'iv-halb',t:'Halbverteidiger',fc:'Wide Back',d:'Außen in der Dreierkette, schiebt mit auf'}],
  AV:[{k:'av-klassisch',t:'Außenverteidiger',fc:'Fullback',d:'Defensiv solide, wenig Vorwärtsdrang'},{k:'av-falsch',t:'Einrückender AV',fc:'Falseback',d:'Rückt im Aufbau ins Zentrum'},{k:'av-schiene',t:'Schienenspieler',fc:'Wingback',d:'Beackert die ganze Seite'},{k:'av-offensiv',t:'Offensiver Schienenspieler',fc:'Attacking Wingback',d:'Geht bis zur Grundlinie, flankt'},{k:'av-invers',t:'Inverser AV',fc:'Inverted Wingback',d:'Zieht nach innen ins Mittelfeld'}],
  ZM:[{k:'zm-sechser',t:'Abräumer (Sechser)',fc:'Holding',d:'Schützt die Abwehr, gewinnt Bälle'},{k:'zm-abkipp',t:'Abkippender Sechser',fc:'Centre-Half',d:'Lässt sich zwischen die IV fallen'},{k:'zm-tief',t:'Tiefer Spielmacher',fc:'Deep-Lying Playmaker',d:'Lenkt das Spiel von hinten'},{k:'zm-b2b',t:'Box-to-Box',fc:'Box-to-Box',d:'Von Strafraum zu Strafraum'},{k:'zm-crasher',t:'Strafraum-Crasher',fc:'Box Crasher',d:'Späte Läufe in den Strafraum, torgefährlich'},{k:'zm-halbraum',t:'Halbraumspieler',fc:'Half-Winger',d:'Zieht in den Halbraum, bindet Außen'}],
  OM:[{k:'om-spielmacher',t:'Spielmacher',fc:'Playmaker',d:'Kreativzentrale, letzter Pass'},{k:'om-zehn',t:'Klassische 10',fc:'Classic 10',d:'Zwischen den Linien, Technik und Übersicht'},{k:'om-schatten',t:'Hängende Spitze',fc:'Shadow Striker',d:'Geht mit in die Spitze, torgefährlich'},{k:'om-halbraum',t:'Halbraumspieler',fc:'Half-Winger',d:'Pendelt zwischen Zentrum und Flügel'}],
  'Flügel':[{k:'fl-winger',t:'Flügelspieler',fc:'Winger',d:'Tempo und Flanken an der Linie'},{k:'fl-breit',t:'Außenbahnspieler',fc:'Wide Midfielder',d:'Arbeitet auch nach hinten mit'},{k:'fl-spielmacher',t:'Flügel-Spielmacher',fc:'Wide Playmaker',d:'Kreativ von außen'},{k:'fl-invers',t:'Inverser Flügel',fc:'Inside Forward',d:'Zieht nach innen, schließt ab'}],
  ST:[{k:'st-knipser',t:'Knipser',fc:'Poacher',d:'Lauert im Strafraum, macht die Tore'},{k:'st-ziel',t:'Zielspieler',fc:'Target Forward',d:'Macht Bälle fest, stark im Kopfball'},{k:'st-tief',t:'Pressing-/Konterstürmer',fc:'Advanced Forward',d:'Läuft an, sprintet in die Tiefe'},{k:'st-falsch9',t:'Falsche 9',fc:'False 9',d:'Lässt sich fallen, verbindet das Spiel'}]
};
const SB_ROLE={}; Object.entries(SB_ROLES).forEach(([pos,arr])=>arr.forEach(r=>{ SB_ROLE[r.k]={...r,pos}; }));
const SB_CHAR=[{k:'fleiss',t:'Trainingsfleiß',s:'FLE'},{k:'lauf',t:'Laufstärke',s:'LAU'},{k:'team',t:'Teamgeist',s:'TEA'},{k:'zuv',t:'Zuverlässigkeit',s:'ZUV'},{k:'fuehr',t:'Führung',s:'FÜH'},{k:'ehrg',t:'Ehrgeiz',s:'EHR'}];
const SB_TAGS=[{k:'twm',t:'Trainingsweltmeister'},{k:'seele',t:'Kabinen-Seele'},{k:'leader',t:'Führungsspieler'},{k:'coach',t:'Coach auf dem Platz'},{k:'mental',t:'Mentalitätsmonster'},{k:'joker',t:'Joker'},{k:'allround',t:'Allrounder'},{k:'jung',t:'Entwicklungspotenzial'},
  {k:'verl',t:'Verletzungsanfällig',w:1},{k:'karten',t:'Kartengefährdet',w:1},{k:'muffel',t:'Trainingsmuffel',w:1},{k:'unzuv',t:'Unzuverlässig',w:1},{k:'hitz',t:'Hitzkopf',w:1}];
const SB_TG={}; SB_TAGS.forEach(t=>SB_TG[t.k]=t);
const SB_FOOT={Rechts:'R',Links:'L','Beidfüßig':'B'};

/* ---------- Daten lesen / schreiben ---------- */
function sbSk(v){ return String(v||'').split(',').map(x=>x.trim()).filter(Boolean).map(x=>({k:x.replace(/\+$/,''),plus:/\+$/.test(x)})).filter(x=>SB_SK[x.k]); }
function sbCh(v){ const a=String(v||'').split(',').map(Number), o={}; SB_CHAR.forEach((c,i)=>{ const n=a[i]; o[c.k]=n>=1&&n<=5?n:0; }); return o; }
function sbOf(p){ const C=crmOf(p);
  return { foot:p.fuss||null, wf:(+C.wf>=1&&+C.wf<=5)?+C.wf:0, rol:SB_ROLE[C.rol]?C.rol:'', sk:sbSk(C.sk), ch:sbCh(C.ch),
    tg:String(C.tg||'').split(',').filter(k=>SB_TG[k]), sts:String(C.sts||''), sws:String(C.sws||'') }; }
function sbHas(b){ return !!(b.rol||b.sk.length||b.wf||b.tg.length||b.sts||b.sws||Object.values(b.ch).some(Boolean)); }
function sbCanEdit(){ return canWriteField('sk'); }
function sbStars(n,max){ let s=''; for(let i=1;i<=(max||5);i++)s+=`<i class="${i<=n?'on':''}">★</i>`; return `<span class="sbstars">${s}</span>`; }
function sbHex(s,plus,size){ const S=SB_SK[s]; return `<span class="sbhex${plus?' plus':''}${size?' '+size:''}" title="${svEsc(S.t+(plus?'+ (herausragend)':'')+' · '+S.d)}"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">${SB_IC[s]||''}</svg>${plus?'<b>+</b>':''}</span>`; }
function sbFootChip(p){ const f=SB_FOOT[p.fuss]; return f?`<span class="sbfoot f-${f}" title="Starker Fuß: ${svEsc(p.fuss)}">${f}</span>`:''; }
function sbEye(p){ const s=p.scout||{}; const keys=['tempo','technik','zweikampf','spielint','mentalitaet']; const vals=keys.map(k=>+s[k]||5); return vals.every(v=>v===5)?null:vals; }

/* ---------- Spielerkarte im Profil ---------- */
function sbProfile(pid){
  const M=document.getElementById('modal'), p=players.find(x=>x.id===pid); if(!M||!p||M.querySelector('.sbwrap'))return;
  const anchor=M.querySelector('.svpos-box')||M.querySelector('.mhead'); if(!anchor)return;
  const b=sbOf(p), sc=scores(p), ov=Math.round(sc.total), R=SB_ROLE[b.rol], eye=sbEye(p), ed=sbCanEdit();
  const attrs=[['TEM',eye&&eye[0]*10],['TEC',eye&&eye[1]*10],['ZWK',eye&&eye[2]*10],['SPI',eye&&eye[3]*10],['MEN',eye&&eye[4]*10],['FLE',b.ch.fleiss?b.ch.fleiss*20:null],['LAU',b.ch.lauf?b.ch.lauf*20:null],['TEA',b.ch.team?b.ch.team*20:null]].filter(a=>a[1]).map(([k,v])=>[k,Math.min(99,v)]).slice(0,6);
  const el=document.createElement('div'); el.className='sbwrap';
  const tier=ov>=72?'t-elite':ov>=60?'t-gold':ov>=48?'t-silver':'t-bronze';
  const chars=SB_CHAR.filter(c=>b.ch[c.k]);
  el.innerHTML=`<div class="sbcard ${tier}">
      <div class="sbc-top"><div class="sbc-ovr">${ov}<span>${svEsc(p.pos||'–')}</span></div>
        <div class="sbc-foot">${b.foot?`<b>${svEsc(SB_FOOT[b.foot]||'')}</b><small>${svEsc(b.foot)}</small>`:'<small>Fuß ?</small>'}${b.wf?`<div title="Schwacher Fuß">${sbStars(b.wf)}</div>`:''}</div></div>
      <div class="sbc-name">${svEsc(p.name)}</div>
      <div class="sbc-role">${R?svEsc(R.t):'Rolle noch offen'}${R?`<small>${svEsc(R.fc)}</small>`:''}</div>
      ${attrs.length?`<div class="sbc-attrs">${attrs.map(([k,v])=>`<div><b>${v}</b><span>${k}</span></div>`).join('')}</div>`:`<div class="sbc-attrs empty">Eye-Test und Charakter noch nicht bewertet</div>`}
      ${b.sk.length?`<div class="sbc-sk">${b.sk.slice(0,4).map(x=>sbHex(x.k,x.plus,'sm')).join('')}</div>`:''}
    </div>
    <div class="sbside">
      ${b.sk.length?`<div class="sbblk"><h5>Special Skills</h5><div class="sbsklist">${b.sk.map(x=>`<div class="sbsk">${sbHex(x.k,x.plus)}<div><b>${svEsc(SB_SK[x.k].t)}${x.plus?' <em>+</em>':''}</b><span>${svEsc(SB_SK[x.k].d)}</span></div></div>`).join('')}</div></div>`:''}
      ${chars.length?`<div class="sbblk"><h5>Charakter &amp; Training</h5>${chars.map(c=>`<div class="sbbar"><span>${svEsc(c.t)}</span><i><u style="width:${b.ch[c.k]*20}%" class="v${b.ch[c.k]}"></u></i><b>${b.ch[c.k]}</b></div>`).join('')}</div>`:''}
      ${b.tg.length?`<div class="sbblk sbtags">${b.tg.map(k=>`<span class="sbtag${SB_TG[k].w?' warn':''}">${svEsc(SB_TG[k].t)}</span>`).join('')}</div>`:''}
      ${b.sts||b.sws?`<div class="sbblk sbnotes">${b.sts?`<p><b class="ok">Stärken</b> ${svEsc(b.sts)}</p>`:''}${b.sws?`<p><b class="bad">Schwächen</b> ${svEsc(b.sws)}</p>`:''}</div>`:''}
      ${!sbHas(b)?`<div class="sbempty">${ed?'Noch kein Spielerbogen. Rolle, Special Skills, Fuß und Charakter in einer Minute anlegen.':'Für diesen Spieler gibt es noch keinen Spielerbogen.'}</div>`:''}
      ${ed?`<button class="btn ${sbHas(b)?'ghost ':''}sm sbedit" type="button">${SVI('sliders')} ${sbHas(b)?'Spielerbogen bearbeiten':'Spielerbogen anlegen'}</button>`:''}
    </div>`;
  anchor.after(el);
  const bt=el.querySelector('.sbedit'); if(bt)bt.onclick=()=>sbEditor(p.id);
}

/* ---------- Spielerbogen bearbeiten ---------- */
function sbEditor(pid){
  const p=players.find(x=>x.id===pid); if(!p||!sbCanEdit())return;
  const b0=sbOf(p), st={foot:b0.foot, wf:b0.wf, rol:b0.rol, sk:Object.fromEntries(b0.sk.map(x=>[x.k,x.plus?2:1])), ch:{...b0.ch}, tg:new Set(b0.tg), sts:b0.sts, sws:b0.sws};
  const isTW=p.pos==='TW', posList=[p.pos,...(p.pos2||[])].filter((x,i,a)=>x&&SB_ROLES[x]&&a.indexOf(x)===i);
  const M=svModal(`<div class="mhead" style="gap:14px">${avaHtml(p)}<div><h2 style="margin:0">Spielerbogen</h2><div class="msub">${svEsc(p.name)} · ${svEsc(p.pos||'–')}${(p.pos2||[]).length?' · kann auch '+svEsc(p.pos2.join(', ')):''}</div></div></div><div id="sbEd"></div>`);
  const draw=()=>{
    const E=document.getElementById('sbEd'); if(!E)return;
    E.innerHTML=`
    <section class="sbsec"><h4>Fuß</h4>
      <div class="sbseg">${['Rechts','Links','Beidfüßig'].map(f=>`<button type="button" data-foot="${f}" class="${st.foot===f?'on':''}">${f}</button>`).join('')}</div>
      <div class="sbwf"><span>Schwacher Fuß</span>${[1,2,3,4,5].map(n=>`<button type="button" data-wf="${n}" class="${n<=st.wf?'on':''}" aria-label="${n} Sterne">★</button>`).join('')}<small>${['nicht bewertet','kaum','schwach','ordentlich','stark','wie der starke'][st.wf]}</small></div>
      <p class="note">Gerade in der Innenverteidigung und auf den Außenbahnen wichtig: Linksfuß links, Rechtsfuß rechts.</p></section>
    <section class="sbsec"><h4>Spielerrolle <small>wie in EA FC</small></h4>
      ${posList.map(pos=>`<div class="sbrolegrp"><span class="lbl">${svEsc(pos)}</span><div class="chips">${SB_ROLES[pos].map(r=>`<button type="button" class="pchip role${st.rol===r.k?' on':''}" data-rol="${r.k}" title="${svEsc(r.fc)}">${svEsc(r.t)}</button>`).join('')}</div></div>`).join('')||'<p class="note">Erst eine Position festlegen.</p>'}
      ${st.rol&&SB_ROLE[st.rol]?`<p class="sbroled"><b>${svEsc(SB_ROLE[st.rol].t)}</b> <em>${svEsc(SB_ROLE[st.rol].fc)}</em> · ${svEsc(SB_ROLE[st.rol].d)}</p>`:''}</section>
    <section class="sbsec"><h4>Special Skills <small>1× tippen = hat er · 2× = herausragend (+)</small></h4>
      ${SB_GROUPS.filter(g=>isTW?(g==='Torwart'||g==='Passspiel'):g!=='Torwart').map(g=>`<div class="sbskgrp"><span class="lbl">${g}</span><div class="chips">${SB_SKILLS.filter(s=>s.g===g).map(s=>{ const v=st.sk[s.k]||0; return `<button type="button" class="sbskchip v${v}" data-sk="${s.k}" title="${svEsc(s.d+' · EA FC: '+s.fc)}">${sbHex(s.k,v===2,'xs')}<span>${svEsc(s.t)}</span></button>`; }).join('')}</div></div>`).join('')}</section>
    <section class="sbsec"><h4>Charakter &amp; Training <small>1 = schwach · 5 = top · nochmal tippen = leeren</small></h4>
      ${SB_CHAR.map(c=>`<div class="sbrate"><span>${c.t}</span><div>${[1,2,3,4,5].map(n=>`<button type="button" data-ch="${c.k}:${n}" class="${n<=st.ch[c.k]?'on v'+st.ch[c.k]:''}">${n}</button>`).join('')}</div></div>`).join('')}</section>
    <section class="sbsec"><h4>Charakter-Tags</h4><div class="chips">${SB_TAGS.map(t=>`<button type="button" class="pchip tag${t.w?' warn':''}${st.tg.has(t.k)?' on':''}" data-tg="${t.k}">${svEsc(t.t)}</button>`).join('')}</div></section>
    <section class="sbsec"><h4>Bemerkungen</h4>
      <div class="field"><label>Stärken</label><input id="sbSts" maxlength="160" value="${svEsc(st.sts)}" placeholder="z.B. Kopfballstark, gutes Timing, Führungsstimme"></div>
      <div class="field" style="margin-top:8px"><label>Schwächen</label><input id="sbSws" maxlength="160" value="${svEsc(st.sws)}" placeholder="z.B. langsam im Antritt, schwacher linker Fuß"></div></section>
    <div class="btnrow sbact"><button class="btn" type="button" id="sbSave">Für alle speichern</button><button class="btn ghost" type="button" id="sbCancel">Abbrechen</button></div>`;
    const keep=()=>{ const a=document.getElementById('sbSts'), c=document.getElementById('sbSws'); if(a)st.sts=a.value; if(c)st.sws=c.value; };
    E.querySelectorAll('[data-foot]').forEach(x=>x.onclick=()=>{ keep(); st.foot=st.foot===x.dataset.foot?null:x.dataset.foot; draw(); });
    E.querySelectorAll('[data-wf]').forEach(x=>x.onclick=()=>{ keep(); const n=+x.dataset.wf; st.wf=st.wf===n?0:n; draw(); });
    E.querySelectorAll('[data-rol]').forEach(x=>x.onclick=()=>{ keep(); st.rol=st.rol===x.dataset.rol?'':x.dataset.rol; draw(); });
    E.querySelectorAll('[data-sk]').forEach(x=>x.onclick=()=>{ keep(); const k=x.dataset.sk; st.sk[k]=((st.sk[k]||0)+1)%3; if(!st.sk[k])delete st.sk[k]; draw(); });
    E.querySelectorAll('[data-ch]').forEach(x=>x.onclick=()=>{ keep(); const [k,n]=x.dataset.ch.split(':'); st.ch[k]=st.ch[k]===+n?0:+n; draw(); });
    E.querySelectorAll('[data-tg]').forEach(x=>x.onclick=()=>{ keep(); const k=x.dataset.tg; if(st.tg.has(k))st.tg.delete(k); else st.tg.add(k); draw(); });
    document.getElementById('sbCancel').onclick=()=>openModal(p.id);
    document.getElementById('sbSave').onclick=()=>{ keep(); sbSave(p,b0,st); };
  };
  draw();
}
function sbSave(p,b0,st){
  const u={};
  const sk=SB_SKILLS.map(s=>s.k).filter(k=>st.sk[k]).map(k=>k+(st.sk[k]===2?'+':'')).join(',');
  const skOld=b0.sk.map(x=>x.k+(x.plus?'+':'')).sort().join(','); if(sk.split(',').filter(Boolean).sort().join(',')!==skOld)u.sk=sk||undefined;
  if((st.foot||null)!==(b0.foot||null))u.fu=st.foot||undefined;
  if(st.wf!==b0.wf)u.wf=st.wf||undefined;
  if(st.rol!==b0.rol)u.rol=st.rol||undefined;
  const ch=SB_CHAR.map(c=>st.ch[c.k]||0).join(','), chOld=SB_CHAR.map(c=>b0.ch[c.k]||0).join(','); if(ch!==chOld)u.ch=/[1-5]/.test(ch)?ch:undefined;
  const tg=SB_TAGS.map(t=>t.k).filter(k=>st.tg.has(k)).join(','); if(tg!==b0.tg.slice().sort((a,b)=>SB_TAGS.findIndex(t=>t.k===a)-SB_TAGS.findIndex(t=>t.k===b)).join(','))u.tg=tg||undefined;
  const sts=st.sts.trim().slice(0,160), sws=st.sws.trim().slice(0,160); if(sts!==b0.sts)u.sts=sts||undefined; if(sws!==b0.sws)u.sws=sws||undefined;
  if(!Object.keys(u).length){ openModal(p.id); kToast('Keine Änderung'); return; }
  crmSet(p.id,u); try{crmApply();}catch(e){} try{renderAll();}catch(e){} openModal(p.id);
  kToast('✓ Spielerbogen von '+p.name+' für alle gespeichert');
}
{ const _om3=openModal; openModal=function(){ const r=_om3.apply(this,arguments); try{ sbProfile(arguments[0]); }catch(e){ console.warn('Spielerbogen',e); } return r; }; }

/* ---------- Aufstellung: Positions-Check, Fuß, automatisch sortieren ---------- */
function sbSlotSide(x){ return x<35?'L':x>65?'R':'Z'; }
function sbSlotScore(p,slot){
  const [role,x]=slot, want=ROLE2POS[role];
  if(role==='TW')return p.pos==='TW'?1000:-1000;
  if(p.pos==='TW')return -1000;
  const F=posFit(p,want); let s=F?F.lvl*100:-80;
  const side=sbSlotSide(x), f=SB_FOOT[p.fuss];
  if(f&&side!=='Z'&&(want==='IV'||want==='AV'||want==='Flügel')){ if(f===side)s+=14; else if(f==='B')s+=8; else s-=6; }
  return s;
}
function sbFitInfo(p,slot){
  const want=ROLE2POS[slot[0]], F=slot[0]==='TW'?(p.pos==='TW'?{lvl:2}:null):posFit(p,want);
  const side=sbSlotSide(slot[1]), f=SB_FOOT[p.fuss];
  const footWarn=f&&side!=='Z'&&(want==='IV'||want==='AV'||want==='Flügel')&&f!=='B'&&f!==side;
  const cls=!F?'bad':F.lvl>=2?'ok':F.lvl>=1.5?'neben':F.lvl>=1?'mid':'weak';
  return {F,cls,footWarn,want};
}
{ const _lc=lineupCardHtml; lineupCardHtml=function(p,role,i){
    let h=_lc.apply(this,arguments);
    try{
      const foot=sbFootChip(p);
      if(i!=null){ const slot=FORMATIONS[LINEUP.formation][i]; const fi=sbFitInfo(p,slot);
        const t={ok:'Passt: Hauptposition',neben:'Passt: Nebenposition',mid:'Möglich: '+(p.pos||'?')+' auf '+fi.want,weak:'Nur zur Not: '+(p.pos||'?')+' auf '+fi.want,bad:'Passt nicht: '+(p.pos||'?')+' auf '+fi.want}[fi.cls]+(fi.footWarn?' · falscher Fuß für diese Seite':'');
        h=h.replace('<div class="ov">',`<span class="sbfit ${fi.cls}${fi.footWarn?' fw':''}" title="${svEsc(t)}"></span><div class="ov">`); }
      if(foot)h=h.replace(/<\/div>$/,foot+'</div>');
    }catch(e){}
    return h; }; }
function sbHungarian(a){ // Maximum-Zuordnung (n×n), klassischer Ungarischer Algorithmus
  const n=a.length, INF=1e15, u=Array(n+1).fill(0), v=Array(n+1).fill(0), pp=Array(n+1).fill(0), way=Array(n+1).fill(0);
  const cost=(i,j)=>-a[i][j];
  for(let i=1;i<=n;i++){ pp[0]=i; let j0=0; const minv=Array(n+1).fill(INF), used=Array(n+1).fill(false);
    do{ used[j0]=true; const i0=pp[j0]; let d=INF, j1=0;
      for(let j=1;j<=n;j++) if(!used[j]){ const cur=cost(i0-1,j-1)-u[i0]-v[j]; if(cur<minv[j]){minv[j]=cur;way[j]=j0;} if(minv[j]<d){d=minv[j];j1=j;} }
      for(let j=0;j<=n;j++){ if(used[j]){u[pp[j]]+=d;v[j]-=d;} else minv[j]-=d; }
      j0=j1; }while(pp[j0]!==0);
    do{ const j1=way[j0]; pp[j0]=pp[j1]; j0=j1; }while(j0); }
  const res=Array(n); for(let j=1;j<=n;j++)res[pp[j]-1]=j-1; return res; }
function sbOptimize(){
  if(!canEdit())return svDenied('Die Aufstellung ändern nur Kaderplaner.');
  const form=FORMATIONS[LINEUP.formation], idx=form.map((_,i)=>i).filter(i=>LINEUP.slots[i]);
  const ps=idx.map(i=>players.find(z=>z.id===LINEUP.slots[i])).filter(Boolean); if(ps.length!==idx.length||!ps.length)return;
  const mat=ps.map((p,pi)=>idx.map(si=>sbSlotScore(p,form[si])+(idx[pi]===si?3:0)));
  const asg=sbHungarian(mat), ns={}; let moved=0;
  ps.forEach((p,pi)=>{ const si=idx[asg[pi]]; ns[si]=p.id; if(si!==idx[pi])moved++; });
  if(!moved){ kToast('✓ Alle stehen schon auf der besten Position'); return; }
  LINEUP={formation:LINEUP.formation,slots:ns}; renderLineup();
  kToast('✓ Positionen sortiert · '+moved+' Spieler umgestellt');
}
function sbFitRow(){
  const host=document.getElementById('gapRow'); if(!host)return;
  let el=document.getElementById('sbFitRow'); if(!el){ el=document.createElement('div'); el.id='sbFitRow'; el.className='sbfitrow'; host.after(el); }
  const form=FORMATIONS[LINEUP.formation], issues=[], foot=[]; let n=0, ok=0, main=0;
  form.forEach((slot,i)=>{ const p=players.find(z=>z.id===LINEUP.slots[i]); if(!p)return; n++; const fi=sbFitInfo(p,slot);
    if(fi.cls==='bad'||fi.cls==='weak')issues.push(`<b>${svEsc(p.name.split(' ').slice(-1)[0])}</b> (${svEsc(p.pos||'?')}) als ${svEsc(slot[0])}`); else { ok++; if(fi.cls==='ok'||fi.cls==='neben')main++; }
    if(fi.footWarn)foot.push(`<b>${svEsc(p.name.split(' ').slice(-1)[0])}</b> (${svEsc(p.fuss)}) auf ${sbSlotSide(slot[1])==='L'?'links':'rechts'}`); });
  if(!n){ el.innerHTML=''; return; }
  const good=!issues.length&&!foot.length;
  el.innerHTML=`<div class="sbfitbox ${good?'good':'warn'}"><span class="sbfit-ic">${SVI(good?'check':'info')}</span>
    <div class="sbfit-t"><b>Positions-Check: ${ok}/${n} auf passender Position</b>${issues.length?`<span>Passt nicht: ${issues.join(' · ')}</span>`:''}${foot.length?`<span>Fuß/Seite: ${foot.join(' · ')}</span>`:''}${good?`<span>${main===ok?'Alle auf Haupt- oder Nebenposition':main+' auf Haupt-/Nebenposition, '+(ok-main)+' auf verwandter Position'} · realistisch aufgestellt. Grüner Punkt = Hauptposition, gelber = verwandte Position.</span>`:''}</div>
    ${canEdit()&&!good?`<button class="btn sm" id="sbOpt" type="button">${SVI('move')} Automatisch sortieren</button>`:''}</div>`;
  const b=document.getElementById('sbOpt'); if(b)b.onclick=sbOptimize;
}
{ const _rl=renderLineup; renderLineup=function(){ const r=_rl.apply(this,arguments); try{sbFitRow();}catch(e){ console.warn(e); } return r; }; }

/* ---------- Kader-Profil: Was haben wir, was fehlt? ---------- */
const SB_POSG=['TW','IV','AV','ZM','OM','Flügel','ST'];
let sbQ={pos:'',rol:'',sk:'',foot:'',kreis:'alle'}, sbQuickOpen=false;
function sbSquad(){ return players.filter(p=>p.own&&!p.isJugend&&!p.verzicht&&(p.kader===1||(p.kader==null&&!/\bII\b/.test(p.club||'')))); }
function sbGaps(sq){
  const G=[], by=pos=>sq.filter(p=>p.pos===pos), bogen=p=>sbOf(p), hasSk=(k,list)=>(list||sq).some(p=>bogen(p).sk.some(x=>x.k===k)), hasRole=(k,list)=>(list||sq).some(p=>bogen(p).rol===k);
  const iv=by('IV'), av=by('AV'), st=by('ST'), tw=by('TW');
  const rated=sq.filter(p=>sbHas(bogen(p))).length;
  if(tw.length<2)G.push({lvl:'hoch',t:'Nur '+tw.length+' Torwart im Kader',q:{pos:'TW'}});
  if(iv.length&&!iv.some(p=>p.fuss==='Links'||p.fuss==='Beidfüßig'))G.push({lvl:'hoch',t:'Kein Linksfuß in der Innenverteidigung'+(iv.some(p=>!p.fuss)?' (Fuß bei '+iv.filter(p=>!p.fuss).length+' IV noch offen)':''),q:{pos:'IV',foot:'Links'}});
  if(av.length<3)G.push({lvl:'mittel',t:'Nur '+av.length+' gelernte Außenverteidiger',q:{pos:'AV'}});
  if(av.length&&!av.some(p=>p.fuss==='Links'||p.fuss==='Beidfüßig'))G.push({lvl:'mittel',t:'Kein Linksfuß auf der Außenverteidiger-Position',q:{pos:'AV',foot:'Links'}});
  if(rated>=5){
    if(!hasRole('st-ziel',st)&&!hasSk('kopfball',st))G.push({lvl:'mittel',t:'Kein Zielspieler / kopfballstarker Stürmer',q:{pos:'ST',rol:'st-ziel'}});
    if(!hasSk('standard'))G.push({lvl:'mittel',t:'Kein Standardspezialist',q:{sk:'standard'}});
    if(sq.filter(p=>bogen(p).sk.some(x=>x.k==='tempo')).length<2)G.push({lvl:'mittel',t:'Wenig Tempo im Kader (unter 2 Spieler mit „Tempo“)',q:{sk:'tempo'}});
    if(!sq.some(p=>{const b=bogen(p); return b.tg.includes('leader')||b.ch.fuehr>=4;}))G.push({lvl:'mittel',t:'Kein ausgewiesener Führungsspieler',q:{}});
    if(!hasRole('zm-sechser')&&!hasSk('zweikampf',by('ZM')))G.push({lvl:'niedrig',t:'Kein echter Abräumer auf der Sechs',q:{pos:'ZM',rol:'zm-sechser'}});
    if(!hasSk('steilpass')&&!hasRole('om-spielmacher')&&!hasRole('zm-tief'))G.push({lvl:'niedrig',t:'Kein Spielmacher / tödlicher Pass',q:{sk:'steilpass'}});
  }
  return {G,rated};
}
function sbKaderRender(){
  const wrap=document.getElementById('kaderplanWrap'); if(!wrap)return;
  let el=document.getElementById('sbKader'); if(!el){ el=document.createElement('div'); el.id='sbKader'; wrap.parentNode.insertBefore(el,wrap); }
  const sq=sbSquad(), {G,rated}=sbGaps(sq), ed=sbCanEdit();
  const avg=k=>{ const v=sq.map(p=>sbOf(p).ch[k]).filter(Boolean); return v.length?(v.reduce((a,b)=>a+b,0)/v.length):0; };
  const grp=SB_POSG.map(pos=>{ const L=sq.filter(p=>p.pos===pos).sort((a,b)=>scores(b).total-scores(a).total);
    const feet={R:0,L:0,B:0,'?':0}; L.forEach(p=>feet[SB_FOOT[p.fuss]||'?']++);
    return `<div class="sbpg"><div class="sbpg-h"><b>${pos}</b><span>${L.length}</span></div>
      <div class="sbpg-f">${feet.R?`<i class="f-R">${feet.R}× R</i>`:''}${feet.L?`<i class="f-L">${feet.L}× L</i>`:''}${feet.B?`<i class="f-B">${feet.B}× B</i>`:''}${feet['?']?`<i>${feet['?']}× ?</i>`:''}</div>
      <div class="sbpg-l">${L.map(p=>{ const b=sbOf(p), R=SB_ROLE[b.rol]; return `<div class="sbpl" data-svp="${svEsc(p.id)}"><span class="sbpl-n">${svEsc(p.name)}</span>${sbFootChip(p)}${R?`<em>${svEsc(R.t)}</em>`:''}<span class="sbpl-sk">${b.sk.slice(0,3).map(x=>sbHex(x.k,x.plus,'xs')).join('')}</span></div>`; }).join('')||'<div class="note">—</div>'}</div></div>`; }).join('');
  const rolesAll=Object.values(SB_ROLES).flat();
  const res=sbSearch();
  el.innerHTML=`<div class="card sbkader">
    <div class="adm-head"><div><h3 style="margin:0;display:flex;gap:8px;align-items:center">${SVI('layers')} Kader-Profil 26/27</h3>
      <p style="margin:6px 0 0;font-size:13.5px">Rollen, Special Skills, Fuß und Charakter der Ersten, wie im Karrieremodus. So seht ihr, welche Typen fehlen, und sucht gezielt danach.</p></div>
      <div class="adm-stats"><div class="adm-stat"><b>${sq.length}</b><span>im Kader</span></div><div class="adm-stat"><b>${rated}</b><span>mit Spielerbogen</span></div><div class="adm-stat"><b>${sq.filter(p=>p.fuss).length}</b><span>Fuß bekannt</span></div></div></div>
    ${rated<sq.length?`<div class="sbhint">${SVI('info')}<span><b>${sq.length-rated} Spieler</b> haben noch keinen Spielerbogen, bei <b>${sq.length-sq.filter(p=>p.fuss).length}</b> fehlt der starke Fuß. Öffentlich steht das nirgends. Am schnellsten geht es unten mit der <b>Schnell-Erfassung</b>.</span></div>`:''}
    <div class="sbsub">Was uns fehlt</div>
    <div class="sbgaps">${G.length?G.map((g,i)=>`<button class="sbgap l-${g.lvl==='hoch'?'h':g.lvl==='mittel'?'m':'n'}" data-gap="${i}"><span>${svEsc(g.t)}</span><em>Passende suchen →</em></button>`).join(''):`<div class="note">${rated>=5?'Keine offensichtlichen Lücken: stark!':'Sobald mindestens 5 Spielerbögen angelegt sind, zeigt die App hier auch fehlende Rollen und Skills.'}</div>`}</div>
    ${rated?`<div class="sbsub">Charakter der Mannschaft (Ø)</div><div class="sbteamch">${SB_CHAR.map(c=>{ const a=avg(c.k); return `<div class="sbbar"><span>${c.t}</span><i><u style="width:${a*20}%" class="v${Math.round(a)}"></u></i><b>${a?a.toFixed(1):'–'}</b></div>`; }).join('')}</div>`:''}
    <div class="sbsub">Kader nach Positionen</div>
    <div class="sbpgrid">${grp}</div>
    <div class="sbsub" id="sbSearchAnchor">Profil-Suche</div>
    <div class="sbsearch">
      <select id="sbQpos"><option value="">Alle Positionen</option>${SB_POSG.map(p=>`<option${sbQ.pos===p?' selected':''}>${p}</option>`).join('')}</select>
      <select id="sbQrol"><option value="">Jede Rolle</option>${(sbQ.pos?SB_ROLES[sbQ.pos]:rolesAll).map(r=>`<option value="${r.k}"${sbQ.rol===r.k?' selected':''}>${svEsc(r.t)}</option>`).join('')}</select>
      <select id="sbQsk"><option value="">Jeder Skill</option>${SB_SKILLS.map(s=>`<option value="${s.k}"${sbQ.sk===s.k?' selected':''}>${svEsc(s.t)}</option>`).join('')}</select>
      <select id="sbQfoot"><option value="">Jeder Fuß</option>${['Rechts','Links','Beidfüßig'].map(f=>`<option${sbQ.foot===f?' selected':''}>${f}</option>`).join('')}</select>
      <select id="sbQkreis"><option value="alle"${sbQ.kreis==='alle'?' selected':''}>Alle Spieler</option><option value="eigene"${sbQ.kreis==='eigene'?' selected':''}>Nur eigene</option><option value="extern"${sbQ.kreis==='extern'?' selected':''}>Nur externe</option></select>
    </div>
    <div class="sbres">${res.html}</div>
    ${ed?`<div class="sbsub sbquick-h"><button type="button" id="sbQuickT" class="btn ghost sm">${SVI('updown')} Schnell-Erfassung: Fuß, Rolle &amp; Charakter für den ganzen Kader</button></div>${sbQuickOpen?sbQuick(sq):''}`:''}
  </div>`;
  el.querySelectorAll('[data-svp]').forEach(a=>a.onclick=()=>openModal(a.dataset.svp));
  el.querySelectorAll('[data-gap]').forEach(b=>b.onclick=()=>{ const g=G[+b.dataset.gap]; sbQ={pos:'',rol:'',sk:'',foot:'',kreis:'extern',...g.q}; sbKaderRender(); document.getElementById('sbSearchAnchor').scrollIntoView({behavior:'smooth',block:'start'}); });
  const on=(id,k)=>{ const s=document.getElementById(id); if(s)s.onchange=()=>{ sbQ[k]=s.value; if(k==='pos'&&sbQ.rol&&SB_ROLE[sbQ.rol]&&SB_ROLE[sbQ.rol].pos!==sbQ.pos)sbQ.rol=''; sbKaderRender(); }; };
  on('sbQpos','pos'); on('sbQrol','rol'); on('sbQsk','sk'); on('sbQfoot','foot'); on('sbQkreis','kreis');
  const qt=document.getElementById('sbQuickT'); if(qt)qt.onclick=()=>{ sbQuickOpen=!sbQuickOpen; sbKaderRender(); };
  el.querySelectorAll('[data-qf]').forEach(s=>s.onchange=()=>{ const [pid,f]=s.dataset.qf.split('|'); const p=players.find(x=>x.id===pid); if(!p)return;
    const u={};
    if(f==='fu')u.fu=s.value||undefined;
    else if(f==='wf')u.wf=s.value?+s.value:undefined;
    else if(f==='rol')u.rol=s.value||undefined;
    else { const b=sbOf(p); b.ch[f]=+s.value||0; const ch=SB_CHAR.map(c=>b.ch[c.k]||0).join(','); u.ch=/[1-5]/.test(ch)?ch:undefined; }
    crmSet(pid,u); try{crmApply();}catch(e){} kToast('✓ '+p.name+' gespeichert'); });
}
function sbSearch(){
  const q=sbQ, active=q.pos||q.rol||q.sk||q.foot;
  if(!active)return {html:'<div class="note">Position, Rolle, Skill oder Fuß wählen. Z.B. „IV + Linksfuß“ oder „ST + Kopfballstark“.</div>'};
  let L=players.filter(p=>!p.isJugend&&(q.kreis==='eigene'?p.own:q.kreis==='extern'?!p.own:true));
  if(q.pos)L=L.filter(p=>p.pos===q.pos||(p.pos2||[]).includes(q.pos));
  if(q.foot)L=L.filter(p=>p.fuss===q.foot||(q.foot!=='Beidfüßig'&&p.fuss==='Beidfüßig'));
  if(q.rol)L=L.filter(p=>sbOf(p).rol===q.rol);
  if(q.sk)L=L.filter(p=>sbOf(p).sk.some(x=>x.k===q.sk));
  L=L.map(p=>({p,s:scores(p).total})).sort((a,b)=>b.s-a.s);
  const unknownFoot=q.foot&&!L.length?players.filter(p=>!p.isJugend&&(!q.pos||p.pos===q.pos)&&!p.fuss&&(q.kreis==='eigene'?p.own:q.kreis==='extern'?!p.own:true)).length:0;
  if(!L.length)return {html:`<div class="note">Kein Spieler mit diesem Profil erfasst.${unknownFoot?' Bei '+unknownFoot+' passenden Spielern ist der Fuß noch unbekannt. Spielerbögen für Kandidaten anlegen, dann tauchen sie hier auf.':' Rollen und Skills gibt es nur für Spieler mit Spielerbogen.'}</div>`};
  return {html:`<div class="sbresl">${L.slice(0,40).map(({p,s})=>{ const b=sbOf(p), R=SB_ROLE[b.rol]; return `<div class="sbri" data-svp="${svEsc(p.id)}">${avaHtml(p)}<div class="sbri-n"><b>${svEsc(p.name)}</b><span>${svEsc(p.club||'')} · ${svEsc(p.pos||'–')}${R?' · '+svEsc(R.t):''}</span></div>${sbFootChip(p)}<span class="sbri-sk">${b.sk.slice(0,3).map(x=>sbHex(x.k,x.plus,'xs')).join('')}</span><span class="sbri-s" style="color:${tierColor(s)}">${Math.round(s)}</span></div>`; }).join('')}</div>${L.length>40?`<div class="note">… und ${L.length-40} weitere</div>`:''}`};
}
function sbQuick(sq){
  const L=sq.slice().sort((a,b)=>SB_POSG.indexOf(a.pos)-SB_POSG.indexOf(b.pos)||a.name.localeCompare(b.name,'de'));
  const opt=(arr,cur)=>arr.map(([v,t])=>`<option value="${svEsc(v)}"${String(cur)===String(v)?' selected':''}>${svEsc(t)}</option>`).join('');
  return `<div class="sbquick"><div class="note" style="margin-bottom:8px">Jede Änderung wird sofort für alle gespeichert. Details (Skills, Tags, Bemerkungen) im Spielerprofil unter „Spielerbogen“.</div><div class="sbqt">
    <div class="sbqr sbqhead"><span>Spieler</span><span>Fuß</span><span>Schw. Fuß</span><span>Rolle</span><span>Fleiß</span><span>Laufst.</span><span>Teamg.</span></div>
    ${L.map(p=>{ const b=sbOf(p), roles=SB_ROLES[p.pos]||[]; const r15=[['','–'],[1,'1'],[2,'2'],[3,'3'],[4,'4'],[5,'5']];
      return `<div class="sbqr"><span class="sbqn" data-svp="${svEsc(p.id)}"><b>${svEsc(p.name)}</b><em>${svEsc(p.pos||'–')}</em></span>
        <select data-qf="${svEsc(p.id)}|fu" aria-label="Fuß">${opt([['','?'],['Rechts','Rechts'],['Links','Links'],['Beidfüßig','Beidf.']],p.fuss||'')}</select>
        <select data-qf="${svEsc(p.id)}|wf" aria-label="Schwacher Fuß">${opt([['','–'],[1,'★'],[2,'★★'],[3,'★★★'],[4,'★★★★'],[5,'★★★★★']],b.wf||'')}</select>
        <select data-qf="${svEsc(p.id)}|rol" aria-label="Rolle">${opt([['','–'],...roles.map(r=>[r.k,r.t])],b.rol)}</select>
        <select data-qf="${svEsc(p.id)}|fleiss" aria-label="Trainingsfleiß">${opt(r15,b.ch.fleiss||'')}</select>
        <select data-qf="${svEsc(p.id)}|lauf" aria-label="Laufstärke">${opt(r15,b.ch.lauf||'')}</select>
        <select data-qf="${svEsc(p.id)}|team" aria-label="Teamgeist">${opt(r15,b.ch.team||'')}</select></div>`; }).join('')}</div></div>`;
}
{ const _rkp=renderKaderplan; renderKaderplan=function(){ const r=_rkp.apply(this,arguments); try{ if(!crmIsTyping())sbKaderRender(); }catch(e){ console.warn('Kader-Profil',e); } return r; }; }

/* =====================================================================
   SV/BSC Scout · Trainings-Kern (läuft in der App UND im Erinnerungs-/Co-Trainer-Dienst)
   - Kennzahlen je Spieler & Team, Tendenz-Warnungen, einfacher Sprach-/Text-Parser
   ===================================================================== */
const TRC=(function(){
  const REASONS={verletzt:'Verletzt',krank:'Krank',arbeit:'Arbeit/Schicht',urlaub:'Urlaub',uni:'Schule/Uni',familie:'Familie',zweite:'In der Zweiten',privat:'Privat',ohne:'Ohne Grund',keine_antwort:'Keine Rückmeldung'};
  const EXCUSE_NEUTRAL={verletzt:1,krank:1,zweite:1};          // zählen nicht gegen die Beteiligung
  const FOKUS={lauf:'Laufintensiv',athletik:'Athletik/Kraft',taktik:'Taktik',technik:'Technik',spielform:'Spielformen',abschluss:'Torabschluss',standards:'Standards',umschalt:'Umschalten',regeneration:'Regeneration',torwart:'Torwarttraining'};
  const ART={muskel:'Muskel',band:'Bänder/Sehnen',knochen:'Knochen',gelenk:'Gelenk/Meniskus',prellung:'Prellung',krankheit:'Krankheit',sonstiges:'Sonstiges'};
  const DAY=86400000;
  const iso=d=>{ const x=new Date(d); return x.getFullYear()+'-'+String(x.getMonth()+1).padStart(2,'0')+'-'+String(x.getDate()).padStart(2,'0'); };
  const addDays=(s,n)=>iso(new Date(new Date(s+'T12:00:00').getTime()+n*DAY));
  const diffDays=(a,b)=>Math.round((new Date(a+'T12:00:00')-new Date(b+'T12:00:00'))/DAY);
  const fmt=s=>{ if(!s)return ''; const [y,m,d]=String(s).split('-'); return d+'.'+m+'.'; };
  const trainings=st=>(st&&st.sessions||[]).filter(s=>s.t==='training');
  function rows(st,pid){ const out=[]; for(const s of trainings(st)){ for(const a of s.a||[]){ if(a[0]===pid){ out.push({d:s.d,st:a[1],g:a[2],mot:a[3],fit:a[4],n:a[5],no:a[8]!=null?a[8]:null,ns:a[9]||null,ss:a[10]||null}); break; } } } return out.sort((x,y)=>x.d<y.d?1:-1); }
  function rate(list){ const c=list.filter(r=>!(r.st==='weg'&&EXCUSE_NEUTRAL[r.g])); if(!c.length)return null; return c.filter(r=>r.st!=='weg').length/c.length; }
  function activeInjury(st,pid,today){ return (st&&st.injuries||[]).find(i=>i.p===pid&&!i.z&&i.b<=today)||null; }
  function playerStats(st,pid,today){
    const R=rows(st,pid), w=(a,b)=>R.filter(r=>{ const dd=diffDays(today,r.d); return dd>=a&&dd<b; });
    const r28=w(0,28), rPrev=w(28,84), rSeason=w(0,365);
    const mot=R.filter(r=>r.mot).map(r=>({d:r.d,v:r.mot})), fit=R.filter(r=>r.fit).map(r=>({d:r.d,v:r.fit}));
    const seen=R.find(r=>r.st!=='weg');
    let streak=0; for(const r of R){ if(r.st==='weg'&&!EXCUSE_NEUTRAL[r.g])streak++; else break; }
    const inj=(st&&st.injuries||[]).filter(i=>i.p===pid);
    return { n28:r28.length, rate28:rate(r28), ratePrev:rate(rPrev), rateSeason:rate(rSeason), da28:r28.filter(r=>r.st!=='weg').length,
      ohne28:r28.filter(r=>r.st==='weg'&&r.g==='ohne').length, spaet28:r28.filter(r=>r.st==='spaet').length,
      mot, fit, lastSeen:seen?seen.d:null, streak, rows:R, injury:activeInjury(st,pid,today), injuries:inj,
      inj12:inj.filter(i=>diffDays(today,i.b)<=365).length };
  }
  function teamStats(st,today,squadIds){
    const S=trainings(st), set=squadIds?new Set(squadIds):null;
    const win=(a,b)=>{ let da=0,n=0,cnt=0; for(const s of S){ const dd=diffDays(today,s.d); if(dd<a||dd>=b)continue; cnt++; for(const x of s.a||[]){ if(set&&!set.has(x[0]))continue; if(x[1]==='weg'&&EXCUSE_NEUTRAL[x[2]])continue; n++; if(x[1]!=='weg')da++; } } return {rate:n?da/n:null,sessions:cnt}; };
    const weeks=[]; for(let k=11;k>=0;k--){ const w=win(k*7,k*7+7); weeks.push({from:addDays(today,-k*7-6),rate:w.rate,sessions:w.sessions}); }
    const perSession=S.slice(0,12).map(s=>({d:s.d,da:(s.a||[]).filter(x=>x[1]!=='weg'&&(!set||set.has(x[0]))).length}));
    return {r21:win(0,21),prev:win(21,63),r28:win(0,28),season:win(0,365),weeks,perSession};
  }
  const pct=v=>v==null?'–':Math.round(v*100)+' %';
  function avg(a){ return a.length?a.reduce((x,y)=>x+y,0)/a.length:null; }
  /* Tendenz-Warnungen: [{key, lvl:'hoch'|'mittel'|'info', pid, t (Titel), d (Details), ask:{…} (Rückfrage)}] */
  function alerts(st,squad,today){
    const out=[], name=p=>p.name;
    for(const p of squad){
      const s=playerStats(st,p.id,today);
      if(s.injury){
        const i=s.injury;
        if(i.pr&&i.pr<today)out.push({key:'inj-over:'+i.id,lvl:'mittel',pid:p.id,t:`Ist ${name(p)} wieder fit?`,d:`${i.dg} seit ${fmt(i.b)} · Prognose war ${fmt(i.pr)}`,ask:{type:'fit',injury:i.id}});
        const back=s.rows.find(r=>r.st!=='weg'&&r.d>i.b);
        if(back)out.push({key:'inj-back:'+i.id,lvl:'info',pid:p.id,t:`${name(p)} war wieder im Training`,d:`Am ${fmt(back.d)} dabei: Verletzung (${i.dg}) als ausgeheilt abschließen?`,ask:{type:'close',injury:i.id,date:back.d}});
        continue;                                                  // Verletzte nicht zusätzlich wegen Beteiligung warnen
      }
      if(s.ohne28>=2)out.push({key:'ohne:'+p.id+':'+s.ohne28,lvl:'hoch',pid:p.id,t:`${name(p)} fehlt ohne Grund`,d:`${s.ohne28}× unentschuldigt in den letzten 4 Wochen. Gespräch suchen?`});
      else if(s.streak>=3)out.push({key:'streak:'+p.id+':'+s.streak,lvl:'hoch',pid:p.id,t:`${name(p)} war ${s.streak}× in Folge nicht da`,d:`Zuletzt im Training: ${s.lastSeen?fmt(s.lastSeen):'unbekannt'}.`});
      if(s.rate28!=null&&s.ratePrev!=null&&s.n28>=3&&s.ratePrev-s.rate28>=0.25&&s.rate28<0.7)
        out.push({key:'drop:'+p.id+':'+Math.round(s.rate28*10),lvl:'mittel',pid:p.id,t:`Trainingsbeteiligung von ${name(p)} sinkt`,d:`${pct(s.ratePrev)} → ${pct(s.rate28)} (letzte 4 Wochen).`});
      const m3=s.mot.slice(0,3).map(x=>x.v), mPrev=s.mot.slice(3,8).map(x=>x.v);
      if(m3.length>=2&&avg(m3)<=2.3)out.push({key:'mot:'+p.id+':'+s.mot[0].d,lvl:'mittel',pid:p.id,t:`${name(p)} wirkt lustlos`,d:`Motivation zuletzt Ø ${avg(m3).toFixed(1)} von 5.`});
      else if(m3.length>=2&&mPrev.length>=2&&avg(mPrev)-avg(m3)>=1.2)out.push({key:'motd:'+p.id+':'+s.mot[0].d,lvl:'info',pid:p.id,t:`Motivation von ${name(p)} lässt nach`,d:`Ø ${avg(mPrev).toFixed(1)} → ${avg(m3).toFixed(1)}.`});
      const f2=s.fit.slice(0,2).map(x=>x.v);
      if(f2.length===2&&avg(f2)<=2)out.push({key:'fit:'+p.id+':'+s.fit[0].d,lvl:'info',pid:p.id,t:`${name(p)} wirkt platt`,d:`Fitness zuletzt ${f2.join(' / ')} von 5: Belastung steuern.`});
      if(s.inj12>=3)out.push({key:'injmany:'+p.id+':'+s.inj12,lvl:'info',pid:p.id,t:`${name(p)}: ${s.inj12} Verletzungen in 12 Monaten`,d:`Verletzungsanfällig: Belastung und Prävention im Blick behalten.`});
    }
    const T=teamStats(st,today,squad.map(p=>p.id));
    if(T.r21.rate!=null&&T.prev.rate!=null&&T.r21.sessions>=3&&T.prev.rate-T.r21.rate>=0.12)
      out.push({key:'team:'+Math.round(T.r21.rate*20),lvl:'hoch',pid:null,t:'Trainingsbeteiligung im Team sinkt',d:`${pct(T.prev.rate)} → ${pct(T.r21.rate)} in den letzten 3 Wochen.`});
    const order={hoch:0,mittel:1,info:2}; return out.sort((a,b)=>order[a.lvl]-order[b.lvl]);
  }

  /* ---------- Einfacher Text-Parser (ohne KI): „Max und Tim waren heute nicht da, Tom verletzt (Zerrung, 3 Wochen)“ ---------- */
  const N=s=>String(s||'').toLowerCase().replace(/ä/g,'ae').replace(/ö/g,'oe').replace(/ü/g,'ue').replace(/ß/g,'ss').normalize('NFD').replace(/[\u0300-\u036f]/g,'');
  const NUM={ein:1,eine:1,einen:1,zwei:2,drei:3,vier:4,fuenf:5,sechs:6,sieben:7,acht:8,neun:9,zehn:10,zwoelf:12};
  function nameIndex(squad){
    const first={}, last={}; squad.forEach(p=>{ const w=N(p.name).split(/\s+/).filter(Boolean); if(!w.length)return; (first[w[0]]=first[w[0]]||[]).push(p); const l=w[w.length-1]; (last[l]=last[l]||[]).push(p); });
    const idx=[]; squad.forEach(p=>{ const w=N(p.name).split(/\s+/).filter(Boolean); if(!w.length)return; idx.push({k:w.join(' '),p,len:3});
      const l=w[w.length-1]; if(last[l].length===1&&l.length>=3)idx.push({k:l,p,len:2}); if(first[w[0]].length===1&&w[0].length>=3)idx.push({k:w[0],p,len:1});
      (p.alias||[]).forEach(a=>{ const k=N(a); if(k.length>=3)idx.push({k,p,len:2}); }); });
    const out=idx.sort((a,b)=>b.k.length-a.k.length);
    out.ambig={}; Object.entries(last).forEach(([k,L])=>{ if(L.length>1&&k.length>=3)out.ambig[k]=L; }); Object.entries(first).forEach(([k,L])=>{ if(L.length>1&&k.length>=3)out.ambig[k]=(out.ambig[k]||[]).concat(L.filter(x=>!(out.ambig[k]||[]).includes(x))); });
    return out;
  }
  function ambiguous(text,idx,found){
    const t=' '+N(text).replace(/[^a-z0-9]+/g,' ')+' ', res=[];
    for(const [k,L] of Object.entries(idx.ambig||{})){ if(!t.includes(' '+k+' '))continue; if(L.some(p=>found.includes(p.id)&&t.includes(' '+N(p.name)+' ')))continue;
      const rest=L.filter(p=>!t.includes(' '+N(p.name)+' ')); if(rest.length>1)res.push({k,names:rest.map(p=>p.name)}); }
    return res;
  }
  function findPlayers(clause,idx){
    const hits=[]; let s=' '+clause.replace(/[^a-z0-9]+/g,' ')+' ';
    for(const e of idx){ const k=' '+e.k+' '; let pos=s.indexOf(k); while(pos>=0){ if(!hits.some(h=>h.p.id===e.p.id))hits.push({p:e.p,pos}); s=s.slice(0,pos)+' '+'#'.repeat(e.k.length)+' '+s.slice(pos+k.length); pos=s.indexOf(k); } }
    return hits.sort((a,b)=>a.pos-b.pos).map(h=>h.p);
  }
  function parseDate(t,today){
    if(/\bvorgestern\b/.test(t))return addDays(today,-2);
    if(/\bgestern\b/.test(t))return addDays(today,-1);
    const m=t.match(/\b(\d{1,2})\.(\d{1,2})\.?(\d{2,4})?/); if(m){ const y=m[3]?(m[3].length===2?'20'+m[3]:m[3]):today.slice(0,4); const d=`${y}-${m[2].padStart(2,'0')}-${m[1].padStart(2,'0')}`; return d>today?`${+y-1}${d.slice(4)}`:d; }
    const wd={montag:1,dienstag:2,mittwoch:3,donnerstag:4,freitag:5,samstag:6,sonntag:0}; for(const k in wd){ if(new RegExp('\\b(am |letzten )?'+k+'\\b').test(t)){ let d=today; for(let i=0;i<7;i++){ if(new Date(d+'T12:00:00').getDay()===wd[k]&&!(i===0&&!/heute/.test(t)&&false))return d; d=addDays(d,-1); } } }
    return today;
  }
  function weeks(t){ const m=t.match(/(\d+|ein|eine|einen|zwei|drei|vier|fuenf|sechs|sieben|acht|neun|zehn|zwoelf)\s*(woche|wochen|tag|tage|tagen|monat|monate|monaten)/); if(!m)return null; const n=+m[1]||NUM[m[1]]||1; return /tag/.test(m[2])?n:/monat/.test(m[2])?n*30:n*7; }
  function injuryInfo(raw){
    const t=N(raw); let art='sonstiges';
    if(/zerrung|muskelfaser|faserriss|muskel|wade|oberschenkel|adduktor|leiste/.test(t))art='muskel';
    if(/band|baender|sehne|achilles|kreuzband|umgeknickt/.test(t))art='band';
    if(/bruch|gebrochen|fraktur|knochen/.test(t))art='knochen';
    if(/meniskus|knie|sprunggelenk|gelenk|schulter/.test(t)&&art==='sonstiges')art='gelenk';
    if(/prellung|pferdekuss|stauchung/.test(t))art='prellung';
    if(/krank|grippe|erkaelt|fieber|corona|infekt|magen/.test(t))art='krankheit';
    const bp=(t.match(/(oberschenkel|wade|knie|sprunggelenk|knoechel|leiste|adduktor|ruecken|schulter|fuss|zeh|hand|kopf|hueft|achilles|kreuzband|meniskus)/)||[])[1]||null;
    return {art,koerperteil:bp};
  }
  const INJ=/verletz|zerrung|faserriss|muskel|baender|bandriss|kreuzband|meniskus|umgeknickt|prellung|bruch|gebrochen|knie|sprunggelenk|leiste|adduktor|wade|oberschenkel|ruecken|schulter|achilles|pferdekuss/;
  function parse(text,squad,today,st){
    const t0=N(text), datum=parseDate(t0,today), idx=nameIndex(squad);
    const clauses=t0.split(/[.;!\n]+|,\s*(?=[a-z])/).map(s=>s.trim()).filter(Boolean);
    const sp={}, inj=[], close=[], session={}, found=new Set(); let restDa=/alle (anderen|weiteren|uebrigen)? ?(waren )?(da|dabei|anwesend)|sonst (waren )?alle da/.test(t0);
    let last=[];
    const set=(p,o)=>{ sp[p.id]=Object.assign(sp[p.id]||{player_id:p.id},o); found.add(p.id); };
    for(const c of clauses){
      let ps=findPlayers(c,idx); if(!ps.length&&/\b(er|der|ihn|sein)\b/.test(c))ps=last; if(ps.length)last=ps;
      const absent=/nicht da|nicht im training|nicht dabei|gefehlt|fehlt|fehlte|fehlen|abwesend|abgesagt|kam nicht|nicht gekommen|war nicht|waren nicht|nicht erschienen/.test(c);
      const late=/zu spaet|verspaetet|spaeter gekommen|kam spaet/.test(c);
      const back=/wieder fit|wieder dabei|wieder im training|zurueck im training|wieder mit trainiert|wieder voll/.test(c);
      let grund=null;
      if(INJ.test(c))grund='verletzt'; else if(/krank|grippe|erkaelt|fieber|infekt|magen/.test(c))grund='krank';
      else if(/arbeit|schicht|arbeiten|dienst|job/.test(c))grund='arbeit'; else if(/urlaub|verreist|ferien/.test(c))grund='urlaub';
      else if(/uni|schule|klausur|pruefung|studium/.test(c))grund='uni'; else if(/familie|hochzeit|geburtstag|beerdigung|taufe/.test(c))grund='familie';
      else if(/zweite|2\. mannschaft|reserve/.test(c))grund='zweite'; else if(/ohne grund|unentschuldigt|ohne absage|nicht abgemeldet|ohne abmeldung|keine absage|einfach nicht/.test(c))grund='ohne';
      else if(/privat|termin/.test(c))grund='privat';
      if(!ps.length&&grund&&last.length&&last.every(p=>sp[p.id]&&sp[p.id].status==='weg'))ps=last;   // „X war nicht da, hatte Schicht“
      let mot=null, fit=null;
      if(/lustlos|unmotiviert|kein bock|keinen bock|null bock|faul|desinteressiert|schlecht drauf|genervt/.test(c))mot=/sehr|total|komplett|null bock/.test(c)?1:2;
      else if(/super motiviert|sehr motiviert|voll dabei|brennt|ueberragend|herausragend|top einstellung/.test(c))mot=5;
      else if(/motiviert|engagiert|gut drauf|stark|gut trainiert|fleissig|guten eindruck/.test(c))mot=4;
      if(/muede|platt|kaputt|erschoepft|schwere beine|ausgelaugt|angeschlagen/.test(c))fit=/sehr|total|komplett/.test(c)?1:2;
      else if(/fit\b|frisch|spritzig|topfit/.test(c)&&!back)fit=4;
      if(ps.length){
        for(const p of ps){
          if(back){ set(p,{status:'da'}); const i=(st&&st.injuries||[]).find(x=>x.p===p.id&&!x.z); if(i)close.push({injury_id:i.id,player_id:p.id,zurueck:datum,diagnose:i.dg}); continue; }
          if(absent||(grund&&grund!=='verletzt')||(grund==='verletzt'&&!/trotzdem|trainiert|dabei/.test(c))){ if(absent||grund)set(p,{status:'weg',grund:grund||'ohne'}); }
          else if(late)set(p,{status:'da',notiz:'zu spät'});
          if(mot)set(p,Object.assign({motivation:mot},sp[p.id]&&sp[p.id].status?{}:{status:'da'}));
          if(fit)set(p,Object.assign({fitness:fit},sp[p.id]&&sp[p.id].status?{}:{status:'da'}));
          if(grund==='verletzt'&&INJ.test(c)&&!(st&&st.injuries||[]).some(x=>x.p===p.id&&!x.z)){
            const raw=text.split(/[.;!\n]+/).find(x=>N(x).includes(N(p.name).split(' ').pop())||N(x).includes(N(p.name).split(' ')[0]))||c;
            let dg=(raw.match(/:\s*([^,.;()]{3,60})/)||raw.match(/\(\s*([^,.;()]{3,60})/)||raw.match(/(?:wegen|mit|hat sich|hat)\s+(?:einer|einem|einen|eine|ein|der|dem|den|die)?\s*([^,.;()]{3,60})/i)||[])[1]||'';
            dg=dg.replace(/^(sich\s+)?(verletzt|verletzung)\s*/i,'').replace(/\s*(zugezogen|eingefangen|verletzt)$/i,'').trim();
            if(!dg||!INJ.test(N(dg))&&dg.length<4)dg='Verletzung';
            const I=injuryInfo(raw), w=weeks(N(raw));
            inj.push({player_id:p.id,diagnose:dg.trim().replace(/^\w/,x=>x.toUpperCase()),art:I.art,koerperteil:I.koerperteil,beginn:datum,prognose:w?addDays(datum,w):null});
          }
        }
      } else {
        if(/laufintensiv|viel gelaufen|laeufe|ausdauer/.test(c))(session.fokus=session.fokus||[]).push('lauf');
        if(/taktik/.test(c))(session.fokus=session.fokus||[]).push('taktik');
        if(/torschuss|abschluss/.test(c))(session.fokus=session.fokus||[]).push('abschluss');
        if(/standard/.test(c))(session.fokus=session.fokus||[]).push('standards');
        if(/spielform|abschlussspiel|kleinfeld/.test(c))(session.fokus=session.fokus||[]).push('spielform');
        if(/athletik|kraft|stabi/.test(c))(session.fokus=session.fokus||[]).push('athletik');
        if(/regeneration|auslaufen|locker/.test(c)){ (session.fokus=session.fokus||[]).push('regeneration'); session.intensitaet=2; }
        if(/sehr intensiv|hart|knackig|brutal/.test(c))session.intensitaet=5; else if(/intensiv|laufintensiv/.test(c)&&!session.intensitaet)session.intensitaet=4;
        if(/sehr positiv|super training|top training|richtig gut|klasse|starke einheit/.test(c))session.stimmung=5;
        else if(/positiv|gut|ordentlich|zufrieden/.test(c)&&!/nicht gut/.test(c))session.stimmung=session.stimmung||4;
        else if(/zaeh|schlecht|mies|lustlos|unkonzentriert|enttaeuschend/.test(c))session.stimmung=2;
      }
    }
    if(session.fokus)session.fokus=[...new Set(session.fokus)];
    const actions=[];
    const spieler=Object.values(sp);
    if(spieler.length||Object.keys(session).length||restDa)actions.push({type:'training',input:Object.assign({datum,typ:'training',spieler,rest_da:restDa||spieler.some(x=>x.status==='weg')},session)});
    inj.forEach(i=>actions.push({type:'verletzung',input:i}));
    close.forEach(c=>actions.push({type:'verletzung_ende',input:c}));
    return {datum,actions,found:[...found],ambig:ambiguous(text,idx,[...found])};
  }
  /* einfache Fragen ohne KI */
  function answer(text,squad,st,today){
    const t=N(text), idx=nameIndex(squad), ps=findPlayers(t,idx);
    if(ps.length&&/fit|verletz|dabei|wieder|zurueck|training/.test(t)){
      return ps.map(p=>{ const s=playerStats(st,p.id,today); const i=s.injury;
        if(i)return `${p.name}: verletzt seit ${fmt(i.b)} (${i.dg})${i.pr?', Prognose '+fmt(i.pr)+(i.pr<today?' · überschritten':''):''}. ${s.lastSeen&&s.lastSeen>i.b?'War am '+fmt(s.lastSeen)+' wieder im Training.':'Seitdem nicht im Training.'}`;
        const last=s.injuries.find(x=>x.z); return `${p.name}: aktuell keine offene Verletzung${last?' (zuletzt '+last.dg+', zurück am '+fmt(last.z)+')':''}. Zuletzt im Training: ${s.lastSeen?fmt(s.lastSeen):'–'}. Beteiligung 4 Wochen: ${pct(s.rate28)}.`; }).join('\n');
    }
    if(/wer .*verletzt|verletzte|lazarett/.test(t)){ const L=squad.map(p=>({p,i:activeInjury(st,p.id,today)})).filter(x=>x.i); return L.length?'Aktuell verletzt:\n'+L.map(x=>`• ${x.p.name}: ${x.i.dg}${x.i.pr?' (Prognose '+fmt(x.i.pr)+')':''}`).join('\n'):'Aktuell ist niemand als verletzt eingetragen.'; }
    if(/beteiligung|wie viele|anwesenheit/.test(t)){ const T=teamStats(st,today,squad.map(p=>p.id)); return `Trainingsbeteiligung: letzte 3 Wochen ${pct(T.r21.rate)} (${T.r21.sessions} Einheiten), davor ${pct(T.prev.rate)}. Saison: ${pct(T.season.rate)}.`; }
    return null;
  }
  return {REASONS,FOKUS,ART,EXCUSE_NEUTRAL,iso,addDays,diffDays,fmt,rows,playerStats,teamStats,alerts,parse,answer,activeInjury,pct,N,nameIndex,findPlayers,parseDate,ambiguous};
})();

/* ---------- Scores, Veranstaltungen, Spiele, Allzeit & Meilensteine (rein rechnerisch, ohne DOM) ---------- */
const TRS=(function(){
  const T=TRC;
  const ROLES={aufbau:'Aufbau',abbau:'Abbau',theke:'Theke/Bedienen',kasse:'Kasse',grill:'Grill',kuechen:'Küche/Kuchen',orga:'Organisation',fahrdienst:'Fahrdienst',teilnahme:'Teilnahme',sonstiges:'Sonstiges'};
  const EART={kerwe:'Kerwe',heimspiel:'Heimspiel-Dienst',weihnachten:'Weihnachtsmarkt/-feier',arbeitseinsatz:'Arbeitseinsatz',turnier:'Turnier/Hallencup',saisonfeier:'Saisonauftakt/-abschluss',mannschaft:'Mannschaftsabend/-fahrt',jugend:'Jugend-Event',sonstiges:'Sonstiges'};
  const HSTAT={geholfen:'geholfen',zugesagt:'zugesagt',abgesagt:'abgesagt',nicht_erschienen:'nicht erschienen'};
  const CREDIT={arbeit:0.7,uni:0.7,urlaub:0.7,familie:0.7,privat:0.4,ohne:0,keine_antwort:0};
  const NUMW={ein:1,eine:1,einen:1,einmal:1,zwei:2,zweimal:2,doppelt:2,doppelpack:2,drei:3,dreimal:3,hattrick:3,dreierpack:3,vier:4,viermal:4,fuenf:5,sechs:6,sieben:7,acht:8,neun:9,zehn:10,zwoelf:12};
  const wHalf=(today,d,hl)=>Math.pow(0.5,Math.max(0,T.diffDays(today,d))/hl);
  const avg=a=>a.length?a.reduce((x,y)=>x+y,0)/a.length:null;
  const key=s=>T.N(s).replace(/[^a-z0-9]/g,'');

  /* ===== Trainings-Score (0–100) =====
     da = 1 · zu spät = 0,75 · entschuldigt (Arbeit, Uni, Urlaub, Familie) = 0,7 · privat = 0,4 · ohne Grund = 0
     verletzt, „in der Zweiten“ und längere Krankheit (≥ 2 Einheiten am Stück oder als Verletzung/Krankheit erfasst) zählen NICHT
     kurzfristig krank (einzelne Einheit) = 0,5. Gehäuft (≥ 3 in 90 Tagen) nur noch 0,2
     jüngere Einheiten zählen mehr (Halbwertszeit 45 Tage), Fenster 180 Tage; Motivation fließt zu 25 % ein */
  function trainingScore(st,pid,today){
    const R=T.rows(st,pid).filter(r=>{ const dd=T.diffDays(today,r.d); return dd>=0&&dd<=180; });
    const inj=(st&&st.injuries||[]).filter(i=>i.p===pid);
    const epi=new Map(); let cur=[];
    const flush=()=>{ if(cur.length){ const long=cur.length>=2||cur.some(r=>inj.some(i=>i.b<=r.d&&(!i.z||i.z>=r.d))); cur.forEach(r=>epi.set(r.d,long)); cur=[]; } };
    for(const r of [...R].reverse()){ if(r.st==='weg'&&r.g==='krank')cur.push(r); else if(r.st==='weg'&&r.g==='verletzt')continue; else flush(); }
    flush();
    const short90=R.filter(r=>r.st==='weg'&&r.g==='krank'&&!epi.get(r.d)&&T.diffDays(today,r.d)<=90).length;
    let sw=0, sa=0, n=0; const ex={verletzt:0,krank:0,zweite:0}, cnt={da:0,spaet:0,ohne:0,kurz:0,entsch:0};
    for(const r of R){
      let c;
      if(r.st==='da'){ c=1; cnt.da++; }
      else if(r.st==='spaet'){ c=0.75; cnt.spaet++; }
      else if(r.g==='verletzt'){ ex.verletzt++; continue; }
      else if(r.g==='zweite'){ ex.zweite++; continue; }
      else if(r.g==='krank'){ if(epi.get(r.d)){ ex.krank++; continue; } c=short90>=3?0.2:0.5; cnt.kurz++; }
      else { c=CREDIT[r.g]!=null?CREDIT[r.g]:0.5; if(r.g==='ohne')cnt.ohne++; else cnt.entsch++; }
      const w=wHalf(today,r.d,45); sw+=w; sa+=w*c; n++;
    }
    const mots=R.filter(r=>r.mot); let mw=0, ms=0; mots.forEach(r=>{ const w=wHalf(today,r.d,45); mw+=w; ms+=w*(r.mot-1)/4; });
    const att=sw?sa/sw:null, mot=mots.length>=2&&mw?ms/mw:null;
    const score=n>=4?Math.round(100*(mot==null?att:0.75*att+0.25*mot)):null;
    const why=[];
    if(n)why.push(`${cnt.da}× da${cnt.spaet?`, ${cnt.spaet}× zu spät`:''} · ${n} gewertete Einheiten (180 Tage)`);
    if(cnt.ohne)why.push(`${cnt.ohne}× ohne Grund gefehlt. Zählt voll`);
    if(cnt.kurz)why.push(`${cnt.kurz}× kurzfristig krank${short90>=3?' · gehäuft, zählt deshalb stärker':' · zählt halb'}`);
    if(cnt.entsch)why.push(`${cnt.entsch}× entschuldigt (Arbeit, Uni, Urlaub, Familie). Zählt leicht`);
    if(ex.verletzt||ex.krank)why.push(`${ex.verletzt+ex.krank}× verletzt oder länger krank. Zählt nicht`);
    if(ex.zweite)why.push(`${ex.zweite}× in der Zweiten. Zählt nicht`);
    if(mot!=null)why.push(`Motivation Ø ${(1+mot*4).toFixed(1)} von 5 (25 % Gewicht)`);
    if(n<4)why.push('Noch zu wenig Einheiten für einen Score (mind. 4)');
    return {score,att,mot,n,cnt,ex,shortSick:short90,why};
  }

  /* ===== Spiele (aus den Einheiten vom Typ „Spiel“) ===== */
  const games=st=>(st&&st.sessions||[]).filter(s=>s.t==='spiel');
  function matchStats(st,pid,since){
    const o={sp:0,start:0,joker:0,tore:0,vor:0,s:0,u:0,n:0,zuNull:0,kader:0,zuschauer:0};
    for(const g of games(st)){ if(since&&g.d<=since)continue; const a=(g.a||[]).find(x=>x[0]===pid); if(!a||a[1]==='weg')continue;
      if(a[1]==='bank'){ o.kader++; continue; } if(a[1]==='zuschauer'){ o.zuschauer++; continue; }   // im Kader ohne Einsatz / zugeschaut – kein Einsatz
      o.sp++; if(a[1]==='da')o.start++; else o.joker++; o.tore+=a[6]||0; o.vor+=a[7]||0;
      if(g.tw!=null&&g.tg!=null){ if(g.tw>g.tg)o.s++; else if(g.tw===g.tg)o.u++; else o.n++; if(g.tg===0)o.zuNull++; } }
    return o;
  }
  function teamForm(st){
    const G=games(st).filter(g=>g.tw!=null&&g.tg!=null).sort((a,b)=>a.d<b.d?1:-1);
    const res=G.map(g=>g.tw>g.tg?'S':g.tw===g.tg?'U':'N');
    let unbeaten=0; for(const r of res){ if(r==='N')break; unbeaten++; }
    let wins=0; for(const r of res){ if(r!=='S')break; wins++; }
    let clean=0; for(const g of G){ if(g.tg!==0)break; clean++; }
    let winless=0; for(const r of res){ if(r==='S')break; winless++; }
    const pts=res.reduce((a,r)=>a+(r==='S'?3:r==='U'?1:0),0);
    return {n:G.length,res,unbeaten,wins,clean,winless,ppg:G.length?pts/G.length:null,tf:G.reduce((a,g)=>a+g.tw,0),ta:G.reduce((a,g)=>a+g.tg,0),last:G[0]||null};
  }
  /* Moneyball „Mit/Ohne“: Punkte pro Spiel und Gegentore mit dem Spieler in der Startelf vs. ohne ihn */
  function withWithout(st,pid){
    const W={n:0,p:0,ga:0}, O={n:0,p:0,ga:0};
    for(const g of games(st)){ if(g.tw==null||g.tg==null)continue; const a=(g.a||[]).find(x=>x[0]===pid); const B=a&&a[1]==='da'?W:O;
      B.n++; B.p+=g.tw>g.tg?3:g.tw===g.tg?1:0; B.ga+=g.tg; }
    const f=x=>x.n?{n:x.n,ppg:x.p/x.n,ga:x.ga/x.n}:{n:0,ppg:null,ga:null};
    const w=f(W), o=f(O);
    return {with:w,without:o,delta:w.n>=3&&o.n>=3?w.ppg-o.ppg:null};
  }

  /* ===== Loyalität (0–100) =====
     55 % Helfereinsätze (Aufbau, Theke, Kasse …. Stunden zählen mit, jüngere mehr; „nicht erschienen“ zieht ab)
     30 % Vereinstreue (Pflichtspiele seit 2013/14 laut Vereinsstatistik + diese Saison; 200 Spiele = voll)
     15 % Teamgeist (Mannschaftsabende, -fahrten, Feiern) */
  function loyaltyScore(pid,events,allTime,gamesSince,today){
    let pts=0, soc=0, n=0, hours=0, noShow=0, last=null; const arts={};
    for(const e of events||[]){
      const dd=T.diffDays(today,e.d); if(dd<0||dd>730)continue;
      const h=(e.h||[]).find(x=>x[0]===pid); if(!h)continue;
      const w=Math.pow(0.5,dd/365), st=h[3]||'geholfen', hrs=h[2]!=null&&h[2]!==''?+h[2]:null, rollen=h[1]||[];
      if(e.a==='mannschaft'||(rollen.length===1&&rollen[0]==='teilnahme')){ if(st==='geholfen')soc+=w; if(st==='nicht_erschienen')noShow++; continue; }
      if(st==='geholfen'){ pts+=w*(2+Math.min(hrs==null?3:hrs,10)*0.5); n++; hours+=hrs||0; arts[e.a]=(arts[e.a]||0)+1; if(!last||e.d>last)last=e.d; }
      else if(st==='nicht_erschienen'){ pts-=w*2; noShow++; }
    }
    const help=pts<=0?0:1-Math.exp(-pts/10), social=1-Math.exp(-soc/3);
    const spiele=(allTime?allTime.spiele||0:0)+(gamesSince||0), ten=Math.min(1,spiele/200);
    const score=Math.round(100*(0.55*help+0.30*ten+0.15*social));
    const why=[];
    why.push(n?`${n} Helfereinsätze in 24 Monaten${hours?` · ${hours} Std.`:''}`:'Noch keine Helfereinsätze erfasst');
    if(Object.keys(arts).length)why.push('Bei: '+Object.entries(arts).map(([k,c])=>`${EART[k]||k}${c>1?' ('+c+'×)':''}`).join(', '));
    if(noShow)why.push(`${noShow}× trotz Zusage nicht erschienen. Zieht ab`);
    why.push(spiele?`${spiele} Pflichtspiele für den Verein${allTime&&allTime.stand?' (Statistik seit 2013/14 + diese Saison)':''}`:'Keine Pflichtspiele in der Vereinsstatistik');
    if(soc)why.push('Dabei bei Mannschaftsabenden/-fahrten');
    return {score,help,ten,social,n,hours,noShow,spiele,arts,last,why};
  }

  /* ===== Bindungsrisiko: Frühwarnung, wenn mehrere Signale zusammenkommen ===== */
  function retention(ts,ls,ps,eventsKnown){
    let r=0; const why=[];
    if(ps.rate28!=null&&ps.ratePrev!=null&&ps.ratePrev-ps.rate28>=0.25){ r+=2; why.push('Trainingsbeteiligung stark gesunken'); }
    if(ts&&ts.score!=null&&ts.score<55){ r++; why.push('niedriger Trainings-Score'); }
    if(ps.ohne28>=2){ r++; why.push('fehlt ohne Grund'); }
    const m3=ps.mot.slice(0,3).map(x=>x.v); if(m3.length>=2&&avg(m3)<=2.5){ r++; why.push('wirkt lustlos'); }
    if(eventsKnown&&ls&&ls.n===0&&ls.spiele<60){ r++; why.push('kaum im Vereinsleben verankert'); }
    return {risk:r,lvl:r>=4?'hoch':r>=3?'mittel':null,why};
  }

  /* ===== Allzeit-Statistik, Meilensteine, Abzeichen ===== */
  const MS_SP=[50,100,150,200,250,300,350,400,500], MS_T=[25,50,75,100,150,200], MS_A=[25,50,75,100];
  function allTimeIndex(rows,players,crm){
    const byKey=new Map(rows.map(r=>[r.key,r])), byPlayer=new Map(), used=new Map();
    for(const p of players){ const o=crm&&crm[p.id]&&crm[p.id].at, r=o&&byKey.get(o); if(r&&!used.has(r.key)){ byPlayer.set(p.id,r); used.set(r.key,p.id); } }
    for(const p of players){ if(byPlayer.has(p.id))continue; const r=byKey.get(key(p.name)); if(r&&!used.has(r.key)){ byPlayer.set(p.id,r); used.set(r.key,p.id); } }
    // Unschärfe: Umlaute auf der Vereinsseite teils als Leerzeichen („Pfl ger“), zweite Vornamen („Florian Kai Seltenreich“)
    const loose=s=>T.N(s).replace(/ss|ae|oe|ue/g,'').replace(/[^a-z]/g,'');
    const fl=s=>{ const w=T.N(s).replace(/[^a-z ]/g,' ').split(/\s+/).filter(Boolean); return w.length>1?loose(w[0])+'|'+loose(w[w.length-1]):null; };
    const uniq=f=>{ const m=new Map(); rows.forEach(r=>{ const k=f(r.name); if(!k)return; m.set(k,m.has(k)?null:r); }); return m; };
    const L1=uniq(loose), L2=uniq(fl);
    for(const [f,M] of [[loose,L1],[fl,L2]])for(const p of players){ if(byPlayer.has(p.id)||!p.own)continue; const k=f(p.name), r=k&&M.get(k); if(r&&!used.has(r.key)){ byPlayer.set(p.id,r); used.set(r.key,p.id); } }
    return {byKey,byPlayer,used};
  }
  function totals(row,ms){ // row: Vereinsstatistik; ms: matchStats seit Stand
    const sp=(row?row.spiele:0)+(ms?ms.sp:0), tore=(row?row.tore:0)+(ms?ms.tore:0), vor=(row?row.assists:0)+(ms?ms.vor:0), siege=(row?row.siege:0)+(ms?ms.s:0);
    const spq=(row?row.spiele:0)+(ms?(ms.spQ!=null?ms.spQ:ms.sp):0); // Quote nur über Spiele mit bekanntem Ergebnis
    return {sp,tore,vor,siege,quote:spq?Math.round(siege/spq*100):null};
  }
  function nextMilestones(tot){
    const out=[]; const nx=(L,v,lab)=>{ const m=L.find(x=>x>v); if(m!=null)out.push({lab,ziel:m,rest:m-v}); };
    nx(MS_SP,tot.sp,'Spiele'); nx(MS_T,tot.tore,'Tore'); nx(MS_A,tot.vor,'Vorlagen');
    return out.sort((a,b)=>a.rest-b.rest);
  }
  function badges(tot,rk){
    const b=[];
    if(tot.sp>=200||tot.tore>=75)b.push({k:'legende',t:'Vereinslegende',d:tot.sp>=200?`${tot.sp} Spiele`:`${tot.tore} Tore`});
    const cl=[500,400,300,250,200,150,100,50].find(x=>tot.sp>=x); if(cl)b.push({k:'club',t:cl+'er-Club',d:`${tot.sp} Pflichtspiele`});
    const tc=[200,150,100,75,50,25].find(x=>tot.tore>=x); if(tc)b.push({k:'tore',t:tc+' Tore',d:`${tot.tore} Tore insgesamt`});
    if(tot.vor>=25)b.push({k:'vorlagen',t:'Vorlagengeber',d:`${tot.vor} Vorlagen`});
    if(tot.sp>=50&&tot.quote>=55)b.push({k:'sieger',t:'Siegertyp',d:`${tot.quote} % Siege`});
    if(rk&&rk.sp&&rk.sp<=10)b.push({k:'top',t:`Top ${rk.sp<=3?3:10} Einsätze`,d:`Platz ${rk.sp} ewige Einsatzliste`});
    if(rk&&rk.tore&&rk.tore<=10)b.push({k:'top',t:`Top ${rk.tore<=3?3:10} Torschützen`,d:`Platz ${rk.tore} ewige Torjägerliste`});
    return b;
  }

  /* ===== Freitext: Veranstaltungen & Helfer ===== */
  const EV_RX=[['kerwe',/kerwe|kirchweih/],['weihnachten',/weihnachtsmarkt|weihnachtsfeier(?! der mannschaft)|weihnacht/],['turnier',/turnier|hallencup|papurex|\bcup\b/],
    ['heimspiel',/heimspiel|spieltagsdienst|bewirtung|kiosk|sportheimdienst|heimspieltag/],['arbeitseinsatz',/arbeitseinsatz|arbeitsdienst|platzpflege|renovier|aufraeum|streichaktion/],
    ['saisonfeier',/saisonabschluss|saisonauftakt|sommerfest|jubilaeum|jahrfeier|vereinsfest/],['mannschaft',/mannschaftsabend|teamabend|grillabend|mannschaftsfahrt|abschlussfahrt|teamevent|ausflug/],
    ['jugend',/jugendturnier|fussballcamp|feriencamp|jugendtag/]];
  const ROLE_RX=[['aufbau',/aufbau|aufgebaut|aufbauen/],['abbau',/abbau|abgebaut|abbauen/],['theke',/theke|ausschank|bedien|getraenk|\bbar\b|zapf/],['kasse',/kasse|eintritt|kassiert/],
    ['grill',/grill/],['kuechen',/kueche|kuchen|essen|salat|pommes|kochen|waffel/],['orga',/orga|organis|planung|geplant/],['fahrdienst',/fahrdienst|gefahren|transport/]];
  const HELP=/geholfen|mitgeholfen|helfer|dienst|aufbau|abbau|aufgebaut|abgebaut|theke|bedien|kasse|grill|kueche|kuchen|orga|dabei|mitgemacht|einsatz|ausschank|stunden|teilgenommen|zugesagt|abgesagt|nicht erschienen|gearbeitet/;
  const hoursOf=c=>{ const m=c.match(/(\d+(?:[.,]\d)?)\s*(stunden|std|h)\b/); if(m)return +m[1].replace(',','.');
    const m2=c.match(/\b(ein|eine|zwei|drei|vier|fuenf|sechs|sieben|acht|neun|zehn|zwoelf)\s*(stunden|std)\b/); if(m2)return NUMW[m2[1]];
    if(/ganzen tag|ganztags/.test(c))return 8; if(/halben tag/.test(c))return 4; return null; };
  function parseEvent(text,people,today){
    const t0=T.N(text); let art=null; for(const [k,rx] of EV_RX){ if(rx.test(t0)){ art=k; break; } }
    if(!art||!HELP.test(t0))return null;
    const idx=T.nameIndex(people), datum=T.parseDate(t0,today);
    const segs=t0.split(/[.;!\n]+|,|\bund dann\b/).map(s=>s.trim()).filter(Boolean);
    const H={}; let pend=[], pendRoles=[];
    const je=(t0.match(/\bje(?:weils)?\s+(\d+(?:[.,]\d)?)\s*(?:stunden|std|h)\b/)||[])[1];
    const put=(ps,roles,hrs,status)=>ps.forEach(p=>{ const o=H[p.id]=H[p.id]||{person:p.id,rollen:[],stunden:null,status:'geholfen'}; roles.forEach(r=>{ if(!o.rollen.includes(r))o.rollen.push(r); }); if(hrs!=null)o.stunden=hrs; if(status)o.status=status; });
    for(const c of segs){
      const ps=T.findPlayers(c,idx), roles=ROLE_RX.filter(([,rx])=>rx.test(c)).map(([k])=>k), hrs=/\bje/.test(c)?null:hoursOf(c);
      const status=/nicht erschienen|nicht gekommen|trotz zusage|nicht aufgetaucht|ist nicht aufgetaucht/.test(c)?'nicht_erschienen':/abgesagt/.test(c)?'abgesagt':(/zugesagt|eingeteilt|wird helfen|kommt zum/.test(c)&&!/geholfen/.test(c))?'zugesagt':null;
      if(ps.length&&!roles.length&&!status&&hrs==null&&!pendRoles.length){ pend.push(...ps); continue; }
      if(!ps.length&&roles.length){ pendRoles=roles; if(pend.length){ put(pend,roles,null,null); pend=[]; pendRoles=[]; } continue; }
      if(ps.length){ put([...pend,...ps],roles.length?roles:pendRoles,hrs,status); pend=[]; pendRoles=[]; }
      else if(hrs!=null&&Object.keys(H).length){ Object.values(H).forEach(o=>{ if(o.stunden==null)o.stunden=hrs; }); }
    }
    if(pend.length)put(pend,[],null,null);
    if(je!=null)Object.values(H).forEach(o=>{ if(o.stunden==null)o.stunden=+String(je).replace(',','.'); });
    if(art==='mannschaft')Object.values(H).forEach(o=>{ if(!o.rollen.length)o.rollen=['teilnahme']; });
    const helfer=Object.values(H);
    const nm=(text.match(/(?:beim|bei der|beim|auf der|am)\s+([A-ZÄÖÜ][\wäöüß-]+(?:\s[A-ZÄÖÜ0-9][\wäöüß-]+)?)/)||[])[1];
    const titel=nm&&EV_RX.some(([k,rx])=>k===art&&rx.test(T.N(nm)))?nm:EART[art];
    return {action:{type:'veranstaltung',input:{datum,titel,art,helfer}},ambig:T.ambiguous(text,idx,helfer.map(h=>h.person))};
  }

  function eventArt(t){ const n=T.N(t); for(const [k,rx] of EV_RX){ if(rx.test(n))return k; } return 'sonstiges'; }
  function roleOf(t){ const n=T.N(t); return ROLE_RX.filter(([,rx])=>rx.test(n)).map(([k])=>k); }

  /* ===== Freitext: Spiel mit Ergebnis, Toren und Vorlagen ===== */
  function parseMatch(text,squad,today){
    const t0=T.N(text); const m=t0.match(/\b(\d{1,2})\s*[:\-]\s*(\d{1,2})\b/);
    if(!m||!/gegen|spiel|gewonnen|verloren|unentschieden|remis|\bsieg|niederlage|auswaerts|heimspiel/.test(t0))return null;
    let a=+m[1], b=+m[2];
    if(/verloren|niederlage/.test(t0)&&a>b)[a,b]=[b,a];
    if(/gewonnen|\bsieg\b|gesiegt/.test(t0)&&a<b)[a,b]=[b,a];
    const gm=text.match(/gegen\s+(?:den |die |das |die zweite von |)([A-Za-zÄÖÜäöüß0-9./ -]{2,40}?)(?=\s*(?:\d|,|\.|!|;|\(|$|\s(?:mit|zu|und|gewonnen|verloren|unentschieden|gespielt|remis)\b))/i);
    const heim=/zuhause|zu hause|daheim|heimspiel|\bheim\b/.test(t0)?true:/auswaerts/.test(t0)?false:null;
    const idx=T.nameIndex(squad), sp={};
    const add=(p,k,v)=>{ const o=sp[p.id]=sp[p.id]||{player_id:p.id,status:'da'}; o[k]=(o[k]||0)+v; };
    const cnt=s=>{ const d=s.match(/\b(\d{1,2})\s*(?:x|mal|tore|treffer|buden)?\b/); if(d)return +d[1]; for(const k in NUMW){ if(new RegExp('\\b'+k+'\\b').test(s))return NUMW[k]; } return 1; };
    const clauses=t0.replace(m[0],' ').split(/[.;!\n]+/).map(s=>s.trim()).filter(Boolean);
    for(const c of clauses){
      let mode=/vorlage|assist|aufgelegt|vorbereitet/.test(c)&&!/tor|treffer|getroffen|traf/.test(c)?'vorlagen':/\btor|tore|treffer|getroffen|\btraf|trifft|doppelpack|hattrick|genetzt|buden/.test(c)?'tore':null;
      if(!mode)continue;
      for(const it of c.split(/,|\bund\b|\bsowie\b/)){
        if(/vorlage|assist|aufgelegt|vorbereitet/.test(it))mode='vorlagen'; else if(/\btor|tore|treffer|getroffen|\btraf|doppelpack|hattrick/.test(it))mode=mode==='vorlagen'&&!/tor|treffer|getroffen|traf|doppelpack|hattrick/.test(it)?'vorlagen':'tore';
        const ps=T.findPlayers(it,idx); if(!ps.length)continue;
        const n=ps.length===1?cnt(it.replace(/\b(19|20)\d\d\b/g,'')):1;
        ps.forEach(p=>add(p,mode,n));
      }
    }
    const spieler=Object.values(sp);
    const tt=spieler.reduce((x,s)=>x+(s.tore||0),0);
    return {action:{type:'spiel',input:{datum:T.parseDate(t0,today),gegner:gm?gm[1].trim():null,heim,tore_wir:a,tore_gegner:b,spieler}},warn:tt>a?`Mehr Torschützen (${tt}) als eigene Tore (${a}), bitte prüfen.`:null,ambig:T.ambiguous(text,idx,spieler.map(s=>s.player_id))};
  }

  /* ===== WhatsApp-Export (Mannschaftsgruppe) → Zu-/Absagen fürs Training =====
     Zeilen wie „[23.09.26, 18:02:11] Tim Fries: Bin heute raus, Arbeit“ oder „23.09.26, 18:02 - Tim Fries: bin dabei 👍“ */
  const WA=/^‎?\[?(\d{1,2})[./](\d{1,2})[./](\d{2,4}),?\s+(\d{1,2}):(\d{2})(?::\d{2})?\s*(?:[AP]M)?\]?\s*(?:-\s*)?([^:]{2,60}?):\s?(.*)$/;
  function isWhatsApp(text){ const L=String(text||'').split(/\r?\n/).slice(0,60); return L.filter(l=>WA.test(l)).length>=3; }
  function parseWhatsApp(text,people,today,days){
    const idx=T.nameIndex(people), msgs=[]; let cur=null;
    for(const line of String(text||'').split(/\r?\n/)){
      const m=line.match(WA);
      if(m){ const y=m[3].length===2?'20'+m[3]:m[3]; cur={d:`${y}-${m[2].padStart(2,'0')}-${m[1].padStart(2,'0')}`,h:+m[4],who:m[6].replace(/^~\s*/,'').trim(),t:m[7]}; msgs.push(cur); }
      else if(cur&&line.trim())cur.t+='\n'+line;
    }
    const since=T.addDays(today,-(days||21)), byDay={};
    let used=0;
    for(const m of msgs){
      if(m.d<since||m.d>today)continue;
      const t=T.N(m.t); if(/weggelassen|omitted|geloescht|deleted|ausgeschlossen/.test(t))continue;
      if(/\bwer (ist|kommt|kann|fehlt)|\?\s*$/.test(t.trim()))continue;              // Fragen („wer ist dabei?“) sind keine Zusagen
      const who=T.findPlayers(T.N(m.who).replace(/[^a-z0-9 ]/g,' '),idx), sender=who.length===1?who[0]:null;
      const named=T.findPlayers(t.replace(/[^a-z0-9 ]/g,' '),idx).filter(p=>!sender||p.id!==sender.id);
      const absent=/(bin|komme|kann|schaff|pack)\w*\s+(es\s+)?(heute\s+|morgen\s+|leider\s+)*(nicht|net|nich)\b|absage|sage ab|nicht dabei|bin raus|fall(e)? aus|raus heute|heute raus|klappt nicht|wird nix|❌|👎/.test(t)||/❌|👎/.test(m.t);
      const present=!absent&&(/bin dabei|bin da\b|komme\b|dabei\b|bin am start|👍|✅|💪/.test(t)||/👍|✅|💪/.test(m.t));
      const late=/spaeter|verspaet|komme spaet|min spaeter|etwas spaet/.test(t);
      if(!absent&&!present&&!late)continue;
      let d=m.d; if(/\bmorgen\b/.test(t))d=T.addDays(m.d,1);
      if(d>today)continue;
      let grund='privat';
      if(/verletz|zerrung|knie|bruch|umgeknickt/.test(t))grund='verletzt'; else if(/krank|grippe|erkaelt|fieber|magen|infekt/.test(t))grund='krank';
      else if(/arbeit|schicht|arbeiten|dienst|job|meeting|termin auf der arbeit/.test(t))grund='arbeit'; else if(/urlaub|verreist|ferien/.test(t))grund='urlaub';
      else if(/uni|schule|klausur|pruefung|vorlesung/.test(t))grund='uni'; else if(/familie|hochzeit|geburtstag|beerdigung|kind/.test(t))grund='familie';
      else if(/zweite|2\. mannschaft/.test(t))grund='zweite';
      const who2=named.length&&/(\bund\b|auch|kommt nicht|kommen nicht|kann nicht|ist raus|sind raus)/.test(t)?named:[];
      const targets=[...(sender?[sender]:[]),...who2];
      if(!targets.length)continue;
      const D=byDay[d]=byDay[d]||{};
      for(const p of targets){ D[p.id]=absent?{player_id:p.id,status:'weg',grund,notiz:m.t.slice(0,160)}:late?{player_id:p.id,status:'da',notiz:'zu spät'}:(D[p.id]&&D[p.id].status==='weg'?D[p.id]:{player_id:p.id,status:'da'}); }
      used++;
    }
    const actions=Object.keys(byDay).sort().map(d=>({type:'training',input:{datum:d,typ:'training',spieler:Object.values(byDay[d]),rest_da:false}}));
    return {actions,messages:msgs.length,used};
  }

  return {ROLES,EART,HSTAT,key,isWhatsApp,parseWhatsApp,trainingScore,matchStats,teamForm,withWithout,loyaltyScore,retention,allTimeIndex,totals,nextMilestones,badges,parseEvent,parseMatch,eventArt,roleOf,hoursOf,MS_SP,MS_T};
})();

/* =====================================================================
   SV/BSC Scout · Runde 7: Training (App in der App) + Co-Trainer
   - Einheiten & Anwesenheit mit Gründen, Motivation & Fitness je Spieler
   - Verletzungen mit Verlauf, Prognose und „wieder fit“
   - Tendenz-Warnungen, Rückfragen vor dem Spieltag, Aufstellungs-Hinweise
   - Co-Trainer-Chat mit Spracheingabe; mit KI-Schlüssel versteht er freie Sätze & Fragen
   Rechte: Trainer = Kaderplaner. Training & Verletzungen sehen nur Admin, Vorstand, Kaderplaner, Trainer.
   ===================================================================== */
function canEdit(){ const r=svRole(); return r==='admin'||r==='vorstand'||r==='planer'||r==='trainer'; }
function canWriteField(k){ return canEdit(); }
function canContacts(){ return canEdit(); }
function canTraining(){ return canEdit(); }
SV_PAGES.training=['Training','Anwesenheit, Fitness, Verletzungen, und dein Co-Trainer'];
{ const _ta=svTabAllowed; svTabAllowed=function(t){ if(t==='training')return canTraining(); return _ta.apply(this,arguments); }; }
Object.assign(SV_ROLE_INFO.trainer,{t:'Trainer',d:'Wie die Kaderplaner, mit Fokus Training',yes:['Alles sehen & bearbeiten','Training, Fitness & Verletzungen','Kandidaten & Aufstellung','Co-Trainer'],no:['Nutzerverwaltung']});
Object.assign(SV_ROLE_INFO.planer,{yes:['Kandidaten & Kontakte pflegen','Kaderplan & Aufstellung','Training & Verletzungen','Co-Trainer']});

const TR={st:{sessions:[],injuries:[]},loaded:false,loading:null,view:'home',ai:null,chat:[],chatBusy:false,greeted:false};
const TR_POS=['TW','IV','AV','ZM','OM','Flügel','ST'];
function trToday(){ return todayISO(); }
function trSquad(){
  const inAtt=new Set(); TR.st.sessions.forEach(s=>(s.a||[]).forEach(a=>inAtt.add(a[0])));
  return players.filter(p=>p.own&&!p.isJugend&&!p.verzicht&&(p.kader===1||inAtt.has(p.id)))
    .sort((a,b)=>(TR_POS.indexOf(a.pos)-TR_POS.indexOf(b.pos))||(a.kader||1)-(b.kader||1)||a.name.localeCompare(b.name,'de'));
}
function trP(id){ return players.find(p=>p.id===id); }
function trName(id){ const p=trP(id); return p?p.name:id; }
function trShort(id){ const p=trP(id); if(!p)return id; const w=p.name.split(' '); return w.length>1?w[0][0]+'. '+w.slice(1).join(' '):p.name; }
async function trLoad(force){
  if(!canTraining())return; if(TR.loading&&!force)return TR.loading;
  TR.loading=(async()=>{
    try{ const {data,error}=await SVB.sb.rpc('training_state',{p_since:TRC.addDays(trToday(),-560)}); if(error)throw error;
      if(data){ TR.st={sessions:data.sessions||[],injuries:(data.injuries||[]).map(i=>Object.assign(i,{id:String(i.id)}))}; TR.loaded=true; } }
    catch(e){ console.warn('Training laden',e); }
    try{ const {data}=await SVB.sb.rpc('ai_status'); TR.ai=data||{ready:false}; }catch(e){ TR.ai={ready:false}; }
    TR.loading=null; trAfter();
  })();
  return TR.loading;
}
function trAfter(){ try{ if(document.querySelector('#panel-training.active'))trRender(); }catch(e){} try{trHomeCard();}catch(e){} try{ if(document.querySelector('#panel-elf.active'))renderLineup(); }catch(e){} trBadge(); }
function trAlerts(){ return TR.loaded?TRC.alerts(TR.st,trSquad().map(p=>({id:p.id,name:p.name})),trToday()):[]; }
function trBadge(){ const n=trAlerts().filter(a=>a.lvl!=='info').length; document.querySelectorAll('[data-cnt="training"]').forEach(el=>{ el.textContent=n; el.style.display=n?'':'none'; }); }
function trInjury(pid){ return TR.loaded?TRC.activeInjury(TR.st,pid,trToday()):null; }
function trSessionOn(d,typ){ return TR.st.sessions.find(s=>s.d===d&&s.t===(typ||'training')); }

/* ---------- Speichern ---------- */
async function trSaveSession(p){ const {data,error}=await SVB.sb.rpc('training_save',{p}); if(error)throw new Error(error.message); await trLoad(true); return data; }
async function trSaveInjury(i){
  const row={player_id:i.player_id,diagnose:String(i.diagnose||'Verletzung').slice(0,200),art:i.art||null,koerperteil:i.koerperteil||null,beginn:i.beginn,prognose:i.prognose||null,zurueck:i.zurueck||null,notiz:i.notiz||null};
  const q=i.id?SVB.sb.from('injuries').update(row).eq('id',i.id):SVB.sb.from('injuries').insert(row);
  const {error}=await q; if(error)throw new Error(/check/.test(error.message)?'Datum passt nicht (Rückkehr/Prognose vor Beginn?)':error.message); await trLoad(true);
}
async function trCloseInjury(id,date){ const {error}=await SVB.sb.from('injuries').update({zurueck:date}).eq('id',id); if(error)throw new Error(error.message); await trLoad(true); }
async function trDeleteSession(id){ const {error}=await SVB.sb.from('training_sessions').delete().eq('id',id); if(error)throw new Error(error.message); await trLoad(true); }
async function trDeleteInjury(id){ const {error}=await SVB.sb.from('injuries').delete().eq('id',id); if(error)throw new Error(error.message); await trLoad(true); }

/* ---------- kleine Bausteine ---------- */
const trPct=v=>v==null?'–':Math.round(v*100)+'%';
function trRateCls(v){ return v==null?'':v>=0.8?'ok':v>=0.6?'mid':'bad'; }
function trDots(vals,max){ return `<span class="trdots">${vals.slice(0,8).reverse().map(v=>`<i class="v${v}" title="${v}/5"></i>`).join('')}</span>`; }
function trSpark(weeks){
  const W=weeks, w=260, h=56, bw=w/W.length;
  return `<svg class="trspark" viewBox="0 0 ${w} ${h+14}" preserveAspectRatio="none" role="img" aria-label="Trainingsbeteiligung je Woche">${W.map((x,i)=>{ const v=x.rate==null?0:x.rate, bh=Math.max(2,v*h);
    return `<g><rect x="${i*bw+3}" y="${h-bh}" width="${bw-6}" height="${bh}" rx="3" class="${x.rate==null?'na':trRateCls(x.rate)}"><title>KW ab ${TRC.fmt(x.from)}: ${x.rate==null?'kein Training':trPct(x.rate)}</title></rect>${i%3===0?`<text x="${i*bw+bw/2}" y="${h+12}" text-anchor="middle">${TRC.fmt(x.from).slice(0,5)}</text>`:''}</g>`; }).join('')}</svg>`;
}
function trAlertHtml(a,compact){
  const ask=a.ask?(a.ask.type==='fit'?`<div class="tra-q"><button class="btn sm" data-q-fit="${a.ask.injury}">Ja, wieder fit</button><button class="btn ghost sm" data-q-prog="${a.ask.injury}">Noch nicht · +1 Woche</button></div>`
    :a.ask.type==='close'?`<div class="tra-q"><button class="btn sm" data-q-close="${a.ask.injury}" data-date="${a.ask.date}">Verletzung abschließen</button></div>`:''):'';
  return `<div class="tra l-${a.lvl}">${a.pid?`<span class="tra-av" data-svp="${svEsc(a.pid)}">${avaHtml(trP(a.pid)||{name:'?',id:''})}</span>`:`<span class="tra-av team">${SVI('kand')}</span>`}
    <div class="tra-b"><b ${a.pid?`data-svp="${svEsc(a.pid)}"`:''}>${svEsc(a.t)}</b><span>${svEsc(a.d)}</span>${compact?'':ask}</div></div>`;
}
function trWireAlerts(root){
  root.querySelectorAll('[data-svp]').forEach(x=>x.onclick=()=>openModal(x.dataset.svp));
  root.querySelectorAll('[data-q-fit]').forEach(b=>b.onclick=async()=>{ b.disabled=true; try{ await trCloseInjury(b.dataset.qFit,trToday()); kToast('✓ Als wieder fit eingetragen'); }catch(e){ kToast('⚠️ '+e.message); } });
  root.querySelectorAll('[data-q-close]').forEach(b=>b.onclick=async()=>{ b.disabled=true; try{ await trCloseInjury(b.dataset.qClose,b.dataset.date); kToast('✓ Verletzung abgeschlossen'); }catch(e){ kToast('⚠️ '+e.message); } });
  root.querySelectorAll('[data-q-prog]').forEach(b=>b.onclick=async()=>{ const i=TR.st.injuries.find(x=>x.id===b.dataset.qProg); if(!i)return; b.disabled=true;
    try{ await trSaveInjury({id:i.id,player_id:i.p,diagnose:i.dg,art:i.art,koerperteil:i.kt,beginn:i.b,prognose:TRC.addDays(i.pr&&i.pr>trToday()?i.pr:trToday(),7),notiz:i.n}); kToast('✓ Prognose um eine Woche verlängert'); }catch(e){ kToast('⚠️ '+e.message); } });
}

/* ---------- Training-Panel ---------- */
function trRender(){
  const P=document.getElementById('panel-training'); if(!P)return;
  if(!canTraining()){ P.innerHTML='<div class="card"><div class="empty">Training sehen nur Trainer, Kaderplaner und Vorstand.</div></div>'; return; }
  if(!TR.loaded){ P.innerHTML='<div class="card"><div class="empty">Lade Trainingsdaten …</div></div>'; trLoad(); return; }
  const V=TR.view, tabs=[['home','Übersicht'],['sessions','Einheiten'],['players','Spieler'],['games','Spiele'],['injuries','Verletzungen']];
  P.innerHTML=`<div class="trtop">
      <div class="trtabs">${tabs.map(([k,t])=>`<button class="${V===k?'on':''}" data-trv="${k}">${t}</button>`).join('')}</div>
      <div class="tract"><button class="btn" data-tr-new>${SVI('plus')} Training erfassen</button><button class="btn ghost" data-tr-game>${SVI('plus')} Spiel</button><button class="btn ghost" data-tr-inj>${SVI('plus')} Verletzung</button><button class="btn ghost" data-tr-chat>${SVI('chat')} Co-Trainer</button></div></div>
    <div id="trBody"></div>`;
  P.querySelectorAll('[data-trv]').forEach(b=>b.onclick=()=>{ TR.view=b.dataset.trv; trRender(); });
  P.querySelector('[data-tr-new]').onclick=()=>trSessionEditor(trToday());
  P.querySelector('[data-tr-inj]').onclick=()=>trInjuryEditor(null);
  P.querySelector('[data-tr-game]').onclick=()=>trSessionEditor(trToday(),null,'spiel');
  P.querySelector('[data-tr-chat]').onclick=()=>trChatOpen();
  const B=document.getElementById('trBody');
  ({home:trViewHome,sessions:trViewSessions,players:trViewPlayers,games:(b)=>trViewGames(b),injuries:trViewInjuries})[V](B);
}
function trViewHome(B){
  const sq=trSquad(), today=trToday(), T=TRC.teamStats(TR.st,today,sq.map(p=>p.id)), al=trAlerts();
  const inj=sq.map(p=>({p,i:trInjury(p.id)})).filter(x=>x.i);
  const trend=T.r21.rate!=null&&T.prev.rate!=null?T.r21.rate-T.prev.rate:null;
  const last=TR.st.sessions.find(s=>s.t==='training');
  const todayS=trSessionOn(today);
  const empty=!TR.st.sessions.length;
  B.innerHTML=`
    ${empty?`<div class="card trhero"><div><h3>Los geht's mit dem Training</h3><p>Nach jeder Einheit kurz eintragen, wer da war, oder dem Co-Trainer einfach sagen: <em>„Max und Tim waren heute nicht da, Tom hat eine Zerrung.“</em> Ab 3–4 Einheiten erkennt die App Tendenzen und warnt früh.</p></div>
      <div class="btnrow"><button class="btn" data-tr-new2>${SVI('plus')} Heutiges Training erfassen</button><button class="btn ghost" data-tr-chat2>${SVI('chat')} Co-Trainer ausprobieren</button></div></div>`:''}
    <div class="tiles trtiles">
      <div class="tile"><div class="v ${trRateCls(T.r21.rate)}">${trPct(T.r21.rate)}</div><div class="l">Beteiligung · 3 Wochen</div><div class="s">${trend==null?(T.r21.sessions+' Einheiten'):`<b class="${trend>=0?'ok':'bad'}">${trend>=0?'▲':'▼'} ${Math.abs(Math.round(trend*100))} Pkt.</b> ggü. davor`}</div></div>
      <div class="tile"><div class="v">${T.season.sessions}</div><div class="l">Einheiten · 12 Monate</div><div class="s">Saison-Beteiligung ${trPct(T.season.rate)}</div></div>
      <div class="tile"><div class="v ${inj.length?'bad':''}">${inj.length}</div><div class="l">Aktuell verletzt</div><div class="s">${inj.length?svEsc(inj.slice(0,2).map(x=>x.p.name.split(' ').pop()).join(', '))+(inj.length>2?' …':''):'alle an Bord'}</div></div>
      <div class="tile"><div class="v ${al.some(a=>a.lvl==='hoch')?'bad':''}">${al.filter(a=>a.lvl!=='info').length}</div><div class="l">Hinweise</div><div class="s">${last?'letzte Einheit '+TRC.fmt(last.d):'noch keine Einheit'}</div></div>
    </div>
    <div class="trgrid">
      <div class="card"><h3 class="trh">${SVI('bell')} Co-Trainer-Hinweise</h3>${al.length?al.slice(0,8).map(a=>trAlertHtml(a)).join(''):'<div class="note">Keine Auffälligkeiten. Die App schaut auf Beteiligung, Fehlen ohne Grund, Motivation, Fitness und Verletzungs-Prognosen.</div>'}</div>
      <div class="card"><h3 class="trh">${SVI('chart')} Trainingsbeteiligung je Woche</h3>${trSpark(T.weeks)}
        <div class="note">Verletzt, krank und „in der Zweiten“ zählen nicht gegen die Beteiligung.</div>
        ${todayS?`<div class="trtoday">${SVI('check')} Heute erfasst: ${(todayS.a||[]).filter(a=>a[1]!=='weg').length} da · ${(todayS.a||[]).filter(a=>a[1]==='weg').length} fehlen <button class="btn ghost sm" data-edit-s="${todayS.id}">Bearbeiten</button></div>`:''}</div>
    </div>
    ${trMatchdayHtml()}
    <div class="card"><h3 class="trh">${SVI('shield')} Lazarett</h3>${inj.length?`<div class="trinjl">${inj.map(({p,i})=>trInjRow(p,i)).join('')}</div>`:'<div class="note">Niemand verletzt eingetragen.</div>'}</div>`;
  const q=s=>B.querySelector(s);
  if(q('[data-tr-new2]'))q('[data-tr-new2]').onclick=()=>trSessionEditor(today);
  if(q('[data-tr-chat2]'))q('[data-tr-chat2]').onclick=()=>trChatOpen();
