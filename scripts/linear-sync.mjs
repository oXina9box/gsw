import fs from "fs";

const token = process.env.LINEAR_API_KEY || "";
const TEAM_ID = "68062d04-5683-41a2-b7b4-3573c1de9458";
const PROJECT_ID = "d8fa0d78-c402-4c55-ad72-5eff12e3ee68";
const STATE_TODO_ID = "c32cc3c3-bfdb-4495-8c07-50e18ec04417";

const LABELS = {
  "Difficulty: Easy": "8b595955-1952-4b77-a704-fdcf6375dea6",
  "Difficulty: Moderate": "2b65a939-12f0-4392-a2ba-bdbe7feb0955",
  "Difficulty: Hard": "6cc9f286-df2e-4d99-86f1-9c80c2bc974b",
  "Milestone: Dry Launch": "2db93e62-bd53-4cb4-898d-d2a54e1476fc",
  "Milestone: Full Launch": "3381b078-33f4-4866-a71e-3ea51cc5bccb",
  "Bug": "5ed047b1-8bfd-472b-b2e8-3d1d4673dc6f",
  "Improvement": "fc8c9417-67c8-4856-9bcf-ff717ba6fc9a",
  "Feature": "db179269-69dd-4cc9-aa65-d50a8a05e9d1"
};

const FINDING_DIFFICULTIES = {
  "S1": "Difficulty: Moderate",
  "S2": "Difficulty: Moderate",
  "S3": "Difficulty: Hard",
  "S4": "Difficulty: Easy",
  "S5": "Difficulty: Moderate",
  "RUNTIME-01": "Difficulty: Easy",
  "RUNTIME-02": "Difficulty: Hard",
  "RUNTIME-03": "Difficulty: Moderate",
  "RUNTIME-04": "Difficulty: Hard",
  "RUNTIME-05": "Difficulty: Easy",
  "RUNTIME-06": "Difficulty: Moderate",
  "PROC-001": "Difficulty: Moderate",
  "PROC-002": "Difficulty: Easy",
  "PROC-003": "Difficulty: Hard",
  "PROC-004": "Difficulty: Easy",
  "PROC-005": "Difficulty: Hard",
  "PROC-007": "Difficulty: Easy",
  "DEP-01": "Difficulty: Easy",
  "WEB-01": "Difficulty: Moderate",
  "WEB-02": "Difficulty: Moderate",
  "WEB-03": "Difficulty: Easy",
  "WEB-04": "Difficulty: Moderate",
  "WEB-05": "Difficulty: Moderate",
  "WEB-06": "Difficulty: Easy",
  "WEB-07": "Difficulty: Easy",
  "WEB-08": "Difficulty: Easy",
  "WEB-09": "Difficulty: Easy",
  "WEB-10": "Difficulty: Easy",
  "WEB-11": "Difficulty: Easy",
  "WEB-12": "Difficulty: Moderate"
};

async function linearGql(query, variables = {}, retries = 3) {
  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      const res = await fetch("https://api.linear.app/graphql", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": token
        },
        body: JSON.stringify({ query, variables })
      });
      const json = await res.json();
      if (json.errors) {
        throw new Error("Linear GraphQL error: " + JSON.stringify(json.errors));
      }
      return json.data;
    } catch (err) {
      if (attempt === retries) throw err;
      await new Promise(r => setTimeout(r, 1000 * attempt));
    }
  }
}

async function fetchAllIssues() {
  let issues = [];
  let hasNextPage = true;
  let endCursor = null;

  while (hasNextPage) {
    const data = await linearGql(`query($after: String) {
      team(id: "${TEAM_ID}") {
        issues(first: 100, after: $after) {
          pageInfo { hasNextPage endCursor }
          nodes {
            id
            identifier
            number
            title
            description
            priority
            state { id name }
            project { id name }
            parent { id identifier }
            labels { nodes { id name } }
          }
        }
      }
    }`, { after: endCursor });
    const conn = data.team.issues;
    issues.push(...conn.nodes);
    hasNextPage = conn.pageInfo.hasNextPage;
    endCursor = conn.pageInfo.endCursor;
  }
  return issues;
}

const mode = process.argv[2];

if (mode === "--check-deletions") {
  const issues = await fetchAllIssues();
  const deleted = [1, 2, 3, 4].filter(n => !issues.some(i => i.number === n));
  if (deleted.length === 4) {
    console.log("DELETIONS_VERIFIED: 4 deleted");
    process.exit(0);
  } else {
    console.log(`DELETIONS_UNMET: only ${deleted.length} deleted: ${deleted.join(",")}`);
    process.exit(1);
  }
}

if (mode === "--run-deletions") {
  const issues = await fetchAllIssues();
  const welcomeIssues = issues.filter(i => [1, 2, 3, 4].includes(i.number));
  for (const issue of welcomeIssues) {
    console.log(`Deleting ${issue.identifier}: ${issue.title}`);
    await linearGql(`mutation($id: String!) {
      issueDelete(id: $id) { success }
    }`, { id: issue.id });
  }
  console.log("Deletions complete.");
  process.exit(0);
}

if (mode === "--check-updates") {
  const issues = await fetchAllIssues();
  const updateTargets = ["UNI-11", "UNI-26", "UNI-27", "UNI-45", "UNI-47", "UNI-48"];
  const verified = [];

  for (const ident of updateTargets) {
    const issue = issues.find(i => i.identifier === ident);
    if (!issue) {
      console.error(`Missing target issue: ${ident}`);
      process.exit(1);
    }
    const hasAuditMarker = issue.description && issue.description.includes("Audit: 2026-09-08");
    if (hasAuditMarker) {
      verified.push(ident);
    }
  }

  if (verified.length === 6) {
    console.log("UPDATES_VERIFIED: 6 updated");
    process.exit(0);
  } else {
    console.log(`UPDATES_UNMET: ${verified.length}/6 updated: ${verified.join(",")}`);
    process.exit(1);
  }
}

if (mode === "--run-updates") {
  const payloads = JSON.parse(fs.readFileSync(".unlazy/repo-audit-2026-09-08/linear-payloads.json", "utf8"));
  const updates = payloads.filter(p => p.args.id);
  const issues = await fetchAllIssues();

  for (const update of updates) {
    const ident = update.args.id;
    const issue = issues.find(i => i.identifier === ident);
    if (!issue) {
      throw new Error(`Issue ${ident} not found`);
    }

    if (issue.description && issue.description.includes("Audit: 2026-09-08")) {
      console.log(`${ident} already has audit update. Skipping.`);
      continue;
    }

    console.log(`Updating ${ident} (${update.finding})...`);
    const appendText = update.args.patch?.[0]?.text || update.args.description || "";
    const newDescription = (issue.description ? issue.description.trim() : "") + "\n\n" + appendText.trim();
    // Preserve existing labels and add difficulty label if not present
    const diffLabelName = FINDING_DIFFICULTIES[update.finding];
    const existingLabelIds = issue.labels?.nodes?.map(l => l.id) || [];
    const targetLabelId = LABELS[diffLabelName];
    const newLabelIds = Array.from(new Set([...existingLabelIds, targetLabelId].filter(Boolean)));

    await linearGql(`mutation($id: String!, $input: IssueUpdateInput!) {
      issueUpdate(id: $id, input: $input) {
        success
        issue { id identifier }
      }
    }`, {
      id: issue.id,
      input: {
        description: newDescription,
        labelIds: newLabelIds,
        priority: update.args.priority
      }
    });
    console.log(`Updated ${ident}`);
  }
  console.log("Updates complete.");
  process.exit(0);
}

if (mode === "--check-creations") {
  const issues = await fetchAllIssues();
  const payloads = JSON.parse(fs.readFileSync(".unlazy/repo-audit-2026-09-08/linear-payloads.json", "utf8"));
  const creations = payloads.filter(p => !p.args.id);

  const verified = [];
  for (const c of creations) {
    const match = issues.find(i => i.title.trim().toLowerCase() === c.args.title.trim().toLowerCase() || (i.description && i.description.includes(`Finding: ${c.finding}.`)));
    if (match) {
      verified.push({ finding: c.finding, identifier: match.identifier });
    }
  }

  if (verified.length === 24) {
    console.log("CREATIONS_VERIFIED: 24 created");
    process.exit(0);
  } else {
    console.log(`CREATIONS_UNMET: ${verified.length}/24 verified`);
    process.exit(1);
  }
}

if (mode === "--run-creations") {
  const payloads = JSON.parse(fs.readFileSync(".unlazy/repo-audit-2026-09-08/linear-payloads.json", "utf8"));
  const creations = payloads.filter(p => !p.args.id);
  const issues = await fetchAllIssues();

  // Map parent identifier like "UNI-36" to Linear parent UUID
  const idMap = new Map();
  for (const i of issues) {
    idMap.set(i.identifier, i.id);
  }

  for (const c of creations) {
    const existing = issues.find(i => i.title.trim().toLowerCase() === c.args.title.trim().toLowerCase() || (i.description && i.description.includes(`Finding: ${c.finding}.`)));
    if (existing) {
      console.log(`Finding ${c.finding} already exists as ${existing.identifier}. Skipping.`);
      continue;
    }

    console.log(`Creating ${c.finding}: ${c.args.title}...`);

    // Prepare label IDs
    const diffLabelName = FINDING_DIFFICULTIES[c.finding];
    const labelNames = [...(c.args.labels || []), diffLabelName].filter(Boolean);
    const labelIds = Array.from(new Set(labelNames.map(name => LABELS[name]).filter(Boolean)));

    let parentId = undefined;
    if (c.args.parentId) {
      parentId = idMap.get(c.args.parentId);
      if (!parentId) {
        console.warn(`Parent ${c.args.parentId} not found for ${c.finding}`);
      }
    }

    const res = await linearGql(`mutation($input: IssueCreateInput!) {
      issueCreate(input: $input) {
        success
        issue { id identifier title }
      }
    }`, {
      input: {
        teamId: TEAM_ID,
        projectId: PROJECT_ID,
        title: c.args.title,
        description: c.args.description,
        priority: c.args.priority,
        stateId: STATE_TODO_ID,
        labelIds: labelIds,
        parentId: parentId
      }
    });

    const newIssue = res.issueCreate.issue;
    console.log(`Created ${newIssue.identifier} for ${c.finding}`);
    idMap.set(newIssue.identifier, newIssue.id);
  }
  console.log("Creations complete.");
  process.exit(0);
}

if (mode === "--verify-all") {
  const issues = await fetchAllIssues();
  const payloads = JSON.parse(fs.readFileSync(".unlazy/repo-audit-2026-09-08/linear-payloads.json", "utf8"));

  let syncedCount = 0;
  const missing = [];

  for (const p of payloads) {
    if (p.args.id) {
      // update
      const issue = issues.find(i => i.identifier === p.args.id);
      if (issue && issue.description && issue.description.includes("Audit: 2026-09-08") && issue.description.includes(`Finding: ${p.finding}.`)) {
        syncedCount++;
      } else {
        missing.push({ finding: p.finding, target: p.args.id });
      }
    } else {
      // creation
      const issue = issues.find(i => i.title.trim().toLowerCase() === p.args.title.trim().toLowerCase() || (i.description && i.description.includes(`Finding: ${p.finding}.`)));
      if (issue) {
        syncedCount++;
      } else {
        missing.push({ finding: p.finding, title: p.args.title });
      }
    }
  }

  if (syncedCount === 30 && missing.length === 0) {
    console.log("AUDIT_SYNC_VERIFIED: 30/30 findings synced");
    process.exit(0);
  } else {
    console.log(`AUDIT_SYNC_UNMET: ${syncedCount}/30 synced. Missing: ${JSON.stringify(missing)}`);
    process.exit(1);
  }
}

console.log("Unknown mode: " + mode);
process.exit(1);
