export function QuickLaunch() {
  return (
    <div id="qLaunch" title="Contact Me — quick launch toolbar">
      <span aria-hidden="true" className="ql-handle" />
      <button className="ql-btn" id="ql-mail" title="E-mail Aam — compose a message" type="button" />
      <a className="ql-btn" href="https://github.com/AamHermansyah" id="ql-git" rel="noopener" target="_blank" title="GitHub — github.com/AamHermansyah" />
      <a className="ql-btn" href="https://www.linkedin.com/in/aam-hermansyah/" id="ql-in" rel="noopener" target="_blank" title="LinkedIn — linkedin.com/in/aam-hermansyah" />
      <a className="ql-btn" href="https://www.fiverr.com/aam_hermansyah" id="ql-fiverr" rel="noopener" target="_blank" title="Fiverr — freelance profile" />
    </div>
  );
}
