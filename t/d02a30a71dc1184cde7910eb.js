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
  {id:'0.99.51',v:'0.99.51',datum:'2026-11-16',titel:'Präsentation für jede Firma, Bande und Trikot nur wenn sie passen',kurz:'Jede Firma hat jetzt eine Präsentation für den Termin vor Ort. Bande und Trikot zeigt sie erst, wenn Paket oder Baustein dazu passen. Einzelbande 2,50 m, Doppelbande 5 m.',
   punkte:[
    {ic:'\u{1F4C4}',t:'Alle Firmen in den Präsentationen',d:'Bisher hatten nur 16 von 104 Firmen eine Präsentation. Jetzt hat jede Firma unter Firmen eine, neue Firmen bekommen sie von selbst. Ansprechpartner, Branche und Anschrift kommen aus der Akte.',r:'partner'},
    {ic:'\u{1F3AF}',t:'Nur zeigen, was zur Auswahl passt',d:'Die Bande erscheint erst, wenn ein Paket mit Bande oder die Werbebande gewählt ist, das Trikot erst mit einem Trikot- oder Ärmel-Baustein. Ohne passende Auswahl bleibt die Station zu. Der Kunde sieht nur seine Präsentation.',r:'partner'},
    {ic:'\u{1F4CF}',t:'Einzelbande und Doppelbande',d:'Club und Premium haben die Einzelbande (2,50 × 0,80 m), nur 1896 Partner die Doppelbande (5,00 × 0,80 m), Supporter hat keine Bande. Die Vorschau zeigt das passende Maß. Im Bandencreator gibt es 2,50 m als neues Format.',r:'partner'}
   ]},
  {id:'0.99.50',v:'0.99.50',datum:'2026-11-16',titel:'Neuer Partner im Ablauf: BB Berns&Baltz',kurz:'BB Berns&Baltz aus der Pfadwiesenstraße steht jetzt im Partner-Ablauf, das Gespräch mit Jan Berns ist diese Woche.',
   punkte:[
    {ic:'\u{1F91D}',t:'BB Berns&Baltz im Ablauf',d:'Eingetragen mit Status Gespräch, Ansprechpartner Jan Berns und Notiz: großes Engagement für Mörlenbach, Malort für Kinder, dazu Mörlens Restobar und Mörlens Patisserie.',r:'admin'}
   ]},
  {id:'0.99.49',v:'0.99.49',datum:'2026-11-16',titel:'FuPa geht vor: Spielzeit und Vorlagen stimmen',kurz:'Bei den eigenen Spielern zählt jetzt zuerst FuPa. Dort stehen Ein- und Auswechslungen, deshalb stimmt die Spielzeit, und die Vorlagen sind dabei.',
   punkte:[
    {ic:'\u23F1\uFE0F',t:'Spielzeit aus FuPa',d:'fussball.de kennt nur die Einwechslungen, die Spielzeit der Ausgewechselten war darum zu lang. Einsätze, Startelf, Minuten und Tore kommen jetzt von FuPa; nur wenn FuPa nichts hat, gilt fussball.de.'},
    {ic:'\u{1F3AF}',t:'Vorlagen im Spielerprofil',d:'Beim Einsatz einer Saison stehen jetzt auch die Vorlagen (zum Beispiel „4 Vorl.“).'},
    {ic:'\u2696\uFE0F',t:'Spielvergleich',d:'Widersprechen sich FuPa und fussball.de in einem Spiel, schlägt die App jetzt FuPa vor, nicht mehr fussball.de.',r:'admin'}
   ]},
  {id:'0.99.48',v:'0.99.48',datum:'2026-11-16',titel:'Logos auf den Ärmeln sitzen richtig',kurz:'Im Trikot-Creator stehen die Ärmel-Logos jetzt größer und passend zur Ärmelrichtung, nicht mehr klein und schief.',
   punkte:[
    {ic:'\u{1F455}',t:'Ärmel-Logos realistisch',d:'Die Logos auf den Ärmeln sind größer, liegen mittig auf dem Ärmelfeld über dem Streifen und folgen der Neigung des Ärmels. Das gilt für Heim, Auswärts und den Anzug, in 3D und in der Foto-Ansicht.'}
   ]},
  {id:'0.99.47',v:'0.99.47',datum:'2026-11-16',titel:'Neues Logo auf den Trikots und Anzügen',kurz:'Auf dem linken Ärmel steht jetzt „Sport ist cool!“ statt des Platzhalters: weiß auf den Trikots, schwarz auf den Anzügen.',
   punkte:[
    {ic:'\u{1F455}',t:'„Sport ist cool!“ auf dem Ärmel',d:'Das Logo von Allianz Albert Klee ist jetzt die echte Schreibschrift, auf Heim- und Auswärtstrikot in Weiß, auf dem Anzug in Schwarz. Der Platzhalter ist weg.'}
   ]},
  {id:'0.99.46',v:'0.99.46',datum:'2026-11-16',titel:'Mehr Schutz im Hintergrund',kurz:'Unsichtbar, aber wichtig: Die App bremst jetzt Missbrauch an den offenen Türen (Helfer-Link, Shop, Partneranfrage) und hat einen Sicherheitscheck hinter sich. Für dich ändert sich nichts.',
   punkte:[
    {ic:'\u{1F6E1}\uFE0F',t:'Bremse gegen Massenanfragen',d:'Wer ohne Anmeldung hundertfach dieselbe Funktion aufruft, wird kurz gebremst. Normale Nutzung merkt davon nichts. Zunächst zählt die Bremse nur mit, scharf gestellt wird sie nach einer Prüfung.',r:'admin'},
    {ic:'\u{1F50D}',t:'Rechte aller Funktionen geprüft',d:'Eine Lücke gefunden und geschlossen: Die Einstellungen für den Berichte-Versand sehen jetzt nur noch Trainer-Ebene, Admin und Vorstand.',r:'admin'}
   ]},
  {id:'0.99.45',v:'0.99.45',datum:'2026-11-16',titel:'Willkommen mit Handschrift, Neuer Nutzer als Pop-up',kurz:'Der Start ist schöner geworden: „Willkommen“ schreibt sich von Hand, dann Name, dann Kontakt, und die Anfrage ist raus. Wer die Anfragen freigibt, sieht „Neuer Nutzer“ als Pop-up und öffnet damit genau diese Anfrage.',
   punkte:[
    {ic:'\u270D\uFE0F',t:'Willkommen in drei Schritten',d:'Vorname und Nachname, dann E-Mail und Handynummer, dann ein Dankeschön. Rolle und Rechte fragt die App nicht, das ordnet der Verein im Hintergrund zu.'},
    {ic:'\u{1F514}',t:'Neuer Nutzer als Pop-up',d:'Wer freigibt, bekommt „Neuer Nutzer“ mit Name, Mail und Nummer. Freigeben geht dort nicht, ein Tipp öffnet die Anfrage mit allem, was die App über die Person weiß.',r:'admin'},
    {ic:'\u2705',t:'Bestätigt und die übrigen Wartenden',d:'Nach dem Freigeben steht „bestätigt“ da, dazu, wer noch wartet, und ein Knopf zur Übersicht. Auf der Startseite steht die Karte „Neue Nutzer“.',r:'admin'}
   ]},
  {id:'0.99.44',v:'0.99.44',datum:'2026-11-16',titel:'Sitzungen mit Agenda, Notizen und Protokoll',kurz:'Zu jeder Sitzung gibt es jetzt eine Agenda. Jeder aus der Runde reicht vorher seine Themen ein, in der Sitzung schreibt ihr Ergebnisse und Aufgaben dazu, und am Ende steht das Protokoll von selbst.',
   punkte:[
    {ic:'\u{1F4CB}',t:'Themen einreichen',d:'Tippen, diktieren oder eine ganze Liste einfügen: Die App macht einzelne Punkte daraus und ordnet sie dem Bereich zu. Du siehst die Vorschau, bevor etwas gespeichert wird. Reichen mehrere dasselbe ein, steht es einmal auf der Agenda, mit allen Namen und weiter oben.',r:'kalender'},
    {ic:'✍️',t:'Ergebnis, eigene Notiz, Aufgaben',d:'Zu jedem Thema gibt es das Ergebnis für alle, deine eigene Notiz (die siehst nur du) und Aufgaben mit Zuständigem und Termin. Die Aufgaben stehen danach bei den To-dos.',r:'kalender'},
    {ic:'\u{1F4C4}',t:'Protokoll ohne Mehrarbeit',d:'Fünf Stunden nach Beginn fragt die App die Leitung, ob die Sitzung beendet ist. Bei Ja geht das Protokoll an die Runde. Zwei Tage und einen Tag vorher erinnert die App ans Einreichen.',r:'kalender'},
    {ic:'⚡',t:'Kleine Updates, immer der neueste Stand',d:'Nach einem Update lädt dein Handy nur noch die geänderten Teile, rund ein Zehntel der bisherigen Datenmenge. Und die App prüft schon beim Öffnen, ob sie aktuell ist.'}
   ]},
  {id:'0.99.43',v:'0.99.43',datum:'2026-11-15',titel:'Welche Förderung lohnt sich?',kurz:'In der Leitersitzung siehst du Aufwand, vorgeschlagene Wichtigkeit, Förderrahmen und Fristen. Vergleiche den Förderweg mit einer direkten oder gebrauchten Anschaffung.',punkte:[{ic:'✓',t:'Prioritäten für eure Entscheidung',d:'Änderbare Bewertungen, Zeithorizonte und belegte Fristen helfen bei der Auswahl. Geschlossene Runden bleiben zurückgestellt.',r:'foerderung'},{ic:'✓',t:'Was bleibt vom Zuschuss?',d:'Zusatzkosten und Ehrenamtszeit gegen eine vergleichbare Alternative rechnen. Eigene Schätzungen bleiben erkennbar und gehen in die Sitzungsvorlage ein.',r:'foerderung'}]},
  {id:'0.99.42',v:'0.99.42',datum:'2026-11-15',titel:'Die App startet deutlich schneller',kurz:'Beim Start hat die App alle Scouting-Listen mehrfach durchgerechnet, auch wenn niemand sie offen hatte. Das passiert jetzt erst, wenn du den Bereich öffnest. Auf älteren Handys startet die App damit um ein Vielfaches schneller.',
   punkte:[
    {ic:'\u26A1',t:'Schneller Start',d:'Spielermarkt, Datenbank, Vergleich, Aufstellung und Geheimtipps werden erst gezeichnet, wenn du sie öffnest. Die Startseite steht dadurch viel früher. An den Inhalten ändert sich nichts.',r:'team'},
    {ic:'\u{1F4F6}',t:'Weniger Warten auf den Server',d:'Die Spielerwerte für das Scouting kommen jetzt in einem Bruchteil der Zeit an.',r:'scout'},
    {ic:'\u{1F4C2}',t:'Förderzentrale im Menü',d:'Am Handy fehlte die Förderzentrale im Menü „Mehr“. Sie steht jetzt in der Gruppe Verein.',r:'foerderung'},
    {ic:'\u{1F5A5}',t:'Leiste am Rechner',d:'Die Unterseiten in der breiten Leiste stehen nach dem Laden zuverlässig an ihrem Bereich.',r:'team'}
   ]},
  {id:'0.99.41',v:'0.99.41',datum:'2026-11-15',titel:'Förderzentrale zuverlässig aktualisieren',kurz:'Die neue Auswahl für die Leitersitzung lädt jetzt auch mit bereits gespeicherten App-Dateien zuverlässig.',punkte:[{ic:'✓',t:'Aktuelle Förderübersicht',d:'Alle Teile der Förderzentrale werden beim Update in derselben Version geladen.',r:'foerderung'}]},
  {id:'0.99.40',v:'0.99.40',datum:'2026-11-15',titel:'Fördermöglichkeiten gemeinsam vorbereiten',kurz:'Wähle Vorhaben für die Leitersitzung, bündele die Vorbereitung und erstelle eine Sitzungsvorlage mit deinen Aufgaben.',
   punkte:[{ic:'✓',t:'Auswahl für die Leitersitzung',d:'Förderakten vergleichen, Vorhaben anhaken und nächste Schritte festlegen. Deine Auswahl bleibt bis zum Abmelden in diesem Browser gespeichert.',r:'foerderung'},
           {ic:'✓',t:'Unterlagen mit Vereinsbriefkopf',d:'Projektskizzen enthalten das Vereinswappen und nachvollziehbare Kosten. Voranfragen gehen auf den Bedarf und die konkrete Förderstelle ein.',r:'foerderung'}]},
  {id:'0.99.39',v:'0.99.39',datum:'2026-11-15',titel:'Partner-Präsentation: Wirkung je Position wieder da',kurz:'Im Paket nach der Unterschrift steht bei jeder Position wieder, was sie bewirkt. Beim Trainer steht die Mannschaft auf der Startseite wieder vorn.',
   punkte:[
    {ic:'\u{1F4AC}',t:'Was eure Unterstützung bewirkt',d:'In der Präsentation steht nach der Unterschrift bei jeder Position wieder ein Satz, wofür sie gut ist. Der Satz war durch einen Fehler verschwunden.',r:'partner'},
    {ic:'\u26BD',t:'Trainer: Mannschaft zuerst',d:'Auf der Startseite des Trainers steht die Mannschaft wieder vor dem Spielerkonto.',r:'team'}
   ]},
  {id:'0.99.38',v:'0.99.38',datum:'2026-11-15',titel:'Treffpunkt, Rückennummern, Partner-Profil intern',kurz:'Der Treffpunkt steht am Spiel, die Rückennummer in „Meine Mannschaft“. Das Partner-Team bekommt ein internes Profil je Firma mit Vorschlag, wen man anspricht. Die Startseite ist kürzer, und auf den Banden steht nur noch der Partner.',
   punkte:[
    {ic:'\u{1F4CD}',t:'Treffpunkt beim Spiel',d:'Das Trainerteam trägt im Termin Uhrzeit und Ort ein. Die Spieler der Mannschaft sehen es in den Terminen, unter „Meine Mannschaft“ und auf der Startseite. Eine Mitteilung geht dabei nicht raus.'},
    {ic:'\u{1F522}',t:'Rückennummern',d:'Unter „Meine Mannschaft“ steht bei jedem Spieler seine Nummer, so wie sie im Spieltagsstudio gepflegt ist.'},
    {ic:'\u{1F3E0}',t:'Startseite kürzer',d:'Drei To-dos statt fünf, die Ablage als eine Zeile, erledigte erste Schritte eingeklappt.'},
    {ic:'\u{1F5C2}\uFE0F',t:'Partner-Profil intern',d:'In der Akte jeder Firma: wofür sie sich begeistert, wie man sie anspricht, jede Anfrage mit Ergebnis und Grund. Das sieht nur das Partner-Team, die Firma nie.',r:'partner'},
    {ic:'\u{1F3AF}',t:'Wen ansprechen?',d:'Neuer Reiter im Partnerbereich: Vorhaben eintippen, dann steht da, wen ihr zuerst fragt und bei wem es eher nichts wird, jeweils mit Grund.',r:'partner'},
    {ic:'\u{1FAA7}',t:'Banden nur mit dem Partner',d:'Im Bandencreator stehen Wappen, Vereinsname und Schriftzug nicht mehr auf der Bande. Die ganze Fläche gehört der Firma.',r:'partner'},
    {ic:'\u{1F7E2}',t:'Schalter im hellen Modus',d:'Der Schalter der Automatik fürs Training ist eingeschaltet wieder grün statt grau.',r:'team'}
   ]},
  {id:'0.99.37',v:'0.99.37',datum:'2026-11-15',titel:'Förderakten übernehmen',kurz:'Bestehende Förderakten können aus einer Exportdatei in den Vereinsbestand übernommen werden.',
   punkte:[{ic:'📁',t:'Vereinsdossier speichern',d:'Beim Import und beim Speichern wird gezielt das Vereinsdossier aktualisiert.',r:'foerderung'}]},
  {id:'0.99.36',v:'0.99.36',datum:'2026-11-15',titel:'Förderzentrale für den Verein',kurz:'Im Vereinsbereich gibt es einen Arbeitskorb für Förderfälle und Angebote.',
   punkte:[{ic:'📁',t:'Förderfälle im Arbeitskorb',d:'Vorstand und berechtigte Vereinsrollen sehen Vorhaben, Angebote und Originalquellen.',r:'foerderung'},
           {ic:'✉️',t:'Voranfragen prüfen',d:'Das Anschreiben und die Projektskizze lassen sich nach Prüfung als EML-Datei exportieren.',r:'foerderung'}]},
  {id:'0.99.35',v:'0.99.35',datum:'2026-11-15',titel:'Bandenplan: zehn Fotos neu',kurz:'Zehn Banden gegenüber vom Clubhaus haben ein neues Foto: gerade gerichtet, schärfer und ohne Hecke oder Nachbartafel im Bild.',
   punkte:[
    {ic:'\u{1F4D0}',t:'Gerade statt schräg',d:'Die Fotos waren leicht von der Seite und von oben aufgenommen. Jetzt steht jede Tafel gerade und füllt ihre Bande im Rundgang ganz.',r:'partner'},
    {ic:'\u{1F50D}',t:'Schärfer',d:'Die Bilder sind größer als bisher. Das siehst du vor allem im großen Foto, wenn du eine Bande antippst.',r:'partner'},
    {ic:'\u{1F4F7}',t:'Noch offen',d:'Für die Banden 1, 5, 7, 8, 11 und 17 bis 24 fehlen weiter gute Fotos.',r:'partner'}
   ]},
  {id:'0.99.34',v:'0.99.34',datum:'2026-11-14',titel:'Bandenplan: Fotos ohne Verzerrung',kurz:'Im Rundgang um den Platz sind die Fotos der Banden nicht mehr verzogen. Sie sind auf die Tafel zugeschnitten, feiner gerechnet und näher im Bild.',
   punkte:[
    {ic:'\u{1F5BC}\uFE0F',t:'Nichts mehr verzogen',d:'Jedes Foto behält sein Seitenverhältnis. Passt es nicht ganz auf die Tafel, steht es in der Mitte, und daneben läuft die Farbe der Bande weiter.',r:'partner'},
    {ic:'\u2702\uFE0F',t:'Auf die Tafel zugeschnitten',d:'Hecke und Gras über und unter der Bande sind weg. Kleine Fotos sind sauber vergrößert. Schärfer als das Foto wird es dadurch nicht.',r:'partner'},
    {ic:'\u{1F50D}',t:'Näher dran',d:'Am Handy füllt eine Bande jetzt gut zwei Drittel der Breite. Tippst du eine Bande an, steht ihr Foto groß darunter.',r:'partner'},
    {ic:'\u{1FAA7}',t:'Schild statt Ausschnitt',d:'Vier Fotos zeigen nur einen Teil der Tafel. Dort steht im Rundgang ein sauberes Schild mit dem Namen, bis es ein Foto der ganzen Bande gibt.',r:'partner'}
   ]},
  {id:'0.99.33',v:'0.99.33',datum:'2026-11-14',titel:'Startseite: erst das Dringende',kurz:'Die Startseite ist neu geordnet. Oben steht, was auf dich wartet, dann was als Nächstes kommt, dann deine Bereiche. Die Abteilungsleitung sieht dort kein Scouting mehr.',
   punkte:[
    {ic:'\u23F0',t:'Wartet auf dich',d:'Offene Fragen, neue Meldungen und überfällige To-dos stehen ganz oben. Wartet nichts, sagt die Seite das in einem Satz.'},
    {ic:'\u{1F4C5}',t:'Als Nächstes',d:'Darunter die nächsten Termine und dein Spieltag. Danach deine Bereiche, zum Schluss alles, was Zeit hat.'},
    {ic:'\u{1F9F9}',t:'Abteilungsleitung ohne Scouting',d:'Radar, Scouting-Berichte, Scores, Co-Trainer und Kandidaten stehen nicht mehr auf der Startseite der Leitung. Im Bereich Scouting ist alles wie bisher.',r:'planung'},
    {ic:'\u{1F514}',t:'Meldungen, die dich betreffen',d:'Die Karte „Neue Meldungen“ zählt für die Leitung nur noch Organisation, Zugänge und Partner. In der Glocke steht weiter alles.',r:'planung'},
    {ic:'\u{1F50D}',t:'Scouting zurückholen',d:'Wer in der Leitung selbst mit Scouting und Kader arbeitet, schaltet beides ganz unten auf der Startseite für sich wieder ein.',r:'planung'}
   ]},
  {id:'0.99.32',v:'0.99.32',datum:'2026-11-14',titel:'Stadionheft: Texte vorschlagen lassen',kurz:'Zu jedem Spiel im Heft schlägt die KI auf Wunsch einen Text vor. Sie nutzt nur, was in der App steht, und deine Stichworte. Die Redaktion liest, ändert und hakt ab.',
   punkte:[
    {ic:'\u270D\uFE0F',t:'Spielbericht auf Knopfdruck',d:'Seite mit dem Spiel antippen, „Text vorschlagen“. Der Vorschlag entsteht aus Ergebnis, Torfolge, Aufstellung und Tabelle. Mehr weiß die KI nicht.',r:'team'},
    {ic:'\u{1F4DD}',t:'Stichworte',d:'Was die App nicht weiß, schreibst du dazu: Wetter, Szenen, Stimmen. Das kommt in den Text. Erfunden wird nichts.',r:'team'},
    {ic:'\u2705',t:'Erst lesen, dann drucken',d:'Ein übernommener Vorschlag gilt als ungeprüft und steht in der Liste „Vor dem Druck“, bis jemand „Text geprüft“ abhakt.',r:'team'},
    {ic:'\u{1F9F9}',t:'Eigene Texte glätten',d:'Bei Jugend, SOMA und freien Seiten bringt die KI deinen Text sprachlich in Ordnung. Inhalt, Namen und Zahlen bleiben.',r:'team'},
    {ic:'\u{1F44B}',t:'Begrüßung und Vorschau',d:'Auch die Begrüßung vorn im Heft und die Vorschau auf die nächsten Spiele lassen sich vorschlagen.',r:'team'}
   ]},
  {id:'0.99.31',v:'0.99.31',datum:'2026-11-14',titel:'Stadionheft: Vorschau, Texte und Druckdatei',kurz:'Das Heft setzt sich jetzt selbst. Du blätterst durch die fertigen Seiten, schreibst Texte direkt an der Seite und holst am Ende die Druckdatei für die Druckerei.',
   punkte:[
    {ic:'\u{1F4D6}',t:'Vorschau zum Blättern',d:'Unter „Vorschau und Texte“ liegt das Heft so da, wie es gedruckt wird. Blättern geht mit den Pfeilen, durch Wischen oder mit den Pfeiltasten.',r:'team'},
    {ic:'\u26BD',t:'Vieles steht von selbst da',d:'Spiele seit dem letzten Heft mit Ergebnis, Toren und Aufstellung, die Tabellen, die nächsten Spiele, öffentliche Termine und die Trainingszeiten kommen aus der App.',r:'team'},
    {ic:'\u270F\uFE0F',t:'Texte und Fotos an der Seite',d:'Seite antippen, Überschrift, Text und Foto setzen. Die Seite zeigt beim Tippen sofort, wie es aussieht. Wird ein Text zu lang, läuft er auf die nächste leere Seite derselben Sorte weiter.',r:'team'},
    {ic:'\u{1F5BC}',t:'Druckvorlagen der Anzeigen',d:'Jede Anzeige bekommt ihr Bild. Einzeln an der Seite oder mehrere auf einmal, wenn der Dateiname mit dem Namen der Firma beginnt.',r:'team'},
    {ic:'\u{1F5A8}',t:'Druckdatei',d:'„Druckdatei“ schreibt das Heft als PDF in A4, auf Wunsch mit 3 mm Beschnitt. Davor zeigt die Liste „Vor dem Druck“, was noch fehlt.',r:'team'},
    {ic:'\u{1F3E0}',t:'Für die Redaktion',d:'Wer das Heft freigibt, findet es jetzt auf der Startseite und öffnet es von dort, auch ohne Zugang zum Bereich Partner.',r:'team'},
    {ic:'\u{1F6E0}',t:'So geht es weiter',d:'Als Nächstes schlägt die App Texte zu den Spielen vor, die die Redaktion prüft und ändert.',r:'team'}
   ]},
  {id:'0.99.30',v:'0.99.30',datum:'2026-11-14',titel:'Stadionheft: der Heftplaner',kurz:'Im Reiter Stadionheft planst du das Heft jetzt Seite für Seite. Seiten lassen sich ziehen, die App ordnet auf Wunsch von selbst und legt Anzeigen gleicher Themen zusammen.',
   punkte:[
    {ic:'\u{1F4D6}',t:'Das Heft als Doppelseiten',d:'Unter „Seiten planen“ siehst du das Heft, wie es gedruckt aufgeschlagen liegt: Titel vorn, Anzeigen, Berichte, Jugend, Impressum, Rückseite.',r:'team'},
    {ic:'\u270B',t:'Seiten ziehen',d:'Seite halten und an den neuen Platz ziehen. Am oberen und unteren Rand läuft das Heft weiter. Wer nicht ziehen mag, tippt die Seite an und nimmt „Nach vorn“ oder „Nach hinten“.',r:'team'},
    {ic:'\u2728',t:'Von selbst ordnen',d:'Die App verteilt die Anzeigen gleichmäßig durchs Heft, legt halbe Anzeigen gleicher Themen auf eine Seite und füllt auf eine Seitenzahl, die durch vier teilbar ist.',r:'team'},
    {ic:'\u{1F4CC}',t:'Feste Plätze',d:'Titel, die Anzeige auf Seite 2, das Impressum und die Rückseite bleiben stehen, egal was du ziehst.',r:'team'},
    {ic:'\u{1F6E0}',t:'So geht es weiter',d:'Als Nächstes kommt der Satz der Seiten mit Spielberichten, Tabelle und Terminen und die Druckdatei für die Druckerei.',r:'team'}
   ]},
  {id:'0.99.29',v:'0.99.29',datum:'2026-11-14',titel:'Stadionheft im Partnerbereich',kurz:'Der Partnerbereich hat einen neuen Reiter Stadionheft: das nächste Heft mit allen Fristen, die Freigabe durch die Redaktion und die Anzeigen mit dem Stand, wer zahlt und wer im Heft steht.',
   punkte:[
    {ic:'\u{1F4D6}',t:'Nächstes Heft mit Fristen',d:'Du trägst ein, zu welchem Heimspiel das Heft erscheint. Die App rechnet die Abgabe an die Druckerei aus und zeigt, was noch offen ist: Termin, Anzeigen, Freigabe, Druck.',r:'team'},
    {ic:'\u2705',t:'Freigabe durch die Redaktion',d:'Die Redaktion bekommt die Bitte um Freigabe als Mitteilung und antwortet mit Freigeben oder Noch nicht. Die Leitung im Bereich Partner bekommt Bescheid.',r:'team'},
    {ic:'\u{1F4B6}',t:'Anzeigen: wer zahlt, wer steht drin',d:'Jede Anzeige ist eingeordnet: zahlt, Gegenleistung, im Heft ohne Beitrag oder zahlt und fehlt im Heft. Beträge sieht nur die Leitung im Bereich Partner.',r:'team'},
    {ic:'\u23F0',t:'Erinnerungen, wenn du sie einschaltest',d:'Eine Woche vor der Abgabe die Bitte um Freigabe, die letzten drei Tage täglich eine Erinnerung, und drei Tage vorher ohne Freigabe ein Hinweis an die Abteilungsleitung auf der Startseite. Solange der Schalter aus ist, geht von selbst nichts raus.',r:'admin'},
    {ic:'\u{1F6E0}',t:'So geht es weiter',d:'Als Nächstes kommt der Heftplaner, in dem du Seiten ziehst und ordnest, danach der Satz der Seiten mit der Druckdatei.',r:'team'}
   ]},
  {id:'0.99.28',v:'0.99.28',datum:'2026-11-14',titel:'Training über die App',kurz:'Trainings stehen jetzt bei den Terminen. Spieler sagen dort mit einem Tipp zu oder ab, die Frage kommt als Mitteilung aufs Handy. Per WhatsApp geht für Training und Materialdienst nichts mehr raus.',
   punkte:[
    {ic:'\u26BD',t:'Training bei den Terminen',d:'Jedes Training steht im Kalender, mit Uhrzeit und Ort. Spieler sehen dort ihre Antwort und ändern sie bis zum Training. Auch Spielersitzung, Essen und andere Termine der eigenen Mannschaft stehen jetzt bei den Spielern.'},
    {ic:'\u{1F514}',t:'Kommst du ins Training?',d:'Die Frage geht von selbst raus, sobald die Abstimmung angelegt ist. Am Trainingstag erinnert die App alle, die noch nicht geantwortet haben.'},
    {ic:'\u{1F4CA}',t:'Stand ans Trainerteam',d:'Am Trainingstag bekommen Trainer und Betreuer der Mannschaft eine Mitteilung: wie viele dabei sind, wie viele nicht und von wem die Antwort fehlt.',r:'team'},
    {ic:'\u{1F9FA}',t:'Materialdienst',d:'Wer eingeteilt ist, bekommt zum Start und an jedem Trainingstag eine Erinnerung in der App.'},
    {ic:'\u{1F551}',t:'Uhrzeit je Trainingstag',d:'In der Automatik lässt sich für einzelne Tage eine eigene Uhrzeit eintragen, zum Beispiel Dienstag 19:30 und Donnerstag 19:00.',r:'team'},
    {ic:'\u{1F4F5}',t:'WhatsApp ist aus',d:'Einladung, Erinnerung und Materialdienst laufen über die App. In der Automatik steht, wen die App schon erreicht und wem sie noch fehlt. Der Link für Spieler ohne die App bleibt. Die Anfrage an Spieltagshelfer ändert sich nicht.',r:'team'}
   ]},
  {id:'0.99.27',v:'0.99.27',datum:'2026-11-14',titel:'Banden: Laufzeit, Notizen und Vorschau',kurz:'Für die Leitung im Bereich Partner steht an jeder Bande, wie lange sie gebucht ist und was danach kommt. Eine Vorschau zeigt drei Spielzeiten auf einen Blick.',
   punkte:[
    {ic:'\u{1F4C5}',t:'Laufzeit je Bande',d:'An jeder Bande steht, bis wann sie bezahlt und gebucht ist, ob sich der Vertrag von selbst verlängert, bis wann gekündigt sein muss und was der Beitrag im Jahr ist.'},
    {ic:'\u{1F52E}',t:'Wer hängt wann',d:'Die Vorschau zeigt für diese, die nächste und die übernächste Saison, welche Banden fest sind, welche sich verlängern, welche auslaufen und was offen ist. Dazu die Beiträge je Saison.'},
    {ic:'\u{1F4DD}',t:'Notizen mit Datum',d:'Zu jeder Bande lassen sich Notizen schreiben, zum Beispiel wenn ein Partner sagt, dass er danach nicht weitermacht. Sie bleiben mit Datum und Namen stehen.'},
    {ic:'\u{1F516}',t:'Vormerken',d:'Will ein anderer Partner einen Platz haben, lässt er sich für danach vormerken. Das geht auch bei freien Plätzen.'},
    {ic:'\u{1F512}',t:'Nur intern',d:'Das alles sehen nur Admin, Vorstand und die Leitung im Bereich Partner.'}
   ]},
  {id:'0.99.26',v:'0.99.26',datum:'2026-11-14',titel:'Bandenbeitrag auch für die Leitung im Bereich Partner',kurz:'Wer den Bereich Partner leitet oder vertritt, sieht im Bandenplan jetzt auch, ob für eine Bande ein Beitrag gezahlt wird.',
   punkte:[
    {ic:'\u{1F91D}',t:'Abteilungsleiter und Stellvertreter Partner',d:'Beide sehen im Bandenplan den Beitrag je Bande mit Notiz und können ihn ändern, so wie bisher Admin und Vorstand. Helfer im Bereich und das übrige Partner-Team sehen davon weiter nichts.'}
   ]},
  {id:'0.99.25',v:'0.99.25',datum:'2026-11-14',titel:'Die Banden, wie sie heute hängen',kurz:'Der Bandenplan zeigt die Reihe am Hauptplatz jetzt so, wie sie wirklich hängt: in der richtigen Reihenfolge, mit Lücken, und als Rundgang in 3D mit den Fotos der Banden.',
   punkte:[
    {ic:'\u{1F6B6}',t:'Rundgang in 3D',d:'Unter Partner, Bandencreator, Bandenplan gehst du die Bandenreihe entlang, vom Rasen aus gesehen. Zieh das Bild zur Seite oder nimm die Pfeile. Ein Tipp auf eine Bande zeigt, wem sie gehört.'},
    {ic:'\u{1F4F8}',t:'Originalgetreu',d:'Jede Bande steht in ihrer wirklichen Länge und mit ihrem Foto da. Kleine Banden sind klein, Lücken bleiben Lücken, und der Leerstand in der Reihe ist ein freier Platz.'},
    {ic:'\u{1F522}',t:'Reihenfolge von links nach rechts',d:'Die Reihe stimmt jetzt mit dem Platz überein, von der Bande im Bogen beim Spielplatz bis zur letzten an der Längsseite. Zwei Banden, die in der Liste fehlten, sind dabei. Die Nummern wurden dafür einmal neu vergeben und bleiben ab jetzt fest.'},
    {ic:'\u{2B1C}',t:'Frei und belegt auf einen Blick',d:'Im Plan sind freie Plätze weiß mit gestricheltem Rand, belegte dunkelblau.'},
    {ic:'\u{1F4B6}',t:'Für Admin und Vorstand: Bandenbeitrag',d:'An jeder Bande steht, ob dafür laut Übersicht ein Beitrag gezahlt wird, mit Notiz und zum Ändern. Im Plan sind Banden ohne Beitrag rot und unklare gelb umrandet. Andere sehen davon nichts.'}
   ]},
  {id:'0.99.24',v:'0.99.24',datum:'2026-11-14',titel:'Bandenplan zum Antippen',kurz:'Der Bandenplan zeigt jetzt den Hauptplatz im richtigen Maßstab. Jede Bande hat ihre Nummer, und beim Gestalten stehen die echten Nachbarn daneben.',
   punkte:[
    {ic:'\u{1F3DF}',t:'Der Platz, wie er ist',d:'Unter Partner, Bandencreator, Bandenplan siehst du den Hauptplatz von oben, mit Laufbahn, Clubhaus und allen Banden an ihrem Platz. Gemessen nach dem Luftbild.'},
    {ic:'\u{1F522}',t:'Jede Bande hat ihre Nummer',d:'Die Banden sind rund um den Platz durchnummeriert. Tipp eine an, im Plan oder in der Leiste darunter: Du siehst, wem sie gehört, wer daneben hängt und was frei ist.'},
    {ic:'\u{1F4CF}',t:'Wie viele Banden passen',d:'Zu jeder Seite steht, wie lang sie ist und wie viele Banden im neuen Maß 3 m dort Platz haben.'},
    {ic:'\u{1F440}',t:'Die eigene Bande am Platz sehen',d:'Wer einen Platz wählt und die Bande gestaltet, sieht sie dort, wo sie hängen wird, mit den wirklichen Nachbarn links und rechts. Freie Plätze daneben sind als frei zu erkennen.'},
    {ic:'\u{1F527}',t:'Kein fremder Name mehr auf dem Bild',d:'Bisher standen neben jeder Bande immer dieselben fremden Logos. Ohne gewählten Platz stehen jetzt neutrale Banden daneben.'}
   ]},
  {id:'0.99.23',v:'0.99.23',datum:'2026-11-14',titel:'Spieler, Helfer, Abteilungsleiter und Stellvertreter statt Gast',kurz:'Wer zum Verein gehört, steht nicht mehr als Gast in der App. Spieler und Helfer sind eigene Rollen, wer einen Bereich leitet oder vertritt, heißt Abteilungsleiter oder Stellvertreter.',
   punkte:[
    {ic:'\u{1F45F}',t:'Rolle Spieler',d:'Spieler sehen Termine, ihr Spielerkonto und neu „Meine Mannschaft“: Kader mit Name und Position, die nächsten Spiele, die letzten Ergebnisse und die Tabelle. Alles nur zum Ansehen. Scouting, Kaderplanung, Bewertungen, Verletzungen und Kontaktdaten sehen Spieler nicht.'},
    {ic:'\u{1F91D}',t:'Rolle Helfer',d:'Helfer sehen Termine und ihre eigenen Einsätze.'},
    {ic:'\u{2B50}',t:'Abteilungsleiter und Stellvertreter',d:'Wer einen Bereich leitet oder vertritt, zum Beispiel Partner, steht jetzt überall als Abteilungsleiter oder Stellvertreter mit seinem Bereich, nicht mehr als Gast. Beide Rollen stehen zur Auswahl: beim Einladen, in der Team-Liste und bei der Freigabe einer Anfrage. An den Rechten ändert sich nichts.'},
    {ic:'\u{2705}',t:'Freigeben mit der richtigen Rolle',d:'Bei einer Zugangsanfrage schlägt die App jetzt Spieler oder Helfer vor, wenn die Person im Kader oder im Helferpool steht, und Abteilungsleiter oder Stellvertreter, wenn sie laut Organigramm einen Bereich leitet oder vertritt. Der Bereich „1. Mannschaft“ ist der Trainerbereich mit Schreibrechten und für Spieler nicht nötig.',r:'admin'},
    {ic:'\u{26BD}',t:'Siege zählen sofort',d:'Nach jedem Abruf der Spielberichte wird ein Sieg gleich den eingesetzten Spielern angerechnet. Im Spielerkonto steht die Zahl der Siege mit Einsatz. Die Beträge für Prämien und Strafen sind noch vorläufig, das steht dort dabei.'},
    {ic:'\u{1F4B6}',t:'Auszahlung je Spiel abhaken',d:'In der Übersicht der Siegprämien hakt die Leitung jetzt jedes Spiel einzeln ab. Ein Tipp auf „Zurück auf offen“ nimmt es zurück. Den Knopf, der alles auf einmal abgehakt hat, gibt es nicht mehr.',r:'admin'}
   ]},
  {id:'0.99.22',v:'0.99.22',datum:'2026-11-14',titel:'Downloads in der App und sauberer Start',kurz:'In der App aus dem Store kommen Plakate und andere Dateien jetzt wirklich aufs Handy. Dazu ein sauberer Start ohne die kleine Kachel.',
   punkte:[
    {ic:'\u{1F4E5}',t:'Dateien landen auf dem Handy',d:'In der App aus dem Store hieß es „Plakat als PNG geladen“, auf dem Handy kam aber nichts an. Jetzt erscheint „Deine Datei ist fertig“ mit dem Knopf „Aufs Handy laden“. Er öffnet den Browser des Handys, die Datei liegt danach unter Downloads. Das gilt für Plakate, Excel, Kalender und PDF.'},
    {ic:'\u{2728}',t:'Start ohne Kachel',d:'Wer die Sportzentrale auf dem Android-Handy als Web-App installiert hat, sah beim Öffnen kurz das App-Symbol als kleine Kachel auf dunklem Grund. Jetzt steht dort das Wappen freigestellt, genau wie danach im Ladebildschirm.'},
    {ic:'\u{23F3}',t:'Kommt von selbst',d:'Android übernimmt das neue Startbild meist innerhalb von ein bis drei Tagen. Wer nicht warten will, entfernt das Symbol vom Startbildschirm und fügt die App neu hinzu. Das Symbol selbst bleibt, wie es ist.'}
   ]},
  {id:'0.99.21',v:'0.99.21',datum:'2026-11-14',titel:'Eigene Fotos im Spieltagsstudio',kurz:'Eigene Fotos lassen sich im Spieltagsstudio hochladen und bleiben gespeichert. Spielplakat, Ergebnis und Event greifen auf dieselbe Bildbibliothek zu.',
   punkte:[
    {ic:'\u{1F4E4}',t:'Eigenes Foto hochladen',d:'Im Spielplakat, bei Ergebnis und bei Event gibt es unter den Hintergründen „Eigenes Foto hochladen“. Das Bild wird gespeichert und steht danach allen im Spieltagsstudio zur Auswahl, auch am anderen Gerät. Bisher blieb es nur auf dem eigenen Gerät.',r:'team'},
    {ic:'\u{1F5BC}\u{FE0F}',t:'Eine Bibliothek für alles',d:'Das Spielplakat zeigt jetzt hinter den festen Motiven auch die Bilder aus der Bibliothek, darunter sieben neue Herbstmotive. Ergebnis und Event zeigen dieselben Bilder.',r:'team'},
    {ic:'\u{2728}',t:'Alle Motive klar zu sehen',d:'Im Spielplakat waren Motive, die nicht zur Lichtstimmung des Spiels passen, blasser dargestellt. Jetzt sind alle gleich gut zu sehen, die passenden stehen weiter vorne.',r:'team'},
    {ic:'\u{2B07}\u{FE0F}',t:'Export mit Bibliotheksbild',d:'Ein Event-Plakat mit einem Bild aus der Bibliothek ließ sich nicht als PNG laden. Das klappt jetzt.',r:'team'},
    {ic:'\u{1F5C2}\u{FE0F}',t:'Bildpool im Studio',d:'Wer im Studio ein Bild in den Bildpool lädt, findet es danach auch im Spieltagsstudio, wenn es groß genug ist. Umbenennen und Löschen bleibt im Bildpool.',r:'team'}
   ]},
  {id:'0.99.20',v:'0.99.20',datum:'2026-11-13',titel:'Strafenkatalog selbst anordnen',kurz:'Im Bearbeiten lassen sich die Strafen innerhalb ihrer Kategorie mit zwei Pfeilen nach oben und unten schieben.',
   punkte:[
    {ic:'\u{2195}\u{FE0F}',t:'Reihenfolge mit Pfeilen',d:'Strafenkatalog, Bearbeiten: Jede Strafe hat einen Pfeil nach oben und einen nach unten. Verschoben wird innerhalb von Training, Spiel oder Allgemein, gespeichert wird sofort.'},
    {ic:'\u{1F4CB}',t:'Gilt überall',d:'Die Reihenfolge steht danach genauso im Katalog, beim Buchen einer Strafe und auf der Seite für die Mannschaft. Bisher standen die Strafen in der Reihenfolge, in der sie angelegt wurden. Neue landen am Ende ihrer Kategorie.'}
   ]},
  {id:'0.99.19',v:'0.99.19',datum:'2026-11-13',titel:'Zusammenführen lässt jeden in seiner Mannschaft, Hüte ohne Doppelungen',kurz:'Wird ein doppelter Spieler zusammengeführt, bleibt der Spieler sicher in seiner Mannschaft. Dazu steht jeder Hut nur noch einmal da.',
   punkte:[
    {ic:'\u{1F6E1}\u{FE0F}',t:'Niemand fällt aus seiner Mannschaft',d:'Beim Zusammenführen doppelter Spieler bleiben Mannschaft, Kader, Verein und Position des Spielers, der bleibt, immer wie sie sind. Würde sich daran etwas ändern, bricht die App ab und speichert nichts.',r:'admin'},
    {ic:'\u{1F3A9}',t:'Ein Hut, ein Schild',d:'Wer einen Bereich leitet und zusätzlich in dessen Helferliste steht, sah den Hut bisher zweimal. Jetzt steht er einmal da, mit der höchsten Stufe.'},
    {ic:'\u{1F4CB}',t:'Jeder Name einmal',d:'Hat eine Person zwei Konten, steht ihr Name in „Wer bekommt was“ trotzdem nur einmal. Die Mitteilung kommt weiter auf beiden Konten an.',r:'admin'}
   ]},
  {id:'0.99.18',v:'0.99.18',datum:'2026-11-13',titel:'Jeder trägt seine Hüte, Mitteilungen gehen an die Zuständigen',kurz:'Die App kennt jetzt alle Aufgaben einer Person an einer Stelle. Unter Mein Konto siehst du deine Hüte. Die ersten Mitteilungen gehen nur noch an den zuständigen Hut statt an alle Admins.',
   punkte:[
    {ic:'\u{1F3A9}',t:'Deine Hüte',d:'Unter Mein Konto steht, wie dich die App im Verein kennt: zum Beispiel Spieler, Kapitän, Seniorenleitung oder Partner-Team. Danach richtet sich, welche Mitteilungen du bekommst.'},
    {ic:'\u{1F514}',t:'Nur wer zuständig ist, wird gestört',d:'Sagt ein Helfer ab, erfährt es die Helferplanung. Neue Zugangsanfragen gehen an die Abteilungsleitung, Aufgaben zu Partnern ohne Betreuer an das Partner-Team. Der Hut steht im Titel der Mitteilung.',r:'admin'},
    {ic:'\u{1F4CB}',t:'Wer bekommt was',d:'Nutzer & Rollen zeigt je Mitteilung den Hut und die Namen dahinter, und je Person ihre Hüte. Trägt niemand einen Hut, geht die Mitteilung solange an die Abteilungsleitung.',r:'admin'}
   ]},
  {id:'0.99.17',v:'0.99.17',datum:'2026-11-13',titel:'Neue Konten wie ein Warenkorb freigeben',kurz:'Bei jeder Anfrage gleicht die App mit Kader, Organigramm und Helferpool ab und legt die Treffer in einen Korb. Du siehst, wer was eingetragen hat, und bestätigst Rolle und Rechte.',
   punkte:[
    {ic:'\u{1F9FA}',t:'Der Korb zur Anfrage',d:'Vorname, Name, E-Mail und Handynummer, darunter alles, was der Abgleich gefunden hat: Spieler im eigenen Kader, Stellen im Organigramm, Helferpool, Gremien.',r:'admin'},
    {ic:'\u{2705}',t:'Freigeben als … mit diesen Rechten',d:'Die Rolle ist vorgeschlagen, die Bereiche aus dem Korb sind schon dabei. Ein Tipp nimmt einen Bereich heraus oder dazu, dann einmal bestätigen. Admin wird nie vorgeschlagen.',r:'admin'},
    {ic:'\u{1F514}',t:'Schnelles Ja bleibt möglich',d:'Ja direkt in der Mitteilung gibt wie bisher mit der einfachen Rolle frei. Liegt etwas im Korb, bleibt er unter Nutzer & Rollen stehen, bis ihn jemand aus der Leitung bestätigt.',r:'admin'},
    {ic:'\u{1F4F1}',t:'Handynummer bei der Anfrage',d:'Wer einen Zugang anfragt, gibt jetzt seine Handynummer an. Sie ist nur für die Abteilungsleitung sichtbar.'}
   ]},
  {id:'0.99.16',v:'0.99.16',datum:'2026-11-13',titel:'Zugangsanfragen direkt aus der Mitteilung freigeben',kurz:'Fragt jemand einen Zugang an, bekommen Admins und Vorstand eine Mitteilung mit zwei Knöpfen: freigeben oder ablehnen.',
   punkte:[
    {ic:'\u{1F514}',t:'Freigeben ohne Umweg',d:'Die Mitteilung fragt „Zugang für … freigeben?“. Ein Tipp auf den Knopf reicht, die App muss dafür nicht offen sein. Auf dem iPhone heißen die Knöpfe Ja und Nein.',r:'admin'},
    {ic:'\u{2709}\u{FE0F}',t:'Die Person bekommt sofort Bescheid',d:'Nach der Freigabe geht die Mail „Du bist freigeschaltet“ von selbst raus. Trainer werden als Trainer freigegeben, alle anderen als Gast. Die Rolle änderst du später unter Nutzer & Rollen.',r:'admin'},
    {ic:'\u{1F91D}',t:'Einer entscheidet, für alle erledigt',d:'Sobald jemand aus der Leitung geantwortet hat oder die Anfrage in der Karte Zugangsanfragen erledigt ist, verschwindet die Frage bei den anderen.',r:'admin'}
   ]},
  {id:'0.99.15',v:'0.99.15',datum:'2026-11-13',titel:'Ein neuer Einstieg zur Test-App',kurz:'Auf der Testseite siehst du gleich, wie es auf Android oder iPhone weitergeht.',
   punkte:[{ic:'📱',t:'Schritt für Schritt zur App',d:'Die Testseite zeigt den nächsten Schritt. Ist dein Gerät noch nicht freigegeben, kannst du die Vereinsapp schon im Browser öffnen.'}]},
  {id:'0.99.14',v:'0.99.14',datum:'2026-11-13',titel:'Trikots in 3D sehen echter aus',kurz:'Beim Drehen bleibt der Rand der Trikots glatt, Logos sitzen wie gedruckt auf dem Stoff und die Ärmellogos liegen ganz auf dem Ärmel.',
   punkte:[
    {ic:'\u{1F455}',t:'Glatter Rand beim Drehen',d:'Heim und Auswärts: keine Treppenkante und keine Sprenkel mehr am Umriss. Das Netz ist doppelt so fein und läuft am Rand rund aus.'},
    {ic:'\u{1F3A8}',t:'Logos wie gedruckt',d:'Der Druck folgt den Falten und übernimmt Licht und Schatten des Stoffs, im 3D-Trikot und in der Foto-Ansicht.'},
    {ic:'\u{1F4AA}',t:'Ärmellogos auf dem Ärmel',d:'Etwas kleiner und weiter innen, zur Außenkante hin leicht gestaucht wie auf einem runden Ärmel. Nichts wird mehr abgeschnitten.'},
    {ic:'\u{1F9E5}',t:'Trainingsjacke weniger kantig',d:'Die Schultern fallen rund ab, der Kragen ist niedriger und passt in der Farbe zur Jacke.'}
   ]},
  {id:'0.99.13',v:'0.99.13',datum:'2026-11-13',titel:'Spielerkonto: dein Stand, deine Strafen, die Bestenliste',kurz:'Jeder Spieler mit Konto sieht seinen Stand aus Siegprämien und Strafen, seine Trainingsbeteiligung und die Bestenliste seiner Mannschaft. Strafen lassen sich mit einem Satz hinterfragen.',
   punkte:[
    {ic:'\u{1F4B6}',t:'Dein Stand auf einen Blick',d:'Offene Siegprämien minus offene Strafen, dazu jede Strafe und jede Prämie einzeln. Bezahlt und ausgezahlt wird wie gewohnt.'},
    {ic:'\u{1F451}',t:'Bestenliste und Ehrentitel',d:'Top 3 im Monat, in der Saison und All-Time. Wer vorne liegt, trägt den Titel: Tunnel-Magnet, Kassenkönig, Trainingsweltmeister. Die Liste sieht nur die eigene Mannschaft.'},
    {ic:'\u{1F514}',t:'Mitteilung bei neuer Strafe und neuer Prämie',d:'Mit einem lockeren Spruch statt erhobenem Zeigefinger. Nach einem Sieg kommt die Prämie von selbst dazu.'},
    {ic:'\u{1F914}',t:'Strafe hinterfragen',d:'Ein Tipp, ein Satz. Der Kassenwart prüft und du bekommst sofort Bescheid, ob sie bleibt oder gestrichen ist.'},
    {ic:'\u{1F3C3}',t:'Trainingsbeteiligung',d:'Deine Quote, deine Serie und dein Platz in der Mannschaft. Verletzt oder krank zählt nicht gegen dich.'},
    {ic:'\u{1F9FE}',r:'admin',t:'Für Kassenwarte und Leitung',d:'Kassenwarte entscheiden hinterfragte Strafen im Spielerkonto. Admin und Vorstand sehen die Prämien der Mannschaft und haken Auszahlungen ab.'},
   ]},
  {id:'0.99.12',v:'0.99.12',datum:'2026-11-12',titel:'Persönlicher Link zum App-Test',kurz:'Wer schon einen Zugang hat, bekommt einen eigenen Link zur Testversion. Ohne Formular, mit Vornamen, Schritt für Schritt bis zur installierten App.',
   punkte:[
    {ic:'\u{1F517}',r:'admin',t:'„Link teilen“ in der Karte „App-Test“',d:'Je Konto ein Tipp: Der Link geht mit einem kurzen Text in WhatsApp oder in die Zwischenablage. Von selbst wird nichts verschickt.'},
    {ic:'\u{1F44B}',t:'Die Seite kennt dich',d:'Sie begrüßt dich mit Vornamen, überspringt Formular und Postfach und zeigt gleich die Schritte für dein Handy.'},
    {ic:'\u{1F4CB}',r:'admin',t:'Fortschritt im Blick',d:'Wie weit jede Person ist und wer die Store-App schon nutzt, steht in derselben Karte.'},
   ]},
  {id:'0.99.11',v:'0.99.11',datum:'2026-11-12',titel:'Einladung zum Training: einmal statt doppelt',kurz:'Wer Trainingsabfragen in der App beantwortet, bekommt die Einladung nur noch dort und nicht zusätzlich per WhatsApp.',
   punkte:[
    {ic:'\u{1F4F2}',t:'App statt WhatsApp',d:'Sobald du eine Abfrage in der App oder direkt in der Mitteilung beantwortet hast, kommt die nächste Einladung nur noch dort.'},
    {ic:'\u{1F6DF}',t:'Niemand fällt durch',d:'Wer am Trainingstag noch nicht geantwortet hat, bekommt wie bisher die Erinnerung per WhatsApp. Wer die App länger nicht nutzt, bekommt von selbst wieder die Einladung per WhatsApp.'},
   ]},
  {id:'0.99.10',v:'0.99.10',datum:'2026-11-12',titel:'Deine Einsätze: der Helferplan kommt aufs Handy',kurz:'Wer im Helferplan steht und ein Konto hat, sieht seine Einsätze auf der Startseite und bekommt sie ein paar Tage vorher als Frage mit Zusagen und Absagen.',
   punkte:[
    {ic:'\u{1F9E1}',t:'Deine Einsätze auf der Startseite',d:'Tag, Aufgabe und Spiel auf einen Blick. Dazu der Stand: eingeplant, zugesagt oder abgesagt.'},
    {ic:'\u{1F514}',t:'Kurze Frage vor dem Einsatz',d:'Ein paar Tage vorher fragt die App, ob es bei dir klappt. Ein Tipp in der Mitteilung genügt.'},
    {ic:'\u{1F4E3}',r:'admin',t:'Absagen landen sofort bei der Leitung',d:'Sagt jemand ab, kommt eine Mitteilung mit Aufgabe und Tag. Der Helferplan selbst bleibt, wo er gepflegt wird.'},
    {ic:'\u{1F517}',r:'admin',t:'Helferplan und Konten verbinden',d:'In der Karte „App-Test“. Gleiche E-Mail oder gleicher Name verbinden sich von selbst, den Rest ordnest du mit zwei Tipps zu.'},
   ]},
  {id:'0.99.9',v:'0.99.9',datum:'2026-11-12',titel:'Startklar: Training als Frage aufs Handy',kurz:'Spieler mit Konto bekommen jede Trainingsabfrage als Mitteilung mit Zusagen und Absagen. Neue Nutzer führt die App beim ersten Start durch die Einrichtung.',
   punkte:[
    {ic:'\u{1F514}',t:'Zusagen direkt in der Mitteilung',d:'Wer als Spieler zugeordnet ist, bekommt Training und Spiel aufs Handy und antwortet mit einem Tipp. Die Antwort steht sofort in der Abstimmung des Trainers.'},
    {ic:'\u{1F44B}',t:'Willkommen beim ersten Start',d:'Kurze Begrüßung, Mitteilungen erlauben, App auf den Startbildschirm. In einer Minute ist alles eingerichtet.'},
    {ic:'\u{1F517}',r:'admin',t:'Konto und Spieler verbinden',d:'Bei der Freigabe einer Zugangsanfrage oder später in der Karte „App-Test“: auswählen, welcher Spieler das ist. Offene Abfragen gehen dann sofort raus.'},
   ]},
  {id:'0.99.8',v:'0.99.8',datum:'2026-11-12',titel:'App-Test: eintragen, Schritt für Schritt bis zur App',kurz:'Auf svbsc.kaderwerk.pro/test.html trägt sich jeder selbst ein, wählt Android oder iPhone und wird bis zur installierten App geführt.',
   punkte:[
    {ic:'\u{270D}\u{FE0F}',t:'Ein Formular, ein Zugang',d:'Wer sich einträgt, bekommt zugleich seinen Zugang zur App. Eine Mail bestätigen, Passwort festlegen, fertig.'},
    {ic:'\u{1F4EC}',t:'Bescheid, wenn es losgeht',d:'Android-Tester gehen gleich in die Testgruppe, iPhone-Nutzer kommen auf die Liste. Sobald Google oder Apple freigeben, kommt eine Mail mit dem Link.'},
    {ic:'\u{1F4CB}',r:'admin',t:'Karte „App-Test“ in Nutzer & Rollen',d:'Wer hat sich eingetragen, mit welchem Handy, wie weit ist er. Von dort stellt der Admin um und gibt allen Wartenden mit einem Tipp Bescheid.'},
   ]},
  {id:'0.99.7',v:'0.99.7',datum:'2026-11-12',titel:'Die App kommt in die Stores: Testphase',kurz:'Unter svbsc.kaderwerk.pro/test.html führt eine Seite Schritt für Schritt zur Testversion für Android und iPhone.',
   punkte:[
    {ic:'\u{1F4F1}',t:'In wenigen Schritten zur App',d:'Die Seite erkennt dein Handy und zeigt genau den nächsten Schritt. Sie merkt sich, wo du warst.'},
    {ic:'\u{1F91D}',t:'Zwölf Tester, 14 Tage',d:'So viele verlangt Google, bevor die App für alle in den Play Store darf. Jeder, der mitmacht, hilft.'},
   ]},
  {id:'0.99.6',v:'0.99.6',datum:'2026-11-12',titel:'Auch bei den anderen Vereinen fehlt niemand mehr',kurz:'Spieler aus unseren sechs Ligen, die spielen, aber noch nicht getroffen haben, kommen jetzt von selbst ins Scouting.',
   punkte:[
    {ic:'\u{1F4E1}',r:'scout',t:'Neue Spieler der Umgebung',d:'Wer in dieser Saison drei oder mehr Spiele für einen Verein aus Gruppenliga, Kreisoberliga oder den Kreisligen A bis D hat, steht im Bestand. Bisher kamen neue Namen nur über die Torjägerliste.'},
    {ic:'\u{1F195}',r:'scout',t:'Erkennbar am Zeichen für neue Spieler',d:'Die Einträge tragen das Zeichen für Neue in dieser Saison. Position und Alter kommen mit, wenn sie bekannt sind.'},
   ]},
  {id:'0.99.5',v:'0.99.5',datum:'2026-11-12',titel:'Wer spielt, steht im Kader',kurz:'Spieler, die bei fussball.de im Spielbericht stehen, fehlen nicht mehr in den Listen. Die App legt sie von selbst an.',
   punkte:[
    {ic:'\u{1F9D1}\u200D\u{1F91D}\u200D\u{1F9D1}',t:'Kein Spieler geht mehr verloren',d:'Bisher kamen neue Spieler nur über die Torjägerliste in die App. Wer spielte, aber nicht traf, blieb unsichtbar. Jetzt reicht ein Einsatz in einem Pflichtspiel der Ersten oder Zweiten.'},
    {ic:'\u{1F50E}',r:'admin',t:'Bei ähnlichen Namen entscheidet ein Mensch',d:'Heißt ein eigener Spieler fast genauso, fragt die Datenprüfung nach: derselbe Spieler oder jemand anderes. Der Admin bekommt dazu eine Mitteilung.'},
   ]},
  {id:'0.99.4',v:'0.99.4',datum:'2026-11-11',titel:'Ja oder Nein direkt in der Mitteilung',kurz:'Einladungen und Rückfragen kommen mit zwei Knöpfen. Ein Tipp auf Ja oder Nein, und die Antwort ist gespeichert. Wer die Mitteilung wegwischt, findet die Frage oben auf der Startseite.',
   punkte:[
    {ic:'\u{1F44D}',t:'Zwei Knöpfe statt App öffnen und suchen',d:'Training, Helfereinsatz oder eine Rückfrage vom Trainer: Die Mitteilung hat die Knöpfe gleich dabei. Beim Training ist das Ja zugleich die Zusage in der Abstimmung.'},
    {ic:'\u{1F4CB}',t:'Nichts geht verloren',d:'Offene Fragen stehen oben auf der Startseite, bis sie beantwortet sind. Umentscheiden geht, solange die Frist läuft.'},
    {ic:'\u{1F4CA}',r:'team',t:'Stand für Trainer und Leitung',d:'Wer hat geantwortet, wer fehlt noch: Alle Antworten liegen an einer Stelle und lassen sich zusammenfassen.'},
   ]},
  {id:'0.99.3',v:'0.99.3',datum:'2026-11-11',titel:'Einfach reinkommen: Zugang anfragen',kurz:'Wer noch keinen Zugang hat, fragt ihn in einer Minute selbst an: Name, E-Mail, wer man ist. Danach Mail, Passwort zweimal eintippen, Freigabe durch die Leitung.',
   punkte:[
    {ic:'\u{1F44B}',t:'Zugang anfragen',d:'Auf der Anmeldeseite „Neu hier? Zugang anfragen“. Spieler, Eltern, Helfer und Trainer tragen Name und E-Mail ein, bekommen eine Mail, legen ihr Passwort fest und sind nach der Freigabe drin. Ganz ohne Google.'},
    {ic:'\u2705',r:'admin',t:'Freigeben mit einem Tipp',d:'Neue Anfragen kommen als Mitteilung und stehen oben unter Nutzer & Rollen. Rolle wählen, Freigeben, fertig. Die Person bekommt eine Mail und ist mit einem Tipp drin.',go:'admin'},
    {ic:'\u{1F511}',t:'Mit Google oder Apple',d:'Sobald die Leitung es einschaltet, geht die Anmeldung auch mit „Weiter mit Google“ oder „Weiter mit Apple“. Bestehende Konten mit derselben E-Mail bleiben dieselben.'},
   ]},
  {id:'0.99.2',v:'0.99.2',datum:'2026-11-11',titel:'Leitung geschützt, Notfallzugang',kurz:'Albert ist Super-Admin. Admins und den Super-Admin ändert nur er, und im Notfall gibt es einen geregelten Weg mit vier Augen.',
   punkte:[
    {ic:'\u{1F6E1}',r:'admin',t:'Super-Admin',d:'Unter Nutzer & Rollen ist der Super-Admin markiert. Admins ändern, sperren und löschen kann nur er, „Admin“ vergibt nur er. Die Datenbank prüft das selbst.',go:'admin'},
    {ic:'\u{1F511}',r:'admin',t:'Leitung und Notfall',d:'Unter Mein Konto: Nachfolger, versiegelter Mastercode, Protokoll. Eine Notfall-Übernahme braucht den Nachfolger und den Mastercode zusammen, danach 7 Tage Frist, in der der Super-Admin abbrechen kann.'},
   ]},
  {id:'0.99.1',v:'0.99.1',datum:'2026-11-11',titel:'Spieltagsstudio: Plakate für Events wie die Nachspielzeit',kurz:'Neuer Bereich „Event“ im Spieltagsstudio: Sondertage wie die Nachspielzeit im selben Look wie das Heimspiel-Plakat, für Instagram, WhatsApp und zum Aushängen.',
   punkte:[
    {ic:'⭐',r:'team',t:'Event neben Spielplakat, Live-Ticker und Ergebnis',d:'Vorlage „Nachspielzeit“ mit allen Texten, oder ein eigenes Event. Headline in zwei Zeilen wie beim Heimspiel, Datum groß in Orange, darunter ein Kasten fürs Programm und einen Hinweis wie „Essen vorbestellen“.',go:'plakat'},
    {ic:'\u{1F5A8}',r:'team',t:'Zum Drucken und zum Teilen',d:'Story, Feed und Quer für Social Media, dazu Plakat A4 und Flyer A5 in 300 dpi. Der passende Text für WhatsApp und Instagram steht gleich daneben.',go:'plakat'},
    {ic:'\u{1F5BC}',r:'team',t:'Eigene Fotos',d:'Hintergrund aus dem Vereinsfundus, aus der Studio-Bibliothek oder ein eigenes Foto vom Handy. Gespeichert wird das Event fürs ganze Team, das eigene Foto bleibt auf dem Gerät.',go:'plakat'},
   ]},
  {id:'0.99',v:'0.99',datum:'2026-11-11',titel:'Leiste mit Namen, Zahlen beim Spieler erklärt',kurz:'Auf dem Tablet steht unter jedem Symbol der Seitenleiste jetzt der Name, und die Unterseiten sind mit einem Tipp erreichbar, am Handy auch im Mehr-Menü. Im Spielerprofil steht, was die Stärke im Kreis und der MScore auf der Karte bedeuten.',
   punkte:[
    {ic:'\u{1F9ED}',t:'Seitenleiste mit Namen und Unterseiten',d:'Auf Tablet und kleinem Laptop steht unter jedem Symbol der Name. Bereiche mit Unterseiten (Planung, Mannschaften, Kader, Scouting, Wissen, Partner) tragen ein kleines Zeichen. Antippen öffnet daneben die Liste, zum Beispiel Kader mit Kaderübersicht, Planung und Top-Elf. Am Rechner stehen die Unterseiten eingerückt unter dem offenen Bereich, der Pfeil rechts klappt andere auf.',go:'kader'},
    {ic:'\u{1F4F1}',t:'Am Handy: im Mehr-Menü eine Ebene tiefer',d:'Kacheln mit Unterseiten tragen ein kleines Zeichen. Antippen zeigt im selben Menü alle Unterseiten, zum Beispiel Partner mit Trikots, Banden und Ablage. „Alle Bereiche“ führt zurück.',go:'kader'},
    {ic:'\u{1F7E2}',r:'scout',t:'Die Zahl im Kreis ist die Stärke',d:'Sie sagt, in welcher Liga der Spieler ein typischer Stammspieler wäre: 53 Kreisliga D, 57 C, 61 B, 65 A, 73 Kreisoberliga, 81 Gruppenliga. Die Farbe des Kreises sagt, wie sicher die Zahl ist: Grün sicher, Orange mittel, Grau gestrichelt unsicher.',go:'kueber'},
    {ic:'\u{1F0CF}',r:'scout',t:'Die Zahl auf der Karte ist der MScore',d:'Der ältere Wert aus Einsätzen, Leistung, Potenzial und Eye-Test, mit eigener Skala: 40 Kreisliga C, 55 B, 70 A, 85 Kreisoberliga. Deshalb weichen die beiden Zahlen ab.',go:'kueber'},
    {ic:'\u{1F4C5}',r:'scout',t:'Die Stärke rechnet montags',d:'Gerechnet wird nicht mehr jede Nacht, sondern einmal in der Woche am Montagmorgen, wenn die Ergebnisse vom Wochenende da sind. Admin und Vorstand können unter Wissen, Modell weiter von Hand neu rechnen lassen.',go:'kueber'},
    {ic:'\u2139',r:'scout',t:'Erklärung direkt im Profil',d:'Im Block Stärke gibt es „Was bedeuten die Zahlen?“ zum Aufklappen, unter der Kaderübersicht eine Legende zu Stärke, 24M und Sicherheit. Für Kaderplanung und Top-Elf zählt die Stärke im Kreis.',go:'kueber'},
   ]},
  {id:'0.98',v:'0.98',datum:'2026-11-10',titel:'Die Zahl der heutigen Partner stimmt wieder',kurz:'In der Station „Bis 2030“ stand beim Partner-Ziel „Noch ist keiner dabei“, obwohl wir 13 Bestandspartner haben. Jetzt zählen Bestandspartner mit.',
   punkte:[
    {ic:'\u{1F522}',r:'team',t:'Bestandspartner zählen mit',d:'Beim Ziel „10 aktive, lokale Partner“ steht jetzt die richtige Zahl. Gezählt wird wie in der Infobox „Aktuelle Partner“: Bestandspartner oder laufender Vertrag.',go:'sponsoring'},
   ]},
  {id:'0.97',v:'0.97',datum:'2026-11-10',titel:'Unser Weg bis 2030 steht jetzt im Partner-Flow',kurz:'Zwischen Verein und „Was es bewirkt“ steht neu die Station „Bis 2030“ mit den Zielen aus dem Konzept 2030 und ihrem Stand. Davor der Block „Die Jugend ist der Plan“: Zahl der Kinder, Jugendmannschaften und das Kaderziel aus der eigenen Jugend.',
   punkte:[
    {ic:'\u{1F5FA}',r:'team',t:'Die Roadmap aus dem Konzept 2030',d:'Ein Partner sieht jetzt, wohin wir wollen: die Ziele für Verein und Sport, jedes mit seinem Stand. Gepflegt werden sie wie bisher unter Verein, Vorstand und Ziele, die Präsentation zieht sie von dort.',go:'vorstand'},
    {ic:'\u{1F91D}',r:'team',t:'Beim Partner-Ziel steht der Stand',d:'Unter „10 aktive, lokale Partner“ steht, wie viele es heute sind und was sich mit diesem Betrieb ändern würde. Nur die Zahl, keine Namen und keine Beträge.',go:'sponsoring'},
    {ic:'\u26BD',r:'team',t:'Die Jugend zuerst',d:'Ein eigener Block sagt, dass die Jugend nicht das Beiprogramm neben der Ersten ist, mit der Zahl der Kinder, den Jugendmannschaften und dem Ziel, 14 von 21 Kaderplätzen aus der eigenen Jugend zu besetzen.',go:'sponsoring'},
   ]},
  {id:'0.96',v:'0.96',datum:'2026-11-10',titel:'Euer Auftritt zuerst, und wir dürfen euch nennen',kurz:'Bande und Trikot stehen in der Partner-Präsentation jetzt ganz vorn, noch vor den Preisen. Beim Abschluss fragen wir, ob wir öffentlich sagen dürfen, dass die Firma Partner ist. Wer ja sagt, steht in der neuen Box „Aktuelle Partner“.',
   punkte:[
    {ic:'\u{1F3DF}',r:'team',t:'Euer Auftritt steht vorn',d:'Bande am Platz und Logo auf dem Trikot liegen zusammen in einer Station „Euer Auftritt“, direkt nach dem Einstieg und vor den Preisen. Die Bande steht gleich da, das Trikot baut sich erst auf, wenn jemand darauf tippt.',go:'sponsoring'},
    {ic:'\u{1F91D}',r:'team',t:'Dürfen wir euch nennen',d:'Über der Unterschrift steht jetzt die Frage, ob wir öffentlich sagen dürfen, dass die Firma Partner des Vereins ist. Wie die Firma selbst wirbt, bleibt ihre Sache. Die Antwort lässt sich jederzeit mit einem Klick widerrufen.',go:'sponsoring'},
    {ic:'\u2B50',r:'team',t:'Infobox „Aktuelle Partner“',d:'Im Vereinsteil der Präsentation stehen die Betriebe, die ja gesagt haben, als saubere Liste. Nur Firmennamen, nichts weiter. Wer selbst schon dabei ist, sieht sich hervorgehoben.',go:'sponsoring'},
    {ic:'\u{1F4CB}',r:'team',t:'Bestandspartner nachtragen',d:'Unter Partner, Firmen gibt es bei jeder Firma das Feld „Dürfen wir sie öffentlich als Partner nennen“. Erst mit „Ja“ steht sie in der Infobox.',go:'sponsoring'},
   ]},
  {id:'0.95',v:'0.95',datum:'2026-11-10',titel:'Partner sehen, mit wem sie es zu tun haben',kurz:'In der Partner-Präsentation steht jetzt ein Mensch statt einer Mailadresse: Bild, Name, Funktion und die Knöpfe Anrufen, WhatsApp und Mail. Auch wer mit einem alten Link kommt, landet nicht mehr im Nichts.',
   punkte:[
    {ic:'\u{1F4DE}',r:'team',t:'Ansprechpartner mit Gesicht',d:'Am Ende der Präsentation und überall dort, wo es nicht weitergeht, steht der Ansprechpartner mit Bild und Funktion. Anrufen und Mail sind immer dabei, WhatsApp, sobald eine Handynummer hinterlegt ist.',go:'sponsoring'},
    {ic:'\u{1F441}',r:'team',t:'Der Link sieht im Chat nach etwas aus',d:'Schickst du den Partner-Link per WhatsApp, kommt jetzt eine Vorschau mit Bild und Titel mit. Beim Öffnen steht sofort der Verein da statt einer weißen Seite.',go:'sponsoring'},
    {ic:'\u26BD',r:'team',t:'Was der Betrag bewirkt',d:'Unter der Summe steht ein Vergleich, zum Beispiel „So viel wie 6 Trainingsbälle für die Jugend“. Die Sachen und ihre Preise stehen in den Vereinsangaben.',go:'sponsoring'},
    {ic:'\u{1F4F1}',r:'team',t:'WhatsApp-Nummer hinterlegen',d:'Unter Partner, Vereinsdaten gibt es zwei neue Felder: „WhatsApp-Nummer für Partner“ und „Kinder und Jugendliche im Verein“. Die Nummer schaltet den WhatsApp-Knopf frei, die Zahl steht in der Präsentation und war bisher fest einprogrammiert.',go:'sponsoring'},
    {ic:'\u26A1',r:'scout',t:'Kaderübersicht lädt sofort',d:'Die Stärken werden einmal berechnet und liegen danach fertig bereit. Auch wenn die Datenbank gerade langsam ist, steht die Liste sofort da.',go:'kueber'},
    {ic:'\u2705',r:'team',t:'Der empfohlene Weg ist zu sehen',d:'Beim Abschluss ist „Gleich unterschreiben“ als empfohlen markiert. Texte brechen sauberer um, und der Fokusrahmen ist in Vereinsfarbe statt Hellblau.',go:'sponsoring'},
   ]},
  {id:'0.94',v:'0.94',datum:'2026-11-10',titel:'Der Kader zeigt wieder alle Spieler',kurz:'Die Stärken brauchten zuletzt fast eine Minute und kamen deshalb nie an. Die Kaderübersicht und die Top-Elf blieben leer. Jetzt sind sie in unter zwei Sekunden da.',
   punkte:[
    {ic:'\u26A1',r:'scout',t:'Stärken laden wieder',d:'Die Abfrage holt nur noch den neuesten Stand je Spieler und packt nicht mehr für jeden Stand die ganze Vorgeschichte aus. Aus 55 Sekunden werden unter zwei.',go:'kueber'},
   ]},
  {id:'0.93',v:'0.93',datum:'2026-11-10',titel:'Spielerdaten werden nach unseren Spielen gerechnet',kurz:'Die Auswertung der Spielerdaten läuft jetzt dann, wenn sie gebraucht wird: sobald die Ergebnisse unserer Mannschaften da sind. An der App ändert sich sonst nichts.',
   punkte:[
    {ic:'⚽',r:'admin',t:'Nach dem Spiel statt rund um die Uhr',d:'Sobald sich an einem unserer Spiele etwas tut, rechnet der Server die Zuordnung und die Spielerwerte neu, danach noch ein paar Mal für Nachmeldungen. Sonst einmal am Tag. Das ist rund ein Vierzigstel der bisherigen Last auf der Datenbank.'},
   ]},
  {id:'0.92',v:'0.92',datum:'2026-11-10',titel:'Board zum Ziehen, Kader beginnt wieder bei der Mannschaft',kurz:'Im Planungs-Board ziehst du Karten jetzt wirklich: in eine andere Spalte, an eine andere Stelle oder auf eine Person. Am Handy stehen alle Phasen übereinander in einer Leiste. Der Kader öffnet wieder die Kaderübersicht mit euren Spielern.',
   punkte:[
    {ic:'🖐️',r:'team',t:'Karten ziehen, auch am Handy',d:'Rechts oben auf jeder Karte sind jetzt sichtbare Punkte zum Anfassen. Am Handy reicht auch: Karte kurz gedrückt halten, dann ziehen. Wischen scrollt weiter wie vorher.',go:'planung'},
    {ic:'↕️',r:'team',t:'Reihenfolge in der Spalte',d:'Du kannst eine Karte an eine andere Stelle in der Spalte ziehen. Eine Linie zeigt, wo sie landet, und die Reihenfolge bleibt so.',go:'planung'},
    {ic:'📱',r:'team',t:'Alle Phasen auf einen Blick',d:'Am Handy steht über dem Board eine Leiste mit allen Phasen und ihren Zahlen. Antippen springt zur Spalte, so geht keine Phase mehr unter.',go:'planung'},
    {ic:'👥',r:'scout',t:'Kader zeigt wieder die Mannschaft',d:'Der Kader öffnet die Kaderübersicht mit euren Spielern und ihren Stärken. Die Planung der nächsten Saison ist der zweite Reiter.',go:'kueber'},
    {ic:'🔁',r:'scout',t:'Stärken laden sich nach',d:'Wenn die Stärken einmal nicht ankommen, versucht die App es von selbst noch einmal und sagt dir sonst Bescheid, statt endlos zu laden.',go:'kueber'},
    {ic:'⚡',r:'admin',t:'Datenbank entlastet',d:'Der große Abgleich der Spielerdaten läuft jetzt höchstens stündlich statt alle 20 Minuten und sortiert im Arbeitsspeicher statt auf der Festplatte. Das war die Ursache der Warnung von Supabase.'},
   ]},
  {id:'0.91',v:'0.91',datum:'2026-11-06',titel:'Runden nach euren Listen, Abgleich sparsamer',kurz:'Die Termine der Runde der Leiter und der Sportlichen Abstimmung sehen genau die Personen aus euren Gruppen. Der Abgleich mit Lukas\' Helferplan läuft tagsüber alle zwei Stunden und fragt nur ab, was sich geändert hat.',
   punkte:[
    {ic:'👥',r:'team',t:'Runde der Leiter und Sportliche Abstimmung',d:'Wer in den Runden ist, sieht ihre Termine im Kalender, sobald sein Konto in der App angelegt ist. Andere sehen sie nicht, der Vorstand sieht immer alles.',go:'kalender'},
    {ic:'🔄',r:'team',t:'Abgleich schont Lukas\' App',d:'Tagsüber alle zwei Stunden, nachts nicht. Einzelne Spieltage fragt der Abgleich nur ab, wenn sich dort etwas geändert hat. „Jetzt abgleichen“ geht höchstens alle 10 Minuten.',go:'sptag'},
    {ic:'📋',r:'team',t:'Neue Aufgaben von Lukas',d:'Gibt es in Lukas\' App eine Aufgabe, die wir nicht haben, legt der Abgleich sie bei uns an, sobald sich dort jemand dafür einträgt. Unsere Aufgaben benennt er nie um.',go:'sptag'},
   ]},
  {id:'0.90',v:'0.90',datum:'2026-11-06',titel:'Helferplan immer abgeglichen',kurz:'Der Helferplan gleicht sich tagsüber regelmäßig mit Lukas\' Helferplan-App ab. Wer sich dort einträgt, steht auch bei uns, wer dort rausgeht, verschwindet auch hier.',
   punkte:[
    {ic:'🔄',r:'team',t:'Abgleich mit Lukas\' Helferplan',d:'Tagsüber alle zwei Stunden schaut der Server in Lukas\' App nach, nachts nicht. Einzelne Spieltage fragt er nur ab, wenn sich dort etwas geändert hat. Neue Einträge kommen dazu, dort gelöschte gehen hier auch weg. Was ihr in unserer App oder über den Helfer-Link eintragt, bleibt unberührt.',go:'sptag'},
    {ic:'🕒',r:'team',t:'Stand auf einen Blick',d:'Unter dem Helferplan steht, wann zuletzt abgeglichen wurde. Die Orga kann direkt daneben sofort abgleichen.',go:'sptag'},
    {ic:'🧹',r:'team',t:'Gelöscht bleibt gelöscht',d:'Tragt ihr hier jemanden aus, holt der Abgleich ihn nicht zurück, auch wenn er bei Lukas noch steht. Dort bitte auch austragen.',go:'sptag'},
   ]},
  {id:'0.89',v:'0.89',datum:'2026-11-06',titel:'Treffen als Serie, Einladung für WhatsApp, Banden schneller',kurz:'Runde der Leiter und Sportliche Abstimmung stehen bis 2030 im Kalender. Treffen legst du jetzt als Serie an und bekommst die Einladung für WhatsApp gleich fertig dazu, mit Kalenderdatei. Bei den Banden filtern die Zahlen oben direkt, die Firma im Partner-Bereich wird vorgeschlagen.',
   punkte:[
    {ic:'🗓️',r:'team',t:'Runde der Leiter und Sportliche Abstimmung',d:'Die Runde der Leiter trifft sich am 2. Dienstag im Januar, April, Juli und Oktober (17:30 bis 19:00 Uhr), die Sportliche Abstimmung jeden 3. Dienstag im Monat (17:45 bis 18:45 Uhr), beides im Clubhaus. Sehen können die Termine die Mitglieder der beiden Runden, ändern kann sie der Vorstand.',go:'kalender'},
    {ic:'🔁',r:'team',t:'Termine als Serie',d:'Beim neuen Termin unter „Wiederholen“: jede Woche, alle zwei Wochen, jeden Monat am gleichen Wochentag oder jedes Quartal. Dazu gibt es jetzt „Bis (Uhrzeit)“.',go:'kalender'},
    {ic:'💬',r:'team',t:'Einladung für WhatsApp',d:'Nach dem Speichern eines Treffens kommt die Einladung sofort: fertiger Text mit Datum, Uhrzeit und Ort, dazu die Kalenderdatei mit allen Terminen und Erinnerungen eine Woche und einen Tag vorher. Am Handy mit einem Tipp in die Gruppe teilen.',go:'kalender'},
    {ic:'🔎',r:'team',t:'Banden: Zahlen filtern',d:'Oben auf „erneuern“, „prüfen“, „gut“ oder „Partner fragen“ tippen zeigt genau diese Banden. Nochmal tippen zeigt wieder alle.',go:'sponsoring'},
    {ic:'🔗',r:'team',t:'Firma wird zugeordnet',d:'Beim Öffnen einer Bande ist die passende Firma aus dem Partner-Bereich schon ausgewählt, zum Beispiel Ernst Krastel GmbH bei Bad-Heizung Krastel. Passen mehrere, stehen sie als Vorschlag da. Mit „Firmen zuordnen“ geht es für alle auf einmal. Passt ein Vorschlag nicht, „keine“ wählen: dann kommt er nicht wieder.',go:'sponsoring'},
   ]},
  {id:'0.88',v:'0.88',datum:'2026-11-06',titel:'Helferplan, Planungs-Board und Einladung per Mail',kurz:'Der Helferplan für die Spieltage läuft jetzt in unserer App, Helfer tragen sich ohne Konto über ihren Link ein. Die Planung hat ein Board zum Ziehen zwischen den Spalten und auf Personen. Einladungen kommen jetzt auch per E-Mail an.',
   punkte:[
    {ic:'🙋',t:'Helferplan je Spieltag',d:'Unter Mein Spieltag und im Helfer-Bereich: Gemeinsame Aufgaben, Aufgaben der Ersten und Zweiten und Freiwillige Unterstützung. Oben siehst du, was noch unbesetzt ist, unter „Meine Aufgaben“ deine Einträge.',go:'sptag'},
    {ic:'👆',t:'Eintragen mit einem Tipp',d:'„Eintragen“ antippen, fertig. Die Orga trägt auch andere ein: aus dem Helferpool oder einfach mit Namen.',go:'sptag'},
    {ic:'🔗',r:'team',t:'Helfer ohne Konto',d:'Jeder Helfer aus dem Helferpool hat seinen persönlichen Link. Dort sagt er „Ja, ich helfe“ oder „Diesmal nicht“ und sucht sich eine Aufgabe aus, ohne Passwort.',go:'helfer'},
    {ic:'💬',r:'team',t:'Anfrage vor dem Spieltag',d:'Vor jedem Heimspieltag bekommen die Spieltagshelfer eine WhatsApp mit ihrem Link. Die Orga probiert es im Helferplan unter „Anfrage vor dem Spieltag“ mit einer Testnummer aus, echte Helfer schaltet der Admin frei.',go:'helfer'},
    {ic:'🗂️',r:'team',t:'Planung als Board',d:'Unter Planung, Ansicht „Board“: In Vorbereitung, In Bearbeitung, Offene Punkte, Erledigt. Karten am Griff in die nächste Spalte ziehen oder auf eine Person, dann ist sie zuständig. Auch für Projekte. Am Handy Karte antippen und „Verschieben“.',go:'planung'},
    {ic:'✉️',r:'admin',t:'Einladung per E-Mail',d:'Wer eingeladen wird, bekommt eine schöne Einladung in Vereinsfarben mit unserem Logo direkt per E-Mail (Absender svbsc@kaderwerk.pro). In der Box steht, ob die Mail raus ist. Teilen per WhatsApp geht weiter.',go:'admin'},
    {ic:'📞',r:'team',t:'Nummern verknüpft',d:'Fehlt bei einer Zuständigkeit die Nummer, holt die App sie aus dem Helferpool oder den Spielerkontakten. Helfer werden über ihren Link nach fehlender Handynummer und E-Mail gefragt.',go:'helfer'},
    {ic:'📥',r:'team',t:'Einträge übernommen',d:'Mit „Aus dem bisherigen Helferplan übernehmen“ holt die Orga die Einträge aus der alten Helferplan-App einmal herüber. Danach brauchen wir die alte App nicht mehr.',go:'helfer'}
   ]},
  {id:'0.87',v:'0.87',datum:'2026-11-06',titel:'Trainingsabfrage auch für die 2. Mannschaft',kurz:'Die Zweite fragt ihre Trainings jetzt genauso über die App ab wie die Erste: eigene Automatik mit Trainingstagen und Empfängern, Pop-up fürs Trainerteam und eine Karte, die zeigt, was noch fehlt. Fehlende Spieler nimmst du mit einem Tipp dazu. Die Beteiligung steht auf einer Seite.',
   punkte:[
    {ic:'⚽',r:'team',t:'Automatik je Mannschaft',d:'Oben die Mannschaft wählen, unter Abstimmungen Trainingstage, Uhrzeit und die Handynummern des Trainerteams eintragen. Die App legt jedes Training selbst an und schickt den Link. WhatsApp-Zugang und Vorlagen gelten für beide Mannschaften.',go:'training'},
    {ic:'✅',r:'team',t:'Trainingsabfrage einrichten',d:'Eine Karte oben in den Abstimmungen zeigt Schritt für Schritt, was schon läuft und was noch fehlt: Automatik, Empfänger, Link in der Gruppe, Spieler, Trainerteam.',go:'training'},
    {ic:'➕',r:'team',t:'Spieler dazunehmen',d:'In jeder Abstimmung unter Details den Namen eintippen und antippen, auch aus der anderen Mannschaft oder der Jugend. Beim Anlegen wählst du mit einem Tipp 1. Mannschaft, 2. Mannschaft oder beide.',go:'training'},
    {ic:'🔔',r:'team',t:'Pop-up fürs eigene Trainerteam',d:'Wer die Zweite betreut, wird vor deren Training ans Einladen erinnert und landet in der Mannschaft gleich bei der Zweiten.',go:'training'},
    {ic:'📊',r:'team',t:'Beteiligung auf einer Seite',d:'Unter Mannschaft und Beteiligung: „Aus der App“ zählt die erfassten Einheiten, „Aus den Listen“ zeigt die Beteiligungslisten je Saison. Rankings & Verein hat keinen eigenen Knopf mehr dafür.',go:'training'},
    {ic:'🔗',r:'team',t:'Eigener Gruppenlink je Mannschaft',d:'Die Zweite bekommt ihren eigenen Kabinen-Link. Wer ihn öffnet, sieht nur die Abstimmungen und Strafen der Zweiten, dazu Termine, auf denen er selbst steht. Den Link der Zweiten findest du in der Kabine, wenn oben die 2. Mannschaft gewählt ist.',go:'training'}
   ]},
  {id:'0.86',v:'0.86',datum:'2026-11-05',titel:'Kasse je Mannschaft und Veranstaltungen mit Zusagen',kurz:'Erste und Zweite haben jetzt je einen eigenen Strafenkatalog, sortiert nach Training, Spiel und Allgemein, mit Aufschlag pro Minute und Strafen in Kästen. Veranstaltungen laufen wie Training mit Zu- und Absagen, auch für beide Mannschaften. Dazu die Beteiligungsliste als PDF.',
   punkte:[
    {ic:'💶',r:'team',t:'Strafenkatalog je Mannschaft',d:'Oben in der Kasse wählst du die Mannschaft. Beim Bearbeiten stellst du je Strafe Training, Spiel oder Allgemein ein, Euro oder Kasten und einen Aufschlag pro Minute, zum Beispiel beim Zuspätkommen. Kassenstand und Konten bleiben gemeinsam.',go:'kasse'},
    {ic:'🎂',r:'team',t:'Geburtstag',d:'Hatte ein Spieler Geburtstag, schlägt die Kasse einen Kasten vor. Mit „Buchen“ ist er drin.',go:'kasse'},
    {ic:'📅',r:'team',t:'Veranstaltungen wie Training',d:'Weihnachtsfeier, Abschlussfahrt und Co. legst du direkt in der Übersicht an, für eine oder beide Mannschaften. Die Spieler sagen zu oder ab, unten steht die Statistik.',go:'training'},
    {ic:'📊',r:'team',t:'Beteiligung als PDF',d:'In der Übersicht: Training, Spiele und Veranstaltungen je Spieler, nur der Kader der Mannschaft.',go:'training'},
    {ic:'🩹',r:'team',t:'Verfügbarkeit und Statistik',d:'Zeitleiste, Verletzungen und Abwesenheiten bleiben als Umschalter stehen, „+ Verletzung“ und „+ Abwesenheit“ stehen gleich darunter. Statistiken zeigen nur Spieler aus dem Kader.',go:'training'}
   ]},
  {id:'0.85',v:'0.85',datum:'2026-11-05',titel:'Bereichsleitung, Stellvertretung und Helfer als Rolle',kurz:'In der Rollenauswahl stehen jetzt auch Bereichsleitung, Stellvertretung und Helfer, beim Einladen und bei jeder Person in der Team-Liste. Du wählst dazu nur noch die Bereiche.',
   punkte:[
    {ic:'◎',r:'admin',t:'Funktion als Rolle',d:'Wähl beim Einladen „Bereichsleitung“, „Stellvertretung“ oder „Helfer“ und darunter die Bereiche, zum Beispiel Partner. Die Person bekommt alles aus diesen Bereichen und dazu, was jeder Gast sieht.',go:'admin'},
    {ic:'👥',r:'admin',t:'In der Team-Liste',d:'Wer nur Funktionen hat, steht dort als Bereichsleitung, Stellvertretung oder Helfer. Ein Wechsel öffnet gleich die Auswahl der Bereiche.',go:'admin'}
   ]},
  {id:'0.84',v:'0.84',datum:'2026-11-05',titel:'Einladen mit Funktionen',kurz:'Beim Einladen wählst du neben der Rolle gleich die Funktionen, zum Beispiel Partner als Leitung. In der Team-Liste siehst du bei jeder Person ihre Funktionen und änderst sie mit einem Tipp auf „Bereiche & Funktionen“.',
   punkte:[
    {ic:'✉',r:'admin',t:'Einladen mit Funktionen',d:'Unter der Rolle fügst du beliebig viele Funktionen hinzu: Bereich wählen, dann Leitung, Stellvertretung oder Helfer. Die Person hat sie ab der ersten Anmeldung.',go:'admin'},
    {ic:'◎',r:'admin',t:'Funktionen bei allen Nutzern ändern',d:'In der Team-Liste steht bei jeder Person, welche Funktionen sie hat. Der Knopf „Bereiche & Funktionen“ öffnet die Auswahl, dort gibst du Bereiche dazu oder nimmst sie weg.',go:'admin'}
   ]},
  {id:'0.83',v:'0.83',datum:'2026-11-05',titel:'Funktionen als Bausteine',kurz:'Jede Person bekommt je Bereich eine Funktion: Leitung, Stellvertretung oder Helfer, in so vielen Bereichen wie nötig. Rollen passt du mit ein paar Schaltern an, Ausschalten mit einem zweiten Tipp. Dazu Wünsche aus dem Trainerteam für die Mannschaft und die Daten aus Helferplan und Kaderplanung direkt in der App.',
   punkte:[
    {ic:'◎',r:'admin',t:'Funktionen je Bereich',d:'Bei „Bereiche“ einer Person wählst du je Bereich Leitung, Stellvertretung, Helfer oder Kein Zugriff. Leitung heißt alles, Helfer das Grundlegende. Einzelne Teile schaltest du darunter an oder aus. Admins haben immer alles, auch neue Bereiche nach einem Update.',go:'admin'},
    {ic:'+',r:'admin',t:'Rollen anpassen',d:'Auf jeder Rollenkarte unter Nutzer & Rollen: „Bereiche der Rolle anpassen“. Ein Schalter je Bereich und Teil, gilt sofort für alle mit dieser Rolle.',go:'admin'},
    {ic:'●',r:'team',t:'Spielerauswahl, Training löschen, Veranstaltungen',d:'Spieler wählst du jetzt aus der aktuellen Liste, sortiert nach Nachname. Die Spielerliste sortierst du nach Nachname, ein Training lässt sich löschen, und neben Speichern liegt kein „Erzählen“ mehr, auf das man aus Versehen tippt. Neu für Erste und Zweite: der Reiter Veranstaltungen für Weihnachtsfeier oder Abschlussfahrt.',go:'training'},
    {ic:'◐',r:'team',t:'Zweite ohne Spieler der Ersten',d:'Verletzungen, Abwesenheiten und die Prüffälle aus FuPa zeigen nur noch die gewählte Mannschaft. In der Spalte „Verfügbar“ stehen nur noch die ersten Worte der Verletzung, den ganzen Text findest du unter Verfügbarkeit.',go:'training'},
    {ic:'↗',r:'team',t:'Helferplan und Kaderplanung',d:'Die offenen Aufgaben der nächsten Spieltage aus der Helfer-App stehen im Helfer-Bereich und bei „Mein Spieltag“, die Kandidaten aus der Kaderplanung-App im Kader. Nur zum Ansehen, geändert wird in den Apps selbst.',go:'helfer'}
   ]},
  {id:'0.82',v:'0.82',datum:'2026-11-05',titel:'Rollen, die zu den Bereichen passen',kurz:'Unter Nutzer & Rollen siehst du jetzt genau, was jede Rolle darf, Bereich für Bereich wie in der Navigation. Mit „Aufgaben im Verein“ gibst du jemandem mit einem Tipp alles fürs Partner-Team, Social Media, Veranstaltungen oder die Jugendleitung. Und die Trikots im Trikot-Creator sind schärfer, mit glattem Rand.',
   punkte:[
    {ic:'◎',r:'admin',t:'Was darf wer, immer aktuell',d:'Die Rollenkarten kommen direkt aus den Vorgaben. Änderst du unten eine Vorgabe, stimmt die Übersicht sofort. Die Bereiche heißen und stehen wie in der Navigation, von Übersicht bis Verwaltung.',go:'admin'},
    {ic:'+',r:'admin',t:'Aufgaben im Verein',d:'Bei „Bereiche“ einer Person gibt es Partner-Team, Social Media & Presse, Veranstaltungen & Helfer, Jugendleitung und Seniorenleitung. Ein Tipp schaltet frei, was dazugehört, und nur das. Noch ein Tipp setzt es wieder auf die Rolle zurück.',go:'admin'},
    {ic:'◐',r:'team',t:'Trikots in HD',d:'Heim und Auswärts sind schärfer, der Rand ist glatt statt gezackt, die Ärmelenden sind sauber. Beim Ziehen neigt sich das Trikot leicht, ziehst du weiter, dreht es sich ganz um.',go:'sponsoring'},
    {ic:'●',r:'admin',t:'Trikots & Banden als eigener Bereich',d:'Wer den Trikot- und Bandencreator nutzen darf, stellst du jetzt wie jeden anderen Bereich ein. Die Vorgabe übernimmt die vom Partner-Bereich.',go:'admin'}
   ]},
  {id:'0.81',v:'0.81',datum:'2026-11-05',titel:'Trikots wie in echt',kurz:'Heim- und Auswärtstrikot im Trikot-Creator sehen jetzt in 3D aus wie unser echtes Squadra 25, mit den Schulterstreifen, Bündchen und dem Gemeindewappen oben in der Mitte. Partnerplätze gibt es nur noch dort, wo wir sie auch vergeben: Brust, Ärmel links und Ärmel rechts.',
   punkte:[
    {ic:'◐',r:'team',t:'3D aus dem Produktfoto',d:'Vorn und hinten ist das echte Trikot, gedreht wird es wie bisher mit dem Finger. Hose und Stutzen sind raus, dort gibt es keine Werbung. Die Bühne zeigt nur noch Trikot oder Jacke.',go:'sponsoring'},
    {ic:'+',r:'team',t:'Nur noch Brust und Ärmel',d:'Rücken, Nacken und Hose sind keine Partnerplätze mehr. Beim Anzug sind es Jacke Brust und die beiden Ärmel, dort sind Logos schwarz, weil der Oberarm weiß ist.',go:'sponsoring'},
    {ic:'●',r:'team',t:'Saubere weiße Logos',d:'Jedes Logo, das die App mitbringt, hat eine von Hand geprüfte weiße Fassung. Hochgeladene Logos rechnet sie jetzt sauberer um: weiße Flächen im Logo bleiben ausgespart, damit nichts zum Klecks wird. Für Gespräche liegen auch die Logos der großen Firmen aus Mörlenbach bereit, zum Beispiel Ehmann, Heinrich Schmid, Elis, Uhl, Wolff, Mader und Müller Dörsam. Immolino steht jetzt mit seinem Logo auf den Trikots der F-Jugend statt als Schriftzug.',go:'sponsoring'}
   ]},
  {id:'0.80',v:'0.80',datum:'2026-11-04',titel:'Trikot- und Bandencreator',kurz:'Im Partner-Bereich gibt es die Reiter Trikots und Bandencreator: Du siehst unsere Trikots in 3D mit allen Partnerlogos und ziehst ein neues Logo auf einen freien Platz. Und aus Logo, Name und Kontakt eines Partners wird mit einem Tipp eine druckfertige Bande, live am Spielfeldrand.',
   punkte:[
    {ic:'◐',r:'team',t:'Trikots in 3D',d:'Jede Mannschaft mit Heim, Auswärts und Anzug, dazu ein Musterteam, auf dem alles frei ist. Mit dem Finger drehst du von vorn bis hinten, die Knöpfe Vorn, Seite und Hinten springen direkt dorthin. Die Foto-Ansicht zeigt die echten Trikots der Ersten.',go:'sponsoring'},
    {ic:'+',r:'team',t:'Logo drauf, live',d:'Lade ein Logo hoch oder nimm eins von unseren Partnern. Am Rechner ziehst du es auf einen freien Platz, am Handy tippst du erst das Logo und dann den Platz an. Größe und Farbe (Weiß, Original, Schwarz) stellst du direkt am Platz ein.',go:'sponsoring'},
    {ic:'●',r:'team',t:'Logo-Analyse',d:'Die App stellt das Logo frei, zeigt seine Originalfarben als Farbpunkte und wie es in Weiß auf Vereinsblau wirkt. Auf unseren Trikots sind alle Logos weiß, nur Basakci auf dem orangen Auswärtstrikot bleibt grün.'},
    {ic:'🔒',r:'team',t:'Reservieren und vergeben',d:'Ein freier Platz lässt sich für ein Angebot reservieren oder fest vergeben. Belegte Plätze sind gesperrt, freigeben kann sie nur ein Admin, und auch das erst nach einer Rückfrage.'},
    {ic:'↗',r:'team',t:'Bild zum Teilen',d:'„So sieht dein Logo bei uns aus“ als Bild für WhatsApp oder Mail, mit einem Tipp gespeichert oder geteilt.'},
    {ic:'★',r:'team',t:'Auch in der Präsentation',d:'In der persönlichen Partner-Präsentation sitzt das Logo der Firma gleich auf einem freien Ärmel. Mannschaft und Platz sind frei wählbar, die passende Trikotpatenschaft kommt mit einem Tipp in die Auswahl.'},
    {ic:'▭',r:'partner',t:'Bandencreator',d:'Firma wählen, fertig: Logo, Name, Slogan, Website und Telefon ergeben eine Bande nach festen Regeln, damit rund um den Platz alles zusammenpasst. Drei Vorschläge zum Durchwischen, alles im Formular nachjustierbar.',go:'sponsoring'},
    {ic:'◐',r:'partner',t:'Partner-CI oder Original',d:'Im Partner-CI ist die Bande weiß, das Logo einfarbig in Marine oder Schwarz, rechts steht unser Wappen mit „Mörlenbach steht zusammen!“. Im Original bleibt das Logo in seinen Farben, die Firmenfarbe trägt die Kontaktleiste.'},
    {ic:'▤',r:'partner',t:'Live am Platz und druckfertig',d:'Die Bande steht in der Vorschau am Spielfeldrand zwischen den Nachbarbanden. Die Druckansicht zeigt Maße und Sicherheitsabstand. Das PDF hat Originalgröße mit 2 cm Beschnitt und Schnittmarken, dazu PNG und SVG.'},
    {ic:'🔒',r:'partner',t:'Bandenplan',d:'Alle Plätze rund um den Platz: frei, reserviert oder belegt. Belegte sind gesperrt, freigeben kann sie nur ein Admin. Gespeicherte Banden gibt ein Admin zum Druck frei und markiert sie als gedruckt.'},
    {ic:'↗',r:'partner',t:'So sieht deine Bande aus',d:'In der Partner-Präsentation steht das Logo der Firma im Partner-CI live am Spielfeldrand, mit den freien Plätzen und der Werbebande zum Dazunehmen.'}]},
  {id:'0.79',v:'0.79',datum:'2026-11-04',titel:'Aufgeräumte Navigation',kurz:'Jedes Ziel heißt jetzt überall gleich, das Mehr-Menü ist in Gruppen sortiert und zeigt nur, was du öffnen darfst. Leere Seiten sagen dir, was als Nächstes geht.',
   punkte:[
    {ic:'▤',r:'team',t:'Planung, Termine, Aufgaben',d:'Aus der „Aufgabensteuerung“ wird die Planung mit den Reitern Termine, Aufgaben und Vorstand & Ziele. Termine heißt überall Termine, Aufgaben überall Aufgaben, auf Heute, unten in der Leiste und im Menü.',go:'planung'},
    {ic:'☰',t:'Mehr-Menü in Gruppen',d:'Übersicht, Spieltag, Mannschaften, Kader & Scouting, Verein, Werkzeuge. Was schon unten in der Leiste steht, kommt im Menü nicht noch einmal vor. Am Rechner ist die Seitenleiste genauso sortiert und kompakter.'},
    {ic:'⇄',r:'scout',t:'Eine Leiste im Scouting',d:'Am Handy bleiben die ersten Reiter immer an ihrem Platz, der Rest steckt unter „Mehr“. Kein Suchen mehr, wo die Leiste gerade hingerutscht ist.',go:'scout'},
    {ic:'✓',t:'Leere Seiten mit nächstem Schritt',d:'Wo noch nichts steht, etwa bei SOMA, beim Gegner ohne Spielplan oder bei den Helfern, steht jetzt ein Satz dazu und ein Knopf, der weiterhilft.'},
    {ic:'ⓘ',t:'Mein Konto aufgeräumt',d:'Hilfe und Datenschutzhinweise sind direkt verlinkt. Technische Angaben wie der Datenstand stehen zugeklappt unter „Über die App“.'}]},
  {id:'0.78',v:'0.78',datum:'2026-11-04',titel:'To-dos mit Fokus, Prioritäten und Erinnerungen',kurz:'Die To-dos stehen jetzt ganz oben auf Heute: was bis wann zu tun ist, Überfälliges zuerst. Aufgaben erfasst du mit einem Satz wie „Versicherung bis Freitag !!“, mit Priorität, Frist, Wiedervorlage und Wiederholung. Jeden Morgen kommt eine kurze Übersicht.',
   punkte:[
    {ic:'▲',r:'team',t:'Ganz oben auf Heute',d:'Der Vorstand sieht die nächsten Fristen im Team, alle anderen ihre eigenen. Über „Mehr anzeigen“ geht es zur ganzen Liste.',go:'planung'},
    {ic:'+',r:'team',t:'Mit einem Satz erfassen',d:'„Platzbegehung morgen 18 Uhr @Name !“ setzt Datum, Uhrzeit, Zuständige und Priorität. Bevor du speicherst, siehst du, was erkannt wurde.',go:'planung'},
    {ic:'!',r:'team',t:'Prioritäten und Fokus',d:'Dringend, Wichtig, Normal, Irgendwann. Die Ansicht Fokus zeigt zuerst Überfälliges, dann Heute und die Woche. Ungeklärtes ohne Frist oder Zuständige fällt auf.',go:'planung'},
    {ic:'↻',r:'team',t:'Nichts vergessen',d:'Wiedervorlage, Nachfassen bei „Wartet auf“, Wiederholung jede Woche bis jedes Jahr. Morgens eine Übersicht aufs Handy, montags der Wochenrückblick, und nach drei Tagen Verzug erfährt es der Vorstand.',go:'planung'},
    {ic:'▤',r:'team',t:'Jeder Bereich hat seinen Drive',d:'„Drive Veranstaltungen“, „Drive Partner“ und so weiter: ein Tipp öffnet den Ordner, mit deinem eigenen Google-Konto. Du siehst nur die Ordner deines Bereichs und deiner Mannschaft. Kurzlinks wie …/#drive=veranstaltungen kannst du in jede Nachricht kopieren. Unter Mein Konto trägst du dein Google-Konto ein.',go:'planung'}]},
  {id:'0.77',v:'0.77',datum:'2026-11-04',titel:'Partner-Präsentation neu, Anmelden mit Face ID',kurz:'Die Präsentation für neue Partner ist neu aufgebaut: kein Anschreiben vorab, freie Wege durch Verein, Wirkung, Pakete und Bausteine, die vier Pakete im Mittelpunkt. Und du kannst dich jetzt mit Passkey anmelden, also mit Face ID, Touch ID oder Windows Hello.',
   punkte:[
    {ic:'◆',r:'partner',t:'Pakete im Mittelpunkt',d:'SVM Supporter, Club, Premium und 1896 nebeneinander, mit einem Tipp gewählt. Bausteine wie Bande oder Matchball kommen dazu, die Summe läuft mit.',go:'sponsoring'},
    {ic:'⇄',r:'partner',t:'Freie Wege',d:'Oben die Stationen Verein, Wirkung, Pakete, Bausteine und Abschluss. Der Betrieb springt, wohin er will. Die Fragen sind freiwillig und helfen nur bei der Empfehlung.',go:'sponsoring'},
    {ic:'✓',t:'Anmelden mit Passkey',d:'Unter Mein Konto einen Passkey einrichten, danach auf der Anmeldeseite „Mit Passkey anmelden“. Kein Passwort mehr tippen.'}]},
  {id:'0.76',v:'0.76',datum:'2026-11-04',titel:'Termine für jede Abteilung, mithelfen und werben',kurz:'Jede Abteilung plant ihre eigenen Termine, und nur wer dazugehört oder eingeladen ist, sieht sie. Bei Veranstaltungen trägst du dich mit einem Tipp als Helfer ein, teilst den Termin per WhatsApp und machst ein Bild für Story oder Status. Ideen und Fehler meldest du jetzt direkt in der App.',
   punkte:[
    {ic:'▦',t:'Abteilungen im Kalender',d:'Unter Termine bei „Wer sieht das?“: Partner-Team, Finanzen, Jugendleitung, Veranstaltungsteam und mehr. Wer dazugehört, plant dort selbst. Andere sehen den Termin nur, wenn du sie einzeln einlädst.',go:'kalender'},
    {ic:'⇄',t:'In deinen Kalender',d:'Unter Termine, „In meinen Kalender“: mit einem Tipp in Google Kalender, Outlook oder am iPhone abonnieren. Neue Termine kommen von selbst dazu, auch die deiner Abteilung.',go:'kalender'},
    {ic:'✓',t:'Mithelfen mit einem Tipp',d:'Steht bei einem Termin „Helfer gesucht“, siehst du die freien Schichten und trägst dich direkt ein.',go:'kalender'},
    {ic:'↗',t:'Teilen und werben',d:'Jeder Termin geht per WhatsApp raus, öffentliche mit eigener Seite und Kalenderdatei. Mit „Werbebild“ machst du ein Bild für Instagram, Story oder WhatsApp-Status, mit eigenem Foto.',go:'kalender'},
    {ic:'✉',t:'Idee oder Fehler melden',d:'Unter Mehr, gleich unter „Was ist neu“. Unter „Meine“ siehst du später, was daraus geworden ist, und die Antwort des Vorstands.'}]},
  {id:'0.75',v:'0.75',datum:'2026-11-04',titel:'Veranstaltungen planen, alles exportieren',kurz:'Neuer Bereich Veranstaltungen: Bereiche, Schichten und Teile wie der Aufbau am Vortag, Helfer per persönlichem Link anfragen und Leute aus anderen Bereichen ins Team holen. Dazu der Bereich Export: jede Liste als PDF, Excel, CSV, Kalender oder Kontakte.',
   punkte:[
    {ic:'▦',t:'Veranstaltungen',d:'Unter Mehr, Veranstaltungen: Konzert, Adventsmarkt oder Weihnachtsfeier anlegen, Bereiche wie Theke oder Kasse mit eigener Leitung, Schichten mit Aufgabe und Treffpunkt. Wer nur einen Bereich leitet, plant auch nur dort.',go:'veranstaltungen'},
    {ic:'⊕',t:'Teile einer Veranstaltung',d:'Aufbau am Vortag oder ein Stand auf dem Adventsmarkt bekommen eigene Termine und Schichten und hängen an der großen Veranstaltung.',go:'veranstaltungen'},
    {ic:'✉',t:'Helfer anfragen',d:'Unter Helfer siehst du, wer passt. Per WhatsApp oder Mail anfragen, jeder bekommt seinen eigenen Link und trägt sich selbst ein. Erst nach der Freigabe sehen Helfer die Veranstaltung.',go:'veranstaltungen'},
    {ic:'⇄',t:'Team aus anderen Bereichen',d:'Unter Team holst du Leute aus Partner-Team, Jugend oder Vorstand dazu, als Leitung, Team oder für einen Bereich. Jede Rolle sieht nur, was sie braucht.',go:'veranstaltungen'},
    {ic:'↓',t:'Export für alles',d:'Unter Mehr, Export: Schichtpläne, Helferpool, Termine, Partner und Rechnungen, Kasse, Kader und mehr. Die Dateien entstehen auf deinem Gerät und du bekommst nur, was du in der App auch sehen darfst.',go:'export'}]},
  {id:'0.74',v:'0.74',datum:'2026-11-04',titel:'Ruhiger, klarer, eine Oberfläche für alle',kurz:'Die App ist ruhiger geworden: flache Flächen, eine Farbe, keine bewegten Hintergründe. Hell oder dunkel folgt jetzt deinem Handy. Die Suche findet auch Bereiche, die Spielerliste ist am Handy eine Liste statt einer breiten Tabelle.',
   punkte:[
    {ic:'◐',t:'Ruhiger und wie am Gerät',d:'Keine Verläufe, kein Leuchten, keine Wellen im Hintergrund. Hell oder dunkel richtet sich nach deinem Handy, ändern kannst du es unter Mein Konto, Erscheinungsbild.'},
    {ic:'⌕',t:'Suche über alles',d:'Oben auf die Lupe: Spieler und Bereiche wie Kasse, Termine, Partner oder Helfer. Am Handy als eigener Bildschirm.'},
    {ic:'≡',r:'team',t:'Spielerliste am Handy',d:'Unter Mannschaft, Spieler: eine Karte je Spieler mit Position, Alter und den wichtigsten Werten. Am Rechner bleibt die Tabelle.',go:'training'},
    {ic:'◎',r:'team',t:'Co-Trainer oben',d:'Der Co-Trainer sitzt jetzt oben neben der Suche und verdeckt unten nichts mehr.'},
    {ic:'i',t:'Erklärungen auf Wunsch',d:'„Worum geht es hier?“ ist zugeklappt und öffnet sich mit einem Tipp. Neue Leute sehen zuerst ihre ersten Schritte.'},
    {ic:'⚑',t:'Offline-Hinweis',d:'Ohne Verbindung steht oben, dass du den gespeicherten Stand siehst und seit wann.'}]},
  {id:'0.73',v:'0.73',datum:'2026-11-03',titel:'Helfer auf einen Blick, neue Plakat-Hintergründe',kurz:'Neuer Bereich Helfer: wer mitmachen will, nach Bereichen, direkt per WhatsApp oder Mail einladen. Im Spieltagsstudio gibt es eine Galerie mit Nahaufnahmen und eine bessere Aufteilung für Quer und Story. Partner-Texte sind per Du.',
   punkte:[
    {ic:'🙌',r:'team',t:'Helfer',d:'In der Seitenleiste oder unter svbsc.kaderwerk.pro/helfer: Zahlen, Bereiche, was als Nächstes ansteht und alle mit Suche. Im Bereich die WhatsApp-Gruppe hinterlegen und der Reihe nach einladen, alle per Mail im BCC, Excel und Kontakte zum Mitnehmen.',go:'helfer'},
    {ic:'👋',r:'partner',t:'Per Du',d:'Präsentation, Angebot, Vertrag, Mails und die vorgeschriebenen Nachrichten sprechen die Firma mit „ihr“ und die Person mit „du“ an. Die Begrüßung ist „Hallo Vorname,“. Frau oder Herr musst du nicht mehr auswählen.'},
    {ic:'📄',r:'partner',t:'Acht Präsentationen aus dem Scouting',d:'PAPUREX, Loroch, EDEKA Graulich, Krastel, Rell, Keil, Volksbank Weschnitztal und Sparkasse Starkenburg haben eine Präsentation mit Texten aus unserer Recherche. Unter Partner › Präsentationen ansehen, anpassen und erst dann verschicken.',go:'sponsoring'},
    {ic:'✏️',r:'partner',t:'Ruhiger',d:'Überschriften sagen, was kommt. Keine Slogans, keine Deko, keine Ausrufezeichen.'},
    {ic:'🖼️',r:'team',t:'Spieltagsstudio: 17 Hintergründe',d:'Unter Aussehen gibt es jetzt eine Galerie mit Nahaufnahmen: Linie, Ball, Netz, Eckfahne, Regen, Frost und mehr. Auf „Auto“ nimmt jedes Spiel ein anderes Bild, passend zur Lichtstimmung.',go:'plakat'},
    {ic:'📐',r:'team',t:'Quer und Story neu aufgeteilt',d:'Quer: HEIMSPIEL groß links, Wappen rechts. Story: Schrift größer, oben und unten bleibt Platz für die Leisten von Instagram.',go:'plakat'}]},
  {id:'0.72',v:'0.72',datum:'2026-11-03',titel:'Datei ins Studio, Partnerverträge sicher',kurz:'Im Studio lädst du eine PowerPoint, ein PDF oder ein Word-Dokument hoch und bekommst eine Fassung in unserem Vereinsdesign. Im Partnerbereich gilt ein Vertrag jetzt erst, wenn der Verein gegenzeichnet.',
   punkte:[
    {ic:'📥',r:'team',t:'Datei importieren im Studio',d:'Unter Studio „Datei importieren“ antippen oder die Datei hineinziehen: PowerPoint, PDF, Word, HTML, Text und Bilder. Reihenfolge, Überschriften, Punkte, Tabellen, Bilder und Notizen bleiben, das Aussehen kommt aus unserem CI. Danach kannst du im Studio weiterarbeiten.',go:'studio'},
    {ic:'✍️',r:'partner',t:'Vertrag mit Gegenzeichnung',d:'Die Unterschrift der Firma ist ihr Angebot, vier Wochen lang. Geschlossen ist der Vertrag, wenn eine vertretungsberechtigte Person des Vereins gegenzeichnet. Erst dann gibt es die Rechnung.',go:'sponsoring'},
    {ic:'⚖️',r:'partner',t:'Rechtlich aufgeräumt',d:'Neue Klauseln zu Haftung, Spielpausen und Gerichtsstand, Spendenzusagen freiwillig und getrennt vom Vertrag, Impressum und Datenschutz vollständig, Hinweis vor Werbe-Mails ohne Zustimmung.',go:'sponsoring'},
    {ic:'🧭',r:'partner',t:'Partnerbereich in Vereinsfarben',d:'Ein Kopf für alle Reiter, offene Fragen gebündelt, Gegenzeichnen als eine Karte, Bindefrist mit Erinnerung, Rechnungen erst mit Steuernummer.',go:'sponsoring'}]},
  {id:'0.71',v:'0.71',datum:'2026-11-02',titel:'Partner-Präsentation mit Herz',kurz:'Die persönliche Partner-Seite beginnt jetzt mit einem Brief vom Verein, zeigt die Partnerstufen in unseren Farben und führt ruhiger bis zur Unterschrift.',
   punkte:[
    {ic:'✉️',r:'team',t:'Brief statt Prospekt',d:'Oben ein persönlicher Brief mit Unterschrift, dann die 260 Kinder und was ein Beitrag bei der Jugend bewegt. Die vier Partnerstufen stehen als Treppe in den Vereinsfarben.'},
    {ic:'🧾',r:'team',t:'Klarer Abschluss',d:'Erste Rechnung mit brutto, Bedingungen zum Aufklappen, „Ich darf unterschreiben“, Bankdaten zum Kopieren. Doppelte Verträge durch zweimal Tippen sind ausgeschlossen.'},
    {ic:'🤝',r:'team',t:'Danke mit nächsten Schritten',d:'Nach der Unterschrift steht in Sätzen, was jetzt passiert: Gegenzeichnung, die Mannschaft erfährt es, Logo, Partnerabend. Spenden bekommen eine eigene Zusage.'},
    {ic:'🔖',r:'team',t:'Vormerken ohne Paket',d:'Ist ein Platz vergeben, kann sich ein Unternehmen mit Name und Mail vormerken lassen. Die Vormerkung landet in der Partner-Zentrale.'}
   ]},
  {id:'0.70',v:'0.70',datum:'2026-11-02',titel:'Torschützen in der Ergebnis-Grafik',kurz:'Die Ergebnis-Grafik zeigt die Torschützen jetzt richtig, auch bei Brüdern, und holt den Matchwinner mit Foto ins Bild.',
   punkte:[
    {ic:'⚽',r:'team',t:'Torschützen richtig',d:'Namen aus den Spielberichten ohne Vereinszusatz. Heißen zwei Torschützen gleich, steht der Anfangsbuchstabe davor. Der Torschütze mit Foto kommt automatisch als Matchwinner ins Bild.'}
   ]},
  {id:'0.69',v:'0.69',datum:'2026-11-01',titel:'Ergebnis-Grafiken nach dem Spiel',kurz:'Nach jedem Spieltag liegt die Ergebnis-Grafik bereit: Heimsieg, Auswärtssieg, Remis oder Endstand, mit Wappen, Torschützen und fertigem Text.',
   punkte:[
    {ic:'🏆',r:'team',t:'Ergebnis im Spieltagsstudio',d:'Neuer Bereich „Ergebnis“: Die letzten Spiele der Ersten und Zweiten kommen automatisch, das neueste ist vorgewählt. Auf „Heute“ steht, wenn ein frisches Ergebnis wartet.'},
    {ic:'✨',r:'team',t:'Stimmung passt zum Spiel',d:'Siege golden mit Lichtfunken und dem Torschützen im Bild, Remis in Vereinsblau, Niederlagen ruhig und kühl. Dazu passende Vereinsfotos: Jubel nach Siegen, Stadion im Abendrot beim Remis, Zusammenhalt nach Niederlagen. Jedes andere Bild aus der Studio-Bibliothek geht auch.'},
    {ic:'💬',r:'team',t:'Text zum Posten',d:'Zu jedem Ergebnis gibt es drei Textvorschläge mit Torschützen und dem nächsten Spiel. Anpassen, kopieren, teilen. Der Stand wird für alle gemerkt.'}
   ]},
  {id:'0.68',v:'0.68',datum:'2026-10-31',titel:'Tor-Grafiken für den Live-Ticker',kurz:'Im Spieltagsstudio gibt es jetzt den Live-Ticker: Jedes Tor als fertige Grafik mit Spielerfoto, Rückennummer und Namen.',
   punkte:[
    {ic:'⚽',r:'team',t:'Tor in Sekunden',d:'Im Spieltagsstudio oben auf „Live-Ticker“ tippen, Torschützen antippen, Minute und Spielstand eintragen. Die Grafik steht im Vereinsdesign für Feed und Story bereit und lässt sich direkt teilen.'},
    {ic:'📸',r:'team',t:'Kader mit Fotos',d:'Erste und Zweite sind mit Nummern, Namen und Fotos im Vereinstrikot angelegt. Unter „Kader pflegen“ lassen sich Nummern korrigieren und neue Fotos hochladen. Doppelte Rückennummern werden angezeigt.'},
    {ic:'🟨',r:'team',t:'Für Tickerer: mehr Ereignisse',d:'Mit „Mehr Ereignisse“ kommen Gelbe und Rote Karte und Wechsel (rein und raus) dazu. Standard sind nur Tore.'}
   ]},
  {id:'0.67',v:'0.67',datum:'2026-10-30',titel:'Bereit für die Stores',kurz:'Für die Prüfung bei Apple und Google gibt es jetzt einen Prüfzugang mit einem erfundenen Demo-Verein.',
   punkte:[
    {ic:'🧪',r:'admin',t:'Prüfzugang mit Demo-Verein',d:'Wer sich mit der Prüfer-Adresse anmeldet, sieht einen erfundenen Verein mit erfundenen Spielern und Partnern. Echte Daten bleiben unsichtbar. Beim Abmelden geht es zurück in den echten Verein.'}
   ]},
  {id:'0.66',v:'0.66',datum:'2026-10-30',titel:'Partner gewinnen',kurz:'Der Partner-Bereich startet jetzt mit der Partner-Zentrale: jede Firma auf ihrem Weg zum Partner, mit genau einem nächsten Schritt.',
   punkte:[
    {ic:'🧭',t:'Der Weg zum Partner',d:'Idee, Kontakt, Gespräch, Angebot, Partner. Ein Tipp auf eine Station zeigt, wer gerade dort steht.'},
    {ic:'✉️',t:'Anschreiben mit einem Tipp',d:'Die Nachricht ist vorgeschrieben, per Mail, WhatsApp oder zum Kopieren. Danach steht die Firma auf Kontakt und kommt nach 7 Tagen zum Nachhaken wieder.'},
    {ic:'📅',t:'Heute dran',d:'Was überfällig ist, steht oben. Am Anfang schlägt die Zentrale die drei besten Firmen aus der Liste vor.'},
    {ic:'🌗',t:'Besser lesbar',d:'Das Update-Fenster ist im hellen Modus wieder gut lesbar.'}
   ]},
  {id:'0.65',v:'0.65',datum:'2026-10-29',titel:'Die Sportzentrale als App',kurz:'Bald gibt es die Sportzentrale als echte App für iPhone und Android. Updates kommen dort automatisch, ganz ohne Store.',
   punkte:[
    {ic:'📲',t:'App für iPhone und Android',d:'Mit Mitteilungen direkt aufs Handy, Entsperren mit Face ID und Teilen über das Teilen-Menü. Die Einladung kommt von der Abteilungsleitung.'},
    {ic:'🔄',t:'Immer aktuell',d:'Neue Versionen lädt die App still im Hintergrund und zeigt sie beim nächsten Öffnen.'},
    {ic:'🔒',t:'Datenschutz und Hilfe',d:'Zum Nachlesen unter svbsc.kaderwerk.pro/datenschutz.html und /hilfe.html.'}
   ]},
  {id:'0.64',v:'0.64',datum:'2026-10-29',titel:'Partner-Engine',kurz:'Partnerschaften von der ersten Präsentation bis zur Rechnung, und ein Wächter im Hintergrund, damit keine Verlängerung und kein Angebot mehr untergeht.',
   punkte:[
    {ic:'🧭',t:'Partner-Steuerung',d:'Neuer erster Reiter bei Partner: was heute zu tun ist, wer welche Fläche bis wann hat (Jugend als Raster je Mannschaft), Laufzeiten, Rechnungen, Katalog, Team.'},
    {ic:'🛎️',t:'Der Wächter',d:'Fragt nach Verlängerungen ab 12 Monaten vor Ablauf, im letzten halben Jahr öfter, bis eine klare Antwort da ist. Fasst Angebote nach, erinnert an Zahlungen, Vorrechte und Wartelisten.'},
    {ic:'🎬',t:'Neue Präsentation',d:'Erst der Verein, dann die Welten Jugend, Erste, Zweite, Events und Pakete, sortiert nach dem, was dem Partner wichtig ist. Mit Vorschlag, Baukasten und freien Plätzen live.'},
    {ic:'✍️',t:'Abschluss im Termin',d:'Vertrag aus Bausteinen, auf dem iPad unterschreiben, Rechnung mit Girocode sofort. Im Termin auch Sonderpreis und Sonstiges, Kopie per Mail.'},
    {ic:'🔍',t:'Termin vorbereiten',d:'Firma und Website eintragen: Logo wird geholt und freigestellt, der Text, warum es passt, ist vorgeschrieben. Dazu Gesprächspunkte nur fürs Team.'},
    {ic:'👥',t:'Für Abteilungsleitung und Partner-Team',d:'Die Abteilungsleitung schaltet unter Steuerung, Team frei, wer im Partner-Team mitmacht.'}
   ]},
  {id:'0.63',v:'0.63',datum:'2026-10-29',titel:'Bereit für die App im Store',kurz:'Die Sportzentrale ist vorbereitet für die Apps auf iPhone und Android. Neu für alle: das eigene Konto selbst löschen.',
   punkte:[
    {ic:'🗑️',t:'Konto selbst löschen',d:'Unter Mein Konto. Zur Sicherheit erst nach Eingabe von „LÖSCHEN“. Der Admin bekommt Bescheid.'},
    {ic:'📲',t:'Vorbereitet für die Store-App',d:'In der kommenden App für iPhone und Android: Mitteilungen direkt vom Telefon, Entsperren mit Face ID, Teilen über das Teilen-Menü.'}
   ]},
  {id:'0.62',v:'0.62',datum:'2026-10-29',titel:'Feinschliff nach Apples Regeln',kurz:'Die ganze App folgt jetzt den Gestaltungsregeln von Apple: größere Tippflächen, besser lesbarer Text, Dialoge wie am iPhone.',
   punkte:[
    {ic:'👆',t:'Alles gut zu treffen',d:'Jeder Knopf, jedes Feld und jedes Kästchen hat am Handy mindestens die Fläche einer Fingerkuppe. In Tabellen reicht ein Tipp in die Zelle.'},
    {ic:'🔤',t:'Textgröße vom iPhone',d:'Wer am iPhone größeren Text eingestellt hat, bekommt auch die App größer. Abschalten unter Mein Konto, Erscheinungsbild.'},
    {ic:'🌗',t:'Besser lesbar',d:'Kein Text mehr unter 11 Punkt, blasse Schrift kräftiger, in Hell und Dunkel.'},
    {ic:'💬',t:'Dialoge wie am iPhone',d:'„Abbrechen“ steht links, die Hauptaktion rechts. Eingabefelder zoomen beim Antippen nicht mehr hinein.'},
    {ic:'🫶',t:'Für alle bedienbar',d:'Jedes Feld hat einen Namen für VoiceOver. Wer am Gerät weniger Bewegung eingestellt hat, bekommt keine Animationen.'}
   ]},
  {id:'0.61',v:'0.61',datum:'2026-10-29',titel:'Heute',kurz:'Die Startseite zeigt jetzt zuerst, was du in deiner Rolle am häufigsten brauchst. Kürzer, ruhiger, mit einem Tipp am Ziel.',
   punkte:[
    {ic:'📋',t:'Deine Bereiche zuerst',d:'Oben steht eine kurze Liste mit den Bereichen, die du am häufigsten nutzt. Für den Vorstand die Abteilungsleitung und die Termine, für Trainer die Mannschaft und der Spieltag.'},
    {ic:'🔴',t:'Zähler nur, wenn etwas ansteht',d:'Eine rote Zahl erscheint nur, wenn bei dir etwas fällig ist. Darunter steht in einer Zeile, wie der Stand ist.'},
    {ic:'🧭',t:'Leiste unten aufgeräumt',d:'Höchstens vier Bereiche plus Mehr. „Home“ heißt jetzt „Heute“, der Vorstand hat die Planung direkt in der Leiste.',go:'home'},
    {ic:'🔎',r:'scout',t:'Scouting zum Aufklappen',d:'Die langen Scouting-Listen stehen weiter auf der Startseite, aber zugeklappt. Ein Tipp öffnet sie, die App merkt sich deine Wahl.'}
   ]},
  {id:'0.60',v:'0.60',datum:'2026-10-28',titel:'Spieltagsstudio',kurz:'Plakate zum Spieltag, fertig für Instagram, Facebook und WhatsApp. Spielplan, Wappen und Texte kommen aus der App, das Bild baut sich selbst.',
   punkte:[
    {ic:'🎞️',r:'plakat',t:'Plakat in drei Formaten',d:'Unter Studio, Spieltagsstudio: Story, Feed und Quer, als PNG in doppelter Auflösung. Spiel aus dem Spielplan wählen, fertig.',go:'plakat'},
    {ic:'🌙',r:'plakat',t:'Licht nach Termin',d:'Abendspiel bekommt Flutlicht, Sonntagmittag Tageslicht, Herbst und Winter ihre eigene Stimmung. Von Hand umstellen geht trotzdem.'},
    {ic:'🛡️',r:'plakat',t:'Geprüfte Wappen',d:'20 Vereinswappen liegen in der App, in ihren echten Farben und mit unveränderten Innenflächen. Eigene Dateien lassen sich hochladen.'},
    {ic:'💬',r:'plakat',t:'Drei Textfelder',d:'Begleittexte für Instagram und Facebook, für WhatsApp und für die Story. Alle bearbeitbar, mit Knopf zum Kopieren.'},
    {ic:'🤝',r:'plakat',t:'Gemeinsamer Stand',d:'Spielort und Texte liegen in der App, nicht im Browser. Wer als Nächstes reinschaut, sieht denselben Stand.'},
    {ic:'🧭',t:'Alles zum Spieltag an einem Ort',d:'Mein Spieltag, Gegnercheck, Elf der Woche und das Spieltagsstudio stehen jetzt zusammen in der Gruppe Spieltag, statt über vier Ecken verteilt.',go:'sptag'}
   ]},
  {id:'0.59',v:'0.59',datum:'2026-10-26',titel:'Shop-Finanzen',kurz:'Was der 1896 Shop einbringt, auf einen Blick: Umsatz, Wareneinsatz, Rohertrag und Marge, dazu Export für die Buchhaltung und eine tägliche Sicherung.',
   punkte:[
    {ic:'🛒',r:'partner',t:'Dashboard',d:'Unter Partner, Reiter Shop-Finanzen: Umsatz brutto und netto, Einkauf, Rohertrag, offene Zahlungen und die Rückvergütung von 11teamsports. Zeitraum frei wählbar.',go:'sponsoring'},
    {ic:'📊',r:'partner',t:'Export',d:'Ein Tipp, und die Buchhaltung hat alles als Excel mit Übersicht, Monaten, Bestellungen, Positionen und Sammelbestellungen. Oder als CSV.'},
    {ic:'💾',r:'partner',t:'Sicherung',d:'Jede Nacht sichert die Sportzentrale den ganzen Shop. Zusätzlich jederzeit von Hand sichern und als Datei herunterladen.'},
    {ic:'🔢',r:'partner',t:'Hinweise',d:'Die App meldet Artikel ohne Einkaufspreis und Preise, die nicht auf ,96 enden (BSC Retro auf ,59).'}
   ]},
  {id:'0.58',v:'0.58',datum:'2026-10-24',titel:'Pitch-Decks verfeinert',kurz:'Jedes Deck kann jetzt einen eigenen Einstieg haben, einzelne Bausteine ausblenden und helle Logos auf dunklem Grund zeigen.',
   punkte:[
    {ic:'✏️',r:'partner',t:'Eigener Einstieg',d:'Beim Bearbeiten eines Decks gibt es ein Feld für den Text ganz oben. Leer bleibt der Standardtext über unsere 260 Kinder und Jugendlichen.',go:'sponsoring'},
    {ic:'🔞',r:'partner',t:'Ohne Jugend-Trikot',d:'Bei Glücksspiel oder Alkohol einfach den Haken setzen: Die Trikotpatenschaft für die Jugend taucht im Deck dann nicht auf und kann auch nicht gebucht werden.'},
    {ic:'🌙',r:'partner',t:'Helle Logos',d:'Ist ein Logo weiß oder hell, zeigt das Deck es auf dunklem Grund statt auf einer weißen Kachel. Ohne Logo steht der Kurzname da.'}
   ]},
  {id:'0.57',v:'0.57',datum:'2026-10-24',titel:'Pitch-Decks für Partner',kurz:'Für jede Firma eine persönliche Präsentation zum Durchscrollen: Verein, Pakete mit freien Plätzen, Angebot per Mail und Antrag mit Unterschrift direkt auf dem Handy.',
   punkte:[
    {ic:'🎯',r:'partner',t:'Pitch-Decks',d:'Unter Partner: Deck für eine Firma anlegen, mit Logo und warum es passt. Link kopieren, per WhatsApp schicken oder beim Termin direkt zeigen. Du siehst, ob der Kunde reingeschaut hat.',go:'sponsoring'},
    {ic:'🔥',r:'partner',t:'Freie Plätze live',d:'Jedes Paket zeigt, wie viele Plätze noch frei sind. Wird es eng, leuchtet es orange, ausgebuchte Pakete lassen sich nicht mehr wählen.'},
    {ic:'✍️',r:'partner',t:'Angebot und Antrag',d:'Der Kunde wählt Paket, Bausteine und Laufzeit, bekommt das Angebot als ausfüllbares PDF oder unterschreibt gleich im Deck. Die Kopie geht an ihn und an den Verein, ihr bekommt eine Meldung.'}
   ]},
  {id:'0.56',v:'0.56',datum:'2026-10-24',titel:'Helfer-Einsatzplan',kurz:'Die Leute aus dem Helferpool tragen sich jetzt selbst für Schichten ein, über ihren persönlichen Link und ganz ohne App.',
   punkte:[
    {ic:'🙌',t:'Für den Helferpool freigeben',d:'Im Schichtplan einer Checkliste ein Haken, dann sehen Helfer aus dem Pool den Termin und tragen sich mit einem Tipp ein. Selbst eingetragene erkennst du am 🙌.'},
    {ic:'💬',t:'Helfer anfragen',d:'Passende Leute aus dem Helferpool stehen oben. Ein Tipp öffnet WhatsApp mit fertigem Text und dem persönlichen Link. Die App merkt sich, wen du schon gefragt hast.'},
    {ic:'⏰',t:'Erinnern',d:'Drei Tage vorher meldet sich die Sportzentrale, wenn noch Plätze frei sind. Am Vortag erinnerst du die Eingetragenen mit einem Tipp.'},
    {ic:'📣',t:'Rundnachricht',d:'Für Admin und Vorstand im Cockpit: Nachricht an alle oder an einzelne Rollen, als Meldung in der App und sofort aufs Handy, wer Mitteilungen eingeschaltet hat.'}
   ]},
  {id:'0.55',v:'0.55',datum:'2026-10-23',titel:'Ein Ort zum Wohlfühlen',kurz:'Die Sportzentrale sieht freundlicher aus: weiche Farben in Vereinsblau und Orange, geschwungene Linien im Hintergrund, ein aufgeräumtes Menü am Handy.',
   punkte:[
    {ic:'🎨',t:'Neuer Hintergrund',d:'Sanfte Farbflächen in den Vereinsfarben, die sich langsam bewegen. Morgens etwas wärmer, abends ruhiger. Bei „Bewegung reduzieren“ bleibt alles still.'},
    {ic:'🛡️',t:'Wappen oben links',d:'Das Wappen steht jetzt frei in der Kopfleiste, ohne weiße Kachel, im dunklen und im hellen Modus.'},
    {ic:'📱',t:'Menü am Handy',d:'„Mehr“ hat nur noch fünf Gruppen statt zehn und begrüßt dich. Unten zeigt ein leuchtender Punkt, wo du gerade bist.'},
    {ic:'⚽',t:'Mannschaft',d:'Training erfassen, Spiel, Verletzung und Co-Trainer stehen am Handy in einer Zeile zum Wischen statt in drei Reihen. Doppelte Überschriften unter den Reitern sind weg.'}
   ]},
  {id:'0.54',v:'0.54',datum:'2026-10-23',titel:'Erste Schritte und Übungen',kurz:'Neu auf der Übersicht: deine ersten Schritte mit kleinen Übungen. Geübt wird mit Übungsspielern, in die echten Daten kommt dabei nichts.',
   punkte:[
    {ic:'✅',t:'Deine ersten Schritte',d:'App installieren, Mitteilungen einschalten, kurzer Rundgang und Übungen passend zu deiner Rolle. Erledigtes hakt sich selbst ab.'},
    {ic:'🎯',t:'Übungen',d:'Eye-Test abgeben, Kandidat aufnehmen, Training erfassen, Abstimmung verschicken: einmal in Ruhe üben. Jederzeit wiederholbar unter Mein Konto, Lernen.'},
    {ic:'💡',t:'Tipps',d:'Ab und zu ein kurzer Hinweis auf eine Funktion, die dir helfen kann. Wegwischen genügt, dann kommt er seltener.'},
    {ic:'📊',r:'admin',t:'Nutzung',d:'Neues Dashboard: aktive Personen, Zeit je Bereich, wer die App installiert hat, Nutzertypen, ungenutzte Funktionen und eine Heatmap direkt auf der Seite.',go:'nutzung'}
   ]},
  {id:'0.53',v:'0.53',datum:'2026-10-23',titel:'Sportzentrale als App',kurz:'Auf dem Handy erscheint unten ein kleines Fenster: Sportzentrale als App installieren. Als App startet sie schneller, bleibt angemeldet und kann Mitteilungen schicken.',
   punkte:[
    {ic:'📲',t:'Als App installieren',d:'Auf Android mit einem Tipp, auf dem iPhone über Teilen und „Zum Home-Bildschirm“. Das Fenster lässt sich nach unten wegwischen und meldet sich nach ein paar Tagen wieder.'},
    {ic:'🔔',t:'Mitteilungen einschalten',d:'Läuft die Sportzentrale als App, bietet sie an, Mitteilungen einzuschalten. So kommen Abstimmungen, Erinnerungen und Neuigkeiten direkt aufs Handy.'}
   ]},
  {id:'0.52',v:'0.52',datum:'2026-10-23',titel:'Radar mit klarerem Blick',kurz:'Das Radar unter Scouting, Entdecken zeigt nur noch wirklich auffällige Entwicklungen. Die Liste ist dadurch etwa halb so lang.',
   punkte:[
    {ic:'📡',r:'scout',t:'Radar fokussiert',d:'Ein Aufstieg mit der ganzen Mannschaft allein ist kein Signal mehr. Es zählen ein Sprung um mindestens eine ganze Spielklasse als Stamm- oder Rotationsspieler, der Weg vom Ersatz zum Stammspieler, außergewöhnlicher Output über mindestens zwölf volle Spiele und ein klarer mehrjähriger Aufwärtstrend.',go:'entdecken'},
    {ic:'🧹',r:'admin',t:'Datenprüfung genauer',d:'Unsichere Positionsangaben aus den Spieldaten erzeugen keinen falschen Widerspruch mehr.'}
   ]},
  {id:'0.51',v:'0.51',datum:'2026-10-23',titel:'Kader, Scouting und Mannschaft neu geordnet',kurz:'Lukas’ Überarbeitung ist da: Kader plant die nächste Saison, Scouting löst die Bedarfe daraus, Mannschaft zeigt diese Woche. Alles mit der neuen Spielerstärke.',
   punkte:[
    {ic:'🗓️',r:'scout',t:'Kader: Planung',d:'Nächste Saison für die Erste und die Zweite: System, Ziel, Plan-Elf zum Antippen, offene Entscheidungen, Gespräche und die Jugend für die Herren. Fehlt etwas, entsteht automatisch ein Bedarf.',go:'kplan'},
    {ic:'📋',r:'scout',t:'Kaderübersicht und Top-Elf',d:'Erste und Zweite in einer sortierbaren Liste. Die Top-Elf zeigt die stärkste Elf heute und die Plan-Elf der nächsten Saison. Planung ändert nie die Stärke.',go:'kueber'},
    {ic:'🎯',r:'scout',t:'Scouting: Bedarfe und Kandidaten',d:'Jeder Bedarf zeigt, wer intern in Frage kommt, das Suchprofil und passende Spieler mit Fit, Einordnung, Wechselchance und Empfehlung. Kandidaten laufen von Kontakt über Gespräch bis zur Entscheidung.',go:'sbedarf'},
    {ic:'🔭',r:'scout',t:'Entdecken',d:'Markt, Radar mit auffälligen Entwicklungen, Rückkehrer und Talente an einem Ort. Spieler lassen sich direkt vergleichen, mit den Unterschieden in Worten.',go:'entdecken'},
    {ic:'👥',r:'team',t:'Mannschaft: diese Woche',d:'Die Übersicht zeigt nächstes Spiel, nächstes Training, wer fehlt und was offen ist. Verletzungen und Abwesenheiten stehen in einer Zeitleiste, Abstimmungen, Materialdienst und Kasse unter Organisation.'},
    {ic:'⚖️',r:'admin',t:'Modell prüfen und Daten pflegen',d:'„Bewertung prüfen“ kennt jetzt auch „passt“ und Vergleiche mit anderen Spielern. Unter Wissen, Modell siehst du Muster, simulierst Änderungen und gibst neue Versionen frei. Die Datenprüfung zeigt Lücken und Widersprüche.',go:'model'}
   ]},
  {id:'0.50',v:'0.50',datum:'2026-10-23',titel:'Neue Spielerstärke (Vorschau)',kurz:'Für Admin als Vorschau: die neue Spielerstärke im Profil, mit Sicherheit, Form und einer Erklärung in Worten. Alle anderen sehen die App wie bisher.',
   punkte:[
    {ic:'📈',r:'admin',t:'Stärke V1 im Spielerprofil',d:'Oben im Profil: die neue Stärke mit Einordnung („wie ein Stammspieler der Kreisliga A“), Sicherheit, Form und 24 Monaten. Unter „Warum diese Stärke?“ stehen die Gründe und die Grundlage je Saison.'},
    {ic:'👁️',r:'admin',t:'Eye-Test neu',d:'Gesamturteil 1 bis 5, sechs Kategorien, wie gut du ihn kennst und welche Perspektive er hat. Je besser du ihn kennst, desto mehr zählt dein Urteil. Die alten Eye-Tests bleiben erhalten.'},
    {ic:'💬',r:'admin',t:'Bewertung prüfen',d:'Passt eine Zahl nicht, schreibt ihr kurz warum. Die Sportliche Leitung sieht alle offenen Hinweise unter Wissen, Modell.'},
    {ic:'🔀',r:'admin',t:'Schalter',d:'Unter Wissen, Modell legst du fest, wer die neue Ansicht schon sieht: nur Admin, ausgewählte Personen oder alle.',go:'model'}
   ]},
  {id:'0.49',v:'0.49',datum:'2026-10-23',titel:'Heller Modus',kurz:'Neu unter Mein Konto: Hell, Dunkel oder wie am Gerät. Der helle Modus sieht aus wie ein Notizbrett: warmes Papier mit feinem Punktraster, Vereinsblau und Orange als Akzente.',
   punkte:[
    {ic:'☀️',t:'Hell, Dunkel oder wie am Gerät',d:'Oben rechts auf dein Bild tippen, dann Mein Konto, Erscheinungsbild. Die Wahl gilt für dieses Gerät und bleibt gespeichert. „Wie am Gerät“ wechselt automatisch mit der Einstellung von Handy oder Computer.'},
    {ic:'📝',t:'Wie ein Notizbrett',d:'Warmes Papier mit feinem Punktraster, Karten wie Notizzettel, Vereinsblau für Knöpfe und Orange als zweite Vereinsfarbe. Alle Texte sind auf gute Lesbarkeit geprüft.'},
    {ic:'📞',r:'orga',t:'Handynummern im Helferpool',d:'Wer seine Nummer ohne die 0 vorne eingibt (z. B. 1520 …), bekommt jetzt trotzdem eine richtige deutsche Nummer. Vier falsch gespeicherte Nummern sind korrigiert.'}
   ]},
  {id:'0.48',v:'0.48',datum:'2026-10-23',titel:'Planung für alle Bereiche',kurz:'Ein Ort für Projekte, Aufgaben und Beschlüsse. Jeder Bereich hat sein eigenes Board, die Abteilungsleitung ihre Runde und Beschlüsse, die Projektsteuerung alle Projekte mit Ampel und die Vereinsentwicklung die Ziele 2030.',
   punkte:[
    {ic:'🎯',r:'planung',t:'Aufgabensteuerung → Planung',d:'Oben die Bereiche, in denen du mitarbeitest. Unter „Meine“ steht alles, was dir gehört, sortiert nach überfällig, heute, diese Woche und später.',go:'planung'},
    {ic:'⚡',r:'planung',t:'Schnell anlegen',d:'Einfach tippen: „Plakat drucken @Lukas bis Freitag !“. Die App erkennt Person, Datum und dass es wichtig ist. Mit #runde kommt das Thema auf die Liste für die nächste Sitzung.',go:'planung'},
    {ic:'🧭',r:'planung',t:'Abteilungsleitung',d:'Wer hat was, Themen für die nächste Runde (als Tagesordnung kopierbar) und Beschlüsse mit Ergebnis und Begründung.',go:'planung'},
    {ic:'🚦',r:'planung',t:'Projektsteuerung',d:'Alle Projekte aller Bereiche mit Ampel, Fortschritt und Meilensteinen. „Braucht Aufmerksamkeit“ zeigt, wo es hakt. Dazu ein Zeitplan über die nächsten Monate.',go:'planung'},
    {ic:'🌱',r:'planung',t:'Vereinsentwicklung',d:'Die Ziele 2030 mit Live-Zahlen aus Helferpool, Partnern und Veranstaltungen. Ideen aus dem Helferpool übernimmst du mit einem Tipp in den Ideenspeicher.',go:'planung'},
    {ic:'📋',r:'planung',t:'Vorlagen und Erinnerungen',d:'Veranstaltung planen, Partner gewinnen, Zuschuss beantragen und mehr: ein Tipp legt das Projekt mit allen Schritten und Terminen an. Wer eine Aufgabe bekommt, wird benachrichtigt, am Vortag und am Fälligkeitstag erinnert und montags gibt es den Wochenüberblick.',go:'planung'},
    {ic:'🗑️',r:'planung',t:'Nichts geht verloren',d:'Gelöschtes landet im Papierkorb und lässt sich zurückholen. Wer welchen Bereich sieht, stellt der Admin unter Verwaltung bei den Zugriffen ein.'},
    {ic:'🔒',r:'admin',t:'Sicherheitscheck',d:'Datenbank, Funktionen, öffentliche Seiten und Schlüssel geprüft. Zusätzlich abgedichtet: interne Funktionen und Tabellen sind ohne Anmeldung zu, die Seiten lassen sich nicht mehr in fremde Seiten einbetten und haben einen Grundschutz gegen eingeschleuste Inhalte.'}
   ]},
  {id:'0.47',v:'0.47',datum:'2026-10-20',titel:'Helferpool nach Bereichen',kurz:'Wer sich für welchen Bereich interessiert, siehst du jetzt auf einen Blick. Einladen geht mit einem Tipp, die App merkt sich, wer schon eingeladen ist.',
   punkte:[
    {ic:'👥',r:'orga',t:'Nach Bereichen',d:'Im Helferpool unter „Nach Bereichen“: Heimspieltag, Veranstaltungen, Jugend und so weiter, jeweils mit den Leuten, die das angekreuzt haben. „Noch unsicher“ steht extra, da lohnt sich ein Anruf.'},
    {ic:'💬',r:'orga',t:'Mit einem Tipp einladen',d:'Je Bereich lässt sich ein eigener WhatsApp-Gruppenlink hinterlegen. „Einladen“ öffnet WhatsApp (oder Mail) auf deinem Handy mit fertigem Text und Link, du schickst selbst ab. Danach steht dort „✓ eingeladen“ mit Datum und wer eingeladen hat.'},
    {ic:'🔗',r:'orga',t:'Wer hat auf den Gruppenlink getippt',d:'Wer sich über die Mitmach-Seite einträgt und auf „Zur WhatsApp-Helfergruppe“ tippt, bekommt im Helferpool den Vermerk „Link getippt“. Dazu gibt es einen eigenen Filter.'}
   ]},
  {id:'0.46',v:'0.46',datum:'2026-10-19',titel:'Studio: einer bearbeitet, nichts geht verloren',kurz:'Im Studio arbeitet immer nur eine Person an einem Projekt, alle anderen sehen, wer gerade dran ist. Jede Änderung steht im Verlauf und lässt sich zurückholen. Die Mitmach-Seite fragt jetzt dasselbe wie der Mitmach-Zettel.',
   punkte:[
    {ic:'🔒',r:'studio',t:'„XY bearbeitet gerade“',d:'Wer ein Projekt öffnet, bearbeitet es. Alle anderen sehen den Namen, können ansehen, präsentieren und kommentieren, aber nichts ändern. In der Projektliste steht, wer gerade woran arbeitet.',go:'studio'},
    {ic:'⏱️',r:'studio',t:'Nach einer Stunde wieder frei',d:'Wer eine Stunde nichts tut, fliegt automatisch aus der Bearbeitung. Alles ist dann gespeichert, und die nächste Person kann weitermachen.'},
    {ic:'🕘',r:'studio',t:'Verlauf wie bei Wikipedia',d:'Wer hat wann was angelegt, geändert oder gelöscht. Jede ältere Fassung einer Folie lässt sich ansehen und zurückholen, auch gelöschte Folien. Zu Beginn und am Ende jeder Bearbeitung entsteht automatisch eine Version.'},
    {ic:'🛟',r:'studio',t:'Nichts wird mehr gelöscht',d:'Projekte, Versionen und der Verlauf lassen sich nicht mehr endgültig löschen. So geht nie etwas verloren.'},
    {ic:'🙌',r:'orga',t:'Mitmach-Seite wie der Zettel',d:'Die Seite hinter dem QR-Code fragt jetzt genau das, was auf dem Mitmach-Zettel steht: Kontakt, acht Bereiche, „noch unsicher“, „nicht mithelfen“, eine Idee und was du uns mit auf den Weg gibst. Im Helferpool siehst du alles und filterst nach Bereich.'}
   ]},
  {id:'0.45',v:'0.45',datum:'2026-10-13',titel:'Studio: Bereiche und Sichtbarkeit',kurz:'Jedes Projekt im Studio gehört jetzt zu einem Bereich. Wer etwas sieht und ändern darf, hängt an der Rolle und an Freigaben je Person.',
   punkte:[
    {ic:'🔐',r:'studio',t:'Bereiche im Studio',d:'Abteilungsleitung (intern), Sport & Trainer, Partner, Social Media & Presse, Jugend und Verein allgemein. Jede Karte und jedes geöffnete Projekt zeigt, zu welchem Bereich es gehört und wer es sieht.',go:'studio'},
    {ic:'👤',r:'studio',t:'Nur was zur Rolle passt',d:'Du siehst nur Projekte aus deinen Bereichen und legst nur dort neue an. Wer zum Beispiel Social Media macht, bekommt genau diesen Bereich freigegeben und sonst nichts.'},
    {ic:'🔒',r:'studio',t:'Privat',d:'Neue Projekte können erst einmal privat sein: dann sehen sie nur du und der Admin, bis du sie über „Sichtbarkeit“ freigibst.'},
    {ic:'⚙️',r:'admin',t:'Freigaben je Person',d:'Unter Verwaltung → Nutzer & Rollen gibt es für jeden Studio-Bereich „ansehen“ und „bearbeiten“, als Vorgabe je Rolle und als Ausnahme je Person.',go:'admin'}
   ]},
  {id:'0.44',v:'0.44',datum:'2026-10-13',titel:'Studio: Master, Rechtsklick, Bildpool, Teilen',kurz:'Masterfolien, ein Rechtsklick-Menü wie in Canva, ein Bildpool mit eigenen CI-Bildern und ein Export, der direkt per Mail oder WhatsApp geteilt werden kann.',
   punkte:[
    {ic:'▤',r:'studio',t:'Masterfolien',d:'Unter „Master“ legst du Hintergrund, Logo, Fußzeile und Seitenzahl einmal an. Jede Folie kann einen Master nutzen (Rechtsklick auf die Folie → Master). Änderungen am Master gelten sofort auf allen Folien.',go:'studio'},
    {ic:'🖱',r:'studio',t:'Rechtsklick wie in Canva',d:'Kopieren, Einfügen (auch zwischen Folien und Projekten), Duplizieren, Ebenen, an der Folie ausrichten, sperren, Stil übertragen, Kommentar und KI direkt am Element.'},
    {ic:'🖼',r:'studio',t:'Bildpool mit CI-Bildern',d:'Über 40 neue Bilder im Vereinsdesign: Hintergründe, Duoton-Fotos, Fotos mit Marine-Verlauf und Elemente. Bilder per Rechtsklick gegen ähnliche Poolbilder tauschen. Eigene Bilder hochladen, benennen, Kategorien vergeben.'},
    {ic:'📤',r:'studio',t:'Exportieren und teilen',d:'PDF, PowerPoint, Canva, HTML-Präsentation, Bilder oder alles als ZIP. In Originalgröße oder kleiner für Mail und WhatsApp, für alle Folien, nur die aktuelle oder eine Auswahl. Danach direkt teilen per Mail, WhatsApp oder Link.'}
   ]},
  {id:'0.43',v:'0.43',datum:'2026-10-13',titel:'Studio',kurz:'Präsentationen und Dokumente im Vereinsdesign gemeinsam bearbeiten, mit KI-Hilfe, Kommentaren und Versionen.',
   punkte:[
    {ic:'🎨',r:'studio',t:'Neu: das Studio',d:'Alle Präsentationen und Dokumente des Vereins liegen jetzt in der App, zum Beispiel das Konzept mit allen Folien. Ansehen, präsentieren und kommentieren kann jeder mit Zugang, ändern dürfen Vorstand und Planer.',go:'studio'},
    {ic:'✏️',r:'studio',t:'Bearbeiten wie gewohnt',d:'Folien hinzufügen, verschieben, duplizieren. Texte direkt anklicken und ändern, Bilder tauschen und zuschneiden, Bausteine wie Personenkarten oder Termin-Zeilen einfügen. Strg+Z macht alles rückgängig.'},
    {ic:'👥',r:'studio',t:'Gemeinsam gleichzeitig',d:'Ihr seht, wer gerade mitarbeitet und was markiert ist. Zwei Leute können an derselben Folie arbeiten, ohne dass etwas verloren geht. Kommentare mit @Namen, Versionen mit Namen und Wiederherstellen.'},
    {ic:'✦',r:'studio',t:'KI-Assistent',d:'Neue Folie aus einem Satz, Folie kürzen, Text umformulieren oder eine ganze Präsentation aus Stichpunkten. Die KI nutzt nur unsere Bausteine, erfindet keine Namen oder Zahlen und du siehst vorher, was sich ändert.'},
    {ic:'📄',r:'studio',t:'Export als PDF und PNG',d:'Eine Seite je Folie in exakter Größe, Text bleibt markierbar, fertig zum Herunterladen.'},
    {ic:'🔗',r:'studio',t:'Eigene Adresse',d:'Das Studio gibt es auch direkt unter studio.kaderwerk.pro, im Vollbild und ohne die restliche App. Anmeldung und Rechte sind dieselben.'}
   ]},
  {id:'0.42',v:'0.42',datum:'2026-10-13',titel:'Aufgeräumt und abgeglichen',kurz:'Ruhigeres Spielerprofil, kein FuPa-MVP mehr, der Rückkehrer-Radar im Scouting und eine Datenprüfung, die doppelte Spieler und widersprüchliche Spieldaten findet.',
   punkte:[
    {ic:'🧹',t:'Spielerprofil aufgeräumt',d:'Oben vier Kacheln, darunter Statistik, Vereinswerte, Training und Kaderplanung. Die All-Time-Werte stehen jetzt unter „Vereinswerte“, nicht mehr beim Training. Alles Weitere liegt abgesetzt unter „Hintergrund & Daten“.'},
    {ic:'🔁',r:'scout',t:'Rückkehrer-Radar im Scouting',d:'Ehemalige mit vielen Spielen für uns, die jetzt woanders spielen, findest du unter Scouting → Radar.',go:'radar'},
    {ic:'🧩',r:'admin',go:'pruefung',t:'Datenprüfung für den Admin',d:'Doppelte Spieler (auch mit Zwischennamen oder anderer Schreibweise), Namensvarianten aus fussball.de und der Vereinsstatistik und Spiele, bei denen App, FuPa und fussball.de nicht zusammenpassen. Mit Annahme und einem Tipp zum Bestätigen.'},
    {ic:'⚽',t:'Spieldaten aus allen Quellen',d:'Fehlt ein Spieler bei FuPa, steht aber im Spielbericht von fussball.de, wird er ergänzt. Widersprüche bleiben sichtbar, im Spiel unter „Quellenvergleich“.'},
    {ic:'✂️',t:'Weniger ist mehr',d:'Der FuPa-MVP ist überall raus, ebenso die „Lücken“ in der Spielerliste der Mannschaften. Der Scouting-Bericht meldet sich nur noch einmal.'}
   ]},
  {id:'0.41',v:'0.41',datum:'2026-10-06',titel:'Mein Spieltag: Aufgabenpaket und Interview',kurz:'Der Spieltag hat jetzt einen eigenen Eintrag links, das ganze Aufgabenpaket aus dem Konzept und ein Interview, das Frage für Frage das Wissen für später festhält.',
   punkte:[
    {ic:'🗂️',t:'Das ganze Aufgabenpaket',d:'Heimspiel, Sportplatzkasse, Schiedsrichter, Bewirtung, Spielbetrieb, Spielverlegungen, DFBnet, Sportgelände, Schlüssel und Kontakte. Jede Aufgabe zeigt, wie viel schon festgehalten ist.',go:'sptag'},
    {ic:'🎙️',t:'Interview statt Fragebogen',d:'Die App stellt eine Frage nach der anderen, du antwortest ins Mikrofon. Daraus werden kurze Merksätze für jeden, der später hilft oder übernimmt.',go:'sptag'},
    {ic:'📈',t:'Übergabe-Stand',d:'Ein Balken zeigt, wie viel vom Spieltag-Wissen schon in der App steht. Die Übergabe als Text listet auch, was noch offen ist.'}
   ]},
  {id:'0.40',v:'0.40',datum:'2026-10-06',titel:'Mein Spieltag: einfach sagen, was erledigt ist',kurz:'Ein eigener Bereich für die Spieltag-Verantwortung: aufs Mikrofon tippen, sprechen, fertig. Die Checkliste hakt sich ab, Neues kommt dazu, und dein Wissen bleibt für Nachfolger erhalten.',
   punkte:[
    {ic:'🎙️',t:'Ansage per Mikrofon',d:'„Hallo Jürgen, was hast du alles erledigt? Was muss noch gemacht werden?“ Du sprichst, die App sortiert das in die Checkliste des Heimspiels. Gespeichert wird erst, wenn du „Passt“ tippst.',go:'sptag'},
    {ic:'🔔',t:'Erinnerung zur rechten Zeit',d:'Zwei Tage vor dem Heimspiel am späten Nachmittag und gut zwei Stunden nach Anpfiff kommt ein kurzer Stups: was steht, was fehlt? Die Nachricht öffnet direkt die Ansage.'},
    {ic:'💡',t:'Wissen für Nachfolger',d:'Was man wissen muss, wenn man den Spieltag übernimmt: wo etwas liegt, wen man anruft, was schiefgehen kann. Kommt aus den Ansagen oder von Hand, mit „Übergabe als Text“.',go:'sptag'}
   ]},
  {id:'0.39',v:'0.39',datum:'2026-10-03',titel:'Neuer Look mit Tiefe',kurz:'Verläufe, Lichtkanten und mehr Tiefe auf Karten, Knöpfen und in der Leiste. Alles an derselben Stelle wie vorher.',
   punkte:[
    {ic:'✨',t:'Karten mit Verlauf',d:'Jede Karte hat jetzt einen Verlauf von hell nach dunkel, eine feine Lichtkante oben und einen weichen Schatten. Das Cockpit bekommt den Markenverlauf.'},
    {ic:'🎨',t:'Royalblau bis Violett',d:'Knöpfe, aktiver Reiter unten, Symbole und dein Name laufen im Markenverlauf. Admin und Vorstand in Gold.'},
    {ic:'🛡️',t:'Wappen oben',d:'Am Handy steht das Wappen jetzt in der Kopfleiste.'}
   ]},
  {id:'0.38',v:'0.38',datum:'2026-10-02',titel:'Aufgeräumt nach Lukas’ Liste',kurz:'Aufgabensteuerung an einem Ort, aufgeräumte Spielerliste, Gegneranalyse direkt bei den nächsten Spielen und eine Skala für Eye-Test und MScore.',
   punkte:[
    {ic:'🧭',t:'Seitenleiste bis unten',d:'Am Rechner lässt sich die linke Leiste jetzt bis zum letzten Eintrag scrollen. Vorher verschwanden die unteren Bereiche.'},
    {ic:'✅',t:'Aufgabensteuerung',d:'Termine, Aufgaben und Vorstand & Ziele liegen jetzt zusammen unter einem Punkt, oben umschaltbar.',go:'kalender'},
    {ic:'📋',t:'Spielerliste aufgeräumt',d:'Neue Spaltenreihenfolge, ohne „Nach Mannschaft“, ohne Schwachen Fuß, Datenbasis, Rolle und Charakter. Jeder Tabellenkopf erklärt sich beim Überfahren, breite Tabellen haben Pfeile zum seitlichen Blättern.',go:'spieler',r:'team'},
    {ic:'⚽',t:'FuPa zählt bei Toren und Vorlagen',d:'Tore, Vorlagen und Minuten kommen von FuPa, auch wenn schon etwas eingetragen war. Spiele vor dem 20.09., die FuPa nicht hat, kommen aus dem Spielbericht von fussball.de.',go:'games',r:'team'},
    {ic:'🎯',t:'Gegneranalyse bei den nächsten Spielen',d:'Unter Spiele → Bevorstehende steht die Analyse des nächsten Gegners direkt darunter. Jedes Spiel antippen zeigt die Historie gegen diesen Gegner mit Notizen. Der eigene Gegnercheck entfällt.',go:'gnext',r:'team'},
    {ic:'🛠️',t:'Massenpflege',d:'Keine Mannschaftsfilter mehr, jeder PlayStyle ist erklärt, PlayStyle+ gibt es nicht mehr.',go:'pflege',r:'team'},
    {ic:'📏',t:'Eine Skala',d:'Eye-Test 1 bis 10 in halben Schritten, mal zehn = Spielstärke: 4 Kreisliga C, 5,5 B, 7 A, 8,5 Kreisoberliga, 10 Gruppenliga. Der MScore nutzt dieselbe Skala, deshalb liegen die Werte jetzt höher als vorher.',go:'model',r:'scout'},
    {ic:'📚',t:'Wissen: Datenquellen und Modell',d:'Woher jede Angabe kommt, welche Quelle gilt, wie doppelte Spieler zusammengeführt werden und wie der MScore rechnet.',go:'quellen'},
    {ic:'👯',t:'Doppelte Spieler zusammenführen',d:'Unter Wissen → Datenquellen stehen Spieler, die doppelt in der App sind. Ein Tipp führt sie zusammen, alle Einträge bleiben erhalten.',go:'quellen',r:'admin'}
   ]},
  {id:'0.37',v:'0.37',datum:'2026-09-30',titel:'Neuigkeiten nur noch einmal',kurz:'Das Fenster mit den Neuigkeiten kommt pro Update nur noch einmal und höchstens einmal am Tag. Nachlesen kannst du alles jederzeit unter „Was ist neu“.',
   punkte:[
    {ic:'🔕',t:'Einmal reicht',d:'Egal wie du das Fenster schließt, für dieses Update kommt es nicht wieder. Gibt es mehrere Updates an einem Tag, siehst du sie gesammelt beim nächsten Mal. Bis dahin steht „neu“ im Menü.',go:'home'},
    {ic:'📲',t:'Erinnerung bei alter Version',d:'Hängt eine App mehrere Tage auf einer alten Version, kommt höchstens einmal pro Woche eine Push-Nachricht. Ein Tipp darauf aktualisiert die App und zeigt, was neu ist.'},
    {ic:'🔔',t:'Wer wurde erinnert?',d:'Im Update-Fenster der Nutzerverwaltung steht, ob die Person Push hat und wann die letzte Erinnerung rausging.',r:'admin'}
   ]},
  {id:'0.36',v:'0.36',datum:'2026-09-30',titel:'Updates kommen sicher an',kurz:'Die App meldet jetzt, welche Version auf welchem Gerät läuft. So sehen wir, wer noch eine alte Version hat, und können gezielt Bescheid geben.',
   punkte:[
    {ic:'🔄',t:'Neue Versionen kommen von selbst',d:'Auch Apps, die vor dem 28.09. installiert wurden, holen sich neue Versionen jetzt zuverlässig. Einfach die App schließen und wieder öffnen.',go:'home'},
    {ic:'📌',t:'Das alte Symbol bleibt',d:'Wer die App vor dem 28.09. aufs Handy gelegt hat, muss nichts neu installieren und sich nicht neu anmelden. Das alte Symbol zeigt immer die neueste Version.'},
    {ic:'📲',t:'Wer hat welche Version?',d:'In der Nutzerverwaltung steht bei jeder Person, welche Version auf ihrem Handy läuft, ob als App oder im Browser und über welche Adresse.',go:'admin',r:'admin'},
    {ic:'💬',t:'Update-Nachricht per WhatsApp',d:'Mit einem Tipp eine fertige Nachricht an alle, die noch hängen. Auf Wunsch mit Anmelde-Link, der direkt in die neueste Version führt, ohne Passwort.',r:'admin'}
   ]},
  {id:'0.35',v:'0.35',datum:'2026-09-30',titel:'Helferpool mit QR-Code',kurz:'Wer helfen will, scannt den QR-Code, trägt sich mit Namen und Handynummer ein und kommt danach direkt in die WhatsApp-Gruppe. So wissen wir bei jeder Nummer, wer dahinter steckt.',
   punkte:[
    {ic:'📱',t:'Erst eintragen, dann in die Gruppe',d:'Der QR-Code auf dem Aushang führt zu einer kurzen Anmeldung: Name, Geburtsdatum, Handynummer, auf Wunsch E-Mail und wobei man gern hilft. Erst danach kommt der Knopf zur WhatsApp-Gruppe.',go:'orga',r:'team'},
    {ic:'🔎',t:'Nummer prüfen',d:'Unter Aufgaben → Helferpool eine Nummer aus einer Beitrittsanfrage eintippen, und du siehst sofort, wer das ist oder ob sich die Person nicht eingetragen hat.',r:'team'},
    {ic:'📇',t:'Alle als Kontakte',d:'Mit einem Tipp alle Helfer als Kontakte speichern. Dann zeigt WhatsApp in der Gruppe Namen statt Nummern. Die Liste gibt es auch als Tabelle.',r:'team'},
    {ic:'🖨️',t:'Aushang zum Ausdrucken',d:'Der Aushang für die Jahreshauptversammlung mit QR-Code liegt im Helferpool bereit.',r:'admin'}
   ]},
  {id:'0.34',v:'0.34',datum:'2026-09-30',titel:'Banden am Sportplatz',kurz:'Im Partner-Bereich gibt es jetzt den Reiter „Banden“: jede Bande mit Foto, Maßen und Zustand, dazu der Standard für neue Banden und wer sich darum kümmert.',
   punkte:[
    {ic:'🪧',t:'Alle Banden auf einen Blick',d:'Jede Bande am Platz mit Foto, Firma und Lage. Oben steht, wie viele erneuert werden sollten und bei wie vielen wir den Partner noch fragen müssen.',go:'sponsoring',r:'partner'},
    {ic:'📏',t:'Einheitlicher Standard',d:'Neue Banden: 500 × 80 cm aus zwei Platten à 250 × 80 cm, 3 mm Aluminiumverbund. Der Druck hält 7 bis 10 Jahre, danach werden die Platten neu beklebt.',r:'partner'},
    {ic:'👤',t:'Zuständig für Banden',d:'Benjamin Steinmaus kümmert sich um die Banden, in Absprache mit uns und den Partnern. Er steht jetzt auch bei den Zuständigkeiten.',r:'partner'}
   ]},
  {id:'0.33',v:'0.33',datum:'2026-09-29',titel:'Immer die neueste Version',kurz:'Die App holt sich neue Versionen jetzt von selbst, sobald sie geöffnet oder zurückgeholt wird. Neu laden oder App schließen ist nicht mehr nötig.',
   punkte:[
    {ic:'🔄',t:'Updates kommen von selbst',d:'Beim Öffnen, beim Zurückholen und alle paar Minuten schaut die App nach einer neuen Version und lädt sie sofort. Tippst du gerade etwas ein, wartet sie, bis du fertig bist.'},
    {ic:'👇',t:'Nach unten ziehen',d:'In der installierten App oben einfach nach unten ziehen: Die App prüft auf eine neue Version und lädt alle Daten frisch.',go:'home'},
    {ic:'✅',t:'Du siehst, dass es geklappt hat',d:'Nach einem Update steht kurz „Aktualisiert auf Beta …“ unten im Bild.'}
   ]},
  {id:'0.32',v:'0.32',datum:'2026-09-29',titel:'Immer Partner, nie Sponsor',kurz:'Aus „Sponsoring“ wird überall „Partner“. Das Partnersheet 2027/28 liegt jetzt in der App zum Weitergeben, die Preise stimmen überall mit dem Sheet überein, und alle Vereinsformulare sind komplett.',
   punkte:[
    {ic:'🤝',t:'Partner statt Sponsor',d:'In der Seitenleiste, in den Checklisten und in allen Texten heißt es jetzt Partner. Aus „Sponsor of the Day“ wird „Partner des Tages“, aus Sponsorenbanden Partnerbanden.',r:'team'},
    {ic:'📑',t:'Partnersheet 2027/28',d:'Das Partnersheet ist nachgebaut, gestochen scharf und mit echtem Text. Im Partner-Bereich oben ansehen und mit einem Tipp per WhatsApp oder Mail weitergeben.',r:'team'},
    {ic:'💶',t:'Richtige Partnerpreise',d:'Partner des Tages kostet je nach Stufe 189, 169 oder 149 €, beim 1896 Partner ist ein Heimspiel inklusive. Bei drei Saisons ist die Standard-Werbebande dabei. Der Partnervertrag rechnet genauso.',r:'team'},
    {ic:'📄',t:'Rechnungsvorlage und Formularmappe',d:'F-09 Rechnungsvorlage und die ausfüllbare Formularmappe mit allen zwölf Formularen sind jetzt bei den Formularen dabei.',go:'orga'},
    {ic:'📁',t:'Vereins-Drive verbinden',d:'Solange der Drive noch nicht verbunden ist, steht oben bei den Aufgaben und im Admin-Bereich ein großer Knopf dafür. Danach legt ein Tipp alle Formulare und das Partnersheet in den Drive.',go:'orga',r:'admin'}
   ]},
  {id:'0.31',v:'0.31',datum:'2026-09-29',titel:'Aufgaben: Checklisten zum Abhaken',kurz:'Jedes Heimspiel und jede Veranstaltung hat jetzt eine Checkliste. Abhaken wie auf einem Einkaufszettel, Aufgaben verteilen, im kleinen Chat absprechen und Fotos direkt in den Vereins-Drive legen.',
   punkte:[
    {ic:'✅',t:'Abhaken mit einem Tipp',d:'Großer Kreis links antippen, fertig. Erledigtes rutscht nach unten, der Fortschritt steht oben. Ist alles erledigt, gibt es ein kleines Feuerwerk.',go:'orga'},
    {ic:'➕',t:'Neue Aufgabe in Sekunden',d:'Oben eintippen und bestätigen. Die Aufgabe kommt beim nächsten Mal automatisch wieder auf die Liste, die Vorlagen merken sich alles für die kommenden Jahre.',go:'orga'},
    {ic:'👥',t:'Verantwortliche und Helfer',d:'Jede Aufgabe bekommt eine Person, auch Helfer ohne App. Die bekommen ihren eigenen Link per WhatsApp und haken dort ab.',go:'orga'},
    {ic:'💬',t:'Absprache und Fotos',d:'Unter jeder Checkliste ein kleiner Chat mit Namen. Fotos und Dateien landen sortiert im Vereins-Drive, der passende Ordner wird automatisch angelegt.',go:'orga'},
    {ic:'🔔',t:'Erinnerungen',d:'Am Vorabend eine Nachricht mit allem, was noch offen ist, und kurz vor jeder Aufgabe eine Erinnerung an die zuständige Person.',go:'orga'},
    {ic:'📋',t:'Genau unsere Heimspiel-Checkliste',d:'Die Heimspiel-Liste ist das Vereinsformular F-07, Punkt für Punkt, mit den Zuständigen aus dem Abteilungskonzept schon eingetragen.',go:'orga'},
    {ic:'🕒',t:'Helfer-Schichtplan',d:'Wie Formular F-10: Kasse, Ausschank, Grill, Kaffee & Kuchen und mehr. Eintragen mit einem Tipp, eine Stunde vorher kommt die Erinnerung.',go:'orga'},
    {ic:'💶',t:'Kassenabrechnung in der App',d:'Formular F-06 zum Ausfüllen: Eintritt, Bewirtung, Ausgaben. Die App rechnet, hakt den Punkt ab und macht ein PDF im Vereinsdesign.',go:'orga'},
    {ic:'⭐',t:'Partner des Tages',d:'Beim Heimspiel einen Partner des Tages festlegen, die sechs Leistungen aus dem Partnersheet kommen als Aufgaben auf die Liste.',go:'orga',r:'team'},
    {ic:'📄',t:'Alle Vereinsformulare',d:'Aufnahmeantrag, Foto-Einwilligung, Notfallbogen, Auslagen und mehr, jeweils dort, wo man sie braucht.',go:'orga'},
    {ic:'📅',t:'Automatisch für Heimspiele und Termine',d:'Heimspiele der Ersten, Zweiten und Jugend, Kerwe, Weihnachten, Turniere, Jahreshauptversammlung und Neujahrsempfang bekommen ihre Liste von selbst. Im Kalender führt „Checkliste“ direkt hin.',go:'kalender'}
   ]},
  {id:'0.30',v:'0.30',datum:'2026-09-29',titel:'Meldung antippen, aktualisieren, fertig',kurz:'Meldet der Server-Checker „Daten nicht aktuell“, steht jetzt direkt in der Nachricht ein großer Knopf „Jetzt aktualisieren“. Ein Tipp holt die fehlenden Daten, prüft nach und zeigt in Worten, ob alles wieder stimmt.',
   punkte:[
    {ic:'🔄',t:'Jetzt aktualisieren',d:'In der Nachricht selbst: der Abgleich startet sofort, die App lädt die neuen Daten ohne Neustart und sagt „Erledigt“ oder was noch offen ist.',r:'admin'},
    {ic:'🩺',t:'Schon erledigt?',d:'Öffnest du eine ältere Meldung, steht gleich da, wenn das Problem inzwischen von selbst gelöst ist. Was ein Abgleich nicht lösen kann, lässt sich mit „Jetzt nachprüfen“ prüfen.',r:'admin'}
   ]},
  {id:'0.29',v:'0.29',datum:'2026-09-29',titel:'Mannschaften neu geordnet',kurz:'Unter „Mannschaften“ stehen jetzt 1. Mannschaft, 2. Mannschaft, SOMA & Inaktive und Eigene Jugend, auf Handy, Tablet und im Browser gleich. Die 2. Mannschaft hat dieselben Reiter wie die Erste.',
   punkte:[
    {ic:'👥',t:'1. und 2. Mannschaft',d:'Spieler, Training, Spiele, Verletzungen, Abwesenheiten, Materialdienst, Abstimmungen und Massenpflege, jeweils nur mit den Spielern der Stammmannschaft. Oben in der Reiterleiste schaltest du um.',go:'mann1',r:'team'},
    {ic:'⚽',t:'Spiele laufen von selbst ein',d:'Vergangene und bevorstehende Spiele kommen aus FuPa und fussball.de, auch Freundschaftsspiele. Spiel antippen: Ergebnis, Torschützen, Karten und die Bewertung an einem Ort. Widersprechen sich die Quellen, steht ein Hinweis am Spiel.',go:'mann1',r:'team'},
    {ic:'✅',t:'Training in Sekunden',d:'Einheit: Eindruck positiv, neutral oder negativ. Spieler: Da oder Fehlt, Eindruck und auf Wunsch eine Notiz. Keine Gründe, kein Details-Editor mehr.',go:'mann1',r:'team'},
    {ic:'👁️',t:'Eye-Test erklärt',d:'In der Massenpflege steht je Kategorie, was welcher Wert bedeutet, dazu höchster, niedrigster und Durchschnittswert der Mannschaft.',r:'team'},
    {ic:'🔢',t:'Rückennummer',d:'Groß im Profil. In der Suche findet „Fürth 15“ alle Fürther Mannschaften und alle Spieler mit der 15 aus den FuPa-Kadern.',r:'scout'},
    {ic:'📲',t:'Profil teilen',d:'Im Profil auf „Teilen“: per WhatsApp oder als Link. Der Empfänger landet nach der Anmeldung direkt im Profil und sieht nur, was er sehen darf.',r:'team'},
    {ic:'🌱',t:'Eigene Jugend und A-Jugend',d:'Nur noch die Jugendmannschaften. Die A-Jugend lässt sich von fussball.de übernehmen, neue Spieler stehen mit „(u)“ für unbestätigt da und bestätigen sich selbst über ihren Link oder lassen sich löschen.',go:'teams',r:'team'}
   ]},
  {id:'0.28',v:'0.28',datum:'2026-09-29',titel:'Letzte veröffentlichte Einsätze',kurz:'Im Gegnercheck siehst du die zuletzt veröffentlichten FuPa-Aufstellungen: Startelf, Einsatzminuten, wer laut Spielstatistik ein- oder ausgewechselt wurde, und wer in der neueren Liste nicht mehr genannt ist.',
   punkte:[
    {ic:'📝',t:'Letzte veröffentlichte Einsätze',d:'Je Spiel mit Datum, Quelle und Prüfzeit. Unbekannte Minuten bleiben unbekannt, eine Wechselminute wird nicht geraten.',go:'gegner',r:'scout'},
    {ic:'🔍',t:'Unterschied zwischen zwei Aufstellungen',d:'„In der neueren veröffentlichten Aufstellung nicht genannt“ ist nur ein Listenunterschied, keine Abwesenheit, Verletzung oder Sperre. Bei unvollständigen Listen bleibt der Vergleich offen.',go:'gegner',r:'scout'},
    {ic:'⚡',t:'Aktualisiert sich selbst',d:'Neue oder korrigierte Spielberichte erscheinen ohne Neuladen.',r:'scout'}
   ]},
  {id:'0.27',v:'0.27',datum:'2026-09-29',titel:'Gegner-Spielberichte von FuPa',kurz:'Im Gegnercheck stehen jetzt auch die FuPa-Spielberichte des Gegners: Karten mit Namen, die Verteilung der Startelf-Positionen und ob eine Aufstellung überhaupt veröffentlicht wurde.',
   punkte:[
    {ic:'🟥',t:'Karten mit Namen',d:'Gelb-Rot und Rot aus den FuPa-Spielberichten mit dem veröffentlichten Namen und der Minute. Eine Sperrenliste ist das nicht.',go:'gegner',r:'scout'},
    {ic:'📋',t:'Positionsverteilung statt Formation',d:'Wie viele Torhüter, Abwehr-, Mittelfeld- und Angriffsspieler in der Startelf standen, laut veröffentlichter Position. Eine bestätigte Formation gibt es nicht.',go:'gegner',r:'scout'},
    {ic:'🧭',t:'Eigene und fremde Spiele sauber getrennt',d:'Spiele anderer Mannschaften erscheinen nur im Gegnercheck, nie in deinem Kalender oder bei unseren Ergebnissen.',r:'team'}
   ]},
  {id:'0.26',v:'0.26',datum:'2026-09-28',titel:'Gegnercheck mit Spielberichten',kurz:'Der Gegnercheck zeigt jetzt den ganzen Saisonverlauf des Gegners: jeder Spieltag mit Wappen und Ergebnis, antippen öffnet den Spielbericht mit Toren, Minuten, Karten, Wechseln und Aufstellungen.',
   punkte:[
    {ic:'📈',t:'Formkurve zum Antippen',d:'Tabellenplatz oder Form je Spieltag, mit dem Wappen des jeweiligen Gegners. Ein Tipp öffnet den Spielbericht.',go:'gegner',r:'team'},
    {ic:'⚽',t:'Spielberichte aller Ligaspiele',d:'Wer wann getroffen hat, Strafstöße, Eigentore, Karten und Wechsel mit Minute, dazu beide Aufstellungen mit Spielzeit. Für Kreisliga A und D2.',go:'gegner',r:'team'},
    {ic:'🟥',t:'Sperren und fehlende Stammspieler',d:'Platzverweis im letzten Spiel des Gegners mit Minute. Stammspieler, die zuletzt nicht im Kader standen, ohne Grund und ohne Vermutungen.',go:'gegner',r:'team'},
    {ic:'⏱️',t:'Wann fallen die Tore?',d:'Tore und Gegentore je Viertelstunde, Torschützen mit Minuten, häufigste Startelf, Verhalten nach Führung und Rückstand, gemeinsame Gegner.',go:'gegner',r:'team'}
   ]},
  {id:'0.25',v:'0.25',datum:'2026-09-28',titel:'Termine für alle, Wappen gestochen scharf',kurz:'Ein Kalender mit allen Spielen der Ersten, Zweiten, SOMA und Jugend, allen Veranstaltungen und Geburtstagen. Unten wählst du, was du siehst. Mit einem Tipp in deinen Handy-Kalender oder an Freunde geteilt.',
   punkte:[
    {ic:'📅',t:'Termine für alle',d:'Neu unter „Termine“: Spiele, Veranstaltungen und Geburtstage in Liste oder Monat. Unten tippst du an, was du sehen willst, zum Beispiel deine Jugendmannschaft. Die App merkt sich das.',go:'kalender'},
    {ic:'🔔',t:'Im Handy-Kalender',d:'„In meinen Kalender“ abonniert deine Auswahl. Neue oder verlegte Spiele landen dann von selbst in deinem Kalender. Jeder Termin geht auch einzeln als Datei.',go:'kalender'},
    {ic:'📣',t:'Teilen für mehr Zuschauer',d:'Bei jedem Spiel und jeder Veranstaltung auf „Teilen“ tippen: fertiger Text für WhatsApp, Instagram oder Facebook. Der Spielplan für Fans lässt sich ohne Anmeldung abonnieren.',go:'kalender'},
    {ic:'🛡️',t:'Wappen gestochen scharf',d:'Alle Vereinswappen sind jetzt transparent und hochgerechnet, unser eigenes Logo erscheint in voller Qualität.'},
    {ic:'🎪',t:'Veranstaltungen seit 2022',d:'Kerwe, Adventsmarkt, Abschlussfahrten und mehr aus dem Drive übernommen, mit Helferplänen. Anlegen und ändern dürfen Admin, Vorstand und freigeschaltete Personen.',r:'team'}
   ]},
  {id:'0.24',v:'0.24',datum:'2026-09-28',titel:'Vorstand und Ziele, SOMA, Datenschutz für Eltern',kurz:'Unter Verein steht jetzt, wer was macht: Bereiche mit Verantwortlichen, Aufgaben und Helfern, Treffen, Grundsätze und die Ziele bis 2030. Dazu SOMA als eigene Mannschaft, vorgemerkte Trainer zum Einladen und ein Datenschutztext für die Eltern.',
   punkte:[
    {ic:'🧭',t:'Vorstand und Ziele',d:'Verein → Vorstand & Ziele: Namen eintippen und sehen, wer wofür zuständig ist. Jeder Bereich zeigt Aufgaben, Helfer und springt direkt in den passenden Teil der App. Die Ziele bis Juni 2030 hakt der Vorstand ab, sobald sie erreicht sind.',go:'verein'},
    {ic:'🔑',t:'Passwort vergessen',d:'Du bekommst jetzt einen Code per E-Mail, gibst ihn ein und legst direkt ein neues Passwort fest. Kein Link mehr nötig.'},
    {ic:'🧒',t:'Trainer vorgemerkt',d:'Unter Verwaltung → Mannschaften stehen die Trainer aus der Ausrüstungsliste schon drin. „Einladen“ füllt das Formular aus, es fehlt nur noch die E-Mail.',r:'admin',go:'admin'},
    {ic:'🛡️',t:'Datenschutz für Eltern',d:'In der Abstimmung gibt es einen fertigen Text für die Eltern-Gruppe. Antworten werden nach 180 Tagen automatisch gelöscht, auf Wunsch sofort über „Eltern-Angaben löschen“ beim Kind.',r:'team',go:'teams'},
    {ic:'⚽',t:'SOMA',d:'SOMA hat jetzt einen eigenen Mannschaftsbereich wie die Zweite und die Jugend.',r:'team',go:'teams'}
   ]},
  {id:'0.23',v:'0.23',datum:'2026-09-28',titel:'Rechte je Person, Zweite und Jugend, Wischen überall',kurz:'Jede Person bekommt genau die Bereiche, die sie braucht. Zweite und alle Jugendmannschaften haben einen eigenen Teambereich mit Kader, Terminen, Aufstellung, Statistik, Entwicklung und Abstimmung per Gruppenlink. Listen lassen sich wischen.',
   punkte:[
    {ic:'🔐',t:'Bereiche je Person',d:'Unter Verwaltung schaltet der Admin je Person Bereiche und Unterbereiche an oder aus, zum Beispiel Scouting aus, Kontaktdaten aus, eine Jugendmannschaft dazu. Was von der Rolle abweicht, ist markiert. Neue Bereiche bekommen automatisch nur Admin und Vorstand.',r:'admin',go:'admin'},
    {ic:'👥',t:'Zweite und Jugend',d:'Jede Mannschaft hat ihren eigenen Bereich: Kader je Saison, Termine mit Anwesenheit und Eindruck, Aufstellung, Statistik, Entwicklungsziele mit offiziellen DFB-Übungen und eine Akte je Spieler über alle Jahre. F- bis Minikicker bekommen die leichte Variante.',r:'team',go:'teams'},
    {ic:'🧒',t:'Jugendtrainer einladen',d:'Rolle „Jugendtrainer“ mit Mannschaft und Funktion (Haupttrainer, Co-Trainer, Betreuer). Sie sehen nur ihre Mannschaft, keine Daten der Ersten.',r:'admin',go:'admin'},
    {ic:'📲',t:'Zu- und Absagen per Gruppenlink',d:'Ein Link für die Eltern-Gruppe: Namen des Kindes antippen, zu- oder absagen, mit Grund. Keine Nummern oder Mails von Kindern. Ab der C-Jugend an, darunter freiwillig.',r:'team',go:'teams'},
    {ic:'👉',t:'Wischen',d:'Bedarf: Kandidat nach links = nächste Stufe, nach rechts = raus. Vorschläge nach links = übernehmen. Teams: Spieler, Termine und Ziele lassen sich ebenso wischen. Alles mit Rückgängig.',r:'team'}
   ]},
  {id:'0.22',v:'0.22',datum:'2026-09-28',titel:'Mannschaft, Spiele und Spielerprofil überarbeitet',kurz:'Training und Spiele mit Eindruck Positiv, Neutral, Negativ, Spiele in Vergangene, Bevorstehende und Statistik, Quellen je Einheit und Spiel, Abwesenheiten mit Zeitstrahl, PlayStyles, ein neuer MScore und Planung je Halbserie.',
   punkte:[
    {ic:'👍',t:'Eindruck statt Noten',d:'Training und Spiel bewertest du nur noch mit Positiv, Neutral oder Negativ, für die Einheit und je Spieler, dazu eine Notiz. Keine Position mehr im Training, kein „Details“.',r:'team',go:'training'},
    {ic:'⚽',t:'Spiele neu',d:'Drei Reiter: Vergangene, Bevorstehende (aus FuPa und fussball.de) und Statistik. Jedes Spiel zeigt Quelle und was fehlt. Bewerten: Gesamteindruck, je Spieler Einsatz (Startelf, eingewechselt, Kader, zugeschaut, nicht da) und Eindruck. Startelf und Wechsel sind vorausgefüllt.',r:'team',go:'gstat'},
    {ic:'ℹ️',t:'Woher kommt jede Zahl?',d:'Jede Spalte erklärt sich beim Überfahren, alle Kennzahlen stehen unter Wissen → Kennzahlen. Das Info-i an Training und Spielen zeigt Quellen, Vorrang, Lücken und Widersprüche, etwa zwischen Anwesenheitsliste und App.',r:'team'},
    {ic:'📋',t:'Mannschaft und Extern',d:'„Keine Mannschaft, aber Pass“ ersetzt „Umfeld“, neu ist „Extern“. FuPa-Kader werden geprüft: Wer laut FuPa woanders spielt, steht als Prüffall in der Massenpflege.',r:'scout',go:'pflege'},
    {ic:'🌴',t:'Abwesenheiten mit Übersicht',d:'Eintragen und ändern unter „Abwesenheiten“, dazu eine Übersicht mit Zeitstrahl der Halbserie je Mannschaft.',r:'team',go:'abwesend'},
    {ic:'🧤',t:'Massenpflege aufgeräumt',d:'Mannschaft und Position zuerst, Mannschaftsteil passend zur Position, Torwart-Eye-Test mit Hechten, Ballsicherheit, Abschlag, Stellungsspiel und Reflexe, PlayStyles wie in EA SPORTS FC 26 statt Skills, Rolle und Charakter.',r:'team',go:'pflege'},
    {ic:'📈',t:'MScore und Karte',d:'Einsatz und Leistung aus der laufenden und den drei letzten Spielzeiten, Leistung nach Mannschaftsteil, ohne Mannschaft und Form. Eigene Spieler zusätzlich mit Trainings- und Spielleistung. Die Karte zeigt genau diese Bausteine und die Treue in Bronze, Silber oder Gold.',r:'scout'},
    {ic:'🗓️',t:'Planung je Halbserie',d:'Kaderplanung, Traumelf und Profil planen jetzt bis zur Rückrunde der übernächsten Saison, Halbserie für Halbserie. Kaderplanung und Gespräche sind ein Bereich, das Profil zeigt nur das Ergebnis.',r:'scout',go:'kader'}]},
  {id:'0.21',v:'0.21',datum:'2026-09-28',titel:'Push-Nachrichten und Server-Checker',kurz:'Ein Tipp auf eine Push-Nachricht öffnet genau diese Nachricht, mit allem, worum es geht. Dazu prüft der Server alle 10 Minuten, ob alle Daten sauber ankommen.',
   punkte:[
    {ic:'🔔',t:'Push öffnet genau die Nachricht',d:'Tippst du auf eine Push-Nachricht, siehst du genau diese Nachricht mit vollem Text. Bei Radar-Tipps und Talenten gleich die Spieler mit Profil, bei Spieltag-Updates den Spieler, beim KI-Auftrag das Ergebnis. Auch auf der Übersicht öffnet die Meldungskarte die Nachrichten selbst.',r:'team'},
    {ic:'🩺',t:'Checker in der Qualitätsleiste',d:'Neuer Punkt „Server-Checker“: grün, wenn alles passt, sonst mit Klartext, was fehlt oder hängt. Ein Tipp zeigt alle Prüfungen mit Uhrzeit und den Stand des Datenabrufs.',r:'scout',go:'scout'},
    {ic:'💾',t:'Speicher im Blick',d:'Wird die Datenbank knapp, kommt eine Vorwarnung. Ist sie voll, sagt der Checker, dass der Datenabruf pausiert und wie viele Seiten warten.',r:'scout'},
    {ic:'🔔',t:'Meldung an Admins',d:'Fehlende oder abweichende Datensätze, veraltete Prüfberichte, voller Speicher oder ein stehender Datenabruf lösen nach 15 Minuten eine Meldung aus. Reine Quellenlücken stehen nur als Info drin.',r:'admin'},
   ]},
  {id:'0.20',v:'0.20',datum:'2026-09-27',titel:'Datenqualität und richtige Saison',kurz:'Jeder Spieler steht mit der Mannschaft und Liga der laufenden Saison drin, belegt aus Kader oder Einsätzen. Alte Werte bleiben bei ihrer Saison, fehlende Werte bleiben unbekannt.',
   punkte:[
    {ic:'📍',t:'Aktuelle Zuordnung belegt',d:'Verein, Mannschaft und Liga kommen aus der laufenden Saison (Kader oder Einsätze). Aufsteiger wie in die Verbandsliga verlieren ihre Zuordnung nicht mehr durch die Suchligen.',r:'scout',go:'scout'},
    {ic:'🗂',t:'Stationen im Profil',d:'Neuer Abschnitt „FuPa-Stationen & Datenlage“: jede Saison und Mannschaft einzeln, SV/BSC-Einsätze getrennt nach 1. und 2. Mannschaft, „–“ heißt unbekannt.',r:'scout'},
    {ic:'🔁',t:'Wechsel-Index statt Prozent',d:'Die Wechselchance aus öffentlichen Signalen ist eine Heuristik und steht jetzt als Index ohne Prozentzeichen da.',r:'scout'},
    {ic:'🏅',t:'MVP klar getrennt',d:'MVP der Quelle, von Hand eingetragener MVP und das experimentelle Modell stehen getrennt im Profil.',r:'scout'},
    {ic:'🛡',t:'Datenqualität sichtbar',d:'Oben im Spielermarkt: Übertragung geprüft, Quelle vollständig, Anzeige abgenommen. Drei eigene Prüfungen, keine Gesamtnote.',r:'scout',go:'scout'},
   ]},
  {id:'0.19',v:'0.19',datum:'2026-09-27',titel:'Spielersuche und Im Blickfeld',kurz:'Spieler blitzschnell finden, auch mit Tippfehlern und auch alle FuPa-Spieler der Region. Dazu dein persönliches Blickfeld mit Wochenbericht.',
   punkte:[
    {ic:'🔎',t:'Suche beim Tippen',d:'Vorschläge ab dem ersten Buchstaben, mit Verein, Wappen und Bild. Vor- oder Nachname, Reihenfolge und Umlaute egal, bei Vertippern kommt „Meintest du“. Am Handy über die Lupe oben.',r:'team'},
    {ic:'🌍',t:'Alle FuPa-Spieler der Region',d:'Auch Spieler, die noch nicht in der App sind, tauchen in der Suche auf (nur FuPa). Ein Tipp zeigt ihre Saisons mit Spielen, Minuten, Toren und dem Tabellenplatz ihres Teams.',r:'scout'},
    {ic:'👁',t:'Im Blickfeld',d:'Jeder hat seine eigene Beobachtungsliste, geordnet vom Torwart bis zum Sturm. Mit dem Auge in der Suche oder im Profil hinzufügen. Montags kommt dein Wochenbericht nur mit deinen Spielern: Spiele, Minuten, Tore oder kein Einsatz.',r:'scout',go:'blick'},
    {ic:'🎉',t:'Ehrungen verpasst keiner mehr',d:'Ein Jubiläum erscheint 3 Spiele vorher auf der Übersicht. Wegwischen geht, 1 Spiel vorher kommt es trotzdem noch einmal.',r:'team'},
    {ic:'↩️',t:'Rückkehrer-Radar zum Wischen',d:'Ehemalige im Verein-Bereich: nach rechts heißt kein Interesse, nach links interessiert (Merkliste).',r:'scout'},
    {ic:'🤖',t:'Co-Trainer schlägt selbst nach',d:'Nennst du einen Namen, sucht er sofort in der Datenbank, auch mit Tippfehler, und antwortet mit echten Werten. Statt im Kreis zu fragen, bietet er Profil und Blickfeld direkt an.',r:'team'},
   ]},
  {id:'0.18',v:'0.18',datum:'2026-09-27',titel:'Mannschaft neu geordnet',kurz:'Eine Spielerliste mit eigenen Ansichten, die Massenpflege für alle Spielerdaten und klare Reiter für Training, Spiele, Abwesenheiten und Materialdienst.',
   punkte:[
    {ic:'🗂️',t:'Massenpflege',d:'Fuß, Eye-Test, Position, Mannschaft, Kontaktdaten, Geburtsdatum, Skills, Größe und Gewicht: alle internen Spieler untereinander bearbeiten und mit einem Tipp speichern. Profile zeigen die Daten nur noch an, „Spielerdaten pflegen“ springt direkt hierher.',r:'team',go:'pflege'},
    {ic:'👥',t:'Eine Spielerliste, eigene Ansichten',d:'Statt fester Ansichten wie Trainer oder Kontakte stellst du Spalten, Filter und Sortierung selbst ein und speicherst sie als eigene Ansicht, auf jedem Gerät.',r:'team',go:'spieler'},
    {ic:'✅',t:'Training: Da oder Fehlt',d:'Die Einheiten zeigen nur noch Trainings. Wer zu spät kam, ist da und bekommt die Notiz „zu spät“. Die Notiz zur Einheit steht direkt unter der Trainingsnote, die Statistik ist reine Auswertung.',r:'team'},
    {ic:'⚽',t:'Spiele mit Statistik',d:'Die Spiele der laufenden Saison und daneben die Auswertung: Bilanz, Form, Einsätze, Minuten, Tore und Vorlagen je Spieler.',r:'team',go:'gstat'},
    {ic:'🌴',t:'Abwesenheiten und Materialdienst',d:'Beide haben jetzt einen eigenen Reiter. Neu ist die Mannschaft „Umfeld“ für Spieler mit Pass, die nicht regelmäßig spielen.',r:'team',go:'abwesend'},
   ]},
  {id:'0.16',v:'0.16',datum:'2026-09-26',titel:'Daten live aktuell',kurz:'Ändern sich Daten oder kommen neue FuPa-Werte, sieht die App das sofort. Kein Neuladen nötig.',
   punkte:[
    {ic:'⚡',t:'Ohne Neuladen aktuell',d:'Korrekturen im Datenbestand und neue FuPa-Werte erscheinen von selbst, auch in einem gerade offenen Profil. War das Handy kurz offline, holt die App Verpasstes beim Wiederverbinden nach.',r:'team',go:'home'},
    {ic:'📍',t:'Liga immer aus der richtigen Saison',d:'Aktuelle Liga, Ligaabstand und Wechselbegründung kommen aus der laufenden Saison. Die Verbandsliga ist jetzt eine eigene Liga. Gründe aus der Vorsaison sind mit 25/26 gekennzeichnet.',r:'scout'},
   ]},
  {id:'0.15',v:'0.15',datum:'2026-09-26',titel:'Spieler-Abgleich zum Wischen',kurz:'Wo die App nicht sicher ist, welcher FuPa-Spieler zu welchem Spieler gehört, entscheidest du jetzt mit einem Wisch. Einmal, dann gilt es dauerhaft.',
   punkte:[
    {ic:'👈',t:'Nach links: bestätigen',d:'Stimmt der Vorschlag, nach links wischen oder „Bestätigen“ tippen. Die Werte stehen sofort im Profil, im MScore und in der Bestenliste und bleiben so, auch nach jedem neuen Abgleich.',r:'scout',go:'radar'},
    {ic:'👉',t:'Nach rechts: ignorieren',d:'Ist es ein anderer Spieler, nach rechts wischen. Das Paar kommt nie wieder. Findet die App gar nichts, suchst du den Spieler selbst oder blendest ihn für FuPa aus. Alles lässt sich zurücknehmen.',r:'scout'},
    {ic:'📍',t:'Aktuelle Liga statt Vorjahr',d:'Startseite, Profil und Wechselchance zeigen jetzt die Liga der laufenden Saison. Wo es noch keine aktuellen Daten gibt, steht „Stand 25/26“ dran, bei Platz 1 oder 2 mit „vermutlich aufgestiegen“.',r:'scout'},
    {ic:'🗓️',t:'Neue Saison stellt sich selbst um',d:'Nach der Sommerpause erkennt die App die neue Saison am Spielplan, sobald das erste Spiel höchstens 14 Tage entfernt ist. Radar, Beobachtungen und Spieltag zählen dann automatisch die neue Saison.',r:'scout'},
    {ic:'🔑',t:'Gegenprobe mit dem Leseschlüssel',d:'Jeder Abgleich prüft über die KLA-API, ob Schlüssel, Datenbasis und Stand passen, und zeigt, ob die Quelle gerade noch nachlädt.',r:'admin'},
   ]},
  {id:'0.14',v:'0.14',datum:'2026-09-26',titel:'Zahlen von FuPa, automatisch',kurz:'Einsätze, Minuten, Tore, Vorlagen und der MVP von FuPa kommen jetzt von selbst in die App. Nichts muss eingetippt oder bestätigt werden.',
   punkte:[
    {ic:'📊',t:'Zahlen im Spielerprofil',d:'Im Profil steht jetzt „Zahlen von FuPa“ je Saison. Der MVP von FuPa fließt automatisch in den MScore, ein von Hand eingetragener Wert hat weiter Vorrang.',r:'scout'},
    {ic:'🏆',t:'Bestenliste mit echten Einsätzen',d:'Einsätze und Minuten in der Bestenliste kommen aus FuPa, solange für eure Mannschaft keine eigenen Spiele erfasst sind.',r:'scout',go:'best'},
    {ic:'📅',t:'Spieltag trägt sich selbst ein',d:'Gespielte Ligaspiele der Ersten landen mit Ergebnis und Aufstellung in Training → Spiele. Was ihr von Hand erfasst habt, wird nie überschrieben.',r:'team'},
    {ic:'🔭',t:'Gegner-Vorschau und Radar',d:'Vor dem nächsten Spiel zeigt die Vorschau Tabelle, Form und die torgefährlichsten Spieler des Gegners. Im Radar steht, wer diese Woche laut FuPa aufgefallen ist, und beobachtete Spieler melden sich bei neuen Einsätzen.',r:'scout'},
    {ic:'🛡️',t:'Datenwächter',d:'Unter Importstatus steht, wenn etwas hakt. Die Hinweise verschwinden von selbst, sobald die Ursache weg ist.',r:'admin'},
   ]},
  {id:'0.10',v:'0.10',datum:'2026-09-26',titel:'Bestenliste je Position',kurz:'Unter Scouting gibt es jetzt die Bestenliste: die besten Torhüter, Abwehrspieler, Mittelfeldspieler und Stürmer, jeweils mit den Zahlen, die für die Position zählen, und einem Satz, warum einer oben steht.',
   punkte:[
    {ic:'🏆',t:'Wer ist ein super Torwart?',d:'Torhüter und Abwehr werden an den Gegentoren ihrer Mannschaft im Vergleich zur Liga gemessen, mit ihrer Einsatzquote daneben. Wer weniger als die Hälfte spielt, ist als Ersatz markiert.',r:'scout',go:'best'},
    {ic:'⚽',t:'Tore, Tore je Spiel, Anteil',d:'Vorne zählen Tore, Tore je Spiel und der Anteil an den Teamtoren. Tore je Spiel lassen sich ligabereinigt vergleichen, im Maßstab der Kreisliga A.'},
    {ic:'🔎',t:'Filter für die Kaderplanung',d:'Laufende Saison oder 25/26 komplett, Liga, Alter und eigene Spieler ein oder aus. Sortieren nach Stärke, Toren, Einsatz, Eye-Test oder Trainernote.',r:'scout',go:'best'},
    {ic:'📥',t:'Vorlagen und Noten',d:'Vorlagen und Trainernoten erscheinen, sobald sie in der App stehen, zum Beispiel aus euren übernommenen Spielen.',r:'team',go:'training'}]},
  {id:'0.9',v:'0.9',datum:'2026-09-25',titel:'Spielstärke wie bei FIFA',kurz:'Der MScore beschreibt jetzt, wie gut ein Spieler ist, nicht in welcher Liga er gerade spielt. Jede Saison ist ein Beleg, dazu Alter, Erfahrung, Eye-Test und FuPa-MVP. Wer aus einer höheren Liga kommt und unten vorne mitspielt, verliert nicht automatisch.',
   punkte:[
    {ic:'🧮',t:'Jede Saison ein Beleg',d:'Im Spielerprofil steht für 24/25, 25/26 und die laufende Saison je ein Wert: Liga-Niveau, Rolle, Leistung im Vergleich zu Spielern derselben Liga und Position, Mannschaft, Ausnahmeleistung, FuPa-MVP und Elf der Woche. Daneben, wie stark die Saison zählt.',r:'team',go:'training'},
    {ic:'🪜',t:'Kein Ligadeckel mehr',d:'Ein 80er aus der Gruppenliga, der in die A-Liga wechselt und dort Leistungsträger ist, bleibt nahe 80. In einer tieferen Liga kann er nach oben nichts mehr beweisen, das nennt die App Deckeneffekt. Wer dort nur Ergänzung ist, rutscht ab.'},
    {ic:'⏳',t:'Alter und Erfahrung',d:'Bis 24 legt man zu, ab 29 geht es bergab, ab 33 deutlich, auf dem Flügel und außen schneller, innen und im Tor langsamer. Im Profil stehen Potenzial und die Prognose für die nächste Saison.',r:'scout',go:'model'},
    {ic:'🔵',t:'FuPa-MVP direkt im Profil',d:'Den MVP-Wert aus FuPa (Team, Spielerstatistik, Spalte MVP) trägst du im Profil unter dem MScore ein. Er zeigt, wie wichtig einer für sein Team ist, und zählt als Beleg mit. Ganze Teams gehen unter Datenbank.',r:'scout',go:'db'},
    {ic:'👁️',t:'Eye-Test als eigene Messung',d:'Eine Bewertung zählt ungefähr so viel wie eine volle Saison, ab drei Planern mehr als die Daten.',r:'scout',go:'eye'},
    {ic:'📥',t:'Eure Spiele zählen im MScore',d:'Spiele, die ihr unter Training → Spiele übernehmt (zum Beispiel die season.json aus dem FuPa-Auswerter), rechnen bei den eigenen Spielern mit: Minuten, Startelf, Tore, Vorlagen und die Punkte mit und ohne den Spieler.',r:'team',go:'training'}]},
  {id:'0.8',v:'0.8',datum:'2026-09-25',titel:'Neues Rating: die Liga setzt den Rahmen',kurz:'Der MScore ist neu gebaut. Ein Stammspieler der Kreisoberliga liegt jetzt klar vor einem Spieler der Kreisliga D. Innerhalb der Liga entscheiden Einsatz, Leistung im Vergleich zur gleichen Position und die Mannschaft. Wer seine Liga dominiert, kommt über den Rahmen hinaus.',
   punkte:[
    {ic:'🧮',t:'Jeder Wert erklärt',d:'Im Spielerprofil steht Schritt für Schritt: Rahmen der Liga, Einsatz, Leistung, Mannschaft und dann jeder Zu- und Abschlag mit Grund, etwa Trainernoten, frühere höhere Liga oder Alter.',r:'team',go:'training'},
    {ic:'📐',t:'Rahmen je Liga',d:'Gruppenliga 52 bis 82, Kreisoberliga 43 bis 73, Kreisliga A 31 bis 61, B 22 bis 52, C 14 bis 44, D 7 bis 37. Ein typischer Stammspieler liegt in der Kreisoberliga bei 63, in der A-Liga bei 51, passend zur Skala des Eye-Tests.',r:'scout',go:'model'},
    {ic:'⚖️',t:'Fair je Position',d:'Mittelfeldspieler werden nicht mehr an Stürmertoren gemessen, sondern an Mittelfeldspielern derselben Liga. Abwehr und Torwart zählen über die Gegentore der Mannschaft.'},
    {ic:'🚀',t:'Ausnahmeleistung zählt',d:'Wer mehr als ein Tor je Spiel schießt, bekommt bis zu 30 Punkte obendrauf. Ein Stürmer der Kreisliga D mit drei Toren je Spiel landet so um 60.',r:'scout',go:'model'},
    {ic:'👁️',t:'Eye-Test zählt mehr',d:'Eure Bewertung zieht den Wert in ihre Richtung: bei einer Bewertung zu 25 %, bei zwei zu 35 %, ab drei zu 45 %.',r:'scout',go:'eye'},
    {ic:'🏠',t:'Startseite klarer',d:'Die große Zahl ist die Stärke, daneben steht die Wechselchance. Die Mischzahl „Transfer-Chance“ fällt weg.',r:'scout',go:'home'}]},
  {id:'0.7',v:'0.7',datum:'2026-09-25',titel:'Lukas\u2019 Liste komplett, Urlaub und Materialdienst',kurz:'Alle 27 Punkte aus Lukas\u2019 Vorschlägen sind jetzt drin, dazu Urlaub in der Kabine und der Materialdienst: Verfügbarkeit je Zeitraum, freie Plätze direkt in der Liste, eine echte Traumelf, Eye-Test je Kategorie, ein erklärter MScore und ein Änderungsverlauf.',
   punkte:[
    {ic:'🌴',t:'Urlaub in der Kabine',d:'Spieler tragen Urlaub frühzeitig über ihren Kabinen-Link ein. Für jedes Training im Zeitraum sind sie automatisch abgemeldet, bekommen keine Einladung und keine Erinnerung und stehen im Training mit Grund drin. Das Trainerteam kann Urlaub auch selbst eintragen.',r:'team',go:'abst'},
    {ic:'🧺',t:'Materialdienst',d:'Unter Mannschaft → Abstimmungen ein Team für vier Wochen einteilen, Zeitraum frei änderbar, oder die nächsten Teams vorschlagen lassen. Die Eingeteilten sehen es in der Kabine und bekommen zum Start und an Trainingstagen eine WhatsApp-Nachricht.',r:'team',go:'abst'},
    {ic:'🕘',t:'Änderungsverlauf',d:'Bei jedem Spiel und jedem Spieler im Kaderplan steht, wer wann was geändert hat, mit altem und neuem Wert. So bleibt nachvollziehbar, woher eine Zahl kommt.',r:'team',go:'training'},
    {ic:'🗓️',t:'Verfügbarkeit je Zeitraum',d:'Voll, eingeschränkt oder nicht verfügbar, mit Grund. Eingeschränkt zählt in der Abdeckung halb, nicht verfügbar gar nicht. Geplant wird in Wechselperioden: Rückrunde über das Winterfenster, die nächsten Saisons über das Sommerfenster.',r:'scout',go:'kader'},
    {ic:'➕',t:'Freie Plätze in der Liste',d:'Fehlt auf einer Position jemand, steht dort eine Zeile „Freier Platz“ mit Bedarf. Über „+ Spieler“ legst du auch einen offenen Platz an, ohne schon einen Namen zu haben.',r:'scout',go:'kader'},
    {ic:'🌓',t:'Primär und Sekundär',d:'Wer auch in der anderen Mannschaft spielen kann, steht dort ausgegraut und zählt nur einmal. Inaktive und nicht verfügbare Spieler rutschen in die Reserve.',r:'scout',go:'kader'},
    {ic:'🧾',t:'Stand der Planung',d:'Im Menü jedes Spielers auf einen Blick: Systemannahme, Planung, letztes Gespräch und Zusage.',r:'scout',go:'kader'},
    {ic:'🗣️',t:'Anforderungen des Trainers',d:'„Insgesamt mehr Tempo“ oder „ein Sechser, der eröffnet“: solche Wünsche stehen im Bedarf und werden mit einem Tipp zum Suchauftrag.',r:'scout',go:'kader'},
    {ic:'🛟',t:'Backup mit Zweiter und Jugend',d:'In der Backup-Ansicht stehen unter jeder Position ausgegraut auch Spieler aus der Zweiten, der Jugend und mit anderer Hauptmannschaft.',r:'scout',go:'kader'},
    {ic:'✨',t:'Traumelf je Zeitraum',d:'Rückrunde, nächste und übernächste Saison, mit jedem Spieler, auch ohne Zusage. Daneben der Vergleich mit dem Kaderplan und ein Knopf, um mit einem Wunschspieler ein Gespräch festzuhalten.',r:'scout',go:'sxi'},
    {ic:'👁️',t:'Eye-Test je Kategorie',d:'Alle Spieler in einer Kategorie untereinander, mit Höchstem, Niedrigstem und Schnitt. Deine Einschätzung trägst du direkt mit dem Regler ein. Dazu der Filter „Review fällig“ und im Profil erst der Schnitt, die Einzelwerte eingeklappt.',r:'scout',go:'eye'},
    {ic:'📊',t:'MScore erklärt',d:'Jeder Baustein sagt, was er misst und warum er eigenständig ist. Einsatz & Liga rechnet frühere höhere Ligen mit an, Vorlagen zählen halb als Zusatz, und die Form von Abwehr und Torwart kommt aus den Gegentoren.',r:'scout',go:'model'},
    {ic:'❤️',t:'Vereinstreue in fünf Stufen',d:'Von „Am Anfang“ bis „Vereinsikone“, im Profil, in der Spielerliste und ab Stufe drei als Abzeichen auf der Karte.',r:'team',go:'training'},
    {ic:'📋',t:'Spielerliste: Ansicht Scouting',d:'Neue Ansicht mit Mannschaft, MScore, Eye-Test und Datenbasis. Die Spalte Mannschaft zeigt auch, wo einer zusätzlich spielt.',r:'team',go:'training'},
