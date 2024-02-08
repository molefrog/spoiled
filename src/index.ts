import workletSource from "./worklet.js?raw";
import scopedStyles from "./spoiler.module.css";

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
    this.el.classList.add(scopedStyles.spoiler);

    this.applyOptions(options);
    this.hide();
  }

  applyOptions({ fps = DEFAULT_FPS }: SpoilerOptions = {}) {
    this.maxFPS = fps;

    const isInline = getComputedStyle(this.el).getPropertyValue("display") === "inline";

    if (isInline) {
      const lineheights = [...this.el.getClientRects()].map((r) => r.height);
      const maxh = Math.max(...lineheights); // the height of the tallest line
      const w = Math.min(400, maxh * 2); // max width of 400px

      this.el.getClientRects();
    }

    if (!isInline) {
      this.el.style.setProperty("--max-fps", this.maxFPS.toString());
    }
  }

  revealed() {
    return !this.el.classList.contains(scopedStyles.hidden);
  }

  hide() {
    this.el.classList.add(scopedStyles.hidden);
    this.startAnimation();
  }

  reveal() {
    this.stopAnimation();
    this.el.classList.remove(scopedStyles.hidden);
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
    this.#raf = requestAnimationFrame(this.#frame);

    const dt = now - this.#t0;

    // don't skip the first frame (dt = 0)
    if (dt > 0 && dt < 1000 / this.maxFPS) return; // skip frames to limit fps

    this.t += dt / 1000; // in seconds
    this.#t0 = now;
  };

  /** Animation state */

  #raf: ReturnType<typeof requestAnimationFrame> | null = null;

  startAnimation() {
    this.#t0 = performance.now();
    this.#frame(this.#t0);
  }

  stopAnimation() {
    if (this.#raf) {
      cancelAnimationFrame(this.#raf);
      this.#raf = null;
    }
  }

  get isAnimating() {
    return this.#raf !== null;
  }
}

export { Spoiler };
