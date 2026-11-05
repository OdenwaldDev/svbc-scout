/* =====================================================================
   Beta 0.80 · Trikot-Creator: die Bühne (3D und Foto)
   Beta 0.81: Heim- und Auswärtstrikot in 3D direkt aus den Produktfotos (Atlas vorn/hinten, Tiefenkarte), damit es aussieht wie das echte
   Squadra 25. Nur noch Brust und Ärmel als Plätze, oben in der Mitte fest das Gemeindewappen (drei Glocken, weiß). Der Anzug bleibt gebaut.
   Ohne Hose und Stutzen (keine Partnerplätze dort): die Bühne zeigt nur Trikot bzw. Jacke.
   Gemeinsam für den Partner-Bereich der App (svm78.js) und die Partner-Präsentation (partner.js).
   three.js (r149, UMD) liegt unter vendor/three.min.js und wird erst geladen, wenn die Bühne aufgeht.
   Die Kleidung ist prozedural gebaut, ohne Puppe, wie ein Produktbild: Trikot mit Ärmeln und Kragen, Hose, Stutzen;
   Anzug: Jacke mit langen Ärmeln, Stehkragen und Reißverschluss, lange Hose. Falten über eine Normal-Map, Stoff mit Sheen.
   Alles Gedruckte (Wappen, Rückenschrift, Nummer, Partnerlogos) wird je Teil auf eine Canvas-Textur gemalt.
   Keine Marken des Ausrüsters: nur ein schlichter heller Streifen über der Schulter.
   Foto-Ansicht: die echten Produktfotos (Heim und Auswärts, vorn und hinten), Logos mit der Schattierung des Stoffs.
   Braucht LOGO (logolib.js) für Freistellen und Varianten.
   ===================================================================== */
window.TRIKOT3D = (function(){
  'use strict';
  const PI = Math.PI, TAU = PI * 2;
  const GRENZE = .44;   // 0.82: so weit neigt sich das Fotomodell beim Ziehen (rad), dann dreht es sich ganz um
  const kl = (x, a, b) => Math.max(a, Math.min(b, x)), lerp = (a, b, t) => a + (b - a) * t;
  const sst = (a, b, x) => { const t = kl((x - a) / (b - a), 0, 1); return t * t * (3 - 2 * t); };
  const ruhig = () => { try{ return matchMedia('(prefers-reduced-motion: reduce)').matches; }catch(e){ return false; } };

  /* ---------- Plätze ---------- */
  // teil: torso (x, y in Metern, vorn/hinten) · aermel (seite +1 = links des Trägers, l entlang des Ärmels) · bein (seite, l entlang des Beins)
  const PLAETZE = {
    // Nur drei Plätze für Partner: Brust, Ärmel links, Ärmel rechts (Beta 0.81). Oben in der Mitte sitzt fest das Gemeindewappen.
    trikot: {
      brust:{ n:'Brust', k:'Brust', teil:'torso', vorn:true, x:0, y:.462, w:.23, h:.13, haupt:true, fokus:'oben' },
      aermel_l:{ n:'Ärmel links', k:'Ärmel L', teil:'aermel', seite:1, l:.38, w:.08, h:.06, fokus:'oben' },
      aermel_r:{ n:'Ärmel rechts', k:'Ärmel R', teil:'aermel', seite:-1, l:.38, w:.08, h:.06, fokus:'oben' }
    },
    anzug: {
      jacke_brust:{ n:'Jacke Brust', k:'Brust', teil:'torso', vorn:true, x:-.105, y:.53, w:.125, h:.07, haupt:true, fokus:'oben' },
      aermel_l:{ n:'Ärmel links', k:'Ärmel L', teil:'aermel', seite:1, l:.3, w:.075, h:.055, fokus:'oben' },
      aermel_r:{ n:'Ärmel rechts', k:'Ärmel R', teil:'aermel', seite:-1, l:.3, w:.075, h:.055, fokus:'oben' }
    }
  };
  const FOTO = {   // Plätze auf den Produktfotos (Pixel im Foto, Drehung in Grad), nur Trikot; gemeinde: Gemeindewappen oben in der Mitte [x, y, b, h]
    heim:{ vorn:{ bild:'foto-heim-vorn.webp', w:397, h:505, brust:[204,226,148,74,0], aermel_l:[349,158,46,34,24], aermel_r:[57,160,46,34,-22], wappen:[268,150,44], gemeinde:[204,146,35,36] },
           hinten:{ bild:'foto-heim-hinten.webp', w:437, h:539, jungs:[222,102,74], name:[222,128,128], nummer:[222,204,124] } },
    auswaerts:{ vorn:{ bild:'foto-ausw-vorn.webp', w:447, h:555, brust:[222,232,150,76,0], aermel_l:[387,170,46,34,24], aermel_r:[62,170,46,34,-22], wappen:[288,153,44], gemeinde:[222,149,36,37] },
           hinten:{ bild:'foto-ausw-hinten.webp', w:453, h:525, jungs:[224,78,76], name:[226,105,130], nummer:[228,180,124] } }
  };
  // 3D aus den Produktfotos: Atlas (links vorn, rechts hinten, 1024 × 1216 je Seite, aus den hochgerechneten Fotos in tools/trikot_hd),
  // Maske in voller Größe mit weicher Kante und Tiefenkarte (160 × 192: R vorn, G hinten, B innen).
  // Das Foto hinten ist über Landmarken auf den Umriss von vorn gelegt (erzeugt mit tools/trikot_fotomodell.py). Positionen in Atlaspixeln.
  const FOTO3D = {
    A:[1024, 1216], N:[160, 192], hoehe:.76, dmax:.14, saum:-.03,
    heim:{ atlas:'foto3d-heim.webp', tiefe:'foto3d-heim-tiefe.png', maske:'foto3d-heim-maske.png', breite:0.5935,
      brust:[523,515,425,213,0], aermel_l:[939,334,132,98,24], aermel_r:[101,340,132,98,-22], wappen:[707,313,126], gemeinde:[523,302,101,103],
      jungs:[1528,122,188], name:[1529,182,328], nummer:[1529,356,308] },
    auswaerts:{ atlas:'foto3d-auswaerts.webp', tiefe:'foto3d-auswaerts-tiefe.png', maske:'foto3d-auswaerts-maske.png', breite:0.6048,
      brust:[521,493,392,199,0], aermel_l:[952,340,120,89,24], aermel_r:[102,340,120,89,-22], wappen:[693,298,115], gemeinde:[521,288,94,97],
      jungs:[1511,127,218], name:[1514,190,393], nummer:[1513,364,344] }
  };
  function platzListe(art){ return Object.keys(PLAETZE[art === 'anzug' ? 'anzug' : 'trikot']); }
  function platzInfo(art, k){ return PLAETZE[art === 'anzug' ? 'anzug' : 'trikot'][k] || null; }

  /* ---------- Laden ---------- */
  let threeP = null;
  function laden(pfad){
    if(window.THREE) return Promise.resolve(window.THREE);
    if(threeP) return threeP;
    threeP = new Promise((ok, nein) => { const s = document.createElement('script'); s.src = pfad || 'vendor/three.min.js'; s.async = true;
      s.onload = () => window.THREE ? ok(window.THREE) : nein(new Error('3D lässt sich nicht laden'));
      s.onerror = () => { threeP = null; nein(new Error('3D lässt sich nicht laden')); }; document.head.appendChild(s); });
    return threeP;
  }
  function kannWebGL(){ try{ const c = document.createElement('canvas'); return !!(window.WebGLRenderingContext && (c.getContext('webgl2') || c.getContext('webgl'))); }catch(e){ return false; } }
  const bilder = new Map();
  function bild(src){ if(bilder.has(src)) return bilder.get(src);
    const p = new Promise((ok, nein) => { const i = new Image(); i.decoding = 'async'; i.onload = () => ok(i); i.onerror = () => nein(new Error('Bild fehlt: ' + src)); i.src = src; });
    bilder.set(src, p); p.catch(() => bilder.delete(src)); return p; }

  /* ---------- Farben ---------- */
  function rgb(h){ h = String(h || '#888888').replace('#', ''); return [0, 2, 4].map(i => parseInt(h.slice(i, i + 2), 16) || 0); }
  function hex(r, g, b){ return '#' + [r, g, b].map(v => kl(Math.round(v), 0, 255).toString(16).padStart(2, '0')).join(''); }
  function mischen(a, b, t){ const A = rgb(a), B = rgb(b); return hex(lerp(A[0], B[0], t), lerp(A[1], B[1], t), lerp(A[2], B[2], t)); }
  function hellig(h){ const [r, g, b] = rgb(h); return (r * .299 + g * .587 + b * .114) / 255; }

  /* ---------- Schnitte ---------- */
  const SCHNITT = {
    trikot:{ H:.74, Wb:.243, Wc:.252, ya:.47, Xs:.222, nr:.082, ndf:.064, ndb:.014, nd:.07, D:.118, kragen:'rund' },
    anzug:{ H:.72, Wb:.25, Wc:.268, ya:.46, Xs:.2, nr:.078, ndf:.03, ndb:.008, nd:.074, D:.136, kragen:'steh' }
  };
  // Rumpf: Spalten rund um den Körper (phi, vorn Mitte = 0), Zeilen vom Saum zur Schulter (t)
  function rumpf(S){
    const Ymin = -.012, Ymax = S.H + .01;
    const W = y => y < S.ya ? lerp(S.Wb, S.Wc, sst(0, S.ya, y)) : lerp(S.Wc, S.Xs, Math.pow(kl((y - S.ya) / (S.H - .06 - S.ya), 0, 1), 1.6));
    const oben = (x, vorn) => { const a = Math.abs(x);
      if(a < S.nr){ const q = Math.sqrt(1 - (a / S.nr) ** 2); return S.H - .012 - (vorn ? S.ndf : S.ndb) * q; }
      return S.H - .012 - .34 * (a - S.nr); };
    const saum = s => .012 * s * s;
    function P(phi, t){
      const s = Math.sin(phi), c = Math.cos(phi), vorn = c >= 0;
      const xt = s * S.Xs, yt = oben(xt, vorn), y0 = saum(s), y = lerp(y0, yt, t);
      const x = s * lerp(W(y), S.Xs, sst(.82, 1, t));
      const zt = Math.abs(xt) < S.nr ? (vorn ? 1 : -1) * S.nd * Math.sqrt(1 - (xt / S.nr) ** 2) - .008 : -.004;
      const Dz = S.D * (.95 + .07 * sst(.15, .55, y / S.H)) * (1 - .04 * sst(.0, .08, -y + .04));
      const Rr = Math.min(.105, (yt - y0) * .4), d = y - (yt - Rr);
      let z = c * Dz; if(d > 0){ const k = Math.sqrt(Math.max(0, 1 - (d / Rr) ** 2)); z = zt + (z - zt) * k; }
      return [x, y, z];
    }
    // Textur: u = Winkel, v = Höhe
    const uv = (phi, y) => [(phi + PI / 2) / TAU, (y - Ymin) / (Ymax - Ymin)];
    // t zu einer Höhe y suchen (für Punkte auf dem Stoff)
    function tFuer(phi, y){ let a = 0, b = 1; for(let i = 0; i < 30; i++){ const m = (a + b) / 2; if(P(phi, m)[1] < y) a = m; else b = m; } return (a + b) / 2; }
    function PUV(u, v){ const phi = u * TAU - PI / 2, y = Ymin + v * (Ymax - Ymin); return P(phi, tFuer(phi, y)); }
    function uvFuer(x, y, vorn){ let phi = Math.asin(kl(x / W(y), -1, 1)); if(!vorn) phi = PI - phi; return uv(phi, y); }
    function geo(N, M){
      const pos = [], uvs = [], idx = [];
      for(let i = 0; i <= M; i++){ const t = i / M; for(let j = 0; j <= N; j++){ const phi = -PI / 2 + TAU * j / N; const p = P(phi, t); pos.push(...p); uvs.push(...uv(phi, p[1])); } }
      for(let i = 0; i < M; i++) for(let j = 0; j < N; j++){ const a = i * (N + 1) + j, b = a + 1, c = a + N + 1, d = c + 1; idx.push(a, b, d, a, d, c); }
      return { pos, uvs, idx, N, M };
    }
    // Halsausschnitt: obere Punkte der Spalten im Halsbereich (vorn und hinten), als geschlossener Ring
    function hals(n){ const L = [];
      for(let i = 0; i < n; i++){ const a = TAU * i / n, s = Math.sin(a), c = Math.cos(a), x = s * S.nr * .999, vorn = c >= 0;
        L.push([x, oben(x, vorn), (vorn ? 1 : -1) * S.nd * Math.abs(c) - .008]); } return L; }
    return { P, PUV, uvFuer, geo, hals, W, Ymin, Ymax, S };
  }

  // Schlauch entlang einer Bahn: ring(l) => {c, a, b, ra, rb, ex}; Punkt = c + a*ra*cos + b*rb*sin (ex: Überellipse innen)
  function schlauch(ring){
    function P(u, v){ const R = ring(v), th = u * TAU, co = Math.cos(th), si = Math.sin(th);
      let ca = co, sb = si; if(R.ex && R.ex !== 2){ const e = 2 / R.ex; const innen = (R.innen || 0) * co > 0;
        if(innen){ ca = Math.sign(co) * Math.pow(Math.abs(co), e); sb = Math.sign(si) * Math.pow(Math.abs(si), e); } }
      return [0, 1, 2].map(i => R.c[i] + R.a[i] * R.ra * ca + R.b[i] * R.rb * sb); }
    function geo(N, M){ const pos = [], uvs = [], idx = [];
      for(let i = 0; i <= M; i++){ const v = i / M; for(let j = 0; j <= N; j++){ const u = j / N; pos.push(...P(u, v)); uvs.push(u, 1 - v); } }
      for(let i = 0; i < M; i++) for(let j = 0; j < N; j++){ const a = i * (N + 1) + j, b = a + 1, c = a + N + 1, d = c + 1; idx.push(a, b, d, a, d, c); }
      return { pos, uvs, idx, N, M }; }
    return { P, PUV:(u, v) => P(u, 1 - v), geo };
  }
  const norm = v => { const l = Math.hypot(v[0], v[1], v[2]) || 1; return [v[0] / l, v[1] / l, v[2] / l]; };
  const kreuz = (a, b) => [a[1] * b[2] - a[2] * b[1], a[2] * b[0] - a[0] * b[2], a[0] * b[1] - a[1] * b[0]];
  const pkt = (a, b) => a[0] * b[0] + a[1] * b[1] + a[2] * b[2];
  const add = (a, b, k = 1) => [a[0] + b[0] * k, a[1] + b[1] * k, a[2] + b[2] * k];
  const vlerp = (a, b, t) => [lerp(a[0], b[0], t), lerp(a[1], b[1], t), lerp(a[2], b[2], t)];

  // Ärmel: Wurzel liegt senkrecht im Rumpf (wie die Armkugel), am Ende quer zur Achse
  function aermel(sg, art){
    const kurz = art !== 'anzug';
    const pfad = kurz ? [[sg * .168, .594, 0], [sg * .262, .5, .003], [sg * .35, .39, .008]]
                      : [[sg * .182, .556, 0], [sg * .285, .41, .012], [sg * .33, .2, .045], [sg * .345, -.015, .07]];
    const kurve = l => { const n = pfad.length - 1, f = kl(l, 0, 1) * n, i = Math.min(n - 1, Math.floor(f)), t = f - i;
      const p0 = pfad[Math.max(0, i - 1)], p1 = pfad[i], p2 = pfad[i + 1], p3 = pfad[Math.min(n, i + 2)];
      return [0, 1, 2].map(k => .5 * ((2 * p1[k]) + (-p0[k] + p2[k]) * t + (2 * p0[k] - 5 * p1[k] + 4 * p2[k] - p3[k]) * t * t + (-p0[k] + 3 * p1[k] - 3 * p2[k] + p3[k]) * t * t * t)); };
    return schlauch(l => {
      const c = kurve(l), tg = norm(add(kurve(Math.min(1, l + .01)), kurve(Math.max(0, l - .01)), -1));
      const quer = norm([-tg[1] * sg * sg, tg[0], 0]);   // senkrecht zur Achse, in der Bildebene
      const q2 = pkt(quer, [0, 1, 0]) < 0 ? [-quer[0], -quer[1], 0] : quer;
      const a = norm(vlerp([0, 1, 0], q2, sst(0, kurz ? .45 : .3, l)));
      const b = [0, 0, -sg];
      let ra, rb;
      if(kurz){ ra = lerp(.1, .083, sst(0, 1, l)); rb = lerp(.08, .066, sst(0, 1, l)); }
      else { ra = lerp(.094, .066, sst(0, .85, l)) * (l > .93 ? lerp(1, .86, sst(.93, 1, l)) : 1); rb = lerp(.085, .058, sst(0, .85, l)) * (l > .93 ? lerp(1, .9, sst(.93, 1, l)) : 1); }
      return { c, a, b, ra, rb };
    });
  }
  // Bein der Hose: oben eine Hälfte des Bunds (innen flach), unten rund und etwas auseinander
  function bein(sg, art){
    const lang = art === 'anzug', y0 = lang ? .03 : .03, y1 = lang ? -1.0 : -.455;
    return schlauch(l => {
      const y = lerp(y0, y1, l), knie = lang ? sst(.25, 1, l) : sst(.3, 1, l);
      const ra = lang ? lerp(.112, .072, sst(.12, 1, l)) * (l > .95 ? .95 : 1) : lerp(.112, .123, sst(0, 1, l));
      const rb = (lang ? lerp(.122, .07, sst(.12, 1, l)) : lerp(.12, .118, sst(.2, 1, l)) + .008 * Math.sin(l * PI)) * lerp(.84, 1, sst(0, .14, l));
      const cx = lang ? lerp(.112, .118, knie) : lerp(.112, .138, knie);
      return { c:[sg * cx, y, lang ? .012 * sst(.4, 1, l) : 0], a:[sg, 0, 0], b:[0, 0, -sg], ra, rb, ex:lerp(5, 2, sst(lang ? .2 : .28, lang ? .42 : .55, l)), innen:-1 };
    });
  }
  function stutzen(sg){
    const pfad = l => { if(l < .74){ const t = l / .74; return [sg * .118, lerp(-.545, -.9, t), .0]; }
      const t = (l - .74) / .26, w = t * PI / 2; return [sg * .118, -.9 - Math.sin(w) * .05, (1 - Math.cos(w)) * .02 + t * .14]; };
    return schlauch(l => { const c = pfad(l), tg = norm(add(pfad(Math.min(1, l + .01)), pfad(Math.max(0, l - .01)), -1));
      const b = [sg, 0, 0], a = norm(kreuz(b, tg));
      const r = l < .74 ? lerp(.056, .044, sst(0, .74, l)) : lerp(.046, .04, (l - .74) / .26) * (l > .97 ? Math.sqrt(Math.max(0, 1 - ((l - .97) / .03) ** 2)) * .9 + .1 : 1);
      return { c, a:[a[0], a[1], a[2]], b:[0, 0, 0].map((_, i) => b[i] * sg), ra:l < .74 ? r : r * .82, rb:r };
    });
  }

  /* ---------- Normal-Map: weiche Falten ---------- */
  function rauschen(seed){ let s = seed >>> 0; return () => { s = (s * 1664525 + 1013904223) >>> 0; return s / 4294967296; }; }
  function faltenKarte(w, h, art, teil){
    const c = document.createElement('canvas'); c.width = w; c.height = h; const x = c.getContext('2d');
    const H = new Float32Array(w * h), R = rauschen(teil.length * 977 + w);
    const grat = (u0, v0, u1, v1, br, amp) => {   // Falte als weicher Grat zwischen zwei Punkten (in Pixeln)
      const dx = u1 - u0, dy = v1 - v0, L2 = dx * dx + dy * dy || 1;
      const x0 = Math.max(0, Math.floor(Math.min(u0, u1) - br * 3)), x1 = Math.min(w - 1, Math.ceil(Math.max(u0, u1) + br * 3));
      const y0 = Math.max(0, Math.floor(Math.min(v0, v1) - br * 3)), y1 = Math.min(h - 1, Math.ceil(Math.max(v0, v1) + br * 3));
      for(let yy = y0; yy <= y1; yy++) for(let xx = x0; xx <= x1; xx++){
        const t = kl(((xx - u0) * dx + (yy - v0) * dy) / L2, 0, 1), px = u0 + dx * t - xx, py = v0 + dy * t - yy, d2 = (px * px + py * py) / (br * br);
        if(d2 < 9) H[yy * w + xx] += amp * Math.exp(-d2) * Math.sin(t * PI); } };
    if(teil === 'torso'){
      const kurz = art !== 'anzug';
      for(const mitte of [.25, .75]){ const sgn = mitte === .25 ? 1 : -1;
        for(const s of [-1, 1]){   // unter den Armen schräg zur Mitte
          for(let k = 0; k < 3; k++){ const u0 = (mitte + s * (.205 - k * .018)) * w, v0 = (.33 + k * .07 + R() * .03) * h;
            grat(u0, v0, (mitte + s * (.12 - k * .02)) * w, v0 + (.12 + R() * .05) * h, w * .006, (kurz ? .9 : 1.2) * (1 - k * .2)); } }
        for(let k = 0; k < 4; k++){ const v = (.78 + k * .045 + R() * .02) * h; grat((mitte - .09 - R() * .05) * w, v, (mitte + .09 + R() * .05) * w, v + (R() - .5) * .03 * h, w * .007, .5 * sgn * (k % 2 ? 1 : -.7)); }
        grat((mitte - .17) * w, .5 * h, (mitte - .2) * w, .95 * h, w * .008, .6); grat((mitte + .17) * w, .5 * h, (mitte + .2) * w, .95 * h, w * .008, .6);
      }
      if(!kurz){ for(let i = 0; i < w; i++) for(let j = Math.floor(h * .955); j < h; j++) H[j * w + i] += .35 * Math.sin(i / w * TAU * 90); }
    } else if(teil === 'aermel'){
      for(let k = 0; k < (art === 'anzug' ? 7 : 3); k++){ const v = (.2 + k * (art === 'anzug' ? .1 : .2) + R() * .05) * h; grat(.1 * w, v, .6 * w, v + (R() - .3) * .12 * h, w * .02, .9 * (k % 2 ? 1 : -.8)); }
      if(art === 'anzug'){ for(let i = 0; i < w; i++) for(let j = Math.floor(h * .9); j < h; j++) H[j * w + i] += .6 * Math.sin(i / w * TAU * 40); }
    } else if(teil === 'bein'){
      for(let k = 0; k < 5; k++){ const u = (.15 + k * .17 + R() * .05) * w; grat(u, .1 * h, u + (R() - .5) * .08 * w, .95 * h, w * .012, .5 * (k % 2 ? 1 : -1)); }
      if(art === 'anzug') for(let i = 0; i < w; i++) for(let j = Math.floor(h * .965); j < h; j++) H[j * w + i] += .5 * Math.sin(i / w * TAU * 60);
    }
    // feines Gewebe
    const fein = rauschen(31 + w), feinA = art === 'anzug' ? .018 : .035; for(let k = 0; k < w * h; k++) H[k] += (fein() - .5) * feinA;
    const d = x.createImageData(w, h), p = d.data, st = 3.2;
    for(let j = 0; j < h; j++) for(let i = 0; i < w; i++){
      const l = H[j * w + (i - 1 + w) % w], r = H[j * w + (i + 1) % w], o = H[Math.max(0, j - 1) * w + i], u = H[Math.min(h - 1, j + 1) * w + i];
      let nx = (l - r) * st, ny = (u - o) * st, nz = 1; const L = Math.hypot(nx, ny, nz); nx /= L; ny /= L; nz /= L;
      const k = (j * w + i) * 4; p[k] = (nx * .5 + .5) * 255; p[k + 1] = (ny * .5 + .5) * 255; p[k + 2] = (nz * .5 + .5) * 255; p[k + 3] = 255; }
    x.putImageData(d, 0, 0); return c;
  }

  /* ---------- Logos als Leinwand ---------- */
  const schriftzuege = new Map();
  function schriftzug(firma, farbe, schrift){
    const k = firma + '|' + farbe + '|' + schrift; if(schriftzuege.has(k)) return schriftzuege.get(k);
    const c = document.createElement('canvas'), x = c.getContext('2d'), t = String(firma || '').toUpperCase();
    x.font = `800 200px ${schrift}, 'Arial Narrow', sans-serif`; const w = Math.ceil(x.measureText(t).width) + 20;
    c.width = Math.max(40, w); c.height = 230; x.font = `800 200px ${schrift}, 'Arial Narrow', sans-serif`; x.fillStyle = farbe; x.textBaseline = 'alphabetic'; x.fillText(t, 10, 185);
    schriftzuege.set(k, c); return c;
  }
  async function logoLeinwand(b, schrift){
    const fb = b.variante === 'schwarz' ? '#141414' : '#ffffff';
    if(!b.bild) return schriftzug(b.firma, b.variante === 'original' ? '#ffffff' : fb, schrift);
    try{ return await LOGO.variante(b.bild, b.variante === 'original' ? 'original' : b.variante === 'schwarz' ? 'schwarz' : 'weiss'); }
    catch(e){ return schriftzug(b.firma, fb, schrift); }
  }

  /* ---------- Stil der Bühne ---------- */
  function stil(){ if(document.getElementById('t3css')) return;
    const s = document.createElement('style'); s.id = 't3css';
    s.textContent = `.t3{position:relative;width:100%;height:100%;overflow:hidden;touch-action:pan-y;-webkit-user-select:none;user-select:none;-webkit-tap-highlight-color:transparent;}
.t3 canvas{position:absolute;inset:0;width:100%;height:100%;display:block;outline:none;}
.t3 canvas[hidden]{display:none;}.t3 canvas.t3-gl{cursor:grab;}.t3.zieht canvas.t3-gl{cursor:grabbing;}
.t3-m{position:absolute;inset:0;pointer-events:none;}
.t3-p{position:absolute;left:0;top:0;width:44px;height:44px;margin:-22px 0 0 -22px;padding:0;border:0;background:none;display:grid;place-items:center;pointer-events:auto;cursor:pointer;transition:opacity .2s;font:inherit;}
.t3-p i{display:block;width:22px;height:22px;border-radius:50%;border:2px dashed rgba(255,255,255,.92);background:rgba(20,28,60,.28);box-shadow:0 1px 6px rgba(0,0,0,.25);transition:transform .18s,background .18s,border-color .18s;}
.t3-p i:before{content:'+';display:block;color:#fff;font:700 15px/18px system-ui,sans-serif;text-align:center;}
.t3-p.belegt i{border:0;width:18px;height:18px;background:rgba(15,20,40,.55);}
.t3-p.belegt i:before{content:'';width:8px;height:6px;margin:7px auto 0;border-radius:1px;background:#fff;box-shadow:0 -3px 0 -1px transparent;}
.t3-p.belegt i:after{content:'';display:block;width:5px;height:5px;margin:-11px auto 0;border:1.6px solid #fff;border-bottom:0;border-radius:4px 4px 0 0;}
.t3-p.vorschau i{border-style:solid;border-color:#fff;background:rgba(232,116,31,.85);}
.t3-p.vorschau i:before{content:'';}
.t3-p.an i{transform:scale(1.35);background:rgba(232,116,31,.9);border-style:solid;}
.t3-p.nein i{transform:scale(1.2);background:rgba(176,40,26,.85);}
.t3-p.weg{opacity:0;pointer-events:none;}
.t3-p:focus-visible{outline:2px solid #fff;outline-offset:-4px;border-radius:50%;}
.t3-p span{position:absolute;top:36px;left:50%;transform:translateX(-50%);white-space:nowrap;font:600 12px/1.2 system-ui,sans-serif;color:#fff;background:rgba(15,20,40,.72);padding:3px 7px;border-radius:6px;opacity:0;transition:opacity .15s;pointer-events:none;}
.t3-p.an span,.t3-p:hover span,.t3-p:focus-visible span{opacity:1;}
.t3.ohne-marken .t3-p{display:none;}
@media (prefers-reduced-motion:reduce){.t3-p,.t3-p i{transition:none;}}`;
    document.head.appendChild(s); }

  /* =====================================================================
     Bühne
     opt: { three:'vendor/three.min.js', kit:'kit/', schrift:'BarlowC', marken:true, rahmen:true, onPlatz(k), onDreh(w), name(k) }
     ===================================================================== */
  function buehne(el, opt){
    opt = Object.assign({ three:'vendor/three.min.js', kit:'kit/', schrift:'BarlowC', marken:true, rahmen:true }, opt || {});
    stil();
    const wurzel = document.createElement('div'); wurzel.className = 't3' + (opt.marken ? '' : ' ohne-marken');
    const cvF = document.createElement('canvas'); cvF.className = 't3-foto'; cvF.hidden = true; cvF.setAttribute('aria-hidden', 'true');
    const mk = document.createElement('div'); mk.className = 't3-m';
    wurzel.appendChild(cvF); wurzel.appendChild(mk); el.appendChild(wurzel);
    const Z = { art:'heim', daten:null, winkel:0, ziel:0, vw:0, modus:kannWebGL() ? '3d' : 'foto', fokus:'oben', fokusZiel:'oben', fk:1, an:null, nein:null, zieht:false, lebt:true, gl:false, fehler:null, sicht:'vorn' };
    let T, renderer, szene, kamera, gruppe, teile = {}, mats = [], texte = {}, raf = 0, rot = null;
    const marken = {};

    /* ----- 3D aufbauen ----- */
    async function start3d(){
      T = await laden(opt.three);
      const cv = document.createElement('canvas'); cv.className = 't3-gl'; cv.tabIndex = 0; cv.setAttribute('role', 'img');
      cv.setAttribute('aria-label', 'Trikot in 3D. Ziehen oder Pfeiltasten zum Drehen.');
      wurzel.insertBefore(cv, cvF);
      renderer = new T.WebGLRenderer({ canvas:cv, antialias:true, alpha:true, preserveDrawingBuffer:false, powerPreference:'low-power' });
      renderer.outputEncoding = T.sRGBEncoding; renderer.toneMapping = T.NoToneMapping;
      renderer.setClearColor(0x000000, 0);
      szene = new T.Scene(); kamera = new T.PerspectiveCamera(22, 1, .1, 30);
      // Studio-Licht als Umgebung (weiche Reflexe), dazu drei Lichter
      const pm = new T.PMREMGenerator(renderer), st = new T.Scene();
      st.add(new T.Mesh(new T.BoxGeometry(10, 10, 10), new T.MeshBasicMaterial({ color:0x8a8e98, side:T.BackSide })));
      const box = (w, h, x, y, z, k) => { const m = new T.Mesh(new T.PlaneGeometry(w, h), new T.MeshBasicMaterial({ color:new T.Color(k, k, k), side:T.DoubleSide })); m.position.set(x, y, z); m.lookAt(0, 0, 0); st.add(m); };
      box(4, 3, -3, 3, 3.5, 3.2); box(3, 2, 4, 1, 2, 1.6); box(6, 1.2, 0, 4.9, 0, 2.2); box(3, 3, 0, 1.5, -4.9, 1.4);
      szene.environment = pm.fromScene(st, .04).texture; pm.dispose();
      szene.add(new T.HemisphereLight(0xffffff, 0x5c6068, .28));
      const key = new T.DirectionalLight(0xffffff, .82); key.position.set(-2.2, 3.2, 3.4); szene.add(key);
      const fill = new T.DirectionalLight(0xfff6ee, .16); fill.position.set(3, .6, 2.2); szene.add(fill);
      const kante = new T.DirectionalLight(0xffffff, .4); kante.position.set(.5, 2.4, -3.5); szene.add(kante);
      gruppe = new T.Group(); szene.add(gruppe);
      // Bodenschatten (weich, dreht nicht mit)
      const sc = document.createElement('canvas'); sc.width = sc.height = 256; const sx = sc.getContext('2d'), gr = sx.createRadialGradient(128, 128, 0, 128, 128, 128);
      gr.addColorStop(0, 'rgba(0,0,0,.42)'); gr.addColorStop(.45, 'rgba(0,0,0,.2)'); gr.addColorStop(1, 'rgba(0,0,0,0)'); sx.fillStyle = gr; sx.fillRect(0, 0, 256, 256);
      const sT = new T.CanvasTexture(sc); Z.schatten = new T.Mesh(new T.PlaneGeometry(1.15, .5), new T.MeshBasicMaterial({ map:sT, transparent:true, depthWrite:false }));
      Z.schatten.rotation.x = -PI / 2; szene.add(Z.schatten);
      // Fotomodell für Heim und Auswärts vorladen (Atlas und Tiefe); ohne bleibt das gebaute Trikot
      Z.fm = {}; await Promise.all(['heim', 'auswaerts'].map(async satz => { try{ const M = FOTO3D[satz];
        const [atlas, tiefe, maske] = await Promise.all([bild(opt.kit + M.atlas), bild(opt.kit + M.tiefe), bild(opt.kit + M.maske)]);
        const c = leinwand(FOTO3D.N[0], FOTO3D.N[1]), x = c.getContext('2d', { willReadFrequently:true }); x.drawImage(tiefe, 0, 0);
        // Stofffarbe aus dem Foto (Mitte vorn), damit Hose und Stutzen zum Trikot passen
        const p = leinwand(40, 40), px = p.getContext('2d', { willReadFrequently:true }); px.drawImage(atlas, 400, 672, 224, 256, 0, 0, 40, 40);
        const q = px.getImageData(0, 0, 40, 40).data; let r = 0, g = 0, b = 0, n = 0; for(let i = 0; i < q.length; i += 4){ if(q[i + 3] < 250) continue; r += q[i]; g += q[i + 1]; b += q[i + 2]; n++; }
        Z.fm[satz] = { atlas, maske, t:x.getImageData(0, 0, c.width, c.height).data, farbe:n ? mischen(hex(r / n, g / n, b / n), '#000000', .2) : null }; }catch(e){} }));
      Z.gl = true; bedienung(cv);
      new ResizeObserver(groesse).observe(wurzel); groesse();
    }
    function groesse(){ const r = wurzel.getBoundingClientRect(); if(!r.width || !r.height) return;
      if(renderer){ renderer.setPixelRatio(Math.min(2, window.devicePixelRatio || 1)); renderer.setSize(r.width, r.height, false); kamera.aspect = r.width / r.height; kamera.updateProjectionMatrix(); }
      if(Z.modus === 'foto') foto(); else malen(); }

    /* ----- Kleidung bauen ----- */
    function mesh(g, mat, innen){
      const geo = new T.BufferGeometry(); geo.setAttribute('position', new T.Float32BufferAttribute(g.pos, 3)); geo.setAttribute('uv', new T.Float32BufferAttribute(g.uvs, 2)); geo.setIndex(g.idx);
      geo.computeVertexNormals();
      // Naht an u=0/1 glätten
      const n = geo.attributes.normal, N = g.N;
      for(let i = 0; i <= g.M; i++){ const a = i * (N + 1), b = a + N; const x = (n.getX(a) + n.getX(b)) / 2, y = (n.getY(a) + n.getY(b)) / 2, z = (n.getZ(a) + n.getZ(b)) / 2; n.setXYZ(a, x, y, z); n.setXYZ(b, x, y, z); }
      // Richtung prüfen: Normalen nach außen
      const m = Math.floor(g.M / 2) * (N + 1) + Math.floor(N / 4), cx = g.pos[m * 3], mz = g.pos[m * 3 + 2];
      const cIdx = Math.floor(g.M / 2) * (N + 1) + Math.floor(3 * N / 4);
      const aussen = [g.pos[m * 3] - g.pos[cIdx * 3], g.pos[m * 3 + 1] - g.pos[cIdx * 3 + 1], mz - g.pos[cIdx * 3 + 2]];
      if(pkt([n.getX(m), n.getY(m), n.getZ(m)], aussen) < 0){ const ix = g.idx; for(let k = 0; k < ix.length; k += 3){ const t = ix[k + 1]; ix[k + 1] = ix[k + 2]; ix[k + 2] = t; } geo.setIndex(ix); geo.computeVertexNormals();
        for(let i = 0; i <= g.M; i++){ const a = i * (N + 1), b = a + N; const x = (n.getX(a) + n.getX(b)) / 2, y = (n.getY(a) + n.getY(b)) / 2, z = (n.getZ(a) + n.getZ(b)) / 2; n.setXYZ(a, x, y, z); n.setXYZ(b, x, y, z); } }
      void cx;
      const o = new T.Group(); o.add(new T.Mesh(geo, mat)); if(innen) o.add(new T.Mesh(geo, innen)); return o;
    }
    function stoff(canvas, normal, farbe){
      const map = new T.CanvasTexture(canvas); map.encoding = T.sRGBEncoding; map.anisotropy = Math.min(8, renderer.capabilities.getMaxAnisotropy()); map.wrapS = T.RepeatWrapping;
      const nm = new T.CanvasTexture(normal); nm.wrapS = T.RepeatWrapping;
      const sh = new T.Color(mischen(farbe, '#ffffff', .3));
      const m = new T.MeshPhysicalMaterial({ map, normalMap:nm, normalScale:new T.Vector2(1, 1), roughness:.8, metalness:0, sheen:.45, sheenRoughness:.6, sheenColor:sh, envMapIntensity:.32 });
      mats.push(m); return m; }
    function innenStoff(farbe){ const m = new T.MeshStandardMaterial({ color:new T.Color(mischen(farbe, '#000000', .7)), roughness:1, envMapIntensity:.1, side:T.BackSide }); mats.push(m); return m; }
    function leinwand(w, h){ const c = document.createElement('canvas'); c.width = w; c.height = h; return c; }
    const normalCache = {};
    function normale(w, h, art, teil){ const k = [w, h, art, teil].join('|'); if(!normalCache[k]) normalCache[k] = faltenKarte(w, h, art, teil); return normalCache[k]; }

    function bauen(){
      while(gruppe.children.length){ const c = gruppe.children.pop(); c.traverse(o => { if(o.geometry) o.geometry.dispose(); }); }
      mats.forEach(m => { if(m.map) m.map.dispose(); if(m.normalMap) m.normalMap.dispose(); if(m.maske) m.maske.dispose(); m.dispose(); }); mats = []; teile = {}; texte = {};
      const art = Z.art === 'anzug' ? 'anzug' : 'trikot', d = Z.daten || {}, grund = d.grund || '#2f5fd0';
      const S = SCHNITT[art], R = rumpf(S), satz = Z.art === 'auswaerts' ? 'auswaerts' : 'heim', FM = art === 'trikot' && Z.fm && Z.fm[satz];
      Z.foto3d = FM ? satz : null;
      const gU = FM && FM.farbe || grund;   // Hose und Stutzen: beim Fotomodell in der Farbe des Fotos
      const neu = (name, form, W, H, nN, nM, teil) => { const f = teil === 'bein' || teil === 'stutzen' ? gU : grund, cv = leinwand(W, H), mat = stoff(cv, normale(W >> 2, H >> 2, art, teil), f);
        const g = form.geo(nN, nM), o = mesh(g, mat, innenStoff(f)); gruppe.add(o); teile[name] = { form, cv, mat, teil, o }; return teile[name]; };
      if(FM) fotoKoerper(satz, FM);
      else { neu('torso', R, 2048, 1024, 128, 84, 'torso');
        neu('aermel_l', aermel(1, art), 1024, 512, 48, 36, 'aermel'); neu('aermel_r', aermel(-1, art), 1024, 512, 48, 36, 'aermel'); }
      // 0.81: keine Hose und keine Stutzen mehr, dort gibt es keine Partnerplätze. Nur Trikot und Jacke, damit der Blick auf den Logos bleibt.
      // Kragen
      const hals = R.hals(96), kurve = new T.CatmullRomCurve3(hals.map(p => new T.Vector3(p[0], p[1], p[2])), true);
      const kf = mischen(grund, '#000000', .16);
      if(FM){ /* Kragen steckt im Foto */ }
      else if(S.kragen === 'rund'){
        const km = new T.MeshPhysicalMaterial({ color:new T.Color(kf), roughness:.88, sheen:.35, sheenColor:new T.Color(mischen(grund, '#ffffff', .2)), envMapIntensity:.25 }); mats.push(km);
        const k = new T.Mesh(new T.TubeGeometry(kurve, 160, .0115, 12, true), km); k.scale.set(1, 1, 1); gruppe.add(k);
      } else {
        const pts = kurve.getSpacedPoints(160), pos = [], idx = [], uvs = [];
        pts.forEach((p, i) => { const r = Math.hypot(p.x, p.z + .008) || 1, ox = p.x / r * .012, oz = (p.z + .008) / r * .012;
          pos.push(p.x, p.y - .006, p.z, p.x + ox * .4, p.y + .062, p.z + oz * .4); uvs.push(i / 160, 0, i / 160, 1); });
        for(let i = 0; i < pts.length - 1; i++){ const a = i * 2; idx.push(a, a + 2, a + 1, a + 1, a + 2, a + 3); }
        const g = new T.BufferGeometry(); g.setAttribute('position', new T.Float32BufferAttribute(pos, 3)); g.setAttribute('uv', new T.Float32BufferAttribute(uvs, 2)); g.setIndex(idx); g.computeVertexNormals();
        const km = new T.MeshPhysicalMaterial({ color:new T.Color(mischen(grund, '#000000', .22)), roughness:.86, sheen:.4, sheenColor:new T.Color(mischen(grund, '#ffffff', .25)), side:T.DoubleSide, envMapIntensity:.2 }); mats.push(km);
        gruppe.add(new T.Mesh(g, km));
        // Reißverschluss am Kragen und Zipper
        const zm = new T.MeshStandardMaterial({ color:0x1b1d22, roughness:.4, metalness:.6 }); mats.push(zm);
        const vorn = kurve.getPointAt(0); const zip = new T.Mesh(new T.BoxGeometry(.008, .062, .004), zm); zip.position.set(vorn.x, vorn.y + .025, vorn.z + .006); gruppe.add(zip);
        const zg = new T.Mesh(new T.BoxGeometry(.012, .028, .004), zm); zg.position.set(vorn.x, vorn.y + .045, vorn.z + .011); zg.rotation.x = -.25; gruppe.add(zg);
      }
      Z.form = R; Z.unten = FM ? FOTO3D.saum : -.012; Z.oben = FM ? FOTO3D.saum + FOTO3D.hoehe : S.H + (S.kragen === 'steh' ? .06 : .0);
      Z.schatten.position.y = Z.unten - .06;
      ankerBerechnen();
    }

    /* ----- Trikot aus den Produktfotos: aufgeblasener Umriss, vorn und hinten das echte Foto ----- */
    function fotoTiefe(FM, gx, gy, hinten){   // gx, gy in Netzkoordinaten (0..N-1), bilinear
      const [NW, NH] = FOTO3D.N, x0 = kl(Math.floor(gx), 0, NW - 1), y0 = kl(Math.floor(gy), 0, NH - 1), x1 = Math.min(NW - 1, x0 + 1), y1 = Math.min(NH - 1, y0 + 1), fx = kl(gx - x0, 0, 1), fy = kl(gy - y0, 0, 1);
      const v = (x, y) => FM.t[(y * NW + x) * 4 + (hinten ? 1 : 0)] / 255 * FOTO3D.dmax;
      return lerp(lerp(v(x0, y0), v(x1, y0), fx), lerp(v(x0, y1), v(x1, y1), fx), fy); }
    function fotoPunkt(satz, ax, ay){   // Atlaspixel -> Punkt und Normale am Körper (vorn: ax < A, hinten: ax >= A)
      const M = FOTO3D[satz], FM = Z.fm[satz], [AW, AH] = FOTO3D.A, [NW, NH] = FOTO3D.N, hinten = ax >= AW, fx = hinten ? AW - (ax - AW) : ax;
      const x = (fx / AW - .5) * M.breite, y = FOTO3D.saum + (1 - ay / AH) * FOTO3D.hoehe, gx = fx / AW * (NW - 1), gy = ay / AH * (NH - 1);
      const z = fotoTiefe(FM, gx, gy, hinten) * (hinten ? -1 : 1), e = 1.5, mx = M.breite / (NW - 1), my = FOTO3D.hoehe / (NH - 1);
      const dzx = (fotoTiefe(FM, gx + e, gy, hinten) - fotoTiefe(FM, gx - e, gy, hinten)) / (2 * e * mx), dzy = (fotoTiefe(FM, gx, gy - e, hinten) - fotoTiefe(FM, gx, gy + e, hinten)) / (2 * e * my);
      const n = hinten ? norm([-dzx, -dzy, -1]) : norm([-dzx, -dzy, 1]);
      return { P:[x, y, z], n, r:hinten ? [-1, 0, 0] : [1, 0, 0], o:[0, 1, 0] }; }
    function fotoKoerper(satz, FM){
      const M = FOTO3D[satz], [NW, NH] = FOTO3D.N, t = FM.t, innen = new Uint8Array(NW * NH), dabei = new Uint8Array(NW * NH);
      for(let k = 0; k < NW * NH; k++) innen[k] = t[k * 4 + 2] > 127 ? 1 : 0;
      // Netz: Umriss plus zwei Zellen Rand (Tiefe 0), damit vorn und hinten sich am Rand treffen; die Maske im Shader schneidet sauber
      for(let j = 0; j < NH; j++) for(let i = 0; i < NW; i++){ let d = 0; for(let b = -2; b <= 2 && !d; b++) for(let a = -2; a <= 2; a++){ const x = i + a, y = j + b; if(x >= 0 && y >= 0 && x < NW && y < NH && innen[y * NW + x]){ d = 1; break; } } dabei[j * NW + i] = d; }
      const pos = [], uv = [], idx = [], nr = new Int32Array(NW * NH * 2).fill(-1);
      for(const hinten of [0, 1]) for(let j = 0; j < NH; j++) for(let i = 0; i < NW; i++){ const k = j * NW + i; if(!dabei[k]) continue;
        const z = innen[k] ? t[k * 4 + hinten] / 255 * FOTO3D.dmax : 0;   // außerhalb 0; der Saum liegt in der letzten Zeile und bleibt offen
        nr[hinten * NW * NH + k] = pos.length / 3;
        pos.push((i / (NW - 1) - .5) * M.breite, FOTO3D.saum + (1 - j / (NH - 1)) * FOTO3D.hoehe, hinten ? -z : z);
        uv.push(hinten ? .5 + (1 - i / (NW - 1)) * .5 : i / (NW - 1) * .5, 1 - j / (NH - 1)); }
      for(const hinten of [0, 1]) for(let j = 0; j < NH - 1; j++) for(let i = 0; i < NW - 1; i++){
        const o = hinten * NW * NH, a = nr[o + j * NW + i], b = nr[o + j * NW + i + 1], c = nr[o + (j + 1) * NW + i], d = nr[o + (j + 1) * NW + i + 1];
        if(a < 0 || b < 0 || c < 0 || d < 0) continue;
        if(hinten) idx.push(a, b, c, b, d, c); else idx.push(a, c, b, b, c, d); }
      const geo = new T.BufferGeometry(); geo.setAttribute('position', new T.Float32BufferAttribute(pos, 3)); geo.setAttribute('uv', new T.Float32BufferAttribute(uv, 2)); geo.setIndex(idx); geo.computeVertexNormals();
      const cv = leinwand(FOTO3D.A[0] * 2, FOTO3D.A[1]), map = new T.CanvasTexture(cv);   // 0.82: Atlas in voller Größe (2048 × 1216), nicht mehr hochskaliert
      map.anisotropy = Math.min(8, renderer.capabilities.getMaxAnisotropy()); map.generateMipmaps = true; map.minFilter = T.LinearMipmapLinearFilter;
      // Licht passend zum Foto: das Foto bringt sein Licht mit, dazu nur ein sanftes Abdunkeln, wenn sich der Stoff wegdreht
      const mk = new T.Texture(FM.maske); mk.needsUpdate = true; mk.minFilter = T.LinearMipmapLinearFilter; mk.anisotropy = map.anisotropy;
      // 0.82: weiche Kante aus der Maske (Alpha statt Abschneiden, kein Treppenrand), nur Vorderseiten (kein dunkler Saum von innen),
      // Licht im Blickraum: von vorn sieht man das Foto unverändert, beim Drehen wandert ein sanfter Glanz über den Stoff.
      const mat = new T.ShaderMaterial({ uniforms:{ map:{ value:map }, maske:{ value:mk } }, transparent:true, depthWrite:true, side:T.FrontSide,
        vertexShader:'varying vec2 vUv; varying vec3 vN; varying vec3 vV; void main(){ vUv = uv; vN = normalize(normalMatrix * normal); vec4 mv = modelViewMatrix * vec4(position, 1.0); vV = normalize(-mv.xyz); gl_Position = projectionMatrix * mv; }',
        fragmentShader:'uniform sampler2D map; uniform sampler2D maske; varying vec2 vUv; varying vec3 vN; varying vec3 vV; void main(){ float a = smoothstep(.34, .66, texture2D(maske, vUv).r); if(a < .01) discard; vec3 n = normalize(vN), v = normalize(vV); vec3 t = texture2D(map, vUv).rgb; vec3 L = normalize(vec3(-.35, .45, .82)); float l = max(dot(n, L), 0.0), l0 = .82; float r = pow(1.0 - max(dot(n, v), 0.0), 2.5); vec3 h = normalize(L + v); float g = pow(max(dot(n, h), 0.0), 28.0); vec3 c = t * clamp(1.0 + .32 * (l - l0), .7, 1.08) * (1.0 - .22 * r) + vec3(.05) * g * (1.0 - r); gl_FragColor = vec4(c, a); }' });
      mats.push(mat); mat.map = map; mat.maske = mk;
      const o = new T.Mesh(geo, mat); gruppe.add(o); teile.foto = { cv, mat, teil:'foto', o, satz };
    }
    async function fotoMalen(fest, logos){   // Atlas mit Aufdrucken und Partnerlogos, schattiert wie im Foto
      const t = teile.foto, M = FOTO3D[t.satz], FM = Z.fm[t.satz], d = Z.daten, c = t.cv, x = c.getContext('2d'), s = c.width / (FOTO3D.A[0] * 2);
      // Grundbild (Foto, Aufdrucke, Logos, schattiert) nur neu rechnen, wenn sich Belegung oder Nummer ändern; Hervorheben malt nur die Rahmen neu
      const schluessel = JSON.stringify([t.satz, d.nummer || '10', Object.keys(logos).sort(), Object.entries(d.belegung || {}).map(([k, b]) => [k, b && b.status, b && b.firma, b && b.variante, b && b.groesse, b && !!b.vorschau, b && b.bild && String(b.bild).length])]);
      x.setTransform(1, 0, 0, 1, 0, 0);
      if(t.grund && t.grundKey === schluessel){ x.clearRect(0, 0, c.width, c.height); x.drawImage(t.grund, 0, 0); return fotoRahmen(x, M, d, s, t); }
      x.clearRect(0, 0, c.width, c.height); x.imageSmoothingQuality = 'high'; x.drawImage(FM.atlas, 0, 0, c.width, c.height);
      const A = leinwand(c.width, c.height), a = A.getContext('2d', { willReadFrequently:true });
      const setze = (q, b, wq, hq, gr) => { if(!q || !b) return; const iw = b.width || b.naturalWidth, ih = b.height || b.naturalHeight; if(!iw || !ih) return;
        const k = Math.min(wq * s / iw, hq * s / ih) * (gr || 1); a.save(); a.translate(q[0] * s, q[1] * s); a.rotate((q[4] || 0) * PI / 180); a.drawImage(b, -iw * k / 2, -ih * k / 2, iw * k, ih * k); a.restore(); };
      setze(M.wappen, fest.wappen, M.wappen[2], M.wappen[2] * .6); setze(M.gemeinde, fest.gemeinde, M.gemeinde[2], M.gemeinde[3]);
      setze(M.jungs, fest.jungs, M.jungs[2], M.jungs[2] * .2); setze(M.name, textBild('SV/BSC MÖRLENBACH', 120, '#ffffff', 700), M.name[2], M.name[2] * .2);
      setze(M.nummer, textBild(String(d.nummer || '10'), 400, '#ffffff', 700), M.nummer[2], M.nummer[2] * 1.05);
      Object.entries(logos).forEach(([k, L]) => { const q = M[k]; if(!q) return; const b = d.belegung[k]; setze(q, L, q[2], q[3], kl(+b.groesse || 1, .5, 1.5) * .92); });
      // Schattierung: Helligkeit des Fotos unter dem Druck (Falten, Licht)
      const pd = a.getImageData(0, 0, A.width, A.height), fd = x.getImageData(0, 0, c.width, c.height), P = pd.data, Q = fd.data;
      const ref = FM.ref || (FM.ref = (() => { let s0 = 0, n = 0; for(let i = 0; i < Q.length; i += 4 * 13){ if(Q[i + 3] < 250) continue; const l = Q[i] * .3 + Q[i + 1] * .59 + Q[i + 2] * .11; if(l < 235 && l > 30){ s0 += l; n++; } } return n ? s0 / n : 128; })());
      for(let i = 0; i < P.length; i += 4){ if(!P[i + 3]) continue; const l = Q[i] * .3 + Q[i + 1] * .59 + Q[i + 2] * .11, f = kl(Math.pow(l / ref, .8), .62, 1.12); P[i] *= f; P[i + 1] *= f; P[i + 2] *= f; }
      a.putImageData(pd, 0, 0); x.globalCompositeOperation = 'source-atop'; x.globalAlpha = .96; x.drawImage(A, 0, 0); x.globalAlpha = 1; x.globalCompositeOperation = 'source-over';
      if(!t.grund){ t.grund = leinwand(c.width, c.height); } const gx = t.grund.getContext('2d'); gx.clearRect(0, 0, c.width, c.height); gx.drawImage(c, 0, 0); t.grundKey = schluessel;
      fotoRahmen(x, M, d, s, t);
    }
    function fotoRahmen(x, M, d, s, t){   // Rahmen für freie Plätze und Hervorhebung
      if(opt.rahmen) Object.keys(PLAETZE.trikot).forEach(k => { const q = M[k]; if(!q) return; const b = (d.belegung || {})[k], frei = !b || b.status === 'frei'; if(!(frei || b.vorschau || Z.an === k || Z.nein === k)) return;
        x.save(); x.translate(q[0] * s, q[1] * s); x.rotate((q[4] || 0) * PI / 180); const w = q[2] * s, h = q[3] * s; x.beginPath(); if(x.roundRect) x.roundRect(-w / 2, -h / 2, w, h, Math.min(w, h) * .18); else x.rect(-w / 2, -h / 2, w, h);
        if(Z.an === k){ x.fillStyle = 'rgba(255,255,255,.22)'; x.fill(); x.strokeStyle = '#fff'; x.lineWidth = Math.max(4, w * .03); }
        else if(Z.nein === k){ x.fillStyle = 'rgba(176,40,26,.25)'; x.fill(); x.strokeStyle = '#ffd2cc'; x.lineWidth = Math.max(4, w * .03); }
        else { x.strokeStyle = 'rgba(255,255,255,.7)'; x.lineWidth = Math.max(3, w * .016); x.setLineDash([Math.max(8, w * .06), Math.max(6, w * .04)]); }
        x.stroke(); x.restore(); });
      t.mat.map.needsUpdate = true;
    }

    /* ----- Malen der Texturen ----- */
    function platzFlaeche(teil, k){ // liefert {u, v, pxU, pxV, sx, sy} für einen Platz oder Aufdruck
      const p = Z.anker[k]; if(!p) return null; return p; }
    function ankerFuer(form, cv, u, v, hoch){   // Ableitungen an (u, v): Pixel je Meter und Leserichtung
      const e = .002, P0 = form.PUV(u, v), Pu = form.PUV(u + e, v), Pv = form.PUV(u, Math.min(.999, v + e));
      const du = add(Pu, P0, -1).map(x => x / e), dv = add(Pv, P0, -1).map(x => x / e);
      let n = norm(kreuz(du, dv)); const mitte = [P0[0] * .5, P0[1], 0];
      if(pkt(n, add(P0, [hoch.mx || 0, hoch.my != null ? hoch.my : P0[1], 0], -1)) < 0) n = n.map(x => -x);
      const oben = hoch.oben || [0, 1, 0], rechts = norm(kreuz(oben, n));
      void mitte;
      return { u, v, P:P0, n, r:rechts, o:oben, pxU:cv.width / Math.hypot(...du), pxV:cv.height / Math.hypot(...dv), sx:pkt(du, rechts) >= 0 ? 1 : -1, sy:pkt(dv, oben) >= 0 ? 1 : -1 };
    }
    function ankerBerechnen(){
      const art = Z.art === 'anzug' ? 'anzug' : 'trikot', R = Z.form; Z.anker = {};
      const torsoAnker = (x, y, vorn) => { const [u, v] = R.uvFuer(x, y, vorn); return ankerFuer(R, teile.torso.cv, u, v, { mx:0 }); };
      const besteU = (form, v, richtung) => { let best = 0, bu = 0; for(let i = 0; i < 128; i++){ const u = i / 128, a = form.PUV(u, v), b = form.PUV((i + 64) / 128 % 1, v); const n = norm(add(a, b, -1)); const s = pkt(n, norm(richtung)); if(s > best){ best = s; bu = u; } } return bu; };
      if(Z.foto3d){ const M = FOTO3D[Z.foto3d]; Object.keys(PLAETZE.trikot).forEach(k => { const q = M[k]; if(q) Z.anker[k] = Object.assign(fotoPunkt(Z.foto3d, q[0], q[1]), { teil:'foto' }); });
        Z.fest = {}; return; }
      Object.entries(PLAETZE[art]).forEach(([k, p]) => {
        if(p.teil === 'torso') Z.anker[k] = Object.assign(torsoAnker(p.x, p.y, p.vorn), { teil:'torso' });
        else if(p.teil === 'aermel'){ const t = teile[p.seite > 0 ? 'aermel_l' : 'aermel_r'], v = 1 - p.l;
          const ach = add(t.form.PUV(.25, Math.min(1, v + .02)), t.form.PUV(.25, Math.max(0, v - .02)), -1);   // Richtung zur Schulter (v wächst zur Schulter)
          const u = besteU(t.form, v, art === 'anzug' ? [p.seite * .5, .3, .8] : [p.seite * .4, .5, .8]);
          Z.anker[k] = Object.assign(ankerFuer(t.form, t.cv, u, v, { oben:norm(ach), mx:t.form.PUV(u, v)[0] - p.seite * .1, my:t.form.PUV(u, v)[1] - .05 }), { teil:p.seite > 0 ? 'aermel_l' : 'aermel_r' }); }
        else { const t = teile[p.seite > 0 ? 'bein_l' : 'bein_r'], v = 1 - p.l, u = besteU(t.form, v, [p.seite * .35, 0, p.vorn ? 1 : -1]);
          const P0 = t.form.PUV(u, v); Z.anker[k] = Object.assign(ankerFuer(t.form, t.cv, u, v, { mx:P0[0] - p.seite * .1, my:P0[1] }), { teil:p.seite > 0 ? 'bein_l' : 'bein_r' }); }
      });
      // feste Aufdrucke
      const S = R.S; Z.fest = {};
      if(art === 'trikot'){ Z.fest.wappen = torsoAnker(.098, .6, true); Z.fest.gemeinde = torsoAnker(0, .603, true); Z.fest.jungs = torsoAnker(0, .655, false); Z.fest.name = torsoAnker(0, .618, false); Z.fest.nummer = torsoAnker(0, .49, false);
        if(teile.bein_r){ const tb = teile.bein_r, vb = 1 - .7, ub = besteU(tb.form, vb, [-.35, 0, 1]); Z.fest.hoseWappen = ankerFuer(tb.form, tb.cv, ub, vb, { mx:tb.form.PUV(ub, vb)[0] + .1, my:tb.form.PUV(ub, vb)[1] }); } }
      else { Z.fest.wappen = torsoAnker(.105, .53, true); Z.fest.jungs = torsoAnker(0, .345, false); }
      void S;
    }
    function zeichneIn(ctx, a, img, wM, hM, gr, rot, deckung){   // Bild in Metern an einen Anker, Seitenverhältnis bleibt
      if(!a || !img) return; const iw = img.width || img.naturalWidth, ih = img.height || img.naturalHeight; if(!iw || !ih) return;
      const s = Math.min(wM / iw, hM / ih) * (gr || 1), w = iw * s * a.pxU, h = ih * s * a.pxV;
      const cx = a.u * ctx.canvas.width, cy = (1 - a.v) * ctx.canvas.height;
      const male = (ox) => { ctx.save(); ctx.translate(cx + ox, cy); ctx.scale(a.sx, a.sy); if(rot) ctx.rotate(rot); if(deckung != null) ctx.globalAlpha = deckung; ctx.drawImage(img, -w / 2, -h / 2, w, h); ctx.restore(); };
      male(0); if(cx - w < 0) male(ctx.canvas.width); if(cx + w > ctx.canvas.width) male(-ctx.canvas.width);
    }
    function rahmenIn(ctx, a, wM, hM, art){
      if(!a) return; const w = wM * a.pxU, h = hM * a.pxV, cx = a.u * ctx.canvas.width, cy = (1 - a.v) * ctx.canvas.height, r = Math.min(w, h) * .18;
      ctx.save(); ctx.translate(cx, cy); ctx.beginPath(); if(ctx.roundRect) ctx.roundRect(-w / 2, -h / 2, w, h, r); else ctx.rect(-w / 2, -h / 2, w, h);
      if(art === 'an'){ ctx.fillStyle = 'rgba(255,255,255,.22)'; ctx.fill(); ctx.lineWidth = Math.max(4, w * .02); ctx.strokeStyle = 'rgba(255,255,255,.95)'; ctx.setLineDash([]); }
      else if(art === 'nein'){ ctx.fillStyle = 'rgba(176,40,26,.25)'; ctx.fill(); ctx.lineWidth = Math.max(4, w * .02); ctx.strokeStyle = 'rgba(255,190,180,.95)'; ctx.setLineDash([]); }
      else { ctx.lineWidth = Math.max(3, w * .012); ctx.strokeStyle = 'rgba(255,255,255,.55)'; ctx.setLineDash([Math.max(8, w * .05), Math.max(6, w * .035)]); }
      ctx.stroke(); ctx.restore();
    }
    function textBild(t, px, farbe, gewicht, laufweite){
      const c = leinwand(10, 10), x = c.getContext('2d'), f = `${gewicht || 800} ${px}px ${opt.schrift}, 'Arial Narrow', sans-serif`; x.font = f;
      if(laufweite) try{ x.letterSpacing = laufweite + 'px'; }catch(e){}
      const w = Math.ceil(x.measureText(t).width) + 8; c.width = w; c.height = Math.ceil(px * 1.05); x.font = f; if(laufweite) try{ x.letterSpacing = laufweite + 'px'; }catch(e){}
      x.fillStyle = farbe; x.textBaseline = 'alphabetic'; x.fillText(t, 4, Math.round(px * .86)); return c; }
    let malT = 0, malNr = 0, fotoNr = 0;
    function malen(){ clearTimeout(malT); malT = setTimeout(malenJetzt, 0); }
    async function malenJetzt(){
      if(!Z.gl || !(teile.torso || teile.foto) || !Z.daten) return; const nr = ++malNr;
      const d = Z.daten, art = Z.art === 'anzug' ? 'anzug' : 'trikot', grundAlle = d.grund || '#2f5fd0', akzent = d.akzent || '#ffffff', kit = opt.kit;
      const fest = {}; await Promise.all([['wappen', 'wappen.png'], ['gemeinde', 'wappen-glocken-weiss.png'], ['jungs', 'jungs.png']].map(async ([k, f]) => { try{ fest[k] = await bild(kit + f); }catch(e){} }));
      try{ await document.fonts.load(`800 100px ${opt.schrift}`); await document.fonts.load(`700 100px ${opt.schrift}`); }catch(e){}
      const logos = {}; await Promise.all(Object.entries(d.belegung || {}).map(async ([k, b]) => { if(b && b.status !== 'frei' && (b.bild || b.firma)) logos[k] = await logoLeinwand(b, opt.schrift); }));
      if(nr !== malNr) return;
      if(teile.foto) await fotoMalen(fest, logos);
      if(nr !== malNr) return;
      Object.entries(teile).forEach(([name, t]) => { if(name === 'foto') return;
        const c = t.cv, x = c.getContext('2d'), W = c.width, H = c.height; x.setTransform(1, 0, 0, 1, 0, 0); x.globalAlpha = 1;
        const grund = Z.foto3d && (t.teil === 'bein' || t.teil === 'stutzen') && Z.fm[Z.foto3d].farbe || grundAlle;
        x.fillStyle = grund; x.fillRect(0, 0, W, H);
        if(name === 'torso'){
          const R = Z.form, S = R.S;
          // Saum- und Seitennähte ganz zart
          x.fillStyle = 'rgba(0,0,0,.08)'; x.fillRect(0, H - (.022 - R.Ymin) / (R.Ymax - R.Ymin) * H, W, 3);
          if(art === 'trikot'){
            // schlichter heller Streifen über der Schulter (vorn und hinten)
            x.strokeStyle = mischen(akzent, grund, .08); x.lineWidth = .0065 * teile.torso.cv.height / (R.Ymax - R.Ymin); x.lineCap = 'round';
            for(const vorn of [true, false]) for(const sg of [-1, 1]){ x.beginPath();
              for(let i = 0; i <= 20; i++){ const xx = sg * lerp(S.nr + .012, S.Xs + .004, i / 20), yy = S.H - .012 - .34 * (Math.abs(xx) - S.nr) - .016; const [u, v] = R.uvFuer(xx, yy, vorn); if(i) x.lineTo(u * W, (1 - v) * H); else x.moveTo(u * W, (1 - v) * H); }
              x.stroke(); }
            zeichneIn(x, Z.fest.wappen, fest.wappen, .085, .05);
            zeichneIn(x, Z.fest.gemeinde, fest.gemeinde, .05, .052);
            zeichneIn(x, Z.fest.jungs, fest.jungs, .1, .02);
            zeichneIn(x, Z.fest.name, textBild('SV/BSC MÖRLENBACH', 120, '#ffffff', 700), .19, .032);
            zeichneIn(x, Z.fest.nummer, textBild(String(d.nummer || '10'), 400, '#ffffff', 700), .26, .19);
          } else {
            // Reißverschluss vorn
            const [u0] = R.uvFuer(0, .3, true), uz = u0 * W, oZ = (1 - (S.H - S.ndf - .01 - R.Ymin) / (R.Ymax - R.Ymin)) * H;
            x.fillStyle = mischen(grund, '#000000', .55); x.fillRect(uz - 5, oZ, 10, H - oZ);
            x.fillStyle = 'rgba(255,255,255,.09)'; for(let yy = oZ; yy < H; yy += 7) x.fillRect(uz - 4, yy, 8, 2);
            x.fillStyle = mischen(grund, '#000000', .25); x.fillRect(0, H - .05 / (R.Ymax - R.Ymin) * H, W, .05 / (R.Ymax - R.Ymin) * H);
            zeichneIn(x, Z.fest.wappen, fest.wappen, .085, .05);
            zeichneIn(x, Z.fest.jungs, fest.jungs, .14, .028, 1, 0, .95);
          }
        } else if(t.teil === 'aermel'){
          if(art === 'trikot'){ x.fillStyle = akzent; x.fillRect(0, H * .82, W, H * .18); x.fillStyle = grund; x.fillRect(0, H * .865, W, H * .03); x.fillStyle = 'rgba(0,0,0,.06)'; x.fillRect(0, H * .82, W, 3);
            // Streifen oben auf dem Ärmel, Fortsetzung der Schulter
            const uO = Z.oberkante && Z.oberkante[name]; if(uO != null){ x.fillStyle = mischen(akzent, grund, .08); x.fillRect(uO * W - 7, 0, 14, H * .82); } }
          else { // Präsentationsjacke wie Squadra 25: heller Einsatz am Oberarm, abgesetzt mit einer dunklen Naht (keine Markenstreifen)
            const hx = parseInt(String(grund).slice(1), 16), dunkel = ((hx >> 16 & 255) + (hx >> 8 & 255) + (hx & 255)) / 3 < 60, einsatz = d.einsatz || (dunkel ? '#eceef2' : null);
            if(einsatz){ x.fillStyle = einsatz; x.fillRect(0, 0, W, H * .46); x.fillStyle = mischen(grund, '#000000', .3); x.fillRect(0, H * .46, W, Math.max(3, H * .008)); x.fillStyle = 'rgba(0,0,0,.05)'; x.fillRect(0, H * .44, W, H * .02); }
            x.fillStyle = mischen(grund, '#000000', .2); x.fillRect(0, H * .93, W, H * .07); }
        } else if(t.teil === 'bein'){
          const bund = art === 'anzug' ? .03 : .05; x.fillStyle = mischen(grund, '#000000', .16); x.fillRect(0, 0, W, H * bund); x.fillStyle = 'rgba(0,0,0,.12)'; x.fillRect(0, H * bund - 3, W, 3);
          x.fillStyle = 'rgba(0,0,0,.09)'; x.fillRect(0, H * (art === 'anzug' ? .955 : .965), W, 3); if(art === 'anzug'){ x.fillStyle = mischen(grund, '#000000', .2); x.fillRect(0, H * .965, W, H * .035); }
          if(name === 'bein_r' && Z.fest.hoseWappen) zeichneIn(x, Z.fest.hoseWappen, fest.wappen, .06, .036);
        } else if(t.teil === 'stutzen'){
          x.fillStyle = akzent; x.fillRect(0, 0, W, H * .13); x.fillStyle = grund; x.fillRect(0, H * .045, W, H * .025);
          x.fillStyle = mischen(grund, '#000000', .1); x.fillRect(0, H * .78, W, H * .22);
        }
        // Plätze
        Object.entries(PLAETZE[art]).forEach(([k, p]) => { const a = Z.anker[k]; if(!a || a.teil !== name) return; const b = (d.belegung || {})[k];
          const frei = !b || b.status === 'frei';
          if(opt.rahmen && (frei || b.vorschau || Z.an === k || Z.nein === k)) rahmenIn(x, a, p.w, p.h, Z.an === k ? 'an' : Z.nein === k ? 'nein' : '');
          if(!frei && logos[k]) zeichneIn(x, a, logos[k], p.w, p.h, kl(+b.groesse || 1, .5, 1.5) * .92);
        });
        t.mat.map.needsUpdate = true;
      });
      zeigen3d();
    }

    /* ----- Kamera, Drehen, Marken ----- */
    const FOKUS = { gesamt:null, oben:null, unten:null };
    function kameraZiel(f){ const top = Z.oben + .03, bot = Z.unten - .03;   // 0.81: nur noch Trikot bzw. Jacke, alle Ansichten zeigen das ganze Oberteil
      void f; return { y0:bot, y1:top + .02 }; }
    function kameraSetzen(){
      const a = kameraZiel(Z.fokus), b = kameraZiel(Z.fokusZiel), k = sst(0, 1, Z.fk), y0 = lerp(a.y0, b.y0, k), y1 = lerp(a.y1, b.y1, k);
      const hoehe = (y1 - y0) * 1.08, breite = Z.fokusZiel === 'oben' && Z.fk >= 1 ? .9 : .98, fov = kamera.fov * PI / 180;
      const dH = hoehe / 2 / Math.tan(fov / 2), dW = breite / 2 / Math.tan(fov / 2) / kamera.aspect, dist = Math.max(dH, dW) + .25;
      const cy = (y0 + y1) / 2; kamera.position.set(0, cy + dist * .045, dist); kamera.lookAt(0, cy, 0); void FOKUS;
    }
    function zeigen3d(){ if(!raf) raf = requestAnimationFrame(schritt); }
    let tAlt = 0;
    function schritt(ts){
      raf = 0; if(!Z.lebt || !Z.gl) return; const dtGes = Math.min(.5, tAlt ? (ts - tAlt) / 1000 : .016); tAlt = ts;
      // in kleinen Schritten rechnen: auch bei langsamen Geräten schwingt das Trikot in derselben Zeit ein
      let weiter = false; const n = Math.max(1, Math.ceil(dtGes / .008)), dt = dtGes / n;
      for(let i = 0; i < n; i++) weiter = physik(dt) || weiter;
      gruppe.rotation.y = -Z.winkel; kameraSetzen();
      renderer.render(szene, kamera); markenSetzen();
      const sicht = sichtVon(Z.winkel);
      if(sicht !== Z.sicht){ Z.sicht = sicht; opt.onDreh && opt.onDreh(sicht); }
      if(weiter || Z.zieht) raf = requestAnimationFrame(schritt); else tAlt = 0;
    }
    // Fotomodell: vorn oder hinten, „seite“ erst ab der Schrägansicht (über der Zieh-Grenze); gebaut wie bisher in Vierteln
    function sichtVon(w){ if(!Z.foto3d) return w < PI / 4 ? 'vorn' : w > 3 * PI / 4 ? 'hinten' : 'seite';
      const r = w > PI / 2 ? PI : 0; return Math.abs(w - r) > GRENZE * 1.1 ? 'seite' : r ? 'hinten' : 'vorn'; }
    function physik(dt){
      let weiter = false;
      if(!Z.zieht){
        if(Z.ziel == null){ // Schwung auslaufen lassen, an den Enden weich zurück
          Z.winkel += Z.vw * dt; Z.vw *= Math.pow(.02, dt);
          if(Z.winkel < 0){ Z.vw += -Z.winkel * 60 * dt; Z.vw *= Math.pow(.05, dt); }
          if(Z.winkel > PI){ Z.vw -= (Z.winkel - PI) * 60 * dt; Z.vw *= Math.pow(.05, dt); }
          if(Math.abs(Z.vw) > .02 || Z.winkel < -.002 || Z.winkel > PI + .002) weiter = true; else { Z.vw = 0; Z.winkel = kl(Z.winkel, 0, PI); }
        } else { // Feder zum Ziel, kritisch gedämpft
          const w0 = 11, x = Z.winkel - Z.ziel; Z.vw += (-w0 * w0 * x - 2 * w0 * Z.vw) * dt; Z.winkel += Z.vw * dt;
          if(Math.abs(x) > .001 || Math.abs(Z.vw) > .01) weiter = true; else { Z.winkel = Z.ziel; Z.vw = 0; }
        }
      }
      if(Z.fk < 1){ Z.fk = Math.min(1, Z.fk + dt * 2.2); weiter = true; if(Z.fk >= 1){ Z.fokus = Z.fokusZiel; } }
      return weiter;
    }
    function bedienung(cv){
      let x0 = 0, w0 = 0, lx = 0, lt = 0, id = null, bewegt = false;
      cv.addEventListener('pointerdown', e => { if(e.button > 0) return; id = e.pointerId; x0 = lx = e.clientX; w0 = Z.winkel; lt = performance.now(); bewegt = false;
        if(Z.foto3d) return;   // Fotomodell: ein bloßer Tipp hält eine laufende Drehung nicht an (sonst bliebe es hochkant stehen)
        Z.ziel = null; Z.vw = 0; });
      cv.addEventListener('pointermove', e => { if(e.pointerId !== id) return; const dx = e.clientX - x0;
        if(!bewegt && Math.abs(dx) > 6){ bewegt = true; Z.zieht = true; wurzel.classList.add('zieht'); try{ cv.setPointerCapture(id); }catch(_){}
          if(Z.foto3d){ // Neigung von jetzt an stetig: aus dem aktuellen Winkel den Zug zurückrechnen (auch mitten im Umdrehen gegriffen)
            Z.ruhe = Z.winkel > PI / 2 ? PI : 0; const t = Z.winkel - Z.ruhe, at = Math.abs(t); Z.roh0 = at <= GRENZE ? t : Math.sign(t) * (GRENZE + (at - GRENZE) / .22);
            x0 = e.clientX; Z.ziel = null; Z.vw = 0; }
          zeigen3d(); }
        if(!bewegt) return; e.preventDefault();
        // 0.82: das Trikot neigt sich beim Ziehen nur bis etwa 25 Grad (die flache Seite bleibt verborgen), weiter gezogen gibt es nach wie ein Gummiband
        if(!Z.foto3d){ let w = w0 - dx * .0095; if(w < 0) w = w * .35; if(w > PI) w = PI + (w - PI) * .35; Z.winkel = w; }
        else { const roh = Z.roh0 - (e.clientX - x0) * .0045, gz = GRENZE, w = Math.abs(roh) <= gz ? roh : Math.sign(roh) * (gz + (Math.abs(roh) - gz) * .22); Z.winkel = Z.ruhe + w; Z.zug = roh; }
        const t = performance.now(), dtt = Math.max(1, t - lt); Z.vw = lerp(Z.vw, -(e.clientX - lx) * .0095 / dtt * 1000, .5); lx = e.clientX; lt = t; });
      // Loslassen: weit genug oder schnell genug gezogen, dann dreht es sich ganz um (vorn <-> hinten), sonst federt es zurück
      const los = e => { if(e.pointerId !== id) return; id = null; if(bewegt){ Z.zieht = false; wurzel.classList.remove('zieht');
        if(!Z.foto3d){ if(ruhig()){ Z.vw = 0; Z.winkel = kl(Z.winkel, 0, PI); } zeigen3d(); return; }   // Anzug (gebaut): frei drehen wie bisher
        const um = Math.abs(Z.zug || 0) > GRENZE * 1.5 || Math.abs(Z.vw) > 2.2 && Math.sign(Z.vw) === Math.sign(Z.winkel - Z.ruhe);
        const ziel = um ? PI - Z.ruhe : Z.ruhe; Z.zug = 0;
        if(ruhig()){ Z.vw = 0; Z.winkel = Z.ziel = ziel; } else { Z.ziel = ziel; Z.vw *= .4; } zeigen3d(); } };
      cv.addEventListener('pointerup', los); cv.addEventListener('pointercancel', los);
      cv.addEventListener('keydown', e => { if(e.key === 'ArrowLeft' || e.key === 'ArrowRight'){ e.preventDefault(); const jetzt = Z.ziel != null ? Z.ziel : Z.winkel;
        drehen(Z.foto3d ? (jetzt > PI / 2 ? 0 : PI) : kl(jetzt + (e.key === 'ArrowRight' ? 1 : -1) * PI / 4, 0, PI)); } });
    }
    function drehen(w, sofort){
      let z = typeof w === 'number' ? w : ({ vorn:0, seite:Z.foto3d ? GRENZE * 1.2 : PI / 2, hinten:PI }[w] || 0);   // Fotomodell: „Seite“ ist die Schrägansicht
      if(Z.modus === 'foto'){ Z.sicht = z > PI / 2 ? 'hinten' : 'vorn'; Z.winkel = Z.ziel = z > PI / 2 ? PI : 0; foto(); opt.onDreh && opt.onDreh(Z.sicht); return; }
      if(Z.foto3d){ const r = z > PI / 2 ? PI : 0; z = r + kl(z - r, -GRENZE * 1.2, GRENZE * 1.2); }   // z. B. Ärmel (.95): Schrägansicht statt flacher Seite
      Z.ziel = z; if(sofort || ruhig()){ Z.winkel = z; Z.vw = 0; } zeigen3d();
    }
    function fokus(f, sofort){ if(f === Z.fokusZiel) return; Z.fokus = Z.fk >= 1 ? Z.fokusZiel : Z.fokus; Z.fokusZiel = f; Z.fk = sofort || ruhig() ? 1 : 0; if(Z.fk >= 1) Z.fokus = f; zeigen3d(); }
    function markeHolen(k){ if(marken[k]) return marken[k];
      const b = document.createElement('button'); b.type = 'button'; b.className = 't3-p'; b.dataset.platz = k; b.innerHTML = '<i aria-hidden="true"></i><span></span>';
      b.onclick = e => { e.stopPropagation(); opt.onPlatz && opt.onPlatz(k); }; mk.appendChild(b); marken[k] = b; return b; }
    function markenSetzen(){
      if(!opt.marken) return; const art = Z.art === 'anzug' ? 'anzug' : 'trikot', d = Z.daten || {}, r = wurzel.getBoundingClientRect();
      Object.keys(marken).forEach(k => { if(!PLAETZE[art][k]) { marken[k].remove(); delete marken[k]; } });
      if(Z.modus === 'foto') return fotoMarken();
      gruppe.updateMatrixWorld(); const cam = kamera.position;
      Object.entries(PLAETZE[art]).forEach(([k, p]) => { const a = Z.anker[k]; if(!a) return; const m = markeHolen(k), b = (d.belegung || {})[k] || {};
        const frei = (!b.status || b.status === 'frei') && !b.vorschau, ecke = frei ? [0, 0, 0] : add(add([0, 0, 0], a.r, p.w * .5), a.o, p.h * .5);
        const v = new T.Vector3(...add(a.P, ecke)).applyMatrix4(gruppe.matrixWorld), n = new T.Vector3(...a.n).transformDirection(gruppe.matrixWorld);
        const blick = cam.clone().sub(v).normalize(), sicht = n.dot(blick) > .3;
        const s = v.clone().project(kamera), x = (s.x * .5 + .5) * r.width, y = (-s.y * .5 + .5) * r.height;
        markeStil(m, k, p, b, sicht && x > 8 && y > 8 && x < r.width - 8 && y < r.height - 8, x, y); });
    }
    function markeStil(m, k, p, b, sicht, x, y){
      const frei = !b.status || b.status === 'frei', name = (opt.name && opt.name(k)) || p.n;
      m.style.transform = `translate(${x.toFixed(1)}px,${y.toFixed(1)}px)`; m.classList.toggle('weg', !sicht); m.tabIndex = sicht ? 0 : -1;
      m.classList.toggle('belegt', !frei && !b.vorschau); m.classList.toggle('vorschau', !!b.vorschau); m.classList.toggle('an', Z.an === k); m.classList.toggle('nein', Z.nein === k);
      const t = frei ? `${name}: frei` : b.vorschau ? `${name}: Vorschau ${b.firma || ''}` : `${name}: ${b.status === 'reserviert' ? 'reserviert' : 'belegt'}${b.firma ? ', ' + b.firma : ''}`;
      if(m.getAttribute('aria-label') !== t){ m.setAttribute('aria-label', t); m.querySelector('span').textContent = frei ? name : (b.firma || name); }
      m.dataset.sicht = sicht ? '1' : ''; m.dataset.x = x; m.dataset.y = y;
    }

    /* ----- Foto-Ansicht ----- */
    async function foto(){
      if(Z.modus !== 'foto' || !Z.daten) return; const nr = ++fotoNr;
      const d = Z.daten, satz = Z.art === 'auswaerts' ? 'auswaerts' : 'heim', seite = Z.sicht === 'hinten' ? 'hinten' : 'vorn', F = FOTO[satz][seite];
      if(Z.art === 'anzug'){ const r0 = wurzel.getBoundingClientRect(), dp = Math.min(2, window.devicePixelRatio || 1); cvF.width = Math.round(r0.width * dp); cvF.height = Math.round(r0.height * dp);
        const x0 = cvF.getContext('2d'); x0.clearRect(0, 0, cvF.width, cvF.height); x0.fillStyle = '#4a5064'; x0.font = `600 ${15 * dp}px system-ui, sans-serif`; x0.textAlign = 'center';
        x0.fillText('Den Anzug zeigen wir nur in 3D.', cvF.width / 2, cvF.height / 2); Z.fotoLage = null; Object.values(marken).forEach(m => m.classList.add('weg')); return; }
      let img; try{ img = await bild(opt.kit + F.bild); }catch(e){ return; }
      const fest = {}; await Promise.all([['wappen', 'wappen.png'], ['gemeinde', 'wappen-glocken-weiss.png'], ['jungs', 'jungs.png']].map(async ([k, f]) => { try{ fest[k] = await bild(opt.kit + f); }catch(e){} }));
      try{ await document.fonts.load(`700 100px ${opt.schrift}`); }catch(e){}
      const logos = {}; await Promise.all(Object.entries(d.belegung || {}).map(async ([k, b]) => { if(F[k] && b && b.status !== 'frei' && (b.bild || b.firma)) logos[k] = await logoLeinwand(b, opt.schrift); }));
      if(nr !== fotoNr || Z.modus !== 'foto') return;
      const r = wurzel.getBoundingClientRect(), dpr = Math.min(2, window.devicePixelRatio || 1); cvF.width = Math.round(r.width * dpr); cvF.height = Math.round(r.height * dpr);
      const x = cvF.getContext('2d'); x.setTransform(1, 0, 0, 1, 0, 0); x.clearRect(0, 0, cvF.width, cvF.height);
      // Foto als Karte mit seinem eigenen hellen Grund
      const pad = 14 * dpr, s = Math.min((cvF.width - pad * 2) / F.w, (cvF.height - pad * 2) / F.h), ox = (cvF.width - F.w * s) / 2, oy = (cvF.height - F.h * s) / 2;
      x.save(); x.beginPath(); const rr = 14 * dpr; if(x.roundRect) x.roundRect(ox, oy, F.w * s, F.h * s, rr); else x.rect(ox, oy, F.w * s, F.h * s); x.fillStyle = '#ffffff'; x.fill(); x.clip();
      x.drawImage(img, ox, oy, F.w * s, F.h * s);
      // Arbeitsfläche in Fotopixeln, danach mit dem Stoff schattieren
      const A = document.createElement('canvas'); A.width = F.w * 2; A.height = F.h * 2; const a = A.getContext('2d'); a.scale(2, 2);
      const setze = (q, bildX, wM, hM, gr) => { if(!q || !bildX) return; const [cx, cy, w, h, rot] = q; const iw = bildX.width || bildX.naturalWidth, ih = bildX.height || bildX.naturalHeight;
        const k = Math.min(w / iw, (h || w) / ih) * (gr || 1); a.save(); a.translate(cx, cy); a.rotate((rot || 0) * PI / 180); a.drawImage(bildX, -iw * k / 2, -ih * k / 2, iw * k, ih * k); a.restore(); void wM; void hM; };
      if(seite === 'vorn'){ setze([...F.wappen, F.wappen[2] * .6, 0], fest.wappen); setze([F.gemeinde[0], F.gemeinde[1], F.gemeinde[2], F.gemeinde[3], 0], fest.gemeinde); }
      else { setze([...F.jungs, F.jungs[2] * .2, 0], fest.jungs); setze([...F.name, F.name[2] * .2, 0], textBild('SV/BSC MÖRLENBACH', 120, '#ffffff', 700)); setze([...F.nummer, F.nummer[2] * 1.05, 0], textBild(String(d.nummer || '10'), 400, '#ffffff', 700)); }
      Object.entries(logos).forEach(([k, L]) => { const b = d.belegung[k]; setze(F[k], L, 0, 0, kl(+b.groesse || 1, .5, 1.5) * .92); });
      // Schattierung: Helligkeit des Fotos unter dem Druck übernehmen (Falten, Licht)
      const G = document.createElement('canvas'); G.width = A.width; G.height = A.height; const g = G.getContext('2d'); g.drawImage(img, 0, 0, A.width, A.height);
      const pd = a.getImageData(0, 0, A.width, A.height), fd = g.getImageData(0, 0, A.width, A.height), P = pd.data, Q = fd.data;
      const ref = F.ref || (F.ref = (() => { let s0 = 0, n = 0; for(let i = 0; i < Q.length; i += 4 * 9){ const l = Q[i] * .3 + Q[i + 1] * .59 + Q[i + 2] * .11; if(l < 235 && l > 30){ s0 += l; n++; } } return n ? s0 / n : 128; })());
      for(let i = 0; i < P.length; i += 4){ if(!P[i + 3]) continue; const l = Q[i] * .3 + Q[i + 1] * .59 + Q[i + 2] * .11, f = kl(Math.pow(l / ref, .8), .62, 1.12); P[i] *= f; P[i + 1] *= f; P[i + 2] *= f; }
      a.setTransform(1, 0, 0, 1, 0, 0); a.putImageData(pd, 0, 0);
      x.globalAlpha = .96; x.drawImage(A, ox, oy, F.w * s, F.h * s); x.globalAlpha = 1;
      // Rahmen für freie Plätze
      if(opt.rahmen) Object.keys(PLAETZE.trikot).forEach(k => { const q = F[k]; if(!q) return; const b = (d.belegung || {})[k]; const frei = !b || b.status === 'frei'; if(!(frei || Z.an === k || Z.nein === k)) return;
        x.save(); x.translate(ox + q[0] * s, oy + q[1] * s); x.rotate((q[4] || 0) * PI / 180); x.beginPath(); const w = q[2] * s, h = q[3] * s; if(x.roundRect) x.roundRect(-w / 2, -h / 2, w, h, 5 * dpr); else x.rect(-w / 2, -h / 2, w, h);
        if(Z.an === k){ x.fillStyle = 'rgba(255,255,255,.22)'; x.fill(); x.strokeStyle = '#fff'; x.lineWidth = 2.5 * dpr; } else if(Z.nein === k){ x.fillStyle = 'rgba(176,40,26,.25)'; x.fill(); x.strokeStyle = '#ffd2cc'; x.lineWidth = 2.5 * dpr; }
        else { x.strokeStyle = 'rgba(255,255,255,.75)'; x.lineWidth = 1.5 * dpr; x.setLineDash([6 * dpr, 4 * dpr]); } x.stroke(); x.restore(); });
      x.restore();
      Z.fotoLage = { ox:ox / dpr, oy:oy / dpr, s:s / dpr, F };
      markenSetzen();
    }
    function fotoMarken(){
      const art = 'trikot', d = Z.daten || {}, L = Z.fotoLage; if(!L) return;
      Object.entries(PLAETZE[art]).forEach(([k, p]) => { const q = L.F[k], m = markeHolen(k), b = (d.belegung || {})[k] || {};
        if(!q){ markeStil(m, k, p, b, false, 0, 0); return; } const fr = (!b.status || b.status === 'frei') && !b.vorschau; markeStil(m, k, p, b, true, L.ox + (q[0] + (fr ? 0 : q[2] / 2)) * L.s, L.oy + (q[1] - (fr ? 0 : q[3] / 2)) * L.s); });
    }

    /* ----- nach außen ----- */
    async function setzen(daten){
      const artNeu = daten.art === 'anzug' ? 'anzug' : daten.art === 'auswaerts' ? 'auswaerts' : 'heim', formWechsel = (artNeu === 'anzug') !== (Z.art === 'anzug') || !(teile.torso || teile.foto) || (teile.foto && teile.foto.satz !== artNeu), farbWechsel = !Z.daten || Z.daten.grund !== daten.grund;
      Z.art = artNeu; Z.daten = daten;
      if(Z.art === 'anzug' && Z.modus === 'foto' && Z.gl){ Z.modus = '3d'; modusZeigen(); }
      if(Z.gl){ if(formWechsel || farbWechsel){ bauen(); oberkanten(); } }
      if(Z.modus === 'foto') foto(); else malen();
    }
    function oberkanten(){ Z.oberkante = {}; ['aermel_l', 'aermel_r'].forEach(n => { const t = teile[n]; if(!t) return; let best = -9, bu = 0; for(let i = 0; i < 64; i++){ const u = i / 64, y = t.form.PUV(u, .6)[1]; if(y > best){ best = y; bu = u; } } Z.oberkante[n] = bu; }); }
    function modusZeigen(){ const gl = wurzel.querySelector('.t3-gl'); if(gl) gl.hidden = Z.modus !== '3d'; cvF.hidden = Z.modus !== 'foto'; }
    async function modus(m){ if(m === '3d' && !Z.gl) return false; if(m === 'foto' && Z.art === 'anzug') return false; Z.modus = m; modusZeigen();
      if(m === 'foto'){ Z.sicht = Z.winkel > PI / 2 ? 'hinten' : 'vorn'; foto(); } else { malen(); zeigen3d(); } return true; }
    function platzBei(cx, cy, radius){ const r = wurzel.getBoundingClientRect(); let best = null, bd = radius || 60;
      Object.entries(marken).forEach(([k, m]) => { if(m.dataset.sicht !== '1') return; const d = Math.hypot(+m.dataset.x + r.left - cx, +m.dataset.y + r.top - cy); if(d < bd){ bd = d; best = k; } }); return best; }
    function hervorheben(k, art){ const an = art === 'nein' ? null : k, nein = art === 'nein' ? k : null; if(an === Z.an && nein === Z.nein) return; Z.an = an; Z.nein = nein; if(Z.modus === 'foto') foto(); else malen(); }
    // Bild zum Speichern und Teilen: Bühne mit ruhigem Grund und Unterschrift
    async function png(o){
      o = Object.assign({ breite:1080, hoehe:1350, titel:'So sieht dein Logo bei uns aus', zeile:'', grund:'#eef0f4' }, o || {});
      const c = leinwand(o.breite, o.hoehe), x = c.getContext('2d'), g = x.createLinearGradient(0, 0, 0, o.hoehe); g.addColorStop(0, '#f6f7f9'); g.addColorStop(1, '#e4e7ee'); x.fillStyle = g; x.fillRect(0, 0, o.breite, o.hoehe);
      const altR = opt.rahmen, altAn = Z.an; opt.rahmen = false; Z.an = null;
      const fl = { x:60, y:190, w:o.breite - 120, h:o.hoehe - 300 };
      if(Z.modus === '3d' && Z.gl){ await malenJetzt(); const alt = renderer.getSize(new T.Vector2()), pr = renderer.getPixelRatio();
        renderer.setPixelRatio(1); renderer.setSize(fl.w, fl.h, false); kamera.aspect = fl.w / fl.h; kamera.updateProjectionMatrix(); gruppe.rotation.y = -Z.winkel; kameraSetzen(); renderer.render(szene, kamera);
        x.drawImage(renderer.domElement, fl.x, fl.y, fl.w, fl.h); renderer.setPixelRatio(pr); renderer.setSize(alt.x, alt.y, false); kamera.aspect = alt.x / alt.y; kamera.updateProjectionMatrix(); }
      else { await foto(); x.drawImage(cvF, fl.x, fl.y, fl.w, fl.h); }
      opt.rahmen = altR; Z.an = altAn; if(Z.modus === 'foto') foto(); else malen();
      try{ await document.fonts.load(`800 60px ${opt.schrift}`); }catch(e){}
      x.fillStyle = '#1d2760'; x.font = `800 64px ${opt.schrift}, sans-serif`; x.textBaseline = 'alphabetic'; x.fillText(o.titel.toUpperCase(), 60, 120);
      x.fillStyle = '#4a5064'; x.font = `600 34px ${opt.schrift}, sans-serif`; if(o.zeile) x.fillText(o.zeile, 60, 165);
      try{ const w = await bild(opt.kit + 'wappen.png'); const h = 64, b = w.width * h / w.height; x.drawImage(w, o.breite - 60 - b, o.hoehe - 92, b, h); }catch(e){}
      x.fillStyle = '#e8741f'; x.fillRect(60, o.hoehe - 70, 60, 6); x.fillStyle = '#1d2760'; x.font = `700 30px ${opt.schrift}, sans-serif`; x.fillText('SV/BSC MÖRLENBACH', 136, o.hoehe - 58);
      return c;
    }
    function zerstoeren(){ Z.lebt = false; cancelAnimationFrame(raf); try{ mats.forEach(m => m.dispose()); renderer && renderer.dispose(); renderer && renderer.forceContextLoss && renderer.forceContextLoss(); }catch(e){} wurzel.remove(); }
    function pixelTest(){ if(!Z.gl) return 0; renderer.render(szene, kamera); const gl = renderer.getContext(), w = gl.drawingBufferWidth, h = gl.drawingBufferHeight, p = new Uint8Array(4 * 64); let n = 0;
      for(let i = 0; i < 64; i++){ gl.readPixels(Math.floor(w * (.3 + .4 * (i % 8) / 7)), Math.floor(h * (.25 + .6 * Math.floor(i / 8) / 7)), 1, 1, gl.RGBA, gl.UNSIGNED_BYTE, p.subarray(i * 4, i * 4 + 4)); if(p[i * 4 + 3] > 0) n++; } return n / 64; }

    const bereit = (Z.modus === '3d' ? start3d().catch(e => { Z.fehler = e; Z.modus = 'foto'; modusZeigen(); }) : Promise.resolve()).then(() => { modusZeigen(); });
    return { bereit, setzen, drehen, fokus, modus, platzBei, hervorheben, png, zerstoeren, pixelTest,
      get modusJetzt(){ return Z.modus; }, get fotoModell(){ return Z.foto3d || null; }, get fokusJetzt(){ return Z.fokusZiel; }, get sicht(){ return Z.sicht; }, get webgl(){ return Z.gl; }, get winkel(){ return Z.winkel; }, wurzel };
  }

  return { laden, kannWebGL, buehne, PLAETZE, platzListe, platzInfo, FOTO, FOTO3D };
})();
