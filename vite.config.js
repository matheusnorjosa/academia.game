import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import basicSsl from '@vitejs/plugin-basic-ssl'

// `npm run dev`       → http://localhost:5173 (no desktop, câmera/GPS funcionam em localhost)
// `npm run dev:phone` → https com certificado autoassinado, necessário para testar
//                       câmera/GPS no CELULAR via rede local (aceite o aviso do navegador)
export default defineConfig(({ mode }) => ({
  plugins: [react(), tailwindcss(), ...(mode === 'phone' ? [basicSsl()] : [])],
  server: { host: true },
}))
