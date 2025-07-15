import { defineTool } from '@tools/defineTool';
import { lazy } from 'react';

export const tool = defineTool('image-generic', {
  i18n: {
    name: 'image:changeOpacity.title',
    description: 'image:changeOpacity.description',
    shortDescription: 'image:changeOpacity.shortDescription'
  },

  path: 'change-opacity',
  icon: 'material-symbols:opacity',

  keywords: ['opacity', 'transparency', 'png', 'alpha', 'jpg', 'jpeg', 'image'],
  component: lazy(() => import('./index'))
});
