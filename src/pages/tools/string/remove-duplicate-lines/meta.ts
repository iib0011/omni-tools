import { defineTool } from '@tools/defineTool';
import { lazy } from 'react';
import i18n from 'i18n/i18n';

export const tool = defineTool('string', {
  name: i18n.t('removeDuplicateLines'),
  path: 'remove-duplicate-lines',
  icon: 'pepicons-print:duplicate-off',
  description: i18n.t('removeDuplicateLinesDescription'),
  shortDescription: i18n.t('removeDuplicateLinesShortDescription'),
  keywords: ['remove', 'duplicate', 'lines'],
  component: lazy(() => import('./index'))
});
