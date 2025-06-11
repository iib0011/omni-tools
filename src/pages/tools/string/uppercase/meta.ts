import { defineTool } from '@tools/defineTool';
import { lazy } from 'react';
import i18n from 'i18n/i18n';

export const tool = defineTool('string', {
  name: i18n.t('uppercase'),
  path: 'uppercase',
  icon: 'material-symbols-light:text-fields',
  description: i18n.t('uppercaseDescription'),
  shortDescription: i18n.t('uppercaseShortDescription'),
  keywords: ['uppercase'],
  component: lazy(() => import('./index'))
});
