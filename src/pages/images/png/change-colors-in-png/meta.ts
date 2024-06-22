import { defineTool } from '../../../../tools/defineTool';
import { lazy } from 'react';

export const tool = defineTool('png', {
  path: 'change-colors',
  name: 'PNG color replacer',
  description:
    "World's simplest online Portable Network Graphics (PNG) color changer. Just import your PNG image in the editor on the left, select which colors to change, and you'll instantly get a new PNG with the new colors on the right. Free, quick, and very powerful. Import a PNG – replace its colors",
  keywords: ['png', 'color'],
  component: lazy(() => import('./index'))
});
