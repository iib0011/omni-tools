const fs = require("fs");
const path = require("path");
const { PDFDocument, StandardFonts, rgb } = require("pdf-lib");

async function make(text, outfile) {
  const pdf = await PDFDocument.create();
  const page = pdf.addPage([420, 300]);
  const font = await pdf.embedFont(StandardFonts.Helvetica);
  page.drawText(text, { x: 40, y: 150, size: 18, font, color: rgb(0,0,0) });
  const bytes = await pdf.save();
  fs.writeFileSync(outfile, bytes);
  console.log("✅ Created", outfile);
}

(async () => {
  const dir = "examples";
  fs.mkdirSync(dir, { recursive: true });
  await make("Hello from normal1", path.join(dir, "normal1.pdf"));
  await make("Hello from normal2", path.join(dir, "normal2.pdf"));
})();
