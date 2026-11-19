/* =================================================================
         Simple view and language — the ways out of the desktop
         ================================================================= */
      /* The desktop is the point of this site, but not every visitor wants to
         learn a fake operating system: a client on a phone, a recruiter with
         thirty tabs open. /en and /id are the same work as an ordinary page, and
         these are the doors to it. Nothing here redirects anyone — it only offers. */
      const SIMPLE_HINT_KEY = 'portfolioos.simplehint';

      function openSimpleView() { location.assign(simpleViewUrl()); }

      const otherLanguage = () => LANGUAGES.find(l => l.id !== LANG);
      function switchLanguage() { setLang(otherLanguage().id); }

      /* Offered once, and only where the desktop is a poor fit: a narrow screen or
         a touch device. Showing it counts as having asked, so it never nags. */
      function suggestSimpleView() {
        let asked = false;
        try { asked = localStorage.getItem(SIMPLE_HINT_KEY) === '1'; } catch { }
        if (asked || !matchMedia('(max-width:640px), (pointer:coarse)').matches) return;
        const remember = () => { try { localStorage.setItem(SIMPLE_HINT_KEY, '1'); } catch { } };
        /* Long enough for the boot sequence to be over. */
        setTimeout(() => {
          remember();
          showToast({
            title: tr('Simple view'), icon: svg('globe', 14),
            html: `<b>${esc(tr('Short on screen space?'))}</b><div class="t-prev">${esc(tr('The desktop works best on a large screen. The Simple view shows the same work as an ordinary page.'))}</div>`,
            foot: esc(tr('tap to open — this will not show again')),
            onClick: openSimpleView
          });
        }, 9000);
      }
