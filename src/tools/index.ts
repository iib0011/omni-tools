import { stringTools } from '../pages/string/stringTools';
import { imageTools } from '../pages/images/imageTools';
import { DefinedTool } from './defineTool';

export const tools: DefinedTool[] = [...stringTools, ...imageTools];

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
