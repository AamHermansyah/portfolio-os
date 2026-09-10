/* =================================================================
         start menu, run dialog, shut down
      ================================================================= */
      const SM = $('#startmenu');
      function closeStart() { SM.classList.remove('open'); $('#startbtn').classList.remove('pressed'); }
      $('#startbtn').addEventListener('click', () => {
        const open = SM.classList.toggle('open');
        $('#startbtn').classList.toggle('pressed', open);
      });
      function buildStartMenu() {
        SM.innerHTML = `<div class="sm-banner"><span>PortfolioOS<b>98</b></span></div><div class="sm-items"></div>`;
        const wrap = SM.querySelector('.sm-items');
        const items = [
          { ic: 'txt', t: 'About_Me.txt', fn: openAbout },
          { ic: 'folder', t: 'Projects', fn: openProjects },
          { ic: 'gear', t: 'Skills.exe', fn: openSkills },
          { ic: 'pdf', t: 'Resume.pdf', fn: openResume },
          { ic: 'monitor', t: 'Terminal', fn: openTerminal },
          { ic: 'mail', t: 'Contact.exe', fn: openContact },
          { ic: 'briefcase', t: 'Hire_Me.exe', fn: openHire },
          { ic: 'mail', t: 'Testimonials', fn: () => openInbox() },
          { ic: 'globe', t: 'Fiverr Profile', fn: openFiverr },
          { ic: 'network', t: 'Network Neighborhood', fn: openNetwork },
          { ic: 'briefcase', t: 'Career.log', fn: openCareerLog },
          { ic: 'txt', t: 'Changelog.log', fn: openChangelog },
          ...(CREDENTIALS.length ? [{ ic: 'cert', t: 'Certificates', fn: openCertificates }] : []),
          { ic: 'find', t: 'Find\u2026', fn: openFind },
          { ic: 'gear', t: 'Accessibility\u2026', fn: openAccessibility },
          { ic: 'computer', t: 'System Properties', fn: openSysProps },
          { ic: 'monitor', t: 'Display Properties', fn: openWallpaperPicker },
          { sep: true },
          { ic: 'gear', t: 'Run\u2026', fn: runDialog },
          { ic: 'power', t: 'Shut Down\u2026', fn: shutdownDialog }
        ];
        items.forEach(it => {
          if (it.sep) { const s = document.createElement('div'); s.className = 'sm-sep'; wrap.appendChild(s); return; }
          const b = document.createElement('button'); b.type = 'button'; b.className = 'sm-item';
          b.innerHTML = `${svg(it.ic, 24)}<span>${esc(it.t)}</span>`;
          b.addEventListener('click', () => { closeStart(); it.fn(); });
          wrap.appendChild(b);
        });
      }
      function runDialog() {
        dialogBox({
          title: 'Run', icon: svg('gear', 32), w: 400,
          msg: `<b>Run a program</b>Type the name of a program, folder, or regret, and PortfolioOS will pretend to open it.`,
          input: {
            ph: 'e.g. skills', onOK: (v, api) => {
              if (!v) return;
              const t = v.toLowerCase().replace(/\.exe$|\.dll$|\.sys$|\.html$|\.pdf$|\.txt$|\.url$|\.log$/, '');
              const OPEN = {
                'about': openAbout, 'projects': openProjects, 'skills': openSkills, 'terminal': openTerminal,
                'resume': openResume, 'contact': openContact, 'bin': openBin,
                'hire': openHire, 'hire_me': openHire, 'hireme': openHire,
                'system': openSysProps,
                'network': openNetwork,
                'find': openFind,
                'access': openAccessibility,
                'accessibility': openAccessibility,
                'access.cpl': openAccessibility,
                'search': openFind,
                'career': openCareerLog,
                'career-log': openCareerLog,
                'changelog': openChangelog,
                'certificates': openCertificates,
                'certs': openCertificates,
                'nethood': openNetwork,
                'github': openNetwork, 'sysdm': openSysProps, 'sysdm.cpl': openSysProps,
                'computer': openSysProps,
                'testimonials': openInbox, 'praise': openInbox, 'inbox': openInbox,
                'fiverr': openFiverr, 'globe': openFiverr, 'jupiter': openJupiter,
                'wallpaper': openWallpaperPicker, 'display': openWallpaperPicker
              };
              const p = PROJECTS.find(p => p.id === t || p.file === v);
              if (v.toLowerCase() === 'format c:') { api.close(); hourglass(400); setTimeout(bsod, 400); return; }
              if (OPEN[t] || p) {
                api.close();
                if (OPEN[t]) OPEN[t]();
                else openProject(p);
              }
              else errorDialog('Run', `Cannot find '<b>${esc(v)}</b>'. Check the name and try again.<br><span class="dim">Suggestions: skills, projects, career, changelog, terminal, resume, contact, testimonials</span>`);
            }
          },
          buttons: [{ t: 'OK', act: null }, { t: 'Cancel' }]
        });
      }
      function shutdownDialog() {
        dialogBox({
          title: 'Shut Down PortfolioOS', icon: svg('power', 32), w: 420,
          msg: `<b>Are you sure you want to shut down your portfolio?</b><br><br>
         <span class="dim">All open windows will be closed. Your visit, however, is remembered fondly.</span>`,
          buttons: [
            { t: 'Shut Down', act: api => { api.close(); powerOff(); } },
            { t: 'Restart', act: api => { api.close(); restart(); } },
            { t: 'Cancel' }
          ]
        });
      }
      function powerOff() { $('#off').style.display = 'grid'; }
      $('#off').addEventListener('click', () => { $('#off').style.display = 'none'; restart(); });
      function restart() { WM.closeAll(); resetTestiTimers(); boot(); }
      function bootTimeFix() { bootTime = Date.now(); }
