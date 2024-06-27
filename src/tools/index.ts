import { stringTools } from '../pages/string';
import { imageTools } from '../pages/image';
import { DefinedTool } from './defineTool';
import { capitalizeFirstLetter } from '../utils/string';
import { numberTools } from '../pages/number';
import { videoTools } from '../pages/video';

export const tools: DefinedTool[] = [
  ...imageTools,
  ...stringTools,
  ...numberTools,
  ...videoTools
];
const categoriesDescriptions: { type: string; value: string }[] = [
  {
    type: 'string',
    value:
      'Tools for working with text – convert text to images, find and replace text, split text into fragments, join text lines, repeat text, and much more.'
  },
  {
    type: 'png',
    value:
      'Tools for working with PNG images – convert PNGs to JPGs, create transparent PNGs, change PNG colors, crop, rotate, resize PNGs, and much more.'
  },
  {
    type: 'number',
    value:
      'Tools for working with numbers – generate number sequences, convert numbers to words and words to numbers, sort, round, factor numbers, and much more.'
  },
  {
    type: 'gif',
    value:
      'Tools for working with GIF animations – create transparent GIFs, extract GIF frames, add text to GIF, crop, rotate, reverse GIFs, and much more.'
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
  type: string;
  example: { title: string; path: string };
  tools: DefinedTool[];
}[] => {
  const grouped: Partial<Record<string, DefinedTool[]>> = Object.groupBy(
    tools,
    ({ type }) => type
  );
  return Object.entries(grouped).map(([type, tls]) => {
    return {
      title: `${capitalizeFirstLetter(type)} Tools`,
      description:
        categoriesDescriptions.find((desc) => desc.type === type)?.value ?? '',
      type,
      tools: tls ?? [],
      example: tls
        ? { title: tls[0].name, path: tls[0].path }
        : { title: '', path: '' }
    };
  });
};
