import { defineConfig } from 'vitest/config'

export default defineConfig({
  test: {
    browser: {
      enabled: true,
      name: 'chrome',
      provider: 'preview'
    },
    include: ['test.js']
  }
})
