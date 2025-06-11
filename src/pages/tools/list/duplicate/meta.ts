import { defineTool } from '@tools/defineTool';
import { lazy } from 'react';
import i18n from 'i18n/i18n';

// import image from '@assets/text.png';

export const tool = defineTool('list', {
  name: i18n.t('duplicate'),
  path: 'duplicate',
  icon: 'mdi:content-duplicate',
  description: i18n.t('duplicateDescription'),
  shortDescription: i18n.t('duplicateShortDescription'),
  longDescription: i18n.t('duplicateLongDescription'),
  keywords: ['duplicate'],
  component: lazy(() => import('./index'))
});
