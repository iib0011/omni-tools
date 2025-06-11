import type { GenericCalcType } from './types';
import i18n from 'i18n/i18n';

const volumeSphere: GenericCalcType = {
  icon: 'gravity-ui:sphere',
  keywords: [
    'sphere',
    'volume',
    'geometry',
    'mathematics',
    'radius',
    'diameter',
    'calculation',
    '3D',
    'shape',
    'capacity'
  ],
  name: i18n.t('sphereVolume'),
  path: 'volume-sphere',
  description: i18n.t('sphereVolumeDescription'),
  shortDescription: i18n.t('sphereVolumeShortDescription'),
  longDescription: i18n.t('sphereVolumeLongDescription'),
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
