export type VideoResolution = 240 | 360 | 480 | 720 | 1080;

export type InitialValuesType = {
  width: number;
  height: number;
  maintainAspectRatio: boolean;
  mode: 'preset' | 'custom';
};
