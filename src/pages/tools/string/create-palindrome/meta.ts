import { defineTool } from '@tools/defineTool';
import { lazy } from 'react';
import i18n from 'i18n/i18n';
// import image from '@assets/text.png';

export const tool = defineTool('string', {
  name: i18n.t('createPalindrome'),
  path: 'create-palindrome',
  icon: 'material-symbols-light:repeat',
  description: i18n.t('createPalindromeDescription'),
  shortDescription: i18n.t('createPalindromeShortDescription'),
  longDescription: i18n.t('createPalindromeLongDescription'),
  keywords: ['create', 'palindrome'],
  component: lazy(() => import('./index'))
});
