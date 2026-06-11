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
    unidade_lotacao TEXT,
    campus TEXT,
    categoria TEXT, -- 'Técnico Administrativo' | 'Docente'
    situacao TEXT, -- 'Ativo' | 'Aposentado'
    status_filiacao TEXT DEFAULT 'aprovado', -- 'pendente' | 'aprovado'
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

-- 2.7 Financeiro (Livro Caixa e Comprovantes)
CREATE TABLE public.financeiro (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tipo TEXT NOT NULL CHECK (tipo in ('Entrada', 'Saída')),
    data DATE NOT NULL,
    descricao TEXT NOT NULL,
    valor NUMERIC(10,2) NOT NULL,
    categoria TEXT NOT NULL,
    comprovante_url TEXT,
    banco_id TEXT UNIQUE, -- ID único da transação bancária vinda do extrato OFX (evita duplicidade).
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 2.8 Histórico de Gestões e Diretoria
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
  ordem INTEGER NOT NULL DEFAULT 99,
  criado_em TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2.9 Mensagens (Fale Conosco Portal Público)
CREATE TABLE public.mensagens (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  nome TEXT NOT NULL,
  email TEXT NOT NULL,
  assunto TEXT,
  mensagem TEXT NOT NULL,
  lida BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 2.10 Configurações Globais (Timbres Oficiais)
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


-- 2.11 Auditoria (Logs do Sistema)
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


-- ==========================================
-- 3. HABILITANDO SEGURANÇA DE LINHAS (RLS)
-- ==========================================
ALTER TABLE public.filiados ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.assembleias ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.locais ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.presencas ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.atas ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.assembleia_documentos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.financeiro ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.gestoes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.gestao_membros ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.mensagens ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.configuracoes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;

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

-- 4.2. PERMISSÕES DO PORTAL PÚBLICO (Usuários Anonimos)
-- Qualquer visitante pode ver as configurações e layouts timbrados
CREATE POLICY "Permitir leitura publica de configuracoes" ON public.configuracoes FOR SELECT TO anon USING (true);
-- Qualquer visitante pode ler as gestões
CREATE POLICY "Permitir leitura publica de gestoes" ON public.gestoes FOR SELECT TO anon USING (true);
CREATE POLICY "Permitir leitura publica de gestao_membros" ON public.gestao_membros FOR SELECT TO anon USING (true);
-- Qualquer visitante pode enviar mensagem de contato
CREATE POLICY "Permitir envio de mensagem publica" ON public.mensagens FOR INSERT TO anon WITH CHECK (true);
-- Qualquer visitante pode pedir filiação, mas forçando o status para pendente
CREATE POLICY "Permitir pedido de filiacao" ON public.filiados FOR INSERT TO anon WITH CHECK (status_filiacao = 'pendente');
-- Visitantes podem ver assembleias publicadas (não rascunho) e seus anexos
CREATE POLICY "Permitir leitura publica de assembleias" ON public.assembleias FOR SELECT TO anon USING (status != 'Rascunho');
CREATE POLICY "Permitir leitura publica de anexos assembleia" ON public.assembleia_documentos FOR SELECT TO anon USING (EXISTS (SELECT 1 FROM public.assembleias a WHERE a.id = assembleia_documentos.assembleia_id AND a.status != 'Rascunho'));


-- ==========================================
-- 5. BUCKETS DE STORAGE (Arquivos em nuvem)
-- ==========================================
-- Bucket Financeiro
INSERT INTO storage.buckets (id, name, public) VALUES ('comprovantes', 'comprovantes', true) ON CONFLICT DO NOTHING;
CREATE POLICY "Autenticados gerenciam comprovantes" ON storage.objects FOR ALL TO authenticated USING (bucket_id = 'comprovantes') WITH CHECK (bucket_id = 'comprovantes');
CREATE POLICY "Leitura publica comprovantes" ON storage.objects FOR SELECT TO public USING (bucket_id = 'comprovantes');

-- Bucket do Sistema (Logos e Anexos Padrão)
INSERT INTO storage.buckets (id, name, public) VALUES ('sistema', 'sistema', true) ON CONFLICT DO NOTHING;
CREATE POLICY "Autenticados gerenciam sistema" ON storage.objects FOR ALL TO authenticated USING (bucket_id = 'sistema') WITH CHECK (bucket_id = 'sistema');
CREATE POLICY "Leitura publica sistema" ON storage.objects FOR SELECT TO public USING (bucket_id = 'sistema');


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
-- 9. ATUALIZA��ES RECENTES  
-- ========================================== 

-- 9.1 Tabela Documentos Administrativos (Recibos, Portarias, Ofícios, etc)
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

-- 9.2 Tabela Publicações (Arquivos Externos)
CREATE TABLE IF NOT EXISTS public.publicacoes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  titulo TEXT NOT NULL,
  categoria TEXT NOT NULL,
  arquivo_url TEXT NOT NULL,
  data_publicacao DATE NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 9.3 RLS e Policies para Documentos Administrativos
ALTER TABLE public.documentos_administrativos ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Permitir leitura anonima documentos_administrativos publicos" ON public.documentos_administrativos FOR SELECT TO anon USING (is_publico = true);
CREATE POLICY "Permitir tudo para autenticados em documentos_administrativos" ON public.documentos_administrativos FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- 9.4 RLS e Policies para Publicações
ALTER TABLE public.publicacoes ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Leitura publica de publicacoes" ON public.publicacoes FOR SELECT TO public USING (true);
CREATE POLICY "Admin pode gerenciar publicacoes" ON public.publicacoes FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- 9.5 Storage Bucket para Documentos Públicos
INSERT INTO storage.buckets (id, name, public) VALUES ('documentos_publicos', 'documentos_publicos', true) ON CONFLICT (id) DO NOTHING;
CREATE POLICY "Leitura publica no storage de publicacoes" ON storage.objects FOR SELECT TO public USING (bucket_id = 'documentos_publicos');
CREATE POLICY "Admin gerencia storage de publicacoes" ON storage.objects FOR ALL TO authenticated USING (bucket_id = 'documentos_publicos') WITH CHECK (bucket_id = 'documentos_publicos');

-- FIM DA ATUALIZAÇÃO

-- ==========================================
-- 10. GESTÃO DE ACESSOS E PERFIS
-- ==========================================

-- 10.1 Tabela de Perfis
CREATE TABLE IF NOT EXISTS public.perfis (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    role TEXT NOT NULL CHECK (role IN ('superadmin', 'diretoria', 'filiado')),
    filiado_id UUID REFERENCES public.filiados(id) ON DELETE SET NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 10.2 Vínculo em Gestão Membros
ALTER TABLE public.gestao_membros ADD COLUMN IF NOT EXISTS filiado_id UUID REFERENCES public.filiados(id) ON DELETE SET NULL;

-- 10.3 RLS para Perfis
ALTER TABLE public.perfis ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Permitir leitura de perfis para autenticados" 
  ON public.perfis FOR SELECT TO authenticated USING (true);

CREATE POLICY "Superadmin pode gerenciar perfis" 
  ON public.perfis FOR ALL TO authenticated 
  USING (EXISTS (SELECT 1 FROM public.perfis p WHERE p.id = auth.uid() AND p.role = 'superadmin'))
  WITH CHECK (EXISTS (SELECT 1 FROM public.perfis p WHERE p.id = auth.uid() AND p.role = 'superadmin'));

-- Trigger Update
CREATE TRIGGER set_perfis_updated_at BEFORE UPDATE ON public.perfis FOR EACH ROW EXECUTE FUNCTION handle_updated_at();

-- Auditoria
CREATE TRIGGER audit_perfis_trigger AFTER INSERT OR UPDATE OR DELETE ON public.perfis FOR EACH ROW EXECUTE FUNCTION process_audit_log();
