-- nBoxes — convites para membros entrarem numa box + acesso de leitura para membros
-- Rode este ficheiro no SQL Editor do teu projeto Supabase, depois das migrações anteriores.

create table if not exists invites (
  id uuid primary key default gen_random_uuid(),
  box_id uuid references boxes(id) on delete cascade not null,
  band_id uuid references bands(id) on delete cascade not null,
  member_id uuid references members(id) on delete cascade not null,
  token text not null unique default encode(gen_random_bytes(16), 'hex'),
  created_by uuid references auth.users(id) on delete set null,
  used_by uuid references auth.users(id) on delete set null,
  used_at timestamptz,
  created_at timestamptz not null default now()
);

alter table invites enable row level security;

create policy "invites: owner gerencia convites da sua box"
  on invites for all
  using (exists (select 1 from boxes b where b.id = invites.box_id and b.owner_id = auth.uid()))
  with check (exists (select 1 from boxes b where b.id = invites.box_id and b.owner_id = auth.uid()));

-- ============ FUNÇÕES ============
-- security definer: correm com o owner da função (postgres, que tem BYPASSRLS no Supabase),
-- por isso conseguem validar/consumir um convite sem expor a tabela `invites` publicamente.

create or replace function public.get_invite(p_token text)
returns table (
  box_id uuid,
  box_name text,
  band_name text,
  member_name text,
  used_at timestamptz
)
language sql
security definer
set search_path = public
as $$
  select i.box_id, b.box_name, bd.name, m.name, i.used_at
  from invites i
  join boxes b on b.id = i.box_id
  join bands bd on bd.id = i.band_id
  join members m on m.id = i.member_id
  where i.token = p_token;
$$;

grant execute on function public.get_invite(text) to anon, authenticated;

create or replace function public.accept_invite(p_token text)
returns table (box_id uuid)
language plpgsql
security definer
set search_path = public
as $$
declare
  v_invite invites%rowtype;
begin
  select * into v_invite from invites where token = p_token and used_at is null;
  if not found then
    raise exception 'Convite inválido ou já utilizado';
  end if;

  update members set user_id = auth.uid() where id = v_invite.member_id;
  update invites set used_by = auth.uid(), used_at = now() where id = v_invite.id;

  return query select v_invite.box_id;
end;
$$;

grant execute on function public.accept_invite(text) to authenticated;

create or replace function public.is_box_member(p_box_id uuid)
returns boolean
language sql
security definer
stable
set search_path = public
as $$
  select exists (
    select 1 from members m
    join bands bd on bd.id = m.band_id
    where bd.box_id = p_box_id and m.user_id = auth.uid()
  );
$$;

grant execute on function public.is_box_member(uuid) to authenticated;

-- ============ ACESSO DE LEITURA PARA MEMBROS ============
-- O owner continua com controlo total (políticas já existentes). Estas políticas
-- adicionam acesso de leitura para quem foi convidado e aceitou (members.user_id = auth.uid()).

create policy "boxes: membros podem ver a sua box"
  on boxes for select
  using (public.is_box_member(boxes.id));

create policy "bands: membros podem ver bandas da sua box"
  on bands for select
  using (public.is_box_member(bands.box_id));

create policy "members: membros podem ver colegas da sua box"
  on members for select
  using (public.is_box_member((select bd.box_id from bands bd where bd.id = members.band_id)));

create policy "schedules: membros podem gerenciar a agenda da sua box"
  on schedules for all
  using (public.is_box_member(schedules.box_id))
  with check (public.is_box_member(schedules.box_id));

create policy "expenses: membros podem ver despesas da sua box"
  on expenses for select
  using (public.is_box_member(expenses.box_id));
