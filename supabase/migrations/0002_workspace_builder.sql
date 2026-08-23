create table public.departments (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references public.workspaces(id) on delete cascade,
  name text not null,
  display_order integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (workspace_id, name)
);

create table public.lanes (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references public.workspaces(id) on delete cascade,
  department_id uuid not null references public.departments(id) on delete cascade,
  name text not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (department_id, name)
);

create table public.agents (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references public.workspaces(id) on delete cascade,
  lane_id uuid not null references public.lanes(id) on delete cascade,
  name text not null,
  agent_type text not null default 'worker' check (agent_type in ('worker', 'supervisor')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.agent_files (
  agent_id uuid primary key references public.agents(id) on delete cascade,
  workspace_id uuid not null references public.workspaces(id) on delete cascade,
  role text not null default '',
  soul text not null default '',
  jobdescription text not null default '',
  skills text not null default '',
  memory text not null default '',
  user_content text not null default '',
  updated_at timestamptz not null default now()
);

create or replace function public.handle_new_agent()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  insert into public.agent_files (agent_id, workspace_id, role)
  values (new.id, new.workspace_id, 'You are the ' || new.name || '.');
  return new;
end;
$$;

create trigger on_agent_created after insert on public.agents for each row execute procedure public.handle_new_agent();

create index departments_workspace_idx on public.departments(workspace_id);
create index lanes_workspace_idx on public.lanes(workspace_id);
create index agents_workspace_idx on public.agents(workspace_id);

alter table public.departments enable row level security;
alter table public.lanes enable row level security;
alter table public.agents enable row level security;
alter table public.agent_files enable row level security;

create policy "members create productions" on public.productions for insert to authenticated with check (
  public.is_workspace_member(workspace_id)
  and exists (select 1 from public.channels where id = channel_id and workspace_id = productions.workspace_id)
);
create policy "members update productions" on public.productions for update to authenticated using (public.is_workspace_member(workspace_id)) with check (
  public.is_workspace_member(workspace_id)
  and exists (select 1 from public.channels where id = channel_id and workspace_id = productions.workspace_id)
);
create policy "members delete productions" on public.productions for delete to authenticated using (public.is_workspace_member(workspace_id));

create policy "members read departments" on public.departments for select to authenticated using (public.is_workspace_member(workspace_id));
create policy "members create departments" on public.departments for insert to authenticated with check (public.is_workspace_member(workspace_id));
create policy "members update departments" on public.departments for update to authenticated using (public.is_workspace_member(workspace_id)) with check (public.is_workspace_member(workspace_id));
create policy "members delete departments" on public.departments for delete to authenticated using (public.is_workspace_member(workspace_id));

create policy "members read lanes" on public.lanes for select to authenticated using (
  public.is_workspace_member(workspace_id)
  and exists (select 1 from public.departments where id = department_id and workspace_id = lanes.workspace_id)
);
create policy "members create lanes" on public.lanes for insert to authenticated with check (
  public.is_workspace_member(workspace_id)
  and exists (select 1 from public.departments where id = department_id and workspace_id = lanes.workspace_id)
);
create policy "members update lanes" on public.lanes for update to authenticated using (public.is_workspace_member(workspace_id)) with check (
  public.is_workspace_member(workspace_id)
  and exists (select 1 from public.departments where id = department_id and workspace_id = lanes.workspace_id)
);
create policy "members delete lanes" on public.lanes for delete to authenticated using (public.is_workspace_member(workspace_id));

create policy "members read agents" on public.agents for select to authenticated using (
  public.is_workspace_member(workspace_id)
  and exists (select 1 from public.lanes where id = lane_id and workspace_id = agents.workspace_id)
);
create policy "members create agents" on public.agents for insert to authenticated with check (
  public.is_workspace_member(workspace_id)
  and exists (select 1 from public.lanes where id = lane_id and workspace_id = agents.workspace_id)
);
create policy "members update agents" on public.agents for update to authenticated using (public.is_workspace_member(workspace_id)) with check (
  public.is_workspace_member(workspace_id)
  and exists (select 1 from public.lanes where id = lane_id and workspace_id = agents.workspace_id)
);
create policy "members delete agents" on public.agents for delete to authenticated using (public.is_workspace_member(workspace_id));

create policy "members read agent files" on public.agent_files for select to authenticated using (
  public.is_workspace_member(workspace_id)
  and exists (select 1 from public.agents where id = agent_id and workspace_id = agent_files.workspace_id)
);
create policy "members create agent files" on public.agent_files for insert to authenticated with check (
  public.is_workspace_member(workspace_id)
  and exists (select 1 from public.agents where id = agent_id and workspace_id = agent_files.workspace_id)
);
create policy "members update agent files" on public.agent_files for update to authenticated using (public.is_workspace_member(workspace_id)) with check (
  public.is_workspace_member(workspace_id)
  and exists (select 1 from public.agents where id = agent_id and workspace_id = agent_files.workspace_id)
);
create policy "members delete agent files" on public.agent_files for delete to authenticated using (public.is_workspace_member(workspace_id));
