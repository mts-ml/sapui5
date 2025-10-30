# To-Do List (Central de Suporte) — SAP UI5

Aplicação standalone em SAP UI5 (Fiori 3) para gerenciamento de tickets de suporte (To-Do List), com persistência em `localStorage`, KPIs e interface responsiva em padrão MVC.

## Requisitos

- Node.js 16+ (para usar o UI5 Tooling) OU qualquer servidor HTTP simples
- Navegador Chrome/Edge (testado)

## Rodando localmente

1. Clone o repositório e entre na pasta do projeto:
   ```bash
   git clone https://github.com/mts-ml/sapui5
   cd "sapui5"
   ```
2. Instale a CLI (uma vez):
   ```bash
   npm i -g @ui5/cli
   ```
3. Na raiz do projeto, execute:
   ```bash
   ui5 serve -o index.html
   ```

Observação: se o navegador não abrir automaticamente, copie/acesse o link exibido no terminal (por exemplo, `http://localhost:8080`) e abra o arquivo `index.html`.

## Estrutura do projeto

- `manifest.json` — descriptor, tema e dependências
- `package.json` — gerenciador de dependências do projeto, scripts e informações do projeto
- `ui5.yaml` — configuração do UI5 Tooling para build, serve e deploy da aplicação
- `README.md` — documentação geral do projeto
- `REPORT.md`— documentação técnica do projeto
- `webapp/` — código-fonte da aplicação
  - `index.html` — bootstrap UI5 e `ComponentContainer`
  - `Component.js` — inicialização de modelos (`todo` e `ui`) e KPIs
  - `view/App.view.xml` — layout principal (formulário, KPIs, listas, diálogo)
  - `controller/App.controller.js` — lógica de inserção, exclusão, concluir/reabrir, filtros e toasts
  - `i18n/i18n.properties` — textos e rótulos da UI


## Funcionalidades

- Inserção de tickets com descrição (máx. 200), prioridade e data
- Lista de tickets com prioridade colorida e data `DD/MM/AAAA`
- Ações por item: concluir/reabrir e excluir (com confirmação)
- Persistência no `localStorage`
- KPIs: atrasados, hoje, amanhã — atualizados em tempo real

## Tema e diretrizes

- Tema: `sap_fiori_3`
- Layout responsivo com `sap.m` e `sap.ui.layout`
- Padrões Fiori: simplicidade, feedback imediato (`MessageToast`), consistência de componentes
