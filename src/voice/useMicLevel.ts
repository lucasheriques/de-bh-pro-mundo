import { useEffect, useRef } from "react";

export function useMicLevel(enabled: boolean) {
  const meterRef = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    if (!enabled || !navigator.mediaDevices?.getUserMedia) return;
    let frame = 0;
    let cancelled = false;
    let cleanup = () => {};
    void navigator.mediaDevices
      .getUserMedia({ audio: true })
      .then((stream) => {
        if (cancelled) {
          for (const track of stream.getTracks()) track.stop();
          return;
        }
        const audio = new AudioContext();
        const analyser = audio.createAnalyser();
        analyser.fftSize = 512;
        audio.createMediaStreamSource(stream).connect(analyser);
        const samples = new Uint8Array(analyser.fftSize);
        const tick = () => {
          analyser.getByteTimeDomainData(samples);
          let sum = 0;
          for (const sample of samples) sum += ((sample - 128) / 128) ** 2;
          const level = Math.min(1, Math.sqrt(sum / samples.length) * 4);
          meterRef.current?.style.setProperty("--level", level.toFixed(3));
          frame = requestAnimationFrame(tick);
        };
        tick();
        cleanup = () => {
          cancelAnimationFrame(frame);
          for (const track of stream.getTracks()) track.stop();
          void audio.close();
        };
      })
      .catch(() => undefined);
    return () => {
      cancelled = true;
      cleanup();
      meterRef.current?.style.setProperty("--level", "0");
    };
  }, [enabled]);

  return meterRef;
}
