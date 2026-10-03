/**
 * View do Dashboard da Clínica de Imagem
 */

import { storage } from '../services/storage.js';
import { modal } from '../utils/modal.js';
import { toast } from '../utils/notifications.js';

export function renderDashboard() {
    const stats = storage.getStatistics();
    const patients = storage.getAll();

    // Calcula porcentagens de modalidades
    const modalities = [
        'Ressonância Magnética',
        'Tomografia Computadorizada',
        'Ultrassonografia',
        'Radiografia (Raio-X)',
        'Mamografia Digital',
        'Densitometria Óssea'
    ];

    const modalityColors = {
        'Ressonância Magnética': 'var(--primary)',
        'Tomografia Computadorizada': 'var(--info)',
        'Ultrassonografia': 'var(--success)',
        'Radiografia (Raio-X)': 'var(--warning)',
        'Mamografia Digital': '#ec4899',
        'Densitometria Óssea': '#8b5cf6'
    };

    const modalityBarsHtml = modalities.map(mod => {
        const count = stats.examsByModality[mod] || 0;
        const percentage = stats.total > 0 ? Math.round((count / stats.total) * 100) : 0;
        const color = modalityColors[mod] || 'var(--primary)';

        return `
            <div class="modality-row">
                <div class="modality-label">
                    <span class="modality-name">${mod}</span>
                    <span class="modality-count"><strong>${count}</strong> (${percentage}%)</span>
                </div>
                <div class="progress-track" role="progressbar" aria-label="${mod}: ${count} de ${stats.total} exames" aria-valuenow="${percentage}" aria-valuemin="0" aria-valuemax="100">
                    <div class="progress-fill" aria-hidden="true" style="width: ${percentage}%; background-color: ${color};"></div>
                </div>
            </div>
        `;
    }).join('');

    const recentRowsHtml = stats.recentPatients.length > 0
        ? stats.recentPatients.map(p => `
            <tr>
                <th scope="row">
                    <div class="patient-cell-name">
                        <strong>${escapeHTML(p.fullName)}</strong>
                        <span class="text-muted text-sm">CPF: ${p.cpf}</span>
                    </div>
                </th>
                <td>
                    <span class="badge badge-primary">${p.examType}</span>
                    <div class="text-xs text-muted mt-1">${escapeHTML(p.bodyPart || 'Geral')}</div>
                </td>
                <td>
                    <span class="badge badge-neutral">${p.insurance || 'Particular'}</span>
                </td>
                <td>
                    <div class="schedule-cell">
                        <span>📅 ${formatDate(p.examDate)}</span>
                        <span class="text-muted text-xs">⏰ ${p.examTime || '--:--'}</span>
                    </div>
                </td>
                <td>
                    <div class="alerts-cell">
                        ${p.hasPacemaker === 'sim' ? '<span class="badge badge-danger" title="Possui Marcapasso">Marcapasso</span>' : ''}
                        ${p.needsContrast === 'sim' ? '<span class="badge badge-warning" title="Uso de Contraste">Contraste</span>' : ''}
                        ${p.hasClaustrophobia === 'sim' ? '<span class="badge badge-info" title="Claustrofobia">Claustrofobia</span>' : ''}
                        ${p.hasPacemaker !== 'sim' && p.needsContrast !== 'sim' && p.hasClaustrophobia !== 'sim' ? '<span class="text-muted text-xs">Sem alertas</span>' : ''}
                    </div>
                </td>
                <td class="text-right">
                    <div class="table-actions">
                        <button class="btn btn-sm btn-outline view-details-btn" data-id="${p.id}" title="Ver Detalhes">
                            👁 Visualizar
                        </button>
                        <a href="#/editar/${p.id}" class="btn btn-sm btn-secondary" title="Editar">
                            ✏ Editar
                        </a>
                    </div>
                </td>
            </tr>
        `).join('')
        : `<tr><td colspan="6" class="text-center text-muted py-4">Nenhum paciente registrado até o momento.</td></tr>`;

    return `
        <div class="view-header">
            <div>
                <h1 class="view-title">Painel de Controle e Triagem</h1>
                <p class="view-subtitle">Visão geral dos pacientes e exames de diagnóstico por imagem</p>
            </div>
            <div class="view-actions">
                <a href="#/cadastro" class="btn btn-primary">
                    <span class="btn-icon">✚</span> Novo Cadastro
                </a>
            </div>
        </div>

        <!-- Métricas Rápidas -->
        <div class="metrics-grid">
            <div class="metric-card">
                <div class="metric-icon metric-icon-primary">👥</div>
                <div class="metric-data">
                    <span class="metric-label">Total de Pacientes</span>
                    <span class="metric-value">${stats.total}</span>
                </div>
            </div>

            <div class="metric-card">
                <div class="metric-icon metric-icon-warning">🧪</div>
                <div class="metric-data">
                    <span class="metric-label">Com Contraste</span>
                    <span class="metric-value">${stats.contrastCount}</span>
                </div>
            </div>

            <div class="metric-card">
                <div class="metric-icon metric-icon-danger">⚡</div>
                <div class="metric-data">
                    <span class="metric-label">Alerta Marcapasso</span>
                    <span class="metric-value">${stats.pacemakerAlerts}</span>
                </div>
            </div>

            <div class="metric-card">
                <div class="metric-icon metric-icon-info">🛡</div>
                <div class="metric-data">
                    <span class="metric-label">Claustrofobia</span>
                    <span class="metric-value">${stats.claustrophobiaAlerts}</span>
                </div>
            </div>
        </div>

        <!-- Seção de Distribuição e Painel -->
        <div class="grid-2-col mt-4">
            <div class="card">
                <div class="card-header">
                    <h2 class="card-title">Distribuição por Tipo de Exame</h2>
                    <span class="text-xs text-muted">Total: ${stats.total} exames</span>
                </div>
                <div class="card-body">
                    <div class="modality-list">
                        ${modalityBarsHtml}
                    </div>
                </div>
            </div>

            <div class="card">
                <div class="card-header">
                    <h2 class="card-title">Ações e Gerenciamento</h2>
                </div>
                <div class="card-body system-manage-box">
                    <p class="text-sm text-muted">
                        Esta aplicação armazena todos os registros dinamicamente no <strong>localStorage</strong> do navegador.
                        Você pode gerenciar o estado da base de dados abaixo:
                    </p>
                    <div class="management-buttons mt-3">
                        <button id="btn-seed-data" class="btn btn-secondary btn-block">
                            🔄 Restaurar Pacientes Padrão (Demonstração)
                        </button>
                        <button id="btn-export-data" class="btn btn-outline btn-block">
                            📥 Exportar Relatório de Pacientes (JSON)
                        </button>
                        <button id="btn-clear-data" class="btn btn-danger-outline btn-block">
                            🗑 Limpar Toda a Base Local
                        </button>
                    </div>
                </div>
            </div>
        </div>

        <!-- Tabela de Pacientes Recentes -->
        <div class="card mt-4">
            <div class="card-header flex-between">
                <div>
                    <h2 class="card-title">Últimos Pacientes Cadastrados</h2>
                    <span class="text-xs text-muted">Acompanhe as triagens mais recentes da clínica</span>
                </div>
                <a href="#/pacientes" class="btn btn-sm btn-outline">Ver Lista Completa &rarr;</a>
            </div>
            <div class="card-body p-0">
                <div class="table-responsive">
                <div class="table-responsive" role="region" aria-label="Últimos pacientes cadastrados" tabindex="0">
                    <table class="data-table">
                        <caption class="visually-hidden">Pacientes mais recentes, exames, convênios, datas e alertas</caption>
                        <thead>
                            <tr>
                                <th scope="col">Paciente</th>
                                <th scope="col">Exame / Região</th>
                                <th scope="col">Convênio</th>
                                <th scope="col">Data Agendada</th>
                                <th scope="col">Triagem de Risco</th>
                                <th scope="col" class="text-right">Ações</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${recentRowsHtml}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    `;
}

/**
 * Registra eventos da View do Dashboard
 */
export function attachDashboardEvents(container) {
    // Visualização de detalhes
    container.querySelectorAll('.view-details-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            const patientId = btn.dataset.id;
            const patient = storage.getById(patientId);
            if (patient) {
                showPatientModal(patient);
            }
        });
    });

    // Restaurar dados padrão
    const btnSeed = container.querySelector('#btn-seed-data');
    if (btnSeed) {
        btnSeed.addEventListener('click', async () => {
            const confirmed = await modal.confirm({
                title: 'Restaurar Dados de Exemplo',
                message: 'Deseja recarregar os dados padrão de demonstração da clínica? Seus dados atuais serão substituídos.',
                confirmText: 'Restaurar',
                confirmType: 'primary'
            });

            if (confirmed) {
                storage.resetToSeeds();
                toast.success('Dados de demonstração restaurados com sucesso!');
                window.location.hash = '#/dashboard';
                // Recarrega view
                const app = document.getElementById('app');
                app.innerHTML = renderDashboard();
                attachDashboardEvents(app);
            }
        });
    }

    // Exportar JSON
    const btnExport = container.querySelector('#btn-export-data');
    if (btnExport) {
        btnExport.addEventListener('click', () => {
            const patients = storage.getAll();
            const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(patients, null, 2));
            const downloadAnchor = document.createElement('a');
            downloadAnchor.setAttribute("href", dataStr);
            downloadAnchor.setAttribute("download", `pacientes_clinica_imagem_${new Date().toISOString().slice(0, 10)}.json`);
            document.body.appendChild(downloadAnchor);
            downloadAnchor.click();
            downloadAnchor.remove();
            toast.info('Exportação gerada e iniciada.');
        });
    }

    // Limpar toda a base
    const btnClear = container.querySelector('#btn-clear-data');
    if (btnClear) {
        btnClear.addEventListener('click', async () => {
            const confirmed = await modal.confirm({
                title: 'Atenção: Limpar Base de Dados',
                message: 'Tem certeza de que deseja apagar TODOS os pacientes cadastrados do localStorage? Esta ação não pode ser desfeita.',
                confirmText: 'Sim, Apagar Tudo',
                confirmType: 'danger'
            });

            if (confirmed) {
                storage.clearAll();
                toast.warning('Todos os dados foram excluídos do armazenamento local.');
                const app = document.getElementById('app');
                app.innerHTML = renderDashboard();
                attachDashboardEvents(app);
            }
        });
    }
}

/**
 * Exibe o modal com prontuário detalhado do paciente
 * @param {Object} p 
 */
export function showPatientModal(p) {
    const age = calculateAge(p.birthDate);
    const content = `
        <div class="patient-modal-sheet">
            <div class="modal-section-title">Dados do Paciente</div>
            <div class="info-grid">
                <div><span class="label">Nome Completo:</span> <strong>${escapeHTML(p.fullName)}</strong></div>
                <div><span class="label">CPF:</span> <span>${p.cpf}</span></div>
                <div><span class="label">Nascimento:</span> <span>${formatDate(p.birthDate)} (${age} anos)</span></div>
                <div><span class="label">Sexo:</span> <span>${formatGender(p.gender)}</span></div>
                <div><span class="label">Telefone:</span> <span>${p.phone}</span></div>
                <div><span class="label">E-mail:</span> <span>${escapeHTML(p.email)}</span></div>
            </div>

            <div class="modal-section-title mt-3">Endereço</div>
            <div class="info-grid">
                <div><span class="label">Logradouro:</span> <span>${escapeHTML(p.street || '')}, ${escapeHTML(p.number || '')}</span></div>
                <div><span class="label">Complemento:</span> <span>${escapeHTML(p.complement || 'Nenhum')}</span></div>
                <div><span class="label">Bairro:</span> <span>${escapeHTML(p.neighborhood || '')}</span></div>
                <div><span class="label">Cidade / UF:</span> <span>${escapeHTML(p.city || '')} - ${escapeHTML(p.state || '')}</span></div>
                <div><span class="label">CEP:</span> <span>${p.cep || 'Não informado'}</span></div>
            </div>

            <div class="modal-section-title mt-3">Exame e Agendamento</div>
            <div class="info-grid">
                <div><span class="label">Tipo de Exame:</span> <span class="badge badge-primary">${p.examType}</span></div>
                <div><span class="label">Região Anatômica:</span> <strong>${escapeHTML(p.bodyPart || 'Não especificada')}</strong></div>
                <div><span class="label">Data / Hora:</span> <span>${formatDate(p.examDate)} às ${p.examTime || '--:--'}</span></div>
                <div><span class="label">Médico Solicitante:</span> <span>${escapeHTML(p.doctorName || 'Não informado')} (CRM: ${escapeHTML(p.doctorCrm || '-')})</span></div>
                <div><span class="label">Convênio:</span> <span>${escapeHTML(p.insurance || 'Particular')}</span></div>
            </div>

            <div class="modal-section-title mt-3">Protocolo de Segurança & Triagem</div>
            <div class="safety-grid">
                <div class="safety-item ${p.hasPacemaker === 'sim' ? 'danger' : 'safe'}">
                    <span>Marcapasso / Prótese Metálica:</span>
                    <strong>${p.hasPacemaker === 'sim' ? 'SIM (RISCO ELEVADO EM RM)' : 'Não'}</strong>
                </div>
                <div class="safety-item ${p.needsContrast === 'sim' ? 'warning' : 'safe'}">
                    <span>Necessita Contraste:</span>
                    <strong>${p.needsContrast === 'sim' ? 'SIM (Verificar Função Renal)' : 'Não'}</strong>
                </div>
                <div class="safety-item ${p.hasClaustrophobia === 'sim' ? 'info' : 'safe'}">
                    <span>Claustrofobia:</span>
                    <strong>${p.hasClaustrophobia === 'sim' ? 'SIM (Sedação/Acompanhamento)' : 'Não'}</strong>
                </div>
                <div class="safety-item ${p.isPregnant === 'sim' ? 'danger' : 'safe'}">
                    <span>Suspeita de Gestação:</span>
                    <strong>${p.isPregnant === 'sim' ? 'SIM (Evitar radiação ionizante)' : 'Não'}</strong>
                </div>
            </div>

            ${p.notes ? `
                <div class="modal-section-title mt-3">Observações Clínicas</div>
                <div class="notes-box">${escapeHTML(p.notes)}</div>
            ` : ''}
        </div>
    `;

    modal.open({
        title: `Prontuário de Imagem: ${p.fullName}`,
        content,
        footerButtons: [
            {
                text: 'Fechar',
                className: 'btn-secondary',
                onClick: () => modal.close()
            },
            {
                text: 'Editar Paciente',
                className: 'btn-primary',
                onClick: () => {
                    modal.close();
                    window.location.hash = `#/editar/${p.id}`;
                }
            }
        ]
    });
}

function formatDate(dateStr) {
    if (!dateStr) return '--/--/----';
    const parts = dateStr.split('-');
    if (parts.length === 3) {
        return `${parts[2]}/${parts[1]}/${parts[0]}`;
    }
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

function formatGender(gender) {
    const map = {
        'M': 'Masculino',
        'F': 'Feminino',
        'O': 'Outro / Não especificado'
    };
    return map[gender] || gender || '-';
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
