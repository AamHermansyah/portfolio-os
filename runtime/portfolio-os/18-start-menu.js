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
          { ic: 'folder', t: tr('Projects'), fn: openProjects },
          { ic: 'gear', t: 'Skills.exe', fn: openSkills },
          { ic: 'pdf', t: 'Resume.pdf', fn: openResume },
          { ic: 'monitor', t: 'Terminal', fn: openTerminal },
          { ic: 'mail', t: 'Contact.exe', fn: openContact },
          { ic: 'briefcase', t: 'Hire_Me.exe', fn: openHire },
          { ic: 'mail', t: tr('Testimonials'), fn: () => openInbox() },
          ...(MAILBOX.signedIn ? [{ ic: 'mail', t: 'Mailbox', fn: openMailbox }] : []),
          { ic: 'globe', t: tr('Fiverr Profile'), fn: openFiverr },
          { ic: 'network', t: tr('Network Neighborhood'), fn: openNetwork },
          { ic: 'briefcase', t: 'Career.log', fn: openCareerLog },
          { ic: 'txt', t: 'Changelog.log', fn: openChangelog },
          ...(credentialsIn('certs').length ? [{ ic: 'cert', t: tr('Certificates'), fn: openCertificates }] : []),
          ...(credentialsIn('experience').length ? [{ ic: 'experience', t: tr('Experience'), fn: openExperience }] : []),
          ...(credentialsIn('education').length ? [{ ic: 'education', t: tr('Education'), fn: openEducation }] : []),
          ...(PUBLICATIONS.length ? [{ ic: 'journal', t: tr('Publications'), fn: openPublications }] : []),
          { ic: 'globe', t: tr('Simple view'), fn: openSimpleView },
          { ic: 'gear', t: tr('Language') + ': ' + otherLanguage().label, fn: switchLanguage },
          { ic: 'find', t: tr('Find\u2026'), fn: openFind },
          { ic: 'gear', t: tr('Accessibility\u2026'), fn: openAccessibility },
          { ic: 'computer', t: tr('System Properties'), fn: openSysProps },
          { ic: 'monitor', t: tr('Display Properties'), fn: openWallpaperPicker },
          { sep: true },
          ...(MAILBOX.signedIn ? [{ ic: 'power', t: 'Log Off ' + MAILBOX.username + '\u2026', fn: logOffDialog }] : []),
          { ic: 'gear', t: tr('Run\u2026'), fn: runDialog },
          { ic: 'power', t: tr('Shut Down\u2026'), fn: shutdownDialog }
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
          title: tr('Run'), icon: svg('gear', 32), w: 400,
          msg: tr('<b>Run a program</b>Type the name of a program, folder, or regret, and PortfolioOS will pretend to open it.'),
          input: {
            ph: tr('e.g. skills'), onOK: (v, api) => {
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
                'experience': openExperience, 'work': openExperience,
                'education': openEducation, 'school': openEducation,
                'publications': openPublications,
                'papers': openPublications,
                'nethood': openNetwork,
                'github': openNetwork, 'sysdm': openSysProps, 'sysdm.cpl': openSysProps,
                'computer': openSysProps,
                'testimonials': openInbox, 'praise': openInbox, 'inbox': openInbox,
                'fiverr': openFiverr, 'globe': openFiverr, 'jupiter': openJupiter,
                'wallpaper': openWallpaperPicker, 'display': openWallpaperPicker
              };
              const p = findProject(v);
              if (v.toLowerCase() === 'format c:') { api.close(); hourglass(400); setTimeout(bsod, 400); return; }
              if (OPEN[t] || p) {
                api.close();
                if (OPEN[t]) OPEN[t]();
                else openProject(p);
              }
              else errorDialog(tr('Run'), tr(`Cannot find '<b>{name}</b>'. Check the name and try again.<br><span class="dim">Suggestions: skills, projects, publications, career, terminal, resume, contact</span>`, { name: esc(v) }));
            }
          },
          buttons: [{ t: tr('OK'), act: null }, { t: tr('Cancel') }]
        });
      }
      function shutdownDialog() {
        dialogBox({
          title: tr('Shut Down PortfolioOS'), icon: svg('power', 32), w: 420,
          msg: `${tr('<b>Are you sure you want to shut down your portfolio?</b>')}<br><br>
         <span class="dim">${tr('All open windows will be closed. Your visit, however, is remembered fondly.')}</span>`,
          buttons: [
            { t: tr('Shut Down'), act: api => { api.close(); powerOff(); } },
            { t: tr('Restart'), act: api => { api.close(); restart(); } },
            { t: tr('Cancel') }
          ]
        });
      }
      function powerOff() { $('#off').style.display = 'grid'; }
      $('#off').addEventListener('click', () => { $('#off').style.display = 'none'; restart(); });
      function restart() { WM.closeAll(); resetTestiTimers(); boot(); }
      function bootTimeFix() { bootTime = Date.now(); }
