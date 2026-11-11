import type { VoiceMove } from "./match";

export type VoiceLogKind = "heard" | "typed" | "action" | "error";

export type VoiceLogEntry = { id: number; at: number; kind: VoiceLogKind; text: string };

export const VOICE_LOG_LIMIT = 30;

export function describeMove(move: VoiceMove, fromIndex: number): string {
  if (move.reveal) return `Revelou o resultado do slide ${fromIndex + 1}`;
  if (move.steps === -1) return `Voltou do slide ${fromIndex + 1} pro ${fromIndex}`;
  if (move.steps === 2)
    return `Pulou do slide ${fromIndex + 1} pro ${fromIndex + 3} (gatilho do seguinte)`;
  return `Avançou do slide ${fromIndex + 1} pro ${fromIndex + 2}`;
}

export function appendLog(
  log: readonly VoiceLogEntry[],
  kind: VoiceLogKind,
  text: string,
  at = Date.now(),
): VoiceLogEntry[] {
  const id = (log[0]?.id ?? 0) + 1;
  return [{ id, at, kind, text }, ...log].slice(0, VOICE_LOG_LIMIT);
}
