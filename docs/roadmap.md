# Roadmap de Implementações - SINASEFE Jataí

Este documento centraliza as ideias e sugestões de melhorias futuras para o sistema, servindo como um guia de visão de longo prazo para os módulos existentes e novos.

## Módulo: Assembleias

O módulo atual (v1) gerencia pautas, locais dinâmicos, distinção de público-alvo e gera documentos oficiais (Edital, Ata, Lista de Presença). As ideias abaixo visam elevar a digitalização sindical.

### 1. Lista de Presença Digital Rápida (Check-in / QR Code)
Em vez de imprimir a lista de presença em papel, digitaliza-se o processo de entrada no auditório.
* **Mecânica:** O sistema gera um QR Code da Assembleia. O servidor lê o código, insere sua matrícula SIAPE e faz o "Check-in" online. Como alternativa, a secretaria usa uma tela de "Check-in Expresso" na porta para bipar/digitar o SIAPE rapidamente.
* **Benefícios:** Fim de filas na entrada, relatórios de presença imediatos com horário exato, eliminação de erro humano por ilegibilidade de assinaturas.

### 2. Acervo Digital e Anexos da Assembleia
Permitir a anexação de leitura prévia (Parecer do Conselho Fiscal, Prestação de Contas, Regimentos).
* **Mecânica:** Área de "Anexos" na edição da Assembleia (upload via Storage). O sistema gera um link público (ex: `/assembleias/publica/[id]`) que centraliza o Edital e os anexos, facilitando o envio via WhatsApp.
* **Benefícios:** Transparência total para a base antes das deliberações e criação de uma memória institucional forte (a Ata Final assinada e escaneada também ficaria vinculada aqui).

### 3. Módulo de Votação Eletrônica (Deliberações em Tempo Real)
Digitalizar a votação de pontos de pauta deliberativos (ex: greve, aprovação de contas).
* **Mecânica:** O Admin abre uma votação no painel. Os filiados credenciados (via Check-in) votam pelo celular (Sim, Não, Abstenção). Um dashboard atualiza os gráficos em tempo real no telão.
* **Benefícios:** Precisão matemática, registro inquestionável para a Ata Oficial e uma experiência "Premium" e altamente moderna.

### 4. Disparo Automático de Convocação (Integração de E-mail)
Automatizar a comunicação burocrática dos Editais.
* **Mecânica:** Um botão "Disparar Edital" na Assembleia, que cruza o Público-Alvo com a tabela de filiados e faz envio em massa de e-mails usando serviços como o Resend.
* **Benefícios:** Economia severa de horas de trabalho da secretaria (elimina exportação de planilhas e BCC no Gmail).

## Módulo: Financeiro

O módulo atual trata de fluxo de caixa, importação de OFX e gerenciamento de recibos. Abaixo as ideias levantadas para evolução do nível de transparência na prestação de contas.

### 1. Conciliação de Saldo com Investimentos
Lidar com o cenário (comum no Banco do Brasil) onde o saldo global em extrato PDF inclui o dinheiro aplicado em investimentos de baixa automática, mas o arquivo de exportação de dados padrão OFX reflete apenas o saldo livre da conta corrente. As opções levantadas para uma implementação futura são:

* **Opção A (Recomendada): Saldo de Investimentos Manual no Fechamento de Caixa**
  O sistema audita e concilia automaticamente a conta corrente via OFX. Porém, no momento de emitir o relatório mensal ou anual de prestação de contas, o tesoureiro preenche manualmente o campo "Saldo em Aplicações Financeiras" (conforme extrato PDF). Benefício: O relatório final baterá o centavo com o extrato bancário oficial e garantirá transparência sem aumentar excessivamente o esforço.
* **Opção B: Foco Exclusivo em Conta Corrente**
  Ignorar o valor aplicado. Trabalhar apenas com o saldo reportado pelo OFX. Desvantagem: o relatório do sistema e o cabeçalho do PDF do banco sempre apresentarão valores divergentes, obrigando explicações verbais recorrentes durante assembleias.
* **Opção C: Módulo de Importação Múltipla**
  O tesoureiro exportaria arquivos de dados separados (Conta vs Investimentos) do Gerenciador Financeiro. O sistema processaria ambos. Benefício: automação total e acompanhamento de rentabilidade. Desvantagem: alto custo e complexidade de implementação no momento atual.

## Módulo: Portal do Filiado (Intranet / Autoatendimento)

A atual arquitetura foca na dicotomia "Público (Visitante)" e "Admin (Diretoria)". A ideia central é plugar uma autenticação para os membros do sindicato acessarem recursos exclusivos.

### 1. Carteirinha Digital de Filiado
* **Mecânica:** O servidor loga no portal com CPF e senha e acessa sua "Carteirinha Sindical" com QR Code e foto (puxada do storage).
* **Benefícios:** Fim do custo de emissão de carteirinhas de plástico (PVC), fácil identificação nos comércios parceiros e modernização visual do sindicato. O próprio servidor pode subir sua foto de perfil.

### 2. Atualização Cadastral Autônoma
* **Mecânica:** Formulário onde o filiado atualiza dados básicos (endereço, telefone, e-mail) diretamente, salvando no banco após uma verificação OTP (código por e-mail/SMS).
* **Benefícios:** Desafoga a secretaria sindical da imensa carga de "ligar pedindo atualização", garantindo que a base de dados de contatos para deliberações esteja sempre fresca.

## Módulo: Atendimento, Jurídico e Ouvidoria (Protocolos)

Atualmente, existe apenas um "Fale Conosco" rudimentar. A meta é criar um workflow profissional de amparo ao trabalhador.

### 1. Abertura de Protocolos e Tickets Jurídicos
* **Mecânica:** O servidor (logado ou público) abre um ticket relatando assédio, demanda trabalhista ou dúvida. O sistema gera um `#Protocolo`. A diretoria move o card em um Kanban (Ex: "Nova Demanda" -> "Em Análise Jurídica" -> "Concluído").
* **Benefícios:** Institucionaliza o atendimento. Impede que conversas vitais e evidências se percam em conversas informais de WhatsApp de um diretor específico, criando um histórico perene do trabalho da gestão em prol do filiado.

## Módulo: Vitrine de Convênios e Benefícios

Marketing direto das vantagens econômicas de ser sindicalizado.

### 1. Catálogo Público de Parceiros
* **Mecânica:** A diretoria cadastra Parceiros (nome, logo, regras de desconto, validade do convênio) pelo painel de admin. Isso alimenta uma aba belíssima de "Convênios" no Portal Público.
* **Benefícios:** Funciona como o maior argumento de atração para filiação de novos servidores, que batem o olho nos benefícios (planos de saúde, escolas, postos de combustível) e enxergam retorno financeiro na taxa sindical.

## Módulo: Segurança e Proteção Anti-Spam

O sistema de proteção atual possui Honeypot Nativo + Verificação de Tempo de Preenchimento (Time-based).

### 1. Integração com Cloudflare Turnstile (Captcha Invisível)
* **Mecânica:** Implementar o widget invisível do Cloudflare Turnstile nos formulários públicos (`/filiacao` e `/contato`). A Server Action fará a verificação do token na API do Cloudflare antes de registrar no banco.
* **Benefícios:** Bloqueia headless browsers e bots sofisticados sem prejudicar a experiência do usuário real (sem testes de reconhecimento de imagem chatos). É gratuito e respeita mais a privacidade que o reCAPTCHA.

### 2. Rate Limiting no Middleware
* **Mecânica:** Usar Supabase Edge Functions ou Vercel KV (Redis) com `@upstash/ratelimit` para bloquear múltiplos requests em curtos espaços de tempo oriundos do mesmo IP nas rotas públicas de form.
* **Benefícios:** Impede completamente ataques de negação de serviço e força bruta de spam.

---
*Documento vivo. Adicione novas ideias e módulos conforme surgirem discussões e feedbacks da diretoria.*
