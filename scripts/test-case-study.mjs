import { writeFile } from "node:fs/promises";

/*
 * Browser check for the PortfolioOS content windows, driven over the Chrome
 * DevTools Protocol against a running server:
 *
 *   chrome --remote-debugging-port=9223 --user-data-dir=<temp dir>
 *   node scripts/test-case-study.mjs [debugPort=9223] [url=http://localhost:3001] [screenshot.png]
 *
 * Nothing here knows what the portfolio contains. Every expectation is read
 * from the content the page itself was handed (window.portfolioOsContent) or
 * from the public APIs, so the check passes on any data set — an empty
 * database included — and fails when a window disagrees with the data behind
 * it. It only reads: nothing is created, edited or deleted.
 */

const debugPort = process.argv[2] ?? "9223";
const debugUrl = `http://127.0.0.1:${debugPort}`;
const portfolioUrl = process.argv[3] ?? "http://localhost:3001";
const screenshotPath = process.argv[4];

const delay = (milliseconds) =>
  new Promise((resolve) => setTimeout(resolve, milliseconds));

const targets = await fetch(`${debugUrl}/json/list`).then((response) =>
  response.json(),
);
const page = targets.find((target) => target.type === "page");

if (!page) {
  throw new Error(`No browser page found on ${debugUrl}`);
}

const socket = new WebSocket(page.webSocketDebuggerUrl);
const pending = new Map();
const pageErrors = [];
let sequence = 0;

await new Promise((resolve, reject) => {
  socket.addEventListener("open", resolve, { once: true });
  socket.addEventListener("error", reject, { once: true });
});

socket.addEventListener("message", (event) => {
  const message = JSON.parse(String(event.data));
  if (message.method === "Runtime.exceptionThrown") {
    const details = message.params.exceptionDetails;
    pageErrors.push(details.exception?.description ?? details.text);
    return;
  }
  const request = pending.get(message.id);

  if (!request) return;

  pending.delete(message.id);
  if (message.error) request.reject(new Error(message.error.message));
  else request.resolve(message.result);
});

function send(method, params = {}) {
  return new Promise((resolve, reject) => {
    const id = ++sequence;
    pending.set(id, { resolve, reject });
    socket.send(JSON.stringify({ id, method, params }));
  });
}

await send("Page.enable");
await send("Runtime.enable");
await send("Page.navigate", { url: portfolioUrl });
await delay(900);

const expression = `
  (async () => {
    const delay = (milliseconds) =>
      new Promise((resolve) => setTimeout(resolve, milliseconds));
    const waitFor = async (selector, timeout = 6000) => {
      const started = performance.now();
      while (performance.now() - started < timeout) {
        const element = document.querySelector(selector);
        if (element) return element;
        await delay(50);
      }
      throw new Error("Timed out waiting for " + selector);
    };
    const checks = [];
    const check = (name, pass, detail = "") => checks.push({ name, pass: Boolean(pass), detail: String(detail) });
    const icon = (id) => document.querySelector('.dicon[data-id="' + id + '"]');
    const windowOf = (id) => document.querySelector('.win[data-id="' + id + '"]');
    const openIcon = async (id) => {
      icon(id).dispatchEvent(new KeyboardEvent("keydown", { key: "Enter", bubbles: true }));
      return waitFor('.win[data-id="' + id + '"]');
    };
    const labels = (root) => [...root.querySelectorAll(".ex-item .ex-lb")].map((label) => label.textContent);

    await waitFor(".dicon[data-id=projects]");
    const boot = document.querySelector("#boot");
    if (boot && getComputedStyle(boot).display !== "none") {
      for (let index = 0; index < 3; index += 1) {
        boot.dispatchEvent(new PointerEvent("pointerdown", { bubbles: true }));
        await delay(300);
      }
      await delay(1600);
    }
    [...document.querySelectorAll(".win")]
      .find((win) => win.querySelector(".tb-text")?.textContent === "Welcome to PortfolioOS")
      ?.querySelector(".dlg-btns .btn")?.click();

    const content = window.portfolioOsContent;
    check("content handed to the runtime", content && Array.isArray(content.projects));

    /* ---- Projects and the case study ---- */
    const projects = await openIcon("projects");
    check("Projects lists every published project", labels(projects).length === content.projects.length,
      labels(projects).length + " of " + content.projects.length);

    const KNOWN_TABS = ["Overview", "Challenge", "Solution", "Architecture", "Results", "Preview"];
    if (content.projects.length) {
      const project = content.projects.find((p) => p.caseStudy.captions.length > 1) ?? content.projects[0];
      const c = project.caseStudy;
      const has = {
        overview: true,
        challenge: Boolean(c.problem || c.responsibilities.length || c.duration || c.team),
        solution: c.solution.length > 0,
        architecture: Boolean(c.architecture.length || c.architectureNote),
        results: Boolean(c.result || c.metrics.length),
        screenshots: c.captions.length > 0,
      };
      [...projects.querySelectorAll(".ex-item")]
        .find((item) => item.querySelector(".ex-lb").textContent === project.file)
        .dispatchEvent(new MouseEvent("dblclick", { bubbles: true }));
      const caseWindow = await waitFor('.win[data-id="proj-' + project.id + '"]');
      const tabs = [...caseWindow.querySelectorAll(".case-tab")];
      check("case study shows all six tabs in order", tabs.map((tab) => tab.textContent).join() === KNOWN_TABS.join(),
        tabs.map((tab) => tab.textContent).join());
      for (const tab of tabs) {
        tab.click();
        const panel = caseWindow.querySelector('[data-panel="' + tab.dataset.tab + '"]');
        const empty = Boolean(panel.querySelector(".case-empty"));
        check("tab " + tab.textContent + " matches its data", !panel.hidden && empty === !has[tab.dataset.tab],
          has[tab.dataset.tab] ? "has material" : "empty state");
      }
      if (c.captions.length > 1) {
        caseWindow.querySelector('.case-tab[data-tab="screenshots"]').click();
        caseWindow.querySelectorAll(".gallery-thumb")[1].click();
        check("preview gallery switches screenshots",
          caseWindow.querySelector(".gallery-main img").dataset.shot === "1" &&
            caseWindow.querySelector(".gallery-caption").textContent === c.captions[1]);
      }
      const demo = caseWindow.querySelector(".pj-actions a.btn");
      check("live demo link follows the data", project.demo
        ? caseWindow.querySelector('.pj-actions a[href="' + project.demo + '"]')
        : !demo || demo.textContent !== "Live demo");
      check("case study has a Refresh button", caseWindow.querySelector('.pj-actions [data-a="refresh"]'));
    }

    /* ---- the CRT menu check the original script carried ---- */
    document.querySelector("#desktop").dispatchEvent(new MouseEvent("contextmenu", { bubbles: true, clientX: 320, clientY: 180 }));
    const crtMenuItem = [...document.querySelectorAll(".ctx .mi")].find((item) => item.textContent === "CRT scanline filter");
    const before = crtMenuItem ? getComputedStyle(crtMenuItem, "::before") : null;
    const after = crtMenuItem ? getComputedStyle(crtMenuItem, "::after") : null;
    check("CRT menu item draws a pixel check mark",
      crtMenuItem?.classList.contains("checked") && before?.content === '""' && after?.content === '""' &&
        parseFloat(before.width) === 5 && parseFloat(after.width) === 9 && getComputedStyle(crtMenuItem).boxShadow === "none");
    crtMenuItem?.click();

    /* ---- Certificates, Experience and Education: one app per table ---- */
    const FOLDERS = {
      certs: ["certificate", "award"],
      experience: ["experience"],
      education: ["education"],
    };
    const folderIcons = [];
    for (const [id, kinds] of Object.entries(FOLDERS)) {
      const expected = content.credentials.filter((entry) => kinds.includes(entry.kind));
      check(id + " icon appears only with entries", Boolean(icon(id)) === expected.length > 0, expected.length + " entries");
      if (!expected.length) continue;
      folderIcons.push(icon(id).querySelector(".di-img").innerHTML);
      const folder = await openIcon(id);
      check(id + " lists its own entries", labels(folder).length === expected.length, labels(folder).length + " of " + expected.length);
      folder.querySelector(".ex-item").dispatchEvent(new MouseEvent("dblclick", { bubbles: true }));
      const dialog = await waitFor('.win[data-id^="cred-"]');
      check(id + " properties open", [...dialog.querySelectorAll("dt")].map((dt) => dt.textContent).includes("Title"));
      dialog.querySelector('[data-a="ok"]').click();
    }
    check("credential apps have distinct icons", new Set(folderIcons).size === folderIcons.length);

    /* ---- Publications ---- */
    check("Publications icon appears only with entries", Boolean(icon("publications")) === content.publications.length > 0);
    if (content.publications.length) {
      const library = await openIcon("publications");
      const items = [...library.querySelectorAll(".pub-item")];
      check("Publications lists every entry", items.length === content.publications.length);
      check("Publications preview is visible", library.querySelector(".pub-paper h2")?.textContent);
      const pick = items.length > 1 ? 1 : 0;
      items[pick].click();
      library.querySelector('[data-a="details"]').click();
      const detail = await waitFor('.win[data-id^="publication-"] .pub-detail-cover');
      check("publication details match the selection", detail.textContent.includes(content.publications[pick].title));
    }

    /* ---- the two logs stay separate ---- */
    const changelog = (await openIcon("changelog"));
    await delay(400);
    const changelogText = changelog.querySelector(".npad").textContent;
    check("Changelog.log is its own log", changelogText.includes("CHANGELOG.LOG") && !changelogText.includes("CAREER.LOG"));
    check("Changelog.log carries every entry", content.changelog.every((entry) => changelogText.includes(entry.text)));
    const careerText = (await openIcon("career-log")).querySelector(".npad").textContent;
    check("Career.log carries every entry", careerText.includes("CAREER.LOG") &&
      (content.career.length ? content.career.every((entry) => careerText.includes(entry.text)) : careerText.includes("No career milestones")));

    /* ---- Skills.exe and the résumé ---- */
    const skills = await openIcon("skills");
    check("Skills.exe lists every skill", skills.querySelectorAll(".sk-files li").length === content.skills.length);
    const resumeText = (await openIcon("resume")).textContent;
    check("résumé sections follow the data",
      resumeText.includes("SELECTED PROJECTS") === content.projects.length > 0 &&
        resumeText.includes("EXPERIENCE") === content.credentials.some((entry) => entry.kind === "experience") &&
        resumeText.includes("EDUCATION") === content.credentials.some((entry) => entry.kind === "education"));

    /* ---- Testimonial Express, one page per message ---- */
    const firstPage = await (await fetch("/api/testimonials?page=1&limit=1")).json();
    document.querySelector("#testbtn").click();
    const inbox = await waitFor(".app-inbox");
    const preview = inbox.querySelector(".ib-prev");
    check("testimonial detail starts hidden", preview.hidden);
    for (let index = 0; index <= firstPage.total; index += 1) {
      inbox.querySelector('[data-a="sr"]').click();
      await delay(900);
    }
    check("Send/Receive delivers every testimonial", inbox.querySelectorAll(".msg-row").length === firstPage.total,
      inbox.querySelectorAll(".msg-row").length + " of " + firstPage.total);
    if (firstPage.total) {
      inbox.querySelector(".msg-row").click();
      check("testimonial detail opens on selection",
        !preview.hidden && preview.querySelector(".prev-hdr") && !preview.textContent.includes("undefined"));
    }

    /* ---- Refresh reads the server again ---- */
    const fresh = await (await fetch("/api/portfolio", { cache: "no-store" })).json();
    projects.querySelector('[data-a="ref"]').click();
    await delay(1500);
    check("Refresh re-reads the projects", labels(windowOf("projects")).length === fresh.content.projects.length);

    check("no demo placeholders on screen", !/\\[DEMO\\]|\\[Demo\\]|\\(Demo\\)/.test(document.body.innerText));
    return checks;
  })()
`;

const evaluation = await send("Runtime.evaluate", {
  expression,
  awaitPromise: true,
  returnByValue: true,
});

if (evaluation.exceptionDetails) {
  throw new Error(
    evaluation.exceptionDetails.exception?.description ??
      evaluation.exceptionDetails.text,
  );
}

const checks = evaluation.result.value;
checks.push({ name: "no uncaught page errors", pass: pageErrors.length === 0, detail: pageErrors.join(" | ") });
const passed = checks.every((item) => item.pass);

for (const item of checks) {
  console.log(`${item.pass ? "PASS" : "FAIL"}  ${item.name}${item.detail ? `  (${item.detail})` : ""}`);
}
console.log(passed ? "\nAll checks passed." : "\nSome checks failed.");

if (screenshotPath) {
  const screenshot = await send("Page.captureScreenshot", {
    format: "png",
    fromSurface: true,
  });
  await writeFile(screenshotPath, Buffer.from(screenshot.data, "base64"));
}

socket.close();

if (!passed) process.exitCode = 1;
