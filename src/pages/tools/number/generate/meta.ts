import { defineTool } from '@tools/defineTool';
import { lazy } from 'react';
import i18n from 'i18n/i18n';
// import image from '@assets/text.png';

export const tool = defineTool('number', {
  name: i18n.t('generateNumbers'),
  path: 'generate',
  description: i18n.t('generateNumbersDescription'),
  shortDescription: i18n.t('generateNumbersShortDescription'),
  icon: 'lsicon:number-filled',
  keywords: ['generate'],
  component: lazy(() => import('./index'))
});
