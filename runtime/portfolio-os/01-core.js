/* =================================================================
         helpers
      ================================================================= */
      const $ = s => document.querySelector(s);
      const esc = s => String(s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
      const wait = ms => new Promise(r => setTimeout(r, ms));
      const clamp = (v, a, b) => Math.min(Math.max(v, a), b);
      const COARSE = matchMedia('(pointer:coarse)').matches;
      const DESK = $('#desktop'), TABS = $('#tabs');
      const WALLPAPER_KEY = 'portfolioos.wallpaper';
      const WALLPAPERS = [
        { id: 'classic', name: 'Classic Teal', desc: 'Simple, quiet, unmistakably Windows 98.' },
        { id: 'cloud', name: 'Cloud 98', desc: 'Bright blue sky with soft retro clouds.' },
        { id: 'blueprint', name: 'Blueprint', desc: 'A precise cobalt engineering grid.' },
        { id: 'aurora', name: 'Aurora', desc: 'Deep midnight gradients with neon light.' },
        { id: 'synth', name: 'Synthwave', desc: 'Neon sunset, mountains and a moving grid.' },
        { id: 'star', name: 'Orbit', desc: 'The original interactive Moon and Jupiter.' },
        { id: 'hacker', name: 'Hacker Terminal', desc: 'Live commands typed with real terminal output.' }
      ];
      const WALLPAPER_CLASSES = WALLPAPERS.map(w => 'wall-' + w.id);
      function wallpaperById(id) { return WALLPAPERS.find(w => w.id === id); }
      function currentWallpaper() { return WALLPAPERS.find(w => document.body.classList.contains('wall-' + w.id)) || WALLPAPERS[0]; }
      function setWallpaper(id, persist = true) {
        const wall = wallpaperById(id) || WALLPAPERS[0];
        document.body.classList.remove(...WALLPAPER_CLASSES);
        document.body.classList.add('wall-' + wall.id);
        document.querySelectorAll('.wp-card').forEach(card => {
          const active = card.dataset.wall === wall.id;
          card.classList.toggle('active', active);
          card.setAttribute('aria-pressed', String(active));
        });
        if (persist) { try { localStorage.setItem(WALLPAPER_KEY, wall.id); } catch { } }
        return wall;
      }
      function restoreWallpaper() {
        let saved = '';
        try { saved = localStorage.getItem(WALLPAPER_KEY) || ''; } catch { }
        setWallpaper(wallpaperById(saved) ? saved : currentWallpaper().id, false);
      }
