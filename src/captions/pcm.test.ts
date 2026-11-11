import { describe, expect, it } from "vitest";
import { toPcm16 } from "./pcm";

const int16At = (bytes: Uint8Array, i: number) => new DataView(bytes.buffer).getInt16(i * 2, true);

describe("toPcm16", () => {
  it.each([
    { name: "silence", sample: 0, expected: 0 },
    { name: "full positive", sample: 1, expected: 32767 },
    { name: "full negative", sample: -1, expected: -32768 },
    { name: "half", sample: 0.5, expected: 16383 },
    { name: "clips above range", sample: 2, expected: 32767 },
    { name: "clips below range", sample: -3, expected: -32768 },
  ])("$name", ({ sample, expected }) => {
    const bytes = toPcm16(new Float32Array([sample]));
    expect(bytes.length).toBe(2);
    expect(int16At(bytes, 0)).toBe(expected);
  });
});
