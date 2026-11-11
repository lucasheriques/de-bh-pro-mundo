import { existsSync, mkdirSync, readFileSync, rmSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { ConvexHttpClient } from "convex/browser";
import { anyApi as api } from "convex/server";
import { chromium } from "playwright-chromium";
import { formatValue } from "../src/talk/format.ts";
import { slides } from "../src/talk/slides.ts";

const packageDir = fileURLToPath(new URL("..", import.meta.url));
const env = Object.fromEntries(
  readFileSync(`${packageDir}.env.local`, "utf8")
    .split("\n")
    .filter((line) => /^[A-Z_]+=/.test(line))
    .map((line) => [line.slice(0, line.indexOf("=")), line.slice(line.indexOf("=") + 1).trim()]),
);
const key = env.PRESENTER_KEY;
const base = process.env.E2E_URL ?? "http://localhost:3051";
const checks = `${packageDir}.checks`;
rmSync(checks, { recursive: true, force: true });
mkdirSync(checks, { recursive: true });

const convex = new ConvexHttpClient(env.VITE_CONVEX_URL);
const shots = [];

function assert(condition, message) {
  if (!condition) throw new Error(`FAIL: ${message}`);
  console.log(`ok - ${message}`);
}

function indexWhere(description, predicate) {
  const index = slides.findIndex(predicate);
  if (index < 0) throw new Error(`slides.ts has no ${description}`);
  return index;
}

const hasCues = (slide) => Boolean(slide?.cues?.length);
const voiceIndex = indexWhere(
  "two consecutive cued slides followed by a slide",
  (slide, i) =>
    hasCues(slide) && hasCues(slides[i + 1]) && !slides[i + 1].interaction && slides[i + 2],
);
const choiceIndex = indexWhere(
  "results slide with a choice poll",
  (s) => s.visual.kind === "results" && s.interaction?.kind === "choice",
);
const guessIndex = indexWhere(
  "guess slide with two slides after it",
  (s, i) => s.interaction?.kind === "guess" && slides[i + 2],
);
const questionsIndex = indexWhere("questions slide", (s) => s.interaction?.kind === "questions");
const lastIndex = slides.length - 1;

async function shot(page, name) {
  const path = `${checks}/${name}.png`;
  await page.screenshot({ path });
  shots.push(path);
}

async function shotBothThemes(page, name) {
  await shot(page, `${name}-dark`);
  await page.keyboard.press("t");
  await page.locator('.canvas[data-theme="light"]').first().waitFor();
  await page.waitForTimeout(300);
  await shot(page, `${name}-light`);
  await page.keyboard.press("t");
  await page.locator('.canvas[data-theme="dark"]').first().waitFor();
}

const fakeVoter = (i) => `e2evoter${String(i).padStart(4, "0")}`;

async function seedVotes(pollId, from, to, valueAt) {
  for (let i = from; i < to; i++) {
    await convex.mutation(api.votes.cast, { pollId, clientId: fakeVoter(i), value: valueAt(i) });
  }
}

const largestDot = (page) =>
  page.evaluate(() =>
    Math.max(
      0,
      ...[...document.querySelectorAll(".unit-col .dot-body")].map(
        (dot) => dot.getBoundingClientRect().width,
      ),
    ),
  );

async function resetState() {
  await convex.mutation(api.reset.all, { key });
}

const atIndex = (page, index) =>
  page.locator(`[data-slide-index="${index}"]`).first().waitFor({ timeout: 8000 });
const phoneAt = (page, index) =>
  page.locator(`.phone[data-slide-id="${slides[index].id}"]`).waitFor({ timeout: 8000 });
const indexOf = async (page, selector) =>
  Number(await page.locator(selector).getAttribute("data-slide-index"));
const settle = (page) => page.waitForTimeout(900);

const bundled = chromium.executablePath();
const browser = await chromium.launch({
  executablePath: existsSync(bundled)
    ? bundled
    : "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome",
});

try {
  await resetState();

  const stageContext = await browser.newContext({ viewport: { width: 1600, height: 900 } });
  const presenterContext = await browser.newContext({ viewport: { width: 1440, height: 900 } });
  const phoneContexts = await Promise.all(
    [0, 1, 2].map(() =>
      browser.newContext({
        viewport: { width: 375, height: 812 },
        isMobile: true,
        hasTouch: true,
        deviceScaleFactor: 2,
      }),
    ),
  );
  const stageSockets = new Set();
  let stageNetworkDown = false;
  await stageContext.routeWebSocket(/convex\.cloud/, (socket) => {
    if (stageNetworkDown) return socket.close();
    const server = socket.connectToServer();
    stageSockets.add({ socket, server });
  });
  const setStageNetwork = async (up) => {
    stageNetworkDown = !up;
    await stageContext.setOffline(!up);
    if (up) return;
    for (const { socket, server } of stageSockets) {
      await server.close();
      await socket.close();
    }
    stageSockets.clear();
  };
  const stage = await stageContext.newPage();
  const presenter = await presenterContext.newPage();
  const phones = await Promise.all(phoneContexts.map((context) => context.newPage()));
  const errors = [];
  for (const page of [stage, presenter, ...phones])
    page.on("pageerror", (error) => errors.push(error.message));

  const jump = async (index) => {
    await convex.mutation(api.session.setSlide, { key, slideIndex: index });
    await atIndex(stage, index);
    for (const phone of phones) await phoneAt(phone, index);
  };

  await stage.goto(`${base}/stage?key=${key}`);
  await presenter.goto(`${base}/presenter?key=${key}`);
  for (const phone of phones) await phone.goto(base);
  for (const page of [stage, presenter, ...phones]) {
    await page.locator(".connection.is-online").first().waitFor({ timeout: 15000 });
  }
  assert(true, "stage, presenter and 3 phones connected");

  const nameInput = phones[0].getByPlaceholder("Seu primeiro nome");
  await nameInput.fill("Ana2000");
  await phones[0].locator(".name-hint", { hasText: "Só letras, por favor" }).waitFor();
  assert(
    await phones[0].getByRole("button", { name: "Salvar" }).isDisabled(),
    "a name with digits is rejected before it is sent",
  );
  await nameInput.fill("  Ana  ");
  await phones[0].getByRole("button", { name: "Salvar" }).click();
  await phones[0].locator(".name-chip", { hasText: "Oi, Ana" }).waitFor();
  assert(
    (await phones[0].locator(".name-card").count()) === 0,
    "saving a name closes the form and greets the person",
  );
  for (const phone of phones.slice(1)) await phone.getByRole("button", { name: "Pular" }).click();
  assert(
    (await phones[1].locator(".name-card").count()) === 0,
    "the name is optional: Pular dismisses it",
  );
  await phones[1].getByRole("button", { name: "Fazer pergunta" }).click();
  await phones[1].locator(".ask-anytime textarea").fill("Pergunta feita no meio da talk");
  await phones[1].locator(".ask-anytime").getByRole("button", { name: "Mandar pergunta" }).click();
  await phones[1].locator(".ask-anytime").getByText("Pergunta enviada").waitFor();
  await phones[1].locator(".ask-anytime").waitFor({ state: "detached" });
  assert(true, "a question can be sent from any slide through Fazer pergunta");

  await stage.locator(".v-join-qr img").waitFor();
  await stage.waitForFunction(
    () => Number(document.querySelector(".v-join-count .tabular")?.textContent) >= 3,
  );
  assert(true, "join slide shows the QR and counts at least 3 people");
  const scrollWidth = await phones[0].evaluate(() => document.documentElement.scrollWidth);
  assert(scrollWidth <= 375, `phone has no horizontal scroll (scrollWidth ${scrollWidth})`);

  const voiceSlide = slides[voiceIndex];
  const nextSlide = slides[voiceIndex + 1];
  await jump(voiceIndex);
  await presenter.keyboard.press("v");
  await presenter.locator('[data-voice-status]:not([data-voice-status="off"])').waitFor();
  await stage.locator(".status-chip").waitFor();
  assert(true, "V on the presenter turns voice on and the stage mirrors it");

  const spoken = `bom pessoal ${voiceSlide.cues[0]}`;
  await presenter.evaluate((text) => window.__voiceFeed(text, true), spoken);
  await atIndex(stage, voiceIndex + 1);
  await phoneAt(phones[0], voiceIndex + 1);
  assert(
    true,
    `voice cue "${voiceSlide.cues[0]}" advances ${voiceSlide.id} -> ${nextSlide.id} on stage and phones`,
  );
  await presenter
    .locator('.voice-log li[data-kind="action"]', { hasText: "Avançou" })
    .first()
    .waitFor();
  await presenter.locator('.voice-log li[data-kind="heard"]').first().waitFor();
  assert(true, "the presenter's voice log shows what was heard and what it triggered");
  await stage.locator(".cue-hint").waitFor();
  assert(true, "with voice on, the stage shows the current slide's spoken cue");

  await presenter.evaluate((text) => window.__voiceFeed(text, true), nextSlide.cues[0]);
  await presenter.waitForTimeout(500);
  assert(
    (await indexOf(stage, ".stage")) === voiceIndex + 1,
    "the next slide's cue inside the 2s lock does not advance",
  );

  await phones[0]
    .locator(".caption-dock-text")
    .filter({ hasText: spoken })
    .waitFor({ timeout: 8000 });
  assert(true, "final speech reaches the phone caption dock");
  await presenter.evaluate(() => window.__voiceFeed("legenda parcial enquanto falo", false));
  await phones[0]
    .locator(".caption-dock .caption-draft", { hasText: "legenda parcial enquanto falo" })
    .waitFor({ timeout: 8000 });
  assert(true, "interim speech shows on the phone as a draft before the sentence ends");
  const captionsPage = await phones[1].context().newPage();
  await captionsPage.goto(`${base}/legendas`);
  await captionsPage
    .locator(".captions-log p", { hasText: spoken })
    .first()
    .waitFor({ timeout: 8000 });
  await captionsPage.getByRole("button", { name: "Aumentar letra" }).click();
  assert(true, "/legendas shows the caption history with adjustable text size");
  await shot(captionsPage, "captions-page");
  await captionsPage.close();
  await phones[2].getByRole("button", { name: "Legendas" }).click();
  assert(
    (await phones[2].locator(".caption-dock").count()) === 0,
    "the Legendas toggle hides the dock",
  );
  await phones[2].getByRole("button", { name: "Legendas" }).click();
  await stage.keyboard.press("c");
  await stage.locator(".caption-line", { hasText: voiceSlide.cues[0] }).waitFor();
  assert(true, "C on the stage shows the caption line");
  await settle(stage);
  await shot(stage, "flow-stage-caption");
  await shot(phones[0], "phone-ambient-caption");

  await phones[0].getByRole("button", { name: "Uau" }).click();
  await stage.locator(".reaction-float").first().waitFor({ timeout: 5000 });
  await phones[1].getByRole("button", { name: "Faz sentido" }).click();
  await phones[2].getByRole("button", { name: "Polêmico" }).click();
  assert(true, "phone reactions float up on the stage");
  await stage.waitForTimeout(700);
  await shot(stage, "flow-stage-reactions");
  await shot(phones[1], "phone-ambient-reaction-sent");
  await stage.keyboard.press("c");

  const spammer = `e2e${Date.now()}spammer`;
  const first = await convex.mutation(api.reactions.send, { clientId: spammer, kind: "wow" });
  const second = await convex.mutation(api.reactions.send, { clientId: spammer, kind: "wow" });
  assert(
    first === true && second === false,
    "server drops a second reaction from the same client inside 1.5s",
  );

  await presenter.waitForTimeout(1600);
  await presenter.keyboard.press("v");
  await presenter.locator('[data-voice-status="off"]').waitFor();
  await presenter.evaluate((text) => window.__voiceFeed(text, true), nextSlide.cues[0]);
  await presenter.waitForTimeout(500);
  assert((await indexOf(stage, ".stage")) === voiceIndex + 1, "with voice off, a cue does nothing");

  await presenter.keyboard.press("v");
  const cueWords = nextSlide.cues[0].split(" ");
  const head = cueWords.slice(0, 2).join(" ");
  await presenter.evaluate((text) => window.__voiceFeed(text, false), `então ${head}`);
  await presenter.waitForTimeout(200);
  assert(
    (await indexOf(stage, ".stage")) === voiceIndex + 1,
    "half a cue in an interim result does not advance",
  );
  await presenter.evaluate((text) => window.__voiceFeed(text, false), `então ${nextSlide.cues[0]}`);
  await atIndex(stage, voiceIndex + 2);
  assert(
    true,
    `a cue that completes across interim results advances ${nextSlide.id} -> ${slides[voiceIndex + 2].id}`,
  );
  await shot(presenter, "presenter-voice");
  await presenter.keyboard.press("v");

  await stage.keyboard.press("t");
  await stage.locator('.stage[data-theme="light"] .canvas[data-theme="light"]').waitFor();
  await stage.reload();
  await stage.locator('.canvas[data-theme="light"]').waitFor();
  assert(true, "T flips the stage to the light theme and it survives a reload");
  await stage.keyboard.press("t");
  await stage.locator('.canvas[data-theme="dark"]').waitFor();
  await presenter.keyboard.press("t");
  await presenter.locator('.thumb-current .canvas[data-theme="light"]').waitFor();
  assert(
    (await stage.locator('.canvas[data-theme="dark"]').count()) === 1,
    "T on the presenter flips its own thumbnails and leaves the stage dark",
  );
  await presenter.keyboard.press("t");
  await presenter.locator('.thumb-current .canvas[data-theme="dark"]').waitFor();

  const choice = slides[choiceIndex].interaction;
  const [optionA, optionB, optionC, optionD] = choice.options;
  await jump(choiceIndex);
  await phones[0].getByRole("button", { name: optionA.label }).waitFor();
  assert(
    (await phones[0].locator(".vote-dot").count()) === 0,
    "phone shows no results before its own vote",
  );
  await shot(phones[0], "phone-choice-before-vote");
  await phones[0].getByRole("button", { name: optionC.label }).click();
  await phones[1].getByRole("button", { name: optionC.label }).click();
  await phones[2].getByRole("button", { name: optionB.label }).click();
  await phones[2].getByRole("button", { name: optionD.label }).click();
  await phones[2].locator(".choice.is-selected", { hasText: optionD.label }).waitFor();
  assert(true, "a phone can change its vote");
  await phones[0].locator(".you-tag").waitFor();
  await phones[0].waitForFunction(() => document.querySelectorAll(".vote-dot").length === 3);
  assert(true, "after voting, the phone shows the room as 3 dots with its own tagged");
  await stage.locator(".results-status", { hasText: "3 pessoas já votaram" }).waitFor({
    timeout: 8000,
  });
  assert(
    (await stage.locator('.v-results[data-revealed="false"]').count()) === 1,
    "stage shows 3 live votes before the reveal",
  );
  await settle(stage);
  const dotAtThree = await largestDot(stage);
  await shotBothThemes(stage, "poll-03-live");
  await shot(phones[2], "phone-choice-voted");

  await stage.keyboard.press("r");
  await stage.locator('.v-results[data-revealed="true"]').waitFor();
  await stage.locator('.unit-col[data-state="winner"] .unit-share', { hasText: "67%" }).waitFor();
  await stage.locator('.unit-col[data-state="dimmed"] .unit-share', { hasText: "33%" }).waitFor();
  assert(true, `R reveals the poll: "${optionC.label}" leads with 67%`);
  await phones[0]
    .getByTestId("phone-result")
    .filter({ hasText: `Você votou "${optionC.label}", junto com 67% da sala.` })
    .waitFor();
  assert(true, "phones show how they compared after the reveal");
  await settle(stage);
  await shotBothThemes(stage, "poll-03-revealed");
  await shot(phones[0], "phone-choice-result");
  await shot(presenter, "presenter-poll");

  await stage.keyboard.press("r");
  await stage.locator('.v-results[data-revealed="false"]').waitFor();
  const choiceValue = (i) => choice.options[[2, 1, 2, 0, 2, 3, 1][i % 7]].id;
  let seeded = 0;
  for (const total of [8, 20, 40]) {
    await seedVotes(choice.pollId, seeded, total - 3, choiceValue);
    seeded = total - 3;
    await stage
      .locator(".results-status", { hasText: `${total} pessoas já votaram` })
      .waitFor({ timeout: 15000 });
    await settle(stage);
    await shotBothThemes(stage, `poll-${String(total).padStart(2, "0")}-live`);
    if (total === 20) {
      const dotAtTwenty = await largestDot(stage);
      assert(
        dotAtTwenty > 0 && dotAtTwenty < dotAtThree,
        `dots shrink as the room fills (${dotAtThree.toFixed(1)}px at 3 votes, ${dotAtTwenty.toFixed(1)}px at 20)`,
      );
      await shot(phones[2], "phone-choice-voted-20");
    }
  }
  await stage.keyboard.press("r");
  await stage.locator('.v-results[data-revealed="true"]').waitFor();
  await settle(stage);
  await shotBothThemes(stage, "poll-40-revealed");

  const guess = slides[guessIndex].interaction;
  const snap = (fraction) =>
    guess.min + Math.round(((guess.max - guess.min) * fraction) / guess.step) * guess.step;
  const guesses = [snap(0.1), snap(0.3), snap(0.6)];
  await jump(guessIndex);
  for (const [i, phone] of phones.entries()) {
    await phone.locator("#guess-range").fill(String(guesses[i]));
    await phone.getByRole("button", { name: "Enviar chute" }).click();
    await phone.getByRole("button", { name: "Chute enviado" }).waitFor();
  }
  assert(true, "3 phones sent guesses with the slider");
  await stage.locator(".results-status", { hasText: "3 pessoas já chutaram" }).waitFor();
  await phones[0].locator(".guess-strip .you-tag").waitFor();
  assert(
    (await phones[0].locator(".strip-answer").count()) === 0,
    "phone places its guess among the room's dots without the answer",
  );
  await stage
    .locator(".marker-median", { hasText: formatValue(guesses[1], guess.format) })
    .waitFor();
  assert(
    (await stage.locator(".marker-answer").count()) === 0,
    "histogram marks the crowd median and hides the answer",
  );
  await settle(stage);
  await shotBothThemes(stage, "guess-03-live");
  await shot(phones[0], "phone-guess-sent");

  await stage.keyboard.press("r");
  await stage
    .locator(".marker-answer", { hasText: formatValue(guess.answer, guess.format) })
    .waitFor();
  const expected = `Você chutou ${formatValue(guesses[0], guess.format)}, a resposta é ${formatValue(guess.answer, guess.format)}.`;
  await phones[0].getByTestId("phone-result").filter({ hasText: expected }).waitFor();
  assert(true, `reveal draws the answer line and the phone says: ${expected}`);
  await phones[0].locator(".strip-answer").waitFor();
  await settle(stage);
  await shotBothThemes(stage, "guess-03-revealed");
  await shot(phones[0], "phone-guess-result");

  const spread = (i) => snap(0.12 + 0.55 * ((i * 0.618) % 1) ** 2);
  await seedVotes(guess.pollId, 0, 17, spread);
  await stage.locator(".results-status", { hasText: "20 pessoas já chutaram" }).waitFor();
  await settle(stage);
  await shotBothThemes(stage, "guess-20-revealed");
  await shot(phones[0], "phone-guess-result-20");

  await setStageNetwork(false);
  await stage.locator(".connection.is-offline").waitFor({ timeout: 15000 });
  await stage.keyboard.press("ArrowRight");
  await atIndex(stage, guessIndex + 1);
  await stage.keyboard.press("PageDown");
  await atIndex(stage, guessIndex + 2);
  assert(true, "offline stage still navigates locally with arrow and PageDown");
  await settle(stage);
  await shot(stage, "flow-stage-offline");
  await presenter.waitForTimeout(800);
  assert(
    (await indexOf(presenter, ".presenter")) === guessIndex,
    "presenter has not seen the offline moves yet",
  );
  await setStageNetwork(true);
  await atIndex(presenter, guessIndex + 2);
  await phoneAt(phones[0], guessIndex + 2);
  assert(true, "stage reconnects and the queued navigation reaches presenter and phones");

  await jump(questionsIndex);
  const inputSize = await phones[0]
    .locator("textarea")
    .evaluate((element) => getComputedStyle(element).fontSize);
  assert(inputSize === "16px", `phone textarea is 16px so iOS does not zoom (${inputSize})`);
  await phones[0]
    .locator("textarea")
    .fill("Como começo a me posicionar como product engineer ainda na faculdade?");
  await phones[0].getByRole("button", { name: "Mandar pergunta" }).click();
  await phones[0].getByText("Pergunta enviada").waitFor();
  await phones[1].locator("textarea").fill("   IA vai acabar com vaga de júnior?   ");
  await phones[1].getByRole("button", { name: "Mandar pergunta" }).click();
  await phones[1].getByText("Pergunta enviada").waitFor();
  const target = phones[2].locator(".question-list li", { hasText: "vaga de júnior" });
  await target.getByRole("button", { name: "Votar nessa pergunta" }).click();
  await target.locator(".upvote.is-voted").waitFor();
  await stage.locator(".wall-list li").first().filter({ hasText: "vaga de júnior" }).waitFor();
  assert(true, "an upvoted question rises to the top of the wall");
  await stage
    .locator(".wall-list li", { hasText: "posicionar como product engineer" })
    .filter({ hasText: "Ana" })
    .waitFor();
  assert(
    true,
    "a named person's question shows their name on the wall; the unnamed one stays anonymous",
  );
  const ownQuestion = phones[0].locator(".question-list li", {
    hasText: "posicionar como product engineer",
  });
  phones[0].once("dialog", (dialog) => void dialog.accept());
  await ownQuestion.getByRole("button", { name: "Apagar minha pergunta" }).click();
  await stage
    .locator(".wall-list li", { hasText: "posicionar como product engineer" })
    .waitFor({ state: "detached" });
  assert(true, "the author deletes their own question and it leaves the wall");
  await presenter.locator(".roster .roster-names li", { hasText: "Ana" }).waitFor();
  assert(true, "the presenter sees who is in the room by name");
  await settle(stage);
  await shot(stage, "flow-stage-questions");
  await shot(phones[2], "phone-questions");
  await shot(presenter, "presenter-questions");

  await target.getByRole("button", { name: "Tirar voto" }).click();
  await target.locator(".upvote:not(.is-voted)").waitFor();
  assert(true, "upvote toggles off");
  let rejected = false;
  try {
    await convex.mutation(api.questions.ask, {
      clientId: "e2e00000000000000000",
      text: "x".repeat(241),
    });
  } catch {
    rejected = true;
  }
  assert(rejected, "server rejects a question over 240 characters");

  await presenter
    .locator(".moderation li", { hasText: "vaga de júnior" })
    .getByRole("button", { name: "Ocultar" })
    .click();
  await stage
    .locator(".wall-list li", { hasText: "vaga de júnior" })
    .waitFor({ state: "detached" });
  assert(true, "presenter hides a question and it leaves the wall");

  await presenter.keyboard.press("ArrowLeft");
  await presenter.keyboard.press("PageUp");
  await atIndex(stage, questionsIndex - 2);
  assert(true, "presenter keyboard drives the stage");

  let wrongKeyRejected = false;
  try {
    await convex.mutation(api.session.setSlide, { key: "wrong", slideIndex: 0 });
  } catch {
    wrongKeyRejected = true;
  }
  assert(wrongKeyRejected, "presenter mutations reject a wrong key");

  for (const theme of ["dark", "light"]) {
    await convex.mutation(api.session.setSlide, { key, slideIndex: 0 });
    await atIndex(stage, 0);
    if (theme === "light") await stage.keyboard.press("t");
    await stage.locator(`.canvas[data-theme="${theme}"]`).waitFor();
    for (const [i, slide] of slides.entries()) {
      await atIndex(stage, i);
      await settle(stage);
      await shot(stage, `stage-${theme}-${String(i + 1).padStart(2, "0")}-${slide.id}`);
      if (i === 0 && theme === "dark") await shot(phones[0], "phone-choice-join");
      await stage.keyboard.press("ArrowRight");
    }
    await stage.keyboard.press("Space");
    await stage.waitForTimeout(300);
    assert(
      (await indexOf(stage, ".stage")) === lastIndex,
      `navigation clamps at the last slide (${theme} theme)`,
    );
  }

  const adminContext = await browser.newContext();
  const admin = await adminContext.newPage();
  await admin.goto(`${base}/admin?key=wrong`);
  await admin.getByText("Chave inválida.").waitFor();
  assert(
    (await admin.getByRole("button", { name: "Nova sessão" }).count()) === 0,
    "admin hides session controls behind the presenter key",
  );
  await admin.getByLabel("Chave da talk").fill(key);
  await admin.getByRole("button", { name: "Entrar" }).click();
  await admin.getByRole("button", { name: "Nova sessão" }).waitFor();
  await admin.goto(`${base}/admin`);
  await admin.getByRole("button", { name: "Nova sessão" }).waitFor();
  assert(true, "a key typed into /admin is remembered by this browser without a URL");
  const keyedTab = await adminContext.newPage();
  await keyedTab.goto(`${base}/presenter?key=${encodeURIComponent(key)}`);
  await keyedTab.waitForFunction(() => !window.location.search.includes("key="));
  assert(true, "?key= is stripped from the address bar after it is stored");
  await keyedTab.close();
  admin.once("dialog", (dialog) => void dialog.accept());
  await admin.getByRole("button", { name: "Nova sessão" }).click();
  await admin.getByRole("status").filter({ hasText: "Sessão nova pronta" }).waitFor();
  await atIndex(stage, 0);
  assert(true, "admin Nova sessão resets the room and rewinds the stage to slide 1");
  await shot(admin, "admin");
  await adminContext.close();

  assert(errors.length === 0, `no page errors${errors.length ? `: ${errors.join(" | ")}` : ""}`);
  console.log(`\nScreenshots (${shots.length}):\n${shots.join("\n")}`);
} finally {
  await browser.close();
}
