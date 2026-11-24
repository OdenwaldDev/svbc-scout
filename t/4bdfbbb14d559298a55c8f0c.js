          "d": "M132 68.7A22.8 22.8 0 1 1 86.4 68.7A22.8 22.8 0 1 1 132 68.7Z",
          "original": "#FFED00",
          "ci": "#68B9DF"
        }
      ],
      "hash": {
        "ci": "b66f9fab61aeab45f48aaae7f957c2691243d445399abb7699abd09132973448",
        "original": "a0a99253d0d62d7d210bc102f9614501a578c1d960a043713fe382305f3496c7"
      }
    }
  };
  // ENDE DRUCKPFADE

  function schluessel(name) {
    const s = String(name || '').normalize('NFKD').replace(/[\u0300-\u036f]/g, '').toLowerCase().trim();
    if (/^basakci(?:\s|$)/.test(s)) return 'basakci';
    if (/^keil(?:[\s-]|$)/.test(s)) return 'keil';
    if (/^(?:paul\s+)?fierek(?:\s|$)/.test(s)) return 'fierek';
    if (/^fit[\s-]*inn?(?:\s|$)/.test(s)) return 'fitinn';
    return null;
  }

  function marke(key, modus) {
    if (!Object.prototype.hasOwnProperty.call(katalog, key) || !['ci','original'].includes(modus)) return null;
    return katalog[key];
  }

  function logo(key, modus = 'ci') {
    const m = marke(key, modus);
    if (!m) return null;
    return {
      width: m.width,
      height: m.height,
      paths: m.formen.map(p => ({
        d: p.d, fill: p[modus], stroke: 'none', strokeWidth: 0, opacity: 1, rule: 'evenodd'
      }))
    };
  }

  function svg(key, modus = 'ci') {
    const m = marke(key, modus);
    if (!m) return null;
    const kopf = '<svg xmlns="http://www.w3.org/2000/svg" width="' + m.width + '" height="' + m.height +
      '" viewBox="0 0 ' + m.width + ' ' + m.height + '">';
    return kopf + m.formen.map(p => '<path fill="' + p[modus] + '" fill-rule="evenodd" d="' + p.d + '"/>').join('') + '</svg>';
  }

  function revision(key, modus = 'ci') {
    const m = marke(key, modus);
    return m ? m.hash[modus] : null;
  }

  function zeichnen(ctx, key, modus, x, y, w, h) {
    const m = marke(key, modus);
    if (!m || !(w > 0 && h > 0)) return false;
    const s = Math.min(w / m.width, h / m.height);
    ctx.save();
    ctx.translate(x + (w - m.width * s) / 2, y + (h - m.height * s) / 2);
    ctx.scale(s, s);
    for (const form of m.formen) {
      ctx.fillStyle = form[modus];
      ctx.fill(new Path2D(form.d), 'evenodd');
    }
    ctx.restore();
    return true;
  }

  const api = Object.freeze({schluessel, logo, svg, revision, zeichnen});
  root.BANDENMARKEN = api;
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
})(typeof window === 'undefined' ? globalThis : window);

// Gemeinsames Motiv für Platzplan, Rundgang und Druck. Maße sind relativ zum Endformat.
const BANDEN_CI = (() => {
  const blau = '#174782';
  const bilder = new Map(), marken = new Map();
  function titel(s) {
    if (s.firma) return s.firma;
    if (s.stand !== 'frei') return ({option:'Angeboten',vorgemerkt:'Vorgemerkt',fest:'Vergeben'})[s.stand] || 'Vergeben';
    if (s.rolle === 'top') return '1896 Partner';
    if (s.rolle === 'mitte') return 'Hauptpartner';
    return s.zone === 'premium' ? 'Premium' : 'Frei';
  }
  function feld(w,h) { return {x:w*.045,y:h*.105,w:w*.91,h:h*.79}; }
  function bild(src) { const im = new Image(); return new Promise((ok,nein) => {
    im.onload=()=>ok(im);im.onerror=()=>nein(Error('Das Logo lässt sich gerade nicht anzeigen.'));im.src=src;
  }); }
  function svgBild(svg) { return bild('data:image/svg+xml;charset=utf-8,'+encodeURIComponent(svg)); }
  function vektorisiere(c) {
    const a=c.getContext('2d').getImageData(0,0,c.width,c.height);
    return new Promise((ok,nein) => {
      const worker=new Worker('bandenkontur.js');
      const ende=()=>{clearTimeout(timer);worker.terminate();};
      const timer=setTimeout(()=>{ende();nein(Error('Für dieses Motiv wird eine Vektorvorlage benötigt.'));},20000);
      worker.onmessage=e=>{ende();e.data.svg?ok(e.data.svg):nein(Error(e.data.fehler));};
      worker.onerror=()=>{ende();nein(Error('Die Konturen konnten nicht ermittelt werden.'));};
      worker.postMessage({bild:a,farbe:blau},[a.data.buffer]);
    });
  }
  async function originalPfade(src,modus) {
    if(!/^data:image\/svg\+xml[;,]/i.test(src)||src.length>4000000)return null;
    if(!window.BD_RENDER&&typeof sxScript==='function'){
      await Promise.all([sxScript('bandenstudio-core.js',()=>window.BD_CORE),sxScript('vendor/bandenstudio/svgpath.js',()=>window.BD_SVGPATH)]);
      await sxScript('bandenstudio-render.js',()=>window.BD_RENDER);
    }
    if(!window.BD_RENDER)return null;
    const komma=src.indexOf(','),teil=src.slice(komma+1);
    const text=/;base64$/i.test(src.slice(0,komma))?new TextDecoder().decode(Uint8Array.from(atob(teil),c=>c.charCodeAt(0))):decodeURIComponent(teil);
    const v=BD_RENDER.readSVG(text);
    const hell=c=>c!=='none'&&[1,3,5].every(i=>parseInt(c.slice(i,i+2),16)>=235);
    const farben=v.paths.filter(p=>p.opacity>0).flatMap(p=>[p.fill,p.stroke]).filter(c=>c!=='none');
    const nurHell=farben.length>0&&farben.every(hell);
    if(modus==='ci'){
      const umfaerben=c=>c==='none'?c:hell(c)&&!nurHell?'#ffffff':blau;
      for(const p of v.paths){p.fill=umfaerben(p.fill);p.stroke=umfaerben(p.stroke);}
    }
    const svg=BD_RENDER.vectorSVG(v);
    return {svg,img:await svgBild(svg),vektor:true,dunklerGrund:modus==='original'&&nurHell};
  }
  async function motiv(key,src,modus='ci') {
    const signatur=JSON.stringify([key,src,modus]);
    if(marken.has(signatur))return marken.get(signatur);
    const laden=(async()=>{
      if(key) {
        const svg=BANDENMARKEN.svg(key,modus);
        if(svg)return {svg,img:await svgBild(svg),vektor:true,nachgezeichnet:true};
      }
      if(!src)throw Error('Für diesen Platz fehlt ein Firmenlogo.');
      const pfade=await originalPfade(src,modus).catch(()=>null);if(pfade)return pfade;
      if(modus==='original') {
        const a=await LOGO.aufbereiten(src);
        return {img:await bild(a.c.toDataURL()),dunklerGrund:a.hell,vektor:false};
      }
      const canvas=await LOGO.variante(src,'farbe:'+blau);
      try {
        const svg=await vektorisiere(canvas);
        return {svg,img:await svgBild(svg),vektor:true,nachgezeichnet:true};
      }catch(e){
        return {img:await bild(canvas.toDataURL()),vektor:false,hinweis:e.message};
      }
    })();
    marken.set(signatur,laden);try{return await laden;}catch(e){marken.delete(signatur);throw e;}
  }
  async function tafel(key,src,modus,doppel) {
    const k=JSON.stringify([key,src,modus,doppel]);
    if(bilder.has(k))return bilder.get(k);
    const laden=(async()=>{
      const a=await motiv(key,src,modus),c=document.createElement('canvas');
      c.height=240;c.width=doppel?1500:750;
      const x=c.getContext('2d'),f=feld(c.width,c.height),im=a.img;
      x.fillStyle=a.dunklerGrund?'#173e71':'#ffffff';x.fillRect(0,0,c.width,c.height);
      const mass=Math.min(f.w/im.naturalWidth,f.h/im.naturalHeight);
      const w=im.naturalWidth*mass,h=im.naturalHeight*mass;
      x.drawImage(im,(c.width-w)/2,(c.height-h)/2,w,h);
      return bild(c.toDataURL('image/png'));
    })();
    bilder.set(k,laden);try{return await laden;}catch(e){bilder.delete(k);throw e;}
  }
  async function hash(svg) {
    const bytes=await crypto.subtle.digest('SHA-256',new TextEncoder().encode(svg));
    return [...new Uint8Array(bytes)].map(v=>v.toString(16).padStart(2,'0')).join('');
  }
  async function freigabefeld(el,slot,quelle,liste,rpc) {
    const generation=el._kennung={};
    const aktiv=()=>el.isConnected&&el._kennung===generation;
    el.replaceChildren();
    try{
      const bestand=await liste(),zeile=bestand.slots?.find(s=>s.platz===slot.id);
      if(!aktiv()||!bestand.darf||!zeile)return;
      if(!slot.sponsor||slot.sponsor!==zeile.sponsor||slot.firma!==zeile.firma||
        !Number.isSafeInteger(slot.ci_revision)||slot.ci_revision!==zeile.revision){
        el.textContent='Der Bandenplan hat sich geändert. Bitte lade ihn neu.';return;
      }
      if(slot.ci_quelle_passt===false){el.textContent='Für die Freigabe öffne das aktuelle Logo im Vereinsplan.';return;}
      const m=await motiv(slot.markenschluessel,quelle(),'ci');if(!aktiv())return;
      if(!m.svg){el.textContent=m.hinweis||'Für diese Freigabe fehlt die Vektorvorlage.';return;}
      const h=await hash(m.svg);if(!aktiv())return;
      const label=document.createElement('label'),check=document.createElement('input'),info=document.createElement('span');
      label.className='ci-freigabe';check.type='checkbox';check.checked=zeile.freigabe&&zeile.hash===h;
      info.setAttribute('role','status');const text=m.nachgezeichnet?'Nachgezeichnetes CI-Logo mit Partner freigegeben':'CI-Logo mit Partner freigegeben';
      label.append(check,document.createTextNode(text));el.replaceChildren(label,info);
      if(zeile.freigabe&&zeile.hash!==h)info.textContent='Die aktuelle Fassung braucht eine neue Freigabe.';
      check.onchange=async()=>{
        const wert=check.checked,vorher=zeile.freigabe&&zeile.hash===h;check.disabled=true;
        try{
          const r=await rpc('banden_ci_setzen',{p_platz:slot.id,p_sponsor:zeile.sponsor,p_hash:h,p_revision:zeile.revision,p_frei:wert});
          if(!r.ok)throw Error('Der Platz wurde inzwischen geändert. Bitte den Plan neu laden.');
          Object.assign(zeile,r);slot.ci_revision=r.revision;if(aktiv())info.textContent=wert?'Freigabe gespeichert.':'Freigabe zurückgenommen.';
        }catch(e){if(aktiv()){check.checked=vorher;info.textContent=e.message;}}
        finally{if(aktiv())check.disabled=false;}
      };
    }catch(e){if(aktiv())el.textContent=e.message||'Die Freigabe konnte nicht geladen werden.';}
  }
  return {titel,feld,motiv,tafel,hash,freigabefeld};
})();

// Exportiert die im Verein dokumentierten, aktuell freigegebenen Motive für genau eine Saison.
async function b27ExportDialog() {
  const saison=B27.saison;
  const modal=svModal(`<div class="mhead"><h2>Freigegebene CI-Logos</h2></div>
    <p id="b27ExZahl" class="msub" role="status">Die Freigaben werden geladen.</p>
    <form id="b27ExForm">
      <label class="pz-tc-dlgf"><span>Dateien im ZIP</span><select name="format">
        <option value="svg">Vektorlogos (SVG)</option>
        <option value="rgb">Vektorlogos und Druck-PDFs in RGB</option>
        <option value="cmyk">Vektorlogos und Druck-PDFs in CMYK</option>
      </select></label>
      <div id="b27ExDruck" hidden>
        <label class="pz-tc-dlgf"><span>Beschnitt je Seite laut Druckerei (mm)</span><input name="beschnitt" type="number" min="0" max="100" step="0.1" placeholder="z. B. 20"></label>
        <label class="bn-check" id="b27ExRgb"><input type="checkbox" name="rgb"> Die Druckerei nimmt RGB-Dateien an.</label>
        <label class="pz-tc-dlgf" id="b27ExIcc"><span>CMYK-Ausgabeprofil der Druckerei</span><input name="icc" type="file" accept=".icc,.icm"></label>
      </div>
      <p id="b27ExStatus" class="pz-tc-tipp" role="status" aria-live="polite"></p>
      <div class="pz-tc-dlgk"><button class="btn" type="submit" disabled>ZIP herunterladen</button>
      <button class="btn ghost" type="button" id="b27ExZu">Schließen</button></div>
    </form>`);
  const form=modal.querySelector('#b27ExForm'),felder=form.elements,knopf=form.querySelector('button[type=submit]');
  const status=modal.querySelector('#b27ExStatus'),zahl=modal.querySelector('#b27ExZahl');
  const sichtbar=()=>form.isConnected && B27.saison===saison && document.getElementById('overlay')?.classList.contains('open');
  async function freigaben() {
    const [plan,ci]=await Promise.all([bcRpc('banden_plan_laden',{p_saison:saison}),bcRpc('banden_ci_liste',{p_saison:saison})]);
    if(!Array.isArray(plan?.slots)||!Array.isArray(ci?.slots)) throw Error('Die aktuellen Freigaben lassen sich nicht lesen.');
    const plaetze=new Map(plan.slots.map(s=>[s.id,s]));
    return ci.slots.filter(f=>f.freigabe).map(f=>{
      const slot=plaetze.get(f.platz);
      if(!slot||slot.sponsor!==f.sponsor||slot.firma!==f.firma||slot.stand==='frei'||!['doppel','einzel'].includes(slot.art)||
          slot.ci_revision!==f.revision||!Number.isInteger(f.revision)||!(/^[0-9a-f]{64}$/.test(f.hash))) throw Error('Eine Freigabe oder Bande hat sich geändert. Starte den Export noch einmal.');
      return {slot,f};
    }).sort((a,b)=>a.slot.pos-b.slot.pos);
  }
  function anzahl(reihen) {
    zahl.textContent=reihen.length ? (reihen.length===1?'Ein freigegebenes Logo':reihen.length+' freigegebene Logos')+' für '+saison+'/'+String(saison+1).slice(-2)+'.' :
      'Noch keine Freigaben. Öffne eine belegte Bande und bestätige dort die CI-Fassung nach Rücksprache mit dem Partner.';
  }
  function signatur(reihen) {
    return JSON.stringify(reihen.map(({slot,f})=>[slot.id,slot.sponsor,slot.firma,slot.kennung,slot.art,slot.markenschluessel,f.revision,f.hash]));
  }
  function formatZeigen() {
    const modus=felder.format.value;
    modal.querySelector('#b27ExDruck').hidden=modus==='svg';felder.beschnitt.required=modus!=='svg';felder.beschnitt.disabled=modus==='svg';
    modal.querySelector('#b27ExRgb').hidden=modus!=='rgb';felder.rgb.required=modus==='rgb';felder.rgb.disabled=modus!=='rgb';
    modal.querySelector('#b27ExIcc').hidden=modus!=='cmyk';felder.icc.required=modus==='cmyk';felder.icc.disabled=modus!=='cmyk';
  }
  felder.format.onchange=formatZeigen;formatZeigen();
  modal.querySelector('#b27ExZu').onclick=()=>closeOverlay();
  let aktiv=false;
  form.onsubmit=async e=>{
    e.preventDefault();
    if(aktiv||!form.reportValidity())return;
    aktiv=true;knopf.disabled=true;
    const modus=felder.format.value,beschnitt=felder.beschnitt.valueAsNumber,rgb=felder.rgb.checked,datei=felder.icc.files[0];
    const eingaben=[felder.format,felder.beschnitt,felder.rgb,felder.icc];eingaben.forEach(el=>el.disabled=true);
    let druckrahmen=null;
    try{
      const reihen=await freigaben();if(!sichtbar())return;anzahl(reihen);
      if(!reihen.length)throw Error('Es gibt aktuell keine freigegebenen CI-Logos.');
      const Zip=await simpZip(),archiv=new Zip();
      await Promise.all([sxScript('bandenstudio-core.js',()=>window.BD_CORE),sxScript('vendor/bandenstudio/svgpath.js',()=>window.BD_SVGPATH)]);
      await sxScript('bandenstudio-render.js',()=>window.BD_RENDER);
      let profil=null,renderer=BD_RENDER;
      if(modus!=='svg'){
        if(!Number.isFinite(beschnitt)||beschnitt<0||beschnitt>100||modus==='rgb'&&!rgb)throw Error('Bitte die Druckvorgaben prüfen.');
        if(modus==='cmyk'){
          if(!datei||datei.size>8*1024*1024)throw Error('Bitte das CMYK-Profil der Druckerei auswählen (maximal 8 MB).');
          const data=await new Promise((ok,nein)=>{const r=new FileReader();r.onload=()=>ok(String(r.result).split(',')[1]);r.onerror=()=>nein(Error('Das Profil ist nicht lesbar.'));r.readAsDataURL(datei);});
          profil={name:datei.name,data};
          // Nur die lokale Druckseite darf das Farbmodul (WebAssembly) starten.
          druckrahmen=document.createElement('iframe');druckrahmen.hidden=true;druckrahmen.title='CMYK-Druck';
          druckrahmen.src='banden-ci-druck.html?v='+encodeURIComponent(window.SVBC_CFG?.build||'');
          renderer=await new Promise((ok,nein)=>{
            const fehlend=()=>nein(Error('Die Druckseite lässt sich nicht laden. Bitte öffne den Export erneut.'));
            const timer=setTimeout(fehlend,20000);
            druckrahmen.onload=()=>{clearTimeout(timer);try{const r=druckrahmen.contentWindow.BD_RENDER;r?ok(r):fehlend();}catch(_){fehlend();}};
            druckrahmen.onerror=()=>{clearTimeout(timer);fehlend();};
            form.appendChild(druckrahmen);
          });
          const cms=await renderer.colourEngine(profil);cms.close();
        }else{
          await Promise.all([sxScript('vendor/bandenstudio/pdf-lib.min.js',()=>window.PDFLib),sxScript('vendor/bandenstudio/opentype.min.js',()=>window.opentype)]);
        }
      }
      for(const {slot,f} of reihen){
        if(!sichtbar())return;
        const ort=slot.kennung+' · '+slot.firma;status.textContent=ort+' wird geprüft.';
        const marke=await BANDEN_CI.motiv(slot.markenschluessel,b27Quelle(slot),'ci');
        if(!marke.vektor||!marke.svg||await BANDEN_CI.hash(marke.svg)!==f.hash)throw Error('Für '+ort+' fehlt die Freigabe der aktuellen Vektorfassung. Bitte öffne die Bande.');
        const v=BD_RENDER.readSVG(marke.svg);
        const name=(slot.kennung+'-'+slot.firma).replace(/[^\p{L}\p{N}._-]+/gu,'-').slice(0,110);
        const pfad=String(slot.pos).padStart(2,'0')+'-'+name;
        archiv.file(pfad+'-CI.svg',marke.svg);
        if(modus==='svg')continue;
        const w=slot.art==='doppel'?5000:2500,h=800;
        const doc={schema:'svbsc.bande',version:1,id:slot.id,title:ort,width:w,height:h,bleed:beschnitt,safe:0,scale:1,
          background:'#ffffff',mode:modus,rgbAccepted:rgb,profile:profil,assets:{logo:{name:slot.firma,
            src:await renderer.vectorPreview(v),width:v.width,height:v.height,kind:'vector',vector:v}},
          elements:[{id:'logo',type:'image',asset:'logo',...BANDEN_CI.feld(w,h)}]};
        const pdf=await renderer.pdf(doc);
        archiv.file(pfad+'-'+w/10+'x80cm-'+modus.toUpperCase()+'.pdf',new Uint8Array(pdf.bytes));
      }
      status.textContent='ZIP wird gepackt.';
      const blob=await archiv.generateAsync({type:'blob',compression:'DEFLATE',compressionOptions:{level:5}});
      if(!sichtbar())return;
      if(signatur(reihen)!==signatur(await freigaben()))throw Error('Eine Freigabe oder Bande hat sich geändert. Starte den Export noch einmal.');
      if(!sichtbar())return;
      bcLaden2(blob,'SV-Moerlenbach-CI-Banden-'+saison+'.zip');
      status.textContent='Das ZIP mit '+(reihen.length===1?'einer freigegebenen Gestaltung':reihen.length+' freigegebenen Gestaltungen')+' wurde zum Download bereitgestellt.';
    }catch(err){if(sichtbar())status.textContent=err.message||'Der Export ist fehlgeschlagen. Bitte versuche es erneut.';}
    finally{druckrahmen?.remove();aktiv=false;felder.format.disabled=false;formatZeigen();knopf.disabled=false;}
  };
  try{const reihen=await freigaben();if(!sichtbar())return;anzahl(reihen);knopf.disabled=!reihen.length;}
  catch(err){if(sichtbar())status.textContent=err.message||'Die Freigaben sind nicht erreichbar. Bitte öffne den Export erneut.';}
}

/* =====================================================================
   Beta 0.80 · Bandencreator im Partner-Bereich (Reiter „Bandencreator“)
   Aus dem Original-Logo eines Partners entsteht eine groß gesetzte Bande.
   - Zwei Stile: Partner-CI (weiße Bande, Marine, Logo einfarbig; seit 0.99.38 ohne Vereinsabsender) und Original (Logo in seinen Farben)
   - Formate 3, 4, 5 (heutiges Maß) und 6 m mal 80 cm, dazu das Feld der Partnerwand (2 m mal 1 m)
   - Logo groß, zusätzlicher Name nur bei einem ausdrücklich bestätigten Symbol
   - Live am Platz (Bandenreihe in Perspektive, Nachbarn im Einheitslook) oder flach als Druckansicht mit Maßen
   - Export: PDF in Originalgröße mit 2 cm Beschnitt und Schnittmarken, PNG, SVG, Bild vom Platz zum Teilen
   - Bandenplan: Plätze rund um den Platz frei, reserviert oder belegt. Belegte sind gesperrt, freigeben kann nur ein Admin.
   - Banden je Partner speichern: Entwurf, zum Druck freigegeben (Admin), gedruckt (Admin)
   Gestaltung und Druckdaten: bandenlib.js (BANDE). Daten: 115_banden.sql, Logos aus 114 (trikot_logos).
   ===================================================================== */
const BC = { d:null, laedt:null, ansicht:'gestalten', sicht:'platz', raster:true, eigen:null, logoKey:null, firmaKey:'', platz:null, entwurf:null, tok:0, res:null, lay:null, nachbarn:null, nbFormat:null, vorT:0, err:null,
  spec:{ format:'300x80', stil:'ci', layout:'mitte', firma:'', name:'', claim:'', web:'', telefon:'', branche:'', kontakt:false, nameAn:false, pattern:'normal', logoFarbe:'marine', akzent:null } };
const BC_STATUS = { entwurf:'Entwurf', freigegeben:'Zum Druck freigegeben', gedruckt:'Gedruckt' };

/* ---------- Reiter einhängen (nach „Trikots“) ---------- */
{ const i = SPO_REITER.findIndex(r => r[0] === 'trikots'); if(!SPO_REITER.some(r => r[0] === 'bandencreator')) SPO_REITER.splice(i < 0 ? SPO_REITER.length : i + 1, 0, ['bandencreator', 'Bandencreator']); }
{ const _b = spoBody; spoBody = function(){ if(SPO.view === 'bandencreator'){ const B = document.getElementById('spoB'); if(B) bcRender(B); return; } return _b.apply(this, arguments); }; }

const bcE = s => svEsc(s);
async function bcRpc(fn, args){ const { data, error } = await SVB.sb.rpc(fn, args || {}); if(error) throw new Error(typeof svFehlerText === 'function' ? svFehlerText(error) : error.message); return data; }
async function bcLaden(neu){ if(BC.laedt && !neu) return BC.laedt;
  BC.laedt = bcRpc('banden_creator_laden').then(d => { BC.d = d; BC.err = null; return d; }).catch(e => { BC.err = e.message; BC.laedt = null; throw e; }); return BC.laedt; }
const bcFormatT = k => (BANDE.FORMATE[k] || {}).t || k;
function bcBereich(k){ return ((BC.d && BC.d.bereiche) || []).find(b => b.key === k) || { titel:k }; }
function bcPlatzName(p){ return p ? (p.nummer != null ? `Bande ${p.nummer}, ${bcBereich(p.bereich).titel}` : `${bcBereich(p.bereich).titel}, Platz ${p.nr}`) : ''; }
function bcPlatz(id){ return ((BC.d && BC.d.plaetze) || []).find(p => p.id === id) || null; }

/* ---------- Logos und Firmen ---------- */
function bcLogos(){ const L = ((BC.d && BC.d.logos) || []).filter(l => l.bild); return (BC.eigen ? [BC.eigen] : []).concat(L.filter(l => !BC.eigen || l.id !== BC.eigen.id)); }
const bcLogoKey = l => l.id || 'eigen';
function bcLogo(){ return BC.logoKey ? bcLogos().find(l => bcLogoKey(l) === BC.logoKey) || null : null; }
function bcFirmen(){
  const F = ((BC.d && BC.d.firmen) || []).map(f => ({ key:'s:' + f.id, firma:f.firma, web:f.web, telefon:f.telefon, branche:f.branche, sponsor:f.id, status:f.status }));
  const druck={'3dd57b60-89ca-4b6e-b072-5b8464146c28':'BB Berns&Baltz','10e1823f-fc8b-43a8-a3d2-6f022f2223b4':'BB Berns&Baltz · MÖRLENS'};
  const logos=(BC.d && BC.d.logos)||[];
  logos.filter(l=>!druck[l.id]).forEach(l => { if(!F.some(f => f.sponsor && f.sponsor === l.sponsor) && !F.some(f => f.firma.toLowerCase() === l.firma.toLowerCase())) F.push({ key:'l:' + l.id, firma:l.firma, logo:l.id }); });
  for(const l of logos){const firma=druck[l.id];if(!firma)continue;let f=F.find(f=>f.firma.toLowerCase()===firma.toLowerCase());if(!f){f={key:'l:'+l.id,firma};F.push(f);}f.bandenLogo=l.id;}
  return F; }
function bcLogoFuer(f){ const L = (BC.d && BC.d.logos) || []; return (f.bandenLogo?L.find(l=>l.bild&&l.id===f.bandenLogo):null) || L.find(l => l.bild && f.sponsor && l.sponsor === f.sponsor) || L.find(l => l.bild && l.firma.toLowerCase() === f.firma.toLowerCase()) || (f.logo ? L.find(l => l.id === f.logo && l.bild) : null) || null; }
// Eine Firmenwahl übernimmt nur deren Namen und eigenes Logo.
function bcFirmaWaehlen(key){
  const f = bcFirmen().find(x => x.key === key); BC.firmaKey = key; if(!f) return;
  const s = BC.spec; s.firma = f.firma; s.name = f.firma; s.web = ''; s.telefon = ''; s.branche = f.branche || ''; s.claim = ''; s.kontakt = false; s.nameAn = false; s.pattern = BANDE.muster({ firma:f.firma }); s.akzent = null;
  BC.sponsor = f.sponsor || null; const l = bcLogoFuer(f); BC.eigen = null; BC.logoKey = l ? l.id : null; BC.entwurf = null;
}

// Ohne gewählte Firma: neutraler Anfang. Kein Name, kein Kontakt und vor allem kein Logo einer anderen Firma bleiben stehen (0.99.24).
// Albert: „Es stand immer derselbe fremde Name mit drauf.“ Der Creator fing mit dem ersten Partner samt Logo an, und das Logo blieb,
// wenn man einen anderen Namen eintippte oder einen Platz wählte.
function bcFirmaLeer(name){ const s = BC.spec; BC.firmaKey = ''; BC.sponsor = null; BC.entwurf = null; s.firma = s.name = name || ''; s.web = ''; s.telefon = ''; s.branche = ''; s.claim = ''; s.kontakt = false; s.nameAn = false; s.pattern = BANDE.muster({ firma:s.firma }); s.akzent = null;
  BC.eigen = null; BC.logoKey = null; }
function bcEigenerName(name){
  if(BC.logoKey === 'eigen' && BC.eigen && !BC.eigen.firma){ BC.spec.firma = BC.spec.name = name; BC.spec.pattern = BANDE.muster({ firma:name }); return; }
  bcFirmaLeer(name);
}

/* ---------- Oberfläche ---------- */
async function bcRender(B){
  if(B.querySelector('.pz-bc') && BC.d){ bcAnsichtZeigen(); return; }
  B.innerHTML = `<div class="pz pz-tc pz-bc"><div class="pz-tc-kopf"><span class="pz-hand">Rund um unseren Platz</span><h2>Bandencreator</h2>
    <p>Das Logo steht groß auf der Bande. Fehlt darin der Firmenname, kannst du ihn ergänzen.</p></div>
    <div class="pz-bc-sw"><div class="pz-tc-seg" id="bcAnsicht" role="group" aria-label="Ansicht"><button type="button" id="bcBestand">Bestand</button><button type="button" data-bcansicht="gestalten">Gestalten</button><button type="button" data-bcansicht="plan">Bandenplan</button></div></div>
    <div id="bcInhalt"><div class="pz-tc-buehne pz-bc-laden"><div class="pz-tc-laden"><i></i>Bandencreator wird geladen …</div></div></div></div>`;
  B.querySelector('#bcBestand').onclick = () => spoWechsel('banden');
  B.querySelector('#bcAnsicht').onclick = e => { const b = e.target.closest('[data-bcansicht]'); if(b){ BC.ansicht = b.dataset.bcansicht; bcAnsichtZeigen(); } };
  try{ await bcLaden(); }catch(e){ const I = B.querySelector('#bcInhalt'); if(I) I.innerHTML = `<div class="pz-tc-block"><p class="pz-tc-tipp">Konnte nicht laden: ${bcE(e.message)}</p></div>`; return; }
  if(!BC.spec.firma) bcFirmaLeer();
  bcAnsichtZeigen();
}
function bcAnsichtZeigen(){
  const P = document.querySelector('.pz-bc'); if(!P) return;
  P.querySelectorAll('[data-bcansicht]').forEach(b => { const an = b.dataset.bcansicht === BC.ansicht; b.classList.toggle('on', an); b.setAttribute('aria-pressed', String(an)); });
  const I = P.querySelector('#bcInhalt'); if(BC.ansicht === 'plan') bcPlan(I); else bcGestalten(I);
}

function bcGestalten(I){
  const s = BC.spec, fa = bcFirmen();
  I.innerHTML = `<div class="pz-tc-raster"><div class="pz-tc-links">
      <div class="pz-bc-buehne" id="bcBuehne"><canvas id="bcCv" aria-label="Vorschau der Bande" role="img"></canvas></div>
      <div class="pz-tc-leiste"><div class="pz-tc-seg klein" id="bcSicht" role="group" aria-label="Darstellung"><button type="button" data-bcsicht="platz">Am Platz</button><button type="button" data-bcsicht="druck">Druckansicht</button></div>
        <button type="button" class="pz-tc-k leise pz-bc-raster" id="bcRaster" aria-pressed="${BC.raster}">Raster</button></div>
      <p class="pz-tc-info pz-bc-wo" id="bcWo" hidden></p>
      <p class="pz-tc-info" id="bcInfo" aria-live="polite"></p>
      <div class="pz-bc-vor" id="bcVor" role="group" aria-label="Vorschläge"></div></div>
    <div class="pz-tc-rechts">
      <section class="pz-tc-block" aria-labelledby="bcPh"><div class="pz-tc-bk"><h3 id="bcPh">Partner</h3></div>
        <label class="pz-tc-team"><span>Firma</span><select id="bcFirma" aria-label="Firma"><option value="">Eigene Angaben</option>${fa.map(f => `<option value="${bcE(f.key)}">${bcE(f.firma)}</option>`).join('')}</select></label>
        <div class="pz-bc-felder">
          <label class="pz-tc-firma"><span>Firmenname</span><input type="text" id="bcName" maxlength="80" autocomplete="organization"></label></div>
        <div class="pz-bc-schalter"><label class="pz-bc-cb"><input type="checkbox" id="bcNameAn"><span>Logo enthält keinen Firmennamen</span></label></div></section>
      <section class="pz-tc-block" aria-labelledby="bcLh"><div class="pz-tc-bk"><h3 id="bcLh">Logo</h3>
        <label class="pz-tc-hoch"><input type="file" id="bcDatei" accept="image/png,image/jpeg,image/webp,image/svg+xml">${SVI('plus')}<span>Logo hochladen</span></label></div>
        <div class="pz-tc-logos" id="bcLogos" role="list" aria-label="Vorhandene Partnerlogos"></div><div id="bcAnalyse"></div></section>
      <section class="pz-tc-block" aria-labelledby="bcSh"><div class="pz-tc-bk"><h3 id="bcSh">Stil und Format</h3></div>
        <div class="pz-tc-seg" id="bcStil" role="group" aria-label="Stil"><button type="button" data-bcstil="ci">Partner-CI</button><button type="button" data-bcstil="original">Original</button></div>
        <div id="bcStilFein" class="pz-bc-fein"></div>
        <div class="pz-bc-formate" id="bcFormate" role="group" aria-label="Format">${Object.entries(BANDE.FORMATE).map(([k, f]) => `<button type="button" data-bcformat="${k}"><b>${f.wand ? 'Wand' : f.k}</b><span>${f.t.replace(' m', '')}${f.std ? ' · Standard' : ''}</span></button>`).join('')}</div>
        <p class="pz-tc-tipp" id="bcFormatTipp"></p></section>
      <section class="pz-tc-block pz-tc-teilen" aria-label="Druckdaten"><button type="button" class="pz-tc-b or" id="bcPdf">${SVI('download')}<span>Druck-PDF</span></button>
        <button type="button" class="pz-tc-b" id="bcPng">${SVI('download')}<span>PNG</span></button><button type="button" class="pz-tc-b" id="bcSvg">${SVI('download')}<span>SVG</span></button>
        <button type="button" class="pz-tc-b" id="bcBild">${SVI('share')}<span>Bild vom Platz</span></button>
        <p>Das PDF hat die Originalgröße mit 2 cm Beschnitt und Schnittmarken. Das Bild vom Platz ist für WhatsApp oder Mail.</p></section>
      <section class="pz-tc-block" aria-labelledby="bcEh"><div class="pz-tc-bk"><h3 id="bcEh">Gespeicherte Banden</h3><button type="button" class="pz-tc-k" id="bcSpeichern">Speichern</button></div><div id="bcListe" class="pz-tc-liste"></div></section>
    </div></div>`;
  const $ = q => I.querySelector(q);
  $('#bcFirma').value = BC.firmaKey && fa.some(f => f.key === BC.firmaKey) ? BC.firmaKey : '';
  $('#bcFirma').onchange = e => { if(e.target.value) bcFirmaWaehlen(e.target.value); else bcFirmaLeer(); bcFormularFuellen(); bcLogosZeigen(); bcNeu(true); };
  $('#bcName').oninput = e => { const value = e.target.value; if(!BC.firmaKey && s.firma !== value){ bcEigenerName(value); bcLogosZeigen(); } else s.name = value; bcNeu(); };
  $('#bcNameAn').onchange = e => { s.nameAn = e.target.checked; bcNeu(); };
  $('#bcSicht').onclick = e => { const b = e.target.closest('[data-bcsicht]'); if(b){ BC.sicht = b.dataset.bcsicht; bcKnoepfe(); bcBuehne(); } };
  $('#bcRaster').onclick = () => { BC.raster = !BC.raster; bcKnoepfe(); bcBuehne(); };
  $('#bcStil').onclick = e => { const b = e.target.closest('[data-bcstil]'); if(b && s.stil !== b.dataset.bcstil){ s.stil = b.dataset.bcstil; bcNeu(true); } };
  $('#bcFormate').onclick = e => { const b = e.target.closest('[data-bcformat]'); if(b && s.format !== b.dataset.bcformat){ s.format = b.dataset.bcformat; bcNeu(true); } };
  $('#bcDatei').onchange = bcHochladen;
  $('#bcPdf').onclick = e => bcExport('pdf', e.currentTarget); $('#bcPng').onclick = e => bcExport('png', e.currentTarget); $('#bcSvg').onclick = e => bcExport('svg', e.currentTarget);
  $('#bcBild').onclick = e => bcExport('szene', e.currentTarget);
  $('#bcSpeichern').onclick = bcSpeichernDialog;
  bcFormularFuellen(); bcLogosZeigen(); bcListe(); bcNeu(true);
  if(window.ResizeObserver){ let w0 = 0; const ro = new ResizeObserver(es => { const w = Math.round(es[0].contentRect.width); if(Math.abs(w - w0) > 4){ w0 = w; clearTimeout(BC.rT); BC.rT = setTimeout(bcBuehne, 120); } }); ro.observe($('#bcBuehne')); }
}
function bcFormularFuellen(){
  const P = document.querySelector('.pz-bc'); if(!P) return; const s = BC.spec, v = (q, x) => { const e = P.querySelector(q); if(e && e.value !== x) e.value = x || ''; };
  v('#bcName', s.name);
  const fs = P.querySelector('#bcFirma'); if(fs) fs.value = BC.firmaKey || '';
}
function bcKnoepfe(){
  const P = document.querySelector('.pz-bc'); if(!P) return; const s = BC.spec;
  const an = (sel, attr, wert) => P.querySelectorAll(sel).forEach(b => { const o = b.dataset[attr] === wert; b.classList.toggle('on', o); b.setAttribute('aria-pressed', String(o)); });
  an('[data-bcsicht]', 'bcsicht', BC.sicht); an('[data-bcstil]', 'bcstil', s.stil); an('[data-bcformat]', 'bcformat', s.format);
  const r = P.querySelector('#bcRaster'); if(r){ r.hidden = BC.sicht !== 'druck'; r.setAttribute('aria-pressed', String(BC.raster)); r.classList.toggle('on', BC.raster); }
  const ft = P.querySelector('#bcFormatTipp'), F = BANDE.FORMATE[s.format]; if(ft) ft.textContent = F ? (F.hinweis || F.lang) + (BC.platz ? ' · für ' + bcPlatzName(bcPlatz(BC.platz)) : '') : '';
  const fein = P.querySelector('#bcStilFein');
  if(fein){ const farben = BC.res && BC.res.analyse ? BC.res.analyse.farben : [], auto = BC.lay && BC.lay.farben.akzent;
    fein.innerHTML = s.stil === 'ci'
      ? `<span class="pz-tc-leise">Logo einfarbig</span><div class="pz-tc-seg mini" role="group" aria-label="Logofarbe">${[['marine', 'Marine'], ['schwarz', 'Schwarz']].map(([k, t]) => `<button type="button" data-bclf="${k}" class="${s.logoFarbe === k ? 'on' : ''}" aria-pressed="${s.logoFarbe === k}">${t}</button>`).join('')}</div>`
      : `<span class="pz-tc-leise">Hintergrund für helle Logos</span><div class="pz-bc-farben" role="group" aria-label="Hintergrundfarbe">${[null].concat(farben.filter(f => !f.hell).map(f => f.hex).slice(0, 4)).concat(['#1d2760']).filter((x, i, a) => a.indexOf(x) === i).map(h => {
          const an2 = (s.akzent || null) === h, farbe = [h, auto, '#1d2760'].find(x => /^#[0-9a-fA-F]{6}$/.test(x || '')); return `<button type="button" data-bcak="${h || ''}" class="${an2 ? 'on' : ''}" aria-pressed="${an2}" aria-label="${h ? 'Farbe ' + h : 'Automatisch aus dem Logo'}"><i style="background:${farbe}"></i>${h ? '' : '<span>Auto</span>'}</button>`; }).join('')}</div>`;
    fein.querySelectorAll('[data-bclf]').forEach(b => b.onclick = () => { s.logoFarbe = b.dataset.bclf; bcNeu(true); });
    fein.querySelectorAll('[data-bcak]').forEach(b => b.onclick = () => { s.akzent = b.dataset.bcak || null; bcNeu(true); }); }
  const na = P.querySelector('#bcNameAn'), name = P.querySelector('#bcName'), logo = BC.res && BC.res.logo, normal = BANDE.muster(s) === 'normal';
  if(na){ na.checked = s.nameAn === true && normal; na.disabled = !logo || !normal; }
  if(name) name.disabled = !!logo && (!normal || s.nameAn !== true);
}

/* ---------- Zeichnen ---------- */
function bcInhalt(spec, hasLogo){
  const pattern = BANDE.muster(spec), nameAn = !!hasLogo && pattern === 'normal' && spec.nameAn === true;
  return { name:!hasLogo || nameAn ? BANDE.sauber(BANDE.ohneKontakt(spec.name || spec.firma)) : '', claim:hasLogo && pattern === 'moerlens' ? 'Restobar & Patisserie' : '', web:'', telefon:'', branche:spec.branche || '', kontakt:false, nameAn, pattern, logoFarbe:spec.logoFarbe, akzent:spec.akzent };
}
function bcSpecVoll(){ const l = bcLogo(); return Object.assign({}, BC.spec, bcInhalt(BC.spec, !!l), { logo:l ? l.bild : null, logoGewollt:!!l }); }
function bcNeu(sofort){ clearTimeout(BC.vorT); BC.vorT = setTimeout(bcZeichnen, sofort ? 0 : 140); }
async function bcZeichnen(){
  const tok = ++BC.tok, sp = bcSpecVoll();
  try{ const res = await BANDE.vorbereiten(sp, { basis:'partner/', wappen:'plakat/wappen/svbsc-moerlenbach.webp' }); if(tok !== BC.tok) return;
    BC.res = res; BC.lay = BANDE.layout(sp, res); }
  catch(e){ console.warn(e); return; }
  bcKnoepfe(); bcInfo(); bcBuehne(); bcVorschlaege(); bcAnalyse();
  bcNachbarnLaden();
}
function bcInfo(){
  const el = document.getElementById('bcInfo'); if(!el || !BC.lay) return; const i = BC.lay.info, s = BC.spec;
  const teile = [`<b>${bcE(bcFormatT(BC.lay.format))}</b>`, BC.lay.stil === 'ci' ? 'Partner-CI' : 'Original'];
  if(i.lesbar.name) teile.push(`großer Text lesbar aus ${i.lesbar.name} m`); else if(i.lesbar.claim) teile.push(`Unterzeile lesbar aus ${i.lesbar.claim} m`);
  else { const lg = BC.lay.ops.find(o => o.rolle === 'logo'); if(lg) teile.push(`Logo ${Math.round(lg.h / 10)} cm hoch`); }
  const kmin = Math.min(...i.kontrast.map(k => k.wert)); if(isFinite(kmin)) teile.push(`Kontrast ${String(kmin).replace('.', ',')} : 1`);
  el.innerHTML = teile.join(' · ') + (i.warn.length ? `<span class="pz-bc-warn">${i.warn.map(bcE).join(' ')}</span>` : '') + (BC.res && BC.res.logoFehler ? `<span class="pz-bc-warn">Das Logo ließ sich nicht laden.</span>` : '');
  void s;
}
function bcBuehne(){
  const cv = document.getElementById('bcCv'); if(!cv || !BC.lay) return;
  if(BC.sicht === 'druck') BANDE.flach(cv, BC.lay, BC.res, { raster:BC.raster });
  else BC.kamera = BANDE.szene(cv, { haupt:{ L:BC.lay, res:BC.res }, nachbarn:[], nachbarFest:bcNbFest() });
  cv.setAttribute('aria-label', `Vorschau: Bande ${BC.spec.firma || ''}, ${bcFormatT(BC.lay.format)}, ${BC.sicht === 'druck' ? 'Druckansicht' : 'am Platz'}`);
  try{ bcWo(); }catch(e){}
}
// Nachbarbanden (0.99.24): Ist ein Platz gewählt, stehen links und rechts die wirklichen Nachbarn aus dem Bandenplan (svm101.js).
// Ohne Platz stehen neutrale Banden daneben. Vorher standen hier immer die ersten fünf Logos der Liste, also immer dieselben fremden Namen.
function bcNbFest(){ return BC.platz && BC.nachbarFest && String(BC.nbFormat || '').split('|')[2] === BC.platz ? BC.nachbarFest : null; }
// Unter der Bühne: wo die Bande hängt
function bcWo(){ const el = document.getElementById('bcWo'); if(!el) return; const p = BC.platz ? bcPlatz(BC.platz) : null;
  el.hidden = BC.sicht !== 'platz';
  el.innerHTML = p ? `<b>Bande ${bpNr(p)}</b> ${bcE(bpWo(p))} <button type="button" class="pz-bc-wok" id="bcWoPlan">Im Plan zeigen</button>`
    : 'Noch kein Platz gewählt, darum stehen neutrale Banden daneben. <button type="button" class="pz-bc-wok" id="bcWoPlan">Platz im Plan wählen</button>';
  const b = el.querySelector('#bcWoPlan'); if(b) b.onclick = () => { BP.sel = BC.platz || null; BC.ansicht = 'plan'; bcAnsichtZeigen(); }; }
async function bcNachbarnLaden(){
  const plan = BC.platz ? bpNachbarPlan(BC.platz) : null;
  const k = BC.lay.format + '|' + BC.lay.stil + '|' + (BC.platz || '') + '|' + JSON.stringify(plan || 0).length; if(BC.nbFormat === k || BC.nbLaedt === k) return; BC.nbLaedt = k;
  const fest = {};
  if(plan) for(const i of Object.keys(plan)){ const q = plan[i]; if(!q || !q.spec){ fest[i] = q; continue; }
    const sp = Object.assign({ format:BC.lay.format }, q.spec);
    try{ const res = await BANDE.vorbereiten(sp, { basis:'partner/', wappen:'plakat/wappen/svbsc-moerlenbach.webp' }); fest[i] = { L:BANDE.layout(sp, res), res }; }catch(e){ fest[i] = { frei:false, nr:q.nr }; } }
  if(BC.nbLaedt !== k) return; BC.nachbarn = []; BC.nachbarFest = plan ? fest : null; BC.nbFormat = k; BC.nbLaedt = null; if(BC.sicht === 'platz') bcBuehne(); bcWo();
}
// Vorschläge: dieselben Angaben in drei Layouts, ein Tipp übernimmt
function bcVorschlaege(){
  const H = document.getElementById('bcVor'); if(!H || !BC.res) return; const sp = bcSpecVoll();
  H.innerHTML = BANDE.LAYOUTS.map(([k, t]) => `<button type="button" class="pz-bc-vk${BC.spec.layout === k ? ' on' : ''}" data-bclayout="${k}" aria-pressed="${BC.spec.layout === k}"><canvas aria-hidden="true"></canvas><span>${t}</span></button>`).join('');
  H.querySelectorAll('[data-bclayout]').forEach(b => { const L = BANDE.layout(Object.assign({}, sp, { layout:b.dataset.bclayout }), BC.res), c = b.querySelector('canvas'), w = 236;
    const ppm = w * Math.min(2, devicePixelRatio || 1) / L.W; const im = BANDE.bild(L, BC.res, ppm, false); c.width = im.width; c.height = im.height; c.getContext('2d').drawImage(im, 0, 0);
    c.style.aspectRatio = L.W + ' / ' + L.H;
    b.onclick = () => { BC.spec.layout = b.dataset.bclayout; bcNeu(true); }; });
}

/* ---------- Logo ---------- */
function bcLogosZeigen(){
  const H = document.getElementById('bcLogos'); if(!H) return; const an = BC.logoKey;
  H.innerHTML = `<div role="listitem"><button type="button" class="pz-tc-lg ohne${!an ? ' an' : ''}" data-bclogo="" aria-pressed="${!an}" aria-label="Ohne Logo, nur Schriftzug"><b>Aa</b><span>Ohne Logo</span></button></div>` +
    bcLogos().map(l => { const o = an === bcLogoKey(l); return `<div role="listitem"><button type="button" class="pz-tc-lg${o ? ' an' : ''}" data-bclogo="${bcE(bcLogoKey(l))}" aria-pressed="${o}" title="${bcE(l.firma)}" aria-label="Logo ${bcE(l.firma)}${o ? ', gewählt' : ''}"><img src="${bcE(l.bild)}" alt="" draggable="false"><span>${bcE(l.firma)}</span></button></div>`; }).join('');
  H.querySelectorAll('[data-bclogo]').forEach(b => b.onclick = () => { BC.logoKey = b.dataset.bclogo || null; BC.spec.akzent = null; BC.spec.nameAn = false; bcLogosZeigen(); bcNeu(true); });
  bcLogos().forEach(l => LOGO.aufbereiten(l.bild).then(a => { if(!a.hell) return; const b = H.querySelector(`[data-bclogo="${CSS.escape(bcLogoKey(l))}"]`); if(b) b.classList.add('dunkel'); }).catch(() => {}));
}
function bcAnalyse(){
  const A = document.getElementById('bcAnalyse'); if(!A) return; const l = bcLogo(), a = BC.res && BC.res.analyse;
  if(!l){ A.innerHTML = '<p class="pz-tc-tipp">Ohne Logo steht der Name groß als Schriftzug. Lade das Logo hoch, sobald es da ist.</p>'; return; }
  A.innerHTML = a ? `<div class="pz-tc-farben"><span class="pz-tc-leise">Originalfarben</span>${a.farben.map(f => `<i style="background:${f.hex}" title="${f.hex}, ${f.anteil} Prozent" aria-label="${f.hex}, ${f.anteil} Prozent"></i>`).join('')}<span class="pz-tc-leise">${a.hintergrundEntfernt ? 'Hintergrund entfernt' : 'freigestellt'}</span></div>` : '';
}
async function bcHochladen(e){
  const f = e.target.files && e.target.files[0]; e.target.value = ''; if(!f) return;
  try{ const roh = await LOGO.dateiLesen(f); const a = await LOGO.aufbereiten(roh);
    let bild = await LOGO.alsDataUrl(roh, 'original', 900); if(bild.length > 690000) bild = await LOGO.alsDataUrl(roh, 'original', 600);
    BC.eigen = { id:null, firma:BC.spec.firma || BC.spec.name || '', bild, farben:a.farben, neu:true }; BC.logoKey = 'eigen'; BC.spec.akzent = null; BC.spec.nameAn = false;
    bcLogosZeigen(); bcNeu(true); kToast(a.hintergrundEntfernt ? 'Hintergrund entfernt. Die Bande ist schon fertig.' : 'Logo ist drauf.');
  }catch(x){ kToast(x.message || 'Das Logo lässt sich nicht lesen.'); }
}
async function bcLogoSichern(firma,l=bcLogo(),sponsor=BC.sponsor||null,aktuell=()=>true){
  if(!l) return null; if(l.id) return l.id;
  const r = await bcRpc('trikot_logo_speichern', { p:{ firma:firma || l.firma, bild:l.bild, farben:(l.farben || []).slice(0, 8), sponsor } });
  l.id = r.id; l.neu = false; if(aktuell()){BC.d.logos = (BC.d.logos || []).filter(x => x.id !== r.id).concat([r]); BC.eigen = null; BC.logoKey = r.id;} return r.id;
}

/* ---------- Druckdaten ---------- */
function bcLaden2(blob, name){ const a = document.createElement('a'); a.href = URL.createObjectURL(blob); a.download = name; document.body.appendChild(a); a.click(); setTimeout(() => { URL.revokeObjectURL(a.href); a.remove(); }, 2000); }
async function bcJsPdf(){ if(window.jspdf && window.jspdf.jsPDF) return; await new Promise((ok, nein) => { const s = document.createElement('script'); s.src = 'vendor/jspdf.umd.min.js'; s.onload = ok; s.onerror = () => nein(new Error('Das PDF-Werkzeug lässt sich nicht laden.')); document.head.appendChild(s); }); }
async function bcExport(art, btn){
  if(!BC.lay) return; const sp = bcSpecVoll();
  await paEinmal(btn, async () => {
    try{
      if(art === 'pdf'){ await bcJsPdf(); const r = await BANDE.pdf(BC.lay, BC.res, sp); BC.letzterExport = { art, name:r.name, seite:r.seite, groesse:r.blob.size }; bcLaden2(r.blob, r.name); kToast('PDF ist fertig: ' + bcFormatT(BC.lay.format) + ' mit Beschnitt.'); }
      else if(art === 'png'){ const r = await BANDE.png(BC.lay, BC.res, sp); BC.letzterExport = { art, name:r.name, breite:r.breite, hoehe:r.hoehe }; bcLaden2(r.blob, r.name); kToast(`PNG ist fertig (${r.breite} mal ${r.hoehe} Pixel).`); }
      else if(art === 'svg'){ const r = await BANDE.svg(BC.lay, BC.res, sp); BC.letzterExport = { art, name:r.name, groesse:r.blob.size }; bcLaden2(r.blob, r.name); kToast('SVG ist fertig.'); }
      else {
        const c = document.createElement('canvas'); c.style.cssText = 'position:fixed;left:-9999px;top:0;width:1200px;height:750px'; document.body.appendChild(c);
        BANDE.szene(c, { haupt:{ L:BC.lay, res:BC.res }, nachbarn:[], nachbarFest:bcNbFest() });
        const blob = await new Promise(ok => c.toBlob(ok, 'image/jpeg', .9)); c.remove(); const name = 'bande-am-platz.jpg';
        if(navigator.canShare){ const f = new File([blob], name, { type:'image/jpeg' }); if(navigator.canShare({ files:[f] })){ try{ await navigator.share({ files:[f], title:'So sieht deine Bande bei uns aus' }); return; }catch(e){ if(e && e.name === 'AbortError') return; } } }
        BC.letzterExport = { art, name }; bcLaden2(blob, name); kToast('Bild gespeichert.'); }
    }catch(e){ console.warn(e); kToast(e.message || 'Das hat nicht geklappt.'); }
  }, 'Einen Moment …');
}

/* ---------- Speichern und Liste ---------- */
function bcVorschauUrl(layout=BC.lay,res=BC.res){ try{ const ppm = 640 / layout.W, c = BANDE.bild(layout, res, ppm, false); return c.toDataURL('image/jpeg', .85); }catch(e){ return null; } }
function bcSpeichernDialog(){
  if(!BC.lay) return; const s = BC.spec, firma = s.firma || s.name || '';
  const pl = ((BC.d && BC.d.plaetze) || []).filter(p => p.status === 'frei' || (p.status === 'reserviert' && firma && p.firma && p.firma.toLowerCase() === firma.toLowerCase()) || p.id === BC.platz);
  const e0 = BC.entwurf && (BC.d.entwuerfe || []).find(x => x.id === BC.entwurf), gesperrt = e0 && e0.status !== 'entwurf' && !(BC.d && BC.d.admin);
  const M = svModal(`<div class="mhead"><div><h2 style="margin:0">${e0 ? 'Bande speichern' : 'Als Entwurf speichern'}</h2><div class="msub">${bcE(bcFormatT(s.format))} · ${s.stil === 'ci' ? 'Partner-CI' : 'Original'}</div></div></div>
    <label class="pz-tc-dlgf"><span>Für welche Firma?</span><input type="text" id="bcDlgFirma" maxlength="120" value="${bcE(firma)}" autocomplete="organization"></label>
    <label class="pz-tc-dlgf"><span>Platz am Sportplatz (freiwillig)</span><select id="bcDlgPlatz" class="pz-bc-dlgsel"><option value="">Noch offen</option>${pl.map(p => `<option value="${p.id}"${(BC.platz || (e0 && e0.platz)) === p.id ? ' selected' : ''}>${bcE(bcPlatzName(p))} · ${bcE(bcFormatT(p.format))}${p.status === 'reserviert' ? ' · reserviert' : ''}</option>`).join('')}</select></label>
    <p class="note">${gesperrt ? 'Diese Bande ist schon zum Druck freigegeben. Ändern kann sie nur ein Admin. Speichern legt einen neuen Entwurf an.' : 'Ein freier Platz wird damit für die Firma reserviert. Zum Druck freigeben kann nur ein Admin.'}</p>
    <div class="pz-tc-dlgk"><button type="button" class="btn" id="bcDlgOk">Speichern</button><button type="button" class="btn ghost" id="bcDlgNein">Abbrechen</button></div>`);
  const inp = M.querySelector('#bcDlgFirma'); setTimeout(() => { try{ inp.focus(); }catch(e){} }, 60);
  M.querySelector('#bcDlgNein').onclick = () => closeOverlay();
  M.querySelector('#bcDlgOk').onclick = () => paEinmal(M.querySelector('#bcDlgOk'), async () => {
    const fa = inp.value.trim(); if(!fa){ kToast('Bitte die Firma eintragen.'); inp.focus(); return; }
    try{ if(fa.trim().toLowerCase() !== (s.firma || '').trim().toLowerCase()) bcEigenerName(fa);
      const snapshot=bcSpecVoll(),vorEntwurf=BC.entwurf,entwurf=gesperrt?null:vorEntwurf,sponsor=BC.sponsor||null,firmaKey=BC.firmaKey,tok=BC.tok,platz=M.querySelector('#bcDlgPlatz').value||null;
      const aktuell=()=>BC.spec.firma===snapshot.firma&&BC.firmaKey===firmaKey&&(BC.sponsor||null)===sponsor&&BC.entwurf===vorEntwurf&&BC.tok===tok;
      const logo=await bcLogoSichern(fa,bcLogo(),sponsor,aktuell);
      const res=await BANDE.vorbereiten(snapshot,{basis:'partner/',wappen:'plakat/wappen/svbsc-moerlenbach.webp'}),layout=BANDE.layout(snapshot,res),inhalt=bcInhalt(snapshot,!!logo);
      const r = await bcRpc('banden_entwurf_speichern', { p:{ id:entwurf, firma:fa, sponsor, logo, format:snapshot.format, stil:snapshot.stil, layout:snapshot.layout, inhalt, vorschau:bcVorschauUrl(layout,res), platz } });
      if(!aktuell()){kToast('Bandenentwurf für '+fa+' gespeichert.');return;}
      BC.entwurf = r.id; BC.platz = r.platz || null; ++BC.tok; BC.lay=layout; BC.res=res; closeOverlay(); await bcLaden(true); bcListe(); bcLogosZeigen(); bcFormularFuellen(); bcBuehne(); bcInfo();
      kToast(platz ? `Gespeichert. ${bcPlatzName(bcPlatz(platz))} ist für ${fa} reserviert.` : 'Gespeichert.');
    }catch(e){ kToast(e.message); } }, 'Speichert …');
}
function bcListe(){
  const H = document.getElementById('bcListe'); if(!H || !BC.d) return; const admin = !!BC.d.admin, E = BC.d.entwuerfe || [];
  if(!E.length){ H.innerHTML = '<p class="pz-tc-tipp">Noch keine Bande gespeichert. Gestalte eine und tipp auf Speichern.</p>'; return; }
  H.innerHTML = E.map(e => { const p = e.platz ? bcPlatz(e.platz) : null, an = BC.entwurf === e.id;
    let akt = `<button type="button" class="pz-tc-k leise" data-bcoeffnen="${e.id}">Öffnen</button>`;
    if(admin){ if(e.status === 'entwurf') akt += `<button type="button" class="pz-tc-k" data-bcst="${e.id}:freigegeben">Zum Druck freigeben</button>`;
      else if(e.status === 'freigegeben') akt += `<button type="button" class="pz-tc-k" data-bcst="${e.id}:gedruckt">Gedruckt</button><button type="button" class="pz-tc-k leise" data-bcst="${e.id}:entwurf">Zurück auf Entwurf</button>`;
      else akt += `<button type="button" class="pz-tc-k leise" data-bcst="${e.id}:entwurf">Zurück auf Entwurf</button>`; }
    if(e.status === 'entwurf' || admin) akt += `<button type="button" class="pz-tc-k leise" data-bcweg="${e.id}">Löschen</button>`;
    return `<div class="pz-tc-pl pz-bc-e${an ? ' an' : ''}" data-bce="${e.id}"><div class="pz-bc-ek">${e.vorschau ? `<img src="${bcE(e.vorschau)}" alt="">` : ''}<div><b>${bcE(e.firma)}</b>
      <span class="st ${e.status === 'entwurf' ? 'vor' : e.status === 'gedruckt' ? 'belegt' : 'frei'}">${e.status === 'entwurf' ? '' : SVI('lock')}${BC_STATUS[e.status]}</span>
      <span class="pz-bc-meta">${bcE(bcFormatT(e.format))} · ${e.stil === 'ci' ? 'Partner-CI' : 'Original'}${p ? ' · ' + bcE(bcPlatzName(p)) : ''}</span></div></div><div class="pz-tc-akt">${akt}</div></div>`; }).join('');
  H.querySelectorAll('[data-bcoeffnen]').forEach(b => b.onclick = () => bcOeffnen(b.dataset.bcoeffnen));
  H.querySelectorAll('[data-bcst]').forEach(b => b.onclick = () => { const [id, st] = b.dataset.bcst.split(':'); bcStatusDialog(id, st); });
  H.querySelectorAll('[data-bcweg]').forEach(b => b.onclick = () => bcLoeschenDialog(b.dataset.bcweg));
}
function bcOeffnen(id){
  const e = (BC.d.entwuerfe || []).find(x => x.id === id); if(!e) return; const i = e.inhalt || {};
  Object.assign(BC.spec, { format:e.format, stil:e.stil, layout:e.layout, firma:e.firma, name:i.name || e.firma, claim:'', web:'', telefon:'', branche:i.branche || '', kontakt:false, nameAn:i.nameAn === true, pattern:BANDE.muster({ firma:e.firma, pattern:i.pattern }), logoFarbe:['marine', 'schwarz'].includes(i.logoFarbe) ? i.logoFarbe : 'marine', akzent:/^#[0-9a-fA-F]{6}$/.test(i.akzent || '') ? i.akzent : null });
  BC.eigen = null; BC.logoKey = e.logo || null; BC.entwurf = e.id; BC.platz = e.platz || null; BC.sponsor = e.sponsor || null;
  const f = bcFirmen().find(x => (e.sponsor && x.sponsor === e.sponsor) || x.firma.toLowerCase() === e.firma.toLowerCase()); BC.firmaKey = f ? f.key : '';
  bcFormularFuellen(); bcLogosZeigen(); bcListe(); bcNeu(true);
  const st = document.getElementById('bcBuehne'); if(st) st.scrollIntoView({ block:'start', behavior:matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth' });
  kToast(`Bande von ${e.firma} ist geöffnet.`);
}
function bcStatusDialog(id, st){
  const e = (BC.d.entwuerfe || []).find(x => x.id === id); if(!e) return;
  const t = { freigegeben:['Zum Druck freigeben?', `Die Bande von ${e.firma} ist danach gesperrt und geht so in den Druck. Ändern kann sie nur ein Admin.`, 'Freigeben'],
    gedruckt:['Als gedruckt markieren?', `Die Bande von ${e.firma} ist gedruckt und hängt bald am Platz.`, 'Gedruckt'], entwurf:['Zurück auf Entwurf?', 'Danach lässt sich die Bande wieder ändern.', 'Zurück auf Entwurf'] }[st];
  const M = svModal(`<div class="mhead"><div><h2 style="margin:0">${t[0]}</h2><div class="msub">${bcE(e.firma)} · ${bcE(bcFormatT(e.format))}</div></div></div><p class="note">${bcE(t[1])}</p>
    <div class="pz-tc-dlgk"><button type="button" class="btn" id="bcDlgOk">${t[2]}</button><button type="button" class="btn ghost" id="bcDlgNein">Abbrechen</button></div>`);
  M.querySelector('#bcDlgNein').onclick = () => closeOverlay();
  M.querySelector('#bcDlgOk').onclick = () => paEinmal(M.querySelector('#bcDlgOk'), async () => {
    try{ await bcRpc('banden_entwurf_status', { p_id:id, p_status:st }); closeOverlay(); await bcLaden(true); bcListe(); kToast(st === 'freigegeben' ? 'Zum Druck freigegeben.' : st === 'gedruckt' ? 'Als gedruckt markiert.' : 'Wieder ein Entwurf.'); }catch(x){ kToast(x.message); } }, 'Einen Moment …');
