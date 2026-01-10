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

const levenshtein = (a: string, b: string): number => {
  if (a === b) return 0;
  const aLen = a.length;
  const bLen = b.length;

  if (aLen === 0) return bLen;
  if (bLen === 0) return aLen;

  const dp: number[][] = Array.from({ length: aLen + 1 }, () =>
    Array<number>(bLen + 1).fill(0)
  );

  for (let i = 0; i <= aLen; i += 1) dp[i][0] = i;
  for (let j = 0; j <= bLen; j += 1) dp[0][j] = j;

  for (let i = 1; i <= aLen; i += 1) {
    for (let j = 1; j <= bLen; j += 1) {
      const cost = a[i - 1] === b[j - 1] ? 0 : 1;

      dp[i][j] = Math.min(
        dp[i - 1][j] + 1,
        dp[i][j - 1] + 1,
        dp[i - 1][j - 1] + cost
      );
    }
  }

  return dp[aLen][bLen];
};

type SearchField = { text: string; weight: number };

const splitWords = (text: string): string[] =>
  text.split(/[^a-z0-9]+/g).filter(Boolean);

const computeToolScore = (
  tool: DefinedTool,
  tokens: string[],
  t: TFunction<I18nNamespaces[]>
): number => {
  const fields: SearchField[] = [
    { text: t(tool.name).toLowerCase(), weight: 5 },
    { text: t(tool.shortDescription).toLowerCase(), weight: 3 },
    { text: t(tool.description).toLowerCase(), weight: 2 },
    ...(tool.keywords ?? []).map((kw) => ({
      text: kw.toLowerCase(),
      weight: 4
    }))
  ];

  let totalScore = 0;

  for (const token of tokens) {
    if (!token) continue;

    let bestForToken = 0;

    for (const field of fields) {
      const text = field.text;
      if (!text) continue;

      let fieldScore = 0;

      if (text.includes(token)) {
        // Base score for substring match
        fieldScore = field.weight * 2;

        const words = splitWords(text);
        if (words.includes(token)) {
          // Boost whole-word matches
          fieldScore += field.weight;
        }
      } else {
        const words = splitWords(text);

        for (const word of words) {
          if (!word) continue;

          // Quick length check before full distance calculation
          if (Math.abs(word.length - token.length) > 1) continue;

          const dist = levenshtein(token, word);
          if (dist === 1) {
            fieldScore = Math.max(fieldScore, field.weight);
          }
        }
      }

      if (fieldScore > bestForToken) {
        bestForToken = fieldScore;
      }
    }

    // If any token fails to match (exact or fuzzy), treat the tool as a non-match.
    if (bestForToken === 0) {
      return 0;
    }

    totalScore += bestForToken;
  }

  return totalScore;
};

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

  // Normalize query: trim, collapse internal whitespace, lowercase
  const normalizedQuery = query.trim().toLowerCase().replace(/\s+/g, ' ');

  // If query is empty after normalization, return all tools (after user-type filtering)
  if (!normalizedQuery) return filteredTools;

  const rawTokens = normalizedQuery.split(' ').filter(Boolean);
  if (rawTokens.length === 0) return filteredTools;

  // Expand tokens with simple alpha+digit concatenation variants, e.g. "base" + "64" -> "base64".
  // This, combined with per-tool `keywords`, allows us to support aliases like
  // "base 64" / "base64" / "b64" without requiring every form in every keyword list.
  const tokens: string[] = [...rawTokens];

  for (let i = 0; i < rawTokens.length - 1; i += 1) {
    const current = rawTokens[i];
    const next = rawTokens[i + 1];

    if (/^[a-zA-Z]+$/.test(current) && /^\d+$/.test(next)) {
      tokens.push(`${current}${next}`);
    }
  }

  const scored = filteredTools
    .map((tool) => ({
      tool,
      score: computeToolScore(tool, tokens, t)
    }))
    .filter(({ score }) => score > 0)
    .sort((a, b) => {
      if (b.score !== a.score) return b.score - a.score;

      const aName = t(a.tool.name).toLowerCase();
      const bName = t(b.tool.name).toLowerCase();

      return aName.localeCompare(bName);
    });

  return scored.map(({ tool }) => tool);
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
