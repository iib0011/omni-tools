import { defineTool } from '@tools/defineTool';
import { lazy } from 'react';

export const tool = defineTool('audio', {
  name: 'Extract audio',
  path: 'extract-audio',
  icon: 'mdi:music-note',
  description:
    'Extract the audio track from a video file and save it as a separate audio file in your chosen format (AAC, MP3, WAV).',
  shortDescription:
    'Extract audio from video files (MP4, MOV, etc.) to AAC, MP3, or WAV.',
  keywords: [
    'extract',
    'audio',
    'video',
    'mp3',
    'aac',
    'wav',
    'audio extraction',
    'media',
    'convert'
  ],
  longDescription:
    'This tool allows you to extract the audio track from a video file (such as MP4, MOV, AVI, etc.) and save it as a standalone audio file in your preferred format (AAC, MP3, or WAV). Useful for podcasts, music, or any scenario where you need just the audio from a video.',
  component: lazy(() => import('./index')),
  i18n: {
    name: 'audio.extractAudio.name',
    description: 'audio.extractAudio.description',
    shortDescription: 'audio.extractAudio.shortDescription'
  }
});
