import { cents, euro } from "./domain.mjs?v=beta-0.99.164";

const ink = "#143558";
const text = "#263b50";
const muted = "#4b6178";
const rule = "#d7e1eb";
const tint = "#f0f5fa";
const orange = "#bf581d";
const left = 22;
const right = 188;
const width = right - left;
const bottom = 267;
const lineHeight = 5.4;
const formatDay = value => value.split("-").reverse().join(".");

export function projectPdf(Pdf, item, facts, club, day, crest) {
  const doc = new Pdf({ unit: "mm", format: "a4", putOnlyUsedFonts: true, compress: true });
  const date = formatDay(day);
  doc.setProperties({ title: item.title, author: club.name, subject: "Projektskizze zur Vereinsförderung" });
  doc.setCreationDate("D:" + day.replaceAll("-", "") + "120000+00'00'");
  doc.setFileId(String(item.id || "").replace(/[^a-f0-9]/gi,"").padEnd(32,"0").slice(0,32));

  const image = doc.getImageProperties(crest);
  const logoScale = Math.min(36 / image.width, 20 / image.height);
  const logoWidth = image.width * logoScale;
  const logoHeight = image.height * logoScale;
  let y;

  function font(size = 11, weight = "normal", color = text) {
    doc.setFont("helvetica", weight);
    doc.setFontSize(size);
    doc.setTextColor(color);
  }

  function stroke(x1, y1, x2, y2, color = rule, weight = 0.22) {
    doc.setDrawColor(color);
    doc.setLineWidth(weight);
    doc.line(x1, y1, x2, y2);
  }

  function page(first = false) {
    if (!first) doc.addPage();
    doc.addImage(crest, "PNG", left, 16 + (20 - logoHeight) / 2, logoWidth, logoHeight, "svbsc-wappen");
    const nameX = left + logoWidth + 6;
    font(13, "bold", ink);
    doc.text(club.name, nameX, 24);
    font(9, "normal", muted);
    doc.text("Fußballabteilung", nameX, 29);
    font(9, "bold", ink);
    doc.text("VEREINSFÖRDERUNG", right, 24, { align: "right" });
    font(9, "normal", muted);
    doc.text(first ? "Projektskizze" : "Projektskizze · Fortsetzung", right, 29, { align: "right" });
    stroke(left, 41, right, 41, ink, 0.6);
    stroke(left, 41, left + 16, 41, orange, 0.9);
    y = first ? 53 : 51;
  }

  function ensure(height) {
    if (y + height > bottom) page();
  }

  function title() {
    font(30, "bold", ink);
    const lines = doc.splitTextToSize(item.title, width);
    for (const line of lines) {
      ensure(12);
      font(30, "bold", ink);
      doc.text(line, left, y + 9);
      y += 12;
    }
    y += 4;

    font(9.5, "normal", muted);
    const details = [item.place || club.place, "Stand " + date, item.version && "Version " + item.version].filter(Boolean);
    const meta = doc.splitTextToSize(details.join("   ·   "), width - 10);
    for (let start = 0; start < meta.length;) {
      ensure(11);
      const count = Math.min(meta.length - start, Math.floor((bottom - y - 7) / 4));
      const metaHeight = 7 + count * 4;
      doc.setFillColor(tint);
      doc.rect(left, y, width, metaHeight, "F");
      font(9.5, "normal", muted);
      doc.text(meta.slice(start, start + count), left + 5, y + 6.8, { lineHeightFactor: 1.2 });
      y += metaHeight;
      start += count;
    }
    y += 9;
  }

  function sectionHeading(label, firstContentHeight) {
    ensure(8 + firstContentHeight);
    stroke(left, y, right, y);
    font(11.2, "bold", ink);
    doc.text(label, left, y + 5.1);
    y += 8;
  }

  function section(label, value) {
    if (!value?.trim()) return;
    font();
    const lines = doc.splitTextToSize(value.trim(), width);
    sectionHeading(label, Math.min(2, lines.length) * lineHeight);
    for (const line of lines) {
      ensure(lineHeight);
      font();
      doc.text(line, left, y + 3.8);
      y += lineHeight;
    }
    y += 5;
  }

  function costTable() {
    if (!item.costs.length) {
      section("Kosten und Finanzierung", "Für die Projektskizze liegt noch keine belastbare Kostensumme vor.");
      return;
    }
    if (!item.vat) {
      section("Kosten und Finanzierung", "Die Kostenaufstellung folgt, sobald die Preisgrundlage (netto oder brutto) geklärt ist.");
      return;
    }

    const net = item.vat === "yes";
    const rows = item.costs.map(row => {
      const price = cents(net ? row.net : row.gross);
      return { name: row.name, qty: Number(row.qty), price, amount: price === null ? null : price * Number(row.qty) };
    });
    const label = net ? "netto" : "brutto";
    const columns = [left + 97, left + 128, right - 4];
    const headerHeight = 9;
    function tableHeader() {
      doc.setFillColor(ink);
      doc.rect(left, y, width, headerHeight, "F");
      font(9.3, "bold", "#ffffff");
      doc.text("Position", left + 4, y + 5.9);
      ["Menge", "Einzelpreis", "Betrag"].forEach((name, index) => {
        doc.text(name, columns[index], y + 5.9, { align:"right" });
      });
      y += headerHeight;
    }
    function continueTable() {
      page();
      sectionHeading("Kosten und Finanzierung · Fortsetzung", headerHeight + 10);
      tableHeader();
    }
    sectionHeading("Kosten und Finanzierung · " + label, headerHeight + 11);
    tableHeader();
    for (const [index, row] of rows.entries()) {
      font(9.6);
      const description = doc.splitTextToSize(row.name, 79);
      if (y + 5 + description.length * 4.7 > bottom && description.length * 4.7 <= 190) continueTable();
      let printed = 0;
      while (printed < description.length) {
        if (y + 10 > bottom) continueTable();
        const count = Math.min(description.length - printed, Math.floor((bottom - y - 5) / 4.7));
        const height = 5 + count * 4.7;
        if (index % 2 === 0) {
          doc.setFillColor(tint);
          doc.rect(left, y, width, height, "F");
        }
        font(9.6);
        description.slice(printed, printed + count).forEach((line, index) => {
          doc.text(line, left + 4, y + 5.4 + index * 4.7);
        });
        if (printed === 0) {
          [String(row.qty), euro(row.price), euro(row.amount)].forEach((value, index) => {
            doc.text(value, columns[index], y + 5.4, { align:"right" });
          });
        }
        y += height;
        printed += count;
      }
    }
    if (y + 12 > bottom) continueTable();
    stroke(left, y, right, y, ink, 0.42);
    font(10.5, "bold", ink);
    const total = rows.some(row => row.amount === null) ? null : rows.reduce((sum, row) => sum + row.amount, 0);
    doc.text("Gesamtkosten (" + label + ")", left + 4, y + 6.8);
    doc.text(euro(total), columns[2], y + 6.8, { align:"right" });
  }

  page(true);
  title();
  const legal = facts.legal;
  if (legal?.status === "verified" && legal.checked <= day && (!legal.expires || legal.expires >= day)) section("Rechtsträger", legal.value);
  section("Ausgangslage und Bedarf", item.need);
  section("Für wen das Projekt gedacht ist", item.audience);
  section("Geplante Maßnahme", item.measure);
  section("Ziel des Projekts", item.outcome);
  section("Zeitplan", item.start && ("Voraussichtlicher Beginn am " + formatDay(item.start)));
  costTable();

  const pages = doc.getNumberOfPages();
  for (let pageNumber = 1; pageNumber <= pages; pageNumber++) {
    doc.setPage(pageNumber);
    stroke(left, 277, right, 277);
    font(9, "bold", ink);
    doc.text(club.name, left, 283);
    font(8.7, "normal", muted);
    if (club.website) doc.textWithLink(club.website, left, 288, { url:"https://" + club.website });
    doc.text("Seite " + pageNumber + " von " + pages, right, 283, { align:"right" });
    doc.text(date, right, 288, { align:"right" });
  }
  return doc.output("arraybuffer");
}
