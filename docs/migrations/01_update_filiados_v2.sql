-- =========================================================================================
-- MIGRAÇÃO V2 - Módulo de Filiados
-- Data: Junho de 2026
-- Objetivo: Atualizar as colunas da tabela filiados e adicionar novos buckets de Storage.
-- Instruções: Rode este script no Editor SQL do seu Supabase se você já tiver o banco populado.
-- =========================================================================================

-- 1. Criação do novo bucket para envio de PDFs assinados (Fichas de Filiação e Desfiliação)
INSERT INTO storage.buckets (id, name, public) 
VALUES ('documentos_filiados', 'documentos_filiados', true) 
ON CONFLICT (id) DO NOTHING;

CREATE POLICY "Autenticados gerenciam documentos filiados" 
ON storage.objects FOR ALL TO authenticated 
USING (bucket_id = 'documentos_filiados') 
WITH CHECK (bucket_id = 'documentos_filiados');

CREATE POLICY "Leitura publica documentos filiados" 
ON storage.objects FOR SELECT TO public 
USING (bucket_id = 'documentos_filiados');

-- 2. Atualização da Tabela de Filiados
-- Nota: O campo `endereco` unificado antigo será descontinuado e dropado no final deste script.
ALTER TABLE public.filiados 
  ADD COLUMN IF NOT EXISTS data_nascimento DATE,
  ADD COLUMN IF NOT EXISTS nome_pai TEXT,
  ADD COLUMN IF NOT EXISTS nome_mae TEXT,
  ADD COLUMN IF NOT EXISTS cpf TEXT,
  ADD COLUMN IF NOT EXISTS rg TEXT,
  ADD COLUMN IF NOT EXISTS sexo TEXT,
  ADD COLUMN IF NOT EXISTS endereco_rua TEXT,
  ADD COLUMN IF NOT EXISTS endereco_bairro TEXT,
  ADD COLUMN IF NOT EXISTS endereco_cep TEXT,
  ADD COLUMN IF NOT EXISTS endereco_cidade TEXT,
  ADD COLUMN IF NOT EXISTS endereco_estado TEXT,
  ADD COLUMN IF NOT EXISTS arquivo_ficha_filiacao TEXT,
  ADD COLUMN IF NOT EXISTS arquivo_ficha_desfiliacao TEXT;

-- 3. Caso queira migrar o texto do endereço antigo (opcional). 
-- Caso contrário, deixe como está e peça recadastramento ou limpe os dados na interface.
-- UPDATE public.filiados SET endereco_rua = endereco WHERE endereco IS NOT NULL;

-- 4. Remoção do campo endereco unificado antigo
ALTER TABLE public.filiados DROP COLUMN IF EXISTS endereco;

-- FIM DA MIGRAÇÃO
