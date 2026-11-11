import type { CSSProperties } from "react";
import type { TierCompany, TierRow } from "../../talk/types";
import type { VisualProps } from "../SlideCanvas";
import { Eyebrow } from "./static";

export const TIER_HUE: Record<TierRow["tier"], number> = { "3": 1, "2": 3, "1": 4 };

function CompanyTile({
  company,
  order,
  highlighted,
}: {
  company: TierCompany;
  order: number;
  highlighted: boolean;
}) {
  return (
    <li
      className="tier-company"
      data-highlight={highlighted ? "true" : undefined}
      style={{ "--i": order } as CSSProperties}
    >
      <span className="tier-logo">
        <img src={company.logo} alt="" />
      </span>
      <span className="tier-name">{company.name}</span>
    </li>
  );
}

function TierRowView({
  row,
  rowIndex,
  highlight,
}: {
  row: TierRow;
  rowIndex: number;
  highlight: string | undefined;
}) {
  return (
    <li
      className="tier-row"
      style={{ "--hue": `var(--hue-${TIER_HUE[row.tier]})` } as CSSProperties}
    >
      <div className="tier-badge">
        <span className="tier-letter">{row.tier}</span>
        <span className="tier-label">{row.label}</span>
      </div>
      <ol className="tier-companies">
        {row.companies.map((company, i) => (
          <CompanyTile
            key={company.name}
            company={company}
            order={rowIndex * row.companies.length + i}
            highlighted={company.name === highlight}
          />
        ))}
      </ol>
    </li>
  );
}

export function TierListVisual({ visual }: VisualProps<"tierList">) {
  return (
    <div className="v-tiers">
      <Eyebrow>{visual.eyebrow}</Eyebrow>
      <h2>{visual.title}</h2>
      <ol className="tier-rows">
        {visual.rows.map((row, rowIndex) => (
          <TierRowView key={row.tier} row={row} rowIndex={rowIndex} highlight={visual.highlight} />
        ))}
      </ol>
      {visual.source ? <p className="source">Fonte: {visual.source}</p> : null}
    </div>
  );
}
