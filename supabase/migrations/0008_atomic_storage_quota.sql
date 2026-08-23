create table public.workspace_storage_usage (
  workspace_id uuid primary key references public.workspaces(id) on delete cascade,
  bytes_used bigint not null default 0 check (bytes_used >= 0),
  updated_at timestamptz not null default now()
);

alter table public.shot_clips drop constraint shot_clips_mime_type_check;
alter table public.shot_clips add constraint shot_clips_mime_type_check check (mime_type = 'video/mp4') not valid;

alter table public.workspace_storage_usage enable row level security;
revoke all on public.workspace_storage_usage from public, anon, authenticated;

insert into public.workspace_storage_usage (workspace_id, bytes_used)
select ((storage.foldername(object.name))[2])::uuid,
       sum(case when object.metadata->>'size' ~ '^[0-9]+$' then (object.metadata->>'size')::bigint else 2147483648 end)::bigint
from storage.objects object
where object.bucket_id = 'creative-assets'
  and (storage.foldername(object.name))[1] = 'workspace'
  and (storage.foldername(object.name))[2] ~* '^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$'
group by ((storage.foldername(object.name))[2])::uuid;

create or replace function public.account_creative_asset_storage()
returns trigger language plpgsql security definer set search_path = '' as $$
declare
  workspace uuid;
  path_parts text[];
  new_bytes bigint;
  old_bytes bigint;
  accepted bigint;
begin
  if tg_op = 'UPDATE' and (old.bucket_id is distinct from new.bucket_id or old.name is distinct from new.name) then
    raise exception 'storage_object_identity_is_immutable';
  end if;

  if tg_op = 'DELETE' then
    if old.bucket_id <> 'creative-assets' then return old; end if;
    path_parts := storage.foldername(old.name);
    if path_parts[1] <> 'workspace' or path_parts[2] is null then raise exception 'invalid_storage_path'; end if;
    workspace := path_parts[2]::uuid;
    old_bytes := case when old.metadata->>'size' ~ '^[0-9]+$' then (old.metadata->>'size')::bigint else 2147483648 end;
    update public.workspace_storage_usage
    set bytes_used = greatest(0, bytes_used - old_bytes), updated_at = now()
    where workspace_id = workspace;
    return old;
  end if;

  if new.bucket_id <> 'creative-assets' then return new; end if;
  path_parts := storage.foldername(new.name);
  if path_parts[1] <> 'workspace' or path_parts[2] is null then raise exception 'invalid_storage_path'; end if;
  workspace := path_parts[2]::uuid;
  new_bytes := case when new.metadata->>'size' ~ '^[0-9]+$' then (new.metadata->>'size')::bigint else 2147483648 end;
  if new_bytes < 0 or new_bytes > 2147483648 then raise exception 'invalid_storage_size'; end if;

  if tg_op = 'UPDATE' then
    old_bytes := case when old.metadata->>'size' ~ '^[0-9]+$' then (old.metadata->>'size')::bigint else 2147483648 end;
    if new_bytes <= old_bytes then
      update public.workspace_storage_usage
      set bytes_used = greatest(0, bytes_used - (old_bytes - new_bytes)), updated_at = now()
      where workspace_id = workspace;
      return new;
    end if;
    new_bytes := new_bytes - old_bytes;
  end if;

  insert into public.workspace_storage_usage (workspace_id, bytes_used)
  values (workspace, new_bytes)
  on conflict (workspace_id) do update
    set bytes_used = public.workspace_storage_usage.bytes_used + excluded.bytes_used, updated_at = now()
    where public.workspace_storage_usage.bytes_used + excluded.bytes_used <= 107374182400
  returning bytes_used into accepted;
  if accepted is null then raise exception 'workspace_storage_quota_exceeded'; end if;
  return new;
end;
$$;

revoke all on function public.account_creative_asset_storage() from public, anon, authenticated;
create trigger account_creative_asset_storage
after insert or update or delete on storage.objects
for each row execute function public.account_creative_asset_storage();

create function public.fail_checkout(target_event_id text, target_event_type text, target_session_id text)
returns boolean language plpgsql security definer set search_path = public as $$
declare purchase_record public.purchases;
begin
  if target_event_type not in ('checkout.session.expired', 'checkout.session.async_payment_failed') then raise exception 'invalid_checkout_failure'; end if;
  if exists (select 1 from public.payment_events where stripe_event_id = target_event_id) then return false; end if;
  select * into purchase_record from public.purchases where stripe_checkout_session_id = target_session_id for update;
  if purchase_record.id is null then raise exception 'purchase_not_found'; end if;
  insert into public.payment_events (stripe_event_id, event_type) values (target_event_id, target_event_type);
  if purchase_record.status <> 'pending' then return false; end if;
  update public.purchases set status = 'failed', updated_at = now() where id = purchase_record.id;
  return true;
end;
$$;

revoke all on function public.fail_checkout(text, text, text) from public, anon, authenticated;
grant execute on function public.fail_checkout(text, text, text) to service_role;
