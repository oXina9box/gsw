export type SocialLink = { label: string; href?: string };

const hosts: Record<string, string[]> = { TIKTOK: ["tiktok.com", "www.tiktok.com"], YOUTUBE: ["youtube.com", "www.youtube.com"], INSTAGRAM: ["instagram.com", "www.instagram.com"], X: ["x.com", "www.x.com"], TELEGRAM: ["t.me", "telegram.me"], DISCORD: ["discord.com", "discord.gg"], FACEBOOK: ["facebook.com", "www.facebook.com"], GITHUB: ["github.com", "www.github.com"], GITLAB: ["gitlab.com", "www.gitlab.com"] };
export const configured = (key: string) => { const value = process.env[`NEXT_PUBLIC_SOCIAL_${key}`]; if (!value) return undefined; try { const url = new URL(value); return url.protocol === "https:" && !url.username && !url.password && hosts[key]?.includes(url.hostname) ? url.toString() : undefined; } catch { return undefined; } };

// Only publish destinations explicitly configured by the owner. Unknown profiles stay disabled.
export const socialLinks: SocialLink[] = [
  { label: "TikTok", href: configured("TIKTOK") },
  { label: "YouTube", href: configured("YOUTUBE") },
  { label: "Instagram", href: configured("INSTAGRAM") },
  { label: "X", href: configured("X") },
  { label: "Telegram", href: configured("TELEGRAM") },
  { label: "Discord", href: configured("DISCORD") },
  { label: "Facebook", href: configured("FACEBOOK") },
  { label: "GitHub", href: configured("GITHUB") || "https://github.com/oXina9box/gsw" },
  { label: "GitLab", href: configured("GITLAB") || "https://gitlab.com/oxina9box/gsw" },
];
