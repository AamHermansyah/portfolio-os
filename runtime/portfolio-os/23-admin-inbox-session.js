      /* =================================================================
         Mailbox session — the cookie behind Mailbox.exe
         ================================================================= */
      /* The terminal session lives in a variable and dies with the page. This one
         does not: after a terminal sign-in the server sets an HttpOnly cookie
         that lets the Mailbox read Hire_Me and Contact submissions for 30 days.

         Nothing here ever holds the credential. The token is in a cookie the
         page cannot read, so all that is kept is what the server says about it:
         who it is for, when it ends, and how many submissions are unread. The
         cookie opens the Mailbox and nothing else — content editing still needs
         a fresh terminal sign-in. */
      const MAILBOX_SESSION_ENDPOINT = '/api/inbox/session';
      const MAILBOX_ENDPOINT = '/api/inbox';
      const MAILBOX_POLL_MS = 5 * 60 * 1000;
      const MAILBOX = { signedIn: false, username: '', expiresAt: 0, unread: { hire: 0, contact: 0 }, timer: null };

      const mailboxUnreadTotal = () => MAILBOX.unread.hire + MAILBOX.unread.contact;

      /* Never throws. A 401 means the cookie lapsed or was revoked (a password
         reset does that), so the app goes away instead of staying half-alive. */
      async function mailboxRequest(url, options) {
        try {
          const res = await fetch(url, Object.assign({
            credentials: 'same-origin', cache: 'no-store',
            headers: { Accept: 'application/json' }, signal: AbortSignal.timeout(15000)
          }, options));
          const data = await res.json();
          if (res.status === 401 && MAILBOX.signedIn) mailboxEnded();
          return data && typeof data === 'object' ? data : { ok: false, error: 'server' };
        } catch {
          return { ok: false, error: 'network' };
        }
      }

      function mailboxSetUnread(unread) {
        if (!unread) return;
        MAILBOX.unread = { hire: unread.hire | 0, contact: unread.contact | 0 };
        mailboxUpdateBadges();
        if (mailboxRefs) mailboxRefs.tabs();
      }

      /* The red count on the desktop icon. The icon is rebuilt whenever the
         signed-in state changes, so this runs after that as well as on every poll. */
      function mailboxUpdateBadges() {
        const n = mailboxUnreadTotal();
        const img = document.querySelector('.dicon[data-id="mailbox"] .di-img');
        if (!img) return;
        let badge = img.querySelector('.di-badge');
        if (!n) { if (badge) badge.remove(); return; }
        if (!badge) {
          badge = document.createElement('span');
          badge.className = 'di-badge';
          img.appendChild(badge);
        }
        badge.textContent = n > 9 ? '9+' : String(n);
      }

      function mailboxSetSession(info) {
        const on = !!(info && info.signedIn);
        const changed = MAILBOX.signedIn !== on;
        MAILBOX.signedIn = on;
        MAILBOX.username = on ? String(info.username || '') : '';
        MAILBOX.expiresAt = on ? Number(info.expiresAt) || 0 : 0;
        clearInterval(MAILBOX.timer);
        MAILBOX.timer = on ? setInterval(mailboxRefreshUnread, MAILBOX_POLL_MS) : null;
        if (!on) {
          MAILBOX.unread = { hire: 0, contact: 0 };
          if (WM.wins.has('mailbox')) WM.close('mailbox');
        }
        if (changed) { refreshDesktopIcons(); buildStartMenu(); }
        mailboxUpdateBadges();
      }

      /* The cookie stopped working: drop the state and clear the dead cookie. */
      function mailboxEnded() {
        mailboxSetSession(null);
        mailboxRequest(MAILBOX_SESSION_ENDPOINT, { method: 'DELETE' });
      }

      /* On every page load: is there a cookie from an earlier visit, and is it
         still good? The page itself is prerendered, so this is the only way the
         browser finds out. */
      async function mailboxCheck() {
        const data = await mailboxRequest(MAILBOX_SESSION_ENDPOINT);
        if (!data.ok) return;
        mailboxSetSession(data);
        if (data.signedIn) mailboxRefreshUnread();
      }

      /* Called by the terminal right after a successful sign-in. */
      async function mailboxStart(terminalToken) {
        const data = await mailboxRequest(MAILBOX_SESSION_ENDPOINT, {
          method: 'POST',
          headers: { Accept: 'application/json', Authorization: 'Bearer ' + terminalToken }
        });
        if (!data.ok || !data.signedIn) return false;
        mailboxSetSession(data);
        mailboxRefreshUnread();
        return true;
      }

      async function mailboxSignOut() {
        await mailboxRequest(MAILBOX_SESSION_ENDPOINT, { method: 'DELETE' });
        mailboxSetSession(null);
      }

      async function mailboxRefreshUnread() {
        if (!MAILBOX.signedIn || document.visibilityState === 'hidden') return;
        const data = await mailboxRequest(MAILBOX_ENDPOINT);
        if (data.ok) mailboxSetUnread(data.unread);
      }
