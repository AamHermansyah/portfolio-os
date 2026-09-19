/* ---- Resume.pdf ---- */
      function openResume() {
        WM.create({
          id: 'resume', title: 'resume.pdf — Portfolio Viewer', icon: svg('pdf', 14), w: 560, h: 600, refreshable: true,
          menubar: [
            {
              label: 'File', items: [
                { label: 'Print\u2026', act: () => errorDialog('Printers', 'No printer is installed.<br>Printers are, tragically, still real hardware. Try <b>Contact.exe</b> instead.') },
                { sep: true },
                { label: 'Close', act: a => a.close() }
              ]
            },
            REFRESH_MENU,
            { label: 'Help', items: [{ label: 'About PortfolioOS', act: aboutOS }] }
          ],
          build(body) {
            body.className = 'win-body app-resume';
            /* Work history and education live in the same list as certificates;
               the résumé shows each section only when it has entries. */
            const summary = PROFILE.summary || '';
            const jobs = CREDENTIALS.filter(c => c.kind === 'experience');
            const schools = CREDENTIALS.filter(c => c.kind === 'education');
            const certs = CREDENTIALS.filter(c => c.kind === 'certificate');
            const skills = SKILLS.filter(s => !s.fail);
            const entry = c => `<div class="r-job">
        <div class="r-row"><b>${esc(c.title)}</b> — ${esc(c.issuer)}<span>${esc(c.date)}</span></div>
        ${c.notes.length ? `<ul>${c.notes.map(n => `<li>${esc(n)}</li>`).join('')}</ul>` : ''}</div>`;
            const linkHost = u => { try { return new URL(u).hostname.replace(/^www\./, ''); } catch { return u; } };
            const links = p => [
              p.demo ? `<a href="${esc(p.demo)}" target="_blank" rel="noopener">${esc(linkHost(p.demo))}</a>` : '',
              p.repo ? `<a href="${esc(p.repo)}" target="_blank" rel="noopener">Source</a>` : ''
            ].filter(Boolean).join(' &middot; ');
            const groups = [...new Set(skills.map(s => s.group).filter(Boolean))];
            /* A skill left without a group still belongs on the résumé. */
            const ungrouped = skills.filter(s => !s.group);
            const skillHtml = groups.length
              ? groups.map(g => `<div class="r-grp"><b>${esc(g)}:</b> ${skills.filter(s => s.group === g).map(s => esc(s.name)).join(', ')}</div>`).join('') +
                (ungrouped.length ? `<div class="r-grp"><b>Other:</b> ${ungrouped.map(s => esc(s.name)).join(', ')}</div>` : '')
              : `<div class="r-sk">${skills.map(s => esc(s.name)).join(' &middot; ')}</div>`;
            body.innerHTML = `<div class="resume-page">
      <h1>AAM HERMANSYAH</h1>
      <div class="r-sub">${esc(PROFILE.role)} — ${esc(PROFILE.location)}</div>
      <div class="r-links"><a href="mailto:${LINKS.email}">${LINKS.email}</a> &middot; ${esc(LINKS.phone)} &middot;
        <a href="${LINKS.linkedin}" target="_blank" rel="noopener">linkedin.com/in/${LINKS.linkedinUser}</a> &middot;
        <a href="${LINKS.github}" target="_blank" rel="noopener">github.com/${LINKS.githubUser}</a> &middot;
        <a href="${LINKS.site}" target="_blank" rel="noopener">${LINKS.siteLabel}</a> &middot;
        <a href="${LINKS.fiverr}" target="_blank" rel="noopener">fiverr.com/${LINKS.fiverrUser}</a></div>
      ${summary ? `<h2>SUMMARY</h2><p class="r-sum">${esc(summary)}</p>` : ''}
      ${skills.length ? `<h2>SKILLS</h2>${skillHtml}` : ''}
      ${jobs.length ? `<h2>EXPERIENCE</h2>${jobs.map(entry).join('')}` : ''}
      ${PROJECTS.length ? `<h2>SELECTED PROJECTS</h2>
      ${PROJECTS.slice(0, 4).map(p => `<div class="r-job">
        <div class="r-row"><b>${esc(p.name)} — ${esc(p.tagline)}</b><span>${esc(p.date.slice(-4))}</span></div>
        ${links(p) ? `<div class="r-sub">${links(p)}</div>` : ''}
        <ul>
          ${p.notes && p.notes.length ? p.notes.map(n => `<li>${esc(n)}</li>`).join('') : `<li>${esc(p.desc)}</li>`}
          ${p.stack.length ? `<li>${esc(p.stack.join(' · '))}</li>` : ''}
        </ul></div>`).join('')}` : ''}
      ${schools.length ? `<h2>EDUCATION</h2>${schools.map(entry).join('')}` : ''}
      ${certs.length ? `<h2>CERTIFICATIONS</h2>
      ${certs.map(c => `<div class="r-job">
        <div class="r-row"><b>${esc(c.title)}</b><span>${esc(c.issuer)}</span></div>
        ${c.notes.length ? `<div class="r-sub">${esc(c.notes.join(' · '))}</div>` : ''}</div>`).join('')}` : ''}
      ${PROFILE.additional ? `<h2>ADDITIONAL INFORMATION</h2><div class="r-sk">${esc(PROFILE.additional)}</div>` : ''}
      <div class="r-note">${jobs.length && schools.length ? 'References' : 'Full employment history, education and references'} available on request.</div>
    </div>`;
          }
        });
      }

      /* ---- System Properties — the 15-second version for a recruiter ---- */
      const RESUME_FILE = '/resume.pdf';

      /* Drop a real PDF at public/resume.pdf and the button becomes a genuine
         download. Until then it opens the résumé that already exists inside the OS,
         so the label never promises a file that is not there. */
      async function resumeFileExists() {
        try {
          const res = await fetch(RESUME_FILE, { method: 'HEAD' });
          return res.ok;
        } catch { return false; }
      }

      function openSysProps() {
        WM.create({
          id: 'sysprops', title: 'System Properties', icon: svg('computer', 14), w: 470, h: 'auto', dialog: true,
          build(body, api) {
            body.className = 'win-body app-sys';
            const spec = [
              ['Role', PROFILE.role],
              ['Experience', PROFILE.experience],
              ['Location', PROFILE.location],
              ['Timezone', PROFILE.timezone],
              ['Status', `<span class="sys-live${PROFILE.available ? '' : ' off'}"><i></i>${esc(PROFILE.status)}</span>`],
              ['Languages', PROFILE.languages]
            ];
            body.innerHTML = `<div class="sys-page">
        <div class="sys-fields">
          <div class="sys-group"><b>System:</b>
            <div class="sys-lines">PortfolioOS 98<br>Version 4.10.1998</div></div>
          <div class="sys-group"><b>Registered to:</b>
            <div class="sys-lines">${esc(PROFILE.name)}</div>
            <dl class="sys-spec">${spec.map(([k, v]) =>
              `<dt>${esc(k)}</dt><dd>${k === 'Status' ? v : esc(v)}</dd>`).join('')}</dl></div>
        </div>
        <div class="sys-logo">${svg('computer', 48)}<span>PortfolioOS<b>98</b></span></div>
      </div>
      <div class="sys-sep"></div>
      <div class="sys-actions">
        <button class="btn" type="button" data-a="resume">Resume</button>
        <button class="btn" type="button" data-a="contact">Contact</button>
        <button class="btn" type="button" data-a="ok">OK</button>
      </div>`;

            const resumeBtn = body.querySelector('[data-a="resume"]');
            let downloadable = false;
            resumeFileExists().then(found => {
              downloadable = found;
              resumeBtn.textContent = found ? 'Download Resume' : 'View Resume';
            });
            resumeBtn.addEventListener('click', () => {
              if (downloadable) {
                const link = document.createElement('a');
                link.href = RESUME_FILE; link.download = '';
                document.body.appendChild(link); link.click(); link.remove();
                return;
              }
              openResume();
            });
            body.querySelector('[data-a="contact"]').addEventListener('click', openContact);
            body.querySelector('[data-a="ok"]').addEventListener('click', () => api.close());
            setTimeout(() => body.querySelector('[data-a="ok"]').focus(), 60);
          }
        });
      }

      /* ---- Contact.exe — compose and post to /api/hire ---- */
      function openContact() {
        let sendRef = null;
        WM.create({
          id: 'contact', title: 'New Message — Portfolio Mail', icon: svg('mail', 14), w: 450, h: 410,
          menubar: [
            {
              label: 'File', items: [
                { label: 'Send message', act: () => { if (sendRef) sendRef(); } },
                { sep: true },
                { label: 'Close', act: a => a.close() }
              ]
            },
            { label: 'Help', items: [{ label: 'About PortfolioOS', act: aboutOS }] }
          ],
          status: ['Ready', 'Delivery: /api/hire'],
          build(body, api) {
            body.className = 'win-body app-mail';
            body.innerHTML = `<div class="mail-tools">
        <button class="btn sm" data-a="send">Send</button>
        <button class="btn sm" data-a="attach">Attach&hellip;</button>
        <button class="btn sm" data-a="clear">Clear</button>
        <span class="grow"></span>
      </div>
      <div class="mail-form">
        <div class="cm-row"><label>To:</label><div class="cm-to">${LINKS.email}</div></div>
        <div class="cm-row"><label>Your name:</label><input class="field" data-f="name" placeholder="e.g. Jordan Rivera"></div>
        <div class="cm-row"><label>Your e-mail:</label><input class="field" data-f="email" placeholder="you@company.com" spellcheck="false"></div>
        <div class="cm-row"><label>Subject:</label><input class="field" data-f="subj" placeholder="Project inquiry, freelance, or hello"></div>
        <div class="cm-row"><label>Message:</label><textarea class="field cm-text" data-f="msg" placeholder="What are we building?"></textarea></div>
        <label class="wiz-hp" aria-hidden="true">Leave this field empty<input tabindex="-1" autocomplete="off" data-f="website"></label>
        <div class="cm-alt">Hiring? Run <a href="#" class="alt-hire">Hire_Me.exe</a> instead &mdash; it asks the useful questions in five steps.<br>
          Prefer social? &nbsp;<a href="${LINKS.github}" target="_blank" rel="noopener">GitHub</a> &middot;
          <a href="${LINKS.linkedin}" target="_blank" rel="noopener">LinkedIn</a> &middot;
          <a href="#" class="alt-fiverr">Fiverr profile</a></div>
      </div>`;
            const g = k => body.querySelector('[data-f="' + k + '"]');
            const hp = body.querySelector('[data-f="website"]');
            const openedAt = Date.now();
            let sending = false;
            /* Delivery now goes through /api/hire. The mail client is the fallback,
               reached only when the server says it could not pass the message on. */
            async function doSend() {
              if (sending) return;
              const name = g('name').value.trim(), email = g('email').value.trim(),
                subj = g('subj').value.trim(), msg = g('msg').value.trim();
              if (!name || !email || !msg) {
                beep(620, 110);
                errorDialog('Portfolio Mail', 'The message is incomplete.<br><b>Name, e-mail and message</b> are required.<br>The subject is optional courage.');
                return;
              }
              if (!MAIL_RE.test(email)) {
                beep(620, 110);
                errorDialog('Portfolio Mail', 'That e-mail address looks structurally impossible.<br>Check it &mdash; the 90s were unforgiving about typos.');
                return;
              }
              const bodyTxt = 'New message from PortfolioOS \u2014 Contact.exe\n\n' +
                'Name    : ' + name + '\n' + 'E-mail  : ' + email + '\n' +
                (subj ? 'Subject : ' + subj + '\n' : '') + '\n' + msg;
              sending = true;
              api.status[0].textContent = 'Sending\u2026';
              hourglass(700);
              const result = await sendInquiry({
                kind: 'message', source: 'Contact.exe',
                name, email, subject: subj, message: msg,
                elapsedMs: Date.now() - openedAt, website: hp.value
              });
              sending = false;
              if (result.ok) {
                beep(880, 90);
                api.status[0].textContent = 'Message sent.';
                ['name', 'email', 'subj', 'msg'].forEach(k => g(k).value = '');
                dialogBox({
                  title: 'Message Sent', icon: svg('openmail', 32), w: 440, msg:
                    `<b>Delivered.</b> The message reached the inbox directly &mdash; no mail client,
           no copy-paste, no wondering whether it arrived.<br><br>
           <span class="dim">A reply usually follows within a couple of working days.</span>`});
                return;
              }
              beep(300, 170);
              api.status[0].textContent = 'Not sent.';
              dialogBox({
                title: 'Message Not Sent', icon: svg('warn', 32), w: 470,
                msg: `${esc(inquiryProblem(result.error))}<br><br>
          <span class="dim">Your text is still in the window. <b class="inline">Open e-mail app</b>
          hands the same message to your mail client instead.</span>`,
                buttons: [
                  { t: 'Open e-mail app', act: x => { inquiryMailto(subj || ('Message from ' + name), bodyTxt); x.close(); } },
                  { t: 'Close' }
                ]
              });
            }
            sendRef = doSend;
            body.querySelector('[data-a="send"]').addEventListener('click', doSend);
            body.querySelector('[data-a="attach"]').addEventListener('click', () => {
              errorDialog('Portfolio Mail', 'Attach failed: floppy drive A: is empty.<br>Please insert disk 1 of 14.');
            });
            body.querySelector('[data-a="clear"]').addEventListener('click', () => {
              ['name', 'email', 'subj', 'msg'].forEach(k => g(k).value = '');
              api.status[0].textContent = 'Ready';
            });
            body.querySelector('.alt-fiverr').addEventListener('click', e => { e.preventDefault(); openFiverr(); });
            body.querySelector('.alt-hire').addEventListener('click', e => { e.preventDefault(); openHire(); });
          }
        });
      }
