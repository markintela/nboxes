-- nBoxes — adiciona tabela de perfis (nome + nacionalidade)
-- Rode este ficheiro no SQL Editor do teu projeto Supabase, depois do schema.sql.

create table if not exists profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  name text not null,
  nationality text not null,
  created_at timestamptz not null default now()
);

alter table profiles enable row level security;

create policy "profiles: dono tem acesso total ao proprio perfil"
  on profiles for all
  using (id = auth.uid())
  with check (id = auth.uid());
