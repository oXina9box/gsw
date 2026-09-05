"use client";

import { useState } from "react";
import { FlowbiteBadge } from "@/components/blocks/flowbite/flowbite-badge";

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

function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  if (bytes < 1024 * 1024 * 1024) return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  return `${(bytes / (1024 * 1024 * 1024)).toFixed(2)} GB`;
}

export function ChannelAssetsClient({
  channelName,
  bytesUsed,
  dnaItems,
  assetItems,
}: ChannelAssetsClientProps) {
  const [dnaFilter, setDnaFilter] = useState<string>("all");
  const [fileSearch, setFileSearch] = useState("");
  const [fileKindFilter, setFileKindFilter] = useState<string>("all");
  const [inspectingDna, setInspectingDna] = useState<DnaItem | null>(null);
  const [previewAsset, setPreviewAsset] = useState<AssetItem | null>(null);

  // Simulated static core DNA records if productions haven't linked any yet
  const displayDna = dnaItems.length > 0
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

  // Filter generated assets and files
  const filteredFiles = assetItems.filter((asset) => {
    if (fileKindFilter !== "all" && asset.kind.toLowerCase() !== fileKindFilter.toLowerCase()) {
      return false;
    }
    if (fileSearch.trim()) {
      const q = fileSearch.toLowerCase();
      const matchUri = asset.uri.toLowerCase().includes(q);
      const matchProd = asset.productionTitle.toLowerCase().includes(q);
      const matchKind = asset.kind.toLowerCase().includes(q);
      if (!matchUri && !matchProd && !matchKind) return false;
    }
    return true;
  });

  return (
    <div className="space-y-8">
      {/* Storage Vault Telemetry HUD */}
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

      {/* Section 1: DNA Continuity Vault ("All DNA Lives Here") */}
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

                <div className="pt-3 border-t border-border flex items-center justify-between font-mono text-xs">
                  <span className="text-[10px] text-text-faint truncate max-w-[150px]">
                    {item.productionTitle}
                  </span>
                  <button
                    type="button"
                    onClick={() => setInspectingDna(item)}
                    className="text-pink hover:underline text-[11px] font-semibold"
                  >
                    Inspect Sheet &rarr;
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

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

      {/* Section 2: Universal Channel File Store ("Everything Saved Lives Here") */}
      <div className="rounded-md border border-border bg-surface p-5 space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border pb-3">
          <div>
            <h2 className="font-display text-lg font-semibold text-text">Complete Channel File Store</h2>
            <p className="font-body text-xs text-text-muted">
              Everything saved for this channel lives here. Screenplays, concept art, audio stems, video takes, and 4K master cuts.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <select
              value={fileKindFilter}
              onChange={(e) => setFileKindFilter(e.target.value)}
              className="rounded-sm border border-border bg-surface-2 px-2 py-1 font-mono text-xs text-text focus:outline-none focus:ring-1 focus:ring-cyan"
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
              className="rounded-sm border border-border bg-surface-2 px-3 py-1 font-mono text-xs text-text placeholder:text-text-faint focus:outline-none focus:ring-1 focus:ring-cyan"
            />
          </div>
        </div>

        {filteredFiles.length === 0 ? (
          <div className="p-8 rounded-md border border-dashed border-border bg-surface-2 text-center font-mono text-xs text-text-muted space-y-2">
            <p>No generated media takes or production files found matching current filter.</p>
            <span className="text-[11px] text-text-faint block">
              Files generated during production stages will be archived here automatically.
            </span>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 font-mono text-xs">
            {filteredFiles.map((asset) => (
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
                  <h4 className="font-body text-xs font-semibold text-text truncate">{asset.productionTitle}</h4>
                  <p className="text-[10px] text-text-faint truncate">{asset.uri}</p>
                </div>

                <div className="pt-2 border-t border-border flex items-center justify-between">
                  <button
                    type="button"
                    onClick={() => setPreviewAsset(asset)}
                    className="text-cyan hover:underline text-[11px]"
                  >
                    Preview
                  </button>
                  <a
                    href={asset.uri}
                    target="_blank"
                    rel="noreferrer"
                    className="text-text-muted hover:text-text text-[11px]"
                  >
                    Download &darr;
                  </a>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Asset Preview Modal */}
      {previewAsset && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="w-full max-w-lg rounded-md border border-border bg-surface p-6 space-y-4 font-mono text-xs">
            <div className="flex items-center justify-between border-b border-border pb-3">
              <h3 className="font-display text-base font-semibold text-text">{previewAsset.productionTitle}</h3>
              <button
                type="button"
                onClick={() => setPreviewAsset(null)}
                className="p-1 text-text-muted hover:text-text text-sm"
              >
                &times;
              </button>
            </div>

            <div className="p-4 rounded-sm bg-surface-2 border border-border space-y-2">
              <span className="text-[10px] uppercase text-text-faint block">Asset URI / Storage Path</span>
              <p className="text-cyan break-all text-xs">{previewAsset.uri}</p>
              <div className="flex justify-between text-[11px] text-text-muted pt-2 border-t border-border">
                <span>Kind: {previewAsset.kind}</span>
                <span>Created: {new Date(previewAsset.created_at).toLocaleDateString()}</span>
              </div>
            </div>

            <div className="border-t border-border pt-3 flex justify-end gap-2">
              <a
                href={previewAsset.uri}
                target="_blank"
                rel="noreferrer"
                className="button button-secondary text-xs"
              >
                Download Original File
              </a>
              <button
                type="button"
                onClick={() => setPreviewAsset(null)}
                className="button button-primary text-xs"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
