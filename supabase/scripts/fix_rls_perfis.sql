-- Remover a política conflitante que causa recursão
DROP POLICY IF EXISTS "Superadmin pode gerenciar perfis" ON public.perfis;

-- Criar políticas separadas para escrita
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
