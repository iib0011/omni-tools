import { defineTool } from '@tools/defineTool';
import { lazy } from 'react';
import i18n from 'i18n/i18n';

export const tool = defineTool('string', {
  name: i18n.t('reverse'),
  path: 'reverse',
  icon: 'material-symbols-light:swap-horiz',
  description: i18n.t('reverseDescription'),
  shortDescription: i18n.t('reverseShortDescription'),
  keywords: ['reverse'],
  component: lazy(() => import('./index'))
});
