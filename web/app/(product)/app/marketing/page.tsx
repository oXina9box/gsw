import { createChannel } from "@/app/(product)/actions";

export const metadata = { title: "Marketing" };

export default function MarketingPage() {
  return <section className="product-page shell" data-archetype="B1-B">
    <h1>Channel positioning.</h1>
    <p className="lede">Define audience, voice, cadence, and content pillars before production starts.</p>
    <section className="panel marketing-brief">
      <h2>Build a channel brief</h2>
      <p className="muted">Research workflows can deepen this brief after the channel exists.</p>
      <form action={createChannel} className="stack-form">
        <label>Name<input name="name" maxLength={120} required placeholder="Sci-Fi Shorts" /></label>
        <label>Audience<textarea name="audience" maxLength={500} rows={3} placeholder="Who should care, and why?" /></label>
        <label>Voice<textarea name="voice" maxLength={500} rows={3} placeholder="Measured, strange, visually bold" /></label>
        <label>Cadence<input name="cadence" maxLength={120} placeholder="Weekly" /></label>
        <label>Pillars<input name="pillars" maxLength={500} placeholder="Hard sci-fi, AI ethics, space" /></label>
        <button className="button button-primary" type="submit">Create channel</button>
      </form>
    </section>
  </section>;
}
