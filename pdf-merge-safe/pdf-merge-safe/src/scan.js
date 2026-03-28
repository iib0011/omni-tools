const fs = require("fs");
const path = require("path");
const { PDFDocument } = require("pdf-lib");

function gather(p) {
  if (!fs.existsSync(p)) return [];
  const stat = fs.lstatSync(p);
  if (stat.isDirectory()) {
    return fs.readdirSync(p)
      .filter((f) => f.toLowerCase().endsWith(".pdf"))
      .map((f) => path.join(p, f));
  }
  return p.toLowerCase().endsWith(".pdf") ? [p] : [];
}

(async () => {
  const target = process.argv[2] || "examples";
  const files = gather(target);
  if (files.length === 0) { console.log("No PDFs found in", target); process.exit(0); }

  console.log(`🔍 Scanning ${files.length} file(s) in: ${target}\n`);
  for (const f of files) {
    const buf = fs.readFileSync(f);
    const name = path.basename(f);

    let encrypted = false;
    try { await PDFDocument.load(buf); }
    catch (e) { encrypted = String(e.message).toLowerCase().includes("encrypted"); }

    const signed = buf.includes("/Sig");
    console.log(`• ${name}\n   - Encrypted: ${encrypted}\n   - Signed: ${signed}\n`);
  }
})();
