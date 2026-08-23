alter table public.productions add column if not exists workflow_id uuid;
alter table public.productions add constraint productions_workflow_workspace_fkey foreign key (workspace_id, workflow_id) references public.workflows(workspace_id, id) on delete set null;
