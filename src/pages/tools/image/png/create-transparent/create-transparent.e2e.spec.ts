import { expect, test } from '@playwright/test';
import { Buffer } from 'buffer';
import path from 'path';
import Jimp from 'jimp';

test.describe('Create transparent PNG', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/png/create-transparent');
  });

  test('should make png color transparent', async ({ page }) => {
    // Upload image
    const fileInput = page.locator('input[type="file"]');
    const imagePath = path.join(__dirname, 'test.png');
    await fileInput?.setInputFiles(imagePath);

    await page.getByTestId('color-input').fill('#FF0000');

    // Click on download
    const downloadPromise = page.waitForEvent('download');
    await page.getByText('Save as').click();

    // Intercept and read downloaded PNG
    const download = await downloadPromise;
    const downloadStream = await download.createReadStream();

    const chunks = [];
    for await (const chunk of downloadStream) {
      chunks.push(chunk);
    }
    const fileContent = Buffer.concat(chunks);

    expect(fileContent.length).toBeGreaterThan(0);

    // Check that the first pixel is transparent
    const image = await Jimp.read(fileContent);
    const color = image.getPixelColor(0, 0);
    expect(color).toBe(0);
  });
});
