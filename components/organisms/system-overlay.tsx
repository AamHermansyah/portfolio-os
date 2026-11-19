export function SystemOverlay() {
  return (
    <>
      <div id="bsod">
        <div className="bs-in">
          <div className="bs-band">PortfolioOS</div>
          <p data-tr="">A problem has been detected and PortfolioOS has been shut down to prevent damage to your career.</p>
          <p>CRITICAL_EASTER_EGG_FAILURE</p>
          <p data-tr="">If you are reading this, you have found a hidden feature. Congratulations. No files were harmed — the files were never real to begin with.</p>
          <p>
            <span data-tr="">Technical information:</span><br />
            *** STOP: 0x0000CAFE (0xDEADBEEF, 0xC0FFEE00, 0x00000042)<br />
            *** REACT.DLL — Address 0x0001ABCD base at 0x00000000, DateStamp 03-14-2025
          </p>
          <p className="bs-press">
            <span data-tr="">Press any key or click to continue</span> <span className="bs-cur">_</span>
          </p>
        </div>
      </div>
      <div id="off">
        <div>
          <div className="off-t">
            <span data-tr="">It&apos;s now safe to turn off</span><br />
            <span data-tr="">your portfolio.</span>
          </div>
          <div className="off-s" data-tr="">( click anywhere to power it back on )</div>
        </div>
      </div>
    </>
  );
}
