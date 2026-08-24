"use client";

export default function Error({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return <div className="shell reading-page">
    <h1>Something went wrong</h1>
    <p className="lede">{error.message}</p>
    <button className="button button-primary" onClick={reset}>Try again</button>
  </div>;
}
