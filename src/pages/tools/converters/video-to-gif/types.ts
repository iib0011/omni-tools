export type Quality = 'low' | 'mid' | 'high' | 'ultra';

export type InitialValuesType = {
  quality: Quality;
  start: number;
  end: number;
};

export const GIF_PRESETS: Record<
  Quality,
  {
    fps: string;
    scale: string;
  }
> = {
  low: {
    fps: '5',
    scale: '240:-1:flags=bilinear'
  },
  mid: {
    fps: '10',
    scale: '320:-1:flags=bicubic'
  },
  high: {
    fps: '15',
    scale: '480:-1:flags=lanczos'
  },
  ultra: {
    fps: '15',
    scale: '640:-1:flags=lanczos'
  }
};
