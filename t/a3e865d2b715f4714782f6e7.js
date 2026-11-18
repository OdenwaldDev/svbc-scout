}
{ const _arD=svAdminRender; svAdminRender=async function(){ const r=await _arD.apply(this,arguments); try{ await ogDriveKarte(document.getElementById('panel-admin')); }catch(e){ console.warn('Drive-Karte',e); } return r; }; }

(function(){ try{ const s=document.createElement('style'); s.id='svm33css'; s.textContent="/* 0.31 · Aufgaben & Checklisten: groß, klar, zum Abhaken wie eine Einkaufsliste */\n#panel-orga{max-width:760px;}\n.og-kopf{display:flex;align-items:flex-end;justify-content:space-between;gap:12px;flex-wrap:wrap;margin:4px 0 14px;}\n.og-kopf h2{margin:0;font-family:var(--disp);font-size:30px;letter-spacing:.01em;}\n.og-kopf p{margin:4px 0 0;color:var(--ink2);font-size:15.5px;max-width:48ch;}\n.og-neu{min-height:48px;font-size:16px;}\n.og-meine{display:flex;align-items:center;gap:12px;width:100%;padding:16px 18px;margin:0 0 14px;border-radius:var(--r-lg);border:1px solid rgba(34,197,94,.35);background:rgba(34,197,94,.1);color:var(--ink);font-size:17px;text-align:left;cursor:pointer;}\n.og-meine span{font-size:24px;} .og-meine b{flex:1;} .og-meine i svg{width:18px;height:18px;}\n.og-karten{display:flex;flex-direction:column;gap:10px;}\n.og-karte{display:flex;align-items:center;gap:14px;width:100%;padding:16px;border-radius:var(--r-lg);border:1px solid var(--line);background:var(--surface);color:var(--ink);text-align:left;cursor:pointer;transition:transform .15s var(--ease),border-color .15s;}\n.og-karte:hover{border-color:rgba(91,155,255,.4);} .og-karte:active{transform:scale(.985);}\n.og-karte.fertig{opacity:.75;}\n.og-em{flex:none;width:48px;height:48px;border-radius:14px;display:grid;place-items:center;font-size:26px;background:var(--surface2);}\n.og-em.gross{width:60px;height:60px;font-size:34px;border-radius:18px;}\n.og-kt{flex:1;min-width:0;display:flex;flex-direction:column;gap:3px;}\n.og-kt b{font-size:17.5px;line-height:1.25;}\n.og-kt small{font-size:14.5px;color:var(--ink2);}\n.og-kt .og-v{color:var(--ink3);font-size:13.5px;}\n.og-mein{display:inline-block;align-self:flex-start;margin-top:4px;padding:3px 10px;border-radius:999px;background:rgba(34,197,94,.16);color:#4ade80;font-style:normal;font-weight:700;font-size:13px;}\n.og-ring{flex:none;} .og-ring .bg{fill:none;stroke:var(--surface3);stroke-width:6;} .og-ring .fg{fill:none;stroke:var(--brand2);stroke-width:6;stroke-linecap:round;transition:stroke-dashoffset .7s var(--ease),stroke .3s;}\n.og-ring .fg.voll{stroke:var(--green);} .og-ring text{fill:var(--ink);font-size:12.5px;font-weight:800;font-family:var(--font);}\n.og-ring.gross .og-ring,.og-ring.gross .bg,.og-ring.gross .fg{stroke-width:8;} .og-ring.gross text{font-size:17px;}\n.og-leer{text-align:center;padding:28px 18px;} .og-leer b{font-size:18px;} .og-leer p{color:var(--ink2);font-size:15px;max-width:44ch;margin:8px auto 0;}\n.og-leer-em{font-size:40px;margin-bottom:6px;}\n.og-vorbei{margin-top:18px;} .og-vorbei summary{cursor:pointer;color:var(--ink2);font-size:15px;padding:10px 0;}\n.og-fuss{display:flex;gap:8px;flex-wrap:wrap;margin-top:18px;}\n\n/* Eine Checkliste */\n.og-zurueck{display:inline-flex;align-items:center;gap:6px;background:none;border:0;color:var(--brand2);font-size:16px;font-weight:700;padding:8px 0;cursor:pointer;margin-bottom:6px;}\n.og-zurueck svg{transform:rotate(180deg);width:18px;height:18px;}\n.og-hero{padding:18px;}\n.og-ht{display:flex;align-items:center;gap:14px;} .og-ht>div{flex:1;min-width:0;}\n.og-ht small{color:var(--ink3);font-size:13px;font-weight:700;text-transform:uppercase;letter-spacing:.05em;}\n.og-ht h2{margin:2px 0 4px;font-size:22px;line-height:1.2;}\n.og-ht p{margin:0;color:var(--ink2);font-size:15px;}\n.og-hstat{margin-top:12px;font-size:16px;color:var(--ink2);}\n.og-verant{display:flex;align-items:center;gap:8px;width:100%;margin-top:12px;padding:12px 14px;border-radius:var(--r-md);border:1px solid var(--line);background:var(--surface2);color:var(--ink2);font-size:15.5px;text-align:left;cursor:pointer;}\n.og-verant b{color:var(--ink);} .og-verant svg{width:18px;height:18px;}\n.og-add{display:flex;gap:8px;margin:16px 0 6px;}\n.og-add input{flex:1;min-width:0;min-height:54px;padding:0 16px;font-size:17px;border-radius:14px;border:1.5px solid var(--line);background:var(--surface);color:var(--ink);}\n.og-add input:focus{border-color:var(--brand2);outline:none;box-shadow:0 0 0 4px var(--brandSoft);}\n.og-add .btn{min-width:54px;min-height:54px;justify-content:center;border-radius:14px;} .og-add .btn svg{width:22px;height:22px;}\n.og-merk{display:flex;align-items:center;gap:10px;font-size:14.5px;color:var(--ink2);margin:6px 2px 14px;cursor:pointer;}\n.og-merk input{width:22px;height:22px;accent-color:var(--brand);}\n.og-filter{display:flex;gap:6px;margin:0 0 10px;padding:4px;border-radius:14px;background:var(--surface);border:1px solid var(--line2);}\n.og-filter button{flex:1;min-height:44px;border:0;border-radius:11px;background:none;color:var(--ink2);font-size:15.5px;font-weight:700;cursor:pointer;}\n.og-filter button.on{background:var(--brand);color:#fff;}\n.og-grp{margin:14px 0 4px;}\n.og-grp h3,.og-grp>summary{font-size:14px;text-transform:uppercase;letter-spacing:.06em;color:var(--ink3);margin:0 0 8px 4px;font-weight:800;}\n.og-grp h3 small,.og-grp>summary small{margin-left:6px;color:var(--ink3);font-weight:700;}\n.og-erl>summary{cursor:pointer;list-style:none;padding:8px 4px;} .og-erl>summary::-webkit-details-marker{display:none;} .og-erl>summary::before{content:'▸ ';}\n.og-erl[open]>summary::before{content:'▾ ';}\n.og-p{display:flex;align-items:center;gap:12px;padding:10px 12px 10px 10px;margin-bottom:8px;border-radius:16px;background:var(--surface);border:1px solid var(--line2);transition:opacity .35s,transform .45s var(--ease),background .3s;}\n.og-p.meins{border-color:rgba(34,197,94,.35);background:linear-gradient(90deg,rgba(34,197,94,.08),var(--surface) 60%);}\n.og-p.neu{animation:ogNeu .6s var(--ease);}\n.og-haken{flex:none;width:44px;height:44px;border-radius:50%;border:2.5px solid rgba(162,172,191,.55);background:transparent;display:grid;place-items:center;cursor:pointer;padding:0;transition:border-color .2s,background .25s,transform .15s;}\n.og-haken:active{transform:scale(.9);}\n.og-haken svg{width:24px;height:24px;fill:none;stroke:#fff;stroke-width:3.2;stroke-linecap:round;stroke-linejoin:round;stroke-dasharray:24;stroke-dashoffset:24;transition:stroke-dashoffset .35s var(--ease) .05s;}\n.og-p.done .og-haken,.og-p.hakt .og-haken{background:var(--green);border-color:var(--green);}\n.og-p.done .og-haken svg,.og-p.hakt .og-haken svg{stroke-dashoffset:0;}\n.og-p.hakt{animation:ogHakt .5s var(--ease) forwards;}\n.og-p.hakt .og-haken{animation:ogPop .35s var(--ease);}\n.og-p.loest{opacity:.5;}\n.og-p.done{opacity:.62;background:var(--bg2);}\n.og-p.done .og-pt b{text-decoration:line-through;text-decoration-color:rgba(162,172,191,.6);color:var(--ink2);}\n.og-pt{flex:1;min-width:0;text-align:left;background:none;border:0;color:var(--ink);padding:4px 0;cursor:pointer;display:flex;flex-direction:column;gap:5px;}\n.og-pt b{font-size:17px;line-height:1.3;font-weight:650;}\n.og-pm{display:flex;flex-wrap:wrap;gap:6px 12px;}\n.og-pm i{font-style:normal;font-size:14px;color:var(--ink2);display:inline-flex;align-items:center;gap:4px;}\n.og-pm i svg{width:14px;height:14px;}\n.og-uhr.ueber{color:#fbbf24;font-weight:700;}\n.og-wer.ich{color:#4ade80;font-weight:700;} .og-wer.leer{color:var(--brand2);}\n.og-ev{color:#4ade80!important;} .og-notiz{color:var(--ink3)!important;}\n.og-alle{text-align:center;padding:22px;} .og-alle b{font-size:19px;} .og-alle p{color:var(--ink2);margin:6px 0 0;}\n.og-helfer h3,.og-chat h3,.og-dateien h3{display:flex;align-items:center;gap:8px;margin:0 0 6px;font-size:17px;}\n.og-helfer h3 svg,.og-chat h3 svg,.og-dateien h3 svg{width:18px;height:18px;}\n.og-helfer p{margin:0 0 10px;color:var(--ink2);font-size:14.5px;}\n.og-hl{display:flex;flex-wrap:wrap;gap:8px;}\n.og-hchip{display:inline-flex;align-items:center;gap:6px;padding:9px 14px;border-radius:999px;border:1px solid var(--line);background:var(--surface2);color:var(--ink);font-size:15px;cursor:pointer;}\n.og-hchip svg{width:15px;height:15px;}\n.og-chat h3 small{color:var(--ink3);font-weight:600;font-size:13px;}\n.og-msgs{max-height:360px;overflow-y:auto;display:flex;flex-direction:column;gap:8px;padding:4px 2px 8px;}\n.og-m{align-self:flex-start;max-width:85%;padding:10px 13px;border-radius:16px 16px 16px 4px;background:var(--surface2);}\n.og-m.ich{align-self:flex-end;border-radius:16px 16px 4px 16px;background:rgba(47,107,255,.22);}\n.og-m b{font-size:13px;color:var(--brand2);} .og-m.ich b{color:#9cc3ff;}\n.og-m p{margin:2px 0 0;font-size:16px;line-height:1.4;white-space:pre-wrap;word-break:break-word;}\n.og-m small{display:block;margin-top:4px;font-size:12px;color:var(--ink3);}\n.og-datei{display:inline-flex;align-items:center;gap:6px;margin-top:6px;color:var(--brand2);font-size:15px;}\n.og-datei svg{width:16px;height:16px;}\n.og-send{display:flex;gap:8px;align-items:center;margin-top:8px;}\n.og-send input{flex:1;min-width:0;min-height:50px;padding:0 14px;font-size:16.5px;border-radius:14px;border:1.5px solid var(--line);background:var(--surface);color:var(--ink);}\n.og-send .btn{min-width:50px;min-height:50px;justify-content:center;border-radius:14px;}\n.og-att{flex:none;width:50px;height:50px;border-radius:14px;display:grid;place-items:center;border:1px solid var(--line);background:var(--surface2);cursor:pointer;color:var(--ink2);}\n.og-att svg{width:22px;height:22px;}\n.og-dhin{margin:8px 0 0;font-size:13.5px;}\n.og-dz{display:flex;align-items:center;gap:8px;padding:10px 0;border-top:1px solid var(--line2);color:var(--ink);text-decoration:none;font-size:15px;}\n.og-dz b{flex:1;font-weight:600;} .og-dz small{color:var(--ink3);}\n\n/* Formulare und Auswahl */\n.og-form h2{margin:0 0 10px;font-size:21px;line-height:1.25;}\n.og-fl{display:flex;flex-direction:column;gap:6px;margin:12px 0;font-size:14.5px;color:var(--ink2);font-weight:700;}\n.og-fl input,.og-werbtn{min-height:50px;padding:0 14px;font-size:16.5px;border-radius:13px;border:1.5px solid var(--line);background:var(--surface);color:var(--ink);font-weight:500;}\n.og-werbtn{text-align:left;display:flex;align-items:center;gap:8px;cursor:pointer;} .og-werbtn svg{width:16px;height:16px;}\n.og-zwei{display:grid;grid-template-columns:1fr 1fr;gap:10px;}\n.og-seg{display:flex;gap:6px;} .og-seg button{flex:1;min-height:46px;border-radius:12px;border:1px solid var(--line);background:var(--surface);color:var(--ink2);font-size:15px;font-weight:700;cursor:pointer;}\n.og-seg button.on{background:var(--brand);border-color:var(--brand);color:#fff;}\n.og-weg{display:flex;align-items:center;gap:12px;flex-wrap:wrap;margin-top:16px;padding-top:12px;border-top:1px solid var(--line2);font-size:14px;color:var(--ink2);}\n.og-weg label{display:flex;align-items:center;gap:6px;} .og-weg .warn{color:var(--red);border-color:rgba(240,82,82,.4);}\n.og-wahl{position:fixed;inset:0;z-index:2000;background:rgba(2,4,8,.6);display:flex;align-items:flex-end;justify-content:center;opacity:0;transition:opacity .2s;}\n.og-wahl.auf{opacity:1;}\n.og-wahl-in{width:min(520px,100%);max-height:80vh;overflow:auto;background:var(--surface2);border-radius:22px 22px 0 0;padding:18px 16px calc(18px + env(safe-area-inset-bottom,0px));transform:translateY(30px);transition:transform .25s var(--ease);}\n.og-wahl.auf .og-wahl-in{transform:none;}\n@media (min-width:700px){ .og-wahl{align-items:center;} .og-wahl-in{border-radius:22px;} }\n.og-wahl h3{margin:0 0 10px;font-size:19px;}\n.og-wahl input{width:100%;min-height:52px;padding:0 14px;font-size:17px;border-radius:13px;border:1.5px solid var(--line);background:var(--surface);color:var(--ink);box-sizing:border-box;}\n.og-wl{display:flex;flex-direction:column;gap:6px;margin:10px 0;}\n.og-wl button{display:flex;align-items:center;gap:10px;min-height:52px;padding:0 14px;border-radius:13px;border:1px solid var(--line2);background:var(--surface);color:var(--ink);font-size:16.5px;text-align:left;cursor:pointer;}\n.og-wl button.on{border-color:var(--brand2);background:var(--brandSoft);} .og-wl button.frei{color:var(--brand2);font-weight:700;} .og-wl button small{color:var(--ink3);font-weight:500;}\n.og-wl svg{width:17px;height:17px;}\n.og-wtext,.og-code{width:100%;box-sizing:border-box;padding:12px;border-radius:12px;border:1px solid var(--line);background:var(--surface);color:var(--ink);font-size:15px;line-height:1.45;resize:vertical;}\n.og-code{font-family:ui-monospace,Menlo,monospace;font-size:12px;}\n.og-wa{background:#25d366!important;border-color:#25d366!important;color:#06240f!important;text-decoration:none;}\n.og-arten{display:grid;grid-template-columns:repeat(auto-fill,minmax(130px,1fr));gap:8px;margin:12px 0;}\n.og-arten button{display:flex;flex-direction:column;align-items:center;gap:4px;padding:12px 8px;border-radius:14px;border:1.5px solid var(--line);background:var(--surface);color:var(--ink2);font-size:14px;font-weight:700;cursor:pointer;}\n.og-arten button span{font-size:26px;} .og-arten button.on{border-color:var(--brand2);background:var(--brandSoft);color:var(--ink);}\n.og-vl{display:flex;flex-direction:column;gap:8px;}\n.og-vl button{display:flex;align-items:center;gap:12px;min-height:56px;padding:8px 14px;border-radius:14px;border:1px solid var(--line);background:var(--surface);color:var(--ink);font-size:16px;text-align:left;cursor:pointer;}\n.og-vl button span{font-size:24px;} .og-vl button b{flex:1;} .og-vl button small{color:var(--ink3);}\n.og-vh{font-size:13px;text-transform:uppercase;letter-spacing:.06em;color:var(--ink3);margin:16px 0 6px;}\n.og-vp{display:flex;align-items:center;gap:6px;margin-bottom:6px;}\n.og-vp input{flex:1;min-width:0;min-height:44px;padding:0 10px;font-size:15px;border-radius:10px;border:1px solid var(--line);background:var(--surface);color:var(--ink);}\n.og-vp small{flex:none;width:92px;color:var(--ink3);font-size:12px;}\n.og-vp button{flex:none;width:36px;height:36px;border-radius:10px;border:1px solid var(--line);background:var(--surface2);color:var(--ink2);cursor:pointer;}\n.og-steps{padding-left:20px;font-size:15px;line-height:1.55;color:var(--ink2);} .og-steps li{margin-bottom:8px;} .og-steps b{color:var(--ink);}\n.og-form>input#ogDu{width:100%;box-sizing:border-box;min-height:50px;padding:0 12px;font-size:15px;border-radius:12px;border:1.5px solid var(--line);background:var(--surface);color:var(--ink);}\n\n/* Start und Termine */\n.og-home .og-hz{display:flex;align-items:center;gap:12px;width:100%;padding:10px 0;border:0;border-top:1px solid var(--line2);background:none;color:var(--ink);text-align:left;cursor:pointer;}\n.og-home .og-hz>span:nth-child(2){flex:1;min-width:0;display:flex;flex-direction:column;gap:2px;} .og-home .og-hz b{font-size:15.5px;} .og-home .og-hz small{color:var(--ink2);font-size:13.5px;}\n.og-home .og-em{width:40px;height:40px;font-size:22px;border-radius:12px;}\n.og-kalbtn{background:var(--green)!important;border-color:var(--green)!important;color:#052e14!important;}\n\n/* Bewegung */\n@keyframes ogHakt{0%{transform:none;}40%{transform:scale(1.02);}100%{transform:translateX(12px);opacity:.3;}}\n@keyframes ogPop{0%{transform:scale(.8);}60%{transform:scale(1.18);}100%{transform:scale(1);}}\n@keyframes ogNeu{0%{transform:translateY(-10px);opacity:0;background:var(--brandSoft);}100%{transform:none;opacity:1;}}\n.og-konfetti{position:fixed;z-index:3000;pointer-events:none;width:0;height:0;}\n.og-konfetti i{position:absolute;width:9px;height:14px;border-radius:2px;animation:ogKonf 1.2s cubic-bezier(.15,.7,.3,1) forwards;}\n@keyframes ogKonf{0%{transform:translate(0,0) rotate(0);opacity:1;}100%{transform:translate(var(--x),calc(var(--y) + 160px)) rotate(540deg);opacity:0;}}\n@media (prefers-reduced-motion:reduce){ .og-p,.og-haken,.og-haken svg,.og-ring .fg{transition:none!important;} .og-p.hakt,.og-p.neu,.og-p.hakt .og-haken{animation:none!important;} }\n@media (max-width:520px){ .og-kopf h2{font-size:26px;} .og-karte{padding:14px 12px;gap:12px;} .og-em{width:44px;height:44px;font-size:24px;} .og-ring:not(.gross){width:46px;height:46px;} }\n/* Formulare, Schichtplan, Kasse, Nummern */\n.og-p{flex-wrap:wrap;}\n.og-fo{margin-left:56px;padding:6px 12px;border-radius:999px;border:1px solid rgba(91,155,255,.35);background:var(--brandSoft);color:var(--ink);font-size:14px;font-weight:700;cursor:pointer;}\n.og-p.done .og-fo{display:none;}\n.og-sotd{border-color:rgba(251,191,36,.35);}\n.og-schicht h3,.og-kasse h3,.og-num h3,.og-forms h3{display:flex;align-items:center;gap:8px;margin:0 0 6px;font-size:17px;}\n.og-schicht h3 small{color:var(--ink3);font-weight:600;font-size:13px;margin-left:auto;}\n.og-schicht.blink{animation:ogBlink 1.2s var(--ease);}\n@keyframes ogBlink{0%,100%{box-shadow:none;}30%{box-shadow:0 0 0 4px var(--brandSoft);}}\n.og-regel{margin:0 0 12px;padding:10px 12px;border-radius:12px;background:rgba(251,191,36,.08);border:1px solid rgba(251,191,36,.25);color:var(--ink2);font-size:14px;line-height:1.45;}\n.og-sr{padding:12px 0;border-top:1px solid var(--line2);}\n.og-sk{display:flex;align-items:baseline;gap:10px;flex-wrap:wrap;} .og-sk b{font-size:16.5px;} .og-sk small{color:var(--ink2);font-size:14px;}\n.og-sx{margin-left:auto;width:34px;height:34px;border-radius:10px;border:1px solid var(--line);background:var(--surface2);color:var(--ink2);cursor:pointer;}\n.og-sh{display:flex;flex-wrap:wrap;gap:8px;margin-top:8px;align-items:center;}\n.og-shn{display:inline-flex;align-items:center;gap:6px;padding:7px 6px 7px 12px;border-radius:999px;background:var(--surface2);border:1px solid var(--line);font-size:15px;}\n.og-shn.ich{border-color:rgba(34,197,94,.5);color:#4ade80;font-weight:700;}\n.og-shn button{border:0;background:none;color:var(--ink3);font-size:16px;cursor:pointer;padding:0 6px;} .og-shn button.warn{color:var(--red);font-size:13px;font-weight:700;}\n.og-shfrei{min-height:40px;padding:0 16px;border-radius:999px;border:1.5px dashed rgba(91,155,255,.55);background:none;color:var(--brand2);font-size:15px;font-weight:700;cursor:pointer;}\n.og-shr{color:var(--ink3);font-size:13px;}\n.og-sr.voll .og-sk b::after{content:' ✓';color:var(--green);}\n.og-papier{display:inline-block;margin-top:12px;color:var(--ink2);font-size:14px;}\n.og-schicht>.btn{margin-top:10px;}\n.og-ksum{margin:0 0 10px;font-size:15px;color:var(--ink2);} .og-ksum b{color:var(--ink);font-size:18px;}\n.og-kf h3{font-size:14px;text-transform:uppercase;letter-spacing:.05em;color:var(--brand2);margin:16px 0 6px;}\n.og-kr,.og-kh{display:grid;grid-template-columns:1fr 84px 96px 88px;gap:6px;align-items:center;margin-bottom:6px;}\n.og-kh small{color:var(--ink3);font-size:11.5px;text-align:center;}\n.og-kr span{font-size:14.5px;} .og-kr input{min-width:0;min-height:44px;padding:0 8px;font-size:16px;border-radius:10px;border:1px solid var(--line);background:var(--surface);color:var(--ink);text-align:right;}\n.og-kr b{text-align:right;font-size:14.5px;font-variant-numeric:tabular-nums;}\n.og-kr input[data-f=\"beleg\"]{text-align:left;}\n.og-kend{margin:14px 0 4px;padding:12px 14px;border-radius:14px;background:var(--surface2);border:1px solid var(--line);}\n.og-kend div{display:flex;justify-content:space-between;padding:4px 0;font-size:15px;font-variant-numeric:tabular-nums;} .og-kend .sum{border-top:2px solid #E8741F;margin-top:6px;padding-top:8px;font-size:17px;}\n@media (max-width:520px){ .og-kr,.og-kh{grid-template-columns:1fr 70px 80px;} .og-kr b,.og-kr i,.og-kh small:last-child{display:none;} }\n.og-nl{display:grid;grid-template-columns:repeat(auto-fill,minmax(210px,1fr));gap:8px;}\n.og-nl a,.og-nl div{display:flex;flex-direction:column;gap:2px;padding:10px 12px;border-radius:12px;background:var(--surface2);border:1px solid var(--line2);color:var(--ink);text-decoration:none;}\n.og-nl span{font-size:13px;color:var(--ink2);} .og-nl b{font-size:18px;font-variant-numeric:tabular-nums;} .og-nl i{font-size:13px;color:var(--ink3);font-style:normal;}\n.og-fz{display:grid;grid-template-columns:52px 1fr;gap:0 10px;padding:10px 0;border-top:1px solid var(--line2);color:var(--ink);text-decoration:none;}\n.og-fz b{grid-row:span 2;align-self:center;font-family:var(--disp);font-size:18px;color:#E8741F;} .og-fz span{font-weight:700;font-size:15px;} .og-fz small{color:var(--ink3);font-size:13px;}\n.og-rolle{display:grid;grid-template-columns:1fr;gap:6px;padding:10px 0;border-top:1px solid var(--line2);}\n.og-rolle b{font-size:14.5px;} .og-rolle input{min-height:44px;padding:0 10px;font-size:15.5px;border-radius:10px;border:1px solid var(--line);background:var(--surface);color:var(--ink);}\n@media (min-width:640px){ .og-rolle{grid-template-columns:200px 1fr 170px;align-items:center;} }\n@media (max-width:520px){\n  .og-ht{align-items:flex-start;} .og-ht .og-em.gross{display:none;} .og-ht h2{font-size:20px;} .og-ring.gross{width:64px;height:64px;}\n  .og-kr{grid-template-columns:1fr 1fr;} .og-kr span{grid-column:1/-1;font-weight:600;margin-top:4px;} .og-kh{display:none;}\n  .og-kr input[data-f=\"beginn\"]::placeholder,.og-kr input[data-f=\"ende\"]::placeholder{color:var(--ink3);}\n}\n.og-p .og-pt{flex:1 1 calc(100% - 60px);} .og-p .og-fo{flex:0 0 auto;}\n/* 0.32 Vereins-Drive gut sichtbar */\n.og-dban{display:flex;align-items:center;gap:14px;padding:16px 18px;margin:0 0 14px;border-radius:var(--r-lg);border:2px solid rgba(59,123,255,.45);background:linear-gradient(135deg,rgba(59,123,255,.14),rgba(59,123,255,.04));}\n.og-dban-em{font-size:32px;line-height:1;flex:none;}\n.og-dban>div{flex:1;min-width:0;}\n.og-dban b{display:block;font-size:17px;}\n.og-dban p{margin:4px 0 0;font-size:14px;color:var(--ink2);}\n.og-dban .btn{flex:none;}\n@media (max-width:620px){ .og-dban{flex-wrap:wrap;} .og-dban .btn{width:100%;justify-content:center;} }\n.og-dhin .btn{margin-left:6px;vertical-align:middle;}\n.og-fdrive{margin-top:14px;padding-top:12px;border-top:1px solid var(--line);}\n.og-fdrive .note{margin:0 0 8px;}\n/* 0.32 Partnersheet im Partner-Bereich */\n.ps-karte{display:flex;gap:18px;align-items:flex-start;}\n.ps-bild{flex:none;width:150px;border-radius:10px;overflow:hidden;box-shadow:0 6px 18px rgba(0,0,0,.25);transform:rotate(-1.5deg);transition:transform .2s var(--ease);}\n.ps-bild:hover{transform:rotate(0) scale(1.02);}\n.ps-bild img{display:block;width:100%;height:auto;}\n.ps-txt{flex:1;min-width:0;}\n.ps-txt h3{margin:0 0 6px;}\n.ps-txt p{margin:0 0 10px;font-size:14.5px;color:var(--ink2);}\n.ps-stufen{display:grid;grid-template-columns:repeat(auto-fit,minmax(130px,1fr));gap:6px;margin:0 0 12px;}\n.ps-stufen span{padding:8px 10px;border-radius:10px;background:var(--surface2);border:1px solid var(--line);font-size:13.5px;color:var(--ink2);}\n.ps-stufen b{display:block;font-size:14px;color:var(--ink);}\n.ps-btns{display:flex;flex-wrap:wrap;gap:8px;}\n.ps-teilen{display:flex;flex-wrap:wrap;gap:8px;margin:12px 0;}\n.ps-link{width:100%;font-size:13px;}\n@media (max-width:620px){ .ps-karte{flex-direction:column;align-items:stretch;} .ps-bild{width:120px;margin:0 auto;} .ps-btns .btn{flex:1 1 45%;justify-content:center;} }\n/* 0.33 Nach unten ziehen zum Aktualisieren */\n.ptr{position:fixed;left:50%;top:calc(env(safe-area-inset-top,0px) - 48px);transform:translate(-50%,0);z-index:120;display:flex;align-items:center;gap:8px;padding:9px 16px;border-radius:999px;background:var(--surface,#1b2130);color:var(--ink,#fff);border:1px solid var(--line,rgba(255,255,255,.15));box-shadow:0 8px 24px rgba(0,0,0,.35);font-size:14.5px;font-weight:600;opacity:0;transition:opacity .15s;pointer-events:none;white-space:nowrap;}\n.ptr.an{opacity:1;}\n.ptr .ptr-i{font-style:normal;display:inline-block;transition:transform .2s;}\n.ptr.los .ptr-i{transform:rotate(180deg);}\n.ptr.dreht .ptr-i{animation:ptrDreh .8s linear infinite;}\n.ptr.dreht .ptr-i::before{content:'';}\n@keyframes ptrDreh{to{transform:rotate(360deg);}}\n.appupd{max-width:calc(100vw - 32px);white-space:normal;text-align:center;line-height:1.35;}\n/* 0.34 Banden am Sportplatz */\n.bd-k1{display:flex;gap:12px;align-items:flex-start;justify-content:space-between;}\n.bd-std{display:grid;grid-template-columns:repeat(auto-fit,minmax(200px,1fr));gap:8px;margin:14px 0 10px;}\n.bd-std>div{padding:10px 12px;border-radius:12px;background:var(--surface2);border:1px solid var(--line);}\n.bd-std b{display:block;font-size:13px;color:var(--ink3);text-transform:uppercase;letter-spacing:.06em;}\n.bd-std span{font-size:14.5px;color:var(--ink);}\n.bd-wer{margin:4px 0 10px;font-size:15px;color:var(--ink2);}\n.bd-zahlen{display:flex;flex-wrap:wrap;gap:8px;margin:6px 0;}\n.bd-zahlen span,.bd-zahlen button{flex:1 1 90px;padding:10px 12px;border-radius:12px;border:1px solid var(--line);font-size:13.5px;color:var(--ink2);background:transparent;text-align:left;font:inherit;font-size:13.5px;cursor:pointer;min-height:44px;transition:border-color .15s,background .15s;}\n.bd-zahlen button:hover{border-color:var(--ink2);} .bd-zahlen button.on{border-color:var(--ink);background:var(--card2,rgba(127,127,127,.08));box-shadow:inset 0 0 0 1px var(--ink);}\n.bd-zahlen button:focus-visible{outline:2px solid #60a5fa;outline-offset:2px;}\n.bd-zuord{display:flex;flex-wrap:wrap;align-items:center;gap:8px 12px;margin-top:10px;padding:10px 12px;border-radius:12px;border:1px dashed var(--line);font-size:13.5px;color:var(--ink2);}\n.bd-zuord span{flex:1 1 220px;}\n.bd-vor{display:block;margin-top:6px;color:var(--ink2);font-size:12.5px;line-height:1.5;}\n.bd-kand{border:1px solid var(--line);background:transparent;color:var(--ink);border-radius:999px;padding:8px 14px;margin:4px 6px 0 0;font:inherit;font-size:13.5px;cursor:pointer;min-height:44px;}\n.bd-zuord .btn{min-height:44px;}\nhtml[data-theme=\"hell\"] .bd-zahlen .z-erneuern b{color:#b45309;} html[data-theme=\"hell\"] .bd-zahlen .z-gut b{color:#15803d;} html[data-theme=\"hell\"] .bd-zahlen .z-unklar b{color:#1d4ed8;}\n.bd-zl{display:grid;gap:8px;margin:12px 0;}\n.bd-zr{display:flex;gap:10px;align-items:flex-start;padding:10px 12px;border:1px solid var(--line);border-radius:12px;cursor:pointer;}\n.bd-zr input{width:20px;height:20px;margin-top:2px;flex:none;}\n.bd-zr span{display:grid;gap:2px;} .bd-zr small{color:var(--ink2);}\n.bd-zahlen b{display:block;font-size:24px;color:var(--ink);}\n.bd-zahlen .z-erneuern b{color:#f59e0b;} .bd-zahlen .z-gut b{color:#22c55e;} .bd-zahlen .z-unklar b{color:#60a5fa;}\n.bd-f{margin:12px 0;}\n.bd-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(280px,1fr));gap:12px;}\n.bd-b{display:flex;flex-direction:column;text-align:left;padding:0;border-radius:var(--r-lg);border:1px solid var(--line);background:var(--surface);color:var(--ink);overflow:hidden;cursor:pointer;font:inherit;}\n.bd-b.z-erneuern{border-color:rgba(245,158,11,.55);}\n.bd-bild{display:block;aspect-ratio:5/1.1;background:#10131a;overflow:hidden;}\n.bd-bild img{display:block;width:100%;height:100%;object-fit:cover;}\n.bd-bild i{display:flex;height:100%;align-items:center;justify-content:center;color:var(--ink3);font-style:normal;font-size:13px;}\n.bd-t{display:flex;flex-direction:column;gap:4px;padding:10px 12px 12px;}\n.bd-t b{font-size:15.5px;} .bd-t small{color:var(--ink3);font-size:12.5px;} .bd-t em{color:var(--ink2);font-size:13px;font-style:normal;}\n.bd-chips{display:flex;flex-wrap:wrap;gap:6px;}\n.bd-z,.bd-p{font-style:normal;font-size:12.5px;font-weight:700;padding:3px 9px;border-radius:999px;border:1px solid var(--line);}\n.bd-z.z-gut{color:#22c55e;border-color:rgba(34,197,94,.45);} .bd-z.z-erneuern{color:#f59e0b;border-color:rgba(245,158,11,.5);} .bd-z.z-pruefen{color:var(--ink2);}\n.bd-p.p-ja{color:#22c55e;} .bd-p.p-unklar{color:#60a5fa;} .bd-p.p-nein{color:#f87171;}\n.bd-gross{display:block;width:100%;max-height:220px;object-fit:contain;border-radius:12px;margin:10px 0;background:#10131a;}\n.bd-seg button.on{background:linear-gradient(180deg,#3b78ff,#2459e6);color:#fff;}\n@media (max-width:620px){ .bd-k1{flex-direction:column;} .bd-grid{grid-template-columns:1fr;} }\n@media (max-width:620px){ .bd-std{grid-template-columns:1fr 1fr;gap:6px;} .bd-std>div{padding:8px 10px;} .bd-std b{font-size:11.5px;} .bd-std span{font-size:13px;line-height:1.35;} }\n/* 0.35 Helferpool */\n.hp h2 small{font-size:14px;color:var(--ink3);font-weight:600;margin-left:6px;}\n.hp-such input{width:100%;min-height:50px;padding:0 14px;font-size:16px;border-radius:14px;border:1.5px solid var(--line);background:var(--surface);color:var(--ink);}\n.hp-pruef{margin:10px 0;padding:12px 14px;border-radius:12px;font-size:15px;}\n.hp-pruef.ok{background:rgba(34,197,94,.14);border:1px solid rgba(34,197,94,.45);} .hp-pruef.nein{background:rgba(239,68,68,.12);border:1px solid rgba(239,68,68,.45);}\n.hp-f{margin:10px 0;}\n.hp-l{display:flex;flex-direction:column;gap:8px;max-height:52vh;overflow:auto;}\n.hp-r{padding:12px 14px;border-radius:14px;border:1px solid var(--line);background:var(--surface);}\n.hp-kopf{display:flex;align-items:center;gap:8px;flex-wrap:wrap;} .hp-kopf b{font-size:16px;} .hp-kopf span{color:var(--ink3);font-size:13px;}\n.hp-drin{margin-left:auto;display:flex;align-items:center;gap:6px;font-size:13px;color:var(--ink2);} .hp-drin input{width:20px;height:20px;}\n.hp-kontakt{display:flex;flex-wrap:wrap;gap:6px 14px;margin-top:6px;font-size:14px;} .hp-kontakt a{color:var(--brand2,#60a5fa);text-decoration:none;}\n.hp-int{display:flex;flex-wrap:wrap;gap:5px;margin-top:6px;} .hp-int i{font-style:normal;font-size:12.5px;padding:3px 8px;border-radius:999px;background:var(--surface2);border:1px solid var(--line);}\n.hp-txt{margin-top:8px;font-size:13.5px;line-height:1.45;white-space:pre-wrap;background:var(--surface2);border-radius:10px;padding:8px 10px;} .hp-txt b{display:block;font-size:11px;letter-spacing:.06em;text-transform:uppercase;color:var(--ink3);margin-bottom:2px;} .hp-int i.hp-nicht{color:var(--ink3);} .hp-bf{margin-top:6px;} .hp-link{font-size:12px;font-weight:700;color:#25d366;white-space:nowrap;}\n.hp-fuss{display:flex;align-items:center;gap:8px;margin-top:8px;} .hp-fuss small{color:var(--ink3);flex:none;font-size:12px;}\n.hp-notiz{flex:1;min-width:0;min-height:36px;padding:0 10px;border-radius:10px;border:1px solid var(--line);background:var(--surface2);color:var(--ink);font-size:14px;}\n.hp-weg{margin-top:8px;padding:10px;border-radius:10px;background:rgba(239,68,68,.1);font-size:14px;}\n.hp-adm{margin-top:12px;} .hp-q{display:flex;align-items:center;gap:10px;flex-wrap:wrap;margin-top:8px;} .hp-q small{color:var(--ink3);flex:1;min-width:0;word-break:break-all;}\n.hp-fuss{flex-wrap:wrap;} .hp-notiz{flex:1 1 100%;order:3;}\n.hp-ans{margin:6px 0 4px;} .hp-ber{border:1px solid var(--line);border-radius:12px;margin-top:10px;background:var(--surface2);} .hp-ber>summary{display:flex;justify-content:space-between;gap:10px;align-items:baseline;padding:12px 14px;cursor:pointer;list-style:none;} .hp-ber>summary span{font-size:12.5px;color:var(--ink3);}\n.hp-ber[open]>summary{border-bottom:1px solid var(--line);} .hp-gl{padding:10px 14px 0;} .hp-gl label{display:block;font-size:12px;font-weight:700;color:var(--ink2);} .hp-glr{display:flex;gap:8px;margin-top:4px;} .hp-glr input{flex:1;min-width:0;} .hp-gl small{display:block;color:var(--ink3);font-size:11.5px;margin-top:4px;}\n.hp-bl{padding:4px 14px;} .hp-br{display:flex;justify-content:space-between;gap:10px;align-items:center;padding:9px 0;border-bottom:1px solid var(--line);} .hp-br>div:first-child{display:flex;flex-direction:column;min-width:0;} .hp-br small{color:var(--ink3);font-size:12px;} .hp-br small.hp-ok{color:#22c55e;font-weight:600;}\n.hp-bk{display:flex;gap:6px;flex:none;} .hp-ber .btnrow{padding:8px 14px 12px;}\n.hp-glr input{min-height:40px;padding:0 12px;font-size:15px;border-radius:10px;border:1.5px solid var(--line);background:var(--surface);color:var(--ink);}\n"; document.head.appendChild(s); }catch(e){} })();
/* =====================================================================
   Sportzentrale Beta 0.32 · Partnersheet 2027/28 in der App
   - Das Partnersheet (Nachbau 1:1, echter Text, Preise wie besprochen) liegt als PDF unter formulare/
   - Im Partner-Bereich in der Ablage (seit 0.72 nur noch dort): ansehen, per WhatsApp oder Mail weitergeben, Link kopieren, in den Vereins-Drive legen
   - Dazu die Rechnungsvorlage F-09 für Partnerrechnungen und eine kurze Preisübersicht (aus SPO_STUFE, damit alles gleich bleibt)
   Immer „Partner“, nie „Sponsor“.
   ===================================================================== */
const PS_DATEI='Partnersheet-2027-28.pdf', PS_SAISON='2027/28';
const psUrl=()=>{ try{ return new URL('formulare/'+PS_DATEI,location.href).href; }catch(e){ return 'formulare/'+PS_DATEI; } };
function psKarte(){
  const admin=typeof isAdmin==='function'&&isAdmin(), drive=typeof OG!=='undefined'&&OG.ue&&OG.ue.drive;
  const stufen=Object.values(SPO_STUFE).map(s=>`<span><b>${svEsc(s.t)}</b>${spoEur(s.p)}${s.max?` · max. ${s.max}`:''}</span>`).join('');
  return `<div class="card ps-karte" id="psKarte">
    <a class="ps-bild" href="formulare/${PS_DATEI}" target="_blank" rel="noopener" aria-label="Partnerblatt ansehen"><img src="formulare/Partnersheet-2027-28-vorschau.jpg" alt="Partnerblatt ${PS_SAISON}, Seite 1" loading="lazy"></a>
    <div class="ps-txt"><h3>Partnerblatt ${PS_SAISON}</h3>
      <p>Stufen, Leistungen und Preise auf zwei Seiten, zum Weitergeben an Firmen. Partner des Tages: Supporter 189 €, Club 169 €, Premium 149 €, beim 1896 Partner ist ein Heimspiel inklusive.</p>
      <div class="ps-stufen">${stufen}</div>
      <div class="ps-btns"><a class="btn" href="formulare/${PS_DATEI}" target="_blank" rel="noopener">${SVI('file')} Ansehen</a>
        <button type="button" class="btn ghost" id="psTeilen">${SVI('share')} Weitergeben</button>
        <a class="btn ghost" href="formulare/F-09-Rechnungsvorlage.pdf" target="_blank" rel="noopener">${SVI('file')} Rechnungsvorlage</a>
        ${admin&&drive?`<button type="button" class="btn ghost" id="psDrive">${SVI('upload')} In den Vereins-Drive</button>`:''}</div>
      <p class="note small" id="psMsg"></p></div></div>`;
}
function psVerdrahten(root){
  const t=root.querySelector('#psTeilen'); if(t)t.onclick=()=>psTeilen();
  const d=root.querySelector('#psDrive'); if(d)d.onclick=async()=>{ const m=root.querySelector('#psMsg'); d.disabled=true; m.textContent='Lege das Partnerblatt in den Vereins-Drive …';
    try{ const r=await ogVorlageInDrive('formulare/'+PS_DATEI,PS_DATEI); m.innerHTML='✓ Liegt im Vereins-Drive unter „04 Partner / Anschreiben & Präsentation“.'+(r.ordner_link?` <a href="${svEsc(r.ordner_link)}" target="_blank" rel="noopener">Ordner öffnen</a>`:''); }
    catch(e){ m.textContent='⚠️ '+e.message; d.disabled=false; } };
}
function psTeilen(){
  const url=psUrl(), text=`Hallo, hier ist unser Partnerblatt ${PS_SAISON} vom SV/BSC Mörlenbach mit allen Partnerstufen und Preisen: ${url}`;
  const M=svModal(`<div class="og-form"><h2>${SVI('share')} Partnerblatt weitergeben</h2>
    <p class="note">Der Link öffnet das PDF direkt, ohne Anmeldung. Du kannst ihn per WhatsApp, Mail oder als Nachricht schicken.</p>
    <div class="ps-teilen">${navigator.share?`<button type="button" class="btn" id="psNativ">${SVI('share')} Teilen …</button>`:''}
      <a class="btn ghost" href="https://wa.me/?text=${encodeURIComponent(text)}" target="_blank" rel="noopener">${SVI('chat')} WhatsApp</a>
      <a class="btn ghost" href="mailto:?subject=${encodeURIComponent('Partnerblatt '+PS_SAISON+' SV/BSC Mörlenbach')}&body=${encodeURIComponent(text)}">${SVI('mail')} Mail</a>
      <button type="button" class="btn ghost" id="psKopie">${SVI('copy')} Link kopieren</button></div>
    <input class="ps-link" readonly value="${svEsc(url)}"></div>`);
  const n=M.querySelector('#psNativ'); if(n)n.onclick=async()=>{ try{ await navigator.share({title:'Partnerblatt '+PS_SAISON,text:'Partnerblatt '+PS_SAISON+' vom SV/BSC Mörlenbach',url}); }catch(e){} };
  M.querySelector('#psKopie').onclick=async()=>{ try{ await navigator.clipboard.writeText(url); kToast('✓ Link kopiert'); }catch(e){ const i=M.querySelector('.ps-link'); i.select(); } };
}
{ const _a=spoAblage; spoAblage=function(B){ const r=_a.apply(this,arguments); try{ if(B&&!B.querySelector('#psKarte')){ B.insertAdjacentHTML('afterbegin',psKarte()); psVerdrahten(B); } }catch(e){ console.warn('Partnersheet',e); } return r; }; }

/* =====================================================================
   Sportzentrale Beta 0.33 · Immer die neueste Version
   Wunsch Albert (29.09.2026): Lukas hing noch auf einer alten Version. Ab jetzt:
   - Prüfen beim Start sofort, beim Zurückholen der App, bei Fokus, wenn das Netz wieder da ist und alle 5 Minuten
   - Neue Version wird automatisch geladen. Warten nur, solange jemand gerade etwas eintippt oder noch gespeichert wird,
     danach lädt sie von selbst (ein offenes Info-Fenster hält nicht mehr auf)
   - Klappt das Laden nicht (alter Zwischenspeicher), wird der App-Speicher geleert und neu geladen
   - Nach dem Update kurz „Aktualisiert auf Beta …“
   - Nach unten ziehen (installierte App): prüft auf neue Version und lädt die Daten neu
   Nie Daten in Gefahr: Eingaben, ungespeicherte Änderungen und laufendes Speichern gehen immer vor.
   ===================================================================== */
const UPD={dirty:false,warte:null,letzte:0,laeuft:false};
const UPD_KEY='svbcUpd';
function updLesen(){ try{ return JSON.parse(sessionStorage.getItem(UPD_KEY)||'{}')||{}; }catch(e){ return {}; } }
function updSchreiben(o){ try{ sessionStorage.setItem(UPD_KEY,JSON.stringify(o)); }catch(e){} }
// Eingaben in einem offenen Fenster merken, damit dort nichts verloren geht
document.addEventListener('input',e=>{ try{ if(e.target&&e.target.closest&&e.target.closest('#modal'))UPD.dirty=true; }catch(_){} },true);
{ const _sm=svModal; svModal=function(){ UPD.dirty=false; return _sm.apply(this,arguments); }; }
{ const _co=closeOverlay; closeOverlay=function(){ UPD.dirty=false; const r=_co.apply(this,arguments); if(UPD.warte)setTimeout(updVersuchen,400); return r; }; }

appSafeToReload=function(){
  try{ if(crmIsTyping())return false; }catch(e){}
  if(typeof SYNC_ST!=='undefined'&&(SYNC_ST==='pending'||SYNC_ST==='err'))return false;
  try{ if(mvpDirty)return false; }catch(e){}
  try{ const ov=document.getElementById('overlay'); if(ov&&ov.classList.contains('open')&&UPD.dirty)return false; }catch(e){}
  try{ if(document.querySelector('.spo-sig canvas')&&document.getElementById('overlay').classList.contains('open'))return false; }catch(e){}
  return true;
};

async function updHart(){
  // Alter Zwischenspeicher hält fest: App-Speicher leeren und den Service Worker neu holen (Anmeldung und Daten bleiben)
  try{ const ks=await caches.keys(); await Promise.all(ks.filter(k=>k.startsWith('svbc-scout-')).map(k=>caches.delete(k))); }catch(e){}
  try{ const r=await navigator.serviceWorker.getRegistration(); if(r)await r.unregister(); }catch(e){}
}
appReload=function(hart){
  const ziel=_appNew||String(Date.now()), s=updLesen();
  const n=s.build===ziel?(s.n||0)+1:1; updSchreiben({build:ziel,n,von:APP_BUILD});
  try{ sessionStorage.setItem('svbcReloadFor',ziel); }catch(e){}
  try{ lsSet(OUTBOX_KEY,syncSer()); }catch(e){}
  const go=()=>location.replace(location.pathname+'?v='+encodeURIComponent(ziel)+location.hash);
  (async()=>{
    try{ if(hart===true||n>=2)await updHart(); else { const r=navigator.serviceWorker&&await navigator.serviceWorker.getRegistration(); if(r)await r.update().catch(()=>{}); } }catch(e){}
    go();
  })();
};
function updBanner(text){
  let el=document.getElementById('appUpd');
  if(!el){ el=document.createElement('button'); el.id='appUpd'; el.className='appupd'; el.type='button'; document.body.appendChild(el); }
  el.onclick=()=>{ if(typeof SYNC_ST!=='undefined'&&SYNC_ST==='pending'){ kToast('Wird noch gespeichert: gleich nochmal tippen'); return; } appReload(); };
  el.innerHTML=text; el.style.display='';
}
appShowUpdate=function(){ updBanner('🔄 <b>Neue Version ist da</b> · lädt gleich von selbst'); };
function updVersuchen(){
  if(!_appNew||_appNew===APP_BUILD)return;
  const s=updLesen();
  if(s.build===_appNew&&(s.n||0)>=3){ updBanner('🔄 <b>Neue Version</b> · bitte einmal tippen'); return; }  // nicht endlos neu laden
  if(appSafeToReload()){ clearInterval(UPD.warte); UPD.warte=null; appReload(); return; }
  appShowUpdate();
  if(!UPD.warte)UPD.warte=setInterval(()=>{ if(document.visibilityState==='visible')updVersuchen(); },3000);
}
appCheckUpdate=async function(auto){
  if(!/^https?:$/.test(location.protocol))return null;
  const now=Date.now(); if(now-UPD.letzte<8000)return null; UPD.letzte=now;
  try{
    const r=await fetch('version.json?t='+now,{cache:'no-store'}); if(!r.ok)return null;
    const v=await r.json(); if(!v||typeof v.build!=='string'||!v.build)return null;
    if(v.build===APP_BUILD)return false;
    _appNew=v.build; updVersuchen(); return true;
  }catch(e){ return null; }
};
// Wann geprüft wird: sofort, beim Zurückholen, bei Fokus, wenn das Netz zurück ist, alle 5 Minuten, und wenn der Service Worker eine neue Version meldet
setTimeout(()=>appCheckUpdate(true),600);
window.addEventListener('focus',()=>appCheckUpdate(true));
window.addEventListener('pageshow',e=>{ if(e.persisted)appCheckUpdate(true); });
document.addEventListener('visibilitychange',()=>{ if(document.visibilityState==='visible')appCheckUpdate(true); });   // 0.99.44: installierte App kommt aus dem Hintergrund, ohne dass „focus“ feuert
window.addEventListener('online',()=>{ UPD.letzte=0; appCheckUpdate(true); });
setInterval(()=>{ if(document.visibilityState==='visible')appCheckUpdate(true); },5*60*1000);
if(navigator.serviceWorker)navigator.serviceWorker.addEventListener('message',e=>{ if(e.data&&e.data.svbcNeu&&e.data.svbcNeu!==APP_BUILD){ UPD.letzte=0; appCheckUpdate(true); } });

// Nach dem Update einmal bestätigen, dann den Merker löschen
(function(){ const s=updLesen(); if(s.build&&s.build===APP_BUILD){ updSchreiben({}); try{ sessionStorage.removeItem('svbcReloadFor'); }catch(e){}
  setTimeout(()=>{ try{ kToast('✓ Aktualisiert auf '+APP_BUILD.replace(/^beta-/,'Beta ')); }catch(e){} },1800); } })();

/* ---------- Nach unten ziehen zum Aktualisieren (installierte App) ---------- */
(function(){
  if(!('ontouchstart' in window))return;
  let y0=null,x0=0,dy=0,box=null;
  const SCHWELLE=110;
  const oben=()=>(window.scrollY||document.documentElement.scrollTop||0)<=0;
  const darf=t=>{ try{ if(!(typeof appStandalone==='function'&&appStandalone()))return false; if(document.getElementById('overlay').classList.contains('open'))return false;
    if(!document.getElementById('gate')||!document.getElementById('gate').classList.contains('done'))return false;
    if(t&&t.closest&&t.closest('input,textarea,select,canvas,.spo-sig,[data-noptr]'))return false;
    let el=t; while(el&&el!==document.body){ if(el.scrollTop>0)return false; el=el.parentElement; } return oben(); }catch(e){ return false; } };
  const zeig=()=>{ if(!box){ box=document.createElement('div'); box.className='ptr'; box.innerHTML='<i class="ptr-i">↓</i><span></span>'; document.body.appendChild(box); } return box; };
  const weg=()=>{ if(box){ box.classList.remove('an','los','dreht'); box.style.transform=''; box.querySelector('.ptr-i').textContent='↓'; } y0=null; dy=0; };
  document.addEventListener('touchstart',e=>{ if(e.touches.length!==1||UPD.laeuft||!darf(e.target)){ y0=null; return; } y0=e.touches[0].clientY; x0=e.touches[0].clientX; dy=0; },{passive:true});
  document.addEventListener('touchmove',e=>{ if(y0==null)return; const t=e.touches[0]; dy=t.clientY-y0; const dx=Math.abs(t.clientX-x0);
    if(dy<=0||dx>dy||!oben()){ weg(); return; }
    const b=zeig(), h=Math.min(dy*.45,80); b.classList.add('an'); b.classList.toggle('los',dy>SCHWELLE); b.style.transform=`translate(-50%,${h}px)`;
    b.querySelector('span').textContent=dy>SCHWELLE?'Loslassen zum Aktualisieren':'Zum Aktualisieren ziehen'; },{passive:true});
  document.addEventListener('touchend',()=>{ if(y0==null)return; const los=dy>SCHWELLE; if(!los){ weg(); return; }
    const b=zeig(); b.classList.add('dreht'); b.querySelector('.ptr-i').textContent='↻'; b.querySelector('span').textContent='Wird aktualisiert …'; y0=null; updJetzt(b); },{passive:true});
  document.addEventListener('touchcancel',weg,{passive:true});
  async function updJetzt(b){
    UPD.laeuft=true; UPD.letzte=0;
    try{
      const neu=await appCheckUpdate(true);
      if(neu===true){ b.querySelector('span').textContent='Neue Version wird geladen …'; if(appSafeToReload())appReload(); return; }
      try{ if(typeof svDatenNeuLaden==='function')await svDatenNeuLaden(); }catch(e){}
      b.querySelector('span').textContent='✓ Alles aktuell · '+APP_BUILD.replace(/^beta-/,'Beta ');
      b.classList.remove('dreht');
    }finally{ setTimeout(()=>{ UPD.laeuft=false; if(box){ box.classList.remove('an','los','dreht'); box.style.transform=''; box.querySelector('.ptr-i').textContent='↓'; } },1300); }
  }
})();

/* =====================================================================
   Sportzentrale Beta 0.34 · Banden am Sportplatz (Partner-Bereich, Reiter „Banden“)
   - Standard aus der Begehung mit Benjamin Steinmaus (29.09.2026): 500 × 80 cm aus zwei Platten 250 × 80 cm, 3 mm Aluminiumverbund
   - Jede Bande mit Foto, Firma, Lage, Maßen, Zustand (gut / erneuern / prüfen) und ob der Partner dabei bleibt
   - Zuständig: Rolle „banden“ aus den Zuständigkeiten (Name kommt aus der Datenbank, nicht aus dem Code)
   Immer „Partner“, nie „Sponsor“.
   ===================================================================== */
const BD={L:[],flt:'alle',rolle:null,err:null};
// Zustand mit Linien-Icons (wie im übrigen Partnerbereich), Wort immer dabei
const BD_Z={gut:['gut',SVI('check')+' Gut'],erneuern:['erneuern',SVI('refresh')+' Erneuern'],pruefen:['pruefen',SVI('info')+' Prüfen']};
const BD_P={ja:'Partner bleibt',unklar:'Partner fragen',nein:'Partner hört auf'};
const BD_STANDARD='500 × 80 cm (2 Platten à 250 × 80 cm)';
async function bdLaden(){
  try{ const {data,error}=await SVB.sb.from('banden').select('*').order('nr').order('firma'); if(error)throw error; BD.L=data||[]; BD.err=null; }catch(e){ BD.err=String(e.message||e); }
  if(BD.rolle===null){ try{ const R=await ogRpc('orga_rollen'); BD.rolle=(R||[]).find(r=>r.key==='banden')||false; }catch(e){ BD.rolle=false; } }
}
async function spoBanden(B){
  // Filter antippen lädt nicht neu (die Liste ist schon da), sonst frisch vom Server
  if(BD.ohneLaden&&BD.L.length){ BD.ohneLaden=false; }else{ B.innerHTML='<div class="card"><div class="empty">Lade Banden …</div></div>'; await bdLaden(); } if(SPO.view!=='banden')return;
  if(BD.err){ B.innerHTML=`<div class="card"><div class="empty">Banden konnten nicht geladen werden: ${svEsc(BD.err)}</div></div>`; return; }
  const L=BD.L, n=k=>L.filter(b=>b.zustand===k).length, unklar=L.filter(b=>b.partner_aktiv==='unklar'&&b.bild!=='banden/nichtraucher.jpg').length;
  const F=[['alle','Alle '+L.length],['erneuern','Erneuern '+n('erneuern')],['pruefen','Prüfen '+n('pruefen')],['gut','Gut '+n('gut')],['unklar','Partner fragen '+unklar]];
  const liste=L.filter(b=>BD.flt==='alle'||(BD.flt==='unklar'?b.partner_aktiv==='unklar'&&b.bild!=='banden/nichtraucher.jpg':b.zustand===BD.flt));
  const R=BD.rolle;
  B.innerHTML=`<div class="card bd-kopf"><div class="bd-k1"><div><h3 class="trh" style="margin:0">${SVI('grid')} Banden am Sportplatz</h3>
        <p class="note" style="margin:6px 0 0">Bei der Begehung am 29.09.2026${R&&R.namen?' mit '+svEsc(R.namen):''} hieß es: 14 Banden sollten erneuert werden, sofern die Partner dabei bleiben. Ein Angebot kommt. Die Zahlen unten sind unsere Einschätzung nach den Fotos.</p></div>
        <button class="btn sm" type="button" id="bdNeu">${SVI('plus')} Bande</button></div>
      <div class="bd-std"><div><b>Standardmaß</b><span>500 × 80 cm, zwei Platten à 250 × 80 cm</span></div><div><b>Material</b><span>3 mm Aluminiumverbund</span></div>
        <div><b>Haltbarkeit</b><span>Druck bleibt 7 bis 10 Jahre farbstabil, danach neu mit Folie bekleben, die Platten bleiben</span></div>
        <div><b>Rückseiten</b><span>Meist noch alte Schutzfolie drauf, deshalb hinten nicht mehr beschriftbar</span></div></div>
      ${R&&R.namen?`<div class="bd-wer">Zuständig: <b>${svEsc(R.namen)}</b>${R.tel?` · <a href="tel:${svEsc(String(R.tel).replace(/[^0-9+]/g,''))}">${svEsc(R.tel)}</a>`:''}</div>`:''}
      <div class="bd-zahlen">${[['erneuern',n('erneuern'),'erneuern'],['pruefen',n('pruefen'),'prüfen'],['gut',n('gut'),'gut'],['unklar',unklar,'Partner fragen']].map(([k,z,l])=>`<button type="button" class="z-${k}${BD.flt===k?' on':''}" data-bdf="${k}" data-bdzahl="1" aria-pressed="${BD.flt===k}"><b>${z}</b>${l}</button>`).join('')}</div>
      <p class="note small">Zustand nach den Fotos geschätzt. Bitte mit der Liste vom Platzwart abgleichen. Zahl antippen zeigt genau diese Banden, Bande antippen zum Ändern.</p>
      ${bdOhnePartner().length?`<div class="bd-zuord"><span>${SVI('link')} ${bdOhnePartner().length===1?'1 Bande passt zu einer Firma im Partner-Bereich, ist aber':bdOhnePartner().length+' Banden passen zu einer Firma im Partner-Bereich, sind aber'} noch nicht verknüpft.</span><button class="btn sm ghost" type="button" id="bdZuord">Firmen zuordnen</button></div>`:''}</div>
    <div class="chips4 bd-f">${F.map(([k,l])=>`<button type="button" class="${BD.flt===k?'on':''}" data-bdf="${k}">${l}</button>`).join('')}</div>
    <div class="bd-grid">${liste.map(b=>`<button type="button" class="bd-b z-${svEsc(b.zustand)}" data-bd="${svEsc(b.id)}">
        <span class="bd-bild">${b.bild?`<img src="${svEsc(b.bild)}" alt="" loading="lazy">`:'<i>Kein Foto</i>'}</span>
        <span class="bd-t"><b>${b.nr?b.nr+'. ':''}${svEsc(b.firma)}</b><small>${[b.lage,b.masse!==BD_STANDARD?b.masse:''].filter(Boolean).map(svEsc).join(' · ')}</small>
          <span class="bd-chips"><i class="bd-z z-${svEsc(b.zustand)}">${BD_Z[b.zustand][1]}</i>${b.bild==='banden/nichtraucher.jpg'?'':`<i class="bd-p p-${svEsc(b.partner_aktiv)}">${BD_P[b.partner_aktiv]}</i>`}</span>
          ${b.notiz?`<em>${svEsc(b.notiz)}</em>`:''}</span></button>`).join('')||'<div class="empty">Keine Banden in dieser Auswahl.</div>'}</div>`;
  B.querySelectorAll('[data-bdf]').forEach(x=>x.onclick=async()=>{ const zahl=!!x.dataset.bdzahl, k=x.dataset.bdf; BD.flt=(zahl&&BD.flt===k)?'alle':k; BD.springen=zahl; BD.ohneLaden=true; await spoBanden(B); });
  if(BD.springen){ BD.springen=false; const g=B.querySelector('.bd-f'); if(g)try{ g.scrollIntoView({behavior:'smooth',block:'start'}); }catch(e){} }
  const zb=B.querySelector('#bdZuord'); if(zb)zb.onclick=()=>bdZuordnen(B);
  B.querySelectorAll('[data-bd]').forEach(x=>x.onclick=()=>bdForm(BD.L.find(b=>b.id===x.dataset.bd),B));
  B.querySelector('#bdNeu').onclick=()=>bdForm(null,B);
}
function bdForm(b,B){
  const x=b||{zustand:'pruefen',partner_aktiv:'unklar',masse:BD_STANDARD,material:'3 mm Aluminiumverbund',nr:(BD.L.reduce((a,y)=>Math.max(a,y.nr||0),0)+1)};
  const vor=bdTreffer(x.firma,x.partner_nein);
  const seg=(name,werte,akt)=>`<div class="svt-seg3 bd-seg" data-bdseg="${name}">${werte.map(([k,l])=>`<button type="button" class="${akt===k?'on':''}" data-v="${k}">${l}</button>`).join('')}</div>`;
  const M=svModal(`<div class="mhead"><div><h2 style="margin:0">${b?svEsc(b.firma):'Neue Bande'}</h2><div class="msub">${b&&b.lage?svEsc(b.lage):'Banden am Sportplatz'}</div></div></div>
    ${b&&b.bild?`<img class="bd-gross" src="${svEsc(b.bild)}" alt="">`:''}
    <form id="bdF" class="editgrid svt-form" autocomplete="off">
      <div class="field" style="grid-column:1/-1"><label>Firma / Motiv *</label><input name="firma" required maxlength="120" value="${svEsc(x.firma||'')}"></div>
      <div class="field"><label>Nr. am Platz</label><input name="nr" type="number" min="0" max="999" value="${svEsc(x.nr||0)}"></div>
      <div class="field"><label>Lage</label><input name="lage" maxlength="60" placeholder="z.B. Längsseite" value="${svEsc(x.lage||'')}"></div>
      <div class="field"><label>Maße</label><input name="masse" maxlength="80" value="${svEsc(x.masse||'')}"></div>
      <div class="field"><label>Material</label><input name="material" maxlength="80" value="${svEsc(x.material||'')}"></div>
      <div class="field" style="grid-column:1/-1"><label>Zustand</label>${seg('zustand',[['gut',BD_Z.gut[1]],['erneuern',BD_Z.erneuern[1]],['pruefen',BD_Z.pruefen[1]]],x.zustand)}</div>
      <div class="field" style="grid-column:1/-1"><label>Bleibt der Partner dabei?</label>${seg('partner_aktiv',[['ja','Ja'],['unklar','Fragen'],['nein','Nein']],x.partner_aktiv)}</div>
      <div class="field" style="grid-column:1/-1"><label>Firma im Partner-Bereich</label><select name="sponsor"><option value="">keine</option>${[...SPO.S].sort((a,c)=>String(a.firma||'').localeCompare(String(c.firma||''),'de')).map(s=>`<option value="${svEsc(s.id)}"${(x.sponsor||vor.id)===s.id?' selected':''}>${svEsc(s.firma)}</option>`).join('')}</select>
        ${!x.sponsor&&vor.id?`<small class="bd-vor">${SVI('link')} Passend zur Bande vorgeschlagen. Mit Speichern wird sie verknüpft.</small>`:''}
        ${!x.sponsor&&!vor.id&&vor.kand.length?`<small class="bd-vor">Passt vielleicht: ${vor.kand.map(s=>`<button type="button" class="bd-kand" data-bdkand="${svEsc(s.id)}">${svEsc(s.firma)}</button>`).join(' ')}</small>`:''}</div>
      <div class="field" style="grid-column:1/-1"><label>Notiz</label><textarea name="notiz" maxlength="600" rows="2">${svEsc(x.notiz||'')}</textarea></div>
      <div class="field" style="grid-column:1/-1"><label>Foto-Link (Drive)</label><input name="foto_link" type="url" maxlength="300" placeholder="https://…" value="${svEsc(x.foto_link||'')}"></div>
      <div class="btnrow sbact" style="grid-column:1/-1"><button class="btn" type="submit">Speichern</button>${b?'<button class="btn ghost danger" type="button" id="bdDel">Entfernen</button>':''}<button class="btn ghost" type="button" onclick="closeOverlay()">Abbrechen</button></div>
    </form>`);
  const wert={zustand:x.zustand,partner_aktiv:x.partner_aktiv};
  M.querySelectorAll('[data-bdkand]').forEach(k=>k.onclick=()=>{ M.querySelector('select[name="sponsor"]').value=k.dataset.bdkand; k.closest('.bd-vor').textContent='Ausgewählt. Mit Speichern wird sie verknüpft.'; });
  M.querySelectorAll('[data-bdseg]').forEach(g=>g.querySelectorAll('button').forEach(k=>k.onclick=()=>{ wert[g.dataset.bdseg]=k.dataset.v; g.querySelectorAll('button').forEach(y=>y.classList.toggle('on',y===k)); }));
  M.querySelector('#bdF').onsubmit=async e=>{ e.preventDefault(); const fd=new FormData(e.target), t=k=>String(fd.get(k)||'').trim()||null;
    const r={firma:t('firma'),nr:+fd.get('nr')||0,lage:t('lage'),masse:t('masse')||BD_STANDARD,material:t('material'),zustand:wert.zustand,partner_aktiv:wert.partner_aktiv,
      sponsor:t('sponsor'),partner_nein:(!x.sponsor&&vor.id&&t('sponsor')!==vor.id)?vor.id:(x.partner_nein||null),notiz:t('notiz'),foto_link:t('foto_link'),geaendert_am:new Date().toISOString(),geaendert_von:SVU.name||null};
    if(!r.firma)return kToast('⚠️ Bitte die Firma eintragen');
    if(r.foto_link&&!/^https:\/\//.test(r.foto_link))return kToast('⚠️ Der Foto-Link muss mit https:// beginnen');
    const q=b?SVB.sb.from('banden').update(r).eq('id',b.id):SVB.sb.from('banden').insert(r);
    const {error}=await q; if(error)return kToast('⚠️ '+error.message);
    closeOverlay(); kToast('✓ Gespeichert'); spoBanden(B); };
  const d=M.querySelector('#bdDel'); if(d)d.onclick=async()=>{ const alt=b; const {error}=await SVB.sb.from('banden').delete().eq('id',b.id); if(error)return kToast('⚠️ '+error.message);
    closeOverlay(); spoBanden(B); kToast('Bande entfernt','Rückgängig',async()=>{ const {id,...rest}=alt; await SVB.sb.from('banden').insert(rest); spoBanden(B); }); };
}

/* 0.89 · Firma im Partner-Bereich automatisch finden.
   Namen werden vereinfacht (Umlaute, Rechtsformen und Füllwörter raus), dann zählen gemeinsame Wörter.
   Ein Wort, das in vielen Firmen vorkommt, zählt weniger; Branchen- und Ortswörter fast nichts.
   Vorgeschlagen wird nur, wenn eine Firma klar vorne liegt. */
const BD_STOP=new Set(['gmbh','mbh','ggmbh','co','kg','ag','eg','ug','gbr','ek','e','k','inh','inhaber','inhaberin','und','der','die','das','von','fuer','ihr','ihre','am','im','filiale','niederlassung','intern','vertriebs','group','of','companies','gesellschaft','name','pruefen','bande','banner','schwarz','dunkelgruen','verein','gemeinde','fa','firma']);
const BD_ALLG=new Set(['bad','heizung','sanitaer','installation','installationen','elektro','elektrotechnik','getraenke','markt','spedition','autohaus','auto','reisen','immobilien','bau','baustoffe','transporte','versicherung','versicherungen','service','moerlenbach','odenwald','odenwaelder','weschnitztal','kurpfalz','senioren','pflegeheim','partner','steuerberatung','modehaus','aktiv','abholmarkt','kuehlung','lebensmittel']);
const BD_ORTE=new Set(['weschnitztal','kurpfalz','starkenburg','bergstrasse','odenwald','moerlenbach','weinheim','rimbach','fuerth','birkenau','heppenheim','bensheim','lorsch','mannheim','heidelberg','darmstadt']);
function bdWorte(t){
  return String(t||'').toLowerCase().replace(/ä/g,'ae').replace(/ö/g,'oe').replace(/ü/g,'ue').replace(/ß/g,'ss').normalize('NFD').replace(/[\u0300-\u036f]/g,'')
    .split(/[^a-z0-9]+/).filter(w=>w.length>=3&&!BD_STOP.has(w));
}
function bdTreffer(firma,nein){
  const S=(typeof SPO!=='undefined'&&SPO.S)||[], w=[...new Set(bdWorte(firma))]; if(!w.length||!S.length)return {id:null,kand:[]};
  const voll=w.join(' '), W=S.filter(s=>s.id!==nein).map(s=>({s,w:new Set(bdWorte(s.firma))}));
  const gleich=W.filter(x=>[...x.w].join(' ')===voll); if(gleich.length===1)return {id:gleich[0].s.id,kand:[gleich[0].s]};
  const df={}; W.forEach(x=>x.w.forEach(t=>{ df[t]=(df[t]||0)+1; }));
  // Steht bei beiden ein Ort und der Ort ist ein anderer (Volksbank Weschnitztal, Volksbank Kurpfalz), passt es nicht
  const ort=w.filter(t=>BD_ORTE.has(t)), passtOrt=x=>{ const o=[...x.w].filter(t=>BD_ORTE.has(t)); return !ort.length||!o.length||o.some(t=>ort.includes(t)); };
  const P=W.filter(passtOrt).map(x=>({s:x.s,p:w.reduce((a,t)=>a+(x.w.has(t)?(BD_ALLG.has(t)?0.25:1)/df[t]:0),0)})).filter(x=>x.p>0).sort((a,b)=>b.p-a.p);
  const kand=P.filter(x=>x.p>=0.45).slice(0,3).map(x=>x.s);
  if(P.length&&P[0].p>=0.9&&(!P[1]||P[0].p-P[1].p>=0.5))return {id:P[0].s.id,kand};
  return {id:null,kand};
}
function bdOhnePartner(){ return BD.L.filter(b=>!b.sponsor).map(b=>({b,id:bdTreffer(b.firma,b.partner_nein).id})).filter(x=>x.id); }
function bdZuordnen(B){
  const L=bdOhnePartner(); if(!L.length)return kToast('Alles schon verknüpft');
  const fn=id=>(SPO.S.find(s=>s.id===id)||{}).firma||'';
  const M=svModal(`<div class="mhead"><div><h2 style="margin:0">Firmen zuordnen</h2><div class="msub">Diese Banden passen zu einer Firma im Partner-Bereich. Haken raus, wenn etwas nicht stimmt.</div></div></div>
    <div class="bd-zl">${L.map((x,i)=>`<label class="bd-zr"><input type="checkbox" checked data-bdzi="${i}"><span><b>${svEsc(x.b.firma)}</b><small>wird verknüpft mit ${svEsc(fn(x.id))}</small></span></label>`).join('')}</div>
    <p class="note small">Ohne Haken wird diese Firma für die Bande nicht mehr vorgeschlagen.</p>
    <div class="btnrow sbact"><button class="btn" type="button" id="bdZok">Verknüpfen</button><button class="btn ghost" type="button" onclick="closeOverlay()">Abbrechen</button></div>`);
  M.querySelector('#bdZok').onclick=async e=>{ const btn=e.currentTarget; if(btn.disabled)return; btn.disabled=true; btn.textContent='Speichere …';
    const C=[...M.querySelectorAll('[data-bdzi]')], wahl=C.filter(c=>c.checked).map(c=>L[+c.dataset.bdzi]), nein=C.filter(c=>!c.checked).map(c=>L[+c.dataset.bdzi]); let ok=0, fehler='';
    for(const x of wahl){ const {data,error}=await SVB.sb.from('banden').update({sponsor:x.id,geaendert_am:new Date().toISOString(),geaendert_von:SVU.name||null}).eq('id',x.b.id).is('sponsor',null).select('id'); if(error)fehler=svFehlerText(error); else ok+=(data||[]).length; }
    // Haken rausgenommen: diese Firma für die Bande nicht mehr vorschlagen
    for(const x of nein){ const {error}=await SVB.sb.from('banden').update({partner_nein:x.id}).eq('id',x.b.id).is('sponsor',null); if(error)fehler=svFehlerText(error); }
    closeOverlay(); const z=(ok===1?'1 Bande':ok+' Banden')+' verknüpft'; kToast(fehler?'⚠️ '+z+', Rest nicht gespeichert: '+fehler:'✓ '+z); spoBanden(B); };
}

/* =====================================================================
   Sportzentrale Beta 0.35 · Helferpool
   - Wer bei der Jahreshauptversammlung den QR-Code scannt, trägt sich mit Namen, Geburtsdatum, Handy und E-Mail ein
     und kommt danach in die WhatsApp-Gruppe „Unterstützer und Helferpool“ (Seite: svbsc.albertklee.de/#mitmachen=jhv26)
   - Hier in der App (Aufgaben → Helferpool): Liste, Suche, „Nummer prüfen“ für Beitrittsanfragen in WhatsApp,
     Anrufen/WhatsApp, „In der Gruppe“ abhaken, Notiz, löschen auf Wunsch, alle als Kontakte (vCard) oder Liste (CSV) speichern
   - Admin: Anmeldung öffnen/schließen, Aushang zum Ausdrucken
   ===================================================================== */
const HP={d:null,q:'',nur:'alle',b:''};
const HP_I={kasse:'💶 Kasse',ausschank:'🍺 Ausschank',grill:'🌭 Grill',kuchen:'🍰 Kaffee & Kuchen',aufbau:'🛠️ Auf- und Abbau',fahrdienst:'🚗 Fahrdienst',handwerk:'🔧 Handwerk',medien:'📸 Medien',jugend:'⚽ Jugend & Turniere',ueberall:'🙌 Überall'};
// Bereiche wie auf dem Mitmach-Zettel (ab 0.46)
const HP_B={vereinsentwicklung:'Vereinsentwicklung & Projekte',heimspieltag:'Heimspieltag & Spielbetrieb',veranstaltungen:'Veranstaltungen',kommunikation:'Kommunikation & Marketing',partner:'Partnerschaften',jugend:'Jugend',senioren:'Senioren & Sportentwicklung',soma:'SOMA',unsicher:'Noch unsicher',nicht:'Möchte nicht mithelfen'};
const HP_LINK='https://svbsc.albertklee.de/#mitmachen=';
function hpNorm(t){ let x=String(t||'').replace(/\(0\)/g,'').replace(/[^0-9+]/g,''); if(x.startsWith('00'))x='+'+x.slice(2); if(x.startsWith('0'))x='+49'+x.slice(1); if(/^1[5-7]\d{8,9}$/.test(x))x='+49'+x; if(!x.startsWith('+'))x='+'+x; if(x.startsWith('+490'))x='+49'+x.slice(4); return x; }
function hpZeigeNr(h){ const m=String(h||'').match(/^\+49(1\d{2})(\d+)$/); return m?'0'+m[1]+' '+m[2]:String(h||'').replace(/^\+49/,'0'); }
async function hpLaden(){ HP.d=await ogRpc('helferpool_liste'); return HP.d; }
// Knopf unten bei den Aufgaben
{ const _r=ogRender; ogRender=async function(){ const r=await _r.apply(this,arguments);
  try{ const P=document.getElementById('panel-orga'), f=P&&P.querySelector('.og-fuss'); if(f&&!f.querySelector('#ogHelfer')&&OG.ue&&OG.ue.darf){ const b=document.createElement('button'); b.type='button'; b.className='btn ghost sm'; b.id='ogHelfer'; b.innerHTML='🙌 Helferpool'; f.prepend(b); b.onclick=()=>hpOeffnen(); } }catch(e){} return r; }; }
async function hpOeffnen(){
  const M=svModal('<div class="og-form"><h2>🙌 Helferpool</h2><div class="empty">Lade …</div></div>');
  try{ await hpLaden(); }catch(e){ M.querySelector('.empty').textContent='⚠️ '+e.message; return; }
  hpZeigen();
}
function hpZeigen(){
  const M=document.getElementById('modal'); if(!M||!HP.d)return;
  const H=HP.d.helfer||[], q=HP.q.trim().toLowerCase(), ziffern=HP.q.replace(/[^0-9]/g,''), qn=ziffern.length>=5?hpNorm(HP.q):'';
  const nrPasst=h=>!!qn&&!!h.handy&&(h.handy===qn||h.handy.includes(ziffern)||h.handy.replace(/^\+49/,'0').includes(ziffern));
  const L=H.filter(h=>(HP.nur==='alle'||(HP.nur==='link'?!!h.geklickt:HP.nur==='neu'?!h.in_gruppe:h.in_gruppe))&&(!HP.b||(h.bereiche||[]).includes(HP.b))&&(!q||(h.vorname+' '+h.nachname+' '+(h.email||'')+' '+(h.idee||'')+' '+(h.mitgeben||'')).toLowerCase().includes(q)||nrPasst(h)));
  const bz={}; H.forEach(h=>(h.bereiche||[]).forEach(b=>bz[b]=(bz[b]||0)+1));
  const nichtDrin=H.filter(h=>!h.in_gruppe).length, geklickt=H.filter(h=>h.geklickt).length, admin=svRole()==='admin';
  M.innerHTML=`<button class="close" id="svClose" aria-label="Schließen">✕</button><div class="og-form hp"><h2>🙌 Helferpool <small>${H.length} eingetragen</small></h2>
    <p class="note">Alles vom Mitmach-Zettel und von der Online-Seite: Kontakt, Bereiche, Ideen und was die Leute uns mit auf den Weg geben. Wer eine Nummer angibt, steht hier, bevor er in der WhatsApp-Gruppe ist.</p>
    <div class="hp-such"><input type="search" id="hpQ" placeholder="Name oder Handynummer, z.B. aus einer Beitrittsanfrage" value="${svEsc(HP.q)}"></div>
    ${ziffern.length>=7&&/^[+0-9 ()\/-]+$/.test(HP.q.trim())?`<div class="hp-pruef ${L.length?'ok':'nein'}">${L.length?`✓ Die Nummer gehört zu <b>${svEsc(L[0].vorname+' '+L[0].nachname)}</b>`:'✗ Diese Nummer hat sich <b>nicht</b> eingetragen. Im Zweifel erst nachfragen.'}</div>`:''}
    <div class="chips4 hp-f">${[['alle','Alle '+H.length],['neu','Noch nicht in der Gruppe '+nichtDrin],['drin','In der Gruppe '+(H.length-nichtDrin)],['link','Gruppenlink getippt '+geklickt]].map(([k,l])=>`<button type="button" class="${HP.nur===k?'on':''}" data-hpf="${k}">${l}</button>`).join('')}</div>
    ${Object.keys(bz).length?`<div class="chips4 hp-f hp-bf"><button type="button" class="${!HP.b?'on':''}" data-hpb="">Alle Bereiche</button>${Object.keys(HP_B).filter(k=>bz[k]).map(k=>`<button type="button" class="${HP.b===k?'on':''}" data-hpb="${k}">${svEsc(HP_B[k])} ${bz[k]}</button>`).join('')}</div>`:''}
    <div class="hp-l">${L.map(h=>`<div class="hp-r" data-hp="${svEsc(h.id)}"><div class="hp-kopf"><b>${svEsc(h.vorname+' '+h.nachname)}</b><span>${h.alter!=null?h.alter+' J.':''}</span>${h.geklickt?`<span class="hp-link" title="${svEsc(h.klicks+'× auf den Gruppenlink getippt')}">💬 Link getippt ${svEsc(new Date(h.geklickt).toLocaleDateString('de-DE',{day:'2-digit',month:'2-digit'}))} ${svEsc(new Date(h.geklickt).toLocaleTimeString('de-DE',{hour:'2-digit',minute:'2-digit'}))}</span>`:''}
        <label class="hp-drin"><input type="checkbox" data-hpg="${svEsc(h.id)}"${h.in_gruppe?' checked':''}> in der Gruppe</label></div>
        <div class="hp-kontakt">${h.handy?`<a href="tel:${svEsc(h.handy)}">📞 ${svEsc(hpZeigeNr(h.handy))}</a><a href="https://wa.me/${svEsc(h.handy.replace('+',''))}" target="_blank" rel="noopener">💬 WhatsApp</a>`:''}${h.email?`<a href="mailto:${svEsc(h.email)}">✉️ ${svEsc(h.email)}</a>`:''}</div>
        ${(h.bereiche||[]).length?`<div class="hp-int">${h.bereiche.map(i=>`<i class="${i==='nicht'?'hp-nicht':''}">${svEsc(HP_B[i]||i)}</i>`).join('')}</div>`:''}
        ${(h.interessen||[]).length?`<div class="hp-int">${h.interessen.map(i=>`<i>${svEsc(HP_I[i]||i)}</i>`).join('')}</div>`:''}
        ${h.idee?`<div class="hp-txt"><b>Meine Idee</b>${svEsc(h.idee)}</div>`:''}${h.mitgeben?`<div class="hp-txt"><b>Mit auf den Weg</b>${svEsc(h.mitgeben)}</div>`:''}
        <div class="hp-fuss"><small>${svEsc(h.quelle||'')} · ${svEsc(new Date(h.am).toLocaleDateString('de-DE'))}</small><input class="hp-notiz" data-hpn="${svEsc(h.id)}" maxlength="300" placeholder="Notiz" value="${svEsc(h.bemerkung||'')}"><button type="button" class="svt-x" data-hpx="${svEsc(h.id)}" aria-label="Löschen">✕</button></div></div>`).join('')||'<div class="empty">Niemand gefunden.</div>'}</div>
    <div class="btnrow sbact"><button class="btn" type="button" id="hpVcf">📇 Alle als Kontakte speichern</button><button class="btn ghost" type="button" id="hpCsv">📄 Liste (CSV)</button>
      <button class="btn ghost" type="button" id="hpLink">🔗 Anmeldelink</button>${admin?`<a class="btn ghost" href="formulare/Aushang-Helferpool.pdf" target="_blank" rel="noopener">🖨️ Aushang mit QR-Code</a>`:''}</div>
    <p class="note small">Tipp: In WhatsApp unter Gruppeneinstellungen „Neue Mitglieder genehmigen“ einschalten. Dann siehst du bei jeder Beitrittsanfrage die Nummer und prüfst sie oben. Nach dem Speichern als Kontakte zeigt WhatsApp in der Gruppe die Namen statt Nummern.</p>
    ${admin&&HP.d.quellen?`<details class="hp-adm"><summary>Anmeldung verwalten (Admin)</summary>${HP.d.quellen.map(x=>`<div class="hp-q"><b>${svEsc(x.titel)}</b><small>${svEsc(HP_LINK+x.code)}${x.wa?'':' · kein Gruppenlink'}</small><button type="button" class="btn ghost sm" data-hpq="${svEsc(x.code)}" data-an="${x.aktiv?0:1}" data-t="${svEsc(x.titel)}">${x.aktiv?'Schließen':'Wieder öffnen'}</button></div>`).join('')}</details>`:''}</div>`;
  document.getElementById('svClose').onclick=()=>closeOverlay();
  const qi=M.querySelector('#hpQ'); qi.oninput=()=>{ HP.q=qi.value; const pos=qi.selectionStart; hpZeigen(); const n=document.getElementById('hpQ'); n.focus(); try{ n.setSelectionRange(pos,pos); }catch(e){} };
  M.querySelectorAll('[data-hpf]').forEach(b=>b.onclick=()=>{ HP.nur=b.dataset.hpf; hpZeigen(); });
  M.querySelectorAll('[data-hpb]').forEach(b=>b.onclick=()=>{ HP.b=b.dataset.hpb; hpZeigen(); });
  M.querySelectorAll('[data-hpg]').forEach(c=>c.onchange=async()=>{ try{ await ogRpc('helferpool_aendern',{p_id:c.dataset.hpg,p:{in_gruppe:c.checked}}); const h=HP.d.helfer.find(x=>x.id===c.dataset.hpg); if(h)h.in_gruppe=c.checked; kToast(c.checked?'✓ In der Gruppe':'Nicht in der Gruppe'); }catch(e){ kToast('⚠️ '+e.message); c.checked=!c.checked; } });
  M.querySelectorAll('[data-hpn]').forEach(i=>i.onchange=async()=>{ try{ await ogRpc('helferpool_aendern',{p_id:i.dataset.hpn,p:{bemerkung:i.value}}); const h=HP.d.helfer.find(x=>x.id===i.dataset.hpn); if(h)h.bemerkung=i.value; kToast('✓ Notiz gespeichert'); }catch(e){ kToast('⚠️ '+e.message); } });
  M.querySelectorAll('[data-hpx]').forEach(b=>b.onclick=()=>{ const h=HP.d.helfer.find(x=>x.id===b.dataset.hpx); if(!h)return; const r=b.closest('.hp-r');
    if(!r.querySelector('.hp-weg')){ r.insertAdjacentHTML('beforeend',`<div class="hp-weg">${svEsc(h.vorname)} wirklich löschen? Das geht nicht rückgängig. <button type="button" class="btn sm danger" data-hpja="1">Ja, löschen</button> <button type="button" class="btn ghost sm" data-hpnein="1">Nein</button></div>`);
      r.querySelector('[data-hpnein]').onclick=()=>r.querySelector('.hp-weg').remove();
      r.querySelector('[data-hpja]').onclick=async()=>{ try{ await ogRpc('helferpool_loeschen',{p_id:h.id}); HP.d.helfer=HP.d.helfer.filter(x=>x.id!==h.id); kToast('Gelöscht'); hpZeigen(); }catch(e){ kToast('⚠️ '+e.message); } }; } });
  M.querySelector('#hpVcf').onclick=()=>hpDatei('vcf'); M.querySelector('#hpCsv').onclick=()=>hpDatei('csv');
  M.querySelector('#hpLink').onclick=async()=>{ const u=HP_LINK+'jhv26'; try{ await navigator.clipboard.writeText(u); kToast('✓ Link kopiert'); }catch(e){ kToast(u); } };
  M.querySelectorAll('[data-hpq]').forEach(b=>b.onclick=async()=>{ try{ await ogRpc('helfer_quelle_speichern',{p_code:b.dataset.hpq,p_titel:b.dataset.t,p_wa:null,p_aktiv:b.dataset.an==='1'}); await hpLaden(); hpZeigen(); kToast(b.dataset.an==='1'?'✓ Anmeldung wieder offen':'Anmeldung geschlossen'); }catch(e){ kToast('⚠️ '+e.message); } });
}
function hpDatei(art){
  const H=(HP.d&&HP.d.helfer)||[]; if(!H.length)return kToast('Noch niemand eingetragen');
  let txt, name, typ;
  if(art==='vcf'){ const e=s=>String(s||'').replace(/([,;\\])/g,'\\$1');
    txt=H.filter(h=>h.handy||h.email).map(h=>['BEGIN:VCARD','VERSION:3.0',`N:${e(h.nachname)};${e(h.vorname)};;;`,`FN:${e(h.vorname+' '+h.nachname)} (Helfer SV)`,h.handy?`TEL;TYPE=CELL:${h.handy}`:'',h.email?`EMAIL:${e(h.email)}`:'','ORG:SV/BSC Mörlenbach Helferpool',
      h.geburtsdatum?`BDAY:${h.geburtsdatum}`:'','END:VCARD'].filter(Boolean).join('\r\n')).join('\r\n')+'\r\n'; name='Helferpool-SV-BSC.vcf'; typ='text/vcard'; }
  else { const c=v=>'"'+String(v==null?'':v).replace(/"/g,'""')+'"';
    txt='﻿'+[['Vorname','Nachname','Geburtsdatum','Handy','E-Mail','Bereiche','Meine Idee','Mit auf den Weg','Hilft bei (alt)','Gruppenlink getippt','In der Gruppe','Notiz','Eingetragen'].map(c).join(';')]
      .concat(H.map(h=>[h.vorname,h.nachname,h.geburtsdatum,h.handy?hpZeigeNr(h.handy):'',h.email,(h.bereiche||[]).map(i=>HP_B[i]||i).join(', '),h.idee,h.mitgeben,(h.interessen||[]).map(i=>(HP_I[i]||i).replace(/^\S+\s/,'')).join(', '),h.geklickt?new Date(h.geklickt).toLocaleString('de-DE'):'',h.in_gruppe?'ja':'nein',h.bemerkung,new Date(h.am).toLocaleDateString('de-DE')].map(c).join(';'))).join('\r\n');
    name='Helferpool-SV-BSC.csv'; typ='text/csv'; }
  const a=document.createElement('a'); a.href=URL.createObjectURL(new Blob([txt],{type:typ+';charset=utf-8'})); a.download=name; document.body.appendChild(a); a.click(); setTimeout(()=>{ URL.revokeObjectURL(a.href); a.remove(); },1500);
  kToast(art==='vcf'?'✓ Kontakte gespeichert: Datei öffnen und „Alle hinzufügen“':'✓ Liste gespeichert');
}

/* =====================================================================
   Beta 0.47 · Helferpool nach Bereichen
   - Wer interessiert sich wofür: je Bereich die Leute, „noch unsicher“ als eigene Gruppe
   - Je Bereich einen eigenen WhatsApp-Gruppenlink hinterlegen
   - „Einladen“ öffnet WhatsApp oder Mail auf dem eigenen Handy mit fertigem Text; die App merkt sich, wer wen wann eingeladen hat
   - Je Bereich: Nummern kopieren, Kontakte (vCard), Liste (CSV)
   ===================================================================== */
const HP_REIHE=['heimspieltag','veranstaltungen','vereinsentwicklung','kommunikation','partner','jugend','senioren','soma','unsicher'];
{ const _hz=hpZeigen; hpZeigen=function(){ if(HP.ansicht==='bereiche')return hpBereiche(); const r=_hz.apply(this,arguments);
    try{ const M=document.getElementById('modal'), h2=M&&M.querySelector('.hp h2'); if(h2&&!M.querySelector('#hpAnsicht')){ const b=document.createElement('div'); b.className='chips4 hp-ans'; b.id='hpAnsicht';
        b.innerHTML='<button type="button" class="on">Alle Personen</button><button type="button" data-hpa="bereiche">Nach Bereichen</button>'; h2.insertAdjacentElement('afterend',b);
        b.querySelector('[data-hpa]').onclick=()=>{ HP.ansicht='bereiche'; hpZeigen(); }; } }catch(e){}
    return r; }; }
function hpMeinName(){ return (typeof SVU!=='undefined'&&SVU.name)||''; }
function hpEingeladen(h,b){ return (h.einladungen||[]).filter(e=>e.bereich===b).slice(-1)[0]||null; }
function hpText(h,b){ const link=(HP.d.gruppen||{})[b], n=hpMeinName(), was=HP_B[b]||b;
  if(b==='unsicher')return `Hallo ${h.vorname}, schön, dass du beim SV/BSC Mörlenbach mitmachen willst! Du hattest angekreuzt, dass du noch unsicher bist. Hast du in den nächsten Tagen kurz Zeit für ein Telefonat? Dann schauen wir zusammen, was zu dir passt.${n?'\n\nViele Grüße\n'+n:''}`;
  return `Hallo ${h.vorname}, schön, dass du beim SV/BSC Mörlenbach mitmachen willst! Du hast „${was}“ angekreuzt. `+(link?`Hier kommst du in unsere Gruppe dafür:\n${link}`:`Ich melde mich die Tage bei dir, dann schauen wir zusammen, wie du einsteigen kannst.`)+(n?`\n\nViele Grüße\n${n}`:'');
}
function hpBereiche(){
  const M=document.getElementById('modal'); if(!M||!HP.d)return;
  const H=HP.d.helfer||[], G=HP.d.gruppen||{};
  const block=b=>{ const L=H.filter(h=>(h.bereiche||[]).includes(b)); if(!L.length)return '';
    const offen=L.filter(h=>!hpEingeladen(h,b)).length, link=G[b];
    return `<details class="hp-ber"${HP.offen===b?' open':''} data-hpbo="${b}"><summary><b>${svEsc(HP_B[b]||b)}</b><span>${L.length} ${L.length===1?'Person':'Personen'}${offen?` · ${offen} noch nicht eingeladen`:' · alle eingeladen'}</span></summary>
      ${b==='unsicher'?'<p class="note small">Hier lohnt sich ein kurzer Anruf: herausfinden, was passt.</p>':`<div class="hp-gl"><label>WhatsApp-Gruppe für „${svEsc(HP_B[b])}“</label><div class="hp-glr"><input data-hpgl="${b}" placeholder="https://chat.whatsapp.com/…" value="${svEsc(link||'')}"><button type="button" class="btn ghost sm" data-hpgs="${b}">Speichern</button></div>
        <small>${link?'Mit „Einladen“ geht der Link direkt mit.':'Ohne Link schreibt „Einladen“, dass ihr euch meldet.'}</small></div>`}
      <div class="hp-bl">${L.map(h=>{ const e=hpEingeladen(h,b);
        return `<div class="hp-br"><div><b>${svEsc(h.vorname+' '+h.nachname)}</b><small>${h.handy?svEsc(hpZeigeNr(h.handy)):svEsc(h.email||'')}${(h.bereiche||[]).length>1?' · auch: '+svEsc(h.bereiche.filter(x=>x!==b).map(x=>HP_B[x]||x).join(', ')):''}</small>
            ${e?`<small class="hp-ok">✓ eingeladen ${svEsc(new Date(e.am).toLocaleDateString('de-DE',{day:'2-digit',month:'2-digit'}))}${e.von?' von '+svEsc(e.von):''} (${svEsc({whatsapp:'WhatsApp',mail:'Mail',anruf:'Anruf',gruppe:'Gruppe'}[e.art]||e.art)})</small>`:''}</div>
          <div class="hp-bk">${h.handy?`<a class="btn sm${e?' ghost':''}" data-hpe="${svEsc(h.id)}" data-b="${b}" data-art="whatsapp" href="https://wa.me/${svEsc(h.handy.replace('+',''))}?text=${encodeURIComponent(hpText(h,b))}" target="_blank" rel="noopener">💬 ${e?'Nochmal':'Einladen'}</a>`:''}
            ${!h.handy&&h.email?`<a class="btn sm${e?' ghost':''}" data-hpe="${svEsc(h.id)}" data-b="${b}" data-art="mail" href="mailto:${svEsc(h.email)}?subject=${encodeURIComponent('Mitmachen beim SV/BSC: '+(HP_B[b]||b))}&body=${encodeURIComponent(hpText(h,b))}">✉️ ${e?'Nochmal':'Einladen'}</a>`:''}
            ${h.handy?`<a class="btn ghost sm" data-hpe="${svEsc(h.id)}" data-b="${b}" data-art="anruf" href="tel:${svEsc(h.handy)}" title="Anrufen">📞</a>`:''}</div></div>`; }).join('')}</div>
      <div class="btnrow"><button type="button" class="btn ghost sm" data-hpnr="${b}">Nummern kopieren</button><button type="button" class="btn ghost sm" data-hpvb="${b}">📇 Kontakte</button><button type="button" class="btn ghost sm" data-hpcb="${b}">📄 Liste</button></div></details>`; };
  const ohne=H.filter(h=>!(h.bereiche||[]).length&&!(h.interessen||[]).length).length;
  const nicht=H.filter(h=>(h.bereiche||[]).includes('nicht')).length;
  M.innerHTML=`<button class="close" id="svClose" aria-label="Schließen">✕</button><div class="og-form hp"><h2>🙌 Helferpool <small>${H.length} eingetragen</small></h2>
    <div class="chips4 hp-ans" id="hpAnsicht"><button type="button" data-hpa="liste">Alle Personen</button><button type="button" class="on">Nach Bereichen</button></div>
    <p class="note">Wer sich für welchen Bereich interessiert. „Einladen“ öffnet WhatsApp oder Mail auf deinem Handy mit fertigem Text, du schickst selbst ab. Die App merkt sich, wer schon eingeladen ist.</p>
    ${HP_REIHE.map(block).join('')||'<div class="empty">Noch hat niemand einen Bereich angekreuzt.</div>'}
    ${nicht||ohne?`<p class="note small">${nicht?nicht+' möchten nicht mithelfen (haben aber vielleicht Ideen hinterlassen). ':''}${ohne?ohne+' ohne Bereich (ältere Anmeldungen).':''}</p>`:''}</div>`;
  document.getElementById('svClose').onclick=()=>closeOverlay();
  M.querySelector('[data-hpa]').onclick=()=>{ HP.ansicht='liste'; hpZeigen(); };
  M.querySelectorAll('[data-hpbo]').forEach(d=>d.addEventListener('toggle',()=>{ if(d.open)HP.offen=d.dataset.hpbo; }));
  M.querySelectorAll('[data-hpgs]').forEach(b=>b.onclick=async()=>{ const k=b.dataset.hpgs, v=M.querySelector(`[data-hpgl="${k}"]`).value.trim();
    try{ await ogRpc('helfer_bereich_gruppe',{p_bereich:k,p_wa:v}); HP.d.gruppen=HP.d.gruppen||{}; if(v)HP.d.gruppen[k]=v; else delete HP.d.gruppen[k]; HP.offen=k; kToast(v?'✓ Gruppenlink gespeichert':'Gruppenlink entfernt'); hpBereiche(); }catch(e){ kToast('⚠️ '+e.message); } });
  M.querySelectorAll('[data-hpe]').forEach(a=>a.addEventListener('click',()=>{ const id=a.dataset.hpe, b=a.dataset.b, art=a.dataset.art; HP.offen=b;
    ogRpc('helfer_einladung_merken',{p_helfer:id,p_bereich:b,p_art:art}).then(()=>{ const h=HP.d.helfer.find(x=>x.id===id); if(h){ h.einladungen=(h.einladungen||[]).concat([{bereich:b,art,am:new Date().toISOString(),von:hpMeinName()}]); }
      setTimeout(()=>{ if(HP.ansicht==='bereiche')hpBereiche(); },400); }).catch(e=>kToast('⚠️ '+e.message)); }));
  const leute=b=>H.filter(h=>(h.bereiche||[]).includes(b));
  M.querySelectorAll('[data-hpnr]').forEach(x=>x.onclick=async()=>{ const t=leute(x.dataset.hpnr).filter(h=>h.handy).map(h=>h.vorname+' '+h.nachname+': '+hpZeigeNr(h.handy)).join('\n'); if(!t)return kToast('Keine Nummern');
    try{ await navigator.clipboard.writeText(t); kToast('✓ Nummern kopiert'); }catch(e){ kToast(t); } });
  M.querySelectorAll('[data-hpvb]').forEach(x=>x.onclick=()=>{ const alt=HP.d.helfer; HP.d.helfer=leute(x.dataset.hpvb); try{ hpDatei('vcf'); }finally{ HP.d.helfer=alt; } });
  M.querySelectorAll('[data-hpcb]').forEach(x=>x.onclick=()=>{ const alt=HP.d.helfer; HP.d.helfer=leute(x.dataset.hpcb); try{ hpDatei('csv'); }finally{ HP.d.helfer=alt; } });
}

/* =====================================================================
   Sportzentrale Beta 0.36 · Wer hat welche Version? Update-Nachricht per WhatsApp
   Wunsch Albert (30.09.2026): In der Nutzerverwaltung sehen, wer noch auf einer alten Version hängt,
   und direkt von dort eine Update-Nachricht schicken, zur Not mit Anmelde-Link, der in die neueste Version führt.
   - Jedes Gerät meldet beim Start Version, Adresse (alt/neu), ob als App installiert und die Plattform
   - Nutzerverwaltung: pro Person die Version, oben die Zusammenfassung, Knopf „Update-Nachricht“
   - Der Anmelde-Link geht an die Adresse, auf der die Person ihre App hat (alte Adresse = App vor dem 28.09. installiert)
   ===================================================================== */
const AV_ADR={alt:'https://odenwalddev.github.io/svbc-scout/',neu:'https://svbsc.kaderwerk.pro/'};
const AV_ADR_T={alt:'alte Adresse',neu:'svbsc.kaderwerk.pro',andere:'andere Adresse'};
const AV_NEU_AB='2026-09-28';

function avGeraet(){
  let g=''; try{ g=localStorage.getItem('sv_geraet')||''; }catch(e){}
  if(!/^[a-z0-9-]{8,40}$/.test(g)){
    try{ g=crypto.randomUUID(); }catch(e){ g=Math.random().toString(36).slice(2,12)+'-'+Date.now().toString(36); }
    g=String(g).toLowerCase(); try{ localStorage.setItem('sv_geraet',g); }catch(e){}
  }
  return g;
}
function avPlattform(){ const u=navigator.userAgent||'';
  if(/iPhone|iPod/.test(u))return 'iPhone'; if(/iPad/.test(u)||(/Macintosh/.test(u)&&navigator.maxTouchPoints>1))return 'iPad';
  if(/Android/.test(u))return /Mobile/.test(u)?'Android-Handy':'Android-Tablet';
  if(/Windows/.test(u))return 'Windows'; if(/Macintosh/.test(u))return 'Mac'; if(/Linux/.test(u))return 'Linux'; return 'anderes'; }
function avBrowser(){ const u=navigator.userAgent||'';
  if(/SamsungBrowser/.test(u))return 'Samsung Internet'; if(/Edg[A]?\//.test(u))return 'Edge'; if(/Firefox|FxiOS/.test(u))return 'Firefox';
  if(/CriOS|Chrome/.test(u))return 'Chrome'; if(/Safari/.test(u))return 'Safari'; return 'anderer'; }
function avApp(){ try{ return matchMedia('(display-mode: standalone)').matches||matchMedia('(display-mode: fullscreen)').matches||navigator.standalone===true; }catch(e){ return false; } }
let _avGemeldet=0;
async function appMelden(){
  _avGemeldet=Date.now();
  try{ const host=(location.host+location.pathname).replace(/index\.html$/,'');
    await SVB.sb.rpc('app_melden',{p:{geraet:avGeraet(),build:APP_BUILD,host,app:avApp(),plattform:avPlattform(),browser:avBrowser()}}); }catch(e){}
}
setTimeout(appMelden,2500);
document.addEventListener('visibilitychange',()=>{ if(document.visibilityState==='visible'&&Date.now()-_avGemeldet>6*36e5)appMelden(); });

/* ---------- Auswertung ---------- */
function avNr(b){ const m=String(b||'').match(/(\d+)\.(\d+)/); return m?(+m[1])*1000+(+m[2]):null; }
function avV(b){ const s=String(b||''); return /^beta-/.test(s)?'Beta '+s.slice(5):(/^\d+\.\d+$/.test(s)?'Beta '+s:s); }
function avStatus(info){
  const g=(info&&info.geraete)||[], cur=avNr(APP_BUILD);
  if(g.length){ const n=g[0], nr=avNr(n.build);
    const ok=n.build===APP_BUILD||(cur!=null&&nr!=null&&nr>=cur);
    return {k:ok?'ok':'alt',build:n.build,g:n,t:avV(n.build)}; }
  if(info&&info.patch&&avNr(info.patch)!=null&&avNr(info.patch)<100000)return {k:'alt',build:null,g:null,t:'vor Beta 0.36',patch:info.patch};
  return {k:'unb',build:null,g:null,t:'noch keine Meldung'};
}
function avGeraetText(g){ if(!g)return ''; return [g.app?'App':'Browser',g.plattform,AV_ADR_T[g.adresse]||''].filter(Boolean).join(' · '); }
function avZiel(u,info){
  const g=(info&&info.geraete)||[];
  if(g.length&&(g[0].adresse==='alt'||g[0].adresse==='neu'))return g[0].adresse;
  return (u.created_at&&String(u.created_at).slice(0,10)<AV_NEU_AB)?'alt':'neu';
}

let AV_DATA=null;
async function avLaden(){ const {data,error}=await SVB.sb.rpc('app_versionen'); if(error)throw error; AV_DATA=data||{}; return AV_DATA; }

async function avAdminVersionen(){
  const P=document.getElementById('panel-admin'); if(!P||!isAdmin())return;
  try{ await avLaden(); }catch(e){ console.warn('Versionen',e); return; }
  const rows=[...P.querySelectorAll('.urow[data-u]')]; if(!rows.length)return;
  let ok=0, alt=[], unb=[];
  rows.forEach(r=>{
    const id=r.dataset.u, u=SV_USERS.find(x=>x.id===id); if(!u)return;
    const S=avStatus(AV_DATA[id]); const st=r.querySelector('.st');
    if(u.active&&(u.pw_set||u.last_sign_in_at)){ if(S.k==='ok')ok++; else if(S.k==='alt')alt.push(u); else unb.push(u); }
    if(st&&!st.querySelector('.av-v')){
      const d=document.createElement('span'); d.className='av-v '+S.k;
      d.innerHTML=(S.k==='ok'?'✓ ':S.k==='alt'?'⚠️ ':'')+svEsc(S.t)+(S.g?' · '+svEsc(avGeraetText(S.g)):'');
      d.title=S.g?'zuletzt gemeldet '+svAgo(S.g.zuletzt):(S.patch?'Neuigkeiten zuletzt gelesen: '+avV(S.patch):'Dieses Gerät hat sich noch nicht gemeldet');
      st.appendChild(document.createElement('br')); st.appendChild(d);
    }
    const acts=r.querySelector('.acts');
    if(acts&&u.id!==SVU.id&&u.active&&(u.pw_set||u.last_sign_in_at)&&!acts.querySelector('[data-avupd]')){
      const b=document.createElement('button'); b.className='iconbtn'+(S.k==='ok'?'':' av-hin'); b.dataset.avupd=u.id; b.title='Update-Nachricht schicken'; b.innerHTML=SVI('send');
      b.onclick=()=>avUpdateFenster(u.id); acts.insertBefore(b,acts.firstChild);
    }
  });
  const head=P.querySelector('.ulist'); if(!head)return;
  P.querySelectorAll('.av-sum').forEach(x=>x.remove());
  const d=document.createElement('div'); d.className='av-sum';
  const namen=l=>l.map(u=>svEsc(svFirst(u.name)||u.email)).join(', ');
  d.innerHTML=`<b>📲 App-Versionen</b><span>Aktuell ist <b>${svEsc(avV(APP_BUILD))}</b>. ${ok} ${ok===1?'Person ist':'Personen sind'} auf dem neuesten Stand.`
    +(alt.length?` Noch alt: ${namen(alt)}.`:'')+(unb.length?` Ohne Meldung: ${namen(unb)}.`:'')
    +`</span><small>Mit ${SVI('send').replace('<svg','<svg style="width:13px;height:13px;vertical-align:-2px"')} schickst du eine Update-Nachricht per WhatsApp, auf Wunsch mit Anmelde-Link.</small>`;
  head.before(d);
}
{ const _arV=svAdminRender; svAdminRender=async function(){ const r=await _arV.apply(this,arguments); try{ await avAdminVersionen(); }catch(e){ console.warn('Versionen',e); } return r; }; }

/* ---------- Update-Nachricht ---------- */
function avText(u,link){
  const fn=svFirst(u.name)||'du';
  return `Hallo ${fn}! In der SV/BSC Sportzentrale gibt es ein Update (${avV(APP_BUILD)}).\n\nMach die App einfach einmal ganz zu und öffne sie wieder, dann holt sie sich die neue Version von selbst. Wenn sie offen ist, reicht auch einmal nach unten ziehen.`
    +(link?`\n\nFalls du danach abgemeldet bist, tipp auf diesen Link, der meldet dich direkt an:\n${link}\n\nDer Link ist nur für dich und nur begrenzt gültig.`:'');
}
async function avUpdateFenster(id){
  const u=SV_USERS.find(x=>x.id===id); if(!u)return;
  const info=(AV_DATA||{})[id]||{}, S=avStatus(info), g=info.geraete||[];
  const st={ziel:avZiel(u,info),mitLink:true,links:{},laedt:false};
  const M=svModal(`<div class="og-form av-f"><h2>📲 Update für ${svEsc(u.name||u.email)}</h2>
    <div class="av-stand ${S.k}"><b>${S.k==='ok'?'✓ Ist auf dem neuesten Stand':S.k==='alt'?'⚠️ Hat noch eine ältere Version':'Noch keine Meldung von einem Gerät'}</b>
      <span>${g.length?g.slice(0,4).map(x=>`${svEsc(avV(x.build))} · ${svEsc(avGeraetText(x))} · ${svEsc(svAgo(x.zuletzt))}`).join('<br>')
        :(info.patch?'Neuigkeiten zuletzt gelesen in '+svEsc(avV(info.patch))+'. Geräte melden sich erst ab Beta 0.36.':'Geräte melden sich erst ab Beta 0.36.')}</span>
      ${info.push===undefined?'':`<span class="av-push">${info.push?'🔔 Push ist an'+(S.k==='ok'?'':'. Bleibt die App alt, kommt automatisch höchstens alle 7 Tage eine Erinnerung')+(info.erinnert?' · letzte Erinnerung '+svEsc(svAgo(info.erinnert)):'')+'.':'🔕 Kein Push aktiviert, also nur per WhatsApp erreichbar.'}</span>`}</div>
    <label class="av-l">Wo hat ${svEsc(svFirst(u.name)||'die Person')} die App?</label>
    <div class="av-ziel">
      <label><input type="radio" name="avZ" value="alt"${st.ziel==='alt'?' checked':''}> <span><b>Alte Adresse</b><small>App vor dem 28.09. installiert</small></span></label>
      <label><input type="radio" name="avZ" value="neu"${st.ziel==='neu'?' checked':''}> <span><b>svbsc.kaderwerk.pro</b><small>ab dem 28.09. installiert</small></span></label>
    </div>
    <label class="av-chk"><input type="checkbox" id="avMitLink" checked> Anmelde-Link mitschicken, falls die App nach dem Update nach dem Passwort fragt</label>
    <textarea id="avTxt" rows="9" class="search" style="width:100%;height:auto;padding:12px;line-height:1.45"></textarea>
    <div class="btnrow" style="margin-top:12px">
      <a class="btn" id="avWa" href="#" target="_blank" rel="noopener">${SVI('chat')} Per WhatsApp</a>
      <button class="btn ghost" id="avCopy">${SVI('copy')} Text kopieren</button>
    </div>
    <p class="note small" style="margin-top:10px">WhatsApp öffnet sich mit dem fertigen Text, du wählst nur noch ${svEsc(svFirst(u.name)||'die Person')} aus. Auf dem iPhone öffnet der Link Safari: Ist die App dort nicht abgemeldet, reicht das Neustarten der App.</p>
  </div>`);
  M.querySelectorAll('.btn svg').forEach(s=>{ s.style.cssText='width:16px;height:16px;vertical-align:-3px;margin-right:4px'; });
  const T=M.querySelector('#avTxt'), WA=M.querySelector('#avWa'), CB=M.querySelector('#avMitLink');
  let eigen=false; T.addEventListener('input',()=>{ eigen=true; setWa(); });
  function setWa(){ WA.href='https://wa.me/?text='+encodeURIComponent(T.value); }
  function fuellen(){ if(eigen)return; const l=st.mitLink?st.links[st.ziel]:null; T.value=avText(u,l||(st.mitLink?'(Link wird erstellt …)':'')); setWa(); }
  async function linkHolen(){
    if(!st.mitLink||st.links[st.ziel])return fuellen();
    const z=st.ziel; st.laedt=true; fuellen(); WA.classList.add('dis');
    try{ const r=await SVB.admin('link',{user_id:u.id,kind:'magiclink',app_url:AV_ADR[z]}); st.links[z]=r.link; }
    catch(e){ kToast('⚠️ '+e.message); st.mitLink=false; CB.checked=false; }
    st.laedt=false; WA.classList.remove('dis'); if(st.ziel===z)fuellen();
  }
  M.querySelectorAll('input[name=avZ]').forEach(r=>r.onchange=()=>{ st.ziel=r.value; eigen=false; linkHolen(); });
  CB.onchange=()=>{ st.mitLink=CB.checked; eigen=false; linkHolen(); };
  WA.onclick=e=>{ if(st.laedt){ e.preventDefault(); kToast('Einen Moment, der Link wird noch erstellt'); } };
  M.querySelector('#avCopy').onclick=()=>{ if(st.laedt){ kToast('Einen Moment, der Link wird noch erstellt'); return; } kCopy(T.value); };
  linkHolen();
}

(function(){ try{ const s=document.createElement('style'); s.id='svm38css'; s.textContent=`
.av-v{display:inline-block;margin-top:2px;font-size:11.5px;font-weight:700;color:var(--ink3)}
.av-v.ok{color:#86efac}.av-v.alt{color:#fbbf24}
.iconbtn.av-hin{border-color:rgba(251,191,36,.55);color:#fbbf24}
.av-sum{display:flex;flex-direction:column;gap:4px;margin:4px 0 12px;padding:12px 14px;border-radius:14px;background:rgba(143,201,236,.08);border:1px solid rgba(143,201,236,.25);font-size:13.5px;line-height:1.45}
.av-sum small{color:var(--ink3);font-size:12px}
.av-f h2{margin:0 0 12px}
.av-stand{display:flex;flex-direction:column;gap:4px;padding:12px 14px;border-radius:14px;background:var(--surface3,rgba(255,255,255,.05));font-size:13px;line-height:1.5;margin-bottom:14px}
.av-stand.ok b{color:#86efac}.av-stand.alt b{color:#fbbf24}
.av-stand span{color:var(--ink2)}
.av-stand .av-push{color:var(--ink3);font-size:12px}
.av-l{display:block;font-weight:700;font-size:13px;margin:0 0 8px}
.av-ziel{display:grid;grid-template-columns:1fr 1fr;gap:8px;margin-bottom:12px}
.av-ziel label{display:flex;gap:8px;align-items:flex-start;padding:10px 12px;border-radius:12px;border:1px solid var(--line);cursor:pointer}
.av-ziel label span{display:flex;flex-direction:column;gap:2px;font-size:13px}.av-ziel small{color:var(--ink3);font-size:11.5px}
.av-chk{display:flex;gap:8px;align-items:flex-start;font-size:13px;margin-bottom:10px;line-height:1.4}
.btn.dis{opacity:.55}
@media (max-width:520px){.av-ziel{grid-template-columns:1fr}}
`; document.head.appendChild(s); }catch(e){} })();

/* =====================================================================
   SV/BSC Scout · Runde 20: „Was ist neu“: Update-Fenster & Patch-Historie
   - Nach jedem Update ein Pop-up: das Wichtigste in Kürze → „OK“ oder „Mehr erfahren“ (ganze Historie)
   - Jederzeit erreichbar: Seitenleiste / „Mehr“ / Mein Konto → „Was ist neu“
   - Gesehen wird je Nutzer gespeichert (geräteübergreifend), neue Nutzer bekommen nach der Einführung kein Update-Fenster
   - NEUE VERSION: oben in SV_PATCHES eintragen (id eindeutig, neueste zuerst). Mehr ist nicht nötig
   Sichtbarkeit je Punkt: r:'team' (ohne Gäste) · r:'scout' · r:'admin' · ohne r = alle
   ===================================================================== */
const SV_PATCHES=[
  {id:'0.99.94',v:'0.99.94',datum:'2026-11-18',titel:'Spieltag auch als Story',kurz:'Heimspiel, Aufstellung, Ergebnis und Spielverlauf gibt es jetzt auch im Format 9:16 für Storys. Der Assistent schlägt keine geschätzten Zahlen mehr vor.',
   punkte:[
    {ic:'\u{1F4F1}',t:'Story 9:16 für alle vier Motive',d:'In der Einzelansicht wählst du zwischen „Beitrag 4:5“ und „Story 9:16“. Die Story ist dasselbe Motiv, so gesetzt, dass oben und unten frei bleibt, was Instagram überdeckt. Freigabe und Angaben gelten für beide Formate.',r:'team'},
    {ic:'\u{1F6AB}',t:'Assistent: keine geschätzten Zahlen',d:'Eine Headline wie „Zwei Stunden für den Verein“ erscheint nur noch, wenn die Dauer im Steckbrief steht. Vorschläge mit einer Zahl ohne Beleg sortiert die App aus.',r:'team'}
   ]},
  {id:'0.99.93',v:'0.99.93',datum:'2026-11-18',titel:'Spieltagsstudio: der Kommunikationsassistent',kurz:'Unter dem Spieltag steht „Was brauchst du?“: Aus einem Satz, einer Sprachnachricht oder einer Datei werden Steckbrief, drei Vorschläge, ein Plakat im Vereinsdesign und Texte für jeden Kanal.',
   punkte:[
    {ic:'\u{1F4AC}',t:'Erzählen, sprechen oder Datei dazulegen',d:'Schreib in einem Satz, was du brauchst, diktiere es oder leg eine Einladung als PDF, Word-Datei oder Foto dazu. Der Assistent zeigt dir, was er verstanden hat, und fragt höchstens dreimal nach.',r:'team'},
    {ic:'\u{1F4CB}',t:'Steckbrief mit Quelle',d:'An jeder Angabe steht, woher sie stammt: von dir, aus der Datei oder als Vorschlag. Datum, Uhrzeit, Ort und Kontakt werden nie geraten. Was sich nicht belegen lässt, trägt „bitte prüfen“ und sperrt die Freigabe, bis du es bestätigst.',r:'team'},
    {ic:'\u{1F3AF}',t:'Drei Richtungen, ein Tipp',d:'Du bekommst drei Headlines mit Vorschau. Die gewählte steht sofort als Plakat da: als Beitrag, Story oder Aushang in A4, dunkel mit Foto oder hell. Headline, Foto und Zeilen änderst du direkt.',r:'team'},
    {ic:'\u{270D}',t:'Texte für Instagram, WhatsApp und das Stadionheft',d:'Zu jedem Plakat gibt es die Begleittexte zum Kopieren. Das Bild trägt die Kernbotschaft, der Text die Einzelheiten aus dem Steckbrief.',r:'team'},
    {ic:'\u{1F512}',t:'Gespeichert wird das Vorhaben, nicht die Datei',d:'Text und Datei gehen zur Auswertung an den KI-Dienst und werden dort nicht gespeichert. Veröffentlicht und verschickt wird nichts von selbst.',r:'team'}
   ]},
  {id:'0.99.92',v:'0.99.92',datum:'2026-11-18',titel:'Spieltagsstudio: der Spieltag liegt vorbelegt bereit',kurz:'Neuer erster Bereich „Spieltag“: Heimspiel, Aufstellung, Ergebnis und Spielverlauf im neuen Vereinsdesign, aus den Spieldaten vorbelegt, mit Prüfung und Freigabe.',
   punkte:[
    {ic:'\u{1F4C5}',t:'Ein Spiel, vier Motive',d:'Das Spieltagsstudio öffnet mit dem Spieltag: Heimspiel oder Auswärtsspiel, Aufstellung, Ergebnis und Spielverlauf als Karten. Jede Karte sagt, ob sie fertig ist, auf Daten wartet oder genau eine Entscheidung von dir braucht.',r:'team'},
    {ic:'\u{2705}',t:'Vorbelegt aus den Spieldaten',d:'Gegner, Datum, Anstoß, Saisonspiel, Endstand, Tore mit Minute, Startelf, Bank und Einwechslungen kommen von selbst. Was du von Hand änderst, überschreibt kein späterer Abruf. Meldet der Spielbericht später etwas anderes, fragt die Karte, was gilt.',r:'team'},
    {ic:'\u{1F3A8}',t:'Gezeichnet nach der Designbibel',d:'Format 1080 × 1350, Kopfzeile, Wappen, Farben und Schriften nach dem neuen CI-Handbuch. Namen, Nummern und Ergebnis sind immer Text aus den Daten, Wappen und Porträts die Originaldateien.',r:'team'},
    {ic:'\u{1F50D}',t:'Prüfen, freigeben, teilen',d:'Vor der Freigabe prüft die App: elf Spieler in der Startelf, die Tore ergeben den Endstand, nichts läuft über, kein Wappen fehlt. „Stimmt so“ gibt frei, danach teilst du das Bild oder lädst es als PNG.',r:'team'},
    {ic:'\u{23F1}',t:'Ergebnis schon am Spieltag',d:'Rund zwei Stunden nach Abpfiff holt die App Ergebnis und Spielbericht von selbst, auch samstags. Vorlagen stehen nicht im Spielbericht: Die bestätigst du mit einem Tipp.',r:'team'}
   ]},
  {id:'0.99.91',v:'0.99.91',datum:'2026-11-18',titel:'Bandenplan 2027/28 in 3D, Vereinswechsel in der Datenprüfung',kurz:'Die neue Bandenreihe lässt sich in 3D ablaufen, jeder Platz hat eine Kennung. Die Datenprüfung zeigt Vereinswechsel als eigene Ansicht.',
   punkte:[
    {ic:'\u{1F6B6}',t:'Die neue Reihe in 3D',d:'Unter „Ab Saison 2027/28“ läufst du die Reihe vom Rasen aus ab: vergebene Banden weiß mit Logo und Name, freie Plätze gestrichelt. Der Name steht nie doppelt: Hat das Logo ein Zeichen über dem Schriftzug, steht das Zeichen links und der Schriftzug der Firma rechts daneben.',r:'team'},
    {ic:'\u{1F522}',t:'Kennung je Platz und Belegungsplan',d:'D1 bis D9 sind die Doppelbanden, E1 bis E24 die Einzelbanden, von links nach rechts. Die Liste darunter nennt je Platz Lage, Firma und Stand.',r:'team'},
    {ic:'\u{1F501}',t:'Datenprüfung: Vereinswechsel als eigene Ansicht',d:'Neben Doppelte Spieler, Namensvarianten und Spieldaten steht jetzt „Vereinswechsel“: eigene Spieler, die laut FuPa woanders spielen, mit ihrem Stand bei uns, dazu die Spieler anderer Vereine. Die Seite füllt sich von selbst, auch wenn sie gleich nach dem Start geöffnet wird.',r:'admin'}
   ]},
  {id:'0.99.90',v:'0.99.90',datum:'2026-11-18',titel:'Bandenplan ab Saison 2027/28',kurz:'Im Bandencreator zeigt der Plan jetzt auch die Reihe für die neue Saison: Doppelbande an der Mittellinie, je vier Doppelbanden links und rechts, daneben Einzelbanden.',
   punkte:[
    {ic:'\u{1F3DF}\u{FE0F}',t:'Schalter über dem Plan',d:'„Aktuell“ zeigt, was heute hängt. „Ab Saison 2027/28“ zeigt die geplante Reihe gegenüber vom Clubhaus mit 9 Doppelbanden und 24 Einzelbanden als Platzhalter.',r:'team'},
    {ic:'\u{1F4CC}',t:'Plätze nach und nach besetzen',d:'Antippen zeigt den Platz mit einer Vorschau: weiße Bande, Marine, nur Logo und Name. Die Leitung im Bereich Partner merkt eine Firma vor, vergibt den Platz fest oder macht ihn wieder frei.',r:'team'}
   ]},
  {id:'0.99.89',v:'0.99.89',datum:'2026-11-18',titel:'Präsentation zu einem Anlass',kurz:'Für Firmen, die kein Paket buchen, sondern Partner einer Aktion werden, gibt es jetzt eine eigene Präsentation mit eigenem kurzem Link.',
   punkte:[
    {ic:'\u{1F3C3}',t:'Eigene Präsentation für eine Aktion',d:'Die Firma sieht die Aktion, ihren Auftritt mit eigenem Logo, den Beitrag und mögliche Zusätze, und antwortet mit einem Tipp. Die Antwort steht danach im Verlauf der Firma. Angelegt wird eine solche Präsentation vorerst über Albert.',r:'team'}
   ]},
  {id:'0.99.88',v:'0.99.88',datum:'2026-11-18',titel:'Linie unter „Echtem.“',kurz:'Am Anfang der Präsentation für Firmen steht die Linie jetzt unter dem Wort und nicht mehr auf den Buchstaben.',
   punkte:[
    {ic:'\u{3030}\u{FE0F}',t:'Linie unter dem Wort',d:'Die gezeichnete Linie unter „Echtem.“ sitzt etwas tiefer und lässt die Buchstaben frei.',r:'team'}
   ]},
  {id:'0.99.87',v:'0.99.87',datum:'2026-11-18',titel:'Ein Satz in der Präsentation',kurz:'Am Anfang der Präsentation für Firmen heißt es jetzt: „Das bauen wir auf. Für viele Jahre, nicht nur für eine Saison.“',
   punkte:[
    {ic:'\u{270F}\u{FE0F}',t:'Satz am Anfang der Präsentation',d:'Statt „Für lange, nicht für eine Saison“ steht dort jetzt „Für viele Jahre, nicht nur für eine Saison“.',r:'team'}
   ]},
  {id:'0.99.86',v:'0.99.86',datum:'2026-11-18',titel:'Menü am Rechner wie am Handy, kurze Links für Firmen',kurz:'Die Seitenleiste am Rechner hat dieselben Ordner wie das Menü am Handy. Links zur Präsentation sind kurz und laufen über partner.kaderwerk.pro.',
   punkte:[
    {ic:'\u{1F4C2}',t:'Seitenleiste mit Ordnern',d:'Am Rechner stehen dieselben Bereiche wie am Handy als Ordner zum Aufklappen: Planung & Termine, Senioren, Jugend, Veranstaltungen, Partner, Verein, Kommunikation, Verwaltung. Offen ist der Bereich, in dem du gerade bist.'},
    {ic:'\u{1F517}',t:'Kurze Links für Firmen',d:'Der Link zur Präsentation heißt jetzt partner.kaderwerk.pro, dahinter der Name der Firma und acht zufällige Zeichen. Der Name allein führt nirgends hin. Die bisherigen langen Links gelten weiter.',r:'team'},
    {ic:'\u{1F4C7}',t:'Eine Firma, eine Präsentation',d:'Wer für eine Firma noch einmal eine Präsentation anlegt, schreibt die vorhandene fort. Der Link bleibt gleich, doppelte Einträge entstehen nicht mehr.',r:'team'}
   ]},
  {id:'0.99.85',v:'0.99.85',datum:'2026-11-18',titel:'Vorstand unterschreibt auf Papier, Logo der Firma in der Präsentation',kurz:'Verträge zeichnet der Vorstand auf Papier gegen, der Scan schließt den Vertrag. In der Präsentation steht das Logo der Firma an Bande, Trikot und Partnerwand.',
   punkte:[
    {ic:'\u{1F58A}\u{FE0F}',t:'Vorstand unterschreibt auf Papier',d:'Unter Partner, Verträge: die Fassung der Firma drucken, vom Vorstand unterschreiben lassen, Scan hochladen und eintragen, wer wann unterschrieben hat. Damit ist der Vertrag geschlossen.',r:'team'},
    {ic:'\u{2709}\u{FE0F}',t:'Ein Tipp schickt die Fassung an die Firma',d:'Nach dem Abschluss fragt die App, ob die Firma den Scan mit beiden Unterschriften per Mail bekommen soll. Von selbst geht nichts raus.',r:'team'},
    {ic:'\u{1F3DF}\u{FE0F}',t:'Die Firma sieht sich selbst',d:'Hat eine Präsentation ein Logo, steht es in der Präsentation zum Durchklicken an der Bande, auf dem Trikot und an der Partnerwand, nicht mehr nur der Name als Schrift.',r:'team'},
    {ic:'\u{1F170}\u{FE0F}',t:'Logo links, Schriftzug rechts',d:'Trägt ein Logo den Namen der Firma nicht selbst, steht der Schriftzug rechts daneben, auch in der Station mit der Bande am Spielfeldrand.',r:'team'}
   ]},
  {id:'0.99.84',v:'0.99.84',datum:'2026-11-18',titel:'Alle Verträge an einem Ort',kurz:'Im Partner-Bereich gibt es den Reiter Verträge: wer wann unterschrieben hat, die PDFs wie unterschrieben, bezahlt oder offen, und ob sich der Vertrag von selbst verlängert.',
   punkte:[
    {ic:'\u{1F4C1}',t:'Reiter Verträge',d:'Unter Partner, Verwaltung: alle Verträge mit Datum der Firma, Datum des Vereins, Laufzeit und Betrag. Sehen dürfen ihn die Leitung im Bereich Partner, Finanzen und Admins.',r:'team'},
    {ic:'\u{1F4C4}',t:'PDF wie unterschrieben',d:'Die Fassung der Firma und die Fassung mit beiden Unterschriften liegen fest in der Ablage und lassen sich laden. Ein Scan lässt sich dazu hochladen.',r:'team'},
    {ic:'\u{2705}',t:'Bezahlt mit einem Tipp',d:'Jede Rechnung und jede Saison eines alten Vertrags lässt sich als bezahlt abhaken und wieder zurücknehmen.',r:'team'},
    {ic:'\u{1F501}',t:'Verlängerung im Blick',d:'Bei jedem Vertrag steht, ob er sich von selbst verlängert und bis wann er kündbar ist. Bestehende Verträge der alten Struktur trägt man dort ein.',r:'team'}
   ]},
  {id:'0.99.83',v:'0.99.83',datum:'2026-11-18',titel:'Mail nach der Gegenzeichnung passt zum Vertrag',kurz:'Die Mail mit beiden Unterschriften beruft sich beim Monat der Rechnung nur noch auf den Vertrag, wenn der Monat dort steht.',
   punkte:[
    {ic:'\u{2709}\u{FE0F}',t:'Mail nach der Gegenzeichnung',d:'Bei Verträgen der früheren Fassung nennt die Mail den Monat der Rechnung, ohne den Zusatz „wie im Vertrag vereinbart“. Bei neuen Verträgen steht der Monat im Vertrag, dort bleibt der Zusatz.',r:'team'}
   ]},
  {id:'0.99.82',v:'0.99.82',datum:'2026-11-17',titel:'Widmung am Paket, Präsentation als PDF',kurz:'Eine Firma kann ihr Paket einem Zweck widmen, das steht in Präsentation und Vertrag. Jede Präsentation lässt sich als PDF laden.',
   punkte:[
    {ic:'\u{1F3AF}',t:'Widmung am Paket',d:'In der Präsentation einer Firma gibt es eine Unterüberschrift und einen Absatz zum Paket, zum Beispiel „Für sportliche Wettkämpfe in der Saisonvorbereitung“. Beides steht am empfohlenen Paket, am Ticket und im Vertrag unter dem Paket.',r:'team'},
    {ic:'\u{1F4C4}',t:'Präsentation als PDF',d:'Unter Präsentationen im Menü mit den drei Punkten: „Als PDF laden“. Drin stehen der Text zur Firma, die Widmung, alle Pakete und Bausteine mit Preisen und der Link zur Präsentation.',r:'team'}
   ]},
  {id:'0.99.81',v:'0.99.81',datum:'2026-11-17',titel:'Rechnungsmonat im Vertrag',kurz:'Im Vertrag steht jetzt, in welchem Monat die Rechnung kommt (Vorgabe August). Die App erinnert vorher, legt die Rechnung an und schickt sie mit einem Tipp per Mail.',
   punkte:[
    {ic:'\u{1F4C5}',t:'Monat steht im Vertrag',d:'Beim Abschluss wählt die Firma den Monat der Rechnung, August ist vorgeschlagen. Die Rechnung kommt dann jede Saison in diesem Monat, nicht mehr mit dem Vertragsschluss.',r:'team'},
    {ic:'\u{1F514}',t:'Erinnerung und Vorbereitung',d:'14 Tage vorher erinnert die App den Betreuer. Am Ersten des Monats liegt die Rechnung fertig bereit.',r:'team'},
    {ic:'\u{2709}\u{FE0F}',t:'Ein Tipp schickt sie',d:'„Per Mail schicken“ auf der Karte oder in der Liste der Rechnungen schickt das PDF an die Firma, eine Kopie geht an den Verein.',r:'team'},
    {ic:'\u{270F}\u{FE0F}',t:'Monat ändern',d:'In der Akte der Firma lässt sich der Rechnungsmonat eines Vertrags ändern, wenn es mit der Firma abgestimmt ist.',r:'team'}
   ]},
  {id:'0.99.80',v:'0.99.80',datum:'2026-11-17',titel:'Firmen: Pate eintragen, Formular gerade',kurz:'Bei jeder Firma lässt sich eintragen, wer von uns den besten persönlichen Kontakt hat. Die Haken im Formular stehen wieder neben ihrem Text.',
   punkte:[
    {ic:'\u{1F91D}',t:'Pate je Firma',d:'Im Formular der Firma gibt es das Feld Pate: wer aus unserem Team die Firma am besten kennt. Der Name steht in der Akte, in der Liste, in der Excel-Datei, und die Suche findet ihn.',r:'team'},
    {ic:'\u{2611}\u{FE0F}',t:'Haken im Formular',d:'Bestandspartner und VIP-Firma: Das Kästchen steht wieder direkt vor dem Text. Vorher stand der Text am rechten Rand.',r:'team'}
   ]},
  {id:'0.99.79',v:'0.99.79',datum:'2026-11-17',titel:'Im Vertrag stehen die Leistungen vollständig',kurz:'Die Beschreibung der Leistung im Partnervertrag brach bei langen Paketen ab. Jetzt steht sie ganz drin.',
   punkte:[
    {ic:'\u{1F4C4}',t:'Leistungen vollständig',d:'Im Partnervertrag stehen alle Leistungen eines Pakets. Vorher endete der Text bei den großen Paketen mitten im Satz.',r:'team'},
    {ic:'\u{1F4B6}',t:'Betrag im Verlauf',d:'Der Betrag eines neuen Vertrags steht im Verlauf der Firma in deutscher Schreibweise.',r:'team'}
   ]},
  {id:'0.99.78',v:'0.99.78',datum:'2026-11-17',titel:'Von der Präsentation direkt in den Vertrag',kurz:'Sagt eine Firma in der Präsentation Ja, steht ihre Wahl bei Paketen und Vertrag schon in der Auswahl. Trikots stehen auf dem Zettel als eigene Rechnung.',
   punkte:[
    {ic:'\u{270D}\u{FE0F}',t:'Auswahl ist schon da',d:'Paket, Zusätze und Laufzeit aus der Präsentation stehen im Abschluss, nichts muss noch einmal angeklickt werden. Bausteine für eine Jugendmannschaft wählt man dort mit der Mannschaft dazu.',r:'team'},
    {ic:'\u{1F9FE}',t:'Trikots getrennt',d:'Trikotpatenschaften sind Circa-Beträge. Auf dem Zettel stehen sie als eigene Rechnung, darunter die Summe der ersten Saison.',r:'team'}
   ]},
  {id:'0.99.77',v:'0.99.77',datum:'2026-11-17',titel:'Leiste unten bleibt, wo sie ist',kurz:'Am Handy schob sich die untere Leiste ins Bild, sobald ein Reiter etwas zu zählen hatte. Die Zahl sitzt jetzt als kleine Marke am Symbol.',
   punkte:[
    {ic:'\u{1F4F1}',t:'Leiste gleich hoch',d:'Die Zahl der Hinweise an „Mannschaft“ stand als eigene Zeile unter dem Namen und machte die ganze Leiste höher. Jetzt ist sie eine rote Marke am Symbol, die Leiste bleibt immer gleich hoch.',r:'team'}
   ]},
  {id:'0.99.76',v:'0.99.76',datum:'2026-11-17',titel:'Präsentation merkt sich den Stand',kurz:'Die Präsentation für Partner speichert jeden Schritt und zeigt dem Partner-Team eine Auswertung. Spielminuten bleiben offen, wenn im Spielbericht fehlt, wer ausgewechselt wurde.',
   punkte:[
    {ic:'\u{1F4BE}',t:'Weitermachen, wo ihr wart',d:'Jede Antwort wird gespeichert. Beim nächsten Öffnen gibt es drei Möglichkeiten: weitermachen, von vorn mit den Antworten oder ganz neu. Öffnet eine Firma ihren Link allein, sieht sie keine Notizen fürs Gespräch.',r:'team'},
    {ic:'\u{1F4CA}',t:'Auswertung je Firma',d:'Unter Partner, Präsentationen: was geantwortet wurde, wie lange jede Szene offen war und wohin getippt wurde. Unter „Wen ansprechen“ steht, was welcher Firma wichtig war und wo dazu noch nichts gebucht ist.',r:'team'},
    {ic:'\u{23F1}\u{FE0F}',t:'Minuten nur, wenn sie stimmen',d:'Fehlt im Spielbericht, wer für einen Einwechsler rausging, stehen die Startspieler nicht mehr mit 90 Minuten da. Die Minuten bleiben offen, bis FuPa vollständig ist oder das Trainerteam sie einträgt.',r:'team'}
   ]},
  {id:'0.99.75',v:'0.99.75',datum:'2026-11-17',titel:'Präsentation: eine Frage am Ende',kurz:'Die Präsentation für Partner endet mit einer einzigen Frage, zeigt Hinweise nur noch nach oben und erklärt jedes Paket auf Wunsch ausführlich.',
   punkte:[
    {ic:'\u{1F4AC}',t:'Seid ihr dabei?',d:'Am Ende steht eine Frage mit einem Knopf. Nach dem Ja kommt das Willkommen mit dem Namen an der Bande, erst danach die Frage, wie es weitergeht: gleich unterschreiben oder Angebot und Antrag per Mail.',r:'team'},
    {ic:'\u{1F3AB}',t:'Ticket ohne Abstufen',d:'„Eine Nummer kleiner“ gibt es nicht mehr. Passt nach den Antworten mehr, steht im weißen Kasten ein Knopf zum Upgrade. Bei „Was wäre euch wichtig?“ lassen sich alle sechs Antworten wählen, die Reihenfolge zählt.',r:'team'},
    {ic:'\u{2139}\u{FE0F}',t:'Mehr dazu',d:'An jedem Paket und jedem Baustein sitzt ein kleiner Info-Knopf mit einem ausführlichen Text. Dazu mehr Bewegung beim Überfahren und Antippen und neue Übergänge zwischen den Szenen.',r:'team'}
   ]},
  {id:'0.99.74',v:'0.99.74',datum:'2026-11-17',titel:'Kandidaten und System 5-1-2-2',kurz:'Die Liste aus der Kaderplanung-App steht jetzt im Scouting unter Kandidaten. Im Kaderplan gibt es das System 5-1-2-2.',
   punkte:[
    {ic:'\u{1F50E}',t:'Kandidaten an einem Ort',d:'Die Karte „Aus der Kaderplanung-App“ steht nicht mehr im Kader, sondern im Scouting auf der Seite Kandidaten. Am Handy stehen die Marken unter dem Namen, nichts bricht mehr um.',r:'team'},
    {ic:'\u{1F4CB}',t:'System 5-1-2-2',d:'Im Kaderplan lässt sich 5-1-2-2 als System und als Alternative wählen: Fünferkette, ein Sechser, zwei Achter, zwei Spitzen.',r:'team'}
   ]},
  {id:'0.99.73',v:'0.99.73',datum:'2026-11-17',titel:'Präsentation mit ruhiger Musik',kurz:'Die Präsentation für Partner hat eine neue, leise Hintergrundmusik. Musik und Pfiff sind auf allen Handys gleich leise.',
   punkte:[
    {ic:'\u{1F3B5}',t:'Leise im Hintergrund',d:'Die neue Musik läuft deutlich leiser als bisher und blendet weich ein. Am iPhone waren Musik und Pfiff vorher lauter als gedacht, das ist behoben. Der Schalter oben rechts stellt den Ton ab.',r:'team'}
   ]},
  {id:'0.99.72',v:'0.99.72',datum:'2026-11-17',titel:'Menü: Planung & Termine',kurz:'Im Menü „Mehr“ am Handy hat der Bereich mit Planung, Terminen, Aufgaben und Vorstand & Ziele jetzt einen eigenen Ordner.',
   punkte:[
    {ic:'\u{1F4C2}',t:'Ein Ordner für den ganzen Bereich',d:'Bisher stand dort nur die Kachel „Termine“. Jetzt heißt der Ordner „Planung & Termine“ und zeigt alle vier Seiten. Wer nur Termine öffnen darf, sieht weiter die eine Kachel.',r:'team'}
   ]},
  {id:'0.99.71',v:'0.99.71',datum:'2026-11-17',titel:'Weg zur App zum Durchklicken',kurz:'Die Seite zum Einstieg in die App fragt jetzt eine Sache je Bild, statt ein langes Formular zu zeigen.',
   punkte:[
    {ic:'\u{1F449}',t:'Eine Frage je Bild',d:'Handy wählen, Name, E-Mail, Handynummer, Rolle im Verein: jede Frage steht allein im Bild, mit Fortschritt oben. Die Rolle tippt man an, statt sie aus einer Liste zu wählen. Dahinter passiert dasselbe wie vorher.',r:'team'}
   ]},
  {id:'0.99.70',v:'0.99.70',datum:'2026-11-17',titel:'Partner: aufgeräumt, mit Partner-Start',kurz:'Der Partner-Bereich hat vier Gruppen statt zwölf Reitern. Für den Termin vor Ort gibt es den Partner-Start: Firma suchen oder anlegen, dann läuft die Präsentation.',
   punkte:[
    {ic:'\u{1F5C2}',t:'Vier Gruppen',d:'Übersicht, Firmen, Werbeflächen und Verwaltung. Darunter stehen nur die Seiten der gewählten Gruppe. Es fehlt nichts, alles steht nur an einem festen Platz.',r:'team'},
    {ic:'\u{1F91D}',t:'Partner-Start',d:'Der Knopf oben rechts im Partner-Bereich öffnet eine eigene Seite ohne die App drumherum. Firma eintippen oder neu anlegen, ein Tipp startet die Präsentation. Die Firma, der Termin und die Antworten aus der Präsentation stehen danach im Verlauf der Firma.',r:'team'},
    {ic:'\u{1F50A}',t:'Präsentation und App-Einstieg mit Ton',d:'Die Reise für Partner hat Klänge beim Tippen und Wischen und Musik, abschaltbar oben rechts. Die Seite zum Einstieg in die App beginnt mit einem kurzen Vorspann.',r:'team'}
   ]},
  {id:'0.99.69',v:'0.99.69',datum:'2026-11-17',titel:'Menü aufgeräumt',kurz:'Der Bereich „Spieltag“ ist aus dem Menü. Das Spieltagsstudio steht jetzt unter Kommunikation.',
   punkte:[
    {ic:'\u{1F9F9}',t:'Weniger Knöpfe',d:'Gegneranalyse und Elf der Woche haben keinen eigenen Knopf mehr. Die Gegneranalyse öffnet sich weiter aus „Mein Spieltag“ und aus dem Spiel in der Mannschaft. Das Spieltagsstudio findest du unter Kommunikation.',r:'team'}
   ]},
  {id:'0.99.68',v:'0.99.68',datum:'2026-11-17',titel:'Partner: Termine und Kalender',kurz:'Vereinbarte Termine lassen sich bei der Firma eintragen und stehen im Kalender. Der Partner-Bereich hat einen eigenen Kalender mit Fristen und Vertragsabläufen.',
   punkte:[
    {ic:'\u{1F4C5}',t:'Termin schon eintragen',d:'Ein Treffen oder Anruf mit Datum in der Zukunft steht bei der Firma unter „Geplant“, in der Firmenliste unter „Mit Termin“ und im Kalender der Abteilung, sichtbar für das Partner-Team. Als Gespräch zählt er erst, wenn der Tag da ist.',r:'team'},
    {ic:'\u{1F5D3}',t:'Kalender im Partner-Bereich',d:'Neuer Reiter „Kalender“: Termine, Wiedervorlagen, Vertragsabläufe und offene Zahlungen in einer Liste. Im Kalender der Abteilung gibt es dazu die Auswahl „Partner“.',r:'team'},
