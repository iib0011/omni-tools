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
import { I18nNamespaces } from '../i18n';

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
  value: string;
  title?: string;
  icon: IconifyIcon | string;
}[] = [
  {
    type: 'string',
    title: 'Text',
    icon: 'solar:text-bold-duotone',
    value:
      'Tools for working with text – convert text to images, find and replace text, split text into fragments, join text lines, repeat text, and much more.'
  },
  {
    type: 'png',
    icon: 'ph:file-png-thin',
    value:
      'Tools for working with PNG images – convert PNGs to JPGs, create transparent PNGs, change PNG colors, crop, rotate, resize PNGs, and much more.'
  },
  {
    type: 'number',
    icon: 'lsicon:number-filled',
    value:
      'Tools for working with numbers – generate number sequences, convert numbers to words and words to numbers, sort, round, factor numbers, and much more.'
  },
  {
    type: 'gif',
    icon: 'material-symbols-light:gif-rounded',
    value:
      'Tools for working with GIF animations – create transparent GIFs, extract GIF frames, add text to GIF, crop, rotate, reverse GIFs, and much more.'
  },
  {
    type: 'list',
    icon: 'solar:list-bold-duotone',
    value:
      'Tools for working with lists – sort, reverse, randomize lists, find unique and duplicate list items, change list item separators, and much more.'
  },
  {
    type: 'json',
    icon: 'lets-icons:json-light',
    value:
      'Tools for working with JSON data structures – prettify and minify JSON objects, flatten JSON arrays, stringify JSON values, analyze data, and much more'
  },
  {
    type: 'time',
    icon: 'mdi:clock-time-five',
    value:
      'Tools for working with time and date – calculate time differences, convert between time zones, format dates, generate date sequences, and much more.'
  },
  {
    type: 'csv',
    icon: 'material-symbols-light:csv-outline',
    value:
      'Tools for working with CSV files - convert CSV to different formats, manipulate CSV data, validate CSV structure, and process CSV files efficiently.'
  },
  {
    type: 'video',
    icon: 'lets-icons:video-light',
    value:
      'Tools for working with videos – extract frames from videos, create GIFs from videos, convert videos to different formats, and much more.'
  },
  {
    type: 'pdf',
    icon: 'tabler:pdf',
    value:
      'Tools for working with PDF files - extract text from PDFs, convert PDFs to other formats, manipulate PDFs, and much more.'
  },
  {
    type: 'time',
    icon: 'fluent-mdl2:date-time',
    value:
      'Tools for working with time and date – draw clocks and calendars, generate time and date sequences, calculate average time, convert between time zones, and much more.'
  },
  {
    type: 'image-generic',
    title: 'Image',
    icon: 'material-symbols-light:image-outline-rounded',
    value:
      'Tools for working with pictures – compress, resize, crop, convert to JPG, rotate, remove background and much more.'
  },
  {
    type: 'audio',
    icon: 'ic:twotone-audiotrack',
    value:
      'Tools for working with audio – extract audio from video, adjusting audio speed, merging multiple audio files and much more.'
  },
  {
    type: 'xml',
    icon: 'mdi-light:xml',
    value:
      'Tools for working with XML data structures - viewer, beautifier, validator and much more'
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
  t: TFunction<I18nNamespaces>
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
        title: `${categoryConfig?.title ?? capitalizeFirstLetter(type)} Tools`,
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
