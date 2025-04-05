import type { GenericCalcType } from './types';

const areaSphere: GenericCalcType = {
  title: 'Area of a Sphere',
  name: 'area-sphere',
  description: 'Area of a Sphere',
  formula: 'A = 4 * pi * r**2',
  presets: [],
  variables: [
    {
      name: 'A',
      title: 'Area',
      unit: 'mm2'
    },
    {
      name: 'r',
      title: 'Radius',
      formula: 'r = sqrt(A/pi) / 2',
      unit: 'mm',
      default: 1
    }
  ]
};

export default areaSphere;
