Relatório — To-Do List (Central de Suporte) em SAP UI5

Objetivo e contexto
Aplicação para gerenciamento de tickets sem backend com interface Fiori, usando apenas SAP UI5 (1.120+) e JSONModel com localStorage para persistir entre sessões.

Escolhas de design
- Tema: sap_fiori_3, garantindo visual moderno e consistente com Fiori 3.
- Simplicidade: página única com foco em ação primária (criar ticket) e feedback imediato via MessageToast e MessageBox.
- Responsividade: layout com VBox/HBox e wrap, componentes sap.m adaptativos para mobile/desktop.
- Acessibilidade: rótulos e textos claros; estrutura semântica; navegação com Tab e Shift + Tab; suporte ao atalho Enter para envio.
- Internacionalização: todos os textos visíveis movidos para webapp/i18n/i18n.properties.

Componentes SAP UI5 utilizados
- Estrutura: sap.m.App, sap.m.Page, sap.ui.layout (HBox, VBox).
- Formulário: sap.m.Input, sap.m.Select, sap.m.DatePicker, sap.m.Button, sap.m.Label.
- Lista/itens: sap.m.List, sap.m.CustomListItem, sap.m.ObjectStatus, sap.ui.core.Icon.
- KPIs: sap.m.GenericTile, sap.m.TileContent, sap.m.NumericContent.
- Diálogo: sap.m.Dialog.
- Feedback: sap.m.MessageToast, sap.m.MessageBox.
- Modelos: sap.ui.model.json.JSONModel para todo (dados) e ui (KPIs/estado).

Aplicação das diretrizes Fiori
- Clareza: campos com placeholders, validação de obrigatórios e mensagens diretas.
- Consistência: ícones e estados (ObjectStatus) padronizados para severidade; cores conforme estado (verde para Baixa, azul para Média, laranja para Alta e vermelho para Crítica).
- Responsivo: distribuição dos KPIs em HBox com wrap e conteúdo fluido.

Persistência e dados
- JSONModel como fonte única de verdade.
- localStorage para salvar e restaurar tarefas (chave: todo.tasks).
- KPIs calculados no Component.js e atualizados a cada modificação.

Validações
- Descrição obrigatória (máx. 200 chars).
- Prioridade obrigatória; feedback via ValueState.
- Data obrigatória (restrição de retroativo).   