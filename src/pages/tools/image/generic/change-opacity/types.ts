export type InitialValuesType = {
  opacity: number;
  mode: 'solid' | 'gradient';
  gradientType: 'linear' | 'radial';
  gradientDirection: 'left-to-right' | 'inside-out' | 'outside-in';
  backgroundMode: 'transparent' | 'color';
  backgroundColor: string;
  areaLeft: number;
  areaTop: number;
  areaWidth: number;
  areaHeight: number;
};
