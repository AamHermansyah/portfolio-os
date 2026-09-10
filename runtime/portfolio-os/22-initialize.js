/* =================================================================
         init
      ================================================================= */
      applyPrefs();
      restoreWallpaper();
      buildSky();
      buildIcons();
      buildStartMenu();
      updateTrayBadge();
      $('#ql-mail').innerHTML = svg('mail', 14);
      $('#ql-mail').addEventListener('click', openContact);
      $('#ql-git').innerHTML = svg('github', 14);
      $('#ql-in').innerHTML = svg('linkedin', 14);
      $('#ql-fiverr').innerHTML = svg('globe', 14);
      boot();
