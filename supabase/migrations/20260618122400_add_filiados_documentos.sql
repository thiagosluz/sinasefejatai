-- Adiciona colunas para anexos na tabela filiados
ALTER TABLE public.filiados
ADD COLUMN arquivo_ficha_filiacao text,
ADD COLUMN arquivo_ficha_desfiliacao text;

-- Cria o bucket de armazenamento se não existir (Requer extensões e configuração de policies)
-- Nota: Caso a política RLS exija autenticação e você use policies, configure abaixo.
INSERT INTO storage.buckets (id, name, public) 
VALUES ('documentos_filiados', 'documentos_filiados', true)
ON CONFLICT (id) DO NOTHING;

-- Policies para o bucket documentos_filiados
CREATE POLICY "Public Access" 
ON storage.objects FOR SELECT 
USING ( bucket_id = 'documentos_filiados' );

CREATE POLICY "Admin Upload Access" 
ON storage.objects FOR INSERT 
WITH CHECK ( bucket_id = 'documentos_filiados' AND auth.role() = 'authenticated' );

CREATE POLICY "Admin Update Access" 
ON storage.objects FOR UPDATE 
WITH CHECK ( bucket_id = 'documentos_filiados' AND auth.role() = 'authenticated' );

CREATE POLICY "Admin Delete Access" 
ON storage.objects FOR DELETE 
USING ( bucket_id = 'documentos_filiados' AND auth.role() = 'authenticated' );
