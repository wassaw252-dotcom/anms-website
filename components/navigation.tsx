"use client";
import { useState } from "react";
import Link from "next/link";
import { Brand } from "./brand";
export function Navigation() {
  const [open, setOpen] = useState(false);
  return (
    <header className="navigation">
      <Brand />
      <nav
        aria-label="Main navigation"
        className={open ? "nav-links open" : "nav-links"}
      >
        {[
          ["Solutions", "solutions"],
          ["Capabilities", "capabilities"],
          ["How It Works", "how-it-works"],
          ["Work", "work"],
          ["About", "about"],
        ].map(([label, id]) => (
          <a key={id} href={`/#${id}`} onClick={() => setOpen(false)}>
            {label}
          </a>
        ))}
      </nav>
      <Link href="/discovery" className="button nav-cta">
        TRY US! <span aria-hidden="true">↗</span>
      </Link>
      <button
        className="menu-button"
        aria-label={open ? "Close menu" : "Open menu"}
        aria-expanded={open}
        onClick={() => setOpen(!open)}
      >
        {open ? "✕" : "☰"}
      </button>
    </header>
  );
}
