/* =================================================================
         inquiry transport — Hire_Me.exe and Contact.exe both post here
      ================================================================= */
      const HIRE_ENDPOINT = '/api/hire';
      const HIRE_INBOX = LINKS.email;
      const MAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

      /* Asks whether the deployment can actually deliver, so the wizard can say so
         before anyone fills in five steps. */
      async function inquiryConfigured() {
        try {
          const res = await fetch(HIRE_ENDPOINT, { headers: { Accept: 'application/json' } });
          const data = await res.json();
          return !!data.configured;
        } catch { return false; }
      }

      async function sendInquiry(payload) {
        try {
          const res = await fetch(HIRE_ENDPOINT, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload)
          });
          let data = null;
          try { data = await res.json(); } catch { }
          if (res.ok && data && data.ok) return { ok: true };
          return { ok: false, error: (data && data.error) || ('http_' + res.status) };
        } catch { return { ok: false, error: 'network' }; }
      }

      function inquiryProblem(error) {
        if (error === 'rate_limit') return 'Several messages have already come from this connection. Give it a few minutes, or use the e-mail fallback.';
        if (error === 'too_fast') return 'That arrived faster than a person can type, so it was held back as spam. Try once more.';
        if (error === 'validation') return 'The server rejected the details — check the name and e-mail address.';
        if (error === 'network') return 'The request never reached the server. Check your connection, or use the e-mail fallback.';
        if (error === 'not_configured') return 'This copy of PortfolioOS has no delivery route configured, so nothing was sent.';
        return 'The server could not pass the message on.';
      }

      /* The original mailto: path. Still here, but only as the fallback for when the
         server cannot deliver — no longer the one way a message can reach anyone. */
      function inquiryMailto(subject, text) {
        window.location.href = 'mailto:' + HIRE_INBOX + '?subject=' + encodeURIComponent(subject) +
          '&body=' + encodeURIComponent(text);
      }

      /* ---- Hire_Me.exe — Windows 98 style setup wizard ---- */
      const FULLTIME = 'Full-time role';
      const HIRE_FLOW = [
        {
          key: 'engagement',
          h: 'How would you like to work together?',
          sub: 'Everything after this follows from your answer.',
          opts: () => [
            { v: FULLTIME, d: 'Employment on your team, for the long run.' },
            { v: 'Freelance / contract project', d: 'A defined scope, with a start and an end.' }
          ]
        },
        {
          key: 'projectType',
          h: s => s.engagement === FULLTIME ? 'Where would I sit on the team?' : 'What are we building?',
          sub: 'The closest match is enough — details come later.',
          opts: s => s.engagement === FULLTIME ? [
            { v: 'Frontend', d: 'Interfaces, design systems, browser performance.' },
            { v: 'Backend', d: 'APIs, data models, services, background work.' },
            { v: 'Fullstack', d: 'Both ends, feature by feature.' },
            { v: 'Still shaping the role', d: 'You know you need someone, not yet exactly what.' }
          ] : [
            { v: 'Web application', d: 'Dashboards, SaaS, internal tools.' },
            { v: 'E-commerce / storefront', d: 'Catalogue, checkout, payments.' },
            { v: 'API / backend service', d: 'Data, integrations, automation.' },
            { v: 'Design to code', d: 'A finished design that needs building properly.' },
            { v: 'Something else', d: 'Tell me about it on the contact step.' }
          ]
        },
        {
          key: 'budget',
          h: s => s.engagement === FULLTIME ? 'What is the salary range?' : 'What is the budget?',
          sub: 'A range is plenty. It shapes the scope, not the welcome.',
          opts: s => s.engagement === FULLTIME ? [
            { v: 'Under $60k / year', d: '' },
            { v: '$60k – $90k / year', d: '' },
            { v: '$90k – $130k / year', d: '' },
            { v: 'Above $130k / year', d: '' },
            { v: 'Rather discuss it first', d: 'Happy to talk before anyone names a number.' }
          ] : [
            { v: 'Under $2,000', d: 'Small and tightly scoped.' },
            { v: '$2,000 – $5,000', d: '' },
            { v: '$5,000 – $15,000', d: '' },
            { v: 'Above $15,000', d: '' },
            { v: 'Not decided yet', d: 'Scope first, price afterwards.' }
          ]
        },
        {
          key: 'timeline',
          h: 'When would this start?',
          opts: () => [
            { v: 'As soon as possible', d: '' },
            { v: 'Within a month', d: '' },
            { v: 'In one to three months', d: '' },
            { v: 'Just exploring for now', d: 'No date yet is a perfectly good answer.' }
          ]
        },
        {
          key: 'contact', form: true,
          h: 'How do I reach you?',
          sub: 'Name and e-mail are required. The rest just helps me reply usefully.'
        },
        {
          key: 'review', review: true,
          h: 'Ready to send',
          sub: 'Check the summary, then press Finish.'
        }
      ];

      const HIRE_FIELDS = [
        ['name', 'Your name', 'e.g. Jordan Rivera', false],
        ['email', 'E-mail', 'you@company.com', false],
        ['company', 'Company', 'Optional', false],
        ['message', 'Anything else', 'Context, links, deadlines — optional', true]
      ];

      function openHire() {
        const state = { engagement: '', projectType: '', budget: '', timeline: '', name: '', email: '', company: '', message: '' };
        const openedAt = Date.now();
        let step = 0, busy = false, configured = null, outcome = null;
        /* the File menu closure is created before build(), so this lives here */
        let paintAll = () => { };

        WM.create({
          id: 'hire', title: 'Hire Me — PortfolioOS Setup Wizard', icon: svg('briefcase', 14), w: 540, h: 440,
          menubar: [
            {
              label: 'File', items: [
                { label: 'Start over', act: () => { Object.keys(state).forEach(k => state[k] = ''); step = 0; outcome = null; paintAll(); } },
                { sep: true },
                { label: 'Close', act: a => a.close() }
              ]
            },
            {
              label: 'Help', items: [
                { label: 'Prefer plain e-mail…', act: openContact },
                { label: 'About PortfolioOS', act: aboutOS }
              ]
            }
          ],
          build(body, api) {
            body.className = 'win-body app-wiz';
            body.innerHTML = `<div class="wiz-main">
        <div class="wiz-side">${svg('briefcase', 32)}<b>Hire<br>Me</b><div class="wiz-dots"></div></div>
        <div class="wiz-body"></div>
      </div>
      <label class="wiz-hp" aria-hidden="true">Leave this field empty
        <input tabindex="-1" autocomplete="off" data-f="website"></label>
      <div class="wiz-sep"></div>
      <div class="wiz-nav">
        <button class="btn" type="button" data-a="back">&lt; Back</button>
        <button class="btn" type="button" data-a="next">Next &gt;</button>
        <span class="gap"></span>
        <button class="btn" type="button" data-a="cancel">Cancel</button>
      </div>`;

            const pane = body.querySelector('.wiz-body');
            const dots = body.querySelector('.wiz-dots');
            const hp = body.querySelector('[data-f="website"]');
            const nav = {
              back: body.querySelector('[data-a="back"]'),
              next: body.querySelector('[data-a="next"]'),
              cancel: body.querySelector('[data-a="cancel"]')
            };
            dots.innerHTML = HIRE_FLOW.map(() => '<i class="wiz-dot"></i>').join('');
            const show = (el, on) => { el.style.display = on ? '' : 'none'; };

            function ready() {
              const d = HIRE_FLOW[step];
              if (d.form) return !!state.name.trim() && MAIL_RE.test(state.email.trim());
              if (d.review) return true;
              return !!state[d.key];
            }

            function summaryText() {
              const rows = [['Engagement', state.engagement], ['Focus', state.projectType],
              ['Budget', state.budget], ['Timeline', state.timeline],
              ['Name', state.name.trim()], ['E-mail', state.email.trim()]];
              if (state.company.trim()) rows.push(['Company', state.company.trim()]);
              let out = 'New inquiry from PortfolioOS — Hire_Me.exe\n\n' +
                rows.map(([k, v]) => k.padEnd(11) + ': ' + v).join('\n');
              if (state.message.trim()) out += '\n\nNotes:\n' + state.message.trim();
              return out;
            }

            function paintDots() {
              dots.querySelectorAll('.wiz-dot').forEach((dot, i) => dot.classList.toggle('on', i <= step));
            }

            function paintNav() {
              const d = HIRE_FLOW[step];
              if (outcome) {
                show(nav.back, !outcome.ok);
                show(nav.next, !outcome.ok);
                nav.back.disabled = false;
                nav.next.textContent = 'Open e-mail app';
                nav.next.disabled = false;
                nav.cancel.textContent = 'Close';
                return;
              }
              show(nav.back, true); show(nav.next, true);
              nav.back.disabled = step === 0 || busy;
              nav.next.textContent = busy ? 'Sending…' : (d.review ? 'Finish' : 'Next >');
              nav.next.disabled = busy || !ready();
              nav.cancel.textContent = 'Cancel';
            }

            function paintOutcome() {
              const ok = outcome.ok;
              const icon = svg(ok ? 'openmail' : 'warn', 32);
              const text = ok
                ? (outcome.fallback
                  ? '<b>Handed to your e-mail application</b>, with the summary already written out. Press Send there and it is on its way.'
                  : '<b>Your inquiry is on its way.</b> It landed in my inbox with everything you picked, so the reply can be about the work rather than about scheduling a call to ask what the work is.<br><br><span class="dim">Expect an answer within a couple of working days.</span>')
                : esc(inquiryProblem(outcome.error)) +
                '<br><br><span class="dim">Nothing was lost — <b>Open e-mail app</b> below hands the same summary to your mail client, or step <b>Back</b> to try again.</span>';
              pane.innerHTML = `<div class="wiz-h">${ok ? 'All done' : 'Not sent'}</div>
        <div class="wiz-msg">${icon}<div>${text}</div></div>`;
              pane.scrollTop = 0;
              paintNav();
            }

            paintAll = function () {
          if (outcome) { paintOutcome(); paintDots(); return; }
              const d = HIRE_FLOW[step];
              const heading = typeof d.h === 'function' ? d.h(state) : d.h;
              const sub = typeof d.sub === 'function' ? d.sub(state) : (d.sub || '');
              let html = `<div class="wiz-h">${esc(heading)}</div>`;
              if (sub) html += `<div class="wiz-sub">${esc(sub)}</div>`;

              if (d.opts) {
                const opts = d.opts(state);
                html += `<div class="wiz-opts" role="radiogroup" aria-label="${esc(heading)}">` +
                  opts.map(o => `<label class="wiz-opt${state[d.key] === o.v ? ' on' : ''}">
            <input class="rad" type="radio" name="wiz-${d.key}" value="${esc(o.v)}"${state[d.key] === o.v ? ' checked' : ''}>
            <span><span class="wiz-opt-t">${esc(o.v)}</span>${o.d ? `<span class="wiz-opt-d">${esc(o.d)}</span>` : ''}</span>
          </label>`).join('') + `</div>`;
              } else if (d.form) {
                html += '<div class="wiz-rows">' + HIRE_FIELDS.map(([f, label, ph, multi]) => {
                  const id = 'wiz-f-' + f;
                  const control = multi
                    ? `<textarea id="${id}" class="field wiz-text" data-f="${f}" placeholder="${esc(ph)}">${esc(state[f])}</textarea>`
                    : `<input id="${id}" class="field" data-f="${f}" placeholder="${esc(ph)}" value="${esc(state[f])}"${f === 'email' ? ' spellcheck="false"' : ''}>`;
                  return `<div class="wiz-row"><label for="${id}">${esc(label)}:</label>${control}</div>`;
                }).join('') + '</div>';
              } else if (d.review) {
                const rows = [['Engagement', state.engagement], ['Focus', state.projectType],
                ['Budget', state.budget], ['Timeline', state.timeline],
                ['Name', state.name.trim()], ['E-mail', state.email.trim()]];
                if (state.company.trim()) rows.push(['Company', state.company.trim()]);
                if (state.message.trim()) rows.push(['Notes', state.message.trim()]);
                html += '<dl class="wiz-sum">' + rows.map(([k, v]) => `<dt>${esc(k)}</dt><dd>${esc(v)}</dd>`).join('') + '</dl>';
                html += '<div class="wiz-note">' + (
                  configured === null ? 'Checking the delivery route…'
                    : configured ? 'Press <b>Finish</b> and this goes straight to my inbox.'
                      : 'This deployment has no delivery route configured, so <b>Finish</b> will hand the summary to your e-mail application instead.') + '</div>';
              }

              pane.innerHTML = html;
              pane.scrollTop = 0;

              pane.querySelectorAll('.rad').forEach(input => input.addEventListener('change', () => {
                state[d.key] = input.value;
                pane.querySelectorAll('.wiz-opt').forEach(opt =>
                  opt.classList.toggle('on', opt.querySelector('.rad').checked));
                paintNav();
              }));
              pane.querySelectorAll('[data-f]').forEach(input => input.addEventListener('input', () => {
                state[input.dataset.f] = input.value;
                paintNav();
              }));

              paintDots();
              paintNav();
            };

            async function finish() {
              if (busy) return;
              busy = true; paintNav(); hourglass(700);
              const result = await sendInquiry({
                kind: 'inquiry', source: 'Hire_Me.exe',
                engagement: state.engagement, projectType: state.projectType,
                budget: state.budget, timeline: state.timeline,
                name: state.name.trim(), email: state.email.trim(),
                company: state.company.trim(), message: state.message.trim(),
                elapsedMs: Date.now() - openedAt, website: hp.value
              });
              busy = false;
              outcome = result.ok ? { ok: true } : { ok: false, error: result.error };
              beep(result.ok ? 880 : 300, result.ok ? 90 : 170);
              paintAll();
            }

            nav.back.addEventListener('click', () => {
              if (outcome) { outcome = null; paintAll(); return; }
              if (step > 0) { step--; paintAll(); }
            });
            nav.next.addEventListener('click', () => {
              if (outcome) {
                inquiryMailto('Project inquiry from ' + (state.name.trim() || 'PortfolioOS'), summaryText());
                outcome = { ok: true, fallback: true };
                paintAll();
                return;
              }
              if (!ready()) return;
              if (HIRE_FLOW[step].review) { finish(); return; }
              step++; paintAll();
            });
            nav.cancel.addEventListener('click', () => api.close());

            inquiryConfigured().then(value => {
              configured = value;
              if (!outcome && HIRE_FLOW[step].review) paintAll();
            });

            paintAll();
          }
        });
      }
