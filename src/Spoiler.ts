import workletSource from "./worklet.js?raw";
import scopedStyles from "./Spoiler.module.css";

interface InitOptions {
  readonly revealed?: boolean;
}

interface SpoilerOptions {
  readonly fps?: number;
  readonly gap?: number | boolean;
  readonly density?: number;
  readonly mimicWords?: boolean;
}

interface TransitionOptions {
  readonly animate?: boolean | number;
}

const DEFAULT_FPS = 24;

/*
 * The maximum size of a block that can be drawn without using tiling
 * (to improve performance and enable gaps)
 */
const BLOCK_MAX_TILE = 293; // prime

/*
 * The maximum width of an inline element that can be drawn without using tiling
 */
const INLINE_MAX_TILE = 333; // prime

const REVEAL_ANIM_DURATION = 2; // in seconds

const DEFAULT_HIDE_DURATION = 0.5; // in seconds
const DEFAULT_REVEAL_DURATION = 1; // in seconds

const GAP_RATIO = 8.0;

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
      this.hide({ animate: false });
    }
  }

  /**
   * `fps` - the maximum frames per second
   * `mimicWords` - if true, the spoiler will try to mimic the shape of words (cssvar)
   * `density` - overrides the density of the noise (cssvar)
   * `gap` - in px a gap that particles won't spawn within (ignored for elements that exceed
   *         the size limit)
   */
  update({ fps = DEFAULT_FPS, gap = 6, mimicWords = true, density = 0.08 }: SpoilerOptions = {}) {
    // disable animation if the user has requested reduced motion
    this.maxFPS = prefersReducedMotion ? 0 : fps;

    const isBlockElement = getComputedStyle(this.el).getPropertyValue("display") !== "inline";
    this.useBackgroundStyle("auto", "auto", { tile: false });

    /* block elements */
    if (isBlockElement) {
      // this feature can't be used with block elements!
      mimicWords = false;

      const rect = this.el.getBoundingClientRect();

      if (rect.width * rect.height > BLOCK_MAX_TILE * BLOCK_MAX_TILE) {
        this.useBackgroundStyle(
          Math.min(rect.width, BLOCK_MAX_TILE),
          Math.min(rect.height, BLOCK_MAX_TILE),
          { tile: true }
        );
      } else {
        // we can draw the whole block without tiling meaning we can use gaps
        // cap the gap value, so that it looks nice on smaller elements
        const capGap = Math.floor(
          Math.min(Number(gap), rect.width / GAP_RATIO, rect.height / GAP_RATIO)
        );

        this.el.style.setProperty("--gap", `${capGap}px ${capGap}px`);
      }
    }

    if (!isBlockElement) {
      const rects = [...this.el.getClientRects()];
      const heightOfLine = Math.min(...rects.map((r) => r.height));

      this.useBackgroundStyle(INLINE_MAX_TILE, heightOfLine, { tile: true });

      // use top/bottom gaps only
      const capGap = Math.floor(Math.min(heightOfLine / GAP_RATIO, Number(gap)));
      this.el.style.setProperty("--gap", `0 ${capGap}px`);
    }

    this.el.style.setProperty("--mimic-words", String(mimicWords));
    this.el.style.setProperty("--density", String(density));
  }

  useBackgroundStyle(ws: string | number, hs: string | number, options?: { tile: boolean }) {
    ws = typeof ws === "number" ? `${ws}px` : ws;
    hs = typeof hs === "number" ? `${hs}px` : hs;

    const repeatAndPosition = options?.tile ? "repeat left center" : "no-repeat center center";

    this.el.style.background = `paint(spoiler) ${repeatAndPosition} / ${ws} ${hs}`;
  }

  get isHidden() {
    return this.el.classList.contains(scopedStyles.hidden);
  }

  hide({ animate }: TransitionOptions = { animate: true }) {
    const duration = animate === true ? DEFAULT_HIDE_DURATION : Number(animate);

    this.el.style.setProperty("--hide-duration", `${duration}s`);
    this.el.classList.add(scopedStyles.hidden);

    this.#tstop = null; // reset the stop point
    this.t = 0; // reset the clock
    this.startAnimation();
  }

  reveal({ animate }: TransitionOptions = { animate: true }) {
    const duration = animate === true ? DEFAULT_REVEAL_DURATION : Number(animate);
    this.el.style.setProperty("--reveal-duration", `${duration}s`);

    if (duration > 0) {
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
    const shouldStop = this.#tstop && this.t > this.#tstop + REVEAL_ANIM_DURATION;

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
