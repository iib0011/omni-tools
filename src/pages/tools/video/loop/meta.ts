import { defineTool } from '@tools/defineTool';
import { lazy } from 'react';

export const tool = defineTool('video', {
  name: 'Loop Video',
  path: 'loop',
  icon: 'ic:baseline-loop',
  description:
    'This online utility lets you loop videos by specifying the number of repetitions. You can preview the looped video before processing. Supports common video formats like MP4, WebM, and OGG.',
  shortDescription: 'Loop videos multiple times',
  keywords: ['loop', 'video', 'repeat', 'duplicate', 'sequence', 'playback'],
  component: lazy(() => import('./index'))
});
