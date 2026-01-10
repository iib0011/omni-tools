import type { GenericCalcType } from './types';

const volumeSphere: GenericCalcType = {
  icon: 'gravity-ui:sphere',
  keywords: ['geometry', 'radius', 'diameter', 'capacity', '3d'],
  i18n: {
    name: 'number:sphereVolume.title',
    description: 'number:sphereVolume.description',
    shortDescription: 'number:sphereVolume.shortDescription',
    longDescription: 'number:sphereVolume.longDescription'
  },
  path: 'volume-sphere',
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
