import { tool as audioMergeAudio } from './merge-audio/meta';
import { tool as audioTrim } from './trim/meta';
import { tool as audioChangeSpeed } from './change-speed/meta';
import { tool as audioExtractAudio } from './extract-audio/meta';

export const audioTools = [
  audioExtractAudio,
  audioChangeSpeed,
  audioTrim,
  audioMergeAudio
];
