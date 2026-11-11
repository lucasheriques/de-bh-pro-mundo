import { useCallback, useEffect, useRef, useState } from "react";
import { clearHeard, initialVoiceState, type VoiceMove, type VoiceState, voiceStep } from "./match";
import { BIAS_PHRASES, correctTranscript } from "./vocabulary";
import { appendLog, describeMove, type VoiceLogEntry, type VoiceLogKind } from "./voiceLog";

type RecognitionResult = { isFinal: boolean; 0: { transcript: string } };
type RecognitionEvent = { resultIndex: number; results: ArrayLike<RecognitionResult> };
type Recognition = {
  lang: string;
  processLocally?: boolean;
  phrases?: unknown[];
  continuous: boolean;
  interimResults: boolean;
  onresult: ((event: RecognitionEvent) => void) | null;
  onerror: ((event: { error: string }) => void) | null;
  onend: (() => void) | null;
  onstart: (() => void) | null;
  start(): void;
  stop(): void;
};
type LanguagePackRequest = { langs: string[]; processLocally: boolean };
type RecognitionConstructor = {
  new (): Recognition;
  install?: (request: LanguagePackRequest) => Promise<boolean>;
};

declare global {
  interface Window {
    SpeechRecognition?: RecognitionConstructor;
    webkitSpeechRecognition?: RecognitionConstructor;
    SpeechRecognitionPhrase?: new (phrase: string, boost: number) => unknown;
    __voiceFeed?: (text: string, isFinal?: boolean) => void;
  }
}

export type VoiceStatus = "off" | "starting" | "listening" | "unsupported" | "blocked";
export type VoiceMode = "on-device" | "online";

const LANG = "pt-BR";
const BLOCKED_ERRORS = new Set(["not-allowed", "service-not-allowed"]);

const TRANSCRIPT_CHARS = 220;
/**
 * Chrome and Scribe can both hear the same command; whichever moves first wins and the other's
 * copy, arriving a moment later, is dropped.
 */
export const MOVE_GUARD_MS = 3000;
const RESTART_DELAY_MS = 300;

type VoiceOptions = {
  enabled: boolean;
  slideIndex: number;
  cues: readonly string[] | undefined;
  nextCues: readonly string[] | undefined;
  onMove: (fromIndex: number, move: VoiceMove) => void;
};

type Ui = {
  feed: (text: string, isFinal: boolean) => void;
  setStatus: (status: VoiceStatus) => void;
  setError: (error: string | null) => void;
  setMode: (mode: VoiceMode) => void;
  note: (kind: VoiceLogKind, text: string) => void;
};

const recognitionConstructor = (): RecognitionConstructor | undefined =>
  window.SpeechRecognition ?? window.webkitSpeechRecognition;

const isInvalidState = (cause: unknown): boolean =>
  cause instanceof DOMException && cause.name === "InvalidStateError";

const PHRASE_BOOST = 4;

function applyPhrases(recognition: Recognition): boolean {
  const Phrase = window.SpeechRecognitionPhrase;
  if (!Phrase || !("phrases" in recognition)) return false;
  try {
    recognition.phrases = BIAS_PHRASES.map((phrase) => new Phrase(phrase, PHRASE_BOOST));
    return true;
  } catch {
    return false;
  }
}

function dropPhrases(recognition: Recognition): void {
  if ("phrases" in recognition) recognition.phrases = [];
}

function startRecognition(Constructor: RecognitionConstructor, ui: Ui): () => void {
  const recognition = new Constructor();
  let mode: VoiceMode = "processLocally" in recognition ? "on-device" : "online";
  let stopped = false;
  let blocked = false;
  let restartTimer: number | undefined;

  const fallBackOnline = (): boolean => {
    if (mode === "online") return false;
    mode = "online";
    recognition.processLocally = false;
    dropPhrases(recognition);
    ui.setMode(mode);
    return true;
  };
  const start = () => {
    try {
      recognition.start();
    } catch (cause) {
      if (!isInvalidState(cause) && fallBackOnline()) start();
      else restartTimer = window.setTimeout(start, RESTART_DELAY_MS * 3);
    }
  };

  if (mode === "on-device") recognition.processLocally = true;
  ui.setMode(mode);
  recognition.lang = LANG;
  if (mode === "on-device" && applyPhrases(recognition))
    ui.note("action", "Vocabulário da talk carregado");
  recognition.continuous = true;
  recognition.interimResults = true;
  recognition.onstart = () => {
    ui.setStatus("listening");
    ui.setError(null);
  };
  recognition.onresult = (event) => {
    let interim = "";
    for (let i = event.resultIndex; i < event.results.length; i++) {
      const result = event.results[i];
      if (!result) continue;
      if (result.isFinal) ui.feed(result[0].transcript, true);
      else interim += result[0].transcript;
    }
    if (interim) ui.feed(interim, false);
  };
  recognition.onerror = (event) => {
    // Silence ends a session with "no-speech"; onend restarts it, so it is not a fault.
    if (event.error === "aborted" || event.error === "no-speech") return;
    if (event.error === "language-not-supported" && fallBackOnline()) return;
    if (event.error === "phrases-not-supported") {
      dropPhrases(recognition);
      return;
    }
    ui.setError(event.error);
    ui.note("error", event.error);
    if (BLOCKED_ERRORS.has(event.error)) {
      blocked = true;
      ui.setStatus("blocked");
    }
  };
  recognition.onend = () => {
    if (stopped || blocked) return;
    ui.setStatus("starting");
    restartTimer = window.setTimeout(start, RESTART_DELAY_MS);
  };
  ui.setStatus("starting");
  start();
  return () => {
    stopped = true;
    window.clearTimeout(restartTimer);
    recognition.onend = null;
    recognition.stop();
  };
}

export function useVoice({ enabled, slideIndex, cues, nextCues, onMove }: VoiceOptions) {
  const [status, setStatus] = useState<VoiceStatus>("off");
  const [error, setError] = useState<string | null>(null);
  const [mode, setMode] = useState<VoiceMode | null>(null);
  const [installing, setInstalling] = useState(false);
  const [transcript, setTranscript] = useState({ final: "", interim: "" });
  const [lastMatch, setLastMatch] = useState<string | null>(null);
  const [log, setLog] = useState<VoiceLogEntry[]>([]);
  const note = useCallback(
    (kind: VoiceLogKind, text: string) => setLog((current) => appendLog(current, kind, text)),
    [],
  );
  const latest = useRef({ enabled, slideIndex, cues, nextCues, onMove });
  latest.current = { enabled, slideIndex, cues, nextCues, onMove };
  const voiceState = useRef<VoiceState>(initialVoiceState);
  const scribeState = useRef<VoiceState>(initialVoiceState);
  const lastMoveAt = useRef(0);
  const heardAt = useRef(slideIndex);
  if (heardAt.current !== slideIndex) {
    heardAt.current = slideIndex;
    voiceState.current = clearHeard(voiceState.current);
    scribeState.current = clearHeard(scribeState.current);
  }

  /** Applies a heard move unless the other recognizer just moved for the same words. */
  const applyMove = (move: VoiceMove, text: string, source: string) => {
    const now = Date.now();
    if (now - lastMoveAt.current < MOVE_GUARD_MS) return;
    lastMoveAt.current = now;
    const { slideIndex, onMove } = latest.current;
    setLastMatch(text);
    note("action", `${describeMove(move, slideIndex)} · ${source} ouviu "${text.trim()}"`);
    onMove(slideIndex, move);
  };
  const restart = useRef<(() => void) | null>(null);
  const feed = useRef((heard: string, isFinal: boolean, spoken = true) => {
    const { enabled, slideIndex, cues, nextCues } = latest.current;
    const text = correctTranscript(heard);
    if (!enabled) return;
    const result = voiceStep(voiceState.current, {
      text,
      isFinal,
      now: Date.now(),
      slideIndex,
      cues,
      nextCues,
    });
    voiceState.current = result.state;
    if (isFinal && text.trim()) note(spoken ? "heard" : "typed", text.trim());
    if (result.steps !== 0 || result.reveal) {
      applyMove({ steps: result.steps, reveal: result.reveal }, text, "Chrome");
    }
    setTranscript((current) =>
      isFinal
        ? { final: `${current.final} ${text}`.trim().slice(-TRANSCRIPT_CHARS), interim: "" }
        : { ...current, interim: text },
    );
  }).current;

  useEffect(() => {
    if (!import.meta.env.DEV) return;
    window.__voiceFeed = (text, isFinal = true) => feed(text, isFinal);
    return () => {
      delete window.__voiceFeed;
    };
  }, [feed]);

  useEffect(() => {
    if (!enabled) {
      setStatus("off");
      setError(null);
      setMode(null);
      return;
    }
    const Constructor = recognitionConstructor();
    if (!Constructor) {
      setStatus("unsupported");
      return;
    }
    const ui = { feed, setStatus, setError, setMode, note };
    let stop = startRecognition(Constructor, ui);
    restart.current = () => {
      stop();
      stop = startRecognition(Constructor, ui);
    };
    return () => {
      restart.current = null;
      stop();
    };
  }, [enabled, feed, note]);

  const Recognition = recognitionConstructor();
  const installPack = Recognition?.install
    ? async () => {
        setInstalling(true);
        try {
          await Recognition.install?.({ langs: [LANG], processLocally: true });
          restart.current?.();
        } catch {
          setError("install-failed");
        } finally {
          setInstalling(false);
        }
      }
    : undefined;

  return {
    status,
    error,
    mode,
    transcript,
    lastMatch,
    log,
    say: (text: string) => feed(text, true, false),
    /** A finished phrase from Scribe: a second chance for commands Chrome missed. */
    hearScribe: (heard: string) => {
      const { enabled, slideIndex, cues, nextCues } = latest.current;
      if (!enabled) return;
      const text = correctTranscript(heard);
      const result = voiceStep(scribeState.current, {
        text,
        isFinal: true,
        now: Date.now(),
        slideIndex,
        cues,
        nextCues,
      });
      scribeState.current = result.state;
      if (result.steps !== 0 || result.reveal) {
        applyMove({ steps: result.steps, reveal: result.reveal }, text, "Scribe");
      }
    },
    installPack,
    installing,
  };
}
