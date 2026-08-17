create extension if not exists "pgcrypto";

create type public.workspace_role as enum ('owner');
create type public.dna_type as enum ('CDNA', 'LDNA', 'PDNA');

create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  display_name text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.workspaces (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references auth.users(id) on delete cascade,
  name text not null default 'My Studio',
  slug text not null unique,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.workspace_members (
  workspace_id uuid not null references public.workspaces(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  role public.workspace_role not null default 'owner',
  created_at timestamptz not null default now(),
  primary key (workspace_id, user_id)
);

create table public.channels (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references public.workspaces(id) on delete cascade,
  name text not null,
  status text not null default 'active',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.productions (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references public.workspaces(id) on delete cascade,
  channel_id uuid not null references public.channels(id) on delete cascade,
  title text not null,
  status text not null default 'draft',
  data jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.dna_records (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references public.workspaces(id) on delete cascade,
  dna_id text not null,
  dna_type public.dna_type not null,
  status text not null default 'draft',
  schema_version text not null,
  record jsonb not null,
  source_checksum text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (workspace_id, dna_id),
  check ((dna_type = 'CDNA' and dna_id like 'CHAR-%') or (dna_type = 'LDNA' and dna_id like 'LOC-%') or (dna_type = 'PDNA' and dna_id like 'PROP-%'))
);

create index channels_workspace_idx on public.channels(workspace_id);
create index productions_workspace_idx on public.productions(workspace_id);
create index dna_records_workspace_idx on public.dna_records(workspace_id);

create or replace function public.is_workspace_member(target_workspace uuid)
returns boolean language sql stable security definer set search_path = public as $$
  select exists (select 1 from public.workspace_members where workspace_id = target_workspace and user_id = (select auth.uid()));
$$;

alter table public.profiles enable row level security;
alter table public.workspaces enable row level security;
alter table public.workspace_members enable row level security;
alter table public.channels enable row level security;
alter table public.productions enable row level security;
alter table public.dna_records enable row level security;

create policy "users read own profile" on public.profiles for select to authenticated using (id = (select auth.uid()));
create policy "users update own profile" on public.profiles for update to authenticated using (id = (select auth.uid())) with check (id = (select auth.uid()));
create policy "members read workspaces" on public.workspaces for select to authenticated using (public.is_workspace_member(id));
create policy "members read membership" on public.workspace_members for select to authenticated using (user_id = (select auth.uid()));
create policy "members read channels" on public.channels for select to authenticated using (public.is_workspace_member(workspace_id));
create policy "members create channels" on public.channels for insert to authenticated with check (public.is_workspace_member(workspace_id));
create policy "members update channels" on public.channels for update to authenticated using (public.is_workspace_member(workspace_id)) with check (public.is_workspace_member(workspace_id));
create policy "members delete channels" on public.channels for delete to authenticated using (public.is_workspace_member(workspace_id));
create policy "members read productions" on public.productions for select to authenticated using (public.is_workspace_member(workspace_id));
create policy "members read dna" on public.dna_records for select to authenticated using (public.is_workspace_member(workspace_id));

create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = public as $$
declare new_workspace uuid;
begin
  insert into public.profiles (id, display_name) values (new.id, nullif(new.raw_user_meta_data ->> 'display_name', ''));
  insert into public.workspaces (owner_id, name, slug) values (new.id, 'My Studio', 'ws-' || replace(new.id::text, '-', '')) returning id into new_workspace;
  insert into public.workspace_members (workspace_id, user_id, role) values (new_workspace, new.id, 'owner');
  return new;
end;
$$;

create trigger on_auth_user_created after insert on auth.users for each row execute procedure public.handle_new_user();
