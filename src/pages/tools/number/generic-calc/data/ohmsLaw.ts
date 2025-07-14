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
  shortDescription:
    "Calculate voltage, current, or resistance in electrical circuits using Ohm's Law",
  name: "Ohm's Law",
  path: 'ohms-law',
  description: 'Calculates voltage, current and resistance',
  longDescription:
    "This calculator applies Ohm's Law (V = I × R) to determine any of the three electrical parameters when the other two are known. Ohm's Law is a fundamental principle in electrical engineering that describes the relationship between voltage (V), current (I), and resistance (R). This tool is essential for electronics hobbyists, electrical engineers, and students working with circuits to quickly solve for unknown values in their electrical designs.",
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
