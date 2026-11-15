export function encodeBytes(bytes) {
  let bin = "";
  for (let i = 0; i < bytes.length; i += 8192) bin += String.fromCharCode(...bytes.slice(i,i+8192));
  return btoa(bin);
}
const utf8 = new TextEncoder();
const fold = encoded => encoded.match(/.{1,76}/g)?.join("\r\n") || "";
export function eml(snapshot, pdf) {
  const boundary = "svbsc-" + crypto.randomUUID();
  const words = [];
  let chunk = "";
  for (const char of snapshot.subject) {
    if (utf8.encode(chunk + char).length > 42) { words.push(chunk); chunk = ""; }
    chunk += char;
  }
  words.push(chunk);
  const subject = words.map(part => "=?UTF-8?B?" + encodeBytes(utf8.encode(part)) + "?=").join("\r\n ");
  return [
    "X-Unsent: 1", "MIME-Version: 1.0", "To: " + snapshot.to, "Subject: " + subject,
    'Content-Type: multipart/mixed; boundary="' + boundary + '"', "",
    "--" + boundary, "Content-Type: text/plain; charset=UTF-8",
    "Content-Transfer-Encoding: base64", "", fold(encodeBytes(utf8.encode(snapshot.body))), "",
    "--" + boundary, 'Content-Type: application/pdf; name="Projektskizze.pdf"',
    'Content-Disposition: attachment; filename="Projektskizze.pdf"',
    "Content-Transfer-Encoding: base64", "", fold(encodeBytes(pdf)), "", "--" + boundary + "--", ""
  ].join("\r\n");
}
