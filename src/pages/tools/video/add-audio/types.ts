export type AudioMode = 'replace' | 'mix';

export type DurationMode = 'default' | 'start' | 'end' | 'startEnd';

export interface AddAudioOptions {
  mode: AudioMode;
  volume: number;
  loop: boolean;
  startTime: string;
  endTime: string;
}

export interface AddAudioFormValues extends AddAudioOptions {
  durationMode: DurationMode;
}
