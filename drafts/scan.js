// Fig. 1: a toy robot seen from above. It perceives the scene as a LiDAR scan
// (points on moving objects carry velocity vectors) and plans by sampling
// candidate trajectories, scoring each against where the objects *will be*.
(() => {
  const canvas = document.getElementById("scan");
  if (!canvas) return;
  const ctx = canvas.getContext("2d");
  const still = matchMedia("(prefers-reduced-motion: reduce)").matches;

  const BEAMS = 240;
  const RINGS = 14;
  let W = 0, H = 0, robot = { x: 0, y: 0 }, rings = [], jitter = [];

  // Objects: x and w as fractions of the canvas width, y as a fraction of its
  // height, h and velocities in px (px/s), so the scene scales with the column.
  const objs = [
    { x: 0.08, y: 0.40, w: 0.085, h: 26, vx:  34, vy: 0 },   // car, left to right
    { x: 0.70, y: 0.14, w: 0.10,  h: 28, vx: -24, vy: 0 },   // car, right to left
    { x: 0.36, y: 0.10, w: 0.014, h: 8,  vx:   7, vy: 5 },   // pedestrian
    { x: 0.66, y: 0.56, w: 0.035, h: 22, vx:   0, vy: 0 },   // static box
    { x: 0.30, y: 0.66, w: 0.010, h: 8,  vx:   0, vy: 0 },   // pole
  ];
  const px = (o) => ({ x: o.x * W, y: o.y * H, w: o.w * W, h: o.h });

  // Candidate trajectories: unicycle rollouts from an initial heading
  // (radians from straight ahead) and a constant turn rate.
  const STEPS = 26, DT = 0.12, MARGIN = 5;
  const candidates = [];
  for (let i = 0; i < 11; i++)
    for (let j = 0; j < 5; j++)
      candidates.push({ th: -1.15 + (2.3 * i) / 10, k: -0.7 + (1.4 * j) / 4 });
  let plan = null; // smoothed (th, k) actually followed

  function layout() {
    const r = canvas.getBoundingClientRect();
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    W = r.width; H = r.height;
    canvas.width = Math.round(W * dpr);
    canvas.height = Math.round(H * dpr);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

    robot = { x: W / 2, y: H - 6 };
    rings = [];
    for (let k = 0; k < RINGS; k++) rings.push(14 * Math.pow(1.27, k + 1));

    // Fixed per-point noise so the ground doesn't shimmer.
    let seed = 7;
    const rnd = () => ((seed = (seed * 16807) % 2147483647) / 2147483647 - 0.5);
    jitter = Array.from({ length: BEAMS * (RINGS + 1) }, () => rnd());
  }

  // Roll a trajectory forward, checking each step against the predicted
  // object positions at that time. Returns points, collision flag and cost.
  function rollout(th, k, boxes) {
    const v = (0.85 * H) / (STEPS * DT);
    let x = robot.x, y = robot.y, a = th, hitAt = -1;
    const pts = [[x, y]];
    for (let s = 1; s <= STEPS; s++) {
      x += v * Math.sin(a) * DT;
      y -= v * Math.cos(a) * DT;
      a += k * DT;
      const t = s * DT;
      pts.push([x, y]);
      const out = x < 4 || x > W - 4;
      const bump = boxes.some((b, i) => {
        const bx = b.x + objs[i].vx * t, by = b.y + objs[i].vy * t;
        return x > bx - MARGIN && x < bx + b.w + MARGIN && y > by - MARGIN && y < by + b.h + MARGIN;
      });
      if (out || bump) { hitAt = s; break; }
    }
    const [ex, ey] = pts[pts.length - 1];
    const progress = robot.y - ey;
    const cost = -progress + 0.25 * Math.abs(ex - robot.x) + (hitAt > 0 ? H : 0);
    return { pts, hit: hitAt > 0, cost };
  }

  // Ray / axis-aligned box intersection (slab method). Returns distance or Infinity.
  function hit(dx, dy, o) {
    const inv = (v) => (v === 0 ? 1e9 : 1 / v);
    const ix = inv(dx), iy = inv(dy);
    const t1 = (o.x - robot.x) * ix, t2 = (o.x + o.w - robot.x) * ix;
    const t3 = (o.y - robot.y) * iy, t4 = (o.y + o.h - robot.y) * iy;
    const tmin = Math.max(Math.min(t1, t2), Math.min(t3, t4));
    const tmax = Math.min(Math.max(t1, t2), Math.max(t3, t4));
    return tmax >= Math.max(tmin, 0) ? tmin : Infinity;
  }

  function colours() {
    const s = getComputedStyle(document.documentElement);
    return {
      ink: s.getPropertyValue("--ink").trim(),
      muted: s.getPropertyValue("--muted").trim(),
      accent: s.getPropertyValue("--accent").trim(),
    };
  }

  function path(pts) {
    ctx.beginPath();
    pts.forEach(([x, y], i) => (i ? ctx.lineTo(x, y) : ctx.moveTo(x, y)));
    ctx.stroke();
  }

  function draw(dt) {
    const c = colours();
    ctx.clearRect(0, 0, W, H);
    const boxes = objs.map(px);

    // Plan: score every candidate, then ease the followed plan towards the best.
    const rolls = candidates.map((q) => ({ q, ...rollout(q.th, q.k, boxes) }));
    const best = rolls.reduce((a, b) => (b.cost < a.cost ? b : a));
    if (!plan) plan = { ...best.q };
    const ease = Math.min(1, dt * 2.5);
    plan.th += (best.q.th - plan.th) * ease;
    plan.k += (best.q.k - plan.k) * ease;

    ctx.lineWidth = 1;
    ctx.strokeStyle = c.muted;
    for (const r of rolls) {
      ctx.globalAlpha = r.hit ? 0.05 : 0.14;
      path(r.pts);
    }

    // Perception: ground returns, occluded behind the first object hit.
    for (let b = 0; b < BEAMS; b++) {
      const a = Math.PI + (Math.PI * (b + 0.5)) / BEAMS; // sweep the upper half
      const dx = Math.cos(a), dy = Math.sin(a);

      let best = Infinity, who = null;
      boxes.forEach((box, i) => {
        const t = hit(dx, dy, box);
        if (t < best) { best = t; who = objs[i]; }
      });

      ctx.fillStyle = c.muted;
      for (let k = 0; k < RINGS; k++) {
        const r = rings[k] + jitter[b * RINGS + k] * 1.6;
        if (r >= best) break;
        const x = robot.x + dx * r, y = robot.y + dy * r;
        if (y < -2 || x < -2 || x > W + 2) break;
        ctx.globalAlpha = 0.55 - (k / RINGS) * 0.3;
        ctx.fillRect(x - 0.6, y - 0.6, 1.2, 1.2);
      }

      if (who && best < 2000) {
        const x = robot.x + dx * best, y = robot.y + dy * best;
        if (y < 0 || x < 0 || x > W) continue;
        ctx.globalAlpha = 1;
        ctx.fillStyle = c.ink;
        ctx.fillRect(x - 1, y - 1, 2, 2);

        if (who.vx || who.vy) {
          ctx.strokeStyle = c.accent;
          ctx.globalAlpha = 0.85;
          ctx.beginPath();
          ctx.moveTo(x, y);
          ctx.lineTo(x + who.vx * 0.32, y + who.vy * 0.32);
          ctx.stroke();
        }
      }
    }

    // The trajectory being followed.
    const chosen = rollout(plan.th, plan.k, boxes);
    ctx.globalAlpha = 1;
    ctx.strokeStyle = c.accent;
    ctx.lineWidth = 1.5;
    path(chosen.pts);

    // Robot.
    ctx.fillStyle = c.accent;
    ctx.beginPath();
    ctx.arc(robot.x, robot.y, 2.5, 0, Math.PI * 2);
    ctx.fill();
  }

  function step(dt) {
    if (!W || !H) return;
    for (const o of objs) {
      o.x += (o.vx * dt) / W;
      o.y += (o.vy * dt) / H;
      if (o.vx > 0 && o.x > 1.1) o.x = -o.w - 0.1;
      if (o.vx < 0 && o.x < -o.w - 0.1) o.x = 1.1;
      if (o.vy > 0 && o.y > 0.3) o.vy = -o.vy;
      if (o.vy < 0 && o.y < 0.04) o.vy = -o.vy;
    }
  }

  let visible = true, last = 0;
  function frame(t) {
    const dt = last ? Math.min((t - last) / 1000, 0.05) : 0;
    last = t;
    step(dt);
    draw(dt);
    if (visible) requestAnimationFrame(frame); else last = 0;
  }

  layout();
  draw(1);
  new ResizeObserver(() => { layout(); draw(1); }).observe(canvas);
  matchMedia("(prefers-color-scheme: dark)").addEventListener("change", () => draw(0));

  if (!still) {
    new IntersectionObserver(([e]) => {
      const was = visible;
      visible = e.isIntersecting;
      if (visible && !was) requestAnimationFrame(frame);
    }).observe(canvas);
    requestAnimationFrame(frame);
  }
})();
