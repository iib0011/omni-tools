import { defineTool } from '@tools/defineTool';
import { lazy } from 'react';
// import image from '@assets/text.png';

export const tool = defineTool('list', {
  name: 'Unwrap items',
  path: 'unwrap',
  shortDescription: 'Remove wrapping text from items in a list',
  icon: 'material-symbols-light:format-clear',
  description:
    'Remove custom wrapping text from items in a list, such as quotes, brackets, or any other prefix and suffix.',
  keywords: ['unwrap', 'list', 'remove', 'format'],
  userTypes: ['General Users', 'Students', 'Developers'],
  component: lazy(() => import('./index'))
});
