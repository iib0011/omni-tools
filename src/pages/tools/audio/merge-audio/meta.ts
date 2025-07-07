import { defineTool } from '@tools/defineTool';
import { lazy } from 'react';

export const tool = defineTool('audio', {
  name: 'Merge Audio',
  path: 'merge-audio',
  icon: 'mdi:music-note-multiple',
  description:
    'Combine multiple audio files into a single audio file by concatenating them in sequence.',
  shortDescription: 'Merge multiple audio files into one (MP3, AAC, WAV).',
  keywords: [
    'merge',
    'audio',
    'combine',
    'concatenate',
    'join',
    'mp3',
    'aac',
    'wav',
    'audio editing',
    'multiple files'
  ],
  longDescription:
    'This tool allows you to merge multiple audio files into a single file by concatenating them in the order you upload them. Perfect for combining podcast segments, music tracks, or any audio files that need to be joined together. Supports various audio formats including MP3, AAC, and WAV.',
  component: lazy(() => import('./index'))
});
