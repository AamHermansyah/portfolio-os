export function QuickLaunch() {
  return (
    <div id="qLaunch" title="Contact Me — quick launch toolbar">
      <span aria-hidden="true" className="ql-handle" />
      <button className="ql-btn" id="ql-mail" title="E-mail Alex — compose a message" type="button" />
      <a className="ql-btn" href="https://github.com/alexnovak" id="ql-git" rel="noopener" target="_blank" title="GitHub — github.com/alexnovak" />
      <a className="ql-btn" href="https://www.linkedin.com/in/alexnovak" id="ql-in" rel="noopener" target="_blank" title="LinkedIn — linkedin.com/in/alexnovak" />
      <a className="ql-btn" href="https://www.fiverr.com/alex_novak" id="ql-fiverr" rel="noopener" target="_blank" title="Fiverr — freelance profile" />
    </div>
  );
}
