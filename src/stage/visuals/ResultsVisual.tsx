import type { ReactNode } from "react";
import type { Interaction } from "../../talk/types";
import type { VisualProps } from "../SlideCanvas";
import { ChoiceResults } from "./ChoiceResults";
import { GuessResults } from "./GuessResults";
import { MatchResults } from "./MatchResults";
import { QuestionsWall } from "./QuestionsWall";
import { Eyebrow } from "./static";

type ResultProps<K extends Interaction["kind"]> = {
  interaction: Extract<Interaction, { kind: K }>;
  eyebrow?: string;
};

const results: { [K in Interaction["kind"]]: (props: ResultProps<K>) => ReactNode } = {
  choice: ChoiceResults,
  guess: GuessResults,
  match: MatchResults,
  questions: () => <QuestionsWall />,
};

export function ResultsVisual({ visual, slide }: VisualProps<"results">) {
  const interaction = slide.interaction;
  if (!interaction) return <Eyebrow>{visual.eyebrow ?? "Resultados"}</Eyebrow>;
  const Render = results[interaction.kind] as (
    props: ResultProps<Interaction["kind"]>,
  ) => ReactNode;
  return <Render interaction={interaction} eyebrow={visual.eyebrow} />;
}
