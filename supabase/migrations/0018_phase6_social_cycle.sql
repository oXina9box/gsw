alter table public.signals add column if not exists promoted_to_brief_at timestamptz;
create table if not exists public.signal_promotion_events (
  id uuid primary key default gen_random_uuid(), workspace_id uuid not null references public.workspaces(id) on delete cascade,
  signal_id uuid not null references public.signals(id) on delete cascade, production_id uuid references public.productions(id) on delete set null,
  created_at timestamptz not null default now()
);
alter table public.signal_promotion_events enable row level security;
create policy "members read signal promotion events" on public.signal_promotion_events for select to authenticated using (public.is_workspace_member(workspace_id));
create table if not exists public.release_packages (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references public.workspaces(id) on delete cascade,
  production_id uuid not null references public.productions(id) on delete cascade,
  platform text not null check (platform in ('youtube','x','tiktok','instagram','facebook')),
  caption text not null default '',
  metadata jsonb not null default '{}'::jsonb,
  status text not null default 'draft' check (status in ('draft','ready','approved','published')),
  approved_at timestamptz,
  published_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
alter table public.release_packages enable row level security;
create policy "members manage release packages" on public.release_packages for all to authenticated using (public.is_workspace_member(workspace_id)) with check (public.is_workspace_member(workspace_id));
create index if not exists release_packages_production_idx on public.release_packages(production_id, platform);
