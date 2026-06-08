import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import path from 'node:path'

const repositoryName = process.env.GITHUB_REPOSITORY?.split('/')[1] ?? 'nuclei-svd'

function normalizeBase(value: string): string {
  if (value === '.' || value === './') {
    return './'
  }

  const withLeadingSlash = value.startsWith('/') ? value : `/${value}`
  return withLeadingSlash.endsWith('/') ? withLeadingSlash : `${withLeadingSlash}/`
}

function resolveBase(command: 'serve' | 'build'): string {
  if (command === 'serve') {
    return '/'
  }

  const explicitBase = process.env.VITE_BASE_PATH ?? process.env.BASE_PATH
  if (explicitBase) {
    return normalizeBase(explicitBase)
  }

  if (process.env.GITHUB_ACTIONS) {
    return `/${repositoryName}/`
  }

  if (process.env.GITLAB_CI && process.env.FTP_REMOTE_DIR) {
    return normalizeBase(process.env.FTP_REMOTE_DIR)
  }

  return './'
}

export default defineConfig(({ command }) => ({
  base: resolveBase(command),
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: './src/test/setup.ts',
    css: true,
    coverage: {
      provider: 'v8',
      reporter: ['text', 'html'],
      exclude: ['src/test/**'],
    },
  },
}))
