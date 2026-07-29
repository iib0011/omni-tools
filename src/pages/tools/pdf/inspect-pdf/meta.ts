import { defineTool } from '@tools/defineTool';
import { lazy } from 'react';
import { inspectPdfIcon } from '../../../../lib/pdf-workbench/icons';

export const meta = defineTool('pdf', {
  icon: inspectPdfIcon,
  component: lazy(() => import('./index')),
  keywords: [
    'inspect',
    'metadata',
    'privacy',
    'sha-256',
    'attachments',
    'forms',
    'links'
  ],
  path: 'inspect-pdf',
  i18n: {
    name: 'pdf:inspectPdf.title',
    description: 'pdf:inspectPdf.description',
    shortDescription: 'pdf:inspectPdf.shortDescription',
    userTypes: ['generalUsers', 'developers']
  }
});
