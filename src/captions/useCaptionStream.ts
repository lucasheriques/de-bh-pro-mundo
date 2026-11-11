import { useAction, useMutation, useQuery } from "convex/react";
import { useEffect, useRef, useState } from "react";
import { api } from "../../convex/_generated/api";
import { presenterKey } from "../live/env";
import { toPcm16 } from "./pcm";
import { splitLongPartial } from "./segments";

const MODEL = "elevenlabs/scribe-v2-realtime";
const SAMPLE_RATE = 24000;
const FRAME_SIZE = 4096;
const RETRY_MS = 1500;
const DRAFT_THROTTLE_MS = 300;
/** Silence longer than this before a phrase starts a new caption line. */
const PAUSE_MS = 1600;

/**
 * Scribe commits a phrase when the speaker pauses, with Portuguese first and English words
 * understood. (Keyterm prompting is rejected by the Gateway; names transcribe fine without it.)
 */
const SCRIBE_OPTIONS = {
  elevenlabs: {
    languageCode: "pt",
    streaming: {
      commitStrategy: "vad",
      vadSilenceThresholdSecs: 0.8,
      secondaryLanguages: ["en"],
    },
  },
} as const;

export type CaptionStreamStatus = "off" | "unavailable" | "connecting" | "live" | "retrying";

/** Streams mic audio as PCM chunks until stopped. */
async function openMic(onChunk: (bytes: Uint8Array) => void): Promise<() => void> {
  const media = await navigator.mediaDevices.getUserMedia({
    audio: { channelCount: 1, noiseSuppression: true, echoCancellation: true },
  });
  const context = new AudioContext({ sampleRate: SAMPLE_RATE });
  const source = context.createMediaStreamSource(media);
  const processor = context.createScriptProcessor(FRAME_SIZE, 1, 1);
  processor.onaudioprocess = (event) => onChunk(toPcm16(event.inputBuffer.getChannelData(0)));
  source.connect(processor);
  processor.connect(context.destination);
  return () => {
    processor.disconnect();
    source.disconnect();
    for (const track of media.getTracks()) track.stop();
    void context.close();
  };
}

type Sink = {
  partial: (text: string) => void;
  final: (text: string) => void;
};

/** One transcription socket: lives until it errors, ends or is aborted. */
async function runSession(
  token: string,
  audio: ReadableStream<Uint8Array>,
  sink: Sink,
  signal: AbortSignal,
): Promise<void> {
  // Loaded on demand: only the presenter's tab streams, phones never download the SDK.
  const [{ createGateway }, { experimental_streamTranscribe: streamTranscribe }] =
    await Promise.all([import("@ai-sdk/gateway"), import("ai")]);
  const gateway = createGateway({ apiKey: token });
  const result = streamTranscribe({
    model: gateway.transcription(MODEL),
    audio,
    inputAudioFormat: { type: "audio/pcm", rate: SAMPLE_RATE },
    providerOptions: SCRIBE_OPTIONS,
    abortSignal: signal,
  });
  for await (const part of result.fullStream) {
    if (part.type === "transcript-partial") sink.partial(part.text);
    else if (part.type === "transcript-final") sink.final(part.text);
    else if (part.type === "error") throw part.error;
  }
}

/**
 * Live captions from the presenter's mic through ElevenLabs Scribe v2 Realtime on the AI
 * Gateway. Convex mints a short-lived token per connection, so the Gateway key never reaches
 * the browser; a dropped socket reconnects with a fresh one.
 */
export function useCaptionStream(enabled: boolean, slideIndex: number): CaptionStreamStatus {
  const available = useQuery(api.captionStream.available, { key: presenterKey });
  const getToken = useAction(api.captionStream.token);
  const pushCaption = useMutation(api.captions.push);
  const pushDraft = useMutation(api.captions.draft);
  const [status, setStatus] = useState<CaptionStreamStatus>("off");
  const latest = useRef({ slideIndex, getToken, pushCaption, pushDraft });
  latest.current = { slideIndex, getToken, pushCaption, pushDraft };

  useEffect(() => {
    if (!enabled) {
      setStatus("off");
      return;
    }
    if (available === undefined) return;
    if (!available) {
      setStatus("unavailable");
      return;
    }
    const abort = new AbortController();
    let feed: ReadableStreamDefaultController<Uint8Array> | null = null;
    let lastFinalAt = 0;
    let phraseAfterPause: boolean | null = null;
    let draftTimer: number | null = null;
    let draftText = "";
    let consumed = 0;

    const flushDraft = () => {
      draftTimer = null;
      void latest.current
        .pushDraft({ key: presenterKey, text: draftText, afterPause: phraseAfterPause === true })
        .catch(() => undefined);
    };
    const publish = (text: string) => {
      const afterPause = phraseAfterPause ?? Date.now() - lastFinalAt > PAUSE_MS;
      lastFinalAt = Date.now();
      phraseAfterPause = null;
      if (!text) return;
      const { pushCaption, slideIndex } = latest.current;
      void pushCaption({ key: presenterKey, text, slideIndex, afterPause }).catch(() => undefined);
    };
    const sink: Sink = {
      partial: (text) => {
        phraseAfterPause ??= Date.now() - lastFinalAt > PAUSE_MS;
        const split = splitLongPartial(text, consumed);
        consumed = split.consumed;
        if (split.commit) publish(split.commit);
        draftText = split.rest;
        draftTimer ??= window.setTimeout(flushDraft, DRAFT_THROTTLE_MS);
      },
      final: (text) => {
        const rest = text.slice(consumed).trim();
        consumed = 0;
        draftText = "";
        if (draftTimer !== null) window.clearTimeout(draftTimer);
        draftTimer = null;
        // Publishing clears the draft on the server in the same step, so nothing blinks.
        if (rest) publish(rest);
        else flushDraft();
      },
    };

    const loop = async () => {
      const closeMic = await openMic((bytes) => feed?.enqueue(bytes));
      abort.signal.addEventListener("abort", closeMic);
      while (!abort.signal.aborted) {
        setStatus("connecting");
        const audio = new ReadableStream<Uint8Array>({
          start: (controller) => {
            feed = controller;
          },
        });
        try {
          const token = await latest.current.getToken({ key: presenterKey });
          setStatus("live");
          await runSession(token, audio, sink, abort.signal);
        } catch (error) {
          // A dropped socket or an expired token: log it, then reconnect.
          if (!abort.signal.aborted) console.warn("Legendas: conexão caiu, reconectando", error);
        }
        feed = null;
        if (abort.signal.aborted) break;
        setStatus("retrying");
        await new Promise((resolve) => setTimeout(resolve, RETRY_MS));
      }
    };
    void loop().catch(() => setStatus("retrying"));
    return () => {
      abort.abort();
      if (draftTimer !== null) window.clearTimeout(draftTimer);
    };
  }, [enabled, available]);

  return status;
}
