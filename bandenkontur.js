// Einfarbige CI-Fassung auf dem Gerät vektorisieren. Beide Farbebenen sind fest vorgegeben.
importScripts('vendor/bandenstudio/imagetracer-1.2.6.js');
self.onmessage=({data:{bild,farbe}})=>{
  try {
    const {width,height,data}=bild;
    if(Math.max(width,height)<200||Math.min(width,height)<22||width*height>2500000)
      throw Error('Für saubere Konturen bitte eine größere Originaldatei oder eine SVG verwenden.');
    for(let i=0;i<data.length;i+=4) {
      const ton=data[i+3]>=128?0:255;
      data[i]=data[i+1]=data[i+2]=ton;data[i+3]=255;
    }
    const opt={pal:[{r:0,g:0,b:0,a:255},{r:255,g:255,b:255,a:255}],colorquantcycles:1,
      pathomit:0,strokewidth:0,ltres:.45,qtres:.45,roundcoords:2,rightangleenhance:true,scale:1};
    const tr=ImageTracer.imagedataToTracedata(bild,opt);
    const layer=tr.layers[0],pfade=[];
    for(let i=0;i<layer.length;i++){
      if(layer[i].isholepath)continue;
      const d=ImageTracer.svgpathstring(tr,0,i,opt).match(/ d="([^"]+)"/)?.[1];
      if(d)pfade.push('<path fill="'+farbe+'" fill-rule="evenodd" d="'+d+'"/>');
    }
    if(!pfade.length||pfade.length>1000||pfade.join('').length>650000)
      throw Error('Die Kontur ist zu detailreich. Bitte die Original-Vektordatei hinterlegen.');
    self.postMessage({svg:'<svg xmlns="http://www.w3.org/2000/svg" width="'+width+'" height="'+height+'" viewBox="0 0 '+width+' '+height+'">'+pfade.join('')+'</svg>'});
  }catch(e){self.postMessage({fehler:e.message});}
};
