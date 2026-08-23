create table public.account_deletion_requests (
  user_id uuid primary key references auth.users(id) on delete cascade,
  requested_at timestamptz not null default now(),
  purge_after timestamptz not null default now() + interval '30 days',
  cancelled_at timestamptz,
  processing_at timestamptz
);
create table public.beta_invites (
  email text primary key check (email = lower(trim(email))),
  expires_at timestamptz,
  used_at timestamptz,
  created_at timestamptz not null default now()
);
alter table public.beta_invites enable row level security;
revoke all on public.beta_invites from anon, authenticated;
create table public.production_dna (
  workspace_id uuid not null references public.workspaces(id) on delete cascade,
  production_id uuid not null,
  dna_record_id uuid not null,
  role text not null check (role in ('character', 'location', 'prop')),
  created_at timestamptz not null default now(),
  primary key (production_id, dna_record_id),
  foreign key (workspace_id, production_id) references public.productions(workspace_id, id) on delete cascade
);
alter table public.dna_records add constraint dna_records_workspace_id_key unique (workspace_id, id);
alter table public.production_dna add constraint production_dna_record_workspace_fkey
  foreign key (workspace_id, dna_record_id) references public.dna_records(workspace_id, id) on delete restrict;
create index production_dna_workspace_idx on public.production_dna(workspace_id, production_id);
alter table public.production_dna enable row level security;
create policy "members read production dna" on public.production_dna for select to authenticated using (public.is_workspace_member(workspace_id));
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = public as $$
declare new_workspace uuid;
begin
  if new.email is null then raise exception 'invite_required'; end if;
  perform 1 from public.beta_invites where email = lower(new.email) and used_at is null and (expires_at is null or expires_at > now()) for update;
  if not found then raise exception 'invite_required'; end if;
  update public.beta_invites set used_at = now() where email = lower(new.email);
  insert into public.profiles (id, display_name) values (new.id, nullif(new.raw_user_meta_data ->> 'display_name', ''));
  insert into public.workspaces (owner_id, name, slug) values (new.id, 'My Studio', 'ws-' || replace(new.id::text, '-', '')) returning id into new_workspace;
  insert into public.workspace_members (workspace_id, user_id, role) values (new_workspace, new.id, 'owner');
  return new;
end;
$$;
alter table public.job_queue add constraint job_queue_kind_check
  check (kind in ('generate_text', 'generate_image', 'generate_audio', 'assemble_master', 'publish_social', 'sync_metrics'));
create unique index production_one_pending_approval_idx
  on public.production_approvals(production_id, department_step) where status = 'pending';
create index account_deletion_due_idx on public.account_deletion_requests(purge_after) where cancelled_at is null;
create index job_queue_production_created_idx on public.job_queue(production_id, created_at desc);
create unique index job_queue_one_running_per_production_idx on public.job_queue(production_id) where status = 'running' and production_id is not null;
create index purchases_workspace_created_idx on public.purchases(workspace_id, created_at desc);
alter table public.production_artifacts add column job_id uuid unique references public.job_queue(id) on delete set null;
alter table public.generated_assets add column job_id uuid unique references public.job_queue(id) on delete set null;
alter table public.credit_accounts add column debt bigint not null default 0 check (debt >= 0);
alter table public.commerce_products add column unit_amount bigint check (unit_amount is null or unit_amount > 0);
alter table public.commerce_products add column currency text check (currency is null or currency ~ '^[a-z]{3}$');
alter table public.purchases
  add column unit_amount bigint,
  add column currency text,
  add column credit_amount bigint,
  add column catalog_agent_id uuid references public.agent_catalog(id) on delete restrict,
  add column refunded_amount bigint not null default 0 check (refunded_amount >= 0),
  add column reversed_credits bigint not null default 0 check (reversed_credits >= 0);
alter table public.purchases add constraint purchases_snapshot_check check (
  (unit_amount is null and currency is null and credit_amount is null and catalog_agent_id is null)
  or (unit_amount > 0 and currency ~ '^[a-z]{3}$' and ((credit_amount > 0 and catalog_agent_id is null) or (credit_amount is null and catalog_agent_id is not null)))
);
alter table public.purchases drop constraint purchases_status_check;
alter table public.purchases add constraint purchases_status_check
  check (status in ('pending', 'paid', 'partially_refunded', 'refunded', 'failed'));
update storage.buckets set file_size_limit = 2147483648,
  allowed_mime_types = array['video/mp4', 'image/png', 'audio/mpeg', 'audio/wav']::text[]
where id = 'creative-assets';
-- Composite relationships replace ambiguous single-column PostgREST embeds and enforce tenant ownership.
alter table public.productions drop constraint if exists productions_channel_id_fkey;
alter table public.lanes drop constraint if exists lanes_department_id_fkey;
alter table public.agents drop constraint if exists agents_lane_id_fkey;
alter table public.agent_files drop constraint if exists agent_files_agent_id_fkey;
alter table public.production_events drop constraint if exists production_events_production_id_fkey;
alter table public.genplay_masters drop constraint if exists genplay_masters_production_id_fkey;
alter table public.genplay_binders drop constraint if exists genplay_binders_master_id_fkey;
alter table public.generated_assets drop constraint if exists generated_assets_production_id_fkey;
alter table public.handoff_rules drop constraint if exists handoff_rules_workflow_id_fkey;
alter table public.handoff_rules drop constraint if exists handoff_rules_source_lane_id_fkey;
alter table public.handoff_rules drop constraint if exists handoff_rules_source_agent_id_fkey;
alter table public.handoff_rules drop constraint if exists handoff_rules_target_lane_id_fkey;
alter table public.handoff_rules drop constraint if exists handoff_rules_target_agent_id_fkey;
alter table public.executions drop constraint if exists executions_workflow_id_fkey;
alter table public.executions drop constraint if exists executions_current_lane_id_fkey;
alter table public.executions drop constraint if exists executions_current_agent_id_fkey;
alter table public.execution_steps drop constraint if exists execution_steps_execution_id_fkey;
alter table public.execution_steps drop constraint if exists execution_steps_handoff_rule_id_fkey;
alter table public.orchestration_events drop constraint if exists orchestration_events_execution_id_fkey;
alter table public.production_artifacts drop constraint if exists production_artifacts_production_id_fkey;
alter table public.genplay_shots drop constraint if exists genplay_shots_production_id_fkey;
alter table public.genplay_shots drop constraint if exists genplay_shots_master_id_fkey;
alter table public.shot_clips drop constraint if exists shot_clips_production_id_fkey;
alter table public.shot_clips drop constraint if exists shot_clips_shot_id_fkey;
alter table public.production_approvals drop constraint if exists production_approvals_production_id_fkey;
alter table public.job_queue drop constraint if exists job_queue_production_id_fkey;
alter table public.publications drop constraint if exists publications_production_id_fkey;
alter table public.publications drop constraint if exists publications_connection_id_fkey;
alter table public.social_metrics drop constraint if exists social_metrics_publication_id_fkey;
alter table public.genplay_masters add constraint genplay_masters_workspace_production_id_key unique (workspace_id, production_id, id);
alter table public.genplay_shots drop constraint if exists genplay_shots_master_workspace_fkey;
alter table public.genplay_shots add constraint genplay_shots_master_production_workspace_fkey
  foreign key (workspace_id, production_id, master_id)
  references public.genplay_masters(workspace_id, production_id, id);
alter table public.signals drop constraint if exists signals_channel_id_fkey;
alter table public.signals drop constraint if exists signals_production_id_fkey;
alter table public.signals drop constraint if exists signals_publication_id_fkey;
alter table public.signals add constraint signals_channel_workspace_fkey
  foreign key (workspace_id, channel_id) references public.channels(workspace_id, id) on delete cascade;
alter table public.signals add constraint signals_production_workspace_fkey
  foreign key (workspace_id, production_id) references public.productions(workspace_id, id) on delete cascade;
alter table public.signals add constraint signals_publication_workspace_fkey
  foreign key (workspace_id, publication_id) references public.publications(workspace_id, id) on delete set null (publication_id);
create or replace function public.is_workspace_member(target_workspace uuid)
returns boolean language sql stable security definer set search_path = public, auth as $$
  select exists (
    select 1 from public.workspace_members membership
    where membership.workspace_id = target_workspace and membership.user_id = (select auth.uid())
  ) and (
    not exists (select 1 from auth.mfa_factors factor where factor.user_id = (select auth.uid()) and factor.status = 'verified')
    or coalesce(auth.jwt()->>'aal', 'aal1') = 'aal2'
  );
$$;
-- The studio floor is fixed; owners customize lanes and hires inside these departments.
drop policy if exists "members create departments" on public.departments;
drop policy if exists "members update departments" on public.departments;
drop policy if exists "members delete departments" on public.departments;
revoke insert, update, delete, truncate on public.departments from anon, authenticated;
drop policy if exists "members create agents" on public.agents;
drop policy if exists "members update agents" on public.agents;
drop policy if exists "members delete agents" on public.agents;
drop policy if exists "members create agent files" on public.agent_files;
drop policy if exists "members update agent files" on public.agent_files;
drop policy if exists "members delete agent files" on public.agent_files;
revoke insert, update, delete, truncate on public.agents from anon, authenticated;
revoke insert, update, delete, truncate on public.agent_files from anon, authenticated;
drop policy if exists "members create provider connections" on public.provider_connections;
drop policy if exists "members update provider connections" on public.provider_connections;
drop policy if exists "members delete provider connections" on public.provider_connections;
revoke insert, update, delete, truncate on public.provider_connections from anon, authenticated;
drop policy if exists "members manage artifacts" on public.production_artifacts;
drop policy if exists "members manage shots" on public.genplay_shots;
drop policy if exists "members manage clips" on public.shot_clips;
drop policy if exists "members manage approvals" on public.production_approvals;
drop policy if exists "members create production events" on public.production_events;
create policy "members read artifacts" on public.production_artifacts for select to authenticated using (public.is_workspace_member(workspace_id));
create policy "members read shots" on public.genplay_shots for select to authenticated using (public.is_workspace_member(workspace_id));
create policy "members read clips" on public.shot_clips for select to authenticated using (public.is_workspace_member(workspace_id));
create policy "members read approvals" on public.production_approvals for select to authenticated using (public.is_workspace_member(workspace_id));
revoke insert, update, delete, truncate on public.production_artifacts, public.genplay_shots, public.shot_clips, public.production_approvals from anon, authenticated;
revoke insert, update, delete, truncate on public.production_events from anon, authenticated;
drop policy if exists "members create genplay masters" on public.genplay_masters;
drop policy if exists "members update genplay masters" on public.genplay_masters;
drop policy if exists "members delete genplay masters" on public.genplay_masters;
drop policy if exists "members create genplay binders" on public.genplay_binders;
drop policy if exists "members update genplay binders" on public.genplay_binders;
drop policy if exists "members delete genplay binders" on public.genplay_binders;
drop policy if exists "members create generated assets" on public.generated_assets;
drop policy if exists "members update generated assets" on public.generated_assets;
drop policy if exists "members delete generated assets" on public.generated_assets;
revoke insert, update, delete, truncate on public.genplay_masters, public.genplay_binders, public.generated_assets from anon, authenticated;
-- Registered/generated media is immutable. Unregistered uploads may still be
-- removed by the owner when registration fails. Migration 0008 owns quota accounting.
drop policy if exists "members upload creative assets" on storage.objects;
create policy "members upload creative assets" on storage.objects for insert to authenticated with check (
  bucket_id = 'creative-assets'
  and (storage.foldername(name))[1] = 'workspace'
  and public.is_workspace_member(((storage.foldername(name))[2])::uuid)
);
drop policy if exists "members update creative assets" on storage.objects;
drop policy if exists "members delete creative assets" on storage.objects;
create policy "members delete unregistered creative assets" on storage.objects for delete to authenticated using (
  bucket_id = 'creative-assets'
  and (storage.foldername(name))[1] = 'workspace'
  and public.is_workspace_member(((storage.foldername(name))[2])::uuid)
  and not exists (select 1 from public.shot_clips where storage_path = name)
  and not exists (select 1 from public.generated_assets where storage_path = name)
  and not exists (select 1 from public.production_artifacts where storage_path = name)
);
create or replace function public.create_custom_agent(target_workspace uuid, target_lane uuid, agent_name text, agent_kind text)
returns uuid language plpgsql security definer set search_path = public as $$
declare new_agent uuid;
begin
  if not public.is_workspace_member(target_workspace) then raise exception 'not_authorized'; end if;
  if length(trim(agent_name)) not between 1 and 120 or agent_kind not in ('worker', 'supervisor') then raise exception 'invalid_agent'; end if;
  if not exists (select 1 from public.lanes where id = target_lane and workspace_id = target_workspace) then raise exception 'invalid_lane'; end if;
  insert into public.agents (workspace_id, lane_id, name, agent_type, protected_config, capabilities)
  values (target_workspace, target_lane, trim(agent_name), agent_kind, false, '["text"]'::jsonb) returning id into new_agent;
  return new_agent;
end;
$$;
create or replace function public.create_dna_record(target_workspace uuid, record_type public.dna_type, record_name text, record_summary text)
returns uuid language plpgsql security definer set search_path = public as $$
declare record_id uuid;
declare public_id text;
declare prefix text;
begin
  if not public.is_workspace_member(target_workspace) then raise exception 'not_authorized'; end if;
  if length(trim(record_name)) not between 1 and 120 or length(record_summary) > 5000 then raise exception 'invalid_record'; end if;
  prefix := case record_type when 'CDNA' then 'CHAR-' when 'LDNA' then 'LOC-' else 'PROP-' end;
  public_id := prefix || upper(substr(replace(gen_random_uuid()::text, '-', ''), 1, 12));
  insert into public.dna_records (workspace_id, dna_id, dna_type, status, schema_version, record)
  values (target_workspace, public_id, record_type, 'draft', '1.0.0', jsonb_build_object('name', trim(record_name), 'summary', trim(record_summary)))
  returning id into record_id;
  return record_id;
end;
$$;
create or replace function public.rename_studio(target_workspace uuid, studio_name text)
returns boolean language plpgsql security definer set search_path = public as $$
begin
  if not public.is_workspace_member(target_workspace) or length(trim(studio_name)) not between 1 and 120 then raise exception 'invalid_studio'; end if;
  update public.workspaces set name = trim(studio_name), updated_at = now() where id = target_workspace and owner_id = auth.uid();
  return found;
end;
$$;
create or replace function public.attach_production_dna(target_workspace uuid, target_production uuid, target_record uuid)
returns boolean language plpgsql security definer set search_path = public as $$
declare record_type public.dna_type;
begin
  if not public.is_workspace_member(target_workspace) then raise exception 'not_authorized'; end if;
  if not exists (select 1 from public.productions where id = target_production and workspace_id = target_workspace) then raise exception 'production_not_found'; end if;
  select dna_type into record_type from public.dna_records where id = target_record and workspace_id = target_workspace;
  if record_type is null then raise exception 'record_not_found'; end if;
  insert into public.production_dna (workspace_id, production_id, dna_record_id, role)
  values (target_workspace, target_production, target_record, case record_type when 'CDNA' then 'character' when 'LDNA' then 'location' else 'prop' end)
  on conflict (production_id, dna_record_id) do nothing;
  return true;
end;
$$;
create or replace function public.update_custom_agent_files(
  target_workspace uuid, target_agent uuid, file_role text, file_soul text,
  file_jobdescription text, file_skills text, file_memory text, file_user_content text
)
returns boolean language plpgsql security definer set search_path = public as $$
begin
  if not public.is_workspace_member(target_workspace) then raise exception 'not_authorized'; end if;
  if not exists (select 1 from public.agents where id = target_agent and workspace_id = target_workspace and protected_config = false) then raise exception 'protected_agent'; end if;
  if greatest(length(file_role), length(file_soul), length(file_jobdescription), length(file_skills), length(file_memory), length(file_user_content)) > 30000 then raise exception 'file_too_large'; end if;
  update public.agent_files set role = coalesce(file_role, ''), soul = coalesce(file_soul, ''),
    jobdescription = coalesce(file_jobdescription, ''), skills = coalesce(file_skills, ''),
    memory = coalesce(file_memory, ''), user_content = coalesce(file_user_content, ''), updated_at = now()
  where agent_id = target_agent and workspace_id = target_workspace;
  return found;
end;
$$;
create or replace function public.save_provider_connection_server(
  target_workspace uuid, provider_name text, connection_label text, connection_base_url text,
  connection_model text, connection_capabilities text[], secret_mask text,
  secret_ciphertext text, secret_iv text, secret_tag text, secret_key_version text
)
returns uuid language plpgsql security definer set search_path = public as $$
declare connection_id uuid;
begin
  if not exists (select 1 from public.workspaces where id = target_workspace) then raise exception 'workspace_not_found'; end if;
  if length(trim(provider_name)) not between 1 and 120 or length(trim(connection_label)) not between 1 and 120 then raise exception 'invalid_connection'; end if;
  insert into public.provider_connections (workspace_id, provider, label, base_url, default_model, capabilities, masked_secret, key_version)
  values (target_workspace, trim(provider_name), trim(connection_label), connection_base_url, nullif(trim(connection_model), ''), coalesce(connection_capabilities, '{}'), secret_mask, secret_key_version)
  returning id into connection_id;
  insert into public.provider_secrets (connection_id, ciphertext, iv, tag, key_version)
  values (connection_id, secret_ciphertext, secret_iv, secret_tag, secret_key_version);
  return connection_id;
end;
$$;
drop function public.enqueue_studio_job(uuid, uuid, text, jsonb, bigint, text);
create function public.enqueue_studio_job(
  target_workspace uuid,
  target_production uuid,
  job_kind text,
  job_payload jsonb,
  key text
)
returns uuid language plpgsql security definer set search_path = public as $$
declare job_id uuid;
declare required_credits bigint;
declare production_record public.productions;
declare settled bigint;
declare in_flight bigint;
begin
  if not public.is_workspace_member(target_workspace) then raise exception 'not_authorized'; end if;
  required_credits := case job_kind
    when 'generate_text' then 2 when 'generate_image' then 6 when 'generate_audio' then 5
    when 'assemble_master' then 1 when 'publish_social' then 1 when 'sync_metrics' then 1
    else null end;
  if required_credits is null then raise exception 'invalid_job_kind'; end if;
  if pg_column_size(coalesce(job_payload, '{}'::jsonb)) > 65536 then raise exception 'payload_too_large'; end if;
  perform pg_advisory_xact_lock(hashtextextended(target_workspace::text, 0));
  select id into job_id from public.job_queue where workspace_id = target_workspace and idempotency_key = key;
  if job_id is not null then return job_id; end if;
  select * into production_record from public.productions
    where id = target_production and workspace_id = target_workspace for update;
  if production_record.id is null or production_record.status <> 'active' or production_record.rights_attested_at is null
    or production_record.current_step >= production_record.step_count then raise exception 'production_not_runnable'; end if;
  if (select count(*) from public.job_queue where workspace_id = target_workspace and status in ('pending', 'running')) >= 10
    or (select count(*) from public.job_queue where production_id = target_production and status in ('pending', 'running')) >= 3
    or (select count(*) from public.job_queue where workspace_id = target_workspace and created_at > now() - interval '1 minute') >= 10
  then raise exception 'queue_limit'; end if;
  select coalesce(sum(-ledger.amount), 0) into settled from public.credit_ledger ledger
    join public.job_queue charged on ledger.reference_type = 'job' and ledger.reference_id = charged.id::text
    where charged.production_id = target_production and ledger.entry_type = 'settle';
  select coalesce(sum(credit_reservation), 0) into in_flight from public.job_queue
    where production_id = target_production and status in ('pending', 'running');
  if production_record.credit_limit is not null and settled + in_flight + required_credits > production_record.credit_limit then
    raise exception 'production_credit_limit';
  end if;
  if exists (select 1 from public.credit_accounts where workspace_id = target_workspace and debt > 0) then raise exception 'account_credit_debt'; end if;
  if not public.reserve_credits(target_workspace, required_credits, 'reserve:' || key) then raise exception 'insufficient_credits'; end if;
  insert into public.job_queue (workspace_id, production_id, kind, payload, credit_reservation, idempotency_key)
  values (target_workspace, target_production, job_kind, coalesce(job_payload, '{}'::jsonb) || jsonb_build_object('department_step', production_record.current_step), required_credits, key)
  returning id into job_id;
  return job_id;
end;
$$;
create or replace function public.pause_production_jobs()
returns trigger language plpgsql security definer set search_path = public as $$
declare pending_job record;
begin
  if old.status is distinct from new.status and new.status <> 'active' then
    for pending_job in select id, workspace_id, credit_reservation from public.job_queue
      where production_id = new.id and status = 'pending' for update
    loop
      update public.credit_accounts set available = available + pending_job.credit_reservation,
        reserved = reserved - pending_job.credit_reservation, updated_at = now()
      where workspace_id = pending_job.workspace_id and reserved >= pending_job.credit_reservation;
      insert into public.credit_ledger (workspace_id, amount, entry_type, reference_type, reference_id, idempotency_key)
      values (pending_job.workspace_id, pending_job.credit_reservation, 'release', 'job', pending_job.id::text, 'release:' || pending_job.id)
      on conflict (workspace_id, idempotency_key) do nothing;
      update public.job_queue set status = 'cancelled', error_message = 'Production is not active', updated_at = now() where id = pending_job.id;
    end loop;
  end if;
  return new;
end;
$$;
create or replace function public.fulfill_checkout_verified(
  target_event_id text, target_event_type text, target_session_id text,
  target_payment_intent_id text, target_workspace uuid, target_product text,
  target_amount bigint, target_currency text
)
returns boolean language plpgsql security definer set search_path = public as $$
declare purchase_record public.purchases;
begin
  if exists (select 1 from public.payment_events where stripe_event_id = target_event_id) then return false; end if;
  select * into purchase_record from public.purchases where stripe_checkout_session_id = target_session_id for update;
  if purchase_record.id is null then raise exception 'purchase_not_found'; end if;
  if purchase_record.workspace_id <> target_workspace or purchase_record.product_key <> target_product
    or purchase_record.unit_amount is null or purchase_record.currency is null
    or purchase_record.unit_amount <> target_amount or purchase_record.currency <> lower(target_currency)
  then raise exception 'checkout_mismatch'; end if;
  insert into public.payment_events (stripe_event_id, event_type) values (target_event_id, target_event_type);
  if purchase_record.status <> 'pending' then return false; end if;
  update public.purchases set status = 'paid', stripe_payment_intent_id = target_payment_intent_id, updated_at = now() where id = purchase_record.id;
  if purchase_record.credit_amount is not null then
    update public.credit_accounts set
      available = available + greatest(purchase_record.credit_amount - debt, 0),
      debt = greatest(debt - purchase_record.credit_amount, 0), updated_at = now()
    where workspace_id = purchase_record.workspace_id;
    insert into public.credit_ledger (workspace_id, amount, entry_type, reference_type, reference_id, idempotency_key)
    values (purchase_record.workspace_id, purchase_record.credit_amount, 'purchase', 'purchase', purchase_record.id::text, 'stripe:' || target_event_id);
  elsif purchase_record.catalog_agent_id is not null then
    insert into public.agent_entitlements (workspace_id, catalog_agent_id, purchase_id)
    values (purchase_record.workspace_id, purchase_record.catalog_agent_id, purchase_record.id)
    on conflict (workspace_id, catalog_agent_id) do update set purchase_id = excluded.purchase_id, granted_at = now();
  else
    raise exception 'purchase_benefit_missing';
  end if;
  return true;
end;
$$;
create function public.reverse_checkout(target_event_id text, target_event_type text, target_payment_intent_id text, target_amount bigint)
returns boolean language plpgsql security definer set search_path = public as $$
declare purchase_record public.purchases;
declare unused bigint;
declare reversed_total bigint;
declare credit_target bigint;
declare credit_delta bigint;
begin
  if exists (select 1 from public.payment_events where stripe_event_id = target_event_id) then return false; end if;
  select * into purchase_record from public.purchases where stripe_payment_intent_id = target_payment_intent_id for update;
  if purchase_record.id is null then raise exception 'purchase_not_found'; end if;
  if purchase_record.unit_amount is null or target_amount <= 0 then raise exception 'invalid_reversal'; end if;
  reversed_total := case when target_event_type = 'charge.refunded'
    then least(purchase_record.unit_amount, target_amount)
    else least(purchase_record.unit_amount, purchase_record.refunded_amount + target_amount) end;
  insert into public.payment_events (stripe_event_id, event_type) values (target_event_id, target_event_type);
  if purchase_record.status not in ('paid', 'partially_refunded') or reversed_total <= purchase_record.refunded_amount then return false; end if;
  if purchase_record.credit_amount is not null then
    credit_target := floor((purchase_record.credit_amount::numeric * reversed_total) / purchase_record.unit_amount)::bigint;
    credit_delta := greatest(credit_target - purchase_record.reversed_credits, 0);
    select least(available, credit_delta) into unused from public.credit_accounts where workspace_id = purchase_record.workspace_id for update;
    update public.credit_accounts set available = available - unused,
      debt = debt + (credit_delta - unused), updated_at = now()
    where workspace_id = purchase_record.workspace_id;
    if credit_delta > 0 then
      insert into public.credit_ledger (workspace_id, amount, entry_type, reference_type, reference_id, idempotency_key)
      values (purchase_record.workspace_id, -credit_delta, 'refund', 'purchase', purchase_record.id::text, 'stripe:' || target_event_id);
    end if;
  elsif purchase_record.catalog_agent_id is not null then
    -- Protected configurations are indivisible: any refund revokes access; checkout permits repurchase.
    delete from public.agent_entitlements where workspace_id = purchase_record.workspace_id
      and catalog_agent_id = purchase_record.catalog_agent_id and purchase_id = purchase_record.id;
  end if;
  update public.purchases set refunded_amount = reversed_total,
    reversed_credits = coalesce(credit_target, purchase_record.reversed_credits),
    status = case when reversed_total >= purchase_record.unit_amount then 'refunded' else 'partially_refunded' end,
    updated_at = now() where id = purchase_record.id;
  return true;
end;
$$;
create trigger on_production_paused after update of status on public.productions
  for each row execute procedure public.pause_production_jobs();
create or replace function public.protect_job_reservations()
returns trigger language plpgsql set search_path = public as $$
begin
  if exists (select 1 from public.job_queue where production_id = old.id and status in ('pending', 'running')) then
    raise exception 'production_has_active_jobs';
  end if;
  return old;
end;
$$;
create trigger before_production_delete before delete on public.productions
  for each row execute procedure public.protect_job_reservations();
alter table public.account_deletion_requests enable row level security;
create policy "users read own deletion request" on public.account_deletion_requests
  for select to authenticated using (user_id = (select auth.uid()));
create or replace function public.request_account_deletion()
returns timestamptz language plpgsql security definer set search_path = public as $$
declare deadline timestamptz;
begin
  if auth.uid() is null then raise exception 'not_authorized'; end if;
  if to_timestamp(coalesce((auth.jwt()->>'iat')::bigint, 0)) < now() - interval '10 minutes' then raise exception 'reauth_required'; end if;
  if exists (select 1 from auth.mfa_factors where user_id = auth.uid() and status = 'verified')
    and coalesce(auth.jwt()->>'aal', 'aal1') <> 'aal2' then raise exception 'mfa_required'; end if;
  deadline := now() + interval '30 days';
  insert into public.account_deletion_requests (user_id, requested_at, purge_after, cancelled_at)
  values (auth.uid(), now(), deadline, null)
  on conflict (user_id) do update set requested_at = now(), purge_after = deadline, cancelled_at = null, processing_at = null;
  return deadline;
end;
$$;
create or replace function public.cancel_account_deletion()
returns boolean language plpgsql security definer set search_path = public as $$
begin
  if auth.uid() is null then raise exception 'not_authorized'; end if;
  update public.account_deletion_requests set cancelled_at = now() where user_id = auth.uid() and cancelled_at is null and processing_at is null;
  return found;
end;
$$;
create or replace function public.claim_due_account_deletions(batch_size integer default 10)
returns setof public.account_deletion_requests language plpgsql security definer set search_path = public as $$
begin
  return query
  with due as (
    select user_id from public.account_deletion_requests
    where cancelled_at is null and purge_after <= now()
      and (processing_at is null or processing_at < now() - interval '1 hour')
    order by purge_after
    for update skip locked
    limit least(greatest(batch_size, 1), 25)
  )
  update public.account_deletion_requests request set processing_at = now()
  from due where request.user_id = due.user_id
  returning request.*;
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
create or replace function public.select_shot_clip(target_workspace uuid, target_shot uuid, target_clip uuid)
returns boolean language plpgsql security definer set search_path = public as $$
begin
  if not public.is_workspace_member(target_workspace) then raise exception 'not_authorized'; end if;
  perform 1 from public.genplay_shots where id = target_shot and workspace_id = target_workspace for update;
  if not found or not exists (
    select 1 from public.shot_clips where id = target_clip and shot_id = target_shot and workspace_id = target_workspace
  ) then raise exception 'clip_not_found'; end if;
  update public.shot_clips set selected = (id = target_clip) where shot_id = target_shot;
  update public.genplay_shots set status = 'selected' where id = target_shot;
  return true;
end;
$$;
create or replace function public.advance_production(target_production uuid)
returns public.productions language plpgsql security definer set search_path = public as $$
declare result public.productions;
declare prior_step integer;
begin
  select * into result from public.productions where id = target_production for update;
  if result.id is null or not public.is_workspace_member(result.workspace_id) or result.status <> 'active' or result.current_step >= result.step_count then return null; end if;
  prior_step := result.current_step;
  update public.productions set current_step = current_step + 1,
    status = case when current_step + 1 >= step_count then 'shipped' else status end,
    updated_at = now() where id = result.id returning * into result;
  insert into public.production_events (workspace_id, production_id, event_type, from_step, to_step)
  values (result.workspace_id, result.id, case when result.current_step >= result.step_count then 'completed' else 'advanced' end, prior_step, result.current_step);
  return result;
end;
$$;
create or replace function public.decide_production_approval(target_workspace uuid, target_approval uuid, decision text, decision_note text)
returns boolean language plpgsql security definer set search_path = public as $$
declare approval public.production_approvals;
declare production_record public.productions;
begin
  if not public.is_workspace_member(target_workspace) or decision not in ('approved', 'rejected') then raise exception 'not_authorized'; end if;
  select * into approval from public.production_approvals where id = target_approval and workspace_id = target_workspace and status = 'pending' for update;
  if approval.id is null then raise exception 'approval_not_found'; end if;
  select * into production_record from public.productions where id = approval.production_id and workspace_id = target_workspace for update;
  update public.production_approvals set status = decision, note = left(coalesce(decision_note, ''), 2000), decided_by = auth.uid(), decided_at = now() where id = approval.id;
  if decision = 'approved' and production_record.status = 'active' and production_record.current_step = approval.department_step and production_record.current_step < production_record.step_count then
    update public.productions set current_step = current_step + 1,
      status = case when current_step + 1 >= step_count then 'shipped' else status end, updated_at = now()
    where id = production_record.id;
    insert into public.production_events (workspace_id, production_id, event_type, from_step, to_step, data)
    values (target_workspace, production_record.id, 'approval_advanced', production_record.current_step, production_record.current_step + 1, jsonb_build_object('approval_id', approval.id));
  elsif decision = 'rejected' then
    update public.productions set status = 'paused', updated_at = now() where id = production_record.id;
    insert into public.production_events (workspace_id, production_id, event_type, from_step, to_step, data)
    values (target_workspace, production_record.id, 'approval_rejected', production_record.current_step, production_record.current_step, jsonb_build_object('approval_id', approval.id));
  end if;
  return true;
end;
$$;
create or replace function public.claim_studio_job(worker_id text)
returns setof public.job_queue language plpgsql security definer set search_path = public as $$
declare claimed_id uuid;
declare expired_job record;
declare stale_job record;
declare inactive boolean;
begin
  if length(trim(worker_id)) = 0 then raise exception 'worker_required'; end if;
  for stale_job in
    select queued.* from public.job_queue queued
    join public.productions production on production.id = queued.production_id and production.workspace_id = queued.workspace_id
    where queued.status = 'pending' and (production.status <> 'active'
      or case when jsonb_typeof(queued.payload->'department_step') = 'number' then (queued.payload->>'department_step')::integer else -1 end <> production.current_step)
    for update of queued skip locked
  loop
    update public.credit_accounts set available = available + stale_job.credit_reservation,
      reserved = reserved - stale_job.credit_reservation, updated_at = now()
    where workspace_id = stale_job.workspace_id and reserved >= stale_job.credit_reservation;
    if not found then raise exception 'credit_release_failed'; end if;
    if stale_job.credit_reservation > 0 then
      insert into public.credit_ledger (workspace_id, amount, entry_type, reference_type, reference_id, idempotency_key)
      values (stale_job.workspace_id, stale_job.credit_reservation, 'release', 'job', stale_job.id::text, 'release:' || stale_job.id)
      on conflict (workspace_id, idempotency_key) do nothing;
    end if;
    update public.job_queue set status = 'cancelled', error_message = 'Production is inactive or moved to another stage', updated_at = now()
    where id = stale_job.id;
  end loop;
  for expired_job in
    select * from public.job_queue
    where (status = 'running' and locked_at < now() - interval '15 minutes')
      or (status = 'pending' and attempts >= max_attempts)
    for update skip locked
  loop
    inactive := expired_job.production_id is not null and not exists (
      select 1 from public.productions where id = expired_job.production_id and workspace_id = expired_job.workspace_id and status = 'active'
    );
    if expired_job.attempts >= expired_job.max_attempts or inactive then
      update public.credit_accounts set available = available + expired_job.credit_reservation,
        reserved = reserved - expired_job.credit_reservation, updated_at = now()
      where workspace_id = expired_job.workspace_id and reserved >= expired_job.credit_reservation;
      if not found then raise exception 'credit_release_failed'; end if;
      if expired_job.credit_reservation > 0 then
        insert into public.credit_ledger (workspace_id, amount, entry_type, reference_type, reference_id, idempotency_key)
        values (expired_job.workspace_id, expired_job.credit_reservation, 'release', 'job', expired_job.id::text, 'release:' || expired_job.id)
        on conflict (workspace_id, idempotency_key) do nothing;
      end if;
      update public.job_queue set status = case when inactive then 'cancelled'::public.job_status else 'dead'::public.job_status end,
        locked_at = null, locked_by = null, error_message = case when inactive then 'Production is not active' else 'Worker lease expired at attempt limit' end,
        updated_at = now() where id = expired_job.id;
    else
      update public.job_queue set status = 'pending', locked_at = null, locked_by = null,
        run_after = now(), error_message = 'Worker lease expired; retrying', updated_at = now() where id = expired_job.id;
    end if;
  end loop;
  select id into claimed_id from public.job_queue
    where status = 'pending' and attempts < max_attempts and run_after <= now()
      and (production_id is null or not exists (
        select 1 from public.job_queue active_job where active_job.production_id = job_queue.production_id and active_job.status = 'running'
      ))
      and (production_id is null or exists (
        select 1 from public.productions where id = job_queue.production_id and workspace_id = job_queue.workspace_id and status = 'active'
          and case when jsonb_typeof(job_queue.payload->'department_step') = 'number' then (job_queue.payload->>'department_step')::integer else -1 end = current_step
      ))
    order by run_after, created_at
    for update skip locked
    limit 1;
  if claimed_id is null then return; end if;
  return query update public.job_queue set
    status = 'running', attempts = attempts + 1, locked_at = now(), locked_by = worker_id, updated_at = now()
    where id = claimed_id
    returning *;
end;
$$;
create or replace function public.save_genplay_contract(
  target_workspace uuid,
  target_production uuid,
  target_job uuid,
  shot_contract jsonb,
  contract_checksum text
)
returns jsonb language plpgsql security definer set search_path = public as $$
declare master_id uuid;
declare artifact_id uuid;
declare artifact_version integer;
declare existing_content jsonb;
begin
  select id, content into artifact_id, existing_content from public.production_artifacts where job_id = target_job;
  if artifact_id is not null then return jsonb_build_object('master_id', existing_content->>'master_id', 'artifact_id', artifact_id, 'shot_count', existing_content->'shot_count'); end if;
  if not exists (select 1 from public.productions where id = target_production and workspace_id = target_workspace) then raise exception 'production_not_found'; end if;
  if jsonb_typeof(shot_contract) <> 'array' or jsonb_array_length(shot_contract) < 1 or jsonb_array_length(shot_contract) > 200 then raise exception 'invalid_shots'; end if;
  if exists (
    select 1 from jsonb_array_elements(shot_contract) shot
    where length(trim(coalesce(shot->>'prompt', ''))) < 10
      or length(shot->>'prompt') > 20000
      or coalesce((shot->>'duration_ms')::integer, 0) not between 250 and 60000
  ) then raise exception 'invalid_shots'; end if;
  insert into public.genplay_masters (workspace_id, production_id, genplay_id, version, locked, document, source_checksum)
  values (target_workspace, target_production, 'GENPLAY-' || target_production, target_job::text, true, jsonb_build_object('shots', shot_contract), contract_checksum)
  returning id into master_id;
  insert into public.genplay_shots (workspace_id, production_id, master_id, shot_number, prompt, duration_ms)
  select target_workspace, target_production, master_id, ordinal::integer, shot->>'prompt', (shot->>'duration_ms')::integer
  from jsonb_array_elements(shot_contract) with ordinality as records(shot, ordinal);
  select coalesce(max(version), 0) + 1 into artifact_version from public.production_artifacts where production_id = target_production and kind = 'genplay';
  insert into public.production_artifacts (workspace_id, production_id, department_step, kind, version, status, content, checksum, job_id)
  values (target_workspace, target_production, 7, 'genplay', artifact_version, 'locked', jsonb_build_object('master_id', master_id, 'shot_count', jsonb_array_length(shot_contract)), contract_checksum, target_job)
  returning id into artifact_id;
  return jsonb_build_object('master_id', master_id, 'artifact_id', artifact_id, 'shot_count', jsonb_array_length(shot_contract));
end;
$$;
create or replace function public.finish_studio_job(
  target_job uuid,
  worker_id text,
  succeeded boolean,
  job_result jsonb,
  failure_message text,
  actual_credits bigint
)
returns public.job_queue language plpgsql security definer set search_path = public as $$
declare job public.job_queue;
declare terminal_failure boolean;
declare cancelled boolean := false;
declare production_record public.productions;
declare prior_step integer;
declare spent bigint;
declare in_flight bigint;
declare auto_key text;
declare job_step integer;
begin
  select * into job from public.job_queue where id = target_job for update;
  if job.id is null or job.status <> 'running' or job.locked_by <> worker_id then raise exception 'job_not_owned'; end if;
  if actual_credits < 0 or actual_credits > job.credit_reservation then raise exception 'invalid_credit_settlement'; end if;
  if job.production_id is not null then
    select * into production_record from public.productions where id = job.production_id and workspace_id = job.workspace_id for update;
    job_step := case when jsonb_typeof(job.payload->'department_step') = 'number' then (job.payload->>'department_step')::integer else -1 end;
    if not succeeded and exists (select 1 from public.production_artifacts where job_id = job.id) then
      succeeded := true;
      actual_credits := job.credit_reservation;
      failure_message := '';
    elsif not succeeded and production_record.status <> 'active' then
      succeeded := false;
      cancelled := true;
      failure_message := 'Production paused or archived during execution';
    end if;
  end if;
  terminal_failure := not succeeded and job.attempts >= job.max_attempts;
  if succeeded or terminal_failure or cancelled then
    update public.credit_accounts set
      reserved = reserved - job.credit_reservation,
      available = available + case when succeeded then job.credit_reservation - actual_credits else job.credit_reservation end,
      updated_at = now()
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
    locked_at = null,
    locked_by = null,
    updated_at = now()
  where id = target_job
  returning * into job;
  if succeeded and job.production_id is not null then
    if production_record.status = 'active' and production_record.run_mode in ('semi_auto', 'auto') and job_step <> production_record.current_step then
      insert into public.production_events (workspace_id, production_id, event_type, from_step, to_step, data)
      values (job.workspace_id, job.production_id, 'completed_stale_stage_job', job_step, production_record.current_step, jsonb_build_object('job_id', job.id));
    elsif production_record.status = 'active' and production_record.run_mode = 'semi_auto' and production_record.current_step < production_record.step_count then
      insert into public.production_approvals (workspace_id, production_id, department_step, note)
      values (job.workspace_id, job.production_id, production_record.current_step, 'Generated handoff ready for owner review.')
      on conflict (production_id, department_step) where status = 'pending' do nothing;
    elsif production_record.status = 'active' and production_record.run_mode = 'auto' and production_record.current_step < production_record.step_count then
      select coalesce(sum(-ledger.amount), 0) into spent
      from public.credit_ledger ledger
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
        values (job.workspace_id, job.production_id, 'auto_advanced', prior_step, production_record.current_step, jsonb_build_object('job_id', job.id));
        if production_record.status = 'active' and production_record.current_step = 8 then
          insert into public.production_events (workspace_id, production_id, event_type, from_step, to_step, data)
          values (job.workspace_id, job.production_id, 'auto_waiting_for_manual_video', 8, 8, jsonb_build_object('job_id', job.id));
        elsif production_record.status = 'active' and production_record.current_step < production_record.step_count then
          select coalesce(sum(credit_reservation), 0) into in_flight from public.job_queue
          where production_id = job.production_id and status in ('pending', 'running');
          auto_key := 'auto:' || job.id || ':step:' || production_record.current_step;
          if (production_record.credit_limit is null or spent + in_flight + 2 <= production_record.credit_limit)
            and exists (
              select 1 from public.departments department
              join public.lanes lane on lane.department_id = department.id and lane.workspace_id = department.workspace_id
              join public.agents agent on agent.lane_id = lane.id and agent.workspace_id = lane.workspace_id
              where department.workspace_id = job.workspace_id and department.display_order = production_record.current_step
                and agent.capabilities ? 'text'
                and (not agent.protected_config or exists (
                  select 1 from public.agent_entitlements entitlement
                  where entitlement.workspace_id = job.workspace_id and entitlement.catalog_agent_id = agent.catalog_agent_id
                ))
            )
          then
            update public.credit_accounts set available = available - 2, reserved = reserved + 2, updated_at = now()
            where workspace_id = job.workspace_id and available >= 2 and debt = 0;
            if found then
              insert into public.credit_ledger (workspace_id, amount, entry_type, reference_type, reference_id, idempotency_key)
              values (job.workspace_id, -2, 'reserve', 'job', job.id::text, 'reserve:' || auto_key);
              insert into public.job_queue (workspace_id, production_id, kind, payload, credit_reservation, idempotency_key)
              values (job.workspace_id, job.production_id, 'generate_text', jsonb_build_object('triggered_by', job.id, 'department_step', production_record.current_step), 2, auto_key);
              insert into public.production_events (workspace_id, production_id, event_type, from_step, to_step, data)
              values (job.workspace_id, job.production_id, 'auto_job_queued', production_record.current_step, production_record.current_step, jsonb_build_object('kind', 'generate_text'));
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
revoke all on function public.request_account_deletion(), public.cancel_account_deletion(), public.register_shot_clip(uuid, uuid, uuid, text, text, bigint), public.select_shot_clip(uuid, uuid, uuid), public.advance_production(uuid), public.decide_production_approval(uuid, uuid, text, text), public.create_custom_agent(uuid, uuid, text, text), public.update_custom_agent_files(uuid, uuid, text, text, text, text, text, text), public.create_dna_record(uuid, public.dna_type, text, text), public.attach_production_dna(uuid, uuid, uuid), public.rename_studio(uuid, text), public.enqueue_studio_job(uuid, uuid, text, jsonb, text), public.hire_catalog_agent(uuid, uuid, uuid) from public, anon;
grant execute on function public.request_account_deletion(), public.cancel_account_deletion(), public.register_shot_clip(uuid, uuid, uuid, text, text, bigint), public.select_shot_clip(uuid, uuid, uuid), public.advance_production(uuid), public.decide_production_approval(uuid, uuid, text, text), public.create_custom_agent(uuid, uuid, text, text), public.update_custom_agent_files(uuid, uuid, text, text, text, text, text, text), public.create_dna_record(uuid, public.dna_type, text, text), public.attach_production_dna(uuid, uuid, uuid), public.rename_studio(uuid, text), public.enqueue_studio_job(uuid, uuid, text, jsonb, text) to authenticated;
revoke all on function public.reserve_credits(uuid, bigint, text), public.save_provider_connection(uuid, text, text, text, text, text[], text, text, text, text, text), public.save_provider_connection_server(uuid, text, text, text, text, text[], text, text, text, text, text), public.claim_studio_job(text), public.finish_studio_job(uuid, text, boolean, jsonb, text, bigint), public.save_genplay_contract(uuid, uuid, uuid, jsonb, text), public.claim_due_account_deletions(integer), public.fulfill_checkout_verified(text, text, text, text, uuid, text, bigint, text), public.reverse_checkout(text, text, text, bigint) from public, anon, authenticated;
revoke all on function public.fulfill_checkout(text, text, text, text) from public, anon, authenticated, service_role;
grant execute on function public.save_provider_connection_server(uuid, text, text, text, text, text[], text, text, text, text, text), public.claim_studio_job(text), public.finish_studio_job(uuid, text, boolean, jsonb, text, bigint), public.save_genplay_contract(uuid, uuid, uuid, jsonb, text), public.claim_due_account_deletions(integer), public.fulfill_checkout_verified(text, text, text, text, uuid, text, bigint, text), public.reverse_checkout(text, text, text, bigint) to service_role;
