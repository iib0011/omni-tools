import { defineTool } from '@tools/defineTool';
import { lazy } from 'react';
import i18n from 'i18n/i18n';
// import image from '@assets/text.png';

export const tool = defineTool('string', {
  name: i18n.t('extractSubstring'),
  path: 'extract-substring',
  icon: 'material-symbols-light:content-cut',
  description: i18n.t('extractSubstringDescription'),
  shortDescription: i18n.t('extractSubstringShortDescription'),
  keywords: ['extract', 'substring'],
  component: lazy(() => import('./index'))
});
