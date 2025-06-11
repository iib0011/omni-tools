import { defineTool } from '@tools/defineTool';
import { lazy } from 'react';
import i18n from 'i18n/i18n';

// import image from '@assets/text.png';

export const tool = defineTool('string', {
  name: i18n.t('quote'),
  path: 'quote',
  icon: 'proicons:quote',
  description: i18n.t('quoteDescription'),
  shortDescription: i18n.t('quoteShortDescription'),
  longDescription: i18n.t('quoteLongDescription'),
  keywords: ['quote'],
  component: lazy(() => import('./index'))
});
