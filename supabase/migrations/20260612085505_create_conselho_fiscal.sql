-- 1. Add conselho_fiscal to roles
ALTER TABLE public.perfis DROP CONSTRAINT IF EXISTS perfis_role_check;
ALTER TABLE public.perfis ADD CONSTRAINT perfis_role_check CHECK (role IN ('superadmin', 'diretoria', 'filiado', 'conselho_fiscal'));

-- 2. Create tables for Conselho Fiscal Gestoes
CREATE TABLE IF NOT EXISTS public.conselho_fiscal_gestoes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  nome TEXT NOT NULL,
  is_atual BOOLEAN NOT NULL DEFAULT false,
  criado_em TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE UNIQUE INDEX IF NOT EXISTS apenas_uma_gestao_conselho_atual 
ON public.conselho_fiscal_gestoes (is_atual) 
WHERE is_atual = true;

-- 3. Create tables for Conselho Fiscal Membros
CREATE TABLE IF NOT EXISTS public.conselho_fiscal_membros (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  gestao_id UUID NOT NULL REFERENCES public.conselho_fiscal_gestoes(id) ON DELETE CASCADE,
  filiado_id UUID REFERENCES public.filiados(id) ON DELETE SET NULL,
  cadeira_referencia TEXT NOT NULL, 
  cargo_nome TEXT NOT NULL,
  nome TEXT,
  foto_url TEXT,
  is_cargo_fixo BOOLEAN NOT NULL DEFAULT false,
  ordem INTEGER NOT NULL DEFAULT 99,
  criado_em TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- RLS
ALTER TABLE public.conselho_fiscal_gestoes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.conselho_fiscal_membros ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Leitura pública para conselho_fiscal_gestoes" ON public.conselho_fiscal_gestoes FOR SELECT USING (true);
CREATE POLICY "Leitura pública para conselho_fiscal_membros" ON public.conselho_fiscal_membros FOR SELECT USING (true);

CREATE POLICY "Permitir todos para autenticados" ON public.conselho_fiscal_gestoes FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Permitir todos para autenticados membros" ON public.conselho_fiscal_membros FOR ALL USING (auth.role() = 'authenticated');

-- 4. Create financeiro_prestacoes_mensais
CREATE TABLE IF NOT EXISTS public.financeiro_prestacoes_mensais (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  mes_ano TEXT UNIQUE NOT NULL, -- Format: YYYY-MM
  status TEXT NOT NULL CHECK (status IN ('ENVIADO_CONSELHO', 'COM_RESSALVAS', 'APROVADO', 'REJEITADO')),
  parecer_texto TEXT,
  tesoureiro_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  documento_parecer_id UUID REFERENCES public.documentos_administrativos(id) ON DELETE SET NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE public.financeiro_prestacoes_mensais ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Permitir todos para autenticados" ON public.financeiro_prestacoes_mensais FOR ALL USING (auth.role() = 'authenticated');

-- 5. Trigger for updated_at
CREATE TRIGGER handle_updated_at_financeiro_prestacoes_mensais
  BEFORE UPDATE ON public.financeiro_prestacoes_mensais
  FOR EACH ROW
  EXECUTE PROCEDURE moddatetime(updated_at);

-- 6. Hard Lock Trigger on financeiro_transacoes
-- Needs to verify if the month is approved
CREATE OR REPLACE FUNCTION trg_lock_financeiro_transacoes()
RETURNS TRIGGER AS $$
DECLARE
  v_mes_ano TEXT;
  v_status TEXT;
BEGIN
  -- Determine the month of the transaction being modified/deleted
  IF TG_OP = 'DELETE' THEN
    v_mes_ano := to_char(OLD.data, 'YYYY-MM');
  ELSE
    v_mes_ano := to_char(NEW.data, 'YYYY-MM');
  END IF;

  -- Check if there is an approved prestacao for this month
  SELECT status INTO v_status 
  FROM public.financeiro_prestacoes_mensais 
  WHERE mes_ano = v_mes_ano;

  IF v_status = 'APROVADO' THEN
    RAISE EXCEPTION 'Não é permitido alterar ou remover transações de um mês com prestação de contas já aprovada pelo Conselho Fiscal.';
  END IF;

  -- If modifying the date of an existing transaction, check the OLD date too
  IF TG_OP = 'UPDATE' AND NEW.data != OLD.data THEN
    v_mes_ano := to_char(OLD.data, 'YYYY-MM');
    SELECT status INTO v_status 
    FROM public.financeiro_prestacoes_mensais 
    WHERE mes_ano = v_mes_ano;

    IF v_status = 'APROVADO' THEN
      RAISE EXCEPTION 'Não é permitido alterar a data de uma transação que pertencia a um mês com prestação de contas já aprovada.';
    END IF;
  END IF;

  IF TG_OP = 'DELETE' THEN
    RETURN OLD;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Before update or delete
DROP TRIGGER IF EXISTS trg_lock_financeiro_transacoes_bd ON public.financeiro;
CREATE TRIGGER trg_lock_financeiro_transacoes_bd
  BEFORE UPDATE OR DELETE ON public.financeiro
  FOR EACH ROW
  EXECUTE FUNCTION trg_lock_financeiro_transacoes();

-- Also block INSERT into approved months
CREATE OR REPLACE FUNCTION trg_lock_financeiro_transacoes_insert()
RETURNS TRIGGER AS $$
DECLARE
  v_mes_ano TEXT;
  v_status TEXT;
BEGIN
  v_mes_ano := to_char(NEW.data, 'YYYY-MM');

  SELECT status INTO v_status 
  FROM public.financeiro_prestacoes_mensais 
  WHERE mes_ano = v_mes_ano;

  IF v_status = 'APROVADO' THEN
    RAISE EXCEPTION 'Não é permitido inserir novas transações num mês com prestação de contas já aprovada pelo Conselho Fiscal.';
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_lock_financeiro_transacoes_ins ON public.financeiro;
CREATE TRIGGER trg_lock_financeiro_transacoes_ins
  BEFORE INSERT ON public.financeiro
  FOR EACH ROW
  EXECUTE FUNCTION trg_lock_financeiro_transacoes_insert();
