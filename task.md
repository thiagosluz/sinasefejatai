# Gestão de Acessos e Usuários

- [x] 1. Banco de Dados (PostgreSQL)
  - [x] Criar arquivo de migration para a tabela `perfis`.
  - [x] Adicionar coluna `filiado_id` na tabela `gestao_membros`.
  - [x] Executar migration no Supabase local/remoto (Delegado ao usuário via script).
  - [x] Injetar Perfil de Superadmin manualmente para o usuário base (`filhodaluz8@gmail.com`).
  - [x] Atualizar `docs/setup_completo.sql` para refletir as novas tabelas permanentemente.

- [x] 2. Backend & Segurança (DAL)
  - [x] Atualizar `src/lib/dal.ts` para verificar a `role` na tabela `perfis` em `requireAdmin()`.
  - [x] Criar `src/app/(admin)/admin/usuarios/actions.ts` com as rotinas de listar, convidar e remover acesso.
  - [x] Criar utilitário Supabase Admin no servidor (`src/lib/supabase/admin.ts`) que utilize a `SUPABASE_SERVICE_ROLE_KEY`.

- [x] 3. Frontend (UI)
  - [x] Criar `src/app/(admin)/admin/usuarios/page.tsx` (Tabela de listagem).
  - [x] Criar `src/app/(admin)/admin/usuarios/components/invite-user-modal.tsx` (Formulário de convite com busca de Filiado opcional).
  - [x] Adicionar botão "Usuários" no menu lateral (Sidebar) do Admin.
  - [x] Atualizar formulário de `gestao_membros` para ter o seletor opcional de `filiado_id`.

- [x] 4. Verificação
  - [x] Verificar linting e tipagem.
