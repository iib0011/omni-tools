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
  path: 'area-sphere',
  formula: 'A = 4 * pi * r**2',
  presets: [],
  i18n: {
    name: 'number:sphereArea.title',
    description: 'number:sphereArea.description',
    shortDescription: 'number:sphereArea.shortDescription',
    longDescription: 'number:sphereArea.longDescription'
  },
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
