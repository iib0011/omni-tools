import { defineTool } from '@tools/defineTool';
import { lazy } from 'react';

export const tool = defineTool('number', {
  i18n: {
    name: 'number:randomPortGenerator.title',
    description: 'number:randomPortGenerator.description',
    shortDescription: 'number:randomPortGenerator.shortDescription',
    longDescription: 'number:randomPortGenerator.longDescription'
  },
  path: 'random-port-generator',
  icon: 'mdi:network',
  keywords: [
    'random',
    'port',
    'generator',
    'network',
    'tcp',
    'udp',
    'server',
    'client',
    'development'
  ],
  component: lazy(() => import('./index'))
});
