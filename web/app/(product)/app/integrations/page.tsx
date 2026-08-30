import { saveProviderConnection } from "@/app/(product)/actions";
import { getWorkspaceContext } from "@/lib/studio/workspace";
import { PrelineCard } from "@/components/blocks/preline/preline-card";
import { FlowbiteBadge } from "@/components/blocks/flowbite/flowbite-badge";

export const metadata = { title: "Integrations" };

export default async function IntegrationsPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const { supabase } = await getWorkspaceContext();
  const { data: connections } = await supabase
    .from("provider_connections")
    .select("id, provider, label, base_url, default_model, capabilities, masked_secret, status, last_validated_at")
    .order("created_at");
  const { error } = await searchParams;

  return (
    <section className="product-page shell" data-archetype="B3-B">
      <div className="mb-8 space-y-2">
        <h1 className="font-display text-3xl sm:text-4xl font-bold text-text">
          Models matched to roles.
        </h1>
        <p className="text-base text-text-muted font-body">
          Add a recommended provider or any OpenAI-compatible endpoint. Credentials are encrypted and never shown again.
        </p>
      </div>

      {error ? (
        <p className="form-error mb-6" role="alert">
          {error === "configuration"
            ? "Server encryption is not configured."
            : "Provider connection could not be saved."}
        </p>
      ) : null}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
        <div className="space-y-6">
          <PrelineCard
            kicker="BYOK Vault"
            title="Add Provider Endpoint"
            subtitle="AES-256-GCM encrypted server-side credential storage"
          >
            <form action={saveProviderConnection} className="stack-form">
              <label>
                Provider
                <input name="provider" maxLength={120} required placeholder="OpenAI-compatible / Anthropic" />
              </label>
              <label>
                Connection name
                <input name="label" maxLength={120} required placeholder="Quality text / Fast chat" />
              </label>
              <label>
                Base URL
                <input name="base_url" type="url" required placeholder="https://api.example.com/v1" />
              </label>
              <label>
                Default model
                <input name="model" maxLength={120} required placeholder="gpt-4o / claude-3-5-sonnet" />
              </label>
              <label>
                API key
                <input name="api_key" type="password" minLength={8} required autoComplete="off" />
              </label>
              <fieldset>
                <legend className="font-mono text-xs text-text-muted uppercase">Capabilities</legend>
                <div className="flex gap-4 pt-2">
                  <label className="flex items-center gap-2 text-xs font-mono">
                    <input type="checkbox" name="capabilities" value="text" defaultChecked />
                    Text
                  </label>
                  <label className="flex items-center gap-2 text-xs font-mono">
                    <input type="checkbox" name="capabilities" value="image" />
                    Image
                  </label>
                  <label className="flex items-center gap-2 text-xs font-mono">
                    <input type="checkbox" name="capabilities" value="audio" />
                    Audio
                  </label>
                </div>
              </fieldset>
              <button className="button button-primary mt-4" type="submit">
                Save encrypted connection
              </button>
            </form>
          </PrelineCard>
        </div>

        <div className="space-y-6">
          <PrelineCard
            kicker="Active Vault"
            title="Connected Providers"
            subtitle={`${connections?.length ?? 0} active credentials`}
          >
            {connections?.length ? (
              <div className="space-y-3">
                {connections.map((conn) => (
                  <div key={conn.id} className="p-4 border border-border-2 bg-surface-2 rounded-sm space-y-2">
                    <div className="flex items-center justify-between">
                      <strong className="font-display text-sm font-semibold text-text">
                        {conn.label}
                      </strong>
                      <FlowbiteBadge color={conn.status === "active" ? "lime" : "default"} size="sm">
                        {conn.status}
                      </FlowbiteBadge>
                    </div>
                    <p className="text-xs text-text-muted font-body">
                      {conn.provider} · {conn.default_model || "model chosen per role"}
                    </p>
                    <div className="pt-2 flex items-center justify-between font-mono text-xs text-text-faint border-t border-hairline">
                      <span>{conn.masked_secret}</span>
                      <span className="text-cyan">{Array.isArray(conn.capabilities) ? conn.capabilities.join(", ") : "text"}</span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-xs text-text-muted font-body">No provider credentials saved.</p>
            )}
          </PrelineCard>
        </div>
      </div>
    </section>
  );
}
