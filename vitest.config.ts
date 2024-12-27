import {
   configDefaults,
   defineConfig } from 'vitest/config';

export default defineConfig({
   test: {
      exclude: [...configDefaults.exclude],
      include: ['./test/src/**/*.test.ts'],
      coverage: {
         include: ['src/**'],
         exclude: ['src/types/**', 'test/**'],
         provider: 'v8',
         reporter: ['text', 'json', 'html']
      },
      reporters: ['default', 'html'],
      globals: true,
      testTimeout: 20000,
   }
});
