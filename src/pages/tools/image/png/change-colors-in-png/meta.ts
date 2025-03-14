import { defineTool } from '@tools/defineTool';
import { lazy } from 'react';

export const tool = defineTool('png', {
  name: 'Change colors in png',
  path: 'change-colors-in-png',
  icon: 'cil:color-fill',
  description:
    "World's simplest online Portable Network Graphics (PNG) color changer. Just import your PNG image in the editor on the left, select which colors to change, and you'll instantly get a new PNG with the new colors on the right. Free, quick, and very powerful. Import a PNG – replace its colors.",
  shortDescription: 'Quickly swap colors in a PNG image',
  keywords: ['change', 'colors', 'in', 'png'],
  component: lazy(() => import('./index'))
});
