import { stringTools } from '../pages/tools/string';
import { imageTools } from '../pages/tools/image';
import { DefinedTool, ToolCategory } from './defineTool';
import { capitalizeFirstLetter } from '../utils/string';
import { numberTools } from '../pages/tools/number';
import { videoTools } from '../pages/tools/video';
import { listTools } from '../pages/tools/list';
import { Entries } from 'type-fest';
import {
  ArrangeByNumbers19Icon,
  Gif01Icon,
  HugeiconsIcon,
  LeftToRightListBulletIcon,
  Png01Icon,
  TextIcon
} from '@hugeicons/core-free-icons';

export const tools: DefinedTool[] = [
  ...imageTools,
  ...stringTools,
  ...listTools,
  ...videoTools,
  ...numberTools
];
const categoriesConfig: {
  type: ToolCategory;
  value: string;
  title?: string;
  icon: typeof HugeiconsIcon;
}[] = [
  {
    type: 'string',
    title: 'Text',
    icon: TextIcon,
    value:
      'Tools for working with text – convert text to images, find and replace text, split text into fragments, join text lines, repeat text, and much more.'
  },
  {
    type: 'png',
    icon: Png01Icon,
    value:
      'Tools for working with PNG images – convert PNGs to JPGs, create transparent PNGs, change PNG colors, crop, rotate, resize PNGs, and much more.'
  },
  {
    type: 'number',
    icon: ArrangeByNumbers19Icon,
    value:
      'Tools for working with numbers – generate number sequences, convert numbers to words and words to numbers, sort, round, factor numbers, and much more.'
  },
  {
    type: 'gif',
    icon: Gif01Icon,
    value:
      'Tools for working with GIF animations – create transparent GIFs, extract GIF frames, add text to GIF, crop, rotate, reverse GIFs, and much more.'
  },
  {
    type: 'list',
    icon: LeftToRightListBulletIcon,
    value:
      'Tools for working with lists – sort, reverse, randomize lists, find unique and duplicate list items, change list item separators, and much more.'
  }
];
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
  description: string;
  icon: typeof HugeiconsIcon;
  type: string;
  example: { title: string; path: string };
  tools: DefinedTool[];
}[] => {
  const groupedByType: Partial<Record<ToolCategory, DefinedTool[]>> =
    Object.groupBy(tools, ({ type }) => type);
  return (Object.entries(groupedByType) as Entries<typeof groupedByType>).map(
    ([type, tools]) => {
      const categoryConfig = categoriesConfig.find(
        (config) => config.type === type
      );
      return {
        title: `${categoryConfig?.title ?? capitalizeFirstLetter(type)} Tools`,
        description: categoryConfig?.value ?? '',
        type,
        icon: categoryConfig!.icon,
        tools: tools ?? [],
        example: tools
          ? { title: tools[0].name, path: tools[0].path }
          : { title: '', path: '' }
      };
    }
  );
};
