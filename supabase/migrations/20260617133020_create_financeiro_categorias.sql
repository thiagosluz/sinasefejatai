-- 1. Create table
CREATE TABLE IF NOT EXISTS public.financeiro_categorias (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nome TEXT NOT NULL,
  tipo TEXT NOT NULL CHECK (tipo IN ('Entrada', 'Saída')),
  ativo BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Unique constraint
ALTER TABLE public.financeiro_categorias ADD CONSTRAINT unq_financeiro_categorias_nome_tipo UNIQUE (nome, tipo);

-- 2. Enable RLS
ALTER TABLE public.financeiro_categorias ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Permitir todos para autenticados categorias" ON public.financeiro_categorias FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Permitir leitura publica categorias" ON public.financeiro_categorias FOR SELECT USING (true);

-- 3. Insert defaults
INSERT INTO public.financeiro_categorias (nome, tipo) VALUES 
('Repasse Nacional', 'Entrada'),
('Contribuição de Filiados', 'Entrada'),
('Rendimentos', 'Entrada'),
('Saldo de Abertura', 'Entrada'),
('Outros', 'Entrada'),
('Despesas com Viagens', 'Saída'),
('Material de Consumo', 'Saída'),
('Eventos/Mobilizações', 'Saída'),
('Serviços de Terceiros', 'Saída'),
('Despesas Administrativas', 'Saída'),
('Tarifas Bancárias', 'Saída'),
('Outros', 'Saída')
ON CONFLICT (nome, tipo) DO NOTHING;

-- 4. Insert any missing categories from existing transactions
INSERT INTO public.financeiro_categorias (nome, tipo)
SELECT DISTINCT categoria, tipo 
FROM public.financeiro
WHERE categoria IS NOT NULL
ON CONFLICT (nome, tipo) DO NOTHING;

-- 5. Add new column to financeiro
ALTER TABLE public.financeiro ADD COLUMN categoria_id UUID REFERENCES public.financeiro_categorias(id);

-- 6. Map existing data
ALTER TABLE public.financeiro DISABLE TRIGGER trg_lock_financeiro_transacoes_bd;

UPDATE public.financeiro f
SET categoria_id = c.id
FROM public.financeiro_categorias c
WHERE f.categoria = c.nome AND f.tipo = c.tipo;

ALTER TABLE public.financeiro ENABLE TRIGGER trg_lock_financeiro_transacoes_bd;

-- 7. Make column NOT NULL and drop the old string column
ALTER TABLE public.financeiro ALTER COLUMN categoria_id SET NOT NULL;
ALTER TABLE public.financeiro DROP COLUMN categoria;
