/* Shared preview/export geometry. Fonts become outlines, raster logos keep source pixels. */
(function(root){
  'use strict';
  const C=root.BD_CORE,fonts={},images=new Map();let ready;
  async function loadFonts(){
    if(ready)return ready;
    ready=Promise.all(Object.entries(C.FONTS).map(async([key,f])=>{
      const r=await fetch('fonts/'+f.file);if(!r.ok)throw Error('Die CI-Schrift lässt sich nicht laden. Bitte versuche es erneut.');
      fonts[key]=root.opentype.parse(await r.arrayBuffer());
    })).catch(()=>{ready=null;throw Error('Die CI-Schriften lassen sich gerade nicht laden. Prüfe deine Verbindung und lade die Seite erneut.');});return ready;
  }
  function image(src){if(images.has(src))return images.get(src);const p=new Promise((ok,no)=>{const i=new Image();i.onload=()=>ok(i);i.onerror=()=>no(Error('Das Logo lässt sich nicht lesen.'));i.src=src;});images.set(src,p);p.catch(()=>images.delete(src));return p;}
  function canvas(w,h){const c=document.createElement('canvas');c.width=w;c.height=h;return c;}
  async function validateAssets(d){
    for(const a of Object.values(d.assets)){
      const i=await image(a.src);if(!i.naturalWidth||!i.naturalHeight||i.naturalWidth*i.naturalHeight>24000000||i.naturalWidth>30000||i.naturalHeight>30000)throw Error('Ein Logo ist zu groß oder beschädigt. Bitte lade das Original neu.');
      if(a.vector){for(const p of a.vector.paths){const path=root.BD_SVGPATH(p.d);if(path.err||!path.segments.length)throw Error('Ein gespeicherter Vektorpfad ist ungültig.');}}
      else{a.width=i.naturalWidth;a.height=i.naturalHeight;}
      await analyseAsset(a);
    }
    return d;
  }
  function vectorSVG(v){return `<svg xmlns="http://www.w3.org/2000/svg" width="${v.width}" height="${v.height}" viewBox="0 0 ${v.width} ${v.height}">${v.paths.map(p=>`<path d="${C.esc(p.d)}" fill="${p.fill}" stroke="${p.stroke}" stroke-width="${p.strokeWidth}" opacity="${p.opacity}" fill-rule="${p.rule}"/>`).join('')}</svg>`;}
  async function vectorPreview(v){const u=URL.createObjectURL(new Blob([vectorSVG(v)],{type:'image/svg+xml'}));try{const i=await image(u),s=Math.min(1,1800/Math.max(v.width,v.height)),c=canvas(Math.max(1,Math.ceil(v.width*s)),Math.max(1,Math.ceil(v.height*s)));c.getContext('2d').drawImage(i,0,0,c.width,c.height);return c.toDataURL('image/png');}finally{images.delete(u);URL.revokeObjectURL(u);}}
  async function analyseAsset(asset){
    const bright=c=>c!=='none'&&C.hexRGB(c).every(v=>v>=235);let light=false;
    if(asset.vector){const paints=asset.vector.paths.filter(p=>p.opacity>0).flatMap(p=>[p.fill,p.stroke]).filter(c=>c!=='none');light=paints.length>0&&paints.every(bright);}
    else{
      const i=await image(asset.src),s=Math.min(1,256/Math.max(i.naturalWidth,i.naturalHeight)),c=canvas(Math.max(1,Math.ceil(i.naturalWidth*s)),Math.max(1,Math.ceil(i.naturalHeight*s))),ctx=c.getContext('2d',{willReadFrequently:true});
      ctx.drawImage(i,0,0,c.width,c.height);const rgba=ctx.getImageData(0,0,c.width,c.height).data;let visible=0,white=0;
      for(let j=0;j<rgba.length;j+=4)if(rgba[j+3]>32){visible++;if(rgba[j]>=235&&rgba[j+1]>=235&&rgba[j+2]>=235)white++;}
      light=visible>0&&white/visible>.92;c.width=c.height=1;
    }
    asset.light=light;return asset;
  }
  function vectorElement(v,b){return `<svg x="${b.x}" y="${b.y}" width="${b.w}" height="${b.h}" viewBox="0 0 ${v.width} ${v.height}" overflow="hidden">${v.paths.map(p=>`<path d="${C.esc(p.d)}" fill="${p.fill}" stroke="${p.stroke}" stroke-width="${p.strokeWidth}" opacity="${p.opacity}" fill-rule="${p.rule}"/>`).join('')}</svg>`;}
  function drawVector(ctx,v,b){
    ctx.save();ctx.translate(b.x,b.y);ctx.scale(b.w/v.width,b.h/v.height);ctx.beginPath();ctx.rect(0,0,v.width,v.height);ctx.clip();
    for(const p of v.paths){const path=new Path2D(p.d);ctx.globalAlpha=p.opacity;if(p.fill!=='none'){ctx.fillStyle=p.fill;ctx.fill(path,p.rule);}if(p.stroke!=='none'&&p.strokeWidth>0){ctx.strokeStyle=p.stroke;ctx.lineWidth=p.strokeWidth;ctx.stroke(path);}}
    ctx.restore();
  }
  const paintColor=value=>{
    value=String(value||'').trim().toLowerCase();if(value==='none')return 'none';
    const names={white:'#ffffff',black:'#000000',red:'#ff0000',blue:'#0000ff',green:'#008000',navy:'#000080',orange:'#ffa500',transparent:'none'};
    if(names[value])return names[value];if(/^#[0-9a-f]{6}$/.test(value))return value;if(/^#[0-9a-f]{3}$/.test(value))return '#'+value.slice(1).split('').map(x=>x+x).join('');
    const m=/^rgb\(\s*(\d+)\s*[, ]\s*(\d+)\s*[, ]\s*(\d+)\s*\)$/.exec(value);if(m&&m.slice(1).every(v=>+v<=255))return '#'+m.slice(1).map(v=>(+v).toString(16).padStart(2,'0')).join('');
    throw Error('Die SVG-Datei nutzt eine nicht unterstützte Farbe. Nutze eine SVG mit einfachen Flächen oder eine PNG-Datei.');
  };
  // Deliberately small, closed SVG grammar: no references, scripts, embedded files or CSS selectors.
  function readSVG(source){
    if(source.length>3*1024*1024||/<!DOCTYPE|<!ENTITY|<\?[^x]|(?:href|src)\s*=|url\s*\(|@import|<script|<foreignObject/i.test(source))throw Error('Diese SVG-Datei enthält Verweise oder aktive Inhalte. Nutze eine bereinigte Logo-Datei.');
    const xml=new DOMParser().parseFromString(source,'image/svg+xml'),svg=xml.documentElement;
    if(svg.localName!=='svg'||xml.querySelector('parsererror'))throw Error('Die SVG-Datei ist beschädigt.');
    const vb=(svg.getAttribute('viewBox')||'').trim().split(/[ ,]+/).map(Number),unit=s=>{const m=/^([0-9.]+)(px|mm|cm|in|pt)?$/.exec(s||'');return m?+m[1]*({mm:96/25.4,cm:96/2.54,in:96,pt:96/72,px:1}[m[2]]||1):0;};
    const [vx,vy,W,H]=vb.length===4&&vb.every(Number.isFinite)?vb:[0,0,unit(svg.getAttribute('width')),unit(svg.getAttribute('height'))];
    if(!(W>0&&H>0&&W<=100000&&H<=100000))throw Error('Der SVG-Datei fehlen gültige Maße.');
    const paths=[];let nodes=0;
    const number=(e,k,f=0)=>{const s=e.getAttribute(k);if(s==null)return f;if(!/^[+-]?(?:\d*\.)?\d+(?:e[+-]?\d+)?$/i.test(s)||!Number.isFinite(+s)||Math.abs(+s)>1000000)throw Error('Die SVG-Geometrie ist ungültig.');return +s;};
    function walk(el,inherit,transform,parentAlpha=1){
      if(++nodes>2000)throw Error('Das SVG-Logo hat zu viele Elemente.');
      const tag=el.localName;if(['title','desc','metadata'].includes(tag))return;
      if(!['svg','g','path','rect','circle','ellipse','polygon','polyline','line'].includes(tag))throw Error('Das SVG nutzt '+tag+'. Nutze eine SVG aus Pfaden oder eine hochauflösende PNG-Datei.');
      for(const a of el.attributes)if(/^on/i.test(a.name)||/href|filter|mask|clip-path/i.test(a.name))throw Error('Die SVG enthält nicht unterstützte Verweise.');
      const style={...inherit};delete style.opacity;for(const [k,v]of(el.getAttribute('style')||'').split(';').filter(Boolean).map(s=>s.split(':').map(x=>x.trim()))){if(!['fill','stroke','stroke-width','opacity','fill-opacity','stroke-opacity','fill-rule'].includes(k))throw Error('Das SVG nutzt nicht unterstützte Stilregeln.');style[k]=v;}
      for(const k of ['fill','stroke','stroke-width','opacity','fill-opacity','stroke-opacity','fill-rule'])if(el.hasAttribute(k))style[k]=el.getAttribute(k);
      if(el.hasAttribute('class'))throw Error('Die SVG nutzt Stilklassen. Exportiere sie mit Inline-Stilen oder als PNG.');
      const tr=el.getAttribute('transform')||'';if(tr&&!/^[a-zA-Z0-9eE(),.\s+-]+$/.test(tr))throw Error('Die SVG-Transformation ist ungültig.');
      const full=(transform+' '+tr).trim();
      if(tag==='svg'||tag==='g'){for(const n of el.children)walk(n,style,full,parentAlpha*C.num(style.opacity,0,1,1));return;}
      let d='';
      if(tag==='path')d=el.getAttribute('d')||'';
      if(tag==='rect'){const x=number(el,'x'),y=number(el,'y'),w=number(el,'width'),h=number(el,'height');if(number(el,'rx')||number(el,'ry'))throw Error('Gerundete SVG-Flächen bitte vorher in Pfade umwandeln.');d=`M${x} ${y}h${w}v${h}h${-w}Z`;}
      if(tag==='circle'||tag==='ellipse'){const x=number(el,'cx'),y=number(el,'cy'),rx=number(el,tag==='circle'?'r':'rx'),ry=number(el,tag==='circle'?'r':'ry');d=`M${x-rx} ${y}a${rx} ${ry} 0 1 0 ${2*rx} 0a${rx} ${ry} 0 1 0 ${-2*rx} 0Z`;}
      if(tag==='polygon'||tag==='polyline'){const p=(el.getAttribute('points')||'').trim();if(!/^[0-9eE.,+\s-]+$/.test(p))throw Error('Die SVG-Punkte sind ungültig.');d='M'+p+(tag==='polygon'?'Z':'');}
      if(tag==='line')d=`M${number(el,'x1')} ${number(el,'y1')}L${number(el,'x2')} ${number(el,'y2')}`;
      if(!d)return;if(d.length>250000||!/^[MmLlHhVvCcSsQqTtAaZzEe0-9.,+\s-]+$/.test(d))throw Error('Ein SVG-Pfad ist ungültig.');
      const p=root.BD_SVGPATH(d).transform(full).abs();if(p.err)throw Error('Ein SVG-Pfad lässt sich nicht lesen.');
      const fill=paintColor(style.fill||'#000000'),stroke=paintColor(style.stroke||'none'),opacity=parentAlpha*C.num(style.opacity,0,1,1)*C.num(style['fill-opacity'],0,1,1);
      if(stroke!=='none'&&style['stroke-opacity']&&+style['stroke-opacity']!==C.num(style['fill-opacity'],0,1,1))throw Error('Die SVG nutzt verschiedene Deckungen. Bitte als PNG hochladen.');
      if(stroke!=='none'&&full.replace(`translate(${-vx} ${-vy})`,'').trim())throw Error('Transformierte SVG-Konturen bitte vorher in Flächen umwandeln.');
      paths.push({d:p.toString(),fill,stroke,strokeWidth:C.num(style['stroke-width'],0,1000,1),opacity,rule:style['fill-rule']==='evenodd'?'evenodd':'nonzero'});
    }
    walk(svg,{fill:'#000000',stroke:'none',opacity:'1'},`translate(${-vx} ${-vy})`);
    if(!paths.length)throw Error('Die SVG-Datei enthält keine sichtbaren Logo-Pfade.');return {width:W,height:H,paths};
  }
  async function render(ctx,d,scale=1){
    await loadFonts();await Promise.all(Object.values(d.assets).map(a=>image(a.src)));
    ctx.save();ctx.scale(scale,scale);ctx.fillStyle=d.background;ctx.fillRect(0,0,d.width,d.height);ctx.beginPath();ctx.rect(0,0,d.width,d.height);ctx.clip();
    for(const e of d.elements){
      if(e.type==='rect'){ctx.fillStyle=e.fill;ctx.fillRect(e.x,e.y,e.w,e.h);}
      else if(e.type==='text'&&e.text.trim()){ctx.fillStyle=e.fill;ctx.fill(new Path2D(C.textPath(e,fonts[e.font]).d));}
      else if(e.type==='image'){const a=d.assets[e.asset],b=C.fitImage(e,a);if(a.vector)drawVector(ctx,a.vector,b);else ctx.drawImage(await image(a.src),b.x,b.y,b.w,b.h);}
    }
    ctx.restore();
  }
  function svgDocument(doc){
    const d=C.normalise(doc),B=d.bleed,parts=[`<rect x="${-B}" y="${-B}" width="${d.width+2*B}" height="${d.height+2*B}" fill="${d.background}"/>`];
    for(const e of d.elements){
      if(e.type==='rect')parts.push(`<rect x="${e.x}" y="${e.y}" width="${e.w}" height="${e.h}" fill="${e.fill}"/>`);
      if(e.type==='text'&&e.text.trim())parts.push(`<path d="${C.textPath(e,fonts[e.font]).d}" fill="${e.fill}"/>`);
      if(e.type==='image'){const a=d.assets[e.asset],b=C.fitImage(e,a);if(a.vector)parts.push(vectorElement(a.vector,b));else parts.push(`<image x="${b.x}" y="${b.y}" width="${b.w}" height="${b.h}" href="${a.src}"/>`);}
    }
    return `<svg xmlns="http://www.w3.org/2000/svg" width="${d.width+2*B}mm" height="${d.height+2*B}mm" viewBox="${-B} ${-B} ${d.width+2*B} ${d.height+2*B}"><title>${C.esc(d.title||'Bande')}</title>${parts.join('')}</svg>`;
  }
  const b64bytes=s=>Uint8Array.from(atob(s),c=>c.charCodeAt(0));
  let cmsPromise;
  async function colourEngine(profile){
    const bytes=b64bytes(profile.data);if(bytes.length<132||bytes.length>8*1024*1024||String.fromCharCode(...bytes.slice(36,40))!=='acsp'||String.fromCharCode(...bytes.slice(16,20))!=='CMYK'||String.fromCharCode(...bytes.slice(12,16))!=='prtr')throw Error('Bitte ein gültiges CMYK-Ausgabeprofil der Druckerei verwenden.');
    if(!cmsPromise)cmsPromise=import(new URL('./vendor/bandenstudio/lcms.mjs',location.href).href).then(async M=>({M,engine:await M.instantiate({locateFile:()=>new URL('./vendor/bandenstudio/lcms.wasm',location.href).href})})).catch(e=>{cmsPromise=null;throw Error('Das Farbwerkzeug lässt sich nicht laden. Bitte versuche es erneut.');});
    const {M,engine:l}=await cmsPromise,ip=l.cmsCreate_sRGBProfile(),op=l.cmsOpenProfileFromMem(bytes,bytes.length);
    if(!op){l.cmsCloseProfile(ip);throw Error('Das ICC-Profil lässt sich nicht lesen.');}
    const t=l.cmsCreateTransform(ip,M.TYPE_RGB_8,op,M.TYPE_CMYK_8,M.INTENT_RELATIVE_COLORIMETRIC,M.cmsFLAGS_BLACKPOINTCOMPENSATION);
    if(!t){l.cmsCloseProfile(ip);l.cmsCloseProfile(op);throw Error('Dieses Profil erlaubt keine Umrechnung von RGB nach CMYK.');}
    let closed=false;return {bytes,name:l.cmsGetProfileInfoASCII(op,M.cmsInfoDescription,'en','US')||profile.name,convert(rgb,count){if(closed)throw Error('Das Farbwerkzeug ist geschlossen.');return l.cmsDoTransform(t,rgb,count);},close(){if(!closed){l.cmsDeleteTransform(t);l.cmsCloseProfile(ip);l.cmsCloseProfile(op);closed=true;}}};
  }
  async function pdf(doc){
    await loadFonts();const d=await validateAssets(C.normalise(doc)),check=C.preflight(d,fonts,true);if(!check.ok)throw Error(check.issues.find(x=>x.level==='stop').message);
    const P=root.PDFLib,out=await P.PDFDocument.create(),B=d.bleed,M=10,realW=d.width+2*(B+M),realH=d.height+2*(B+M),uu=Math.max(1,Math.ceil(Math.max(realW,realH)/d.scale*72/25.4/14400)),k=72/25.4/d.scale/uu,W=realW*k,H=realH*k,O=(B+M)*k,page=out.addPage([W,H]);
    page.node.set(P.PDFName.of('UserUnit'),P.PDFNumber.of(uu));page.setTrimBox(O,O,d.width*k,d.height*k);page.setBleedBox(M*k,M*k,(d.width+2*B)*k,(d.height+2*B)*k);
    out.setTitle(d.title||'Bande');out.setCreator('SV/BSC Bandenstudio');out.setSubject(`Endformat ${d.width} x ${d.height} mm; Maßstab 1:${d.scale}; Beschnitt ${B} mm; ${d.mode.toUpperCase()}; Schrift als Pfade`);
    let cms=null;const colours=new Map(),gs=new Map();
    try{
      if(d.mode==='cmyk'){
        cms=await colourEngine(d.profile);const ref=out.context.register(out.context.flateStream(cms.bytes,{N:4,Alternate:'DeviceCMYK'}));
        out.catalog.set(P.PDFName.of('OutputIntents'),out.context.obj([out.context.obj({Type:'OutputIntent',S:'GTS_PDFX',OutputConditionIdentifier:P.PDFString.of(cms.name),Info:P.PDFString.of(cms.name),DestOutputProfile:ref})]));
      }
      const color=h=>{if(colours.has(h))return colours.get(h);const rgb=C.hexRGB(h),v=cms?P.cmyk(...Array.from(cms.convert(new Uint8Array(rgb),1),x=>x/255)):P.rgb(...rgb.map(x=>x/255));colours.set(h,v);return v;};
      function path(d,x,y,scale,fill,stroke='none',sw=0,opacity=1,rule='nonzero'){
        let graphicsState;if(opacity<1){if(!gs.has(opacity)){const ref=out.context.register(out.context.obj({Type:'ExtGState',ca:opacity,CA:opacity}));gs.set(opacity,page.node.newExtGState('BDAlpha',ref));}graphicsState=gs.get(opacity);}
        const cubic=root.BD_SVGPATH(d).abs().unshort().unarc().iterate((segment,index,px,py)=>segment[0]==='Q'?[['C',px+2/3*(segment[1]-px),py+2/3*(segment[2]-py),segment[3]+2/3*(segment[1]-segment[3]),segment[4]+2/3*(segment[2]-segment[4]),segment[3],segment[4]]]:undefined).toString();
        const ops=P.drawSvgPath(cubic,{x:O+x*k,y:H-O-y*k,scale:k*scale,color:fill==='none'?undefined:color(fill),borderColor:stroke==='none'?undefined:color(stroke),borderWidth:stroke==='none'?0:sw,graphicsState});
        page.pushOperators(...ops.map(op=>rule==='evenodd'&&op.toString()==='f'?P.PDFOperator.of('f*'):rule==='evenodd'&&op.toString()==='B'?P.PDFOperator.of('B*'):op));
      }
      page.drawRectangle({x:M*k,y:M*k,width:(d.width+2*B)*k,height:(d.height+2*B)*k,color:color(d.background)});
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
