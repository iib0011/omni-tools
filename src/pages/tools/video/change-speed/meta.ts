import { defineTool } from '@tools/defineTool';
import { lazy } from 'react';

export const tool = defineTool('video', {
  name: 'Change video speed',
  path: 'change-speed',
  icon: 'material-symbols:speed',
  description:
    'Change the playback speed of video files. Speed up or slow down videos while maintaining audio pitch.',
  shortDescription:
    'Change the speed of video files (MP4, MOV, AVI) with audio control.',
  keywords: [
    'speed',
    'video',
    'tempo',
    'pitch',
    'mp4',
    'mov',
    'avi',
    'video editing',
    'playback'
  ],
  longDescription:
    'This tool allows you to change the playback speed of video files. You can speed up or slow down videos while maintaining the original audio pitch, or with pitch correction. Supports various video formats including MP4, MOV, and AVI. Perfect for creating time-lapse videos, slow-motion effects, or adjusting video speed for different purposes.',
  userTypes: ['General Users', 'Students', 'Developers'],
  component: lazy(() => import('./index'))
});
