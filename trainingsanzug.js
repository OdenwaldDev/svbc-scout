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
  function aufdruck(x,im,q,seite){const iw=im.naturalWidth||im.width,ih=im.naturalHeight||im.height,w=(Math.hypot(q[1][0]-q[0][0],q[1][1]-q[0][1])+Math.hypot(q[2][0]-q[3][0],q[2][1]-q[3][1]))/2,h=(Math.hypot(q[3][0]-q[0][0],q[3][1]-q[0][1])+Math.hypot(q[2][0]-q[1][0],q[2][1]-q[1][1]))/2,s=Math.min(w/iw,h/ih),uw=iw*s/w,vh=ih*s/h,u0=(1-uw)/2,v0=(1-vh)/2;
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
    const A=r[0],B=[r[1][0]-A[0],r[1][1]-A[1]],C=[r[3][0]-A[0],r[3][1]-A[1]],D=[r[2][0]-r[1][0]-r[3][0]+A[0],r[2][1]-r[1][1]-r[3][1]+A[1]];
    const radius=Math.max(2,Math.round(x.canvas.width*.007));
    const hell=(px,py)=>licht[Math.min(H-1,Math.max(0,py))*W+Math.min(W-1,Math.max(0,px))];
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
      const lx=hell(px+radius,py)-hell(px-radius,py),ly=hell(px,py+radius)-hell(px,py-radius);
      const kanten=4*u*(1-u), innen=4*v*(1-v);
      u=horizontal+kanten*lx*.00030;
      v+=innen*(.038*kanten+ly*.00040);
      const tx=Math.max(0,Math.min(sw-1,u*sw-.5)),ty=Math.max(0,Math.min(sh-1,v*sh-.5));
      const ix=Math.floor(tx),iy=Math.floor(ty),dx=tx-ix,dy=ty-iy;
      const alpha=(xx,yy)=>maske[(yy*sw+xx)*4+3]/255;
      const deckung=(alpha(ix,iy)*(1-dx)+alpha(Math.min(ix+1,sw-1),iy)*dx)*(1-dy)
        +(alpha(ix,Math.min(iy+1,sh-1))*(1-dx)+alpha(Math.min(ix+1,sw-1),Math.min(iy+1,sh-1))*dx)*dy;
      // Das schwarze Transfermaterial übernimmt Licht, Schatten und die feine Struktur des Fotos.
      const l=hell(px,py),detail=l-(hell(px-1,py)+hell(px+1,py)+hell(px,py-1)+hell(px,py+1))/4;
      const schwarz=Math.min(55,Math.max(9,12+(l-155)*.29+detail*.8));
      const pos=(py*W+px)*4;
      for(let c=0;c<3;c++)pixel[pos+c]+=deckung*(schwarz-pixel[pos+c]);
    }
    x.putImageData(stoff,ox,oy);
  }
  async function zeichnen(o={}){const seite=o.seite||'aermel_r',s=SEITEN[seite];if(!s)throw Error('Bitte einen linken oder rechten Ärmel wählen.');const W=Math.max(360,Math.min(1536,Math.round(+o.breite||1200))),H=Math.round(W*2/3),c=canvas(W,H),x=c.getContext('2d'),base=await bild((o.kit||'kit/')+'anzug/'+s.datei);x.drawImage(base,0,0,W,H);
    let src=o.logo;if(src){if(typeof LOGO==='undefined')throw Error('Die Logoaufbereitung wird noch geladen. Bitte versuche es erneut.');src=await LOGO.alsDataUrl(src,'schwarz',1600);}else{const t=canvas(1200,280),tx=t.getContext('2d');tx.fillStyle='#111111';tx.textAlign='center';tx.textBaseline='middle';tx.font='700 100px BarlowC,Arial,sans-serif';const name=String(o.firma||'Euer Name').trim().slice(0,120),tw=tx.measureText(name).width;if(tw>1120)tx.font='700 '+Math.floor(100*1120/tw)+'px BarlowC,Arial,sans-serif';tx.fillText(name,600,140);src=t.toDataURL('image/png');}
    aufdruck(x,await bild(src),feld(seite,W,H),seite);return c;}
  async function bilder(firma,logo,kit='kit/'){const key=JSON.stringify([firma,logo||null,kit]);if(zuletzt?.key===key)return zuletzt.p;const job={key,p:null};zuletzt=job;job.p=(async()=>{const b={gesamt_foto:true};for(const seite of Object.keys(SEITEN)){const c=await zeichnen({firma,logo,seite,kit,breite:1200});b[seite]=c.toDataURL('image/webp',.94);b[seite==='aermel_l'?'gesamt_l':'gesamt_r']=b[seite];c.width=c.height=1;}return b;})().catch(e=>{if(zuletzt===job)zuletzt=null;throw e;});return job.p;}
  const api={zeichnen,bilder,feld,punkt};if(typeof module!=='undefined'&&module.exports)module.exports=api;else root.TRAININGSANZUG=api;
})(typeof window!=='undefined'?window:globalThis);
