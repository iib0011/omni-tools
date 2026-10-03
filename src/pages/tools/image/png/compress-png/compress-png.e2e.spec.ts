import { expect, test } from '@playwright/test';
import { Buffer } from 'buffer';
import fs from 'fs';
import path from 'path';
import Jimp from 'jimp';

const imagePath = path.join(__dirname, 'test.png');

async function download(page: import('@playwright/test').Page) {
  const downloadPromise = page.waitForEvent('download');
  await page.getByText('Download').click();
  const stream = await (await downloadPromise).createReadStream();

  const chunks: Buffer[] = [];
  for await (const chunk of stream) chunks.push(chunk as Buffer);
  return Buffer.concat(chunks);
}

test.describe('Compress PNG tool', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/png/compress-png');
    await page.locator('input[type="file"]').setInputFiles(imagePath);
    await expect(page.getByText('Colors in the palette')).toBeVisible();
  });

  test('should compress without touching the dimensions', async ({ page }) => {
    const original = await Jimp.read(fs.readFileSync(imagePath));
    const compressed = await download(page);

    const image = await Jimp.read(compressed);
    expect(image.bitmap.width).toBe(original.bitmap.width);
    expect(image.bitmap.height).toBe(original.bitmap.height);
    expect(compressed.length).toBeLessThan(fs.statSync(imagePath).size);
  });

  test('should honor the maximum output size', async ({ page }) => {
    await page.locator('input[name="maxOutputSizeInKB"]').fill('5');

    // Wait for the run that honors the new budget to land.
    await expect
      .poll(async () => {
        const stats = await page.getByText(/Compressed size:/).innerText();
        const size = stats.match(/([\d.]+) KB/);
        return size ? parseFloat(size[1]) : Infinity;
      })
      .toBeLessThanOrEqual(5);

    const original = await Jimp.read(fs.readFileSync(imagePath));
    const compressed = await download(page);

    expect(compressed.length).toBeLessThanOrEqual(5 * 1024);
    const image = await Jimp.read(compressed);
    expect(image.bitmap.width).toBe(original.bitmap.width);
    expect(image.bitmap.height).toBe(original.bitmap.height);
  });
});
