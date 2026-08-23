import { describe, expect, it } from "vitest";
import { authorizeSignup } from "./signup-boundary";

describe("F03 signup boundary", () => {
  it("RED: direct anonymous provider signup needs an approved invite and exact callback", () => {
    expect(authorizeSignup({ mode: "disabled", invite: null, callback: "/auth/callback" }).reason).toBe("signup_disabled");
    expect(authorizeSignup({ mode: "invite_only", invite: null, callback: "/auth/callback" }).reason).toBe("invite_required");
    expect(authorizeSignup({ mode: "invite_only", invite: { email: "a@example.com", audience: "account", expiresAt: "2999-01-01T00:00:00Z" }, callback: "https://evil.example" }).reason).toBe("invalid_callback");
    expect(authorizeSignup({ mode: "invite_only", invite: { email: "a@example.com", audience: "account", expiresAt: "2999-01-01T00:00:00Z" }, callback: "/auth/callback" }).allowed).toBe(true);
  });
});
