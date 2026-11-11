import { hueOf } from "../dots/dotGrid";
import { type ChoiceCount, countChoices } from "../talk/stats";
import type { PanelProps } from "./PhonePage";
import { usePollVote } from "./usePollVote";
import { dotSizeStyle, VoteDots } from "./VoteDots";

const DOT_ROW = { width: 290, height: 52, minStep: 6, maxStep: 24 };

type Stage = "voting" | "live" | "final";

const EYEBROWS: Record<Stage, string> = {
  voting: "Vote",
  live: "Ao vivo",
  final: "Resultado no telão",
};

const percent = (share: number) => `${Math.round(share * 100)}%`;

function MyVote({ option, index }: { option: ChoiceCount; index: number }) {
  return (
    <div className="my-vote" data-hue={hueOf(index)}>
      <span className="my-vote-dot" aria-hidden="true" />
      <span className="my-vote-text">
        <span className="my-vote-kicker">Seu voto</span>
        <span className="my-vote-label">{option.label}</span>
      </span>
    </div>
  );
}

type ChoiceButtonProps = {
  option: ChoiceCount;
  index: number;
  stage: Stage;
  mine: boolean;
  dimmed: boolean;
  onVote: () => void;
};

function ChoiceButton({ option, index, stage, mine, dimmed, onVote }: ChoiceButtonProps) {
  const showResults = stage !== "voting";
  return (
    <button
      type="button"
      aria-pressed={mine}
      className={`choice ${mine ? "is-selected" : ""}`}
      data-hue={hueOf(index)}
      data-dimmed={dimmed}
      onClick={onVote}
    >
      <span className="choice-head">
        <span className="choice-check" aria-hidden="true" />
        <span className="choice-label">{option.label}</span>
        {showResults ? <span className="choice-share">{percent(option.share)}</span> : null}
      </span>
      {showResults ? <VoteDots count={option.count} mine={mine} /> : null}
    </button>
  );
}

function choiceNote(stage: Stage, myOption: ChoiceCount | undefined): string {
  if (stage === "voting") return "Toque numa opção pra ver o que a sala acha.";
  if (stage === "live") return "Mudou de ideia? Toque em outra opção pra trocar.";
  if (!myOption) return "Ainda dá pra votar: toque numa opção.";
  return `Você votou "${myOption.label}", junto com ${percent(myOption.share)} da sala.`;
}

export function ChoicePanel({ interaction }: PanelProps<"choice">) {
  const { mine, tally, revealed, vote } = usePollVote(interaction.pollId);
  const counts = countChoices(tally, interaction.options);
  const myIndex = counts.findIndex((option) => option.id === mine);
  const myOption = counts[myIndex];
  const stage: Stage = revealed ? "final" : myOption ? "live" : "voting";
  const top = Math.max(0, ...counts.map((option) => option.count));
  const total = counts.reduce((sum, option) => sum + option.count, 0);

  return (
    <section className="panel" data-stage={stage}>
      <p className="eyebrow">{EYEBROWS[stage]}</p>
      <h1 className="panel-question">{interaction.question}</h1>
      {myOption ? <MyVote option={myOption} index={myIndex} /> : null}
      {stage !== "voting" ? (
        <p className="panel-status">
          {total} {total === 1 ? "pessoa já votou" : "pessoas já votaram"}
        </p>
      ) : null}
      <fieldset
        className="choice-list"
        aria-label={interaction.question}
        style={dotSizeStyle(top, DOT_ROW)}
      >
        {counts.map((option, index) => (
          <ChoiceButton
            key={option.id}
            option={option}
            index={index}
            stage={stage}
            mine={option.id === mine}
            dimmed={revealed && option.count < top}
            onVote={() => vote(option.id)}
          />
        ))}
      </fieldset>
      <p className="panel-note" data-testid={revealed ? "phone-result" : undefined}>
        {choiceNote(stage, myOption)}
      </p>
    </section>
  );
}
