      /* =================================================================
         Mailbox.exe — Hire_Me and Contact submissions
         ================================================================= */
      /* Reads through /api/inbox with the session cookie, so it works after a
         reload without another sign-in. It reuses the Testimonial Express layout
         (list above, preview below); every stored value goes through esc() or
         textContent, because a submission is text a stranger typed. */
      let mailboxRefs = null;

      const MAILBOX_TABS = {
        hire: { label: 'Hire Me', empty: 'No Hire_Me.exe submissions yet.' },
        contact: { label: 'Contact', empty: 'No Contact.exe messages yet.' }
      };

      function mailboxDate(iso, short) {
        const d = new Date(iso);
        if (Number.isNaN(d.getTime())) return '';
        return short ? d.toLocaleDateString(undefined, { day: '2-digit', month: 'short' }) : d.toLocaleString();
      }

      /* The line shown beside the sender's name in the list. */
      function mailboxSubject(kind, m) {
        if (kind === 'contact') return m.subject || '(no subject)';
        return [m.projectType, m.budget].filter(Boolean).join(' · ') || '(no details)';
      }

      function mailboxDetail(label, value) {
        return value ? `<div class="mb-row"><span class="mb-k">${esc(label)}</span><span class="mb-v">${esc(value)}</span></div>` : '';
      }

      /* Hire_Me.exe's "Anything else" box and Contact.exe's message both land in
         `message`, so both kinds show it; on a hire it sits under a label because
         the structured answers come first. */
      function mailboxText(label, text) {
        if (!text) return '';
        return (label ? `<div class="mb-label">${esc(label)}</div>` : '') + `<div class="mb-body">${esc(text)}</div>`;
      }

      function mailboxPreview(kind, m) {
        const body = kind === 'contact'
          ? mailboxText('', m.message || '')
          : mailboxDetail('Engagement', m.engagement) + mailboxDetail('Project', m.projectType) +
            mailboxDetail('Budget', m.budget) + mailboxDetail('Timeline', m.timeline) +
            mailboxText('Anything else', m.message);
        const delivery = m.delivered ? 'Delivered to your inbox' : 'Not delivered' + (m.deliveryError ? ' — ' + m.deliveryError : '');
        return `<div class="prev-hdr"><div class="prev-who">
          <div class="prev-from"><b>${esc(m.name)}</b> <a class="dim" href="mailto:${esc(m.email)}">${esc(m.email)}</a></div>
          <div class="prev-subj">${esc(kind === 'contact' ? mailboxSubject(kind, m) : 'Hire_Me.exe')}</div></div>
          <div class="prev-date">${esc(mailboxDate(m.createdAt))}</div></div>` +
          mailboxDetail('Company', m.company) + body +
          `<div class="mb-foot">${esc(delivery)}</div>`;
      }

      function openMailbox() {
        if (!MAILBOX.signedIn) {
          errorDialog('Mailbox', 'Access denied.<br>Sign in from the Terminal first.');
          return;
        }
        WM.create({
          id: 'mailbox', title: 'Mailbox — Hire_Me & Contact', icon: svg('mail', 14), w: 640, h: 480,
          menubar: [
            {
              label: 'File', items: [
                { label: 'Refresh', act: () => mailboxRefs && mailboxRefs.reload() },
                { label: 'Sign out…', act: mailboxSignOutDialog },
                { sep: true },
                { label: 'Close', act: a => a.close() }
              ]
            },
            { label: 'Help', items: [{ label: 'About PortfolioOS', act: aboutOS }] }
          ],
          status: ['Loading…', 'Mailbox'],
          onClose() { mailboxRefs = null; },
          build(body, api) {
            body.className = 'win-body app-inbox app-mailbox';
            body.innerHTML = `<div class="ib-tools">
        <button class="btn sm" data-tab="hire"></button>
        <button class="btn sm" data-tab="contact"></button>
        <span class="grow"></span>
        <button class="btn sm" data-a="refresh">Refresh</button>
        <button class="btn sm" data-a="signout">Sign out</button>
      </div>
      <div class="ib-list"></div>
      <div class="ib-prev" hidden></div>`;
            const list = body.querySelector('.ib-list'), prev = body.querySelector('.ib-prev');
            const tabs = { hire: { items: [], page: 0, pages: 1, total: 0, loaded: false, error: '' },
              contact: { items: [], page: 0, pages: 1, total: 0, loaded: false, error: '' } };
            let kind = 'hire', selId = null, busy = false;

            function renderTabs() {
              Object.keys(MAILBOX_TABS).forEach(k => {
                const b = body.querySelector('[data-tab="' + k + '"]');
                const n = MAILBOX.unread[k];
                b.textContent = MAILBOX_TABS[k].label + (n ? ' (' + n + ')' : '');
                b.classList.toggle('on', k === kind);
              });
              const t = tabs[kind];
              api.status[0].textContent = busy ? 'Loading…'
                : t.total + ' message' + (t.total === 1 ? '' : 's') + ', ' + MAILBOX.unread[kind] + ' unread';
              api.status[1].textContent = 'Signed in as ' + MAILBOX.username;
            }

            function render() {
              const t = tabs[kind];
              list.innerHTML = '';
              if (!t.items.length) {
                list.innerHTML = '<div class="ib-empty"></div>';
                list.firstChild.textContent = busy ? 'Loading…' : t.error || MAILBOX_TABS[kind].empty;
              }
              t.items.forEach(m => {
                const row = document.createElement('div');
                row.className = 'msg-row' + (m.readAt ? '' : ' unread') + (m.id === selId ? ' sel' : '');
                row.innerHTML = `<span class="m-ic">${svg(m.readAt ? 'openmail' : 'mail', 14)}</span>` +
                  `<span class="m-from">${esc(m.name)}</span><span class="m-subj">${esc(mailboxSubject(kind, m))}</span>` +
                  `<span class="m-date">${esc(mailboxDate(m.createdAt, true))}</span>`;
                row.addEventListener('click', () => select(m));
                list.appendChild(row);
              });
              if (t.page < t.pages) {
                const more = document.createElement('button');
                more.type = 'button'; more.className = 'btn sm mb-more'; more.textContent = 'Load older messages';
                more.addEventListener('click', () => load(kind, t.page + 1));
                list.appendChild(more);
              }
              renderTabs();
            }

            async function load(k, page) {
              if (busy) return;
              busy = true; tabs[k].error = ''; render();
              const data = await mailboxRequest(MAILBOX_ENDPOINT + '?kind=' + k + '&page=' + page);
              busy = false;
              if (!mailboxRefs) return;
              const t = tabs[k];
              if (data.ok) {
                const seen = new Set(page === 1 ? [] : t.items.map(x => x.id));
                t.items = (page === 1 ? [] : t.items).concat(data.items.filter(x => !seen.has(x.id)));
                t.page = data.page; t.pages = data.pages; t.total = data.total; t.loaded = true;
                mailboxSetUnread(data.unread);
              } else if (MAILBOX.signedIn) {
                t.error = 'Could not load messages. ' + (data.error === 'network' ? 'Check your connection.' : 'Try again shortly.');
              }
              render();
            }

            async function select(m) {
              selId = m.id;
              prev.hidden = false;
              prev.innerHTML = mailboxPreview(kind, m);
              render();
              if (m.readAt) return;
              const data = await mailboxRequest(MAILBOX_ENDPOINT + '/' + encodeURIComponent(m.id) + '?kind=' + kind, { method: 'PATCH' });
              if (!data.ok || !mailboxRefs) return;
              m.readAt = data.item && data.item.readAt ? data.item.readAt : new Date().toISOString();
              mailboxSetUnread(data.unread);
              render();
            }

            function show(k) {
              kind = k; selId = null; prev.hidden = true;
              if (!tabs[k].loaded) load(k, 1); else render();
            }

            function reload() {
              tabs[kind].loaded = false;
              load(kind, 1);
            }

            body.querySelectorAll('[data-tab]').forEach(b => b.addEventListener('click', () => show(b.dataset.tab)));
            body.querySelector('[data-a="refresh"]').addEventListener('click', reload);
            body.querySelector('[data-a="signout"]').addEventListener('click', mailboxSignOutDialog);
            mailboxRefs = { api, tabs: renderTabs, reload };
            show('hire');
          }
        });
      }

      function mailboxSignOutDialog() {
        dialogBox({
          title: 'Sign out', icon: svg('warn', 32), w: 380,
          msg: '<b>Sign out of Mailbox?</b>The 30-day cookie on this browser is removed. You will need to sign in from the Terminal again to read your messages.',
          buttons: [
            { t: 'Sign out', act: async api => { api.close(); await mailboxSignOut(); } },
            { t: 'Cancel' }
          ]
        });
      }
