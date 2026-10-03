/**
 * View da Listagem Completa de Pacientes com Busca, Filtros e Ações
 */

import { storage } from '../services/storage.js';
import { modal } from '../utils/modal.js';
import { toast } from '../utils/notifications.js';
import { showPatientModal } from './dashboardView.js';

export function renderPatientList() {
    const patients = storage.getAll();

    return `
        <div class="view-header">
            <div>
                <h1 class="view-title">Gestão de Pacientes</h1>
                <p class="view-subtitle">Consulte, filtre e gerencie os agendamentos e prontuários de exames</p>
            </div>
            <div class="view-actions">
                <a href="#/cadastro" class="btn btn-primary">
                    <span class="btn-icon">✚</span> Novo Cadastro
                </a>
            </div>
        </div>

        <!-- Filtros e Barra de Pesquisa -->
        <div class="card p-3 mb-4">
            <div class="filter-toolbar">
                <div class="search-input-wrapper">
                    <span class="search-icon">🔍</span>
                    <input 
                        type="text" 
                        id="search-input" 
                        class="form-control search-input" 
                        placeholder="Buscar por nome, CPF, médico ou região anatômica..."
                    >
                </div>

                <div class="filter-controls">
                    <div class="filter-group">
                        <label for="filter-modality" class="filter-label">Modalidade:</label>
                        <select id="filter-modality" class="form-control form-control-sm">
                            <option value="">Todas as modalidades</option>
                            <option value="Ressonância Magnética">Ressonância Magnética</option>
                            <option value="Tomografia Computadorizada">Tomografia Computadorizada</option>
                            <option value="Ultrassonografia">Ultrassonografia</option>
                            <option value="Radiografia (Raio-X)">Radiografia (Raio-X)</option>
                            <option value="Mamografia Digital">Mamografia Digital</option>
                            <option value="Densitometria Óssea">Densitometria Óssea</option>
                        </select>
                    </div>

                    <div class="filter-group">
                        <label for="filter-risk" class="filter-label">Triagem de Risco:</label>
                        <select id="filter-risk" class="form-control form-control-sm">
                            <option value="">Todos</option>
                            <option value="pacemaker">Marcapasso / Prótese</option>
                            <option value="contrast">Uso de Contraste</option>
                            <option value="claustro">Claustrofobia</option>
                            <option value="pregnant">Gestante</option>
                        </select>
                    </div>

                    <button id="btn-clear-filters" class="btn btn-sm btn-outline" title="Limpar Filtros">
                        Limpar
                    </button>
                </div>
            </div>

            <div class="list-meta-info mt-2">
                <span id="results-count" class="text-sm text-muted">
                    Exibindo <strong>${patients.length}</strong> paciente(s)
                </span>
            </div>
        </div>

        <!-- Tabela de Pacientes -->
        <div class="card">
            <div class="card-body p-0">
                <div class="table-responsive">
                    <table class="data-table" id="patients-table">
                        <thead>
                            <tr>
                                <th>Paciente / Identificação</th>
                                <th>Contato</th>
                                <th>Exame / Convênio</th>
                                <th>Data Agendada</th>
                                <th>Triagem de Risco</th>
                                <th class="text-right">Ações</th>
                            </tr>
                        </thead>
                        <tbody id="patients-tbody">
                            <!-- Inserido dinamicamente via renderTableRows -->
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    `;
}

/**
 * Registra os eventos da View de Listagem
 * @param {HTMLElement} container 
 */
export function attachPatientListEvents(container) {
    const searchInput = container.querySelector('#search-input');
    const modalityFilter = container.querySelector('#filter-modality');
    const riskFilter = container.querySelector('#filter-risk');
    const clearBtn = container.querySelector('#btn-clear-filters');
    const tbody = container.querySelector('#patients-tbody');
    const resultsCount = container.querySelector('#results-count');

    function updateList() {
        const patients = storage.getAll();
        const query = (searchInput.value || '').trim().toLowerCase();
        const selectedModality = modalityFilter.value;
        const selectedRisk = riskFilter.value;

        const filtered = patients.filter(p => {
            // Filtro de texto
            if (query) {
                const nameMatch = (p.fullName || '').toLowerCase().includes(query);
                const cpfMatch = (p.cpf || '').replace(/\D/g, '').includes(query.replace(/\D/g, ''));
                const doctorMatch = (p.doctorName || '').toLowerCase().includes(query);
                const partMatch = (p.bodyPart || '').toLowerCase().includes(query);
                if (!nameMatch && !cpfMatch && !doctorMatch && !partMatch) return false;
            }

            // Filtro de modalidade
            if (selectedModality && p.examType !== selectedModality) {
                return false;
            }

            // Filtro de risco
            if (selectedRisk === 'pacemaker' && p.hasPacemaker !== 'sim') return false;
            if (selectedRisk === 'contrast' && p.needsContrast !== 'sim') return false;
            if (selectedRisk === 'claustro' && p.hasClaustrophobia !== 'sim') return false;
            if (selectedRisk === 'pregnant' && p.isPregnant !== 'sim') return false;

            return true;
        });

        // Renderiza linhas
        renderRows(filtered, tbody);
        resultsCount.innerHTML = `Exibindo <strong>${filtered.length}</strong> de <strong>${patients.length}</strong> paciente(s)`;
    }

    function renderRows(list, targetElement) {
        if (!list || list.length === 0) {
            targetElement.innerHTML = `
                <tr>
                    <td colspan="6" class="text-center py-5">
                        <div class="empty-state">
                            <span class="empty-state-icon">📋</span>
                            <h4>Nenhum paciente encontrado</h4>
                            <p class="text-muted text-sm mt-1">Ajuste os filtros de busca ou realize um novo cadastro.</p>
                            <a href="#/cadastro" class="btn btn-sm btn-primary mt-3">Cadastrar Novo Paciente</a>
                        </div>
                    </td>
                </tr>
            `;
            return;
        }

        targetElement.innerHTML = list.map(p => `
            <tr data-patient-id="${p.id}">
                <td>
                    <div class="patient-cell-name">
                        <span class="font-medium text-dark">${escapeHTML(p.fullName)}</span>
                        <div class="text-xs text-muted">
                            <span>CPF: ${p.cpf}</span> &bull; 
                            <span>${calculateAge(p.birthDate)} anos</span>
                        </div>
                    </div>
                </td>
                <td>
                    <div class="text-sm">${p.phone}</div>
                    <div class="text-xs text-muted">${escapeHTML(p.email)}</div>
                </td>
                <td>
                    <span class="badge badge-primary">${p.examType}</span>
                    <div class="text-xs font-semibold mt-1">${escapeHTML(p.bodyPart || 'Região Geral')}</div>
                    <div class="text-xs text-muted">${escapeHTML(p.insurance || 'Particular')}</div>
                </td>
                <td>
                    <div class="schedule-cell">
                        <span>📅 ${formatDate(p.examDate)}</span>
                        <span class="text-muted text-xs">⏰ ${p.examTime || '--:--'}</span>
                    </div>
                </td>
                <td>
                    <div class="alerts-cell">
                        ${p.hasPacemaker === 'sim' ? '<span class="badge badge-danger">⚡ Marcapasso</span>' : ''}
                        ${p.needsContrast === 'sim' ? '<span class="badge badge-warning">🧪 Contraste</span>' : ''}
                        ${p.hasClaustrophobia === 'sim' ? '<span class="badge badge-info">🛡 Claustrofobia</span>' : ''}
                        ${p.isPregnant === 'sim' ? '<span class="badge badge-danger">⚠️ Gestante</span>' : ''}
                        ${p.hasPacemaker !== 'sim' && p.needsContrast !== 'sim' && p.hasClaustrophobia !== 'sim' && p.isPregnant !== 'sim' 
                            ? '<span class="text-muted text-xs">Sem alertas</span>' : ''}
                    </div>
                </td>
                <td class="text-right">
                    <div class="table-actions">
                        <button class="btn btn-sm btn-outline btn-view" data-id="${p.id}" title="Visualizar Ficha Completa">
                            👁 Ver
                        </button>
                        <a href="#/editar/${p.id}" class="btn btn-sm btn-secondary" title="Editar Informações">
                            ✏ Editar
                        </a>
                        <button class="btn btn-sm btn-danger-outline btn-delete" data-id="${p.id}" data-name="${escapeHTML(p.fullName)}" title="Excluir Registro">
                            🗑 Excluir
                        </button>
                    </div>
                </td>
            </tr>
        `).join('');

        // Registra cliques de cada linha
        targetElement.querySelectorAll('.btn-view').forEach(btn => {
            btn.addEventListener('click', () => {
                const pat = storage.getById(btn.dataset.id);
                if (pat) showPatientModal(pat);
            });
        });

        targetElement.querySelectorAll('.btn-delete').forEach(btn => {
            btn.addEventListener('click', async () => {
                const id = btn.dataset.id;
                const name = btn.dataset.name;

                const confirmed = await modal.confirm({
                    title: 'Confirmar Exclusão',
                    message: `Tem certeza de que deseja remover o cadastro do paciente <strong>${name}</strong>? Esta ação não pode ser desfeita.`,
                    confirmText: 'Sim, Excluir',
                    confirmType: 'danger'
                });

                if (confirmed) {
                    const success = storage.delete(id);
                    if (success) {
                        toast.success(`Paciente "${name}" removido com sucesso.`);
                        updateList();
                    } else {
                        toast.error('Erro ao excluir paciente.');
                    }
                }
            });
        });
    }

    // Listeners de filtro
    searchInput.addEventListener('input', updateList);
    modalityFilter.addEventListener('change', updateList);
    riskFilter.addEventListener('change', updateList);

    clearBtn.addEventListener('click', () => {
        searchInput.value = '';
        modalityFilter.value = '';
        riskFilter.value = '';
        updateList();
        toast.info('Filtros redefinidos.');
    });

    // Carga inicial
    updateList();
}

function formatDate(dateStr) {
    if (!dateStr) return '--/--/----';
    const parts = dateStr.split('-');
    if (parts.length === 3) return `${parts[2]}/${parts[1]}/${parts[0]}`;
    return dateStr;
}

function calculateAge(birthDateStr) {
    if (!birthDateStr) return '-';
    const birth = new Date(birthDateStr + 'T00:00:00');
    const now = new Date();
    let age = now.getFullYear() - birth.getFullYear();
    const m = now.getMonth() - birth.getMonth();
    if (m < 0 || (m === 0 && now.getDate() < birth.getDate())) age--;
    return age;
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
