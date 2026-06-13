-- Migration: Criar bucket para comprovantes financeiros
-- Data: 2026-06-13

-- Inserir Storage Bucket (comprovantes)
INSERT INTO storage.buckets (id, name, public) 
VALUES ('comprovantes', 'comprovantes', true)
ON CONFLICT (id) DO NOTHING;

-- RLS para Storage: Leitura pública, Escrita admin
CREATE POLICY "Leitura pública no storage de comprovantes" 
  ON storage.objects FOR SELECT 
  TO public 
  USING (bucket_id = 'comprovantes');

CREATE POLICY "Admin gerencia storage de comprovantes" 
  ON storage.objects FOR ALL 
  TO authenticated 
  USING (bucket_id = 'comprovantes') 
  WITH CHECK (bucket_id = 'comprovantes');
