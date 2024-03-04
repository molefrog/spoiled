import { RefObject, useState } from "react";
import { useIsomorphicInsertionEffect } from "./useIsomorphicLayoutEffect";

/**
 * `useStyleSheet` is a hook that injects CSS code into the document's <head>
 *
 * 1. Injects styles only once when called in multiple components
 * 2. Gargabe collects the style when the last component is unmounted
 */

type StyleElementMap = WeakMap<
  Document,
  {
    element: HTMLStyleElement;

    // holds the number of active components that are using the same style sheet
    // so we can garbage collect the style when the last component is unmounted
    refCount: number;
  }
>;

const styleElementMap: StyleElementMap = new Map();

/**
 * Injects CSS code into the document's <head>
 */
export const useStyleSheet = (styles: string | null, nodeRef: RefObject<HTMLElement>): void => {
  const [css] = useState(() => styles); // css is constant and can't be changed between renders
  const [parentDocument] = useState(() =>
    nodeRef.current ? nodeRef.current.ownerDocument : document
  );

  useIsomorphicInsertionEffect(() => {
    if (!css || typeof parentDocument === "undefined") return;

    if (!styleElementMap.has(parentDocument)) {
      const styleElement = parentDocument.createElement("style");
      styleElement.innerHTML = css;

      styleElementMap.set(parentDocument, { element: styleElement, refCount: 0 });
      parentDocument.head.appendChild(styleElement);
    }

    styleElementMap.get(parentDocument)!.refCount++;
  }, []);

  useIsomorphicInsertionEffect(() => {
    return () => {
      if (!css || typeof parentDocument === "undefined") return;

      const entry = styleElementMap.get(parentDocument);

      // remove the CSS when the last component is unmounted
      if (entry && --entry.refCount <= 0) {
        styleElementMap.delete(parentDocument);
        parentDocument.head.removeChild(entry.element);
      }
    };
  }, []);
};
