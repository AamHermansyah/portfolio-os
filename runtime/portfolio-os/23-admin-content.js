      /* =================================================================
         admin content refresh — the public windows after a terminal write
         ================================================================= */
      /* The page ships with its public content baked in, and the server keeps
         that page cached. After a create, edit or delete this asks
         /api/portfolio/refresh to regenerate it for the next visitor, and hands
         the fresh copy it returns straight to this tab, so the change shows
         without a reload. Failure is quiet: the write itself already succeeded,
         and the page regenerates on its own within the hour. */
      const CONTENT_REFRESH_ENDPOINT = '/api/portfolio/refresh';
      /* Two quick saves can answer out of order; only the newest request's
         snapshot is applied, so an older one never puts a deleted row back. */
      let contentRefreshSeq = 0;

      async function adminRefreshContent() {
        const token = adminToken();
        if (!token) return;
        const seq = ++contentRefreshSeq;
        try {
          const res = await fetch(CONTENT_REFRESH_ENDPOINT, {
            method: 'POST',
            headers: { Accept: 'application/json', Authorization: 'Bearer ' + token }
          });
          const data = await res.json();
          if (seq !== contentRefreshSeq) return;
          if (res.ok && data && data.ok && data.content) applyPortfolioContent(data.content);
        } catch { }
      }

      function applyPortfolioContent(content) {
        fillPortfolioContent(content);
        /* Testimonials are not in the content; they are paged from their own
           endpoint, so the inbox re-reads what it already holds. */
        resyncTestimonials();

        /* Explorer windows re-read their list on refresh; every other window
           picks the new content up the next time it opens. */
        ['projects', 'certs', 'experience', 'education'].forEach(id => {
          const win = WM.wins.get(id);
          if (win && win.api.refresh) win.api.refresh();
        });
        buildStartMenu();
        refreshDesktopIcons();
      }
