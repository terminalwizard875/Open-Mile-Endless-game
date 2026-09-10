import * as THREE from "three";
import { Input } from "./input";
import {
  BIOME_FOG,
  BIOME_LABEL,
  BIOME_SKY,
  MOUNTAINS,
  TILE,
  biomeAt,
  chunkHitsMountain,
  craterR,
  groundColor,
  heightAt,
  mountainAt,
  obstaclesForChunk,
  type Biome,
  type Mountain,
  type Obstacle,
} from "./world";
import {
  buildCarMesh,
  carUpQuat,
  createCarState,
  loadVehicle,
  specOf,
  stepCar,
  type CarState,
  type VehicleId,
} from "./car";

export type Mode = "menu" | "playing" | "paused" | "crashed";

export type Hud = {
  speedKmh: number;
  rpm: number;
  distance: number;
  best: number;
  gear: number;
  biome: string;
  nitro: number;
  boosting: boolean;
};

export type EngineHooks = {
  onHud: (h: Hud) => void;
  onMode: (m: Mode) => void;
};

const BEST_KEY = "openmile-best";
const FIXED = 1 / 60;
const LOOK = 5;
const CHUNK_RANGE = 5;

type Handle = {
  start: () => void;
  pause: () => void;
  resume: () => void;
  restart: () => void;
  goHome: () => void;
  dispose: () => void;
  setVehicle: (id: VehicleId) => void;
  getVehicle: () => VehicleId;
  input: Input;
  getCar: () => CarState;
};

const _q = new THREE.Quaternion();
const _look = new THREE.Vector3();
const _cam = new THREE.Vector3();
const _fwd = new THREE.Vector3();
const _dummy = new THREE.Object3D();
const _fog = new THREE.Color();
const _sky = new THREE.Color();
const _hemiA = new THREE.Color();
const _targetFog = new THREE.Color();
const _targetSky = new THREE.Color();

export function createEngine(canvas: HTMLCanvasElement, hooks: EngineHooks): Handle {
  const input = new Input();
  const renderer = new THREE.WebGLRenderer({
    canvas,
    antialias: true,
    alpha: false,
    powerPreference: "high-performance",
  });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
  renderer.setSize(canvas.clientWidth || 1, canvas.clientHeight || 1, false);
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.08;

  const scene = new THREE.Scene();
  scene.background = new THREE.Color(BIOME_SKY.desert);
  scene.fog = new THREE.Fog(BIOME_FOG.desert, 80, 480);

  const camera = new THREE.PerspectiveCamera(62, 1, 0.15, 3400);
  camera.position.set(0, 6, 14);

  const hemi = new THREE.HemisphereLight(0xf3d7b4, 0x2c2118, 0.72);
  scene.add(hemi);
  const sun = new THREE.DirectionalLight(0xffd9b0, 1.7);
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

  const groundMat = new THREE.MeshStandardMaterial({
    vertexColors: true,
    roughness: 0.95,
    metalness: 0.03,
    flatShading: true,
  });
  const rockMat = new THREE.MeshStandardMaterial({ color: 0x2a2420, roughness: 0.88, metalness: 0.08 });
  const crateMat = new THREE.MeshStandardMaterial({ color: 0xe8dcc8, roughness: 0.7, metalness: 0.1 });
  const barrelMat = new THREE.MeshStandardMaterial({ color: 0x1e2220, roughness: 0.45, metalness: 0.55 });
  const cactusMat = new THREE.MeshStandardMaterial({ color: 0x2f6a3a, roughness: 0.8, metalness: 0.05 });
  const pineMat = new THREE.MeshStandardMaterial({ color: 0x1e3a24, roughness: 0.78, metalness: 0.04 });
  const iceMat = new THREE.MeshStandardMaterial({
    color: 0xd8e8f2,
    roughness: 0.18,
    metalness: 0.35,
    transparent: true,
    opacity: 0.92,
  });
  const stuntMat = new THREE.MeshStandardMaterial({
    color: 0xe23b2c,
    emissive: 0xc41e12,
    emissiveIntensity: 0.85,
    roughness: 0.35,
    metalness: 0.25,
  });
  const bladeMat = new THREE.MeshStandardMaterial({
    color: 0xff5a4a,
    emissive: 0xe23b2c,
    emissiveIntensity: 1.1,
    roughness: 0.28,
    metalness: 0.35,
  });

  const terrain = new Map<string, THREE.Mesh>();
  const chunkObs = new Map<string, Obstacle[]>();

  const ROCK_N = 1400;
  const CRATE_N = 800;
  const BARREL_N = 500;
  const CACTUS_N = 500;
  const PINE_N = 2800;
  const ICE_N = 1400;
  const RAMP_N = 280;
  const FAN_N = 240;
  const BLADE_N = 480;
  const rockMesh = instanced(new THREE.DodecahedronGeometry(1, 0), rockMat, ROCK_N);
  const crateMesh = instanced(new THREE.BoxGeometry(1.6, 1.3, 1.6), crateMat, CRATE_N);
  const barrelMesh = instanced(new THREE.CylinderGeometry(0.55, 0.6, 1.15, 12), barrelMat, BARREL_N);
  const cactusMesh = instanced(new THREE.ConeGeometry(0.45, 2.4, 7), cactusMat, CACTUS_N);
  const pineMesh = instanced(new THREE.ConeGeometry(0.85, 4.2, 8), pineMat, PINE_N);
  const iceMesh = instanced(new THREE.OctahedronGeometry(1.05, 0), iceMat, ICE_N);
  const rampMesh = instanced(new THREE.BoxGeometry(5.2, 0.42, 9.2), stuntMat, RAMP_N);
  const railMesh = instanced(new THREE.BoxGeometry(0.22, 0.7, 9.2), stuntMat, RAMP_N * 2);
  const fanPoleMesh = instanced(new THREE.CylinderGeometry(0.22, 0.34, 4.2, 10), stuntMat, FAN_N);
  const fanBladeMesh = instanced(new THREE.BoxGeometry(4.4, 0.12, 0.7), bladeMat, BLADE_N);
  const nitroMat = new THREE.MeshStandardMaterial({
    color: 0xb9ece4,
    emissive: 0x4ecdc4,
    emissiveIntensity: 1.2,
    roughness: 0.22,
    metalness: 0.4,
  });
  const NITRO_N = 180;
  const nitroMesh = instanced(new THREE.OctahedronGeometry(0.85, 0), nitroMat, NITRO_N);
  const curbMat = new THREE.MeshStandardMaterial({
    color: 0x1c1e22,
    roughness: 0.55,
    metalness: 0.12,
  });
  const curbCapMat = new THREE.MeshStandardMaterial({
    color: 0xe23b2c,
    emissive: 0xa01812,
    emissiveIntensity: 0.55,
    roughness: 0.4,
    metalness: 0.2,
  });
  const CURB_N = 2400;
  const curbMesh = instanced(new THREE.BoxGeometry(0.42, 0.82, 4.05), curbMat, CURB_N);
  const curbCapMesh = instanced(new THREE.BoxGeometry(0.44, 0.1, 4.05), curbCapMat, CURB_N);
  scene.add(
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
    curbCapMesh,
  );

  const beaconMat = new THREE.MeshStandardMaterial({
    color: 0xc9c4bb,
    metalness: 0.55,
    roughness: 0.32,
  });
  const flagMat = new THREE.MeshStandardMaterial({
    color: 0xe23b2c,
    emissive: 0xc41e12,
    emissiveIntensity: 0.7,
    roughness: 0.45,
    metalness: 0.1,
  });
  const ringMat = new THREE.MeshStandardMaterial({
    color: 0x8a8378,
    roughness: 0.7,
    metalness: 0.18,
  });
  const beacons: THREE.Group[] = [];
  const impostors: { mesh: THREE.Object3D; mountain: Mountain }[] = [];
  const lavaPools: THREE.Mesh[] = [];
  const smokePuffs: { mesh: THREE.Mesh; base: number; phase: number; ox: number; oz: number }[] = [];
  const lavaMat = new THREE.MeshStandardMaterial({
    color: 0xff4a18,
    emissive: 0xe23b12,
    emissiveIntensity: 1.55,
    roughness: 0.4,
    metalness: 0.05,
  });

  function addImpostor(m: Mountain) {
    if (m.kind === "dune" && m.radius < 90) return;
    let geo: THREE.BufferGeometry;
    let mat: THREE.MeshStandardMaterial;
    if (m.kind === "volcano") {
      const crater = craterR(m);
      const pts = [
        new THREE.Vector2(m.radius, 0),
        new THREE.Vector2(m.summitR, m.height),
        new THREE.Vector2(crater, m.height * 0.62),
        new THREE.Vector2(0, m.height * 0.62),
      ];
      geo = new THREE.LatheGeometry(pts, 20);
      mat = new THREE.MeshStandardMaterial({ color: 0x3a221c, roughness: 0.92, flatShading: true });
    } else if (m.kind === "ice") {
      geo = new THREE.ConeGeometry(m.radius, m.height, 24, 1, false);
      mat = new THREE.MeshStandardMaterial({
        color: 0xe8f2fa,
        emissive: 0x7a90a4,
        emissiveIntensity: 0.22,
        roughness: 0.28,
        metalness: 0.14,
        flatShading: true,
      });
    } else if (m.kind === "forest") {
      geo = new THREE.ConeGeometry(m.radius, m.height, 16, 1, true);
      mat = new THREE.MeshStandardMaterial({ color: 0x3d5a3a, roughness: 0.9, flatShading: true });
    } else {
      geo = new THREE.ConeGeometry(m.radius, m.height, 16, 1, true);
      mat = new THREE.MeshStandardMaterial({ color: 0x8a6a4e, roughness: 0.95, flatShading: true });
    }
    const mesh = new THREE.Mesh(geo, mat);
    mesh.receiveShadow = true;
    if (m.kind === "volcano") {
      mesh.position.set(m.x, m.base, m.z);
    } else {
      mesh.position.set(m.x, m.base + m.height * 0.5, m.z);
    }
    scene.add(mesh);
    impostors.push({ mesh, mountain: m });
  }

  for (const m of MOUNTAINS) {
    addImpostor(m);
    const g = new THREE.Group();
    if (m.kind === "volcano") {
      const crater = craterR(m);
      const lava = new THREE.Mesh(new THREE.CircleGeometry(crater * 0.92, 22), lavaMat);
      lava.rotation.x = -Math.PI / 2;
      lava.position.set(m.x, m.base + m.height * 0.62 + 0.18, m.z);
      scene.add(lava);
      lavaPools.push(lava);
      const glow = new THREE.PointLight(0xff6a2a, 4.2, 72, 1.4);
      glow.position.set(m.x, m.base + m.height * 0.72, m.z);
      scene.add(glow);
      const smokeMat = new THREE.MeshStandardMaterial({
        color: 0x4a403c,
        emissive: 0x2a2018,
        emissiveIntensity: 0.25,
        transparent: true,
        opacity: 0.32,
        depthWrite: false,
      });
      for (let i = 0; i < 5; i++) {
        const puff = new THREE.Mesh(new THREE.SphereGeometry(7 + i * 2.4, 10, 8), smokeMat.clone());
        puff.position.set(m.x, m.base + m.height * 0.7 + 10 + i * 7, m.z);
        scene.add(puff);
        smokePuffs.push({
          mesh: puff,
          base: m.base + m.height * 0.7 + 8,
          phase: i * 0.7,
          ox: m.x,
          oz: m.z,
        });
      }
      const rimX = m.x + Math.sin(m.rot + 0.6) * ((m.summitR + crater) * 0.5);
      const rimZ = m.z + Math.cos(m.rot + 0.6) * ((m.summitR + crater) * 0.5);
      const pole = new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.11, 5.4, 8), beaconMat);
      pole.position.y = 2.7;
      const flag = new THREE.Mesh(new THREE.BoxGeometry(1.7, 0.95, 0.05), flagMat);
      flag.position.set(0.82, 4.85, 0);
      g.add(pole, flag);
      g.position.set(rimX, heightAt(rimX, rimZ), rimZ);
    } else {
      const pole = new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.11, m.kind === "ice" ? 7.2 : 5.4, 8), beaconMat);
      pole.position.y = m.kind === "ice" ? 3.6 : 2.7;
      pole.castShadow = true;
      const flag = new THREE.Mesh(new THREE.BoxGeometry(1.7, 0.95, 0.05), flagMat);
      flag.position.set(0.82, m.kind === "ice" ? 6.6 : 4.85, 0);
      flag.castShadow = true;
      const ring = new THREE.Mesh(new THREE.TorusGeometry(m.kind === "ice" ? 7.2 : 5.1, 0.16, 7, 28), ringMat);
      ring.rotation.x = Math.PI / 2;
      ring.position.y = 0.16;
      const cap = new THREE.Mesh(new THREE.CylinderGeometry(1.3, 1.5, 0.22, 16), ringMat);
      cap.position.y = 0.08;
      g.add(pole, flag, ring, cap);
      g.position.set(m.x, heightAt(m.x, m.z), m.z);
    }
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
  let mode: Mode = "menu";
  let acc = 0;
  let hudT = 0;
  let best = Number(localStorage.getItem(BEST_KEY) || "0") || 0;
  let wheelSpin = 0;
  let disposed = false;
  const nearby: Obstacle[] = [];

  function instanced(geo: THREE.BufferGeometry, mat: THREE.Material, n: number) {
    const m = new THREE.InstancedMesh(geo, mat, n);
    m.instanceMatrix.setUsage(THREE.DynamicDrawUsage);
    m.castShadow = true;
    m.receiveShadow = true;
    m.frustumCulled = false;
    return m;
  }

  function setMode(m: Mode) {
    mode = m;
    hooks.onMode(m);
  }

  function ensureChunks() {
    const cx = Math.floor(car.x / TILE);
    const cz = Math.floor(car.z / TILE);
    const live = new Set<string>();
    for (let iz = cz - CHUNK_RANGE; iz <= cz + CHUNK_RANGE; iz++) {
      for (let ix = cx - CHUNK_RANGE; ix <= cx + CHUNK_RANGE; ix++) {
        const key = `${ix}:${iz}`;
        live.add(key);
        if (!terrain.has(key)) spawnChunk(ix, iz, key);
      }
    }
    for (const [key, mesh] of terrain) {
      if (live.has(key)) continue;
      scene.remove(mesh);
      mesh.geometry.dispose();
      terrain.delete(key);
      chunkObs.delete(key);
    }
  }

  function spawnChunk(ix: number, iz: number, key: string) {
    const seg = chunkHitsMountain(ix, iz) ? 46 : 20;
    const geo = new THREE.PlaneGeometry(TILE, TILE, seg, seg);
    geo.rotateX(-Math.PI / 2);
    const pos = geo.attributes.position;
    const colors = new Float32Array(pos.count * 3);
    const c = new THREE.Color();
    for (let i = 0; i < pos.count; i++) {
      const x = pos.getX(i) + (ix + 0.5) * TILE;
      const z = pos.getZ(i) + (iz + 0.5) * TILE;
      pos.setXYZ(i, x, heightAt(x, z), z);
      c.setHex(groundColor(x, z));
      colors[i * 3] = c.r;
      colors[i * 3 + 1] = c.g;
      colors[i * 3 + 2] = c.b;
    }
    pos.needsUpdate = true;
    geo.setAttribute("color", new THREE.BufferAttribute(colors, 3));
    geo.computeVertexNormals();
    const mesh = new THREE.Mesh(geo, groundMat);
    mesh.receiveShadow = true;
    scene.add(mesh);
    terrain.set(key, mesh);
    chunkObs.set(key, obstaclesForChunk(ix, iz));
  }

  function collectObstacles() {
    nearby.length = 0;
    const cx = Math.floor(car.x / TILE);
    const cz = Math.floor(car.z / TILE);
    for (let iz = cz - 1; iz <= cz + 1; iz++) {
      for (let ix = cx - 1; ix <= cx + 1; ix++) {
        const list = chunkObs.get(`${ix}:${iz}`);
        if (list) nearby.push(...list);
      }
    }
  }

  function paintInstances() {
    let ir = 0,
      ic = 0,
      ib = 0,
      ica = 0,
      ip = 0,
      ii = 0,
      irp = 0,
      irpRail = 0,
      ifp = 0,
      ifb = 0,
      ino = 0,
      icu = 0;
    const spin = performance.now() * 0.008;
    const cx = Math.floor(car.x / TILE);
    const cz = Math.floor(car.z / TILE);
    for (let iz = cz - CHUNK_RANGE; iz <= cz + CHUNK_RANGE; iz++) {
      for (let ix = cx - CHUNK_RANGE; ix <= cx + CHUNK_RANGE; ix++) {
        const list = chunkObs.get(`${ix}:${iz}`);
        if (!list) continue;
        for (const o of list) {
          if (o.kind === "ramp") {
            _dummy.position.set(o.x, o.y + 1.85, o.z);
            _dummy.rotation.set(-0.42, o.rot, 0);
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
            const bob = 1.15 + Math.sin(spin * 2 + o.x) * 0.25;
            _dummy.position.set(o.x, o.y + bob, o.z);
            _dummy.rotation.set(spin * 0.4, spin, 0.4);
            _dummy.scale.setScalar(1);
            _dummy.updateMatrix();
            if (ino < NITRO_N) nitroMesh.setMatrixAt(ino++, _dummy.matrix);
            continue;
          }
          if (o.kind === "curb") {
            const h = 0.42 * o.scale;
            _dummy.position.set(o.x, o.y + h, o.z);
            _dummy.rotation.set(0, o.rot, 0);
            _dummy.scale.set(o.scale, o.scale, 1);
            _dummy.updateMatrix();
            if (icu < CURB_N) {
              curbMesh.setMatrixAt(icu, _dummy.matrix);
              _dummy.position.set(o.x, o.y + h * 2 + 0.04, o.z);
              _dummy.updateMatrix();
              curbCapMesh.setMatrixAt(icu, _dummy.matrix);
              icu++;
            }
            continue;
          }
          const lift =
            o.kind === "rock"
              ? o.scale * 0.45
              : o.kind === "cactus"
                ? 1.1
                : o.kind === "pine"
                  ? o.scale * 2.0
                  : o.kind === "ice"
                    ? o.scale * 0.7
                    : 0.65;
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

  function syncCarVisual(dt: number) {
    carUpQuat(car, _q);
    carMesh.position.set(car.x, car.y, car.z);
    carMesh.quaternion.copy(_q);
    wheelSpin += car.speed * dt * 0.52;
    const steerAng = input.steer() * 0.42;
    for (const w of wheels) w.rotation.x = wheelSpin;
    for (const w of frontWheels) w.rotation.y = steerAng;
  }

  function updateAtmosphere(dt: number, biome: Biome) {
    _targetFog.setHex(BIOME_FOG[biome]);
    _targetSky.setHex(BIOME_SKY[biome]);
    _fog.copy(scene.fog!.color as THREE.Color);
    _sky.copy(scene.background as THREE.Color);
    const k = 1 - Math.exp(-1.6 * dt);
    _fog.lerp(_targetFog, k);
    _sky.lerp(_targetSky, k);
    (scene.fog as THREE.Fog).color.copy(_fog);
    (scene.background as THREE.Color).copy(_sky);
    const fog = scene.fog as THREE.Fog;
    if (biome === "tundra") {
      fog.near = 90 + car.y * 0.12;
      fog.far = 1680 + car.y * 2.2;
    } else if (biome === "forest") {
      fog.near = 80 + car.y * 0.25;
      fog.far = 1180 + car.y * 3.2;
    } else if (biome === "canyon") {
      fog.near = 70 + car.y * 0.35;
      fog.far = 720 + car.y * 4.2;
    } else {
      fog.near = 70 + car.y * 0.45;
      fog.far = 430 + car.y * 5.5;
    }
    _hemiA.setHex(biome === "tundra" ? 0xdde6ee : biome === "forest" ? 0xc5d4c4 : biome === "canyon" ? 0xf0c4a0 : 0xf3d7b4);
    hemi.color.lerp(_hemiA, k);
  }

  function updateCamera(dt: number, cinematic: boolean) {
    const fx = -Math.sin(car.yaw);
    const fz = -Math.cos(car.yaw);
    _fwd.set(fx, 0, fz);
    if (cinematic) {
      const t = performance.now() * 0.00028;
      _cam.set(car.x - 2.2 + Math.cos(t) * 1.4, car.y + 2.15, car.z + 6.4 + Math.sin(t) * 1.1);
      camera.position.lerp(_cam, 1 - Math.exp(-3.2 * dt));
      _look.set(car.x, car.y + 0.95, car.z - 0.4);
      camera.lookAt(_look);
      return;
    }
    const speedAbs = Math.abs(car.speed);
    const climbing = mountainAt(car.x, car.z);
    const onMtn = !!(climbing && climbing.blend > 0.45);
    const back = 7.6 + Math.min(4, speedAbs * 0.08) + (onMtn ? 2.6 : 0);
    const height = (car.airborne ? 3.4 : 2.7) + Math.min(1.4, speedAbs * 0.03) + (onMtn ? 1.8 : 0);
    _cam.set(car.x - fx * back, car.y + height, car.z - fz * back);
    camera.position.lerp(_cam, 1 - Math.exp(-4.5 * dt));
    _look.set(car.x + fx * LOOK, car.y + 0.85, car.z + fz * LOOK);
    camera.lookAt(_look);
    camera.fov = 56 + Math.min(12, speedAbs * 0.22) + (car.nitroTime > 0 ? 6 : 0);
    camera.updateProjectionMatrix();
  }

  function emitHud() {
    const kmh = Math.abs(car.speed) * 3.6 * 1.15;
    const rpm = Math.min(8000, 900 + kmh * 38 + (input.throttle() > 0 ? 400 : 0));
    let gear = 1;
    if (car.speed < -0.4) gear = 0;
    else if (kmh > 140) gear = 6;
    else if (kmh > 110) gear = 5;
    else if (kmh > 80) gear = 4;
    else if (kmh > 50) gear = 3;
    else if (kmh > 25) gear = 2;
    const biome = biomeAt(car.x, car.z);
    const mtn = mountainAt(car.x, car.z);
    let biomeName = BIOME_LABEL[biome];
    if (mtn && mtn.blend > 0.4) {
      if (mtn.onLava) biomeName = `${mtn.name} · caldera`;
      else if (mtn.onSummit) biomeName = `${mtn.name} · summit`;
      else if (mtn.onRoad) biomeName = `${mtn.name} · spiral`;
      else biomeName = mtn.name;
    }
    hooks.onHud({
      speedKmh: kmh,
      rpm,
      distance: car.distance,
      best,
      gear,
      biome: biomeName,
      nitro: car.nitro,
      boosting: car.nitroTime > 0,
    });
  }

  function physics(dt: number) {
    if (mode !== "playing") return;
    collectObstacles();
    stepCar(
      car,
      dt,
      input.steer(),
      input.throttle(),
      input.brake(),
      input.handbrake(),
      input.consumeNitro(),
      nearby,
    );
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
    const dt = Math.min(0.05, timer.getDelta());
    acc += dt;
    while (acc >= FIXED) {
      physics(FIXED);
      acc -= FIXED;
    }
    ensureChunks();
    paintInstances();
    syncCarVisual(dt);
    const flap = Math.sin(performance.now() * 0.003);
    for (const g of beacons) {
      const flag = g.children[1];
      if (flag) flag.rotation.z = flap * 0.16;
    }
    for (const { mesh, mountain: mtn } of impostors) {
      const d = Math.hypot(car.x - mtn.x, car.z - mtn.z);
      mesh.visible = d > mtn.radius + CHUNK_RANGE * TILE * 0.35;
    }
    const now = performance.now() * 0.001;
    lavaMat.emissiveIntensity = 1.25 + Math.sin(now * 2.2) * 0.45;
    for (const puff of smokePuffs) {
      const t = now * 0.35 + puff.phase;
      puff.mesh.position.y = puff.base + 10 + (t % 18);
      puff.mesh.position.x = puff.ox + Math.sin(t) * 4;
      puff.mesh.position.z = puff.oz + Math.cos(t * 0.65) * 4;
      const fade = 1 - ((t % 18) / 18);
      (puff.mesh.material as THREE.MeshStandardMaterial).opacity = 0.08 + fade * 0.28;
      const s = 0.7 + (1 - fade) * 1.4;
      puff.mesh.scale.setScalar(s);
    }
    updateAtmosphere(dt, biomeAt(car.x, car.z));
    updateCamera(dt, mode === "menu");
    hudT += dt;
    if (hudT > 0.08) {
      hudT = 0;
      emitHud();
    }
    renderer.render(scene, camera);
  }

  const timer = new THREE.Timer();
  const onResize = () => resize();
  window.addEventListener("resize", onResize);
  input.attach();

  const onKey = (e: KeyboardEvent) => {
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
    for (const list of chunkObs.values()) {
      for (const o of list) o.taken = false;
    }
    setMode("playing");
    emitHud();
  }

  function goHome() {
    car = createCarState(vehicleId);
    setMode("menu");
    emitHud();
  }

  function setVehicle(id: VehicleId) {
    if (id !== "coupe" && id !== "baja") return;
    vehicleId = id;
    try {
      localStorage.setItem("openmile-vehicle", id);
    } catch {
      /* ignore */
    }
    scene.remove(carMesh);
    carMesh.traverse((obj) => {
      if (obj instanceof THREE.Mesh) obj.geometry.dispose();
    });
    const built = buildCarMesh(id);
    carMesh = built.group;
    wheels = built.wheels;
    frontWheels = built.frontWheels;
    scene.add(carMesh);
    const keep = { x: car.x, z: car.z, yaw: car.yaw };
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
    [rockMesh, crateMesh, barrelMesh, cactusMesh, pineMesh, iceMesh, rampMesh, railMesh, fanPoleMesh, fanBladeMesh, nitroMesh, curbMesh, curbCapMesh].forEach((m) => {
      m.geometry.dispose();
      (m.material as THREE.Material).dispose();
    });
    for (const g of beacons) {
      scene.remove(g);
      g.traverse((obj) => {
        const mesh = obj as THREE.Mesh;
        if (mesh.geometry) mesh.geometry.dispose();
      });
    }
    for (const { mesh } of impostors) {
      scene.remove(mesh);
      const mm = mesh as THREE.Mesh;
      mm.geometry?.dispose();
      (mm.material as THREE.Material)?.dispose();
    }
    for (const lava of lavaPools) {
      scene.remove(lava);
      lava.geometry.dispose();
    }
    lavaMat.dispose();
    for (const puff of smokePuffs) {
      scene.remove(puff.mesh);
      puff.mesh.geometry.dispose();
      (puff.mesh.material as THREE.Material).dispose();
    }
    renderer.dispose();
  }

  const probe = {
    getYaw: () => car.yaw,
    getSpeed: () => car.speed,
    getAirborne: () => car.airborne,
    setSteer: (v: number) => input.setSteer(v),
    setKeys: (codes: string[]) => input.setKeys(codes),
    setPos: (x: number, z: number) => {
      car.x = x;
      car.z = z;
      car.y = heightAt(x, z) + specOf(car.vehicle).ride;
      car.vy = 0;
      car.vx = 0;
      car.vz = 0;
      car.airborne = false;
      car.landGrace = 0;
    },
    getXZ: () => ({ x: car.x, z: car.z, y: car.y }),
    setYaw: (y: number) => {
      car.yaw = y;
    },
  };
  window.__controlsTest = probe;

  setMode("menu");
  return { start, pause, resume, restart, goHome, dispose, setVehicle, getVehicle: () => vehicleId, input, getCar: () => car };
}

declare global {
  interface Window {
    __controlsTest?: {
      getYaw: () => number;
      getSpeed: () => number;
      setSteer?: (v: number) => void;
      setKeys?: (codes: string[]) => void;
    };
  }
}
