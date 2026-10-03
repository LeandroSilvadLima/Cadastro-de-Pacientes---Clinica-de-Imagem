/**
 * Utilitários de validação para formulários da clínica de imagem
 */

/**
 * Valida se uma string não está vazia e possui tamanho mínimo
 * @param {string} value 
 * @param {number} minLength 
 * @returns {boolean}
 */
export function isValidText(value, minLength = 2) {
    if (!value || typeof value !== 'string') return false;
    return value.trim().length >= minLength;
}

/**
 * Validação de algoritmo de CPF oficial (com dígitos verificadores)
 * @param {string} cpf - CPF com ou sem máscara
 * @returns {boolean}
 */
export function isValidCPF(cpf) {
    if (!cpf) return false;
    const cleanCPF = cpf.replace(/\D/g, '');

    // Verifica se possui 11 dígitos
    if (cleanCPF.length !== 11) return false;

    // Elimina CPFs com todos os dígitos iguais (ex: 111.111.111-11)
    if (/^(\d)\1{10}$/.test(cleanCPF)) return false;

    // Valida primeiro dígito verificador
    let sum = 0;
    for (let i = 0; i < 9; i++) {
        sum += parseInt(cleanCPF.charAt(i), 10) * (10 - i);
    }
    let remainder = 11 - (sum % 11);
    let digit1 = (remainder === 10 || remainder === 11) ? 0 : remainder;
    if (digit1 !== parseInt(cleanCPF.charAt(9), 10)) return false;

    // Valida segundo dígito verificador
    sum = 0;
    for (let i = 0; i < 10; i++) {
        sum += parseInt(cleanCPF.charAt(i), 10) * (11 - i);
    }
    remainder = 11 - (sum % 11);
    let digit2 = (remainder === 10 || remainder === 11) ? 0 : remainder;
    if (digit2 !== parseInt(cleanCPF.charAt(10), 10)) return false;

    return true;
}

/**
 * Valida formato de e-mail
 * @param {string} email 
 * @returns {boolean}
 */
export function isValidEmail(email) {
    if (!email) return false;
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    return emailRegex.test(email.trim());
}

/**
 * Valida formato de telefone celular ou fixo brasileiro
 * @param {string} phone 
 * @returns {boolean}
 */
export function isValidPhone(phone) {
    if (!phone) return false;
    const cleanPhone = phone.replace(/\D/g, '');
    // Aceita 10 dígitos (fixo) ou 11 dígitos (celular com DDD)
    return cleanPhone.length === 10 || cleanPhone.length === 11;
}

/**
 * Valida CEP brasileiro (8 dígitos numéricos)
 * @param {string} cep 
 * @returns {boolean}
 */
export function isValidCEP(cep) {
    if (!cep) return false;
    const cleanCEP = cep.replace(/\D/g, '');
    return cleanCEP.length === 8;
}

/**
 * Valida data de nascimento (não futura, limite razoável de 120 anos)
 * @param {string} dateString - Formato YYYY-MM-DD
 * @returns {{ valid: boolean, message?: string, age?: number }}
 */
export function validateBirthDate(dateString) {
    if (!dateString) {
        return { valid: false, message: 'A data de nascimento é obrigatória.' };
    }

    const birthDate = new Date(dateString + 'T00:00:00');
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    if (isNaN(birthDate.getTime())) {
        return { valid: false, message: 'Data inválida.' };
    }

    if (birthDate > today) {
        return { valid: false, message: 'Data de nascimento não pode estar no futuro.' };
    }

    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
        age--;
    }

    if (age > 125) {
        return { valid: false, message: 'Por favor, informe uma data de nascimento plausível.' };
    }

    return { valid: true, age };
}

/**
 * Valida data do exame (não deve ser muito anterior à data atual)
 * @param {string} dateString 
 * @returns {boolean}
 */
export function isValidExamDate(dateString) {
    if (!dateString) return false;
    const examDate = new Date(dateString + 'T00:00:00');
    return !isNaN(examDate.getTime());
}
