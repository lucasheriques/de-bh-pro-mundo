import { type CSSProperties, useEffect, useState } from "react";
import { secondsLeft, timedPoll } from "../talk/pollTimer";
import { useSession } from "./useDeck";

const TICK_MS = 250;

export type Countdown = { left: number; seconds: number };

/** Seconds until a poll reveals itself, or null when it has no running countdown. */
export function usePollCountdown(pollId: string): Countdown | null {
  const session = useSession();
  const openedAt = session.pollOpenedAt?.[pollId];
  const revealed = session.revealed[pollId] ?? false;
  const seconds = timedPoll(pollId)?.seconds;
  const [now, setNow] = useState(Date.now);
  const running = openedAt !== undefined && seconds !== undefined && !revealed;

  useEffect(() => {
    if (!running) return;
    const timer = window.setInterval(() => setNow(Date.now()), TICK_MS);
    return () => window.clearInterval(timer);
  }, [running]);

  if (!running) return null;
  return { left: secondsLeft(openedAt, seconds, now), seconds };
}

const clock = (left: number) => `00:${String(left).padStart(2, "0")}`;

function shareStyle({ left, seconds }: Countdown): CSSProperties {
  return { "--share": left / seconds } as CSSProperties;
}

/** The stage's countdown, inside the corner QR card. */
export function StageCountdown({ countdown }: { countdown: Countdown }) {
  return (
    <div className="stage-countdown" style={shareStyle(countdown)}>
      <span className="stage-countdown-label">
        {countdown.left > 0 ? "Resultado em" : "Revelando"}
      </span>
      <span className="stage-countdown-clock">{clock(countdown.left)}</span>
      <span className="stage-countdown-bar" aria-hidden="true">
        <span className="stage-countdown-fill" />
      </span>
    </div>
  );
}

/** The phone's countdown above the options; voting stays open after it ends. */
export function PhoneCountdown({ pollId }: { pollId: string }) {
  const countdown = usePollCountdown(pollId);
  if (!countdown) return null;
  return (
    <div className="phone-countdown" style={shareStyle(countdown)} role="timer">
      <span>
        {countdown.left > 0
          ? `Resultado no telão em ${countdown.left}s`
          : "Resultado no telão agora"}
      </span>
      <span className="phone-countdown-bar" aria-hidden="true">
        <span className="phone-countdown-fill" />
      </span>
    </div>
  );
}
