import { DefinedTool } from '@tools/defineTool';

const bookmarkedToolsKey = 'bookmarkedTools';

export function getBookmarkedToolPaths(): string[] {
  return localStorage.getItem(bookmarkedToolsKey)?.split(',') ?? [];
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
    tool.path + ',' + (localStorage.getItem(bookmarkedToolsKey) ?? '')
  );
}

function unbookmark(tool: DefinedTool) {
  const bookmarked = localStorage.getItem(bookmarkedToolsKey)?.split(',') ?? [];
  const unbookmarked = bookmarked.filter((path) => path != tool.path);
  localStorage.setItem(bookmarkedToolsKey, unbookmarked.join(','));
}
