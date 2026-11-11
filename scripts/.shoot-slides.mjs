import { readFileSync } from "node:fs";
import { ConvexHttpClient } from "convex/browser";
import { chromium } from "playwright-chromium";
import { api } from "../convex/_generated/api.js";

const env = Object.fromEntries(
  readFileSync(".env.local", "utf8")
    .split("\n")
    .filter(Boolean)
    .map((l) => l.split(/=(.*)/s).slice(0, 2)),
);
const key = env.PRESENTER_KEY;
const convex = new ConvexHttpClient(env.VITE_CONVEX_URL);
await convex.mutation(api.session.setVoice, { key, voiceEnabled: false });
const b = await chromium.launch();
const stage = await (await b.newContext({ viewport: { width: 1600, height: 900 } })).newPage();
const phone = await (await b.newContext({ viewport: { width: 390, height: 844 } })).newPage();
await stage.goto(`http://localhost:3051/stage?key=${key}`);
await phone.goto("http://localhost:3051/");
await stage.waitForTimeout(2000);
await phone.waitForTimeout(2000);
const pular = phone.getByRole("button", { name: "Pular" });
if (await pular.count()) await pular.click();
for (let i = 0; i < 26; i++) {
  await convex.mutation(api.session.setSlide, { key, slideIndex: i });
  await stage.locator(`[data-slide-index="${i}"]`).first().waitFor();
  await stage.waitForTimeout(1600);
  await phone.waitForTimeout(300);
  const n = String(i + 1).padStart(2, "0");
  await stage.screenshot({ path: `.checks/review/stage-${n}.png` });
  await phone.screenshot({ path: `.checks/review/phone-${n}.png` });
}
await convex.mutation(api.session.setSlide, { key, slideIndex: 0 });
await b.close();
const dir = `${process.cwd()}/.checks/review`;
const fs = await import("node:fs");
const st = fs
  .readdirSync(dir)
  .filter((f) => /^stage-\d+\.png$/.test(f))
  .sort();
const ph = fs
  .readdirSync(dir)
  .filter((f) => /^phone-\d+\.png$/.test(f))
  .sort();
const html = (files, cols, w) =>
  `<html><body style="margin:0;background:#333;display:grid;grid-template-columns:repeat(${cols},${w}px);gap:8px;padding:8px;font:14px sans-serif;color:#fff">${files.map((f) => `<div><div>${f}</div><img src="file://${dir}/${f}" style="width:${w}px;display:block"></div>`).join("")}</body></html>`;
const b2 = await chromium.launch();
const p = await b2.newPage({ viewport: { width: 1960, height: 1000 } });
const shoot = async (files, cols, w, out) => {
  fs.writeFileSync(`${dir}/tmp.html`, html(files, cols, w));
  await p.goto(`file://${dir}/tmp.html`);
  await p.waitForTimeout(400);
  await p.screenshot({ path: `${dir}/${out}`, fullPage: true });
};
await shoot(st.slice(0, 9), 3, 640, "sheet-stage-a.png");
await shoot(st.slice(9, 18), 3, 640, "sheet-stage-b.png");
await shoot(st.slice(18), 3, 640, "sheet-stage-c.png");
await shoot(ph.slice(0, 13), 7, 270, "sheet-phone-a.png");
await shoot(ph.slice(13), 7, 270, "sheet-phone-b.png");
fs.unlinkSync(`${dir}/tmp.html`);
await b2.close();
