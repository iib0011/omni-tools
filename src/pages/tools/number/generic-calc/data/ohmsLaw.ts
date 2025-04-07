import type { GenericCalcType } from './types';

const ohmsLawCalc: GenericCalcType = {
  title: "Ohm's Law",
  name: 'ohms-law',
  description: 'Calculates voltage, current and resistance',
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
