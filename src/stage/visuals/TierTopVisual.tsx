import { Fragment } from "react";
import { formatBrl, formatJump } from "../../talk/format";
import type { VisualProps } from "../SlideCanvas";
import { Eyebrow } from "./static";
import { TIER_HUE } from "./TierListVisual";

/** Each tier's median and its best payers, with the jump from one tier to the next. */
export function TierTopVisual({ visual }: VisualProps<"tierTop">) {
  return (
    <div className="v-tier-top">
      <Eyebrow>{visual.eyebrow}</Eyebrow>
      <h2>{visual.title}</h2>
      <div className="tier-top-columns">
        {visual.tiers.map((tier, i) => {
          const previous = visual.tiers[i - 1];
          return (
            <Fragment key={tier.tier}>
              {previous ? (
                <p className="tier-top-jump">{formatJump(previous.median, tier.median)}</p>
              ) : null}
              <section className="tier-top-column" data-hue={TIER_HUE[tier.tier]}>
                <header className="tier-top-head">
                  <span className="tier-letter">{tier.tier}</span>
                  <span className="tier-top-label">{tier.label}</span>
                </header>
                <p className="tier-top-median">
                  {formatBrl(tier.median)}
                  <span>mediana</span>
                </p>
                <ol className="tier-top-companies">
                  {tier.companies.map((company) => (
                    <li key={company.name}>
                      <span className="tier-logo">
                        <img src={company.logo} alt="" />
                      </span>
                      <span className="tier-top-name">{company.name}</span>
                      <span className="tier-top-value">{formatBrl(company.median)}</span>
                    </li>
                  ))}
                </ol>
              </section>
            </Fragment>
          );
        })}
      </div>
      {visual.source ? <p className="source">Fonte: {visual.source}</p> : null}
    </div>
  );
}
