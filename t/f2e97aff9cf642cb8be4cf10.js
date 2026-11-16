  const kader=()=>{ let L; try{ L=typeof mnIntern==='function'?mnIntern():kbSquadAll(); }catch(e){ L=kbSquadAll(); } const ids=new Set(L.map(p=>p.id)); [...st.sel].forEach(id=>{ if(!ids.has(id)&&trP(id))L.push(trP(id)); });
    return L.slice().sort((a,b)=>(typeof svNachCmp==='function'?svNachCmp(a,b):String(a.name).localeCompare(String(b.name),'de'))); };
  const draw=()=>{ const E=document.getElementById('kbSe'); if(!E)return; const all=kader(), kat=KB.kat.filter(k=>k.aktiv), K=st.einheit==='kasten';
    E.innerHTML=`${kat.length?`<div class="sbsec"><h4>Aus dem Katalog</h4>${KB_KATG.map(g=>{ const X=kbKatSort(kat.filter(k=>kbKatG(k)===g)); return X.length?`<div class="kbkatc"><small>${g}</small><div class="chips">${X.map(k=>`<button type="button" class="pchip${st.kat===k.id?' on':''}" data-k="${k.id}">${svEsc(k.titel)} · ${svEsc(kbKatWert(k))}</button>`).join('')}</div></div>`:''; }).join('')}</div>`:''}
      <div class="kbform"><div class="field"><label>Art</label><select id="kbArt"><option value="strafe"${st.art==='strafe'?' selected':''}>Strafe</option><option value="beitrag"${st.art==='beitrag'?' selected':''}>Beitrag</option></select></div>
        <div class="field"><label>Bezeichnung</label><input id="kbTi" maxlength="120" value="${svEsc(st.titel)}"></div>
        <div class="field"><label>Bezahlt in</label><select id="kbEh"><option value="eur"${K?'':' selected'}>Euro</option><option value="kasten"${K?' selected':''}>Kasten</option></select></div>
        <div class="field"><label id="kbBeL">${K?'Anzahl Kästen':(st.pm?'Grundbetrag (€)':'Betrag (€)')}</label><input id="kbBe" type="number" min="${K?1:0.5}" max="${K?10:500}" step="${K?1:0.5}" inputmode="decimal" value="${svEsc(String(st.betrag))}"></div>
        ${st.pm&&!K?`<div class="field"><label>Minuten zu spät <small>+ ${kbEur(st.pm)} pro Minute</small></label><input id="kbMi" type="number" min="0" max="180" step="1" inputmode="numeric" value="${svEsc(String(st.min))}"></div>`:''}
        <div class="field"><label>Datum</label><input id="kbDa" type="date" value="${svEsc(st.datum)}"></div><div class="field kbwide"><label>Notiz</label><input id="kbNo" maxlength="300" value="${svEsc(st.notiz)}"></div></div>
      <div class="note" id="kbSum">${kbSumme()}</div>
      <div class="sbsec"><h4>Spieler <small>${st.sel.size} ausgewählt</small></h4><div class="chips kbchips">${all.map(x=>`<button type="button" class="pchip${st.sel.has(x.id)?' on':''}" data-pl="${svEsc(x.id)}">${svEsc(x.name)}</button>`).join('')||'<span class="note">Keine Spieler in der Mannschaft.</span>'}</div></div>
      <div class="btnrow sbact"><button class="btn" id="kbSv">Buchen</button><button class="btn ghost" id="kbCa">Abbrechen</button></div>`;
    const keep=()=>{ st.art=document.getElementById('kbArt').value; st.titel=document.getElementById('kbTi').value; st.betrag=document.getElementById('kbBe').value; st.einheit=document.getElementById('kbEh').value; const mi=document.getElementById('kbMi'); if(mi)st.min=mi.value; st.datum=document.getElementById('kbDa').value; st.notiz=document.getElementById('kbNo').value; };
    const sumUp=()=>{ keep(); const n=document.getElementById('kbSum'); if(n)n.textContent=kbSumme(); };
    ['kbBe','kbMi'].forEach(id=>{ const x=document.getElementById(id); if(x)x.oninput=sumUp; });
    document.getElementById('kbEh').onchange=()=>{ keep(); const k=st.kat&&KB.kat.find(x=>x.id===st.kat);
      if(st.einheit==='kasten'){ st.pm=0; st.betrag=k&&kbIstKasten(k)?+k.betrag:1; } else { st.betrag=k&&!kbIstKasten(k)?+k.betrag:''; st.pm=k&&!kbIstKasten(k)?(+k.pro_minute||0):0; } draw(); };
    E.querySelectorAll('[data-k]').forEach(b=>b.onclick=()=>{ keep(); const k=KB.kat.find(x=>x.id===b.dataset.k); st.kat=k.id; st.titel=k.titel; st.betrag=+k.betrag; st.einheit=k.einheit||'eur'; st.pm=kbIstKasten(k)?0:(+k.pro_minute||0); st.min=''; if(/beitrag|geburtstag/i.test(k.kategorie+' '+k.titel))st.art='beitrag'; draw(); });
    E.querySelectorAll('[data-pl]').forEach(b=>b.onclick=()=>{ keep(); const k=b.dataset.pl; if(st.sel.has(k))st.sel.delete(k); else st.sel.add(k); draw(); });
    document.getElementById('kbCa').onclick=()=>closeOverlay();
    document.getElementById('kbSv').onclick=async()=>{ keep(); const K=st.einheit==='kasten', be0=Math.round(parseFloat(String(st.betrag).replace(',','.'))*100)/100, mi=st.pm&&!K?Math.max(0,Math.min(180,parseInt(st.min,10)||0)):0;
      const be=Math.round((be0+mi*st.pm)*100)/100;
      if(!st.titel.trim())return kToast('Bitte eine Bezeichnung angeben');
      if(K?!(Number.isInteger(be0)&&be0>=1&&be0<=10):!(be>0&&be<=500))return kToast(K?'Zwischen 1 und 10 Kästen':'Betrag zwischen 0,50 und 500 €'); if(!st.sel.size)return kToast('Bitte Spieler auswählen');
      const titel=(st.titel.trim()+(mi?` (${mi} Min.)`:'')).slice(0,120);
      const rows=[...st.sel].map(pid=>({art:st.art,player_id:pid,name:(trP(pid)||{}).name||null,titel,betrag:K?be0:be,einheit:st.einheit,team:kbTeamCtx(),datum:st.datum||trToday(),notiz:st.notiz.trim()||null,quelle:'hand'}));
      const b=document.getElementById('kbSv'); b.disabled=true;
      const {error}=await SVB.sb.from('kasse_buchungen').insert(rows); if(error){ b.disabled=false; return kToast('⚠️ '+error.message); } closeOverlay(); await kbLoad(true); kToast(`✓ ${rows.length}× gebucht`); };
  };
  function kbSumme(){ const K=st.einheit==='kasten', be0=parseFloat(String(st.betrag).replace(',','.'))||0, mi=st.pm&&!K?Math.max(0,parseInt(st.min,10)||0):0;
    if(!be0&&!mi)return ''; return 'Je Spieler: '+(K?kbKst(be0):kbEur(be0+mi*st.pm)+(mi?` (${kbEur(be0)} + ${mi} × ${kbEur(st.pm)})`:'')); }
  draw();
}
function kbBuchEditor(pre){
  const P=pre||{};
  svModal(`<div class="mhead"><div class="rm-ic" style="width:46px;height:46px">${SVI('plus')}</div><div><h2 style="margin:0">Geld bewegen</h2><div class="msub">Zuzahlung, Ausgabe, Gebühren oder Umbuchung zwischen den Konten</div></div></div>
    <div class="chips kbpre">${[['Eigene Zuzahlung','einzahlung','bank'],['Bankgebühren','ausgabe','bank'],['PayPal-Gebühr','ausgabe','paypal'],['Kasten für die Kabine','ausgabe','bar'],['PayPal → Bank','umbuchung','paypal','bank'],['Bar → Bank','umbuchung','bar','bank']].map((x,i)=>`<button type="button" class="pchip" data-pre="${i}">${x[0]}</button>`).join('')}</div>
    <div class="kbform"><div class="field"><label>Art</label><select id="kbA2"><option value="ausgabe">Ausgabe</option><option value="einzahlung">Einnahme / Zuzahlung</option><option value="umbuchung">Umbuchung</option></select></div>
      <div class="field"><label id="kbKl">Konto</label><select id="kbK2">${['bank','paypal','bar'].map(k=>`<option value="${k}">${KB_KONTO[k][0]} ${KB_KONTO[k][1]}</option>`).join('')}</select></div>
      <div class="field" id="kbZf" style="display:none"><label>Nach</label><select id="kbZ2">${['bank','paypal','bar'].map(k=>`<option value="${k}">${KB_KONTO[k][0]} ${KB_KONTO[k][1]}</option>`).join('')}</select></div>
      <div class="field"><label>Wofür</label><input id="kbT2" maxlength="120" placeholder="z.B. Kasten Wasser"></div><div class="field"><label>Betrag (€)</label><input id="kbB2" type="number" min="0.01" max="5000" step="0.01" inputmode="decimal"></div>
      <div class="field"><label>Datum</label><input id="kbD2" type="date" value="${trToday()}"></div></div>
    <div class="btnrow sbact"><button class="btn" id="kbS2">Buchen</button><button class="btn ghost" id="kbC2">Abbrechen</button></div>`);
  const $i=id=>document.getElementById(id), PRE=[['Eigene Zuzahlung','einzahlung','bank'],['Bankgebühren','ausgabe','bank'],['PayPal-Gebühr','ausgabe','paypal'],['Kasten für die Kabine','ausgabe','bar'],['Umbuchung PayPal → Bank','umbuchung','paypal','bank'],['Bar eingezahlt','umbuchung','bar','bank']];
  const sync=()=>{ const u=$i('kbA2').value==='umbuchung'; $i('kbZf').style.display=u?'':'none'; $i('kbKl').textContent=u?'Von':'Konto'; };
  const set=x=>{ $i('kbA2').value=x[1]; $i('kbK2').value=x[2]; if(x[3])$i('kbZ2').value=x[3]; $i('kbT2').value=x[0]; sync(); };
  document.querySelectorAll('#modal [data-pre]').forEach(b=>b.onclick=()=>set(PRE[+b.dataset.pre]));
  $i('kbA2').onchange=sync; if(P.art)set([P.titel||'',P.art,P.konto||'bank',P.nach]); if(P.betrag)$i('kbB2').value=P.betrag;
  $i('kbC2').onclick=()=>closeOverlay();
  $i('kbS2').onclick=async()=>{ const art=$i('kbA2').value, t=$i('kbT2').value.trim(), be=Math.round(parseFloat(String($i('kbB2').value).replace(',','.'))*100)/100, k=$i('kbK2').value, z=$i('kbZ2').value, d=$i('kbD2').value||trToday();
    if(!t)return kToast('Bitte angeben, wofür'); if(!(be>0&&be<=5000))return kToast('Betrag zwischen 0,01 und 5.000 €');
    if(art==='umbuchung'&&k===z)return kToast('Von und Nach sind dasselbe Konto');
    const base={titel:t,betrag:be,datum:d,status:'bezahlt',bezahlt_am:trToday(),quelle:art==='umbuchung'?'umbuchung':'hand'};
    const rows=art==='umbuchung'?[Object.assign({},base,{art:'ausgabe',konto:k,titel:t+' (ab '+KB_KONTO[k][1]+')'}),Object.assign({},base,{art:'einzahlung',konto:z,titel:t+' (an '+KB_KONTO[z][1]+')'})]:[Object.assign({},base,{art,konto:k})];
    const {error}=await SVB.sb.from('kasse_buchungen').insert(rows);
    if(error)return kToast('⚠️ '+error.message); closeOverlay(); await kbLoad(true); kToast('✓ Gebucht'); };
}
function kbBuchEdit(id,back){
  const b=KB.buch.find(x=>x.id===id); if(!b)return;
  const who=b.player_id?((trP(b.player_id)||{}).name||b.name):(b.art==='ausgabe'?'Ausgabe':'Einnahme');
  svModal(`<div class="mhead"><div><h2 style="margin:0">${svEsc(b.titel)}</h2><div class="msub">${svEsc(who||'')} · ${TRC.fmt(b.datum)} · ${kbWert(b)}</div></div></div>
    <div class="btnrow sbact">${b.player_id?(kbIstKasten(b)?[['offen','Offen'],['bezahlt:-','Kasten ist da'],['erlassen','Erlassen']]:[['offen','Offen'],['bezahlt:bank','Bezahlt · Bank'],['bezahlt:paypal','Bezahlt · PayPal'],['bezahlt:bar','Bezahlt · Bar'],['erlassen','Erlassen']]).map(([s,t])=>`<button class="btn ${(b.status+(b.status==='bezahlt'?':'+(kbIstKasten(b)?'-':(b.konto||'bank')):''))===s?'':'ghost'}" data-st="${s}">${t}</button>`).join(''):''}
      <button class="btn ghost" id="kbDelB" style="margin-left:auto;color:#fca5a5">Löschen</button></div>`);
  const fin=async()=>{ await kbLoad(true); if(back)back(); else closeOverlay(); };
  document.querySelectorAll('#modal [data-st]').forEach(x=>x.onclick=async()=>{ const [s,k]=x.dataset.st.split(':'); const {error}=await SVB.sb.from('kasse_buchungen').update({status:s,konto:s==='bezahlt'&&k!=='-'?k:null,bezahlt_am:s==='bezahlt'?trToday():null,gemeldet_at:null}).eq('id',id); if(error)return kToast('⚠️ '+error.message); fin(); });
  document.getElementById('kbDelB').onclick=async()=>{ if(!confirm('Buchung löschen?'))return; const {error}=await SVB.sb.from('kasse_buchungen').delete().eq('id',id); if(error)return kToast('⚠️ '+error.message); fin(); };
}
function kbKatEditor(){
  svModal(`<div class="mhead"><div class="rm-ic" style="width:46px;height:46px">${SVI('book')}</div><div><h2 style="margin:0">Strafenkatalog · ${kbTeamT()}</h2><div class="msub">Jede Mannschaft hat ihren eigenen Katalog. Für alle Spieler sichtbar, am besten gemeinsam beschließen</div></div></div><div id="kbKe"></div>`);
  const opt=(L,cur)=>L.map(([v,t])=>`<option value="${v}"${v===cur?' selected':''}>${t}</option>`).join('');
  const KAT_O=KB_KATG.map(g=>[g,g]), EH_O=[['eur','€'],['kasten','Kasten']];
  // 0.99.20: Reihenfolge je Kategorie mit den Pfeilen ändern (Wunsch Julian). Gespeichert wird in kasse_katalog.sort,
  // danach richten sich alle Ansichten: Katalog, Buchen und die Seite für die Mannschaft.
  const zeile=(k,i,X)=>`<div class="kbkrow kbk2 kbmvr" data-id="${k.id}"><span class="kbmv"><button type="button" class="lnk" data-mv="-1" aria-label="${svEsc(k.titel)} nach oben"${i===0?' disabled':''}>↑</button><button type="button" class="lnk" data-mv="1" aria-label="${svEsc(k.titel)} nach unten"${i===X.length-1?' disabled':''}>↓</button></span><input value="${svEsc(k.titel)}" maxlength="80" data-f="titel" aria-label="Bezeichnung">
      <select data-f="kategorie" aria-label="Kategorie">${opt(KAT_O,kbKatG(k))}</select>
      <input type="number" min="0" max="500" step="0.5" value="${+k.betrag}" data-f="betrag" aria-label="Betrag">
      <select data-f="einheit" aria-label="Einheit">${opt(EH_O,k.einheit||'eur')}</select>
      <label class="kbpm" title="Aufschlag pro Minute, z. B. beim Zuspätkommen"><input type="number" min="0" max="50" step="0.5" value="${+k.pro_minute||''}" placeholder="0" data-f="pro_minute"${kbIstKasten(k)?' disabled':''}> €/Min.</label>
      <label class="kbchk"><input type="checkbox" data-f="aktiv"${k.aktiv?' checked':''}> aktiv</label><button class="lnk" data-del="${k.id}" aria-label="Löschen">✕</button></div>`;
  // Geänderte Zeilen speichern (vor Hinzufügen, Löschen und beim Schließen mit „Speichern“)
  const sichern=async E=>{ for(const r of E.querySelectorAll('.kbkrow[data-id]')){ const id=r.dataset.id, k=KB.kat.find(x=>x.id===id); if(!k)continue;
      const v=f=>r.querySelector(`[data-f=${f}]`), t=v('titel').value.trim(), be=parseFloat(v('betrag').value), ak=v('aktiv').checked, kat=v('kategorie').value, eh=v('einheit').value, pm=eh==='eur'?(parseFloat(v('pro_minute').value)||0):0;
      if(eh==='kasten'&&!(Number.isInteger(be)&&be>=1&&be<=10)){ kToast(`„${t}“: bei Kasten eine ganze Zahl von 1 bis 10`); return false; }
      const patch={titel:t,betrag:Math.min(500,be),aktiv:ak,kategorie:kat,einheit:eh,pro_minute:pm>0?Math.min(50,pm):null};
      if(t&&be>=0&&(t!==k.titel||be!==+k.betrag||ak!==k.aktiv||kat!==kbKatG(k)||eh!==(k.einheit||'eur')||(patch.pro_minute||0)!==(+k.pro_minute||0))){ const {error}=await SVB.sb.from('kasse_katalog').update(patch).eq('id',id); if(error){ kToast('⚠️ '+error.message); return false; } } }
    return true; };
  const draw=()=>{ const E=document.getElementById('kbKe'); if(!E)return;
    E.innerHTML=`${KB_KATG.map(g=>{ const X=kbKatSort(KB.kat.filter(k=>kbKatG(k)===g)); return `<h4 class="kbkatg">${g}</h4>${X.map(zeile).join('')||'<div class="note">Noch nichts in dieser Kategorie.</div>'}`; }).join('')}
      <h4 class="kbkatg">Neu</h4><div class="kbkrow kbk2"><input id="kbNt" maxlength="80" placeholder="z. B. Torwarthandschuhe vergessen"><select id="kbNk" aria-label="Kategorie">${opt(KAT_O,'Training')}</select><input id="kbNb" type="number" min="0" max="500" step="0.5" placeholder="Betrag" aria-label="Betrag"><select id="kbNe" aria-label="Einheit">${opt(EH_O,'eur')}</select><label class="kbpm"><input id="kbNp" type="number" min="0" max="50" step="0.5" placeholder="0"> €/Min.</label><button class="btn sm" id="kbAdd">${SVI('plus')} Dazu</button></div>
      <div class="note">Mit den Pfeilen ordnest du die Strafen innerhalb einer Kategorie. So stehen sie dann überall, auch beim Buchen und für die Spieler.</div>
      <div class="note">„€/Min.“ ist ein Aufschlag pro Minute, zum Beispiel beim Zuspätkommen: 5 € plus 1 € je Minute. Beim Buchen trägst du die Minuten ein. Bei „Kasten“ steht der Betrag für die Anzahl Kästen.</div>
      <div class="btnrow sbact"><button class="btn" id="kbKs">Speichern</button><button class="btn ghost" id="kbKc">Schließen</button></div>`;
    E.querySelectorAll('select[data-f=einheit]').forEach(x=>x.onchange=()=>{ const pm=x.closest('.kbkrow').querySelector('[data-f=pro_minute]'); if(pm){ pm.disabled=x.value==='kasten'; if(pm.disabled)pm.value=''; } });
    document.getElementById('kbNe').onchange=()=>{ const pm=document.getElementById('kbNp'); pm.disabled=document.getElementById('kbNe').value==='kasten'; if(pm.disabled)pm.value=''; };
    E.querySelectorAll('[data-mv]').forEach(b=>b.onclick=async()=>{ const id=b.closest('.kbkrow').dataset.id, d=+b.dataset.mv; if(E.dataset.mvBusy)return; E.dataset.mvBusy='1';
      try{ if(!await sichern(E))return; await kbLoad(true);
        const k=KB.kat.find(x=>x.id===id); if(!k)return draw();
        const X=kbKatSort(KB.kat.filter(x=>kbKatG(x)===kbKatG(k))), i=X.findIndex(x=>x.id===id), j=i+d; if(i<0||j<0||j>=X.length)return draw();
        [X[i],X[j]]=[X[j],X[i]];
        // die ganze Kategorie neu durchzählen: so bleibt die Reihenfolge eindeutig, auch wenn vorher mehrere denselben Wert hatten
        const R=await Promise.all(X.map((x,n)=>(+x.sort||0)===(n+1)*10?null:SVB.sb.from('kasse_katalog').update({sort:(n+1)*10}).eq('id',x.id)));
        const f=R.find(r=>r&&r.error); if(f)kToast('⚠️ '+f.error.message);
        await kbLoad(true); draw();
        const z=document.querySelector(`#kbKe .kbkrow[data-id="${CSS.escape(id)}"]`); if(z){ const nb=z.querySelector(`[data-mv="${d}"]:not([disabled])`)||z.querySelector('[data-mv]:not([disabled])'); try{ z.scrollIntoView({block:'nearest'}); if(nb)nb.focus({preventScroll:true}); }catch(e){} z.classList.add('kbmv-neu'); setTimeout(()=>z.classList.remove('kbmv-neu'),900); }
      }finally{ delete E.dataset.mvBusy; } });
    E.querySelectorAll('[data-del]').forEach(b=>b.onclick=async()=>{ const k=KB.kat.find(x=>x.id===b.dataset.del); if(!confirm(`„${k?k.titel:''}“ aus dem Katalog löschen? Gebuchte Strafen bleiben.`))return; if(!await sichern(E))return; const {error}=await SVB.sb.from('kasse_katalog').delete().eq('id',b.dataset.del); if(error)return kToast('⚠️ '+error.message); await kbLoad(true); draw(); });
    document.getElementById('kbAdd').onclick=async()=>{ const t=document.getElementById('kbNt').value.trim(), be=parseFloat(document.getElementById('kbNb').value), eh=document.getElementById('kbNe').value, pm=parseFloat(document.getElementById('kbNp').value)||0;
      if(!t||!(be>=0))return kToast('Bitte Bezeichnung und Betrag'); if(eh==='kasten'&&!(Number.isInteger(be)&&be>=1&&be<=10))return kToast('Bei Kasten eine ganze Zahl von 1 bis 10');
      if(!await sichern(E))return;
      const {error}=await SVB.sb.from('kasse_katalog').insert({titel:t,betrag:Math.min(500,be),kategorie:document.getElementById('kbNk').value,einheit:eh,pro_minute:eh==='eur'&&pm>0?Math.min(50,pm):null,team:kbTeamCtx(),sort:Math.max(KB.kat.length,...KB.kat.filter(x=>kbKatG(x)===document.getElementById('kbNk').value).map(x=>+x.sort||0))+10}); if(error)return kToast('⚠️ '+error.message); await kbLoad(true); draw(); };
    document.getElementById('kbKc').onclick=()=>closeOverlay();
    document.getElementById('kbKs').onclick=async()=>{ if(!await sichern(E))return;
      await kbLoad(true); closeOverlay(); kToast('✓ Katalog gespeichert'); };
  };
  draw();
}
function kbCfgEditor(){
  const c=KB.cfg||{};
  svModal(`<div class="mhead"><div class="rm-ic" style="width:46px;height:46px">${SVI('sliders')}</div><div><h2 style="margin:0">Kasse einstellen</h2><div class="msub">Bezahlen per PayPal.me oder Überweisung: kostenlos</div></div></div>
    <div class="kbform"><div class="field"><label>PayPal.me-Name des Kassenwarts</label><input id="kcP" maxlength="40" value="${svEsc(c.paypal||'')}" placeholder="z.B. MaxMustermann (aus paypal.me/MaxMustermann)"></div>
      <div class="field"><label>Kassenwart</label><input id="kcK" maxlength="60" value="${svEsc(c.kassenwart||'')}" placeholder="Name"></div>
      <div class="field"><label>Anfangsbestand Bank (€)</label><input id="kcA" type="number" step="0.01" value="${+c.anfang||0}"></div>
      <div class="field"><label>Anfangsbestand PayPal (€)</label><input id="kcAp" type="number" step="0.01" value="${+c.anfang_paypal||0}"></div>
      <div class="field"><label>Anfangsbestand Bar (€)</label><input id="kcAb" type="number" step="0.01" value="${+c.anfang_bar||0}"></div>
      <div class="field kbwide"><label>Kassenwart in der App <small>(bekommt die gemeldeten Zahlungen zum Abhaken, nur er bzw. der Admin kann bestätigen)</small></label><div class="chips" id="kcW"><span class="note">Lade …</span></div></div>
      <div class="field"><label>IBAN für Überweisung (optional)</label><input id="kcI" maxlength="42" value="${svEsc(c.iban||'')}" placeholder="DE.." autocomplete="off"></div>
      <div class="field"><label>Kontoinhaber</label><input id="kcO" maxlength="70" value="${svEsc(c.kontoinhaber||'')}" placeholder="Name"></div>
      <div class="field kbwide"><label>Hinweis für die Spieler (optional)</label><input id="kcH" maxlength="300" value="${svEsc(c.hinweis||'')}" placeholder="z.B. Bar geht auch: beim Kassenwart nach dem Training"></div></div>
    <div class="note">Die Spieler sehen einen „Mit PayPal bezahlen“-Knopf mit dem offenen Betrag und melden danach „Habe bezahlt“. Du bestätigst den Eingang, so bleibt alles nachvollziehbar. Stripe bräuchte ein Händlerkonto mit Gebühren je Zahlung und lohnt sich für eine Mannschaftskasse nicht.</div>
    <div class="btnrow sbact"><button class="btn" id="kcS">Speichern</button><button class="btn ghost" id="kcC">Abbrechen</button></div>`);
  document.getElementById('kcC').onclick=()=>closeOverlay();
  SVB.sb.rpc('kasse_team').then(r=>{ KB.team=r.data||[]; const W=document.getElementById('kcW'); if(!W)return; const ids=new Set(c.kassenwart_ids||[]);
    W.innerHTML=KB.team.map(x=>`<button type="button" class="pchip${ids.has(x.id)?' on':''}" data-kw="${svEsc(x.id)}">${svEsc(x.name)}</button>`).join('')||'<span class="note">Keine Team-Mitglieder gefunden.</span>';
    W.querySelectorAll('[data-kw]').forEach(b=>b.onclick=()=>b.classList.toggle('on')); });
  document.getElementById('kcS').onclick=async()=>{ let pp=document.getElementById('kcP').value.trim().replace(/^https?:\/\/(www\.)?paypal\.me\//i,'').replace(/\/.*$/,'');
    if(pp&&!/^[A-Za-z0-9._-]{2,40}$/.test(pp))return kToast('PayPal.me-Name: nur Buchstaben, Ziffern, Punkt, Minus');
    const iban=document.getElementById('kcI').value.replace(/\s+/g,'').toUpperCase();
    if(iban&&!kbIbanOk(iban))return kToast('Die IBAN scheint nicht zu stimmen, bitte prüfen');
    const kw=[...document.querySelectorAll('#kcW [data-kw].on')].map(x=>x.dataset.kw), kwn=document.getElementById('kcK').value.trim()||(kw.length?(((KB.team||[]).find(x=>x.id===kw[0])||{}).name||''):'');
    const patch={paypal:pp||null,kassenwart:kwn||null,anfang:+document.getElementById('kcA').value||0,anfang_paypal:+document.getElementById('kcAp').value||0,anfang_bar:+document.getElementById('kcAb').value||0,hinweis:document.getElementById('kcH').value.trim()||null,iban:iban||null,kontoinhaber:document.getElementById('kcO').value.trim()||null};
    if(JSON.stringify(kw.slice().sort())!==JSON.stringify((c.kassenwart_ids||[]).slice().sort()))patch.kassenwart_ids=kw;
    const {error}=await SVB.sb.from('kasse_cfg').update(patch).eq('id',1);
    if(error)return kToast('⚠️ '+error.message); closeOverlay(); await kbLoad(true); kToast('✓ Gespeichert'); };
}

/* ----- Team-Link ----- */
async function kbViewLink(B){
  B.innerHTML='<div class="card"><div class="empty">Lade Link …</div></div>';
  try{ await kbLink(); }catch(e){ B.innerHTML=`<div class="card"><div class="empty">${svEsc(e.message)}</div></div>`; return; }
  if(!B.isConnected)return;   // Ansicht wurde inzwischen neu gezeichnet
  const u=kbUrl();
  B.innerHTML=`<div class="card kblink"><h3 class="trh">${SVI('link')} Kabinen-Link für die Mannschaft</h3>
      <p>Ein Link für alles: Abstimmungen und Mannschaftskasse. Einmal in die WhatsApp-Gruppe posten. Jeder Spieler tippt einmal seinen Namen an, danach reicht ein Klick. Kein Login, keine App-Installation.</p>
      <div class="kburl"><code>${svEsc(u)}</code></div>
      <div class="btnrow"><button class="btn" id="klWa">${SVI('share')} In WhatsApp teilen</button><button class="btn ghost" id="klCp">${SVI('copy')} Kopieren</button><button class="btn ghost" id="klOpen">${SVI('eye')} Ansehen wie ein Spieler</button></div></div>
    <div class="card"><h3 class="trh">${SVI('shield')} Sicherheit</h3><div class="note" style="margin-top:0">Wer den Link hat, sieht die Abstimmungen und die Kasse der Mannschaft (Namen, Strafen, Kassenstand), aber nichts vom Scouting, keine Notizen, keine Kontakte. Nur in der Mannschaftsgruppe teilen.
      Wenn der Link in falsche Hände gerät: erneuern: der alte funktioniert dann sofort nicht mehr.</div>
      <button class="btn ghost sm" id="klNew" style="margin-top:10px;color:#fca5a5">${SVI('refresh')} Link erneuern</button></div>`;
  const bc=document.createElement('div'); bc.innerHTML=kbBotCard(); B.prepend(bc.firstElementChild); kbBotWire(B);
  document.getElementById('klWa').onclick=()=>kbWa(`⚽ Unsere Kabine: Abstimmungen fürs Training & Spiel und die Mannschaftskasse, ein Klick, kein Login.\nEinmal Namen antippen, fertig:\n${u}`);
  document.getElementById('klCp').onclick=()=>kbCopy(u);
  document.getElementById('klOpen').onclick=()=>window.open(u,'_blank','noopener');
  document.getElementById('klNew').onclick=async()=>{ if(!confirm('Neuen Link erzeugen? Der alte Link funktioniert danach nicht mehr, ihr müsst den neuen in die Gruppe posten.'))return; try{ await kbLink(true); kToast('✓ Neuer Link erzeugt'); kbViewLink(B); }catch(e){ kToast('⚠️ '+e.message); } };
}

/* ---------- Home: nächste Abstimmung ---------- */
function kbHomeCard(){
  const host=document.getElementById('svAct'); if(!host)return; let el=document.getElementById('kbHome');
  if(!canTraining()||!KB.loaded){ if(el)el.remove(); return; }
  const today=trToday(), p=KB.polls.filter(x=>x.datum>=today&&!x.geschlossen).sort((a,b)=>a.datum<b.datum?-1:1)[0];
  if(!p){ if(el)el.remove(); return; }
  if(!el){ el=document.createElement('div'); el.id='kbHome'; host.before(el); }
  const s=kbStat(p);
  const inv=!p.geteilt_at;
  el.innerHTML=`<div class="card kbhome${inv?' kbinv':''}" data-kbh><div><span class="trpill">${SVI('users')} ${inv?'Noch nicht in der Gruppe':'Abstimmung'}</span><b>${svEsc(kbPollTitle(p))}</b>${inv?'':`<small>${s.zu.length} dabei · ${s.ab.length} nicht · ${s.offen.length} offen${p.geteilt_von?' · geteilt von '+svEsc(p.geteilt_von.split(' ')[0]):''}</small>`}</div>
    ${inv?`<button class="btn sm" data-kbh-inv>${SVI('share')} Spieler einladen</button>`:`<div class="kbnum"><b class="ok">${s.zu.length}</b><b class="bad">${s.ab.length}</b><b>${s.offen.length}</b></div>`}</div>`;
  el.querySelector('[data-kbh]').onclick=e=>{ if(e.target.closest('[data-kbh-inv]'))return kbShare(p); KB.view='abst'; goTab('kabine'); };
}
{ const _si6=svInsights; svInsights=function(){ const base=_si6.apply(this,arguments), add=[];
  try{ if(KB.loaded&&canTraining()){ const today=trToday(); KB.polls.filter(p=>p.datum>=today&&!p.geschlossen&&TRC.diffDays(p.datum,today)<=3).forEach(p=>{ const s=kbStat(p);
      if(s.offen.length)add.push({prio:svRole()==='trainer'?0.3:3,lvl:TRC.diffDays(p.datum,today)<=1?'hoch':'mittel',t:`${s.offen.length} ohne Antwort: ${p.titel} (${kbWd(p.datum)})`,d:s.offen.slice(0,5).map(x=>x.name.split(' ')[0]).join(', ')+(s.offen.length>5?' …':'')+' · jetzt nachhaken',go:()=>{ KB.view='abst'; goTab('kabine'); }}); });
    const g=KB.buch.filter(b=>b.status==='gemeldet').length; if(g)add.push({prio:KB.ich&&KB.ich.kassenwart?0.2:4,lvl:'info',t:`Kasse: ${g} Zahlung${g>1?'en':''} gemeldet`,d:'Eingang prüfen und bestätigen',go:()=>{ KB.view='kasse'; goTab('kabine'); }}); } }catch(e){}
  return add.concat(base).sort((a,b)=>a.prio-b.prio).slice(0,6); }; }
SV_ACTIONS.trainer.splice(2,0,['users','Abstimmung',()=>{ KB.view='abst'; goTab('kabine'); setTimeout(()=>kbPollEditor(null,kbSuggest()[0]),80); }]); SV_ACTIONS.trainer.length=4;
{ const _gt6=goTab; goTab=function(tab){ const r=_gt6.apply(this,arguments); try{ if(tab==='kabine')kbRender(); }catch(e){ console.warn(e); } return r; }; }
{ const _si7=svInit; svInit=function(){ const r=_si7.apply(this,arguments); setTimeout(()=>kbLoad(),1100); return r; }; }
SV_TABBAR.trainer=['home','training','kabine','elf'];

/* ---------- Kasse: Konten, Dreh-Karte, Abgleich, gemeldete Zahlungen ---------- */
function kbFlipHtml(K,id){ const k=KB.flipK||'bank';
  return `<div class="kbflip" id="${id}" title="Antippen: Bank ↔ PayPal ↔ Bar"><div class="kbfl-in"><div class="kbfl-f">${kbFaceHtml(K,k)}</div><div class="kbfl-b"></div></div></div>`; }
function kbFaceHtml(K,k){ return `<span>${KB_KONTO[k][0]} ${KB_KONTO[k][1]} <i class="kbfl-hint">⟲</i></span><b class="${K[k]<0?'bad':''}">${kbEur(K[k])}</b><small>${['bank','paypal','bar'].filter(x=>x!==k).map(x=>KB_KONTO[x][1]+' '+kbEur(K[x])).join(' · ')}</small>`; }
function kbFlipWire(id,K){ const el=document.getElementById(id); if(!el)return; let busy=false;
  el.onclick=()=>{ if(busy)return; busy=true; const order=['bank','paypal','bar'].filter(x=>x!=='bar'||K.bar||(KB.flipK==='bar')), cur=KB.flipK||'bank', nx=order[(order.indexOf(cur)+1)%order.length];
    const inn=el.querySelector('.kbfl-in'), back=el.querySelector('.kbfl-b'), front=el.querySelector('.kbfl-f');
    back.innerHTML=kbFaceHtml(K,nx); inn.classList.add('turn');
    setTimeout(()=>{ front.innerHTML=kbFaceHtml(K,nx); inn.style.transition='none'; inn.classList.remove('turn'); void inn.offsetWidth; inn.style.transition=''; KB.flipK=nx; busy=false; },620); }; }
function kbAbgleich(k){
  const S=kbSaldo(), cur=S.konten[k];
  svModal(`<div class="mhead"><div class="rm-ic" style="width:46px;height:46px">${SVI('check')}</div><div><h2 style="margin:0">Kontostand abgleichen</h2><div class="msub">Stand laut Bank- bzw. PayPal-App eintragen: die App bucht die Differenz</div></div></div>
    <div class="chips">${['bank','paypal','bar'].map(x=>`<button type="button" class="pchip${x===k?' on':''}" data-ak="${x}">${KB_KONTO[x][0]} ${KB_KONTO[x][1]}</button>`).join('')}</div>
    <div class="kbform"><div class="field"><label>In der App</label><input disabled value="${kbEur(cur)}"></div><div class="field"><label>Tatsächlich auf dem Konto (€)</label><input id="kbIst" type="number" step="0.01" inputmode="decimal" placeholder="${(+cur).toFixed(2)}"></div>
      <div class="field kbwide"><label>Grund</label><input id="kbGr" maxlength="100" value="Kontoabgleich (Gebühren/Zinsen)"></div></div><div class="note" id="kbDiff"></div>
    <div class="btnrow sbact"><button class="btn" id="kbAbS">Differenz buchen</button><button class="btn ghost" id="kbAbC">Abbrechen</button></div>`);
  document.querySelectorAll('#modal [data-ak]').forEach(b=>b.onclick=()=>kbAbgleich(b.dataset.ak));
  const ist=document.getElementById('kbIst'), D=document.getElementById('kbDiff'), diff=()=>Math.round((parseFloat(String(ist.value).replace(',','.'))-cur)*100)/100;
  ist.oninput=()=>{ const d=diff(); D.textContent=isFinite(d)?(d===0?'Passt, keine Differenz.':`Es wird ${d>0?'eine Einnahme':'eine Ausgabe'} von ${kbEur(Math.abs(d))} auf ${KB_KONTO[k][1]} gebucht.`):''; };
  document.getElementById('kbAbC').onclick=()=>closeOverlay();
  document.getElementById('kbAbS').onclick=async()=>{ const d=diff(); if(!isFinite(d))return kToast('Bitte den tatsächlichen Stand eintragen'); if(d===0){ closeOverlay(); return kToast('✓ Stimmt überein'); }
    const {error}=await SVB.sb.from('kasse_buchungen').insert({art:d>0?'einzahlung':'ausgabe',titel:document.getElementById('kbGr').value.trim()||'Kontoabgleich',betrag:Math.abs(d),konto:k,status:'bezahlt',bezahlt_am:trToday(),quelle:'abgleich'});
    if(error)return kToast('⚠️ '+error.message); closeOverlay(); await kbLoad(true); kToast('✓ '+KB_KONTO[k][1]+' abgeglichen'); };
}
function kbGemeldetHtml(G,darf){
  return `<div class="card kbgem"><h3 class="trh">${SVI('check')} Als bezahlt gemeldet, bitte aufs Konto schauen <small>${G.length}</small></h3>
    ${G.map(b=>`<div class="kbb"><b>${svEsc((trP(b.player_id)||{}).name||b.name||'')}</b><span>${svEsc(b.titel)} <small>${b.zahlweg?'per '+KB_KONTO[b.zahlweg][1]:''}${b.gemeldet_at?' · '+new Date(b.gemeldet_at).toLocaleString('de-DE',{weekday:'short',day:'2-digit',month:'2-digit',hour:'2-digit',minute:'2-digit'}):''}</small></span><em>${kbEur(b.betrag)}</em>
      ${darf?`<div class="btnrow"><select class="kbkto" data-kto="${b.id}">${['bank','paypal','bar'].map(k=>`<option value="${k}"${(b.zahlweg||'bank')===k?' selected':''}>${KB_KONTO[k][1]}</option>`).join('')}</select><button class="btn sm" data-ok="${b.id}">✓ Angekommen</button><button class="btn ghost sm" data-back="${b.id}">Nicht da</button></div>`:''}</div>`).join('')}
    ${darf&&G.length>1?`<button class="btn sm" id="kbOkAll">✓ Alle ${G.length} angekommen (${kbEur(G.reduce((a,b)=>a+ +b.betrag,0))})</button>`:''}
    ${darf?'':`<div class="note">Abhaken kann nur der Kassenwart${KB.cfg&&KB.cfg.kassenwart?' ('+svEsc(KB.cfg.kassenwart)+')':''} · erst dann zählt es im Kassenstand.</div>`}</div>`;
}
function kbGemeldetWire(R,after){
  const go=async(ids,ok,konto)=>{ const {data,error}=await SVB.sb.rpc('kasse_bestaetigen',{p_ids:ids,p_ok:ok,p_konto:konto||null}); if(error)return kToast('⚠️ '+error.message);
    await kbLoad(true); kToast(ok?`✓ ${data} Zahlung${data>1?'en':''} verbucht`:'Zurück auf offen'); if(after)after(); };
  R.querySelectorAll('[data-ok]').forEach(b=>b.onclick=()=>{ const s=R.querySelector(`[data-kto="${b.dataset.ok}"]`); go([b.dataset.ok],true,s&&s.value); });
  R.querySelectorAll('[data-back]').forEach(b=>b.onclick=()=>go([b.dataset.back],false));
  const all=R.querySelector('#kbOkAll'); if(all)all.onclick=async()=>{ const G=(KB._b31all||KB.buch).filter(b=>kbGeld(b)&&b.status==='gemeldet'); const by={}; G.forEach(b=>{ const s=R.querySelector(`[data-kto="${b.id}"]`), k=(s&&s.value)||b.zahlweg||'bank'; (by[k]=by[k]||[]).push(b.id); });
    let n=0; for(const [k,ids] of Object.entries(by)){ const {data,error}=await SVB.sb.rpc('kasse_bestaetigen',{p_ids:ids,p_ok:true,p_konto:k}); if(error)return kToast('⚠️ '+error.message); n+=data; }
    await kbLoad(true); kToast(`✓ ${n} Zahlungen verbucht`); if(after)after(); };
}
// Kassenwart: Pop-up, sobald neue Zahlungen gemeldet sind
function kbKassePopup(){
  if(!KB.loaded||!KB.ich||!KB.ich.kassenwart)return; const G=(KB._b31all||KB.buch).filter(b=>kbGeld(b)&&b.status==='gemeldet'); if(!G.length)return;
  const last=G.map(b=>b.gemeldet_at||'').sort().pop(), k='kb_kpop'; let seen=''; try{ seen=localStorage.getItem(k)||''; }catch(e){}
  if(seen>=last||window.__kbKPop===last)return; if(document.querySelector('#overlay.open'))return;
  const g=document.getElementById('gate'); if(g&&!g.classList.contains('done'))return;
  window.__kbKPop=last;
  svModal(`<div class="kbpop"><div class="kbpop-ic kasse">${SVI('check')}</div><span class="trpill">Mannschaftskasse</span><h2>${G.length} Zahlung${G.length>1?'en':''} gemeldet</h2>
    <p class="note">Kurz aufs Konto schauen und abhaken, was angekommen ist, erst dann zählt es im Kassenstand.</p><div id="kbKp" style="text-align:left"></div>
    <div class="btnrow"><button class="btn ghost sm" id="kbKpL">Später</button></div></div>`);
  const draw=()=>{ const E=document.getElementById('kbKp'); if(!E)return; const G2=KB.buch.filter(b=>b.status==='gemeldet'); if(!G2.length){ closeOverlay(); return; } E.innerHTML=kbGemeldetHtml(G2,true); kbGemeldetWire(E,draw); };
  draw();
  document.getElementById('kbKpL').onclick=()=>{ try{ localStorage.setItem(k,last); }catch(e){} closeOverlay(); };
}

/* ---------- Einladen: Link in die Mannschaftsgruppe (einer teilt, alle sehen es) ---------- */
function kbShare(p){
  if(!p)return; const go=()=>{ kbWa(kbInviteText(p));
    if(!p.gesendet_at){ p.gesendet_at=new Date().toISOString(); SVB.sb.from('polls').update({gesendet_at:p.gesendet_at}).eq('id',p.id).then(()=>{}); }
    SVB.sb.rpc('kabine_geteilt',{p_poll:p.id}).then(r=>{ if(!r.error&&r.data){ p.geteilt_at=r.data.geteilt_at; p.geteilt_von=r.data.geteilt_von; } kbAfter(); }); };
  if(KB.link)return go();                                   // direkt aus dem Klick heraus – sonst blockt das Handy das WhatsApp-Fenster
  kbLink().then(go).catch(e=>kToast('⚠️ '+e.message));
}
// nächstes Training, das noch nicht in der Gruppe ist (heute bis übermorgen)
function kbInviteDue(){ const today=trToday();
  return KB.polls.filter(p=>p.art==='training'&&!p.geschlossen&&!p.geteilt_at&&p.datum>=today&&TRC.diffDays(p.datum,today)<=2).sort((a,b)=>a.datum<b.datum?-1:1)[0]||null; }
function kbPopup(){
  if(!KB.loaded||!KB.popup||!canTraining())return; const p=kbInviteDue(); if(!p)return;
  const k='kb_pop_'+p.id; let t=0; try{ t=+localStorage.getItem(k)||0; }catch(e){}
  if(Date.now()-t<3*3600e3||window.__kbPopShown===p.id)return;
  const g=document.getElementById('gate'); if(g&&!g.classList.contains('done'))return;
  if(document.querySelector('#overlay.open, .overlay.open, #modal.open'))return;
  window.__kbPopShown=p.id; const s=kbStat(p);
  svModal(`<div class="kbpop"><div class="kbpop-ic">${SVI('users')}</div><span class="trpill">Einladen</span><h2>Spieler zum Training einladen</h2>
    <div class="kbpop-when">${svEsc(kbWd(p.datum))}${p.zeit?' · '+svEsc(p.zeit)+' Uhr':''}${p.ort?' · '+svEsc(p.ort):''}</div>
    <p class="note">Der Abstimmungslink ist fertig. Einmal in die Mannschaftsgruppe stellen. Jeder tippt seinen Vor- und Nachnamen an und sagt zu oder ab.${s.zu.length+s.ab.length?` Schon ${s.zu.length+s.ab.length} Antworten.`:''}</p>
    <button class="btn kbpop-go" id="kbPopGo">${SVI('share')} In die WhatsApp-Gruppe teilen</button>
    <div class="btnrow"><button class="btn ghost sm" id="kbPopCp">${SVI('copy')} Link kopieren</button><button class="btn ghost sm" id="kbPopDone">Hat schon jemand geteilt</button><button class="btn ghost sm" id="kbPopLater">Später</button></div>
    <p class="note small">Sobald einer von euch geteilt hat, verschwindet das Pop-up bei allen Trainern.</p></div>`);
  const later=()=>{ try{ localStorage.setItem(k,String(Date.now())); }catch(e){} closeOverlay(); };
  document.getElementById('kbPopGo').onclick=()=>{ kbShare(p); closeOverlay(); };
  document.getElementById('kbPopCp').onclick=async()=>{ try{ if(!KB.link)await kbLink(); await kbCopy(kbInviteText(p)); const r=await SVB.sb.rpc('kabine_geteilt',{p_poll:p.id}); if(!r.error&&r.data){ p.geteilt_at=r.data.geteilt_at; p.geteilt_von=r.data.geteilt_von; } closeOverlay(); kbAfter(); }catch(e){ kToast('⚠️ '+e.message); } };
  document.getElementById('kbPopDone').onclick=async()=>{ const r=await SVB.sb.rpc('kabine_geteilt',{p_poll:p.id}); if(r.error)return kToast('⚠️ '+r.error.message); p.geteilt_at=r.data.geteilt_at; p.geteilt_von=r.data.geteilt_von; closeOverlay(); kbAfter(); };
  document.getElementById('kbPopLater').onclick=later;
}
{ const _vc=document.addEventListener.bind(document); _vc('visibilitychange',()=>{ if(document.visibilityState==='visible'&&KB.loaded&&canTraining())kbLoad(true); }); }

/* ---------- Automatik: Trainings-Abstimmungen selbst anlegen + Link per WhatsApp an die Trainer ---------- */
const KB_WD=[[1,'Mo'],[2,'Di'],[3,'Mi'],[4,'Do'],[5,'Fr'],[6,'Sa'],[0,'So']];
function kbBotCard(){
  const c=KB.bot; if(!c)return '<div class="card"><div class="note">Automatik nicht verfügbar.</div></div>';
  const emp=(c.empfaenger||[]).concat([{name:'',tel:''},{name:'',tel:''}]).slice(0,Math.max(2,(c.empfaenger||[]).length+1)).slice(0,5);
  const ready=c.versand&&c.sc_channel&&c.sc_template&&(c.empfaenger||[]).length;
  return `<div class="card kbbot"><div class="vrat-h"><h3 class="trh" style="margin:0">${SVI('clock')} Automatik fürs Training</h3><label class="kbsw"><input type="checkbox" id="kbA_on"${c.aktiv?' checked':''}><span></span>${c.aktiv?'an':'aus'}</label></div>
    <p class="note" style="margin-top:6px">Die App legt die Abstimmung für jedes Training selbst an${ready?' und schickt den Link per WhatsApp an die Trainer, die leiten ihn nur noch in die Gruppe weiter':''}. Am Trainingstag kommt eine Liste, wer noch nicht geantwortet hat. Spieler können ihre Antwort bis zum Training jederzeit ändern.</p>
    <div class="kbform"><div class="field kbwide"><label>Trainingstage</label><div class="chips">${KB_WD.map(([n,t])=>`<button type="button" class="pchip${(c.tage||[]).includes(n)?' on':''}" data-wd="${n}">${t}</button>`).join('')}</div></div>
      <div class="field"><label>Uhrzeit Training</label><input id="kbA_z" value="${svEsc(c.zeit||'19:00')}" maxlength="5"></div><div class="field"><label>Ort (optional)</label><input id="kbA_o" value="${svEsc(c.ort||'')}" maxlength="120"></div>
      <div class="field"><label>Abstimmung verschicken</label><select id="kbA_v">${[0,1,2,3].map(n=>`<option value="${n}"${+c.vorlauf===n?' selected':''}>${n===0?'am Trainingstag':n===1?'1 Tag vorher':n+' Tage vorher'}</option>`).join('')}</select></div>
      <div class="field"><label>um</label><select id="kbA_s">${[7,8,9,10,11,12,14,16,18,20].map(n=>`<option value="${n}"${+c.stunde===n?' selected':''}>${n}:00 Uhr</option>`).join('')}</select></div>
      <div class="field"><label>Am Trainingstag nachhaken</label><select id="kbA_e"><option value="">nein</option>${[10,12,14,15,16,17].map(n=>`<option value="${n}"${c.erinnerung&&+c.erinnerung_stunde===n?' selected':''}>ja, um ${n}:00 Uhr</option>`).join('')}</select></div></div>
    <div class="sbsec"><h4>WhatsApp an die Trainer <small>über Superchat${ready?' · eingerichtet ✓':''}</small></h4>
      ${emp.map((e,i)=>`<div class="kbemp"><input data-en="${i}" placeholder="Name, z.B. Nico" value="${svEsc(e.name||'')}" maxlength="40"><input data-et="${i}" placeholder="Handy, z.B. 0171 1234567" value="${svEsc(e.tel||'')}" inputmode="tel" maxlength="20"></div>`).join('')}
      <div class="kbform"><div class="field"><label>Superchat Kanal-ID</label><input id="kbA_ch" value="${svEsc(c.sc_channel||'')}" placeholder="mc_…" maxlength="60"></div><div class="field"><label>Vorlagen-ID (WhatsApp-Vorlage mit 1 Text-Variable)</label><input id="kbA_tp" value="${svEsc(c.sc_template||'')}" placeholder="tn_…" maxlength="60"></div>
        <div class="field kbwide"><div class="note" style="margin:0">${c.versand==='server'?'✓ Versand über Superchat. Der Zugang liegt sicher auf dem Server, nicht in der App.':c.versand==='n8n'?'✓ Versand läuft über euren n8n-Server. Der Superchat-Zugang liegt dort, nicht in der App.':c.versand==='direkt'?'Versand direkt über Superchat.':'WhatsApp-Versand noch nicht verbunden. Der Admin hinterlegt den Superchat-Zugang einmal auf dem Server (Verwaltung → Versand & Zugänge).'}</div></div></div>
      <div class="note">Nachrichten außerhalb eines offenen Chats brauchen bei WhatsApp eine genehmigte Vorlage, z.B. „SV/BSC Kabine: {{1}}“ (Kategorie „Utility“). Die App setzt den Text mit Link in die Variable ein.</div></div>
    <div class="sbsec"><h4>Spieler einzeln per WhatsApp <small>${c.nummern||0} Nummern hinterlegt · diesen Monat ${c.monat||0} von max. ${c.max_monat||400} Nachrichten</small></h4>
      <label class="kbchk"><input type="checkbox" id="kbA_ee"${c.einzeln_erinnern?' checked':''}> Am Trainingstag nur die, die noch nicht geantwortet haben, persönlich erinnern <small>(günstig: meist 3–8 Nachrichten)</small></label>
      <label class="kbchk"><input type="checkbox" id="kbA_ei"${c.einzeln_einladen?' checked':''}> Jedem Spieler seinen persönlichen Link schicken <small>(ca. 30 Nachrichten je Training)</small></label>
      <div class="note">Jeder Spieler hat einen persönlichen Link: kein Namen-Suchen, ein Klick, nur für sich selbst. Meta berechnet je Vorlagen-Nachricht rund 4–5 Cent. Spieler können sich auf ihrer Seite selbst abmelden. Vorher kurz in der Mannschaft ankündigen.</div>
      <div class="field" style="margin-top:8px"><label>Vorlagen-ID für Spieler <small>zum Beispiel „Hallo {{1}}, kommst du {{2}} ins Training? Hier abstimmen: {{3}} Danke dir!“ (Vorname, wann, Link)</small></label><input id="kbA_tps" value="${svEsc(c.sc_template_spieler||'')}" placeholder="tn_… (leer = Trainer-Vorlage mit Freitext)" maxlength="60"></div>
      <button class="btn ghost sm" id="kbA_pl" style="margin-top:8px">${SVI('users')} Handynummern & persönliche Links</button></div>
    <div class="btnrow sbact"><button class="btn" id="kbA_save">Speichern</button>${ready?`<button class="btn ghost" id="kbA_test">${SVI('chat')} Testnachricht</button>`:''}<button class="btn ghost" id="kbA_run">${SVI('refresh')} Jetzt prüfen</button></div></div>`;
}
function kbBotWire(B){
  const c=KB.bot; if(!c)return; const tage=new Set(c.tage||[]);
  B.querySelectorAll('[data-wd]').forEach(b=>b.onclick=()=>{ const n=+b.dataset.wd; if(tage.has(n))tage.delete(n); else tage.add(n); b.classList.toggle('on',tage.has(n)); });
  const sw=document.getElementById('kbA_on'); if(sw)sw.onchange=()=>{ sw.parentElement.lastChild.textContent=sw.checked?'an':'aus'; };
  const save=async(quiet)=>{ const emp=[]; B.querySelectorAll('[data-et]').forEach(i=>{ const t=i.value.trim(), n=B.querySelector(`[data-en="${i.dataset.et}"]`).value.trim(); if(t)emp.push({name:n||'Trainer',tel:t}); });
    const e=document.getElementById('kbA_e').value;
    const p={aktiv:document.getElementById('kbA_on').checked,tage:[...tage],zeit:document.getElementById('kbA_z').value.trim(),ort:document.getElementById('kbA_o').value,vorlauf:+document.getElementById('kbA_v').value,stunde:+document.getElementById('kbA_s').value,
      erinnerung:!!e,erinnerung_stunde:e?+e:(+c.erinnerung_stunde||12),empfaenger:emp,sc_channel:document.getElementById('kbA_ch').value.trim(),sc_template:document.getElementById('kbA_tp').value.trim(),app_url:kbBase()};
    if(p.aktiv&&!p.tage.length){ kToast('Bitte mindestens einen Trainingstag wählen'); return false; }
    const {error}=await SVB.sb.rpc('kabine_bot_set',{p}); if(error){ kToast('⚠️ '+error.message); return false; }
    const ee=document.getElementById('kbA_ee'), ei=document.getElementById('kbA_ei'); if(ee&&ei){ const r2=await SVB.sb.rpc('kabine_bot_einzeln',{p_einladen:ei.checked,p_erinnern:ee.checked,p_template:(document.getElementById('kbA_tps')||{value:''}).value.trim()}); if(r2.error){ kToast('⚠️ '+r2.error.message); return false; } }
    const r=await SVB.sb.rpc('kabine_bot_get'); KB.bot=r.data; if(!quiet)kToast('✓ Automatik gespeichert'); kbViewLink(B); return true; };
  document.getElementById('kbA_save').onclick=()=>save();
  const pl=document.getElementById('kbA_pl'); if(pl)pl.onclick=()=>kbSpielerLinks();
  const call=async(body,btn)=>{ btn.disabled=true; try{ const {data,error}=await SVB.sb.functions.invoke('kabine-bot',{body}); if(error){ let t=error.message; try{ const x=await error.context.json(); if(x&&x.error)t=x.error; }catch(_){} throw new Error(t); } return data; }finally{ btn.disabled=false; } };
  const tb=document.getElementById('kbA_test'); if(tb)tb.onclick=async()=>{ try{ const d=await call({mode:'test'},tb); if(!d.ok&&d.error)throw new Error(d.error); kToast((d.ergebnis||[]).map(x=>x.name+(x.ok?' ✓':' ✗ '+(x.fehler||''))).join(' · ')||'Gesendet'); }catch(e){ kToast('⚠️ '+e.message); } };
  document.getElementById('kbA_run').onclick=async e=>{ const bt=e.currentTarget; if(!(await save(true)))return; try{ const d=await call({},document.getElementById('kbA_run')||bt); await kbLoad(true); kToast(d.aktiv===false?'Automatik ist aus':(d.log&&d.log.length?d.log.join(' · '):'Alles aktuell: nichts zu tun')); }catch(err){ kToast('⚠️ '+err.message); } };
}

/* ---------- Handynummern & persönliche Links ---------- */
async function kbSpielerLinks(){
  const all=kbSquadAll();
  svModal(`<div class="mhead"><div class="rm-ic" style="width:46px;height:46px">${SVI('users')}</div><div><h2 style="margin:0">Handynummern & persönliche Links</h2><div class="msub">Nur fürs Team sichtbar · Nummern werden nur für die Abstimmungs-Nachrichten genutzt</div></div></div><div id="kbPl"><div class="empty">Lade …</div></div>`);
  const {data,error}=await SVB.sb.rpc('kabine_spieler_get',{p_ids:all.map(p=>({id:p.id,name:p.name}))});
  const E=document.getElementById('kbPl'); if(!E)return; if(error){ E.innerHTML=`<div class="note">${svEsc(error.message)}</div>`; return; }
  const M=new Map((data||[]).map(x=>[x.id,x])), url=t=>((KB.bot&&KB.bot.link_url)||kbBase())+t;
  E.innerHTML=`<div class="kbpls">${all.map(p=>{ const x=M.get(p.id)||{}; return `<div class="kbplr"><b>${svEsc(p.name)}${kbTeamVon(p)==='2'?' <small>II</small>':''}${x.optout?' <span class="trpill mid">abgemeldet</span>':''}</b>
      <input data-tel="${svEsc(p.id)}" value="${svEsc(x.tel||'')}" placeholder="Handy" inputmode="tel" maxlength="20">
      <button class="btn ghost sm" data-cp="${svEsc(p.id)}" title="Persönlichen Link kopieren">${SVI('copy')}</button><button class="btn ghost sm" data-wa="${svEsc(p.id)}" title="Selbst per WhatsApp schicken">${SVI('share')}</button></div>`; }).join('')}</div>
    <div class="note">Tipp ohne Kosten: Mit ${SVI('share')} schickst du einem Spieler seinen persönlichen Link einmal selbst per WhatsApp, er speichert ihn und stimmt künftig mit einem Klick ab.</div>
    <div class="btnrow sbact"><button class="btn" id="kbPlS">Nummern speichern</button><button class="btn ghost" id="kbPlC">Schließen</button></div>`;
  E.querySelectorAll('[data-cp]').forEach(b=>b.onclick=()=>{ const x=M.get(b.dataset.cp); if(x)kbCopy(url(x.token)); });
  E.querySelectorAll('[data-wa]').forEach(b=>b.onclick=()=>{ const x=M.get(b.dataset.wa), p=trP(b.dataset.wa); if(!x)return; const tel=(E.querySelector(`[data-tel="${b.dataset.wa}"]`).value||'').replace(/[^0-9+]/g,'').replace(/^00/,'+').replace(/^0/,'+49').replace(/^\+/,'');
    const t=`Hi ${p.name.split(' ')[0]}, das ist dein persönlicher Kabinen-Link vom SV/BSC: Abstimmungen fürs Training mit einem Klick (und die Mannschaftskasse). Bitte speichern und nicht weitergeben: ${url(x.token)}`;
    window.open((tel?'https://wa.me/'+tel:'https://wa.me/')+'?text='+encodeURIComponent(t),'_blank','noopener'); });
  document.getElementById('kbPlC').onclick=()=>closeOverlay();
  document.getElementById('kbPlS').onclick=async()=>{ const rows=[]; E.querySelectorAll('[data-tel]').forEach(i=>{ const id=i.dataset.tel, x=M.get(id)||{}; if((i.value||'').trim()!==(x.tel||''))rows.push({id,name:(trP(id)||{}).name||id,tel:i.value.trim()}); });
    if(!rows.length){ closeOverlay(); return; }
    const {error}=await SVB.sb.rpc('kabine_spieler_set',{p:rows}); if(error)return kToast('⚠️ '+error.message);
    closeOverlay(); kToast(`✓ ${rows.length} Nummer${rows.length>1?'n':''} gespeichert`); const r=await SVB.sb.rpc('kabine_bot_get'); KB.bot=r.data; if(KB.view==='link')kbRender(); };
}

/* IBAN-Prüfsumme (Modulo 97) – fängt Tippfehler ab */
function kbIbanOk(i){ if(!/^[A-Z]{2}[0-9]{2}[A-Z0-9]{11,30}$/.test(i))return false; const r=(i.slice(4)+i.slice(0,4)).replace(/[A-Z]/g,c=>String(c.charCodeAt(0)-55)); let m=0; for(const ch of r)m=(m*10+(+ch))%97; return m===1; }

/* ---------- Runde 18: Kassen-Transparenz-Seite (mannschaftskasse.albertklee.de) in die Gruppe teilen ---------- */
const KB_MK='https://mannschaftskasse.albertklee.de/';
function kbMkUrl(){ return KB_MK+'#k='+encodeURIComponent(KB.link||''); }
function kbMkText(){ return '💰 Mannschaftskasse: alles transparent: Kassenstand, Top-Supporter 🏆 und die offenen Deckel 🧾\n'+kbMkUrl(); }
function kbMkShare(copy){ const go=()=>copy?kbCopy(kbMkUrl()):kbWa(kbMkText()); if(KB.link)return go(); kbLink().then(go).catch(e=>kToast('⚠️ '+e.message)); }
{ const _kvk2=kbViewKasse; kbViewKasse=function(B){ const r=_kvk2.apply(this,arguments); try{ const row=B.querySelector('.kbstats'); if(row&&!B.querySelector('[data-kbmk]')){
    row.insertAdjacentHTML('afterend',`<div class="kbmk" data-kbmk><span class="kbmk-ic">🏆</span><div class="kbmk-t"><b>Transparenz-Seite für die Mannschaft</b><small>Kassenstand gesamt, Top-Supporter und offene Deckel, unter mannschaftskasse.albertklee.de</small></div>
      <div class="kbmk-b"><button class="btn sm" data-kbmk-wa>${SVI('share')} In die Gruppe</button><button class="btn ghost sm" data-kbmk-cp>${SVI('copy')} Link</button></div></div>`);
    B.querySelector('[data-kbmk-wa]').onclick=()=>kbMkShare(false); B.querySelector('[data-kbmk-cp]').onclick=()=>kbMkShare(true); } }catch(e){} return r; }; }

/* =====================================================================
   SV/BSC Scout · Runde 16: Persönliche Einführung
   - Beim ersten Öffnen: „Hi Julian, schön dass du dabei bist“, zugeschnitten auf Rolle und Aufgaben (Training, Kasse, Scouting, Kader)
   - Erst fragen, dann melden: Erlaubnis für Pop-ups je Bereich, Einverständnis für Daten & Uploads (Co-Trainer)
   - Geführte Tour mit Maske und Pfeil: Co-Trainer, Kabine, Training, Scouting, Mein Konto
   - Pop-ups (Einladen, Kasse, Radar) erscheinen erst nach der Einführung und nur, wenn erlaubt
   ===================================================================== */
let SV_PREFS=null;
const SV_AUF={
  training:{ic:'activity',t:'Training & Kabine',c:'#22c55e',d:['Vor jedem Training (Di & Do) erinnert dich die App: Abstimmungslink in die Gruppe. Die Jungs sagen mit einem Klick zu oder ab.','Anwesenheit, Spiele und Saison-Statistik: Startelf, eingewechselt, Kader, zugeschaut, nicht da.'],
    pop:'Vor jedem Training: „Spieler einladen“, damit der Link rechtzeitig in der Gruppe ist.'},
  kasse:{ic:'check',t:'Mannschaftskasse',c:'#0ea5e9',d:['Spieler melden „bezahlt“: du schaust aufs Konto und hakst ab. Erst dann zählt es im Kassenstand.','Bank, PayPal und Bar getrennt. Antippen, und die Karte dreht sich. Abgleich und Umbuchung mit einem Klick.'],
    pop:'Neue gemeldete Zahlungen zum Abhaken, damit niemand zweimal zahlt oder vergessen wird.'},
  scouting:{ic:'search',t:'Scouting',c:'#a78bfa',d:['Das Radar meldet neue Talente, Wechselkandidaten und Rohdiamanten aus der Region.','Datenbank, Vergleich und Dossiers. Alles unter Scouting.'],
    pop:'Neue Radar-Treffer seit deinem letzten Besuch, damit uns kein Talent durchrutscht.'},
  kader:{ic:'plan',t:'Kaderplanung',c:'#fbbf24',d:['Kaderplan, Kandidaten und Schattenelf für die nächste Saison.','Wer bleibt, wer kommt, wo fehlt es, gemeinsam im Blick.'],pop:null}
};
function svAufgaben(){ return (SV_PREFS&&SV_PREFS.aufgaben)||[]; }
function svPopOk(area){
  if(!SV_PREFS||!(SV_PREFS.onboarding_at||SV_PREFS.skip))return false;
  return !area||(SV_PREFS.popups||{})[area]!==false;
}
function svOnbSkipAuto(){ try{ return !!navigator.webdriver&&!localStorage.getItem('sv_onb_test'); }catch(e){ return false; } }
async function svPrefsLoad(){
  try{ const {data,error}=await SVB.sb.rpc('me_prefs'); if(error)throw error; SV_PREFS=data||{aufgaben:[],popups:{}}; }
  catch(e){ console.warn('Einstellungen',e); SV_PREFS={aufgaben:[],popups:{},skip:true}; }
  SV_PREFS.popups=SV_PREFS.popups||{};
  if(!SV_PREFS.onboarding_at&&svOnbSkipAuto())SV_PREFS.skip=true;
  if(!SV_PREFS.onboarding_at&&!SV_PREFS.skip)svOnbStart(); else svPopupsRun();
}
async function svPrefsSet(p){ const {data,error}=await SVB.sb.rpc('me_prefs_set',{p}); if(error)throw error; const skip=SV_PREFS&&SV_PREFS.skip; SV_PREFS=data; SV_PREFS.popups=SV_PREFS.popups||{}; if(skip)SV_PREFS.skip=true; return data; }
function svPopupsRun(){ setTimeout(()=>{ try{ if(typeof kbAfter==='function'&&KB.loaded)kbAfter(); }catch(e){} try{ svScoutPopup(); }catch(e){ console.warn(e); } },400); }

/* ---------- Einführung ---------- */
const ONB={i:0,steps:[],pop:{}};
function svOnbStart(force){
  const g=document.getElementById('gate'); if(g&&!g.classList.contains('done')){ setTimeout(()=>svOnbStart(force),600); return; }
  if(document.getElementById('onb'))return;
  try{ closeOverlay(); }catch(e){}
  const A=svAufgaben();
  ONB.pop={}; ['training','kasse','scouting'].forEach(k=>{ if(A.includes(k)||(k==='kasse'&&SV_PREFS&&SV_PREFS.kassenwart))ONB.pop[k]=(SV_PREFS.popups||{})[k]!==false; });
  ONB.steps=['hallo','revier','popups','daten','tour']; ONB.i=0; ONB.force=!!force;
  const el=document.createElement('div'); el.id='onb'; el.className='onb'; document.body.appendChild(el); document.body.classList.add('onb-open');
  svOnbDraw();
}
function svOnbDots(){ return `<div class="onb-dots">${ONB.steps.map((s,i)=>`<i class="${i===ONB.i?'on':i<ONB.i?'done':''}"></i>`).join('')}</div>`; }
function svOnbDraw(){
  const el=document.getElementById('onb'); if(!el)return; const st=ONB.steps[ONB.i], A=svAufgaben(), vn=svFirst(SVU.name)||'Coach', R=svRolleT();
  const auf=A.map(k=>SV_AUF[k]).filter(Boolean);
  let h='';
  if(st==='hallo')h=`<div class="onb-hero"><div class="onb-av r-${svEsc(svRole())}">${svEsc(svIni(SVU.name||SVU.email))}</div><div class="onb-wave">👋</div></div>
    <h1>Hi ${svEsc(vn)}, schön, dass du dabei bist!</h1>
    <p>Das ist die App der Ersten vom <b>SV/BSC Mörlenbach</b> · Kader, Training, Scouting und Kabine an einem Ort. In einer Minute zeig ich dir, was für dich wichtig ist.</p>
    <div class="onb-chips"><span class="rolechip r-${svEsc(svRole())}"><i></i>${svEsc(R)}</span>${auf.map(a=>`<span class="onb-chip" style="--c:${a.c}">${SVI(a.ic)} ${svEsc(a.t)}</span>`).join('')}</div>
    <div class="onb-btns"><button class="btn onb-go" data-next>Los geht's</button></div>`;
  if(st==='revier')h=`<h2>Das ist dein Revier</h2><p class="onb-sub">Zugeschnitten auf deine Aufgaben${auf.length?'':' · der Admin kann dir jederzeit Bereiche zuteilen'}.</p>
    <div class="onb-cards">${auf.map(a=>`<div class="onb-card" style="--c:${a.c}"><div class="onb-ic">${SVI(a.ic)}</div><div><b>${svEsc(a.t)}</b>${a.d.map(x=>`<span>${svEsc(x)}</span>`).join('')}</div></div>`).join('')}
      ${canTraining()?`<div class="onb-card" style="--c:#5b9bff"><div class="onb-ic">${SVI('chat')}</div><div><b>Dein Co-Trainer</b><span>Frag die KI zu Aufstellung, Gegner, Training oder einem Spieler, auch mit Foto, Screenshot oder Sprache.</span></div></div>`:''}</div>
    <div class="onb-btns"><button class="btn onb-go" data-next>Weiter</button></div>`;
  if(st==='popups'){ const keys=Object.keys(ONB.pop);
    h=`<div class="onb-big">🔔</div><h2>Darf ich dich anstupsen?</h2>
    <p class="onb-sub">Damit nichts liegen bleibt, meldet sich die App mit kleinen Pop-ups · <b>nur wenn wirklich etwas zu tun ist</b>, nie Werbung. Ohne dein OK kommt keins. Ändern kannst du das jederzeit unter „Mein Konto“.</p>
    ${keys.length?`<div class="onb-toggles">${keys.map(k=>`<button type="button" class="onb-tg${ONB.pop[k]?' on':''}" data-tg="${k}"><div class="onb-ic" style="--c:${SV_AUF[k].c}">${SVI(SV_AUF[k].ic)}</div><div><b>${svEsc(SV_AUF[k].t)}</b><span>${svEsc(SV_AUF[k].pop)}</span></div><i class="onb-sw"></i></button>`).join('')}</div>`:'<p class="onb-sub">Für deine Rolle gibt es gerade keine Pop-ups.</p>'}
    <div class="onb-btns"><button class="btn onb-go" id="onbPopYes">${keys.length?'Ja, so passt es':'Weiter'}</button>${keys.length?'<button class="btn ghost" id="onbPopNo">Lieber keine Pop-ups</button>':''}</div>`; }
  if(st==='daten')h=`<div class="onb-big">🔒</div><h2>Deine Daten & Uploads</h2>
    <div class="onb-list"><div>📝 <span>Was du einträgst (Anwesenheit, Notizen, Strafen, Scouting) wird für das Trainerteam gespeichert.</span></div>
      <div>📎 <span>Fotos, Screenshots oder Dateien, die du dem Co-Trainer gibst, werden hochgeladen und von der KI ausgewertet.</span></div>
      <div>👀 <span>Nutzungszeit und Fragen an den Co-Trainer sieht ausschließlich der Admin.</span></div>
      <div>🏟️ <span>Alles bleibt im Verein, keine Werbung, kein Weitergeben.</span></div></div>
    <p class="onb-sub">Beim ersten Foto fragt dein Handy noch einmal nach Zugriff auf Kamera bzw. Fotos: einfach erlauben.</p>
    <div class="onb-btns"><button class="btn onb-go" id="onbDatYes">Einverstanden</button><button class="btn ghost" id="onbDatNo">Ohne Uploads weiter</button></div>`;
  if(st==='tour')h=`<div class="onb-big">🧭</div><h2>Kurzer Rundgang?</h2><p class="onb-sub">Ich zeig dir in ${svOnbTourSteps().length} Schritten, wo alles ist, mit Pfeil direkt in der App.</p>
    <div class="onb-btns"><button class="btn onb-go" id="onbTour">Zeig's mir</button><button class="btn ghost" id="onbEnd">Überspringen</button></div>`;
  el.innerHTML=`<div class="onb-box" data-step="${st}">${svOnbDots()}${h}</div>`;
  el.querySelectorAll('.onb-chip svg,.onb-ic svg').forEach(s=>s.setAttribute('aria-hidden','true'));
  const next=()=>{ ONB.i++; svOnbDraw(); };
  el.querySelectorAll('[data-next]').forEach(b=>b.onclick=next);
  el.querySelectorAll('[data-tg]').forEach(b=>b.onclick=()=>{ ONB.pop[b.dataset.tg]=!ONB.pop[b.dataset.tg]; b.classList.toggle('on'); });
  const py=document.getElementById('onbPopYes'), pn=document.getElementById('onbPopNo');
  if(py)py.onclick=async()=>{ try{ await svPrefsSet({popups:ONB.pop}); }catch(e){ kToast('⚠️ '+e.message); } next(); };
  if(pn)pn.onclick=async()=>{ const off={}; Object.keys(ONB.pop).forEach(k=>off[k]=false); try{ await svPrefsSet({popups:off}); }catch(e){ kToast('⚠️ '+e.message); } next(); };
  const dy=document.getElementById('onbDatYes'), dn=document.getElementById('onbDatNo');
  if(dy)dy.onclick=async()=>{ try{ await svPrefsSet({daten_ok:true}); }catch(e){ kToast('⚠️ '+e.message); } next(); };
  if(dn)dn.onclick=async()=>{ try{ await svPrefsSet({daten_ok:false}); }catch(e){} next(); };
  const tt=document.getElementById('onbTour'), te=document.getElementById('onbEnd');
  if(tt)tt.onclick=()=>{ document.getElementById('onb').remove(); svTour(); };
  if(te)te.onclick=()=>svOnbDone();
}
async function svOnbDone(){
  const el=document.getElementById('onb'); if(el)el.remove(); svTourEnd(); document.body.classList.remove('onb-open');
  try{ await svPrefsSet({onboarding:true}); }catch(e){ console.warn(e); }
  kToast(`✓ Alles klar, ${svFirst(SVU.name)||'Coach'} · viel Spaß!`); svPopupsRun();
}

/* ---------- Rundgang mit Maske und Pfeil ---------- */
function svVis(sels){ for(const s of sels){ for(const el of document.querySelectorAll(s)){ const r=el.getBoundingClientRect(); if(r.width>4&&r.height>4&&r.bottom>0&&r.top<innerHeight&&getComputedStyle(el).visibility!=='hidden')return el; } } return null; }
function svOnbTourSteps(){
  const A=svAufgaben(), S=[];
  if(canTraining())S.push({sel:['#tbKi'],t:'Dein Co-Trainer',d:'Hier fragst du die KI. Aufstellung, Gegner, Trainingsplan. Tipp auf 📎 für Fotos oder Screenshots, auf 🎙️ zum Sprechen.'});
  if(A.includes('training')||A.includes('kasse'))S.push({sel:['.tabbar .ti[data-tab="kabine"]','.snav [data-tab="kabine"]','#tMore'],t:'Kabine',d:A.includes('kasse')&&!A.includes('training')?'Hier ist die Mannschaftskasse: gemeldete Zahlungen abhaken, Kontostand Bank/PayPal, Strafen.':'Abstimmungen fürs Training und die Mannschaftskasse. Das Einladen-Pop-up kommt vor jedem Training von selbst.'});
  if(A.includes('training'))S.push({sel:['.tabbar .ti[data-tab="training"]','.snav [data-tab="training"]'],t:'Training',d:'Anwesenheit, Spiele und die Saison-Statistik. Vieles kommt automatisch aus den Spielberichten.'});
  if(A.includes('scouting'))S.push({sel:['.tabbar .ti[data-tab="scout"]','.snav [data-tab="scout"]','#tMore'],t:'Scouting',d:'Radar, Datenbank und Rohdiamanten. Neue Treffer melden sich per Pop-up, wenn du es erlaubt hast.'});
  if(A.includes('kader'))S.push({sel:['.tabbar .ti[data-tab="kaderplan"]','.tabbar .ti[data-tab="kandidaten"]','.snav [data-tab="kaderplan"]','#tMore'],t:'Kaderplanung',d:'Kaderplan, Kandidaten und Schattenelf für die nächste Saison.'});
  S.push({sel:['#tMore','.snav [data-me]','[data-me]'],t:'Alles Weitere & Mein Konto',d:'Unter „Mehr“ findest du alle Bereiche und dein Konto, dort kannst du Pop-ups jederzeit an- oder ausschalten und diese Einführung nochmal ansehen.'});
  return S;
}
const TOUR={i:0,S:[]};
function svTour(){
  try{ goTab('home'); }catch(e){}
  TOUR.S=svOnbTourSteps(); TOUR.i=0;
  const m=document.createElement('div'); m.id='onbTourL'; m.innerHTML='<div id="onbSpot"></div><svg id="onbArrow" viewBox="0 0 120 120" aria-hidden="true"><path d="M10 10 C 70 10, 100 40, 100 100" fill="none" stroke="#fff" stroke-width="5" stroke-linecap="round" stroke-dasharray="1 11"/><path d="M84 88 L100 108 L112 86" fill="none" stroke="#fff" stroke-width="5" stroke-linecap="round" stroke-linejoin="round"/></svg><div id="onbTip"></div>';
  document.body.appendChild(m); document.body.classList.add('onb-open');
  addEventListener('resize',svTourPlace); setTimeout(svTourShow,350);
}
function svTourShow(){
  const L=document.getElementById('onbTourL'); if(!L)return; const s=TOUR.S[TOUR.i]; if(!s)return svOnbDone();
  const el=svVis(s.sel); if(!el){ TOUR.i++; return svTourShow(); }
  TOUR.el=el; const last=TOUR.i===TOUR.S.length-1;
  document.getElementById('onbTip').innerHTML=`<small>${TOUR.i+1} / ${TOUR.S.length}</small><b>${svEsc(s.t)}</b><p>${svEsc(s.d)}</p><div class="onb-tipb"><button class="btn sm" id="onbTN">${last?'Fertig':'Weiter'}</button>${last?'':'<button class="btn ghost sm" id="onbTS">Überspringen</button>'}</div>`;
  document.getElementById('onbTN').onclick=()=>{ TOUR.i++; svTourShow(); };
  const sk=document.getElementById('onbTS'); if(sk)sk.onclick=()=>svOnbDone();
  svTourPlace();
}
function svTourPlace(){
  const el=TOUR.el, sp=document.getElementById('onbSpot'), tip=document.getElementById('onbTip'), ar=document.getElementById('onbArrow'); if(!el||!sp)return;
  const r=el.getBoundingClientRect(), pad=8, W=innerWidth, H=innerHeight;
  Object.assign(sp.style,{left:(r.left-pad)+'px',top:(r.top-pad)+'px',width:(r.width+2*pad)+'px',height:(r.height+2*pad)+'px'});
  const below=r.top<H*0.45, tw=Math.min(320,W-32), tx=Math.max(16,Math.min(W-tw-16,r.left+r.width/2-tw/2));
  tip.style.width=tw+'px'; tip.style.left=tx+'px';
  if(below){ tip.style.top=(r.bottom+pad+84)+'px'; tip.style.bottom='auto'; } else { tip.style.bottom=(H-r.top+pad+84)+'px'; tip.style.top='auto'; }
  // Pfeil von der Sprechblase zum markierten Element
  const cx=r.left+r.width/2, left=cx>W/2;
  ar.style.left=(left?cx-104:cx-16)+'px';
  ar.style.top=(below?r.bottom+pad-4:r.top-pad-80)+'px';
  ar.style.transform=`scaleX(${left?1:-1}) scaleY(${below?-1:1})`;
}
function svTourEnd(){ const L=document.getElementById('onbTourL'); if(L)L.remove(); removeEventListener('resize',svTourPlace); TOUR.el=null; }

/* ---------- Radar-Pop-up (Scouting) ---------- */
function svScoutPopup(){
  if(!svPopOk('scouting')||!svAufgaben().includes('scouting')||!canScout()||!VR.radarLoaded)return;
  if(SV_PREFS.skip){ let t=''; try{ t=localStorage.getItem('sv_spop_test')||''; }catch(e){} if(!t)return; }   // automatisierte Browser: nur auf Wunsch
  if(document.querySelector('#overlay.open')||document.getElementById('onb')||document.getElementById('onbTourL'))return;
  const seen=rdSeen(), N=VR.radar.filter(r=>r.created_at>seen&&r.lvl!=='info'); if(!N.length)return;
  const last=N.map(r=>r.created_at).sort().pop(); let shown=''; try{ shown=localStorage.getItem('sv_spop')||''; }catch(e){}
  if(shown>=last||window.__svSPop===last)return; window.__svSPop=last;
  try{ localStorage.setItem('sv_spop',last); }catch(e){}   // 0.42: gilt als gesehen, sobald es einmal erschienen ist
  svModal(`<div class="kbpop"><div class="kbpop-ic scout">${SVI('radar')}</div><span class="trpill">Scouting</span><h2>${N.length} neue Radar-Meldung${N.length>1?'en':''}</h2>
    <p class="note">${seen?'Seit deinem letzten Besuch':'Aktuell'} hat das Radar das hier gefunden:</p><div class="onb-rd">${N.slice(0,3).map(rdItem).join('')}</div>
    <button class="btn kbpop-go" id="svSpGo">${SVI('radar')} Zum Radar</button><div class="btnrow"><button class="btn ghost sm" id="svSpL">Später</button></div></div>`);
  const later=()=>{ try{ localStorage.setItem('sv_spop',last); }catch(e){} };
  document.getElementById('svSpGo').onclick=()=>{ later(); closeOverlay(); VR.rf='alle'; goTab('radar'); };
  document.getElementById('svSpL').onclick=()=>{ later(); closeOverlay(); };
}

/* ---------- Mein Konto: Pop-ups & Einführung ---------- */
{ const _acc3=svAccount; svAccount=function(){ const r=_acc3.apply(this,arguments); try{ svAccountPrefs(); }catch(e){ console.warn(e); } return r; }; }
function svAccountPrefs(){
  const M=document.getElementById('modal'); if(!M||!SV_PREFS)return; const A=svAufgaben();
  const keys=['training','kasse','scouting'].filter(k=>A.includes(k)||(k==='kasse'&&SV_PREFS.kassenwart));
  const sec=document.createElement('div'); sec.className='editsec'; sec.id='svPrefSec';
  sec.innerHTML=`<h4>Pop-ups & Einführung</h4>${keys.length?`<div class="onb-toggles sm">${keys.map(k=>`<button type="button" class="onb-tg${(SV_PREFS.popups||{})[k]!==false?' on':''}" data-ptg="${k}"><div class="onb-ic" style="--c:${SV_AUF[k].c}">${SVI(SV_AUF[k].ic)}</div><div><b>${svEsc(SV_AUF[k].t)}</b><span>${svEsc(SV_AUF[k].pop)}</span></div><i class="onb-sw"></i></button>`).join('')}</div>`:'<p class="note">Für deine Aufgaben gibt es keine Pop-ups.</p>'}
    <p class="note">Daten & Uploads: ${SV_PREFS.daten_ok_at?'✓ einverstanden':'noch nicht zugestimmt: der Co-Trainer fragt beim ersten Upload.'}</p>
    <div class="btnrow"><button class="btn ghost sm" id="svOnbAgain">${SVI('refresh')} Einführung nochmal ansehen</button></div>`;
  const first=M.querySelector('.editsec'); if(first)first.before(sec); else M.appendChild(sec);
  sec.querySelectorAll('[data-ptg]').forEach(b=>b.onclick=async()=>{ const k=b.dataset.ptg, on=!b.classList.contains('on');
    try{ await svPrefsSet({popups:{[k]:on}}); if(k==='training'&&typeof KB!=='undefined')KB.popup=on; b.classList.toggle('on',on); kToast(on?'✓ Pop-ups für '+SV_AUF[k].t+' an':'Pop-ups für '+SV_AUF[k].t+' aus'); }catch(e){ kToast('⚠️ '+e.message); } });
  document.getElementById('svOnbAgain').onclick=()=>{ closeOverlay(); SV_PREFS.skip=false; svOnbStart(true); };
}

/* ---------- Uploads erst nach Einverständnis ---------- */
{ const _tas=trAttSetup; trAttSetup=function(){ const r=_tas.apply(this,arguments);
  const b=document.getElementById('trcClip'), inp=document.getElementById('trcFile'); if(b&&inp){ const orig=b.onclick;
    b.onclick=e=>{ if(!SV_PREFS||SV_PREFS.daten_ok_at||SV_PREFS.skip)return orig&&orig.call(b,e); svDatenAsk(()=>inp.click()); }; }
  return r; }; }
function svDatenAsk(then){
  const box=document.createElement('div'); box.className='onb-ask'; box.innerHTML=`<div class="onb-askc"><b>📎 Upload erlauben?</b><p>Fotos, Screenshots und Dateien, die du dem Co-Trainer gibst, werden hochgeladen und von der KI ausgewertet. Sie bleiben im Verein.</p>
    <div class="btnrow"><button class="btn sm" id="svDaY">Einverstanden</button><button class="btn ghost sm" id="svDaN">Nein, danke</button></div></div>`;
  document.body.appendChild(box);
  document.getElementById('svDaY').onclick=()=>{ box.remove(); then(); svPrefsSet({daten_ok:true}).catch(()=>{}); };
  document.getElementById('svDaN').onclick=()=>box.remove();
}

/* ---------- Pop-ups erst nach der Einführung ---------- */
{ const _kp=kbPopup; kbPopup=function(){ if(!svPopOk('training'))return; return _kp.apply(this,arguments); }; }
{ const _kk=kbKassePopup; kbKassePopup=function(){ if(!svPopOk('kasse'))return; return _kk.apply(this,arguments); }; }
{ const _va=vrAfter; vrAfter=function(){ const r=_va.apply(this,arguments); setTimeout(()=>{ try{ svScoutPopup(); }catch(e){} },900); return r; }; }
{ const _si8=svInit; svInit=function(){ const r=_si8.apply(this,arguments); setTimeout(svPrefsLoad,700); return r; }; }

/* ---------- Admin: Aufgaben je Person (Einladen & Team-Liste) ---------- */
let SV_AUFMAP={}, SV_INV_AUF=null;
const SV_AUF_STD={admin:['training','kasse','scouting','kader'],vorstand:['scouting','kader'],planer:['scouting','kader'],trainer:['training','scouting'],viewer:[]};
{ const _adm=SVB.admin; SVB.admin=async function(action,payload){ const r=await _adm.apply(this,arguments);
  if(action==='invite'&&r&&r.user_id&&SV_INV_AUF){ try{ await SVB.sb.rpc('admin_aufgaben_set',{p_user:r.user_id,p_aufgaben:SV_INV_AUF}); }catch(e){ console.warn(e); } SV_INV_AUF=null; }
  return r; }; }
{ const _ar=svAdminRender; svAdminRender=async function(){ const r=await _ar.apply(this,arguments); try{ await svAdminAuf(); }catch(e){ console.warn(e); } return r; }; }
function svAufChips(sel,attr){ return Object.entries(SV_AUF).map(([k,a])=>`<button type="button" class="pchip auf${sel.includes(k)?' on':''}" ${attr}="${k}" style="--c:${a.c}">${svEsc(a.t)}</button>`).join(''); }
async function svAdminAuf(){
  const P=document.getElementById('panel-admin'); if(!P||!canManage())return;
  const {data}=await SVB.sb.rpc('admin_aufgaben'); SV_AUFMAP=data||{};
  const f=P.querySelector('#svInv'); if(f&&!f.querySelector('.invauf')){
    const rs=f.querySelector('#svInvRole'); let touched=false; SV_INV_AUF=(SV_AUF_STD[rs.value]||[]).slice();
    const d=document.createElement('div'); d.className='invauf'; f.querySelector('#svInvGo').before(d);
    const draw=()=>{ d.innerHTML=`<label>Aufgaben <small>(bestimmen Einführung & Pop-ups)</small></label><div class="chips">${svAufChips(SV_INV_AUF,'data-ia')}</div>`;
      d.querySelectorAll('[data-ia]').forEach(b=>b.onclick=()=>{ touched=true; const k=b.dataset.ia; SV_INV_AUF=SV_INV_AUF.includes(k)?SV_INV_AUF.filter(x=>x!==k):SV_INV_AUF.concat(k); draw(); }); };
    rs.addEventListener('change',()=>{ if(!touched){ SV_INV_AUF=(SV_AUF_STD[rs.value]||[]).slice(); draw(); } }); draw();
  }
  P.querySelectorAll('.urow[data-u]').forEach(row=>{ const id=row.dataset.u, a=SV_AUFMAP[id]; if(!a||row.querySelector('.uauf'))return;
    const s=document.createElement('button'); s.type='button'; s.className='uauf'; s.dataset.auf=id;
    s.innerHTML=`${(a.aufgaben||[]).map(k=>`<i style="--c:${SV_AUF[k].c}">${svEsc(SV_AUF[k].t)}</i>`).join('')||'<i>keine Aufgaben</i>'}${a.onboarding?' <em>✓ Einführung</em>':''}`;
    const nm=row.querySelector('.nm'); if(nm)nm.appendChild(s); s.onclick=()=>svAufEdit(id); });
}
function svAufEdit(id){
  const u=(SV_USERS||[]).find(x=>x.id===id)||{}, a=(SV_AUFMAP[id]||{}).aufgaben||[]; let sel=a.slice();
  svModal(`<div class="mhead"><div class="uav r-${svEsc(u.role||'')}" style="width:46px;height:46px;border-radius:14px">${svEsc(svIni(u.name||u.email||''))}</div><div><h2 style="margin:0">Aufgaben von ${svEsc(svFirst(u.name)||u.email||'')}</h2><div class="msub">Bestimmen die persönliche Einführung und welche Pop-ups angeboten werden. „Mannschaftskasse“ macht die Person zum Kassenwart.</div></div></div>
    <div class="chips" id="svAufE"></div><div class="btnrow sbact"><button class="btn" id="svAufS">Speichern</button><button class="btn ghost" id="svAufC">Abbrechen</button></div>`);
  const E=document.getElementById('svAufE'), draw=()=>{ E.innerHTML=svAufChips(sel,'data-ae'); E.querySelectorAll('[data-ae]').forEach(b=>b.onclick=()=>{ const k=b.dataset.ae; sel=sel.includes(k)?sel.filter(x=>x!==k):sel.concat(k); draw(); }); }; draw();
  document.getElementById('svAufC').onclick=()=>closeOverlay();
  document.getElementById('svAufS').onclick=async()=>{ const {error}=await SVB.sb.rpc('admin_aufgaben_set',{p_user:id,p_aufgaben:sel}); if(error)return kToast('⚠️ '+error.message); closeOverlay(); kToast('✓ Aufgaben gespeichert'); svAdminRender(true); };
}

/* =====================================================================
   SV/BSC Scout · Runde 17: Schlaues Scouting
   - Jede Empfehlung: ⭐ Merkliste · 🔔 Beobachten (Spieltag-Updates) · 🚫 Kein Interesse (dann nie wieder gemeldet) · 🔎 KI-Bericht
   - Positions-Bedarf (Prio, Horizont, Soll) steuert, was überhaupt gemeldet wird. 5 Stürmer im Kader = keine Stürmer-Tipps
   - Saisonplanung über drei Spielzeiten, Lücken → KI-Suche per Knopf
   - KI-Scouting-Aufträge laufen im Hintergrund, Meldung (App + Push), sobald fertig
   - Statt 35 Meldungen: ein Scouting-Briefing mit den 3 wichtigsten
   ===================================================================== */
const SC2={loaded:false,follow:new Set(),bedarf:[],plan:[],jobs:[],meld:[],season:null};
const SC2_POS=[['TW','Torwart'],['IV','Innenverteidigung'],['AV','Außenverteidigung'],['ZM','Zentrales Mittelfeld'],['OM','Offensives Mittelfeld'],['ST','Sturm/Flügel']];
const SC2_PN=Object.fromEntries(SC2_POS);
const SC2_SOLL={TW:3,IV:4,AV:4,ZM:5,OM:2,ST:4};
const SC2_PRIO=[['hoch','Hoch'],['mittel','Mittel'],['niedrig','Niedrig'],['kein','Kein Bedarf']];
const SC2_HOR=[['sofort','Sofort'],['sommer','Zum Sommer'],['langfristig','Langfristig']];
const SC2_NAH={TW:[],IV:['AV'],AV:['IV'],ZM:['OM'],OM:['ZM','ST'],ST:['OM']};

function sc2Pos(p){ const x=String((p&&p.pos)||'').toUpperCase(); if(x==='FLÜGEL'||x==='FLUEGEL')return 'ST'; return SC2_PN[x]?x:null; }
function sc2Age(p){ if(p&&p.geb&&/^\d{4}/.test(p.geb)){ const b=new Date(p.geb); if(!isNaN(b)){ const n=new Date(); let a=n.getFullYear()-b.getFullYear(); if(n.getMonth()<b.getMonth()||(n.getMonth()===b.getMonth()&&n.getDate()<b.getDate()))a--; return a; } } return p&&p.alter!=null?+p.alter:null; }
function sc2Seasons(){ const n=new Date(), y=n.getFullYear(), a=n.getMonth()>=6?y:y-1; return [0,1,2].map(i=>String((a+i)%100).padStart(2,'0')+String((a+i+1)%100).padStart(2,'0')); }
const sc2SN=s=>s.slice(0,2)+'/'+s.slice(2);
function sc2No(pid){ const p=pid&&trP(pid); return !!(p&&(crmOf(p).s==='no')); }
function sc2Own(){ return players.filter(p=>p.own&&!p.isJugend&&!p.verzicht&&p.kader===1); }
function sc2Ist(pos){ return sc2Own().filter(p=>sc2Pos(p)===pos).length; }

/* ---------- Laden ---------- */
async function sc2Load(force){
  if(!canScout()||(SC2.loading)||(SC2.loaded&&!force))return; SC2.loading=true;
  try{
    const since=new Date(Date.now()-60*864e5).toISOString();
    const [f,b,pl,j,m]=await Promise.all([SVB.sb.from('scout_follow').select('player_id,created_at,last_stand'),SVB.sb.from('kader_bedarf').select('*'),SVB.sb.from('saison_plan').select('*'),
      SVB.sb.from('scout_jobs').select('*').gte('created_at',since).order('created_at',{ascending:false}).limit(40),SVB.sb.from('meldungen').select('*').order('created_at',{ascending:false}).limit(60)]);
    SC2.follow=new Set((f.data||[]).map(x=>x.player_id)); SC2.bedarf=b.data||[]; SC2.plan=pl.data||[]; SC2.jobs=j.data||[]; SC2.meld=m.data||[];
    SC2.loaded=true;
  }catch(e){ console.warn('Scouting',e); SC2.loaded=true; }
  SC2.loading=false; sc2After();
  // 0.99.55: Briefing nach dem ersten vollständigen Laden anbieten, nicht nur wenn der Zufall der Ladezeiten es erlaubt (einmal je Seitenaufruf)
  if(!window.__sc2PopTry){ window.__sc2PopTry=1; setTimeout(()=>{ try{ svScoutPopup(); }catch(e){} },1200); }
}
function sc2After(){
  try{ if(document.querySelector('#panel-scout.active'))sc2ScoutBox(); }catch(e){ console.warn(e); }
  try{ if(document.querySelector('#panel-kaderplan.active'))sc2PlanBox(); }catch(e){ console.warn(e); }
  try{ if(document.querySelector('#panel-radar.active'))rdRender(); }catch(e){}
  try{ sc2HomeCard(); }catch(e){}
  try{ if(typeof vrHomeCard==='function')vrHomeCard(); }catch(e){}   // Übersicht: weggeklickte Spieler verschwinden sofort
  try{ sc2JobPopup(); }catch(e){ console.warn(e); }
}
function sc2Realtime(){
  if(SC2.rt||!SVB.sb.channel)return; SC2.rt=true;
  try{ SVB.sb.channel('sc2').on('postgres_changes',{event:'INSERT',schema:'public',table:'meldungen'},()=>sc2Load(true))
      .on('postgres_changes',{event:'UPDATE',schema:'public',table:'scout_jobs'},()=>sc2Load(true)).subscribe(); }catch(e){}
}

/* ---------- Bedarf & Relevanz ---------- */
function sc2Bedarf(pos){ return SC2.bedarf.find(b=>b.pos===pos)||null; }
function sc2Vorschlag(pos){
  const own=sc2Own().filter(p=>sc2Pos(p)===pos), soll=(sc2Bedarf(pos)||{}).soll??SC2_SOLL[pos], ist=own.length, alt=own.filter(p=>(sc2Age(p)||0)>=31).length;
  if(ist<soll-1)return {prio:'hoch',horizont:'sofort',why:`${ist} von ${soll} · es fehlen Spieler`};
  if(ist<soll)return {prio:'mittel',horizont:'sommer',why:`${ist} von ${soll} · eine Lücke`};
  if(alt&&ist-alt<soll)return {prio:'mittel',horizont:'langfristig',why:`${alt} Spieler 31+ · Nachfolge planen`};
  if(ist>soll)return {prio:'kein',horizont:'sommer',why:`${ist} im Kader: mehr als genug`};
  return {prio:'niedrig',horizont:'langfristig',why:`${ist} von ${soll} · besetzt`};
}
function sc2Need(pos){ if(!pos)return 1.5; const b=sc2Bedarf(pos); const w={hoch:3,mittel:2,niedrig:1,kein:0}; return b?w[b.prio]:{hoch:3,mittel:2,niedrig:1,kein:0.4}[sc2Vorschlag(pos).prio]; }
function sc2NeedOf(p){ const pos=sc2Pos(p); if(!pos)return 1.5; let n=sc2Need(pos); if(p.pos2&&SC2_PN[p.pos2])n=Math.max(n,sc2Need(p.pos2)); const b=sc2Bedarf(pos); if(!(b&&b.prio==='kein'))(SC2_NAH[pos]||[]).forEach(x=>n=Math.max(n,sc2Need(x)*0.6)); return n; }  // „Kein Bedarf“ gilt – verwandte Positionen retten es nicht
function sc2Score(r){
  const p=r.player_id&&trP(r.player_id); if(!p||p.own)return r.typ==='team'?-1:0;
  const need=sc2NeedOf(p); if(need<=0)return 0;
  const w=(r.data&&r.data.w)||50, ai=r.ai&&r.ai.score!=null?r.ai.score:null, lvl={hoch:1.2,mittel:1,info:0.5}[r.lvl]||1;
  let s=need*(0.6+w/100)*lvl*(ai!=null?0.5+ai/100:1)*20;
  if(SC2.follow.has(p.id))s+=10; if(p.star)s+=6;
  return Math.round(s);
}
function sc2Relevant(rows,n){ return rows.filter(r=>r.player_id&&!sc2No(r.player_id)&&!(trP(r.player_id)||{}).own).map(r=>({r,s:sc2Score(r)})).filter(x=>x.s>0)
  .sort((a,b)=>b.s-a.s).filter((x,i,a)=>a.findIndex(y=>y.r.player_id===x.r.player_id)===i).slice(0,n||5); }

/* ---------- Entscheidungen je Spieler ---------- */
function sc2Btns(p,compact){
  if(!p||p.own)return ''; const C=crmOf(p), f=SC2.follow.has(p.id), no=C.s==='no';
  if(no)return `<div class="sc2b${compact?' sm':''}" data-sc2p="${svEsc(p.id)}"><span class="sc2no">🚫 Kein Interesse, wird nicht mehr gemeldet</span><button type="button" data-sc2="undo">Rückgängig</button></div>`;
  return `<div class="sc2b${compact?' sm':''}" data-sc2p="${svEsc(p.id)}">
    <button type="button" class="${p.star?'on':''}" data-sc2="star" title="Merkliste">⭐${compact?'':' Merkliste'}</button>
    <button type="button" class="${f?'on':''}" data-sc2="follow" title="Spieltag für Spieltag auf dem Laufenden">🔔${compact?'':f?' Beobachtet':' Beobachten'}</button>
    <button type="button" data-sc2="no" title="Kein Interesse, nie wieder melden">🚫${compact?'':' Kein Interesse'}</button>
    <button type="button" data-sc2="job" title="Großen Scouting-Bericht erstellen">🔎${compact?'':' KI-Bericht'}</button></div>`;
}
function sc2Wire(root,after){
  (root||document).querySelectorAll('[data-sc2p] [data-sc2]').forEach(b=>b.onclick=async e=>{ e.stopPropagation(); const pid=b.closest('[data-sc2p]').dataset.sc2p, p=trP(pid); if(!p)return; const k=b.dataset.sc2;
    try{
      if(k==='star'){ const on=!p.star; crmSet(p.id,{f:on?1:undefined}); try{crmApply();}catch(x){} kToast(on?'⭐ '+p.name+' auf der Merkliste':'Von der Merkliste genommen'); }
      if(k==='follow'){ if(SC2.follow.has(p.id)){ const {error}=await SVB.sb.from('scout_follow').delete().eq('player_id',p.id); if(error)throw error; SC2.follow.delete(p.id); kToast('🔕 '+p.name+' nicht mehr beobachtet'); }
        else { const {error}=await SVB.sb.from('scout_follow').insert({player_id:p.id}); if(error)throw error; SC2.follow.add(p.id); kToast('👁 '+p.name+' ist in deinem Blickfeld. Montags kommt dein Wochenbericht.'); } }
      if(k==='no'){ crmSet(p.id,{s:'no'}); try{crmApply();}catch(x){} if(SC2.follow.has(p.id)){ await SVB.sb.from('scout_follow').delete().eq('player_id',p.id); SC2.follow.delete(p.id); } kToast('🚫 '+p.name+' · keine Meldungen mehr'); }
      if(k==='undo'){ crmSet(p.id,{s:undefined}); try{crmApply();}catch(x){} kToast('↩️ '+p.name+' wird wieder gemeldet'); }
      if(k==='job'){ await sc2JobStart({art:'spieler',player_id:p.id}); }
    }catch(x){ kToast('⚠️ '+(x.message||x)); }
    if(after)after(); else sc2After(); });
}
// Radar: jede Meldung bekommt die Entscheidungsknöpfe, „Kein Interesse“ verschwindet
{ const _ri=rdItem; rdItem=function(r){ const p0=r&&r.player_id&&trP(r.player_id); if(p0&&!p0.own&&sc2No(p0.id))return '';   // Kein Interesse: Meldung verschwindet überall
  const h=_ri.apply(this,arguments); const p=r.player_id&&trP(r.player_id); return p&&!p.own?h.replace(/<\/div>\s*$/,'')+sc2Btns(p,true)+'</div>':h; }; }
{ const _rr=rdRender; rdRender=function(){ const all=VR.radar, hid=all.filter(r=>sc2No(r.player_id)).length; VR.radar=all.filter(r=>!sc2No(r.player_id));
  try{ _rr.apply(this,arguments); } finally{ VR.radar=all; }
  const P=document.getElementById('panel-radar'); if(!P)return; sc2Wire(P,()=>rdRender());
  if(!P.querySelector('#sc2Rel')&&VR.rf==='alle'){ const R=sc2Relevant(VR.radar.filter(r=>r.lvl!=='info'),5); const tabs=P.querySelector('.rdf');
    if(R.length&&tabs)tabs.insertAdjacentHTML('afterend',`<div class="card sc2rel" id="sc2Rel"><h3 class="trh">${SVI('target')} Für euch am wichtigsten <small>nach Bedarf & Einschätzung</small></h3>${R.map(x=>rdItem(x.r)).join('')}</div>`); sc2Wire(P,()=>rdRender());
    P.querySelectorAll('#sc2Rel [data-svp]').forEach(x=>x.onclick=()=>openModal(x.dataset.svp)); }
  if(hid)P.insertAdjacentHTML('beforeend',`<div class="note">${hid} Meldung${hid>1?'en':''} ausgeblendet (Kein Interesse).</div>`); }; }
// Spielerprofil: Entscheidungsleiste
{ const _om=openModal; openModal=function(id){ const r=_om.apply(this,arguments); try{ const p=trP(id); const M=document.getElementById('modal'); if(p&&!p.own&&M&&canScout()&&!M.querySelector('.sc2prof')){
    const d=document.createElement('div'); d.className='sc2prof'; d.innerHTML=sc2Btns(p,false); const bar=M.querySelector('#crmbar'); if(bar)bar.before(d); else { const h=M.querySelector('.mhead'); if(h)h.after(d); else M.prepend(d); }
    const redraw=()=>{ d.innerHTML=sc2Btns(trP(id),false); sc2Wire(d,redraw); }; sc2Wire(d,redraw); } }catch(e){ console.warn(e); } return r; }; }

/* ---------- Scouting-Seite: Meldungen, Beobachtet, Aufträge ---------- */
function sc2ScoutBox(){
  const P=document.getElementById('panel-scout'); if(!P||!canScout())return;
  let el=document.getElementById('sc2Box'); if(!el){ el=document.createElement('div'); el.id='sc2Box'; const s=document.getElementById('rdStrip'); if(s)s.after(el); else P.prepend(el); }
  const unread=SC2.meld.filter(m=>!m.gelesen_at), F=[...SC2.follow].map(trP).filter(Boolean), J=SC2.jobs.slice(0,6);
  const last=pid=>SC2.meld.find(m=>m.player_id===pid&&m.art==='scout_update');
  el.innerHTML=`${unread.length?`<div class="card sc2meld"><div class="svc-h"><h3>${SVI('bell')} Neu für dich <span class="pill on">${unread.length}</span></h3><button class="btn ghost sm" id="sc2Read">Alle gelesen</button></div>
      ${unread.slice(0,6).map(m=>`<div class="sc2m" data-m="${m.id}"><b>${svEsc(m.titel)}</b><span>${svEsc(m.text||'')}</span><small>${new Date(m.created_at).toLocaleString('de-DE',{weekday:'short',day:'2-digit',month:'2-digit',hour:'2-digit',minute:'2-digit'})}</small></div>`).join('')}</div>`:''}
    <div class="vrgrid"><div class="card"><div class="svc-h"><h3>${SVI('eye')} Beobachtet <small>${F.length}</small></h3></div>
      ${F.length?F.map(p=>{ const m=last(p.id), c=p.cur||{}; return `<div class="sc2f" data-sc2open="${svEsc(p.id)}"><span class="tra-av">${avaHtml(p)}</span><div><b>${svEsc(p.name)}</b><span>${svEsc(m?m.text:(c.spiele!=null?`${c.tore||0} Tore in ${c.spiele} Spielen · ${c.club||p.club}`:p.club||''))}</span></div></div>`; }).join('')
        :'<div class="note">Noch niemand. Tipp bei einem Spieler auf 🔔, dann kommt nach jedem Spieltag ein kurzes Update, wie er performt.</div>'}</div>
    <div class="card"><div class="svc-h"><h3>${SVI('search')} KI-Aufträge</h3><button class="btn sm" id="sc2New">${SVI('plus')} Neuer Auftrag</button></div>
      ${J.length?J.map(j=>`<div class="sc2j s-${j.status}" data-job="${j.id}"><b>${svEsc(j.titel||'Auftrag')}</b><span>${{wartet:'⏳ wartet',laeuft:'⚙️ läuft …',fertig:'✓ fertig',fehler:'⚠️ '+svEsc(j.fehler||'Fehler')}[j.status]} · ${new Date(j.created_at).toLocaleDateString('de-DE',{day:'2-digit',month:'2-digit'})}</span></div>`).join('')
        :'<div class="note">„Scout mir den Spieler X“ oder „Wir brauchen einen Torwart“, die Suche läuft im Hintergrund, du bekommst eine Meldung, sobald sie fertig ist.</div>'}
      <div class="btnrow" style="margin-top:10px"><button class="btn ghost sm" id="sc2Exp">${SVI('download')} Scouting-Bericht (PDF/Excel)</button></div></div></div>`;
  const rd=document.getElementById('sc2Read'); if(rd)rd.onclick=async()=>{ await SVB.sb.rpc('meldungen_gelesen',{p_ids:null}); SC2.meld.forEach(m=>m.gelesen_at=m.gelesen_at||new Date().toISOString()); sc2After(); };
  el.querySelectorAll('[data-m]').forEach(x=>x.onclick=async()=>{ const m=SC2.meld.find(y=>y.id==x.dataset.m); await SVB.sb.rpc('meldungen_gelesen',{p_ids:[+x.dataset.m]}); if(m)m.gelesen_at=new Date().toISOString();
    if(m&&m.data&&m.data.job)sc2JobView(m.data.job); else if(m&&m.player_id&&m.art==='scout_update')openModal(m.player_id); else if(m&&typeof svMeldungZeigen==='function')svMeldungZeigen([m.id]); sc2After(); });
  el.querySelectorAll('[data-sc2open]').forEach(x=>x.onclick=()=>openModal(x.dataset.sc2open));
  el.querySelectorAll('[data-job]').forEach(x=>x.onclick=()=>sc2JobView(x.dataset.job));
  document.getElementById('sc2New').onclick=()=>sc2JobNew();
  document.getElementById('sc2Exp').onclick=()=>sxExport('scouting');
}
function sc2HomeCard(){
  const host=document.getElementById('vrHome')||document.getElementById('svAct'); if(!host||!canScout())return;
  let el=document.getElementById('sc2Home'); const U=SC2.meld.filter(m=>!m.gelesen_at);
  if(!U.length){ if(el)el.remove(); return; }
  if(!el){ el=document.createElement('div'); el.id='sc2Home'; host.before(el); }
  el.innerHTML=`<div class="card kbhome" data-sc2h><div><span class="trpill">${SVI('bell')} ${U.every(m=>/^scout_/.test(m.art))?'Scouting':'Meldungen'}</span><b>${U.length===1?svEsc(U[0].titel):U.length+' neue Meldungen'}</b><small>${svEsc(U.length===1?(U[0].text||''):U.slice(0,2).map(m=>m.titel).join(' · '))}</small></div></div>`;
  el.querySelector('[data-sc2h]').onclick=()=>{ if(typeof svMeldungZeigen==='function')svMeldungZeigen(U.slice(0,10).map(m=>m.id)); else goTab('scout'); };   // Tipp zeigt genau diese Meldungen
}

/* ---------- KI-Aufträge ---------- */
async function sc2JobStart(o){
  const {data:id,error}=await SVB.sb.rpc('scout_job_neu',{p_art:o.art,p_player:o.player_id||null,p_pos:o.pos||null,p_saison:o.saison||null,p_frage:o.frage||null});
  if(error)throw new Error(error.message);
  SVB.sb.functions.invoke('scout-auftrag',{body:{job:id}}).then(()=>setTimeout(()=>sc2Load(true),1500)).catch(()=>{});
  kToast('🔎 Auftrag läuft: du bekommst eine Meldung, sobald der Bericht fertig ist'); await sc2Load(true); return id;
}
function sc2JobNew(pre){
  const P=pre||{};
  svModal(`<div class="mhead"><div class="rm-ic" style="width:46px;height:46px">${SVI('search')}</div><div><h2 style="margin:0">KI-Scouting-Auftrag</h2><div class="msub">Läuft im Hintergrund: Meldung, sobald fertig</div></div></div>
    <div class="trtabs" id="sc2Art"><button class="${P.pos?'':'on'}" data-a="spieler">Einen Spieler scouten</button><button class="${P.pos?'on':''}" data-a="position">Position besetzen</button></div>
    <div id="sc2Form"></div>`);
  let art=P.pos?'position':'spieler', sel=P.player_id||null;
  const draw=()=>{ const F=document.getElementById('sc2Form'); if(!F)return;
    if(art==='spieler'){ F.innerHTML=`<input class="search" id="sc2Q" placeholder="Spieler suchen (Name oder Verein) …" autocomplete="off"><div class="sc2pick" id="sc2Pick"></div>
      <div class="field"><label>Worauf besonders achten? (optional)</label><input id="sc2Fr" maxlength="300" placeholder="z.B. Passt er als Linksfuß in unsere Viererkette?"></div>
      <div class="btnrow sbact"><button class="btn" id="sc2Go" disabled>Bericht erstellen</button></div>`;
      const list=q=>{ const n=TRC.N?TRC.N(q):String(q).toLowerCase(); const L=players.filter(p=>!p.own&&(!n||(TRC.N?TRC.N(p.name+' '+(p.club||'')):(p.name+' '+p.club).toLowerCase()).includes(n))).slice(0,8);
        document.getElementById('sc2Pick').innerHTML=L.map(p=>`<button type="button" class="${sel===p.id?'on':''}" data-pp="${svEsc(p.id)}"><b>${svEsc(p.name)}</b><small>${svEsc((p.cur&&p.cur.club)||p.club||'')} · ${svEsc(sc2PN(p))}</small></button>`).join('')||'<div class="note">Kein Treffer.</div>';
        document.querySelectorAll('#sc2Pick [data-pp]').forEach(b=>b.onclick=()=>{ sel=b.dataset.pp; document.getElementById('sc2Go').disabled=false; list(document.getElementById('sc2Q').value); }); };
      const q=document.getElementById('sc2Q'); if(sel){ const p=trP(sel); q.value=p?p.name:''; document.getElementById('sc2Go').disabled=false; } list(q.value); q.oninput=()=>list(q.value);
      document.getElementById('sc2Go').onclick=async()=>{ try{ await sc2JobStart({art:'spieler',player_id:sel,frage:document.getElementById('sc2Fr').value.trim()}); closeOverlay(); }catch(e){ kToast('⚠️ '+e.message); } };
    } else {
      const S=sc2Seasons();
      F.innerHTML=`<div class="chips" id="sc2Pos">${SC2_POS.map(([k,t])=>`<button type="button" class="pchip${(P.pos||'TW')===k?' on':''}" data-pos="${k}">${t}</button>`).join('')}</div>
        <div class="chips" id="sc2Sai">${S.map((s,i)=>`<button type="button" class="pchip${(P.saison||S[1])===s?' on':''}" data-sai="${s}">Saison ${sc2SN(s)}</button>`).join('')}</div>
        <div class="field"><label>Was brauchen wir genau? (optional)</label><input id="sc2Fr" maxlength="300" placeholder="z.B. jung, Linksfuß, aus der Region"></div>
        <div class="btnrow sbact"><button class="btn" id="sc2Go">Suche starten</button></div>`;
      F.querySelectorAll('[data-pos]').forEach(b=>b.onclick=()=>{ F.querySelectorAll('[data-pos]').forEach(x=>x.classList.toggle('on',x===b)); });
      F.querySelectorAll('[data-sai]').forEach(b=>b.onclick=()=>{ F.querySelectorAll('[data-sai]').forEach(x=>x.classList.toggle('on',x===b)); });
      document.getElementById('sc2Go').onclick=async()=>{ const pos=F.querySelector('[data-pos].on').dataset.pos, sai=F.querySelector('[data-sai].on').dataset.sai;
        try{ await sc2JobStart({art:'position',pos,saison:sai,frage:document.getElementById('sc2Fr').value.trim()}); closeOverlay(); }catch(e){ kToast('⚠️ '+e.message); } };
    } };
  document.querySelectorAll('#sc2Art [data-a]').forEach(b=>b.onclick=()=>{ art=b.dataset.a; document.querySelectorAll('#sc2Art [data-a]').forEach(x=>x.classList.toggle('on',x===b)); draw(); });
  draw();
}
function sc2PN(p){ const x=sc2Pos(p); return x?SC2_PN[x]:(p.pos||'?'); }
async function sc2JobView(id){
  let j=SC2.jobs.find(x=>x.id===id); if(!j){ const {data}=await SVB.sb.from('scout_jobs').select('*').eq('id',id).maybeSingle(); j=data; } if(!j)return kToast('Auftrag nicht gefunden');
  const e=j.ergebnis;
  if(j.status!=='fertig'||!e){ svModal(`<div class="mhead"><div class="rm-ic" style="width:46px;height:46px">${SVI('search')}</div><div><h2 style="margin:0">${svEsc(j.titel||'Auftrag')}</h2><div class="msub">${{wartet:'Wartet auf den Start',laeuft:'Läuft gerade …',fehler:'Nicht geklappt: '+svEsc(j.fehler||'')}[j.status]||''}</div></div></div>
    <div class="btnrow sbact">${j.status==='fehler'?'<button class="btn" id="sc2Retry">Nochmal versuchen</button>':''}<button class="btn ghost" id="sc2Cl">Schließen</button></div>`);
    const rt=document.getElementById('sc2Retry'); if(rt)rt.onclick=()=>{ SVB.sb.functions.invoke('scout-auftrag',{body:{job:j.id}}); closeOverlay(); kToast('🔎 Läuft nochmal'); };
    document.getElementById('sc2Cl').onclick=()=>closeOverlay(); return; }
  const ki=e.ki, st=e.saison||{};
  const sec=(t,h)=>h?`<div class="sbsec"><h4>${t}</h4>${h}</div>`:'';
  const body=e.art==='spieler'?`
    ${ki?`<div class="sc2ki u-${svEsc(ki.urteil)}"><b>KI-Urteil: ${svEsc(ki.urteil)} · ${ki.score}/100</b><p>${svEsc(ki.fazit)}</p>${(ki.staerken||[]).length?`<div><b>Stärken:</b> ${ki.staerken.map(svEsc).join(' · ')}</div>`:''}${(ki.risiken||[]).length?`<div><b>Risiken:</b> ${ki.risiken.map(svEsc).join(' · ')}</div>`:''}${ki.ansprache?`<div><b>Ansprache:</b> ${svEsc(ki.ansprache)}</div>`:''}</div>`
      :`<div class="note">${svEsc(e.ki_hinweis||'Bericht aus unseren Daten.')}</div>`}
    <div class="trkpi"><div><b>${st.tore??'–'}</b><span>Tore</span></div><div><b>${st.spiele??'–'}</b><span>Spiele</span></div><div><b>${st.platz?st.platz+'.':'–'}</b><span>Tabelle${st.teams?' / '+st.teams:''}</span></div><div><b>${e.realismus?e.realismus.w:'–'}</b><span>Realismus</span></div></div>
    ${sec('Aus unseren Daten',`${(e.fazit.plus||[]).map(x=>`<div class="sc2plus">＋ ${svEsc(x)}</div>`).join('')}${(e.fazit.minus||[]).map(x=>`<div class="sc2minus">－ ${svEsc(x)}</div>`).join('')}${(e.realismus&&e.realismus.f||[]).map(x=>`<div class="sc2info">• ${svEsc(x)}</div>`).join('')}`)}
    ${sec('Spieltag für Spieltag',(e.verlauf||[]).filter(v=>v.spiele).length?`<div class="sc2verl">${e.verlauf.filter(v=>v.spiele).map(v=>`<div title="${svEsc(v.stand)}"><i style="height:${Math.min(100,v.tore*34+6)}%"></i><small>${v.tore}</small></div>`).join('')}</div>`:'')}
    ${sec('Team',e.team?`${svEsc(e.verein||'')} · Platz ${e.team.platz}, ${e.team.punkte} Punkte, ${e.team.tore}:${e.team.gegentore} Tore nach ${e.team.spiele} Spielen`:'')}
    ${sec('Unsere Notizen',e.crm&&(e.crm.notiz||e.crm.wechselchance||e.crm.kontaktiert)?`${e.crm.wechselchance?'Wechselchance '+e.crm.wechselchance+'/4 · ':''}${e.crm.kontaktiert?'kontaktiert'+(e.crm.letzter_kontakt?' ('+TRC.fmt(e.crm.letzter_kontakt)+')':'')+' · ':''}${svEsc(e.crm.notiz||'')}`:'')}
    ${sec('Unsere '+svEsc(e.pos_name||''),(e.eigene||[]).length?(e.eigene||[]).map(x=>`${svEsc(x.name)}${x.alter?' ('+x.alter+')':''}`).join(', '):'Niemand: Lücke!')}
    ${sec('Ähnliche Spieler',(e.aehnliche||[]).map(x=>`<div class="sc2f" data-sc2open="${svEsc(x.id)}"><div><b>${svEsc(x.name)}</b><span>${svEsc(x.verein||'')} · ${svEsc(x.liga||'')} · ${x.tore??'–'} Tore in ${x.spiele??'–'}</span></div></div>`).join(''))}
    ${ki&&(ki.naechste_schritte||[]).length?sec('Nächste Schritte',ki.naechste_schritte.map(x=>`<div>→ ${svEsc(x)}</div>`).join('')):''}
    ${ki&&(ki.quellen||[]).length?sec('Quellen',ki.quellen.map(u=>`<a href="${svEsc(u)}" target="_blank" rel="noopener">${svEsc(u.replace(/^https:\/\/(www\.)?/,'').slice(0,60))}</a>`).join('<br>')):''}
    ${sc2Btns(trP(e.player_id),false)}`
  :`${ki?`<div class="sc2ki"><b>KI-Einschätzung</b><p>${svEsc(ki.kommentar)}</p>${(ki.top||[]).map(t=>{ const k=(e.kandidaten||[]).find(x=>x.id===t.id); return k?`<div>🥇 <b>${svEsc(k.name)}</b> · ${svEsc(t.begruendung)}</div>`:''; }).join('')}</div>`:`<div class="note">${svEsc(e.ki_hinweis||'Vorschläge aus unseren Daten.')}</div>`}
    ${sec('Unser Kader auf der Position',(e.eigene||[]).length?(e.eigene||[]).map(x=>`${svEsc(x.name)}${x.alter?' ('+x.alter+')':''}`).join(', '):'Niemand!')}
    ${sec(`Kandidaten <small>${e.geprueft} geprüft · ohne „Kein Interesse“</small>`,(e.kandidaten||[]).map(k=>`<div class="sc2k"><div class="sc2k-h" data-sc2open="${svEsc(k.id)}"><b>${svEsc(k.name)}</b><em>${k.score}</em></div><span>${svEsc(k.verein||'')} · ${svEsc(k.liga||'')}${k.alter?' · '+k.alter+' J.':''}${k.km!=null?' · '+k.km+' km':''} · ${k.tore} Tore/${k.spiele} Sp.</span><small>${(k.gruende||[]).map(svEsc).join(' · ')}</small>
      <div class="btnrow">${sc2Btns(trP(k.id),true)}${j.saison?`<button class="btn ghost sm" data-plan="${svEsc(k.id)}">＋ Saison ${sc2SN(j.saison)}</button>`:''}</div></div>`).join('')||'Keine passenden Kandidaten gefunden.')}`;
  svModal(`<div class="mhead"><div class="rm-ic" style="width:46px;height:46px">${SVI('search')}</div><div><h2 style="margin:0">${svEsc(j.titel)}</h2><div class="msub">${e.art==='spieler'?svEsc([e.pos_name,e.alter?e.alter+' J.':'',e.verein,e.liga].filter(Boolean).join(' · ')):'Bedarf: '+svEsc(e.bedarf?e.bedarf.prio+' · '+e.bedarf.horizont:'nicht festgelegt')} · ${new Date(j.done_at||j.created_at).toLocaleDateString('de-DE')}</div></div></div>
