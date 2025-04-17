import type { GenericCalcType } from './types';

const areaSphere: GenericCalcType = {
  icon: 'ph:sphere-duotone',
  keywords: [],
  shortDescription: '',
  name: 'Area of a Sphere',
  path: 'area-sphere',
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
