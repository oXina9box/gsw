const LOCAL_ORIGIN = "https://local.invalid";

export function safeRedirectPath(value: string | null): string {
  if (!value?.startsWith("/") || value.startsWith("//")) return "/app";

  try {
    const target = new URL(value, LOCAL_ORIGIN);
    return target.origin === LOCAL_ORIGIN
      ? `${target.pathname}${target.search}${target.hash}`
      : "/app";
  } catch {
    return "/app";
  }
}
