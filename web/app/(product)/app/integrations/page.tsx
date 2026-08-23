import { saveProviderConnection } from "@/app/(product)/actions";
import { getWorkspaceContext } from "@/lib/studio/workspace";

export const metadata = { title: "Integrations" };

export default async function IntegrationsPage({ searchParams }: { searchParams: Promise<{ error?: string }> }) {
  const { supabase } = await getWorkspaceContext();
  const { data: connections } = await supabase.from("provider_connections").select("id, provider, label, base_url, default_model, capabilities, masked_secret, status, last_validated_at").order("created_at");
  const { error } = await searchParams;
  return <section className="product-page shell">
    <h1>Models matched to roles.</h1>
    <p className="lede">Add a recommended provider or any OpenAI-compatible endpoint. Credentials are encrypted and never shown again.</p>
    {error ? <p className="form-error" role="alert">{error === "configuration" ? "Server encryption is not configured." : "Provider connection could not be saved."}</p> : null}
    <div className="workspace-split">
      <section className="panel"><h2>Add provider</h2><form action={saveProviderConnection} className="stack-form">
        <label>Provider<input name="provider" maxLength={120} required placeholder="OpenAI-compatible" /></label>
        <label>Connection name<input name="label" maxLength={120} required placeholder="Quality text" /></label>
        <label>Base URL<input name="base_url" type="url" required placeholder="https://api.example.com/v1" /></label>
        <label>Default model<input name="model" maxLength={120} required placeholder="model-name" /></label>
        <label>API key<input name="api_key" type="password" minLength={8} required autoComplete="off" /></label>
        <fieldset><legend>Capabilities</legend><label className="check-row"><input type="checkbox" name="capabilities" value="text" defaultChecked />Text</label><label className="check-row"><input type="checkbox" name="capabilities" value="image" />Image</label><label className="check-row"><input type="checkbox" name="capabilities" value="audio" />Audio</label></fieldset>
        <button className="button button-primary" type="submit">Save encrypted connection</button>
      </form></section>
      <section className="panel"><h2>Connected providers</h2>{connections?.length ? <div className="connection-list">{connections.map((connection) => <article key={connection.id}><div><strong>{connection.label}</strong><p className="muted">{connection.provider} · {connection.default_model || "model chosen per role"}</p></div><span>{connection.masked_secret}</span><span className={`status-mark ${connection.status}`}>{connection.status}</span></article>)}</div> : <div className="empty-state"><p>No provider credentials saved.</p></div>}</section>
    </div>
  </section>;
}
