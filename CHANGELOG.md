# Changelog

Todas as mudanças notáveis deste projeto serão documentadas neste arquivo.

## [Unreleased]

### 🐛 Correções
- **[UI/Icons]**: Substituição da dependência de ícones de marcas no `lucide-react` (que removeu suporte a redes sociais) por componentes SVG locais. Corrigido erro fatal na Home page (`page.tsx`) por falta de exportação do ícone `Instagram`.

### ✨ Melhorias de UI/UX
- **[Portal]**: Adição do card do Instagram na página de Contato (`/contato`), seguindo o design de card padronizado para manter a consistência da identidade visual com e-mail e endereço.
- **[Portal]**: Atualização da lista de benefícios aos filiados na página de Filiação (`/filiacao`). Remoção de item redundante.

### 🔧 Infraestrutura e Configurações
- **[E-mail]**: Migração do provedor de e-mail transacional (boletins e notificações). O sistema deixou de utilizar o Amazon SES (e Resend) para focar em uma infraestrutura SMTP sólida provida pelo **Brevo**.
