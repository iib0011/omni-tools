import { expect, test } from '@playwright/test';
import { Buffer } from 'buffer';
import path from 'path';
import Jimp from 'jimp';
import { convertHexToRGBA } from '@utils/color';

test.describe('Change colors in png', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/png/change-colors-in-png');
  });

  test('should change pixel color', async ({ page }) => {
    // Upload image
    const fileInput = page.locator('input[type="file"]');
    const imagePath = path.join(__dirname, 'test.png');
    await fileInput?.setInputFiles(imagePath);

    await page.getByTestId('from-color-input').fill('#FF0000');
    const toColor = '#0000FF';
    await page.getByTestId('to-color-input').fill(toColor);

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
    expect(color).toBe(convertHexToRGBA(toColor));
  });
});
