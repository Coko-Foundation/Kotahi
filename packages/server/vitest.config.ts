import { defineConfig } from 'vitest/config'

export default defineConfig({
  test: {
    environment: 'node',
    globals: true,
    silent: true,
    fileParallelism: false,

    coverage: {
      provider: 'v8',
    },
  },
})
