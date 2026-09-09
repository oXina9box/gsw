"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { AuthForm } from "./auth-form";

export function AuthModal() {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const router = useRouter();

  const authParam = searchParams.get("auth");
  const paramMode = authParam === "signup" || authParam === "login" || authParam === "forgot" ? authParam : "signup";
  const [overrideMode, setOverrideMode] = useState<"login" | "signup" | "forgot" | null>(null);
  const mode = overrideMode ?? paramMode;

  const close = useCallback(() => {
    dialogRef.current?.close();
    setOverrideMode(null);
    if (searchParams.has("auth")) {
      const nextParams = new URLSearchParams(searchParams.toString());
      nextParams.delete("auth");
      const nextQuery = nextParams.toString();
      router.replace(nextQuery ? `${pathname}?${nextQuery}` : pathname, { scroll: false });
    }
  }, [pathname, router, searchParams]);

  useEffect(() => {
    if (authParam === "signup" || authParam === "login" || authParam === "forgot") {
      if (!dialogRef.current?.open) {
        dialogRef.current?.showModal();
      }
    } else {
      if (dialogRef.current?.open && !overrideMode) {
        dialogRef.current?.close();
      }
    }
  }, [authParam, overrideMode]);

  useEffect(() => {
    const handleOpen = (event: Event) => {
      const customEvent = event as CustomEvent<{ mode?: "login" | "signup" | "forgot" }>;
      setOverrideMode(customEvent.detail?.mode ?? "signup");
      dialogRef.current?.showModal();
    };
    window.addEventListener("open-auth-modal", handleOpen);
    return () => window.removeEventListener("open-auth-modal", handleOpen);
  }, []);

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;
    const onCancel = (e: Event) => {
      e.preventDefault();
      close();
    };
    dialog.addEventListener("cancel", onCancel);
    return () => dialog.removeEventListener("cancel", onCancel);
  }, [close]);
  return (
    <dialog
      ref={dialogRef}
      className="command-dialog auth-modal-dialog"
      aria-modal="true"
      aria-labelledby="auth-modal-title"
      onClick={(e) => {
        if (e.target === e.currentTarget) close();
      }}
    >
      <div className="dialog-topline">
        <span id="auth-modal-title">{mode === "signup" ? "Create Studio" : mode === "forgot" ? "Reset Password" : "Sign In"}</span>
        <button className="dialog-close" type="button" onClick={close} aria-label="Close dialog">×</button>
      </div>
      <div className="auth-modal-body">
        <div className="auth-modal-tabs">
          <button
            type="button"
            className={`auth-tab-btn ${mode === "signup" ? "is-active" : ""}`}
            onClick={() => setOverrideMode("signup")}
          >
            Create account
          </button>
          <button
            type="button"
            className={`auth-tab-btn ${mode === "login" ? "is-active" : ""}`}
            onClick={() => setOverrideMode("login")}
          >
            Sign in
          </button>
        </div>
        <AuthForm mode={mode} onModeChange={setOverrideMode} onSuccess={close} />
      </div>
    </dialog>
  );
}

export function openAuthModal(mode: "login" | "signup" | "forgot" = "signup") {
  if (typeof window !== "undefined") {
    window.dispatchEvent(new CustomEvent("open-auth-modal", { detail: { mode } }));
  }
}
