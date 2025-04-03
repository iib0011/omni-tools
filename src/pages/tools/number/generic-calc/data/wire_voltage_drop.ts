import type { GenericCalcType } from './types';
const voltagedropinwire: GenericCalcType = {
  title: 'Round trip voltage drop in cable',
  name: 'cable-voltage-drop',
  formula: 'x = (((p * L) / (A/10**6) ) *2) * I',
  selections: [
    {
      title: 'Material',
      source: 'material-electrical-properties',
      default: 'Copper',
      bind: {
        p: 'resistivity_20c'
      }
    },

    {
      title: 'Wire Gauge',
      source: 'wire-gauge',
      default: '24 AWG',
      bind: {
        A: 'area'
      }
    }
  ],

  extraOutputs: [
    {
      title: 'Total Resistance',
      formula: '((p * L) / (A/10**6))*2',
      unit: 'Ω'
    },
    {
      title: 'Total Power Dissipated',
      formula: 'I**2 * (((p * L) / (A/10**6))*2)',
      unit: 'W'
    }
  ],
  variables: [
    {
      name: 'L',
      title: 'Length',
      unit: 'm',
      default: 1
    },
    {
      name: 'A',
      title: 'Wire Area',
      unit: 'mm',
      default: 1
    },

    {
      name: 'I',
      title: 'Current',
      unit: 'A',
      default: 1
    },
    {
      name: 'p',
      title: 'Resistivity',
      unit: 'Ω/m3',
      default: 1
    },
    {
      name: 'x',
      title: 'Voltage Drop',
      unit: 'V'
    }
  ]
};

export default voltagedropinwire;
