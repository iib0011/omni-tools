import { expect, test } from '@playwright/test';

test.describe('JoinText Component', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/string/join');
  });

  test('should merge text pieces with specified join character', async ({
    page
  }) => {
    // Input the text pieces
    await page.getByTestId('text-input').fill('1\n2');

    const result = await page.getByTestId('text-result').inputValue();

    expect(result).toBe('12');
  });
});
