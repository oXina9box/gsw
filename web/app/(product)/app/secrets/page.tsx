import Link from "next/link";
import { getWorkspaceContext } from "@/lib/studio/workspace";
import { FlowbiteBadge } from "@/components/blocks/flowbite/flowbite-badge";

export const metadata = { title: "Secrets" };

const STATUS_COLOR = { active: "lime", invalid: "amber", revoked: "red" } as const;

export default async function SecretsPage() {
  const { supabase } = await getWorkspaceContext();
  const { data: connections, error } = await supabase
    .from("provider_connections")
    .select("id, provider, label, base_url, default_model, masked_secret, key_version, status, last_validated_at")
    .order("created_at", { ascending: false });

  return (
    <section className="product-page shell" data-archetype="B1-B">
      <div className="mb-8 space-y-2">
        <h1 className="font-display text-3xl sm:text-4xl font-bold text-text">
          Secrets.
        </h1>
        <p className="text-base text-text-muted font-body">
          Encrypted provider credentials. Keys are stored server-side with AES-256-GCM — only masked values ever render.
        </p>
      </div>

      {error ? (
        <p className="form-error" role="alert">Unable to load secrets.</p>
      ) : connections?.length ? (
        <ul className="catalog-list">
          {connections.map((connection) => (
            <li key={connection.id} className="catalog-row">
              <div>
                <h2 className="flex items-center gap-2">
                  {connection.label}
                  <FlowbiteBadge color={STATUS_COLOR[connection.status as keyof typeof STATUS_COLOR] ?? "amber"} size="sm">
                    {connection.status}
                  </FlowbiteBadge>
                </h2>
                <p className="muted">
                  {connection.provider}{connection.default_model ? ` · ${connection.default_model}` : ""}{connection.base_url ? ` · ${connection.base_url}` : ""}
                </p>
                <p className="muted font-mono text-xs mt-1">
                  key {connection.masked_secret} · version {connection.key_version}
                  {connection.last_validated_at ? ` · validated ${new Date(connection.last_validated_at).toLocaleDateString()}` : ""}
                </p>
              </div>
            </li>
          ))}
        </ul>
      ) : (
        <div className="panel empty-state">
          <h3>No secrets stored.</h3>
          <p>Connect a provider to store its encrypted credentials here.</p>
          <Link className="button button-primary" href="/app/integrations">Open integrations</Link>
        </div>
      )}
    </section>
  );
}
