import { defineTool } from '@tools/defineTool';
import { lazy } from 'react';

export const tool = defineTool('csv', {
  i18n: {
    name: 'csv:csvToYaml.title',
    description: 'csv:csvToYaml.description',
    shortDescription: 'csv:csvToYaml.shortDescription',
    longDescription: 'csv:csvToYaml.longDescription'
  },

  path: 'csv-to-yaml',
  icon: 'nonicons:yaml-16',
  keywords: ['csv', 'to', 'yaml'],
  component: lazy(() => import('./index'))
});
