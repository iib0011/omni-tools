import { defineTool } from '@tools/defineTool';
import { lazy } from 'react';
// import image from '@assets/text.png';

export const tool = defineTool('list', {
  path: 'unwrap',
  icon: 'material-symbols-light:unfold-more',

  keywords: ['unwrap'],
  component: lazy(() => import('./index')),
  i18n: {
    name: 'list:unwrap.title',
    description: 'list:unwrap.description',
    shortDescription: 'list:unwrap.shortDescription',
    userTypes: ['generalUsers', 'developers']
  }
});
