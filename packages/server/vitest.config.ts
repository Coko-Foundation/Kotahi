import { defineConfig } from 'vitest/config'

export default defineConfig({
  test: {
    environment: 'node',
    globals: true,
    silent: true,
    globalSetup: ['./vitest.setup.ts'],
    setupFiles: ['./vitest.workerDb.ts'],

    coverage: {
      provider: 'v8',
    },
  },
})
