import { useEffect, useRef, useState, type ReactNode } from "react";
import { Gauge, Home, Pause, Play, RotateCcw } from "lucide-react";
import { createEngine, type Hud, type Mode } from "@/game/engine";
import { VEHICLES, loadVehicle, type VehicleId } from "@/game/car";
import type { Input } from "@/game/input";

const ZERO: Hud = { speedKmh: 0, rpm: 0, distance: 0, best: 0, gear: 1, biome: "Dune Sea", nitro: 0, boosting: false };

export function GameApp() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const engineRef = useRef<ReturnType<typeof createEngine> | null>(null);
  const [mode, setMode] = useState<Mode>("menu");
  const [hud, setHud] = useState<Hud>(ZERO);
  const [vehicle, setVehicle] = useState<VehicleId>(() => loadVehicle());

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const engine = createEngine(canvas, {
      onHud: setHud,
      onMode: setMode,
    });
    engineRef.current = engine;
    return () => {
      engine.dispose();
      engineRef.current = null;
    };
  }, []);

  const e = () => engineRef.current;
  const input = () => e()?.input;

  return (
    <main className="relative h-dvh w-full overflow-hidden bg-bg text-fg">
      <canvas
        ref={canvasRef}
        className="absolute inset-0 h-full w-full touch-none"
        onContextMenu={(ev) => ev.preventDefault()}
      />

      {mode === "playing" || mode === "paused" || mode === "crashed" ? (
        <HudLayer hud={hud} mode={mode} onPause={() => e()?.pause()} />
      ) : null}

      {mode === "menu" ? (
        <Menu
          best={hud.best}
          vehicle={vehicle}
          onPick={(id) => {
            e()?.setVehicle(id);
            setVehicle(id);
          }}
          onPlay={() => e()?.start()}
        />
      ) : null}

      {mode === "paused" ? (
        <Sheet
          title="Paused"
          subtitle="The desert can wait."
          actions={[
            { label: "Resume", icon: <Play className="size-4" />, primary: true, onClick: () => e()?.resume() },
            { label: "Restart", icon: <RotateCcw className="size-4" />, onClick: () => e()?.restart() },
            { label: "Home", icon: <Home className="size-4" />, onClick: () => e()?.goHome() },
          ]}
        />
      ) : null}

      {mode === "crashed" ? (
        <Sheet
          title="Wrecked"
          subtitle={`${fmtDist(hud.distance)} this run · best ${fmtDist(hud.best)}`}
          actions={[
            { label: "Restart", icon: <RotateCcw className="size-4" />, primary: true, onClick: () => e()?.restart() },
            { label: "Home", icon: <Home className="size-4" />, onClick: () => e()?.goHome() },
          ]}
        />
      ) : null}

      {mode === "playing" ? <TouchPad input={input} /> : null}
    </main>
  );
}

function Menu({
  best,
  vehicle,
  onPick,
  onPlay,
}: {
  best: number;
  vehicle: VehicleId;
  onPick: (id: VehicleId) => void;
  onPlay: () => void;
}) {
  return (
    <div className="absolute inset-0 flex flex-col justify-end bg-gradient-to-t from-bg via-bg/55 to-transparent px-6 pb-8 pt-16 sm:px-12">
      <div className="max-w-lg">
        <p className="mb-2 text-sm font-medium tracking-[0.28em] text-muted uppercase">Freeride</p>
        <h1 className="font-display text-6xl leading-none tracking-tight text-fg sm:text-7xl">Open Mile</h1>
        <p className="mt-3 max-w-md text-sm leading-relaxed text-muted sm:text-base">
          Asphalt cuts to spiral peaks. Red Mesa has a live volcano with lava rivers.
          Pine Range is timbered. White Horizon is a giant ice climb — narrow, slick, no walls.
        </p>

        <div className="mt-6 grid grid-cols-2 gap-2">
          {VEHICLES.map((v) => {
            const on = v.id === vehicle;
            return (
              <button
                key={v.id}
                type="button"
                onClick={() => onPick(v.id)}
                className={
                  on
                    ? "rounded-lg border border-accent bg-elevated px-3 py-3 text-left"
                    : "rounded-lg border border-border bg-surface/80 px-3 py-3 text-left"
                }
              >
                <p className="font-display text-2xl leading-none tracking-tight text-fg">{v.name}</p>
                <p className="mt-1 text-[11px] tracking-wide text-muted uppercase">{v.tag}</p>
                <p className="mt-2 text-xs text-subtle">{v.blurb}</p>
                <p className="mt-2 font-mono text-[10px] text-muted">
                  {v.id === "baja" ? "Accel · Boost · Armor" : "Grip · Balance · Light"}
                </p>
              </button>
            );
          })}
        </div>

        <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:items-center">
          <button
            type="button"
            onClick={onPlay}
            className="inline-flex h-12 min-w-44 items-center justify-center gap-2 rounded-lg bg-accent px-6 text-sm font-semibold text-accent-fg transition-transform duration-150 hover:brightness-105 active:scale-[0.98]"
          >
            <Play className="size-4" />
            Drive
          </button>
          <p className="font-mono text-xs text-subtle">Best {fmtDist(best)}</p>
        </div>
        <ul className="mt-6 grid grid-cols-2 gap-x-6 gap-y-2 text-xs text-muted sm:text-sm">
          <li>↑ / W throttle</li>
          <li>↓ / S brake</li>
          <li>← → steer</li>
          <li>Hold Space to drift</li>
          <li>Double-tap Space for nitro</li>
          <li>Follow the asphalt</li>
          <li>Volcano in Red Mesa</li>
          <li>White Horizon is brutal ice</li>
        </ul>
      </div>
    </div>
  );
}

function HudLayer({ hud, mode, onPause }: { hud: Hud; mode: Mode; onPause: () => void }) {
  return (
    <div className="pointer-events-none absolute inset-0 flex flex-col justify-between p-4 sm:p-6">
      <div className="flex items-start justify-between">
        <div>
          <p className="font-mono text-[10px] tracking-[0.2em] text-subtle uppercase">Distance</p>
          <p className="font-display text-3xl tabular-nums leading-none text-fg">{fmtDist(hud.distance)}</p>
          <p className="mt-1 text-xs text-muted">{hud.biome} · Best {fmtDist(hud.best)}</p>
          <p className="mt-2 font-mono text-[11px] tracking-wide text-fg">
            Nitro {hud.nitro}{hud.boosting ? " · BOOST" : ""}
          </p>
        </div>
        {mode === "playing" ? (
          <button
            type="button"
            onClick={onPause}
            className="pointer-events-auto inline-flex size-11 items-center justify-center rounded-md border border-border bg-surface/80 text-fg backdrop-blur-sm"
            aria-label="Pause"
          >
            <Pause className="size-4" />
          </button>
        ) : null}
      </div>
      <div className="flex items-end justify-between gap-4">
        <div className="hidden sm:block" />
        <Speedo kmh={hud.speedKmh} rpm={hud.rpm} gear={hud.gear} />
      </div>
    </div>
  );
}

function Speedo({ kmh, rpm, gear }: { kmh: number; rpm: number; gear: number }) {
  const max = 220;
  const ang = -120 + (Math.min(max, kmh) / max) * 240;
  const gearLabel = gear === 0 ? "R" : String(gear);
  return (
    <div className="pointer-events-none relative ml-auto h-36 w-36 shrink-0 sm:h-44 sm:w-44">
      <svg viewBox="0 0 200 200" className="h-full w-full">
        <circle cx="100" cy="100" r="88" fill="#16181d" fillOpacity="0.88" stroke="#2a2d34" />
        <path
          d={arc(100, 100, 74, -120, 120)}
          fill="none"
          stroke="#2a2d34"
          strokeWidth="8"
          strokeLinecap="round"
        />
        <path
          d={arc(100, 100, 74, -120, ang)}
          fill="none"
          stroke="#d4d7dc"
          strokeWidth="8"
          strokeLinecap="round"
        />
        <line
          x1="100"
          y1="100"
          x2={100 + Math.cos(((ang - 90) * Math.PI) / 180) * 58}
          y2={100 + Math.sin(((ang - 90) * Math.PI) / 180) * 58}
          stroke="#c45c4a"
          strokeWidth="3"
          strokeLinecap="round"
        />
        <circle cx="100" cy="100" r="5" fill="#ecece8" />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center pt-6">
        <span className="font-display text-4xl leading-none tabular-nums text-fg">{Math.round(kmh)}</span>
        <span className="text-[10px] tracking-[0.2em] text-muted uppercase">km/h</span>
        <span className="mt-1 flex items-center gap-1 font-mono text-[10px] text-subtle">
          <Gauge className="size-3" />
          {gearLabel} · {Math.round(rpm)}
        </span>
      </div>
    </div>
  );
}

function arc(cx: number, cy: number, r: number, a0: number, a1: number) {
  const p0 = polar(cx, cy, r, a0);
  const p1 = polar(cx, cy, r, a1);
  const large = a1 - a0 > 180 ? 1 : 0;
  return `M ${p0.x} ${p0.y} A ${r} ${r} 0 ${large} 1 ${p1.x} ${p1.y}`;
}

function polar(cx: number, cy: number, r: number, deg: number) {
  const a = ((deg - 90) * Math.PI) / 180;
  return { x: cx + Math.cos(a) * r, y: cy + Math.sin(a) * r };
}

function Sheet({
  title,
  subtitle,
  actions,
}: {
  title: string;
  subtitle: string;
  actions: { label: string; icon: ReactNode; onClick: () => void; primary?: boolean }[];
}) {
  return (
    <div className="absolute inset-0 flex items-center justify-center bg-bg/55 px-4 backdrop-blur-[2px]">
      <div className="w-full max-w-sm rounded-xl border border-border bg-surface p-6 shadow-lg">
        <h2 className="font-display text-4xl tracking-tight text-fg">{title}</h2>
        <p className="mt-1 text-sm text-muted">{subtitle}</p>
        <div className="mt-6 flex flex-col gap-2">
          {actions.map((a) => (
            <button
              key={a.label}
              type="button"
              onClick={a.onClick}
              className={
                a.primary
                  ? "inline-flex h-12 items-center justify-center gap-2 rounded-md bg-accent text-sm font-semibold text-accent-fg active:scale-[0.98]"
                  : "inline-flex h-12 items-center justify-center gap-2 rounded-md border border-border bg-elevated text-sm font-medium text-fg active:scale-[0.98]"
              }
            >
              {a.icon}
              {a.label}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

function TouchPad({ input }: { input: () => Input | undefined }) {
  const lastDrift = useRef(0);
  const bind = (apply: (inp: Input, on: boolean) => void) => ({
    onPointerDown: (e: React.PointerEvent) => {
      (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
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
    },
  });

  const btn =
    "pointer-events-auto flex size-12 items-center justify-center rounded-md border border-border bg-surface/80 text-fg text-lg font-semibold backdrop-blur-sm active:bg-elevated sm:size-14";

  return (
    <div className="pointer-events-none absolute inset-x-0 bottom-4 flex items-end justify-between px-4 sm:hidden">
      <div className="grid grid-cols-3 gap-2">
        <span />
        <button type="button" className={btn} aria-label="Throttle" {...bind((i, on) => (i.touchThrottle = on ? 1 : 0))}>
          ↑
        </button>
        <span />
        <button type="button" className={btn} aria-label="Left" {...bind((i, on) => (i.touchSteer = on ? 1 : 0))}>
          ←
        </button>
        <button type="button" className={btn} aria-label="Brake" {...bind((i, on) => (i.touchBrake = on ? 1 : 0))}>
          ↓
        </button>
        <button type="button" className={btn} aria-label="Right" {...bind((i, on) => (i.touchSteer = on ? -1 : 0))}>
          →
        </button>
      </div>
      <button
        type="button"
        className={btn + " h-12 w-20"}
        aria-label="Drift or nitro"
        onPointerDown={(e) => {
          (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
          const inp = input();
          if (!inp) return;
          const now = performance.now();
          if (now - lastDrift.current < 280) inp.queueNitro();
          lastDrift.current = now;
          inp.touchHandbrake = true;
        }}
        onPointerUp={() => {
          const inp = input();
          if (inp) inp.touchHandbrake = false;
        }}
        onPointerCancel={() => {
          const inp = input();
          if (inp) inp.touchHandbrake = false;
        }}
      >
        Drift
      </button>
    </div>
  );
}

function fmtDist(m: number) {
  if (m >= 1000) return `${(m / 1000).toFixed(2)} km`;
  return `${Math.round(m)} m`;
}
