# PDF Workbench Runtime Asset Licenses

- **PDF.js** (`pdfjs-dist`): Apache License 2.0.
- **Tesseract.js** and `tesseract.js-core`: Apache License 2.0.
- **OCR traineddata packages** (`@tesseract.js-data/*`): MIT; each package is
  pinned to version 1.0.0 and copied at build time.
- **Noto fonts**: SIL Open Font License 1.1.
- **pdf-lib fontkit adapter** (`@pdf-lib/fontkit@1.1.1`): MIT.

The build copies workers, WASM, CMaps, standard fonts, and selected OCR language
files from pinned local npm packages into `public/pdf-workbench/runtime/`.
Runtime code never falls back to a CDN or another origin.

Committed fonts are `NotoSans-Regular.ttf` and `NotoSansArabic-Regular.ttf`
from the Ubuntu `fonts-noto-core` package, plus `NotoSansCJKjp-Regular.otf`
from the official Noto CJK repository at commit
`f8d157755ee68d8e29a1cfb984451982a839672f`. Their SHA-256 hashes are,
respectively:

- `89c3c497f618fdaa0b2d1e98fef93582f28c71debd2c4a8cdf41f190ced2909d`
- `504d7407d86875acf7d04dfaa0fd7524d0b8797723bc4aa18022f29db25b0b6e`
- `68a3fc98800b2a27b371f2fb79991daf3633bd89309d4ffaa6946fd587f375b5`
