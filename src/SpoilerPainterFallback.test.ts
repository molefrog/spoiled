import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { SpoilerPainter } from "./SpoilerPainter";
import { SpoilerPainterFallback } from "./SpoilerPainterFallback";
import { SpoilerPainterWorklet } from "./worklet.js";

const fakeContext = {} as CanvasRenderingContext2D;

describe("SpoilerPainterFallback", () => {
  let originalGetContext: typeof HTMLCanvasElement.prototype.getContext;
  let originalRAF: typeof globalThis.requestAnimationFrame;

  beforeEach(() => {
    originalGetContext = HTMLCanvasElement.prototype.getContext;
    originalRAF = globalThis.requestAnimationFrame;

    HTMLCanvasElement.prototype.getContext = vi.fn(
      () => fakeContext,
    ) as unknown as typeof HTMLCanvasElement.prototype.getContext;
    globalThis.requestAnimationFrame = vi.fn(() => 1) as typeof requestAnimationFrame;
  });

  afterEach(() => {
    HTMLCanvasElement.prototype.getContext = originalGetContext;
    globalThis.requestAnimationFrame = originalRAF;
    vi.restoreAllMocks();
    document.body.innerHTML = "";
  });

  it("does not clear host inline styles when destroyed before a surface is created", () => {
    const el = document.createElement("div");
    el.style.overflow = "visible";
    el.style.position = "sticky";

    const fallback = new SpoilerPainterFallback(el, {
      defaultDensity: 0.12,
      defaultGap: 6,
    });

    fallback.destroy();

    expect(el.style.overflow).toBe("visible");
    expect(el.style.position).toBe("sticky");
  });

  it("passes through the configured density and disables word gaps in fallback mode", () => {
    const el = document.createElement("span");
    document.body.appendChild(el);

    vi.spyOn(el, "getBoundingClientRect").mockReturnValue({
      left: 10,
      top: 20,
      width: 120,
      height: 24,
      right: 130,
      bottom: 44,
      x: 10,
      y: 20,
      toJSON: () => ({}),
    });
    vi.spyOn(el, "getClientRects").mockReturnValue([
      {
        left: 10,
        top: 20,
        width: 120,
        height: 24,
        right: 130,
        bottom: 44,
        x: 10,
        y: 20,
        toJSON: () => ({}),
      },
    ] as any);

    let observedDensity: string | undefined;
    let observedWords: string | undefined;
    vi.spyOn(SpoilerPainterWorklet.prototype, "paint").mockImplementation((_ctx, _size, props) => {
      observedDensity = props.get("--density");
      observedWords = props.get("--words");
    });

    el.style.setProperty("--density", "0.42");

    const fallback = new SpoilerPainterFallback(el, {
      defaultDensity: 0.12,
      defaultGap: 6,
    });

    fallback.updateSurface(6);

    expect(observedDensity).toBe("0.42");
    expect(observedWords).toBe("false");
  });

  it("does not update the fallback surface twice when revealing", () => {
    const el = document.createElement("span");
    document.body.appendChild(el);

    const updateSurfaceSpy = vi
      .spyOn(SpoilerPainterFallback.prototype, "updateSurface")
      .mockReturnValue(true);
    vi.spyOn(SpoilerPainterFallback.prototype, "show").mockReturnValue(true);
    vi.spyOn(SpoilerPainterFallback.prototype, "drawFrame").mockImplementation(() => {});

    const painter = new SpoilerPainter(el, { forceFallback: true });

    painter.hide();

    expect(updateSurfaceSpy).toHaveBeenCalledTimes(1);
  });
});
