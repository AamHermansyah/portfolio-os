/* =================================================================
         desktop icons
      ================================================================= */
      const DESKTOP_ICONS = [
        { id: 'about', label: 'About_Me.txt', ic: () => svg('txt', 32), open: openAbout },
        { id: 'projects', label: 'Projects', ic: () => svg('folder', 32), open: openProjects },
        { id: 'skills', label: 'Skills.exe', ic: () => svg('gear', 32), open: openSkills },
        { id: 'terminal', label: 'Terminal', ic: () => svg('monitor', 32), open: openTerminal },
        { id: 'resume', label: 'Resume.pdf', ic: () => svg('pdf', 32), open: openResume },
        { id: 'contact', label: 'Contact.exe', ic: () => svg('mail', 32), open: openContact },
        { id: 'hire', label: 'Hire_Me.exe', ic: () => svg('briefcase', 32), open: openHire },
        { id: 'sysprops', label: 'My Computer', ic: () => svg('computer', 32), open: openSysProps },
        { id: 'network', label: 'Network Neighborhood', ic: () => svg('network', 32), open: openNetwork },
        { id: 'career-log', label: 'Career.log', ic: () => svg('briefcase', 32), open: openCareerLog },
        { id: 'changelog', label: 'Changelog.log', ic: () => svg('txt', 32), open: openChangelog },
        ...(CREDENTIALS.length
          ? [{ id: 'certs', label: 'Certificates', ic: () => svg('cert', 32), open: openCertificates }]
          : []),
        { id: 'fiverr', label: 'Fiverr.url', ic: () => svg('globe', 32), open: openFiverr },
        { id: 'bin', label: 'Recycle Bin', ic: () => svg(binContents.length ? 'binF' : 'binE', 32), open: openBin }
      ];
      const ICON_DOUBLE_TAP_MS = 500;
      let lastIconTap = null;
      const iconEls = [];
      function buildIcons() {
        DESKTOP_ICONS.forEach(def => {
          const d = document.createElement('div');
          d.className = 'dicon'; d.dataset.id = def.id; d.tabIndex = 0;
          d.setAttribute('role', 'button');
          d.innerHTML = `<div class="di-img">${def.ic()}</div><div class="di-lb">${esc(def.label)}</div>`;
          d.addEventListener('keydown', e => {
            if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); def.open(); }
          });
          dragIcon(d, def.open);
          DESK.appendChild(d); iconEls.push(d);
        });
        layoutIcons(true);
      }
      function selectIcon(el) {
        iconEls.forEach(i => i.classList.remove('sel'));
        if (el) el.classList.add('sel');
      }
      function layoutIcons(reset) {
        let x = 8, y = 8;
        const h = DESK.clientHeight;
        iconEls.forEach(ic => {
          if (reset) { ic.style.left = x + 'px'; ic.style.top = y + 'px'; }
          y += 68;
          if (y + 62 > h) { y = 8; x += 88; }
        });
      }
      function dragIcon(el, openFn) {
        el.addEventListener('pointerdown', e => {
          if (e.button !== 0) return;
          e.preventDefault();
          selectIcon(el);
          const r = el.getBoundingClientRect(), dr = DESK.getBoundingClientRect();
          const ox = e.clientX - r.left, oy = e.clientY - r.top, sx = e.clientX, sy = e.clientY;
          const dragThreshold = e.pointerType === 'touch' || COARSE ? 10 : 5;
          let moved = false;
          try { el.setPointerCapture(e.pointerId); } catch { }
          const mv = ev => {
            if (!moved && Math.hypot(ev.clientX - sx, ev.clientY - sy) < dragThreshold) return;
            moved = true;
            el.style.left = clamp(ev.clientX - dr.left - ox, 0, dr.width - r.width) + 'px';
            el.style.top = clamp(ev.clientY - dr.top - oy, 0, dr.height - r.height) + 'px';
          };
          el.addEventListener('pointermove', mv);
          const cleanup = () => {
            el.removeEventListener('pointermove', mv);
            el.removeEventListener('pointerup', up);
            el.removeEventListener('pointercancel', cancel);
          };
          const up = ev => {
            cleanup();
            if (moved) { lastIconTap = null; return; }
            const now = performance.now();
            const isDoubleTap = lastIconTap && lastIconTap.el === el &&
              now - lastIconTap.time <= ICON_DOUBLE_TAP_MS &&
              Math.hypot(ev.clientX - lastIconTap.x, ev.clientY - lastIconTap.y) <= 24;
            if (isDoubleTap) { lastIconTap = null; openFn(); }
            else lastIconTap = { el, time: now, x: ev.clientX, y: ev.clientY };
          };
          const cancel = () => { cleanup(); lastIconTap = null; };
          el.addEventListener('pointerup', up);
          el.addEventListener('pointercancel', cancel);
        });
      }
      DESK.addEventListener('pointerdown', e => { if (e.target === DESK) selectIcon(null); });

      /* desktop context menu */
      DESK.addEventListener('contextmenu', e => {
        if (e.target.closest('.win')) return;
        e.preventDefault();
        closeCtx();
        const m = document.createElement('div'); m.className = 'dropdown ctx';
        const isOrbit = currentWallpaper()?.id === 'star';
        const items = [
          { t: 'Arrange Icons', act: () => layoutIcons(true) },
          { t: 'Refresh', act: () => hourglass(350) },
          { sep: true },
          { t: 'Change Wallpaper...', act: openWallpaperPicker },
          { t: 'Accessibility...', act: openAccessibility },
          { t: 'CRT scanline filter', check: () => document.body.classList.contains('crt'), act: () => setCRT(!document.body.classList.contains('crt')) },
          { sep: true },
          { t: 'New Terminal', act: openTerminal },
          ...(isOrbit ? [{ t: 'Jupiter Observatory', act: openJupiter }] : []),
          { t: 'About PortfolioOS', act: aboutOS }
        ];
        items.forEach(it => {
          if (it.sep) { m.appendChild(mkSep()); return; }
          const b = document.createElement('button'); b.type = 'button';
          b.className = 'mi' + (it.check && it.check() ? ' checked' : ''); b.textContent = it.t;
          b.addEventListener('click', () => { closeCtx(); it.act(); });
          m.appendChild(b);
        });
        document.body.appendChild(m);
        m.style.left = clamp(e.clientX, 2, innerWidth - m.offsetWidth - 4) + 'px';
        m.style.top = clamp(e.clientY, 2, innerHeight - m.offsetHeight - 34) + 'px';
        openCtx = m;
      });
