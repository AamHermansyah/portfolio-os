export function QuickLaunch() {
  return (
    <div id="qLaunch" data-tr-title="Contact Me — quick launch toolbar" title="Contact Me — quick launch toolbar">
      <span aria-hidden="true" className="ql-handle" />
      <button className="ql-btn" id="ql-mail" data-tr-title="E-mail Aam — compose a message" title="E-mail Aam — compose a message" type="button" />
      <a className="ql-btn" href="https://github.com/AamHermansyah" id="ql-git" rel="noopener" target="_blank" title="GitHub — github.com/AamHermansyah" />
      <a className="ql-btn" href="https://www.linkedin.com/in/aam-hermansyah/" id="ql-in" rel="noopener" target="_blank" title="LinkedIn — linkedin.com/in/aam-hermansyah" />
      <a className="ql-btn" href="https://www.fiverr.com/aam_hermansyah" id="ql-fiverr" rel="noopener" target="_blank" data-tr-title="Fiverr — freelance profile" title="Fiverr — freelance profile" />
      <a className="ql-btn" href="https://wa.me/6282316126449" id="ql-wa" rel="noopener" target="_blank" title="WhatsApp — wa.me/6282316126449" />
      {/* Always in view, so a visitor who skipped the boot screen can still leave the
          desktop in one click. A plain anchor: /en is another root layout. The runtime
          points it at the visitor's language. */}
      {/* eslint-disable-next-line @next/next/no-html-link-for-pages */}
      <a className="ql-btn" data-tr-title="Simple view — the same work as a plain page" href="/en" id="ql-simple" title="Simple view — the same work as a plain page" />
    </div>
  );
}
