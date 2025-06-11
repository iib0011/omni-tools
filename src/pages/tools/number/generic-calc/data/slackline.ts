import type { GenericCalcType } from './types';
import i18n from 'i18n/i18n';

const slackline: GenericCalcType = {
  icon: 'mdi:bridge',
  keywords: [
    'mechanical',
    'rope',
    'webbing',
    'cord',
    'string',
    'tension',
    'clothesline'
  ],
  name: i18n.t('slacklineTension'),
  path: 'slackline-tension',
  description: i18n.t('slacklineTensionDescription'),
  shortDescription: i18n.t('slacklineTensionShortDescription'),
  longDescription: i18n.t('slacklineTensionLongDescription'),
  formula: 'T = (W * sqrt((S**2) + ((L/2)**2)) )/ (2S)',
  presets: [],
  variables: [
    {
      name: 'L',
      title: 'Length',
      unit: 'meter',
      default: 2
    },
    {
      name: 'W',
      title: 'Weight',
      unit: 'pound',
      default: 1
    },
    {
      name: 'S',
      title: 'Sag/Deflection',
      unit: 'meter',
      default: 0.05
    },
    {
      name: 'T',
      title: 'Tension',
      unit: 'pound-force'
    }
  ]
};

export default slackline;
