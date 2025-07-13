import { defineTool } from '@tools/defineTool';
import { lazy } from 'react';

export const tool = defineTool('string', {
  name: 'Reverse',
  path: 'reverse',
  icon: 'material-symbols-light:swap-horiz',
  description:
    "World's simplest browser-based utility for reversing text. Input any text and get it instantly reversed, character by character. Perfect for creating mirror text, analyzing palindromes, or playing with text patterns. Preserves spaces and special characters while reversing.",
  shortDescription: 'Reverse any text character by character',
  keywords: ['reverse'],
  component: lazy(() => import('./index')),
  i18n: {
    name: 'string.reverse.name',
    description: 'string.reverse.description',
    shortDescription: 'string.reverse.shortDescription'
  }
});
