import { describe, expect, it } from 'vitest';
import {
  commitOrganizerAction,
  createBlankPage,
  createOrganizerHistory,
  redoOrganizerAction,
  selectEveryPage,
  setOrganizerSelection,
  undoOrganizerAction
} from './model';
import { OrganizerPage } from './types';

const sourcePages = (count = 5): OrganizerPage[] =>
  Array.from({ length: count }, (_, index) => ({
    id: `source-${index + 1}`,
    kind: 'source' as const,
    sourceIndex: index,
    sourcePageNumber: index + 1,
    width: 200 + index,
    height: 300 + index,
    rotation: index === 1 ? 90 : 0
  }));

const pageNumbers = (pages: readonly OrganizerPage[]) =>
  pages.map((page) =>
    page.kind === 'source' ? page.sourcePageNumber : 'blank'
  );

describe('organize-pdf model', () => {
  it('reorders a multi-selection with drag-and-drop semantics', () => {
    let history = createOrganizerHistory(sourcePages());
    history = setOrganizerSelection(history, ['source-2', 'source-4']);
    history = commitOrganizerAction(history, {
      type: 'reorder-selected',
      pageIds: history.present.selectedIds,
      targetId: 'source-5',
      placement: 'after'
    });

    expect(pageNumbers(history.present.pages)).toEqual([1, 3, 5, 2, 4]);
    expect(history.present.selectedIds).toEqual(['source-2', 'source-4']);
  });

  it('deletes and duplicates the requested pages in visual order', () => {
    let history = createOrganizerHistory(sourcePages());
    history = setOrganizerSelection(history, ['source-2', 'source-4']);
    history = commitOrganizerAction(history, {
      type: 'delete-selected'
    });
    expect(pageNumbers(history.present.pages)).toEqual([1, 3, 5]);

    history = setOrganizerSelection(history, ['source-1', 'source-5']);
    history = commitOrganizerAction(history, {
      type: 'duplicate-selected',
      newIds: ['copy-1', 'copy-5']
    });
    expect(pageNumbers(history.present.pages)).toEqual([1, 1, 3, 5, 5]);
    expect(history.present.selectedIds).toEqual(['copy-1', 'copy-5']);
  });

  it('does not allow deleting every page', () => {
    let history = createOrganizerHistory(sourcePages(2));
    history = setOrganizerSelection(history, ['source-1', 'source-2']);
    const unchanged = commitOrganizerAction(history, {
      type: 'delete-selected'
    });

    expect(unchanged).toBe(history);
    expect(pageNumbers(unchanged.present.pages)).toEqual([1, 2]);
  });

  it('moves selected pages by one position and to either edge', () => {
    let history = createOrganizerHistory(sourcePages());
    history = setOrganizerSelection(history, ['source-2', 'source-4']);
    history = commitOrganizerAction(history, {
      type: 'move-selected-by',
      direction: -1
    });
    expect(pageNumbers(history.present.pages)).toEqual([2, 1, 4, 3, 5]);

    history = commitOrganizerAction(history, {
      type: 'move-selected-to-end'
    });
    expect(pageNumbers(history.present.pages)).toEqual([1, 3, 5, 2, 4]);

    history = commitOrganizerAction(history, {
      type: 'move-selected-to-start'
    });
    expect(pageNumbers(history.present.pages)).toEqual([2, 4, 1, 3, 5]);
  });

  it('reverses all pages without losing selection', () => {
    let history = createOrganizerHistory(sourcePages(4));
    history = setOrganizerSelection(history, ['source-2']);
    history = commitOrganizerAction(history, { type: 'reverse-all' });

    expect(pageNumbers(history.present.pages)).toEqual([4, 3, 2, 1]);
    expect(history.present.selectedIds).toEqual(['source-2']);
  });

  it('inserts a blank page with the reference dimensions and rotation', () => {
    let history = createOrganizerHistory(sourcePages(3));
    history = setOrganizerSelection(history, ['source-2']);
    const reference = history.present.pages[1];
    const blank = createBlankPage(reference, 'blank-1');
    history = commitOrganizerAction(history, {
      type: 'insert-blank',
      placement: 'after',
      blankPage: blank
    });

    expect(pageNumbers(history.present.pages)).toEqual([1, 2, 'blank', 3]);
    expect(history.present.pages[2]).toMatchObject({
      width: reference.width,
      height: reference.height,
      rotation: 90
    });
    expect(history.present.selectedIds).toEqual(['blank-1']);
  });

  it('undoes and redoes organizational actions', () => {
    let history = createOrganizerHistory(sourcePages(3));
    history = commitOrganizerAction(history, { type: 'reverse-all' });
    expect(pageNumbers(history.present.pages)).toEqual([3, 2, 1]);

    history = undoOrganizerAction(history);
    expect(pageNumbers(history.present.pages)).toEqual([1, 2, 3]);
    expect(history.future).toHaveLength(1);

    history = redoOrganizerAction(history);
    expect(pageNumbers(history.present.pages)).toEqual([3, 2, 1]);
    expect(history.future).toHaveLength(0);
  });

  it('selects all, odd, and even visual page positions', () => {
    const pages = sourcePages();
    expect(selectEveryPage(pages, 'all')).toEqual([
      'source-1',
      'source-2',
      'source-3',
      'source-4',
      'source-5'
    ]);
    expect(selectEveryPage(pages, 'odd')).toEqual([
      'source-1',
      'source-3',
      'source-5'
    ]);
    expect(selectEveryPage(pages, 'even')).toEqual(['source-2', 'source-4']);
  });
});
