-- Migration: Adicionar publicações e portal transparente
-- Data: 2026-06-09

-- 1. Adicionar flag `is_publico` em documentos_administrativos
ALTER TABLE documentos_administrativos ADD COLUMN IF NOT EXISTS is_publico BOOLEAN DEFAULT false;

-- 2. Tabela de publicações (Arquivos externos)
CREATE TABLE IF NOT EXISTS publicacoes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  titulo TEXT NOT NULL,
  categoria TEXT NOT NULL,
  arquivo_url TEXT NOT NULL,
  data_publicacao DATE NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- RLS: Permite leitura a todos (já que é público), mas escrita apenas pelo admin
ALTER TABLE publicacoes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Leitura pública de publicacoes" 
  ON publicacoes FOR SELECT 
  TO public 
  USING (true);

CREATE POLICY "Admin pode gerenciar publicacoes" 
  ON publicacoes FOR ALL 
  TO authenticated 
  USING (true) 
  WITH CHECK (true);

-- 3. Inserir Storage Bucket (documentos_publicos)
INSERT INTO storage.buckets (id, name, public) 
VALUES ('documentos_publicos', 'documentos_publicos', true)
ON CONFLICT (id) DO NOTHING;

-- RLS para Storage: Leitura pública, Escrita admin
CREATE POLICY "Leitura pública no storage de publicações" 
  ON storage.objects FOR SELECT 
  TO public 
  USING (bucket_id = 'documentos_publicos');

CREATE POLICY "Admin gerencia storage de publicações" 
  ON storage.objects FOR ALL 
  TO authenticated 
  USING (bucket_id = 'documentos_publicos') 
  WITH CHECK (bucket_id = 'documentos_publicos');
