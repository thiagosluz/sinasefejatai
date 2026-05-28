-- ==========================================================
-- Migration: Portal Público SINASEFE Jataí
-- Data: 2026-05-28
-- Descrição: Novos campos em filiados, tabela mensagens,
--            e políticas RLS para acesso público (anon).
-- ==========================================================

-- 1. Novos campos na tabela filiados
ALTER TABLE public.filiados
  ADD COLUMN IF NOT EXISTS unidade_lotacao text,
  ADD COLUMN IF NOT EXISTS campus text,
  ADD COLUMN IF NOT EXISTS categoria text,        -- 'Técnico Administrativo' | 'Docente'
  ADD COLUMN IF NOT EXISTS situacao text,          -- 'Ativo' | 'Aposentado'
  ADD COLUMN IF NOT EXISTS status_filiacao text DEFAULT 'aprovado';

-- 2. Nova tabela: mensagens (formulário de contato)
CREATE TABLE IF NOT EXISTS public.mensagens (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  nome text NOT NULL,
  email text NOT NULL,
  assunto text,
  mensagem text NOT NULL,
  lida boolean DEFAULT false,
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

ALTER TABLE public.mensagens ENABLE ROW LEVEL SECURITY;

-- Admins autenticados têm acesso total às mensagens
CREATE POLICY "Allow full access for authenticated users on mensagens"
ON public.mensagens FOR ALL TO authenticated
USING (true) WITH CHECK (true);

-- Qualquer visitante pode enviar uma mensagem de contato
CREATE POLICY "Allow public insert on mensagens"
ON public.mensagens FOR INSERT TO anon
WITH CHECK (true);

-- 3. RLS pública: pedido de filiação (anon pode inserir com status 'pendente')
CREATE POLICY "Allow public insert for filiacao requests"
ON public.filiados FOR INSERT TO anon
WITH CHECK (status_filiacao = 'pendente');

-- 4. RLS pública: assembleias visíveis (exceto rascunhos)
CREATE POLICY "Allow public read of published assembleias"
ON public.assembleias FOR SELECT TO anon
USING (status != 'Rascunho');

-- Obs: configuracoes já tem policy pública de SELECT criada no schema.sql original ✅
