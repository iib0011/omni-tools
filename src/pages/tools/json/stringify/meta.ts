import { defineTool } from '@tools/defineTool';
import { lazy } from 'react';

export const tool = defineTool('json', {
  name: 'Stringify JSON',
  path: 'stringify',
  icon: 'lets-icons:json-format-light',
  description: 'Convert JavaScript objects and arrays into their JSON string representation. Options include custom indentation and HTML character escaping for web-safe JSON strings.',
  shortDescription: 'Convert JavaScript objects to JSON strings',
  keywords: ['stringify', 'serialize', 'convert', 'object', 'array', 'json', 'string'],
  component: lazy(() => import('./index'))
});
