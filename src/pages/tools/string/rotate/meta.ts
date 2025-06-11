import { defineTool } from '@tools/defineTool';
import { lazy } from 'react';
import i18n from 'i18n/i18n';
// import image from '@assets/text.png';

export const tool = defineTool('string', {
  name: i18n.t('rotate'),
  path: 'rotate',
  icon: 'carbon:rotate',
  description: i18n.t('rotateDescription'),
  shortDescription: i18n.t('rotateShortDescription'),
  longDescription: i18n.t('rotateLongDescription'),
  keywords: ['rotate'],
  component: lazy(() => import('./index'))
});
