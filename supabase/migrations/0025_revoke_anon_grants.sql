-- Revoke overly broad grants from 0010
revoke insert, update, delete, truncate on all tables in schema public from anon;

-- Grant SELECT only on public catalogs
grant select on public.agent_catalog to anon;
grant select on public.model_catalog to anon;
grant select on public.commerce_products to anon;

-- Fix default privileges
alter default privileges in schema public
  revoke insert, update, delete, truncate on tables from anon;
alter default privileges in schema public
  grant select on tables to authenticated;

comment on schema public is 'Anon role restricted to SELECT on public catalogs only';
