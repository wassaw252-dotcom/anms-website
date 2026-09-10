"use client";
import { useState, useEffect, useSyncExternalStore } from "react";
import { useRouter } from "next/navigation";
import { motion, useReducedMotion } from "framer-motion";
import Link from "next/link";
import { Wordmark } from "../wordmark";
import { ApprovedBackground } from "./approved-background";
const subscribe = () => () => {};
const getSnapshot = () => {
  try {
    return sessionStorage.getItem("anm-visited") === "yes";
  } catch {
    return true;
  }
};
export function Hero() {
  const [active, setActive] = useState(false),
    [entering, setEntering] = useState(false);
  const router = useRouter();
  const reduced = useReducedMotion();
  const returning = useSyncExternalStore(subscribe, getSnapshot, () => false);
  useEffect(() => {
    try {
      sessionStorage.setItem("anm-visited", "yes");
    } catch {}
    router.prefetch("/discovery");
  }, [router]);
  useEffect(() => {
    if (!entering) return;
    const timer = setTimeout(
      () => router.push("/discovery"),
      reduced ? 0 : 850,
    );
    return () => clearTimeout(timer);
  }, [entering, reduced, router]);
  const delay = reduced || returning ? 0 : 0.25;
  return (
    <section
      className={`hero approved-hero ${active ? "cta-active" : ""} ${entering ? "entering" : ""}`}
      aria-labelledby="hero-title"
    >
      <ApprovedBackground />
      <div className="hero-side left">
        <span>
          PEOPLE
          <br />
          IDEAS
          <br />
          SYSTEMS
        </span>
        <i />
        <span>
          A BRIGHTER
          <br />
          TOMORROW
        </span>
      </div>
      <div className="hero-side right">
        <span>
          BUILD<br />AUTOMATE<br />SIMPLIFY<br />SCALE<br />TOGETHER
        </span>
        <i />
        <span>
          REAL<br />PROBLEMS<br />PRACTICAL<br />SOLUTIONS<br />LASTING<br />PROGRESS
        </span>
      </div>
      <div className="hero-coordinate" aria-hidden="true">01.5503° N<br />103.8198° E</div>
      <div className="hero-possibilities" aria-hidden="true">FROM<br />PROBLEMS<br />TO<br />POSSIBILITIES</div>
      <div className="hero-marker" aria-hidden="true">01<hr /><span>02</span><span>03</span><span>04</span><span>05</span></div>
      <div className="hero-system-label" aria-hidden="true">{"// SYSTEMS"}<br />{"// PEOPLE"}<br />{"// PROGRESS"}</div>
      <motion.div
        className="core-brand"
        initial={false}
        animate={{ opacity: entering ? 0 : 1, scale: entering ? 1.45 : 1 }}
        transition={{ duration: 0.7, delay }}
      >
        <Wordmark />
        <p>ADVANCING NEW MILESTONES</p>
      </motion.div>
      <motion.div
        className="hero-content"
        initial={false}
        animate={{ opacity: entering ? 0 : 1, y: entering ? 45 : 0 }}
        transition={{ duration: 0.65, delay: entering ? 0 : delay + 0.5 }}
      >
        <p className="eyebrow hero-category">BUSINESS SYSTEMS ENGINEERING</p>
        <h1 id="hero-title">
          YOUR PROBLEM.
          <br />
          <span>
            ENGINEERED INTO
            <br /> A SOLUTION.
          </span>
        </h1>
        <p className="hero-description">
          We build business systems engineering that make your company better —
          <br className="desktop-break" /> and help individuals turn ideas into real solutions.
        </p>
        <div className="hero-actions">
          <a
            href="/discovery"
            className="button gold"
            onPointerEnter={() => setActive(true)}
            onPointerLeave={() => setActive(false)}
            onFocus={() => setActive(true)}
            onBlur={() => setActive(false)}
            onClick={(event) => {
              if (
                event.metaKey ||
                event.ctrlKey ||
                event.shiftKey ||
                event.altKey
              )
                return;
              event.preventDefault();
              if (!entering) setEntering(true);
            }}
            aria-disabled={entering}
          >
            TRY US! <span aria-hidden="true">→</span>
          </a>
          <Link className="text-link" href="/what-we-build">
            SEE WHAT WE BUILD{" "}
            <span className="circle-arrow" aria-hidden="true">
              ▶
            </span>
          </Link>
        </div>
      </motion.div>
      <a className="approved-scroll" href="#home-audiences"><span>SCROLL TO EXPLORE</span><i /></a>
      <div className="transition-flash" aria-hidden="true" />
      <div className="home-audiences" id="home-audiences">
        {[
          ["INDIVIDUALS", "Ideas into reality", "M16 21a7 7 0 1 0 0-14 7 7 0 0 0 0 14M4 39v-5c0-13 24-13 24 0v5M29 9c9 0 9 12 2 13M33 27c6 1 9 5 9 12"],
          ["BUSINESSES", "Operate smarter", "M8 40V13h14V4h15v36M4 40h38M13 19h3m-3 7h3m-3 7h3M27 10h4m-4 8h4m-4 8h4m-4 7h4"],
          ["GROWING COMPANIES", "Scale efficiently", "M5 40h37M9 36V26h7v10m6 0V19h7v17m6 0V10h7v26M7 19 21 7l7 5L41 2m-9 0h9v9"],
          ["ENTERPRISE", "Build for what’s next", "M15 30C14 16 26 5 41 4c0 15-10 28-25 28L9 40l1-12-6-3 12-8M24 13a4 4 0 1 0 8 0 4 4 0 0 0-8 0M8 34l-5 8m12-4-3 6"],
        ].map(([title, copy, path]) => <div key={title}><svg viewBox="0 0 48 48" aria-hidden="true"><path d={path} /></svg><h2>{title}</h2><p>{copy}</p></div>)}
      </div>
    </section>
  );
}
