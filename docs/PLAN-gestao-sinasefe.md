# PLAN-gestao-sinasefe.md - Plano de Desenvolvimento do Sistema SINASEFE JATAÍ

Este documento serve como mapa de execução serial para a construção do sistema.

## Overview
O sistema automatiza a emissão de Editais de Convocação, Listas de Presença, Atas de Assembleia e Prestação de Contas da seção sindical de Jataí do SINASEFE, utilizando Next.js 15, Tailwind CSS v4.3 e banco de dados Supabase.

- **Project Type:** WEB (Next.js Application)
- **Primary Agent:** `frontend-specialist` (para a interface reativa e exportações de PDF) + `database-architect` (para a estrutura de dados relacional e políticas do Supabase)

---

## Success Criteria

1. **Autenticação Segura:** Apenas administradores cadastrados no Supabase Auth conseguem acessar o painel `/admin/*`.
2. **Fidelidade de Impressão:** Os PDFs do Edital de Convocação, da Lista de Presença (pré-preenchida ou em branco) e da Prestação de Contas devem possuir cabeçalho oficial idêntico aos modelos reais, formatados perfeitamente em folha A4 física (ocultando barras laterais e barras de ferramentas do sistema ao usar `Ctrl + P`).
3. **Editor Flexível:** Redação de atas em um editor WYSIWYG reativo que salva o progresso no Supabase em tempo real.
4. **Prestação de Contas Automatizada:** Entrada e saída de transações financeiras gerando saldos consolidados por categoria de forma automática.
5. **Conformidade de Acessibilidade e Design:** Cores institucionais nítidas baseadas no vermelho oficial, sem cantos arredondados desnecessários (estética geométrica limpa), e estrita conformidade com o **Purple Ban** (Proibição total de roxo/violeta).

---

## Relação de Arquivos (File Structure)

```plaintext
filiados-web/
├── docs/
│   └── PLAN-gestao-sinasefe.md      # Este arquivo de planejamento
├── public/
│   └── logo-sinasefe.png            # Logotipo oficial do SINASEFE
├── schema.sql                       # Definição das tabelas e políticas do Supabase
└── src/
    ├── app/
    │   ├── layout.tsx               # Provedores globais
    │   ├── login/
    │   │   └── page.tsx             # Tela de autenticação administrativa
    │   └── admin/
    │       ├── layout.tsx           # Painel Administrativo com Sidebar e header fixo
    │       ├── filiados/
    │       │   ├── page.tsx         # Listagem e busca de filiados
    │       │   └── actions.ts       # Server Actions para inserção/edição
    │       ├── assembleias/
    │       │   ├── page.tsx         # Criação de assembleias e Editais
    │       │   ├── [id]/
    │       │   │   ├── documentos/
    │       │   │   │   └── page.tsx # Visualização de Editais e Lista de Presença formatados
    │       │   │   └── ata/
    │       │   │       └── page.tsx # Editor WYSIWYG de Atas
    │       └── financeiro/
    │           ├── page.tsx         # Livro Caixa / Lançamentos
    │           └── prestacao/
    │               └── page.tsx     # Tela de Prestação de Contas consolidada
    └── lib/
        └── supabase.ts              # Cliente de conexão Supabase
```

---

## Cronograma de Tarefas (Task Breakdown)

### Fase 0: Infraestrutura e Supabase
- [x] **Task 0.1: Script do Supabase (schema.sql)**
  - **Agent:** `database-architect` | **Skill:** `database-design`
  - **Input:** Requisitos de tabelas (`filiados`, `assembleias`, `presencas`, `atas`, `financeiro`).
  - **Output:** Arquivo `schema.sql` com definições completas de tabelas, chaves estrangeiras, triggers de data, restrições e políticas de RLS.
  - **Verify:** Rodar o SQL no Supabase sem erros de sintaxe ou relacionamento.

### Fase 1: Fundação do Projeto Next.js
- [x] **Task 1.1: Inicialização do Next.js e Tailwind v4**
  - **Agent:** `frontend-specialist` | **Skill:** `app-builder`
  - **Input:** Diretrizes de stack (Next.js 15, Tailwind v4.3).
  - **Output:** Scaffolding do projeto criado com `create-next-app` integrado com Tailwind v4.
  - **Verify:** Executar `pnpm dev` com sucesso na porta 3000.

- [x] **Task 1.2: Cliente do Supabase e Conexão**
  - **Agent:** `backend-specialist` | **Skill:** `app-builder`
  - **Input:** Credenciais do Supabase.nte Supabase URL e Anon Key.
  - **Output:** Inicialização do cliente Supabase em `src/lib/supabase.ts`.
  - **Verify:** Testar conexão básica com o banco.

- [x] **Task 1.3: Autenticação Administrativa**
  - **Agent:** `frontend-specialist` | **Skill:** `frontend-design`
  - **Input:** Supabase Auth + tela de login geométrica.
  - **Output:** Rota `/login` e Middleware de proteção `/admin/*`.
  - **Verify:** Tentativa de acessar `/admin` sem login deve redirecionar para `/login`.

### Fase 2: Módulo de Filiados
- [x] **Task 2.1: Gestão de Filiados**
  - **Agent:** `frontend-specialist` | **Skill:** `react-best-practices`
  - **Input:** Tabelas e formulários.
  - **Output:** Tela `/admin/filiados` exibindo filiados cadastrados com busca activa por SIAPE ou nome, além de formulário lateral deslizante (gaveta geométrica) para cadastro e edição rápida.
  - **Verify:** Cadastrar um filiado e verificar que ele aparece imediatamente na listagem sem recarregar a página.

### Fase 3: Assembleias e Emissão de Documentos
- [ ] **Task 3.1: Criação e Agendamento de Assembleias**
  - **Agent:** `frontend-specialist` | **Skill:** `frontend-design`
  - **Input:** Form para agendar nova assembleia (data, número, tipo, horários de convocações, local, pauta dinâmica em vetor de strings).
  - **Output:** Painel `/admin/assembleias` funcional salvando no Supabase.
  - **Verify:** Adicionar uma nova assembleia extraordinária com 4 pontos de pauta e verificar o registro no Supabase.

- [x] **Task 3.2: Folha Timbrada e Impressão de Editais / Lista de Presença**
  - **Agent:** `frontend-specialist` | **Skill:** `web-design-guidelines`
  - **Input:** Cabeçalho timbrado oficial da seção sindical e dados da assembleia.
  - **Output:** Rota `/admin/assembleias/[id]/documentos` estilizada para impressão A4 via `@media print`. Deve possuir toggle para gerar a Lista de Presença com os filiados pré-cadastrados ou com linhas numeradas vazias.
  - **Verify:** Acionar a janela de impressão do sistema (`Ctrl + P`) e conferir o cabeçalho idêntico às imagens reais, com todas as bordas e tabelas alinhadas e sem o menu do sistema visível.

### Fase 4: Editor de Atas e Livro Caixa
- [x] **Task 4.1: Editor de Atas WYSIWYG**
  - **Agent:** `frontend-specialist` | **Skill:** `react-best-practices`
  - **Input:** Modelo base da ata formatada institucionalmente e biblioteca TipTap.
  - **Output:** Tela `/admin/assembleias/[id]/ata` com editor reativo salvando rascunhos no banco e exportando para PDF limpo de ata contínua.
  - **Verify:** Salvar conteúdo em rich text e carregar novamente sem perda de formatação ou caracteres especiais.

- [x] **Task 4.2: Livro Caixa e Prestação de Contas**
  - **Agent:** `backend-specialist` | **Skill:** `database-design`
  - **Input:** Registros financeiros (tipo, valor, categoria, anexo de recibo em Supabase Storage).
  - **Output:** Painel `/admin/financeiro` e folha de exportação de prestação de contas mensal consolidada.
  - **Verify:** Adicionar despesas e conferir que o relatório consolida e calcula o saldo final correto instantaneamente.

---

## Phase X: Verification Checklist

Executaremos os scripts de auditoria integrados antes de marcar as tarefas como finalizadas:
- [x] Executar o checklist rápido de código: `python .agent/scripts/checklist.py .`
- [x] Validar conformidade de contraste de cores (Vermelho SINASEFE e ausência de Roxo/Indigo).
- [x] Executar build de produção do Next.js: `pnpm build` para garantir ausência de avisos ou quebras de tipos.
