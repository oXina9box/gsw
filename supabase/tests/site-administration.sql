begin;
-- Local storage stub lacks the schema/table grants supplied by real Supabase.
grant usage on schema storage to authenticated;
grant select on storage.objects to authenticated;
alter table storage.objects enable row level security;
insert into public.beta_invites(email) values ('operator@site.test'), ('member@site.test');
insert into auth.users(id, email) values
  ('10000000-0000-4000-8000-000000000001', 'operator@site.test'),
  ('10000000-0000-4000-8000-000000000002', 'member@site.test');
insert into public.site_operator_grants(user_id, grant_reason) values ('10000000-0000-4000-8000-000000000001', 'Test operator grant');
select set_config('request.jwt.claim.sub', '10000000-0000-4000-8000-000000000001', true);
select set_config('request.jwt.claims', '{"aal":"aal1"}', true);
do $$ begin
  if public.site_is_operator() then raise exception 'MFA bypass'; end if;
end $$;
select set_config('request.jwt.claims', '{"aal":"aal2"}', true);
insert into public.channels(id, workspace_id, name) select '10000000-0000-4000-8000-000000000010', id, 'Review channel' from public.workspaces where owner_id = '10000000-0000-4000-8000-000000000002';
insert into public.productions(id, workspace_id, channel_id, title) select '10000000-0000-4000-8000-000000000011', workspace_id, id, 'Review production' from public.channels where id = '10000000-0000-4000-8000-000000000010';
insert into public.generated_assets(id, workspace_id, production_id, kind, storage_path)
  select '10000000-0000-4000-8000-000000000012', workspace_id, id, 'image', 'workspace/' || workspace_id || '/review.png' from public.productions where id = '10000000-0000-4000-8000-000000000011';
insert into storage.objects(bucket_id, name) select 'creative-assets', storage_path from public.generated_assets where id = '10000000-0000-4000-8000-000000000012';
create temporary table editorial_test_ids(id uuid);
insert into editorial_test_ids select (public.site_save_content(null, 0, '{"kind":"tip","placement":"studio-sidebar","audience":"member","title":"Saved tip","body":"A real saved tip."}', 'Create test content')).id;
select public.site_set_content_publication(id, 1, true, 'Publish test content') from editorial_test_ids;
do $$ declare item public.site_content_items; begin
  select * into item from public.site_content_items where id = (select id from editorial_test_ids);
  begin
    perform public.site_save_content(item.id, 1, '{"kind":"tip","placement":"studio-sidebar","audience":"member","title":"Stale","body":"Stale update"}', 'Stale test content');
    raise exception 'Revision conflict ignored';
  exception when others then if sqlerrm <> 'content_conflict' then raise; end if; end;
  perform public.site_save_content(item.id, 2, '{"kind":"tip","placement":"studio-sidebar","audience":"member","title":"Private revision","body":"Not published yet."}', 'Edit test content');
  if (select status from public.site_content_items where id = item.id) <> 'draft' then raise exception 'Editing publishes without approval'; end if;
end $$;

-- Exercise actual grants and RLS, not a superuser-only predicate assertion.
set local role anon;
do $$ begin
  if exists(select 1 from public.site_content_items where audience = 'member') then raise exception 'Member content leaked to anonymous'; end if;
end $$;
reset role;
select public.site_set_content_publication(id, 3, true, 'Republish test content') from editorial_test_ids;
set local role anon;
do $$ begin
  if exists(select 1 from public.site_content_items where audience = 'member') then raise exception 'Published member content leaked'; end if;
end $$;
reset role;

select set_config('request.jwt.claim.sub', '10000000-0000-4000-8000-000000000002', true);
do $$ begin
  if public.site_is_operator() then raise exception 'Workspace owner gained operator privilege'; end if;
  begin
    perform public.site_save_content(null, 0, '{"kind":"tip","placement":"studio-sidebar","audience":"public","title":"Denied","body":"Denied write"}', 'Unauthorized test');
    raise exception 'Operator write bypass';
  exception when others then if sqlerrm <> 'operator_access_required' then raise; end if; end;
end $$;
select set_config('request.jwt.claim.sub', '10000000-0000-4000-8000-000000000001', true);
select public.site_record_review('content', 'account', '10000000-0000-4000-8000-000000000002', 'suspended', 'Manual reviewed restriction');
-- Retrying a restriction must not fail with a unique constraint or double-apply.
select public.site_record_review('content', 'account', '10000000-0000-4000-8000-000000000002', 'suspended', 'Manual reviewed restriction');
select set_config('request.jwt.claim.sub', '10000000-0000-4000-8000-000000000002', true);
do $$ begin
  if public.is_workspace_member((select id from public.workspaces where owner_id = '10000000-0000-4000-8000-000000000002')) then raise exception 'Suspension bypass'; end if;
end $$;
select set_config('request.jwt.claim.sub', '10000000-0000-4000-8000-000000000001', true);
select public.site_record_review('content', 'account', '10000000-0000-4000-8000-000000000002', 'restored', 'Manual reviewed restoration');
select set_config('request.jwt.claim.sub', '10000000-0000-4000-8000-000000000002', true);
set local role authenticated;
do $$ begin
  if not exists(select 1 from storage.objects where name like '%/review.png') then raise exception 'Unrestricted storage must be readable'; end if;
end $$;
reset role;
select set_config('request.jwt.claim.sub', '10000000-0000-4000-8000-000000000001', true);
select public.site_record_review('content', 'asset', '10000000-0000-4000-8000-000000000012', 'quarantined', 'Manual asset review');
do $$ declare target_workspace uuid; begin
  select workspace_id into target_workspace from public.productions where id = '10000000-0000-4000-8000-000000000011';
  if public.site_worker_operation_allowed(target_workspace, '10000000-0000-4000-8000-000000000011') then raise exception 'Quarantine worker bypass'; end if;
  begin
    insert into public.release_packages(workspace_id, production_id, platform, status) values (target_workspace, '10000000-0000-4000-8000-000000000011', 'youtube', 'approved');
    raise exception 'Quarantine publishing bypass';
  exception when others then if sqlerrm <> 'production_access_restricted' then raise; end if; end;
end $$;
select set_config('request.jwt.claim.sub', '10000000-0000-4000-8000-000000000002', true);
set local role authenticated;
do $$ begin
  if exists(select 1 from public.generated_assets where id = '10000000-0000-4000-8000-000000000012') then raise exception 'Quarantined metadata leaked'; end if;
  if exists(select 1 from storage.objects where name like '%/review.png') then raise exception 'Quarantined storage leaked'; end if;
end $$;
reset role;
select set_config('request.jwt.claim.sub', '10000000-0000-4000-8000-000000000001', true);
select public.site_record_review('content', 'asset', '10000000-0000-4000-8000-000000000012', 'released', 'Manual asset release');
do $$ begin
  if not public.site_worker_operation_allowed((select workspace_id from public.productions where id = '10000000-0000-4000-8000-000000000011'), '10000000-0000-4000-8000-000000000011') then raise exception 'Released production remains blocked'; end if;
end $$;
update public.site_operator_grants set revoked_at = now(), revoke_reason = 'Revocation test' where user_id = '10000000-0000-4000-8000-000000000001';
do $$ begin
  if public.site_is_operator() then raise exception 'Revoked grant still authorized'; end if;
end $$;
rollback;
select 'site administration invariants passed';
