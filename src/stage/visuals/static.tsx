import type { CSSProperties } from "react";
import { hueOf } from "../../dots/dotGrid";
import type { VisualProps } from "../SlideCanvas";

export function Eyebrow({ children }: { children?: string }) {
  return children ? <p className="eyebrow">{children}</p> : null;
}

export function TitleVisual({ visual }: VisualProps<"title">) {
  return (
    <div className="v-title">
      <Eyebrow>{visual.eyebrow}</Eyebrow>
      <h1>{visual.title}</h1>
      {visual.subtitle ? <p className="v-sub accent">{visual.subtitle}</p> : null}
    </div>
  );
}

export function StatementVisual({ visual }: VisualProps<"statement">) {
  return (
    <div className="v-statement">
      <Eyebrow>{visual.eyebrow}</Eyebrow>
      <h2>{visual.text}</h2>
      {visual.sub ? <p className="v-sub">{visual.sub}</p> : null}
    </div>
  );
}

export function BigNumberVisual({ visual }: VisualProps<"bigNumber">) {
  return (
    <div className="v-big">
      <Eyebrow>{visual.eyebrow}</Eyebrow>
      <p className="v-big-value">{visual.value}</p>
      <p className="v-big-label">{visual.label}</p>
      {visual.source ? <p className="source">Fonte: {visual.source}</p> : null}
    </div>
  );
}

export function BarsVisual({ visual }: VisualProps<"bars">) {
  const max = Math.max(...visual.bars.map((bar) => bar.value), 1);
  return (
    <div className="v-bars">
      <Eyebrow>{visual.eyebrow}</Eyebrow>
      <h2>{visual.title}</h2>
      <ol className="hbars" data-dense={visual.bars.length > 4 ? "true" : undefined}>
        {visual.bars.map((bar, i) => (
          <li
            key={bar.label}
            className={bar.highlight ? "is-highlight" : ""}
            style={{ "--i": i, "--share": bar.value / max } as CSSProperties}
          >
            <span className="hbar-label">{bar.label}</span>
            <span className="hbar-track">
              <span className="hbar-fill" />
            </span>
            <span className="hbar-value">{bar.display}</span>
          </li>
        ))}
      </ol>
      {visual.source ? <p className="source">Fonte: {visual.source}</p> : null}
    </div>
  );
}

export function ListVisual({ visual }: VisualProps<"list">) {
  return (
    <div className="v-list">
      <Eyebrow>{visual.eyebrow}</Eyebrow>
      <h2>{visual.title}</h2>
      <ol>
        {visual.items.map((item, i) => (
          <li key={item.title} style={{ "--i": i } as CSSProperties}>
            <span className="v-list-index" data-hue={hueOf(i)}>
              {i + 1}
            </span>
            <div>
              <p className="v-list-title">{item.title}</p>
              {item.body ? <p className="v-list-body">{item.body}</p> : null}
            </div>
          </li>
        ))}
      </ol>
    </div>
  );
}

export function CompareVisual({ visual }: VisualProps<"compare">) {
  return (
    <div className="v-compare">
      <Eyebrow>{visual.eyebrow}</Eyebrow>
      <h2>{visual.title}</h2>
      <div className="v-compare-cols">
        {[visual.left, visual.right].map((side, col) => (
          <section key={side.label} className={col === 1 ? "is-right" : ""}>
            <p className="v-compare-label">{side.label}</p>
            <ul>
              {side.items.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </section>
        ))}
      </div>
    </div>
  );
}
