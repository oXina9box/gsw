# Legal document review

This review is an implementation and product-readiness checklist, not legal advice. A qualified attorney should approve the Privacy Policy and Terms of Service before they are published as final terms.

## Privacy Policy

### Changes made in the repository draft

- Replaced the inaccurate “password stored in hashed form” claim with language describing authentication-provider handling.
- Aligned the minimum-age statement with the Terms at 18 or the age of majority, whichever is higher.
- Removed the fixed thirty-day response promise and replaced it with the deadline required by applicable law.
- Added a reminder to address state-law opt-outs for sale, sharing, targeted advertising, and profiling.
- Clarified that product-improvement use must match the policy and disclosed controls.
- Added explicit placeholders for actual AI-provider training practices, retention periods, analytics providers, and request procedures.
- Kept the no-HIPAA/no-PHI boundary prominent and repeated it in the sensitive-data section.

### Required before launch

1. Replace `[DATE]` and identify the actual legal entity, address, privacy contact, and service URL.
2. Inventory every vendor that receives data, including Supabase, AI providers, storage, analytics, email, payments, support, and rendering vendors.
3. Confirm whether prompts, uploads, outputs, logs, or support data are retained by each vendor and whether provider training is disabled.
4. Publish a data-retention schedule and the account/workspace deletion and export behavior.
5. Decide whether analytics, cookies, or advertising technologies will be enabled and add the corresponding consent/opt-out flow.
6. Determine which U.S. state privacy laws apply and document verification, authorized-agent, appeal, and opt-out procedures.
7. Confirm international-transfer safeguards if users or vendors are outside the United States.
8. Replace generic security language with claims the team can substantiate operationally.

## Terms of Service

### Changes made in the repository draft

- Corrected the opening definition so Gem Studio is not ambiguously defined as both the Service and the operator.
- Made the age requirement consistent with the Privacy Policy.
- Narrowed the User Content license to operation, security, maintenance, support, and necessary provider processing.
- Added a direct statement that User Content is not used to train Gem Studio-owned models, while preserving the need to document third-party provider controls.
- Added reminders to finalize output rights, billing, termination/export behavior, and dispute terms.
- Converted pasted lettered lists to repository-friendly Markdown lists while preserving their meaning.

### Required before launch

1. Replace `[DATE]`, `[JURISDICTION]`, and identify the actual contracting entity, address, and notice email.
2. Decide whether the product is free, paid, subscription-based, usage-based, or a combination; then publish pricing, renewals, taxes, refunds, trials, cancellation, and payment terms.
3. State the intended commercial rights for AI outputs by plan and provider, including what happens when provider terms differ.
4. Decide whether users receive export access after cancellation or termination and how long content remains available.
5. Choose governing law, venue, arbitration/class-action treatment, and required consumer disclosures with counsel.
6. Add a copyright/DMCA reporting path if the service hosts user content.
7. Define moderation, abuse reporting, account suspension, and appeal processes so the enforcement language matches the actual product.
8. Review the liability cap and indemnity for the intended customer type and risk profile.
9. Add any beta, availability, service-level, team/workspace authority, or enterprise terms that will be promised by the product.

## Cross-document consistency checks

- The Privacy Policy says providers may process AI inputs; the Terms must continue to authorize that processing through the User Content license.
- The Privacy Policy says Gem Studio does not sell personal data; product analytics and integrations must be configured so the statement remains accurate under applicable definitions.
- The age rule is 18 or the age of majority, whichever is higher, in both drafts.
- Account deletion, content retention, exports, and third-party deletion requests must match the actual Supabase, Storage, Edge Function, and provider workflows.
- The public pages must remain marked as drafts until the placeholders are replaced and counsel approves publication.
