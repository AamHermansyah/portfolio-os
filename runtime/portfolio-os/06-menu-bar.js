/* =================================================================
         menu bar + dropdowns
      ================================================================= */
      let openMb = null, openCtx = null;
      function closeDropdown() { if (openMb) { openMb.item.classList.remove('open'); openMb.dd.remove(); openMb = null; } }
      function closeCtx() { if (openCtx) { openCtx.remove(); openCtx = null; } }
      function mkSep() { const s = document.createElement('div'); s.className = 'mi-sep'; return s; }
      function buildMenubar(defs, api) {
        const bar = document.createElement('div'); bar.className = 'menubar';
        function openMenu(it, d) {
          closeDropdown();
          const dd = document.createElement('div'); dd.className = 'dropdown';
          d.items.forEach(mi => {
            if (mi.sep) { dd.appendChild(mkSep()); return; }
            const b = document.createElement('button'); b.type = 'button';
            b.className = 'mi' + (mi.check && mi.check() ? ' checked' : '');
            b.textContent = mi.label;
            b.addEventListener('click', () => { closeDropdown(); if (mi.act) mi.act(api); });
            dd.appendChild(b);
          });
          const win = it.closest('.win');
          dd.style.left = it.offsetLeft + 'px';
          dd.style.top = (it.offsetTop + it.offsetHeight + 2) + 'px';
          win.appendChild(dd);
          it.classList.add('open'); openMb = { item: it, dd };
        }
        defs.forEach(d => {
          const it = document.createElement('button'); it.type = 'button'; it.className = 'mb-item'; it.textContent = d.label;
          it.addEventListener('pointerdown', e => {
            e.stopPropagation();
            if (openMb && openMb.item === it) { closeDropdown(); return; }
            openMenu(it, d);
          });
          it.addEventListener('pointerenter', () => { if (openMb && openMb.item !== it) openMenu(it, d); });
          bar.appendChild(it);
        });
        return bar;
      }
      document.addEventListener('pointerdown', e => {
        if (openCtx && !e.target.closest('.dropdown')) closeCtx();
        if (openMb && !e.target.closest('.menubar') && !e.target.closest('.dropdown')) closeDropdown();
        if (document.getElementById('startmenu').classList.contains('open') && !e.target.closest('#startmenu') && !e.target.closest('#startbtn'))
          closeStart();
      });
      document.addEventListener('keydown', e => {
        if (e.key === 'Escape') { closeCtx(); closeDropdown(); closeStart(); }
      });
