import tailwindcss from '@tailwindcss/vite';
import vue from '@vitejs/plugin-vue';
import { defineConfig } from 'vite';

// Relative base so the built site works on GitHub project pages
// (https://<user>.github.io/<repo>/) and on a local preview.
export default defineConfig({
  base: './',
  plugins: [vue(), tailwindcss()],
});
