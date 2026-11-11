import { type FormEvent, useState } from "react";
import { type CaptionStreamStatus, useCaptionStream } from "../captions/useCaptionStream";
import { CaptionsToggle } from "../live/CaptionsToggle";
import { type Deck, pollIdOf } from "../live/useDeck";
import { slides } from "../talk/slides";
import type { VoiceMove } from "../voice/match";
import { useMicLevel } from "../voice/useMicLevel";
import { useVoice, type VoiceMode, type VoiceStatus } from "../voice/useVoice";
import type { VoiceLogEntry, VoiceLogKind } from "../voice/voiceLog";

const STATUS_LABEL: Record<VoiceStatus, string> = {
  off: "Voz desligada",
  starting: "Ligando microfone...",
  listening: "Ouvindo",
  unsupported: "Navegador sem reconhecimento de voz (use o Chrome)",
  blocked: "Microfone bloqueado. Libere nas permissões do site.",
};

const MODE_LABEL: Record<VoiceMode, string> = {
  "on-device": "No aparelho",
  online: "Online",
};

const ONLINE_HINT = "Sem pacote pt-BR no aparelho: dependendo da rede";

const ERROR_LABEL: Record<string, string> = {
  "no-speech": "Sem fala detectada",
  network: "Erro de rede no reconhecimento",
  "audio-capture": "Nenhum microfone encontrado",
  "not-allowed": "Permissão de microfone negada",
  "language-not-supported": "Idioma pt-BR indisponível no reconhecimento",
  "install-failed": "Não deu para baixar o pacote pt-BR",
};

function TypedSpeech({
  onSubmit,
  disabled,
}: {
  onSubmit: (text: string) => void;
  disabled: boolean;
}) {
  const [draft, setDraft] = useState("");
  const submit = (event: FormEvent) => {
    event.preventDefault();
    const text = draft.trim();
    if (!text) return;
    onSubmit(text);
    setDraft("");
  };
  return (
    <form className="voice-typed" onSubmit={submit}>
      <input
        value={draft}
        onChange={(event) => setDraft(event.target.value)}
        placeholder="Digitar fala"
        aria-label="Digitar fala"
        disabled={disabled}
      />
      <button type="submit" className="ghost" disabled={disabled || !draft.trim()}>
        Enviar
      </button>
    </form>
  );
}

function applyVoiceMove(deck: Deck, from: number, move: VoiceMove): void {
  if (move.reveal) {
    const pollId = pollIdOf(deck.slide);
    if (pollId && !deck.session.revealed[pollId]) deck.toggleReveal();
    return;
  }
  if (move.steps === -1) {
    if (deck.index === from) deck.prev();
    return;
  }
  deck.advanceFrom(from);
  if (move.steps === 2) deck.advanceFrom(from + 1);
}

const LOG_LABEL: Record<VoiceLogKind, string> = {
  heard: "ouviu",
  typed: "digitou",
  action: "ação",
  error: "erro",
};

const clock = (at: number) =>
  new Date(at).toLocaleTimeString("pt-BR", {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  });

function VoiceLog({ entries }: { entries: readonly VoiceLogEntry[] }) {
  return (
    <details className="voice-log" open>
      <summary>Log da voz ({entries.length})</summary>
      {entries.length === 0 ? (
        <p className="muted">Nada ouvido ainda. Ligue a voz e fale.</p>
      ) : (
        <ol>
          {entries.map((entry) => (
            <li key={entry.id} data-kind={entry.kind}>
              <span className="mono muted">{clock(entry.at)}</span>
              <span className="voice-log-kind mono">{LOG_LABEL[entry.kind]}</span>
              <span>{entry.text}</span>
            </li>
          ))}
        </ol>
      )}
    </details>
  );
}

const CAPTION_STATUS_LABEL: Record<CaptionStreamStatus, string> = {
  off: "desligadas (ligue a voz)",
  unavailable: "sem chave do AI Gateway no Convex",
  connecting: "conectando…",
  live: "ao vivo (Scribe v2)",
  commands: "desligadas no /admin · Scribe ouvindo só os comandos",
  retrying: "reconectando…",
};

export function VoiceHud({ deck }: { deck: Deck }) {
  const enabled = deck.session.voiceEnabled;
  const voice = useVoice({
    enabled,
    slideIndex: deck.index,
    cues: deck.slide.cues,
    nextCues: slides[deck.index + 1]?.cues,
    onMove: (from, move) => applyVoiceMove(deck, from, move),
  });
  const meterRef = useMicLevel(enabled && voice.status === "listening");
  const captionStatus = useCaptionStream(enabled, deck.index, voice.hearScribe);

  return (
    <section
      className={`presenter-card voice-hud is-${voice.status}`}
      data-voice-status={voice.status}
    >
      <header className="presenter-card-head">
        <p className="eyebrow">
          <span ref={meterRef} className="mic-meter" aria-hidden />
          {STATUS_LABEL[voice.status]}
        </p>
        <button type="button" className={enabled ? "ghost" : "primary"} onClick={deck.toggleVoice}>
          {enabled ? "Desligar voz" : "Ligar voz"}
        </button>
      </header>
      {voice.mode ? (
        <p className={`voice-mode is-${voice.mode}`} data-voice-mode={voice.mode}>
          <strong>{MODE_LABEL[voice.mode]}</strong>
          {voice.mode === "online" ? <span className="muted">{ONLINE_HINT}</span> : null}
          {voice.mode === "online" && voice.installPack ? (
            <button
              type="button"
              className="ghost"
              disabled={voice.installing}
              onClick={voice.installPack}
            >
              Baixar pt-BR no aparelho
            </button>
          ) : null}
        </p>
      ) : null}
      {voice.error ? (
        <p className="voice-error mono">{ERROR_LABEL[voice.error] ?? voice.error}</p>
      ) : null}
      <p className="transcript" data-testid="transcript">
        {voice.transcript.final} <span className="muted">{voice.transcript.interim}</span>
      </p>
      {voice.lastMatch ? <p className="mono muted">Último gatilho: "{voice.lastMatch}"</p> : null}
      <VoiceLog entries={voice.log} />
      <TypedSpeech onSubmit={voice.say} disabled={!enabled} />
      <p className={`caption-status is-${captionStatus}`} data-caption-status={captionStatus}>
        Legendas: {CAPTION_STATUS_LABEL[captionStatus]}
      </p>
      <CaptionsToggle />
      <p className="voice-commands">
        Em qualquer slide: "próximo slide" (ou "segue em frente"), "volta um" (ou "slide anterior"),
        "mostra o resultado".
      </p>
    </section>
  );
}
