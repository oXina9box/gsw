create table if not exists public.assembly_decisions (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references public.workspaces(id) on delete cascade,
  production_id uuid not null references public.productions(id) on delete cascade,
  shot_id uuid not null references public.genplay_shots(id) on delete cascade,
  position integer not null check (position >= 0),
  keep boolean not null default true,
  trim_start_ms integer not null default 0 check (trim_start_ms >= 0),
  trim_end_ms integer check (trim_end_ms is null or trim_end_ms >= trim_start_ms),
  audio_choice text,
  notes text not null default '',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (production_id, shot_id)
);
alter table public.assembly_decisions enable row level security;
create policy "members manage assembly decisions" on public.assembly_decisions for all to authenticated using (public.is_workspace_member(workspace_id)) with check (public.is_workspace_member(workspace_id));
create index if not exists assembly_decisions_order_idx on public.assembly_decisions(production_id, position);
