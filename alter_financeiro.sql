-- Adicionar coluna banco_id para salvar o ID único da transação bancária (FITID do OFX)
ALTER TABLE public.financeiro
ADD COLUMN IF NOT EXISTS banco_id text UNIQUE;

-- Comentário explicativo na coluna
COMMENT ON COLUMN public.financeiro.banco_id IS 'ID único da transação bancária vinda do extrato OFX (evita duplicidade).';
