export type DocArticle = {
  slug: string;
  title: string;
  description: string;
  category: string;
  markdown: string;
};

export const docArticles: DocArticle[] = [
  {
    slug: "studio-pipeline",
    title: "Studio Pipeline",
    description: "Run a production through deliberate departmental handoffs.",
    category: "Build",
    markdown: `## One moving picture

Gem Studio turns a creative brief into a structured sequence of deliberate handoffs. Work moves through 4 core operational departments—Marketing, Socials, Development, and Production—organized into customizable lanes.

### Departmental structure

1. **Marketing:** Strategy, Brand Direction, Campaign Briefs, Audience Discovery.
2. **Socials:** Short-form adaptations, Community Management, Channel Broadcasts, Audience Feedback.
3. **Development:** Screenplays, Storyboards, DNA Character Continuity, Worldbuilding.
4. **Production:** GenPlay shot generation, Scene Assembly, Sound/Color Master, Rendering.

### Choose your run mode

- **Manual:** Pauses at every gate for explicit human review and approval.
- **Semi-Automatic:** Pauses where policy requires critical human sign-off (e.g. brand locks, budget caps).
- **Automatic:** Continues through approved lanes while preserving an immutable audit trail.

> Human creators maintain full creative authority at every stage. Agent outputs remain drafts until an owner approves them.`,
  },
  {
    slug: "dna-continuity",
    title: "DNA Continuity",
    description: "Keep characters, worlds, and visual rules consistent across episodes.",
    category: "Build",
    markdown: `## A continuity record for every story

DNA records capture the immutable facts a production must keep stable: character traits, wardrobe, locations, props, palette, camera language, and negative constraints.

### Version, then pin

Create a new version when canon changes. Pin the exact version used by a production so future shot generations cannot silently drift. Compare revisions before promoting a record to shared studio canon.

### Privacy by workspace

DNA belongs strictly to its workspace. Reads and writes are scoped to the active workspace and protected by PostgreSQL row-level security (RLS). Records are never pooled or shared across tenants.`,
  },
  {
    slug: "genplay-contracts",
    title: "GenPlay Contracts",
    description: "Describe shots precisely before generation starts.",
    category: "Build",
    markdown: `## A contract between intent and generation

A GenPlay shot contract makes a single shot reproducible. It names the subject, action, framing, lens, movement, lighting, environment, duration, and continuity references.

### Lock the important fields

Keep prompts focused on observable visual direction. Attach the DNA version and source assets. Define acceptance criteria before sending a job to a provider.

### Review generated media

Every attempt keeps its input contract, provider metadata, and output reference. Approve one result as the shot master; rejected attempts remain available for audit and credit reconciliation.`,
  },
  {
    slug: "agent-system",
    title: "Agent System & 6-File Contract",
    description: "Understand the 6-file agent architecture and protected IP boundaries.",
    category: "Operate",
    markdown: `## Agents work inside bounded lanes

An agent is hired for a specific department and lane, not given unbounded workspace access. Its configuration declares capabilities, provider access, model limits, and approval requirements.

### The 6-File Agent Contract

Both Pro and BYOK users can create and customize studio agents using the standard **6-File Contract**:

1. \`role.md\` — Core identity, operational scope, and departmental authority level.
2. \`soul.md\` — Voice, tone, personality, and aesthetic principles.
3. \`jobdescription.md\` — Specific task boundaries, input schemas, and expected deliverables.
4. \`skills.md\` — Technical proficiencies, domain capabilities, and specialized tools.
5. \`memory.md\` — Context retention rules, reference material, and canon guidelines.
6. \`user_content.md\` — Studio-specific creator notes, custom directives, and guidelines.

### Protected IP Boundary

> **AT NO POINT DO WE TIP THE IP AGENT DETAILS.**

Official protected catalog agents encapsulate proprietary prompt engineering, specialized system architectures, and internal fine-tuning contracts.
- **Client Shielding:** The browser and client APIs never receive the raw file contents or system prompts of protected agents.
- **Server Execution:** Protected agents execute exclusively through operator-controlled server infrastructure (\`PROTECTED_INFERENCE_BASE_URL\`).
- **Inspection Integrity:** Protected agents render with a secure badge in the builder and cannot have their proprietary files inspected or exfiltrated.
- **Custom Freedom:** Custom agents created by studio creators remain 100% visible and editable across all 6 files.`,
  },
  {
    slug: "byok-security",
    title: "BYOK Security & Payroll Budget",
    description: "Connect providers securely with zero markup and plan payroll budgets.",
    category: "Operate",
    markdown: `## Your keys, encrypted server-side

Bring Your Own Key (BYOK) connections allow you to connect direct OpenAI and Anthropic provider accounts with zero platform credit markup.

### Cryptographic security

- **AES-256-GCM:** All API keys are encrypted server-side with AES-256-GCM before storage.
- **Masked in UI:** The client UI displays only safe masked identifiers (e.g. \`sk-proj...1a2b\`). Plaintext keys are never sent to the browser.
- **Scoped Decryption:** Secrets are decrypted in memory only at the moment of execution inside worker jobs, subject to strict spending caps.

### Payroll Budget Integration

BYOK subscriptions include the **Payroll Budget** feature, enabling studios to plan financial allocations across:
- **Creative:** Writers, directors, and concept artists.
- **Production:** Editors, animators, and shot supervisors.
- **Operations:** Channel managers, community leads, and release coordinators.
- **Agents:** Estimated API execution costs per department.`,
  },
  {
    slug: "self-host-community",
    title: "Self Host Creator Community",
    description: "Deploy Gem Studio on your own hardware or private VPS.",
    category: "Operate",
    markdown: `## Prefer to run it yourself?

Gem Studio offers the **Self Host Creator Community** edition for developers, studios, and creators who want complete control over their physical infrastructure.

### Deployment model

- **100% BYOK:** Connect your direct OpenAI, Anthropic, or local model endpoints.
- **Hardware / VPS:** Run on local workstations, private servers, or cloud VPS instances.
- **Channels:** Configure custom channel counts tailored to your hardware capacity.
- **Resource Limits:** System enforces hard resource limits based on host CPU, RAM, and GPU availability.
- **Agent Ecosystem:** Includes core open-source agents, with the ability to author custom agents using the standard 6-file specification.

### Getting started

1. Clone the repository from GitHub or GitLab.
2. Configure your local PostgreSQL/Supabase database and environment variables.
3. Run \`npm run build\` and start the web server.
4. Access the setup wizard to create your first studio essentials and department lanes.`,
  },
  {
    slug: "deployment",
    title: "Deployment & Maintenance",
    description: "Move from local setup to a production-ready studio.",
    category: "Operate",
    markdown: `## Deploy the smallest safe surface

Configure Supabase, encryption material, provider credentials, and the worker secret in your deployment environment. Keep production keys out of Git and browser configuration.

### Before launch

Run typecheck, lint, unit tests, migration checks, and the security gate. Verify row-level policies against a second workspace.

### Observe and recover

Monitor job execution and credit reservations. Failed work remains inspectable and retryable; release promotion follows staging approval and the project's branch policy.`,
  },
];

export const docsBySlug = Object.fromEntries(docArticles.map((article) => [article.slug, article]));
