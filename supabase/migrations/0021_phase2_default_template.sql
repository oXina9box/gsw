alter table public.workflows add column if not exists definition jsonb not null default '{}'::jsonb;
create table if not exists public.workflow_templates (
  key text primary key, version text not null, name text not null, definition jsonb not null, created_at timestamptz not null default now()
);
insert into public.workflow_templates (key, version, name, definition) values
('gem-studio-default', '1.0.0', 'Gem Studio default', '{"stages":["Research","Marketing","Creative","Story","Storyboard","Script","Screenplay","AI Conversion","Video Production","Launch","Social Posting","Social Management","Reporting"],"mode":"forward"}'::jsonb)
on conflict (key) do update set version = excluded.version, name = excluded.name, definition = excluded.definition;
alter table public.workflow_templates enable row level security;
create policy "authenticated read workflow templates" on public.workflow_templates for select to authenticated using (true);
