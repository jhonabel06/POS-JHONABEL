import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: {
    host: true, // Permite acceso desde cualquier IP en la red
    //port: 5173, // Opcional: cambia el puerto si es necesario
  }

})
