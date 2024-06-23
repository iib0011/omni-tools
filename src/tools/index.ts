import { stringTools } from '../pages/string/stringTools';
import { imageTools } from '../pages/images/imageTools';
import { DefinedTool } from './defineTool';
import { capitalizeFirstLetter } from '../utils/string';

export const tools: DefinedTool[] = [...imageTools, ...stringTools];
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
      example: tls
        ? { title: tls[0].name, path: tls[0].path }
        : { title: '', path: '' }
    };
  });
};
