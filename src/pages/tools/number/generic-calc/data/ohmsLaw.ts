import type { GenericCalcType } from './types';

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
  path: 'ohms-law',
  formula: 'V = I * R',
  i18n: {
    name: 'number:ohmsLaw.title',
    description: 'number:ohmsLaw.description',
    shortDescription: 'number:ohmsLaw.shortDescription',
    longDescription: 'number:ohmsLaw.longDescription'
  },
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
