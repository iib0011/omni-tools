import { defineTool } from '@tools/defineTool';
import { lazy } from 'react';
import i18n from 'i18n/i18n';

export const tool = defineTool('list', {
  name: i18n.t('findUnique'),
  path: 'find-unique',
  icon: 'mynaui:one',
  description: i18n.t('findUniqueDescription'),
  shortDescription: i18n.t('findUniqueShortDescription'),
  keywords: ['find', 'unique'],
  component: lazy(() => import('./index'))
});
