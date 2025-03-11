import { defineTool } from '@tools/defineTool';
import { lazy } from 'react';

export const tool = defineTool('json', {
  name: 'Minify JSON',
  path: 'minify',
  icon: 'lets-icons:json-light',
  description:
    'Minify your JSON by removing all unnecessary whitespace and formatting. This tool compresses JSON data to its smallest possible size while maintaining valid JSON structure.',
  shortDescription: 'Quickly compress JSON file.',
  keywords: ['minify', 'compress', 'minimize', 'json', 'compact'],
  component: lazy(() => import('./index'))
});
