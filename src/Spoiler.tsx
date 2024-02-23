import {
  createElement,
  useCallback,
  useLayoutEffect,
  useRef,
  useState,
  cloneElement,
  ReactElement,
  ReactNode,
  isValidElement,
  useMemo,
} from "react";

import { SpoilerPainter, SpoilerPainterOptions } from "./SpoilerPainter";
import SpoilerStyles from "./Spoiler.module.css";

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

export type SpoilerProps = {
  defaultHidden?: boolean;
  hidden?: boolean;
  revealOn?: "click" | "hover" | false;
  onHiddenChange?: (hidden: boolean) => void;
  tagName?: keyof JSX.IntrinsicElements;
} & Omit<JSX.IntrinsicElements["span"], "style"> &
  AsChildProps &
  SpoilerPainterOptions;

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
 * Allows to controll the Spoiler's state via the `revealOn` prop.
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

export const Spoiler: React.FC<SpoilerProps> = (props) => {
  const {
    asChild = false,
    tagName = "span",
    hidden,
    revealOn = hidden === undefined ? "hover" : false,
    defaultHidden,
    className,
    children,
    onHiddenChange,

    ...elementProps
  } = props;

  const ref = useRef<HTMLElement>(null);
  const painterRef = useRef<SpoilerPainter>();

  const state = useIsHiddenState(props);
  const [isHidden] = state;
  const [isHiddenInitial] = useState(() => isHidden);

  const [painterOptionsOnInit] = useState(() => {
    const { fps = 24, gap, density, mimicWords } = props;
    return { fps, gap, density, mimicWords };
  });

  // attach a painter that will animate the background noise
  useLayoutEffect(() => {
    const spoiler = new SpoilerPainter(ref.current!, {
      ...painterOptionsOnInit,
      hidden: isHiddenInitial,
    });
    painterRef.current = spoiler;

    return () => {
      spoiler.destroy();
      painterRef.current = undefined;
    };
  }, []);

  useLayoutEffect(() => {
    const painter = painterRef.current;

    // value has changed
    if (painter && isHidden !== painter.isHidden) {
      isHidden ? painter.hide() : painter.reveal();
    }
  }, [isHidden]);

  const clx = [
    SpoilerStyles.spoiler,
    isHidden ? `${SpoilerStyles.hidden}` : "",
    // append className provided above
    className,
  ].join(" ");

  const template =
    asChild && isValidElement(children)
      ? (children as ReactElement)
      : createElement(tagName, {
          children,
          "aria-expanded": !isHidden,
          "aria-label": "spoiler alert",
        });

  return cloneElement(template, {
    ref,
    className: clx,
    ...useRevealOn(revealOn, state),
    ...elementProps,
  });
};
