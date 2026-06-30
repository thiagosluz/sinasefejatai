# Sistema Integrado SINASEFE JATAÍ

Portal Público e Painel Administrativo ("Retaguarda") desenvolvidos para a Seção Sindical Jataí do SINASEFE. O sistema foca em transparência, gestão de base e eficiência burocrática, com um Design System "Retro-Editorial" e infraestrutura serverless na nuvem.

![Next.js](https://img.shields.io/badge/Next.js-16.2-black?logo=next.js)
![Supabase](https://img.shields.io/badge/Supabase-DB_&_Auth-3ECF8E?logo=supabase)
![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-v4-38B2AC?logo=tailwind-css)
![Upstash QStash](https://img.shields.io/badge/Upstash_QStash-Cron_Jobs-00E9A3?logo=upstash)
![Vitest](https://img.shields.io/badge/Vitest-Tests-6E9F18?logo=vitest)
![Playwright](https://img.shields.io/badge/Playwright-E2E-2EAD33?logo=playwright)
![Licença](https://img.shields.io/badge/License-MIT-blue.svg)

## 📋 Principais Módulos

| Módulo | Descrição |
|--------|-----------|
| **Dashboard** | KPIs e links rápidos para os módulos vitais |
| **Filiados** | Gestão da base sindical (SIAPE, etc.), Atualização Cadastral Autônoma por link seguro (Fluxo Maker-Checker), Automação de envio de E-mails de Aniversário (via QStash), upload de ficha assinada e importação em lote |
| **Assembleias** | Agendamento, pautas, atas, lista de presença, disparos de edital em background (Edge Functions) e portal público |
| **Boletins** | Envio em lote assíncrono via Brevo (SMTP), filtros avançados com Server-Side Rendering e controle antiduplicação de disparos |
| **Financeiro** | Livro Caixa com categorias dinâmicas, importação OFX e comprovantes |
| **Categorias Financeiras** | CRUD administrativo para categorias de entrada/saída |
| **Conselho Fiscal** | Avaliação e aprovação mensal de prestação de contas |
| **Documentos** | Emissão de Recibos, Ofícios, Memorandos, Portarias, Certificados, Declarações e Resoluções com assinatura eletrônica e Lacre de Autenticidade |
| **Publicações** | Portal de transparência para materiais públicos |
| **Diretoria** | Histórico de gestões e membros com fotos |
| **Auditoria** | Logs imutáveis via Triggers PostgreSQL com retenção de 1 ano |

## 🎨 UI e Dependências de Ícones

O sistema utiliza o `lucide-react` para a maioria dos ícones de interface.
**Regra Importante:** O Lucide removeu o suporte a ícones de marcas (como Instagram, Facebook, Twitter) para evitar problemas de licenciamento.
Para adicionar ícones de redes sociais ou marcas (ex: Portal Público e Contato), **utilize componentes SVG customizados** na própria página ou em `/components`, não os importe de bibliotecas externas para evitar dependências quebradas.

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
- [Script SQL Master (Setup Banco de Dados)](./docs/setup_completo.sql)

## 🚀 Como Executar o Projeto Localmente

Certifique-se de ter o Node.js e o `pnpm` instalados na sua máquina. Você também vai precisar do [Supabase CLI](https://supabase.com/docs/guides/cli) para rodar ou fazer deploy de Edge Functions.

### Variáveis de Ambiente
O projeto depende de variáveis no arquivo `.env.local`:
```env
NEXT_PUBLIC_SUPABASE_URL=sua-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=sua-anon-key
SUPABASE_SERVICE_ROLE_KEY=sua-service-key # Opcional, para scripts administrativos

# Para o envio de e-mails via Brevo SMTP
SMTP_HOST=smtp-relay.brevo.com
SMTP_PORT=587
SMTP_USER=seu-usuario-brevo
SMTP_PASS=sua-senha-brevo

# Para a automação de Cron Jobs (Upstash QStash)
QSTASH_URL=https://qstash.upstash.io/api/v1
QSTASH_TOKEN=seu_token_aqui
QSTASH_CURRENT_SIGNING_KEY=sua_chave_atual
QSTASH_NEXT_SIGNING_KEY=sua_proxima_chave
```

1. Instale as dependências:
```bash
pnpm install
```

2. (Opcional) Deploy das Edge Functions no Supabase:
```bash
npx supabase functions deploy --no-verify-jwt
npx supabase secrets set RESEND_API_KEY=suachave EDGE_FUNCTION_SECRET=suachave
```

3. Rode o servidor de desenvolvimento:
```bash
pnpm run dev
```

4. Acesse no navegador:
Abra [http://localhost:3000](http://localhost:3000) para ver o Portal Público, ou navegue para [http://localhost:3000/login](http://localhost:3000/login) para acessar o Painel Administrativo.

## 📝 Licenciamento e Contribuição

Este é um projeto proprietário construído para o **SINASEFE JATAÍ/GO**.

Para implementações futuras e débitos técnicos, consulte o [ROADMAP do Projeto](ROADMAP.md).

Este projeto é open-source e está sob a [Licença MIT](./LICENSE). Isso significa que outros sindicatos e entidades podem usá-lo livremente, desde que mantenham os créditos originais.
