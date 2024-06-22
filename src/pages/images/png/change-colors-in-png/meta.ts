import { defineTool } from '../../../../tools/defineTool';
import { lazy } from 'react';

export const tool = defineTool('png', {
  path: 'change-colors',
  name: 'Change colors in PNG',
  description:
    "World's simplest browser-based utility for splitting text. Load your text in the input form on the left and you'll automatically get pieces of this text on the right. Powerful, free, and fast. Load text – get chunks.",
  keywords: ['png', 'split'],
  component: lazy(() => import('./index'))
});
