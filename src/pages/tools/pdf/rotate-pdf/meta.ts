import { defineTool } from '@tools/defineTool';
import { lazy } from 'react';
import i18n from 'i18n/i18n';

export const tool = defineTool('pdf', {
  name: i18n.t('rotatePdf'),
  path: 'rotate-pdf',
  icon: 'carbon:rotate',
  description: i18n.t('rotatePdfDescription'),
  shortDescription: i18n.t('rotatePdfShortDescription'),
  longDescription: i18n.t('rotatePdfLongDescription'),
  keywords: ['pdf', 'rotate', 'rotation', 'document', 'pages', 'orientation'],
  component: lazy(() => import('./index'))
});
