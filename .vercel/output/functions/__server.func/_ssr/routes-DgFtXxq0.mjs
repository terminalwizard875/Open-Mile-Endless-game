import { i as __toESM } from "../_runtime.mjs";
import { L as require_react, v as require_jsx_runtime } from "../_libs/@tanstack/react-router+[...].mjs";
import { a as House, i as Pause, n as RotateCcw, o as Gauge, r as Play } from "../_libs/lucide-react.mjs";
import { C as Scene, E as Vector3, S as SRGBColorSpace, T as TorusGeometry, _ as Object3D, a as ConeGeometry, b as PlaneGeometry, c as DodecahedronGeometry, d as Group, f as HemisphereLight, g as MeshStandardMaterial, h as Mesh, i as Color, l as DynamicDrawUsage, m as Matrix4, n as BoxGeometry, o as CylinderGeometry, p as InstancedMesh, r as BufferAttribute, s as DirectionalLight, t as WebGLRenderer, u as Fog, v as OctahedronGeometry, w as Timer, x as Quaternion, y as PerspectiveCamera } from "../_libs/three.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/routes-DgFtXxq0.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
var STEER_LEFT = /* @__PURE__ */ new Set(["KeyA", "ArrowLeft"]);
var STEER_RIGHT = /* @__PURE__ */ new Set(["KeyD", "ArrowRight"]);
var THROTTLE = /* @__PURE__ */ new Set(["KeyW", "ArrowUp"]);
var BRAKE$1 = /* @__PURE__ */ new Set(["KeyS", "ArrowDown"]);
var Input = class {
	held = /* @__PURE__ */ new Set();
	override = null;
	injectedSteer = null;
	lastSpace = -1;
	spaceDownAt = -1;
	nitroQueued = false;
	muteHandbrakeUntil = 0;
	touchSteer = 0;
	touchThrottle = 0;
	touchBrake = 0;
	touchHandbrake = false;
	attach() {
		window.addEventListener("keydown", this.onDown);
		window.addEventListener("keyup", this.onUp);
		window.addEventListener("blur", this.clear);
		document.addEventListener("visibilitychange", this.onVis);
	}
	detach() {
		window.removeEventListener("keydown", this.onDown);
		window.removeEventListener("keyup", this.onUp);
		window.removeEventListener("blur", this.clear);
		document.removeEventListener("visibilitychange", this.onVis);
		this.held.clear();
	}
	setKeys(codes) {
		this.override = codes;
	}
	setSteer(v) {
		this.injectedSteer = v;
	}
	queueNitro() {
		this.nitroQueued = true;
		this.muteHandbrakeUntil = performance.now() + 280;
	}
	consumeNitro() {
		const v = this.nitroQueued;
		this.nitroQueued = false;
		return v;
	}
	clearInject() {
		this.override = null;
		this.injectedSteer = null;
	}
	codes() {
		return this.override ?? this.held;
	}
	steer() {
		if (this.injectedSteer != null) return clamp(this.injectedSteer, -1, 1);
		let s = this.touchSteer;
		for (const c of this.codes()) {
			if (STEER_LEFT.has(c)) s += 1;
			if (STEER_RIGHT.has(c)) s -= 1;
		}
		return clamp(s, -1, 1);
	}
	throttle() {
		let t = this.touchThrottle;
		for (const c of this.codes()) if (THROTTLE.has(c)) t = 1;
		return clamp(t, 0, 1);
	}
	brake() {
		let b = this.touchBrake;
		for (const c of this.codes()) if (BRAKE$1.has(c)) b = 1;
		return clamp(b, 0, 1);
	}
	handbrake() {
		if (performance.now() < this.muteHandbrakeUntil) return false;
		if (this.touchHandbrake) return true;
		const now = performance.now();
		if (this.held.has("Space") && this.spaceDownAt > 0 && now - this.spaceDownAt > 180) return true;
		for (const c of this.codes()) if (c === "ShiftLeft" || c === "ShiftRight") return true;
		return false;
	}
	pausePressed(code) {
		return code === "Escape" || code === "KeyP";
	}
	onDown = (e) => {
		if (e.code === "Space" || e.code.startsWith("Arrow")) e.preventDefault();
		if (e.repeat) return;
		if (e.code === "Space") {
			const now = performance.now();
			if (now - this.lastSpace < 280) {
				this.nitroQueued = true;
				this.muteHandbrakeUntil = now + 280;
			}
			this.lastSpace = now;
			this.spaceDownAt = now;
		}
		this.held.add(e.code);
	};
	onUp = (e) => {
		this.held.delete(e.code);
		if (e.code === "Space") this.spaceDownAt = -1;
	};
	clear = () => {
		this.held.clear();
		this.spaceDownAt = -1;
	};
	onVis = () => {
		if (document.hidden) this.clear();
	};
};
function clamp(v, a, b) {
	return Math.max(a, Math.min(b, v));
}
function hash2(ix, iz, salt = 0) {
	let n = ix * 374761393 + iz * 668265263 + salt * 1274126177 | 0;
	n = (n ^ n >>> 13) * 1274126177;
	return ((n ^ n >>> 16) >>> 0) / 4294967296;
}
var BIOME_LABEL = {
	desert: "Dune Sea",
	canyon: "Red Mesa",
	forest: "Pine Range",
	tundra: "White Shelf"
};
var RINGS = [
	{
		id: "desert",
		until: 720
	},
	{
		id: "canyon",
		until: 1680
	},
	{
		id: "forest",
		until: 2680
	},
	{
		id: "tundra",
		until: Infinity
	}
];
var BLEND = 140;
function radial(x, z) {
	return Math.hypot(x, z);
}
function biomeAt(x, z) {
	const r = radial(x, z);
	for (const ring of RINGS) if (r < ring.until) return ring.id;
	return "tundra";
}
var MOUNTAINS = [
	{
		name: "Dune Coil",
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
		base: 0
	},
	{
		name: "Sand Spire",
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
		base: 0
	},
	{
		name: "Clay Crown",
		x: 940,
		z: 640,
		radius: 92,
		height: 56,
		summitR: 17,
		roadW: 8.8,
		turns: 3.35,
		roadStartR: 80,
		approach: 32,
		rot: 0,
		base: 0
	},
	{
		name: "Pine Helix",
		x: -1520,
		z: -1480,
		radius: 88,
		height: 52,
		summitR: 16,
		roadW: 8.4,
		turns: 3.2,
		roadStartR: 76,
		approach: 30,
		rot: 0,
		base: 0
	},
	{
		name: "Frost Spire",
		x: 2240,
		z: 2080,
		radius: 100,
		height: 62,
		summitR: 18,
		roadW: 9,
		turns: 3.5,
		roadStartR: 86,
		approach: 34,
		rot: 0,
		base: 0
	},
	{
		name: "Twin Needle",
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
		base: 0
	},
	{
		name: "Coil Sister",
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
		base: 0
	},
	{
		name: "Red Stack",
		x: 620,
		z: 280,
		radius: 72,
		height: 46,
		summitR: 13,
		roadW: 8,
		turns: 2.85,
		roadStartR: 60,
		approach: 24,
		rot: 0,
		base: 0
	}
];
var _hit = {
	mountain: MOUNTAINS[0],
	rise: 0,
	blend: 0,
	onRoad: false,
	onSummit: false,
	stripe: false,
	name: ""
};
function wrapPi(a) {
	const t = Math.PI * 2;
	let x = a;
	while (x > Math.PI) x -= t;
	while (x < -Math.PI) x += t;
	return x;
}
function coneRise(m, dist) {
	if (dist <= m.summitR) return m.height;
	if (dist >= m.radius) return 0;
	const u = 1 - (dist - m.summitR) / (m.radius - m.summitR);
	return m.height * Math.pow(Math.max(0, u), 1.08);
}
function mountainAt(x, z) {
	let found = null;
	let bestDist = Infinity;
	for (const m of MOUNTAINS) {
		const dx = x - m.x;
		const dz = z - m.z;
		const dist = Math.hypot(dx, dz);
		if (dist > m.radius + m.approach + 6) continue;
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
	const rInner = m.summitR + m.roadW * .28;
	const cone = coneRise(m, dist);
	let rise = cone;
	let onRoad = false;
	let onSummit = dist <= m.summitR;
	let stripe = false;
	if (onSummit) rise = m.height;
	else {
		let bestOff = Infinity;
		let bestCenter = dist;
		let bestTheta = ang;
		const k0 = Math.floor((m.rot - ang) / twoPi) - 1;
		const k1 = k0 + Math.ceil(m.turns) + 4;
		for (let k = k0; k <= k1; k++) {
			const theta = ang + k * twoPi;
			const t = (theta - m.rot) / span;
			if (t < -.03 || t > 1.04) continue;
			const tc = t < 0 ? 0 : t > 1 ? 1 : t;
			const rCenter = m.roadStartR + (rInner - m.roadStartR) * tc;
			const off = Math.abs(dist - rCenter);
			if (off < bestOff) {
				bestOff = off;
				bestCenter = rCenter;
				bestTheta = theta;
			}
		}
		const half = m.roadW * .5;
		const edge = 2.4;
		if (bestOff < half + edge) {
			const roadH = coneRise(m, bestCenter);
			if (bestOff <= half) {
				rise = roadH;
				onRoad = true;
				const along = (bestTheta - m.rot) * bestCenter;
				stripe = Math.abs(dist - bestCenter) < .42 && Math.sin(along * .55) > .28;
			} else {
				const f = 1 - (bestOff - half) / edge;
				const s = f * f * (3 - 2 * f);
				rise = roadH * s + cone * (1 - s);
				onRoad = s > .62;
			}
		}
		const dAng = wrapPi(ang - m.rot);
		const arc = Math.abs(dAng) * Math.max(dist, 1);
		const outer = m.roadStartR + m.approach;
		if (dist >= m.roadStartR - 1.2 && dist <= outer && arc < m.roadW * .58) {
			const gateH = coneRise(m, m.roadStartR);
			const tA = (outer - dist) / m.approach;
			const hA = gateH * Math.max(0, Math.min(1, tA));
			if (hA >= rise) {
				rise = hA;
				onRoad = true;
				stripe = Math.abs(arc) < .4 && Math.sin(dist * .7) > .25;
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
	if (onRoad || onSummit) blend = Math.max(blend, .92);
	_hit.mountain = m;
	_hit.rise = rise;
	_hit.blend = blend;
	_hit.onRoad = onRoad;
	_hit.onSummit = onSummit;
	_hit.stripe = stripe;
	_hit.name = m.name;
	return _hit;
}
var TRAILS = [];
var RIDGES = [
	{
		ax: 112,
		az: -84,
		bx: 208,
		bz: -252,
		h: 18,
		w: 26
	},
	{
		ax: 112,
		az: -84,
		bx: 168,
		bz: -26,
		h: 12,
		w: 20
	},
	{
		ax: 168,
		az: -26,
		bx: 208,
		bz: -252,
		h: 9,
		w: 16
	}
];
var _trail = {
	on: false,
	stripe: false,
	shoulder: false,
	cx: 0,
	cz: 0
};
function projectSeg(px, pz, ax, az, bx, bz) {
	const abx = bx - ax;
	const abz = bz - az;
	const ab2 = abx * abx + abz * abz || 1;
	let t = ((px - ax) * abx + (pz - az) * abz) / ab2;
	t = t < 0 ? 0 : t > 1 ? 1 : t;
	const cx = ax + abx * t;
	const cz = az + abz * t;
	const dx = px - cx;
	const dz = pz - cz;
	return {
		d: Math.hypot(dx, dz),
		t,
		cx,
		cz,
		len: Math.sqrt(ab2)
	};
}
function trailAt(x, z) {
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
	const half = w * .5;
	if (best > half + 1.8) return null;
	_trail.on = best <= half;
	_trail.shoulder = !_trail.on;
	_trail.stripe = _trail.on && Math.abs(best) < .38 && Math.sin(along * .62) > .22;
	_trail.cx = cx;
	_trail.cz = cz;
	return _trail;
}
function craterDip(x, z) {
	const dx = x + 52;
	const dz = z + 172;
	const d = Math.hypot(dx, dz);
	if (d > 64) return 0;
	if (d < 16) return -9.5;
	if (d < 36) return -9.5 * (1 - (d - 16) / 20);
	const u = 1 - Math.abs(d - 46) / 18;
	return Math.max(0, u) * 5.2;
}
function ridgeRise(x, z) {
	let h = 0;
	for (const r of RIDGES) {
		const p = projectSeg(x, z, r.ax, r.az, r.bx, r.bz);
		if (p.d > r.w) continue;
		const end = Math.min(p.t, 1 - p.t, .18) / .18;
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
	const sister = MOUNTAINS.find((m) => m.name === "Coil Sister");
	const twin = MOUNTAINS.find((m) => m.name === "Twin Needle");
	const stack = MOUNTAINS.find((m) => m.name === "Red Stack");
	const sand = MOUNTAINS.find((m) => m.name === "Sand Spire");
	const clay = MOUNTAINS.find((m) => m.name === "Clay Crown");
	const pine = MOUNTAINS.find((m) => m.name === "Pine Helix");
	const frost = MOUNTAINS.find((m) => m.name === "Frost Spire");
	const g = (m) => ({
		x: m.x + Math.sin(m.rot) * (m.roadStartR + 10),
		z: m.z + Math.cos(m.rot) * (m.roadStartR + 10)
	});
	TRAILS = [
		{
			w: 7.5,
			pts: [
				{
					x: 2,
					z: 12
				},
				{
					x: 8,
					z: -38
				},
				{
					x: 16,
					z: -96
				},
				{
					x: 10,
					z: -168
				},
				{
					x: 26,
					z: -258
				},
				{
					x: 4,
					z: -372
				},
				{
					x: -22,
					z: -492
				},
				{
					x: 30,
					z: -612
				},
				{
					x: 8,
					z: -730
				}
			]
		},
		{
			w: 7.6,
			pts: [
				{
					x: 6,
					z: -10
				},
				{
					x: 22,
					z: -22
				},
				{
					x: gateX,
					z: gateZ
				}
			]
		},
		{
			w: 7.2,
			pts: [
				{
					x: gateX,
					z: gateZ
				},
				{
					x: (gateX + g(sister).x) * .5,
					z: (gateZ + g(sister).z) * .5
				},
				g(sister)
			]
		},
		{
			w: 7.2,
			pts: [
				{
					x: 16,
					z: -96
				},
				{
					x: 80,
					z: -160
				},
				{
					x: 140,
					z: -210
				},
				g(twin)
			]
		},
		{
			w: 7.4,
			pts: [
				{
					x: 8,
					z: -38
				},
				{
					x: -70,
					z: 40
				},
				{
					x: -180,
					z: 120
				},
				{
					x: -300,
					z: 200
				},
				g(sand)
			]
		},
		{
			w: 7.6,
			pts: [
				{
					x: 16,
					z: -96
				},
				{
					x: 120,
					z: 20
				},
				{
					x: 280,
					z: 90
				},
				{
					x: 450,
					z: 180
				},
				g(stack),
				{
					x: 780,
					z: 460
				},
				g(clay)
			]
		},
		{
			w: 7.2,
			pts: [
				{
					x: -900,
					z: -980
				},
				{
					x: -1180,
					z: -1200
				},
				{
					x: -1380,
					z: -1380
				},
				g(pine)
			]
		},
		{
			w: 7.4,
			pts: [
				{
					x: 1680,
					z: 1560
				},
				{
					x: 1940,
					z: 1800
				},
				{
					x: 2140,
					z: 1980
				},
				g(frost)
			]
		}
	];
}
function surfaceAt(x, z) {
	const m = mountainAt(x, z);
	if (m && (m.onRoad || m.onSummit)) return {
		grip: 1.18,
		drag: .82,
		roll: .72,
		max: 1.06
	};
	if (trailAt(x, z)?.on) return {
		grip: 1.2,
		drag: .78,
		roll: .68,
		max: 1.08
	};
	const b = biomeAt(x, z);
	if (b === "tundra") return {
		grip: .16,
		drag: .32,
		roll: .35,
		max: 1.08
	};
	if (b === "canyon") return {
		grip: 1.65,
		drag: 1.9,
		roll: 2.55,
		max: .7
	};
	if (b === "desert") return {
		grip: .58,
		drag: 1.22,
		roll: 1.4,
		max: .9
	};
	return {
		grip: 1,
		drag: 1,
		roll: 1,
		max: 1
	};
}
function heightDesert(x, z) {
	return Math.sin(x * .018) * 3.4 + Math.cos(z * .014) * 3 + Math.sin(x * .041 + z * .033) * 1.2 + Math.sin(x * .007 - z * .009) * 4.6 + Math.sin(x * .0025) * Math.cos(z * .0022) * 2.8 + Math.sin(x * .0031 + z * .0044) * 3.4 + craterDip(x, z);
}
function heightCanyon(x, z) {
	const terrace = Math.abs(Math.sin(x * .008) * Math.cos(z * .007)) * 3.4;
	const ripple = Math.sin(x * .022) * 1.4 + Math.cos(z * .02) * 1.2;
	const butte = Math.pow(Math.abs(Math.sin(x * .0055) * Math.cos(z * .0048)), 6) * 11;
	return terrace + ripple + butte + .8;
}
function heightForest(x, z) {
	return Math.sin(x * .012) * 2.6 + Math.cos(z * .011) * 2.8 + Math.sin(x * .038 + z * .029) * .9 + Math.sin(x * .004) * 1.6 + 1.4;
}
function heightTundra(x, z) {
	return Math.sin(x * .008) * 1.6 + Math.cos(z * .009) * 1.4 + Math.sin(x * .03 + z * .02) * .45 + Math.abs(Math.sin(x * .003 + z * .0025)) * 2.2 + .6;
}
function sampleHeight(biome, x, z) {
	if (biome === "canyon") return heightCanyon(x, z);
	if (biome === "forest") return heightForest(x, z);
	if (biome === "tundra") return heightTundra(x, z);
	return heightDesert(x, z);
}
function groundHeight(x, z) {
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
function heightAt(x, z) {
	const g = groundHeight(x, z) + ridgeRise(x, z);
	const m = mountainAt(x, z);
	let h = g;
	if (m) h = g * (1 - m.blend) + (m.mountain.base + m.rise) * m.blend;
	const t = trailAt(x, z);
	if (t && t.on && !(m && (m.onRoad || m.onSummit))) {
		const flat = groundHeight(t.cx, t.cz) + ridgeRise(t.cx, t.cz) * .25;
		h = h * .22 + flat * .78;
	}
	return h;
}
function normalAt(x, z) {
	const e = .7;
	const hL = heightAt(x - e, z);
	const hR = heightAt(x + e, z);
	const hD = heightAt(x, z - e);
	const hU = heightAt(x, z + e);
	const nx = hL - hR;
	const nz = hD - hU;
	const ny = 2 * e;
	const len = Math.hypot(nx, ny, nz) || 1;
	return {
		x: nx / len,
		y: ny / len,
		z: nz / len
	};
}
var BIOME_GROUND = {
	desert: 11569506,
	canyon: 9060400,
	forest: 4151864,
	tundra: 14016228
};
var BIOME_FOG = {
	desert: 6968136,
	canyon: 4860452,
	forest: 2767410,
	tundra: 9083046
};
var BIOME_SKY = {
	desert: 6968136,
	canyon: 5911080,
	forest: 4873816,
	tundra: 10135732
};
function groundColor(x, z) {
	const m = mountainAt(x, z);
	if (m && m.blend > .08) {
		if (m.onSummit) return m.stripe ? 13616822 : 12169636;
		if (m.onRoad) return m.stripe ? 14207920 : 2895410;
		const shade = .72 + hash2(Math.floor(x * .35), Math.floor(z * .35), 3) * .38;
		const r = 74 * shade;
		const g = 58 * shade;
		const b = 50 * shade;
		const mixed = Math.min(255, r) << 16 | Math.min(255, g) << 8 | Math.min(255, b);
		if (m.blend > .85) return mixed;
		const base = BIOME_GROUND[biomeAt(x, z)];
		const t = m.blend;
		const br = (base >> 16 & 255) * (1 - t) + (mixed >> 16 & 255) * t;
		const bg = (base >> 8 & 255) * (1 - t) + (mixed >> 8 & 255) * t;
		const bb = (base & 255) * (1 - t) + (mixed & 255) * t;
		return br << 16 | bg << 8 | bb;
	}
	const trail = trailAt(x, z);
	if (trail?.on) return trail.stripe ? 14207920 : 2763824;
	if (trail?.shoulder) return 5917244;
	const base = BIOME_GROUND[biomeAt(x, z)];
	const shade = .82 + hash2(Math.floor(x * .4), Math.floor(z * .4), 7) * .28;
	const r = (base >> 16 & 255) * shade;
	const g = (base >> 8 & 255) * shade;
	const b = (base & 255) * shade;
	return Math.min(255, r) << 16 | Math.min(255, g) << 8 | Math.min(255, b);
}
function chunkHitsMountain(ix, iz) {
	return chunkHitsRoad(ix, iz);
}
function chunkHitsRoad(ix, iz) {
	const x0 = ix * 72;
	const z0 = iz * 72;
	const x1 = x0 + 72;
	const z1 = z0 + 72;
	for (const m of MOUNTAINS) {
		const pad = m.radius + m.approach + 8;
		if (m.x + pad < x0 || m.x - pad > x1 || m.z + pad < z0 || m.z - pad > z1) continue;
		return true;
	}
	for (const trail of TRAILS) for (let i = 0; i < trail.pts.length - 1; i++) {
		const a = trail.pts[i];
		const b = trail.pts[i + 1];
		const minx = Math.min(a.x, b.x) - trail.w;
		const maxx = Math.max(a.x, b.x) + trail.w;
		const minz = Math.min(a.z, b.z) - trail.w;
		const maxz = Math.max(a.z, b.z) + trail.w;
		if (maxx < x0 || minx > x1 || maxz < z0 || minz > z1) continue;
		return true;
	}
	return false;
}
function obstaclesForChunk(ix, iz) {
	const out = [];
	const biome = biomeAt((ix + .5) * 72, (iz + .5) * 72);
	const n = density(biome) + Math.floor(hash2(ix, iz, 9) * 5);
	for (let i = 0; i < n; i++) {
		const u = hash2(ix, iz, 11 + i);
		const v = hash2(ix, iz, 91 + i);
		const k = hash2(ix, iz, 201 + i);
		const x = (ix + u) * 72;
		const z = (iz + v) * 72;
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
			scale
		});
	}
	addStunts(out, ix, iz, biome);
	addMountainProps(out, ix, iz);
	addTrailPickups(out, ix, iz);
	return out;
}
function addMountainProps(out, ix, iz) {
	const x0 = ix * 72;
	const z0 = iz * 72;
	const x1 = x0 + 72;
	const z1 = z0 + 72;
	for (const m of MOUNTAINS) {
		const pad = m.radius + m.approach + 6;
		if (m.x + pad < x0 || m.x - pad > x1 || m.z + pad < z0 || m.z - pad > z1) continue;
		if (m.x >= x0 && m.x < x1 && m.z >= z0 && m.z < z1) out.push({
			x: m.x,
			z: m.z,
			y: heightAt(m.x, m.z),
			r: 2.2,
			kind: "nitro",
			rot: 0,
			scale: 1
		});
		const gateX = m.x + Math.sin(m.rot) * (m.roadStartR + 10);
		const gateZ = m.z + Math.cos(m.rot) * (m.roadStartR + 10);
		if (gateX >= x0 && gateX < x1 && gateZ >= z0 && gateZ < z1) {
			if (!tooClose(out, gateX, gateZ, 5)) out.push({
				x: gateX,
				z: gateZ,
				y: heightAt(gateX, gateZ),
				r: 2.2,
				kind: "nitro",
				rot: 0,
				scale: 1
			});
		}
		const steps = Math.floor(m.turns * 78);
		const rInner = m.summitR + m.roadW * .28;
		for (let i = 0; i <= steps; i++) {
			const t = i / steps;
			const theta = m.rot + t * m.turns * Math.PI * 2;
			const outerR = m.roadStartR + (rInner - m.roadStartR) * t + m.roadW * .5;
			const x = m.x + Math.sin(theta) * outerR;
			const z = m.z + Math.cos(theta) * outerR;
			if (x < x0 || x >= x1 || z < z0 || z >= z1) continue;
			out.push({
				x,
				z,
				y: heightAt(x, z),
				r: .55,
				kind: "curb",
				rot: theta + Math.PI / 2,
				scale: 1
			});
		}
		for (const side of [-1, 1]) {
			const px = m.x + Math.sin(m.rot) * (m.roadStartR + 2) + Math.cos(m.rot) * side * (m.roadW * .52);
			const pz = m.z + Math.cos(m.rot) * (m.roadStartR + 2) - Math.sin(m.rot) * side * (m.roadW * .52);
			if (px < x0 || px >= x1 || pz < z0 || pz >= z1) continue;
			out.push({
				x: px,
				z: pz,
				y: heightAt(px, pz),
				r: .7,
				kind: "curb",
				rot: m.rot,
				scale: 1.6
			});
		}
	}
}
function addStunts(out, ix, iz, biome) {
	const wantRamp = biome === "desert" || biome === "canyon" || biome === "tundra";
	const wantFan = biome === "desert" || biome === "canyon";
	if (wantRamp) {
		const count = biome === "desert" ? 1 + (hash2(ix, iz, 77) > .45 ? 1 : 0) : 1;
		for (let i = 0; i < count; i++) {
			const u = hash2(ix, iz, 801 + i);
			const v = hash2(ix, iz, 811 + i);
			const x = (ix + .2 + u * .6) * 72;
			const z = (iz + .2 + v * .6) * 72;
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
				scale: 1
			});
		}
	}
	if (wantFan) {
		const u = hash2(ix, iz, 901);
		const v = hash2(ix, iz, 911);
		const x = (ix + .25 + u * .5) * 72;
		const z = (iz + .25 + v * .5) * 72;
		const hit = mountainAt(x, z);
		if (!(hit && (hit.onRoad || hit.onSummit || hit.rise > 3)) && !trailAt(x, z)?.on && !tooClose(out, x, z, 7)) out.push({
			x,
			z,
			y: heightAt(x, z),
			r: 3.4,
			kind: "fan",
			rot: hash2(ix, iz, 921) * Math.PI * 2,
			scale: 1
		});
	}
	if (ix === 0 && iz === 0) {
		out.push({
			x: 16,
			z: -28,
			y: heightAt(16, -28),
			r: 4.2,
			kind: "ramp",
			rot: 0,
			scale: 1
		});
		out.push({
			x: -22,
			z: -36,
			y: heightAt(-22, -36),
			r: 3.4,
			kind: "fan",
			rot: 0,
			scale: 1
		});
		out.push({
			x: 8,
			z: -12,
			y: heightAt(8, -12),
			r: 2.2,
			kind: "nitro",
			rot: 0,
			scale: 1
		});
	}
	if (hash2(ix, iz, 70) > .38) {
		const u = hash2(ix, iz, 71);
		const v = hash2(ix, iz, 72);
		const x = (ix + .3 + u * .4) * 72;
		const z = (iz + .3 + v * .4) * 72;
		const hit = mountainAt(x, z);
		if (!(hit && (hit.onRoad || hit.rise > 4)) && !tooClose(out, x, z, 6)) out.push({
			x,
			z,
			y: heightAt(x, z),
			r: 2.2,
			kind: "nitro",
			rot: 0,
			scale: 1
		});
	}
}
function addTrailPickups(out, ix, iz) {
	const x0 = ix * 72;
	const z0 = iz * 72;
	const x1 = x0 + 72;
	const z1 = z0 + 72;
	for (const trail of TRAILS) for (let i = 1; i < trail.pts.length - 1; i++) {
		const p = trail.pts[i];
		if (p.x < x0 || p.x >= x1 || p.z < z0 || p.z >= z1) continue;
		if (hash2(ix, iz, 40 + i) < .42) continue;
		if (tooClose(out, p.x, p.z, 6)) continue;
		out.push({
			x: p.x,
			z: p.z,
			y: heightAt(p.x, p.z),
			r: 2.2,
			kind: "nitro",
			rot: 0,
			scale: 1
		});
	}
}
function tooClose(out, x, z, min) {
	for (const o of out) {
		const dx = x - o.x;
		const dz = z - o.z;
		if (dx * dx + dz * dz < min * min) return true;
	}
	return false;
}
function density(biome) {
	if (biome === "forest") return 8;
	if (biome === "canyon") return 5;
	if (biome === "tundra") return 5;
	return 5;
}
function pickKind(biome, k) {
	if (biome === "canyon") {
		if (k < .5) return "rock";
		if (k < .78) return "crate";
		return "barrel";
	}
	if (biome === "forest") {
		if (k < .62) return "pine";
		if (k < .82) return "rock";
		return "crate";
	}
	if (biome === "tundra") {
		if (k < .55) return "ice";
		if (k < .78) return "rock";
		return "pine";
	}
	if (k < .4) return "rock";
	if (k < .62) return "cactus";
	if (k < .82) return "barrel";
	return "crate";
}
function scaleFor(kind, h) {
	if (kind === "rock") return .9 + h * 1.15;
	if (kind === "cactus") return .9 + h * .7;
	if (kind === "pine") return 1.2 + h * 1.1;
	if (kind === "ice") return .85 + h * .9;
	return 1;
}
function radiusFor(kind, scale) {
	if (kind === "rock") return .72 * scale;
	if (kind === "crate") return .85;
	if (kind === "barrel") return .62;
	if (kind === "cactus") return .42 * scale;
	if (kind === "pine") return .55 * scale;
	if (kind === "ramp") return 4.2;
	if (kind === "fan") return 3.4;
	if (kind === "nitro") return 2.2;
	if (kind === "curb") return .5 * scale;
	return .7 * scale;
}
for (const m of MOUNTAINS) {
	m.rot = Math.atan2(-m.x, -m.z);
	m.base = groundHeight(m.x, m.z);
}
buildTrails();
var VEH_KEY = "openmile-vehicle";
var VEHICLES = [{
	id: "coupe",
	name: "Nightline",
	tag: "Road coupe",
	blurb: "Low, sharp, honest.",
	accel: 30,
	maxFwd: 64,
	nitroTime: 2.5,
	nitroPush: 18,
	nitroMul: 1.85,
	nitroMax: 3,
	crashImpact: 36,
	turn: 1.85,
	ride: .42
}, {
	id: "baja",
	name: "Volt Crawler",
	tag: "Trophy truck",
	blurb: "Oversized tires. Mean boost.",
	accel: 44,
	maxFwd: 72,
	nitroTime: 3.8,
	nitroPush: 30,
	nitroMul: 2.25,
	nitroMax: 4,
	crashImpact: 64,
	turn: 1.58,
	ride: .7
}];
function loadVehicle() {
	try {
		const v = localStorage.getItem(VEH_KEY);
		if (v === "baja" || v === "coupe") return v;
	} catch {}
	return "coupe";
}
function specOf(id) {
	return VEHICLES.find((v) => v.id === id) ?? VEHICLES[0];
}
var BRAKE = 36;
var REVERSE = 12;
var DRAG = .38;
var ROLL = 1.05;
var GRIP = 7.5;
var DRIFT_GRIP = 1.55;
var MASS_PUSH = .72;
var GRAVITY = 32;
function createCarState(vehicle = "coupe") {
	const spec = specOf(vehicle);
	return {
		x: 0,
		y: heightAt(0, 0) + spec.ride,
		z: 0,
		yaw: 0,
		speed: 0,
		vx: 0,
		vz: 0,
		vy: 0,
		airborne: false,
		landGrace: 0,
		crashed: false,
		distance: 0,
		nitro: 0,
		nitroTime: 0,
		vehicle
	};
}
function stepCar(car, dt, steer, throttle, brake, handbrake, nitroTap, obstacles) {
	if (car.crashed) {
		car.vx *= Math.exp(-3 * dt);
		car.vz *= Math.exp(-3 * dt);
		car.vy *= Math.exp(-2 * dt);
		car.speed = Math.hypot(car.vx, car.vz);
		integrateAir(car, dt);
		return;
	}
	if (car.landGrace > 0) car.landGrace = Math.max(0, car.landGrace - dt);
	if (car.nitroTime > 0) car.nitroTime = Math.max(0, car.nitroTime - dt);
	const spec = specOf(car.vehicle);
	if (nitroTap && car.nitro > 0 && car.nitroTime <= .15) {
		car.nitro -= 1;
		car.nitroTime = spec.nitroTime;
	}
	const surf = surfaceAt(car.x, car.z);
	const boosting = car.nitroTime > 0;
	const air = car.airborne;
	const fx = -Math.sin(car.yaw);
	const fz = -Math.cos(car.yaw);
	const rx = Math.cos(car.yaw);
	const rz = -Math.sin(car.yaw);
	let speed = car.vx * fx + car.vz * fz;
	const sideVel = car.vx * rx + car.vz * rz;
	const accel = boosting ? spec.accel * spec.nitroMul : spec.accel;
	const cap = spec.maxFwd * surf.max * (boosting ? 1.38 : 1);
	const throttleScale = air ? .28 : 1;
	if (throttle > 0 && brake <= 0) speed += throttle * (speed < 0 ? BRAKE : accel) * throttleScale * dt;
	else if (brake > 0 && !air) {
		if (speed > .4) speed -= brake * BRAKE * dt;
		else speed -= brake * REVERSE * dt;
	} else if (!air) speed -= Math.sign(speed) * ROLL * surf.roll * dt;
	speed -= speed * DRAG * surf.drag * (air ? .25 : 1) * (boosting ? .35 : 1) * dt;
	speed = Math.max(-14, Math.min(cap, speed));
	const speedFactor = Math.min(1, Math.abs(speed) / 8);
	const high = Math.min(1, Math.abs(speed) / Math.max(8, cap));
	const turnRate = spec.turn * (.35 + .65 * speedFactor) * (1 - .35 * high) * (air ? .45 : 1);
	const reverse = speed >= 0 ? 1 : -1;
	car.yaw += steer * turnRate * reverse * dt;
	const gripMul = air ? .8 : (handbrake ? DRIFT_GRIP : GRIP) * surf.grip;
	const newSide = sideVel * Math.exp(-gripMul * dt);
	const nfx = -Math.sin(car.yaw);
	const nfz = -Math.cos(car.yaw);
	const nrx = Math.cos(car.yaw);
	const nrz = -Math.sin(car.yaw);
	car.vx = nfx * speed + nrx * newSide;
	car.vz = nfz * speed + nrz * newSide;
	if (boosting && !air) {
		car.vx += nfx * spec.nitroPush * dt;
		car.vz += nfz * spec.nitroPush * dt;
	}
	car.x += car.vx * dt;
	car.z += car.vz * dt;
	applySlope(car, dt);
	car.distance += Math.hypot(car.vx, car.vz) * dt;
	car.speed = speed;
	applyStunts(car, obstacles, dt);
	integrateAir(car, dt);
	resolveObstacles(car, obstacles);
}
function applySlope(car, dt) {
	if (car.airborne) return;
	const m = mountainAt(car.x, car.z);
	if (m && (m.onRoad || m.onSummit)) return;
	if (trailAt(car.x, car.z)?.on) return;
	const n = normalAt(car.x, car.z);
	if (n.y > .88) return;
	const slide = (.88 - n.y) * 2.45;
	car.vx += n.x * GRAVITY * slide * dt;
	car.vz += n.z * GRAVITY * slide * dt;
}
function integrateAir(car, dt) {
	const gh = heightAt(car.x, car.z) + specOf(car.vehicle).ride;
	car.vy -= GRAVITY * dt;
	car.y += car.vy * dt;
	if (car.y <= gh && car.vy <= 2) {
		const hard = car.airborne && car.vy < -6;
		car.y = gh;
		car.vy = hard ? Math.abs(car.vy) * .12 : 0;
		if (car.airborne) car.landGrace = Math.max(car.landGrace, .85);
		car.airborne = false;
	} else car.airborne = car.y > gh + .15;
}
function applyStunts(car, obstacles, dt) {
	for (const o of obstacles) {
		const dx = car.x - o.x;
		const dz = car.z - o.z;
		if (o.kind === "nitro") {
			if (o.taken) continue;
			if (dx * dx + dz * dz > o.r * o.r) continue;
			o.taken = true;
			car.nitro = Math.min(specOf(car.vehicle).nitroMax, car.nitro + 1);
			continue;
		}
		if (o.kind === "fan") {
			if (dx * dx + dz * dz > o.r * o.r) continue;
			if (car.y > o.y + 10) continue;
			car.vy += 48 * dt;
			car.airborne = true;
			continue;
		}
		if (o.kind !== "ramp") continue;
		const fx = -Math.sin(o.rot);
		const fz = -Math.cos(o.rot);
		const rx = Math.cos(o.rot);
		const rz = -Math.sin(o.rot);
		const along = dx * fx + dz * fz;
		const side = dx * rx + dz * rz;
		if (Math.abs(side) > 2.3 || along < -4.1 || along > 4.1) continue;
		const t = (along + 4.1) / 8.2;
		const rampTop = o.y + t * 3.35 + specOf(car.vehicle).ride;
		if (car.y > rampTop + 1.4) continue;
		car.y = Math.max(car.y, rampTop);
		if (t > .62 && car.speed > 8) {
			const lift = 5.5 + car.speed * .42;
			if (car.vy < lift) car.vy = lift;
			car.vx += fx * 3.5 * dt * 10;
			car.vz += fz * 3.5 * dt * 10;
			car.airborne = true;
		}
	}
}
function resolveObstacles(car, obstacles) {
	if (car.airborne || car.landGrace > 0) return;
	for (const o of obstacles) {
		if (o.kind === "ramp" || o.kind === "fan" || o.kind === "nitro") continue;
		if (car.y > o.y + 3.5) continue;
		const dx = car.x - o.x;
		const dz = car.z - o.z;
		const min = o.kind === "curb" ? o.r + .62 : o.r + 1.15;
		const d2 = dx * dx + dz * dz;
		if (d2 >= min * min) continue;
		const d = Math.sqrt(d2) || 1e-4;
		const nx = dx / d;
		const nz = dz / d;
		const pen = min - d;
		car.x += nx * pen * MASS_PUSH;
		car.z += nz * pen * MASS_PUSH;
		const vn = car.vx * nx + car.vz * nz;
		if (vn < 0) {
			car.vx -= vn * nx * 1.35;
			car.vz -= vn * nz * 1.35;
		}
		const impact = Math.abs(vn);
		if (o.kind === "curb") {
			car.vx *= .9;
			car.vz *= .9;
		} else if (d < .35) {
			car.vx *= .85;
			car.vz *= .85;
		} else if (impact > specOf(car.vehicle).crashImpact && (o.kind === "crate" || o.kind === "barrel")) {
			car.crashed = true;
			car.vx = nx * 6;
			car.vz = nz * 6;
		} else {
			car.vx *= .82;
			car.vz *= .82;
		}
	}
}
var _forward = new Vector3();
var _up = new Vector3();
var _right = new Vector3();
var _mat = new Matrix4();
function carUpQuat(car, out) {
	const n = car.airborne ? {
		x: 0,
		y: 1,
		z: 0
	} : normalAt(car.x, car.z);
	const fx = -Math.sin(car.yaw);
	const fz = -Math.cos(car.yaw);
	_forward.set(fx, 0, fz);
	_up.set(n.x, n.y, n.z).normalize();
	_forward.addScaledVector(_up, -_forward.dot(_up)).normalize();
	_right.crossVectors(_up, _forward).normalize();
	_mat.makeBasis(_right, _up, _forward);
	out.setFromRotationMatrix(_mat);
}
function mesh(geo, mat, x, y, z, parent) {
	const m = new Mesh(geo, mat);
	m.position.set(x, y, z);
	m.castShadow = true;
	m.receiveShadow = true;
	parent.add(m);
	return m;
}
function buildCarMesh(id = "coupe") {
	return id === "baja" ? buildBajaMesh() : buildCoupeMesh();
}
function buildCoupeMesh() {
	const g = new Group();
	const paint = new MeshStandardMaterial({
		color: 1843756,
		metalness: .62,
		roughness: .28
	});
	const paintHi = new MeshStandardMaterial({
		color: 2897218,
		metalness: .7,
		roughness: .22
	});
	const carbon = new MeshStandardMaterial({
		color: 1053206,
		metalness: .35,
		roughness: .5
	});
	const glass = new MeshStandardMaterial({
		color: 10405076,
		metalness: .95,
		roughness: .06,
		transparent: true,
		opacity: .42
	});
	const accent = new MeshStandardMaterial({
		color: 12868682,
		metalness: .4,
		roughness: .35
	});
	const chrome = new MeshStandardMaterial({
		color: 12961996,
		metalness: .95,
		roughness: .18
	});
	const rubber = new MeshStandardMaterial({
		color: 1710878,
		metalness: .15,
		roughness: .72
	});
	const light = new MeshStandardMaterial({
		color: 16052710,
		emissive: 16052710,
		emissiveIntensity: 1.4
	});
	const tail = new MeshStandardMaterial({
		color: 16726831,
		emissive: 12852754,
		emissiveIntensity: .9
	});
	mesh(new BoxGeometry(1.72, .16, 4.05), carbon, 0, .28, .05, g);
	mesh(new BoxGeometry(1.78, .38, 3.55), paint, 0, .52, .02, g).scale.set(1, 1, 1);
	const nose = mesh(new BoxGeometry(1.62, .22, .85), paintHi, 0, .46, 1.92, g);
	nose.rotation.x = .08;
	mesh(new BoxGeometry(1.55, .1, .55), carbon, 0, .34, 2.12, g);
	mesh(new BoxGeometry(1.48, .08, 1.1), accent, 0, .72, .35, g);
	mesh(new BoxGeometry(1.48, .46, 1.55), carbon, 0, .9, -.28, g).scale.set(1, 1, 1);
	const windshield = mesh(new BoxGeometry(1.4, .42, .08), glass, 0, .92, .52, g);
	windshield.rotation.x = -.52;
	const rearGlass = mesh(new BoxGeometry(1.38, .34, .08), glass, 0, .9, -1.05, g);
	rearGlass.rotation.x = .4;
	mesh(new BoxGeometry(.06, .34, 1.4), glass, .74, .9, -.28, g);
	mesh(new BoxGeometry(.06, .34, 1.4), glass, -.74, .9, -.28, g);
	mesh(new BoxGeometry(1.5, .06, .42), carbon, 0, 1.12, -1.28, g);
	mesh(new BoxGeometry(1.2, .08, .18), paintHi, 0, 1.18, -1.46, g);
	const mirrorL = mesh(new BoxGeometry(.22, .1, .16), carbon, .98, .78, .42, g);
	mirrorL.rotation.y = .2;
	const mirrorR = mesh(new BoxGeometry(.22, .1, .16), carbon, -.98, .78, .42, g);
	mirrorR.rotation.y = -.2;
	mesh(new BoxGeometry(.32, .12, .08), light, .52, .46, 2.28, g);
	mesh(new BoxGeometry(.32, .12, .08), light, -.52, .46, 2.28, g);
	mesh(new BoxGeometry(.38, .1, .07), tail, .5, .5, -2.02, g);
	mesh(new BoxGeometry(.38, .1, .07), tail, -.5, .5, -2.02, g);
	mesh(new CylinderGeometry(.06, .07, .18, 10), chrome, .42, .28, -2.08, g).rotation.x = Math.PI / 2;
	mesh(new CylinderGeometry(.06, .07, .18, 10), chrome, -.42, .28, -2.08, g).rotation.x = Math.PI / 2;
	const wheels = [];
	const frontWheels = [];
	const tireGeo = new CylinderGeometry(.36, .36, .28, 22);
	tireGeo.rotateZ(Math.PI / 2);
	const rimGeo = new CylinderGeometry(.2, .2, .3, 16);
	rimGeo.rotateZ(Math.PI / 2);
	const hubGeo = new CylinderGeometry(.07, .07, .32, 10);
	hubGeo.rotateZ(Math.PI / 2);
	for (const p of [
		{
			x: -.9,
			z: 1.28,
			front: true
		},
		{
			x: .9,
			z: 1.28,
			front: true
		},
		{
			x: -.9,
			z: -1.28,
			front: false
		},
		{
			x: .9,
			z: -1.28,
			front: false
		}
	]) {
		const wheel = new Group();
		wheel.position.set(p.x, .36, p.z);
		const tire = new Mesh(tireGeo, rubber);
		tire.castShadow = true;
		const rim = new Mesh(rimGeo, chrome);
		const hub = new Mesh(hubGeo, paintHi);
		wheel.add(tire, rim, hub);
		g.add(wheel);
		wheels.push(wheel);
		if (p.front) frontWheels.push(wheel);
	}
	return {
		group: g,
		wheels,
		frontWheels
	};
}
function buildBajaMesh() {
	const g = new Group();
	const paint = new MeshStandardMaterial({
		color: 16738858,
		metalness: .38,
		roughness: .42
	});
	const paintHi = new MeshStandardMaterial({
		color: 16747082,
		metalness: .45,
		roughness: .35
	});
	const ink = new MeshStandardMaterial({
		color: 1184792,
		metalness: .4,
		roughness: .48
	});
	const lime = new MeshStandardMaterial({
		color: 14090042,
		emissive: 6982160,
		emissiveIntensity: .35,
		metalness: .2,
		roughness: .4
	});
	const glass = new MeshStandardMaterial({
		color: 9357528,
		metalness: .9,
		roughness: .08,
		transparent: true,
		opacity: .4
	});
	const chrome = new MeshStandardMaterial({
		color: 13159632,
		metalness: .92,
		roughness: .2
	});
	const rubber = new MeshStandardMaterial({
		color: 1710878,
		metalness: .12,
		roughness: .78
	});
	const light = new MeshStandardMaterial({
		color: 16774358,
		emissive: 16770984,
		emissiveIntensity: 1.6
	});
	const tail = new MeshStandardMaterial({
		color: 16726831,
		emissive: 12852754,
		emissiveIntensity: .9
	});
	mesh(new BoxGeometry(1.95, .18, 3.7), ink, 0, .78, .05, g);
	mesh(new BoxGeometry(1.88, .52, 3.15), paint, 0, 1.12, .04, g);
	mesh(new BoxGeometry(1.7, .28, .95), paintHi, 0, 1.08, 1.72, g);
	mesh(new BoxGeometry(1.55, .08, 1.35), lime, 0, 1.4, .55, g);
	mesh(new BoxGeometry(2.18, .22, .85), ink, 0, .98, 1.35, g);
	mesh(new BoxGeometry(2.18, .22, .9), ink, 0, .98, -1.28, g);
	mesh(new BoxGeometry(1.62, .55, 1.45), ink, 0, 1.58, -.22, g);
	const windshield = mesh(new BoxGeometry(1.5, .48, .08), glass, 0, 1.58, .52, g);
	windshield.rotation.x = -.48;
	mesh(new BoxGeometry(.06, .4, 1.25), glass, .82, 1.58, -.22, g);
	mesh(new BoxGeometry(.06, .4, 1.25), glass, -.82, 1.58, -.22, g);
	mesh(new BoxGeometry(1.55, .08, .7), ink, 0, 1.9, -.15, g);
	mesh(new BoxGeometry(1.42, .12, .16), light, 0, 1.98, .18, g);
	mesh(new BoxGeometry(.18, .12, .18), light, .52, 1.98, .18, g);
	mesh(new BoxGeometry(.18, .12, .18), light, -.52, 1.98, .18, g);
	mesh(new BoxGeometry(.18, .12, .18), light, 0, 1.98, .18, g);
	mesh(new BoxGeometry(1.35, .35, .08), chrome, 0, .95, 2.22, g);
	mesh(new CylinderGeometry(.05, .05, .7, 8), chrome, .55, 1.05, 2.18, g).rotation.x = Math.PI / 2;
	mesh(new CylinderGeometry(.05, .05, .7, 8), chrome, -.55, 1.05, 2.18, g).rotation.x = Math.PI / 2;
	const snorkel = mesh(new CylinderGeometry(.08, .09, .95, 8), ink, .78, 1.72, .15, g);
	snorkel.rotation.z = -.12;
	mesh(new CylinderGeometry(.1, .08, .22, 8), lime, .88, 2.18, .15, g);
	mesh(new BoxGeometry(.36, .14, .1), light, .58, 1.05, 2.16, g);
	mesh(new BoxGeometry(.36, .14, .1), light, -.58, 1.05, 2.16, g);
	mesh(new BoxGeometry(.4, .12, .08), tail, .58, 1.12, -1.78, g);
	mesh(new BoxGeometry(.4, .12, .08), tail, -.58, 1.12, -1.78, g);
	mesh(new BoxGeometry(.08, .55, 1.1), chrome, .7, 1.55, -1.15, g);
	mesh(new BoxGeometry(.08, .55, 1.1), chrome, -.7, 1.55, -1.15, g);
	mesh(new BoxGeometry(1.5, .08, .08), chrome, 0, 1.82, -1.65, g);
	const wheels = [];
	const frontWheels = [];
	const tireGeo = new CylinderGeometry(.64, .64, .52, 22);
	tireGeo.rotateZ(Math.PI / 2);
	const rimGeo = new CylinderGeometry(.32, .32, .54, 16);
	rimGeo.rotateZ(Math.PI / 2);
	const hubGeo = new CylinderGeometry(.12, .12, .56, 10);
	hubGeo.rotateZ(Math.PI / 2);
	for (const p of [
		{
			x: -1.12,
			z: 1.32,
			front: true
		},
		{
			x: 1.12,
			z: 1.32,
			front: true
		},
		{
			x: -1.12,
			z: -1.32,
			front: false
		},
		{
			x: 1.12,
			z: -1.32,
			front: false
		}
	]) {
		const wheel = new Group();
		wheel.position.set(p.x, .64, p.z);
		const tire = new Mesh(tireGeo, rubber);
		tire.castShadow = true;
		const rim = new Mesh(rimGeo, chrome);
		const hub = new Mesh(hubGeo, lime);
		wheel.add(tire, rim, hub);
		g.add(wheel);
		wheels.push(wheel);
		if (p.front) frontWheels.push(wheel);
	}
	return {
		group: g,
		wheels,
		frontWheels
	};
}
var BEST_KEY = "openmile-best";
var FIXED = 1 / 60;
var LOOK = 5;
var CHUNK_RANGE = 4;
var _q = new Quaternion();
var _look = new Vector3();
var _cam = new Vector3();
var _fwd = new Vector3();
var _dummy = new Object3D();
var _fog = new Color();
var _sky = new Color();
var _hemiA = new Color();
var _targetFog = new Color();
var _targetSky = new Color();
function createEngine(canvas, hooks) {
	const input = new Input();
	const renderer = new WebGLRenderer({
		canvas,
		antialias: true,
		alpha: false,
		powerPreference: "high-performance"
	});
	renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
	renderer.setSize(canvas.clientWidth || 1, canvas.clientHeight || 1, false);
	renderer.shadowMap.enabled = true;
	renderer.shadowMap.type = 2;
	renderer.outputColorSpace = SRGBColorSpace;
	renderer.toneMapping = 4;
	renderer.toneMappingExposure = 1.08;
	const scene = new Scene();
	scene.background = new Color(BIOME_SKY.desert);
	scene.fog = new Fog(BIOME_FOG.desert, 80, 420);
	const camera = new PerspectiveCamera(62, 1, .15, 820);
	camera.position.set(0, 6, 14);
	const hemi = new HemisphereLight(15980468, 2892056, .72);
	scene.add(hemi);
	const sun = new DirectionalLight(16767408, 1.7);
	sun.position.set(40, 70, 20);
	sun.castShadow = true;
	sun.shadow.mapSize.set(1024, 1024);
	sun.shadow.camera.near = 10;
	sun.shadow.camera.far = 220;
	sun.shadow.camera.left = -60;
	sun.shadow.camera.right = 60;
	sun.shadow.camera.top = 60;
	sun.shadow.camera.bottom = -60;
	scene.add(sun);
	const groundMat = new MeshStandardMaterial({
		vertexColors: true,
		roughness: .95,
		metalness: .03,
		flatShading: true
	});
	const rockMat = new MeshStandardMaterial({
		color: 2761760,
		roughness: .88,
		metalness: .08
	});
	const crateMat = new MeshStandardMaterial({
		color: 15260872,
		roughness: .7,
		metalness: .1
	});
	const barrelMat = new MeshStandardMaterial({
		color: 1974816,
		roughness: .45,
		metalness: .55
	});
	const cactusMat = new MeshStandardMaterial({
		color: 3107386,
		roughness: .8,
		metalness: .05
	});
	const pineMat = new MeshStandardMaterial({
		color: 1980964,
		roughness: .78,
		metalness: .04
	});
	const iceMat = new MeshStandardMaterial({
		color: 14215410,
		roughness: .18,
		metalness: .35,
		transparent: true,
		opacity: .92
	});
	const stuntMat = new MeshStandardMaterial({
		color: 14826284,
		emissive: 12852754,
		emissiveIntensity: .85,
		roughness: .35,
		metalness: .25
	});
	const bladeMat = new MeshStandardMaterial({
		color: 16734794,
		emissive: 14826284,
		emissiveIntensity: 1.1,
		roughness: .28,
		metalness: .35
	});
	const terrain = /* @__PURE__ */ new Map();
	const chunkObs = /* @__PURE__ */ new Map();
	const ROCK_N = 1400;
	const CRATE_N = 800;
	const BARREL_N = 500;
	const CACTUS_N = 500;
	const PINE_N = 1100;
	const ICE_N = 600;
	const RAMP_N = 280;
	const FAN_N = 240;
	const BLADE_N = 480;
	const rockMesh = instanced(new DodecahedronGeometry(1, 0), rockMat, ROCK_N);
	const crateMesh = instanced(new BoxGeometry(1.6, 1.3, 1.6), crateMat, CRATE_N);
	const barrelMesh = instanced(new CylinderGeometry(.55, .6, 1.15, 12), barrelMat, BARREL_N);
	const cactusMesh = instanced(new ConeGeometry(.45, 2.4, 7), cactusMat, CACTUS_N);
	const pineMesh = instanced(new ConeGeometry(.85, 4.2, 8), pineMat, PINE_N);
	const iceMesh = instanced(new OctahedronGeometry(1.05, 0), iceMat, ICE_N);
	const rampMesh = instanced(new BoxGeometry(5.2, .42, 9.2), stuntMat, RAMP_N);
	const railMesh = instanced(new BoxGeometry(.22, .7, 9.2), stuntMat, RAMP_N * 2);
	const fanPoleMesh = instanced(new CylinderGeometry(.22, .34, 4.2, 10), stuntMat, FAN_N);
	const fanBladeMesh = instanced(new BoxGeometry(4.4, .12, .7), bladeMat, BLADE_N);
	const nitroMat = new MeshStandardMaterial({
		color: 12184804,
		emissive: 5164484,
		emissiveIntensity: 1.2,
		roughness: .22,
		metalness: .4
	});
	const NITRO_N = 180;
	const nitroMesh = instanced(new OctahedronGeometry(.85, 0), nitroMat, NITRO_N);
	const curbMat = new MeshStandardMaterial({
		color: 1842722,
		roughness: .55,
		metalness: .12
	});
	const curbCapMat = new MeshStandardMaterial({
		color: 14826284,
		emissive: 10491922,
		emissiveIntensity: .55,
		roughness: .4,
		metalness: .2
	});
	const CURB_N = 2400;
	const curbMesh = instanced(new BoxGeometry(.42, .82, 4.05), curbMat, CURB_N);
	const curbCapMesh = instanced(new BoxGeometry(.44, .1, 4.05), curbCapMat, CURB_N);
	scene.add(rockMesh, crateMesh, barrelMesh, cactusMesh, pineMesh, iceMesh, rampMesh, railMesh, fanPoleMesh, fanBladeMesh, nitroMesh, curbMesh, curbCapMesh);
	const beaconMat = new MeshStandardMaterial({
		color: 13223099,
		metalness: .55,
		roughness: .32
	});
	const flagMat = new MeshStandardMaterial({
		color: 14826284,
		emissive: 12852754,
		emissiveIntensity: .7,
		roughness: .45,
		metalness: .1
	});
	const ringMat = new MeshStandardMaterial({
		color: 9077624,
		roughness: .7,
		metalness: .18
	});
	const beacons = [];
	for (const m of MOUNTAINS) {
		const g = new Group();
		const pole = new Mesh(new CylinderGeometry(.08, .11, 5.4, 8), beaconMat);
		pole.position.y = 2.7;
		pole.castShadow = true;
		const flag = new Mesh(new BoxGeometry(1.7, .95, .05), flagMat);
		flag.position.set(.82, 4.85, 0);
		flag.castShadow = true;
		const ring = new Mesh(new TorusGeometry(5.1, .16, 7, 28), ringMat);
		ring.rotation.x = Math.PI / 2;
		ring.position.y = .16;
		const cap = new Mesh(new CylinderGeometry(1.3, 1.5, .22, 16), ringMat);
		cap.position.y = .08;
		g.add(pole, flag, ring, cap);
		g.position.set(m.x, heightAt(m.x, m.z), m.z);
		scene.add(g);
		beacons.push(g);
	}
	const { group: carMesh0, wheels: wheels0, frontWheels: front0 } = buildCarMesh(loadVehicle());
	let carMesh = carMesh0;
	let wheels = wheels0;
	let frontWheels = front0;
	scene.add(carMesh);
	let vehicleId = loadVehicle();
	let car = createCarState(vehicleId);
	let mode = "menu";
	let acc = 0;
	let hudT = 0;
	let best = Number(localStorage.getItem(BEST_KEY) || "0") || 0;
	let wheelSpin = 0;
	let disposed = false;
	const nearby = [];
	function instanced(geo, mat, n) {
		const m = new InstancedMesh(geo, mat, n);
		m.instanceMatrix.setUsage(DynamicDrawUsage);
		m.castShadow = true;
		m.receiveShadow = true;
		m.frustumCulled = false;
		return m;
	}
	function setMode(m) {
		mode = m;
		hooks.onMode(m);
	}
	function ensureChunks() {
		const cx = Math.floor(car.x / 72);
		const cz = Math.floor(car.z / 72);
		const live = /* @__PURE__ */ new Set();
		for (let iz = cz - CHUNK_RANGE; iz <= cz + CHUNK_RANGE; iz++) for (let ix = cx - CHUNK_RANGE; ix <= cx + CHUNK_RANGE; ix++) {
			const key = `${ix}:${iz}`;
			live.add(key);
			if (!terrain.has(key)) spawnChunk(ix, iz, key);
		}
		for (const [key, mesh] of terrain) {
			if (live.has(key)) continue;
			scene.remove(mesh);
			mesh.geometry.dispose();
			terrain.delete(key);
			chunkObs.delete(key);
		}
	}
	function spawnChunk(ix, iz, key) {
		const seg = chunkHitsMountain(ix, iz) ? 46 : 20;
		const geo = new PlaneGeometry(72, 72, seg, seg);
		geo.rotateX(-Math.PI / 2);
		const pos = geo.attributes.position;
		const colors = new Float32Array(pos.count * 3);
		const c = new Color();
		for (let i = 0; i < pos.count; i++) {
			const x = pos.getX(i) + (ix + .5) * 72;
			const z = pos.getZ(i) + (iz + .5) * 72;
			pos.setXYZ(i, x, heightAt(x, z), z);
			c.setHex(groundColor(x, z));
			colors[i * 3] = c.r;
			colors[i * 3 + 1] = c.g;
			colors[i * 3 + 2] = c.b;
		}
		pos.needsUpdate = true;
		geo.setAttribute("color", new BufferAttribute(colors, 3));
		geo.computeVertexNormals();
		const mesh = new Mesh(geo, groundMat);
		mesh.receiveShadow = true;
		scene.add(mesh);
		terrain.set(key, mesh);
		chunkObs.set(key, obstaclesForChunk(ix, iz));
	}
	function collectObstacles() {
		nearby.length = 0;
		const cx = Math.floor(car.x / 72);
		const cz = Math.floor(car.z / 72);
		for (let iz = cz - 1; iz <= cz + 1; iz++) for (let ix = cx - 1; ix <= cx + 1; ix++) {
			const list = chunkObs.get(`${ix}:${iz}`);
			if (list) nearby.push(...list);
		}
	}
	function paintInstances() {
		let ir = 0, ic = 0, ib = 0, ica = 0, ip = 0, ii = 0, irp = 0, irpRail = 0, ifp = 0, ifb = 0, ino = 0, icu = 0;
		const spin = performance.now() * .008;
		const cx = Math.floor(car.x / 72);
		const cz = Math.floor(car.z / 72);
		for (let iz = cz - CHUNK_RANGE; iz <= cz + CHUNK_RANGE; iz++) for (let ix = cx - CHUNK_RANGE; ix <= cx + CHUNK_RANGE; ix++) {
			const list = chunkObs.get(`${ix}:${iz}`);
			if (!list) continue;
			for (const o of list) {
				if (o.kind === "ramp") {
					_dummy.position.set(o.x, o.y + 1.85, o.z);
					_dummy.rotation.set(-.42, o.rot, 0);
					_dummy.scale.set(1, 1, 1);
					_dummy.updateMatrix();
					if (irp < RAMP_N) rampMesh.setMatrixAt(irp++, _dummy.matrix);
					const rx = Math.cos(o.rot);
					const rz = -Math.sin(o.rot);
					_dummy.position.set(o.x + rx * 2.45, o.y + 2.15, o.z + rz * 2.45);
					_dummy.updateMatrix();
					if (irpRail < RAMP_N * 2) railMesh.setMatrixAt(irpRail++, _dummy.matrix);
					_dummy.position.set(o.x - rx * 2.45, o.y + 2.15, o.z - rz * 2.45);
					_dummy.updateMatrix();
					if (irpRail < RAMP_N * 2) railMesh.setMatrixAt(irpRail++, _dummy.matrix);
					continue;
				}
				if (o.kind === "fan") {
					_dummy.position.set(o.x, o.y + 2.1, o.z);
					_dummy.rotation.set(0, o.rot, 0);
					_dummy.scale.setScalar(1);
					_dummy.updateMatrix();
					if (ifp < FAN_N) fanPoleMesh.setMatrixAt(ifp++, _dummy.matrix);
					_dummy.position.set(o.x, o.y + 4.15, o.z);
					_dummy.rotation.set(0, spin + o.rot, 0);
					_dummy.updateMatrix();
					if (ifb < BLADE_N) fanBladeMesh.setMatrixAt(ifb++, _dummy.matrix);
					_dummy.rotation.set(0, spin + o.rot + Math.PI / 2, 0);
					_dummy.updateMatrix();
					if (ifb < BLADE_N) fanBladeMesh.setMatrixAt(ifb++, _dummy.matrix);
					continue;
				}
				if (o.kind === "nitro") {
					if (o.taken) continue;
					const bob = 1.15 + Math.sin(spin * 2 + o.x) * .25;
					_dummy.position.set(o.x, o.y + bob, o.z);
					_dummy.rotation.set(spin * .4, spin, .4);
					_dummy.scale.setScalar(1);
					_dummy.updateMatrix();
					if (ino < NITRO_N) nitroMesh.setMatrixAt(ino++, _dummy.matrix);
					continue;
				}
				if (o.kind === "curb") {
					const h = .42 * o.scale;
					_dummy.position.set(o.x, o.y + h, o.z);
					_dummy.rotation.set(0, o.rot, 0);
					_dummy.scale.set(o.scale, o.scale, 1);
					_dummy.updateMatrix();
					if (icu < CURB_N) {
						curbMesh.setMatrixAt(icu, _dummy.matrix);
						_dummy.position.set(o.x, o.y + h * 2 + .04, o.z);
						_dummy.updateMatrix();
						curbCapMesh.setMatrixAt(icu, _dummy.matrix);
						icu++;
					}
					continue;
				}
				const lift = o.kind === "rock" ? o.scale * .45 : o.kind === "cactus" ? 1.1 : o.kind === "pine" ? o.scale * 2 : o.kind === "ice" ? o.scale * .7 : .65;
				_dummy.position.set(o.x, o.y + lift, o.z);
				_dummy.rotation.set(0, o.rot, 0);
				const s = o.kind === "crate" || o.kind === "barrel" ? 1 : o.scale;
				_dummy.scale.setScalar(s);
				_dummy.updateMatrix();
				if (o.kind === "rock" && ir < ROCK_N) rockMesh.setMatrixAt(ir++, _dummy.matrix);
				else if (o.kind === "crate" && ic < CRATE_N) crateMesh.setMatrixAt(ic++, _dummy.matrix);
				else if (o.kind === "barrel" && ib < BARREL_N) barrelMesh.setMatrixAt(ib++, _dummy.matrix);
				else if (o.kind === "cactus" && ica < CACTUS_N) cactusMesh.setMatrixAt(ica++, _dummy.matrix);
				else if (o.kind === "pine" && ip < PINE_N) pineMesh.setMatrixAt(ip++, _dummy.matrix);
				else if (o.kind === "ice" && ii < ICE_N) iceMesh.setMatrixAt(ii++, _dummy.matrix);
			}
		}
		rockMesh.count = ir;
		crateMesh.count = ic;
		barrelMesh.count = ib;
		cactusMesh.count = ica;
		pineMesh.count = ip;
		iceMesh.count = ii;
		rampMesh.count = irp;
		railMesh.count = irpRail;
		fanPoleMesh.count = ifp;
		fanBladeMesh.count = ifb;
		nitroMesh.count = ino;
		curbMesh.count = icu;
		curbCapMesh.count = icu;
		rockMesh.instanceMatrix.needsUpdate = true;
		crateMesh.instanceMatrix.needsUpdate = true;
		barrelMesh.instanceMatrix.needsUpdate = true;
		cactusMesh.instanceMatrix.needsUpdate = true;
		pineMesh.instanceMatrix.needsUpdate = true;
		iceMesh.instanceMatrix.needsUpdate = true;
		rampMesh.instanceMatrix.needsUpdate = true;
		railMesh.instanceMatrix.needsUpdate = true;
		fanPoleMesh.instanceMatrix.needsUpdate = true;
		fanBladeMesh.instanceMatrix.needsUpdate = true;
		nitroMesh.instanceMatrix.needsUpdate = true;
		curbMesh.instanceMatrix.needsUpdate = true;
		curbCapMesh.instanceMatrix.needsUpdate = true;
	}
	function syncCarVisual(dt) {
		carUpQuat(car, _q);
		carMesh.position.set(car.x, car.y, car.z);
		carMesh.quaternion.copy(_q);
		wheelSpin += car.speed * dt * .52;
		const steerAng = input.steer() * .42;
		for (const w of wheels) w.rotation.x = wheelSpin;
		for (const w of frontWheels) w.rotation.y = steerAng;
	}
	function updateAtmosphere(dt, biome) {
		_targetFog.setHex(BIOME_FOG[biome]);
		_targetSky.setHex(BIOME_SKY[biome]);
		_fog.copy(scene.fog.color);
		_sky.copy(scene.background);
		const k = 1 - Math.exp(-1.6 * dt);
		_fog.lerp(_targetFog, k);
		_sky.lerp(_targetSky, k);
		scene.fog.color.copy(_fog);
		scene.background.copy(_sky);
		const fog = scene.fog;
		fog.near = 70 + car.y * .45;
		fog.far = 380 + car.y * 6;
		_hemiA.setHex(biome === "tundra" ? 14542574 : biome === "forest" ? 12965060 : biome === "canyon" ? 15778976 : 15980468);
		hemi.color.lerp(_hemiA, k);
	}
	function updateCamera(dt, cinematic) {
		const fx = -Math.sin(car.yaw);
		const fz = -Math.cos(car.yaw);
		_fwd.set(fx, 0, fz);
		if (cinematic) {
			const t = performance.now() * 22e-5;
			const lift = specOf(vehicleId).ride;
			_cam.set(car.x + Math.cos(t) * 7.6, car.y + 2.5 + lift * .2, car.z + Math.sin(t) * 7.6);
			camera.position.lerp(_cam, 1 - Math.exp(-2.4 * dt));
			_look.set(car.x + 4, car.y + .7, car.z - 8);
			camera.lookAt(_look);
			return;
		}
		const speedAbs = Math.abs(car.speed);
		const climbing = mountainAt(car.x, car.z);
		const onMtn = !!(climbing && climbing.blend > .45);
		const back = 7.6 + Math.min(4, speedAbs * .08) + (onMtn ? 2.6 : 0);
		const height = (car.airborne ? 3.4 : 2.7) + Math.min(1.4, speedAbs * .03) + (onMtn ? 1.8 : 0);
		_cam.set(car.x - fx * back, car.y + height, car.z - fz * back);
		camera.position.lerp(_cam, 1 - Math.exp(-4.5 * dt));
		_look.set(car.x + fx * LOOK, car.y + .85, car.z + fz * LOOK);
		camera.lookAt(_look);
		camera.fov = 56 + Math.min(12, speedAbs * .22) + (car.nitroTime > 0 ? 6 : 0);
		camera.updateProjectionMatrix();
	}
	function emitHud() {
		const kmh = Math.abs(car.speed) * 3.6 * 1.15;
		const rpm = Math.min(8e3, 900 + kmh * 38 + (input.throttle() > 0 ? 400 : 0));
		let gear = 1;
		if (car.speed < -.4) gear = 0;
		else if (kmh > 140) gear = 6;
		else if (kmh > 110) gear = 5;
		else if (kmh > 80) gear = 4;
		else if (kmh > 50) gear = 3;
		else if (kmh > 25) gear = 2;
		const biome = biomeAt(car.x, car.z);
		const mtn = mountainAt(car.x, car.z);
		let biomeName = BIOME_LABEL[biome];
		if (mtn && mtn.blend > .4) biomeName = mtn.onSummit ? `${mtn.name} · summit` : mtn.onRoad ? `${mtn.name} · spiral` : mtn.name;
		hooks.onHud({
			speedKmh: kmh,
			rpm,
			distance: car.distance,
			best,
			gear,
			biome: biomeName,
			nitro: car.nitro,
			boosting: car.nitroTime > 0
		});
	}
	function physics(dt) {
		if (mode !== "playing") return;
		collectObstacles();
		stepCar(car, dt, input.steer(), input.throttle(), input.brake(), input.handbrake(), input.consumeNitro(), nearby);
		if (car.crashed) {
			if (car.distance > best) {
				best = car.distance;
				localStorage.setItem(BEST_KEY, String(best));
			}
			setMode("crashed");
		}
	}
	function resize() {
		const w = canvas.clientWidth || window.innerWidth;
		const h = canvas.clientHeight || window.innerHeight;
		camera.aspect = w / Math.max(1, h);
		camera.updateProjectionMatrix();
		renderer.setSize(w, h, false);
	}
	function frame() {
		if (disposed) return;
		timer.update();
		const dt = Math.min(.05, timer.getDelta());
		acc += dt;
		while (acc >= FIXED) {
			physics(FIXED);
			acc -= FIXED;
		}
		ensureChunks();
		paintInstances();
		syncCarVisual(dt);
		const flap = Math.sin(performance.now() * .003);
		for (const g of beacons) {
			const flag = g.children[1];
			if (flag) flag.rotation.z = flap * .16;
		}
		updateAtmosphere(dt, biomeAt(car.x, car.z));
		updateCamera(dt, mode === "menu");
		hudT += dt;
		if (hudT > .08) {
			hudT = 0;
			emitHud();
		}
		renderer.render(scene, camera);
	}
	const timer = new Timer();
	const onResize = () => resize();
	window.addEventListener("resize", onResize);
	input.attach();
	const onKey = (e) => {
		if (input.pausePressed(e.code) && mode === "playing") {
			e.preventDefault();
			pause();
		} else if (input.pausePressed(e.code) && mode === "paused") {
			e.preventDefault();
			resume();
		}
	};
	window.addEventListener("keydown", onKey);
	resize();
	ensureChunks();
	paintInstances();
	emitHud();
	renderer.setAnimationLoop(frame);
	function start() {
		restart();
	}
	function pause() {
		if (mode !== "playing") return;
		setMode("paused");
	}
	function resume() {
		if (mode !== "paused") return;
		setMode("playing");
	}
	function restart() {
		car = createCarState(vehicleId);
		acc = 0;
		for (const list of chunkObs.values()) for (const o of list) o.taken = false;
		setMode("playing");
		emitHud();
	}
	function goHome() {
		car = createCarState(vehicleId);
		setMode("menu");
		emitHud();
	}
	function setVehicle(id) {
		if (id !== "coupe" && id !== "baja") return;
		vehicleId = id;
		try {
			localStorage.setItem("openmile-vehicle", id);
		} catch {}
		scene.remove(carMesh);
		carMesh.traverse((obj) => {
			if (obj instanceof Mesh) obj.geometry.dispose();
		});
		const built = buildCarMesh(id);
		carMesh = built.group;
		wheels = built.wheels;
		frontWheels = built.frontWheels;
		scene.add(carMesh);
		const keep = {
			x: car.x,
			z: car.z,
			yaw: car.yaw
		};
		car = createCarState(id);
		car.x = keep.x;
		car.z = keep.z;
		car.yaw = keep.yaw;
		car.y = heightAt(car.x, car.z) + specOf(id).ride;
	}
	function dispose() {
		disposed = true;
		renderer.setAnimationLoop(null);
		window.removeEventListener("resize", onResize);
		window.removeEventListener("keydown", onKey);
		input.detach();
		for (const mesh of terrain.values()) {
			scene.remove(mesh);
			mesh.geometry.dispose();
		}
		[
			rockMesh,
			crateMesh,
			barrelMesh,
			cactusMesh,
			pineMesh,
			iceMesh,
			rampMesh,
			railMesh,
			fanPoleMesh,
			fanBladeMesh,
			nitroMesh,
			curbMesh,
			curbCapMesh
		].forEach((m) => {
			m.geometry.dispose();
			m.material.dispose();
		});
		for (const g of beacons) {
			scene.remove(g);
			g.traverse((obj) => {
				const mesh = obj;
				if (mesh.geometry) mesh.geometry.dispose();
			});
		}
		renderer.dispose();
	}
	window.__controlsTest = {
		getYaw: () => car.yaw,
		getSpeed: () => car.speed,
		getAirborne: () => car.airborne,
		setSteer: (v) => input.setSteer(v),
		setKeys: (codes) => input.setKeys(codes),
		setPos: (x, z) => {
			car.x = x;
			car.z = z;
			car.y = heightAt(x, z) + specOf(car.vehicle).ride;
			car.vy = 0;
			car.airborne = false;
			car.landGrace = 0;
		}
	};
	setMode("menu");
	return {
		start,
		pause,
		resume,
		restart,
		goHome,
		dispose,
		setVehicle,
		getVehicle: () => vehicleId,
		input,
		getCar: () => car
	};
}
var ZERO = {
	speedKmh: 0,
	rpm: 0,
	distance: 0,
	best: 0,
	gear: 1,
	biome: "Dune Sea",
	nitro: 0,
	boosting: false
};
function GameApp() {
	const canvasRef = (0, import_react.useRef)(null);
	const engineRef = (0, import_react.useRef)(null);
	const [mode, setMode] = (0, import_react.useState)("menu");
	const [hud, setHud] = (0, import_react.useState)(ZERO);
	const [vehicle, setVehicle] = (0, import_react.useState)(() => loadVehicle());
	(0, import_react.useEffect)(() => {
		const canvas = canvasRef.current;
		if (!canvas) return;
		const engine = createEngine(canvas, {
			onHud: setHud,
			onMode: setMode
		});
		engineRef.current = engine;
		return () => {
			engine.dispose();
			engineRef.current = null;
		};
	}, []);
	const e = () => engineRef.current;
	const input = () => e()?.input;
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("main", {
		className: "relative h-dvh w-full overflow-hidden bg-bg text-fg",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("canvas", {
				ref: canvasRef,
				className: "absolute inset-0 h-full w-full touch-none",
				onContextMenu: (ev) => ev.preventDefault()
			}),
			mode === "playing" || mode === "paused" || mode === "crashed" ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(HudLayer, {
				hud,
				mode,
				onPause: () => e()?.pause()
			}) : null,
			mode === "menu" ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Menu, {
				best: hud.best,
				vehicle,
				onPick: (id) => {
					e()?.setVehicle(id);
					setVehicle(id);
				},
				onPlay: () => e()?.start()
			}) : null,
			mode === "paused" ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Sheet, {
				title: "Paused",
				subtitle: "The desert can wait.",
				actions: [
					{
						label: "Resume",
						icon: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Play, { className: "size-4" }),
						primary: true,
						onClick: () => e()?.resume()
					},
					{
						label: "Restart",
						icon: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(RotateCcw, { className: "size-4" }),
						onClick: () => e()?.restart()
					},
					{
						label: "Home",
						icon: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(House, { className: "size-4" }),
						onClick: () => e()?.goHome()
					}
				]
			}) : null,
			mode === "crashed" ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Sheet, {
				title: "Wrecked",
				subtitle: `${fmtDist(hud.distance)} this run · best ${fmtDist(hud.best)}`,
				actions: [{
					label: "Restart",
					icon: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(RotateCcw, { className: "size-4" }),
					primary: true,
					onClick: () => e()?.restart()
				}, {
					label: "Home",
					icon: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(House, { className: "size-4" }),
					onClick: () => e()?.goHome()
				}]
			}) : null,
			mode === "playing" ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(TouchPad, { input }) : null
		]
	});
}
function Menu({ best, vehicle, onPick, onPlay }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		className: "absolute inset-0 flex flex-col justify-end bg-gradient-to-t from-bg/90 via-bg/45 to-transparent px-6 pb-10 pt-16 sm:justify-center sm:px-12",
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "max-w-lg",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "mb-2 text-sm font-medium tracking-[0.28em] text-muted uppercase",
					children: "Freeride"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
					className: "font-display text-6xl leading-none tracking-tight text-fg sm:text-7xl",
					children: "Open Mile"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "mt-3 max-w-md text-sm leading-relaxed text-muted sm:text-base",
					children: "Asphalt cuts across the dunes to spiral peaks. Ice slides, mesa sticks, sand slips. Pick a car — the truck hits harder and boosts longer."
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "mt-6 grid grid-cols-2 gap-2",
					children: VEHICLES.map((v) => {
						const on = v.id === vehicle;
						return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
							type: "button",
							onClick: () => onPick(v.id),
							className: on ? "rounded-lg border border-accent bg-elevated px-3 py-3 text-left" : "rounded-lg border border-border bg-surface/80 px-3 py-3 text-left",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
									className: "font-display text-2xl leading-none tracking-tight text-fg",
									children: v.name
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
									className: "mt-1 text-[11px] tracking-wide text-muted uppercase",
									children: v.tag
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
									className: "mt-2 text-xs text-subtle",
									children: v.blurb
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
									className: "mt-2 font-mono text-[10px] text-muted",
									children: v.id === "baja" ? "Accel · Boost · Armor" : "Grip · Balance · Light"
								})
							]
						}, v.id);
					})
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "mt-6 flex flex-col gap-3 sm:flex-row sm:items-center",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
						type: "button",
						onClick: onPlay,
						className: "inline-flex h-12 min-w-44 items-center justify-center gap-2 rounded-lg bg-accent px-6 text-sm font-semibold text-accent-fg transition-transform duration-150 hover:brightness-105 active:scale-[0.98]",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Play, { className: "size-4" }), "Drive"]
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
						className: "font-mono text-xs text-subtle",
						children: ["Best ", fmtDist(best)]
					})]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("ul", {
					className: "mt-6 grid grid-cols-2 gap-x-6 gap-y-2 text-xs text-muted sm:text-sm",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("li", { children: "↑ / W throttle" }),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("li", { children: "↓ / S brake" }),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("li", { children: "← → steer" }),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("li", { children: "Hold Space to drift" }),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("li", { children: "Double-tap Space for nitro" }),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("li", { children: "Follow the asphalt" })
					]
				})
			]
		})
	});
}
function HudLayer({ hud, mode, onPause }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "pointer-events-none absolute inset-0 flex flex-col justify-between p-4 sm:p-6",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "flex items-start justify-between",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "font-mono text-[10px] tracking-[0.2em] text-subtle uppercase",
					children: "Distance"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "font-display text-3xl tabular-nums leading-none text-fg",
					children: fmtDist(hud.distance)
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
					className: "mt-1 text-xs text-muted",
					children: [
						hud.biome,
						" · Best ",
						fmtDist(hud.best)
					]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
					className: "mt-2 font-mono text-[11px] tracking-wide text-fg",
					children: [
						"Nitro ",
						hud.nitro,
						hud.boosting ? " · BOOST" : ""
					]
				})
			] }), mode === "playing" ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
				type: "button",
				onClick: onPause,
				className: "pointer-events-auto inline-flex size-11 items-center justify-center rounded-md border border-border bg-surface/80 text-fg backdrop-blur-sm",
				"aria-label": "Pause",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Pause, { className: "size-4" })
			}) : null]
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "flex items-end justify-between gap-4",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "hidden sm:block" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Speedo, {
				kmh: hud.speedKmh,
				rpm: hud.rpm,
				gear: hud.gear
			})]
		})]
	});
}
function Speedo({ kmh, rpm, gear }) {
	const max = 220;
	const ang = -120 + Math.min(max, kmh) / max * 240;
	const gearLabel = gear === 0 ? "R" : String(gear);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "pointer-events-none relative ml-auto h-36 w-36 shrink-0 sm:h-44 sm:w-44",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("svg", {
			viewBox: "0 0 200 200",
			className: "h-full w-full",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("circle", {
					cx: "100",
					cy: "100",
					r: "88",
					fill: "#16181d",
					fillOpacity: "0.88",
					stroke: "#2a2d34"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("path", {
					d: arc(100, 100, 74, -120, 120),
					fill: "none",
					stroke: "#2a2d34",
					strokeWidth: "8",
					strokeLinecap: "round"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("path", {
					d: arc(100, 100, 74, -120, ang),
					fill: "none",
					stroke: "#d4d7dc",
					strokeWidth: "8",
					strokeLinecap: "round"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("line", {
					x1: "100",
					y1: "100",
					x2: 100 + Math.cos((ang - 90) * Math.PI / 180) * 58,
					y2: 100 + Math.sin((ang - 90) * Math.PI / 180) * 58,
					stroke: "#c45c4a",
					strokeWidth: "3",
					strokeLinecap: "round"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("circle", {
					cx: "100",
					cy: "100",
					r: "5",
					fill: "#ecece8"
				})
			]
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "absolute inset-0 flex flex-col items-center justify-center pt-6",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
					className: "font-display text-4xl leading-none tabular-nums text-fg",
					children: Math.round(kmh)
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
					className: "text-[10px] tracking-[0.2em] text-muted uppercase",
					children: "km/h"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
					className: "mt-1 flex items-center gap-1 font-mono text-[10px] text-subtle",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Gauge, { className: "size-3" }),
						gearLabel,
						" · ",
						Math.round(rpm)
					]
				})
			]
		})]
	});
}
function arc(cx, cy, r, a0, a1) {
	const p0 = polar(cx, cy, r, a0);
	const p1 = polar(cx, cy, r, a1);
	const large = a1 - a0 > 180 ? 1 : 0;
	return `M ${p0.x} ${p0.y} A ${r} ${r} 0 ${large} 1 ${p1.x} ${p1.y}`;
}
function polar(cx, cy, r, deg) {
	const a = (deg - 90) * Math.PI / 180;
	return {
		x: cx + Math.cos(a) * r,
		y: cy + Math.sin(a) * r
	};
}
function Sheet({ title, subtitle, actions }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		className: "absolute inset-0 flex items-center justify-center bg-bg/55 px-4 backdrop-blur-[2px]",
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "w-full max-w-sm rounded-xl border border-border bg-surface p-6 shadow-lg",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
					className: "font-display text-4xl tracking-tight text-fg",
					children: title
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "mt-1 text-sm text-muted",
					children: subtitle
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "mt-6 flex flex-col gap-2",
					children: actions.map((a) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
						type: "button",
						onClick: a.onClick,
						className: a.primary ? "inline-flex h-12 items-center justify-center gap-2 rounded-md bg-accent text-sm font-semibold text-accent-fg active:scale-[0.98]" : "inline-flex h-12 items-center justify-center gap-2 rounded-md border border-border bg-elevated text-sm font-medium text-fg active:scale-[0.98]",
						children: [a.icon, a.label]
					}, a.label))
				})
			]
		})
	});
}
function TouchPad({ input }) {
	const lastDrift = (0, import_react.useRef)(0);
	const bind = (apply) => ({
		onPointerDown: (e) => {
			e.currentTarget.setPointerCapture(e.pointerId);
			const inp = input();
			if (inp) apply(inp, true);
		},
		onPointerUp: () => {
			const inp = input();
			if (inp) apply(inp, false);
		},
		onPointerCancel: () => {
			const inp = input();
			if (inp) apply(inp, false);
		}
	});
	const btn = "pointer-events-auto flex size-12 items-center justify-center rounded-md border border-border bg-surface/80 text-fg text-lg font-semibold backdrop-blur-sm active:bg-elevated sm:size-14";
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "pointer-events-none absolute inset-x-0 bottom-4 flex items-end justify-between px-4 sm:hidden",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "grid grid-cols-3 gap-2",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
					type: "button",
					className: btn,
					"aria-label": "Throttle",
					...bind((i, on) => i.touchThrottle = on ? 1 : 0),
					children: "↑"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
					type: "button",
					className: btn,
					"aria-label": "Left",
					...bind((i, on) => i.touchSteer = on ? 1 : 0),
					children: "←"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
					type: "button",
					className: btn,
					"aria-label": "Brake",
					...bind((i, on) => i.touchBrake = on ? 1 : 0),
					children: "↓"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
					type: "button",
					className: btn,
					"aria-label": "Right",
					...bind((i, on) => i.touchSteer = on ? -1 : 0),
					children: "→"
				})
			]
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
			type: "button",
			className: btn + " h-12 w-20",
			"aria-label": "Drift or nitro",
			onPointerDown: (e) => {
				e.currentTarget.setPointerCapture(e.pointerId);
				const inp = input();
				if (!inp) return;
				const now = performance.now();
				if (now - lastDrift.current < 280) inp.queueNitro();
				lastDrift.current = now;
				inp.touchHandbrake = true;
			},
			onPointerUp: () => {
				const inp = input();
				if (inp) inp.touchHandbrake = false;
			},
			onPointerCancel: () => {
				const inp = input();
				if (inp) inp.touchHandbrake = false;
			},
			children: "Drift"
		})]
	});
}
function fmtDist(m) {
	if (m >= 1e3) return `${(m / 1e3).toFixed(2)} km`;
	return `${Math.round(m)} m`;
}
function Home() {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(GameApp, {});
}
//#endregion
export { Home as component };
