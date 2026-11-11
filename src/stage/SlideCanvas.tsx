import type { ReactNode } from "react";
import type { Slide, Visual } from "../talk/types";
import { JoinVisual } from "./visuals/JoinVisual";
import { QuestionsWall } from "./visuals/QuestionsWall";
import { ResultsVisual } from "./visuals/ResultsVisual";
import {
  BarsVisual,
  BigNumberVisual,
  CompareVisual,
  ListVisual,
  SectionVisual,
  StatementVisual,
  TitleVisual,
} from "./visuals/static";
import { TierListVisual } from "./visuals/TierListVisual";

export type VisualProps<K extends Visual["kind"]> = {
  visual: Extract<Visual, { kind: K }>;
  slide: Slide;
};

const visuals: { [K in Visual["kind"]]: (props: VisualProps<K>) => ReactNode } = {
  title: TitleVisual,
  statement: StatementVisual,
  section: SectionVisual,
  bigNumber: BigNumberVisual,
  bars: BarsVisual,
  list: ListVisual,
  compare: CompareVisual,
  tierList: TierListVisual,
  join: JoinVisual,
  results: ResultsVisual,
  questionsWall: QuestionsWall,
};

export function SlideCanvas({ slide }: { slide: Slide }) {
  const Render = visuals[slide.visual.kind] as (props: {
    visual: Visual;
    slide: Slide;
  }) => ReactNode;
  return (
    <div className={`slide slide-${slide.visual.kind}`} key={slide.id}>
      <Render visual={slide.visual} slide={slide} />
    </div>
  );
}
