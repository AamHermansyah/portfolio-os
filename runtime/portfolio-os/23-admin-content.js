      /* =================================================================
         admin content refresh — the public windows after a terminal write
         ================================================================= */
      /* The page ships with its public content baked in, and the server keeps
         that page cached. After a create, edit or delete this asks
         /api/portfolio/refresh to regenerate it for the next visitor, and hands
         the fresh copy it returns straight to applyPortfolioContent
         (08-portfolio-sync.js), so every open window shows the change without
         a reload. Failure is quiet: the write itself already succeeded, and the
         page regenerates on its own within the hour. */
      const CONTENT_REFRESH_ENDPOINT = '/api/portfolio/refresh';

      async function adminRefreshContent() {
        const token = adminToken();
        if (!token) return;
        /* Shares the public refresh's counter, so whichever answer is newest wins. */
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
