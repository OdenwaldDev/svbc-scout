/* Originalaufnahmen von Albert, 20.11.2026. Die Bilddateien bleiben bytegleich.
   Eine fotografische Umgebung auf dem äußeren Oval erhält die echten Baum- und Gebäudesilhouetten.
   Projektion aus überlappenden Aufnahmen, kein vermessenes 3D-Modell der Nachbargrundstücke.
   Gemeinsame Fernpunkte: Foto 278343/278342, Brennweite 904 px bei 1280 px Breite,
   Blickdifferenz 42,759 Grad. Kamerastandpunkt und Tiefe sind Fotoannahmen, siehe Referenzdokument.
   Plan-X wird negiert, Plan-Y nach -(Y+50) abgebildet, wie im Bandenplan. */
window.STADIONFOTO=(()=>{
  'use strict';
  const RAD=Math.PI/180,REF=Object.freeze({x:45,y:35,h:1.65}),G=42.2,R=60,SKY=0x59a9e9;
  const NORDOST_ROT=Object.freeze([.734206046,.007064777,-.678889955,-.018087186,.999794483,-.009156706,.678685742,.019002118,.734182936]);
  const FOTOS=Object.freeze([
    {id:'rundblick',datei:'stadion-original-rundblick.jpg',typ:'zylinder',breite:1280,hoehe:462,
      achse:-16.0061892232,fov:234.8418414706,fy:278.8514313425,cy:209.1398421661,x0:160,x1:1279,unten:207,ordnung:1},
    {id:'nord',datei:'stadion-original-nord.jpg',typ:'perspektive',breite:1280,hoehe:721,
      achse:-43.7,neigung:-1.2,f:904,x0:0,x1:1279,unten:346,ordnung:2},
    {id:'nordost',datei:'stadion-original-nordost.jpg',typ:'perspektive',breite:1280,hoehe:721,
      achse:-43.7,neigung:-1.2,rotation:NORDOST_ROT,f:904,x0:0,x1:1279,unten:336,ordnung:3}
  ].map(Object.freeze));
  function strahl(f,x,y){const a=f.achse*RAD;
    if(f.typ==='zylinder'){const w=a+(x/f.breite-.5)*f.fov*RAD;return {x:Math.sin(w),y:-Math.cos(w),h:(f.cy-y)/f.fy};}
    let px=(x-f.breite/2)/f.f,py=(f.hoehe/2-y)/f.f,pz=1;
    if(f.rotation){const r=f.rotation,u=px,v=-py;px=r[0]*u+r[3]*v+r[6];py=-(r[1]*u+r[4]*v+r[7]);pz=r[2]*u+r[5]*v+r[8];}
    const b=f.neigung*RAD,c=pz*Math.cos(b)-py*Math.sin(b);
    return {x:Math.sin(a)*c+Math.cos(a)*px,y:-Math.cos(a)*c+Math.sin(a)*px,h:pz*Math.sin(b)+py*Math.cos(b)};
  }
  function schnitt(d){const kandidaten=[];
    for(const y of [-R,R]){const t=(y-REF.y)/d.y,x=REF.x+t*d.x;if(t>0&&x>=-G&&x<=G)kandidaten.push(t);}
    for(const c of [-G,G]){const dx=REF.x-c,A=d.x*d.x+d.y*d.y,B=2*(dx*d.x+REF.y*d.y),C=dx*dx+REF.y*REF.y-R*R,D=B*B-4*A*C;
      if(D<0)continue;for(const t of [(-B-Math.sqrt(D))/(2*A),(-B+Math.sqrt(D))/(2*A)]){const x=REF.x+t*d.x;if(t>0&&(c<0?x<=-G:x>=G))kandidaten.push(t);}}
    const t=Math.min(...kandidaten);if(!Number.isFinite(t))throw new Error('Fotoprojektion außerhalb der Stadionkontur');
    return {x:REF.x+t*d.x,y:REF.y+t*d.y,h:REF.h+t*d.h};
  }
  function bildpunkt(f,p){const dx=p.x-REF.x,dy=p.y-REF.y,h=p.h-REF.h,a=f.achse*RAD;
    if(f.typ==='zylinder'){const w=Math.atan2(dx,-dy)-a;return {x:f.breite*(.5+Math.atan2(Math.sin(w),Math.cos(w))/(f.fov*RAD)),y:f.cy-f.fy*h/Math.hypot(dx,dy)};}
    const b=f.neigung*RAD,vor=dx*Math.sin(a)-dy*Math.cos(a),quer=dx*Math.cos(a)+dy*Math.sin(a),hoch=h*Math.cos(b)-vor*Math.sin(b);
    let k=[quer,-hoch,vor*Math.cos(b)+h*Math.sin(b)];if(f.rotation){const r=f.rotation;k=[r[0]*k[0]+r[1]*k[1]+r[2]*k[2],r[3]*k[0]+r[4]*k[1]+r[5]*k[2],r[6]*k[0]+r[7]*k[1]+r[8]*k[2]];}
    return {x:f.breite/2+f.f*k[0]/k[2],y:f.hoehe/2+f.f*k[1]/k[2]};
  }
  function netz(f){const pos=[],uv=[],index=[],spalten=192,zeilen=[-f.hoehe*.5,0,f.unten*.35,f.unten*.7,f.unten*.93,f.unten];
    zeilen.push(f.unten+1);
    for(let j=0;j<zeilen.length;j++)for(let i=0;i<=spalten;i++){
      const x=f.x0+(f.x1-f.x0)*i/spalten,y=zeilen[j],p=schnitt(strahl(f,x,Math.min(y,f.unten)));
      const fuss=j===zeilen.length-1,ab=fuss?bildpunkt(f,{...p,h:.025}):{x,y};
      pos.push(-p.x,fuss?.025:Math.max(.03,p.h),-p.y-50);uv.push(ab.x/f.breite,1-ab.y/f.hoehe);
      if(j<zeilen.length-1&&i<spalten){const a=j*(spalten+1)+i,b=a+spalten+1;index.push(a,b,a+1,a+1,b,b+1);}
    }
    return {position:pos,uv,index};
  }
  function bauen(T,opt={}){const gruppe=new T.Group();gruppe.name='stadion-originalumfeld';
    gruppe.userData={quelle:'Alberts Originalfotos 278344, 278343, 278342',annahme:{kamera:REF,radius:R},fotografisch:true};
    const bodenUniforms={foto1:{value:null},geladen:{value:new T.Vector3()}},fotoMaterialien=[];let grasTextur=null;
    const bodenMaterial=new T.ShaderMaterial({uniforms:bodenUniforms,toneMapped:false,transparent:true,depthWrite:false,
      vertexShader:'varying vec3 ort;void main(){vec4 w=modelMatrix*vec4(position,1.0);ort=w.xyz;gl_Position=projectionMatrix*viewMatrix*w;}',
      fragmentShader:`uniform sampler2D foto1;uniform vec3 geladen;varying vec3 ort;
        float weich(vec2 p,vec4 r){return smoothstep(r.x,r.x+.025,p.x)*(1.-smoothstep(r.z-.025,r.z,p.x))*smoothstep(r.y,r.y+.015,p.y)*(1.-smoothstep(r.w-.025,r.w,p.y));}
        vec3 kamera(vec3 v){float a=-.762708883,c=cos(a),s=sin(a),b=-.020943951;float vor=v.x*s-v.y*c,quer=v.x*c+v.y*s;
          return vec3(quer,-(v.z*cos(b)-vor*sin(b)),vor*cos(b)+v.z*sin(b));}
        vec2 perspektive(vec3 k){if(k.z<.1)return vec2(-5.);return vec2(.5+904.*k.x/k.z/1280.,.5+904.*k.y/k.z/721.);}
        void druck(vec3 quelle,float w,inout vec3 c,inout float alpha){float a=alpha+(1.-alpha)*w;c=(c*alpha*(1.-w)+quelle*w)/max(.0001,a);alpha=a;}
        void main(){vec3 v=vec3(-ort.x-45.,-ort.z-85.,ort.y-1.65);vec2 muster=fract(vec2(ort.x*.13,ort.z*.18));
          vec3 hell=texture2D(foto1,vec2(.28+muster.x*.27,1.-(.52+muster.y*.065))).rgb;
          vec3 schatten=texture2D(foto1,vec2(.27+muster.x*.34,1.-(.75+muster.y*.20))).rgb;
          float schattenkante=31.4893+.105113*ort.x;
          vec3 c=mix(hell,schatten,smoothstep(schattenkante-.5,schattenkante+.5,-ort.z-50.));float alpha=geladen.y;
          vec3 k=kamera(v);vec2 p=perspektive(k);float w=weich(p,vec4(.001,.43,.999,.999))*geladen.y;druck(texture2D(foto1,vec2(p.x,1.-(.508+abs(p.y-.508)))).rgb,w,c,alpha);
          if(alpha<.001)discard;gl_FragColor=vec4(c,alpha);
          #include <encodings_fragment>
        }`});
    const kontur=new T.Shape();kontur.moveTo(-G,-36.45);kontur.lineTo(G,-36.45);kontur.absarc(G,0,36.45,-Math.PI/2,Math.PI/2,false);kontur.lineTo(-G,36.45);kontur.absarc(-G,0,36.45,Math.PI/2,Math.PI*1.5,false);
    const rasen=new T.Mesh(new T.ShapeGeometry(kontur,64),bodenMaterial);rasen.rotation.x=-Math.PI/2;rasen.position.set(0,.011,-50);rasen.name='stadion-originalrasen';gruppe.add(rasen);
    for(const f of FOTOS){const n=netz(f),geo=new T.BufferGeometry();geo.setAttribute('position',new T.Float32BufferAttribute(n.position,3));geo.setAttribute('uv',new T.Float32BufferAttribute(n.uv,2));geo.setIndex(n.index);
      // Die drei Mastkörper stehen eigenständig im Raum. Ihre schmalen Fotospuren nicht doppelt zeichnen.
      const spuren=f.id==='nord'?[502/1280,860/1280]:f.id==='nordost'?[134/1280,730/1280]:[];
      const koepfe=f.id==='nord'?[[492,232,512,252],[848,191,873,214]]:f.id==='nordost'?[[121,163,147,190],[716,160,744,185]]:[];
      const huetten=window.STADIONPAVILLONS?(f.id==='nord'?[[599,307,660,349],[1002,317,1060,349]]:f.id==='nordost'?[[280,311,356,344]]:[]):[];
      const untergrund=f.id==='nord'?[346,367]:f.id==='nordost'?[336,359]:[207,223];
      const m=new T.ShaderMaterial({uniforms:{bild:{value:null},bereit:{value:0},grasFoto:{value:grasTextur},grasBereit:{value:grasTextur?1:0},sky:{value:new T.Color(SKY).convertSRGBToLinear()},horizont:{value:new T.Color(0xa7c4dd).convertSRGBToLinear()},kante:{value:new T.Vector2(f.x0/f.breite,f.x1/f.breite)}},
        vertexShader:'varying vec2 fotoUV;varying float hoehe;void main(){fotoUV=uv;hoehe=position.y;gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.0);}',
        fragmentShader:`uniform sampler2D bild;uniform sampler2D grasFoto;uniform float grasBereit;uniform float bereit;uniform vec3 sky;uniform vec3 horizont;uniform vec2 kante;varying vec2 fotoUV;varying float hoehe;
          void main(){if(bereit<.5)discard;vec2 uv=clamp(fotoUV,vec2(.0005),vec2(.9995));vec4 c=texture2D(bild,uv);
            ${spuren.map(x=>`if(abs(uv.x-${x.toFixed(6)})<.0032){c=mix(texture2D(bild,vec2(${(x-.0045).toFixed(6)},uv.y)),texture2D(bild,vec2(${(x+.0045).toFixed(6)},uv.y)),.5);}`).join('\n')}
            ${koepfe.map(([x0,y0,x1,y1])=>`if(uv.x>${(x0/f.breite).toFixed(6)}&&uv.x<${(x1/f.breite).toFixed(6)}&&uv.y>${(1-y1/f.hoehe).toFixed(6)}&&uv.y<${(1-y0/f.hoehe).toFixed(6)})c=mix(texture2D(bild,vec2(${((x0-3)/f.breite).toFixed(6)},uv.y)),texture2D(bild,vec2(${((x1+3)/f.breite).toFixed(6)},uv.y)),smoothstep(${(x0/f.breite).toFixed(6)},${(x1/f.breite).toFixed(6)},uv.x));`).join('\n')}
            ${huetten.map(([x0,y0,x1,y1])=>`if(uv.x>${(x0/f.breite).toFixed(6)}&&uv.x<${(x1/f.breite).toFixed(6)}&&uv.y>${(1-y1/f.hoehe).toFixed(6)}&&uv.y<${(1-y0/f.hoehe).toFixed(6)}){
              float rand=smoothstep(${(x0/f.breite).toFixed(6)},${((x0+3)/f.breite).toFixed(6)},uv.x)*(1.-smoothstep(${((x1-3)/f.breite).toFixed(6)},${(x1/f.breite).toFixed(6)},uv.x));
              c=mix(c,texture2D(bild,uv+vec2(0.,${((y1-y0+6)/f.hoehe).toFixed(6)})),rand);
            }`).join('\n')}
            if(uv.y<${(1-untergrund[0]/f.hoehe).toFixed(6)}){${f.id==='rundblick'?
              'c=grasBereit>.5?texture2D(grasFoto,vec2(.3+fract(uv.x*7.)*.4,1.-(.518+fract(uv.y*20.)*.06))):vec4(.09,.18,.045,1.);':
              `c=texture2D(bild,vec2(uv.x,1.-(${untergrund[1].toFixed(1)}+abs((1.-uv.y)*${f.hoehe.toFixed(1)}-${untergrund[1].toFixed(1)}))/${f.hoehe.toFixed(1)}));`}}
            float rand=smoothstep(kante.x,kante.x+.055,fotoUV.x)*(1.-smoothstep(kante.y-.055,kante.y,fotoUV.x));
            float himmel=max(smoothstep(.92,1.05,fotoUV.y),smoothstep(.025,.10,c.b-max(c.r,c.g))*smoothstep(.48,.65,fotoUV.y));
            c.rgb=mix(c.rgb,mix(horizont,sky,smoothstep(0.,45.,hoehe)),himmel);gl_FragColor=vec4(c.rgb,rand);
            #include <encodings_fragment>
          }`,
        transparent:true,depthWrite:false,depthTest:true,side:T.DoubleSide,toneMapped:false,polygonOffset:true,polygonOffsetFactor:-f.ordnung,polygonOffsetUnits:-f.ordnung});
      fotoMaterialien.push(m);const mesh=new T.Mesh(geo,m);mesh.name='originalfoto-'+f.id;mesh.renderOrder=f.ordnung;mesh.frustumCulled=false;gruppe.add(mesh);
      new T.TextureLoader().load((opt.basis||'partner/')+f.datei,t=>{if(opt.lebendig&&!opt.lebendig()){t.dispose();return;}
        t.encoding=T.sRGBEncoding;t.anisotropy=Math.min(8,opt.anisotropie||4);t.wrapS=t.wrapT=T.ClampToEdgeWrapping;m.uniforms.bild.value=t;m.uniforms.bereit.value=1;opt.onTextur?.(t);
        if(f.ordnung===2)bodenUniforms.foto1.value=t;
        if(f.ordnung===2){grasTextur=t;fotoMaterialien.forEach(m=>{m.uniforms.grasFoto.value=t;m.uniforms.grasBereit.value=1;});}
        bodenUniforms.geladen.value.setComponent(f.ordnung-1,1);opt.onChange?.();
      },undefined,()=>{if(!opt.lebendig||opt.lebendig())opt.onFehler?.(f.id);});
    }
    return gruppe;
  }
  return {bauen,netz,strahl,schnitt,bildpunkt,FOTOS,REF,SKY};
})();

/* Clubhaus nach Originalfotos und Alberts Panorama vom 20.11.2026, keine erzeugte Fassade.
   Grundplan aus svm101: x -6..54 / y 55..66; Welt-X=-Plan-x, Welt-Z=-(Plan-y+50).
   Foto-links liegt damit bei größerem Plan-x: heller Komplex [30,54], Hauptbau [4,30], rechter Flügel [-6,4].
   Die Aufteilung 24/26/10 m, Galeriehöhe 3,05 m, Traufe 6,15 m und First 8,55 m sind Fotoannahmen,
   keine Vermessung. Galerie etwa 2 m tief. Rückseiten und Innenräume sind nicht im Detail rekonstruiert.
   Referenzen: Clubhaus_Front-scaled.jpg, Weschnitztalstadion-1.jpg/-4.jpg, Nutzerpanorama 278345.jpg.
   Die unveränderte Frontaufnahme wird als lokale Textur ausgeliefert. Keine erfundene Beschriftung oder Glasbrüstung.
   Alle Ressourcen hängen an Meshes dieser Gruppe; die aufrufende Bühne entsorgt sie per traverse(). */
window.STADIONBAU=(()=>{
  'use strict';
  const FOTO={breite:2560,hoehe:1440,
    front:[[285,350],[2195,330],[2180,899],[270,807]],
    dach:[[285,350],[2195,330],[2185,183],[527,236]],
    // Saubere Innenfläche des echten rechten Ziegeldachs, ohne Dachkante, Himmel oder Sonnenstrahl.
    ziegel:[2280,502,2540,606]};
  // Ein projektives Viereck im Originalbild, kein zugeschnittener oder entzerrter Rasterexport.
  function homographie(T,punkte){
    const p=punkte.map(([x,y])=>[x/FOTO.breite,1-y/FOTO.hoehe]),[a,b,c,d]=p;
    const dx1=b[0]-c[0],dx2=d[0]-c[0],dx3=a[0]-b[0]+c[0]-d[0],
      dy1=b[1]-c[1],dy2=d[1]-c[1],dy3=a[1]-b[1]+c[1]-d[1],nenner=dx1*dy2-dx2*dy1;
    const u=(dx3*dy2-dx2*dy3)/nenner,v=(dx1*dy3-dx3*dy1)/nenner;
    return new T.Matrix3().set(b[0]-a[0]+u*b[0],d[0]-a[0]+v*d[0],a[0],
      b[1]-a[1]+u*b[1],d[1]-a[1]+v*d[1],a[1],u,v,1);
  }
  function fotoAnbringen(g,T,opt){
    if(opt.foto===false||!(opt.foto||typeof opt.onTextur==='function')||!T.TextureLoader)return;
    const front=homographie(T,FOTO.front),dach=homographie(T,FOTO.dach),bereit={value:0},mats=new Set(),vorher=[],gemerkt=new Set(),
      ziegel=new T.Vector4(FOTO.ziegel[0]/FOTO.breite,1-FOTO.ziegel[3]/FOTO.hoehe,
        (FOTO.ziegel[2]-FOTO.ziegel[0])/FOTO.breite,(FOTO.ziegel[3]-FOTO.ziegel[1])/FOTO.hoehe);
    g.traverse(o=>{for(const m of (Array.isArray(o.material)?o.material:[o.material]).filter(Boolean))mats.add(m);});
    const lebendig=()=>typeof opt.lebendig!=='function'||opt.lebendig();
    if(!lebendig())return;
    let textur=null,verbunden=false,fehlgeschlagen=false;
    g.userData.fotoStatus='laedt';
    function merken(t){if(!gemerkt.has(t)){gemerkt.add(t);opt.onTextur?.(t);}}
    function verbinden(t){if(!t)return;
      textur=t;t.encoding=T.sRGBEncoding;t.wrapS=t.wrapT=T.ClampToEdgeWrapping;
      t.anisotropy=Math.max(1,Math.min(8,Number.isFinite(opt.anisotropie)?opt.anisotropie:1));
      if(!verbunden){verbunden=true;
        for(const m of mats){const alt=m.onBeforeCompile,key=m.customProgramCacheKey;vorher.push({m,alt,key,map:m.map});
          m.onBeforeCompile=(s,r)=>{
            alt.call(m,s,r);s.uniforms.sfBereit=bereit;s.uniforms.sfFront={value:front};s.uniforms.sfDach={value:dach};s.uniforms.sfZiegel={value:ziegel};
            const vars='varying vec3 sfP;varying vec3 sfN;\n';
            s.vertexShader=vars+s.vertexShader.replace('#include <begin_vertex>',
              '#include <begin_vertex>\nsfP=(modelMatrix*vec4(transformed,1.0)).xyz;sfN=mat3(modelMatrix)*normal;');
            s.fragmentShader=vars+'uniform float sfBereit;uniform mat3 sfFront;uniform mat3 sfDach;uniform vec4 sfZiegel;\n'+s.fragmentShader;
            // Die normale UV-Abbildung wird ersetzt, damit das vollständige Foto nicht zusätzlich auf jeder Box erscheint.
            s.fragmentShader=s.fragmentShader.replace('#include <map_fragment>','');
            s.fragmentShader=s.fragmentShader.replace('#include <normal_fragment_begin>',`
              if(sfBereit>.5){
                vec3 n=normalize(sfN);vec3 q=vec3(0.0);bool foto=false;
                if(sfP.x>=-30.0&&sfP.x<=-4.0){
                  if(n.z>.75&&sfP.y>=0.0&&sfP.y<=6.15&&sfP.z>=-107.3&&sfP.z<=-105.0){
                    q=sfFront*vec3((sfP.x+30.0)/26.0,1.0-sfP.y/6.15,1.0);foto=true;
                  }else if(n.y>.45&&n.z>.03&&sfP.y>=6.14&&sfP.z>=-110.5&&sfP.z<=-105.0){
                    q=sfDach*vec3((sfP.x+30.0)/26.0,(-105.0-sfP.z)/5.5,1.0);foto=true;
                  }
                }
                if(!foto&&sfP.x>=-4.0&&sfP.x<=6.0&&n.y>.5&&sfP.y>=3.05&&sfP.z>=-116.0&&sfP.z<=-105.4){
                  vec2 p=1.0-abs(mod(vec2((sfP.x+4.0)/3.4,(-105.45-sfP.z)*1.035/2.2),2.0)-1.0);
                  q=vec3(sfZiegel.xy+p*sfZiegel.zw,1.0);foto=true;
                }
                if(foto&&abs(q.z)>.00001){vec2 uv=q.xy/q.z;
                  if(all(greaterThanEqual(uv,vec2(0.0)))&&all(lessThanEqual(uv,vec2(1.0))))diffuseColor.rgb=texture2D(map,uv).rgb;
                }
              }
              #include <normal_fragment_begin>
            `);
          };
          m.customProgramCacheKey=()=>key.call(m)+'|clubhaus-originalfoto-2';m.map=t;m.needsUpdate=true;
        }
      }else for(const m of mats)if(m.map!==t){m.map=t;m.needsUpdate=true;}
      merken(t);
    }
    function fehler(){fehlgeschlagen=true;bereit.value=0;textur?.dispose();
      if(!lebendig())return;
      for(const v of vorher){v.m.map=v.map;v.m.onBeforeCompile=v.alt;v.m.customProgramCacheKey=v.key;v.m.needsUpdate=true;}
      g.userData.fotoStatus='ersatz';opt.onFehler?.();opt.onChange?.();
    }
    try{
      textur=new T.TextureLoader().load(typeof opt.foto==='string'?opt.foto:'partner/stadion-clubhaus-original.jpg',t=>{
        if(!lebendig()||fehlgeschlagen){t.dispose();return;}
        verbinden(t);bereit.value=1;g.userData.fotoStatus='bereit';opt.onChange?.();
      },undefined,fehler);
      if(fehlgeschlagen||!lebendig()){textur?.dispose();return;}
      verbinden(textur);
    }catch(_){fehler();}
  }
  function bauen(T,opt={}){
    if(!T?.Group||!T?.MeshStandardMaterial)throw new Error('Die 3D-Bibliothek für das Clubhaus fehlt.');
    const g=new T.Group();g.name='stadion-bauten';
    g.userData={bau:'Weschnitztalstadion Clubhaus',plan:{x0:-6,x1:54,y0:55,y1:66},
      annahmen:{linksBreite:24,hauptBreite:26,rechtsBreite:10,galerie:3.05,traufe:6.15,first:8.55},
      hinweis:'Grundriss etwa ±5 %, Höhen und Fassadenproportionen aus Fotos angenähert. Keine photogrammetrische Vermessung.'};
    const kasten=new T.BoxGeometry(1,1,1),rund=new T.CylinderGeometry(1,1,1,8);
    const material=(farbe,rau=1,metall=0)=>new T.MeshStandardMaterial({color:farbe,roughness:rau,metalness:metall});
    const klinker=material(0x8f503e,.96),putz=material(0xdad8cb,.97),bruestung=material(0xcdc9ad,.94),
      dach=material(0x363b3c,.95),flachdach=material(0x5c615b,.99),holz=material(0x352c27,.87),
      gruen=material(0x335744,.68),glas=material(0x596e68,.19,.12),metall=material(0x90968e,.62,.35),
      gelb=material(0xb4a35c,.68),sockel=material(0x73736a,.98);
    glas.envMapIntensity=.65;dach.side=T.DoubleSide;putz.side=T.DoubleSide;
    // Mauerfugen und Dachziegel liegen in Metern. In der Ferne werden die feinen Linien weich ausgeblendet.
    // Keine Bilddatei, DOM-Leinwand oder Netzabfrage ist nötig.
    function oberflaeche(m,art){
      m.extensions={...(m.extensions||{}),derivatives:true};m.customProgramCacheKey=()=>`clubhaus-${art}-1`;
      m.onBeforeCompile=s=>{
        const vars='varying vec3 sbP; varying vec3 sbN;\n';
        s.vertexShader=vars+s.vertexShader.replace('#include <begin_vertex>',
          '#include <begin_vertex>\nsbP=(modelMatrix*vec4(transformed,1.0)).xyz;sbN=mat3(modelMatrix)*normal;');
        s.fragmentShader=vars+s.fragmentShader;
        const muster=art==='klinker'?`
          vec2 p=abs(sbN.x)>abs(sbN.z)?vec2(sbP.z,sbP.y):vec2(sbP.x,sbP.y);
          float r=floor(p.y/.075);vec2 q=vec2(p.x/.25+mod(r,2.0)*.5,p.y/.075);
          vec2 c=fract(q);float f=smoothstep(.035,.075,c.x)*(1.0-smoothstep(.925,.965,c.x));
          f*=smoothstep(.065,.13,c.y)*(1.0-smoothstep(.87,.935,c.y));
          float n=fract(sin(dot(floor(q),vec2(37.17,91.43)))*43758.54);
          float detail=1.0-smoothstep(.025,.11,max(length(dFdx(p)),length(dFdy(p))));
          diffuseColor.rgb=mix(diffuseColor.rgb,mix(diffuseColor.rgb*.69+vec3(.045),diffuseColor.rgb*(.88+n*.20),f),detail);
        `:`
          vec2 p=vec2(sbP.x,sbP.z*1.08);float r=floor(p.y/.33);
          vec2 c=fract(vec2(p.x/.29+mod(r,2.0)*.5,p.y/.33));
          float f=smoothstep(.025,.095,c.x)*(1.0-smoothstep(.91,.98,c.x));
          f*=smoothstep(.035,.10,c.y)*(1.0-smoothstep(.91,.99,c.y));
          float detail=1.0-smoothstep(.04,.18,max(length(dFdx(p)),length(dFdy(p))));
          diffuseColor.rgb*=mix(1.0,.76+f*.27,detail);
        `;
        s.fragmentShader=s.fragmentShader.replace('#include <color_fragment>','#include <color_fragment>\n'+muster);
      };
    }
    oberflaeche(klinker,'klinker');oberflaeche(dach,'ziegel');
    function mesh(name,geo,m,p=g){const o=new T.Mesh(geo,m);o.name=name;o.castShadow=true;o.receiveShadow=true;p.add(o);return o;}
    function box(name,x0,x1,y0,y1,unten,oben,m,p=g){
      const o=mesh(name,kasten,m,p);o.position.set(-(x0+x1)/2,(unten+oben)/2,-(y0+y1)/2-50);o.scale.set(x1-x0,oben-unten,y1-y0);return o;
    }
    function flaeche(name,punkte,m,p=g){const geo=new T.BufferGeometry();
      geo.setAttribute('position',new T.Float32BufferAttribute(punkte.flat(),3));
      geo.setIndex(punkte.length===4?[0,1,2,0,2,3]:[0,1,2]);geo.computeVertexNormals();return mesh(name,geo,m,p);
    }
    const welt=(x,h,y)=>[-x,h,-y-50];
    function satteldach(name,x0,x1,vorn,hinten,traufe,first,p=g,giebel=putz){const mitte=(vorn+hinten)/2;
      flaeche(name+'-vorn',[welt(x1,traufe,vorn),welt(x0,traufe,vorn),welt(x0,first,mitte),welt(x1,first,mitte)],dach,p);
      flaeche(name+'-hinten',[welt(x1,first,mitte),welt(x0,first,mitte),welt(x0,traufe,hinten),welt(x1,traufe,hinten)],dach,p);
      for(const x of [x0,x1])flaeche(name+'-giebel-'+x,[welt(x,traufe,vorn),welt(x,traufe,hinten),welt(x,first,mitte)],giebel,p);
    }
    function stab(name,a,b,r,m,p=g){const A=new T.Vector3(...a),B=new T.Vector3(...b),v=B.clone().sub(A),o=mesh(name,rund,m,p);
      o.position.copy(A.add(B).multiplyScalar(.5));o.scale.set(r,v.length(),r);o.quaternion.setFromUnitVectors(new T.Vector3(0,1,0),v.normalize());return o;
    }
    function balken(name,a,b,w,d,m,p=g){const A=new T.Vector3(...a),B=new T.Vector3(...b),v=B.clone().sub(A),o=mesh(name,kasten,m,p);
      o.position.copy(A.add(B).multiplyScalar(.5));o.scale.set(w,v.length(),d);o.quaternion.setFromUnitVectors(new T.Vector3(0,1,0),v.normalize());return o;
    }
    function fenster(name,x0,x1,vorn,unten,oben,rahmen=gruen,teilungen=1,p=g){const f=.065;
      box(name+'-glas',x0+f,x1-f,vorn-.025,vorn+.01,unten+f,oben-f,glas,p);
      box(name+'-rahmen-unten',x0,x1,vorn-.07,vorn+.045,unten,unten+f,rahmen,p);
      box(name+'-rahmen-oben',x0,x1,vorn-.07,vorn+.045,oben-f,oben,rahmen,p);
      for(let i=0;i<=teilungen;i++){const x=x0+(x1-x0)*i/teilungen;
        box(name+'-pfosten-'+i,Math.max(x0,x-f/2),Math.min(x1,x+f/2),vorn-.07,vorn+.045,unten,oben,rahmen,p);}
    }
    const haupt=new T.Group();haupt.name='clubhaus-hauptbau';g.add(haupt);
    box('haupt-sockel',4,30,57.15,65.65,0,.18,sockel,haupt);
    box('haupt-klinker',4,30,57.15,65.65,.18,6.15,klinker,haupt);
    // Die verputzten Obergeschoss-Giebelseiten sind auf dem aktuellen Nutzerpanorama gut sichtbar.
    box('haupt-seitenputz-links',30,30.025,57.15,65.65,3.12,6.15,putz,haupt);
    box('haupt-seitenputz-rechts',3.975,4,57.15,65.65,3.12,6.15,putz,haupt);
    satteldach('haupt-dach',4,30,55,66,6.15,8.55,haupt);
    box('haupt-stirnblende',4,30,55,55.38,5.78,6.15,holz,haupt);
    box('galerie-unterzug',4,30,55.06,55.36,2.77,3.05,holz,haupt);
    // Der vordere Teil des linken Galerieabschnitts bleibt über dem Treppenlauf ausgespart.
    box('galerie-boden',4,23.4,55.12,57.35,2.99,3.12,sockel,haupt);
    box('galerie-boden-links',23.4,30,56.72,57.35,2.99,3.12,sockel,haupt);
    box('galerie-podest',23.4,24.2,55.4,56.75,3.04,3.12,sockel,haupt);
    // Zwei schwere helle Bänder mit offenem horizontalem Schlitz, keine Glasfläche.
    box('galerie-bruestung-unten',4.12,29.88,55.06,55.25,3.12,3.47,bruestung,haupt);
    box('galerie-bruestung-oben',4.12,29.88,55.06,55.25,3.67,4.08,bruestung,haupt);
    for(let i=0;i<18;i++){const x=4.45+i*25.1/17;
      box('galerie-betonhalter-'+i,x-.065,x+.065,55,55.28,3.35,3.91,bruestung,haupt);}
    stab('galerie-handlauf',welt(4.14,4.19,55.17),welt(29.86,4.19,55.17),.026,metall,haupt);
    for(let i=0;i<5;i++){const x=4.12+i*25.76/4;
      box('galerie-stuetze-'+i,x-.10,x+.10,55.22,55.44,.04,6.08,holz,haupt);}
    fenster('oberes-fensterband',4.62,29.38,57.09,3.38,5.65,gruen,12,haupt);
    fenster('obere-doppeltuer',21.25,23.05,57.00,3.12,5.52,gelb,2,haupt);
    fenster('unten-kleines-fenster',27.1,28.65,57.09,1.26,2.46,gruen,2,haupt);
    fenster('unten-eingang',21.25,23.05,57.02,.18,2.70,gruen,2,haupt);
    fenster('unten-nebenfenster',19.05,20.33,57.09,.72,2.45,gruen,1,haupt);
    fenster('unten-fensterband',4.62,18.1,57.09,.40,2.67,gruen,8,haupt);
    // Gerade Außentreppe: Foto-links unten nach Foto-rechts oben, metallene offene Tritte und Geländer.
    const treppe=new T.Group();treppe.name='clubhaus-aussentreppe';haupt.add(treppe);
    const xStart=28.8,lauf=4.8,hoehe=3.05,stufen=18;
    for(let i=0;i<stufen;i++){const y=(i+1)*hoehe/stufen;
      box('treppenstufe-'+i,xStart-(i+1)*lauf/stufen,xStart-i*lauf/stufen,55.43,56.65,y-.055,y,metall,treppe);}
    for(const tiefe of [55.45,56.63]){
      balken('treppenwange-'+tiefe,welt(xStart,.13,tiefe),welt(xStart-lauf,hoehe-.06,tiefe),.17,.075,metall,treppe);
      stab('treppen-handlauf-'+tiefe,welt(xStart,1.08,tiefe),welt(xStart-lauf,hoehe+1.05,tiefe),.026,metall,treppe);
      for(const i of [0,4,8,12,17]){const x=xStart-(i+.5)*lauf/stufen,y=(i+1)*hoehe/stufen;
        stab('treppen-gelaender-'+tiefe+'-'+i,welt(x,y,tiefe),welt(x,y+1.0,tiefe),.023,metall,treppe);}
    }
    const links=new T.Group();links.name='clubhaus-heller-anbau';g.add(links);
    box('anbau-sockel',30,54,55.6,65.6,0,.18,sockel,links);
    box('anbau-hell',30,54,55.6,65.6,.18,3.04,putz,links);
    box('anbau-flachdach',30,54,55.35,66,3.04,3.23,flachdach,links);
    box('anbau-stirnblende',30,54,55.35,55.60,2.93,3.23,holz,links);
    // Das aktuelle Nutzerpanorama belegt hier eine lange geschlossene helle Wand, keine symmetrische Fensterreihe.
    fenster('anbau-tuer',49.8,51.15,55.51,.18,2.58,gruen,1,links);
    // Der höhere helle Körper sitzt am linken Ende zurück, nicht als gleichmäßiger zweiter Riegel.
    box('anbau-hoher-teil',46,54,60.1,65.8,3.23,4.66,putz,links);
    fenster('anbau-hoch-fenster-1',47.1,48.0,60.04,3.55,4.42,gruen,1,links);
    fenster('anbau-hoch-fenster-2',50.7,51.6,60.04,3.55,4.42,gruen,1,links);
    const a=46,b=54,v=60,h=66,e=4.66,f=5.93,mitte=63,r1=47.25,r2=52.75;
    flaeche('anbau-hohes-dach-vorn',[welt(b,e,v),welt(a,e,v),welt(r1,f,mitte),welt(r2,f,mitte)],dach,links);
    flaeche('anbau-hohes-dach-hinten',[welt(r2,f,mitte),welt(r1,f,mitte),welt(a,e,h),welt(b,e,h)],dach,links);
    flaeche('anbau-hohes-dach-links',[welt(b,e,h),welt(b,e,v),welt(r2,f,mitte)],dach,links);
    flaeche('anbau-hohes-dach-rechts',[welt(a,e,v),welt(a,e,h),welt(r1,f,mitte)],dach,links);
    const rechts=new T.Group();rechts.name='clubhaus-rechter-fluegel';g.add(rechts);
    box('rechter-sockel',-6,4,55.75,65.65,0,.18,sockel,rechts);
    box('rechter-klinker',-6,4,55.75,65.65,.18,3.05,klinker,rechts);
    satteldach('rechter-dach',-6,4,55.45,66,3.07,4.48,rechts,klinker);
    box('rechter-stirnblende',-6,4,55.45,55.69,2.84,3.10,holz,rechts);
    fenster('rechter-tuer',1.8,3.15,55.67,.18,2.62,gruen,1,rechts);
    for(const x of [-3.8,-.9])fenster('rechter-oberlicht-'+x,x-.72,x+.72,55.67,2.12,2.58,gruen,1,rechts);
    fotoAnbringen(g,T,opt);return g;
  }
  return {bauen};
})();

/* Drei Nordmasten aus Alberts überlappenden Originalfotos, keine gespiegelte Stadionbeleuchtung.
   Foto 3: A bei x502, B bei x860. Foto 4: derselbe B bei x134, C bei x730.
   Plan: A(-65,-50), B(-7,-55), C(52.5,-53). Welt-X=-Plan-x, Welt-Z=-(Plan-y+50).
   Die 18 m Schafthöhe, Radien 0,11/0,07 m und Kopfmaße sind Fotoannahmen, nicht vermessen.
   Alle Geometrien und Materialien hängen an Meshes der Gruppe und sind per traverse entsorgbar.
   Kein Laden, DOM, Zeitgeber oder zusätzliches Szenenlicht. */
window.STADIONMASTEN=(()=>{
  'use strict';
  const MASTEN=[
    {id:'A',x:-65,y:-50,fotos:[{foto:3,x:502}]},
    {id:'B',x:-7,y:-55,fotos:[{foto:3,x:860},{foto:4,x:134}]},
    {id:'C',x:52.5,y:-53,fotos:[{foto:4,x:730}]}
  ];
  function bauen(T){
    if(!T?.Group||!T?.Mesh||!T?.CylinderGeometry||!T?.BoxGeometry||!T?.MeshStandardMaterial)throw new Error('Die 3D-Bibliothek für die Stadionmasten fehlt.');
    const g=new T.Group();g.name='stadion-nordmasten';
    g.userData={quelle:'Alberts Originalfotos 3 und 4; Mast B erscheint auf beiden Aufnahmen.',
      annahmen:{hoehe:18,radiusUnten:.11,radiusOben:.07,ausrichtung:'Leuchten zum Spielfeld gerichtet, angenähert'},vermessen:false};
    const schaft=new T.CylinderGeometry(.07,.11,18,12),quer=new T.BoxGeometry(.95,.065,.075),
      halter=new T.BoxGeometry(.045,.13,.04),gehaeuse=new T.BoxGeometry(.36,.24,.11),glas=new T.BoxGeometry(.29,.17,.009);
    const blau=new T.MeshStandardMaterial({color:0x1b4e7e,roughness:.72,metalness:.35}),
      metall=new T.MeshStandardMaterial({color:0x3d464b,roughness:.63,metalness:.4}),
      reflektor=new T.MeshStandardMaterial({color:0xd7d9cf,roughness:.3,metalness:.12});
    function mesh(parent,name,geo,mat,x,y,z){const m=new T.Mesh(geo,mat);m.name=name;m.position.set(x,y,z);m.castShadow=true;m.receiveShadow=true;parent.add(m);return m;}
    for(const p of MASTEN){
      const mast=new T.Group();mast.name='stadion-nordmast-'+p.id;mast.position.set(-p.x,0,-p.y-50);
      mast.userData={mast:p.id,plan:{x:p.x,y:p.y},fotos:p.fotos.map(f=>({...f})),hoeheAnnahme:18};g.add(mast);
      const rohr=mesh(mast,'mast-'+p.id+'-schaft',schaft,blau,0,9,0);rohr.userData.typ='mastschaft';
      const kopf=new T.Group();kopf.name='mast-'+p.id+'-kopf';
      // Lokale Vorderseite ist -Z. Einmal zum Spielfeld ausrichten, keine erfundenen Zusatzmasten.
      kopf.rotation.y=Math.atan2(-p.x,-p.y);mast.add(kopf);
      mesh(kopf,'mast-'+p.id+'-quertraeger',quer,blau,0,17.82,0);
      for(const [i,x] of [-.25,.25].entries()){
        mesh(kopf,'mast-'+p.id+'-halter-'+(i+1),halter,metall,x,17.87,0);
        const fluter=new T.Group();fluter.name='mast-'+p.id+'-fluter-'+(i+1);fluter.position.set(x,17.96,-.025);fluter.rotation.x=-.2;
        fluter.userData={typ:'fluter',mast:p.id};kopf.add(fluter);
        mesh(fluter,fluter.name+'-gehaeuse',gehaeuse,metall,0,0,0);
        mesh(fluter,fluter.name+'-reflektor',glas,reflektor,0,0,-.06);
      }
    }
    return g;
  }
  return {bauen};
})();

/* Zwei verschiedene grüne Bauwerke aus Alberts Originalfotos 278343 und 278342.
   Keine neuen Bilddateien, Schriften, Schilder oder generierten Fassaden.
   Plan -> Three: X=-Plan-x, Z=-(Plan-y+50); die Fronten schauen nach Süden zum Feld (Welt -Z).
   Arbeitsanker: großer Pavillon (-48,-58), kleiner Unterstand (10,-58), nicht vermessen.
   Zur Referenzkamera Plan(45,35), H1,65, f904 passen die ursprünglich angenommenen 3,4 m beim großen
   Pavillon nicht zum Foto. Annäherung an seine 53×38 Pixel: 7,3 m Breite, 5,5 m Höhe plus 0,55 m Sockel.
   Kleiner Unterstand: 5,5 m Breite, 2,7 m Höhe plus 0,20 m Sockel bei 66×26 Pixeln. Tiefen 3/2,5 m
   bleiben Fotoannahmen, ebenso Dachneigung und Geländehöhe. Keine Aussage über Innenräume.
   Diese kleinen Vorlagen können Nahdetails nicht belegen. Die großen Flächen und Silhouetten sind
   rekonstruiert; verdeckte Seiten bleiben einfache passende Materialien. Originalpixel nur per UV-Projektion. */
window.STADIONPAVILLONS=(()=>{
  'use strict';
  const BAUTEN=[
    {id:'gross',x:-48,y:-58,w:7.3,d:3,basis:.55,h:5.5,datei:'stadion-original-nord.jpg',pixel:[603,311,656,349]},
    {id:'klein',x:10,y:-58,w:5.5,d:2.5,basis:.2,h:2.7,datei:'stadion-original-nordost.jpg',pixel:[285,315,351,341]}
  ];
  function bauen(T,opt={}){
    if(!T?.Group||!T?.MeshStandardMaterial)throw new Error('Die 3D-Bibliothek für die Pavillons fehlt.');
    const g=new T.Group();g.name='stadion-pavillons';
    g.userData={quelle:'Alberts Originalfotos 278343 und 278342, 20.11.2026',
      hinweis:'Anker, Maße, Sockel und Dachtiefen aus Foto und Kameraprojektion angenähert, keine Vermessung.'};
    const unit=new T.BoxGeometry(1,1,1),welt=(x,h,y)=>[-x,h,-y-50];
    const mat=(c,r=.95)=>new T.MeshStandardMaterial({color:c,roughness:r});
    function mesh(p,n,geo,m){const o=new T.Mesh(geo,m);o.name=n;o.castShadow=true;o.receiveShadow=true;p.add(o);return o;}
    function box(p,n,x0,x1,y0,y1,h0,h1,m){const o=mesh(p,n,unit,m);o.position.set(-(x0+x1)/2,(h0+h1)/2,-(y0+y1)/2-50);o.scale.set(x1-x0,h1-h0,y1-y0);return o;}
    function flaeche(p,n,P,m){const geo=new T.BufferGeometry();geo.setAttribute('position',new T.Float32BufferAttribute(P.flat(),3));geo.setIndex(P.length===4?[0,1,2,0,2,3]:[0,1,2]);geo.computeVertexNormals();return mesh(p,n,geo,m);}
    function pult(p,n,x0,x1,v,h,hv,hh,m){flaeche(p,n,[welt(x0,hv,v),welt(x1,hv,v),welt(x1,hh,h),welt(x0,hh,h)],m);}
    function walm(p,n,x0,x1,v,h,e,f,m){const ym=(v+h)/2,l=x0+.6,r=x1-.6;
      flaeche(p,n+'-vorn',[welt(x0,e,v),welt(x1,e,v),welt(r,f,ym),welt(l,f,ym)],m);
      flaeche(p,n+'-hinten',[welt(l,f,ym),welt(r,f,ym),welt(x1,e,h),welt(x0,e,h)],m);
      flaeche(p,n+'-links',[welt(x0,e,h),welt(x0,e,v),welt(l,f,ym)],m);
      flaeche(p,n+'-rechts',[welt(x1,e,v),welt(x1,e,h),welt(r,f,ym)],m);
    }
    function foto(p,a){
      if(opt.foto===false||!(opt.foto||typeof opt.onTextur==='function')||!T.TextureLoader)return;
      const lebendig=()=>typeof opt.lebendig!=='function'||opt.lebendig();if(!lebendig())return;
      const mats=new Set();p.traverse(o=>{if(o.material)mats.add(o.material);});
      const [x0,y0,x1,y1]=a.pixel,rect=new T.Vector4(x0/1280,1-y1/721,(x1-x0)/1280,(y1-y0)/721),
        mass=new T.Vector4(-a.x+a.w/2,a.w,a.basis,a.h),bereit={value:0},originale=[],gemerkt=new Set();
      let t=null,verbunden=false,fehlerhaft=false;p.userData.fotoStatus='laedt';
      function verbinden(bild){if(!bild)return;t=bild;bild.encoding=T.sRGBEncoding;bild.wrapS=bild.wrapT=T.ClampToEdgeWrapping;
        bild.anisotropy=Math.max(1,Math.min(8,Number.isFinite(opt.anisotropie)?opt.anisotropie:1));
        if(!verbunden){verbunden=true;for(const m of mats){const alt=m.onBeforeCompile,key=m.customProgramCacheKey;originale.push({m,alt,key,map:m.map});
          m.onBeforeCompile=(s,r)=>{alt.call(m,s,r);s.uniforms.pvBereit=bereit;s.uniforms.pvRect={value:rect};s.uniforms.pvMass={value:mass};
            const vars='varying vec3 pvP;varying vec3 pvN;\n';
            s.vertexShader=vars+s.vertexShader.replace('#include <begin_vertex>','#include <begin_vertex>\npvP=(modelMatrix*vec4(transformed,1.)).xyz;pvN=mat3(modelMatrix)*normal;');
            s.fragmentShader=vars+'uniform float pvBereit;uniform vec4 pvRect;uniform vec4 pvMass;\n'+s.fragmentShader;
            s.fragmentShader=s.fragmentShader.replace('#include <map_fragment>','');
            s.fragmentShader=s.fragmentShader.replace('#include <normal_fragment_begin>',`
              if(pvBereit>.5&&normalize(pvN).z<-.03){
                vec2 p=vec2((pvMass.x-pvP.x)/pvMass.y,(pvP.y-pvMass.z)/pvMass.w);
                if(all(greaterThanEqual(p,vec2(0.)))&&all(lessThanEqual(p,vec2(1.)))){
                  vec3 c=texture2D(map,pvRect.xy+p*pvRect.zw).rgb;
                  bool himmel=c.b>c.r*1.25&&c.b>c.g*1.10;
                  if(!himmel)diffuseColor.rgb=c;
                }
              }
              #include <normal_fragment_begin>
            `);
          };m.customProgramCacheKey=()=>key.call(m)+'|pavillon-originalfoto-1';m.map=bild;m.needsUpdate=true;
        }}else for(const m of mats)if(m.map!==bild){m.map=bild;m.needsUpdate=true;}
        if(!gemerkt.has(bild)){gemerkt.add(bild);opt.onTextur?.(bild);}
      }
      function fehler(){fehlerhaft=true;bereit.value=0;t?.dispose();if(!lebendig())return;
        for(const v of originale){v.m.map=v.map;v.m.onBeforeCompile=v.alt;v.m.customProgramCacheKey=v.key;v.m.needsUpdate=true;}
        p.userData.fotoStatus='ersatz';opt.onFehler?.(a.id);opt.onChange?.();
      }
      try{t=new T.TextureLoader().load('partner/'+a.datei,bild=>{
        if(!lebendig()||fehlerhaft){bild.dispose();return;}
        verbinden(bild);bereit.value=1;p.userData.fotoStatus='bereit';opt.onChange?.();
      },undefined,fehler);if(fehlerhaft||!lebendig()){t?.dispose();return;}verbinden(t);}catch(_){fehler();}
    }
    for(const a of BAUTEN){const p=new T.Group();p.name='stadion-pavillon-'+a.id;
      p.userData={plan:{x:a.x,y:a.y},annahme:{breite:a.w,tiefe:a.d,sockel:a.basis,hoehe:a.h},fotobereich:a.pixel.slice()};g.add(p);
      const x0=a.x-a.w/2,x1=a.x+a.w/2,v=a.y+a.d/2,h=a.y-a.d/2;
      const gruen=mat(a.id==='gross'?0x99c638:0x4d7b34),dunkel=mat(a.id==='gross'?0x34422c:0x233525),
        dach=mat(0x343c32),hell=mat(a.id==='gross'?0xcdd2bd:0x37542a),erde=mat(0x727e5c);dach.side=T.DoubleSide;
      box(p,'sockel-'+a.id,x0+.12,x1-.12,h+.12,v-.12,0,a.basis,erde);
      if(a.id==='gross'){
        box(p,'gross-gruene-front',x0+.15,x1-.15,h+.2,v-.2,a.basis,3.28,gruen);
        for(const x of [x0+.22,x1-.22])box(p,'gross-heller-rand-'+x,x-.09,x+.09,v-.24,v-.13,a.basis,3.30,hell);
        box(p,'gross-mittelstreifen',a.x-.07,a.x+.07,v-.27,v-.12,a.basis,3.28,dunkel);
        box(p,'gross-dunkle-oeffnung-links',x0+.65,x0+1.45,v-.26,v-.15,a.basis+.45,2.52,dunkel);
        box(p,'gross-untere-dachkante',x0,x1,v-.20,v,3.28,3.48,dach);
        pult(p,'gross-unteres-pultdach',x0,x1,v,h,3.48,3.70,dach);
        box(p,'gross-zurueckgesetzter-aufsatz',a.x-2.05,a.x+2.05,h+.35,v-.85,3.62,5.65,dunkel);
        walm(p,'gross-oberes-dach',a.x-2.4,a.x+2.4,v-.75,h+.1,5.65,6.05,dach);
      }else{
        // Offener Unterstand: grüne linke Teilfläche, dunkle zurückliegende Wand, schmale Frontstützen.
        box(p,'klein-rueckwand',x0+.2,x1-.2,h+.12,h+.28,a.basis,2.58,dunkel);
        box(p,'klein-seitenwand-links',x0+.14,x0+.31,h+.2,v-.18,a.basis,2.58,gruen);
        box(p,'klein-gruenes-frontpaneel-links',x0+.2,x0+1.55,v-.28,v-.15,a.basis,2.20,gruen);
        for(const x of [x0+.22,x0+1.55,x1-.22])box(p,'klein-frontstuetze-'+x,x-.065,x+.065,v-.24,v-.11,a.basis,2.72,hell);
        box(p,'klein-dachkante',x0,x1,v-.18,v,2.53,2.72,dach);
        pult(p,'klein-einfaches-pultdach',x0,x1,v,h,2.72,2.90,dach);
        // Kein höherer Dachkörper auf dem kleinen Unterstand.
      }
      foto(p,a);
    }
    return g;
  }
  return {bauen};
})();

/* Begehbarer Grundriss nach svm101.js/155_bandenplan_stadion.sql: Luftbild 14.11.2026, etwa ±5 %.
   Plan: Mittelpunkt 0/0, Norden negatives y. Three: X=-Plan-x, Z=-(Plan-y+50), Augenhöhe 1,65 m.
   x0 ist die Strecke entlang einer Bandenlinie, kein globaler X-Wert. Für weitere heutige Bereiche
   können originale bpReihe-Anker als tafel.plan:{x,y,w,nx,ny} übergeben werden.
   Clubhaus und fotografische Umgebung folgen Alberts Originalfotos, siehe STADION_REFERENZEN.md.
   Die Außenkulisse ist eine fotografische Projektion; nur der Bandenplan ist im Luftbild vermessen. */
window.BANDENRAUM=(()=>{
  'use strict';
  const kl=(n,a,b)=>Math.max(a,Math.min(b,n)), zahl=(n,v=0)=>Number.isFinite(+n)?+n:v;
  const STADION=Object.freeze({G:84.4,RA:44.6,RI:36.5,NORD:50,SUED:48.6,RB:48.6,FELD_L:100,FELD_B:64});
  let threeP=null;
  function laden(src){
    if(window.THREE)return Promise.resolve(window.THREE);
    if(threeP)return threeP;
    threeP=new Promise((ja,nein)=>{const s=document.createElement('script');s.src=src;
      s.onload=()=>window.THREE?ja(window.THREE):nein(new Error('Die 3D-Bibliothek fehlt.'));
      s.onerror=()=>{s.remove();nein(new Error('Die 3D-Ansicht konnte nicht geladen werden.'));};document.head.appendChild(s);
    }).catch(e=>{threeP=null;throw e;});return threeP;
  }
  const planGueltig=p=>p&&Number.isFinite(+p.x)&&Number.isFinite(+p.y)&&Math.abs(+p.x)<1000&&Math.abs(+p.y)<1000;
  function gueltigeTafeln(ta){return (Array.isArray(ta)?ta:[]).filter(t=>t&&t.id!=null&&(Number.isFinite(+t.x0)&&Math.abs(+t.x0)<1000||planGueltig(t.plan))&&+t.l>=.2&&+t.l<=20).map(t=>({...t,id:String(t.id),x0:zahl(t.x0),l:+t.l,h:kl(zahl(t.h,.8),.3,2)}));}
  function bereich(k){return ['gegenseite','sued'].includes(k)?'sued':['tor_ost','ost'].includes(k)?'ost':['tor_west','west'].includes(k)?'west':'nord';}
  function nordPunkt(s){const G2=STADION.G/2,R=STADION.NORD;
    if(s<-G2){const f=(-G2-s)/R;return {x:-G2-R*Math.sin(f),y:-R*Math.cos(f),w:-f*180/Math.PI,nx:-Math.sin(f),ny:-Math.cos(f)};}
    if(s>G2){const f=(s-G2)/R;return {x:G2+R*Math.sin(f),y:-R*Math.cos(f),w:f*180/Math.PI,nx:Math.sin(f),ny:-Math.cos(f)};}
    return {x:s,y:-R,w:0,nx:0,ny:-1};}
  function linienPunkt(s,art='nord'){
    art=bereich(art);if(art==='nord')return nordPunkt(s);if(art==='sued')return {x:-s,y:STADION.SUED,w:180,nx:0,ny:1};
    const a=(art==='west'?Math.PI:0)+s/STADION.RB;return {x:(art==='west'?-1:1)*STADION.G/2+STADION.RB*Math.cos(a),y:STADION.RB*Math.sin(a),w:a*180/Math.PI+90,nx:Math.cos(a),ny:Math.sin(a)};
  }
  function tafelLage(t,art='nord'){if(planGueltig(t.plan)){const a=t.plan,n=Number.isFinite(+a.nx)&&Number.isFinite(+a.ny)&&Math.hypot(+a.nx,+a.ny)>.5;
      return {x:+a.x,y:+a.y,w:n?Math.atan2(+a.nx,-a.ny)*180/Math.PI:zahl(a.w),nx:n?+a.nx:Math.sin(zahl(a.w)*Math.PI/180),ny:n?+a.ny:-Math.cos(zahl(a.w)*Math.PI/180)};}
    return linienPunkt(zahl(t.x0)+zahl(t.l)/2,t.bereich||art);}
  function ovalKontur(r){const g=STADION.G/2,p=[];for(let i=0;i<=32;i++)p.push({x:-g+2*g*i/32,y:-r});
    for(let i=1;i<=64;i++){const a=-Math.PI/2+Math.PI*i/64;p.push({x:g+r*Math.cos(a),y:r*Math.sin(a)});}
    for(let i=1;i<=32;i++)p.push({x:g-2*g*i/32,y:r});
    for(let i=1;i<=64;i++){const a=Math.PI/2+Math.PI*i/64;p.push({x:-g+r*Math.cos(a),y:r*Math.sin(a)});}return p;}
  function grenzen(){const rx=STADION.SUED-1.4;return {links:-52.5,rechts:52.5,mitte:0,minX:-STADION.G/2-rx,maxX:STADION.G/2+rx,minZ:-50-rx,maxZ:-1.4,oval:true};}
  function begrenzen(p,G){let x=kl(zahl(p.x),G.minX,G.maxX),z=kl(zahl(p.z),G.minZ,G.maxZ);
    if(G.oval){const y=-z-50,c=kl(x,-STADION.G/2,STADION.G/2),dx=x-c,rx=STADION.SUED-1.4,ry=(y<0?STADION.NORD:STADION.SUED)-1.4,n=Math.hypot(dx/rx,y/ry);
      if(n>1){x=c+dx/n;z=-(y/n+50);}}
    return {...p,x,z,y:1.65};}
  function versetzen(p,vor,seit,sek,G){
    vor=zahl(vor);seit=zahl(seit);const n=Math.max(1,Math.hypot(vor,seit)),s=kl(zahl(sek),0,1)*3/n,w=zahl(p.blick);
    return begrenzen({...p,x:zahl(p.x)+(Math.sin(w)*vor+Math.cos(w)*seit)*s,z:zahl(p.z)+(Math.cos(w)*vor-Math.sin(w)*seit)*s},G);
  }
  function erstellen(cv,opt={}){
    let lebt=true,T=null,renderer=null,szene=null,kamera=null,gruppe=null,belege=new Map(),tafeln=gueltigeTafeln(opt.tafeln),G=grenzen(tafeln),ansichtBereich=bereich(opt.bereich||opt.stadion?.bereich),
      p={x:0,y:1.65,z:-18,blick:0,neigung:-.055},raf=0,letzteZeit=0,letzteMeldung=0,dirty=true,ro=null,drag=null;
    const tasten=new Set(),entsorger=[],geometrien=new Set(),materialien=new Set(),texturen=new Set(),treffer=[];
    const altTouch=cv.style.touchAction,altIndex=cv.getAttribute('tabindex');
    const meldung=t=>{if(lebt)opt.onStatus?.(t);};
    const aktiv=()=>lebt&&!document.hidden&&cv.isConnected;
    const geo=g=>(geometrien.add(g),g),mat=m=>(materialien.add(m),m),tex=t=>(texturen.add(t),t);
    const event=(e,n,fn,o)=>{e.addEventListener(n,fn,o);entsorger.push(()=>e.removeEventListener(n,fn,o));};
    function zustand(){const py=-p.z-50,k=ansichtBereich,dx=p.x-kl(p.x,-STADION.G/2,STADION.G/2);let a=Math.atan2(py,p.x-(k==='west'?-1:1)*STADION.G/2);if(k==='west'&&a<0)a+=2*Math.PI;
      const s=k==='nord'?(dx?Math.sign(dx)*(STADION.G/2+STADION.NORD*Math.atan2(Math.abs(dx),-py)):p.x):k==='sued'?-p.x:STADION.RB*(a-(k==='west'?Math.PI:0));
      const q=linienPunkt(s,k),abstand=Math.hypot(p.x-q.x,py-q.y);return {x:p.x,y:1.65,z:p.z,blick:p.blick,neigung:p.neigung,abstand,s,planX:p.x,planY:py};}
    function kameraSetzen(){if(!kamera)return;const co=Math.cos(p.neigung);kamera.position.set(-p.x,1.65,p.z);
      kamera.lookAt(-p.x-Math.sin(p.blick)*co,1.65+Math.sin(p.neigung),p.z+Math.cos(p.blick)*co);
      const z=zustand();cv.dataset.kameraX=p.x.toFixed(2);cv.dataset.abstand=z.abstand.toFixed(2);cv.dataset.blick=p.blick.toFixed(3);
      cv.dataset.planY=(-p.z-50).toFixed(2);cv.dataset.bogenposition=z.s.toFixed(2);
      cv.dataset.neigung=p.neigung.toFixed(3);
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
      renderer.setPixelRatio(Math.min(2,window.devicePixelRatio||1));renderer.setSize(w,h,false);kamera.aspect=w/h;
      kamera.fov=Math.min(43.5,2*Math.atan(Math.tan(40*Math.PI/180)/kamera.aspect)*180/Math.PI);kamera.updateProjectionMatrix();cv.dataset.bildwinkel=kamera.fov.toFixed(2);sofort();}
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
    function ladenTextur(src,wieder,material,relief=0,ausschnitt=false){if(!src)return;new T.TextureLoader().load(src,t=>{if(!lebt){t.dispose();return;}tex(t);t.encoding=T.sRGBEncoding;t.wrapS=t.wrapT=T.RepeatWrapping;t.repeat.set(...wieder);t.anisotropy=Math.min(8,renderer.capabilities.getMaxAnisotropy());
      if(ausschnitt){t.minFilter=T.LinearFilter;t.generateMipmaps=false;t.anisotropy=1;}material.map=t;
      if(relief){const k=tex(t.clone());k.encoding=T.LinearEncoding;k.needsUpdate=true;material.bumpMap=k;material.bumpScale=relief;}
      material.needsUpdate=true;anfordern();},undefined,()=>{if(lebt)meldung('Die Materialien werden vereinfacht dargestellt. Du kannst die Plätze weiter ansehen.');});}
    function umfeld(){
      const gras=mat(new T.MeshStandardMaterial({color:0xa0ac7a,roughness:1})),bahn=mat(new T.MeshStandardMaterial({color:0x723c29,roughness:.98})),
        weiss=mat(new T.MeshStandardMaterial({color:0xeeeade,roughness:.9}));
      const grund=boden(2000,1800,0,-50,gras,-.035);grund.name='stadion-grund';ladenTextur(opt.texturen?.rasen,[800,720],gras,.025);
      function ovalRing(ri,ra,m,y,name){const innen=ovalKontur(ri),aussen=ovalKontur(ra),pos=[],uv=[],idx=[];
        for(let i=0;i<innen.length;i++){for(const p of [innen[i],aussen[i]]){pos.push(-p.x,y,-p.y-50);uv.push(-p.x/1.7,(-p.y-50)/1.7);}if(i<innen.length-1){const a=i*2;idx.push(a,a+2,a+1,a+1,a+2,a+3);}}
        const g=new T.BufferGeometry();g.setAttribute('position',new T.Float32BufferAttribute(pos,3));g.setAttribute('uv',new T.Float32BufferAttribute(uv,2));g.setIndex(idx);g.computeVertexNormals();
        const o=mesh(g,m,0,0,0,false);o.name=name;o.userData={innen:ri,aussen:ra,gerade:STADION.G};return o;
      }
      ovalRing(STADION.RI,STADION.RA,bahn,.004,'stadion-laufbahn');
      if(window.STADIONFOTO){
        // Die rote Asche stammt aus dem unberührten Clubhauspanorama, nur der UV-Ausschnitt wird wiederholt.
        bahn.color.setHex(0x9d4b25);bahn.customProgramCacheKey=()=> 'original-asche-1';
        bahn.onBeforeCompile=s=>{s.fragmentShader=s.fragmentShader.replace('#include <map_fragment>',T.ShaderChunk.map_fragment.replace('texture2D( map, vUv )','texture2D( map, vec2(.35+fract(vUv.x)*.18,.005+fract(vUv.y)*.20) )'));};
        ladenTextur('partner/stadion-original-clubhaus-panorama.jpg',[1,1],bahn,0,true);
      }else ladenTextur(opt.texturen?.weg,[1,1],bahn,.018);
      // In den Hauptplatzfotos sind keine parallelen weißen Bahnlinien erkennbar.
      const stein=mat(new T.MeshStandardMaterial({color:0xaaa99e,roughness:.95}));ovalRing(STADION.RI-.05,STADION.RI+.05,stein,.016,'stadion-steinrand');
      const feldX=-STADION.FELD_L/2,feldZ=-50-STADION.FELD_B/2,strich=.1,feld=mat(new T.MeshBasicMaterial({color:0xf0efe2,transparent:true,opacity:.08,depthWrite:false}));
      [feldZ,feldZ+STADION.FELD_B].forEach((z,i)=>{const l=boden(STADION.FELD_L,strich,0,z,feld,.014);l.name='stadion-seitenlinie-'+(i?'nord':'sued');});
      [feldX,0,-feldX].forEach((x,i)=>{const l=boden(strich,STADION.FELD_B,x,-50,feld,.014);l.name='stadion-feld-quer-'+i;});
      const kreis=mesh(new T.RingGeometry(9.1,9.2,72),feld,0,.015,-50,false);kreis.rotation.x=-Math.PI/2;kreis.name='stadion-mittelkreis';
      for(const seite of [-1,1]){
        const x=seite*STADION.FELD_L/2,innen=x-seite*16.5,z=-50;
        [z-20.15,z+20.15].forEach(zz=>boden(16.5,strich,(x+innen)/2,zz,feld,.014));boden(strich,40.3,innen,z,feld,.014);
        const kurz=x-seite*5.5;[z-9.15,z+9.15].forEach(zz=>boden(5.5,strich,(x+kurz)/2,zz,feld,.014));boden(strich,18.3,kurz,z,feld,.014);
        for(const zz of [z-3.66,z+3.66]){stab([x,.05,zz],[x,2.44,zz],.045,weiss);stab([x,2.44,zz],[x+seite*1.8,.1,zz],.025,weiss);}
        stab([x,2.44,z-3.66],[x,2.44,z+3.66],.045,weiss);
        const netzM=mat(new T.LineBasicMaterial({color:0xd9ddd7,transparent:true,opacity:.38})),netz=[];
        for(let zz=z-3.66;zz<=z+3.67;zz+=.24)netz.push(x+seite*1.8,.05,zz,x+seite*1.8,2.25,zz);
        for(let yy=.05;yy<2.3;yy+=.24)netz.push(x+seite*1.8,yy,z-3.66,x+seite*1.8,yy,z+3.66);
        const ng=geo(new T.BufferGeometry());ng.setAttribute('position',new T.Float32BufferAttribute(netz,3));szene.add(new T.LineSegments(ng,netzM));
      }
      // Keine generierte Rundumkulisse oder unbestätigte Gebäude, Bäume, Zäune und Lichtmasten.
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
    function tafelBauen(t){const g=new T.Group(),P=tafelLage(t,ansichtBereich),w=P.w*Math.PI/180,cx=-P.x,cz=-P.y-50,h=t.h,nx=Math.sin(w),nz=-Math.cos(w);
      const rahmen=mat(new T.MeshStandardMaterial({color:0xd4d6d2,roughness:.65,metalness:.4})),front=mat(new T.MeshBasicMaterial({map:tafelflaeche(t),toneMapped:false}));
      const platte=new T.Mesh(geo(new T.BoxGeometry(t.l-.025,h+.035,.045)),rahmen);platte.position.set(cx,.22+h/2,cz);platte.rotation.y=-w;platte.castShadow=true;g.add(platte);
      const bild=new T.Mesh(geo(new T.PlaneGeometry(t.l-.045,h-.015)),front);bild.position.set(cx+nx*.026,.22+h/2,cz+nz*.026);bild.rotation.y=Math.PI-w;bild.userData.bandenId=t.id;bild.userData.plan={x:P.x,y:P.y,w:P.w};g.add(bild);
      const ringM=mat(new T.MeshBasicMaterial({color:0xeb752b,toneMapped:false})),ring=new T.Mesh(geo(new T.BoxGeometry(t.l,.035,.018)),ringM);ring.position.set(cx+nx*.04,.22+h+.045,cz+nz*.04);ring.rotation.y=-w;ring.visible=!!t.an;g.add(ring);
      szene.add(g);treffer.push(bild);return {g,bild,ring,t};
    }
    function gleich(a,b){const x=tafelLage(a,ansichtBereich),y=tafelLage(b,ansichtBereich);return x.x===y.x&&x.y===y.y&&x.w===y.w&&a.l===b.l&&a.h===b.h&&a.img===b.img&&a.name===b.name&&a.farbe===b.farbe&&a.frei===b.frei;}
    function tafelnSetzen(ta,neu){if(!lebt)return;const art=neu?.bereich?bereich(neu.bereich):ansichtBereich;
      if(art!==ansichtBereich){for(const b of belege.values())entsorgen(b.g);belege.clear();treffer.length=0;ansichtBereich=art;}
      tafeln=gueltigeTafeln(ta);G=grenzen(tafeln);if(!szene)return;
      const ids=new Set(tafeln.map(t=>t.id));for(const [id,b] of belege){if(!ids.has(id)){entsorgen(b.g);belege.delete(id);const i=treffer.indexOf(b.bild);if(i>=0)treffer.splice(i,1);}}
      for(const t of tafeln){let b=belege.get(t.id);if(b&&!gleich(b.t,t)){entsorgen(b.g);const i=treffer.indexOf(b.bild);if(i>=0)treffer.splice(i,1);b=null;}
        if(!b){b=tafelBauen(t);belege.set(t.id,b);}b.ring.visible=!!t.an;b.t=t;}
      p=versetzen(p,0,0,0,G);if(renderer)renderer.shadowMap.needsUpdate=true;anfordern();
    }
    function selection(id){if(!lebt)return;id=String(id);for(const [k,b] of belege)b.ring.visible=k===id;anfordern();}
    function kameraBei(q,d,neigung){const w=q.w*Math.PI/180;return begrenzen({x:q.x-Math.sin(w)*d,y:1.65,z:-q.y-50-Math.cos(w)*d,blick:w,neigung},G);}
    function zentrieren(id){if(!lebt)return;const t=tafeln.find(t=>t.id===String(id)),q=t?tafelLage(t,ansichtBereich):linienPunkt(Number.isFinite(+id)?+id:0,ansichtBereich);
      p=kameraBei(q,5.5,-.13);anfordern();opt.onMove?.(zustand());}
    function gehen(vor,seit,sek=.22){if(!lebt)return;p=versetzen(p,vor,seit,kl(zahl(sek),0,.3),G);anfordern();opt.onMove?.(zustand());}
    function drehen(yaw,pitch=0){if(!lebt)return;p.blick+=kl(zahl(yaw),-.7,.7);p.neigung=kl(p.neigung+kl(zahl(pitch),-.35,.35),-.62,.35);anfordern();}
    function reset(){if(!lebt)return;const k=ansichtBereich,d=k==='nord'?18:k==='sued'?16.6:STADION.G/2+STADION.RB-STADION.FELD_L/2;
      p=kameraBei(linienPunkt(0,k),d,-.055);anfordern();opt.onMove?.(zustand());}
    function rundblick(){if(!lebt)return;tasten.clear();p=begrenzen({x:45,y:1.65,z:-85,blick:-43.7*Math.PI/180,neigung:-1.2*Math.PI/180},G);anfordern();opt.onMove?.(zustand());}
    function vereinsheim(){if(!lebt)return;tasten.clear();p=begrenzen({x:20,y:1.65,z:-75,blick:Math.PI,neigung:.035},G);anfordern();opt.onMove?.(zustand());}
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
      renderer.toneMapping=T.ACESFilmicToneMapping;renderer.toneMappingExposure=.96;renderer.shadowMap.enabled=true;renderer.shadowMap.type=T.PCFSoftShadowMap;renderer.shadowMap.autoUpdate=false;renderer.shadowMap.needsUpdate=true;
      szene=new T.Scene();szene.background=new T.Color(window.STADIONFOTO?.SKY||0x59a9e9);
      kamera=new T.PerspectiveCamera(43.5,1,.08,600);gruppe=new T.Group();szene.add(gruppe);
      szene.add(new T.HemisphereLight(0xe4edf4,0x686446,.9));const sonne=new T.DirectionalLight(0xfff5df,1.4);sonne.position.set(-65,35,-180);sonne.target.position.set(0,0,-50);
      sonne.castShadow=true;sonne.shadow.mapSize.set(2048,2048);sonne.shadow.camera.left=-115;sonne.shadow.camera.right=115;sonne.shadow.camera.top=80;sonne.shadow.camera.bottom=-65;sonne.shadow.camera.far=310;sonne.shadow.normalBias=.025;szene.add(sonne,sonne.target);
      umfeld();
      const bauOpt={lebendig:()=>lebt,onTextur:tex,onChange:anfordern,anisotropie:renderer.capabilities.getMaxAnisotropy()};
      function baugruppe(bau){if(!bau?.isObject3D)return;bau.traverse(o=>{if(o.geometry)geometrien.add(o.geometry);for(const m of (Array.isArray(o.material)?o.material:[o.material]).filter(Boolean)){materialien.add(m);for(const t of Object.values(m))if(t?.isTexture)texturen.add(t);for(const u of Object.values(m.uniforms||{}))if(u.value?.isTexture)texturen.add(u.value);}});szene.add(bau);}
      if(window.STADIONBAU?.bauen)baugruppe(window.STADIONBAU.bauen(T,bauOpt));
      if(window.STADIONMASTEN?.bauen)baugruppe(window.STADIONMASTEN.bauen(T));
      if(window.STADIONPAVILLONS?.bauen)baugruppe(window.STADIONPAVILLONS.bauen(T,bauOpt));
      if(window.STADIONFOTO?.bauen)baugruppe(window.STADIONFOTO.bauen(T,{...bauOpt,onFehler:()=>meldung('Ein Stadionfoto konnte nicht geladen werden. Der Rundgang und die Platzwahl bleiben verfügbar.')}));
      tafelnSetzen(tafeln);eingaben();if(window.ResizeObserver){ro=new ResizeObserver(groesse);ro.observe(cv);}else event(window,'resize',groesse);groesse();
      reset();sofort();
      meldung('3D-Ansicht bereit. Ziehen zum Umsehen. WASD zum Gehen, Pfeile links und rechts zum Drehen.');
      document.fonts?.ready?.then(()=>{if(lebt){for(const b of belege.values())b.t={...b.t,name:null};tafelnSetzen(tafeln);}});
      return true;
    })().catch(e=>{if(lebt){meldung('3D ist auf diesem Gerät gerade nicht verfügbar. Du kannst die Plätze in der Liste auswählen.');lebt=false;aufraeumen();opt.onFallback?.(e);}throw e;});
    return {bereit,setTafeln:tafelnSetzen,setSelection:selection,zentrieren,gehen,drehen,reset,rundblick,vereinsheim,zerstoeren(){if(!lebt)return;lebt=false;aufraeumen();},get position(){return zustand();}};
  }
  return {erstellen,grenzen,versetzen,STADION,nordPunkt,linienPunkt,tafelLage,ovalKontur};
})();
