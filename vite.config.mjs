import { defineConfig } from 'vite'
import { viteStaticCopy } from 'vite-plugin-static-copy';

// https://vitejs.dev/config/
export default defineConfig({
  base: './',
  plugins: [
    viteStaticCopy({
      targets: [
        {
          src: 'node_modules/onnxruntime-web/dist/*.wasm',
          dest: '.'
        }
      ]
    }),
  ],
})