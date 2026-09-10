/* =================================================================
         Find, Certificates, Changelog, Career
      ================================================================= */

      const credentialSlug = c => c.title.toLowerCase().replace(/[^a-z0-9]+/g, '_').replace(/^_|_$/g, '').slice(0, 28);
      const credentialFile = c => credentialSlug(c) + '.' + (CREDENTIAL_KINDS[c.kind] || { ext: 'doc' }).ext;

      function openCredential(c) {
        const kind = CREDENTIAL_KINDS[c.kind] || { label: 'Document' };
        const rows = [['Type', kind.label], ['Title', c.title]];
        if (c.issuer) rows.push(['Issued by', c.issuer]);
        if (c.date) rows.push(['Date', c.date]);
        WM.create({
          id: 'cred-' + credentialSlug(c), title: credentialFile(c) + ' Properties',
          icon: svg('cert', 14), w: 440, h: 'auto', dialog: true,
          build(body, api) {
            body.className = 'win-body app-sys';
            const notes = (c.notes || []).length
              ? `<ul class="cred-notes">${c.notes.map(n => `<li>${esc(n)}</li>`).join('')}</ul>` : '';
            body.innerHTML = `<div class="sys-page">
                <div class="sys-fields">
                  <div class="sys-group"><b>General:</b>
                    <dl class="sys-spec">${rows.map(([k, v]) => `<dt>${esc(k)}</dt><dd>${esc(v)}</dd>`).join('')}</dl>
                    ${notes}
                  </div>
                </div>
                <div class="sys-logo">${svg('cert', 48)}</div>
              </div>
              <div class="sys-sep"></div>
              <div class="sys-actions">
                ${c.url ? `<a class="btn" href="${esc(c.url)}" target="_blank" rel="noopener">Verify</a>` : ''}
                <button class="btn" type="button" data-a="ok">OK</button>
              </div>`;
            body.querySelector('[data-a="ok"]').addEventListener('click', () => api.close());
            setTimeout(() => body.querySelector('[data-a="ok"]').focus(), 60);
          }
        });
      }

      function openCertificates() {
        const items = () => CREDENTIALS.map(c => ({
          f: credentialFile(c),
          type: (CREDENTIAL_KINDS[c.kind] || { label: 'Document' }).label,
          size: c.date || '\u2014',
          desc: c.issuer || c.title,
          icon: s => svg('cert', s),
          open: () => openCredential(c)
        }));
        openExplorerWin({
          id: 'certs', title: 'Certificates', icon: s => svg('cert', s), path: 'C:\\Certificates',
          items, stat2: 'My Portfolio (C:)', empty: 'No certificates on file yet.'
        });
      }

      /* ---- Changelog.log ----
         Portfolio milestones are kept by hand because they describe this repository.
         Repository activity is derived from the GitHub snapshot, so the shipping
         history stays current without mixing it with the separate career timeline. */
      function changelogText(data) {
        const years = new Map();
        const bucket = y => {
          if (!years.has(y)) years.set(y, { portfolio: [], repos: [] });
          return years.get(y);
        };
        PORTFOLIO_LOG.forEach(e => bucket(e.year).portfolio.push(e.text));
        (data && data.repos ? data.repos : []).forEach(r => {
          if (r.pushedAt) bucket(new Date(r.pushedAt).getFullYear()).repos.push(r.name);
        });

        const lines = [
          '='.repeat(52),
          '  CHANGELOG.LOG',
          '  ' + PROFILE.name + ' \u2014 what shipped, and when',
          '='.repeat(52),
          ''
        ];
        [...years.keys()].sort((a, b) => b - a).forEach(year => {
          const y = years.get(year);
          lines.push('[' + year + ']');
          if (y.portfolio.length) {
            lines.push('  PortfolioOS');
            y.portfolio.forEach(t => lines.push('    * ' + t));
          }
          if (y.repos.length) {
            lines.push('  Repositories pushed (' + y.repos.length + ')');
            let row = '   ';
            y.repos.forEach(name => {
              if ((row + ' ' + name).length > 50) { lines.push(row); row = '   '; }
              row += ' ' + name;
            });
            if (row.trim()) lines.push(row);
          }
          lines.push('');
        });
        lines.push('-'.repeat(52));
        lines.push(data && data.syncedAt
          ? 'Repository history read from the GitHub snapshot.'
          : 'Repository history unavailable \u2014 showing portfolio entries only.');
        return lines.join('\n');
      }

      function openChangelog() {
        WM.create({
          id: 'changelog', title: 'Changelog.log \u2014 Notepad', icon: svg('txt', 14), w: 520, h: 470,
          menubar: [
            { label: 'File', items: [{ label: 'Close', act: a => a.close() }] },
            { label: 'Help', items: [{ label: 'About PortfolioOS', act: aboutOS }] }
          ],
          build(body) {
            body.className = 'win-body app-notepad';
            const npad = document.createElement('div');
            npad.className = 'npad';
            npad.textContent = 'Reading log\u2026';
            body.appendChild(npad);
            loadGithub()
              .then(data => { npad.textContent = changelogText(data); })
              .catch(() => { npad.textContent = changelogText(null); });
          }
        });
      }

      function careerLogText() {
        const years = new Map();
        CAREER_LOG.forEach(entry => {
          if (!years.has(entry.year)) years.set(entry.year, []);
          years.get(entry.year).push(entry.text);
        });

        const lines = [
          '='.repeat(52),
          '  CAREER.LOG',
          '  ' + PROFILE.name + ' \u2014 professional timeline',
          '='.repeat(52),
          ''
        ];
        [...years.keys()].sort((a, b) => b - a).forEach(year => {
          lines.push('[' + year + ']');
          years.get(year).forEach(text => lines.push('  * ' + text));
          lines.push('');
        });
        if (!CAREER_LOG.length) lines.push('No career milestones on file yet.', '');
        lines.push('-'.repeat(52));
        lines.push('Entries marked [DEMO] are placeholders for layout review.');
        return lines.join('\n');
      }

      function openCareerLog() {
        WM.create({
          id: 'career-log', title: 'Career.log \u2014 Notepad', icon: svg('briefcase', 14), w: 520, h: 470,
          menubar: [
            { label: 'File', items: [{ label: 'Close', act: api => api.close() }] },
            { label: 'Help', items: [{ label: 'About PortfolioOS', act: aboutOS }] }
          ],
          build(body) {
            body.className = 'win-body app-notepad';
            const npad = document.createElement('div');
            npad.className = 'npad';
            npad.textContent = careerLogText();
            body.appendChild(npad);
          }
        });
      }

      /* ---- Find: Projects & Skills ----
         Searches what the OS already knows: case studies, the skill list, and the
         repository snapshot. No separate index to keep in step. */
      const FIND_SCOPES = [
        { id: 'all', label: 'Everything' },
        { id: 'Case study', label: 'Projects' },
        { id: 'Skill', label: 'Skills' },
        { id: 'Repository', label: 'Repositories' }
      ];

      function findEntries(data) {
        const entries = [];
        PROJECTS.forEach(p => entries.push({
          label: p.file, where: 'C:\\Projects', kind: 'Case study',
          icon: () => appIcon(p.color, 16),
          terms: [p.name, p.file, p.tagline, p.desc, p.stack.join(' '), p.notes.join(' ')].join(' ').toLowerCase(),
          open: () => openProject(p)
        }));
        SKILLS.forEach(s => entries.push({
          label: s.file, where: 'C:\\Windows\\System', kind: 'Skill',
          icon: () => svg('gear', 16),
          terms: (s.name + ' ' + s.file).toLowerCase(),
          open: openSkills
        }));
        ((data && data.repos) || []).forEach(r => entries.push({
          label: r.name, where: '\\\\github\\' + LINKS.githubUser, kind: 'Repository',
          icon: () => svg('globe', 16),
          terms: [r.name, r.description || '', r.language || '', (r.topics || []).join(' ')].join(' ').toLowerCase(),
          open: () => window.open(r.url, '_blank', 'noopener')
        }));
        return entries;
      }

      function openFind() {
        WM.create({
          id: 'find', title: 'Find: Projects & Skills', icon: svg('find', 14), w: 570, h: 440,
          menubar: [
            { label: 'File', items: [{ label: 'Close', act: a => a.close() }] },
            { label: 'Help', items: [{ label: 'About PortfolioOS', act: aboutOS }] }
          ],
          status: ['Ready to search', ''],
          build(body, api) {
            body.className = 'win-body app-find';
            body.innerHTML = `<div class="find-form">
                <div class="find-row">
                  <label for="find-q">Named:</label>
                  <input id="find-q" class="field" placeholder="e.g. Next.js, logistics, TypeScript" spellcheck="false">
                </div>
                <div class="find-row">
                  <label for="find-in">Look in:</label>
                  <select id="find-in" class="find-select">
                    ${FIND_SCOPES.map(s => `<option value="${esc(s.id)}">${esc(s.label)}</option>`).join('')}
                  </select>
                  <span class="find-btns">
                    <button class="btn" type="button" data-a="go">Find Now</button>
                    <button class="btn" type="button" data-a="clear">New Search</button>
                  </span>
                </div>
              </div>
              <div class="find-sep"></div>
              <div class="find-results"><div class="find-empty">Type a technology, a project name, or anything you remember.</div></div>`;

            const query = body.querySelector('#find-q');
            const scope = body.querySelector('#find-in');
            const results = body.querySelector('.find-results');
            let entries = findEntries(null);
            let timer = null;

            /* repositories join the index as soon as the snapshot lands */
            loadGithub().then(data => { entries = findEntries(data); if (query.value.trim()) search(); }).catch(() => {});

            function highlight(text, terms) {
              let out = esc(text);
              terms.forEach(t => {
                if (!t) return;
                const safe = t.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
                out = out.replace(new RegExp('(' + safe + ')', 'ig'), '<span class="find-hit">$1</span>');
              });
              return out;
            }

            function search() {
              const raw = query.value.trim();
              const terms = raw.toLowerCase().split(/\s+/).filter(Boolean);
              const want = scope.value;
              if (!terms.length) {
                results.innerHTML = '<div class="find-empty">Type a technology, a project name, or anything you remember.</div>';
                api.status[0].textContent = 'Ready to search';
                api.status[1].textContent = '';
                return;
              }
              const hits = entries.filter(e =>
                (want === 'all' || e.kind === want) && terms.every(t => e.terms.includes(t)));
              if (!hits.length) {
                results.innerHTML = `<div class="find-empty">${svg('find', 32)}<br><br>
                  No results for <b>${esc(raw)}</b>.<br>Try a technology name, or widen <b>Look in</b>.</div>`;
                api.status[0].textContent = '0 object(s) found';
                api.status[1].textContent = '';
                return;
              }
              results.innerHTML = `<div class="find-head"><span>Name</span><span>In Folder</span><span>Type</span></div>` +
                hits.map((h, i) => `<button class="find-item" type="button" data-i="${i}">
                  <span>${h.icon()}${highlight(h.label, terms)}</span>
                  <span>${esc(h.where)}</span><span>${esc(h.kind)}</span>
                </button>`).join('');
              results.querySelectorAll('.find-item').forEach(el => {
                const hit = hits[Number(el.dataset.i)];
                el.addEventListener('click', () => {
                  results.querySelectorAll('.find-item').forEach(x => x.classList.toggle('on', x === el));
                  api.status[1].textContent = hit.label;
                });
                el.addEventListener('dblclick', () => hit.open());
                el.addEventListener('keydown', e => { if (e.key === 'Enter') hit.open(); });
              });
              api.status[0].textContent = hits.length + ' object(s) found';
              api.status[1].textContent = '';
            }

            const schedule = () => { clearTimeout(timer); timer = setTimeout(search, 130); };
            query.addEventListener('input', schedule);
            scope.addEventListener('change', search);
            body.querySelector('[data-a="go"]').addEventListener('click', search);
            body.querySelector('[data-a="clear"]').addEventListener('click', () => {
              query.value = ''; scope.value = 'all'; search(); query.focus();
            });
            query.addEventListener('keydown', e => { if (e.key === 'Enter') search(); });
            setTimeout(() => query.focus(), 70);
          }
        });
      }
