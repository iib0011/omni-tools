const PDF_WORKBENCH_ROUTES = new Set([
  '/pdf/ocr-pdf',
  '/pdf/organize-pdf',
  '/pdf/stamp-pdf',
  '/pdf/compare-pdf',
  '/pdf/inspect-pdf'
]);

export function isPdfWorkbenchRoute(pathname: string): boolean {
  const normalized =
    pathname.length > 1 ? pathname.replace(/\/+$/u, '') : pathname;
  return PDF_WORKBENCH_ROUTES.has(
    normalized.startsWith('/') ? normalized : `/${normalized}`
  );
}
