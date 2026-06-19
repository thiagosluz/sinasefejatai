-- =========================================================================================
-- SETUP COMPLETO - SINASEFE JATAÍ (Portal Público & Painel Admin)
-- Data de Geração: Junho de 2026
-- Instruções: Copie este código e rode no SQL Editor do seu Supabase para recriar o banco do zero.
-- =========================================================================================

-- ==========================================
-- 1. CONFIGURAÇÕES INICIAIS
-- ==========================================
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ==========================================
-- 2. CRIAÇÃO DE TABELAS (BASE)
-- ==========================================

-- 2.1 Filiados e Pedidos de Filiação
CREATE TABLE public.filiados (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    nome TEXT NOT NULL,
    email TEXT,
    telefone TEXT,
    siape TEXT,
    cargo TEXT,
    ativo BOOLEAN DEFAULT true,
    data_nascimento DATE,
    nome_pai TEXT,
    nome_mae TEXT,
    cpf TEXT,
    rg TEXT,
    sexo TEXT,
    endereco_rua TEXT,
    endereco_bairro TEXT,
    endereco_cep TEXT,
    endereco_cidade TEXT,
    endereco_estado TEXT,
    unidade_lotacao TEXT,
    campus TEXT,
    categoria TEXT, -- 'Técnico Administrativo' | 'Docente'
    situacao TEXT, -- 'Ativo' | 'Aposentado'
    status_filiacao TEXT DEFAULT 'aprovado', -- 'pendente' | 'aprovado' | 'desfiliado'
    arquivo_ficha_filiacao TEXT,
    arquivo_ficha_desfiliacao TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 2.2 Assembleias e Pautas
CREATE TABLE public.assembleias (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    numero TEXT,
    tipo TEXT, -- Ordinária, Extraordinária
    data_realizacao DATE NOT NULL,
    horario_1a_convocacao TIME NOT NULL,
    horario_2a_convocacao TIME NOT NULL,
    local TEXT NOT NULL,
    pautas TEXT[],
    publico_alvo TEXT NOT NULL DEFAULT 'filiados' CHECK (publico_alvo IN ('filiados', 'servidores')),
    status TEXT DEFAULT 'Agendada', -- Agendada, Realizada, Cancelada, Rascunho
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 2.3 Locais de Assembleia (Pré-cadastrados)
CREATE TABLE public.locais (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    nome_curto TEXT NOT NULL,
    texto_completo TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 2.4 Presenças em Assembleia
CREATE TABLE public.presencas (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    assembleia_id UUID REFERENCES public.assembleias(id) ON DELETE CASCADE NOT NULL,
    filiado_id UUID REFERENCES public.filiados(id) ON DELETE SET NULL,
    nome_manual TEXT,
    siape_manual TEXT,
    cargo_manual TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 2.5 Atas de Assembleia
CREATE TABLE public.atas (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    assembleia_id UUID REFERENCES public.assembleias(id) ON DELETE RESTRICT UNIQUE NOT NULL,
    numero TEXT,
    conteudo_rich TEXT,
    redator TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 2.6 Documentos de Assembleias (Anexos, PDF de Editais e Atas)
CREATE TABLE public.assembleia_documentos (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  assembleia_id UUID REFERENCES public.assembleias(id) ON DELETE CASCADE NOT NULL,
  tipo TEXT NOT NULL, -- 'ata', 'edital', 'presenca', 'outro'
  arquivo_url TEXT NOT NULL,
  nome_arquivo TEXT NOT NULL,
  tamanho_bytes BIGINT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc', now()) NOT NULL
);

-- 2.7 Categorias Financeiras (Dinâmicas)
CREATE TABLE public.financeiro_categorias (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nome TEXT NOT NULL,
  tipo TEXT NOT NULL CHECK (tipo IN ('Entrada', 'Saída')),
  ativo BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE public.financeiro_categorias ADD CONSTRAINT unq_financeiro_categorias_nome_tipo UNIQUE (nome, tipo);

-- 2.8 Financeiro (Livro Caixa e Comprovantes)
CREATE TABLE public.financeiro (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tipo TEXT NOT NULL CHECK (tipo in ('Entrada', 'Saída')),
    data DATE NOT NULL,
    descricao TEXT NOT NULL,
    valor NUMERIC(10,2) NOT NULL,
    categoria_id UUID NOT NULL REFERENCES public.financeiro_categorias(id),
    comprovante_url TEXT,
    banco_id TEXT UNIQUE, -- ID único da transação bancária vinda do extrato OFX (evita duplicidade).
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 2.9 Histórico de Gestões e Diretoria
CREATE TABLE public.gestoes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  nome TEXT NOT NULL,
  is_atual BOOLEAN NOT NULL DEFAULT false,
  criado_em TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Garantir que apenas uma gestão possa ser "atual" por vez
CREATE UNIQUE INDEX apenas_uma_gestao_atual ON public.gestoes (is_atual) WHERE is_atual = true;

CREATE TABLE public.gestao_membros (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  gestao_id UUID NOT NULL REFERENCES public.gestoes(id) ON DELETE CASCADE,
  cadeira_referencia TEXT NOT NULL, -- 'coord_1', 'coord_2', 'sec_geral', 'sec_adj', 'tes_geral', 'tes_adj', 'extra'
  cargo_nome TEXT NOT NULL,         -- Ex: 'Coordenadora Geral'
  nome TEXT,                        
  foto_url TEXT,                    
  is_cargo_fixo BOOLEAN NOT NULL DEFAULT false,
  filiado_id UUID REFERENCES public.filiados(id) ON DELETE SET NULL,
  ordem INTEGER NOT NULL DEFAULT 99,
  criado_em TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2.10 Mensagens (Fale Conosco Portal Público)
CREATE TABLE public.mensagens (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  nome TEXT NOT NULL,
  email TEXT NOT NULL,
  assunto TEXT,
  mensagem TEXT NOT NULL,
  lida BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 2.11 Configurações Globais (Timbres Oficiais)
CREATE TABLE public.configuracoes (
    id INTEGER PRIMARY KEY DEFAULT 1 CHECK (id = 1),
    titulo TEXT NOT NULL DEFAULT 'SINDICATO NACIONAL DOS SERVIDORES FEDERAIS DA EDUCAÇÃO BÁSICA, PROFISSIONAL E TECNOLÓGICA',
    secao_sindical TEXT NOT NULL DEFAULT 'SINASEFE - SEÇÃO SINDICAL JATAÍ',
    endereco TEXT NOT NULL DEFAULT 'RUA RIACHUELO, 2090 – SETOR SAMUEL GRAHAM – JATAÍ/GO',
    cep TEXT NOT NULL DEFAULT 'CEP: 75804-020',
    filiacao TEXT NOT NULL DEFAULT 'FILIADO À CEA',
    fundacao TEXT NOT NULL DEFAULT 'FUNDADO EM 16/05/2005',
    logo_url TEXT,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);


-- 2.12 Auditoria (Logs do Sistema)
CREATE TABLE public.audit_logs (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL, 
    user_email TEXT,
    action TEXT NOT NULL,
    resource TEXT NOT NULL, 
    details JSONB, 
    ip_address TEXT,
    user_agent TEXT
);


-- 2.13 Conselho Fiscal
CREATE TABLE public.conselho_fiscal_gestoes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  nome TEXT NOT NULL,
  is_atual BOOLEAN NOT NULL DEFAULT false,
  criado_em TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE UNIQUE INDEX apenas_uma_gestao_conselho_atual ON public.conselho_fiscal_gestoes (is_atual) WHERE is_atual = true;

CREATE TABLE public.conselho_fiscal_membros (
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

-- 2.14 Documentos Administrativos (Recibos, Portarias, Ofícios, etc)
CREATE TABLE IF NOT EXISTS public.documentos_administrativos (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tipo TEXT NOT NULL,
    titulo TEXT NOT NULL,
    numero TEXT,
    dados JSONB NOT NULL DEFAULT '{}'::jsonb,
    autor_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    status TEXT DEFAULT 'ativo' CHECK (status IN ('ativo', 'cancelado', 'revogado')),
    is_publico BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);


-- 2.15 Prestações de Contas Mensais (Conselho Fiscal)
CREATE TABLE public.financeiro_prestacoes_mensais (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  mes_ano TEXT UNIQUE NOT NULL, -- Format: YYYY-MM
  status TEXT NOT NULL CHECK (status IN ('ENVIADO_CONSELHO', 'COM_RESSALVAS', 'APROVADO', 'REJEITADO', 'AGUARDANDO_ASSINATURAS')),
  parecer_texto TEXT,
  tesoureiro_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  documento_parecer_id UUID REFERENCES public.documentos_administrativos(id) ON DELETE SET NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TRIGGER handle_updated_at_financeiro_prestacoes_mensais
  BEFORE UPDATE ON public.financeiro_prestacoes_mensais
  FOR EACH ROW EXECUTE PROCEDURE moddatetime(updated_at);

-- 2.16 Publicações (Arquivos Externos)
CREATE TABLE IF NOT EXISTS public.publicacoes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  titulo TEXT NOT NULL,
  categoria TEXT NOT NULL,
  arquivo_url TEXT NOT NULL,
  data_publicacao DATE NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2.17 Gestão de Acessos e Perfis
CREATE TABLE IF NOT EXISTS public.perfis (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    role TEXT NOT NULL CHECK (role IN ('superadmin', 'diretoria', 'filiado', 'conselho_fiscal')),
    filiado_id UUID REFERENCES public.filiados(id) ON DELETE SET NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 2.18 Boletins Semanais
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

CREATE TRIGGER set_boletins_updated_at 
BEFORE UPDATE ON public.boletins 
FOR EACH ROW EXECUTE FUNCTION moddatetime(updated_at);

-- ==========================================
-- 3. HABILITANDO SEGURANÇA DE LINHAS (RLS)
-- ==========================================
ALTER TABLE public.filiados ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.assembleias ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.locais ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.presencas ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.atas ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.assembleia_documentos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.financeiro_categorias ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.financeiro ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.gestoes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.gestao_membros ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.mensagens ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.configuracoes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.conselho_fiscal_gestoes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.conselho_fiscal_membros ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.financeiro_prestacoes_mensais ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.documentos_administrativos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.publicacoes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.perfis ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.boletins ENABLE ROW LEVEL SECURITY;


-- ==========================================
-- 4. POLÍTICAS DE ACESSO (POLICIES)
-- ==========================================

-- 4.1. PERMISSÕES DA DIRETORIA (Usuários Autenticados têm controle total)
CREATE POLICY "Permitir tudo para autenticados em filiados" ON public.filiados FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Permitir tudo para autenticados em assembleias" ON public.assembleias FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Permitir tudo para autenticados em locais" ON public.locais FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Permitir tudo para autenticados em presencas" ON public.presencas FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Permitir tudo para autenticados em atas" ON public.atas FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Permitir tudo para autenticados em assembleia_documentos" ON public.assembleia_documentos FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Permitir tudo para autenticados em financeiro" ON public.financeiro FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Permitir tudo para autenticados em gestoes" ON public.gestoes FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Permitir tudo para autenticados em gestao_membros" ON public.gestao_membros FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Permitir tudo para autenticados em mensagens" ON public.mensagens FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Permitir tudo para autenticados em configuracoes" ON public.configuracoes FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Permitir tudo para autenticados em audit_logs" ON public.audit_logs FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Permitir tudo para autenticados em financeiro_prestacoes_mensais" ON public.financeiro_prestacoes_mensais FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- 4.2 Categorias Financeiras
CREATE POLICY "Permitir todos para autenticados categorias" ON public.financeiro_categorias FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Permitir leitura publica categorias" ON public.financeiro_categorias FOR SELECT USING (true);

-- 4.3 Conselho Fiscal
CREATE POLICY "Permitir leitura anonima conselho gestoes" ON public.conselho_fiscal_gestoes FOR SELECT TO anon USING (true);
CREATE POLICY "Permitir leitura anonima conselho membros" ON public.conselho_fiscal_membros FOR SELECT TO anon USING (true);
CREATE POLICY "Permitir tudo para autenticados em conselho_fiscal_gestoes" ON public.conselho_fiscal_gestoes FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Permitir tudo para autenticados em conselho_fiscal_membros" ON public.conselho_fiscal_membros FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- 4.4 PERMISSÕES DO PORTAL PÚBLICO (Usuários Anônimos)
CREATE POLICY "Permitir leitura publica de configuracoes" ON public.configuracoes FOR SELECT TO anon USING (true);
CREATE POLICY "Permitir leitura publica de gestoes" ON public.gestoes FOR SELECT TO anon USING (true);
CREATE POLICY "Permitir leitura publica de gestao_membros" ON public.gestao_membros FOR SELECT TO anon USING (true);
CREATE POLICY "Permitir envio de mensagem publica" ON public.mensagens FOR INSERT TO anon WITH CHECK (true);
CREATE POLICY "Permitir pedido de filiacao" ON public.filiados FOR INSERT TO anon WITH CHECK (status_filiacao = 'pendente');
CREATE POLICY "Permitir leitura publica de assembleias" ON public.assembleias FOR SELECT TO anon USING (status != 'Rascunho');
CREATE POLICY "Permitir leitura publica de anexos assembleia" ON public.assembleia_documentos FOR SELECT TO anon USING (EXISTS (SELECT 1 FROM public.assembleias a WHERE a.id = assembleia_documentos.assembleia_id AND a.status != 'Rascunho'));

-- 4.5 Documentos Administrativos
CREATE POLICY "Permitir leitura anonima documentos_administrativos publicos" ON public.documentos_administrativos FOR SELECT TO anon USING (is_publico = true);
CREATE POLICY "Permitir tudo para autenticados em documentos_administrativos" ON public.documentos_administrativos FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- 4.6 Publicações
CREATE POLICY "Leitura publica de publicacoes" ON public.publicacoes FOR SELECT TO public USING (true);
CREATE POLICY "Admin pode gerenciar publicacoes" ON public.publicacoes FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- 4.7 Perfis
CREATE POLICY "Permitir leitura de perfis para autenticados" 
  ON public.perfis FOR SELECT TO authenticated USING (true);

CREATE POLICY "Superadmin pode gerenciar perfis" 
  ON public.perfis FOR ALL TO authenticated 
  USING (EXISTS (SELECT 1 FROM public.perfis p WHERE p.id = auth.uid() AND p.role = 'superadmin'))
  WITH CHECK (EXISTS (SELECT 1 FROM public.perfis p WHERE p.id = auth.uid() AND p.role = 'superadmin'));

-- 4.8 Boletins Semanais
CREATE POLICY "Leitura publica de boletins" ON public.boletins FOR SELECT TO public USING (status = 'Publicado');
CREATE POLICY "Admin pode gerenciar boletins" ON public.boletins FOR ALL TO authenticated USING (true) WITH CHECK (true);


-- ==========================================
-- 5. BUCKETS DE STORAGE (Arquivos em nuvem)
-- ==========================================

-- Bucket Financeiro (Comprovantes)
INSERT INTO storage.buckets (id, name, public) VALUES ('comprovantes', 'comprovantes', true) ON CONFLICT DO NOTHING;
CREATE POLICY "Autenticados gerenciam comprovantes" ON storage.objects FOR ALL TO authenticated USING (bucket_id = 'comprovantes') WITH CHECK (bucket_id = 'comprovantes');
CREATE POLICY "Leitura publica comprovantes" ON storage.objects FOR SELECT TO public USING (bucket_id = 'comprovantes');

-- Bucket do Sistema (Logos e Anexos Padrão)
INSERT INTO storage.buckets (id, name, public) VALUES ('sistema', 'sistema', true) ON CONFLICT DO NOTHING;
CREATE POLICY "Autenticados gerenciam sistema" ON storage.objects FOR ALL TO authenticated USING (bucket_id = 'sistema') WITH CHECK (bucket_id = 'sistema');
CREATE POLICY "Leitura publica sistema" ON storage.objects FOR SELECT TO public USING (bucket_id = 'sistema');

-- Bucket Fichas de Filiação (Anexos de Usuários)
INSERT INTO storage.buckets (id, name, public) VALUES ('documentos_filiados', 'documentos_filiados', true) ON CONFLICT (id) DO NOTHING;
CREATE POLICY "Autenticados gerenciam documentos filiados" ON storage.objects FOR ALL TO authenticated USING (bucket_id = 'documentos_filiados') WITH CHECK (bucket_id = 'documentos_filiados');
CREATE POLICY "Leitura publica documentos filiados" ON storage.objects FOR SELECT TO public USING (bucket_id = 'documentos_filiados');

-- Bucket Documentos Públicos (Publicações)
INSERT INTO storage.buckets (id, name, public) VALUES ('documentos_publicos', 'documentos_publicos', true) ON CONFLICT (id) DO NOTHING;
CREATE POLICY "Leitura publica no storage de publicacoes" ON storage.objects FOR SELECT TO public USING (bucket_id = 'documentos_publicos');
CREATE POLICY "Admin gerencia storage de publicacoes" ON storage.objects FOR ALL TO authenticated USING (bucket_id = 'documentos_publicos') WITH CHECK (bucket_id = 'documentos_publicos');

-- Bucket Boletins
INSERT INTO storage.buckets (id, name, public) VALUES ('boletins', 'boletins', true) ON CONFLICT (id) DO NOTHING;
CREATE POLICY "Leitura publica no storage de boletins" ON storage.objects FOR SELECT TO public USING (bucket_id = 'boletins');
CREATE POLICY "Admin gerencia storage de boletins" ON storage.objects FOR ALL TO authenticated USING (bucket_id = 'boletins') WITH CHECK (bucket_id = 'boletins');


-- ==========================================
-- 6. DADOS INICIAIS (SEED)
-- ==========================================

-- Seed: Configurações do Timbre Oficial
INSERT INTO public.configuracoes (id, titulo, secao_sindical, endereco, cep, filiacao, fundacao)
VALUES (
  1,
  'SINDICATO NACIONAL DOS SERVIDORES FEDERAIS DA EDUCAÇÃO BÁSICA, PROFISSIONAL E TECNOLÓGICA',
  'SINASEFE - SEÇÃO SINDICAL JATAÍ',
  'RUA RIACHUELO, 2090 – SETOR SAMUEL GRAHAM – JATAÍ/GO',
  'CEP: 75804-020',
  'FILIADO À CEA',
  'FUNDADO EM 16/05/2005'
) ON CONFLICT (id) DO NOTHING;

-- Seed: Locais base de assembleia
INSERT INTO public.locais (nome_curto, texto_completo) VALUES 
('Miniauditório 1 (Campus Jataí)', 'no Miniauditório 1 da unidade Flamboyant do Campus Jataí do Instituto Federal de Educação, Ciência e Tecnologia de Goiás – IFG, Av. Presidente Juscelino Kubitschek, nº 775, Residencial Flamboyant, CEP 75.804-714, no município de Jataí-GO'),
('Auditório Principal (Campus Jataí)', 'no Auditório Principal da unidade Flamboyant do Campus Jataí do Instituto Federal de Educação, Ciência e Tecnologia de Goiás – IFG, Av. Presidente Juscelino Kubitschek, nº 775, Residencial Flamboyant, CEP 75.804-714, no município de Jataí-GO')
ON CONFLICT DO NOTHING;

-- Seed: Categorias Financeiras padrão
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


-- ==========================================
-- 7. TRIGGERS DE AUDITORIA (LOGS NATIVOS)
-- ==========================================

-- Função Principal (SECURITY DEFINER para ter permissão de escrita sempre)
CREATE OR REPLACE FUNCTION process_audit_log() RETURNS TRIGGER AS $$
DECLARE
  v_user_id UUID;
  v_details JSONB;
BEGIN
  v_user_id := auth.uid();

  IF (TG_OP = 'DELETE') THEN
    v_details := jsonb_build_object('old_data', row_to_json(OLD));
  ELSIF (TG_OP = 'UPDATE') THEN
    v_details := jsonb_build_object('old_data', row_to_json(OLD), 'new_data', row_to_json(NEW));
  ELSIF (TG_OP = 'INSERT') THEN
    v_details := jsonb_build_object('new_data', row_to_json(NEW));
  END IF;

  INSERT INTO audit_logs (user_id, user_email, action, resource, details)
  VALUES (v_user_id, NULL, TG_OP, TG_TABLE_NAME, v_details);

  RETURN NULL;
EXCEPTION
  WHEN OTHERS THEN
    RAISE WARNING 'Audit log failed: %', SQLERRM;
    RETURN NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Triggers atrelados
CREATE TRIGGER audit_atas_trigger AFTER INSERT OR UPDATE OR DELETE ON atas FOR EACH ROW EXECUTE FUNCTION process_audit_log();
CREATE TRIGGER audit_assembleias_trigger AFTER INSERT OR UPDATE OR DELETE ON assembleias FOR EACH ROW EXECUTE FUNCTION process_audit_log();
CREATE TRIGGER audit_filiados_trigger AFTER INSERT OR UPDATE OR DELETE ON filiados FOR EACH ROW EXECUTE FUNCTION process_audit_log();
CREATE TRIGGER audit_financeiro_trigger AFTER INSERT OR UPDATE OR DELETE ON financeiro FOR EACH ROW EXECUTE FUNCTION process_audit_log();
CREATE TRIGGER audit_gestoes_trigger AFTER INSERT OR UPDATE OR DELETE ON gestoes FOR EACH ROW EXECUTE FUNCTION process_audit_log();
CREATE TRIGGER audit_membros_gestao_trigger AFTER INSERT OR UPDATE OR DELETE ON gestao_membros FOR EACH ROW EXECUTE FUNCTION process_audit_log();
CREATE TRIGGER audit_configuracoes_trigger AFTER INSERT OR UPDATE OR DELETE ON configuracoes FOR EACH ROW EXECUTE FUNCTION process_audit_log();
CREATE TRIGGER audit_perfis_trigger AFTER INSERT OR UPDATE OR DELETE ON public.perfis FOR EACH ROW EXECUTE FUNCTION process_audit_log();
CREATE TRIGGER audit_boletins_trigger AFTER INSERT OR UPDATE OR DELETE ON public.boletins FOR EACH ROW EXECUTE FUNCTION process_audit_log();


-- ==========================================
-- 7.1 TRIGGERS DE HARD LOCK FINANCEIRO
-- ==========================================

CREATE OR REPLACE FUNCTION trg_lock_financeiro_transacoes()
RETURNS TRIGGER AS $
DECLARE
  v_mes_ano TEXT;
  v_status TEXT;
BEGIN
  IF TG_OP = 'DELETE' THEN
    v_mes_ano := to_char(OLD.data, 'YYYY-MM');
  ELSE
    v_mes_ano := to_char(NEW.data, 'YYYY-MM');
  END IF;

  SELECT status INTO v_status FROM public.financeiro_prestacoes_mensais WHERE mes_ano = v_mes_ano;

  IF v_status = 'APROVADO' THEN
    RAISE EXCEPTION 'Não é permitido alterar ou remover transações de um mês com prestação de contas já aprovada pelo Conselho Fiscal.';
  END IF;

  IF TG_OP = 'UPDATE' AND NEW.data != OLD.data THEN
    v_mes_ano := to_char(OLD.data, 'YYYY-MM');
    SELECT status INTO v_status FROM public.financeiro_prestacoes_mensais WHERE mes_ano = v_mes_ano;
    IF v_status = 'APROVADO' THEN
      RAISE EXCEPTION 'Não é permitido alterar a data de uma transação que pertencia a um mês com prestação já aprovada.';
    END IF;
  END IF;

  IF TG_OP = 'DELETE' THEN RETURN OLD; END IF;
  RETURN NEW;
END;
$ LANGUAGE plpgsql;

CREATE TRIGGER trg_lock_financeiro_transacoes_bd BEFORE UPDATE OR DELETE ON public.financeiro FOR EACH ROW EXECUTE FUNCTION trg_lock_financeiro_transacoes();

CREATE OR REPLACE FUNCTION trg_lock_financeiro_transacoes_insert()
RETURNS TRIGGER AS $
DECLARE
  v_mes_ano TEXT;
  v_status TEXT;
BEGIN
  v_mes_ano := to_char(NEW.data, 'YYYY-MM');
  SELECT status INTO v_status FROM public.financeiro_prestacoes_mensais WHERE mes_ano = v_mes_ano;
  IF v_status = 'APROVADO' THEN
    RAISE EXCEPTION 'Não é permitido inserir novas transações num mês com prestação já aprovada.';
  END IF;
  RETURN NEW;
END;
$ LANGUAGE plpgsql;

CREATE TRIGGER trg_lock_financeiro_transacoes_ins BEFORE INSERT ON public.financeiro FOR EACH ROW EXECUTE FUNCTION trg_lock_financeiro_transacoes_insert();


-- ==========================================
-- 7.2 TRIGGER DE UPDATED_AT (PERFIS)
-- ==========================================

CREATE TRIGGER set_perfis_updated_at BEFORE UPDATE ON public.perfis FOR EACH ROW EXECUTE FUNCTION handle_updated_at();


-- ==========================================
-- 8. TAREFAS AGENDADAS (CRON)
-- ==========================================

-- Habilita extensão pg_cron para limpar logs antigos automaticamente
CREATE EXTENSION IF NOT EXISTS pg_cron;

-- Limpar logs mais velhos que 1 ano (Roda todo domingo à meia-noite)
SELECT cron.schedule('cleanup_old_audit_logs', '0 0 * * 0', $$
    DELETE FROM audit_logs WHERE created_at < NOW() - INTERVAL '1 year';
$$);


-- ==========================================
-- 9. ARMAZENAMENTO DE AVATARES (STORAGE)
-- ==========================================

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
