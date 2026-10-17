export type AudioMode = 'replace' | 'mix';

export type timingMode = 'default' | 'start' | 'end' | 'startEnd';

export interface initialValuesType {
  mode: AudioMode;
  volume: number;
  loop: boolean;
  startTime: string;
  endTime: string;
  timingMode: timingMode;
}
