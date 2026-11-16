  async function fontDaten(datei){ if(fontCache.has(datei)) return fontCache.get(datei);
    const p = fetch(basisJetzt + datei).then(r => { if(!r.ok) throw new Error(); return r.blob(); }).then(b => new Promise(ok => { const fr = new FileReader(); fr.onload = () => ok(fr.result); fr.readAsDataURL(b); })).catch(() => null);
    fontCache.set(datei, p); return p; }
  const xe = s => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
  const r2 = v => Math.round(v * 100) / 100;
  // Farben im SVG nur als #rgb/#rrggbb oder rgb(a)-Zahlen, alles andere wird zu Schwarz
  const fa = c => /^#[0-9a-fA-F]{3,8}$|^rgba?\([\d.,\s%]+\)$|^none$/.test(String(c || '')) ? c : '#1c1c22';
  async function svg(L, res, spec){
    const B = L.B, fonts = await Promise.all(SCHRIFTEN.map(async ([fam, f, w]) => { const u = await fontDaten(f); return u ? `@font-face{font-family:'${fam}';font-weight:${w};src:url(${u.replace(/^data:[^;]*;/, 'data:font/woff2;')}) format('woff2');}` : ''; }));
    const bildUrl = im => { if(!im) return null; const c = document.createElement('canvas'); c.width = im.naturalWidth || im.width; c.height = im.naturalHeight || im.height; c.getContext('2d').drawImage(im, 0, 0); return c.toDataURL('image/png'); };
    const lu = bildUrl(res.logoBild), wu = bildUrl(res.wappenBild), famName = f => FAM[f.fam].replace(/"/g, "'");
    const teile = L.ops.map(o => {
      if(o.t === 'rect') return `<rect x="${r2(o.x)}" y="${r2(o.y)}" width="${r2(o.w)}" height="${r2(o.h)}" fill="${fa(o.fill)}"/>`;
      if(o.t === 'linie') return `<line x1="${r2(o.x1)}" y1="${r2(o.y1)}" x2="${r2(o.x2)}" y2="${r2(o.y2)}" stroke="${fa(o.stroke)}" stroke-width="${r2(+o.w || 0)}" stroke-linecap="round"/>`;
      if(o.t === 'strich'){ const [a, b, c] = o.pts; return `<path d="M${r2(a[0])} ${r2(a[1])}Q${r2(b[0])} ${r2(b[1])} ${r2(c[0])} ${r2(c[1])}" fill="none" stroke="${fa(o.stroke)}" stroke-width="${r2(o.w)}" stroke-linecap="round"/>`; }
      if(o.t === 'img'){ const u = o.key === 'logo' ? lu : wu; return u ? `<image x="${r2(o.x)}" y="${r2(o.y)}" width="${r2(o.w)}" height="${r2(o.h)}" preserveAspectRatio="none" href="${u}"/>` : ''; }
      if(o.t === 'text'){ const anchor = o.align === 'c' ? 'middle' : o.align === 'r' ? 'end' : 'start', rot = o.rot ? ` transform="rotate(${o.rot} ${r2(o.box.x + o.box.w / 2)} ${r2(o.box.y + o.box.h / 2)})"` : '';
        return `<text font-family="${famName(o.f)}" font-weight="${o.f.w}" font-size="${r2(o.fs)}" fill="${fa(o.fill)}" text-anchor="${anchor}"${o.f.ls ? ` letter-spacing="${r2(o.f.ls * o.fs)}"` : ''}${rot}>` +
          o.lines.map((z, i) => `<tspan x="${r2(o.x)}" y="${r2(o.y + o.a * o.fs + i * o.lh * o.fs)}">${xe(z)}</tspan>`).join('') + '</text>'; }
      return ''; }).join('\n');
    const s = `<?xml version="1.0" encoding="UTF-8"?>\n<svg xmlns="http://www.w3.org/2000/svg" width="${L.W + 2 * B}mm" height="${L.H + 2 * B}mm" viewBox="${-B} ${-B} ${L.W + 2 * B} ${L.H + 2 * B}">\n` +
      `<title>${xe('Bande ' + sauber(spec.firma || spec.name) + ', ' + (FORMATE[L.format] || {}).t + ', mit 2 cm Beschnitt')}</title>\n<style>${fonts.join('')}</style>\n${teile}\n</svg>\n`;
    return { blob:new Blob([s], { type:'image/svg+xml' }), name:dateiName(L, spec, 'svg'), text:s };
  }

  /* ---------- Die Reihe, wie sie heute hängt (0.99.25) ----------
     Albert, 14.11.2026: „Kannst du mir das dreidimensional darstellen, wer jetzt gerade wie wo ist? So originalgetreu wie möglich.“
     Blick vom Rasen über die Laufbahn auf die Bandenreihe. Jede Tafel in ihrer wirklichen Länge und mit ihrem Foto, Lücken bleiben
     Lücken, freie Plätze sind gestrichelt. o: { tafeln:[{ id, x0, l, h, img, frei, nr, name, farbe, an, ring }], kamX, abstand, blick }.
     x in Metern entlang der Reihe. Rückgabe: { boxen:[{ id, x, y, w, h }], pxm } in CSS-Pixeln. */
  const REIHE_TEX = new Map(), REIHE_H = 192, REIHE_RAND = new Map();
  // Farbe am Rand eines Fotos (links, rechts, oben, unten): der Mittelwert eines schmalen Streifens knapp innerhalb der Kante
  function reiheRand(img, seite){ const k = img.src + '|' + seite; if(REIHE_RAND.has(k)) return REIHE_RAND.get(k);
    let f = '#f7f5ef'; try{ const iw = img.naturalWidth, ih = img.naturalHeight, d = Math.max(1, Math.round(Math.min(iw, ih) * .04)), c = document.createElement('canvas'), x = c.getContext('2d', { willReadFrequently:true });
      const quer = seite === 'o' || seite === 'u'; c.width = quer ? 24 : 1; c.height = quer ? 1 : 24;
      if(seite === 'l') x.drawImage(img, d, 0, d, ih, 0, 0, 1, 24); else if(seite === 'r') x.drawImage(img, iw - 2 * d, 0, d, ih, 0, 0, 1, 24);
      else if(seite === 'o') x.drawImage(img, 0, d, iw, d, 0, 0, 24, 1); else x.drawImage(img, 0, ih - 2 * d, iw, d, 0, 0, 24, 1);
      const p = x.getImageData(0, 0, c.width, c.height).data, n = p.length / 4, K = [[], [], []]; for(let i = 0; i < n; i++){ K[0].push(p[i * 4]); K[1].push(p[i * 4 + 1]); K[2].push(p[i * 4 + 2]); }
      const med = a => { a.sort((u, v) => u - v); return a[Math.floor(a.length / 2)]; };   // Median: ein Buchstabe oder ein Grashalm am Rand färbt die Fläche nicht um
      f = '#' + K.map(a => med(a).toString(16).padStart(2, '0')).join(''); }catch(e){}
    REIHE_RAND.set(k, f); return f; }
  // Eine Tafel der Reihe als Bild. Das Foto wird NIE verzogen (Albert, 14.11.2026: „teilweise zu schlecht, verzogen“): Es behält sein Seitenverhältnis.
  // Passt es fast (bis 7 %), füllt es die Tafel; sonst steht es ganz in der Mitte, und daneben läuft die Farbe seines Randes weiter (eine ruhige Fläche,
  // kein gestreckter Bildrand). Hat der Platz eine Grundfarbe (bandenplaetze.farbe), gilt ein sauberes Schild mit dem Namen statt eines Fotos:
  // so für Tafeln ohne Foto und für Fotos, die nur einen Ausschnitt zeigen.
  function reiheTex(t){
    const k = [t.id, t.img ? t.img.src : '', t.name, t.frei ? 1 : 0, t.l, t.farbe || '', t.nr].join('|'); if(REIHE_TEX.has(k)) return REIHE_TEX.get(k);
    const H = REIHE_H, W = Math.max(80, Math.round(t.l / (t.h || .8) * H)), c = document.createElement('canvas'); c.width = W; c.height = H; const x = c.getContext('2d');
    x.imageSmoothingEnabled = true; x.imageSmoothingQuality = 'high';
    const hell = f => { const m = /^#(..)(..)(..)$/.exec(f || ''); return !m || (parseInt(m[1], 16) * .299 + parseInt(m[2], 16) * .587 + parseInt(m[3], 16) * .114) > 150; };
    // Schrift auf dem Schild: so groß wie möglich. Ein langer Name bricht an der Leerstelle nahe der Mitte in zwei Zeilen, wenn er dadurch größer wird.
    const text = (s, farbe, gr) => { const schrift = fs => `800 ${fs}px BandeT,Barlow,sans-serif`, pass = (Z, max) => { x.font = schrift(max); const w = Math.max(...Z.map(z => x.measureText(z).width)); return w > W * .88 ? max * W * .88 / w : max; };
      const T = String(s).replace(/([a-zäöüß])([A-ZÄÖÜ])/g, '$1 $2').split(/\s+/).filter(Boolean), gross = z => z.toUpperCase();   // Teile: Wörter, dazu die Naht in Namen wie „SparkassenVersicherung“
      s = gross(String(s)); let Z = [s], fs = pass(Z, H * (gr || .46));
      if(fs < H * .32 && T.length > 1){ let best = null; for(let i = 1; i < T.length; i++){ const a = gross(T.slice(0, i).join(' ')), b = gross(T.slice(i).join(' ')), d = Math.abs(a.length - b.length); if(!best || d < best.d) best = { d, Z:[a, b] }; }
        const f2 = pass(best.Z, H * .36); if(f2 > fs * 1.15){ Z = best.Z; fs = f2; } }
      x.font = schrift(fs); x.fillStyle = farbe; x.textAlign = 'center'; x.textBaseline = 'middle'; Z.forEach((z, i) => x.fillText(z, W / 2, H / 2 + (i - (Z.length - 1) / 2) * fs * 1.12 + fs * .04)); };
    const foto = !t.frei && !t.farbe && t.img && t.img.naturalWidth > 0;
    if(t.frei){ const e = H / 96; x.fillStyle = 'rgba(246,243,236,.82)'; x.fillRect(0, 0, W, H); x.strokeStyle = 'rgba(29,39,96,.7)'; x.lineWidth = 4 * e; x.setLineDash([14 * e, 9 * e]); x.strokeRect(5 * e, 5 * e, W - 10 * e, H - 10 * e); x.setLineDash([]); text('frei', 'rgba(29,39,96,.85)', .42); }
    else if(foto){ const iw = t.img.naturalWidth, ih = t.img.naturalHeight, ai = iw / ih, ab = W / H;
      if(Math.abs(ai / ab - 1) <= .07) x.drawImage(t.img, 0, 0, W, H);
      else { const f = Math.min(W / iw, H / ih), w = Math.round(iw * f), h = Math.round(ih * f), l = Math.round((W - w) / 2), o = Math.round((H - h) / 2);
        if(l > 0){ x.fillStyle = reiheRand(t.img, 'l'); x.fillRect(0, 0, l + 1, H); x.fillStyle = reiheRand(t.img, 'r'); x.fillRect(l + w - 1, 0, W - l - w + 1, H); }
        if(o > 0){ x.fillStyle = reiheRand(t.img, 'o'); x.fillRect(0, 0, W, o + 1); x.fillStyle = reiheRand(t.img, 'u'); x.fillRect(0, o + h - 1, W, H - o - h + 1); }
        x.drawImage(t.img, l, o, w, h); } }
    else { const bg = t.farbe || '#ffffff'; x.fillStyle = bg; x.fillRect(0, 0, W, H); text(String(t.name || ''), hell(bg) ? C.marine : '#ffffff'); }
    if(!t.frei && !t.farbe && t.img && !t.img.naturalWidth) return c;   // Foto lädt noch: nicht merken
    REIHE_TEX.set(k, c); return c;
  }
  function reihe(cv, o){
    const dpr = Math.min(2, window.devicePixelRatio || 1), r = cv.getBoundingClientRect();
    const Wc = Math.max(10, Math.round(r.width * dpr)), Hc = Math.max(10, Math.round(r.height * dpr)); if(cv.width !== Wc) cv.width = Wc; if(cv.height !== Hc) cv.height = Hc;
    const x = cv.getContext('2d'); x.imageSmoothingEnabled = true; x.imageSmoothingQuality = 'high';
    const T = o.tafeln || [], kx = +o.kamX || 0, d = o.abstand || 15, yaw = o.blick != null ? o.blick : .3, LIFT = .22, RAIL = 1.1, NAH = .3;
    const P = [kx - Math.sin(yaw) * d, 1.65, -Math.cos(yaw) * d], Z = [kx + .4, .6, 0];
    const sub = (a, b) => [a[0] - b[0], a[1] - b[1], a[2] - b[2]], dot = (a, b) => a[0] * b[0] + a[1] * b[1] + a[2] * b[2], norm = a => { const l = Math.hypot(...a); return a.map(v => v / l); };
    const cross = (a, b) => [a[1] * b[2] - a[2] * b[1], a[2] * b[0] - a[0] * b[2], a[0] * b[1] - a[1] * b[0]];
    const f = norm(sub(Z, P)), ri = norm(cross([0, 1, 0], f)), up = cross(f, ri), cam = Q => { const v = sub(Q, P); return [dot(v, ri), dot(v, up), dot(v, f)]; };
    const schmal = r.width < 560, breit = schmal ? 6.8 : 12.5,   /* seit 0.99.34 näher dran: am Handy füllt eine Bande von 5 m gut zwei Drittel der Breite */ cx = Wc * .5, cy = Hc * (schmal ? .5 : .5);
    let foc; { const a = cam([kx - breit / 2, LIFT, 0]), b = cam([kx + breit / 2, LIFT, 0]); foc = Wc * .96 / Math.abs(b[0] / b[2] - a[0] / a[2]); }
    const pr = Q => { const c = cam(Q); return [cx + foc * c[0] / c[2], cy - foc * c[1] / c[2], c[2]]; };
    const poly = (pts, fill) => { const Cc = pts.map(cam), out = [];
      for(let i = 0; i < Cc.length; i++){ const a = Cc[i], b = Cc[(i + 1) % Cc.length], ia = a[2] > NAH, ib = b[2] > NAH; if(ia) out.push(a);
        if(ia !== ib){ const t = (NAH - a[2]) / (b[2] - a[2]); out.push([a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t, NAH]); } }
      if(out.length < 3) return; x.beginPath(); out.forEach((c, i) => { const sx = cx + foc * c[0] / c[2], sy = cy - foc * c[1] / c[2]; i ? x.lineTo(sx, sy) : x.moveTo(sx, sy); }); x.closePath(); x.fillStyle = fill; x.fill(); };
    const linie = (A, B, farbe, dick) => { const a = cam(A), b = cam(B); if(a[2] < NAH && b[2] < NAH) return; let p = a, q = b;
      if(a[2] < NAH){ const t = (NAH - a[2]) / (b[2] - a[2]); p = [a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t, NAH]; } if(b[2] < NAH){ const t = (NAH - b[2]) / (a[2] - b[2]); q = [b[0] + (a[0] - b[0]) * t, b[1] + (a[1] - b[1]) * t, NAH]; }
      x.strokeStyle = farbe; x.lineWidth = Math.max(1, foc * dick / ((p[2] + q[2]) / 2)); x.beginPath(); x.moveTo(cx + foc * p[0] / p[2], cy - foc * p[1] / p[2]); x.lineTo(cx + foc * q[0] / q[2], cy - foc * q[1] / q[2]); x.stroke(); };
    const hz = norm([f[0], 0, f[2]]), horizont = cy - foc * dot(hz, up) / dot(hz, f), zuf = i => { const v = Math.sin(i * 127.1 + 311.7) * 43758.5453; return v - Math.floor(v); };
    const L0 = kx - 110, L1 = kx + 130;
    // Himmel und Hügel (der Himmel vom 14.11.: klar und blau)
    x.setTransform(1, 0, 0, 1, 0, 0); x.fillStyle = '#86a05e'; x.fillRect(0, 0, Wc, Hc);   // nichts vom letzten Bild darf stehen bleiben
    let g = x.createLinearGradient(0, 0, 0, horizont); g.addColorStop(0, '#5f9fe0'); g.addColorStop(.75, '#a9cdee'); g.addColorStop(1, '#dfeaf2'); x.fillStyle = g; x.fillRect(0, 0, Wc, horizont + 2);
    x.fillStyle = '#9fb48f'; x.beginPath(); x.moveTo(0, horizont + 2); for(let i = 0; i <= 60; i++){ const t = i / 60, w = (kx * .012) + t * 4.2; x.lineTo(t * Wc, horizont - Hc * .075 * (.6 + .3 * Math.sin(w * 1.7) + .16 * Math.sin(w * 3.9 + 1))); } x.lineTo(Wc, horizont + 2); x.closePath(); x.fill();
    // Gelände hinter den Banden, Weg, Bäume in Herbstfarben (Spielplatz und Wiese)
    poly([[L0, 0, .3], [L1, 0, .3], [L1, 0, 90], [L0, 0, 90]], '#86a05e');
    poly([[L0, 0, 1.2], [L1, 0, 1.2], [L1, 0, 3.4], [L0, 0, 3.4]], '#cfc6ad');
    // Zaun und Hecke hinter dem Weg
    { const A0 = pr([kx - 70, 0, 4]), A1 = pr([kx + 100, 0, 4]), B0 = pr([kx - 70, 1.5, 4]), B1 = pr([kx + 100, 1.5, 4]); if(A0[2] > NAH && A1[2] > NAH){ x.fillStyle = '#6f8a52'; x.beginPath(); x.moveTo(A0[0], A0[1]); x.lineTo(A1[0], A1[1]); x.lineTo(B1[0], B1[1]); x.lineTo(B0[0], B0[1]); x.closePath(); x.fill(); } }
    const B = []; for(let i = Math.floor((kx - 95) / 2.6); i <= Math.ceil((kx + 125) / 2.6); i++) B.push({ bx:i * 2.6 + zuf(i) * 1.8, bz:38 + zuf(i + 500) * 45, bh:6 + zuf(i + 900) * 5, br:2.6 + zuf(i + 1300) * 1.8, gr:['#7d9d70', '#a3a354', '#c08d3e', '#cfa94c', '#93703f', '#6c8a60', '#b9792f'][Math.floor(zuf(i + 77) * 7)] });
    B.sort((a, b) => b.bz - a.bz).forEach(t => { const fu = pr([t.bx, 0, t.bz]), ko = pr([t.bx, t.bh, t.bz]); if(fu[2] < NAH) return; const rr = foc * t.br / fu[2]; if(fu[0] < -rr * 2 || fu[0] > Wc + rr * 2) return;
      x.fillStyle = '#5a4a36'; x.fillRect(fu[0] - rr * .06, ko[1], rr * .12, fu[1] - ko[1]);
      x.fillStyle = t.gr; [[0, 0, 1, 1.1], [-.55, .4, .7, .72], [.6, .35, .72, .78]].forEach(([dx, dy, a, b]) => { x.beginPath(); x.ellipse(ko[0] + dx * rr, ko[1] + dy * rr, rr * a, rr * b, 0, 0, Math.PI * 2); x.fill(); }); });
    g = x.createLinearGradient(0, horizont - Hc * .16, 0, horizont + Hc * .02); g.addColorStop(0, 'rgba(226,236,240,0)'); g.addColorStop(1, 'rgba(226,236,240,.35)'); x.fillStyle = g; x.fillRect(0, horizont - Hc * .16, Wc, Hc * .18);
    // Rasen, Seitenlinie, Laufbahn, Streifen vor den Banden
    poly([[L0, 0, -70], [L1, 0, -70], [L1, 0, -8.4], [L0, 0, -8.4]], '#5c9443');
    for(let i = Math.floor(L0 / 5); i < L1 / 5; i += 2) poly([[i * 5, 0, -70], [i * 5 + 5, 0, -70], [i * 5 + 5, 0, -8.4], [i * 5, 0, -8.4]], 'rgba(255,255,255,.05)');
    poly([[L0, 0, -10.1], [L1, 0, -10.1], [L1, 0, -9.98], [L0, 0, -9.98]], 'rgba(250,250,245,.9)');
    poly([[L0, 0, -8.4], [L1, 0, -8.4], [L1, 0, -1.1], [L0, 0, -1.1]], '#b56a45');
    [-6.6, -4.8, -3].forEach(z => poly([[L0, 0, z - .03], [L1, 0, z - .03], [L1, 0, z + .03], [L0, 0, z + .03]], 'rgba(255,235,215,.16)'));
    poly([[L0, 0, -1.1], [L1, 0, -1.1], [L1, 0, .3], [L0, 0, .3]], '#7f8f4c');
    // Geländer: Pfosten alle 2,5 m und der Holm, an dem die Tafeln hängen
    const xa = Math.min(...T.map(t => t.x0), kx) - 12, xb = Math.max(...T.map(t => t.x0 + t.l), kx) + 12;
    for(let px = Math.ceil(Math.max(xa, kx - 60) / 2.5) * 2.5; px <= Math.min(xb, kx + 80); px += 2.5) linie([px, 0, .04], [px, RAIL, .04], 'rgba(235,235,230,.9)', .05);
    linie([Math.max(xa, kx - 60), RAIL, .04], [Math.min(xb, kx + 80), RAIL, .04], 'rgba(245,245,240,.95)', .06);
    // Tafeln von hinten nach vorn
    const boxen = [];
    T.slice().sort((a, b) => cam([b.x0 + b.l / 2, 0, 0])[2] - cam([a.x0 + a.l / 2, 0, 0])[2]).forEach(t => {
      const h = t.h || .8, x0 = t.x0, x1 = t.x0 + t.l, a0 = cam([x0, 0, 0]), a1 = cam([x1, 0, 0]); if(a0[2] < NAH && a1[2] < NAH) return;
      const ol = pr([x0, LIFT + h, 0]), or = pr([x1, LIFT + h, 0]), ul = pr([x0, LIFT, 0]), ur = pr([x1, LIFT, 0]); if(Math.max(or[0], ur[0]) < -40 || Math.min(ol[0], ul[0]) > Wc + 40) return;
      if(!t.frei) poly([[x0, 0, -.02], [x1, 0, -.02], [x1 + .2, 0, -.5], [x0 + .1, 0, -.5]], 'rgba(30,40,20,.2)');
      const tex = reiheTex(t), breitPx = Math.abs(ur[0] - ul[0]), n = Math.max(6, Math.ceil(breitPx / (2 * dpr)));
      for(let k = 0; k < n; k++){ const u0 = k / n, u1 = (k + 1) / n, p0 = pr([x0 + u0 * t.l, LIFT + h, 0]), p1 = pr([x0 + u1 * t.l, LIFT + h, 0]), q0 = pr([x0 + u0 * t.l, LIFT, 0]); if(p0[2] < NAH || p1[2] < NAH) continue;
        x.drawImage(tex, u0 * tex.width, 0, Math.max(1, (u1 - u0) * tex.width), tex.height, p0[0], p0[1], p1[0] - p0[0] + .6, q0[1] - p0[1]); }
      x.strokeStyle = t.an ? C.orange : 'rgba(0,0,0,.22)'; x.lineWidth = t.an ? Math.max(3, dpr * 2.5) : Math.max(1, dpr * .7); x.beginPath(); x.moveTo(ol[0], ol[1]); x.lineTo(or[0], or[1]); x.lineTo(ur[0], ur[1]); x.lineTo(ul[0], ul[1]); x.closePath(); x.stroke();
      // Nummer über der Tafel
      const m = pr([x0 + t.l / 2, LIFT + h + .5, 0]); if(m[2] > NAH && t.nr != null){ const rr = Math.max(9 * dpr, Math.min(17 * dpr, foc * .34 / m[2]));
        x.fillStyle = t.an ? C.orange : (t.frei ? 'rgba(255,255,255,.92)' : C.marine); x.beginPath(); x.arc(m[0], m[1], rr, 0, Math.PI * 2); x.fill(); if(t.frei && !t.an){ x.strokeStyle = C.marine; x.lineWidth = Math.max(1, dpr); x.stroke(); }
        if(t.ring){ x.strokeStyle = '#fff'; x.lineWidth = rr * .5; x.beginPath(); x.arc(m[0], m[1], rr + rr * .18, 0, Math.PI * 2); x.stroke(); x.strokeStyle = t.ring; x.lineWidth = rr * .3; x.beginPath(); x.arc(m[0], m[1], rr + rr * .18, 0, Math.PI * 2); x.stroke(); }
        x.fillStyle = t.frei && !t.an ? C.marine : '#fff'; x.font = `800 ${rr * 1.05}px BandeT,Barlow,sans-serif`; x.textAlign = 'center'; x.textBaseline = 'middle'; x.fillText(String(t.nr), m[0], m[1] + rr * .06); }
      boxen.push({ id:t.id, x:Math.min(ol[0], ul[0]) / dpr, y:Math.min(ol[1], or[1]) / dpr, w:(Math.max(or[0], ur[0]) - Math.min(ol[0], ul[0])) / dpr, h:(Math.max(ul[1], ur[1]) - Math.min(ol[1], or[1])) / dpr });
    });
    const m0 = pr([kx, LIFT, 0]), m1 = pr([kx + 1, LIFT, 0]);
    return { boxen, pxm:Math.abs(m1[0] - m0[0]) / dpr };
  }

  return { C, FORMATE, LAYOUTS, BESCHNITT, schriften, vorbereiten, layout, malen, bild, flach, szene, reihe, reiheTex, pdf, png, svg, akzent, kontrast, lum, mess, einpassen, sauber, laden };
})();

/* =====================================================================
   Beta 0.80 · Bandencreator im Partner-Bereich (Reiter „Bandencreator“)
   Aus Logo, Firmenname, Slogan, Web und Telefon eines Partners entsteht mit einem Tipp eine druckfertige Bande.
   - Zwei Stile: Partner-CI (weiße Bande, Marine, Logo einfarbig; seit 0.99.38 ohne Vereinsabsender) und Original (Logo in seinen Farben, Firmenfarbe als Leiste)
   - Formate 3, 4, 5 (heutiges Maß) und 6 m mal 80 cm, dazu das Feld der Partnerwand (2 m mal 1 m)
   - Vorschläge zum Durchwischen (Logo links, Logo groß, mit Slogan), alles im Formular nachjustierbar
   - Live am Platz (Bandenreihe in Perspektive, Nachbarn im Einheitslook) oder flach als Druckansicht mit Maßen
   - Export: PDF in Originalgröße mit 2 cm Beschnitt und Schnittmarken, PNG, SVG, Bild vom Platz zum Teilen
   - Bandenplan: Plätze rund um den Platz frei, reserviert oder belegt. Belegte sind gesperrt, freigeben kann nur ein Admin.
   - Banden je Partner speichern: Entwurf, zum Druck freigegeben (Admin), gedruckt (Admin)
   Gestaltung und Druckdaten: bandenlib.js (BANDE). Daten: 115_banden.sql, Logos aus 114 (trikot_logos).
   ===================================================================== */
const BC = { d:null, laedt:null, ansicht:'gestalten', sicht:'platz', raster:true, eigen:null, logoKey:null, firmaKey:'', platz:null, entwurf:null, tok:0, res:null, lay:null, nachbarn:null, nbFormat:null, vorT:0, err:null,
  spec:{ format:'300x80', stil:'ci', layout:'links', firma:'', name:'', claim:'', web:'', telefon:'', branche:'', kontakt:true, nameAn:null, logoFarbe:'marine', akzent:null } };
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
  ((BC.d && BC.d.logos) || []).forEach(l => { if(!F.some(f => f.sponsor && f.sponsor === l.sponsor) && !F.some(f => f.firma.toLowerCase() === l.firma.toLowerCase())) F.push({ key:'l:' + l.id, firma:l.firma, logo:l.id }); });
  return F; }
function bcLogoFuer(f){ const L = (BC.d && BC.d.logos) || []; return L.find(l => l.bild && f.sponsor && l.sponsor === f.sponsor) || L.find(l => l.bild && l.firma.toLowerCase() === f.firma.toLowerCase()) || (f.logo ? L.find(l => l.id === f.logo && l.bild) : null) || null; }
// Mit einem Tipp: Firma wählen füllt Name, Web, Telefon, Branche und das Logo
function bcFirmaWaehlen(key){
  const f = bcFirmen().find(x => x.key === key); BC.firmaKey = key; if(!f) return;
  const s = BC.spec; s.firma = f.firma; s.name = f.firma; s.web = f.web || ''; s.telefon = f.telefon || ''; s.branche = f.branche || ''; s.claim = ''; s.nameAn = null; s.akzent = null;
  BC.sponsor = f.sponsor || null; const l = bcLogoFuer(f); BC.logoKey = l ? l.id : null; BC.entwurf = null;
}

// Ohne gewählte Firma: neutraler Anfang. Kein Name, kein Kontakt und vor allem kein Logo einer anderen Firma bleiben stehen (0.99.24).
// Albert: „Es stand immer derselbe fremde Name mit drauf.“ Der Creator fing mit dem ersten Partner samt Logo an, und das Logo blieb,
// wenn man einen anderen Namen eintippte oder einen Platz wählte. Ein selbst hochgeladenes Logo bleibt.
function bcFirmaLeer(name){ const s = BC.spec; BC.firmaKey = ''; BC.sponsor = null; BC.entwurf = null; s.firma = s.name = name || 'Deine Firma'; s.web = ''; s.telefon = ''; s.branche = ''; s.claim = ''; s.nameAn = null; s.akzent = null;
  if(BC.logoKey !== 'eigen') BC.logoKey = null; }

/* ---------- Oberfläche ---------- */
async function bcRender(B){
  if(B.querySelector('.pz-bc') && BC.d){ bcAnsichtZeigen(); return; }
  B.innerHTML = `<div class="pz pz-tc pz-bc"><div class="pz-tc-kopf"><span class="pz-hand">Rund um unseren Platz</span><h2>Bandencreator</h2>
    <p>Logo, Name und Kontakt rein, fertig ist die Bande. Alle Banden folgen denselben Regeln, damit unser Platz einheitlich und ruhig aussieht.</p></div>
    <div class="pz-bc-sw"><div class="pz-tc-seg" id="bcAnsicht" role="group" aria-label="Ansicht"><button type="button" data-bcansicht="gestalten">Gestalten</button><button type="button" data-bcansicht="plan">Bandenplan</button></div></div>
    <div id="bcInhalt"><div class="pz-tc-buehne pz-bc-laden"><div class="pz-tc-laden"><i></i>Bandencreator wird geladen …</div></div></div></div>`;
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
          <label class="pz-tc-firma"><span>Name auf der Bande</span><input type="text" id="bcName" maxlength="80" autocomplete="organization"></label>
          <label class="pz-tc-firma"><span>Slogan</span><input type="text" id="bcClaim" maxlength="80" placeholder="Kurz und klar, höchstens acht Wörter"></label>
          <label class="pz-tc-firma"><span>Website</span><input type="text" id="bcWeb" maxlength="80" inputmode="url" autocomplete="url"></label>
          <label class="pz-tc-firma"><span>Telefon</span><input type="text" id="bcTel" maxlength="40" inputmode="tel" autocomplete="tel"></label></div>
        <div class="pz-bc-schalter"><label class="pz-bc-cb"><input type="checkbox" id="bcNameAn"><span>Firmenname zeigen</span></label><label class="pz-bc-cb"><input type="checkbox" id="bcKontakt"><span>Kontaktzeile</span></label></div></section>
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
  [['#bcName', 'name'], ['#bcClaim', 'claim'], ['#bcWeb', 'web'], ['#bcTel', 'telefon']].forEach(([q, k]) => { $(q).oninput = e => { s[k] = e.target.value; if(k === 'name' && !BC.firmaKey) s.firma = e.target.value; bcNeu(); }; });
  $('#bcNameAn').onchange = e => { s.nameAn = e.target.checked; bcNeu(); };
  $('#bcKontakt').onchange = e => { s.kontakt = e.target.checked; bcNeu(); };
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
  v('#bcName', s.name); v('#bcClaim', s.claim); v('#bcWeb', s.web); v('#bcTel', s.telefon);
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
      : `<span class="pz-tc-leise">Firmenfarbe für die Leiste</span><div class="pz-bc-farben" role="group" aria-label="Firmenfarbe">${[null].concat(farben.filter(f => !f.hell).map(f => f.hex).slice(0, 4)).concat(['#1d2760']).filter((x, i, a) => a.indexOf(x) === i).map(h => {
          const an2 = (s.akzent || null) === h, farbe = [h, auto, '#1d2760'].find(x => /^#[0-9a-fA-F]{6}$/.test(x || '')); return `<button type="button" data-bcak="${h || ''}" class="${an2 ? 'on' : ''}" aria-pressed="${an2}" aria-label="${h ? 'Farbe ' + h : 'Automatisch aus dem Logo'}"><i style="background:${farbe}"></i>${h ? '' : '<span>Auto</span>'}</button>`; }).join('')}</div>`;
    fein.querySelectorAll('[data-bclf]').forEach(b => b.onclick = () => { s.logoFarbe = b.dataset.bclf; bcNeu(true); });
    fein.querySelectorAll('[data-bcak]').forEach(b => b.onclick = () => { s.akzent = b.dataset.bcak || null; bcNeu(true); }); }
  const na = P.querySelector('#bcNameAn'), ko = P.querySelector('#bcKontakt');
  if(na){ const logo = BC.res && BC.res.logo; na.checked = s.nameAn != null ? s.nameAn : !logo; }
  if(ko) ko.checked = s.kontakt !== false;
}

/* ---------- Zeichnen ---------- */
function bcSpecVoll(){ const l = bcLogo(); return Object.assign({}, BC.spec, { logo:l ? l.bild : null, logoGewollt:!!l }); }
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
  if(i.lesbar.name) teile.push(`großer Text lesbar aus ${i.lesbar.name} m`); else if(i.lesbar.claim) teile.push(`Slogan lesbar aus ${i.lesbar.claim} m`);
  else { const lg = BC.lay.ops.find(o => o.rolle === 'logo'); if(lg) teile.push(`Logo ${Math.round(lg.h / 10)} cm hoch`); }
  if(i.lesbar.kontakt) teile.push(`Kontakt aus ${i.lesbar.kontakt} m`);
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
  H.querySelectorAll('[data-bclogo]').forEach(b => b.onclick = () => { BC.logoKey = b.dataset.bclogo || null; BC.spec.akzent = null; BC.spec.nameAn = null; bcLogosZeigen(); bcNeu(true); });
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
    BC.eigen = { id:null, firma:BC.spec.firma || BC.spec.name || '', bild, farben:a.farben, neu:true }; BC.logoKey = 'eigen'; BC.spec.akzent = null; BC.spec.nameAn = null;
    bcLogosZeigen(); bcNeu(true); kToast(a.hintergrundEntfernt ? 'Hintergrund entfernt. Die Bande ist schon fertig.' : 'Logo ist drauf.');
  }catch(x){ kToast(x.message || 'Das Logo lässt sich nicht lesen.'); }
}
async function bcLogoSichern(firma){
  const l = bcLogo(); if(!l) return null; if(l.id) return l.id;
  const r = await bcRpc('trikot_logo_speichern', { p:{ firma:firma || l.firma, bild:l.bild, farben:(l.farben || []).slice(0, 8), sponsor:BC.sponsor || null } });
  l.id = r.id; l.neu = false; BC.d.logos = (BC.d.logos || []).filter(x => x.id !== r.id).concat([r]); BC.eigen = null; BC.logoKey = r.id; return r.id;
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
function bcVorschauUrl(){ try{ const ppm = 640 / BC.lay.W, c = BANDE.bild(BC.lay, BC.res, ppm, false); return c.toDataURL('image/jpeg', .85); }catch(e){ return null; } }
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
    try{ const logo = await bcLogoSichern(fa), platz = M.querySelector('#bcDlgPlatz').value || null;
      const inhalt = { name:s.name, claim:s.claim, web:s.web, telefon:s.telefon, branche:s.branche, kontakt:s.kontakt !== false, nameAn:s.nameAn, logoFarbe:s.logoFarbe, akzent:s.akzent };
      const r = await bcRpc('banden_entwurf_speichern', { p:{ id:gesperrt ? null : BC.entwurf, firma:fa, sponsor:BC.sponsor || null, logo, format:s.format, stil:s.stil, layout:s.layout, inhalt, vorschau:bcVorschauUrl(), platz } });
      BC.entwurf = r.id; BC.platz = r.platz || null; closeOverlay(); await bcLaden(true); bcListe(); bcLogosZeigen();
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
  Object.assign(BC.spec, { format:e.format, stil:e.stil, layout:e.layout, firma:e.firma, name:i.name || e.firma, claim:i.claim || '', web:i.web || '', telefon:i.telefon || '', branche:i.branche || '', kontakt:i.kontakt !== false, nameAn:i.nameAn == null ? null : !!i.nameAn, logoFarbe:['marine', 'schwarz'].includes(i.logoFarbe) ? i.logoFarbe : 'marine', akzent:/^#[0-9a-fA-F]{6}$/.test(i.akzent || '') ? i.akzent : null });
  BC.logoKey = e.logo || null; BC.entwurf = e.id; BC.platz = e.platz || null; BC.sponsor = e.sponsor || null;
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
