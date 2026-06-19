# Sistema Integrado SINASEFE JATAÍ

Portal Público e Painel Administrativo ("Retaguarda") desenvolvidos para a Seção Sindical Jataí do SINASEFE. O sistema foca em transparência, gestão de base e eficiência burocrática, com um Design System "Retro-Editorial" e infraestrutura serverless na nuvem.

![Next.js](https://img.shields.io/badge/Next.js-16.2-black?logo=next.js)
![Supabase](https://img.shields.io/badge/Supabase-DB_&_Auth-3ECF8E?logo=supabase)
![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-v4-38B2AC?logo=tailwind-css)
![Vitest](https://img.shields.io/badge/Vitest-Tests-6E9F18?logo=vitest)
![Playwright](https://img.shields.io/badge/Playwright-E2E-2EAD33?logo=playwright)
![Licença](https://img.shields.io/badge/License-MIT-blue.svg)

## 📋 Principais Módulos

| Módulo | Descrição |
|--------|-----------|
| **Dashboard** | KPIs e links rápidos para os módulos vitais |
| **Filiados** | Gestão da base sindical completa (SIAPE, dados pessoais/funcionais e endereço com BrasilAPI), upload de ficha assinada, e importação em lote via Excel (.xls) |
| **Assembleias** | Agendamento, pautas, atas, lista de presença e portal público |
| **Financeiro** | Livro Caixa com categorias dinâmicas, importação OFX e comprovantes |
| **Categorias Financeiras** | CRUD administrativo para categorias de entrada/saída |
| **Conselho Fiscal** | Avaliação e aprovação mensal de prestação de contas |
| **Documentos** | Emissão de Recibos, Ofícios, Memorandos, Portarias, Certificados, Declarações e Resoluções |
| **Publicações** | Portal de transparência para materiais públicos |
| **Diretoria** | Histórico de gestões e membros com fotos |
| **Auditoria** | Logs imutáveis via Triggers PostgreSQL com retenção de 1 ano |

## 🛡️ Segurança e Auditoria

O sistema foi desenhado com foco total em rastreabilidade e proteção de dados:
- **DAL (Data Access Layer)**: Todas as Server Actions passam por uma verificação rigorosa `requireAdmin()` impedindo mutações não autorizadas (CSRF e manipulação via terminal).
- **RBAC com Perfis**: 4 níveis de acesso (`superadmin`, `diretoria`, `conselho_fiscal`, `filiado`) com validação rigorosa na camada de Server Actions.
- **Autenticação de Dois Fatores (MFA/TOTP)**: Suporte nativo ao Google Authenticator / Authy para administradores, exigindo Assurance Level 2 (AAL2) no login.
- **Triggers Nativos**: Inserções, edições e exclusões nas tabelas críticas (`filiados`, `assembleias`, `financeiro`, etc) geram automaticamente um snapshot em JSON na tabela de `audit_logs` pelo próprio PostgreSQL, sem intervenção do backend.
- **Hard Lock Financeiro**: Triggers que impedem qualquer alteração em transações de meses com prestação de contas já aprovada pelo Conselho Fiscal.
- **Log Centralizado (`Pino`)**: Todos os erros de sistema e acessos sensíveis mascaram senhas e informações pessoais (PII) antes de serem impressos no console.

## 🧪 Testes

O projeto possui uma suíte completa de testes automatizados:

```bash
# Testes unitários e de integração (Vitest)
pnpm test

# Testes End-to-End (Playwright)
pnpm test:e2e

# Pipeline completo de verificação
pnpm lint && pnpm test && pnpm test:e2e && pnpm tsc --noEmit && pnpm build
```

## 📚 Documentação Profunda

Toda a documentação analítica e de arquitetura do sistema foi transferida para a pasta `docs/`. Lá você encontrará detalhes técnicos essenciais para desenvolvedores futuros:

- [Visão da Arquitetura e Módulos](./docs/arquitetura.md)
- [Roadmap de Implementações](./docs/roadmap.md)
- [Script SQL Master (Setup Banco de Dados)](./docs/setup_completo.sql)

## 🚀 Como Executar o Projeto Localmente

Certifique-se de ter o Node.js e o `pnpm` instalados na sua máquina. O projeto depende de variáveis de ambiente do Supabase (`NEXT_PUBLIC_SUPABASE_URL` e `NEXT_PUBLIC_SUPABASE_ANON_KEY`) configuradas num arquivo `.env.local`.

1. Instale as dependências:
```bash
pnpm install
```

2. Rode o servidor de desenvolvimento:
```bash
pnpm run dev
```

3. Acesse no navegador:
Abra [http://localhost:3000](http://localhost:3000) para ver o Portal Público, ou navegue para [http://localhost:3000/login](http://localhost:3000/login) para acessar o Painel Administrativo.

## 📝 Licenciamento

Este projeto é open-source e está sob a [Licença MIT](./LICENSE). Isso significa que outros sindicatos e entidades podem usá-lo livremente, desde que mantenham os créditos originais.
