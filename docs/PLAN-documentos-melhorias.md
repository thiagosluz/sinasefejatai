# Overview
Aprimoramento do Módulo de Documentos com foco na usabilidade, navegabilidade e automação da geração de registros. Implementação de busca com paginação e filtros via Server-Side (URL Params) e geração da numeração sequencial dos recibos em TypeScript, conforme decidido no Brainstorm.

## Project Type
WEB

## Success Criteria
- A listagem de documentos aceita busca por título ou número, e filtros por mês/ano.
- A listagem é paginada e os filtros/paginação refletem instantaneamente na URL (ex: `?q=joao&ano=2026&mes=05&page=1`).
- Os componentes de busca utilizam os hooks do Next.js App Router (Server Components para query, Client para interações).
- Novos recibos (quando salvos pelo `actions.ts`) recebem automaticamente um número no formato `Nº XXX/ANO`.
- O incremento da numeração de recibos considera apenas os recibos *não cancelados* daquele ano para encontrar o valor máximo.

## Tech Stack
- Next.js App Router
- Supabase (Postgres Database)
- TailwindCSS

## File Structure
- `src/app/(admin)/admin/documentos/page.tsx` (modificar: Queries no Supabase, paginação e UI dos filtros)
- `src/app/(admin)/admin/documentos/actions.ts` (modificar: Lógica de geração de sequencial antes do insert)

## Task Breakdown

- `[ ]` **Task 1: Numeração Sequencial Automática no Recibo**
  - **Agent:** backend-specialist
  - **Skills:** clean-code, api-patterns
  - **Priority:** P1
  - **INPUT:** Request para a Server Action `salvarDocumentoAdministrativo`.
  - **OUTPUT:** Consulta ao Supabase buscando o registro de `tipo='recibo_pagamento'` com maior `numero` (que contém o ano da emissão atual) e que não seja `status='cancelado'`. Processar a string gerando `001/2026`, `002/2026`, etc. Salvar no banco.
  - **VERIFY:** Emitir dois recibos via interface e constatar as numerações `001/2026` e `002/2026` no banco. Cancelar o último e emitir mais um para verificar se ele pega `002` novamente ou `003` (depende da regra, usualmente continua sendo emitido em `003` para não perder histórico de pulo, mas a regra aqui foca no maior + 1). *Ajuste: A regra diz "baseando-se no último emitido não cancelado", portanto, acha o Max e soma 1.*

- `[ ]` **Task 2: Query no Supabase com Paginação e SearchParams**
  - **Agent:** backend-specialist
  - **Skills:** database-design, nextjs-react-expert
  - **Priority:** P1
  - **INPUT:** Leitura dos `searchParams` na `page.tsx`.
  - **OUTPUT:** Construção da query dinâmica para tabela `documentos_administrativos` usando as funções de paginação `.range()`, busca textual `.ilike()` no título ou `.eq()` no número, e `.gte()/.lt()` para limite de data/mês, além do sort decrescente.
  - **VERIFY:** Alterar manualmente a URL para `?page=2` ou `?q=teste` e observar a tabela atualizar os dados.

- `[ ]` **Task 3: Interface de Filtros de Documentos**
  - **Agent:** frontend-specialist
  - **Skills:** frontend-design, sinasefe-modals
  - **Priority:** P2
  - **Dependencies:** Task 2
  - **INPUT:** Componente `<input type="text" />` já existente na página e tabela de documentos.
  - **OUTPUT:** Criar subcomponente Client `DocumentosFiltros` que possui inputs (Texto, Dropdowns de Mês/Ano). Adicionar eventos `onChange` e debouncing para atualizar os `searchParams` (`useRouter` e `usePathname`).
  - **VERIFY:** Clicar nos campos, digitar e selecionar valores. Verificar se a URL reflete as opções instantaneamente e a tabela traz as respostas sem quebra de estado.

## Phase X: Verification
- `[ ]` P0: Lint & Type Check (`npm run lint && npx tsc --noEmit`)
- `[ ]` Executar emissão manual de recibos para validar a regra.
- `[ ]` Garantir integridade da ordenação ao buscar.
