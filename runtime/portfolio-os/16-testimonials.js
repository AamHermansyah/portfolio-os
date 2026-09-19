/* =================================================================
         TESTIMONI SEBAGAI NOTIFIKASI
      ================================================================= */
      const testiState = { count: 0, started: false, doneToast: false, timers: [] };
      let inboxRefs = null;
      const activeToasts = [], toastQueue = [];

      function uhoh() { beep(880, 80, .05); setTimeout(() => beep(587, 130, .05), 110); }

      function updateTrayBadge() {
        const unread = TESTIMONIALS.slice(0, testiState.count).filter(t => !t._read).length;
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
      function testimonialToast(t) {
        const short = t.text.length > 108 ? t.text.slice(0, 105) + '\u2026' : t.text;
        showToast({
          title: 'Testimonial Express', icon: svg('mail', 14),
          html: `<div class="t-av"><img src="${esc(t.avatar)}" alt=""></div><div class="t-msg">
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
          html: '<b>Inbox up to date.</b><div class="t-prev">You have reached the end of the praise. Thank you for reading all six.</div>',
          foot: 'this notification will now stop'
        });
      }

      function deliverTestimonial(silent) {
        if (testiState.count >= TESTIMONIALS.length) return false;
        const t = TESTIMONIALS[testiState.count++];
        t._read = false;
        updateTrayBadge();
        if (inboxRefs && WM.wins.has('testimonials')) inboxRefs.render();
        if (!silent) { uhoh(); testimonialToast(t); }
        return true;
      }
      function scheduleNext(ms) {
        const id = setTimeout(() => {
          testiState.timers = testiState.timers.filter(x => x !== id);
          if (deliverTestimonial()) scheduleNext(40000 + Math.random() * 35000);
          else upToDateToast();
        }, ms);
        testiState.timers.push(id);
      }
      function startTestimonials() {
        if (testiState.started) return;
        testiState.started = true;
        deliverTestimonial(true);
        scheduleNext(9000);
      }
      function resetTestiTimers() {
        testiState.timers.forEach(clearTimeout); testiState.timers = [];
        activeToasts.slice().forEach(r => dismissToast(r.el));
        toastQueue.length = 0;
        if (testiState.started && testiState.count < TESTIMONIALS.length) scheduleNext(15000);
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
            let selIdx = -1;
            function render() {
              const shown = TESTIMONIALS.slice(0, testiState.count);
              const unread = shown.filter(t => !t._read).length;
              api.status[0].textContent = shown.length + ' message' + (shown.length === 1 ? '' : 's') + ', ' + unread + ' unread';
              ibList.innerHTML = shown.length ? '' : '<div class="ib-empty">No testimonials yet. They will arrive. Praise is async.</div>';
              shown.forEach(t => {
                const idx = TESTIMONIALS.indexOf(t);
                const row = document.createElement('div');
                row.className = 'msg-row' + (t._read ? '' : ' unread') + (idx === selIdx ? ' sel' : '');
                row.innerHTML = `<span class="m-ic">${svg(t._read ? 'openmail' : 'mail', 14)}</span>` +
                  `<span class="m-from">${esc(t.from)}</span><span class="m-subj">${esc(t.subject)}</span>` +
                  `<span class="m-date">${esc(t.dateShort)}</span>`;
                row.addEventListener('click', () => selectItem(t));
                ibList.appendChild(row);
              });
            }
            function selectItem(t) {
              t._read = true; selIdx = TESTIMONIALS.indexOf(t);
              updateTrayBadge(); render();
              ibPrev.hidden = false;
              ibPrev.innerHTML = `<div class="prev-hdr">
          <div class="prev-av"><img src="${esc(t.avatar)}" alt=""></div>
          <div class="prev-who">
            <div class="prev-from"><b>${esc(t.from)}</b> <span class="dim">${esc(t.role)}</span></div>
            <div class="prev-subj">${esc(t.subject)}</div>
          </div>
          <div class="prev-date">${esc(t.date)}</div>
        </div>
        <div class="prev-stars">${starsHTML(t.stars, 12)}</div>
        <blockquote class="prev-quote">&ldquo;${esc(t.text)}&rdquo;</blockquote>`;
            }
            body.querySelector('[data-a="sr"]').addEventListener('click', () => {
              hourglass(600);
              setTimeout(() => { if (!deliverTestimonial()) upToDateToast(); }, 550);
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
