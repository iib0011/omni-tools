import { defineTool } from '@tools/defineTool';
import { lazy } from 'react';

export const tool = defineTool('video', {
  name: 'Rotate Video',
  path: 'rotate',
  icon: 'mdi:rotate-right',
  description:
    'This online utility lets you rotate videos by 90, 180, or 270 degrees. You can preview the rotated video before processing. Supports common video formats like MP4, WebM, and OGG.',
  shortDescription: 'Rotate videos by 90, 180, or 270 degrees',
  keywords: ['rotate', 'video', 'flip', 'edit', 'adjust'],
  component: lazy(() => import('./index'))
});
