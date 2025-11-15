import { describe, it, expect, afterEach, vi } from "vitest";
import "@testing-library/jest-dom/vitest";
import { render, cleanup, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import { Spoiler } from "./Spoiler";

afterEach(cleanup);

describe("wrapper element customization", () => {
  it("renders a span wrapper by default", () => {
    const { container } = render(<Spoiler>Hello!</Spoiler>);
    const element = container.firstElementChild!;

    expect(element).toBeInTheDocument();
    expect(element.tagName).toBe("SPAN");
  });

  it("passes standard props to the element", () => {
    const { container } = render(
      <Spoiler className="custom" dir="rtl">
        Hello!
      </Spoiler>
    );
    const element = container.firstElementChild!;

    expect(element).toHaveClass("custom");
    expect(element).toHaveAttribute("dir", "rtl");
  });

  it("can customize wrapper's tag via `tagName` prop", () => {
    const { container } = render(
      <Spoiler tagName="div">
        <img alt="test" />
      </Spoiler>
    );

    const divElement = container.firstElementChild!;

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

describe("controlled/uncontrolled Spoiler Component", () => {
  it("calls onHiddenChange with false when clicked (default is hidden)", async () => {
    const changeHandler = vi.fn();
    const { getByText } = render(
      <Spoiler revealOn="click" onHiddenChange={changeHandler}>
        Click me
      </Spoiler>
    );
    await userEvent.click(getByText("Click me"));
    await waitFor(() => expect(changeHandler).toHaveBeenCalledWith(false));
  });

  it("calls onChange with true when clicked (defaultHidden is false)", async () => {
    const changeHandler = vi.fn();
    const { getByText } = render(
      <Spoiler revealOn="click" defaultHidden={false} onHiddenChange={changeHandler}>
        Click me
      </Spoiler>
    );
    await userEvent.click(getByText("Click me"));
    await waitFor(() => expect(changeHandler).toHaveBeenCalledWith(true));
  });

  it("controls Spoiler's visibility via `hidden` prop", () => {
    const { container, rerender } = render(<Spoiler hidden={true}>Always hidden</Spoiler>);

    expect(container.firstElementChild!).toHaveAttribute("aria-expanded", "false");

    rerender(<Spoiler hidden={false}>Always visible</Spoiler>);
    expect(container.firstElementChild!).not.toHaveAttribute("aria-expanded", "false");
  });
});

describe("Spoiler options", () => {
  it("accepts custom spoiler painter options", () => {
    <Spoiler fps={1}>Hey</Spoiler>;

    // @ts-expect-error - This should error in TypeScript due to unknown prop
    <Spoiler painterShouldExplode="1">Hey</Spoiler>;
  });
});

describe("content transitions via `transition` keyword", () => {
  it('renders one wrapper element when it is falsey or "none"', () => {
    const { getByText } = render(
      <Spoiler transition={false}>Spoiler Alert: Dumbledore joins Voldemort</Spoiler>
    );

    const element = getByText(/Voldemort/);

    expect(element).toBeInTheDocument();
    expect(element.tagName).toBe("SPAN");
    expect(element.parentElement?.tagName).not.toBe("SPAN");
  });

  it("renders with specified transition", () => {
    const { getByText } = render(
      <Spoiler transition="iris">Spoiler Alert: Frodo keeps the Ring</Spoiler>
    );

    const element = getByText(/Frodo/);
    expect(element).toBeInTheDocument();

    // should be span within a span
    expect(element.tagName).toBe("SPAN");
    expect(element.parentElement?.tagName).toBe("SPAN");
  });
});
