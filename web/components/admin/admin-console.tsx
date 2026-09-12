import { PrelineCard } from "@/components/blocks/preline/preline-card";
import { ContentEditor } from "@/components/admin/content-editor";
import { AccountReview } from "@/components/admin/account-review";
import { ModerationReview } from "@/components/admin/moderation-review";
type AdminRecord = Record<string, string | number | null | undefined>;
export function AdminConsole({ items, revisions, reviews = [] }: { items: AdminRecord[]; revisions: AdminRecord[]; reviews?: AdminRecord[] }) {
  return <div className="space-y-4" data-admin-console>
    <PrelineCard kicker="Editorial" title="Site content" subtitle="Latest 50 items. Saves and restores create drafts; publish separately.">
      <div className="space-y-4">
        <details><summary className="cursor-pointer font-semibold text-cyan">Create content</summary><ContentEditor /></details>
        {!items.length && <p>No saved editorial content.</p>}
        {items.map((item) => <details key={String(item.id)}><summary className="cursor-pointer">{String(item.title)} · {String(item.status)} · revision {String(item.revision)}</summary><div className="pt-4"><ContentEditor item={item} revisions={revisions.filter((revision) => revision.content_id === item.id)} /></div></details>)}
      </div>
    </PrelineCard>
    <div className="grid items-start gap-4 xl:grid-cols-2">
      <PrelineCard kicker="Accounts" title="Account lookup" subtitle="Search email or ID. Basic summaries only."><AccountReview /></PrelineCard>
      <PrelineCard kicker="Moderation" title="Review decision" subtitle="Reasons are audited. Duplicate confirmation never merges accounts."><ModerationReview /></PrelineCard>
    </div>
    <PrelineCard kicker="History" title="Latest review decisions" subtitle="Latest 50 decisions. Release or restore explicitly reverses restrictions.">
      {!reviews.length ? <p>No review decisions recorded.</p> : <ul className="space-y-3">{reviews.map((review) => <li className="border-b border-border pb-3 text-sm" key={String(review.id)}><p>{review.target_kind} · <code className="break-all">{review.target_id}</code> · {review.outcome}</p><p className="text-text-muted">{review.reason}</p><time className="text-xs text-text-faint">{review.created_at}</time></li>)}</ul>}
    </PrelineCard>
  </div>;
}
