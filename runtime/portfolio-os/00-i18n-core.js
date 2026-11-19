/* =================================================================
         language — English is the source text, Indonesian is a dictionary
         ================================================================= */
      /* Only the windows a client actually uses are translated (Hire_Me, Contact,
         Resume and the success dialogs). The English text stays at the call site
         as the lookup key, so reading a window still reads English, and a string
         with no entry in the dictionary simply shows in English.

         The language comes from ?lang= (the Simple view links here with it), then
         from the visitor's last choice, then defaults to English. Changing it
         reloads the page: every open window would otherwise keep the old language.

         Stored values never go through this. Hire_Me still saves "Freelance /
         contract project" to the database whichever language the wizard was shown
         in, so the Mailbox and the terminal read the same words either way. */
      const LANG_KEY = 'portfolioos.lang';
      const LANGUAGES = [
        { id: 'en', label: 'English' },
        { id: 'id', label: 'Bahasa Indonesia' }
      ];
      const ID_STRINGS = {};

      function detectLang() {
        try {
          const asked = new URLSearchParams(location.search).get('lang');
          if (LANGUAGES.some(l => l.id === asked)) { localStorage.setItem(LANG_KEY, asked); return asked; }
          const saved = localStorage.getItem(LANG_KEY);
          if (LANGUAGES.some(l => l.id === saved)) return saved;
        } catch { }
        return 'en';
      }
      const LANG = detectLang();
      document.documentElement.lang = LANG;

      /* tr(text, { name }) fills a {name} placeholder after the lookup. */
      function tr(text, vars) {
        let out = LANG !== 'en' && ID_STRINGS[text] != null ? ID_STRINGS[text] : text;
        if (vars) out = out.replace(/\{(\w+)\}/g, (m, k) => vars[k] != null ? vars[k] : m);
        return out;
      }

      function setLang(id) {
        if (!LANGUAGES.some(l => l.id === id) || id === LANG) return;
        try { localStorage.setItem(LANG_KEY, id); } catch { }
        const url = new URL(location.href);
        url.searchParams.delete('lang');
        location.replace(url.toString());
      }

      /* The Simple view that matches the current language. */
      const simpleViewUrl = () => '/' + LANG;
