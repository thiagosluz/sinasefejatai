-- Migration to add status to documentos_administrativos for the cancellation feature

ALTER TABLE public.documentos_administrativos 
ADD COLUMN IF NOT EXISTS status text DEFAULT 'ativo' CHECK (status IN ('ativo', 'cancelado'));

UPDATE public.documentos_administrativos 
SET status = 'ativo' 
WHERE status IS NULL;
