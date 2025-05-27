import { defineTool } from '@tools/defineTool';
import { lazy } from 'react';

export const tool = defineTool('video', {
  name: 'Flip Video',
  path: 'flip',
  icon: 'mdi:flip-horizontal',
  description:
    'This online utility allows you to flip videos horizontally or vertically. You can preview the flipped video before processing. Supports common video formats like MP4, WebM, and OGG.',
  shortDescription: 'Flip videos horizontally or vertically',
  keywords: ['flip', 'video', 'mirror', 'edit', 'horizontal', 'vertical'],
  longDescription:
    'Easily flip your videos horizontally (mirror) or vertically (upside down) with this simple online tool.',
  component: lazy(() => import('./index'))
});
