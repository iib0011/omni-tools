import { defineTool } from '@tools/defineTool';
import { lazy } from 'react';
import i18n from 'i18n/i18n';
// import image from '@assets/text.png';

export const tool = defineTool('string', {
  name: i18n.t('rot13'),
  path: 'rot13',
  icon: 'hugeicons:encrypt',
  description: i18n.t('rot13Description'),
  shortDescription: i18n.t('rot13ShortDescription'),
  longDescription: i18n.t('rot13LongDescription'),
  keywords: ['rot13'],
  component: lazy(() => import('./index'))
});
