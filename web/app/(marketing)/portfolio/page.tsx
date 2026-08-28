import Link from "next/link";
import { createClient } from "@/lib/supabase/server";

/* eslint-disable @next/next/no-img-element */

export const metadata = {
  title: "Portfolio",
  description: "Public creations and showcases produced with Gem Studio.",
};

type PortfolioItem = {
  id: string;
  title: string;
  description: string;
  media_url?: string;
  credits: string;
  rights_status: string;
  publication_state?: "published";
  created_at?: string;
};

const defaultShowcases: readonly PortfolioItem[] = [
  {
    id: "showcase-1",
    title: "The Obsidian Signal · Scene 08",
    description: "Selected clip 01:24 / 02:48 with character continuity locked across thirteen departments.",
    credits: "Gem Studio Floor",
    rights_status: "CC-BY 4.0 / Public Demo",
  },
  {
    id: "showcase-2",
    title: "GenPlay Prompt Contract · Take 03",
    description: "Read-only prompt generation and shot versioning from brief to master cut.",
    credits: "AI & Video Production",
    rights_status: "Studio Verified",
  },
  {
    id: "showcase-3",
    title: "Social Handoff Master",
    description: "9:16 vertical opening with native tension cut and private feedback signal loop.",
    credits: "Social Workshop",
    rights_status: "Public Demo",
  },
  {
    id: "showcase-4",
    title: "Thirteen-Stage Slate",
    description: "A complete multi-lane production slate with structured approvals and private continuity.",
    credits: "Front Office & Creative",
    rights_status: "Studio Master",
  },
];

export default async function PortfolioPage() {
  let items: PortfolioItem[] = [];
  try {
    const { data, error } = await (await createClient())
      .from("public_gallery")
      .select("id, title, description, media_url, credits, rights_status, publication_state, created_at")
      .eq("approved", true)
      .eq("publication_state", "published")
      .order("created_at", { ascending: false });
    if (!error && Array.isArray(data) && data.length > 0) {
      items = data
        .filter((item) =>
          typeof item?.id === "string" && typeof item?.title === "string" &&
          typeof item?.description === "string" && typeof item?.media_url === "string" &&
          typeof item?.credits === "string" && typeof item?.rights_status === "string"
        )
        .map((item) => ({
          id: String(item.id),
          title: String(item.title),
          description: String(item.description),
          media_url: String(item.media_url),
          credits: String(item.credits),
          rights_status: String(item.rights_status),
        }));
    }
  } catch {
    /* Public portfolio renders default showcase items when database is unseeded. */
  }

  const displayItems = items.length > 0 ? items : defaultShowcases;

  return <article className="marketing-detail" data-archetype="A1">
    <header className="detail-hero shell"><h1>Studio Portfolio. <span>Made by creators.</span></h1><p className="detail-lede">Finished films, scenes, and release packages made across connected AI departments.</p></header>
    <section className="detail-band shell">
      <div className="detail-grid">{displayItems.map((item) => <article key={item.id}>
        {item.media_url ? <img src={item.media_url} alt={item.title} loading="lazy" referrerPolicy="no-referrer" /> : null}
        <h2>{item.title}</h2><p>{item.description}</p><p>{item.credits} · {item.rights_status}</p>
      </article>)}</div>
    </section>
    <section className="detail-cta shell"><h2>Start your own private studio production.</h2><Link className="button button-primary" href="/?auth=signup">Create Studio ↗</Link></section>
  </article>;
}
