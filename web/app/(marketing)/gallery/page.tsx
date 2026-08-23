import Link from "next/link";
import { createClient } from "@/lib/supabase/server";

export const metadata = {
  title: "Gallery",
  description: "Public creations and showcases produced with Gem Studio.",
};

type GalleryItem = {
  id: string;
  title: string;
  description?: string | null;
  media_url?: string | null;
  created_at: string;
};

export default async function GalleryPage() {
  let items: GalleryItem[] = [];

  let galleryError: string | null = null;
  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("public_gallery")
      .select("id, title, description, media_url, created_at")
      .eq("approved", true)
      .order("created_at", { ascending: false });

    if (!error && Array.isArray(data)) {
      items = data;
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
    <article className="marketing-detail">
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
                <h2>{item.title}</h2>
                {item.description && <p>{item.description}</p>}
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
