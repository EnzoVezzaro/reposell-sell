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

      let inlinedJs = ''

      if (cssFile) {
        const css = readFileSync(resolve(assetsDir, cssFile), 'utf-8')
        html = html.replace(/<link[^>]*href="[^"]*\.css"[^>]*>/, `<style>${css}</style>`)
      }
      if (jsFile) {
        const js = readFileSync(resolve(assetsDir, jsFile), 'utf-8')
        inlinedJs = `<script>${js}</script>`
        // Remove the module script tag (Vite may put it in <head>)
        html = html.replace(/<script[^>]*type="module"[^>]*src="[^"]*"[^>]*><\/script>/, '')
      }

      // Remove any inline <script> tags that Vite may have hoisted to <head>
      // (they contain the inlined JS but in the wrong position)
      html = html.replace(/<head>([\s\S]*?)<\/head>/, (_match, headContent) => {
        // Keep only non-script content in <head>
        const cleaned = headContent.replace(/<script>[\s\S]*?<\/script>/, '')
        return `<head>${cleaned}</head>`
      })

      // Insert the script at the end of <body>, right before the LAST </body>
      // (the JS contains '</body>' as a string literal, so we must use lastIndexOf)
      const lastBodyClose = html.lastIndexOf('</body>')
      html = html.substring(0, lastBodyClose) + inlinedJs + '\n' + html.substring(lastBodyClose)

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
