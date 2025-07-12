import { defineTool } from '@tools/defineTool';
import { lazy } from 'react';

export const tool = defineTool('video', {
  name: 'Loop video',
  path: 'loop',
  icon: 'material-symbols:loop',
  description:
    'Create looping videos by repeating the video content. Set the number of loops or create infinite loops.',
  shortDescription:
    'Create looping videos by repeating content (MP4, MOV, AVI).',
  keywords: [
    'loop',
    'video',
    'repeat',
    'cycle',
    'mp4',
    'mov',
    'avi',
    'video editing',
    'playback'
  ],
  longDescription:
    'This tool allows you to create looping videos by repeating the video content multiple times. You can set the number of loops or create infinite loops. Useful for creating background videos, animated content, or repeating sequences. Supports various video formats including MP4, MOV, and AVI.',
  userTypes: ['General Users', 'Students', 'Developers'],
  component: lazy(() => import('./index'))
});
