-- Global, non-workspace editorial and operator controls. Bootstrap grants are
-- deliberately manual; see planning/site-administration-runbook.md.
create table public.site_operator_grants (
  user_id uuid primary key references auth.users(id) on delete restrict,
  granted_at timestamptz not null default now(),
  granted_by uuid references auth.users(id) on delete set null,
  grant_reason text not null check (char_length(grant_reason) between 3 and 2000),
  revoked_at timestamptz,
  revoked_by uuid references auth.users(id) on delete set null,
  revoke_reason text,
  check ((revoked_at is null and revoked_by is null and revoke_reason is null) or (revoked_at is not null and revoke_reason is not null))
);

create table public.site_operator_audit (
  id uuid primary key default gen_random_uuid(),
  operator_id uuid not null references auth.users(id) on delete restrict,
  action text not null check (char_length(action) between 3 and 80),
  reason text not null check (char_length(reason) between 3 and 2000),
  target_type text not null check (char_length(target_type) between 3 and 80),
  target_id uuid,
  metadata jsonb not null default '{}'::jsonb check (jsonb_typeof(metadata) = 'object' and pg_column_size(metadata) <= 16384),
  created_at timestamptz not null default now()
);

create table public.site_content_items (
  id uuid primary key default gen_random_uuid(),
  kind text not null check (kind in ('banner', 'tip', 'promotion', 'training', 'document', 'image')),
  placement text not null check (placement ~ '^[a-z0-9][a-z0-9-]{0,63}$'),
  audience text not null check (audience in ('public', 'member')),
  status text not null default 'draft' check (status in ('draft', 'published', 'archived')),
  title text not null check (char_length(title) between 1 and 160),
  body text not null check (char_length(body) between 1 and 12000),
  cta_label text check (cta_label is null or char_length(cta_label) between 1 and 80),
  cta_url text check (cta_url is null or (cta_url ~ '^https://' and char_length(cta_url) <= 2048)),
  media_path text check (media_path is null or media_path ~ '^site-editorial/[A-Za-z0-9/_-]+\.(png|jpg|jpeg|webp|pdf)$'),
  alt_text text check (alt_text is null or char_length(alt_text) between 1 and 500),
  starts_at timestamptz,
  ends_at timestamptz,
  revision integer not null default 1 check (revision > 0),
  created_by uuid not null references auth.users(id) on delete restrict,
  updated_by uuid not null references auth.users(id) on delete restrict,
  published_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  check (starts_at is null or ends_at is null or starts_at < ends_at),
  check ((kind not in ('document', 'image')) or (media_path is not null and alt_text is not null))
);

create table public.site_content_revisions (
  content_id uuid not null references public.site_content_items(id) on delete cascade,
  revision integer not null check (revision > 0),
  snapshot jsonb not null check (jsonb_typeof(snapshot) = 'object' and pg_column_size(snapshot) <= 32768),
  created_by uuid not null references auth.users(id) on delete restrict,
  created_at timestamptz not null default now(),
  primary key (content_id, revision)
);

create table public.site_review_cases (
  id uuid primary key default gen_random_uuid(),
  case_type text not null check (case_type in ('duplicate', 'content')),
  target_kind text not null check (target_kind in ('account', 'asset')),
  target_id uuid not null,
  outcome text not null check (outcome in ('dismissed', 'confirmed', 'request_changes', 'quarantined', 'released', 'suspended', 'restored')),
  reason text not null check (char_length(reason) between 3 and 2000),
  reviewed_by uuid not null references auth.users(id) on delete restrict,
  created_at timestamptz not null default now(),
  check ((case_type = 'duplicate' and target_kind = 'account' and outcome in ('dismissed', 'confirmed')) or (case_type = 'content' and target_kind in ('account', 'asset') and outcome in ('dismissed', 'request_changes', 'quarantined', 'released', 'suspended', 'restored')))
);

create table public.site_review_enforcements (
  id uuid primary key default gen_random_uuid(),
  review_case_id uuid not null unique references public.site_review_cases(id) on delete restrict,
  scope text not null check (scope in ('account', 'asset')),
  subject_user_id uuid references auth.users(id) on delete restrict,
  asset_id uuid references public.generated_assets(id) on delete restrict,
  state text not null default 'active' check (state in ('active', 'released')),
  reason text not null check (char_length(reason) between 3 and 2000),
  created_by uuid not null references auth.users(id) on delete restrict,
  created_at timestamptz not null default now(),
  released_by uuid references auth.users(id) on delete restrict,
  released_at timestamptz,
  check ((scope = 'account' and subject_user_id is not null and asset_id is null) or (scope = 'asset' and subject_user_id is null and asset_id is not null)),
  check ((state = 'active' and released_by is null and released_at is null) or (state = 'released' and released_by is not null and released_at is not null))
);

create index site_content_effective_idx on public.site_content_items (placement, audience, published_at desc) where status = 'published';
create index site_operator_audit_target_idx on public.site_operator_audit (target_type, target_id, created_at desc);
create index site_review_cases_target_idx on public.site_review_cases (target_kind, target_id, created_at desc);
create unique index site_active_account_restriction_idx on public.site_review_enforcements (subject_user_id) where state = 'active' and scope = 'account';
create unique index site_active_asset_restriction_idx on public.site_review_enforcements (asset_id) where state = 'active' and scope = 'asset';

alter table public.site_operator_grants enable row level security;
alter table public.site_operator_audit enable row level security;
alter table public.site_content_items enable row level security;
alter table public.site_content_revisions enable row level security;
alter table public.site_review_cases enable row level security;
alter table public.site_review_enforcements enable row level security;

create or replace function public.site_is_operator()
returns boolean language sql stable security definer set search_path = public, auth as $$
  select (select auth.uid()) is not null
    and coalesce((select auth.jwt()->>'aal'), 'aal1') = 'aal2'
    and exists (select 1 from public.site_operator_grants operator_grant where operator_grant.user_id = (select auth.uid()) and operator_grant.revoked_at is null);
$$;

create or replace function public.site_current_user_is_restricted()
returns boolean language sql stable security definer set search_path = public, auth as $$
  select exists (
    select 1 from public.site_review_enforcements enforcement
    where enforcement.scope = 'account' and enforcement.subject_user_id = (select auth.uid()) and enforcement.state = 'active'
  );
$$;

create or replace function public.site_asset_is_quarantined(target_asset uuid)
returns boolean language sql stable security definer set search_path = public as $$
  select exists (
    select 1 from public.site_review_enforcements enforcement
    where enforcement.scope = 'asset' and enforcement.asset_id = target_asset and enforcement.state = 'active'
  );
$$;

create policy "operators read own grants" on public.site_operator_grants for select to authenticated
  using ((select auth.uid()) = user_id and (select auth.jwt()->>'aal') = 'aal2');
create policy "operators read administration audit" on public.site_operator_audit for select to authenticated using (public.site_is_operator());
create policy "operators manage editorial" on public.site_content_items for all to authenticated using (public.site_is_operator()) with check (public.site_is_operator());
create policy "published editorial is readable" on public.site_content_items for select to anon, authenticated
  using (audience = 'public' and status = 'published' and (starts_at is null or starts_at <= now()) and (ends_at is null or ends_at > now()));
create policy "members read member editorial" on public.site_content_items for select to authenticated
  using (audience = 'member' and (select auth.uid()) is not null and coalesce((select auth.jwt()->>'is_anonymous'), 'false') <> 'true' and status = 'published' and (starts_at is null or starts_at <= now()) and (ends_at is null or ends_at > now()));
create policy "operators read editorial revisions" on public.site_content_revisions for select to authenticated using (public.site_is_operator());
create policy "operators read review cases" on public.site_review_cases for select to authenticated using (public.site_is_operator());
create policy "operators read review enforcement" on public.site_review_enforcements for select to authenticated using (public.site_is_operator());

-- Suspend direct tenant API access without changing workspace roles. The helper
-- is also consumed by every existing workspace RLS policy and RPC.
create or replace function public.is_workspace_member(target_workspace uuid)
returns boolean language sql stable security definer set search_path = public, auth as $$
  select exists (
    select 1 from public.workspace_members membership
    where membership.workspace_id = target_workspace and membership.user_id = (select auth.uid())
  )
  and not public.site_current_user_is_restricted()
  and (
    not exists (select 1 from auth.mfa_factors factor where factor.user_id = (select auth.uid()) and factor.status = 'verified')
    or coalesce(auth.jwt()->>'aal', 'aal1') = 'aal2'
  );
$$;

create policy "active accounts read generated assets" on public.generated_assets as restrictive for select to authenticated
  using (not public.site_current_user_is_restricted() and not public.site_asset_is_quarantined(id));
-- Definer lookup sees quarantined rows that generated_assets RLS correctly hides.
create function public.site_storage_path_is_quarantined(target_path text)
returns boolean language sql stable security definer set search_path = public as $$
  select exists (select 1 from public.generated_assets asset join public.site_review_enforcements enforcement on enforcement.asset_id = asset.id
    where asset.storage_path = target_path and enforcement.scope = 'asset' and enforcement.state = 'active');
$$;
create policy "active accounts read creative storage" on storage.objects as restrictive for select to authenticated
  using (bucket_id <> 'creative-assets' or (not public.site_current_user_is_restricted() and not public.site_storage_path_is_quarantined(name)));

-- Service-role jobs bypass RLS, so they must check the same restrictions explicitly.
-- Solo-owner workspaces: an owner's suspension stops queued work; a quarantined
-- production asset stops further generation/assembly until manual release.
create function public.site_worker_operation_allowed(target_workspace uuid, target_production uuid)
returns boolean language sql stable security definer set search_path = public as $$
  select exists (select 1 from public.workspaces workspace join public.productions production
    on production.workspace_id = workspace.id where workspace.id = target_workspace and production.id = target_production)
    and not exists (select 1 from public.workspaces workspace join public.site_review_enforcements enforcement
      on enforcement.subject_user_id = workspace.owner_id where workspace.id = target_workspace and enforcement.scope = 'account' and enforcement.state = 'active')
    and not exists (select 1 from public.generated_assets asset join public.site_review_enforcements enforcement
      on enforcement.asset_id = asset.id where asset.workspace_id = target_workspace and asset.production_id = target_production and enforcement.scope = 'asset' and enforcement.state = 'active');
$$;
revoke all on function public.site_worker_operation_allowed(uuid, uuid) from public, anon, authenticated;
grant execute on function public.site_worker_operation_allowed(uuid, uuid) to service_role;

create function public.site_guard_release()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  if new.status in ('approved', 'published') and not public.site_worker_operation_allowed(new.workspace_id, new.production_id) then
    raise exception 'production_access_restricted';
  end if;
  return new;
end;
$$;
revoke all on function public.site_guard_release() from public, anon, authenticated;
create trigger site_release_review_guard before insert or update on public.release_packages
  for each row execute function public.site_guard_release();

create or replace function public.site_content_snapshot(record public.site_content_items)
returns jsonb language sql immutable set search_path = public as $$
  select jsonb_build_object(
    'kind', record.kind, 'placement', record.placement, 'audience', record.audience, 'status', record.status,
    'title', record.title, 'body', record.body, 'cta_label', record.cta_label, 'cta_url', record.cta_url,
    'media_path', record.media_path, 'alt_text', record.alt_text, 'starts_at', record.starts_at, 'ends_at', record.ends_at,
    'published_at', record.published_at
  );
$$;

create or replace function public.site_audit(action_name text, action_reason text, target_type_name text, target uuid, details jsonb default '{}'::jsonb)
returns void language plpgsql security definer set search_path = public, auth as $$
begin
  if not public.site_is_operator() then raise exception 'operator_access_required'; end if;
  if char_length(trim(coalesce(action_reason, ''))) not between 3 and 2000 then raise exception 'reason_required'; end if;
  perform pg_advisory_xact_lock(hashtextextended('site-audit:' || (select auth.uid())::text, 0));
  if (select count(*) from public.site_operator_audit where operator_id = (select auth.uid()) and created_at > now() - interval '1 minute') >= 30 then
    raise exception 'operator_rate_limited';
  end if;
  insert into public.site_operator_audit(operator_id, action, reason, target_type, target_id, metadata)
  values ((select auth.uid()), action_name, trim(action_reason), target_type_name, target, coalesce(details, '{}'::jsonb));
end;
$$;

create or replace function public.site_save_content(target_content uuid, expected_revision integer, next_content jsonb, action_reason text)
returns public.site_content_items language plpgsql security definer set search_path = public, auth as $$
declare item public.site_content_items;
declare next_kind text := trim(coalesce(next_content->>'kind', ''));
declare next_placement text := trim(coalesce(next_content->>'placement', ''));
declare next_audience text := trim(coalesce(next_content->>'audience', ''));
declare next_title text := trim(coalesce(next_content->>'title', ''));
declare next_body text := trim(coalesce(next_content->>'body', ''));
declare next_cta_url text := nullif(trim(coalesce(next_content->>'cta_url', '')), '');
declare next_media_path text := nullif(trim(coalesce(next_content->>'media_path', '')), '');
declare next_alt_text text := nullif(trim(coalesce(next_content->>'alt_text', '')), '');
declare next_starts_at timestamptz := nullif(next_content->>'starts_at', '')::timestamptz;
declare next_ends_at timestamptz := nullif(next_content->>'ends_at', '')::timestamptz;
begin
  if not public.site_is_operator() then raise exception 'operator_access_required'; end if;
  if jsonb_typeof(next_content) <> 'object' or next_kind not in ('banner', 'tip', 'promotion', 'training', 'document', 'image')
    or next_placement !~ '^[a-z0-9][a-z0-9-]{0,63}$' or next_audience not in ('public', 'member')
    or char_length(next_title) not between 1 and 160 or char_length(next_body) not between 1 and 12000
    or (next_cta_url is not null and (next_cta_url !~ '^https://' or char_length(next_cta_url) > 2048))
    or (next_media_path is not null and next_media_path !~ '^site-editorial/[A-Za-z0-9/_-]+\.(png|jpg|jpeg|webp|pdf)$')
    or (next_alt_text is not null and char_length(next_alt_text) not between 1 and 500)
    or (next_kind in ('document', 'image') and (next_media_path is null or next_alt_text is null))
    or (next_starts_at is not null and next_ends_at is not null and next_starts_at >= next_ends_at) then raise exception 'invalid_site_content'; end if;
  if target_content is null then
    if expected_revision <> 0 then raise exception 'content_conflict'; end if;
    insert into public.site_content_items(kind, placement, audience, title, body, cta_label, cta_url, media_path, alt_text, starts_at, ends_at, created_by, updated_by)
    values (next_kind, next_placement, next_audience, next_title, next_body, nullif(trim(coalesce(next_content->>'cta_label', '')), ''), next_cta_url, next_media_path, next_alt_text, next_starts_at, next_ends_at, (select auth.uid()), (select auth.uid())) returning * into item;
  else
    select * into item from public.site_content_items where id = target_content for update;
    if item.id is null or item.revision <> expected_revision then raise exception 'content_conflict'; end if;
    update public.site_content_items set status = 'draft', published_at = null, kind = next_kind, placement = next_placement, audience = next_audience, title = next_title, body = next_body,
      cta_label = nullif(trim(coalesce(next_content->>'cta_label', '')), ''), cta_url = next_cta_url, media_path = next_media_path, alt_text = next_alt_text,
      starts_at = next_starts_at, ends_at = next_ends_at, revision = revision + 1, updated_by = (select auth.uid()), updated_at = now()
      where id = target_content returning * into item;
  end if;
  insert into public.site_content_revisions(content_id, revision, snapshot, created_by) values (item.id, item.revision, public.site_content_snapshot(item), (select auth.uid()));
  perform public.site_audit('content_saved', action_reason, 'site_content', item.id, jsonb_build_object('revision', item.revision));
  return item;
end;
$$;

create or replace function public.site_set_content_publication(target_content uuid, expected_revision integer, publish boolean, action_reason text)
returns public.site_content_items language plpgsql security definer set search_path = public, auth as $$
declare item public.site_content_items;
begin
  if not public.site_is_operator() then raise exception 'operator_access_required'; end if;
  select * into item from public.site_content_items where id = target_content for update;
  if item.id is null or item.revision <> expected_revision then raise exception 'content_conflict'; end if;
  update public.site_content_items set status = case when publish then 'published' else 'draft' end,
    published_at = case when publish then now() else null end, revision = revision + 1, updated_by = (select auth.uid()), updated_at = now()
    where id = target_content returning * into item;
  insert into public.site_content_revisions(content_id, revision, snapshot, created_by) values (item.id, item.revision, public.site_content_snapshot(item), (select auth.uid()));
  perform public.site_audit(case when publish then 'content_published' else 'content_unpublished' end, action_reason, 'site_content', item.id, jsonb_build_object('revision', item.revision));
  return item;
end;
$$;

create or replace function public.site_restore_content_revision(target_content uuid, source_revision integer, expected_revision integer, action_reason text)
returns public.site_content_items language plpgsql security definer set search_path = public, auth as $$
declare item public.site_content_items;
declare snapshot jsonb;
begin
  if not public.site_is_operator() then raise exception 'operator_access_required'; end if;
  select * into item from public.site_content_items where id = target_content for update;
  select revision.snapshot into snapshot from public.site_content_revisions revision where revision.content_id = target_content and revision.revision = source_revision;
  if item.id is null or item.revision <> expected_revision or snapshot is null then raise exception 'content_conflict'; end if;
  update public.site_content_items set kind = snapshot->>'kind', placement = snapshot->>'placement', audience = snapshot->>'audience', status = 'draft', title = snapshot->>'title', body = snapshot->>'body',
    cta_label = nullif(snapshot->>'cta_label', ''), cta_url = nullif(snapshot->>'cta_url', ''), media_path = nullif(snapshot->>'media_path', ''), alt_text = nullif(snapshot->>'alt_text', ''),
    starts_at = nullif(snapshot->>'starts_at', '')::timestamptz, ends_at = nullif(snapshot->>'ends_at', '')::timestamptz, published_at = null,
    revision = revision + 1, updated_by = (select auth.uid()), updated_at = now() where id = target_content returning * into item;
  insert into public.site_content_revisions(content_id, revision, snapshot, created_by) values (item.id, item.revision, public.site_content_snapshot(item), (select auth.uid()));
  perform public.site_audit('content_restored', action_reason, 'site_content', item.id, jsonb_build_object('source_revision', source_revision, 'revision', item.revision));
  return item;
end;
$$;

create or replace function public.site_record_review(case_kind text, subject_kind text, subject_id uuid, review_outcome text, action_reason text)
returns uuid language plpgsql security definer set search_path = public, auth as $$
declare case_id uuid;
declare enforcement_scope text;
begin
  if not public.site_is_operator() then raise exception 'operator_access_required'; end if;
  if (case_kind = 'duplicate' and subject_kind = 'account' and review_outcome in ('dismissed', 'confirmed'))
    or (case_kind = 'content' and subject_kind = 'asset' and review_outcome in ('dismissed', 'request_changes', 'quarantined', 'released'))
    or (case_kind = 'content' and subject_kind = 'account' and review_outcome in ('dismissed', 'request_changes', 'suspended', 'restored')) then null; else raise exception 'invalid_review'; end if;
  if char_length(trim(coalesce(action_reason, ''))) not between 3 and 2000 then raise exception 'reason_required'; end if;
  -- Serialize all decisions for a target, including releases and retries.
  perform pg_advisory_xact_lock(hashtextextended(subject_kind || ':' || subject_id::text, 0));
  if subject_kind = 'account' and not exists(select 1 from auth.users where id = subject_id) then raise exception 'review_target_missing'; end if;
  if subject_kind = 'asset' and not exists(select 1 from public.generated_assets where id = subject_id) then raise exception 'review_target_missing'; end if;
  if subject_kind = 'account' and subject_id = (select auth.uid()) and review_outcome = 'suspended' then raise exception 'cannot_suspend_current_operator'; end if;
  insert into public.site_review_cases(case_type, target_kind, target_id, outcome, reason, reviewed_by)
  values (case_kind, subject_kind, subject_id, review_outcome, trim(action_reason), (select auth.uid())) returning id into case_id;
  if review_outcome in ('quarantined', 'suspended') then
    enforcement_scope := case when subject_kind = 'asset' then 'asset' else 'account' end;
    insert into public.site_review_enforcements(review_case_id, scope, subject_user_id, asset_id, reason, created_by)
    values (case_id, enforcement_scope, case when enforcement_scope = 'account' then subject_id else null end, case when enforcement_scope = 'asset' then subject_id else null end, trim(action_reason), (select auth.uid())) on conflict do nothing;
  elsif review_outcome in ('released', 'restored') then
    update public.site_review_enforcements set state = 'released', released_by = (select auth.uid()), released_at = now()
      where state = 'active' and ((scope = 'account' and subject_user_id = subject_id) or (scope = 'asset' and asset_id = subject_id));
  end if;
  perform public.site_audit('review_recorded', action_reason, subject_kind, subject_id, jsonb_build_object('case_id', case_id, 'outcome', review_outcome));
  return case_id;
end;
$$;

create or replace function public.site_search_accounts(search_term text)
returns table(user_id uuid, email text, created_at timestamptz, workspace_id uuid, workspace_name text)
language sql stable security definer set search_path = public, auth as $$
  select account.id, account.email, account.created_at, workspace.id, workspace.name
  from auth.users account left join public.workspaces workspace on workspace.owner_id = account.id
  where public.site_is_operator() and char_length(trim(search_term)) between 3 and 120
    and lower(coalesce(account.email, '')) like '%' || lower(trim(search_term)) || '%'
  order by account.created_at desc limit 25;
$$;

revoke all on public.site_operator_grants, public.site_operator_audit, public.site_content_items, public.site_content_revisions, public.site_review_cases, public.site_review_enforcements from anon, authenticated;
grant select on public.site_operator_grants, public.site_operator_audit, public.site_content_items, public.site_content_revisions, public.site_review_cases, public.site_review_enforcements to anon, authenticated;
revoke all on function public.site_is_operator(), public.site_current_user_is_restricted(), public.site_asset_is_quarantined(uuid), public.site_content_snapshot(public.site_content_items), public.site_audit(text, text, text, uuid, jsonb), public.site_save_content(uuid, integer, jsonb, text), public.site_set_content_publication(uuid, integer, boolean, text), public.site_restore_content_revision(uuid, integer, integer, text), public.site_record_review(text, text, uuid, text, text), public.site_search_accounts(text) from public, anon;
grant execute on function public.site_is_operator(), public.site_current_user_is_restricted(), public.site_asset_is_quarantined(uuid), public.site_save_content(uuid, integer, jsonb, text), public.site_set_content_publication(uuid, integer, boolean, text), public.site_restore_content_revision(uuid, integer, integer, text), public.site_record_review(text, text, uuid, text, text), public.site_search_accounts(text) to authenticated;
grant execute on function public.site_is_operator(), public.site_current_user_is_restricted(), public.site_asset_is_quarantined(uuid), public.site_save_content(uuid, integer, jsonb, text), public.site_set_content_publication(uuid, integer, boolean, text), public.site_restore_content_revision(uuid, integer, integer, text), public.site_record_review(text, text, uuid, text, text), public.site_search_accounts(text) to service_role;

insert into storage.buckets(id, name, public, file_size_limit, allowed_mime_types)
values ('site-editorial', 'site-editorial', false, 10485760, array['image/png', 'image/jpeg', 'image/webp', 'application/pdf'])
on conflict (id) do update set public = false, file_size_limit = excluded.file_size_limit, allowed_mime_types = excluded.allowed_mime_types;
create policy "operators upload site editorial media" on storage.objects for insert to authenticated with check (
  bucket_id = 'site-editorial' and public.site_is_operator() and name ~ '^site-editorial/[A-Za-z0-9/_-]+\.(png|jpg|jpeg|webp|pdf)$'
);
create policy "operators read site editorial media" on storage.objects for select to authenticated using (bucket_id = 'site-editorial' and public.site_is_operator());
create policy "read published editorial media" on storage.objects for select to anon, authenticated using (
  bucket_id = 'site-editorial' and exists(select 1 from public.site_content_items item where item.media_path = name and item.status = 'published')
);

revoke all on function public.site_storage_path_is_quarantined(text) from public, anon;
grant execute on function public.site_storage_path_is_quarantined(text) to authenticated, service_role;
grant select on public.site_operator_grants, public.site_content_items, public.site_content_revisions, public.site_operator_audit, public.site_review_cases, public.site_review_enforcements to service_role;
