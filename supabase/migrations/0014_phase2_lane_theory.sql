alter table public.workflows
  add column if not exists version integer not null default 1 check (version > 0),
  add column if not exists template_key text,
  add column if not exists template_version text;

alter table public.lanes
  add column if not exists collaboration_mode text not null default 'forward' check (collaboration_mode in ('forward', 'round_table')),
  add column if not exists pass_order integer[] not null default '{}',
  add column if not exists pass_cycles integer not null default 1 check (pass_cycles between 1 and 20);

alter table public.lanes
  add constraint lanes_round_table_order_check check (
    collaboration_mode = 'forward'
    or (cardinality(pass_order) between 1 and 50 and pass_cycles between 1 and 20)
  );
