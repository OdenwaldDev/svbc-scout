/* SV/BSC Scout v3 – Service Worker (speichert nur die App-Hülle, nie Spielerdaten)
   - App-Seite: erst Netz (max. 4 s), sonst gespeicherte Version → startet auch im Funkloch
   - Icons/Wappen/Chart-Bibliothek: aus dem Speicher, im Hintergrund aufgefrischt
   - Sync (Make) und version.json laufen NIE über den Speicher */
const BUILD = 'beta-0.99.152';
const CACHE = 'svbc-scout-' + BUILD;
const TEILE = /*__TEILE__*/{"app":{"sha":"5fdc6cf7661f9bdbe22bf3f03e4b7d0d1403f3d311d8ad1b7fa89d1741440ab3","n":5843968,"teile":[["92155bbcffa19e43ab9cf38c",119605],["c48f4115c028a27f397b7a52",65658],["e0e78eefb31e2a72c794550e",141382],["32d068bab6f20e6465911f90",63294],["c2c5ed0f20d5fc8ce0bd10bc",135056],["01ca4cf5e0f1d5a2e63440a4",56918],["100ea28aaa86325ff242946c",99788],["c01909b296f06f45cb8e235d",82508],["2cb7f39d0b484525c20d0be4",132305],["c1c4bc4b972ebfe3db50e421",55922],["994f7a211c883a4fa9c58b29",155447],["b0713f9e80c1dcd91ba8f662",71441],["b25a9c3bd91ab2530fa35d8c",90672],["9c7623041ee60576ca38f9a2",206859],["035cf35ee185e1ef6ad5c31d",97468],["81604afcc141a2cf6eddb4f7",77562],["29506803dfb846fb708e07b0",129807],["9a4d6ed6c78ef616ebca6998",55077],["00071a1d395638c1f945d920",79368],["2fc96a601d2fb14c587401f0",69602],["bcee0d81600f9b79c625ec8a",147985],["1bde1d90ec2c3cec80c6c08e",262152],["d3d7324faa125bbd45c23a57",120104],["314c00ee3f60aaece9fbdc2b",123547],["40a0378c289bea72a80fdeb8",96659],["0d6f43dcd35ad6fe8d89f54b",152108],["a1cab4bdf2c7eff3d9afd79b",68314],["820087d6a6f13f95ad4061b8",60645],["711d4a4f0b71cf939df96a3a",210372],["c977c12049b23c4bf50bf711",58709],["5f10502300aa71b58394a656",82596],["6e99e72a1e461476d0c840a2",175807],["d15bf28801391074599d0220",84402],["90f0a26317fcbc0de8964d20",53029],["54e29a9f26e606c53936d9a7",52823],["9b5ef3f05cb48a519d988757",63631],["93a238d00edf980b3fc06460",196087],["79bc0adaa3cce3571329c67a",94827],["ac21f2532ecd465e8e1ef0d5",58829],["87db4b64c35fa535224ac8ed",95698],["5ff3ae542f5899cf93731b40",262184],["81ded7bba8d5654ba84b4a12",156125],["a21109d03d035b385d1e4add",70958],["6ecaf16a57e907b33caa26d8",303540],["e877da78148a8ac45f8dc4fe",71820],["b13719109faa6b08440dd138",49623],["ba3f03a4f0a57ea6c376ab43",105497],["7cf89d813bb800cff8808560",58449],["ddd40f3d11ea112866df56d5",75363],["986d8b86aa32662bb9a2198b",96285],["2aaa84f5ab13c28bbec87c90",162453],["76303d6f808b25200edd53b4",187608]]},"fest":{"vendor/supabase.js":"dff1e545f4f35bd42895cd6f","icons.js":"2b264497e7cfbe36c6672421","boot.js":"02d55ccd67d2449ac33a8248","vendor/chart.umd.min.js":"81ffafe13c37e1b25793b020"}}/*__ENDE__*/;   /* vom Build: Prüfsummen, siehe „Update in Teilen“ unten */
const fv = p => './' + p + '?v=' + (TEILE && TEILE.fest && TEILE.fest[p] ? TEILE.fest[p].slice(0, 12) : BUILD);   /* feste Datei: Prüfsumme statt Version in der Adresse */
const SHELL = ['./', './manifest.webmanifest', './icon-192.png', './icon-512.png', './apple-touch-icon.png', './favicon-64.png', './crest.svg', './logo.png',
  './fonts/inter-var.woff2', './fonts/barlowc-700.woff2', fv('vendor/supabase.js'), fv('icons.js'), fv('boot.js'), './app.js?v=' + BUILD, fv('vendor/chart.umd.min.js')];
const PAGE_KEY = './';

/* ---------- Update in Teilen (Beta 0.99.44, v3/tools/teile.py) ----------
   Der Build schreibt oben (TEILE) die Prüfsummen hinein: app.js zerlegt in Stücke, dazu die festen Dateien der Hülle.
   Beim Update holt dieser Service Worker nur die Stücke, die es in der Vorversion nicht gab, setzt app.js aus
   der alten Datei und den neuen Stücken zusammen, prüft die Prüfsumme der ganzen Datei und legt sie in den
   Speicher. Die Seite lädt weiter genau eine Datei app.js. Geht dabei irgendetwas schief, wird wie früher die
   ganze Datei geladen. */
const APP_KEY = './app.js?v=' + BUILD;
const TEILE_KEY = './__teile.json';

async function teileAlt() {                     /* Speicher der Vorversion mit ihrer Teileliste */
  if (!TEILE) return null;
  try {
    for (const k of await caches.keys()) {
      if (k === CACHE || !k.startsWith('svbc-scout-')) continue;
      const c = await caches.open(k), m = await c.match(TEILE_KEY); if (!m) continue;
      const j = await m.json(); if (j && typeof j.build === 'string') return { c, j };
    }
  } catch (_) {}
  return null;
}
async function teileApp(c, alt) {               /* true: app.js liegt geprüft im Speicher */
  if (!TEILE || !TEILE.app || !self.crypto || !crypto.subtle) return false;
  let blob = null; const wo = {};
  if (alt && alt.j.app && Array.isArray(alt.j.app.teile)) {
    const r = await alt.c.match('./app.js?v=' + alt.j.build);
    if (r) { blob = await r.blob(); let p = 0; alt.j.app.teile.forEach(t => { wo[t[0]] = [p, p + t[1]]; p += t[1]; }); if (p !== blob.size) blob = null; }
  }
  let ganz;
  if (blob) {
    const st = await Promise.all(TEILE.app.teile.map(async t => {
      const w = wo[t[0]]; if (w && w[1] - w[0] === t[1]) return blob.slice(w[0], w[1]);
      const r = await fetch(new Request('./t/' + t[0] + '.js', { cache: 'no-store' })); if (!r.ok) throw new Error('Teil fehlt');
      const b = await r.blob(); if (b.size !== t[1]) throw new Error('Teil hat die falsche Größe'); return b;
    }));
    ganz = new Blob(st, { type: 'text/javascript' });
  } else {                                      /* keine Vorversion mit Teileliste: die ganze Datei, wenn möglich aus dem Zwischenspeicher des Browsers */
    const r = await fetch(new Request(APP_KEY)); if (!r.ok) return false;
    ganz = await r.blob();
  }
  if (ganz.size !== TEILE.app.n) throw new Error('Größe passt nicht');
  const h = Array.from(new Uint8Array(await crypto.subtle.digest('SHA-256', await ganz.arrayBuffer())), x => x.toString(16).padStart(2, '0')).join('');
  if (h !== TEILE.app.sha) throw new Error('Prüfsumme passt nicht');
  await c.put(APP_KEY, new Response(ganz, { status: 200, headers: { 'content-type': 'text/javascript; charset=utf-8', 'content-length': String(ganz.size) } }));
  return true;
}
async function teileFest(c, u) {                /* true: feste Datei unverändert aus dem Speicher einer Vorversion übernommen */
  if (!TEILE || !TEILE.fest || !Object.keys(TEILE.fest).some(p => u === fv(p))) return false;
  const r = await caches.match(u); if (!r) return false;
  await c.put(u, r); return true;
}
function teileSicher(url) {                     /* Adresse, deren Inhalt die Prüfsumme festlegt: aus dem Speicher, ohne Nachfrage im Netz */
  if (!TEILE) return false;
  const sc = new URL(self.registration.scope); if (url.origin !== sc.origin || !url.pathname.startsWith(sc.pathname)) return false;
  const p = url.pathname.slice(sc.pathname.length), v = url.searchParams.get('v');
  if (p === 'app.js') return !!TEILE.app && v === BUILD;
  return !!(TEILE.fest && TEILE.fest[p]) && v === TEILE.fest[p].slice(0, 12);
}
async function ausSpeicher(req) {
  const c = await caches.open(CACHE);
  const hit = await c.match(req); if (hit) return hit;
  const r = await fetch(req); if (r && r.ok) c.put(req, r.clone()); return r;
}

self.addEventListener('install', e => {
  e.waitUntil((async () => {
    const c = await caches.open(CACHE);
    const alt = await teileAlt();
    let appDa = false; try { appDa = await teileApp(c, alt); } catch (_) { appDa = false; }
    await Promise.all(SHELL.map(async u => {
      if (u === APP_KEY && appDa) return;
      try { if (await teileFest(c, u)) return; } catch (_) {}
      return fetch(new Request(u, { cache: 'reload' })).then(r => { if (r.ok) return c.put(u, r); }).catch(() => {});
    }));
    try { if (TEILE && appDa) await c.put(TEILE_KEY, new Response(JSON.stringify({ build: BUILD, app: TEILE.app, fest: TEILE.fest }), { headers: { 'content-type': 'application/json' } })); } catch (_) {}
    await self.skipWaiting();
  })());
});

self.addEventListener('activate', e => {
  e.waitUntil((async () => {
    const keys = await caches.keys();
    const cur = await caches.open(CACHE);
    if (!(await cur.match(PAGE_KEY))) {               /* Seite aus altem Speicher übernehmen, falls Neuladen offline scheiterte */
      for (const k of keys) { if (k === CACHE || !k.startsWith('svbc-scout-')) continue; const r = await (await caches.open(k)).match(PAGE_KEY); if (r) { await cur.put(PAGE_KEY, r); break; } }
    }
    await Promise.all(keys.filter(k => k.startsWith('svbc-scout-') && k !== CACHE).map(k => caches.delete(k)));
    await self.clients.claim();
    /* 0.33: offenen Fenstern sagen, dass eine neue Version da ist, sie laden dann von selbst neu */
    try { const list = await self.clients.matchAll({ type: 'window', includeUncontrolled: true }); list.forEach(c => { try { c.postMessage({ svbcNeu: BUILD }); } catch (_) {} }); } catch (_) {}
  })());
});

function isPage(req, url) {
  if (req.mode === 'navigate') return true;
  const scope = new URL(self.registration.scope);
  return url.origin === scope.origin && (url.pathname === scope.pathname || url.pathname === scope.pathname + 'index.html');
}

async function pageFirstNetwork(req) {
  const c = await caches.open(CACHE);
  const net = fetch(req.url.split('#')[0], { cache: 'reload', credentials: 'same-origin' })   /* 0.36: am Browser-Zwischenspeicher vorbei (alte Weiterleitungen) */.then(r => {
    if (r && r.redirected) r = new Response(r.body, { status: r.status, statusText: r.statusText, headers: r.headers });   /* umgeleitete Antwort darf eine Seite nicht direkt beantworten */
    if (r && r.ok) c.put(PAGE_KEY, r.clone());
    return r;
  });
  const cached = await c.match(PAGE_KEY);
  if (!cached) return net;
  /* Netz hat 4 s Zeit; danach die gespeicherte Seite zeigen (das Netz aktualisiert im Hintergrund weiter) */
  return Promise.race([
    net.then(r => (r && r.ok) ? r : cached).catch(() => cached),
    new Promise(res => setTimeout(() => res(cached), 4000))
  ]);
}

async function assetStaleWhileRevalidate(req, key) {
  const c = await caches.open(CACHE);
  const hit = await c.match(key || req);            /* exakt (inkl. ?v=Build): neue Version holt sich neuen Code */
  const upd = fetch(req).then(r => { if (r && (r.ok || r.type === 'opaque')) c.put(key || req, r.clone()); return r; }).catch(() => null);
  return hit || (await upd) || Response.error();
}

self.addEventListener('fetch', e => {
  const req = e.request;
  if (req.method !== 'GET') return;
  const url = new URL(req.url);
  if (url.hostname.endsWith('make.com') || url.hostname.endsWith('supabase.co') || url.pathname.includes('/rest/v1/') || url.pathname.includes('/auth/v1/') || url.pathname.includes('/functions/v1/')) return;  /* Daten & Anmeldung nie speichern */
  if (url.pathname.endsWith('/version.json')) return;         /* Update-Prüfung immer live */
  if (url.pathname.includes('/formulare/')) return;          /* Vereinsformulare (PDF) nie in den App-Speicher */
  if (url.pathname.endsWith('/team.html') || url.pathname.endsWith('/portal.js') || /\/(b-)?[A-Za-z0-9]{8,40}$/.test(url.pathname)) return;  /* Spielerseite + kurze Links immer frisch */
  const scope = new URL(self.registration.scope);
  if (isPage(req, url) && url.origin === scope.origin) { e.respondWith(pageFirstNetwork(req)); return; }
  if (teileSicher(url)) { e.respondWith(ausSpeicher(req)); return; }   /* 0.99.44: sonst lädt die Nachfrage im Hintergrund doch wieder die ganze Datei */
  if (url.origin === scope.origin && url.pathname.startsWith(scope.pathname + 't/')) return;   /* Stücke holt nur dieser Service Worker selbst */
  if (url.origin === scope.origin && url.pathname.startsWith(scope.pathname)) { e.respondWith(assetStaleWhileRevalidate(req)); return; }
  if (url.hostname === 'cdnjs.cloudflare.com') { e.respondWith(assetStaleWhileRevalidate(req)); return; }
});

self.addEventListener('message', e => { if (e.data === 'skipWaiting') self.skipWaiting(); });

/* ---------- Erinnerungen (Push) ---------- */
self.addEventListener('push', e => {
  let d = {};
  try { d = e.data ? e.data.json() : {}; } catch (_) { d = { body: e.data ? e.data.text() : '' }; }
  const title = String(d.title || 'SV/BSC Sportzentrale').slice(0, 120);
  const opts = { body: String(d.body || '').slice(0, 400), icon: './icon-192.png', badge: './favicon-64.png', tag: d.tag || 'svbc-scout',
    renotify: true, data: { url: d.url || './#kandidaten', frage: d.frage || null }, lang: 'de' };
  // Frage mit zwei Knöpfen direkt in der Mitteilung (Beta 0.99.4, siehe 138_fragen.sql)
  if (d.frage) opts.actions = [{ action: 'ja', title: String(d.ja || 'Ja').slice(0, 30) }, { action: 'nein', title: String(d.nein || 'Nein').slice(0, 30) }];
  e.waitUntil((async () => {
    await self.registration.showNotification(title, opts);
    try { if (self.navigator && self.navigator.setAppBadge) { if (d.n > 0) await self.navigator.setAppBadge(d.n); else await self.navigator.clearAppBadge(); } } catch (_) {}
  })());
});
self.addEventListener('notificationclick', e => {
  e.notification.close();
  const scope = self.registration.scope;
  let target = scope;
  const nd = e.notification.data || {};
  const roh = (e.action === 'ja' || e.action === 'nein') && nd.frage ? './#frage=' + nd.frage + ':' + e.action : (nd.url || './#kandidaten');
  try { const u = new URL(roh, scope); if (u.origin === new URL(scope).origin) target = u.href; } catch (_) {}
  const ziel = target.split('#')[1] || 'kandidaten';
  e.waitUntil((async () => {
    // Merkzettel: falls das Handy die Adresse beim Öffnen verliert (iPhone-App), holt die App das Ziel beim Start ab
    try { const c = await caches.open('svbc-ziel'); await c.put(new Request(new URL('./__ziel', scope).href), new Response(JSON.stringify({ ziel, t: Date.now() }), { headers: { 'content-type': 'application/json' } })); } catch (_) {}
    const list = await self.clients.matchAll({ type: 'window', includeUncontrolled: true });
    for (const c of list) {
      if (c.url.startsWith(scope)) {   // offene App: Nachricht schicken, auch wenn das Nach-vorne-Holen nicht erlaubt ist
        try { c.postMessage(/^[a-z]+$/.test(ziel) ? { svbcGo: ziel } : { svbcZiel: ziel }); } catch (_) { continue; }
        try { await c.focus(); } catch (_) {}
        return; }
    }
    await self.clients.openWindow(target);
  })());
});
