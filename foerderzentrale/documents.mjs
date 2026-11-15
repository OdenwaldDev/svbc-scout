import { cents, euro } from "./domain.mjs";

export function projectPdf(Pdf, item, facts, club, day) {
  const doc = new Pdf({ unit: "mm", format: "a4", putOnlyUsedFonts: true });
  doc.setProperties({ title: item.title, author: club.name, subject: "Projektskizze" });
  doc.setCreationDate("D:" + day.replaceAll("-","") + "120000+00'00'");
  doc.setFileId(String(item.id || "").replace(/[^a-f0-9]/gi,"").padEnd(32,"0").slice(0,32));
  let y;
  function page() {
    doc.setFillColor("#153452"); doc.rect(0, 0, 210, 28, "F");
    doc.setFillColor("#db8749"); doc.rect(0, 28, 210, 1, "F");
    doc.setFont("helvetica", "bold"); doc.setFontSize(12); doc.setTextColor("#ffffff");
    doc.text(club.name, 18, 16);
    doc.setFont("helvetica", "normal"); doc.setFontSize(9);
    doc.text("PROJEKTSKIZZE", 192, 16, { align: "right" });
    y = 43;
  }
  function text(value, { size = 11, bold = false, color = "#253952", after = 4 } = {}) {
    if (!value) return;
    const lineHeight = size * 0.48;
    const font = () => { doc.setFont("helvetica", bold ? "bold" : "normal"); doc.setFontSize(size); doc.setTextColor(color); };
    font();
    for (const line of doc.splitTextToSize(value, 174)) {
      if (y > 271) { doc.addPage(); page(); font(); }
      doc.text(line, 18, y);
      y += lineHeight;
    }
    y += after;
  }
  const section = (title, value) => {
    if (!value) return;
    if (y > 251) { doc.addPage(); page(); }
    text(title, { bold: true, color: "#173e68", after: 1.5 });
    text(value);
  };
  page();
  text(item.title, { size: 24, bold: true, after: 5 });
  text([item.place, day.split("-").reverse().join("."), item.version ? "Version " + item.version : ""].filter(Boolean).join("  |  "), { size: 10, color: "#51667b", after: 7 });
  const legal = facts.legal;
  if (legal?.status === "verified" && legal.checked <= day && (!legal.expires || legal.expires >= day)) section("Rechtsträger", legal.value);
  section("Bedarf", item.need);
  section("Zielgruppe", item.audience);
  section("Maßnahme", item.measure);
  section("Geplantes Ergebnis", item.outcome);
  section("Zeitplanung", item.start && `Voraussichtlicher Beginn: ${item.start.split("-").reverse().join(".")}`);
  if (item.costs.length && item.vat) {
    const lines = [];
    let total = 0;
    for (const row of item.costs) {
      const price = (item.vat === "yes" ? row.net : row.gross);
      if (price == null || String(price).trim() === "") { lines.length = 0; break; }
      const amount = cents(price) * Number(row.qty);
      total += amount;
      lines.push(`${row.name} (${row.qty} × ${euro(amount / Number(row.qty))})   ${euro(amount)}`);
    }
    if (lines.length) section("Kostenübersicht", [...lines, "", `Gesamtkosten (${item.vat === "yes" ? "netto" : "brutto"}): ${euro(total)}`].join("\n"));
  }
  const count = doc.getNumberOfPages();
  for (let i = 1; i <= count; i++) {
    doc.setPage(i);
    doc.setDrawColor("#d8e2eb"); doc.line(18, 281, 192, 281);
    doc.setFont("helvetica", "normal"); doc.setFontSize(9); doc.setTextColor("#51667b");
    doc.text(club.name + "  |  Projektskizze", 18, 287);
    doc.text(`${i} / ${count}`, 192, 287, { align: "right" });
  }
  return doc.output("arraybuffer");
}
