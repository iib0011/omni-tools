import { defineTool } from '@tools/defineTool';
import { lazy } from 'react';
// import image from '@assets/text.png';

export const tool = defineTool('string', {
  name: 'Rot13',
  path: 'rot13',
  icon: 'hugeicons:encrypt',
  description:
    'A simple tool to encode or decode text using the ROT13 cipher, which replaces each letter with the letter 13 positions after it in the alphabet.',
  shortDescription: 'Encode or decode text using ROT13 cipher.',
  keywords: ['rot13'],
  component: lazy(() => import('./index'))
});
