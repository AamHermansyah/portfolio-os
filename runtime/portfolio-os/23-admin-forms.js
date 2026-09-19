      /* =================================================================
         admin CRUD — form and record windows
         ================================================================= */
      /* The terminal handles browsing; anything that writes opens a window, so a
         fifteen-field record is filled in one visible form rather than fifteen
         chained prompts with no way to go back and correct an earlier answer.
         Every control here is built from the field description the server sent,
         so this file never names a single resource. */

      function admDateValue(value) {
        if (!value) return '';
        const at = new Date(value);
        if (isNaN(at.getTime())) return String(value);
        const pad = n => String(n).padStart(2, '0');
        return at.getFullYear() + '-' + pad(at.getMonth() + 1) + '-' + pad(at.getDate());
      }

      /* One row of the form. Labels and names come from our own schema, never
         from stored content, so building the shell as markup is safe; values are
         assigned through .value afterwards so nothing user-written is parsed. */
      function admFieldRow(field) {
        const id = 'f-' + field.name;
        const hint = field.hint ? '<div class="adm-hint">' + esc(field.hint) + '</div>' : '';
        const required = field.optional ? '' : ' <span class="adm-req">*</span>';
        let control;
        if (field.type === 'text') {
          control = '<textarea class="field adm-area" data-f="' + id + '"></textarea>';
        } else if (field.type === 'list') {
          control = '<textarea class="field adm-area" data-f="' + id + '"></textarea>';
        } else if (field.type === 'bool') {
          control = '<select class="field" data-f="' + id + '"><option value="yes">yes</option><option value="no">no</option></select>';
        } else if (field.type === 'enum') {
          const options = (field.options || []).map(o => '<option value="' + esc(o) + '">' + esc(o) + '</option>').join('');
          control = '<select class="field" data-f="' + id + '">' + options + '</select>';
        } else {
          control = '<input class="field" data-f="' + id + '" spellcheck="false">';
        }
        return '<div class="adm-row"><label>' + esc(field.label) + required + '</label>' +
          '<div class="adm-control">' + control + hint + '</div></div>';
      }

      const admHasValue = value => value !== undefined && value !== null && value !== '' &&
        !(Array.isArray(value) && !value.length);

      /* An optional section (ResourceSpec.groups): a button until it is asked
         for, then its fields under a heading with a Cancel that closes it. The
         label says Edit rather than Add when the record already has some of it. */
      function admGroupBlock(group, fields, row) {
        const filled = !!row && fields.some(field => admHasValue(row[field.name]));
        return '<div class="adm-group" data-group="' + esc(group.id) + '">' +
          '<div class="adm-group-bar"><button class="btn" type="button" data-a="group-open">' +
          esc((filled ? 'Edit ' : 'Add ') + group.label.toLowerCase()) + '…</button>' +
          (group.hint ? '<span class="adm-hint">' + esc(group.hint) + '</span>' : '') + '</div>' +
          '<div class="adm-group-body" hidden><div class="adm-group-head"><b>' + esc(group.label) + '</b>' +
          '<button class="btn sm" type="button" data-a="group-cancel">Cancel</button></div>' +
          fields.map(admFieldRow).join('') + '</div></div>';
      }

      /* Cancel puts back what was stored (or nothing, on a new record), and a
         closed section is left out of the save entirely — so closing it never
         changes the record. */
      function admWireGroups(body, spec, row) {
        body.querySelectorAll('.adm-group').forEach(block => {
          const bar = block.querySelector('.adm-group-bar');
          const inner = block.querySelector('.adm-group-body');
          const fields = spec.fields.filter(field => field.group === block.dataset.group);
          bar.querySelector('[data-a="group-open"]').addEventListener('click', () => {
            bar.hidden = true;
            inner.hidden = false;
            const first = inner.querySelector('.field');
            if (first) first.focus();
          });
          inner.querySelector('[data-a="group-cancel"]').addEventListener('click', () => {
            admFill(body, fields, row);
            inner.querySelectorAll('.adm-row.bad').forEach(r => r.classList.remove('bad'));
            inner.hidden = true;
            bar.hidden = false;
            bar.querySelector('button').focus();
          });
        });
      }

      function admOpenFields(body, spec) {
        const closed = new Set([...body.querySelectorAll('.adm-group')]
          .filter(block => block.querySelector('.adm-group-body').hidden)
          .map(block => block.dataset.group));
        return spec.fields.filter(field => !closed.has(field.group));
      }

      function admReadControl(body, field) {
        return body.querySelector('[data-f="f-' + field.name + '"]');
      }

      function admFill(body, fields, row) {
        fields.forEach(field => {
          const el = admReadControl(body, field);
          if (!el) return;
          const value = row ? row[field.name] : undefined;
          if (field.type === 'list') {
            el.value = Array.isArray(value) ? value.join('\n') : '';
          } else if (field.type === 'bool') {
            const on = value === undefined || value === null ? field.fallback !== false : !!value;
            el.value = on ? 'yes' : 'no';
          } else if (field.type === 'enum') {
            el.value = value !== undefined && value !== null && value !== ''
              ? String(value)
              : (field.fallback !== undefined ? String(field.fallback) : (field.options || [''])[0]);
          } else if (field.type === 'date') {
            el.value = admDateValue(value);
          } else if (value === undefined || value === null) {
            el.value = row || field.fallback === undefined ? '' : String(field.fallback);
          } else {
            el.value = String(value);
          }
        });
      }

      function admCollect(body, fields) {
        const values = {};
        fields.forEach(field => {
          const el = admReadControl(body, field);
          if (!el) return;
          if (field.type === 'list') {
            values[field.name] = el.value.split('\n').map(l => l.trim()).filter(l => l.length);
          } else {
            values[field.name] = el.value;
          }
        });
        return values;
      }

      /* Highlights the offending control and puts the reason beside it, so a
         rejected save does not send the user back to the terminal to find out
         what went wrong. */
      function admShowError(body, result) {
        [...body.querySelectorAll('.adm-row')].forEach(r => r.classList.remove('bad'));
        const note = body.querySelector('.adm-error');
        note.textContent = result.field ? result.error : adminCrudProblem(result);
        note.hidden = false;
        if (result.field) {
          const el = body.querySelector('[data-f="f-' + result.field + '"]');
          if (el) {
            const row = el.closest('.adm-row');
            if (row) row.classList.add('bad');
            el.focus();
          }
        }
      }

      /* --- create / edit ------------------------------------------------ */

      async function adminOpenForm(term, resource, key, options) {
        const opts = options || {};
        const spec = await adminSpec(term, resource, opts.requestHooks);
        if (!spec) return;
        if (spec.readOnly) {
          term.print(spec.label + ' cannot be authored here — these arrive from the site.', 'err');
          return;
        }

        let row = null;
        if (key) {
          const run = (crud, token) => crud.get(token, resource, key);
          const found = opts.requestHooks
            ? await adminCrudWindowCall(term, 'Loading entry', run, opts.requestHooks)
            : await adminCrudCall(term, 'Loading entry', run);
          if (!found) return;
          row = found.row;
        }

        const editing = !!row;
        const title = (editing ? 'Edit ' : 'New ') + spec.label.toLowerCase();
        WM.create({
          id: 'adm-form-' + resource + '-' + (editing ? row.id : 'new'),
          title: title, icon: svg('txt', 14), w: 560, h: 440,
          build(body, api) {
            body.className = 'win-body app-adm';
            const groups = spec.groups || [];
            const grouped = field => groups.some(group => group.id === field.group);
            body.innerHTML =
              '<div class="adm-head">' + esc(spec.label) + (editing ? ' — ' + esc(adminHandle(row)) : '') + '</div>' +
              '<div class="adm-form">' + spec.fields.filter(field => !grouped(field)).map(admFieldRow).join('') +
              groups.map(group => admGroupBlock(group, spec.fields.filter(field => field.group === group.id), row)).join('') +
              '</div>' +
              '<div class="adm-error" hidden></div>' +
              '<div class="adm-actions"><button class="btn" data-a="save">Save</button>' +
              '<button class="btn" data-a="cancel">Cancel</button></div>';
            admFill(body, spec.fields, row);
            admWireGroups(body, spec, row);

            let saving = false;
            const saveButton = body.querySelector('[data-a="save"]');
            const cancelButton = body.querySelector('[data-a="cancel"]');
            const save = async () => {
              if (saving) return;
              body.querySelector('.adm-error').hidden = true;
              const values = admCollect(body, admOpenFields(body, spec));
              const result = await adminCrudWindowCall(term, 'Saving', (crud, token) =>
                editing
                  ? crud.update(token, resource, row.id, values)
                  : crud.create(token, resource, values), {
                busy(active) {
                  saving = active;
                  saveButton.disabled = active;
                  cancelButton.disabled = active;
                  saveButton.textContent = active ? 'Saving...' : 'Save';
                },
                error(problem) {
                  admShowError(body, problem);
                  beep(300, 140);
                }
              });
              if (!result) return;
              beep(880, 90);
              api.close();
              adminRefreshContent();
              if (opts.onSaved) {
                opts.onSaved(result.row, editing);
              } else if (term && term.alive) {
                term.print((editing ? 'Updated ' : 'Created ') + adminHandle(result.row) + ' in ' + resource + '.', 'ok');
                adminCrudList(term, resource, editing && adminLastList ? adminLastList.page : 1);
              }
            };

            body.querySelector('[data-a="save"]').addEventListener('click', save);
            body.querySelector('[data-a="cancel"]').addEventListener('click', () => api.close());
            setTimeout(() => {
              const first = body.querySelector('.adm-form .field');
              if (first) first.focus();
            }, 60);
          }
        });
      }

      /* --- read in a window --------------------------------------------- */

      async function adminOpenRecord(term, resource, key, options) {
        const opts = options || {};
        const run = (crud, token) => crud.get(token, resource, key);
        const found = opts.requestHooks
          ? await adminCrudWindowCall(term, 'Loading entry', run, opts.requestHooks)
          : await adminCrudCall(term, 'Loading entry', run);
        if (!found) return;

        const row = found.row;
        const fields = (found.fields && found.fields.length)
          ? found.fields.map(f => ({ name: f.name, label: f.label }))
          : Object.keys(row).filter(k => k !== 'id').map(k => ({ name: k, label: k }));

        let html = '';
        fields.forEach(field => {
          const value = row[field.name];
          if (value === null || value === undefined || value === '') return;
          let rendered;
          if (Array.isArray(value)) {
            if (!value.length) return;
            rendered = '<ul class="adm-notes">' + value.map(v => '<li>' + esc(v) + '</li>').join('') + '</ul>';
          } else if (typeof value === 'boolean') {
            rendered = esc(value ? 'yes' : 'no');
          } else if (field.name === 'createdAt' || field.name === 'updatedAt' || field.name === 'readAt') {
            rendered = esc(adminShortDate(value));
          } else {
            rendered = esc(String(value));
          }
          html += '<div class="adm-view-row"><div class="adm-view-k">' + esc(field.label) + '</div>' +
            '<div class="adm-view-v">' + rendered + '</div></div>';
        });

        const windowId = 'adm-view-' + resource + '-' + row.id;
        if (WM.wins.has(windowId)) WM.close(windowId);
        WM.create({
          id: windowId, title: found.label + ' — ' + adminHandle(row),
          icon: svg('txt', 14), w: 520, h: 400,
          build(body) {
            body.className = 'win-body app-adm';
            body.innerHTML = '<div class="adm-head">' + esc(adminHandle(row)) + '</div>' +
              '<div class="adm-view">' + (html || '<div class="adm-view-row">Nothing stored.</div>') + '</div>' +
              '<div class="adm-id">id: ' + esc(String(row.id)) + '</div>';
          }
        });
      }

      /* --- delete -------------------------------------------------------- */

      function adminConfirmDelete(term, resource, row, label, options) {
        const opts = options || {};
        const handle = adminHandle(row);
        const dialog = dialogBox({
          id: 'adm-delete-' + resource + '-' + row.id,
          title: 'Confirm delete', icon: svg('warn', 32), w: 420,
          msg: 'Delete <b>' + esc(handle) + '</b> from ' + esc(label) +
            '?<br><br>This action cannot be undone.' +
            '<div class="adm-delete-error" hidden></div>',
          buttons: [
            { t: 'Cancel' },
            {
              t: 'Delete', keep: true, act: async api => {
                const buttons = [...api.el.querySelectorAll('.dlg-btns .btn')];
                const error = api.el.querySelector('.adm-delete-error');
                const result = await adminCrudWindowCall(term, 'Deleting',
                  (crud, token) => crud.remove(token, resource, row.id), {
                    busy(active) {
                      buttons.forEach(button => { button.disabled = active; });
                    },
                    error(problem) {
                      error.textContent = adminCrudProblem(problem);
                      error.hidden = false;
                      beep(300, 140);
                    }
                  });
                if (!result) return;
                api.close();
                beep(880, 90);
                adminRefreshContent();
                if (opts.onDeleted) {
                  opts.onDeleted(result.row);
                } else if (term && term.alive) {
                  term.print('Deleted ' + handle + ' from ' + resource + '.', 'ok');
                  adminCrudList(term, resource, adminLastList ? adminLastList.page : 1);
                }
              }
            }
          ]
        });
        setTimeout(() => {
          const cancel = dialog.el.querySelector('.dlg-btns .btn');
          if (cancel) cancel.focus();
        }, 60);
      }
