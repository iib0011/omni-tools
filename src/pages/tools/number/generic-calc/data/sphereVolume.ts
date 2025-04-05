import type { GenericCalcType } from './types';

const volumeSphere: GenericCalcType = {
  title: 'Volume of a Sphere',
  name: 'volume-sphere',
  description: 'Volume of a Sphere',
  formula: 'v = (4/3) * pi * r**3',
  presets: [],
  variables: [
    {
      name: 'v',
      title: 'Volume',
      unit: 'mm3'
    },
    {
      name: 'r',
      title: 'Radius',
      unit: 'mm',
      default: 1,
      alternates: [
        {
          title: 'Diameter',
          formula: 'x = 2 * v',
          unit: 'mm'
        }
      ]
    }
  ]
};

export default volumeSphere;
