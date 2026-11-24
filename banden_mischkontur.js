// Druckfähige Flächenfarben aus einer manuell gewählten Raster-Bildmarke. Kein Dithering.
importScripts('vendor/bandenstudio/imagetracer-1.2.6.js');
self.onmessage=({data:{bild}})=>{
  try {
    const {width:w,height:h,data:p}=bild;
    if(w*h>2500000) throw Error('Die Vorlage ist zu groß. Bitte das einzelne Zeichen auswählen.');
    const bins=new Map();
    let count=0, alpha=0, left=w, top=h, right=-1, bottom=-1;
    const rgb=(i)=>p[i]*65536+p[i+1]*256+p[i+2];
    const close=(i,j)=>Math.max(Math.abs(p[i]-p[j]),Math.abs(p[i+1]-p[j+1]),Math.abs(p[i+2]-p[j+2]))<=5;
    for(let y=0;y<h;y++) for(let x=0;x<w;x++){
      const i=(w*y+x)*4;
      if(p[i+3]<128) continue;
      count++;
      left=Math.min(left,x);top=Math.min(top,y);right=Math.max(right,x);bottom=Math.max(bottom,y);
      if(p[i+3]<238){alpha++;continue;}
      // Sample flat interiors. Antialiased seams are assigned to the two adjoining true colours later.
      if(x+1===w||y+1===h||p[i+7]<238||p[i+4*w+3]<238||!close(i,i+4)||!close(i,i+4*w)) continue;
      const cell=(p[i]>>3)*1024+(p[i+1]>>3)*32+(p[i+2]>>3), colour=rgb(i);
      let bin=bins.get(cell);
      if(!bin){bin={n:0,tones:new Map()};bins.set(cell,bin);}
      bin.n++;bin.tones.set(colour,(bin.tones.get(colour)||0)+1);
    }
    if(!count) throw Error('Im gewählten Ausschnitt ist keine Bildmarke sichtbar.');
    const breite=right-left+1,hoehe=bottom-top+1;
    if(Math.max(breite,hoehe)<160||Math.min(breite,hoehe)<22)
      throw Error('Die Bildmarke ist für eine saubere Kontur zu klein. Bitte eine größere Vorlage verwenden.');
    const komplex='Die Bildmarke enthält Verläufe, Transparenzen oder zu viele Farbtöne. Bitte eine Original-SVG mit Farbflächen verwenden.';
    if(alpha/count>.12) throw Error(komplex);
    const colours=[];
    const dist=(r,g,b,c)=>Math.max(Math.abs(r-c.r),Math.abs(g-c.g),Math.abs(b-c.b));
    const ordered=[...bins.entries()].sort((a,b)=>b[1].n-a[1].n||a[0]-b[0]);
    for(const [,bin] of ordered){
      if(bin.n<Math.max(5,count*.0002)) break;
      // A real source colour, not the centre of a quantisation cell.
      const [n]=[...bin.tones.entries()].sort((a,b)=>b[1]-a[1]||a[0]-b[0])[0];
      const r=n>>16,g=(n>>8)&255,b=n&255;
      if(!colours.some(c=>dist(r,g,b,c)<=13)) colours.push({r,g,b,a:255});
      if(colours.length>12) throw Error(komplex);
    }
    if(!colours.length) throw Error(komplex);
    let abweichend=0;
    const transparent={r:0,g:0,b:0,a:0};
    for(let i=0;i<p.length;i+=4){
      let farbe=transparent;
      if(p[i+3]>=128){
        let min=Infinity;
        for(const c of colours){
          const d=dist(p[i],p[i+1],p[i+2],c);
          if(d<min){farbe=c;min=d;}
        }
        if(p[i+3]>=238&&min>27) abweichend++;
      }
      p[i]=farbe.r;p[i+1]=farbe.g;p[i+2]=farbe.b;p[i+3]=farbe.a;
    }
    if(abweichend/count>.015) throw Error(komplex);
    const opt={pal:[...colours,transparent],colorquantcycles:1,pathomit:0,strokewidth:0,
      ltres:.45,qtres:.45,roundcoords:2,rightangleenhance:true,scale:1};
    const tr=ImageTracer.imagedataToTracedata(bild,opt), paths=[];
    let laenge=0;
    for(let j=0;j<colours.length;j++){
      const c=colours[j];
      const fill='#'+[c.r,c.g,c.b].map(v=>v.toString(16).padStart(2,'0')).join('');
      for(let i=0;i<tr.layers[j].length;i++){
        if(tr.layers[j][i].isholepath) continue;
        const d=ImageTracer.svgpathstring(tr,j,i,opt).match(/ d="([^"]+)"/)?.[1];
        if(!d) continue;
        laenge+=d.length;
        if(paths.length>=900||laenge>650000||d.length>248000) throw Error(komplex);
        paths.push({d,fill,stroke:'none',strokeWidth:0,opacity:1,rule:'evenodd'});
      }
    }
    if(!paths.length) throw Error('Der Ausschnitt enthält keine druckbare Kontur.');
    self.postMessage({marke:{paths,x:left,y:top,w:breite,h:hoehe}});
  } catch(e){self.postMessage({fehler:e.message});}
};
