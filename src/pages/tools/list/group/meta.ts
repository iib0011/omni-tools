import { defineTool } from '@tools/defineTool';
import { lazy } from 'react';
import i18n from 'i18n/i18n';

export const tool = defineTool('list', {
  name: i18n.t('group'),
  path: 'group',
  icon: 'pajamas:group',
  description: i18n.t('groupDescription'),
  shortDescription: i18n.t('groupShortDescription'),
  keywords: ['group'],
  component: lazy(() => import('./index'))
});
