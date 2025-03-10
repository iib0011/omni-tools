import { defineTool } from '@tools/defineTool';
import { lazy } from 'react';

export const tool = defineTool('video', {
  name: 'Trim Video',
  path: 'trim',
  icon: 'mdi:scissors',
  description:
    'This online utility lets you trim videos by setting start and end points. You can preview the trimmed section before processing. Supports common video formats like MP4, WebM, and OGG.',
  shortDescription: 'Trim videos by setting start and end points',
  keywords: ['trim', 'cut', 'video', 'clip', 'edit'],
  component: lazy(() => import('./index'))
});
