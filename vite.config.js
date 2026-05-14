import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import dts from 'vite-plugin-dts'

export default defineConfig({
  plugins: [
    react(),
    dts({
      include: ['src/index.ts', 'src/features/FlashList'],
      outDir: 'dist',
      rollupTypes: true,
      entryRoot: 'src',
    }),
  ],
  build: {
    copyPublicDir: false,
    lib: {
      entry: 'src/index.ts',
      name: 'ReactBatchScroll',
      formats: ['es', 'cjs'],
      fileName: (format) => `index.${format === 'es' ? 'mjs' : 'cjs'}`,
    },
    rollupOptions: {
      external: ['react', 'react-dom', 'react-virtuoso'],
      output: {
        globals: {
          react: 'React',
          'react-dom': 'ReactDOM',
          'react-virtuoso': 'ReactVirtuoso',
        },
        // preserves "use client" in built output for Next.js App Router
        banner: '"use client";',
      },
    },
  },
})
