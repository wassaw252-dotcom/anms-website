"use client";
import { useState, useEffect, useSyncExternalStore } from "react";
import { useRouter } from "next/navigation";
import { motion, useReducedMotion } from "framer-motion";
import EngineeringCore from "./engineering-core";
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
      className={`hero ${entering ? "entering" : ""}`}
      aria-labelledby="hero-title"
    >
      <div className="hero-grid" />
      <EngineeringCore active={active} entering={entering} />
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
          PRECISION
          <br />
          WITH PURPOSE
        </span>
        <i />
        <span>
          BUSINESS SYSTEMS
          <br />
          ENGINEERING
        </span>
      </div>
      <motion.div
        className="core-brand"
        initial={false}
        animate={{ opacity: entering ? 0 : 1, scale: entering ? 1.45 : 1 }}
        transition={{ duration: 0.7, delay }}
      >
        <span>
          ANM<span>’s</span>
        </span>
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
            <br className="mobile-break" /> A SOLUTION.
          </span>
        </h1>
        <p className="hero-description">
          From a single idea to complex business operations,
          <br className="desktop-break" /> ANM’s engineers systems designed
          around what you need.
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
            TRY US! <span aria-hidden="true">↗</span>
          </a>
          <a className="text-link" href="#work">
            SEE WHAT WE BUILD{" "}
            <span className="circle-arrow" aria-hidden="true">
              ↓
            </span>
          </a>
        </div>
      </motion.div>
      <div className="hero-bottom">
        <span>01 / THE POSSIBILITIES</span>
        <a href="#solutions">
          SCROLL TO EXPLORE <span aria-hidden="true">↓</span>
        </a>
        <span>SYSTEMS · PEOPLE · PROGRESS</span>
      </div>
      <div className="transition-flash" aria-hidden="true" />
    </section>
  );
}
