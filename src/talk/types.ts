export type PollOption = { id: string; label: string };

export type Interaction =
  | { kind: "choice"; pollId: string; question: string; options: PollOption[] }
  | {
      kind: "guess";
      pollId: string;
      question: string;
      min: number;
      max: number;
      step: number;
      answer: number;
      format: "brl-month" | "percent" | "number";
    }
  | { kind: "questions" };

export type Bar = { label: string; value: number; display: string; highlight?: boolean };

export type Tier = "S" | "A" | "B";

export type TierCompany = { name: string; logo: string };

export type TierRow = { tier: Tier; label: string; companies: TierCompany[] };

export type Visual =
  | { kind: "title"; eyebrow?: string; title: string; subtitle?: string }
  | { kind: "statement"; eyebrow?: string; text: string; sub?: string }
  | { kind: "bigNumber"; eyebrow?: string; value: string; label: string; source?: string }
  | { kind: "bars"; eyebrow?: string; title: string; bars: Bar[]; source?: string }
  | { kind: "list"; eyebrow?: string; title: string; items: { title: string; body?: string }[] }
  | {
      kind: "compare";
      eyebrow?: string;
      title: string;
      left: { label: string; items: string[] };
      right: { label: string; items: string[] };
    }
  | {
      kind: "tierList";
      eyebrow?: string;
      title: string;
      rows: TierRow[];
      highlight?: string;
      source?: string;
    }
  | { kind: "join" }
  | { kind: "results"; eyebrow?: string }
  | { kind: "questionsWall" };

export type Slide = {
  id: string;
  section?: string;
  visual: Visual;
  interaction?: Interaction;
  notes: string;
  presenterOnlyNotes?: true;
  cues?: string[];
};
