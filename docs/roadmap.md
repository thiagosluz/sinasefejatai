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

---
*Documento vivo. Adicione novas ideias e módulos conforme surgirem discussões e feedbacks da diretoria.*
