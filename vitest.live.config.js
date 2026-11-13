import { defineConfig } from 'vitest/config'

// Separate config so live API checks never run as part of `npm test`.
export default defineConfig({
  test: { environment: 'node', include: ['tests/live/**/*.live.test.js'], testTimeout: 20_000 },
})
