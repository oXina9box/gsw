import { createClient } from "npm:@supabase/supabase-js@2";

const ALLOWED_ORIGINS = (() => {
  const supabaseUrl = Deno.env.get("SUPABASE_URL");
  return [...(supabaseUrl ? [new URL(supabaseUrl).origin] : []), "http://localhost:5173", "http://localhost:3000"];
})();
function headers(request: Request) {
  const h: Record<string, string> = {
    "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
    "Access-Control-Allow-Methods": "POST, OPTIONS",
  };
  const origin = request.headers.get("Origin");
  if (origin && ALLOWED_ORIGINS.includes(origin)) h["Access-Control-Allow-Origin"] = origin;
  if (origin) h["Vary"] = "Origin";
  return h;
}

Deno.serve(async (request) => {
  const cors = headers(request);
  if (request.method === "OPTIONS") return new Response("ok", { headers: cors });
  if (request.method !== "POST") return new Response("Method not allowed", { status: 405, headers: cors });
  const authorization = request.headers.get("Authorization");
  if (!authorization) return new Response("Unauthorized", { status: 401, headers: cors });

  const url = Deno.env.get("SUPABASE_URL");
  const publishableKey = Deno.env.get("SUPABASE_PUBLISHABLE_KEY") ?? Deno.env.get("SUPABASE_ANON_KEY");
  const secretKey = Deno.env.get("SUPABASE_SECRET_KEY") ?? Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
  if (!url || !publishableKey || !secretKey) return new Response("Function is not configured", { status: 500, headers: cors });

  const userClient = createClient(url, publishableKey, { global: { headers: { Authorization: authorization } } });
  const { data: { user }, error: userError } = await userClient.auth.getUser();
  if (userError || !user) return new Response("Unauthorized", { status: 401, headers: cors });

  const admin = createClient(url, secretKey);
  const { error } = await admin.auth.admin.deleteUser(user.id);
  if (error) return Response.json({ error: "Account deletion failed" }, { status: 500, headers: cors });
  return new Response(null, { status: 204, headers: cors });
});
