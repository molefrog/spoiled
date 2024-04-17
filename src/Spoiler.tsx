"use client";

import {
  createElement,
  useCallback,
  useRef,
  useState,
  cloneElement,
  ReactElement,
  ReactNode,
  isValidElement,
  useMemo,
} from "react";

import { useMatchMedia } from "./hooks/useMatchMedia";
import { useIsomorphicLayoutEffect } from "./hooks/useIsomorphicLayoutEffect";
import { useStyleSheet } from "./hooks/useStyleSheet";
import { useWatchResize } from "./hooks/useWatchResize";
import { SpoilerPainter, SpoilerPainterOptions } from "./SpoilerPainter";

// styles
import SpoilerStyles from "./Spoiler.module.css";

// contains the CSS with the styles imported above
type StylesCSS = { css: string | null };
export let __SPOILER_STYLES_CSS: StylesCSS = { css: null };

// fallback images for light/dark themes
import fallbackLightImg from "./assets/fallback-light.webp";
import fallbackDarkImg from "./assets/fallback-dark.webp";

export type SpoilerProps = {
  // control spoiler state from the parent
  hidden?: boolean;

  // for uncontrolled components only
  defaultHidden?: boolean;
  revealOn?: "click" | "hover" | false;
  onHiddenChange?: (hidden: boolean) => void;

  // customize the tag of the wrapper element
  tagName?: keyof JSX.IntrinsicElements;

  // how spoiler content will transition on reveal/hide
  transition?: false | "none" | "fade" | "iris";

  // accent color, e.g. "#333" or ["#333", "#fff"] for light and dark themes
  accentColor?: string | [string, string];

  theme?: "system" | "light" | "dark";

  noiseFadeDuration?: number;
} & Omit<JSX.IntrinsicElements["span"], "style"> &
  AsChildProps &
  Omit<SpoilerPainterOptions, "accentColor">;

type AsChildProps =
  | {
      // only single React elements can be composed via `asChild` prop
      children: ReactElement;
      asChild: true;
    }
  | {
      // anything
      children: ReactNode;
      asChild?: false;
    };

/**
 * Returns the spoiler state (hidden/reveal and the setter) depending on whether
 * the component is controlled or not (i.e. has `hidden` prop or not)
 *
 * @param props - the props of the Spoiler component
 * @returns React state pair
 */
const useIsHiddenState = (props: SpoilerProps): [boolean, (v: boolean) => void] => {
  const [isControlled] = useState(() => props.hidden !== undefined);
  const [uncontrolledVal, setUncontrolledVal] = useState(props.defaultHidden ?? true);

  if (isControlled !== (props.hidden !== undefined)) {
    throw new Error("Cannot change from controlled to uncontrolled or vice versa.");
  }

  const setterFn = useCallback(
    (value: boolean) => {
      if (!isControlled) setUncontrolledVal(value);

      props.onHiddenChange?.(value);
    },
    [isControlled, props.onHiddenChange]
  );

  if (isControlled) {
    return [
      props.hidden!, // we know that it is not `undefined` because of the useState initializer
      setterFn,
    ];
  }

  return [uncontrolledVal, setterFn];
};

/**
 * Allows to control the Spoiler's state via the `revealOn` prop.
 * It can be either "click" or "hover", or undefined (has no effect).
 *
 * @returns an object with props for the target element
 */
const useRevealOn = (
  revealOn: SpoilerProps["revealOn"],
  state: [boolean, (v: boolean) => void]
) => {
  const [value, setValue] = state;

  const handleMouseEnter = useCallback(() => setValue(false), [setValue]);
  const handleMouseLeave = useCallback(() => setValue(true), [setValue]);
  const handleClick = useCallback(() => setValue(!value), [value, setValue]);

  const eventHandlers = useMemo(() => {
    switch (revealOn) {
      case "hover":
        return { onMouseEnter: handleMouseEnter, onMouseLeave: handleMouseLeave };
      case "click":
        return { onClick: handleClick };
      default:
        return {};
    }
  }, [revealOn, handleMouseEnter, handleMouseLeave, handleClick]);

  return eventHandlers;
};

const useIsDarkTheme = (theme: SpoilerProps["theme"]) => {
  const systemIsDarkTheme = useMatchMedia("(prefers-color-scheme: dark)");
  const isDarkTheme = theme === "system" ? systemIsDarkTheme : theme === "dark";

  return isDarkTheme;
};

/**
 * Gets the accent color for the background noise (painter) based on theme preference and
 * custom colors (provided via `accentColor` prop).
 *
 * @param color - e.g. "#333" or ["#333", "#fff"]
 * @param theme - "system" | "light" | "dark"
 * @returns color
 */
const useAccentColor = (color: string | [string, string], isDarkTheme: boolean) => {
  // convert from shorthand
  const [light, dark = light] = [color].flat() as string[];

  return isDarkTheme ? dark : light;
};

export const Spoiler: React.FC<SpoilerProps> = (props) => {
  const {
    asChild = false,
    tagName = "span",
    transition = "iris",
    hidden,
    revealOn = hidden === undefined ? "hover" : false,
    defaultHidden,
    onHiddenChange,

    // background noise settings
    accentColor = ["#333", "#fff"],
    theme = "system",
    mimicWords = true,
    fps = 24,
    gap,
    density,
    noiseFadeDuration,
    fallback,

    // inherited props
    className,
    children,

    ...elementProps
  } = props;

  const ref = useRef<HTMLElement>(null);
  const painterRef = useRef<SpoilerPainter>();

  // update whenever the element bounds change by 4px
  const [boundsW, boundsH] = useWatchResize(ref, 4);

  const state = useIsHiddenState(props);
  const [isHidden] = state;

  const isDarkTheme = useIsDarkTheme(theme);
  const painterColor = useAccentColor(accentColor, isDarkTheme);

  // save latest value of `noiseFadeDuration` to be used in the effect below
  const fadeDuration = useRef(noiseFadeDuration);
  fadeDuration.current = noiseFadeDuration;

  // inject styles
  useStyleSheet(__SPOILER_STYLES_CSS.css, ref);

  const painterOptions = useMemo(() => {
    let fallbackStyle =
      fallback ??
      // image is 32x32
      `repeat top left / 16px 16px url(${isDarkTheme ? fallbackDarkImg : fallbackLightImg})`;

    return {
      fps,
      gap,
      density,
      mimicWords,
      accentColor: painterColor,
      fallback: fallbackStyle,
    };
  }, [fps, gap, density, mimicWords, painterColor, fallback, isDarkTheme, boundsW, boundsH]);

  const [painterOptionsOnInit] = useState(() => painterOptions);

  // attach a painter that will animate the background noise
  useIsomorphicLayoutEffect(() => {
    const spoiler = new SpoilerPainter(ref.current!, painterOptionsOnInit);
    painterRef.current = spoiler;

    return () => {
      spoiler.destroy();
      painterRef.current = undefined;
    };
  }, []);

  useIsomorphicLayoutEffect(() => {
    const painter = painterRef.current;
    const options = fadeDuration.current !== undefined ? { animate: fadeDuration.current } : {};

    // value has changed
    if (painter && isHidden !== painter.isHidden) {
      isHidden ? painter.hide(options) : painter.reveal(options);
    }
  }, [isHidden]);

  useIsomorphicLayoutEffect(() => {
    painterRef.current?.update(painterOptions);
  }, [painterOptions]);

  const clx = [
    SpoilerStyles.spoiler,
    isHidden ? `${SpoilerStyles.hidden}` : "",
    // append className provided above
    className,
  ]
    .filter((x) => x)
    .join(" ");

  let withTransition = children; // no transition, no inner element

  // when transition is used, we have to wrap the children with a transition element
  if (transition === "fade" || transition === "iris") {
    withTransition = createElement(tagName, {
      className: `${SpoilerStyles.transition} ${SpoilerStyles[transition]}`,
      children,
    });
  }

  const template =
    asChild && isValidElement(children)
      ? (children as ReactElement)
      : createElement(tagName, {
          children: withTransition,
          "aria-expanded": !isHidden,
          "data-hidden": isHidden ? true : undefined,
        });

  return cloneElement(template, {
    ref,
    className: clx,
    ...useRevealOn(revealOn, state),
    ...elementProps,
  });
};
