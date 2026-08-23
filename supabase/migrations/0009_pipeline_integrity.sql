alter table public.account_deletion_requests add column purge_prepared_at timestamptz;
alter table public.production_approvals add column artifact_id uuid references public.production_artifacts(id) on delete restrict;

create table public.storage_purge_queue (
  workspace_id uuid primary key,
  user_id uuid not null,
  attempts integer not null default 0 check (attempts >= 0),
  last_error text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
alter table public.storage_purge_queue enable row level security;
revoke all on public.storage_purge_queue from public, anon, authenticated;
grant select, insert, update, delete on public.storage_purge_queue to service_role;

create function public.reset_purge_preparation()
returns trigger language plpgsql set search_path = public as $$
begin
  if old.requested_at is distinct from new.requested_at then new.purge_prepared_at := null; end if;
  return new;
end;
$$;
create trigger reset_purge_preparation before update of requested_at on public.account_deletion_requests
for each row execute function public.reset_purge_preparation();

create or replace function public.claim_due_account_deletions(batch_size integer default 10)
returns setof public.account_deletion_requests language plpgsql security definer set search_path = public as $$
begin
  return query
  with due as (
    select user_id from public.account_deletion_requests
    where cancelled_at is null and purge_after <= now()
      and (purge_prepared_at is null or purge_prepared_at <= now() - interval '15 minutes')
      and (processing_at is null or processing_at < now() - interval '1 hour')
    order by purge_after for update skip locked limit least(greatest(batch_size, 1), 25)
  )
  update public.account_deletion_requests request set processing_at = now()
  from due where request.user_id = due.user_id returning request.*;
end;
$$;

create function public.prepare_account_purge(target_user uuid)
returns boolean language plpgsql security definer set search_path = public as $$
declare request public.account_deletion_requests;
declare active_job public.job_queue;
declare ledger_id uuid;
declare had_activity boolean;
begin
  select * into request from public.account_deletion_requests where user_id = target_user for update;
  if request.user_id is null or request.cancelled_at is not null or request.purge_after > now() or request.processing_at is null then raise exception 'deletion_not_claimed'; end if;
  perform 1 from public.workspaces where owner_id = target_user for update;
  perform 1 from public.productions production join public.workspaces workspace on workspace.id = production.workspace_id
    where workspace.owner_id = target_user for update of production;
  had_activity := exists (
    select 1 from public.productions production join public.workspaces workspace on workspace.id = production.workspace_id
    where workspace.owner_id = target_user and production.status <> 'archived'
  );
  for active_job in
    select job.* from public.job_queue job join public.workspaces workspace on workspace.id = job.workspace_id
    where workspace.owner_id = target_user and job.status in ('pending', 'running') for update of job
  loop
    had_activity := true;
    ledger_id := null;
    if active_job.credit_reservation > 0 then
      insert into public.credit_ledger (workspace_id, amount, entry_type, reference_type, reference_id, idempotency_key)
      values (active_job.workspace_id, active_job.credit_reservation, 'release', 'job', active_job.id::text, 'release:' || active_job.id)
      on conflict (workspace_id, idempotency_key) do nothing returning id into ledger_id;
      if ledger_id is not null then
        update public.credit_accounts set available = available + active_job.credit_reservation,
          reserved = reserved - active_job.credit_reservation, updated_at = now()
        where workspace_id = active_job.workspace_id and reserved >= active_job.credit_reservation;
        if not found then raise exception 'credit_release_failed'; end if;
      end if;
    end if;
    update public.job_queue set status = 'cancelled', locked_at = null, locked_by = null,
      error_message = 'Account deletion prepared', updated_at = now() where id = active_job.id;
  end loop;
  update public.productions production set status = 'archived', updated_at = now()
  from public.workspaces workspace where workspace.id = production.workspace_id and workspace.owner_id = target_user and production.status <> 'archived';
  if request.purge_prepared_at is null or had_activity or request.purge_prepared_at > now() - interval '15 minutes' then
    update public.account_deletion_requests set purge_prepared_at = now(), processing_at = null where user_id = target_user;
    return false;
  end if;
  insert into public.storage_purge_queue (workspace_id, user_id)
  select id, target_user from public.workspaces where owner_id = target_user
  on conflict (workspace_id) do update set user_id = excluded.user_id, updated_at = now();
  return true;
end;
$$;
revoke all on function public.prepare_account_purge(uuid) from public, anon, authenticated;
grant execute on function public.prepare_account_purge(uuid) to service_role;

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

drop function public.save_genplay_contract(uuid, uuid, uuid, jsonb, text);
create function public.save_genplay_contract(target_workspace uuid, target_production uuid, target_job uuid, shot_contract jsonb, contract_checksum text, context_provenance jsonb)
returns jsonb language plpgsql security definer set search_path = public as $$
declare master_id uuid;
declare artifact_id uuid;
declare artifact_version integer;
declare existing_content jsonb;
begin
  select id, content into artifact_id, existing_content from public.production_artifacts where job_id = target_job;
  if artifact_id is not null then return jsonb_build_object('master_id', existing_content->>'master_id', 'artifact_id', artifact_id, 'shot_count', existing_content->'shot_count'); end if;
  if not exists (select 1 from public.productions where id = target_production and workspace_id = target_workspace and status = 'active') then raise exception 'production_not_found'; end if;
  if jsonb_typeof(shot_contract) <> 'array' or jsonb_array_length(shot_contract) < 1 or jsonb_array_length(shot_contract) > 200 or jsonb_typeof(context_provenance) <> 'object' then raise exception 'invalid_shots'; end if;
  if exists (select 1 from jsonb_array_elements(shot_contract) shot where length(trim(coalesce(shot->>'prompt', ''))) < 10 or length(shot->>'prompt') > 20000 or coalesce((shot->>'duration_ms')::integer, 0) not between 250 and 60000) then raise exception 'invalid_shots'; end if;
  insert into public.genplay_masters (workspace_id, production_id, genplay_id, version, locked, document, source_checksum)
  values (target_workspace, target_production, 'GENPLAY-' || target_production, target_job::text, true, jsonb_build_object('shots', shot_contract), contract_checksum) returning id into master_id;
  insert into public.genplay_shots (workspace_id, production_id, master_id, shot_number, prompt, duration_ms)
  select target_workspace, target_production, master_id, ordinal::integer, shot->>'prompt', (shot->>'duration_ms')::integer from jsonb_array_elements(shot_contract) with ordinality as records(shot, ordinal);
  select coalesce(max(version), 0) + 1 into artifact_version from public.production_artifacts where production_id = target_production and kind = 'genplay';
  insert into public.production_artifacts (workspace_id, production_id, department_step, kind, version, status, content, checksum, job_id)
  values (target_workspace, target_production, 7, 'genplay', artifact_version, 'locked', jsonb_build_object('master_id', master_id, 'shot_count', jsonb_array_length(shot_contract), 'provenance', context_provenance), contract_checksum, target_job)
  returning id into artifact_id;
  return jsonb_build_object('master_id', master_id, 'artifact_id', artifact_id, 'shot_count', jsonb_array_length(shot_contract));
end;
$$;
revoke all on function public.save_genplay_contract(uuid, uuid, uuid, jsonb, text, jsonb) from public, anon, authenticated;
grant execute on function public.save_genplay_contract(uuid, uuid, uuid, jsonb, text, jsonb) to service_role;

drop function public.advance_production(uuid);
create function public.advance_production(target_production uuid, target_artifact uuid)
returns public.productions language plpgsql security definer set search_path = public as $$
declare result public.productions;
declare chosen_artifact uuid;
declare prior_step integer;
begin
  select * into result from public.productions where id = target_production for update;
  if result.id is null or not public.is_workspace_member(result.workspace_id) or result.status <> 'active' or result.run_mode <> 'manual' or result.current_step >= result.step_count then return null; end if;
  select id into chosen_artifact from public.production_artifacts where id = target_artifact and production_id = result.id and workspace_id = result.workspace_id and department_step = result.current_step and status in ('draft', 'approved', 'locked');
  if chosen_artifact is null then raise exception 'artifact_required'; end if;
  update public.production_artifacts set status = 'approved', updated_at = now() where id = chosen_artifact and status = 'draft';
  prior_step := result.current_step;
  update public.production_approvals set status = 'cancelled', decided_at = now()
    where production_id = result.id and department_step = prior_step and status = 'pending';
  update public.productions set current_step = current_step + 1, status = case when current_step + 1 >= step_count then 'shipped' else status end, updated_at = now() where id = result.id returning * into result;
  insert into public.production_events (workspace_id, production_id, event_type, from_step, to_step, data)
  values (result.workspace_id, result.id, case when result.current_step >= result.step_count then 'completed' else 'advanced' end, prior_step, result.current_step, jsonb_build_object('artifact_id', chosen_artifact));
  return result;
end;
$$;
revoke all on function public.advance_production(uuid, uuid) from public, anon;
grant execute on function public.advance_production(uuid, uuid) to authenticated;

create or replace function public.decide_production_approval(target_workspace uuid, target_approval uuid, decision text, decision_note text)
returns boolean language plpgsql security definer set search_path = public as $$
declare approval public.production_approvals;
declare production_record public.productions;
begin
  if not public.is_workspace_member(target_workspace) or decision not in ('approved', 'rejected') then raise exception 'not_authorized'; end if;
  select * into approval from public.production_approvals where id = target_approval and workspace_id = target_workspace and status = 'pending' for update;
  if approval.id is null or approval.artifact_id is null then raise exception 'approval_not_found'; end if;
  select * into production_record from public.productions where id = approval.production_id and workspace_id = target_workspace for update;
  if production_record.id is null or production_record.status <> 'active' or production_record.current_step <> approval.department_step then raise exception 'approval_stale'; end if;
  update public.production_approvals set status = decision, note = left(coalesce(decision_note, ''), 2000), decided_by = auth.uid(), decided_at = now() where id = approval.id;
  update public.production_artifacts set status = decision, updated_at = now() where id = approval.artifact_id and production_id = approval.production_id;
  if decision = 'approved' and production_record.status = 'active' and production_record.run_mode = 'semi_auto' and production_record.current_step = approval.department_step and production_record.current_step < production_record.step_count then
    update public.productions set current_step = current_step + 1, status = case when current_step + 1 >= step_count then 'shipped' else status end, updated_at = now() where id = production_record.id;
    insert into public.production_events (workspace_id, production_id, event_type, from_step, to_step, data)
    values (target_workspace, production_record.id, 'approval_advanced', production_record.current_step, production_record.current_step + 1, jsonb_build_object('approval_id', approval.id, 'artifact_id', approval.artifact_id));
  elsif decision = 'rejected' then
    update public.productions set status = 'paused', updated_at = now() where id = production_record.id;
    insert into public.production_events (workspace_id, production_id, event_type, from_step, to_step, data)
    values (target_workspace, production_record.id, 'approval_rejected', production_record.current_step, production_record.current_step, jsonb_build_object('approval_id', approval.id, 'artifact_id', approval.artifact_id));
  end if;
  return true;
end;
$$;

create or replace function public.finish_studio_job(target_job uuid, worker_id text, succeeded boolean, job_result jsonb, failure_message text, actual_credits bigint)
returns public.job_queue language plpgsql security definer set search_path = public as $$
declare job public.job_queue;
declare terminal_failure boolean;
declare cancelled boolean := false;
declare production_record public.productions;
declare artifact_id uuid;
declare prior_step integer;
declare spent bigint;
declare in_flight bigint;
declare auto_key text;
declare auto_agent uuid;
declare auto_connection uuid;
declare auto_protected boolean;
declare job_step integer;
begin
  select * into job from public.job_queue where id = target_job for update;
  if job.id is null or job.status <> 'running' or job.locked_by <> worker_id then raise exception 'job_not_owned'; end if;
  if actual_credits < 0 or actual_credits > job.credit_reservation then raise exception 'invalid_credit_settlement'; end if;
  if job.production_id is not null then
    select * into production_record from public.productions where id = job.production_id and workspace_id = job.workspace_id for update;
    job_step := case when jsonb_typeof(job.payload->'department_step') = 'number' then (job.payload->>'department_step')::integer else -1 end;
    select id into artifact_id from public.production_artifacts where job_id = job.id;
    if not succeeded and artifact_id is not null then
      succeeded := true;
      actual_credits := job.credit_reservation;
      failure_message := '';
    elsif succeeded and artifact_id is null then
      raise exception 'job_artifact_missing';
    elsif not succeeded and production_record.status <> 'active' then
      cancelled := true;
      failure_message := 'Production is not active';
    end if;
  end if;
  terminal_failure := not succeeded and job.attempts >= job.max_attempts;
  if succeeded or terminal_failure or cancelled then
    update public.credit_accounts set reserved = reserved - job.credit_reservation,
      available = available + case when succeeded then job.credit_reservation - actual_credits else job.credit_reservation end, updated_at = now()
    where workspace_id = job.workspace_id and reserved >= job.credit_reservation;
    if not found then raise exception 'credit_settlement_failed'; end if;
    if job.credit_reservation > 0 then
      insert into public.credit_ledger (workspace_id, amount, entry_type, reference_type, reference_id, idempotency_key)
      values (job.workspace_id, job.credit_reservation, 'release', 'job', job.id::text, 'release:' || job.id);
    end if;
    if succeeded and actual_credits > 0 then
      insert into public.credit_ledger (workspace_id, amount, entry_type, reference_type, reference_id, idempotency_key)
      values (job.workspace_id, -actual_credits, 'settle', 'job', job.id::text, 'settle:' || job.id);
    end if;
  end if;
  update public.job_queue set
    status = case when succeeded then 'completed'::public.job_status when cancelled then 'cancelled'::public.job_status when terminal_failure then 'dead'::public.job_status else 'pending'::public.job_status end,
    result = case when succeeded then coalesce(job_result, '{}'::jsonb) else result end,
    error_message = case when succeeded then null else left(coalesce(failure_message, 'job_failed'), 2000) end,
    run_after = case when not succeeded and not terminal_failure and not cancelled then now() + make_interval(secs => least(300, 5 * power(2, attempts - 1)::integer)) else run_after end,
    locked_at = null, locked_by = null, updated_at = now()
  where id = target_job returning * into job;
  if succeeded and job.production_id is not null then
    if production_record.status = 'active' and production_record.run_mode in ('semi_auto', 'auto') and job_step <> production_record.current_step then
      insert into public.production_events (workspace_id, production_id, event_type, from_step, to_step, data)
      values (job.workspace_id, job.production_id, 'completed_stale_stage_job', job_step, production_record.current_step, jsonb_build_object('job_id', job.id, 'artifact_id', artifact_id));
    elsif production_record.status = 'active' and production_record.run_mode = 'semi_auto' and production_record.current_step < production_record.step_count then
      insert into public.production_approvals (workspace_id, production_id, department_step, artifact_id, note)
      values (job.workspace_id, job.production_id, production_record.current_step, artifact_id, 'Generated handoff ready for owner review.')
      on conflict (production_id, department_step) where status = 'pending' do nothing;
    elsif production_record.status = 'active' and production_record.run_mode = 'auto' and production_record.current_step < production_record.step_count then
      update public.production_artifacts set status = 'locked', updated_at = now() where id = artifact_id and status = 'draft';
      select coalesce(sum(-ledger.amount), 0) into spent from public.credit_ledger ledger
      join public.job_queue settled_job on ledger.reference_type = 'job' and ledger.reference_id = settled_job.id::text
      where settled_job.production_id = job.production_id and ledger.entry_type = 'settle';
      if production_record.credit_limit is not null and spent > production_record.credit_limit then
        update public.productions set status = 'paused', updated_at = now() where id = job.production_id;
        insert into public.production_events (workspace_id, production_id, event_type, from_step, to_step, data)
        values (job.workspace_id, job.production_id, 'automation_paused_credit_limit', production_record.current_step, production_record.current_step, jsonb_build_object('spent', spent, 'limit', production_record.credit_limit));
      else
        prior_step := production_record.current_step;
        update public.productions set current_step = least(current_step + 1, step_count),
          status = case when current_step + 1 >= step_count then 'shipped' else status end, updated_at = now()
        where id = job.production_id returning * into production_record;
        insert into public.production_events (workspace_id, production_id, event_type, from_step, to_step, data)
        values (job.workspace_id, job.production_id, 'auto_advanced', prior_step, production_record.current_step, jsonb_build_object('job_id', job.id, 'artifact_id', artifact_id));
        if production_record.status = 'active' and production_record.current_step = 8 then
          insert into public.production_events (workspace_id, production_id, event_type, from_step, to_step, data)
          values (job.workspace_id, job.production_id, 'auto_waiting_for_manual_video', 8, 8, jsonb_build_object('job_id', job.id));
        elsif production_record.status = 'active' and production_record.current_step < production_record.step_count then
          select agent.id, agent.protected_config into auto_agent, auto_protected from public.agents agent
          join public.lanes lane on lane.id = agent.lane_id and lane.workspace_id = agent.workspace_id
          join public.departments department on department.id = lane.department_id and department.workspace_id = lane.workspace_id
          where agent.workspace_id = job.workspace_id and department.display_order = production_record.current_step and agent.capabilities ? 'text'
            and (not agent.protected_config or exists (select 1 from public.agent_entitlements entitlement where entitlement.workspace_id = job.workspace_id and entitlement.catalog_agent_id = agent.catalog_agent_id))
          order by case when agent.agent_type = 'supervisor' then 0 else 1 end, agent.created_at, agent.id limit 1;
          if not coalesce(auto_protected, false) then
            select connection.id into auto_connection from public.provider_connections connection
            where connection.workspace_id = job.workspace_id and connection.status = 'active' and connection.capabilities @> array['text']
            order by connection.created_at desc, connection.id limit 1;
          end if;
          select coalesce(sum(credit_reservation), 0) into in_flight from public.job_queue where production_id = job.production_id and status in ('pending', 'running');
          auto_key := 'auto:' || job.id || ':step:' || production_record.current_step;
          if auto_agent is not null and (auto_protected or auto_connection is not null) and (production_record.credit_limit is null or spent + in_flight + 2 <= production_record.credit_limit) then
            update public.credit_accounts set available = available - 2, reserved = reserved + 2, updated_at = now()
            where workspace_id = job.workspace_id and available >= 2 and debt = 0;
            if found then
              insert into public.credit_ledger (workspace_id, amount, entry_type, reference_type, reference_id, idempotency_key)
              values (job.workspace_id, -2, 'reserve', 'job', job.id::text, 'reserve:' || auto_key);
              insert into public.job_queue (workspace_id, production_id, kind, payload, credit_reservation, idempotency_key)
              values (job.workspace_id, job.production_id, 'generate_text', jsonb_strip_nulls(jsonb_build_object('triggered_by', job.id, 'department_step', production_record.current_step, 'agent_id', auto_agent, 'connection_id', auto_connection)), 2, auto_key);
              insert into public.production_events (workspace_id, production_id, event_type, from_step, to_step, data)
              values (job.workspace_id, job.production_id, 'auto_job_queued', production_record.current_step, production_record.current_step, jsonb_strip_nulls(jsonb_build_object('kind', 'generate_text', 'agent_id', auto_agent, 'connection_id', auto_connection)));
            else
              insert into public.production_events (workspace_id, production_id, event_type, from_step, to_step, data)
              values (job.workspace_id, job.production_id, 'auto_waiting_for_credits', production_record.current_step, production_record.current_step, '{}'::jsonb);
            end if;
          else
            insert into public.production_events (workspace_id, production_id, event_type, from_step, to_step, data)
            values (job.workspace_id, job.production_id, 'auto_waiting_for_configuration', production_record.current_step, production_record.current_step, '{}'::jsonb);
          end if;
        end if;
      end if;
    end if;
  end if;
  return job;
end;
$$;
