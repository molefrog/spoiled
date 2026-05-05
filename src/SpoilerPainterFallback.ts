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
const HIGH_Z_INDEX = "2147483647";

export type SpoilerPainterFallbackOptions = {
  readonly defaultDensity: number;
  readonly defaultGap: number | boolean;
};

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
  #inlinePositioning = false;
  #viewportListeners = false;
  #lastGap: number | boolean;
  #refreshRAF: ReturnType<typeof requestAnimationFrame> | null = null;
  #refreshNeedsDraw = false;
  #refreshNeedsSurface = false;

  readonly #handleScroll = () => {
    this.syncGeometry();
  };

  readonly #handleResize = () => {
    this.scheduleRefresh({ draw: true, surface: true });
  };

  constructor(el: HTMLElement, options: SpoilerPainterFallbackOptions) {
    this.el = el;
    this.#defaultDensity = options.defaultDensity;
    this.#defaultGap = options.defaultGap;
    this.#lastGap = options.defaultGap;
  }

  destroy() {
    if (this.#mode === "none") return;

    this.attachViewportListeners(false);

    if (this.#refreshRAF !== null) {
      cancelAnimationFrame(this.#refreshRAF);
      this.#refreshRAF = null;
    }

    this.#canvases.forEach(({ canvas }) => canvas.remove());
    this.#canvases = [];
    this.#layout = null;
    this.#refreshNeedsDraw = false;
    this.#refreshNeedsSurface = false;

    if (this.#root) {
      this.#root.remove();
      this.#root = null;
    }

    if (this.#inlinePositioning) {
      this.el.style.position = this.#inlinePosition;
      this.#inlinePositioning = false;
    }

    this.#mode = "none";
  }

  updateSurface(gap: number | boolean | undefined, draw = true): boolean {
    if (typeof document === "undefined") return false;

    const mode = getComputedStyle(this.el).getPropertyValue("display") === "inline" ? "inline" : "block";
    if (!this.ensureSurface(mode)) {
      return false;
    }

    this.#lastGap = gap ?? this.#defaultGap;
    this.#dpr = Math.max(1, globalThis.devicePixelRatio || 1);

    this.syncGeometry();
    this.el.style.setProperty("--gap", this.getGap(mode, this.#lastGap));
    this.attachViewportListeners(mode === "inline");
    if (draw) {
      this.drawFrame();
    }

    return true;
  }

  show(duration: number, draw = true) {
    if (!this.updateSurface(this.#lastGap, draw) || !this.#root) {
      this.el.style.setProperty("background", "var(--fallback)");
      return false;
    }

    this.el.style.removeProperty("background");
    this.#root.style.transitionDuration = `${duration}s`;
    this.#root.style.opacity = "1";
    return true;
  }

  hide(duration: number) {
    if (this.#root) {
      this.#root.style.transitionDuration = `${duration}s`;
      this.#root.style.opacity = "0";
    }

    this.el.style.removeProperty("background");
  }

  syncGeometry() {
    if (!this.#root || this.#mode === "none") return;

    const layout = this.getLayout(this.#mode);
    this.#layout = layout;

    if (this.#mode === "inline") {
      this.#root.style.left = `${layout.left}px`;
      this.#root.style.top = `${layout.top}px`;
      this.#root.style.width = `${layout.width}px`;
      this.#root.style.height = `${layout.height}px`;
    }

    this.syncCanvases(layout.fragments);
  }

  drawFrame() {
    this.#canvases.forEach(({ canvas, ctx }) => {
      const width = canvas.width;
      const height = canvas.height;

      if (width <= 0 || height <= 0) return;

      this.#painter.paint(ctx, { width, height }, this.getPropertyMap());
    });
  }

  getDensity() {
    const rawDensity = parseFloat(this.el.style.getPropertyValue("--density"));
    return Number.isFinite(rawDensity) ? rawDensity : this.#defaultDensity;
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

      root.style.position = "absolute";
      root.style.inset = "0";
      root.style.zIndex = HIGH_Z_INDEX;
      this.el.prepend(root);
    } else {
      root.style.position = "fixed";
      root.style.left = "0";
      root.style.top = "0";
      root.style.zIndex = HIGH_Z_INDEX;
      this.getInlineRootParent().appendChild(root);
    }

    this.#mode = mode;
    this.#root = root;
    this.#canvases = [];

    return true;
  }

  getInlineRootParent() {
    const rootNode = this.el.getRootNode();

    if (rootNode instanceof ShadowRoot) {
      return rootNode;
    }

    return this.el.ownerDocument.body ?? this.el.ownerDocument.documentElement;
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

  scheduleRefresh(options: { draw: boolean; surface?: boolean }) {
    this.#refreshNeedsDraw = this.#refreshNeedsDraw || options.draw;
    this.#refreshNeedsSurface = this.#refreshNeedsSurface || Boolean(options.surface);

    if (this.#refreshRAF !== null) return;

    this.#refreshRAF = requestAnimationFrame(() => {
      this.#refreshRAF = null;

      const needsSurface = this.#refreshNeedsSurface;
      const needsDraw = this.#refreshNeedsDraw;

      this.#refreshNeedsSurface = false;
      this.#refreshNeedsDraw = false;

      if (needsSurface) {
        this.updateSurface(this.#lastGap);
        return;
      }

      this.syncGeometry();
      if (needsDraw) {
        this.drawFrame();
      }
    });
  }

  getLayout(mode: Exclude<FallbackMode, "none">): FallbackLayout {
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

    const left = Math.round(bounds.left);
    const top = Math.round(bounds.top);

    const fragments = [...this.el.getClientRects()]
      .map((rect) => ({
        x: Math.round(rect.left - left),
        y: Math.round(rect.top - top),
        width: Math.ceil(rect.width),
        height: Math.ceil(rect.height),
      }))
      .filter((rect) => rect.width > 0 && rect.height > 0);

    return {
      left,
      top,
      width,
      height,
      fragments: fragments.length > 0 ? fragments : [{ x: 0, y: 0, width, height }],
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
      const pixelWidth = Math.max(1, Math.ceil(fragment.width * this.#dpr));
      const pixelHeight = Math.max(1, Math.ceil(fragment.height * this.#dpr));

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
