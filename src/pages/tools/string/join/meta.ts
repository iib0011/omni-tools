import { defineTool } from '@tools/defineTool';
import { lazy } from 'react';

export const tool = defineTool('string', {
  path: 'join',
  name: 'Text Joiner',
  icon: 'tabler:arrows-join',
  description:
    "World's Simplest Text Tool World's simplest browser-based utility for joining text. Load your text in the input form on the left and you'll automatically get merged text on the right. Powerful, free, and fast. Load text – get joined lines",
  shortDescription: 'Quickly merge texts',
  keywords: ['text', 'join'],
  userTypes: ['General Users', 'Students'],
  component: lazy(() => import('./index'))
});
