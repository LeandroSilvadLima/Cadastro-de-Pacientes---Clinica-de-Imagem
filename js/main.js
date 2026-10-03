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

    if (menuToggle && navMenu) {
        menuToggle.addEventListener('click', () => {
            navMenu.classList.toggle('nav-open');
            menuToggle.setAttribute(
                'aria-expanded', 
                navMenu.classList.contains('nav-open') ? 'true' : 'false'
            );
        });

        // Fecha o menu ao clicar em qualquer link no mobile
        navMenu.querySelectorAll('.nav-link').forEach(link => {
            link.addEventListener('click', () => {
                navMenu.classList.remove('nav-open');
                menuToggle.setAttribute('aria-expanded', 'false');
            });
        });
    }

    console.info('Clínica Imagem SPA inicializada com sucesso.');
});
