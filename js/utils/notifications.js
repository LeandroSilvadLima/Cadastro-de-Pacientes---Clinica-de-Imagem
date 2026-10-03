/**
 * Sistema de notificações Toast não-intrusivo para feedback ao usuário
 */

class NotificationManager {
    constructor() {
        this.container = null;
        this.init();
    }

    init() {
        if (!document.getElementById('toast-container')) {
            this.container = document.createElement('div');
            this.container.id = 'toast-container';
            this.container.className = 'toast-container';
            this.container.setAttribute('aria-live', 'polite');
            this.container.setAttribute('aria-relevant', 'additions');
            document.body.appendChild(this.container);
        } else {
            this.container = document.getElementById('toast-container');
        }
    }

    /**
     * Exibe um toast estilizado
     * @param {string} message - Texto da notificação
     * @param {'success'|'error'|'warning'|'info'} type - Tipo da notificação
     * @param {number} duration - Duração em milissegundos
     */
    show(message, type = 'info', duration = 4000) {
        if (!this.container) this.init();

        const toast = document.createElement('div');
        toast.className = `toast toast-${type}`;
        toast.setAttribute('role', type === 'error' ? 'alert' : 'status');
        toast.setAttribute('aria-live', type === 'error' ? 'assertive' : 'polite');

        const icons = {
            success: '✓',
            error: '✕',
            warning: '⚠',
            info: 'ℹ'
        };

        toast.innerHTML = `
            <span class="toast-icon">${icons[type] || 'ℹ'}</span>
                        <span class="toast-icon" aria-hidden="true">${icons[type] || 'ℹ'}</span>
            <div class="toast-content">
                <span class="toast-message">${message}</span>
            </div>
            <button class="toast-close" aria-label="Fechar notificação">&times;</button>
            <div class="toast-progress" style="animation-duration: ${duration}ms;"></div>
        `;

        this.container.appendChild(toast);

        // Força reflow para animação de entrada suave
        setTimeout(() => toast.classList.add('toast-visible'), 10);

        const closeBtn = toast.querySelector('.toast-close');
        let removeTimeout = null;

        const removeToast = () => {
            if (removeTimeout) clearTimeout(removeTimeout);
            toast.classList.remove('toast-visible');
            toast.classList.add('toast-hiding');
            setTimeout(() => {
                if (toast.parentNode) {
                    toast.parentNode.removeChild(toast);
                }
            }, 300);
        };

        closeBtn.addEventListener('click', removeToast);
        removeTimeout = setTimeout(removeToast, duration);
    }

    success(msg, duration) { this.show(msg, 'success', duration); }
    error(msg, duration) { this.show(msg, 'error', duration); }
    warning(msg, duration) { this.show(msg, 'warning', duration); }
    info(msg, duration) { this.show(msg, 'info', duration); }
}

export const toast = new NotificationManager();
