/**
 * Utilitários para aplicação de máscaras dinâmicas de campos de formulário
 */

/**
 * Aplica máscara de CPF: 000.000.000-00
 * @param {string} value 
 * @returns {string}
 */
export function maskCPF(value) {
    if (!value) return '';
    return value
        .replace(/\D/g, '')
        .slice(0, 11)
        .replace(/(\d{3})(\d)/, '$1.$2')
        .replace(/(\d{3})(\d)/, '$1.$2')
        .replace(/(\d{3})(\d{1,2})$/, '$1-$2');
}

/**
 * Aplica máscara de Telefone: (00) 0000-0000 ou (00) 00000-0000
 * @param {string} value 
 * @returns {string}
 */
export function maskPhone(value) {
    if (!value) return '';
    const clean = value.replace(/\D/g, '').slice(0, 11);
    if (clean.length > 10) {
        return clean.replace(/^(\d{2})(\d{5})(\d{4})$/, '($1) $2-$3');
    } else if (clean.length > 5) {
        return clean.replace(/^(\d{2})(\d{4})(\d{0,4})$/, '($1) $2-$3');
    } else if (clean.length > 2) {
        return clean.replace(/^(\d{2})(\d{0,5})/, '($1) $2');
    }
    return clean.length ? `(${clean}` : '';
}

/**
 * Aplica máscara de CEP: 00000-000
 * @param {string} value 
 * @returns {string}
 */
export function maskCEP(value) {
    if (!value) return '';
    return value
        .replace(/\D/g, '')
        .slice(0, 8)
        .replace(/(\d{5})(\d{1,3})$/, '$1-$2');
}

/**
 * Remove todos os caracteres não numéricos
 * @param {string} value 
 * @returns {string}
 */
export function unmask(value) {
    if (!value) return '';
    return value.replace(/\D/g, '');
}

/**
 * Configura escuta em inputs para formatação automática
 * @param {HTMLInputElement} input 
 * @param {Function} maskFn 
 */
export function attachMask(input, maskFn) {
    if (!input) return;
    input.addEventListener('input', (e) => {
        const cursorPos = e.target.selectionStart;
        const prevLength = e.target.value.length;
        e.target.value = maskFn(e.target.value);
        const newLength = e.target.value.length;
        
        // Ajusta cursor intuitivamente
        const diff = newLength - prevLength;
        e.target.setSelectionRange(cursorPos + diff, cursorPos + diff);
    });
}
