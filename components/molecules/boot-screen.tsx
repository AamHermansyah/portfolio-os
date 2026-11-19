export function BootScreen() {
  return (
    <div id="boot">
      <pre id="bootlog" />
      <div id="splash" style={{ display: "none" }}>
        <div className="sp-box">
          <div className="sp-title">PortfolioOS<span>®</span> 98</div>
          <div className="sp-sub" data-tr="">Second Edition — for developers</div>
          <div className="sp-bar"><div className="sp-fill" /></div>
          <div className="sp-note" data-tr="">please wait while skill files are copied</div>
        </div>
      </div>
      {/* A plain anchor on purpose: /en is a different root layout, so reaching it is
          a full page load that <Link> could only prefetch in vain. */}
      {/* eslint-disable-next-line @next/next/no-html-link-for-pages */}
      <a className="boot-simple" href="/en" id="bootsimple">Simple view →</a>
      <div className="boot-skip" id="bootskip">any key fast-forwards · ENTER continues</div>
    </div>
  );
}
