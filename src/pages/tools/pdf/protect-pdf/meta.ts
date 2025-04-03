import { defineTool } from '@tools/defineTool';
import { lazy } from 'react';

export const tool = defineTool('pdf', {
  name: 'Protect PDF',
  path: 'protect-pdf',
  icon: 'material-symbols:lock',
  description:
    'Add password protection to your PDF files securely in your browser',
  shortDescription: 'Password protect PDF files securely',
  keywords: [
    'pdf',
    'protect',
    'password',
    'secure',
    'encrypt',
    'lock',
    'private',
    'confidential',
    'security',
    'browser',
    'encryption'
  ],
  longDescription:
    'Add password protection to your PDF files securely in your browser. Your files never leave your device, ensuring complete privacy while securing your documents with password encryption. Perfect for protecting sensitive information, confidential documents, or personal data.',
  component: lazy(() => import('./index'))
});
