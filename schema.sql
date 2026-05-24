-- Schema for SINASEFE Jataí Union Management System

-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- 1. Table: filiados
create table public.filiados (
    id uuid primary key default uuid_generate_v4(),
    nome text not null,
    email text,
    telefone text,
    siape text,
    cargo text,
    ativo boolean default true,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 2. Table: assembleias
create table public.assembleias (
    id uuid primary key default uuid_generate_v4(),
    numero text,
    tipo text, -- Ordinária, Extraordinária
    data_realizacao date not null,
    horario_1a_convocacao time not null,
    horario_2a_convocacao time not null,
    local text not null,
    pautas text[],
    status text default 'Agendada', -- Agendada, Realizada, Cancelada
    created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 3. Table: presencas
create table public.presencas (
    id uuid primary key default uuid_generate_v4(),
    assembleia_id uuid references public.assembleias(id) on delete cascade not null,
    filiado_id uuid references public.filiados(id) on delete set null,
    nome_manual text,
    siape_manual text,
    cargo_manual text,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 4. Table: atas
create table public.atas (
    id uuid primary key default uuid_generate_v4(),
    assembleia_id uuid references public.assembleias(id) on delete restrict unique not null,
    numero text,
    conteudo_rich text,
    redator text,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 5. Table: financeiro
create table public.financeiro (
    id uuid primary key default uuid_generate_v4(),
    tipo text not null check (tipo in ('Entrada', 'Saída')),
    data date not null,
    descricao text not null,
    valor numeric(10,2) not null,
    categoria text not null,
    comprovante_url text,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable RLS on all tables
alter table public.filiados enable row level security;
alter table public.assembleias enable row level security;
alter table public.presencas enable row level security;
alter table public.atas enable row level security;
alter table public.financeiro enable row level security;

-- Create basic RLS policies for authenticated users
-- Administradores do sindicato
create policy "Enable full access for authenticated users on filiados" 
on public.filiados for all to authenticated using (true) with check (true);

create policy "Enable full access for authenticated users on assembleias" 
on public.assembleias for all to authenticated using (true) with check (true);

create policy "Enable full access for authenticated users on presencas" 
on public.presencas for all to authenticated using (true) with check (true);

create policy "Enable full access for authenticated users on atas" 
on public.atas for all to authenticated using (true) with check (true);

create policy "Enable full access for authenticated users on financeiro" 
on public.financeiro for all to authenticated using (true) with check (true);

-- Storage for financial receipts (comprovantes)
insert into storage.buckets (id, name, public) values ('comprovantes', 'comprovantes', true) on conflict do nothing;

create policy "Enable full access for authenticated users on comprovantes"
on storage.objects for all to authenticated using (bucket_id = 'comprovantes') with check (bucket_id = 'comprovantes');

create policy "Enable public read access on comprovantes"
on storage.objects for select to public using (bucket_id = 'comprovantes');

-- 6. Table: configuracoes (Header Layout Configurations)
create table public.configuracoes (
    id integer primary key default 1 check (id = 1),
    titulo text not null default 'SINDICATO NACIONAL DOS SERVIDORES FEDERAIS DA EDUCAÇÃO BÁSICA, PROFISSIONAL E TECNOLÓGICA',
    secao_sindical text not null default 'SINASEFE - SEÇÃO SINDICAL JATAÍ',
    endereco text not null default 'RUA RIACHUELO, 2090 – SETOR SAMUEL GRAHAM – JATAÍ/GO',
    cep text not null default 'CEP: 75804-020',
    filiacao text not null default 'FILIADO À CEA',
    fundacao text not null default 'FUNDADO EM 16/05/2005',
    logo_url text,
    updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable RLS on configuracoes
alter table public.configuracoes enable row level security;

-- Policies for configuracoes
create policy "Allow public read access on configuracoes" on public.configuracoes for select using (true);
create policy "Allow full access for authenticated users on configuracoes" on public.configuracoes for all to authenticated using (true) with check (true);

-- Storage bucket for system files (logos)
insert into storage.buckets (id, name, public) values ('sistema', 'sistema', true) on conflict do nothing;

create policy "Allow full access for authenticated users on sistema bucket"
on storage.objects for all to authenticated using (bucket_id = 'sistema') with check (bucket_id = 'sistema');

create policy "Allow public read access on sistema bucket"
on storage.objects for select to public using (bucket_id = 'sistema');

-- Insert initial seed data
insert into public.configuracoes (id, titulo, secao_sindical, endereco, cep, filiacao, fundacao)
values (
  1,
  'SINDICATO NACIONAL DOS SERVIDORES FEDERAIS DA EDUCAÇÃO BÁSICA, PROFISSIONAL E TECNOLÓGICA',
  'SINASEFE - SEÇÃO SINDICAL JATAÍ',
  'RUA RIACHUELO, 2090 – SETOR SAMUEL GRAHAM – JATAÍ/GO',
  'CEP: 75804-020',
  'FILIADO À CEA',
  'FUNDADO EM 16/05/2005'
) on conflict (id) do nothing;
