export function BootScreen() {
  return (
    <div id="boot">
      <pre id="bootlog" />
      <div id="splash" style={{ display: "none" }}>
        <div className="sp-box">
          <div className="sp-title">PortfolioOS<span>®</span> 98</div>
          <div className="sp-sub">Second Edition — for developers</div>
          <div className="sp-bar"><div className="sp-fill" /></div>
          <div className="sp-note">please wait while skill files are copied</div>
        </div>
      </div>
      <div className="boot-skip" id="bootskip">any key fast-forwards · ENTER continues</div>
    </div>
  );
}
