import * as THREE from "three";
import { heightAt, mountainAt, normalAt, surfaceAt, trailAt, type Obstacle } from "./world";

export type VehicleId = "coupe" | "baja";

export type VehicleSpec = {
  id: VehicleId;
  name: string;
  tag: string;
  blurb: string;
  accel: number;
  maxFwd: number;
  nitroTime: number;
  nitroPush: number;
  nitroMul: number;
  nitroMax: number;
  crashImpact: number;
  turn: number;
  ride: number;
};

export const VEH_KEY = "openmile-vehicle";

export const VEHICLES: VehicleSpec[] = [
  {
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
    ride: 0.42,
  },
  {
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
    ride: 0.7,
  },
];

export function loadVehicle(): VehicleId {
  try {
    const v = localStorage.getItem(VEH_KEY);
    if (v === "baja" || v === "coupe") return v;
  } catch {
    /* ignore */
  }
  return "coupe";
}

export function specOf(id: VehicleId): VehicleSpec {
  return VEHICLES.find((v) => v.id === id) ?? VEHICLES[0];
}

const BRAKE = 36;
const REVERSE = 12;
const DRAG = 0.38;
const ROLL = 1.05;
const MAX_REV = 14;
const GRIP = 7.5;
const DRIFT_GRIP = 1.55;
const MASS_PUSH = 0.72;

const GRAVITY = 32;

export type CarState = {
  x: number;
  y: number;
  z: number;
  yaw: number;
  speed: number;
  vx: number;
  vz: number;
  vy: number;
  airborne: boolean;
  landGrace: number;
  crashed: boolean;
  distance: number;
  nitro: number;
  nitroTime: number;
  vehicle: VehicleId;
};

export function createCarState(vehicle: VehicleId = "coupe"): CarState {
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
    vehicle,
  };
}

export function stepCar(
  car: CarState,
  dt: number,
  steer: number,
  throttle: number,
  brake: number,
  handbrake: boolean,
  nitroTap: boolean,
  obstacles: Obstacle[],
) {
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
  if (nitroTap && car.nitro > 0 && car.nitroTime <= 0.15) {
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
  const throttleScale = air ? 0.28 : 1;
  if (throttle > 0 && brake <= 0) {
    const t = speed < 0 ? BRAKE : accel;
    speed += throttle * t * throttleScale * dt;
  } else if (brake > 0 && !air) {
    if (speed > 0.4) speed -= brake * BRAKE * dt;
    else speed -= brake * REVERSE * dt;
  } else if (!air) {
    speed -= Math.sign(speed) * ROLL * surf.roll * dt;
  }
  speed -= speed * DRAG * surf.drag * (air ? 0.25 : 1) * (boosting ? 0.35 : 1) * dt;
  speed = Math.max(-MAX_REV, Math.min(cap, speed));

  const speedFactor = Math.min(1, Math.abs(speed) / 8);
  const high = Math.min(1, Math.abs(speed) / Math.max(8, cap));
  const turnRate = spec.turn * (0.35 + 0.65 * speedFactor) * (1 - 0.35 * high) * (air ? 0.45 : 1);
  const reverse = speed >= 0 ? 1 : -1;
  car.yaw += steer * turnRate * reverse * dt;

  const gripMul = air ? 0.8 : (handbrake ? DRIFT_GRIP : GRIP) * surf.grip;
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

function applySlope(car: CarState, dt: number) {
  if (car.airborne) return;
  const m = mountainAt(car.x, car.z);
  if (m && (m.onRoad || m.onSummit)) return;
  if (trailAt(car.x, car.z)?.on) return;
  const n = normalAt(car.x, car.z);
  if (n.y > 0.88) return;
  const slide = (0.88 - n.y) * 2.45;
  car.vx += n.x * GRAVITY * slide * dt;
  car.vz += n.z * GRAVITY * slide * dt;
}

function integrateAir(car: CarState, dt: number) {
  const gh = heightAt(car.x, car.z) + specOf(car.vehicle).ride;
  car.vy -= GRAVITY * dt;
  car.y += car.vy * dt;
  if (car.y <= gh && car.vy <= 2) {
    const hard = car.airborne && car.vy < -6;
    car.y = gh;
    car.vy = hard ? Math.abs(car.vy) * 0.12 : 0;
    if (car.airborne) car.landGrace = Math.max(car.landGrace, 0.85);
    car.airborne = false;
  } else {
    car.airborne = car.y > gh + 0.15;
  }
}

function applyStunts(car: CarState, obstacles: Obstacle[], dt: number) {
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
    if (t > 0.62 && car.speed > 8) {
      const lift = 5.5 + car.speed * 0.42;
      if (car.vy < lift) car.vy = lift;
      car.vx += fx * 3.5 * dt * 10;
      car.vz += fz * 3.5 * dt * 10;
      car.airborne = true;
    }
  }
}

function resolveObstacles(car: CarState, obstacles: Obstacle[]) {
  if (car.airborne || car.landGrace > 0) return;
  for (const o of obstacles) {
    if (o.kind === "ramp" || o.kind === "fan" || o.kind === "nitro") continue;
    if (car.y > o.y + 3.5) continue;
    const dx = car.x - o.x;
    const dz = car.z - o.z;
    const min = o.kind === "curb" ? o.r + 0.62 : o.r + 1.15;
    const d2 = dx * dx + dz * dz;
    if (d2 >= min * min) continue;
    const d = Math.sqrt(d2) || 0.0001;
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
      car.vx *= 0.9;
      car.vz *= 0.9;
    } else if (d < 0.35) {
      car.vx *= 0.85;
      car.vz *= 0.85;
    } else if (impact > specOf(car.vehicle).crashImpact && (o.kind === "crate" || o.kind === "barrel")) {
      car.crashed = true;
      car.vx = nx * 6;
      car.vz = nz * 6;
    } else {
      car.vx *= 0.82;
      car.vz *= 0.82;
    }
  }
}

const _forward = new THREE.Vector3();
const _up = new THREE.Vector3();
const _right = new THREE.Vector3();
const _mat = new THREE.Matrix4();

export function carUpQuat(car: CarState, out: THREE.Quaternion) {
  const n = car.airborne
    ? { x: 0, y: 1, z: 0 }
    : normalAt(car.x, car.z);
  const fx = -Math.sin(car.yaw);
  const fz = -Math.cos(car.yaw);
  _forward.set(fx, 0, fz);
  _up.set(n.x, n.y, n.z).normalize();
  _forward.addScaledVector(_up, -_forward.dot(_up)).normalize();
  _right.crossVectors(_up, _forward).normalize();
  _mat.makeBasis(_right, _up, _forward);
  out.setFromRotationMatrix(_mat);
}

function mesh(geo: THREE.BufferGeometry, mat: THREE.Material, x: number, y: number, z: number, parent: THREE.Object3D) {
  const m = new THREE.Mesh(geo, mat);
  m.position.set(x, y, z);
  m.castShadow = true;
  m.receiveShadow = true;
  parent.add(m);
  return m;
}

export function buildCarMesh(id: VehicleId = "coupe") {
  return id === "baja" ? buildBajaMesh() : buildCoupeMesh();
}

function buildCoupeMesh() {
  const g = new THREE.Group();
  const paint = new THREE.MeshStandardMaterial({
    color: 0x1c222c,
    metalness: 0.62,
    roughness: 0.28,
  });
  const paintHi = new THREE.MeshStandardMaterial({
    color: 0x2c3542,
    metalness: 0.7,
    roughness: 0.22,
  });
  const carbon = new THREE.MeshStandardMaterial({
    color: 0x101216,
    metalness: 0.35,
    roughness: 0.5,
  });
  const glass = new THREE.MeshStandardMaterial({
    color: 0x9ec4d4,
    metalness: 0.95,
    roughness: 0.06,
    transparent: true,
    opacity: 0.42,
  });
  const accent = new THREE.MeshStandardMaterial({
    color: 0xc45c4a,
    metalness: 0.4,
    roughness: 0.35,
  });
  const chrome = new THREE.MeshStandardMaterial({
    color: 0xc5c8cc,
    metalness: 0.95,
    roughness: 0.18,
  });
  const rubber = new THREE.MeshStandardMaterial({
    color: 0x1a1b1e,
    metalness: 0.15,
    roughness: 0.72,
  });
  const light = new THREE.MeshStandardMaterial({
    color: 0xf4f1e6,
    emissive: 0xf4f1e6,
    emissiveIntensity: 1.4,
  });
  const tail = new THREE.MeshStandardMaterial({
    color: 0xff3b2f,
    emissive: 0xc41e12,
    emissiveIntensity: 0.9,
  });

  mesh(new THREE.BoxGeometry(1.72, 0.16, 4.05), carbon, 0, 0.28, 0.05, g);
  const body = mesh(new THREE.BoxGeometry(1.78, 0.38, 3.55), paint, 0, 0.52, 0.02, g);
  body.scale.set(1, 1, 1);
  const nose = mesh(new THREE.BoxGeometry(1.62, 0.22, 0.85), paintHi, 0, 0.46, 1.92, g);
  nose.rotation.x = 0.08;
  mesh(new THREE.BoxGeometry(1.55, 0.1, 0.55), carbon, 0, 0.34, 2.12, g);
  mesh(new THREE.BoxGeometry(1.48, 0.08, 1.1), accent, 0, 0.72, 0.35, g);

  const cabin = mesh(new THREE.BoxGeometry(1.48, 0.46, 1.55), carbon, 0, 0.9, -0.28, g);
  cabin.scale.set(1, 1, 1);
  const windshield = mesh(new THREE.BoxGeometry(1.4, 0.42, 0.08), glass, 0, 0.92, 0.52, g);
  windshield.rotation.x = -0.52;
  const rearGlass = mesh(new THREE.BoxGeometry(1.38, 0.34, 0.08), glass, 0, 0.9, -1.05, g);
  rearGlass.rotation.x = 0.4;
  mesh(new THREE.BoxGeometry(0.06, 0.34, 1.4), glass, 0.74, 0.9, -0.28, g);
  mesh(new THREE.BoxGeometry(0.06, 0.34, 1.4), glass, -0.74, 0.9, -0.28, g);

  mesh(new THREE.BoxGeometry(1.5, 0.06, 0.42), carbon, 0, 1.12, -1.28, g);
  mesh(new THREE.BoxGeometry(1.2, 0.08, 0.18), paintHi, 0, 1.18, -1.46, g);

  const mirrorL = mesh(new THREE.BoxGeometry(0.22, 0.1, 0.16), carbon, 0.98, 0.78, 0.42, g);
  mirrorL.rotation.y = 0.2;
  const mirrorR = mesh(new THREE.BoxGeometry(0.22, 0.1, 0.16), carbon, -0.98, 0.78, 0.42, g);
  mirrorR.rotation.y = -0.2;

  mesh(new THREE.BoxGeometry(0.32, 0.12, 0.08), light, 0.52, 0.46, 2.28, g);
  mesh(new THREE.BoxGeometry(0.32, 0.12, 0.08), light, -0.52, 0.46, 2.28, g);
  mesh(new THREE.BoxGeometry(0.38, 0.1, 0.07), tail, 0.5, 0.5, -2.02, g);
  mesh(new THREE.BoxGeometry(0.38, 0.1, 0.07), tail, -0.5, 0.5, -2.02, g);
  mesh(new THREE.CylinderGeometry(0.06, 0.07, 0.18, 10), chrome, 0.42, 0.28, -2.08, g).rotation.x = Math.PI / 2;
  mesh(new THREE.CylinderGeometry(0.06, 0.07, 0.18, 10), chrome, -0.42, 0.28, -2.08, g).rotation.x = Math.PI / 2;

  const wheels: THREE.Group[] = [];
  const frontWheels: THREE.Group[] = [];
  const tireGeo = new THREE.CylinderGeometry(0.36, 0.36, 0.28, 22);
  tireGeo.rotateZ(Math.PI / 2);
  const rimGeo = new THREE.CylinderGeometry(0.2, 0.2, 0.3, 16);
  rimGeo.rotateZ(Math.PI / 2);
  const hubGeo = new THREE.CylinderGeometry(0.07, 0.07, 0.32, 10);
  hubGeo.rotateZ(Math.PI / 2);
  const positions: { x: number; z: number; front: boolean }[] = [
    { x: -0.9, z: 1.28, front: true },
    { x: 0.9, z: 1.28, front: true },
    { x: -0.9, z: -1.28, front: false },
    { x: 0.9, z: -1.28, front: false },
  ];
  for (const p of positions) {
    const wheel = new THREE.Group();
    wheel.position.set(p.x, 0.36, p.z);
    const tire = new THREE.Mesh(tireGeo, rubber);
    tire.castShadow = true;
    const rim = new THREE.Mesh(rimGeo, chrome);
    const hub = new THREE.Mesh(hubGeo, paintHi);
    wheel.add(tire, rim, hub);
    g.add(wheel);
    wheels.push(wheel);
    if (p.front) frontWheels.push(wheel);
  }

  return { group: g, wheels, frontWheels };
}

function buildBajaMesh() {
  const g = new THREE.Group();
  const paint = new THREE.MeshStandardMaterial({
    color: 0xff6a2a,
    metalness: 0.38,
    roughness: 0.42,
  });
  const paintHi = new THREE.MeshStandardMaterial({
    color: 0xff8a4a,
    metalness: 0.45,
    roughness: 0.35,
  });
  const ink = new THREE.MeshStandardMaterial({
    color: 0x121418,
    metalness: 0.4,
    roughness: 0.48,
  });
  const lime = new THREE.MeshStandardMaterial({
    color: 0xd6ff3a,
    emissive: 0x6a8a10,
    emissiveIntensity: 0.35,
    metalness: 0.2,
    roughness: 0.4,
  });
  const glass = new THREE.MeshStandardMaterial({
    color: 0x8ec8d8,
    metalness: 0.9,
    roughness: 0.08,
    transparent: true,
    opacity: 0.4,
  });
  const chrome = new THREE.MeshStandardMaterial({
    color: 0xc8ccd0,
    metalness: 0.92,
    roughness: 0.2,
  });
  const rubber = new THREE.MeshStandardMaterial({
    color: 0x1a1b1e,
    metalness: 0.12,
    roughness: 0.78,
  });
  const light = new THREE.MeshStandardMaterial({
    color: 0xfff4d6,
    emissive: 0xffe7a8,
    emissiveIntensity: 1.6,
  });
  const tail = new THREE.MeshStandardMaterial({
    color: 0xff3b2f,
    emissive: 0xc41e12,
    emissiveIntensity: 0.9,
  });

  mesh(new THREE.BoxGeometry(1.95, 0.18, 3.7), ink, 0, 0.78, 0.05, g);
  mesh(new THREE.BoxGeometry(1.88, 0.52, 3.15), paint, 0, 1.12, 0.04, g);
  mesh(new THREE.BoxGeometry(1.7, 0.28, 0.95), paintHi, 0, 1.08, 1.72, g);
  mesh(new THREE.BoxGeometry(1.55, 0.08, 1.35), lime, 0, 1.4, 0.55, g);
  mesh(new THREE.BoxGeometry(2.18, 0.22, 0.85), ink, 0, 0.98, 1.35, g);
  mesh(new THREE.BoxGeometry(2.18, 0.22, 0.9), ink, 0, 0.98, -1.28, g);

  mesh(new THREE.BoxGeometry(1.62, 0.55, 1.45), ink, 0, 1.58, -0.22, g);
  const windshield = mesh(new THREE.BoxGeometry(1.5, 0.48, 0.08), glass, 0, 1.58, 0.52, g);
  windshield.rotation.x = -0.48;
  mesh(new THREE.BoxGeometry(0.06, 0.4, 1.25), glass, 0.82, 1.58, -0.22, g);
  mesh(new THREE.BoxGeometry(0.06, 0.4, 1.25), glass, -0.82, 1.58, -0.22, g);

  mesh(new THREE.BoxGeometry(1.55, 0.08, 0.7), ink, 0, 1.9, -0.15, g);
  mesh(new THREE.BoxGeometry(1.42, 0.12, 0.16), light, 0, 1.98, 0.18, g);
  mesh(new THREE.BoxGeometry(0.18, 0.12, 0.18), light, 0.52, 1.98, 0.18, g);
  mesh(new THREE.BoxGeometry(0.18, 0.12, 0.18), light, -0.52, 1.98, 0.18, g);
  mesh(new THREE.BoxGeometry(0.18, 0.12, 0.18), light, 0, 1.98, 0.18, g);

  mesh(new THREE.BoxGeometry(1.35, 0.35, 0.08), chrome, 0, 0.95, 2.22, g);
  mesh(new THREE.CylinderGeometry(0.05, 0.05, 0.7, 8), chrome, 0.55, 1.05, 2.18, g).rotation.x = Math.PI / 2;
  mesh(new THREE.CylinderGeometry(0.05, 0.05, 0.7, 8), chrome, -0.55, 1.05, 2.18, g).rotation.x = Math.PI / 2;

  const snorkel = mesh(new THREE.CylinderGeometry(0.08, 0.09, 0.95, 8), ink, 0.78, 1.72, 0.15, g);
  snorkel.rotation.z = -0.12;
  mesh(new THREE.CylinderGeometry(0.1, 0.08, 0.22, 8), lime, 0.88, 2.18, 0.15, g);

  mesh(new THREE.BoxGeometry(0.36, 0.14, 0.1), light, 0.58, 1.05, 2.16, g);
  mesh(new THREE.BoxGeometry(0.36, 0.14, 0.1), light, -0.58, 1.05, 2.16, g);
  mesh(new THREE.BoxGeometry(0.4, 0.12, 0.08), tail, 0.58, 1.12, -1.78, g);
  mesh(new THREE.BoxGeometry(0.4, 0.12, 0.08), tail, -0.58, 1.12, -1.78, g);

  mesh(new THREE.BoxGeometry(0.08, 0.55, 1.1), chrome, 0.7, 1.55, -1.15, g);
  mesh(new THREE.BoxGeometry(0.08, 0.55, 1.1), chrome, -0.7, 1.55, -1.15, g);
  mesh(new THREE.BoxGeometry(1.5, 0.08, 0.08), chrome, 0, 1.82, -1.65, g);

  const wheels: THREE.Group[] = [];
  const frontWheels: THREE.Group[] = [];
  const tireGeo = new THREE.CylinderGeometry(0.64, 0.64, 0.52, 22);
  tireGeo.rotateZ(Math.PI / 2);
  const rimGeo = new THREE.CylinderGeometry(0.32, 0.32, 0.54, 16);
  rimGeo.rotateZ(Math.PI / 2);
  const hubGeo = new THREE.CylinderGeometry(0.12, 0.12, 0.56, 10);
  hubGeo.rotateZ(Math.PI / 2);
  const positions: { x: number; z: number; front: boolean }[] = [
    { x: -1.12, z: 1.32, front: true },
    { x: 1.12, z: 1.32, front: true },
    { x: -1.12, z: -1.32, front: false },
    { x: 1.12, z: -1.32, front: false },
  ];
  for (const p of positions) {
    const wheel = new THREE.Group();
    wheel.position.set(p.x, 0.64, p.z);
    const tire = new THREE.Mesh(tireGeo, rubber);
    tire.castShadow = true;
    const rim = new THREE.Mesh(rimGeo, chrome);
    const hub = new THREE.Mesh(hubGeo, lime);
    wheel.add(tire, rim, hub);
    g.add(wheel);
    wheels.push(wheel);
    if (p.front) frontWheels.push(wheel);
  }

  return { group: g, wheels, frontWheels };
}
