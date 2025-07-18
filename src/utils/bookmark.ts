const bookmarkedToolsKey = 'bookmarkedTools';

export function getBookmarkedToolPaths(): string[] {
  return (
    localStorage
      .getItem(bookmarkedToolsKey)
      ?.split(',')
      ?.filter((path) => path) ?? []
  );
}

export function isBookmarked(toolPath: string): boolean {
  return getBookmarkedToolPaths().some((path) => path === toolPath);
}

export function toggleBookmarked(toolPath: string) {
  if (isBookmarked(toolPath)) {
    unbookmark(toolPath);
  } else {
    bookmark(toolPath);
  }
}

function bookmark(toolPath: string) {
  localStorage.setItem(
    bookmarkedToolsKey,
    [toolPath, ...getBookmarkedToolPaths()].join(',')
  );
}

function unbookmark(toolPath: string) {
  localStorage.setItem(
    bookmarkedToolsKey,
    getBookmarkedToolPaths()
      .filter((path) => path !== toolPath)
      .join(',')
  );
}
