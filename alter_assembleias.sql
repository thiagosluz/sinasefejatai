-- Adicionar coluna publico_alvo à tabela assembleias
ALTER TABLE public.assembleias
ADD COLUMN IF NOT EXISTS publico_alvo text NOT NULL DEFAULT 'filiados';

-- Adicionar constraint de validação (opcional mas recomendado)
ALTER TABLE public.assembleias
ADD CONSTRAINT check_publico_alvo CHECK (publico_alvo IN ('filiados', 'servidores'));
