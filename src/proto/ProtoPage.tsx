// Throwaway style exploration: delete src/proto and its route once a direction is picked.
import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { Scaled } from "../stage/Scaled";
import { SlideCanvas } from "../stage/SlideCanvas";
import { CornerQr, ProgressBar, SectionLabel } from "../stage/StageChrome";
import { slides } from "../talk/slides";
import "./proto.css";

const VARIANTS = ["terminal", "editorial", "schematic", "phosphor"] as const;
const LABELS = ["Terminal", "Editorial", "Schematic", "Phosphor"];
const SLIDE_IDS = ["title", "s2", "by-tier", "poll-abroad", "scarce", "outline"];

function initialVariant(): number {
  const v = Number.parseInt(new URLSearchParams(location.search).get("v") ?? "", 10);
  return v >= 1 && v <= VARIANTS.length ? v - 1 : 0;
}

function Picker({
  current,
  onPick,
  onReplay,
}: {
  current: number;
  onPick: (i: number) => void;
  onReplay: () => void;
}) {
  const nav = useRef<HTMLElement>(null);
  const highlight = useRef<HTMLSpanElement>(null);
  const items = useRef<(HTMLButtonElement | null)[]>([]);

  useLayoutEffect(() => {
    const el = items.current[current];
    if (!el || !highlight.current) return;
    highlight.current.style.width = `${el.offsetWidth}px`;
    highlight.current.style.transform = `translateX(${el.offsetLeft}px)`;
  }, [current]);

  useEffect(() => {
    requestAnimationFrame(() =>
      requestAnimationFrame(() => nav.current?.setAttribute("data-ready", "")),
    );
  }, []);

  return (
    <nav ref={nav} className="proto-picker" aria-label="Prototype variants">
      <span ref={highlight} className="proto-picker-highlight" aria-hidden="true" />
      {LABELS.map((label, i) => (
        <button
          key={label}
          type="button"
          ref={(el) => {
            items.current[i] = el;
          }}
          className="proto-picker-item"
          data-active={i === current || undefined}
          aria-current={i === current ? "true" : undefined}
          onClick={() => onPick(i)}
        >
          {label}
        </button>
      ))}
      <span className="proto-picker-divider" aria-hidden="true" />
      <button
        type="button"
        className="proto-picker-item proto-picker-replay"
        aria-label="Replay animation (R)"
        onClick={onReplay}
      >
        ↻
      </button>
    </nav>
  );
}

export default function ProtoPage() {
  const [current, setCurrent] = useState(initialVariant);
  const [mountKey, setMountKey] = useState(0);

  const pick = (i: number) => {
    if (i < 0 || i >= VARIANTS.length) return;
    setCurrent(i);
    setMountKey((k) => k + 1);
    const url = new URL(location.href);
    url.searchParams.set("v", String(i + 1));
    history.replaceState(null, "", url);
  };

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.metaKey || e.ctrlKey || e.altKey) return;
      const num = Number.parseInt(e.key, 10);
      if (num >= 1 && num <= VARIANTS.length) pick(num - 1);
      else if (e.key === "ArrowRight") pick((current + 1) % VARIANTS.length);
      else if (e.key === "ArrowLeft") pick((current - 1 + VARIANTS.length) % VARIANTS.length);
      else if (e.key === "r" || e.key === "R") setMountKey((k) => k + 1);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  });

  return (
    <main className="proto" data-variant={VARIANTS[current]}>
      {SLIDE_IDS.map((id) => {
        const index = slides.findIndex((slide) => slide.id === id);
        const slide = slides[index];
        if (!slide) return null;
        return (
          <section key={`${id}-${mountKey}`} className="proto-slide">
            <Scaled theme="dark">
              <SectionLabel slide={slide} />
              <SlideCanvas slide={slide} />
              <CornerQr slide={slide} />
              <ProgressBar index={index} />
            </Scaled>
          </section>
        );
      })}
      <Picker current={current} onPick={pick} onReplay={() => setMountKey((k) => k + 1)} />
    </main>
  );
}
