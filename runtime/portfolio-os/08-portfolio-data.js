/* =================================================================
         data
      ================================================================= */
      /* Everything the site says about who this is. One object so a change lands in
         every window at once, instead of being hunted through markup. */
      const PROFILE = {
        name: 'Aam Hermansyah',
        role: 'Fullstack Developer',
        experience: '7 Years',
        location: 'Garut, Indonesia',
        timezone: 'GMT+7',
        status: 'Available for Work',
        available: true,
        languages: 'Indonesian, English'
      };

      const LINKS = {
        github: 'https://github.com/AamHermansyah', githubUser: 'AamHermansyah',
        linkedin: 'https://www.linkedin.com/in/aam-hermansyah/', linkedinUser: 'aam-hermansyah',
        fiverr: 'https://www.fiverr.com/aam_hermansyah', fiverrUser: 'aam_hermansyah',
        email: 'aamhermansyah283@gmail.com',
        phone: '082316126449',
        site: 'https://aamhermansyah.vercel.app', siteLabel: 'aamhermansyah.vercel.app'
      };

      const PROJECTS = [
        {
          id: 'mykaggo', file: 'mykaggo.exe', name: 'MyKaggo', ver: 'v1.0', color: '#000080', type: 'Win32 application',
          size: '4.2 MB', date: '08-31-2026', seed: 'mykaggo-app',
          tagline: 'Intercity parcel tracking and logistics platform',
          desc: 'An intercity parcel tracking and logistics management platform for Nigeria. It puts senders, receivers, logistics companies and drivers on one system, with live GPS visibility on a shipment and payment handled through Paystack in Naira.',
          notes: ['Turborepo monorepo: two applications over five shared packages',
            'Admin console for rate settings and shipment monitoring',
            'Progressive Web App with offline support',
            'Test suites covering the service worker, phone normalisation and password strength'],
          stack: ['Next.js 16', 'React 19', 'TypeScript', 'Turborepo', 'Tailwind CSS 4', 'Zod'],
          demo: 'https://kaggo.vercel.app', repo: 'https://github.com/AamHermansyah/kaggo',
          req: 'Requires: 486DX2-66 · 8 MB RAM · SVGA'
        },
        {
          id: 'aturtrip', file: 'aturtrip.exe', name: 'AturTrip', ver: 'v1.0', color: '#008080', type: 'Win32 application',
          size: '3.6 MB', date: '08-23-2026', seed: 'aturtrip-app',
          tagline: 'Tour guide marketplace with hour-by-hour itineraries',
          desc: 'An Indonesian tourism marketplace connecting travellers with local tour guides, built to replace booking by WhatsApp. Travellers can see the full hourly timeline of a trip and its route map before paying, which is the part competitors leave out.',
          notes: ['Timeline event view — the hour-by-hour schedule, shown before purchase',
            'Private or shared booking with real-time slot availability',
            'Midtrans payments held in escrow until the trip is done',
            'Multi-step wizard for guides to publish a complete package',
            'Admin side for guide verification and dispute resolution'],
          stack: ['Next.js', 'TypeScript', 'Shadcn UI', 'pnpm workspaces', 'Midtrans'],
          demo: 'https://aturtrip.vercel.app', repo: 'https://github.com/AamHermansyah/AturTripWeb',
          req: 'Requires: 486DX2-66 · 16 MB RAM · TCP/IP'
        },
        {
          id: 'difteri', file: 'difteri.dll', name: 'Difteri AI', ver: 'v1.0', color: '#800000', type: 'Dynamic-link library',
          size: '2.1 MB', date: '09-23-2025', seed: 'difteri-app',
          tagline: 'Diphtheria screening service, split front end and model API',
          desc: 'A two-repository project: a TypeScript front end talking to a separate Python service. The split keeps the model work out of the web application entirely.',
          notes: ['TypeScript front end deployed independently of the backend',
            'Python service repository kept separate: AamHermansyah/difteri-ai-be'],
          stack: ['Next.js', 'TypeScript', 'Python', 'Zustand'],
          demo: 'https://difteri-ai-fe.vercel.app', repo: 'https://github.com/AamHermansyah/difteri-ai-fe',
          req: 'Requires: 486SX · 8 MB RAM · TCP/IP'
        },
        {
          id: 'stunting', file: 'stunting.exe', name: 'stunting.id', ver: 'v1.0', color: '#008000', type: 'Win32 application',
          size: '2.9 MB', date: '01-16-2025', seed: 'stunting-app',
          tagline: 'Next.js and Prisma application',
          desc: 'A Next.js application with a Prisma data layer, deployed and public. The repository has no written documentation yet — the live build is the honest description.',
          notes: ['Prisma schema in the repository', 'Deployed on Vercel'],
          stack: ['Next.js', 'TypeScript', 'Prisma', 'Tailwind CSS'],
          demo: 'https://stunting-id.vercel.app', repo: 'https://github.com/AamHermansyah/stunting.id',
          req: 'Requires: 486SX · 8 MB RAM · TCP/IP'
        },
        {
          id: 'ujikita', file: 'ujikita.exe', name: 'UjiKita', ver: 'v1.0', color: '#800080', type: 'Win32 application',
          size: '1.8 MB', date: '06-03-2025', seed: 'ujikita-app',
          tagline: 'Online exam application',
          desc: 'An exam application built with Next.js and TypeScript, deployed at ujikita.vercel.app. Not yet documented in its repository.',
          notes: ['Deployed on Vercel', 'Source is public'],
          stack: ['Next.js', 'TypeScript'],
          demo: 'https://ujikita.vercel.app', repo: 'https://github.com/AamHermansyah/exam-app',
          req: 'Requires: 386SX · 4 MB RAM'
        },
        {
          id: 'paperize', file: 'paperize.html', name: 'paperize.ai', ver: '0.9 beta', color: '#808000', type: 'HTML document',
          size: '740 KB', date: '01-08-2025', seed: 'paperize-app',
          tagline: 'Next.js and Tailwind application',
          desc: 'A Next.js, TypeScript and Tailwind application deployed at paperize-ai.vercel.app. Its repository carries the framework README only, so the live build speaks for it.',
          notes: ['Deployed on Vercel', 'Source is public'],
          stack: ['Next.js', 'TypeScript', 'Tailwind CSS'],
          demo: 'https://paperize-ai.vercel.app', repo: 'https://github.com/AamHermansyah/paperize.ai',
          req: 'Requires: any browser'
        }
      ];

      /* Case studies carry only what the repositories and their READMEs actually
         document. Projects without written-up material keep the sections that are
         true of them and drop the rest — caseHas() hides the empty ones rather than
         padding them with invented problems, metrics or architecture. */
      const CASE_STUDIES = {
        mykaggo: {
          role: 'Fullstack Developer',
          problem: 'Intercity parcel delivery in Nigeria runs across parties that do not share a system: the sender, the receiver, the logistics company and the driver each hold a piece of the picture, and none of them can see the shipment move.',
          responsibilities: ['Structured the Turborepo monorepo and the shared package boundaries',
            'Built the user, company and admin applications on that shared base',
            'Wired Paystack payments and the live GPS tracking view',
            'Made the front end installable and usable offline'],
          solution: [
            { title: 'One system, three audiences', text: 'A user and company application, plus a separate admin console, sharing configuration, types, validation, API clients and UI components.' },
            { title: 'Payments in local currency', text: 'Paystack handles payment in Naira, so senders pay the way they already pay for everything else.' },
            { title: 'Works on a bad connection', text: 'A Progressive Web App with a service worker, so the app keeps functioning when the network does not.' }
          ],
          architecture: [
            { title: 'Two applications', text: 'User and company on one port, admin on another, deployed as separate Vercel projects.' },
            { title: 'Five shared packages', text: 'Configuration, types, Zod validation schemas, API clients and UI components, shared rather than duplicated.' },
            { title: 'Build orchestration', text: 'Turborepo with PNPM workspaces, so a change in a package rebuilds only what depends on it.' }
          ],
          architectureNote: 'Splitting the admin console into its own application keeps operator tooling out of the bundle every sender downloads.',
          gallery: ['mykaggo-track', 'mykaggo-pay', 'mykaggo-admin'],
          captions: ['Parcel listing and route selection.', 'Payment step handled through Paystack.', 'Admin console for rates and shipment monitoring.']
        },
        aturtrip: {
          role: 'Fullstack Developer',
          problem: 'Booking a local guide in Indonesia happens over WhatsApp, where the traveller agrees to a price without knowing the actual plan for the day. Nothing is comparable, nothing is guaranteed, and trust rests entirely on the conversation.',
          responsibilities: ['Designed the timeline event model that shows a trip hour by hour',
            'Built the guide-side wizard for publishing a complete package',
            'Integrated Midtrans with escrow so payment is held until the trip completes',
            'Built the admin side for guide verification and disputes'],
          solution: [
            { title: 'The plan before the payment', text: 'Every trip publishes an hour-by-hour timeline and a route map, so the traveller sees the day before agreeing to it.' },
            { title: 'Escrow, not trust', text: 'Midtrans holds payment until the trip is done, which removes the part of the WhatsApp flow that needed faith.' },
            { title: 'Guides publish properly', text: 'A multi-step wizard walks a guide through photos, description, itinerary, schedule and capacity.' }
          ],
          architecture: [
            { title: 'pnpm workspace', text: 'Applications and shared packages split across /apps and /packages.' },
            { title: 'Mobile-first interface', text: 'Most travellers arrive on a phone, so the layout is built for that first and widens from there.' },
            { title: 'Verification layer', text: 'Admin approval of guide documents, feeding the badges and ratings the marketplace runs on.' }
          ],
          architectureNote: 'Trust is the product here: verification badges, ratings and guide history are treated as core data, not decoration.',
          gallery: ['aturtrip-search', 'aturtrip-timeline', 'aturtrip-guide'],
          captions: ['Guide search with location and price filters.', 'Timeline view of a trip, hour by hour.', 'Guide dashboard for schedule and capacity.']
        },
        difteri: {
          role: 'Fullstack Developer',
          gallery: ['difteri-app', 'difteri-result'],
          captions: ['Front end interface.', 'Result view returned by the Python service.']
        },
        stunting: {
          role: 'Fullstack Developer',
          gallery: ['stunting-app', 'stunting-data'],
          captions: ['Application interface.', 'Data view backed by Prisma.']
        },
        ujikita: {
          role: 'Fullstack Developer',
          gallery: ['ujikita-app', 'ujikita-exam'],
          captions: ['Application interface.', 'Exam view.']
        },
        paperize: {
          role: 'Fullstack Developer',
          gallery: ['paperize-app', 'paperize-view'],
          captions: ['Application interface.', 'Document view.']
        }
      };

      /* Levels are a self-assessment, not measured data — set them to whatever you
         would actually defend in an interview. */
      const SKILLS = [
        { name: 'TypeScript', file: 'tsconfig.sys', level: 92 },
        { name: 'React.js', file: 'react.dll', level: 90 },
        { name: 'Next.js', file: 'next.js', level: 90 },
        { name: 'Tailwind CSS', file: 'tailwind.css', level: 88 },
        { name: 'Node.js', file: 'node.exe', level: 82 },
        { name: 'Prisma', file: 'prisma.dll', level: 78 },
        { name: 'React Native', file: 'native.apk', level: 70 },
        { name: 'Python', file: 'python.exe', level: 62 },
        { name: 'Rust', file: 'rustc.exe', level: 14, fail: true }
      ];

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
      /* Demo entries make the inbox and notification flow reviewable. Replace these
         clearly labelled placeholders with verified client quotes before launch. */
      const TESTIMONIALS = [
        {
          from: 'Nadia Pratama (Demo)', role: 'Product Lead · Sample testimonial',
          subject: '[DEMO] Product delivery feedback',
          date: 'Today, 10:30 AM', dateShort: 'Today', stars: 5,
          skin: '#e8b98f', hair: '#2f211b', shirt: '#000080',
          text: 'Demo testimonial: Aam translated a complicated workflow into a product the team could understand, test, and ship with confidence.'
        },
        {
          from: 'Rizky Maulana (Demo)', role: 'Engineering Manager · Sample testimonial',
          subject: '[DEMO] Engineering collaboration',
          date: 'Yesterday, 3:45 PM', dateShort: 'Yesterday', stars: 5,
          skin: '#c98b62', hair: '#17120f', shirt: '#008080',
          text: 'Demo testimonial: Communication stayed clear throughout the project, technical trade-offs were documented, and every milestone arrived in a reviewable state.'
        },
        {
          from: 'Sarah Wijaya (Demo)', role: 'Founder · Sample testimonial',
          subject: '[DEMO] Working with Aam',
          date: '09/08/2026, 9:15 AM', dateShort: '09/08', stars: 4,
          skin: '#efc69f', hair: '#5c3824', shirt: '#800080',
          text: 'Demo testimonial: The final application matched the intended design closely and remained practical for our team to maintain after handover.'
        }
      ];

      /* Demo credentials keep the complete explorer flow visible for review.
         Replace them with verified credentials before publishing final content. */
      const CREDENTIALS = [
        {
          kind: 'certificate',
          title: '[Demo] Full-Stack Web Development',
          issuer: 'Sample Technology Academy',
          date: '2024',
          notes: [
            'Placeholder certificate used to review the credential viewer.',
            'Replace the title, issuer, date and verification URL with real data.'
          ]
        },
        {
          kind: 'award',
          title: '[Demo] Product Innovation Award',
          issuer: 'Sample Digital Organization',
          date: '2023',
          notes: [
            'Placeholder award used to review the award file type.',
            'This entry does not represent a real award.'
          ]
        },
        {
          kind: 'experience',
          title: '[Demo] Senior Fullstack Developer',
          issuer: 'Example Technology Company',
          date: '2022 — Present',
          notes: [
            'Led delivery of customer-facing web applications.',
            'Sample work-history entry — replace with verified employment details.'
          ]
        },
        {
          kind: 'education',
          title: '[Demo] Bachelor of Computer Science',
          issuer: 'Example University',
          date: '2015 — 2019',
          notes: [
            'Sample education entry for layout review.',
            'Replace with the correct institution, programme and study period.'
          ]
        }
      ];

      /* Demo publications keep the research-library UI reviewable before real
         papers are connected to the public data source. Every placeholder is
         labelled plainly so it cannot be mistaken for a real publication. */
      const PUBLICATIONS = [
        {
          title: '[Demo] Offline-First Interfaces for Intermittent Networks',
          venue: 'Sample Journal of Applied Web Systems',
          authors: ['Aam Hermansyah', 'Example Collaborator'],
          date: '2026',
          doi: 'Demo DOI — replace before launch',
          abstract: 'A placeholder paper exploring practical interface patterns for applications that must remain understandable and useful while connectivity changes throughout a user journey.',
          notes: [
            'Demo publication used to review the library and reading-pane layouts.',
            'Replace the title, venue, authors, abstract and DOI with verified material.'
          ]
        },
        {
          title: '[Demo] Practical Type Safety Across Full-Stack Boundaries',
          venue: 'Example Conference on Software Delivery',
          authors: ['Aam Hermansyah'],
          date: '2025',
          abstract: 'A sample conference paper about keeping contracts explicit as data moves through browser interfaces, server actions, validation layers and relational storage.',
          notes: [
            'Placeholder conference entry; it does not represent a real accepted paper.',
            'The single-author layout is intentional for UI coverage.'
          ]
        },
        {
          title: '[Demo] Human-Centred Administration in Legacy Visual Systems',
          venue: 'Sample Interaction Design Review',
          authors: ['Aam Hermansyah', 'Example Research Partner', 'Example Reviewer'],
          date: '2024',
          doi: 'Demo DOI — not registered',
          abstract: 'A placeholder article examining how familiar desktop metaphors can make dense administrative workflows feel approachable without hiding validation, permissions or destructive actions.',
          notes: [
            'Demo article included to exercise longer author lists and abstracts.',
            'No external publication URL is attached to this placeholder.'
          ]
        }
      ];

      const CREDENTIAL_KINDS = {
        certificate: { label: 'Certificate', ext: 'cer' },
        award: { label: 'Award', ext: 'awd' },
        experience: { label: 'Work experience', ext: 'job' },
        education: { label: 'Education', ext: 'edu' }
      };

      const PORTFOLIO_LOG = [
        { year: 2026, text: 'Find, Certificates and Changelog.log added to the shell.' },
        { year: 2026, text: 'Network Neighborhood browses the GitHub account from a build-time snapshot.' },
        { year: 2026, text: 'System Properties: the whole summary a recruiter needs, in one dialog.' },
        { year: 2026, text: 'Hire_Me.exe wizard, delivering through /api/hire instead of mailto:.' },
        { year: 2026, text: 'Windows 98 pixel cursors replaced the system ones.' },
        { year: 2026, text: 'Project case studies added.' },
        { year: 2026, text: 'PortfolioOS migrated to Next.js.' }
      ];

      const CAREER_LOG = [
        { year: 2026, text: '[DEMO] Led delivery of a multi-application platform from planning through production.' },
        { year: 2024, text: '[DEMO] Took ownership of frontend architecture and developer experience for a growing product team.' },
        { year: 2022, text: '[DEMO] Began a senior full-stack role focused on TypeScript, React and backend integrations.' },
        { year: 2019, text: '[DEMO] Shipped the first production web application for an external client.' }
      ];

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
