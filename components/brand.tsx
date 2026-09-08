import Link from "next/link";
export function Brand() {
  return (
    <Link href="/" className="brand" aria-label="ANM’s home">
      <span>
        ANM<span className="brand-apostrophe">’s</span>
      </span>
      <small>ADVANCING NEW MILESTONES</small>
    </Link>
  );
}
