# Roadmap SINASEFE JATAÍ

Este documento registra as intenções de melhorias arquiteturais, novas funcionalidades e correções de dívida técnica para implementações futuras.

## 🚀 Infraestrutura & Back-end

### 1. Migração do Provedor de E-mail (Edge Functions)
- **Problema Atual:** Atualmente utilizamos o **Resend (Plano Free/Hobby)** dentro das Edge Functions (`disparo-emails`) para o envio assíncrono em lote (Assembleias e Boletins). O plano gratuito possui uma limitação severa de **100 e-mails/dia**. Quando o número de filiados do Sindicato ultrapassar 100, os disparos falharão silenciosamente com erro `429 Too Many Requests`.
- **Solução Recomendada:** 
  - **Longo Prazo (Amazon SES):** Criar conta na AWS e configurar o SES. O custo é baixíssimo ($0.10 a cada 1.000 e-mails) e remove completamente as limitações de envio diário, além de ser o mais robusto contra SPAM.
  - **Curto Prazo (Brevo):** Substituir a API Key e Endpoint na Edge Function atual para a API do Brevo (ex-Sendinblue), cujo plano gratuito engloba até **300 e-mails/dia**.
- **Impacto:** Permite o crescimento saudável da base de filiados sem interromper a comunicação do Sindicato.

---

## 🎨 Front-end & UI/UX
*(Adicione futuros épicos de front-end aqui)*

---

## 🛠 Segurança & DevOps
*(Adicione futuros épicos de segurança aqui)*
