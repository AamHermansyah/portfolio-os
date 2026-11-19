/* =================================================================
         init
      ================================================================= */
      translateStaticDom();
      applyPrefs();
      restoreWallpaper();
      buildSky();
      buildIcons();
      buildStartMenu();
      updateTrayBadge();
      mailboxCheck();
      const bootSimple = $('#bootsimple');
      if (bootSimple) {
        bootSimple.href = simpleViewUrl();
        bootSimple.textContent = tr('Simple view') + ' →';
        /* The boot screen advances on any pointer press; this link should only leave. */
        bootSimple.addEventListener('pointerdown', e => e.stopPropagation());
      }
      suggestSimpleView();
      $('#ql-mail').innerHTML = svg('mail', 14);
      $('#ql-mail').addEventListener('click', openContact);
      $('#ql-git').innerHTML = svg('github', 14);
      $('#ql-in').innerHTML = svg('linkedin', 14);
      $('#ql-fiverr').innerHTML = svg('globe', 14);
      $('#ql-wa').innerHTML = svg('whatsapp', 14);
      const qlSimple = $('#ql-simple');
      if (qlSimple) { qlSimple.innerHTML = svg('txt', 14); qlSimple.href = simpleViewUrl(); }
      boot();
