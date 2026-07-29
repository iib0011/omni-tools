import type { IconifyIcon } from '@iconify/react';

const icon = (body: string): IconifyIcon => ({
  body,
  width: 24,
  height: 24
});

export const ocrPdfIcon = icon(
  '<path fill="currentColor" d="M6 2h9l5 5v8h-2V8h-4V4H6v11H4V4a2 2 0 0 1 2-2m9 20v-2h3v-3h2v3a2 2 0 0 1-2 2h-3M4 17h2v3h3v2H6a2 2 0 0 1-2-2v-3m4-8h8v2H8V9m0 4h6v2H8v-2Z"/>'
);

export const organizePdfIcon = icon(
  '<path fill="currentColor" d="M4 3h7v7H4V3m2 2v3h3V5H6m7-2h7v7h-7V3m2 2v3h3V5h-3M4 12h7v9H4v-9m2 2v5h3v-5H6m7-2h7v9h-7v-9m2 2v5h3v-5h-3Z"/>'
);

export const stampPdfIcon = icon(
  '<path fill="currentColor" d="M8 3h8v2H8V3m1 3h6l1 6l3 2v3H5v-3l3-2l1-6m1.8 2l-.7 5.2L8.5 14h7l-1.6-.8L13.2 8h-2.4M4 19h16v2H4v-2Z"/>'
);

export const comparePdfIcon = icon(
  '<path fill="currentColor" d="M3 4h8v16H3V4m2 2v12h4V6H5m8-2h8v16h-8V4m2 2v12h4V6h-4m-3 3l2 3l-2 3V9Z"/>'
);

export const inspectPdfIcon = icon(
  '<path fill="currentColor" d="M5 2h10l4 4v7.1a6 6 0 0 0-2-1.1V7h-3V4H7v16h5.1c.2.7.6 1.4 1.1 2H5V2m13 11a5 5 0 0 1 4 8l2 2l-1 1l-2-2a5 5 0 1 1-3-9m0 2a3 3 0 1 0 0 6a3 3 0 0 0 0-6M9 9h6v2H9V9m0 4h4v2H9v-2Z"/>'
);
