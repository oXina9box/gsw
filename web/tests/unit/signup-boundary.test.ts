import { describe, expect, it } from "vitest";
import { evaluateSignupPolicy } from "../../lib/auth/signup-boundary";

describe("signup boundary operational gate", () => {
  it("blocks invite_only without invite", () => {
    const r = evaluateSignupPolicy({ signup: "invite_only" }, false);
    expect(r.allowed).toBe(false);
    expect(r.reason).toBe("invite_required");
  });
  it("allows invite_only with invite", () => {
    const r = evaluateSignupPolicy({ signup: "invite_only" }, true);
    expect(r.allowed).toBe(true);
  });
  it("disabled stays disabled even with invite", () => {
    const r = evaluateSignupPolicy({ signup: "disabled" }, true);
    expect(r.allowed).toBe(false);
  });
  it("enabled allows without invite", () => {
    const r = evaluateSignupPolicy({ signup: "enabled" }, false);
    expect(r.allowed).toBe(true);
  });
  it("maintenance blocks even when enabled", () => {
    const r = evaluateSignupPolicy({ signup: "enabled", maintenance: true }, false);
    expect(r.allowed).toBe(false);
    expect(r.reason).toBe("maintenance");
  });
});
