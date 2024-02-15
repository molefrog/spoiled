import workletSource from "./worklet.js?raw";
import scopedStyles from "./spoiler.module.css";

interface InitOptions {
  readonly revealed?: boolean;
}

interface SpoilerOptions {
  readonly fps?: number;
  readonly gap?: number;
  readonly mimicWords?: boolean;
}

const DEFAULT_FPS = 24;

const TILE_LIMIT = 293; // prime

// Check if the user has requested reduced motion
const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

class Spoiler {
  readonly el: HTMLElement;
  maxFPS: number = DEFAULT_FPS;

  constructor(el: HTMLElement, options: SpoilerOptions & InitOptions = {}) {
    this.el = el;
    this.el.classList.add(scopedStyles.spoiler);

    this.update(options);

    if (!options.revealed) {
      this.hide();
    }
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
    this.useBackgroundStyle("auto", "auto", { tile: false });

    /* block elements */
    if (!isInline) {
      // this feature can't be used with block elements!
      mimicWords = false;

      const rect = this.el.getBoundingClientRect();

      if (rect.width * rect.height > TILE_LIMIT * TILE_LIMIT) {
        this.useBackgroundStyle(
          Math.min(rect.width, TILE_LIMIT),
          Math.min(rect.height, TILE_LIMIT),
          { tile: true }
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
      this.useBackgroundStyle(INLINE_TILE_LIMIT, heightOfLine, { tile: true });

      // use top/bottom gaps only
      const vgap = Math.min(heightOfLine / 5 /* magic number */, gap);
      this.el.style.setProperty("--gap", `0 ${vgap}px`);
    }

    this.el.style.setProperty("--mimic-words", String(mimicWords));
  }

  useBackgroundStyle(ws: string | number, hs: string | number, options?: { tile: boolean }) {
    ws = typeof ws === "number" ? `${ws}px` : ws;
    hs = typeof hs === "number" ? `${hs}px` : hs;

    const repeatPosition = options?.tile ? "repeat left center" : "no-repeat center center";

    this.el.style.background = `paint(spoiler) ${repeatPosition} / ${ws} ${hs}`;
  }

  get isHidden() {
    return this.el.classList.contains(scopedStyles.hidden);
  }

  hide() {
    this.el.classList.add(scopedStyles.hidden);
    this.#tstop = null; // reset the stop point
    this.startAnimation();
  }

  reveal({ animate }: { animate?: boolean } = {}) {
    if (animate) {
      this.#tstop = this.t;
    } else {
      this.stopAnimation();
    }
    this.el.classList.remove(scopedStyles.hidden);
  }

  #_t = 0.0;
  #t0 = 0.0;
  #_tstop: number | null = null;

  get #tstop(): number | null {
    return this.#_tstop;
  }

  set #tstop(value: number | null) {
    this.#_tstop = value;
    if (value) {
      this.el.style.setProperty("--t-stop", value.toFixed(3)); // 1ms precision
    } else {
      this.el.style.removeProperty("--t-stop");
    }
  }

  get t() {
    return this.#_t;
  }

  set t(value: number) {
    this.#_t = value;
    this.el.style.setProperty("--t", value.toFixed(3)); // 1ms precision
  }

  // animation loop
  #frame = (now: DOMHighResTimeStamp) => {
    const shouldStop = this.#tstop && this.t > this.#tstop + 2; /* TODO: constant */

    if (this.maxFPS > 0 && !shouldStop) {
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

export { Spoiler };
