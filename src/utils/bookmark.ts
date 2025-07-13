import { DefinedTool } from '@tools/defineTool';

const bookmarkedToolsKey = 'bookmarkedTools';

export function getBookmarkedToolPaths(): string[] {
  return (
    localStorage
      .getItem(bookmarkedToolsKey)
      ?.split(',')
      ?.filter((path) => path) ?? []
  );
}

export function isBookmarked(tool: DefinedTool): boolean {
  return getBookmarkedToolPaths().some((path) => path === tool.path);
}

export function toggleBookmarked(tool: DefinedTool) {
  if (isBookmarked(tool)) {
    unbookmark(tool);
  } else {
    bookmark(tool);
  }
}

function bookmark(tool: DefinedTool) {
  localStorage.setItem(
    bookmarkedToolsKey,
    [tool.path, ...getBookmarkedToolPaths()].join(',')
  );
}

function unbookmark(tool: DefinedTool) {
  localStorage.setItem(
    bookmarkedToolsKey,
    getBookmarkedToolPaths()
      .filter((path) => path !== tool.path)
      .join(',')
  );
}
