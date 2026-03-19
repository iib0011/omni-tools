const fs = require("fs");
const path = require("path");
const { PDFDocument } = require("pdf-lib");
const { askYesNo } = require("./prompt");

// helpers
const isPdf = (p) => p.toLowerCase().endsWith(".pdf");
const exists = (p) => fs.existsSync(p);
const read = (p) => fs.readFileSync(p);

function listPdfs(target) {
  if (!exists(target)) return [];
  const stat = fs.lstatSync(target);
  if (stat.isDirectory()) {
    return fs.readdirSync(target)
      .filter((f) => isPdf(f))
      .map((f) => path.join(target, f));
  }
  return isPdf(target) ? [target] : [];
}

async function safeLoad(buffer, filename, autoYes) {
  try {
    return await PDFDocument.load(buffer); // normal, non-encrypted
  } catch (err) {
    const msg = String(err.message).toLowerCase();
    if (!msg.includes("encrypted")) throw err;

    console.warn(`\n🔐 Detected encrypted/signed file: ${filename}`);
    console.warn(`⚠️  If you continue, encryption/signature will be REMOVED in merged output.`);

    if (!autoYes) {
      const ok = await askYesNo("Continue by stripping protection?");
      if (!ok) return null; // skip
    }
    return await PDFDocument.load(buffer, { ignoreEncryption: true });
  }
}

async function merge(files, outPath, autoYes) {
  const merged = await PDFDocument.create();
  let total = 0;

  for (const file of files) {
    const buf = read(file);
    const name = path.basename(file);

    // heuristic signature marker
    const hasSig = buf.includes("/Sig");

    const doc = await safeLoad(buf, name, autoYes);
    if (!doc) { console.log(`⏭️  Skipped: ${name}`); continue; }

    if (hasSig) {
      console.warn(`⚠️  ${name} appears signed. Merging will invalidate the signature.`);
    }

    const pages = await merged.copyPages(doc, doc.getPageIndices());
    pages.forEach((p) => merged.addPage(p));
    total += pages.length;
    console.log(`➕  Added ${pages.length} page(s) from ${name}`);
  }

  if (total === 0) { console.log("❌ No pages added. Nothing to save."); return; }

  fs.mkdirSync(path.dirname(outPath), { recursive: true });
  const bytes = await merged.save();
  fs.writeFileSync(outPath, bytes);
  console.log(`\n✅ Saved: ${outPath}  (total pages: ${total})`);
}

// -------- CLI --------
// Usage:
// node src/index.js [--yes|-y] <output.pdf> <fileOrFolder1> [fileOrFolder2 ...]
(async () => {
  const args = process.argv.slice(2);
  const autoYes = args.includes("--yes") || args.includes("-y");
  const a = args.filter((x) => x !== "--yes" && x !== "-y");

  if (a.length < 2) {
    console.log("Usage: node src/index.js [--yes|-y] <output.pdf> <fileOrFolder1> [fileOrFolder2 ...]");
    process.exit(1);
  }

  const out = a[0];
  const inputs = a.slice(1);

  let files = [];
  inputs.forEach((p) => { files = files.concat(listPdfs(p)); });

  if (files.length === 0) { console.log("❌ No PDFs found in given paths."); process.exit(1); }

  await merge(files, out, autoYes);
})();
