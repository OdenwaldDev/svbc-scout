// Vereins-Eingabeformat, kein behaupteter Veo-Export. Kein Netz, keine Speicherung.
export const columns = Object.freeze([
  ['Rückennummer','jersey',99,0],['Einsatzminuten','minutesPlayed',150,2],
  ['Trackingminuten','minutesTracked',150,2],['Laufstrecke (m)','distance_m',100000,2],
  ['Höchsttempo (km/h)','top_speed_kmh',100000,2],['Tore','goals',100000,0],
  ['Vorlagen','assists',100000,0],['Sprints','sprints',100000,0],
  ['Balleroberungen','recoveries',100000,0],['Paraden','saves',100000,0]
].map(Object.freeze));
export const template = columns.map(c=>c[0]).join(';')+'\r\n';

export function parseTable(text) {
  if(typeof text!=='string'||text.length>60000)throw Error('Die Tabelle darf höchstens 60.000 Zeichen enthalten.');
  const lines=text.replace(/^\uFEFF/,'').replace(/\r\n?/g,'\n').split('\n');
  while(lines.length&&!lines[lines.length-1].trim())lines.pop();
  if(lines.length<2)throw Error('Bitte die Kopfzeile und mindestens eine Spielerzeile einfügen.');
  if(lines.length>31)throw Error('Pro Spiel sind höchstens 30 Spielerzeilen möglich.');
  const separator=lines[0].includes('\t')?'\t':';',heads=lines[0].split(separator).map(s=>s.trim());
  const fields=heads.map(h=>columns.find(c=>c[0]===h));
  if(fields.some(c=>!c))throw Error('Unbekannte Spalte. Bitte die Überschriften der Vereinsvorlage unverändert verwenden.');
  if(new Set(heads).size!==heads.length)throw Error('Jede Spalte darf nur einmal vorkommen.');
  if(!heads.includes('Rückennummer')||fields.every(c=>['jersey','minutesPlayed','minutesTracked'].includes(c[1])))throw Error('Rückennummer und mindestens eine Messwertspalte sind erforderlich.');
  const seen=new Set();
  return lines.slice(1).map((line,index)=>{
    const cells=line.split(separator).map(s=>s.trim()),at='Zeile '+(index+2)+': ';
    if(cells.length!==heads.length)throw Error(at+'Anzahl der Zellen passt nicht zur Kopfzeile.');
    const row={metrics:{},identityConfirmed:false,periodsConfirmed:false,eventsReviewed:false,physicalReviewed:false,speedReviewed:false,reducedAccuracy:true,physicalFlagged:true};
    fields.forEach(([label,key,max,digits],i)=>{
      const raw=cells[i];let value=null;
      if(raw!==''){
        const pattern=digits?/^\d+(?:[.,]\d{1,2})?$/:/^\d+$/;
        if(!pattern.test(raw))throw Error(at+label+': Bitte '+(digits?'eine Zahl mit höchstens zwei Nachkommastellen':'eine ganze Zahl')+' ohne Tausendertrennzeichen eintragen.');
        value=Number(raw.replace(',','.'));
        if(!Number.isFinite(value)||value>max)throw Error(at+label+': Erlaubt sind 0 bis '+max+'.');
      }
      if(key==='jersey')row.jersey=value;
      else if(key.startsWith('minutes'))row[key]=value;
      else row.metrics[key]=value;
    });
    if(row.jersey===null||seen.has(row.jersey))throw Error(at+'Rückennummer fehlt oder kommt doppelt vor. Bei Nummernwechseln bitte einzeln erfassen.');
    seen.add(row.jersey);
    if(!Object.values(row.metrics).some(v=>v!==null))throw Error(at+'Mindestens ein Messwert muss angegeben sein.');
    if(row.minutesPlayed!=null&&row.minutesTracked!=null&&row.minutesTracked>row.minutesPlayed)throw Error(at+'Trackingminuten dürfen die Einsatzminuten nicht überschreiten.');
    return row;
  });
}
