import { createRoot } from "react-dom/client";
import { useSyncExternalStore } from "react";
import { StudioShell } from "../../components/product/studio-shell";
import { LandingExperience } from "../../components/blocks/landing/landing-experience";
import { SiteFooter } from "../../components/shell/site-footer";
import { ChannelDashboardClient } from "../../components/product/channel-dashboard-client";
import { ChannelStaffingClient } from "../../components/product/channel-staffing-client";
import { ChannelMarketingClient } from "../../components/product/channel-marketing-client";
import { ChannelSocialClient } from "../../components/product/channel-social-client";
import { ChannelAssetsClient } from "../../components/product/channel-assets-client";
import { ChannelProductionClient } from "../../components/product/channel-production-client";
import type { PublishedSiteContent } from "../../lib/site/content";
import "../../app/globals.css";

const channel = { id: "channel-1", name: "Nebula Noir", status: "active", is_brand: false } as const;
const secondChannel = { id: "channel-2", name: "Orbit Kids", status: "draft", is_brand: false } as const;
const productions = [{ id: "production-1", title: "The Midnight Signal", status: "running", current_step: 4, step_count: 13, run_mode: "guided", scheduled_at: "2026-09-12T18:00:00Z", updated_at: "2026-09-08T10:00:00Z" }];
const channelData = { ...channel, audience: "Genre fiction fans", voice: "Cinematic and curious", cadence: "Weekly", pillars: ["Lore", "Visual teasers"] };
const agents = [{ id: "agent-1", name: "Mara Voss", capability: "Story direction", model: "mid", lanes: { id: "lane-1", name: "Creative", departments: { id: "dept-1", name: "Creative" } } }];
const siteTips: PublishedSiteContent[] = [
  { id: "tip-1", kind: "tip", placement: "studio_sidebar", audience: "member", status: "published", title: "Local studio update", body: "Continuity tools are ready.", cta_label: "Read update", cta_url: "https://example.test/update", media_path: null, media_url: null, alt_text: null, starts_at: null, ends_at: null, published_at: "2026-09-08T10:00:00Z" },
  { id: "tip-2", kind: "tip", placement: "studio_sidebar", audience: "member", status: "published", title: "Second studio update", body: "A second local fixture item.", cta_label: null, cta_url: null, media_path: null, media_url: null, alt_text: null, starts_at: null, ends_at: null, published_at: "2026-09-08T10:00:00Z" },
];

function useLocation() { return useSyncExternalStore((cb) => { window.addEventListener("popstate", cb); return () => window.removeEventListener("popstate", cb); }, () => window.location.pathname + window.location.search, () => "/app/channels/channel-1"); }

function ChannelContent() {
  const location = useLocation();
  const path = location.split("?")[0];
  if (path.endsWith("/staffing")) return <ChannelStaffingClient channelId={channel.id} channelName={channel.name} agents={agents} assignedAgentIds={["agent-1"]} />;
  if (path.endsWith("/marketing")) return <ChannelMarketingClient channel={channelData} budgetData={{ guideline_credits: 120, notes: "", updated_at: "2026-09-08T10:00:00Z" }} productions={productions.map((p) => ({ ...p, production_budget_guidelines: { guideline_credits: 120, notes: "" } }))} totalProductionCredits={120} stageFloorSlot={<div data-testid="marketing-stage-floor">Marketing Stage Floor fixture</div>} />;
  if (path.endsWith("/social")) return <ChannelSocialClient channelId={channel.id} channelName={channel.name} connections={[]} signals={[]} releasePackages={[]} />;
  if (path.endsWith("/assets")) return <ChannelAssetsClient channelId={channel.id} channelName={channel.name} bytesUsed={4096} dnaItems={[]} assetItems={[]} />;
  if (path.endsWith("/production")) return <ChannelProductionClient stageFloorSlot={<div data-testid="production-stage-floor">Production Stage Floor fixture</div>} slatesSlot={<div data-testid="production-slates">Active Production Slates</div>} />;
  return <ChannelDashboardClient channel={channelData} productions={productions} />;
}

function Fixture() {
  return <StudioShell studioName="Gem Test Studio" userEmail="local@example.test" channels={[channel, secondChannel]} notifications={[]} siteTips={siteTips}><section className="product-page shell" data-testid="channel-content"><div className="mb-4"><h1 className="font-display text-3xl font-bold">{channel.name} · <span data-testid="page-title">{locationTitle()}</span></h1></div><ChannelContent /></section></StudioShell>;
}

function locationTitle() { const path = window.location.pathname; if (path.endsWith("/staffing")) return "Staffing"; if (path.endsWith("/marketing")) return "Marketing"; if (path.endsWith("/social")) return "Social Media"; if (path.endsWith("/assets")) return "Assets & DNA"; if (path.endsWith("/production")) return "Production"; return "Dashboard"; }
createRoot(document.getElementById("root")!).render(window.location.pathname === "/public-review" ? <><LandingExperience /><SiteFooter /></> : <Fixture />);
