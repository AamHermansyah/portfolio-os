/* =================================================================
         Accessibility preferences
         Stored under one key and applied as classes on <html>. The same key is read
         by an inline script in app/layout.tsx before first paint, so a reload lands
         directly on the chosen settings instead of flashing the defaults first.
      ================================================================= */
      const A11Y_KEY = 'portfolioos.a11y';
      const A11Y_DEFAULTS = { reduceMotion: false, skipBoot: false, muteSound: false, highContrast: false, fontScale: 100 };
      const A11Y_SCALES = [
        { value: 100, label: 'Normal (100%)' },
        { value: 115, label: 'Large (115%)' },
        { value: 130, label: 'Larger (130%)' },
        { value: 150, label: 'Largest (150%)' }
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

      const A11Y_TOGGLES = [
        {
          group: 'Display', key: 'highContrast', label: 'Use high contrast',
          hint: 'Black background, white text, and the scanline filter and wallpaper effects turned off.'
        },
        {
          group: 'Display', key: 'reduceMotion', label: 'Reduce motion',
          hint: 'Stops the drifting stars, scanline roll, marquee and other animation.'
        },
        {
          group: 'Sound', key: 'muteSound', label: 'Mute sound effects',
          hint: 'Silences the PC speaker beeps used for clicks, errors and notifications.'
        },
        {
          group: 'Startup', key: 'skipBoot', label: 'Skip the boot animation',
          hint: 'Goes straight to the desktop on every visit, welcome dialog included.'
        }
      ];

      function openAccessibility() {
        const opening = Object.assign({}, PREFS);
        WM.create({
          id: 'a11y', title: 'Accessibility Properties', icon: svg('gear', 14), w: 470, h: 470,
          menubar: [
            { label: 'File', items: [{ label: 'Close', act: a => a.close() }] },
            { label: 'Help', items: [{ label: 'About PortfolioOS', act: aboutOS }] }
          ],
          status: ['Changes apply immediately', ''],
          build(body) {
            body.className = 'win-body app-a11y';
            const groups = [...new Set(A11Y_TOGGLES.map(t => t.group))];
            body.innerHTML = `<div class="a11y-page">
                ${groups.map(group => `<div class="a11y-group"><b>${esc(group)}:</b>
                  <div class="a11y-opts">
                    ${A11Y_TOGGLES.filter(t => t.group === group).map(t => `<label class="a11y-opt">
                      <input class="chk" type="checkbox" data-k="${t.key}">
                      <span><b>${esc(t.label)}</b><i>${esc(t.hint)}</i></span>
                    </label>`).join('')}
                    ${group === 'Display' ? `<div class="a11y-scale">
                      <label for="a11y-scale">Text and window content:</label>
                      <select id="a11y-scale" data-k="fontScale">
                        ${A11Y_SCALES.map(s => `<option value="${s.value}">${esc(s.label)}</option>`).join('')}
                      </select>
                    </div>` : ''}
                  </div></div>`).join('')}
                <div class="a11y-note">Settings are kept in this browser and survive a refresh.
                  ${systemReducedMotion() ? '<br><b>Your system already asks for reduced motion</b>, so that is on regardless.' : ''}</div>
              </div>
              <div class="a11y-sep"></div>
              <div class="a11y-actions">
                <button class="btn" type="button" data-a="reset">Reset to defaults</button>
                <span class="grow"></span>
                <button class="btn" type="button" data-a="cancel">Cancel</button>
                <button class="btn" type="button" data-a="ok">OK</button>
              </div>`;

            const paint = () => {
              body.querySelectorAll('.chk').forEach(box => { box.checked = Boolean(PREFS[box.dataset.k]); });
              body.querySelector('[data-k="fontScale"]').value = String(PREFS.fontScale);
            };
            const touched = key => {
              savePrefs();
              api.status[1].textContent = key + ' updated';
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
              api.status[1].textContent = 'defaults restored';
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
        if(!iso)return 'unknown';
        const days=Math.round((Date.now()-new Date(iso).getTime())/86400000);
        if(days<=0)return 'today';
        if(days===1)return 'yesterday';
        if(days<30)return days+' days ago';
        if(days<365){const m=Math.round(days/30);return m+(m===1?' month ago':' months ago');}
        const y=Math.round(days/365);
        return y+(y===1?' year ago':' years ago');
      }

      function repoRow(repo,featured){
        const meta=[repo.language,repo.stars?repo.stars+(repo.stars===1?' star':' stars'):'',
                    'pushed '+agoLabel(repo.pushedAt)].filter(Boolean).join(' · ');
        const desc=repo.description?`<div class="net-desc">${esc(repo.description)}</div>`:'';
        const live=repo.homepage?`<a class="btn" href="${esc(repo.homepage)}" target="_blank" rel="noopener">Live</a>`:'';
        return `<div class="net-row">
          <span class="net-ic">${svg(featured?'briefcase':'globe',featured?20:16)}</span>
          <div class="net-main">
            <div class="net-name">${esc(repo.name)}</div>${desc}
            <div class="net-meta">${esc(meta)}</div>
          </div>
          <div class="net-links">${live}
            <a class="btn" href="${esc(repo.url)}" target="_blank" rel="noopener">Source</a>
          </div>
        </div>`;
      }

      function openNetwork(){
        WM.create({id:'network',title:'Network Neighborhood',icon:svg('network',14),w:610,h:530,
        menubar:[
          {label:'File',items:[
            {label:'Open GitHub profile',act:()=>window.open(LINKS.github,'_blank','noopener')},
            {sep:true},
            {label:'Close',act:a=>a.close()}
          ]},
          {label:'Help',items:[{label:'About PortfolioOS',act:aboutOS}]}
        ],
        status:['Connecting…','github.com/'+LINKS.githubUser],
        build(body,api){
          body.className='win-body app-net';
          body.innerHTML='<div class="net-scroll"><div class="net-empty">Connecting to network…</div></div>';
          const scroll=body.querySelector('.net-scroll');

          loadGithub().then(data=>{
            if(!data.profile){offline('The snapshot is empty — run <b>npm run sync:github</b> to fill it.');return;}
            render(data);
          }).catch(()=>offline('This copy has no network snapshot yet.'));

          function offline(message){
            scroll.innerHTML=`<div class="net-empty">${svg('warn',32)}<br><br>
              <b>The network is unavailable.</b><br>${message}<br><br>
              <a class="btn" href="${LINKS.github}" target="_blank" rel="noopener">Open GitHub instead</a></div>`;
            api.status[0].textContent='Offline';
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
                  <p>${p.publicRepos} public repositories &middot; ${p.followers} followers${joined?' &middot; on GitHub since '+joined:''}</p>
                </div>
              </div>

              <div class="net-sec"><h3>Featured &mdash; full case study inside</h3>
                <div class="net-list">${featured.length?featured.map(r=>repoRow(r,true)).join('')
                  :'<div class="net-empty">No featured repositories matched.</div>'}</div></div>

              <div class="net-sec"><h3>Recently pushed</h3>
                <div class="net-list">${rest.map(r=>repoRow(r,false)).join('')}</div></div>

              <div class="net-sec"><h3>Technologies across ${data.repos.length} repositories</h3>
                <div class="net-chips">${data.languages.map(l=>
                  `<span class="net-chip">${esc(l.name)} <i>${l.count}</i></span>`).join('')}</div>
                <div class="net-note">Counted by each repository's primary language, straight from the GitHub API.</div>
              </div>`;

            api.status[0].textContent=data.repos.length+' object(s)';
            api.status[1].textContent=data.syncedAt
              ?'Synced '+agoLabel(data.syncedAt)
              :'github.com/'+LINKS.githubUser;
          }
        }});
      }
