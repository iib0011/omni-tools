const BOOKMARK_KEY = 'bookmarkedTools';

interface BookmarkData {
  version: number;
  paths: string[];
}

function readBookmarks(): BookmarkData {
  try {
    const raw = localStorage.getItem(BOOKMARK_KEY);
    if (!raw) return { version: 1, paths: [] };

    // Attempt to parse as JSON (v2+), fallback to comma-separated (v1)
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed)) {
      // Migrate v1 format (comma-separated string was stored as array after split)
      return { version: 1, paths: parsed.filter(Boolean) };
    }
    if (parsed && Array.isArray(parsed.paths)) {
      return parsed as BookmarkData;
    }
    return { version: 1, paths: [] };
  } catch {
    // Legacy comma-separated format
    const legacy = (localStorage.getItem(BOOKMARK_KEY) || '')
      .split(',')
      .filter(Boolean);
    return { version: 1, paths: legacy };
  }
}

function writeBookmarks(data: BookmarkData): void {
  localStorage.setItem(BOOKMARK_KEY, JSON.stringify(data));
}

export function getBookmarkedToolPaths(): string[] {
  return readBookmarks().paths;
}

export function isBookmarked(toolPath: string): boolean {
  return readBookmarks().paths.some((path) => path === toolPath);
}

export function toggleBookmarked(toolPath: string) {
  const data = readBookmarks();
  const index = data.paths.indexOf(toolPath);
  if (index >= 0) {
    data.paths.splice(index, 1);
  } else {
    data.paths.unshift(toolPath);
  }
  writeBookmarks(data);
}

export function clearBookmarks(): void {
  writeBookmarks({ version: 1, paths: [] });
}
