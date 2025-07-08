import { defineTool } from '@tools/defineTool';
import { lazy } from 'react';

export const tool = defineTool('video', {
  name: 'Merge Videos',
  path: 'merge-video',
  icon: 'carbon:video-add',
  description: 'Combine multiple video files into one continuous video.',
  shortDescription: 'Append and merge videos easily.',
  keywords: ['merge', 'video', 'append', 'combine'],
  longDescription:
    'This tool allows you to merge or append multiple video files into a single continuous video. Simply upload your video files, arrange them in the desired order, and merge them into one file for easy sharing or editing.',
  component: lazy(() => import('./index'))
});
