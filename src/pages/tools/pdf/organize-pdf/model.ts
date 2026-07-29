import {
  DropPlacement,
  OrganizerAction,
  OrganizerBlankPage,
  OrganizerHistory,
  OrganizerPage,
  OrganizerPageId,
  OrganizerSnapshot
} from './types';

const HISTORY_LIMIT = 50;

const normalizeSelection = (
  pages: readonly OrganizerPage[],
  selectedIds: readonly OrganizerPageId[]
): OrganizerPageId[] => {
  const selected = new Set(selectedIds);
  return pages.filter((page) => selected.has(page.id)).map((page) => page.id);
};

const sameOrder = (
  left: readonly OrganizerPage[],
  right: readonly OrganizerPage[]
): boolean =>
  left.length === right.length &&
  left.every((page, index) => page.id === right[index].id);

const sameSelection = (
  left: readonly OrganizerPageId[],
  right: readonly OrganizerPageId[]
): boolean =>
  left.length === right.length &&
  left.every((pageId, index) => pageId === right[index]);

const createSnapshot = (
  pages: readonly OrganizerPage[],
  selectedIds: readonly OrganizerPageId[]
): OrganizerSnapshot => ({
  pages,
  selectedIds: normalizeSelection(pages, selectedIds)
});

export const createOrganizerHistory = (
  pages: readonly OrganizerPage[]
): OrganizerHistory => ({
  past: [],
  present: createSnapshot(pages, []),
  future: []
});

export const setOrganizerSelection = (
  history: OrganizerHistory,
  selectedIds: readonly OrganizerPageId[]
): OrganizerHistory => {
  const normalized = normalizeSelection(history.present.pages, selectedIds);
  if (sameSelection(normalized, history.present.selectedIds)) return history;

  return {
    ...history,
    present: {
      ...history.present,
      selectedIds: normalized
    }
  };
};

const splitSelected = (snapshot: OrganizerSnapshot) => {
  const selected = new Set(snapshot.selectedIds);
  return {
    selectedPages: snapshot.pages.filter((page) => selected.has(page.id)),
    unselectedPages: snapshot.pages.filter((page) => !selected.has(page.id))
  };
};

const insertRelativeToTarget = (
  pages: readonly OrganizerPage[],
  movingIds: readonly OrganizerPageId[],
  targetId: OrganizerPageId,
  placement: DropPlacement
): readonly OrganizerPage[] => {
  const moving = new Set(movingIds);
  if (moving.size === 0 || moving.has(targetId)) return pages;

  const movingPages = pages.filter((page) => moving.has(page.id));
  const remainingPages = pages.filter((page) => !moving.has(page.id));
  const targetIndex = remainingPages.findIndex((page) => page.id === targetId);
  if (targetIndex < 0) return pages;

  const insertionIndex = targetIndex + (placement === 'after' ? 1 : 0);
  return [
    ...remainingPages.slice(0, insertionIndex),
    ...movingPages,
    ...remainingPages.slice(insertionIndex)
  ];
};

const moveSelectedByOne = (
  pages: readonly OrganizerPage[],
  selectedIds: readonly OrganizerPageId[],
  direction: -1 | 1
): readonly OrganizerPage[] => {
  const selected = new Set(selectedIds);
  const nextPages = [...pages];

  if (direction === -1) {
    for (let index = 1; index < nextPages.length; index += 1) {
      if (
        selected.has(nextPages[index].id) &&
        !selected.has(nextPages[index - 1].id)
      ) {
        [nextPages[index - 1], nextPages[index]] = [
          nextPages[index],
          nextPages[index - 1]
        ];
      }
    }
  } else {
    for (let index = nextPages.length - 2; index >= 0; index -= 1) {
      if (
        selected.has(nextPages[index].id) &&
        !selected.has(nextPages[index + 1].id)
      ) {
        [nextPages[index], nextPages[index + 1]] = [
          nextPages[index + 1],
          nextPages[index]
        ];
      }
    }
  }

  return sameOrder(nextPages, pages) ? pages : nextPages;
};

export const applyOrganizerAction = (
  snapshot: OrganizerSnapshot,
  action: OrganizerAction
): OrganizerSnapshot => {
  const selected = new Set(snapshot.selectedIds);

  switch (action.type) {
    case 'delete-selected': {
      if (selected.size === 0 || selected.size >= snapshot.pages.length) {
        return snapshot;
      }
      return createSnapshot(
        snapshot.pages.filter((page) => !selected.has(page.id)),
        []
      );
    }

    case 'duplicate-selected': {
      if (
        selected.size === 0 ||
        action.newIds.length !== selected.size ||
        new Set(action.newIds).size !== action.newIds.length ||
        action.newIds.some((id) =>
          snapshot.pages.some((page) => page.id === id)
        )
      ) {
        return snapshot;
      }

      let duplicateIndex = 0;
      const duplicatedIds: OrganizerPageId[] = [];
      const pages = snapshot.pages.flatMap((page) => {
        if (!selected.has(page.id)) return [page];
        const duplicate = { ...page, id: action.newIds[duplicateIndex] };
        duplicateIndex += 1;
        duplicatedIds.push(duplicate.id);
        return [page, duplicate];
      });
      return createSnapshot(pages, duplicatedIds);
    }

    case 'reverse-all': {
      if (snapshot.pages.length < 2) return snapshot;
      return createSnapshot(
        [...snapshot.pages].reverse(),
        snapshot.selectedIds
      );
    }

    case 'move-selected-to-start':
    case 'move-selected-to-end': {
      if (selected.size === 0 || selected.size === snapshot.pages.length) {
        return snapshot;
      }
      const { selectedPages, unselectedPages } = splitSelected(snapshot);
      const pages =
        action.type === 'move-selected-to-start'
          ? [...selectedPages, ...unselectedPages]
          : [...unselectedPages, ...selectedPages];
      if (sameOrder(pages, snapshot.pages)) return snapshot;
      return createSnapshot(pages, snapshot.selectedIds);
    }

    case 'move-selected-by': {
      const pages = moveSelectedByOne(
        snapshot.pages,
        snapshot.selectedIds,
        action.direction
      );
      if (pages === snapshot.pages) return snapshot;
      return createSnapshot(pages, snapshot.selectedIds);
    }

    case 'reorder-selected': {
      const normalizedIds = normalizeSelection(snapshot.pages, action.pageIds);
      const pages = insertRelativeToTarget(
        snapshot.pages,
        normalizedIds,
        action.targetId,
        action.placement
      );
      if (pages === snapshot.pages || sameOrder(pages, snapshot.pages)) {
        return snapshot;
      }
      return createSnapshot(pages, normalizedIds);
    }

    case 'insert-blank': {
      if (snapshot.selectedIds.length !== 1) return snapshot;
      if (snapshot.pages.some((page) => page.id === action.blankPage.id)) {
        return snapshot;
      }
      const selectedIndex = snapshot.pages.findIndex(
        (page) => page.id === snapshot.selectedIds[0]
      );
      if (selectedIndex < 0) return snapshot;
      const insertionIndex =
        selectedIndex + (action.placement === 'after' ? 1 : 0);
      const pages = [
        ...snapshot.pages.slice(0, insertionIndex),
        action.blankPage,
        ...snapshot.pages.slice(insertionIndex)
      ];
      return createSnapshot(pages, [action.blankPage.id]);
    }
  }
};

export const commitOrganizerAction = (
  history: OrganizerHistory,
  action: OrganizerAction
): OrganizerHistory => {
  const next = applyOrganizerAction(history.present, action);
  if (next === history.present) return history;

  return {
    past: [...history.past.slice(-(HISTORY_LIMIT - 1)), history.present],
    present: next,
    future: []
  };
};

export const undoOrganizerAction = (
  history: OrganizerHistory
): OrganizerHistory => {
  const previous = history.past[history.past.length - 1];
  if (!previous) return history;

  return {
    past: history.past.slice(0, -1),
    present: previous,
    future: [history.present, ...history.future]
  };
};

export const redoOrganizerAction = (
  history: OrganizerHistory
): OrganizerHistory => {
  const next = history.future[0];
  if (!next) return history;

  return {
    past: [...history.past, history.present].slice(-HISTORY_LIMIT),
    present: next,
    future: history.future.slice(1)
  };
};

export const selectEveryPage = (
  pages: readonly OrganizerPage[],
  parity: 'all' | 'odd' | 'even'
): OrganizerPageId[] =>
  pages
    .filter((_, index) => {
      if (parity === 'all') return true;
      const pageNumber = index + 1;
      return parity === 'odd' ? pageNumber % 2 === 1 : pageNumber % 2 === 0;
    })
    .map((page) => page.id);

export const createBlankPage = (
  referencePage: OrganizerPage,
  id: OrganizerPageId
): OrganizerBlankPage => ({
  id,
  kind: 'blank',
  width: referencePage.width,
  height: referencePage.height,
  rotation: referencePage.rotation
});

let generatedId = 0;

export const createOrganizerPageId = (prefix: 'copy' | 'blank'): string => {
  generatedId += 1;
  const randomPart =
    typeof crypto !== 'undefined' && 'randomUUID' in crypto
      ? crypto.randomUUID()
      : `${Date.now().toString(36)}-${generatedId.toString(36)}`;
  return `${prefix}-${randomPart}`;
};
