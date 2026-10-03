/**
 * Serviço de persistência e manipulação de dados utilizando localStorage
 */

const STORAGE_KEY = '@ClinicaImagem:pacientes_v1';

// Dados iniciais para demonstração e avaliação do sistema
const INITIAL_SEEDS = [
    {
        id: 'seed-1',
        fullName: 'Carlos Eduardo Oliveira Santos',
        cpf: '345.678.912-34',
        birthDate: '1984-05-14',
        gender: 'M',
        phone: '(11) 98765-4321',
        email: 'carlos.eduardo@email.com',
        cep: '01310-100',
        street: 'Avenida Paulista',
        number: '1000',
        complement: 'Apto 42',
        neighborhood: 'Bela Vista',
        city: 'São Paulo',
        state: 'SP',
        examType: 'Ressonância Magnética',
        bodyPart: 'Crânio com Contraste',
        examDate: '2026-09-30',
        examTime: '08:30',
        doctorName: 'Dra. Beatriz Montenegro',
        doctorCrm: '142857-SP',
        insurance: 'Bradesco Saúde',
        hasPacemaker: 'nao',
        needsContrast: 'sim',
        hasClaustrophobia: 'sim',
        isPregnant: 'nao',
        notes: 'Paciente relata leve claustrofobia. Necessário agulhamento calibroso para contraste com gadolínio.',
        createdAt: '2026-09-20T10:00:00.000Z'
    },
    {
        id: 'seed-2',
        fullName: 'Mariana Silveira Ramos',
        cpf: '789.123.456-01',
        birthDate: '1992-11-23',
        gender: 'F',
        phone: '(21) 99876-5432',
        email: 'mariana.silveira@email.com',
        cep: '22041-001',
        street: 'Rua Santa Clara',
        number: '250',
        complement: 'Bloco B',
        neighborhood: 'Copacabana',
        city: 'Rio de Janeiro',
        state: 'RJ',
        examType: 'Tomografia Computadorizada',
        bodyPart: 'Tórax de Alta Resolução',
        examDate: '2026-10-02',
        examTime: '10:00',
        doctorName: 'Dr. Roberto Guimarães',
        doctorCrm: '87452-RJ',
        insurance: 'Unimed',
        hasPacemaker: 'nao',
        needsContrast: 'sim',
        hasClaustrophobia: 'nao',
        isPregnant: 'nao',
        notes: 'Investigação de tosse crônica e nódulo subcentimétrico prévio.',
        createdAt: '2026-09-22T14:15:00.000Z'
    },
    {
        id: 'seed-3',
        fullName: 'Arnaldo Antunes Medeiros',
        cpf: '567.890.123-45',
        birthDate: '1958-03-08',
        gender: 'M',
        phone: '(31) 98456-1122',
        email: 'arnaldo.medeiros@email.com',
        cep: '30130-110',
        street: 'Rua da Bahia',
        number: '120',
        complement: '',
        neighborhood: 'Centro',
        city: 'Belo Horizonte',
        state: 'MG',
        examType: 'Ultrassonografia',
        bodyPart: 'Abdome Total e Vias Biliares',
        examDate: '2026-09-28',
        examTime: '07:45',
        doctorName: 'Dr. Lucas Ferreira',
        doctorCrm: '65412-MG',
        insurance: 'Amil',
        hasPacemaker: 'sim',
        needsContrast: 'nao',
        hasClaustrophobia: 'nao',
        isPregnant: 'nao',
        notes: 'ATENÇÃO: Paciente portador de marcapasso definitivo (marca Medtronic). Jejum absoluto de 8 horas.',
        createdAt: '2026-09-24T09:30:00.000Z'
    },
    {
        id: 'seed-4',
        fullName: 'Juliana Costa Ferreira',
        cpf: '234.567.890-12',
        birthDate: '1979-08-17',
        gender: 'F',
        phone: '(41) 99123-8877',
        email: 'juliana.costa@email.com',
        cep: '80020-310',
        street: 'Rua XV de Novembro',
        number: '890',
        complement: 'Sala 301',
        neighborhood: 'Centro',
        city: 'Curitiba',
        state: 'PR',
        examType: 'Mamografia Digital',
        bodyPart: 'Mamas Bilateral com Tomossíntese',
        examDate: '2026-10-05',
        examTime: '11:15',
        doctorName: 'Dra. Fernanda Albuquerque',
        doctorCrm: '33412-PR',
        insurance: 'SulAmérica',
        hasPacemaker: 'nao',
        needsContrast: 'nao',
        hasClaustrophobia: 'nao',
        isPregnant: 'nao',
        notes: 'Controle de rotina anual. Sem achados palpáveis.',
        createdAt: '2026-09-25T11:00:00.000Z'
    },
    {
        id: 'seed-5',
        fullName: 'Gabriel Henrique Nogueira',
        cpf: '456.789.012-33',
        birthDate: '2001-12-04',
        gender: 'M',
        phone: '(19) 97145-2233',
        email: 'gabriel.nogueira@email.com',
        cep: '13010-000',
        street: 'Rua Barão de Jaguara',
        number: '45',
        complement: 'Casa',
        neighborhood: 'Centro',
        city: 'Campinas',
        state: 'SP',
        examType: 'Radiografia (Raio-X)',
        bodyPart: 'Joelho Direito (AP e Perfil)',
        examDate: '2026-09-29',
        examTime: '15:20',
        doctorName: 'Dr. André Castilho',
        doctorCrm: '198754-SP',
        insurance: 'Particular',
        hasPacemaker: 'nao',
        needsContrast: 'nao',
        hasClaustrophobia: 'nao',
        isPregnant: 'nao',
        notes: 'Trauma esportivo no futebol ontem. Suspeita de entorse ligamentar.',
        createdAt: '2026-09-26T16:00:00.000Z'
    }
];

class StorageService {
    constructor() {
        this.initStorage();
    }

    initStorage() {
        const existing = localStorage.getItem(STORAGE_KEY);
        if (!existing) {
            this.setAll(INITIAL_SEEDS);
        }
    }

    /**
     * Retorna todos os pacientes cadastrados
     * @returns {Array<Object>}
     */
    getAll() {
        try {
            const raw = localStorage.getItem(STORAGE_KEY);
            return raw ? JSON.parse(raw) : [];
        } catch (e) {
            console.error('Erro ao ler pacientes do localStorage:', e);
            return [];
        }
    }

    /**
     * Salva array completo de pacientes
     * @param {Array<Object>} patients 
     */
    setAll(patients) {
        try {
            localStorage.setItem(STORAGE_KEY, JSON.stringify(patients));
        } catch (e) {
            console.error('Erro ao gravar no localStorage:', e);
            throw new Error('Falha ao armazenar dados localmente. Espaço insuficiente.');
        }
    }

    /**
     * Busca paciente por ID
     * @param {string} id 
     * @returns {Object|null}
     */
    getById(id) {
        const patients = this.getAll();
        return patients.find(p => p.id === id) || null;
    }

    /**
     * Busca paciente por CPF
     * @param {string} cpf 
     * @returns {Object|null}
     */
    getByCPF(cpf) {
        const clean = cpf.replace(/\D/g, '');
        const patients = this.getAll();
        return patients.find(p => p.cpf.replace(/\D/g, '') === clean) || null;
    }

    /**
     * Salva um novo paciente ou atualiza um existente
     * @param {Object} patientData 
     * @returns {Object} paciente salvo
     */
    save(patientData) {
        const patients = this.getAll();
        const cleanCPF = patientData.cpf.replace(/\D/g, '');

        if (patientData.id) {
            // Edição
            const index = patients.findIndex(p => p.id === patientData.id);
            if (index === -1) {
                throw new Error('Paciente não encontrado para edição.');
            }

            // Verifica se outro paciente já usa esse CPF
            const conflict = patients.find(p => p.id !== patientData.id && p.cpf.replace(/\D/g, '') === cleanCPF);
            if (conflict) {
                throw new Error(`O CPF informado (${patientData.cpf}) já pertence a outro paciente cadastrado (${conflict.fullName}).`);
            }

            const updatedPatient = {
                ...patients[index],
                ...patientData,
                updatedAt: new Date().toISOString()
            };
            patients[index] = updatedPatient;
            this.setAll(patients);
            return updatedPatient;
        } else {
            // Novo cadastro
            const existingCPF = patients.find(p => p.cpf.replace(/\D/g, '') === cleanCPF);
            if (existingCPF) {
                throw new Error(`Já existe um paciente cadastrado com este CPF: ${existingCPF.fullName}.`);
            }

            const newPatient = {
                ...patientData,
                id: 'pat-' + Date.now().toString(36) + Math.random().toString(36).substring(2, 6),
                createdAt: new Date().toISOString()
            };
            patients.unshift(newPatient); // Inserir no início
            this.setAll(patients);
            return newPatient;
        }
    }

    /**
     * Exclui um paciente pelo ID
     * @param {string} id 
     * @returns {boolean}
     */
    delete(id) {
        const patients = this.getAll();
        const filtered = patients.filter(p => p.id !== id);
        if (filtered.length !== patients.length) {
            this.setAll(filtered);
            return true;
        }
        return false;
    }

    /**
     * Restaura dados iniciais de exemplo
     */
    resetToSeeds() {
        this.setAll(INITIAL_SEEDS);
        return INITIAL_SEEDS;
    }

    /**
     * Limpa completamente o banco de dados local
     */
    clearAll() {
        this.setAll([]);
    }

    /**
     * Retorna indicadores para o Dashboard
     */
    getStatistics() {
        const patients = this.getAll();
        const total = patients.length;

        const examsByModality = {};
        let contrastCount = 0;
        let pacemakerAlerts = 0;
        let claustrophobiaAlerts = 0;

        patients.forEach(p => {
            const modality = p.examType || 'Outro';
            examsByModality[modality] = (examsByModality[modality] || 0) + 1;

            if (p.needsContrast === 'sim') contrastCount++;
            if (p.hasPacemaker === 'sim') pacemakerAlerts++;
            if (p.hasClaustrophobia === 'sim') claustrophobiaAlerts++;
        });

        // Ordena por data mais recente de criação
        const recentPatients = [...patients]
            .sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0))
            .slice(0, 5);

        return {
            total,
            examsByModality,
            contrastCount,
            pacemakerAlerts,
            claustrophobiaAlerts,
            recentPatients
        };
    }
}

export const storage = new StorageService();
