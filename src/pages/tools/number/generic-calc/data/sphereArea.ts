import type { GenericCalcType } from './types';

const areaSphere: GenericCalcType = {
  icon: 'ph:sphere-duotone',
  keywords: [
    'sphere',
    'area',
    'surface area',
    'geometry',
    'mathematics',
    'radius',
    'calculation',
    '3D',
    'shape'
  ],
  shortDescription:
    'Calculate the surface area of a sphere based on its radius',
  name: 'Area of a Sphere',
  path: 'area-sphere',
  description: 'Area of a Sphere',
  longDescription:
    'This calculator determines the surface area of a sphere using the formula A = 4πr². You can either input the radius to find the surface area or enter the surface area to calculate the required radius. This tool is useful for students studying geometry, engineers working with spherical objects, and anyone needing to perform calculations involving spherical surfaces.',
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
