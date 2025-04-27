import type { GenericCalcType } from './types';
import material_electrical_properties from '../../../../../datatables/data/material_electrical_properties';
import wire_gauge from '../../../../../datatables/data/wire_gauge';

const voltageDropInWire: GenericCalcType = {
  icon: 'simple-icons:wire',
  keywords: [
    'voltage drop',
    'cable',
    'wire',
    'electrical',
    'resistance',
    'power loss',
    'conductor',
    'resistivity',
    'AWG',
    'gauge'
  ],
  shortDescription:
    'Calculate voltage drop and power loss in electrical cables based on length, material, and current',
  name: 'Round trip voltage drop in cable',
  path: 'cable-voltage-drop',
  formula: 'x = (((p * L) / (A/10**6) ) *2) * I',
  description:
    'Calculates round trip voltage and power loss in a 2 conductor cable',
  longDescription:
    'This calculator helps determine the voltage drop and power loss in a two-conductor electrical cable. It takes into account the cable length, wire gauge (cross-sectional area), material resistivity, and current flow. The tool calculates the round-trip voltage drop, total resistance of the cable, and the power dissipated as heat. This is particularly useful for electrical engineers, electricians, and hobbyists when designing electrical systems to ensure voltage levels remain within acceptable limits at the load.',
  presets: [
    {
      title: 'Material',
      source: material_electrical_properties,
      default: 'Copper',
      bind: {
        p: 'resistivity_20c'
      }
    },

    {
      title: 'Wire Gauge',
      source: wire_gauge,
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
      unit: 'meter',
      default: 1
    },
    {
      name: 'A',
      title: 'Wire Area',
      unit: 'mm2',
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
      default: 1,
      defaultPrefix: 'n'
    },
    {
      name: 'x',
      title: 'Voltage Drop',
      unit: 'V'
    }
  ]
};

export default voltageDropInWire;
