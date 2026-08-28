-- Onboarding completion migration: additive profile fields and marketing agent catalog seeding.

alter table public.onboarding_profiles
  add column if not exists commercial_choice jsonb not null default '{}'::jsonb,
  add column if not exists provider_status jsonb not null default '{}'::jsonb,
  add column if not exists missing_data_notes jsonb not null default '[]'::jsonb,
  add column if not exists lane_handoffs jsonb not null default '{}'::jsonb,
  drop constraint if exists onboarding_profiles_step_check,
  add constraint onboarding_profiles_step_check check (step in ('identity', 'commercial', 'providers', 'channel', 'hiring', 'lane', 'complete'));

-- Seed first marketing lane agent catalog entries
insert into public.agent_catalog (slug, name, department_name, summary, version, visibility, capabilities)
values
  ('marketing-director', 'Marketing Director', 'Marketing', 'Oversee studio brand strategy, channel portfolio, and campaign orchestration.', '1.0.0', 'free', '["text"]'),
  ('studio-brand-designer', 'Studio Brand Designer', 'Marketing', 'Define and maintain studio identity, visual guidelines, and brand marks.', '1.0.0', 'free', '["text","image"]'),
  ('channel-discovery', 'Channel Discovery', 'Marketing', 'Analyze audience signals and define channel thesis and market opportunities.', '1.0.0', 'free', '["text"]'),
  ('channel-branding', 'Channel Branding', 'Marketing', 'Design visual theming, typography, color palettes, and channel assets.', '1.0.0', 'free', '["text","image"]'),
  ('channel-content-designer', 'Channel Content Designer', 'Marketing', 'Structure content taxonomy, episode frameworks, and format specifications.', '1.0.0', 'free', '["text"]'),
  ('media-agent', 'Media Planner', 'Marketing', 'Plan distribution cadence, platform positioning, and cross-channel release schedule.', '1.0.0', 'free', '["text"]')
on conflict (slug) do update set
  name = excluded.name,
  department_name = excluded.department_name,
  summary = excluded.summary;

-- Seed agent catalog files for marketing agents (six-file shape)
insert into public.agent_catalog_files (catalog_agent_id, role, soul, jobdescription, skills, memory, user_content, checksum)
select
  id,
  'You are the ' || name || ' in Gem Studio''s ' || department_name || ' department.',
  'Protect the brief, studio brand continuity, rights, and creative integrity.',
  '## Deliverable\n' || summary || '\n\n## Constraints\nUse only supplied studio/channel context.\n\n## Handoff\nReturn structured output for the marketing lane workbench.',
  'Validate inputs. Preserve brand alignment. State missing requirements clearly. Produce structured JSON/Markdown handoffs.',
  '## Session Log\n(empty)',
  '',
  md5(slug || version)
from public.agent_catalog
where slug in ('marketing-director', 'studio-brand-designer', 'channel-discovery', 'channel-branding', 'channel-content-designer', 'media-agent')
on conflict (catalog_agent_id) do update set
  role = excluded.role,
  soul = excluded.soul,
  jobdescription = excluded.jobdescription,
  skills = excluded.skills,
  checksum = excluded.checksum;
