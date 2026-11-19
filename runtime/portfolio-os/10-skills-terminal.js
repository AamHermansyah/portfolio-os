/* ---- Skills.exe (installer) ---- */
      function openSkills() {
        WM.create({
          id: 'skills', title: tr('SkillPack 98 Setup'), icon: svg('gear', 14), w: 420, h: 370, dialog: true, refreshable: true,
          onClose(api) { (api.timers || []).forEach(clearInterval); },
          build(body, api) {
            api.timers = [];
            body.className = 'win-body app-skill';
            /* Every count and filename below comes from the Skill table, so the
               summary stays true as entries are added or removed. */
            const firstName = esc(PROFILE.name.split(' ')[0]);
            const owner = firstName + '&rsquo;s';
            const failed = SKILLS.filter(s => s.fail);
            const summary = tr('{done} of {total} components installed', { done: SKILLS.length - failed.length, total: SKILLS.length });
            const sizeKb = Math.round(SKILLS.reduce((a, s) => a + s.level, 0) * 1.312);
            body.innerHTML = `
    <div class="sk-banner">${svg('gear', 28)}<div><b>${tr('SkillPack&trade; 98 &mdash; Setup')}</b><div class="sk-bver">${tr('Installing {owner} core competencies', { owner, name: firstName })}</div></div></div>
    <div class="sk-main">
      <div data-p="1">
        <p class="sk-lead">${tr('This wizard will install {owner} core competencies onto this portfolio.', { owner, name: firstName })}</p>
        ${SKILLS.length
          ? `<p class="sk-dim">${tr('{components}, {size} KB total. Installation is entirely metaphorical &mdash; no actual skills can be transferred over HTTP, unfortunately.', { components: SKILLS.length === 1 ? tr('{n} component', { n: 1 }) : tr('{n} components', { n: SKILLS.length }), size: sizeKb.toLocaleString('en-US') })}</p>`
          : `<p class="sk-dim">${tr('No components are available to install yet. Check back after the next release.')}</p>`}
        <ul class="sk-files">${SKILLS.map(s => `<li>${esc(s.file)}</li>`).join('')}</ul>
      </div>
      <div data-p="2" hidden>
        <div class="sk-installing">${tr('Installing components&hellip;')}</div>
        ${SKILLS.map(s => `<div class="sk-row"><span class="sk-nm">${esc(s.name)}</span><span class="sk-fl">${esc(s.file)}</span><div class="pbar"><div class="pfill"></div></div><span class="sk-pc">0%</span></div>`).join('')}
        <div class="sk-row sk-all"><span class="sk-nm"><b>${tr('Overall')}</b></span><span class="sk-fl"></span><div class="pbar"><div class="pfill"></div></div><span class="sk-pc">0%</span></div>
        <div class="sk-status">&nbsp;</div>
      </div>
      <div data-p="3" hidden>
        <p class="sk-lead"><b>${tr('Setup completed.')}</b></p>
        <p class="sk-dim">${tr('{summary} successfully.', { summary })}${failed.length ? `<br>
        ${tr('{file} reported error 0x00DEAD &mdash; "insufficient weekends". Setup recommends scheduling more of them.', { file: esc(failed[0].file) })}` : ''}</p>
        <p class="sk-dim" style="margin-top:10px">${tr('Proficiency values are self-reported.<br>Trust, but verify in an interview.')}</p>
      </div>
    </div>
    <div class="sk-btns">
      <button class="btn" data-b="refresh">${tr('Refresh')}</button>
      <button class="btn" data-b="go">${tr('Install&hellip;')}</button>
      <button class="btn" data-b="cancel">${tr('Cancel')}</button>
    </div>`;
            body.querySelector('[data-b="refresh"]').addEventListener('click', () => refreshFromWindow());
            const phases = [...body.querySelectorAll('[data-p]')];
            const rows = [...body.querySelectorAll('[data-p="2"] .sk-row:not(.sk-all)')];
            const allRow = body.querySelector('.sk-all');
            const status = body.querySelector('.sk-status');
            const bGo = body.querySelector('[data-b="go"]'), bCancel = body.querySelector('[data-b="cancel"]');
            if (!SKILLS.length) { bGo.style.display = 'none'; bCancel.textContent = tr('Close'); }
            function setPhase(n) {
              phases.forEach(p => p.hidden = p.dataset.p !== String(n));
              if (n === 1) { bGo.textContent = tr('Install\u2026'); bGo.style.display = ''; bCancel.textContent = tr('Cancel'); }
              if (n === 2) { bGo.style.display = 'none'; bCancel.textContent = tr('Cancel'); }
              if (n === 3) { bGo.style.display = ''; bGo.textContent = tr('Reinstall'); bCancel.textContent = tr('Close'); }
            }
            function setRow(r, v) {
              r.querySelector('.pfill').style.width = Math.max(0, v - 1) + '%';
              r.querySelector('.sk-pc').textContent = v + '%';
            }
            bCancel.addEventListener('click', () => api.close());
            bGo.addEventListener('click', () => {
              if (bGo.textContent.indexOf(tr('Reinstall')) === 0) { rows.concat([allRow]).forEach(r => { setRow(r, 0); r.querySelector('.pfill').classList.remove('err'); }); }
              setPhase(2); install();
            });
            function install() {
              let i = 0;
              const total = SKILLS.reduce((a, s) => a + s.level, 0) || 1;
              let doneSum = 0;
              function next() {
                if (i >= SKILLS.length) {
                  status.textContent = tr('Installation complete \u2014 {summary}. Review the results or close this window when you are ready.', { summary });
                  bGo.style.display = '';
                  bGo.textContent = tr('Reinstall');
                  bCancel.textContent = tr('Close');
                  return;
                }
                const s = SKILLS[i], r = rows[i];
                status.textContent = tr('Copying {file} \u2026', { file: s.file });
                let v = 0; const step = Math.max(3, Math.round(s.level / 14));
                const t = setInterval(() => {
                  v = Math.min(s.level, v + step);
                  setRow(r, v);
                  setRow(allRow, Math.round((doneSum + v) / total * 100));
                  api.setTitle(tr('SkillPack 98 Setup') + ' — ' + Math.round((doneSum + v) / total * 100) + '%');
                  if (v >= s.level) {
                    clearInterval(t); api.timers = api.timers.filter(x => x !== t);
                    doneSum += s.level;
                    if (s.fail) {
                      r.querySelector('.pfill').classList.add('err');
                      status.textContent = tr('{file}: error 0x00C0FFEE — insufficient weekends. Setup continues\u2026', { file: s.file });
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
            body.innerHTML = `<div class="t-out"></div><div class="t-line"><span class="t-ps">C:\\PORTFOLIO&gt;</span><input class="t-in" autocomplete="off" autocapitalize="off" spellcheck="false" aria-label="${tr('terminal input')}"></div>`;
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
            print(tr('Type "help" to see available commands.') + '\n', 'dim');
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
              'certificates': openCertificates, 'certs': openCertificates,
              'experience': openExperience, 'work': openExperience,
              'education': openEducation, 'school': openEducation,
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
                    tr('PortfolioOS command reference') + '\n\n' +
                    '  help             ' + tr('this list') + '\n' +
                    '  about            ' + tr('who is behind this OS') + '\n' +
                    '  projects         ' + tr('list installed project files') + '\n' +
                    '  skills           ' + tr('print skill levels (ASCII mode)') + '\n' +
                    '  testimonials [n] ' + tr('what people say, page n') + '\n' +
                    '  publications    ' + tr('open the research library') + '\n' +
                    '  career          ' + tr('open the separate career timeline') + '\n' +
                    '  changelog       ' + tr('open PortfolioOS shipping history') + '\n' +
                    '  fiverr           ' + tr('freelance profile') + '\n' +
                    '  jupiter          ' + tr('the planet living in the wallpaper') + '\n' +
                    '  wallpaper [name] ' + tr('list or change desktop wallpaper') + '\n' +
                    '  open <file>      ' + tr('launch a window app, e.g. open projects') + '\n' +
                    '  ls / dir         ' + tr('list contents of C:\\PORTFOLIO') + '\n' +
                    '  refresh          ' + tr('reload the latest content from the server') + '\n' +
                    '  resume           ' + tr('open resume.pdf') + '\n' +
                    '  contact          ' + tr('how to reach me') + '\n' +
                    '  neofetch         ' + tr('system information, obviously') + '\n' +
                    '  whoami           ' + tr('identity check') + '\n' +
                    '  date             ' + tr('current system date/time') + '\n' +
                    '  clear / cls      ' + tr('wipe the screen') + '\n' +
                    '  format c:        ' + tr('(do not)') + '\n' +
                    '  exit             ' + tr('close this terminal') + '\n' +
                    '\n' +
                    adminHelpText() +
                    tr('Type commands at your own risk.'), 'ok');
                  break;
                case 'about':
                  print(tr('{name} — fullstack developer ({location})', { name: PROFILE.name, location: PROFILE.location }) + '\n' +
                    tr('TypeScript on both ends: Next.js and React in front,\nNode and Prisma behind, deployed where people can open it.\nBuilt: a logistics platform, a tour-guide marketplace,\nexam and health applications. All source is on GitHub.\nDislikes: infinite scroll. (Hence all this.)'));
                  break;
                case 'projects':
                  if (!PROJECTS.length) { print(tr('No project files on drive C: yet.'), 'dim'); break; }
                  print(tr('Project files on drive C:') + '\n\n' + PROJECTS.map(p => '  ' + p.file.padEnd(17) + ' ' + p.tagline).join('\n') +
                    '\n\n' + tr('Type: open <filename>  to run any of them.'), 'ok');
                  break;
                case 'testimonials': case 'praise': {
                  /* Paged from the same endpoint the inbox uses, five at a time. */
                  const page = Math.max(1, parseInt(arg, 10) || 1);
                  busy = true;
                  fetchTestimonials(page, 5).then(result => {
                    busy = false;
                    if (!term.alive) return;
                    if (!result.ok) { print(tr('Testimonial Express could not be reached. Try again shortly.'), 'err'); return; }
                    if (!result.total) { print(tr('No testimonials on file yet.'), 'dim'); return; }
                    if (!result.items.length) { print(tr('There is no page {page}. The last one is {pages}.', { page, pages: result.pages }), 'err'); return; }
                    print(tr('What people say — page {page} of {pages} ({total} total):', { page: result.page, pages: result.pages, total: result.total }) + '\n');
                    result.items.forEach(t => print('  ' + t.from.padEnd(19) + ('*'.repeat(t.stars)) + '  ' + t.role));
                    print(result.page < result.pages
                      ? '\n' + tr('Type "testimonials {next}" for the next page, or "open testimonials" for the inbox.', { next: result.page + 1 })
                      : '\n' + tr('Type "open testimonials" to launch the inbox.'), 'dim');
                  });
                  break;
                }
                case 'access':
        case 'accessibility':
          print(tr('Opening {name} \u2026', { name: 'Accessibility Properties' }), 'ok');
          openAccessibility();
          break;
        case 'find':
        case 'search':
          print(tr('Opening {name} \u2026', { name: 'Find' }), 'ok');
          openFind();
          break;
        case 'changelog':
          print(tr('Opening {name} \u2026', { name: 'Changelog.log' }), 'ok');
          openChangelog();
          break;
        case 'career':
          print(tr('Opening {name} \u2026', { name: 'Career.log' }), 'ok');
          openCareerLog();
          break;
        case 'certificates':
          print(tr('Opening {name} \u2026', { name: 'Certificates' }), 'ok');
          openCertificates();
          break;
        case 'publications':
        case 'papers':
          print(tr('Opening {name} \u2026', { name: 'Publications' }), 'ok');
          openPublications();
          break;
        case 'github':
        case 'network':
          print(tr('Opening {name} \u2026', { name: 'Network Neighborhood' }), 'ok');
          openNetwork();
          break;
        case 'fiverr':
                  print(tr('Fiverr — freelance profile') + '\n\n' +
                    '  ' + tr('Seller').padEnd(8) + ': ' + FIVERR.user + '\n' +
                    '  ' + tr('Focus').padEnd(8) + ': ' + FIVERR.headline + '\n\n  ' + FIVERR.url);
                  print('\n' + tr('Type "open fiverr" to view it in Portfolio Navigator.'), 'dim');
                  break;
                case 'jupiter':
                  const jw = Math.max(8, tr('Red Spot').length);
                  print(tr('Jupiter — the wallpaper planet') + '\n\n' +
                    '  ' + tr('Class').padEnd(jw) + ': ' + tr('gas giant, 5th from the Sun') + '\n' +
                    '  ' + tr('Mass').padEnd(jw) + ': ' + tr('317.8 Earths') + '\n' +
                    '  ' + tr('Day').padEnd(jw) + ': ' + tr('9h 56m — fastest spinner in the system') + '\n' +
                    '  ' + tr('Rings').padEnd(jw) + ': ' + tr('yes, faint — halo + main + gossamer') + '\n' +
                    '  ' + tr('Moons').padEnd(jw) + ': ' + tr('95 known (4 Galilean)') + '\n' +
                    '  ' + tr('Red Spot').padEnd(jw) + ': ' + tr('~350 years old and still going') + '\n\n' +
                    tr('It is clickable. Everything here is clickable.'));
                  print('\n' + tr('Type "open jupiter" to launch the Orbit Observatory.'), 'dim');
                  break;
                case 'wallpaper':
                  if (!arg) {
                    print(tr('Current wallpaper: {name}', { name: currentWallpaper().name }) + '\n\n' + tr('Available wallpapers:') + '\n' +
                      WALLPAPERS.map(w => '  ' + w.id.padEnd(11) + w.name + ' — ' + w.desc).join('\n') +
                      '\n\n' + tr('Use: wallpaper <name>  or  open wallpaper'), 'ok');
                  } else {
                    const q = arg.toLowerCase();
                    const wall = WALLPAPERS.find(w => w.id === q || w.name.toLowerCase() === q);
                    if (wall) { setWallpaper(wall.id, true); print(tr('Wallpaper changed to {name}.', { name: wall.name }), 'ok'); }
                    else print(tr('Unknown wallpaper: {arg}\nType "wallpaper" to list available names.', { arg }), 'err');
                  }
                  break;
                case 'skills':
                  if (!SKILLS.length) { print(tr('No skills on file yet.'), 'dim'); break; }
                  SKILLS.forEach(s => print('  ' + s.name.padEnd(13) + bar(s.level) + ' ' + s.level + '%' + (s.fail ? '  ' + tr('(still installing\u2026)') : '')));
                  print('\n' + tr('Run Skills.exe for the graphical installer. Very 1998.'), 'dim');
                  break;
                case 'ls': case 'dir':
                  print(tr(' Volume in drive C is PORTFOLIO') + '\n' + tr(' Directory of C:\\PORTFOLIO') + '\n\n' +
                    'ABOUT_M~1 TXT     2,847 03-14-25  ' + tr('About the developer') + '\n' +
                    'PROJECTS      <DIR>    01-02-25  ' + tr('Project files') + '\n' +
                    'SKILLS   EXE    65,536 01-02-25  ' + tr('Skill installer') + '\n' +
                    'TERMINAL EXE    16,384 01-02-25  ' + tr('Command line') + '\n' +
                    'RESUME   PDF   128,000 03-14-25  ' + tr('Printable resume') + '\n' +
                    'CONTACT  EXE     9,216 01-02-25  ' + tr('Mail composer') + '\n' +
                    'TESTIMON EXE    10,240 05-09-25  ' + tr('Testimonial inbox') + '\n' +
                    'PUBLICAT LIB    12,288 09-11-26  ' + tr('Research library') + '\n' +
                    'CAREER   LOG     4,096 09-10-26  ' + tr('Career timeline') + '\n' +
                    'CHANGELO LOG     6,144 09-10-26  ' + tr('Portfolio shipping history') + '\n' +
                    'FIVERR   URL     1,024 05-12-25  ' + tr('Freelance profile link') + '\n' +
                    'RECYCLED      <DIR>    01-02-25  ' + tr('Deleted regrets') + '\n\n       ' + tr('12 item(s)'));
                  break;
                case 'open': case 'run': {
                  const t = arg.toLowerCase().replace(/\.exe$|\.dll$|\.sys$|\.html$|\.pdf$|\.txt$|\.url$|\.log$/, '');
                  const p = findProject(arg);
                  if (OPEN[t]) { print(tr('Launching {file} \u2026', { file: arg }), 'ok'); OPEN[t](); }
                  else if (p) { print(tr('Launching {file} \u2026', { file: p.file }), 'ok'); openProject(p); }
                  else print(tr(`Cannot find '{arg}'. Type "projects" for available files.`, { arg }), 'err');
                  break;
                }
                case 'resume':
                  print(tr('Opening {name} \u2026', { name: 'resume.pdf' }), 'ok');
                  openResume();
                  printHTML(tr('Download :') + ' <a href="' + RESUME_FILE + '" download="' + RESUME_DOWNLOAD_NAME + '">' + RESUME_DOWNLOAD_NAME + '</a>');
                  break;
                case 'refresh':
                  busy = true;
                  print(tr('Reloading content from the server \u2026'), 'dim');
                  refreshPortfolioContent().then(result => {
                    busy = false;
                    if (!term.alive) return;
                    if (result === 'ok') print(tr('Content is up to date; open windows were refreshed.'), 'ok');
                    else print(tr('The latest content could not be loaded. Try again shortly.'), 'err');
                  });
                  break;
                case 'contact':
                  printHTML('E-mail   : <a href="#" class="t-mail">' + tr('compose via Portfolio Mail') + '</a> ' + tr('(type: open contact)') + '\n' +
                    tr('Direct').padEnd(9) + ': <a href="mailto:' + LINKS.email + '">' + LINKS.email + '</a>\n' +
                    tr('Phone').padEnd(9) + ': ' + LINKS.phone + '\n' +
                    'WhatsApp : <a href="' + LINKS.whatsapp + '" target="_blank" rel="noopener">' + LINKS.whatsappLabel + '</a>\n' +
                    'GitHub   : <a href="' + LINKS.github + '" target="_blank" rel="noopener">github.com/' + LINKS.githubUser + '</a>\n' +
                    'LinkedIn : <a href="' + LINKS.linkedin + '" target="_blank" rel="noopener">linkedin.com/in/' + LINKS.linkedinUser + '</a>\n' +
                    'Fiverr   : <a href="' + FIVERR.url + '" target="_blank" rel="noopener">fiverr.com/' + FIVERR.user + '</a>');
                  print('\n' + tr('Timezone: {zone} — replies within ~24h.', { zone: PROFILE.timezone }), 'dim');
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
                  const info = ['aam@portfolio', '---------------------', 'OS: PortfolioOS 98 (4.10.1998)', tr('Kernel: React 19 on hope'),
                    tr('Uptime: {time}', { time: uptime() }), 'Shell: fauxcmd.exe', tr('Resolution: {size}', { size: innerWidth + 'x' + innerHeight }),
                    tr('CPU: fullstack dev ({exp})', { exp: PROFILE.experience.toLowerCase() }), tr('Memory: 65,536 KB'), tr('Packages: {n} (projects)', { n: PROJECTS.length }), tr('Planets: 1 (interactive)'), tr('Moons: 4 (Galilean)'), tr('Emojis: 0 (by design)')];
                  art.forEach((a, i) => print(a + '   ' + (info[i] || ''), i < 2 ? 'hdr' : ''));
                  info.slice(art.length).forEach(l => print('                   ' + l));
                  break;
                }
                case 'whoami': print(adminWhoami() || tr('PORTFOLIO\\aam — fullstack developer, {exp}, {location}.', { exp: PROFILE.experience.toLowerCase(), location: PROFILE.location })); break;
                case 'ver': print('PortfolioOS 98 [Version 4.10.1998]\n' + tr('Built from scratch out of spite for one-page scrollers.')); break;
                case 'date': print(fmtDate()); break;
                case 'clear': case 'cls': out.innerHTML = ''; break;
                case 'exit': api.close(); break;
                case 'echo': print(arg); break;
                case 'sudo':
                  if (adminExec(c, arg, parts, term)) break;
                  print(tr('sudo: permission denied. This is a family operating system.'), 'err');
                  break;
                case 'coffee':
                  print('      ( (\n       ) )\n    ........\n    |      |]\n    \\      /\n     `----\'');
                  print('\n' + tr('Brewing\u2026 done. Caffeine levels nominal.'), 'ok');
                  break;
                case 'hello': case 'hi': print(tr('Hello, visitor. Type "help" if you\u2019re lost. You look lost.')); break;
                case 'vim': print(tr('vim: opening\u2026 never mind, you\u2019d never leave.')); break;
                case 'nano': print(tr('nano: not installed. It\u2019s 1998 in here.')); break;
                case 'bsod': case 'crash': print(tr('Very well.'), 'err'); api.timers.push(setTimeout(bsod, 300)); break;
                case 'format':
                  if (arg.replace(/\s/g, '') === 'c:' || arg.toLowerCase() === 'c') {
                    print(tr('WARNING: ALL DATA ON NON-REMOVABLE DISK\nDRIVE C: WILL BE LOST!\nProceed with format (Y/N)?'), 'err');
                    ask(PS, false, v => {
                      if (v === 'y' || v === 'yes') {
                        print(tr('Formatting 1,204M') + '\n');
                        print(tr('Formatting\u2026  23%'), 'dim');
                        api.timers.push(setTimeout(() => print(tr('Formatting\u2026  71%'), 'dim'), 700));
                        api.timers.push(setTimeout(() => bsod(), 1500));
                      } else print(tr('Wise choice. Career preserved.'), 'ok');
                    });
                  } else print(tr('Syntax: format c:'), 'err');
                  break;
                default:
                  /* Everything administrative lives in 22-admin-auth.js and
                     23-admin-crud.js. One hook here keeps this file, already the
                     largest in the runtime, out of the way of that growth. */
                  if (adminExec(c, arg, parts, term)) break;
                  print(tr(`'{cmd}' is not recognized as an internal or external command,\noperable program or batch file.`, { cmd: parts[0] }), 'err');
              }
            }
            setTimeout(() => inp.focus(), 80);
          }
        });
      }
