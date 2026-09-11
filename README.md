<div align="center">

# PortfolioOS 98

### A full-stack developer portfolio disguised as a desktop operating system.

Boot it. Explore it. Open a few windows. Maybe inspect Jupiter while you are here.

[![Next.js](https://img.shields.io/badge/Next.js-16-000000?style=for-the-badge&logo=nextdotjs&logoColor=white)](https://nextjs.org/)
[![React](https://img.shields.io/badge/React-19-20232a?style=for-the-badge&logo=react&logoColor=61dafb)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-3178c6?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)

[Live Portfolio](https://aamhermansyah.vercel.app) · [GitHub](https://github.com/AamHermansyah) · [LinkedIn](https://www.linkedin.com/in/aam-hermansyah/) · [Fiverr](https://www.fiverr.com/aam_hermansyah)

</div>

---

```text
Award Modular BIOS v4.51PG
Memory Test : 262,144K OK
Booting PortfolioOS 98 ...............

C:\PORTFOLIO> open projects
```

PortfolioOS is the interactive portfolio of **Aam Hermansyah**, a full-stack developer from Garut, Indonesia. Instead of presenting another conventional landing page, it recreates a working Windows 98-style desktop in the browser—complete with draggable windows, a taskbar, file explorer, terminal, setup wizards, context menus, and a few carefully placed easter eggs.

The interface began as a standalone HTML experience and now runs on the Next.js App Router with an atomic component shell. The original visual language, fonts, pixel details, and desktop interactions remain intact.

## Explore the desktop

| Application | What it does |
| --- | --- |
| `About_Me.txt` | Opens Aam's profile and contact details in Notepad. |
| `Projects` | Browses real projects through a Windows Explorer-style window. |
| Project Case Study | Presents overview, challenge, solution, architecture, results, and product screenshots when verified material is available. |
| `Skills.exe` | Runs an animated installer for the current technology stack and keeps the completed progress visible until the visitor closes it. |
| `Terminal` | Provides a working command prompt with discoverable commands such as `help`, `projects`, `skills`, and `open`. |
| `Resume.pdf` | Displays the résumé inside a retro document viewer. |
| `Contact.exe` | Sends a direct message through the inquiry API, with an honest e-mail-client fallback. |
| `Hire_Me.exe` | Guides prospective clients through engagement type, project focus, budget, timeline, and contact information. |
| `System Properties` | Gives recruiters a fast summary of role, experience, location, availability, and languages. |
| `Network Neighborhood` | Browses the GitHub profile and repositories from a resilient build-time snapshot. |
| `Find` | Searches projects, skills, credentials, and GitHub repositories from one place. |
| `Changelog.log` | Combines PortfolioOS milestones with repository activity. |
| `Career.log` | Shows the professional timeline separately from product and repository changes. |
| `Certificates` | Appears automatically after real credentials are added to the data source. |
| `Recycle Bin` | Stores abandoned technology decisions and developer jokes. |
| Display Properties | Switches between seven wallpapers, including an animated terminal and interactive orbit scene. |

The desktop also supports window dragging, resizing, minimizing, maximizing, keyboard navigation, touch interaction, persistent wallpaper selection, a boot sequence, notifications, and interactive Moon/Jupiter objects.

## Featured projects

- **MyKaggo** — intercity parcel tracking and logistics for Nigeria, built as a Turborepo monorepo with offline support and Paystack payments.
- **AturTrip** — an Indonesian tour-guide marketplace with hour-by-hour itineraries, guide verification, and Midtrans escrow.
- **Difteri AI** — a TypeScript front end connected to an independently deployed Python screening service.
- **stunting.id** — a public Next.js application backed by Prisma.
- **UjiKita** — an online examination application built with Next.js and TypeScript.
- **paperize.ai** — a deployed Next.js and Tailwind CSS document application.

Every listed project links to its live deployment and public source repository when available.

## Architecture

```text
styles/portfolio-os.css
        └── styles/portfolio-os/*.css (14 ordered style modules)

runtime/portfolio-os/*.js (22 ordered runtime modules)
        └── scripts/sync-portfolio-assets.mjs
                └── public/portfolio-runtime.js

Next.js atomic shell
        ├── atoms
        ├── molecules
        ├── organisms
        └── templates

GitHub API ── scripts/sync-github.mjs ── public/github.json

Contact.exe / Hire_Me.exe ── POST /api/hire ── Webhook or Resend
```

Key implementation details:

- **Next.js 16 App Router** provides the application shell, metadata, static generation, and inquiry endpoint.
- **Atomic design** separates the React shell into atoms, molecules, organisms, and templates.
- **Modular portfolio sources** keep every handwritten code file below 500 lines while preserving feature-based boundaries.
- **Portfolio runtime synchronization** combines the ordered browser-runtime modules before development and production builds.
- **Build-time GitHub snapshots** keep Network Neighborhood fast and usable even when GitHub is unavailable or rate-limited.
- **Progressive inquiry delivery** supports a generic webhook or Resend, then falls back to `mailto:` when no transport is configured.
- **Basic abuse protection** includes input limits, validation, a honeypot, minimum form-fill time, and an in-memory rate limit.

## Getting started

Requirements:

- Node.js `20.9.0` or newer
- npm

Clone and start the development server:

```bash
git clone https://github.com/AamHermansyah/portfolio-os.git
cd portfolio-os
npm install
cp .env.example .env.local
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

On Windows PowerShell, copy the environment file with:

```powershell
Copy-Item .env.example .env.local
```

## Environment variables

All variables are optional. With a database attached, submissions are stored and readable from the Terminal even when no delivery transport is configured; the fallback to the visitor's own e-mail client is reserved for a deployment that has neither.

### Inquiry delivery

Choose one delivery method:

| Variable | Purpose |
| --- | --- |
| `HIRE_WEBHOOK_URL` | Sends JSON to Formspree, Zapier, n8n, Slack, Discord, or another compatible endpoint. |
| `RESEND_API_KEY` | Enables delivery through the Resend API. |
| `HIRE_TO_EMAIL` | Destination address when using Resend. |
| `HIRE_FROM_EMAIL` | Optional verified sender address for Resend. |

`HIRE_WEBHOOK_URL` takes precedence when both methods are configured.

### Database and terminal administration

| Variable | Purpose |
| --- | --- |
| `DATABASE_URL` | Pooled Neon connection string. Used by the application at runtime. |
| `DATABASE_URL_UNPOOLED` | Direct Neon connection string. Used by Prisma Migrate, which needs a session-level advisory lock the pooler cannot hold. |
| `NEON_BRANCH` | Which Neon branch the two URLs point at. Informational. |
| `ADMIN_TOKEN_SECRET` | Signing key for the in-memory admin session token. At least 32 characters. Without it the admin commands report `not_configured`. |

`neon link` writes the first three. Generate `ADMIN_TOKEN_SECRET` with:

```bash
node -e "console.log(require('node:crypto').randomBytes(32).toString('base64url'))"   # ADMIN_TOKEN_SECRET
```

Content is managed from the Terminal, not from a web dashboard. Sign in with `sudo login --admin`, then `help` lists the administrative commands and `resources` lists what can be managed. The session lives in memory only — reloading the page signs you out, and nothing is written to a cookie or to local storage. The first administrator is created with `sudo setup --admin`, which prompts to create a recovery PIN that is securely hashed (scrypt) and stored per-account in the database. A forgotten password is recovered with `sudo reset --admin`, which validates against that account's recovery PIN and invalidates every token already issued. End the session anytime with `logout`.

### GitHub snapshot

| Variable | Purpose |
| --- | --- |
| `GITHUB_USER` | Overrides the GitHub account used by the snapshot script. Defaults to `AamHermansyah`. |
| `GITHUB_TOKEN` | Optional token that raises the GitHub API rate limit during builds. |

If synchronization fails, the previous `public/github.json` snapshot is retained so a temporary API problem never breaks the portfolio build.

## Available commands

| Command | Description |
| --- | --- |
| `npm run dev` | Synchronizes portfolio assets and GitHub data, then starts Next.js development mode. |
| `npm run build` | Synchronizes data and creates an optimized production build. |
| `npm start` | Serves the production build. |
| `npm run lint` | Checks the 500-line limit, then runs ESLint. |
| `npm run check:file-size` | Verifies every code file contains at most 500 lines. |
| `npm run sync:portfolio` | Regenerates the browser runtime from its ordered modules. |
| `npm run sync:github` | Refreshes the local GitHub profile and repository snapshot. |

## Customizing the portfolio

The main profile, project, case-study, skill, social-link, testimonial, credential, and career-history data live in [`runtime/portfolio-os/08-portfolio-data.js`](./runtime/portfolio-os/08-portfolio-data.js).

Important editing rules:

1. Edit styles inside `styles/portfolio-os/` according to their feature names.
2. Edit browser behavior inside `runtime/portfolio-os/` according to its feature module.
3. Run `npm run sync:portfolio` after changing runtime code.
4. Do not edit `public/portfolio-runtime.js` directly because it is generated.
5. Replace clearly labelled demo content with genuine certificates, testimonials, metrics, and career history before publishing it as factual information.

The React application shell lives under `components/`:

```text
components/
├── atoms/
├── molecules/
├── organisms/
└── templates/
```

All implementation filenames use kebab-case, and the migrated React components follow atomic-design boundaries.

## Deployment

The project is ready for deployment on Vercel or another Node.js-compatible platform:

```bash
npm run build
npm start
```

Configure the inquiry environment variables in the deployment dashboard if `Contact.exe` and `Hire_Me.exe` should deliver without opening a local mail client. A GitHub token is optional but recommended for reliable snapshot refreshes in frequent CI builds.

## Author

**Aam Hermansyah** — Fullstack Developer

- Portfolio: [aamhermansyah.vercel.app](https://aamhermansyah.vercel.app)
- GitHub: [github.com/AamHermansyah](https://github.com/AamHermansyah)
- LinkedIn: [linkedin.com/in/aam-hermansyah](https://www.linkedin.com/in/aam-hermansyah/)
- Fiverr: [fiverr.com/aam_hermansyah](https://www.fiverr.com/aam_hermansyah)
- E-mail: [aamhermansyah283@gmail.com](mailto:aamhermansyah283@gmail.com)

---

<div align="center">

Built with modern web tooling, presented with 1998 confidence.

</div>
