import { minify } from 'html-minifier-terser';
import { defineConfig } from 'vite';
import { ViteImageOptimizer } from 'vite-plugin-image-optimizer';

const htmlMinifier = {
    name: 'minify-html',
    enforce: 'post',
    transformIndexHtml: {
        order: 'post',
        handler: (html) => minify(html, {
            collapseWhitespace: true,
            minifyCSS: true,
            minifyJS: true,
            removeComments: true
        })
    }
};

export default defineConfig({
    base: process.env.VITE_BASE_PATH || '/',
    plugins: [
        ViteImageOptimizer({
            includePublic: true,
            cache: true,
            jpg: { quality: 80, mozjpeg: true },
            jpeg: { quality: 80, mozjpeg: true },
            png: { compressionLevel: 9 },
            webp: { quality: 80 },
            avif: { quality: 50 }
        }),
        htmlMinifier
    ],
    build: {
        outDir: 'dist',
        emptyOutDir: true,
        minify: 'oxc',
        cssMinify: 'lightningcss',
        sourcemap: false
    }
});