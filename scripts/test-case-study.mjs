import { writeFile } from "node:fs/promises";

const debugPort = process.argv[2] ?? "9223";
const debugUrl = `http://127.0.0.1:${debugPort}`;
const portfolioUrl = process.argv[3] ?? "http://localhost:3001";
const screenshotPath = process.argv[4];

const delay = (milliseconds) =>
  new Promise((resolve) => setTimeout(resolve, milliseconds));

const targets = await fetch(`${debugUrl}/json/list`).then((response) =>
  response.json(),
);
const page = targets.find(
  (target) => target.type === "page" && target.url.startsWith("http"),
);

if (!page) {
  throw new Error(`No browser page found on ${debugUrl}`);
}

const socket = new WebSocket(page.webSocketDebuggerUrl);
const pending = new Map();
let sequence = 0;

await new Promise((resolve, reject) => {
  socket.addEventListener("open", resolve, { once: true });
  socket.addEventListener("error", reject, { once: true });
});

socket.addEventListener("message", (event) => {
  const message = JSON.parse(String(event.data));
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
    const waitFor = async (selector, timeout = 5000) => {
      const started = performance.now();
      while (performance.now() - started < timeout) {
        const element = document.querySelector(selector);
        if (element) return element;
        await delay(50);
      }
      const scripts = [...document.scripts]
        .map((script) => script.src || "inline")
        .join(", ");
      throw new Error(
        "Timed out waiting for " +
          selector +
          "; readyState=" +
          document.readyState +
          "; scripts=" +
          scripts,
      );
    };

    const projectIcon = await waitFor(".dicon[data-id=projects]");
    const boot = document.querySelector("#boot");
    if (boot && getComputedStyle(boot).display !== "none") {
      boot.dispatchEvent(new PointerEvent("pointerdown", { bubbles: true }));
      await delay(80);
      boot.dispatchEvent(new PointerEvent("pointerdown", { bubbles: true }));
      await delay(1400);
    }

    await delay(450);

    const welcome = [...document.querySelectorAll(".win")].find(
      (windowElement) =>
        windowElement.querySelector(".tb-text")?.textContent ===
        "Welcome to PortfolioOS",
    );
    welcome?.querySelector(".dlg-btns .btn")?.click();

    const iconBounds = projectIcon.getBoundingClientRect();
    for (let index = 0; index < 2; index += 1) {
      const options = {
        bubbles: true,
        button: 0,
        clientX: iconBounds.left + 12,
        clientY: iconBounds.top + 12,
        pointerId: index + 1,
        pointerType: "mouse",
      };
      projectIcon.dispatchEvent(new PointerEvent("pointerdown", options));
      projectIcon.dispatchEvent(new PointerEvent("pointerup", options));
      await delay(60);
    }
    const firstProject = await waitFor(".app-expl .ex-item");
    firstProject.dispatchEvent(new MouseEvent("dblclick", { bubbles: true }));
    const caseWindow = await waitFor(".app-proj");
    const tabs = [...caseWindow.querySelectorAll(".case-tab")];

    tabs.find((tab) => tab.dataset.tab === "architecture")?.click();
    const architectureVisible = Boolean(
      caseWindow.querySelector("[data-panel=architecture]") &&
        !caseWindow.querySelector("[data-panel=architecture]").hidden,
    );

    tabs.find((tab) => tab.dataset.tab === "screenshots")?.click();
    const secondThumb = caseWindow.querySelectorAll(".gallery-thumb")[1];
    secondThumb.click();

    return {
      title: caseWindow.closest(".win").querySelector(".tb-text").textContent,
      tabCount: tabs.length,
      tabLabels: tabs.map((tab) => tab.textContent),
      architectureVisible,
      screenshotsVisible: !caseWindow.querySelector(
        "[data-panel=screenshots]",
      ).hidden,
      activeThumb: secondThumb.classList.contains("on"),
      mainShotChanged: caseWindow
        .querySelector(".gallery-main img")
        .dataset.shot === "1",
      hasLiveDemo: Boolean(caseWindow.querySelector('.pj-actions a[href*="vercel.app"]')),
      status: caseWindow
        .closest(".win")
        .querySelector(".statusbar .sb").textContent,
    };
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

const report = evaluation.result.value;
// A case study renders a section only when it has material for it, so the tab
// strip is a subset of the known set rather than a fixed list. Assert the shape:
// known labels, canonical order, always opening on Overview and ending on Preview.
const knownTabs = [
  "Overview",
  "Challenge",
  "Solution",
  "Architecture",
  "Results",
  "Preview",
];
const positions = report.tabLabels.map((label) => knownTabs.indexOf(label));
const orderedSubset =
  positions.every((position) => position !== -1) &&
  positions.every((position, index) => index === 0 || position > positions[index - 1]);

const passed =
  report.tabCount === report.tabLabels.length &&
  orderedSubset &&
  report.tabLabels[0] === "Overview" &&
  report.tabLabels[report.tabLabels.length - 1] === "Preview" &&
  report.architectureVisible &&
  report.screenshotsVisible &&
  report.activeThumb &&
  report.mainShotChanged &&
  report.hasLiveDemo;

console.log(JSON.stringify({ passed, ...report }, null, 2));

if (screenshotPath) {
  const screenshot = await send("Page.captureScreenshot", {
    format: "png",
    fromSurface: true,
  });
  await writeFile(screenshotPath, Buffer.from(screenshot.data, "base64"));
}

socket.close();

if (!passed) process.exitCode = 1;
