create table if not exists public.onboarding_profiles (
  workspace_id uuid primary key references public.workspaces(id) on delete cascade,
  mode text not null default 'guided' check (mode in ('guided', 'fast')),
  step text not null default 'identity' check (step in ('identity', 'channel', 'hiring', 'complete')),
  studio_identity jsonb not null default '{}'::jsonb,
  channel_setup jsonb not null default '{}'::jsonb,
  department_setup jsonb not null default '{}'::jsonb,
  completed_at timestamptz,
  updated_at timestamptz not null default now()
);
alter table public.onboarding_profiles enable row level security;
create policy "members manage onboarding" on public.onboarding_profiles for all to authenticated using (public.is_workspace_member(workspace_id)) with check (public.is_workspace_member(workspace_id));
