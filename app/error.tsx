"use client";
export default function ErrorPage({ reset }: { reset: () => void }) {
  return (
    <main id="main" className="legal wrap">
      <p className="eyebrow">ANM’s</p>
      <h1>Something interrupted this page.</h1>
      <p>
        Please try again. If you were completing discovery, your saved messages
        remain available in the same browser.
      </p>
      <button className="button gold" onClick={reset}>
        Try again
      </button>
    </main>
  );
}
