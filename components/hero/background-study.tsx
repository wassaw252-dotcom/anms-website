"use client";
import { useEffect, useRef } from "react";
import land from "./earth-land.json";
// Coastlines: Natural Earth 1:110m land, public-domain map data.
// https://github.com/nvkelso/natural-earth-vector
export default function BackgroundStudy({
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
    // Rasterize the geographic mask once to sample land without expensive per-frame polygons.
    const mask = document.createElement("canvas");
    mask.width = 720; mask.height = 360;
    const map = mask.getContext("2d")!;
    map.fillStyle = "white";
    for (const polygon of land) {
      map.beginPath();
      polygon.forEach(([lon, lat], i) => {
        const x = (lon + 180) * 2, y = (90 - lat) * 2;
        if (i === 0) map.moveTo(x,y); else map.lineTo(x,y);
      });
      map.closePath(); map.fill();
    }
    const pixels = map.getImageData(0,0,720,360).data;
    const earthPoints: number[][] = [];
    for (let y = 4; y < 350; y += 2) {
      const lat = (90 - y / 2) * Math.PI / 180;
      const step = Math.max(2, Math.round(2 / Math.cos(lat)));
      for (let x = 1; x < 719; x += step) {
        if (pixels[(y * 720 + x) * 4 + 3] < 128) continue;
        const coast = pixels[(y * 720 + x - 1) * 4 + 3] < 128 || pixels[((y - 2) * 720 + x) * 4 + 3] < 128;
        earthPoints.push([lat, (x / 2 - 180) * Math.PI / 180, coast ? 1 : 0]);
      }
    }
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
        Math.min(w * (mobile ? 0.41 : 0.29), h * 0.33) *
        (state.current.entering ? 1.12 : 1);
      const cx = w / 2 + mouse.x,
        cy = h * 0.35 + mouse.y;
      const project = (lat: number, lon: number) => {
        const longitude = lon - .95 + t;
        const x = Math.cos(lat) * Math.sin(longitude);
        const z = Math.cos(lat) * Math.cos(longitude);
        const y = -Math.sin(lat);
        const tilt = .12;
        return { x: cx + x * radius, y: cy + (y * Math.cos(tilt) + z * Math.sin(tilt)) * radius, z: z * Math.cos(tilt) - y * Math.sin(tilt) };
      };
      ctx.lineWidth = 0.65;
      // Each path has its own aspect, tilt, centre, phase and angular speed.
      // Rear half-arcs are painted before the opaque globe; front halves after it.
      const orbits = [
        [1.72, .27, -.30, -.08, .14, .16, 0, 5.8],
        [1.57, .42, .24, .09, -.12, -.11, .7, 5.4],
        [1.43, .68, -.67, -.12, -.03, .08, 1.8, 4.8],
        [1.34, .47, 1.10, .07, -.12, -.07, 2.5, 5.1],
        [1.84, .19, -.16, .06, .38, .13, 3.1, 4.7],
        [1.49, .76, .53, -.04, -.13, -.09, 4.4, 5.7],
        [1.64, .35, -.47, .08, -.30, .06, 5.1, 4.4],
        [1.22, .92, -.14, -.07, -.09, -.05, 1.1, 4.9],
      ];
      const drawOrbits = (front: boolean) => {
        orbits.forEach(([a, b, tilt, ox, oy, speed, phase, span], index) => {
          const rotation = tilt + t * speed;
          const point = (theta: number) => {
            const x = Math.cos(theta) * radius * a;
            const y = Math.sin(theta) * radius * b;
            return {
              x: cx + radius * ox + x * Math.cos(rotation) - y * Math.sin(rotation),
              y: cy + radius * oy + x * Math.sin(rotation) + y * Math.cos(rotation),
              front: Math.sin(theta) >= 0,
            };
          };
          ctx.save();
          ctx.lineWidth = front ? (index === 0 ? 1.2 : .7) : .55;
          const alpha = front ? (state.current.active ? .66 : .42) : .19;
          ctx.strokeStyle = index % 3 === 2 ? `rgba(210,220,223,${alpha})` : `rgba(220,179,106,${alpha})`;
          ctx.beginPath();
          let pen = false;
          const steps = mobile ? 80 : 130;
          for (let step = 0; step <= steps; step++) {
            const p = point(phase + step / steps * span);
            if (p.front !== front) { pen = false; continue; }
            if (pen) ctx.lineTo(p.x, p.y); else ctx.moveTo(p.x, p.y);
            pen = true;
          }
          ctx.stroke();
          // Fixed trajectory markers and travelling data lights share the same depth.
          for (let marker = 0; marker < 3; marker++) {
            const theta = marker === 0
              ? phase + (t * (index % 2 ? -.65 : .85) + index + 1000) % span
              : phase + span * marker / 3;
            const p = point(theta);
            if (p.front !== front) continue;
            ctx.shadowColor = "#f5cd83";
            ctx.shadowBlur = marker === 0 ? 12 : 4;
            ctx.fillStyle = `rgba(255,224,166,${front ? .65 + .25 * Math.sin(t * 2 + index) ** 2 : .3})`;
            ctx.beginPath(); ctx.arc(p.x, p.y, marker === 0 ? 2 : 1, 0, Math.PI * 2); ctx.fill();
            if (marker === 1 && !mobile) {
              ctx.shadowBlur = 0;
              ctx.beginPath(); ctx.moveTo(p.x, p.y - 11); ctx.lineTo(p.x, p.y + 11);
              ctx.moveTo(p.x - 4, p.y); ctx.lineTo(p.x + 4, p.y); ctx.stroke();
            }
          }
          ctx.restore();
        });
      };
      drawOrbits(false);
      const surface = ctx.createRadialGradient(cx - radius * .35, cy - radius * .6, 0, cx, cy, radius);
      surface.addColorStop(0, "#263039");
      surface.addColorStop(.5, "#0b1115");
      surface.addColorStop(.95, "#020405");
      surface.addColorStop(1, "#83908d");
      ctx.fillStyle = surface;
      ctx.beginPath(); ctx.arc(cx, cy, radius, 0, Math.PI * 2); ctx.fill();
      // The land samples are prepared once; no geographic search runs per frame.
      for (let i = 0; i < earthPoints.length; i += mobile ? 2 : 1) {
        const [lat, lon, coast] = earthPoints[i];
        const p = project(lat, lon);
        if (p.z <= 0) continue;
        const light = .12 + Math.pow(p.z, .7) * .42;
        ctx.fillStyle = coast ? `rgba(232,190,114,${light + .2})` : `rgba(119,142,151,${light})`;
        const size = coast ? 1.15 : .85;
        ctx.fillRect(p.x, p.y, size, size);
      }
      // Thin coastline segments make Africa, Europe and Asia readable at a glance.
      for (const polygon of land) {
        ctx.beginPath(); let pen = false;
        for (const [lon, lat] of polygon) {
          const p = project(lat * Math.PI / 180, lon * Math.PI / 180);
          if (p.z <= .02) { pen = false; continue; }
          if (pen) ctx.lineTo(p.x, p.y); else ctx.moveTo(p.x, p.y);
          pen = true;
        }
        ctx.strokeStyle = "rgba(204,168,101,.25)"; ctx.lineWidth = .55; ctx.stroke();
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
      drawOrbits(true);
      // Sparse suspended wireframe fragments, independent of the globe rotation.
      for (let i = 0; i < (mobile ? 3 : 5); i++) {
        const angle = i * 1.31 + .4;
        const x = cx + Math.cos(angle) * radius * 1.48;
        const y = cy + Math.sin(angle) * radius * 1.18;
        const size = mobile ? 7 : 12 + i * 2;
        ctx.save(); ctx.translate(x, y);
        ctx.rotate(angle + Math.sin(t * .4 + i) * .12);
        ctx.strokeStyle = "rgba(224,194,134,.48)";
        ctx.lineWidth = .7;
        ctx.beginPath();
        ctx.moveTo(-size, 0); ctx.lineTo(0, -size * 1.5);
        ctx.lineTo(size, 0); ctx.lineTo(0, size * 1.5);
        ctx.closePath(); ctx.moveTo(-size, 0); ctx.lineTo(size, 0);
        ctx.lineTo(0, -size * 1.5); ctx.lineTo(0, size * 1.5);
        ctx.stroke(); ctx.restore();
      }
      // A restrained polar light and perspective floor tie the system to its environment.
      const beam = ctx.createLinearGradient(0, cy - radius * 1.35, 0, cy + radius);
      beam.addColorStop(0, "#e9bd6600"); beam.addColorStop(.22, "#ffe1a3aa"); beam.addColorStop(.5, "#d4aa4b11"); beam.addColorStop(1, "#d4aa4b00");
      ctx.globalAlpha = .75 + .15 * Math.sin(t * 2);
      ctx.fillStyle = beam; ctx.fillRect(cx - .7, cy - radius * 1.35, 1.4, radius * 2.35);
      ctx.globalAlpha = 1;
      // A dark, uneven reflective basin: fine terrain ridges converge on the light axis.
      const horizon = h * .79;
      const floorRows = mobile ? 30 : 54;
      for (let row = 0; row < floorRows; row++) {
        const depth = row / floorRows;
        ctx.beginPath();
        const cols = mobile ? 90 : 160;
        for (let col = 0; col <= cols; col++) {
          const x = col / cols * w;
          const side = Math.abs(x / w - .5) * 2;
          const wave = Math.sin(col * .18 + row * .36 + t * .5) * 4 + Math.sin(col * .49 + row * .23) * 2;
          const y = horizon + depth * depth * h * .2 - Math.pow(side,1.7) * h * .085 + wave * (.3 + depth);
          if (!col) ctx.moveTo(x,y); else ctx.lineTo(x,y);
          if (col % 7 === row % 7) {
            ctx.fillStyle = `rgba(219,178,104,${.08 + .35 * Math.sin(row * 13 + col) ** 8})`;
            ctx.fillRect(x,y,1.4, .8);
          }
        }
        ctx.strokeStyle = row % 8 === 0 ? "rgba(195,151,78,.33)" : "rgba(78,91,97,.18)";
        ctx.lineWidth = row % 8 === 0 ? .7 : .5; ctx.stroke();
      }
      const shine = (x: number, y: number, size: number, strength: number) => {
        const glow = ctx.createRadialGradient(x,y,0,x,y,size);
        glow.addColorStop(0, `rgba(255,240,201,${strength})`);
        glow.addColorStop(.12, `rgba(237,180,84,${strength * .65})`);
        glow.addColorStop(1,"rgba(182,125,40,0)");
        ctx.fillStyle = glow; ctx.fillRect(x-size,y-size,size*2,size*2);
        ctx.strokeStyle = `rgba(255,230,180,${strength * .6})`; ctx.lineWidth = .65;
        ctx.beginPath(); ctx.moveTo(x-size*.6,y); ctx.lineTo(x+size*.6,y);
        ctx.moveTo(x,y-size*1.5); ctx.lineTo(x,y+size*1.5); ctx.stroke();
      };
      shine(cx,cy-radius,60,.7 + .08 * Math.sin(t*2));
      shine(cx,cy+radius*.3,35,.65);
      shine(cx,horizon+h*.045,70,.5);
      for (let i=0;i<18;i++) {
        const y = horizon + i * h * .007;
        const width = (9 + i * 1.2) * (1 + .6 * Math.sin(i * 21 + t));
        ctx.strokeStyle = `rgba(217,172,94,${.2 * (1-i/22)})`;
        ctx.beginPath(); ctx.moveTo(cx-width,y); ctx.lineTo(cx+width,y); ctx.stroke();
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
  return <canvas ref={ref} className="background-study-canvas" aria-hidden="true" />;
}
