# Documentação de Arquitetura - SINASEFE Jataí

Este documento descreve as decisões arquiteturais, o stack de tecnologia e a organização de código do sistema unificado do SINASEFE Jataí (Portal Público e Painel Administrativo).

## 1. Visão Geral

O sistema é um portal web e aplicativo de gestão de retaguarda focado em centralizar as operações burocráticas, financeiras e de transparência do sindicato. Ele serve a dois públicos distintos:
- **Público (Filiados e Visitantes):** Acesso a notícias, histórico de gestões, transparência básica e formulário de pedido de filiação.
- **Privado (Diretoria e Secretaria):** Painel administrativo para gerir filiados, caixa, atas, editais e configurações de documentos.

## 2. Stack Tecnológico

- **Framework:** [Next.js (App Router)](https://nextjs.org) (React 19)
- **Estilização:** [Tailwind CSS v4](https://tailwindcss.com) e componentes baseados no ecossistema [Lucide React](https://lucide.dev) para iconografia.
- **Banco de Dados & Autenticação:** [Supabase](https://supabase.com) (PostgreSQL) com `@supabase/ssr` para autenticação segura baseada em cookies no lado do servidor.
- **Tipagem:** TypeScript rigoroso.
- **Identidade Visual:** Design System "Retro-Editorial" focado em paletas institucionais (creme, tinto, ink) e fontes serifadas para documentos oficiais.

## 3. Padrões e Decisões de Código

### Server Components vs Client Components
Por padrão, toda página de rota (`page.tsx`) é um Server Component que busca os dados no Supabase e gerencia autorização (redirects).
Para evitar sobrecarga de estado no servidor e manter a performance, as interações ricas de UI (formulários, filtros, modais) são delegadas a componentes Client anexos (geralmente nomeados como `modulo-cliente.tsx`).

### Server Actions
A manipulação de dados (mutations como Create, Update, Delete) é feita unicamente via Server Actions (arquivos `actions.ts` dentro de cada módulo). Isso remove a necessidade de construir e manter rotas de API REST tradicionais, permitindo chamadas diretas de funções assíncronas a partir dos botões do frontend.

### Row Level Security (RLS)
O banco de dados PostgreSQL roda sob políticas estritas de segurança em nível de linha:
- O perfil `anon` (usuários não logados) só possui permissões de leitura (SELECT) em tabelas públicas (como `configuracoes` e `diretoria`) e escrita limitada (INSERT) apenas para pedidos de filiação e mensagens de contato.
- O perfil `authenticated` (diretoria) tem acesso total a todos os dados corporativos.

## 4. Módulos do Sistema

### 4.1. Painel de Controle (Dashboard)
Agregador de KPIs e links rápidos para os módulos vitais. Exibe também qual operador (e-mail) está logado.

### 4.2. Gestão de Filiados
- **Escopo:** Controle da base (SIAPE, Campus, Situação, Status de Filiação).
- **Portal Público:** Permite ao próprio usuário preencher sua ficha de filiação online, caindo numa fila de aprovação (status `pendente`) para a diretoria avaliar.

### 4.3. Atos & Assembleias
- **Escopo:** Agendamento de reuniões (Ordinárias/Extraordinárias), definição de pautas e público-alvo (Filiados ou Todos os Servidores).
- **Atas e Presenças:** Permite redação de ata rica e registro de lista de presença.

### 4.4. Livro Caixa (Financeiro)
- **Escopo:** Controle de fluxo financeiro (Entradas e Saídas).
- **Comprovantes:** Upload de comprovantes em PDF/Imagens direto para um Supabase Storage Bucket.
- **Importação:** Mecanismo desenhado para suportar o recebimento futuro de dados via OFX.

### 4.5. Diretoria & Gestões (Histórico)
- **Escopo:** Manter a transparência sobre quem compõe a atual e as passadas diretorias (cargos estatutários e extras).
- **Paridade:** Reflete politicamente as coordenações e secretarias (ex: Coordenador(a) Geral).

### 4.6. Locais & Configurações de Layout
- **Escopo:** Parametrização global. Permite à própria diretoria alterar o endereço do sindicato, gestão e logo sem necessitar de alteração no código fonte. Todos os documentos gerados pelo sistema buscam os "timbres oficiais" desta configuração central.
