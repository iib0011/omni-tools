import { defineTool } from '@tools/defineTool';
import { lazy } from 'react';
// import image from '@assets/text.png';

export const tool = defineTool('number', {
  name: 'Generate',
  path: 'generate',
  icon: 'material-symbols:add-circle',
  description:
    'Generate random numbers within specified ranges. Create sequences of numbers for testing, simulations, or random data generation.',
  shortDescription: 'Generate random numbers in specified ranges',
  keywords: ['generate', 'random', 'numbers'],
  component: lazy(() => import('./index')),
  i18n: {
    name: 'number:generate.title',
    description: 'number:generate.description',
    shortDescription: 'number:generate.shortDescription'
  }
});
