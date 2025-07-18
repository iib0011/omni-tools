import { stringTools } from '../pages/tools/string';
import { imageTools } from '../pages/tools/image';
import { DefinedTool, ToolCategory } from './defineTool';
import { capitalizeFirstLetter } from '@utils/string';
import { numberTools } from '../pages/tools/number';
import { videoTools } from '../pages/tools/video';
import { audioTools } from 'pages/tools/audio';
import { listTools } from '../pages/tools/list';
import { Entries } from 'type-fest';
import { jsonTools } from '../pages/tools/json';
import { csvTools } from '../pages/tools/csv';
import { timeTools } from '../pages/tools/time';
import { IconifyIcon } from '@iconify/react';
import { pdfTools } from '../pages/tools/pdf';
import { xmlTools } from '../pages/tools/xml';
import { TFunction } from 'i18next';
import { FullI18nKey, I18nNamespaces } from '../i18n';

const toolCategoriesOrder: ToolCategory[] = [
  'image-generic',
  'pdf',
  'string',
  'video',
  'time',
  'audio',
  'json',
  'list',
  'csv',
  'number',
  'png',
  'time',
  'xml',
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
  ...timeTools,
  ...audioTools,
  ...xmlTools
];
const categoriesConfig: {
  type: ToolCategory;
  title: FullI18nKey;
  value: FullI18nKey;
  icon: IconifyIcon | string;
}[] = [
  {
    type: 'string',
    icon: 'solar:text-bold-duotone',
    value: 'translation:categories.string.description',
    title: 'translation:categories.string.title'
  },
  {
    type: 'png',
    icon: 'ph:file-png-thin',
    value: 'translation:categories.png.description',
    title: 'translation:categories.png.title'
  },
  {
    type: 'number',
    icon: 'lsicon:number-filled',
    value: 'translation:categories.number.description',
    title: 'translation:categories.number.title'
  },
  {
    type: 'gif',
    icon: 'material-symbols-light:gif-rounded',
    value: 'translation:categories.gif.description',
    title: 'translation:categories.gif.title'
  },
  {
    type: 'list',
    icon: 'solar:list-bold-duotone',
    value: 'translation:categories.list.description',
    title: 'translation:categories.list.title'
  },
  {
    type: 'json',
    icon: 'lets-icons:json-light',
    value: 'translation:categories.json.description',
    title: 'translation:categories.json.title'
  },
  {
    type: 'time',
    icon: 'mdi:clock-time-five',
    value: 'translation:categories.time.description',
    title: 'translation:categories.time.title'
  },
  {
    type: 'csv',
    icon: 'material-symbols-light:csv-outline',
    value: 'translation:categories.csv.description',
    title: 'translation:categories.csv.title'
  },
  {
    type: 'video',
    icon: 'lets-icons:video-light',
    value: 'translation:categories.video.description',
    title: 'translation:categories.video.title'
  },
  {
    type: 'pdf',
    icon: 'tabler:pdf',
    value: 'translation:categories.pdf.description',
    title: 'translation:categories.pdf.title'
  },
  {
    type: 'time',
    icon: 'fluent-mdl2:date-time',
    value: 'translation:categories.time.description',
    title: 'translation:categories.time.title'
  },
  {
    type: 'image-generic',
    icon: 'material-symbols-light:image-outline-rounded',
    value: 'translation:categories.image-generic.description',
    title: 'translation:categories.image-generic.title'
  },
  {
    type: 'audio',
    icon: 'ic:twotone-audiotrack',
    value: 'translation:categories.audio.description',
    title: 'translation:categories.audio.title'
  },
  {
    type: 'xml',
    icon: 'mdi-light:xml',
    value: 'translation:categories.xml.description',
    title: 'translation:categories.xml.title'
  }
];
// use for changelogs
// console.log(
//   'tools',
//   tools.map(({ name, type }) => ({ type, name }))
// );
export const filterTools = (
  tools: DefinedTool[],
  query: string,
  t: TFunction<I18nNamespaces[]>
): DefinedTool[] => {
  if (!query) return tools;

  const lowerCaseQuery = query.toLowerCase();
  return tools.filter(
    (tool) =>
      t(tool.name).toLowerCase().includes(lowerCaseQuery) ||
      t(tool.description).toLowerCase().includes(lowerCaseQuery) ||
      t(tool.shortDescription).toLowerCase().includes(lowerCaseQuery) ||
      tool.keywords.some((keyword) =>
        keyword.toLowerCase().includes(lowerCaseQuery)
      )
  );
};

export const getToolsByCategory = (
  t: TFunction<I18nNamespaces[]>
): {
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
        rawTitle: categoryConfig?.title
          ? t(categoryConfig.title)
          : capitalizeFirstLetter(type),
        title: categoryConfig?.title
          ? t(categoryConfig.title)
          : `${capitalizeFirstLetter(type)} Tools`,
        description: categoryConfig?.value ? t(categoryConfig.value) : '',
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
