# PDF Workbench Phase 1

## Scope and local-processing guarantee

Phase 1 adds five lazy routes: OCR PDF, Organize PDF Pages, Stamp PDF, Compare
PDFs, and Inspect PDF. They are frontend-only workflows. PDF bytes, filenames,
hashes, extracted text, previews, OCR data, and metadata remain in the browser.
Runtime dependencies—including PDF.js workers, CMaps, WASM, Tesseract workers,
OCR core, language packs, and fonts—are served from the app origin. The
new-route Playwright suite rejects automatic HTTP(S) requests to any other
origin.

The target is the latest stable desktop Chrome. Firefox and WebKit receive
best-effort support through standards-based browser APIs, but OCR performance
and the File System Access save picker are Chrome-oriented.

## Worker protocol and lifecycle

`src/lib/pdf-workbench/` defines a request-ID-based protocol with typed
`run`, `cancel`, `progress`, `result`, `error`, and `cancelled` messages.
`WorkbenchWorkerClient` owns error/message-error propagation and terminates a
worker when cancellation must interrupt synchronous rendering or WASM. Heavy
visual comparison and PDF rewriting use route-local module workers. Tesseract's
single long-lived worker is reused across OCR pages and terminated on
completion, failure, cancellation, or unmount.

## Dependencies and licenses

Existing browser dependencies remain the primary implementation layer:
PDF.js (Apache-2.0), pdf-lib (MIT), Tesseract.js/core (Apache-2.0), diff (BSD-3-
Clause), and DOMPurify (Apache-2.0 or MPL-2.0). Phase 1 adds only pinned
`@pdf-lib/fontkit@1.1.1` (MIT) and pinned `@tesseract.js-data/*@1.0.0`
language packages (MIT). Noto fonts are distributed under SIL OFL-1.1. Asset
details are recorded in `public/pdf-workbench/LICENSES.md`.

## Memory and output strategy

Pages are rendered incrementally and expensive concurrency is capped at two.
OCR reuses one canvas and one OCR worker; comparison clears per-page canvases
and releases object URLs; organizer thumbnails load on intersection rather than
document open. Transferable buffers avoid unnecessary worker copies where
ownership can move safely. Generated PDFs are reopened with PDF.js before
success is shown. Large saves prefer the File System Access API and fall back
to a Blob download. Resource scopes destroy PDF.js tasks/documents, workers,
canvases, bitmaps, and object URLs on every exit path.

## Known limitations

- OCR accuracy depends on scan quality and the selected language. Automatic
  orientation corrects recognition, not the visible page rotation.
- Encrypted PDFs cannot be rewritten by Organizer or Stamp. Inspector can
  report password requirements and inspect supported encrypted files when a
  correct password is supplied.
- Rewriting can invalidate digital signatures; modifying tools warn when
  signature fields are detected.
- pdf-lib page copying may not preserve every document-level outline or
  AcroForm relationship.
- Compare does not OCR image-only pages; it explicitly reports missing text
  layers. Pixel tolerance reduces, but cannot eliminate, renderer noise.
- Inspector reports parser evidence and uncertainty. It is not a malware,
  signature, compliance, or security validator.
