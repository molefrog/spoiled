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
} from "react";

import { SpoilerPainter } from "./SpoilerPainter";
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
  revealOn?: "click" | "hover";
  onChange?: (hidden: boolean) => void;
  tagName?: keyof JSX.IntrinsicElements;
} & Omit<JSX.IntrinsicElements["span"], "style"> &
  AsChildProps;

const useIsHiddenState = (props: SpoilerProps): [boolean, (v: boolean) => void] => {
  const [isControlled] = useState(() => props.hidden !== undefined);
  const [uncontrolledVal, setUncontrolledVal] = useState(props.defaultHidden ?? true);

  if (isControlled !== (props.hidden !== undefined)) {
    throw new Error("Cannot change from controlled to uncontrolled or vice versa.");
  }

  const setterFn = useCallback(
    (value: boolean) => {
      if (!isControlled) setUncontrolledVal(value);

      props.onChange?.(value);
    },
    [isControlled, props.onChange]
  );

  if (isControlled) {
    return [
      props.hidden!, // we know that it is not `undefined` because of the useState initializer
      setterFn,
    ];
  }

  return [uncontrolledVal, setterFn];
};

export const Spoiler: React.FC<SpoilerProps> = (props) => {
  const {
    asChild = false,
    tagName = "span",
    revealOn,
    hidden,
    className,
    children,

    ...elementProps
  } = props;

  const ref = useRef<HTMLElement>(null);
  const painterRef = useRef<SpoilerPainter>();

  const [isHidden, _setIsHidden] = useIsHiddenState(props);
  const [isHiddenInitial] = useState(() => isHidden);

  // attach a painter that will animate the background noise
  useLayoutEffect(() => {
    const spoiler = new SpoilerPainter(ref.current!, { fps: 24, hidden: isHiddenInitial });
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
      : createElement(tagName, { children });

  return cloneElement(template, {
    ref,
    className: clx,
    ...elementProps,
  });
};
