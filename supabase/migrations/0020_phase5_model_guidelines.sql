alter table public.agents add column if not exists recommended_tier public.model_tier not null default 'free';
alter table public.agents add column if not exists model_tier_override public.model_tier;
create table if not exists public.production_budget_guidelines (
  production_id uuid primary key references public.productions(id) on delete cascade,
  workspace_id uuid not null references public.workspaces(id) on delete cascade,
  guideline_credits bigint check (guideline_credits is null or guideline_credits >= 0),
  notes text not null default '', updated_at timestamptz not null default now()
);
alter table public.production_budget_guidelines enable row level security;
create policy "members manage production budget guidelines" on public.production_budget_guidelines for all to authenticated using (public.is_workspace_member(workspace_id)) with check (public.is_workspace_member(workspace_id));
