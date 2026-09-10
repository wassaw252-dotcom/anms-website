import Link from "next/link";
export default function NotFound() {
  return (
    <main id="main" className="legal wrap">
      <p className="eyebrow">ANM’s / 404</p>
      <h1>This page isn’t here.</h1>
      <p>Return to ANM’s to find what you need.</p>
      <Link href="/" className="button gold">
        Back to ANM’s ↗
      </Link>
    </main>
  );
}
