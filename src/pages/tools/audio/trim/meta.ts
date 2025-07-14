import { defineTool } from '@tools/defineTool';
import { lazy } from 'react';

export const tool = defineTool('audio', {
  i18n: {
    name: 'audio:trim.title',
    description: 'audio:trim.description',
    shortDescription: 'audio:trim.shortDescription',
    longDescription: 'audio:trim.longDescription'
  },
  name: 'Trim Audio',
  path: 'trim',
  icon: 'mdi:scissors-cutting',
  description:
    'Cut and trim audio files to extract specific segments by specifying start and end times.',
  shortDescription:
    'Trim audio files to extract specific time segments (MP3, AAC, WAV).',
  keywords: [
    'trim',
    'audio',
    'cut',
    'segment',
    'extract',
    'mp3',
    'aac',
    'wav',
    'audio editing',
    'time'
  ],
  longDescription:
    'This tool allows you to trim audio files by specifying start and end times. You can extract specific segments from longer audio files, remove unwanted parts, or create shorter clips. Supports various audio formats including MP3, AAC, and WAV. Perfect for podcast editing, music production, or any audio editing needs.',
  component: lazy(() => import('./index'))
});
