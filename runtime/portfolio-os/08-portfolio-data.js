/* =================================================================
         data
      ================================================================= */
      /* Everything the site says about who this is. One object so a change lands in
         every window at once, instead of being hunted through markup. */
      const PROFILE = {
        name: 'Aam Hermansyah',
        role: 'Frontend Developer',
        experience: '7 Years',
        location: 'Garut, West Java, Indonesia',
        timezone: 'GMT+7',
        status: 'Available for Work',
        available: true,
        languages: 'Indonesian, English',
        /* The profile photo on About_Me.txt: a Drive file shared "anyone with the
           link", addressed as lh3.googleusercontent.com/d/<file id>. Browsers
           refuse Drive's uc?export=view form as an <img>, even though it works
           in curl. `photoFocus` picks the point the square frame zooms in on,
           in percent of the photo, so a wide shot still reads as a portrait. */
        photo: 'https://lh3.googleusercontent.com/d/11TS6NuL1O1Yzt6UOT3vLvaXpaoH3vN6H',
        photoFocus: { x: 52, y: 40, zoom: 1.8 },
        summary: 'I started coding at 17 years old and have built several fullstack web applications using Next.js, giving me a solid understanding of both frontend and backend concepts. I\'m also an Informatics graduate with a focus on Artificial Intelligence, combining web development skills with a growing interest in intelligent systems.',
        additional: 'Freelance client rating: 5.0 / 5.0 from 26 reviews on Fiverr ("Atwom Dev").'
      };

      const LINKS = {
        github: 'https://github.com/AamHermansyah', githubUser: 'AamHermansyah',
        linkedin: 'https://www.linkedin.com/in/aam-hermansyah/', linkedinUser: 'aam-hermansyah',
        fiverr: 'https://www.fiverr.com/aam_hermansyah', fiverrUser: 'aam_hermansyah',
        email: 'hermansyahaam283@gmail.com',
        phone: '+62 823-1612-6449',
        site: 'https://aamhermansyah.vercel.app', siteLabel: 'aamhermansyah.vercel.app'
      };

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
          f: 'ie6_setup.exe', type: 'Application', size: '17.4 MB', desc: 'Setup program', icon: () => appIcon('#7a7a7a', 32),
          msg: 'Cannot install Internet Explorer 6.\nThis operating system refuses. On principle.'
        },
        {
          f: 'jquery_everything.txt', type: 'Text document', size: '0 bytes', desc: 'Empty promise', icon: () => svg('txt', 32),
          msg: 'Cannot open jquery_everything.txt: file is empty.\nThe promise was kept.'
        },
        {
          f: 'social_life.dll', type: 'Module', size: '404 KB', desc: 'Missing', icon: () => appIcon('#7a7a7a', 32),
          msg: 'Cannot load social_life.dll.\nThe specified module could not be found.\n(Occupational hazard.)'
        },
        {
          f: 'flappy_clone_v3_FINAL_real.js', type: 'Script', size: '2.1 MB', desc: 'Unfinished', icon: () => svg('txt', 32),
          msg: 'Cannot run flappy_clone_v3_FINAL_real.js: unexpected end of file.\nIt was never finished. None of them ever were.'
        },
        {
          f: 'vibes.wav', type: 'Sound', size: '8,913 KB', desc: 'Immaculate', icon: () => appIcon('#7a7a7a', 32),
          msg: 'Cannot play vibes.wav: no sound card detected.\nThe vibes remain, however, immaculate.'
        },
        {
          f: 'myspace_profile.htm', type: 'HTML document', size: '96 KB', desc: 'Tom says hi', icon: () => svg('txt', 32),
          msg: 'Cannot open myspace_profile.htm.\nTom says hi, though.'
        }
      ];

      /* `by` labels the issuer row, which means something different per kind. */
      const CREDENTIAL_KINDS = {
        certificate: { label: 'Certificate', ext: 'cer', by: 'Issued by', icon: 'cert' },
        award: { label: 'Award', ext: 'awd', by: 'Awarded by', icon: 'cert' },
        experience: { label: 'Work experience', ext: 'job', by: 'Company', icon: 'experience' },
        education: { label: 'Education', ext: 'edu', by: 'Institution', icon: 'education' }
      };

      const FIVERR = {
        user: 'aam_hermansyah',
        url: 'https://www.fiverr.com/aam_hermansyah',
        headline: 'Fullstack developer — Next.js · React · TypeScript',
        gigs: ['Fullstack web applications (Next.js, TypeScript)',
          'Dashboards and landing pages built from a design',
          'API integration and payment flows',
          'Fixed-scope MVPs']
      };
      let fiverrVisits = 1337;
      const JFACTS = [
        'Jupiter\u2019s magnetic field is 20,000\u00d7 stronger than Earth\u2019s. Do not bring a compass.',
        'Jupiter has no surface to land on. Below the clouds there is only more Jupiter.',
        'The Great Red Spot is a storm that could swallow Earth whole, with room left for dessert.',
        'A Jupiter day is so fast the planet is visibly squashed at the poles.',
        'Jupiter shepherds the asteroid belt and absorbs comets. You\u2019re welcome, Earth.',
        'If Jupiter were ~80\u00d7 more massive it would have ignited as a star. It tried its best.',
        'Jupiter does have rings — halo, main and two gossamer rings, found by Voyager 1 in 1979. Drawn here extra visible, for morale.'];
