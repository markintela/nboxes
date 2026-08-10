-- nBoxes — schema Supabase
-- Rode este ficheiro no SQL Editor do teu projeto Supabase.

create extension if not exists pgcrypto;

-- ============ TABELAS ============

create table if not exists boxes (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid references auth.users(id) on delete cascade not null,
  complex_name text not null,
  complex_number text,
  box_number text,
  box_name text not null,
  split_method text not null default 'membro' check (split_method in ('membro', 'banda')),
  created_at timestamptz not null default now()
);

create table if not exists bands (
  id uuid primary key default gen_random_uuid(),
  box_id uuid references boxes(id) on delete cascade not null,
  name text not null,
  created_at timestamptz not null default now()
);

create table if not exists members (
  id uuid primary key default gen_random_uuid(),
  band_id uuid references bands(id) on delete cascade not null,
  user_id uuid references auth.users(id) on delete set null,
  name text not null,
  is_admin boolean not null default false,
  created_at timestamptz not null default now()
);

create table if not exists schedules (
  id uuid primary key default gen_random_uuid(),
  box_id uuid references boxes(id) on delete cascade not null,
  band_id uuid references bands(id) on delete set null,
  name text not null,
  type text not null check (type in ('Ensaio', 'Gravação', 'Ajuste', 'Outros')),
  day int not null,
  month int not null,
  year int not null,
  time text not null,
  created_at timestamptz not null default now()
);

create table if not exists expenses (
  id uuid primary key default gen_random_uuid(),
  box_id uuid references boxes(id) on delete cascade not null,
  tipo text not null check (tipo in ('Água', 'Luz', 'Internet', 'Outro')),
  valor numeric not null default 0,
  mes text not null,
  created_at timestamptz not null default now()
);

-- ============ ROW LEVEL SECURITY ============
-- Modelo simples do protótipo: o dono (owner_id) da box tem controlo total
-- sobre a box e tudo o que pertence a ela. Evolui isto para múltiplos
-- administradores por box assim que precisares (junta uma tabela
-- box_admins e troca as condições abaixo por "exists (select 1 from box_admins ...)").

alter table boxes enable row level security;
alter table bands enable row level security;
alter table members enable row level security;
alter table schedules enable row level security;
alter table expenses enable row level security;

create policy "boxes: owner tem acesso total"
  on boxes for all
  using (owner_id = auth.uid())
  with check (owner_id = auth.uid());

create policy "bands: acesso via box do owner"
  on bands for all
  using (exists (select 1 from boxes b where b.id = bands.box_id and b.owner_id = auth.uid()))
  with check (exists (select 1 from boxes b where b.id = bands.box_id and b.owner_id = auth.uid()));

create policy "members: acesso via banda/box do owner"
  on members for all
  using (exists (
    select 1 from bands bd join boxes b on b.id = bd.box_id
    where bd.id = members.band_id and b.owner_id = auth.uid()
  ))
  with check (exists (
    select 1 from bands bd join boxes b on b.id = bd.box_id
    where bd.id = members.band_id and b.owner_id = auth.uid()
  ));

create policy "schedules: acesso via box do owner"
  on schedules for all
  using (exists (select 1 from boxes b where b.id = schedules.box_id and b.owner_id = auth.uid()))
  with check (exists (select 1 from boxes b where b.id = schedules.box_id and b.owner_id = auth.uid()));

create policy "expenses: acesso via box do owner"
  on expenses for all
  using (exists (select 1 from boxes b where b.id = expenses.box_id and b.owner_id = auth.uid()))
  with check (exists (select 1 from boxes b where b.id = expenses.box_id and b.owner_id = auth.uid()));
