import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig(({ command, mode }) => {
  const env = loadEnv(mode, new URL('.', import.meta.url).pathname, '')

  return {
    plugins: [react()],
    base: command === 'build' ? env.VITE_PUBLIC_BASE_PATH || '/' : '/',
  }
})
