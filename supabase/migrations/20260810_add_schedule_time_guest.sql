-- nBoxes — adiciona hora final e agendamento para convidados
-- Rode este ficheiro no SQL Editor do teu projeto Supabase, depois das migrações anteriores.

alter table schedules
  add column if not exists end_time text,
  add column if not exists guest_name text;

alter table schedules drop constraint if exists schedules_scope_check;
alter table schedules add constraint schedules_scope_check check (scope in ('banda', 'individual', 'convidado'));
