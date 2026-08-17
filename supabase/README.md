# Gem Studio Supabase

Future live-product database migrations for the Next.js application in `web/`.

Apply migrations to a development Supabase project before testing account creation. The migrations create private individual workspaces, workspace-scoped channels/productions, production events, the builder entities, versioned JSONB DNA records, GenPlay inventories, private asset metadata, Storage policies, and RLS.

Deploy `functions/delete-account/` with server-only secrets before enabling account deletion. The current repository demo data is intentionally not seeded. Examples/templates under `dna/` and `genplay/` are migration inputs only until explicitly classified and imported.
