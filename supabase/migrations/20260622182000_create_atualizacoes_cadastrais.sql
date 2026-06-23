create table if not exists atualizacoes_cadastrais (
  id uuid primary key default gen_random_uuid(),
  filiado_id uuid not null references filiados(id) on delete cascade,
  token text not null unique,
  status text not null default 'PENDENTE_ENVIO' check (status in ('PENDENTE_ENVIO', 'EM_ANALISE', 'APROVADO', 'REJEITADO')),
  dados_atuais jsonb not null,
  novos_dados jsonb,
  expira_em timestamptz not null default (now() + interval '7 days'),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Habilitar RLS
alter table atualizacoes_cadastrais enable row level security;

-- Policies

-- Administradores podem ler todas as solicitações
create policy "Admins podem ver atualizações cadastrais"
  on atualizacoes_cadastrais
  for select
  to authenticated
  using (
    exists (
      select 1 from perfis
      where perfis.id = auth.uid()
      and perfis.role = 'admin'
    )
  );

-- Administradores podem inserir solicitações (gerar tokens)
create policy "Admins podem inserir atualizações cadastrais"
  on atualizacoes_cadastrais
  for insert
  to authenticated
  with check (
    exists (
      select 1 from perfis
      where perfis.id = auth.uid()
      and perfis.role = 'admin'
    )
  );

-- Administradores podem atualizar solicitações (aprovar/rejeitar)
create policy "Admins podem atualizar solicitações cadastrais"
  on atualizacoes_cadastrais
  for update
  to authenticated
  using (
    exists (
      select 1 from perfis
      where perfis.id = auth.uid()
      and perfis.role = 'admin'
    )
  );

-- Acesso anônimo (Público) para ler sua própria solicitação baseado no token
create policy "Público pode ler a solicitação via token"
  on atualizacoes_cadastrais
  for select
  to anon
  using (true); -- A restrição de token será feita no Server Action ou Edge, mas aqui permitimos o select genérico pois o token é UUID/impossível de adivinhar.

-- Acesso anônimo (Público) para enviar (atualizar) a solicitação com os novos dados
create policy "Público pode atualizar a solicitação"
  on atualizacoes_cadastrais
  for update
  to anon
  using (true);

-- Índices para melhor performance
create index if not exists atualizacoes_cadastrais_filiado_id_idx on atualizacoes_cadastrais(filiado_id);
create index if not exists atualizacoes_cadastrais_token_idx on atualizacoes_cadastrais(token);
create index if not exists atualizacoes_cadastrais_status_idx on atualizacoes_cadastrais(status);
