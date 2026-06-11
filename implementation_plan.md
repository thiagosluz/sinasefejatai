# Implementação de Gestão de Acessos e Usuários (Opção A)

O objetivo deste plano é estruturar a gestão de acessos e permissões do sistema, criando vínculos entre o sistema de login (Supabase Auth), o cadastro do sindicato (Filiados) e os ocupantes de cargos na diretoria (Membros da Gestão).

> [!IMPORTANT]
> **User Review Required**
> 
> A criação de novos logins diretamente pelo painel administrativo (enviando um convite por e-mail sem que a pessoa precise se cadastrar sozinha) requer privilégios administrativos no Supabase. Para isso, o sistema precisa da **Service Role Key**.

> [!WARNING]
> **Open Question:** 
> Você possui a `SUPABASE_SERVICE_ROLE_KEY` do seu projeto no Supabase (`lwnrctksvlzhlzldelit`)? 
> Precisaremos adicioná-la no arquivo `.env.local` para que o painel consiga criar os logins da diretoria.

---

## Proposed Changes

### 1. Banco de Dados (PostgreSQL)

Criação da tabela de Perfis para atuar como o elo de segurança do sistema.

#### [NEW] Supabase Migration
- Criaremos uma migration em `supabase/migrations/` contendo:
  - Tabela `perfis`:
    - `id` (UUID, Chave Primária, FK para `auth.users` ON DELETE CASCADE)
    - `role` (Texto, CHECK: 'superadmin', 'diretoria', 'filiado')
    - `filiado_id` (UUID, FK para `filiados` ON DELETE SET NULL)
  - Tabela `gestao_membros` (Alteração):
    - Adicionar coluna `filiado_id` para criar a cadeia completa (User -> Perfil -> Filiado <- Gestão).
  - Atualização de Políticas (RLS):
    - Apenas o Superadmin pode criar novos perfis (e diretores podem apenas visualizar a lista).

---

### 2. Backend & Segurança (Data Access Layer)

Modificações na camada que protege o sistema (Next.js Server Actions).

#### [MODIFY] [src/lib/dal.ts](file:///c:/Users/thiago/Documents/Projetos/sinasefejatai/src/lib/dal.ts)
- Evoluir a função `requireAdmin()` (que hoje apenas verifica se o usuário está logado) para buscar o perfil na tabela `perfis`.
- Impedir o acesso caso o usuário não tenha a `role` `'superadmin'` ou `'diretoria'`.

#### [NEW] `src/app/(admin)/admin/usuarios/actions.ts`
- Criar a lógica de servidor para o painel de usuários:
  - `listarUsuarios()`
  - `convidarUsuario(email, role, filiado_id)`: Utiliza o `@supabase/supabase-js` com a `service_role` para enviar o convite de acesso.
  - `removerAcesso(id)`

---

### 3. Frontend (UI do Painel Admin)

Criação das interfaces de gestão.

#### [NEW] `src/app/(admin)/admin/usuarios/page.tsx`
- Tabela administrativa listando todos os usuários do sistema, indicando o papel (Superadmin / Diretoria) e se estão vinculados a algum filiado.
  
#### [NEW] `src/app/(admin)/admin/usuarios/components/invite-user-modal.tsx`
- Modal (usando o `useModal` padrão do sistema) contendo um formulário:
  - E-mail
  - Nível de Acesso (Superadmin ou Diretoria)
  - Busca opcional por um Filiado para amarrar o login.

---

## Verification Plan

### Automated Tests
- Testes Unitários: Mock da Service Role para validar criação do perfil.
- Testes E2E (Playwright): Simular acesso bloqueado (403) para um usuário sem perfil de `diretoria`, e sucesso para um usuário com perfil correto.

### Manual Verification
1. Subiremos as migrations.
2. Criarei um Perfil de "Superadmin" na mão associado ao seu e-mail (`filhodaluz8@gmail.com`), para não perdermos o acesso.
3. Testaremos o disparo do convite para um e-mail de teste no painel para ver se o login é criado e associado corretamente a um Filiado.
