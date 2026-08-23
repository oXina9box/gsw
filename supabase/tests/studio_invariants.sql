do $$
declare
  v_owner_id uuid := gen_random_uuid();
  v_workspace_id uuid;
  v_channel_id uuid;
  v_production_id uuid;
  v_research_id uuid;
  v_marketing_id uuid;
  v_research_lane uuid;
  v_marketing_lane uuid;
  v_research_agent uuid;
  v_marketing_agent uuid;
  v_connection uuid;
  v_queued_id uuid;
  v_semi_production uuid;
  v_semi_job uuid;
  v_semi_approval uuid;
  v_stage_production uuid;
  v_purge_production uuid;
  v_purge_running uuid;
  v_purge_pending uuid;
  claimed public.job_queue;
  settled public.job_queue;
  v_premium_agent uuid;
  v_protected_agent uuid;
  v_protected_production uuid;
  v_protected_job uuid;
begin
  insert into public.beta_invites(email) values ('owner@example.test');
  insert into auth.users(id, email) values (v_owner_id, 'owner@example.test');
  select workspaces.id into v_workspace_id from public.workspaces where workspaces.owner_id = v_owner_id;
  if v_workspace_id is null then raise exception 'invite onboarding failed'; end if;
  perform set_config('request.jwt.claim.sub', v_owner_id::text, true);
  perform set_config('request.jwt.claims', jsonb_build_object('sub', v_owner_id, 'aal', 'aal1', 'iat', extract(epoch from now())::bigint)::text, true);

  select departments.id into v_research_id from public.departments where departments.workspace_id = v_workspace_id and display_order = 0;
  select departments.id into v_marketing_id from public.departments where departments.workspace_id = v_workspace_id and display_order = 1;
  insert into public.lanes(workspace_id, department_id, name) values (v_workspace_id, v_research_id, 'Research lane') returning id into v_research_lane;
  insert into public.lanes(workspace_id, department_id, name) values (v_workspace_id, v_marketing_id, 'Marketing lane') returning id into v_marketing_lane;
  v_research_agent := public.create_custom_agent(v_workspace_id, v_research_lane, 'Research worker', 'worker');
  v_marketing_agent := public.create_custom_agent(v_workspace_id, v_marketing_lane, 'Marketing worker', 'worker');
  insert into public.provider_connections(workspace_id, provider, label, base_url, default_model, capabilities, masked_secret, key_version)
  values (v_workspace_id, 'test', 'Test text provider', 'https://provider.example.test', 'test-model', array['text'], '****test', 'v1') returning id into v_connection;

  insert into public.channels(workspace_id, name) values (v_workspace_id, 'Main') returning id into v_channel_id;
  insert into public.productions(workspace_id, channel_id, title, status, run_mode, rights_attested_at, credit_limit)
  values (v_workspace_id, v_channel_id, 'Invariant film', 'active', 'manual', now(), 100) returning id into v_production_id;

  v_queued_id := public.enqueue_studio_job(v_workspace_id, v_production_id, 'generate_text', jsonb_build_object('agent_id', v_research_agent, 'connection_id', v_connection), 'pause-test');
  if (select available <> 98 or reserved <> 2 from public.credit_accounts where credit_accounts.workspace_id = v_workspace_id) then raise exception 'credit reservation failed'; end if;
  update public.productions set status = 'paused' where id = v_production_id;
  if (select status <> 'cancelled' from public.job_queue where id = v_queued_id) then raise exception 'pause did not cancel pending job'; end if;
  if (select available <> 100 or reserved <> 0 from public.credit_accounts where credit_accounts.workspace_id = v_workspace_id) then raise exception 'pause did not release credits'; end if;

  update public.productions set status = 'active' where id = v_production_id;
  v_queued_id := public.enqueue_studio_job(v_workspace_id, v_production_id, 'generate_text', jsonb_build_object('agent_id', v_research_agent, 'connection_id', v_connection), 'running-pause-test');
  select * into claimed from public.claim_studio_job('pause-worker');
  update public.productions set status = 'paused' where id = v_production_id;
  select * into settled from public.finish_studio_job(v_queued_id, 'pause-worker', false, '{}'::jsonb, 'Production was paused', 0);
  if settled.status <> 'cancelled' then raise exception 'paused running job was retried'; end if;
  if (select available <> 100 or reserved <> 0 from public.credit_accounts where credit_accounts.workspace_id = v_workspace_id) then raise exception 'running cancellation did not release credits'; end if;

  update public.productions set status = 'active' where id = v_production_id;
  v_queued_id := public.enqueue_studio_job(v_workspace_id, v_production_id, 'generate_text', jsonb_build_object('agent_id', v_research_agent, 'connection_id', v_connection), 'output-race-test');
  select * into claimed from public.claim_studio_job('output-race-worker');
  insert into public.production_artifacts(workspace_id, production_id, department_step, kind, version, status, content, job_id)
  values (v_workspace_id, v_production_id, 0, 'output-race', 1, 'draft', '{}'::jsonb, v_queued_id);
  update public.productions set status = 'paused' where id = v_production_id;
  select * into settled from public.finish_studio_job(v_queued_id, 'output-race-worker', false, '{}'::jsonb, 'Production was paused after output', 0);
  if settled.status <> 'completed' then raise exception 'persisted output was refunded'; end if;

  update public.productions set status = 'active', run_mode = 'auto' where id = v_production_id;
  v_queued_id := public.enqueue_studio_job(v_workspace_id, v_production_id, 'generate_text', jsonb_build_object('agent_id', v_research_agent, 'connection_id', v_connection), 'auto-test');
  select * into claimed from public.claim_studio_job('test-worker');
  if claimed.id <> v_queued_id then raise exception 'worker claim failed'; end if;
  insert into public.production_artifacts(workspace_id, production_id, department_step, kind, version, status, content, job_id)
  values (v_workspace_id, v_production_id, 0, 'auto-test', 1, 'draft', '{}'::jsonb, v_queued_id);
  select * into settled from public.finish_studio_job(v_queued_id, 'test-worker', true, '{}'::jsonb, '', 2);
  if settled.status <> 'completed' then raise exception 'job settlement failed'; end if;
  if (select current_step <> 1 from public.productions where id = v_production_id) then raise exception 'auto advance failed'; end if;
  if not exists (select 1 from public.job_queue where job_queue.production_id = v_production_id and status = 'pending' and payload->>'department_step' = '1') then raise exception 'auto next-stage queue failed'; end if;
  if not exists (select 1 from public.job_queue where job_queue.production_id = v_production_id and status = 'pending' and payload->>'agent_id' = v_marketing_agent::text and payload->>'connection_id' = v_connection::text) then raise exception 'auto next-stage routing failed'; end if;
  if (select status <> 'locked' from public.production_artifacts where job_id = v_queued_id) then raise exception 'auto handoff was not locked'; end if;
  select * into claimed from public.claim_studio_job('lease-worker');
  update public.job_queue set locked_at = now() - interval '16 minutes' where id = claimed.id;
  update public.productions set status = 'shipped' where id = v_production_id;
  perform * from public.claim_studio_job('cleanup-worker');
  if (select status <> 'cancelled' from public.job_queue where id = claimed.id) then raise exception 'inactive expired lease was stranded'; end if;

  insert into public.productions(workspace_id, channel_id, title, status, run_mode, rights_attested_at, credit_limit)
  values (v_workspace_id, v_channel_id, 'Semi-auto film', 'active', 'semi_auto', now(), 100) returning id into v_semi_production;
  v_semi_job := public.enqueue_studio_job(v_workspace_id, v_semi_production, 'generate_text', jsonb_build_object('agent_id', v_research_agent, 'connection_id', v_connection), 'semi-test');
  begin
    perform public.enqueue_studio_job(v_workspace_id, v_semi_production, 'generate_text', jsonb_build_object('agent_id', v_research_agent, 'connection_id', v_connection), 'semi-concurrent-test');
    raise exception 'semi-auto accepted concurrent stage work';
  exception when others then
    if sqlerrm = 'semi-auto accepted concurrent stage work' or sqlerrm <> 'stage_job_in_flight' then raise; end if;
  end;
  select * into claimed from public.claim_studio_job('semi-worker');
  insert into public.production_artifacts(workspace_id, production_id, department_step, kind, version, status, content, job_id)
  values (v_workspace_id, v_semi_production, 0, 'semi-test', 1, 'draft', '{}'::jsonb, v_semi_job);
  perform public.finish_studio_job(v_semi_job, 'semi-worker', true, '{}'::jsonb, '', 2);
  select id into v_semi_approval from public.production_approvals where production_id = v_semi_production and status = 'pending';
  begin
    perform public.enqueue_studio_job(v_workspace_id, v_semi_production, 'generate_text', jsonb_build_object('agent_id', v_research_agent, 'connection_id', v_connection), 'semi-before-approval-test');
    raise exception 'semi-auto bypassed pending approval';
  exception when others then
    if sqlerrm = 'semi-auto bypassed pending approval' or sqlerrm <> 'approval_required' then raise; end if;
  end;
  update public.productions set run_mode = 'manual' where id = v_semi_production;
  perform public.decide_production_approval(v_workspace_id, v_semi_approval, 'approved', 'approved after mode change');
  perform public.advance_production(v_semi_production, (select artifact_id from public.production_approvals where id = v_semi_approval));
  if (select current_step <> 1 from public.productions where id = v_semi_production) then raise exception 'approved handoff blocked manual advancement'; end if;
  update public.productions set status = 'archived' where id = v_semi_production;

  insert into public.productions(workspace_id, channel_id, title, status, run_mode, current_step, rights_attested_at, credit_limit)
  values (v_workspace_id, v_channel_id, 'Stage gate film', 'active', 'manual', 7, now(), 100) returning id into v_stage_production;
  begin
    perform public.enqueue_studio_job(v_workspace_id, v_stage_production, 'generate_image', '{}'::jsonb, 'invalid-stage-test');
    raise exception 'stage gate accepted invalid work';
  exception when others then
    if sqlerrm = 'stage gate accepted invalid work' or sqlerrm <> 'invalid_job_stage' then raise; end if;
  end;
  update public.productions set status = 'archived' where id = v_stage_production;

  insert into public.commerce_products(key, name, kind, stripe_price_id, credit_amount, unit_amount, currency)
  values ('credits-test', 'Credits', 'credits', 'price_credits_test', 100, 1000, 'usd');
  insert into public.purchases(workspace_id, product_key, stripe_checkout_session_id, unit_amount, currency, credit_amount)
  values (v_workspace_id, 'credits-test', 'cs_test_credits', 1000, 'usd', 100);
  perform public.fulfill_checkout_verified('evt_paid', 'checkout.session.completed', 'cs_test_credits', 'pi_test_credits', v_workspace_id, 'credits-test', 1000, 'usd');
  perform public.reverse_checkout('evt_half', 'charge.refunded', 'pi_test_credits', 500);
  if (select status <> 'partially_refunded' or refunded_amount <> 500 or reversed_credits <> 50 from public.purchases where stripe_checkout_session_id = 'cs_test_credits') then raise exception 'partial refund failed'; end if;
  perform public.reverse_checkout('evt_full', 'charge.refunded', 'pi_test_credits', 1000);
  if (select status <> 'refunded' or reversed_credits <> 100 from public.purchases where stripe_checkout_session_id = 'cs_test_credits') then raise exception 'full refund failed'; end if;
  update public.credit_accounts set available = 0, debt = 20 where workspace_id = v_workspace_id;
  insert into public.purchases(workspace_id, product_key, stripe_checkout_session_id, unit_amount, currency, credit_amount)
  values (v_workspace_id, 'credits-test', 'cs_test_debt', 1000, 'usd', 100);
  perform public.fulfill_checkout_verified('evt_debt_paid', 'checkout.session.completed', 'cs_test_debt', 'pi_test_debt', v_workspace_id, 'credits-test', 1000, 'usd');
  if (select available <> 80 or debt <> 0 from public.credit_accounts where workspace_id = v_workspace_id) then raise exception 'credit purchase did not repay debt'; end if;

  insert into public.purchases(workspace_id, product_key, stripe_checkout_session_id, unit_amount, currency, credit_amount)
  values (v_workspace_id, 'credits-test', 'cs_test_expired', 1000, 'usd', 100);
  perform public.fail_checkout('evt_expired', 'checkout.session.expired', 'cs_test_expired');
  if (select status <> 'failed' from public.purchases where stripe_checkout_session_id = 'cs_test_expired') then raise exception 'expired checkout remained pending'; end if;

  insert into public.agent_catalog(slug, name, department_name, version, visibility, price_key, capabilities)
  values ('premium-test', 'Premium Test', 'Research', '1.0.0', 'premium', 'premium-test', '["text"]') returning id into v_premium_agent;
  begin
    perform public.hire_catalog_agent(v_workspace_id, v_premium_agent, v_marketing_lane);
    raise exception 'catalog agent crossed departments';
  exception when others then
    if sqlerrm = 'catalog agent crossed departments' or sqlerrm <> 'department_mismatch' then raise; end if;
  end;
  insert into public.commerce_products(key, name, kind, stripe_price_id, catalog_agent_id, unit_amount, currency)
  values ('agent-test', 'Agent', 'agent_pack', 'price_agent_test', v_premium_agent, 1000, 'usd');
  insert into public.purchases(workspace_id, product_key, stripe_checkout_session_id, unit_amount, currency, catalog_agent_id)
  values (v_workspace_id, 'agent-test', 'cs_test_agent', 1000, 'usd', v_premium_agent);
  perform public.fulfill_checkout_verified('evt_agent_paid', 'checkout.session.completed', 'cs_test_agent', 'pi_test_agent', v_workspace_id, 'agent-test', 1000, 'usd');
  if not exists (select 1 from public.agent_entitlements where agent_entitlements.workspace_id = v_workspace_id and catalog_agent_id = v_premium_agent) then raise exception 'agent entitlement failed'; end if;
  v_protected_agent := public.hire_catalog_agent(v_workspace_id, v_premium_agent, v_research_lane);
  insert into public.productions(workspace_id, channel_id, title, status, run_mode, rights_attested_at, credit_limit)
  values (v_workspace_id, v_channel_id, 'Protected role film', 'active', 'manual', now(), 100) returning id into v_protected_production;
  v_protected_job := public.enqueue_studio_job(v_workspace_id, v_protected_production, 'generate_text', jsonb_build_object('agent_id', v_protected_agent), 'protected-test');
  if (select payload ? 'connection_id' from public.job_queue where id = v_protected_job) then raise exception 'protected job retained customer provider routing'; end if;
  update public.productions set status = 'archived' where id = v_protected_production;
  perform public.reverse_checkout('evt_agent_refund', 'charge.refunded', 'pi_test_agent', 500);
  if exists (select 1 from public.agent_entitlements where agent_entitlements.workspace_id = v_workspace_id and catalog_agent_id = v_premium_agent) then raise exception 'agent refund revocation failed'; end if;
  if (select status <> 'partially_refunded' from public.purchases where stripe_checkout_session_id = 'cs_test_agent') then raise exception 'agent partial refund state failed'; end if;

  insert into public.productions(workspace_id, channel_id, title, status, run_mode, rights_attested_at, credit_limit)
  values (v_workspace_id, v_channel_id, 'Purge film', 'active', 'manual', now(), 100) returning id into v_purge_production;
  v_purge_running := public.enqueue_studio_job(v_workspace_id, v_purge_production, 'generate_text', jsonb_build_object('agent_id', v_research_agent, 'connection_id', v_connection), 'purge-running');
  select * into claimed from public.claim_studio_job('purge-worker');
  if claimed.id <> v_purge_running then raise exception 'purge running fixture failed'; end if;
  v_purge_pending := public.enqueue_studio_job(v_workspace_id, v_purge_production, 'generate_text', jsonb_build_object('agent_id', v_research_agent, 'connection_id', v_connection), 'purge-pending');
  perform public.request_account_deletion();
  update public.account_deletion_requests set purge_after = now() - interval '1 minute', processing_at = now() where user_id = v_owner_id;
  if public.cancel_account_deletion() then raise exception 'processing deletion was falsely cancelled'; end if;
  if public.prepare_account_purge(v_owner_id) then raise exception 'destructive purge skipped quiescence'; end if;
  if exists (select 1 from public.job_queue where id in (v_purge_running, v_purge_pending) and status <> 'cancelled') then raise exception 'purge preparation left active jobs'; end if;
  if (select status <> 'archived' from public.productions where id = v_purge_production) then raise exception 'purge preparation left production active'; end if;
  if (select reserved <> 0 from public.credit_accounts where workspace_id = v_workspace_id) then raise exception 'purge preparation left reserved credits'; end if;
  update public.account_deletion_requests set purge_prepared_at = now() - interval '16 minutes', processing_at = now() where user_id = v_owner_id;
  if not public.prepare_account_purge(v_owner_id) then raise exception 'quiescent account purge did not become ready'; end if;
  if not exists (select 1 from public.storage_purge_queue where workspace_id = v_workspace_id and user_id = v_owner_id) then raise exception 'storage purge was not durably queued'; end if;
end;
$$;
