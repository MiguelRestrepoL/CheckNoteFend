import { defineConfig } from 'vite';
import { resolve } from 'path';

export default defineConfig({
  root: 'src', // ahora la raíz es la carpeta src
  build: {
    outDir: '../dist', // el build saldrá en frontend/dist
    rollupOptions: {
      input: {
        main: resolve(__dirname, '/index.html'),
        login: resolve(__dirname, 'src/inicioSesion/login.html'),
        // aquí puedes seguir agregando más entradas
        // registro: resolve(__dirname, 'src/registrarse/index.html'),
        // home: resolve(__dirname, 'src/home/index.html'),
      }
    }
  }
});