const STEER_LEFT = new Set(["KeyA", "ArrowLeft"]);
const STEER_RIGHT = new Set(["KeyD", "ArrowRight"]);
const THROTTLE = new Set(["KeyW", "ArrowUp"]);
const BRAKE = new Set(["KeyS", "ArrowDown"]);
const HANDBRAKE = new Set(["Space", "ShiftLeft", "ShiftRight"]);

export class Input {
  private held = new Set<string>();
  private override: string[] | null = null;
  private injectedSteer: number | null = null;
  private lastSpace = -1;
  private spaceDownAt = -1;
  private nitroQueued = false;
  private muteHandbrakeUntil = 0;
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

  setKeys(codes: string[]) {
    this.override = codes;
  }

  setSteer(v: number) {
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

  private codes(): Iterable<string> {
    return this.override ?? this.held;
  }

  steer(): number {
    if (this.injectedSteer != null) return clamp(this.injectedSteer, -1, 1);
    let s = this.touchSteer;
    for (const c of this.codes()) {
      if (STEER_LEFT.has(c)) s += 1;
      if (STEER_RIGHT.has(c)) s -= 1;
    }
    return clamp(s, -1, 1);
  }

  throttle(): number {
    let t = this.touchThrottle;
    for (const c of this.codes()) {
      if (THROTTLE.has(c)) t = 1;
    }
    return clamp(t, 0, 1);
  }

  brake(): number {
    let b = this.touchBrake;
    for (const c of this.codes()) {
      if (BRAKE.has(c)) b = 1;
    }
    return clamp(b, 0, 1);
  }

  handbrake(): boolean {
    if (performance.now() < this.muteHandbrakeUntil) return false;
    if (this.touchHandbrake) return true;
    const now = performance.now();
    if (this.held.has("Space") && this.spaceDownAt > 0 && now - this.spaceDownAt > 180) return true;
    for (const c of this.codes()) {
      if (c === "ShiftLeft" || c === "ShiftRight") return true;
    }
    return false;
  }

  pausePressed(code: string) {
    return code === "Escape" || code === "KeyP";
  }

  private onDown = (e: KeyboardEvent) => {
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

  private onUp = (e: KeyboardEvent) => {
    this.held.delete(e.code);
    if (e.code === "Space") this.spaceDownAt = -1;
  };

  private clear = () => {
    this.held.clear();
    this.spaceDownAt = -1;
  };

  private onVis = () => {
    if (document.hidden) this.clear();
  };
}

function clamp(v: number, a: number, b: number) {
  return Math.max(a, Math.min(b, v));
}
