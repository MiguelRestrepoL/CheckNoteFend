import { defineConfig } from 'vite';
import { resolve } from 'path';

export default defineConfig({
  root: '.', // raíz es frontend (donde está index.html)
  build: {
    outDir: 'dist', // Vercel busca esto
    emptyOutDir: true,
    rollupOptions: {
      input: {
        main: resolve(__dirname, 'index.html'), // index en la raíz
        login: resolve(__dirname, 'src/inicioSesion/login.html') // login en src
      }
    }
  }
});