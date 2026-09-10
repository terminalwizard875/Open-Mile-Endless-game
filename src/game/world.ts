export function hash2(ix: number, iz: number, salt = 0) {
  let n = (ix * 374761393 + iz * 668265263 + salt * 1274126177) | 0;
  n = (n ^ (n >>> 13)) * 1274126177;
  return ((n ^ (n >>> 16)) >>> 0) / 4294967296;
}

export type Biome = "desert" | "canyon" | "forest" | "tundra";

export const BIOME_LABEL: Record<Biome, string> = {
  desert: "Dune Sea",
  canyon: "Red Mesa",
  forest: "Pine Range",
  tundra: "White Shelf",
};

const RINGS: { id: Biome; until: number }[] = [
  { id: "desert", until: 720 },
  { id: "canyon", until: 1680 },
  { id: "forest", until: 2680 },
  { id: "tundra", until: Infinity },
];

const BLEND = 140;

export function radial(x: number, z: number) {
  return Math.hypot(x, z);
}

export function biomeAt(x: number, z: number): Biome {
  const r = radial(x, z);
  for (const ring of RINGS) {
    if (r < ring.until) return ring.id;
  }
  return "tundra";
}

export type MountainKind = "dune" | "volcano" | "forest" | "ice";

export type Mountain = {
  name: string;
  kind: MountainKind;
  x: number;
  z: number;
  radius: number;
  height: number;
  summitR: number;
  roadW: number;
  turns: number;
  roadStartR: number;
  approach: number;
  rot: number;
  base: number;
};

export const MOUNTAINS: Mountain[] = [
  {
    name: "Dune Coil",
    kind: "dune",
    x: 112,
    z: -84,
    radius: 84,
    height: 54,
    summitR: 15,
    roadW: 8.6,
    turns: 3.25,
    roadStartR: 72,
    approach: 32,
    rot: 0,
    base: 0,
  },
  {
    name: "Sand Spire",
    kind: "dune",
    x: -430,
    z: 270,
    radius: 86,
    height: 50,
    summitR: 15,
    roadW: 8.4,
    turns: 3.2,
    roadStartR: 74,
    approach: 30,
    rot: 0,
    base: 0,
  },
  {
    name: "Twin Needle",
    kind: "dune",
    x: 208,
    z: -252,
    radius: 64,
    height: 40,
    summitR: 11,
    roadW: 7.6,
    turns: 2.55,
    roadStartR: 54,
    approach: 22,
    rot: 0,
    base: 0,
  },
  {
    name: "Coil Sister",
    kind: "dune",
    x: 168,
    z: -26,
    radius: 48,
    height: 32,
    summitR: 9,
    roadW: 7.2,
    turns: 2.2,
    roadStartR: 40,
    approach: 18,
    rot: 0,
    base: 0,
  },
  {
    name: "Ash Caldera",
    kind: "volcano",
    x: 1040,
    z: 780,
    radius: 168,
    height: 118,
    summitR: 34,
    roadW: 8.0,
    turns: 3.85,
    roadStartR: 142,
    approach: 38,
    rot: 0,
    base: 0,
  },
  {
    name: "Cinder Stack",
    kind: "volcano",
    x: 640,
    z: 1180,
    radius: 88,
    height: 64,
    summitR: 16,
    roadW: 7.4,
    turns: 2.8,
    roadStartR: 72,
    approach: 26,
    rot: 0,
    base: 0,
  },
  {
    name: "Soot Cone",
    kind: "volcano",
    x: 1320,
    z: -380,
    radius: 72,
    height: 52,
    summitR: 14,
    roadW: 7.2,
    turns: 2.45,
    roadStartR: 60,
    approach: 22,
    rot: 0,
    base: 0,
  },
  {
    name: "Timber Crown",
    kind: "forest",
    x: -1480,
    z: -1540,
    radius: 142,
    height: 88,
    summitR: 20,
    roadW: 8.6,
    turns: 3.55,
    roadStartR: 122,
    approach: 34,
    rot: 0,
    base: 0,
  },
  {
    name: "Mossback",
    kind: "forest",
    x: 1080,
    z: -2260,
    radius: 118,
    height: 74,
    summitR: 18,
    roadW: 8.4,
    turns: 3.25,
    roadStartR: 100,
    approach: 30,
    rot: 0,
    base: 0,
  },
  {
    name: "Fir Spire",
    kind: "forest",
    x: -2140,
    z: 920,
    radius: 108,
    height: 70,
    summitR: 16,
    roadW: 8.2,
    turns: 3.1,
    roadStartR: 92,
    approach: 28,
    rot: 0,
    base: 0,
  },
  {
    name: "White Horizon",
    kind: "ice",
    x: 2240,
    z: 2380,
    radius: 640,
    height: 455,
    summitR: 22,
    roadW: 5.15,
    turns: 6.9,
    roadStartR: 560,
    approach: 56,
    rot: 0,
    base: 0,
  },
  {
    name: "Glass Nunatak",
    kind: "ice",
    x: 2780,
    z: 1860,
    radius: 248,
    height: 186,
    summitR: 16,
    roadW: 5.6,
    turns: 4.4,
    roadStartR: 214,
    approach: 36,
    rot: 0,
    base: 0,
  },
];

export type MountainHit = {
  mountain: Mountain;
  rise: number;
  blend: number;
  onRoad: boolean;
  onSummit: boolean;
  onLava: boolean;
  stripe: boolean;
  name: string;
  dist: number;
};

const _hit: MountainHit = {
  mountain: MOUNTAINS[0],
  rise: 0,
  blend: 0,
  onRoad: false,
  onSummit: false,
  onLava: false,
  stripe: false,
  name: "",
  dist: 0,
};

function wrapPi(a: number) {
  const t = Math.PI * 2;
  let x = a;
  while (x > Math.PI) x -= t;
  while (x < -Math.PI) x += t;
  return x;
}

export function craterR(m: Mountain) {
  return m.kind === "volcano" ? m.summitR * 0.52 : 0;
}

function coneRise(m: Mountain, dist: number) {
  if (m.kind === "volcano") {
    const crater = craterR(m);
    if (dist <= crater) return m.height * 0.62;
    if (dist <= m.summitR) {
      const t = (dist - crater) / Math.max(0.01, m.summitR - crater);
      const s = t * t * (3 - 2 * t);
      return m.height * (0.62 + 0.38 * s);
    }
    if (dist >= m.radius) return 0;
    const u = 1 - (dist - m.summitR) / (m.radius - m.summitR);
    return m.height * Math.pow(Math.max(0, u), 0.92);
  }
  if (dist <= m.summitR) return m.height;
  if (dist >= m.radius) return 0;
  const u = 1 - (dist - m.summitR) / (m.radius - m.summitR);
  const p = m.kind === "ice" ? 1.62 : m.kind === "forest" ? 1.22 : 1.08;
  return m.height * Math.pow(Math.max(0, u), p);
}

export function mountainAt(x: number, z: number): MountainHit | null {
  let found: Mountain | null = null;
  let bestDist = Infinity;
  for (const m of MOUNTAINS) {
    const dx = x - m.x;
    const dz = z - m.z;
    const dist = Math.hypot(dx, dz);
    const reach = m.radius + m.approach + 6;
    if (dist > reach) continue;
    if (dist < bestDist) {
      bestDist = dist;
      found = m;
    }
  }
  if (!found) return null;

  const m = found;
  const dx = x - m.x;
  const dz = z - m.z;
  const dist = bestDist;
  const ang = Math.atan2(dx, dz);
  const twoPi = Math.PI * 2;
  const span = m.turns * twoPi;
  const rInner = m.summitR + m.roadW * 0.28;
  const cone = coneRise(m, dist);

  let rise = cone;
  let onRoad = false;
  const hole = craterR(m);
  let onLava = m.kind === "volcano" && dist < hole;
  if (!onLava && m.kind === "volcano" && dist > hole && dist < m.radius * 0.96) {
    for (let i = 0; i < 3; i++) {
      const a = m.rot + 1.05 + i * 2.094;
      if (Math.abs(wrapPi(ang - a)) * dist < 4.4) {
        onLava = true;
        break;
      }
    }
  }
  let onSummit = m.kind === "volcano" ? dist <= m.summitR && dist >= hole && !onLava : dist <= m.summitR;
  let stripe = false;

  if (onLava) {
    rise = cone;
  } else if (onSummit) {
    rise = m.kind === "volcano" ? cone : m.height;
  } else {
    let bestOff = Infinity;
    let bestCenter = dist;
    let bestTheta = ang;
    let bestT = 0;
    const k0 = Math.floor((m.rot - ang) / twoPi) - 1;
    const k1 = k0 + Math.ceil(m.turns) + 4;
    for (let k = k0; k <= k1; k++) {
      const theta = ang + k * twoPi;
      const t = (theta - m.rot) / span;
      if (t < -0.03 || t > 1.04) continue;
      const tc = t < 0 ? 0 : t > 1 ? 1 : t;
      const rCenter = m.roadStartR + (rInner - m.roadStartR) * tc;
      const off = Math.abs(dist - rCenter);
      if (off < bestOff) {
        bestOff = off;
        bestCenter = rCenter;
        bestTheta = theta;
        bestT = tc;
      }
    }

    const iceNarrow = m.kind === "ice" ? 1.1 - 0.52 * bestT : 1;
    const half = m.roadW * 0.5 * iceNarrow;
    const edge = m.kind === "ice" ? 1.6 : 2.4;
    if (bestOff < half + edge) {
      const roadH = coneRise(m, bestCenter);
      const signed = dist - bestCenter;
      if (bestOff <= half) {
        rise = m.kind === "ice" ? roadH - Math.max(0, signed) * 0.16 : roadH;
        onRoad = true;
        const along = (bestTheta - m.rot) * bestCenter;
        stripe = Math.abs(dist - bestCenter) < 0.42 && Math.sin(along * 0.55) > 0.28;
      } else {
        const f = 1 - (bestOff - half) / edge;
        const s = f * f * (3 - 2 * f);
        rise = roadH * s + cone * (1 - s);
        onRoad = s > 0.62;
      }
    }

    const dAng = wrapPi(ang - m.rot);
    const arc = Math.abs(dAng) * Math.max(dist, 1);
    const outer = m.roadStartR + m.approach;
    if (dist >= m.roadStartR - 1.2 && dist <= outer && arc < m.roadW * 0.58) {
      const gateH = coneRise(m, m.roadStartR);
      const tA = (outer - dist) / m.approach;
      const hA = gateH * Math.max(0, Math.min(1, tA));
      if (hA >= rise) {
        rise = hA;
        onRoad = true;
        stripe = Math.abs(arc) < 0.4 && Math.sin(dist * 0.7) > 0.25;
      }
    }
  }

  const skirt = m.radius + 10;
  let blend = 1;
  if (dist > m.radius - 8) {
    const k = (skirt - dist) / (skirt - (m.radius - 8));
    blend = Math.max(0, Math.min(1, k));
    blend = blend * blend * (3 - 2 * blend);
  }
  if (onRoad || onSummit) blend = Math.max(blend, 0.92);

  _hit.mountain = m;
  _hit.rise = rise;
  _hit.blend = blend;
  _hit.onRoad = onRoad;
  _hit.onSummit = onSummit;
  _hit.onLava = onLava;
  _hit.stripe = stripe;
  _hit.name = m.name;
  _hit.dist = dist;
  return _hit;
}

type Trail = { w: number; pts: { x: number; z: number }[] };

let TRAILS: Trail[] = [];

const RIDGES: { ax: number; az: number; bx: number; bz: number; h: number; w: number }[] = [
  { ax: 112, az: -84, bx: 208, bz: -252, h: 18, w: 26 },
  { ax: 112, az: -84, bx: 168, bz: -26, h: 12, w: 20 },
  { ax: 168, az: -26, bx: 208, bz: -252, h: 9, w: 16 },
];

export type TrailHit = {
  on: boolean;
  stripe: boolean;
  shoulder: boolean;
  cx: number;
  cz: number;
};

const _trail: TrailHit = { on: false, stripe: false, shoulder: false, cx: 0, cz: 0 };

function projectSeg(
  px: number,
  pz: number,
  ax: number,
  az: number,
  bx: number,
  bz: number,
) {
  const abx = bx - ax;
  const abz = bz - az;
  const ab2 = abx * abx + abz * abz || 1;
  let t = ((px - ax) * abx + (pz - az) * abz) / ab2;
  t = t < 0 ? 0 : t > 1 ? 1 : t;
  const cx = ax + abx * t;
  const cz = az + abz * t;
  const dx = px - cx;
  const dz = pz - cz;
  return { d: Math.hypot(dx, dz), t, cx, cz, len: Math.sqrt(ab2) };
}

export function trailAt(x: number, z: number): TrailHit | null {
  let best = 1e9;
  let w = 7;
  let along = 0;
  let cx = x;
  let cz = z;
  for (const trail of TRAILS) {
    let acc = 0;
    for (let i = 0; i < trail.pts.length - 1; i++) {
      const a = trail.pts[i];
      const b = trail.pts[i + 1];
      const p = projectSeg(x, z, a.x, a.z, b.x, b.z);
      if (p.d < best) {
        best = p.d;
        w = trail.w;
        along = acc + p.t * p.len;
        cx = p.cx;
        cz = p.cz;
      }
      acc += p.len;
    }
  }
  const half = w * 0.5;
  if (best > half + 1.8) return null;
  _trail.on = best <= half;
  _trail.shoulder = !_trail.on;
  _trail.stripe = _trail.on && Math.abs(best) < 0.38 && Math.sin(along * 0.62) > 0.22;
  _trail.cx = cx;
  _trail.cz = cz;
  return _trail;
}

function craterDip(x: number, z: number) {
  const dx = x + 52;
  const dz = z + 172;
  const d = Math.hypot(dx, dz);
  if (d > 64) return 0;
  if (d < 16) return -9.5;
  if (d < 36) return -9.5 * (1 - (d - 16) / 20);
  const u = 1 - Math.abs(d - 46) / 18;
  return Math.max(0, u) * 5.2;
}

function ridgeRise(x: number, z: number) {
  let h = 0;
  for (const r of RIDGES) {
    const p = projectSeg(x, z, r.ax, r.az, r.bx, r.bz);
    if (p.d > r.w) continue;
    const end = Math.min(p.t, 1 - p.t, 0.18) / 0.18;
    const s = 1 - p.d / r.w;
    const rise = r.h * s * s * Math.max(0, Math.min(1, end));
    if (rise > h) h = rise;
  }
  return h;
}

function buildTrails() {
  const coil = MOUNTAINS[0];
  const gateX = coil.x + Math.sin(coil.rot) * (coil.roadStartR + 12);
  const gateZ = coil.z + Math.cos(coil.rot) * (coil.roadStartR + 12);
  const sister = MOUNTAINS.find((m) => m.name === "Coil Sister")!;
  const twin = MOUNTAINS.find((m) => m.name === "Twin Needle")!;
  const stack = MOUNTAINS.find((m) => m.name === "Cinder Stack")!;
  const sand = MOUNTAINS.find((m) => m.name === "Sand Spire")!;
  const clay = MOUNTAINS.find((m) => m.name === "Ash Caldera")!;
  const soot = MOUNTAINS.find((m) => m.name === "Soot Cone")!;
  const pine = MOUNTAINS.find((m) => m.name === "Timber Crown")!;
  const frost = MOUNTAINS.find((m) => m.name === "White Horizon")!;
  const nunatak = MOUNTAINS.find((m) => m.name === "Glass Nunatak")!;
  const moss = MOUNTAINS.find((m) => m.name === "Mossback")!;
  const fir = MOUNTAINS.find((m) => m.name === "Fir Spire")!;
  const g = (m: Mountain) => ({
    x: m.x + Math.sin(m.rot) * (m.roadStartR + 10),
    z: m.z + Math.cos(m.rot) * (m.roadStartR + 10),
  });
  TRAILS = [
    {
      w: 7.5,
      pts: [
        { x: 2, z: 12 },
        { x: 8, z: -38 },
        { x: 16, z: -96 },
        { x: 10, z: -168 },
        { x: 26, z: -258 },
        { x: 4, z: -372 },
        { x: -22, z: -492 },
        { x: 30, z: -612 },
        { x: 8, z: -730 },
      ],
    },
    {
      w: 7.6,
      pts: [
        { x: 6, z: -10 },
        { x: 22, z: -22 },
        { x: gateX, z: gateZ },
      ],
    },
    {
      w: 7.2,
      pts: [
        { x: gateX, z: gateZ },
        { x: (gateX + g(sister).x) * 0.5, z: (gateZ + g(sister).z) * 0.5 },
        g(sister),
      ],
    },
    {
      w: 7.2,
      pts: [
        { x: 16, z: -96 },
        { x: 80, z: -160 },
        { x: 140, z: -210 },
        g(twin),
      ],
    },
    {
      w: 7.4,
      pts: [
        { x: 8, z: -38 },
        { x: -70, z: 40 },
        { x: -180, z: 120 },
        { x: -300, z: 200 },
        g(sand),
      ],
    },
    {
      w: 7.6,
      pts: [
        { x: 16, z: -96 },
        { x: 120, z: 20 },
        { x: 280, z: 90 },
        { x: 450, z: 180 },
        g(stack),
        { x: 780, z: 460 },
        g(clay),
      ],
    },
    {
      w: 7.0,
      pts: [
        { x: 450, z: 180 },
        { x: 880, z: -90 },
        { x: 1140, z: -250 },
        g(soot),
      ],
    },
    {
      w: 7.2,
      pts: [
        { x: -900, z: -980 },
        { x: -1180, z: -1200 },
        { x: -1380, z: -1380 },
        g(pine),
      ],
    },
    {
      w: 7.0,
      pts: [
        { x: 1680, z: 1560 },
        { x: 1860, z: 1860 },
        { x: 2060, z: 2140 },
        g(frost),
      ],
    },
    {
      w: 6.6,
      pts: [
        g(frost),
        { x: 2480, z: 2140 },
        g(nunatak),
      ],
    },
    {
      w: 7.2,
      pts: [
        { x: 420, z: -1680 },
        { x: 720, z: -1960 },
        { x: 940, z: -2140 },
        g(moss),
      ],
    },
    {
      w: 7.2,
      pts: [
        { x: -900, z: 280 },
        { x: -1480, z: 560 },
        { x: -1880, z: 760 },
        g(fir),
      ],
    },
  ];
}

export function surfaceAt(x: number, z: number) {
  const m = mountainAt(x, z);
  if (m) {
    if (m.onLava) return { grip: 0.32, drag: 2.1, roll: 2.4, max: 0.42 };
    if (m.mountain.kind === "ice" && (m.onRoad || m.onSummit)) {
      const slick = hash2(Math.floor(x * 0.18), Math.floor(z * 0.18), 4) > 0.28;
      if (slick) return { grip: 0.06, drag: 0.18, roll: 0.16, max: 0.48 };
      return { grip: 0.12, drag: 0.28, roll: 0.3, max: 0.62 };
    }
    if (m.onRoad || m.onSummit) {
      if (m.mountain.kind === "volcano") return { grip: 1.05, drag: 0.95, roll: 0.9, max: 0.96 };
      if (m.mountain.kind === "forest") return { grip: 1.08, drag: 0.9, roll: 0.8, max: 1 };
      return { grip: 1.18, drag: 0.82, roll: 0.72, max: 1.06 };
    }
  }
  const t = trailAt(x, z);
  if (t?.on) return { grip: 1.2, drag: 0.78, roll: 0.68, max: 1.08 };
  const b = biomeAt(x, z);
  if (b === "tundra") return { grip: 0.16, drag: 0.32, roll: 0.35, max: 1.08 };
  if (b === "canyon") return { grip: 1.65, drag: 1.9, roll: 2.55, max: 0.7 };
  if (b === "desert") return { grip: 0.58, drag: 1.22, roll: 1.4, max: 0.9 };
  return { grip: 1, drag: 1, roll: 1, max: 1 };
}

function heightDesert(x: number, z: number) {
  return (
    Math.sin(x * 0.018) * 3.4 +
    Math.cos(z * 0.014) * 3.0 +
    Math.sin(x * 0.041 + z * 0.033) * 1.2 +
    Math.sin(x * 0.007 - z * 0.009) * 4.6 +
    Math.sin(x * 0.0025) * Math.cos(z * 0.0022) * 2.8 +
    Math.sin(x * 0.0031 + z * 0.0044) * 3.4 +
    craterDip(x, z)
  );
}

function heightCanyon(x: number, z: number) {
  const terrace = Math.abs(Math.sin(x * 0.008) * Math.cos(z * 0.007)) * 3.4;
  const ripple = Math.sin(x * 0.022) * 1.4 + Math.cos(z * 0.02) * 1.2;
  const butte = Math.pow(Math.abs(Math.sin(x * 0.0055) * Math.cos(z * 0.0048)), 6) * 11;
  return terrace + ripple + butte + 0.8;
}

function heightForest(x: number, z: number) {
  return (
    Math.sin(x * 0.012) * 2.6 +
    Math.cos(z * 0.011) * 2.8 +
    Math.sin(x * 0.038 + z * 0.029) * 0.9 +
    Math.sin(x * 0.004) * 1.6 +
    1.4
  );
}

function heightTundra(x: number, z: number) {
  return (
    Math.sin(x * 0.008) * 1.6 +
    Math.cos(z * 0.009) * 1.4 +
    Math.sin(x * 0.03 + z * 0.02) * 0.45 +
    Math.abs(Math.sin(x * 0.003 + z * 0.0025)) * 2.2 +
    Math.pow(Math.abs(Math.sin(x * 0.0022) * Math.cos(z * 0.0018)), 5) * 9.5 +
    0.6
  );
}

function sampleHeight(biome: Biome, x: number, z: number) {
  if (biome === "canyon") return heightCanyon(x, z);
  if (biome === "forest") return heightForest(x, z);
  if (biome === "tundra") return heightTundra(x, z);
  return heightDesert(x, z);
}

function groundHeight(x: number, z: number) {
  const r = radial(x, z);
  for (const ring of RINGS) {
    if (r < ring.until - BLEND) return sampleHeight(ring.id, x, z);
    if (r < ring.until) {
      const t = (r - (ring.until - BLEND)) / BLEND;
      const next = RINGS.find((n) => n.until > ring.until)?.id ?? ring.id;
      const s = t * t * (3 - 2 * t);
      return sampleHeight(ring.id, x, z) * (1 - s) + sampleHeight(next, x, z) * s;
    }
  }
  return heightTundra(x, z);
}

export function heightAt(x: number, z: number) {
  const g = groundHeight(x, z) + ridgeRise(x, z);
  const m = mountainAt(x, z);
  let h = g;
  if (m) h = g * (1 - m.blend) + (m.mountain.base + m.rise) * m.blend;
  const t = trailAt(x, z);
  if (t && t.on && !(m && (m.onRoad || m.onSummit))) {
    const flat = groundHeight(t.cx, t.cz) + ridgeRise(t.cx, t.cz) * 0.25;
    h = h * 0.22 + flat * 0.78;
  }
  return h;
}

export function normalAt(x: number, z: number) {
  const e = 0.7;
  const hL = heightAt(x - e, z);
  const hR = heightAt(x + e, z);
  const hD = heightAt(x, z - e);
  const hU = heightAt(x, z + e);
  const nx = hL - hR;
  const nz = hD - hU;
  const ny = 2 * e;
  const len = Math.hypot(nx, ny, nz) || 1;
  return { x: nx / len, y: ny / len, z: nz / len };
}

export const BIOME_GROUND: Record<Biome, number> = {
  desert: 0xb08962,
  canyon: 0x8a4030,
  forest: 0x3f5a38,
  tundra: 0xd5dee4,
};

export const BIOME_FOG: Record<Biome, number> = {
  desert: 0x6a5348,
  canyon: 0x4a2a24,
  forest: 0x2a3a32,
  tundra: 0x8a98a6,
};

export const BIOME_SKY: Record<Biome, number> = {
  desert: 0x6a5348,
  canyon: 0x5a3228,
  forest: 0x4a5e58,
  tundra: 0x9aa8b4,
};

export function groundColor(x: number, z: number) {
  const m = mountainAt(x, z);
  if (m && m.blend > 0.08) {
    const kind = m.mountain.kind;
    if (m.onLava) return 0xe24a18;
    if (m.onSummit) {
      if (kind === "ice") return 0xe8eef6;
      if (kind === "volcano") return 0x2a1c18;
      if (kind === "forest") return 0x6a5a48;
      return m.stripe ? 0xcfc6b6 : 0xb9b1a4;
    }
    if (m.onRoad) {
      if (kind === "ice") return m.stripe ? 0xe4eaf0 : 0x8a9aaa;
      if (kind === "forest") return m.stripe ? 0xc4b49a : 0x3a3228;
      if (kind === "volcano") return m.stripe ? 0xb85a3a : 0x2a2420;
      return m.stripe ? 0xd8cbb0 : 0x2c2e32;
    }
    let rock = 0x4a3a32;
    if (kind === "volcano") rock = 0x3a221c;
    else if (kind === "forest") rock = 0x3a4f34;
    else if (kind === "ice") rock = 0xc5d2de;
    const n = hash2(Math.floor(x * 0.35), Math.floor(z * 0.35), 3);
    const shade = 0.72 + n * 0.38;
    const r = ((rock >> 16) & 255) * shade;
    const g = ((rock >> 8) & 255) * shade;
    const b = (rock & 255) * shade;
    const mixed = (Math.min(255, r) << 16) | (Math.min(255, g) << 8) | Math.min(255, b);
    if (m.blend > 0.85) return mixed;
    const biome = biomeAt(x, z);
    const base = BIOME_GROUND[biome];
    const t = m.blend;
    const br = ((base >> 16) & 255) * (1 - t) + ((mixed >> 16) & 255) * t;
    const bg = ((base >> 8) & 255) * (1 - t) + ((mixed >> 8) & 255) * t;
    const bb = (base & 255) * (1 - t) + (mixed & 255) * t;
    return (br << 16) | (bg << 8) | bb;
  }
  const trail = trailAt(x, z);
  if (trail?.on) return trail.stripe ? 0xd8cbb0 : 0x2a2c30;
  if (trail?.shoulder) return 0x5a4a3c;
  const biome = biomeAt(x, z);
  const base = BIOME_GROUND[biome];
  const n = hash2(Math.floor(x * 0.4), Math.floor(z * 0.4), 7);
  const shade = 0.82 + n * 0.28;
  const r = ((base >> 16) & 255) * shade;
  const g = ((base >> 8) & 255) * shade;
  const b = (base & 255) * shade;
  return (Math.min(255, r) << 16) | (Math.min(255, g) << 8) | Math.min(255, b);
}

export type ObstacleKind =
  | "rock"
  | "crate"
  | "barrel"
  | "cactus"
  | "pine"
  | "ice"
  | "ramp"
  | "fan"
  | "nitro"
  | "curb";

export type Obstacle = {
  x: number;
  z: number;
  y: number;
  r: number;
  kind: ObstacleKind;
  rot: number;
  scale: number;
  taken?: boolean;
};

export const TILE = 72;

export function chunkHitsMountain(ix: number, iz: number) {
  return chunkHitsRoad(ix, iz);
}

export function chunkHitsRoad(ix: number, iz: number) {
  const x0 = ix * TILE;
  const z0 = iz * TILE;
  const x1 = x0 + TILE;
  const z1 = z0 + TILE;
  for (const m of MOUNTAINS) {
    const pad = m.radius + m.approach + 8;
    if (m.x + pad < x0 || m.x - pad > x1 || m.z + pad < z0 || m.z - pad > z1) continue;
    return true;
  }
  for (const trail of TRAILS) {
    for (let i = 0; i < trail.pts.length - 1; i++) {
      const a = trail.pts[i];
      const b = trail.pts[i + 1];
      const minx = Math.min(a.x, b.x) - trail.w;
      const maxx = Math.max(a.x, b.x) + trail.w;
      const minz = Math.min(a.z, b.z) - trail.w;
      const maxz = Math.max(a.z, b.z) + trail.w;
      if (maxx < x0 || minx > x1 || maxz < z0 || minz > z1) continue;
      return true;
    }
  }
  return false;
}

export function obstaclesForChunk(ix: number, iz: number): Obstacle[] {
  const out: Obstacle[] = [];
  const cx = (ix + 0.5) * TILE;
  const cz = (iz + 0.5) * TILE;
  const biome = biomeAt(cx, cz);
  const n = density(biome) + Math.floor(hash2(ix, iz, 9) * 5);
  for (let i = 0; i < n; i++) {
    const u = hash2(ix, iz, 11 + i);
    const v = hash2(ix, iz, 91 + i);
    const k = hash2(ix, iz, 201 + i);
    const x = (ix + u) * TILE;
    const z = (iz + v) * TILE;
    const hit = mountainAt(x, z);
    if (hit && (hit.onRoad || hit.onSummit || hit.rise > 2.2)) continue;
    if (trailAt(x, z)?.on) continue;
    const kind = pickKind(biome, k);
    const scale = scaleFor(kind, hash2(ix, iz, 300 + i));
    const r = radiusFor(kind, scale);
    let crowded = false;
    for (const o of out) {
      const dx = x - o.x;
      const dz = z - o.z;
      if (dx * dx + dz * dz < (r + o.r + 4) * (r + o.r + 4)) {
        crowded = true;
        break;
      }
    }
    if (crowded) continue;
    out.push({
      x,
      z,
      y: heightAt(x, z),
      r,
      kind,
      rot: hash2(ix, iz, 500 + i) * Math.PI * 2,
      scale,
    });
  }
  addStunts(out, ix, iz, biome);
  addMountainProps(out, ix, iz);
  addTrailPickups(out, ix, iz);
  return out;
}

function addMountainProps(out: Obstacle[], ix: number, iz: number) {
  const x0 = ix * TILE;
  const z0 = iz * TILE;
  const x1 = x0 + TILE;
  const z1 = z0 + TILE;
  for (const m of MOUNTAINS) {
    const pad = m.radius + m.approach + 6;
    if (m.x + pad < x0 || m.x - pad > x1 || m.z + pad < z0 || m.z - pad > z1) continue;

    if (m.x >= x0 && m.x < x1 && m.z >= z0 && m.z < z1) {
      if (m.kind === "volcano") {
        const rim = (m.summitR + craterR(m)) * 0.5;
        const nx = m.x + Math.sin(m.rot + 0.9) * rim;
        const nz = m.z + Math.cos(m.rot + 0.9) * rim;
        out.push({
          x: nx,
          z: nz,
          y: heightAt(nx, nz),
          r: 2.2,
          kind: "nitro",
          rot: 0,
          scale: 1,
        });
      } else {
        out.push({
          x: m.x,
          z: m.z,
          y: heightAt(m.x, m.z),
          r: 2.2,
          kind: "nitro",
          rot: 0,
          scale: 1,
        });
      }
    }

    const gateX = m.x + Math.sin(m.rot) * (m.roadStartR + 10);
    const gateZ = m.z + Math.cos(m.rot) * (m.roadStartR + 10);
    if (gateX >= x0 && gateX < x1 && gateZ >= z0 && gateZ < z1) {
      if (!tooClose(out, gateX, gateZ, 5)) {
        out.push({
          x: gateX,
          z: gateZ,
          y: heightAt(gateX, gateZ),
          r: 2.2,
          kind: "nitro",
          rot: 0,
          scale: 1,
        });
      }
    }

    if (m.kind !== "ice") {
      const steps = Math.floor(m.turns * (m.kind === "volcano" ? 70 : 78));
      const rInner = m.summitR + m.roadW * 0.28;
      for (let i = 0; i <= steps; i++) {
        const t = i / steps;
        const theta = m.rot + t * m.turns * Math.PI * 2;
        const rCenter = m.roadStartR + (rInner - m.roadStartR) * t;
        const outerR = rCenter + m.roadW * 0.5;
        const x = m.x + Math.sin(theta) * outerR;
        const z = m.z + Math.cos(theta) * outerR;
        if (x < x0 || x >= x1 || z < z0 || z >= z1) continue;
        out.push({
          x,
          z,
          y: heightAt(x, z),
          r: 0.55,
          kind: "curb",
          rot: theta + Math.PI / 2,
          scale: 1,
        });
      }
    } else {
      const steps = Math.floor(m.turns * (m.name === "White Horizon" ? 28 : 36));
      const rInner = m.summitR + m.roadW * 0.28;
      for (let i = 0; i <= steps; i++) {
        if (i % 4 !== 0) continue;
        const t = i / steps;
        const theta = m.rot + t * m.turns * Math.PI * 2;
        const rCenter = m.roadStartR + (rInner - m.roadStartR) * t;
        const outerR = rCenter + m.roadW * (0.55 + t * 0.35);
        const x = m.x + Math.sin(theta) * outerR;
        const z = m.z + Math.cos(theta) * outerR;
        if (x < x0 || x >= x1 || z < z0 || z >= z1) continue;
        out.push({
          x,
          z,
          y: heightAt(x, z),
          r: 0.85,
          kind: "ice",
          rot: theta,
          scale: 1.25 + t * 0.5,
        });
      }
    }

    if (m.kind !== "ice") {
      for (const side of [-1, 1] as const) {
        const px = m.x + Math.sin(m.rot) * (m.roadStartR + 2) + Math.cos(m.rot) * side * (m.roadW * 0.52);
        const pz = m.z + Math.cos(m.rot) * (m.roadStartR + 2) - Math.sin(m.rot) * side * (m.roadW * 0.52);
        if (px < x0 || px >= x1 || pz < z0 || pz >= z1) continue;
        out.push({
          x: px,
          z: pz,
          y: heightAt(px, pz),
          r: 0.7,
          kind: "curb",
          rot: m.rot,
          scale: 1.6,
        });
      }
    }

    if (m.kind === "forest") {
      for (let i = 0; i < 36; i++) {
        const u = hash2(ix, iz + Math.floor(m.x), 1300 + i);
        const v = hash2(ix + Math.floor(m.z), iz, 1400 + i);
        const ang = u * Math.PI * 2;
        const dist = m.summitR + 8 + v * Math.max(10, m.radius - m.summitR - 14);
        const x = m.x + Math.sin(ang) * dist;
        const z = m.z + Math.cos(ang) * dist;
        if (x < x0 || x >= x1 || z < z0 || z >= z1) continue;
        const hit = mountainAt(x, z);
        if (hit && (hit.onRoad || hit.onSummit || hit.onLava)) continue;
        if (tooClose(out, x, z, 4.2)) continue;
        const sc = 1.35 + hash2(ix, iz, 1500 + i) * 1.35;
        out.push({
          x,
          z,
          y: heightAt(x, z),
          r: 0.55 * sc,
          kind: "pine",
          rot: ang,
          scale: sc,
        });
      }
    }

    if (m.kind === "ice") {
      const shards = m.name === "White Horizon" ? 22 : 10;
      for (let i = 0; i < shards; i++) {
        const u = hash2(ix, iz, 1700 + i);
        const v = hash2(ix, iz, 1800 + i);
        const ang = u * Math.PI * 2;
        const dist = m.summitR + 12 + v * (m.radius - m.summitR - 20);
        const x = m.x + Math.sin(ang) * dist;
        const z = m.z + Math.cos(ang) * dist;
        if (x < x0 || x >= x1 || z < z0 || z >= z1) continue;
        const hit = mountainAt(x, z);
        if (hit && hit.onRoad) continue;
        if (tooClose(out, x, z, 5)) continue;
        const sc = 1.1 + hash2(ix, iz, 1900 + i) * 1.6;
        out.push({
          x,
          z,
          y: heightAt(x, z),
          r: 0.7 * sc,
          kind: "ice",
          rot: ang,
          scale: sc,
        });
      }
    }
  }
}

function addStunts(out: Obstacle[], ix: number, iz: number, biome: Biome) {
  const wantRamp = biome === "desert" || biome === "canyon" || biome === "tundra";
  const wantFan = biome === "desert" || biome === "canyon";
  if (wantRamp) {
    const count = biome === "desert" ? 1 + (hash2(ix, iz, 77) > 0.45 ? 1 : 0) : 1;
    for (let i = 0; i < count; i++) {
      const u = hash2(ix, iz, 801 + i);
      const v = hash2(ix, iz, 811 + i);
      const x = (ix + 0.2 + u * 0.6) * TILE;
      const z = (iz + 0.2 + v * 0.6) * TILE;
      const hit = mountainAt(x, z);
      if (hit && (hit.onRoad || hit.onSummit || hit.rise > 3)) continue;
      if (trailAt(x, z)?.on) continue;
      if (tooClose(out, x, z, 8)) continue;
      out.push({
        x,
        z,
        y: heightAt(x, z),
        r: 4.2,
        kind: "ramp",
        rot: hash2(ix, iz, 821 + i) * Math.PI * 2,
        scale: 1,
      });
    }
  }
  if (wantFan) {
    const u = hash2(ix, iz, 901);
    const v = hash2(ix, iz, 911);
    const x = (ix + 0.25 + u * 0.5) * TILE;
    const z = (iz + 0.25 + v * 0.5) * TILE;
    const hit = mountainAt(x, z);
    if (!(hit && (hit.onRoad || hit.onSummit || hit.rise > 3)) && !trailAt(x, z)?.on && !tooClose(out, x, z, 7)) {
      out.push({
        x,
        z,
        y: heightAt(x, z),
        r: 3.4,
        kind: "fan",
        rot: hash2(ix, iz, 921) * Math.PI * 2,
        scale: 1,
      });
    }
  }
  if (ix === 0 && iz === 0) {
    out.push({
      x: 16,
      z: -28,
      y: heightAt(16, -28),
      r: 4.2,
      kind: "ramp",
      rot: 0,
      scale: 1,
    });
    out.push({
      x: -22,
      z: -36,
      y: heightAt(-22, -36),
      r: 3.4,
      kind: "fan",
      rot: 0,
      scale: 1,
    });
    out.push({
      x: 8,
      z: -12,
      y: heightAt(8, -12),
      r: 2.2,
      kind: "nitro",
      rot: 0,
      scale: 1,
    });
  }
  if (hash2(ix, iz, 70) > 0.38) {
    const u = hash2(ix, iz, 71);
    const v = hash2(ix, iz, 72);
    const x = (ix + 0.3 + u * 0.4) * TILE;
    const z = (iz + 0.3 + v * 0.4) * TILE;
    const hit = mountainAt(x, z);
    if (!(hit && (hit.onRoad || hit.rise > 4)) && !tooClose(out, x, z, 6)) {
      out.push({
        x,
        z,
        y: heightAt(x, z),
        r: 2.2,
        kind: "nitro",
        rot: 0,
        scale: 1,
      });
    }
  }
}

function addTrailPickups(out: Obstacle[], ix: number, iz: number) {
  const x0 = ix * TILE;
  const z0 = iz * TILE;
  const x1 = x0 + TILE;
  const z1 = z0 + TILE;
  for (const trail of TRAILS) {
    for (let i = 1; i < trail.pts.length - 1; i++) {
      const p = trail.pts[i];
      if (p.x < x0 || p.x >= x1 || p.z < z0 || p.z >= z1) continue;
      if (hash2(ix, iz, 40 + i) < 0.42) continue;
      if (tooClose(out, p.x, p.z, 6)) continue;
      out.push({
        x: p.x,
        z: p.z,
        y: heightAt(p.x, p.z),
        r: 2.2,
        kind: "nitro",
        rot: 0,
        scale: 1,
      });
    }
  }
}

function tooClose(out: Obstacle[], x: number, z: number, min: number) {
  for (const o of out) {
    const dx = x - o.x;
    const dz = z - o.z;
    if (dx * dx + dz * dz < min * min) return true;
  }
  return false;
}

function density(biome: Biome) {
  if (biome === "forest") return 8;
  if (biome === "canyon") return 5;
  if (biome === "tundra") return 5;
  return 5;
}

function pickKind(biome: Biome, k: number): ObstacleKind {
  if (biome === "canyon") {
    if (k < 0.5) return "rock";
    if (k < 0.78) return "crate";
    return "barrel";
  }
  if (biome === "forest") {
    if (k < 0.62) return "pine";
    if (k < 0.82) return "rock";
    return "crate";
  }
  if (biome === "tundra") {
    if (k < 0.55) return "ice";
    if (k < 0.78) return "rock";
    return "pine";
  }
  if (k < 0.4) return "rock";
  if (k < 0.62) return "cactus";
  if (k < 0.82) return "barrel";
  return "crate";
}

function scaleFor(kind: ObstacleKind, h: number) {
  if (kind === "rock") return 0.9 + h * 1.15;
  if (kind === "cactus") return 0.9 + h * 0.7;
  if (kind === "pine") return 1.2 + h * 1.1;
  if (kind === "ice") return 0.85 + h * 0.9;
  return 1;
}

function radiusFor(kind: ObstacleKind, scale: number) {
  if (kind === "rock") return 0.72 * scale;
  if (kind === "crate") return 0.85;
  if (kind === "barrel") return 0.62;
  if (kind === "cactus") return 0.42 * scale;
  if (kind === "pine") return 0.55 * scale;
  if (kind === "ramp") return 4.2;
  if (kind === "fan") return 3.4;
  if (kind === "nitro") return 2.2;
  if (kind === "curb") return 0.5 * scale;
  return 0.7 * scale;
}

for (const m of MOUNTAINS) {
  m.rot = Math.atan2(-m.x, -m.z);
  m.base = groundHeight(m.x, m.z);
}
buildTrails();
