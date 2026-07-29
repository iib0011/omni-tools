import { describe, expect, it } from 'vitest';
import { calculatePageAwarePlacement } from './placement';

describe('rotation-aware stamp placement', () => {
  it('maps visual top-left placement into a 90-degree rotated PDF page', () => {
    expect(
      calculatePageAwarePlacement({
        pageWidth: 612,
        pageHeight: 792,
        pageRotation: 90,
        contentWidth: 100,
        contentHeight: 20,
        contentRotation: 0,
        position: 'top-left',
        horizontalMargin: 24,
        verticalMargin: 24
      })
    ).toEqual({
      x: 44,
      y: 24,
      rotation: 90,
      visualPageWidth: 792,
      visualPageHeight: 612
    });
  });

  it('keeps visual bottom-right placement and user rotation on rotated pages', () => {
    expect(
      calculatePageAwarePlacement({
        pageWidth: 612,
        pageHeight: 792,
        pageRotation: 270,
        contentWidth: 100,
        contentHeight: 20,
        contentRotation: -30,
        position: 'bottom-right',
        horizontalMargin: 24,
        verticalMargin: 24
      })
    ).toEqual({
      x: 24,
      y: 124,
      rotation: 240,
      visualPageWidth: 792,
      visualPageHeight: 612
    });
  });

  it('maps a 180-degree page without changing its visual dimensions', () => {
    expect(
      calculatePageAwarePlacement({
        pageWidth: 612,
        pageHeight: 792,
        pageRotation: 180,
        contentWidth: 100,
        contentHeight: 20,
        contentRotation: 15,
        position: 'bottom-left',
        horizontalMargin: 24,
        verticalMargin: 24
      })
    ).toMatchObject({
      x: 588,
      y: 768,
      rotation: 195,
      visualPageWidth: 612,
      visualPageHeight: 792
    });
  });
});
