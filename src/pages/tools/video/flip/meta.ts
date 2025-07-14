import { defineTool } from '@tools/defineTool';
import { lazy } from 'react';

export const tool = defineTool('video', {
  path: 'flip',
  icon: 'material-symbols:flip',

  keywords: ['video', 'flip', 'mirror', 'horizontal', 'vertical'],
  component: lazy(() => import('./index')),
  i18n: {
    name: 'video:flip.title',
    description: 'video:flip.description',
    shortDescription: 'video:flip.shortDescription'
  }
});
