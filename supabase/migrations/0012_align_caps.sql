update storage.buckets set file_size_limit = 2147483648 where id = 'creative-assets';

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

create or replace function public.register_shot_clip(
  target_workspace uuid,
  target_production uuid,
  target_shot uuid,
  target_path text,
  target_mime text,
  target_size bigint
)
returns uuid language plpgsql security definer set search_path = public, storage as $$
declare clip_id uuid;
declare next_version integer;
declare required_prefix text;
begin
  if not public.is_workspace_member(target_workspace) then raise exception 'not_authorized'; end if;
  perform 1 from public.genplay_shots
    where id = target_shot and workspace_id = target_workspace and production_id = target_production
    for update;
  if not found then raise exception 'shot_not_found'; end if;
  if target_mime <> 'video/mp4' or target_size <= 0 or target_size > 2147483648 then
    raise exception 'invalid_clip';
  end if;
  required_prefix := 'workspace/' || target_workspace || '/production/' || target_production || '/shots/' || target_shot || '/';
  if target_path not like (required_prefix || '%') or not exists (
    select 1 from storage.objects where bucket_id = 'creative-assets' and name = target_path
      and coalesce((metadata->>'size')::bigint, -1) = target_size
      and coalesce(metadata->>'mimetype', '') = target_mime
  ) then raise exception 'invalid_storage_object'; end if;
  select coalesce(max(version), 0) + 1 into next_version from public.shot_clips where shot_id = target_shot;
  insert into public.shot_clips (workspace_id, production_id, shot_id, version, storage_path, mime_type, byte_size)
  values (target_workspace, target_production, target_shot, next_version, target_path, target_mime, target_size)
  returning id into clip_id;
  update public.genplay_shots set status = 'uploaded' where id = target_shot and status = 'waiting';
  return clip_id;
end;
$$;

create or replace function public.enqueue_studio_job(target_workspace uuid, target_production uuid, job_kind text, job_payload jsonb, key text)
returns uuid language plpgsql security definer set search_path = public as $$
declare job_id uuid;
declare required_credits bigint;
declare production_record public.productions;
declare settled bigint;
declare in_flight bigint;
declare capability text;
declare assigned_agent uuid;
declare assigned_connection uuid;
declare assigned_protected boolean;
declare effective_payload jsonb := coalesce(job_payload, '{}'::jsonb);
begin
  if not public.is_workspace_member(target_workspace) then raise exception 'not_authorized'; end if;
  required_credits := case job_kind when 'generate_text' then 2 when 'generate_image' then 6 when 'generate_audio' then 5 when 'assemble_master' then 1 else null end;
  if required_credits is null then raise exception 'invalid_job_kind'; end if;
  if pg_column_size(coalesce(job_payload, '{}'::jsonb)) > 65536 then raise exception 'payload_too_large'; end if;
  perform pg_advisory_xact_lock(hashtextextended(target_workspace::text, 0));
  select id into job_id from public.job_queue where workspace_id = target_workspace and idempotency_key = key;
  if job_id is not null then return job_id; end if;
  select * into production_record from public.productions where id = target_production and workspace_id = target_workspace for update;
  if production_record.id is null or production_record.status <> 'active' or production_record.rights_attested_at is null or production_record.current_step >= production_record.step_count then raise exception 'production_not_runnable'; end if;
  if (production_record.current_step = 7 and job_kind <> 'generate_text') or (production_record.current_step = 8 and job_kind <> 'assemble_master')
    or (job_kind = 'assemble_master' and production_record.current_step <> 8) then raise exception 'invalid_job_stage'; end if;
  if production_record.run_mode in ('semi_auto', 'auto') and exists (
    select 1 from public.job_queue where production_id = target_production and status in ('pending', 'running')
  ) then raise exception 'stage_job_in_flight'; end if;
  if production_record.run_mode = 'semi_auto' and exists (
    select 1 from public.production_approvals where production_id = target_production and department_step = production_record.current_step and status = 'pending'
  ) then raise exception 'approval_required'; end if;
  if job_kind like 'generate_%' then
    capability := replace(job_kind, 'generate_', '');
    if coalesce(job_payload->>'agent_id', '') !~* '^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$' then raise exception 'job_assignment_required'; end if;
    assigned_agent := (job_payload->>'agent_id')::uuid;
    select agent.protected_config into assigned_protected
      from public.agents agent join public.lanes lane on lane.id = agent.lane_id and lane.workspace_id = agent.workspace_id
      join public.departments department on department.id = lane.department_id and department.workspace_id = lane.workspace_id
      where agent.id = assigned_agent and agent.workspace_id = target_workspace and department.display_order = production_record.current_step and agent.capabilities ? capability
        and (not agent.protected_config or exists (select 1 from public.agent_entitlements entitlement where entitlement.workspace_id = target_workspace and entitlement.catalog_agent_id = agent.catalog_agent_id))
      limit 1;
    if assigned_protected is null then raise exception 'invalid_agent_assignment'; end if;
    if assigned_protected then
      effective_payload := effective_payload - 'connection_id';
    else
      if coalesce(job_payload->>'connection_id', '') !~* '^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$' then raise exception 'job_assignment_required'; end if;
      assigned_connection := (job_payload->>'connection_id')::uuid;
      if not exists (select 1 from public.provider_connections where id = assigned_connection and workspace_id = target_workspace and status = 'active' and capabilities @> array[capability]) then raise exception 'invalid_provider_assignment'; end if;
    end if;
  end if;
  -- ponytail: 10/min burst guard, raise to profile if rehearsal hits it
  if (select count(*) from public.job_queue where workspace_id = target_workspace and status in ('pending', 'running')) >= 4
    or (select count(*) from public.job_queue where production_id = target_production and status in ('pending', 'running')) >= 3
    or (select count(*) from public.job_queue where workspace_id = target_workspace and created_at > now() - interval '1 minute') >= 10 then raise exception 'queue_limit'; end if;
  select coalesce(sum(-ledger.amount), 0) into settled from public.credit_ledger ledger join public.job_queue charged on ledger.reference_type = 'job' and ledger.reference_id = charged.id::text where charged.production_id = target_production and ledger.entry_type = 'settle';
  select coalesce(sum(credit_reservation), 0) into in_flight from public.job_queue where production_id = target_production and status in ('pending', 'running');
  if production_record.credit_limit is not null and settled + in_flight + required_credits > production_record.credit_limit then raise exception 'production_credit_limit'; end if;
  if exists (select 1 from public.credit_accounts where workspace_id = target_workspace and debt > 0) then raise exception 'account_credit_debt'; end if;
  if not public.reserve_credits(target_workspace, required_credits, 'reserve:' || key) then raise exception 'insufficient_credits'; end if;
  insert into public.job_queue (workspace_id, production_id, kind, payload, credit_reservation, idempotency_key)
  values (target_workspace, target_production, job_kind, effective_payload || jsonb_build_object('department_step', production_record.current_step), required_credits, key) returning id into job_id;
  return job_id;
end;
$$;
