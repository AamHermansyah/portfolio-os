      /* =================================================================
         admin CRUD — resource commands in the terminal
         ================================================================= */
      /* Every resource is driven by the field description the server hands back,
         so nothing here knows what a certificate or a testimonial actually is.
         Adding a resource is a row in lib/admin/schema.ts, not code in this file. */

      /* Field descriptions are stable for the life of a deployment, so they are
         fetched once per resource and kept. */
      const adminSpecCache = {};

      /* Where `next` and `prev` continue from. */
      let adminLastList = null;

      function adminCrudHelpText() {
        return '  <resource>       show what can be done with it\n' +
          '  <resource> list [page]   browse, 10 per page\n' +
          '  <resource> browse [page] open the list in a window\n' +
          '  next / prev      page through the last listing\n' +
          '  <resource> view <id>     print one entry here\n' +
          '  <resource> open <id>     open one entry in a window\n' +
          '  <resource> new           create one, in a form window\n' +
          '  <resource> edit <id>     change one, in a form window\n' +
          '  <resource> delete <id>   remove one, after confirming\n' +
          '  resources        list every manageable resource\n';
      }

      function adminIsResource(name) {
        return !!(ADMIN && (ADMIN.resources || []).some(resource =>
          resource.id === name && resource.status === 'ready'));
      }

      /* Wraps a CRUD call with the session check, the spinner and the busy flag. */
      async function adminCrudCall(term, label, run) {
        if (!adminEnsureSession(term)) return null;
        const token = adminToken();
        const result = await adminRequest(term, label, bridge => run(bridge.crud, token));
        if (!result) return null;
        if (!result.ok) {
          if (result.error === 'unauthorized') {
            adminSignOut(term);
            term.print('That session is no longer valid. Type "sudo login --admin" to sign in again.', 'err');
            return null;
          }
          term.print(adminCrudProblem(result), 'err');
          return null;
        }
        return result;
      }

      /* Window actions cannot depend on the terminal remaining open. They use
         the same authorization/error rules, but report progress into the
         window that initiated the request instead of terminal scrollback. */
      async function adminCrudWindowCall(term, label, run, hooks) {
        const liveTerm = term && term.alive ? term : null;
        const report = result => {
          if (hooks && hooks.error) hooks.error(result);
          else if (liveTerm) liveTerm.print(adminCrudProblem(result), 'err');
        };

        if (!adminSignedIn()) {
          if (ADMIN) adminSignOut(liveTerm);
          report({ ok: false, error: 'unauthorized' });
          return null;
        }

        const bridge = adminBridge();
        const token = adminToken();
        if (hooks && hooks.busy) hooks.busy(true, label);
        hourglass(500);
        let result;
        try {
          result = bridge && token
            ? await run(bridge.crud, token)
            : { ok: false, error: bridge ? 'unauthorized' : 'network' };
        } catch {
          result = { ok: false, error: 'network' };
        } finally {
          if (hooks && hooks.busy) hooks.busy(false, label);
        }

        if (!result.ok) {
          if (result.error === 'unauthorized') adminSignOut(liveTerm);
          report(result);
          return null;
        }
        return result;
      }

      const ADMIN_CRUD_PROBLEM = {
        unknown_resource: 'No such resource. Type "resources" to see the list.',
        not_found: 'No entry with that id or slug.',
        missing_key: 'That command needs an id or a slug.',
        unauthorized: 'Not signed in.',
        server: 'The server could not complete that. Try again shortly.',
        network: 'The request never reached the server. Check your connection.',
        stale_build: 'This page is older than the running deployment. Reload, then sign in again.'
      };

      function adminCrudProblem(result) {
        const known = ADMIN_CRUD_PROBLEM[result.error];
        if (known) return known;
        /* Validation failures arrive as a plain sentence plus the field name. */
        return result.field ? result.error + ' (' + result.field + ')' : String(result.error);
      }

      async function adminSpec(term, resource, hooks) {
        if (adminSpecCache[resource]) return adminSpecCache[resource];
        const run = (crud, token) => crud.info(token, resource);
        const result = hooks
          ? await adminCrudWindowCall(term, 'Loading ' + resource, run, hooks)
          : await adminCrudCall(term, 'Loading ' + resource, run);
        if (!result) return null;
        adminSpecCache[resource] = result.resource;
        return result.resource;
      }

      /* --- shared rendering -------------------------------------------- */

      function adminCell(row, field, width) {
        let value = row[field];
        if (value === null || value === undefined) value = '';
        else if (Array.isArray(value)) value = value.length + ' item' + (value.length === 1 ? '' : 's');
        else if (typeof value === 'boolean') value = value ? 'yes' : 'no';
        else value = String(value);
        if (field === 'createdAt' || field === 'readAt' || field === 'updatedAt') value = adminShortDate(value);
        if (value.length > width) value = value.slice(0, Math.max(1, width - 1)) + '…';
        return value.padEnd(width);
      }

      function adminShortDate(value) {
        if (!value) return '';
        const at = new Date(value);
        if (isNaN(at.getTime())) return String(value);
        const pad = n => String(n).padStart(2, '0');
        return at.getFullYear() + '-' + pad(at.getMonth() + 1) + '-' + pad(at.getDate()) +
          ' ' + pad(at.getHours()) + ':' + pad(at.getMinutes());
      }

      function adminHandle(row) {
        return String(row.slug || row.id || '');
      }

      /* --- list --------------------------------------------------------- */

      async function adminCrudList(term, resource, page) {
        const result = await adminCrudCall(term, 'Loading ' + resource,
          (crud, token) => crud.list(token, resource, page, 10));
        if (!result) return;

        adminLastList = { resource, page: result.page, pages: result.pages };
        const columns = result.columns || [];
        term.print('');
        term.print(result.label.toUpperCase() + ' — page ' + result.page + ' of ' + result.pages +
          ' (' + result.total + ' entr' + (result.total === 1 ? 'y' : 'ies') + ')', 'hdr');
        term.print('');

        if (result.total === 0) {
          term.print(result.readOnly
            ? '  No submissions have arrived yet.'
            : '  Nothing here yet. Type "' + resource + ' new" to add the first entry.', 'dim');
          term.print('');
          return;
        }

        /* The handle column is never truncated. It is what every other command
           takes as an argument, and a shortened cuid is not an identifier — it
           is a dead end. Alignment gives way to being able to copy it. */
        const handleWidth = Math.max(4, ...result.rows.map(row => adminHandle(row).length));
        const head = 'ID'.padEnd(handleWidth) + '  ' + columns.map(c => c.header.padEnd(c.width)).join('  ');
        term.print(head, 'hdr');
        term.print('-'.repeat(Math.min(head.length, 110)), 'dim');
        result.rows.forEach(row => {
          term.print(adminHandle(row).padEnd(handleWidth) + '  ' +
            columns.map(c => adminCell(row, c.field, c.width)).join('  '));
        });
        term.print('');
        if (result.pages > 1) {
          term.print('  "next" and "prev" move between pages, or "' + resource + ' list <page>".', 'dim');
        }
        term.print('  "' + resource + ' view <id>" prints one, "' + resource + ' open <id>" opens a window.', 'dim');
        term.print('');
      }

      function adminCrudPage(term, delta) {
        if (!adminLastList) {
          term.print('Nothing has been listed yet. Try "certificates list".', 'dim');
          return;
        }
        const next = adminLastList.page + delta;
        if (next < 1) { term.print('Already at the first page.', 'dim'); return; }
        if (next > adminLastList.pages) { term.print('Already at the last page.', 'dim'); return; }
        adminCrudList(term, adminLastList.resource, next);
      }

      /* --- view in the terminal ---------------------------------------- */

      async function adminCrudView(term, resource, key) {
        const result = await adminCrudCall(term, 'Loading entry', (crud, token) => crud.get(token, resource, key));
        if (!result) return;

        const row = result.row;
        term.print('');
        term.print(result.label.toUpperCase() + ' — ' + adminHandle(row), 'hdr');
        term.print('');

        /* Read-only inboxes have no field description, so everything stored is
           shown; authored resources follow the declared field order. */
        const order = (result.fields && result.fields.length)
          ? result.fields.map(f => ({ name: f.name, label: f.label }))
          : Object.keys(row).filter(k => k !== 'id').map(k => ({ name: k, label: k }));

        order.forEach(entry => {
          const value = row[entry.name];
          if (value === null || value === undefined || value === '') return;
          if (Array.isArray(value)) {
            if (!value.length) return;
            term.print('  ' + (entry.label + ':').padEnd(20));
            value.forEach(item => term.print('    • ' + item));
            return;
          }
          let text = typeof value === 'boolean' ? (value ? 'yes' : 'no') : String(value);
          if (entry.name === 'createdAt' || entry.name === 'updatedAt' || entry.name === 'readAt') {
            text = adminShortDate(text);
          }
          /* Long prose wraps rather than running off the side of the window. */
          if (text.length > 58) {
            term.print('  ' + (entry.label + ':').padEnd(20));
            adminWrap(text, 66).forEach(line => term.print('    ' + line));
            return;
          }
          term.print('  ' + (entry.label + ':').padEnd(20) + text);
        });
        term.print('');
        term.print('  id: ' + row.id, 'dim');
        term.print('');
      }

      function adminWrap(text, width) {
        const words = String(text).split(/\s+/);
        const lines = [];
        let line = '';
        words.forEach(word => {
          if (!line.length) { line = word; return; }
          if ((line + ' ' + word).length > width) { lines.push(line); line = word; }
          else line += ' ' + word;
        });
        if (line.length) lines.push(line);
        return lines;
      }

      /* --- the per-resource menu --------------------------------------- */

      async function adminResourceMenu(term, resource) {
        const spec = await adminSpec(term, resource);
        if (!spec) return;
        term.print('');
        term.print(spec.label.toUpperCase() + (spec.readOnly ? ' (read only)' : ''), 'hdr');
        term.print('');
        term.print('  ' + resource + ' list [page]   browse entries, 10 per page');
        term.print('  ' + resource + ' browse [page] open entries in a window');
        term.print('  ' + resource + ' view <id>     print one entry in this terminal');
        term.print('  ' + resource + ' open <id>     open one entry in a window');
        if (!spec.readOnly) {
          term.print('  ' + resource + ' new           create one, in a form window');
          term.print('  ' + resource + ' edit <id>     change one, in a form window');
        }
        term.print('  ' + resource + ' delete <id>   remove one, after confirming');
        term.print('');
        if (spec.readOnly) {
          term.print('  Submissions arrive through the site; they cannot be authored here.', 'dim');
        }
        term.print('  The visitor-facing window is still "open ' + resource + '".', 'dim');
        term.print('');
      }

      function adminResourceList(term) {
        term.print('');
        term.print('MANAGEABLE RESOURCES', 'hdr');
        term.print('');
        (ADMIN && ADMIN.resources ? ADMIN.resources : []).forEach(r => {
          term.print('  ' + r.id.padEnd(15) + r.label);
        });
        term.print('');
        term.print('  Type a resource name on its own to see what it can do.', 'dim');
        term.print('');
      }

      /* --- delete ------------------------------------------------------- */

      async function adminCrudDelete(term, resource, key) {
        const found = await adminCrudCall(term, 'Loading entry', (crud, token) => crud.get(token, resource, key));
        if (!found) return;
        adminConfirmDelete(term, resource, found.row, found.label);
      }

      /* --- dispatch ----------------------------------------------------- */

      /* Runs before the terminal's own command switch. Everything it claims is
         claimed only while signed in, so a visitor sees the original terminal
         exactly as it was. */
      function adminIntercept(command, arg, parts, term) {
        if (!adminSignedIn()) return false;

        if (command === 'resources') { adminResourceList(term); return true; }
        if (command === 'next' || command === 'prev') {
          adminCrudPage(term, command === 'next' ? 1 : -1);
          return true;
        }
        if (!adminIsResource(command)) return false;

        const operation = (parts[1] || '').toLowerCase();
        const key = parts.slice(2).join(' ').trim();

        if (!operation) { adminResourceMenu(term, command); return true; }

        switch (operation) {
          case 'list':
            adminCrudList(term, command, Number(parts[2]) || 1);
            return true;
          case 'browse':
          case 'window':
            adminOpenList(term, command, Number(parts[2]) || 1);
            return true;
          case 'view':
            if (!key) { term.print('Which one? Try "' + command + ' view <id>".', 'err'); return true; }
            adminCrudView(term, command, key);
            return true;
          case 'open':
            if (!key) { term.print('Which one? Try "' + command + ' open <id>".', 'err'); return true; }
            adminOpenRecord(term, command, key);
            return true;
          case 'new':
          case 'create':
            adminOpenForm(term, command, null);
            return true;
          case 'edit':
          case 'update':
            if (!key) { term.print('Which one? Try "' + command + ' edit <id>".', 'err'); return true; }
            adminOpenForm(term, command, key);
            return true;
          case 'delete':
          case 'remove':
            if (!key) { term.print('Which one? Try "' + command + ' delete <id>".', 'err'); return true; }
            adminCrudDelete(term, command, key);
            return true;
          default:
            term.print('Unknown operation "' + operation + '". Type "' + command + '" on its own for the list.', 'err');
            return true;
        }
      }
