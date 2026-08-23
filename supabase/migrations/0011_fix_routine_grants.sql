revoke all on all routines in schema public from anon, authenticated;
alter default privileges in schema public revoke all on routines from anon, authenticated;

grant execute on function public.request_account_deletion() to authenticated;
grant execute on function public.cancel_account_deletion() to authenticated;
grant execute on function public.register_shot_clip(uuid, uuid, uuid, text, text, bigint) to authenticated;
grant execute on function public.select_shot_clip(uuid, uuid, uuid) to authenticated;
grant execute on function public.advance_production(uuid, uuid) to authenticated;
grant execute on function public.decide_production_approval(uuid, uuid, text, text) to authenticated;
grant execute on function public.create_custom_agent(uuid, uuid, text, text) to authenticated;
grant execute on function public.update_custom_agent_files(uuid, uuid, text, text, text, text, text, text) to authenticated;
grant execute on function public.create_dna_record(uuid, public.dna_type, text, text) to authenticated;
grant execute on function public.attach_production_dna(uuid, uuid, uuid) to authenticated;
grant execute on function public.rename_studio(uuid, text) to authenticated;
grant execute on function public.enqueue_studio_job(uuid, uuid, text, jsonb, text) to authenticated;
grant execute on function public.hire_catalog_agent(uuid, uuid, uuid) to authenticated;

grant execute on function public.save_provider_connection_server(uuid, text, text, text, text, text[], text, text, text, text, text) to service_role;
grant execute on function public.claim_studio_job(text) to service_role;
grant execute on function public.finish_studio_job(uuid, text, boolean, jsonb, text, bigint) to service_role;
grant execute on function public.save_genplay_contract(uuid, uuid, uuid, jsonb, text, jsonb) to service_role;
grant execute on function public.claim_due_account_deletions(integer) to service_role;
grant execute on function public.fulfill_checkout_verified(text, text, text, text, uuid, text, bigint, text) to service_role;
grant execute on function public.reverse_checkout(text, text, text, bigint) to service_role;
grant execute on function public.fail_checkout(text, text, text) to service_role;
grant execute on function public.prepare_account_purge(uuid) to service_role;
