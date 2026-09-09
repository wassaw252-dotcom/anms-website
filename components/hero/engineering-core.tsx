"use client";
import { useEffect, useRef } from "react";
export default function EngineeringCore({
  active = false,
  entering = false,
}: {
  active?: boolean;
  entering?: boolean;
}) {
  const ref = useRef<HTMLCanvasElement>(null);
  const state = useRef({ active, entering });
  useEffect(() => {
    state.current = { active, entering };
  }, [active, entering]);
  useEffect(() => {
    const canvas = ref.current!;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    let w = 0,
      h = 0,
      frame = 0,
      t = 0,
      visible = true,
      last = 0;
    const mouse = { x: 0, y: 0 };
    const reduced = matchMedia("(prefers-reduced-motion: reduce)");
    const resize = () => {
      const box = canvas.getBoundingClientRect();
      w = box.width;
      h = box.height;
      const dpr = Math.min(devicePixelRatio, 1.7);
      canvas.width = w * dpr;
      canvas.height = h * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      if (reduced.matches) draw(0);
    };
    const pointer = (e: PointerEvent) => {
      if (e.pointerType !== "mouse" || reduced.matches) return;
      mouse.x = (e.clientX / innerWidth - 0.5) * 18;
      mouse.y = (e.clientY / innerHeight - 0.5) * 10;
    };
    function draw(now: number) {
      if (!ctx) return;
      const dt = Math.min(now - last || 16, 40);
      last = now;
      if (!reduced.matches)
        t += dt * (state.current.entering ? 0.0002 : 0.000012);
      ctx.clearRect(0, 0, w, h);
      const mobile = w < 650;
      const radius =
        Math.min(w * (mobile ? 0.6 : 0.34), h * 0.33) *
        (state.current.entering ? 1.12 : 1);
      const cx = w / 2 + mouse.x,
        cy = h * 0.38 + mouse.y;
      const project = (lat: number, lon: number) => {
        const x = Math.cos(lat) * Math.cos(lon + t),
          z = Math.cos(lat) * Math.sin(lon + t),
          y = Math.sin(lat);
        return { x: cx + x * radius, y: cy + (y * 0.93 + z * 0.2) * radius, z };
      };
      ctx.lineWidth = 0.65;
      const surface = ctx.createRadialGradient(cx - radius * .35, cy - radius * .6, 0, cx, cy, radius);
      surface.addColorStop(0, "#263039");
      surface.addColorStop(.5, "#0b1115");
      surface.addColorStop(.95, "#020405");
      surface.addColorStop(1, "#657078");
      ctx.fillStyle = surface;
      ctx.beginPath(); ctx.arc(cx, cy, radius, 0, Math.PI * 2); ctx.fill();
      // Stable, evenly distributed surface points rotate with the same projection.
      const textureCount = mobile ? 1400 : 3200;
      for (let i = 0; i < textureCount; i++) {
        const lat = Math.asin(-1 + 2 * (i + .5) / textureCount), lon = i * 2.39996;
        const p = project(lat, lon);
        if (p.z < 0) continue;
        const cluster = Math.sin(lon * 3 + Math.sin(lat * 7)) * Math.cos(lat * 9 + lon);
        ctx.fillStyle = cluster > .18 ? `rgba(209,170,98,${.2 + p.z * .45})` : `rgba(123,149,166,${.08 + p.z * .16})`;
        ctx.fillRect(p.x, p.y, cluster > .55 ? 1.5 : .8, 1);
      }
      for (let lat = -Math.PI / 2 + 0.15; lat < Math.PI / 2; lat += 0.15) {
        ctx.beginPath();
        for (let i = 0; i <= 110; i++) {
          const p = project(lat, (i / 110) * Math.PI * 2);
          if (i === 0) ctx.moveTo(p.x, p.y);
          else ctx.lineTo(p.x, p.y);
        }
        ctx.strokeStyle = "rgba(180,161,116,.07)";
        ctx.stroke();
      }
      for (let lon = 0; lon < Math.PI * 2; lon += Math.PI / 14) {
        ctx.beginPath();
        for (let i = 0; i <= 50; i++) {
          const p = project(-Math.PI / 2 + (i / 50) * Math.PI, lon);
          if (i === 0) ctx.moveTo(p.x, p.y);
          else ctx.lineTo(p.x, p.y);
        }
        ctx.strokeStyle = "rgba(189,182,163,.06)";
        ctx.stroke();
      }
      const count = mobile ? 64 : 135;
      for (let i = 0; i < count; i++) {
        const lat = Math.asin(-1 + (2 * (i + 0.5)) / count),
          lon = i * 2.39996;
        const p = project(lat, lon);
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.z > 0 ? 1.5 : 0.7, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(227,192,120,${p.z > 0 ? .4 + .3 * Math.sin(t * 3 + i) ** 2 : .1})`;
        ctx.fill();
        if (i % 13 === 0 && p.z > 0) {
          ctx.beginPath();
          ctx.moveTo(p.x, p.y);
          ctx.lineTo(p.x + 36, p.y - 24);
          ctx.lineTo(p.x + 70, p.y - 24);
          ctx.strokeStyle = "rgba(210,177,111,.32)";
          ctx.stroke();
        }
      }
      for (let orbit = 0; orbit < 4; orbit++) {
        ctx.save();
        ctx.translate(cx, cy);
        ctx.rotate(-0.25 + orbit * 0.32 + t * (orbit % 2 ? .035 : -.025));
        ctx.beginPath();
        ctx.ellipse(
          0,
          0,
          radius * (1.13 + orbit * 0.07),
          radius * (0.3 + orbit * 0.05),
          0,
          0,
          Math.PI * 2,
        );
        ctx.strokeStyle = `rgba(216,180,108,${state.current.active ? 0.55 : 0.25})`;
        ctx.stroke();
        const theta = t * (orbit % 2 ? 1 : -1) + orbit * 1.9;
        const x = Math.cos(theta) * radius * (1.13 + orbit * 0.07),
          y = Math.sin(theta) * radius * (0.3 + orbit * 0.05);
        ctx.shadowColor = "#e9c67f";
        ctx.shadowBlur = 12;
        ctx.fillStyle = "#eed19a";
        ctx.beginPath();
        ctx.arc(x, y, 2.2, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      }
      // A restrained polar light and perspective floor tie the system to its environment.
      const beam = ctx.createLinearGradient(0, cy - radius * 1.35, 0, cy + radius);
      beam.addColorStop(0, "#e9bd6600"); beam.addColorStop(.22, "#ffe1a3aa"); beam.addColorStop(.5, "#d4aa4b11"); beam.addColorStop(1, "#d4aa4b00");
      ctx.fillStyle = beam; ctx.fillRect(cx - .7, cy - radius * 1.35, 1.4, radius * 2.35);
      for (let row = 0; row < 15; row++) {
        ctx.beginPath();
        for (let col = 0; col <= 64; col++) {
          const x = col / 64 * w;
          const y = h * .9 + row * row * .55 + Math.sin(col * .12 + t + row * .3) * (8 + row);
          if (!col) ctx.moveTo(x,y); else ctx.lineTo(x,y);
        }
        ctx.strokeStyle = `rgba(194,152,76,${.06 + row * .008})`; ctx.stroke();
      }
      for (let i = 0; i < (mobile ? 20 : 48); i++) {
        let x = (Math.sin(i * 72.3) * 0.5 + 0.5) * w,
          y = (Math.cos(i * 34.8) * 0.5 + 0.5) * h;
        const drift = reduced.matches ? 0 : Math.sin(t + i) * 9;
        x += drift;
        if (state.current.active) {
          x += (cx - x) * 0.1;
          y += (cy - y) * 0.1;
        }
        ctx.fillStyle = `rgba(211,181,120,${0.15 + (i % 4) * 0.1})`;
        ctx.fillRect(x, y, i % 5 === 0 ? 2 : 1, i % 5 === 0 ? 2 : 1);
      }
      if (!reduced.matches && visible && !document.hidden)
        frame = requestAnimationFrame(draw);
    }
    const restart = () => {
      cancelAnimationFrame(frame);
      if (visible && !document.hidden) frame = requestAnimationFrame(draw);
    };
    const observer = new IntersectionObserver(([entry]) => {
      visible = entry.isIntersecting;
      restart();
    });
    observer.observe(canvas);
    const ro = new ResizeObserver(resize);
    ro.observe(canvas);
    window.addEventListener("pointermove", pointer, { passive: true });
    document.addEventListener("visibilitychange", restart);
    reduced.addEventListener("change", restart);
    resize();
    restart();
    return () => {
      cancelAnimationFrame(frame);
      observer.disconnect();
      ro.disconnect();
      window.removeEventListener("pointermove", pointer);
      document.removeEventListener("visibilitychange", restart);
      reduced.removeEventListener("change", restart);
    };
  }, []);
  return <canvas ref={ref} className="engineering-canvas" aria-hidden="true" />;
}
