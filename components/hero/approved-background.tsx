"use client";
import { useEffect, useRef } from "react";

declare global {
  interface Window {
    mountApprovedANMBackground?: (root: HTMLElement) => { destroy(): void };
  }
}

export function ApprovedBackground() {
  const root = useRef<HTMLDivElement>(null);
  useEffect(() => {
    let scene: { destroy(): void } | undefined;
    let disposed = false;
    const mount = () => {
      if (!disposed && root.current) scene = window.mountApprovedANMBackground?.(root.current);
    };
    const script = document.createElement("script");
    script.src = "/approved-background/engine.js";
    script.onload = mount;
    if (window.mountApprovedANMBackground) mount();
    else document.head.appendChild(script);
    return () => { disposed = true; scene?.destroy(); script.remove(); };
  }, []);
  return <div className="approved-background" aria-hidden="true"><div className="approved-background-stage" ref={root} /></div>;
}
