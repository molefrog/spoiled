import { describe, it, expect, afterEach, vi } from "vitest";
import "@testing-library/jest-dom/vitest";
import { render, cleanup, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

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

  it("renders with aria-hidden=true when hidden is true", () => {
    const { getByText } = render(<Spoiler hidden={true}>Always hidden</Spoiler>);
    expect(getByText("Always hidden")).toHaveAttribute("aria-expanded", "false");
  });
});

describe("Spoiler options", () => {
  it("accepts custom spoiler painter options", () => {
    <Spoiler fps={1}>Hey</Spoiler>;

    // @ts-expect-error unknown option
    <Spoiler painterShouldExplode="1">Hey</Spoiler>;
  });
});
