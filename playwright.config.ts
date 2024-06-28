import { defineConfig, devices } from '@playwright/test';

const baseUrl = process.env.BASE_URL || 'http://localhost:5050';

export default defineConfig({
  testDir: './src',
  testMatch: /\.e2e\.(spec\.)?ts$/,
  fullyParallel: true,
  retries: 1,
  use: {
    baseURL: 'http://localhost:5173',
    trace: 'on-first-retry'
  },
  webServer: {
    command: 'npm run preview',
    url: 'http://localhost:4173'
  },
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] }
    },
    {
      name: 'firefox',
      use: { ...devices['Desktop Firefox'] }
    },

    {
      name: 'webkit',
      use: { ...devices['Desktop Safari'] }
    }
  ]
});
