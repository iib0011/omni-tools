import type { GenericCalcType } from './types';
import i18n from 'i18n/i18n';

const ohmsLawCalc: GenericCalcType = {
  icon: 'mdi:ohm',
  keywords: [
    'ohm',
    'voltage',
    'current',
    'resistance',
    'electrical',
    'circuit',
    'electronics',
    'power',
    'V=IR'
  ],
  name: i18n.t('ohmLaw'),
  path: 'ohms-law',
  description: i18n.t('ohmLawDescription'),
  shortDescription: i18n.t('ohmLawShortDescription'),
  longDescription: i18n.t('ohmLawLongDescription'),
  formula: 'V = I * R',
  presets: [],
  variables: [
    {
      name: 'V',
      title: 'Voltage',
      unit: 'volt',
      default: 5
    },
    {
      name: 'I',
      title: 'Current',
      unit: 'ampere',
      default: 1
    },
    {
      name: 'R',
      title: 'Resistance',
      unit: 'ohm'
    }
  ]
};

export default ohmsLawCalc;
