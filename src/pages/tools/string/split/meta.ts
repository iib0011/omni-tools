import { defineTool } from '@tools/defineTool';
import { lazy } from 'react';
import i18n from 'i18n/i18n';

export const tool = defineTool('string', {
  path: 'split',
  name: i18n.t('splitText'),
  icon: 'material-symbols-light:arrow-split',
  description: i18n.t('splitTextDescription'),
  shortDescription: i18n.t('splitTextShortDescription'),
  longDescription: i18n.t('splitTextLongDescription'),
  keywords: ['text', 'split'],
  component: lazy(() => import('./index'))
});
