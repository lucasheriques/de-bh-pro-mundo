import QRCode from "qrcode";
import { useMemo } from "react";
import { audienceUrl } from "../live/env";

export const audienceHost = audienceUrl.replace(/^https?:\/\//, "").replace(/\/$/, "");

const FINDER = 7;
const DOT_RADIUS = 0.44;

type Point = readonly [x: number, y: number];

function finderOrigins(size: number): Point[] {
  return [
    [0, 0],
    [size - FINDER, 0],
    [0, size - FINDER],
  ];
}

function inFinder(x: number, y: number, size: number): boolean {
  return finderOrigins(size).some(
    ([fx, fy]) => x >= fx && x < fx + FINDER && y >= fy && y < fy + FINDER,
  );
}

function dataDots(url: string) {
  const { size, data } = QRCode.create(url, { errorCorrectionLevel: "M" }).modules;
  const dots: Point[] = [];
  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      if (data[y * size + x] && !inFinder(x, y, size)) dots.push([x, y]);
    }
  }
  return { size, dots };
}

/** The audience link as a QR with round modules and rounded, coral-centred eyes. */
export function StyledQr({ className, label }: { className?: string; label?: string }) {
  const { size, dots } = useMemo(() => dataDots(audienceUrl), []);
  return (
    <svg
      className={className}
      viewBox={`0 0 ${size} ${size}`}
      role={label ? "img" : undefined}
      aria-label={label}
      aria-hidden={label ? undefined : true}
    >
      <g className="qr-dots">
        {dots.map(([x, y]) => (
          <circle key={`${x}-${y}`} cx={x + 0.5} cy={y + 0.5} r={DOT_RADIUS} />
        ))}
      </g>
      {finderOrigins(size).map(([x, y]) => (
        <g key={`${x}-${y}`}>
          <rect className="qr-eye" x={x + 0.5} y={y + 0.5} width={6} height={6} rx={1.8} />
          <rect className="qr-pupil" x={x + 2} y={y + 2} width={3} height={3} rx={0.9} />
        </g>
      ))}
    </svg>
  );
}
