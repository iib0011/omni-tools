import { defineTool } from '@tools/defineTool';
import { lazy } from 'react';
import i18n from 'i18n/i18n';

export const tool = defineTool('string', {
  name: i18n.t('base64'),
  path: 'base64',
  icon: 'tabler:number-64-small',
  description: i18n.t('base64Description'),
  shortDescription: i18n.t('base64ShortDescription'),
  longDescription: i18n.t('base64LongDescription'),
  keywords: ['base64'],
  component: lazy(() => import('./index'))
});
