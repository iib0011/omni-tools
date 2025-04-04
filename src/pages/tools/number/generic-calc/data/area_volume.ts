import type { GenericCalcType } from './types';

export const areaSphere: GenericCalcType = {
  title: 'Area of a Sphere',
  name: 'area-sphere',
  description: 'Area of a Sphere',
  formula: 'A = 4 * pi * r**2',
  selections: [],
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

export const volumeSphere: GenericCalcType = {
  title: 'Volume of a Sphere',
  name: 'volume-sphere',
  description: 'Volume of a Sphere',
  formula: 'v = (4/3) * pi * r**3',
  selections: [],
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
