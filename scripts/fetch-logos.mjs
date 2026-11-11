import { mkdirSync, writeFileSync } from "node:fs";
import { fileURLToPath } from "node:url";

const outDir = fileURLToPath(new URL("../public/logos/", import.meta.url));
const hosts = [
  "vercel.com",
  "nvidia.com",
  "github.com",
  "spotify.com",
  "airbnb.com",
  "shopify.com",
  "coinbase.com",
  "posthog.com",
  "google.com",
  "apple.com",
  "meta.com",
  "microsoft.com",
  "netflix.com",
  "amazon.com",
  "stripe.com",
  "uber.com",
  "nubank.com.br",
  "mercadolivre.com.br",
  "ifood.com.br",
  "quintoandar.com.br",
  "xpi.com.br",
  "btgpactual.com",
  "vtex.com",
  "bairesdev.com",
];

mkdirSync(outDir, { recursive: true });
for (const host of hosts) {
  const response = await fetch(`https://www.nagringa.dev/api/logo/${host}?theme=light`);
  const type = response.headers.get("content-type") ?? "";
  if (!response.ok || !type.startsWith("image/")) {
    console.error(`skip ${host}: ${response.status} ${type}`);
    continue;
  }
  writeFileSync(`${outDir}${host}.webp`, Buffer.from(await response.arrayBuffer()));
  console.log(`ok ${host}`);
}
