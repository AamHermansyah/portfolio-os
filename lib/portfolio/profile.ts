import type { PublicProfile } from "@/lib/portfolio/contract";

/**
 * The single source for who this portfolio is about.
 *
 * Read by the Simple view (app/[lang]), by lib/site.ts for the metadata, and —
 * through components/atoms/portfolio-runtime.tsx — by the PortfolioOS runtime,
 * which used to keep its own hand-written copy that had drifted: the desktop
 * said "Frontend Developer" while the metadata said "Fullstack Developer".
 *
 * No `server-only`, and nothing but a type import: this crosses to the browser.
 */
export const profile: PublicProfile = {
  name: "Aam Hermansyah",
  role: "Fullstack Developer",
  experience: "7 Years",
  location: "Garut, West Java, Indonesia",
  timezone: "GMT+7",
  status: "Available for Work",
  available: true,
  languages: "Indonesian, English",
  // A Drive file shared "anyone with the link", addressed as
  // lh3.googleusercontent.com/d/<file id>; browsers refuse Drive's own
  // uc?export=view form as an <img>.
  photo: "https://lh3.googleusercontent.com/d/11TS6NuL1O1Yzt6UOT3vLvaXpaoH3vN6H",
  photoFocus: { x: 52, y: 40, zoom: 1.8 },
  summary:
    "I started coding at 17 years old and have built several fullstack web applications using Next.js, giving me a solid understanding of both frontend and backend concepts. I'm also an Informatics graduate with a focus on Artificial Intelligence, combining web development skills with a growing interest in intelligent systems.",
  additional: 'Freelance client rating: 5.0 / 5.0 from 26 reviews on Fiverr ("Atwom Dev").',
  links: {
    github: "https://github.com/AamHermansyah",
    githubUser: "AamHermansyah",
    linkedin: "https://www.linkedin.com/in/aam-hermansyah/",
    linkedinUser: "aam-hermansyah",
    fiverr: "https://www.fiverr.com/aam_hermansyah",
    fiverrUser: "aam_hermansyah",
    email: "hermansyahaam283@gmail.com",
    phone: "+62 823-1612-6449",
    whatsapp: "https://wa.me/6282316126449",
    whatsappLabel: "wa.me/6282316126449",
    site: "https://aamhermansyah.vercel.app",
    siteLabel: "aamhermansyah.vercel.app",
  },
  i18n: {
    id: {
      role: "Fullstack Developer",
      experience: "7 Tahun",
      location: "Garut, Jawa Barat, Indonesia",
      status: "Tersedia untuk bekerja",
      languages: "Indonesia, Inggris",
      summary:
        "Saya mulai belajar coding sejak usia 17 tahun dan telah membangun beberapa aplikasi web fullstack dengan Next.js, sehingga memahami konsep frontend maupun backend dengan baik. Saya juga lulusan Informatika dengan fokus pada Kecerdasan Buatan, memadukan keterampilan pengembangan web dengan minat yang terus tumbuh pada sistem cerdas.",
      additional: 'Rating klien freelance: 5,0 / 5,0 dari 26 ulasan di Fiverr ("Atwom Dev").',
    },
  },
};
