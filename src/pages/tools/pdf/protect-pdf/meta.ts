import { defineTool } from '@tools/defineTool';
import { lazy } from 'react';

export const tool = defineTool('pdf', {
  path: 'protect-pdf',
  icon: 'material-symbols:lock',

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
  component: lazy(() => import('./index')),
  i18n: {
    name: 'pdf:protectPdf.title',
    description: 'pdf:protectPdf.description',
    shortDescription: 'pdf:protectPdf.shortDescription',
    userTypes: ['General Users']
  }
});
