create table if not exists public.social_reports (
  id uuid primary key default gen_random_uuid(), workspace_id uuid not null references public.workspaces(id) on delete cascade,
  release_package_id uuid not null references public.release_packages(id) on delete cascade,
  report_type text not null check (report_type in ('performance','conversation','interaction')),
  metrics jsonb not null default '{}'::jsonb, notes text not null default '', captured_at timestamptz not null default now()
);
alter table public.social_reports enable row level security;
create policy "members manage social reports" on public.social_reports for all to authenticated using (public.is_workspace_member(workspace_id)) with check (public.is_workspace_member(workspace_id));
create index if not exists social_reports_package_idx on public.social_reports(release_package_id, captured_at desc);
