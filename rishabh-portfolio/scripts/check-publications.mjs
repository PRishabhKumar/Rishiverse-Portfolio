import { chromium, devices } from "playwright";
import AxeBuilder from "@axe-core/playwright";
import assert from "node:assert/strict";
import { readFile, writeFile } from "node:fs/promises";
import { createHash } from "node:crypto";
import { publication, project, verse } from "../src/publications.js";

const URL = "http://127.0.0.1:5173/?intro=skip";
const browser = await chromium.launch({
  args: ["--no-sandbox", "--enable-unsafe-swiftshader"],
});
const context = await browser.newContext({
  viewport: { width: 1440, height: 900 },
  reducedMotion: "no-preference",
  colorScheme: "light",
});
const page = await context.newPage();
const result = { errors: [], checks: [], layouts: [], audits: [], scrub: [] };
page.on("pageerror", (error) => result.errors.push(error.message));
page.on("console", (message) => {
  if (message.type() === "error") result.errors.push(message.text());
});
page.on("response", (response) => {
  if (response.status() >= 400)
    result.errors.push(`${response.status()} ${response.url()}`);
});
const audit = async (name) => {
  const report = await new AxeBuilder({ page })
    .withTags(["wcag2a", "wcag2aa", "wcag21aa"])
    .analyze();
  result.audits.push({
    name,
    violations: report.violations.map((v) => ({
      id: v.id,
      nodes: v.nodes.map((n) => ({
        target: n.target,
        summary: n.failureSummary,
      })),
    })),
  });
};
await page.goto(URL, { waitUntil: "networkidle" });
await page.waitForSelector("#publications");

// Placement: after Selected Work, before About, and reachable from the navigation.
const order = await page.evaluate(() =>
  [...document.querySelectorAll("main > section")].map((section) => section.id),
);
assert.deepEqual(order.slice(0, 4), ["home", "work", "publications", "about"]);
assert.equal(
  await page.locator('.desktop-nav a[href="#publications"]').innerText(),
  "Publications",
);
assert.equal(
  (await page.locator(".mobile-nav a", { hasText: "Publications" }).count()) >
    0 ||
    (await page.locator('.desktop-nav a[href="#publications"]').count()) === 1,
  true,
);
result.checks.push(
  "A dedicated Publications section sits between work and about, with navigation and heading links.",
);

// Section identity and content.
assert.equal(
  await page.locator("#publications .section-number").innerText(),
  "02",
);
assert.match(
  await page.locator("#publications-heading").innerText(),
  /Written down/,
);
assert.equal(verse.tokens.length, 11);
const patentTitle = await page.locator(".pub-patent-title").innerText();
assert.ok(patentTitle.includes("TACTILE AND VOICE NAVIGATION"));
assert.ok(patentTitle.includes("HIERARCHICALLY STRUCTURED TEXT"));
assert.match(
  await page.locator(".pub-card-patent .pub-areas").innerText(),
  /Recitation assessment/,
);
assert.equal(await page.locator(".pub-project-name").innerText(), "Swadhyay");
assert.match(
  await page.locator(".pub-card-project .pub-note").innerText(),
  /work section once the platform is complete/i,
);
assert.equal(await page.locator(".pub-word").count(), 11);
assert.match(
  await page.locator(".pub-chips").innerText(),
  /पाण्डवाः \+ च \+ एव/,
);
assert.match(await page.locator(".pub-chips").innerText(), /किम् \+ अकुर्वत/);
result.checks.push(
  "Patent scope, the Swadhyay research card, the deferred engineering write-up, and the derived verse splits are all present.",
);

// Scroll-driven decomposition: progress travels 0 → 1 and reveals in stage order.
const scrub = async (fraction) => {
  await page.evaluate((value) => {
    const stage = document.querySelector(".pub-stage");
    const sticky = document.querySelector(".pub-stage-sticky");
    const top = stage.getBoundingClientRect().top + scrollY;
    const travel = Math.max(1, stage.offsetHeight - sticky.offsetHeight);
    scrollTo({ top: top - 98 + travel * value, behavior: "instant" });
  }, fraction);
  await page.waitForTimeout(180);
  return page.evaluate(() => ({
    progress: Number(
      getComputedStyle(
        document.querySelector("#publications"),
      ).getPropertyValue("--stage-scroll"),
    ),
    stage: Number(document.querySelector("#publications").dataset.stage),
    tokenGap: parseFloat(
      getComputedStyle(document.querySelector(".pub-devanagari")).rowGap,
    ),
    firstWord: Number(
      getComputedStyle(document.querySelectorAll(".pub-word")[0]).opacity,
    ),
    lastWord: Number(
      getComputedStyle(document.querySelectorAll(".pub-word")[10]).opacity,
    ),
    compound: Number(
      getComputedStyle(document.querySelector(".pub-compound")).opacity,
    ),
    access: Number(
      getComputedStyle(document.querySelector(".pub-access-mode")).opacity,
    ),
    railFill: getComputedStyle(
      document.querySelectorAll(".pub-rail-step > i")[4],
      "::after",
    ).transform,
  }));
};
const start = await scrub(0);
const middle = await scrub(0.55);
const end = await scrub(1);
assert.ok(
  start.progress < 0.05 && start.lastWord < 0.05 && start.compound < 0.05,
);
assert.ok(
  middle.progress > 0.4 && middle.firstWord > 0.9 && middle.lastWord < 0.6,
);
assert.ok(
  end.progress > 0.97 &&
    end.lastWord > 0.95 &&
    end.compound > 0.95 &&
    end.access > 0.95,
);
assert.ok(end.tokenGap > start.tokenGap + 5, "tokens did not separate");
assert.notEqual(start.railFill, end.railFill);
assert.deepEqual([start.stage, middle.stage, end.stage], [1, 3, 5]);
result.scrub = [start, middle, end];
result.checks.push(
  "Scrolling the stage drives the split, meanings, grammar, and access reveals, with the rail and token spacing following the same progress.",
);
await audit("Publications, light desktop");

// Geometry across widths: nothing overflows, nothing is clipped in either layout.
for (const [width, height] of [
  [320, 568],
  [375, 667],
  [390, 844],
  [430, 932],
  [768, 1024],
  [850, 768],
  [1024, 768],
  [1280, 800],
  [1366, 768],
  [1440, 900],
  [1920, 1080],
  [844, 390],
]) {
  await page.setViewportSize({ width, height });
  await page.waitForTimeout(170);
  const metrics = await page.evaluate(() => {
    const section = document.getElementById("publications");
    const stage = section.querySelector(".pub-stage");
    const sticky = section.querySelector(".pub-stage-sticky");
    const words = section.querySelector(".pub-words");
    return {
      fit: stage.getAttribute("data-fit"),
      doc: document.documentElement.scrollWidth,
      panelClipped: sticky.scrollHeight > sticky.clientHeight + 1,
      wordsClipped: words.scrollHeight > words.clientHeight + 1,
      headerHeight: document.querySelector(".header").getBoundingClientRect()
        .height,
      top: Math.round(sticky.getBoundingClientRect().top),
      cardTitles: section.querySelectorAll(
        ".pub-patent-title, .pub-project-name",
      ).length,
    };
  });
  assert.equal(
    metrics.doc,
    width,
    `horizontal overflow at ${width}`,
    JSON.stringify(metrics),
  );
  assert.equal(
    metrics.panelClipped,
    false,
    `panel clipped at ${width}x${height}`,
  );
  assert.equal(
    metrics.wordsClipped,
    false,
    `word list clipped at ${width}x${height}`,
  );
  assert.equal(metrics.cardTitles, 2);
  result.layouts.push({ width, height, fit: metrics.fit, overflow: false });
}
// While pinned, the panel must clear the sticky site header.
await page.setViewportSize({ width: 1440, height: 900 });
await page.waitForTimeout(220);
await scrub(0.5);
const pinned = await page.evaluate(() => ({
  fit: document.querySelector(".pub-stage").getAttribute("data-fit"),
  top: Math.round(
    document.querySelector(".pub-stage-sticky").getBoundingClientRect().top,
  ),
  header: document.querySelector(".header").getBoundingClientRect().height,
  viewport: innerHeight,
  bottom: Math.round(
    document.querySelector(".pub-stage-sticky").getBoundingClientRect().bottom,
  ),
}));
assert.equal(pinned.fit, "sticky");
assert.ok(
  pinned.top >= pinned.header - 1 && pinned.bottom <= pinned.viewport,
  JSON.stringify(pinned),
);
result.checks.push(
  "While pinned, the panel stays fully inside the viewport and clear of the sticky header.",
);
await page.setViewportSize({ width: 390, height: 844 });
await page.waitForTimeout(200);
await page.screenshot({ path: "qa/pub-mobile.png", fullPage: false });
await page.setViewportSize({ width: 1440, height: 900 });
await page.emulateMedia({ colorScheme: "dark" });
await page.evaluate(() => {
  document.documentElement.dataset.theme = "dark";
  localStorage.setItem("rishabh-theme", "dark");
});
await page.waitForTimeout(220);
await scrub(1);
await page.screenshot({ path: "qa/pub-dark.png" });
await audit("Publications, dark desktop");
await page.setViewportSize({ width: 390, height: 844 });
await page.waitForTimeout(230);
// Reveal every row so the audit measures the finished state, not a fade in progress.
await page.evaluate(() => {
  const stage = document.querySelector(".pub-stage");
  const top = stage.getBoundingClientRect().top + scrollY;
  scrollTo({
    top: top + stage.offsetHeight - innerHeight * 0.55,
    behavior: "instant",
  });
});
await page.waitForFunction(
  () =>
    Number(
      getComputedStyle(
        document.querySelector("#publications"),
      ).getPropertyValue("--stage-scroll"),
    ) > 0.98,
);
await page.waitForTimeout(180);
await audit("Publications, dark mobile");
await page.screenshot({ path: "qa/pub-dark-mobile.png" });
await page.setViewportSize({ width: 1440, height: 900 });
await page.emulateMedia({ colorScheme: "light" });
await page.evaluate(() => {
  document.documentElement.dataset.theme = "light";
  localStorage.setItem("rishabh-theme", "light");
});
await page.waitForTimeout(200);
await context.close();

// Reduced motion: the same content, presented without scrubbing.
const reducedContext = await browser.newContext({
  viewport: { width: 1280, height: 900 },
  reducedMotion: "reduce",
});
const reduced = await reducedContext.newPage();
reduced.on("pageerror", (error) => result.errors.push(error.message));
await reduced.goto(URL, { waitUntil: "networkidle" });
await reduced.waitForSelector("#publications");
await reduced.locator("#publications").scrollIntoViewIfNeeded();
const staticView = await reduced.evaluate(() => ({
  progress: Number(
    getComputedStyle(document.querySelector("#publications")).getPropertyValue(
      "--stage-scroll",
    ),
  ),
  position: getComputedStyle(document.querySelector(".pub-stage-sticky"))
    .position,
  lastWord: Number(
    getComputedStyle(document.querySelectorAll(".pub-word")[10]).opacity,
  ),
  compound: Number(
    getComputedStyle(document.querySelector(".pub-compound")).opacity,
  ),
}));
assert.equal(staticView.progress, 1);
assert.equal(staticView.position, "static");
assert.equal(staticView.lastWord, 1);
assert.equal(staticView.compound, 1);
const reducedAudit = await new AxeBuilder({ page: reduced })
  .withTags(["wcag2a", "wcag2aa", "wcag21aa"])
  .analyze();
result.audits.push({
  name: "Publications, reduced motion",
  violations: reducedAudit.violations,
});
result.checks.push(
  "Reduced motion shows the whole decomposition immediately, without pinning or scrub animation.",
);
await reducedContext.close();
await browser.close();

// Project imagery and the other approved assets are untouched.
const preserved = JSON.parse(
  await readFile("qa/pre-location-preserved.json", "utf8"),
);
for (const [path, hash] of Object.entries(preserved)) {
  assert.equal(
    createHash("sha256")
      .update(await readFile(path))
      .digest("hex"),
    hash,
    path,
  );
}
result.checks.push(
  `All ${Object.keys(preserved).length} protected project images and portfolio assets are byte-for-byte unchanged.`,
);
assert.equal(result.errors.length, 0);
const failing = result.audits.filter((item) => item.violations.length);
assert.equal(
  failing.length,
  0,
  `Accessibility violations: ${JSON.stringify(failing.map((item) => ({ name: item.name, ids: item.violations.map((v) => v.id), targets: item.violations.flatMap((v) => v.nodes.map((n) => n.target)) })))}`,
);
await writeFile(
  "qa/publications-results.json",
  JSON.stringify(result, null, 2),
);
console.log(JSON.stringify(result, null, 2));
