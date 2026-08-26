import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import { resolve } from 'path'
import { readFileSync, writeFileSync, readdirSync } from 'fs'

function inlinePlugin() {
  return {
    name: 'inline-html',
    closeBundle() {
      const distDir = resolve(__dirname, 'dist-sell')
      let html = readFileSync(resolve(distDir, 'index.html'), 'utf-8')
      const assetsDir = resolve(distDir, 'assets')

      // Find CSS and JS files in assets/
      const files = readdirSync(assetsDir)
      const cssFile = files.find(f => f.endsWith('.css'))
      const jsFile = files.find(f => f.endsWith('.js'))

      if (cssFile) {
        const css = readFileSync(resolve(assetsDir, cssFile), 'utf-8')
        html = html.replace(/<link[^>]*href="[^"]*\.css"[^>]*>/, `<style>${css}</style>`)
      }
      if (jsFile) {
        const js = readFileSync(resolve(assetsDir, jsFile), 'utf-8')
        html = html.replace(/<script[^>]*src="[^"]*\.js"[^>]*><\/script>/, `<script>${js}</script>`)
      }

      writeFileSync(resolve(distDir, 'index.html'), html)
      console.log('✓ Inlined CSS and JS into single HTML file')
    },
  }
}

export default defineConfig({
  plugins: [vue(), inlinePlugin()],
  root: 'app',
  build: {
    outDir: resolve(__dirname, 'dist-sell'),
    emptyOutDir: true,
    cssCodeSplit: false,
    assetsInlineLimit: 100000000,
    rollupOptions: {
      input: resolve(__dirname, 'app/index.html'),
    },
  },
})
