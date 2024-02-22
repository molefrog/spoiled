import { useLayoutEffect, useRef, useState } from "react";

import { SpoilerPainter } from "./SpoilerPainter";
import SpoilerStyles from "./Spoiler.module.css";

interface SpoilerProps {
  children: React.ReactNode;
}

export const Spoiler: React.FC<SpoilerProps> = ({ children }) => {
  const firstRun = useRef(true);
  const ref = useRef<HTMLElement>(null);
  const painterRef = useRef<SpoilerPainter>();

  const [isHidden, setHidden] = useState(true);

  useLayoutEffect(() => {
    if (firstRun.current) {
      firstRun.current = false;

      const spoiler = new SpoilerPainter(ref.current!, { fps: 24 });
      painterRef.current = spoiler;
    }

    return () => {
      /* TODO detach */
    };
  }, []);

  const clx = SpoilerStyles.spoiler + (isHidden ? ` ${SpoilerStyles.hidden}` : "");

  return (
    <span ref={ref} className={clx}>
      {children}
    </span>
  );
};
