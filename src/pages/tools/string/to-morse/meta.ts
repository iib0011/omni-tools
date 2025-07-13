import { defineTool } from '@tools/defineTool';
import { lazy } from 'react';
// import image from '@assets/text.png';

export const tool = defineTool('string', {
  name: 'String To morse',
  path: 'to-morse',
  icon: 'arcticons:morse',
  description:
    "World's simplest browser-based utility for converting text to Morse code. Load your text in the input form on the left and you'll instantly get Morse code in the output area. Powerful, free, and fast. Load text – get Morse code.",
  shortDescription: 'Quickly encode text to morse',
  keywords: ['to', 'morse'],
  component: lazy(() => import('./index')),
  i18n: {
    name: 'string:toMorse.title',
    description: 'string:toMorse.description',
    shortDescription: 'string:toMorse.shortDescription'
  }
});
