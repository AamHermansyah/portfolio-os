/* =================================================================
         apps
      ================================================================= */

      /* ---- Display Properties / wallpaper picker ---- */
      function openWallpaperPicker() {
        const initial = currentWallpaper();
        WM.create({
          id: 'wallpaper', title: 'Display Properties — Wallpaper', icon: svg('monitor', 14), w: 600, h: 455,
          status: ['Wallpaper: ' + initial.name, 'Changes are previewed live'],
          onClose(api) { if (api.applied) setWallpaper(api.applied, false); },
          build(body, api) {
            api.applied = initial.id;
            api.pending = initial.id;
            body.className = 'win-body app-wallpaper';
            body.innerHTML = `<div class="wp-wrap">
        <div class="wp-intro">${svg('monitor', 32)}<div><b>Desktop wallpaper</b><span>Choose a background. Click a tile to preview it instantly.</span></div></div>
        <div class="wp-grid">${WALLPAPERS.map(w => `<button class="wp-card${w.id === initial.id ? ' active' : ''}" type="button" data-wall="${w.id}" aria-pressed="${w.id === initial.id}">
          <span class="wp-thumb wp-${w.id}"></span><span class="wp-name">${esc(w.name)}</span><span class="wp-desc">${esc(w.desc)}</span>
        </button>`).join('')}</div>
        <div class="wp-actions"><span class="wp-current">Current: <b>${esc(initial.name)}</b></span>
          <button class="btn" type="button" data-a="ok">OK</button>
          <button class="btn" type="button" data-a="cancel">Cancel</button>
          <button class="btn" type="button" data-a="apply">Apply</button>
        </div>
      </div>`;
            const current = body.querySelector('.wp-current');
            function preview(id) {
              const wall = setWallpaper(id, false);
              api.pending = wall.id;
              current.innerHTML = 'Preview: <b>' + esc(wall.name) + '</b>';
              api.status[0].textContent = 'Previewing: ' + wall.name;
            }
            function apply() {
              const wall = setWallpaper(api.pending, true);
              api.applied = wall.id;
              current.innerHTML = 'Current: <b>' + esc(wall.name) + '</b>';
              api.status[0].textContent = 'Wallpaper applied: ' + wall.name;
            }
            body.querySelectorAll('.wp-card').forEach(card => card.addEventListener('click', () => preview(card.dataset.wall)));
            body.querySelector('[data-a="apply"]').addEventListener('click', apply);
            body.querySelector('[data-a="ok"]').addEventListener('click', () => { apply(); api.close(); });
            body.querySelector('[data-a="cancel"]').addEventListener('click', () => {
              api.pending = api.applied; setWallpaper(api.applied, false); api.close();
            });
          }
        });
      }

      /* ---- About_Me.txt (Notepad) ---- */
      function openAbout() {
        /* Same as the explorer: the Format menu closure is built before build(). */
        let npadWrap = true;
        let toggleWrap = () => { };
        WM.create({
          id: 'about', title: 'About_Me.txt — Notepad', icon: svg('txt', 14), w: 470, h: 420,
          menubar: [
            { label: 'File', items: [{ label: 'Close', act: a => a.close() }] },
            { label: 'Format', items: [{ label: 'Word Wrap', check: () => !npadWrap, act: () => toggleWrap() }] },
            { label: 'Help', items: [{ label: 'About PortfolioOS', act: aboutOS }] }
          ],
          build(body) {
            body.className = 'win-body app-notepad';
            const npad = document.createElement('div'); npad.className = 'npad';
            npad.innerHTML = esc(
              '================================================\n' +
              '  ABOUT_ME.TXT\n' +
              '  Portfolio of Aam Hermansyah — Fullstack Developer\n' +
              '  Last modified: 09/09/2026, 11:52 PM\n' +
              '================================================\n\n\n' +
              'Hi. I’m Aam.\n\n' +
              'I build for the web in TypeScript, mostly with Next.js\n' +
              'and React, from Garut in West Java, Indonesia.\n\n' +
              'WHAT I ACTUALLY BUILD\n' +
              '---------------------\n' +
              'Real products with real users on the other side of them:\n' +
              'a parcel tracking and logistics platform, a marketplace\n' +
              'that connects travellers with local tour guides, exam\n' +
              'and health applications. Monorepos when a project has\n' +
              'more than one audience, a boring database layer, and a\n' +
              'front end that still works on a bad connection.\n\n' +
              'Strong opinions, loosely held:\n' +
              ' - Boring technology, exciting products.\n' +
              ' - Ship it where people can actually open it.\n' +
              ' - If it can’t run offline, it’s a brochure.\n\n' +
              'THE OBVIOUS QUESTION\n' +
              '--------------------\n' +
              'Yes, I built an entire fake operating system as a\n' +
              'portfolio. Windows behave like windows because they\n' +
              'should. Double-click things. Drag them. Open the\n' +
              'Terminal and type "help" — the whole résumé is in\n' +
              'there too. There are at least two easter eggs.\n\n' +
              'P.S. My previous portfolio is [[GEO]], and every\n' +
              'project in here links to its own source on GitHub.\n' +
              'Whatever you do, do not click [[EGG]].\n\n' +
              '------------------------------------\n' +
              'aamhermansyah283@gmail.com · github.com/AamHermansyah'
            )
              .replace('[[GEO]]', '<a href="https://aamhermansyah.vercel.app" target="_blank" rel="noopener">still up</a>')
              .replace('[[EGG]]', '<a href="#" class="geolink">this</a>');
            body.appendChild(npad); body.appendChild(npad);
            toggleWrap = function () { npadWrap = !npadWrap; npad.classList.toggle('nowrap', !npadWrap); };
            npad.querySelector('.geolink')?.addEventListener('click', e => {
              e.preventDefault(); hourglass(500); setTimeout(() => bsod(), 480);
            });
          }
        });
      }

      /* ---- generic file explorer (Projects / Recycle Bin) ---- */
      function openExplorerWin(o) {
        /* The View menu closures are created before build() runs, so the state
           they read lives here rather than inside build(). */
        let view = 'icons';
        let setView = () => { };
        WM.create({
          id: o.id, title: o.title, icon: o.icon(14), w: o.w || 560, h: o.h || 400,
          menubar: [
            { label: 'File', items: [{ label: 'Close', act: a => a.close() }] },
            {
              label: 'View', items: [
                { label: 'Icons', check: () => view === 'icons', act: () => setView('icons') },
                { label: 'Details', check: () => view === 'details', act: () => setView('details') }
              ]
            },
            { label: 'Help', items: [{ label: 'About PortfolioOS', act: aboutOS }] }
          ],
          status: [`${o.items().length} object(s)`, o.stat2 || ''],
          build(body, api) {
            body.className = 'win-body app-expl';
            let selEl = null;
            body.innerHTML = `<div class="ex-tools">
        <button class="btn sm" data-a="ref">Refresh</button>
        <span class="vsep"></span>
        <button class="btn sm" data-v="icons">Icons</button>
        <button class="btn sm" data-v="details">Details</button>
        <span class="grow"></span>
      </div>
      <div class="ex-addr"><span>Address</span><div class="ex-path">${o.icon(14)}<span>${esc(o.path)}</span></div></div>
      <div class="ex-view"></div>`;
            const tools = body.querySelector('.ex-tools'), viewEl = body.querySelector('.ex-view');
            if (o.tool) {
              const b = document.createElement('button'); b.className = 'btn sm'; b.textContent = o.tool.t;
              b.addEventListener('click', () => o.tool.act(refresh, api));
              tools.insertBefore(document.createElement('span'), tools.querySelector('.grow')).className = 'vsep';
              tools.insertBefore(b, tools.querySelector('.grow'));
            }
            function status(n, sel) { api.status[0].textContent = n + (sel ? ' object(s) selected' : ' object(s)'); }
            function render() {
              selEl = null; status(o.items().length, false);
              viewEl.innerHTML = '';
              if (!o.items().length) {
                viewEl.innerHTML = `<div class="ex-empty">${o.empty || 'This folder is empty.'}</div>`; return;
              }
              if (view === 'icons') {
                const g = document.createElement('div'); g.className = 'ex-grid';
                o.items().forEach(it => {
                  const d = document.createElement('div'); d.className = 'ex-item'; d.tabIndex = 0;
                  d.innerHTML = `<div class="ex-ic">${it.icon(32)}</div><div class="ex-lb">${esc(it.f)}</div>`;
                  d.addEventListener('click', () => { if (selEl) selEl.classList.remove('sel'); selEl = d; d.classList.add('sel'); status(o.items().length, true); });
                  activate(d, () => it.open());
                  g.appendChild(d);
                });
                viewEl.appendChild(g);
              } else {
                const t = document.createElement('table'); t.className = 'ex-table';
                t.innerHTML = '<tr><th>Name</th><th>Type</th><th>Size</th><th>Description</th></tr>' +
                  o.items().map(it => `<tr data-f="${esc(it.f)}"><td>${esc(it.f)}</td><td>${esc(it.type || '')}</td><td>${esc(it.size || '')}</td><td>${esc(it.desc || '')}</td></tr>`).join('');
                t.querySelectorAll('tr[data-f]').forEach(tr => {
                  const it = o.items().find(x => x.f === tr.dataset.f);
                  tr.addEventListener('click', () => { t.querySelectorAll('tr.sel').forEach(r => r.classList.remove('sel')); tr.classList.add('sel'); status(o.items().length, true); });
                  activate(tr, () => it.open());
                });
                viewEl.appendChild(t);
              }
            }
            setView = function (v) {
              view = v; render();
              tools.querySelectorAll('[data-v]').forEach(b => b.classList.toggle('on', b.dataset.v === v));
            };
            tools.querySelector('[data-a="ref"]').addEventListener('click', () => { hourglass(300); render(); });
            tools.querySelectorAll('[data-v]').forEach(b => b.addEventListener('click', () => setView(b.dataset.v)));
            function refresh() { render(); }
            setView('icons');
            api.refresh = refresh;
          }
        });
      }
      function activate(el, fn) {
        if (COARSE) el.addEventListener('click', fn);
        else { el.addEventListener('dblclick', fn); el.addEventListener('keydown', e => { if (e.key === 'Enter') fn(); }); }
      }

      function openProjects() {
        const items = () => PROJECTS.map(p => ({
          f: p.file, type: p.type, size: p.size, desc: p.tagline, icon: s => appIcon(p.color, s),
          open: () => openProject(p)
        }));
        openExplorerWin({
          id: 'projects', title: 'Projects', icon: s => svg('folder', s), path: 'C:\\Projects',
          items, stat2: 'My Portfolio (C:)', empty: 'No projects found. That would be worse.'
        });
      }
      function caseStudyShot(p, c, index) {
        const metricCards = (c.metrics || []).map((metric, i) => {
          const x = 166 + i * 143;
          return `<g><rect x="${x}" y="83" width="129" height="68" fill="#fff" stroke="#808080"/><rect x="${x + 1}" y="84" width="127" height="16" fill="${p.color}"/><text x="${x + 7}" y="96" fill="#fff" font-size="9">METRIC 0${i + 1}</text><text x="${x + 8}" y="124" fill="#111" font-size="18" font-weight="700">${esc(metric.value)}</text><text x="${x + 8}" y="141" fill="#555" font-size="9">${esc(metric.label)}</text></g>`;
        }).join('');
        const architecture = (c.architecture || []).map((node, i) => {
          const x = 40 + i * 205;
          return `<g><rect x="${x}" y="112" width="155" height="92" fill="#fff" stroke="#202020"/><rect x="${x + 1}" y="113" width="153" height="20" fill="${p.color}"/><text x="${x + 8}" y="127" fill="#fff" font-size="10" font-weight="700">${esc(node.title.slice(0, 23))}</text><rect x="${x + 12}" y="148" width="92" height="5" fill="#c0c0c0"/><rect x="${x + 12}" y="160" width="122" height="5" fill="#dfdfdf"/><rect x="${x + 12}" y="172" width="108" height="5" fill="#dfdfdf"/><circle cx="${x + 134}" cy="188" r="5" fill="#00a000"/></g>${i < 2 ? `<path d="M${x + 157} 158h44" stroke="#000" stroke-width="2"/><path d="m${x + 194} 153 7 5-7 5" fill="#000"/>` : ''}`;
        }).join('');
        const stackRows = p.stack.slice(0, 4).map((technology, i) => {
          const y = 119 + i * 38;
          const width = 160 + i * 48;
          return `<g><rect x="172" y="${y}" width="410" height="27" fill="${i % 2 ? '#f4f4f4' : '#fff'}"/><rect x="184" y="${y + 8}" width="10" height="10" fill="${p.color}"/><text x="205" y="${y + 17}" fill="#111" font-size="10">${esc(technology)}</text><rect x="324" y="${y + 9}" width="${width}" height="8" fill="#dfdfdf"/><rect x="324" y="${y + 9}" width="${Math.round(width * .72)}" height="8" fill="${p.color}"/></g>`;
        }).join('');
        let scene = '';
        if (index === 0) {
          scene = `<rect x="20" y="48" width="126" height="264" fill="#dedede" stroke="#808080"/><rect x="29" y="63" width="108" height="24" fill="${p.color}"/><text x="40" y="79" fill="#fff" font-size="10">Dashboard</text><text x="39" y="111" fill="#222" font-size="10">Workspace</text><text x="39" y="140" fill="#222" font-size="10">Activity</text><text x="39" y="169" fill="#222" font-size="10">Exports</text><text x="39" y="198" fill="#222" font-size="10">Settings</text><text x="166" y="66" fill="#111" font-size="16" font-weight="700">${esc(p.tagline)}</text>${metricCards}<rect x="166" y="168" width="415" height="144" fill="#fff" stroke="#808080"/><rect x="167" y="169" width="413" height="22" fill="#c0c0c0"/><text x="177" y="184" fill="#111" font-size="10" font-weight="700">Recent activity</text>${[0, 1, 2, 3].map(i => `<g><circle cx="182" cy="${211 + i * 23}" r="4" fill="${i === 3 ? '#e0a000' : '#00a000'}"/><rect x="195" y="${207 + i * 23}" width="${205 - i * 19}" height="7" fill="${i % 2 ? '#dfdfdf' : '#c8c8c8'}"/><text x="535" y="${214 + i * 23}" fill="#666" font-size="8">OK</text></g>`).join('')}`;
        } else if (index === 1) {
          scene = `<text x="40" y="78" fill="#111" font-size="16" font-weight="700">Architecture workspace</text><rect x="24" y="92" width="592" height="144" fill="#e9eef2" stroke="#808080"/>${architecture}<rect x="24" y="250" width="592" height="62" fill="#050505" stroke="#808080"/><text x="36" y="270" fill="#54ef78" font-size="10">$ ${esc(p.file)} --inspect pipeline</text><text x="36" y="288" fill="#b3ffc5" font-size="9">All services healthy. Data flow verified.</text><text x="36" y="303" fill="#6fa67d" font-size="9">Listening for the next event _</text>`;
        } else {
          scene = `<rect x="20" y="48" width="126" height="264" fill="#dedede" stroke="#808080"/><text x="35" y="75" fill="#111" font-size="13" font-weight="700">Release report</text><text x="35" y="105" fill="#444" font-size="9">Build</text><text x="35" y="121" fill="#111" font-size="11">${esc(p.ver)}</text><text x="35" y="151" fill="#444" font-size="9">Released</text><text x="35" y="167" fill="#111" font-size="11">${esc(p.date)}</text><rect x="31" y="207" width="104" height="36" fill="#000080"/><text x="51" y="229" fill="#fff" font-size="11" font-weight="700">PASSED</text><text x="172" y="76" fill="#111" font-size="16" font-weight="700">Technology health</text><rect x="166" y="96" width="422" height="180" fill="#fff" stroke="#808080"/>${stackRows}<rect x="166" y="288" width="422" height="24" fill="#ffffe1" stroke="#808080"/><text x="177" y="304" fill="#111" font-size="9">Production checks completed successfully.</text>`;
        }
        const markup = `<svg xmlns="http://www.w3.org/2000/svg" width="640" height="360" viewBox="0 0 640 360"><rect width="640" height="360" fill="#008080"/><rect x="6" y="6" width="628" height="348" fill="#c0c0c0" stroke="#fff" stroke-width="2"/><rect x="9" y="9" width="622" height="25" fill="${p.color}"/><text x="18" y="26" fill="#fff" font-family="Tahoma,Arial,sans-serif" font-size="12" font-weight="700">${esc(p.name)} — ${index === 0 ? 'Overview' : index === 1 ? 'System View' : 'Release Report'}</text><g font-family="Tahoma,Arial,sans-serif">${scene}</g><rect x="10" y="324" width="620" height="26" fill="#c0c0c0" stroke="#808080"/><text x="19" y="341" fill="#333" font-family="Tahoma,Arial,sans-serif" font-size="9">${esc(c.captions[index].slice(0, 88))}</text></svg>`;
        return 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(markup);
      }
      function openProject(p) {
        const c = CASE_STUDIES[p.id];
        /* A case study shows a section only when there is real material for it.
           Repos that were never written up keep Overview and Preview and drop the
           rest, rather than padding them with invented detail. */
        const caseHas = (c, id) => {
          if (id === 'challenge') return !!(c.problem && c.responsibilities);
          if (id === 'solution') return !!c.solution;
          if (id === 'architecture') return !!c.architecture;
          if (id === 'results') return !!(c.result && c.metrics);
          if (id === 'screenshots') return !!(c.gallery && c.captions);
          return true;
        };
        const sections = [
          { id: 'overview', label: 'Overview' },
          { id: 'challenge', label: 'Challenge' },
          { id: 'solution', label: 'Solution' },
          { id: 'architecture', label: 'Architecture' },
          { id: 'results', label: 'Results' },
          { id: 'screenshots', label: 'Preview' }
        ].filter(s => caseHas(c, s.id));
        WM.create({
          id: 'proj-' + p.id, title: p.file + ' \u2014 Case Study', icon: appIcon(p.color, 14), w: 680, h: 570,
          status: [p.req, 'C:\\Projects'],
          build(body, api) {
            body.className = 'win-body app-proj';
            const panel = (id, content) => !sections.some(s => s.id === id) ? '' : `<section class="case-panel" id="case-${p.id}-panel-${id}" data-panel="${id}" role="tabpanel" aria-labelledby="case-${p.id}-tab-${id}"${id === 'overview' ? '' : ' hidden'}>${content}</section>`;
            body.innerHTML = `<div class="case-shell">
      <div class="case-tabs" role="tablist" aria-label="${esc(p.name)} case study sections">
        ${sections.map((s, i) => `<button class="case-tab${i === 0 ? ' on' : ''}" id="case-${p.id}-tab-${s.id}" type="button" role="tab" data-tab="${s.id}" aria-controls="case-${p.id}-panel-${s.id}" aria-selected="${i === 0 ? 'true' : 'false'}" tabindex="${i === 0 ? '0' : '-1'}">${s.label}</button>`).join('')}
      </div>
      <div class="case-content">
        ${panel('overview', `<div class="proj">
          <div class="proj-top">
            <div class="shot"><img src="${caseStudyShot(p, c, 0)}" alt="${esc(p.name)} product overview" width="480" height="320"></div>
            <div class="pj-side">
              <div class="pj-name">${esc(p.name)} <span class="pj-ver">${esc(p.ver)}</span></div>
              <div class="pj-file">${esc(p.file)} \u2014 ${esc(p.type)}</div>
              <table class="pj-meta">
                <tr><td>File size</td><td>${esc(p.size)}</td></tr>
                <tr><td>Released</td><td>${esc(p.date)}</td></tr>
                <tr><td>My role</td><td>${esc(c.role)}</td></tr>
              </table>
              <div class="pj-stack">${p.stack.map(t => `<span class="chip">${esc(t)}</span>`).join('')}</div>
            </div>
          </div>
          <p class="pj-desc">${esc(p.desc)}</p>
          <div class="case-label">Project highlights</div>
          <ul class="pj-notes">${p.notes.map(n => `<li>${esc(n)}</li>`).join('')}</ul>
        </div>`)}
        ${panel('challenge', `<h2 class="case-heading">The challenge</h2>
          <p class="case-copy">${esc(c.problem || "")}</p>
          <div class="case-facts">
            <div class="case-fact"><span>My role</span><b>${esc(c.role)}</b></div>
            <div class="case-fact"><span>Duration</span><b>${esc(c.duration || "—")}</b></div>
            <div class="case-fact"><span>Team</span><b>${esc(c.team || "—")}</b></div>
          </div>
          <div class="case-label">My responsibilities</div>
          <ul class="pj-notes">${(c.responsibilities || []).map(n => `<li>${esc(n)}</li>`).join('')}</ul>`)}
        ${panel('solution', `<h2 class="case-heading">How the solution was built</h2>
          <p class="case-copy">The implementation focused on the smallest dependable system that could solve the core workflow.</p>
          <div class="solution-list">${(c.solution || []).map(s => `<article class="solution-card"><b>${esc(s.title)}</b><p>${esc(s.text)}</p></article>`).join('')}</div>`)}
        ${panel('architecture', `<h2 class="case-heading">System architecture</h2>
          <p class="case-copy">A concise view of the primary runtime path and the responsibility of each layer.</p>
          <div class="arch-flow">${(c.architecture || []).map(a => `<article class="arch-node"><b>${esc(a.title)}</b><p>${esc(a.text)}</p></article>`).join('')}</div>
          <div class="arch-note"><b>Engineering note:</b> ${esc(c.architectureNote || "")}</div>`)}
        ${panel('results', `<h2 class="case-heading">Measured results</h2>
          <p class="case-copy">${esc(c.result || "")}</p>
          <div class="metric-grid">${(c.metrics || []).map(m => `<div class="metric"><b>${esc(m.value)}</b><span>${esc(m.label)}</span></div>`).join('')}</div>
          <div class="case-label">What shipped</div>
          <ul class="pj-notes">${p.notes.map(n => `<li>${esc(n)}</li>`).join('')}</ul>`)}
        ${panel('screenshots', `<h2 class="case-heading">Interface preview</h2>
          <div class="gallery-main"><img src="${caseStudyShot(p, c, 0)}" data-shot="0" alt="${esc((c.captions || [])[0] || "")}" width="640" height="360"></div>
          <div class="gallery-caption" aria-live="polite">${esc((c.captions || [])[0] || "")}</div>
          <div class="gallery-thumbs">${(c.gallery || []).map((seed, i) => `<button class="gallery-thumb${i === 0 ? ' on' : ''}" type="button" data-shot="${i}" aria-label="View screenshot ${i + 1}: ${esc(c.captions[i])}" aria-pressed="${i === 0 ? 'true' : 'false'}"><img src="${caseStudyShot(p, c, i)}" alt="" width="240" height="135"></button>`).join('')}</div>`)}
      </div>
      <div class="pj-actions">
        <a class="btn" href="${p.demo}" target="_blank" rel="noopener">Live demo</a>
        <a class="btn" href="${p.repo}" target="_blank" rel="noopener">View source</a>
        <span class="case-location">C:\\Projects\\${esc(p.file)}</span>
      </div>
    </div>`;
            const content = body.querySelector('.case-content');
            const tabs = [...body.querySelectorAll('.case-tab')];
            const panels = [...body.querySelectorAll('.case-panel')];
            function selectSection(id, focus = false) {
              tabs.forEach(tab => {
                const active = tab.dataset.tab === id;
                tab.classList.toggle('on', active);
                tab.setAttribute('aria-selected', String(active));
                tab.tabIndex = active ? 0 : -1;
                if (active && focus) tab.focus();
              });
              panels.forEach(section => { section.hidden = section.dataset.panel !== id; });
              const current = sections.find(section => section.id === id);
              api.status[0].textContent = (current ? current.label : 'Case Study') + ' \u2014 ' + p.tagline;
              content.scrollTop = 0;
            }
            tabs.forEach((tab, index) => {
              tab.addEventListener('click', () => selectSection(tab.dataset.tab));
              tab.addEventListener('keydown', event => {
                if (event.key !== 'ArrowRight' && event.key !== 'ArrowLeft' && event.key !== 'Home' && event.key !== 'End') return;
                event.preventDefault();
                let next = index;
                if (event.key === 'ArrowRight') next = (index + 1) % tabs.length;
                if (event.key === 'ArrowLeft') next = (index - 1 + tabs.length) % tabs.length;
                if (event.key === 'Home') next = 0;
                if (event.key === 'End') next = tabs.length - 1;
                selectSection(tabs[next].dataset.tab, true);
              });
            });
            const mainShot = body.querySelector('.gallery-main img');
            const caption = body.querySelector('.gallery-caption');
            body.querySelectorAll('.gallery-thumb').forEach(button => button.addEventListener('click', () => {
              const index = Number(button.dataset.shot);
              mainShot.src = caseStudyShot(p, c, index);
              mainShot.dataset.shot = String(index);
              mainShot.alt = c.captions[index];
              caption.textContent = c.captions[index];
              body.querySelectorAll('.gallery-thumb').forEach(thumb => {
                const active = thumb === button;
                thumb.classList.toggle('on', active);
                thumb.setAttribute('aria-pressed', String(active));
              });
            }));
          }
        });
      }
