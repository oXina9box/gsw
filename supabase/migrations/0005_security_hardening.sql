-- Execution state is worker-owned. Members may observe it but cannot forge it.
drop policy if exists "members create executions" on public.executions;
drop policy if exists "members update executions" on public.executions;
drop policy if exists "members create execution steps" on public.execution_steps;
drop policy if exists "members update execution steps" on public.execution_steps;
drop policy if exists "members create orchestration events" on public.orchestration_events;

revoke insert, update, delete, truncate on public.executions from anon, authenticated;
revoke insert, update, delete, truncate on public.execution_steps from anon, authenticated;
revoke insert, update, delete, truncate on public.orchestration_events from anon, authenticated;

-- Composite keys let PostgreSQL enforce that every parent belongs to the same workspace.
alter table public.channels
  add constraint channels_workspace_id_key unique (workspace_id, id);
alter table public.productions
  add constraint productions_workspace_id_key unique (workspace_id, id);
alter table public.departments
  add constraint departments_workspace_id_key unique (workspace_id, id);
alter table public.lanes
  add constraint lanes_workspace_id_key unique (workspace_id, id);
alter table public.agents
  add constraint agents_workspace_id_key unique (workspace_id, id);
alter table public.genplay_masters
  add constraint genplay_masters_workspace_id_key unique (workspace_id, id);
alter table public.workflows
  add constraint workflows_workspace_id_key unique (workspace_id, id);
alter table public.handoff_rules
  add constraint handoff_rules_workspace_id_key unique (workspace_id, id);
alter table public.executions
  add constraint executions_workspace_id_key unique (workspace_id, id);

alter table public.productions
  add constraint productions_channel_workspace_fkey
  foreign key (workspace_id, channel_id)
  references public.channels (workspace_id, id) on delete cascade;

alter table public.lanes
  add constraint lanes_department_workspace_fkey
  foreign key (workspace_id, department_id)
  references public.departments (workspace_id, id) on delete cascade;

alter table public.agents
  add constraint agents_lane_workspace_fkey
  foreign key (workspace_id, lane_id)
  references public.lanes (workspace_id, id) on delete cascade;

alter table public.agent_files
  add constraint agent_files_agent_workspace_fkey
  foreign key (workspace_id, agent_id)
  references public.agents (workspace_id, id) on delete cascade;

alter table public.production_events
  add constraint production_events_production_workspace_fkey
  foreign key (workspace_id, production_id)
  references public.productions (workspace_id, id) on delete cascade;

alter table public.genplay_masters
  add constraint genplay_masters_production_workspace_fkey
  foreign key (workspace_id, production_id)
  references public.productions (workspace_id, id)
  on delete set null (production_id);

alter table public.genplay_binders
  add constraint genplay_binders_master_workspace_fkey
  foreign key (workspace_id, master_id)
  references public.genplay_masters (workspace_id, id) on delete cascade;

alter table public.generated_assets
  add constraint generated_assets_production_workspace_fkey
  foreign key (workspace_id, production_id)
  references public.productions (workspace_id, id) on delete cascade;

alter table public.handoff_rules
  add constraint handoff_rules_workflow_workspace_fkey
  foreign key (workspace_id, workflow_id)
  references public.workflows (workspace_id, id) on delete cascade,
  add constraint handoff_rules_source_lane_workspace_fkey
  foreign key (workspace_id, source_lane_id)
  references public.lanes (workspace_id, id),
  add constraint handoff_rules_source_agent_workspace_fkey
  foreign key (workspace_id, source_agent_id)
  references public.agents (workspace_id, id),
  add constraint handoff_rules_target_lane_workspace_fkey
  foreign key (workspace_id, target_lane_id)
  references public.lanes (workspace_id, id),
  add constraint handoff_rules_target_agent_workspace_fkey
  foreign key (workspace_id, target_agent_id)
  references public.agents (workspace_id, id);

alter table public.executions
  add constraint executions_workflow_workspace_fkey
  foreign key (workspace_id, workflow_id)
  references public.workflows (workspace_id, id) on delete cascade,
  add constraint executions_current_lane_workspace_fkey
  foreign key (workspace_id, current_lane_id)
  references public.lanes (workspace_id, id)
  on delete set null (current_lane_id),
  add constraint executions_current_agent_workspace_fkey
  foreign key (workspace_id, current_agent_id)
  references public.agents (workspace_id, id)
  on delete set null (current_agent_id),
  add constraint executions_single_current_node
  check (current_lane_id is null or current_agent_id is null);

alter table public.execution_steps
  add constraint execution_steps_execution_workspace_fkey
  foreign key (workspace_id, execution_id)
  references public.executions (workspace_id, id) on delete cascade,
  add constraint execution_steps_rule_workspace_fkey
  foreign key (workspace_id, handoff_rule_id)
  references public.handoff_rules (workspace_id, id)
  on delete set null (handoff_rule_id),
  add constraint execution_steps_source_lane_workspace_fkey
  foreign key (workspace_id, source_lane_id)
  references public.lanes (workspace_id, id),
  add constraint execution_steps_source_agent_workspace_fkey
  foreign key (workspace_id, source_agent_id)
  references public.agents (workspace_id, id),
  add constraint execution_steps_target_lane_workspace_fkey
  foreign key (workspace_id, target_lane_id)
  references public.lanes (workspace_id, id),
  add constraint execution_steps_target_agent_workspace_fkey
  foreign key (workspace_id, target_agent_id)
  references public.agents (workspace_id, id),
  add constraint execution_steps_single_source_node
  check (source_lane_id is null or source_agent_id is null),
  add constraint execution_steps_single_target_node
  check (target_lane_id is null or target_agent_id is null);

alter table public.orchestration_events
  add constraint orchestration_events_execution_workspace_fkey
  foreign key (workspace_id, execution_id)
  references public.executions (workspace_id, id) on delete cascade;

create index productions_channel_idx on public.productions (channel_id);
create index agents_lane_idx on public.agents (lane_id);
create index genplay_masters_production_idx on public.genplay_masters (production_id)
  where production_id is not null;
create index handoff_rules_source_lane_idx on public.handoff_rules (source_lane_id)
  where source_lane_id is not null;
create index handoff_rules_source_agent_idx on public.handoff_rules (source_agent_id)
  where source_agent_id is not null;
create index handoff_rules_target_lane_idx on public.handoff_rules (target_lane_id)
  where target_lane_id is not null;
create index handoff_rules_target_agent_idx on public.handoff_rules (target_agent_id)
  where target_agent_id is not null;
create index executions_current_lane_idx on public.executions (current_lane_id)
  where current_lane_id is not null;
create index executions_current_agent_idx on public.executions (current_agent_id)
  where current_agent_id is not null;
create index execution_steps_rule_idx on public.execution_steps (handoff_rule_id)
  where handoff_rule_id is not null;
create index execution_steps_source_lane_idx on public.execution_steps (source_lane_id)
  where source_lane_id is not null;
create index execution_steps_source_agent_idx on public.execution_steps (source_agent_id)
  where source_agent_id is not null;
create index execution_steps_target_lane_idx on public.execution_steps (target_lane_id)
  where target_lane_id is not null;
create index execution_steps_target_agent_idx on public.execution_steps (target_agent_id)
  where target_agent_id is not null;
