/* =================================================================
         TESTIMONI SEBAGAI NOTIFIKASI
      ================================================================= */
      /* Nothing is preloaded. Each delivery is its own request for the next
         page of GET /api/testimonials with a limit of 1, so TESTIMONIALS only
         ever holds what has already arrived. `cursor` is the page to ask for
         next; `total` comes back with every page and says when to stop. `gen`
         changes on restart, so a request that was in flight then cannot
         schedule into the new session. */
      const TESTIMONIALS = [];
      const TESTIMONIAL_ENDPOINT = '/api/testimonials';
      const testiState = { cursor: 1, total: null, pending: null, gen: 0, started: false, doneToast: false, timers: [] };
      /* id → read flag for everything delivered this visit, so a message a
         resync pushed out of the list comes back quietly, not as news. */
      const testiSeen = new Map();
      let inboxRefs = null;
      const activeToasts = [], toastQueue = [];

      function uhoh() { beep(880, 80, .05); setTimeout(() => beep(587, 130, .05), 110); }

      async function fetchTestimonials(page, limit) {
        try {
          const res = await fetch(TESTIMONIAL_ENDPOINT + '?page=' + page + '&limit=' + limit, {
            headers: { Accept: 'application/json' }, signal: AbortSignal.timeout(10000)
          });
          const data = await res.json();
          if (res.ok && data && data.ok) return data;
        } catch { }
        return { ok: false };
      }

      const testimonialsExhausted = () => testiState.total !== null && testiState.cursor > testiState.total;

      function updateTrayBadge() {
        const unread = TESTIMONIALS.filter(t => !t._read).length;
        const btn = $('#testbtn');
        btn.innerHTML = svg(unread ? 'mail' : 'openmail', 14) + (unread ? `<span class="badge">${unread > 9 ? '9+' : unread}</span>` : '');
        btn.title = unread ? unread + ' unread testimonial' + (unread > 1 ? 's' : '') : 'Testimonials — Testimonial Express';
      }
      $('#testbtn').addEventListener('click', () => openInbox());

      function showToast(cfg) {
        if (activeToasts.length >= 2) { toastQueue.push(cfg); return; }
        const el = document.createElement('div'); el.className = 'toast';
        el.innerHTML = `<div class="titlebar"><span class="tb-ic">${cfg.icon}</span><span class="tb-text"></span>` +
          `<span class="tb-btns"><button class="tb-btn" title="Close">${GLY.close}</button></span></div>` +
          `<div class="toast-body">${cfg.html}</div>` +
          (cfg.foot ? `<div class="toast-foot">${cfg.foot}</div>` : '');
        el.querySelector('.tb-text').textContent = cfg.title;
        const rec = { el, timer: setTimeout(() => dismissToast(el), 10000) };
        el._rec = rec;
        el.querySelector('.tb-btn').addEventListener('click', e => { e.stopPropagation(); dismissToast(el); });
        el.addEventListener('click', () => { if (cfg.onClick) cfg.onClick(); dismissToast(el); });
        document.body.appendChild(el);
        activeToasts.push(rec);
        layoutToasts();
      }
      function dismissToast(el) {
        const rec = el._rec; if (!rec) return;
        clearTimeout(rec.timer);
        const i = activeToasts.indexOf(rec); if (i > -1) activeToasts.splice(i, 1);
        el.remove(); layoutToasts();
        if (toastQueue.length && activeToasts.length < 2) showToast(toastQueue.shift());
      }
      function layoutToasts() {
        let bottom = 34;
        for (let i = activeToasts.length - 1; i >= 0; i--) {
          activeToasts[i].el.style.bottom = bottom + 'px';
          bottom += activeToasts[i].el.offsetHeight + 6;
        }
      }
      /* The photo URL is optional in practice: the server drops anything that is
         not http(s), and then the pixel person stands in. */
      function testimonialAvatar(t, size) {
        return t.avatar
          ? `<img src="${esc(t.avatar)}" alt="">`
          : personIcon({ hair: '#2f211b', skin: '#e8b98f', shirt: '#000080' }, size);
      }
      function testimonialToast(t) {
        const short = t.text.length > 108 ? t.text.slice(0, 105) + '\u2026' : t.text;
        showToast({
          title: 'Testimonial Express', icon: svg('mail', 14),
          html: `<div class="t-av">${testimonialAvatar(t, 30)}</div><div class="t-msg">
      <div class="t-from">New testimonial from <b>${esc(t.from)}</b></div>
      <div class="t-role">${esc(t.role)}</div>
      <div class="t-prev">&ldquo;${esc(short)}&rdquo;</div>
      <div class="t-stars">${starsHTML(t.stars, 10)}</div></div>`,
          foot: 'click to open \u2014 auto-closes in 10s',
          onClick: () => openInbox(t)
        });
      }
      function upToDateToast() {
        if (testiState.doneToast) return;
        testiState.doneToast = true;
        showToast({
          title: 'Testimonial Express', icon: svg('mail', 14),
          html: '<b>Inbox up to date.</b><div class="t-prev">You have reached the end of the praise. Thank you for reading every one.</div>',
          foot: 'this notification will now stop'
        });
      }

      /* Resolves to 'delivered', 'done' (nothing left) or 'failed' (the server
         could not be reached). Only one request is ever in flight, so the timer
         and Send/Receive can never both fetch the same page. */
      function deliverTestimonial(silent) {
        if (!testiState.pending) {
          testiState.pending = receiveTestimonial(silent).finally(() => { testiState.pending = null; });
        }
        return testiState.pending;
      }
      async function receiveTestimonial(silent) {
        for (; ;) {
          if (testimonialsExhausted()) return 'done';
          const result = await fetchTestimonials(testiState.cursor, 1);
          if (!result.ok) return 'failed';
          testiState.total = result.total;
          const t = result.items[0];
          if (!t) return 'done';
          testiState.cursor++;
          /* Offsets shift when an entry is added mid-visit; never show one twice. */
          if (TESTIMONIALS.some(x => x.id === t.id)) continue;
          const seen = testiSeen.has(t.id);
          t._read = seen && testiSeen.get(t.id);
          testiSeen.set(t.id, t._read);
          TESTIMONIALS.push(t);
          updateTrayBadge();
          if (inboxRefs && WM.wins.has('testimonials')) inboxRefs.render();
          if (!silent && !seen) { uhoh(); testimonialToast(t); }
          return 'delivered';
        }
      }
      function scheduleNext(ms) {
        const gen = testiState.gen;
        const id = setTimeout(async () => {
          /* The id leaves the list only once the delivery settles, so a resync
             running meanwhile sees a live chain and does not start another. */
          const result = await deliverTestimonial();
          testiState.timers = testiState.timers.filter(x => x !== id);
          if (gen !== testiState.gen) return;
          if (result === 'delivered') scheduleNext(40000 + Math.random() * 35000);
          else if (result === 'failed') scheduleNext(60000);
          else if (TESTIMONIALS.length) upToDateToast();
        }, ms);
        testiState.timers.push(id);
      }
      async function startTestimonials() {
        if (testiState.started) return;
        testiState.started = true;
        const gen = testiState.gen;
        const result = await deliverTestimonial(true);
        if (gen !== testiState.gen) return;
        /* An empty inbox stays quiet rather than announcing it has been read. */
        if (result === 'delivered') scheduleNext(9000);
        else if (result === 'failed') scheduleNext(60000);
      }
      function resetTestiTimers() {
        testiState.gen++;
        testiState.timers.forEach(clearTimeout); testiState.timers = [];
        activeToasts.slice().forEach(r => dismissToast(r.el));
        toastQueue.length = 0;
        if (testiState.started && !testimonialsExhausted()) scheduleNext(15000);
      }
      /* After a terminal save the messages already in the inbox are fetched
         again as one page, so an edit shows at once. Read flags carry over by
         id, and delivery resumes right after them. */
      async function resyncTestimonials() {
        if (testiState.pending) await testiState.pending;
        testiState.total = null;
        if (TESTIMONIALS.length) {
          const result = await fetchTestimonials(1, TESTIMONIALS.length);
          if (!result.ok) return;
          result.items.forEach(t => {
            t._read = !!testiSeen.get(t.id);
            testiSeen.set(t.id, t._read);
          });
          TESTIMONIALS.splice(0, TESTIMONIALS.length, ...result.items);
          testiState.total = result.total;
        }
        testiState.cursor = TESTIMONIALS.length + 1;
        updateTrayBadge();
        if (inboxRefs && WM.wins.has('testimonials')) inboxRefs.render();
        if (testiState.started && !testiState.timers.length && !testimonialsExhausted()) scheduleNext(3000);
      }

      function openInbox(initialSelection) {
        if (WM.wins.has('testimonials')) {
          WM.focus('testimonials');
          if (initialSelection && inboxRefs) inboxRefs.select(initialSelection);
          return;
        }
        WM.create({
          id: 'testimonials', title: 'Inbox — Testimonial Express', icon: svg('mail', 14), w: 580, h: 440,
          menubar: [
            { label: 'File', items: [{ label: 'Close', act: a => a.close() }] },
            { label: 'Help', items: [{ label: 'About PortfolioOS', act: aboutOS }] }
          ],
          status: ['0 message(s), 0 unread', 'Testimonial Express'],
          onClose() { inboxRefs = null; },
          build(body, api) {
            body.className = 'win-body app-inbox';
            body.innerHTML = `<div class="ib-tools">
        <button class="btn sm" data-a="sr">Send/Receive</button>
        <button class="btn sm" data-a="reply">Reply</button>
        <span class="grow"></span>
      </div>
      <div class="ib-list"></div>
      <div class="ib-prev" hidden></div>`;
            const ibList = body.querySelector('.ib-list'), ibPrev = body.querySelector('.ib-prev');
            /* By id, not position: a resync after a terminal save can reorder. */
            let selId = null;
            function render() {
              const shown = TESTIMONIALS;
              const unread = shown.filter(t => !t._read).length;
              api.status[0].textContent = shown.length + ' message' + (shown.length === 1 ? '' : 's') + ', ' + unread + ' unread';
              ibList.innerHTML = shown.length ? '' : '<div class="ib-empty">No testimonials yet. They will arrive. Praise is async.</div>';
              shown.forEach(t => {
                const row = document.createElement('div');
                row.className = 'msg-row' + (t._read ? '' : ' unread') + (t.id === selId ? ' sel' : '');
                row.innerHTML = `<span class="m-ic">${svg(t._read ? 'openmail' : 'mail', 14)}</span>` +
                  `<span class="m-from">${esc(t.from)}</span><span class="m-subj">${esc(t.subject)}</span>` +
                  `<span class="m-date">${esc(t.dateShort)}</span>`;
                row.addEventListener('click', () => selectItem(t));
                ibList.appendChild(row);
              });
            }
            function selectItem(picked) {
              /* A toast can outlive a resync and hold the replaced object. */
              const t = TESTIMONIALS.find(x => x.id === picked.id) || picked;
              t._read = true; selId = t.id;
              testiSeen.set(t.id, true);
              updateTrayBadge(); render();
              ibPrev.hidden = false;
              ibPrev.innerHTML = `<div class="prev-hdr">
          <div class="prev-av">${testimonialAvatar(t, 36)}</div>
          <div class="prev-who">
            <div class="prev-from"><b>${esc(t.from)}</b> <span class="dim">${esc(t.role)}</span></div>
            <div class="prev-subj">${esc(t.subject)}</div>
          </div>
          <div class="prev-date">${esc(t.date)}</div>
        </div>
        <div class="prev-stars">${starsHTML(t.stars, 12)}</div>
        <blockquote class="prev-quote">&ldquo;${esc(t.text)}&rdquo;</blockquote>`;
            }
            body.querySelector('[data-a="sr"]').addEventListener('click', async () => {
              hourglass(600);
              const result = await deliverTestimonial();
              if (result === 'failed') {
                errorDialog('Testimonial Express', 'Send/Receive failed: the server could not be reached.<br>Try again in a moment.');
              } else if (result === 'done' && TESTIMONIALS.length) upToDateToast();
            });
            body.querySelector('[data-a="reply"]').addEventListener('click', () => {
              errorDialog('Testimonial Express', 'Reply failed: SMTP server not configured.<br>This is a one-way mailbox &mdash; like most references.');
            });
            inboxRefs = { api, render, select: selectItem };
            render();
            if (initialSelection) selectItem(initialSelection);
          }
        });
      }
