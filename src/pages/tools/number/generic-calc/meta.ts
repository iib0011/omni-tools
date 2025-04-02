import { defineTool } from '@tools/defineTool';
import { lazy } from 'react';

async function importComponent() {
  const x = await import('./index');
  return { default: x.default() };
}
export const tool = defineTool('number', {
  name: 'Generic calc',
  path: 'generic-calc',
  icon: '',
  description: '',
  shortDescription: '',
  keywords: ['generic', 'calc'],
  longDescription: '',
  component: lazy(importComponent)
});
