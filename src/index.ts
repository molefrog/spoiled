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
  readonly gap?: number;
  readonly mimicWords?: boolean;
  // readonly accentColor?: string;
}

const DEFAULT_FPS = 24;

const TILE_LIMIT = 149; // prime

// Check if the user has requested reduced motion
const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

class Spoiler {
  readonly el: HTMLElement;
  maxFPS: number = DEFAULT_FPS;

  constructor(el: HTMLElement, options: SpoilerOptions = {}) {
    this.el = el;
    this.el.classList.add(scopedStyles.spoiler);

    this.update(options);
    this.hide();
  }

  /**
   * `fps` - the maximum frames per second
   * `mimicWords` - if true, the spoiler will try to mimic the shape of words (cssvar)
   * `density` - overrides the density of the noise (cssvar)
   * `gap` - in px a gap that particles won't spawn within (ignored for elements that exceed
   *         the size limit)
   */
  update({ fps = DEFAULT_FPS, gap = 16, mimicWords = true }: SpoilerOptions = {}) {
    // disable animation if the user has requested reduced motion
    this.maxFPS = prefersReducedMotion ? 0 : fps;

    const isInline = getComputedStyle(this.el).getPropertyValue("display") === "inline";
    this.useBackgroundStyle("auto", "auto");

    /* block elements */
    if (!isInline) {
      // this feature can't be used with block elements!
      mimicWords = false;

      const rect = this.el.getBoundingClientRect();

      if (rect.width * rect.height > TILE_LIMIT * TILE_LIMIT) {
        this.useBackgroundStyle(
          Math.min(rect.width, TILE_LIMIT),
          Math.min(rect.height, TILE_LIMIT),
          { repeat: true }
        );

        /* no tiling and has enough space for a gap */
      } else if (rect.width >= 3 * gap && rect.height >= 4 * gap) {
        this.el.style.setProperty("--gap", `${gap}px ${gap}px`);
      }
    }

    if (isInline) {
      const rects = [...this.el.getClientRects()];
      const heightOfLine = Math.min(...rects.map((r) => r.height));

      // TODO!
      const INLINE_TILE_LIMIT = 333;
      this.useBackgroundStyle(INLINE_TILE_LIMIT, heightOfLine, { repeat: true });

      // use top/bottom gaps only
      const vgap = Math.min(heightOfLine / 5 /* magic number */, gap);
      this.el.style.setProperty("--gap", `0 ${vgap}px`);
    }

    this.el.style.setProperty("--mimic-words", String(mimicWords));
  }

  useBackgroundStyle(ws: string | number, hs: string | number, options?: { repeat: boolean }) {
    ws = typeof ws === "number" ? `${ws}px` : ws;
    hs = typeof hs === "number" ? `${hs}px` : hs;

    this.el.style.background = `paint(spoiler) ${
      options?.repeat ? "repeat" : ""
    } center center / ${ws} ${hs}`;
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
    if (this.maxFPS > 0) {
      this.#raf = requestAnimationFrame(this.#frame);
    }

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
