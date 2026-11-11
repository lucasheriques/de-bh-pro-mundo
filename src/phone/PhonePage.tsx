import { useMutation } from "convex/react";
import { type ReactNode, useEffect, useState } from "react";
import { api } from "../../convex/_generated/api";
import { LiveCaption } from "../captions/LiveCaption";
import { ConnectionDot } from "../live/ConnectionDot";
import { clientId } from "../live/env";
import { slideAt, useSession } from "../live/useDeck";
import { useStoredToggle } from "../live/useStoredToggle";
import { slides } from "../talk/slides";
import type { Interaction } from "../talk/types";
import { AmbientPanel } from "./AmbientPanel";
import { ChoicePanel } from "./ChoicePanel";
import { GuessPanel } from "./GuessPanel";
import { NameChip, NameForm, useMyName } from "./NameCard";
import { QuestionList } from "./QuestionList";
import { AskForm, QuestionsPanel } from "./QuestionsPanel";

const CAPTION_STATES = ["on", "off"] as const;

export type PanelProps<K extends Interaction["kind"]> = {
  interaction: Extract<Interaction, { kind: K }>;
};

const panels: { [K in Interaction["kind"]]: (props: PanelProps<K>) => ReactNode } = {
  choice: ChoicePanel,
  guess: GuessPanel,
  questions: QuestionsPanel,
};

function PhoneHeader({
  name,
  onEditName,
  captions,
  onToggleCaptions,
}: {
  name: string | null | undefined;
  onEditName: () => void;
  captions: "on" | "off";
  onToggleCaptions: () => void;
}) {
  return (
    <header className="phone-header">
      <NameChip name={name} onEdit={onEditName} />
      <button
        type="button"
        className="caption-toggle"
        aria-pressed={captions === "on"}
        onClick={onToggleCaptions}
      >
        Legendas
      </button>
      <ConnectionDot />
    </header>
  );
}

function AskAnytime({ onClose }: { onClose: () => void }) {
  return (
    <section className="ask-anytime" aria-label="Fazer uma pergunta">
      <header className="ask-anytime-head">
        <p className="eyebrow">Pergunta pro Lucas</p>
        <button type="button" className="ghost" onClick={onClose}>
          Fechar
        </button>
      </header>
      <AskForm onSent={() => window.setTimeout(onClose, 1200)} />
    </section>
  );
}

function PhoneFooter({
  index,
  onAsk,
  canAsk,
}: {
  index: number;
  onAsk: () => void;
  canAsk: boolean;
}) {
  return (
    <footer className="phone-footer">
      {canAsk ? (
        <button type="button" className="ask-button" onClick={onAsk}>
          Fazer pergunta
        </button>
      ) : null}
      <span className="mono">
        {String(index + 1).padStart(2, "0")} / {String(slides.length).padStart(2, "0")}
      </span>
    </footer>
  );
}

const FEED_LIMIT = 5;

function QuestionsFeed() {
  return (
    <section className="phone-questions" aria-label="Perguntas da sala">
      <p className="eyebrow">Perguntas da sala</p>
      <QuestionList limit={FEED_LIMIT} />
    </section>
  );
}

function CaptionDock() {
  return (
    <div className="caption-dock">
      <LiveCaption className="caption-dock-text" />
      <a href="/legendas" className="caption-dock-link">
        Tela cheia
      </a>
    </div>
  );
}

export function PhonePage() {
  const session = useSession();
  const slide = slideAt(session.slideIndex);
  const join = useMutation(api.audience.join);
  const [captions, toggleCaptions] = useStoredToggle("puc-ia-2026:phone-captions", CAPTION_STATES);
  const myName = useMyName();
  const [nameOpen, setNameOpen] = useState<boolean | null>(null);
  const showNameForm = nameOpen ?? (myName === null && session.slideIndex === 0);
  const [asking, setAsking] = useState(false);
  const onQuestionsSlide = slide.interaction?.kind === "questions";

  useEffect(() => {
    void join({ clientId }).catch(() => undefined);
  }, [join]);

  const interaction = slide.interaction;
  const Panel = interaction
    ? (panels[interaction.kind] as (props: { interaction: Interaction }) => ReactNode)
    : null;

  return (
    <main className="phone" data-slide-id={slide.id}>
      <PhoneHeader
        name={myName}
        onEditName={() => setNameOpen(true)}
        captions={captions}
        onToggleCaptions={toggleCaptions}
      />
      {showNameForm ? <NameForm current={myName} onDone={() => setNameOpen(false)} /> : null}
      {asking && !onQuestionsSlide ? <AskAnytime onClose={() => setAsking(false)} /> : null}
      <div className="phone-body" key={slide.id}>
        {Panel && interaction ? (
          <Panel interaction={interaction} />
        ) : (
          <AmbientPanel slide={slide} />
        )}
      </div>
      {onQuestionsSlide ? null : <QuestionsFeed />}
      {captions === "on" ? <CaptionDock /> : null}
      <PhoneFooter
        index={session.slideIndex}
        canAsk={!asking && !onQuestionsSlide}
        onAsk={() => setAsking(true)}
      />
    </main>
  );
}
