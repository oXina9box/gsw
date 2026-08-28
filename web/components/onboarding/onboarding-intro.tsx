"use client";

import { useEffect, useRef } from "react";
import { ONBOARDING_STEP_META } from "@/lib/studio/onboarding";

export function OnboardingIntro({ step }: { step: string }) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (step === "identity" && !dialogRef.current?.open) {
      dialogRef.current?.showModal();
    }
  }, [step]);

  const close = () => dialogRef.current?.close();

  return <>
    <button ref={triggerRef} className="text-link onboarding-intro-trigger" type="button" onClick={() => dialogRef.current?.showModal()}>How does setup work?</button>
    <dialog className="command-dialog onboarding-intro-dialog" ref={dialogRef} aria-modal="true" aria-labelledby="onboarding-intro-title" onClick={(event) => { if (event.target === event.currentTarget) close(); }} onClose={() => triggerRef.current?.focus()}>
      <div className="dialog-topline"><span id="onboarding-intro-title">How studio setup works</span><button className="dialog-close" type="button" onClick={close} aria-label="Close setup overview">×</button></div>
      <div className="onboarding-intro-body">
        <p>Gem Studio is a configurable AI film studio. Setup walks the studio spine once, guided, and teaches how lanes operate while you configure them — onboarding and lane education are the same event.</p>
        <ol className="onboarding-intro-steps">
          {ONBOARDING_STEP_META.map(({ step: id, label, summary }, index) => <li key={id} aria-current={id === step ? "step" : undefined}><span className="onboarding-intro-index">{String(index + 1).padStart(2, "0")}</span><div><strong>{label}</strong><p>{summary}</p></div></li>)}
        </ol>
        <p className="muted">Lanes are working teams of agents. A forward-facing lane passes work down a chain; a round table revises in pass order. You choose guided assistance (the assistant suggests) or fast mode (the assistant confirms and files). Every step saves server-side and can be resumed.</p>
      </div>
      <div className="onboarding-intro-actions"><button className="button button-primary" type="button" onClick={close}>Start setup</button></div>
    </dialog>
  </>;
}
