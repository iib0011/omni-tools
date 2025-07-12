import { defineTool } from '@tools/defineTool';
import { lazy } from 'react';

export const tool = defineTool('video', {
  name: 'Flip video',
  path: 'flip',
  icon: 'material-symbols:flip',
  description:
    'Flip video files horizontally or vertically. Mirror videos or create flipped content for creative purposes.',
  shortDescription:
    'Flip video files horizontally or vertically (MP4, MOV, AVI).',
  keywords: [
    'flip',
    'video',
    'mirror',
    'horizontal',
    'vertical',
    'mp4',
    'mov',
    'avi',
    'video editing',
    'transform'
  ],
  longDescription:
    'This tool allows you to flip video files horizontally or vertically. Useful for creating mirror effects, correcting incorrectly oriented videos, or creating creative content. Supports various video formats including MP4, MOV, and AVI.',
  userTypes: ['General Users', 'Students', 'Developers'],
  component: lazy(() => import('./index'))
});
