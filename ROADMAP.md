# Roadmap SINASEFE JATAÍ

Este documento centraliza as ideias e sugestões de melhorias futuras para o sistema, servindo como um guia de visão de longo prazo para os módulos existentes e novos.

## 🚀 Infraestrutura & Back-end

### 1. Refatoração Arquitetural e Aplicação do Princípio DRY
- **Formulários de Documentos:** Extração do *boilerplate* de controle de estado (`salvando`, `carregando`) e buscas de edição presentes em 7 formulários distintos para um *Custom Hook* genérico `useDocumentoForm<T>`.
- **Layouts de Impressão:** Unificação dos templates de impressão (`ata-print-layout`, `parecer-fiscal-layout`, etc.) por meio de um componente encapsulador `<DocumentPrintWrapper>`.
- **Dashboard RPC:** Consolidação dos 10 `fetchs` sequenciais no painel inicial em uma única requisição ao banco através de uma RPC / Materialized View PostgreSQL `get_dashboard_stats()`, melhorando o tempo de carregamento e o peso na API.
- **Server Actions HOF:** Padronização global de tratamento de erros das Server Actions com uma função construtora `withActionHandler` para enxugar as chamadas `try/catch`.

## 🏛️ Módulo: Assembleias
O módulo atual gerencia pautas, locais dinâmicos e gera documentos (Ata, Lista de Presença). Ideias para evolução:

### 1. Lista de Presença Digital Rápida (Check-in / QR Code)
* **Mecânica:** O sistema gera um QR Code da Assembleia. O servidor lê o código, insere sua matrícula SIAPE e faz o "Check-in" online. Alternativamente, a secretaria usa uma tela "Expresso" na porta.
* **Benefícios:** Relatórios de presença imediatos com horário exato e fim de falhas na leitura de assinaturas de papel.

### 2. Acervo Digital e Anexos da Assembleia
* **Mecânica:** Área de upload de "Anexos" (Parecer, Prestação de Contas). O sistema gera um link público (ex: `/assembleias/publica/[id]`) que centraliza o Edital e os anexos.
* **Benefícios:** Transparência pré-deliberação e criação de memória institucional forte.

### 3. Votação Eletrônica (Deliberações em Tempo Real)
* **Mecânica:** O Admin abre votação de pauta. Filiados credenciados votam pelo celular. Dashboard atualiza o telão.
* **Benefícios:** Precisão matemática e registro inquestionável.

## 💰 Módulo: Financeiro
### 1. Conciliação de Saldo com Investimentos
Lidar com saldos aplicados em investimentos (frequente no Banco do Brasil):
* **Opção (Recomendada):** Saldo de Investimentos Manual no Fechamento de Caixa. O sistema audita a conta corrente via OFX automaticamente, mas o tesoureiro preenche manualmente o valor global aplicado.
* **Benefício:** O relatório final bate com o extrato oficial sem aumentar excessivamente a complexidade do sistema.

## 👥 Módulo: Portal do Filiado (Autoatendimento)
### 1. Carteirinha Digital de Filiado
* **Mecânica:** O servidor acessa sua "Carteirinha Sindical" com QR Code e foto via sistema.
* **Benefícios:** Fim do custo com PVC e fácil identificação em conveniados.

## ⚖️ Módulo: Atendimento, Jurídico e Ouvidoria
### 1. Abertura de Protocolos e Tickets Jurídicos
* **Mecânica:** Servidor abre um ticket (assédio, dúvida). Sistema gera um `#Protocolo` tratado via Kanban pela diretoria.
* **Benefícios:** Institucionaliza o atendimento, retirando pautas sensíveis do WhatsApp pessoal.

## 🎁 Módulo: Convênios
### 1. Catálogo Público de Parceiros
* **Mecânica:** Cadastro administrativo de empresas conveniadas (descontos, validade). Alimenta o Portal Público.
* **Benefícios:** Forte argumento de atração para novas filiações.

---

## ✅ Épicos Concluídos

### 1. Atualização Cadastral Autônoma (Fluxo Maker-Checker)
- **O que foi feito:** Filiados agora podem solicitar atualizações via link de Token Seguro. As mudanças vão para aprovação da Diretoria (tabela `atualizacoes_cadastrais`) antes de efetivar no banco, com verificação via `createAdminClient` que bypassa o RLS de maneira orquestrada e segura.
- **Impacto:** Desafogamento total da secretaria sindical e modernidade na interação com o usuário final.

### 2. Disparo Automático de Editais e Boletins (AWS SES)
- **O que foi feito:** O gargalo do plano free de envio assíncrono (Resend) foi superado com a implantação na arquitetura Edge Functions da Amazon SES (via Nodemailer `SendRawEmailCommand`).
- **Impacto:** Capacidade massiva e barata de comunicação. Agora os boletins contam também com filtro *Server-Side* via `searchParams` e marcação inteligente (`enviado_email`) antiduplicação.

### 3. Integração com Cloudflare Turnstile (Anti-Spam Invisível)
- **O que foi feito:** Substituição/Implementação de Captcha clássico pelo widget invisível do Cloudflare Turnstile.
- **Impacto:** Formulários públicos protegidos de bots automatizados sem penalizar o usuário real.
