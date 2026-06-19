-- Script para criar o bucket "avatars" no Supabase Storage

-- Criação do Bucket (se não existir)
INSERT INTO storage.buckets (id, name, public) 
VALUES ('avatars', 'avatars', true)
ON CONFLICT (id) DO NOTHING;

-- Política 1: Leitura pública para visualizar avatares
CREATE POLICY "Avatares são públicos para visualização"
ON storage.objects FOR SELECT
USING (bucket_id = 'avatars');

-- Política 2: Upload autenticado (usuários só podem alterar a própria pasta ou o próprio ID de arquivo)
CREATE POLICY "Usuários podem fazer upload do próprio avatar"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
    bucket_id = 'avatars' 
    AND (auth.uid()::text = (storage.foldername(name))[1] OR auth.uid()::text = name)
);

-- Política 3: Update e Deleção autenticada (só o próprio usuário altera sua imagem)
CREATE POLICY "Usuários podem atualizar o próprio avatar"
ON storage.objects FOR UPDATE
TO authenticated
USING (
    bucket_id = 'avatars' 
    AND (auth.uid()::text = (storage.foldername(name))[1] OR auth.uid()::text = name)
);

CREATE POLICY "Usuários podem deletar o próprio avatar"
ON storage.objects FOR DELETE
TO authenticated
USING (
    bucket_id = 'avatars' 
    AND (auth.uid()::text = (storage.foldername(name))[1] OR auth.uid()::text = name)
);
