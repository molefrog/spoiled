import "./styles.css";

import workletSource from "./worklet.js?raw";
import styles from "./spoiler.module.css";

declare global {
  namespace CSS {
    module paintWorklet {
      function addModule(moduleURL: string): Promise<void>;
    }
  }
}

// register paint inline worklet
CSS.paintWorklet.addModule(
  URL.createObjectURL(new Blob([workletSource], { type: "application/javascript" }))
);

interface SpoilerOptions {
  readonly fps?: number;
  readonly mimicWords?: boolean;
  // readonly accentColor?: string;
}

const DEFAULT_FPS = 24;

class Spoiler {
  readonly el: HTMLElement;
  maxFPS: number = DEFAULT_FPS;

  constructor(el: HTMLElement, options: SpoilerOptions = {}) {
    this.el = el;
    this.el.classList.add(styles.spoiler);

    this.applyOptions(options);
    this.#frame(performance.now());
  }

  applyOptions({ fps = DEFAULT_FPS }: SpoilerOptions = {}) {
    this.maxFPS = fps;

    const isInline = getComputedStyle(this.el).getPropertyValue("display") === "inline";

    if (isInline) {
      const lineheights = [...this.el.getClientRects()].map((r) => r.height);
      const maxh = Math.max(...lineheights);

      this.el.getClientRects();
    }

    if (!isInline) {
      this.el.style.setProperty("--max-fps", this.maxFPS.toString());
    }
  }

  #_t = 0.0;
  #t0 = 0.0;

  get t() {
    return this.#_t;
  }

  set t(value: number) {
    this.#_t = value;
    this.el.style.setProperty("--t", value.toFixed(3)); // 1ms precision
  }

  // animation loop
  #frame = (now: DOMHighResTimeStamp) => {
    requestAnimationFrame(this.#frame);

    const dt = now - this.#t0;
    if (dt < 1000 / this.maxFPS) return; // skip frames to limit fps

    this.t += dt / 1000; // in seconds
    this.#t0 = now;
  };
}

for (const el of document.querySelectorAll("spoiler")) {
  if (el instanceof HTMLElement) {
    new Spoiler(el, { fps: 24 });
  }
}

//     const painter = new SpoilerPainter();
//     const ctx = el.getContext("2d");
//     const props = new Map([
//       ["--t", t],
//       ["--dpr", devicePixelRatio],
//     ]);

//     painter.paint(ctx, { width: ctx.canvas.width, height: ctx.canvas.height }, props);
//   }
