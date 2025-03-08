import { defineTool } from '@tools/defineTool';
import { lazy } from 'react';
// import image from '@assets/text.png';

export const tool = defineTool('string', {
  name: 'Randomize case',
  path: 'randomize-case',
  icon: 'material-symbols-light:format-textdirection-l-to-r',
  description:
    "World's simplest browser-based utility for randomizing the case of text. Just paste your text and get it instantly transformed with random uppercase and lowercase letters. Perfect for creating playful text styles, meme text, or simulating chaotic writing.",
  shortDescription: 'Convert text to random uppercase and lowercase letters',
  keywords: ['randomize', 'case'],
  component: lazy(() => import('./index'))
});
