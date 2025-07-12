import { defineTool } from '@tools/defineTool';
import { lazy } from 'react';
// import image from '@assets/text.png';

export const tool = defineTool('list', {
  name: 'Wrap items',
  path: 'wrap',
  shortDescription: 'Wrap items in a list with custom text',
  icon: 'material-symbols-light:format-quote',
  description:
    'Wrap each item in a list with custom text, such as quotes, brackets, or any other prefix and suffix.',
  keywords: ['wrap', 'list', 'format', 'text'],
  userTypes: ['General Users', 'Students', 'Developers'],
  component: lazy(() => import('./index'))
});
