# Documentação de Arquitetura - SINASEFE JATAÍ

Este documento descreve as decisões arquiteturais, o stack de tecnologia e a organização de código do sistema unificado do SINASEFE JATAÍ (Portal Público e Painel Administrativo).

## 1. Visão Geral

O sistema é um portal web e aplicativo de gestão de retaguarda focado em centralizar as operações burocráticas, financeiras e de transparência do sindicato. Ele serve a dois públicos distintos:
- **Público (Filiados e Visitantes):** Acesso a notícias, histórico de gestões, transparência básica e formulário de pedido de filiação.
- **Privado (Diretoria, Secretaria e Conselho Fiscal):** Painel administrativo para gerir filiados, caixa, atas, editais, documentos e aprovação de contas.

## 2. Stack Tecnológico

- **Framework:** [Next.js (App Router)](https://nextjs.org) (React 19)
- **Estilização:** [Tailwind CSS v4](https://tailwindcss.com) e componentes baseados no ecossistema [Lucide React](https://lucide.dev) para iconografia.
- **Banco de Dados & Autenticação:** [Supabase](https://supabase.com) (PostgreSQL) com `@supabase/ssr` para autenticação segura baseada em cookies no lado do servidor.
- **Tipagem:** TypeScript rigoroso.
- **Testes:** Vitest (unitários/integração), Playwright (E2E).
- **Identidade Visual:** Design System "Retro-Editorial" focado em paletas institucionais (creme, tinto, ink) e fontes serifadas para documentos oficiais.

## 3. Padrões e Decisões de Código

### Server Components vs Client Components
Por padrão, toda página de rota (`page.tsx`) é um Server Component que busca os dados no Supabase e gerencia autorização (redirects).
Para evitar sobrecarga de estado no servidor e manter a performance, as interações ricas de UI (formulários, filtros, modais) são delegadas a componentes Client anexos (geralmente nomeados como `modulo-cliente.tsx`).

### Server Actions & Segurança (DAL)
A manipulação de dados (mutations como Create, Update, Delete) é feita unicamente via Server Actions (arquivos `actions.ts` dentro de cada módulo). Para garantir a integridade, o sistema usa o padrão **DAL (Data Access Layer)**: todo arquivo de mutação administrativa DEVE chamar validadores de permissão de acesso e autenticação para evitar ataques CSRF ou invasão de endpoint.

### Processamento em Background (Edge Functions)
Para operações demoradas que correm o risco de estourar o timeout (15s na Vercel Hobby / Free), o sistema emprega **Supabase Edge Functions** (`supabase/functions/`). Elas processam tarefas pesadas em background de forma assíncrona ("fire-and-forget") acionando requisições REST independentes sem travar a interface. Por exemplo, o disparo em lote de emails com anexos para centenas de filiados é orquestrado destas funções utilizando a API Rest do Resend.

### Logs e Auditoria
- **Application Logger:** É TERMINANTEMENTE proibido o uso de `console.log` para depuração no backend em produção. O sistema utiliza a biblioteca Pino configurada em `src/lib/logger.ts`, que mascara automaticamente (Redaction) e-mails, tokens, e dados sensíveis de filiados para evitar vazamentos de logs de container.
- **Triggers Passivos:** A auditoria de modificações em tabelas ("quem apagou", "quem editou") **não é** feita no código TypeScript para evitar falha humana. Nós utilizamos `Triggers` no PostgreSQL (`process_audit_log()`) que rodam em background, interceptam qualquer alteração e salvam os deltas completos em JSON na tabela `audit_logs`.

### Controle de Acesso Baseado em Perfis (RBAC) & Row Level Security (RLS)
A autenticação do Supabase (Auth) não possui campos granulares de permissão, por isso criamos a tabela auxiliar de segurança `perfis`.
O sistema atua com 4 níveis lógicos de perfil: `superadmin`, `diretoria`, `conselho_fiscal` e `filiado`.
O banco de dados PostgreSQL roda sob políticas estritas de segurança em nível de linha (RLS):
- O perfil `anon` (visitantes) só possui permissões de leitura (SELECT) em tabelas públicas (como `configuracoes`, `diretoria` e `publicacoes`) e escrita limitada (INSERT) para pedidos de contato/filiação.
- O perfil de `diretoria` / `superadmin` tem acesso total à gestão principal do sistema, **exceto nas ações do Parecer Fiscal**, onde a `diretoria` possui acesso estritamente **somente-leitura** (read-only).
- O perfil de `conselho_fiscal` possui acesso segmentado à avaliação e emissão de pareceres no fluxo financeiro, possuindo exclusividade para **Aprovar, Rejeitar, Devolver com Ressalvas ou Cancelar** um Parecer Fiscal.

A validação de perfis (ex: `requireConselhoFiscal()`) é rigorosamente aplicada na camada **Server Actions (DAL)**, de forma que ações do Conselho Fiscal não podem ser disparadas pela Diretoria mesmo que o botão estivesse visível ou as rotas API fossem forçadas.

### Autenticação de Dois Fatores (2FA / TOTP)
O sistema implementa nativamente o MFA (Multi-Factor Authentication) do Supabase Auth. Administradores e operadores podem parear a conta com aplicativos autenticadores (Google Authenticator, Authy), ativando o Assurance Level 2 (AAL2). O fluxo de login (`/login`) intercepta o processo, validando a necessidade do token de 6 dígitos antes de conceder sessão válida para o dashboard.

## 4. Módulos do Sistema

### 4.0. Meu Perfil & Segurança
- **Escopo:** Central individual do usuário logado acessível via Header. Permite a troca do nome de exibição, senha de acesso e habilitação/desabilitação de MFA (2FA).
- **Avatares:** Upload nativo de fotos de perfil conectadas ao Supabase Storage (bucket `avatars`), gerenciando fotos redimensionadas que acompanham toda a sessão do operador.

### 4.1. Painel de Controle (Dashboard)
Agregador de KPIs e links rápidos para os módulos vitais. Exibe também qual operador está logado.

### 4.2. Gestão de Filiados
- **Escopo:** Controle avançado da base sindical (dados pessoais, funcionais, SIAPE, contatos e endereços normalizados via BrasilAPI).
- **Portal Público e Painel Administrativo:** Permite ao próprio usuário preencher a ficha de filiação online ou à secretaria adicionar o filiado, caindo em uma fila de aprovação.
- **Importação em Lote:** Permite migrar a base a partir de planilhas `.xls`/`.xlsx`/`.csv` de sistemas externos, utilizando bibliotecas de client-side (XLSX) e inserção unificada.
- **Armazenamento de Anexos:** Cada filiado tem capacidade de ter seu PDF/Imagem de ficha de filiação ou desfiliação assinado armazenado em nuvem (`documentos_filiados`), com acesso direto pela tabela.

### 4.3. Atos & Assembleias
- **Escopo:** Agendamento de reuniões (Ordinárias/Extraordinárias), definição de pautas e público-alvo.
- **Atas e Presenças:** Permite redação de ata rica e registro de lista de presença.
- **Portal Público:** Página pública com histórico de assembleias filtradas por ano e detalhamento individual com documentos públicos anexados.

### 4.4. Livro Caixa (Financeiro), Categorias Dinâmicas & Hard Lock
- **Escopo:** Controle de fluxo financeiro (Entradas e Saídas) com categorias normalizadas e relacionais.
- **Categorias Dinâmicas:** As categorias de transações (`financeiro_categorias`) são gerenciadas via CRUD administrativo (`/admin/financeiro/categorias`), permitindo que a diretoria cadastre, edite, ative e desative categorias sem necessidade de alteração no código. A tabela `financeiro` referencia `categoria_id` (FK) ao invés de texto livre, garantindo integridade referencial.
- **Importação OFX:** O sistema permite importar extratos bancários no formato OFX (Open Financial Exchange), classificando automaticamente as transações com as categorias dinâmicas existentes. Transações duplicatas são detectadas e ignoradas via campo `banco_id` (UNIQUE).
- **Comprovantes:** Upload de comprovantes em PDF/Imagens direto para um Supabase Storage Bucket.
- **Hard Lock Triggers:** O sistema implementa uma camada de proteção nativa em BD (Trigger) onde, se um determinado mês financeiro tiver a "Prestação de Contas Aprovada" pelo Conselho Fiscal, nenhuma transação deste mês poderá ser criada, excluída ou editada, nem por administradores do banco.

### 4.5. Conselho Fiscal & Parecer Mensal
- **Escopo:** O Conselho Fiscal avalia o fechamento do caixa do mês via sistema.
- **Fluxo:** O sistema compila automaticamente os saldos do mês, junta os comprovantes de despesas e cria um documento que transita por uma máquina de estados: `AGUARDANDO_ASSINATURAS` -> `COM_RESSALVAS` / `REJEITADO` / `APROVADO`. Cada conselheiro logado pode assinar digitalmente o parecer até o número total de conselheiros da gestão ser batido, bloqueando o mês.

### 4.6. Documentos Administrativos e Publicações
- **Escopo:** Emissão e versionamento digital de Recibos, Ofícios, Memorandos, Portarias, Certificados, Declarações e Resoluções. Os documentos possuem ciclos de vida como "ativo", "cancelado" ou "revogado" (este último útil para resoluções normativas que substituem antigas).
- **Publicações:** Todo e qualquer material público do sindicato que não for um documento interno vai para o portal transparência (Publicações). 
- **Assinatura Eletrônica:** Utiliza o sistema interno nativo com as tabelas `documento_verificacoes` e `documento_assinaturas`. Ele gera Lacres de Autenticidade únicos vinculando códigos numéricos e alfanuméricos a hashes criptografados de UUIDs (`/autenticar-documento`), recebendo digitalmente as assinaturas dos operadores e imprimindo-as visualmente no rodapé e margem dos documentos exportados em PDF.

### 4.7. Diretoria & Gestões (Histórico)
- **Escopo:** Manter a transparência sobre quem compõe a atual e as passadas diretorias.

### 4.8. Locais & Configurações de Layout
- **Escopo:** Parametrização global e configuração de Timbres (Header corporativo dinâmico) para documentos em PDF impressos ou online.

### 4.9. Auditoria (Logs)
- **Escopo:** Painel de visualização ("Fichário Físico") imutável para a diretoria enxergar todas as movimentações críticas da plataforma. Retenção automática de 1 ano via PG Cron.

## 5. Estrutura de Testes

O projeto segue a pirâmide de testes clássica:

### Testes Unitários & Integração (Vitest)
- **Server Actions:** Todas as ações de mutação de dados (`actions.ts`) possuem testes que mocam o Supabase client, verificando validações de campos, parsing de valores e fluxos de upload de arquivo.
- **Componentes UI:** Componentes interativos (`financeiro-form-drawer`, `assembleia-card`, `modal-provider`) possuem testes de rendering e interação via Testing Library.
- **Utilitários:** Parsers (OFX, datas), loaders de imagem e helpers de ação possuem testes unitários puros.

### Testes End-to-End (Playwright)
- Cobrem os fluxos críticos completos: login, dashboard, CRUD de assembleias, diretoria, filiados, financeiro, configurações, documentos e portal público.
- Executam contra o banco de dados real com limpeza automática via Global Setup/Teardown.
- **Comando:** `pnpm test:e2e`

### Pipeline de Verificação
A validação completa do projeto é feita com:
```bash
pnpm lint && pnpm test && pnpm test:e2e && pnpm tsc --noEmit && pnpm build
```
