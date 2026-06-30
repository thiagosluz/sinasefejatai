create table if not exists public.configuracoes_sistema (
    chave text primary key,
    valor jsonb not null,
    atualizado_em timestamp with time zone default timezone('utc'::text, now()) not null
);

alter table public.configuracoes_sistema enable row level security;

drop policy if exists "Apenas admins gerenciam configuracoes" on public.configuracoes_sistema;
create policy "Apenas admins gerenciam configuracoes"
    on public.configuracoes_sistema
    for all
    to authenticated
    using (true)
    with check (true);

create table if not exists public.historico_emails_aniversario (
    id uuid default gen_random_uuid() primary key,
    filiado_id uuid references public.filiados(id) on delete set null,
    filiado_nome text not null,
    filiado_email text not null,
    enviado_em timestamp with time zone default timezone('utc'::text, now()) not null,
    status text not null check (status in ('sucesso', 'falha')),
    erro_msg text
);

alter table public.historico_emails_aniversario enable row level security;

drop policy if exists "Apenas admins leem o histórico de emails" on public.historico_emails_aniversario;
create policy "Apenas admins leem o histórico de emails"
    on public.historico_emails_aniversario
    for select
    to authenticated
    using (true);

insert into public.configuracoes_sistema (chave, valor)
values (
    'automacao_aniversarios', 
    '{"ativo": false, "horario": "09:00", "schedule_id": null}'::jsonb
) on conflict (chave) do nothing;
