      /* =================================================================
         content refresh — the Refresh commands in every public window
         ================================================================= */
      /* The page arrives with its content baked in. A Refresh asks
         GET /api/portfolio for the current copy and applies it everywhere at
         once: the lists every window reads, the open windows themselves, the
         desktop icons, the Start menu and the testimonial inbox. The terminal's
         admin writes arrive through the same applyPortfolioContent. */
      const CONTENT_ENDPOINT = '/api/portfolio';
      /* Refreshes can overlap (a click, then an admin save); only the newest
         request's snapshot is applied, so an older one never puts a deleted
         row back. */
      let contentRefreshSeq = 0;

      async function refreshPortfolioContent() {
        const seq = ++contentRefreshSeq;
        hourglass(500);
        try {
          const res = await fetch(CONTENT_ENDPOINT, {
            headers: { Accept: 'application/json' }, cache: 'no-store', signal: AbortSignal.timeout(15000)
          });
          const data = await res.json();
          if (!res.ok || !data || !data.ok || !data.content) return 'failed';
          if (seq === contentRefreshSeq) applyPortfolioContent(data.content);
          return 'ok';
        } catch {
          return 'failed';
        }
      }

      /* What a Refresh button or menu item runs: the same refresh, with a
         dialog when the server cannot be reached rather than a silent no-op. */
      async function refreshFromWindow() {
        if (await refreshPortfolioContent() === 'failed') {
          errorDialog('Refresh', 'The latest content could not be loaded.<br>Check your connection and try again.');
        }
      }

      /* The View menu every content window with a menu bar carries. */
      const REFRESH_MENU = { label: 'View', items: [{ label: 'Refresh', act: () => refreshFromWindow() }] };

      function applyPortfolioContent(content) {
        fillPortfolioContent(content);
        /* Testimonials are not in the content; they are paged from their own
           endpoint, so the inbox re-reads what it already holds. */
        resyncTestimonials();
        WM.refreshContent();
        buildStartMenu();
        refreshDesktopIcons();
      }
