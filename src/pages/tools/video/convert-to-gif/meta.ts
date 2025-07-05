import { defineTool } from '@tools/defineTool';
import { lazy } from 'react';

export const tool = defineTool('video', {
  name: 'Convert to GIF',
  path: 'convert-to-gif',
  icon: 'mdi:file-gif-box',
  description: 'Convert short videos to GIF format easily and quickly.',
  shortDescription: 'Convert videos to GIFs.',
  keywords: ['video', 'gif', 'convert'],
  component: lazy(() => import('./index'))
});
