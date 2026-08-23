create type public.production_run_mode as enum ('manual', 'semi_auto', 'auto');
create type public.job_status as enum ('pending', 'running', 'completed', 'failed', 'cancelled', 'dead');
create type public.agent_visibility as enum ('free', 'premium', 'private');
create type public.model_tier as enum ('free', 'mid', 'quality');
create type public.publication_status as enum ('draft', 'scheduled', 'publishing', 'published', 'failed', 'cancelled');

alter table public.channels
  add column audience text not null default '',
  add column voice text not null default '',
  add column cadence text not null default '',
  add column pillars text[] not null default '{}';

alter table public.productions
  add column run_mode public.production_run_mode not null default 'manual',
  add column brief text not null default '',
  add column audience text not null default '',
  add column credit_limit bigint check (credit_limit is null or credit_limit >= 0),
  add column scheduled_at timestamptz,
  add column rights_attested_at timestamptz;

alter table public.dna_records
  add column version integer not null default 1 check (version > 0),
  add column locked boolean not null default false,
  add column channel_ids uuid[] not null default '{}';

create table public.agent_catalog (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique check (slug ~ '^[a-z0-9]+(?:-[a-z0-9]+)*$'),
  name text not null,
  department_name text not null,
  summary text not null default '',
  version text not null,
  visibility public.agent_visibility not null default 'free' check (visibility <> 'private'),
  price_key text,
  capabilities jsonb not null default '[]'::jsonb,
  active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  check ((visibility = 'premium' and price_key is not null) or visibility = 'free')
);

create table public.agent_catalog_files (
  catalog_agent_id uuid primary key references public.agent_catalog(id) on delete cascade,
  role text not null default '',
  soul text not null default '',
  jobdescription text not null default '',
  skills text not null default '',
  memory text not null default '',
  user_content text not null default '',
  checksum text not null,
  created_at timestamptz not null default now()
);

create table public.agent_entitlements (
  workspace_id uuid not null references public.workspaces(id) on delete cascade,
  catalog_agent_id uuid not null references public.agent_catalog(id) on delete cascade,
  purchase_id uuid,
  granted_at timestamptz not null default now(),
  primary key (workspace_id, catalog_agent_id)
);

alter table public.agents
  add column catalog_agent_id uuid references public.agent_catalog(id) on delete restrict,
  add column catalog_version text,
  add column protected_config boolean not null default false,
  add column capabilities jsonb not null default '[]'::jsonb;

create table public.provider_connections (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references public.workspaces(id) on delete cascade,
  provider text not null,
  label text not null,
  base_url text,
  default_model text,
  capabilities text[] not null default '{}',
  masked_secret text not null,
  key_version text not null,
  status text not null default 'active' check (status in ('active', 'invalid', 'revoked')),
  last_validated_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (workspace_id, label)
);

create table public.provider_secrets (
  connection_id uuid primary key references public.provider_connections(id) on delete cascade,
  ciphertext text not null,
  iv text not null,
  tag text not null,
  key_version text not null,
  updated_at timestamptz not null default now()
);

create table public.model_catalog (
  id uuid primary key default gen_random_uuid(),
  provider text not null,
  model text not null,
  label text not null,
  tier public.model_tier not null,
  capabilities text[] not null,
  credit_estimate integer not null default 0 check (credit_estimate >= 0),
  active boolean not null default true,
  metadata jsonb not null default '{}'::jsonb,
  unique (provider, model)
);

create table public.production_artifacts (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references public.workspaces(id) on delete cascade,
  production_id uuid not null references public.productions(id) on delete cascade,
  department_step integer not null check (department_step between 0 and 12),
  kind text not null,
  version integer not null default 1 check (version > 0),
  status text not null default 'draft' check (status in ('draft', 'approved', 'rejected', 'locked')),
  content jsonb not null default '{}'::jsonb,
  storage_path text,
  checksum text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (production_id, kind, version)
);

create table public.genplay_shots (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references public.workspaces(id) on delete cascade,
  production_id uuid not null references public.productions(id) on delete cascade,
  master_id uuid references public.genplay_masters(id) on delete set null,
  shot_number integer not null check (shot_number > 0),
  prompt text not null,
  duration_ms integer not null check (duration_ms > 0),
  status text not null default 'waiting' check (status in ('waiting', 'uploaded', 'selected')),
  created_at timestamptz not null default now(),
  unique (production_id, shot_number)
);

create table public.shot_clips (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references public.workspaces(id) on delete cascade,
  production_id uuid not null references public.productions(id) on delete cascade,
  shot_id uuid not null references public.genplay_shots(id) on delete cascade,
  version integer not null check (version > 0),
  storage_path text not null,
  mime_type text not null check (mime_type in ('video/mp4', 'video/quicktime', 'video/webm')),
  byte_size bigint not null check (byte_size > 0),
  selected boolean not null default false,
  created_at timestamptz not null default now(),
  unique (shot_id, version)
);

create table public.production_approvals (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references public.workspaces(id) on delete cascade,
  production_id uuid not null references public.productions(id) on delete cascade,
  department_step integer not null check (department_step between 0 and 12),
  status text not null default 'pending' check (status in ('pending', 'approved', 'rejected', 'cancelled')),
  note text not null default '',
  decided_by uuid references auth.users(id) on delete set null,
  decided_at timestamptz,
  created_at timestamptz not null default now()
);

create table public.credit_accounts (
  workspace_id uuid primary key references public.workspaces(id) on delete cascade,
  available bigint not null default 100 check (available >= 0),
  reserved bigint not null default 0 check (reserved >= 0),
  updated_at timestamptz not null default now()
);

create table public.credit_ledger (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references public.workspaces(id) on delete cascade,
  amount bigint not null check (amount <> 0),
  entry_type text not null check (entry_type in ('grant', 'purchase', 'reserve', 'settle', 'release', 'refund', 'adjustment')),
  reference_type text,
  reference_id text,
  idempotency_key text not null,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  unique (workspace_id, idempotency_key)
);

create table public.commerce_products (
  key text primary key,
  name text not null,
  description text not null default '',
  kind text not null check (kind in ('credits', 'agent_pack')),
  stripe_price_id text not null unique,
  credit_amount bigint check (credit_amount is null or credit_amount > 0),
  catalog_agent_id uuid references public.agent_catalog(id) on delete restrict,
  active boolean not null default true,
  check ((kind = 'credits' and credit_amount is not null and catalog_agent_id is null)
    or (kind = 'agent_pack' and credit_amount is null and catalog_agent_id is not null))
);

create table public.purchases (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references public.workspaces(id) on delete cascade,
  product_key text not null references public.commerce_products(key) on delete restrict,
  stripe_checkout_session_id text not null unique,
  stripe_payment_intent_id text,
  status text not null default 'pending' check (status in ('pending', 'paid', 'refunded', 'failed')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.agent_entitlements
  add constraint agent_entitlements_purchase_fkey foreign key (purchase_id) references public.purchases(id) on delete set null;

create table public.payment_events (
  stripe_event_id text primary key,
  event_type text not null,
  processed_at timestamptz not null default now()
);

create table public.job_queue (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references public.workspaces(id) on delete cascade,
  production_id uuid references public.productions(id) on delete cascade,
  kind text not null,
  status public.job_status not null default 'pending',
  payload jsonb not null default '{}'::jsonb,
  result jsonb not null default '{}'::jsonb,
  credit_reservation bigint not null default 0 check (credit_reservation >= 0),
  attempts integer not null default 0 check (attempts >= 0),
  max_attempts integer not null default 3 check (max_attempts > 0),
  idempotency_key text not null,
  run_after timestamptz not null default now(),
  locked_at timestamptz,
  locked_by text,
  error_message text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (workspace_id, idempotency_key)
);

create table public.social_connections (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references public.workspaces(id) on delete cascade,
  platform text not null check (platform in ('youtube', 'instagram', 'facebook', 'tiktok', 'x')),
  external_account_id text not null,
  account_label text not null,
  status text not null default 'active' check (status in ('active', 'expired', 'revoked')),
  scopes text[] not null default '{}',
  expires_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (workspace_id, platform, external_account_id)
);

create table public.social_connection_secrets (
  connection_id uuid primary key references public.social_connections(id) on delete cascade,
  ciphertext text not null,
  iv text not null,
  tag text not null,
  key_version text not null,
  updated_at timestamptz not null default now()
);

create table public.publications (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references public.workspaces(id) on delete cascade,
  production_id uuid not null references public.productions(id) on delete cascade,
  connection_id uuid not null references public.social_connections(id) on delete cascade,
  status public.publication_status not null default 'draft',
  scheduled_at timestamptz,
  published_at timestamptz,
  external_post_id text,
  metadata jsonb not null default '{}'::jsonb,
  error_message text,
  idempotency_key text not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (workspace_id, idempotency_key)
);

create table public.social_metrics (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references public.workspaces(id) on delete cascade,
  publication_id uuid not null references public.publications(id) on delete cascade,
  captured_at timestamptz not null,
  metrics jsonb not null,
  raw_payload jsonb not null default '{}'::jsonb,
  unique (publication_id, captured_at)
);

create table public.signals (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references public.workspaces(id) on delete cascade,
  channel_id uuid references public.channels(id) on delete cascade,
  production_id uuid references public.productions(id) on delete cascade,
  publication_id uuid references public.publications(id) on delete set null,
  signal_type text not null check (signal_type in ('native', 'conversation', 'performance', 'recommendation')),
  title text not null,
  body text not null,
  metadata jsonb not null default '{}'::jsonb,
  status text not null default 'active' check (status in ('active', 'used', 'archived')),
  created_at timestamptz not null default now()
);

alter table public.provider_connections add constraint provider_connections_workspace_id_key unique (workspace_id, id);
alter table public.genplay_shots add constraint genplay_shots_workspace_id_key unique (workspace_id, id);
alter table public.social_connections add constraint social_connections_workspace_id_key unique (workspace_id, id);
alter table public.publications add constraint publications_workspace_id_key unique (workspace_id, id);

alter table public.production_artifacts add constraint production_artifacts_production_workspace_fkey
  foreign key (workspace_id, production_id) references public.productions(workspace_id, id) on delete cascade;
alter table public.genplay_shots add constraint genplay_shots_production_workspace_fkey
  foreign key (workspace_id, production_id) references public.productions(workspace_id, id) on delete cascade;
alter table public.genplay_shots add constraint genplay_shots_master_workspace_fkey
  foreign key (workspace_id, master_id) references public.genplay_masters(workspace_id, id);
alter table public.shot_clips add constraint shot_clips_production_workspace_fkey
  foreign key (workspace_id, production_id) references public.productions(workspace_id, id) on delete cascade;
alter table public.shot_clips add constraint shot_clips_shot_workspace_fkey
  foreign key (workspace_id, shot_id) references public.genplay_shots(workspace_id, id) on delete cascade;
alter table public.production_approvals add constraint production_approvals_production_workspace_fkey
  foreign key (workspace_id, production_id) references public.productions(workspace_id, id) on delete cascade;
alter table public.job_queue add constraint job_queue_production_workspace_fkey
  foreign key (workspace_id, production_id) references public.productions(workspace_id, id) on delete cascade;
alter table public.publications add constraint publications_production_workspace_fkey
  foreign key (workspace_id, production_id) references public.productions(workspace_id, id) on delete cascade;
alter table public.publications add constraint publications_connection_workspace_fkey
  foreign key (workspace_id, connection_id) references public.social_connections(workspace_id, id) on delete cascade;
alter table public.social_metrics add constraint social_metrics_publication_workspace_fkey
  foreign key (workspace_id, publication_id) references public.publications(workspace_id, id) on delete cascade;

create index provider_connections_workspace_idx on public.provider_connections(workspace_id);
create index production_artifacts_production_idx on public.production_artifacts(production_id, department_step, kind);
create index genplay_shots_production_idx on public.genplay_shots(production_id, shot_number);
create index shot_clips_shot_idx on public.shot_clips(shot_id, version desc);
create index approvals_production_idx on public.production_approvals(production_id, status);
create index credit_ledger_workspace_idx on public.credit_ledger(workspace_id, created_at desc);
create index job_queue_claim_idx on public.job_queue(status, run_after, created_at) where status = 'pending';
create index social_connections_workspace_idx on public.social_connections(workspace_id);
create index publications_production_idx on public.publications(production_id, created_at desc);
create index social_metrics_publication_idx on public.social_metrics(publication_id, captured_at desc);
create index signals_workspace_idx on public.signals(workspace_id, created_at desc);

insert into public.agent_catalog (slug, name, department_name, summary, version, visibility, capabilities)
values
  ('research-lead', 'Research Lead', 'Research', 'Ground every creative choice in traceable evidence and constraints.', '1.0.0', 'free', '["text"]'),
  ('marketing-strategist', 'Marketing Strategist', 'Marketing', 'Turn the brief into audience, positioning, and campaign direction.', '1.0.0', 'free', '["text"]'),
  ('creative-director', 'Creative Director', 'Creative', 'Define the coherent visual and emotional language of the film.', '1.0.0', 'free', '["text","image"]'),
  ('story-editor', 'Story Editor', 'Story', 'Shape premise, structure, character intent, and narrative momentum.', '1.0.0', 'free', '["text"]'),
  ('storyboard-artist', 'Storyboard Artist', 'Storyboard', 'Translate story beats into shot-ready visual boards.', '1.0.0', 'free', '["text","image"]'),
  ('script-writer', 'Script Writer', 'Script', 'Write the production script from the approved story.', '1.0.0', 'free', '["text"]'),
  ('screenplay-editor', 'Screenplay Editor', 'Screenplay', 'Convert the script into production-ready screenplay form.', '1.0.0', 'free', '["text"]'),
  ('genplay-engineer', 'GenPlay Engineer', 'AI Conversion', 'Create detailed read-only prompts for each generation shot.', '1.0.0', 'free', '["text","image"]'),
  ('production-supervisor', 'Production Supervisor', 'Video Production', 'Track shot coverage, versions, continuity, and assembly readiness.', '1.0.0', 'free', '["text","image","audio"]'),
  ('launch-producer', 'Launch Producer', 'Launch', 'Prepare masters, rights checks, metadata, and release package.', '1.0.0', 'free', '["text"]'),
  ('social-publisher', 'Social Publisher', 'Social Posting', 'Adapt and publish platform-native releases within authorization.', '1.0.0', 'free', '["text","image"]'),
  ('community-listener', 'Community Listener', 'Social Management', 'Extract useful conversation signals without chasing noise.', '1.0.0', 'free', '["text"]'),
  ('performance-analyst', 'Performance Analyst', 'Reporting', 'Turn release metrics into evidence for the next brief.', '1.0.0', 'free', '["text"]')
on conflict (slug) do nothing;

insert into public.agent_catalog_files (catalog_agent_id, role, soul, jobdescription, skills, memory, user_content, checksum)
select
  id,
  'You are the ' || name || ' in Gem Studio''s ' || department_name || ' department.',
  'Protect the brief, continuity, rights, budget, and human creative intent.',
  '## Deliverable\n' || summary || '\n\n## Constraints\nUse only supplied or traceable production context.\n\n## Handoff\nReturn structured output for the next department.',
  'Validate inputs. Preserve provenance. State uncertainty. Produce concise structured handoffs.',
  '## Session Log\n(empty)',
  '',
  md5(slug || version)
from public.agent_catalog
where visibility = 'free'
on conflict (catalog_agent_id) do nothing;

alter table public.agent_catalog enable row level security;
alter table public.agent_catalog_files enable row level security;
alter table public.agent_entitlements enable row level security;
alter table public.provider_connections enable row level security;
alter table public.provider_secrets enable row level security;
alter table public.model_catalog enable row level security;
alter table public.production_artifacts enable row level security;
alter table public.genplay_shots enable row level security;
alter table public.shot_clips enable row level security;
alter table public.production_approvals enable row level security;
alter table public.credit_accounts enable row level security;
alter table public.credit_ledger enable row level security;
alter table public.commerce_products enable row level security;
alter table public.purchases enable row level security;
alter table public.payment_events enable row level security;
alter table public.job_queue enable row level security;
alter table public.social_connections enable row level security;
alter table public.social_connection_secrets enable row level security;
alter table public.publications enable row level security;
alter table public.social_metrics enable row level security;
alter table public.signals enable row level security;

create policy "catalog metadata is readable" on public.agent_catalog for select using (active);
create policy "model metadata is readable" on public.model_catalog for select using (active);
create policy "commerce products are readable" on public.commerce_products for select using (active);

create policy "members read entitlements" on public.agent_entitlements for select to authenticated using (public.is_workspace_member(workspace_id));
create policy "members read provider connections" on public.provider_connections for select to authenticated using (public.is_workspace_member(workspace_id));
create policy "members create provider connections" on public.provider_connections for insert to authenticated with check (public.is_workspace_member(workspace_id));
create policy "members update provider connections" on public.provider_connections for update to authenticated using (public.is_workspace_member(workspace_id)) with check (public.is_workspace_member(workspace_id));
create policy "members delete provider connections" on public.provider_connections for delete to authenticated using (public.is_workspace_member(workspace_id));

create policy "members manage artifacts" on public.production_artifacts for all to authenticated using (
  public.is_workspace_member(workspace_id)
  and exists (select 1 from public.productions where id = production_id and workspace_id = production_artifacts.workspace_id)
) with check (
  public.is_workspace_member(workspace_id)
  and exists (select 1 from public.productions where id = production_id and workspace_id = production_artifacts.workspace_id)
);
create policy "members manage shots" on public.genplay_shots for all to authenticated using (
  public.is_workspace_member(workspace_id)
  and exists (select 1 from public.productions where id = production_id and workspace_id = genplay_shots.workspace_id)
) with check (
  public.is_workspace_member(workspace_id)
  and exists (select 1 from public.productions where id = production_id and workspace_id = genplay_shots.workspace_id)
);
create policy "members manage clips" on public.shot_clips for all to authenticated using (
  public.is_workspace_member(workspace_id)
  and exists (select 1 from public.genplay_shots where id = shot_id and workspace_id = shot_clips.workspace_id and production_id = shot_clips.production_id)
) with check (
  public.is_workspace_member(workspace_id)
  and exists (select 1 from public.genplay_shots where id = shot_id and workspace_id = shot_clips.workspace_id and production_id = shot_clips.production_id)
);
create policy "members manage approvals" on public.production_approvals for all to authenticated using (
  public.is_workspace_member(workspace_id)
) with check (
  public.is_workspace_member(workspace_id)
  and exists (select 1 from public.productions where id = production_id and workspace_id = production_approvals.workspace_id)
);

create policy "members read credit account" on public.credit_accounts for select to authenticated using (public.is_workspace_member(workspace_id));
create policy "members read credit ledger" on public.credit_ledger for select to authenticated using (public.is_workspace_member(workspace_id));
create policy "members read purchases" on public.purchases for select to authenticated using (public.is_workspace_member(workspace_id));
create policy "members read jobs" on public.job_queue for select to authenticated using (public.is_workspace_member(workspace_id));

create policy "members manage social connections" on public.social_connections for all to authenticated using (public.is_workspace_member(workspace_id)) with check (public.is_workspace_member(workspace_id));
create policy "members read publications" on public.publications for select to authenticated using (public.is_workspace_member(workspace_id));
create policy "members create publications" on public.publications for insert to authenticated with check (
  public.is_workspace_member(workspace_id)
  and exists (select 1 from public.productions where id = production_id and workspace_id = publications.workspace_id)
  and exists (select 1 from public.social_connections where id = connection_id and workspace_id = publications.workspace_id)
);
create policy "members read social metrics" on public.social_metrics for select to authenticated using (public.is_workspace_member(workspace_id));
create policy "members manage signals" on public.signals for all to authenticated using (public.is_workspace_member(workspace_id)) with check (
  public.is_workspace_member(workspace_id)
  and (channel_id is null or exists (select 1 from public.channels where id = channel_id and workspace_id = signals.workspace_id))
  and (production_id is null or exists (select 1 from public.productions where id = production_id and workspace_id = signals.workspace_id))
);

create or replace function public.seed_studio_workspace()
returns trigger language plpgsql security definer set search_path = public as $$
declare department_name text;
declare department_order integer := 0;
begin
  foreach department_name in array array['Research','Marketing','Creative','Story','Storyboard','Script','Screenplay','AI Conversion','Video Production','Launch','Social Posting','Social Management','Reporting']
  loop
    insert into public.departments (workspace_id, name, display_order)
    values (new.id, department_name, department_order)
    on conflict (workspace_id, name) do nothing;
    department_order := department_order + 1;
  end loop;
  insert into public.credit_accounts (workspace_id, available) values (new.id, 100)
  on conflict (workspace_id) do nothing;
  insert into public.credit_ledger (workspace_id, amount, entry_type, idempotency_key, metadata)
  values (new.id, 100, 'grant', 'beta-starter', '{"reason":"beta_starter"}'::jsonb)
  on conflict (workspace_id, idempotency_key) do nothing;
  return new;
end;
$$;

create trigger on_workspace_created after insert on public.workspaces for each row execute procedure public.seed_studio_workspace();

do $$
declare workspace_record record;
declare department_name text;
declare department_order integer;
begin
  for workspace_record in select id from public.workspaces loop
    department_order := 0;
    foreach department_name in array array['Research','Marketing','Creative','Story','Storyboard','Script','Screenplay','AI Conversion','Video Production','Launch','Social Posting','Social Management','Reporting']
    loop
      insert into public.departments (workspace_id, name, display_order)
      values (workspace_record.id, department_name, department_order)
      on conflict (workspace_id, name) do nothing;
      department_order := department_order + 1;
    end loop;
    insert into public.credit_accounts (workspace_id, available) values (workspace_record.id, 100)
    on conflict (workspace_id) do nothing;
    insert into public.credit_ledger (workspace_id, amount, entry_type, idempotency_key, metadata)
    values (workspace_record.id, 100, 'grant', 'beta-starter', '{"reason":"beta_starter"}'::jsonb)
    on conflict (workspace_id, idempotency_key) do nothing;
  end loop;
end $$;

create or replace function public.reserve_credits(target_workspace uuid, amount bigint, key text)
returns boolean language plpgsql security definer set search_path = public as $$
declare changed integer;
begin
  if amount <= 0 or not public.is_workspace_member(target_workspace) then return false; end if;
  if exists (select 1 from public.credit_ledger where workspace_id = target_workspace and idempotency_key = key) then return true; end if;
  update public.credit_accounts
  set available = available - amount, reserved = reserved + amount, updated_at = now()
  where workspace_id = target_workspace and available >= amount;
  get diagnostics changed = row_count;
  if changed = 0 then return false; end if;
  insert into public.credit_ledger (workspace_id, amount, entry_type, idempotency_key)
  values (target_workspace, -amount, 'reserve', key);
  return true;
end;
$$;

create or replace function public.enqueue_studio_job(target_workspace uuid, target_production uuid, job_kind text, job_payload jsonb, reservation bigint, key text)
returns uuid language plpgsql security definer set search_path = public as $$
declare job_id uuid;
begin
  if not public.is_workspace_member(target_workspace) then raise exception 'not_authorized'; end if;
  if target_production is not null and not exists (select 1 from public.productions where id = target_production and workspace_id = target_workspace) then raise exception 'invalid_production'; end if;
  if reservation > 0 and not public.reserve_credits(target_workspace, reservation, 'reserve:' || key) then raise exception 'insufficient_credits'; end if;
  insert into public.job_queue (workspace_id, production_id, kind, payload, credit_reservation, idempotency_key)
  values (target_workspace, target_production, job_kind, coalesce(job_payload, '{}'::jsonb), greatest(reservation, 0), key)
  on conflict (workspace_id, idempotency_key) do update set idempotency_key = excluded.idempotency_key
  returning id into job_id;
  return job_id;
end;
$$;

create or replace function public.save_provider_connection(
  target_workspace uuid,
  provider_name text,
  connection_label text,
  connection_base_url text,
  connection_model text,
  connection_capabilities text[],
  secret_mask text,
  secret_ciphertext text,
  secret_iv text,
  secret_tag text,
  secret_key_version text
)
returns uuid language plpgsql security definer set search_path = public as $$
declare connection_id uuid;
begin
  if not public.is_workspace_member(target_workspace) then raise exception 'not_authorized'; end if;
  if length(trim(provider_name)) = 0 or length(trim(connection_label)) = 0 then raise exception 'invalid_connection'; end if;
  insert into public.provider_connections (
    workspace_id, provider, label, base_url, default_model, capabilities, masked_secret, key_version
  ) values (
    target_workspace, trim(provider_name), trim(connection_label), nullif(trim(connection_base_url), ''), nullif(trim(connection_model), ''),
    coalesce(connection_capabilities, '{}'), secret_mask, secret_key_version
  ) returning id into connection_id;
  insert into public.provider_secrets (connection_id, ciphertext, iv, tag, key_version)
  values (connection_id, secret_ciphertext, secret_iv, secret_tag, secret_key_version);
  return connection_id;
end;
$$;

create or replace function public.hire_catalog_agent(target_workspace uuid, target_catalog_agent uuid, target_lane uuid)
returns uuid language plpgsql security definer set search_path = public as $$
declare catalog_record public.agent_catalog;
declare catalog_files public.agent_catalog_files;
declare new_agent_id uuid;
begin
  if not public.is_workspace_member(target_workspace) then raise exception 'not_authorized'; end if;
  if not exists (select 1 from public.lanes where id = target_lane and workspace_id = target_workspace) then raise exception 'invalid_lane'; end if;
  select * into catalog_record from public.agent_catalog where id = target_catalog_agent and active;
  if catalog_record.id is null then raise exception 'agent_not_found'; end if;
  if not exists (
    select 1 from public.lanes lane join public.departments department on department.id = lane.department_id and department.workspace_id = lane.workspace_id
    where lane.id = target_lane and lane.workspace_id = target_workspace and department.name = catalog_record.department_name
  ) then raise exception 'department_mismatch'; end if;
  if catalog_record.visibility = 'premium' and not exists (
    select 1 from public.agent_entitlements where workspace_id = target_workspace and catalog_agent_id = target_catalog_agent
  ) then raise exception 'entitlement_required'; end if;
  insert into public.agents (workspace_id, lane_id, name, catalog_agent_id, catalog_version, protected_config, capabilities)
  values (
    target_workspace, target_lane, catalog_record.name, catalog_record.id, catalog_record.version,
    catalog_record.visibility = 'premium', catalog_record.capabilities
  ) returning id into new_agent_id;
  if catalog_record.visibility = 'free' then
    select * into catalog_files from public.agent_catalog_files where catalog_agent_id = target_catalog_agent;
    if catalog_files.catalog_agent_id is not null then
      update public.agent_files set
        role = catalog_files.role,
        soul = catalog_files.soul,
        jobdescription = catalog_files.jobdescription,
        skills = catalog_files.skills,
        memory = catalog_files.memory,
        user_content = catalog_files.user_content,
        updated_at = now()
      where agent_id = new_agent_id;
    end if;
  end if;
  return new_agent_id;
end;
$$;

create or replace function public.fulfill_checkout(
  target_event_id text,
  target_event_type text,
  target_session_id text,
  target_payment_intent_id text
)
returns boolean language plpgsql security definer set search_path = public as $$
declare purchase_record public.purchases;
declare product_record public.commerce_products;
begin
  if exists (select 1 from public.payment_events where stripe_event_id = target_event_id) then return false; end if;
  select * into purchase_record from public.purchases where stripe_checkout_session_id = target_session_id for update;
  if purchase_record.id is null then raise exception 'purchase_not_found'; end if;
  select * into product_record from public.commerce_products where key = purchase_record.product_key;
  if product_record.key is null then raise exception 'product_not_found'; end if;
  insert into public.payment_events (stripe_event_id, event_type) values (target_event_id, target_event_type);
  update public.purchases set status = 'paid', stripe_payment_intent_id = target_payment_intent_id, updated_at = now()
  where id = purchase_record.id;
  if product_record.kind = 'credits' then
    update public.credit_accounts set available = available + product_record.credit_amount, updated_at = now()
    where workspace_id = purchase_record.workspace_id;
    insert into public.credit_ledger (workspace_id, amount, entry_type, reference_type, reference_id, idempotency_key)
    values (purchase_record.workspace_id, product_record.credit_amount, 'purchase', 'purchase', purchase_record.id::text, 'stripe:' || target_event_id);
  else
    insert into public.agent_entitlements (workspace_id, catalog_agent_id, purchase_id)
    values (purchase_record.workspace_id, product_record.catalog_agent_id, purchase_record.id)
    on conflict (workspace_id, catalog_agent_id) do nothing;
  end if;
  return true;
end;
$$;

grant execute on function public.reserve_credits(uuid, bigint, text) to authenticated;
grant execute on function public.enqueue_studio_job(uuid, uuid, text, jsonb, bigint, text) to authenticated;
grant execute on function public.save_provider_connection(uuid, text, text, text, text, text[], text, text, text, text, text) to authenticated;
grant execute on function public.hire_catalog_agent(uuid, uuid, uuid) to authenticated;
revoke all on function public.fulfill_checkout(text, text, text, text) from public, anon, authenticated;
grant execute on function public.fulfill_checkout(text, text, text, text) to service_role;
