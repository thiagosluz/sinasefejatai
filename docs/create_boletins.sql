-- =========================================================================================
-- SCRIPT DE CRIAÇÃO DO MÓDULO DE BOLETINS
-- Execute no SQL Editor do Supabase
-- =========================================================================================

-- 1. Criação da Tabela
CREATE TABLE IF NOT EXISTS public.boletins (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    titulo TEXT NOT NULL,
    corpo_texto TEXT NOT NULL,
    capa_url TEXT NOT NULL,
    arquivo_pdf_url TEXT,
    link_externo TEXT,
    data_publicacao DATE NOT NULL,
    status TEXT DEFAULT 'Rascunho' CHECK (status IN ('Rascunho', 'Publicado')),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Trigger de updated_at
CREATE TRIGGER set_boletins_updated_at 
BEFORE UPDATE ON public.boletins 
FOR EACH ROW EXECUTE FUNCTION moddatetime(updated_at);

-- 3. Habilitando RLS
ALTER TABLE public.boletins ENABLE ROW LEVEL SECURITY;

-- 4. Políticas de Acesso
-- Leitura pública apenas para publicados
CREATE POLICY "Leitura publica de boletins" 
  ON public.boletins FOR SELECT 
  TO public 
  USING (status = 'Publicado');

-- Diretoria pode gerenciar todos (inclusive rascunhos)
CREATE POLICY "Admin pode gerenciar boletins" 
  ON public.boletins FOR ALL 
  TO authenticated 
  USING (true) 
  WITH CHECK (true);

-- 5. Adicionar aos Logs de Auditoria
CREATE TRIGGER audit_boletins_trigger 
AFTER INSERT OR UPDATE OR DELETE ON public.boletins 
FOR EACH ROW EXECUTE FUNCTION process_audit_log();

-- 6. Criação do Bucket de Storage
INSERT INTO storage.buckets (id, name, public) 
VALUES ('boletins', 'boletins', true) 
ON CONFLICT (id) DO NOTHING;

-- Políticas do Bucket
CREATE POLICY "Leitura publica no storage de boletins" 
  ON storage.objects FOR SELECT 
  TO public 
  USING (bucket_id = 'boletins');

CREATE POLICY "Admin gerencia storage de boletins" 
  ON storage.objects FOR ALL 
  TO authenticated 
  USING (bucket_id = 'boletins') 
  WITH CHECK (bucket_id = 'boletins');
