/* =================================================================
         static shell — translate the server-rendered text at load
         ================================================================= */
      /* The server always renders English; the language is only known here. An
         element marked data-tr has its text translated, data-tr-title its tooltip
         and data-tr-label its aria-label. The attribute value is the English key;
         when it is empty the element's current English text (or attribute) is the
         key. Leaf elements only: a data-tr element's children are replaced. */
      function translateStaticDom() {
        if (LANG === 'en') return;
        for (const el of document.querySelectorAll('[data-tr]')) {
          const key = el.getAttribute('data-tr') || el.textContent.trim();
          if (key) el.textContent = tr(key);
        }
        for (const [data, attr] of [['data-tr-title', 'title'], ['data-tr-label', 'aria-label']]) {
          for (const el of document.querySelectorAll('[' + data + ']')) {
            const key = el.getAttribute(data) || el.getAttribute(attr);
            if (key) el.setAttribute(attr, tr(key));
          }
        }
      }
