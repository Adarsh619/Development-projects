import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
export default defineConfig({ plugins: [react(), tailwindcss()], build: { rollupOptions: { output: { manualChunks: { charts: ['recharts'], auth: ['@supabase/supabase-js'], ui: ['react', 'react-dom', 'lucide-react'] } } } } });
