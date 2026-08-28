import { createServerClient } from "@supabase/ssr";
import { createClient as createSupabaseAdminClient } from "@supabase/supabase-js";
import type { BrowserContext, Page } from "@playwright/test";

export type StagingAuthConfig = {
  supabaseUrl: string;
  supabaseAnonKey: string;
  serviceRoleKey?: string;
  testEmail: string;
  testPassword: string;
};

export type AuthCookie = {
  name: string;
  value: string;
  url?: string;
  domain?: string;
  path?: string;
  expires?: number;
  httpOnly?: boolean;
  secure?: boolean;
  sameSite?: "Lax" | "Strict" | "None";
};

export type AuthSessionData = {
  session: {
    access_token: string;
    refresh_token: string;
    expires_at?: number;
    user: unknown;
  };
  user: unknown;
  cookies: AuthCookie[];
};

// In-memory cache for session reuse across tests within same process
const sessionCache = new Map<string, AuthSessionData>();

export function getStagingSupabaseConfig(): StagingAuthConfig | null {
  const supabaseUrl = process.env.STAGING_SUPABASE_URL ?? process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey =
    process.env.STAGING_SUPABASE_ANON_KEY ??
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ??
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseAnonKey) {
    return null;
  }

  const serviceRoleKey =
    process.env.STAGING_SUPABASE_SERVICE_ROLE_KEY ??
    process.env.SUPABASE_SERVICE_ROLE_KEY ??
    process.env.SUPABASE_SECRET_KEY;

  const testEmail = process.env.STAGING_TEST_EMAIL ?? "e2e-staging-user@gemstudio.test";
  const testPassword = process.env.STAGING_TEST_PASSWORD ?? "StagingPassword123!_e2e";

  return {
    supabaseUrl,
    supabaseAnonKey,
    serviceRoleKey,
    testEmail,
    testPassword,
  };
}

export function isStagingConfigured(): boolean {
  return getStagingSupabaseConfig() !== null;
}

export function clearAuthSessionCache(): void {
  sessionCache.clear();
}

export async function getOrCreateAuthenticatedSession(
  credentials?: { email?: string; password?: string },
): Promise<AuthSessionData> {
  const config = getStagingSupabaseConfig();
  if (!config) {
    throw new Error(
      "Staging Supabase is not configured. Set STAGING_SUPABASE_URL and STAGING_SUPABASE_ANON_KEY.",
    );
  }

  const email = credentials?.email ?? config.testEmail;
  const password = credentials?.password ?? config.testPassword;
  const cacheKey = `${config.supabaseUrl}:${email}`;

  // Session reuse: check in-memory cache and verify expiry
  const cached = sessionCache.get(cacheKey);
  if (cached?.session?.expires_at) {
    const expiresAtMs = cached.session.expires_at * 1000;
    if (expiresAtMs - Date.now() > 60_000) {
      return cached;
    }
  }

  const cookieJar = new Map<string, { name: string; value: string; options?: Record<string, unknown> }>();
  const supabase = createServerClient(config.supabaseUrl, config.supabaseAnonKey, {
    cookies: {
      getAll() {
        return Array.from(cookieJar.values()).map((c) => ({ name: c.name, value: c.value }));
      },
      setAll(cookiesToSet) {
        for (const cookie of cookiesToSet) {
          cookieJar.set(cookie.name, cookie);
        }
      },
    },
  });

  const { data: signInData, error } = await supabase.auth.signInWithPassword({ email, password });
  let data = signInData;

  if (error || !data.session) {
    // Attempt signup if user does not exist
    const signUpResult = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { display_name: "Staging E2E User" },
      },
    });

    if (signUpResult.error) {
      throw new Error(`Failed to authenticate test user (${email}): ${signUpResult.error.message}`);
    }

    if (signUpResult.data.session) {
      data = { session: signUpResult.data.session, user: signUpResult.data.user! };
    } else if (config.serviceRoleKey && signUpResult.data.user?.id) {
      // Auto-confirm via admin client when confirmation is required
      const adminClient = createSupabaseAdminClient(config.supabaseUrl, config.serviceRoleKey, {
        auth: { persistSession: false, autoRefreshToken: false },
      });
      await adminClient.auth.admin.updateUserById(signUpResult.data.user.id, {
        email_confirm: true,
      });
      const retry = await supabase.auth.signInWithPassword({ email, password });
      if (retry.error || !retry.data.session) {
        throw new Error(`Failed to sign in after confirming user: ${retry.error?.message}`);
      }
      data = { session: retry.data.session, user: retry.data.user! };
    } else {
      throw new Error(`User created for ${email} but session was not returned. Ensure email confirmation is handled.`);
    }
  }

  const cookies: AuthCookie[] = Array.from(cookieJar.values()).map(({ name, value, options }) => {
    const maxAge = typeof options?.maxAge === "number" ? options.maxAge : undefined;
    return {
      name,
      value,
      path: typeof options?.path === "string" ? options.path : "/",
      httpOnly: typeof options?.httpOnly === "boolean" ? options.httpOnly : false,
      secure: typeof options?.secure === "boolean" ? options.secure : false,
      sameSite: (options?.sameSite as "Lax" | "Strict" | "None") ?? "Lax",
      expires: maxAge ? Math.floor(Date.now() / 1000) + maxAge : undefined,
    };
  });

  const sessionData: AuthSessionData = {
    session: {
      access_token: data.session.access_token,
      refresh_token: data.session.refresh_token,
      expires_at: data.session.expires_at,
      user: data.user,
    },
    user: data.user,
    cookies,
  };

  sessionCache.set(cacheKey, sessionData);
  return sessionData;
}

export async function authenticateBrowserContext(
  context: BrowserContext,
  baseURL: string,
  credentials?: { email?: string; password?: string },
): Promise<AuthSessionData> {
  const authData = await getOrCreateAuthenticatedSession(credentials);
  const hostname = new URL(baseURL).hostname;

  const isLocal = hostname === "127.0.0.1" || hostname === "localhost";
  const playwrightCookies = authData.cookies.map((c) => ({
    name: c.name,
    value: c.value,
    // Playwright accepts url XOR (domain+path); url derives domain/path itself.
    ...(isLocal ? { url: baseURL } : { domain: hostname, path: c.path ?? "/" }),
    expires: c.expires,
    httpOnly: c.httpOnly ?? false,
    secure: c.secure ?? false,
    sameSite: normalizeSameSite(c.sameSite),
  }));

  await context.addCookies(playwrightCookies);
  return authData;
}

function normalizeSameSite(value: string | undefined): "Strict" | "Lax" | "None" {
  const normalized = value?.toLowerCase();
  if (normalized === "strict") return "Strict";
  if (normalized === "none") return "None";
  return "Lax";
}

export async function authenticatePage(
  page: Page,
  options?: {
    destination?: string;
    credentials?: { email?: string; password?: string };
    baseURL?: string;
  },
): Promise<AuthSessionData> {
  const targetBaseURL =
    options?.baseURL ??
    process.env.PLAYWRIGHT_TEST_BASE_URL ??
    (page.context() as unknown as { _options?: { baseURL?: string } })._options?.baseURL ??
    (process.env.PORT ? `http://localhost:${process.env.PORT}` : "http://localhost:8080");

  const authData = await authenticateBrowserContext(page.context(), targetBaseURL, options?.credentials);

  if (options?.destination) {
    await page.goto(options.destination);
  }

  return authData;
}
