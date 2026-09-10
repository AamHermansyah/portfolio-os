/* =================================================================
         JUPITER — planet pixel prosedural 56x56: pita bergelombang,
         Bintik Merah Besar, limb darkening, DAN sistem cincin
         (tepi halo + cincin utama + celah + cincin gossamer tipis).
         Busur belakang cincin tertutup planet, busur depan melintas
         di depan permukaan — bidangnya sama dengan bidang orbit bulan.
      ================================================================= */
      const JUP_BANDS = ['#b9ac8d', '#e7ddc1', '#c9a878', '#e3d4b0', '#b98a58', '#dfc9a2', '#a5744a', '#d9c39c', '#c08a58', '#e4d6b4', '#ad8a62', '#b7a88a'];
      function mix(a, b, t) {
        const p = h => [parseInt(h.slice(1, 3), 16), parseInt(h.slice(3, 5), 16), parseInt(h.slice(5, 7), 16)];
        const A = p(a), B = p(b);
        return '#' + A.map((v, i) => Math.round(v + (B[i] - v) * t).toString(16).padStart(2, '0')).join('');
      }
      function jupiterFrame(theta) {
        const S = 56, CX = 28, CY = 28, R = 14.6, RX = 23, RY = 7;
        const sx = CX + 9.6 * Math.sin(theta);
        const vis = Math.cos(theta) > 0.12;
        const rx = 4.4 * (0.3 + 0.7 * Math.max(0, Math.cos(theta)));
        const ry = 2.7;
        const map = [];
        for (let y = 0; y < S; y++) {
          let row = '';
          for (let x = 0; x < S; x++) {
            const dx = x + 0.5 - CX, dy = y + 0.5 - CY;
            const d2 = dx * dx + dy * dy;
            /* ---- cincin: elips RX x RY, 3 pita dgn celah ---- */
            const er = (dx * dx) / (RX * RX) + (dy * dy) / (RY * RY);
            if ((er >= 1.00 && er <= 1.06) || (er >= 1.10 && er <= 1.30) || (er >= 1.36 && er <= 1.42)) {
              const band = er <= 1.06 ? 1 : (er <= 1.30 ? 2 : 3);
              if (dy >= 0 || d2 > R * R) {    /* depan: selalu; belakang: hanya jika tak tertutup planet */
                row += band === 1 ? (dy >= 0 ? 'm' : 'M') : band === 2 ? (dy >= 0 ? 'n' : 'N') : (dy >= 0 ? 'o' : 'O');
                continue;
              }
            }
            /* ---- permukaan planet ---- */
            if (d2 > R * R) { row += '.'; continue; }
            const ny = dy / R;
            const w = Math.sin((x / S) * Math.PI * 3 + theta * 1.2 + ny * 2.1) * 0.085;
            let idx = Math.floor((ny + w + 1) * JUP_BANDS.length / 2);
            idx = Math.max(0, Math.min(JUP_BANDS.length - 1, idx));
            let ch = String.fromCharCode(97 + idx);
            if (vis) {
              const ex = (x + 0.5 - sx) / rx, ey = (y + 0.5 - 31.7) / ry;
              const e2 = ex * ex + ey * ey;
              if (e2 <= 1) ch = e2 > 0.55 ? 'R' : 'r';
            }
            if (d2 > R * R * 0.79) ch = ch.toUpperCase();
            row += ch;
          }
          map.push(row);
        }
        return map;
      }
      function jupiterPalette() {
        const pal = {};
        JUP_BANDS.forEach((c, i) => {
          const ch = String.fromCharCode(97 + i);
          pal[ch] = c;
          pal[ch.toUpperCase()] = mix(c, '#160b06', .45);
        });
        pal.r = '#c26040'; pal.R = '#7e3220';
        /* cincin: tepi terang (m/M), cincin utama (n/N), gossamer (o/O) — depan/belakang */
        pal.m = '#c9ba95'; pal.M = '#a2906c';
        pal.n = '#b3a37e'; pal.N = '#91815f';
        pal.o = '#8b7d5e'; pal.O = '#6e6248';
        return pal;
      }
      const JPAL = jupiterPalette();
      const jIcon = size => px(jupiterFrame(0.6), JPAL, size);
      /* Rotasi halus: peta 56x56 yang sama digambar ulang ke <canvas> tiap frame
         dengan sudut kontinu (~30 fps), bukan 10 gambar diskret. Pikselnya tetap
         chunky karena canvas-nya tetap 56x56 lalu diperbesar CSS. */
      const JUP_S = 56, JUP_PERIOD = 1900;
      const JRGB = (function () {
        const t = {};
        for (const k in JPAL) {
          const h = JPAL[k];
          t[k] = [parseInt(h.slice(1, 3), 16), parseInt(h.slice(3, 5), 16), parseInt(h.slice(5, 7), 16)];
        }
        return t;
      })();
      const jupSurfaces = [];
      let jupImg = null, jupTheta = 0, jupPrev = 0, jupDrawn = 0;
      function attachJupiter(el) {
        if (!el) return;
        const cv = document.createElement('canvas');
        cv.width = cv.height = JUP_S;
        el.textContent = ''; el.appendChild(cv);
        const ctx = cv.getContext('2d');
        if (!jupImg) jupImg = ctx.createImageData(JUP_S, JUP_S);
        jupSurfaces.push({ el, ctx });
        jupPaint();
      }
      function jupPaint() {
        for (let i = jupSurfaces.length - 1; i >= 0; i--) {
          const s = jupSurfaces[i];
          if (s.el.isConnected) s.seen = true;
          else if (s.seen) jupSurfaces.splice(i, 1);   /* jendelanya sudah ditutup */
        }
        if (!jupSurfaces.length || !jupImg) return;
        const map = jupiterFrame(jupTheta), d = jupImg.data;
        for (let y = 0; y < JUP_S; y++) {
          const row = map[y];
          for (let x = 0; x < JUP_S; x++) {
            const c = JRGB[row[x]], o = (y * JUP_S + x) * 4;
            if (c) { d[o] = c[0]; d[o + 1] = c[1]; d[o + 2] = c[2]; d[o + 3] = 255; }
            else d[o + 3] = 0;
          }
        }
        for (const s of jupSurfaces) s.ctx.putImageData(jupImg, 0, 0);
      }
      requestAnimationFrame(function jupLoop(now) {
        requestAnimationFrame(jupLoop);
        if (!jupSurfaces.length) { jupPrev = now; return; }
        const dt = Math.min(80, now - jupPrev); jupPrev = now;
        if (document.hidden) return;
        jupTheta = (jupTheta + dt / JUP_PERIOD * Math.PI * 2) % (Math.PI * 2);
        if (now - jupDrawn < 32) return;
        jupDrawn = now;
        jupPaint();
      });

      /* bulan Galilean — orbit + drag + animasi pulang */
      const MOON_HIT = 28;   /* kotak sentuh 28px supaya gampang ditangkap saat mengorbit */
      const MOON_DATA = [
        { n: 'Amalthea', c: '#c05a48', s: 7, sd: 1.4, sp: .60, lt: false, inner: true, per: '0.50', dia: '250 × 146 km', dist: '181,400 km', disc: 'E. E. Barnard, 1892', fact: 'A lumpy red potato 250 km long, orbiting just outside the rings — dust knocked off it keeps the gossamer ring stocked.' },
        { n: 'Thebe', c: '#9a8778', s: 7, sd: 3.3, sp: .58, lt: true, inner: true, per: '0.67', dia: '116 km', dist: '221,900 km', disc: 'Voyager 1, 1979', fact: 'Small, dark and thoroughly battered. Its orbit marks the outer edge of Jupiter\u2019s faintest ring.' },
        { n: 'Io', c: '#e0c060', s: 9, sd: 0.7, sp: .62, lt: false, hot: true, per: '1.8', dia: '3,643 km', dist: '421,700 km', disc: 'Galileo, January 1610', fact: 'The most volcanically active world known — 400+ volcanoes, squeezed by Jupiter\u2019s tides like a stress ball.' },
        { n: 'Europa', c: '#d8d4c8', s: 9, sd: 2.1, sp: .58, lt: false, per: '3.6', dia: '3,122 km', dist: '671,000 km', disc: 'Galileo, January 1610', fact: 'An ice shell over a global ocean holding twice the water of all Earth\u2019s oceans. Prime real estate for a future submarine.' },
        { n: 'Ganymede', c: '#a89880', s: 13, sd: 4.0, sp: .55, lt: true, per: '7.2', dia: '5,268 km', dist: '1,070,400 km', disc: 'Galileo, January 1610', fact: 'The largest moon in the Solar System — bigger than Mercury, with its own magnetic field. An overachiever.' },
        { n: 'Callisto', c: '#7a6a58', s: 11, sd: 5.2, sp: .52, lt: true, per: '16.7', dia: '4,821 km', dist: '1,882,700 km', disc: 'Galileo, January 1610', fact: 'The most cratered object we know. A 4-billion-year-old log of every rock that ever swung by.' }
      ];
      const MOON_SPD = [0.168, 0.133, 0.095, 0.057, 0.035, 0.020]; /* radian per 100 ms — makin dalam makin cepat, fisika benar */
      /* ---- sprite bulan: bola piksel kecil dengan beberapa frame rotasi.
         Bulannya kecil, jadi cukup beberapa frame diskret (bukan canvas),
         tanpa easing. Bulan Galilean terkunci pasang surut, jadi satu
         putaran sprite = satu orbit penuh. ---- */
      function moonPal(m) {
        return {
          a: mix(m.c, '#ffffff', .14), b: m.c, c: mix(m.c, '#140e07', .45),
          d: mix(m.c, '#ffffff', .52), e: mix(m.c, '#100b05', .44), h: '#ff9038'
        };
      }
      function moonFrame(m, k, N) {
        const S = m.s, R = S / 2, th = k / N * Math.PI * 2, map = [];
        for (let y = 0; y < S; y++) {
          let row = '';
          for (let x = 0; x < S; x++) {
            const dx = x + .5 - R, dy = y + .5 - R, d2 = dx * dx + dy * dy;
            if (d2 > R * R) { row += '.'; continue; }
            let ch = d2 > R * R * .70 ? 'c' : (d2 > R * R * .32 ? 'b' : 'a');       /* limb darkening */
            if (ch !== 'c') {
              const lon = Math.asin(clamp(dx / R, -1, 1)) + th;        /* bercak ikut berputar */
              const f = Math.sin(lon * 2.1 + m.sd) * Math.cos(dy / R * 1.7 + m.sd * .6);
              if (f > m.sp) ch = m.lt ? 'd' : 'e';
              else if (m.hot && f < -.88) ch = 'h';                    /* titik vulkanik Io */
            }
            row += ch;
          }
          map.push(row);
        }
        return map;
      }
      (function () {
        let css = '';
        MOON_DATA.forEach((m, i) => {
          const N = 6, urls = [];
          for (let k = 0; k < N; k++)
            urls.push('data:image/svg+xml,' + encodeURIComponent(px(moonFrame(m, k, N), moonPal(m), m.s)));
          m.face = urls[0]; m.cls = 'ms' + i;                         /* frame diam + kelas animasinya */
          const dur = (2 * Math.PI / MOON_SPD[i] * 0.1).toFixed(2);    /* = periode orbitnya sendiri */
          css += '@keyframes ms' + i + '{' +
            urls.map((u, j) => (j / N * 100).toFixed(2) + '%{background-image:url(' + u + ')}').join('') +
            '100%{background-image:url(' + urls[0] + ')}}' +   /* tutup siklus, jangan sampai kosong */
            '.ms' + i + '{animation:ms' + i + ' ' + dur + 's infinite}';
          /* versi 24x24 untuk jendela detail: peta yang sama, cuma lebih lega */
          const big = Object.assign({}, m, { s: 24 }), burls = [];
          for (let k = 0; k < N; k++)
            burls.push('data:image/svg+xml,' + encodeURIComponent(px(moonFrame(big, k, N), moonPal(m), 24)));
          m.bface = burls[0]; m.bcls = 'msb' + i;
          css += '@keyframes msb' + i + '{' +
            burls.map((u, j) => (j / N * 100).toFixed(2) + '%{background-image:url(' + u + ')}').join('') +
            '100%{background-image:url(' + burls[0] + ')}}' +
            '.msb' + i + '{animation:msb' + i + ' ' + dur + 's infinite}';
        });
        const st = document.createElement('style'); st.textContent = css; document.head.appendChild(st);
      })();

      /* ---- bulan besar di wallpaper: 12 frame siklus fase, pelan sekali ---- */
      (function () {
        const src = M.moon, N = 12, S = src.length, R = S / 2 - 1, urls = [];
        const pal = Object.assign({}, PAL.moon, { 'N': '#5d5f74', 'n': '#4b4d60', 'C': '#3f4152' });
        for (let k = 0; k < N; k++) {
          const ph = k / N * Math.PI * 2, c = Math.cos(ph);
          const fr = src.map((row, y) => {
            let out = '';
            for (let x = 0; x < row.length; x++) {
              const ch = row[x];
              if (!PAL.moon[ch]) { out += '.'; continue; }
              const dx = x + .5 - S / 2, dy = y + .5 - S / 2, w = Math.sqrt(Math.max(0, R * R - dy * dy));
              const lit = ph < Math.PI ? dx > w * c : dx < -w * c;             /* terminator elips */
              out += lit ? ch : (ch === 'M' ? 'N' : ch === 'm' ? 'n' : 'C');     /* sisi gelap = earthshine */
            }
            return out;
          });
          urls.push('data:image/svg+xml,' + encodeURIComponent(px(fr, pal, 48)));
        }
        const st = document.createElement('style');
        st.textContent = '@keyframes mphase{' +
          urls.map((u, j) => (j / N * 100).toFixed(2) + '%{background-image:url(' + u + ')}').join('') +
          '100%{background-image:url(' + urls[0] + ')}}';
        document.head.appendChild(st);
      })();

      function attachMoons(container, cx, cy, radii) {
        const moons = MOON_DATA.map((m, i) => {
          const a = Math.random() * 6.28, r = radii[i];
          return Object.assign({}, m, {
            el: null, a, r, spd: MOON_SPD[i], held: false, ret: false,
            heldX: 0, heldY: 0, x: cx + r * Math.cos(a), y: cy + r * 0.30 * Math.sin(a)
          });
        });
        function place(m) {
          m.el.style.left = Math.round(m.x - MOON_HIT / 2) + 'px';
          m.el.style.top = Math.round(m.y - MOON_HIT / 2) + 'px';
        }
        moons.forEach(m => {
          const e = document.createElement('i');
          e.className = 'jmoon';
          const d = Math.round((MOON_HIT - m.s) / 2);
          e.innerHTML = `<b class="${m.cls}" style="background-image:url(${m.face});width:${m.s}px;height:${m.s}px;left:${d}px;top:${d}px"></b>` +
            `<span class="mtip">${m.n} — drag to move · click for facts</span>`;
          container.appendChild(e); m.el = e;
          place(m);
          e.addEventListener('pointerdown', ev => {
            if (ev.button !== 0) return;
            ev.preventDefault();
            ev.stopPropagation();          /* jangan ikut menyeret planet */
            beginMoonDrag(container, m, cx, cy, ev);
          });
          e.addEventListener('pointerenter', () => { m.hover = true; });
          e.addEventListener('pointerleave', () => { if (!m.dragging) m.hover = false; });
        });
        /* dt dalam detik; MOON_SPD dinyatakan per 100 ms, jadi dikalikan 10 */
        function step(dt, adv) {
          moons.forEach(m => {
            if (m.held) {                       /* mengikuti kursor, tanpa jeda */
              m.x = m.heldX; m.y = m.heldY;
              m.el.style.zIndex = 5; place(m); return;
            }
            if (m.ret) {                        /* meluncur mulus kembali ke orbitnya */
              if (adv) m.a += m.spd * dt * 10;
              const tx = cx + m.r * Math.cos(m.a), ty = cy + m.r * 0.30 * Math.sin(m.a), k = Math.min(1, dt * 7);
              m.x += (tx - m.x) * k; m.y += (ty - m.y) * k;
              if (Math.abs(tx - m.x) < 0.7 && Math.abs(ty - m.y) < 0.7) m.ret = false;
            } else if (adv && !m.hover) {   /* disentuh kursor = berhenti, biar gampang diraih */
              m.a += m.spd * dt * 10;
              m.x = cx + m.r * Math.cos(m.a);
              m.y = cy + m.r * 0.30 * Math.sin(m.a);
            }
            const front = Math.sin(m.a) > 0;
            m.el.style.zIndex = m.ret ? 5 : (front ? 3 : -1);
            m.el.classList.toggle('back', !front);   /* di belakang planet = lebih redup */
            place(m);
          });
        }
        let raf = 0, running = true, dead = false, prev = performance.now();
        function frame(now) {
          if (dead) return;
          raf = requestAnimationFrame(frame);
          const dt = Math.min(.05, (now - prev) / 1000); prev = now;
          if (document.hidden) return;
          step(dt, running);
        }
        raf = requestAnimationFrame(frame);
        return {
          stop() { dead = true; cancelAnimationFrame(raf); },
          toggle() {
            running = !running;
            if (running) prev = performance.now();
            return running;
          },
          grabAt(e) {        /* dipakai planetwrap kalau bulannya sedang menumpuk planet */
            const cr = container.getBoundingClientRect();
            const px = e.clientX - cr.left, py = e.clientY - cr.top;
            let best = null, bd = MOON_HIT * 0.8;
            moons.forEach(m => {
              const d = Math.hypot(m.x - px, m.y - py);
              if (d < bd) { bd = d; best = m; }
            });
            return best ? beginMoonDrag(container, best, cx, cy, e) : false;
          },
          pulse(name) {
            const m = moons.find(m => m.n === name);
            if (m) { m.el.classList.remove('mpulse'); void m.el.offsetWidth; m.el.classList.add('mpulse'); }
          }
        };
      }
      /* Interaksi bulan sengaja dibuat sepola dengan planet Jupiter: satu
         pointerdown lalu pointermove/pointerup didengarkan di window (bukan di
         elemennya), digeser = drag, tanpa gerakan = buka jendela detail.
         Bedanya bulan adalah sasaran kecil yang bergerak, jadi ia juga berhenti
         saat disentuh kursor dan bisa diraih lewat planet kalau sedang menumpuk. */
      function beginMoonDrag(container, m, cx, cy, e) {
        if (m.dragging) return true;
        m.dragging = true;
        const cr = container.getBoundingClientRect();
        const sx = e.clientX, sy = e.clientY;
        let moved = false;
        try { m.el.setPointerCapture(e.pointerId); } catch { }
        /* begitu ditekan bulannya berhenti mengorbit dan tetap pada titik yang
           diklik, tidak melompat ke tengah kursor */
        m.held = true; m.ret = false; m.el.classList.add('held');
        m.heldX = m.x; m.heldY = m.y;
        m.grabX = m.x - (e.clientX - cr.left);
        m.grabY = m.y - (e.clientY - cr.top);
        const mv = ev => {
          if (!moved && Math.hypot(ev.clientX - sx, ev.clientY - sy) < 4) return;
          moved = true;
          m.heldX = ev.clientX - cr.left + m.grabX;
          m.heldY = ev.clientY - cr.top + m.grabY;
          m.x = m.heldX; m.y = m.heldY;                 /* langsung, tak menunggu frame */
          m.el.style.left = Math.round(m.x - MOON_HIT / 2) + 'px';
          m.el.style.top = Math.round(m.y - MOON_HIT / 2) + 'px';
        };
        const up = () => {
          window.removeEventListener('pointermove', mv, true);
          window.removeEventListener('pointerup', up, true);
          window.removeEventListener('pointercancel', up, true);
          m.dragging = false; m.held = false; m.hover = false;
          m.el.classList.remove('held');
          if (moved) {
            m.a = Math.atan2((m.heldY - cy) / (m.r * 0.30), m.heldX - cx);  /* sudut orbit terdekat */
            m.ret = true;                                        /* meluncur pulang */
          } else {
            m.el.classList.remove('mpulse'); void m.el.offsetWidth; m.el.classList.add('mpulse');
            openMoon(m);                                       /* tanpa gerakan = klik */
          }
        };
        window.addEventListener('pointermove', mv, true);
        window.addEventListener('pointerup', up, true);
        window.addEventListener('pointercancel', up, true);
        return true;
      }
      /* start-button 4-color flag */
      const LOGO = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 13 12" width="15" height="14" shape-rendering="crispEdges"><rect width="6" height="5" fill="#d0342c"/><rect x="7" width="6" height="5" fill="#3aa845"/><rect y="6" width="6" height="5" fill="#2461c2"/><rect x="7" y="6" width="6" height="5" fill="#f2c744"/></svg>`;
      $('#startlogo').innerHTML = LOGO;

      /* titlebar button glyphs (staircase X, pixel min/max) */
      function glyX() { let r = ''; for (let i = 0; i < 7; i++) { const a = Math.min(i, 6 - i); r += `<rect x="${a}" y="${i}" width="1" height="1" fill="#000"/><rect x="${7 - a}" y="${i}" width="1" height="1" fill="#000"/>`; } return r; }
      const GLY = {
        min: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 8 7" width="8" height="7" shape-rendering="crispEdges"><rect y="5" width="6" height="2" fill="#000"/></svg>`,
        max: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 8 7" width="8" height="7" shape-rendering="crispEdges"><rect width="8" height="7" fill="#000"/><rect x="1" y="2" width="6" height="4" fill="#c0c0c0"/></svg>`,
        close: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 8 7" width="8" height="7" shape-rendering="crispEdges">${glyX()}</svg>`
      };

      /* cursors + favicon, rendered from pixel maps to canvas */
      function spriteCanvas(map, pal, scale = 1) {
        const w = map[0].length, h = map.length;
        const c = document.createElement('canvas'); c.width = w * scale; c.height = h * scale;
        const ctx = c.getContext('2d');
        map.forEach((row, y) => { for (let x = 0; x < w; x++) { const ch = row[x]; if (pal[ch]) { ctx.fillStyle = pal[ch]; ctx.fillRect(x * scale, y * scale, scale, scale); } } });
        return c;
      }
      /* Every sprite pixel is drawn CUR_PX css px wide. At 1:1 the blocks are too fine to
         read as pixel art — it just looks like the system arrow — so they are doubled, and
         the sprite grids above are drawn coarse enough to stay at system cursor size anyway.
         image-set() adds a double-density copy so the blocks stay sharp on hi-dpi screens. */
      const CUR_PX = 2;
      function cursorScaler() {
        if (typeof CSS === 'undefined' || !CSS.supports) return '';
        return ['image-set', '-webkit-image-set'].find(fn => CSS.supports('cursor', `${fn}(url(a) 1x) 0 0,auto`)) || '';
      }
      const CUR_SCALER = cursorScaler();
      function cursorValue(map, pal, hx, hy, fallback) {
        const hot = `${hx * CUR_PX} ${hy * CUR_PX}`;
        const one = spriteCanvas(map, pal, CUR_PX).toDataURL();
        if (!CUR_SCALER) return `url(${one}) ${hot},${fallback}`;
        const two = spriteCanvas(map, pal, CUR_PX * 2).toDataURL();
        return `${CUR_SCALER}(url(${one}) 1x,url(${two}) 2x) ${hot},${fallback}`;
      }
      (function () {
        const root = document.documentElement.style;
        root.setProperty('--cur-arrow', cursorValue(M.curArrow, PAL.cursor, 0, 0, 'default'));
        root.setProperty('--cur-hand', cursorValue(M.curHand, PAL.cursor, 3, 0, 'pointer'));
        root.setProperty('--cur-text', cursorValue(M.curText, PAL.cursor, 2, 5, 'text'));
        root.setProperty('--cur-nwse', cursorValue(M.curSize, PAL.cursor, 5, 5, 'nwse-resize'));
        root.setProperty('--cur-wait', cursorValue(M.hourglass, PAL.hourglass, 8, 8, 'wait'));
        const fav = spriteCanvas(M.gear, PAL.gear);
        const link = document.createElement('link'); link.rel = 'icon'; link.href = fav.toDataURL();
        document.head.appendChild(link);
      })();
