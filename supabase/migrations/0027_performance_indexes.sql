-- Performance indexes (CRITICAL-FIXES Fix 17)
create index if not exists lanes_department_idx on public.lanes(department_id);
create index if not exists genplay_binders_master_idx on public.genplay_binders(master_id);
create index if not exists agent_files_agent_idx on public.agent_files(agent_id);

comment on index lanes_department_idx is 'Performance: department deletion + joins';
comment on index genplay_binders_master_idx is 'Performance: master deletion + binder lookups';
comment on index agent_files_agent_idx is 'Performance: agent deletion + file queries';
