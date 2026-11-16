      const {data:s,error:e2}=await SVB.sb.from('studio_folien').select('html,version,label,notiz,skip,master_id').eq('id',fid).single(); if(e2)throw e2;
      const t=document.createElement('template'); t.innerHTML=s.html||'<section></section>'; const sec=t.content.firstElementChild;
      ops.forEach(o=>{ try{ stOpAnwenden(sec,o); }catch(x){} });
      const html=sec.outerHTML, upd=Object.assign({html},felder());
      const r=await SVB.sb.from('studio_folien').update(upd).eq('id',fid).eq('version',s.version).select('version');
      if(r.error)throw r.error;
      if(r.data&&r.data.length){ ST.basis.set(fid,r.data[0].version); ['label','notiz','skip','master_id'].forEach(k=>{ if(!meta.has(k))f[k]=s[k]; });
        const vorher=f.html; f.html=html; if(ST.folien[ST.cur]&&ST.folien[ST.cur].id===fid&&vorher!==html&&!ST.edit)stCanvas(true); stThumb(ST.folien.indexOf(f)); return; }
    }
    throw new Error('Folie wird gerade von anderen geändert, neuer Versuch gleich');
  }catch(e){ const q=ST.q.get(fid)||[]; ST.q.set(fid,ops.concat(q)); meta.forEach(k=>{ (f.meta=f.meta||new Set()).add(k); }); throw e; } }
function stMeta(f,k,v){ f[k]=v; (f.meta=f.meta||new Set()).add(k); stSpeichernBald(); }
function stStatus(z){ const el=document.getElementById('stStat'); if(!el)return; const offen=(ST.alle||ST.folien).some(f=>(ST.q.get(f.id)||[]).length||(f.meta&&f.meta.size));
  z=z||(ST.speichert?'speichert':offen?'ungespeichert':'ok');
  el.className='st-stat '+z; el.textContent={ok:'Gespeichert',speichert:'Speichert …',ungespeichert:'Änderungen …',fehler:'Nicht gespeichert, neuer Versuch …'}[z]||''; }
window.addEventListener('beforeunload',e=>{ if(ST.p&&(ST.alle||ST.folien).some(f=>(ST.q.get(f.id)||[]).length)){ stSpeichernJetzt(); e.preventDefault(); e.returnValue=''; } });

/* ---------- Editor-Gerüst ---------- */
function stEditorRender(){
  const P=stPanel(); if(!P||!ST.p)return; const kann=stKann(), p=ST.p;
  P.innerHTML=`<div class="st-ed${kann?'':' st-nur'}">
    <div class="st-top">
      <button type="button" class="iconbtn" id="stZur" title="Zur Projektliste">${SVI('chev')}</button>
      <input class="st-titel" id="stTitel" value="${stE(p.titel)}" ${kann?'':'readonly'} aria-label="Titel">
      <span class="st-stat ok" id="stStat">Gespeichert</span>
      <span class="sp"></span>
      <span class="st-live" id="stLive"></span>
      ${kann?`<button type="button" class="iconbtn" id="stUndo" title="Rückgängig (Strg+Z)">↶</button><button type="button" class="iconbtn" id="stRedo" title="Wiederholen (Strg+Umschalt+Z)">↷</button>
      <button type="button" class="btn sm ghost" id="stBau">${SVI('plus')} Bausteine</button><button type="button" class="btn sm ghost" id="stMed2">${SVI('layers')} Medien</button><button type="button" class="btn sm ghost" id="stKi">✦ KI</button>`:''}
      <button type="button" class="btn sm ghost" id="stKom">${SVI('chat')} Kommentare</button>
      ${kann?`<button type="button" class="btn sm ghost" id="stVer">${SVI('clock')} Versionen</button>`:''}
      <button type="button" class="btn sm ghost" id="stExp">${SVI('download')} Export</button>
      <button type="button" class="btn sm" id="stPraes">▶ Präsentieren</button>
    </div>
    <div class="st-main">
      <aside class="st-side"><div class="st-fl" id="stFl"></div>${kann?`<button type="button" class="btn sm ghost st-neuf" id="stNeuF">${SVI('plus')} Folie</button>`:''}</aside>
      <div class="st-mitte">
        <div class="st-tools" id="stTools"></div>
        <div class="st-canvas" id="stCanvas"><div class="st-buehne" id="stBuehne"><div class="st-host" id="stHost"></div><div class="st-ov" id="stOv"></div></div></div>
        <div class="st-notiz"><label>Sprechernotizen</label><textarea id="stNotiz" rows="2" ${kann?'':'readonly'} placeholder="Was du zu dieser Folie sagen willst …"></textarea></div>
      </div>
      <aside class="st-rechts" id="stRechts" hidden></aside>
    </div></div>`;
  P.querySelector('#stZur').onclick=async()=>{ await stSpeichernJetzt(); stLiveEnde(); ST.p=null; ST.ansicht='liste'; await stProjekteLaden(); stListe(); };
  const ti=P.querySelector('#stTitel'); if(kann)ti.onchange=async()=>{ const t=ti.value.trim().slice(0,160); if(!t)return; ST.p.titel=t; const {error}=await SVB.sb.from('studio_projekte').update({titel:t}).eq('id',ST.p.id); if(error)kToast('⚠️ '+error.message); };
  const b=id=>P.querySelector(id);
  if(kann){ b('#stUndo').onclick=()=>stUndo(false); b('#stRedo').onclick=()=>stUndo(true); b('#stBau').onclick=()=>stRechts('bau'); b('#stMed2').onclick=()=>stRechts('med'); b('#stKi').onclick=()=>stRechts('ki'); b('#stNeuF').onclick=e=>stFolieNeuMenue(e.currentTarget); b('#stVer').onclick=()=>stRechts('ver'); }
  b('#stKom').onclick=()=>stRechts('kom'); b('#stExp').onclick=()=>stExportDialog(); b('#stPraes').onclick=()=>stPraesentieren();
  const no=b('#stNotiz'); no.oninput=()=>{ const f=stF(); if(f)stMeta(f,'notiz',no.value); };
  stFolienliste(); stCanvas(); stLiveStart();
  if(!stEditorRender._k){ stEditorRender._k=1; document.addEventListener('keydown',stTasten,true); window.addEventListener('resize',()=>{ if(ST.ansicht==='editor')stSkalieren(); }); }
}
function stRechts(art){ const R=document.getElementById('stRechts'); if(!R)return; if(!R.hidden&&R.dataset.art===art){ R.hidden=true; R.dataset.art=''; stSkalieren(); return; }
  R.hidden=false; R.dataset.art=art; R.innerHTML='';
  ({bau:stBausteinePanel,med:stMedienPanel,ki:stKiPanel,kom:stKommentarePanel,ver:stVersionenPanel}[art]||(()=>{}))(R); stSkalieren(); }

/* ---------- Folienliste ---------- */
function stFolienliste(){ const L=document.getElementById('stFl'); if(!L)return; const kann=stKann();
  L.innerHTML=ST.folien.map((f,i)=>`<div class="st-fi${i===ST.cur?' on':''}${f.skip?' skip':''}" data-fi="${i}" ${kann?'draggable="true"':''}>
    <span class="st-fn">${i+1}</span><div class="st-ft" data-ft="${i}"></div><div class="st-fl-l">${stE(f.label||'')}${f.skip?' <i>Backup</i>':''}</div>
    ${kann?`<div class="st-fa"><button type="button" title="Duplizieren" data-fd="${i}">⧉</button><button type="button" title="${f.skip?'Wieder zeigen':'Als Backup ausblenden'}" data-fs="${i}">${f.skip?'◐':'◑'}</button><button type="button" title="Löschen" data-fx="${i}">✕</button></div>`:''}</div>`).join('')||'<div class="empty">Noch keine Folie.</div>';
  ST.folien.forEach((f,i)=>stThumb(i));
  L.querySelectorAll('[data-fi]').forEach(el=>{ el.onclick=e=>{ if(e.target.closest('button'))return; stGeheZu(+el.dataset.fi); };
    if(kann){ el.ondragstart=e=>{ e.dataTransfer.setData('text/st-folie',el.dataset.fi); el.classList.add('drag'); };
      el.ondragend=()=>el.classList.remove('drag');
      el.ondragover=e=>{ if([...e.dataTransfer.types].includes('text/st-folie')){ e.preventDefault(); el.classList.add('ziel'); } };
      el.ondragleave=()=>el.classList.remove('ziel');
      el.ondrop=e=>{ el.classList.remove('ziel'); const von=+e.dataTransfer.getData('text/st-folie'), nach=+el.dataset.fi; if(isNaN(von)||von===nach)return; e.preventDefault(); stFolieVerschieben(von,nach); }; } });
  L.querySelectorAll('[data-fd]').forEach(x=>x.onclick=()=>stFolieDuplizieren(+x.dataset.fd));
  L.querySelectorAll('[data-fs]').forEach(x=>x.onclick=()=>{ const f=ST.folien[+x.dataset.fs]; stMeta(f,'skip',!f.skip); stFolienliste(); });
  L.querySelectorAll('[data-fx]').forEach(x=>x.onclick=()=>{ if(!x.classList.contains('sure')){ x.classList.add('sure'); x.textContent='Wirklich?'; setTimeout(()=>{ x.classList.remove('sure'); x.textContent='✕'; },3000); return; } stFolieLoeschen(+x.dataset.fx); }); }
function stThumb(i){ const L=document.getElementById('stFl'); const el=L&&L.querySelector(`[data-ft="${i}"]`); const f=ST.folien[i]; if(!el||!f)return; stSkalaBox(el,f,172); }
function stGeheZu(i){ if(i<0||i>=ST.folien.length)return; stEditEnde(); ST.cur=i; ST.sel=[]; stCanvas(); document.querySelectorAll('#stFl .st-fi').forEach(el=>el.classList.toggle('on',+el.dataset.fi===i));
  const el=document.querySelector(`#stFl [data-fi="${i}"]`); if(el)el.scrollIntoView({block:'nearest'}); try{ stLivePraesenz(); }catch(e){} }
function stPos(i){ const a=ST.folien[i-1], b=ST.folien[i]; return a&&b?(a.pos+b.pos)/2:a?a.pos+1:b?b.pos-1:1; }
async function stFolieEinfuegen(nach,html,label,opt){ await stSpeichernJetzt();
  const vor=ST.folien[nach]||ST.folien[0]; const mid=ST.mModus?null:(opt&&opt.master!==undefined?opt.master:(vor&&vor.master_id)||null);
  if(mid&&!ST.mModus)html=stOhneEigenesDesign(html);
  const pos=stPos(nach+1), row={projekt_id:ST.p.id,pos,label:label||'',html:stIdsSichern(html),ist_master:!!ST.mModus,master_id:mid};
  const {data,error}=await SVB.sb.from('studio_folien').insert(row).select(ST_FSEL).single(); if(error){ kToast('⚠️ '+error.message); return; }
  ST.folien.splice(nach+1,0,data); ST.alle.push(data); ST.basis.set(data.id,data.version); await stUrlsLaden(stAssets(data.html)); ST.cur=nach+1; ST.sel=[]; stFolienliste(); stCanvas(); try{ stLiveSenden(null,[{t:'folien'}]); }catch(e){} }
function stFolieDuplizieren(i){ const f=ST.folien[i]; stFolieEinfuegen(i,f.html,(f.label||'Folie')+' (Kopie)',{master:f.master_id||null}); }
async function stFolieLoeschen(i){ const f=ST.folien[i]; const {error}=await SVB.sb.from('studio_folien').delete().eq('id',f.id); if(error){ kToast('⚠️ '+error.message); return; }
  ST.folien.splice(i,1); ST.alle=ST.alle.filter(x=>x.id!==f.id); if(f.ist_master)ST.alle.forEach(x=>{ if(x.master_id===f.id)x.master_id=null; }); ST.q.delete(f.id); ST.cur=Math.min(ST.cur,ST.folien.length-1); ST.sel=[]; stFolienliste(); stCanvas(); kToast('Folie gelöscht'); try{ stLiveSenden(null,[{t:'folien'}]); }catch(e){} }
async function stFolieVerschieben(von,nach){ const [f]=ST.folien.splice(von,1); ST.folien.splice(nach,0,f);
  const pos=stPos(nach); f.pos=pos; stMeta(f,'pos',pos); ST.cur=nach; stFolienliste(); stCanvas(); try{ stLiveSenden(null,[{t:'folien'}]); }catch(e){} }

/* ---------- Bühne ---------- */
function stCanvas(behalten){ const f=stF(), host=stHost(), no=document.getElementById('stNotiz'); if(!host)return;
  if(!f){ host.innerHTML=''; if(host.shadowRoot)host.shadowRoot.innerHTML=''; return; }
  const sel=behalten?ST.sel.slice():[];
  stMount(host,f,{edit:true}); ST.sel=sel.filter(id=>stFind(stSec(),id)); stMarkieren();
  if(no&&document.activeElement!==no)no.value=f.notiz||'';
  stSkalieren(); stToolbar();
  if(!host._st){ host._st=1; stBuehneEvents(host); } }
function stSkalieren(){ const C=document.getElementById('stCanvas'), B=document.getElementById('stBuehne'), host=stHost(); if(!C||!B||!ST.p)return;
  const W=ST.p.breite, H=ST.p.hoehe; const cw=C.clientWidth-48, ch=C.clientHeight-48; let s=Math.min(cw/W, ch/H); if(!(s>0))s=0.4;
  if(ST.p.art!=='deck'&&ch<H*s+10)s=Math.min(s,cw/W);
  ST.s=s; B.style.width=Math.round(W*s)+'px'; B.style.height=Math.round(H*s)+'px'; host.style.transform=`scale(${s})`; stOverlay(); }
function stMarkieren(){ const sec=stSec(); if(!sec)return; sec.querySelectorAll('[data-st-sel],[data-st-sel2]').forEach(e=>{ e.removeAttribute('data-st-sel'); e.removeAttribute('data-st-sel2'); });
  ST.sel.forEach((id,i)=>{ const el=stFind(sec,id); if(el&&el!==sec)el.setAttribute(i?'data-st-sel2':'data-st-sel',''); }); }
// Markierungs-Attribute nie speichern
const _stRaus=stHtmlRaus; stHtmlRaus=function(h){ return _stRaus(h).replace(/\sdata-st-(sel2?|remote)(="[^"]*")?/g,'').replace(/\scontenteditable="[^"]*"/g,'').replace(/\sstyle="--st-rc:[^"]*"/g,''); };

/* ---------- Auswahl, Ziehen, Größe, Drehen ---------- */
function stBuehneEvents(host){
  host.addEventListener('pointerdown',e=>{ if(!stKann()&&!ST.kommentarModus)return; const sec=stSec(); if(!sec)return;
    const path=e.composedPath(); const iSec=path.indexOf(sec); if(iSec<0)return;
    if(ST.edit&&path.includes(ST.edit.el))return;   // im Text tippen
    stEditEnde();
    const tiefst=path[0]&&path[0].nodeType===1&&path[0]!==sec?path[0]:null;
    if(ST.kommentarModus){ e.preventDefault(); stKommentarAn(tiefst?stIdOf(sec,tiefst):'@'); return; }
    if(!tiefst){ ST.sel=[]; stMarkieren(); stNachAenderung(); return; }
    const kette=path.slice(0,iSec).filter(n=>n.nodeType===1).reverse();   // [oberstes Kind der Folie, …, tiefstes]
    let ziel;
    if(e.altKey)ziel=tiefst;
    else{ const akt=ST.sel.length===1?stFind(sec,ST.sel[0]):null; const ia=akt?kette.indexOf(akt):-1;
      ziel=ia>=0?(ST.sel.length===1&&ST.drill?kette[Math.min(ia+1,kette.length-1)]:akt):kette[0]; ST.drill=false; }
    const id=stIdOf(sec,ziel);
    if(e.shiftKey){ ST.sel=ST.sel.includes(id)?ST.sel.filter(x=>x!==id):ST.sel.concat(id); }
    else if(!ST.sel.includes(id))ST.sel=[id];
    stMarkieren(); stNachAenderung(); try{ stLivePraesenz(); }catch(x){}
    if(e.button===0&&!e.shiftKey)stZiehStart(e,'move'); });
  host.addEventListener('dblclick',e=>{ if(!stKann())return; const sec=stSec(); const path=e.composedPath(); const iSec=path.indexOf(sec); if(iSec<0)return;
    const tiefst=path[0]&&path[0].nodeType===1?path[0]:null; if(!tiefst||tiefst===sec)return;
    const kette=path.slice(0,iSec).filter(n=>n.nodeType===1).reverse();
    const akt=ST.sel.length===1?stFind(sec,ST.sel[0]):null;
    // Doppelklick: bis zum Text hinunter, dann tippen
    const text=kette.slice().reverse().find(n=>stIstText(n))||null;
    if(text&&(!akt||akt===text||akt.contains(text))){ ST.sel=[stIdOf(sec,text)]; stMarkieren(); stEditStart(text); return; }
    const ia=akt?kette.indexOf(akt):-1; if(ia>=0&&ia<kette.length-1){ ST.sel=[stIdOf(sec,kette[ia+1])]; stMarkieren(); stNachAenderung(); } });
  host.addEventListener('dragover',e=>{ if(stKann()&&[...e.dataTransfer.types].some(t=>t==='Files'||t==='text/st-medium'))e.preventDefault(); });
  host.addEventListener('drop',e=>{ if(!stKann())return; e.preventDefault(); stBildDrop(e); });
}
function stIstText(el){ if(!el||el.tagName==='IMG'||el.tagName==='SECTION')return false; const t=(el.textContent||'').trim(); if(!t)return false;
  return ![...el.children].some(c=>!['SPAN','B','STRONG','I','EM','BR','A','SMALL','SUP','SUB','U','MARK'].includes(c.tagName)); }
function stEditStart(el){ stEditEnde(); ST.edit={el,id:el.dataset.stId,vor:el.innerHTML}; el.setAttribute('contenteditable','true'); el.focus();
  try{ const r=document.createRange(); r.selectNodeContents(el); r.collapse(false); const sel=el.getRootNode().getSelection?el.getRootNode().getSelection():window.getSelection(); sel.removeAllRanges(); sel.addRange(r); }catch(e){}
  el.addEventListener('blur',stEditEnde,{once:true}); stOverlay(); stToolbar(); }
function stEditEnde(){ const E=ST.edit; if(!E)return; ST.edit=null; const el=E.el; el.removeAttribute('contenteditable');
  el.querySelectorAll('*').forEach(c=>{ if(!c.dataset.stId)c.dataset.stId=stId(); });
  const neu=el.innerHTML; if(neu!==E.vor)stTun([{t:'html',id:E.id,v:stHtmlRaus(neu),old:stHtmlRaus(E.vor)}],{schonAngewandt:true}); else stOverlay(); }

function stRect(el){ const B=document.getElementById('stBuehne').getBoundingClientRect(), r=el.getBoundingClientRect(); return {x:r.left-B.left,y:r.top-B.top,w:r.width,h:r.height}; }
function stTrans(el){ const t=(el.style.translate||'').trim().split(/\s+/); return {x:parseFloat(t[0])||0,y:parseFloat(t[1])||0}; }
function stOverlay(){ const O=document.getElementById('stOv'); const sec=stSec(); if(!O)return; O.innerHTML=''; if(!sec)return;
  ST.sel.forEach((id,i)=>{ const el=stFind(sec,id); if(!el||el===sec)return; const r=stRect(el); const d=document.createElement('div'); d.className='st-box'+(i?' zwei':''); Object.assign(d.style,{left:r.x+'px',top:r.y+'px',width:r.w+'px',height:r.h+'px'}); O.appendChild(d);
    if(i===0&&ST.sel.length===1&&stKann()&&!ST.edit){ ['nw','n','ne','e','se','s','sw','w'].forEach(k=>{ const h=document.createElement('span'); h.className='st-h st-h-'+k; h.dataset.h=k; d.appendChild(h); h.onpointerdown=ev=>{ ev.stopPropagation(); stZiehStart(ev,'size',k); }; });
      const ro=document.createElement('span'); ro.className='st-rot'; ro.title='Drehen'; ro.onpointerdown=ev=>{ ev.stopPropagation(); stZiehStart(ev,'rot'); }; d.appendChild(ro);
      const lab=document.createElement('span'); lab.className='st-lab'; lab.textContent=stName(el); d.appendChild(lab); } });
  stRemoteZeichnen(); }
function stName(el){ if(el.tagName==='IMG')return 'Bild'; if(el.dataset.stSlot!=null)return 'Bildplatz'; if(stIstText(el))return 'Text'; return el.children.length?'Gruppe':'Form'; }

function stZiehStart(e,art,griff){ const sec=stSec(); if(!sec||!stKann())return; const s=ST.s||1;
  const els=ST.sel.map(id=>stFind(sec,id)).filter(x=>x&&x!==sec&&!x.closest('[data-st-lock]')); if(!els.length)return;
  const start={x:e.clientX,y:e.clientY}, alt=els.map(el=>({el,style:el.getAttribute('style'),t:stTrans(el),w:el.offsetWidth,h:el.offsetHeight,r:parseFloat(el.style.rotate)||0,rect:stRect(el)}));
  let bewegt=false; const andere=[...sec.children].filter(c=>!els.includes(c)&&!els.some(x=>x.contains(c)||c.contains(x))).map(c=>stRect(c));
  const W=ST.p.breite*s, H=ST.p.hoehe*s;
  const mv=ev=>{ let dx=ev.clientX-start.x, dy=ev.clientY-start.y; if(!bewegt&&Math.hypot(dx,dy)<4)return; bewegt=true; ev.preventDefault();
    if(art==='move'){ // Einrasten an Folienrand/-mitte und anderen Elementen
      const u=alt.reduce((a,o)=>({x1:Math.min(a.x1,o.rect.x),y1:Math.min(a.y1,o.rect.y),x2:Math.max(a.x2,o.rect.x+o.rect.w),y2:Math.max(a.y2,o.rect.y+o.rect.h)}),{x1:1e9,y1:1e9,x2:-1e9,y2:-1e9});
      const X=[0,W/2,W].concat(...andere.map(r=>[r.x,r.x+r.w/2,r.x+r.w])), Y=[0,H/2,H].concat(...andere.map(r=>[r.y,r.y+r.h/2,r.y+r.h]));
      const lin=[]; const snap=(werte,kand,achse)=>{ let best=null; kand.forEach(k=>werte.forEach(v=>{ const d=v-k; if(Math.abs(d)<=6&&(!best||Math.abs(d)<Math.abs(best.d)))best={d,v}; })); if(best)lin.push({achse,v:best.v}); return best?best.d:0; };
      if(!ev.altKey){ dx+=snap(X,[u.x1+dx,(u.x1+u.x2)/2+dx,u.x2+dx],'x'); dy+=snap(Y,[u.y1+dy,(u.y1+u.y2)/2+dy,u.y2+dy],'y'); }
      alt.forEach(o=>{ o.el.style.translate=`${Math.round(o.t.x+dx/s)}px ${Math.round(o.t.y+dy/s)}px`; }); stOverlay(); stHilfslinien(lin); }
    else if(art==='size'){ const o=alt[0], el=o.el; let w=o.w, h=o.h, tx=o.t.x, ty=o.t.y; const ddx=dx/s, ddy=dy/s;
      if(griff.includes('e'))w=o.w+ddx; if(griff.includes('w')){ w=o.w-ddx; tx=o.t.x+ddx; } if(griff.includes('s'))h=o.h+ddy; if(griff.includes('n')){ h=o.h-ddy; ty=o.t.y+ddy; }
      if((el.tagName==='IMG'||ev.shiftKey)&&griff.length===2){ const r=o.w/o.h; if(Math.abs(w-o.w)/o.w>Math.abs(h-o.h)/o.h)h=w/r; else w=h*r; if(griff.includes('n'))ty=o.t.y+(o.h-h); if(griff.includes('w'))tx=o.t.x+(o.w-w); }
      w=Math.max(8,Math.round(w)); h=Math.max(8,Math.round(h));
      if(/[ew]/.test(griff)){ el.style.width=w+'px'; el.style.maxWidth='none'; el.style.flex='0 0 auto'; }
      if(/[ns]/.test(griff)){ el.style.height=h+'px'; el.style.maxHeight='none'; }
      el.style.translate=`${Math.round(tx)}px ${Math.round(ty)}px`; stOverlay(); }
    else if(art==='rot'){ const o=alt[0], r=o.rect, cx=r.x+r.w/2, cy=r.y+r.h/2, B=document.getElementById('stBuehne').getBoundingClientRect();
      let a=Math.atan2(ev.clientY-B.top-cy, ev.clientX-B.left-cx)*180/Math.PI+90; if(ev.shiftKey)a=Math.round(a/15)*15; else a=Math.round(a);
      if(Math.abs(a)<3)a=0; o.el.style.rotate=a?a+'deg':''; stOverlay(); } };
  const up=()=>{ window.removeEventListener('pointermove',mv); window.removeEventListener('pointerup',up); stHilfslinien([]);
    if(!bewegt)return; const ops=alt.map(o=>({t:'attr',id:stIdOf(sec,o.el),k:'style',v:o.el.getAttribute('style'),old:o.style})).filter(o=>o.v!==o.old);
    if(ops.length)stTun(ops,{schonAngewandt:true}); };
  window.addEventListener('pointermove',mv); window.addEventListener('pointerup',up); }
function stHilfslinien(L){ const O=document.getElementById('stOv'); if(!O)return; O.querySelectorAll('.st-hl').forEach(x=>x.remove());
  L.forEach(l=>{ const d=document.createElement('div'); d.className='st-hl '+l.achse; d.style[l.achse==='x'?'left':'top']=l.v+'px'; O.appendChild(d); }); }

/* ---------- Stil ändern (immer als ein Schritt) ---------- */
function stStil(props,els){ const sec=stSec(); if(!sec)return; els=els||ST.sel.map(id=>stFind(sec,id)).filter(Boolean);
  const ops=els.map(el=>{ const old=el.getAttribute('style'); Object.entries(props).forEach(([k,v])=>{ if(v==null||v==='')el.style.removeProperty(k); else el.style.setProperty(k,v); }); return {t:'attr',id:stIdOf(sec,el),k:'style',v:el.getAttribute('style'),old}; }).filter(o=>o.v!==o.old);
  if(ops.length)stTun(ops,{schonAngewandt:true}); }
function stAttr(el,k,v){ const sec=stSec(); const old=el.getAttribute(k); if(old===v)return; stTun([{t:'attr',id:stIdOf(sec,el),k,v,old}]); }
function stLoeschen(){ const sec=stSec(); const alle=ST.sel.map(id=>stFind(sec,id)).filter(el=>el&&el!==sec), frei=alle.filter(el=>!el.closest('[data-st-lock]'));
  if(alle.length&&!frei.length){ kToast('🔒 Gesperrt. Zum Löschen erst entsperren (Rechtsklick).'); return; }
  const ops=frei.map(el=>{ const n=el.nextElementSibling; return {t:'del',id:el.dataset.stId,parent:stIdOf(sec,el.parentElement),before:n?stIdOf(sec,n):null,html:stHtmlRaus(el.outerHTML)}; });
  ST.sel=ST.sel.filter(id=>!frei.some(el=>el.dataset.stId===id)); stTun(ops); }
function stDuplizieren(){ const sec=stSec(); const neu=[]; const ops=ST.sel.map(id=>stFind(sec,id)).filter(el=>el&&el!==sec).map(el=>{ const c=el.cloneNode(true); c.removeAttribute('data-st-sel'); c.removeAttribute('data-st-sel2');
    [c,...c.querySelectorAll('[data-st-id]')].forEach(x=>x.dataset.stId=stId()); const t=stTrans(el); c.style.translate=`${t.x+24}px ${t.y+24}px`; neu.push(c.dataset.stId);
    const n=el.nextElementSibling; return {t:'add',id:c.dataset.stId,parent:stIdOf(sec,el.parentElement),before:n?stIdOf(sec,n):null,html:stHtmlRaus(c.outerHTML)}; });
  stTun(ops); ST.sel=neu; stMarkieren(); stNachAenderung(); }
function stEbene(richtung){ const sec=stSec(); const els=ST.sel.map(id=>stFind(sec,id)).filter(el=>el&&el!==sec); if(!els.length)return;
  const z=els.map(el=>parseInt(getComputedStyle(el).zIndex)||0); stStil({},[]);
  const ops=els.map((el,i)=>{ const old=el.getAttribute('style'); if(getComputedStyle(el).position==='static')el.style.position='relative'; el.style.zIndex=String(Math.max(0,z[i]+richtung*(Math.abs(richtung)>1?50:1))); return {t:'attr',id:stIdOf(sec,el),k:'style',v:el.getAttribute('style'),old}; });
  stTun(ops,{schonAngewandt:true}); }
function stGruppieren(){ const sec=stSec(); const els=ST.sel.map(id=>stFind(sec,id)).filter(el=>el&&el!==sec); if(els.length<2)return kToast('Mit Umschalt mehrere Elemente wählen, dann gruppieren');
  const par=els[0].parentElement; if(els.some(e=>e.parentElement!==par))return kToast('Nur Elemente auf derselben Ebene lassen sich gruppieren');
  if(els.some(e=>getComputedStyle(e).position!=='absolute'))return kToast('Gruppieren geht bei frei platzierten Elementen. Im Layout einfach die Gruppe darüber wählen (Klick).');
  const box=els.map(e=>({e,l:e.offsetLeft,t:e.offsetTop,w:e.offsetWidth,h:e.offsetHeight}));
  const L=Math.min(...box.map(b=>b.l)), T=Math.min(...box.map(b=>b.t)), R=Math.max(...box.map(b=>b.l+b.w)), B=Math.max(...box.map(b=>b.t+b.h));
  const g=document.createElement('div'); g.dataset.stId=stId(); g.setAttribute('style',`position:absolute;left:${L}px;top:${T}px;width:${R-L}px;height:${B-T}px`);
  g.innerHTML=box.map(b=>{ const c=b.e.cloneNode(true); c.removeAttribute('data-st-sel'); c.removeAttribute('data-st-sel2'); ['right','bottom','inset'].forEach(k=>c.style.removeProperty(k)); c.style.left=(b.l-L)+'px'; c.style.top=(b.t-T)+'px'; return c.outerHTML; }).join('');
  const ops=els.map(el=>{ const nx=el.nextElementSibling; return {t:'del',id:el.dataset.stId,parent:stIdOf(sec,par),before:nx?stIdOf(sec,nx):null,html:stHtmlRaus(el.outerHTML)}; });
  const nachLetztem=els[els.length-1].nextElementSibling; const vor=nachLetztem&&!els.includes(nachLetztem)?stIdOf(sec,nachLetztem):null;
  ops.push({t:'add',id:g.dataset.stId,parent:stIdOf(sec,par),before:vor,html:stHtmlRaus(g.outerHTML)});
  stTun(ops); ST.sel=[g.dataset.stId]; stMarkieren(); stNachAenderung(); }
function stAufloesen(){ const sec=stSec(); const g=ST.sel.length===1?stFind(sec,ST.sel[0]):null; if(!g||g===sec||!g.children.length)return;
  const par=g.parentElement, nx=g.nextElementSibling; const kinder=[...g.children];
  const ops=[{t:'del',id:g.dataset.stId,parent:stIdOf(sec,par),before:nx?stIdOf(sec,nx):null,html:stHtmlRaus(g.outerHTML)}];
  const abs=getComputedStyle(g).position==='absolute', gt=stTrans(g);
  kinder.forEach(c=>{ const k=c.cloneNode(true); k.removeAttribute('data-st-sel'); if(abs&&getComputedStyle(c).position==='absolute'){ k.style.left=(c.offsetLeft+g.offsetLeft)+'px'; k.style.top=(c.offsetTop+g.offsetTop)+'px'; const t=stTrans(c); if(gt.x||gt.y||t.x||t.y)k.style.translate=`${t.x+gt.x}px ${t.y+gt.y}px`; } ops.push({t:'add',id:c.dataset.stId,parent:stIdOf(sec,par),before:nx?stIdOf(sec,nx):null,html:stHtmlRaus(k.outerHTML)}); });
  // Reihenfolge: erst Gruppe weg, dann Kinder an ihre Stelle
  stTun(ops); ST.sel=kinder.map(c=>c.dataset.stId); stMarkieren(); stNachAenderung(); }

/* ---------- Tastatur ---------- */
function stTasten(e){ if(svCurTab()!=='studio'||ST.ansicht!=='editor')return; if(ST.praes)return;
  const tippt=ST.edit||/^(INPUT|TEXTAREA|SELECT)$/.test((document.activeElement||{}).tagName||'');
  const mod=e.metaKey||e.ctrlKey, k=e.key;
  if(ST.edit&&k==='Escape'){ e.preventDefault(); const el=ST.edit.el; el.blur(); stEditEnde(); return; }
  if(tippt)return; if(!stKann()){ if(k==='ArrowRight'||k==='PageDown')stGeheZu(ST.cur+1); if(k==='ArrowLeft'||k==='PageUp')stGeheZu(ST.cur-1); return; }
  if(mod&&k.toLowerCase()==='z'){ e.preventDefault(); stUndo(e.shiftKey); return; }
  if(mod&&k.toLowerCase()==='y'){ e.preventDefault(); stUndo(true); return; }
  if(mod&&k.toLowerCase()==='s'){ e.preventDefault(); stSpeichernJetzt(); return; }
  if(!ST.sel.length){ if(k==='ArrowDown'||k==='PageDown'){ e.preventDefault(); stGeheZu(ST.cur+1); } if(k==='ArrowUp'||k==='PageUp'){ e.preventDefault(); stGeheZu(ST.cur-1); } return; }
  if(k==='Delete'||k==='Backspace'){ e.preventDefault(); stLoeschen(); return; }
  if(k==='Escape'){ ST.sel=[]; stMarkieren(); stNachAenderung(); return; }
  if(k==='Enter'){ const sec=stSec(), el=stFind(sec,ST.sel[0]); if(el&&stIstText(el)){ e.preventDefault(); stEditStart(el); } else { ST.drill=true; } return; }
  if(mod&&k.toLowerCase()==='d'){ e.preventDefault(); stDuplizieren(); return; }
  if(mod&&k.toLowerCase()==='g'){ e.preventDefault(); if(e.shiftKey)stAufloesen(); else stGruppieren(); return; }
  if(k===']'||k==='['){ e.preventDefault(); stEbene(k===']'?(mod?2:1):(mod?-2:-1)); return; }
  if(k.startsWith('Arrow')){ e.preventDefault(); const st=e.shiftKey?10:1; const d={ArrowLeft:[-st,0],ArrowRight:[st,0],ArrowUp:[0,-st],ArrowDown:[0,st]}[k];
    const sec=stSec(); const ops=ST.sel.map(id=>stFind(sec,id)).filter(el=>el&&el!==sec).map(el=>{ const old=el.getAttribute('style'), t=stTrans(el); el.style.translate=`${t.x+d[0]}px ${t.y+d[1]}px`; return {t:'attr',id:el.dataset.stId,k:'style',v:el.getAttribute('style'),old}; });
    stTun(ops,{schonAngewandt:true}); } }

/* ---------- Werkzeugleiste ---------- */
function stFarbe(c){ const m=String(c||'').match(/rgba?\(([^)]+)\)/); if(!m)return c||''; const [r,g,b]=m[1].split(',').map(x=>parseFloat(x)); return '#'+[r,g,b].map(x=>Math.round(x).toString(16).padStart(2,'0')).join(''); }
function stLum(hex){ const h=stFarbe(hex).replace('#',''); if(h.length<6)return 1; const c=[0,2,4].map(i=>parseInt(h.slice(i,i+2),16)/255).map(v=>v<=0.03928?v/12.92:Math.pow((v+0.055)/1.055,2.4)); return 0.2126*c[0]+0.7152*c[1]+0.0722*c[2]; }
function stKontrast(el){ const fg=getComputedStyle(el).color; let n=el, bg=null; while(n&&n.nodeType===1){ const b=getComputedStyle(n).backgroundColor; if(b&&!/rgba?\(0, 0, 0, 0\)|transparent/.test(b)){ bg=b; break; } if(n.tagName==='SECTION')break; n=n.parentElement; }
  if(!bg)return null; const a=stLum(fg), b=stLum(bg); return (Math.max(a,b)+0.05)/(Math.min(a,b)+0.05); }
function stToolbar(){ const T=document.getElementById('stTools'); if(!T)return; const sec=stSec(); const kann=stKann();
  const el=ST.sel.length?stFind(sec,ST.sel[0]):null;
  if(!el||el===sec||!kann){ const f=stF(); T.innerHTML=kann&&f?`<span class="st-tl">Folie</span><input class="st-in st-lbl" id="stLbl" value="${stE(f.label||'')}" placeholder="Folienname">
      <span class="st-tl">Hintergrund</span>${Object.entries(ST_TOK).map(([k,v])=>`<button type="button" class="st-sw" style="background:${v}" title="${k}" data-bg="${v}"></button>`).join('')}
      <span class="sp"></span><span class="st-tip">Klicken wählt, Doppelklick geht tiefer und öffnet Text. Umschalt für mehrere, Alt für das innerste Element.</span>`:`<span class="st-tip">${f?stE(f.label||''):''}</span>`;
    const lb=T.querySelector('#stLbl'); if(lb)lb.onchange=()=>{ const f=stF(); stMeta(f,'label',lb.value.trim()); stFolienliste(); };
    T.querySelectorAll('[data-bg]').forEach(b=>b.onclick=()=>stStil({background:b.dataset.bg},[sec]));
    return; }
  const cs=getComputedStyle(el), istBild=el.tagName==='IMG', text=stIstText(el)||!!ST.edit, fs=Math.round(parseFloat(cs.fontSize)), kon=text?stKontrast(el):null;
  const fam=/Caveat/.test(cs.fontFamily)?'Caveat':/Condensed/.test(cs.fontFamily)?'Barlow Condensed':'Barlow';
  const kette=[]; for(let n=el;n&&n!==sec;n=n.parentElement)kette.unshift(n);
  T.innerHTML=`<span class="st-bc">${kette.map((n,i)=>`<button type="button" data-bc="${stE(n.dataset.stId||'')}" class="${n===el?'on':''}">${stE(stName(n))}</button>`).join('›')}</span>
    ${text?`<select class="st-in" id="stFam">${['Barlow','Barlow Condensed','Caveat'].map(f=>`<option ${f===fam?'selected':''}>${f}</option>`).join('')}</select>
    <input class="st-in st-num" id="stFs" type="number" min="8" max="400" value="${fs}" title="Schriftgröße in px">${ST.p.art==='deck'&&fs<24?'<span class="st-warnb" title="Auf Folien mindestens 24 px">klein</span>':''}
    <button type="button" class="st-tb${parseInt(cs.fontWeight)>=700?' on':''}" id="stB" title="Fett"><b>F</b></button>
    <button type="button" class="st-tb${cs.textTransform==='uppercase'?' on':''}" id="stUp" title="Versalien">AA</button>
    ${['left','center','right'].map(a=>`<button type="button" class="st-tb${cs.textAlign===a||(a==='left'&&cs.textAlign==='start')?' on':''}" data-al="${a}" title="${{left:'Links',center:'Mitte',right:'Rechts'}[a]}">${{left:'⇤',center:'↔',right:'⇥'}[a]}</button>`).join('')}
    <span class="st-tl">Farbe</span>${Object.entries(ST_TOK).map(([k,v])=>`<button type="button" class="st-sw" style="background:${v}" title="${k}" data-c="${v}"></button>`).join('')}<input type="color" class="st-col" id="stCol" value="${stFarbe(cs.color)||'#1c1c22'}" title="Freie Farbe">
    ${kon!=null?`<span class="${kon<4.5?'st-warnb':'st-okb'}" title="Kontrast zum Hintergrund (Ziel mindestens 4,5:1)">${kon.toFixed(1).replace('.',',')}:1</span>`:''}`:''}
    ${istBild?`<button type="button" class="btn sm ghost" id="stErs">${SVI('upload')} Bild ersetzen</button>
      <span class="st-tl">Ausschnitt</span><input type="range" id="stOx" min="0" max="100" value="${parseInt((cs.objectPosition||'50% 50%').split(' ')[0])||50}" title="links/rechts"><input type="range" id="stOy" min="0" max="100" value="${parseInt((cs.objectPosition||'50% 50%').split(' ')[1])||50}" title="oben/unten">
      <span class="st-tl">Zoom</span><input type="range" id="stZm" min="100" max="300" value="${Math.round((parseFloat(el.style.scale)||1)*100)}">
      <button type="button" class="st-tb${cs.borderRadius==='50%'?' on':''}" id="stRund" title="Rund">◯</button>`:''}
    ${!text&&!istBild?`<span class="st-tl">Fläche</span>${Object.entries(ST_TOK).map(([k,v])=>`<button type="button" class="st-sw" style="background:${v}" title="${k}" data-f="${v}"></button>`).join('')}<button type="button" class="st-sw st-sw0" data-f="" title="ohne">⌀</button>`:''}
    <span class="sp"></span>
    <button type="button" class="st-tb" id="stVor" title="Nach vorn ( ] )">⬆</button><button type="button" class="st-tb" id="stHin" title="Nach hinten ( [ )">⬇</button>
    <button type="button" class="st-tb" id="stDup" title="Duplizieren (Strg+D)">⧉</button>${ST.sel.length>1?'<button type="button" class="st-tb" id="stGrp" title="Gruppieren (Strg+G)">▣</button>':''}
    <button type="button" class="st-tb" id="stKomEl" title="Kommentar zu diesem Element">💬</button>
    <button type="button" class="st-tb st-rot" id="stDel" title="Löschen (Entf)">🗑</button>`;
  const q=s=>T.querySelector(s);
  T.querySelectorAll('[data-bc]').forEach(b=>b.onclick=()=>{ if(!b.dataset.bc)return; ST.sel=[b.dataset.bc]; stMarkieren(); stNachAenderung(); });
  if(q('#stFam'))q('#stFam').onchange=()=>{ const v=q('#stFam').value; stStil({'font-family':v==='Barlow'?"'Barlow', sans-serif":v==='Caveat'?"'Caveat', cursive":"'Barlow Condensed', sans-serif",'font-weight':v==='Barlow Condensed'?'800':v==='Caveat'?'700':null}); };
  if(q('#stFs'))q('#stFs').onchange=()=>stStil({'font-size':Math.max(8,+q('#stFs').value)+'px'});
  if(q('#stB'))q('#stB').onclick=()=>stStil({'font-weight':parseInt(cs.fontWeight)>=700?'400':'700'});
  if(q('#stUp'))q('#stUp').onclick=()=>stStil({'text-transform':cs.textTransform==='uppercase'?'none':'uppercase'});
  T.querySelectorAll('[data-al]').forEach(b=>b.onclick=()=>stStil({'text-align':b.dataset.al}));
  T.querySelectorAll('[data-c]').forEach(b=>b.onclick=()=>stStil({color:b.dataset.c}));
  if(q('#stCol'))q('#stCol').onchange=()=>stStil({color:q('#stCol').value});
  T.querySelectorAll('[data-f]').forEach(b=>b.onclick=()=>stStil({background:b.dataset.f||null}));
  if(q('#stErs'))q('#stErs').onclick=()=>stMediathek(p=>stBildSetzen(el,p));
  const pos=()=>stStil({'object-position':q('#stOx').value+'% '+q('#stOy').value+'%','object-fit':'cover'});
  if(q('#stOx')){ q('#stOx').onchange=pos; q('#stOy').onchange=pos; q('#stZm').onchange=()=>{ const z=+q('#stZm').value/100; stStil({scale:z>1?String(z):null}); };
    q('#stRund').onclick=()=>stStil({'border-radius':cs.borderRadius==='50%'?null:'50%','aspect-ratio':cs.borderRadius==='50%'?null:'1','object-fit':'cover'}); }
  q('#stVor').onclick=()=>stEbene(1); q('#stHin').onclick=()=>stEbene(-1); q('#stDup').onclick=stDuplizieren; q('#stDel').onclick=stLoeschen;
  if(q('#stGrp'))q('#stGrp').onclick=stGruppieren; q('#stKomEl').onclick=()=>{ stRechts('kom'); setTimeout(()=>stKommentarAn(ST.sel[0]),50); };
}

/* =====================================================================
   SV/BSC Studio (Teil 3: Vorlagen und Bausteine im Vereinsdesign, Mediathek, Präsentieren, Import)
   ===================================================================== */
const STV={kick:"font-family:'Barlow Condensed',sans-serif;font-weight:700;font-size:26px;letter-spacing:0.14em;text-transform:uppercase",
  h:"font-family:'Barlow Condensed',sans-serif;font-weight:900;font-size:96px;line-height:0.9;text-transform:uppercase;margin:10px 0 0",
  hand:"font-family:'Caveat',cursive;font-weight:700;font-size:40px;transform:rotate(-2deg)",
  body:"font-family:'Barlow',sans-serif;font-size:30px;line-height:1.4",
  fuss:"position:absolute;left:110px;right:110px;bottom:34px;display:flex;justify-content:space-between;font-family:'Barlow Condensed',sans-serif;font-weight:700;font-size:24px;letter-spacing:0.12em;text-transform:uppercase"};
const stX=s=>stE(s==null||s===''?'XX':s);
function stFussHtml(dunkel,nr){ return `<div data-st-bau="fuss" style="${STV.fuss};color:${dunkel?'rgba(255,255,255,.6)':'#5b5b66'}"><span>SV/BSC Mörlenbach · Konzept</span><span>${nr!=null?stE(nr):''}</span></div>`; }
function stKopfHtml(k,dunkel){ return `<div data-st-bau="kopf" style="position:relative;display:flex;justify-content:space-between;align-items:flex-end;gap:40px"><div><div style="${STV.kick};color:${dunkel?'#8fc9ec':'#5b5b66'}">${stX(k.kicker)}</div><h2 style="${STV.h};color:${dunkel?'#ffffff':'#1c1c22'}">${stX(k.titel)}${k.akzent?` <span style="color:${dunkel?'#e8741f':'#1d2760'}">${stE(k.akzent)}</span>`:''}</h2></div>${k.hand?`<div style="${STV.hand};color:${dunkel?'#8fc9ec':'#e8741f'}">${stE(k.hand)}</div>`:''}</div>`; }
function stSecHtml(bg,inner,fg){ return `<section style="position:relative;background:${bg};color:${fg||'#1c1c22'};font-family:'Barlow',sans-serif;padding:80px 110px 70px;box-sizing:border-box;display:flex;flex-direction:column;overflow:hidden">${inner}</section>`; }
function stPersonKarte(p,dunkel){ const vak=!p.name||/vakant/i.test(p.name);
  return `<div data-st-bau="person" ${p.person?`data-st-person="${stE(p.person)}"`:''} style="display:flex;align-items:center;gap:22px;padding:18px 22px;background:${dunkel?'rgba(255,255,255,.06)':'#ffffff'};border-left:6px solid #1d2760">
    ${vak?`<div style="width:96px;height:96px;border-radius:50%;flex:0 0 auto;border:3px dashed #e8741f"></div>`:`<img src="${stE(p.foto||'assets/logo-svbsc.png')}" alt="" style="width:96px;height:96px;border-radius:50%;object-fit:cover;flex:0 0 auto;border:3px solid #ffffff;box-shadow:0 0 0 2px #1d2760">`}
    <div><div style="font-family:'Barlow Condensed',sans-serif;font-weight:700;font-size:24px;letter-spacing:0.08em;text-transform:uppercase;color:${dunkel?'#8fc9ec':'#5b5b66'}">${stX(p.rolle)}</div>
    ${vak?`<div style="display:inline-block;margin-top:8px;padding:4px 14px;border:3px solid #e8741f;color:#e8741f;font-family:'Barlow Condensed',sans-serif;font-weight:900;font-size:34px;letter-spacing:0.06em">VAKANT</div>`:`<div style="margin-top:6px;font-family:'Barlow Condensed',sans-serif;font-weight:900;font-size:40px;line-height:1">${stE(p.name)}</div>`}</div></div>`; }
function stVorlageFolie(art,k){ k=k||{};
  if(art==='titel')return stSecHtml('#1d2760',`<div style="display:flex;align-items:center;gap:26px"><img src="assets/logo-svbsc.png" alt="SV/BSC Mörlenbach" style="height:120px;width:auto;display:block"></div>
    <div style="margin-top:auto"><div style="${STV.kick};color:#8fc9ec">${stX(k.kicker||'SV/BSC Mörlenbach · Fußball')}</div><h1 style="${STV.h};font-size:150px;color:#ffffff">${stX(k.titel)}</h1>${k.hand?`<div style="${STV.hand};font-size:52px;color:#e8741f;margin-top:18px">${stE(k.hand)}</div>`:''}</div>${stFussHtml(true,k.datum||'')}`,'#ffffff');
  if(art==='kapitel')return stSecHtml('#f7f4ee',`<div style="position:absolute;left:0;top:0;width:640px;height:100%;background:#1d2760;overflow:hidden"><div style="position:absolute;left:70px;bottom:50px;font-family:'Barlow Condensed',sans-serif;font-weight:900;font-size:240px;line-height:0.8;color:#ffffff;letter-spacing:-0.05em">${stX(k.nr||'01')}</div></div>
    <div style="margin-left:620px;margin-top:auto;margin-bottom:auto"><div style="${STV.kick};color:#5b5b66">Kapitel</div><h2 style="${STV.h};font-size:120px">${stX(k.titel)}</h2>${k.hand?`<div style="${STV.hand};color:#e8741f;margin-top:16px">${stE(k.hand)}</div>`:''}</div>`);
  if(art==='inhalt')return stSecHtml('#f7f4ee',`<div style="position:absolute;left:0;top:0;width:22px;height:100%;background:#1d2760"></div>${stKopfHtml(k)}
    <div style="margin-top:60px;max-width:1400px;display:flex;flex-direction:column;gap:22px">${(k.punkte&&k.punkte.length?k.punkte:['XX']).map(p=>`<div style="display:flex;gap:22px;align-items:baseline"><span style="width:14px;height:14px;background:#e8741f;flex:0 0 auto;transform:translateY(-4px)"></span><p style="margin:0;${STV.body}">${stE(p)}</p></div>`).join('')}</div>${stFussHtml(false,k.nr)}`);
  if(art==='personen')return stSecHtml('#f7f4ee',`${stKopfHtml(k)}<div style="margin-top:56px;display:grid;grid-template-columns:repeat(${Math.min(3,Math.max(1,(k.personen||[]).length||3))},minmax(0,1fr));gap:24px">${(k.personen&&k.personen.length?k.personen:[{rolle:'XX'},{rolle:'XX'},{rolle:'XX'}]).map(p=>stPersonKarte(p)).join('')}</div>${stFussHtml(false,k.nr)}`);
  if(art==='aufgaben')return stSecHtml('#f7f4ee',`${stKopfHtml(k)}<div style="margin-top:56px;display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:22px 60px">${(k.punkte&&k.punkte.length?k.punkte:['XX','XX','XX','XX']).map((p,i)=>`<div style="display:flex;gap:24px;align-items:baseline;border-top:2px solid #d8d2c4;padding-top:18px"><span style="font-family:'Barlow Condensed',sans-serif;font-weight:900;font-size:56px;line-height:0.9;color:#e8741f;min-width:64px">${String(i+1).padStart(2,'0')}</span><p style="margin:0;${STV.body}">${stE(p)}</p></div>`).join('')}</div>${stFussHtml(false,k.nr)}`);
  if(art==='termine')return stSecHtml('#1d2760',`${stKopfHtml(Object.assign({kicker:'Termine',titel:'Die nächsten Schritte.'},k),true)}<div style="margin-top:60px;display:flex;flex-direction:column">${(k.termine&&k.termine.length?k.termine:[{datum:'XX',text:'XX'}]).map(t=>`<div data-st-bau="termin" style="display:grid;grid-template-columns:320px 1fr;gap:40px;align-items:baseline;padding:26px 0;border-top:2px solid rgba(255,255,255,.25)"><div style="font-family:'Barlow Condensed',sans-serif;font-weight:900;font-size:60px;line-height:1;color:#e8741f">${stX(t.datum)}</div><div style="font-size:34px;line-height:1.3;color:#ffffff">${stX(t.text)}</div></div>`).join('')}</div>${stFussHtml(true,k.nr)}`,'#ffffff');
  if(art==='kennzahlen')return stSecHtml('#1d2760',`${stKopfHtml(k,true)}<div data-st-bau="zahlen" style="margin-top:70px;display:grid;grid-template-columns:repeat(${Math.max(1,(k.zahlen||[1,2,3]).length)},minmax(0,1fr));gap:28px">${(k.zahlen&&k.zahlen.length?k.zahlen:[{wert:'XX',label:'XX'},{wert:'XX',label:'XX'},{wert:'XX',label:'XX'}]).map((z,i,a)=>`<div style="border-top:3px solid ${i===a.length-1?'#e8741f':'rgba(255,255,255,.5)'};padding-top:30px"><div style="font-family:'Barlow Condensed',sans-serif;font-weight:900;font-size:150px;line-height:0.85;letter-spacing:-0.03em;color:#ffffff">${stX(z.wert)}</div><div style="margin-top:22px;font-family:'Barlow Condensed',sans-serif;font-weight:800;font-size:36px;text-transform:uppercase;color:#8fc9ec">${stX(z.label)}</div>${z.text?`<p style="margin:14px 0 0;font-size:28px;line-height:1.4;color:#e6ecf5">${stE(z.text)}</p>`:''}</div>`).join('')}</div>${stFussHtml(true,k.nr)}`,'#ffffff');
  if(art==='foto')return `<section style="position:relative;background:#1d2760;color:#ffffff;font-family:'Barlow',sans-serif;padding:80px 110px 70px;box-sizing:border-box;display:flex;flex-direction:column;overflow:hidden"><img src="${stE(k.foto||'assets/foto-jubel.jpg')}" alt="" style="position:absolute;inset:0;width:100%;height:100%;object-fit:cover;display:block"><div style="position:absolute;inset:0;background:linear-gradient(90deg,rgba(29,39,96,.94) 0%,rgba(29,39,96,.7) 45%,rgba(29,39,96,.15) 100%)"></div>
    <div style="position:relative;margin-top:auto;max-width:1100px"><div style="${STV.kick};color:#8fc9ec">${stX(k.kicker)}</div><h2 style="${STV.h};font-size:120px;color:#ffffff">${stX(k.titel)}</h2>${k.hand?`<div style="${STV.hand};color:#e8741f;margin-top:16px">${stE(k.hand)}</div>`:''}</div></section>`;
  if(art==='ideen')return stSecHtml('#f7f4ee',`${stKopfHtml(k)}<div style="margin-top:56px;display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:24px">${(k.ideen&&k.ideen.length?k.ideen:[{titel:'XX',text:'XX'},{titel:'XX',text:'XX'},{titel:'XX',text:'XX'}]).map(x=>`<div data-st-bau="idee" style="background:#ffffff;padding:30px 28px;border-top:6px solid #1d2760"><div style="font-family:'Barlow Condensed',sans-serif;font-weight:900;font-size:40px;line-height:1;text-transform:uppercase;color:#1d2760">${stX(x.titel)}</div><p style="margin:14px 0 0;font-size:26px;line-height:1.4">${stX(x.text)}</p></div>`).join('')}<div style="border:3px dashed #e8741f;padding:30px 28px;display:flex;align-items:center;justify-content:center;${STV.hand};color:#e8741f;transform:none">Weitere Ideen …</div></div>${stFussHtml(false,k.nr)}`);
  return stSecHtml('#f7f4ee',stFussHtml(false,''));
}
function stVorlageSeite(){ const p=ST.p||{breite:794,hoehe:1123};
  return `<section class="page" style="position:relative;display:flex;flex-direction:column;background:#ffffff;color:#1c1c22;font-family:'Barlow',sans-serif;box-sizing:border-box;overflow:hidden;padding:${p.breite>p.hoehe?'18mm 20mm':'20mm 20mm 18mm 25mm'}">
    <div style="display:flex;justify-content:space-between;align-items:flex-start"><img src="assets/logo-svbsc.png" alt="SV/BSC Mörlenbach" style="height:22mm;width:auto;display:block"><div style="text-align:right"><div style="font-family:'Barlow Condensed',sans-serif;font-weight:800;font-size:19pt;line-height:1;text-transform:uppercase;color:#1d2760">SV/BSC Mörlenbach</div><div style="margin-top:1.8mm;font-size:8.5pt;letter-spacing:0.16em;text-transform:uppercase;color:#5b5b66">Abteilung Fußball · seit 1896</div></div></div>
    <div style="height:0.5mm;background:#1d2760;margin-top:6mm;position:relative"><div style="position:absolute;left:0;top:0;width:22mm;height:0.5mm;background:#e8741f"></div></div>
    <h1 style="margin:12mm 0 4mm;font-family:'Barlow Condensed',sans-serif;font-weight:900;font-size:26pt;line-height:1;text-transform:uppercase;color:#1d2760">Überschrift</h1>
    <p style="margin:0;font-size:11pt;line-height:1.5">Text …</p></section>`; }

/* Bausteine für die aktuelle Folie (frei platziert, alles danach bearbeitbar) */
const ST_BAU=[
  ['text','Text',()=>`<p style="position:absolute;left:110px;top:420px;width:900px;margin:0;${STV.body}">Text …</p>`],
  ['ueber','Überschrift',()=>`<h2 style="position:absolute;left:110px;top:300px;${STV.h}">Überschrift</h2>`],
  ['hand','Handschrift',()=>`<div style="position:absolute;left:1100px;top:200px;${STV.hand};color:#e8741f">Notiz am Rand</div>`],
  ['kopf','Kapitel-Kopf',()=>`<div style="position:absolute;left:110px;top:80px;width:1700px">${stKopfHtml({kicker:'Kapitel',titel:'Überschrift',akzent:'Akzent.',hand:'Handschrift'})}</div>`],
  ['person','Personenkarte',()=>`<div style="position:absolute;left:110px;top:420px;width:540px">${stPersonKarte({rolle:'Rolle'})}</div>`],
  ['aufgaben','Aufgabenpakete',()=>`<div style="position:absolute;left:110px;top:380px;width:1200px;display:flex;flex-direction:column;gap:18px">${['Aufgabe','Aufgabe','Aufgabe'].map((t,i)=>`<div style="display:flex;gap:24px;align-items:baseline"><span style="font-family:'Barlow Condensed',sans-serif;font-weight:900;font-size:56px;line-height:0.9;color:#e8741f;min-width:64px">${String(i+1).padStart(2,'0')}</span><p style="margin:0;${STV.body}">${t}</p></div>`).join('')}</div>`],
  ['orga','Organigramm-Knoten',()=>`<div style="position:absolute;left:710px;top:380px;width:500px"><div style="background:#1d2760;color:#ffffff;padding:14px 22px;display:flex;align-items:center;gap:18px"><img src="assets/logo-svbsc.png" alt="" style="width:70px;height:70px;border-radius:50%;object-fit:cover;border:3px solid #ffffff;background:#fff"><div><div style="font-family:'Barlow Condensed',sans-serif;font-weight:700;font-size:24px;letter-spacing:0.07em;text-transform:uppercase;color:#8fc9ec">Rolle</div><div style="margin-top:6px;font-family:'Barlow Condensed',sans-serif;font-weight:900;font-size:40px;line-height:1">Name</div></div></div><div style="width:3px;height:60px;background:#1d2760;margin:0 auto"></div></div>`],
  ['idee','Ideenkarte',()=>`<div data-st-bau="idee" style="position:absolute;left:110px;top:400px;width:400px;background:#ffffff;padding:30px 28px;border-top:6px solid #1d2760"><div style="font-family:'Barlow Condensed',sans-serif;font-weight:900;font-size:40px;line-height:1;text-transform:uppercase;color:#1d2760">Idee</div><p style="margin:14px 0 0;font-size:26px;line-height:1.4">Kurz beschreiben …</p></div>`],
  ['weitere','„Weitere Ideen …“',()=>`<div style="position:absolute;left:560px;top:400px;width:400px;height:220px;border:3px dashed #e8741f;display:flex;align-items:center;justify-content:center;${STV.hand};color:#e8741f;transform:none">Weitere Ideen …</div>`],
  ['termin','Termin-Zeile',()=>`<div data-st-bau="termin" style="position:absolute;left:110px;top:520px;width:1700px;display:grid;grid-template-columns:320px 1fr;gap:40px;align-items:baseline;padding:26px 0;border-top:2px solid #d8d2c4"><div style="font-family:'Barlow Condensed',sans-serif;font-weight:900;font-size:60px;line-height:1;color:#e8741f">TT.MM.JJJJ</div><div style="font-size:34px;line-height:1.3">Was passiert</div></div>`],
  ['zahlen','Kennzahlen-Leiste',()=>`<div data-st-bau="zahlen" style="position:absolute;left:110px;top:440px;width:1700px;display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:28px">${['XX','XX','XX'].map((z,i)=>`<div style="border-top:3px solid ${i===2?'#e8741f':'#1d2760'};padding-top:24px"><div style="font-family:'Barlow Condensed',sans-serif;font-weight:900;font-size:120px;line-height:0.85;color:#1d2760">${z}</div><div style="margin-top:16px;font-family:'Barlow Condensed',sans-serif;font-weight:800;font-size:32px;text-transform:uppercase;color:#5b5b66">Bezeichnung</div></div>`).join('')}</div>`],
  ['foto','Vollbild-Foto mit Overlay',()=>`<div style="position:absolute;inset:0"><img src="assets/foto-jubel.jpg" alt="" style="position:absolute;inset:0;width:100%;height:100%;object-fit:cover"><div style="position:absolute;inset:0;background:linear-gradient(90deg,rgba(29,39,96,.94) 0%,rgba(29,39,96,.6) 50%,rgba(29,39,96,.1) 100%)"></div></div>`],
  ['bild','Bild',()=>`<img src="assets/foto-team-blau.jpg" alt="" style="position:absolute;left:1100px;top:300px;width:640px;height:480px;object-fit:cover;display:block">`],
  ['platz','Bildplatz',()=>`<div data-st-slot="bild" data-st-ph="Bild hier ablegen" style="position:absolute;left:1100px;top:300px;width:640px;height:480px;display:block;overflow:hidden"></div>`],
  ['fuss','Fußzeile mit Seitenzahl',()=>stFussHtml(false,String(ST.cur+1))],
  ['rechteck','Fläche',()=>`<div style="position:absolute;left:200px;top:300px;width:480px;height:280px;background:#d9e6f1"></div>`],
  ['kreis','Kreis',()=>`<div style="position:absolute;left:300px;top:300px;width:220px;height:220px;border-radius:50%;background:#e8741f"></div>`],
  ['linie','Linie',()=>`<div style="position:absolute;left:110px;top:540px;width:800px;height:4px;background:#1d2760"></div>`]];
const ST_FV=[['titel','Titel'],['kapitel','Kapitel'],['inhalt','Inhalt mit Punkten'],['personen','Personen'],['aufgaben','Aufgabenpakete'],['termine','Termine'],['kennzahlen','Kennzahlen'],['ideen','Ideen / Projekte'],['foto','Vollbild-Foto'],['leer','Leere Folie']];
function stBauEinfuegen(key){ const b=ST_BAU.find(x=>x[0]===key); const sec=stSec(); if(!b||!sec)return;
  const html=b[2](); const s=(ST.p.breite/1920);
  const t=document.createElement('template'); t.innerHTML=html.trim(); const n=t.content.firstElementChild; [n,...n.querySelectorAll('*')].forEach(e=>e.dataset.stId=stId());
  if(s<0.98)n.style.zoom=s.toFixed(4);   // Bausteine sind für 1920 px gebaut, auf A4 maßstäblich verkleinern
  if(key==='fuss'||key==='foto'){ if(key==='foto'){ stTun([{t:'add',id:n.dataset.stId,parent:'@',before:sec.firstElementChild?stIdOf(sec,sec.firstElementChild):null,html:n.outerHTML}]); } else stTun([{t:'add',id:n.dataset.stId,parent:'@',before:null,html:n.outerHTML}]); }
  else stTun([{t:'add',id:n.dataset.stId,parent:'@',before:null,html:n.outerHTML}]);
  ST.sel=[n.dataset.stId]; stMarkieren(); stNachAenderung(); }
function stBausteinePanel(R){ R.innerHTML=`<h4>Bausteine</h4><p class="note small">Einfügen, dann ziehen und Text per Doppelklick ändern. Fehlende Angaben stehen als XX.</p>
  <div class="st-baul">${ST_BAU.map(b=>`<button type="button" class="st-bau" data-bau="${b[0]}">${stE(b[1])}</button>`).join('')}</div>
  <h4>Neue Folie aus Vorlage</h4><div class="st-baul">${(ST.p.art==='deck'?ST_FV:[['seite','Briefbogen-Seite'],['leer','Leere Seite']]).map(v=>`<button type="button" class="st-bau" data-fv="${v[0]}">${stE(v[1])}</button>`).join('')}</div>`;
  R.querySelectorAll('[data-bau]').forEach(b=>b.onclick=()=>stBauEinfuegen(b.dataset.bau));
  R.querySelectorAll('[data-fv]').forEach(b=>b.onclick=()=>stFolieNeu(b.dataset.fv)); }
function stFolieNeuMenue(anker){ stRechts('bau'); }
function stFolieNeu(art){ const html=ST.p.art==='deck'?stVorlageFolie(art,{nr:String(ST.cur+2)}):(art==='seite'?stVorlageSeite():`<section class="page" style="position:relative;background:#ffffff;box-sizing:border-box;overflow:hidden"></section>`);
  stFolieEinfuegen(ST.cur,html,(ST_FV.find(v=>v[0]===art)||[0,art==='seite'?'Seite':'Folie'])[1]); }

/* ---------- Mediathek ---------- */
async function stMedienLaden(neu){ if(ST.medien&&!neu)return ST.medien;
  const {data,error}=await SVB.sb.from('studio_medien').select('pfad,name,tags,breite,hoehe').order('pfad'); ST.medien=error?[]:(data||[]);
  await stUrlsLaden(ST.medien.map(m=>m.pfad)); return ST.medien; }
const ST_TAGS=[['person','Person'],['logo','Logo'],['foto','Foto'],['stadion','Stadion']];
function stMedienHtml(L,auswahl){ const f=ST.mfilter||'';
  const M=L.filter(m=>!f||(m.tags||[]).includes(f));
  return `<div class="st-mf"><button type="button" class="${!f?'on':''}" data-mf="">Alle</button>${ST_TAGS.map(([k,t])=>`<button type="button" class="${f===k?'on':''}" data-mf="${k}">${t}</button>`).join('')}</div>
    ${stKann()?`<label class="st-drop"><input type="file" accept="image/*" multiple hidden data-mup>${SVI('upload')} Bilder hochladen oder hierher ziehen</label>`:''}
    <div class="st-mg">${M.map(m=>`<button type="button" class="st-m" draggable="true" data-m="${stE(m.pfad)}" title="${stE(m.name||m.pfad)}"><img src="${stE(stUrl(m.pfad))}" alt="" loading="lazy"><span>${stE((m.name||m.pfad.slice(7)).replace(/\.\w+$/,''))}</span></button>`).join('')||'<p class="note">Noch keine Bilder.</p>'}</div>`; }
function stMedienBinden(box,L,wahl,neu){ box.querySelectorAll('[data-mf]').forEach(b=>b.onclick=()=>{ ST.mfilter=b.dataset.mf; neu(); });
  box.querySelectorAll('[data-m]').forEach(b=>{ b.onclick=()=>wahl&&wahl(b.dataset.m); b.ondragstart=e=>e.dataTransfer.setData('text/st-medium',b.dataset.m); });
  const up=box.querySelector('[data-mup]'); if(up)up.onchange=async()=>{ await stHochladen([...up.files]); neu(); };
  const dr=box.querySelector('.st-drop'); if(dr){ dr.ondragover=e=>{ e.preventDefault(); dr.classList.add('over'); }; dr.ondragleave=()=>dr.classList.remove('over'); dr.ondrop=async e=>{ e.preventDefault(); dr.classList.remove('over'); await stHochladen([...e.dataTransfer.files].filter(f=>/^image\//.test(f.type))); neu(); }; } }
async function stMedienPanel(R){ R.innerHTML='<h4>Medien</h4><div class="empty">Lade …</div>'; const L=await stMedienLaden(); const neu=async()=>{ const L2=await stMedienLaden(); R.innerHTML='<h4>Medien</h4><p class="note small">Auf ein Bild auf der Folie ziehen ersetzt es, auf freie Fläche ziehen fügt es ein.</p>'+stMedienHtml(L2); stMedienBinden(R,L2,p=>stBildEinfuegen(p),neu); }; neu(); }
async function stMediathek(wahl){ const M=svModal('<h2>Mediathek</h2><div id="stMd"><div class="empty">Lade …</div></div>'); M.classList.add('st-modal');
  const box=M.querySelector('#stMd'); const neu=async()=>{ const L=await stMedienLaden(); box.innerHTML=stMedienHtml(L); stMedienBinden(box,L,wahl?p=>{ closeOverlay(); wahl(p); }:null,neu); }; neu(); }
function stSlug(n){ return String(n).toLowerCase().replace(/ä/g,'ae').replace(/ö/g,'oe').replace(/ü/g,'ue').replace(/ß/g,'ss').replace(/[^a-z0-9.]+/g,'-').replace(/^-+|-+$/g,'').slice(0,80)||'bild'; }
async function stHochladen(files){ const out=[]; for(const f of files){ if(!/^image\//.test(f.type))continue;
    let blob=f, ext=(f.name.split('.').pop()||'png').toLowerCase(); try{ const r=await stVerkleinern(f); if(r){ blob=r.blob; ext=r.ext; } }catch(e){}
    const name=f.name.replace(/\.\w+$/,''); const pfad='assets/'+stSlug(name)+'-'+Date.now().toString(36).slice(-4)+'.'+ext;
    const {error}=await SVB.sb.storage.from('studio').upload(pfad,blob,{contentType:blob.type||f.type,upsert:false}); if(error){ kToast('⚠️ '+error.message); continue; }
    const tags=/logo|wappen/i.test(name)?['logo']:/(^|[^a-z])qr([^a-z]|$)/i.test(name)?['qr']:/^p-|portrait|person/i.test(name)?['person']:/stadion|platz/i.test(name)?['stadion','foto']:['foto'];
    const mass=await stBildMass(blob);   // 0.99.21: Maße und Größe mitschreiben, das Spieltagsstudio zeigt nur Bilder mit bekannter Größe
    await SVB.sb.from('studio_medien').insert({pfad,name,tags,breite:mass?mass.w:null,hoehe:mass?mass.h:null,bytes:blob.size||null}); out.push(pfad); }
  ST.medien=null; if(out.length){ await stUrlsLaden(out); kToast(`✓ ${out.length} Bild${out.length>1?'er':''} hochgeladen`); } return out; }
function stBildMass(b){ return new Promise(res=>{ if(/svg/i.test(b.type||''))return res(null); const u=URL.createObjectURL(b), im=new Image(); im.onload=()=>{ URL.revokeObjectURL(u); res(im.naturalWidth&&im.naturalHeight?{w:im.naturalWidth,h:im.naturalHeight}:null); }; im.onerror=()=>{ URL.revokeObjectURL(u); res(null); }; im.src=u; }); }
function stVerkleinern(f){ return new Promise(res=>{ const u=URL.createObjectURL(f), im=new Image(); im.onload=()=>{ const max=2400, s=Math.min(1,max/Math.max(im.width,im.height)); if(s===1&&f.size<1.5e6){ URL.revokeObjectURL(u); return res(null); }
    const c=document.createElement('canvas'); c.width=Math.round(im.width*s); c.height=Math.round(im.height*s); c.getContext('2d').drawImage(im,0,0,c.width,c.height); URL.revokeObjectURL(u);
    const png=f.type==='image/png'&&f.size<800000; c.toBlob(b=>res(b?{blob:b,ext:png?'png':'jpg'}:null),png?'image/png':'image/jpeg',0.88); }; im.onerror=()=>res(null); im.src=u; }); }
function stBildSetzen(el,pfad){ if(!el)return; const sec=stSec(); if(el.tagName==='IMG')stAttr(el,'src',pfad);
  else if(el.dataset.stSlot!=null){ const old=el.innerHTML; const n=`<img src="${pfad}" alt="" data-st-id="${stId()}" style="width:100%;height:100%;object-fit:cover;display:block">`; stTun([{t:'html',id:stIdOf(sec,el),v:n,old}]); }
  stCanvas(true); }
async function stBildEinfuegen(pfad){ await stUrlsLaden([pfad]); const sec=stSec(); const el=ST.sel.length===1?stFind(sec,ST.sel[0]):null;
  if(el&&(el.tagName==='IMG'||el.dataset.stSlot!=null))return stBildSetzen(el,pfad);
  const id=stId(), W=ST.p.breite, H=ST.p.hoehe; stTun([{t:'add',id,parent:'@',before:null,html:`<img src="${pfad}" alt="" data-st-id="${id}" style="position:absolute;left:${Math.round(W*0.55)}px;top:${Math.round(H*0.25)}px;width:${Math.round(W*0.33)}px;height:${Math.round(H*0.45)}px;object-fit:cover;display:block">`}]); stCanvas(true); ST.sel=[id]; stMarkieren(); stNachAenderung(); }
async function stBildDrop(e){ const sec=stSec(); const path=e.composedPath(); const ziel=path.find(n=>n.nodeType===1&&(n.tagName==='IMG'||(n.dataset&&n.dataset.stSlot!=null))&&sec.contains(n));
  let pfad=e.dataTransfer.getData('text/st-medium');
  if(!pfad&&e.dataTransfer.files.length){ const r=await stHochladen([...e.dataTransfer.files]); pfad=r[0]; }
  if(!pfad)return; await stUrlsLaden([pfad]);
  if(ziel){ ST.sel=[stIdOf(sec,ziel)]; stBildSetzen(ziel,pfad); } else stBildEinfuegen(pfad); }

/* ---------- Präsentieren mit Referentenansicht ---------- */
function stPraesentieren(start){ const PL=(ST.alle||ST.folien).filter(f=>!f.ist_master).sort((a,b)=>a.pos-b.pos); if(ST.mModus)start=0; else if(start==null)start=PL.indexOf(ST.folien[ST.cur]);
  const V=PL.map((f,i)=>i).filter(i=>!PL[i].skip); if(!V.length)return kToast('Keine sichtbare Folie');
  let k=Math.max(0,V.indexOf(start)); if(k<0)k=0;
  const O=document.createElement('div'); O.className='st-praes'; O.innerHTML='<div class="st-pb"><div class="st-host"></div></div><div class="st-pz"></div><button type="button" class="st-px" title="Beenden (Esc)">✕</button><button type="button" class="st-pr" title="Referentenansicht">Referentenansicht</button>';
  document.body.appendChild(O); ST.praes={O,V,k,t0:Date.now()};
  const bc=('BroadcastChannel' in window)?new BroadcastChannel('st-praes'):null; ST.praes.bc=bc;
  const zeig=()=>{ const f=PL[V[k]], s=Math.min(innerWidth/ST.p.breite,innerHeight/ST.p.hoehe), B=O.querySelector('.st-pb'), h=B.querySelector('.st-host');
    B.style.width=ST.p.breite*s+'px'; B.style.height=ST.p.hoehe*s+'px'; h.style.transform=`scale(${s})`; stMount(h,f,{}); O.querySelector('.st-pz').textContent=`${k+1} / ${V.length}`;
    if(bc)bc.postMessage({k,n:V.length,cur:V[k],next:V[k+1]!=null?V[k+1]:null,t0:ST.praes.t0}); };
  const go=d=>{ k=Math.max(0,Math.min(V.length-1,k+d)); ST.praes.k=k; zeig(); };
  const end=()=>{ document.removeEventListener('keydown',key,true); window.removeEventListener('resize',zeig); O.remove(); try{ document.exitFullscreen(); }catch(e){} if(bc)bc.close(); ST.praes=null; };
  const key=e=>{ if(['ArrowRight','ArrowDown','PageDown',' ','Enter'].includes(e.key)){ e.preventDefault(); go(1); } else if(['ArrowLeft','ArrowUp','PageUp','Backspace'].includes(e.key)){ e.preventDefault(); go(-1); } else if(e.key==='Escape'){ e.preventDefault(); end(); } else if(e.key==='Home')go(-1e3); else if(e.key==='End')go(1e3); };
  document.addEventListener('keydown',key,true); window.addEventListener('resize',zeig);
  O.querySelector('.st-pb').onclick=()=>go(1); O.querySelector('.st-px').onclick=end; O.querySelector('.st-pr').onclick=()=>stReferent();
  if(bc)bc.onmessage=m=>{ if(m.data&&m.data.go)go(m.data.go); if(m.data&&m.data.hallo)zeig(); };
  try{ O.requestFullscreen&&O.requestFullscreen(); }catch(e){} zeig(); }
function stReferent(){ const w=window.open('','st-referent','width=1100,height=700'); if(!w)return kToast('Bitte Pop-ups für diese Seite erlauben');
  const css=stBaseCss(ST.p)+'\n'+stCssSauber(ST.p.css), folien=(ST.alle||ST.folien).filter(f=>!f.ist_master).sort((a,b)=>a.pos-b.pos).map(f=>{ const m=stMasterVon(f); return {html:stHtmlRein(stRootInner(f.html,m&&m.html,m&&stFelder(f))),notiz:f.notiz||'',label:f.label||''}; });
  w.document.open(); w.document.write(`<!doctype html><html lang="de"><head><meta charset="utf-8"><title>Referentenansicht</title><link rel="stylesheet" href="${ST_FONTS}"><style>
    body{margin:0;background:#101532;color:#fff;font-family:Barlow,sans-serif;display:grid;grid-template-columns:3fr 2fr;grid-template-rows:auto 1fr;gap:16px;padding:16px;height:100vh;box-sizing:border-box}
    .k{grid-column:1/-1;display:flex;gap:16px;align-items:center;font:700 22px 'Barlow Condensed',sans-serif;letter-spacing:.06em;text-transform:uppercase}.k b{font-size:40px;color:#e8741f}.k button{font:inherit;font-size:16px;padding:8px 16px;border-radius:8px;border:0;background:#1d2760;color:#fff;cursor:pointer}
    .bx{position:relative;overflow:hidden;background:#000}.bx>div{position:absolute;left:0;top:0;transform-origin:0 0}.n{font-size:24px;line-height:1.5;overflow:auto;white-space:pre-wrap;background:rgba(255,255,255,.06);padding:16px;border-radius:10px}
    .r{display:grid;grid-template-rows:auto 1fr;gap:12px;min-height:0}.l{opacity:.7;font-size:14px;text-transform:uppercase;letter-spacing:.1em}</style></head><body>
    <div class="k"><span id="z">–</span><span>⏱ <b id="t">00:00</b></span><span style="flex:1"></span><button id="p">◀ Zurück</button><button id="nx">Weiter ▶</button></div>
    <div class="r"><div class="l">Aktuelle Folie</div><div class="bx" id="a"><div></div></div></div><div class="r"><div class="l">Als Nächstes</div><div class="bx" id="b" style="max-height:40vh"><div></div></div><div class="l">Notizen</div><div class="n" id="no"></div></div></body></html>`);
  w.document.close();
  const F=folien, W=ST.p.breite, H=ST.p.hoehe;
  const setz=(box,f)=>{ const d=box.firstElementChild; const r=d.shadowRoot||d.attachShadow({mode:'open'}); const s=box.clientWidth/W; box.style.height=H*s+'px'; d.style.transform=`scale(${s})`; d.style.width=W+'px'; d.style.height=H+'px'; r.innerHTML=f?`<style>${css}</style><div class="st-root">${f.html}</div>`:''; };
  const bc=new BroadcastChannel('st-praes'); let t0=Date.now();
  bc.onmessage=m=>{ const x=m.data; if(!x||x.cur==null)return; t0=x.t0||t0; w.document.getElementById('z').textContent=`Folie ${x.k+1} / ${x.n}`; setz(w.document.getElementById('a'),F[x.cur]); setz(w.document.getElementById('b'),x.next!=null?F[x.next]:null); w.document.getElementById('no').textContent=F[x.cur].notiz||'Keine Notizen.'; };
  w.document.getElementById('p').onclick=()=>bc.postMessage({go:-1}); w.document.getElementById('nx').onclick=()=>bc.postMessage({go:1});
  w.addEventListener('keydown',e=>{ if(['ArrowRight',' ','PageDown'].includes(e.key))bc.postMessage({go:1}); if(['ArrowLeft','PageUp'].includes(e.key))bc.postMessage({go:-1}); });
  const tick=setInterval(()=>{ if(w.closed){ clearInterval(tick); bc.close(); return; } const s=Math.floor((Date.now()-t0)/1000); w.document.getElementById('t').textContent=String(Math.floor(s/60)).padStart(2,'0')+':'+String(s%60).padStart(2,'0'); },1000);
  setTimeout(()=>bc.postMessage({hallo:1}),300); }

/* ---------- Import von .dc.html (Claude Design) ---------- */
async function stImportDateien(files){ const html=files.filter(f=>/\.html?$/i.test(f.name)), bilder=files.filter(f=>/^image\//.test(f.type));
  if(!html.length&&bilder.length){ await stHochladen(bilder); return; }
  // Bilder mit ihrem Originalnamen (assets/name) hochladen, damit die Verweise in der Datei passen
  for(const b of bilder){ const pfad='assets/'+stSlug(b.name); const {error}=await SVB.sb.storage.from('studio').upload(pfad,b,{contentType:b.type,upsert:true}); if(!error)await SVB.sb.from('studio_medien').upsert({pfad,name:b.name.replace(/\.\w+$/,''),tags:['foto']}); }
  let n=0; for(const f of html){ try{ const id=await stImportEine(await f.text(),f.name.replace(/\.dc\.html?$|\.html?$/i,'')); if(id)n++; }catch(e){ kToast('⚠️ '+f.name+': '+(e.message||e)); } }
  if(n){ kToast(`✓ ${n} Projekt${n>1?'e':''} importiert`); await stProjekteLaden(); stListe(); } }
async function stImportEine(text,titel){ const d=new DOMParser().parseFromString(text,'text/html');
  const deck=d.querySelector('deck-stage,x-import[component-from-global-scope="deck-stage"]'), doc=d.querySelector('doc-page');
  let art='frei', W=1280, H=1800;
  if(deck){ art='deck'; W=+(deck.getAttribute('width')||1920); H=+(deck.getAttribute('height')||1080); }
  else if(doc){ art='doc'; const q=doc.getAttribute('orientation')==='landscape'; W=q?1123:794; H=q?794:1123; }
  if(d.querySelector('sc-for,sc-if'))kToast('Hinweis: Diese Datei nutzt Platzhalter-Listen. Sie werden so übernommen, wie sie in der Datei stehen.');
  const css=[...d.querySelectorAll('helmet style, head style')].map(s=>s.textContent).join('\n');
  let S=[...d.querySelectorAll('section')].filter(s=>!s.parentElement.closest('section'));
  const seiten=S.map(s=>{ const c=s.cloneNode(true); c.querySelectorAll('script').forEach(x=>x.remove());
    c.querySelectorAll('image-slot').forEach(x=>{ const v=document.createElement('div'); v.setAttribute('data-st-slot',x.id||'bild'); v.setAttribute('data-st-ph',x.getAttribute('placeholder')||'Bild'); v.setAttribute('style',(x.getAttribute('style')||'')+';display:block;overflow:hidden'); x.replaceWith(v); });
    const r={label:s.dataset.label||s.dataset.screenLabel||'',notiz:s.dataset.speakerNotes||'',skip:s.hasAttribute('data-deck-skip')};
    [c,...c.querySelectorAll('*')].forEach(e=>{ [...e.attributes].forEach(a=>{ if(/^data-(dc-|om-|deck-|screen-label|speaker-notes)/.test(a.name))e.removeAttribute(a.name); }); });
    let i=0; c.querySelectorAll('*').forEach(e=>e.setAttribute('data-st-id','i'+(i++).toString(36)));
    r.html=c.outerHTML.replace(/\bsrc="\.\/assets\//g,'src="assets/').replace(/url\(['"]?\.\/assets\//g,"url('assets/"); return r; });
  if(!seiten.length){ const body=d.querySelector('x-dc')||d.body; const wrap=document.createElement('section'); [...body.children].filter(x=>!/^(HELMET|TEMPLATE|SCRIPT|STYLE|LINK)$/.test(x.tagName)).forEach(x=>wrap.appendChild(x.cloneNode(true)));
    if(!wrap.textContent.trim()&&!wrap.querySelector('img'))return null; let i=0; wrap.querySelectorAll('*').forEach(e=>e.setAttribute('data-st-id','i'+(i++).toString(36))); seiten.push({label:'Seite 1',notiz:'',skip:false,html:wrap.outerHTML}); }
  const {data:p,error}=await SVB.sb.from('studio_projekte').insert({titel:titel.slice(0,160),art,breite:W,hoehe:H,css:css.slice(0,60000),quelle:'import',bereich:stStdBereich()}).select('id').single(); if(error)throw error;
  const rows=seiten.map((s,i)=>Object.assign({projekt_id:p.id,pos:i+1},s));
  for(let i=0;i<rows.length;i+=10){ const {error:e2}=await SVB.sb.from('studio_folien').insert(rows.slice(i,i+10)); if(e2)throw e2; }
  return p.id; }

/* =====================================================================
   SV/BSC Studio (Teil 4: Live-Zusammenarbeit, Kommentare, Versionen, Export, KI-Assistent, Personen)
   ===================================================================== */
const ST_FARBEN=['#e8741f','#2f9e6b','#c2410c','#7c3aed','#0891b2','#be185d','#65a30d','#b45309'];
function stMeinName(){ return (typeof SVU!=='undefined'&&(SVU.name||SVU.email))||'Ich'; }
function stMeineId(){ return (SVB.user&&SVB.user.id)||(typeof SVU!=='undefined'&&SVU.id)||'ich'; }
function stFarbeFuer(id){ let h=0; for(const c of String(id))h=(h*31+c.charCodeAt(0))|0; return ST_FARBEN[Math.abs(h)%ST_FARBEN.length]; }

/* ---------- Live: wer ist da, Mauszeiger, Auswahl, Änderungen sofort ---------- */
function stLiveStart(){ stLiveEnde(); if(!ST.p||!SVB.sb.channel)return;
  try{ const ch=SVB.sb.channel('studio-'+ST.p.id,{config:{broadcast:{self:false},presence:{key:stMeineId()}}});
    ST.live={ch,andere:new Map(),maus:new Map()};
    ch.on('broadcast',{event:'ops'},({payload})=>stLiveEmpfang(payload));
    ch.on('broadcast',{event:'maus'},({payload})=>{ if(!payload)return; ST.live.maus.set(payload.u,payload); stRemoteZeichnen(); });
    ch.on('presence',{event:'sync'},()=>{ const s=ch.presenceState(); ST.live.andere=new Map(); Object.entries(s).forEach(([k,v])=>{ if(k!==stMeineId()&&v&&v[0])ST.live.andere.set(k,v[0]); }); stLiveLeiste(); stRemoteZeichnen(); });
    ch.subscribe(st=>{ if(st==='SUBSCRIBED')stLivePraesenz(); });
    const B=document.getElementById('stBuehne'); let t=0;
    if(B)B.addEventListener('pointermove',e=>{ if(!ST.live||Date.now()-t<70)return; t=Date.now(); const r=B.getBoundingClientRect(), s=ST.s||1; const f=stF(); if(!f)return;
      ST.live.ch.send({type:'broadcast',event:'maus',payload:{u:stMeineId(),n:stMeinName(),f:f.id,x:Math.round((e.clientX-r.left)/s),y:Math.round((e.clientY-r.top)/s)}}); });
  }catch(e){ console.warn('Studio live',e); ST.live=null; } }
function stLiveEnde(){ try{ if(ST.live&&ST.live.ch)SVB.sb.removeChannel(ST.live.ch); }catch(e){} ST.live=null; }
function stLivePraesenz(){ if(!ST.live)return; const f=stF(); try{ ST.live.ch.track({n:stMeinName(),f:f&&f.id,sel:ST.sel.slice(0,5),c:stFarbeFuer(stMeineId())}); }catch(e){} }
function stLiveSenden(fid,ops){ if(!ST.live)return; try{ ST.live.ch.send({type:'broadcast',event:'ops',payload:{u:stMeineId(),fid,ops}}); }catch(e){} }
async function stLiveEmpfang(x){ if(!x||!ST.p)return;
  if(x.ops&&x.ops[0]&&x.ops[0].t==='folien'){ await stFolienNachladen(); return; }
  const f=stFolieId(x.fid); if(!f)return;
  await stUrlsLaden([...new Set(x.ops.flatMap(o=>stAssets(o.html||o.v||'')))]);
  if(stF()&&stF().id===f.id){ const sec=stSec(); x.ops.forEach(o=>{ if(ST.edit&&o.id===ST.edit.id)return; stOpAnwenden(sec,o); }); f.html=stHtmlRaus(sec.outerHTML); stMarkieren(); stOverlay(); }
  else { const t=document.createElement('template'); t.innerHTML=f.html; const sec=t.content.firstElementChild; x.ops.forEach(o=>stOpAnwenden(sec,o)); f.html=sec.outerHTML; }
  if(f.ist_master&&!ST.mModus){ const a=stF(); if(a&&a.master_id===f.id)stCanvas(true); stFolienliste(); } else stThumb(ST.folien.indexOf(f)); }
async function stFolienNachladen(){ const {data}=await SVB.sb.from('studio_folien').select(ST_FSEL).eq('projekt_id',ST.p.id).order('pos'); if(!data)return;
  const akt=stF()&&stF().id; const alt=new Map((ST.alle||[]).map(f=>[f.id,f]));
  ST.alle=data.map(d=>{ const a=alt.get(d.id); if(a&&((ST.q.get(d.id)||[]).length||(a.meta&&a.meta.size)))return a; ST.basis.set(d.id,d.version); return d; }); stSicht();
  await stUrlsLaden([...new Set(ST.alle.flatMap(f=>stAssets(f.html)))]);
  const i=ST.folien.findIndex(f=>f.id===akt); ST.cur=i>=0?i:Math.min(ST.cur,ST.folien.length-1); stFolienliste(); stCanvas(true); }
function stLiveLeiste(){ const L=document.getElementById('stLive'); if(!L||!ST.live)return; const A=[...ST.live.andere.entries()];
  L.innerHTML=A.map(([k,v])=>`<span class="st-av" style="background:${stE(v.c||stFarbeFuer(k))}" title="${stE(v.n||'')}${v.f&&ST.folien.findIndex(f=>f.id===v.f)>=0?' · Folie '+(ST.folien.findIndex(f=>f.id===v.f)+1):''}">${stE(svIni(v.n||'?'))}</span>`).join('');
  L.querySelectorAll('.st-av').forEach((el,i)=>el.onclick=()=>{ const v=A[i][1]; const j=ST.folien.findIndex(f=>f.id===v.f); if(j>=0)stGeheZu(j); }); }
function stRemoteZeichnen(){ const O=document.getElementById('stOv'); const sec=stSec(); const f=stF(); if(!O||!sec||!f)return; O.querySelectorAll('.st-rm,.st-rz,.st-kp').forEach(x=>x.remove()); const s=ST.s||1;
  if(ST.live){ ST.live.andere.forEach((v,k)=>{ if(v.f!==f.id)return; (v.sel||[]).forEach(id=>{ const el=stFind(sec,id); if(!el||el===sec)return; const r=stRect(el); const d=document.createElement('div'); d.className='st-rm'; Object.assign(d.style,{left:r.x+'px',top:r.y+'px',width:r.w+'px',height:r.h+'px',borderColor:v.c}); d.innerHTML=`<span style="background:${stE(v.c)}">${stE(v.n||'')}</span>`; O.appendChild(d); }); });
    ST.live.maus.forEach(m=>{ if(m.f!==f.id||!ST.live.andere.has(m.u))return; const v=ST.live.andere.get(m.u); const d=document.createElement('div'); d.className='st-rz'; d.style.left=m.x*s+'px'; d.style.top=m.y*s+'px'; d.style.color=v.c; d.innerHTML=`<svg width="18" height="18" viewBox="0 0 18 18"><path d="M2 2l13 6-6 1.5L7 16z" fill="currentColor" stroke="#fff" stroke-width="1.2"/></svg><span style="background:${stE(v.c)}">${stE(m.n||'')}</span>`; O.appendChild(d); }); }
  // Kommentar-Pins
  (ST.kom||[]).filter(k=>k.folie_id===f.id&&!k.erledigt&&!k.eltern_id).forEach((k,i)=>{ const el=k.element_id?stFind(sec,k.element_id):null; const r=el?stRect(el):{x:12,y:12,w:0,h:0}; const d=document.createElement('button'); d.type='button'; d.className='st-kp'; d.style.left=(r.x+r.w-10)+'px'; d.style.top=(r.y-10)+'px'; d.textContent='💬'; d.title=k.text; d.onclick=()=>{ stRechts('kom'); }; O.appendChild(d); }); }

/* ---------- Kommentare ---------- */
async function stKommentareLaden(){ const {data}=await SVB.sb.from('studio_kommentare').select('*').eq('projekt_id',ST.p.id).order('am'); ST.kom=data||[];
  if(!ST.leute){ try{ const {data:L}=await SVB.sb.from('profiles').select('id,name').eq('active',true).order('name'); ST.leute=(L||[]).filter(x=>x.name); }catch(e){ ST.leute=[]; } } }
async function stKommentarePanel(R){ R.innerHTML='<h4>Kommentare</h4><div class="empty">Lade …</div>'; await stKommentareLaden(); stKomZeichnen(R); stRemoteZeichnen(); }
function stKomZeichnen(R){ R=R||document.getElementById('stRechts'); if(!R||R.dataset.art!=='kom')return; const f=stF(); const nur=ST.komFilter||'folie';
  const L=(ST.kom||[]).filter(k=>!k.eltern_id&&(nur==='alle'||(nur==='offen'?!k.erledigt:k.folie_id===(f&&f.id))));
  const name=id=>{ const p=(ST.leute||[]).find(x=>x.id===id); return p?p.name:'Jemand'; };
  const txt=t=>stE(t).replace(/@([A-ZÄÖÜa-zäöüß][\wäöüß]+(?:\s[A-ZÄÖÜ][\wäöüß]+)?)/g,'<b class="st-at">@$1</b>');
  R.innerHTML=`<h4>Kommentare</h4><div class="st-mf">${[['folie','Diese Folie'],['offen','Offen'],['alle','Alle']].map(([k,t])=>`<button type="button" class="${nur===k?'on':''}" data-kf="${k}">${t}</button>`).join('')}</div>
    <div class="st-kn"><div class="st-kz" id="stKz">${ST.komZiel&&ST.komZiel!=='@'?'Zum gewählten Element':'Zur ganzen Folie'} <button type="button" class="btn sm ghost" id="stKw">Element wählen</button></div>
      <textarea id="stKt" rows="3" placeholder="Kommentar … mit @Name jemanden erwähnen"></textarea><div class="st-ksug" id="stKs"></div><button type="button" class="btn sm" id="stKs2">Kommentieren</button></div>
    <div class="st-kl">${L.map(k=>{ const ant=(ST.kom||[]).filter(a=>a.eltern_id===k.id); const fi=ST.folien.findIndex(x=>x.id===k.folie_id);
      return `<div class="st-k${k.erledigt?' erl':''}"><div class="st-kh"><b>${stE(name(k.von))}</b><small>${fi>=0?'Folie '+(fi+1)+' · ':''}${TRC.fmt(String(k.am).slice(0,10))}</small></div><p>${txt(k.text)}</p>
        ${ant.map(a=>`<div class="st-ka"><b>${stE(name(a.von))}</b> ${txt(a.text)}</div>`).join('')}
        <div class="st-kb"><button type="button" data-kerl="${k.id}">${k.erledigt?'Wieder öffnen':'✓ Erledigt'}</button><button type="button" data-kant="${k.id}">Antworten</button>${fi>=0&&fi!==ST.cur?`<button type="button" data-kgo="${fi}">Zur Folie</button>`:''}</div></div>`; }).join('')||'<p class="note">Keine Kommentare.</p>'}</div>`;
  R.querySelectorAll('[data-kf]').forEach(b=>b.onclick=()=>{ ST.komFilter=b.dataset.kf; stKomZeichnen(R); });
  R.querySelector('#stKw').onclick=()=>{ ST.kommentarModus=true; kToast('Jetzt auf ein Element der Folie klicken'); };
  const ta=R.querySelector('#stKt'), sug=R.querySelector('#stKs');
  ta.oninput=()=>{ const m=ta.value.slice(0,ta.selectionStart).match(/@([\wäöüß]*)$/i); if(!m){ sug.innerHTML=''; return; }
    const L2=(ST.leute||[]).filter(p=>p.name.toLowerCase().includes(m[1].toLowerCase())).slice(0,6); sug.innerHTML=L2.map(p=>`<button type="button" data-ku="${stE(p.id)}">${stE(p.name)}</button>`).join('');
    sug.querySelectorAll('[data-ku]').forEach(b=>b.onclick=()=>{ const p=ST.leute.find(x=>x.id===b.dataset.ku); const pos=ta.selectionStart; const vor=ta.value.slice(0,pos).replace(/@[\wäöüß]*$/i,'@'+p.name+' '); ta.value=vor+ta.value.slice(pos); sug.innerHTML=''; ta.focus(); }); };
  R.querySelector('#stKs2').onclick=async()=>{ const t=ta.value.trim(); if(!t)return; const f=stF();
    const erw=(ST.leute||[]).filter(p=>t.includes('@'+p.name)).map(p=>p.id);
    const row={projekt_id:ST.p.id,folie_id:f&&f.id,element_id:ST.komZiel&&ST.komZiel!=='@'?ST.komZiel:null,eltern_id:ST.komAntwort||null,text:t,erwaehnt:erw,von:stMeineId()};
    const {error}=await SVB.sb.from('studio_kommentare').insert(row); if(error)return kToast('⚠️ '+error.message);
    ST.komZiel=null; ST.komAntwort=null; await stKommentareLaden(); stKomZeichnen(R); stRemoteZeichnen(); try{ stLiveSenden(null,[{t:'kommentar'}]); }catch(e){} };
  R.querySelectorAll('[data-kerl]').forEach(b=>b.onclick=async()=>{ const k=ST.kom.find(x=>x.id===b.dataset.kerl); await SVB.sb.from('studio_kommentare').update({erledigt:!k.erledigt}).eq('id',k.id); await stKommentareLaden(); stKomZeichnen(R); stRemoteZeichnen(); });
  R.querySelectorAll('[data-kant]').forEach(b=>b.onclick=()=>{ ST.komAntwort=b.dataset.kant; ta.placeholder='Antwort …'; ta.focus(); });
  R.querySelectorAll('[data-kgo]').forEach(b=>b.onclick=()=>stGeheZu(+b.dataset.kgo)); }
function stKommentarAn(id){ ST.kommentarModus=false; ST.komZiel=id; const R=document.getElementById('stRechts'); if(!R||R.dataset.art!=='kom'){ stRechts('kom'); return; } const z=R.querySelector('#stKz'); if(z)z.firstChild.textContent=id&&id!=='@'?'Zum gewählten Element ':'Zur ganzen Folie '; const ta=R.querySelector('#stKt'); if(ta)ta.focus(); }

/* ---------- Versionen ---------- */
async function stVersionenPanel(R){ R.innerHTML='<h4>Versionen</h4><div class="empty">Lade …</div>';
  const {data}=await SVB.sb.from('studio_versionen').select('id,name,am,von').eq('projekt_id',ST.p.id).order('am',{ascending:false}); const L=data||[];
  const vor=`v${L.length+1} – ${TRC.fmt(trToday())}${trToday().slice(0,4)}`;
  R.innerHTML=`<h4>Versionen</h4><p class="note small">Ein Stand speichert alle Folien so, wie sie jetzt sind. Wiederherstellen legt vorher automatisch einen Sicherungsstand an.</p>
    <div class="st-vn"><input class="st-in" id="stVn" value="${stE(vor)}"><button type="button" class="btn sm" id="stVs">Stand speichern</button></div>
    <div class="st-vl">${L.map(v=>`<div class="st-v"><b>${stE(v.name)}</b><small>${TRC.fmt(String(v.am).slice(0,10))}${String(v.am).slice(2,4)} ${String(new Date(v.am).toTimeString()).slice(0,5)}</small><button type="button" class="btn sm ghost" data-vw="${v.id}">Wiederherstellen</button></div>`).join('')||'<p class="note">Noch keine gespeicherten Stände.</p>'}</div>`;
  R.querySelector('#stVs').onclick=async()=>{ await stVersionAnlegen(R.querySelector('#stVn').value.trim()||vor); stVersionenPanel(R); };
  R.querySelectorAll('[data-vw]').forEach(b=>b.onclick=async()=>{ if(!b.classList.contains('sure')){ b.classList.add('sure'); b.textContent='Ja, wiederherstellen'; return; } b.disabled=true; await stVersionHerstellen(b.dataset.vw); stVersionenPanel(R); }); }
async function stVersionAnlegen(name){ await stSpeichernJetzt();
  const stand={projekt:{titel:ST.p.titel,css:ST.p.css,art:ST.p.art,breite:ST.p.breite,hoehe:ST.p.hoehe},folien:(ST.alle||ST.folien).map(f=>({id:f.id,pos:f.pos,label:f.label,notiz:f.notiz,skip:f.skip,html:f.html,ist_master:!!f.ist_master,master_id:f.master_id||null}))};
  const {error}=await SVB.sb.from('studio_versionen').insert({projekt_id:ST.p.id,name:name.slice(0,120),stand}); if(error)kToast('⚠️ '+error.message); else kToast('✓ Stand „'+name+'“ gespeichert'); }
async function stVersionHerstellen(id){ const {data:v,error}=await SVB.sb.from('studio_versionen').select('*').eq('id',id).single(); if(error)return kToast('⚠️ '+error.message);
  await stVersionAnlegen('Sicherung vor Wiederherstellen von „'+v.name+'“');
  const soll=new Set(v.stand.folien.map(f=>f.id)); const weg=(ST.alle||ST.folien).filter(f=>!soll.has(f.id)).map(f=>f.id);
  if(weg.length)await SVB.sb.from('studio_folien').delete().in('id',weg);
  for(const f of v.stand.folien.slice().sort((a,b)=>(b.ist_master?1:0)-(a.ist_master?1:0))){ const row={id:f.id,projekt_id:ST.p.id,pos:f.pos,label:f.label||'',notiz:f.notiz||'',skip:!!f.skip,html:f.html,ist_master:!!f.ist_master,master_id:f.master_id||null}; const {error:e}=await SVB.sb.from('studio_folien').upsert(row); if(e){ kToast('⚠️ '+e.message); break; } }
  if(v.stand.projekt&&v.stand.projekt.css!=null)await SVB.sb.from('studio_projekte').update({css:v.stand.projekt.css}).eq('id',ST.p.id);
  await stProjektLaden(ST.p.id); stFolienliste(); stCanvas(); try{ stLiveSenden(null,[{t:'folien'}]); }catch(e){} kToast('✓ „'+v.name+'“ wiederhergestellt'); }

/* ---------- Export (PDF, PNG, ZIP) über den Server ---------- */
function stExportDialog(){ const M=svModal(`<h2>Exportieren</h2><p class="note">Der Server erzeugt die Datei mit einem echten Browser: jede Folie eine Seite in genau ${ST.p.breite}×${ST.p.hoehe} px, Text bleibt markierbar. Fertig zum Herunterladen, ohne Druckdialog.</p>
    <div class="st-exp">${[['pdf','PDF','alle sichtbaren Folien, eine Seite je Folie'],['png','PNG je Folie','als ZIP'],['zip','Alles als ZIP','PDF und alle PNG']].map(([k,t,d])=>`<label class="st-ex"><input type="radio" name="stEx" value="${k}" ${k==='pdf'?'checked':''}><b>${t}</b><small>${d}</small></label>`).join('')}</div>
    <label class="st-chk"><input type="checkbox" id="stExB"> Backup-Folien mit exportieren</label>
    <div class="btnrow" style="margin-top:14px"><button type="button" class="btn" id="stExGo">${SVI('download')} Exportieren</button></div><div id="stExS" class="note"></div>`);
  M.querySelector('#stExGo').onclick=async e=>{ const b=e.currentTarget; const fmt=M.querySelector('input[name=stEx]:checked').value, S=M.querySelector('#stExS'); b.disabled=true;
    try{ await stSpeichernJetzt(); S.textContent='Wird erzeugt …';
      const {data,error}=await SVB.sb.functions.invoke('studio-export',{body:{projekt:ST.p.id,format:fmt,backup:M.querySelector('#stExB').checked}});
      if(error)throw error; if(data&&data.error)throw new Error(data.error);
      const job=data&&data.id; if(!job)throw new Error('Kein Auftrag'); const warte=data.server===false?'Der Export-Server ist gerade nicht erreichbar. Der Auftrag bleibt gespeichert und wird erledigt, sobald er wieder läuft.':'Wartet auf den Export-Server …';
      for(let i=0;i<120;i++){ await new Promise(r=>setTimeout(r,i<5?2000:4000)); const {data:j}=await SVB.sb.from('studio_exporte').select('status,datei,fehler,ueberstand').eq('id',job).single();
        if(j&&j.status==='fertig'){ const ue=(j.ueberstand||[]).map((x,i)=>x>0?i+1:0).filter(Boolean); const name=(ST.p.titel||'Studio').replace(/[^\wäöüÄÖÜß .-]+/g,'').trim()+'.'+(fmt==='pdf'?'pdf':'zip');
          const {data:u}=await SVB.sb.storage.from('studio').createSignedUrl(j.datei,600,{download:name}); if(u&&u.signedUrl){ const a=document.createElement('a'); a.href=u.signedUrl; a.download=name; document.body.appendChild(a); a.click(); a.remove(); }
          S.innerHTML=(ue.length?`⚠️ Auf Seite ${ue.join(', ')} ragt Text über den Rand. `:'')+`✓ Fertig. Falls der Download nicht startet: <a href="${stE(u&&u.signedUrl||'#')}" target="_blank" rel="noopener">hier herunterladen</a>.`; b.disabled=false; return; }
        if(j&&j.status==='fehler')throw new Error(j.fehler||'Export fehlgeschlagen');
        S.textContent=j&&j.status==='laeuft'?'Der Server erzeugt die Seiten …':warte; }
      throw new Error('Das dauert ungewöhnlich lange. Bitte später nochmal versuchen.'); }
    catch(x){ S.textContent='⚠️ '+(x.message||x); b.disabled=false; } }; }

/* ---------- KI-Assistent ---------- */
function stKiPanel(R){ const f=stF(); const sec=stSec(); const el=ST.sel.length===1?stFind(sec,ST.sel[0]):null;
  const modi=[['neu','Neue Folie'],['folie','Diese Folie überarbeiten'],['element','Markierten Text umformulieren'],['deck','Präsentation aus Stichpunkten']];
  ST.kiModus=ST.kiModus||'neu'; if(ST.kiModus==='element'&&!el)ST.kiModus='folie';
  R.innerHTML=`<h4>✦ KI-Assistent</h4><p class="note small">Die KI baut nur aus den Vereins-Bausteinen und ändert nur, was du verlangst. Fehlende Angaben setzt sie als XX oder VAKANT, sie erfindet keine Namen oder Zahlen.</p>
    <div class="st-mf st-kim">${modi.map(([k,t])=>`<button type="button" class="${ST.kiModus===k?'on':''}" data-kim="${k}" ${k==='element'&&!el?'disabled':''}>${t}</button>`).join('')}</div>
    <textarea id="stKiP" rows="5" placeholder="${{neu:'z. B. Neue Folie: Termine 21.11.2026, 19.12.2026, 24.01.2027',folie:'z. B. Kürze den Text auf dieser Folie',element:'z. B. Sag das freundlicher und kürzer',deck:'Stichpunkte, eine Zeile pro Folie …'}[ST.kiModus]}"></textarea>
    <button type="button" class="btn sm" id="stKiGo">Vorschlag holen</button><div id="stKiE"></div>`;
  R.querySelectorAll('[data-kim]').forEach(b=>b.onclick=()=>{ ST.kiModus=b.dataset.kim; stKiPanel(R); });
  R.querySelector('#stKiGo').onclick=async e=>{ const b=e.currentTarget, out=R.querySelector('#stKiE'); const prompt=R.querySelector('#stKiP').value.trim(); if(!prompt)return;
    b.disabled=true; out.innerHTML='<p class="note">Denkt nach …</p>';
    const texte=sec?[...sec.querySelectorAll('*')].filter(stIstText).map(x=>({id:x.dataset.stId,tag:x.tagName.toLowerCase(),text:x.textContent.replace(/\s+/g,' ').trim()})).slice(0,80):[];
    try{ const {data,error}=await SVB.sb.functions.invoke('studio-ki',{body:{modus:ST.kiModus,prompt,art:ST.p.art,folie:{label:f&&f.label,texte},element:el?{id:el.dataset.stId,text:el.textContent.trim()}:null}});
      if(error)throw error; if(!data||data.ok===false)throw new Error((data&&data.error)||'Keine Antwort'); stKiVorschau(out,data); }
    catch(x){ out.innerHTML=`<p class="note">⚠️ ${stE(x.message||x)}</p>`; }
    b.disabled=false; }; }
function stKiVorschau(out,d){
  if(d.folien&&d.folien.length){ const neu=d.folien.map(x=>({label:x.label||'',notiz:x.notiz||'',html:stIdsSichern(stVorlageFolie(x.vorlage,x.felder||{}))}));
    out.innerHTML=`<h5>Vorschlag: ${neu.length} Folie${neu.length>1?'n':''}</h5><div class="st-kiv">${neu.map((x,i)=>`<div class="st-kivf" data-kv="${i}"></div>`).join('')}</div><div class="btnrow"><button type="button" class="btn sm" id="stKiJa">Annehmen</button><button type="button" class="btn sm ghost" id="stKiNein">Verwerfen</button></div>`;
    out.querySelectorAll('[data-kv]').forEach(el=>stSkalaBox(el,neu[+el.dataset.kv],260));
    out.querySelector('#stKiNein').onclick=()=>{ out.innerHTML=''; };
    out.querySelector('#stKiJa').onclick=async()=>{ for(let i=0;i<neu.length;i++){ await stFolieEinfuegen(ST.cur,neu[i].html,neu[i].label); if(neu[i].notiz){ stMeta(stF(),'notiz',neu[i].notiz); } } out.innerHTML='<p class="note">✓ Übernommen.</p>'; };
    return; }
  if(d.aenderungen&&d.aenderungen.length){ const sec=stSec(); const A=d.aenderungen.filter(a=>stFind(sec,a.id));
    out.innerHTML=`<h5>Vorschlag: ${A.length} Änderung${A.length>1?'en':''}</h5><div class="st-diff">${A.map(a=>`<div><del>${stE(stFind(sec,a.id).textContent.trim())}</del><ins>${stE(a.text)}</ins></div>`).join('')}</div><div class="btnrow"><button type="button" class="btn sm" id="stKiJa">Annehmen</button><button type="button" class="btn sm ghost" id="stKiNein">Verwerfen</button></div>`;
    out.querySelector('#stKiNein').onclick=()=>{ out.innerHTML=''; };
    out.querySelector('#stKiJa').onclick=()=>{ const ops=A.map(a=>{ const el=stFind(sec,a.id); return {t:'html',id:a.id,v:stE(a.text),old:stHtmlRaus(el.innerHTML)}; }); stTun(ops); out.innerHTML='<p class="note">✓ Übernommen. Rückgängig mit Strg+Z.</p>'; };
    return; }
  out.innerHTML=`<p class="note">${stE(d.hinweis||'Die KI hatte keinen Vorschlag.')}</p>`; }

/* ---------- Personenverzeichnis ---------- */
async function stPersonen(){ const M=svModal('<h2>Personen</h2><div id="stPe"><div class="empty">Lade …</div></div>'); M.classList.add('st-modal'); const box=M.querySelector('#stPe');
  const zeich=async()=>{ const {data}=await SVB.sb.from('studio_personen').select('*').order('sort').order('name'); const L=data||[]; await stUrlsLaden(L.map(p=>p.foto).filter(Boolean));
    box.innerHTML=`<p class="note small">Name, Rolle und Foto an einer Stelle. Änderst du hier etwas, kann das Studio alle Folien anpassen, auf denen die Person vorkommt (mit Rückfrage).</p>
      <div class="st-pl">${L.map(p=>`<div class="st-pe" data-pe="${p.id}"><span class="st-pf">${p.foto?`<img src="${stE(stUrl(p.foto))}" alt="">`:''}</span><input class="st-in" data-k="name" value="${stE(p.name)}"><input class="st-in" data-k="rolle" value="${stE(p.rolle)}" placeholder="Rolle"><label class="st-chk"><input type="checkbox" data-k="vakant" ${p.vakant?'checked':''}> vakant</label><button type="button" class="btn sm ghost" data-pf="${p.id}">Foto</button><button type="button" class="btn sm" data-ps="${p.id}">Speichern</button></div>`).join('')}</div>
      ${stKann()?'<button type="button" class="btn sm ghost" id="stPeNeu">+ Person</button>':''}`;
    const neu=box.querySelector('#stPeNeu'); if(neu)neu.onclick=async()=>{ await SVB.sb.from('studio_personen').insert({name:'Neue Person',rolle:'',sort:L.length}); zeich(); };
    box.querySelectorAll('[data-pf]').forEach(b=>b.onclick=()=>{ const p=L.find(x=>x.id===b.dataset.pf); stMediathek(pfad=>{ stPersonSpeichern(p,{foto:pfad}).then(()=>stPersonen()); }); });
    box.querySelectorAll('[data-ps]').forEach(b=>b.onclick=async()=>{ const p=L.find(x=>x.id===b.dataset.ps), row=b.closest('[data-pe]'); const v={}; row.querySelectorAll('[data-k]').forEach(i=>v[i.dataset.k]=i.type==='checkbox'?i.checked:i.value.trim());
      await stPersonSpeichern(p,v,b); zeich(); }); };
  zeich(); }
async function stPersonSpeichern(p,v,btn){ const alt={name:p.name,rolle:p.rolle,foto:p.foto};
  const {error}=await SVB.sb.from('studio_personen').update(Object.assign({},v,{geaendert_am:new Date().toISOString()})).eq('id',p.id); if(error)return kToast('⚠️ '+error.message);
  const ersetz=[]; if(v.name&&v.name!==alt.name&&alt.name)ersetz.push([alt.name,v.name]); if(v.rolle!=null&&v.rolle!==alt.rolle&&alt.rolle)ersetz.push([alt.rolle,v.rolle]); if(v.foto&&alt.foto&&v.foto!==alt.foto)ersetz.push([alt.foto,v.foto]);
  if(!ersetz.length){ kToast('✓ Gespeichert'); return; }
  const {data:F}=await SVB.sb.from('studio_folien').select('id,projekt_id,html,version').or(ersetz.map(([a])=>`html.ilike.*${a.replace(/[,()*]/g,'')}*`).join(','));
  const treffer=(F||[]).filter(f=>ersetz.some(([a])=>f.html.includes(a)));
  if(!treffer.length){ kToast('✓ Gespeichert'); return; }
  const ok=await stFrage(`„${alt.name}“ kommt auf ${treffer.length} Folie${treffer.length>1?'n':''} vor. Überall anpassen?`,'Ja, überall anpassen','Nein');
  if(!ok){ kToast('✓ Gespeichert, Folien unverändert'); return; }
  let n=0; for(const f of treffer){ let h=f.html; ersetz.forEach(([a,b])=>{ h=a.startsWith('assets/')?h.split(a).join(b):h.replace(new RegExp('(>[^<]*?)'+a.replace(/[.*+?^${}()|[\]\\]/g,'\\$&'),'g'),'$1'+b.replace(/\$/g,'$$$$')); });
    const {data:r}=await SVB.sb.from('studio_folien').update({html:h}).eq('id',f.id).eq('version',f.version).select('id'); if(r&&r.length)n++; }
  kToast(`✓ ${n} Folie${n>1?'n':''} angepasst`); if(ST.p){ await stProjektLaden(ST.p.id); if(ST.ansicht==='editor'){ stFolienliste(); stCanvas(); } } }
function stFrage(text,ja,nein){ return new Promise(res=>{ const M=svModal(`<h2>Rückfrage</h2><p>${stE(text)}</p><div class="btnrow"><button type="button" class="btn" id="stFj">${stE(ja)}</button><button type="button" class="btn ghost" id="stFn">${stE(nein)}</button></div>`);
  M.querySelector('#stFj').onclick=()=>{ closeOverlay(); res(true); }; M.querySelector('#stFn').onclick=()=>{ closeOverlay(); res(false); }; }); }

/* =====================================================================
   SV/BSC Studio (Teil 5, Beta 0.44): Masterfolien, Kontextmenü wie in Canva, Zwischenablage,
   Sperren, Ausrichten, Stil übertragen, Bildpool mit CI-Bildern (ersetzen, erweitern, verwalten)
   ===================================================================== */

/* ---------- Masterfolien ---------- */
// Felder, die auf jeder Folie automatisch gefüllt werden (im Master als Platzhalter)
const ST_FELDER=[['nr','Seitenzahl','00'],['gesamt','Seitenzahl gesamt','00'],['titel','Projekttitel','Projekttitel'],['datum','Datum','TT.MM.JJJJ']];
ST_BAU.push(
  ['f-nr','Feld: Seitenzahl',()=>`<div data-st-feld="nr" style="position:absolute;right:110px;bottom:34px;font-family:'Barlow Condensed',sans-serif;font-weight:700;font-size:24px;letter-spacing:0.12em;color:#5b5b66">00</div>`],
  ['f-titel','Feld: Projekttitel',()=>`<div data-st-feld="titel" style="position:absolute;left:110px;bottom:34px;font-family:'Barlow Condensed',sans-serif;font-weight:700;font-size:24px;letter-spacing:0.12em;text-transform:uppercase;color:#5b5b66">Projekttitel</div>`],
  ['f-datum','Feld: Datum',()=>`<div data-st-feld="datum" style="position:absolute;right:110px;top:50px;font-family:'Barlow Condensed',sans-serif;font-weight:700;font-size:24px;letter-spacing:0.12em;color:#5b5b66">TT.MM.JJJJ</div>`],
  ['logo','Vereinslogo',()=>`<img src="assets/logo-svbsc.png" alt="SV/BSC Mörlenbach" style="position:absolute;right:110px;top:60px;height:90px;width:auto;display:block">`]);

function stFussMaster(dunkel){ const c=dunkel?'rgba(255,255,255,.75)':'#5b5b66';
  return `<div style="position:absolute;left:110px;right:110px;bottom:34px;height:0;border-top:1px solid ${dunkel?'rgba(255,255,255,.25)':'rgba(29,39,96,.2)'}"></div>
  <div style="position:absolute;left:110px;bottom:34px;transform:translateY(-14px);font-family:'Barlow Condensed',sans-serif;font-weight:700;font-size:24px;letter-spacing:0.12em;text-transform:uppercase;color:${c}">SV/BSC Mörlenbach · <span data-st-feld="titel">Projekttitel</span></div>
  <div data-st-feld="nr" style="position:absolute;right:110px;bottom:34px;transform:translateY(-14px);font-family:'Barlow Condensed',sans-serif;font-weight:700;font-size:24px;letter-spacing:0.12em;color:${c}">00</div>`; }
function stVorlageMaster(art){ const p=ST.p||{breite:1920,hoehe:1080,art:'deck'};
  if(p.art!=='deck'){ const quer=p.breite>p.hoehe;
    return `<section class="page" style="position:relative;background:#ffffff;box-sizing:border-box;overflow:hidden">
      <div style="position:absolute;left:0;top:0;width:100%;height:${quer?'14mm':'18mm'};background:#1d2760"></div><div style="position:absolute;left:0;top:${quer?'14mm':'18mm'};width:30mm;height:1mm;background:#e8741f"></div>
      <img src="assets/logo-svbsc.png" alt="" style="position:absolute;right:20mm;top:${quer?'2mm':'3mm'};height:${quer?'10mm':'12mm'};width:auto">
      <div style="position:absolute;left:20mm;right:20mm;bottom:10mm;display:flex;justify-content:space-between;font-family:'Barlow Condensed',sans-serif;font-weight:700;font-size:9pt;letter-spacing:0.1em;text-transform:uppercase;color:#5b5b66"><span>SV/BSC Mörlenbach · <span data-st-feld="titel">Projekttitel</span></span><span>Seite <span data-st-feld="nr">0</span> von <span data-st-feld="gesamt">0</span></span></div></section>`; }
  if(art==='dunkel')return `<section style="position:relative;background:#1d2760;color:#ffffff;box-sizing:border-box;overflow:hidden">
    <div style="position:absolute;right:-40px;top:-80px;font-family:'Barlow Condensed',sans-serif;font-weight:900;font-size:620px;line-height:1;color:#ffffff;opacity:0.05;letter-spacing:-0.05em">1896</div>
    <img src="assets/logo-svbsc.png" alt="" style="position:absolute;right:110px;top:60px;height:80px;width:auto">${stFussMaster(true)}</section>`;
  if(art==='foto')return `<section style="position:relative;background:#1d2760;color:#ffffff;box-sizing:border-box;overflow:hidden">
    <img src="assets/foto-team-blau.jpg" alt="" style="position:absolute;inset:0;width:100%;height:100%;object-fit:cover">
    <div style="position:absolute;inset:0;background:linear-gradient(90deg,rgba(29,39,96,.92) 0%,rgba(29,39,96,.75) 45%,rgba(29,39,96,.25) 100%)"></div>${stFussMaster(true)}</section>`;
  if(art==='leer')return `<section style="position:relative;background:#ffffff;box-sizing:border-box;overflow:hidden"></section>`;
  return `<section style="position:relative;background:#f7f4ee;color:#1c1c22;box-sizing:border-box;overflow:hidden">
    <div style="position:absolute;left:0;top:0;width:22px;height:100%;background:#1d2760"></div>
    <img src="assets/logo-svbsc.png" alt="" style="position:absolute;right:110px;top:60px;height:80px;width:auto">${stFussMaster(false)}</section>`; }
// Folie bekommt einen Master: eigener Hintergrund und eigene Fußzeile würden ihn verdecken bzw. doppeln
function stOhneEigenesDesign(html){ const t=document.createElement('template'); t.innerHTML=html||'<section></section>'; const s=t.content.firstElementChild; if(!s)return html;
  ['background','background-color','background-image'].forEach(k=>s.style.removeProperty(k)); s.querySelectorAll('[data-st-bau="fuss"]').forEach(e=>e.remove());
  const fuss=el=>el&&/^SV\/BSC M(ö|oe)rlenbach\s*·/i.test((el.textContent||'').replace(/\s+/g,' ').trim())&&(el.textContent||'').length<=80;
  [...s.children].filter(el=>fuss(el)&&(el===s.lastElementChild||/bottom\s*:/.test(el.getAttribute('style')||''))).forEach(el=>el.remove());
  return s.outerHTML; }

async function stMasterModus(an){ await stSpeichernJetzt(); stEditEnde(); const vorher=stF();
  ST.mModus=!!an; stSicht(); ST.sel=[];
  ST.cur=an?Math.max(0,ST.folien.findIndex(m=>vorher&&m.id===vorher.master_id)):Math.max(0,ST.folien.findIndex(f=>f.id===ST.letzteFolie));
  if(!an)ST.letzteFolie=null; else ST.letzteFolie=vorher&&vorher.id;
  stEditorRender(); }
async function stMasterNeu(art,ausFolie){ const html=ausFolie?ausFolie.html:stVorlageMaster(art);
  const label=ausFolie?'Master aus „'+(ausFolie.label||'Folie')+'“':({hell:'Master hell',dunkel:'Master dunkel',foto:'Master Foto',leer:'Master leer'}[art]||'Master');
  if(!ST.mModus){ const pos=Math.max(0,...(ST.alle||[]).map(f=>f.pos||0))+1;
    const {data,error}=await SVB.sb.from('studio_folien').insert({projekt_id:ST.p.id,pos,label,html:stIdsSichern(html),ist_master:true}).select(ST_FSEL).single();
    if(error)return kToast('⚠️ '+error.message); ST.alle.push(data); ST.basis.set(data.id,data.version); await stUrlsLaden(stAssets(data.html));
    try{ stLiveSenden(null,[{t:'folien'}]); }catch(e){} kToast('✓ '+label+' angelegt. Unter „Master“ bearbeiten.'); return data; }
  await stFolieEinfuegen(ST.folien.length-1,html,label); return stF(); }
async function stMasterZuweisen(i,mid){ const f=ST.folien[i]; if(!f||f.ist_master)return; if(i!==ST.cur)stGeheZu(i);
  const sec=stSec(); if(mid&&sec){ const ops=[]; const old=sec.getAttribute('style');
    ['background','background-color','background-image'].forEach(k=>sec.style.removeProperty(k)); const v=sec.getAttribute('style'); if(v!==old)ops.push({t:'attr',id:'@',k:'style',v,old});
    const fuesse=new Set(sec.querySelectorAll('[data-st-bau="fuss"]'));
    // Übernommene Folien: alte Fußzeile („SV/BSC Mörlenbach · …“ ganz unten) weg, der Master bringt seine eigene mit
    const m=stFolieId(mid); if(m&&/data-st-feld=/.test(m.html)){ const H=ST.p.hoehe, s=ST.s||1, top=sec.getBoundingClientRect().top;
      sec.querySelectorAll('div,footer,p').forEach(el=>{ const t=(el.textContent||'').replace(/\s+/g,' ').trim(); if(t.length>80||!/^SV\/BSC M(ö|oe)rlenbach\s*·/i.test(t))return; const y=(el.getBoundingClientRect().top-top)/s; if(y<H*0.82)return;
        if(![...fuesse].some(f=>f.contains(el)||el.contains(f)))fuesse.add(el); }); }
    [...fuesse].filter(el=>![...fuesse].some(o=>o!==el&&o.contains(el))).forEach(el=>{ const n=el.nextElementSibling; ops.push({t:'del',id:stIdOf(sec,el),parent:stIdOf(sec,el.parentElement),before:n?stIdOf(sec,n):null,html:stHtmlRaus(el.outerHTML)}); });
    if(ops.length)stTun(ops); }
  stMeta(f,'master_id',mid||null); stCanvas(true); stFolienliste(); }
function stMasterListe(){ return (ST.alle||[]).filter(f=>f.ist_master).sort((a,b)=>a.pos-b.pos); }

// Oberfläche: Knopf „Master“, Hinweisleiste und eigene Neu-Auswahl im Master-Modus
{ const _er=stEditorRender; stEditorRender=function(){ _er.apply(this,arguments); try{ stMasterUi(); stMenueBinden(); }catch(e){ console.warn('Studio',e); } }; }
function stMasterUi(){ const P=stPanel(); if(!P)return; const ed=P.querySelector('.st-ed'); if(!ed)return; ed.classList.toggle('st-mmod',!!ST.mModus);
  const top=P.querySelector('.st-top'), kom=P.querySelector('#stKom');
  if(top&&kom&&stKann()){ const b=document.createElement('button'); b.type='button'; b.className='btn sm ghost'+(ST.mModus?' on':''); b.id='stMaster'; b.title='Masterfolien bearbeiten';
    b.innerHTML=`${SVI('layers')} ${ST.mModus?'Zurück zu den Folien':'Master'}`; b.onclick=()=>stMasterModus(!ST.mModus); top.insertBefore(b,kom); }
  const side=P.querySelector('.st-side');
  if(side&&ST.mModus){ const h=document.createElement('div'); h.className='st-mhin'; h.innerHTML=`<b>Masterfolien</b><small>Hintergrund, Logo, Fußzeile und Seitenzahl für alle Folien, die den Master nutzen. Änderungen gelten sofort überall.</small>`; side.insertBefore(h,side.firstChild);
    const nb=P.querySelector('#stNeuF'); if(nb){ nb.innerHTML=`${SVI('plus')} Master`; nb.onclick=e=>stMenue(e.clientX,e.clientY,stMasterNeuItems()); } } }
function stMasterNeuItems(){ const p=ST.p||{}; const it=p.art==='deck'?[['hell','Hell (Creme, Logo, Fußzeile)'],['dunkel','Dunkel (Marine, 1896)'],['foto','Foto mit Overlay'],['leer','Leer']]:[['hell','Briefbogen mit Kopfband'],['leer','Leer']];
  const f=(ST.alle||[]).filter(x=>!x.ist_master)[0];
  return it.map(([k,t])=>({t,fn:()=>stMasterNeu(k)})).concat(f?[{sep:1},{t:'Aus aktueller Folie',fn:()=>stMasterNeu(null,stFolieId(ST.letzteFolie)||f)}]:[]); }
{ const _fn=stFolieNeuMenue; stFolieNeuMenue=function(anker){ if(ST.mModus){ const r=anker&&anker.getBoundingClientRect?anker.getBoundingClientRect():{left:200,bottom:200}; return stMenue(r.left,r.bottom+4,stMasterNeuItems()); } return _fn.apply(this,arguments); }; }
// Folienliste: kleines Master-Zeichen an Folien mit Master
{ const _fl=stFolienliste; stFolienliste=function(){ _fl.apply(this,arguments); const L=document.getElementById('stFl'); if(!L)return;
  L.querySelectorAll('[data-fi]').forEach(el=>el.addEventListener('contextmenu',e=>{ e.preventDefault(); stMenue(e.clientX,e.clientY,stFolienItems(+el.dataset.fi)); }));
  if(ST.mModus)return;
  ST.folien.forEach((f,i)=>{ if(!f.master_id)return; const m=stFolieId(f.master_id); const el=L.querySelector(`[data-fi="${i}"] .st-fl-l`); if(el&&m)el.insertAdjacentHTML('beforeend',` <i class="st-mtag" title="${stE(m.label||'Master')}">M</i>`); }); }; }

/* ---------- Kontextmenü ---------- */
function stMenueZu(){ const m=document.getElementById('stCtx'); if(m)m.remove(); document.removeEventListener('pointerdown',stMenueAussen,true); document.removeEventListener('keydown',stMenueTaste,true); window.removeEventListener('blur',stMenueZu); }
function stMenueAussen(e){ const m=document.getElementById('stCtx'); if(m&&!m.contains(e.target))stMenueZu(); }
function stMenueTaste(e){ if(e.key==='Escape'){ e.preventDefault(); e.stopPropagation(); stMenueZu(); } }
function stMenue(x,y,items){ stMenueZu(); const m=document.createElement('div'); m.id='stCtx'; m.className='st-ctx'; m.setAttribute('role','menu');
  const bau=(liste,box)=>{ liste.forEach(it=>{ if(!it)return;
    if(it.sep){ const d=document.createElement('div'); d.className='st-cs'; box.appendChild(d); return; }
    if(it.kopf){ const d=document.createElement('div'); d.className='st-ck'; d.textContent=it.kopf; box.appendChild(d); return; }
    if(it.grid){ const g=document.createElement('div'); g.className='st-cg'; g.innerHTML=it.grid.map((p,i)=>`<button type="button" data-g="${i}" title="${stE(p.name||'')}"><img src="${stE(stUrl(p.pfad))}" alt="" loading="lazy"></button>`).join('')||'<small>Keine passenden Bilder.</small>';
      g.querySelectorAll('[data-g]').forEach(b=>b.onclick=()=>{ stMenueZu(); it.fn(it.grid[+b.dataset.g]); }); box.appendChild(g); return; }
    const b=document.createElement('button'); b.type='button'; b.className='st-ci'+(it.sub?' sub':'')+(it.gefahr?' rot':''); b.disabled=!!it.dis; b.setAttribute('role','menuitem');
    b.innerHTML=`<span class="st-cic">${it.ic||''}</span><span class="st-cit">${stE(it.t)}</span>${it.k?`<kbd>${stE(it.k)}</kbd>`:''}${it.sub?'<span class="st-cpf">›</span>':''}`;
    if(it.sub){ const s=document.createElement('div'); s.className='st-ctx st-csub'; bau(typeof it.sub==='function'?it.sub():it.sub,s); b.appendChild(s);
      b.onmouseenter=()=>{ box.querySelectorAll(':scope>.st-ci.offen').forEach(x=>{ if(x!==b)x.classList.remove('offen'); }); b.classList.add('offen'); const r=b.getBoundingClientRect(); s.style.top='0px'; s.style.left='100%';
        requestAnimationFrame(()=>{ const sr=s.getBoundingClientRect(); if(sr.right>innerWidth-8){ s.style.left='auto'; s.style.right='100%'; } if(sr.bottom>innerHeight-8)s.style.top=Math.min(0,innerHeight-8-sr.bottom)+'px'; }); };
      b.onclick=e=>{ if(e.target.closest('.st-csub'))return; b.onmouseenter(); }; }
    else { b.onmouseenter=()=>box.querySelectorAll(':scope>.st-ci.offen').forEach(x=>x.classList.remove('offen'));
      b.onclick=e=>{ e.stopPropagation(); if(it.dis)return; stMenueZu(); try{ it.fn&&it.fn(); }catch(x){ console.warn(x); } }; }
    box.appendChild(b); }); };
  bau(items,m); document.body.appendChild(m);
  const r=m.getBoundingClientRect(); m.style.left=Math.max(8,Math.min(x,innerWidth-r.width-8))+'px'; m.style.top=Math.max(8,Math.min(y,innerHeight-r.height-8))+'px';
  setTimeout(()=>{ document.addEventListener('pointerdown',stMenueAussen,true); document.addEventListener('keydown',stMenueTaste,true); window.addEventListener('blur',stMenueZu); },0); }

function stMenueBinden(){ const host=stHost(), C=document.getElementById('stCanvas'); if(!host||!C||C._ctx)return; C._ctx=1;
  C.addEventListener('contextmenu',e=>{ if(!ST.p)return; e.preventDefault(); const sec=stSec(); if(!sec){ return; }
    const path=e.composedPath(); const iSec=path.indexOf(sec);
    if(iSec<0||!stKann()){ ST.sel=[]; stMarkieren(); stNachAenderung(); return stMenue(e.clientX,e.clientY,stFolieMenueItems()); }
    const tiefst=path[0]&&path[0].nodeType===1&&path[0]!==sec?path[0]:null;
    if(!tiefst){ ST.sel=[]; stMarkieren(); stNachAenderung(); return stMenue(e.clientX,e.clientY,stFolieMenueItems()); }
    stEditEnde(); const kette=path.slice(0,iSec).filter(n=>n.nodeType===1).reverse();
    const gewaehlt=ST.sel.map(id=>stFind(sec,id)).filter(Boolean);
    if(!gewaehlt.some(g=>g===tiefst||g.contains(tiefst))){ ST.sel=[stIdOf(sec,kette[0])]; stMarkieren(); stNachAenderung(); }
    stMenue(e.clientX,e.clientY,stElementItems(tiefst)); }); }

function stBildVon(el){ if(!el)return null; if(el.tagName==='IMG')return {art:'img',el,pfad:stHtmlRaus(el.getAttribute('src')||'')};
  if(el.dataset&&el.dataset.stSlot!=null)return {art:'slot',el,pfad:''};
  const bg=el.style&&el.style.backgroundImage; if(bg&&/url\(/.test(bg)){ const u=(bg.match(/url\((['"]?)(.*?)\1\)/)||[])[2]||''; return {art:'bg',el,pfad:stHtmlRaus(u)}; }
  return null; }
function stBildIn(el){ if(!el)return null; return stBildVon(el)||(el.querySelector?[...el.querySelectorAll('img,[data-st-slot],[style*="background-image"]')].map(stBildVon).find(Boolean):null)||null; }
// Bild tauschen: <img>, Bildplatz oder Hintergrundbild
function stBildTauschen(b,pfad){ if(!b||!pfad)return; const sec=stSec();
  if(b.art==='bg'){ const el=b.el, old=el.getAttribute('style'); el.style.backgroundImage=`url("${stUrl(pfad)}")`; stTun([{t:'attr',id:stIdOf(sec,el),k:'style',v:stHtmlRaus(el.getAttribute('style')),old:stHtmlRaus(old)}],{schonAngewandt:true}); stCanvas(true); return; }
  stBildSetzen(b.el,pfad); }
function stAehnliche(pfad,n){ const M=ST.medien||[]; const m=M.find(x=>x.pfad===pfad); const tags=(m&&m.tags&&m.tags.length?m.tags:['foto']).filter(t=>t!=='eigene');
  return M.filter(x=>x.pfad!==pfad&&(x.tags||[]).some(t=>tags.includes(t))).slice(0,n||12); }

function stElementItems(tiefst){ const sec=stSec(); const els=ST.sel.map(id=>stFind(sec,id)).filter(el=>el&&el!==sec); const el=els[0]; if(!el)return stFolieMenueItems();
  const bild=stBildIn(tiefst&&el.contains(tiefst)?tiefst:el)||stBildIn(el), gesperrt=!!el.closest('[data-st-lock]'), mehr=els.length>1;
  let text=null; for(let n=tiefst&&el.contains(tiefst)?tiefst:el;n&&n!==sec;n=n.parentElement){ if(stIstText(n)){ text=n; break; } if(n===el)break; }
  const textWahl=()=>{ ST.sel=[stIdOf(sec,text)]; stMarkieren(); stNachAenderung(); };
  const absolut=getComputedStyle(el).position==='absolute';
  if(bild&&!ST.medien)stMedienLaden().catch(()=>{});
  return [
    {ic:'⧉',t:'Kopieren',k:'Strg+C',fn:()=>stKopieren()},
    {ic:'✂',t:'Ausschneiden',k:'Strg+X',fn:()=>{ stKopieren(); stLoeschen(); },dis:gesperrt},
    {ic:'📋',t:'Einfügen',k:'Strg+V',fn:()=>stEinfuegen(),dis:!stClip()},
    {ic:'⧉',t:'Duplizieren',k:'Strg+D',fn:()=>stDuplizieren()},
    {ic:'🗑',t:'Löschen',k:'Entf',fn:()=>stLoeschen(),dis:gesperrt,gefahr:1},
    {sep:1},
    bild?{ic:'🖼',t:'Bild ersetzen aus dem Pool …',fn:()=>stMediathek(p=>stBildTauschen(bild,p))}:null,
    bild?{ic:'↻',t:'Gegen ähnliches Poolbild tauschen',sub:()=>[{grid:stAehnliche(bild.pfad,12),fn:m=>stUrlsLaden([m.pfad]).then(()=>stBildTauschen(bild,m.pfad))},{sep:1},{t:'Ganzen Pool öffnen …',fn:()=>stMediathek(p=>stBildTauschen(bild,p))}]}:null,
    bild&&bild.pfad?{ic:'▣',t:'Als Folienhintergrund setzen',fn:()=>stHintergrundBild(bild.pfad)}:null,
    bild?{ic:'⤢',t:'Bild zuschneiden und zoomen',fn:()=>{ ST.sel=[stIdOf(sec,bild.el)]; stMarkieren(); stNachAenderung(); const t=document.getElementById('stOx'); if(t)t.focus(); }}:null,
    bild?{sep:1}:null,
    text?{ic:'✎',t:'Text bearbeiten',k:'Doppelklick',fn:()=>{ textWahl(); stEditStart(text); },dis:gesperrt}:null,
    text?{ic:'✦',t:'Mit KI umformulieren …',fn:()=>{ textWahl(); ST.kiModus='element'; const R=document.getElementById('stRechts'); if(R&&!R.hidden&&R.dataset.art==='ki')stKiPanel(R); else stRechts('ki'); },dis:gesperrt}:null,
    text?{sep:1}:null,
    {ic:'⇅',t:'Ebene',sub:[{t:'Ganz nach vorn',k:'Strg+]',fn:()=>stEbene(2)},{t:'Nach vorn',k:']',fn:()=>stEbene(1)},{t:'Nach hinten',k:'[',fn:()=>stEbene(-1)},{t:'Ganz nach hinten',k:'Strg+[',fn:()=>stEbene(-2)}]},
    {ic:'⊞',t:'An Folie ausrichten',sub:[['links','Links'],['hmitte','Horizontal zentriert'],['rechts','Rechts'],null,['oben','Oben'],['vmitte','Vertikal zentriert'],['unten','Unten']].map(a=>a?{t:a[1],fn:()=>stAusrichten(a[0])}:{sep:1}),dis:gesperrt},
    mehr?{ic:'▣',t:'Gruppieren',k:'Strg+G',fn:()=>stGruppieren(),dis:!absolut}:(el.children.length&&absolut&&!text&&el.tagName!=='IMG'?{ic:'▢',t:'Gruppierung aufheben',k:'Strg+Umschalt+G',fn:()=>stAufloesen()}:null),
    {ic:gesperrt?'🔓':'🔒',t:gesperrt?'Entsperren':'Sperren',fn:()=>stSperren(!gesperrt)},
    {sep:1},
    {ic:'🎨',t:'Stil kopieren',k:'Strg+Alt+C',fn:()=>stStilKopieren()},
    {ic:'🖌',t:'Stil einfügen',k:'Strg+Alt+V',fn:()=>stStilEinfuegen(),dis:!ST.stilClip},
    {sep:1},
    {ic:'💬',t:'Kommentar',fn:()=>{ stRechts('kom'); setTimeout(()=>stKommentarAn(ST.sel[0]),50); }}
  ].filter(Boolean); }
function stFolieMenueItems(){ const f=stF(); if(!f)return [{t:'Keine Folie',dis:1}]; const kann=stKann(); const i=ST.cur;
  const farben=Object.entries(ST_TOK).filter(([k])=>!['text','grau'].includes(k)).map(([k,v])=>({ic:`<i class="st-cdot" style="background:${v}"></i>`,t:k[0].toUpperCase()+k.slice(1),fn:()=>stStil({background:v,'background-image':null},[stSec()])}));
  if(!kann)return [{ic:'▶',t:'Ab hier präsentieren',fn:()=>stPraesentieren()}];
  return [
    {ic:'📋',t:'Einfügen',k:'Strg+V',fn:()=>stEinfuegen(),dis:!stClip()},
    {sep:1},
    {ic:'🖼',t:'Hintergrundbild aus dem Pool …',fn:()=>stMediathek(p=>stHintergrundBild(p),'hintergrund')},
    {ic:'🎨',t:'Hintergrundfarbe',sub:farben},
    {sep:1},
    ...stFolienItems(i,true),
    {sep:1},
    {ic:'▶',t:'Ab hier präsentieren',fn:()=>stPraesentieren()}]; }
function stFolienItems(i,ohneKopf){ const f=ST.folien[i]; if(!f)return []; const kann=stKann(); if(!kann)return [{ic:'▶',t:'Ab hier präsentieren',fn:()=>{ stGeheZu(i); stPraesentieren(); }}];
  const M=stMasterListe();
  const it=[
    {ic:'＋',t:ST.mModus?'Neuer Master':'Neue Folie danach',fn:()=>{ stGeheZu(i); ST.mModus?stMenue(innerWidth/2-120,innerHeight/3,stMasterNeuItems()):stRechts('bau'); }},
    {ic:'⧉',t:'Duplizieren',fn:()=>stFolieDuplizieren(i)},
    !ST.mModus?{ic:f.skip?'◐':'◑',t:f.skip?'Wieder zeigen':'Als Backup ausblenden',fn:()=>{ stMeta(f,'skip',!f.skip); stFolienliste(); }}:null,
    !ST.mModus?{ic:'▤',t:'Master',sub:()=>[{t:'Ohne Master',ic:!f.master_id?'✓':'',fn:()=>stMasterZuweisen(i,null)}].concat(M.map(m=>({ic:f.master_id===m.id?'✓':'',t:m.label||'Master',fn:()=>stMasterZuweisen(i,m.id)}))).concat([{sep:1},{t:'Diese Folie als Master speichern',fn:()=>stMasterNeu(null,f)},{t:'Neuen Master anlegen …',fn:()=>stMasterModus(true)}])}:null,
    ST.mModus?{ic:'▤',t:'Auf alle Folien ohne Master anwenden',fn:()=>stMasterAlle(f.id)}:null,
    {sep:1},
    {ic:'🗑',t:ST.mModus?'Master löschen':'Folie löschen',gefahr:1,fn:()=>stFrage(ST.mModus?'Diesen Master löschen? Folien, die ihn nutzen, behalten ihren Inhalt, aber ohne Master.':'Diese Folie löschen?','Löschen','Abbrechen').then(ok=>{ if(ok)stFolieLoeschen(i); })}].filter(Boolean);
  return it; }
async function stMasterAlle(mid){ await stSpeichernJetzt(); const L=(ST.alle||[]).filter(f=>!f.ist_master&&!f.master_id); if(!L.length)return kToast('Alle Folien haben schon einen Master');
  const ok=await stFrage(`Master auf ${L.length} Folie${L.length>1?'n':''} ohne Master anwenden? Deren eigener Hintergrund und eigene Fußzeile werden dabei entfernt.`,'Anwenden','Abbrechen'); if(!ok)return;
  for(const f of L){ const html=stOhneEigenesDesign(f.html); const {data,error}=await SVB.sb.from('studio_folien').update({master_id:mid,html}).eq('id',f.id).select('version'); if(error){ kToast('⚠️ '+error.message); break; } f.master_id=mid; f.html=html; if(data&&data[0])ST.basis.set(f.id,data[0].version); }
  try{ stLiveSenden(null,[{t:'folien'}]); }catch(e){} kToast('✓ Master angewendet'); }

/* ---------- Zwischenablage (auch zwischen Folien und Projekten) ---------- */
function stClip(){ if(ST.clip)return ST.clip; try{ const c=JSON.parse(localStorage.getItem('st-clip')||'null'); if(c&&c.html&&c.html.length)return c; }catch(e){} return null; }
function stKopieren(){ const sec=stSec(); const els=ST.sel.map(id=>stFind(sec,id)).filter(el=>el&&el!==sec); if(!els.length)return;
  const c={html:els.map(el=>{ const k=el.cloneNode(true); k.removeAttribute('data-st-sel'); k.removeAttribute('data-st-sel2'); k.removeAttribute('data-st-lock'); return stHtmlRaus(k.outerHTML); }),fid:stF().id,p:ST.p.id,n:0};
  ST.clip=c; try{ localStorage.setItem('st-clip',JSON.stringify(c)); }catch(e){} kToast(els.length>1?els.length+' Elemente kopiert':'Kopiert'); }
function stEinfuegen(){ const c=stClip(); const sec=stSec(); if(!c||!sec)return; c.n=(c.fid===stF().id?(c.n||0)+1:0);
  const ops=[], neu=[];
  c.html.forEach(h=>{ const t=document.createElement('template'); t.innerHTML=h; const n=t.content.firstElementChild; if(!n)return;
    [n,...n.querySelectorAll('[data-st-id]')].forEach(x=>x.dataset.stId=stId());
    if(c.n){ const tr=(n.style.translate||'').split(/\s+/); n.style.translate=`${(parseFloat(tr[0])||0)+24*c.n}px ${(parseFloat(tr[1])||0)+24*c.n}px`; }
    if(getComputedStyle(sec).position!=='static'&&!/position\s*:\s*absolute/.test(n.getAttribute('style')||'')&&c.fid!==stF().id){ /* aus anderem Layout: frei platzieren */ n.style.position='absolute'; n.style.left=n.style.left||'110px'; n.style.top=n.style.top||'300px'; }
    neu.push(n.dataset.stId); ops.push({t:'add',id:n.dataset.stId,parent:'@',before:null,html:n.outerHTML}); });
  if(!ops.length)return; ST.clip=c; try{ localStorage.setItem('st-clip',JSON.stringify(c)); }catch(e){}
  stUrlsLaden([...new Set(c.html.flatMap(h=>stAssets(h)))]).then(()=>{ stTun(ops); stCanvas(true); ST.sel=neu; stMarkieren(); stNachAenderung(); }); }

/* ---------- Stil übertragen, Sperren, Ausrichten, Hintergrund ---------- */
const ST_STIL_NICHT=/^(position|left|top|right|bottom|inset|width|height|min-|max-|translate|rotate|scale|transform|z-index|grid-|flex|order|margin|zoom)/;
function stStilKopieren(){ const sec=stSec(), el=ST.sel.length?stFind(sec,ST.sel[0]):null; if(!el||el===sec)return; const o={};
  for(let i=0;i<el.style.length;i++){ const k=el.style[i]; if(!ST_STIL_NICHT.test(k))o[k]=el.style.getPropertyValue(k); } ST.stilClip=o; kToast('Stil kopiert'); }
function stStilEinfuegen(){ if(!ST.stilClip)return; stStil(ST.stilClip); }
function stSperren(an){ const sec=stSec(); const ops=ST.sel.map(id=>stFind(sec,id)).filter(el=>el&&el!==sec).map(el=>({t:'attr',id:stIdOf(sec,el),k:'data-st-lock',v:an?'1':null,old:el.getAttribute('data-st-lock')})).filter(o=>o.v!==o.old);
  if(ops.length)stTun(ops); kToast(an?'Gesperrt: lässt sich nicht mehr verschieben oder löschen':'Entsperrt'); }
function stAusrichten(wie){ const sec=stSec(); if(!sec)return; const s=ST.s||1, W=ST.p.breite, H=ST.p.hoehe, rx=ST.p.art==='deck'?110:Math.round(W*0.08), ry=ST.p.art==='deck'?80:Math.round(H*0.06);
  const els=ST.sel.map(id=>stFind(sec,id)).filter(el=>el&&el!==sec&&!el.closest('[data-st-lock]')); if(!els.length)return;
  const ops=els.map(el=>{ const r=stRect(el), x=r.x/s, y=r.y/s, w=r.w/s, h=r.h/s, t=stTrans(el), old=el.getAttribute('style'); let dx=0, dy=0;
    if(wie==='links')dx=rx-x; if(wie==='rechts')dx=W-rx-w-x; if(wie==='hmitte')dx=(W-w)/2-x; if(wie==='oben')dy=ry-y; if(wie==='unten')dy=H-ry-h-y; if(wie==='vmitte')dy=(H-h)/2-y;
    el.style.translate=`${Math.round(t.x+dx)}px ${Math.round(t.y+dy)}px`; return {t:'attr',id:stIdOf(sec,el),k:'style',v:el.getAttribute('style'),old}; }).filter(o=>o.v!==o.old);
  if(ops.length)stTun(ops,{schonAngewandt:true}); }
function stHintergrundBild(pfad){ const sec=stSec(); if(!sec||!pfad)return; stUrlsLaden([pfad]).then(()=>{ const old=sec.getAttribute('style');
  sec.style.backgroundImage=`url("${stUrl(pfad)}")`; sec.style.backgroundSize='cover'; sec.style.backgroundPosition='center';
  stTun([{t:'attr',id:'@',k:'style',v:stHtmlRaus(sec.getAttribute('style')),old:stHtmlRaus(old)}],{schonAngewandt:true}); stCanvas(true); }); }

// Tastenkürzel: Kopieren, Ausschneiden, Einfügen, Stil übertragen
document.addEventListener('keydown',e=>{ if(typeof svCurTab!=='function'||svCurTab()!=='studio'||ST.ansicht!=='editor'||ST.praes||!stKann())return;
  if(ST.edit||/^(INPUT|TEXTAREA|SELECT)$/.test((document.activeElement||{}).tagName||''))return; const mod=e.metaKey||e.ctrlKey; if(!mod)return; const k=e.key.toLowerCase();
  if(e.altKey&&k==='c'){ e.preventDefault(); stStilKopieren(); return; } if(e.altKey&&k==='v'){ e.preventDefault(); stStilEinfuegen(); return; }
  if(k==='c'&&ST.sel.length){ e.preventDefault(); stKopieren(); } else if(k==='x'&&ST.sel.length){ e.preventDefault(); stKopieren(); stLoeschen(); } else if(k==='v'&&stClip()){ e.preventDefault(); stEinfuegen(); } },true);

// Werkzeugleiste: „Bild ersetzen“ auch für Hintergrundbilder und Bildplätze, Schloss-Hinweis
{ const _tb=stToolbar; stToolbar=function(){ _tb.apply(this,arguments); try{ const T=document.getElementById('stTools'), sec=stSec(); if(!T||!sec||!stKann())return;
  const el=ST.sel.length?stFind(sec,ST.sel[0]):null; if(!el||el===sec)return; const b=stBildVon(el);
  if(el.closest('[data-st-lock]'))T.insertAdjacentHTML('afterbegin',`<button type="button" class="st-tb on" id="stLock" title="Gesperrt, zum Entsperren klicken">🔒</button>`);
  if(b&&b.art!=='img'&&!T.querySelector('#stErs')){ T.insertAdjacentHTML('afterbegin',`<button type="button" class="btn sm ghost" id="stErs2">${SVI('upload')} Bild ersetzen</button>`); }
  const l=T.querySelector('#stLock'); if(l)l.onclick=()=>stSperren(false);
  const e2=T.querySelector('#stErs2'); if(e2)e2.onclick=()=>stMediathek(p=>stBildTauschen(b,p));
  const e1=T.querySelector('#stErs'); if(e1&&b)e1.onclick=()=>stMediathek(p=>stBildTauschen(b,p)); }catch(x){} }; }

/* ---------- Bildpool: CI-Bilder, Kategorien, Suche, verwalten ---------- */
const ST_POOL=[['ci','CI-Bilder'],['hintergrund','Hintergründe'],['duoton','Duoton'],['foto','Fotos'],['person','Personen'],['logo','Logos'],['element','Elemente'],['stadion','Stadion'],['eigene','Eigene Uploads']];
ST_TAGS.length=0; ST_POOL.forEach(t=>ST_TAGS.push(t));
stMedienHtml=function(L,auswahl){ const f=ST.mfilter||'', q=(ST.msuche||'').toLowerCase().trim();
  const M=L.filter(m=>(!f||(m.tags||[]).includes(f))&&(!q||(m.name||m.pfad).toLowerCase().includes(q)||(m.tags||[]).some(t=>t.includes(q))));
  const n=k=>L.filter(m=>(m.tags||[]).includes(k)).length;
  return `<div class="st-mk"><input type="search" class="st-in" data-ms placeholder="Im Pool suchen" value="${stE(ST.msuche||'')}"><span class="st-mz">${M.length} von ${L.length}</span></div>
    <div class="st-mf"><button type="button" class="${!f?'on':''}" data-mf="">Alle</button>${ST_POOL.filter(([k])=>n(k)||k==='eigene').map(([k,t])=>`<button type="button" class="${f===k?'on':''}" data-mf="${k}">${t} <small>${n(k)}</small></button>`).join('')}</div>
    ${stKann()?`<label class="st-drop"><input type="file" accept="image/*" multiple hidden data-mup>${SVI('upload')} Bilder in den Pool laden${f&&f!=='eigene'?` (Kategorie „${stE((ST_POOL.find(x=>x[0]===f)||[0,f])[1])}“)`:''}, oder hierher ziehen</label>`:''}
    <div class="st-mg">${M.map(m=>`<div class="st-mw"><button type="button" class="st-m" draggable="true" data-m="${stE(m.pfad)}" title="${stE(m.name||m.pfad)}"><img src="${stE(stUrl(m.pfad))}" alt="" loading="lazy"><span>${stE((m.name||m.pfad.slice(7)).replace(/\.\w+$/,''))}</span></button>${stKann()&&!auswahl?'':''}${stKann()?`<button type="button" class="st-mi" data-mi="${stE(m.pfad)}" title="Details, Kategorien, löschen">⋯</button>`:''}</div>`).join('')||'<p class="note">Keine Bilder in dieser Auswahl.</p>'}</div>`; };
stMedienBinden=function(box,L,wahl,neu){ box.querySelectorAll('[data-mf]').forEach(b=>b.onclick=()=>{ ST.mfilter=b.dataset.mf; neu(); });
  const s=box.querySelector('[data-ms]'); if(s)s.oninput=()=>{ ST.msuche=s.value; const pos=s.selectionStart; neu().then?.(()=>{ const n=box.querySelector('[data-ms]'); if(n){ n.focus(); try{ n.setSelectionRange(pos,pos); }catch(e){} } }); };
  box.querySelectorAll('[data-m]').forEach(b=>{ b.onclick=()=>wahl?wahl(b.dataset.m):stMedienDetail(b.dataset.m,neu); b.ondragstart=e=>e.dataTransfer.setData('text/st-medium',b.dataset.m); });
  box.querySelectorAll('[data-mi]').forEach(b=>b.onclick=e=>{ e.stopPropagation(); stMedienDetail(b.dataset.mi,neu); });
  const extra=()=>{ const f=ST.mfilter; return f&&f!=='eigene'?[f]:[]; };
  const up=box.querySelector('[data-mup]'); if(up)up.onchange=async()=>{ await stHochladen([...up.files],extra()); neu(); };
  const dr=box.querySelector('.st-drop'); if(dr){ dr.ondragover=e=>{ e.preventDefault(); dr.classList.add('over'); }; dr.ondragleave=()=>dr.classList.remove('over'); dr.ondrop=async e=>{ e.preventDefault(); dr.classList.remove('over'); await stHochladen([...e.dataTransfer.files].filter(f=>/^image\//.test(f.type)),extra()); neu(); }; } };
stMedienPanel=async function(R){ R.innerHTML='<h4>Bildpool</h4><div class="empty">Lade …</div>';
  const neu=async()=>{ const L2=await stMedienLaden(); R.innerHTML='<h4>Bildpool</h4><p class="note small">Auf ein Bild ziehen ersetzt es, auf freie Fläche ziehen fügt es ein. Rechtsklick auf ein Bild der Folie: „Gegen ähnliches Poolbild tauschen“.</p>'+stMedienHtml(L2,true); stMedienBinden(R,L2,p=>stBildEinfuegen(p),neu); }; return neu(); };
stMediathek=async function(wahl,filter){ if(filter!==undefined)ST.mfilter=filter; const M=svModal(`<h2>Bildpool</h2><p class="note">${wahl?'Bild wählen.':'Vereinsbilder und CI-Bilder für alle Projekte. Über ⋯ Name und Kategorien ändern oder löschen.'}</p><div id="stMd"><div class="empty">Lade …</div></div>`); M.classList.add('st-modal','st-pool');
  const box=M.querySelector('#stMd'); const neu=async()=>{ const L=await stMedienLaden(); box.innerHTML=stMedienHtml(L,!!wahl); stMedienBinden(box,L,wahl?p=>{ closeOverlay(); stUrlsLaden([p]).then(()=>wahl(p)); }:null,neu); }; return neu(); };
// Hochladen: Kategorie der aktuellen Auswahl und „Eigene Uploads“ mitgeben
{ const _h=stHochladen; stHochladen=async function(files,tags){ const out=await _h.call(this,files);
  if(out.length){ const extra=['eigene'].concat(tags||[]); for(const p of out){ const {data}=await SVB.sb.from('studio_medien').select('tags').eq('pfad',p).single(); const t=[...new Set(((data&&data.tags)||[]).concat(extra))]; await SVB.sb.from('studio_medien').update({tags:t}).eq('pfad',p); } ST.medien=null; }
  return out; }; }
async function stMedienDetail(pfad,neu){ const L=await stMedienLaden(); const m=L.find(x=>x.pfad===pfad); if(!m)return;
  const {count}=await SVB.sb.from('studio_folien').select('id',{count:'exact',head:true}).ilike('html','%'+pfad+'%');
  const M=svModal(`<h2>Bild im Pool</h2><div class="st-md"><img src="${stE(stUrl(pfad))}" alt=""><div>
    <label class="st-tl">Name</label><input class="st-in" id="stMdN" value="${stE(m.name||'')}" ${stKann()?'':'readonly'}>
    <label class="st-tl">Kategorien</label><div class="st-mf">${ST_POOL.map(([k,t])=>`<button type="button" class="${(m.tags||[]).includes(k)?'on':''}" data-mt="${k}" ${stKann()?'':'disabled'}>${t}</button>`).join('')}</div>
    <p class="note small">${m.breite&&m.hoehe?m.breite+' × '+m.hoehe+' px · ':''}${count?`In ${count} Folie${count>1?'n':''} verwendet`:'Auf keiner Folie verwendet'}</p>
    ${stKann()?`<div class="btnrow"><button type="button" class="btn sm" id="stMdS">Speichern</button>${!count?`<button type="button" class="btn sm ghost st-rot" id="stMdX">Aus dem Pool löschen</button>`:''}</div>`:''}</div></div>`); M.classList.add('st-modal');
  const tags=new Set(m.tags||[]); M.querySelectorAll('[data-mt]').forEach(b=>b.onclick=()=>{ const k=b.dataset.mt; if(tags.has(k))tags.delete(k); else tags.add(k); b.classList.toggle('on',tags.has(k)); });
  const sp=M.querySelector('#stMdS'); if(sp)sp.onclick=async()=>{ const {error}=await SVB.sb.from('studio_medien').update({name:M.querySelector('#stMdN').value.trim().slice(0,120),tags:[...tags]}).eq('pfad',pfad); if(error)return kToast('⚠️ '+error.message); ST.medien=null; closeOverlay(); kToast('✓ Gespeichert'); };
  const x=M.querySelector('#stMdX'); if(x)x.onclick=async()=>{ if(!x.classList.contains('sure')){ x.classList.add('sure'); x.textContent='Wirklich löschen?'; return; }
    await SVB.sb.storage.from('studio').remove([pfad]); const {error}=await SVB.sb.from('studio_medien').delete().eq('pfad',pfad); if(error)return kToast('⚠️ '+error.message); ST.medien=null; closeOverlay(); kToast('Bild gelöscht'); }; }

/* ---------- Exportieren und teilen ---------- */
const ST_EXP=[
  ['pdf','PDF','Zum Drucken, Mailen und Ablegen. Text bleibt markierbar.','📄'],
  ['pptx','PowerPoint','Für PowerPoint, Keynote und Google Slides. Folien als Bilder, Sprechernotizen inklusive.','📊'],
  ['canva','Canva','Lädt die PowerPoint-Datei und öffnet Canva zum Importieren.','🎨'],
  ['png','Bilder','Jede Folie als Bild (PNG, bei „Kleiner“ als JPG), gesammelt als ZIP.','🖼'],
  ['html','HTML-Präsentation','Eine Datei, läuft in jedem Browser, mit Pfeiltasten und Übersicht.','🌐'],
  ['alles','Alles als ZIP','PDF, PowerPoint, HTML und alle Bilder in einem Paket.','📦']];
function stExpWahl(){ try{ return JSON.parse(localStorage.getItem('st-exp')||'{}'); }catch(e){ return {}; } }
function stFolienAuswahl(text){ const L=(ST.alle||[]).filter(f=>!f.ist_master).sort((a,b)=>a.pos-b.pos); const ids=new Set();
  String(text||'').split(/[,;\s]+/).filter(Boolean).forEach(t=>{ const m=t.match(/^(\d+)(?:-(\d+))?$/); if(!m)return; const a=+m[1], b=m[2]?+m[2]:a; for(let i=Math.min(a,b);i<=Math.max(a,b);i++){ const f=L[i-1]; if(f)ids.add(f.id); } });
  return [...ids]; }
function stGroesse(b){ return b>=1e6?(b/1e6).toFixed(1).replace('.',',')+' MB':Math.max(1,Math.round(b/1e3))+' KB'; }
stExportDialog=function(){ const w=Object.assign({typ:'pdf',groesse:'original',bereich:'alle'},stExpWahl()); const p=ST.p; const L=(ST.alle||[]).filter(f=>!f.ist_master).sort((a,b)=>a.pos-b.pos); const akt=ST.mModus?null:stF();
  const M=svModal(`<h2>Exportieren und teilen</h2>
    <div class="st-ew" id="stEw">
      <div class="st-el">Format</div>
      <div class="st-ef">${ST_EXP.map(([k,t,d,i])=>`<button type="button" class="st-eo${w.typ===k?' on':''}" data-et="${k}"><span class="st-ei">${i}</span><b>${t}</b><small>${d}</small></button>`).join('')}</div>
      <div class="st-eg">
        <div><div class="st-el">Größe</div><div class="st-seg"><button type="button" data-eg="original" class="${w.groesse==='original'?'on':''}">Originalgröße<small>beste Qualität, ${p.breite}×${p.hoehe}</small></button><button type="button" data-eg="klein" class="${w.groesse==='klein'?'on':''}">Kleiner<small>für Mail und WhatsApp</small></button></div></div>
        <div><div class="st-el">Folien</div><div class="st-seg"><button type="button" data-eb="alle" class="${w.bereich==='alle'?'on':''}">Alle<small>${L.filter(f=>!f.skip).length} ${p.art==='deck'?'Folien':'Seiten'}</small></button>${akt?`<button type="button" data-eb="aktuell" class="${w.bereich==='aktuell'?'on':''}">Nur diese<small>Nr. ${L.indexOf(akt)+1}</small></button>`:''}<button type="button" data-eb="auswahl" class="${w.bereich==='auswahl'?'on':''}">Auswahl<small>z. B. 1-5, 8</small></button></div>
          <input class="st-in" id="stEa" placeholder="1-5, 8, 12" value="${stE(w.auswahl||'')}" ${w.bereich==='auswahl'?'':'hidden'}>
          <label class="st-chk"><input type="checkbox" id="stEbk" ${w.backup?'checked':''}> Ausgeblendete Backup-Folien mitnehmen</label></div>
      </div>
      <div class="btnrow"><button type="button" class="btn" id="stEgo">${SVI('download')} Erstellen</button><span class="note small" id="stEh"></span></div>
    </div>
    <div class="st-es" id="stEs" hidden></div>`); M.classList.add('st-modal','st-expm');
  const q=s=>M.querySelector(s); const merk=()=>{ try{ localStorage.setItem('st-exp',JSON.stringify(w)); }catch(e){} };
  const hinweis=()=>{ q('#stEh').textContent=({canva:'Canva importiert die PowerPoint-Datei, jede Folie wird dort zu einer Seite.',pptx:'Texte sind in PowerPoint nicht mehr einzeln änderbar, dafür sieht alles exakt aus wie hier.',html:'Bilder sind eingebettet, die Datei funktioniert auch ohne Internet (nur die Schrift lädt online nach).',alles:'Kann bei vielen Fotos groß werden. „Kleiner“ hilft.'}[w.typ]||''); };
  M.querySelectorAll('[data-et]').forEach(b=>b.onclick=()=>{ w.typ=b.dataset.et; M.querySelectorAll('[data-et]').forEach(x=>x.classList.toggle('on',x===b)); hinweis(); });
  M.querySelectorAll('[data-eg]').forEach(b=>b.onclick=()=>{ w.groesse=b.dataset.eg; M.querySelectorAll('[data-eg]').forEach(x=>x.classList.toggle('on',x===b)); });
  M.querySelectorAll('[data-eb]').forEach(b=>b.onclick=()=>{ w.bereich=b.dataset.eb; M.querySelectorAll('[data-eb]').forEach(x=>x.classList.toggle('on',x===b)); q('#stEa').hidden=w.bereich!=='auswahl'; if(!q('#stEa').hidden)q('#stEa').focus(); });
  hinweis();
  q('#stEgo').onclick=async e=>{ const b=e.currentTarget; w.auswahl=q('#stEa').value.trim(); w.backup=q('#stEbk').checked; merk();
    let folien=null; if(w.bereich==='aktuell'&&akt)folien=[akt.id]; if(w.bereich==='auswahl'){ folien=stFolienAuswahl(w.auswahl); if(!folien.length){ q('#stEh').textContent='Bitte Foliennummern angeben, z. B. 1-5, 8'; return; } }
    const backup=w.backup||(folien||[]).some(id=>{ const f=stFolieId(id); return f&&f.skip; });
    b.disabled=true; const S=q('#stEs'); q('#stEw').hidden=true; S.hidden=false;
    const typ=w.typ==='canva'?'pptx':w.typ; const name=(p.titel||'Studio').replace(/[^\wäöüÄÖÜß .-]+/g,'').trim()+'.'+({pdf:'pdf',pptx:'pptx',html:'html'}[typ]||'zip');
    const schritt=(t,pz)=>{ S.innerHTML=`<div class="st-ep"><div class="st-epb"><i style="width:${pz}%"></i></div><p>${stE(t)}</p></div>`; };
    try{ await stSpeichernJetzt(); schritt('Auftrag wird angelegt …',8);
      const {data,error}=await SVB.sb.functions.invoke('studio-export',{body:{projekt:p.id,typ,groesse:w.groesse,folien,backup}});
      if(error)throw error; if(data&&data.error)throw new Error(data.error); const job=data&&data.id; if(!job)throw new Error('Kein Auftrag');
      const warte=data.server===false?'Der Export-Server ist gerade nicht erreichbar. Der Auftrag bleibt gespeichert und wird erledigt, sobald er wieder läuft.':'Wartet auf den Export-Server …';
      let j=null; for(let i=0;i<150;i++){ await new Promise(r=>setTimeout(r,i<5?1500:3000)); if(!document.body.contains(S))return;
        ({data:j}=await SVB.sb.from('studio_exporte').select('status,datei,fehler,ueberstand,optionen,seiten').eq('id',job).single());
        if(j&&j.status==='fertig')break; if(j&&j.status==='fehler')throw new Error(j.fehler||'Export fehlgeschlagen');
        schritt(j&&j.status==='laeuft'?`Der Server erstellt ${({pdf:'das PDF',pptx:'die PowerPoint-Datei',html:'die HTML-Präsentation',png:'die Bilder',alles:'alle Formate'})[typ]} …`:warte, j&&j.status==='laeuft'?Math.min(92,30+i*4):Math.min(25,10+i)); }
      if(!j||j.status!=='fertig')throw new Error('Das dauert ungewöhnlich lange. Bitte später nochmal versuchen.');
      const [dl,teil]=await Promise.all([SVB.sb.storage.from('studio').createSignedUrl(j.datei,3600,{download:name}),SVB.sb.storage.from('studio').createSignedUrl(j.datei,7*24*3600)]);
      const url=dl.data&&dl.data.signedUrl, link=teil.data&&teil.data.signedUrl; if(!url)throw new Error('Download-Link fehlt');
      stTeilen(S,{url,link,name,typ:w.typ,bytes:(j.optionen||{}).bytes,seiten:j.seiten,ue:(j.ueberstand||[]).map((x,i)=>x>0?i+1:0).filter(Boolean),titel:p.titel});
    }catch(x){ S.innerHTML=`<p class="note">⚠️ ${stE(x.message||x)}</p><div class="btnrow"><button type="button" class="btn sm ghost" id="stEz">Zurück</button></div>`; q('#stEz').onclick=()=>{ S.hidden=true; q('#stEw').hidden=false; b.disabled=false; }; } };
};
function stTeilen(S,o){ const text=`${o.titel||'Studio'} (SV/BSC Mörlenbach)`; const kannTeilen=!!(navigator.share&&navigator.canShare);
  S.innerHTML=`<div class="st-ed1"><div class="st-edi">${o.typ==='canva'?'🎨':'✓'}</div><div><b>${stE(o.name)}</b><small>${o.bytes?stGroesse(o.bytes)+' · ':''}${o.seiten||''} ${ST.p.art==='deck'?'Folien':'Seiten'}${o.ue.length?` · ⚠️ Text ragt über den Rand auf ${o.ue.join(', ')}`:''}</small></div></div>
    <div class="st-eaz">
      <a class="btn" id="stEd" href="${stE(o.url)}" download="${stE(o.name)}">${SVI('download')} Herunterladen</a>
      ${o.typ==='canva'?`<a class="btn ghost" href="https://www.canva.com/" target="_blank" rel="noopener">Canva öffnen</a>`:''}
      ${kannTeilen?`<button type="button" class="btn ghost" id="stEsh">Teilen …</button>`:''}
    </div>
    ${o.typ==='canva'?`<p class="note small">In Canva: „Erstellen“ → „Importieren“ (oder Datei einfach ins Canva-Fenster ziehen) und die PowerPoint-Datei wählen.</p>`:''}
    <div class="st-el">Link schicken <small>7 Tage gültig, jeder mit dem Link kann die Datei laden</small></div>
    <div class="st-esl">
      <a class="st-eb" href="mailto:?subject=${encodeURIComponent(text)}&body=${encodeURIComponent('Hallo,\n\nhier zum Herunterladen: '+o.link+'\n\nDer Link ist 7 Tage gültig.\n')}">✉️<span>E-Mail</span></a>
      <a class="st-eb" href="https://wa.me/?text=${encodeURIComponent(text+': '+o.link)}" target="_blank" rel="noopener">💬<span>WhatsApp</span></a>
      <button type="button" class="st-eb" id="stEk">🔗<span>Link kopieren</span></button>
      ${kannTeilen?`<button type="button" class="st-eb" id="stEsl">📤<span>Link teilen</span></button>`:''}
    </div>
    <div class="btnrow" style="margin-top:12px"><button type="button" class="btn sm ghost" id="stEn">Anderes Format</button></div>`;
  const q=s=>S.querySelector(s);
  const dl=q('#stEd'); if(dl)dl.click();
  q('#stEk').onclick=async()=>{ try{ await navigator.clipboard.writeText(o.link); kToast('✓ Link kopiert (7 Tage gültig)'); }catch(e){ prompt('Link kopieren:',o.link); } };
  const sl=q('#stEsl'); if(sl)sl.onclick=()=>navigator.share({title:text,text,url:o.link}).catch(()=>{});
  const sh=q('#stEsh'); if(sh)sh.onclick=async()=>{ sh.disabled=true; sh.textContent='Wird geladen …';
    try{ const blob=await (await fetch(o.url)).blob(); const f=new File([blob],o.name,{type:blob.type||'application/octet-stream'});
      if(navigator.canShare({files:[f]}))await navigator.share({files:[f],title:text}); else await navigator.share({title:text,text,url:o.link}); }catch(e){} sh.disabled=false; sh.textContent='Teilen …'; };
  q('#stEn').onclick=()=>{ closeOverlay(); stExportDialog(); }; }

/* =====================================================================
   SV/BSC Studio (Teil 6, Beta 0.45): Bereiche und Sichtbarkeit je Rolle
   Jedes Projekt gehört zu einem Bereich (Abteilungsleitung, Sport, Partner, Social Media, Jugend, Verein) und kann privat sein.
   Sehen und Ändern regelt die Datenbank (Nutzer & Rollen: je Bereich „ansehen“ und „bearbeiten“, Ausnahmen je Person).
   Die Oberfläche zeigt an jedem Projekt, wer es sieht, und lässt nur in erlaubten Bereichen anlegen.
   ===================================================================== */
const ST_BEREICHE=[['leitung','Abteilungsleitung','intern','#1d2760'],['sport','Sport & Trainer','','#2f7a4a'],['partner','Partner','','#e8741f'],['social','Social Media & Presse','','#c2408a'],['jugend','Jugend','','#3d7bff'],['verein','Verein allgemein','','#5b5b66']];
const ST_ROLLEN={admin:'Admin',vorstand:'Vorstand',planer:'Planer',trainer:'Trainer',viewer:'Gast',jugend:'Jugend'};
function stBereich(k){ return ST_BEREICHE.find(b=>b[0]===k)||ST_BEREICHE[5]; }
function stBR(k){ return ((ST.rechte&&ST.rechte.bereiche)||[]).find(b=>b.key===k)||{}; }
function stBereicheBearbeitbar(){ const R=ST.rechte||{}; return ST_BEREICHE.filter(b=>R.admin||stBR(b[0]).bearbeiten&&stBR(b[0]).sehen); }
function stStdBereich(){ const L=stBereicheBearbeitbar(); return (L.find(b=>b[0]==='verein')||L[0]||ST_BEREICHE[5])[0]; }
function stDarfProjekt(p){ const R=ST.rechte||{}; if(!p)return false; if(R.admin)return true; const b=stBR(p.bereich||'verein'); return !!(b.sehen&&b.bearbeiten&&(!p.privat||p.erstellt_von===R.ich)); }
// Bearbeiten-Recht hängt jetzt am Projekt: im Editor zählt der Bereich des offenen Projekts
stKann=function(){ const R=ST.rechte; if(!R)return false; if(ST.p&&ST.ansicht==='editor')return stDarfProjekt(ST.p); return !!R.bearbeiten; };
function stWerSieht(p){ const b=stBR(p.bereich||'verein'); if(p.privat)return 'Nur du (privat) und Admin';
  const r=(b.rollen||[]).map(x=>ST_ROLLEN[x]||x); return ['Admin'].concat(r).join(', ')+' und freigegebene Personen'; }
function stWerAendert(p){ const b=stBR(p.bereich||'verein'); if(p.privat)return 'Nur du und Admin'; const r=(b.rollen_bearbeiten||[]).map(x=>ST_ROLLEN[x]||x); return ['Admin'].concat(r).join(', ')+' und freigegebene Personen'; }
function stBadge(p,gross){ const b=stBereich(p.bereich); return `<span class="st-bb${gross?' gross':''}" style="--bc:${b[3]}" title="Sichtbar für: ${stE(stWerSieht(p))}">${p.privat?'🔒 ':''}${stE(b[1])}</span>`; }

/* ---------- Projektliste: Filter nach Bereich, Kennzeichnung an jeder Karte ---------- */
{ const _li=stListe; stListe=function(){ const alle=ST.projekte||[]; const f=ST.bfilter||'';
  ST.projekte=f?alle.filter(p=>(p.bereich||'verein')===f):alle; try{ _li.apply(this,arguments); } finally { ST.projekte=alle; }
  const P=stPanel(); if(!P)return; const vorh=new Map(); alle.forEach(p=>vorh.set(p.bereich||'verein',(vorh.get(p.bereich||'verein')||0)+1));
  const lk=P.querySelector('.st-lk'); if(lk&&vorh.size>1){ const d=document.createElement('div'); d.className='st-mf st-bf';
    d.innerHTML=`<button type="button" class="${!f?'on':''}" data-bf="">Alle Bereiche <small>${alle.length}</small></button>`+ST_BEREICHE.filter(b=>vorh.has(b[0])).map(b=>`<button type="button" class="${f===b[0]?'on':''}" data-bf="${b[0]}" style="--bc:${b[3]}"><i class="st-bdot"></i>${stE(b[1])} <small>${vorh.get(b[0])}</small></button>`).join('');
    lk.insertAdjacentElement('afterend',d); d.querySelectorAll('[data-bf]').forEach(x=>x.onclick=()=>{ ST.bfilter=x.dataset.bf; stListe(); }); }
  const PJ=new Map(alle.map(p=>[p.id,p]));
  P.querySelectorAll('[data-stp]').forEach(k=>{ const p=PJ.get(k.dataset.stp); const t=k.querySelector('.st-pk-t'); if(p&&t&&!t.querySelector('.st-bb'))t.insertAdjacentHTML('afterbegin',stBadge(p)); }); }; }

/* ---------- Neues Projekt: Bereich und Sichtbarkeit wählen ---------- */
{ const _np=stNeuesProjekt; stNeuesProjekt=function(art){ const L=stBereicheBearbeitbar(); if(!L.length)return kToast('Du darfst in keinem Bereich Projekte anlegen.');
  const w={bereich:ST.bfilter&&L.some(b=>b[0]===ST.bfilter)?ST.bfilter:stStdBereich(),privat:false};
  const M=svModal(`<h2>Neues Projekt</h2><p class="note">In welchen Bereich gehört es? Davon hängt ab, wer es sieht und ändern darf.</p>
    <div class="st-bw">${L.map(b=>`<button type="button" class="st-bo${w.bereich===b[0]?' on':''}" data-nb="${b[0]}" style="--bc:${b[3]}"><b><i class="st-bdot"></i>${stE(b[1])}</b><small>Sichtbar für ${stE(stWerSieht({bereich:b[0]}))}</small></button>`).join('')}</div>
    <label class="st-chk"><input type="checkbox" id="stNp"> Erst mal privat (nur ich und Admin), später freigeben</label>
    <div class="btnrow" style="margin-top:14px"><button type="button" class="btn" id="stNgo">${SVI('plus')} Anlegen</button></div>`); M.classList.add('st-modal');
  M.querySelectorAll('[data-nb]').forEach(b=>b.onclick=()=>{ w.bereich=b.dataset.nb; M.querySelectorAll('[data-nb]').forEach(x=>x.classList.toggle('on',x===b)); });
  M.querySelector('#stNgo').onclick=async()=>{ w.privat=M.querySelector('#stNp').checked; stNeuesProjekt.wahl=w; closeOverlay(); try{ await _np.call(this,art); } finally { stNeuesProjekt.wahl=null; } }; }; }

/* ---------- Editor: Kennzeichnung oben, Sichtbarkeit ändern ---------- */
{ const _er=stEditorRender; stEditorRender=function(){ _er.apply(this,arguments); try{ const P=stPanel(), t=P&&P.querySelector('.st-top .st-stat'); if(!t||!ST.p)return;
  const b=document.createElement('button'); b.type='button'; b.className='st-sicht'; b.id='stSicht'; b.innerHTML=stBadge(ST.p,true)+`<small>${stDarfProjekt(ST.p)?'Sichtbarkeit':'nur ansehen'}</small>`; b.title='Sichtbar für: '+stWerSieht(ST.p)+'\nÄndern dürfen: '+stWerAendert(ST.p);
  b.onclick=()=>stSichtbarkeit(); t.insertAdjacentElement('afterend',b); }catch(e){ console.warn('Studio',e); } }; }
function stSichtbarkeit(){ const p=ST.p; if(!p)return; const darf=stDarfProjekt(p); const L=darf?stBereicheBearbeitbar():[]; const w={bereich:p.bereich||'verein',privat:!!p.privat};
  const info=()=>`<div class="st-swh"><div><span class="st-el">Sehen</span><p>${stE(stWerSieht(w))}</p></div><div><span class="st-el">Ändern</span><p>${stE(stWerAendert(w))}</p></div></div>`;
  const M=svModal(`<h2>Sichtbarkeit</h2><p class="note">„${stE(p.titel)}“ gehört zum Bereich <b>${stE(stBereich(w.bereich)[1])}</b>.</p>
    <div id="stSwi">${info()}</div>
    ${darf?`<div class="st-el">Bereich ändern</div><div class="st-bw">${L.map(b=>`<button type="button" class="st-bo${w.bereich===b[0]?' on':''}" data-sb="${b[0]}" style="--bc:${b[3]}"><b><i class="st-bdot"></i>${stE(b[1])}</b></button>`).join('')}</div>
      <label class="st-chk"><input type="checkbox" id="stSp" ${w.privat?'checked':''} ${p.erstellt_von&&p.erstellt_von!==(ST.rechte||{}).ich&&!(ST.rechte||{}).admin?'disabled':''}> Privat: nur ${p.erstellt_von===(ST.rechte||{}).ich?'ich':'die Person, die es angelegt hat,'} und Admin</label>
      <div class="btnrow" style="margin-top:14px"><button type="button" class="btn" id="stSs">Speichern</button></div>`:'<p class="note small">Du kannst dieses Projekt ansehen und kommentieren, aber nicht ändern.</p>'}
    <p class="note small">Wer welchen Bereich sieht und bearbeitet, legt der Admin unter Verwaltung → Nutzer &amp; Rollen fest (Vorgaben je Rolle, Ausnahmen je Person).${(ST.rechte||{}).admin?' <a href="#" id="stSr">Jetzt öffnen</a>':''}</p>`); M.classList.add('st-modal');
  M.querySelectorAll('[data-sb]').forEach(b=>b.onclick=()=>{ w.bereich=b.dataset.sb; M.querySelectorAll('[data-sb]').forEach(x=>x.classList.toggle('on',x===b)); M.querySelector('#stSwi').innerHTML=info(); });
  const sp=M.querySelector('#stSp'); if(sp)sp.onchange=()=>{ w.privat=sp.checked; M.querySelector('#stSwi').innerHTML=info(); };
  const sr=M.querySelector('#stSr'); if(sr)sr.onclick=e=>{ e.preventDefault(); closeOverlay(); goTab('admin'); };
  const ss=M.querySelector('#stSs'); if(ss)ss.onclick=async()=>{ ss.disabled=true; const {error}=await SVB.sb.from('studio_projekte').update({bereich:w.bereich,privat:w.privat}).eq('id',p.id);
    if(error){ ss.disabled=false; return kToast('⚠️ '+error.message); } p.bereich=w.bereich; p.privat=w.privat; closeOverlay(); kToast('✓ Sichtbarkeit gespeichert'); stEditorRender(); }; }

/* =====================================================================
   Sportzentrale Beta 0.46 · Studio: einer bearbeitet, alle anderen sehen zu
   - Wer ein Projekt öffnet und bearbeiten darf, bekommt die Sperre. Alle anderen sehen „XY bearbeitet gerade“,
     können ansehen, präsentieren und kommentieren, aber nichts ändern (die Datenbank lässt es auch nicht zu, 086).
   - Eine Stunde ohne Aktivität: Änderungen werden gespeichert, die Sperre fällt, das Projekt ist wieder frei.
   - Sobald das Projekt frei ist, geht es bei der nächsten Person, die gerade dran ist, automatisch weiter.
   - Verlauf wie bei Wikipedia: wer hat wann was erstellt, geändert, gelöscht. Jede alte Fassung ansehen und zurückholen,
     auch gelöschte Folien. Versionen zeigen, wer sie angelegt hat; automatische Stände bei Beginn und Ende jeder Bearbeitung.
   ===================================================================== */
const STS={letzte:Date.now(),gehalten:0,abfrage:0,timer:null,token:null,
  INAKTIV:60*60*1000,   // nach einer Stunde ohne Aktivität raus
  HALTEN:2*60*1000,     // Lebenszeichen höchstens alle zwei Minuten, und nur, wenn jemand gerade arbeitet
  PRUEFEN:15*1000};     // wer zusieht, fragt alle 15 Sekunden, ob das Projekt frei ist
function stSperreFehlt(e){ const m=String((e&&(e.message||e.code))||''); return /studio_sperre|PGRST202|42883|Could not find the function/i.test(m); }
async function stSperreRpc(aktion,pid){ const {data,error}=await SVB.sb.rpc('studio_sperre',{p_id:pid,p_aktion:aktion}); if(error)throw error; return data||{}; }
async function stTokenMerken(){ try{ const {data}=await SVB.sb.auth.getSession(); STS.token=data&&data.session&&data.session.access_token||STS.token; }catch(e){} }
function stSperreSetzen(pid,s){ ST.sperre=Object.assign({pid},s||{}); }
function stDarfGrundsaetzlich(){ return !!(ST.rechte&&ST.rechte.bearbeiten); }

async function stSperreHolen(pid){ STS.letzte=Date.now(); STS.gehalten=Date.now();
  try{ const s=await stSperreRpc(stDarfGrundsaetzlich()?'holen':'status',pid); stSperreSetzen(pid,s); stTokenMerken(); }
  catch(e){ if(stSperreFehlt(e))stSperreSetzen(pid,{meine:true,frei:true,ohne:true}); else { console.warn('Sperre',e); stSperreSetzen(pid,{meine:false,frei:false,name:'Jemand',fehler:e.message}); } }
  stSperreTimer(); return ST.sperre; }
async function stSperreFrei(){ const s=ST.sperre; if(!s||!s.meine||s.ohne){ ST.sperre=null; return; } ST.sperre=null;
  try{ await stSperreRpc('frei',s.pid); }catch(e){ console.warn('Sperre frei',e); } }

// Darf ich gerade ändern? Grundrecht UND (außerhalb des Editors oder ich habe die Sperre)
{ const _k=stKann; stKann=function(){ if(!_k.apply(this,arguments))return false; if(ST.ansicht!=='editor'||!ST.p)return true;
    const s=ST.sperre; return !!(s&&s.pid===ST.p.id&&s.meine); }; }
// Beim Öffnen die Sperre holen, beim Wechsel auf ein anderes Projekt die alte freigeben
{ const _pl=stProjektLaden; stProjektLaden=async function(id){
    if(ST.sperre&&ST.sperre.pid!==id&&ST.sperre.meine){ try{ await stSpeichernJetzt(); }catch(e){} await stSperreFrei(); }
    const r=await _pl.apply(this,arguments);
    if(!ST.sperre||ST.sperre.pid!==id||!ST.sperre.meine)await stSperreHolen(id);
    return r; }; }
// Zurück zur Liste = fertig
{ const _li=stListe; stListe=function(){ if(ST.sperre&&ST.sperre.meine&&(!ST.p||ST.ansicht!=='editor'))stSperreFrei();
    const r=_li.apply(this,arguments); stListeSperren(); return r; }; }
// Studio verlassen = fertig; zurückkommen = Sperre wieder holen
{ const _gt=goTab; goTab=function(tab){ const war=svCurTab(); const r=_gt.apply(this,arguments);
    try{ if(war==='studio'&&svCurTab()!=='studio'&&ST.sperre&&ST.sperre.meine){ (async()=>{ try{ await stSpeichernJetzt(); }catch(e){} await stSperreFrei(); })(); } }catch(e){}
    return r; }; }
{ const _st=stStart; stStart=async function(){ if(ST.ansicht==='editor'&&ST.p&&!(ST.sperre&&ST.sperre.pid===ST.p.id&&ST.sperre.meine)){ await stRechte(); await stSperreHolen(ST.p.id); }
    return _st.apply(this,arguments); }; }
// Seite zu oder neu geladen: Sperre sofort freigeben (keepalive, damit die Anfrage auch beim Schließen noch rausgeht)
window.addEventListener('pagehide',()=>{ const s=ST.sperre; if(!s||!s.meine||s.ohne||!STS.token)return;
  try{ const sb=SVB.sb, url=sb.supabaseUrl||sb.rest&&sb.rest.url&&sb.rest.url.replace(/\/rest\/v1\/?$/,''), key=sb.supabaseKey; if(!url||!key)return;
    fetch(url.replace(/\/$/,'')+'/rest/v1/rpc/studio_sperre',{method:'POST',keepalive:true,headers:{'content-type':'application/json',apikey:key,authorization:'Bearer '+STS.token},body:JSON.stringify({p_id:s.pid,p_aktion:'frei'})}); }catch(e){} });

// Aktivität = Maus, Tippen, Scrollen im Studio
['pointerdown','keydown','wheel','input'].forEach(ev=>document.addEventListener(ev,()=>{ if(typeof svCurTab==='function'&&svCurTab()==='studio')STS.letzte=Date.now(); },{capture:true,passive:true}));

function stSperreTimer(){ if(STS.timer)return; STS.timer=setInterval(stSperreTakt,5000); }
async function stSperreTakt(){
  if(typeof svCurTab!=='function'||svCurTab()!=='studio'||ST.ansicht!=='editor'||!ST.p||!ST.sperre||ST.sperre.pid!==ST.p.id||ST.sperre.ohne||STS.laeuft)return;
  if(document.visibilityState==='hidden'&&!ST.sperre.meine)return;
  STS.laeuft=true; const jetzt=Date.now(), s=ST.sperre;
  try{
    if(s.meine){
      if(jetzt-STS.letzte>=STS.INAKTIV)return await stRauswurf();
      if(jetzt-STS.letzte<STS.HALTEN+10000&&jetzt-STS.gehalten>=STS.HALTEN){ STS.gehalten=jetzt; const n=await stSperreRpc('halten',s.pid); stTokenMerken();
        if(!n.meine){ stSperreSetzen(s.pid,n); stNurNoch('weg'); } else stSperreSetzen(s.pid,n); }
    } else if(jetzt-STS.abfrage>=STS.PRUEFEN){ STS.abfrage=jetzt;
      const n=await stSperreRpc('status',s.pid);
      if(n.frei&&stDarfGrundsaetzlich()&&!s.raus&&jetzt-STS.letzte<5*60*1000){ await stUebernehmenJetzt(s.pid,false); }
      else { const vorher=JSON.stringify([s.frei,s.name]); stSperreSetzen(s.pid,Object.assign({raus:s.raus},n)); if(vorher!==JSON.stringify([n.frei,n.name]))stSperreBanner(); }
    }
  }catch(e){ console.warn('Sperre',e); }
  finally{ STS.laeuft=false; } }
// Eine Stunde nichts getan: speichern, freigeben, nur noch ansehen
async function stRauswurf(){ const pid=ST.sperre.pid; try{ await stSpeichernJetzt(); }catch(e){}
  try{ await stSperreRpc('frei',pid); }catch(e){}
  stSperreSetzen(pid,{meine:false,frei:true,raus:true}); stNurNoch('raus'); }
function stNurNoch(grund){ ST.sel=[]; ST.edit=null; try{ stEditorRender(); }catch(e){}
  kToast(grund==='raus'?'Du warst eine Stunde nicht aktiv. Alles ist gespeichert, das Projekt ist wieder frei.':`${ST.sperre&&ST.sperre.name||'Jemand'} bearbeitet jetzt. Deine Änderungen bis hierhin sind gespeichert.`); }
async function stUebernehmenJetzt(pid,admin){
  try{ const n=await stSperreRpc(admin?'uebernehmen':'holen',pid); stSperreSetzen(pid,n); STS.letzte=Date.now(); STS.gehalten=Date.now(); stTokenMerken();
    if(n.meine){ await stProjektLaden(pid); stEditorRender(); kToast(admin?'✓ Du bearbeitest jetzt':'✓ Das Projekt ist frei, du kannst jetzt bearbeiten'); }
    else stSperreBanner(); }
  catch(e){ kToast('⚠️ '+e.message); } }

function stUhr(t){ try{ return new Date(t).toLocaleTimeString('de-DE',{hour:'2-digit',minute:'2-digit'}); }catch(e){ return ''; } }
function stVorname(n){ return String(n||'Jemand').split(' ')[0]; }
// Hinweis im Editor
function stSperreBanner(){ const ed=document.querySelector('#panel-studio .st-ed'); if(!ed||!ST.p)return; let b=ed.querySelector('.st-sperre');
  const s=ST.sperre; const top=ed.querySelector('.st-top'); let chip=top&&top.querySelector('.st-lock');
  if(s&&s.meine&&!s.ohne){ if(b)b.remove(); if(top&&!chip){ chip=document.createElement('span'); chip.className='st-lock mine'; const st=top.querySelector('#stStat'); (st||top).insertAdjacentElement('afterend',chip); }
    if(chip){ chip.textContent='✎ Du bearbeitest'; chip.title='Andere sehen „'+stMeinName()+' bearbeitet gerade“ und können nichts ändern, bis du zurück zur Liste gehst oder eine Stunde nichts tust.'; } return; }
  if(chip)chip.remove();
  if(!s||s.ohne||(s.frei&&!stDarfGrundsaetzlich())){ if(b)b.remove(); return; }
  if(!b){ b=document.createElement('div'); b.className='st-sperre'; (top||ed).insertAdjacentElement('afterend',b); }
  const darf=stDarfGrundsaetzlich(), admin=typeof isAdmin==='function'&&isAdmin();
  if(!s.frei){
    b.className='st-sperre zu';
    b.innerHTML=`<span class="st-sp-i">🔒</span><span><b>${stE(s.name||'Jemand')}</b> bearbeitet gerade${s.seit?' (seit '+stE(stUhr(s.seit))+' Uhr)':''}. Du kannst ansehen und kommentieren${darf?`. Sobald ${stE(stVorname(s.name))} fertig ist, kannst du hier weitermachen.`:'.'}</span>
      ${admin&&darf?'<button type="button" class="btn sm ghost" id="stSpUeb">Bearbeitung übernehmen</button>':''}`;
    const u=b.querySelector('#stSpUeb'); if(u)u.onclick=()=>{ if(!u.classList.contains('sure')){ u.classList.add('sure'); u.textContent='Wirklich? '+stVorname(s.name)+' fliegt raus'; return; } u.disabled=true; stUebernehmenJetzt(ST.p.id,true); };
  } else {
    b.className='st-sperre frei';
    b.innerHTML=`<span class="st-sp-i">${s.raus?'⏸':'✓'}</span><span>${s.raus?'Du warst eine Stunde nicht aktiv, deshalb ist das Projekt wieder frei. Alles ist gespeichert.':'Gerade bearbeitet niemand dieses Projekt.'}</span>
      ${darf?'<button type="button" class="btn sm" id="stSpGo">Bearbeiten</button>':''}`;
    const g=b.querySelector('#stSpGo'); if(g)g.onclick=()=>{ g.disabled=true; stUebernehmenJetzt(ST.p.id,false); };
  } }
// Projektliste: wer arbeitet gerade woran
async function stListeSperren(){ try{ const {data,error}=await SVB.sb.rpc('studio_sperren_liste'); if(error||!data)return;
  document.querySelectorAll('#panel-studio [data-stp]').forEach(k=>{ const s=data[k.dataset.stp]; let m=k.querySelector('.st-pk-lock'); if(!s){ if(m)m.remove(); return; }
    if(!m){ m=document.createElement('span'); m.className='st-pk-lock'; (k.querySelector('.st-pk-t')||k).appendChild(m); }
    m.textContent=s.meine?'✎ Du bearbeitest gerade':'✎ '+s.name+' bearbeitet gerade'; }); }catch(e){} }

/* ---------- Verlauf ---------- */
{ const _er=stEditorRender; stEditorRender=function(){ const r=_er.apply(this,arguments);
    try{ const top=document.querySelector('#panel-studio .st-top'); if(top&&!top.querySelector('#stVerl')){ const b=document.createElement('button'); b.type='button'; b.className='btn sm ghost'; b.id='stVerl'; b.innerHTML=SVI('clock')+' Verlauf';
        const exp=top.querySelector('#stExp'); top.insertBefore(b,exp||null); b.onclick=()=>stRechts('verl'); }
      const v=top&&top.querySelector('#stVer'); if(v)v.innerHTML=SVI('layers')+' Versionen';
      stSperreBanner(); }catch(e){ console.warn('Studio',e); }
    return r; }; }
{ const _re=stRechts; stRechts=function(art){ if(art!=='verl')return _re.apply(this,arguments);
    const R=document.getElementById('stRechts'); if(!R)return; if(!R.hidden&&R.dataset.art===art){ R.hidden=true; R.dataset.art=''; stSkalieren(); return; }
    R.hidden=false; R.dataset.art=art; R.innerHTML=''; ST.verlauf={L:[],ende:false}; stVerlaufPanel(R); stSkalieren(); }; }
const ST_VA={neu:'angelegt',geaendert:'bearbeitet',geloescht:'gelöscht',reihenfolge:'Reihenfolge geändert',projekt:'Projekt geändert',wiederhergestellt:'ältere Fassung zurückgeholt'};
function stVerlaufFolie(v){ const lab=v.ln||v.lv||''; const i=(ST.folien||[]).findIndex(f=>f.id===v.folie_id);
  const nr=i>=0?'Folie '+(i+1):((ST.alle||[]).some(f=>f.id===v.folie_id&&f.ist_master)?'Masterfolie':'Folie');
  return nr+(lab?' „'+lab+'“':''); }
function stVerlaufText(v){
  if(!v.folie_id){ if(v.art==='neu')return 'hat das Projekt erstellt'; if(v.art==='reihenfolge')return 'hat die Reihenfolge der Folien geändert'; return 'hat Titel oder Einstellungen geändert'; }
  const f=stVerlaufFolie(v);
  return {neu:`hat ${f} angelegt`,geaendert:`hat ${f} bearbeitet`,geloescht:`hat ${f} gelöscht`,wiederhergestellt:`hat bei ${f} eine ältere Fassung zurückgeholt`}[v.art]||(ST_VA[v.art]||v.art); }
function stTagZeit(t){ const d=new Date(t); const heute=new Date(); const gestern=new Date(Date.now()-864e5);
  const tag=d.toDateString()===heute.toDateString()?'Heute':d.toDateString()===gestern.toDateString()?'Gestern':d.toLocaleDateString('de-DE',{weekday:'short',day:'2-digit',month:'2-digit',year:'numeric'});
  return [tag,stUhr(t)]; }
async function stVerlaufLaden(){ const V=ST.verlauf; if(!V||V.ende||!ST.p)return;
  let q=SVB.sb.from('studio_verlauf').select('id,folie_id,art,name,am,bis,anzahl,lv:vorher->>label,ln:nachher->>label,tv:vorher->>titel,tn:nachher->>titel').eq('projekt_id',ST.p.id).order('id',{ascending:false}).limit(60);
  if(V.L.length)q=q.lt('id',V.L[V.L.length-1].id);
  const {data,error}=await q; if(error)throw error; V.L=V.L.concat(data||[]); if(!data||data.length<60)V.ende=true; }
async function stVerlaufPanel(R){ R.innerHTML='<h4>Verlauf</h4><div class="empty">Lade …</div>';
  try{ await stVerlaufLaden(); }catch(e){ R.innerHTML=`<h4>Verlauf</h4><p class="note">${stSperreFehlt(e)||/studio_verlauf/.test(e.message||'')?'Der Verlauf braucht noch die Datenbank-Erweiterung 086.':'⚠️ '+stE(e.message)}</p>`; return; }
  stVerlaufZeigen(R); }
function stVerlaufZeigen(R){ const V=ST.verlauf, kann=stKann(); let tag='';
  const zeilen=V.L.map(v=>{ const [t,uhr]=stTagZeit(v.am); const kopf=t!==tag?`<div class="st-vt">${stE(t)}</div>`:''; tag=t;
    const mehr=v.anzahl>1?` <small>· ${v.anzahl} Speicherungen bis ${stE(stUhr(v.bis))}</small>`:'';
    const titel=!v.folie_id&&v.art==='projekt'&&v.tv!==v.tn&&v.tn?`<div class="st-vd">Titel: ${stE(v.tv||'')} → ${stE(v.tn)}</div>`:'';
    const ansehen=v.folie_id?`<button type="button" class="btn sm ghost" data-vla="${v.id}">Ansehen</button>`:'';
    const zurueck=!kann?'':v.art==='geloescht'?`<button type="button" class="btn sm ghost" data-vlh="${v.id}" data-w="vorher">Wiederherstellen</button>`
      :(v.art==='geaendert'||v.art==='wiederhergestellt'||v.art==='projekt')?`<button type="button" class="btn sm ghost" data-vlh="${v.id}" data-w="vorher">Fassung davor zurückholen</button>`:'';
    return `${kopf}<div class="st-ve" data-vl="${v.id}"><div class="st-vk"><span class="st-vz">${stE(uhr)}</span><span><b>${stE(v.name||'Jemand')}</b> ${stE(stVerlaufText(v))}${mehr}</span></div>${titel}
      ${ansehen||zurueck?`<div class="st-vb">${ansehen}${zurueck}</div>`:''}<div class="st-vp" hidden></div></div>`; }).join('');
  R.innerHTML=`<h4>Verlauf</h4><p class="note small">Wer hat wann was geändert. Jede ältere Fassung lässt sich ansehen und zurückholen, auch gelöschte Folien. Gelöscht wird hier nie etwas.</p>
    <div class="st-verl">${zeilen||'<p class="note">Noch keine Einträge. Ab jetzt wird jede Änderung festgehalten.</p>'}</div>
    ${V.ende?'':'<button type="button" class="btn sm ghost" id="stVlMehr">Ältere Einträge</button>'}`;
  const m=R.querySelector('#stVlMehr'); if(m)m.onclick=async()=>{ m.disabled=true; try{ await stVerlaufLaden(); }catch(e){ kToast('⚠️ '+e.message); } stVerlaufZeigen(R); };
  R.querySelectorAll('[data-vla]').forEach(b=>b.onclick=()=>stVerlaufAnsehen(b.closest('.st-ve'),+b.dataset.vla));
  R.querySelectorAll('[data-vlh]').forEach(b=>b.onclick=async()=>{ if(!b.classList.contains('sure')){ b.classList.add('sure'); b.textContent='Ja, zurückholen'; return; }
    b.disabled=true; await stVerlaufHerstellen(+b.dataset.vlh,b.dataset.w); ST.verlauf={L:[],ende:false}; stVerlaufPanel(R); }); }
async function stVerlaufAnsehen(el,id){ const P=el.querySelector('.st-vp'); if(!P)return; if(!P.hidden){ P.hidden=true; P.innerHTML=''; return; }
  P.hidden=false; P.innerHTML='<div class="empty">Lade …</div>';
  const {data,error}=await SVB.sb.from('studio_verlauf').select('vorher,nachher,art').eq('id',id).single(); if(error){ P.innerHTML='⚠️ '+stE(error.message); return; }
  const fass=[]; if(data.vorher&&data.vorher.html!=null)fass.push(['Vorher',data.vorher]); if(data.nachher&&data.nachher.html!=null)fass.push([data.art==='neu'?'Angelegt':'Nachher',data.nachher]);
  P.innerHTML=fass.map(([t])=>`<figure class="st-vf"><div class="st-vbild"></div><figcaption>${stE(t)}</figcaption></figure>`).join('');
  const urls=[...new Set(fass.flatMap(([,f])=>stAssets(f.html||'')))]; try{ await stUrlsLaden(urls); }catch(e){}
  const breite=Math.max(110,Math.floor(((P.clientWidth||260)-(fass.length>1?10:0))/Math.max(1,fass.length)));
  P.querySelectorAll('.st-vbild').forEach((b,i)=>{ try{ stSkalaBox(b,{html:fass[i][1].html,master_id:fass[i][1].master_id||null},breite,ST.p); }catch(e){ b.textContent='Vorschau nicht möglich'; } }); }
async function stVerlaufHerstellen(id,welche){ try{ await stSpeichernJetzt(); }catch(e){}
  const {data,error}=await SVB.sb.rpc('studio_verlauf_herstellen',{p_id:id,p_welche:welche||'vorher'}); if(error){ kToast('⚠️ '+error.message); return; }
  await stProjektLaden(ST.p.id);
  if(data&&data.folie_id){ const i=(ST.folien||[]).findIndex(f=>f.id===data.folie_id); if(i>=0)ST.cur=i; }
  stFolienliste(); stCanvas(); try{ stLiveSenden(null,[{t:'folien'}]); }catch(e){}
  const ti=document.getElementById('stTitel'); if(ti&&ST.p)ti.value=ST.p.titel;
  kToast('✓ Ältere Fassung zurückgeholt. Auch das steht jetzt im Verlauf.'); }

/* ---------- Versionen: wer, wann, automatisch ---------- */
stVersionenPanel=async function(R){ R.innerHTML='<h4>Versionen</h4><div class="empty">Lade …</div>';
  let {data,error}=await SVB.sb.from('studio_versionen').select('id,name,am,von,von_name,automatisch').eq('projekt_id',ST.p.id).order('am',{ascending:false});
  if(error)({data}=await SVB.sb.from('studio_versionen').select('id,name,am,von').eq('projekt_id',ST.p.id).order('am',{ascending:false}));
  const L=data||[]; const vor=`v${L.filter(v=>!v.automatisch).length+1}, ${TRC.fmt(trToday())}${trToday().slice(0,4)}`; const kann=stKann();
  R.innerHTML=`<h4>Versionen</h4><p class="note small">Ein Stand speichert alle Folien so, wie sie jetzt sind. Zu Beginn und am Ende jeder Bearbeitung legt das Studio automatisch einen Stand an. Wiederherstellen sichert vorher den aktuellen Stand. Versionen werden nie gelöscht.</p>
    ${kann?`<div class="st-vn"><input class="st-in" id="stVn" value="${stE(vor)}"><button type="button" class="btn sm" id="stVs">Stand speichern</button></div>`:''}
    <div class="st-vl">${L.map(v=>{ const [t,uhr]=stTagZeit(v.am); return `<div class="st-v${v.automatisch?' auto':''}"><b>${stE(v.name)}</b><small>${stE(t)} ${stE(uhr)}${v.von_name?' · '+stE(v.von_name):''}${v.automatisch?' · automatisch':''}</small>${kann?`<button type="button" class="btn sm ghost" data-vw="${v.id}">Wiederherstellen</button>`:''}</div>`; }).join('')||'<p class="note">Noch keine gespeicherten Stände.</p>'}</div>`;
  const vs=R.querySelector('#stVs'); if(vs)vs.onclick=async()=>{ await stVersionAnlegen(R.querySelector('#stVn').value.trim()||vor); stVersionenPanel(R); };
  R.querySelectorAll('[data-vw]').forEach(b=>b.onclick=async()=>{ if(!b.classList.contains('sure')){ b.classList.add('sure'); b.textContent='Ja, wiederherstellen'; return; } b.disabled=true; await stVersionHerstellen(b.dataset.vw); stVersionenPanel(R); }); };

/* =====================================================================
   Sportzentrale Beta 0.72 · Studio: Datei importieren und ins Vereins-CI bringen
   - PowerPoint (pptx), PDF, Word (docx), HTML, Markdown, Text, dazu odp/odt/rtf und Bilder.
   - Eingelesen wird im Browser (JSZip, pdf.js), nichts geht an fremde Dienste.
   - Aus der Datei wird eine neutrale Struktur (Seiten mit Titel, Absätzen, Punkten, Tabellen, Bildern, Notizen).
     Daraus baut das Studio Folien bzw. A4-Seiten im CI: Struktur und Text bleiben, das Aussehen kommt vom Verein.
   - Nichts wird erfunden: was nicht in der Datei steht, kommt nicht auf die Folie. Zu volle Folien werden geteilt.
   ===================================================================== */
const SIMP={MAX:30*1024*1024,pdf:null};
const SIMP_ENDUNGEN=/\.(pptx|pdf|docx|html?|md|markdown|txt|odp|odt|rtf|jpe?g|png|webp|gif)$/i;

/* ---------- Bibliotheken ---------- */
async function simpZip(){ await sxScript('vendor/jszip.min.js',()=>window.JSZip); return window.JSZip; }
async function simpPdfjs(){ if(SIMP.pdf)return SIMP.pdf; const basis=new URL('vendor/',location.href).href;
  const m=await import(basis+'pdfjs.min.js'); m.GlobalWorkerOptions.workerSrc=basis+'pdfjs.worker.min.js'; return SIMP.pdf=m; }
const simpXml=s=>new DOMParser().parseFromString(s,'application/xml');
const simpKids=(el,name)=>el?[...el.children].filter(c=>c.localName===name):[];
const simpAll=(el,name)=>el?[...el.getElementsByTagNameNS('*',name)]:[];
const simpOne=(el,name)=>simpAll(el,name)[0]||null;
const simpTxt=s=>String(s||'').replace(/ /g,' ').replace(/[ \t]+/g,' ').trim();
const simpMime=n=>(/\.png$/i.test(n)?'image/png':/\.gif$/i.test(n)?'image/gif':/\.webp$/i.test(n)?'image/webp':/\.(jpe?g)$/i.test(n)?'image/jpeg':/\.svg$/i.test(n)?'image/svg+xml':/\.emf$|\.wmf$/i.test(n)?'':'image/png');
function simpRels(xml,basis){ const m=new Map(); if(!xml)return m; simpAll(simpXml(xml),'Relationship').forEach(r=>{ let t=r.getAttribute('Target')||''; if(r.getAttribute('TargetMode')==='External')return;
  const teile=(t.startsWith('/')?t.slice(1):basis+t).split('/'), out=[]; teile.forEach(x=>{ if(x==='..')out.pop(); else if(x&&x!=='.')out.push(x); });
  m.set(r.getAttribute('Id'),{ziel:out.join('/'),typ:r.getAttribute('Type')||''}); }); return m; }
async function simpBildAusZip(zip,pfad){ const f=zip.file(pfad); if(!f)return null; const typ=simpMime(pfad); if(!typ)return null;
  const blob=await f.async('blob'); return {t:'bild',blob:new Blob([blob],{type:typ}),name:pfad.split('/').pop()}; }
// Aufzählungszeichen am Zeilenanfang erkennen (für PDF, Text, RTF)
const SIMP_PUNKT=/^\s*(?:[•●▪■◦○‣∙·\-–—*]|\d{1,2}[.)]|[a-z][.)])\s+/;

/* ---------- PowerPoint ---------- */
async function simpPptx(buf){ const JSZip=await simpZip(), zip=await JSZip.loadAsync(buf);
  const pres=simpXml(await zip.file('ppt/presentation.xml').async('string')), rel=simpRels(await (zip.file('ppt/_rels/presentation.xml.rels')||{async:async()=>''}).async('string'),'ppt/');
  const ids=simpAll(pres,'sldId').map(s=>s.getAttributeNS('http://schemas.openxmlformats.org/officeDocument/2006/relationships','id')||s.getAttribute('r:id'));
  const seiten=[];
  for(const rid of ids){ const r=rel.get(rid); if(!r)continue; const x=await zip.file(r.ziel)?.async('string'); if(!x)continue;
    const doc=simpXml(x), srel=simpRels(await (zip.file(r.ziel.replace(/slides\/(slide\d+\.xml)$/,'slides/_rels/$1.rels'))||{async:async()=>''}).async('string'),r.ziel.replace(/[^/]+$/,''));
    if(doc.documentElement.getAttribute('show')==='0')continue;   // ausgeblendete Folie
    const teile=[]; let titel='', unter='';
    const pos=el=>{ const o=simpOne(el,'off'); return o?[+o.getAttribute('y')||0,+o.getAttribute('x')||0]:[0,0]; };
    const lauf=async (baum)=>{ for(const el of [...baum.children]){ const n=el.localName;
      if(n==='grpSp'){ await lauf(el); continue; }
      if(n==='sp'){ const ph=simpOne(el,'ph'), typ=ph?(ph.getAttribute('type')||'body'):'', body=simpOne(el,'txBody'); if(!body)continue;
        const abs=simpKids(body,'p').map(p=>{ const t=simpTxt(simpAll(p,'t').map(t=>t.textContent).join('')); const pr=simpOne(p,'pPr'); const lvl=+(pr&&pr.getAttribute('lvl')||0);
          const keinPunkt=pr&&simpOne(pr,'buNone'); const mitPunkt=pr&&(simpOne(pr,'buChar')||simpOne(pr,'buAutoNum'));
          return {t,lvl,punkt:keinPunkt?false:mitPunkt?true:null}; }).filter(a=>a.t);
        if(!abs.length)continue;
        if(['title','ctrTitle'].includes(typ)){ titel=titel?titel+' '+abs.map(a=>a.t).join(' '):abs.map(a=>a.t).join(' '); continue; }
        if(typ==='subTitle'){ unter=abs.map(a=>a.t).join(' · '); continue; }
        if(['sldNum','dt','ftr'].includes(typ))continue;
        // Platzhalter „body“ sind Aufzählungen, freie Textfelder Absätze (außer es stehen Aufzählungszeichen dran)
        const liste=typ==='body'||typ==='obj'||abs.length>1&&abs.some(a=>a.punkt);
        teile.push({pos:pos(el),bl:abs.map(a=>(a.punkt===true||liste&&a.punkt!==false)?{t:'li',text:a.t,ebene:Math.min(2,a.lvl)}:{t:'p',text:a.t})}); continue; }
      if(n==='graphicFrame'){ const tbl=simpOne(el,'tbl'); if(tbl){ const zeilen=simpKids(tbl,'tr').map(tr=>simpKids(tr,'tc').map(tc=>simpTxt(simpAll(tc,'t').map(t=>t.textContent).join(' '))));
          if(zeilen.length)teile.push({pos:pos(el),bl:[{t:'tab',zeilen}]}); } continue; }
      if(n==='pic'){ const b=simpOne(el,'blip'), id=b&&(b.getAttributeNS('http://schemas.openxmlformats.org/officeDocument/2006/relationships','embed')||b.getAttribute('r:embed'));
        const z=id&&srel.get(id); if(z){ const bild=await simpBildAusZip(zip,z.ziel); if(bild)teile.push({pos:pos(el),bl:[bild]}); } } } };
    const baum=simpOne(doc,'spTree'); if(baum)await lauf(baum);
    teile.sort((a,b)=>a.pos[0]-b.pos[0]||a.pos[1]-b.pos[1]);
    let notiz=''; for(const [,z] of srel){ if(/notesSlide$/.test(z.typ)){ const nx=await zip.file(z.ziel)?.async('string'); if(nx){ const nd=simpXml(nx);
      notiz=simpAll(nd,'sp').filter(sp=>{ const ph=simpOne(sp,'ph'); return ph&&(ph.getAttribute('type')||'body')==='body'; }).map(sp=>simpAll(sp,'p').map(p=>simpTxt(simpAll(p,'t').map(t=>t.textContent).join(''))).filter(Boolean).join('\n')).join('\n'); } } }
    seiten.push({titel,unter,bloecke:teile.flatMap(t=>t.bl),notiz}); }
  return seiten; }

/* ---------- Word ---------- */
async function simpDocx(buf){ const JSZip=await simpZip(), zip=await JSZip.loadAsync(buf);
  const doc=simpXml(await zip.file('word/document.xml').async('string')), rel=simpRels(await (zip.file('word/_rels/document.xml.rels')||{async:async()=>''}).async('string'),'word/');
  let stile=new Map(); try{ const sx=simpXml(await zip.file('word/styles.xml').async('string')); simpAll(sx,'style').forEach(s=>{ const n=simpOne(s,'name'); stile.set(s.getAttribute('w:styleId')||s.getAttributeNS('*','styleId'),n?n.getAttribute('w:val'):''); }); }catch(e){}
  const ebene=p=>{ const st=simpOne(p,'pStyle'); const id=st?st.getAttribute('w:val'):''; const name=(stile.get(id)||id||'').toLowerCase();
    if(/^(title|titel)$/.test(name))return 0; const m=/(heading|überschrift|berschrift)\s*(\d)/.exec(name)||/^(heading|berschrift)(\d)$/i.exec(id||''); return m?+m[2]:null; };
  const bloecke=[]; const body=simpOne(doc,'body');
  for(const el of [...(body?body.children:[])]){
    if(el.localName==='p'){ const t=simpTxt(simpAll(el,'t').map(x=>x.textContent).join('')); const e=ebene(el);
      for(const b of simpAll(el,'blip')){ const id=b.getAttribute('r:embed')||b.getAttributeNS('http://schemas.openxmlformats.org/officeDocument/2006/relationships','embed'); const z=id&&rel.get(id); if(z){ const bild=await simpBildAusZip(zip,z.ziel); if(bild)bloecke.push(bild); } }
      if(!t)continue;
      if(e!==null)bloecke.push({t:'h',text:t,ebene:e});
      else if(simpOne(el,'numPr')||/list|liste|aufz/i.test((()=>{ const st=simpOne(el,'pStyle'); const id=st?st.getAttribute('w:val'):''; return (stile.get(id)||id||''); })())){ const il=simpOne(el,'ilvl'); bloecke.push({t:'li',text:t,ebene:Math.min(2,+(il&&il.getAttribute('w:val')||0))}); }
      else bloecke.push({t:'p',text:t}); }
    else if(el.localName==='tbl'){ const zeilen=simpKids(el,'tr').map(tr=>simpKids(tr,'tc').map(tc=>simpTxt(simpAll(tc,'p').map(p=>simpAll(p,'t').map(x=>x.textContent).join('')).join(' ')))); if(zeilen.length)bloecke.push({t:'tab',zeilen}); } }
  return simpAusFluss(bloecke); }

/* ---------- OpenDocument (odt, odp) ---------- */
async function simpOdf(buf,art){ const JSZip=await simpZip(), zip=await JSZip.loadAsync(buf); const doc=simpXml(await zip.file('content.xml').async('string'));
  const text=el=>simpTxt([...el.childNodes].map(n=>n.nodeType===3?n.textContent:n.localName==='s'?' ':n.localName==='tab'?' ':n.localName==='line-break'?' ':n.nodeType===1?text(n):'').join(''));
  const fluss=async(el,out,lvl)=>{ for(const c of [...el.children]){ const n=c.localName;
    if(n==='h')out.push({t:'h',text:text(c),ebene:+(c.getAttribute('text:outline-level')||1)});
    else if(n==='p'){ const t=text(c); if(t)out.push(lvl!=null?{t:'li',text:t,ebene:Math.min(2,lvl)}:{t:'p',text:t}); for(const im of simpAll(c,'image')){ const h=im.getAttribute('xlink:href'); if(h){ const b=await simpBildAusZip(zip,h); if(b)out.push(b); } } }
    else if(n==='list')for(const it of simpKids(c,'list-item'))await fluss(it,out,lvl==null?0:lvl+1);
    else if(n==='table'){ const zeilen=simpAll(c,'table-row').map(r=>simpKids(r,'table-cell').map(z=>text(z))); if(zeilen.length)out.push({t:'tab',zeilen}); }
    else if(n==='frame'){ const im=simpOne(c,'image'), tb=simpOne(c,'text-box'); if(tb)await fluss(tb,out,lvl); else if(im){ const b=await simpBildAusZip(zip,im.getAttribute('xlink:href')||''); if(b)out.push(b); } }
    else if(['section','text','list-item','body'].includes(n))await fluss(c,out,lvl); } };
  if(art==='odp'){ const seiten=[]; for(const pg of simpAll(doc,'page')){ let titel='', unter=''; const bl=[];
      for(const fr of simpKids(pg,'frame').concat(simpKids(pg,'custom-shape'))){ const k=fr.getAttribute('presentation:class')||''; const tb=simpOne(fr,'text-box')||fr;
        if(k==='title'){ titel=text(tb); continue; } if(k==='subtitle'){ unter=text(tb); continue; } if(['page-number','footer','date-time'].includes(k))continue;
        const out=[]; if(simpOne(fr,'image')&&!simpOne(fr,'text-box')){ const b=await simpBildAusZip(zip,simpOne(fr,'image').getAttribute('xlink:href')||''); if(b)out.push(b); }
        else if(simpOne(fr,'table')){ await fluss(fr,out,null); } else await fluss(tb,out,k==='outline'?-1:null);
        bl.push(...out.map(b=>b.t==='li'?Object.assign(b,{ebene:Math.max(0,b.ebene)}):b)); }
      const nz=simpOne(pg,'notes'); seiten.push({titel,unter,bloecke:bl,notiz:nz?simpAll(nz,'p').map(text).filter(Boolean).join('\n'):''}); }
    return seiten; }
  const out=[]; const t=simpOne(doc,'text'); if(t)await fluss(t,out,null); return simpAusFluss(out); }

/* ---------- PDF ---------- */
async function simpPdf(buf){ const pdfjs=await simpPdfjs(); const pdf=await pdfjs.getDocument({data:new Uint8Array(buf),isEvalSupported:false}).promise; const seiten=[];
  let quer=0;
  for(let i=1;i<=pdf.numPages;i++){ const pg=await pdf.getPage(i); const vp=pg.getViewport({scale:1}); if(vp.width>vp.height)quer++;
    const tc=await pg.getTextContent(); const zeilen=[];
    tc.items.filter(it=>it.str!=null).forEach(it=>{ const y=Math.round(it.transform[5]), h=Math.abs(it.transform[3])||it.height||10; let z=zeilen.find(z=>Math.abs(z.y-y)<=Math.max(2,h*.35));
      if(!z){ z={y,h,teile:[]}; zeilen.push(z); } z.h=Math.max(z.h,h); z.teile.push({x:it.transform[4],s:it.str}); });
    zeilen.sort((a,b)=>b.y-a.y); zeilen.forEach(z=>{ z.teile.sort((a,b)=>a.x-b.x); z.t=simpTxt(z.teile.map(t=>t.s).join(' ')); });
    const L=zeilen.filter(z=>z.t&&!/^\d{1,3}$/.test(z.t));   // Seitenzahlen weg
    if(!L.length){ seiten.push({titel:'',bloecke:[],notiz:''}); continue; }
    // übliche Schriftgröße: nach Textmenge gewichtet (eine große Überschrift zählt weniger als viel Fließtext)
    const nachH=[...L].sort((a,b)=>a.h-b.h), summe=L.reduce((x,z)=>x+z.t.length,0); let acc=0, normal=nachH[0].h; for(const z of nachH){ acc+=z.t.length; if(acc>=summe/2){ normal=z.h; break; } }
    let titel=''; while(L.length&&L[0].h>normal*1.25&&titel.length<140){ titel=(titel?titel+' ':'')+L.shift().t; }
    const bl=[]; let absatz=null, vorY=null;
    L.forEach(z=>{ const luecke=vorY!=null&&(vorY-z.y)>z.h*1.7; vorY=z.y;
      if(z.h>normal*1.25){ bl.push({t:'h',text:z.t,ebene:2}); absatz=null; return; }
      if(SIMP_PUNKT.test(z.t)){ bl.push({t:'li',text:z.t.replace(SIMP_PUNKT,''),ebene:z.teile[0].x>80?1:0}); absatz=null; return; }
      const letztes=bl[bl.length-1];
      if(letztes&&letztes.t==='li'&&!luecke){ letztes.text+=' '+z.t; return; }   // umbrochener Punkt
      if(absatz&&!luecke){ absatz.text+=' '+z.t; return; }
      absatz={t:'p',text:z.t}; bl.push(absatz); });
    seiten.push({titel,bloecke:bl,notiz:''}); }
  seiten.quer=quer>pdf.numPages/2; return seiten; }

/* ---------- HTML, Markdown, Text, RTF ---------- */
function simpHtml(text){ const d=new DOMParser().parseFromString(text,'text/html'); d.querySelectorAll('script,style,noscript,template,iframe,nav,footer').forEach(x=>x.remove());
  const out=[]; const fluss=(el,lvl)=>{ for(const c of [...el.children]){ const n=c.tagName;
    if(/^H[1-6]$/.test(n)){ const t=simpTxt(c.textContent); if(t)out.push({t:'h',text:t,ebene:+n[1]}); }
    else if(n==='P'||n==='BLOCKQUOTE'||n==='FIGCAPTION'){ const t=simpTxt(c.textContent); if(t)out.push({t:'p',text:t}); c.querySelectorAll('img').forEach(im=>bildVonImg(im)); }
    else if(n==='UL'||n==='OL'){ for(const li of simpKids(c,'li')){ const kopie=li.cloneNode(true); kopie.querySelectorAll('ul,ol').forEach(x=>x.remove()); const t=simpTxt(kopie.textContent); if(t)out.push({t:'li',text:t,ebene:Math.min(2,lvl)}); [...li.children].filter(x=>/^(UL|OL)$/.test(x.tagName)).forEach(x=>fluss({children:[x]},lvl+1)); } }
    else if(n==='TABLE'){ const zeilen=[...c.querySelectorAll('tr')].map(tr=>[...tr.children].map(td=>simpTxt(td.textContent))); if(zeilen.length)out.push({t:'tab',zeilen}); }
    else if(n==='IMG')bildVonImg(c);
    else if(n==='HR')out.push({t:'trenner'});
    else fluss(c,lvl); } };
  const bildVonImg=im=>{ const s=im.getAttribute('src')||''; const m=/^data:(image\/[a-z+.-]+);base64,(.+)$/i.exec(s); if(!m)return; try{ const bin=atob(m[2]); const u=new Uint8Array(bin.length); for(let i=0;i<bin.length;i++)u[i]=bin.charCodeAt(i); out.push({t:'bild',blob:new Blob([u],{type:m[1]}),name:'bild.'+(m[1].split('/')[1]||'png').replace('jpeg','jpg')}); }catch(e){} };
  fluss(d.body,0); return simpAusFluss(out,simpTxt(d.title)); }
function simpMd(text){ const out=[]; let tab=null, absatz=null;
  const zeile=s=>s.replace(/\*\*|__|`/g,'').replace(/\[([^\]]+)\]\([^)]*\)/g,'$1').replace(/^\*(.+)\*$/,'$1');
  String(text).replace(/\r/g,'').split('\n').forEach(z=>{ const leer=!z.trim();
    if(/^\s*\|.*\|\s*$/.test(z)){ absatz=null; const zellen=z.trim().replace(/^\||\|$/g,'').split('|').map(c=>simpTxt(zeile(c)));
      if(zellen.every(c=>/^:?-+:?$/.test(c)))return; if(!tab){ tab={t:'tab',zeilen:[]}; out.push(tab); } tab.zeilen.push(zellen); return; }
    tab=null; if(leer){ absatz=null; return; }
    let m=/^(#{1,6})\s+(.*)$/.exec(z); if(m){ out.push({t:'h',text:simpTxt(zeile(m[2])),ebene:m[1].length}); absatz=null; return; }
    if(/^\s*(-{3,}|\*{3,})\s*$/.test(z)){ out.push({t:'trenner'}); absatz=null; return; }
    m=/^(\s*)(?:[-*+]|\d+[.)])\s+(.*)$/.exec(z); if(m){ out.push({t:'li',text:simpTxt(zeile(m[2])),ebene:Math.min(2,Math.floor(m[1].replace(/\t/g,'  ').length/2))}); absatz=null; return; }
    m=/^!\[[^\]]*\]\(([^)]+)\)/.exec(z); if(m)return;   // Bilder aus Markdown sind Verweise, die wir nicht laden
    if(absatz)absatz.text+=' '+simpTxt(zeile(z)); else { absatz={t:'p',text:simpTxt(zeile(z.replace(/^>\s?/,'')))}; out.push(absatz); } });
  return simpAusFluss(out); }
function simpTxtDatei(text){ const out=[]; const bloecke=String(text).replace(/\r/g,'').split(/\n\s*\n/);
  bloecke.forEach(b=>{ const zeilen=b.split('\n').map(s=>s.trimEnd()).filter(s=>s.trim()); if(!zeilen.length)return;
    if(zeilen.length===1&&zeilen[0].length<=70&&!/[.!?:,;]$/.test(zeilen[0])&&!SIMP_PUNKT.test(zeilen[0])){ out.push({t:'h',text:simpTxt(zeilen[0]),ebene:out.length?2:1}); return; }
    let absatz=null; zeilen.forEach(z=>{ if(SIMP_PUNKT.test(z)){ out.push({t:'li',text:simpTxt(z.replace(SIMP_PUNKT,'')),ebene:/^\s{2,}/.test(z)?1:0}); absatz=null; }
      else if(absatz)absatz.text+=' '+simpTxt(z); else { absatz={t:'p',text:simpTxt(z)}; out.push(absatz); } }); });
  return simpAusFluss(out); }
function simpRtf(text){ let s=String(text);
  s=s.replace(/\\'([0-9a-f]{2})/gi,(m,h)=>new TextDecoder('windows-1252').decode(new Uint8Array([parseInt(h,16)])));
  s=s.replace(/\\u(-?\d+)\??/g,(m,n)=>String.fromCharCode(n<0?65536+ +n:+n));
  s=s.replace(/\{\\\*[^{}]*(\{[^{}]*\}[^{}]*)*\}/g,'').replace(/\{\\(fonttbl|colortbl|stylesheet|info|pict)[\s\S]*?\}\s*\}/g,'');
  s=s.replace(/\\(par|line)\b ?/g,'\n').replace(/\\tab\b ?/g,' ').replace(/\\[a-z]+-?\d* ?/gi,'').replace(/[{}]/g,'').replace(/\\\\/g,'\\');
  return simpTxtDatei(s.split('\n').map(z=>z.trim()).join('\n').replace(/\n{3,}/g,'\n\n')); }

// Fließtext (Word, HTML, Markdown, Text) in Seiten teilen: neue Seite bei Überschrift der obersten genutzten Ebene
function simpAusFluss(bl,dokTitel){ const hs=bl.filter(b=>b.t==='h'); const ebenen=[...new Set(hs.map(h=>h.ebene))].sort((a,b)=>a-b);
  let doc=dokTitel||''; if(hs.length&&hs[0].ebene===0||(ebenen.length>1&&hs.filter(h=>h.ebene===ebenen[0]).length===1&&bl.indexOf(hs[0])<=1)){ doc=hs[0].text; }
  const schnitt=ebenen.find(e=>hs.filter(h=>h.ebene===e&&h.text!==doc).length>=1);
  const seiten=[]; let cur={titel:'',bloecke:[],notiz:''};
  bl.forEach(b=>{ if(b.t==='h'&&b.text===doc&&!seiten.length&&!cur.bloecke.length){ cur.titel=doc; cur.titelseite=true; return; }
    if(b.t==='trenner'||(b.t==='h'&&b.ebene===schnitt)){ if(cur.titel||cur.bloecke.length)seiten.push(cur); cur={titel:b.t==='h'?b.text:'',bloecke:[],notiz:''}; return; }
    cur.bloecke.push(b); });
  if(cur.titel||cur.bloecke.length)seiten.push(cur);
  seiten.dokTitel=doc; seiten.fluss=true; return seiten; }

async function simpLesen(file){ const n=file.name||'', buf=()=>file.arrayBuffer(), text=()=>file.text();
  if(file.size>SIMP.MAX)throw new Error('Die Datei ist größer als 30 MB. Bitte kleiner speichern oder teilen.');
  if(/\.pptx$/i.test(n))return simpPptx(await buf());
  if(/\.docx$/i.test(n))return simpDocx(await buf());
  if(/\.odp$/i.test(n))return simpOdf(await buf(),'odp');
  if(/\.odt$/i.test(n))return simpOdf(await buf(),'odt');
  if(/\.pdf$/i.test(n))return simpPdf(await buf());
  if(/\.html?$/i.test(n))return simpHtml(await text());
  if(/\.(md|markdown)$/i.test(n))return simpMd(await text());
  if(/\.rtf$/i.test(n))return simpRtf(await text());
  if(/\.txt$/i.test(n))return simpTxtDatei(await text());
  if(/^image\//.test(file.type)||/\.(jpe?g|png|webp|gif)$/i.test(n)){ const s=[{titel:'',bloecke:[{t:'bild',blob:file,name:n}],notiz:''}]; return s; }
  if(/\.(ppt|doc|key|pages)$/i.test(n))throw new Error('Dieses ältere Format kann das Studio nicht lesen. Bitte als '+(/ppt|key/i.test(n)?'.pptx':'.docx')+' oder PDF speichern.');
  throw new Error('Dieses Format kennt das Studio noch nicht.'); }

/* ---------- Gestaltung im CI ---------- */
const SIMP_F={navy:'#1d2760',navy2:'#141b47',or:'#e8741f',hb:'#8fc9ec',creme:'#f7f4ee',sand:'#e9e5dc',ink:'#1c1c22',grau:'#5b5b66'};
const simpE=s=>stE(s);
function simpKopf(kicker,titel,dunkel,gross){ return `<div style="position:relative;max-width:1500px">${kicker?`<div style="${STV.kick};color:${dunkel?SIMP_F.hb:SIMP_F.grau}">${simpE(kicker)}</div>`:''}${titel?`<h2 style="${STV.h};font-size:${gross||(titel.length>48?72:titel.length>28?84:96)}px;color:${dunkel?'#ffffff':SIMP_F.navy}">${simpE(titel)}</h2>`:''}</div>`; }
function simpFuss(dok,nr,dunkel){ return `<div style="${STV.fuss};color:${dunkel?'rgba(255,255,255,.6)':SIMP_F.grau}"><span>SV/BSC Mörlenbach${dok?' · '+simpE(dok):''}</span><span>${nr!=null&&nr!==''?simpE(/^\d+$/.test(String(nr))?String(nr).padStart(2,'0'):String(nr)):''}</span></div>`; }
function simpBlockHtml(b,gr,dunkel){ const fs=gr||30, c=dunkel?'#ffffff':SIMP_F.ink;
  if(b.t==='p')return `<p style="margin:0;font-family:'Barlow',sans-serif;font-size:${fs}px;line-height:1.42;color:${c}">${simpE(b.text)}</p>`;
  if(b.t==='h')return `<h3 style="margin:${fs*0.4}px 0 0;font-family:'Barlow Condensed',sans-serif;font-weight:800;font-size:${Math.round(fs*1.35)}px;line-height:1;text-transform:uppercase;color:${dunkel?SIMP_F.hb:SIMP_F.navy}">${simpE(b.text)}</h3>`;
  if(b.t==='li'){ const e=b.ebene||0; return e?`<div style="display:flex;gap:18px;align-items:baseline;margin-left:${e*46}px"><span style="width:18px;height:3px;background:${dunkel?SIMP_F.hb:SIMP_F.grau};flex:0 0 auto;transform:translateY(-${Math.round(fs*0.28)}px)"></span><p style="margin:0;font-family:'Barlow',sans-serif;font-size:${Math.round(fs*0.88)}px;line-height:1.38;color:${dunkel?'#dfe6f2':SIMP_F.grau}">${simpE(b.text)}</p></div>`
    :`<div style="display:flex;gap:22px;align-items:baseline"><span style="width:14px;height:14px;background:${SIMP_F.or};flex:0 0 auto;transform:translateY(-${Math.round(fs*0.14)}px)"></span><p style="margin:0;font-family:'Barlow',sans-serif;font-size:${fs}px;line-height:1.4;color:${c}">${simpE(b.text)}</p></div>`; }
  if(b.t==='tab'){ const kopf=b.zeilen.length>1, Z=b.zeilen, sp=Math.max(...Z.map(z=>z.length)); const zf=Math.max(18,Math.min(fs-2,sp>4?24:sp>3?28:32));
    return `<table style="width:100%;border-collapse:collapse;font-family:'Barlow',sans-serif;font-size:${zf}px;line-height:1.3;color:${c}">${Z.map((z,i)=>`<tr>${Array.from({length:sp},(_,j)=>{ const v=z[j]||''; return i===0&&kopf?`<th style="text-align:left;padding:14px 18px;background:${SIMP_F.navy};color:#ffffff;font-family:'Barlow Condensed',sans-serif;font-weight:800;font-size:${zf+2}px;letter-spacing:0.04em;text-transform:uppercase">${simpE(v)}</th>`:`<td style="padding:13px 18px;border-bottom:2px solid ${dunkel?'rgba(255,255,255,.2)':'#d8d2c4'};${i%2===0&&kopf?'':'background:'+(dunkel?'rgba(255,255,255,.04)':'#ffffff')}">${simpE(v)}</td>`; }).join('')}</tr>`).join('')}</table>`; }
  if(b.t==='bild')return `<div style="height:520px;max-width:100%"><img src="${simpE(b.pfad||'')}" alt="" style="display:block;width:100%;height:100%;object-fit:contain;object-position:left center"></div>`;
  return ''; }
// Folienarten
function simpFolie(art,k){ const dok=k.dok, nr=k.nr;
  if(art==='titel')return stSecHtml(SIMP_F.navy,`<div style="display:flex;align-items:center;gap:26px"><img src="assets/logo-svbsc.png" alt="SV/BSC Mörlenbach" style="height:120px;width:auto;display:block"></div>
    <div style="margin-top:auto;margin-bottom:56px">${k.kicker?`<div style="${STV.kick};color:${SIMP_F.hb}">${simpE(k.kicker)}</div>`:''}<h1 style="${STV.h};font-size:${k.titel.length>40?110:k.titel.length>24?130:150}px;color:#ffffff">${simpE(k.titel)}</h1>${k.unter?`<div style="${STV.hand};font-size:52px;color:${SIMP_F.or};margin-top:18px">${simpE(k.unter)}</div>`:''}
    ${(k.bl||[]).length?`<div style="margin-top:30px;display:flex;flex-direction:column;gap:12px;max-width:1300px">${k.bl.map(b=>simpBlockHtml(b,30,true)).join('')}</div>`:''}</div>${simpFuss('',k.datum||'',true)}`,'#ffffff');
  if(art==='kapitel')return stSecHtml(SIMP_F.creme,`<div style="position:absolute;left:0;top:0;width:640px;height:100%;background:${SIMP_F.navy};overflow:hidden">${k.kap?`<div style="position:absolute;left:70px;bottom:50px;font-family:'Barlow Condensed',sans-serif;font-weight:900;font-size:240px;line-height:0.8;color:#ffffff;letter-spacing:-0.05em">${simpE(String(k.kap).padStart(2,'0'))}</div>`:''}</div>
    <div style="margin-left:620px;margin-top:auto;margin-bottom:auto">${k.kicker?`<div style="${STV.kick};color:${SIMP_F.grau}">${simpE(k.kicker)}</div>`:''}<h2 style="${STV.h};font-size:${k.titel.length>30?96:120}px;color:${SIMP_F.navy}">${simpE(k.titel)}</h2>${k.unter?`<div style="${STV.hand};color:${SIMP_F.or};margin-top:16px">${simpE(k.unter)}</div>`:''}</div>${simpFuss(dok,nr).replace(STV.fuss,STV.fuss+';left:700px')}`);
  if(art==='abschluss')return stSecHtml(SIMP_F.navy,`<div style="margin-top:auto;margin-bottom:auto;text-align:center;display:flex;flex-direction:column;align-items:center"><img src="assets/logo-svbsc.png" alt="SV/BSC Mörlenbach" style="height:150px;width:auto;display:block;margin-bottom:40px"><h2 style="${STV.h};font-size:${k.titel.length>24?110:150}px;color:#ffffff">${simpE(k.titel)}</h2>${k.unter?`<div style="${STV.hand};font-size:52px;color:${SIMP_F.or};margin-top:20px">${simpE(k.unter)}</div>`:''}</div>${simpFuss(dok,nr,true)}`,'#ffffff');
  if(art==='agenda')return stSecHtml(SIMP_F.creme,`<div style="position:absolute;left:0;top:0;width:22px;height:100%;background:${SIMP_F.navy}"></div>${simpKopf(k.kicker,k.titel)}
    <div style="margin-top:50px;display:grid;grid-template-columns:repeat(${k.bl.length>5?2:1},minmax(0,1fr));gap:${k.bl.length>5?'20px 70px':'18px'};max-width:1600px">${k.bl.map((b,i)=>`<div style="display:flex;gap:26px;align-items:baseline;border-top:2px solid #d8d2c4;padding-top:${k.gr<26?12:16}px"><span style="font-family:'Barlow Condensed',sans-serif;font-weight:900;font-size:${Math.round(k.gr*1.8)}px;line-height:0.9;color:${SIMP_F.or};min-width:${Math.round(k.gr*2.2)}px">${String(i+1).padStart(2,'0')}</span><p style="margin:0;font-family:'Barlow',sans-serif;font-size:${k.gr}px;line-height:1.35">${simpE(b.text)}</p></div>`).join('')}</div>${simpFuss(dok,nr)}`);
  if(art==='bildtext'){ const b=k.bild; return stSecHtml(SIMP_F.creme,`<div style="position:absolute;right:0;top:0;width:46%;height:100%;overflow:hidden;background:${SIMP_F.navy}"><img src="${simpE(b.pfad)}" alt="" style="width:100%;height:100%;object-fit:cover;display:block"></div>
    <div style="max-width:860px;display:flex;flex-direction:column">${simpKopf(k.kicker,k.titel,false,k.titel&&k.titel.length>24?72:88)}<div style="margin-top:44px;display:flex;flex-direction:column;gap:${Math.round(k.gr*0.6)}px">${k.bl.map(x=>simpBlockHtml(x,k.gr)).join('')}</div></div>${simpFuss(dok,nr)}`); }
  if(art==='foto'){ const b=k.bild; return `<section style="position:relative;background:${SIMP_F.navy};color:#ffffff;font-family:'Barlow',sans-serif;padding:80px 110px 70px;box-sizing:border-box;display:flex;flex-direction:column;overflow:hidden"><img src="${simpE(b.pfad)}" alt="" style="position:absolute;inset:0;width:100%;height:100%;object-fit:cover;display:block">${k.titel||k.bl.length?`<div style="position:absolute;inset:0;background:linear-gradient(90deg,rgba(29,39,96,.94) 0%,rgba(29,39,96,.7) 45%,rgba(29,39,96,.1) 100%)"></div>
    <div style="position:relative;margin-top:auto;max-width:1100px">${k.kicker?`<div style="${STV.kick};color:${SIMP_F.hb}">${simpE(k.kicker)}</div>`:''}${k.titel?`<h2 style="${STV.h};font-size:${k.titel.length>30?96:120}px;color:#ffffff">${simpE(k.titel)}</h2>`:''}${k.bl.map(x=>`<div style="margin-top:18px">${simpBlockHtml(x,30,true)}</div>`).join('')}</div>`:''}</section>`; }
  if(art==='logos')return stSecHtml(SIMP_F.creme,`${simpKopf(k.kicker,k.titel)}<div style="margin-top:56px;display:grid;grid-template-columns:repeat(${Math.min(4,k.bilder.length)},minmax(0,1fr));gap:28px">${k.bilder.map(b=>`<div style="background:#ffffff;border-top:6px solid ${SIMP_F.navy};height:${k.bilder.length>4?200:260}px;display:flex;align-items:center;justify-content:center;padding:28px;box-sizing:border-box"><img src="${simpE(b.pfad)}" alt="" style="max-width:100%;max-height:100%;object-fit:contain;display:block"></div>`).join('')}</div>${k.bl.length?`<div style="margin-top:40px;display:flex;flex-direction:column;gap:16px;max-width:1400px">${k.bl.map(x=>simpBlockHtml(x,k.gr)).join('')}</div>`:''}${simpFuss(dok,nr)}`);
  if(art==='zahlen')return stSecHtml(SIMP_F.navy,`${simpKopf(k.kicker,k.titel,true)}<div style="margin-top:70px;display:grid;grid-template-columns:repeat(${k.zahlen.length},minmax(0,1fr));gap:28px">${k.zahlen.map((z,i,a)=>`<div style="border-top:3px solid ${i===a.length-1?SIMP_F.or:'rgba(255,255,255,.5)'};padding-top:30px"><div style="font-family:'Barlow Condensed',sans-serif;font-weight:900;font-size:${z.wert.length>5?110:150}px;line-height:0.85;letter-spacing:-0.03em;color:#ffffff">${simpE(z.wert)}</div><p style="margin:22px 0 0;font-size:30px;line-height:1.35;color:#e6ecf5">${simpE(z.text)}</p></div>`).join('')}</div>${simpFuss(dok,nr,true)}`,'#ffffff');
  // Inhalt (Text, Punkte, Tabelle, Bild), auf Wunsch in zwei Spalten
  const spalten=k.spalten===2;
  return stSecHtml(SIMP_F.creme,`<div style="position:absolute;left:0;top:0;width:22px;height:100%;background:${SIMP_F.navy}"></div>${simpKopf(k.kicker,k.titel)}
    <div style="margin-top:${k.titel?50:20}px;max-width:1600px;${spalten?'display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:'+Math.round(k.gr*0.6)+'px 80px;align-content:start':'display:flex;flex-direction:column;gap:'+Math.round(k.gr*0.6)+'px'}">${k.bl.map(x=>simpBlockHtml(x,k.gr)).join('')}</div>${simpFuss(dok,nr)}`); }

// Messen: passt der Inhalt auf die Folie? (unsichtbar gerendert in voller Größe)
function simpMessHost(){ let h=document.getElementById('simpMess'); if(h)return h; h=document.createElement('div'); h.id='simpMess'; h.style.cssText='position:fixed;left:-30000px;top:0;width:1920px;height:1080px;overflow:hidden;visibility:hidden;pointer-events:none';
  const sr=h.attachShadow({mode:'open'}); sr.innerHTML=`<link rel="stylesheet" href="${ST_FONTS}"><div class="st-root" style="width:1920px;height:1080px"></div>`; document.body.appendChild(h); return h; }
function simpPasst(html,W,H){ const h=simpMessHost(); h.style.width=W+'px'; h.style.height=H+'px'; const root=h.shadowRoot.querySelector('.st-root'); root.style.width=W+'px'; root.style.height=H+'px'; root.innerHTML=html;
  const sec=root.firstElementChild; if(!sec)return true; sec.style.width=W+'px'; sec.style.height=H+'px'; const unten=sec.getBoundingClientRect().top+H-(W>H?96:70);
  let max=0; sec.querySelectorAll('p,li,h1,h2,h3,table,img,div').forEach(e=>{ if(e.closest('[style*="position:absolute"]')&&!e.closest('[style*="position:relative"]'))return; const r=e.getBoundingClientRect(); if(r.height&&r.bottom>max)max=r.bottom; });
  const rechts=[...sec.querySelectorAll('table')].some(t=>t.scrollWidth>t.parentElement.clientWidth+2);
  return max<=unten+1&&!rechts; }

// Neutrale Seiten in Folien (16:9) übersetzen
function simpZahl(b){ if(b.t!=='p'&&b.t!=='li')return null; const m=/^(rund |ca\. |über |mehr als |knapp )?([\d.,]+\s?(%|€|Euro|Mio\.?|Tsd\.?)?)\s+(.{3,90})$/i.exec(b.text); return m&&b.text.length<=110?{wert:(m[1]?m[1].trim()+' ':'')+m[2].trim(),text:m[4]}:null; }
function simpFolienBauen(seiten,dok){ const out=[]; let kap=0; const nrVon=()=>out.length+1;
  const kapitelZahl=seiten.filter((s,i)=>i>0&&i<seiten.length-1&&s.titel&&!s.bloecke.filter(b=>b.t!=='trenner').length).length;
  const legen=(art,k,notiz,label)=>out.push({html:simpFolie(art,Object.assign({dok,nr:nrVon()},k)),notiz:notiz||'',label:label||k.titel||''});
  // Inhaltsfolien: Schriftgröße anpassen, wenn nötig teilen. Nichts weglassen.
  const inhalt=(s,bl,notiz,teil)=>{ const titel=s.titel||'', kicker=s.unter||(teil?dok:dok);
    const versuch=(gr,sp)=>simpFolie('inhalt',{dok,nr:nrVon(),titel,kicker,bl,gr,spalten:sp});
    const kurz=bl.length>=6&&bl.every(b=>b.t==='li'&&b.text.length<70);
    for(const [gr,sp] of [[40,1],[36,1],[36,kurz?2:1],[32,1],[32,kurz?2:1],[28,1],[28,kurz?2:1],[24,kurz?2:1],[24,1]])if(simpPasst(versuch(gr,sp),1920,1080)){ out.push({html:versuch(gr,sp),notiz,label:titel}); return; }
    if(bl.length>1){ const h=Math.ceil(bl.length/2); inhalt(s,bl.slice(0,h),notiz,1); inhalt(Object.assign({},s,{titel:titel?titel+' (Fortsetzung)':''}),bl.slice(h),'',1); return; }
    const b=bl[0]; if(b&&(b.t==='p'||b.t==='li')&&b.text.length>200){ const saetze=b.text.match(/[^.!?]+[.!?]+["“”»«]?\s*|[^.!?]+$/g)||[b.text]; const h=Math.ceil(saetze.length/2);
      if(saetze.length>1){ inhalt(s,[Object.assign({},b,{text:saetze.slice(0,h).join('').trim()})],notiz,1); inhalt(Object.assign({},s,{titel:titel?titel+' (Fortsetzung)':''}),[Object.assign({},b,{text:saetze.slice(h).join('').trim()})],'',1); return; } }
    if(b&&b.t==='tab'&&b.zeilen.length>3){ const kopf=b.zeilen[0], rest=b.zeilen.slice(1), h=Math.ceil(rest.length/2); inhalt(s,[{t:'tab',zeilen:[kopf,...rest.slice(0,h)]}],notiz,1); inhalt(Object.assign({},s,{titel:titel?titel+' (Fortsetzung)':''}),[{t:'tab',zeilen:[kopf,...rest.slice(h)]}],'',1); return; }
    out.push({html:versuch(22,1),notiz,label:titel}); };
  seiten.forEach((s,i)=>{ const bl=s.bloecke.filter(b=>b.t!=='trenner'), bilder=bl.filter(b=>b.t==='bild'), text=bl.filter(b=>b.t!=='bild'); const titel=s.titel||'';
    // Titelfolie: erste Seite mit Titel und höchstens kurzem Untertitel
    if(i===0&&titel&&!bilder.length&&text.every(b=>b.t==='p'&&b.text.length<160)&&text.length<=2){ legen('titel',{titel,kicker:'SV/BSC Mörlenbach · Fußball',unter:s.unter||(text[0]&&text[0].text)||'',bl:text.slice(1)},s.notiz,titel); return; }
    if(!bl.length&&titel&&i===seiten.length-1&&i>0){ legen('abschluss',{titel,unter:s.unter||''},s.notiz); return; }
    if(!bl.length&&titel){ kap++; legen('kapitel',{titel,kicker:dok,unter:s.unter||'',kap:kapitelZahl>=2?kap:0},s.notiz); return; }
    if(!bl.length&&!titel)return;
    // Tagesordnung
    if(/tagesordnung|agenda|ablauf|themen|inhalt/i.test(titel)&&text.length&&text.length<=12&&text.every(b=>b.t==='li'||b.t==='p')&&!bilder.length){
      const L=text.filter(b=>(b.ebene||0)===0); if(L.length===text.length){ for(const gr of [38,34,30,27,24]){ const h=simpFolie('agenda',{dok,nr:nrVon(),titel,kicker:s.unter||dok,bl:L,gr}); if(simpPasst(h,1920,1080)||gr===24){ out.push({html:h,notiz:s.notiz,label:titel}); return; } } } }
    // Kennzahlen: 2 bis 4 kurze Zeilen, die mit einer Zahl beginnen
    const zahlen=text.map(simpZahl); if(text.length>=2&&text.length<=4&&!bilder.length&&zahlen.every(Boolean)){ legen('zahlen',{titel,kicker:s.unter||dok,zahlen},s.notiz); return; }
    // Bilder
    if(bilder.length>=2&&text.length<=2){ legen('logos',{titel,kicker:s.unter||dok,bilder,bl:text,gr:28},s.notiz); return; }
    if(bilder.length===1&&!text.length){ legen('foto',{titel,kicker:s.unter||dok,bild:bilder[0],bl:[]},s.notiz); return; }
    if(bilder.length===1&&text.length){ for(const gr of [38,34,30,27,24]){ const h=simpFolie('bildtext',{dok,nr:nrVon(),titel,kicker:s.unter||dok,bild:bilder[0],bl:text,gr}); if(simpPasst(h,1920,1080)){ out.push({html:h,notiz:s.notiz,label:titel}); return; } }
      legen('foto',{titel,kicker:s.unter||dok,bild:bilder[0],bl:[]},s.notiz); inhalt(Object.assign({},s,{titel:titel?titel+' (Fortsetzung)':''}),text,''); return; }
    if(bilder.length>2){ legen('logos',{titel,kicker:s.unter||dok,bilder,bl:[],gr:28},s.notiz); if(text.length)inhalt(s,text,''); return; }
    inhalt(s,text,s.notiz); });
  return out; }

// A4-Seiten (Word, Text, hochformatige PDFs): fortlaufend setzen, neue Seite, wenn voll
function simpSeitenBauen(seiten,dok){ const W=794,H=1123, pad='20mm 20mm 18mm 25mm';
  const rahmen=(inner,nr)=>`<section class="page" style="position:relative;display:flex;flex-direction:column;background:#ffffff;color:${SIMP_F.ink};font-family:'Barlow',sans-serif;box-sizing:border-box;overflow:hidden;padding:${pad}">
    <div style="display:flex;justify-content:space-between;align-items:flex-start"><img src="assets/logo-svbsc.png" alt="SV/BSC Mörlenbach" style="height:22mm;width:auto;display:block"><div style="text-align:right"><div style="font-family:'Barlow Condensed',sans-serif;font-weight:800;font-size:19pt;line-height:1;text-transform:uppercase;color:${SIMP_F.navy}">SV/BSC Mörlenbach</div><div style="margin-top:1.8mm;font-size:8.5pt;letter-spacing:0.16em;text-transform:uppercase;color:${SIMP_F.grau}">Abteilung Fußball · seit 1896</div></div></div>
    <div style="height:0.5mm;background:${SIMP_F.navy};margin-top:6mm;position:relative"><div style="position:absolute;left:0;top:0;width:22mm;height:0.5mm;background:${SIMP_F.or}"></div></div>
    <div style="display:flex;flex-direction:column;gap:3mm;margin-top:8mm">${inner}</div>
    <div style="position:absolute;left:25mm;right:20mm;bottom:9mm;display:flex;justify-content:space-between;font-family:'Barlow Condensed',sans-serif;font-weight:700;font-size:8.5pt;letter-spacing:0.12em;text-transform:uppercase;color:${SIMP_F.grau}"><span>${simpE(dok||'')}</span><span>${nr}</span></div></section>`;
  const blk=b=>{ if(b.t==='titel')return `<h1 style="margin:2mm 0 2mm;font-family:'Barlow Condensed',sans-serif;font-weight:900;font-size:26pt;line-height:1;text-transform:uppercase;color:${SIMP_F.navy}">${simpE(b.text)}</h1>`;
    if(b.t==='h')return `<h2 style="margin:4mm 0 0;font-family:'Barlow Condensed',sans-serif;font-weight:800;font-size:${b.ebene<=1?17:14}pt;line-height:1.05;text-transform:uppercase;color:${SIMP_F.navy}">${simpE(b.text)}</h2>`;
    if(b.t==='p')return `<p style="margin:0;font-size:11pt;line-height:1.5">${simpE(b.text)}</p>`;
    if(b.t==='li')return `<div style="display:flex;gap:3mm;align-items:baseline;margin-left:${(b.ebene||0)*7}mm"><span style="width:2mm;height:2mm;background:${(b.ebene||0)?SIMP_F.grau:SIMP_F.or};flex:0 0 auto;transform:translateY(-0.4mm)"></span><p style="margin:0;font-size:11pt;line-height:1.45">${simpE(b.text)}</p></div>`;
    if(b.t==='tab'){ const Z=b.zeilen, sp=Math.max(...Z.map(z=>z.length)); return `<table style="width:100%;border-collapse:collapse;font-size:9.5pt;line-height:1.3">${Z.map((z,i)=>`<tr>${Array.from({length:sp},(_,j)=>i===0&&Z.length>1?`<th style="text-align:left;padding:2mm 2.5mm;background:${SIMP_F.navy};color:#fff;font-family:'Barlow Condensed',sans-serif;font-weight:800;font-size:10pt;text-transform:uppercase">${simpE(z[j]||'')}</th>`:`<td style="padding:1.8mm 2.5mm;border-bottom:0.3mm solid #d8d2c4">${simpE(z[j]||'')}</td>`).join('')}</tr>`).join('')}</table>`; }
    if(b.t==='bild')return `<div style="height:85mm;margin:2mm 0"><img src="${simpE(b.pfad)}" alt="" style="display:block;width:100%;height:100%;object-fit:contain;object-position:left center"></div>`;
    return ''; };
  const alle=[]; seiten.forEach((s,i)=>{ if(s.titel)alle.push(i===0||s.titelseite?{t:'titel',text:s.titel}:{t:'h',text:s.titel,ebene:1}); s.bloecke.filter(b=>b.t!=='trenner').forEach(b=>alle.push(b)); });
  if(!alle.length)return [];
  const out=[]; let cur=[];
  const fertig=()=>{ if(cur.length)out.push({html:rahmen(cur.map(blk).join(''),out.length+1),notiz:'',label:'Seite '+(out.length+1)}); cur=[]; };
  for(let i=0;i<alle.length;i++){ const b=alle[i]; cur.push(b);
    if(!simpPasst(rahmen(cur.map(blk).join(''),0),W,H)){ cur.pop();
      // Überschrift nicht allein am Seitenende lassen
      const zurueck=cur.length>1&&cur[cur.length-1].t==='h'?cur.pop():null;
      if(cur.length){ fertig(); if(zurueck)cur.push(zurueck); cur.push(b); }
      else { cur.push(b); fertig(); continue; }
      if(!simpPasst(rahmen(cur.map(blk).join(''),0),W,H)){ // ein einzelner Block ist länger als eine Seite: Tabelle oder Absatz teilen
        const x=cur.pop(); if(x.t==='tab'&&x.zeilen.length>2){ const h=Math.ceil((x.zeilen.length-1)/2); alle.splice(i+1,0,{t:'tab',zeilen:[x.zeilen[0],...x.zeilen.slice(1+h)]}); cur.push({t:'tab',zeilen:x.zeilen.slice(0,1+h)}); }
        else if(x.t==='p'&&x.text.length>400){ const S=x.text.match(/[^.!?]+[.!?]+\s*|[^.!?]+$/g)||[x.text]; const h=Math.ceil(S.length/2); alle.splice(i+1,0,{t:'p',text:S.slice(h).join('').trim()}); cur.push({t:'p',text:S.slice(0,h).join('').trim()}); }
        else cur.push(x); } } }
  fertig(); return out; }

/* ---------- Bilder hochladen ---------- */
async function simpBilderHochladen(seiten,stamm,fortschritt){ const bl=seiten.flatMap(s=>s.bloecke.filter(b=>b.t==='bild'&&!b.pfad)); let n=0;
  for(const b of bl){ n++; fortschritt&&fortschritt(`Bilder hochladen ${n} von ${bl.length}`);
    let datei=b.blob; try{ if(datei.size>1.5e6&&typeof stVerkleinern==='function')datei=await stVerkleinern(new File([datei],b.name,{type:datei.type}))||datei; }catch(e){}
    const endung=(/\.(\w+)$/.exec(b.name)||[,'png'])[1].toLowerCase().replace('jpeg','jpg'); const pfad=`assets/import-${stSlug(stamm).slice(0,40)}-${Date.now().toString(36)}-${n}.${endung}`;
    const {error}=await SVB.sb.storage.from('studio').upload(pfad,datei,{contentType:datei.type||'image/png',upsert:true});
    if(error){ b.pfad=''; b.fehler=true; continue; }
    b.pfad=pfad; try{ await SVB.sb.from('studio_medien').upsert({pfad,name:(stamm+' '+n).slice(0,120),tags:['foto']}); }catch(e){} }
  // Bilder, die nicht hochgeladen werden konnten, fallen weg (statt kaputter Bilder)
  seiten.forEach(s=>{ s.bloecke=s.bloecke.filter(b=>b.t!=='bild'||b.pfad); }); return bl.filter(b=>b.fehler).length; }

/* ---------- Ablauf: Datei wählen, lesen, Vorschau, anlegen ---------- */
function simpArtVorschlag(name,seiten){ if(/\.(pptx|odp)$/i.test(name))return 'deck'; if(/\.pdf$/i.test(name))return seiten.quer?'deck':'doc';
  if(/\.(docx|odt|rtf|txt)$/i.test(name))return 'doc'; if(/^image|\.(jpe?g|png|webp|gif)$/i.test(name))return 'deck';
  // HTML und Markdown: viele kurze Abschnitte eher Präsentation, langer Fließtext eher Dokument
  const zeichen=seiten.reduce((a,s)=>a+s.bloecke.reduce((x,b)=>x+(b.text||'').length,0),0); return seiten.length>=3&&zeichen/Math.max(1,seiten.length)<700?'deck':'doc'; }
async function simpImport(files){ files=[...files].filter(f=>SIMP_ENDUNGEN.test(f.name)||/^image\//.test(f.type)); if(!files.length){ kToast('Diese Datei kann das Studio nicht lesen.'); return; }
  const M=svModal(`<h2>Datei importieren</h2><div id="simpIn" class="simp"><div class="empty">Lese ${stE(files.length===1?files[0].name:files.length+' Dateien')} …</div></div>`); M.classList.add('st-modal','simp-modal');
  const box=M.querySelector('#simpIn'), status=t=>{ const e=box.querySelector('.empty'); if(e)e.textContent=t; };
  let seiten=[], name=files[0].name;
  try{ for(const f of files){ const s=await simpLesen(f); if(files.length>1&&s.length&&!s[0].titel&&/^image/.test(f.type))s[0].titel=''; seiten.push(...s); if(s.quer)seiten.quer=true; if(s.dokTitel&&!seiten.dokTitel)seiten.dokTitel=s.dokTitel; } }
  catch(e){ box.innerHTML=`<div class="note st-warn">${SVI('info')} ${stE(e.message||e)}</div><div class="btnrow"><button type="button" class="btn ghost" id="simpZu">Schließen</button></div>`; box.querySelector('#simpZu').onclick=()=>closeOverlay(); return; }
  seiten=seiten.filter(s=>s.titel||s.bloecke.length);
  if(!seiten.length){ box.innerHTML=`<div class="note st-warn">${SVI('info')} In der Datei steht kein Text, den das Studio lesen kann${/\.pdf$/i.test(name)?' (vielleicht ein eingescanntes PDF)':''}.</div><div class="btnrow"><button type="button" class="btn ghost" id="simpZu">Schließen</button></div>`; box.querySelector('#simpZu').onclick=()=>closeOverlay(); return; }
  const stamm=name.replace(/\.[a-z0-9]+$/i,'').replace(/[_]+/g,' ').trim();
  const ersteTitel=/\.(pptx|odp|pdf)$/i.test(name)&&seiten[0]&&seiten[0].titel&&seiten[0].bloecke.filter(b=>b.t!=='bild').length<=2?seiten[0].titel:'';
  const dok=seiten.dokTitel||ersteTitel||stamm;
  const S={art:simpArtVorschlag(name,seiten)};
  const bilderZahl=seiten.reduce((a,s)=>a+s.bloecke.filter(b=>b.t==='bild').length,0);
