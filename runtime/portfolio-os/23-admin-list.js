      /* =================================================================
         admin CRUD — resource list windows
         ================================================================= */
      /* One generic Windows 98-style browser for every registered resource.
         Columns and permissions come from the server schema; stored values are
         always assigned with textContent so authored content is never parsed. */

      const adminListWindows = new Map();

      function adminWindowsSignedOut() {
        adminListWindows.forEach(state => {
          state.locked = true;
          state.busy = false;
          state.rows = [];
          state.selectedRow = null;
          state.selectedId = null;
          adminListRender(state);
          adminListShowMessage(state, 'Session ended. Sign in again to continue.', 'error');
          state.api.status[0].textContent = 'Session ended';
          state.api.status[1].textContent = '';
          adminListUpdateActions(state);
        });
        [...WM.wins.keys()]
          .filter(id => /^adm-(view|form|delete)-/.test(id))
          .forEach(id => WM.close(id));
      }

      function adminWindowsSignedIn() {
        adminListWindows.forEach(state => {
          state.locked = false;
          adminListLoad(state, state.page || 1);
        });
      }

      function adminListShowMessage(state, text, kind) {
        if (state.closed) return;
        state.message.textContent = text || '';
        state.message.dataset.kind = kind || '';
        state.message.hidden = !text;
      }

      function adminListSetBusy(state, active, label) {
        if (state.closed) return;
        state.busy = active;
        state.body.classList.toggle('busy', active);
        if (active) {
          adminListShowMessage(state, label + '...', 'busy');
          state.api.status[0].textContent = label + '...';
        } else if (state.message.dataset.kind === 'busy') {
          adminListShowMessage(state, '', '');
          state.api.status[0].textContent = 'Ready';
        }
        adminListUpdateActions(state);
      }

      function adminListHooks(state) {
        return {
          busy(active, label) {
            adminListSetBusy(state, active, label);
          },
          error(problem) {
            adminListShowMessage(state, adminCrudProblem(problem), 'error');
            state.api.status[0].textContent = 'Request failed';
            beep(300, 140);
          }
        };
      }

      function adminListValue(row, field) {
        const value = row[field];
        if (value === null || value === undefined) return '';
        if (Array.isArray(value)) return value.length + ' item' + (value.length === 1 ? '' : 's');
        if (typeof value === 'boolean') return value ? 'yes' : 'no';
        if (field === 'createdAt' || field === 'updatedAt' || field === 'readAt') {
          return adminShortDate(value);
        }
        return String(value);
      }

      function adminListUpdateActions(state) {
        if (!state.body) return;
        const blocked = state.busy || state.locked;
        const selected = !!state.selectedRow;
        const setDisabled = (action, disabled) => {
          const button = state.body.querySelector('[data-a="' + action + '"]');
          if (button) button.disabled = disabled;
        };
        setDisabled('create', blocked);
        setDisabled('detail', blocked || !selected);
        setDisabled('edit', blocked || !selected);
        setDisabled('delete', blocked || !selected);
        setDisabled('refresh', blocked);
        setDisabled('prev', blocked || state.page <= 1);
        setDisabled('next', blocked || state.page >= state.pages);
        state.body.querySelectorAll('[data-row-action]').forEach(button => {
          button.disabled = blocked;
        });
      }

      function adminListSelect(state, row, element, focus) {
        state.selectedRow = row || null;
        state.selectedId = row ? String(row.id) : null;
        state.body.querySelectorAll('.adm-grid-row').forEach(candidate => {
          const selected = candidate === element;
          candidate.classList.toggle('selected', selected);
          candidate.setAttribute('aria-selected', String(selected));
          candidate.tabIndex = selected ? 0 : -1;
        });
        if (focus && element) element.focus();
        adminListUpdateActions(state);
      }

      function adminListSelected(state) {
        if (state.locked) {
          adminListShowMessage(state, 'Session ended. Sign in again to continue.', 'error');
          return null;
        }
        if (state.selectedRow) return state.selectedRow;
        adminListShowMessage(state, 'Select an entry first.', 'info');
        beep(300, 70);
        return null;
      }

      function adminListOpenDetail(state, row) {
        const selected = row || adminListSelected(state);
        if (!selected) return;
        adminOpenRecord(state.term, state.resource, String(selected.id), {
          requestHooks: adminListHooks(state)
        });
      }

      function adminListOpenForm(state, row) {
        if (state.spec.readOnly) return;
        const selected = row === null ? null : (row || adminListSelected(state));
        if (row !== null && !selected) return;
        adminOpenForm(state.term, state.resource, selected ? String(selected.id) : null, {
          requestHooks: adminListHooks(state),
          onSaved(saved, editing) {
            state.selectedId = String(saved.id);
            adminListLoad(state, editing ? state.page : 1,
              (editing ? 'Updated ' : 'Created ') + adminHandle(saved) + '.');
          }
        });
      }

      function adminListDelete(state, row) {
        const selected = row || adminListSelected(state);
        if (!selected) return;
        adminConfirmDelete(state.term, state.resource, selected, state.spec.label, {
          onDeleted(deleted) {
            state.selectedId = null;
            state.selectedRow = null;
            adminListLoad(state, state.page, 'Deleted ' + adminHandle(deleted) + '.');
          }
        });
      }

      function adminListActionButton(label, action) {
        const button = document.createElement('button');
        button.type = 'button';
        button.className = 'btn sm';
        button.textContent = label;
        button.dataset.rowAction = action;
        return button;
      }

      function adminListRender(state) {
        const tbody = state.body.querySelector('.adm-grid-body');
        tbody.textContent = '';

        if (!state.rows.length) {
          const row = document.createElement('tr');
          const cell = document.createElement('td');
          cell.className = 'adm-grid-empty';
          cell.colSpan = state.spec.columns.length + 2;
          cell.textContent = state.locked
            ? 'Session ended. Sign in again to load this resource.'
            : state.spec.readOnly
            ? 'No submissions have arrived yet.'
            : 'Nothing here yet. Use Create to add the first entry.';
          row.appendChild(cell);
          tbody.appendChild(row);
          adminListSelect(state, null, null, false);
          return;
        }

        let selectedElement = null;
        let selectedRow = null;
        state.rows.forEach(row => {
          const element = document.createElement('tr');
          element.className = 'adm-grid-row';
          element.tabIndex = -1;
          element.setAttribute('aria-selected', 'false');

          const handle = document.createElement('td');
          handle.className = 'adm-grid-handle';
          handle.textContent = adminHandle(row);
          handle.title = adminHandle(row);
          element.appendChild(handle);

          state.spec.columns.forEach(column => {
            const cell = document.createElement('td');
            const text = adminListValue(row, column.field);
            cell.textContent = text;
            cell.title = text;
            element.appendChild(cell);
          });

          const actions = document.createElement('td');
          actions.className = 'adm-grid-actions';
          actions.appendChild(adminListActionButton('Detail', 'detail'));
          if (!state.spec.readOnly) actions.appendChild(adminListActionButton('Edit', 'edit'));
          actions.appendChild(adminListActionButton('Delete', 'delete'));
          element.appendChild(actions);

          element.addEventListener('click', event => {
            adminListSelect(state, row, element, !event.target.closest('button'));
          });
          element.addEventListener('dblclick', event => {
            if (!event.target.closest('button')) adminListOpenDetail(state, row);
          });
          actions.addEventListener('click', event => {
            const button = event.target.closest('[data-row-action]');
            if (!button) return;
            event.stopPropagation();
            adminListSelect(state, row, element, false);
            if (button.dataset.rowAction === 'detail') adminListOpenDetail(state, row);
            if (button.dataset.rowAction === 'edit') adminListOpenForm(state, row);
            if (button.dataset.rowAction === 'delete') adminListDelete(state, row);
          });
          element.addEventListener('keydown', event => adminListKeydown(state, element, event));
          tbody.appendChild(element);

          if (String(row.id) === state.selectedId) {
            selectedElement = element;
            selectedRow = row;
          }
        });
        if (!selectedElement) {
          selectedElement = tbody.querySelector('.adm-grid-row');
          selectedRow = state.rows[0];
        }
        adminListSelect(state, selectedRow, selectedElement, false);
      }

      function adminListKeydown(state, element, event) {
        if (state.locked || event.target.closest('button')) return;
        const rows = [...state.body.querySelectorAll('.adm-grid-row')];
        const at = rows.indexOf(element);
        if (event.key === 'ArrowDown' || event.key === 'ArrowUp') {
          event.preventDefault();
          const delta = event.key === 'ArrowDown' ? 1 : -1;
          const next = rows[Math.min(rows.length - 1, Math.max(0, at + delta))];
          if (next) next.click();
          return;
        }
        if (event.key === 'Enter') {
          event.preventDefault();
          adminListOpenDetail(state);
        }
        if (event.key === 'Delete') {
          event.preventDefault();
          adminListDelete(state);
        }
      }

      async function adminListLoad(state, page, notice) {
        if (state.closed || state.busy || state.locked) return;
        const result = await adminCrudWindowCall(state.term, 'Loading ' + state.resource,
          (crud, token) => crud.list(token, state.resource, page, 10), adminListHooks(state));
        if (!result || state.closed || state.locked || !adminSignedIn()) return;

        state.rows = result.rows || [];
        state.page = result.page;
        state.pages = result.pages;
        state.total = result.total;
        adminListRender(state);
        state.body.querySelector('.adm-page-label').textContent =
          'Page ' + state.page + ' of ' + state.pages;
        state.api.status[0].textContent = 'Ready';
        state.api.status[1].textContent = state.total + ' entr' + (state.total === 1 ? 'y' : 'ies');
        if (notice) adminListShowMessage(state, notice, 'success');
        else adminListShowMessage(state, '', '');
        adminListUpdateActions(state);
      }

      async function adminOpenList(term, resource, page) {
        const existing = adminListWindows.get(resource);
        if (existing && !existing.closed) {
          existing.term = term;
          existing.api.focus();
          adminListLoad(existing, page || existing.page);
          return;
        }

        const spec = await adminSpec(term, resource);
        if (!spec) return;
        const state = {
          api: null, body: null, message: null, term, resource, spec,
          rows: [], selectedRow: null, selectedId: null,
          page: 1, pages: 1, total: 0, busy: false, locked: false, closed: false
        };

        WM.create({
          id: 'adm-list-' + resource,
          title: spec.label + ' — Administration',
          icon: svg('folder', 14), w: 760, h: 470,
          status: ['Loading...', '0 entries'],
          onClose() {
            state.closed = true;
            adminListWindows.delete(resource);
          },
          build(body, api) {
            state.body = body;
            state.api = api;
            body.className = 'win-body app-adm adm-list-shell';
            body.innerHTML =
              '<div class="adm-head">' + esc(spec.label) + (spec.readOnly ? ' — read only' : '') + '</div>' +
              '<div class="adm-toolbar" role="toolbar" aria-label="Resource actions">' +
              (spec.readOnly ? '' : '<button class="btn sm" data-a="create">Create</button>') +
              '<button class="btn sm" data-a="detail">Detail</button>' +
              (spec.readOnly ? '' : '<button class="btn sm" data-a="edit">Edit</button>') +
              '<button class="btn sm" data-a="delete">Delete</button>' +
              '<span class="adm-toolbar-spacer"></span>' +
              '<button class="btn sm" data-a="refresh">Refresh</button></div>' +
              '<div class="adm-list-message" role="status" aria-live="polite" hidden></div>' +
              '<div class="adm-grid-wrap"><table class="adm-grid"><thead><tr class="adm-grid-head"></tr></thead>' +
              '<tbody class="adm-grid-body"></tbody></table></div>' +
              '<div class="adm-pager"><button class="btn sm" data-a="prev">&lt; Previous</button>' +
              '<span class="adm-page-label">Page 1 of 1</span>' +
              '<button class="btn sm" data-a="next">Next &gt;</button></div>';
            state.message = body.querySelector('.adm-list-message');

            const head = body.querySelector('.adm-grid-head');
            ['ID'].concat(spec.columns.map(column => column.header), ['ACTIONS']).forEach(label => {
              const cell = document.createElement('th');
              cell.scope = 'col';
              cell.textContent = label;
              head.appendChild(cell);
            });

            const action = name => body.querySelector('[data-a="' + name + '"]');
            if (action('create')) action('create').addEventListener('click', () => adminListOpenForm(state, null));
            action('detail').addEventListener('click', () => adminListOpenDetail(state));
            if (action('edit')) action('edit').addEventListener('click', () => adminListOpenForm(state));
            action('delete').addEventListener('click', () => adminListDelete(state));
            action('refresh').addEventListener('click', () => adminListLoad(state, state.page));
            action('prev').addEventListener('click', () => adminListLoad(state, state.page - 1));
            action('next').addEventListener('click', () => adminListLoad(state, state.page + 1));

            adminListWindows.set(resource, state);
            adminListUpdateActions(state);
            adminListLoad(state, page || 1);
          }
        });
      }
