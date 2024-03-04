import { describe, it, expect, afterEach } from "vitest";
import { renderHook } from "@testing-library/react";
import { useStyleSheet } from "./useStyleSheet";

afterEach(() => {
  document.head.innerHTML = ""; // Clean up the document head after each test
});

describe("useStyleSheet hook", () => {
  it("injects styles to the document's head", () => {
    const { unmount } = renderHook(() =>
      useStyleSheet("background: red;", { current: document.body })
    );

    const styles = document.head.getElementsByTagName("style");
    expect(styles).toHaveLength(1);
    expect(styles[0].innerHTML).toContain("background: red;");

    unmount();
  });

  it("injects only one style element when called in two different components", () => {
    const { unmount: unmountFirst } = renderHook(() =>
      useStyleSheet("background: red;", { current: document.body })
    );
    const { unmount: unmountSecond } = renderHook(() =>
      useStyleSheet("background: red;", { current: document.body })
    );

    const styles = document.head.getElementsByTagName("style");
    expect(styles).toHaveLength(1);

    unmountFirst();
    unmountSecond();
  });

  it("removes the style element when all components are destroyed", () => {
    const { unmount: unmountFirst } = renderHook(() =>
      useStyleSheet("background: red;", { current: document.body })
    );
    const { unmount: unmountSecond } = renderHook(() =>
      useStyleSheet("background: red;", { current: document.body })
    );

    unmountFirst();
    let styles = document.head.getElementsByTagName("style");
    expect(styles).toHaveLength(1);

    unmountSecond();
    styles = document.head.getElementsByTagName("style");
    expect(styles).toHaveLength(0);
  });
});
