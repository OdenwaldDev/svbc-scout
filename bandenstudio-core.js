/* Bandenstudio: portable millimetre documents. No account, network or business writes. */
(function(root){
  'use strict';
  const CI={marine:'#1d2760',orange:'#e8741f',weiss:'#ffffff',tinte:'#1c1c22',papier:'#f6f6f2'};
  const FONTS={condensed:{name:'Barlow Condensed',file:'bandenstudio-condensed.ttf'},barlow:{name:'Barlow',file:'bandenstudio-barlow.ttf'},anton:{name:'Anton',file:'bandenstudio-anton.ttf'}};
  const FORMATS=[['250x80',2500,800],['300x80',3000,800],['400x80',4000,800],['500x80',5000,800],['600x80',6000,800],['200x100',2000,1000]];
  const TEMPLATES=[['klar','Klar'],['marine','Marine'],['logo','Logo im Mittelpunkt'],['kante','Mit Farbkante']];
  const num=(v,min,max,fallback)=>Number.isFinite(+v)?Math.min(max,Math.max(min,+v)):fallback;
  const text=(v,max=180)=>String(v==null?'':v).replace(/[\u0000-\u0008\u000b-\u001f]/g,'').slice(0,max);
  const colour=(v,f=CI.marine)=>/^#[0-9a-f]{6}$/i.test(String(v))?String(v).toLowerCase():f;
  const clone=v=>JSON.parse(JSON.stringify(v));
  const copyDocument=d=>({...d,profile:d.profile?{...d.profile}:null,assets:{...d.assets},elements:d.elements.map(e=>({...e}))});
  const uid=()=>typeof crypto!=='undefined'&&crypto.randomUUID?crypto.randomUUID():'bd-'+Date.now().toString(36)+'-'+Math.random().toString(36).slice(2,10);
  const esc=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&apos;'}[c]));
  const isRaster=s=>/^data:image\/(png|jpeg|webp);base64,[A-Za-z0-9+/=]+$/.test(s||'');
  const hexRGB=h=>[1,3,5].map(i=>parseInt(h.slice(i,i+2),16));
  function normalise(raw){
    if(!raw||raw.schema!=='svbsc.bande'||raw.version!==1)throw Error('Das ist kein Bandenstudio-Projekt dieser Fassung.');
    if(!Array.isArray(raw.elements)||raw.elements.length>60)throw Error('Ein Projekt kann höchstens 60 Elemente enthalten.');
    const d={schema:'svbsc.bande',version:1,id:text(raw.id,80)||uid(),title:text(raw.title,120),width:num(raw.width,100,20000,3000),height:num(raw.height,100,3000,800),bleed:num(raw.bleed,0,100,20),safe:num(raw.safe,0,200,40),background:colour(raw.background,CI.weiss),scale:raw.scale===10?10:1,minDpi:num(raw.minDpi,50,300,100),mode:raw.mode==='cmyk'?'cmyk':'rgb',rgbAccepted:raw.rgbAccepted===true,profile:null,assets:{},elements:[],updated:text(raw.updated,40)};
    if(d.safe>=Math.min(d.width,d.height)/2)throw Error('Der Sicherheitsabstand muss kleiner als die halbe kurze Seite sein.');
    const entries=Object.entries(raw.assets||{});if(entries.length>20)throw Error('Ein Projekt kann höchstens 20 Bilder enthalten.');
    let bytes=0;
    for(const [id,a] of entries){
      if(!/^[a-zA-Z0-9_-]{1,90}$/.test(id)||['__proto__','constructor','prototype'].includes(id)||!a||typeof a!=='object')throw Error('Eine Bildkennung ist ungültig.');
      if(!isRaster(a.src)||a.src.length>40*1024*1024)throw Error('Ein Bild hat ein unbekanntes oder zu großes Format.');
      bytes+=a.src.length+(typeof a.original==='string'?a.original.length:0);if(bytes>90*1024*1024)throw Error('Die Projektbilder sind zusammen zu groß.');
      const asset={name:text(a.name,120),src:a.src,width:num(a.width,1,30000,1),height:num(a.height,1,30000,1),kind:'raster',light:a.light===true};
      if(a.original){if(!isRaster(a.original))throw Error('Das Originalbild ist ungültig.');asset.original=a.original;}
      if(a.vector){
        const v=a.vector;if(!Array.isArray(v.paths)||!v.paths.length||v.paths.length>1500)throw Error('Das Vektorlogo hat zu viele oder keine Formen.');
        asset.vector={width:num(v.width,.001,100000,1),height:num(v.height,.001,100000,1),paths:v.paths.map(p=>{
          if(typeof p.d!=='string'||p.d.length>250000||!/^[MmLlHhVvCcSsQqTtAaZzEe0-9.,+\s-]+$/.test(p.d))throw Error('Ein Vektorpfad ist ungültig.');
          if((p.d.match(/[+-]?(?:\d*\.)?\d+(?:e[+-]?\d+)?/gi)||[]).some(n=>!Number.isFinite(+n)||Math.abs(+n)>10000000))throw Error('Ein Vektorpfad liegt außerhalb des zulässigen Bereichs.');
          const fill=p.fill==='none'?'none':colour(p.fill,'#000000'),stroke=p.stroke==='none'?'none':colour(p.stroke,'#000000');
          return {d:p.d,fill,stroke,strokeWidth:num(p.strokeWidth,0,1000,0),opacity:num(p.opacity,0,1,1),rule:p.rule==='evenodd'?'evenodd':'nonzero'};
        })};asset.kind='vector';
      }
      d.assets[id]=asset;
    }
    if(raw.profile){if(typeof raw.profile.data!=='string'||!/^[A-Za-z0-9+/=]+$/.test(raw.profile.data)||raw.profile.data.length>12*1024*1024)throw Error('Das Druckprofil ist ungültig.');d.profile={name:text(raw.profile.name,120),data:raw.profile.data};}
    const ids=new Set();
    for(const e of raw.elements){
      if(!e||!['text','image','rect'].includes(e.type))throw Error('Ein Gestaltungselement ist unbekannt.');
      const id=text(e.id,90);if(!/^[a-zA-Z0-9_-]{1,90}$/.test(id)||ids.has(id))throw Error('Die Elementkennungen sind ungültig.');ids.add(id);
      const el={id,type:e.type,x:num(e.x,-100,20100,0),y:num(e.y,-100,3100,0),w:num(e.w,.5,20000,100),h:num(e.h,.5,3000,100),locked:e.locked===true};
      if(e.type==='text')Object.assign(el,{text:text(e.text),role:['name','claim','web'].includes(e.role)?e.role:'text',font:Object.prototype.hasOwnProperty.call(FONTS,e.font)?e.font:'condensed',size:num(e.size,2,2000,100),fill:colour(e.fill),align:['left','center','right'].includes(e.align)?e.align:'left'});
      if(e.type==='rect')el.fill=colour(e.fill);
      if(e.type==='image'){if(!Object.prototype.hasOwnProperty.call(d.assets,e.asset))throw Error('Ein verwendetes Logo fehlt im Projekt.');el.asset=e.asset;}
      d.elements.push(el);
    }
    return d;
  }
  function create(title=''){return normalise({schema:'svbsc.bande',version:1,id:uid(),title,width:3000,height:800,bleed:20,safe:40,background:CI.weiss,scale:1,minDpi:100,mode:'rgb',elements:[],assets:{}});}
  function template(doc,key,fields={}){
    const d=copyDocument(doc),W=d.width,H=d.height,m=Math.max(d.safe,H*.075),contact=text(fields.web||'',100),name=text(fields.name||fields.title||d.title||'FIRMENNAME',120),claim=text(fields.claim||'',100),logo=fields.asset||doc.elements.find(e=>e.type==='image')?.asset||Object.keys(d.assets)[Object.keys(d.assets).length-1];
    const light=!!d.assets[logo]?.light,dark=key==='marine'||light&&['klar','logo'].includes(key);
    d.background=dark?CI.marine:CI.weiss;d.elements=[];
    const rect=(x,y,w,h,fill)=>d.elements.push({id:uid(),type:'rect',x,y,w,h,fill,locked:false});
    const txt=(value,x,y,w,h,size,font,fill,align='left',role='text')=>{if(value)d.elements.push({id:uid(),type:'text',x,y,w,h,text:value,role,size,font,fill,align,locked:false});};
    const img=(x,y,w,h)=>{if(logo)d.elements.push({id:uid(),type:'image',asset:logo,x,y,w,h,locked:false});};
    const ink=dark?CI.weiss:CI.marine;
    if(key==='logo'){
      img(W*.13,H*.13,W*.74,H*.53);if(!logo)txt(name,m,H*.12,W-2*m,H*.57,H*.35,'condensed',ink,'center','name');
      txt(logo?claim:'',m,H*.69,W-2*m,H*.12,H*.11,'barlow',ink,'center','claim');txt(contact,m,H*.85,W-2*m,H*.09,H*.075,'barlow',ink,'center','web');
    }else{
      const lw=logo?Math.min(W*.28,H*1.25):0,nx=logo?m+lw+H*.10:m,nw=W-m-nx;
      if(logo){if(key==='marine'&&!light)rect(m-12,H*.13-12,lw+24,H*.59+24,CI.weiss);img(m,H*.13,lw,H*.59);}
      txt(name,nx,H*.16,nw,H*.36,H*.34,'condensed',ink,'left','name');
      txt(claim,nx,H*.57,nw,H*.14,H*.105,'barlow',ink,'left','claim');
      rect(nx,H*.77,Math.min(nw*.28,600),Math.max(5,H*.012),CI.orange);
      txt(contact,nx,H*.84,nw,H*.09,H*.072,'barlow',ink,'left','web');
      if(key==='kante')rect(W-H*.09,0,H*.09,H,CI.orange);
    }
    return normalise(d);
  }
  function fitImage(e,a){const s=Math.min(e.w/a.width,e.h/a.height),w=a.width*s,h=a.height*s;return {x:e.x+(e.w-w)/2,y:e.y+(e.h-h)/2,w,h};}
  function textPath(e,font){
    if(!font)throw Error('Die CI-Schrift ist noch nicht geladen.');
    const lines=e.text.split(/\r?\n/).slice(0,4),fs=e.size,paths=lines.map((line,i)=>font.getPath(line,0,i*fs*1.15,fs,{kerning:true})),bounds=paths.map(p=>p.getBoundingBox());
    const x1=Math.min(...bounds.map(b=>b.x1)),x2=Math.max(...bounds.map(b=>b.x2)),y1=Math.min(...bounds.map(b=>b.y1)),y2=Math.max(...bounds.map(b=>b.y2)),s=Math.min(1,e.w/Math.max(.001,x2-x1),e.h/Math.max(.001,y2-y1));
    let x=e.x-x1*s;if(e.align==='center')x+=(e.w-(x2-x1)*s)/2;else if(e.align==='right')x+=e.w-(x2-x1)*s;
    const y=e.y-y1*s;
    const path=font.getPath('',0,0,fs);path.commands=[];
    let px=0,py=0,mx=0,my=0;
    for(const p of paths)for(const c of p.commands){let n={...c};for(const k of ['x','x1','x2'])if(k in n)n[k]=n[k]*s+x;for(const k of ['y','y1','y2'])if(k in n)n[k]=n[k]*s+y;
      // PDF has cubic curves only. Convert TrueType quadratics exactly, never via PDF's v shorthand.
      if(n.type==='Q')n={type:'C',x1:px+2/3*(n.x1-px),y1:py+2/3*(n.y1-py),x2:n.x+2/3*(n.x1-n.x),y2:n.y+2/3*(n.y1-n.y),x:n.x,y:n.y};
      path.commands.push(n);if(n.type==='M'){mx=n.x;my=n.y;}if('x'in n){px=n.x;py=n.y;}if(n.type==='Z'){px=mx;py=my;}
    }
    return {d:path.toPathData(4),size:fs*s,bounds:{x,y:e.y,w:(x2-x1)*s,h:(y2-y1)*s}};
  }
  function preflight(doc,fonts={},trusted=false){
    const d=trusted?doc:normalise(doc),issues=[];const add=(level,message,id)=>issues.push({level,message,id:id||null});
    if(!d.elements.some(e=>e.type==='image'||e.type==='text'&&e.text.trim()&&e.text!=='FIRMENNAME'))add('stop','Trag den Firmennamen ein oder setze ein Logo auf die Bande.');
    if(d.mode==='cmyk'&&!d.profile)add('stop','Für CMYK fehlt das ICC-Profil der Druckerei.');
    if(d.mode==='rgb'&&!d.rgbAccepted)add('stop','Bestätige, dass die Druckerei RGB-Daten annimmt, oder wähle CMYK mit ihrem ICC-Profil.');
    for(const e of d.elements){
      if(e.type!=='rect'&&(e.x<d.safe-.1||e.y<d.safe-.1||e.x+e.w>d.width-d.safe+.1||e.y+e.h>d.height-d.safe+.1))add('stop','Ein Logo oder Text liegt außerhalb des Sicherheitsabstands.',e.id);
      if(e.type==='image'){
        const a=d.assets[e.asset],b=fitImage(e,a),dpi=Math.min(a.width/(b.w/25.4),a.height/(b.h/25.4));
        if(!a.vector&&dpi<d.minDpi)add('stop','Das Logo erreicht nur '+Math.floor(dpi)+' dpi. Benötigt werden '+d.minDpi+' dpi. Setze es kleiner oder lade eine größere Datei bzw. ein Vektorlogo.',e.id);
        let ground=d.background;for(const lower of d.elements.slice(0,d.elements.indexOf(e)))if(lower.type==='rect'&&lower.x<=b.x&&lower.y<=b.y&&lower.x+lower.w>=b.x+b.w&&lower.y+lower.h>=b.y+b.h)ground=lower.fill;
        if(a.light&&hexRGB(ground).every(v=>v>=220))add('hint','Ein helles Logo liegt auf hellem Grund. Prüfe die Sichtbarkeit oder wähle eine der dunklen CI-Vorlagen.',e.id);
      }
      if(e.type==='text'){
        const f=fonts[e.font];if(!f)add('stop','Die Schrift '+FONTS[e.font].name+' ist nicht geladen.',e.id);
        else if([...e.text.replace(/\s/g,'')].some(c=>f.charToGlyph(c).index===0))add('stop','Ein Zeichen fehlt in der gewählten Schrift. Bitte ersetze es.',e.id);
        else if(e.text.trim()){const p=textPath(e,f);if(p.size<e.size*.75)add('hint','Ein langer Text wird deutlich verkleinert. Kürze ihn für die Fernwirkung.',e.id);}
      }
    }
    return {ok:!issues.some(x=>x.level==='stop'),issues};
  }
  function history(first,limit=40){let rows=[copyDocument(first)],at=0;const state=d=>JSON.stringify({...d,assets:Object.keys(d.assets),profile:d.profile?{name:d.profile.name}:null});return {push(d){const old=rows[at],sameAssets=Object.keys(d.assets).every(k=>d.assets[k].src===old.assets[k]?.src),sameProfile=d.profile?.data===old.profile?.data;if(state(d)===state(old)&&sameAssets&&sameProfile)return;rows=rows.slice(0,at+1);rows.push(copyDocument(d));if(rows.length>limit)rows.shift();at=rows.length-1;},undo(){if(at>0)at--;return copyDocument(rows[at]);},redo(){if(at<rows.length-1)at++;return copyDocument(rows[at]);},get canUndo(){return at>0;},get canRedo(){return at<rows.length-1;}};}
  // Border-connected background removal. Internal white brand details remain untouched.
  function cutout(input,w,h,tolerance=30,region){
    if(!Number.isSafeInteger(w)||!Number.isSafeInteger(h)||w<1||h<1||w*h>24000000||input.length!==w*h*4)throw Error('Das Bild ist zu groß oder beschädigt.');
    const r=region||{x:0,y:0,w,h},left=Math.max(0,Math.floor(r.x)),top=Math.max(0,Math.floor(r.y)),right=Math.min(w,Math.ceil(r.x+r.w)),bottom=Math.min(h,Math.ceil(r.y+r.h)),W=right-left,H=bottom-top;
    if(W<2||H<2)throw Error('Markiere einen größeren Logo-Bereich.');
    const p=new Uint8ClampedArray(W*H*4);for(let y=0;y<H;y++)p.set(input.subarray(((top+y)*w+left)*4,((top+y)*w+right)*4),y*W*4);
    const border=[];for(let x=0;x<W;x++)border.push(x,(H-1)*W+x);for(let y=1;y<H-1;y++)border.push(y*W,y*W+W-1);
    const counts=new Map();let transparent=0;for(const k of border){const j=k*4;if(p[j+3]<20){transparent++;continue;}const key=(p[j]>>4)*256+(p[j+1]>>4)*16+(p[j+2]>>4);counts.set(key,(counts.get(key)||0)+1);}
    let key=0,count=0;counts.forEach((v,k)=>{if(v>count){key=k;count=v;}});
    const already=transparent/border.length>.6,uniform=count/Math.max(1,border.length-transparent)>.55;
    let removed=0,bg=null;
    if(!already&&uniform&&tolerance>0){
      let rr=0,gg=0,bb=0,n=0;for(const k of border){const j=k*4,q=(p[j]>>4)*256+(p[j+1]>>4)*16+(p[j+2]>>4);if(q===key&&p[j+3]>20){rr+=p[j];gg+=p[j+1];bb+=p[j+2];n++;}}
      bg=[rr/n,gg/n,bb/n];const near=k=>{const j=k*4;return p[j+3]<20||Math.hypot(p[j]-bg[0],p[j+1]-bg[1],p[j+2]-bg[2])<=tolerance;};
      const seen=new Uint8Array(W*H),queue=new Int32Array(W*H);let start=0,end=0;
      for(const k of border)if(!seen[k]&&near(k)){seen[k]=1;queue[end++]=k;}
      while(start<end){const k=queue[start++],x=k%W,y=Math.floor(k/W);for(const next of [x>0?k-1:-1,x<W-1?k+1:-1,y>0?k-W:-1,y<H-1?k+W:-1])if(next>=0&&!seen[next]&&near(next)){seen[next]=1;queue[end++]=next;}}
      for(let k=0;k<W*H;k++)if(seen[k]){p[k*4+3]=0;removed++;}
    }
    let x0=W,y0=H,x1=-1,y1=-1;for(let y=0;y<H;y++)for(let x=0;x<W;x++)if(p[(y*W+x)*4+3]>24){x0=Math.min(x0,x);y0=Math.min(y0,y);x1=Math.max(x1,x);y1=Math.max(y1,y);}
    if(x1<0)throw Error('Dabei bleibt kein Logo übrig. Verringere die Stärke oder nutze das Original.');
    const pad=Math.max(1,Math.round(Math.max(x1-x0,y1-y0)*.01));x0=Math.max(0,x0-pad);y0=Math.max(0,y0-pad);x1=Math.min(W-1,x1+pad);y1=Math.min(H-1,y1+pad);
    const cw=x1-x0+1,ch=y1-y0+1,out=new Uint8ClampedArray(cw*ch*4);for(let y=0;y<ch;y++)out.set(p.subarray(((y+y0)*W+x0)*4,((y+y0)*W+x0+cw)*4),y*cw*4);
    return {data:out,width:cw,height:ch,removed,background:bg,confidence:already?'transparent':uniform&&removed?'einfarbig':'prüfen',crop:{x:left+x0,y:top+y0,w:cw,h:ch}};
  }
  const api={CI,FONTS,FORMATS,TEMPLATES,num,text,colour,clone,uid,esc,isRaster,hexRGB,normalise,create,template,fitImage,textPath,preflight,history,cutout};
  if(typeof module!=='undefined'&&module.exports)module.exports=api;else root.BD_CORE=api;
})(typeof window!=='undefined'?window:globalThis);
