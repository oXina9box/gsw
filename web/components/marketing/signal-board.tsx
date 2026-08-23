"use client";

import { useState } from "react";

import { filterSignals } from "./signal-filter.mjs";

const signals = [
  { type: "native" as const, label: "Native cut", number: "01", title: "Seven seconds of atmosphere.", body: "A vertical opening built from the film’s visual tension—not a flattened summary.", tag: "9:16 / 00:07", tone: "cyan" },
  { type: "conversation" as const, label: "Conversation", number: "02", title: "Ask what the frame leaves open.", body: "A prompt that invites a point of view, ready for review before publishing.", tag: "prompt / review", tone: "pink" },
  { type: "native" as const, label: "Next signal", number: "03", title: "Keep what the audience notices.", body: "Performance and conversation become private inputs for the next brief.", tag: "feedback / loop", tone: "lime" },
] as const;

type Filter = "all" | "native" | "conversation";

export function SignalBoard() {
  const [filter, setFilter] = useState<Filter>("all");
  const visibleSignals = filterSignals(signals, filter);

  return <div className="signal-board" id="social-board">
    <div className="board-topline"><span>Signal board / sample loop</span><span>{String(visibleSignals.length).padStart(2, "0")} cards</span></div>
    <div className="signal-tabs" role="group" aria-label="Filter sample signal cards">
      {([['all', 'All'], ['native', 'Native cut'], ['conversation', 'Conversation']] as const).map(([value, label]) => <button className={`signal-tab ${filter === value ? "is-active" : ""}`} type="button" aria-pressed={filter === value} onClick={() => setFilter(value)} key={value}>{label}</button>)}
    </div>
    <p className="board-status" aria-live="polite">Showing {visibleSignals.length} signal card{visibleSignals.length === 1 ? "" : "s"}</p>
    <div className="board-cards">
      {visibleSignals.map((signal) => <article className="board-card" key={signal.number}>
        <div className="board-card-top"><span>{signal.label}</span><span>{signal.number}</span></div>
        <h4>{signal.title}</h4><p>{signal.body}</p>
        <div className="board-card-foot"><span className={`board-tag tag-${signal.tone}`}>{signal.tag}</span><span className="board-arrow" aria-hidden="true">↗</span></div>
      </article>)}
    </div>
  </div>;
}
