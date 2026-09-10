"use client";
import { useRef } from "react";
import {
  motion,
  useScroll,
  useTransform,
  useReducedMotion,
} from "framer-motion";
export function EngineeringFlow() {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "end center"],
  });
  const width = useTransform(scrollYProgress, [0.1, 0.9], ["0%", "100%"]);
  const reduced = useReducedMotion();
  return (
    <div className="engineering-flow" ref={ref}>
      <div className="flow-inputs">
        {[
          "YOUR PROBLEM",
          "YOUR WORKFLOW",
          "YOUR EXISTING SYSTEMS",
          "YOUR REQUIREMENTS",
        ].map((x, i) => (
          <div key={x}>
            <span>0{i + 1}</span>
            {x}
            <b aria-hidden="true">+</b>
          </div>
        ))}
      </div>
      <div className="flow-track">
        <motion.div style={{ width: reduced ? "100%" : width }} />
      </div>
      <div className="flow-core">
        <span className="mini-mark">A /</span>
        <strong>ANM’s ENGINEERING</strong>
      </div>
      <div className="flow-output">
        <span aria-hidden="true">↳</span>YOUR SOLUTION
      </div>
    </div>
  );
}
