import { describe, it, expect, afterEach } from "vitest";
import "@testing-library/jest-dom/vitest";
import { render, cleanup } from "@testing-library/react";

import { Spoiler } from "./Spoiler";

afterEach(cleanup);

describe("wrapper element customization", () => {
  it("renders a span wrapper by default", () => {
    const { getByText } = render(<Spoiler>Hello!</Spoiler>);
    expect(getByText("Hello!")).toBeInTheDocument();
    expect(getByText("Hello!").tagName).toBe("SPAN");
  });

  it("passes standard props to the element", () => {
    const { getByText } = render(
      <Spoiler className="custom" dir="rtl">
        Hello!
      </Spoiler>
    );
    expect(getByText("Hello!")).toHaveClass("custom");
    expect(getByText("Hello!")).toHaveAttribute("dir", "rtl");
  });

  it("can customize wrapper's tag via `tagName` prop", () => {
    const { container } = render(
      <Spoiler tagName="div">
        <img alt="test" />
      </Spoiler>
    );
    const divElement = container.querySelector("div");
    expect(divElement).toBeInTheDocument();
    expect(divElement).toContainHTML('<img alt="test">');
  });

  it("attaches directly to the element given as children when `asChild` prop is used", () => {
    const { getByLabelText } = render(
      <Spoiler asChild>
        <blockquote aria-label="hello" />
      </Spoiler>
    );

    expect(getByLabelText("hello")).toBeInTheDocument();
    expect(getByLabelText("hello").tagName).toBe("BLOCKQUOTE");
  });
});
