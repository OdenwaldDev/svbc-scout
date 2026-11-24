(function(){
  'use strict';
  const C=window.BD_CORE,R=window.BD_RENDER,$=s=>document.querySelector(s),E=C.esc;
  const editNonce=new URLSearchParams(location.hash.slice(1)).get('edit'),embedded=window.parent!==window&&/^[a-f0-9]{32}$/.test(editNonce||'');
  let editorRole='team',editorRules={},editorVersion=null,editorReady=!embedded,saving=false,assetBusy=false;
  const customer=()=>embedded&&editorRole==='kunde';
  let doc=C.template(C.create(),'kante'),hist=C.history(doc),selected=null,zoom=1,guides=true,drag=null,paintNr=0,saveTimer,db=null,pending=null,opener=null,dirty=false,saveChain=Promise.resolve();
  if(embedded){document.body.classList.add('embedded');const footer=document.createElement('footer');footer.className='editorSaveBar';footer.innerHTML='<span id="editState" role="status">Gestaltung wird geladen …</span><div><button id="editCancel" type="button">Abbrechen</button><button id="editSave" type="button" class="saveGreen" disabled>Speichern</button></div>';document.body.appendChild(footer);}
  const selectedEl=()=>doc.elements.find(e=>e.id===selected);
  function notice(s,error=false){const n=$('#notice');n.textContent=s;n.hidden=!s;n.classList.toggle('error',error);}
  function error(e){const msg=e&&e.message||'';notice(/failed to fetch|networkerror|load failed|network request failed/i.test(msg)?'Die Verbindung ist unterbrochen. Prüfe dein Netz und versuche es erneut.':msg||'Das hat nicht geklappt. Bitte versuche es erneut.',true);}
  function download(blob,name){const u=URL.createObjectURL(blob),a=document.createElement('a');a.href=u;a.download=name;document.body.appendChild(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(u),15000);}
  const fileName=()=>('bande-'+(doc.title||'entwurf').toLowerCase().replace(/ä/g,'ae').replace(/ö/g,'oe').replace(/ü/g,'ue').replace(/ß/g,'ss').replace(/[^a-z0-9]+/g,'-').replace(/^-|-$/g,'').slice(0,65)+'-'+doc.width+'x'+doc.height+'mm');
  async function database(){return new Promise((ok,no)=>{const q=indexedDB.open('svbsc-bandenstudio',1);q.onupgradeneeded=()=>q.result.createObjectStore('projects',{keyPath:'id'});q.onsuccess=()=>ok(q.result);q.onerror=()=>no(Error('Die Gerätesicherung ist nicht verfügbar. Lade eine Projektdatei herunter.'));});}
  async function localSave(){
    if(!db)throw Error('Die Gerätesicherung ist nicht verfügbar. Lade eine Projektdatei herunter.');
    const snapshot=C.normalise(doc);snapshot.updated=new Date().toISOString();
    await new Promise((ok,no)=>{const t=db.transaction('projects','readwrite');t.objectStore('projects').put(snapshot);t.oncomplete=ok;t.onerror=()=>no(Error('Auf diesem Gerät ist nicht genug Speicher. Lade die Projektdatei herunter.'));t.onabort=t.onerror;});
    if(JSON.stringify(C.normalise({...doc,updated:snapshot.updated}))===JSON.stringify(snapshot)){dirty=false;$('#saveState').textContent='Auf diesem Gerät gesichert';}
    await recent();
  }
  function queueSave(){dirty=true;if(embedded){$('#saveState').textContent='Noch nicht gespeichert';$('#editState').textContent='Mit Speichern für diese Firma übernehmen';embeddedButtons();return;}$('#saveState').textContent='Änderungen werden gesichert';clearTimeout(saveTimer);saveTimer=setTimeout(()=>{saveChain=saveChain.catch(()=>{}).then(localSave).catch(e=>{$('#saveState').textContent='Bitte als Projektdatei sichern';error(e);});},700);}
  async function recent(){if(!db)return;const rows=await new Promise((ok,no)=>{const q=db.transaction('projects').objectStore('projects').getAll();q.onsuccess=()=>ok(q.result);q.onerror=no;});rows.sort((a,b)=>String(b.updated).localeCompare(String(a.updated)));$('#recent').innerHTML='<option value="">Projekt öffnen</option>'+rows.slice(0,30).map(p=>`<option value="${E(p.id)}">${E(p.title||'Unbenannte Bande')} · ${p.width/10} × ${p.height/10} cm</option>`).join('');}
  function change(redraw=true){
    for(const e of doc.elements){e.x=C.num(e.x,-100,20100,0);e.y=C.num(e.y,-100,3100,0);e.w=C.num(e.w,.5,20000,100);e.h=C.num(e.h,.5,3000,100);if(e.type==='text')e.size=C.num(e.size,2,2000,100);}
    hist.push(doc);queueSave();if(redraw)paint();quality();buttons();
  }
  function setDoc(next){doc=C.cleanContacts(next);if(customer())doc._layoutChoice='behalten';selected=null;hist=C.history(doc);queueSave();form();paint();properties();}
  function buttons(){$('#undo').disabled=!hist.canUndo;$('#redo').disabled=!hist.canRedo;}
  function swatches(host,value,onpick){host.innerHTML=Object.entries(C.CI).map(([k,c])=>`<button type="button" class="swatch" data-color="${c}" aria-label="${E(k)} ${c}" aria-pressed="${value===c}"><i style="background:${c}"></i></button>`).join('');host.querySelectorAll('[data-color]').forEach(b=>b.onclick=()=>onpick(b.dataset.color));}
  function form(){
    $('#title').value=doc.title||'Neue Bande';$('#width').value=doc.width/10;$('#height').value=doc.height/10;
    $('#format').innerHTML=C.FORMATS.map(([key,w,h])=>`<option value="${key}">${w/10} × ${h/10} cm</option>`).join('')+'<option value="custom">Eigenes Maß</option>';
    $('#format').value=C.FORMATS.find(([,w,h])=>w===doc.width&&h===doc.height)?.[0]||'custom';
    swatches($('#background'),doc.background,c=>{doc.background=c;change();form();});buttons();quality();
    $('#logoSymbol').checked=doc.elements.some(e=>e.type==='image')&&doc.elements.some(e=>e.type==='text'&&e.role==='name');
    $('#logoSymbol').disabled=['bb','moerlens'].includes(templateFields().pattern);$('#logoSymbol').closest('label').hidden=$('#logoSymbol').disabled;
  }
  function templateFields(){const names=doc.elements.filter(e=>e.type==='text'),bb=names.some(e=>e.text==='EVENT')&&names.some(e=>e.text==='KREATIV'),moerlens=names.some(e=>e.text==='Restobar & Patisserie');
    const pattern=['bb','moerlens'].includes(editorRules.pattern)?editorRules.pattern:bb?'bb':moerlens?'moerlens':'normal';
    return {name:customer()?editorRules.name||editorRules.firma||doc.title:names.find(e=>e.role==='name')?.text||editorRules.name||doc.title,nameAn:customer()?editorRules.nameAn===true:$('#logoSymbol').checked,pattern,claim:pattern==='moerlens'?'Restobar & Patisserie':''};}
  // Aktuelle Vorlage beim Aufbereiten des Bildes oder beim Setzen eines separaten Namens behalten.
  function aktiveVorlage(){return $('#templates [aria-pressed="true"]')?.dataset.template||'klar';}
  $('#logoSymbol').onchange=()=>{if(customer()||$('#logoSymbol').disabled)return;doc=C.template(doc,aktiveVorlage(),templateFields());selected=null;change();form();properties();};
  function layers(){
    $('#layers').innerHTML=[...doc.elements].reverse().map(e=>`<div role="listitem"><button class="layer" data-layer="${e.id}" aria-pressed="${e.id===selected}"><span class="layerMark">${e.type==='text'?'T':e.type==='image'?'L':'■'}</span><span>${E(e.type==='text'?e.text||'Leerer Text':e.type==='image'?doc.assets[e.asset].name||'Logo':'Fläche')}${e.locked?' · gesperrt':''}</span></button></div>`).join('');
    $('#layers').querySelectorAll('[data-layer]').forEach(b=>b.onclick=()=>{selected=b.dataset.layer;paint();properties();});
  }
  function properties(){
    const e=selectedEl(),host=$('#properties');
    if(!e){host.innerHTML='<h2>Auswahl</h2><p class="help">Wähle einen Text, eine Fläche oder ein Logo auf der Bande.</p>';return;}
    host.innerHTML=`<h2>${e.type==='text'?'Text':e.type==='image'?'Logo':'Fläche'}</h2>`+(e.type==='text'?`<label for="propText">Inhalt</label><textarea id="propText" rows="3" maxlength="180">${E(e.text)}</textarea><label>CI-Schrift<select id="propFont">${Object.entries(C.FONTS).map(([k,f])=>`<option value="${k}"${k===e.font?' selected':''}>${E(f.name)}</option>`).join('')}</select></label><label>Schriftgröße, mm<input id="propSize" type="number" min="2" max="2000" step="1" value="${e.size}"></label><label>Ausrichtung<select id="propAlign">${[['left','Links'],['center','Mittig'],['right','Rechts']].map(([k,t])=>`<option value="${k}"${k===e.align?' selected':''}>${t}</option>`).join('')}</select></label>`:'')+
      (e.type!=='image'?`<label>Farbe<div class="swatches" id="propSwatches" role="group" aria-label="CI-Farben"></div><input type="color" id="propColor" value="${e.fill}" aria-label="Eigene Farbe"></label>`:`<p class="help">${E(doc.assets[e.asset].name)}<br>${doc.assets[e.asset].vector?'Vektorlogo, frei skalierbar':doc.assets[e.asset].width+' × '+doc.assets[e.asset].height+' Originalpixel'}</p>`)+
      `<div class="two">${[['x','Abstand links'],['y','Abstand oben'],['w','Breite'],['h','Höhe']].map(([k,t])=>`<label>${t}, mm<input data-geom="${k}" type="number" step="1" min="${k==='x'||k==='y'?-100:1}" max="20000" value="${Math.round(e[k]*10)/10}"></label>`).join('')}</div><label class="check"><input id="propLock" type="checkbox"${e.locked?' checked':''}><span>Position sperren</span></label><div class="propsActions"><button id="forward">Nach vorn</button><button id="backward">Nach hinten</button><button id="duplicate">Duplizieren</button><button id="remove">Entfernen</button></div>`;
    function bind(id,key,parse=s=>s){const q=$(id);if(q)q.oninput=()=>{const current=doc.elements.find(x=>x.id===e.id);let value=parse(q.value);if(key==='size'){if(!Number.isFinite(value)||value<2||value>2000)return;}if(key==='text')value=C.text(value);current[key]=value;change();};}
    bind('#propText','text');bind('#propFont','font');bind('#propSize','size',Number);bind('#propAlign','align');bind('#propColor','fill');
    if(e.type!=='image')swatches($('#propSwatches'),e.fill,c=>{e.fill=c;change();properties();});
    host.querySelectorAll('[data-geom]').forEach(inp=>inp.onchange=()=>{const key=inp.dataset.geom,value=C.num(inp.value,key==='x'||key==='y'?-100:1,key==='y'||key==='h'?3000:20000,e[key]);if(e.type==='image'&&(key==='w'||key==='h')){const ratio=e.w/e.h;if(key==='w')e.h=value/ratio;else e.w=value*ratio;}e[key]=value;change();properties();});
    $('#propLock').onchange=e0=>{e.locked=e0.target.checked;change();};
    $('#forward').onclick=()=>moveLayer(1);$('#backward').onclick=()=>moveLayer(-1);$('#duplicate').onclick=duplicate;$('#remove').onclick=remove;
  }
  function moveLayer(delta){const i=doc.elements.findIndex(e=>e.id===selected),j=Math.max(0,Math.min(doc.elements.length-1,i+delta));if(i>=0&&i!==j)[doc.elements[i],doc.elements[j]]=[doc.elements[j],doc.elements[i]];change();}
  function duplicate(){const e=selectedEl();if(!e||doc.elements.length>=60)return;const n={...e,id:C.uid(),x:e.x+20,y:e.y+20,locked:false};doc.elements.push(n);selected=n.id;change();properties();}
  function remove(){const e=selectedEl();if(!e)return;doc.elements=doc.elements.filter(x=>x.id!==e.id);selected=null;change();properties();}
  function quality(){
    const q=C.preflight(doc,R.fonts,true),content=q.ok?'<p class="good">Maße, Schriften und Logo-Auflösung passen zu deinen Druckeinstellungen.</p>':'<p class="stop">Vor dem Druck noch prüfen:</p>';
    $('#quality').innerHTML=content+(q.issues.length?'<ul>'+q.issues.slice(0,3).map(x=>`<li class="${x.level==='stop'?'stop':''}">${E(x.message)}</li>`).join('')+'</ul>':'');
    if($('#printDialog').open)printChecks();
  }
  function paint(){
    if(!R.fonts.condensed)return;const art=$('#art'),available=Math.max(200,$('#stage').clientWidth-64),width=available*zoom,ppm=width/doc.width;art.style.width=width+'px';art.style.height=width*doc.height/doc.width+'px';art.setAttribute('viewBox',`0 0 ${doc.width} ${doc.height}`);
    $('#dimension').textContent=`${doc.width/10} × ${doc.height/10} cm · Endformat`;$('#zoomValue').textContent=Math.round(zoom*100)+' %';
    const elements=doc.elements.map(e=>{
      let body='';if(e.type==='rect')body=`<rect x="${e.x}" y="${e.y}" width="${e.w}" height="${e.h}" fill="${e.fill}"/>`;
      if(e.type==='text'&&e.text.trim())body=`<path d="${C.textPath(e,R.fonts[e.font]).d}" fill="${e.fill}"/>`;
      if(e.type==='image'){const a=doc.assets[e.asset],b=C.fitImage(e,a);body=a.vector?R.vectorElement(a.vector,b):`<image x="${b.x}" y="${b.y}" width="${b.w}" height="${b.h}" href="${a.src}"/>`;}
      return `<g data-el="${e.id}" data-locked="${e.locked||customer()}" role="${customer()?'img':'button'}" tabindex="${customer()?-1:0}" aria-label="${E(e.type==='text'?e.text||'Leerer Text':e.type==='image'?'Logo '+doc.assets[e.asset].name:'Fläche')}">${body}<rect x="${e.x}" y="${e.y}" width="${e.w}" height="${e.h}" fill="transparent"/></g>`;
    }).join('');
    const s=selectedEl(),safe=guides?`<rect x="${doc.safe}" y="${doc.safe}" width="${Math.max(0,doc.width-2*doc.safe)}" height="${Math.max(0,doc.height-2*doc.safe)}" fill="none" stroke="#9aacc6" stroke-dasharray="${6/ppm} ${6/ppm}" vector-effect="non-scaling-stroke" stroke-width="1" pointer-events="none"/>`:'';
    const box=s&&!customer()?`<rect x="${s.x}" y="${s.y}" width="${s.w}" height="${s.h}" fill="none" stroke="#215dba" stroke-width="2" vector-effect="non-scaling-stroke" pointer-events="none"/>${s.locked?'':`<circle data-resize="1" cx="${s.x+s.w}" cy="${s.y+s.h}" r="${22/ppm}" fill="transparent"/><circle cx="${s.x+s.w}" cy="${s.y+s.h}" r="${5/ppm}" fill="#fff" stroke="#215dba" stroke-width="2" vector-effect="non-scaling-stroke" pointer-events="none"/>`}`:'';
    art.innerHTML=`<rect width="${doc.width}" height="${doc.height}" fill="${doc.background}"/>${elements}${safe}${box}`;
    $('#selectionInfo').textContent=customer()?'Logo aufbereiten oder eine der zwei Anordnungen wählen.':s?(s.locked?'Position gesperrt':s.type==='text'?'Text verschieben oder rechts bearbeiten':'Element verschieben. Am Eckpunkt vergrößern.'):'Element antippen und verschieben';layers();buttons();paintNr++;
  }
  function point(event){const art=$('#art'),p=art.createSVGPoint();p.x=event.clientX;p.y=event.clientY;return p.matrixTransform(art.getScreenCTM().inverse());}
  function snap(value,targets,tolerance){const near=targets.find(v=>Math.abs(v-value)<tolerance);return near===undefined?value:near;}
  $('#art').addEventListener('pointerdown',e=>{
    if(customer())return;
    const hit=e.target.closest('[data-el]'),resize=e.target.closest('[data-resize]');
    if(hit){selected=hit.dataset.el;properties();paint();}else if(!resize){selected=null;properties();paint();return;}
    const el=selectedEl();if(!el||el.locked)return;e.preventDefault();const p=point(e);drag={id:el.id,start:p,before:{...el},resize:!!resize,pointer:e.pointerId};$('#art').setPointerCapture(e.pointerId);
  });
  $('#art').addEventListener('pointermove',e=>{if(!drag||drag.pointer!==e.pointerId)return;const el=selectedEl();if(!el||el.id!==drag.id)return;const p=point(e),dx=p.x-drag.start.x,dy=p.y-drag.start.y,b=drag.before;
    if(drag.resize){if(el.type==='rect'){el.w=C.num(b.w+dx,10,20000,b.w);el.h=C.num(b.h+dy,10,3000,b.h);}else{const s=Math.max(.01,Math.min((b.w+dx)/b.w,20000/b.w,3000/b.h));el.w=b.w*s;el.h=b.h*s;if(el.type==='text')el.size=C.num(b.size*s,2,2000,b.size);}}
    else{const tol=8*doc.width/Math.max(200,$('#art').clientWidth);el.x=C.num(snap(b.x+dx,[doc.safe,doc.width/2-el.w/2,doc.width-doc.safe-el.w],tol),-100,20100,b.x);el.y=C.num(snap(b.y+dy,[doc.safe,doc.height/2-el.h/2,doc.height-doc.safe-el.h],tol),-100,3100,b.y);}
    paint();
  });
  function dragEnd(e){if(!drag||e.pointerId!==drag.pointer)return;drag=null;change();properties();}
  $('#art').addEventListener('pointerup',dragEnd);$('#art').addEventListener('pointercancel',dragEnd);
  $('#art').addEventListener('click',e=>{if(customer())return;const b=e.target.closest('[data-el]');if(b&&!drag){selected=b.dataset.el;properties();paint();}});
  document.addEventListener('keydown',e=>{
    const dialog=document.querySelector('dialog[open]');if(dialog){if(e.key==='Escape'){e.preventDefault();close(dialog);}if(e.key==='Tab'){const f=[...dialog.querySelectorAll('button,input,select,textarea,[tabindex]')].filter(x=>!x.disabled&&x.getClientRects().length&&x.tabIndex>=0),i=f.indexOf(document.activeElement);if(e.shiftKey&&i<=0){e.preventDefault();f[f.length-1]?.focus();}else if(!e.shiftKey&&(i<0||i===f.length-1)){e.preventDefault();f[0]?.focus();}}return;}
    if(embedded&&e.key==='Escape'){e.preventDefault();if(!saving)window.parent.postMessage({typ:'bd-editor-abbrechen',nonce:editNonce},location.origin);return;}
    if(embedded&&e.key==='Tab'){const f=focusables(),at=f.indexOf(document.activeElement);if(e.shiftKey&&at===0||!e.shiftKey&&at===f.length-1){e.preventDefault();window.parent.postMessage({typ:'bd-editor-fokus',nonce:editNonce,ziel:'schliessen'},location.origin);}return;}
    if(e.target.closest('input,textarea,select'))return;
    const key=e.key.toLowerCase();if((e.ctrlKey||e.metaKey)&&key==='z'){e.preventDefault();restoreHistory(e.shiftKey?'redo':'undo');return;}
    if(customer())return;
    if((e.ctrlKey||e.metaKey)&&key==='d'){e.preventDefault();duplicate();return;}
    if(e.key==='Delete'||e.key==='Backspace'){if(selected){e.preventDefault();remove();}return;}
    const hit=e.target.closest('[data-el]');if(hit&&(e.key==='Enter'||e.key===' ')){e.preventDefault();selected=hit.dataset.el;properties();paint();$('#properties').querySelector('textarea,input,button')?.focus();return;}
    if(hit&&['ArrowLeft','ArrowRight','ArrowUp','ArrowDown'].includes(e.key))selected=hit.dataset.el;
    const el=selectedEl();if(el&&!el.locked&&['ArrowLeft','ArrowRight','ArrowUp','ArrowDown'].includes(e.key)){e.preventDefault();const s=e.shiftKey?20:5;if(e.key==='ArrowLeft')el.x-=s;if(e.key==='ArrowRight')el.x+=s;if(e.key==='ArrowUp')el.y-=s;if(e.key==='ArrowDown')el.y+=s;change();properties();$('#art').querySelector('[data-el="'+el.id+'"]')?.focus();}
  });
  function restoreHistory(which){doc=hist[which]();if(!doc.elements.some(e=>e.id===selected))selected=null;queueSave();form();paint();properties();}
  $('#undo').onclick=()=>restoreHistory('undo');$('#redo').onclick=()=>restoreHistory('redo');
  function zoomBy(n){zoom=C.num(zoom+n,.5,4,1);paint();}$('#zoomOut').onclick=()=>zoomBy(-.25);$('#zoomIn').onclick=()=>zoomBy(.25);$('#fit').onclick=()=>{zoom=1;paint();};
  $('#safe').onclick=()=>{guides=!guides;$('#safe').setAttribute('aria-pressed',String(guides));paint();};
  $('#title').oninput=e=>{doc.title=e.target.value;change(false);};
  function dimensions(w,h){const sx=w/doc.width,sy=h/doc.height;doc.width=w;doc.height=h;doc.elements.forEach(e=>{e.x*=sx;e.y*=sy;e.w*=sx;e.h*=sy;if(e.type==='text')e.size*=Math.min(sx,sy);});change();form();properties();}
  $('#format').onchange=e=>{const f=C.FORMATS.find(x=>x[0]===e.target.value);if(f)dimensions(f[1],f[2]);};
  for(const [q,k,min,max]of[['#width','width',10,2000],['#height','height',10,300]])$(q).onchange=e=>{const n=+e.target.value;if(!Number.isFinite(n)||n<min||n>max){error(Error(`Bitte ein Maß zwischen ${min} und ${max} cm eintragen.`));form();return;}dimensions(k==='width'?n*10:doc.width,k==='height'?n*10:doc.height);};
  $('#addText').onclick=()=>{if(doc.elements.length>=60){notice('Die Bande enthält bereits 60 Elemente. Entferne zuerst ein nicht mehr benötigtes Element.');return;}const e={id:C.uid(),type:'text',text:'DEIN TEXT',font:'condensed',size:100,fill:C.CI.marine,align:'left',x:doc.safe+50,y:doc.safe+50,w:Math.max(20,Math.min(doc.width-2*doc.safe-100,1600)),h:Math.max(20,Math.min(doc.height-2*doc.safe-100,220)),locked:false};doc.elements.push(e);selected=e.id;change();properties();$('#propText').focus();$('#propText').select();};
  $('#addRect').onclick=()=>{if(doc.elements.length>=60){notice('Die Bande enthält bereits 60 Elemente. Entferne zuerst ein nicht mehr benötigtes Element.');return;}const e={id:C.uid(),type:'rect',x:doc.safe,y:doc.safe,w:doc.width*.25,h:Math.min(doc.height*.15,150),fill:C.CI.orange,locked:false};doc.elements.push(e);selected=e.id;change();properties();};
  $('#templates').innerHTML=C.TEMPLATES.map(([k,t])=>`<button class="template" data-template="${k}" aria-label="Vorlage ${E(t)}" aria-pressed="${k==='kante'}"><svg viewBox="0 0 180 55" aria-hidden="true"><rect width="180" height="55" fill="${k==='marine'?C.CI.marine:'#fff'}"/><rect x="18" y="9" width="${k==='kante'?136:144}" height="37" rx="2" fill="${k==='marine'?'#fff':'#dce2ef'}"/>${k==='kante'?`<path d="M170 0h10v55h-10z" fill="${C.CI.orange}"/>`:''}</svg><span>${E(t)}</span></button>`).join('');
  $('#templates').querySelectorAll('[data-template]').forEach(b=>b.onclick=()=>{if(customer()&&!['klar','logo'].includes(b.dataset.template))return;doc=C.template(doc,b.dataset.template,templateFields());if(customer())doc._layoutChoice=b.dataset.template;selected=null;change();form();properties();$('#templates').querySelectorAll('button').forEach(x=>x.setAttribute('aria-pressed',String(x===b)));notice('Vorlage übernommen. Mit Rückgängig kommst du zur vorherigen Gestaltung.');});
  function open(dialog){opener=document.activeElement;if(typeof dialog.showModal==='function')dialog.showModal();else{dialog.setAttribute('open','');dialog.classList.add('fallback');}dialog.querySelector('h2').tabIndex=-1;dialog.querySelector('h2').focus();}
  function close(dialog){if(typeof dialog.close==='function')dialog.close();else dialog.removeAttribute('open');if(dialog.id==='logoDialog')pending=null;opener?.isConnected&&opener.focus();}
  document.querySelectorAll('[data-close]').forEach(b=>b.onclick=()=>close(document.getElementById(b.dataset.close)));
  function dataURL(file){return new Promise((ok,no)=>{const r=new FileReader();r.onload=()=>ok(r.result);r.onerror=()=>no(Error('Die Datei lässt sich nicht lesen.'));r.readAsDataURL(file);});}
  async function rasterFile(src,name){
    const i=await R.image(src),w=i.naturalWidth,h=i.naturalHeight;if(w*h>24000000||w>30000||h>30000)throw Error('Dieses Bild ist zu groß für die Bearbeitung. Nutze ein Logo mit höchstens 24 Millionen Pixeln oder eine SVG-Datei.');
    const c=R.canvas(w,h),x=c.getContext('2d',{willReadFrequently:true});x.drawImage(i,0,0);pending={name,src,pixels:x.getImageData(0,0,w,h).data,width:w,height:h,region:null,result:null};c.width=c.height=1;
    $('#tolerance').value=30;$('#logoQuer').checked=false;open($('#logoDialog'));cropPaint();cut();
  }
  async function importLogo(file){
    if(!file||file.size>20*1024*1024)throw Error('Bitte ein Logo bis 20 MB auswählen.');
    if(file.type==='image/svg+xml'||/\.svg$/i.test(file.name)){
      const vector=R.readSVG(await file.text()),src=await R.vectorPreview(vector);await addLogo({name:file.name,src,width:vector.width,height:vector.height,vector,kind:'vector'});notice('Vektorlogo übernommen. Die Originalfarben und Pfade bleiben erhalten.');return;
    }
    if(!/^image\/(png|jpeg|webp)$/.test(file.type))throw Error('Bitte PNG, JPG, WebP oder SVG auswählen.');await rasterFile(await dataURL(file),file.name);
  }
  $('#logoFile').onchange=async e=>{const file=e.target.files[0];e.target.value='';if(!file)return;assetBusy=true;embeddedButtons();try{await importLogo(file);}catch(e){error(e);}finally{assetBusy=false;embeddedButtons();}};
  function cropPaint(){if(!pending)return;const p=pending,c=$('#cropCanvas'),s=Math.min(1,1400/Math.max(p.width,p.height));c.width=Math.max(1,Math.round(p.width*s));c.height=Math.max(1,Math.round(p.height*s));R.image(p.src).then(i=>{if(pending!==p)return;const x=c.getContext('2d');x.clearRect(0,0,c.width,c.height);x.drawImage(i,0,0,c.width,c.height);if(p.region){x.strokeStyle='#215dba';x.lineWidth=Math.max(2,c.width/180);x.strokeRect(p.region.x*s,p.region.y*s,p.region.w*s,p.region.h*s);}}).catch(error);}
  function querfassungsBild(bild,{zeichen,schrift}){
    // Nur verkleinern. Ein größeres Raster würde dem Druckcheck mehr Quelldetails vortäuschen.
    const h=Math.min(schrift.h,Math.floor(zeichen.h/.84)),symbolH=h*.84;
    const symbolW=zeichen.w*symbolH/zeichen.h,textW=schrift.w*h/schrift.h,abstand=h*.30;
    const c=R.canvas(Math.ceil(symbolW+abstand+textW),h),x=c.getContext('2d');
    x.imageSmoothingQuality='high';
    x.drawImage(bild,zeichen.x,zeichen.y,zeichen.w,zeichen.h,0,(h-symbolH)/2,symbolW,symbolH);
    x.drawImage(bild,schrift.x,schrift.y,schrift.w,schrift.h,symbolW+abstand,0,textW,h);
    return c;
  }
  function cut(){
    if(!pending)return;
    const p=pending,wahl=$('#logoQuer'),label=$('#querFassung');
    try{
      const r=C.cutout(p.pixels,p.width,p.height,+$('#tolerance').value,p.region);
      const quelle=R.canvas(r.width,r.height);
      quelle.getContext('2d').putImageData(new ImageData(r.data,r.width,r.height),0,0);
      const teile=!customer()&&templateFields().pattern==='normal'&&r.confidence!=='prüfen'&&C.logoBloecke(r);
      label.hidden=!teile;
      if(!teile)wahl.checked=false;
      const vorlage=wahl.checked?querfassungsBild(quelle,teile):quelle;
      p.result={name:p.name,src:vorlage.toDataURL('image/png'),original:p.src,width:vorlage.width,height:vorlage.height,kind:'raster'};
      $('#logoResult').src=p.result.src;
      $('#logoStatus').textContent=wahl.checked?'Die Querfassung verwendet beide Teile aus eurem Original. Prüfe die Abstände in der Vorschau.':r.confidence==='transparent'?'Das Logo hat bereits einen transparenten Hintergrund. Leere Ränder sind entfernt.':r.confidence==='einfarbig'?'Einfarbiger Hintergrund erkannt und entfernt. Prüfe, ob alle Details erhalten sind.':'Der Hintergrund ist uneinheitlich. Markiere das Logo im Original oder verwende die Originaldatei.';
      $('#logoApply').disabled=false;
      quelle.width=quelle.height=1;vorlage.width=vorlage.height=1;
    }catch(e){
      p.result=null;label.hidden=true;wahl.checked=false;
      $('#logoResult').removeAttribute('src');$('#logoApply').disabled=true;$('#logoStatus').textContent=e.message;
    }
  }
  $('#logoQuer').onchange=cut;
  let cropDrag=null;
  function cropPoint(e){const c=$('#cropCanvas'),r=c.getBoundingClientRect(),s=Math.min(r.width/c.width,r.height/c.height),ox=(r.width-c.width*s)/2,oy=(r.height-c.height*s)/2;return {x:C.num((e.clientX-r.left-ox)/s/c.width*pending.width,0,pending.width,0),y:C.num((e.clientY-r.top-oy)/s/c.height*pending.height,0,pending.height,0)};}
  $('#cropCanvas').onpointerdown=e=>{if(!pending)return;e.preventDefault();cropDrag=cropPoint(e);e.target.setPointerCapture(e.pointerId);};
  $('#cropCanvas').onpointermove=e=>{if(!pending||!cropDrag)return;const p=cropPoint(e);pending.region={x:Math.min(p.x,cropDrag.x),y:Math.min(p.y,cropDrag.y),w:Math.abs(p.x-cropDrag.x),h:Math.abs(p.y-cropDrag.y)};cropPaint();};
  $('#cropCanvas').onpointerup=()=>{if(!cropDrag)return;cropDrag=null;cut();};$('#cropCanvas').onpointercancel=()=>{cropDrag=null;};
  $('#tolerance').onchange=cut;$('#cropReset').onclick=()=>{if(pending){pending.region=null;cropPaint();cut();}};
  async function useLogo(original){if(!pending||assetBusy)return;assetBusy=true;embeddedButtons();$('#logoOriginal').disabled=true;$('#logoApply').disabled=true;try{await addLogo(original?{name:pending.name,src:pending.src,width:pending.width,height:pending.height,kind:'raster'}:pending.result);close($('#logoDialog'));}catch(e){error(e);}finally{assetBusy=false;$('#logoOriginal').disabled=false;$('#logoApply').disabled=!pending?.result;embeddedButtons();}}
  $('#logoOriginal').onclick=()=>useLogo(true);
  $('#logoApply').onclick=()=>useLogo(false);
  async function addLogo(asset){
    await R.analyseAsset(asset);
    const id=C.uid();doc.assets[id]=asset;const old=doc.elements.find(e=>e.type==='image');
    if(old){const previous=old.asset;for(const e of doc.elements)if(e.type==='image'&&e.asset===previous)e.asset=id;selected=old.id;}else{const layout=aktiveVorlage();doc=C.template(doc,layout,templateFields());if(customer())doc._layoutChoice=layout==='kante'?'behalten':layout;selected=doc.elements.find(e=>e.type==='image')?.id;}
    const used=new Set(doc.elements.filter(e=>e.type==='image').map(e=>e.asset));for(const key of Object.keys(doc.assets))if(!used.has(key))delete doc.assets[key];
    const choice=doc._layoutChoice;if(customer()&&['klar','logo'].includes(choice)){doc=C.template(doc,choice,templateFields());doc._layoutChoice=choice;}
    change();form();properties();if(customer()&&asset.light&&doc.background===C.CI.weiss)notice('Dein Logo ist sehr hell. Wähle Klar oder Logo im Mittelpunkt, damit es auf dunklem Vereinsblau sichtbar wird.');
  }
  function printChecks(){const q=C.preflight(doc,R.fonts);$('#printChecks').innerHTML=q.ok?'<p class="good">Die Gestaltung erfüllt deine eingestellten Druckvorgaben.</p>':'<ul>'+q.issues.filter(x=>x.level==='stop').map(x=>`<li class="stop">${E(x.message)}</li>`).join('')+'</ul>';$('#pdfExport').disabled=!q.ok;$('#printSummary').innerHTML=`<b>Endformat: ${doc.width/10} × ${doc.height/10} cm</b><br>Beschnitt: ${doc.bleed} mm je Seite · Maßstab 1:${doc.scale}<br>Schrift als Vektorpfade · ${doc.mode==='cmyk'?'CMYK mit hochgeladenem ICC-Profil':'RGB'}`;}
  function printForm(){for(const [q,k]of[['bleed','bleed'],['safety','safe'],['scale','scale'],['dpi','minDpi'],['mode','mode']])$('#'+q).value=doc[k];$('#rgbAccepted').checked=doc.rgbAccepted;$('#rgbRow').hidden=doc.mode!=='rgb';$('#iccRow').hidden=doc.mode!=='cmyk';$('#profileName').textContent=doc.profile?.name||'Noch kein Ausgabeprofil geladen.';printChecks();}
  function printOpen(){printForm();open($('#printDialog'));}$('#export').onclick=printOpen;$('#settings').onclick=printOpen;
  for(const [q,k]of[['bleed','bleed'],['safety','safe'],['scale','scale'],['dpi','minDpi'],['mode','mode']])$('#'+q).onchange=e=>{try{const next=C.normalise({...doc,[k]:k==='mode'?e.target.value:+e.target.value});doc[k]=next[k];change();printForm();paint();}catch(er){error(er);printForm();}};
  $('#rgbAccepted').onchange=e=>{doc.rgbAccepted=e.target.checked;change(false);printChecks();};
  $('#profileFile').onchange=async e=>{const file=e.target.files[0];e.target.value='';if(!file)return;try{if(file.size>8*1024*1024)throw Error('Das Farbprofil ist größer als 8 MB.');const data=(await dataURL(file)).split(',')[1],profile={name:file.name,data},cms=await R.colourEngine(profile);profile.name=cms.name;cms.close();doc.profile=profile;doc.mode='cmyk';change(false);printForm();}catch(er){error(er);}};
  async function busy(button,fn){const label=button.textContent;button.disabled=true;button.textContent='Wird erstellt …';try{await fn();}catch(e){error(e);}finally{button.disabled=false;button.textContent=label;if($('#printDialog').open)printChecks();}}
  $('#pdfExport').onclick=()=>busy($('#pdfExport'),async()=>{const r=await R.pdf(doc);download(new Blob([r.bytes],{type:'application/pdf'}),fileName()+'-'+r.mode+'-1zu'+doc.scale+'.pdf');notice('PDF geladen. Endformat, Beschnitt und Maßstab stehen auch in den Dateieigenschaften.');});
  $('#svgExport').onclick=()=>busy($('#svgExport'),async()=>{await R.loadFonts();download(new Blob([R.svgDocument(C.cleanContacts(doc))],{type:'image/svg+xml'}),fileName()+'-rgb.svg');notice('SVG geladen. Schrift ist in Pfade umgewandelt; Bilder sind eingebettet.');});
  $('#pngExport').onclick=()=>busy($('#pngExport'),async()=>{const clean=C.cleanContacts(doc),scale=Math.min(3600/clean.width,Math.sqrt(12000000/clean.width/clean.height)),c=R.canvas(Math.ceil(clean.width*scale),Math.ceil(clean.height*scale));await R.render(c.getContext('2d'),clean,scale);const blob=await new Promise(ok=>c.toBlob(ok,'image/png'));if(!blob)throw Error('Die Vorschau lässt sich nicht erstellen.');download(blob,fileName()+'-vorschau.png');c.width=c.height=1;notice('PNG-Vorschau geladen. Für die Druckerei bitte das PDF verwenden.');});
  $('#projectSave').onclick=()=>{const d=C.cleanContacts(doc);download(new Blob([JSON.stringify(d)],{type:'application/json'}),fileName()+'.bande.json');notice('Projektdatei geladen. Sie enthält die Gestaltung, Logo-Dateien und deine Druckeinstellungen.');};
  $('#new').onclick=async()=>{try{clearTimeout(saveTimer);if(dirty)await localSave();setDoc(C.template(C.create(),'kante'));$('#templates').querySelectorAll('[data-template]').forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.template==='kante')));notice('Neue Bande angelegt. Vorherige Projekte findest du in der Geräteauswahl.');}catch(e){error(e);}};
  $('#recent').onchange=async e=>{const id=e.target.value;if(!id||!db)return;try{clearTimeout(saveTimer);if(dirty)await localSave();const row=await new Promise((ok,no)=>{const q=db.transaction('projects').objectStore('projects').get(id);q.onsuccess=()=>ok(q.result);q.onerror=no;});if(row)setDoc(row);}catch(e){error(e);}};
  $('#projectFile').onchange=async e=>{const f=e.target.files[0];e.target.value='';if(!f)return;try{if(f.size>100*1024*1024)throw Error('Die Projektdatei ist zu groß.');const next=await R.validateAssets(C.normalise(JSON.parse(await f.text())));clearTimeout(saveTimer);if(dirty)await localSave();setDoc(next);notice('Projekt geöffnet. Logos und Druckeinstellungen sind wieder da.');}catch(er){error(er.message?.includes('JSON')?Error('Die Projektdatei ist beschädigt.'):er);}};
  addEventListener('resize',()=>paint());addEventListener('beforeunload',e=>{if(dirty&&!embedded){e.preventDefault();e.returnValue='';}});
  function focusables(){return [...document.querySelectorAll('a[href],button,input,select,textarea,[tabindex]')].filter(x=>!x.disabled&&x.tabIndex>=0&&x.getClientRects().length&&getComputedStyle(x).visibility!=='hidden');}
  function embeddedButtons(){if(!embedded)return;$('#editSave').disabled=!editorReady||assetBusy||saving;$('#editCancel').disabled=saving;}
  async function smallPreview(d){let width=1400;for(let n=0;n<5;n++){const scale=width/d.width,c=R.canvas(Math.max(1,Math.ceil(d.width*scale)),Math.max(1,Math.ceil(d.height*scale)));await R.render(c.getContext('2d'),d,scale);const result=c.toDataURL('image/png');c.width=c.height=1;if(result.length<=500000)return result;width=Math.floor(width*.7);}throw Error('Die Vorschau ist zu groß. Bitte verwende ein kleineres Logo-Bild.');}
  async function embeddedSave(){
    if(!embedded||!editorReady||saving||assetBusy)return;saving=true;embeddedButtons();$('#editState').textContent='Wird gespeichert …';
    try{const clean=await R.validateAssets(C.cleanContacts(doc)),preview=await smallPreview(clean),choice=doc._layoutChoice;window.parent.postMessage({typ:'bd-editor-speichern',nonce:editNonce,doc:clean,preview,template:choice==='klar'||choice==='logo'?choice:null,version:editorVersion},location.origin);}
    catch(e){saving=false;embeddedButtons();$('#editState').textContent='Noch nicht gespeichert';error(e);}
  }
  if(embedded){
    $('#editSave').onclick=embeddedSave;$('#editCancel').onclick=()=>{if(!saving)window.parent.postMessage({typ:'bd-editor-abbrechen',nonce:editNonce},location.origin);};
    addEventListener('message',async e=>{
      if(e.origin!==location.origin||e.source!==window.parent||e.data?.nonce!==editNonce)return;
      if(e.data.typ==='bd-editor-fokus'){const f=focusables();(e.data.ziel==='letztes'?f[f.length-1]:f[0])?.focus();return;}
      if(e.data.typ==='bd-editor-gespeichert'){
        saving=false;if(e.data.ok){dirty=false;$('#editState').textContent='Gespeichert';$('#saveState').textContent='Für diese Firma gespeichert';}else{$('#editState').textContent='Noch nicht bestätigt';error(Error(e.data.fehler||'Die Gestaltung konnte nicht gespeichert werden. Deine Änderungen sind noch hier.'));}embeddedButtons();return;
      }
      if(e.data.typ!=='bd-editor-laden'||editorReady)return;
      try{editorRole=e.data.rolle==='kunde'?'kunde':'team';editorRules=e.data.vorgaben&&typeof e.data.vorgaben==='object'?e.data.vorgaben:{};editorVersion=e.data.version;document.body.classList.toggle('customer',customer());
        const next=await R.validateAssets(C.normalise(e.data.doc));guides=!customer();setDoc(next);$('#templates').querySelectorAll('[data-template]').forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.template===e.data.template)));dirty=false;editorReady=true;document.body.classList.add('editorReady');$('#loading').hidden=true;$('#title').readOnly=customer();$('.brand').removeAttribute('href');$('#editState').textContent='Änderungen werden erst mit Speichern übernommen';$('#saveState').textContent=e.data.farbvorschau?'Farbvorschau':'Gespeicherte Gestaltung';
        const logoButton=document.createElement('button');logoButton.type='button';logoButton.id='currentLogoEdit';logoButton.className='wide';logoButton.textContent='Vorhandenes Logo aufbereiten';logoButton.onclick=async()=>{const el=doc.elements.find(e=>e.type==='image'),a=el&&doc.assets[el.asset];if(!a){notice('Lade zuerst ein Logo hoch.');return;}if(a.vector){notice('Dieses Logo ist bereits ein Vektor. Die Pfade bleiben erhalten. Für eine andere Fassung lade die SVG-Originaldatei neu.');return;}assetBusy=true;embeddedButtons();try{await rasterFile(a.original||a.src,a.name||'Logo');}catch(er){error(er);}finally{assetBusy=false;embeddedButtons();}};$('.library section').appendChild(logoButton);embeddedButtons();
      }catch(er){error(er);$('#editState').textContent='Die Gestaltung lässt sich gerade nicht laden.';}
    });
  }
  async function init(){
    try{await R.loadFonts();if(!embedded){$('#loading').hidden=true;form();paint();properties();}}catch(e){$('#loading').textContent=e.message;error(e);return;}
    if(embedded){window.parent.postMessage({typ:'bd-editor-bereit',nonce:editNonce},location.origin);return;}
    try{db=await database();await recent();$('#saveState').textContent='Bereit. Deine Eingaben bleiben auf diesem Gerät.';}catch(e){$('#saveState').textContent='Projektdatei zum Sichern nutzen';error(e);}
    // A one-use, same-origin handoff from the authorised creator, never a query-string logo.
    const nonce=new URLSearchParams(location.hash.slice(1)).get('transfer');
    if(window.opener&&/^[a-f0-9]{32}$/.test(nonce||'')){
      const parent=window.opener;let done=false;
      const receive=async e=>{if(done||e.origin!==location.origin||e.source!==parent||e.data?.typ!=='bandenstudio-start'||e.data.nonce!==nonce)return;done=true;removeEventListener('message',receive);history.replaceState(null,'',location.pathname);try{
        const b=e.data.brief||{},title=C.text(b.firma,120),base=C.create(title),f=C.FORMATS.find(x=>x[0]===b.format);if(f){base.width=f[1];base.height=f[2];}setDoc(C.template(base,'kante',{name:title}));
        if(b.logo&&C.isRaster(b.logo)){await rasterFile(b.logo,title+' Logo');}
        else if(typeof b.logoSVG==='string'){const vector=R.readSVG(b.logoSVG);await addLogo({name:title+' Logo',src:await R.vectorPreview(vector),width:vector.width,height:vector.height,kind:'vector',vector});}
      }catch(er){error(er);}finally{window.opener=null;}};
      addEventListener('message',receive);parent.postMessage({typ:'bandenstudio-bereit',nonce},location.origin);
    }
  }
  init();
})();
