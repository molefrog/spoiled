import { useLayoutEffect, useRef, useState } from "react";

import { SpoilerPainter } from "./SpoilerPainter";
import SpoilerStyles from "./Spoiler.module.css";

export type SpoilerProps = {
  children: React.ReactNode;
  defaultHidden?: boolean;
  hidden?: boolean;
  onChange?: (hidden: boolean) => void;
} & Omit<JSX.IntrinsicElements["span"], "style">;

const useIsHiddenState = (props: SpoilerProps): [boolean, (v: boolean) => void] => {
  const [isControlled] = useState(() => props.hidden !== undefined);
  const uncontrolledState = useState(props.defaultHidden ?? true);

  if (isControlled !== (props.hidden !== undefined)) {
    throw new Error("Cannot change from controlled to uncontrolled or vice versa.");
  }

  if (isControlled) {
    return [
      props.hidden!, // we know that it is not `undefined` because of the useState initializer
      (value) => {
        // even though this doesn't apply to the controlled case, we call the callback
        props?.onChange?.(value);
      },
    ];
  }

  return uncontrolledState;
};

export const Spoiler: React.FC<SpoilerProps> = (props) => {
  const { hidden, className, children, ...restProps } = props;

  const firstRun = useRef(true);
  const ref = useRef<HTMLElement>(null);
  const painterRef = useRef<SpoilerPainter>();

  const [isHidden, _setIsHidden] = useIsHiddenState(props);
  const [isHiddenInitial] = useState(() => isHidden);

  useLayoutEffect(() => {
    if (firstRun.current) {
      firstRun.current = false;

      const spoiler = new SpoilerPainter(ref.current!, { fps: 24, hidden: isHiddenInitial });
      painterRef.current = spoiler;
    }

    return () => {
      /* TODO detach and remove firstRun */
    };
  }, []);

  useLayoutEffect(() => {
    const painter = painterRef.current;

    if (painter && isHidden !== painter.isHidden) {
      isHidden ? painter.hide() : painter.reveal();
    }
  }, [isHidden]);

  const clx = [
    SpoilerStyles.spoiler,
    isHidden ? `${SpoilerStyles.hidden}` : "",
    // append className provided
    className,
  ].join(" ");

  return (
    <span ref={ref} className={clx} {...restProps}>
      {children}
    </span>
  );
};
