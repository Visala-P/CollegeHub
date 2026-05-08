import { defineConfig } from 'vite'
import tailwindcss from '@tailwindcss/vite'
import react from '@vitejs/plugin-react'

const srcRoot = decodeURIComponent(new URL('./src', import.meta.url).pathname)

function figmaAssetResolver() {
  return {
    name: 'figma-asset-resolver',
    resolveId(id: string) {
      if (id.startsWith('figma:asset/')) {
        const filename = id.replace('figma:asset/', '')
        return decodeURIComponent(new URL(`./src/assets/${filename}`, import.meta.url).pathname)
      }
      return null
    },
  }
}

export default defineConfig(({ mode }) => {
  return {
    base: '/',
    plugins: [
      react(),
      tailwindcss(),
      figmaAssetResolver(),
    ],
    resolve: {
      alias: {
        '@': srcRoot,
      },
    },
    assetsInclude: ['**/*.svg', '**/*.csv'],
  }
})
