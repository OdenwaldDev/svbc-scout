/* Trainingsanzug: dieselbe fotobasierte Ärmelvorlage für jede Firma.
   Originale bleiben erhalten. Das Logo wird schwarz auf den Stoff gesetzt. */
(function(root){
  'use strict';
  const SEITEN={
    aermel_l:{datei:'aermel-links.webp',feld:[[.503,.352],[.737,.370],[.755,.554],[.485,.542]]},
    aermel_r:{datei:'aermel-rechts.webp',feld:[[.257,.370],[.493,.352],[.514,.542],[.238,.554]]}
  };
  const cache=new Map();let zuletzt=null;
  function canvas(w,h){const c=document.createElement('canvas');c.width=w;c.height=h;return c;}
  function bild(src){if(cache.has(src))return cache.get(src);const p=new Promise((ok,nein)=>{const im=new Image();im.onload=()=>ok(im);im.onerror=()=>nein(Error('Die Anzugvorschau konnte nicht geladen werden. Bitte versuche es erneut.'));if(!/^data:|^blob:/.test(src))im.crossOrigin='anonymous';im.src=src;});cache.set(src,p);p.catch(()=>cache.delete(src));return p;}
  function feld(seite,w,h){const s=SEITEN[seite];if(!s)throw Error('Bitte einen linken oder rechten Ärmel wählen.');return s.feld.map(([x,y])=>[x*w,y*h]);}
  function punkt(q,u,v){return [(1-v)*((1-u)*q[0][0]+u*q[1][0])+v*((1-u)*q[3][0]+u*q[2][0]),(1-v)*((1-u)*q[0][1]+u*q[1][1])+v*((1-u)*q[3][1]+u*q[2][1])];}
  function aufdruck(x,im,q,seite,variante,trikot){const iw=im.naturalWidth||im.width,ih=im.naturalHeight||im.height,w=(Math.hypot(q[1][0]-q[0][0],q[1][1]-q[0][1])+Math.hypot(q[2][0]-q[3][0],q[2][1]-q[3][1]))/2,h=(Math.hypot(q[3][0]-q[0][0],q[3][1]-q[0][1])+Math.hypot(q[2][0]-q[1][0],q[2][1]-q[1][1]))/2,s=Math.min(w/iw,h/ih),uw=iw*s/w,vh=ih*s/h,u0=(1-uw)/2,v0=(1-vh)/2;
    // Ein durchgehender Aufdruck statt einzeln geglätteter Dreiecke: keine hellen Maschennähte im Logo.
    const r=[[u0,v0],[u0+uw,v0],[u0+uw,v0+vh],[u0,v0+vh]].map(([u,v])=>punkt(q,u,v)),ox=Math.floor(Math.min(...r.map(p=>p[0]))),oy=Math.floor(Math.min(...r.map(p=>p[1]))),W=Math.ceil(Math.max(...r.map(p=>p[0])))-ox,H=Math.ceil(Math.max(...r.map(p=>p[1])))-oy;
    // Vor dem Abtasten verkleinern: dünne Striche bleiben auch bei großen Originaldateien glatt.
    const sw=Math.min(iw,Math.max(1,Math.ceil(W*1.5))),sh=Math.max(1,Math.round(ih*sw/iw));
    const sc=canvas(sw,sh),sx=sc.getContext('2d');
    sx.imageSmoothingQuality='high';sx.drawImage(im,0,0,sw,sh);
    const maske=sx.getImageData(0,0,sw,sh).data;
    const stoff=x.getImageData(ox,oy,W,H),pixel=stoff.data;
    const licht=new Float32Array(W*H);
    for(let i=0;i<licht.length;i++)licht[i]=(pixel[i*4]+2*pixel[i*4+1]+pixel[i*4+2])/4;
    const mittel=licht.reduce((sum,l)=>sum+l,0)/licht.length;
    const A=r[0],B=[r[1][0]-A[0],r[1][1]-A[1]],C=[r[3][0]-A[0],r[3][1]-A[1]],D=[r[2][0]-r[1][0]-r[3][0]+A[0],r[2][1]-r[1][1]-r[3][1]+A[1]];
    const radius=Math.max(2,Math.round(x.canvas.width*.007));
    const hell=(px,py)=>licht[Math.min(H-1,Math.max(0,py))*W+Math.min(W-1,Math.max(0,px))];
    // Falten aus einer verkleinerten Lichtkarte ableiten. Einzelne Maschen dürfen
    // feine Buchstaben nicht verziehen, bleiben aber in der Druckhelligkeit sichtbar.
    let faltenLicht=hell;
    if(trikot){
      const klein=canvas(Math.max(2,Math.ceil(W/radius)),Math.max(2,Math.ceil(H/radius)));
      const k=klein.getContext('2d');k.imageSmoothingQuality='high';
      k.drawImage(x.canvas,ox,oy,W,H,0,0,klein.width,klein.height);
      const farben=k.getImageData(0,0,klein.width,klein.height).data;
      const wert=(a,b)=>{const i=(b*klein.width+a)*4;return (farben[i]+2*farben[i+1]+farben[i+2])/4;};
      faltenLicht=(px,py)=>{
        const u=Math.max(0,Math.min(klein.width-1,(px+.5)*klein.width/W-.5));
        const v=Math.max(0,Math.min(klein.height-1,(py+.5)*klein.height/H-.5));
        const a=Math.floor(u),b=Math.floor(v),a1=Math.min(klein.width-1,a+1),b1=Math.min(klein.height-1,b+1);
        const du=u-a,dv=v-b;
        return (wert(a,b)*(1-du)+wert(a1,b)*du)*(1-dv)+(wert(a,b1)*(1-du)+wert(a1,b1)*du)*dv;
      };
    }
    const aussen=seite==='aermel_r'?-1:1;
    // Projektion eines zylindrischen Ärmels, leicht von vorn gesehen. Die äußere Kante läuft um den Arm.
    const mitte=aussen*.16,halbwinkel=.75*uw;
    const links=Math.sin(mitte-halbwinkel),bogen=Math.sin(mitte+halbwinkel)-links;
    for(let py=0;py<H;py++)for(let px=0;px<W;px++){
      const X=ox+px+.5,Y=oy+py+.5;
      let u=(X-A[0])/B[0],v=(Y-A[1])/C[1];
      for(let i=0;i<5;i++){
        const ex=A[0]+B[0]*u+C[0]*v+D[0]*u*v-X,ey=A[1]+B[1]*u+C[1]*v+D[1]*u*v-Y;
        const du=[B[0]+D[0]*v,B[1]+D[1]*v],dv=[C[0]+D[0]*u,C[1]+D[1]*u],det=du[0]*dv[1]-dv[0]*du[1];
        if(Math.abs(det)<1e-8)break;
        u-=(ex*dv[1]-ey*dv[0])/det;v-=(ey*du[0]-ex*du[1])/det;
      }
      if(u<0||u>1||v<0||v>1)continue;
      const horizontal=(Math.asin(links+u*bogen)-mitte+halbwinkel)/(2*halbwinkel);
      const lx=faltenLicht(px+radius,py)-faltenLicht(px-radius,py),ly=faltenLicht(px,py+radius)-faltenLicht(px,py-radius);
      const kanten=4*u*(1-u), innen=4*v*(1-v);
      u=horizontal+kanten*lx*.00030;
      v+=innen*(.038*kanten+ly*.00040);
      const tx=Math.max(0,Math.min(sw-1,u*sw-.5)),ty=Math.max(0,Math.min(sh-1,v*sh-.5));
      const ix=Math.floor(tx),iy=Math.floor(ty),dx=tx-ix,dy=ty-iy;
      const texel=(xx,yy,c)=>maske[(yy*sw+xx)*4+c];
      const alpha=(xx,yy)=>texel(xx,yy,3)/255;
      const deckung=(alpha(ix,iy)*(1-dx)+alpha(Math.min(ix+1,sw-1),iy)*dx)*(1-dy)
        +(alpha(ix,Math.min(iy+1,sh-1))*(1-dx)+alpha(Math.min(ix+1,sw-1),Math.min(iy+1,sh-1))*dx)*dy;
      // Das schwarze Transfermaterial übernimmt Licht, Schatten und die feine Struktur des Fotos.
      const l=hell(px,py),detail=l-(hell(px-1,py)+hell(px+1,py)+hell(px,py-1)+hell(px,py+1))/4;
      const schwarz=Math.min(55,Math.max(9,12+(l-155)*.29+detail*.8));
      const pos=(py*W+px)*4;
      if(!deckung)continue;
      const gewebelicht=Math.max(.55,Math.min(1.03,.91+(l-mittel)/230+detail/420));
      for(let c=0;c<3;c++){
        let tinte=schwarz;
        if(variante!=='schwarz'){
          const farbe=(xx,yy)=>texel(xx,yy,c)*alpha(xx,yy);
          const x1=Math.min(ix+1,sw-1),y1=Math.min(iy+1,sh-1);
          const wert=((farbe(ix,iy)*(1-dx)+farbe(x1,iy)*dx)*(1-dy)
            +(farbe(ix,y1)*(1-dx)+farbe(x1,y1)*dx)*dy)/deckung;
          tinte=schwarz+(255-schwarz)*(wert/255)*gewebelicht;
        }
        pixel[pos+c]+=deckung*(tinte-pixel[pos+c]);
      }
    }
    x.putImageData(stoff,ox,oy);
  }
  const TRIKOT={
    heim:{datei:'heim.webp',feld:[[.331,.285],[.605,.312],[.591,.642],[.288,.606]]},
    auswaerts:{datei:'auswaerts.webp',feld:[[.324,.265],[.634,.285],[.630,.628],[.277,.617]]}
  };
  function trikotFeld(art,seite,w,h){
    const trikot=TRIKOT[art];
    if(!trikot||!SEITEN[seite])throw Error('Bitte Trikot und Ärmelseite wählen.');
    const q=trikot.feld.map(([u,v])=>[u*w,v*h]);
    return seite==='aermel_l'?[1,0,3,2].map(i=>[w-q[i][0],q[i][1]]):q;
  }
  async function druckbild(o,variante){
    if(o.logo){
      if(typeof LOGO==='undefined')throw Error('Die Logoaufbereitung wird noch geladen. Bitte versuche es erneut.');
      return bild(await LOGO.alsDataUrl(o.logo,variante,1600));
    }
    const c=canvas(1200,280),x=c.getContext('2d'),name=String(o.firma||'Euer Name').trim().slice(0,120);
    x.fillStyle=variante==='schwarz'?'#111':variante.startsWith('farbe:')?variante.slice(6):'#fff';
    x.textAlign='center';x.textBaseline='middle';x.font='700 100px BarlowC,Arial,sans-serif';
    const breite=x.measureText(name).width;
    if(breite>1120)x.font='700 '+Math.floor(100*1120/breite)+'px BarlowC,Arial,sans-serif';
    x.fillText(name,600,140);
    return c;
  }
  async function motiv(o,trikot){
    const seite=o.seite||'aermel_r',seitenDaten=SEITEN[seite];
    if(!seitenDaten)throw Error('Bitte einen linken oder rechten Ärmel wählen.');
    const w=Math.max(360,Math.min(1536,Math.round(+o.breite||1200))),h=Math.round(w*2/3);
    const c=canvas(w,h),x=c.getContext('2d'),kit=o.kit||'kit/';
    const foto=await bild(kit+(trikot?'trikot-aermel/'+trikot.datei:'anzug/'+seitenDaten.datei));
    const spiegeln=trikot&&seite==='aermel_l';
    x.save();
    if(spiegeln){x.translate(w,0);x.scale(-1,1);}
    x.drawImage(foto,0,0,w,h);x.restore();
    if(o.leer)return c;
    let q=trikot?trikotFeld(o.art||'heim',seite,w,h):feld(seite,w,h);
    const groesse=Math.max(.5,Math.min(1.5,Number(o.groesse)||1));
    // Beim Trikot umschreibt das Viereck die maximale freie Fläche bis zu den Nähten.
    const faktor=trikot?(groesse<=1?.8*groesse:.8+.4*(groesse-1)):Math.min(1.12,groesse);
    const rand=(1-faktor)/2;
    q=[[rand,rand],[1-rand,rand],[1-rand,1-rand],[rand,1-rand]].map(([u,v])=>punkt(q,u,v));
    const variante=trikot?(o.variante||'weiss'):'schwarz';
    aufdruck(x,await druckbild(o,variante),q,seite,variante,trikot);
    return c;
  }
  const zeichnen=(o={})=>motiv(o,null);
  async function trikotDetail(o={}){
    const trikot=TRIKOT[o.art||'heim'];
    if(!trikot)throw Error('Bitte ein Heim- oder Auswärtstrikot wählen.');
    return motiv(o,trikot);
  }
  async function angebot(o={}){
    const artikel={heim:'Heimtrikot',auswaerts:'Auswärtstrikot',anzug:'Trainingsanzug'};
    if(!Object.hasOwn(artikel,o.art)||!Object.hasOwn(SEITEN,o.seite))throw Error('Bitte Kleidungsstück und Ärmel auswählen.');
    if(!o.logo)throw Error('Für diese Ärmelvorschau fehlt die Druckfassung des Firmenlogos.');
    const cv=await (o.art==='anzug'?zeichnen(o):trikotDetail({...o,variante:'weiss'}));
    cv.setAttribute('role','img');
    cv.setAttribute('aria-label',(o.firma||'Euer Logo')+' auf dem '+(o.seite==='aermel_l'?'linken':'rechten')+' Ärmel · '+artikel[o.art]);
    return cv;
  }
  async function bilder(firma,logo,kit='kit/'){const key=JSON.stringify([firma,logo||null,kit]);if(zuletzt?.key===key)return zuletzt.p;const job={key,p:null};zuletzt=job;job.p=(async()=>{const b={gesamt_foto:true};for(const seite of Object.keys(SEITEN)){const c=await zeichnen({firma,logo,seite,kit,breite:1200});b[seite]=c.toDataURL('image/webp',.94);b[seite==='aermel_l'?'gesamt_l':'gesamt_r']=b[seite];c.width=c.height=1;}return b;})().catch(e=>{if(zuletzt===job)zuletzt=null;throw e;});return job.p;}
  const api={zeichnen,trikotDetail,trikotFeld,bilder,feld,punkt,angebot};if(typeof module!=='undefined'&&module.exports)module.exports=api;else root.TRAININGSANZUG=api;
})(typeof window!=='undefined'?window:globalThis);
