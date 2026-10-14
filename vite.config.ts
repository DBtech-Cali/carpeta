import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// GitHub Pages sirve la app en https://dbtech-cali.github.io/carpeta/
export default defineConfig(({ command, isPreview }) => ({
  plugins: [react()],
  base: command === 'build' || isPreview ? '/carpeta/' : '/',
}));
