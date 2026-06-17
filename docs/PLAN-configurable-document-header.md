# PLAN-configurable-document-header.md - Cabeçalho de Documentos Configurável e Reutilizável

Este documento detalha o planejamento de engenharia para centralizar e tornar editável o cabeçalho timbrado dos documentos gerados pelo sistema, unificando a identidade visual sob as diretrizes do SINASEFE JATAÍ.

- **Project Type:** WEB (Next.js Application with Supabase)
- **Primary Agent:** `database-architect` (modelagem de tabelas e buckets) + `frontend-specialist` (interface reativa e design de impressão) + `test-engineer` (validações estáticas e integridade de compilação)

---

## Success Criteria

1. **Centralização Completa:** Remoção dos cabeçalhos estáticos (hardcoded) dos 4 documentos gerados (Edital, Lista de Presença, Ata e Prestação de Contas), substituindo-os pelo novo componente `<DocumentHeader />`.
2. **Edição Autônoma:** Criação da rota administrativa `/admin/configuracoes` com formulário para editar todos os textos e logotipo do cabeçalho.
3. **Fidelidade Visual Absoluta:** O componente `<DocumentHeader />` deve reproduzir exatamente o layout timbrado fornecido na imagem (alinhamento do logotipo, fontes estilizadas em tons institucionais de vermelho/cinza e rodapés de linha como "FILIADO À CEA").
4. **Persistência Segura:** Armazenamento dos dados no Supabase e suporte a upload de nova logomarca usando Supabase Storage no bucket `sistema`.
5. **Valor Padrão Garantido:** Inserção automática de um registro semente (seed) contendo as informações oficiais atuais para que o cabeçalho nunca inicie em branco.

---

## Relação de Arquivos (File Structure)

```plaintext
sinasefejatai/
├── docs/
│   └── PLAN-configurable-document-header.md # Este plano de ação
├── schema.sql                               # [MODIFY] Adição de tabela, triggers e políticas RLS
└── src/
    ├── app/
    │   └── admin/
    │       ├── layout.tsx                   # [MODIFY] Adição de link de "Configurações" na Sidebar
    │       └── configuracoes/
    │           ├── page.tsx                 # [NEW] Painel administrativo de personalização
    │           └── actions.ts               # [NEW] Server Actions para salvar textos e fazer upload do logotipo
    ├── components/
    │   └── document-header.tsx              # [NEW] Componente React reutilizável de cabeçalho timbrado
    ├── lib/
    │   └── types.ts                         # [NEW] Definições de tipo para as configurações
    └── app/
        ├── assembleias/
        │   └── [id]/
        │       ├── edital/
        │       │   └── page.tsx             # [MODIFY] Consumir novo <DocumentHeader />
        │       ├── presenca/
        │       │   └── page.tsx             # [MODIFY] Consumir novo <DocumentHeader />
        │       └── ata/
        │           └── page.tsx             # [MODIFY] Consumir novo <DocumentHeader />
        └── financeiro/
            └── prestacao/
                └── page.tsx                 # [MODIFY] Consumir novo <DocumentHeader />
```

---

## Cronograma de Tarefas (Task Breakdown)

### Fase 1: Banco de Dados e Storage (Infraestrutura)
- [ ] **Task 1.1: Atualizar o Banco de Dados (schema.sql)**
  - **Agent:** `database-architect` | **Skill:** `database-design`
  - **Input:** Modelagem da tabela `configuracoes` de linha única e bucket `sistema`.
  - **Output:** Adição da estrutura SQL no `schema.sql` (tabela, restrições, políticas de RLS e inserção do registro semente ID=1).
  - **Verify:** Executar os comandos SQL no painel SQL do Supabase.

### Fase 2: Componente Reutilizável de Cabeçalho
- [ ] **Task 2.1: Criar o Componente `<DocumentHeader />`**
  - **Agent:** `frontend-specialist` | **Skill:** `frontend-design`
  - **Input:** Layout exato do print com logotipo à esquerda, textos institucionais e linha divisória horizontal.
  - **Output:** Criação de `src/components/document-header.tsx` que recebe opcionalmente a prop `config` ou carrega os dados em tempo de execução.
  - **Verify:** O componente deve ser reativo e renderizar com perfeição matemática em simulações A4.

### Fase 3: Substituição de Cabeçalhos Hardcoded
- [ ] **Task 3.1: Integrar o `<DocumentHeader />` nos 4 Documentos Existentes**
  - **Agent:** `frontend-specialist` | **Skill:** `react-best-practices`
  - **Input:** Visualizações de Edital, Presença, Ata e Prestação de Contas.
  - **Output:** Remoção do código HTML duplicado e importação do `<DocumentHeader config={config} />`.
  - **Verify:** Confirmar que as páginas continuam abrindo perfeitamente com os novos dados do cabeçalho centralizado.

### Fase 4: Painel Administrativo de Configuração
- [ ] **Task 4.1: Criar Tela de Configurações `/admin/configuracoes`**
  - **Agent:** `frontend-specialist` | **Skill:** `frontend-design`
  - **Input:** Formulário de edição geométrica + preview do cabeçalho em tempo real ao lado.
  - **Output:** Criação de `src/app/admin/configuracoes/page.tsx` e `actions.ts`.
  - **Verify:** Salvar textos e fazer upload da imagem de logotipo atualizando a preview de forma reativa.

### Fase 5: Ajustes de Navegação
- [x] **Task 5.1: Adicionar Link na Sidebar Administrativa**
  - **Agent:** `frontend-specialist` | **Skill:** `frontend-design`
  - **Input:** Sidebar existente em `src/app/admin/layout.tsx`.
  - **Output:** Adição do link "Configurações" (com ícone de engrenagem) que direciona para `/admin/configuracoes`.
  - **Verify:** Clicar e navegar com sucesso.

### Fase 6: Otimização de Imagens (Próxima Feature)
- [ ] **Task 6.1: Criar o Loader Dinâmico do Supabase**
  - **Agent:** `frontend-specialist` | **Skill:** `nextjs-react-expert`
  - **Input:** Arquivo utilitário `src/lib/supabase-image-loader.ts`.
  - **Output:** Função que concatena dimensões, qualidade e extensão `format=webp` nas URLs públicas das imagens hospedadas na CDN do Supabase. Retorna `blob:` URLs e caminhos locais intocados.
  - **Verify:** Linter limpo e tipos TypeScript corretos.

- [ ] **Task 6.2: Refatorar Componente `<DocumentHeader />` com `<Image />`**
  - **Agent:** `frontend-specialist` | **Skill:** `nextjs-react-expert`
  - **Input:** Componente em `src/components/document-header.tsx`.
  - **Output:** Substituir a tag nativa `<img>` pelo componente `<Image />` do `next/image` importando o `supabaseLoader` e definindo atributos `width`, `height` e `sizes` para prevenir layout shifts.
  - **Verify:** O cabeçalho deve carregar as imagens perfeitamente na visualização de tela e na impressão.

- [ ] **Task 6.3: Refatorar Visualizações de Imagem nas Outras Rotas**
  - **Agent:** `frontend-specialist` | **Skill:** `nextjs-react-expert`
  - **Input:** Preview do painel administrativo de configurações e outras telas do sistema que possuam comprovantes financeiros.
  - **Output:** Garantir uso otimizado de `<Image />` onde aplicável para fotos de filiados e recibos do livro caixa.
  - **Verify:** Linter e compilação limpa.

---

## Phase X: Verification Checklist

Executaremos os scripts de auditoria antes de marcar as tarefas como finalizadas:
- [ ] Executar o checklist rápido de código: `python .agent/scripts/checklist.py .`
- [ ] Executar build de produção do Next.js: `pnpm build` para garantir ausência de avisos ou quebras de tipos.

### ✅ PHASE X COMPLETE
- Lint: [x] Pass
- Security: [x] Pass
- Build: [x] Success
- Date: 2026-05-24

