/* =================================================================
         window manager
      ================================================================= */
      const WM = {
        z: 20, seq: 0, wins: new Map(), active: null,
        create(o) {
          if (o.id && this.wins.has(o.id)) {
            const r = this.wins.get(o.id);
            if (r.min) this.restore(o.id); else this.focus(o.id);
            return r.api;
          }
          const id = o.id || ('w' + (++this.seq));
          const dw = DESK.clientWidth, dh = DESK.clientHeight;
          const W = Math.max(200, Math.min(o.w || 420, dw - 10));
          const H = Math.max(120, Math.min(o.h || 320, dh - 8));
          const k = this.seq % 8;
          let x = o.x != null ? o.x : 44 + k * 26, y = o.y != null ? o.y : 22 + k * 22;
          if (o.dialog || o.center) { x = (dw - W) / 2; y = Math.max(6, (dh - H) / 2 - 14); }
          x = clamp(x, 4, Math.max(4, dw - 90)); y = clamp(y, 0, Math.max(0, dh - 30));

          const el = document.createElement('div');
          el.className = 'win' + (o.dialog ? ' dlg' : '') + (o.h === 'auto' ? ' auto' : '');
          el.dataset.id = id;
          el.style.cssText = `left:${x}px;top:${y}px;width:${W}px;${o.h === 'auto' ? '' : 'height:' + H + 'px;'}z-index:${++this.z}`;

          const api = {
            id, el, min: false,
            close: () => this.close(id),
            focus: () => this.focus(id),
            setTitle: t => { el.querySelector('.tb-text').textContent = t; if (tab) tab.querySelector('.tab-t').textContent = t; }
          };

          /* titlebar */
          const tb = document.createElement('div'); tb.className = 'titlebar';
          tb.innerHTML = `<span class="tb-ic">${o.icon}</span><span class="tb-text"></span><span class="tb-btns">` +
            (o.dialog ? '' : `<button class="tb-btn" data-a="min" title="Minimize">${GLY.min}</button><button class="tb-btn" data-a="max" title="Maximize / Restore">${GLY.max}</button>`) +
            `<button class="tb-btn" data-a="close" title="Close">${GLY.close}</button></span>`;
          tb.querySelector('.tb-text').textContent = o.title;
          el.appendChild(tb);

          if (o.menubar) el.appendChild(buildMenubar(o.menubar, api));

          const body = document.createElement('div'); body.className = 'win-body'; el.appendChild(body);

          let statusEls = null;
          if (o.status) {
            const sb = document.createElement('div'); sb.className = 'statusbar';
            statusEls = o.status.map(t => { const p = document.createElement('div'); p.className = 'sb'; p.textContent = t; sb.appendChild(p); return p; });
            el.appendChild(sb);
          }
          api.status = statusEls;

          if (o.resizable !== false && !o.dialog) {
            const rh = document.createElement('div'); rh.className = 'rs'; el.appendChild(rh);
            attachResize(rh, el);
          }

          el.addEventListener('pointerdown', () => this.focus(id), true);
          tb.querySelectorAll('.tb-btn').forEach(b => b.addEventListener('click', e => {
            e.stopPropagation();
            if (b.dataset.a === 'close') this.close(id);
            else if (b.dataset.a === 'min') this.minimize(id);
            else if (b.dataset.a === 'max') this.toggleMax(id);
          }));
          tb.addEventListener('dblclick', e => {
            if (e.target.closest('.tb-btn')) return;
            if (!o.dialog && o.resizable !== false) this.toggleMax(id);
          });
          attachMove(tb, el);

          const tab = o.noTab ? null : addTab(o, api);
          api.tab = tab;

          DESK.appendChild(el);
          this.wins.set(id, { id, el, api, min: false, tab, o });
          if (o.build) o.build(body, api);
          this.focus(id);
          hourglass(380);
          return api;
        },
        focus(id) {
          const r = this.wins.get(id); if (!r) return;
          if (r.min) { this.restore(id); return; }
          this.active = id;
          this.wins.forEach(w => {
            const a = w.id === id;
            w.el.classList.toggle('inactive', !a);
            if (w.tab) w.tab.classList.toggle('on', a);
          });
          r.el.style.zIndex = ++this.z;
        },
        minimize(id) {
          const r = this.wins.get(id); if (!r || r.min) return;
          r.min = true; r.el.style.display = 'none';
          if (r.tab) r.tab.classList.remove('on');
          if (this.active === id) { this.active = null; this._focusTop(); }
        },
        restore(id) {
          const r = this.wins.get(id); if (!r) return;
          r.min = false; r.el.style.display = 'flex'; this.focus(id);
        },
        toggleMax(id) {
          const r = this.wins.get(id); if (!r) return;
          const el = r.el;
          if (el.classList.contains('max')) {
            el.classList.remove('max');
            Object.assign(el.style, r.prev);
          } else {
            r.prev = { left: el.style.left, top: el.style.top, width: el.style.width, height: el.style.height };
            el.classList.add('max');
            Object.assign(el.style, { left: '0px', top: '0px', width: DESK.clientWidth + 'px', height: DESK.clientHeight + 'px' });
          }
        },
        close(id) {
          const r = this.wins.get(id); if (!r) return;
          if (r.o.onClose) { try { r.o.onClose(r.api) } catch { } }
          r.el.remove(); if (r.tab) r.tab.remove();
          this.wins.delete(id);
          if (this.active === id) { this.active = null; this._focusTop(); }
        },
        closeAll() { [...this.wins.keys()].forEach(id => this.close(id)); },
        _focusTop() {
          let best = null;
          this.wins.forEach(w => { if (!w.min && (!best || +w.el.style.zIndex > +best.el.style.zIndex)) best = w; });
          if (best) this.focus(best.id);
        }
      };
      function addTab(o, api) {
        const t = document.createElement('button'); t.className = 'tab';
        t.innerHTML = `<span class="tab-ic">${o.icon}</span><span class="tab-t"></span>`;
        t.querySelector('.tab-t').textContent = o.title;
        t.addEventListener('click', () => {
          const r = WM.wins.get(api.id); if (!r) return;
          if (r.min) WM.restore(api.id);
          else if (WM.active === api.id) WM.minimize(api.id);
          else WM.focus(api.id);
        });
        TABS.appendChild(t); return t;
      }
      function attachMove(handle, el) {
        handle.addEventListener('pointerdown', e => {
          if (e.button !== 0 || e.target.closest('.tb-btn')) return;
          if (el.classList.contains('max')) return;
          const r = el.getBoundingClientRect(), dr = DESK.getBoundingClientRect();
          const ox = e.clientX - r.left, oy = e.clientY - r.top;
          handle.setPointerCapture(e.pointerId);
          const mv = ev => {
            const x = clamp(ev.clientX - dr.left - ox, -(r.width - 90), dr.width - 60);
            const y = clamp(ev.clientY - dr.top - oy, 0, dr.height - 20);
            el.style.left = x + 'px'; el.style.top = y + 'px';
          };
          handle.addEventListener('pointermove', mv);
          const up = () => handle.removeEventListener('pointermove', mv);
          handle.addEventListener('pointerup', up, { once: true });
          handle.addEventListener('pointercancel', up, { once: true });
          e.preventDefault();
        });
      }
      function attachResize(h, el) {
        h.addEventListener('pointerdown', e => {
          if (e.button !== 0) return;
          e.stopPropagation();
          const r = el.getBoundingClientRect(), sw = r.width, sh = r.height, sx = e.clientX, sy = e.clientY;
          h.setPointerCapture(e.pointerId);
          const mv = ev => {
            el.style.width = Math.max(260, sw + ev.clientX - sx) + 'px';
            el.style.height = Math.max(150, sh + ev.clientY - sy) + 'px';
          };
          h.addEventListener('pointermove', mv);
          const up = () => h.removeEventListener('pointermove', mv);
          h.addEventListener('pointerup', up, { once: true });
          h.addEventListener('pointercancel', up, { once: true });
        });
      }
