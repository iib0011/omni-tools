import { defineTool } from '@tools/defineTool';
import { lazy } from 'react';

export const tool = defineTool('string', {
  path: 'split',
  name: 'Text splitter',
  icon: 'material-symbols-light:arrow-split',
  description:
    "World's simplest browser-based utility for splitting text. Load your text in the input form on the left and you'll automatically get pieces of this text on the right. Powerful, free, and fast. Load text – get chunks.",
  shortDescription: 'Quickly split a text',
  longDescription: 'Quickly split a text',
  keywords: ['text', 'split'],
  component: lazy(() => import('./index'))
});
