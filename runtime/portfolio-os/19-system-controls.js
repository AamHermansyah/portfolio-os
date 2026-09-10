/* =================================================================
         BSOD
      ================================================================= */
      let bsodRecovered = false;
      function bsod() {
        beep(110, 500, .05);
        const el = $('#bsod'); el.style.display = 'block';
        const exit = () => {
          el.style.display = 'none';
          document.removeEventListener('keydown', exit);
          el.removeEventListener('click', exit);
          if (!bsodRecovered) {
            bsodRecovered = true;
            setTimeout(() => dialogBox({
              title: 'System Error', icon: svg('warn', 32), w: 420,
              msg: `<b>PortfolioOS has recovered from a serious error.</b><br><br>
             The error was, in fact, on purpose — you found an easter egg.
             Nothing was harmed. The crash was cosmetic, like most crashes.`}), 250);
          }
        };
        setTimeout(() => {
          document.addEventListener('keydown', exit);
          el.addEventListener('click', exit);
        }, 350);
      }

      /* =================================================================
         clock + CRT
      ================================================================= */
      function tick() {
        const d = new Date();
        let h = d.getHours(); const m = String(d.getMinutes()).padStart(2, '0');
        const ap = h >= 12 ? 'PM' : 'AM'; h = h % 12 || 12;
        $('#clock').textContent = h + ':' + m + ' ' + ap;
        $('#clock').title = d.toDateString();
      }
      setInterval(tick, 1000); tick();
      function setCRT(on) {
        document.body.classList.toggle('crt', on);
        $('#crtbtn').classList.toggle('on', on);
      }
      $('#crtbtn').addEventListener('click', () => setCRT(!document.body.classList.contains('crt')));

      /* hourglass on external links */
      document.addEventListener('click', e => {
        const a = e.target.closest('a[href]');
        if (a && (a.target === '_blank' || a.href.indexOf('mailto:') === 0)) hourglass(550);
      });

      /* keep windows and dragged sky objects inside the desktop on viewport resize */
      window.addEventListener('resize', () => {
        const dw = DESK.clientWidth, dh = DESK.clientHeight;
        WM.wins.forEach(w => {
          if (w.el.classList.contains('max')) { w.el.style.width = dw + 'px'; w.el.style.height = dh + 'px'; return; }
          w.el.style.left = clamp(parseFloat(w.el.style.left), -w.el.offsetWidth + 90, dw - 60) + 'px';
          w.el.style.top = clamp(parseFloat(w.el.style.top), 0, dh - 24) + 'px';
        });
        document.querySelectorAll('.planetwrap,.moonwrap').forEach(el => {
          const left = parseFloat(el.style.left), top = parseFloat(el.style.top);
          /* Bulan yang belum dipindah tetap memakai posisi responsif right:7%; top:6%. */
          if (Number.isFinite(left)) el.style.left = clamp(left, 0, dw - el.offsetWidth) + 'px';
          if (Number.isFinite(top)) el.style.top = clamp(top, 0, dh - el.offsetHeight) + 'px';
        });
      });
