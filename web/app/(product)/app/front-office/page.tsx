import { createProduction } from "@/app/(product)/actions";
import { getWorkspaceContext } from "@/lib/studio/workspace";
import Link from "next/link";

export const metadata = { title: "Open Production" };

export default async function FrontOfficePage({ searchParams }: { searchParams: Promise<{ error?: string }> }) {
  const { supabase } = await getWorkspaceContext();
  const [{ data: channels, error: channelsError }, { data: workflows }] = await Promise.all([supabase.from("channels").select("id, name").order("created_at"), supabase.from("workflows").select("id, name, template_key").order("name")]);
  const { error } = await searchParams;
  return <section className="product-page shell" data-archetype="B1-A">
    <h1>Open a production.</h1>
    <p className="lede">Set audience, rights, budget, schedule, and operating mode before agents enter the floor.</p>
    {error ? <p className="form-error" role="alert">The brief could not be saved. Check every required field.</p> : null}
    <div className="production-brief">
      <section className="panel">
        <h2>Open a production</h2>
        {channelsError ? <p className="form-error" role="alert">Unable to load channels.</p> : channels?.length ? <form action={createProduction} className="stack-form">
          <label>Channel<select name="channel_id" required defaultValue=""><option value="" disabled>Select channel</option>{channels.map((channel) => <option value={channel.id} key={channel.id}>{channel.name}</option>)}</select></label>
          <label>Workflow template<select name="workflow_id" defaultValue=""><option value="">Use production default</option>{(workflows ?? []).map((workflow) => <option value={workflow.id} key={workflow.id}>{workflow.name}{workflow.template_key ? " · template" : ""}</option>)}</select></label>
          <label>Working title<input name="title" maxLength={120} required placeholder="Episode 01 — The Signal" /></label>
          <label>Brief<textarea name="brief" maxLength={10000} rows={7} required placeholder="What must this film make the audience feel, understand, or do?" /></label>
          <label>Audience<textarea name="audience" maxLength={500} rows={3} /></label>
          <div className="form-grid">
            <label>Run mode<select name="run_mode" defaultValue="manual"><option value="manual">Manual</option><option value="semi_auto">Semi-auto</option><option value="auto">Auto</option></select></label>
            <label>Credit cap<input type="number" name="credit_limit" min="0" step="1" placeholder="100" /></label>
            <label>Target start<input type="datetime-local" name="scheduled_at" /></label>
          </div>
          <label className="check-row"><input type="checkbox" name="rights_attested" required />I have rights to the supplied inputs and authorize processing under Studio policy.</label>
          <button className="button button-primary" type="submit">Open production</button>
        </form> : <div className="empty-state"><p>Create a channel before opening production.</p><Link className="button button-primary" href="/app/marketing">Create channel</Link></div>}
      </section>
    </div>
  </section>;
}
