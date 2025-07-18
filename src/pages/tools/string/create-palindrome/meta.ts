import { defineTool } from '@tools/defineTool';
import { lazy } from 'react';
// import image from '@assets/text.png';

export const tool = defineTool('string', {
  path: 'create-palindrome',
  icon: 'material-symbols-light:repeat',

  keywords: ['create', 'palindrome'],
  component: lazy(() => import('./index')),
  i18n: {
    name: 'string:createPalindrome.title',
    description: 'string:createPalindrome.description',
    shortDescription: 'string:createPalindrome.shortDescription',
    userTypes: ['General Users', 'Students']
  }
});
