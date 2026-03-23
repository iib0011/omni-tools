export type AudioMode = 'replace' | 'mix';

export interface AddAudioOptions {
  mode: AudioMode;
  volume: number;
}
