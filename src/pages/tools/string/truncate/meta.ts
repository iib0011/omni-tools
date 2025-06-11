import { defineTool } from '@tools/defineTool';
import { lazy } from 'react';
import i18n from 'i18n/i18n';

export const tool = defineTool('string', {
  name: i18n.t('truncateText'),
  path: 'truncate',
  icon: 'material-symbols-light:short-text',
  description: i18n.t('truncateTextDescription'),
  shortDescription: i18n.t('truncateTextShortDescription'),
  longDescription: i18n.t('truncateTextLongDescription'),
  keywords: ['text', 'truncate'],
  component: lazy(() => import('./index'))
});
