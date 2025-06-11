import { defineTool } from '@tools/defineTool';
import { lazy } from 'react';
import i18n from 'i18n/i18n';
// import image from '@assets/text.png';

export const tool = defineTool('list', {
  name: i18n.t('rotate'),
  path: 'rotate',
  icon: 'material-symbols-light:rotate-right',
  description: i18n.t('rotateDescription'),
  shortDescription: i18n.t('rotateShortDescription'),
  keywords: ['rotate'],
  component: lazy(() => import('./index'))
});
