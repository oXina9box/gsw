"use client";

import { useState } from "react";
import Link from "next/link";
import { FlowbiteBadge } from "@/components/blocks/flowbite/flowbite-badge";
import { useChannelView } from "@/components/product/use-channel-view";

type SocialConnection = {
  id: string;
  platform: string;
  account_label: string;
  status: string;
};

type SignalItem = {
  id: string;
  signal_type: string;
  title: string;
  body: string;
  status: string;
  created_at: string;
};

type ReleasePackageItem = {
  id: string;
  platform: string;
  caption: string;
  status: string;
  created_at: string;
  productionTitle: string;
};

type ChannelSocialClientProps = Readonly<{
  channelId: string;
  channelName: string;
  connections: SocialConnection[];
  signals: SignalItem[];
  releasePackages: ReleasePackageItem[];
}>;


type PlatformConfig = {
  id: string;
  name: string;
  handle: string;
  icon: string;
};

const INITIAL_PLATFORMS: readonly PlatformConfig[] = [
  { id: "youtube", name: "YouTube", handle: "", icon: "YT" },
  { id: "tiktok", name: "Tik-Tok", handle: "", icon: "TT" },
  { id: "x", name: "X", handle: "", icon: "X" },
  { id: "instagram", name: "Instagram", handle: "", icon: "IG" },
  { id: "facebook", name: "Facebook", handle: "", icon: "FB" },
  { id: "telegram", name: "Telegram", handle: "", icon: "TG" },
  { id: "discord", name: "Discord", handle: "", icon: "DC" },
  { id: "snapchat", name: "Snapchat", handle: "", icon: "SC" },
] as const;

function normalizePlatform(name: string): string {
  const lower = name.toLowerCase().replace(/[\s\-_/]/g, "");
  if (lower === "tiktok") return "tiktok";
  if (lower === "x" || lower === "xtwitter" || lower === "twitter") return "x";
  if (lower === "youtube" || lower === "yt") return "youtube";
  if (lower === "instagram" || lower === "ig") return "instagram";
  if (lower === "facebook" || lower === "fb") return "facebook";
  if (lower === "discord") return "discord";
  if (lower === "telegram") return "telegram";
  if (lower === "snapchat") return "snapchat";
  return lower;
}

export function ChannelSocialClient({
  channelName,
  connections,
  signals,
  releasePackages,
}: ChannelSocialClientProps) {
  // Builtin + custom platforms
  const [platforms, setPlatforms] = useState<PlatformConfig[]>([...INITIAL_PLATFORMS]);
  // Visible platform ids
  const [visiblePlatformIds, setVisiblePlatformIds] = useState<string[]>(
    INITIAL_PLATFORMS.map((p) => p.id)
  );
  const { activeView, setActiveView } = useChannelView("social");
  // Sub-tabs within platform view
  const [activeTab, setActiveTab] = useState<"inbox" | "signals" | "packages">("inbox");

  // Custom platform form state
  const [newPlatformName, setNewPlatformName] = useState("");
  const [customPlatformError, setCustomPlatformError] = useState<string | null>(null);

  const [replyText, setReplyText] = useState<{ [id: string]: string }>({});
  const [repliedComments, setRepliedComments] = useState<string[]>([]);
  const [convertedSignals, setConvertedSignals] = useState<string[]>([]);

  const comments: readonly { id: string; platform: string; author: string; text: string; sentiment: string; time: string }[] = [];

  const handleSendReply = (commentId: string) => {
    if (!replyText[commentId]?.trim()) return;
    setRepliedComments((prev) => [...prev, commentId]);
  };

  const handleConvertToSignal = (commentId: string) => {
    setConvertedSignals((prev) => [...prev, commentId]);
  };

  const handleAddCustomPlatform = () => {
    const trimmed = newPlatformName.trim();
    if (!trimmed) {
      setCustomPlatformError("Platform name cannot be empty.");
      return;
    }

    const normalized = normalizePlatform(trimmed);
    const exists = platforms.some((p) => normalizePlatform(p.name) === normalized || p.id === normalized);
    if (exists) {
      setCustomPlatformError(`Platform "${trimmed}" already exists.`);
      return;
    }

    const id = trimmed.toLowerCase().replace(/[^a-z0-9]/g, "-");
    const newConfig: PlatformConfig = {
      id,
      name: trimmed,
      handle: "",
      icon: trimmed.slice(0, 2).toUpperCase(),
    };

    setPlatforms((prev) => [...prev, newConfig]);
    setVisiblePlatformIds((prev) => [...prev, id]);
    setNewPlatformName("");
    setCustomPlatformError(null);
  };

  const togglePlatformVisibility = (id: string) => {
    setVisiblePlatformIds((prev) => {
      if (prev.includes(id)) {
        const next = prev.filter((p) => p !== id);
        if (activeView === id) {
          setActiveView(next[0] ?? "settings");
        }
        return next;
      }
      return [...prev, id];
    });
  };

  // Lookup connection
  const connectionMap = new Map(
    connections.map((c) => [normalizePlatform(c.platform), c])
  );

  const currentPlatformConfig = platforms.find((p) => p.id === activeView);
  const currentNormalized = currentPlatformConfig ? normalizePlatform(currentPlatformConfig.name) : "";

  // Filter content to current platform
  const filteredComments = comments.filter(
    (c) => normalizePlatform(c.platform) === currentNormalized
  );
  const filteredSignals = signals.filter(
    (s) => normalizePlatform(s.title + " " + s.body) === currentNormalized
  );
  const filteredPackages = releasePackages.filter(
    (p) => normalizePlatform(p.platform) === currentNormalized
  );
  const currentConnection = connectionMap.get(currentNormalized);
  const isCurrentConnected = currentConnection?.status === "connected" || Boolean(currentConnection);

  return (
    <div className="space-y-4">

      {/* Social Settings View */}
      {activeView === "settings" ? (
        <div className="space-y-6">
          <div className="rounded-md border border-border bg-surface p-5 space-y-4">
            <h3 className="font-display text-lg font-semibold text-text">
              Platform Visibility Settings
            </h3>
            <p className="font-body text-xs text-text-muted">
              Toggle platforms to include in or hide from the third-tier navigation view. Hidden platforms remain manageable here.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
              {platforms.map((p) => {
                const isVisible = visiblePlatformIds.includes(p.id);
                return (
                  <label
                    key={p.id}
                    className="flex items-center justify-between p-3 rounded-md border border-border bg-surface-2 cursor-pointer hover:bg-surface-3 transition-colors"
                  >
                    <span className="font-mono text-xs text-text font-medium">
                      {p.name}
                    </span>
                    <input
                      type="checkbox"
                      checked={isVisible}
                      onChange={() => togglePlatformVisibility(p.id)}
                      className="rounded border-border text-pink focus:ring-cyan"
                    />
                  </label>
                );
              })}
            </div>
          </div>

          <div className="rounded-md border border-border bg-surface p-5 space-y-4">
            <h3 className="font-display text-lg font-semibold text-text">
              Add Custom Platform
            </h3>
            <p className="font-body text-xs text-text-muted">
              Register an emerging or private social channel. Custom channels immediately appear in your third-tier views.
            </p>

            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
              <input
                type="text"
                placeholder="Platform name (e.g. Mastodon, Threads, Bluesky)..."
                value={newPlatformName}
                onChange={(e) => {
                  setNewPlatformName(e.target.value);
                  setCustomPlatformError(null);
                }}
                className="flex-1 rounded-sm border border-border bg-bg px-3 py-2 font-mono text-xs text-text focus:border-cyan focus:outline-hidden"
              />
              <button
                type="button"
                onClick={handleAddCustomPlatform}
                className="button button-primary text-xs shrink-0"
              >
                Add Platform
              </button>
            </div>

            {customPlatformError && (
              <p className="form-error text-xs font-mono" role="alert">
                {customPlatformError}
              </p>
            )}
          </div>
        </div>
      ) : (
        /* Selected Platform View */
        <div className="space-y-6">
          {/* Platform Status Card */}
          <div className="rounded-md border border-border bg-surface p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-surface-2 border border-border flex items-center justify-center font-bold text-sm text-cyan">
                {currentPlatformConfig?.icon ?? "SO"}
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="font-display text-base font-semibold text-text">
                    {currentPlatformConfig?.name ?? activeView}
                  </h3>
                  <FlowbiteBadge color={isCurrentConnected ? "lime" : "amber"} size="sm">
                    {isCurrentConnected ? "Connected" : "Not Linked"}
                  </FlowbiteBadge>
                </div>
                <span className="font-mono text-xs text-text-faint">
                  {currentPlatformConfig?.handle || "Handle unavailable"} · {channelName}
                </span>
              </div>
            </div>
            <Link href="/app/integrations" className="font-mono text-xs text-cyan hover:underline">
              Configure in Integrations &rarr;
            </Link>
          </div>

          {/* Sub-tabs: Inbox, Signals, Packages */}
          <div className="rounded-md border border-border bg-surface p-5 space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border pb-3">
              <div className="flex gap-2 font-mono text-xs">
                <button
                  type="button"
                  onClick={() => setActiveTab("inbox")}
                  className={`px-3 py-1.5 rounded-sm transition-colors ${
                    activeTab === "inbox"
                      ? "bg-pink text-white font-semibold"
                      : "bg-surface-2 text-text-muted hover:text-text"
                  }`}
                >
                  Two-Way Community Inbox ({filteredComments.length})
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab("signals")}
                  className={`px-3 py-1.5 rounded-sm transition-colors ${
                    activeTab === "signals"
                      ? "bg-pink text-white font-semibold"
                      : "bg-surface-2 text-text-muted hover:text-text"
                  }`}
                >
                  Signals Radar ({filteredSignals.length})
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab("packages")}
                  className={`px-3 py-1.5 rounded-sm transition-colors ${
                    activeTab === "packages"
                      ? "bg-pink text-white font-semibold"
                      : "bg-surface-2 text-text-muted hover:text-text"
                  }`}
                >
                  Platform Release Packages ({filteredPackages.length})
                </button>
              </div>
            </div>

            {/* Sub-Tab 1: Inbox */}
            {activeTab === "inbox" && (
              <div className="space-y-4">
                {filteredComments.length === 0 ? (
                  <div className="p-6 rounded-md border border-dashed border-border bg-surface-2 text-center font-mono text-xs text-text-muted">
                    No active audience comments on {currentPlatformConfig?.name ?? activeView} yet.
                  </div>
                ) : (
                  <div className="space-y-3">
                    {filteredComments.map((comment) => {
                      const isReplied = repliedComments.includes(comment.id);
                      const isConverted = convertedSignals.includes(comment.id);

                      return (
                        <div
                          key={comment.id}
                          className="p-4 rounded-md border border-border bg-surface-2 space-y-2 font-mono text-xs"
                        >
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <span className="text-text font-semibold">{comment.author}</span>
                              <span className="text-text-faint text-[10px]">{comment.time}</span>
                            </div>
                            <FlowbiteBadge
                              color={
                                comment.sentiment === "positive"
                                  ? "lime"
                                  : comment.sentiment === "critique"
                                  ? "amber"
                                  : "cyan"
                              }
                              size="sm"
                            >
                              {comment.sentiment}
                            </FlowbiteBadge>
                          </div>

                          <p className="font-body text-xs text-text">{comment.text}</p>

                          <div className="pt-2 border-t border-border flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2">
                            <div className="flex-1 flex items-center gap-2">
                              <input
                                type="text"
                                placeholder="Quick reply to viewer..."
                                value={replyText[comment.id] ?? ""}
                                onChange={(e) =>
                                  setReplyText((prev) => ({ ...prev, [comment.id]: e.target.value }))
                                }
                                className="w-full rounded-sm border border-border bg-surface px-2 py-1 text-xs text-text placeholder:text-text-faint focus:outline-hidden"
                              />
                              <button
                                type="button"
                                onClick={() => handleSendReply(comment.id)}
                                className="px-3 py-1 rounded-sm bg-cyan hover:bg-cyan/80 text-surface font-semibold text-[11px] shrink-0"
                              >
                                {isReplied ? "Sent" : "Reply"}
                              </button>
                            </div>

                            <button
                              type="button"
                              onClick={() => handleConvertToSignal(comment.id)}
                              disabled={isConverted}
                              className={`px-3 py-1 rounded-sm border text-[11px] font-mono shrink-0 transition-colors ${
                                isConverted
                                  ? "border-lime/40 text-lime bg-lime/10"
                                  : "border-pink/40 text-pink hover:bg-pink/10"
                              }`}
                            >
                              {isConverted ? "✓ Signal Captured" : "Convert to Signal"}
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            )}

            {/* Sub-Tab 2: Signals */}
            {activeTab === "signals" && (
              <div className="space-y-4">
                {filteredSignals.length === 0 ? (
                  <div className="p-6 rounded-md border border-dashed border-border bg-surface-2 text-center font-mono text-xs text-text-muted">
                    No intelligence signals recorded for {currentPlatformConfig?.name ?? activeView} yet.
                  </div>
                ) : (
                  <div className="space-y-3">
                    {filteredSignals.map((sig) => (
                      <div
                        key={sig.id}
                        className="p-4 rounded-md border border-border bg-surface-2 space-y-2 font-mono text-xs"
                      >
                        <div className="flex items-center justify-between">
                          <span className="font-semibold text-text">{sig.title}</span>
                          <FlowbiteBadge color="cyan" size="sm">{sig.signal_type}</FlowbiteBadge>
                        </div>
                        <p className="font-body text-xs text-text-muted">{sig.body}</p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Sub-Tab 3: Packages */}
            {activeTab === "packages" && (
              <div className="space-y-4">
                {filteredPackages.length === 0 ? (
                  <div className="p-6 rounded-md border border-dashed border-border bg-surface-2 text-center font-mono text-xs text-text-muted">
                    No release packages prepared for {currentPlatformConfig?.name ?? activeView} yet.
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {filteredPackages.map((pkg) => (
                      <div
                        key={pkg.id}
                        className="p-4 rounded-md border border-border bg-surface-2 space-y-2 font-mono text-xs"
                      >
                        <div className="flex items-center justify-between">
                          <span className="font-semibold text-text">{pkg.productionTitle}</span>
                          <FlowbiteBadge color="lime" size="sm">{pkg.status}</FlowbiteBadge>
                        </div>
                        <p className="font-body text-xs text-text-muted">{pkg.caption}</p>
                        <span className="text-[10px] text-text-faint block">{pkg.created_at}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
