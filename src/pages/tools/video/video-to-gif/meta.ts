import { defineTool } from '@tools/defineTool';
import { lazy } from 'react';

export const tool = defineTool('video', {
  name: 'Convert video to GIF',
  path: 'video-to-gif',
  icon: 'material-symbols:gif',
  description:
    'Convert video files to animated GIF format. Create animated GIFs from video clips with customizable settings.',
  shortDescription:
    'Convert video files to animated GIF format (MP4, MOV, AVI to GIF).',
  keywords: [
    'video',
    'gif',
    'convert',
    'animated',
    'mp4',
    'mov',
    'avi',
    'video editing',
    'animation'
  ],
  longDescription:
    'This tool allows you to convert video files to animated GIF format. You can create animated GIFs from video clips with customizable settings like frame rate, quality, and duration. Supports various video formats including MP4, MOV, and AVI. Perfect for creating animated content for social media, websites, or presentations.',
  userTypes: ['General Users', 'Students', 'Developers'],
  component: lazy(() => import('./index'))
});
