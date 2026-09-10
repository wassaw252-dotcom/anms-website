import { useId } from "react";

/** Geometric outlines keep the ANM’s identity independent of installed fonts. */
export function Wordmark() {
  const gold = useId();
  return (
    <svg className="wordmark" viewBox="0 0 480 120" role="img" aria-label="ANM’s">
      <defs>
        <linearGradient id={gold} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#8d6534" />
          <stop offset=".3" stopColor="#fff0c9" />
          <stop offset=".48" stopColor="#c69a55" />
          <stop offset=".64" stopColor="#f4d594" />
          <stop offset="1" stopColor="#896031" />
        </linearGradient>
      </defs>
      <g fill={`url(#${gold})`} stroke="#e3c38b" strokeWidth=".7" strokeLinejoin="bevel" style={{ filter: "drop-shadow(2px 3px 0 #5a3e20) drop-shadow(0 0 5px #d6a95c33)" }}>
        <path d="M6 111 64 9 84 9 142 111 115 111 74 37 33 111Z" />
        <path d="M64 65 69 83 87 88 69 93 64 110 59 93 43 88 59 83Z" />
        <path d="M146 111V9H169L235 77V9H259V111H236L170 44V111Z" />
        <path d="M270 111V9H295L332 58 369 9H394V111H370V47L332 94 294 47V111Z" />
        <path d="M407 33 413 8H431L416 33Z" />
        <path d="M475 43 465 61H432L425 68H457L472 82V96L457 111H404L414 93H449L455 87H424L408 73V59L424 43Z" />
      </g>
      <path d="M76 12 130 108M150 13 253 108M274 13 330 85M373 13 390 13" fill="none" stroke="#fff3ce" strokeWidth="1" opacity=".6" />
    </svg>
  );
}
