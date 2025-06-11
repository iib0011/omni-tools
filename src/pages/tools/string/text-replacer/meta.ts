import { defineTool } from '@tools/defineTool';
import { lazy } from 'react';
import i18n from 'i18n/i18n';

export const tool = defineTool('string', {
  name: i18n.t('textReplacer'),
  path: 'replacer',
  icon: 'material-symbols-light:find-replace',
  description: i18n.t('textReplacerDescription'),
  shortDescription: i18n.t('textReplacerShortDescription'),
  longDescription: i18n.t('textReplacerLongDescription'),
  keywords: ['text', 'replace'],
  component: lazy(() => import('./index'))
});
