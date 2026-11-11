import QRCode from "qrcode";
import { useEffect, useState } from "react";
import { audienceUrl } from "../live/env";

export const audienceHost = audienceUrl.replace(/^https?:\/\//, "").replace(/\/$/, "");

/** The audience link as an SVG data URL, rendered once per page. */
export function useQrSrc(): string {
  const [src, setSrc] = useState("");
  useEffect(() => {
    void QRCode.toString(audienceUrl, {
      type: "svg",
      margin: 0,
      errorCorrectionLevel: "M",
      color: { dark: "#0a0a0f", light: "#ffffff" },
    }).then((svg) => setSrc(`data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`));
  }, []);
  return src;
}
