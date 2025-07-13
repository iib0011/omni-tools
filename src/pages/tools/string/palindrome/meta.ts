import { defineTool } from '@tools/defineTool';
import { lazy } from 'react';
// import image from '@assets/text.png';

export const tool = defineTool('string', {
  name: 'Palindrome',
  path: 'palindrome',
  icon: 'material-symbols-light:search',
  description:
    "World's simplest browser-based utility for checking if text is a palindrome. Instantly verify if your text reads the same forward and backward. Perfect for word puzzles, linguistic analysis, or validating symmetrical text patterns. Supports various delimiters and multi-word palindrome detection.",
  shortDescription: 'Check if text reads the same forward and backward',
  keywords: ['palindrome'],
  component: lazy(() => import('./index')),
  i18n: {
    name: 'string:palindrome.title',
    description: 'string:palindrome.description',
    shortDescription: 'string:palindrome.shortDescription'
  }
});
