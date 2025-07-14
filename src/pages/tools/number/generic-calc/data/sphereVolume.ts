import type { GenericCalcType } from './types';

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
  shortDescription: 'Calculate the volume of a sphere using radius or diameter',
  name: 'Volume of a Sphere',
  i18n: {
    name: 'number:sphereVolume.title',
    description: 'number:sphereVolume.description',
    shortDescription: 'number:sphereVolume.shortDescription',
    longDescription: 'number:sphereVolume.longDescription'
  },
  path: 'volume-sphere',
  description: 'Volume of a Sphere',
  longDescription:
    'This calculator computes the volume of a sphere using the formula V = (4/3)πr³. You can input either the radius or diameter to find the volume, or enter the volume to determine the required radius. The tool is valuable for students, engineers, and professionals working with spherical objects in fields such as physics, engineering, and manufacturing.',
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
