# PLAN-middleware-to-proxy.md - Migração do Middleware para Proxy no Next.js 16

Este documento serve como mapa de execução serial para realizar a migração da convenção obsoleta de middleware para a nova convenção de proxy introduzida no Next.js 16.

## Overview
O Next.js 16 descontinuou a convenção do arquivo `middleware.ts` em favor de `proxy.ts`. Esse arquivo atua como uma fronteira de rede na frente do aplicativo para interceptar e processar requisições (como autenticação, redirecionamentos e cabeçalhos). Este plano descreve a migração segura e verificação da nova convenção.

- **Project Type:** WEB (Next.js Application)
- **Primary Agent:** `backend-specialist` (para lógica de interceptação/autenticação) + `frontend-specialist` (para verificação de rotas/redirecionamentos) + `test-engineer` (para verificação automatizada)

---

## Success Criteria

1. **Eliminação do Warning:** O aviso `⚠ The "middleware" file convention is deprecated` não deve mais aparecer ao iniciar o servidor de desenvolvimento (`pnpm dev`).
2. **Autenticação Funcional:** A proteção de rotas no Supabase (`/admin/*`) deve continuar funcionando exatamente como antes, redirecionando usuários não autenticados para `/login`.
3. **Redirecionamento de Login:** Usuários autenticados que tentarem acessar `/login` ou `/` devem ser redirecionados para `/dashboard`.
4. **Sem Regressões:** O build do Next.js (`pnpm build`) deve ser concluído com sucesso e sem erros de tipos.

---

## Relação de Arquivos (File Structure)

```plaintext
sinasefejatai/
├── docs/
│   ├── PLAN-gestao-sinasefe.md        # Plano original
│   └── PLAN-middleware-to-proxy.md   # Este plano de migração
└── src/
    ├── app/
    ├── lib/
    │   └── supabase/
    │       ├── client.ts
    │       ├── server.ts
    │       └── middleware.ts          # Utilitário de sessão (opção: renomear para proxy.ts)
    ├── proxy.ts                       # [NEW] Nova convenção de proxy (substitui middleware.ts)
    └── middleware.ts                  # [DELETE] Antiga convenção descontinuada
```

---

## Cronograma de Tarefas (Task Breakdown)

### Fase 1: Análise e Preparação
- [x] **Task 1.1: Mapear e Documentar Referências**
  - **Agent:** `explorer-agent` | **Skill:** `clean-code`
  - **Input:** Arquivos do projeto contendo a palavra `middleware`.
  - **Output:** Confirmação de todas as referências no codebase.
  - **Verify:** Rodar busca por texto e certificar que apenas `src/middleware.ts`, `src/lib/supabase/middleware.ts` e arquivos de configuração/documentação contêm o termo.

### Fase 2: Implementação e Refatoração
- [x] **Task 2.1: Criar o novo arquivo `src/proxy.ts`**
  - **Agent:** `backend-specialist` | **Skill:** `clean-code`
  - **Input:** Lógica existente de `src/middleware.ts`.
  - **Output:** Novo arquivo `src/proxy.ts` exportando a função `proxy` e as configurações de `matcher`.
  - **Verify:** O arquivo deve exportar `async function proxy(...)` em vez de `middleware(...)`.

- [x] **Task 2.2: Remover o antigo `src/middleware.ts`**
  - **Agent:** `backend-specialist` | **Skill:** `clean-code`
  - **Input:** Arquivo `src/middleware.ts` obsoleto.
  - **Output:** Remoção física do arquivo `src/middleware.ts`.
  - **Verify:** Certificar-se de que o arquivo não existe mais na pasta `src/`.

- [x] **Task 2.3: Atualizar Referências Internas (Opcional)**
  - **Agent:** `backend-specialist` | **Skill:** `clean-code`
  - **Input:** Comentários ou arquivos auxiliares como `src/lib/supabase/middleware.ts`.
  - **Output:** Renomeação ou ajuste de comentários e arquivos para manter o padrão "proxy" consistente em toda a estrutura da aplicação.
  - **Verify:** Todos os imports e logs atualizados com sucesso.

### Fase 3: Verificação de Funcionamento
- [x] **Task 3.1: Validação do Servidor de Desenvolvimento**
  - **Agent:** `test-engineer` | **Skill:** `webapp-testing`
  - **Input:** Executar `pnpm dev`.
  - **Output:** Log do servidor rodando sem warnings de middleware deprecado.
  - **Verify:** Iniciar o servidor e observar a saída do terminal.

- [x] **Task 3.2: Validação de Proteção de Rotas**
  - **Agent:** `test-engineer` | **Skill:** `webapp-testing`
  - **Input:** Tentativas de acesso manual a `/dashboard`, `/filiados`, `/login` e `/`.
  - **Output:** Comportamento correto de redirecionamento (redirecionar para `/login` se deslogado; redirecionar para `/dashboard` se logado).
  - **Verify:** Verificar os status HTTP 307/302 nos redirecionamentos.

---

## Phase X: Verification Checklist

Executaremos os scripts de auditoria antes de marcar as tarefas como finalizadas:
- [x] Executar o checklist rápido de código: `python .agent/scripts/checklist.py .`
- [x] Executar build de produção do Next.js: `pnpm build` para garantir ausência de avisos ou quebras de tipos.
- [x] Garantir que o warning `The "middleware" file convention is deprecated` não seja exibido.

### ✅ PHASE X COMPLETE
- Lint: ✅ Pass
- Security: ✅ Pass
- Build: ✅ Success
- Date: 2026-05-23
