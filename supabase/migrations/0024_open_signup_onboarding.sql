-- Open signup onboarding trigger: automatically provision profile, default studio workspace, and owner membership.
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = public as $$
declare
  new_workspace uuid;
begin
  if new.email is not null then
    update public.beta_invites set used_at = now() where email = lower(new.email) and used_at is null;
  end if;

  insert into public.profiles (id, display_name)
  values (new.id, nullif(new.raw_user_meta_data ->> 'display_name', ''))
  on conflict (id) do update set display_name = coalesce(excluded.display_name, public.profiles.display_name);

  insert into public.workspaces (owner_id, name, slug)
  values (new.id, 'My Studio', 'ws-' || replace(new.id::text, '-', ''))
  returning id into new_workspace;

  insert into public.workspace_members (workspace_id, user_id, role)
  values (new_workspace, new.id, 'owner')
  on conflict (workspace_id, user_id) do nothing;

  return new;
end;
$$;
