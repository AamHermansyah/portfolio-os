/* =================================================================
         Accessibility preferences
         Stored under one key and applied as classes on <html>. The same key is read
         by an inline script in app/layout.tsx before first paint, so a reload lands
         directly on the chosen settings instead of flashing the defaults first.
      ================================================================= */
      const A11Y_KEY = 'portfolioos.a11y';
      const A11Y_DEFAULTS = { reduceMotion: false, skipBoot: false, muteSound: false, highContrast: false, fontScale: 100 };
      const A11Y_SCALES = [
        { value: 100, label: tr('Normal (100%)') },
        { value: 115, label: tr('Large (115%)') },
        { value: 130, label: tr('Larger (130%)') },
        { value: 150, label: tr('Largest (150%)') }
      ];

      function readPrefs() {
        let stored = {};
        try { stored = JSON.parse(localStorage.getItem(A11Y_KEY) || '{}'); } catch { }
        const prefs = Object.assign({}, A11Y_DEFAULTS);
        for (const key of Object.keys(A11Y_DEFAULTS)) {
          if (key === 'fontScale') {
            if (A11Y_SCALES.some(s => s.value === stored.fontScale)) prefs.fontScale = stored.fontScale;
          } else if (typeof stored[key] === 'boolean') prefs[key] = stored[key];
        }
        return prefs;
      }

      let PREFS = readPrefs();

      /* The system honours prefers-reduced-motion on its own; the toggle can only
         add reduction, never take away what the operating system asked for. */
      const systemReducedMotion = () => {
        try { return matchMedia('(prefers-reduced-motion: reduce)').matches; } catch { return false; }
      };

      function applyPrefs() {
        const root = document.documentElement;
        root.classList.toggle('a11y-motion', PREFS.reduceMotion || systemReducedMotion());
        root.classList.toggle('a11y-contrast', PREFS.highContrast);
        root.classList.toggle('a11y-noboot', PREFS.skipBoot);
        root.style.setProperty('--a11y-scale', String(PREFS.fontScale / 100));
      }

      function savePrefs() {
        try { localStorage.setItem(A11Y_KEY, JSON.stringify(PREFS)); } catch { }
        applyPrefs();
      }

      /* The group name is also compared in the page below, so it stays English
         as the key and only its label is translated. */
      const A11Y_GROUP_LABELS = { Display: tr('Display'), Sound: tr('Sound'), Startup: tr('Startup') };
      const A11Y_TOGGLES = [
        {
          group: 'Display', key: 'highContrast', label: tr('Use high contrast'),
          hint: tr('Black background, white text, and the scanline filter and wallpaper effects turned off.')
        },
        {
          group: 'Display', key: 'reduceMotion', label: tr('Reduce motion'),
          hint: tr('Stops the drifting stars, scanline roll, marquee and other animation.')
        },
        {
          group: 'Sound', key: 'muteSound', label: tr('Mute sound effects'),
          hint: tr('Silences the PC speaker beeps used for clicks, errors and notifications.')
        },
        {
          group: 'Startup', key: 'skipBoot', label: tr('Skip the boot animation'),
          hint: tr('Goes straight to the desktop on every visit, welcome dialog included.')
        }
      ];

      function openAccessibility() {
        const opening = Object.assign({}, PREFS);
        WM.create({
          id: 'a11y', title: tr('Accessibility Properties'), icon: svg('gear', 14), w: 470, h: 470,
          menubar: [
            { label: tr('File'), items: [{ label: tr('Close'), act: a => a.close() }] },
            { label: tr('Help'), items: [{ label: tr('About PortfolioOS'), act: aboutOS }] }
          ],
          status: [tr('Changes apply immediately'), ''],
          build(body) {
            body.className = 'win-body app-a11y';
            const groups = [...new Set(A11Y_TOGGLES.map(t => t.group))];
            body.innerHTML = `<div class="a11y-page">
                ${groups.map(group => `<div class="a11y-group"><b>${esc(A11Y_GROUP_LABELS[group])}:</b>
                  <div class="a11y-opts">
                    ${A11Y_TOGGLES.filter(t => t.group === group).map(t => `<label class="a11y-opt">
                      <input class="chk" type="checkbox" data-k="${t.key}">
                      <span><b>${esc(t.label)}</b><i>${esc(t.hint)}</i></span>
                    </label>`).join('')}
                    ${group === 'Display' ? `<div class="a11y-scale">
                      <label for="a11y-scale">${tr('Text and window content:')}</label>
                      <select id="a11y-scale" data-k="fontScale">
                        ${A11Y_SCALES.map(s => `<option value="${s.value}">${esc(s.label)}</option>`).join('')}
                      </select>
                    </div>` : ''}
                  </div></div>`).join('')}
                <div class="a11y-note">${tr('Settings are kept in this browser and survive a refresh.')}
                  ${systemReducedMotion() ? tr('<br><b>Your system already asks for reduced motion</b>, so that is on regardless.') : ''}</div>
              </div>
              <div class="a11y-sep"></div>
              <div class="a11y-actions">
                <button class="btn" type="button" data-a="reset">${tr('Reset to defaults')}</button>
                <span class="grow"></span>
                <button class="btn" type="button" data-a="cancel">${tr('Cancel')}</button>
                <button class="btn" type="button" data-a="ok">${tr('OK')}</button>
              </div>`;

            const paint = () => {
              body.querySelectorAll('.chk').forEach(box => { box.checked = Boolean(PREFS[box.dataset.k]); });
              body.querySelector('[data-k="fontScale"]').value = String(PREFS.fontScale);
            };
            const touched = key => {
              savePrefs();
              api.status[1].textContent = tr('{key} updated', { key });
            };

            body.querySelectorAll('.chk').forEach(box => box.addEventListener('change', () => {
              PREFS[box.dataset.k] = box.checked;
              touched(box.dataset.k);
              if (box.dataset.k === 'muteSound' && !box.checked) beep(760, 70);
            }));
            body.querySelector('[data-k="fontScale"]').addEventListener('change', e => {
              PREFS.fontScale = Number(e.target.value);
              touched('fontScale');
            });
            body.querySelector('[data-a="reset"]').addEventListener('click', () => {
              PREFS = Object.assign({}, A11Y_DEFAULTS);
              savePrefs(); paint();
              api.status[1].textContent = tr('defaults restored');
            });
            body.querySelector('[data-a="cancel"]').addEventListener('click', () => {
              PREFS = Object.assign({}, opening);
              savePrefs();
              api.close();
            });
            body.querySelector('[data-a="ok"]').addEventListener('click', () => api.close());

            paint();
            setTimeout(() => body.querySelector('.chk').focus(), 60);
          }
        });
      }

      /* ---- Network Neighborhood — the GitHub account, browsed as a network ----
         Reads public/github.json, which scripts/sync-github.mjs refreshes before every
         dev run and build. Static on purpose: the window opens instantly and nothing
         depends on GitHub being reachable while someone is looking at the portfolio. */
      const GITHUB_SNAPSHOT='/github.json';
      let githubCache=null;

      async function loadGithub(){
        if(githubCache)return githubCache;
        const res=await fetch(GITHUB_SNAPSHOT,{headers:{Accept:'application/json'}});
        if(!res.ok)throw new Error('snapshot responded '+res.status);
        githubCache=await res.json();
        return githubCache;
      }

      function agoLabel(iso){
        if(!iso)return tr('unknown');
        const days=Math.round((Date.now()-new Date(iso).getTime())/86400000);
        if(days<=0)return tr('today');
        if(days===1)return tr('yesterday');
        if(days<30)return tr('{n} days ago',{n:days});
        if(days<365){const m=Math.round(days/30);return m===1?tr('1 month ago'):tr('{n} months ago',{n:m});}
        const y=Math.round(days/365);
        return y===1?tr('1 year ago'):tr('{n} years ago',{n:y});
      }

      function repoRow(repo,featured){
        const meta=[repo.language,repo.stars?(repo.stars===1?tr('1 star'):tr('{n} stars',{n:repo.stars})):'',
                    tr('pushed {when}',{when:agoLabel(repo.pushedAt)})].filter(Boolean).join(' · ');
        const desc=repo.description?`<div class="net-desc">${esc(repo.description)}</div>`:'';
        const live=repo.homepage?`<a class="btn" href="${esc(repo.homepage)}" target="_blank" rel="noopener">${tr('Live')}</a>`:'';
        return `<div class="net-row">
          <span class="net-ic">${svg(featured?'briefcase':'globe',featured?20:16)}</span>
          <div class="net-main">
            <div class="net-name">${esc(repo.name)}</div>${desc}
            <div class="net-meta">${esc(meta)}</div>
          </div>
          <div class="net-links">${live}
            <a class="btn" href="${esc(repo.url)}" target="_blank" rel="noopener">${tr('Source')}</a>
          </div>
        </div>`;
      }

      function openNetwork(){
        WM.create({id:'network',title:tr('Network Neighborhood'),icon:svg('network',14),w:610,h:530,
        menubar:[
          {label:tr('File'),items:[
            {label:tr('Open GitHub profile'),act:()=>window.open(LINKS.github,'_blank','noopener')},
            {sep:true},
            {label:tr('Close'),act:a=>a.close()}
          ]},
          {label:tr('Help'),items:[{label:tr('About PortfolioOS'),act:aboutOS}]}
        ],
        status:[tr('Connecting…'),'github.com/'+LINKS.githubUser],
        build(body,api){
          body.className='win-body app-net';
          body.innerHTML=`<div class="net-scroll"><div class="net-empty">${tr('Connecting to network…')}</div></div>`;
          const scroll=body.querySelector('.net-scroll');

          loadGithub().then(data=>{
            if(!data.profile){offline(tr('The snapshot is empty — run <b>npm run sync:github</b> to fill it.'));return;}
            render(data);
          }).catch(()=>offline(tr('This copy has no network snapshot yet.')));

          function offline(message){
            scroll.innerHTML=`<div class="net-empty">${svg('warn',32)}<br><br>
              <b>${tr('The network is unavailable.')}</b><br>${message}<br><br>
              <a class="btn" href="${LINKS.github}" target="_blank" rel="noopener">${tr('Open GitHub instead')}</a></div>`;
            api.status[0].textContent=tr('Offline');
          }

          function render(data){
            const p=data.profile;
            /* repos that already have a case study in here are the curated ones */
            const featuredUrls=new Set(PROJECTS.map(x=>x.repo));
            const featured=data.repos.filter(r=>featuredUrls.has(r.url));
            const rest=data.repos.filter(r=>!featuredUrls.has(r.url)).slice(0,8);
            const joined=p.createdAt?new Date(p.createdAt).getFullYear():'';

            scroll.innerHTML=`
              <div class="net-hero">${svg('network',32)}
                <div>
                  <b>${esc(p.name||p.login)}</b> &mdash; <a href="${esc(p.url)}" target="_blank" rel="noopener">@${esc(p.login)}</a>
                  <p>${esc(p.bio||'')}${p.location?' &middot; '+esc(p.location):''}</p>
                  <p>${tr('{repos} public repositories &middot; {followers} followers',{repos:p.publicRepos,followers:p.followers})}${joined?' &middot; '+tr('on GitHub since {year}',{year:joined}):''}</p>
                </div>
              </div>

              <div class="net-sec"><h3>${tr('Featured &mdash; full case study inside')}</h3>
                <div class="net-list">${featured.length?featured.map(r=>repoRow(r,true)).join('')
                  :`<div class="net-empty">${tr('No featured repositories matched.')}</div>`}</div></div>

              <div class="net-sec"><h3>${tr('Recently pushed')}</h3>
                <div class="net-list">${rest.map(r=>repoRow(r,false)).join('')}</div></div>

              <div class="net-sec"><h3>${tr('Technologies across {n} repositories',{n:data.repos.length})}</h3>
                <div class="net-chips">${data.languages.map(l=>
                  `<span class="net-chip">${esc(l.name)} <i>${l.count}</i></span>`).join('')}</div>
                <div class="net-note">${tr("Counted by each repository's primary language, straight from the GitHub API.")}</div>
              </div>`;

            api.status[0].textContent=tr('{n} object(s)',{n:data.repos.length});
            api.status[1].textContent=data.syncedAt
              ?tr('Synced {when}',{when:agoLabel(data.syncedAt)})
              :'github.com/'+LINKS.githubUser;
          }
        }});
      }
