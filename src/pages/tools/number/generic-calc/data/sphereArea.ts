import type { GenericCalcType } from './types';
import i18n from 'i18n/i18n';

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
  name: i18n.t('sphereArea'),
  path: 'area-sphere',
  description: i18n.t('sphereAreaDescription'),
  shortDescription: i18n.t('sphereAreaShortDescription'),
  longDescription: i18n.t('sphereAreaLongDescription'),
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
