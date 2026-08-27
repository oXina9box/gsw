import Link from "next/link";
import { createClient } from "@/lib/supabase/server";

export const metadata = {
  title: "Gallery",
  description: "Public creations and showcases produced with Gem Studio.",
};

type GalleryItem = {
  id: string;
  title: string;
  description: string;
  media_url: string;
  credits: string;
  rights_status: string;
  publication_state: "published";
  created_at: string;
};

export default async function GalleryPage() {
  let items: GalleryItem[] = [];

  let galleryError: string | null = null;
  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("public_gallery")
      .select("id, title, description, media_url, credits, rights_status, publication_state, created_at")
      .eq("approved", true)
      .eq("publication_state", "published")
      .order("created_at", { ascending: false });

    if (!error && Array.isArray(data)) {
      const publicItems = data.filter((item): item is GalleryItem =>
        typeof item?.id === "string" &&
        typeof item?.title === "string" &&
        typeof item?.description === "string" &&
        typeof item?.media_url === "string" &&
        typeof item?.credits === "string" &&
        typeof item?.rights_status === "string" &&
        item?.publication_state === "published" &&
        typeof item?.created_at === "string",
      );
      if (publicItems.length > 0) items = publicItems;
    } else if (error) {
      const code = typeof error === "object" && error !== null && "code" in error ? (error as unknown as { code: unknown }).code : null;
      if (code === "42P01") {
        items = [];
      } else {
        galleryError = "Unable to load gallery.";
      }
    }
  } catch {
    galleryError = "Unable to load gallery.";
  }

  return (
    <article className="marketing-detail" data-archetype="A1">
      <header className="detail-hero shell">
        <h1>Studio Gallery. <span>Produced by Creators.</span></h1>
        <p className="detail-lede">
          Explore finished films, scenes, and creative deliverables generated across connected AI departments.
        </p>
      </header>
      {galleryError && (
        <p className="form-error shell" role="alert">
          {galleryError}
        </p>
      )}
      <section className="detail-band shell">
        {items.length > 0 ? (
          <div className="detail-grid shell">
            {items.map((item) => (
              <article key={item.id}>
                {/* External, rights-cleared editorial URLs; optimization host is not configured. */}
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={item.media_url}
                  alt={item.title}
                  loading="lazy"
                  referrerPolicy="no-referrer"
                />
                <h2>{item.title}</h2>
                <p>{item.description}</p>
                <p>{item.credits} · {item.rights_status}</p>
              </article>
            ))}
          </div>
        ) : (
          <div style={{ textAlign: "center", padding: "3rem 1rem" }}>
            <p style={{ fontSize: "1.125rem", color: "var(--text-muted, #888)", marginBottom: "1.5rem" }}>
              No public gallery yet.
            </p>
            <Link className="button button-outline" href="/docs">
              Read how productions are built ↗
            </Link>
          </div>
        )}
      </section>

      <section className="detail-cta shell">
        <h2>Start your own private studio production.</h2>
        <Link className="button button-primary" href="/signup">
          Create your Studio ↗
        </Link>
      </section>
    </article>
  );
}
