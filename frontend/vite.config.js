import { defineConfig } from 'vite';
import { resolve } from 'path';

export default defineConfig({
  build: {
    rollupOptions: {
      input: {
        main: resolve(__dirname, 'index.html'),
        login: resolve(__dirname, 'login.html'),
        registro: resolve(__dirname, 'registro.html'),
        'olvidar-password1': resolve(__dirname, 'olvidar-password1.html'),
        home: resolve(__dirname, 'home.html'),
        perfil: resolve(__dirname, 'perfil.html')
      }
    }
  }
});