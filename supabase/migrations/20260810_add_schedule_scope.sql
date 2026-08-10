-- nBoxes — adiciona escopo (banda inteira ou membro individual) aos agendamentos
-- Rode este ficheiro no SQL Editor do teu projeto Supabase, depois do schema.sql.

alter table schedules
  add column if not exists scope text not null default 'banda' check (scope in ('banda', 'individual')),
  add column if not exists member_id uuid references members(id) on delete set null;
