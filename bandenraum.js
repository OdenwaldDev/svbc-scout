/* Begehbare Bandenansicht. Meter, Augenhöhe und Tafellängen bleiben unabhängig vom Bildschirm. */
window.BANDENRAUM=(()=>{
  'use strict';
  const kl=(n,a,b)=>Math.max(a,Math.min(b,n)), zahl=(n,v=0)=>Number.isFinite(+n)?+n:v;
  let threeP=null;
  function laden(src){
    if(window.THREE)return Promise.resolve(window.THREE);
    if(threeP)return threeP;
    threeP=new Promise((ja,nein)=>{const s=document.createElement('script');s.src=src;
      s.onload=()=>window.THREE?ja(window.THREE):nein(new Error('Die 3D-Bibliothek fehlt.'));
      s.onerror=()=>{s.remove();nein(new Error('Die 3D-Ansicht konnte nicht geladen werden.'));};document.head.appendChild(s);
    }).catch(e=>{threeP=null;throw e;});return threeP;
  }
  function gueltigeTafeln(ta){return (Array.isArray(ta)?ta:[]).filter(t=>t&&t.id!=null&&Number.isFinite(+t.x0)&&Math.abs(+t.x0)<1000&&+t.l>=.2&&+t.l<=20).map(t=>({...t,id:String(t.id),x0:+t.x0,l:+t.l,h:kl(zahl(t.h,.8),.3,2)}));}
  function grenzen(ta){const a=gueltigeTafeln(ta),links=a.length?Math.min(...a.map(t=>t.x0)):-52.5,rechts=a.length?Math.max(...a.map(t=>t.x0+t.l)):52.5;
    return {links,rechts,mitte:(links+rechts)/2,minX:links-6,maxX:rechts+6,minZ:-84,maxZ:-1.4};}
  function versetzen(p,vor,seit,sek,G){
    vor=zahl(vor);seit=zahl(seit);const n=Math.max(1,Math.hypot(vor,seit)),s=kl(zahl(sek),0,1)*3/n,w=zahl(p.blick);
    return {...p,x:kl(zahl(p.x)+(Math.sin(w)*vor+Math.cos(w)*seit)*s,G.minX,G.maxX),z:kl(zahl(p.z)+(Math.cos(w)*vor-Math.sin(w)*seit)*s,G.minZ,G.maxZ),y:1.65};
  }
  function erstellen(cv,opt={}){
    let lebt=true,T=null,renderer=null,szene=null,kamera=null,gruppe=null,belege=new Map(),tafeln=gueltigeTafeln(opt.tafeln),G=grenzen(tafeln),
      p={x:G.mitte,y:1.65,z:-12,blick:0,neigung:-.075},raf=0,letzteZeit=0,letzteMeldung=0,dirty=true,ro=null,drag=null;
    const tasten=new Set(),entsorger=[],geometrien=new Set(),materialien=new Set(),texturen=new Set(),treffer=[];
    const altTouch=cv.style.touchAction,altIndex=cv.getAttribute('tabindex');
    const meldung=t=>{if(lebt)opt.onStatus?.(t);};
    const aktiv=()=>lebt&&!document.hidden&&cv.isConnected;
    const geo=g=>(geometrien.add(g),g),mat=m=>(materialien.add(m),m),tex=t=>(texturen.add(t),t);
    const event=(e,n,fn,o)=>{e.addEventListener(n,fn,o);entsorger.push(()=>e.removeEventListener(n,fn,o));};
    function zustand(){return {x:p.x,y:1.65,z:p.z,blick:p.blick,neigung:p.neigung,abstand:-p.z};}
    function kameraSetzen(){if(!kamera)return;const co=Math.cos(p.neigung);kamera.position.set(-p.x,1.65,p.z);
      kamera.lookAt(-p.x-Math.sin(p.blick)*co,1.65+Math.sin(p.neigung),p.z+Math.cos(p.blick)*co);
      cv.dataset.kameraX=p.x.toFixed(2);cv.dataset.abstand=(-p.z).toFixed(2);cv.dataset.blick=p.blick.toFixed(3);
    }
    function anfordern(){dirty=true;if(!raf&&aktiv())raf=requestAnimationFrame(schritt);}
    function schritt(zeit){raf=0;if(!aktiv()){letzteZeit=0;return;}
      const dt=letzteZeit?kl((zeit-letzteZeit)/1000,0,.08):0;letzteZeit=zeit;
      if(document.activeElement===cv&&tasten.size){const vor=(tasten.has('w')||tasten.has('arrowup')?1:0)-(tasten.has('s')||tasten.has('arrowdown')?1:0),
        seit=(tasten.has('d')?1:0)-(tasten.has('a')?1:0),drehen=(tasten.has('arrowright')||tasten.has('e')?1:0)-(tasten.has('arrowleft')||tasten.has('q')?1:0);
        p=versetzen(p,vor,seit,dt,G);p.blick+=drehen*dt*1.15;dirty=true;
      }
      if(dirty&&renderer){kameraSetzen();renderer.render(szene,kamera);dirty=false;
        if(zeit-letzteMeldung>120){letzteMeldung=zeit;opt.onMove?.(zustand());}}
      if(tasten.size&&document.activeElement===cv)raf=requestAnimationFrame(schritt);else letzteZeit=0;
    }
    function sofort(){if(!renderer||!lebt)return;kameraSetzen();renderer.render(szene,kamera);dirty=false;}
    function groesse(){if(!renderer||!lebt)return;const r=cv.getBoundingClientRect(),w=Math.max(16,Math.round(r.width)),h=Math.max(16,Math.round(r.height));
      renderer.setPixelRatio(Math.min(2,window.devicePixelRatio||1));renderer.setSize(w,h,false);kamera.aspect=w/h;kamera.updateProjectionMatrix();sofort();}
    function entsorgen(o){if(!o)return;o.traverse?.(e=>{if(e.geometry){e.geometry.dispose();geometrien.delete(e.geometry);}for(const m of (Array.isArray(e.material)?e.material:[e.material]).filter(Boolean)){
      if(m.map&&texturen.has(m.map)){m.map.dispose();texturen.delete(m.map);}m.dispose();materialien.delete(m);}});o.parent?.remove(o);}
    function aufraeumen(){cancelAnimationFrame(raf);raf=0;tasten.clear();ro?.disconnect();entsorger.splice(0).forEach(f=>f());
      for(const t of texturen)t.dispose();for(const m of materialien)m.dispose();for(const g of geometrien)g.dispose();texturen.clear();materialien.clear();geometrien.clear();
      renderer?.dispose();renderer?.forceContextLoss?.();renderer=null;belege.clear();treffer.length=0;cv.style.touchAction=altTouch;
      if(altIndex===null)cv.removeAttribute('tabindex');else cv.setAttribute('tabindex',altIndex);}
    function mesh(g,m,x,y,z,schatten=true){const a=new T.Mesh(geo(g),m);a.position.set(x,y,z);a.castShadow=schatten;a.receiveShadow=true;szene.add(a);return a;}
    function quader(w,h,d,x,y,z,m,s=true){return mesh(new T.BoxGeometry(w,h,d),m,x,y,z,s);}
    function boden(w,h,x,z,m,y=0){const a=mesh(new T.PlaneGeometry(w,h),m,x,y,z,false);a.rotation.x=-Math.PI/2;return a;}
    function stab(a,b,r,m){const A=new T.Vector3(...a),B=new T.Vector3(...b),v=B.clone().sub(A),q=mesh(new T.CylinderGeometry(r,r,v.length(),7),m,...A.clone().add(B).multiplyScalar(.5).toArray());q.quaternion.setFromUnitVectors(new T.Vector3(0,1,0),v.normalize());return q;}
    function ladenTextur(src,wieder,material,relief=0){if(!src)return;new T.TextureLoader().load(src,t=>{if(!lebt){t.dispose();return;}tex(t);t.encoding=T.sRGBEncoding;t.wrapS=t.wrapT=T.RepeatWrapping;t.repeat.set(...wieder);t.anisotropy=Math.min(8,renderer.capabilities.getMaxAnisotropy());material.map=t;
      if(relief){const k=tex(t.clone());k.encoding=T.LinearEncoding;k.needsUpdate=true;material.bumpMap=k;material.bumpScale=relief;}
      material.needsUpdate=true;anfordern();},undefined,()=>{if(lebt)meldung('Die Materialien werden vereinfacht dargestellt. Du kannst die Plätze weiter ansehen.');});}
    function umfeld(){
      const mitte=-G.mitte,laenge=Math.max(105,G.rechts-G.links),aussen=laenge+50;
      const gras=mat(new T.MeshStandardMaterial({color:0x839080,roughness:1})),weg=mat(new T.MeshStandardMaterial({color:0xcac2b1,roughness:1})),
        bahn=mat(new T.MeshStandardMaterial({color:0x7c341b,roughness:.98})),metall=mat(new T.MeshStandardMaterial({color:0xb4b9b8,roughness:.65,metalness:.55})),
        weiss=mat(new T.MeshStandardMaterial({color:0xeeeade,roughness:.9}));
      const grundBreite=Math.max(320,aussen);boden(grundBreite,320,mitte,-20,gras,-.035);ladenTextur(opt.texturen?.rasen,[grundBreite/5,64],gras,.025);
      // Laufbahn und Sicherheitsabstand wie in der bisherigen Bandenansicht.
      boden(aussen,7.3,mitte,-4.75,bahn,.004);ladenTextur(opt.texturen?.weg,[aussen/1.7,7.3/1.7],bahn,.018);
      boden(aussen,2.2,mitte,2.3,weg,.005);ladenTextur(opt.texturen?.weg,[aussen/2.2,1],weg,.025);
      const linien=mat(new T.MeshBasicMaterial({color:0xebe8dc,transparent:true,opacity:.68,depthWrite:false}));
      [-6.6,-4.8,-3].forEach(z=>boden(aussen,.04,mitte,z,linien,.012));
      // Spielfeld: 105 × 68 m als Orientierung, keine erfundenen Tribünen.
      const feldX=mitte-52.5,feldZ=-78.1,strich=.1,feld=mat(new T.MeshBasicMaterial({color:0xf0efe2,transparent:true,opacity:.92,depthWrite:false}));
      [feldZ,feldZ+68].forEach(z=>boden(105,strich,mitte,z,feld,.014));
      [feldX,mitte,feldX+105].forEach(x=>boden(strich,68,x,feldZ+34,feld,.014));
      for(let i=0;i<10;i++){const f=mat(new T.MeshBasicMaterial({color:0xffffff,transparent:true,opacity:i%2?.018:.035,depthWrite:false}));boden(10.5,68,feldX+5.25+i*10.5,feldZ+34,f,.006);}
      const kreis=mesh(new T.RingGeometry(9.1,9.2,72),feld,mitte,.015,feldZ+34,false);kreis.rotation.x=-Math.PI/2;
      for(const seite of [-1,1]){
        const x=mitte+seite*52.5,innen=x-seite*16.5,z=feldZ+34;
        [z-20.16,z+20.16].forEach(zz=>boden(16.5,strich,(x+innen)/2,zz,feld,.014));boden(strich,40.32,innen,z,feld,.014);
        const kurz=x-seite*5.5;[z-9.16,z+9.16].forEach(zz=>boden(5.5,strich,(x+kurz)/2,zz,feld,.014));boden(strich,18.32,kurz,z,feld,.014);
        // Tore und zurückhaltende Netzstruktur bleiben maßstäblich.
        for(const zz of [z-3.66,z+3.66]){stab([x,.05,zz],[x,2.44,zz],.045,weiss);stab([x,2.44,zz],[x+seite*1.8,.1,zz],.025,weiss);}
        stab([x,2.44,z-3.66],[x,2.44,z+3.66],.045,weiss);
        const netzM=mat(new T.LineBasicMaterial({color:0xd9ddd7,transparent:true,opacity:.38})),netz=[];
        for(let zz=z-3.66;zz<=z+3.67;zz+=.24)netz.push(x+seite*1.8,.05,zz,x+seite*1.8,2.25,zz);
        for(let yy=.05;yy<2.3;yy+=.24)netz.push(x+seite*1.8,yy,z-3.66,x+seite*1.8,yy,z+3.66);
        const ng=geo(new T.BufferGeometry());ng.setAttribute('position',new T.Float32BufferAttribute(netz,3));szene.add(new T.LineSegments(ng,netzM));
      }
      const xa=-G.rechts-5,xb=-G.links+5;
      for(let x=xa;x<=xb;x+=2.5){stab([x,0,.075],[x,1.1,.075],.027,metall);stab([x,0,4],[x,1.5,4],.025,metall);}
      stab([xa,1.1,.075],[xb,1.1,.075],.032,metall);stab([xa,.27,.075],[xb,.27,.075],.025,metall);stab([xa,1.45,4],[xb,1.45,4],.024,metall);
      const draht=mat(new T.LineBasicMaterial({color:0x7c8580,transparent:true,opacity:.55})),netz=[];
      for(let x=xa;x<xb;x+=.45)netz.push(x,0,4,x+.8,1.45,4,x,1.45,4,x+.8,0,4);
      const ng=geo(new T.BufferGeometry());ng.setAttribute('position',new T.Float32BufferAttribute(netz,3));szene.add(new T.LineSegments(ng,draht));
      // Ferne Fotokulisse auf einem Zylinder, der beim Gehen und Umsehen im Raum bleibt.
      // Der größte Teil des unteren Bilds liegt unter dem Gelände; die Baumlinie sitzt am Horizont.
      if(opt.texturen?.umfeld)new T.TextureLoader().load(opt.texturen.umfeld,t=>{if(!lebt){t.dispose();return;}tex(t);t.encoding=T.sRGBEncoding;
        const radius=130,hoehe=Math.PI*radius,kulisse=mat(new T.MeshBasicMaterial({map:t,side:T.BackSide,toneMapped:false,fog:false}));
        mesh(new T.CylinderGeometry(radius,radius,hoehe,96,1,true),kulisse,mitte,hoehe*.12,0,false);anfordern();
      },undefined,()=>{if(lebt)meldung('Das Umfeld wird vereinfacht dargestellt. Die Banden und Platzwahl bleiben verfügbar.');});
      // Ohne Bildmaterial geben zurückhaltende Hügel und Bäume dem Ersatzbild Tiefe.
      const stamm=mat(new T.MeshStandardMaterial({color:0x65513a,roughness:1})),blatt=[0x576b42,0x647b4e,0x78835a,0x4f6546].map(color=>mat(new T.MeshStandardMaterial({color,roughness:1})));
      const zuf=n=>{const f=Math.sin(n*127.1+311.7)*43758.5453;return f-Math.floor(f);};
      for(let i=0;i<(opt.texturen?.umfeld?0:35);i++){const x=mitte+(i-17)*5.2,z=22+zuf(i+91)*26,h=5+zuf(i+4)*5,r=2+zuf(i+17)*1.6;
        quader(.22,h*.7,.22,x,h*.35,z,stamm);const baum=mesh(new T.IcosahedronGeometry(r,1),blatt[i%blatt.length],x,h*.72,z);baum.scale.set(1,1.5,1);baum.castShadow=false;}
      const huegel=mat(new T.MeshStandardMaterial({color:0x6f7d60,roughness:1}));
      for(let i=0;i<(opt.texturen?.umfeld?0:9);i++){const q=mesh(new T.SphereGeometry(28+zuf(i+8)*15,18,9),huegel,mitte+(i-4)*30,-11,90+zuf(i)*20,false);q.scale.set(1,.56,1);}
      // Flutlichtmasten ohne Lichtstrahlen oder künstliches Leuchten.
      for(const x of [mitte-laenge/2,mitte+laenge/2]){stab([x,0,9],[x,14,9],.085,metall);quader(1.8,.13,.45,x,14,9,metall);}
    }
    function tafelflaeche(t){const w=Math.min(1536,Math.max(256,Math.round(t.l/t.h*256))),h=Math.round(w*t.h/t.l),c=document.createElement('canvas');c.width=w;c.height=h;const x=c.getContext('2d');
      x.imageSmoothingEnabled=true;x.imageSmoothingQuality='high';x.fillStyle=t.farbe||'#f5f3ec';x.fillRect(0,0,w,h);
      const im=t.img,iw=im&&(im.naturalWidth||im.width),ih=im&&(im.naturalHeight||im.height);
      if(iw&&ih&&!t.frei){const k=Math.min((w-12)/iw,(h-12)/ih);x.drawImage(im,(w-iw*k)/2,(h-ih*k)/2,iw*k,ih*k);}
      else {const name=String(t.frei?'FREI':t.name||'').trim().slice(0,140),bg=t.farbe||'#f5f3ec',hell=/^#[a-f0-9]{6}$/i.test(bg)&&parseInt(bg.slice(1,3),16)*.299+parseInt(bg.slice(3,5),16)*.587+parseInt(bg.slice(5,7),16)*.114>140;
        x.fillStyle=hell?'#1d2760':'#ffffff';x.textAlign='center';x.textBaseline='middle';let gr=140;x.font=`800 ${gr}px BarlowC,Barlow,sans-serif`;
        const breite=x.measureText(name).width;if(breite>w*.88)gr*=w*.88/breite;x.font=`800 ${gr}px BarlowC,Barlow,sans-serif`;x.fillText(name,w/2,h/2);
        if(t.frei){x.strokeStyle='#737e8d';x.lineWidth=4;x.setLineDash([20,14]);x.strokeRect(12,12,w-24,h-24);}}
      const textur=tex(new T.CanvasTexture(c));textur.encoding=T.sRGBEncoding;textur.anisotropy=Math.min(8,renderer.capabilities.getMaxAnisotropy());return textur;
    }
    function tafelBauen(t){const g=new T.Group(),cx=-t.x0-t.l/2,h=t.h;
      const rahmen=mat(new T.MeshStandardMaterial({color:0xd4d6d2,roughness:.65,metalness:.4})),front=mat(new T.MeshBasicMaterial({map:tafelflaeche(t),toneMapped:false}));
      const platte=new T.Mesh(geo(new T.BoxGeometry(t.l-.025,h+.035,.045)),rahmen);platte.position.set(cx,.22+h/2,0);platte.castShadow=true;g.add(platte);
      const bild=new T.Mesh(geo(new T.PlaneGeometry(t.l-.045,h-.015)),front);bild.position.set(cx,.22+h/2,-.026);bild.rotation.y=Math.PI;bild.userData.bandenId=t.id;g.add(bild);
      const ringM=mat(new T.MeshBasicMaterial({color:0xeb752b,toneMapped:false})),ring=new T.Mesh(geo(new T.BoxGeometry(t.l,.035,.018)),ringM);ring.position.set(cx,.22+h+.045,-.04);ring.visible=!!t.an;g.add(ring);
      szene.add(g);treffer.push(bild);return {g,bild,ring,t};
    }
    function gleich(a,b){return a.x0===b.x0&&a.l===b.l&&a.h===b.h&&a.img===b.img&&a.name===b.name&&a.farbe===b.farbe&&a.frei===b.frei;}
    function tafelnSetzen(ta){if(!lebt)return;tafeln=gueltigeTafeln(ta);G=grenzen(tafeln);if(!szene)return;
      const ids=new Set(tafeln.map(t=>t.id));for(const [id,b] of belege){if(!ids.has(id)){entsorgen(b.g);belege.delete(id);const i=treffer.indexOf(b.bild);if(i>=0)treffer.splice(i,1);}}
      for(const t of tafeln){let b=belege.get(t.id);if(b&&!gleich(b.t,t)){entsorgen(b.g);const i=treffer.indexOf(b.bild);if(i>=0)treffer.splice(i,1);b=null;}
        if(!b){b=tafelBauen(t);belege.set(t.id,b);}b.ring.visible=!!t.an;b.t=t;}
      p=versetzen(p,0,0,0,G);anfordern();
    }
    function selection(id){if(!lebt)return;id=String(id);for(const [k,b] of belege)b.ring.visible=k===id;anfordern();}
    function zentrieren(id){if(!lebt)return;const s=tafeln.find(t=>t.id===String(id)),x=s?s.x0+s.l/2:Number.isFinite(+id)?+id:G.mitte;
      p={x:kl(x,G.minX,G.maxX),y:1.65,z:-5.5,blick:0,neigung:-.13};anfordern();opt.onMove?.(zustand());}
    function gehen(vor,seit,sek=.22){if(!lebt)return;p=versetzen(p,vor,seit,kl(zahl(sek),0,.3),G);anfordern();opt.onMove?.(zustand());}
    function drehen(yaw,pitch=0){if(!lebt)return;p.blick+=kl(zahl(yaw),-.7,.7);p.neigung=kl(p.neigung+kl(zahl(pitch),-.35,.35),-.62,.35);anfordern();}
    function reset(){if(!lebt)return;p={x:G.mitte,y:1.65,z:-12,blick:0,neigung:-.075};anfordern();opt.onMove?.(zustand());}
    function eingaben(){cv.style.touchAction='none';if(altIndex===null)cv.setAttribute('tabindex','0');
      const zugeordnet=k=>['w','a','s','d','q','e','arrowup','arrowdown','arrowleft','arrowright'].includes(k);
      event(cv,'keydown',e=>{const k=e.key.toLowerCase();if(e.target!==cv)return;if(k==='home'){e.preventDefault();reset();return;}if(!zugeordnet(k))return;e.preventDefault();tasten.add(k);anfordern();});
      event(cv,'keyup',e=>{const k=e.key.toLowerCase();if(zugeordnet(k)){e.preventDefault();tasten.delete(k);}});
      event(cv,'blur',()=>{tasten.clear();drag=null;});
      event(window,'blur',()=>{tasten.clear();drag=null;letzteZeit=0;});
      event(cv,'pointerdown',e=>{if(e.button&&e.button!==0)return;cv.focus({preventScroll:true});drag={id:e.pointerId,x:e.clientX,y:e.clientY,lastX:e.clientX,lastY:e.clientY,weg:0};cv.setPointerCapture?.(e.pointerId);});
      event(cv,'pointermove',e=>{if(!drag||drag.id!==e.pointerId)return;const dx=e.clientX-drag.lastX,dy=e.clientY-drag.lastY;drag.weg=Math.max(drag.weg,Math.hypot(e.clientX-drag.x,e.clientY-drag.y));drag.lastX=e.clientX;drag.lastY=e.clientY;if(drag.weg>5)drehen(dx*.004,-dy*.003);});
      event(cv,'pointerup',e=>{if(!drag||drag.id!==e.pointerId)return;const klick=drag.weg<=5;drag=null;cv.releasePointerCapture?.(e.pointerId);if(!klick||!kamera)return;
        const r=cv.getBoundingClientRect(),v=new T.Vector2((e.clientX-r.left)/r.width*2-1,-(e.clientY-r.top)/r.height*2+1),ray=new T.Raycaster();ray.setFromCamera(v,kamera);const hit=ray.intersectObjects(treffer,false)[0];if(hit)opt.onSelect?.(hit.object.userData.bandenId);});
      event(cv,'pointercancel',()=>{drag=null;});
      event(cv,'wheel',e=>{if(document.activeElement!==cv)return;e.preventDefault();gehen(-kl(e.deltaY,-150,150)/110,0,.3);},{passive:false});
      event(document,'visibilitychange',()=>{tasten.clear();letzteZeit=0;if(document.hidden){cancelAnimationFrame(raf);raf=0;}else anfordern();});
      event(cv,'webglcontextlost',e=>{e.preventDefault();if(!lebt)return;meldung('Die 3D-Ansicht wurde unterbrochen. Die Platzliste bleibt verfügbar.');lebt=false;aufraeumen();opt.onFallback?.(new Error('3D-Darstellung unterbrochen.'));});
    }
    const bereit=(async()=>{
      T=await laden(opt.three||'vendor/three.min.js');if(!lebt)return false;
      renderer=new T.WebGLRenderer({canvas:cv,antialias:true,alpha:false,powerPreference:'high-performance'});renderer.outputEncoding=T.sRGBEncoding;
      renderer.toneMapping=T.ACESFilmicToneMapping;renderer.toneMappingExposure=.96;renderer.shadowMap.enabled=true;renderer.shadowMap.type=T.PCFSoftShadowMap;
      szene=new T.Scene();szene.background=new T.Color(0xbfcfde);szene.fog=new T.FogExp2(0xbfcfde,.004);
      kamera=new T.PerspectiveCamera(56,1,.08,270);gruppe=new T.Group();szene.add(gruppe);
      szene.add(new T.HemisphereLight(0xe4edf4,0x77735b,1.05));const sonne=new T.DirectionalLight(0xfff2d8,1.1);sonne.position.set(-G.mitte-30,40,-28);sonne.target.position.set(-G.mitte,0,0);
      sonne.castShadow=true;sonne.shadow.mapSize.set(1024,1024);sonne.shadow.camera.left=-65;sonne.shadow.camera.right=65;sonne.shadow.camera.top=35;sonne.shadow.camera.bottom=-30;sonne.shadow.camera.far=130;sonne.shadow.normalBias=.025;szene.add(sonne,sonne.target);
      umfeld();tafelnSetzen(tafeln);eingaben();if(window.ResizeObserver){ro=new ResizeObserver(groesse);ro.observe(cv);}else event(window,'resize',groesse);groesse();
      meldung('3D-Ansicht bereit. Ziehen zum Umsehen. WASD zum Gehen, Pfeile links und rechts zum Drehen.');
      document.fonts?.ready?.then(()=>{if(lebt){for(const b of belege.values())b.t={...b.t,name:null};tafelnSetzen(tafeln);}});
      return true;
    })().catch(e=>{if(lebt){meldung('3D ist auf diesem Gerät gerade nicht verfügbar. Du kannst die Plätze in der Liste auswählen.');lebt=false;aufraeumen();opt.onFallback?.(e);}throw e;});
    return {bereit,setTafeln:tafelnSetzen,setSelection:selection,zentrieren,gehen,drehen,reset,zerstoeren(){if(!lebt)return;lebt=false;aufraeumen();},get position(){return zustand();}};
  }
  return {erstellen,grenzen,versetzen};
})();
