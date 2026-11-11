import { useQuery } from "convex/react";
import QRCode from "qrcode";
import { useEffect, useState } from "react";
import { api } from "../../../convex/_generated/api";
import { audienceUrl } from "../../live/env";
import { CountUp } from "./CountUp";

export function JoinVisual() {
  const count = useQuery(api.audience.count) ?? 0;
  const [qrSrc, setQrSrc] = useState("");

  useEffect(() => {
    void QRCode.toString(audienceUrl, {
      type: "svg",
      margin: 0,
      errorCorrectionLevel: "M",
      color: { dark: "#0a0a0f", light: "#ffffff" },
    }).then((svg) => setQrSrc(`data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`));
  }, []);

  return (
    <div className="v-join">
      <div className="v-join-copy">
        <p className="eyebrow">Ao vivo · pegue o celular</p>
        <h1>Aponte a câmera pro QR.</h1>
        <p className="v-join-url">{audienceUrl.replace(/^https?:\/\//, "").replace(/\/$/, "")}</p>
        <p className="v-join-count">
          <CountUp value={count} className="tabular" />
          <span>{count === 1 ? "pessoa conectada" : "pessoas conectadas"}</span>
        </p>
      </div>
      <div className="v-join-qr">
        {qrSrc ? <img src={qrSrc} alt={`QR code para ${audienceUrl}`} /> : null}
      </div>
    </div>
  );
}
