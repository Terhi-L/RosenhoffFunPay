import { defineConfig } from 'vite'
import { devtools } from '@tanstack/devtools-vite'

import { tanstackStart } from '@tanstack/react-start/plugin/vite'
import netlify from '@netlify/vite-plugin-tanstack-start'

import viteReact from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

const config = defineConfig(({ command }) => ({
  resolve: { tsconfigPaths: true },
  plugins: [
    devtools(),
    tailwindcss(),
    tanstackStart(),
    // Build only: packages the server for Netlify Functions. In dev its
    // Netlify emulation (edge functions via Deno) can crash `npm run dev`.
    command === 'build' && netlify(),
    viteReact(),
  ],
}))

export default config
