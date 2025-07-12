import { defineTool } from '@tools/defineTool';
import { lazy } from 'react';

export const tool = defineTool('video', {
  name: 'Crop video',
  path: 'crop-video',
  icon: 'material-symbols:crop',
  description:
    'Crop video files to remove unwanted areas or focus on specific parts. Adjust aspect ratios and remove black bars.',
  shortDescription:
    'Crop video files to remove unwanted areas (MP4, MOV, AVI).',
  keywords: [
    'crop',
    'video',
    'trim',
    'aspect ratio',
    'mp4',
    'mov',
    'avi',
    'video editing',
    'resize'
  ],
  longDescription:
    'This tool allows you to crop video files to remove unwanted areas or focus on specific parts of the video. Useful for removing black bars, adjusting aspect ratios, or focusing on important content. Supports various video formats including MP4, MOV, and AVI.',
  userTypes: ['General Users', 'Students', 'Developers'],
  component: lazy(() => import('./index'))
});
