import type { ReactNode } from "react";
import { ThemeToggle } from "../live/ThemeToggle";
import { formatBrl } from "../talk/format";
import { slides } from "../talk/slides";
import type { Interaction, Slide, Visual } from "../talk/types";

type Render<K extends Visual["kind"]> = (visual: Extract<Visual, { kind: K }>) => ReactNode;

const visuals: { [K in Visual["kind"]]: Render<K> } = {
  title: (visual) => (
    <>
      <h2>{visual.title}</h2>
      {visual.subtitle ? <p className="content-lead">{visual.subtitle}</p> : null}
    </>
  ),
  statement: (visual) => (
    <>
      <h2>{visual.text}</h2>
      {visual.sub ? <p className="content-lead">{visual.sub}</p> : null}
    </>
  ),
  section: (visual) => (
    <>
      <p className="content-kicker">Parte {visual.number}</p>
      <h2>{visual.title}</h2>
      {visual.lead ? <p className="content-lead">{visual.lead}</p> : null}
    </>
  ),
  bigNumber: (visual) => (
    <>
      <h2>
        {visual.value} <span className="content-quiet">{visual.label}</span>
      </h2>
      {visual.source ? <p className="content-source">Fonte: {visual.source}</p> : null}
    </>
  ),
  bars: (visual) => (
    <>
      <h2>{visual.title}</h2>
      <table className="content-table">
        <tbody>
          {visual.bars.map((bar) => (
            <tr key={bar.label}>
              <th scope="row">{bar.label}</th>
              <td>{bar.display}</td>
            </tr>
          ))}
        </tbody>
      </table>
      {visual.source ? <p className="content-source">Fonte: {visual.source}</p> : null}
    </>
  ),
  list: (visual) => (
    <>
      <h2>{visual.title}</h2>
      <ol>
        {visual.items.map((item) => (
          <li key={item.title}>
            <strong>{item.title}</strong>
            {item.body ? `: ${item.body}` : null}
          </li>
        ))}
      </ol>
    </>
  ),
  compare: (visual) => (
    <>
      <h2>{visual.title}</h2>
      <div className="content-compare">
        {[visual.left, visual.right].map((side) => (
          <div key={side.label}>
            <h3>{side.label}</h3>
            <ul>
              {side.items.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </>
  ),
  tierList: (visual) => (
    <>
      <h2>{visual.title}</h2>
      <ul>
        {visual.rows.map((row) => (
          <li key={row.tier}>
            <strong>
              Tier {row.tier} ({row.label})
            </strong>
            : {row.companies.map((company) => company.name).join(", ")}
          </li>
        ))}
      </ul>
      {visual.source ? <p className="content-source">Fonte: {visual.source}</p> : null}
    </>
  ),
  tierTop: (visual) => (
    <>
      <h2>{visual.title}</h2>
      <table className="content-table">
        <tbody>
          {visual.tiers.map((tier) => (
            <tr key={tier.tier}>
              <th scope="row">
                Tier {tier.tier} ({tier.label}):{" "}
                {tier.companies.map((company) => company.name).join(", ")}
              </th>
              <td>{formatBrl(tier.median)}</td>
            </tr>
          ))}
        </tbody>
      </table>
      {visual.source ? <p className="content-source">Fonte: {visual.source}</p> : null}
    </>
  ),
  join: () => null,
  results: () => null,
  questionsWall: () => null,
};

function InteractionText({ interaction }: { interaction: Interaction }) {
  if (interaction.kind === "questions") return null;
  return (
    <>
      <h2>{interaction.question}</h2>
      {interaction.kind === "choice" ? (
        <p className="content-quiet">
          Votação ao vivo: {interaction.options.map((option) => option.label).join(" · ")}
        </p>
      ) : interaction.kind === "match" ? (
        <p className="content-quiet">
          Ligue os pontos ao vivo: {interaction.items.map((item) => item.name).join(", ")}.
          Resposta: {interaction.items.map((item) => `${item.name} ${item.answer}`).join(", ")}.
        </p>
      ) : (
        <p className="content-quiet">Chute ao vivo no celular.</p>
      )}
    </>
  );
}

function showsNotes(slide: Slide): boolean {
  return !slide.interaction && !slide.presenterOnlyNotes;
}

/** The slide's words as plain, phone-sized text: same renderer as /conteudo, no notes. */
export function SlideText({ slide }: { slide: Slide }) {
  const render = visuals[slide.visual.kind] as (visual: Visual) => ReactNode;
  return <div className="slide-text">{render(slide.visual)}</div>;
}

function SlideSection({ slide }: { slide: Slide }) {
  const render = visuals[slide.visual.kind] as (visual: Visual) => ReactNode;
  const body = render(slide.visual);
  if (!body && !slide.interaction) return null;
  return (
    <section className="content-slide" id={slide.id}>
      {body}
      {slide.interaction && !body ? <InteractionText interaction={slide.interaction} /> : null}
      {showsNotes(slide) ? <p className="content-notes">{slide.notes}</p> : null}
    </section>
  );
}

export function ContentPage() {
  return (
    <main className="content">
      <header className="content-head">
        <ThemeToggle />
        <p className="content-kicker">
          Turbinando sua carreira internacional · PUC Minas · 11 nov 2026
        </p>
        <h1>De BH pro mundo</h1>
        <p className="content-lead">
          O conteúdo da talk do Lucas Faria, slide por slide, com os dados e o que foi dito em cada
          um.
        </p>
      </header>
      {slides.map((slide) => (
        <SlideSection key={slide.id} slide={slide} />
      ))}
      <footer className="content-foot">
        <p>
          Dados de salário e vagas:{" "}
          <a href="https://nagringa.dev/salarios">nagringa.dev/salarios</a> e{" "}
          <a href="https://nagringa.dev/vagas/tier-list">nagringa.dev/vagas/tier-list</a>.
        </p>
      </footer>
    </main>
  );
}
