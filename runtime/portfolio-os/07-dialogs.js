/* =================================================================
         dialogs
      ================================================================= */
      function dialogBox(o) {
        return WM.create({
          title: o.title, icon: o.icon, dialog: true, noTab: o.noTab !== false,
          id: o.id, w: o.w || 380, h: 'auto', onClose: o.onClose,
          build(body, api) {
            body.style.overflow = 'visible';
            let html = `<div class="dlg-row">${o.icon}<div class="dlg-msg">${o.msg}</div></div>`;
            if (o.input) html += `<div class="dlg-input"><input class="field" placeholder="${esc(o.input.ph || '')}" spellcheck="false"></div>`;
            html += `<div class="dlg-btns"></div>`;
            body.innerHTML = html;
            const btns = body.querySelector('.dlg-btns');
            (o.buttons || [{ t: 'OK' }]).forEach(b => {
              let el;
              if (b.href) { el = document.createElement('a'); el.href = b.href; el.target = b.target || '_blank'; el.rel = 'noopener'; }
              else { el = document.createElement('button'); el.type = 'button'; }
              el.className = 'btn'; el.textContent = b.t;
              el.addEventListener('click', () => { if (b.act) b.act(api); else if (!b.keep) api.close(); });
              btns.appendChild(el);
            });
            if (o.input) {
              const inp = body.querySelector('input');
              setTimeout(() => inp.focus(), 60);
              inp.addEventListener('keydown', e => { if (e.key === 'Enter') { const v = inp.value.trim(); if (o.input.onOK) o.input.onOK(v, api); } });
            }
          }
        });
      }
      function errorDialog(title, msg, beepToo = true) {
        if (beepToo) beep(620, 110);
        dialogBox({ title, icon: svg('warn', 32), msg: `<b>${esc(title)}</b>${msg}`, w: 360 });
      }
      function aboutOS() {
        dialogBox({
          title: 'About PortfolioOS', icon: svg('monitor', 32), w: 400, msg:
            `<b>PortfolioOS 98</b>
     Version 4.10.1998 (Build 1998.03)<br>
     Copyright &copy; 1998&ndash;2026 Aam Hermansyah<br><br>
     This product is licensed to: <b>You, the visitor</b>.<br>
     Physical memory available: 65,536 KB &mdash; plenty.<br><br>
     <span class="dim">Warning: this operating system is presentation only. Do not deploy to production.</span>`});
      }
