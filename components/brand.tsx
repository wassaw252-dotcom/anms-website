import Link from "next/link";
import { Wordmark } from "./wordmark";
export function Brand({ engineered = false }: { engineered?: boolean }) {
  return (
    <Link href="/" className="brand" aria-label="ANM’s home">
      {engineered ? <Wordmark /> : <span>
        ANM<span className="brand-apostrophe">’s</span>
      </span>}
      <small>ADVANCING NEW MILESTONES</small>
    </Link>
  );
}
