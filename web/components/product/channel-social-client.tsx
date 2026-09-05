"use client";

import { useState } from "react";
import Link from "next/link";
import { FlowbiteBadge } from "@/components/blocks/flowbite/flowbite-badge";

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

const ALL_SUPPORTED_PLATFORMS = [
  { id: "youtube", name: "YouTube", handle: "@studio_youtube", icon: "YT" },
  { id: "tiktok", name: "TikTok", handle: "@studio_tiktok", icon: "TT" },
  { id: "x", name: "X / Twitter", handle: "@studio_x", icon: "X" },
  { id: "instagram", name: "Instagram", handle: "@studio_ig", icon: "IG" },
  { id: "facebook", name: "Facebook", handle: "fb.com/studio", icon: "FB" },
  { id: "discord", name: "Discord", handle: "discord.gg/studio", icon: "DC" },
  { id: "telegram", name: "Telegram", handle: "t.me/studio_channel", icon: "TG" },
  { id: "snapchat", name: "Snapchat", handle: "@studio_snap", icon: "SC" },
] as const;

export function ChannelSocialClient({
  channelName,
  connections,
  signals,
  releasePackages,
}: ChannelSocialClientProps) {
  const [activeTab, setActiveTab] = useState<"inbox" | "signals" | "packages">("inbox");
  const [replyText, setReplyText] = useState<{ [id: string]: string }>({});
  const [repliedComments, setRepliedComments] = useState<string[]>([]);
  const [convertedSignals, setConvertedSignals] = useState<string[]>([]);

  // Simulated live community comments stream for the 2-way inbox
  const [comments] = useState([
    {
      id: "c1",
      platform: "YouTube",
      author: "@alex_cyber",
      text: "The twist in Episode 1 at 08:24 was insane! When is Episode 2 dropping?",
      sentiment: "positive",
      time: "12m ago",
    },
    {
      id: "c2",
      platform: "TikTok",
      author: "@neon_fanatic",
      text: "That visual lighting style is wild. The anamorphic lens flare looks so real.",
      sentiment: "positive",
      time: "42m ago",
    },
    {
      id: "c3",
      platform: "X",
      author: "@story_critic",
      text: "Act 2 pacing slowed down a bit in the police headquarters scene. Hope Ep 2 picks it back up.",
      sentiment: "critique",
      time: "2h ago",
    },
    {
      id: "c4",
      platform: "Discord",
      author: "Morpheus_99",
      text: "Is Kaelen Vance going to find out about his synthetic memory implant in the season finale?",
      sentiment: "curiosity",
      time: "3h ago",
    },
  ]);

  const handleSendReply = (commentId: string) => {
    if (!replyText[commentId]?.trim()) return;
    setRepliedComments((prev) => [...prev, commentId]);
  };

  const handleConvertToSignal = (commentId: string) => {
    setConvertedSignals((prev) => [...prev, commentId]);
  };

  // Connected platform lookup map
  const connectionMap = new Map(connections.map((c) => [c.platform.toLowerCase(), c]));

  return (
    <div className="space-y-6">
      {/* 8-Platform Connectivity Desk */}
      <div className="rounded-md border border-border bg-surface p-4 space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-2 border-b border-border pb-2">
          <div>
            <h2 className="font-display text-sm font-semibold text-text uppercase tracking-wide">
              8-Platform Two-Way Connection Strip
            </h2>
            <p className="font-body text-xs text-text-muted">
              Bi-directional distribution &amp; audience interaction connectors active for {channelName}.
            </p>
          </div>
          <Link href="/app/integrations" className="font-mono text-xs text-cyan hover:underline">
            Manage Credentials in Integrations &rarr;
          </Link>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-2 font-mono text-xs text-center">
          {ALL_SUPPORTED_PLATFORMS.map((p) => {
            const conn = connectionMap.get(p.id);
            const isConnected = conn?.status === "connected" || Boolean(conn);

            return (
              <div
                key={p.id}
                className={`p-2 rounded-sm border ${
                  isConnected ? "border-lime/40 bg-surface-2" : "border-border bg-surface-2/50"
                } space-y-1`}
              >
                <div className="w-6 h-6 mx-auto rounded-full bg-surface-3 flex items-center justify-center font-bold text-[10px] text-text">
                  {p.icon}
                </div>
                <span className="text-[11px] text-text font-medium block truncate">{p.name}</span>
                <span className={`text-[10px] block ${isConnected ? "text-lime font-medium" : "text-text-faint"}`}>
                  {isConnected ? "Connected" : "Not Linked"}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Main Tabbed Interaction & Distribution Workspace */}
      <div className="rounded-md border border-border bg-surface p-5 space-y-4">
        {/* Navigation Tabs */}
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
              Two-Way Community Inbox ({comments.length})
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
              Signals Radar ({signals.length})
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
              Platform Release Packages ({releasePackages.length})
            </button>
          </div>
        </div>

        {/* Tab 1: Two-Way Community Inbox */}
        {activeTab === "inbox" && (
          <div className="space-y-4">
            <div className="flex items-center justify-between text-xs font-mono text-text-muted">
              <span>Live community conversation stream across all 8 social platforms</span>
              <span className="text-lime">Sentiment: 94% Positive</span>
            </div>

            <div className="space-y-3">
              {comments.map((comment) => {
                const isReplied = repliedComments.includes(comment.id);
                const isConverted = convertedSignals.includes(comment.id);

                return (
                  <div
                    key={comment.id}
                    className="p-4 rounded-md border border-border bg-surface-2 space-y-2 font-mono text-xs"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="px-1.5 py-0.5 rounded-xs bg-surface-3 text-cyan text-[10px] uppercase font-bold">
                          {comment.platform}
                        </span>
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

                    {/* Interaction Reply Box & Convert to Signal Trigger */}
                    <div className="pt-2 border-t border-border flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2">
                      <div className="flex-1 flex items-center gap-2">
                        <input
                          type="text"
                          placeholder="Quick reply to viewer..."
                          value={replyText[comment.id] ?? ""}
                          onChange={(e) =>
                            setReplyText((prev) => ({ ...prev, [comment.id]: e.target.value }))
                          }
                          className="w-full rounded-sm border border-border bg-surface px-2 py-1 text-xs text-text placeholder:text-text-faint focus:outline-none focus:ring-1 focus:ring-cyan"
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
                        className={`px-2 py-1 rounded-sm border text-[11px] shrink-0 ${
                          isConverted
                            ? "border-lime text-lime bg-lime/10"
                            : "border-border bg-surface text-text hover:border-pink hover:text-pink"
                        }`}
                      >
                        {isConverted ? "Converted to Signal" : "Convert to Signal"}
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Tab 2: Signals Radar Feed */}
        {activeTab === "signals" && (
          <div className="space-y-4">
            <div className="flex items-center justify-between text-xs font-mono text-text-muted">
              <span>Audience intelligence, retention peaks, and narrative critiques feeding marketing</span>
              <span className="text-pink">Feedback Loop Active</span>
            </div>

            {signals.length === 0 ? (
              <div className="p-8 rounded-md border border-dashed border-border bg-surface-2 text-center font-mono text-xs text-text-muted">
                No signals logged for this channel yet. Comments and retention spikes will populate here.
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {signals.map((s) => (
                  <div
                    key={s.id}
                    className="p-4 rounded-md border border-border bg-surface-2 space-y-2 flex flex-col justify-between"
                  >
                    <div className="space-y-1">
                      <div className="flex items-center justify-between">
                        <span className="font-mono text-[10px] uppercase text-cyan font-semibold">
                          {s.signal_type}
                        </span>
                        <FlowbiteBadge color="pink" size="sm">{s.status}</FlowbiteBadge>
                      </div>
                      <h4 className="font-display text-sm font-semibold text-text">{s.title}</h4>
                      <p className="font-body text-xs text-text-muted line-clamp-3">{s.body}</p>
                    </div>
                    <div className="pt-2 border-t border-border flex items-center justify-between font-mono text-[10px] text-text-faint">
                      <span>{new Date(s.created_at).toLocaleDateString()}</span>
                      <span className="text-lime">Pushed to Creative Brief</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Tab 3: Platform Release Packages */}
        {activeTab === "packages" && (
          <div className="space-y-4">
            <div className="flex items-center justify-between text-xs font-mono text-text-muted">
              <span>Platform-tailored video cutdowns and optimized captions ready for release</span>
              <span className="text-cyan">Staged Cuts</span>
            </div>

            {releasePackages.length === 0 ? (
              <div className="p-8 rounded-md border border-dashed border-border bg-surface-2 text-center font-mono text-xs text-text-muted">
                No release packages generated yet. Packages are synthesized automatically during Stage 11.
              </div>
            ) : (
              <div className="space-y-3">
                {releasePackages.map((pkg) => {
                  const isVertical = pkg.platform.toLowerCase().includes("tiktok") || pkg.platform.toLowerCase().includes("snap");
                  const aspect = isVertical ? "9:16 Vertical" : "16:9 Widescreen";

                  return (
                    <div
                      key={pkg.id}
                      className="p-4 rounded-md border border-border bg-surface-2 space-y-2 font-mono text-xs"
                    >
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <div className="flex items-center gap-2">
                          <span className="px-2 py-0.5 rounded-xs bg-pink/20 text-pink text-[10px] uppercase font-bold">
                            {pkg.platform}
                          </span>
                          <span className="text-text font-semibold">{pkg.productionTitle}</span>
                          <span className="px-1.5 py-0.5 rounded-xs bg-surface-3 text-cyan text-[10px]">
                            {aspect}
                          </span>
                        </div>
                        <FlowbiteBadge color={pkg.status === "approved" ? "lime" : "cyan"} size="sm">
                          {pkg.status}
                        </FlowbiteBadge>
                      </div>

                      <p className="font-body text-xs text-text bg-surface p-2.5 rounded-sm border border-border">
                        {pkg.caption}
                      </p>

                      <div className="flex items-center justify-between text-[10px] text-text-faint pt-1">
                        <span>Caption Chars: {pkg.caption.length} / 2,200 max</span>
                        <span className="text-lime font-medium">Ready for Scheduled Publish</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
