import { defineTool } from '@tools/defineTool';
import { lazy } from 'react';
// import image from '@assets/text.png';

export const tool = defineTool('string', {
  name: 'Create palindrome',
  path: 'create-palindrome',
  icon: 'material-symbols-light:repeat',
  description:
    "World's simplest browser-based utility for creating palindromes from any text. Input text and instantly transform it into a palindrome that reads the same forward and backward. Perfect for word games, creating symmetrical text patterns, or exploring linguistic curiosities.",
  shortDescription: 'Create text that reads the same forward and backward',
  keywords: ['create', 'palindrome'],
  component: lazy(() => import('./index'))
});
