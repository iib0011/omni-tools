import { defineTool } from '@tools/defineTool';
import { lazy } from 'react';

export const tool = defineTool('list', {
  name: 'Find unique',
  path: 'find-unique',
  icon: 'mynaui:one',
  description:
    "World's simplest browser-based utility for finding unique items in a list. Just input your list with any separator, and it will automatically identify and extract unique items. Perfect for removing duplicates, finding distinct values, or analyzing data uniqueness. You can customize the input/output separators and choose whether to preserve the original order.",
  shortDescription: 'Find unique items in a list',
  keywords: ['find', 'unique'],
  userTypes: ['General Users', 'Students', 'Developers'],
  component: lazy(() => import('./index'))
});
