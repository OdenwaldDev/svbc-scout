/* =====================================================================
   Beta 0.80/0.81 · Logo-Werkstatt (gemeinsam für Trikot- und Bandencreator)
   Ein Partnerlogo (PNG, JPG, SVG, Data-URL) wird im Browser analysiert und aufbereitet:
   - Hintergrund weg: weiße oder einfarbige Flächen am Rand werden durchsichtig (Flutfüllung vom Rand aus)
   - Zuschnitt auf das Logo (ohne leeren Rand)
   - Originalfarben: die wichtigsten Farben mit Anteil, hell oder dunkel, empfohlene Variante je Untergrund
   - Varianten: original, weiss, schwarz, farbe (beliebige Einfarbigkeit, z. B. Vereinsblau)
     Bei weiss/schwarz werden helle Innenflächen (z. B. weiße Schrift im farbigen Kasten) ausgespart, damit Details bleiben.
   Alles passiert auf dem Gerät, nichts verlässt den Browser.
   ===================================================================== */
const LOGO = (() => {
  const cache = new Map();
  function laden(src){
    if(cache.has(src)) return cache.get(src);
    const p = new Promise((ok, nein) => { const i = new Image(); i.decoding = 'async';
      if(!/^data:|^blob:/.test(src)) i.crossOrigin = 'anonymous';
      i.onload = () => ok(i); i.onerror = () => nein(new Error('Logo lässt sich nicht laden')); i.src = src; });
    cache.set(src, p); p.catch(() => cache.delete(src)); return p;
  }
  function leinwand(w, h){ const c = document.createElement('canvas'); c.width = Math.max(1, w | 0); c.height = Math.max(1, h | 0); return c; }
  function hex(r, g, b){ return '#' + [r, g, b].map(x => x.toString(16).padStart(2, '0')).join(''); }
  function lum(r, g, b){ const f = v => { v /= 255; return v <= .03928 ? v / 12.92 : Math.pow((v + .055) / 1.055, 2.4); }; return .2126 * f(r) + .7152 * f(g) + .0722 * f(b); }
  // Bild in eine Arbeitsfläche (höchstens 1200 px lange Seite, SVG ohne Maß bekommt 800 px)
  function raster(img, max = 1200){
    let w = img.naturalWidth || img.width || 800, h = img.naturalHeight || img.height || 400;
    const s = Math.min(1, max / Math.max(w, h)); w = Math.round(w * s); h = Math.round(h * s);
    const c = leinwand(w, h), x = c.getContext('2d', { willReadFrequently:true }); x.drawImage(img, 0, 0, w, h); return c;
  }
  // Hintergrund vom Rand her entfernen, wenn der Rand einfarbig ist (weiß, hellgrau oder eine Flächenfarbe)
  function freistellen(c, tol = 38){
    const x = c.getContext('2d', { willReadFrequently:true }), { width:w, height:h } = c, d = x.getImageData(0, 0, w, h), p = d.data;
    const randDurchsichtig = (() => { let n = 0, t = 0; for(let i = 0; i < w; i++){ [i, (h - 1) * w + i].forEach(k => { t++; if(p[k * 4 + 3] < 20) n++; }); } return n / t > .6; })();
    if(randDurchsichtig) return { c, entfernt:false };
    // häufigste Randfarbe
    const zaehl = new Map(); const rand = []; for(let i = 0; i < w; i++){ rand.push(i, (h - 1) * w + i); } for(let j = 0; j < h; j++){ rand.push(j * w, j * w + w - 1); }
    rand.forEach(k => { const q = ((p[k * 4] >> 4) << 8) | ((p[k * 4 + 1] >> 4) << 4) | (p[k * 4 + 2] >> 4); zaehl.set(q, (zaehl.get(q) || 0) + 1); });
    let best = 0, bq = 0; zaehl.forEach((v, q) => { if(v > best){ best = v; bq = q; } });
    if(best / rand.length < .55) return { c, entfernt:false };
    let br = 0, bg = 0, bb = 0, bn = 0; rand.forEach(k => { const q = ((p[k * 4] >> 4) << 8) | ((p[k * 4 + 1] >> 4) << 4) | (p[k * 4 + 2] >> 4); if(q === bq){ br += p[k * 4]; bg += p[k * 4 + 1]; bb += p[k * 4 + 2]; bn++; } });
    br /= bn; bg /= bn; bb /= bn;
    const nah = k => Math.abs(p[k * 4] - br) + Math.abs(p[k * 4 + 1] - bg) + Math.abs(p[k * 4 + 2] - bb) < tol * 1.6;
    const weg = new Uint8Array(w * h), st = []; rand.forEach(k => { if(nah(k)){ weg[k] = 1; st.push(k); } });
    while(st.length){ const k = st.pop(), xx = k % w, yy = (k / w) | 0;
      [[1, 0], [-1, 0], [0, 1], [0, -1]].forEach(([dx, dy]) => { const nx = xx + dx, ny = yy + dy; if(nx < 0 || ny < 0 || nx >= w || ny >= h) return; const n = ny * w + nx; if(!weg[n] && nah(n)){ weg[n] = 1; st.push(n); } }); }
    // weiche Kante: Pixel neben dem Hintergrund halb durchsichtig
    for(let k = 0; k < w * h; k++){ if(weg[k]){ p[k * 4 + 3] = 0; continue; }
      const xx = k % w, yy = (k / w) | 0; let n = 0; if(xx > 0 && weg[k - 1]) n++; if(xx < w - 1 && weg[k + 1]) n++; if(yy > 0 && weg[k - w]) n++; if(yy < h - 1 && weg[k + w]) n++;
      if(n) p[k * 4 + 3] = Math.min(p[k * 4 + 3], 255 - n * 45); }
    x.putImageData(d, 0, 0); return { c, entfernt:true, hintergrund:hex(br | 0, bg | 0, bb | 0) };
  }
  function zuschneiden(c, pad = .03){
    const x = c.getContext('2d', { willReadFrequently:true }), { width:w, height:h } = c, p = x.getImageData(0, 0, w, h).data;
    let x0 = w, y0 = h, x1 = -1, y1 = -1;
    for(let y = 0; y < h; y++) for(let i = 0; i < w; i++){ if(p[(y * w + i) * 4 + 3] > 24){ if(i < x0) x0 = i; if(i > x1) x1 = i; if(y < y0) y0 = y; if(y > y1) y1 = y; } }
    if(x1 < 0) return c;
    const m = Math.round(Math.max(x1 - x0, y1 - y0) * pad); x0 = Math.max(0, x0 - m); y0 = Math.max(0, y0 - m); x1 = Math.min(w - 1, x1 + m); y1 = Math.min(h - 1, y1 + m);
    const n = leinwand(x1 - x0 + 1, y1 - y0 + 1); n.getContext('2d').drawImage(c, x0, y0, n.width, n.height, 0, 0, n.width, n.height); return n;
  }
  // Farben zählen (grob in 4-Bit je Kanal), nur sichtbare Pixel
  function farben(c){
    const p = c.getContext('2d', { willReadFrequently:true }).getImageData(0, 0, c.width, c.height).data, m = new Map(); let n = 0;
    const schritt = Math.max(1, Math.floor(c.width * c.height / 60000));
    for(let k = 0; k < p.length / 4; k += schritt){ if(p[k * 4 + 3] < 128) continue; n++;
      const q = ((p[k * 4] >> 4) << 8) | ((p[k * 4 + 1] >> 4) << 4) | (p[k * 4 + 2] >> 4); const e = m.get(q) || { n:0, r:0, g:0, b:0 }; e.n++; e.r += p[k * 4]; e.g += p[k * 4 + 1]; e.b += p[k * 4 + 2]; m.set(q, e); }
    let L = [...m.values()].map(e => ({ r:e.r / e.n | 0, g:e.g / e.n | 0, b:e.b / e.n | 0, n:e.n }));
    // ähnliche Farben zusammenfassen
    const zus = []; L.sort((a, b) => b.n - a.n).forEach(f => { const z = zus.find(g => Math.abs(g.r - f.r) + Math.abs(g.g - f.g) + Math.abs(g.b - f.b) < 60); if(z){ z.n += f.n; } else zus.push({ ...f }); });
    return zus.filter(f => f.n / Math.max(1, n) > .015).slice(0, 6).map(f => ({ hex:hex(f.r, f.g, f.b), anteil:Math.round(f.n / Math.max(1, n) * 100), hell:lum(f.r, f.g, f.b) > .55 }));
  }
  // Einfarbig (0.81): Abstand zu Weiß als weiche Deckung. Farbiges und Dunkles wird voll, Weißes im Logo fällt weg (bleibt als Aussparung),
  // Kanten bleiben glatt. Ist das Logo selbst überwiegend hell (weiße Schrift), wird alles Sichtbare eingefärbt.
  const sst = (a, b, x) => { const t = Math.max(0, Math.min(1, (x - a) / (b - a))); return t * t * (3 - 2 * t); };
  function einfarbig(c, farbe){
    const n = leinwand(c.width, c.height), x = n.getContext('2d', { willReadFrequently:true }); x.drawImage(c, 0, 0);
    const d = x.getImageData(0, 0, n.width, n.height), p = d.data;
    let hell = 0, dunkel = 0; for(let k = 0; k < p.length; k += 4){ if(p[k + 3] < 128) continue; if(lum(p[k], p[k + 1], p[k + 2]) > .78) hell++; else dunkel++; }
    const nurHell = hell / Math.max(1, hell + dunkel) >= .6;
    const [r, g, b] = [1, 3, 5].map(i => parseInt(farbe.slice(i, i + 2), 16));
    for(let k = 0; k < p.length; k += 4){ const a = p[k + 3] / 255; if(!a){ continue; }
      let deck = a;
      if(!nurHell){ const m = Math.min(p[k], p[k + 1], p[k + 2]) / 255 * a + (1 - a); deck = sst(.1, .42, 1 - m); }
      p[k] = r; p[k + 1] = g; p[k + 2] = b; p[k + 3] = Math.round(deck * 255); }
    x.putImageData(d, 0, 0); return n;
  }
  // Mitgelieferte Logos (kit/logos/name.png) haben eine von Hand geprüfte weiße Fassung unter kit/logos/weiss/name.png
  function weissDatei(src){ const m = /^(.*?)(kit\/logos\/)([a-z0-9-]+)\.png(\?.*)?$/.exec(String(src || '')); return m ? m[1] + m[2] + 'weiss/' + m[3] + '.png' : null; }
  const merk = new Map();
  // Aufbereiten: freistellen, zuschneiden, analysieren. Ergebnis wird je Quelle gemerkt.
  async function aufbereiten(src){
    if(merk.has(src)) return merk.get(src);
    const pr = (async () => {
      const img = await laden(src); const r = raster(img); const f = freistellen(r); const c = zuschneiden(f.c);
      const F = farben(c), dunkelAnteil = F.filter(x => !x.hell).reduce((s, x) => s + x.anteil, 0);
      return { quelle:src, c, breite:c.width, hoehe:c.height, seiten:c.width / Math.max(1, c.height), farben:F, hintergrundEntfernt:f.entfernt, hintergrund:f.hintergrund || null,
        hell:dunkelAnteil < 35, empfehlung: dunkelAnteil < 35 ? 'auf dunklem Grund im Original, sonst weiß' : 'auf hellem Grund im Original, auf Farbe weiß' };
    })();
    merk.set(src, pr); pr.catch(() => merk.delete(src)); return pr;
  }
  // Variante als Leinwand: original | weiss | schwarz | farbe:#rrggbb
  async function variante(src, art = 'original'){
    const a = await aufbereiten(src);
    if(art === 'original') return a.c;
    const k = art + '|' + src; if(merk.has(k)) return merk.get(k);
    const wd = art === 'weiss' && weissDatei(src);
    if(wd){ try{ const w = (await aufbereiten(wd)).c; merk.set(k, w); return w; }catch(e){ /* sonst selbst rechnen */ } }
    const farbe = art === 'weiss' ? '#ffffff' : art === 'schwarz' ? '#111111' : (art.startsWith('farbe:') ? art.slice(6) : '#ffffff');
    const c = einfarbig(a.c, farbe); merk.set(k, c); return c;
  }
  async function alsDataUrl(src, art, max = 1024){
    const c = await variante(src, art); const s = Math.min(1, max / Math.max(c.width, c.height));
    if(s >= 1) return c.toDataURL('image/png'); const n = leinwand(c.width * s, c.height * s); n.getContext('2d').drawImage(c, 0, 0, n.width, n.height); return n.toDataURL('image/png');
  }
  // Datei vom Gerät (input type=file) als Data-URL, höchstens 2 MB
  function dateiLesen(f){ return new Promise((ok, nein) => { if(!f) return nein(new Error('Keine Datei'));
    if(!/^image\/(png|jpeg|webp|svg\+xml)$/.test(f.type)) return nein(new Error('Bitte ein Bild (PNG, JPG, WebP oder SVG)'));
    if(f.size > 2 * 1024 * 1024) return nein(new Error('Das Logo ist größer als 2 MB'));
    const r = new FileReader(); r.onload = () => ok(r.result); r.onerror = () => nein(new Error('Datei lässt sich nicht lesen')); r.readAsDataURL(f); }); }
  return { laden, aufbereiten, variante, alsDataUrl, dateiLesen, lum, hex };
})();
