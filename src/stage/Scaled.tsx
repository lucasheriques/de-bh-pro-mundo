import { type ReactNode, useLayoutEffect, useRef, useState } from "react";
import type { StageTheme } from "../live/useStoredToggle";

export const CANVAS_WIDTH = 1920;
export const CANVAS_HEIGHT = 1080;

type ScaledProps = { children: ReactNode; theme: StageTheme; className?: string };

export function Scaled({ children, theme, className = "" }: ScaledProps) {
  const frameRef = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(0);

  useLayoutEffect(() => {
    const frame = frameRef.current;
    if (!frame) return;
    const fitToFrame = () =>
      setScale(Math.min(frame.clientWidth / CANVAS_WIDTH, frame.clientHeight / CANVAS_HEIGHT));
    fitToFrame();
    const observer = new ResizeObserver(fitToFrame);
    observer.observe(frame);
    return () => observer.disconnect();
  }, []);

  return (
    <div ref={frameRef} className={`scaled-frame ${className}`}>
      <div
        className="canvas"
        data-theme={theme}
        style={{
          width: CANVAS_WIDTH,
          height: CANVAS_HEIGHT,
          transform: `translate(-50%, -50%) scale(${scale})`,
        }}
      >
        {children}
      </div>
    </div>
  );
}
