/**
 * View do Formulário de Cadastro e Edição de Paciente
 */

import { storage } from '../services/storage.js';
import { fetchAddressByCEP } from '../services/cepService.js';
import { toast } from '../utils/notifications.js';
import { attachMask, maskCPF, maskPhone, maskCEP } from '../utils/masks.js';
import { 
    isValidText, 
    isValidCPF, 
    isValidEmail, 
    isValidPhone, 
    isValidCEP, 
    validateBirthDate, 
    isValidExamDate 
} from '../utils/validators.js';

export function renderPatientForm(patientId = null) {
    const isEdit = Boolean(patientId);
    let patient = null;

    if (isEdit) {
        patient = storage.getById(patientId);
        if (!patient) {
            return `
                <div class="card p-5 text-center">
                    <h2 class="text-danger">Paciente não encontrado</h2>
                    <p class="text-muted mt-2">O registro com identificador "${patientId}" não foi localizado no sistema.</p>
                    <div class="mt-4">
                        <a href="#/pacientes" class="btn btn-primary">Voltar para a Lista de Pacientes</a>
                    </div>
                </div>
            `;
        }
    }

    const title = isEdit ? 'Edição de Cadastro de Paciente' : 'Cadastro de Paciente - Diagnóstico por Imagem';
    const subtitle = isEdit 
        ? `Atualizando informações do paciente: ${patient.fullName}`
        : 'Preencha os dados do paciente e as informações do exame de imagem';

    // Valores padrão
    const data = patient || {
        fullName: '',
        cpf: '',
        birthDate: '',
        gender: '',
        phone: '',
        email: '',
        cep: '',
        street: '',
        number: '',
        complement: '',
        neighborhood: '',
        city: '',
        state: '',
        examType: 'Ressonância Magnética',
        bodyPart: '',
        examDate: new Date().toISOString().slice(0, 10),
        examTime: '08:00',
        doctorName: '',
        doctorCrm: '',
        insurance: 'Unimed',
        hasPacemaker: 'nao',
        needsContrast: 'nao',
        hasClaustrophobia: 'nao',
        isPregnant: 'nao',
        notes: ''
    };

    return `
        <div class="view-header">
            <div>
                <a href="#/pacientes" class="back-link">&larr; Voltar para a lista</a>
                <h1 class="view-title">${title}</h1>
                <p class="view-subtitle">${subtitle}</p>
            </div>
            <div class="view-actions">
                <span class="required-indicator-text">* Campos de preenchimento obrigatório</span>
            </div>
        </div>

        <div class="form-container">
            <form id="patient-form" novalidate>
                <input type="hidden" id="patient-id" value="${data.id || ''}">

                <!-- Seção 1: Identificação Pessoal -->
                <section class="form-section card">
                    <div class="card-header section-header">
                        <div class="section-icon">👤</div>
                        <div>
                            <h2 class="card-title">1. Dados Pessoais de Identificação</h2>
                            <p class="text-xs text-muted">Informações básicas do paciente para conferência de prontuário</p>
                        </div>
                    </div>
                    <div class="card-body">
                        <div class="form-row form-row-2">
                            <div class="form-group">
                                <label for="fullName" class="form-label required">Nome Completo</label>
                                <input 
                                    type="text" 
                                    id="fullName" 
                                    name="fullName" 
                                    class="form-control" 
                                    autocomplete="name"
                                    placeholder="Ex: Ana Clara dos Santos"
                                    value="${escapeHTML(data.fullName)}"
                                    required
                                >
                                <span class="feedback-msg" id="error-fullName"></span>
                            </div>

                            <div class="form-group">
                                <label for="cpf" class="form-label required">CPF (com validação oficial)</label>
                                <input 
                                    type="text" 
                                    id="cpf" 
                                    name="cpf" 
                                    class="form-control" 
                                    placeholder="000.000.000-00"
                                    maxlength="14"
                                    value="${data.cpf}"
                                    required
                                >
                                <span class="feedback-msg" id="error-cpf"></span>
                            </div>
                        </div>

                        <div class="form-row form-row-3">
                            <div class="form-group">
                                <label for="birthDate" class="form-label required">Data de Nascimento</label>
                                <input 
                                    type="date" 
                                    id="birthDate" 
                                    name="birthDate" 
                                    class="form-control" 
                                    aria-describedby="age-hint"
                                    autocomplete="bday"
                                    value="${data.birthDate}"
                                    max="${new Date().toISOString().slice(0, 10)}"
                                    required
                                >
                                <div class="field-hint" id="age-hint">Idade: --</div>
                                <span class="feedback-msg" id="error-birthDate"></span>
                            </div>

                            <div class="form-group">
                                <label for="gender" class="form-label required">Sexo Biológico</label>
                                <select id="gender" name="gender" class="form-control" required>
                                    <option value="" disabled ${!data.gender ? 'selected' : ''}>Selecione...</option>
                                    <option value="M" ${data.gender === 'M' ? 'selected' : ''}>Masculino</option>
                                    <option value="F" ${data.gender === 'F' ? 'selected' : ''}>Feminino</option>
                                    <option value="O" ${data.gender === 'O' ? 'selected' : ''}>Outro / Não Informar</option>
                                </select>
                                <span class="feedback-msg" id="error-gender"></span>
                            </div>

                            <div class="form-group">
                                <label for="phone" class="form-label required">Telefone / WhatsApp</label>
                                <input 
                                    type="tel" 
                                    id="phone" 
                                    name="phone" 
                                    class="form-control" 
                                    autocomplete="tel"
                                    placeholder="(00) 00000-0000"
                                    maxlength="15"
                                    value="${data.phone}"
                                    required
                                >
                                <span class="feedback-msg" id="error-phone"></span>
                            </div>
                        </div>

                        <div class="form-row">
                            <div class="form-group">
                                <label for="email" class="form-label required">E-mail para Envio do Laudo</label>
                                <input 
                                    type="email" 
                                    id="email" 
                                    name="email" 
                                    class="form-control" 
                                    autocomplete="email"
                                    placeholder="paciente@exemplo.com.br"
                                    value="${escapeHTML(data.email)}"
                                    required
                                >
                                <span class="feedback-msg" id="error-email"></span>
                            </div>
                        </div>
                    </div>
                </section>

                <!-- Seção 2: Endereço Residencial com Integração ViaCEP -->
                <section class="form-section card mt-4">
                    <div class="card-header section-header">
                        <div class="section-icon">📍</div>
                        <div>
                            <h2 class="card-title">2. Endereço Residencial</h2>
                            <p class="text-xs text-muted">Digite o CEP para preenchimento automático das informações de endereço</p>
                        </div>
                    </div>
                    <div class="card-body">
                        <div class="form-row form-row-cep">
                            <div class="form-group cep-input-group">
                                <label for="cep" class="form-label required">CEP</label>
                                <div class="input-with-button">
                                    <input 
                                        type="text" 
                                        id="cep" 
                                        name="cep" 
                                        class="form-control" 
                                        autocomplete="postal-code"
                                        placeholder="00000-000" 
                                        maxlength="9"
                                        value="${data.cep}"
                                        required
                                    >
                                    <button type="button" id="btn-search-cep" class="btn btn-outline" title="Consultar CEP">
                                        🔍 Buscar
                                    </button>
                                </div>
                                <div id="cep-loader" class="field-hint hidden">Buscando endereço nos Correios...</div>
                                <span class="feedback-msg" id="error-cep"></span>
                            </div>

                            <div class="form-group street-group">
                                <label for="street" class="form-label required">Logradouro / Rua</label>
                                <input 
                                    type="text" 
                                    id="street" 
                                    name="street" 
                                    class="form-control" 
                                    autocomplete="address-line1"
                                    placeholder="Ex: Rua das Flores"
                                    value="${escapeHTML(data.street)}"
                                    required
                                >
                                <span class="feedback-msg" id="error-street"></span>
                            </div>

                            <div class="form-group number-group">
                                <label for="number" class="form-label required">Número</label>
                                <input 
                                    type="text" 
                                    id="number" 
                                    name="number" 
                                    class="form-control" 
                                    placeholder="123"
                                    value="${escapeHTML(data.number)}"
                                    required
                                >
                                <span class="feedback-msg" id="error-number"></span>
                            </div>
                        </div>

                        <div class="form-row form-row-3">
                            <div class="form-group">
                                <label for="complement" class="form-label">Complemento</label>
                                <input 
                                    type="text" 
                                    id="complement" 
                                    name="complement" 
                                    class="form-control" 
                                    autocomplete="address-line2"
                                    placeholder="Apto 101, Bloco 2"
                                    value="${escapeHTML(data.complement)}"
                                >
                            </div>

                            <div class="form-group">
                                <label for="neighborhood" class="form-label required">Bairro</label>
                                <input 
                                    type="text" 
                                    id="neighborhood" 
                                    name="neighborhood" 
                                    class="form-control" 
                                    autocomplete="address-level3"
                                    placeholder="Centro"
                                    value="${escapeHTML(data.neighborhood)}"
                                    required
                                >
                                <span class="feedback-msg" id="error-neighborhood"></span>
                            </div>

                            <div class="form-group form-city-state">
                                <div>
                                    <label for="city" class="form-label required">Cidade</label>
                                    <input 
                                        type="text" 
                                        id="city" 
                                        name="city" 
                                        class="form-control" 
                                        autocomplete="address-level2"
                                        placeholder="São Paulo"
                                        value="${escapeHTML(data.city)}"
                                        required
                                    >
                                    <span class="feedback-msg" id="error-city"></span>
                                </div>
                                <div style="max-width: 90px;">
                                    <label for="state" class="form-label required">UF</label>
                                    <input 
                                        type="text" 
                                        id="state" 
                                        name="state" 
                                        class="form-control text-uppercase" 
                                        autocomplete="address-level1"
                                        placeholder="SP"
                                        maxlength="2"
                                        value="${escapeHTML(data.state)}"
                                        required
                                    >
                                    <span class="feedback-msg" id="error-state"></span>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                <!-- Seção 3: Dados do Exame de Imagem -->
                <section class="form-section card mt-4">
                    <div class="card-header section-header">
                        <div class="section-icon">🩻</div>
                        <div>
                            <h2 class="card-title">3. Agendamento e Detalhes do Exame</h2>
                            <p class="text-xs text-muted">Modalidade diagnóstica, região anatômica e dados do médico prescritor</p>
                        </div>
                    </div>
                    <div class="card-body">
                        <div class="form-row form-row-2">
                            <div class="form-group">
                                <label for="examType" class="form-label required">Modalidade do Exame</label>
                                <select id="examType" name="examType" class="form-control" required>
                                    <option value="Ressonância Magnética" ${data.examType === 'Ressonância Magnética' ? 'selected' : ''}>Ressonância Magnética (RM)</option>
                                    <option value="Tomografia Computadorizada" ${data.examType === 'Tomografia Computadorizada' ? 'selected' : ''}>Tomografia Computadorizada (TC)</option>
                                    <option value="Ultrassonografia" ${data.examType === 'Ultrassonografia' ? 'selected' : ''}>Ultrassonografia (USG)</option>
                                    <option value="Radiografia (Raio-X)" ${data.examType === 'Radiografia (Raio-X)' ? 'selected' : ''}>Radiografia Digital (Raio-X)</option>
                                    <option value="Mamografia Digital" ${data.examType === 'Mamografia Digital' ? 'selected' : ''}>Mamografia Digital</option>
                                    <option value="Densitometria Óssea" ${data.examType === 'Densitometria Óssea' ? 'selected' : ''}>Densitometria Óssea</option>
                                </select>
                                <span class="feedback-msg" id="error-examType"></span>
                            </div>

                            <div class="form-group">
                                <label for="bodyPart" class="form-label required">Região Anatômica de Estudo</label>
                                <input 
                                    type="text" 
                                    id="bodyPart" 
                                    name="bodyPart" 
                                    class="form-control" 
                                    placeholder="Ex: Coluna Lombar, Joelho Direito, Abdome Superior"
                                    value="${escapeHTML(data.bodyPart)}"
                                    required
                                >
                                <span class="feedback-msg" id="error-bodyPart"></span>
                            </div>
                        </div>

                        <div class="form-row form-row-3">
                            <div class="form-group">
                                <label for="examDate" class="form-label required">Data Agendada</label>
                                <input 
                                    type="date" 
                                    id="examDate" 
                                    name="examDate" 
                                    class="form-control" 
                                    value="${data.examDate}"
                                    required
                                >
                                <span class="feedback-msg" id="error-examDate"></span>
                            </div>

                            <div class="form-group">
                                <label for="examTime" class="form-label required">Horário Previsto</label>
                                <input 
                                    type="time" 
                                    id="examTime" 
                                    name="examTime" 
                                    class="form-control" 
                                    value="${data.examTime}"
                                    required
                                >
                                <span class="feedback-msg" id="error-examTime"></span>
                            </div>

                            <div class="form-group">
                                <label for="insurance" class="form-label required">Convênio / Pagamento</label>
                                <select id="insurance" name="insurance" class="form-control" required>
                                    <option value="Particular" ${data.insurance === 'Particular' ? 'selected' : ''}>Particular</option>
                                    <option value="Unimed" ${data.insurance === 'Unimed' ? 'selected' : ''}>Unimed</option>
                                    <option value="Bradesco Saúde" ${data.insurance === 'Bradesco Saúde' ? 'selected' : ''}>Bradesco Saúde</option>
                                    <option value="Amil" ${data.insurance === 'Amil' ? 'selected' : ''}>Amil</option>
                                    <option value="SulAmérica" ${data.insurance === 'SulAmérica' ? 'selected' : ''}>SulAmérica</option>
                                    <option value="Porto Seguro Saúde" ${data.insurance === 'Porto Seguro Saúde' ? 'selected' : ''}>Porto Seguro Saúde</option>
                                    <option value="SUS / Regulação" ${data.insurance === 'SUS / Regulação' ? 'selected' : ''}>SUS / Regulação Municipal</option>
                                </select>
                            </div>
                        </div>

                        <div class="form-row form-row-2">
                            <div class="form-group">
                                <label for="doctorName" class="form-label required">Médico Solicitante</label>
                                <input 
                                    type="text" 
                                    id="doctorName" 
                                    name="doctorName" 
                                    class="form-control" 
                                    placeholder="Ex: Dr. Marcelo Ribeiro"
                                    value="${escapeHTML(data.doctorName)}"
                                    required
                                >
                                <span class="feedback-msg" id="error-doctorName"></span>
                            </div>

                            <div class="form-group">
                                <label for="doctorCrm" class="form-label required">CRM do Médico Solicitante</label>
                                <input 
                                    type="text" 
                                    id="doctorCrm" 
                                    name="doctorCrm" 
                                    class="form-control" 
                                    placeholder="Ex: 123456-SP"
                                    value="${escapeHTML(data.doctorCrm)}"
                                    required
                                >
                                <span class="feedback-msg" id="error-doctorCrm"></span>
                            </div>
                        </div>
                    </div>
                </section>

                <!-- Seção 4: Triagem Clínica e Segurança em Diagnóstico por Imagem -->
                <section class="form-section card mt-4 border-highlight">
                    <div class="card-header section-header">
                        <div class="section-icon">🛡️</div>
                        <div>
                            <h2 class="card-title">4. Questionário de Triagem e Segurança do Paciente</h2>
                            <p class="text-xs text-muted">Essencial para proteção radiológica e segurança em campos magnéticos de alto campo</p>
                        </div>
                    </div>
                    <div class="card-body">
                        <div class="screening-grid">
                            <fieldset class="screening-box">
                                <legend class="screening-question">
                                    <strong>Marcapasso ou Próteses Metálicas?</strong>
                                    <span class="text-xs text-muted">Risco crítico para campos de Ressonância Magnética</span>
                                </legend>
                                <div class="radio-toggle-group">
                                    <label class="radio-chip">
                                        <input type="radio" name="hasPacemaker" value="nao" ${data.hasPacemaker !== 'sim' ? 'checked' : ''}>
                                        <span>Não</span>
                                    </label>
                                    <label class="radio-chip danger">
                                        <input type="radio" name="hasPacemaker" value="sim" ${data.hasPacemaker === 'sim' ? 'checked' : ''}>
                                        <span>SIM ⚠️</span>
                                    </label>
                                </div>
                            </fieldset>

                            <fieldset class="screening-box">
                                <legend class="screening-question">
                                    <strong>Necessidade de Meio de Contraste?</strong>
                                    <span class="text-xs text-muted">Iodo (TC) ou Gadolínio (RM)</span>
                                </legend>
                                <div class="radio-toggle-group">
                                    <label class="radio-chip">
                                        <input type="radio" name="needsContrast" value="nao" ${data.needsContrast !== 'sim' ? 'checked' : ''}>
                                        <span>Não</span>
                                    </label>
                                    <label class="radio-chip warning">
                                        <input type="radio" name="needsContrast" value="sim" ${data.needsContrast === 'sim' ? 'checked' : ''}>
                                        <span>SIM</span>
                                    </label>
                                </div>
                            </fieldset>

                            <fieldset class="screening-box">
                                <legend class="screening-question">
                                    <strong>Histórico de Claustrofobia?</strong>
                                    <span class="text-xs text-muted">Para suporte de equipe e acomodação</span>
                                </legend>
                                <div class="radio-toggle-group">
                                    <label class="radio-chip">
                                        <input type="radio" name="hasClaustrophobia" value="nao" ${data.hasClaustrophobia !== 'sim' ? 'checked' : ''}>
                                        <span>Não</span>
                                    </label>
                                    <label class="radio-chip info">
                                        <input type="radio" name="hasClaustrophobia" value="sim" ${data.hasClaustrophobia === 'sim' ? 'checked' : ''}>
                                        <span>SIM</span>
                                    </label>
                                </div>
                            </fieldset>

                            <fieldset class="screening-box">
                                <legend class="screening-question">
                                    <strong>Suspeita ou Confirmação de Gravidez?</strong>
                                    <span class="text-xs text-muted">Contraindicação para radiação ionizante</span>
                                </legend>
                                <div class="radio-toggle-group">
                                    <label class="radio-chip">
                                        <input type="radio" name="isPregnant" value="nao" ${data.isPregnant !== 'sim' ? 'checked' : ''}>
                                        <span>Não / N.A.</span>
                                    </label>
                                    <label class="radio-chip danger">
                                        <input type="radio" name="isPregnant" value="sim" ${data.isPregnant === 'sim' ? 'checked' : ''}>
                                        <span>SIM ⚠️</span>
                                    </label>
                                </div>
                            </fieldset>
                        </div>

                        <div class="form-group mt-4">
                            <label for="notes" class="form-label">Observações Clínicas Adicionais / Alergias Conhecidas</label>
                            <textarea 
                                id="notes" 
                                name="notes" 
                                class="form-control" 
                                rows="3" 
                                placeholder="Relate histórico de alergias medicamentosas, cirurgias prévias no local examinado, insuficiência renal conhecida ou necessidades especiais de locomoção..."
                            >${escapeHTML(data.notes)}</textarea>
                        </div>
                    </div>
                </section>

                <!-- Barra de Ações do Formulário -->
                <div class="form-actions-bar card mt-4">
                    <a href="#/pacientes" class="btn btn-secondary">
                        Cancelar
                    </a>
                    <div class="form-actions-right">
                        <button type="reset" class="btn btn-outline" id="btn-reset-form">
                            Limpar Campos
                        </button>
                        <button type="submit" class="btn btn-primary btn-submit" id="btn-submit-form">
                            <span class="btn-spinner hidden" id="submit-spinner"></span>
                            <span class="btn-text">${isEdit ? 'Salvar Alterações' : 'Concluir Cadastro'}</span>
                        </button>
                    </div>
                </div>
            </form>
        </div>
    `;
}

/**
 * Registra todos os manipuladores de eventos e validações em tempo real
 * @param {HTMLElement} container 
 * @param {string|null} patientId 
 */
export function attachPatientFormEvents(container, patientId = null) {
    const form = container.querySelector('#patient-form');
    if (!form) return;

    form.querySelectorAll('.feedback-msg').forEach(feedback => {
        feedback.setAttribute('role', 'status');
        feedback.setAttribute('aria-live', 'polite');
    });

    const isEdit = Boolean(patientId);

    // Inputs
    const fullNameInput = form.querySelector('#fullName');
    const cpfInput = form.querySelector('#cpf');
    const birthDateInput = form.querySelector('#birthDate');
    const genderInput = form.querySelector('#gender');
    const phoneInput = form.querySelector('#phone');
    const emailInput = form.querySelector('#email');
    const cepInput = form.querySelector('#cep');
    const streetInput = form.querySelector('#street');
    const numberInput = form.querySelector('#number');
    const neighborhoodInput = form.querySelector('#neighborhood');
    const cityInput = form.querySelector('#city');
    const stateInput = form.querySelector('#state');
    const bodyPartInput = form.querySelector('#bodyPart');
    const examDateInput = form.querySelector('#examDate');
    const examTimeInput = form.querySelector('#examTime');
    const doctorNameInput = form.querySelector('#doctorName');
    const doctorCrmInput = form.querySelector('#doctorCrm');
    const ageHint = form.querySelector('#age-hint');

    // Aplicação de máscaras dinâmicas
    attachMask(cpfInput, maskCPF);
    attachMask(phoneInput, maskPhone);
    attachMask(cepInput, maskCEP);

    // Atualiza idade imediatamente se data já existir
    if (birthDateInput.value) {
        updateAgeDisplay(birthDateInput.value);
    }

    // Listener para data de nascimento
    birthDateInput.addEventListener('change', () => {
        validateField(birthDateInput, () => {
            const res = validateBirthDate(birthDateInput.value);
            if (!res.valid) return res.message;
            updateAgeDisplay(birthDateInput.value);
            return null;
        });
    });

    function updateAgeDisplay(val) {
        const res = validateBirthDate(val);
        if (res.valid && res.age !== undefined) {
            ageHint.textContent = `Idade calculada: ${res.age} ano(s)`;
            ageHint.classList.add('text-success');
        } else {
            ageHint.textContent = 'Idade: --';
            ageHint.classList.remove('text-success');
        }
    }

    // Validações em tempo real por campo (blur e input)
    setupFieldValidation(fullNameInput, () => {
        if (!isValidText(fullNameInput.value, 3)) {
            return 'Informe o nome completo (mínimo de 3 caracteres).';
        }
        return null;
    });

    setupFieldValidation(cpfInput, () => {
        if (!cpfInput.value) return 'O CPF é obrigatório.';
        if (!isValidCPF(cpfInput.value)) {
            return 'CPF inválido. Verifique os dígitos verificadores.';
        }
        return null;
    });

    setupFieldValidation(phoneInput, () => {
        if (!phoneInput.value) return 'O telefone é obrigatório.';
        if (!isValidPhone(phoneInput.value)) {
            return 'Telefone incompleto ou formato inválido.';
        }
        return null;
    });

    setupFieldValidation(emailInput, () => {
        if (!emailInput.value) return 'O e-mail é obrigatório.';
        if (!isValidEmail(emailInput.value)) {
            return 'Formato de e-mail inválido (ex: nome@dominio.com).';
        }
        return null;
    });

    setupFieldValidation(genderInput, () => {
        if (!genderInput.value) return 'Selecione o sexo biológico.';
        return null;
    });

    setupFieldValidation(streetInput, () => {
        if (!isValidText(streetInput.value, 2)) return 'Informe o logradouro.';
        return null;
    });

    setupFieldValidation(numberInput, () => {
        if (!isValidText(numberInput.value, 1)) return 'Informe o número do endereço.';
        return null;
    });

    setupFieldValidation(neighborhoodInput, () => {
        if (!isValidText(neighborhoodInput.value, 2)) return 'Informe o bairro.';
        return null;
    });

    setupFieldValidation(cityInput, () => {
        if (!isValidText(cityInput.value, 2)) return 'Informe a cidade.';
        return null;
    });

    setupFieldValidation(stateInput, () => {
        if (!stateInput.value || stateInput.value.length !== 2) return 'Informe o estado (UF com 2 letras).';
        return null;
    });

    setupFieldValidation(bodyPartInput, () => {
        if (!isValidText(bodyPartInput.value, 2)) return 'Especifique a região anatômica do exame.';
        return null;
    });

    setupFieldValidation(examDateInput, () => {
        if (!isValidExamDate(examDateInput.value)) return 'Selecione uma data válida para o exame.';
        return null;
    });

    setupFieldValidation(examTimeInput, () => {
        if (!examTimeInput.value) return 'Selecione o horário previsto.';
        return null;
    });

    setupFieldValidation(doctorNameInput, () => {
        if (!isValidText(doctorNameInput.value, 3)) return 'Informe o nome do médico solicitante.';
        return null;
    });

    setupFieldValidation(doctorCrmInput, () => {
        if (!isValidText(doctorCrmInput.value, 4)) return 'Informe o CRM com UF do médico (ex: 123456-SP).';
        return null;
    });

    // Manipulação do CEP com ViaCEP
    const btnSearchCep = form.querySelector('#btn-search-cep');
    const cepLoader = form.querySelector('#cep-loader');

    const handleCepSearch = async () => {
        const rawCep = cepInput.value.replace(/\D/g, '');
        if (rawCep.length !== 8) {
            setFieldInvalid(cepInput, 'CEP deve conter 8 números.');
            return;
        }

        setFieldValid(cepInput);
        cepLoader.classList.remove('hidden');

        try {
            const data = await fetchAddressByCEP(rawCep);
            if (data.street) {
                streetInput.value = data.street;
                setFieldValid(streetInput);
            }
            if (data.neighborhood) {
                neighborhoodInput.value = data.neighborhood;
                setFieldValid(neighborhoodInput);
            }
            if (data.city) {
                cityInput.value = data.city;
                setFieldValid(cityInput);
            }
            if (data.state) {
                stateInput.value = data.state;
                setFieldValid(stateInput);
            }
            numberInput.focus();
            toast.info(`Endereço localizado: ${data.city} / ${data.state}`);
        } catch (err) {
            setFieldInvalid(cepInput, err.message || 'Falha ao buscar CEP.');
            toast.warning(err.message || 'Não foi possível preencher o CEP automaticamente.');
        } finally {
            cepLoader.classList.add('hidden');
        }
    };

    if (btnSearchCep) {
        btnSearchCep.addEventListener('click', handleCepSearch);
    }

    cepInput.addEventListener('blur', () => {
        const raw = cepInput.value.replace(/\D/g, '');
        if (raw.length === 8) {
            handleCepSearch();
        } else if (raw.length > 0) {
            setFieldInvalid(cepInput, 'CEP incompleto.');
        }
    });

    // Reset do formulário
    const btnReset = form.querySelector('#btn-reset-form');
    if (btnReset) {
        btnReset.addEventListener('click', (e) => {
            e.preventDefault();
            form.reset();
            form.querySelectorAll('.is-invalid, .is-valid').forEach(el => {
                el.classList.remove('is-invalid', 'is-valid');
                el.removeAttribute('aria-invalid');
                const feedback = el.closest('.form-group')?.querySelector('.feedback-msg');
                const describedBy = (el.getAttribute('aria-describedby') || '').split(/\s+/).filter(id => id && id !== feedback?.id);
                if (describedBy.length) {
                    el.setAttribute('aria-describedby', describedBy.join(' '));
                } else {
                    el.removeAttribute('aria-describedby');
                }
            });
            form.querySelectorAll('.feedback-msg').forEach(el => el.textContent = '');
            ageHint.textContent = 'Idade: --';
            ageHint.classList.remove('text-success');
            toast.info('Formulário limpo.');
        });
    }

    // Submissão do formulário
    form.addEventListener('submit', (e) => {
        e.preventDefault();

        // Roda validação em todos os campos
        let hasErrors = false;
        let firstInvalidElement = null;

        function checkField(input, validateFn) {
            const error = validateFn();
            if (error) {
                setFieldInvalid(input, error);
                hasErrors = true;
                if (!firstInvalidElement) firstInvalidElement = input;
            } else {
                setFieldValid(input);
            }
        }

        checkField(fullNameInput, () => !isValidText(fullNameInput.value, 3) ? 'Informe o nome completo.' : null);
        checkField(cpfInput, () => !isValidCPF(cpfInput.value) ? 'CPF inválido.' : null);
        checkField(birthDateInput, () => {
            const res = validateBirthDate(birthDateInput.value);
            return res.valid ? null : res.message;
        });
        checkField(genderInput, () => !genderInput.value ? 'Selecione o sexo biológico.' : null);
        checkField(phoneInput, () => !isValidPhone(phoneInput.value) ? 'Telefone inválido ou incompleto.' : null);
        checkField(emailInput, () => !isValidEmail(emailInput.value) ? 'E-mail inválido.' : null);
        checkField(cepInput, () => !isValidCEP(cepInput.value) ? 'CEP inválido.' : null);
        checkField(streetInput, () => !isValidText(streetInput.value, 2) ? 'Informe o logradouro.' : null);
        checkField(numberInput, () => !isValidText(numberInput.value, 1) ? 'Informe o número.' : null);
        checkField(neighborhoodInput, () => !isValidText(neighborhoodInput.value, 2) ? 'Informe o bairro.' : null);
        checkField(cityInput, () => !isValidText(cityInput.value, 2) ? 'Informe a cidade.' : null);
        checkField(stateInput, () => (!stateInput.value || stateInput.value.length !== 2) ? 'UF inválida.' : null);
        checkField(bodyPartInput, () => !isValidText(bodyPartInput.value, 2) ? 'Informe a região anatômica.' : null);
        checkField(examDateInput, () => !isValidExamDate(examDateInput.value) ? 'Data do exame inválida.' : null);
        checkField(examTimeInput, () => !examTimeInput.value ? 'Horário obrigatório.' : null);
        checkField(doctorNameInput, () => !isValidText(doctorNameInput.value, 3) ? 'Informe o médico solicitante.' : null);
        checkField(doctorCrmInput, () => !isValidText(doctorCrmInput.value, 4) ? 'Informe o CRM.' : null);

        if (hasErrors) {
            toast.error('Existem campos pendentes ou incorretos no formulário. Verifique os avisos em vermelho.');
            if (firstInvalidElement) {
                firstInvalidElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
                firstInvalidElement.focus();
            }
            return;
        }

        // Monta o objeto do paciente
        const formData = new FormData(form);
        const patientData = {
            id: isEdit ? patientId : undefined,
            fullName: formData.get('fullName').trim(),
            cpf: formData.get('cpf').trim(),
            birthDate: formData.get('birthDate'),
            gender: formData.get('gender'),
            phone: formData.get('phone').trim(),
            email: formData.get('email').trim().toLowerCase(),
            cep: formData.get('cep').trim(),
            street: formData.get('street').trim(),
            number: formData.get('number').trim(),
            complement: (formData.get('complement') || '').trim(),
            neighborhood: formData.get('neighborhood').trim(),
            city: formData.get('city').trim(),
            state: formData.get('state').trim().toUpperCase(),
            examType: formData.get('examType'),
            bodyPart: formData.get('bodyPart').trim(),
            examDate: formData.get('examDate'),
            examTime: formData.get('examTime'),
            insurance: formData.get('insurance'),
            doctorName: formData.get('doctorName').trim(),
            doctorCrm: formData.get('doctorCrm').trim().toUpperCase(),
            hasPacemaker: formData.get('hasPacemaker') || 'nao',
            needsContrast: formData.get('needsContrast') || 'nao',
            hasClaustrophobia: formData.get('hasClaustrophobia') || 'nao',
            isPregnant: formData.get('isPregnant') || 'nao',
            notes: (formData.get('notes') || '').trim()
        };

        try {
            const saved = storage.save(patientData);
            toast.success(isEdit 
                ? `Cadastro de ${saved.fullName} atualizado com sucesso!` 
                : `Paciente ${saved.fullName} cadastrado com sucesso!`
            );
            window.location.hash = '#/pacientes';
        } catch (saveError) {
            toast.error(saveError.message || 'Erro ao persistir dados do paciente.');
            if (saveError.message.includes('CPF')) {
                setFieldInvalid(cpfInput, saveError.message);
                cpfInput.scrollIntoView({ behavior: 'smooth', block: 'center' });
                cpfInput.focus();
            }
        }
    });
}

function setupFieldValidation(input, validatorFn) {
    if (!input) return;

    input.addEventListener('blur', () => {
        validateField(input, validatorFn);
    });

    input.addEventListener('input', () => {
        if (input.classList.contains('is-invalid')) {
            validateField(input, validatorFn);
        }
    });
}

function validateField(input, validatorFn) {
    const errorMsg = validatorFn();
    if (errorMsg) {
        setFieldInvalid(input, errorMsg);
    } else {
        setFieldValid(input);
    }
}

function setFieldInvalid(input, message) {
    input.classList.remove('is-valid');
    input.classList.add('is-invalid');
    input.setAttribute('aria-invalid', 'true');
    const feedback = input.closest('.form-group')?.querySelector('.feedback-msg');
    if (feedback) {
        feedback.id ||= `error-${input.id}`;
        const describedBy = new Set((input.getAttribute('aria-describedby') || '').split(/\s+/).filter(Boolean));
        describedBy.add(feedback.id);
        input.setAttribute('aria-describedby', [...describedBy].join(' '));
        feedback.textContent = message;
        feedback.className = 'feedback-msg text-danger visible';
    }
}

function setFieldValid(input) {
    input.classList.remove('is-invalid');
    input.classList.add('is-valid');
    input.setAttribute('aria-invalid', 'false');
    const feedback = input.closest('.form-group')?.querySelector('.feedback-msg');
    if (feedback) {
        const describedBy = (input.getAttribute('aria-describedby') || '').split(/\s+/).filter(id => id && id !== feedback.id);
        if (describedBy.length) {
            input.setAttribute('aria-describedby', describedBy.join(' '));
        } else {
            input.removeAttribute('aria-describedby');
        }
        feedback.textContent = '';
        feedback.className = 'feedback-msg hidden';
    }
}

function escapeHTML(str) {
    if (!str) return '';
    return str
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#039;');
}
