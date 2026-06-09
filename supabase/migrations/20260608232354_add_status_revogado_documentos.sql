-- Migration to add 'revogado' status to documentos_administrativos

-- First, drop the existing check constraint
ALTER TABLE public.documentos_administrativos 
DROP CONSTRAINT IF EXISTS documentos_administrativos_status_check;

-- Add the new constraint allowing 'revogado'
ALTER TABLE public.documentos_administrativos 
ADD CONSTRAINT documentos_administrativos_status_check 
CHECK (status IN ('ativo', 'cancelado', 'revogado'));
