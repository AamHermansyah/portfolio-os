/* ---- Fiverr.url — profile di browser palsu ---- */
      function openFiverr() {
        WM.create({
          id: 'fiverr', title: 'Fiverr — Portfolio Navigator', icon: svg('globe', 14), w: 560, h: 480,
          status: ['Done', 'Internet zone'],
          build(body, api) {
            body.className = 'win-body app-web';
            body.innerHTML = `<div class="web-tools">
        <button class="btn sm" data-a="back">Back</button>
        <button class="btn sm" data-a="fwd">Forward</button>
        <button class="btn sm" data-a="ref">Refresh</button>
        <span class="vsep"></span>
        <span class="web-addr-lb">Address</span>
        <div class="web-addr">${svg('globe', 14)}<span>https://www.fiverr.com/${esc(FIVERR.user)}</span></div>
      </div>
      <div class="web-page"></div>`;
            const page = body.querySelector('.web-page');
            function render() {
              const visits = fiverrVisits++;
              page.innerHTML = `<div class="fw">
        <div class="fw-marquee"><span>*** AAM HERMANSYAH IS AVAILABLE FOR FREELANCE PROJECTS *** ${esc(FIVERR.headline)} ***</span></div>
        <div class="fw-hdr">
          <span class="fw-logo">fiverr</span>
          <span class="fw-sub">/ ${esc(FIVERR.user)} &mdash; freelance profile, rendered by Portfolio Navigator 4.0</span>
        </div>
        <div class="fw-seller">
          <div class="prev-av">${personIcon({ skin: '#c98a5b', hair: '#1e1410', shirt: '#1dbf73' }, 40)}</div>
          <div>
            <div class="fw-name"><b>${esc(PROFILE.name)}</b> — ${esc(FIVERR.headline)}</div>
            <div class="fw-meta">${esc(PROFILE.location)} &middot; ${esc(PROFILE.timezone)} &middot; ${esc(PROFILE.status)}</div>
          </div>
        </div>
        <p><b>What I deliver:</b></p>
        <ul class="fw-list">${FIVERR.gigs.map(x => `<li>${esc(x)}</li>`).join('')}</ul>
        <a class="fw-visit" href="${FIVERR.url}" target="_blank" rel="noopener">Open profile on Fiverr</a>
        <div class="fw-foot">
          <span>You are visitor no. <span class="fw-counter">${String(visits).padStart(6, '0').split('').map(d => '<b>' + d + '</b>').join('')}</span></span>
          <span>Best viewed at 800&times;600</span>
        </div>
        <p style="font:italic 11px var(--mono);color:#777;margin-top:8px">The profile is real. The browser is not.</p>
      </div>`;
              api.status[0].textContent = 'Done';
            }
            render();
            body.querySelector('[data-a="back"]').addEventListener('click', () => { api.status[0].textContent = 'End of history — the web was smaller in 1998.'; });
            body.querySelector('[data-a="fwd"]').addEventListener('click', () => { api.status[0].textContent = 'End of history — the web was smaller in 1998.'; });
            body.querySelector('[data-a="ref"]').addEventListener('click', () => { hourglass(450); setTimeout(render, 350); });
          }
        });
      }

      /* ---- Moon & Jupiter — Orbit Observatory ---- */
      function openEarthMoon() {
        WM.create({
          id: 'earth-moon', title: 'Moon — Earth\'s natural satellite', icon: svg('moon', 14), w: 432, h: 'auto',
          status: ['Natural satellite of Earth', 'Drag it around the sky'],
          build(body) {
            body.className = 'win-body app-moon';
            body.innerHTML = `<div class="mn-wrap">
          <div class="mn-stage"><i class="earth-moon-detail"></i></div>
          <div class="mn-side">
            <table class="pj-meta">
              <tr><td>Class</td><td>Natural satellite of Earth</td></tr>
              <tr><td>Diameter</td><td>3,474.8 km</td></tr>
              <tr><td>Orbit</td><td>27.3 days, 384,400 km average</td></tr>
              <tr><td>Day</td><td>Exactly one orbit — the same side faces Earth</td></tr>
              <tr><td>Gravity</td><td>1.62 m/s² — about one-sixth of Earth</td></tr>
              <tr><td>First landing</td><td>Apollo 11, July 20, 1969</td></tr>
            </table>
            <p class="mn-fact">Earth's only natural satellite steadies our planet's axial tilt and drives most ocean tides. Its footprints will last a very, very long time.</p>
          </div>
        </div>`;
          }
        });
      }

      function openMoon(m) {
        const kind = m.inner ? 'inner moon' : 'Galilean moon';
        WM.create({
          id: 'moon-' + m.n, title: m.n + ' — ' + kind, w: 432, h: 'auto',
          icon: '<img src="' + m.face + '" width="14" height="14" alt="" style="image-rendering:pixelated;display:block">',
          status: ['Tidally locked — one face always towards Jupiter', 'Drag it around the sky'],
          build(body) {
            body.className = 'win-body app-moon';
            body.innerHTML = `<div class="mn-wrap">
          <div class="mn-stage"><i class="${m.bcls}" style="background-image:url(${m.bface})"></i></div>
          <div class="mn-side">
            <table class="pj-meta">
              <tr><td>Class</td><td>${esc(kind)} of Jupiter</td></tr>
              <tr><td>Diameter</td><td>${esc(m.dia)}</td></tr>
              <tr><td>Orbit</td><td>${esc(m.per)} days, ${esc(m.dist)} out</td></tr>
              <tr><td>Day</td><td>Exactly one orbit — it never turns away</td></tr>
              <tr><td>Found</td><td>${esc(m.disc)}</td></tr>
            </table>
            <p class="mn-fact">${esc(m.fact)}</p>
          </div>
        </div>`;
          }
        });
      }
      function openJupiter() {
        WM.create({
          id: 'jupiter', title: 'Jupiter — Orbit Observatory', icon: jIcon(14), w: 600, h: 440,
          menubar: [
            { label: 'File', items: [{ label: 'Close', act: a => a.close() }] },
            { label: 'Help', items: [{ label: 'About PortfolioOS', act: aboutOS }] }
          ],
          status: ['Simulation running — time compressed 40,000\u00d7', 'Orbit Observatory'],
          onClose(api) { if (api.moons) api.moons.stop(); },
          build(body, api) {
            body.className = 'win-body app-jup';
            body.innerHTML = `<div class="jup-wrap">
        <div class="jstage"><div class="jup"></div></div>
        <div class="jupe-side">
          <table class="pj-meta">
            <tr><td>Class</td><td>Gas giant, 5th from the Sun</td></tr>
            <tr><td>Mass</td><td>317.8 Earths</td></tr>
            <tr><td>Day</td><td>9 h 56 m — fastest planet</td></tr>
            <tr><td>Rings</td><td>4 faint — halo, main, 2 gossamer</td></tr>
            <tr><td>Moons</td><td>95 known, 4 Galilean</td></tr>
            <tr><td>Red Spot</td><td>~350 years old, still moody</td></tr>
            <tr><td>Distance</td><td>5.2 AU (778 million km)</td></tr>
          </table>
          <div class="jup-ml"></div>
          <div class="jup-btns">
            <button class="btn sm" data-a="pause">Pause orbit</button>
            <button class="btn sm" data-a="fact">Random fact</button>
          </div>
        </div>
      </div>`;
            const ml = body.querySelector('.jup-ml');
            MOON_DATA.forEach(m => {
              const row = document.createElement('button'); row.type = 'button'; row.className = 'jup-mrow';
              row.innerHTML = `<i style="background-image:url(${m.face});width:${m.s}px;height:${m.s}px"></i><b>${m.n}</b><span>period ${m.per} d — click for details</span>`;
              row.addEventListener('click', () => { api.moons.pulse(m.n); openMoon(m); });
              ml.appendChild(row);
            });
            attachJupiter(body.querySelector('.jstage .jup'));
            api.moons = attachMoons(body.querySelector('.jstage'), 160, 125, [96, 106, 116, 128, 142, 154]);
            const pb = body.querySelector('[data-a="pause"]');
            pb.addEventListener('click', () => {
              const running = api.moons.toggle();
              pb.textContent = running ? 'Pause orbit' : 'Resume orbit';
              api.status[0].textContent = running ? 'Simulation running — time compressed 40,000\u00d7' : 'Simulation paused — the moons are holding their breath.';
            });
            let jfi = -1;
            body.querySelector('[data-a="fact"]').addEventListener('click', () => {
              jfi = (jfi + 1) % JFACTS.length;
              dialogBox({
                title: 'Jupiter — field note', icon: jIcon(32), w: 400,
                msg: '<b>Field note ' + (jfi + 1) + ' of ' + JFACTS.length + '</b>' + esc(JFACTS[jfi])
              });
            });
          }
        });
      }

      /* ---- Recycle Bin ---- */
      function openBin() {
        const binWin = () => {
          openExplorerWin({
            id: 'bin', title: 'Recycle Bin', icon: s => svg('binF', s), path: 'C:\\Recycled',
            stat2: 'Deleted regrets',
            empty: 'The Recycle Bin is empty.<br>(Surprisingly peaceful.)',
            items: () => binContents.map(it => ({
              f: it.f, type: it.type, size: it.size, desc: it.desc, icon: it.icon,
              open: () => errorDialog(it.f, esc(it.msg).replace(/\n/g, '<br>'))
            })),
            tool: {
              t: 'Empty Recycle Bin', act: (refresh) => {
                if (!binContents.length) { errorDialog('Recycle Bin', 'It is already empty.<br>There is nothing left to delete. Not even emotionally.'); return; }
                dialogBox({
                  title: 'Confirm Multiple File Delete', icon: svg('warn', 32), w: 400,
                  msg: `<b>Are you sure you want to permanently delete these ${binContents.length} items?</b><br><br><span class="dim">They are already quite deleted, emotionally speaking.</span>`,
                  buttons: [
                    { t: 'Yes', act: api => { api.close(); beep(500, 80); binContents = []; refresh(); updateBinIcon(); } },
                    { t: 'No' }
                  ]
                });
              }
            }
          });
        };
        binWin();
      }
      function updateBinIcon() {
        const el = document.querySelector('.dicon[data-id="bin"] .di-img');
        if (el) el.innerHTML = svg(binContents.length ? 'binF' : 'binE', 32);
      }
