import { defineTool } from '@tools/defineTool';
import { lazy } from 'react';
// import image from '@assets/text.png';

export const tool = defineTool('string', {
  path: 'palindrome',
  icon: 'material-symbols-light:search',

  keywords: ['palindrome'],
  component: lazy(() => import('./index')),
  i18n: {
    name: 'string:palindrome.title',
    description: 'string:palindrome.description',
    shortDescription: 'string:palindrome.shortDescription',
    userTypes: ['General Users', 'Students']
  }
});
