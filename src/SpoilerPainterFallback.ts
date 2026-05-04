import { SpoilerPainterWorklet } from "./worklet.js";

type PaintPropertyMapLike = {
  get(name: string): string | undefined;
};

type SpoilerPaintRenderer = {
  paint(
    ctx: CanvasRenderingContext2D,
    size: { width: number; height: number },
    props: PaintPropertyMapLike,
  ): void;
};

type FallbackMode = "none" | "block" | "inline";

type FallbackFragment = {
  readonly x: number;
  readonly y: number;
  readonly width: number;
  readonly height: number;
};

type FallbackLayout = {
  readonly left: number;
  readonly top: number;
  readonly width: number;
  readonly height: number;
  readonly fragments: FallbackFragment[];
};

type FallbackCanvas = {
  readonly canvas: HTMLCanvasElement;
  readonly ctx: CanvasRenderingContext2D;
};

const GAP_RATIO = 8.0;

export type SpoilerPainterFallbackOptions = {
  readonly defaultDensity: number;
  readonly defaultGap: number | boolean;
};

type SurfaceResult = boolean;

export class SpoilerPainterFallback {
  readonly el: HTMLElement;
  readonly #painter: SpoilerPaintRenderer = new SpoilerPainterWorklet();
  readonly #defaultDensity: number;
  readonly #defaultGap: number | boolean;

  #mode: FallbackMode = "none";
  #root: HTMLDivElement | null = null;
  #canvases: FallbackCanvas[] = [];
  #layout: FallbackLayout | null = null;
  // Keep the fallback canvases sharp by sizing their backing bitmaps to the current DPR.
  #dpr = 1;
  #inlinePosition = "";
  #inlineOverflow = "";
  #inlinePositioning = false;
  #viewportListeners = false;
  #lastGap: number | boolean;

  readonly #handleScroll = () => {
    this.syncGeometry();
  };

  readonly #handleResize = () => {
    this.updateSurface(this.#lastGap);
  };

  constructor(el: HTMLElement, options: SpoilerPainterFallbackOptions) {
    this.el = el;
    this.#defaultDensity = options.defaultDensity;
    this.#defaultGap = options.defaultGap;
    this.#lastGap = options.defaultGap;
  }

  destroy() {
    this.attachViewportListeners(false);

    this.#canvases.forEach(({ canvas }) => canvas.remove());
    this.#canvases = [];
    this.#layout = null;

    if (this.#root) {
      this.#root.remove();
      this.#root = null;
    }

    if (this.#inlinePositioning) {
      this.el.style.position = this.#inlinePosition;
      this.#inlinePositioning = false;
    }

    this.el.style.overflow = this.#inlineOverflow;
    this.#mode = "none";
  }

  updateSurface(gap: number | boolean | undefined): SurfaceResult {
    if (typeof document === "undefined") return false;

    const mode = getComputedStyle(this.el).getPropertyValue("display") === "inline" ? "inline" : "block";
    if (!this.ensureSurface(mode)) {
      return false;
    }

    this.#lastGap = gap ?? this.#defaultGap;
    this.#dpr = Math.max(1, Math.round(globalThis.devicePixelRatio || 1));

    if (!this.syncGeometry()) {
      return false;
    }

    this.el.style.setProperty("--gap", this.getGap(mode, this.#lastGap));
    this.attachViewportListeners(mode === "inline");
    this.drawFrame();

    return true;
  }

  show(duration: number) {
    if (!this.updateSurface(this.#lastGap) || !this.#root) {
      this.el.style.setProperty("background", "var(--fallback)");
      return;
    }

    this.el.style.removeProperty("background");
    this.#root.style.transitionDuration = `${duration}s`;
    this.#root.style.opacity = "1";
  }

  hide(duration: number) {
    if (this.#root) {
      this.#root.style.transitionDuration = `${duration}s`;
      this.#root.style.opacity = "0";
    }

    this.el.style.removeProperty("background");
  }

  syncGeometry() {
    if (!this.#root || this.#mode === "none") return false;

    const layout = this.getLayout(this.#mode);
    if (!layout) return false;

    this.#layout = layout;

    if (this.#mode === "inline") {
      this.#root.style.left = `${layout.left}px`;
      this.#root.style.top = `${layout.top}px`;
      this.#root.style.width = `${layout.width}px`;
      this.#root.style.height = `${layout.height}px`;
    }

    this.syncCanvases(layout.fragments);
    return true;
  }

  drawFrame() {
    this.#canvases.forEach(({ canvas, ctx }) => {
      const width = canvas.width;
      const height = canvas.height;

      if (width <= 0 || height <= 0) return;

      ctx.clearRect(0, 0, width, height);
      this.#painter.paint(ctx, { width, height }, this.getPropertyMap());
    });
  }

  getDensity() {
    const rawDensity = parseFloat(this.el.style.getPropertyValue("--density"));
    const density = Number.isFinite(rawDensity) ? rawDensity : this.#defaultDensity;
    const accent = this.el.style.getPropertyValue("--accent") || "";
    const parts = accent.trim().split(/\s+/);
    const lightness = parseFloat(parts[2] || "");

    if (Number.isFinite(lightness) && lightness > 50) {
      return density * 1.7;
    }

    return density;
  }

  ensureSurface(mode: Exclude<FallbackMode, "none">) {
    if (this.#mode !== "none" && this.#mode !== mode) {
      this.destroy();
    }

    if (this.#root) {
      return true;
    }

    const root = document.createElement("div");
    root.setAttribute("aria-hidden", "true");
    root.style.pointerEvents = "none";
    root.style.opacity = "0";
    root.style.transitionProperty = "opacity";

    if (mode === "block") {
      if (getComputedStyle(this.el).position === "static") {
        this.#inlinePosition = this.el.style.position;
        this.el.style.position = "relative";
        this.#inlinePositioning = true;
      }

      this.#inlineOverflow = this.el.style.overflow;
      this.el.style.overflow = "hidden";

      root.style.position = "absolute";
      root.style.inset = "0";
      root.style.zIndex = "0";
      this.el.prepend(root);
    } else {
      root.style.position = "absolute";
      root.style.left = "0";
      root.style.top = "0";
      root.style.zIndex = "2147483647";
      document.body.appendChild(root);
    }

    this.#mode = mode;
    this.#root = root;
    this.#canvases = [];

    return true;
  }

  attachViewportListeners(enabled: boolean) {
    if (enabled === this.#viewportListeners) return;

    this.#viewportListeners = enabled;

    if (enabled) {
      globalThis.addEventListener("scroll", this.#handleScroll, true);
      globalThis.addEventListener("resize", this.#handleResize);
      return;
    }

    globalThis.removeEventListener("scroll", this.#handleScroll, true);
    globalThis.removeEventListener("resize", this.#handleResize);
  }

  getLayout(mode: Exclude<FallbackMode, "none">): FallbackLayout | null {
    const bounds = this.el.getBoundingClientRect();
    const width = Math.max(1, Math.ceil(bounds.width));
    const height = Math.max(1, Math.ceil(bounds.height));

    if (mode === "block") {
      return {
        left: 0,
        top: 0,
        width,
        height,
        fragments: [{ x: 0, y: 0, width, height }],
      };
    }

    const left = Math.round(bounds.left + globalThis.scrollX);
    const top = Math.round(bounds.top + globalThis.scrollY);

    const fragments = [...this.el.getClientRects()]
      .map((rect) => ({
        x: Math.round(rect.left + globalThis.scrollX - left),
        y: Math.round(rect.top + globalThis.scrollY - top),
        width: Math.ceil(rect.width),
        height: Math.ceil(rect.height),
      }))
      .filter((rect) => rect.width > 0 && rect.height > 0);

    if (fragments.length === 0) {
      return {
        left,
        top,
        width,
        height,
        fragments: [{ x: 0, y: 0, width, height }],
      };
    }

    return {
      left,
      top,
      width,
      height,
      fragments,
    };
  }

  syncCanvases(fragments: readonly FallbackFragment[]) {
    if (!this.#root) return;

    while (this.#canvases.length < fragments.length) {
      const canvas = document.createElement("canvas");
      const ctx = canvas.getContext("2d");

      if (!ctx) {
        this.el.style.setProperty("background", "var(--fallback)");
        return;
      }

      canvas.style.position = "absolute";
      canvas.style.pointerEvents = "none";
      this.#root.appendChild(canvas);
      this.#canvases.push({ canvas, ctx });
    }

    while (this.#canvases.length > fragments.length) {
      this.#canvases.pop()?.canvas.remove();
    }

    fragments.forEach((fragment, index) => {
      const { canvas } = this.#canvases[index];
      const pixelWidth = Math.max(1, fragment.width * this.#dpr);
      const pixelHeight = Math.max(1, fragment.height * this.#dpr);

      canvas.style.left = `${fragment.x}px`;
      canvas.style.top = `${fragment.y}px`;
      canvas.style.width = `${fragment.width}px`;
      canvas.style.height = `${fragment.height}px`;

      if (canvas.width !== pixelWidth) canvas.width = pixelWidth;
      if (canvas.height !== pixelHeight) canvas.height = pixelHeight;
    });
  }

  getGap(mode: Exclude<FallbackMode, "none">, gap: number | boolean | undefined) {
    const value = gap === false ? 0 : Number(gap ?? this.#defaultGap);
    const capGap = Number.isFinite(value) ? Math.floor(Math.max(0, value)) : 0;

    if (mode === "block") {
      const layout = this.#layout;
      const width = layout?.width ?? 0;
      const height = layout?.height ?? 0;
      const blockGap = Math.floor(Math.min(capGap, width / GAP_RATIO, height / GAP_RATIO));

      return `${blockGap}px ${blockGap}px`;
    }

    const lineHeight = Math.min(...(this.#layout?.fragments.map((rect) => rect.height) ?? [0]));
    return `0px ${Math.floor(Math.min(lineHeight / GAP_RATIO, capGap))}px`;
  }

  getPropertyMap(): PaintPropertyMapLike {
    return {
      get: (name: string) => {
        switch (name) {
          case "--t":
          case "--t-stop":
          case "--fade":
          case "--gap":
          case "--accent":
            return this.el.style.getPropertyValue(name) || undefined;
          case "--words":
            return "false";
          case "--density":
            return String(this.getDensity());
          default:
            return undefined;
        }
      },
    };
  }
}
