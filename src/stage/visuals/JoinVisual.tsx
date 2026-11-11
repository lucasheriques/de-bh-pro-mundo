import { useQuery } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { audienceHost, StyledQr } from "../StyledQr";
import { CountUp } from "./CountUp";

export function JoinVisual() {
  const count = useQuery(api.presence.onlineCount) ?? 0;

  return (
    <div className="v-join">
      <div className="v-join-copy">
        <p className="eyebrow">Ao vivo · pegue o celular</p>
        <h1>Aponte a câmera pro QR.</h1>
        <p className="v-join-url">{audienceHost}</p>
        <p className="v-join-count">
          <CountUp value={count} className="tabular" />
          <span>{count === 1 ? "pessoa conectada" : "pessoas conectadas"}</span>
        </p>
      </div>
      <div className="v-join-qr">
        <StyledQr className="qr" label={`QR code para ${audienceHost}`} />
      </div>
    </div>
  );
}
