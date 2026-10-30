import { fileURLToPath } from 'node:url';
import { defineConfig } from 'vitest/config';

const fixture = (name: string) => fileURLToPath(new URL(`./tests/fixtures/data/${name}`, import.meta.url));

export default defineConfig({
  test: {
    include: ['tests/**/*.test.ts'],
    coverage: { include: ['src/engine/**', 'src/data/**'] },
    // The daily workflow rewrites these files; behaviour tests use frozen copies so
    // new rounds or a changed official page can't break them (see tests/fixtures/data/).
    alias: [
      { find: /^\.\/draws\.json$/, replacement: fixture('draws.json') },
      { find: /^\.\/source-status\.json$/, replacement: fixture('source-status.json') },
      { find: /^\.\.\/data\/updates-log\.json$/, replacement: fixture('updates-log.json') },
    ],
  },
});
