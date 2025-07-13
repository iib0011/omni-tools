import { defineTool } from '@tools/defineTool';
import { lazy } from 'react';
// import image from '@assets/text.png';

export const tool = defineTool('string', {
  name: 'Randomize case',
  path: 'randomize-case',
  icon: 'material-symbols-light:shuffle',
  description:
    "World's simplest browser-based utility for randomizing text case. Input your text and instantly transform it with random upper and lower case letters. Perfect for creating unique text effects, testing case sensitivity, or generating varied text patterns.",
  shortDescription: 'Randomize the case of letters in text',
  keywords: ['randomize', 'case'],
  component: lazy(() => import('./index')),
  i18n: {
    name: 'string:randomizeCase.title',
    description: 'string:randomizeCase.description',
    shortDescription: 'string:randomizeCase.shortDescription'
  }
});
