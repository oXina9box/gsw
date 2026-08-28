export const AGENT_SIX_FILES = [
  "role",
  "soul",
  "jobdescription",
  "skills",
  "memory",
  "user_content",
] as const;

export type AgentFileKey = (typeof AGENT_SIX_FILES)[number];

export interface AgentFilesRecord {
  agent_id?: string;
  role: string;
  soul: string;
  jobdescription: string;
  skills: string;
  memory: string;
  user_content: string;
}

export const PROTECTED_IP_MESSAGE = "Protected Configuration — Proprietary Studio Agent";
export const PROTECTED_IP_EXPLANATION = "Proprietary system files and internal agent prompts are sealed on the server and executed securely via protected inference.";

export interface SanitizedAgent {
  id: string;
  name: string;
  lane_id: string;
  agent_type: string;
  capabilities: string[];
  protected_config: boolean;
  recommended_tier?: "free" | "mid" | "quality" | null;
  model_tier_override?: "free" | "mid" | "quality" | null;
  files?: AgentFilesRecord | null;
}

/**
 * AT NO POINT DO WE TIP THE IP AGENT DETAILS.
 * If an agent is a protected catalog configuration, its internal files must NEVER
 * be transmitted to the browser or displayed in open edit fields.
 */
export function sanitizeAgentFiles(
  isProtected: boolean,
  files: AgentFilesRecord | null | undefined
): AgentFilesRecord {
  if (isProtected) {
    return {
      role: PROTECTED_IP_MESSAGE,
      soul: PROTECTED_IP_MESSAGE,
      jobdescription: PROTECTED_IP_MESSAGE,
      skills: PROTECTED_IP_MESSAGE,
      memory: PROTECTED_IP_MESSAGE,
      user_content: PROTECTED_IP_MESSAGE,
    };
  }

  return {
    agent_id: files?.agent_id,
    role: files?.role ?? "",
    soul: files?.soul ?? "",
    jobdescription: files?.jobdescription ?? "",
    skills: files?.skills ?? "",
    memory: files?.memory ?? "",
    user_content: files?.user_content ?? "",
  };
}

export function canEditAgentFiles(agent: { protected_config?: boolean | null }): boolean {
  return !agent.protected_config;
}

export function validateCustomAgentFiles(input: unknown): {
  valid: boolean;
  errors: string[];
  data?: AgentFilesRecord;
} {
  if (!input || typeof input !== "object") {
    return { valid: false, errors: ["Agent files must be an object"] };
  }

  const obj = input as Record<string, unknown>;
  const errors: string[] = [];
  const MAX_FILE_LENGTH = 30_000;

  const role = typeof obj.role === "string" ? obj.role.trim() : "";
  const soul = typeof obj.soul === "string" ? obj.soul.trim() : "";
  const jobdescription = typeof obj.jobdescription === "string" ? obj.jobdescription.trim() : "";
  const skills = typeof obj.skills === "string" ? obj.skills.trim() : "";
  const memory = typeof obj.memory === "string" ? obj.memory.trim() : "";
  const user_content = typeof obj.user_content === "string" ? obj.user_content.trim() : "";

  for (const [key, val] of [
    ["role", role],
    ["soul", soul],
    ["jobdescription", jobdescription],
    ["skills", skills],
    ["memory", memory],
    ["user_content", user_content],
  ]) {
    if (val.length > MAX_FILE_LENGTH) {
      errors.push(`File ${key} exceeds maximum length of ${MAX_FILE_LENGTH} characters`);
    }
  }

  if (errors.length > 0) {
    return { valid: false, errors };
  }

  return {
    valid: true,
    errors: [],
    data: {
      role,
      soul,
      jobdescription,
      skills,
      memory,
      user_content,
    },
  };
}
