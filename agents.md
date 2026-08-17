# Agent Workflow

## Planning-first process

For requests that require product, UX, architecture, or implementation decisions:

1. Gather repository context and relevant research before making changes.
2. Interview the requester through multiple rounds of clarifying questions about non-obvious requirements, edge cases, preferences, constraints, and design decisions.
3. Write a detailed planning/specification document under `planning/`.
4. Do not make implementation changes while the request is still in the planning phase.
5. When the requester confirms the planning work is complete, move the finished planning documents into `planning/complete/`.
6. Only begin implementation in a later, explicitly authorized request.

## Finished planning documents

- `planning/complete/` contains plans and specifications that have completed the planning phase.
- Documents must be moved there rather than copied, so there is one authoritative version.
- Keep implementation code, generated assets, and unrelated documentation outside this folder unless specifically requested.

## Current project boundary

The current site/demo files may be used as reference material during planning, but they must not be treated as the finished live product architecture without explicit approval. Future plans must distinguish demo behavior from production requirements and must include migration or purge requirements where applicable.
