-- Document intentional design: workspaces table direct updates stay denied;
-- workspace renames and settings go through audited RPCs (rename_studio) only.
comment on table public.workspaces is
  'Workspaces modified exclusively via audited RPCs (rename_studio). Direct UPDATE denied by policy.';
-- Document restriction: multi-member workspaces deferred
comment on table public.workspace_members is
  'Single-owner workspaces only in v1. Member management policies deferred until multi-user feature.';

-- Allow workspace members to create DNA records via RLS
create policy "members create dna records"
on public.dna_records for insert to authenticated
with check (public.is_workspace_member(workspace_id));

create policy "members update dna records"
on public.dna_records for update to authenticated
using (public.is_workspace_member(workspace_id))
with check (public.is_workspace_member(workspace_id));

create policy "members delete dna records"
on public.dna_records for delete to authenticated
using (public.is_workspace_member(workspace_id));
