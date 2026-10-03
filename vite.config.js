import { defineConfig } from 'vite';
import { ViteImageOptimizer } from 'vite-plugin-image-optimizer';

export default defineConfig({
    base: process.env.GITHUB_ACTIONS === 'true'
        ? '/Cadastro-de-Pacientes---Clinica-de-Imagem/'
        : '/',
    plugins: [
        ViteImageOptimizer({
            jpg: { quality: 80 },
            jpeg: { quality: 80 },
            png: { quality: 80 },
            webp: { quality: 80 },
            avif: { quality: 75 },
            svg: { multipass: true }
        })
    ],
    build: {
        outDir: 'dist',
        assetsDir: 'assets',
        emptyOutDir: true,
        sourcemap: false
    }
});