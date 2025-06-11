import { defineTool } from '@tools/defineTool';
import { lazy } from 'react';
import i18n from 'i18n/i18n';

export const tool = defineTool('string', {
  name: i18n.t('repeatText'),
  path: 'repeat',
  icon: 'material-symbols-light:replay',
  description: i18n.t('repeatTextDescription'),
  shortDescription: i18n.t('repeatTextShortDescription'),
  longDescription: i18n.t('repeatTextLongDescription'),
  keywords: ['text', 'repeat'],
  component: lazy(() => import('./index'))
});
