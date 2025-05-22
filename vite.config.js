import preact from '@preact/preset-vite'
import { resolve } from 'path'
import { defineConfig } from 'vite'
import cssInjectedByJsPlugin from 'vite-plugin-css-injected-by-js'
import million from 'million/compiler'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [million.vite({ auto: true }), preact(), cssInjectedByJsPlugin()],
  build: {
    lib: {
      fileName: 'index',
      entry: resolve(__dirname, './src/index.tsx'),
      formats: ['es'],
    },
    minify: true,
    sourcemap: true,
    target: 'esnext'
  },
  server: {
    port: 5173,
  },
})
