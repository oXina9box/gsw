create table if not exists public.production_lane_plans (
  id uuid primary key default gen_random_uuid(), workspace_id uuid not null references public.workspaces(id) on delete cascade,
  production_id uuid not null references public.productions(id) on delete cascade, lane_name text not null, lane_kind text not null,
  required_count integer not null default 1 check (required_count > 0), source jsonb not null default '{}'::jsonb,
  status text not null default 'planned' check (status in ('planned','active','complete')), created_at timestamptz not null default now(), updated_at timestamptz not null default now()
);
create table if not exists public.production_dna_sheets (
  id uuid primary key default gen_random_uuid(), workspace_id uuid not null references public.workspaces(id) on delete cascade,
  production_id uuid not null references public.productions(id) on delete cascade, entity_key text not null, version integer not null default 1 check (version > 0), sheet jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(), updated_at timestamptz not null default now(), unique (production_id, entity_key, version)
);
create table if not exists public.provider_handoff_artifacts (
  id uuid primary key default gen_random_uuid(), workspace_id uuid not null references public.workspaces(id) on delete cascade,
  production_id uuid not null references public.productions(id) on delete cascade, kind text not null check (kind in ('prompt','result','image','video','audio')),
  provider text, payload jsonb not null default '{}'::jsonb, storage_path text, status text not null default 'ready' check (status in ('ready','imported','rejected')), created_at timestamptz not null default now()
);
alter table public.production_lane_plans enable row level security; alter table public.production_dna_sheets enable row level security; alter table public.provider_handoff_artifacts enable row level security;
create policy "members manage production lane plans" on public.production_lane_plans for all to authenticated using (public.is_workspace_member(workspace_id)) with check (public.is_workspace_member(workspace_id));
create policy "members manage production dna sheets" on public.production_dna_sheets for all to authenticated using (public.is_workspace_member(workspace_id)) with check (public.is_workspace_member(workspace_id));
create policy "members manage provider handoff artifacts" on public.provider_handoff_artifacts for all to authenticated using (public.is_workspace_member(workspace_id)) with check (public.is_workspace_member(workspace_id));
create index if not exists production_lane_plans_idx on public.production_lane_plans(production_id);
create index if not exists production_dna_sheets_idx on public.production_dna_sheets(production_id, entity_key);
