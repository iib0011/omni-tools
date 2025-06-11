import { defineTool } from '@tools/defineTool';
import { lazy } from 'react';
import i18n from 'i18n/i18n';

// import image from '@assets/text.png';

export const tool = defineTool('string', {
  name: i18n.t('palindrome'),
  path: 'palindrome',
  icon: 'material-symbols-light:search',
  description: i18n.t('palindromeDescription'),
  shortDescription: i18n.t('palindromeShortDescription'),
  keywords: ['palindrome'],
  component: lazy(() => import('./index'))
});
