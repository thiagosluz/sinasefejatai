# Sistema Integrado SINASEFE JATAÍ

Portal Público e Painel Administrativo ("Retaguarda") desenvolvidos para a Seção Sindical Jataí do SINASEFE. O sistema foca em transparência, gestão de base e eficiência burocrática, com um Design System "Retro-Editorial" e infraestrutura serverless na nuvem.

![Next.js](https://img.shields.io/badge/Next.js-16.2-black?logo=next.js)
![Supabase](https://img.shields.io/badge/Supabase-DB_&_Auth-3ECF8E?logo=supabase)
![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-v4-38B2AC?logo=tailwind-css)
![Licença](https://img.shields.io/badge/License-MIT-blue.svg)

## 🛡️ Segurança e Auditoria

O sistema foi desenhado com foco total em rastreabilidade e proteção de dados:
- **DAL (Data Access Layer)**: Todas as Server Actions passam por uma verificação rigorosa `requireAdmin()` impedindo mutações não autorizadas (CSRF e manipulação via terminal).
- **Triggers Nativos**: Inserções, edições e exclusões nas tabelas críticas (`filiados`, `assembleias`, `financeiro`, etc) geram automaticamente um snapshot em JSON na tabela de `audit_logs` pelo próprio PostgreSQL, sem intervenção do backend.
- **Log Centralizado (`Pino`)**: Todos os erros de sistema e acessos sensíveis mascaram senhas e informações pessoais (PII) antes de serem impressos no console.

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
