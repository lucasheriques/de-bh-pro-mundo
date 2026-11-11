export type PollOption = { id: string; label: string };

export type MatchItem = { id: string; name: string; logo: string; answer: string };

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
  | {
      kind: "match";
      pollId: string;
      question: string;
      targets: PollOption[];
      items: MatchItem[];
    }
  | { kind: "questions" };

export type Bar = { label: string; value: number; display: string; highlight?: boolean };

export type Tier = "1" | "2" | "3";

export type TierCompany = { name: string; logo: string };

export type TierRow = { tier: Tier; label: string; companies: TierCompany[] };

export type TierTop = {
  tier: Tier;
  label: string;
  /** Monthly BRL. */
  median: number;
  companies: { name: string; logo: string; median: number }[];
};

export type Visual =
  | { kind: "title"; eyebrow?: string; title: string; subtitle?: string }
  | { kind: "statement"; eyebrow?: string; text: string; sub?: string }
  | { kind: "section"; number: string; title: string; lead?: string }
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
  | {
      kind: "tierTop";
      eyebrow?: string;
      title: string;
      /** Lowest tier first; each column is the tier median and its best-paying companies. */
      tiers: TierTop[];
      source?: string;
    }
  | { kind: "join" }
  | { kind: "results"; eyebrow?: string }
  | { kind: "questionsWall"; footer?: string };

export type Slide = {
  id: string;
  section?: string;
  visual: Visual;
  interaction?: Interaction;
  /** Speaker notes: the points to make on this slide, one per bullet. */
  notes: string[];
  presenterOnlyNotes?: true;
  /** A tappable link the phones show while this slide is on screen. */
  phoneLink?: { label: string; href: string };
  cues?: string[];
};
