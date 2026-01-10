import { stringTools } from '../pages/tools/string';
import { imageTools } from '../pages/tools/image';
import { DefinedTool, ToolCategory, UserType } from './defineTool';
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
import { convertersTools } from '../pages/tools/converters';
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
  'gif',
  'converters'
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
  ...xmlTools,
  ...convertersTools
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
  },
  {
    type: 'converters',
    icon: 'streamline-plump:convert-pdf-1',
    value: 'translation:categories.converters.description',
    title: 'translation:categories.converters.title'
  }
];
const CATEGORIES_USER_TYPES_MAPPINGS: Partial<Record<ToolCategory, UserType>> =
  {
    xml: 'developers',
    csv: 'developers',
    json: 'developers',
    gif: 'generalUsers',
    png: 'generalUsers',
    'image-generic': 'generalUsers',
    video: 'generalUsers',
    audio: 'generalUsers',
    converters: 'generalUsers'
  };
// Filter tools by user types
export const filterToolsByUserTypes = (
  tools: DefinedTool[],
  userTypes: UserType[]
): DefinedTool[] => {
  if (userTypes.length === 0) return tools;

  return tools.filter((tool) => {
    if (CATEGORIES_USER_TYPES_MAPPINGS[tool.type]) {
      return userTypes.includes(CATEGORIES_USER_TYPES_MAPPINGS[tool.type]!);
    }
    // If tool has no userTypes defined, show it to all users
    if (!tool.userTypes || tool.userTypes.length === 0) return true;

    // Check if tool has any of the selected user types
    return tool.userTypes.some((userType) => userTypes.includes(userType));
  });
};

// use for changelogs
// console.log(
//   'tools',
//   tools.map(({ name, type }) => ({ type, name }))
// );
export const filterTools = (
  tools: DefinedTool[],
  query: string,
  userTypes: UserType[] = [],
  t: TFunction<I18nNamespaces[]>
): DefinedTool[] => {
  let filteredTools = tools;

  // First filter by user types
  if (userTypes.length > 0) {
    filteredTools = filterToolsByUserTypes(tools, userTypes);
  }

  // Normalize query: trim, collapse internal whitespace, lowercase, split into tokens
  const normalizedQuery = query.trim().toLowerCase().replace(/\s+/g, ' ');

  // If query is empty after normalization, return all tools (after user-type filtering)
  if (!normalizedQuery) return filteredTools;

  const tokens = normalizedQuery.split(' ').filter(Boolean);

  if (tokens.length === 0) return filteredTools;

  return filteredTools.filter((tool) => {
    const searchableTexts = [
      t(tool.name),
      t(tool.description),
      t(tool.shortDescription),
      ...tool.keywords
    ].map((text) => text.toLowerCase());

    // Require that every query token appears in at least one of the searchable strings
    return tokens.every((token) =>
      searchableTexts.some((text) => text.includes(token))
    );
  });
};

export const getToolsByCategory = (
  userTypes: UserType[] = [],
  t: TFunction<I18nNamespaces[]>
): {
  title: string;
  rawTitle: string;
  description: string;
  icon: IconifyIcon | string;
  type: ToolCategory;
  example: { title: string; path: string };
  tools: DefinedTool[];
  userTypes: UserType[]; // <-- Add this line
}[] => {
  const groupedByType: Partial<Record<ToolCategory, DefinedTool[]>> =
    Object.groupBy(tools, ({ type }) => type);

  return (Object.entries(groupedByType) as Entries<typeof groupedByType>)
    .map(([type, tools]) => {
      const categoryConfig = categoriesConfig.find(
        (config) => config.type === type
      );

      // Filter tools by user types if specified
      const filteredTools =
        userTypes.length > 0
          ? filterToolsByUserTypes(tools ?? [], userTypes)
          : tools ?? [];

      // Aggregate unique userTypes from all tools in this category
      const aggregatedUserTypes = Array.from(
        new Set((filteredTools ?? []).flatMap((tool) => tool.userTypes ?? []))
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
        tools: filteredTools,
        example:
          filteredTools.length > 0
            ? { title: filteredTools[0].name, path: filteredTools[0].path }
            : { title: '', path: '' },
        userTypes: aggregatedUserTypes // <-- Add this line
      };
    })
    .filter((category) => category.tools.length > 0)
    .filter((category) =>
      userTypes.length > 0
        ? [...category.userTypes, CATEGORIES_USER_TYPES_MAPPINGS[category.type]]
            .filter(Boolean)
            .some((categoryUserType) => userTypes.includes(categoryUserType!))
        : true
    ) // Only show categories with tools
    .sort(
      (a, b) =>
        toolCategoriesOrder.indexOf(a.type) -
        toolCategoriesOrder.indexOf(b.type)
    );
};
