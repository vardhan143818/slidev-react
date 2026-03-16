import { defineConfig } from 'vite-plus/pack'

export default defineConfig({
  entry: {
    index: 'src/index.ts',
  },
  dts: false,
  deps: {
    neverBundle: [/^[^./]/],
  },
  format: 'esm',
  outDir: 'dist',
  platform: 'node',
  unbundle: true,
})
