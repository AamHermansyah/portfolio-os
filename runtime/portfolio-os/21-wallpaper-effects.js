/* =================================================================
         animated wallpaper layers + interactive starfield
      ================================================================= */
      function attachHackerTerminal(root) {
        const terminal = root.querySelector('.hack-terminal');
        const screen = root.querySelector('.hack-screen');
        const history = root.querySelector('.hack-history');
        const input = root.querySelector('.hack-input');
        const typed = root.querySelector('.hack-typed');
        const prompt = 'root@portfolio:~$ ';
        const sessions = [
          { cmd: 'whoami', out: [['aam_hermansyah', 'ok'], ['role: fullstack_developer', 'dim'], ['access: GRANTED', 'ok']] },
          { cmd: 'git status --short', out: [['M  runtime/portfolio-os', 'warn'], ['?? ideas/next-big-thing.md', 'dim'], ['branch main is ready to ship', 'ok']] },
          { cmd: 'npm run deploy', out: [['> portfolio-os@98 deploy', 'dim'], ['building pixel-perfect interface...', 'dim'], ['compiled successfully in 1.98s', 'ok'], ['deployment: ONLINE', 'ok']] },
          { cmd: 'ssh jupiter@orbit', out: [['handshake accepted', 'dim'], ['orbit telemetry: stable', 'ok'], ['6 satellites responding', 'ok']] },
          { cmd: 'cat contact.txt', out: [[LINKS.email, 'ok'], ['channel open — messages welcome', 'dim']] }
        ];
        let scene = 0, char = 0, line = 0, phase = 'typing', ticks = 8;
        function addRow(text, kind) {
          const row = document.createElement('div'); row.className = 'hack-row ' + (kind || ''); row.textContent = text;
          history.appendChild(row);
          while (history.children.length > 15) history.firstElementChild.remove();
          screen.scrollTop = screen.scrollHeight;
        }
        setInterval(() => {
          if (!document.body.classList.contains('wall-hacker')) return;
          if (ticks > 0) { ticks--; return; }
          const session = sessions[scene];
          if (phase === 'typing') {
            input.classList.remove('busy');
            if (char < session.cmd.length) {
              typed.textContent += session.cmd[char++];
              ticks = session.cmd[char - 1] === ' ' ? 2 : 0;
            } else {
              terminal.classList.add('enter'); phase = 'enter'; ticks = 5;
            }
          } else if (phase === 'enter') {
            terminal.classList.remove('enter');
            addRow(prompt + session.cmd, 'command');
            typed.textContent = ''; input.classList.add('busy');
            line = 0; phase = 'output'; ticks = 3;
          } else if (phase === 'output') {
            if (line < session.out.length) {
              const output = session.out[line++]; addRow(output[0], output[1]); ticks = 3;
            } else { phase = 'done'; ticks = 34; }
          } else {
            addRow('', 'dim');
            scene = (scene + 1) % sessions.length; char = 0; phase = 'typing'; ticks = 5;
            input.classList.remove('busy');
          }
        }, 55);
      }

      function buildSky() {
        const synth = document.createElement('div');
        synth.className = 'wallfx synthfx';
        const rays = Array.from({ length: 17 }, (_, i) => '<i style="transform:rotate(' + (-68 + i * 8.5) + 'deg)"></i>').join('');
        synth.innerHTML = '<div class="synth-sun"></div><div class="synth-mountain"></div><div class="synth-grid">' + rays + '</div>';
        DESK.appendChild(synth);

        const hack = document.createElement('div');
        hack.className = 'wallfx hackfx';
        hack.innerHTML = '<div class="hack-terminal" aria-hidden="true">' +
          '<div class="hack-bar"><i class="hack-lamp"></i><i class="hack-lamp"></i><i class="hack-lamp"></i><span class="hack-title">root@portfolioOS: ~/desktop — secure shell</span></div>' +
          '<div class="hack-screen"><div class="hack-history"></div><div class="hack-input"><b class="hack-prompt">root@portfolio:~$&nbsp;</b><span class="hack-typed"></span><i class="hack-cursor"></i></div></div>' +
          '<span class="hack-enter">ENTER ↵</span></div>';
        attachHackerTerminal(hack);
        DESK.appendChild(hack);

        const sky = document.createElement('div');
        sky.className = 'sky';
        sky.innerHTML = '<div class="slyr" id="sky-l1"></div><div class="slyr" id="sky-l2"></div><div class="slyr" id="sky-l3"></div>' +
          '<div class="moonwrap" role="button" tabindex="0" aria-label="Inspect or move the Moon"><div class="halo h3"></div><div class="halo h2"></div><div class="halo h1"></div>' +
          '<div class="moonpix"><i></i></div><div class="jtip">Moon — click to inspect · drag to move</div></div>' +
          '<div class="shoot s1"></div><div class="shoot s2"></div>';
        function tile(n, size, color, w) {
          let r = '';
          for (let i = 0; i < n; i++)
            r += `<rect x="${Math.floor(Math.random() * size)}" y="${Math.floor(Math.random() * size)}" width="${w}" height="${w}"/>`;
          return `url("data:image/svg+xml,${encodeURIComponent(`<svg xmlns='http://www.w3.org/2000/svg' width='${size}' height='${size}'><g fill='${color}'>${r}</g></svg>`)}")`;
        }
        sky.querySelector('#sky-l1').style.backgroundImage = tile(30, 420, 'rgba(255,255,255,.4)', 2);
        sky.querySelector('#sky-l2').style.backgroundImage = tile(22, 320, 'rgba(210,225,255,.65)', 2);
        sky.querySelector('#sky-l3').style.backgroundImage = tile(14, 520, '#ffffff', 3);
        /* Jupiter besar: ukuran dihitung dari lebar viewport (planet "lebih dekat") */
        const jupSize = Math.round(clamp(DESK.clientWidth * 0.24, 120, 196));
        const pw = document.createElement('div');
        pw.className = 'planetwrap';
        pw.innerHTML = '<div class="halo jh3"></div><div class="halo jh2"></div><div class="halo jh1"></div>' +
          '<div class="jup"></div>' +
          '<div class="jtip">Jupiter — click to inspect \u00b7 drag to move</div>';
        pw.style.width = pw.style.height = jupSize + 'px';
        const jh1 = pw.querySelector('.jh1'), jh2 = pw.querySelector('.jh2'), jh3 = pw.querySelector('.jh3');
        jh1.style.width = jh1.style.height = Math.round(jupSize * 0.82) + 'px';
        jh2.style.width = jh2.style.height = Math.round(jupSize * 1.14) + 'px';
        jh2.style.backgroundSize = '6px 6px';
        jh3.style.width = jh3.style.height = Math.round(jupSize * 1.50) + 'px';
        jh3.style.backgroundSize = '8px 8px';
        pw.style.left = Math.round(DESK.clientWidth * 0.26) + 'px';
        pw.style.top = Math.round(DESK.clientHeight * 0.16) + 'px';
        sky.appendChild(pw);
        /* bulan-bulan: radius ikut skala planet, sebidang dengan cincin */
        const jr = [0.54, 0.60, 0.68, 0.79, 0.90, 1.02].map(f => Math.round(f * jupSize));
        attachJupiter(pw.querySelector('.jup'));
        const skyMoons = attachMoons(pw, jupSize / 2, jupSize / 2, jr);
        makeCelestialDrag(pw, openJupiter, skyMoons);
        makeCelestialDrag(sky.querySelector('.moonwrap'), openEarthMoon);
        /* bintang berkedip satu per satu */
        for (let i = 0; i < 10; i++) {
          const t = document.createElement('i');
          t.className = 'tw' + (Math.random() < .3 ? ' big' : '');
          t.style.left = (Math.random() * 97).toFixed(1) + '%';
          t.style.top = (Math.random() * 82).toFixed(1) + '%';
          t.style.animationDuration = (1.4 + Math.random() * 2.6).toFixed(2) + 's';
          t.style.animationDelay = (-Math.random() * 5).toFixed(2) + 's';
          sky.appendChild(t);
        }
        DESK.insertBefore(sky, DESK.firstChild);
      }
      function makeCelestialDrag(wrap, openFn, moons) {
        wrap.addEventListener('keydown', e => {
          if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); openFn(); }
        });
        wrap.addEventListener('pointerdown', e => {
          if (e.button !== 0) return;
          if (moons && moons.grabAt(e)) return;   /* bulan yang sedang menumpuk planet menang */
          const r = wrap.getBoundingClientRect(), dr = DESK.getBoundingClientRect();
          const ox = e.clientX - r.left, oy = e.clientY - r.top, sx = e.clientX, sy = e.clientY;
          let moved = false;
          try { wrap.setPointerCapture(e.pointerId); } catch { }
          const mv = ev => {
            if (!moved && Math.hypot(ev.clientX - sx, ev.clientY - sy) < 5) return;
            moved = true;
            wrap.style.right = 'auto';
            wrap.style.left = clamp(ev.clientX - dr.left - ox, 0, dr.width - r.width) + 'px';
            wrap.style.top = clamp(ev.clientY - dr.top - oy, 0, dr.height - r.height) + 'px';
          };
          const up = () => {
            wrap.removeEventListener('pointermove', mv);
            if (!moved) openFn();   /* tanpa gerakan = klik */
          };
          wrap.addEventListener('pointermove', mv);
          wrap.addEventListener('pointerup', up, { once: true });
          wrap.addEventListener('pointercancel', up, { once: true });
        });
      }
