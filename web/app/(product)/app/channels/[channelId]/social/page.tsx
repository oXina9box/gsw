import { notFound } from "next/navigation";
import { getWorkspaceContext } from "@/lib/studio/workspace";
import { FlowbiteBreadcrumb } from "@/components/blocks/flowbite/flowbite-breadcrumb";
import { FlowbiteBadge } from "@/components/blocks/flowbite/flowbite-badge";
import { ChannelSubnav } from "@/components/product/channel-subnav";
import { PrelineCard } from "@/components/blocks/preline/preline-card";

export const metadata = { title: "Channel Social Media" };

export default async function ChannelSocialPage({
  params,
}: {
  params: Promise<{ channelId: string }>;
}) {
  const { channelId } = await params;
  const { supabase } = await getWorkspaceContext();

  const [{ data: channel }, { data: connections }, { data: signals }, { data: productions }] = await Promise.all([
    supabase.from("channels").select("id, name, status").eq("id", channelId).maybeSingle(),
    supabase.from("social_connections").select("id, platform, account_label, status").order("platform"),
    supabase.from("signals").select("id, signal_type, title, body, status, created_at").eq("channel_id", channelId).order("created_at", { ascending: false }).limit(20),
    supabase.from("productions").select("id, title, release_packages(id, platform, caption, status, created_at)").eq("channel_id", channelId),
  ]);

  if (!channel) notFound();

  const socialList = connections ?? [];
  const signalList = signals ?? [];
  const releasePackages = (productions ?? []).flatMap((p) => {
    const pkgs = Array.isArray(p.release_packages) ? p.release_packages : [];
    return pkgs.map((pkg) => ({ ...pkg, productionTitle: p.title }));
  });

  return (
    <section className="product-page shell" data-archetype="B1-B">
      <div className="mb-6">
        <FlowbiteBreadcrumb
          homeHref="/app"
          homeLabel="Studio"
          items={[
            { label: "Channels", href: "/app/channels" },
            { label: channel.name, href: `/app/channels/${channel.id}` },
            { label: "Social Media", current: true },
          ]}
        />
      </div>

      <div className="section-head mb-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <h1 className="font-display text-3xl sm:text-4xl font-bold text-text">
            {channel.name} · Social Media
          </h1>
          <FlowbiteBadge color={channel.status === "active" ? "lime" : "amber"}>
            {channel.status}
          </FlowbiteBadge>
        </div>
      </div>

      <ChannelSubnav channelId={channel.id} activeTab="social" />

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-12 items-start mb-8">
        <div className="lg:col-span-4 space-y-4">
          <div className="rounded-md border border-border bg-surface p-5 space-y-3">
            <h2 className="font-display text-lg font-semibold text-text">Connected Outlets</h2>
            <p className="font-body text-xs text-text-muted">
              Social platforms active for distribution across {channel.name}.
            </p>

            {socialList.length === 0 ? (
              <p className="font-mono text-xs text-text-faint">No social platforms linked yet.</p>
            ) : (
              <ul className="divide-y divide-border-2 font-mono text-xs">
                {socialList.map((c) => (
                  <li key={c.id} className="py-2.5 flex items-center justify-between">
                    <div>
                      <span className="text-text font-semibold uppercase">{c.platform}</span>
                      <p className="text-[11px] text-text-faint">{c.account_label}</p>
                    </div>
                    <FlowbiteBadge color={c.status === "connected" ? "lime" : "cyan"} size="sm">
                      {c.status}
                    </FlowbiteBadge>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>

        <div className="lg:col-span-8 space-y-6">
          <div className="rounded-md border border-border bg-surface p-5 space-y-4">
            <h2 className="font-display text-lg font-semibold text-text">Channel Signals &amp; Feedback</h2>
            <p className="font-body text-xs text-text-muted">
              Audience intelligence, native trends, and feedback signals tied directly to {channel.name}.
            </p>

            {signalList.length === 0 ? (
              <p className="font-mono text-xs text-text-faint py-4 text-center">No signals logged for this channel yet.</p>
            ) : (
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                {signalList.map((s) => (
                  <PrelineCard
                    key={s.id}
                    kicker={s.signal_type}
                    title={s.title}
                    badge={<FlowbiteBadge color="pink" size="sm">{s.status}</FlowbiteBadge>}
                    subtitle={s.body}
                    footer={
                      <span className="font-mono text-[10px] text-text-faint">
                        {new Date(s.created_at).toLocaleDateString()}
                      </span>
                    }
                  >
                    <p className="text-xs text-text-muted font-body">
                      Audience intelligence logged for {channel.name}.
                    </p>
                  </PrelineCard>
                ))}
              </div>
            )}
          </div>

          <div className="rounded-md border border-border bg-surface p-5 space-y-4">
            <h2 className="font-display text-lg font-semibold text-text">Release Packages</h2>
            <p className="font-body text-xs text-text-muted">
              Platform-tailored video cutdowns and captions generated for this channel.
            </p>

            {releasePackages.length === 0 ? (
              <p className="font-mono text-xs text-text-faint py-4 text-center">No release packages generated yet.</p>
            ) : (
              <ul className="divide-y divide-border-2 font-mono text-xs">
                {releasePackages.map((pkg) => (
                  <li key={pkg.id} className="py-3 flex items-center justify-between">
                    <div>
                      <span className="text-text font-semibold uppercase">{pkg.platform} · {pkg.productionTitle}</span>
                      <p className="text-[11px] text-text-muted line-clamp-2 mt-0.5">{pkg.caption}</p>
                    </div>
                    <FlowbiteBadge color={pkg.status === "approved" ? "lime" : "cyan"} size="sm">
                      {pkg.status}
                    </FlowbiteBadge>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
