import { existsSync } from 'node:fs'
import { defineConfig } from '@playwright/test'

// Reutiliza o Chrome instalado no Windows; outros ambientes usam o Chromium do Playwright.
const localChrome = 'C:/Program Files/Google/Chrome/Application/chrome.exe'
const executablePath = process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH
  ?? (existsSync(localChrome) ? localChrome : undefined)

export default defineConfig({
  testDir: './tests',
  fullyParallel: false,
  workers: 1,
  timeout: 30_000,
  use: {
    baseURL: 'http://127.0.0.1:4175',
    launchOptions: { executablePath },
    trace: 'retain-on-failure',
  },
  projects: [
    { name: 'desktop', use: { viewport: { width: 1440, height: 900 } } },
    { name: 'notebook', use: { viewport: { width: 1280, height: 800 } } },
    { name: 'mobile', use: { viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true } },
    { name: 'mobile-compacto', use: { viewport: { width: 360, height: 640 }, isMobile: true, hasTouch: true } },
    { name: 'mobile-paisagem', use: { viewport: { width: 844, height: 390 }, isMobile: true, hasTouch: true } },
  ],
  webServer: {
    command: 'npm.cmd run preview -- --host 127.0.0.1 --port 4175',
    url: 'http://127.0.0.1:4175',
    reuseExistingServer: !process.env.CI,
  },
})
