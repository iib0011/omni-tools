import { stringTools } from '../pages/tools/string';
import { imageTools } from '../pages/tools/image';
import { DefinedTool, ToolCategory } from './defineTool';
import { capitalizeFirstLetter } from '../utils/string';
import { numberTools } from '../pages/tools/number';
import { videoTools } from '../pages/tools/video';
import { listTools } from '../pages/tools/list';
import { Entries } from 'type-fest';
import { jsonTools } from '../pages/tools/json';
import { csvTools } from '../pages/tools/csv';
import { timeTools } from '../pages/tools/time';
import { IconifyIcon } from '@iconify/react';
import { pdfTools } from '../pages/tools/pdf';
import i18n from 'i18n/i18n';

const toolCategoriesOrder: ToolCategory[] = [
  'image-generic',
  'string',
  'json',
  'pdf',
  'video',
  'list',
  'csv',
  'number',
  'png',
  'time',
  'gif'
];
export const tools: DefinedTool[] = [
  ...imageTools,
  ...stringTools,
  ...jsonTools,
  ...pdfTools,
  ...listTools,
  ...csvTools,
  ...videoTools,
  ...numberTools,
  ...timeTools
];
const categoriesConfig: {
  type: ToolCategory;
  value: string;
  title?: string;
  icon: IconifyIcon | string;
}[] = [
  {
    type: 'string',
    title: i18n.t('textTool'),
    icon: 'solar:text-bold-duotone',
    value: i18n.t('textToolDescription')
  },
  {
    type: 'png',
    title: i18n.t('pngTool'),
    icon: 'ph:file-png-thin',
    value: i18n.t('pngToolDescription')
  },
  {
    type: 'number',
    title: i18n.t('numberTool'),
    icon: 'lsicon:number-filled',
    value: i18n.t('numberToolDescription')
  },
  {
    type: 'gif',
    title: i18n.t('gifTool'),
    icon: 'material-symbols-light:gif-rounded',
    value: i18n.t('gifToolDescription')
  },
  {
    type: 'list',
    title: i18n.t('listTool'),
    icon: 'solar:list-bold-duotone',
    value: i18n.t('listToolDescription')
  },
  {
    type: 'json',
    title: i18n.t('jsonTool'),
    icon: 'lets-icons:json-light',
    value: i18n.t('jsonToolDescription')
  },
  {
    type: 'time',
    title: i18n.t('timeTool'),
    icon: 'mdi:clock-time-five',
    value: i18n.t('timeToolDescription')
  },
  {
    type: 'csv',
    title: i18n.t('csvTool'),
    icon: 'material-symbols-light:csv-outline',
    value: i18n.t('csvToolDescription')
  },
  {
    type: 'video',
    title: i18n.t('videoTool'),
    icon: 'lets-icons:video-light',
    value: i18n.t('videoToolDescription')
  },
  {
    type: 'pdf',
    title: i18n.t('pdfTool'),
    icon: 'tabler:pdf',
    value: i18n.t('pdfToolDescription')
  },
  {
    type: 'image-generic',
    title: i18n.t('imageTool'),
    icon: 'material-symbols-light:image-outline-rounded',
    value: i18n.t('imageToolDescription')
  }
];
// use for changelogs
// console.log(
//   'tools',
//   tools.map(({ name, type }) => ({ type, name }))
// );
export const filterTools = (
  tools: DefinedTool[],
  query: string
): DefinedTool[] => {
  if (!query) return tools;

  const lowerCaseQuery = query.toLowerCase();

  return tools.filter(
    (tool) =>
      tool.name.toLowerCase().includes(lowerCaseQuery) ||
      tool.description.toLowerCase().includes(lowerCaseQuery) ||
      tool.shortDescription.toLowerCase().includes(lowerCaseQuery) ||
      tool.keywords.some((keyword) =>
        keyword.toLowerCase().includes(lowerCaseQuery)
      )
  );
};

export const getToolsByCategory = (): {
  title: string;
  rawTitle: string;
  description: string;
  icon: IconifyIcon | string;
  type: ToolCategory;
  example: { title: string; path: string };
  tools: DefinedTool[];
}[] => {
  const groupedByType: Partial<Record<ToolCategory, DefinedTool[]>> =
    Object.groupBy(tools, ({ type }) => type);
  return (Object.entries(groupedByType) as Entries<typeof groupedByType>)
    .map(([type, tools]) => {
      const categoryConfig = categoriesConfig.find(
        (config) => config.type === type
      );
      return {
        rawTitle: categoryConfig?.title ?? capitalizeFirstLetter(type),
        title: categoryConfig?.title ?? capitalizeFirstLetter(type),
        description: categoryConfig?.value ?? '',
        type,
        icon: categoryConfig!.icon,
        tools: tools ?? [],
        example: tools
          ? { title: tools[0].name, path: tools[0].path }
          : { title: '', path: '' }
      };
    })
    .sort(
      (a, b) =>
        toolCategoriesOrder.indexOf(a.type) -
        toolCategoriesOrder.indexOf(b.type)
    );
};
