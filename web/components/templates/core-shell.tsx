import type { ReactNode } from "react";

/** Core A wrapper for public/auth layouts. */
export function CoreA({ children, className = "" }: { children: ReactNode; className?: string }) {
  return <div className={`core-a ${className}`.trim()}>{children}</div>;
}

/** Core B wrapper for authenticated product/studio/account layouts. */
export function CoreB({ children, className = "" }: { children: ReactNode; className?: string }) {
  return <div className={`core-b ${className}`.trim()}>{children}</div>;
}
