/**
 * Utilitário de modais dinâmicos para visualização de detalhes e confirmações
 */

class ModalManager {
    constructor() {
        this.overlay = null;
        this.previousFocus = null;
        this.init();
    }

    init() {
        if (!document.getElementById('modal-overlay')) {
            this.overlay = document.createElement('div');
            this.overlay.id = 'modal-overlay';
            this.overlay.className = 'modal-overlay hidden';
            this.overlay.innerHTML = `
                <div class="modal-card" role="dialog" aria-modal="true" aria-labelledby="modal-title" tabindex="-1">
                    <header class="modal-header">
                        <h3 class="modal-title" id="modal-title">Título</h3>
                        <button class="modal-close-btn" id="modal-close-btn" aria-label="Fechar">&times;</button>
                    </header>
                    <div class="modal-body" id="modal-body" role="region" aria-label="Conteúdo do diálogo" tabindex="0"></div>
                    <footer class="modal-footer" id="modal-footer"></footer>
                </div>
            `;
            document.body.appendChild(this.overlay);

            this.overlay.querySelector('#modal-close-btn').addEventListener('click', () => this.close());
            this.overlay.addEventListener('click', (e) => {
                if (e.target === this.overlay) this.close();
            });

            document.addEventListener('keydown', (e) => {
                if (this.overlay.classList.contains('hidden')) return;

                if (e.key === 'Escape') {
                    e.preventDefault();
                    this.close();
                    return;
                }

                if (e.key === 'Tab') {
                    this.trapFocus(e);
                }
            });
        } else {
            this.overlay = document.getElementById('modal-overlay');
        }
    }

    /**
     * Abre modal genérico com título, corpo e botões de ação
     * @param {Object} options 
     */
    open({ title, content, footerButtons = [] }) {
        if (!this.overlay) this.init();
        this.previousFocus = document.activeElement;

        const titleEl = this.overlay.querySelector('#modal-title');
        const bodyEl = this.overlay.querySelector('#modal-body');
        const footerEl = this.overlay.querySelector('#modal-footer');

        titleEl.textContent = title;
        if (typeof content === 'string') {
            bodyEl.innerHTML = content;
        } else if (content instanceof HTMLElement) {
            bodyEl.innerHTML = '';
            bodyEl.appendChild(content);
        }

        footerEl.innerHTML = '';
        if (footerButtons.length === 0) {
            const defaultClose = document.createElement('button');
            defaultClose.className = 'btn btn-secondary';
            defaultClose.textContent = 'Fechar';
            defaultClose.onclick = () => this.close();
            footerEl.appendChild(defaultClose);
        } else {
            footerButtons.forEach(btnConfig => {
                const btn = document.createElement('button');
                btn.className = `btn ${btnConfig.className || 'btn-secondary'}`;
                btn.textContent = btnConfig.text;
                btn.onclick = () => {
                    if (btnConfig.onClick) btnConfig.onClick();
                    if (btnConfig.autoClose !== false) this.close();
                };
                footerEl.appendChild(btn);
            });
        }

        this.overlay.classList.remove('hidden');
        document.body.classList.add('modal-open');
        const firstFocusable = this.getFocusableElements()[0] || this.overlay.querySelector('.modal-card');
        firstFocusable.focus();
    }

    getFocusableElements() {
        return [...this.overlay.querySelectorAll('a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])')]
            .filter(element => element.getClientRects().length > 0);
    }

    trapFocus(event) {
        const focusable = this.getFocusableElements();
        if (focusable.length === 0) {
            event.preventDefault();
            this.overlay.querySelector('.modal-card').focus();
            return;
        }

        const first = focusable[0];
        const last = focusable[focusable.length - 1];
        if (event.shiftKey && (document.activeElement === first || !this.overlay.contains(document.activeElement))) {
            event.preventDefault();
            last.focus();
        } else if (!event.shiftKey && (document.activeElement === last || !this.overlay.contains(document.activeElement))) {
            event.preventDefault();
            first.focus();
        }
    }

    /**
     * Modal de confirmação seguro
     * @param {Object} param0 
     * @returns {Promise<boolean>}
     */
    confirm({ title = 'Confirmação', message = 'Deseja realmente prosseguir?', confirmText = 'Confirmar', confirmType = 'danger' }) {
        return new Promise((resolve) => {
            this.open({
                title,
                content: `<p class="modal-confirm-text">${message}</p>`,
                footerButtons: [
                    {
                        text: 'Cancelar',
                        className: 'btn-secondary',
                        onClick: () => resolve(false)
                    },
                    {
                        text: confirmText,
                        className: confirmType === 'danger' ? 'btn-danger' : 'btn-primary',
                        onClick: () => resolve(true)
                    }
                ]
            });
        });
    }

    close() {
        if (this.overlay) {
            this.overlay.classList.add('hidden');
            document.body.classList.remove('modal-open');
            if (this.previousFocus?.isConnected) {
                this.previousFocus.focus({ preventScroll: true });
            }
            this.previousFocus = null;
        }
    }
}

export const modal = new ModalManager();
