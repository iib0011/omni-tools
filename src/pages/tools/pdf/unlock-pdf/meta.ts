import { defineTool } from '@tools/defineTool';
import { lazy } from 'react';

export const meta = defineTool('pdf', {
  name: 'Unlock PDF',
  path: 'unlock-pdf',
  icon: 'material-symbols:lock_open',
  description:
    'Remove password protection from your PDF files securely in your browser',
  shortDescription: 'Unlock PDF files securely',
  keywords: [
    'pdf',
    'unlock',
    'remove password',
    'decrypt',
    'unprotect',
    'security',
    'browser',
    'decryption'
  ],
  longDescription:
    'Remove password protection from your PDF files securely in your browser. Your files never leave your device, ensuring complete privacy while unlocking your documents for easier access and sharing.',
  component: lazy(() => import('./index'))
});
