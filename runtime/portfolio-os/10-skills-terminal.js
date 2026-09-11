/* ---- Skills.exe (installer) ---- */
      function openSkills() {
        WM.create({
          id: 'skills', title: 'SkillPack 98 Setup', icon: svg('gear', 14), w: 420, h: 370, dialog: true,
          onClose(api) { (api.timers || []).forEach(clearInterval); },
          build(body, api) {
            api.timers = [];
            body.className = 'win-body app-skill';
            body.innerHTML = `
    <div class="sk-banner">${svg('gear', 28)}<div><b>SkillPack&trade; 98 &mdash; Setup</b><div class="sk-bver">Installing Alex's core competencies</div></div></div>
    <div class="sk-main">
      <div data-p="1">
        <p class="sk-lead">This wizard will install Alex's core competencies onto this portfolio.</p>
        <p class="sk-dim">9 components, 874 KB total. Installation is entirely metaphorical &mdash; no actual skills can be transferred over HTTP, unfortunately.</p>
        <ul class="sk-files">${SKILLS.map(s => `<li>${esc(s.file)}</li>`).join('')}</ul>
      </div>
      <div data-p="2" hidden>
        <div class="sk-installing">Installing components&hellip;</div>
        ${SKILLS.map(s => `<div class="sk-row"><span class="sk-nm">${esc(s.name)}</span><span class="sk-fl">${esc(s.file)}</span><div class="pbar"><div class="pfill"></div></div><span class="sk-pc">0%</span></div>`).join('')}
        <div class="sk-row sk-all"><span class="sk-nm"><b>Overall</b></span><span class="sk-fl"></span><div class="pbar"><div class="pfill"></div></div><span class="sk-pc">0%</span></div>
        <div class="sk-status">&nbsp;</div>
      </div>
      <div data-p="3" hidden>
        <p class="sk-lead"><b>Setup completed.</b></p>
        <p class="sk-dim">8 of 9 components installed successfully.<br>
        rustc.exe reported error 0x00DEAD &mdash; "insufficient weekends". Setup recommends scheduling more of them.</p>
        <p class="sk-dim" style="margin-top:10px">Proficiency values are self-reported.<br>Trust, but verify in an interview.</p>
      </div>
    </div>
    <div class="sk-btns">
      <button class="btn" data-b="go">Install&hellip;</button>
      <button class="btn" data-b="cancel">Cancel</button>
    </div>`;
            const phases = [...body.querySelectorAll('[data-p]')];
            const rows = [...body.querySelectorAll('[data-p="2"] .sk-row:not(.sk-all)')];
            const allRow = body.querySelector('.sk-all');
            const status = body.querySelector('.sk-status');
            const bGo = body.querySelector('[data-b="go"]'), bCancel = body.querySelector('[data-b="cancel"]');
            function setPhase(n) {
              phases.forEach(p => p.hidden = p.dataset.p !== String(n));
              if (n === 1) { bGo.textContent = 'Install\u2026'; bGo.style.display = ''; bCancel.textContent = 'Cancel'; }
              if (n === 2) { bGo.style.display = 'none'; bCancel.textContent = 'Cancel'; }
              if (n === 3) { bGo.style.display = ''; bGo.textContent = 'Reinstall'; bCancel.textContent = 'Close'; }
            }
            function setRow(r, v) {
              r.querySelector('.pfill').style.width = Math.max(0, v - 1) + '%';
              r.querySelector('.sk-pc').textContent = v + '%';
            }
            bCancel.addEventListener('click', () => api.close());
            bGo.addEventListener('click', () => {
              if (bGo.textContent.indexOf('Reinstall') === 0) { rows.concat([allRow]).forEach(r => { setRow(r, 0); r.querySelector('.pfill').classList.remove('err'); }); }
              setPhase(2); install();
            });
            function install() {
              let i = 0;
              const total = SKILLS.reduce((a, s) => a + s.level, 0);
              let doneSum = 0;
              function next() {
                if (i >= SKILLS.length) {
                  status.textContent = 'Installation complete \u2014 8 of 9 components installed. Review the results or close this window when you are ready.';
                  bGo.style.display = '';
                  bGo.textContent = 'Reinstall';
                  bCancel.textContent = 'Close';
                  return;
                }
                const s = SKILLS[i], r = rows[i];
                status.textContent = 'Copying ' + s.file + ' \u2026';
                let v = 0; const step = Math.max(3, Math.round(s.level / 14));
                const t = setInterval(() => {
                  v = Math.min(s.level, v + step);
                  setRow(r, v);
                  setRow(allRow, Math.round((doneSum + v) / total * 100));
                  api.setTitle('SkillPack 98 Setup — ' + Math.round((doneSum + v) / total * 100) + '%');
                  if (v >= s.level) {
                    clearInterval(t); api.timers = api.timers.filter(x => x !== t);
                    doneSum += s.level;
                    if (s.fail) {
                      r.querySelector('.pfill').classList.add('err');
                      status.textContent = s.file + ': error 0x00C0FFEE — insufficient weekends. Setup continues\u2026';
                      api.timers.push(setTimeout(() => { i++; next(); }, 700));
                    } else {
                      i++; api.timers.push(setTimeout(next, 70));
                    }
                  }
                }, 42);
                api.timers.push(t);
              }
              next();
            }
          }
        });
      }

      /* ---- Terminal ---- */
      function openTerminal() {
        WM.create({
          id: 'terminal', title: 'Terminal — fauxcmd.exe', icon: svg('monitor', 14), w: 620, h: 400,
          /* WM.close() reads onClose off the options object, so the handler that
             used to be assigned to api inside build() never ran and every timer
             the terminal started outlived its window. openSkills above already
             does it this way. */
          onClose(api) {
            if (api.term) api.term.alive = false;
            (api.timers || []).forEach(clearInterval);
          },
          build(body, api) {
            body.className = 'win-body app-term';
            body.innerHTML = `<div class="t-out"></div><div class="t-line"><span class="t-ps">C:\\PORTFOLIO&gt;</span><input class="t-in" autocomplete="off" autocapitalize="off" spellcheck="false" aria-label="terminal input"></div>`;
            const out = body.querySelector('.t-out'), inp = body.querySelector('.t-in'), psEl = body.querySelector('.t-ps');
            /* The rendered prompt and the echoed one are two separate strings:
               the span carries no trailing space so the caret sits flush. */
            let PS = 'C:\\PORTFOLIO> ';
            let pending = null, hist = [], hi = 0, busy = false;
            api.timers = [];
            function print(txt, cls) {
              String(txt).split('\n').forEach(l => {
                const d = document.createElement('div'); d.className = 't-row' + (cls ? ' ' + cls : '');
                d.textContent = l; out.appendChild(d);
              });
              out.scrollTop = out.scrollHeight;
            }
            function printHTML(html) {
              const d = document.createElement('div'); d.className = 't-row'; d.innerHTML = html;
              out.appendChild(d); out.scrollTop = out.scrollHeight;
            }
            function setPrompt(text, admin) {
              PS = text + ' '; psEl.textContent = text; psEl.classList.toggle('admin', !!admin);
            }
            /* One-shot prompt. A secret prompt masks the echo, hands back the
               reply byte for byte, and locks the history keys while it is open. */
            function ask(label, secret, fn, cancel) {
              pending = { label, secret, fn, cancel };
              psEl.textContent = label.replace(/\s+$/, '');
              if (secret) inp.type = 'password';
              inp.focus();
            }
            function endAsk() { inp.type = 'text'; psEl.textContent = PS.slice(0, -1); }
            /* Rewrites the last echoed line and drops it from history, for a
               command that should never have been typed out in full. */
            function redactLast(replacement) {
              if (out.lastElementChild) out.lastElementChild.textContent = PS + replacement;
              if (hist.length) { hist.pop(); hi = hist.length; }
            }
            const term = {
              api, out, alive: true, timers: api.timers,
              print, printHTML, ask, setPrompt, redactLast,
              setBusy(v) { busy = !!v; }
            };
            api.term = term;
            print('PortfolioOS 98 [Version 4.10.1998]\n(C) Copyright 1998-2026 Aam Hermansyah.');
            print('Type "help" to see available commands.\n', 'dim');
            body.addEventListener('pointerdown', e => { if (!e.target.closest('a')) setTimeout(() => inp.focus(), 0); });
            inp.addEventListener('keydown', e => {
              /* History has to be unreachable while a secret is on screen, or
                 ArrowUp pastes an earlier line straight into the password. */
              if (pending && (e.key === 'ArrowUp' || e.key === 'ArrowDown')) { e.preventDefault(); return; }
              if (e.key === 'Escape' && pending) {
                const p = pending; pending = null; inp.value = ''; endAsk();
                print(p.label + '^C', 'dim'); if (p.cancel) p.cancel(); return;
              }
              if (busy) { if (e.key === 'Enter') { e.preventDefault(); beep(300, 60); } return; }
              if (e.key === 'ArrowUp') { if (hi > 0) { hi--; inp.value = hist[hi] || ''; } e.preventDefault(); return; }
              if (e.key === 'ArrowDown') { if (hi < hist.length) { hi++; inp.value = hist[hi] || ''; } e.preventDefault(); return; }
              if (e.key !== 'Enter') return;
              const raw = inp.value; inp.value = '';
              if (pending) {
                const p = pending; pending = null; endAsk();
                /* The echo used to run before this branch, which would print a
                   password into the scrollback, and the reply used to be
                   lowercased, which would destroy a case-sensitive one. */
                print(p.label + (p.secret ? '********' : raw));
                p.fn(p.secret ? raw : raw.trim().toLowerCase());
                return;
              }
              print(PS + raw);
              const line = raw.trim();
              if (!line) return;
              hist.push(raw); hi = hist.length;
              exec(line);
            });
            function fmtDate() { return new Date().toString(); }
            function uptime() {
              const s = Math.max(1, Math.round((Date.now() - bootTime) / 1000));
              return Math.floor(s / 60) + 'm ' + (s % 60) + 's';
            }
            function bar(l) { const f = Math.round(l / 10); return '[' + '#'.repeat(f) + '.'.repeat(10 - f) + ']'; }
            const OPEN = {
              'about': openAbout, 'projects': openProjects, 'skills': openSkills, 'terminal': openTerminal,
              'resume': openResume, 'contact': openContact, 'bin': openBin, 'recycle': openBin,
              'testimonials': openInbox, 'praise': openInbox, 'inbox': openInbox,
              'career': openCareerLog, 'career-log': openCareerLog,
              'changelog': openChangelog, 'publications': openPublications, 'papers': openPublications,
              'fiverr': openFiverr, 'globe': openFiverr, 'jupiter': openJupiter,
              'wallpaper': openWallpaperPicker, 'display': openWallpaperPicker
            };
            function exec(line) {
              const parts = line.split(/\s+/), c = parts[0].toLowerCase(), arg = parts.slice(1).join(' ');
              /* Several resource names — career, projects, publications, skills and contact — are
                 already public commands below. While signed in the administrative
                 meaning wins, because that is what the operator came here for;
                 the visitor's window is still one "open <name>" away. Signed out
                 this returns false immediately and nothing changes. */
              if (adminIntercept(c, arg, parts, term)) return;
              switch (c) {
                case 'help':
                  print(
                    'PortfolioOS command reference\n\n' +
                    '  help             this list\n' +
                    '  about            who is behind this OS\n' +
                    '  projects         list installed project files\n' +
                    '  skills           print skill levels (ASCII mode)\n' +
                    '  testimonials     what people say\n' +
                    '  publications    open the research library\n' +
                    '  career          open the separate career timeline\n' +
                    '  changelog       open PortfolioOS shipping history\n' +
                    '  fiverr           freelance profile\n' +
                    '  jupiter          the planet living in the wallpaper\n' +
                    '  wallpaper [name] list or change desktop wallpaper\n' +
                    '  open <file>      launch a window app, e.g. open projects\n' +
                    '  ls / dir         list contents of C:\\PORTFOLIO\n' +
                    '  resume           open resume.pdf\n' +
                    '  contact          how to reach me\n' +
                    '  neofetch         system information, obviously\n' +
                    '  whoami           identity check\n' +
                    '  date             current system date/time\n' +
                    '  clear / cls      wipe the screen\n' +
                    '  format c:        (do not)\n' +
                    '  exit             close this terminal\n\n' +
                    adminHelpText() +
                    'Type commands at your own risk.', 'ok');
                  break;
                case 'about':
                  print(PROFILE.name + ' — fullstack developer (' + PROFILE.location + ')\n' +
                    'TypeScript on both ends: Next.js and React in front,\n' +
                    'Node and Prisma behind, deployed where people can open it.\n' +
                    'Built: a logistics platform, a tour-guide marketplace,\n' +
                    'exam and health applications. All source is on GitHub.\n' +
                    'Dislikes: infinite scroll. (Hence all this.)');
                  break;
                case 'projects':
                  print('Project files on drive C:\n\n' + PROJECTS.map(p => '  ' + p.file.padEnd(17) + p.tagline).join('\n') +
                    '\n\nType: open <filename>  to run any of them.', 'ok');
                  break;
                case 'testimonials': case 'praise':
                  if (!TESTIMONIALS.length) { print('No testimonials on file yet.', 'dim'); break; }
                  print('What people say (delivered via Testimonial Express):\n');
                  TESTIMONIALS.forEach(t => print('  ' + t.from.padEnd(19) + ('*'.repeat(t.stars)) + '  ' + t.role));
                  print('\nType "open testimonials" to launch the inbox.', 'dim');
                  break;
                case 'access':
        case 'accessibility':
          print('Opening Accessibility Properties \u2026', 'ok');
          openAccessibility();
          break;
        case 'find':
        case 'search':
          print('Opening Find \u2026', 'ok');
          openFind();
          break;
        case 'changelog':
          print('Opening Changelog.log \u2026', 'ok');
          openChangelog();
          break;
        case 'career':
          print('Opening Career.log \u2026', 'ok');
          openCareerLog();
          break;
        case 'certificates':
          print('Opening Certificates \u2026', 'ok');
          openCertificates();
          break;
        case 'publications':
        case 'papers':
          print('Opening Publications \u2026', 'ok');
          openPublications();
          break;
        case 'github':
        case 'network':
          print('Opening Network Neighborhood \u2026', 'ok');
          openNetwork();
          break;
        case 'fiverr':
                  print('Fiverr — freelance profile\n\n' +
                    '  Seller  : ' + FIVERR.user + '\n' +
                    '  Focus   : ' + FIVERR.headline + '\n\n  ' + FIVERR.url);
                  print('\nType "open fiverr" to view it in Portfolio Navigator.', 'dim');
                  break;
                case 'jupiter':
                  print('Jupiter — the wallpaper planet\n\n' +
                    '  Class   : gas giant, 5th from the Sun\n' +
                    '  Mass    : 317.8 Earths\n' +
                    '  Day     : 9h 56m — fastest spinner in the system\n' +
                    '  Rings   : yes, faint — halo + main + gossamer\n' +
                    '  Moons   : 95 known (4 Galilean)\n' +
                    '  Red Spot: ~350 years old and still going\n\n' +
                    'It is clickable. Everything here is clickable.');
                  print('\nType "open jupiter" to launch the Orbit Observatory.', 'dim');
                  break;
                case 'wallpaper':
                  if (!arg) {
                    print('Current wallpaper: ' + currentWallpaper().name + '\n\nAvailable wallpapers:\n' +
                      WALLPAPERS.map(w => '  ' + w.id.padEnd(11) + w.name + ' — ' + w.desc).join('\n') +
                      '\n\nUse: wallpaper <name>  or  open wallpaper', 'ok');
                  } else {
                    const q = arg.toLowerCase();
                    const wall = WALLPAPERS.find(w => w.id === q || w.name.toLowerCase() === q);
                    if (wall) { setWallpaper(wall.id, true); print('Wallpaper changed to ' + wall.name + '.', 'ok'); }
                    else print('Unknown wallpaper: ' + arg + '\nType "wallpaper" to list available names.', 'err');
                  }
                  break;
                case 'skills':
                  SKILLS.forEach(s => print('  ' + s.name.padEnd(13) + bar(s.level) + ' ' + s.level + '%' + (s.fail ? '  (still installing\u2026)' : '')));
                  print('\nRun Skills.exe for the graphical installer. Very 1998.', 'dim');
                  break;
                case 'ls': case 'dir':
                  print(' Volume in drive C is PORTFOLIO\n Directory of C:\\PORTFOLIO\n\n' +
                    'ABOUT_M~1 TXT     2,847 03-14-25  About the developer\n' +
                    'PROJECTS      <DIR>    01-02-25  Project files\n' +
                    'SKILLS   EXE    65,536 01-02-25  Skill installer\n' +
                    'TERMINAL EXE    16,384 01-02-25  Command line\n' +
                    'RESUME   PDF   128,000 03-14-25  Printable resume\n' +
                    'CONTACT  EXE     9,216 01-02-25  Mail composer\n' +
                    'TESTIMON EXE    10,240 05-09-25  Testimonial inbox\n' +
                    'PUBLICAT LIB    12,288 09-11-26  Research library\n' +
                    'CAREER   LOG     4,096 09-10-26  Career timeline\n' +
                    'CHANGELO LOG     6,144 09-10-26  Portfolio shipping history\n' +
                    'FIVERR   URL     1,024 05-12-25  Freelance profile link\n' +
                    'RECYCLED      <DIR>    01-02-25  Deleted regrets\n\n       12 item(s)');
                  break;
                case 'open': case 'run': {
                  const t = arg.toLowerCase().replace(/\.exe$|\.dll$|\.sys$|\.html$|\.pdf$|\.txt$|\.url$|\.log$/, '');
                  const p = PROJECTS.find(p => p.id === t || p.file === arg);
                  if (OPEN[t]) { print('Launching ' + arg + ' \u2026', 'ok'); OPEN[t](); }
                  else if (p) { print('Launching ' + p.file + ' \u2026', 'ok'); openProject(p); }
                  else print(`Cannot find '${arg}'. Type "projects" for available files.`, 'err');
                  break;
                }
                case 'resume': print('Opening resume.pdf \u2026', 'ok'); openResume(); break;
                case 'contact':
                  printHTML('E-mail   : <a href="#" class="t-mail">compose via Portfolio Mail</a> (type: open contact)\n' +
                    'Direct   : <a href="mailto:' + LINKS.email + '">' + LINKS.email + '</a>\n' +
                    'Phone    : ' + LINKS.phone + '\n' +
                    'GitHub   : <a href="' + LINKS.github + '" target="_blank" rel="noopener">github.com/' + LINKS.githubUser + '</a>\n' +
                    'LinkedIn : <a href="' + LINKS.linkedin + '" target="_blank" rel="noopener">linkedin.com/in/' + LINKS.linkedinUser + '</a>\n' +
                    'Fiverr   : <a href="' + FIVERR.url + '" target="_blank" rel="noopener">fiverr.com/' + FIVERR.user + '</a>');
                  print('\nTimezone: ' + PROFILE.timezone + ' — replies within ~24h.', 'dim');
                  body.querySelector('.t-mail').addEventListener('click', e => { e.preventDefault(); openContact(); });
                  break;
                case 'neofetch': {
                  const art = [
                    ' ______________ ',
                    '|  __________  |',
                    '| |          | |',
                    '| |  &gt;_      | |',
                    '| |__________| |',
                    '|______________|'];
                  const info = ['alex@portfolio', '---------------------', 'OS: PortfolioOS 98 (4.10.1998)', 'Kernel: React 19 on hope',
                    'Uptime: ' + uptime(), 'Shell: fauxcmd.exe', 'Resolution: ' + innerWidth + 'x' + innerHeight,
                    'CPU: fullstack dev (7 yrs)', 'Memory: 65,536 KB', 'Packages: 5 (projects)', 'Planets: 1 (interactive)', 'Moons: 4 (Galilean)', 'Emojis: 0 (by design)'];
                  art.forEach((a, i) => print(a + '   ' + (info[i] || ''), i < 2 ? 'hdr' : ''));
                  info.slice(art.length).forEach(l => print('                   ' + l));
                  break;
                }
                case 'whoami': print(adminWhoami() || ('PORTFOLIO\\aam — fullstack developer, ' + PROFILE.experience.toLowerCase() + ', ' + PROFILE.location + '.')); break;
                case 'ver': print('PortfolioOS 98 [Version 4.10.1998]\nBuilt from scratch out of spite for one-page scrollers.'); break;
                case 'date': print(fmtDate()); break;
                case 'clear': case 'cls': out.innerHTML = ''; break;
                case 'exit': api.close(); break;
                case 'echo': print(arg); break;
                case 'sudo':
                  if (adminExec(c, arg, parts, term)) break;
                  print('sudo: permission denied. This is a family operating system.', 'err');
                  break;
                case 'coffee':
                  print('      ( (\n       ) )\n    ........\n    |      |]\n    \\      /\n     `----\'');
                  print('\nBrewing\u2026 done. Caffeine levels nominal.', 'ok');
                  break;
                case 'hello': case 'hi': print('Hello, visitor. Type "help" if you\u2019re lost. You look lost.'); break;
                case 'vim': print('vim: opening\u2026 never mind, you\u2019d never leave.'); break;
                case 'nano': print('nano: not installed. It\u2019s 1998 in here.'); break;
                case 'bsod': case 'crash': print('Very well.', 'err'); api.timers.push(setTimeout(bsod, 300)); break;
                case 'format':
                  if (arg.replace(/\s/g, '') === 'c:' || arg.toLowerCase() === 'c') {
                    print('WARNING: ALL DATA ON NON-REMOVABLE DISK\nDRIVE C: WILL BE LOST!\nProceed with format (Y/N)?', 'err');
                    ask(PS, false, v => {
                      if (v === 'y' || v === 'yes') {
                        print('Formatting 1,204M\n');
                        print('Formatting\u2026  23%', 'dim');
                        api.timers.push(setTimeout(() => print('Formatting\u2026  71%', 'dim'), 700));
                        api.timers.push(setTimeout(() => bsod(), 1500));
                      } else print('Wise choice. Career preserved.', 'ok');
                    });
                  } else print('Syntax: format c:', 'err');
                  break;
                default:
                  /* Everything administrative lives in 22-admin-auth.js and
                     23-admin-crud.js. One hook here keeps this file, already the
                     largest in the runtime, out of the way of that growth. */
                  if (adminExec(c, arg, parts, term)) break;
                  print(`'${parts[0]}' is not recognized as an internal or external command,\noperable program or batch file.`, 'err');
              }
            }
            setTimeout(() => inp.focus(), 80);
          }
        });
      }
