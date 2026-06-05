import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// React frontend mandiri — semua aset lokal ada di public/img/
// Hanya API calls + /static (gambar upload user) yang diproxy ke backend Flask.
export default defineConfig({
  plugins: [react()],
  server: {
    port: 5174,
    proxy: {
      '/api': {
        target: process.env.VITE_API_BASE || 'http://localhost:5000',
        changeOrigin: true,
      },
      // Proxy /static HANYA untuk gambar yang diupload user (foto profil, logo perusahaan, dst.)
      // Aset utama (logo brand, peta) ada di public/img/ dan tidak perlu proxy.
      '/static/uploads': {
        target: process.env.VITE_API_BASE || 'http://localhost:5000',
        changeOrigin: true,
      },
    },
  },
});
