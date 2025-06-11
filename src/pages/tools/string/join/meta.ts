import { defineTool } from '@tools/defineTool';
import { lazy } from 'react';
import i18n from 'i18n/i18n';

export const tool = defineTool('string', {
  path: 'join',
  name: i18n.t('textJoiner'),
  icon: 'tabler:arrows-join',
  description: i18n.t('textJoinerDescription'),
  shortDescription: i18n.t('textJoinerShortDescription'),
  longDescription: i18n.t('textJoinerLongDescription'),
  keywords: ['text', 'join'],
  component: lazy(() => import('./index'))
});
