# Plano de Atualização de Documentação (Orchestration - Phase 1)

## Contexto
Temos que atualizar a documentação e o README para refletir as seguintes atualizações recentes:
1. Correção do ícone do Instagram (remoção da dependência de brand icons do `lucide-react` e uso de SVG customizado).
2. Adição do card do Instagram na página de Contato (`/contato`).
3. Atualização da lista de benefícios na página de Filiação (`/filiacao`).
4. Migração do serviço de envio de e-mails da Amazon SES para o Brevo (SMTP/Nodemailer).

## Modificações Propostas

### 1. `README.md`
- Adicionar uma seção curta sobre "Dependências de Ícones" (explicando que ícones de marcas/sociais devem usar SVGs customizados, pois o `lucide-react` não os suporta mais, para evitar futuros bugs).
- Mencionar que o portal público possui integração direta para contatos em redes sociais (Instagram).
- Atualizar a seção sobre a infraestrutura de e-mails, trocando a referência de Amazon SES para Brevo.

### 2. `CHANGELOG.md` (Novo Arquivo)
Criar um arquivo `CHANGELOG.md` na raiz para registrar essas alterações granulares:
- **[UI/UX]** Adição de card do Instagram na página de contato.
- **[Correção]** Remoção de dependência quebrada do `Instagram` no `lucide-react` e substituição por componente local SVG.
- **[Conteúdo]** Atualização dos benefícios na página de Filiação.
- **[Infra]** Migração do provedor de e-mail (de Amazon SES para Brevo).

## Agentes Envolvidos na Fase 2 (Implementação)
- `documentation-writer`: Para redigir as atualizações no README e criar o CHANGELOG.
- `frontend-specialist`: Para revisar as diretrizes de SVG vs Lucide no README.
- `test-engineer`: Para rodar testes e lint para garantir conformidade.

---

Aguardando aprovação para proceder para a Fase 2 de implementação.
