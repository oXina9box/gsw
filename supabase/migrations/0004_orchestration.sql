create table public.workflows (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references public.workspaces(id) on delete cascade,
  name text not null,
  description text not null default '',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (workspace_id, name)
);

create table public.handoff_rules (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references public.workspaces(id) on delete cascade,
  workflow_id uuid not null references public.workflows(id) on delete cascade,
  position integer not null default 0,
  source_kind text not null check (source_kind in ('lane', 'agent')),
  source_lane_id uuid references public.lanes(id) on delete set null,
  source_agent_id uuid references public.agents(id) on delete set null,
  target_kind text not null check (target_kind in ('lane', 'agent')),
  target_lane_id uuid references public.lanes(id) on delete set null,
  target_agent_id uuid references public.agents(id) on delete set null,
  trigger_event text not null default 'completion' check (trigger_event in ('completion', 'approval', 'manual', 'timeout')),
  conditions jsonb not null default '[]'::jsonb,
  payload_mapping jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  check ((source_kind = 'lane' and source_lane_id is not null and source_agent_id is null)
    or (source_kind = 'agent' and source_agent_id is not null and source_lane_id is null)),
  check ((target_kind = 'lane' and target_lane_id is not null and target_agent_id is null)
    or (target_kind = 'agent' and target_agent_id is not null and target_lane_id is null))
);

create table public.executions (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references public.workspaces(id) on delete cascade,
  workflow_id uuid not null references public.workflows(id) on delete cascade,
  status text not null default 'pending' check (status in ('pending', 'running', 'completed', 'failed', 'cancelled')),
  current_lane_id uuid references public.lanes(id) on delete set null,
  current_agent_id uuid references public.agents(id) on delete set null,
  context jsonb not null default '{}'::jsonb,
  started_at timestamptz,
  completed_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.execution_steps (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references public.workspaces(id) on delete cascade,
  execution_id uuid not null references public.executions(id) on delete cascade,
  handoff_rule_id uuid references public.handoff_rules(id) on delete set null,
  source_kind text check (source_kind in ('lane', 'agent')),
  source_lane_id uuid,
  source_agent_id uuid,
  target_kind text check (target_kind in ('lane', 'agent')),
  target_lane_id uuid,
  target_agent_id uuid,
  status text not null default 'pending' check (status in ('pending', 'running', 'completed', 'failed', 'skipped')),
  input_payload jsonb not null default '{}'::jsonb,
  output_payload jsonb not null default '{}'::jsonb,
  error_message text,
  started_at timestamptz,
  completed_at timestamptz,
  created_at timestamptz not null default now()
);

create table public.orchestration_events (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references public.workspaces(id) on delete cascade,
  execution_id uuid not null references public.executions(id) on delete cascade,
  event_type text not null,
  actor_type text check (actor_type in ('user', 'agent', 'system')),
  actor_id uuid,
  payload jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create index workflows_workspace_idx on public.workflows(workspace_id);
create index handoff_rules_workflow_idx on public.handoff_rules(workflow_id, position);
create index executions_workspace_idx on public.executions(workspace_id);
create index executions_workflow_idx on public.executions(workflow_id);
create index execution_steps_execution_idx on public.execution_steps(execution_id, created_at);
create index orchestration_events_execution_idx on public.orchestration_events(execution_id, created_at desc);

alter table public.workflows enable row level security;
alter table public.handoff_rules enable row level security;
alter table public.executions enable row level security;
alter table public.execution_steps enable row level security;
alter table public.orchestration_events enable row level security;

create policy "members read workflows" on public.workflows for select to authenticated using (public.is_workspace_member(workspace_id));
create policy "members create workflows" on public.workflows for insert to authenticated with check (public.is_workspace_member(workspace_id));
create policy "members update workflows" on public.workflows for update to authenticated using (public.is_workspace_member(workspace_id)) with check (public.is_workspace_member(workspace_id));
create policy "members delete workflows" on public.workflows for delete to authenticated using (public.is_workspace_member(workspace_id));

create policy "members read handoff rules" on public.handoff_rules for select to authenticated using (
  public.is_workspace_member(workspace_id)
  and exists (select 1 from public.workflows where id = workflow_id and workspace_id = handoff_rules.workspace_id)
);
create policy "members create handoff rules" on public.handoff_rules for insert to authenticated with check (
  public.is_workspace_member(workspace_id)
  and exists (select 1 from public.workflows where id = workflow_id and workspace_id = handoff_rules.workspace_id)
);
create policy "members delete handoff rules" on public.handoff_rules for delete to authenticated using (
  public.is_workspace_member(workspace_id)
  and exists (select 1 from public.workflows where id = workflow_id and workspace_id = handoff_rules.workspace_id)
);

create policy "members read executions" on public.executions for select to authenticated using (
  public.is_workspace_member(workspace_id)
  and exists (select 1 from public.workflows where id = workflow_id and workspace_id = executions.workspace_id)
);
create policy "members create executions" on public.executions for insert to authenticated with check (
  public.is_workspace_member(workspace_id)
  and exists (select 1 from public.workflows where id = workflow_id and workspace_id = executions.workspace_id)
);
create policy "members update executions" on public.executions for update to authenticated using (
  public.is_workspace_member(workspace_id)
  and exists (select 1 from public.workflows where id = workflow_id and workspace_id = executions.workspace_id)
) with check (
  public.is_workspace_member(workspace_id)
  and exists (select 1 from public.workflows where id = workflow_id and workspace_id = executions.workspace_id)
);

create policy "members read execution steps" on public.execution_steps for select to authenticated using (
  public.is_workspace_member(workspace_id)
  and exists (select 1 from public.executions where id = execution_id and workspace_id = execution_steps.workspace_id)
);
create policy "members create execution steps" on public.execution_steps for insert to authenticated with check (
  public.is_workspace_member(workspace_id)
  and exists (select 1 from public.executions where id = execution_id and workspace_id = execution_steps.workspace_id)
);
create policy "members update execution steps" on public.execution_steps for update to authenticated using (
  public.is_workspace_member(workspace_id)
  and exists (select 1 from public.executions where id = execution_id and workspace_id = execution_steps.workspace_id)
) with check (
  public.is_workspace_member(workspace_id)
  and exists (select 1 from public.executions where id = execution_id and workspace_id = execution_steps.workspace_id)
);

create policy "members read orchestration events" on public.orchestration_events for select to authenticated using (
  public.is_workspace_member(workspace_id)
  and exists (select 1 from public.executions where id = execution_id and workspace_id = orchestration_events.workspace_id)
);
create policy "members create orchestration events" on public.orchestration_events for insert to authenticated with check (
  public.is_workspace_member(workspace_id)
  and exists (select 1 from public.executions where id = execution_id and workspace_id = orchestration_events.workspace_id)
);

do $$
begin
  if exists (select 1 from pg_publication where pubname = 'supabase_realtime') then
    alter publication supabase_realtime add table public.executions, public.execution_steps, public.orchestration_events;
  end if;
end
$$;
