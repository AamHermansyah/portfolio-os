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
  (target) => target.type === "page" && target.webSocketDebuggerUrl,
);

if (!page) throw new Error(`No browser page found on ${debugUrl}`);

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
    const delay = milliseconds => new Promise(resolve => setTimeout(resolve, milliseconds));
    const waitUntil = async (read, message, timeout = 6000) => {
      const started = performance.now();
      while (performance.now() - started < timeout) {
        const value = read();
        if (value) return value;
        await delay(50);
      }
      throw new Error('Timed out waiting for ' + message);
    };
    const activateDesktopIcon = async icon => {
      const bounds = icon.getBoundingClientRect();
      for (let index = 0; index < 2; index += 1) {
        const options = {
          bubbles: true,
          button: 0,
          clientX: bounds.left + 12,
          clientY: bounds.top + 12,
          pointerId: index + 1,
          pointerType: 'mouse'
        };
        icon.dispatchEvent(new PointerEvent('pointerdown', options));
        icon.dispatchEvent(new PointerEvent('pointerup', options));
        await delay(60);
      }
    };
    const command = async (input, value) => {
      input.value = value;
      input.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter', bubbles: true }));
      await delay(40);
    };
    const findWindow = id => document.querySelector('.win[data-id="' + id + '"]');
    const findButton = (root, text) => [...root.querySelectorAll('button')]
      .find(button => button.textContent === text);

    await waitUntil(() => document.querySelector('.dicon[data-id="terminal"]'), 'terminal icon');
    const boot = document.querySelector('#boot');
    if (boot && getComputedStyle(boot).display !== 'none') {
      boot.dispatchEvent(new PointerEvent('pointerdown', { bubbles: true }));
      await delay(80);
      boot.dispatchEvent(new PointerEvent('pointerdown', { bubbles: true }));
      await delay(1400);
    }
    document.querySelector('.dlg-btns .btn')?.click();

    const careerFields = [
      { name: 'year', label: 'Year', type: 'int', min: 1970, ceiling: 2100 },
      { name: 'text', label: 'Entry', type: 'text', max: 400 },
      { name: 'published', label: 'Published', type: 'bool', optional: true, fallback: true },
      { name: 'sortIndex', label: 'Sort index', type: 'int', optional: true, fallback: 0 }
    ];
    const careerColumns = [
      { field: 'year', width: 8, header: 'YEAR' },
      { field: 'text', width: 62, header: 'ENTRY' }
    ];
    const hireColumns = [
      { field: 'createdAt', width: 18, header: 'RECEIVED' },
      { field: 'name', width: 22, header: 'NAME' }
    ];
    const rows = {
      career: Array.from({ length: 11 }, (_, index) => ({
        id: 'career-' + (index + 1),
        year: 2026 - index,
        text: 'Career entry ' + (index + 1),
        published: true,
        sortIndex: index
      })),
      hire: [{
        id: 'hire-1', kind: 'inquiry', name: 'Ada Lovelace',
        email: 'ada@example.com', projectType: 'Web application',
        createdAt: '2026-09-11T03:00:00.000Z', readAt: null
      }]
    };
    const specs = {
      career: {
        id: 'career', label: 'Career.log timeline', readOnly: false,
        fields: careerFields, columns: careerColumns
      },
      hire: {
        id: 'hire', label: 'Hire_Me.exe submissions', readOnly: true,
        fields: [], columns: hireColumns
      }
    };
    let deleteCalls = 0;
    window.portfolioOsAdmin = {
      async login(username) {
        return {
          ok: true,
          session: {
            token: 'admin-ui-test-token', expiresAt: Date.now() + 1800000,
            username, displayName: 'UI Test Admin',
            resources: [
              { id: 'career', status: 'ready', label: 'Career.log timeline' },
              { id: 'hire', status: 'ready', label: 'Hire_Me.exe submissions (read only)' }
            ]
          }
        };
      },
      async setup() { return { ok: false, error: 'already_setup' }; },
      async reset() { return { ok: false, error: 'credentials' }; },
      async needsSetup() { return false; },
      crud: {
        async info(token, resource) {
          return specs[resource]
            ? { ok: true, resource: specs[resource] }
            : { ok: false, error: 'unknown_resource' };
        },
        async list(token, resource, requestedPage, pageSize) {
          const collection = rows[resource] || [];
          const pages = Math.max(1, Math.ceil(collection.length / pageSize));
          const page = Math.min(Math.max(1, Number(requestedPage) || 1), pages);
          return {
            ok: true,
            rows: collection.slice((page - 1) * pageSize, page * pageSize),
            total: collection.length, page, pages, pageSize,
            columns: specs[resource].columns,
            label: specs[resource].label,
            readOnly: specs[resource].readOnly
          };
        },
        async get(token, resource, key) {
          const row = (rows[resource] || []).find(item => item.id === key);
          return row
            ? { ok: true, row: { ...row }, fields: specs[resource].fields, label: specs[resource].label }
            : { ok: false, error: 'not_found' };
        },
        async create(token, resource, values) {
          const row = {
            id: 'career-new', year: Number(values.year), text: values.text,
            published: values.published === 'yes', sortIndex: Number(values.sortIndex) || 0
          };
          rows[resource].unshift(row);
          return { ok: true, row: { ...row } };
        },
        async update(token, resource, key, values) {
          const at = rows[resource].findIndex(item => item.id === key);
          rows[resource][at] = {
            ...rows[resource][at], year: Number(values.year), text: values.text,
            published: values.published === 'yes', sortIndex: Number(values.sortIndex) || 0
          };
          return { ok: true, row: { ...rows[resource][at] } };
        },
        async remove(token, resource, key) {
          deleteCalls += 1;
          const at = rows[resource].findIndex(item => item.id === key);
          const removed = rows[resource].splice(at, 1)[0];
          return { ok: true, row: { ...removed } };
        }
      }
    };

    await activateDesktopIcon(document.querySelector('.dicon[data-id="terminal"]'));
    const terminal = await waitUntil(() => findWindow('terminal'), 'terminal window');
    const input = terminal.querySelector('.t-in');
    await command(input, 'sudo login --admin tester');
    await waitUntil(() => input.type === 'password', 'password prompt');
    await command(input, 'correct-horse-battery-staple');
    await waitUntil(() => terminal.querySelector('.t-ps.admin'), 'admin prompt');

    await command(input, 'career browse');
    const careerWindow = await waitUntil(() => findWindow('adm-list-career'), 'career list window');
    await waitUntil(() => careerWindow.querySelectorAll('.adm-grid-row').length === 10, 'career rows');
    const initialPage = careerWindow.querySelector('.adm-page-label').textContent === 'Page 1 of 2';
    careerWindow.querySelector('[data-a="next"]').click();
    await waitUntil(() => careerWindow.querySelector('.adm-page-label').textContent === 'Page 2 of 2', 'second page');
    careerWindow.querySelector('[data-a="prev"]').click();
    await waitUntil(() => careerWindow.querySelector('.adm-page-label').textContent === 'Page 1 of 2', 'first page');

    let firstRow = careerWindow.querySelector('.adm-grid-row');
    firstRow.querySelector('[data-row-action="detail"]').click();
    const detailWindow = await waitUntil(() => findWindow('adm-view-career-career-1'), 'detail window');
    const detailVisible = detailWindow.textContent.includes('Career entry 1');

    firstRow.querySelector('[data-row-action="edit"]').click();
    const editWindow = await waitUntil(() => findWindow('adm-form-career-career-1'), 'edit window');
    editWindow.querySelector('[data-f="f-text"]').value = 'Career entry updated';
    editWindow.querySelector('[data-a="save"]').click();
    await waitUntil(() => !findWindow('adm-form-career-career-1'), 'edit save');
    await waitUntil(() => careerWindow.textContent.includes('Career entry updated'), 'updated list');

    careerWindow.querySelector('[data-a="create"]').click();
    const createWindow = await waitUntil(() => findWindow('adm-form-career-new'), 'create window');
    createWindow.querySelector('[data-f="f-year"]').value = '2027';
    createWindow.querySelector('[data-f="f-text"]').value = 'New career entry';
    createWindow.querySelector('[data-a="save"]').click();
    await waitUntil(() => !findWindow('adm-form-career-new'), 'create save');
    await waitUntil(() => careerWindow.textContent.includes('New career entry'), 'created row');

    const createdRow = [...careerWindow.querySelectorAll('.adm-grid-row')]
      .find(row => row.textContent.includes('New career entry'));
    createdRow.querySelector('[data-row-action="delete"]').click();
    let deleteDialog = await waitUntil(() => findWindow('adm-delete-career-career-new'), 'delete dialog');
    findButton(deleteDialog, 'Cancel').click();
    await waitUntil(() => !findWindow('adm-delete-career-career-new'), 'delete cancel');
    const cancelPreserved = deleteCalls === 0 && careerWindow.textContent.includes('New career entry');

    createdRow.querySelector('[data-row-action="delete"]').click();
    deleteDialog = await waitUntil(() => findWindow('adm-delete-career-career-new'), 'delete confirmation');
    findButton(deleteDialog, 'Delete').click();
    await waitUntil(() => !careerWindow.textContent.includes('New career entry'), 'deleted row');
    const deleteConfirmed = deleteCalls === 1;

    await command(input, 'hire browse');
    const hireWindow = await waitUntil(() => findWindow('adm-list-hire'), 'read-only list window');
    await waitUntil(() => hireWindow.querySelector('.adm-grid-row'), 'read-only row');
    const editUpdated = careerWindow.textContent.includes('Career entry updated');
    const readOnlyActions =
      !hireWindow.querySelector('[data-a="create"]') &&
      !hireWindow.querySelector('[data-a="edit"]') &&
      !hireWindow.querySelector('[data-row-action="edit"]') &&
      Boolean(hireWindow.querySelector('[data-row-action="detail"]')) &&
      Boolean(hireWindow.querySelector('[data-row-action="delete"]'));

    await command(input, 'logout');
    await waitUntil(() => careerWindow.textContent.includes('Session ended.'), 'signed-out list state');
    const sessionLocked =
      careerWindow.querySelectorAll('.adm-grid-row').length === 0 &&
      careerWindow.querySelector('[data-a="refresh"]').disabled &&
      !findWindow('adm-view-career-career-1');

    return {
      initialPage,
      detailVisible,
      editUpdated,
      createWorked: rows.career.length === 11,
      cancelPreserved,
      deleteConfirmed,
      readOnlyActions,
      sessionLocked
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
const passed = Object.values(report).every(Boolean);
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
