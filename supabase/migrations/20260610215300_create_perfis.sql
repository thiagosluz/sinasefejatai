-- 1. Criação da tabela de Perfis
CREATE TABLE IF NOT EXISTS public.perfis (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    role TEXT NOT NULL CHECK (role IN ('superadmin', 'diretoria', 'filiado')),
    filiado_id UUID REFERENCES public.filiados(id) ON DELETE SET NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 2. Atualização da tabela de membros da gestão
ALTER TABLE public.gestao_membros ADD COLUMN IF NOT EXISTS filiado_id UUID REFERENCES public.filiados(id) ON DELETE SET NULL;

-- 3. RLS para Perfis
ALTER TABLE public.perfis ENABLE ROW LEVEL SECURITY;

-- Superadmin pode fazer tudo, diretoria pode ler. 
-- Obs: Como as policies RLS não podem fazer recursão pesada sem cache, vamos manter simples:
-- Todos autenticados podem LER perfis para popular telas do painel.
CREATE POLICY "Permitir leitura de perfis para autenticados" 
  ON public.perfis FOR SELECT 
  TO authenticated 
  USING (true);

-- Apenas o backend usando SERVICE_ROLE ou superadmins poderão inserir/atualizar/deletar perfis.
-- Na prática, não daremos GRANT direto ao `authenticated` para escrita sem checar.
CREATE POLICY "Superadmin pode inserir perfis" 
  ON public.perfis FOR INSERT 
  TO authenticated 
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.perfis p WHERE p.id = auth.uid() AND p.role = 'superadmin'
    )
  );

CREATE POLICY "Superadmin pode atualizar perfis" 
  ON public.perfis FOR UPDATE 
  TO authenticated 
  USING (
    EXISTS (
      SELECT 1 FROM public.perfis p WHERE p.id = auth.uid() AND p.role = 'superadmin'
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.perfis p WHERE p.id = auth.uid() AND p.role = 'superadmin'
    )
  );

CREATE POLICY "Superadmin pode deletar perfis" 
  ON public.perfis FOR DELETE 
  TO authenticated 
  USING (
    EXISTS (
      SELECT 1 FROM public.perfis p WHERE p.id = auth.uid() AND p.role = 'superadmin'
    )
  );

-- Trigger para atualizar `updated_at` (opcional mas boa prática)
CREATE OR REPLACE FUNCTION handle_updated_at() 
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER set_perfis_updated_at
BEFORE UPDATE ON public.perfis
FOR EACH ROW
EXECUTE FUNCTION handle_updated_at();

-- Adiciona os perfis aos logs de auditoria
CREATE TRIGGER audit_perfis_trigger 
AFTER INSERT OR UPDATE OR DELETE ON public.perfis 
FOR EACH ROW EXECUTE FUNCTION process_audit_log();
