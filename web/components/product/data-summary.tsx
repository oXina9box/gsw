type SummaryValue = number | "—";

export function DataSummary({ channels, productions, dna, assets }: { channels: SummaryValue; productions: SummaryValue; dna: SummaryValue; assets: SummaryValue }) { return <div className="stats-grid">{[[channels, "Channels"], [productions, "Productions"], [dna, "DNA records"], [assets, "Generated assets"]].map(([value, label]) => <div className="stat" key={String(label)}><strong>{value}</strong><span>{label}</span></div>)}</div>; }
