import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import vueDevTools from 'vite-plugin-vue-devtools'

// Plugins utilizados no desenvolvimento e na compilação dos componentes Vue.
export default defineConfig({
  plugins: [
    vue(),
    vueDevTools(),
  ],
})
