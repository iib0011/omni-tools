import { defineTool } from '@tools/defineTool';
import { lazy } from 'react';
// import image from '@assets/text.png';

export const tool = defineTool('list', {
  name: 'Group',
  path: 'group',
  icon: 'pajamas:group',
  description: '',
  shortDescription: '',
  keywords: ['group'],
  component: lazy(() => import('./index'))
});
