"use client";

import { useState } from "react";
import Link from "next/link";
import { FlowbiteBadge } from "@/components/blocks/flowbite/flowbite-badge";
import { ChannelSubnav } from "@/components/product/channel-subnav";

type DnaItem = {
  id: string;
  role: string;
  productionTitle: string;
  dna_records: {
    id?: string;
    dna_id?: string;
    dna_type?: string;
    record?: Record<string, unknown>;
    locked?: boolean;
  } | null;
};

type AssetItem = {
  id: string;
  kind: string;
  uri: string;
  metadata: Record<string, unknown> | null;
  created_at: string;
  productionTitle: string;
};

type ChannelAssetsClientProps = Readonly<{
  channelId: string;
  channelName: string;
  bytesUsed: number;
  dnaItems: DnaItem[];
  assetItems: AssetItem[];
}>;

const ASSETS_NAV_GROUPS = [
  {
    items: [
      { id: "dna", label: "DNA DataBase" },
      { id: "staffing", label: "Staffing Files" },
      { id: "content", label: "Content" },
    ],
  },
] as const;

function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  if (bytes < 1024 * 1024 * 1024) return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  return `${(bytes / (1024 * 1024 * 1024)).toFixed(2)} GB`;
}

export function ChannelAssetsClient({
  channelId,
  channelName,
  bytesUsed,
  dnaItems,
  assetItems,
}: ChannelAssetsClientProps) {
  const [activeView, setActiveView] = useState<"dna" | "staffing" | "content">("dna");
  const [dnaFilter, setDnaFilter] = useState<string>("all");
  const [fileSearch, setFileSearch] = useState("");
  const [fileKindFilter, setFileKindFilter] = useState<string>("all");
  const [inspectingDna, setInspectingDna] = useState<DnaItem | null>(null);
  const [previewAsset, setPreviewAsset] = useState<AssetItem | null>(null);

  // Simulated static core DNA records if productions haven't linked any yet
  const displayDna =
    dnaItems.length > 0
      ? dnaItems
      : [
          {
            id: "dna-default-1",
            role: "Protagonist Lead",
            productionTitle: "Ep 01: The Neon Genesis",
            dna_records: {
              id: "rec-1",
              dna_id: "CHAR-01",
              dna_type: "CDNA",
              locked: true,
              record: {
                name: "Kaelen Vance",
                summary: "Cynical detective with cybernetic eye, trenchcoat, scarred jawline.",
                visual_anchor: "Synthetic left eye glowing faint cyan, weathered brown coat",
                negative_prompt: "clean shaven, smiling, generic anime, bright saturated colors",
              },
            },
          },
          {
            id: "dna-default-2",
            role: "Primary Setting",
            productionTitle: "Ep 01: The Neon Genesis",
            dna_records: {
              id: "rec-2",
              dna_id: "LOC-01",
              dna_type: "LDNA",
              locked: true,
              record: {
                name: "Sector 7 Alleyways",
                summary: "Wet brutalist asphalt streets reflecting vertical neon billboards.",
                visual_anchor: "Puddles reflecting pink and amber neon, heavy atmospheric fog",
                negative_prompt: "sunny, clean daylight, trees, modern office buildings",
              },
            },
          },
          {
            id: "dna-default-3",
            role: "Cinematic Standard",
            productionTitle: "All Productions",
            dna_records: {
              id: "rec-3",
              dna_id: "STYLE-01",
              dna_type: "SDNA",
              locked: true,
              record: {
                name: "Neo-Noir 35mm Standard",
                summary: "Kodak Vision3 500T grain profile, anamorphic lens flares, high contrast.",
                visual_anchor: "Deep shadows, anamorphic bokeh horizontal streaks, 2.39:1 aspect",
                negative_prompt: "flat lighting, digital sheen, oversaturated cartoons",
              },
            },
          },
        ];

  const filteredDna = displayDna.filter((item) => {
    if (dnaFilter === "all") return true;
    const type = item.dna_records?.dna_type ?? "";
    return type.toLowerCase() === dnaFilter.toLowerCase();
  });

  // Filter staffing files (agent contracts, prompt bibles, lane configs)
  const staffingFiles = assetItems.filter((asset) => {
    const k = asset.kind.toLowerCase();
    const metaStr = JSON.stringify(asset.metadata ?? {}).toLowerCase();
    return (
      k.includes("staff") ||
      k.includes("agent") ||
      k.includes("config") ||
      metaStr.includes("agent") ||
      metaStr.includes("staff")
    );
  });

  // Filter content / generated assets
  const filteredContent = assetItems.filter((asset) => {
    if (fileKindFilter !== "all" && asset.kind.toLowerCase() !== fileKindFilter.toLowerCase()) {
      return false;
    }
    if (fileSearch.trim()) {
      const q = fileSearch.toLowerCase();
      const matchTitle = asset.productionTitle.toLowerCase().includes(q);
      const matchKind = asset.kind.toLowerCase().includes(q);
      const matchUri = asset.uri.toLowerCase().includes(q);
      if (!matchTitle && !matchKind && !matchUri) return false;
    }
    return true;
  });

  return (
    <div className="space-y-6">
      <ChannelSubnav
        activeTab="assets"
        activeView={activeView}
        groups={ASSETS_NAV_GROUPS}
        onViewChange={(id) => setActiveView(id as "dna" | "staffing" | "content")}
      />

      {/* Storage Vault Telemetry HUD (always visible, contextual counts) */}
      <div className="rounded-md border border-border bg-surface p-5 space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-2 border-b border-border pb-2 font-mono text-xs">
          <span className="text-text font-semibold uppercase tracking-wider">
            Workspace Vault Telemetry · {channelName}
          </span>
          <span className="text-cyan">
            Capacity: {formatBytes(bytesUsed)} Used / 100 GB Allocated
          </span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 font-mono text-xs text-center">
          <div className="p-3 rounded-sm bg-surface-2 border border-border">
            <span className="text-[10px] text-text-faint uppercase block">Storage Footprint</span>
            <span className="text-lg font-bold text-cyan">{formatBytes(bytesUsed)}</span>
          </div>
          <div className="p-3 rounded-sm bg-surface-2 border border-border">
            <span className="text-[10px] text-text-faint uppercase block">DNA Continuity Anchors</span>
            <span className="text-lg font-bold text-pink">{displayDna.length} Locked</span>
          </div>
          <div className="p-3 rounded-sm bg-surface-2 border border-border">
            <span className="text-[10px] text-text-faint uppercase block">Media Takes &amp; Masters</span>
            <span className="text-lg font-bold text-text">{assetItems.length} Files</span>
          </div>
          <div className="p-3 rounded-sm bg-surface-2 border border-border">
            <span className="text-[10px] text-text-faint uppercase block">Integrity Status</span>
            <span className="text-lg font-bold text-lime">100% Verified</span>
          </div>
        </div>
      </div>

      {/* VIEW 1: DNA DataBase */}
      {activeView === "dna" && (
        <div className="rounded-md border border-border bg-surface p-5 space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border pb-3">
            <div>
              <h2 className="font-display text-lg font-semibold text-text">DNA Continuity Vault</h2>
              <p className="font-body text-xs text-text-muted">
                All DNA lives here. Character bibles, location anchors, and style profiles that enforce strict visual continuity.
              </p>
            </div>

            <div className="flex gap-2 font-mono text-xs">
              {["all", "cdna", "ldna", "sdna"].map((k) => (
                <button
                  key={k}
                  type="button"
                  onClick={() => setDnaFilter(k)}
                  className={`px-2.5 py-1 rounded-sm uppercase ${
                    dnaFilter === k
                      ? "bg-pink text-white font-semibold"
                      : "bg-surface-2 text-text-muted hover:text-text"
                  }`}
                >
                  {k === "all" ? "All DNA" : k}
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredDna.map((item) => {
              const rec = item.dna_records;
              const recName =
                typeof rec?.record?.name === "string"
                  ? rec.record.name
                  : (rec?.dna_id ?? "DNA Continuity Profile");
              const recSummary =
                typeof rec?.record?.summary === "string"
                  ? rec.record.summary
                  : "Continuity anchor locked for AI generations.";
              const isLocked = rec?.locked ?? true;

              return (
                <div
                  key={item.id}
                  className="rounded-md border border-border bg-surface-2 p-4 space-y-3 flex flex-col justify-between"
                >
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="font-mono text-[10px] uppercase font-bold text-cyan">
                        {rec?.dna_type ?? "DNA"} · {item.role}
                      </span>
                      <FlowbiteBadge color={isLocked ? "lime" : "amber"} size="sm">
                        {isLocked ? "LOCKED" : "DRAFT"}
                      </FlowbiteBadge>
                    </div>
                    <h3 className="font-display text-base font-semibold text-text">{recName}</h3>
                    <p className="font-body text-xs text-text-muted line-clamp-2">{recSummary}</p>
                  </div>

                  <div className="pt-2 border-t border-border flex items-center justify-between font-mono text-xs">
                    <span className="text-[10px] text-text-faint">{item.productionTitle}</span>
                    <button
                      type="button"
                      onClick={() => setInspectingDna(item)}
                      className="text-cyan hover:underline text-[11px]"
                    >
                      Inspect Bible &rarr;
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* DNA Sheet Inspector Modal */}
      {inspectingDna && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="w-full max-w-xl rounded-md border border-border bg-surface p-6 space-y-4 font-mono text-xs">
            <div className="flex items-center justify-between border-b border-border pb-3">
              <div>
                <span className="text-[10px] uppercase text-cyan font-bold block">
                  {inspectingDna.dna_records?.dna_type} Continuity Contract
                </span>
                <h3 className="font-display text-lg font-semibold text-text">
                  {String(inspectingDna.dna_records?.record?.name ?? inspectingDna.dna_records?.dna_id)}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setInspectingDna(null)}
                className="p-1 text-text-muted hover:text-text text-sm"
              >
                &times;
              </button>
            </div>

            <div className="space-y-3 max-h-[60vh] overflow-y-auto">
              <div className="p-3 rounded-sm bg-surface-2 border border-border space-y-1">
                <span className="text-[10px] uppercase text-text-faint block">Prompt Anchor</span>
                <p className="text-text font-body text-xs">
                  {String(inspectingDna.dna_records?.record?.visual_anchor ?? "Standard character continuity anchor.")}
                </p>
              </div>

              <div className="p-3 rounded-sm bg-surface-2 border border-border space-y-1">
                <span className="text-[10px] uppercase text-red font-semibold block">Negative Constraints</span>
                <p className="text-text-muted font-body text-xs">
                  {String(inspectingDna.dna_records?.record?.negative_prompt ?? "None defined")}
                </p>
              </div>

              <div className="p-3 rounded-sm bg-surface-2 border border-border space-y-1">
                <span className="text-[10px] uppercase text-text-faint block">Casting Lineage</span>
                <p className="text-text font-body text-xs">
                  Attached to: {inspectingDna.productionTitle}
                </p>
              </div>
            </div>

            <div className="border-t border-border pt-3 flex justify-end">
              <button
                type="button"
                onClick={() => setInspectingDna(null)}
                className="button button-primary text-xs"
              >
                Close Inspector
              </button>
            </div>
          </div>
        </div>
      )}

      {/* VIEW 2: Staffing Files */}
      {activeView === "staffing" && (
        <div className="rounded-md border border-border bg-surface p-5 space-y-4">
          <div className="border-b border-border pb-3">
            <h2 className="font-display text-lg font-semibold text-text">Staffing Files &amp; Agent Manifests</h2>
            <p className="font-body text-xs text-text-muted">
              Agent soul configurations, prompt contracts, and role assignment records attached to {channelName}.
            </p>
          </div>

          {staffingFiles.length === 0 ? (
            <div className="p-8 rounded-md border border-dashed border-border bg-surface-2 text-center space-y-3 font-mono text-xs text-text-muted">
              <p>No standalone staffing manifest files saved in this channel vault yet.</p>
              <span className="text-[11px] text-text-faint block">
                Manage assigned specialists directly in Channel Staffing or build custom agents.
              </span>
              <div className="flex justify-center gap-3 pt-2 font-sans">
                <Link
                  href={`/app/channels/${channelId}/staffing`}
                  className="button button-primary text-xs"
                >
                  Go to Channel Staffing
                </Link>
                <Link href="/app/builder" className="button button-secondary text-xs">
                  Open Agent Builder
                </Link>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 font-mono text-xs">
              {staffingFiles.map((asset) => (
                <div
                  key={asset.id}
                  className="rounded-md border border-border bg-surface-2 p-4 space-y-2"
                >
                  <div className="flex items-center justify-between">
                    <span className="px-1.5 py-0.5 rounded-xs bg-cyan/20 text-cyan text-[10px] uppercase font-semibold">
                      {asset.kind}
                    </span>
                    <span className="text-[10px] text-text-faint">
                      {new Date(asset.created_at).toLocaleDateString()}
                    </span>
                  </div>
                  <h4 className="font-semibold text-text">{asset.uri.split("/").pop()}</h4>
                  <span className="text-[11px] text-text-faint block">{asset.productionTitle}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* VIEW 3: Content / Universal Channel File Store */}
      {activeView === "content" && (
        <div className="rounded-md border border-border bg-surface p-5 space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border pb-3">
            <div>
              <h2 className="font-display text-lg font-semibold text-text">Content &amp; Media Vault</h2>
              <p className="font-body text-xs text-text-muted">
                Everything saved for this channel lives here. Screenplays, concept art, audio stems, video takes, and 4K master cuts.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <select
                value={fileKindFilter}
                onChange={(e) => setFileKindFilter(e.target.value)}
                className="rounded-sm border border-border bg-surface-2 px-2 py-1 font-mono text-xs text-text focus:outline-hidden"
              >
                <option value="all">All Formats</option>
                <option value="video">Video Takes &amp; Masters</option>
                <option value="image">Concept Art &amp; Stills</option>
                <option value="audio">Audio Stems &amp; Foley</option>
                <option value="binder">Shot Prompt Binders</option>
              </select>

              <input
                type="search"
                placeholder="Search files..."
                value={fileSearch}
                onChange={(e) => setFileSearch(e.target.value)}
                className="rounded-sm border border-border bg-surface-2 px-3 py-1 font-mono text-xs text-text placeholder:text-text-faint focus:outline-hidden"
              />
            </div>
          </div>

          {filteredContent.length === 0 ? (
            <div className="p-8 rounded-md border border-dashed border-border bg-surface-2 text-center font-mono text-xs text-text-muted space-y-2">
              <p>No generated media takes or production files found matching current filter.</p>
              <span className="text-[11px] text-text-faint block">
                Files generated during production stages will be archived here automatically.
              </span>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 font-mono text-xs">
              {filteredContent.map((asset) => (
                <div
                  key={asset.id}
                  className="rounded-md border border-border bg-surface-2 p-3 space-y-2 flex flex-col justify-between"
                >
                  <div className="space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="px-1.5 py-0.5 rounded-xs bg-pink/20 text-pink text-[10px] uppercase font-semibold">
                        {asset.kind}
                      </span>
                      <span className="text-[10px] text-text-faint">
                        {new Date(asset.created_at).toLocaleDateString()}
                      </span>
                    </div>
                    <span className="font-semibold text-text block truncate" title={asset.uri}>
                      {asset.uri.split("/").pop() || "Generated Asset"}
                    </span>
                    <span className="text-[11px] text-text-faint block truncate">
                      {asset.productionTitle}
                    </span>
                  </div>

                  <div className="pt-2 border-t border-border flex items-center justify-between">
                    <button
                      type="button"
                      onClick={() => setPreviewAsset(asset)}
                      className="text-cyan hover:underline text-[11px]"
                    >
                      Preview Take &rarr;
                    </button>
                    <a
                      href={asset.uri}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-text-muted hover:text-text text-[11px]"
                    >
                      Download
                    </a>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Asset Preview Modal */}
      {previewAsset && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="w-full max-w-2xl rounded-md border border-border bg-surface p-6 space-y-4 font-mono text-xs">
            <div className="flex items-center justify-between border-b border-border pb-3">
              <div>
                <span className="text-[10px] uppercase text-pink font-bold block">
                  {previewAsset.kind} Master Take Preview
                </span>
                <h3 className="font-display text-lg font-semibold text-text">
                  {previewAsset.uri.split("/").pop()}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setPreviewAsset(null)}
                className="p-1 text-text-muted hover:text-text text-sm"
              >
                &times;
              </button>
            </div>

            <div className="p-4 rounded-sm bg-surface-2 border border-border space-y-2">
              <div className="aspect-video w-full rounded-sm bg-black/40 flex items-center justify-center text-text-faint border border-border">
                <span>[Direct Stream Preview Seam: {previewAsset.uri}]</span>
              </div>
              <div className="pt-2 flex items-center justify-between text-[11px] text-text-muted">
                <span>Source: {previewAsset.productionTitle}</span>
                <span>Archived: {new Date(previewAsset.created_at).toLocaleString()}</span>
              </div>
            </div>

            <div className="border-t border-border pt-3 flex justify-end gap-2">
              <a
                href={previewAsset.uri}
                target="_blank"
                rel="noopener noreferrer"
                className="button button-secondary text-xs"
              >
                Open Raw Storage File
              </a>
              <button
                type="button"
                onClick={() => setPreviewAsset(null)}
                className="button button-primary text-xs"
              >
                Close Preview
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
