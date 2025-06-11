import { defineTool } from '@tools/defineTool';
import { lazy } from 'react';
import i18n from 'i18n/i18n';
// import image from '@assets/text.png';

export const tool = defineTool('string', {
  name: i18n.t('stringToMorse'),
  path: 'to-morse',
  icon: 'arcticons:morse',
  description: i18n.t('stringToMorseDescription'),
  shortDescription: i18n.t('stringToMorseShortDescription'),
  keywords: ['to', 'morse'],
  component: lazy(() => import('./index'))
});
