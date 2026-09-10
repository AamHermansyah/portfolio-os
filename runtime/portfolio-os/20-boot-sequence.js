/* =================================================================
         boot sequence — satu handler input persisten (tanpa dead zone)
      ================================================================= */
      let bootTime = Date.now();
      const BIOS_DEVICES = [
        ['Primary Master  ', 'REACT.JS 19', 'FOUND', 'ok'],
        ['Primary Slave   ', 'TYPESCRIPT 5.7', 'FOUND', 'ok'],
        ['Secondary Master', 'NODE.JS 22 LTS', 'FOUND', 'ok'],
        ['Secondary Slave ', 'POSTGRESQL 16', 'FOUND', 'ok'],
        ['IDE 3           ', 'NEXT.JS / GRAPHQL', 'FOUND', 'ok'],
        ['IDE 4           ', 'REDIS / DOCKER', 'FOUND', 'ok'],
        ['Video           ', 'CSS VGA (crisp edges)', 'FOUND', 'ok'],
        ['Network         ', 'REST ADAPTER 1000BASE-T', 'FOUND', 'ok'],
        ['Keyboard        ', 'MECHANICAL, LOUD', 'FOUND', 'ok'],
        ['Caffeine ctrl.  ', 'THERMOS 1.2L', 'OVERCLOCKED', 'amb'],
        ['Social life     ', 'social_calendar.dll', 'NOT FOUND', 'bad']
      ];
      const POST_LINES = [
        ['<span class="h">AamBIOS (C)1997-2026 AamMicro Systems, Inc.</span>', 160],
        ['BIOS Date 04/10/25&ensp;Ver: 08.00.15', 110],
        ['', 80],
        ['Main Processor : Fullstack Developer, 7 Yrs Experience', 140],
        ['MEM', 0],
        ['', 100],
        ['Detecting IDE devices \u2026', 380]
      ].concat(BIOS_DEVICES.map(d => [
        esc(d[0]) + ': ' + esc(d[1].padEnd(22, '\u00b7')) + ' <span class="' + d[3] + '">' + d[2] + '</span>', 110
      ])).concat([
        ['', 90],
        ['Verifying DMI Pool Data ..............', 480],
        ['Booting PortfolioOS 98 ...............', 280]
      ]);

      async function boot() {
        const log = $('#bootlog'), splash = $('#splash'), boot = $('#boot'), hint = $('#bootskip');
        if (PREFS.skipBoot) {
          boot.style.display = 'none';
          bootTimeFix();
          startTestimonials();
          return;
        }
        log.textContent = ''; splash.style.display = 'none';
        boot.style.display = 'block';
        hint.textContent = 'any key fast-forwards \u00b7 ENTER continues';
        const token = { cancel: false, phase: 'type' };
        let proceed = null, promptEl = null, setupTried = false;
        const go = () => { if (proceed) { const p = proceed; proceed = null; p(); } };
        const showPrompt = () => {
          promptEl = document.createElement('span');
          promptEl.className = 'boot-prompt';
          promptEl.innerHTML = '\nPress <b>ENTER</b> to continue, DEL to enter SETUP <span class="bs-cur">_</span>';
          log.appendChild(promptEl);
          hint.textContent = 'press ENTER (or click) to continue';
        };
        const fullPost = () => {
          log.textContent = '';
          for (const [html] of POST_LINES)
            put((html === 'MEM' ? 'Memory Test : 262,144K OK' : html) + '\n');
        };
        const put = html => { const s = document.createElement('span'); s.innerHTML = html; log.appendChild(s); };

        const onKey = e => {
          if (token.phase === 'type') {
            if (token.cancel) return;
            token.cancel = true;
            token.phase = 'prompt';
            fullPost(); showPrompt();
          } else if (token.phase === 'prompt') {
            if (e.key === 'Enter' || e.key === 'NumpadEnter') { e.preventDefault(); go(); }
            else if (e.key === 'Delete' && !setupTried) {
              setupTried = true;
              if (promptEl) promptEl.innerHTML = 'SETUP not implemented in this BIOS. Press <b>ENTER</b> to continue <span class="bs-cur">_</span>';
            }
          }
        };
        const onPtr = () => {
          if (token.phase === 'type') {
            if (token.cancel) return;
            token.cancel = true;
            token.phase = 'prompt';
            fullPost(); showPrompt();
          } else if (token.phase === 'prompt') { go(); }
        };
        document.addEventListener('keydown', onKey);
        boot.addEventListener('pointerdown', onPtr);

        for (const [html, d] of POST_LINES) {
          if (token.cancel) break;
          if (html === 'MEM') {
            const s = document.createElement('span');
            for (let k = 0; k <= 262144; k += 32768) {
              if (token.cancel) break;
              s.textContent = 'Memory Test : ' + k.toLocaleString('en-US') + 'K';
              if (!s.parentNode) log.appendChild(s);
              await wait(70);
            }
            s.textContent = 'Memory Test : 262,144K OK';
            continue;
          }
          put(html + '\n');
          await wait(d);
        }
        if (token.phase === 'type') {
          token.phase = 'prompt';
          showPrompt();
        }

        await new Promise(r => proceed = r);
        token.phase = 'splash';
        document.removeEventListener('keydown', onKey);
        boot.removeEventListener('pointerdown', onPtr);

        splash.style.display = 'grid';
        await wait(1250);
        boot.style.display = 'none';
        bootTimeFix();
        startTestimonials();
        setTimeout(() => dialogBox({
          title: 'Welcome to PortfolioOS', icon: svg('monitor', 32), w: 430,
          msg: `<b>Welcome, visitor.</b>
         This portfolio is a working desktop from 1998: double-click icons to open things,
         drag windows by the title bar, resize them from the bottom-right corner,
         minimize them to the taskbar.<br><br>
         The <b class="inline">Terminal</b> has a <i>help</i> command, the <b class="inline">Recycle Bin</b> has baggage,
         and there are at least two easter eggs.<br><br>
         <span class="dim">New: <b class="inline">Hire_Me.exe</b> and <b class="inline">Contact.exe</b> send a real message,
         <b class="inline">Network Neighborhood</b> browses the GitHub account, <b class="inline">Find</b> searches every project by
         technology, and <b class="inline">Accessibility</b> (right-click the desktop) can reduce motion, raise contrast or skip
         this boot entirely. In Orbit mode, Jupiter and the Moon are still draggable.</span>`}), 350);
      }
