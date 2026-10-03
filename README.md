# Cadastro-de-Pacientes---Clinica-de-Imagem
## ImagemRad - Sistema de Gestão e Cadastro de Pacientes (SPA)

Página de Cadastro de Pacientes de uma Clinica de Imagem fictícia.

> **Atividade Prática 3** &bull; Curso de Ciências da Computação &bull; Disciplina: Desenvolvimento Front-End

---

## 📌 Visão Geral do Projeto

Este projeto consiste na transformação de uma interface de cadastro para uma **Clínica de Diagnóstico por Imagem** em uma **Single Page Application (SPA)** dinâmica, moderna e totalmente responsiva.

A aplicação conta com navegação fluida sem recarregamento de página, sistema de templates dinâmicos em JavaScript, rotinas avançadas de validação com feedback visual em tempo real, integração com a API dos Correios (ViaCEP), questionário específico de triagem radiológica (marcapasso, contraste, claustrofobia) e persistência de dados local via `localStorage`.

---

## 🚀 Principais Funcionalidades

### 1. Single Page Application (SPA) & Roteamento Dinâmico
- Roteamento por hash (`#/dashboard`, `#/pacientes`, `#/cadastro`, `#/editar/:id`).
- Navegação fluida com animações de transição suaves (`fadeIn`/`fadeOut`).
- Histórico do navegador totalmente funcional (botões de avançar e voltar).
- Indicador visual da rota ativa no cabeçalho.

### 2. Sistema de Templates em JavaScript
- Renderização dinâmica de views via funções template com interpolação limpa de dados.
- Sanitização contra XSS através de função de escape de caracteres HTML.
- Componentização clara: `dashboardView`, `patientFormView` e `patientListView`.

### 3. Validação de Formulários com Feedback Visual em Tempo Real
- **CPF Oficial**: Algoritmo matemático completo com cálculo dos dois dígitos verificadores e rejeição de sequências repetidas.
- **Validação de Data de Nascimento**: Impede datas no futuro, rejeita idades irreais e calcula a idade do paciente automaticamente na tela.
- **E-mail e Telefone**: Validação por expressões regulares e formatos brasileiros.
- **Máscaras de Entrada Dinâmicas**: Formatação automática enquanto o usuário digita para CPF (`000.000.000-00`), Telefone (`(00) 00000-0000`) e CEP (`00000-000`).
- **Feedback Visual Imediato**: Bordas coloridas (vermelho/verde), mensagens explicativas de erro abaixo de cada campo e foco suave no primeiro campo com pendência ao tentar submeter.

### 4. Integração com API ViaCEP
- Busca automática de endereço ao digitar os 8 dígitos do CEP ou clicar no botão "Buscar".
- Preenchimento automático de Logradouro, Bairro, Cidade e UF com feedback de carregamento.

### 5. Triagem de Segurança em Diagnóstico por Imagem
- Questionário pré-exame essencial para radiologia e ressonância magnética:
  - Alerta crítico para portadores de **Marcapasso / Próteses Metálicas** (risco em RM de alto campo).
  - Triagem para **Meio de Contraste** (Iodo/Gadolínio e avaliação de função renal).
  - Identificação de **Claustrofobia** para acomodação adequada.
  - Alerta de **Suspeita de Gestação** para proteção radiológica contra radiação ionizante.

### 6. Persistência de Dados via LocalStorage
- Módulo `storage.js` com CRUD completo (`getAll`, `getById`, `save`, `delete`, `resetToSeeds`, `clearAll`).
- Validação de duplicidade de CPF (impede cadastrar dois pacientes distintos com o mesmo CPF).
- Carga inicial automática de dados de demonstração (seeds) realistas.
- Botões no painel para restaurar registros de exemplo, limpar a base ou exportar dados em formato JSON.

### 7. Interface, Notificações e Modais
- **Toasts Flutuantes**: Alertas animados de sucesso, erro, aviso e informação com barra de progresso de expiração.
- **Modais Customizados**: Janela modal para exibição do prontuário completo de imagem e diálogos de confirmação para ações destrutivas (exclusão).

---

## Estratégia de Branching (GitFlow)

- `main`: versões estáveis e prontas para entrega. Releases e hotfixes são integrados nesta branch.
- `develop`: branch permanente de integração; novas funcionalidades partem daqui.
- `feature/<nome>`: branch temporária criada a partir de `develop` e integrada de volta a `develop` após a conclusão.
- `release/<versão>`: branch temporária criada a partir de `develop` para validações finais; é integrada em `main` e de volta em `develop`.
- `hotfix/<nome>`: branch temporária criada a partir de `main` para correções urgentes; é integrada em `main` e em `develop`.

Branches `feature/*`, `release/*` e `hotfix/*` são removidas após a integração. Elas são criadas quando há trabalho correspondente, não mantidas vazias apenas para ocupar espaço.

Exemplo de ciclo de funcionalidade:

```bash
git switch develop
git switch -c feature/busca-pacientes
# implemente e faça commits da funcionalidade
git switch develop
git merge --no-ff feature/busca-pacientes
git push origin develop
git branch -d feature/busca-pacientes
```

---

## 📁 Estrutura Modular de Arquivos

```
Atividade Pratica 3/
├── index.html                   # Shell da SPA (HTML5 semântico)
├── README.md                    # Documentação do projeto
├── css/
│   ├── variables.css            # Variáveis CSS (paleta médica, tipografia, sombras)
│   ├── base.css                 # Reset, layout base, header, footer e transições
│   ├── components.css           # Botões, cards, formulários, badges, tabelas, modais, toasts
│   └── views.css                # Estilos específicos do Dashboard, Formulário e Lista
└── js/
    ├── main.js                  # Ponto de entrada (inicializa router e eventos globais)
    ├── router.js                # Roteador SPA (hash change listener e transições de tela)
    ├── services/
    │   ├── storage.js           # Gerenciamento do localStorage, seeds e estatísticas
    │   └── cepService.js        # Integração assíncrona com a API ViaCEP
    ├── utils/
    │   ├── validators.js        # Validações puras (CPF matemático, e-mail, datas, etc.)
    │   ├── masks.js             # Máscaras de entrada em tempo real
    │   ├── notifications.js     # Gerenciador de toasts flutuantes
    │   └── modal.js             # Gerenciador de janelas modais acessíveis
    └── views/
        ├── dashboardView.js     # Template e eventos do painel de controle e métricas
        ├── patientFormView.js   # Template e eventos do formulário de cadastro/edição
        └── patientListView.js   # Template e eventos da lista de pacientes com busca e filtros
```

---

## 🛠️ Como Executar a Aplicação

Por utilizar **ES Modules** nativos do JavaScript (`import`/`export`), os navegadores modernos exigem que o projeto seja servido via protocolo HTTP/HTTPS (e não diretamente como `file:///` por motivos de segurança CORS do navegador).

Você pode utilizar qualquer uma das alternativas simples abaixo:

### Opção 1: Via Extensão Live Server do VSCode (Recomendado)
1. Abra a pasta do projeto no VSCode.
2. Clique com o botão direito sobre o arquivo `index.html` e selecione **"Open with Live Server"**.
3. O navegador abrirá automaticamente em `http://127.0.0.1:5500`.

### Opção 2: Via Python (já instalado na máquina)
Abra o terminal na pasta do projeto e execute:
```bash
python -m http.server 3000
```
Em seguida, abra o navegador e acesse: [http://localhost:3000](http://localhost:3000)

### Opção 3: Via Node.js (npx)
No terminal na pasta do projeto:
```bash
npx serve .
```

---

## Build de Produção e Deploy

O projeto usa Vite para empacotar os módulos JavaScript e as folhas de estilo, minificar HTML/CSS/JavaScript e otimizar imagens raster e SVG incluídas na aplicação. Não há imagens locais no momento; imagens adicionadas ao projeto serão processadas durante a build.

```bash
npm ci
npm run build
npm run preview
```

Os arquivos prontos para publicação são gerados em `dist/`. O workflow `.github/workflows/pages.yml` executa a build e publica automaticamente no GitHub Pages quando há alterações em `main`. O endereço de produção é [https://leandrosilvadlima.github.io/Cadastro-de-Pacientes---Clinica-de-Imagem/](https://leandrosilvadlima.github.io/Cadastro-de-Pacientes---Clinica-de-Imagem/).

O Vite usa o caminho-base do repositório no GitHub Actions e `/` no desenvolvimento local. A publicação requer que GitHub Pages esteja habilitado para usar GitHub Actions.

---

## 🧪 Roteiro de Testes Recomendado

1. **Navegação SPA**: Clique nos links **Painel**, **Pacientes** e **Novo Cadastro** no cabeçalho e observe a transição instantânea sem recarregamento de página.
2. **Dashboard**: Observe as métricas automáticas e a barra percentual por modalidade de exame.
3. **Novo Cadastro**:
   - Tente submeter o formulário em branco e observe o feedback em vermelho em cada campo obrigatório.
   - Digite um CPF inválido (ex: `111.111.111-11`) e veja a rejeição imediata pelo validador oficial.
   - Digite um CEP válido (ex: `01310-100`) e veja o preenchimento automático do endereço via API dos Correios.
   - Selecione a data de nascimento e veja o cálculo dinâmico da idade do paciente.
   - Conclua o cadastro e veja a notificação toast e o redirecionamento para a lista.
4. **Listagem e Busca**:
   - Utilize a barra de busca em tempo real para pesquisar pelo nome ou CPF de um paciente.
   - Filtre por modalidade (ex: *Ressonância Magnética*) ou por triagem (ex: *Marcapasso*).
   - Clique em **"Ver"** para abrir o modal de prontuário detalhado.
   - Clique em **"Editar"** para alterar qualquer dado do paciente.
   - Clique em **"Excluir"** para testar a confirmação modal segura.
5. **Gerenciamento de Dados**: No Dashboard, teste o botão **"Exportar Relatório (JSON)"** ou **"Restaurar Pacientes Padrão"**.
