import { DefinedTool, defineTool } from '@tools/defineTool';
import { lazy } from 'react';
import type { GenericCalcType } from './data/types';
import allGenericCalcs from './data/index';

async function importComponent(data: GenericCalcType) {
  const x = await import('./index');
  return { default: await x.default(data) };
}

const tools: DefinedTool[] = [];

allGenericCalcs.forEach((x) => {
  async function importComponent2() {
    return await importComponent(x);
  }

  tools.push(
    defineTool('number', {
      ...x,
      path: 'generic-calc/' + x.path,
      keywords: [...x.keywords],
      component: lazy(importComponent2)
    })
  );
});

export { tools };
