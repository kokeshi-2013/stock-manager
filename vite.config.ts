import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { VitePWA } from 'vite-plugin-pwa'

export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
    VitePWA({
      registerType: 'autoUpdate',
      devOptions: {
        enabled: true
      },
      manifest: {
        name: 'カイタス - 買い忘れ防止リマインド',
        short_name: 'カイタス',
        description: 'そろそろ買い足すもの、教えてくれる。日用品の買い忘れを防止するリマインドアプリ',
        theme_color: '#4CB99C',
        background_color: '#ffffff',
        display: 'standalone',
        start_url: '/app',
        icons: [
          {
            src: '/pwa-192x192.png',
            sizes: '192x192',
            type: 'image/png'
          },
          {
            src: '/pwa-512x512.png',
            sizes: '512x512',
            type: 'image/png'
          }
        ]
      }
    })
  ],
})