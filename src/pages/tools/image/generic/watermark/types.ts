export type Position =
  | 'bottom-right'
  | 'bottom-left'
  | 'top-right'
  | 'top-left'
  | 'center';

export type InitialValuesType = {
  filename: boolean;
  watermark: string;
  watermarkOpacity: number;
  fontSize: number;
  position: Position;
  color: string;
};
