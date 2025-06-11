import type { GenericCalcType } from './types';
import material_electrical_properties from '../../../../../datatables/data/material_electrical_properties';
import wire_gauge from '../../../../../datatables/data/wire_gauge';
import i18n from 'i18n/i18n';

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
  name: i18n.t('voltageDropInWire'),
  path: 'cable-voltage-drop',
  formula: 'x = (((p * L) / (A/10**6) ) *2) * I',
  description: i18n.t('voltageDropInWireDescription'),
  shortDescription: i18n.t('voltageDropInWireShortDescription'),
  longDescription: i18n.t('voltageDropInWireLongDescription'),
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
