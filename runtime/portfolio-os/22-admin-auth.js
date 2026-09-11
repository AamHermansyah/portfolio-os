      /* =================================================================
         admin session — terminal sign-in, held in memory only
         ================================================================= */
      /* Nothing here is persisted. No cookie, no localStorage, no sessionStorage:
         a reload empties this binding and the terminal is anonymous again, which
         is the entire security model. The token itself is a stateless HMAC minted
         by the server, so whichever serverless instance handles the next command
         can verify it without ever having seen the sign-in.

         It sits at module scope rather than inside the terminal window closure so
         that closing the window does not sign you out. The rule is "reload signs
         you out", and losing a session to a stray click on the X would be a cost
         with no security to show for it. */
      let ADMIN = null;

      function adminBridge() {
        return typeof window !== 'undefined' ? window.portfolioOsAdmin : null;
      }

      function adminSignedIn() {
        return !!(ADMIN && ADMIN.expiresAt > Date.now());
      }

      /* The credential every CRUD command sends with its request. */
      function adminToken() {
        return adminSignedIn() ? ADMIN.token : null;
      }

      function adminMinutesLeft() {
        return Math.max(0, Math.round((ADMIN.expiresAt - Date.now()) / 60000));
      }

      function adminSignOut(term) {
        ADMIN = null;
        if (term) {
          term.setPrompt('C:\\PORTFOLIO>', false);
          term.api.setTitle('Terminal \u2014 fauxcmd.exe');
        }
        if (typeof adminWindowsSignedOut === 'function') adminWindowsSignedOut();
      }

      /* Called by every admin command before it does anything: a session can
         lapse mid-use, and the check is lazy so there is no timer to leak. */
      function adminEnsureSession(term) {
        if (adminSignedIn()) return true;
        if (ADMIN) {
          adminSignOut(term);
          term.print('Session expired. Type "sudo login --admin" to sign in again.', 'err');
          return false;
        }
        term.print('Not signed in. Type "sudo login --admin" first.', 'dim');
        return false;
      }

      /* The terminal has no spinner of its own, and a Neon branch that has scaled
         to zero can take a second or two to answer, so silence is not an option. */
      function termSpinner(term, label) {
        const row = document.createElement('div');
        row.className = 't-row dim';
        row.textContent = label + ' |';
        term.out.appendChild(row);
        term.out.scrollTop = term.out.scrollHeight;
        const frames = ['|', '/', '-', '\\'];
        let i = 0;
        const timer = setInterval(() => { i = (i + 1) % 4; row.textContent = label + ' ' + frames[i]; }, 120);
        term.timers.push(timer);
        return {
          stop(text, cls) {
            clearInterval(timer);
            const at = term.timers.indexOf(timer);
            if (at > -1) term.timers.splice(at, 1);
            if (text == null) row.remove();
            else { row.textContent = text; row.className = 't-row' + (cls ? ' ' + cls : ''); }
            term.out.scrollTop = term.out.scrollHeight;
          }
        };
      }

      /* Server-side failures arrive as codes, never as prose, so the wording
         lives here — the same split 12-inquiry-hire.js already uses. */
      const ADMIN_PROBLEM = {
        credentials: 'The username or password is incorrect.',
        locked: 'This account is locked for a while after repeated failed sign-ins.',
        rate_limit: 'Too many attempts from this connection. Wait a few minutes.',
        not_configured: 'Administration is not configured on this deployment.',
        setup_required: 'No administrator exists yet. Type "sudo setup --admin" to create one.',
        already_setup: 'An administrator already exists. Use "sudo login --admin", or "sudo reset --admin" if the password is lost.',
        weak_password: 'Pick a username of 3 characters or more, password of at least 10, and PIN of at least 4.',
        validation: 'Every field is required.',
        stale_build: 'This page is older than the running deployment. Reload, then sign in again.',
        network: 'The request never reached the server. Check your connection.',
        server: 'The server could not complete that. Try again shortly.'
      };

      function adminProblem(code) {
        return ADMIN_PROBLEM[code] || 'Sign-in failed (' + code + ').';
      }

      /* Appended to the help output, and empty while signed out so an ordinary
         visitor sees no trace of any of this. */
      function adminHelpText() {
        if (!adminSignedIn()) return '';
        let text = 'Administration\n' +
          '  session              show who is signed in and for how long\n' +
          '  logout               end the session\n' +
          '  passwd               change the password\n';
        if (typeof adminCrudHelpText === 'function') text += adminCrudHelpText();
        return text + '\n';
      }

      function adminWhoami() {
        if (!adminSignedIn()) return null;
        return 'PORTFOLIO\\' + ADMIN.username + ' \u2014 administrator, ' + adminMinutesLeft() + ' minutes remaining.';
      }

      function adminApplySession(term, session) {
        ADMIN = session;
        if (typeof adminWindowsSignedIn === 'function') adminWindowsSignedIn();
        term.setPrompt('C:\\PORTFOLIO\\ADMIN>', true);
        term.api.setTitle('Terminal \u2014 fauxcmd.exe [ADMIN]');
      }

      function adminWelcome(term, session, verb) {
        term.print(verb, 'ok');
        term.print('');
        term.print('Welcome back, ' + (session.displayName || session.username) + '.');
        term.print('Signed in as ' + session.username + ' \u2014 administrator. This session expires in 30');
        term.print('minutes, or the moment this page is reloaded.');
        term.print('');
        term.print('Resources available for management:');
        term.print('');
        (session.resources || []).forEach(r => {
          term.print('  ' + r.id.padEnd(15) + r.status.padEnd(10) + r.label);
        });
        term.print('');
        term.print('Type "help" for the full command reference, or "logout" to end the session.', 'dim');
        beep(880, 90);
      }

      /* Every admin request funnels through here: one busy flag, one spinner,
         one place where a closed window stops us writing into a detached DOM. */
      async function adminRequest(term, label, run) {
        const bridge = adminBridge();
        if (!bridge) {
          term.print('Administration is unavailable \u2014 the page has not finished loading.', 'err');
          return null;
        }
        term.setBusy(true);
        const spinner = termSpinner(term, label);
        hourglass(700);
        let result;
        try {
          result = await run(bridge);
        } catch {
          result = { ok: false, error: 'network' };
        }
        if (!term.alive) return null;
        term.setBusy(false);
        spinner.stop(null);
        return result;
      }

      function adminFinish(term, result, verb) {
        if (!result) return;
        if (result.ok) {
          adminApplySession(term, result.session);
          adminWelcome(term, result.session, verb);
          return;
        }
        term.print('Access denied.', 'err');
        term.print(adminProblem(result.error));
        beep(300, 170);
      }

      /* --- login ------------------------------------------------------- */
      function adminLoginFlow(term, username) {
        term.ask('Password: ', true, async password => {
          if (!password) { term.print('Cancelled.', 'dim'); return; }
          const result = await adminRequest(term, 'Authenticating', b => b.login(username, password));
          adminFinish(term, result, 'Access granted.');
        });
      }

      /* --- setup / reset ----------------------------------------------- */
      function adminPinFlow(term, mode, username) {
        if (mode === 'setup') {
          term.ask('Create recovery PIN: ', true, pin => {
            if (!pin) { term.print('Cancelled.', 'dim'); return; }
            term.ask('Confirm recovery PIN: ', true, confirmPin => {
              if (!confirmPin) { term.print('Cancelled.', 'dim'); return; }
              if (pin !== confirmPin) { term.print('The two PINs do not match. Nothing was created.', 'err'); return; }
              term.ask('New password: ', true, password => {
                if (!password) { term.print('Cancelled.', 'dim'); return; }
                term.ask('Confirm password: ', true, async confirm => {
                  if (password !== confirm) { term.print('The two passwords do not match. Nothing was changed.', 'err'); return; }
                  const result = await adminRequest(term, 'Creating account',
                    b => b.setup(username, pin, password));
                  adminFinish(term, result, 'Administrator created.');
                });
              });
            });
          });
        } else {
          term.ask('Recovery PIN: ', true, pin => {
            if (!pin) { term.print('Cancelled.', 'dim'); return; }
            term.ask('New password: ', true, password => {
              if (!password) { term.print('Cancelled.', 'dim'); return; }
              term.ask('Confirm password: ', true, async confirm => {
                if (password !== confirm) { term.print('The two passwords do not match. Nothing was changed.', 'err'); return; }
                const result = await adminRequest(term, 'Resetting password',
                  b => b.reset(username, pin, password));
                adminFinish(term, result, 'Password reset.');
              });
            });
          });
        }
      }

      /* --- passwd ------------------------------------------------------ */
      function adminPasswdFlow(term) {
        term.print('Changing the password needs the recovery PIN, the same as "sudo reset --admin".', 'dim');
        adminPinFlow(term, 'reset', ADMIN.username);
      }

      /* Returns true when the command was ours, so the terminal knows not to
         fall through to "not recognized". */
      function adminExec(command, arg, parts, term) {
        if (command === 'sudo') {
          let action = (parts[1] || '').toLowerCase();
          let flag = (parts[2] || '').toLowerCase();
          let userArg = parts[3];

          if (action === '--admin') {
            action = (parts[2] || '').toLowerCase();
            flag = '--admin';
            userArg = parts[3];
          }

          if (flag !== '--admin') return false;

          switch (action) {
            case 'login': {
              if (adminSignedIn()) {
                term.print('Already signed in as ' + ADMIN.username + '. Type "logout" first.', 'dim');
                return true;
              }
              /* A password on the command line lands in the scrollback and in the
                 history buffer, so the line is rewritten and the entry dropped. */
              if (parts.length > 4) {
                term.redactLast('sudo login --admin ***');
                term.print('Passwords are never typed on the command line \u2014 they end up in the', 'err');
                term.print('scrollback and in the history buffer. Type "sudo login --admin" on its own.');
                return true;
              }
              if (userArg) adminLoginFlow(term, userArg);
              else term.ask('Username: ', false, name => {
                if (!name) { term.print('Cancelled.', 'dim'); return; }
                adminLoginFlow(term, name);
              });
              return true;
            }
            case 'logout':
              if (!adminSignedIn()) { term.print('Not signed in.', 'dim'); return true; }
              adminSignOut(term);
              term.print('Session ended. The token was discarded.', 'ok');
              return true;
            case 'setup':
            case 'reset': {
              if (action === 'setup' && adminSignedIn()) {
                term.print('Already signed in. "sudo setup --admin" only creates the first administrator.', 'dim');
                return true;
              }
              if (userArg) adminPinFlow(term, action, userArg);
              else term.ask('Username: ', false, name => {
                if (!name) { term.print('Cancelled.', 'dim'); return; }
                adminPinFlow(term, action, name);
              });
              return true;
            }
            default:
              return false;
          }
        }

        switch (command) {
          case 'logout':
            if (!adminSignedIn()) { term.print('Not signed in.', 'dim'); return true; }
            adminSignOut(term);
            term.print('Session ended. The token was discarded.', 'ok');
            return true;
          case 'session':
            if (!adminSignedIn()) { term.print('Not signed in.', 'dim'); return true; }
            term.print('Signed in as ' + ADMIN.username + '. ' + adminMinutesLeft() + ' minutes remaining.');
            return true;
          case 'passwd':
            if (!adminEnsureSession(term)) return true;
            adminPasswdFlow(term);
            return true;
          default:
            /* Resource commands are claimed earlier, by adminIntercept, because
               several of their names are public commands the switch would
               otherwise have answered first. */
            return false;
        }
      }
