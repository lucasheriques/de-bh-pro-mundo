import usePresence from "@convex-dev/presence/react";
import { useMutation } from "convex/react";
import { type ReactNode, useEffect, useState } from "react";
import { api } from "../../convex/_generated/api";
import { PRESENCE_ROOM } from "../../convex/validators";
import { ConnectionDot } from "../live/ConnectionDot";
import { clientId } from "../live/env";
import { ThemeToggle } from "../live/ThemeToggle";
import { slideAt, useSession } from "../live/useDeck";
import { useStoredToggle } from "../live/useStoredToggle";
import { slides } from "../talk/slides";
import type { Interaction } from "../talk/types";
import { AmbientPanel } from "./AmbientPanel";
import { ChoicePanel } from "./ChoicePanel";
import { GuessPanel } from "./GuessPanel";
import { MatchPanel } from "./MatchPanel";
import { NameChip, NameForm, useMyName } from "./NameCard";
import { PhoneDock, QuestionsSheet } from "./PhoneDock";
import { QuestionsPanel } from "./QuestionsPanel";

const CAPTION_STATES = ["on", "off"] as const;

export type PanelProps<K extends Interaction["kind"]> = {
  interaction: Extract<Interaction, { kind: K }>;
};

const panels: { [K in Interaction["kind"]]: (props: PanelProps<K>) => ReactNode } = {
  choice: ChoicePanel,
  guess: GuessPanel,
  match: MatchPanel,
  questions: QuestionsPanel,
};

function PhoneHeader({
  name,
  onEditName,
  captions,
  onToggleCaptions,
  position,
}: {
  name: string | null | undefined;
  onEditName: () => void;
  captions: "on" | "off";
  onToggleCaptions: () => void;
  position: string;
}) {
  return (
    <header className="phone-header">
      <NameChip name={name} onEdit={onEditName} />
      <p className="phone-position mono">{position}</p>
      <button
        type="button"
        className="caption-toggle"
        aria-pressed={captions === "on"}
        onClick={onToggleCaptions}
      >
        Legendas
      </button>
      <ThemeToggle />
      <ConnectionDot className="phone-connection" />
    </header>
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
  const [questionsOpen, setQuestionsOpen] = useState(false);
  const onQuestionsSlide = slide.interaction?.kind === "questions";

  useEffect(() => {
    void join({ clientId }).catch(() => undefined);
  }, [join]);
  usePresence(api.presence, PRESENCE_ROOM, clientId);

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
        position={`${session.slideIndex + 1}/${slides.length}${slide.section ? ` · ${slide.section.replace(/^\d+\.\s*/, "")}` : ""}`}
      />
      {showNameForm ? <NameForm current={myName} onDone={() => setNameOpen(false)} /> : null}
      <div className="phone-body" key={slide.id}>
        {Panel && interaction ? (
          <Panel interaction={interaction} />
        ) : (
          <AmbientPanel slide={slide} />
        )}
      </div>
      <PhoneDock
        captions={captions === "on"}
        showQuestions={!onQuestionsSlide}
        onOpenQuestions={() => setQuestionsOpen(true)}
      />
      <QuestionsSheet
        open={questionsOpen && !onQuestionsSlide}
        onClose={() => setQuestionsOpen(false)}
      />
    </main>
  );
}
