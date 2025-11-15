import { useEffect, useState } from "react";

// Helper function to find the closest parent that ResizeObserver can observe
const findFirstTrackableParent = (element: HTMLElement): HTMLElement => {
  while (element && element.parentNode) {
    const parent = element.parentNode as HTMLElement;
    if (parent.nodeType === 1 && (parent.offsetWidth !== 0 || parent.offsetHeight !== 0)) {
      return parent;
    }
    element = parent;
  }
  return element;
};

const boundingBox = (element: HTMLElement, granularity: number) => {
  let { width: w, height: h } = element.getBoundingClientRect();

  if (granularity > 1) {
    w = Math.round(w / granularity) * granularity;
    h = Math.round(h / granularity) * granularity;
  }

  return [w, h] as const;
};

// Define the hook with TypeScript generics for better ref typing
export function useWatchResize<T extends HTMLElement>(
  ref: React.RefObject<T | null>,
  granularity: number = 4
) {
  const [rect, setRect] = useState<readonly [number, number]>(() => {
    return ref.current ? boundingBox(ref.current, granularity) : [0, 0];
  });

  useEffect(() => {
    if (!ref.current) return;
    if (typeof ResizeObserver === "undefined") return;

    const trackableElement = findFirstTrackableParent(ref.current);

    const observer = new ResizeObserver((_entries) => {
      if (!ref.current) return;
      const [w, h] = boundingBox(ref.current, granularity);

      if (w !== rect[0] || h !== rect[1]) {
        setRect([w, h]);
      }
    });

    observer.observe(trackableElement);

    // Cleanup function to disconnect the observer
    return () => {
      observer.disconnect();
    };
  }, [ref, granularity]); // Dependencies array includes granularity to recalculate when it changes

  return rect;
}
