# Implementação da Gestão de Acessos e Usuários 🛡️

A etapa de implementação da gestão de níveis de acesso do SINASEFE JATAÍ (Opção A aprovada) foi concluída com sucesso!

Aqui está um resumo completo do que foi alterado e como testar as novas configurações.

---

## 1. Banco de Dados Atualizado
- **Tabela `perfis` Criada**: Agora ela atua como uma ponte entre o `auth.users` (contas do Supabase) e a nossa base, armazenando o nível de acesso (`role`) e um possível vínculo com o cadastro do sindicato (`filiado_id`).
- **Tabela `gestao_membros` Atualizada**: Adicionado o campo `filiado_id` para permitir vincular uma pessoa eleita para a diretoria a um filiado de fato.
- **Auditoria & RLS**: Configuramos o registro de log automático para as mudanças em acessos e protegemos a tabela para que apenas o `superadmin` ou o nosso _backend admin_ consigam alterá-la.

## 2. Bloqueio de Acesso Reforçado (Backend)
- Modificamos a camada de segurança `requireAdmin()` (no `src/lib/dal.ts`).
- **Antes**: O painel só verificava se a pessoa estava logada (qualquer um que criasse uma conta entrava).
- **Agora**: A checagem puxa o perfil do banco e verifica rigorosamente se o usuário logado é `'superadmin'` ou `'diretoria'`. Se não for, as Server Actions negam o acesso sumariamente com uma mensagem de erro 403.

## 3. Painel Administrativo ("Usuários/Acessos")
Construímos a nova tela de gestão de usuários, disponível no menu lateral em **Administrativo > Usuários/Acessos**.

> [!TIP]
> **Modo Somente-Leitura**: Um usuário de nível "Diretoria" vai conseguir visualizar quem tem acesso ao sistema, mas aparecerá um aviso amarelo na tela avisando que ele não pode modificar, convidar ou excluir acessos. Somente você (`superadmin`) verá os botões vermelhos e o de convite.

### Novo Fluxo de Convite (`Service Role`)
Quando você clica em **Convidar Usuário**, o sistema:
1. Utiliza um _client bypass_ do Supabase (`SUPABASE_SERVICE_ROLE_KEY` do `.env.local`) que tem superpoderes no banco.
2. Dispara, de forma invisível, um e-mail com o link mágico (ou link para criação de senha) para o e-mail da pessoa.
3. Cria imediatamente o Perfil correspondente dela com o nível que você selecionou e já amarrado ao `filiado_id` se você tiver escolhido um da lista.

---

## O que você precisa fazer agora (Passos Manuais)

Como nosso terminal estava com erro de conexão com o banco de dados remoto no ambiente local, **os scripts SQL precisam ser rodados por você no painel do Supabase online.**

### Passo 1: Executar a Migration
Abra o **SQL Editor** no painel do seu Supabase (`lwnrctksvlzhlzldelit`) e rode o seguinte script para criar as tabelas:
👉 [Migration: Criação de Perfis](file:///c:/Users/thiago/Documents/Projetos/sinasefejatai/supabase/migrations/20260610215300_create_perfis.sql)

### Passo 2: Injetar seu Superadmin
Em seguida, logo na aba do lado, abra uma nova query SQL e rode este script (ele garante que seu usuário terá a chave-mestra do sistema).
👉 [Manual Seed: Superadmin](file:///c:/Users/thiago/Documents/Projetos/sinasefejatai/supabase/migrations/manual_seed_superadmin.sql)

### Passo 3: Testar!
1. Abra o site em `localhost:3000`.
2. Acesse o menu **Usuários/Acessos** na barra lateral.
3. Teste convidar um e-mail secundário seu ou provisório.
4. Tente acessar o sistema com essa nova conta.

> [!NOTE]
> O arquivo unificado `docs/setup_completo.sql` também já foi atualizado para os futuros _deploys_! Tudo pronto por aqui.
