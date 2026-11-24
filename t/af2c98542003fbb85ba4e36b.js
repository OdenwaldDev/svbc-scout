      page.pushOperators(P.pushGraphicsState(),P.rectangle(M*k,M*k,(d.width+2*B)*k,(d.height+2*B)*k),P.clip(),P.endPath());
      const embedded=new Map();
      for(const e of d.elements){
        if(e.type==='rect')page.drawRectangle({x:O+e.x*k,y:H-O-(e.y+e.h)*k,width:e.w*k,height:e.h*k,color:color(e.fill)});
        if(e.type==='text'&&e.text.trim())path(C.textPath(e,fonts[e.font]).d,0,0,1,e.fill);
        if(e.type!=='image')continue;
        const a=d.assets[e.asset],b=C.fitImage(e,a);
        if(a.vector){page.pushOperators(P.pushGraphicsState(),P.rectangle(O+b.x*k,H-O-(b.y+b.h)*k,b.w*k,b.h*k),P.clip(),P.endPath());const s=b.w/a.vector.width;for(const v of a.vector.paths)path(v.d,b.x,b.y,s,v.fill,v.stroke,v.strokeWidth,v.opacity,v.rule);page.pushOperators(P.popGraphicsState());continue;}
        if(!embedded.has(e.asset)){
          if(!cms){const img=await image(a.src),cv=canvas(img.naturalWidth,img.naturalHeight);cv.getContext('2d').drawImage(img,0,0);embedded.set(e.asset,{image:await out.embedPng(cv.toDataURL('image/png'))});cv.width=cv.height=1;}
          else{
            const img=await image(a.src),cv=canvas(img.naturalWidth,img.naturalHeight),ctx=cv.getContext('2d',{willReadFrequently:true});ctx.drawImage(img,0,0);const rgba=ctx.getImageData(0,0,cv.width,cv.height).data,n=cv.width*cv.height,ink=new Uint8Array(n*4),alpha=new Uint8Array(n);let hasAlpha=false;
            for(let start=0;start<n;start+=150000){const count=Math.min(150000,n-start),rgb=new Uint8Array(count*3);for(let j=0;j<count;j++){const r=(start+j)*4;rgb.set(rgba.subarray(r,r+3),j*3);alpha[start+j]=rgba[r+3];if(rgba[r+3]!==255)hasAlpha=true;}ink.set(cms.convert(rgb,count),start*4);await new Promise(ok=>setTimeout(ok,0));}
            const mask=hasAlpha?out.context.register(out.context.flateStream(alpha,{Type:'XObject',Subtype:'Image',Width:cv.width,Height:cv.height,ColorSpace:'DeviceGray',BitsPerComponent:8})):undefined;
            const ref=out.context.register(out.context.flateStream(ink,{Type:'XObject',Subtype:'Image',Width:cv.width,Height:cv.height,ColorSpace:'DeviceCMYK',BitsPerComponent:8,...(mask?{SMask:mask}:{})}));embedded.set(e.asset,{ref});cv.width=cv.height=1;
          }
        }
        const im=embedded.get(e.asset);if(im.image)page.drawImage(im.image,{x:O+b.x*k,y:H-O-(b.y+b.h)*k,width:b.w*k,height:b.h*k});
        else{const name=page.node.newXObject('BDImage',im.ref);page.pushOperators(P.pushGraphicsState(),P.concatTransformationMatrix(b.w*k,0,0,b.h*k,O+b.x*k,H-O-(b.y+b.h)*k),P.drawObject(name),P.popGraphicsState());}
      }
      page.pushOperators(P.popGraphicsState());
      const black=d.mode==='cmyk'?P.cmyk(0,0,0,1):P.rgb(0,0,0),xs=[O,O+d.width*k],ys=[O,O+d.height*k];
      for(const x of xs)for(const y of ys){const sx=x<W/2?-1:1,sy=y<H/2?-1:1;page.drawLine({start:{x:x+sx*(B+2)*k,y},end:{x:x+sx*(B+8)*k,y},thickness:.2*k,color:black});page.drawLine({start:{x,y:y+sy*(B+2)*k},end:{x,y:y+sy*(B+8)*k},thickness:.2*k,color:black});}
      return {bytes:await out.save(),page:{width:realW/d.scale,height:realH/d.scale,userUnit:uu},mode:d.mode,profile:cms?.name||null};
    }finally{cms?.close();}
  }
  root.BD_RENDER={fonts,loadFonts,image,canvas,validateAssets,readSVG,vectorSVG,vectorPreview,vectorElement,analyseAsset,render,svgDocument,colourEngine,pdf};
})(window);

/* Persönlicher, versionierter Bandenentwurf. Druckfreigabe und Vertrag bleiben getrennt. */
(function(root){
  'use strict';
  const MAX_PREVIEW=500*1024;
  const codeOK=s=>/^[a-f0-9]{32}$/.test(String(s||''));
  const clone=v=>JSON.parse(JSON.stringify(v));
  const previewOK=s=>typeof s==='string'&&/^data:image\/png;base64,[A-Za-z0-9+/=]+$/.test(s)&&(s.length-22)*.75<=MAX_PREVIEW;
  function editorURL(origin,nonce){if(!/^[a-f0-9]{32}$/.test(nonce))throw Error('Die Editor-Kennung fehlt.');return new URL('/bandenstudio.html#edit='+nonce,origin).href;}
  function editorMessage(e,iframe,nonce,origin){return !!(iframe&&e.source===iframe.contentWindow&&e.origin===origin&&e.data&&e.data.nonce===nonce&&/^bd-editor-/.test(String(e.data.typ||'')));}
  function customerPayload(doc,template,version,C){
    if(template!==null&&!['klar','logo'].includes(template))throw Error('Bitte wähle eine der beiden Gestaltungen.');
    const d=C.normalise(doc),first=d.elements.find(e=>e.type==='image'),p={expected_version:version,template};
    p.logo=first?clone(d.assets[first.asset]):null;return p;
  }
  function textureLayout(doc,size){const W=size?size[1]:doc.width,H=size?size[2]:doc.height,s=Math.min(W/doc.width,H/doc.height);return {W,H,B:0,format:W/10+'x'+H/10,stil:'studio',layout:'gespeichert',ops:[{t:'rect',x:0,y:0,w:W,h:H,fill:doc.background},{t:'img',key:'logo',x:(W-doc.width*s)/2,y:(H-doc.height*s)/2,w:doc.width*s,h:doc.height*s}],info:{warn:[],lesbar:{}},farben:{grund:doc.background}};}
  const rules={codeOK,previewOK,editorURL,editorMessage,customerPayload,textureLayout};
  if(typeof module!=='undefined'&&module.exports){module.exports=rules;return;}
  let cfg=null,project=null,documentNow=null,preview=null,loading=null,loadingError=null,modal=null,editor=null,nonce='',saving=false,previousFocus=null,bodyOverflow='',loadGeneration=0,reloadRequired=false,motiv='haupt',availableMotifs=[],motifFocus=null;
  const $=s=>document.querySelector(s),C=()=>root.BD_CORE,R=()=>root.BD_RENDER;
  const frame=()=>document.getElementById('reiseRahmen');
  const canEdit=()=>!!(project&&(project.bearbeiten===true||project.kundenbearbeitung===true));
  const team=()=>!!(project&&project.team===true&&project.bearbeiten===true);
  const errorText=e=>/failed to fetch|networkerror|load failed|network request failed/i.test(e&&e.message||'')?'Die Verbindung ist unterbrochen. Deine Änderungen bleiben im Editor. Prüfe dein Netz und versuche es erneut.':e&&e.message||'Der Entwurf ist gerade nicht erreichbar. Bitte versuche es erneut.';
  function notify(t){if(cfg&&cfg.toast)cfg.toast(t);}
  function resume(){const f=frame();if(f&&f.contentWindow)f.contentWindow.postMessage({reise:'bande-editor-zu'},location.origin);if(cfg&&cfg.geschlossen)cfg.geschlossen();}
  const motifs=()=>{const list=project&&project.motive||availableMotifs;return Array.isArray(list)?list.filter(m=>m&&['haupt','moerlens'].includes(m.key)&&typeof m.titel==='string').slice(0,2):[];};
  function context(){const f=frame();if(f&&f.contentWindow)f.contentWindow.postMessage({reise:'bande-projekt',vorschau:preview||null,einzel:documentNow?documentNow.width/documentNow.height<4.7:false,bearbeiten:canEdit(),version:project&&project.version||0,motiv,motive:motifs(),busy:!!loading||saving},location.origin);controls();}
  function rpc(fn,args){
    const routes={bandenstudio_projekt_laden:'bandenstudio_motiv_laden',bandenstudio_projekt_speichern:'bandenstudio_motiv_speichern',bandenstudio_kunde_speichern:'bandenstudio_motiv_kunde_speichern'};
    return cfg.rpc(motiv!=='haupt'&&routes[fn]?routes[fn]:fn,motiv!=='haupt'&&routes[fn]?{...args,p_motiv:motiv}:args);
  }
  function controls(){
    const b=$('#bdBearbeiten'),g=$('#bdKundeErlauben'),hint=$('#bdProjektHinweis'),count=$('#bdProjektBestand');
    if(b){b.hidden=!canEdit();b.disabled=saving||!!loading;}
    if(g){g.closest('label').hidden=!(project&&project.kundenfreigabe_darf===true);g.checked=!!(project&&project.kundenbearbeitung);}
    if(hint)hint.textContent=loadingError?'Der gespeicherte Entwurf lässt sich gerade nicht laden. Lade die Seite erneut.':project?'Gespeicherter Entwurf · Version '+project.version+'. Die Druckfreigabe erfolgt separat.':'Euer Entwurf wird geladen …';
    if(count){const s=project&&project.bestand;count.hidden=!(team()&&s);count.textContent=s?'Entwürfe im Bestand: '+s.projekte+' für '+s.aktive_partner+' aktive Präsentationen.':'';}
    for(const id of ['bdLay','bdFmt']){const el=$('#'+id);if(el)el.hidden=!!cfg;}
    const host=$('#bdMotiv')||$('[data-bandenstudio-motive]'),list=motifs();
    if(host){host.hidden=list.length<2;const content=list.map(m=>'<button type="button" data-bd-motiv="'+m.key+'" aria-pressed="'+(m.key===motiv)+'"'+(saving||loading?' disabled':'')+'>'+C().esc(m.titel)+'</button>').join('');
      if(host.innerHTML!==content){host.innerHTML=content;host.querySelectorAll?.('[data-bd-motiv]').forEach(b=>b.onclick=()=>{motifFocus=b.dataset.bdMotiv;changeMotif(b.dataset.bdMotiv);});}
      if(motifFocus&&!loading&&!saving){host.querySelector?.('[data-bd-motiv="'+motifFocus+'"]')?.focus({preventScroll:true});motifFocus=null;}
    }
  }
  async function makeDoc(p){
    if(!C()||!R())throw Error('Das Bandenstudio wird noch geladen. Bitte lade die Seite neu.');
    if(p.quelle!=='generator'&&(p.dokument||p.readDoc))return C().cleanContacts(p.dokument||p.readDoc);
    const g=p.generator;if(!g||typeof g!=='object')throw Error('Für diesen Link liegt noch kein Bandenentwurf vor.');
    let d=C().create(g.firma||''),asset=g.logo;
    d.width=+g.width||2500;d.height=+g.height||800;d.bleed=Number.isFinite(+g.bleed)?+g.bleed:20;d.safe=Number.isFinite(+g.safe)?+g.safe:40;
    if(!asset&&g.logo_aus_praesentation&&cfg&&(cfg.logo||g.logo_url)){
      if(g.logo_url&&!['partner/bb-signet.svg','partner/moerlens-schriftzug.png'].includes(g.logo_url))throw Error('Die Logo-Vorlage ist nicht freigegeben.');
      const src=g.logo_url||(typeof cfg.logo==='function'?cfg.logo():cfg.logo);
      if(src&&(/\.svg(?:[?#]|$)/i.test(src)||/^data:image\/svg\+xml[;,]/i.test(src))){
        const response=await fetch(src);if(!response.ok)throw Error('Das Vektorlogo lässt sich gerade nicht laden.');const vector=R().readSVG(await response.text()),data=await R().vectorPreview(vector);
        asset={name:'Logo der Präsentation',src:data,width:vector.width,height:vector.height,kind:'vector',vector};
      }else if(src&&typeof LOGO!=='undefined'){
        const data=await LOGO.alsDataUrl(src,'original',1800),im=await R().image(data);asset={name:'Logo der Präsentation',src:data,width:im.naturalWidth||im.width,height:im.naturalHeight||im.height,kind:'raster'};
      }
    }
    if(asset){asset=clone(asset);
      if(!asset.vector&&typeof LOGO!=='undefined'&&typeof LOGO.alsDataUrl==='function'){
        const original=asset.original||asset.src,src=await LOGO.alsDataUrl(asset.src,'farbe:'+(g.pattern==='bb'?C().CI.orange:C().CI.marine),1800),im=await R().image(src);
        asset={...asset,original,src,width:im.naturalWidth||im.width,height:im.naturalHeight||im.height,light:false};
      }
      if(typeof R().analyseAsset==='function')asset=await R().analyseAsset(asset)||asset;d.assets.partner_logo=asset;
    }
    d=C().template(d,['klar','logo','kante'].includes(g.template)?g.template:'klar',{name:g.name||g.firma||'',nameAn:g.nameAn===true,pattern:g.pattern||'normal',claim:g.claim||'',asset:asset?'partner_logo':undefined});
    return C().normalise(d);
  }
  async function makePreview(d){
    // Die Vorschau wird aus dem gültigen Dokument erzeugt, nie aus frei übermittelten Kundenpixeln.
    for(const width of [1800,1400,1000,700]){
      const s=Math.min(1,width/d.width),cv=R().canvas(Math.max(1,Math.round(d.width*s)),Math.max(1,Math.round(d.height*s)));
      await R().render(cv.getContext('2d'),d,s);const data=cv.toDataURL('image/png');if(previewOK(data))return data;
    }
    throw Error('Die Vorschau ist zu groß. Bitte vereinfache das Logo und speichere erneut.');
  }
  async function adopt(p,generation){
    if(!p||p.ok===false||!Number.isInteger(p.version))throw Error(p&&p.fehler||'Der Entwurf konnte nicht geladen werden.');
    const d=await makeDoc(p),im=await makePreview(d);if(generation!==loadGeneration)return null;
    project=p;availableMotifs=motifs();documentNow=d;preview=im;loadingError=null;reloadRequired=false;context();if(cfg&&cfg.geaendert)cfg.geaendert(p);return p;
  }
  async function load(){
    if(!cfg||!codeOK(cfg.code))throw Error('Der persönliche Präsentationslink fehlt.');
    if(loading)return loading;const generation=loadGeneration;
    loading=(async()=>{try{return await adopt(await rpc('bandenstudio_projekt_laden',{p_code:cfg.code}),generation);}catch(e){if(generation===loadGeneration){loadingError=e;controls();}throw e;}finally{if(generation===loadGeneration){loading=null;context();}}})();return loading;
  }
  async function changeMotif(key){
    if(key===motiv||saving||loading||modal||!motifs().some(m=>m.key===key))return false;
    const old={motiv,project,documentNow,preview},owner=cfg;availableMotifs=motifs();const generation=++loadGeneration;motiv=key;project=null;loadingError=null;reloadRequired=false;
    try{const work=load();context();await work;return cfg===owner&&generation===loadGeneration;}catch(e){if(cfg!==owner||generation!==loadGeneration)return false;motiv=old.motiv;project=old.project;documentNow=old.documentNow;preview=old.preview;loadingError=null;context();notify(errorText(e));return false;}
  }
  async function prepare(o){
    if(!o||!codeOK(o.code)||typeof o.rpc!=='function')throw Error('Der persönliche Präsentationslink fehlt.');
    if(saving)throw Error('Der aktuelle Entwurf wird noch gespeichert.');if(modal)close();
    ++loadGeneration;cfg=o;motiv=o.motiv==='moerlens'?'moerlens':'haupt';availableMotifs=[];motifFocus=null;project=null;documentNow=null;preview=null;loading=null;loadingError=null;reloadRequired=false;controls();return load();
  }
  async function texture(format){if(loading)await loading;else if(!project)await load();if(!preview||!documentNow)return null;return {L:textureLayout(documentNow,C().FORMATS.find(f=>f[0]===format)),res:{logoBild:await R().image(preview)},projekt:project};}
  async function amSpielfeld(quer=false){
    const generation=loadGeneration;
    if(loading)await loading;else if(!project)await load();
    let doc=documentNow,stand=preview;
    const original=doc,ursprungsbild=stand;
    if(generation!==loadGeneration||!doc||!stand)throw Error('Eure Bandenansicht ist noch nicht verfügbar.');
    const foto=await R().image('partner/r-bande.webp');
    let motiv;
    if(quer&&root.PARTNER_MOTIVLAYOUT){
      const quelle=await root.PARTNER_MOTIVLAYOUT.layout(doc,null);
      if(quelle?.quer){
        doc=await root.PARTNER_MOTIVLAYOUT.grundentwurf(quelle.quer,doc.title,doc.width,doc.height);
        const mass=Math.min(1,1800/doc.width);
        motiv=R().canvas(Math.round(doc.width*mass),Math.round(doc.height*mass));
        await R().render(motiv.getContext('2d'),doc,mass);
      }
    }
    if(!motiv)motiv=await R().image(stand);
    if(documentNow!==original||preview!==ursprungsbild)throw Error('Die Gestaltung wurde zwischenzeitlich geändert.');
    // Befestigungspunkte der beiden Felder im vorhandenen Foto. Für eine Einzelbande
    // sehen wir nur das linke Feld. Typografie und Zeichen behalten ihr Seitenverhältnis.
    const einfach=doc.width/doc.height<4.7;
    const px=foto.naturalWidth,py=foto.naturalHeight,links=.041,rechts=einfach?.496:.961;
    const mitteY=.517,feldW=(rechts-links)*px,feldH=.269*py;
    const mass=Math.min(feldW/doc.width,feldH/doc.height);
    const w=mass*doc.width,h=mass*doc.height;
    const bildbreite=Math.round(px*(einfach?.518:1));
    const bildhoehe=Math.round(bildbreite/(einfach?1.55:2.04));
    const y0=Math.round(mitteY*py-bildhoehe*.50);
    const cv=R().canvas(bildbreite,bildhoehe),ctx=cv.getContext('2d');
    ctx.drawImage(foto,0,-y0);
    ctx.globalCompositeOperation='multiply';
    ctx.imageSmoothingQuality='high';
    ctx.drawImage(motiv,links*px+(feldW-w)/2,mitteY*py-h/2-y0,w,h);
    ctx.globalCompositeOperation='source-over';
    cv.setAttribute('role','img');
    cv.setAttribute('aria-label','Euer Bandenentwurf am Spielfeldrand');
    return cv;
  }
  function close(){
    if(!modal||saving)return;const old=modal;modal=null;editor=null;nonce='';old.remove();document.body.style.overflow=bodyOverflow;
    if(previousFocus&&previousFocus.isConnected)previousFocus.focus({preventScroll:true});previousFocus=null;context();resume();
  }
  function status(t){const e=modal&&modal.querySelector('[data-bd-status]');if(e)e.textContent=t;}
  function post(o){if(editor&&editor.contentWindow)editor.contentWindow.postMessage(Object.assign({nonce},o),location.origin);}
  function sendDocument(){if(!modal||!documentNow)return;const g=project.generator||{};post({typ:'bd-editor-laden',doc:clone(documentNow),rolle:team()?'team':'kunde',vorgaben:{firma:g.firma||documentNow.title,name:g.name||g.firma||documentNow.title,nameAn:g.nameAn===true,pattern:g.pattern||'normal',claim:g.claim||'',format:documentNow.width/10+'x'+documentNow.height/10},version:project.version,template:project.quelle==='generator'&&['klar','logo','kante'].includes(g.template)?g.template:null});status('');}
  async function saveFromEditor(data){
    if(!modal||saving||!canEdit())return;saving=true;status('Entwurf wird gespeichert …');const generation=loadGeneration,oldProject=project,oldDoc=documentNow,oldPreview=preview;
    try{
      let p,fn;
      if(team()){
        const d=C().cleanContacts(data.doc);await R().validateAssets(d);p={expected_version:project.version,dokument:d,vorschau:await makePreview(d)};fn='bandenstudio_projekt_speichern';
      }else{p=customerPayload(data.doc,data.template===undefined?null:data.template,project.version,C());fn='bandenstudio_kunde_speichern';}
      const result=await rpc(fn,{p_code:cfg.code,p});
      if(!result||result.ok===false)throw Error(result&&result.konflikt?'Der Entwurf wurde inzwischen geändert. Deine Änderungen bleiben geöffnet. Schließe mit Abbrechen und öffne den Editor erneut, um den aktuellen Stand zu laden.':result&&(result.fehler||result.hinweis)||'Der Entwurf wurde nicht gespeichert. Deine Änderungen bleiben im Editor.');
      // Der Server liefert den kanonischen Stand. Falls nur die Version geliefert wird, laden wir ihn erneut.
      const canonical=result.generator||result.dokument||result.readDoc?result:await rpc('bandenstudio_projekt_laden',{p_code:cfg.code});
      await adopt(canonical,generation);if(generation!==loadGeneration)return;
      post({typ:'bd-editor-gespeichert',ok:true,version:project.version,doc:clone(documentNow)});saving=false;close();notify('Bandenentwurf gespeichert.');
    }catch(e){
      if(generation!==loadGeneration)return;project=oldProject;documentNow=oldDoc;preview=oldPreview;saving=false;reloadRequired=true;context();status(errorText(e));post({typ:'bd-editor-gespeichert',ok:false,fehler:errorText(e)});
    }
  }
  async function open(o){
    try{if(modal)return;if(o&&o.code&&(!cfg||o.code!==cfg.code))await prepare(o);else if(loading)await loading;else if(!project||reloadRequired)await load();
      if(!canEdit()){notify('Die Bearbeitung ist für diesen Link nicht freigegeben.');resume();return;}if(modal)return;
      const bytes=new Uint8Array(16);crypto.getRandomValues(bytes);nonce=Array.from(bytes,n=>n.toString(16).padStart(2,'0')).join('');
      previousFocus=document.activeElement;bodyOverflow=document.body.style.overflow;document.body.style.overflow='hidden';
      modal=document.createElement('div');modal.className='bd-partner-dialog';modal.innerHTML='<section role="dialog" aria-modal="true" aria-label="Bandenentwurf bearbeiten"><header><div><small>SV/BSC Bandenstudio</small><h2>Eure Bande</h2></div><button type="button" data-bd-close aria-label="Editor schließen">×</button></header><p role="status" aria-live="polite" data-bd-status>Editor wird geladen …</p><iframe title="Bandenentwurf bearbeiten" referrerpolicy="same-origin" sandbox="allow-scripts allow-same-origin allow-downloads"></iframe></section>';
      document.body.appendChild(modal);editor=modal.querySelector('iframe');editor.src=editorURL(location.origin,nonce);modal.querySelector('[data-bd-close]').onclick=close;
      modal.addEventListener('keydown',e=>{if(e.key==='Escape'){e.preventDefault();close();}if(e.key==='Tab'){const first=modal.querySelector('[data-bd-close]');if(document.activeElement===first){e.preventDefault();post({typ:'bd-editor-fokus',ziel:e.shiftKey?'letztes':'erstes'});}else if(document.activeElement===editor){e.preventDefault();first.focus();}}});
      modal.querySelector('[data-bd-close]').focus();
    }catch(e){notify(errorText(e));resume();}
  }
  async function grant(allowed){
    if(!project||project.kundenfreigabe_darf!==true)return;const old=!!project.kundenbearbeitung,el=$('#bdKundeErlauben');if(el)el.disabled=true;
    try{const p=await cfg.rpc('bandenstudio_kunde_erlauben',{p_code:cfg.code,p_erlaubt:allowed});if(!p||p.ok===false)throw Error(p&&p.fehler||'Die Freigabe wurde nicht gespeichert.');await load();notify(allowed?'Der Kunde darf Logo und Anordnung bearbeiten.':'Die Kundenbearbeitung ist ausgeschaltet.');return true;}
    catch(e){project.kundenbearbeitung=old;controls();notify(errorText(e));return false;}finally{if(el)el.disabled=false;}
  }
  function bind(){const b=$('#bdBearbeiten'),g=$('#bdKundeErlauben');if(b)b.onclick=()=>open();if(g)g.onchange=()=>grant(g.checked);controls();}
  root.addEventListener('message',e=>{
    if(editorMessage(e,editor,nonce,location.origin)){
      if(e.data.typ==='bd-editor-bereit')sendDocument();
      else if(e.data.typ==='bd-editor-fokus'&&e.data.ziel==='schliessen'&&modal)modal.querySelector('[data-bd-close]').focus();
      else if(e.data.typ==='bd-editor-speichern')saveFromEditor(e.data);
      else if(e.data.typ==='bd-editor-abbrechen')close();return;
    }
    const f=frame();if(!cfg||!f||e.source!==f.contentWindow||e.origin!==location.origin||!e.data)return;
    if(e.data.reise==='bereit')context();
    if(e.data.reise==='bande-editor-oeffnen'){if(canEdit()&&!loading)open();else resume();}
    if(e.data.reise==='bande-motiv-waehlen'&&typeof e.data.motiv==='string')changeMotif(e.data.motiv);
  });
  root.PD_BANDENSTUDIO={vorbereiten:prepare,oeffnen:open,textur:texture,amSpielfeld,rahmenBereit:context,anbinden:bind,kundenfreigabe:grant,motivWaehlen:changeMotif,geladen:()=>!!project,regeln:rules};
})(typeof window!=='undefined'?window:globalThis);

/* Explicit one-use same-origin handoff; no private data in URL or browser history. */
(function(){
  'use strict';
  window.BD_STUDIO_START=function(brief={}){
    const nonce=Array.from(crypto.getRandomValues(new Uint8Array(16)),b=>b.toString(16).padStart(2,'0')).join('');
    const child=window.open('bandenstudio.html#transfer='+nonce,'_blank');
    if(!child){if(typeof kToast==='function')kToast('Bitte erlaube das Öffnen des Bandenstudios in einem neuen Tab.');return;}
    const input={firma:String(brief.firma||'').slice(0,120),format:String(brief.format||'300x80'),logo:typeof brief.logo==='string'?brief.logo:''};
    let used=false;const timeout=setTimeout(()=>removeEventListener('message',receive),180000);
    async function receive(e){
      if(used||e.origin!==location.origin||e.source!==child||e.data?.typ!=='bandenstudio-bereit'||e.data.nonce!==nonce)return;
      used=true;clearTimeout(timeout);removeEventListener('message',receive);
      const payload={firma:input.firma,format:input.format};
      try{
        let src=input.logo;
        if(src&&!src.startsWith('data:')){
          const u=new URL(src,location.href);if(u.origin!==location.origin||!/^\/(?:[^/?]+\/)?(?:partner|kit|banden)\//.test(u.pathname))throw Error('Bitte die Logo-Originaldatei im Studio laden.');
          const r=await fetch(u,{credentials:'omit'});if(!r.ok)throw Error('Das Logo lässt sich nicht übernehmen.');const b=await r.blob();if(b.size>20*1024*1024)throw Error('Bitte das große Logo direkt im Studio laden.');src=await new Promise((ok,no)=>{const f=new FileReader();f.onload=()=>ok(f.result);f.onerror=no;f.readAsDataURL(b);});
        }
        if(/^data:image\/(png|jpeg|webp);base64,[A-Za-z0-9+/=]+$/.test(src)&&src.length<=28*1024*1024)payload.logo=src;
        else if(/^data:image\/svg\+xml;base64,[A-Za-z0-9+/=]+$/.test(src)&&src.length<4*1024*1024)payload.logoSVG=new TextDecoder().decode(Uint8Array.from(atob(src.split(',')[1]),c=>c.charCodeAt(0)));
      }catch(er){if(typeof kToast==='function')kToast(er.message||'Das Studio ist offen. Bitte das Logo dort laden.');}
      if(!child.closed)child.postMessage({typ:'bandenstudio-start',nonce,brief:payload},location.origin);
    }
    addEventListener('message',receive);
  };
})();

/* Firmenentwürfe bleiben am persönlichen Partnerprojekt, freie neue Entwürfe auf dem Gerät. */
{
  const vorher=bcGestalten;
  bcGestalten=function(I){
    const result=vorher.apply(this,arguments);if(!I||I.querySelector('[data-bandenstudio]'))return result;
    const f=bcFirmen().find(x=>x.key===BC.firmaKey),key=BC.firmaKey,sponsor=BC.sponsor||null;
    const chooser=I.querySelector('#bcFirma'),onchange=chooser&&chooser.onchange;
    if(chooser)chooser.onchange=function(e){if(onchange)onchange.call(this,e);bcGestalten(I);};
    if(I.classList)I.classList.toggle('bd-creator-hat-projekt',!!f);
    const section=document.createElement('section');section.className='pz-tc-block bd-creator-projekt';section.innerHTML=f?'<h3>Gespeicherter Bandenentwurf</h3><div class="bd-motive" role="group" aria-label="Bandenmotiv" data-bandenstudio-motive hidden></div><div class="bd-creator-vorschau"><canvas role="img" aria-label="Gespeicherter Bandenentwurf"></canvas><button type="button" class="bd-bearbeiten" data-bandenstudio hidden>Bearbeiten</button></div><p class="pz-tc-tipp" role="status" data-bandenstudio-status>Entwurf wird geladen …</p><label class="bd-kundenfreigabe" hidden><input type="checkbox" data-bandenstudio-grant>Kunde darf Logo und Anordnung bearbeiten</label><button type="button" class="btn ghost" data-bandenstudio-retry hidden>Erneut laden</button>':'<h3>Freies Bandenstudio</h3><p class="pz-tc-tipp">Logo freistellen, Texte und Flächen gestalten. Dieser Entwurf bleibt auf deinem Gerät. Wähle oben eine Firma, um deren gespeicherten Entwurf zu öffnen.</p><button type="button" class="btn" data-bandenstudio>Lokalen Entwurf öffnen</button>';
    (I.querySelector('.pz-tc-links')||I).appendChild(section);
    const button=section.querySelector('[data-bandenstudio]');
    if(!f){button.onclick=()=>{const s=bcSpecVoll(),l=bcLogo();window.BD_STUDIO_START({firma:s.firma||s.name,web:s.web,format:s.format,logo:l?.bild||''});};return result;}
    const hint=section.querySelector('[data-bandenstudio-status]'),retry=section.querySelector('[data-bandenstudio-retry]'),grant=section.querySelector('[data-bandenstudio-grant]');let options=null,shown=null;
    const current=()=>I.isConnected&&section.isConnected&&BC.firmaKey===key&&(BC.sponsor||null)===sponsor;
    const draw=async p=>{if(!current())return;if(p)shown=p;const texture=await window.PD_BANDENSTUDIO.textur();if(!current()||!texture)return;BANDE.szene(section.querySelector('canvas'),{haupt:{L:texture.L,res:texture.res}});button.hidden=!(shown&&(shown.bearbeiten||shown.kundenbearbeitung));grant.closest('label').hidden=!(shown&&shown.kundenfreigabe_darf);grant.checked=!!(shown&&shown.kundenbearbeitung);hint.textContent='Bei dieser Firma gespeichert · Version '+(shown&&shown.version||'')+'. Die Druckfreigabe erfolgt separat.';};
    const load=async()=>{button.hidden=true;retry.hidden=true;hint.textContent='Entwurf wird geladen …';try{
      if(!window.PD_BANDENSTUDIO)throw Error('Das Bandenstudio lässt sich gerade nicht laden. Bitte lade die App neu.');
      const neben=/^(?:bb\s*berns\s*&\s*baltz\s*[·-]\s*)?m[öo]rlens$/i.test(f.firma.trim());
      const r=await bcRpc('bandenstudio_firma_finden',{p_sponsor:neben?null:sponsor,p_firma:neben?'BB Berns&Baltz':f.firma});if(!current())return;
      if(!r||r.ok===false||!/^[a-f0-9]{32}$/.test(String(r.code||'')))throw Error(r&&(r.hinweis||r.fehler)||'Die Firma lässt sich gerade nicht zuordnen.');
      options={code:r.code,motiv:neben?'moerlens':'haupt',rpc:bcRpc,intern:()=>true,logo:()=>r.praesentation_logo||bcLogo()?.bild||null,toast:kToast,geaendert:p=>{draw(p).catch(()=>{});},geschlossen:()=>{draw().catch(()=>{});}};
      shown=await window.PD_BANDENSTUDIO.vorbereiten(options);if(current())await draw(shown);
    }catch(e){if(!current())return;hint.textContent=e.message||'Der Entwurf lässt sich gerade nicht laden.';retry.hidden=false;}};
    button.onclick=()=>{if(current()&&options)window.PD_BANDENSTUDIO.oeffnen(options);};retry.onclick=load;
    grant.onchange=async()=>{if(!current()||!shown?.kundenfreigabe_darf)return;const before=!!shown.kundenbearbeitung;grant.disabled=true;try{const ok=await window.PD_BANDENSTUDIO.kundenfreigabe(grant.checked);if(ok===false&&current())grant.checked=before;}finally{grant.disabled=false;}};
    if(window.ResizeObserver){const observer=new ResizeObserver(()=>{if(current()&&shown)draw().catch(()=>{});else if(!current())observer.disconnect();});observer.observe(section.querySelector('.bd-creator-vorschau'));}
    load();return result;
  };
}

/* Veo: überprüfte Werte im bestehenden Spielerkonto, kein neuer CA-Score. */
const VL = {d:null,team:null,metric:'distance_m',period:'month',badgeTier:'silber',mode:'total',model:null,seq:0};
const VL_MET = {distance_m:['Laufstrecke','laufmonster','m'],top_speed_kmh:['Höchsttempo','rakete','km/h'],goals:['Tore','torjaeger',''],assists:['Vorlagen','vorbereiter',''],ga:['Tore + Vorlagen','scorer',''],sprints:['Sprints','rakete',''],recoveries:['Balleroberungen','balljaeger',''],saves:['Paraden','rueckhalt','']};
const vlE = x => svEsc(String(x == null ? '' : x));
const VL_TIERS = {
  bronze:{name:'Bronze',zeit:'Spiel',text:'Eine starke Leistung im einzelnen Spiel.'},
  silber:{name:'Silber',zeit:'Monat',text:'Sehr gute Leistung über einen ganzen Monat.'},
  gold:{name:'Gold',zeit:'Jahr',text:'Überragende Leistung im Jahresvergleich.'},
  platin:{name:'Platin',zeit:'Meilenstein',text:'Die höchste Stufe für besondere langfristige Leistungen.'}
};
function vlBadge(motiv,stufe,label){
  const tier=Object.hasOwn(VL_TIERS,stufe)?stufe:'bronze';
  const icon=['laufmonster','rakete','torjaeger','vorbereiter','scorer','balljaeger','rueckhalt','bestmarke','jaguar','motor','spielmacher','sicherer_halt','kopfball','kraftpaket'].includes(motiv)?motiv:'bestmarke';
  return `<span class="vl-medaille vl-medaille-${tier}" role="img" aria-label="${vlE(label+' · '+VL_TIERS[tier].name)}"><span class="vl-praegung" aria-hidden="true"></span><img class="vl-motiv" src="veo/gravur-${icon}.webp" width="120" height="120" alt=""><span class="vl-rangzeichen" aria-hidden="true">${{bronze:"I",silber:"II",gold:"III",platin:"IV"}[tier]}</span></span>`;
}
function vlAuszeichnungen(){const tier=VL_TIERS[VL.badgeTier]||VL_TIERS.silber;
  return `<section class="card"><h3>Deine nächsten Auszeichnungen</h3><p>Vier Stufen, vom starken Spiel bis zum besonderen Meilenstein.</p><div class="vl-stufen" role="group" aria-label="Auszeichnungsstufe ansehen">${Object.entries(VL_TIERS).map(([k,t])=>`<button type="button" class="vl-stufe vl-stufe-${k}" data-vl-tier="${k}" aria-pressed="${k===VL.badgeTier}">${vlBadge('laufmonster',k,t.name)}<b>${t.name}</b><span>${t.zeit}</span></button>`).join('')}</div><p class="vl-stufen-text"><strong>${tier.name}: ${tier.zeit}.</strong> ${tier.text}</p><div class="vl-badges">${[...Object.entries(VL_MET).filter(([k])=>k!=='sprints').map(([,m])=>[m[1],m[0]]),['bestmarke','Persönliche Bestmarke']].map(([icon,name])=>`<div>${vlBadge(icon,VL.badgeTier,name)}<b>${name}</b><small>${tier.name} · ${tier.zeit}</small></div>`).join('')}</div><p class="note">Vorschau, noch nicht vergeben. Kriterien und geprüfter Zeitraumabschluss müssen vor der ersten Vergabe feststehen. Platin ist kein automatisches Upgrade für die meisten Einsätze. Auch persönliche Fortschritte zählen.</p></section>`;
}

function vlSkills(){return '<section class="card vl-skills"><h3>Skills, die bleiben</h3><p>Jaguar, Kopfballmonster oder Strafraumchef: Entdecke deine Ziele und deine freigeschalteten Skills in Bronze, Silber und Gold. Die Schwelle liefert den Vorschlag, Lukas entscheidet.</p><button class="btn" type="button" onclick="goTab(&quot;skills&quot;)">Spieler-Skills ansehen</button></section>';}
function vlZeitraum(){const now=new Date(),today=new Intl.DateTimeFormat('sv-SE',{timeZone:'Europe/Berlin'}).format(now),y=+today.slice(0,4),m=+today.slice(5,7);
  return {from:VL.period==='year'?y+'-01-01':VL.period==='season'?(y-(m<7?1:0))+'-07-01':today.slice(0,7)+'-01',to:today};}
async function vlRpc(fn,args){const r=await SVB.sb.rpc(fn,args);if(r.error)throw new Error(r.error.message);return r.data;}
function vlPanel(){let p=document.getElementById('panel-leistung');if(!p){p=document.createElement('section');p.id='panel-leistung';p.className='panel';document.getElementById('panel-home').parentNode.appendChild(p);}return p;}
async function vlLaden(){const p=vlPanel(),seq=++VL.seq;VL.team=VL.team||(SK96.d&&SK96.d.ich&&SK96.d.ich.team)||'1';
  p.innerHTML='<div class="card"><h2>Deine Leistung</h2><p>Spielwerte werden geladen …</p></div>';
  try{const z=vlZeitraum();const [d,model]=await Promise.all([vlRpc('veo_laden',{p_team:VL.team,p_von:z.from,p_bis:z.to}),import('./veo/model.mjs')]);if(seq!==VL.seq)return;VL.d=d;VL.model=model;vlZeigen();}
  catch(e){if(seq!==VL.seq)return;p.innerHTML='<div class="card"><h2>Leistungswerte noch nicht verfügbar</h2><p>'+vlE(e.message)+'</p><button class="btn" id="vlRetry">Erneut laden</button></div>';p.querySelector('#vlRetry').onclick=vlLaden;}}
function vlZeigen(){const p=vlPanel(),d=VL.d,z=vlZeitraum(),meta=VL_MET[VL.metric],r=VL.model.leaderboard(d.werte,{teamId:VL.team,...z,asOf:new Date().toISOString(),metric:VL.metric,mode:VL.mode,period:VL.period});
  const names=new Map(d.spieler.map(x=>[x.id,x.name]));p.innerHTML=`<div class="vl"><div class="card"><h2>Deine Leistung</h2><p>Geprüfte Werte deiner Mannschaft.</p><div class="vl-filter">
  <label>Mannschaft<select id="vlTeam">${d.teams.map(t=>`<option value="${vlE(t)}"${t===VL.team?' selected':''}>${vlE(t)}. Mannschaft</option>`).join('')}</select></label>
  <label>Zeitraum<select id="vlPeriod">${[['month','Dieser Monat'],['year','Dieses Jahr'],['season','Diese Saison']].map(([v,t])=>`<option value="${v}"${v===VL.period?' selected':''}>${t}</option>`).join('')}</select></label>
  <label>Wert<select id="vlMetric">${Object.entries(VL_MET).map(([k,m])=>`<option value="${k}"${k===VL.metric?' selected':''}>${m[0]}</option>`).join('')}</select></label>
  <label>Vergleich<select id="vlMode"><option value="total">${VL.metric==='top_speed_kmh'?'Bestwert':'Gesamt'}</option>${VL.metric==='top_speed_kmh'?'':'<option value="per90"'+(VL.mode==='per90'?' selected':'')+'>Je 90 Minuten</option>'}</select></label></div></div>
  <section class="card"><div class="vl-head"><img src="veo/gravur-${meta[1]}.webp" alt="" width="92" height="92"><div><h3>${meta[0]}</h3><p>${z.from.split('-').reverse().join('.')} bis ${z.to.split('-').reverse().join('.')}</p></div></div>
  ${r.ranked.length?`<ol class="vl-list">${r.ranked.map(x=>`<li><b>${x.rank}.</b><span>${vlE(names.get(x.playerId)||'Zuordnung offen')}<small>${x.games} Spiele${x.partial?' · Werte fehlen':''}</small></span><strong>${x.value.toLocaleString('de-DE')} ${meta[2]}</strong></li>`).join('')}</ol>`:'<h3>Noch keine geprüften Werte</h3><p>Nach der ersten ausgewerteten Aufnahme prüft das Trainerteam die Zuordnung und Messwerte. Dann erscheint hier die Rangliste.</p>'}
  <p class="note">Zwischenstand der erfassten Spiele, noch kein Monats- oder Jahressieger. Fehlende Aufnahmen zählen nicht als null. Laufwerte beruhen auf Videoanalyse, nicht auf GPS. Verletzungen und fehlende Einsatzzeit verschlechtern deinen Spielerscore hier nicht.</p>
  ${r.pending.length?`<details><summary>${r.pending.length} Zuordnungen noch ohne vergleichbaren Wert</summary>${r.pending.map(x=>`<p>${vlE(names.get(x.playerId)||'Spieler')}: ${vlE(x.reasons.join(', '))}</p>`).join('')}</details>`:''}</section>
  ${vlAuszeichnungen()}
  ${vlSkills()}
  <section class="card"><h3>Erfasste Spiele</h3>${d.spiele.length?d.spiele.map(g=>`<p><a target="_blank" rel="noopener noreferrer" href="${vlE(g.quelle)}">${vlE(g.datum)} · Veo-Aufnahme</a> · Stand ${g.revision}${d.pflegen?` <button class="btn ghost" data-vl-edit="${vlE(g.spiel)}">Prüfen</button>`:''}</p>`).join(''):'<p>Noch kein Spiel erfasst.</p>'}${d.pflegen?'<button class="btn" id="vlNeu">Spielwerte erfassen</button><p class="note">Manuelle Übernahme aus der Veo-Aufnahme. Ein automatischer Veo-Abgleich ist noch nicht verbunden.</p>':''}</section></div>`;
  p.querySelectorAll('[data-vl-tier]').forEach(b=>b.onclick=()=>{VL.badgeTier=b.dataset.vlTier;vlZeigen();p.querySelector('[data-vl-tier="'+VL.badgeTier+'"]').focus();});
  p.querySelector('#vlTeam').onchange=e=>{VL.team=e.target.value;vlLaden();};p.querySelector('#vlPeriod').onchange=e=>{VL.period=e.target.value;vlLaden();};
  p.querySelector('#vlMetric').onchange=e=>{VL.metric=e.target.value;if(VL.metric==='top_speed_kmh')VL.mode='total';vlZeigen();};p.querySelector('#vlMode').onchange=e=>{VL.mode=e.target.value;vlZeigen();};
  p.querySelectorAll('[data-vl-edit]').forEach(b=>b.onclick=()=>vlForm(b.dataset.vlEdit));const neu=p.querySelector('#vlNeu');if(neu)neu.onclick=()=>vlForm();}
function vlTabelle(m,rows,draw){
  const box=m.querySelector('#vlTable');let pending=null;
  box.innerHTML=`<details><summary>Mehrere Spieler aus einer Tabelle übernehmen</summary><p>Unsere Vereinsvorlage für manuell übertragene Werte. Kein automatischer Veo-Export. Kopiere die Kopfzeile und Werte aus Excel oder einer Semikolon-Tabelle hierher.</p><button class="btn ghost" type="button" id="vlTemplate">Leere CSV-Vorlage herunterladen</button><p class="note">Laufstrecke in Metern, Tempo in km/h. Dezimalkomma oder Dezimalpunkt, keine Tausendertrennzeichen. Leere Felder bleiben unbekannt. Rückennummern helfen nur hier beim Zuordnen und werden nicht gespeichert. Die Originaltabelle wird nicht gespeichert. Nach dem Ergänzen wird das Eingabefeld geleert.</p><label for="vlPaste">Tabelle mit Überschriften</label><textarea id="vlPaste" rows="6" maxlength="60000" spellcheck="false"></textarea><button class="btn" type="button" id="vlPreview">Tabelle prüfen</button><div id="vlPreviewResult" aria-live="polite"></div><p id="vlTableError" role="alert"></p></details>`;
  const preview=box.querySelector('#vlPreviewResult'),error=box.querySelector('#vlTableError'),input=box.querySelector('#vlPaste');
  const clear=()=>{pending=null;preview.innerHTML='';error.textContent='';};input.oninput=clear;
  box.querySelector('#vlTemplate').onclick=async()=>{try{const mod=await import('./veo/table.mjs');const url=URL.createObjectURL(new Blob(['\uFEFF'+mod.template],{type:'text/csv;charset=utf-8'})),a=document.createElement('a');a.href=url;a.download='SVBSC-Spielwerte-leer.csv';a.click();setTimeout(()=>URL.revokeObjectURL(url),1000);}catch(e){error.textContent='Vorlage nicht verfügbar. Bitte erneut versuchen.';}};
  box.querySelector('#vlPreview').onclick=async()=>{const button=box.querySelector('#vlPreview'),text=input.value;button.disabled=true;clear();try{
    const mod=await import('./veo/table.mjs');if(!box.isConnected||input.value!==text)return;
    const parsed=mod.parseTable(text);if(rows.length+parsed.length>30)throw Error('Zusammen mit den vorhandenen Zeilen sind höchstens 30 Spieler möglich. Entferne zuerst nicht benötigte Zeilen.');pending=parsed;
    preview.innerHTML=`<h3>${parsed.length} Spielerzeilen bereit</h3><p>Vorhandene Zeilen bleiben erhalten. Ordne anschließend jede Rückennummer einem Spieler zu und prüfe die Werte an der Veo-Aufnahme. Es ist noch nichts gespeichert.</p><ul>${parsed.map(r=>`<li>Nr. ${r.jersey}: ${Object.entries(r.metrics).filter(([,v])=>v!==null).map(([k,v])=>vlE(VL_MET[k][0]+': '+v.toLocaleString('de-DE')+' '+VL_MET[k][2])).join(' · ')}</li>`).join('')}</ul><button class="btn" type="button" id="vlAppend">Zeilen zum Prüfen ergänzen</button>`;
    preview.querySelector('#vlAppend').onclick=()=>{if(!pending)return;if(rows.length+pending.length>30){error.textContent='Inzwischen sind weitere Spieler hinzugekommen. Bitte die Tabelle erneut prüfen.';return;}const start=rows.length;rows.push(...pending);clear();input.value='';draw();box.querySelector('details').open=false;m.querySelector('[data-row="'+start+'"] select').focus();};
  }catch(e){error.textContent=e.message;}finally{button.disabled=false;}};
}
function vlForm(id){const team=VL.team,old=VL.d.spiele.find(g=>g.spiel===id),rows=old?VL.d.werte.filter(x=>x.matchId===id).map(x=>JSON.parse(JSON.stringify(x))):[];
  const first=rows[0]||{},m=svModal(`<div class="vl"><h2>${old?'Spielwerte prüfen':'Spielwerte erfassen'}</h2><p>Übernimm ausschließlich Werte aus der Aufnahme. Leeres Feld bedeutet unbekannt.</p><label>Veo-Aufnahme<input id="vlSource" type="url" value="${vlE(old&&old.quelle)}" placeholder="https://app.veo.co/…"></label><label>Spieldatum<input id="vlDate" type="date" value="${vlE(old&&old.datum)}"></label><label>Wettbewerb<select id="vlComp"><option value="league">Liga</option><option value="cup"${first.competition==='cup'?' selected':''}>Pokal</option></select></label><div id="vlTable"></div><div id="vlRows"></div><button class="btn ghost" id="vlAdd">Spieler hinzufügen</button><p id="vlError" role="alert"></p><p>Beim Speichern entsteht eine neue Fassung dieses Spiels. Prüfe alle Spieler und Werte vor der Übernahme.</p><button class="btn" id="vlSave">Geprüfte Fassung speichern</button><button class="btn ghost" id="vlCancel">Abbrechen</button></div>`);
  const flags={identityConfirmed:'Spieler und Rückennummer geprüft',periodsConfirmed:'Spielhälften und Seiten geprüft',eventsReviewed:'Tore, Vorlagen und Ereignisse geprüft',physicalReviewed:'Laufwerte geprüft',speedReviewed:'Tempospitze im Video geprüft'};
  const draw=()=>{m.querySelector('#vlRows').innerHTML=rows.map((r,i)=>`<fieldset data-row="${i}"><legend>Spieler ${i+1}${r.jersey!=null?' · Rückennummer '+vlE(r.jersey):''}</legend><label>Name<select data-field="playerId"><option value="">Bitte zuordnen</option>${VL.d.spieler.map(p=>`<option value="${vlE(p.id)}"${p.id===r.playerId?' selected':''}>${vlE(p.name)}</option>`).join('')}</select></label><div class="vl-grid">${[['minutesPlayed','Einsatzminuten'],['minutesTracked','Trackingminuten'],...Object.entries(VL_MET).filter(([k])=>k!=='ga').map(([k,v])=>[k,v[0]+(v[2]?' ('+v[2]+')':'')])].map(([k,t])=>`<label>${t}<input type="number" min="0" step="any" data-field="${k}" value="${vlE(k.startsWith('minutes')?r[k]:(r.metrics||{})[k])}"></label>`).join('')}</div>${Object.entries(flags).map(([k,t])=>`<label class="vl-check"><input type="checkbox" data-field="${k}"${r[k]===true?' checked':''}>${t}</label>`).join('')}<label class="vl-check"><input type="checkbox" data-field="qualityClear"${r.reducedAccuracy===false&&r.physicalFlagged===false?' checked':''}>Keine reduzierte Genauigkeit oder auffälligen Laufwerte</label><button class="btn ghost" data-remove="${i}">Aus dieser Fassung entfernen</button></fieldset>`).join('');
    m.querySelectorAll('[data-row]').forEach(el=>{const r=rows[+el.dataset.row];el.querySelectorAll('[data-field]').forEach(input=>input.onchange=()=>{const k=input.dataset.field;if(k==='qualityClear'){r.reducedAccuracy=!input.checked;r.physicalFlagged=!input.checked;}else if(input.type==='checkbox')r[k]=input.checked;else if(k==='playerId'){r[k]=input.value;r.identityConfirmed=false;el.querySelector('[data-field=identityConfirmed]').checked=false;}else{const value=input.value===''?null:Number(input.value);if(k.startsWith('minutes'))r[k]=value;else(r.metrics||(r.metrics={}))[k]=value;}});});m.querySelectorAll('[data-remove]').forEach(b=>b.onclick=()=>{rows.splice(+b.dataset.remove,1);draw();});};
  m.querySelector('#vlAdd').onclick=()=>{if(rows.length<30){rows.push({metrics:{}});draw();}};m.querySelector('#vlCancel').onclick=()=>closeOverlay();
  m.querySelector('#vlSave').onclick=async()=>{const b=m.querySelector('#vlSave');b.disabled=true;try{let url;try{url=new URL(m.querySelector('#vlSource').value);}catch(e){throw new Error('Bitte einen gültigen Veo-Aufnahme-Link eintragen.');}const keys=['playerId','minutesPlayed','minutesTracked','metrics',...Object.keys(flags),'reducedAccuracy','physicalFlagged'];
    if(url.protocol!=='https:'||url.hostname!=='app.veo.co'||url.username||url.password||url.search||url.hash||url.pathname==='/')throw new Error('Bitte den direkten Veo-Link ohne Zusatzparameter angeben.');
    await vlRpc('veo_speichern',{p_team:team,p_spiel:old?old.spiel:url.pathname.replace(/\/+$/,''),p_datum:m.querySelector('#vlDate').value,p_quelle:url.href,p_wettbewerb:m.querySelector('#vlComp').value,p_erwartet:old?old.revision:0,p_werte:rows.map(r=>Object.fromEntries(keys.filter(k=>r[k]!==undefined).map(k=>[k,r[k]])))});closeOverlay();vlLaden();}catch(e){m.querySelector('#vlError').textContent=e.message;b.disabled=false;}};draw();vlTabelle(m,rows,draw);}
{const old=sk96Render;sk96Render=function(){const r=old.apply(this,arguments),p=sk96Panel();if(sk96Darf()&&!p.querySelector('#vlOpen')){const b=document.createElement('button');b.className='btn';b.id='vlOpen';b.textContent='Leistung & Auszeichnungen';b.onclick=()=>goTab('leistung');p.prepend(b);}return r;};}
SV_TBL.leistung=['award','Leistung'];SV_PAGES.leistung=['Deine Leistung','Geprüfte Spielwerte und Team-Ranglisten'];try{SVR_TAB.leistung=null;}catch(e){}
{const old=svTabAllowed;svTabAllowed=function(t){return t==='leistung'?sk96Darf():old.apply(this,arguments);};}
{const old=goTab;goTab=function(t){if(t==='leistung')vlPanel();const r=old.apply(this,arguments);if(t==='leistung'&&svCurTab()==='leistung')vlLaden();return r;};}

/* Dauerhafte Skills: Server entscheidet über Rechte und Vorschläge. */
const SS225={data:null,team:null,player:null,edit:false,filter:'Alle',catalogAll:false,seq:0,busy:false,actor:null,drafts:new Map(),qualityDrafts:new Map()};
const ss225Tier=n=>['Gesperrt','Bronze','Silber','Gold'][n]||'Gesperrt';
function ss225Panel(){let p=document.getElementById('panel-skills');if(!p){p=document.createElement('section');p.id='panel-skills';p.className='panel';document.getElementById('panel-home').parentNode.appendChild(p);}return p;}
async function ss225Load(){const seq=++SS225.seq,p=ss225Panel();SS225.data=null;SS225.edit=false;
  SS225.team=SS225.team||(SK96.d&&SK96.d.ich&&SK96.d.ich.team)||'1';
  p.innerHTML='<div class="vl card"><h2>Spieler-Skills</h2><p>Deine Ziele werden geladen …</p></div>';
  try{const d=await vlRpc('skills_laden',{p_team:SS225.team});if(seq!==SS225.seq)return;
    if(!d||!Array.isArray(d.spieler)||!Array.isArray(d.katalog))throw new Error('Die Skills konnten nicht geladen werden. Bitte erneut versuchen.');
    if(SS225.player&&!d.spieler.some(x=>x.id===SS225.player))throw new Error('Dieser Spieler ist dieser Mannschaft nicht zugeordnet. Öffne die Skills über dein Spielerkonto oder wähle die richtige Mannschaft.');
    if(SS225.actor!==d.konto){SS225.drafts.clear();SS225.qualityDrafts.clear();SS225.actor=d.konto;}SS225.data=d;if(!SS225.player)SS225.player=d.spieler.some(x=>x.id===d.ich)?d.ich:d.spieler[0]?.id||null;
    ss225Render();
  }catch(e){if(seq!==SS225.seq)return;p.innerHTML='<div class="vl card"><h2>Skills noch nicht verfügbar</h2><p>'+vlE(e.message)+'</p><button class="btn" id="ss225Retry">Erneut laden</button></div>';p.querySelector('button').onclick=ss225Load;}
}
function ss225Ziel(k,i){const t=k.ziele[i],art=k.art;return art==='speed'?t.toLocaleString('de-DE')+' km/h in '+k.spiele+' Spielen':art==='distance'?(t/1000).toLocaleString('de-DE')+' km je 90 Trackingminuten in '+k.spiele+' Spielen':art==='assists'?t+' Torvorlagen in mindestens '+k.spiele+' Spielen':art==='saves'?t+' Paraden in mindestens '+k.spiele+' Spielen':t+' von Lukas bestätigte Pflichtspiele nach dem Kriterium unten';}
function ss225Progress(k,s){const b=s.nachweis;if(!b||!b.erfasst)return 'Noch keine passenden geprüften Belege. Fehlende Werte sind unbekannt.';
  if(k.art==='speed'||k.art==='distance')return b.anzahl.map((n,i)=>ss225Tier(i+1)+': '+n+' von '+k.spiele+' Spielen').join(' · ');
  return Number(b.gesamt).toLocaleString('de-DE')+' '+(k.art==='observation'?'bestätigte Spiele':k.art==='assists'?'Vorlagen':'Paraden')+' · '+b.spiele+' Spiele';}
function ss225Card(k,s){const d=SS225.data,edit=d.pflegen&&SS225.edit,tier=['bronze','silber','gold'][Math.max(0,s.stufe-1)];
  return `<article data-ss-skill="${vlE(k.id)}"><div class="ss225-emblem ${s.stufe?'':'ss225-locked'}">${s.stufe?vlBadge(k.icon,tier,k.name):vlBadge(k.icon,tier,k.name).replace('aria-label="'+vlE(k.name+' · Bronze')+'"','aria-label="'+vlE(k.name+' · noch gesperrt')+'"')}</div><small>${vlE(k.position)} · dauerhaft</small><h3>${vlE(k.name)}</h3><b>${ss225Tier(s.stufe)}</b>${s.zeit&&s.stufe?'<small>Zuletzt geprüft am '+vlE(new Date(s.zeit).toLocaleDateString('de-DE'))+'</small>':''}
  ${s.passend===false?'<p class="ss225-proposal">Für deine hinterlegte Position nicht freischaltbar.</p>':''}
  ${s.vorschlag?'<p class="ss225-proposal"><strong>Belegschwelle erreicht: '+ss225Tier(s.vorschlag)+'</strong><br>'+ (d.pflegen?'Qualität noch offen. Lukas bewertet diese Stufe.':'Lukas prüft die Freischaltung.')+'</p>':''}
  ${s.pruefung?'<p class="ss225-proposal">Position, Regeln oder Belege haben sich geändert. Lukas prüft den bestehenden Skill erneut.</p>':''}
  <details><summary>Ziele & Belege ansehen</summary><p>Vereinsziele, Fassung ${k.version}. Die Belegmenge öffnet die Prüfung. Erst die Qualität rechtfertigt die Stufe, keine Veo-Benchmarks.</p>${k.version>=2?'<div class="ss227-tiers">'+['bronze','silber','gold'].map(t=>vlBadge(k.icon,t,k.name)).join('')+'</div><p>Bronze: besondere Stärke. Silber: unter Druck herausragend. Gold: seltene Ausnahmefähigkeit. Gold muss nicht vergeben sein.</p>':''}<ol>${k.ziele.map((_,i)=>'<li><b>'+ss225Tier(i+1)+':</b> '+vlE(ss225Ziel(k,i))+(k.qualitaet?'<p>'+vlE(k.qualitaet[i])+'</p>':'')+'</li>').join('')}</ol><p>${vlE(k.kriterium)}</p><p>${vlE(ss225Progress(k,s))}</p><p>Belege aus der laufenden Saison. Bronze, Silber und Gold bleiben nach der Vergabe bestehen. Es gibt keinen automatischen Punktebonus.</p>
  ${d.pflegen?(s.nachweis.belege||[]).map(b=>b.quelle?'<p><a href="'+vlE(b.quelle)+'" target="_blank" rel="noopener noreferrer">'+vlE(b.datum)+' · Aufnahme</a> · Wert '+vlE(Number(b.wert).toLocaleString('de-DE'))+' '+({speed:'km/h',distance:'m je 90 Trackingminuten',assists:'Vorlagen',saves:'Paraden'}[k.art]||'')+' · Fassung '+b.revision+'</p>':'<p>'+vlE(b.datum)+': '+vlE(b.notiz)+(edit?'<button class="btn ghost" data-ss-action="zurueck" data-date="'+vlE(b.datum)+'">Beleg zurücknehmen</button>':'')+'</p>').join(''):''}</details>
  ${edit&&s.passend!==false?`<label>Kurze fachliche Begründung<textarea data-ss-note maxlength="800" placeholder="Zum Beispiel: Szenen geprüft, Leistung wiederholt bestätigt.">${vlE(SS225.drafts.get(SS225.player+':'+k.id)||'')}</textarea></label>
  ${k.version>=2?ss227Quality(k,ss227Tier(k,s)):''}
  ${s.vorschlag?'<div class="ss225-actions"><button class="btn" data-ss-action="ja" data-tier="'+s.vorschlag+'">Ja, '+ss225Tier(s.vorschlag)+' freischalten</button><button class="btn ghost" data-ss-action="nein" data-tier="'+s.stufe+'">Nein, noch nicht</button></div>':''}
  <div class="ss225-actions"><button class="btn" data-ss-action="manuell" data-tier="${s.stufe?0:1}" aria-pressed="${!!s.stufe}">${s.stufe?'Deaktivieren':'Aktivieren: Bronze'}</button><label>Stufe<select data-ss-level><option value="1"${ss227Tier(k,s)===1?' selected':''}>Bronze</option><option value="2"${ss227Tier(k,s)===2?' selected':''}>Silber</option><option value="3"${ss227Tier(k,s)===3?' selected':''}>Gold</option></select></label><button class="btn ghost" data-ss-action="stufe">Stufe bestätigen</button></div>
  ${k.art==='observation'?'<details><summary>Qualifizierendes Spiel dokumentieren</summary><p>Bestätige das oben beschriebene Kriterium mit Gegner, Spielszenen und Minuten in der Begründung. Ein Tag zählt nur einmal.</p><label>Spieldatum<input type="date" data-ss-date></label><button class="btn ghost" data-ss-action="beobachtung">Geprüften Beleg hinzufügen</button></details>':''}
  <p role="alert" data-ss-error></p>`:edit&&(s.stufe||(s.nachweis.belege||[]).some(b=>!b.quelle))?'<label>Grund für die Korrektur<textarea data-ss-note maxlength="800">'+vlE(SS225.drafts.get(SS225.player+':'+k.id)||'')+'</textarea></label>'+(s.stufe?'<button class="btn" data-ss-action="manuell" data-tier="0">Deaktivieren</button>':'')+'<p role="alert" data-ss-error></p>':''}</article>`;
}

function ss227Draft(k){const key=SS225.player+':'+k.id,q=SS225.qualityDrafts.get(key),p=SS225.data.spieler.find(p=>p.id===SS225.player),finger=p?.skills.find(s=>s.id===k.id)?.nachweis?.fingerabdruck;
 return q&&q.version===k.version&&q.finger===finger&&q.position===p.position?q:null;}
function ss227Tier(k,s){return ss227Draft(k)?.tier||s.vorschlag||s.stufe||1;}
function ss227Quality(k,tier){const q=ss227Draft(k),same=q?.tier===tier;return `<fieldset data-ss-quality="${tier}"><legend>${ss225Tier(tier)}: Qualitätsprüfung</legend><p>${vlE(k.qualitaet[tier-1])}</p><label class="ss227-check"><input type="checkbox" data-ss-criterion${same&&q.confirmed?' checked':''}>Ich habe diese Qualität anhand konkreter Spielszenen geprüft, einschließlich Fehlern und Gegnerdruck.</label>${tier===3?'<label>Warum ist das eine Ausnahmefähigkeit?<textarea data-ss-comparison maxlength="800" placeholder="Gegnerniveau, wiederholte Szenen und Vergleich erläutern. Keine bloße Tore- oder Spielezahl.">'+vlE(q?.comparison||'')+'</textarea></label><label class="ss227-check"><input type="checkbox" data-ss-exception'+(same&&q.exception?' checked':'')+'>Ich bestätige eine außergewöhnliche Fähigkeit. Das ist keine Bundesliga-Zertifizierung.</label>':''}</fieldset>`;}
function ss227Remember(card){const id=card.dataset.ssSkill,k=SS225.data.katalog.find(k=>k.id===id),p=SS225.data.spieler.find(p=>p.id===SS225.player),q=card.querySelector('[data-ss-quality]');if(!q)return;
 SS225.qualityDrafts.set(SS225.player+':'+id,{version:k.version,position:p.position,finger:p.skills.find(s=>s.id===id)?.nachweis?.fingerabdruck,tier:Number(q.dataset.ssQuality),confirmed:q.querySelector('[data-ss-criterion]').checked,comparison:q.querySelector('[data-ss-comparison]')?.value??ss227Draft(k)?.comparison??'',exception:q.querySelector('[data-ss-exception]')?.checked||false});}
function ss227Bind(card){card.querySelectorAll('[data-ss-quality] input,[data-ss-quality] textarea').forEach(e=>e.oninput=()=>ss227Remember(card));}
function ss227ChangeQuality(card,tier){const k=SS225.data.katalog.find(k=>k.id===card.dataset.ssSkill),old=card.querySelector('[data-ss-quality]');if(old&&k.qualitaet){old.outerHTML=ss227Quality(k,tier);ss227Bind(card);ss227Remember(card);}}

function ss225Render(){const d=SS225.data;if(!d)return;const p=ss225Panel(),pl=d.spieler.find(x=>x.id===SS225.player),pending=d.spieler.flatMap(x=>x.skills.filter(s=>s.vorschlag||s.pruefung).map(s=>({p:x,s})));
 const cards=pl?d.katalog.filter(k=>(SS225.catalogAll||!pl.position||pl.skills.find(s=>s.id===k.id)?.passend!==false||pl.skills.find(s=>s.id===k.id)?.stufe>0)&&(SS225.filter==='Alle'||k.position==='Alle'||(k.position==='Feldspieler'&&SS225.filter!=='Torwart')||k.position.includes(SS225.filter))):[];
 p.innerHTML=`<div class="vl ss225"><section class="card"><h2>Spieler-Skills</h2><p>Deine Stärken. Deine nächsten Ziele.</p><p>Schwelle erreicht? Lukas prüft die Belege und entscheidet mit Ja oder Nein. Nur seine Bestätigung schaltet einen Skill frei.</p><div class="vl-filter"><label>Mannschaft<select id="ss225Team">${d.teams.map(t=>'<option value="'+vlE(t)+'"'+(t===SS225.team?' selected':'')+'>'+vlE(t)+'. Mannschaft</option>').join('')}</select></label><label>Spieler<select id="ss225Player">${d.spieler.map(x=>'<option value="'+vlE(x.id)+'"'+(x.id===SS225.player?' selected':'')+'>'+vlE(x.name)+'</option>').join('')}</select></label><label>Skill-Bereich<select id="ss225Filter">${['Alle','Torwart','Abwehr','Mittelfeld','Angriff'].map(x=>'<option'+(x===SS225.filter?' selected':'')+'>'+x+'</option>').join('')}</select></label><label>Anzeige<select id="ss227Catalog"><option value="passend">Passende Skills</option><option value="alle"${SS225.catalogAll?' selected':''}>Gesamter Katalog</option></select></label></div>
 ${pl?'<p>Hinterlegte Position: <b>'+vlE(pl.position||'noch offen')+'</b>. '+(!pl.position&&d.katalog.some(k=>k.version>=2)?'Vor einer Freischaltung die Position im Spielerprofil oder in der Saisonplanung pflegen.':'Torwart- und Feldspieler-Skills werden getrennt geprüft.')+'</p>':''}
 ${d.pflegen?'<button class="btn" id="ss225Edit" aria-pressed="'+SS225.edit+'">'+(SS225.edit?'Bearbeitung beenden':'Skills bearbeiten')+'</button>':''}</section>
 ${d.pflegen&&pending.length?'<section class="card"><h3>'+pending.length+' Vorschläge und Prüfungen</h3><div class="ss225-actions">'+pending.map(({p:x,s})=>'<button class="btn ghost" data-ss-open="'+vlE(x.id)+'" data-skill="'+vlE(s.id)+'">'+vlE(x.name)+' · '+vlE(d.katalog.find(k=>k.id===s.id)?.name||s.id)+' · '+(s.pruefung?'Belege prüfen':ss225Tier(s.vorschlag))+'</button>').join('')+'</div></section>':''}
 ${pl?'<section class="card vl-skills"><h2>'+vlE(pl.name)+'</h2><div class="vl-skills-grid">'+(cards.length?cards.map(k=>ss225Card(k,pl.skills.find(s=>s.id===k.id))).join(''):'<p>Keine passenden Skills für diesen Filter. Wähle einen anderen Bereich oder öffne den gesamten Katalog.</p><button class="btn ghost" id="ss227Reset">Filter zurücksetzen</button>')+'</div></section>':'<section class="card"><p>Hier ist noch kein eigener Seniorenspieler zugeordnet. Bitte die bestehende Kaderzuordnung prüfen lassen.</p></section>'}</div>`;
 const reset=p.querySelector('#ss227Reset');if(reset)reset.onclick=()=>{SS225.filter='Alle';ss225Render();};
 p.querySelectorAll('[data-ss-skill]').forEach(ss227Bind);
 p.querySelector('#ss225Team').onchange=e=>{SS225.team=e.target.value;SS225.player=null;ss225Load();};
 p.querySelector('#ss225Player').onchange=e=>{SS225.player=e.target.value;SS225.edit=false;ss225Render();};
 p.querySelector('#ss227Catalog').onchange=e=>{SS225.catalogAll=e.target.value==='alle';ss225Render();};
 p.querySelectorAll('[data-ss-level]').forEach(e=>e.onchange=()=>ss227ChangeQuality(e.closest('[data-ss-skill]'),Number(e.value)));
 p.querySelector('#ss225Filter').onchange=e=>{SS225.filter=e.target.value;ss225Render();};
 const edit=p.querySelector('#ss225Edit');if(edit)edit.onclick=()=>{SS225.edit=!SS225.edit;ss225Render();p.querySelector('#ss225Edit').focus();};
 p.querySelectorAll('[data-ss-open]').forEach(b=>b.onclick=()=>{SS225.player=b.dataset.ssOpen;SS225.edit=true;SS225.filter='Alle';SS225.catalogAll=true;ss225Render();p.querySelector('[data-ss-skill="'+b.dataset.skill+'"]').scrollIntoView({block:'start'});});
 p.querySelectorAll('[data-ss-note]').forEach(t=>t.oninput=()=>SS225.drafts.set(SS225.player+':'+t.closest('[data-ss-skill]').dataset.ssSkill,t.value));
 p.querySelectorAll('[data-ss-action]').forEach(b=>b.onclick=()=>ss225Save(b));
}
async function ss225Save(button){if(SS225.busy)return;const card=button.closest('[data-ss-skill]'),id=card.dataset.ssSkill,player=SS225.player,team=SS225.team,d=SS225.data,s=d.spieler.find(x=>x.id===player).skills.find(x=>x.id===id),note=card.querySelector('[data-ss-note]').value.trim(),error=card.querySelector('[data-ss-error]'),action=button.dataset.ssAction;
 if(note.length<(action==='beobachtung'?10:5)){error.textContent='Bitte deine fachliche Begründung mit mindestens '+(action==='beobachtung'?10:5)+' Zeichen eintragen.';card.querySelector('textarea').focus();return;}
 const k=d.katalog.find(x=>x.id===id),tier=action==='stufe'?Number(card.querySelector('[data-ss-level]').value):Number(button.dataset.tier);let quality=null;
 if(k.version>=2&&['ja','manuell','stufe'].includes(action)&&tier>0){
  const q=card.querySelector('[data-ss-quality]');
  if(!q||Number(q.dataset.ssQuality)!==tier){if(q){card.querySelector('[data-ss-level]').value=String(tier);ss227ChangeQuality(card,tier);}error.textContent='Bitte den Qualitätsmaßstab für '+ss225Tier(tier)+' prüfen und ausdrücklich bestätigen.';return;}
  const confirmed=q.querySelector('[data-ss-criterion]').checked,comparison=q.querySelector('[data-ss-comparison]')?.value.trim()||'',exception=q.querySelector('[data-ss-exception]')?.checked||false;
  if(!confirmed||note.length<[0,20,40,80][tier]||(tier===3&&(!exception||comparison.length<40))){error.textContent='Bitte den Qualitätsmaßstab bestätigen, konkrete Szenen begründen (mindestens '+[0,20,40,80][tier]+' Zeichen)'+(tier===3?' und für Gold den Vergleich mit mindestens 40 Zeichen einordnen.':'.');return;}
  quality={version:k.version,stufe:tier,kriterium:true,ausnahme:exception,vergleich:comparison};
 }
 SS225.busy=true;ss225Panel().querySelectorAll('button,select,input,textarea').forEach(e=>e.disabled=true);
 try{if(action==='zurueck')await vlRpc('skills_beobachtung_zurueck',{p_spieler:player,p_skill:id,p_datum:button.dataset.date,p_notiz:note});
 else if(action==='beobachtung')await vlRpc('skills_beobachtung',{p_spieler:player,p_skill:id,p_datum:card.querySelector('[data-ss-date]').value||null,p_notiz:note});
 else await vlRpc(k.version>=2?'skills_bewerten':'skills_entscheiden',{p_spieler:player,p_skill:id,p_aktion:action==='stufe'?'manuell':action,p_stufe:action==='stufe'?Number(card.querySelector('[data-ss-level]').value):Number(button.dataset.tier),p_erwartet:s.revision,p_finger:s.nachweis.fingerabdruck||null,p_notiz:note,...(k.version>=2?{p_qualitaet:quality}:{})});
 if(SS225.player!==player||SS225.team!==team)return;
 SS225.drafts.delete(player+':'+id);SS225.qualityDrafts.delete(player+':'+id);const loadSeq=SS225.seq+1;await ss225Load();if(SS225.seq!==loadSeq||SS225.player!==player||SS225.team!==team)return;if(SS225.data){SS225.edit=true;ss225Render();const target=ss225Panel().querySelector('[data-ss-skill="'+id+'"]');if(target){target.scrollIntoView({block:'start'});let result=target.querySelector('[data-ss-error]');if(!result){result=document.createElement('p');result.dataset.ssError='';result.setAttribute('role','status');target.appendChild(result);}result.textContent='Gespeichert.';}}
 }catch(e){if(card.isConnected){error.textContent=e.message;ss225Panel().querySelectorAll('button,select,input,textarea').forEach(x=>x.disabled=false);}}
 finally{SS225.busy=false;}
}
{const old=sk96Render;sk96Render=function(){const r=old.apply(this,arguments),p=sk96Panel();if(sk96Darf()&&!p.querySelector('#ss225Own')){const b=document.createElement('button');b.id='ss225Own';b.className='btn';b.textContent='Meine Skills & Ziele';b.onclick=()=>{SS225.player=SK96.d?.ich?.id||null;SS225.team=SK96.d?.ich?.team||null;goTab('skills');};p.prepend(b);}return r;};}
if(typeof openModal==='function'){const old=openModal;openModal=function(id){const r=old.apply(this,arguments),p=typeof sv4P==='function'?sv4P(id):null,root=document.querySelector('#modal .pf4');if(p&&p.own&&!p.isJugend&&root&&!root.querySelector('[data-ss-profile]')){const b=document.createElement('button');b.className='btn';b.dataset.ssProfile='1';b.textContent='Skills & Ziele';b.onclick=()=>{SS225.player=id;const team=typeof sv4Team==='function'?sv4Team(p):null;if(['1','2'].includes(String(team)))SS225.team=String(team);closeOverlay();goTab('skills');};root.querySelector('.pf4-head')?.appendChild(b);}return r;};}
SV_TBL.skills=['award','Spieler-Skills'];SV_PAGES.skills=['Spieler-Skills','Stärken und nächste Ziele'];try{SVR_TAB.skills=null;}catch(e){}
{const old=svTabAllowed;svTabAllowed=function(t){return t==='skills'?sk96Darf():old.apply(this,arguments);};}
{const old=goTab;goTab=function(t){if(t==='skills')ss225Panel();const r=old.apply(this,arguments);if(t==='skills'&&svCurTab()==='skills')ss225Load();return r;};}

/* Redaktioneller Heftauftritt. Alte Satzfassungen bleiben ausdrücklich erhalten. */
function huTitel(B,s,i,C){const d=s.daten||{},ink='#13254a',paper='#f6f2e9',orange='#df642b',name=(window.VEREIN&&VEREIN.texte&&VEREIN.texte.stadionheft)||'Doppelpass';
  B.r(-3,-3,216,303,paper);B.l(14,12,196,12,ink,.65);B.t('SV/BSC MÖRLENBACH',14,19,'k',10,ink,{ls:.09});B.t(hsHeftMonat(C.heft).toUpperCase(),196,19,'k',10,ink,{a:'r'});
  B.tp(name.toUpperCase(),12,53,'h',92,ink,184);B.t('DAS HEFT DER FUSSBALLABTEILUNG',14,63,'k',10,ink,{ls:.09});B.l(14,68,196,68,ink,.35);
  const key=d.foto?'f:'+d.foto:null;
  if(key&&HS.B[key]&&HS.B[key].url)B.b(key,14,76,182,132,{fit:'cover'});
  else{B.r(14,76,182,132,'#e3e1d9');B.b('wappen',69,113,72,42,{fit:'contain'});B.hin(20,165,170,25,key?'Titelbild konnte noch nicht geladen werden':'Ein echtes Vereinsfoto als Titelbild wählen');B.warn.push('Für das neue Cover fehlt ein geladenes Vereinsfoto.');}
  B.r(14,76,2,132,orange);
  const g=(C.auto.naechste||[]).find(x=>x.sub==='A'&&x.wh)||(C.auto.naechste||[]).find(x=>x.wh);
  const head=d.kopf||(g?g.heim+' - '+g.gast:'');
  B.t(String(d.dach||(g?'HEIMSPIEL':'IN DIESEM HEFT')).toUpperCase(),14,220,'k',9.5,orange,{ls:.12});
  const lines=hsUmbruch(head,'h',31,182,true);if(lines.length>2)B.warn.push('Die Titelüberschrift ist zu lang. Bitte kürzen.');
  lines.slice(0,2).forEach((l,n)=>B.t(l.t,14,233+n*11,'h',31,ink));
  const sub=d.vorspann||(!d.kopf&&g?hsTagLang(g.d)+(g.z?' · '+g.z+' Uhr':''):'');
  const sublines=hsUmbruch(sub,'t',11,182);if(sublines.length>2)B.warn.push('Der Vorspann auf dem Cover ist zu lang. Bitte kürzen.');
  sublines.slice(0,2).forEach((l,n)=>B.t(l.t,14,258+n*5.2,'t',11,ink));
  B.l(14,279,196,279,ink,.35);B.t('DAS STADIONHEFT',14,287,'k',8,ink,{ls:.1});B.t('SV 1896 · BSC 1959',196,287,'k',8,ink,{a:'r',ls:.1});}
{const old=hsTitel;hsTitel=function(B,s,i,C){return (s.daten||{}).welche==='editorial-1'?huTitel(B,s,i,C):old.apply(this,arguments);};}
{const old=hvEditor;hvEditor=function(B){const r=old.apply(this,arguments),s=HV.d&&HV.d.seiten[HV.ed],ed=B.querySelector('#hvEd');if(s&&s.typ==='titel'&&ed){const box=document.createElement('div');box.className='card vl';box.innerHTML='<label>Covergestaltung<select id="huCover"><option value="">Bisheriger Satz</option><option value="editorial-1">Editorial: Foto und klare Typografie</option></select></label><p class="note">Bestehende Ausgaben behalten ihre Gestaltung. Die neue Fassung wird erst mit „Speichern“ übernommen.</p>';ed.prepend(box);const select=box.querySelector('select');select.value=HV.entwurf.welche||'';select.onchange=()=>{if(select.value)HV.entwurf.welche=select.value;else delete HV.entwurf.welche;hvSetzen();hvBuch(B);hvHinweise(B);};}return r;};}
{const old=hvLeiste;hvLeiste=function(B){const r=old.apply(this,arguments);if(HV.d&&HV.d.planen&&!B.querySelector('#huEingang')){const b=document.createElement('button');b.className='btn ghost';b.id='huEingang';b.textContent='Redaktionspostfach';b.onclick=huEingang;const at=B.querySelector('#hvLeiste');if(at)at.prepend(b);}return r;};}
async function huEingang(){if(!(await hvVerlassen()))return;hvEdZu();const m=svModal('<div class="vl"><h2>Redaktionspostfach</h2><p>Quellen und Artikelvorschläge werden geladen …</p><button class="btn ghost" id="huZu">Schließen</button></div>');m.querySelector('#huZu').onclick=()=>closeOverlay();
  const box=m.querySelector('.vl');try{const list=await shRpc('heft_redaktion_laden',{});if(!box.isConnected)return;box.innerHTML='<h2>Redaktionspostfach</h2><p>Aus euren Vereinsquellen vorbereitet. Jeder Text wird vor dem Druck von euch geprüft.</p>'+(list.length?list.map(r=>`<article class="card"><small>${hvE(r.kanal)} · ${hvE(r.erschienen||'Datum offen')} · ${r.stand==='uebernommen'?'Im Heft':r.stand==='zurueckgestellt'?'Zurückgestellt':'Entwurf'}</small><h3>${hvE(r.kopf)}</h3><p>${hvE(r.vorspann)}</p><p>${hvE(r.hinweis)}</p><a target="_blank" rel="noopener noreferrer" href="${hvE(r.quelle)}">Originalquelle ansehen</a><button class="btn ghost" data-hu="${hvE(r.id)}">Lesen & bearbeiten</button></article>`).join(''):'<div class="card"><h3>Noch keine Beiträge eingegangen</h3><p>Nach dem ersten Quellenlauf erscheinen hier belegte Artikelentwürfe. Nicht erreichbare Stories werden als fehlende Abdeckung protokolliert.</p></div>')+'<button class="btn ghost" id="huZu">Schließen</button>';
    box.querySelector('#huZu').onclick=()=>closeOverlay();box.querySelectorAll('[data-hu]').forEach(b=>b.onclick=()=>huArtikel(list.find(r=>r.id===b.dataset.hu)));
  }catch(e){if(!box.isConnected)return;const p=box.querySelector('p');if(p)p.textContent='Das Redaktionspostfach konnte nicht geladen werden. Bitte erneut öffnen.';}}
function huArtikel(r){const pages=HV.d.seiten.filter(s=>['jugend','soma','rueckblick','eigen','frei'].includes(s.typ)&&Object.keys(hvSauber(s.daten||{})).length===0),read=r.stand==='uebernommen';
  const m=svModal(`<div class="vl"><h2>Artikel prüfen</h2><p><a href="${hvE(r.quelle)}" target="_blank" rel="noopener noreferrer">Originalquelle</a></p><details><summary>Belegter Ausgangstext</summary><p style="white-space:pre-wrap">${hvE(r.original)}</p></details><p>${hvE(r.hinweis)}</p>
  <label>Überschrift<input id="huKopf" maxlength="200" value="${hvE(r.kopf)}"${read?' disabled':''}></label><label>Vorspann<textarea id="huVor" maxlength="1000" rows="3"${read?' disabled':''}>${hvE(r.vorspann)}</textarea></label><label>Artikel<textarea id="huText" maxlength="12000" rows="12"${read?' disabled':''}>${hvE(r.text)}</textarea></label>
  ${read?'<p>Bereits übernommen. Änderungen bitte direkt an der Heftseite vornehmen.</p>':`<button class="btn" id="huSave">Entwurf speichern</button><button class="btn ghost" id="huLater">Zurückstellen</button>${pages.length?'':'<p>Keine leere Textseite vorhanden. Schließe das Postfach und ergänze im Seitenplan eine Seite der Sorte Verein, Jugend oder Rückblick.</p>'}<label>Leere Seite im aktuellen Heft<select id="huPage"><option value="">Seite auswählen</option>${pages.map(s=>`<option value="${hvE(s.id)}">Seite ${HV.d.seiten.indexOf(s)+1} · ${hvE(s.titel||s.typ)}</option>`).join('')}</select></label><button class="btn ghost" id="huUse"${pages.length?'':' disabled'}>Als ungeprüften Text übernehmen</button><p>Die Freigabe erfolgt danach über „Text geprüft“ an der Heftseite. Bilder wählst du dort nach Prüfung der Nutzungsrechte.</p>`}<p id="huErr" role="alert"></p><button class="btn ghost" id="huBack">Zurück zum Postfach</button></div>`);
  m.querySelector('#huBack').onclick=huEingang;if(read)return;
  let busy=false;const save=async(stand,use)=>{if(busy)return;busy=true;m.querySelectorAll('button').forEach(b=>b.disabled=true);try{
    const page=m.querySelector('#huPage').value;if(use&&!page)throw new Error('Bitte eine leere Textseite wählen.');
    await shRpc('heft_redaktion_speichern',{p_id:r.id,p_revision:r.revision,p_kopf:m.querySelector('#huKopf').value,p_vorspann:m.querySelector('#huVor').value,p_text:m.querySelector('#huText').value,p_stand:stand});r.revision++;
    if(use){await shRpc('heft_redaktion_uebernehmen',{p_id:r.id,p_seite:page,p_revision:r.revision});await hvLaden();const B=shOrt();if(B)hvRender(B);}
    await huEingang();}catch(e){m.querySelector('#huErr').textContent=e.message;}finally{busy=false;m.querySelectorAll('button').forEach(b=>b.disabled=false);if(!pages.length)m.querySelector('#huUse').disabled=true;}};
  m.querySelector('#huSave').onclick=()=>save('entwurf',false);m.querySelector('#huLater').onclick=()=>save('zurueckgestellt',false);m.querySelector('#huUse').onclick=()=>save('entwurf',true);}

(function(){var s=document.createElement('style');s.textContent=".bd-buehne{position:relative}.bd-bearbeiten{position:absolute;right:14px;bottom:14px;min-height:44px;padding:10px 16px;border:1px solid #d8deeb;border-radius:12px;background:#fff;color:#1d2760;font:600 15px Barlow,system-ui,sans-serif;box-shadow:0 3px 14px #101e3630;cursor:pointer}.bd-bearbeiten:focus-visible,.bd-partner-dialog button:focus-visible{outline:3px solid #e8741f;outline-offset:3px}.bd-kundenfreigabe{display:flex;gap:10px;align-items:center;min-height:44px;margin-top:16px;font-size:15px;line-height:1.4}.bd-kundenfreigabe input{width:22px;height:22px;accent-color:#1d2760}.bd-projekt-hinweis{font-size:13px;line-height:1.45;color:#596173;margin:12px 0}.bd-partner-dialog{position:fixed;inset:0;z-index:2147483300;background:#101b35b3;display:grid;place-items:center;padding:16px}.bd-partner-dialog>section{display:flex;flex-direction:column;width:min(1500px,100%);height:calc(100vh - 32px);height:calc(100dvh - 32px);max-height:1100px;overflow:hidden;background:#f5f6f9;border:1px solid #dbe1ee;border-radius:20px;box-shadow:0 24px 90px #050c2660}.bd-partner-dialog header{display:flex;align-items:center;justify-content:space-between;gap:18px;padding:14px 20px;background:#fff;border-bottom:1px solid #e0e4ed}.bd-partner-dialog small{font-size:11px;font-weight:700;letter-spacing:.09em;text-transform:uppercase;color:#62708c}.bd-partner-dialog h2{font:700 22px Barlow,system-ui,sans-serif;margin:3px 0;color:#1d2760}.bd-partner-dialog header button{width:44px;height:44px;border:0;border-radius:12px;background:#edf0f7;color:#1d2760;font-size:28px;cursor:pointer}.bd-partner-dialog [data-bd-status]{margin:0;padding:10px 20px;font:500 14px/1.4 Barlow,system-ui,sans-serif;color:#6b3b20;background:#fff4e6}.bd-partner-dialog [data-bd-status]:empty{display:none}.bd-partner-dialog iframe{flex:1;min-height:0;width:100%;border:0;background:#f5f6f9}.bd-partner-dialog [hidden],.bd-kundenfreigabe[hidden],.bd-bearbeiten[hidden]{display:none!important}@media(max-width:600px){.bd-partner-dialog{padding:0}.bd-partner-dialog>section{height:100vh;height:100dvh;max-height:none;border:0;border-radius:0}.bd-partner-dialog header{padding:10px 14px}.bd-bearbeiten{bottom:10px;right:10px}}\n.bd-creator-vorschau{position:relative;aspect-ratio:16/10;min-height:220px;overflow:hidden;border:1px solid #dbe1ee;border-radius:14px;background:#e9eef4}.bd-creator-vorschau canvas{display:block;position:absolute;inset:0;width:100%;height:100%}.bd-creator-projekt [hidden]{display:none!important}\n\n.bd-creator-hat-projekt .pz-tc-links>:not(.bd-creator-projekt),.bd-creator-hat-projekt .pz-tc-rechts>section:not(:first-child),.bd-creator-hat-projekt .pz-bc-felder,.bd-creator-hat-projekt .pz-bc-schalter{display:none}.bd-creator-hat-projekt .bd-creator-projekt{margin-top:0}\n.bd-motive{display:flex;gap:8px;flex-wrap:wrap;margin-bottom:12px}.bd-motive[hidden]{display:none}.bd-motive button{min-height:44px;padding:10px 14px;border:1px solid #9caac0;border-radius:8px;background:#fff;color:#1d2760;font:600 15px/1.2 Barlow,system-ui,sans-serif;cursor:pointer}.bd-motive button[aria-pressed=\"true\"]{border-color:#1d2760;box-shadow:inset 0 -3px #e8741f}.bd-motive button:focus-visible{outline:3px solid #e8741f;outline-offset:3px}.bd-motive button:disabled{opacity:.65;cursor:wait}\n";document.head.appendChild(s);})();
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
