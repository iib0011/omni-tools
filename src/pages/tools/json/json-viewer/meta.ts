import { defineTool } from '@tools/defineTool';
import { lazy } from 'react';

export const tool = defineTool('json', {
  path: 'json-viewer',
  icon: 'material-symbols:account-tree-outline-rounded',
  keywords: ['json', 'viewer', 'tree', 'inspect', 'visualizer'],
  component: lazy(() => import('./index')),
  i18n: {
    name: 'json:jsonViewer.title',
    description: 'json:jsonViewer.description',
    shortDescription: 'json:jsonViewer.shortDescription'
  }
});
