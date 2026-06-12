-- Adicionar status AGUARDANDO_ASSINATURAS na tabela financeiro_prestacoes_mensais
ALTER TABLE public.financeiro_prestacoes_mensais DROP CONSTRAINT IF EXISTS financeiro_prestacoes_mensais_status_check;
ALTER TABLE public.financeiro_prestacoes_mensais ADD CONSTRAINT financeiro_prestacoes_mensais_status_check CHECK (status IN ('ENVIADO_CONSELHO', 'COM_RESSALVAS', 'APROVADO', 'REJEITADO', 'AGUARDANDO_ASSINATURAS'));
