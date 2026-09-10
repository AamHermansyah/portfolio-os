/* =================================================================
         hourglass + PC speaker beep
      ================================================================= */
      let hgT = null;
      function hourglass(ms = 420) {
        document.body.classList.add('busy');
        clearTimeout(hgT); hgT = setTimeout(() => document.body.classList.remove('busy'), ms);
      }
      let AC = null;
      function beep(freq = 740, dur = 90, vol = .035) {
        if (PREFS.muteSound) return;
        try {
          AC = AC || new (window.AudioContext || window.webkitAudioContext)();
          const o = AC.createOscillator(), g = AC.createGain();
          o.type = 'square'; o.frequency.value = freq; g.gain.value = vol;
          o.connect(g); g.connect(AC.destination); o.start();
          o.stop(AC.currentTime + dur / 1000);
        } catch { }
      }
