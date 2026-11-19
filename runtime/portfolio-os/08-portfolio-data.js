/* =================================================================
         data
      ================================================================= */
      /* Who this is. There is one copy, on the server (lib/portfolio/profile.ts),
         and components/atoms/portfolio-runtime.tsx hands it over before this
         script loads, the same way it hands over the content. The text fields are
         then overridden with the ones for the chosen language.

         The fallback is only for the moment a cached page and a newer script
         disagree, so the windows do not throw until the next load. */
      const SHARED_PROFILE = window.portfolioOsProfile || {
        name: 'Aam Hermansyah', role: 'Fullstack Developer', experience: '', location: '', timezone: 'GMT+7',
        status: '', available: true, languages: '', photo: '', photoFocus: { x: 50, y: 50, zoom: 1 },
        summary: '', additional: '',
        links: {
          github: 'https://github.com/AamHermansyah', githubUser: 'AamHermansyah',
          linkedin: 'https://www.linkedin.com/in/aam-hermansyah/', linkedinUser: 'aam-hermansyah',
          fiverr: 'https://www.fiverr.com/aam_hermansyah', fiverrUser: 'aam_hermansyah',
          email: 'hermansyahaam283@gmail.com', phone: '',
          whatsapp: 'https://wa.me/6282316126449', whatsappLabel: 'wa.me/6282316126449',
          site: 'https://aamhermansyah.vercel.app', siteLabel: 'aamhermansyah.vercel.app'
        }
      };
      const PROFILE = Object.assign({}, SHARED_PROFILE, (SHARED_PROFILE.i18n && SHARED_PROFILE.i18n[LANG]) || {});
      const LINKS = SHARED_PROFILE.links;

      /* Projects, skills, credentials, publications and both logs are not
         written here. The server reads them from Postgres — the same rows the
         terminal CRUD edits — and components/atoms/portfolio-runtime.tsx hands
         them over before this script loads. The arrays are only ever changed in
         place, because every window closes over them. Testimonials are the
         exception: 16-testimonials.js fetches them one page at a time. */
      const PROJECTS = [], SKILLS = [], CREDENTIALS = [], PUBLICATIONS = [];
      const PORTFOLIO_LOG = [], CAREER_LOG = [];
      const CONTENT_LISTS = {
        projects: PROJECTS, skills: SKILLS, credentials: CREDENTIALS,
        publications: PUBLICATIONS, changelog: PORTFOLIO_LOG, career: CAREER_LOG
      };
      function fillPortfolioContent(content) {
        Object.keys(CONTENT_LISTS).forEach(key => {
          const list = CONTENT_LISTS[key];
          const next = content && Array.isArray(content[key]) ? content[key] : [];
          list.splice(0, list.length, ...next);
        });
      }
      fillPortfolioContent(window.portfolioOsContent);

      /* "mykaggo", "mykaggo.exe" and the slug all name the same project. */
      function findProject(query) {
        const q = String(query || '').trim().toLowerCase();
        const bare = q.replace(/\.[a-z0-9]+$/, '');
        return PROJECTS.find(p => {
          const file = p.file.toLowerCase();
          return p.id === q || p.id === bare || file === q || file.replace(/\.[a-z0-9]+$/, '') === bare;
        }) || null;
      }

      let binContents = [
        {
          f: 'ie6_setup.exe', type: tr('Application'), size: '17.4 MB', desc: tr('Setup program'), icon: () => appIcon('#7a7a7a', 32),
          msg: tr('Cannot install Internet Explorer 6.\nThis operating system refuses. On principle.')
        },
        {
          f: 'jquery_everything.txt', type: tr('Text document'), size: tr('0 bytes'), desc: tr('Empty promise'), icon: () => svg('txt', 32),
          msg: tr('Cannot open jquery_everything.txt: file is empty.\nThe promise was kept.')
        },
        {
          f: 'social_life.dll', type: tr('Module'), size: '404 KB', desc: tr('Missing'), icon: () => appIcon('#7a7a7a', 32),
          msg: tr('Cannot load social_life.dll.\nThe specified module could not be found.\n(Occupational hazard.)')
        },
        {
          f: 'flappy_clone_v3_FINAL_real.js', type: tr('Script'), size: '2.1 MB', desc: tr('Unfinished'), icon: () => svg('txt', 32),
          msg: tr('Cannot run flappy_clone_v3_FINAL_real.js: unexpected end of file.\nIt was never finished. None of them ever were.')
        },
        {
          f: 'vibes.wav', type: tr('Sound'), size: '8,913 KB', desc: tr('Immaculate'), icon: () => appIcon('#7a7a7a', 32),
          msg: tr('Cannot play vibes.wav: no sound card detected.\nThe vibes remain, however, immaculate.')
        },
        {
          f: 'myspace_profile.htm', type: tr('HTML document'), size: '96 KB', desc: tr('Tom says hi'), icon: () => svg('txt', 32),
          msg: tr('Cannot open myspace_profile.htm.\nTom says hi, though.')
        }
      ];

      /* `by` labels the issuer row, which means something different per kind. */
      const CREDENTIAL_KINDS = {
        certificate: { label: tr('Certificate'), ext: 'cer', by: tr('Issued by'), icon: 'cert' },
        award: { label: tr('Award'), ext: 'awd', by: tr('Awarded by'), icon: 'cert' },
        experience: { label: tr('Work experience'), ext: 'job', by: tr('Company'), icon: 'experience' },
        education: { label: tr('Education'), ext: 'edu', by: tr('Institution'), icon: 'education' }
      };

      const FIVERR = {
        user: 'aam_hermansyah',
        url: 'https://www.fiverr.com/aam_hermansyah',
        headline: 'Fullstack developer — Next.js · React · TypeScript',
        gigs: [tr('Fullstack web applications (Next.js, TypeScript)'),
          tr('Dashboards and landing pages built from a design'),
          tr('API integration and payment flows'),
          tr('Fixed-scope MVPs')]
      };
      let fiverrVisits = 1337;
      const JFACTS = [
        tr('Jupiter\u2019s magnetic field is 20,000\u00d7 stronger than Earth\u2019s. Do not bring a compass.'),
        tr('Jupiter has no surface to land on. Below the clouds there is only more Jupiter.'),
        tr('The Great Red Spot is a storm that could swallow Earth whole, with room left for dessert.'),
        tr('A Jupiter day is so fast the planet is visibly squashed at the poles.'),
        tr('Jupiter shepherds the asteroid belt and absorbs comets. You\u2019re welcome, Earth.'),
        tr('If Jupiter were ~80\u00d7 more massive it would have ignited as a star. It tried its best.'),
        tr('Jupiter does have rings — halo, main and two gossamer rings, found by Voyager 1 in 1979. Drawn here extra visible, for morale.')];
