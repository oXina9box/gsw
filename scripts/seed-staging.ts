import { existsSync, readFileSync } from "node:fs";
import path from "node:path";
import { createRequire } from "node:module";

// Load environment variables from web/.env.local or .env if present
function loadLocalEnv() {
  const envCandidates = [
    path.resolve(process.cwd(), "web", ".env.local"),
    path.resolve(process.cwd(), ".env.local"),
    path.resolve(process.cwd(), "web", ".env"),
    path.resolve(process.cwd(), ".env"),
  ];

  for (const envPath of envCandidates) {
    if (!existsSync(envPath)) continue;
    const content = readFileSync(envPath, "utf-8");
    for (const line of content.split("\n")) {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith("#")) continue;
      const eqIdx = trimmed.indexOf("=");
      if (eqIdx > 0) {
        const key = trimmed.slice(0, eqIdx).trim();
        const val = trimmed.slice(eqIdx + 1).trim();
        if (!process.env[key]) {
          process.env[key] = val;
        }
      }
    }
  }
}

loadLocalEnv();

// Resolve Supabase client dynamically to support both root and web/ execution
function getSupabaseClientClass() {
  const require = createRequire(import.meta.url);
  try {
    return require("@supabase/supabase-js").createClient;
  } catch {
    try {
      const webPath = path.resolve(process.cwd(), "web", "node_modules", "@supabase", "supabase-js");
      return require(webPath).createClient;
    } catch {
      const altPath = path.resolve(import.meta.dirname ?? ".", "..", "web", "node_modules", "@supabase", "supabase-js");
      return require(altPath).createClient;
    }
  }
}

export type SeedResult = {
  ok: boolean;
  user: { id: string; email: string };
  workspace: { id: string; name: string; slug: string };
  channel: { id: string; name: string };
  departments: Array<{ id: string; name: string }>;
  lanes: Array<{ id: string; name: string }>;
  agents: Array<{ id: string; name: string; lane_id: string }>;
  dnaRecord: { id: string; dna_id: string; dna_type: string };
  production: { id: string; title: string; status: string; current_step: number };
};

export async function seedStaging(customOptions?: {
  supabaseUrl?: string;
  serviceRoleKey?: string;
  testEmail?: string;
  testPassword?: string;
}): Promise<SeedResult> {
  const supabaseUrl =
    customOptions?.supabaseUrl ??
    process.env.STAGING_SUPABASE_URL ??
    process.env.NEXT_PUBLIC_SUPABASE_URL;

  const serviceRoleKey =
    customOptions?.serviceRoleKey ??
    process.env.STAGING_SUPABASE_SERVICE_ROLE_KEY ??
    process.env.SUPABASE_SERVICE_ROLE_KEY ??
    process.env.SUPABASE_SECRET_KEY ??
    process.env.STAGING_SUPABASE_ANON_KEY ??
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;

  if (!supabaseUrl || !serviceRoleKey) {
    throw new Error(
      "Missing Supabase configuration. Provide STAGING_SUPABASE_URL and STAGING_SUPABASE_SERVICE_ROLE_KEY.",
    );
  }

  const testEmail =
    customOptions?.testEmail ??
    process.env.STAGING_TEST_EMAIL ??
    "e2e-staging-user@gemstudio.test";

  const testPassword =
    customOptions?.testPassword ??
    process.env.STAGING_TEST_PASSWORD ??
    "StagingPassword123!_e2e";

  const createClient = getSupabaseClientClass();
  const supabase = createClient(supabaseUrl, serviceRoleKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });

  // 1. Ensure test user exists
  let userId: string;
  const { data: usersList, error: listError } = await supabase.auth.admin.listUsers();
  if (listError) {
    // If service role not allowed to list, try signing in or signing up
    const { data: signInData, error: signInErr } = await supabase.auth.signInWithPassword({
      email: testEmail,
      password: testPassword,
    });
    if (signInData?.user) {
      userId = signInData.user.id;
    } else {
      const { data: signUpData, error: signUpErr } = await supabase.auth.signUp({
        email: testEmail,
        password: testPassword,
        options: { data: { display_name: "Staging E2E User" } },
      });
      if (signUpErr || !signUpData.user) {
        throw new Error(`Failed to ensure test user: ${signUpErr?.message ?? signInErr?.message}`);
      }
      userId = signUpData.user.id;
    }
  } else {
    const existing = usersList.users.find((u: { email?: string }) => u.email?.toLowerCase() === testEmail.toLowerCase());
    if (existing) {
      userId = existing.id;
    } else {
      const { data: created, error: createErr } = await supabase.auth.admin.createUser({
        email: testEmail,
        password: testPassword,
        email_confirm: true,
        user_metadata: { display_name: "Staging E2E User" },
      });
      if (createErr || !created.user) {
        throw new Error(`Failed to create test user: ${createErr?.message}`);
      }
      userId = created.user.id;
    }
  }

  // Ensure profile exists
  await supabase
    .from("profiles")
    .upsert({ id: userId, display_name: "Staging E2E User" }, { onConflict: "id" });

  // 2. Ensure test workspace exists and membership is owner
  let workspace: { id: string; name: string; slug: string };
  const { data: existingWs } = await supabase
    .from("workspaces")
    .select("id, name, slug")
    .eq("owner_id", userId)
    .eq("slug", "staging-verification-studio")
    .maybeSingle();

  if (existingWs) {
    workspace = existingWs;
  } else {
    const { data: anyMemberWs } = await supabase
      .from("workspace_members")
      .select("workspace_id, workspaces(id, name, slug)")
      .eq("user_id", userId)
      .limit(1)
      .maybeSingle();

    const memberWs = anyMemberWs?.workspaces as { id: string; name: string; slug: string } | null;
    if (memberWs?.id) {
      workspace = memberWs;
    } else {
      const { data: newWs, error: wsErr } = await supabase
        .from("workspaces")
        .insert({
          owner_id: userId,
          name: "Staging Verification Studio",
          slug: "staging-verification-studio",
        })
        .select("id, name, slug")
        .single();
      if (wsErr || !newWs) throw new Error(`Failed to create workspace: ${wsErr?.message}`);
      workspace = newWs;
    }
  }

  // Ensure workspace_members
  await supabase
    .from("workspace_members")
    .upsert(
      { workspace_id: workspace.id, user_id: userId, role: "owner" },
      { onConflict: "workspace_id,user_id" },
    );

  // 3. Ensure one test channel exists
  let channel: { id: string; name: string };
  const { data: existingCh } = await supabase
    .from("channels")
    .select("id, name")
    .eq("workspace_id", workspace.id)
    .eq("name", "Staging Main Channel")
    .maybeSingle();

  if (existingCh) {
    channel = existingCh;
  } else {
    const { data: newCh, error: chErr } = await supabase
      .from("channels")
      .insert({
        workspace_id: workspace.id,
        name: "Staging Main Channel",
        status: "active",
        audience: "Staging verification audience",
        voice: "Direct, cinematic, evidence-backed",
        cadence: "Weekly episodic",
        pillars: ["investigative", "narrative", "continuity"],
      })
      .select("id, name")
      .single();
    if (chErr || !newCh) throw new Error(`Failed to create channel: ${chErr?.message}`);
    channel = newCh;
  }

  // 4. Ensure departments and lanes exist
  const { data: researchDept, error: rdErr } = await supabase
    .from("departments")
    .upsert(
      { workspace_id: workspace.id, name: "Research", display_order: 0 },
      { onConflict: "workspace_id,name" },
    )
    .select("id, name")
    .single();
  if (rdErr || !researchDept) throw new Error(`Failed to upsert Research department: ${rdErr?.message}`);

  const { data: marketingDept, error: mdErr } = await supabase
    .from("departments")
    .upsert(
      { workspace_id: workspace.id, name: "Marketing", display_order: 1 },
      { onConflict: "workspace_id,name" },
    )
    .select("id, name")
    .single();
  if (mdErr || !marketingDept) throw new Error(`Failed to upsert Marketing department: ${mdErr?.message}`);

  const { data: researchLane, error: rlErr } = await supabase
    .from("lanes")
    .upsert(
      { workspace_id: workspace.id, department_id: researchDept.id, name: "Brief Research" },
      { onConflict: "department_id,name" },
    )
    .select("id, name")
    .single();
  if (rlErr || !researchLane) throw new Error(`Failed to upsert Research lane: ${rlErr?.message}`);

  const { data: marketingLane, error: mlErr } = await supabase
    .from("lanes")
    .upsert(
      { workspace_id: workspace.id, department_id: marketingDept.id, name: "Strategy" },
      { onConflict: "department_id,name" },
    )
    .select("id, name")
    .single();
  if (mlErr || !marketingLane) throw new Error(`Failed to upsert Marketing lane: ${mlErr?.message}`);

  // 5. Ensure two agents with role-matched configs exist
  // Agent 1: Research Lead
  let agent1: { id: string; name: string; lane_id: string };
  const { data: existingAgent1 } = await supabase
    .from("agents")
    .select("id, name, lane_id")
    .eq("workspace_id", workspace.id)
    .eq("name", "Research Lead")
    .maybeSingle();

  if (existingAgent1) {
    agent1 = existingAgent1;
  } else {
    const { data: newAg1, error: ag1Err } = await supabase
      .from("agents")
      .insert({
        workspace_id: workspace.id,
        lane_id: researchLane.id,
        name: "Research Lead",
        agent_type: "worker",
        capabilities: ["text"],
      })
      .select("id, name, lane_id")
      .single();
    if (ag1Err || !newAg1) throw new Error(`Failed to create Research Lead agent: ${ag1Err?.message}`);
    agent1 = newAg1;
  }

  await supabase.from("agent_files").upsert(
    {
      agent_id: agent1.id,
      workspace_id: workspace.id,
      role: "You are the Research Lead in Gem Studio's Research department.",
      soul: "Ground every creative choice in traceable evidence and constraints.",
      jobdescription:
        "## Deliverable\nGround every creative choice in traceable evidence and constraints.\n\n## Constraints\nUse only supplied or traceable production context.",
      skills: "Validate inputs. Preserve provenance. State uncertainty. Produce concise structured handoffs.",
      memory: "## Session Log\n(empty)",
      user_content: "",
    },
    { onConflict: "agent_id" },
  );

  // Agent 2: Marketing Strategist
  let agent2: { id: string; name: string; lane_id: string };
  const { data: existingAgent2 } = await supabase
    .from("agents")
    .select("id, name, lane_id")
    .eq("workspace_id", workspace.id)
    .eq("name", "Marketing Strategist")
    .maybeSingle();

  if (existingAgent2) {
    agent2 = existingAgent2;
  } else {
    const { data: newAg2, error: ag2Err } = await supabase
      .from("agents")
      .insert({
        workspace_id: workspace.id,
        lane_id: marketingLane.id,
        name: "Marketing Strategist",
        agent_type: "worker",
        capabilities: ["text"],
      })
      .select("id, name, lane_id")
      .single();
    if (ag2Err || !newAg2) throw new Error(`Failed to create Marketing Strategist agent: ${ag2Err?.message}`);
    agent2 = newAg2;
  }

  await supabase.from("agent_files").upsert(
    {
      agent_id: agent2.id,
      workspace_id: workspace.id,
      role: "You are the Marketing Strategist in Gem Studio's Marketing department.",
      soul: "Turn the brief into audience, positioning, and campaign direction.",
      jobdescription:
        "## Deliverable\nTurn the brief into audience, positioning, and campaign direction.\n\n## Constraints\nPreserve tone and positioning integrity.",
      skills: "Analyze audience segments and distribution angles.",
      memory: "## Session Log\n(empty)",
      user_content: "",
    },
    { onConflict: "agent_id" },
  );

  // 6. Ensure one DNA record set exists
  const dnaId = "CHAR-staging-protagonist-01";
  const { data: dnaRecord, error: dnaErr } = await supabase
    .from("dna_records")
    .upsert(
      {
        workspace_id: workspace.id,
        dna_id: dnaId,
        dna_type: "CDNA",
        status: "approved",
        schema_version: "1.0.0",
        tier: "A",
        record: {
          name: "Elena Vance",
          archetype: "Lead Investigator",
          role: "Protagonist",
          description: "Seasoned investigative journalist uncovering urban infrastructure anomalies.",
          traits: ["methodical", "tenacious", "skeptical"],
          visual_anchors: ["navy trench coat", "vintage recorder", "silver pendant"],
        },
        version: 1,
        locked: false,
        channel_ids: [channel.id],
      },
      { onConflict: "workspace_id,dna_id" },
    )
    .select("id, dna_id, dna_type")
    .single();
  if (dnaErr || !dnaRecord) throw new Error(`Failed to upsert DNA record: ${dnaErr?.message}`);

  // 7. Ensure one production in early stage exists
  let production: { id: string; title: string; status: string; current_step: number };
  const { data: existingProd } = await supabase
    .from("productions")
    .select("id, title, status, current_step")
    .eq("workspace_id", workspace.id)
    .eq("channel_id", channel.id)
    .eq("title", "Staging Pilot: The Grid Anomaly")
    .maybeSingle();

  if (existingProd) {
    production = existingProd;
  } else {
    const { data: newProd, error: prodErr } = await supabase
      .from("productions")
      .insert({
        workspace_id: workspace.id,
        channel_id: channel.id,
        title: "Staging Pilot: The Grid Anomaly",
        status: "draft",
        current_step: 0,
        step_count: 13,
        run_mode: "manual",
        brief: "Investigative documentary short examining unexpected energy fluctuations across the metro grid.",
        audience: "Documentary and mystery enthusiasts",
        data: {},
      })
      .select("id, title, status, current_step")
      .single();
    if (prodErr || !newProd) throw new Error(`Failed to create production: ${prodErr?.message}`);
    production = newProd;
  }

  return {
    ok: true,
    user: { id: userId, email: testEmail },
    workspace,
    channel,
    departments: [researchDept, marketingDept],
    lanes: [researchLane, marketingLane],
    agents: [agent1, agent2],
    dnaRecord,
    production,
  };
}

// CLI execution handling
if (process.argv[1] && path.resolve(process.argv[1]) === path.resolve(import.meta.filename ?? "")) {
  seedStaging()
    .then((result) => {
      console.log(JSON.stringify(result, null, 2));
    })
    .catch((err) => {
      console.error("Staging seed error:", err.message);
      process.exit(1);
    });
}
