/**
 * Ponto de Entrada Principal da Aplicação SPA (main.js)
 */

import { router } from './router.js';
import { toast } from './utils/notifications.js';

document.addEventListener('DOMContentLoaded', () => {
    const appContainer = document.getElementById('app');
    
    if (!appContainer) {
        console.error('Elemento raiz #app não encontrado no DOM.');
        return;
    }

    // Inicializa o roteador da Single Page Application
    router.init(appContainer);

    // Controle do menu mobile responsivo
    const menuToggle = document.getElementById('menu-toggle');
    const navMenu = document.getElementById('main-nav');
    const contrastToggle = document.getElementById('contrast-toggle');

    const setHighContrast = (enabled) => {
        document.documentElement.dataset.contrast = enabled ? 'high' : 'standard';
        contrastToggle?.setAttribute('aria-pressed', String(enabled));
    };

    try {
        setHighContrast(localStorage.getItem('imagemrad-high-contrast') === 'true');
    } catch {
        setHighContrast(false);
    }

    contrastToggle?.addEventListener('click', () => {
        const enabled = contrastToggle.getAttribute('aria-pressed') !== 'true';
        setHighContrast(enabled);
        try {
            localStorage.setItem('imagemrad-high-contrast', String(enabled));
        } catch {
            toast.warning('A preferência de contraste não pôde ser salva neste navegador.');
        }
    });

    if (menuToggle && navMenu) {
        const closeMenu = () => {
            navMenu.classList.remove('nav-open');
            menuToggle.setAttribute('aria-expanded', 'false');
        };

        menuToggle.addEventListener('click', () => {
            navMenu.classList.toggle('nav-open');
            menuToggle.setAttribute(
                'aria-expanded', 
                navMenu.classList.contains('nav-open') ? 'true' : 'false'
            );
        });

        // Fecha o menu ao clicar em qualquer link no mobile
        navMenu.querySelectorAll('.nav-link').forEach(link => {
            link.addEventListener('click', closeMenu);
        });

        document.addEventListener('keydown', (event) => {
            if (event.key === 'Escape' && navMenu.classList.contains('nav-open')) {
                closeMenu();
                menuToggle.focus();
            }
        });
    }

    console.info('Clínica Imagem SPA inicializada com sucesso.');
});
