/**
 * Gerenciador de Rotas da SPA (Single Page Application)
 */

import { renderDashboard, attachDashboardEvents } from './views/dashboardView.js';
import { renderPatientForm, attachPatientFormEvents } from './views/patientFormView.js';
import { renderPatientList, attachPatientListEvents } from './views/patientListView.js';

class Router {
    constructor() {
        this.appContainer = null;
        this.currentRoute = null;
        this.routes = {
            '#/dashboard': {
                render: () => renderDashboard(),
                attach: (el) => attachDashboardEvents(el),
                title: 'Painel de Controle'
            },
            '#/cadastro': {
                render: () => renderPatientForm(null),
                attach: (el) => attachPatientFormEvents(el, null),
                title: 'Novo Cadastro de Paciente'
            },
            '#/pacientes': {
                render: () => renderPatientList(),
                attach: (el) => attachPatientListEvents(el),
                title: 'Lista de Pacientes'
            }
        };
    }

    /**
     * Inicializa o roteador conectando-se ao container principal
     * @param {HTMLElement} container 
     */
    init(container) {
        this.appContainer = container;

        // Escuta mudanças de hash na URL
        window.addEventListener('hashchange', () => this.handleRoute());

        // Carrega rota inicial
        if (!window.location.hash) {
            window.location.hash = '#/dashboard';
        } else {
            this.handleRoute();
        }
    }

    /**
     * Analisa e renderiza a rota atual baseada no window.location.hash
     */
    handleRoute() {
        const hash = window.location.hash || '#/dashboard';

        // Atualiza estilo ativo nos links de navegação
        this.updateActiveNav(hash);

        // Tratamento de rota dinâmica: #/editar/:id
        if (hash.startsWith('#/editar/')) {
            const patientId = hash.replace('#/editar/', '').trim();
            this.navigateView(
                () => renderPatientForm(patientId),
                (el) => attachPatientFormEvents(el, patientId),
                'Editar Paciente'
            );
            return;
        }

        // Rotas estáticas
        const route = this.routes[hash] || this.routes['#/dashboard'];
        this.navigateView(route.render, route.attach, route.title);
    }

    /**
     * Realiza a transição suave e renderiza a view
     */
    navigateView(renderFn, attachFn, title) {
        if (!this.appContainer) return;

        document.title = `${title} | Clínica Imagem Diagnóstica`;

        // Animação de saída sutil
        this.appContainer.classList.add('view-fade-out');

        setTimeout(() => {
            // Renderiza template HTML
            this.appContainer.innerHTML = renderFn();

            // Vincula os eventos do JavaScript
            if (typeof attachFn === 'function') {
                attachFn(this.appContainer);
            }

            // Rola para o topo suavemente
            window.scrollTo({ top: 0, behavior: 'instant' });

            // Animação de entrada
            this.appContainer.classList.remove('view-fade-out');
            this.appContainer.classList.add('view-fade-in');

            setTimeout(() => {
                this.appContainer.classList.remove('view-fade-in');
            }, 300);
        }, 150);
    }

    /**
     * Atualiza o estado visual das abas/links de navegação
     * @param {string} currentHash 
     */
    updateActiveNav(currentHash) {
        document.querySelectorAll('.nav-link').forEach(link => {
            const href = link.getAttribute('href');
            if (href === currentHash || (currentHash.startsWith('#/editar') && href === '#/pacientes')) {
                link.classList.add('active');
            } else {
                link.classList.remove('active');
            }
        });
    }
}

export const router = new Router();
